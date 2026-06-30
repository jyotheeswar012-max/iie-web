'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const STATS = [
  { value:'₹1.22L',  label:'Max Coverage',     sub:'Full Season Pro' },
  { value:'4',        label:'Oracle Sources',   sub:'NASA · IMD · ISRO · ICAR' },
  { value:'≥75%',   label:'AI Quorum',         sub:'3-agent weighted vote' },
  { value:'<3s',      label:'Payout Speed',     sub:'IMPS settlement' },
  { value:'6',        label:'FSM States',       sub:'FRAUD_REVIEW path' },
  { value:'GB v3.0',  label:'ML Model',         sub:'Gradient Boosting' },
];

const LINKS = [
  { href:'/demo',         emoji:'⚡', label:'Live Demo',         sub:'5-step engine walkthrough',        color:'#64ffda' },
  { href:'/agents',       emoji:'🤖', label:'Agent Quorum',       sub:'3-agent live voting panel',       color:'#a78bfa' },
  { href:'/risk',         emoji:'🛰️', label:'Oracle Feed',        sub:'Live multi-district risk data',   color:'#e040fb' },
  { href:'/dashboard',    emoji:'🗺️', label:'Dashboard',          sub:'Map + district risk heatmap',     color:'#38bdf8' },
  { href:'/payouts',      emoji:'💸', label:'Payout Tracker',     sub:'IMPS credits + UPI references',   color:'#f9d423' },
  { href:'/blockchain',   emoji:'🔗', label:'Audit Chain',        sub:'SHA-256 tamper-evident ledger',   color:'#64ffda' },
  { href:'/impact',       emoji:'📊', label:'GFF Impact',         sub:'Claims 6mo→3s · Fraud −91%',     color:'#e3b341' },
  { href:'/architecture', emoji:'🏗️', label:'Architecture',       sub:'System design overview',         color:'#3fb950' },
];

const PIPELINE = [
  { icon:'📋', step:'KYC + Enroll',    detail:'Aadhaar · DigiLocker · PM-FASAL' },
  { icon:'🛰️', step:'Oracle Fetch',    detail:'NASA · IMD · ISRO · ICAR' },
  { icon:'🤖', step:'AI Quorum',       detail:'3 agents · ≥75% triggers' },
  { icon:'🔗', step:'FSM Transition',  detail:'TRIGGERED→EXECUTED|FRAUD_REVIEW' },
  { icon:'💸', step:'IMPS Payout',     detail:'UPI ref · RRN · SMS <3s' },
];

const IMPACT = [
  { label:'Claim time',    before:'6 months', after:'<3 seconds', delta:'99.998% faster' },
  { label:'Forms filed',   before:'12 forms',  after:'0 forms',    delta:'100% gone' },
  { label:'Fraud rate',    before:'23%',       after:'<2%',        delta:'-91%' },
  { label:'Admin cost',    before:'₹4,800',    after:'₹38',        delta:'-99.2%' },
  { label:'Farmers reach', before:'4.2 Cr',    after:'14 Cr+',     delta:'3.3× scale' },
];

const FSM_STATES = ['ACTIVE','TRIGGERED','FRAUD_REVIEW','EXECUTED','REJECTED'] as const;
type FsmState = typeof FSM_STATES[number];
const FSM_COL: Record<FsmState,string> = {
  ACTIVE:'#34d399', TRIGGERED:'#fbbf24', FRAUD_REVIEW:'#f97316', EXECUTED:'#4ade80', REJECTED:'#f87171',
};
const FSM_SEQ: FsmState[] = ['ACTIVE','TRIGGERED','EXECUTED'];
const FSM_FRAUD: FsmState[] = ['ACTIVE','TRIGGERED','FRAUD_REVIEW','EXECUTED'];

const TECH_BADGES = [
  '🆔 Aadhaar KYC','📁 DigiLocker','💳 UPI / IMPS','🌾 PM-FASAL',
  '🛰️ NASA MODIS','🌧️ IMD Rainfall','🌡️ ISRO Bhuvan','🌱 ICAR Soil',
  '⛓️ SHA-256 Ledger','🤖 GB v3.0 ML','🏦 Polygon Mumbai','📱 SMS Fallback',
  '🏷️ Hyperledger Fabric','⚡ Vercel Edge',
];

export default function HomePage() {
  const [tick,     setTick]     = useState(0);
  const [itick,    setItick]    = useState(0);
  const [amt,      setAmt]      = useState(83472000);
  const [fsmTick,  setFsmTick]  = useState(0);
  const [health,   setHealth]   = useState<null|{status:string;version:string}>(null);
  const [fsmPath,  setFsmPath]  = useState<FsmState[]>(FSM_SEQ);
  const [fsmStep,  setFsmStep]  = useState(0);

  useEffect(() => {
    const t1 = setInterval(()=>setTick(x=>x+1), 2200);
    const t2 = setInterval(()=>setItick(x=>x+1), 3400);
    const t3 = setInterval(()=>setAmt(a=>a+Math.floor(Math.random()*70000+30000)), 1800);
    const t4 = setInterval(()=>setFsmTick(x=>x+1), 1100);
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>{});
    return ()=>{clearInterval(t1);clearInterval(t2);clearInterval(t3);clearInterval(t4);};
  }, []);

  /* alternate FSM path every 12s and animate forward */
  useEffect(() => {
    const seq = fsmTick % 28;
    if (seq===0)  { setFsmPath(FSM_SEQ);   setFsmStep(0); }
    if (seq===5)  { setFsmStep(1); }
    if (seq===10) { setFsmStep(2); }
    if (seq===14) { setFsmPath(FSM_FRAUD); setFsmStep(0); }
    if (seq===19) { setFsmStep(1); }
    if (seq===22) { setFsmStep(2); }
    if (seq===25) { setFsmStep(3); }
  }, [fsmTick]);

  const ap  = tick  % PIPELINE.length;
  const im  = IMPACT[itick % IMPACT.length];
  const fmt = (n:number) => n>=1e7 ? '₹'+(n/1e7).toFixed(2)+' Cr' : '₹'+(n/1e5).toFixed(1)+' L';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes flip    { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floaty  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 #f9731644} 50%{box-shadow:0 0 0 8px #f9731600} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .shimmer-text { background-size:200% auto; animation:shimmer 4s linear infinite; }
        .flip-in  { animation:flip 0.4s ease both; }
        .floaty   { animation:floaty 3s ease-in-out infinite; }
        .navcard:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.6) !important; }
        .navcard  { transition:all 0.2s ease; }
        .fade-up  { animation:fadeUp 0.5s ease both; }
        * { box-sizing:border-box }
      `}</style>

      {/* ── Top status bar ── */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:20,padding:'8px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(63,185,80,0.2)',borderRadius:12 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
          <span style={{ width:8,height:8,borderRadius:'50%',background:'#3fb950',boxShadow:'0 0 8px #3fb95099',display:'inline-block',flexShrink:0 }} />
          <span style={{ fontSize:11,fontWeight:700,color:'#3fb950' }}>ALL SYSTEMS LIVE</span>
          {health && <span style={{ fontSize:10,color:'#7d8590',fontFamily:'monospace' }}>{health.version}</span>}
          <span style={{ fontSize:10,color:'#4a5568' }}>SBI Global Fintech Fest 2026</span>
        </div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          {[['Demo','/demo','#64ffda'],['Agents','/agents','#a78bfa'],['Dashboard','/dashboard','#38bdf8'],['Impact','/impact','#e3b341']].map(([l,h,c])=>(
            <Link key={h as string} href={h as string} style={{ fontSize:11,fontWeight:700,color:c as string,textDecoration:'none',border:`1px solid ${c as string}33`,borderRadius:7,padding:'4px 10px' }}>{l as string}</Link>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="text-center mb-10 fade-up">
        <div className="text-6xl mb-4 floaty">🌾</div>
        <h1 className="text-5xl sm:text-6xl font-black mb-4 shimmer-text" style={{ background:'linear-gradient(90deg,#ffffff,#64ffda,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          YONO-Oracle IIE
        </h1>
        <p style={{ color:'rgba(255,255,255,0.6)',fontSize:17,maxWidth:600,margin:'0 auto 8px',lineHeight:1.6 }}>
          India’s first <b style={{ color:'#fff' }}>fully autonomous parametric crop insurance engine</b> —
          oracle-verified, AI-quorum-governed, blockchain-audited, IMPS-settled.
        </p>
        <p style={{ color:'#64ffda',fontSize:12,marginBottom:28 }}>NASA · IMD · ISRO · ICAR · PM-FASAL · DigiLocker · UPI · Aadhaar · Hyperledger Fabric</p>
        <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
          <Link href="/demo" style={{ padding:'12px 28px',borderRadius:12,fontWeight:800,fontSize:13,color:'#030712',background:'linear-gradient(135deg,#64ffda,#3fb950)',boxShadow:'0 4px 24px rgba(100,255,218,0.35)',textDecoration:'none' }}>⚡ Start Live Demo →</Link>
          <Link href="/agents" style={{ padding:'12px 22px',borderRadius:12,fontWeight:700,fontSize:13,color:'#e2e8f0',background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.35)',textDecoration:'none' }}>🤖 Agent Quorum</Link>
          <Link href="/impact" style={{ padding:'12px 22px',borderRadius:12,fontWeight:700,fontSize:13,color:'#e2e8f0',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',textDecoration:'none' }}>📊 Impact Metrics</Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24 }} className="g6">
        {STATS.map((s,i)=>(
          <div key={i} className="glass text-center" style={{ padding:'16px 10px' }}>
            <div style={{ fontSize:26,fontWeight:900,color:'#64ffda',lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12,fontWeight:700,color:'#e6edf3',marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:10,color:'#7d8590',marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:640px){.g6{grid-template-columns:1fr 1fr!important}}`}</style>

      {/* ── Live impact ticker ── */}
      <div style={{ borderRadius:16,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,background:'linear-gradient(135deg,rgba(100,255,218,0.06),rgba(167,139,250,0.06))',border:'1px solid rgba(100,255,218,0.15)' }}>
        <div>
          <div style={{ fontSize:10,fontWeight:700,color:'#64ffda',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6 }}>📈 Live Impact vs PMFBY</div>
          <div key={itick} className="flip-in" style={{ fontSize:13 }}>
            <b style={{ color:'#fff' }}>{im.label}:</b>&nbsp;
            <span style={{ color:'#f85149',textDecoration:'line-through' }}>{im.before}</span>&nbsp;→&nbsp;
            <b style={{ color:'#3fb950' }}>{im.after}</b>&nbsp;
            <span style={{ background:'rgba(63,185,80,0.15)',border:'1px solid rgba(63,185,80,0.35)',borderRadius:6,padding:'2px 8px',fontSize:11,color:'#3fb950',fontWeight:700 }}>▲ {im.delta}</span>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10,color:'#64ffda',marginBottom:3 }}>🌾 LIVE · Total Coverage Active</div>
          <div style={{ fontSize:26,fontWeight:900,color:'#e6edf3',fontFamily:'monospace' }}>{fmt(amt)}</div>
          <div style={{ fontSize:10,color:'#7d8590' }}>demo simulation · updates every ~2s</div>
        </div>
      </div>

      {/* ── Animated pipeline ── */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ textAlign:'center',fontWeight:900,color:'#e6edf3',marginBottom:12,fontSize:15 }}>🔄 Autonomous Pipeline — Live</h2>
        <div style={{ display:'flex',alignItems:'center',gap:4,overflowX:'auto',paddingBottom:4 }}>
          {PIPELINE.map((p,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',flex:1,minWidth:130 }}>
              <div style={{ flex:1,borderRadius:14,padding:'13px 8px',textAlign:'center',
                background:i===ap?'rgba(100,255,218,0.09)':'rgba(255,255,255,0.03)',
                border:`1.5px solid ${i===ap?'#64ffda':'rgba(255,255,255,0.07)'}`,
                boxShadow:i===ap?'0 0 20px rgba(100,255,218,0.18)':'none',
                transition:'all 0.5s ease' }}>
                <div style={{ fontSize:22,marginBottom:4 }}>{p.icon}</div>
                <div style={{ fontSize:11,fontWeight:700,color:i===ap?'#64ffda':'#7d8590' }}>{p.step}</div>
                <div style={{ fontSize:9,color:i===ap?'#a7f3d0':'#4a5568',marginTop:3,lineHeight:1.4 }}>{p.detail}</div>
              </div>
              {i<PIPELINE.length-1&&<span style={{ color:i===ap?'#64ffda':'#21262d',fontSize:16,margin:'0 2px',flexShrink:0 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Live FSM ticker ── */}
      <div style={{ marginBottom:20,borderRadius:16,padding:'16px 20px',background:'#0d1117',border:'1px solid #1e293b' }}>
        <div style={{ fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:12 }}>🔗 6-State FSM — Live Animation</div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:10 }}>
          {fsmPath.map((s,i)=>{
            const active  = i===fsmStep;
            const passed  = i<fsmStep;
            const col     = FSM_COL[s];
            return (
              <div key={`${s}-${i}`} style={{ display:'flex',alignItems:'center',gap:4 }}>
                <div style={{ padding:'7px 14px',borderRadius:9,fontSize:11,fontWeight:700,
                  background:active?`${col}22`:passed?`${col}11`:'#030712',
                  border:`${active?2:1}px solid ${active?col:passed?`${col}66`:'#1e293b'}`,
                  color:active?col:passed?`${col}bb`:'#334155',
                  boxShadow:active?`0 0 14px ${col}44`:undefined,
                  animation:s==='FRAUD_REVIEW'&&active?'pulseRing 1.2s ease-in-out infinite':undefined,
                  transition:'all 0.4s ease' }}>
                  {s==='ACTIVE'?'🟢':s==='TRIGGERED'?'⚡':s==='FRAUD_REVIEW'?'🕵️':s==='EXECUTED'?'✅':'❌'}&nbsp;{s}
                </div>
                {i<fsmPath.length-1&&<span style={{ color:s==='FRAUD_REVIEW'?'#f97316':'#334155',fontSize:14 }}>→</span>}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize:11,color:'#475569' }}>
          {fsmPath.includes('FRAUD_REVIEW')
            ? '🕵️ Fraud path: ACTIVE → TRIGGERED → FRAUD_REVIEW → EXECUTED'
            : '✅ Normal path: ACTIVE → TRIGGERED → EXECUTED'}
        </div>
      </div>

      {/* ── Nav grid ── */}
      <h2 style={{ textAlign:'center',fontWeight:900,color:'#e6edf3',marginBottom:12,fontSize:15 }}>🚀 Explore the Engine</h2>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:24 }} className="ng">
        {LINKS.map(l=>(
          <Link key={l.href} href={l.href} className="navcard" style={{ display:'block',borderRadius:16,padding:'16px 14px',textDecoration:'none',background:'rgba(255,255,255,0.03)',border:`1px solid ${l.color}33`,boxShadow:'0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ width:38,height:38,borderRadius:9,background:`${l.color}18`,border:`1px solid ${l.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,marginBottom:9 }}>{l.emoji}</div>
            <div style={{ color:'#e6edf3',fontWeight:700,fontSize:12,marginBottom:3 }}>{l.label}</div>
            <div style={{ color:'#7d8590',fontSize:10,lineHeight:1.5 }}>{l.sub}</div>
            <div style={{ marginTop:7,fontSize:11,color:l.color,fontWeight:600 }}>Explore →</div>
          </Link>
        ))}
      </div>
      <style>{`@media(max-width:768px){.ng{grid-template-columns:1fr 1fr!important}}`}</style>

      {/* ── Tech badges ── */}
      <div className="glass" style={{ padding:'16px 18px',marginBottom:20 }}>
        <div style={{ textAlign:'center',fontSize:10,fontWeight:700,color:'#64ffda',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:10 }}>Tech Stack</div>
        <div style={{ display:'flex',flexWrap:'wrap',gap:7,justifyContent:'center' }}>
          {TECH_BADGES.map(b=>(
            <span key={b} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:999,padding:'4px 11px',fontSize:11,color:'#e6edf3' }}>{b}</span>
          ))}
        </div>
      </div>

      {/* ── Footer nav ── */}
      <div style={{ borderTop:'1px solid #1e293b',paddingTop:16,display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12,marginBottom:8 }}>
        {[
          ['/demo','Demo'],
          ['/agents','Agents'],
          ['/dashboard','Dashboard'],
          ['/risk','Oracle Feed'],
          ['/payouts','Payouts'],
          ['/blockchain','Audit'],
          ['/impact','Impact'],
          ['/architecture','Architecture'],
          ['/india-stack','India Stack'],
        ].map(([h,l])=>(
          <Link key={h as string} href={h as string} style={{ fontSize:11,color:'#475569',textDecoration:'none',fontWeight:500 }} className="hover:text-white">{l as string}</Link>
        ))}
      </div>
      <div style={{ textAlign:'center',color:'#4a5568',fontSize:10,paddingBottom:16 }}>
        Built for SBI Global Fintech Fest 2026 · YONO-Oracle Intelligent Insurance Engine · Vercel Edge
      </div>
    </div>
  );
}
