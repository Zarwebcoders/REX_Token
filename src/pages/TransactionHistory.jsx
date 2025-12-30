"use client"

import { useState, useEffect } from "react"
import client from "../api/client"

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const [filter, setFilter] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await client.get('/transactions');
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    // Filter transactions
    const filteredTransactions = transactions.filter((tx) => {
        // Map 'bonus' type to 'income' for filtering
        const txType = tx.type === 'bonus' ? 'income' : tx.type;
        const matchesFilter = filter === "All" || txType.toLowerCase() === filter.toLowerCase();
        const matchesSearch =
            (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.hash && tx.hash.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx._id && tx._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.amount && tx.amount.toString().includes(searchTerm));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="w-full space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Transaction History</h2>
                <p className="text-[#b0b0b0] text-sm md:text-lg">View and track all your financial activities</p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1a1a2e] border border-[#9131e7]/30 p-4 rounded-xl">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {["All", "Withdrawal", "Investment", "Income"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${filter === item
                                ? "bg-[#9131e7] text-white font-semibold shadow-lg shadow-[#9131e7]/20"
                                : "bg-[#0f0f1a] text-gray-400 hover:bg-[#3f3f3f] hover:text-white"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#0f0f1a] border border-[#9131e7]/30 rounded-lg text-white focus:outline-none focus:border-[#9131e7] text-sm"
                    />
                    <svg
                        className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-[#1a1a2e] border border-[#9131e7]/30 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#0f0f1a] border-b border-[#9131e7]/30 text-left">
                                <th className="p-4 text-gray-400 font-semibold text-sm">Type</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Description</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Amount</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Date</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Status</th>
                                <th className="p-4 text-gray-400 font-semibold text-sm">Hash / ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <tr
                                        key={tx._id}
                                        className="border-b border-[#444]/20 hover:bg-[#9131e7]/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' :
                                                    tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                    {tx.type === 'deposit' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                        </svg>
                                                    )}
                                                    {tx.type === 'withdrawal' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                        </svg>
                                                    )}
                                                    {tx.type !== 'deposit' && tx.type !== 'withdrawal' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-white capitalize">{tx.type === 'bonus' ? 'income' : tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm">{tx.description}</td>
                                        <td className="p-4">
                                            <span className={`font-bold ${tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                {tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-500 text-xs font-mono truncate block max-w-[100px]" title={tx.hash || tx._id}>
                                                {tx.hash || tx._id}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">
                                        No transactions found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}