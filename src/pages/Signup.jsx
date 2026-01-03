"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import client from "../api/client"

const DEFAULT_REFERRAL = "0x74ae39494670430c029c4e75af6c1fd80512654d"; // Default admin wallet

export default function Signup({ setIsAuthenticated }) {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
    })
    const [error, setError] = useState("")
    const navigate = useNavigate()

    // Extract ref parameter from URL on component mount
    useEffect(() => {
        const refParam = searchParams.get('ref');

        if (refParam) {
            // Use ref from URL
            setFormData(prev => ({ ...prev, referralCode: refParam }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (formData.name && formData.email && formData.password) {
            try {
                const { _id, confirmPassword, ...registerData } = formData; // Remove confirmPassword
                const { data } = await client.post('/auth/register', registerData);

                // Store user data
                localStorage.setItem('user', JSON.stringify(data));

                setIsAuthenticated(true)
                navigate("/dashboard")
            } catch (err) {
                setError(err.response?.data?.message || "Registration failed");
            }
        } else {
            setError("Please fill all required fields")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#040408] to-[#1a1a1a] animate-fade-in">
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        .animate-slide-up:nth-child(1) { animation-delay: 0.1s; }
        .animate-slide-up:nth-child(2) { animation-delay: 0.2s; }
        .animate-slide-up:nth-child(3) { animation-delay: 0.3s; }
        .animate-slide-up:nth-child(4) { animation-delay: 0.4s; }
        .animate-slide-up:nth-child(5) { animation-delay: 0.5s; }
        .animate-slide-up:nth-child(6) { animation-delay: 0.6s; }
      `}</style>

            <div className="w-full max-w-md">
                <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-8 rounded-xl shadow-2xl border border-[#444] backdrop-blur-xl">
                    <div className="text-center mb-8 animate-slide-up">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9131e7] to-[#e84495] bg-clip-text text-transparent mb-2">
                            REX TOKEN
                        </h1>
                        <p className="text-[#b0b0b0] text-lg">Create Your Account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="animate-slide-up">
                            <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all duration-300 placeholder-[#666]"
                            />
                        </div>

                        <div className="animate-slide-up">
                            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all duration-300 placeholder-[#666]"
                            />
                        </div>

                        <div className="animate-slide-up">
                            <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all duration-300 placeholder-[#666]"
                            />
                        </div>

                        <div className="animate-slide-up">
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all duration-300 placeholder-[#666]"
                            />
                        </div>

                        <div className="animate-slide-up">
                            <label htmlFor="referralCode" className="block text-sm font-semibold text-white mb-2">
                                Referral Code (Sponsor Wallet Address)
                            </label>
                            <input
                                id="referralCode"
                                type="text"
                                name="referralCode"
                                placeholder="Referral Code or Sponsor Wallet (Optional)"
                                value={formData.referralCode}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#9131e7] focus:ring-2 focus:ring-[#9131e7]/30 transition-all duration-300 placeholder-[#666]"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {!formData.referralCode
                                    ? "Leave empty to use system default wallet address (Admin)"
                                    : "Sponsor Wallet or Code applied"}
                            </p>
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-red-600/20 border border-red-500/50 text-red-300 rounded-lg text-sm animate-slide-up">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-[#040408] font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 animate-slide-up"
                        >
                            Create Account
                        </button>
                    </form>

                    <p className="text-center text-[#b0b0b0] mt-6 animate-slide-up">
                        Already have an account?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-[#9131e7] font-bold hover:text-[#e84495] transition-colors duration-300"
                        >
                            Login Here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
