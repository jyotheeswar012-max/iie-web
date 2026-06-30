'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const STATS = [
  { value: '₹1.22L', label: 'Max Coverage',  sub: 'Full Season Pro' },
  { value: '4',      label: 'Oracle Sources', sub: 'NASA · IMD · ISRO · ICAR' },
  { value: '≥75%',   label: 'AI Quorum',      sub: '4-agent weighted vote' },
  { value: '<3s',    label: 'Payout Speed',   sub: 'IMPS settlement' },
];

const LINKS = [
  { href:'/demo',         emoji:'⚡', label:'Live Demo',      sub:'5-step engine walkthrough',       color:'#64ffda' },
  { href:'/enroll',       emoji:'📋', label:'Enroll Farmer',  sub:'Policy + contract deploy',        color:'#82b1ff' },
  { href:'/risk',         emoji:'🛰️', label:'Oracle Feed',    sub:'Live multi-district risk data',   color:'#e040fb' },
  { href:'/payouts',      emoji:'💸', label:'Payout Tracker', sub:'IMPS credits + UPI references',   color:'#f9d423' },
  { href:'/blockchain',   emoji:'🔗', label:'Audit Chain',    sub:'SHA-256 tamper-evident ledger',   color:'#64ffda' },
  { href:'/architecture', emoji:'🏗️', label:'Architecture',   sub:'System design overview',         color:'#3fb950' },
  { href:'/india-stack',  emoji:'🇮🇳', label:'India Stack',   sub:'DigiLocker · UPI · Aadhaar',     color:'#f85149' },
  { href:'/impact',       emoji:'📊', label:'GFF Impact',     sub:'Claims 6mo→3s · Fraud −91%',     color:'#e3b341' },
];

const PIPELINE = [
  { icon:'📋', step:'KYC + Enroll',   detail:'Aadhaar · DigiLocker · PM-FASAL' },
  { icon:'🛰️', step:'Oracle Fetch',   detail:'NASA · IMD · ISRO · ICAR' },
  { icon:'🤖', step:'AI Quorum',      detail:'4 agents · ≥75% triggers' },
  { icon:'⚡', step:'Smart Contract', detail:'ACTIVE→TRIGGERED→EXECUTED' },
  { icon:'💸', step:'IMPS Payout',    detail:'UPI ref · RRN · SMS <3s' },
];

const IMPACT = [
  { label:'Claim time',    before:'6 months', after:'<3 seconds', delta:'99.998% faster' },
  { label:'Forms filed',   before:'12 forms',  after:'0 forms',    delta:'100% gone' },
  { label:'Fraud rate',    before:'23%',       after:'<2%',        delta:'-91%' },
  { label:'Admin cost',    before:'₹4,800',    after:'₹38',        delta:'-99.2%' },
  { label:'Farmers reach', before:'4.2 Cr',    after:'14 Cr+',     delta:'3.3× scale' },
];

export default function HomePage() {
  const [tick,  setTick]  = useState(0);
  const [itick, setItick] = useState(0);
  const [amt,   setAmt]   = useState(83472000);

  useEffect(() => {
    const t1 = setInterval(() => setTick(x => x + 1), 2200);
    const t2 = setInterval(() => setItick(x => x + 1), 3400);
    const t3 = setInterval(() => setAmt(a => a + Math.floor(Math.random() * 70000 + 30000)), 1800);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  const ap = tick  % PIPELINE.length;
  const im = IMPACT[itick % IMPACT.length];
  const fmt = (n: number) => n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : '₹' + (n / 1e5).toFixed(1) + ' L';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes flip { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .shimmer-text { background-size:200% auto; animation:shimmer 4s linear infinite; }
        .flip-in { animation:flip 0.4s ease both; }
        .floaty  { animation:floaty 3s ease-in-out infinite; }
        .navcard:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.6) !important; }
        .navcard { transition:all 0.2s ease; }
      `}</style>

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold" style={{ background:'rgba(63,185,80,0.12)', border:'1px solid rgba(63,185,80,0.3)', color:'#3fb950' }}>
          <span className="pulse-dot" />
          LIVE · SBI Global Fintech Fest 2026 · All systems running on Vercel Edge
        </div>
        <div className="text-6xl mb-4 floaty">🌾</div>
        <h1 className="text-5xl sm:text-6xl font-black mb-4 shimmer-text" style={{
          background: 'linear-gradient(90deg,#ffffff,#64ffda,#82b1ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>YONO-Oracle IIE</h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-2">
          India’s first <span className="text-white font-bold">fully autonomous parametric crop insurance engine</span> —
          oracle-verified, AI-quorum-governed, blockchain-audited, IMPS-settled.
        </p>
        <p className="text-[#64ffda] text-sm mb-8">NASA · IMD · ISRO · ICAR · PM-FASAL · DigiLocker · UPI · Aadhaar</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/demo" className="px-8 py-3.5 rounded-xl font-bold text-[#030712] text-sm" style={{ background:'linear-gradient(135deg,#64ffda,#3fb950)', boxShadow:'0 4px 24px rgba(100,255,218,0.35)' }}>⚡ Start Live Demo →</Link>
          <Link href="/impact" className="px-6 py-3.5 rounded-xl font-bold text-sm" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', color:'#e6edf3' }}>📊 Impact Metrics</Link>
          <Link href="/architecture" className="px-6 py-3.5 rounded-xl font-bold text-sm" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', color:'#e6edf3' }}>🏗️ Architecture</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STATS.map((s,i) => (
          <div key={i} className="glass text-center py-5 px-3">
            <div className="text-3xl font-black text-[#64ffda]">{s.value}</div>
            <div className="text-sm font-bold text-[#e6edf3] mt-1">{s.label}</div>
            <div className="text-[10px] text-[#7d8590] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live impact ticker */}
      <div className="rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4" style={{ background:'linear-gradient(135deg,rgba(100,255,218,0.06),rgba(130,177,255,0.06))', border:'1px solid rgba(100,255,218,0.15)' }}>
        <div>
          <div className="text-[10px] font-bold text-[#64ffda] tracking-widest uppercase mb-2">📈 Live Impact vs PMFBY</div>
          <div key={itick} className="flip-in text-sm">
            <span className="text-white font-bold">{im.label}:</span>&nbsp;
            <span style={{ color:'#f85149', textDecoration:'line-through' }}>{im.before}</span>
            &nbsp;→&nbsp;
            <span style={{ color:'#3fb950', fontWeight:700 }}>{im.after}</span>&nbsp;
            <span style={{ background:'rgba(63,185,80,0.15)', border:'1px solid rgba(63,185,80,0.35)', borderRadius:6, padding:'2px 8px', fontSize:11, color:'#3fb950', fontWeight:700 }}>▲ {im.delta}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#64ffda] mb-1">🌾 LIVE · Total Coverage Active</div>
          <div className="text-3xl font-black text-[#e6edf3] font-mono">{fmt(amt)}</div>
          <div className="text-[10px] text-[#7d8590]">demo simulation · updates every ~2s</div>
        </div>
      </div>

      {/* Animated pipeline */}
      <div className="mb-8">
        <h2 className="text-center font-black text-[#e6edf3] mb-4 text-lg">🔄 Autonomous Pipeline — Live</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {PIPELINE.map((p,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', flex:1, minWidth:140 }}>
              <div style={{
                flex:1, borderRadius:14, padding:'14px 10px', textAlign:'center',
                background: i===ap ? 'rgba(100,255,218,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${i===ap ? '#64ffda' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: i===ap ? '0 0 20px rgba(100,255,218,0.2)' : 'none',
                transition: 'all 0.5s ease',
              }}>
                <div style={{ fontSize:24, marginBottom:5 }}>{p.icon}</div>
                <div style={{ fontSize:11.5, fontWeight:700, color: i===ap ? '#64ffda' : '#7d8590' }}>{p.step}</div>
                <div style={{ fontSize:10, color: i===ap ? '#a7f3d0' : '#4a5568', marginTop:3, lineHeight:1.4 }}>{p.detail}</div>
              </div>
              {i<PIPELINE.length-1&&<span style={{ color:i===ap?'#64ffda':'#21262d', fontSize:18, margin:'0 3px', flexShrink:0 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Nav grid */}
      <h2 className="text-center font-black text-[#e6edf3] mb-4 text-lg">🚀 Explore the Engine</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {LINKS.map(l=>(
          <Link key={l.href} href={l.href} className="navcard block rounded-2xl p-5 no-underline" style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${l.color}33`, boxShadow:'0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`${l.color}18`, border:`1px solid ${l.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:10 }}>{l.emoji}</div>
            <div style={{ color:'#e6edf3', fontWeight:700, fontSize:13, marginBottom:3 }}>{l.label}</div>
            <div style={{ color:'#7d8590', fontSize:11, lineHeight:1.5 }}>{l.sub}</div>
            <div style={{ marginTop:8, fontSize:11, color:l.color, fontWeight:600 }}>Explore →</div>
          </Link>
        ))}
      </div>

      {/* India Stack badges */}
      <div className="glass p-5 mb-8">
        <div className="text-center text-[10px] font-bold text-[#64ffda] tracking-widest uppercase mb-4">India Stack Integration</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {['🆔 Aadhaar KYC','📁 DigiLocker','💳 UPI / IMPS','🌾 PM-FASAL','🛰️ NASA MODIS','🌧️ IMD Rainfall','🌡️ ISRO Bhuvan','🌱 ICAR Soil','⛓️ SHA-256 Ledger','🤖 NaiveBayes ML','🏛️ NPCI UTR','📱 SMS Fallback'].map(b=>(
            <span key={b} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:999, padding:'5px 12px', fontSize:11.5, color:'#e6edf3' }}>{b}</span>
          ))}
        </div>
      </div>

      <div className="text-center text-[#7d8590] text-xs pb-6">
        Built for SBI Global Fintech Fest 2026 · YONO-Oracle Intelligent Insurance Engine · All engines live on Vercel Edge
      </div>
    </div>
  );
}
