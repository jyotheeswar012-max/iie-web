'use client'
import { useEffect, useState } from 'react'

const ALL_ALERTS = [
  { icon:'🔴', district:'Barmer, RJ',   msg:'NDVI 0.21 — Drought trigger VERIFIED',  level:'CRITICAL', time:'14:32', border:'border-l-red-500',    bg:'bg-red-950/20'    },
  { icon:'🟠', district:'Puri, OD',     msg:'Rainfall 187mm — Flood approaching',   level:'WARNING',  time:'14:28', border:'border-l-orange-500', bg:'bg-orange-950/20' },
  { icon:'🔴', district:'Latur, MH',    msg:'Temp 46.2°C — Heatwave ACTIVATED',     level:'CRITICAL', time:'14:21', border:'border-l-red-500',    bg:'bg-red-950/20'    },
  { icon:'🟢', district:'Ludhiana, PB', msg:'₹34Cr paid to 3,840 farmers — DONE',   level:'PAID',     time:'14:14', border:'border-l-green-500',  bg:'bg-green-950/20'  },
  { icon:'🟠', district:'Adilabad, TG', msg:'Wind 78km/h — Cyclone monitoring ON',  level:'WARNING',  time:'14:08', border:'border-l-orange-500', bg:'bg-orange-950/20' },
  { icon:'🟢', district:'Amritsar, PB', msg:'₹21Cr auto-credited to 2,100 accounts',level:'PAID',     time:'13:58', border:'border-l-green-500',  bg:'bg-green-950/20'  },
  { icon:'🔴', district:'Nashik, MH',   msg:'Drought risk score: 71/100 — HIGH',   level:'CRITICAL', time:'13:44', border:'border-l-red-500',    bg:'bg-red-950/20'    },
  { icon:'🟢', district:'Warangal, TG', msg:'₹12.4Cr payout complete — 1,240 farms',level:'PAID',    time:'13:33', border:'border-l-green-500',  bg:'bg-green-950/20'  },
]

export default function AlertFeed() {
  const [alerts, setAlerts] = useState(ALL_ALERTS.slice(0, 5))
  const [flash, setFlash] = useState(-1)

  useEffect(() => {
    const t = setInterval(() => {
      const next = ALL_ALERTS[Math.floor(Math.random() * ALL_ALERTS.length)]
      setAlerts(prev => [next, ...prev.slice(0, 4)])
      setFlash(0)
      setTimeout(() => setFlash(-1), 600)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-[#e6edf3]">🛡️ Live Alert Feed</h3>
        <span className="badge-live"><span className="pulse-dot" />LIVE</span>
      </div>
      <div className="flex flex-col gap-2">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 border-l-4 transition-all duration-500 ${a.border} ${a.bg} ${
            flash === i ? 'ring-1 ring-[#64ffda]/30 scale-[1.01]' : ''
          }`}>
            <span className="text-lg flex-shrink-0">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#e6edf3] text-sm">{a.district}</div>
              <div className="text-xs text-[#7d8590] mt-0.5 truncate">{a.msg}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] font-bold" style={{ color: a.level==='CRITICAL'?'#f85149':a.level==='PAID'?'#3fb950':'#e3b341' }}>{a.level}</div>
              <div className="text-[10px] text-[#7d8590] font-mono">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
