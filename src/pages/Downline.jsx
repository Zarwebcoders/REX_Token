import { useState, useEffect } from "react"
import client from "../api/client"

export default function Downline() {
    const [userInfo, setUserInfo] = useState({
        userId: "",
        name: "",
        email: "",
        totalNetwork: 0,
        activeLevels: 0,
        overallBusiness: "0",
        networkGrowth: 0
    })

    const [networkStats, setNetworkStats] = useState([])
    const [downlineUsers, setDownlineUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLevel, setSelectedLevel] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, downlineRes, incomeRes] = await Promise.all([
                    client.get('/auth/me'),
                    client.get('/users/downline'),
                    client.get('/income/level-income').catch(() => ({ data: [] }))
                ]);

                const userData = userRes.data;
                const downlineData = downlineRes.data || [];
                const incomeData = incomeRes.data || [];

                // Store downline users for the detailed list
                setDownlineUsers(downlineData);
                setFilteredUsers(downlineData);

                // Level percentages for 10 levels
                const levelPercentages = [5, 2, 1, 1, 1, 1, 7.5, 5, 2.5, 2.5];

                // Process downline data by levels (now 10 levels)
                const levels = Array(10).fill(0); // Counts for level 1-10
                const levelBusiness = Array(10).fill(0); // Business volume per level
                const levelIncome = Array(10).fill(0); // Calculated level income
                let totalMembers = 0;
                let totalBusiness = 0;
                let totalLevelIncome = 0;

                // Count members per level and calculate business
                downlineData.forEach(user => {
                    const level = user.level; // 0-based from backend
                    if (level >= 0 && level < 10) {
                        levels[level]++;
                        totalMembers++;
                        // Calculate business from user's approved investments
                        const userBusiness = user.totalInvestment || 0;
                        levelBusiness[level] += userBusiness;
                        totalBusiness += userBusiness;
                    }
                });

                // Calculate level income based on percentages
                levelBusiness.forEach((business, index) => {
                    if (index < levelPercentages.length) {
                        const income = (business * levelPercentages[index]) / 100;
                        levelIncome[index] = income;
                        totalLevelIncome += income;
                    }
                });

                // Calculate network growth (compare current month to previous)
                const currentDate = new Date();
                const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
                const currentMonthMembers = downlineData.filter(user =>
                    new Date(user.createdAt) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                ).length;
                const lastMonthMembers = downlineData.filter(user =>
                    new Date(user.createdAt) >= lastMonth &&
                    new Date(user.createdAt) < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                ).length;

                const networkGrowth = lastMonthMembers > 0
                    ? Math.round((currentMonthMembers / lastMonthMembers) * 100)
                    : 0;

                // Build stats array with real data for 10 levels
                const stats = levels.map((count, index) => {
                    const business = levelBusiness[index];
                    const income = levelIncome[index];
                    const percentage = levelPercentages[index] || 0;

                    // Calculate growth percentage for this level
                    const levelGrowth = count > 0 ? Math.min(Math.round((count / 10) * 100), 100) : 0;

                    return {
                        level: index + 1,
                        members: count,
                        business: `₹${business.toLocaleString()}`,
                        income: `₹${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        percentage: `${percentage}%`,
                        growth: levelGrowth
                    };
                });

                const activeLevelsCount = levels.filter(l => l > 0).length;

                setUserInfo({
                    userId: userData._id.substring(userData._id.length - 8).toUpperCase(),
                    name: userData.name,
                    email: userData.email,
                    totalNetwork: totalMembers,
                    activeLevels: activeLevelsCount,
                    overallBusiness: `₹${totalBusiness.toLocaleString()}`,
                    totalLevelIncome: `₹${totalLevelIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    networkGrowth: networkGrowth
                });

                setNetworkStats(stats);
                setLoading(false);

            } catch (error) {
                console.error("Error fetching downline data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter users by level and search query
    useEffect(() => {
        let filtered = downlineUsers;

        // Filter by level
        if (selectedLevel !== "all") {
            const levelNum = parseInt(selectedLevel);
            filtered = filtered.filter(user => user.level === levelNum);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.wallet?.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(filtered);
    }, [selectedLevel, searchQuery, downlineUsers]);

    const totalStats = {
        totalMembers: networkStats.reduce((sum, stat) => sum + stat.members, 0),
        totalBusiness: networkStats.reduce((sum, stat) => {
            const business = parseInt(stat.business.replace(/[₹,]/g, '')) || 0;
            return sum + business;
        }, 0),
        totalLevelIncome: networkStats.reduce((sum, stat) => {
            const income = parseFloat(stat.income.replace(/[₹,]/g, '')) || 0;
            return sum + income;
        }, 0),
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) return <div className="text-white">Loading network data...</div>

    return (
        <div className="w-full space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="space-y-3 md:space-y-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Referral Network</h2>
                <p className="text-[#b0b0b0] text-sm md:text-lg">Manage and track your referral network growth. View all levels of your downline team and their performance.</p>
            </div>

            {/* User Information Card */}
            <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] rounded-2xl border border-[#9131e7]/30 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-[#9131e7]/30 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10">
                    <h3 className="text-xl md:text-2xl font-bold text-white">Your Profile Information</h3>
                    <p className="text-gray-400 text-sm md:text-base">Complete overview of your referral network account</p>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 md:p-2 rounded-lg bg-[#9131e7]/20">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#9131e7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                            </div>
                            <h4 className="text-gray-400 text-xs md:text-sm">User ID</h4>
                        </div>
                        <p className="text-white text-lg md:text-xl font-bold truncate">{userInfo.userId}</p>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 md:p-2 rounded-lg bg-[#00b894]/20">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#00b894]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h4 className="text-gray-400 text-xs md:text-sm">Full Name</h4>
                        </div>
                        <p className="text-white text-lg md:text-xl font-bold truncate">{userInfo.name}</p>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 md:p-2 rounded-lg bg-[#0984e3]/20">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#0984e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h4 className="text-gray-400 text-xs md:text-sm">Email Address</h4>
                        </div>
                        <p className="text-white text-base md:text-lg font-medium truncate">{userInfo.email}</p>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 md:p-2 rounded-lg bg-[#fd79a8]/20">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#fd79a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-gray-400 text-xs md:text-sm">Total Network</h4>
                        </div>
                        <div className="flex items-baseline gap-1 md:gap-2">
                            <p className="text-white text-xl md:text-2xl font-bold">{userInfo.totalNetwork}</p>
                            {userInfo.networkGrowth > 0 && (
                                <span className="text-green-400 text-xs md:text-sm">+{userInfo.networkGrowth}%</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 md:p-2 rounded-lg bg-[#e17055]/20">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#e17055]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h4 className="text-gray-400 text-xs md:text-sm">Overall Business</h4>
                        </div>
                        <p className="text-white text-xl md:text-2xl font-bold truncate">{userInfo.overallBusiness}</p>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 md:p-2 rounded-lg bg-[#00b894]/20">
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#00b894]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-gray-400 text-xs md:text-sm">Total Level Income</h4>
                        </div>
                        <p className="text-[#00b894] text-xl md:text-2xl font-bold truncate">{userInfo.totalLevelIncome || '₹0.00'}</p>
                    </div>
                </div>
            </div>

            {/* Your Network Section */}
            <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">Your Network Performance</h3>
                        <p className="text-gray-400 text-sm md:text-base">Detailed breakdown of your network by levels</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm md:text-base">Active Levels:</span>
                        <span className="px-2 md:px-3 py-1 bg-[#9131e7] text-white rounded-full font-bold text-sm md:text-base">{userInfo.activeLevels}</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] rounded-2xl border border-[#9131e7]/30 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-[#9131e7]/30 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10">
                        <h4 className="text-white font-bold text-base md:text-lg">Network Summary</h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr className="border-b border-[#9131e7]/30">
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Level</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Members</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Business Volume</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Level Income (%)</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {networkStats.map((stat) => (
                                    <tr key={stat.level} className="border-b border-[#444]/30 hover:bg-[#9131e7]/10 transition-colors">
                                        <td className="py-3 md:py-4 px-3 md:px-6">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#9131e7] to-[#e84495] flex items-center justify-center flex-shrink-0">
                                                    <span className="font-bold text-white text-sm md:text-base">L{stat.level}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-white font-bold text-sm md:text-base truncate block">Level {stat.level}</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-12 md:w-16 h-1 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-[#9131e7] to-[#e84495] rounded-full"
                                                                style={{ width: `${(stat.members / 50) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-gray-400 text-xs truncate">{stat.members} members</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-6">
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <span className="text-lg md:text-2xl font-bold text-white">{stat.members}</span>
                                                <span className="text-gray-400 text-xs md:text-sm">members</span>
                                            </div>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-6">
                                            <div className="space-y-1">
                                                <span className="text-lg md:text-xl font-bold text-white truncate block">{stat.business}</span>
                                                {stat.growth > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-2 h-2 md:w-3 md:h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                        </svg>
                                                        <span className="text-green-400 text-xs truncate">Active level</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-6">
                                            <div className="space-y-1">
                                                <span className="text-lg md:text-xl font-bold text-[#00b894] truncate block">{stat.income}</span>
                                                <span className="text-[#9131e7] text-xs truncate font-semibold">{stat.percentage} of business</span>
                                            </div>
                                        </td>
                                        <td className="py-3 md:py-4 px-3 md:px-6">
                                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                                <div className="w-16 md:w-24 flex-shrink-0">
                                                    <div className="text-xs text-gray-400 mb-1 truncate">Activity</div>
                                                    <div className="w-full h-1.5 md:h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#00b894] to-[#00cec9] rounded-full"
                                                            style={{ width: `${stat.growth}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className="text-white font-bold text-sm md:text-base flex-shrink-0">{stat.growth}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Summary Row */}
                    <div className="p-4 md:p-6 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10 border-t border-[#9131e7]/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="text-center">
                                <div className="text-gray-400 mb-1 text-sm md:text-base">Total Members</div>
                                <div className="text-2xl md:text-3xl font-bold text-white">{totalStats.totalMembers.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-400 mb-1 text-sm md:text-base">Total Business Volume</div>
                                <div className="text-2xl md:text-3xl font-bold text-white truncate">₹{totalStats.totalBusiness.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-400 mb-1 text-sm md:text-base">Total Level Income</div>
                                <div className="text-2xl md:text-3xl font-bold text-[#00b894] truncate">₹{totalStats.totalLevelIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Downline Users List */}
            <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">Team Members</h3>
                        <p className="text-gray-400 text-sm md:text-base">Complete list of your downline network</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Total:</span>
                        <span className="px-3 py-1 bg-[#9131e7] text-white rounded-full font-bold">{filteredUsers.length}</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#040408] to-[#1a1a2e] rounded-2xl border border-[#9131e7]/30 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 md:p-6 border-b border-[#9131e7]/30 bg-gradient-to-r from-[#9131e7]/10 to-[#e84495]/10">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or wallet..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 bg-[#1a1a2e] border border-[#9131e7]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9131e7]"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Level Filter */}
                            <div className="w-full md:w-48">
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#1a1a2e] border border-[#9131e7]/30 rounded-lg text-white focus:outline-none focus:border-[#9131e7]"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="0">Level 1</option>
                                    <option value="1">Level 2</option>
                                    <option value="2">Level 3</option>
                                    <option value="3">Level 4</option>
                                    <option value="4">Level 5</option>
                                    <option value="5">Level 6</option>
                                    <option value="6">Level 7</option>
                                    <option value="7">Level 8</option>
                                    <option value="8">Level 9</option>
                                    <option value="9">Level 10</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr className="border-b border-[#9131e7]/30">
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">User</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Level</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Join Date</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Investment</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Your Income</th>
                                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-white font-bold text-xs md:text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-400">
                                            No team members found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-[#444]/30 hover:bg-[#9131e7]/10 transition-colors">
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9131e7] to-[#e84495] flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-sm">
                                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-white font-medium truncate">{user.name || 'Unknown'}</div>
                                                        <div className="text-gray-400 text-xs truncate">{user.email}</div>
                                                        {user.wallet && (
                                                            <div className="text-gray-500 text-xs truncate font-mono">
                                                                {user.wallet.substring(0, 6)}...{user.wallet.substring(user.wallet.length - 4)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <span className="px-3 py-1 bg-[#9131e7]/20 text-[#9131e7] rounded-full text-sm font-bold">
                                                    Level {(user.level || 0) + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <div className="text-white text-sm">{formatDate(user.createdAt)}</div>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <div className="text-white font-bold">
                                                    ₹{(user.totalInvestment || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                {(() => {
                                                    const levelPercentages = [5, 2, 1, 1, 1, 1, 7.5, 5, 2.5, 2.5];
                                                    const userLevel = user.level || 0;
                                                    const percentage = levelPercentages[userLevel] || 0;
                                                    const investment = user.totalInvestment || 0;
                                                    const income = (investment * percentage) / 100;
                                                    return (
                                                        <div className="space-y-1">
                                                            <div className="text-[#00b894] font-bold text-sm md:text-base">
                                                                ₹{income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="text-[#9131e7] text-xs font-semibold">
                                                                {percentage}% of ₹{investment.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-3 md:py-4 px-3 md:px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {user.status || 'active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}