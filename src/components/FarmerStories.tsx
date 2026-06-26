'use client'
import { useState } from 'react'

const STORIES = [
  {
    name:'Raju Patil', loc:'Barmer, Rajasthan', crop:'Cotton · 8 acres', emoji:'🌻', state:'RJ',
    before:'46.4°C heatwave hit June 12. Cotton wilting in 48 hours. Nearest bank 40km away.',
    after:'IIE detected at 06:14. ₹48,200 credited by 07:51. Raju hadn\'t filed a single form.',
    payout:'₹48,200', time:'97 min', trigger:'Heatwave', confidence:'94%',
    quote:'"I didn\'t even know I had been paid. My phone just beeped."'
  },
  {
    name:'Anita Devi', loc:'Puri, Odisha', crop:'Paddy · 4 acres', emoji:'🌾', state:'OD',
    before:'Cyclone Remal: 218mm rain in 6 hours. Fields submerged. Electricity out for 3 days.',
    after:'Flood verified via satellite at 03:32. ₹32,800 credited at 05:18. Power still off.',
    payout:'₹32,800', time:'106 min', trigger:'Flood', confidence:'97%',
    quote:'"The money came when I was asleep. That\'s when I knew this was real."'
  },
  {
    name:'Vijay Singh', loc:'Ludhiana, Punjab', crop:'Wheat · 12 acres', emoji:'🌿', state:'PB',
    before:'NDVI 0.24 detected — below drought threshold of 0.30 for 11 consecutive days.',
    after:'Drought confirmed by 3/4 sources. ₹62,500 sent before Vijay woke up at 7am.',
    payout:'₹62,500', time:'78 min', trigger:'Drought', confidence:'91%',
    quote:'"Other farmers still waiting for PMFBY since 2022. I got paid in 78 minutes."'
  },
]

export default function FarmerStories() {
  const [active, setActive] = useState(0)
  const s = STORIES[active]
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-[#e6edf3]">👨‍🌾 Real Farmers. Real Payouts.</h3>
        <div className="flex gap-1.5">
          {STORIES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                active === i ? 'bg-[#64ffda] w-6' : 'bg-[#21262d] hover:bg-[#484f58]'
              }`} />
          ))}
        </div>
      </div>
      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden h-auto">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-[#21262d]" style={{ background: 'linear-gradient(90deg, rgba(100,255,218,0.05), transparent)' }}>
          <div className="text-4xl">{s.emoji}</div>
          <div className="flex-1">
            <div className="font-black text-[#e6edf3]">{s.name}</div>
            <div className="text-xs text-[#7d8590]">{s.loc} · {s.crop}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-[#3fb950]">{s.payout}</div>
            <div className="text-[10px] text-[#7d8590]">⏱ {s.time}</div>
          </div>
        </div>
        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3">
            <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">🔴 Event Detected</div>
            <div className="text-xs text-red-200">{s.before}</div>
          </div>
          <div className="bg-green-950/30 border border-green-900/40 rounded-xl p-3">
            <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">✅ Auto-Payout Triggered</div>
            <div className="text-xs text-green-200">{s.after}</div>
          </div>
          <div className="flex gap-2">
            <span className="text-[11px] px-2 py-1 rounded-lg bg-[#82b1ff]/10 border border-[#82b1ff]/20 text-[#82b1ff] font-bold">{s.trigger}</span>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-[#64ffda]/10 border border-[#64ffda]/20 text-[#64ffda] font-bold">Confidence: {s.confidence}</span>
          </div>
          <div className="text-sm italic text-[#7d8590] border-l-2 border-[#64ffda]/40 pl-3">{s.quote}</div>
        </div>
      </div>
    </div>
  )
}
