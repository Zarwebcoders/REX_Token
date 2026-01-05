"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import {
    CurrencyDollarIcon,
    ClockIcon,
    ArrowPathIcon,
    BanknotesIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline"
import client from "../api/client"
import { stakeTokens, getStakeInfo, getTokenBalance, switchNetwork } from "../utils/contractUtils"


export default function StakeROI() {
    const [loading, setLoading] = useState(true)
    const [walletAddress, setWalletAddress] = useState("")
    const [stakeAmount, setStakeAmount] = useState("")
    const [balance, setBalance] = useState("0")
    const [submitting, setSubmitting] = useState(false)
    const [stakeData, setStakeData] = useState({
        stakedAmount: "0",
        stakeStartTime: 0,
        timeUntilUnlock: 0,
        isActive: false,
        pendingROI: "0"
    })

    useEffect(() => {
        checkWalletAndFetchData()
    }, [])

    const checkWalletAndFetchData = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0])
                    await fetchData(accounts[0])
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error("Error checking wallet:", error)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }

    const fetchData = async (address) => {
        try {
            setLoading(true)
            const [stakeInfo, tokenBalance] = await Promise.all([
                getStakeInfo(address),
                getTokenBalance(address)
            ])

            setStakeData(stakeInfo)
            setBalance(tokenBalance)
        } catch (error) {
            console.error("Error fetching stake data:", error)
        } finally {
            setLoading(false)
        }
    }

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' })
                await switchNetwork() // Force network switch
                checkWalletAndFetchData()
            } catch (error) {
                console.error("Error connecting wallet:", error)
            }
        } else {
            alert("Please install MetaMask!")
        }
    }

    const handleStake = async (e) => {
        e.preventDefault()

        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            alert("Please enter a valid amount")
            return
        }

        if (parseFloat(stakeAmount) > parseFloat(balance)) {
            alert("Insufficient balance")
            return
        }

        try {
            setSubmitting(true)
            const result = await stakeTokens(stakeAmount)

            if (result.success) {
                // Save transaction to database
                try {
                    await client.post('/transactions', {
                        type: 'stake',
                        amount: parseFloat(stakeAmount),
                        hash: result.txHash,
                        status: 'completed',
                        description: `Staked ${stakeAmount} REX tokens`
                    })
                    console.log("Transaction saved to DB")
                } catch (dbError) {
                    console.error("Error saving transaction to DB:", dbError)
                }

                alert("Tokens staked successfully!")
                setStakeAmount("")
                await fetchData(walletAddress)
            } else {
                alert(`Staking failed: ${result.error}`)
            }
        } catch (error) {
            console.error("Error staking:", error)
            alert("An error occurred while staking")
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return "-"
        return new Date(timestamp * 1000).toLocaleString()
    }

    const formatDuration = (seconds) => {
        if (!seconds || seconds <= 0) return "Unlocked"
        const days = Math.floor(seconds / (24 * 3600))
        const hours = Math.floor((seconds % (24 * 3600)) / 3600)
        return `${days}d ${hours}h`
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9131e7]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Stake ROI</h2>
                    <p className="text-gray-400 mt-1">Stake your tokens to earn high ROI rewards</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Staking Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#9131e7]/30 h-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BanknotesIcon className="w-6 h-6 text-[#9131e7]" />
                            New Stake
                        </h3>

                        {!walletAddress ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">Please connect your wallet to stake tokens</p>
                                <button
                                    onClick={connectWallet}
                                    className="px-6 py-2 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1"
                                >
                                    Connect Wallet
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleStake} className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm text-gray-400">Amount to Stake</label>
                                        <span className="text-xs text-[#9131e7]">Balance: {parseFloat(balance).toFixed(2)} REX</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={stakeAmount}
                                            onChange={(e) => setStakeAmount(e.target.value)}
                                            className="w-full bg-[#0f0f1a] border border-[#9131e7]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#9131e7] transition-colors"
                                            placeholder="0.00"
                                            min="0"
                                            step="any"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setStakeAmount(balance)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-[#9131e7]/20 text-[#9131e7] px-2 py-1 rounded hover:bg-[#9131e7]/30"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-[#0f0f1a] rounded-lg p-4 space-y-3 border border-[#9131e7]/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Lock Period</span>
                                        <span className="text-white">365 Days</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">ROI Rate</span>
                                        <span className="text-[#4caf50]">1.5% Monthly</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || stakeData.isActive}
                                    className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 ${submitting || stakeData.isActive
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#9131e7] to-[#e84495] hover:shadow-lg hover:shadow-[#9131e7]/50 hover:-translate-y-1'
                                        }`}
                                >
                                    {submitting ? 'Staking...' : stakeData.isActive ? 'Active Stake Exists' : 'Stake Tokens'}
                                </button>
                                {stakeData.isActive && (
                                    <p className="text-xs text-yellow-500 text-center mt-2">
                                        You already have an active stake. Unstake or wait for it to finish to stake again.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </motion.div>

                {/* Staking Stats & History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#9131e7]/30">
                                <p className="text-gray-400 text-sm mb-1">Total Staked</p>
                                <p className="text-2xl font-bold text-white">{parseFloat(stakeData.stakedAmount).toFixed(2)} REX</p>
                            </div>
                            <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#9131e7]/30">
                                <p className="text-gray-400 text-sm mb-1">Pending ROI</p>
                                <p className="text-2xl font-bold text-[#4caf50]">{parseFloat(stakeData.pendingROI).toFixed(4)} REX</p>
                            </div>
                            <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#9131e7]/30">
                                <p className="text-gray-400 text-sm mb-1">Status</p>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stakeData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {stakeData.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="bg-[#1a1a2e] rounded-2xl border border-[#9131e7]/30 overflow-hidden">
                            <div className="p-6 border-b border-[#9131e7]/30 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ClockIcon className="w-6 h-6 text-[#9131e7]" />
                                    Staking History
                                </h3>
                                <button
                                    onClick={() => fetchData(walletAddress)}
                                    className="p-2 hover:bg-[#9131e7]/20 rounded-lg transition-colors text-[#9131e7]"
                                >
                                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0f0f1a] text-gray-400 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Staked Amount</th>
                                            <th className="px-6 py-4 font-medium">Start Date</th>
                                            <th className="px-6 py-4 font-medium">Unlock Date</th>
                                            <th className="px-6 py-4 font-medium">Lock Period</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#9131e7]/10 text-gray-300 text-sm">
                                        {stakeData.stakedAmount !== "0" ? (
                                            <tr className="hover:bg-[#9131e7]/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {parseFloat(stakeData.stakedAmount).toFixed(2)} REX
                                                </td>
                                                <td className="px-6 py-4">
                                                    {formatDate(stakeData.stakeStartTime)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {stakeData.stakeStartTime > 0
                                                        ? formatDate(stakeData.stakeStartTime + (365 * 24 * 60 * 60)) // Assuming 365 days lock from utils or contract
                                                        : '-'
                                                    }
                                                </td>
                                                {/* Note: Time until unlock is just remaining time, displaying full period usually better */}
                                                <td className="px-6 py-4">
                                                    365 Days
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stakeData.isActive
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                        }`}>
                                                        {stakeData.isActive ? 'Staking' : 'Completed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No staking history found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
