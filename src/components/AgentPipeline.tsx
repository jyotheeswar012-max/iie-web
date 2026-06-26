'use client'
import { useState, useEffect } from 'react'

const STEPS = [
  {
    icon:'🔍', color:'#64ffda', title:'Agent 1 — Risk Monitor',
    status:'SCANNING', ping: 312,
    desc:'Ingests live data from 600+ districts every 5 minutes. Sources: OpenWeatherMap API, NASA MODIS NDVI, Sentinel-2 satellite, IMD rainfall, ICAR soil sensors.',
    stats: [['Districts','628'],['Updates/hr','12'],['Sources','4']]
  },
  {
    icon:'✅', color:'#3fb950', title:'Agent 2 — Trigger Verifier',
    status:'VERIFYING', ping: 89,
    desc:'Cross-validates parametric events across all 4 data sources. Requires ≥75% quorum consensus to prevent false positives. Logs every decision on-chain.',
    stats: [['Accuracy','99.7%'],['False +ve','0.3%'],['Quorum','75%']]
  },
  {
    icon:'📋', color:'#82b1ff', title:'Agent 3 — Policy Matcher',
    status:'MATCHING', ping: 45,
    desc:'Maps verified triggers to enrolled YONO policies using: Payout = base_rate × crop_multiplier × acreage × confidence_score. Handles 10L+ policies in <200ms.',
    stats: [['Match rate','100%'],['Latency','<200ms'],['Policies','1.02L']]
  },
  {
    icon:'⚡', color:'#e3b341', title:'Agent 4 — Payout Executor',
    status:'EXECUTING', ping: 18,
    desc:'Initiates UPI/IMPS auto-credits directly to SBI savings accounts. Average settlement: 47 minutes. Zero rejected transactions. Zero claim forms ever.',
    stats: [['Avg time','47 min'],['Rejected','0'],['Method','UPI/IMPS']]
  },
]

export default function AgentPipeline() {
  const [active, setActive] = useState(0)
  const [pings, setPings] = useState(STEPS.map(s => s.ping))

  useEffect(() => {
    const t1 = setInterval(() => setActive(p => (p + 1) % STEPS.length), 2000)
    const t2 = setInterval(() => {
      setPings(prev => prev.map(p => Math.max(5, p + Math.floor(Math.random() * 20) - 10)))
    }, 1000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-[#e6edf3]">🤖 How the Engine Thinks</h2>
          <p className="text-xs text-[#7d8590] mt-1">4 autonomous AI agents running in parallel · 24 × 7 × 365</p>
        </div>
        <div className="badge-live"><span className="pulse-dot" />ALL AGENTS ONLINE</div>
      </div>

      {/* Pipeline visual */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="relative">
            <div
              onClick={() => setActive(i)}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 ${
                active === i
                  ? 'scale-105'
                  : 'opacity-70 hover:opacity-90 border-transparent bg-[#161b22]'
              }`}
              style={active === i ? {
                borderColor: s.color,
                background: `linear-gradient(135deg, ${s.color}10, #161b22)`,
                boxShadow: `0 0 30px ${s.color}20`
              } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>{s.status}</span>
              </div>
              <div className="font-bold text-[#e6edf3] text-xs mb-1">{s.title}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex-1 h-1 rounded-full overflow-hidden bg-[#21262d]">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (pings[i] / 400) * 100 + 60)}%`, background: s.color }} />
                </div>
                <span className="text-[10px] font-mono" style={{ color: s.color }}>{pings[i]}ms</span>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden sm:flex absolute top-1/2 -right-2 z-10 items-center justify-center w-4 -translate-y-1/2">
                <span className="text-[#21262d] text-lg">→</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <div className="rounded-2xl p-5 transition-all duration-300" style={{
        background: `linear-gradient(135deg, ${STEPS[active].color}08, #0d1117)`,
        border: `1px solid ${STEPS[active].color}30`
      }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{STEPS[active].icon}</span>
              <span className="font-black text-[#e6edf3]">{STEPS[active].title}</span>
              <span className="badge-live"><span className="pulse-dot" />RUNNING</span>
            </div>
            <p className="text-sm text-[#7d8590] leading-relaxed">{STEPS[active].desc}</p>
          </div>
          <div className="flex gap-4">
            {STEPS[active].stats.map(([l, v]) => (
              <div key={l} className="text-center">
                <div className="text-lg font-black" style={{ color: STEPS[active].color }}>{v}</div>
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
