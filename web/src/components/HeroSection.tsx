'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      className="relative rounded-3xl overflow-hidden mb-6 p-10"
      style={{ background: 'linear-gradient(135deg,#0a0e27 0%,#0d1b4b 35%,#0a3060 65%,#00695c 100%)' }}>
      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full opacity-20" style={{ background:'radial-gradient(#0064ff,transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full opacity-15" style={{ background:'radial-gradient(#00c896,transparent 70%)' }} />
      </div>
      <div className="relative z-10">
        <div className="text-xs font-bold tracking-[4px] text-brand-teal uppercase mb-3">🛰️ SBI GFF 2026 · Agentic AI · Parametric Insurance</div>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight gradient-text mb-4">
          Insurance that pays<br />before you ask.
        </h1>
        <p className="text-white/70 text-base max-w-xl leading-relaxed mb-6">
          The Invisible Insurance Engine watches India's skies, soil, and satellites 24/7.
          When disaster strikes, <span className="text-brand-teal font-bold">farmers get paid in under 2 hours</span> — no forms, no agents, no waiting.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {['✅ Digital Engagement','✅ Customer Acquisition','✅ Digital Adoption','🏆 SBI GFF 2026'].map(p => (
            <span key={p} className="text-xs px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/80 backdrop-blur-sm">{p}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-8 mb-6">
          {[['10L+','Farmers Protected'],['<2 hrs','Payout SLA'],['₹500Cr','Payout Capacity'],['0','Forms Required'],['4','AI Agents']].map(([n,l]) => (
            <div key={l}>
              <div className="text-2xl font-black text-brand-teal">{n}</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">{l}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Link href="/risk" className="px-5 py-2.5 rounded-xl bg-brand-teal text-brand-navy font-bold text-sm hover:bg-brand-teal/90 transition">
            View Risk Map →
          </Link>
          <Link href="/enroll" className="px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition">
            Enroll a Farmer
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
