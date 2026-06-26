'use client'
import Link from 'next/link'
export default function HeroSection() {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-6 p-10"
      style={{ background:'linear-gradient(135deg,#0a0e27 0%,#0d1b4b 35%,#0a3060 65%,#00695c 100%)' }}>
      <div className="text-xs font-bold tracking-[4px] text-[#64ffda] uppercase mb-3">
        🛰️ SBI GFF 2026 · Agentic AI · Parametric Insurance
      </div>
      <h1 className="text-4xl sm:text-5xl font-black leading-tight gradient-text mb-4">
        Insurance that pays<br />before you ask.
      </h1>
      <p className="text-white/70 text-base max-w-xl leading-relaxed mb-6">
        The Invisible Insurance Engine watches India’s skies, soil, and satellites 24/7.
        When disaster strikes,{' '}
        <span className="text-[#64ffda] font-bold">farmers get paid in under 2 hours</span>
        {' '}— no forms, no agents, no waiting.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {['✅ Digital Engagement','✅ Customer Acquisition','✅ Digital Adoption','🏆 SBI GFF 2026'].map(p => (
          <span key={p} className="text-xs px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/80">{p}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-8 mb-8">
        {[['10L+','Farmers Protected'],['<2 hrs','Payout SLA'],['₹500Cr','Capacity'],['0','Forms'],['4','AI Agents']].map(([n,l]) => (
          <div key={l}>
            <div className="text-2xl font-black text-[#64ffda]">{n}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">{l}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Link href="/risk" className="px-5 py-2.5 rounded-xl bg-[#64ffda] text-[#0a0e27] font-bold text-sm hover:opacity-90 transition">
          View Risk Map →
        </Link>
        <Link href="/enroll" className="px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition">
          Enroll a Farmer
        </Link>
      </div>
    </div>
  )
}
