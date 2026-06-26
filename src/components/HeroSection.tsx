'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const HERO_STATS = [
  { num: '10L+',   lbl: 'Farmers Protected' },
  { num: '<2 hrs', lbl: 'Payout SLA' },
  { num: '\u20b9500Cr', lbl: 'Payout Capacity' },
  { num: '0',      lbl: 'Forms Required' },
  { num: '4',      lbl: 'AI Agents' },
]

const PILLS = [
  '✅ Digital Engagement',
  '✅ Customer Acquisition',
  '✅ Digital Adoption',
  '🏆 SBI GFF 2026',
]

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative rounded-3xl overflow-hidden mb-6 p-10 md:p-14"
      style={{ background: 'linear-gradient(135deg,#0a0e27 0%,#0d1b4b 35%,#0a3060 65%,#00695c 100%)' }}
    >
      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/5 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#0064ff,transparent 70%)', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle,#00c896,transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        <div className="text-xs font-bold tracking-[3px] uppercase text-[#64ffda] mb-4">
          🛰️ &nbsp; SBI GFF 2026 &nbsp;·&nbsp; Agentic AI &nbsp;·&nbsp; Parametric Insurance
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4 gradient-text">
          Insurance that pays<br />before you ask.
        </h1>

        <p className="text-lg text-white/75 max-w-xl leading-relaxed mb-6">
          The Invisible Insurance Engine watches India&apos;s skies, soil, and satellites 24/7.
          When disaster strikes, <span className="text-[#64ffda] font-semibold">farmers get paid in under 2 hours</span>
          &nbsp;&mdash; no forms, no agents, no waiting.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {PILLS.map(p => (
            <span key={p} className="px-4 py-1.5 rounded-full text-xs font-semibold border border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]">{p}</span>
          ))}
        </div>

        <div className="flex gap-4 mb-10 flex-wrap">
          <Link href="/enroll"
            className="px-6 py-3 rounded-xl bg-[#64ffda] text-[#0a0e27] font-bold text-sm hover:bg-white transition-colors shadow-lg shadow-[#64ffda]/20">
            Enroll a Farmer →
          </Link>
          <Link href="/risk"
            className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-colors">
            View Risk Map
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pt-6 border-t border-white/10">
          {HERO_STATS.map(s => (
            <div key={s.lbl}>
              <div className="text-2xl font-black text-[#64ffda]">{s.num}</div>
              <div className="text-[11px] uppercase tracking-widest text-white/50 mt-1">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
