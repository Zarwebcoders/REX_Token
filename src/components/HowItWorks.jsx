import { motion } from "framer-motion";
import { useState } from "react";
import { TrendingUp, Users, Coins, Shield, Zap, BarChart3 } from "lucide-react";

const HowItWorks = () => {
    const [activeTab, setActiveTab] = useState("referral");

    const stakingData = [
        { title: "Daily Rates", value: "5%", icon: "📈", desc: "Per day on weekdays" },
        { title: "Max Rewards", value: "2x", icon: "💰", desc: "Maximum profit potential" },
        { title: "Duration", value: "365 Days", icon: "⏳", desc: "Lock period for bonus" },
        { title: "Min Stake", value: "100 REX", icon: "⚖️", desc: "Minimum investment" }
    ];

    const referralLevels = [
        { level: 1, percentage: "5%", color: "from-purple-500 to-pink-500" },
        { level: 2, percentage: "2%", color: "from-blue-500 to-cyan-500" },
        { level: 3, percentage: "1.5%", color: "from-green-500 to-emerald-500" },
        { level: 4, percentage: "1%", color: "from-yellow-500 to-orange-500" },
        { level: 5, percentage: "1%", color: "from-red-500 to-pink-500" },
        { level: 6, percentage: "1%", color: "from-indigo-500 to-purple-500" },
        { level: 7, percentage: "0.75%", color: "from-teal-500 to-blue-500" },
        { level: 8, percentage: "0.50%", color: "from-rose-500 to-red-500" },
        { level: 9, percentage: "0.25%", color: "from-amber-500 to-yellow-500" },
        { level: 10, percentage: "0.25%", color: "from-lime-500 to-green-500" }
    ];

    const tokenomicsData = [
        { label: "Initial Price", value: "5 INR", change: "+5% on 20 lacs INR" },
        { label: "Price Increase", value: "+5% / 20 Lakh" },
        { label: "Total Supply", value: "21M", sub: "REX Tokens" },
        { label: "Total Phases", value: "21" }
    ];

    const steps = [
        {
            number: "01",
            title: "Invest",
            icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />,
            description: "Purchase REX tokens using INR or other supported cryptocurrencies. Secure your position in the ecosystem.",
            color: "from-[#9131e7] to-[#a855f7]"
        },
        {
            number: "02",
            title: "Stake",
            icon: <Coins className="w-6 h-6 md:w-8 md:h-8" />,
            description: "Lock your REX tokens in our staking contract to start earning monthly passive income automatically.",
            color: "from-[#ffcc4d] to-[#fbbf24]"
        },
        {
            number: "03",
            title: "Earn",
            icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
            description: "Earn 5% montly returns and build your referral network across 10 levels for additional income.",
            color: "from-[#10b981] to-[#34d399]"
        }
    ];

    const features = [
        { icon: <Shield />, title: "Secure Smart Contract", desc: "Audited & verified contract with zero vulnerabilities" },
        { icon: <Zap />, title: "Instant Withdrawals", desc: "24/7 instant withdrawals with minimal gas fees" },
        { icon: <BarChart3 />, title: "Real-time Analytics", desc: "Live dashboard with earnings tracking and analytics" }
    ];

    return (
        <div className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e] relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9131e7] via-[#ffcc4d] to-[#9131e7]"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#9131e7]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ffcc4d]/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto max-w-7xl relative z-10">

                {/* Heading Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 md:mb-16"
                >
                    <div className="inline-flex items-center px-4 py-2 bg-[#9131e7]/20 border border-[#9131e7]/40 rounded-full mb-6">
                        <span className="w-2 h-2 bg-[#9131e7] rounded-full mr-2 animate-pulse"></span>
                        <span className="text-sm font-semibold uppercase tracking-wider">HOW IT WORKS</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                        Start Earning in <span className="bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] bg-clip-text text-transparent">3 Simple Steps</span>
                    </h2>

                    <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Our platform makes it incredibly easy to start earning passive income.
                        Follow these three simple steps to begin your journey with REX Token.
                    </p>
                </motion.div>

                {/* 3 Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            className="relative group h-full"
                        >
                            {/* Step Number Background */}
                            <div className="absolute -top-4 -left-2 md:-left-4 text-5xl md:text-7xl font-black text-gray-900/20 pointer-events-none">
                                {step.number}
                            </div>

                            <div className="relative bg-[#10101a] border border-gray-800/50 rounded-2xl p-6 md:p-8 h-full flex flex-col">
                                {/* Icon Container */}
                                <div className={`inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br ${step.color} mb-4 md:mb-6 self-start`}>
                                    <div className="text-black">
                                        {step.icon}
                                    </div>
                                </div>

                                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{step.title}</h3>
                                <p className="text-sm md:text-base text-gray-400 flex-grow">{step.description}</p>

                                {/* Animated Line */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} rounded-b-2xl`}
                                    initial={{ width: "0%" }}
                                    whileInView={{ width: "100%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Animated Rings */}
                <div className="absolute top-1/4 -left-40 w-96 h-96 hidden md:block opacity-20 pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-[#9131e7]/20 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-10 border-2 border-[#ffcc4d]/20 rounded-full"
                    />
                </div>

                {/* Why REX Token */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 md:mb-20"
                >
                    <div className="text-center mb-8 md:mb-12 px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Choose <span className="text-[#9131e7]">REX Token</span>?
                        </h2>
                        <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            We combine cutting-edge technology with sustainable tokenomics to create
                            the perfect platform for passive income generation.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-[#10101a] border border-gray-800/50 rounded-2xl p-6 text-center"
                            >
                                <div className="inline-flex p-3 bg-[#9131e7]/20 rounded-xl mb-4">
                                    <div className="text-[#9131e7]">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h4 className="text-lg md:text-xl font-bold mb-2">{feature.title}</h4>
                                <p className="text-sm md:text-base text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Platform Features Tabs */}
                <div className="bg-[#10101a] border border-gray-800/50 rounded-2xl md:rounded-3xl p-4 md:p-8">
                    <div className="text-center mb-8 md:mb-10 px-2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Platform <span className="text-[#ffcc4d]">Features</span>
                        </h2>
                        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Explore our comprehensive features designed to maximize your earnings
                        </p>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-10">
                        {[
                            { id: "referral", label: "Referral", icon: "👥" },
                            { id: "tokenomics", label: "Tokenomics", icon: "📊" }
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold flex items-center space-x-2 transition-all ${activeTab === tab.id
                                    ? "bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] text-black"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px] md:min-h-[400px]">

                        {/* Referral Tab */}
                        {activeTab === "referral" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="text-center mb-6 md:mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">10-Level Referral System</h3>
                                    <p className="text-sm md:text-base text-gray-300 px-4">Earn commissions from your entire network tree automatically</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                                    {referralLevels.map((level, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.05 }}
                                            className={`bg-gradient-to-br ${level.color} rounded-2xl p-4 md:p-6 text-center text-black`}
                                        >
                                            <div className="text-3xl md:text-4xl font-black mb-1">L{level.level}</div>
                                            <div className="text-2xl md:text-3xl font-bold">{level.percentage}</div>
                                            <div className="text-[10px] md:text-xs opacity-90 uppercase font-bold tracking-wider mt-1">Comm</div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Referral Tree Visualization */}
                                <div className="mt-8 md:mt-10 p-4 md:p-6 bg-black/30 rounded-2xl border border-gray-700/50">
                                    <h4 className="text-lg md:text-xl font-bold mb-4 text-center">📊 Earnings Realization</h4>
                                    <div className="space-y-3">
                                        {[
                                            { level: "Direct (Level 1)", earnings: "5% Reward", color: "bg-purple-500" },
                                            { level: "Level 2 Network", earnings: "2% Reward", color: "bg-blue-500" },
                                            { level: "Level 3-5 Network", earnings: "Up to 1.5%", color: "bg-green-500" },
                                            { level: "Level 6-10 Network", earnings: "Up to 0.75%", color: "bg-yellow-500" }
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/20">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                                                    <span className="text-xs md:text-sm text-gray-300">{item.level}</span>
                                                </div>
                                                <span className="text-[#ffcc4d] font-bold text-xs md:text-sm">{item.earnings}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Tokenomics Tab */}
                        {activeTab === "tokenomics" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Left - Price Boxes */}
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                                            <span className="mr-2">💰</span> Price Statistics
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            {tokenomicsData.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 md:p-6 text-center"
                                                >
                                                    <div className="text-xl md:text-2xl font-bold text-[#ffcc4d] mb-1">
                                                        {item.value}
                                                    </div>
                                                    {item.change && (
                                                        <div className="text-[10px] md:text-xs text-green-400 font-bold mb-1">{item.change}</div>
                                                    )}
                                                    <div className="text-sm md:text-base font-bold text-gray-200">{item.label}</div>
                                                    {item.sub && <div className="text-[10px] md:text-xs text-gray-500">{item.sub}</div>}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Price Chart */}
                                        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-black/30 rounded-2xl border border-gray-700/50">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-lg md:text-xl font-bold">📈 Price Curve</h4>
                                                <span className="text-xs md:text-sm text-green-400 font-bold px-2 py-1 bg-green-400/10 rounded-full">+5% Growth</span>
                                            </div>
                                            <div className="h-32 md:h-40 relative">
                                                {/* Simulated Chart */}
                                                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                                                    <path
                                                        d="M0,120 C50,100 100,130 150,90 C200,60 250,110 300,70 C350,30 400,90 400,90"
                                                        stroke="#9131e7"
                                                        strokeWidth="3"
                                                        fill="none"
                                                    />
                                                    <path
                                                        d="M0,120 C50,100 100,130 150,90 C200,60 250,110 300,70 C350,30 400,90 400,90 L400,150 L0,150 Z"
                                                        fill="url(#gradient)"
                                                        opacity="0.3"
                                                    />
                                                    <defs>
                                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                            <stop offset="0%" stopColor="#9131e7" stopOpacity="0.8" />
                                                            <stop offset="100%" stopColor="#9131e7" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right - Distribution */}
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
                                            <span className="mr-2">📊</span> Distribution
                                        </h3>

                                        {/* Distribution Chart */}
                                        <div className="space-y-4 md:space-y-5 mb-8">
                                            {[
                                                { label: "Community & Staking", percent: 40, color: "bg-[#9131e7]" },
                                                { label: "Team & Development", percent: 20, color: "bg-[#ffcc4d]" },
                                                { label: "Liquidity Pool", percent: 25, color: "bg-[#10b981]" },
                                                { label: "Marketing", percent: 15, color: "bg-[#3b82f6]" }
                                            ].map((item, index) => (
                                                <div key={index} className="space-y-1.5 md:space-y-2">
                                                    <div className="flex justify-between text-xs md:text-sm">
                                                        <span className="text-gray-300">{item.label}</span>
                                                        <span className="font-bold text-white">{item.percent}%</span>
                                                    </div>
                                                    <div className="h-2 md:h-2.5 bg-gray-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${item.percent}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 1, delay: index * 0.2 }}
                                                            className={`h-full ${item.color} rounded-full`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Additional Info */}
                                        <div className="p-4 md:p-6 bg-gradient-to-br from-[#9131e7]/10 to-[#ffcc4d]/10 border border-[#9131e7]/20 rounded-2xl">
                                            <h4 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tighter">📋 Token Specs</h4>
                                            <div className="space-y-2 md:space-y-3">
                                                {[
                                                    { label: "Token Name", value: "REX Token" },
                                                    { label: "Symbol", value: "REX" },
                                                    { label: "Network", value: "BSC (BEP-20)" },
                                                    { label: "Contract", value: "Verified ✅" }
                                                ].map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-800/40 last:border-0">
                                                        <span className="text-xs md:text-sm text-gray-400">{item.label}</span>
                                                        <span className="text-xs md:text-sm font-bold text-gray-200">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;