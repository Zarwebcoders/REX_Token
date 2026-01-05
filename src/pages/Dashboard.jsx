"use client"

import { useState, useEffect } from "react"
import client from "../api/client"
import WalletCard from "../components/WalletCard"
import StatsCard from "../components/StatsCard"
import { UsersIcon, CheckCircleIcon, CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/solid';
import { getDashboardData, claimROI, claimStakeROI } from "../utils/contractUtils"

export default function Dashboard() {
    const [walletBalance, setWalletBalance] = useState(0)
    const [userName, setUserName] = useState("")
    const [loading, setLoading] = useState(true)
    const [walletAddress, setWalletAddress] = useState("")
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [web3Provider, setWeb3Provider] = useState(null)
    const [loadingBlockchainData, setLoadingBlockchainData] = useState(false)
    const [claimingROI, setClaimingROI] = useState(false)
    const [userReferralCode, setUserReferralCode] = useState("")

    const [tokenStats, setTokenStats] = useState({
        loyaltyToken: 0,
        rexToken: 0,
        stakedTokens: 0,
        rexRate: 2.5,
        currentPhase: "Phase 3",
        shoppingPoint: 0,
    })

    const [incomeBreakdown, setIncomeBreakdown] = useState({
        miningBonus: 0,
        dailyMiningRewards: 0,
        yearlyBonus: 0,
        sponsorIncome: 0,
        levelIncome: 0,
        totalIncome: 0,
    })

    const [miningCenter, setMiningCenter] = useState({
        status: "Active",
        miningPower: "0 TH/s",
        uptime: "99.8%",
        earningsToday: 0,
    })

    const [referralProgram, setReferralProgram] = useState({
        referralId: "---",
        sponsor: "None",
        totalDirectTeam: 0,
        levelIncomeEarned: 0,
        sponsorIncomeEarned: 0,
        totalEarnedIncome: 0,
    })

    const [phaseInfo, setPhaseInfo] = useState({
        phaseNumber: 3,
        phaseRate: "4.8",
        tokensSold: "1.2M/2M",
        endDate: "Dec 31, 2024"
    })

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user data and downline in parallel
                const [userRes, downlineRes] = await Promise.all([
                    client.get('/auth/me'),
                    client.get('/users/downline')
                ]);

                const userData = userRes.data;
                const downlineData = downlineRes.data || [];

                setWalletBalance(userData.balance || 0);
                setUserName(userData.name || "User");
                setUserReferralCode(userData.referralCode || "");

                // Set wallet address from database if user has connected before
                if (userData.wallet && userData.wallet !== '0x0000000000000000000000000000000000000000') {
                    setWalletAddress(userData.wallet);
                    setIsWalletConnected(true);
                }

                setTokenStats(prev => ({
                    ...prev,
                    loyaltyToken: userData.loyaltyPoints || 0,
                    rexToken: userData.rexToken || 0,
                    shoppingPoint: userData.shoppingPoints || 0,
                }));

                // Calculate direct team size (Level 0 in downline response)
                const directTeamCount = downlineData.filter(u => u.level === 0).length;

                setReferralProgram(prev => ({
                    ...prev,
                    referralId: userData.referralCode || "---",
                    sponsor: userData.referredBy ? userData.referredBy.name : "None",
                    totalDirectTeam: directTeamCount,
                    // Keeping other stats mock or 0 for now as they require Income logic
                }));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        // checkWalletConnection(); // Disabled auto-connect to prevent wrong wallet association
    }, []);

    // Fetch blockchain data when wallet is connected
    useEffect(() => {
        if (isWalletConnected && walletAddress) {
            fetchBlockchainData(walletAddress);
        }
    }, [isWalletConnected, walletAddress]);

    // Fetch blockchain data from smart contract
    const fetchBlockchainData = async (address) => {
        if (!address) return;

        setLoadingBlockchainData(true);
        try {
            const data = await getDashboardData(address);

            // Update token stats
            setTokenStats(prev => ({
                ...prev,
                rexToken: parseFloat(data.tokenBalance).toFixed(2),
                rexRate: parseFloat(data.currentPrice).toFixed(2),
                currentPhase: `Phase ${data.currentPhase}`,
                stakedTokens: parseFloat(data.stakeInfo.stakedAmount).toFixed(2)
            }));

            // Update income breakdown
            // Calculate total income in tokens
            const totalIncomeTokens =
                parseFloat(data.investmentInfo.pendingROI) +
                parseFloat(data.stakeInfo.pendingROI) +
                parseFloat(data.referralInfo.referralEarnings);

            // Convert to INR
            const tokenPrice = parseFloat(data.currentPrice);
            const totalIncomeINR = totalIncomeTokens * tokenPrice;
            const pendingROIINR = parseFloat(data.investmentInfo.pendingROI) * tokenPrice;
            const stakeROIINR = parseFloat(data.stakeInfo.pendingROI) * tokenPrice;
            const referralEarningsINR = parseFloat(data.referralInfo.referralEarnings) * tokenPrice;
            const totalInvestedINR = parseFloat(data.investmentInfo.totalInvestedINR);

            // Calculate ROI percentage (monthly)
            let roiPercentage = "0%";
            if (totalInvestedINR > 0) {
                const investmentThreshold = 100000; // 1 lakh INR
                roiPercentage = totalInvestedINR < investmentThreshold ? "1%" : "1.5%";
            }

            setIncomeBreakdown(prev => ({
                ...prev,
                miningBonus: pendingROIINR,
                dailyMiningRewards: stakeROIINR,
                sponsorIncome: referralEarningsINR,
                totalIncome: totalIncomeINR
            }));

            // Update mining center
            setMiningCenter(prev => ({
                ...prev,
                status: data.investmentInfo.totalTokensReceived !== "0" ? "Active" : "Inactive",
                miningPower: roiPercentage, // Show ROI percentage
                earningsToday: totalIncomeINR
            }));

            // Update referral program
            setReferralProgram(prev => ({
                ...prev,
                referralId: address, // Show wallet address as referral ID
                sponsor: data.referralInfo.upline !== "0x0000000000000000000000000000000000000000"
                    ? `${data.referralInfo.upline.slice(0, 6)}...${data.referralInfo.upline.slice(-4)}`
                    : "None",
                totalDirectTeam: data.referralInfo.totalReferrals,
                levelIncomeEarned: referralEarningsINR,
                sponsorIncomeEarned: referralEarningsINR,
                totalEarnedIncome: referralEarningsINR
            }));

            // Update phase info
            setPhaseInfo(prev => ({
                ...prev,
                phaseNumber: data.currentPhase,
                phaseRate: parseFloat(data.currentPrice).toFixed(2)
            }));

            console.log("✅ Blockchain data loaded successfully:", {
                ...data,
                calculated: {
                    totalIncomeINR,
                    pendingROIINR,
                    stakeROIINR,
                    referralEarningsINR,
                    roiPercentage
                }
            });
        } catch (error) {
            console.error("❌ Error fetching blockchain data:", error);
        } finally {
            setLoadingBlockchainData(false);
        }
    };

    // Check if wallet is already connected
    const checkWalletConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsWalletConnected(true);
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        }
    };

    const connectWallet = async () => {
        // Check if wallet is already connected (prevent changing wallet)
        if (walletAddress && walletAddress !== '0x0000000000000000000000000000000000000000') {
            alert('⚠️ Wallet Already Connected!\n\nYou have already connected a wallet.\nFor security reasons, you cannot change your wallet address.\n\nConnected Wallet: ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4));
            return;
        }

        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to connect your wallet!\n\nVisit: https://metamask.io/download/');
            return;
        }

        try {
            console.log('🔄 Starting wallet connection process...');

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const account = accounts[0];
            console.log('✅ MetaMask account received:', account);

            setWalletAddress(account);
            setIsWalletConnected(true);

            // Save wallet address to database (FIRST TIME ONLY)
            try {
                console.log('📤 Sending wallet address to database...');
                console.log('Request payload:', { wallet: account });

                // Check if user is authenticated
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.token) {
                    console.error('❌ No authentication token found in localStorage');
                    alert('❌ Authentication Error\n\nYou are not logged in. Please login first and try again.');
                    setWalletAddress("");
                    setIsWalletConnected(false);
                    return;
                }
                console.log('✅ Authentication token found:', user.token.substring(0, 20) + '...');

                const response = await client.put('/auth/update-wallet', { wallet: account });
                console.log('✅ Database response:', response.data);
                console.log('✅ Wallet address saved to database (permanent)');
                alert('✅ Wallet Connected Successfully!\n\nAddress: ' + account.slice(0, 6) + '...' + account.slice(-4) + '\n\nThis wallet is now permanently linked to your account.');
            } catch (dbError) {
                console.error('❌ Error saving wallet to database:', dbError);
                console.error('Error details:', {
                    message: dbError.message,
                    response: dbError.response?.data,
                    status: dbError.response?.status,
                    statusText: dbError.response?.statusText
                });

                // Check if wallet already connected error
                if (dbError.response?.data?.message?.includes('already connected')) {
                    console.log('⚠️ Wallet already connected to account');
                    alert('⚠️ ' + dbError.response.data.message + '\n\nCurrent Wallet: ' + dbError.response.data.currentWallet);
                    // Set the existing wallet from database
                    setWalletAddress(dbError.response.data.currentWallet);
                    setIsWalletConnected(true);
                } else if (dbError.response?.status === 401) {
                    console.error('❌ Authentication failed - token may be invalid or expired');
                    alert('❌ Authentication Error\n\nYour session has expired. Please login again.');
                    setWalletAddress("");
                    setIsWalletConnected(false);
                    // Optionally redirect to login
                    // window.location.href = '/login';
                } else if (dbError.response?.status === 500) {
                    console.error('❌ Server error - database may be down');
                    alert('❌ Server Error\n\nFailed to save wallet to database. The server may be experiencing issues.\n\nError: ' + (dbError.response?.data?.message || 'Unknown server error'));
                    setWalletAddress("");
                    setIsWalletConnected(false);
                } else if (!dbError.response) {
                    console.error('❌ Network error - cannot reach server');
                    alert('❌ Network Error\n\nCannot connect to server. Please check:\n1. Is the backend server running?\n2. Is your internet connection working?\n\nError: ' + dbError.message);
                    setWalletAddress("");
                    setIsWalletConnected(false);
                } else {
                    console.error('❌ Unknown error occurred');
                    alert('❌ Failed to save wallet to database.\n\nError: ' + (dbError.response?.data?.message || dbError.message) + '\n\nPlease check the console for more details.');
                    setWalletAddress("");
                    setIsWalletConnected(false);
                }
                return;
            }

            // Check if connected to BSC network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const BSC_CHAIN_ID = '0x38'; // BSC Mainnet
            const BSC_TESTNET_CHAIN_ID = '0x61'; // BSC Testnet

            if (chainId !== BSC_CHAIN_ID && chainId !== BSC_TESTNET_CHAIN_ID) {
                // Prompt user to switch to BSC network
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: BSC_CHAIN_ID }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: BSC_CHAIN_ID,
                                    chainName: 'Binance Smart Chain',
                                    nativeCurrency: {
                                        name: 'BNB',
                                        symbol: 'BNB',
                                        decimals: 18
                                    },
                                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                                    blockExplorerUrls: ['https://bscscan.com/']
                                }],
                            });
                        } catch (addError) {
                            console.error('Error adding BSC network:', addError);
                            alert('Failed to add BSC network to MetaMask');
                        }
                    } else {
                        console.error('Error switching to BSC network:', switchError);
                    }
                }
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected wallet
                    setWalletAddress("");
                    setIsWalletConnected(false);
                } else {
                    setWalletAddress(accounts[0]);
                    // Update wallet in database when account changes
                    try {
                        await client.put('/auth/update-wallet', { wallet: accounts[0] });
                    } catch (error) {
                        console.error('Error updating wallet:', error);
                    }
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            alert(`Wallet connected successfully!\n\nAddress: ${account.slice(0, 6)}...${account.slice(-4)}\n\nYour wallet address has been saved to your profile.`);

        } catch (error) {
            console.error("Error connecting wallet:", error);
            if (error.code === 4001) {
                alert('Wallet connection rejected. Please try again.');
            } else {
                alert('Failed to connect wallet. Please try again.');
            }
        }
    };

    const disconnectWallet = () => {
        setWalletAddress("");
        setIsWalletConnected(false);
        alert('Wallet disconnected successfully!');
    };

    const handleClaimROI = async () => {
        // Check if wallet is connected
        if (!isWalletConnected || !walletAddress) {
            alert('Please connect your wallet first!');
            return;
        }

        // Confirm action
        const confirmed = window.confirm(
            'Are you sure you want to claim your ROI?\n\n' +
            'This will send a transaction to the blockchain.'
        );

        if (!confirmed) return;

        setClaimingROI(true);

        try {
            const result = await claimROI();

            if (result.success) {
                // Save transaction to DB
                try {
                    // Use pending ROI from state as the claimed amount (approximation suitable for UI record)
                    // Note: incomeBreakdown.miningBonus is in INR
                    await client.post('/transactions', {
                        type: 'claim_roi',
                        amount: incomeBreakdown.miningBonus,
                        currency: 'INR',
                        hash: result.txHash,
                        status: 'completed',
                        description: 'Claimed ROI'
                    });
                    console.log("ROI Claim saved to DB");
                } catch (dbError) {
                    console.error("Error saving claim to DB:", dbError);
                }

                alert(
                    `✅ ROI Claimed Successfully!\n\n` +
                    `Transaction Hash: ${result.txHash}\n\n` +
                    `Your ROI has been transferred to your wallet.`
                );

                // Refresh blockchain data
                await fetchBlockchainData(walletAddress);
            } else {
                alert(`❌ Claim Failed\n\n${result.error}`);
            }
        } catch (error) {
            console.error('Error claiming ROI:', error);
            alert(`❌ Error claiming ROI\n\n${error.message || 'Unknown error occurred'}`);
        } finally {
            setClaimingROI(false);
        }
    };

    const handleClaimStakeROI = async () => {
        // Check if wallet is connected
        if (!isWalletConnected || !walletAddress) {
            alert('Please connect your wallet first!');
            return;
        }

        // Confirm action
        const confirmed = window.confirm(
            'Are you sure you want to claim your Stake ROI?\n\n' +
            'This will send a transaction to the blockchain.'
        );

        if (!confirmed) return;

        setClaimingROI(true);

        try {
            const result = await claimStakeROI();

            if (result.success) {
                // Save transaction to DB
                try {
                    await client.post('/transactions', {
                        type: 'claim_stake_roi',
                        amount: incomeBreakdown.dailyMiningRewards,
                        currency: 'INR',
                        hash: result.txHash,
                        status: 'completed',
                        description: 'Claimed Stake ROI'
                    });
                    console.log("Stake ROI Claim saved to DB");
                } catch (dbError) {
                    console.error("Error saving stake claim to DB:", dbError);
                }

                alert(
                    `✅ Stake ROI Claimed Successfully!\n\n` +
                    `Transaction Hash: ${result.txHash}\n\n` +
                    `Your stake ROI has been transferred to your wallet.`
                );

                // Refresh blockchain data
                await fetchBlockchainData(walletAddress);
            } else {
                alert(`❌ Claim Failed\n\n${result.error}`);
            }
        } catch (error) {
            console.error('Error claiming stake ROI:', error);
            alert(`❌ Error claiming stake ROI\n\n${error.message || 'Unknown error occurred'}`);
        } finally {
            setClaimingROI(false);
        }
    };

    if (loading) return <div className="text-white">Loading dashboard...</div>

    return (
        <div className="w-full space-y-6 md:space-y-8">
            {/* Loading Blockchain Data Indicator */}
            {loadingBlockchainData && (
                <div className="bg-[#9131e7]/20 border border-[#9131e7]/40 rounded-lg p-3 text-center">
                    <p className="text-sm text-[#9131e7] font-semibold">
                        🔄 Loading blockchain data...
                    </p>
                </div>
            )}

            {/* Welcome Section */}
            <section className="bg-gradient-to-r from-[#9131e7]/20 to-[#e84495]/20 p-4 md:p-6 rounded-2xl border border-[#9131e7]/30">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            Welcome back, <span className="text-[#9131e7]">{userName}</span>!
                        </h2>
                        <p className="text-gray-300 text-sm md:text-lg mb-4">
                            Track your earnings, manage your tokens, and grow your network all in one place.
                        </p>
                        {!isWalletConnected ? (
                            <button
                                onClick={connectWallet}
                                className="px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 text-sm md:text-base w-full md:w-auto"
                            >
                                🔗 Connect Wallet
                            </button>
                        ) : (
                            <div className="space-y-4 w-full">
                                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                    <div className="px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg text-sm md:text-base flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        <span className="truncate">
                                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={disconnectWallet}
                                        className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-300 text-sm md:text-base"
                                    >
                                        Disconnect
                                    </button>
                                </div>

                                {/* Referral Link Section - Only show if wallet is connected and not zero address */}
                                {walletAddress && walletAddress !== '0x0000000000000000000000000000000000000000' ? (
                                    <div className="bg-[#1a1a2e] border border-[#9131e7]/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-bold text-[#9131e7]">🔗 Your Referral Link</h4>
                                            <button
                                                onClick={() => {
                                                    const referralLink = `${window.location.origin}/signup?ref=${walletAddress}`;
                                                    navigator.clipboard.writeText(referralLink);
                                                    alert('Referral link copied to clipboard!');
                                                }}
                                                className="px-3 py-1.5 bg-[#9131e7] hover:bg-[#7a27c9] text-white text-xs font-bold rounded-lg transition-all duration-200"
                                            >
                                                📋 Copy
                                            </button>
                                        </div>
                                        <div className="bg-[#0f0f1a] border border-gray-700/50 rounded-lg p-3 overflow-x-auto">
                                            <code className="text-xs md:text-sm text-gray-300 break-all">
                                                {window.location.origin}/signup?ref={walletAddress}
                                            </code>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                        <p className="text-yellow-300 text-sm">
                                            ⚠️ Please connect your wallet to get your referral link
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-full lg:w-1/3 mt-0">
                        <WalletCard balance={walletBalance} />
                    </div>
                </div>
            </section>

            {/* Token Stats Section */}
            <section className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">Token Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                    {/* <StatsCard title="Loyalty Points" amount={tokenStats.loyaltyToken.toString()} color="#9131e7" /> */}
                    <StatsCard title="REX Token" amount={tokenStats.rexToken.toString()} color="#4caf50" />
                    <StatsCard title="REX Rate" amount={`₹${tokenStats.rexRate}`} color="#ff9800" />
                    <StatsCard title="Current Phase" amount={tokenStats.currentPhase} color="#9c27b0" />
                </div>
            </section>

            {/* Income Breakdown and Mining Center Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Income Breakdown */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">Income Breakdown</h3>
                        <button className="px-4 py-2 bg-[#9131e7] hover:bg-[#7a27c9] text-white font-medium rounded-lg transition-colors duration-200 text-sm md:text-base w-full sm:w-auto">
                            Earnings Analytics
                        </button>
                    </div>
                    <div className="bg-[#1a1a2e] border border-[#9131e7]/30 rounded-2xl p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <StatsCard title="ROI" amount={`₹${incomeBreakdown.miningBonus.toFixed(2)}`} color="#9131e7" />
                            <StatsCard title="Yearly Bonus" amount={`₹${incomeBreakdown.yearlyBonus.toFixed(2)}`} color="#2196f3" />
                            <StatsCard title="Sponsor Income" amount={`₹${incomeBreakdown.sponsorIncome.toFixed(2)}`} color="#ff9800" />
                            {/* <StatsCard title="Level Income" amount={`₹${incomeBreakdown.levelIncome.toFixed(2)}`} color="#9c27b0" /> */}
                            <StatsCard title="Total Income" amount={`₹${incomeBreakdown.totalIncome.toFixed(2)}`} color="#e91e63" />
                        </div>
                    </div>
                </section>

                {/* Mining Center */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">Mining Center</h3>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleClaimStakeROI}
                                disabled={claimingROI || !isWalletConnected}
                                className={`px-4 py-2 ${claimingROI || !isWalletConnected
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-[#e91e63] hover:bg-[#c2185b]'
                                    } text-white font-medium rounded-lg transition-colors duration-200 text-sm md:text-base w-full sm:w-auto`}
                            >
                                🏦 Claim Stake ROI
                            </button>
                            <button
                                onClick={handleClaimROI}
                                disabled={claimingROI || !isWalletConnected}
                                className={`px-4 py-2 ${claimingROI || !isWalletConnected
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-[#9131e7] hover:bg-[#7a27c9]'
                                    } text-white font-medium rounded-lg transition-colors duration-200 text-sm md:text-base w-full sm:w-auto`}
                            >
                                {claimingROI ? '⏳ Claiming...' : '💰 Claim ROI'}
                            </button>
                        </div>
                    </div>
                    <div className="bg-[#1a1a2e] border border-[#9131e7]/30 rounded-2xl p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
                            <div className="flex-1">
                                <h4 className="text-lg md:text-xl font-bold text-white">
                                    Status: <span className="text-green-400">{miningCenter.status}</span>
                                </h4>
                                <p className="text-gray-400 text-sm md:text-base">Your mining operations are running smoothly</p>
                            </div>
                            <div className="px-3 py-2 md:px-4 md:py-2 bg-green-500/20 border border-green-500/50 rounded-lg w-full md:w-auto">
                                <span className="text-green-400 font-bold text-sm md:text-base">{miningCenter.uptime} Uptime</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Monthly Percentage</p>
                                <p className="text-xl md:text-2xl font-bold text-white">{miningCenter.miningPower}</p>
                            </div>
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Total Income</p>
                                <p className="text-xl md:text-2xl font-bold text-[#9131e7]">₹{miningCenter.earningsToday.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Current Phase and Referral Program Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Current Phase */}
                <section className="space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">Current Phase</h3>
                    <div className="bg-[#1a1a2e] border border-[#9131e7]/30 rounded-2xl p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                            <div>
                                <h4 className="text-xl md:text-2xl font-bold text-white">Phase {phaseInfo.phaseNumber}</h4>
                                <p className="text-gray-400 text-sm md:text-base">Current Token Sale Phase</p>
                            </div>
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm md:text-base">Phase Rate:</span>
                                <span className="text-lg md:text-xl font-bold text-[#9131e7]">{phaseInfo.phaseRate}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Referral Program */}
                <section className="space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">Referral Program</h3>
                    <div className="bg-[#1a1a2e] border border-[#9131e7]/30 rounded-2xl p-3 md:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-gray-400 text-xs md:text-sm">Your Referral ID</p>
                                    {isWalletConnected && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(referralProgram.referralId);
                                                alert('Referral ID copied!');
                                            }}
                                            className="text-[#9131e7] hover:text-[#7a27c9] text-xs"
                                        >
                                            📋
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm md:text-base font-mono font-bold text-white break-all">
                                    {referralProgram.referralId}
                                </p>
                            </div>
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Your Sponsor</p>
                                <p className="text-lg md:text-xl font-bold text-white truncate">{referralProgram.sponsor}</p>
                            </div>
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Total Direct Team</p>
                                <p className="text-xl md:text-2xl font-bold text-[#9131e7]">{referralProgram.totalDirectTeam}</p>
                            </div>
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Level Income Earned</p>
                                <p className="text-xl md:text-2xl font-bold text-[#4caf50]">₹{referralProgram.levelIncomeEarned.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Sponsor Income Earned</p>
                                <p className="text-xl md:text-2xl font-bold text-[#2196f3]">₹{referralProgram.sponsorIncomeEarned.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#0f0f1a] p-3 md:p-4 rounded-xl border border-[#9131e7]/20">
                                <p className="text-gray-400 text-xs md:text-sm">Total Earned Income</p>
                                <p className="text-xl md:text-2xl font-bold text-[#e91e63]">₹{referralProgram.totalEarnedIncome.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}