'use client'
import { useMemo } from 'react'

export default function SatelliteTicker() {
  const items = useMemo(() => [
    { label:'NDVI', location:'Barmer RJ',      value:'0.21',      alert:true  },
    { label:'RAIN', location:'Puri OD',        value:'187mm',     alert:false },
    { label:'TEMP', location:'Latur MH',       value:'46.2\u00b0C',    alert:true  },
    { label:'WIND', location:'Adilabad TG',    value:'78km/h',    alert:false },
    { label:'PAY',  location:'Warangal TG',    value:'\u20b948.2K SENT', alert:false },
    { label:'NDVI', location:'Jodhpur RJ',     value:'0.29',      alert:false },
    { label:'RAIN', location:'Nashik MH',      value:'124mm',     alert:false },
    { label:'ENRL', location:'Today',          value:'+342 farmers',alert:false },
    { label:'TRIG', location:'Barmer RJ',      value:'DROUGHT VERIFIED', alert:true },
    { label:'SOIL', location:'Aurangabad MH',  value:'Moisture 18%', alert:false },
    { label:'PAY',  location:'Ludhiana PB',    value:'\u20b962.5K SENT', alert:false },
    { label:'TEMP', location:'Jaipur RJ',      value:'42.8\u00b0C',    alert:false },
  ], [])

  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e2a50] bg-[#0a0e1a] py-3 mb-6">
      <div className="flex gap-8 animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 font-mono text-xs">
            <span className="text-white/40">{item.label}</span>
            <span className="text-white/60">{item.location}</span>
            <span className={item.alert ? 'text-[#f85149] font-bold' : 'text-[#64ffda] font-semibold'}>{item.value}</span>
            <span className="text-white/20 mx-2">●</span>
          </span>
        ))}
      </div>
    </div>
  )
}
