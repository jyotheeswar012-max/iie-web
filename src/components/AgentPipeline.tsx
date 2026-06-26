'use client'
import { motion } from 'framer-motion'

const STEPS = [
  {
    icon: '\ud83d\udd0d', colorClass: 'border-[#3fb950] bg-green-950/40', badge: 'badge-green', badgeColor: 'bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/50',
    title: 'Agent 1: Risk Monitor',
    desc: 'Ingests weather, NDVI, soil moisture from 600+ districts every 5 minutes. Sources: OpenWeatherMap, NASA MODIS, Sentinel-2, ICAR.',
  },
  {
    icon: '\u2705', colorClass: 'border-[#388bfd] bg-blue-950/40', badgeColor: 'bg-[#388bfd]/20 text-[#79c0ff] border border-[#388bfd]/50',
    title: 'Agent 2: Trigger Verifier',
    desc: 'Cross-validates parametric events across 4 data sources. Requires \u226575% quorum before any payout. Prevents false positives.',
  },
  {
    icon: '\ud83d\udccb', colorClass: 'border-[#e3b341] bg-yellow-950/40', badgeColor: 'bg-[#e3b341]/20 text-[#e3b341] border border-[#e3b341]/50',
    title: 'Agent 3: Policy Matcher',
    desc: 'Maps verified triggers to enrolled YONO policies in the affected district. Payout = base_rate \u00d7 crop_mult \u00d7 acres \u00d7 confidence.',
  },
  {
    icon: '\u26a1', colorClass: 'border-[#f85149] bg-red-950/40', badgeColor: 'bg-[#f85149]/20 text-[#ff7b72] border border-[#f85149]/50',
    title: 'Agent 4: Payout Executor',
    desc: 'Initiates UPI/IMPS credits to SBI savings accounts. Average settlement: 47 minutes. No claim filed. No agent. No waiting.',
  },
]

export default function AgentPipeline() {
  return (
    <div className="bg-[#0d1117] rounded-2xl border border-[#21262d] p-8">
      <h2 className="text-lg font-bold text-white mb-6">🤖 How the Engine Thinks — 4-Agent Pipeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 relative">
            {/* Connector line */}
            {i < 3 && (
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#3fb950] to-[#388bfd] z-0" style={{ left: '50%' }} />
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-2xl border-2 ${s.colorClass} flex items-center justify-center text-2xl mb-3`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 ${s.badgeColor}`}>● RUNNING</span>
            </motion.div>
            <div className="md:text-center px-2 pb-4">
              <div className="text-white font-bold text-sm mb-1.5">{s.title}</div>
              <div className="text-white/45 text-xs leading-relaxed">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
