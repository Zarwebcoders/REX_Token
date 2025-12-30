"use client"
import { useState, useEffect } from "react"
import client from "../../api/client"

export default function WithdrawalRequests() {
    const [filterStatus, setFilterStatus] = useState("pending")
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const { data } = await client.get('/transactions');
            // data could be array of transactions. Filter for withdrawal
            const withdrawalData = data.filter(t => t.type === 'withdrawal');

            // Map to match UI structure if needed, or use directly
            // UI expects: id, user(name), email, amount, wallet, date, status, method
            const mapped = withdrawalData.map(t => ({
                id: t._id,
                user: t.user?.name || 'Unknown',
                email: t.user?.email || 'N/A',
                amount: `₹${t.amount.toLocaleString()}`,
                wallet: t.crypto === 'USDT' ? t.hash : (t.user?.wallet || 'N/A'),
                date: new Date(t.createdAt).toLocaleString(),
                status: t.status,
                method: t.crypto // e.g. USDT, BTC
            }));

            setWithdrawals(mapped);
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await client.put(`/transactions/${id}`, { status });
            alert(`Withdrawal marked as ${status}`);
            fetchWithdrawals(); // Refresh
        } catch (error) {
            console.error(`Error updating withdrawal to ${status}:`, error);
            alert("Failed to update status");
        }
    }

    const filteredWithdrawals = withdrawals.filter(w =>
        filterStatus === 'all' || w.status === filterStatus
    );

    // Calculate stats
    const stats = {
        pending: withdrawals.filter(w => w.status === 'pending').length,
        approvedToday: withdrawals.filter(w => w.status === 'completed' && new Date(w.date).toDateString() === new Date().toDateString()).length,
        rejectedToday: withdrawals.filter(w => w.status === 'failed' && new Date(w.date).toDateString() === new Date().toDateString()).length,
        totalAmount: withdrawals.reduce((acc, w) => acc + parseFloat(w.amount.replace(/[^0-9.-]+/g, "")), 0)
    };

    if (loading) return <div className="text-white">Loading withdrawals...</div>

    return (
        <div className="space-y-6 animate-fadeIn">
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>

            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white">Withdrawal Requests</h2>
                <p className="text-gray-400 mt-1">Process and manage user withdrawal requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Pending Requests", value: stats.pending, color: "yellow" },
                    { label: "Approved Today", value: stats.approvedToday, color: "green" },
                    { label: "Total Amount", value: `₹${stats.totalAmount.toLocaleString()}`, color: "blue" },
                    { label: "Rejected Today", value: stats.rejectedToday, color: "red" },
                ].map((stat, index) => (
                    <div key={index} className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-[#0f0f1a] rounded-xl p-4 border border-[#9131e7]/30">
                <div className="flex flex-wrap gap-2">
                    {["pending", "completed", "failed", "all"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${filterStatus === status ? "bg-[#9131e7] text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-[#0f0f1a] rounded-xl border border-[#9131e7]/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1a1a2e]">
                            <tr>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">ID</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">User</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Amount</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Method</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Wallet Address</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Date</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Status</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#9131e7]/30">
                            {filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No requests found</td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="hover:bg-[#1a1a2e] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-[#9131e7] font-mono">#{withdrawal.id.substring(withdrawal.id.length - 6)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-medium">{withdrawal.user}</p>
                                                <p className="text-gray-400 text-sm">{withdrawal.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-500 font-bold text-lg">{withdrawal.amount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded-full text-xs font-semibold">
                                                {withdrawal.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-gray-400 text-sm">{withdrawal.wallet}</code>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{withdrawal.date}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${withdrawal.status === "pending"
                                                    ? "bg-yellow-500/20 text-yellow-500"
                                                    : withdrawal.status === "completed"
                                                        ? "bg-green-500/20 text-green-500"
                                                        : "bg-red-500/20 text-red-500"
                                                    }`}
                                            >
                                                {withdrawal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {withdrawal.status === "pending" ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(withdrawal.id, 'completed')}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(withdrawal.id, 'failed')}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm italic">Completed</span>
                                            )}
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
