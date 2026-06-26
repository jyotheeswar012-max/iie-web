'use client'
export default function ImpactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl p-8 mb-8 text-center" style={{ background:'linear-gradient(135deg,#4a0080,#1a0050,#0a0e27)' }}>
        <div className="text-xs font-bold tracking-[4px] text-[#e040fb] uppercase mb-3">🏆 SBI GFF 2026 · HACKATHON SUBMISSION</div>
        <h1 className="text-4xl sm:text-5xl font-black gradient-text-purple mb-4">Invisible Insurance Engine</h1>
        <p className="text-white/60 text-base max-w-xl mx-auto">Transforming India’s ₹53,000 Cr crop insurance loss into a real-time, zero-friction, agentic AI payout system embedded inside SBI YONO.</p>
      </div>
      <h2 className="text-xl font-black text-[#e6edf3] mb-4">💥 Impact Numbers</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[['10L+','Farmers Covered','First season','#64ffda'],['₹500Cr','Payout Capacity','Per Kharif','#3fb950'],
          ['<2 hrs','Payout SLA','Avg 47 min','#e3b341'],['95%','Effort Reduction','vs traditional','#388bfd'],
          ['40%','Adoption Lift','First-time buyers','#d2a8ff'],['4','AI Agents','Running 24x7','#f85149'],
        ].map(([num,lbl,sub,color],i)=>(
          <div key={i} className="glass p-4 text-center">
            <div className="text-2xl font-black" style={{color}}>{num}</div>
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1">{lbl}</div>
            <div className="text-[10px] text-[#7d8590]/60 mt-1">{sub}</div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-black text-[#e6edf3] mb-4">🎯 3 Hackathon Pillars</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon:'📱',title:'Digital Engagement', color:'#1565c0',
            points:['Real-time alerts in SBI YONO','Personalised nudges by crop + location','Push notifications on triggers','Transparent payout dashboard','SMS for every auto-payout'] },
          { icon:'👥',title:'Customer Acquisition',color:'#6a1b9a',
            points:['One-tap enrolment — no branch visit','AI risk scores create urgency','PM-FASAL subsidy integration','First payout drives word-of-mouth','Targets 140M+ uninsured farmers'] },
          { icon:'💻',title:'Digital Adoption',    color:'#00695c',
            points:['Zero paperwork in YONO','Parametric removes loss assessment','UPI payout in <2 hrs builds trust','Works on 2G / SMS fallback','Increases YONO rural stickiness'] },
        ].map((p,i)=>(
          <div key={i} className="bg-[#161b22] rounded-2xl p-5 border-t-4" style={{borderTopColor:p.color}}>
            <div className="text-3xl mb-2">{p.icon}</div>
            <div className="font-black mb-3" style={{color:p.color}}>{p.title}</div>
            {p.points.map((pt,j)=>(
              <div key={j} className="text-xs text-[#7d8590] py-2 border-b border-[#21262d] last:border-0">✓ {pt}</div>
            ))}
          </div>
        ))}
      </div>
      <h2 className="text-xl font-black text-[#e6edf3] mb-4">📄 GFF Submission Doc</h2>
      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-6 mb-4">
        {[['Project','Invisible Insurance Engine'],['Tagline','"Insurance that pays before you ask."'],
          ['Themes','Digital Engagement + Customer Acquisition + Digital Adoption'],
          ['Impact','₹500Cr capacity · 10L farmers · <2hr SLA · 40% adoption lift · 95% effort reduction'],
          ['Stack','Next.js 14 · TypeScript · FastAPI · Tailwind CSS · Framer Motion · Recharts · Vercel'],
          ['GitHub','github.com/jyotheeswar012-max/iie-web'],['Team','Jyotheeswar Reddy · Hyderabad'],
        ].map(([l,v])=>(
          <div key={l} className="mb-4">
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">{l}</div>
            <div className="text-[#e6edf3] text-sm">{v}</div>
          </div>
        ))}
      </div>
      <details className="bg-[#161b22] border border-[#21262d] rounded-2xl">
        <summary className="px-5 py-4 cursor-pointer font-bold text-[#e6edf3] text-sm">📋 Copy-paste for GFF portal</summary>
        <pre className="px-5 pb-5 text-xs text-[#7d8590] leading-relaxed whitespace-pre-wrap">{`Project: Invisible Insurance Engine
Tagline: Insurance that pays before you ask.
Themes: Digital Engagement + Customer Acquisition + Digital Adoption

Concept: 4-agent AI inside SBI YONO. Monitors real-time parametric risk,
verifies via multi-source quorum, matches policies, executes UPI/IMPS
payouts in under 2 hours. Zero paperwork. Zero claims. Zero friction.

Impact: 10L farmers · Rs500Cr capacity · <2hr SLA · 40% adoption lift
GitHub: github.com/jyotheeswar012-max/iie-web
Team: Jyotheeswar Reddy, Hyderabad`}</pre>
      </details>
    </div>
  )
}
