"use client"

import { useState } from "react"
import CryptoCard from "../components/CryptoCard"
import client from "../api/client"

export default function Shopping() {
    const [cryptos, setCryptos] = useState([
        { id: 1, name: "Bitcoin", symbol: "BTC", price: 42500, change: 2.5, image: "₿" },
        { id: 2, name: "Ethereum", symbol: "ETH", price: 2250, change: 1.8, image: "Ξ" },
        { id: 3, name: "Litecoin", symbol: "LTC", price: 95.5, change: -0.5, image: "Ł" },
        { id: 4, name: "Ripple", symbol: "XRP", price: 2.45, change: 3.2, image: "✕" },
        { id: 5, name: "Cardano", symbol: "ADA", price: 0.98, change: 1.1, image: "◆" },
        { id: 6, name: "Solana", symbol: "SOL", price: 178.5, change: 5.3, image: "◎" },
    ])

    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(false)

    const handleAddToCart = (crypto) => {
        setCartItems((prev) => [...prev, crypto])
    }

    const handleRemoveFromCart = (index) => {
        setCartItems((prev) => prev.filter((_, i) => i !== index))
    }

    const totalCartValue = cartItems.reduce((sum, item) => sum + item.price, 0)

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        try {
            await client.post('/transactions', {
                type: 'purchase',
                amount: totalCartValue,
                description: `Purchase of ${cartItems.map(c => c.symbol).join(', ')}`,
                crypto: 'None' // or mixed
            });
            alert('Purchase successful!');
            setCartItems([]);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Purchase failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full space-y-8">
            <h2 className="text-4xl font-bold text-white mb-2">Crypto Shopping</h2>
            <p className="text-[#b0b0b0] text-lg">Buy and manage your cryptocurrency portfolio</p>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-2xl font-bold text-[#9131e7]">Available Cryptocurrencies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cryptos.map((crypto) => (
                            <CryptoCard key={crypto.id} crypto={crypto} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                </div>

                <aside className="lg:col-span-1 bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-6 rounded-xl border border-[#444] h-fit sticky top-8">
                    <h3 className="text-2xl font-bold text-[#9131e7] mb-6">Shopping Cart</h3>
                    {cartItems.length === 0 ? (
                        <p className="text-[#b0b0b0] text-center py-8">Your cart is empty</p>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                {cartItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#444]"
                                    >
                                        <div>
                                            <p className="font-semibold text-white">{item.symbol}</p>
                                            <p className="text-sm text-[#b0b0b0]">₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(index)}
                                            className="text-red-500 hover:text-red-400 text-lg font-bold transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-[#444] pt-4 mb-4">
                                <p className="text-white font-bold">
                                    Total: <span className="text-[#9131e7]">₹{totalCartValue.toFixed(2)}</span>
                                </p>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`w-full px-6 py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-[#040408] font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                        </>
                    )}
                </aside>
            </div>
        </div>
    )
}
