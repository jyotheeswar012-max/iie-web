'use client'
import { useEffect, useState } from 'react'

const BASE = [
  { icon:'👨‍🌾', base:1042810, label:'Farmers Covered',   suffix:'',    color:'#64ffda', delta:'+live', inc:2     },
  { icon:'₹',    base:487,     label:'Total Payouts (Cr)', suffix:' Cr', color:'#3fb950', delta:'+live', inc:0.02  },
  { icon:'⚡',   base:47,      label:'Avg Payout (min)',   suffix:' min',color:'#e3b341', delta:'SLA <2hr', inc:0 },
  { icon:'🚨',   base:17,      label:'Active Risk Zones', suffix:'',    color:'#f85149', delta:'3 critical', inc:0 },
  { icon:'📋',   base:102340,  label:'Policies Active',  suffix:'',    color:'#82b1ff', delta:'+live', inc:1     },
]

export default function MetricsRow() {
  const [vals, setVals] = useState(BASE.map(m => m.base))

  useEffect(() => {
    const t = setInterval(() => {
      setVals(prev => prev.map((v, i) => {
        if (BASE[i].inc === 0) return v
        return parseFloat((v + BASE[i].inc).toFixed(2))
      }))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {BASE.map((m, i) => (
        <div key={i} className="glass card-hover p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}, transparent 70%)` }} />
          <div className="text-2xl mb-2">{m.icon}</div>
          <div className="text-xl sm:text-2xl font-black tabular-nums" style={{ color: m.color }}>
            {typeof vals[i] === 'number' && vals[i] > 1000
              ? Math.floor(vals[i]).toLocaleString()
              : vals[i]}{m.suffix}
          </div>
          <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1 leading-tight">{m.label}</div>
          <div className="text-[10px] text-[#3fb950] mt-1.5 font-bold">▲ {m.delta}</div>
        </div>
      ))}
    </div>
  )
}
