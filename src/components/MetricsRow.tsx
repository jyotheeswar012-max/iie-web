'use client'
const METRICS = [
  { icon:'👨‍🌾', value:'10,42,810',  label:'Farmers Covered',  delta:'+12,400 this week', color:'#64ffda' },
  { icon:'₹',    value:'₹487 Cr',    label:'Total Payouts',     delta:'₹2.1Cr today',       color:'#3fb950' },
  { icon:'⚡',   value:'47 min',     label:'Avg Payout Time',  delta:'SLA: < 2 hrs',      color:'#e3b341' },
  { icon:'🚨',   value:'17',         label:'Active Risk Zones', delta:'3 critical',        color:'#f85149' },
  { icon:'📋',   value:'1,02,340',   label:'Policies Active',  delta:'+340 today',        color:'#82b1ff' },
]
export default function MetricsRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-6">
      {METRICS.map((m, i) => (
        <div key={i} className="glass p-4 text-center hover:-translate-y-1 transition-transform">
          <div className="text-2xl mb-1">{m.icon}</div>
          <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
          <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1">{m.label}</div>
          <div className="text-[10px] text-[#3fb950] mt-1">▲ {m.delta}</div>
        </div>
      ))}
    </div>
  )
}
