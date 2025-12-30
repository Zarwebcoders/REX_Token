"use client"

import { useState, useEffect } from "react"
import client from "../api/client"

export default function LevelIncome() {
    const [selectedLevel, setSelectedLevel] = useState("all")
    const [levelData, setLevelData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLevelIncome = async () => {
            try {
                const { data } = await client.get('/income/level-income');

                // Process level income data
                const processed = data.map(income => ({
                    level: income.level,
                    members: 1, // Each income record represents one member
                    totalInvestment: income.fromUser?.totalInvestment || 0,
                    income: income.amount,
                    fromUser: income.fromUser?.name || "Unknown User",
                    date: new Date(income.createdAt).toLocaleDateString()
                }));

                setLevelData(processed);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching level income:", error);
                setLoading(false);
            }
        };
        fetchLevelIncome();
    }, [])

    // Group by level
    const groupedData = levelData.reduce((acc, curr) => {
        const existing = acc.find(item => item.level === curr.level);
        if (existing) {
            existing.income += curr.income;
            existing.members += 1;
            existing.totalInvestment += curr.totalInvestment;
        } else {
            acc.push({
                level: curr.level,
                income: curr.income,
                members: 1,
                totalInvestment: curr.totalInvestment
            });
        }
        return acc;
    }, []).sort((a, b) => a.level - b.level);

    const displayData = selectedLevel === "all"
        ? groupedData
        : groupedData.filter(item => item.level === parseInt(selectedLevel));

    const totalLevelIncome = displayData.reduce((sum, item) => sum + item.income, 0);
    const totalMembers = displayData.reduce((sum, item) => sum + item.members, 0);

    if (loading) return <div className="text-white">Loading level income...</div>

    return (
        <div className="w-full space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Level Income</h2>
                    <p className="text-[#b0b0b0] text-sm md:text-lg">View your income from network levels</p>
                </div>

                {/* Dropdown for level selection */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
                    <span className="text-[#b0b0b0] text-sm md:text-base">Select Level:</span>
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="bg-[#040408] border border-[#9131e7] text-white rounded-lg px-3 md:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9131e7] w-full sm:w-auto min-w-[150px] text-sm md:text-base"
                    >
                        <option value="all">All Levels</option>
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <option key={lvl} value={lvl}>
                                Level {lvl}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444]">
                    <h3 className="text-[#b0b0b0] text-xs md:text-sm mb-2">Total Level Income</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#9131e7]">₹{totalLevelIncome.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444]">
                    <h3 className="text-[#b0b0b0] text-xs md:text-sm mb-2">Total Network Members</h3>
                    <p className="text-2xl md:text-3xl font-bold text-blue-400">{totalMembers}</p>
                </div>
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444]">
                    <h3 className="text-[#b0b0b0] text-xs md:text-sm mb-2">Active Levels</h3>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">
                        {groupedData.length}
                    </p>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">
                    Level Income Breakdown {selectedLevel !== "all" && `- Level ${selectedLevel}`}
                </h3>
                {displayData.length === 0 ? (
                    <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-8 rounded-lg border border-[#444] text-center">
                        <p className="text-gray-400">No level income data available yet.</p>
                        <p className="text-gray-500 text-sm mt-2">Build your network to start earning level income!</p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] rounded-lg border border-[#444] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr className="border-b border-[#444] bg-[#0f0f1a]">
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Level</th>
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Members</th>
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Total Investment</th>
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Income</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.map((item, index) => (
                                        <tr key={index} className="border-b border-[#444] hover:bg-[#9131e7]/5 transition-colors">
                                            <td className="py-3 px-3 md:px-4">
                                                <span className="px-2 md:px-3 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded-full text-xs md:text-sm font-semibold">
                                                    Level {item.level}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 md:px-4 text-white text-sm md:text-base">{item.members}</td>
                                            <td className="py-3 px-3 md:px-4 text-white text-sm md:text-base">₹{item.totalInvestment.toLocaleString()}</td>
                                            <td className="py-3 px-3 md:px-4 text-[#9131e7] font-bold text-sm md:text-base">₹{item.income.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}