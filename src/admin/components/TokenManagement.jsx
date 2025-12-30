"use client"

import { useState, useEffect } from "react"
import client from "../../api/client"
import { adminSetPhaseAndPrice, adminRevertTokens } from "../../utils/contractUtils"

export default function TokenManagement() {
    const [priceData, setPriceData] = useState({
        price: "",
        phase: ""
    })
    const [recoveryData, setRecoveryData] = useState({
        wallet: "",
        amount: ""
    })
    const [priceLoading, setPriceLoading] = useState(false)
    const [recoveryLoading, setRecoveryLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        const fetchTokenPrice = async () => {
            try {
                const { data } = await client.get('/token/price');

                // Extract phase number from "Phase 1", "Phase 2", etc.
                const phaseNumber = data.phase ? data.phase.replace(/\D/g, '') : '1';

                setPriceData({
                    price: data.price.toString(),
                    phase: phaseNumber
                });
            } catch (error) {
                console.error("Error fetching token price:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchTokenPrice();
    }, []);

    const handleUpdatePrice = async (e) => {
        e.preventDefault();

        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert("❌ MetaMask not detected!\n\nPlease install MetaMask extension to execute blockchain transactions.");
            return;
        }

        setPriceLoading(true);
        try {
            // Step 1: Update on blockchain first
            console.log("Calling blockchain with phase:", priceData.phase, "price:", priceData.price);

            const phaseNumber = parseInt(priceData.phase);
            const priceNumber = parseFloat(priceData.price);

            // Validate inputs
            if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 21) {
                throw new Error("Phase must be a number between 1 and 21");
            }
            if (isNaN(priceNumber) || priceNumber <= 0) {
                throw new Error("Price must be a positive number");
            }

            const contractResult = await adminSetPhaseAndPrice(
                phaseNumber,
                priceNumber
            );

            if (!contractResult.success) {
                throw new Error(contractResult.error || "Failed to update on blockchain");
            }

            // Step 2: Update in database
            await client.post('/token/price', {
                price: priceNumber,
                phase: `Phase ${phaseNumber}` // Store as "Phase 1", "Phase 2", etc. in database
            });

            alert(`✅ Success!\n\nBlockchain: Phase ${phaseNumber} and price ${priceNumber} INR updated\nTx Hash: ${contractResult.txHash}\n\nDatabase: Updated successfully`);
        } catch (error) {
            console.error("Error updating price:", error);
            alert(error.message || error.response?.data?.message || "Failed to update price");
        } finally {
            setPriceLoading(false);
        }
    };

    const handleRecoverTokens = async (e) => {
        e.preventDefault();

        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert("❌ MetaMask not detected!\n\nPlease install MetaMask extension to execute blockchain transactions.");
            return;
        }

        if (!window.confirm(`Are you sure you want to recover ${recoveryData.amount} tokens from ${recoveryData.wallet}?\n\nThis will:\n1. Revert tokens on blockchain\n2. Deduct from user's balance in database\n\nThis action is irreversible!`)) {
            return;
        }

        setRecoveryLoading(true);
        try {
            // Step 1: Revert tokens on blockchain first
            console.log("Reverting tokens from:", recoveryData.wallet, "amount:", recoveryData.amount);

            const contractResult = await adminRevertTokens(
                recoveryData.wallet,
                recoveryData.amount,
                true // adjustInvestment = true
            );

            if (!contractResult.success) {
                throw new Error(contractResult.error || "Failed to revert tokens on blockchain");
            }

            // Step 2: Update in database
            const { data } = await client.post('/token/recover', recoveryData);

            alert(`✅ Success!\n\nBlockchain: ${recoveryData.amount} tokens reverted\nTx Hash: ${contractResult.txHash}\n\nDatabase: ${data.message}`);

            setRecoveryData({
                wallet: "",
                amount: ""
            });
        } catch (error) {
            console.error("Error recovering tokens:", error);
            alert(error.message || error.response?.data?.message || "Failed to recover tokens");
        } finally {
            setRecoveryLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Token Management</h2>
                    <p className="text-gray-400 mt-1">Manage REX token price, phases, and asset recovery</p>
                </div>
            </div>

            {/* Blockchain Status Banner */}
            <div className="bg-gradient-to-r from-[#9131e7]/20 to-[#e3459b]/20 border border-[#9131e7]/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">🔗</div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">Blockchain Integration Active</h3>
                        <p className="text-gray-300 text-xs mt-1">
                            All operations require MetaMask wallet connection. Transactions will be executed on BSC Mainnet.
                        </p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <span className="text-green-400 text-xs font-bold">LIVE</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phase Change / Price Update Section */}
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#9131e7] to-[#e3459b] rounded-lg flex items-center justify-center text-white text-xl">
                            🪙
                        </div>
                        <h3 className="text-xl font-bold text-white">Phase Change & Price</h3>
                    </div>

                    {fetching ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9131e7]"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdatePrice} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Token Price (INR)</label>
                                <input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={priceData.price}
                                    onChange={(e) => setPriceData({ ...priceData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none"
                                    placeholder="e.g. 0.10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Phase Number (1-21)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="21"
                                    value={priceData.phase}
                                    onChange={(e) => setPriceData({ ...priceData, phase: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none"
                                    placeholder="e.g. 1"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={priceLoading}
                                className="w-full py-3 bg-gradient-to-r from-[#9131e7] to-[#e3459b] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#9131e7]/30 transition-all disabled:opacity-50"
                            >
                                {priceLoading ? "Updating..." : "Update Price & Phase"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Recover Tokens Section */}
                <div className="bg-[#0f0f1a] rounded-xl p-6 border border-[#9131e7]/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#9131e7] to-[#e3459b] rounded-lg flex items-center justify-center text-white text-xl">
                            🔄
                        </div>
                        <h3 className="text-xl font-bold text-white">Recover Tokens</h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-6">
                        Recover a specific amount of REX tokens from a user account.
                        The recovered tokens will be deducted from the user's balance.
                    </p>

                    <form onSubmit={handleRecoverTokens} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Wallet Address (Old)</label>
                            <input
                                type="text"
                                value={recoveryData.wallet}
                                onChange={(e) => setRecoveryData({ ...recoveryData, wallet: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none"
                                placeholder="0x..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Amount to Recover</label>
                            <input
                                type="number"
                                value={recoveryData.amount}
                                onChange={(e) => setRecoveryData({ ...recoveryData, amount: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1a1a2e] text-white rounded-lg border border-[#9131e7]/30 focus:border-[#9131e7] focus:outline-none"
                                placeholder="e.g. 1000"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={recoveryLoading}
                            className="w-full py-3 bg-red-600/20 text-red-500 border border-red-600/50 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                        >
                            {recoveryLoading ? "Processing..." : "Recover Tokens"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex gap-4">
                    <div className="text-blue-500 text-2xl pt-1">ℹ️</div>
                    <div className="space-y-2">
                        <h4 className="text-white font-bold text-lg">Important Information</h4>
                        <ul className="text-gray-300 text-sm list-disc pl-4 space-y-1">
                            <li><strong>Blockchain Integration:</strong> All operations update both the smart contract and database.</li>
                            <li><strong>Wallet Required:</strong> You must connect your admin wallet (MetaMask) to execute transactions.</li>
                            <li>Price and phase updates are recorded on-chain and instantly reflect for all users.</li>
                            <li>Token recovery reverts tokens from user wallet back to admin wallet on blockchain.</li>
                            <li>All blockchain transactions require gas fees (BNB) and admin confirmation.</li>
                            <li>Transaction hashes are provided for verification on BSCScan.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
