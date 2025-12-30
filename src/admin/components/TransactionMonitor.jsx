"use client"

import { useState, useEffect } from "react"
import client from "../../api/client"

export default function TransactionMonitor() {
  const [filterType, setFilterType] = useState("all")

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    pending: 0,
    failed: 0,
    today: 0
  })
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

    const fetchTransactionStats = async () => {
      try {
        const { data } = await client.get("/transactions/stats");
        setStats(data);
      } catch (error) {
        console.error("Error fetching transaction stats:", error);
      }
    };

    fetchTransactionStats();
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case "deposit":
        return "bg-green-500/20 text-green-500"
      case "withdrawal":
        return "bg-red-500/20 text-red-500"
      case "investment":
        return "bg-blue-500/20 text-blue-500"
      case "referral":
        return "bg-purple-500/20 text-purple-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

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
        <h2 className="text-3xl font-bold text-white">Transaction Monitor</h2>
        <p className="text-gray-400 mt-1">Real-time monitoring of all platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Transactions", value: stats.totalTransactions, icon: "📊" },
          { label: "Total Volume", value: `₹${(stats.totalVolume / 1000000).toFixed(1)}M`, icon: "💰" },
          { label: "Pending", value: stats.pending, icon: "⏳" },
          { label: "Failed", value: stats.failed, icon: "❌" },
          { label: "Today", value: stats.today, icon: "📅" },
        ].map((stat, index) => (
          <div key={index} className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#0f0f1a] rounded-xl p-4 border border-[#9131e7]/30">
        <div className="flex flex-wrap gap-2">
          {["all", "deposit", "withdrawal", "investment", "referral"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${filterType === type ? "bg-[#9131e7] text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#0f0f1a] rounded-xl border border-[#9131e7]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Transaction ID</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Type</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">User</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Crypto</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Hash</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Date/Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#9131e7]/30">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-[#1a1a2e] transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-[#9131e7] text-sm font-mono">{tx._id.substring(0, 8)}...</code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(tx.type)}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{tx.user?.email || tx.user}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${tx.type === "deposit" ? "text-green-500" : "text-white"}`}>
                      ₹{tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded text-xs font-semibold">
                      {tx.crypto}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-gray-400 text-xs">{tx.hash}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.status === "completed"
                        ? "bg-green-500/20 text-green-500"
                        : tx.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                        }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
