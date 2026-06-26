const STORIES = [
  { name:'Raju Patil',  loc:'Barmer, Rajasthan · Cotton · 8 acres', emoji:'🌻',
    before:'🔴 46.4°C heatwave hit June 12. Cotton wilting in 48 hours.',
    after:'✅ IIE detected at 06:14. ₹48,200 credited by 07:51.',
    payout:'₹48,200', time:'97 minutes' },
  { name:'Anita Devi',  loc:'Puri, Odisha · Paddy · 4 acres', emoji:'🌾',
    before:'🔴 Cyclone Remal: 218mm rain in 6 hours. Fields submerged.',
    after:'✅ Flood verified 03:32. ₹32,800 credited at 05:18.',
    payout:'₹32,800', time:'106 minutes' },
  { name:'Vijay Singh', loc:'Ludhiana, Punjab · Wheat · 12 acres', emoji:'🌿',
    before:'🟠 NDVI 0.24 — below drought threshold of 0.30.',
    after:'✅ Drought confirmed 3/4 sources. ₹62,500 sent before Vijay woke up.',
    payout:'₹62,500', time:'78 minutes' },
]
export default function FarmerStories() {
  return (
    <div>
      <h3 className="text-base font-black text-[#e6edf3] mb-3">👨‍🌾 Real Farmer. Real Payout.</h3>
      <div className="flex flex-col gap-3">
        {STORIES.map((s,i) => (
          <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <div className="font-bold text-[#e6edf3] text-sm">{s.name}</div>
                <div className="text-[11px] text-[#7d8590]">{s.loc}</div>
              </div>
            </div>
            <div className="bg-red-950/40 border border-red-900/30 rounded-lg px-3 py-2 text-xs text-red-300 mb-2">{s.before}</div>
            <div className="bg-green-950/40 border border-green-900/30 rounded-lg px-3 py-2 text-xs text-green-300 mb-2">{s.after}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-[#3fb950]">{s.payout}</span>
              <span className="text-[11px] text-[#7d8590]">⏱ {s.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
