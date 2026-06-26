const STORIES = [
  { name:'Raju Patil',  loc:'Barmer, Rajasthan · Cotton · 8 acres', emoji:'🌻',
    before:'🔴 46.4°C heatwave hit June 12. Cotton crop wilting within 48 hours.',
    after: '✅ IIE detected trigger at 06:14. Policy matched. ₹48,200 credited by 07:51.',
    payout:'₹48,200', time:'Settled in 97 minutes' },
  { name:'Anita Devi',  loc:'Puri, Odisha · Paddy · 4 acres', emoji:'🌾',
    before:'🔴 Cyclone Remal: 218mm rain in 6 hours. Fields submerged.',
    after: '✅ Flood trigger verified at 03:32 via IMD + NASA. ₹32,800 credited at 05:18.',
    payout:'₹32,800', time:'Settled in 106 minutes' },
  { name:'Vijay Singh', loc:'Ludhiana, Punjab · Wheat · 12 acres', emoji:'🌿',
    before:'🟠 NDVI reading 0.24 — well below drought threshold of 0.30.',
    after: '✅ Drought confirmed across 3/4 sources. ₹62,500 sent before Vijay woke up.',
    payout:'₹62,500', time:'Settled in 78 minutes' },
]

export default function FarmerStories() {
  return (
    <div>
      <h3 className="text-base font-black text-brand-text mb-3">👨‍🌾 Real Farmer. Real Payout.</h3>
      <div className="flex flex-col gap-3">
        {STORIES.map((s,i) => (
          <div key={i} className="bg-brand-card border border-brand-border rounded-xl p-4 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <div className="font-bold text-brand-text text-sm">{s.name}</div>
                <div className="text-[11px] text-brand-muted">{s.loc}</div>
              </div>
            </div>
            <div className="bg-red-950/40 border border-red-900/30 rounded-lg px-3 py-2 text-xs text-red-300 mb-2">{s.before}</div>
            <div className="bg-green-950/40 border border-green-900/30 rounded-lg px-3 py-2 text-xs text-green-300 mb-2">{s.after}</div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-brand-green">{s.payout}</span>
              <span className="text-[11px] text-brand-muted">⏱ {s.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
