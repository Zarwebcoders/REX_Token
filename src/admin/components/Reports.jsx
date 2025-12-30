"use client"
import { useState, useEffect } from "react"
import client from "../../api/client"

export default function Reports() {
    const [reportType, setReportType] = useState("revenue")
    const [dateRange, setDateRange] = useState("7days")
    const [stats, setStats] = useState(null)
    const [revenueData, setRevenueData] = useState([])
    const [topCountries, setTopCountries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Dashboard Stats
                const statsRes = await client.get('/admin/stats');
                setStats(statsRes.data);

                // Fetch Reports Data
                const reportsRes = await client.get('/admin/reports');
                setRevenueData(reportsRes.data.revenueData || []);
                setTopCountries(reportsRes.data.topCountries || []);

            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-white">Loading reports...</div>;

    // Calculate detailed stats if needed or use from stats API
    // stats: { totalUsers, activeUsers, totalInvestment, totalWithdrawals, pendingKYC }
    const totalRevenue = (stats?.totalInvestment || 0) // Revenue usually implies income, here maybe investment?
    const totalDeposits = stats?.totalInvestment || 0
    const totalWithdrawals = stats?.totalWithdrawals || 0
    const netProfit = totalDeposits - totalWithdrawals

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Reports & Analytics</h2>
                    <p className="text-gray-400 mt-1">Detailed insights and performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-[#2b2b2b] text-white rounded-lg font-semibold hover:bg-[#3f3f3f] transition-all">
                        Export PDF
                    </button>
                    <button className="px-6 py-3 bg-[#f3b232] text-[#1f1f1f] rounded-lg font-semibold hover:bg-[#d4941f] transition-all">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#1f1f1f] rounded-xl p-4 border border-[#3f3f3f]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-4 py-3 bg-[#2b2b2b] text-white rounded-lg border border-[#3f3f3f] focus:border-[#f3b232] focus:outline-none"
                        >
                            <option value="revenue">Revenue Report</option>
                            <option value="users">User Growth</option>
                            <option value="transactions">Transactions</option>
                            <option value="packages">Investment Performance</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-4 py-3 bg-[#2b2b2b] text-white rounded-lg border border-[#3f3f3f] focus:border-[#f3b232] focus:outline-none"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="1year">Last Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", value: `₹${totalDeposits.toLocaleString()}`, change: "+12.5%", color: "green" }, // Using deposits as revenue
                    { label: "Total Deposits", value: `₹${totalDeposits.toLocaleString()}`, change: "+8.2%", color: "blue" },
                    { label: "Total Withdrawals", value: `₹${totalWithdrawals.toLocaleString()}`, change: "+5.7%", color: "red" },
                    { label: "Net Profit", value: `₹${netProfit.toLocaleString()}`, change: "+15.3%", color: "yellow" },
                ].map((stat, index) => (
                    <div key={index} className="bg-[#1f1f1f] rounded-xl p-6 border border-[#3f3f3f]">
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        {/* Change filtering logically or hiding if no historical data for comparison */}
                        <p className="text-green-500 text-sm font-medium">Real Data</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-[#1f1f1f] rounded-xl p-6 border border-[#3f3f3f]">
                <h3 className="text-xl font-bold text-white mb-6">Revenue Trend (Last 7 Days)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1a1a2e]">
                            <tr>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Date</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Deposits</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Withdrawals</th>
                                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Net Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#9131e7]/30">
                            {revenueData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No data available for the last 7 days</td>
                                </tr>
                            ) : (
                                revenueData.map((row, index) => (
                                    <tr key={index} className="hover:bg-[#1a1a2e] transition-colors">
                                        <td className="px-6 py-4 text-white">{row.date}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{row.deposits.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-red-500 font-semibold">₹{row.withdrawals.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[#9131e7] font-bold">₹{row.netRevenue.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Countries */}
            <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                <h3 className="text-xl font-bold text-white mb-6">Top Countries by Revenue</h3>
                <div className="space-y-4">
                    {topCountries.length === 0 ? (
                        <p className="text-gray-400">No country data available.</p>
                    ) : (
                        topCountries.map((country, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-lg hover:bg-[#9131e7]/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#9131e7] to-[#7a28c2] rounded-lg flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{country.country}</p>
                                        <p className="text-gray-400 text-sm">{country.users.toLocaleString()} users</p>
                                    </div>
                                </div>
                                <span className="text-green-500 font-bold text-lg">{country.revenue}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
