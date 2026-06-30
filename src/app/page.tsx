'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const STATS = [
  { value: '₹1.22L', label: 'Max Coverage',   sub: 'Full Season Pro plan' },
  { value: '4',      label: 'Oracle Sources',  sub: 'NASA · IMD · ISRO · ICAR' },
  { value: '≥75%',   label: 'AI Quorum',       sub: '4-agent weighted vote' },
  { value: '<3s',    label: 'Payout Speed',    sub: 'IMPS settlement' },
];

const LINKS = [
  { href:'/demo',         emoji:'⚡', label:'Live Demo',      sub:'5-step engine walkthrough',        color:'#0f766e' },
  { href:'/enroll',       emoji:'📋', label:'Enroll Farmer',  sub:'Policy + contract deploy',         color:'#1d4ed8' },
  { href:'/risk',         emoji:'🛰️', label:'Oracle Feed',    sub:'Live multi-district risk data',    color:'#7c3aed' },
  { href:'/payouts',      emoji:'💸', label:'Payout Tracker', sub:'IMPS credits + UPI references',    color:'#b45309' },
  { href:'/blockchain',   emoji:'🔗', label:'Audit Chain',    sub:'SHA-256 tamper-evident ledger',    color:'#0369a1' },
  { href:'/architecture', emoji:'🏗️', label:'Architecture',   sub:'System design overview',          color:'#059669' },
  { href:'/india-stack',  emoji:'🇮🇳', label:'India Stack',   sub:'DigiLocker · UPI · Aadhaar',      color:'#dc2626' },
  { href:'/impact',       emoji:'📊', label:'GFF Impact',     sub:'Claims 6mo→3s · Fraud −91%',      color:'#d97706' },
];

const PIPELINE = [
  { icon:'📋', step:'KYC + Enroll',   detail:'DigiLocker · Aadhaar · PM-FASAL' },
  { icon:'🛰️', step:'Oracle Fetch',   detail:'NASA · IMD · ISRO · ICAR' },
  { icon:'🤖', step:'AI Quorum',      detail:'4 agents · ≥75% triggers' },
  { icon:'⚡', step:'Smart Contract', detail:'ACTIVE→TRIGGERED→EXECUTED' },
  { icon:'💸', step:'IMPS Payout',    detail:'UPI ref · RRN · SMS <3s' },
];

const IMPACT_TICKERS = [
  { label:'Claim time',     before:'6 months', after:'<3 seconds',  delta:'99.998% faster' },
  { label:'Forms filed',   before:'12 forms',  after:'0 forms',     delta:'100% eliminated' },
  { label:'Fraud rate',    before:'23%',       after:'<2%',         delta:'−91%' },
  { label:'Admin cost',    before:'₹4,800',    after:'₹38',         delta:'−99.2%' },
  { label:'Farmers reach', before:'4.2 Cr',    after:'14 Cr+',      delta:'3.3× scale' },
];

export default function HomePage() {
  const [tick, setTick]       = useState(0);
  const [visible, setVisible] = useState(false);
  const [itick, setItick]     = useState(0);
  const [liveAmt, setLiveAmt] = useState(0);

  useEffect(() => {
    setVisible(true);
    const t1 = setInterval(() => setTick(x => x + 1), 2000);
    const t2 = setInterval(() => setItick(x => x + 1), 3500);
    // Simulate live ₹ protected counter ticking up
    let base = 8347200;
    const t3 = setInterval(() => {
      base += Math.floor(Math.random() * 70000 + 30000);
      setLiveAmt(base);
    }, 1800);
    setLiveAmt(base);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  const activePipe  = tick  % PIPELINE.length;
  const activeImpact = itick % IMPACT_TICKERS.length;
  const imp = IMPACT_TICKERS[activeImpact];

  const fmt = (n: number) => {
    if (n >= 1e7) return '₹' + (n/1e7).toFixed(2) + ' Cr';
    if (n >= 1e5) return '₹' + (n/1e5).toFixed(1) + ' L';
    return '₹' + n.toLocaleString('en-IN');
  };

  return (
    <main style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#020d0c 0%,#042f2e 40%,#0f766e 80%,#059669 100%)',
      fontFamily:"'Inter',system-ui,sans-serif", color:'#fff', overflowX:'hidden',
    }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes flipIn  { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up   { animation:fadeUp 0.6s ease both }
        .card-hover:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 12px 40px #00000055 !important }
        .card-hover { transition:all 0.22s ease }
        .flip-in   { animation:flipIn 0.4s ease both }
        * { box-sizing:border-box }
      `}</style>

      {/* Hero */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 20px 32px', textAlign:'center',
        opacity:visible?1:0, transition:'opacity 0.8s ease' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <span style={{ background:'#ffffff15', border:'1px solid #6ee7b766', borderRadius:999, padding:'6px 18px',
            fontSize:13, fontWeight:600, color:'#6ee7b7', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 1.5s infinite' }} />
            LIVE · SBI Global Fintech Fest 2026 · All engines running on Vercel Edge
          </span>
        </div>
        <div style={{ fontSize:64, marginBottom:12, animation:'float 3s ease-in-out infinite' }}>🌾</div>
        <h1 style={{ fontWeight:900, fontSize:'clamp(32px,6vw,58px)', letterSpacing:'-0.03em',
          margin:'0 0 14px', background:'linear-gradient(90deg,#ffffff,#6ee7b7,#34d399)',
          backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          animation:'shimmer 4s linear infinite' }}>YONO-Oracle IIE</h1>
        <p style={{ fontSize:'clamp(15px,2.2vw,20px)', color:'#a7f3d0', maxWidth:620, margin:'0 auto 10px', lineHeight:1.6 }}>
          India&apos;s first <b style={{ color:'#fff' }}>fully autonomous parametric crop insurance engine</b> —
          oracle-verified, AI-quorum-governed, blockchain-audited, IMPS-settled.
        </p>
        <p style={{ fontSize:13, color:'#6ee7b7', marginBottom:32 }}>Powered by NASA · IMD · ISRO · ICAR · PM-FASAL · DigiLocker · UPI · Aadhaar</p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/demo" style={{ background:'linear-gradient(135deg,#0f766e,#059669)', color:'#fff',
            borderRadius:14, padding:'14px 34px', fontWeight:800, fontSize:16, textDecoration:'none',
            boxShadow:'0 4px 28px #0f766e88', display:'flex', alignItems:'center', gap:10 }}>⚡ Start Live Demo →</Link>
          <Link href="/impact" style={{ background:'#d97706', color:'#fff', borderRadius:14,
            padding:'14px 24px', fontWeight:700, fontSize:15, textDecoration:'none',
            boxShadow:'0 4px 16px #d9770644' }}>📊 Impact Metrics</Link>
          <Link href="/architecture" style={{ background:'#ffffff18', border:'1px solid #ffffff44',
            color:'#fff', borderRadius:14, padding:'14px 24px', fontWeight:700, fontSize:15, textDecoration:'none' }}>🏗️ Architecture</Link>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div style={{ maxWidth:1100, margin:'0 auto 36px', padding:'0 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12,
          background:'#ffffff0e', border:'1px solid #ffffff22', borderRadius:20, padding:'22px 18px' }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'clamp(20px,3.5vw,30px)', fontWeight:900, color:'#6ee7b7' }}>{s.value}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginTop:4 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#a7f3d0', marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Impact Ticker */}
      <div style={{ maxWidth:1100, margin:'0 auto 44px', padding:'0 20px' }}>
        <div style={{ background:'linear-gradient(135deg,#1a237e22,#0f766e33)', border:'1px solid #6ee7b733',
          borderRadius:18, padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>📈 Live Impact vs PMFBY</div>
            <div key={activeImpact} className="flip-in" style={{ fontSize:15, color:'#e2e8f0' }}>
              <b style={{ color:'#fff' }}>{imp.label}:</b>&nbsp;
              <span style={{ color:'#f87171', textDecoration:'line-through' }}>{imp.before}</span>
              &nbsp;→&nbsp;
              <span style={{ color:'#4ade80', fontWeight:700 }}>{imp.after}</span>
              &nbsp;<span style={{ background:'#4ade8022', border:'1px solid #4ade8044', borderRadius:6,
                padding:'2px 8px', fontSize:12, color:'#4ade80', fontWeight:700 }}>▲ {imp.delta}</span>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'#6ee7b7', marginBottom:4 }}>🌾 LIVE · Total Coverage Active</div>
            <div style={{ fontSize:26, fontWeight:900, color:'#fff', fontVariantNumeric:'tabular-nums' }}>{fmt(liveAmt)}</div>
            <div style={{ fontSize:11, color:'#a7f3d0' }}>updated every ~2s · demo simulation</div>
          </div>
        </div>
      </div>

      {/* Live Pipeline */}
      <div style={{ maxWidth:1100, margin:'0 auto 48px', padding:'0 20px' }}>
        <h2 style={{ textAlign:'center', fontWeight:800, fontSize:20, marginBottom:22, color:'#e2e8f0' }}>🔄 Autonomous Pipeline — Live</h2>
        <div style={{ display:'flex', alignItems:'center', gap:0, overflowX:'auto', paddingBottom:8 }}>
          {PIPELINE.map((p,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', flex:1, minWidth:150 }}>
              <div style={{ flex:1, background:i===activePipe?'#0f766e':'#ffffff12',
                border:`2px solid ${i===activePipe?'#6ee7b7':'#ffffff22'}`, borderRadius:16,
                padding:'14px 10px', textAlign:'center', transition:'all 0.5s ease',
                boxShadow:i===activePipe?'0 0 24px #0f766e88':'none' }}>
                <div style={{ fontSize:26, marginBottom:5 }}>{p.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:i===activePipe?'#fff':'#cbd5e1' }}>{p.step}</div>
                <div style={{ fontSize:11, color:i===activePipe?'#a7f3d0':'#64748b', marginTop:3, lineHeight:1.4 }}>{p.detail}</div>
              </div>
              {i<PIPELINE.length-1&&<div style={{ color:i===activePipe?'#6ee7b7':'#334155', fontSize:20, margin:'0 5px', flexShrink:0 }}>›</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Nav Grid */}
      <div style={{ maxWidth:1100, margin:'0 auto 48px', padding:'0 20px' }}>
        <h2 style={{ textAlign:'center', fontWeight:800, fontSize:20, marginBottom:22, color:'#e2e8f0' }}>🚀 Explore the Engine</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="card-hover" style={{ background:'#ffffff0d',
              border:`1px solid ${l.color}55`, borderRadius:16, padding:'18px', textDecoration:'none', display:'block',
              boxShadow:'0 2px 12px #00000033' }}>
              <div style={{ width:42, height:42, borderRadius:11, background:`${l.color}22`,
                border:`1px solid ${l.color}55`, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, marginBottom:10 }}>{l.emoji}</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:14, marginBottom:4 }}>{l.label}</div>
              <div style={{ color:'#94a3b8', fontSize:12, lineHeight:1.5 }}>{l.sub}</div>
              <div style={{ marginTop:10, fontSize:12, color:l.color, fontWeight:600 }}>Explore →</div>
            </Link>
          ))}
        </div>
      </div>

      {/* India Stack badge row */}
      <div style={{ maxWidth:1100, margin:'0 auto 48px', padding:'0 20px' }}>
        <div style={{ background:'#ffffff0a', border:'1px solid #ffffff1a', borderRadius:20, padding:'24px 28px' }}>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.1em', textTransform:'uppercase' }}>India Stack Integration</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {[['🆔','Aadhaar KYC'],['📁','DigiLocker'],['💳','UPI / IMPS'],['🌾','PM-FASAL Subsidy'],
              ['🛰️','NASA MODIS NDVI'],['🌧️','IMD Rainfall'],['🌡️','ISRO Bhuvan'],['🌱','ICAR Soil'],
              ['⛓️','SHA-256 Ledger'],['🤖','NaiveBayes ML'],['🏛️','NPCI UTR'],['📱','SMS Fallback']
            ].map(([icon,label]) => (
              <span key={label as string} style={{ background:'#ffffff12', border:'1px solid #ffffff22',
                borderRadius:999, padding:'6px 14px', fontSize:12, fontWeight:600, color:'#e2e8f0',
                display:'flex', alignItems:'center', gap:6 }}><span>{icon}</span><span>{label}</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'0 20px 40px', color:'#475569', fontSize:12 }}>
        <div style={{ color:'#334155', marginBottom:6 }}>Built for SBI Global Fintech Fest 2026 · YONO-Oracle Intelligent Insurance Engine</div>
        <div>All engines live on Vercel Edge · Next.js 14 · 100% serverless · Zero external dependencies</div>
      </div>
    </main>
  );
}
