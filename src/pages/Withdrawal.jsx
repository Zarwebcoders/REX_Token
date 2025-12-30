"use client"

import { useState, useEffect } from "react"
import client from "../api/client"
import WithdrawalForm from "../components/WithdrawalForm"

export default function Withdrawal() {
    const [userData, setUserData] = useState({
        name: "",
        monthlyROI: 0,
        levelIncomeROI: 0,
        normalWithdrawal: 0,
        sosWithdrawal: 0,
        totalWithdrawal: 0,
        totalIncome: 0,
        stakeROI: 0,
        stakeToken: 0
    })
    const [withdrawalHistory, setWithdrawalHistory] = useState([])
    const [withdrawalStats, setWithdrawalStats] = useState({
        totalWithdrawn: 0,
        pendingWithdrawals: 0
    })
    const [kycData, setKycData] = useState(null)
    const [loading, setLoading] = useState(true)

    const [walletAddress, setWalletAddress] = useState('');
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    // Connect wallet function
    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setIsWalletConnected(true);
                localStorage.setItem('connectedWallet', accounts[0]);
            } else {
                alert('Please install MetaMask to use this feature!');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet');
        }
    };

    useEffect(() => {
        // Check if wallet was previously connected
        const savedWallet = localStorage.getItem('connectedWallet');
        if (savedWallet && typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0 && accounts[0] === savedWallet) {
                        setWalletAddress(savedWallet);
                        setIsWalletConnected(true);
                    }
                });
        }

        // Listen for account changes
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsWalletConnected(true);
                    localStorage.setItem('connectedWallet', accounts[0]);
                } else {
                    setWalletAddress('');
                    setIsWalletConnected(false);
                    localStorage.removeItem('connectedWallet');
                }
            });
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!isWalletConnected || !walletAddress) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user info and transactions from database (for name and history only)
                const [userRes, txRes, kycRes] = await Promise.all([
                    client.get('/auth/me'),
                    client.get('/transactions'),
                    client.get('/kyc/me').catch(() => ({ data: null }))
                ]);

                const user = userRes.data;

                // Fetch ALL data from smart contract using connected wallet
                const { getDashboardData } = await import('../utils/contractUtils');
                const contractData = await getDashboardData(walletAddress);

                // Extract data from contract
                const {
                    tokenBalance,
                    investmentInfo,
                    referralInfo,
                    stakeInfo
                } = contractData;

                // Calculate values from contract data
                const totalTokensReceived = parseFloat(investmentInfo.totalTokensReceived) || 0;
                const stakedTokens = parseFloat(stakeInfo.stakedAmount) || 0;
                const currentBalance = parseFloat(investmentInfo.currentBalance) || 0;
                const pendingROI = parseFloat(investmentInfo.pendingROI) || 0;
                const stakePendingROI = parseFloat(stakeInfo.pendingROI) || 0;
                const referralEarnings = parseFloat(referralInfo.referralEarnings) || 0;

                // SOS Withdrawal = Total Investment Tokens (not unstaked tokens)
                const sosWithdrawal = totalTokensReceived;

                // Total Income = Level Income (Referral Earnings) + All ROI Income
                const totalIncome = referralEarnings + stakePendingROI + pendingROI;

                setUserData({
                    name: user.name,
                    monthlyROI: pendingROI, // Pending ROI from investments
                    levelIncomeROI: referralEarnings, // Referral earnings from contract
                    normalWithdrawal: currentBalance, // Current available balance
                    sosWithdrawal: sosWithdrawal > 0 ? sosWithdrawal : 0, // Total investment tokens
                    totalWithdrawal: 0, // Will be calculated from withdrawal history
                    totalIncome: totalIncome, // Level Income + All ROI
                    stakeROI: stakePendingROI, // Pending stake ROI
                    stakeToken: stakedTokens // Staked tokens
                });

                // Filter withdrawals from transactions
                const withdrawals = txRes.data
                    .filter(tx => tx.type === 'withdrawal')
                    .map(tx => ({
                        id: tx._id,
                        amount: tx.amount,
                        date: new Date(tx.createdAt).toISOString().split('T')[0],
                        status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
                        method: tx.description.includes("Bank") ? "Bank Transfer" : "Crypto Wallet",
                        source: "Main Balance"
                    }));
                setWithdrawalHistory(withdrawals);

                // Calculate withdrawal statistics
                const completedWithdrawals = txRes.data.filter(
                    tx => tx.type === 'withdrawal' && tx.status === 'completed'
                );
                const pendingWithdrawals = txRes.data.filter(
                    tx => tx.type === 'withdrawal' && tx.status === 'pending'
                );

                const totalWithdrawn = completedWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);
                const pendingAmount = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

                setWithdrawalStats({
                    totalWithdrawn,
                    pendingWithdrawals: pendingAmount
                });

                setKycData(kycRes.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isWalletConnected, walletAddress]);

    const handleWithdraw = async (data) => {
        if (!isWalletConnected || !walletAddress) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            // Step 1: Call smart contract function
            console.log('Step 1: Calling smart contract...');
            const { normalWithdraw, sosWithdraw } = await import('../utils/contractUtils');

            let contractResult;
            if (data.source === 'Total Income') {
                // Call normalWithdraw for Total Income
                contractResult = await normalWithdraw(data.amount);
            } else {
                // Call sosWithdraw for SOS Withdrawal
                contractResult = await sosWithdraw(data.amount);
            }

            // Check if contract transaction was successful
            if (!contractResult.success) {
                alert(`Withdrawal failed: ${contractResult.error}`);
                return;
            }

            console.log('✅ Contract transaction successful:', contractResult.txHash);

            // Step 2: Save to database only if blockchain transaction succeeded
            console.log('Step 2: Saving to database...');
            await client.post('/transactions', {
                type: 'withdrawal',
                amount: data.amount,
                description: `Withdrawal via ${data.method} from ${data.source}`,
                bankDetails: data.bankDetails,
                hash: contractResult.txHash, // Store blockchain transaction hash
                status: 'completed' // Mark as completed since blockchain confirmed
            });

            alert(`Withdrawal successful! Transaction Hash: ${contractResult.txHash.substring(0, 10)}...`);

            // Refresh history and stats
            const { data: txData } = await client.get('/transactions');
            const withdrawals = txData
                .filter(tx => tx.type === 'withdrawal')
                .map(tx => ({
                    id: tx._id,
                    amount: tx.amount,
                    date: new Date(tx.createdAt).toISOString().split('T')[0],
                    status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
                    method: tx.description.includes("Bank") ? "Bank Transfer" : "Crypto Wallet",
                    source: "Main Balance"
                }));
            setWithdrawalHistory(withdrawals);

            // Recalculate stats
            const completedWithdrawals = txData.filter(
                tx => tx.type === 'withdrawal' && tx.status === 'completed'
            );
            const pendingWithdrawals = txData.filter(
                tx => tx.type === 'withdrawal' && tx.status === 'pending'
            );

            setWithdrawalStats({
                totalWithdrawn: completedWithdrawals.reduce((sum, tx) => sum + tx.amount, 0),
                pendingWithdrawals: pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0)
            });

            // Refresh contract data
            const { getDashboardData } = await import('../utils/contractUtils');
            const contractData = await getDashboardData(walletAddress);

            const {
                investmentInfo,
                referralInfo,
                stakeInfo
            } = contractData;

            const totalTokensReceived = parseFloat(investmentInfo.totalTokensReceived) || 0;
            const stakedTokens = parseFloat(stakeInfo.stakedAmount) || 0;
            const currentBalance = parseFloat(investmentInfo.currentBalance) || 0;
            const pendingROI = parseFloat(investmentInfo.pendingROI) || 0;
            const stakePendingROI = parseFloat(stakeInfo.pendingROI) || 0;
            const referralEarnings = parseFloat(referralInfo.referralEarnings) || 0;

            const sosWithdrawal = totalTokensReceived;
            const totalIncome = referralEarnings + stakePendingROI + pendingROI;

            setUserData(prev => ({
                ...prev,
                monthlyROI: pendingROI,
                levelIncomeROI: referralEarnings,
                normalWithdrawal: currentBalance,
                sosWithdrawal: sosWithdrawal > 0 ? sosWithdrawal : 0,
                totalIncome: totalIncome,
                stakeROI: stakePendingROI,
                stakeToken: stakedTokens
            }));

        } catch (error) {
            console.error("Error submitting withdrawal:", error);
            alert(`Failed to submit withdrawal: ${error.message || 'Unknown error'}`);
        }
    }

    return (
        <div className="w-full space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="space-y-3 md:space-y-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Withdrawal Center</h2>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <p className="text-[#b0b0b0] text-sm md:text-lg flex-1">
                        Welcome, <span className="text-[#9131e7] font-bold">{userData.name}!</span> Manage your earnings and withdraw funds securely from your available wallets.
                    </p>
                    <div className="flex items-center gap-3">
                        {isWalletConnected ? (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 md:px-4 py-2 rounded-lg">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-xs md:text-sm font-semibold font-mono">
                                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="flex items-center gap-2 bg-[#9131e7] hover:bg-[#7a27c9] px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all font-semibold text-white text-sm md:text-base"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Wallet Not Connected Message */}
            {!isWalletConnected && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 md:p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-yellow-500 font-bold text-lg mb-1">Wallet Not Connected</h3>
                            <p className="text-gray-300 text-sm">Please connect your MetaMask wallet to view your withdrawal balances and transaction data from the blockchain.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Wallet Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Monthly ROI Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#9131e7]/30 hover:border-[#9131e7] transition-all group hover:shadow-lg hover:shadow-[#9131e7]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Monthly ROI</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Return on Investment</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#9131e7]/20 group-hover:bg-[#9131e7]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#9131e7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">REX {userData.monthlyROI.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#9131e7] to-[#e84495] h-1.5 md:h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                </div>

                {/* Level Income ROI Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#00b894]/30 hover:border-[#00b894] transition-all group hover:shadow-lg hover:shadow-[#00b894]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Level Income ROI</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Level Earnings</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#00b894]/20 group-hover:bg-[#00b894]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#00b894]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">₹{userData.levelIncomeROI.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#00b894] to-[#00cec9] h-1.5 md:h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                </div>

                {/* Normal Withdrawal Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#0984e3]/30 hover:border-[#0984e3] transition-all group hover:shadow-lg hover:shadow-[#0984e3]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Normal Withdrawal</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Available Balance</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#0984e3]/20 group-hover:bg-[#0984e3]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#0984e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">REX {userData.normalWithdrawal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#0984e3] to-[#74b9ff] h-1.5 md:h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                </div>

                {/* SOS Withdrawal Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#fd79a8]/30 hover:border-[#fd79a8] transition-all group hover:shadow-lg hover:shadow-[#fd79a8]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">SOS Withdrawal</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Emergency Fund</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#fd79a8]/20 group-hover:bg-[#fd79a8]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#fd79a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">REX {userData.sosWithdrawal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#fd79a8] to-[#e17055] h-1.5 md:h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                </div>

                {/* Total Withdrawal Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#a29bfe]/30 hover:border-[#a29bfe] transition-all group hover:shadow-lg hover:shadow-[#a29bfe]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Total Withdrawal</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Lifetime Withdrawn</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#a29bfe]/20 group-hover:bg-[#a29bfe]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#a29bfe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">₹{userData.totalWithdrawal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#a29bfe] to-[#6c5ce7] h-1.5 md:h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                </div>

                {/* Total Income Card (renamed from REX Token) */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#ffeaa7]/30 hover:border-[#ffeaa7] transition-all group hover:shadow-lg hover:shadow-[#ffeaa7]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Total Income</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Total Earnings</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#ffeaa7]/20 group-hover:bg-[#ffeaa7]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#fdcb6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">REX {userData.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#ffeaa7] to-[#fdcb6e] h-1.5 md:h-2 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                </div>

                {/* Stake ROI Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#55efc4]/30 hover:border-[#55efc4] transition-all group hover:shadow-lg hover:shadow-[#55efc4]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Stake ROI</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Staking Returns</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#55efc4]/20 group-hover:bg-[#55efc4]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#55efc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">REX {userData.stakeROI.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#55efc4] to-[#00b894] h-1.5 md:h-2 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                </div>

                {/* Stake Token Card */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#fab1a0]/30 hover:border-[#fab1a0] transition-all group hover:shadow-lg hover:shadow-[#fab1a0]/20">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Stake Token</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Staked Balance</p>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-[#fab1a0]/20 group-hover:bg-[#fab1a0]/30 transition-all">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#fab1a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-2xl md:text-3xl font-bold text-white">REX {userData.stakeToken.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#444]/50 rounded-full h-1.5 md:h-2">
                        <div className="bg-gradient-to-r from-[#fab1a0] to-[#ff7675] h-1.5 md:h-2 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Withdrawal Form Section */}
                <div className="lg:col-span-1">
                    <WithdrawalForm
                        onSubmit={handleWithdraw}
                        userData={userData}
                        kycData={kycData}
                    />
                </div>

                {/* Withdrawal History Section */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] rounded-xl border border-[#9131e7]/30 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-[#9131e7]/30 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10">
                            <h3 className="text-xl md:text-2xl font-bold text-white">Withdrawal History</h3>
                            <p className="text-gray-400 text-sm md:text-base">Track all your withdrawal requests</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr className="border-b border-[#9131e7]/30">
                                        <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Source</th>
                                        <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Amount</th>
                                        <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Date</th>
                                        <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Method</th>
                                        <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Status</th>
                                        <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawalHistory.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[#444]/30 hover:bg-[#9131e7]/10 transition-colors group"
                                        >
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${item.source === "Loyalty Points" ? "bg-[#9131e7]/20" : item.source === "REX Token" ? "bg-[#00b894]/20" : "bg-[#fd79a8]/20"}`}>
                                                        <span className={`font-bold text-sm md:text-base ${item.source === "Loyalty Points" ? "text-[#9131e7]" : item.source === "REX Token" ? "text-[#00b894]" : "text-[#fd79a8]"}`}>
                                                            {item.source.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="text-white font-medium text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{item.source}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <span className="text-lg md:text-xl font-bold text-white">₹{item.amount}</span>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6 text-[#b0b0b0] text-xs md:text-sm">{item.date}</td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    <div className={`p-1 rounded ${item.method === "Bank Transfer" ? "bg-blue-500/20" : "bg-yellow-500/20"}`}>
                                                        {item.method === "Bank Transfer" ? (
                                                            <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="text-white text-xs md:text-sm truncate max-w-[60px] md:max-w-none">{item.method}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <span className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${item.status === "Completed"
                                                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                                    : item.status === "Pending"
                                                        ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                                                        : "bg-red-600/20 text-red-400 border border-red-600/30"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <button className="px-2 md:px-3 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded-lg hover:bg-[#9131e7]/30 transition-colors text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {withdrawalHistory.length === 0 && (
                            <div className="p-6 md:p-12 text-center">
                                <div className="inline-block p-3 md:p-4 rounded-full bg-gradient-to-br from-[#9131e7]/10 to-[#e84495]/10 mb-3 md:mb-4">
                                    <svg className="w-12 h-12 md:w-16 md:h-16 text-[#9131e7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Withdrawal History</h3>
                                <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">Your withdrawal requests will appear here</p>
                            </div>
                        )}

                        {/* Table Footer */}
                        <div className="p-3 md:p-4 bg-[#0f0f1a] border-t border-[#9131e7]/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="text-gray-400 text-xs md:text-sm">
                                Showing {withdrawalHistory.length} withdrawals
                            </div>
                            <div className="flex gap-1 md:gap-2">
                                <button className="px-2 md:px-3 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded-lg hover:bg-[#9131e7]/30 transition-colors text-xs md:text-sm">
                                    Previous
                                </button>
                                <button className="px-2 md:px-3 py-1 bg-[#9131e7] text-white rounded-lg hover:bg-[#7a27c9] transition-colors text-xs md:text-sm">
                                    1
                                </button>
                                <button className="px-2 md:px-3 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded-lg hover:bg-[#9131e7]/30 transition-colors text-xs md:text-sm">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#9131e7]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-bold text-base md:text-lg">Total Withdrawn</h4>
                            <p className="text-gray-400 text-xs md:text-sm">All Time</p>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-[#9131e7]">₹{withdrawalStats.totalWithdrawn.toLocaleString()}</div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#00b894]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-bold text-base md:text-lg">Pending Withdrawals</h4>
                            <p className="text-gray-400 text-xs md:text-sm">Awaiting Processing</p>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-[#00b894]">₹{withdrawalStats.pendingWithdrawals.toLocaleString()}</div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] p-4 md:p-6 rounded-xl border border-[#0984e3]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-bold text-base md:text-lg">Withdrawal Fee</h4>
                            <p className="text-gray-400 text-xs md:text-sm">Standard Charge</p>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-[#0984e3]">5%</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
