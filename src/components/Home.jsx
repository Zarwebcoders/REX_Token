import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);
    const navigate = useNavigate()

    const texts = ["Earn Monthly Rewards", "Build Passive Income", "Get Monthly Returns", "Join Web3 Revolution"];

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % texts.length;
            const fullText = texts[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 80 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed, texts]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e] text-white overflow-hidden">

            {/* Animated Background Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-[2px] h-[2px] bg-[#9131e7]/30 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight
                        }}
                        animate={{
                            y: [null, Math.random() * 100 - 50],
                            opacity: [0.2, 0.8, 0.2]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[#9131e7]/20"
            >
                <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-2 md:space-x-3"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#9131e7] blur-lg opacity-50"></div>
                            <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#9131e7] to-[#ffcc4d] rounded-lg flex items-center justify-center text-black font-bold text-lg md:text-xl">
                                R
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] bg-clip-text text-transparent">
                                REX TOKEN
                            </h1>
                        </div>
                    </motion.div>

                    <div className="flex gap-2 md:gap-5">
                        {/* Log In Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { navigate("/login") }}
                            className="group relative px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] text-black font-bold rounded-full overflow-hidden text-xs md:text-base"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                            <span className="flex items-center space-x-1 md:space-x-2 relative z-10">
                                <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                                <span>Log In</span>
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-[#9131e7]/20 to-[#ffcc4d]/20 border border-[#9131e7]/40 rounded-full mb-6 md:mb-8"
                >
                    <span className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#9131e7] rounded-full animate-pulse"></span>
                        <span className="text-[10px] md:text-sm font-semibold whitespace-nowrap uppercase tracking-wider">LIVE ON BINANCE SMART CHAIN</span>
                    </span>
                </motion.div>

                {/* Typewriter Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4 md:mb-6"
                >
                    <div className="text-2xl sm:text-3xl md:text-5xl font-bold min-h-[1.2em]">
                        <span className="bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] bg-clip-text text-transparent">
                            {text}
                        </span>
                        <span className="ml-1 animate-pulse">|</span>
                    </div>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 md:mb-6"
                >
                    Build Passive Income
                    <span className="block bg-gradient-to-r from-[#9131e7] via-[#ffcc4d] to-[#9131e7] bg-clip-text text-transparent">
                        with REX Token
                    </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10 md:mb-12 leading-relaxed"
                >
                    Stake REX tokens and earn <span className="text-[#ffcc4d] font-bold">Up to 2% monthly</span>.
                    Build a <span className="text-[#9131e7] font-bold">10-level network</span>.
                </motion.p>

                {/* Stats Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
                    {[
                        {
                            title: "Monthly Returns",
                            value: "Up to 2%",
                            description: "Per month",
                            color: "from-[#9131e7] to-[#a855f7]"
                        },
                        {
                            title: "Staking Levels",
                            value: "10",
                            description: "Multi-level referral system",
                            color: "from-[#10b981] to-[#34d399]"
                        },
                        {
                            title: "Commission",
                            value: "Up to 5%",
                            description: "Per referral level",
                            color: "from-[#3b82f6] to-[#60a5fa]"
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{
                                scale: 1.02,
                                translateY: -5,
                                boxShadow: "0 10px 30px rgba(145, 49, 231, 0.2)"
                            }}
                            className="group relative bg-[#10101a] border border-gray-800/50 rounded-2xl p-4 md:p-6 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                            <div className="relative z-10">
                                <div className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">{stat.value}</div>
                                <div className="text-lg md:text-xl font-semibold text-gray-200 mb-1 md:mb-2">{stat.title}</div>
                                <div className="text-xs md:text-sm text-gray-400">{stat.description}</div>
                            </div>
                            <motion.div
                                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { navigate("/signup") }}
                        className="group relative px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] text-black font-bold rounded-full text-base md:text-lg w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-white/30 translate-x-[-150%] group-hover:translate-x-[0%] rounded-full transition-transform duration-500"></div>
                        <span className="flex items-center justify-center space-x-3 relative z-10">
                            <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                            <span>Join Now</span>
                        </span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-6 md:px-8 py-3.5 md:py-4 border-2 border-[#9131e7] text-[#9131e7] font-bold rounded-full text-base md:text-lg overflow-hidden w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-[#9131e7] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 group-hover:text-white transition-colors flex justify-center">
                            Learn More
                        </span>
                    </motion.button>
                </motion.div>

                {/* Bottom Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex flex-wrap justify-center gap-4 md:gap-6"
                >
                    {[
                        { text: "Verified", icon: "✓", color: "from-green-500 to-emerald-400" },
                        { text: "Secure", icon: "🛡️", color: "from-blue-500 to-cyan-400" },
                        { text: "BSC", icon: "⚡", color: "from-[#f0b90b] to-[#ffcc4d]" }
                    ].map((badge, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            className={`px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r ${badge.color} rounded-full flex items-center space-x-2 md:space-x-3 shadow-lg`}
                        >
                            <span className="text-sm md:text-xl">{badge.icon}</span>
                            <span className="font-bold text-black text-xs md:text-sm">{badge.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Animated Rings */}
                <div className="absolute top-1/4 -right-20 md:-right-0 w-64 h-64 md:w-96 md:h-96 opacity-30 md:opacity-100 pointer-events-none">
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
            </main>

            {/* Floating Token */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#9131e7] to-[#ffcc4d] rounded-full flex items-center justify-center shadow-2xl z-40"
            >
                <span className="text-black text-sm md:text-2xl font-bold">REX</span>
            </motion.div>

            <HowItWorks />
            <FAQ />
        </div>
    );
}