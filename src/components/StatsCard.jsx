export default function StatsCard({ title, amount, color }) {
    return (
        <div
            className="bg-gradient-to-br from-[#040408] to-[#1f1f1f] p-3 rounded-lg border-l-4 border-[#444] hover:border-l-[#9131e7] transition-all"
            style={{ borderLeftColor: color }}
        >
            <h4 className="text-[#b0b0b0] text-sm mb-2">{title}</h4>
            <p className="text-3xl font-bold text-white mb-2">{amount}</p>
        </div>
    )
}
