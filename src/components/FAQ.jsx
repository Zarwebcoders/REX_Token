import { motion } from "framer-motion";
import { useState } from "react";
import {
    ChevronDown,
    ExternalLink,
    Shield,
    FileText,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Linkedin,
    Send,
    Globe,
    Zap,
    Users,
    TrendingUp,
    Award,
    Lock,
    CheckCircle
} from "lucide-react";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What is REX Token and how does it work?",
            answer: "REX Token is a BEP-20 token on Binance Smart Chain that enables users to earn passive income through staking and referral programs. Users can stake tokens to earn 5% returns and build a 10-level referral network for additional earnings."
        },
        {
            question: "How much can I earn monthly with staking?",
            answer: "You can earn 5% monthly returns on weekdays. This translates to approximately 3.885% weekly and 16.65% monthly on your staked amount. Additionally, you get a 6% holding bonus after 12 months."
        },
        {
            question: "What is the minimum investment required?",
            answer: "The minimum investment required is 100 REX tokens. There are no upper limits, and you can stake any amount above the minimum to start earning."
        },
        {
            question: "How does the 10-level referral system work?",
            answer: "Our referral system allows you to earn commissions from 10 levels of your network. Level 1: 5%, Level 2: 2%, Level 3: 1.5%, Levels 4-6: 1% each, Level 7: 0.75%, Level 8: 0.50%, Levels 9-10: 0.25% each."
        },
        {
            question: "When can I withdraw my earnings?",
            answer: "You can withdraw your staking rewards after 30 days. The principal amount can be withdrawn after the staking period completes (minimum 30 days). Referral earnings are available for withdrawal immediately."
        },
        {
            question: "Is my investment secure?",
            answer: "Yes, our smart contract has been professionally audited and verified. We use industry-standard security protocols, and funds are stored in secure, multi-signature wallets with regular security updates."
        }
    ];

    const stats = [
        {
            label: "ROI (Up to 1L)",
            value: "1% Monthly",
            icon: <TrendingUp className="w-5 h-5" />,
            desc: "For investments ≤ ₹1,00,000"
        },
        {
            label: "ROI (Above 1L)",
            value: "1.5% Monthly",
            icon: <Zap className="w-5 h-5" />,
            desc: "For investments > ₹1,00,000"
        },
        {
            label: "Holding Bonus",
            value: "+6%",
            icon: <Award className="w-5 h-5" />,
            desc: "After 12 months staking"
        },
        {
            label: "Minimum Stake",
            value: "100 REX",
            icon: <CheckCircle className="w-5 h-5" />,
            desc: "Minimum investment required"
        }
    ];

    const footerLinks = {
        features: [
            { name: "Staking Platform", href: "#" },
            { name: "Referral System", href: "#" },
            { name: "Token Analytics", href: "#" },
            { name: "Security Audit", href: "#" }
        ],
        resources: [
            { name: "Whitepaper", href: "#" },
            { name: "Documentation", href: "#" },
            { name: "API Docs", href: "#" },
            { name: "Community", href: "#" }
        ],
        company: [
            { name: "About Us", href: "#" },
            { name: "Careers", href: "#" },
            { name: "Press", href: "#" },
            { name: "Contact", href: "#" }
        ]
    };

    const socialIcons = [
        { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
        { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
        { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
        { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
        { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" }
    ];

    return (
        <div className="pt-10 md:pt-20 pb-0 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 md:mb-20"
                >
                    <div className="text-center mb-10 md:mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                            Frequently Asked <span className="bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] bg-clip-text text-transparent">Questions</span>
                        </h2>
                        <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Find answers to common questions about REX Token staking, referrals, and platform features.
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <motion.button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className={`w-full text-left p-4 md:p-6 rounded-2xl transition-all duration-300 ${openIndex === index
                                        ? 'bg-[#1a1a2e] border border-[#9131e7]/40 ring-1 ring-[#9131e7]/20'
                                        : 'bg-[#10101a] border border-gray-800/50 hover:border-[#9131e7]/40'
                                        }`}
                                    whileHover={{ scale: 1.005 }}
                                    whileTap={{ scale: 0.995 }}
                                >
                                    <div className="flex justify-between items-center gap-4">
                                        <h3 className="text-base md:text-xl font-bold flex-grow pr-2">{faq.question}</h3>
                                        <motion.div
                                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex-shrink-0"
                                        >
                                            <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: openIndex === index ? 'auto' : 0,
                                            opacity: openIndex === index ? 1 : 0,
                                            marginTop: openIndex === index ? '1rem' : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-sm md:text-base text-gray-300 leading-relaxed border-t border-gray-800/30 pt-4">{faq.answer}</p>
                                    </motion.div>
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Ready to Start Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative mb-12 md:mb-20"
                >
                    {/* Animated Rings */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 md:w-96 md:h-96 opacity-20 hidden md:block pointer-events-none">
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
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9131e7]/10 via-[#ffcc4d]/5 to-[#9131e7]/10 rounded-3xl blur-3xl pointer-events-none"></div>

                    <div className="relative bg-[#10101a] border border-[#9131e7]/30 rounded-3xl p-6 md:p-12 overflow-hidden">
                        <div className="text-center mb-8 md:mb-10">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                                Ready to Start <span className="text-[#ffcc4d]">Earning</span>?
                            </h2>
                            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Join thousands of investors who are already earning passive income with REX Token.
                                Get started in minutes with our easy-to-use platform.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-10 md:mb-12">
                            <motion.a
                                href="#"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-6 md:px-8 py-3 md:py-4 bg-[#1a1a2e] border border-[#9131e7]/50 text-white font-bold rounded-full flex items-center justify-center space-x-3 text-sm md:text-base"
                            >
                                <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#9131e7]" />
                                <span>View Contract</span>
                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.a>

                            <motion.a
                                href="#"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-6 md:px-8 py-3 md:py-4 bg-[#ffcc4d] text-black font-bold rounded-full flex items-center justify-center space-x-3 text-sm md:text-base shadow-lg shadow-[#ffcc4d]/20"
                            >
                                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                                <span>Scan Audit</span>
                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.a>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gray-800/20 border border-gray-700/50 rounded-2xl p-5 md:p-6 text-center"
                                >
                                    <div className="inline-flex p-2.5 bg-[#9131e7]/10 rounded-xl mb-3">
                                        <div className="text-[#9131e7]">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-[#ffcc4d] mb-1">{stat.value}</div>
                                    <div className="text-sm md:text-lg font-bold text-gray-200 mb-1">{stat.label}</div>
                                    <div className="text-[10px] md:text-xs text-gray-400">{stat.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800/50 pt-10 md:pt-16 pb-8 bg-[#0a0a0f]">
                <div className="container mx-auto px-4 md:px-6 max-w-7xl">

                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-10 md:mb-16">

                        {/* Brand Section */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#9131e7] to-[#ffcc4d] rounded-lg flex items-center justify-center shadow-lg shadow-[#9131e7]/20">
                                    <span className="text-black font-extrabold text-xl">R</span>
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] bg-clip-text text-transparent tracking-tight">
                                        REX TOKEN
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed max-w-xs">
                                Revolutionizing passive income generation through blockchain technology.
                                Join the future of decentralized finance today.
                            </p>

                            {/* Social Icons */}
                            <div className="flex space-x-3">
                                {socialIcons.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.href}
                                        whileHover={{ scale: 1.15, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-9 h-9 bg-gray-900 border border-gray-800 hover:border-[#9131e7]/50 rounded-full flex items-center justify-center transition-all group"
                                        aria-label={social.label}
                                    >
                                        <div className="text-gray-400 group-hover:text-[#9131e7]">
                                            {social.icon}
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Features Links */}
                        <div className="hidden sm:block">
                            <h4 className="text-lg md:text-xl font-bold mb-6 flex items-center justify-center sm:justify-start">
                                <Zap className="w-5 h-5 mr-2 text-[#9131e7]" />
                                Features
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.features.map((link, index) => (
                                    <motion.li key={index} whileHover={{ x: 5 }}>
                                        <a href={link.href} className="text-sm md:text-base text-gray-400 hover:text-[#ffcc4d] transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 bg-[#9131e7] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                            {link.name}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div className="hidden sm:block">
                            <h4 className="text-lg md:text-xl font-bold mb-6 flex items-center justify-center sm:justify-start">
                                <FileText className="w-5 h-5 mr-2 text-[#9131e7]" />
                                Resources
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.resources.map((link, index) => (
                                    <motion.li key={index} whileHover={{ x: 5 }}>
                                        <a href={link.href} className="text-sm md:text-base text-gray-400 hover:text-[#ffcc4d] transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 bg-[#9131e7] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                            {link.name}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Follow Us Section */}
                        <div className="text-center sm:text-left">
                            <h4 className="text-lg md:text-xl font-bold mb-6 flex items-center justify-center sm:justify-start">
                                <Users className="w-5 h-5 mr-2 text-[#9131e7]" />
                                Subscribe
                            </h4>
                            <p className="text-sm text-gray-400 mb-6">
                                Stay updated with the latest news and announcements from REX.
                            </p>

                            {/* Newsletter Subscription */}
                            <div className="relative max-w-sm mx-auto sm:mx-0">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-sm md:text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#9131e7]/60 transition-colors"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="absolute right-1.5 top-1.5 px-3 py-2 bg-gradient-to-r from-[#9131e7] to-[#ffcc4d] text-black font-bold rounded-lg flex items-center space-x-1.5 text-xs md:text-sm"
                                >
                                    <span>Join</span>
                                    <Send className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-6 space-y-2.5">
                                <div className="flex items-center justify-center sm:justify-start text-xs md:text-sm text-gray-400 group">
                                    <Globe className="w-4 h-4 mr-3 text-gray-600 group-hover:text-[#9131e7] transition-colors" />
                                    <span>support@rextoken.com</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start text-xs md:text-sm text-gray-400 group">
                                    <Lock className="w-4 h-4 mr-3 text-gray-600 group-hover:text-[#9131e7] transition-colors" />
                                    <span>Audited & Verified Contract</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="pt-8 border-t border-gray-800/40">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-gray-500 text-xs md:text-sm order-3 md:order-1 text-center md:text-left">
                                © 2024 REX Token Ecosystem. Building the next-gen DeFi.
                            </div>

                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 order-1 md:order-2">
                                {["Privacy", "Terms", "Cookies", "Disclaimer"].map((item) => (
                                    <a key={item} href="#" className="text-gray-400 hover:text-[#ffcc4d] text-xs md:text-sm transition-colors font-medium">
                                        {item}
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center text-gray-500 text-xs md:text-sm order-2 md:order-3">
                                <span className="flex items-center px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Network: BSC Mainnet
                                </span>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="flex flex-wrap justify-center gap-3 mt-10">
                            {[
                                { text: "SSL Secured", icon: "🔒" },
                                { text: "Verified", icon: "✅" },
                                { text: "Secure", icon: "🛡️" },
                                { text: "Audited", icon: "📋" }
                            ].map((badge, index) => (
                                <motion.div
                                    key={index}
                                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full flex items-center space-x-2 shadow-sm"
                                >
                                    <span className="text-xs">{badge.icon}</span>
                                    <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">{badge.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;