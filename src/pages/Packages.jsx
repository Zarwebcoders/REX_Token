"use client"

import { useState, useEffect } from "react"
import client from "../api/client"

export default function Packages() {
    const [packages, setPackages] = useState([])
    const [investments, setInvestments] = useState([])
    const [loading, setLoading] = useState(true)
    const [walletAddress, setWalletAddress] = useState("")
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [sponsorAddress, setSponsorAddress] = useState("")

    const [formData, setFormData] = useState({
        amount: "",
        transactionId: "",
        paymentSlip: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [packagesRes, investmentsRes, userRes] = await Promise.all([
                    client.get('/packages'),
                    client.get('/investments'),
                    client.get('/auth/me')
                ]);
                setPackages(packagesRes.data);
                setInvestments(investmentsRes.data);

                console.log("📋 User data:", userRes.data);
                console.log("� Sponsor wallet:", userRes.data.sponsorWallet);

                // Get sponsor wallet address
                let sponsorWallet = userRes.data.sponsorWallet;

                console.log("Step 1 - sponsorWallet from user:", sponsorWallet);
                console.log("Step 2 - referredBy exists?", !!userRes.data.referredBy);
                console.log("Step 3 - referredBy type:", typeof userRes.data.referredBy);
                console.log("Step 4 - referredBy full object:", userRes.data.referredBy);

                // If sponsorWallet doesn't exist or is zero address, get from referredBy
                if ((!sponsorWallet || sponsorWallet === '0x0000000000000000000000000000000000000000') && userRes.data.referredBy) {
                    console.log("Step 5 - Entering fallback logic");
                    if (typeof userRes.data.referredBy === 'object' && userRes.data.referredBy.wallet) {
                        // referredBy is populated with user object
                        sponsorWallet = userRes.data.referredBy.wallet;
                        console.log("Step 6 - Got sponsor wallet from referredBy:", sponsorWallet);
                    } else {
                        console.log("Step 6 - referredBy.wallet not found, value:", userRes.data.referredBy.wallet);
                    }
                }

                if (sponsorWallet && sponsorWallet !== '0x0000000000000000000000000000000000000000') {
                    console.log("✅ Setting sponsor address:", sponsorWallet);
                    setSponsorAddress(sponsorWallet);
                } else {
                    console.log("⚠️ No sponsor wallet found");
                    setSponsorAddress("No Sponsor");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        checkWalletConnection();
    }, []);

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

    // handle input
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
    };



    // submit form
    const handleSubmit = async () => {
        try {

            if (!formData.amount) {
                alert("Please enter amount");
                return;
            }
            if (formData.amount < 500) {
                alert("Minimum amount is ₹500");
                return;
            }

            // Note: In a real app we'd verify transaction hash or handle payment gateway here
            // For now we use the createInvestment endpoint which assumes balance payment or pending manual approval
            // Since the form asks for Transaction ID, we pass it.

            await client.post('/investments', {
                amount: formData.amount,
                transactionId: formData.transactionId || `TXN${Date.now()} `,
                sponsorId: sponsorAddress && sponsorAddress !== "No Sponsor" ? sponsorAddress : "" // Use sponsor's wallet address
            });

            alert("✅ Investment Request Submitted!\n\nYour investment request has been submitted successfully.\n\nStatus: Pending Verification\n\nYour request will be processed within 24 hours after payment verification.");

            // Refresh investments
            const { data } = await client.get('/investments');
            setInvestments(data);

            // Reset form
            setFormData({
                amount: "",
                transactionId: "",
                paymentSlip: null
            });

        } catch (error) {
            console.error("Error creating investment:", error);
            alert(error.response?.data?.message || "Failed to submit investment");
        }
    };

    const handleConnect = async () => {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to connect your wallet!\n\nVisit: https://metamask.io/download/');
            return;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const account = accounts[0];
            setWalletAddress(account);
            setIsWalletConnected(true);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    setWalletAddress("");
                    setIsWalletConnected(false);
                } else {
                    setWalletAddress(accounts[0]);
                }
            });

            alert(`Wallet connected successfully!\n\nAddress: ${account.slice(0, 6)}...${account.slice(-4)} `);

        } catch (error) {
            console.error("Error connecting wallet:", error);
            if (error.code === 4001) {
                alert('Wallet connection rejected. Please try again.');
            } else {
                alert('Failed to connect wallet. Please try again.');
            }
        }
    };

    return (
        <div className="w-full space-y-8 md:space-y-8">
            {/* Header Section */}
            <div className="space-y-3 md:space-y-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Investment Plans</h2>
                <p className="text-[#b0b0b0] text-sm md:text-lg">Submit your investment request</p>
            </div>

            {/* Investment Form Section */}
            <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] rounded-2xl border border-[#9131e7]/30 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-[#9131e7]/30 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10">
                    <h3 className="text-xl md:text-2xl font-bold text-white">Investment Request</h3>
                    <p className="text-gray-400 text-sm md:text-base">Fill the form below to make an investment</p>
                </div>

                <div className="p-4 md:p-6">
                    <div className="space-y-4 md:space-y-6">

                        <div>
                            <label htmlFor="amount" className="block text-xs md:text-sm font-semibold text-white mb-2">
                                Investment Amount (₹)
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Enter investment amount (Min: ₹500)"
                                min="500"
                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1a1a2e] border border-[#9131e7]/40 text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all text-sm md:text-base"
                            />
                            <p className="text-gray-400 text-xs mt-2">Minimum investment amount: ₹500</p>
                        </div>

                        <div>
                            <label htmlFor="transactionId" className="block text-xs md:text-sm font-semibold text-white mb-2">
                                Transaction ID
                            </label>
                            <input
                                type="text"
                                id="transactionId"
                                name="transactionId"
                                value={formData.transactionId}
                                onChange={handleChange}
                                placeholder="Enter your transaction ID"
                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1a1a2e] border border-[#9131e7]/40 text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all text-sm md:text-base"
                            />
                        </div>

                        <div>
                            <label htmlFor="paymentSlip" className="block text-xs md:text-sm font-semibold text-white mb-2">
                                Payment Slip
                            </label>
                            <input
                                type="file"
                                id="paymentSlip"
                                name="paymentSlip"
                                onChange={handleChange}
                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1a1a2e] border border-[#9131e7]/40 text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all text-xs md:text-sm"
                            />
                            <p className="text-gray-400 text-xs mt-2">Upload your payment receipt/screenshot</p>
                        </div>

                        <div>
                            <label htmlFor="sponsorId" className="block text-xs md:text-sm font-semibold text-white mb-2">
                                Sponsor ID (Referrer's Wallet Address)
                            </label>
                            <input
                                type="text"
                                id="sponsorId"
                                name="sponsorId"
                                value={sponsorAddress || ""}
                                readOnly
                                placeholder={
                                    !isWalletConnected
                                        ? "Please connect wallet first"
                                        : sponsorAddress
                                            ? ""
                                            : "Loading sponsor address..."
                                }
                                className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#1a1a2e]/50 border border-[#9131e7]/40 text-gray-400 rounded-lg cursor-not-allowed text-sm md:text-base font-mono"
                            />
                            <p className="text-gray-400 text-xs mt-2">
                                {sponsorAddress === "No Sponsor"
                                    ? "You don't have a sponsor/referrer"
                                    : "Your sponsor's wallet address (saved during signup)"}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#444]">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* <button
                                    onClick={handleConnect}
                                    className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#e84495] to-[#9131e7] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#e84495]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 text-sm md:text-base"
                                >
                                    Connect Wallet
                                </button> */}
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 text-sm md:text-base"
                                >
                                    Submit Investment Request
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs mt-3 text-center">
                                Note: Your investment request will be processed within 24 hours after verification
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase History Section */}
            <div className="mt-8 md:mt-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Investment History</h2>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/30 transition-all duration-300 text-sm md:text-base w-full sm:w-auto">
                        Export CSV
                    </button>
                </div>

                {/* Purchase History Table */}
                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] rounded-2xl border border-[#9131e7]/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#9131e7]/20 to-[#e84495]/20 border-b border-[#9131e7]/30">
                                    <th className="text-left p-3 md:p-4 text-white font-bold text-xs md:text-sm">Amount</th>
                                    <th className="text-left p-3 md:p-4 text-white font-bold text-xs md:text-sm">Purchase Date</th>
                                    <th className="text-left p-3 md:p-4 text-white font-bold text-xs md:text-sm">Transaction ID</th>
                                    <th className="text-left p-3 md:p-4 text-white font-bold text-xs md:text-sm">Status</th>
                                    <th className="text-left p-3 md:p-4 text-white font-bold text-xs md:text-sm">Approved Date</th>
                                    <th className="text-left p-3 md:p-4 text-white font-bold text-xs md:text-sm">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="border-b border-[#444]/30 hover:bg-[#9131e7]/10 transition-colors duration-300 group"
                                    >
                                        <td className="p-3 md:p-4">
                                            <span className="text-lg md:text-xl font-bold text-[#9131e7]">₹{item.amount}</span>
                                        </td>
                                        <td className="p-3 md:p-4 text-gray-300 text-xs md:text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 md:p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#b0b0b0] font-mono text-xs md:text-sm truncate max-w-[100px]">{item.transactionId}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 md:p-4">
                                            <span className={`
px - 2 md: px - 3 py - 1 rounded - full text - xs md: text - sm font - medium inline - flex items - center gap - 1
                                                ${item.status === 'completed' || item.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : item.status === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                }
`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3 md:p-4 text-gray-300 text-xs md:text-sm">{item.status === 'active' ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                        <td className="p-3 md:p-4">
                                            <button className="px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-[#9131e7]/20 to-[#e84495]/20 text-white rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/30 transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                                Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="p-3 md:p-4 bg-[#0f0f1a] border-t border-[#9131e7]/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="text-gray-400 text-xs md:text-sm">
                            Showing {investments.length} investments
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

                    {/* Empty State */}
                    {investments.length === 0 && (
                        <div className="p-6 md:p-12 text-center">
                            <div className="inline-block p-3 md:p-4 rounded-full bg-gradient-to-br from-[#9131e7]/10 to-[#e84495]/10 mb-3 md:mb-4">
                                <svg className="w-12 h-12 md:w-16 md:h-16 text-[#9131e7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Investment History</h3>
                            <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">Your investment history will appear here once you make your first investment</p>
                            <button className="px-4 md:px-6 py-2 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/30 transition-all duration-300 text-sm md:text-base">
                                Explore Investments
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal is now redundant since form is directly shown */}
            {/* {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f0f1a] p-4 md:p-6 rounded-2xl border border-[#9131e7]/40 w-full max-w-md max-h-[90vh] overflow-y-auto">

                        <h2 className="text-xl md:text-2xl text-white font-bold mb-4">
                            Make Investment
                        </h2>

                        <div className="space-y-3 md:space-y-4">
                            <input
                                type="number"
                                name="amount"
                                placeholder="Enter Amount"
                                className="w-full px-3 md:px-4 py-2 rounded-lg bg-[#1a1a2e] text-white border border-[#9131e7]/40 text-sm md:text-base"
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="transactionId"
                                placeholder="Transaction ID"
                                className="w-full px-3 md:px-4 py-2 rounded-lg bg-[#1a1a2e] text-white border border-[#9131e7]/40 text-sm md:text-base"
                                onChange={handleChange}
                            />

                            <input
                                type="file"
                                name="paymentSlip"
                                className="w-full px-3 md:px-4 py-2 rounded-lg bg-[#1a1a2e] text-white border border-[#9131e7]/40 text-xs md:text-sm"
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="sponsorId"
                                placeholder="Sponsor ID"
                                className="w-full px-3 md:px-4 py-2 rounded-lg bg-[#1a1a2e] text-white border border-[#9131e7]/40 text-sm md:text-base"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mt-4 md:mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 md:px-4 py-2 bg-gray-600/40 text-white rounded-lg text-sm md:text-base w-full sm:w-auto order-2 sm:order-1"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmit}
                                className="px-3 md:px-4 py-2 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white rounded-lg text-sm md:text-base w-full sm:w-auto order-1 sm:order-2"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

        </div>
    )
}