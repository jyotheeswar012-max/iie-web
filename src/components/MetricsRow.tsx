'use client'
import { motion } from 'framer-motion'
import { METRICS } from '@/lib/mockData'

const CARDS = [
  { icon:'\ud83d\udc68\u200d\ud83c\udf3e', value:'9.87L+',   label:'FARMERS COVERED',   delta:'+12,400 this week',   color:'#64ffda' },
  { icon:'\u20b9',    value:'\u20b9487Cr', label:'TOTAL PAYOUTS',     delta:'\u20b92.1Cr today',         color:'#3fb950' },
  { icon:'\u26a1',    value:'47 min',   label:'AVG PAYOUT TIME',   delta:'SLA: < 2 hrs',          color:'#e3b341' },
  { icon:'\ud83d\udea8',   value:'17',       label:'ACTIVE RISK ZONES', delta:'3 critical today',       color:'#f85149' },
  { icon:'\ud83d\udccb',   value:'1.02L',    label:'POLICIES ACTIVE',   delta:'+340 enrolled today',    color:'#82b1ff' },
]

export default function MetricsRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {CARDS.map((c, i) => (
        <motion.div key={c.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="glass rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform cursor-default"
        >
          <div className="text-2xl mb-2">{c.icon}</div>
          <div className="text-2xl font-black" style={{ color: c.color }}>{c.value}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1.5">{c.label}</div>
          <div className="text-[11px] text-green-400/70 mt-1">▲ {c.delta}</div>
        </motion.div>
      ))}
    </div>
  )
}
