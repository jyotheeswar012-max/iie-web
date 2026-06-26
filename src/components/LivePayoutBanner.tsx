'use client'
import { useEffect, useState } from 'react'

const EVENTS = [
  { farmer:'Raju Patil',    loc:'Barmer, RJ',   amt:'₹48,200', type:'Drought',  time: 0   },
  { farmer:'Anita Devi',   loc:'Puri, OD',     amt:'₹32,800', type:'Flood',    time: 3000 },
  { farmer:'Vijay Singh',  loc:'Ludhiana, PB', amt:'₹62,500', type:'Drought',  time: 6000 },
  { farmer:'Meena Kumari', loc:'Nashik, MH',   amt:'₹28,400', type:'Heatwave', time: 9000 },
  { farmer:'Suresh Rao',   loc:'Khammam, TG',  amt:'₹41,100', type:'Flood',    time: 12000 },
  { farmer:'Priya Sharma', loc:'Latur, MH',    amt:'₹55,700', type:'Heatwave', time: 15000 },
]

export default function LivePayoutBanner() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(p => (p + 1) % EVENTS.length)
        setVisible(true)
      }, 300)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const e = EVENTS[idx]
  return (
    <div className="rounded-2xl px-5 py-3 flex items-center justify-between flex-wrap gap-3 transition-all duration-300" style={{
      background: 'linear-gradient(90deg, rgba(63,185,80,0.08), rgba(100,255,218,0.05))',
      border: '1px solid rgba(63,185,80,0.25)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-4px)'
    }}>
      <div className="flex items-center gap-3">
        <span className="pulse-dot" />
        <span className="text-[#3fb950] font-black text-sm">LIVE PAYOUT</span>
        <span className="text-white/60 text-sm">{e.farmer} · {e.loc}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-black text-xl text-[#64ffda]">{e.amt}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#3fb950]/15 border border-[#3fb950]/30 text-[#3fb950] font-bold">{e.type} ✓</span>
        <span className="text-[11px] text-white/30">Auto-credited · 0 claims filed</span>
      </div>
    </div>
  )
}
