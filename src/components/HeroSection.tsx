'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const TAGLINES = [
  'Insurance that pays before you ask.',
  'AI that watches India\'s skies 24/7.',
  'Zero forms. Zero agents. Zero waiting.',
  'Payout in 47 minutes. Every time.',
]

export default function HeroSection() {
  const [tagline, setTagline] = useState(0)
  const [farmers, setFarmers] = useState(1042810)
  const [payouts, setPayouts] = useState(487)

  useEffect(() => {
    const t = setInterval(() => setTagline(p => (p + 1) % TAGLINES.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setFarmers(p => p + Math.floor(Math.random() * 3))
      setPayouts(p => parseFloat((p + 0.01).toFixed(2)))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative rounded-3xl overflow-hidden grid-bg" style={{
      background: 'linear-gradient(135deg, #030712 0%, #0a1628 30%, #0d2040 60%, #0a2518 100%)',
      border: '1px solid rgba(100,255,218,0.15)',
      boxShadow: '0 0 80px rgba(100,255,218,0.08), 0 0 160px rgba(130,177,255,0.04)'
    }}>
      {/* Scanline effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#64ffda]/20 to-transparent" style={{ animation: 'scanline 4s linear infinite', top: '0' }} />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #64ffda, transparent)' }} />
      <div className="absolute bottom-10 left-20 w-48 h-48 rounded-full opacity-8 blur-3xl" style={{ background: 'radial-gradient(circle, #82b1ff, transparent)', animation: 'float 4s ease-in-out infinite reverse' }} />

      <div className="relative z-10 p-8 sm:p-12">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="badge-live"><span className="pulse-dot" />LIVE SYSTEM</span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#82b1ff]/10 border border-[#82b1ff]/30 text-[#82b1ff] font-bold">🏆 SBI GFF 2026</span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#e040fb]/10 border border-[#e040fb]/30 text-[#e040fb] font-bold">🤖 Agentic AI</span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#e3b341]/10 border border-[#e3b341]/30 text-[#e3b341] font-bold">🛰️ Parametric Insurance</span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-2 gradient-text">
          Invisible Insurance<br />Engine
        </h1>
        <div className="h-10 mb-6">
          <p key={tagline} className="text-lg sm:text-2xl text-white/60 font-medium animate-fadeIn">
            {TAGLINES[tagline]}
          </p>
        </div>

        {/* Live counters */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div>
            <div className="text-3xl font-black text-[#64ffda] tabular-nums">{farmers.toLocaleString()}</div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest">Farmers Protected <span className="text-[#3fb950]">↑ live</span></div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-3xl font-black text-[#3fb950] tabular-nums">₹{payouts} Cr</div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest">Total Payouts <span className="text-[#3fb950]">↑ live</span></div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-3xl font-black text-[#e3b341]">47 min</div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest">Avg Payout Speed</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-3xl font-black text-[#f85149]">0</div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest">Claim Forms Filed</div>
          </div>
        </div>

        {/* Pillars */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['✅ Digital Engagement','✅ Customer Acquisition','✅ Digital Adoption','🏆 Targets ALL 3 GFF Themes'].map(p => (
            <span key={p} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 font-semibold">{p}</span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link href="/risk" className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#0a0e27] transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #64ffda, #82b1ff)' }}>
            🛰️ Live Risk Map <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link href="/enroll" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 hover:border-white/40 transition-all">
            📱 Enroll a Farmer
          </Link>
          <Link href="/payouts" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#3fb950]/30 text-[#3fb950] text-sm font-semibold hover:bg-[#3fb950]/5 transition-all">
            ⚡ Live Payouts
          </Link>
          <Link href="/impact" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e040fb]/30 text-[#e040fb] text-sm font-semibold hover:bg-[#e040fb]/5 transition-all">
            🏆 GFF Submission
          </Link>
        </div>
      </div>
    </div>
  )
}
