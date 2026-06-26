'use client'
const ALERTS = [
  { icon:'🔴', district:'Barmer, RJ',    msg:'NDVI 0.21 — Drought trigger verified',  level:'CRITICAL', time:'14:32', cls:'border-red-700   bg-red-950/30' },
  { icon:'🟠', district:'Puri, OD',      msg:'Rainfall 187mm — approaching flood',    level:'WARNING',  time:'14:21', cls:'border-orange-700 bg-orange-950/30' },
  { icon:'🔴', district:'Latur, MH',     msg:'Temp 46.2°C — Heatwave activated',      level:'CRITICAL', time:'14:08', cls:'border-red-700   bg-red-950/30' },
  { icon:'🟢', district:'Ludhiana, PB',  msg:'₹34Cr paid to 3,840 farmers — done',   level:'SAFE',     time:'13:52', cls:'border-green-700 bg-green-950/30' },
  { icon:'🟠', district:'Adilabad, TG',  msg:'Wind 78km/h — monitoring cyclone',      level:'WARNING',  time:'13:39', cls:'border-orange-700 bg-orange-950/30' },
  { icon:'🟢', district:'Amritsar, PB',  msg:'₹21Cr auto-credited to 2,100 accounts',level:'SAFE',     time:'13:18', cls:'border-green-700 bg-green-950/30' },
  { icon:'🔴', district:'Jodhpur, RJ',   msg:'NDVI 0.19 — Critical drought zone',     level:'CRITICAL', time:'12:55', cls:'border-red-700   bg-red-950/30' },
]
export default function AlertFeed() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-black text-brand-text">🛡️ Live Alert Feed</h3>
        <span className="flex items-center gap-1.5 text-xs text-brand-green">
          <span className="pulse-dot" /> LIVE
        </span>
      </div>
      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {ALERTS.map((a,i) => (
          <div key={i} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 border-l-4 ${a.cls}`}>
            <span className="text-lg mt-0.5">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-brand-text text-sm">{a.district}</div>
              <div className="text-xs text-brand-muted mt-0.5">{a.msg}</div>
              <div className="text-[10px] text-brand-muted/60 mt-1">{a.time} · {a.level}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
