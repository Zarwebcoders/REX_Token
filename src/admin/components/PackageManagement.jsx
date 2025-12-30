"use client"

import { useState, useEffect } from "react"
import client from "../../api/client"

export default function PackageManagement() {
    const [investments, setInvestments] = useState([])
    const [filteredInvestments, setFilteredInvestments] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [notification, setNotification] = useState(null)
    const [stats, setStats] = useState({
        totalInvestments: 0,
        totalAmount: 0,
        pendingInvestments: 0,
        approvedInvestments: 0,
        rejectedInvestments: 0
    })

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchInvestments = async () => {
        try {
            const { data } = await client.get('/investments/all');
            setInvestments(data);
            setFilteredInvestments(data);

            // Calculate stats
            const totalAmount = data.reduce((sum, inv) => sum + inv.amount, 0);
            const pending = data.filter(inv => inv.status === 'pending').length;
            const approved = data.filter(inv => inv.status === 'approved').length;
            const rejected = data.filter(inv => inv.status === 'rejected').length;

            setStats({
                totalInvestments: data.length,
                totalAmount: totalAmount,
                pendingInvestments: pending,
                approvedInvestments: approved,
                rejectedInvestments: rejected
            });
        } catch (error) {
            console.error("Error fetching investments:", error);
            showNotification("Failed to fetch investments", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    // Filter investments by status and search query
    useEffect(() => {
        let filtered = investments;

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(inv => inv.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.user?.name?.toLowerCase().includes(query) ||
                inv.user?.email?.toLowerCase().includes(query) ||
                inv.transactionId?.toLowerCase().includes(query) ||
                inv.sponsorId?.toLowerCase().includes(query)
            );
        }

        setFilteredInvestments(filtered);
    }, [statusFilter, searchQuery, investments]);

    const handleApprove = async (investmentId) => {
        if (!window.confirm("Are you sure you want to approve this investment?")) {
            return;
        }

        try {
            // Find the investment to get user and amount details
            const investment = investments.find(inv => inv._id === investmentId);
            if (!investment) {
                showNotification("Investment not found", "error");
                return;
            }

            // Check if user has wallet address
            if (!investment.user?.wallet || investment.user.wallet === '0x0000000000000000000000000000000000000000') {
                showNotification("User wallet address not found. User must connect wallet first.", "error");
                return;
            }

            // Get sponsor wallet address from investment.sponsorId
            let sponsorWallet = investment.sponsorId || '0x0000000000000000000000000000000000000000';

            // Validate sponsor wallet
            if (!sponsorWallet || sponsorWallet === '0x0000000000000000000000000000000000000000' || sponsorWallet === '' || sponsorWallet === 'N/A') {
                showNotification("Invalid sponsor wallet address. Cannot approve investment without valid sponsor.", "error");
                return;
            }

            console.log("Approving investment:", {
                userWallet: investment.user.wallet,
                amount: investment.amount,
                sponsorWallet: sponsorWallet
            });

            showNotification("Step 1: Calling smart contract...", "info");

            // Step 1: Call smart contract
            const { adminInvest } = await import('../../utils/contractUtils');

            const contractResult = await adminInvest(
                investment.user.wallet,
                investment.amount,
                sponsorWallet
            );

            // Check if contract transaction was successful
            if (!contractResult.success) {
                showNotification(`Blockchain approval failed: ${contractResult.error}`, "error");
                return;
            }

            console.log('✅ Contract transaction successful:', contractResult.txHash);
            showNotification(`Blockchain confirmed! Hash: ${contractResult.txHash.substring(0, 10)}...`, "success");

            // Step 2: Approve in database only if blockchain succeeded
            showNotification("Step 2: Updating database...", "info");
            await client.put(`/investments/${investmentId}`, {
                status: 'approved',
                transactionHash: contractResult.txHash // Store blockchain proof
            });

            fetchInvestments();
            showNotification("Investment approved successfully on blockchain and database!", "success");

        } catch (error) {
            console.error("Error approving investment:", error);
            showNotification(`Failed to approve investment: ${error.message || 'Unknown error'}`, "error");
        }
    };

    const handleReject = async (investmentId) => {
        if (!window.confirm("Are you sure you want to reject this investment? This action cannot be undone.")) {
            return;
        }

        try {
            await client.put(`/investments/${investmentId}`, { status: 'rejected' });
            fetchInvestments();
            showNotification("Investment rejected", "warning");
        } catch (error) {
            console.error("Error rejecting investment:", error);
            showNotification("Failed to reject investment", "error");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Loading investments...</div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slideIn ${notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'error' ? 'bg-red-500' :
                        'bg-yellow-500'
                    } text-white font-semibold`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Investment Management</h2>
                    <p className="text-gray-400 mt-1">Review and manage all user investment requests</p>
                </div>
                <button
                    onClick={fetchInvestments}
                    className="px-4 py-2 bg-[#9131e7] text-white rounded-lg hover:bg-[#9131e7]/80 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                    <p className="text-gray-400 text-sm mb-1">Total Investments</p>
                    <h3 className="text-3xl font-bold text-white">{stats.totalInvestments}</h3>
                </div>
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#00b894]/30">
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <h3 className="text-3xl font-bold text-white">₹{stats.totalAmount.toLocaleString()}</h3>
                </div>
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#f3b232]/30">
                    <p className="text-gray-400 text-sm mb-1">Pending</p>
                    <h3 className="text-3xl font-bold text-[#f3b232]">{stats.pendingInvestments}</h3>
                </div>
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#00b894]/30">
                    <p className="text-gray-400 text-sm mb-1">Approved</p>
                    <h3 className="text-3xl font-bold text-[#00b894]">{stats.approvedInvestments}</h3>
                </div>
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#e74c3c]/30">
                    <p className="text-gray-400 text-sm mb-1">Rejected</p>
                    <h3 className="text-3xl font-bold text-[#e74c3c]">{stats.rejectedInvestments}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0f0f1a] rounded-xl p-4 border border-[#9131e7]/30">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by user, email, transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-[#1a1a2e] border border-[#9131e7]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9131e7]"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-[#1a1a2e] border border-[#9131e7]/30 rounded-lg text-white focus:outline-none focus:border-[#9131e7]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Investments Table */}
            <div className="bg-[#0f0f1a] rounded-xl border border-[#9131e7]/30 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-[#9131e7]/30 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white font-bold text-base md:text-lg">Investment Requests</h4>
                        <span className="text-gray-400 text-sm">Showing {filteredInvestments.length} of {investments.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1a1a2e]">
                            <tr>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">User</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">User Wallet</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Amount</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Sponsor ID</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Date</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Status</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#9131e7]/30">
                            {filteredInvestments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                                        No investments found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvestments.map((investment) => (
                                    <tr key={investment._id} className="hover:bg-[#1a1a2e] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#9131e7] to-[#e84495] rounded-full flex items-center justify-center text-white font-bold">
                                                    {investment.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{investment.user?.name || 'Unknown'}</p>
                                                    <p className="text-gray-400 text-sm">{investment.user?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-blue-400 text-xs bg-blue-500/10 px-2 py-1 rounded font-mono">
                                                {investment.user?.wallet && investment.user.wallet !== '0x0000000000000000000000000000000000000000' ?
                                                    `${investment.user.wallet.slice(0, 6)}...${investment.user.wallet.slice(-4)}`
                                                    : 'N/A'
                                                }
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-500 font-bold text-lg">₹{investment.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[#9131e7] text-sm bg-[#9131e7]/10 px-2 py-1 rounded">{investment.transactionId || 'N/A'}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white text-sm">{investment.sponsorId || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(investment.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${investment.status === 'approved'
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : investment.status === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-500'
                                                        : 'bg-red-500/20 text-red-500'
                                                    }`}
                                            >
                                                {investment.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {investment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(investment._id)}
                                                            className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-all text-sm font-semibold flex items-center gap-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(investment._id)}
                                                            className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold flex items-center gap-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {investment.status !== 'pending' && (
                                                    <span className="text-gray-500 text-sm italic">
                                                        {investment.status === 'approved' ? 'Completed' : 'Closed'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
