export default function PackageCard({ package: pkg }) {
    return (
        <div className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-4 md:p-6 rounded-lg border border-[#444] hover:border-[#9131e7] transition-all hover:shadow-lg hover:shadow-[#9131e7]/20">
            <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b border-[#444]">
                <h3 className="text-xl md:text-2xl font-bold text-white">{pkg.name}</h3>
            </div>

            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-[#9131e7]/10 rounded-lg border border-[#9131e7]/30">
                <p className="text-[#9131e7] font-bold text-sm md:text-base">{pkg.daily_return}% Daily Return</p>
            </div>

            {/* Investment Details - Added the product and token value text */}
            <div className="mb-3 md:mb-4 p-2 md:p-3 bg-[#1a1a2e]/50 rounded-lg border border-[#444]">
                <p className="text-white text-xs md:text-sm leading-relaxed">
                    {pkg.productValue}
                </p>
            </div>

            {/* Connect Wallet Button */}
            <button className="w-full px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#9131e7] to-[#e84495] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#9131e7]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 text-sm md:text-base">
                Connect Wallet
            </button>
        </div>
    )
}