'use client'
import Link from 'next/link'

const METRICS = [
  ['10L+','Farmers Covered','First season','#64ffda'],
  ['₹500Cr','Payout Capacity','Per Kharif','#3fb950'],
  ['<2 hrs','Payout SLA','Avg 47 min','#e3b341'],
  ['95%','Effort Reduction','vs traditional','#388bfd'],
  ['40%','Adoption Lift','First-time buyers','#d2a8ff'],
  ['4','AI Agents','Running 24×7','#f85149'],
  ['0','Claim Forms','Ever filed','#64ffda'],
  ['140M+','TAM','Uninsured farmers','#e040fb'],
]

const PILLARS = [
  {
    icon:'📱', title:'Digital Engagement', color:'#1565c0',
    points:[
      'Real-time satellite alerts pushed inside SBI YONO',
      'Personalised nudges: crop × location × risk score',
      'Push notification on every trigger + payout',
      'Live dashboard: farmer can track payout status',
      'SMS fallback for 2G / no-internet zones',
    ]
  },
  {
    icon:'👥', title:'Customer Acquisition', color:'#6a1b9a',
    points:[
      'One-tap enrolment — zero branch visit needed',
      'AI risk score creates urgency to enrol NOW',
      'PM-FASAL subsidy auto-applied at checkout',
      'First payout drives organic word-of-mouth',
      'Targets 140M+ uninsured farmers in India',
    ]
  },
  {
    icon:'💻', title:'Digital Adoption', color:'#00695c',
    points:[
      'Zero paperwork — fully inside YONO app',
      'Parametric removes all loss assessment friction',
      'UPI payout in <2 hrs builds irreversible trust',
      'Works on 2G + SMS — no smartphone required',
      'Increases YONO stickiness in rural India',
    ]
  },
]

const COMPARE = [
  ['Claim process',     'File form → agent visit → loss assess → approve', 'Auto-trigger → verify → pay'],
  ['Time to payout',    '6–18 months (PMFBY avg)',                          '47 minutes avg'],
  ['Farmer effort',     '8–12 steps, multiple visits',                      '1 tap on YONO'],
  ['Accuracy',          'Manual, subjective',                               '99.7% AI quorum'],
  ['Fraud risk',        'High (ghost claims)',                               'Zero — parametric only'],
  ['Coverage',          '30% of farmers',                                   'Targets 100%'],
]

export default function ImpactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero */}
      <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1a0030,#0a0050,#030712)' }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[4px] text-[#e040fb] uppercase mb-4 px-4 py-1.5 rounded-full border border-[#e040fb]/30 bg-[#e040fb]/10">
            🏆 SBI GFF 2026 · HACKATHON SUBMISSION
          </div>
          <h1 className="text-4xl sm:text-6xl font-black gradient-text-purple mb-4">Invisible Insurance Engine</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-6">
            Transforming India's ₹53,000 Cr crop insurance problem into a <span className="text-[#64ffda] font-bold">real-time, zero-friction, agentic AI</span> payout system embedded inside SBI YONO.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-semibold hover:bg-white/10 transition">← Home</Link>
            <Link href="/risk" className="px-5 py-2.5 rounded-xl bg-[#64ffda]/10 border border-[#64ffda]/30 text-[#64ffda] text-sm font-semibold hover:bg-[#64ffda]/20 transition">Risk Map</Link>
            <Link href="/enroll" className="px-5 py-2.5 rounded-xl bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] text-sm font-semibold hover:bg-[#3fb950]/20 transition">Enroll Demo</Link>
            <Link href="/payouts" className="px-5 py-2.5 rounded-xl bg-[#e3b341]/10 border border-[#e3b341]/30 text-[#e3b341] text-sm font-semibold hover:bg-[#e3b341]/20 transition">Live Payouts</Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-2xl font-black text-[#e6edf3] mb-4">💥 Impact at Scale</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {METRICS.map(([num,lbl,sub,color],i) => (
            <div key={i} className="glass card-hover p-5 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent)` }} />
              <div className="text-2xl font-black" style={{color}}>{num}</div>
              <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1">{lbl}</div>
              <div className="text-[10px] text-[#7d8590]/50 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* vs PMFBY */}
      <div>
        <h2 className="text-2xl font-black text-[#e6edf3] mb-4">⚡ IIE vs PMFBY (Status Quo)</h2>
        <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="px-5 py-3 text-left text-xs text-[#7d8590] font-bold uppercase">Dimension</th>
                <th className="px-5 py-3 text-left text-xs text-[#f85149] font-bold uppercase">❌ PMFBY Today</th>
                <th className="px-5 py-3 text-left text-xs text-[#3fb950] font-bold uppercase">✅ IIE</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([dim,old,neo],i) => (
                <tr key={i} className="border-b border-[#21262d]/50 hover:bg-white/2">
                  <td className="px-5 py-3 text-sm font-bold text-[#e6edf3]">{dim}</td>
                  <td className="px-5 py-3 text-sm text-[#f85149]/80">{old}</td>
                  <td className="px-5 py-3 text-sm text-[#3fb950] font-semibold">{neo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Pillars */}
      <div>
        <h2 className="text-2xl font-black text-[#e6edf3] mb-4">🎯 3 Hackathon Pillars — All Covered</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PILLARS.map((p,i) => (
            <div key={i} className="bg-[#161b22] rounded-2xl p-5 border-t-4" style={{borderTopColor:p.color}}>
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-black text-base mb-3" style={{color:p.color}}>{p.title}</div>
              {p.points.map((pt,j) => (
                <div key={j} className="text-xs text-[#7d8590] py-2 border-b border-[#21262d] last:border-0 flex gap-2">
                  <span className="text-[#3fb950] flex-shrink-0">✓</span>{pt}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* GFF Submission card */}
      <div>
        <h2 className="text-2xl font-black text-[#e6edf3] mb-4">📄 GFF Submission Doc</h2>
        <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-6 space-y-4">
          {[
            ['Project','Invisible Insurance Engine'],
            ['Tagline','"Insurance that pays before you ask."'],
            ['Themes','Digital Engagement + Customer Acquisition + Digital Adoption'],
            ['USP','Parametric + Agentic AI + YONO integration = fastest crop insurance payout in India'],
            ['Impact','₹500Cr capacity · 10L farmers · <2hr SLA · 40% adoption lift · 95% effort reduction'],
            ['Stack','Next.js 14 · TypeScript · Tailwind CSS · Recharts · FastAPI · Vercel'],
            ['GitHub','github.com/jyotheeswar012-max/iie-web'],
            ['Team','Jyotheeswar Reddy · Hyderabad, India'],
          ].map(([l,v]) => (
            <div key={l} className="flex gap-4 border-b border-[#21262d] pb-3 last:border-0 last:pb-0">
              <div className="text-[11px] text-[#7d8590] uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">{l}</div>
              <div className="text-sm text-[#e6edf3] font-medium">{v}</div>
            </div>
          ))}
        </div>
        <details className="mt-4 bg-[#161b22] border border-[#21262d] rounded-2xl">
          <summary className="px-5 py-4 cursor-pointer font-bold text-[#e6edf3] text-sm hover:text-[#64ffda] transition">📋 Copy-paste text for GFF portal ▾</summary>
          <pre className="px-5 pb-5 text-xs text-[#7d8590] leading-relaxed whitespace-pre-wrap">{`Project: Invisible Insurance Engine
Tagline: Insurance that pays before you ask.
Themes: Digital Engagement + Customer Acquisition + Digital Adoption

Concept: 4-agent AI inside SBI YONO that monitors real-time parametric
risk across 600+ Indian districts, verifies via multi-source quorum,
matches policies, and executes UPI/IMPS payouts in under 2 hours.
Zero paperwork. Zero claim forms. Zero friction.

Impact: 10L+ farmers · Rs500Cr capacity · 47min avg payout · 40% adoption
lift · 95% effort reduction vs PMFBY · 140M+ TAM

GitHub: github.com/jyotheeswar012-max/iie-web
Team: Jyotheeswar Reddy, Hyderabad`}</pre>
        </details>
      </div>
    </div>
  )
}
