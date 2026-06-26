'use client'
import { motion } from 'framer-motion'

export default function ImpactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
        className="rounded-2xl p-8 mb-8 text-center" style={{ background:'linear-gradient(135deg,#4a0080,#1a0050,#0a0e27)' }}>
        <div className="text-xs font-bold tracking-[4px] text-brand-purple uppercase mb-3">🏆 SBI GFF 2026 · HACKATHON SUBMISSION</div>
        <h1 className="text-4xl sm:text-5xl font-black gradient-text-purple mb-4">Invisible Insurance Engine</h1>
        <p className="text-white/60 text-base max-w-xl mx-auto">
          Transforming India's ₹53,000 Cr crop insurance loss problem into a real-time,
          zero-friction, agentic AI payout system — embedded inside SBI YONO.
        </p>
      </motion.div>
      {/* Impact numbers */}
      <h2 className="text-xl font-black text-brand-text mb-4">💥 The Impact Numbers</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          ['10L+','Farmers Covered','First season target','#64ffda'],
          ['₹500Cr','Payout Capacity','Per Kharif season','#3fb950'],
          ['<2 hrs','Payout SLA','Avg: 47 minutes','#e3b341'],
          ['95%','Effort Reduction','vs traditional claims','#388bfd'],
          ['40%','Adoption Increase','First-time buyers','#d2a8ff'],
          ['4','AI Agents','Running 24x7','#f85149'],
        ].map(([num,lbl,sub,color],i) => (
          <motion.div key={i} initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }}
            transition={{ delay:i*0.08 }}
            className="glass p-4 text-center">
            <div className="text-2xl font-black" style={{ color }}>{num}</div>
            <div className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">{lbl}</div>
            <div className="text-[10px] text-brand-muted/60 mt-1">{sub}</div>
          </motion.div>
        ))}
      </div>
      {/* 3 Pillars */}
      <h2 className="text-xl font-black text-brand-text mb-4">🎯 Addressing All 3 Hackathon Pillars</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon:'📱', title:'Digital Engagement', color:'#1565c0', points:[
            'Real-time risk alerts inside SBI YONO','Personalised nudges by crop + location',
            'Push notifications on trigger events','Transparent payout status dashboard','SMS for every auto-payout'] },
          { icon:'👥', title:'Customer Acquisition', color:'#6a1b9a', points:[
            'One-tap enrolment — no branch visit','AI risk scores create urgency to enrol',
            'PM-FASAL subsidy lowers premium','First payout drives word-of-mouth','Targets 140M+ uninsured farmers'] },
          { icon:'💻', title:'Digital Adoption', color:'#00695c', points:[
            'Zero paperwork — full lifecycle in YONO','Parametric model removes loss assessment',
            'UPI payout in <2 hrs builds trust','Works on 2G / feature phones via SMS','Increases YONO stickiness for rural'] },
        ].map((p,i) => (
          <div key={i} className="bg-brand-card rounded-2xl p-5 border-t-4" style={{ borderTopColor:p.color }}>
            <div className="text-3xl mb-2">{p.icon}</div>
            <div className="font-black mb-3" style={{ color:p.color }}>{p.title}</div>
            {p.points.map((pt,j) => (
              <div key={j} className="text-xs text-brand-muted py-2 border-b border-brand-border last:border-0">✓ {pt}</div>
            ))}
          </div>
        ))}
      </div>
      {/* Submission doc */}
      <h2 className="text-xl font-black text-brand-text mb-4">📄 GFF Portal Submission</h2>
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-6 mb-6">
        {[
          ['Project Name',      'Invisible Insurance Engine'],
          ['Tagline',           '"Insurance that pays before you ask."'],
          ['Themes',            'Digital Engagement + Customer Acquisition + Digital Adoption'],
          ['Target',            '140M+ uninsured Indian farmers · SBI YONO first-time rural users'],
          ['Impact',            '₹500Cr capacity · 10L farmers · <2hr SLA · 40% adoption lift · 95% effort reduction'],
          ['Tech Stack',        'Next.js 14 · TypeScript · FastAPI · Tailwind CSS · Framer Motion · Recharts · Vercel · Railway'],
          ['SBI Integration',   'SBI YONO · Core Banking API · UPI/IMPS · SMS/push notifications'],
          ['GitHub',            'github.com/jyotheeswar012-max/iie-web'],
          ['Team',              'Jyotheeswar Reddy · Hyderabad, Telangana'],
        ].map(([l,v]) => (
          <div key={l} className="mb-4">
            <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1">{l}</div>
            <div className="text-brand-text text-sm">{v}</div>
          </div>
        ))}
      </div>
      {/* Copy paste */}
      <details className="bg-brand-card border border-brand-border rounded-2xl">
        <summary className="px-5 py-4 cursor-pointer font-bold text-brand-text text-sm">📋 Copy-paste text for GFF portal</summary>
        <pre className="px-5 pb-5 text-xs text-brand-muted leading-relaxed whitespace-pre-wrap">{`Project: Invisible Insurance Engine
Tagline: Insurance that pays before you ask.

Themes: Digital Engagement + Customer Acquisition + Digital Adoption

Concept:
4-agent AI system inside SBI YONO. Monitors real-time parametric risk
(weather, NDVI, soil), verifies via multi-source quorum (IMD, NASA, Sentinel-2, ICAR),
matches enrolled policies, and executes UPI/IMPS payouts in under 2 hours.
Zero paperwork. Zero claims. Zero friction.

Impact:
- 10 Lakh farmers covered
- Rs 500 Crore payout capacity per season
- <2 hour payout SLA (avg 47 minutes)
- 40% insurance adoption increase
- 95% reduction in claim effort

GitHub: github.com/jyotheeswar012-max/iie-web
Team: Jyotheeswar Reddy, Hyderabad`}</pre>
      </details>
    </div>
  )
}
