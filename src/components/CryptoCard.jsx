"use client"

export default function CryptoCard({ crypto, onAddToCart }) {
    const isPositive = crypto.change > 0

    return (
        <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-6 rounded-lg border border-[#444] hover:border-[#9131e7] transition-all hover:shadow-lg hover:shadow-[#9131e7]/20">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9131e7] to-[#e84495] flex items-center justify-center text-2xl font-bold text-[#040408]">
                    {crypto.image}
                </div>
                <div>
                    <h4 className="text-white font-bold">{crypto.name}</h4>
                    <p className="text-sm text-[#b0b0b0]">{crypto.symbol}</p>
                </div>
            </div>
            <div className="mb-4">
                <p className="text-2xl font-bold text-white">₹{crypto.price.toFixed(2)}</p>
                <p className={`text-sm font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? "↑" : "↓"} {Math.abs(crypto.change)}%
                </p>
            </div>
            <button
                onClick={() => onAddToCart(crypto)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-[#040408] font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
                Add to Cart
            </button>
        </div>
    )
}
