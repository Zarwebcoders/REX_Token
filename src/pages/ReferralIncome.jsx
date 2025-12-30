"use client"

import { useState, useEffect } from "react"
import client from "../api/client"

export default function ReferralIncome() {
    const [referralData, setReferralData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReferralIncome = async () => {
            try {
                const { data } = await client.get('/income/referral-income');

                const processed = data.map((income) => ({
                    id: income._id,
                    referralName: income.fromUser ? income.fromUser.name : "Unknown User",
                    date: new Date(income.createdAt).toLocaleDateString(),
                    amount: income.amount,
                    status: income.status === 'completed' ? 'Paid' : 'Pending'
                }));

                setReferralData(processed);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching referral income:", error);
                setLoading(false);
            }
        };
        fetchReferralIncome();
    }, [])

    const totalReferralIncome = referralData.reduce((sum, item) => sum + item.amount, 0)
    const pendingIncome = referralData
        .filter((item) => item.status === "Pending")
        .reduce((sum, item) => sum + item.amount, 0)

    if (loading) return <div className="text-white">Loading referral income...</div>

    return (
        <div className="w-full space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Referral Income</h2>
            <p className="text-[#b0b0b0] text-sm md:text-lg">Track your referral earnings</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444]">
                    <h3 className="text-[#b0b0b0] text-xs md:text-sm mb-2">Total Referral Income</h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#9131e7]">₹{totalReferralIncome.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444]">
                    <h3 className="text-[#b0b0b0] text-xs md:text-sm mb-2">Pending Income</h3>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-400">₹{pendingIncome.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444]">
                    <h3 className="text-[#b0b0b0] text-xs md:text-sm mb-2">Total Referrals</h3>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">{referralData.length}</p>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#9131e7]">Referral Transaction History</h3>
                {referralData.length === 0 ? (
                    <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-8 rounded-lg border border-[#444] text-center">
                        <p className="text-gray-400">No referral income data available yet.</p>
                        <p className="text-gray-500 text-sm mt-2">Start referring friends to earn commission!</p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] rounded-lg border border-[#444] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr className="border-b border-[#444] bg-[#0f0f1a]">
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Referral Name</th>
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Date</th>
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Amount</th>
                                        <th className="text-left py-3 px-3 md:px-4 text-white font-semibold text-xs md:text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referralData.map((item) => (
                                        <tr key={item.id} className="border-b border-[#444] hover:bg-[#9131e7]/5 transition-colors">
                                            <td className="py-3 px-3 md:px-4 text-white text-sm md:text-base truncate max-w-[100px] md:max-w-none">{item.referralName}</td>
                                            <td className="py-3 px-3 md:px-4 text-[#b0b0b0] text-xs md:text-sm">{item.date}</td>
                                            <td className="py-3 px-3 md:px-4 text-white font-medium text-sm md:text-base">₹{item.amount.toLocaleString()}</td>
                                            <td className="py-3 px-3 md:px-4">
                                                <span
                                                    className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${item.status === "Paid" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
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