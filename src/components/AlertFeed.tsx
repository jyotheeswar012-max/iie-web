const ALERTS = [
  { icon:'🔴', district:'Barmer, RJ',   msg:'NDVI 0.21 — Drought trigger verified',  level:'CRITICAL', time:'14:32', border:'border-red-700',    bg:'bg-red-950/30'    },
  { icon:'🟠', district:'Puri, OD',     msg:'Rainfall 187mm — approaching flood',   level:'WARNING',  time:'14:21', border:'border-orange-700', bg:'bg-orange-950/30' },
  { icon:'🔴', district:'Latur, MH',    msg:'Temp 46.2°C — Heatwave activated',     level:'CRITICAL', time:'14:08', border:'border-red-700',    bg:'bg-red-950/30'    },
  { icon:'🟢', district:'Ludhiana, PB', msg:'₹34Cr paid to 3,840 farmers — done',  level:'SAFE',     time:'13:52', border:'border-green-700',  bg:'bg-green-950/30'  },
  { icon:'🟠', district:'Adilabad, TG', msg:'Wind 78km/h — monitoring cyclone',     level:'WARNING',  time:'13:39', border:'border-orange-700', bg:'bg-orange-950/30' },
  { icon:'🟢', district:'Amritsar, PB', msg:'₹21Cr auto-credited to 2,100 accounts',level:'SAFE',     time:'13:18', border:'border-green-700',  bg:'bg-green-950/30'  },
]
export default function AlertFeed() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-black text-[#e6edf3]">🛡️ Live Alert Feed</h3>
        <span className="flex items-center gap-1.5 text-xs text-[#3fb950]"><span className="pulse-dot" /> LIVE</span>
      </div>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {ALERTS.map((a,i) => (
          <div key={i} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 border-l-4 ${a.border} ${a.bg}`}>
            <span className="text-lg">{a.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-[#e6edf3] text-sm">{a.district}</div>
              <div className="text-xs text-[#7d8590] mt-0.5">{a.msg}</div>
              <div className="text-[10px] text-[#7d8590]/60 mt-1">{a.time} · {a.level}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
