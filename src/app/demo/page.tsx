'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type Step = 'enroll'|'verify'|'execute'|'audit'|'ml';
type CState = 'ACTIVE'|'TRIGGERED'|'EXECUTED';

interface Policy {
  policy_id:string; contract_address:string; net_premium_inr:number;
  subsidy_applied:number; coverage_inr:number; block_deployed:number;
  deploy_tx:string; message:string; upi_debit_ref:string; aadhaar_hash:string; kyc:Record<string,unknown>;
}
interface Agent {
  decision:string; confidence:number; weight:string; deliberation:string[];
}
interface VerifyResult {
  policy_id:string; district:string; event_type:string; contract_state:CState;
  payout_amount:number|null;
  oracle_data:{ sources:Record<string,{value:number;unit:string}>; derived:Record<string,number>; };
  agent_quorum:{
    agents:Record<string,Agent>; yes_count:number; total_agents:number;
    weighted_confidence:number; confidence_pct:number; quorum_met:boolean; quorum_rule:string;
  };
}
interface ExecuteResult {
  success:boolean; policy_id:string; payout_inr:number; tx_hash:string;
  block_number:number; upi_ref:string; rrn:string; farmer:string;
  credited_to:string; method:string; sms_sent:string; message:string;
  impact:Record<string,unknown>;
}
interface AuditEntry {
  seq:number; ts:string; event:string; policy_id:string;
  hash:string; prev_hash:string; data:Record<string,unknown>;
}
interface MLResult {
  risk_score:number; risk_level:string; triggered:boolean; confidence_pct:number;
  log_likelihoods:Record<string,{llr:number;weight:string;label:string}>;
  total_llr:number; flags:string[]; model:string; recommendation:string;
}

const CROPS   = ['paddy','cotton','wheat','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const PLANS   = ['Basic Protect','Smart Shield','Full Season Pro'];
const EVENTS  = ['drought','flood','heatwave','cyclone'];
const DISTRICTS = ['Barmer','Puri','Latur','Warangal','Nashik','Ludhiana','Jodhpur','Adilabad'];
const EV_COL: Record<string,string> = { drought:'#b45309', flood:'#0369a1', heatwave:'#dc2626', cyclone:'#6d28d9' };
const RK_COL: Record<string,string> = { CRITICAL:'#dc2626', HIGH:'#ea580c', MEDIUM:'#d97706', LOW:'#16a34a' };
const ORC_ICONS: Record<string,string> = { NASA_MODIS:'🛰️', IMD_Rainfall:'🌧️', ISRO_Bhuvan:'🌡️', ICAR_Sensors:'🌱' };

const HI: Record<string,string> = {
  enroll:'किसान नामांकन', oracle:'ओरेकल जाँच', execute:'भुगतान करें',
  audit:'ऑडिट श्रृंखला', ml:'जोखिम मॉडल',
  health:'प्रणाली सक्रिय', loading:'प्रसंस्करण…',
  enroll_btn:'🚀 पॉलिसी जारी करें', payout_done:'✅ भुगतान हो गया!',
  sms_label:'📱 किसान को SMS',
};

function Spin() {
  return <span style={{ display:'inline-block',width:15,height:15,border:'2px solid #fff4',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />;
}
function Chip({ h }: { h:string }) {
  return <span style={{ fontFamily:'monospace',fontSize:11,background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:4,padding:'2px 6px',color:'#475569',wordBreak:'break-all' }}>{h.slice(0,20)}…</span>;
}
function Badge({ label, color }: { label:string; color?:string }) {
  return <span style={{ background:`${color??'#0f766e'}22`,color:color??'#0f766e',border:`1px solid ${color??'#0f766e'}44`,borderRadius:6,padding:'2px 10px',fontSize:12,fontWeight:600 }}>{label}</span>;
}
function Dot({ s }: { s:CState }) {
  const c = s==='EXECUTED'?'#16a34a':s==='TRIGGERED'?'#d97706':'#0f766e';
  return <span style={{ display:'inline-flex',alignItems:'center',gap:6 }}><span style={{ width:9,height:9,borderRadius:'50%',background:c,boxShadow:`0 0 6px ${c}88`,display:'inline-block',animation:s==='TRIGGERED'?'pulse 1s infinite':undefined }} /><b style={{ color:c,fontSize:13 }}>{s}</b></span>;
}

function AgentBar({ name, a, delay }: { name:string; a:Agent; delay:number }) {
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState(false);
  const yes = a.decision.includes('YES');
  useEffect(() => {
    const t = setTimeout(() => setWidth(a.confidence), delay);
    return () => clearTimeout(t);
  }, [a.confidence, delay]);
  const col = yes ? '#16a34a' : '#dc2626';
  return (
    <div style={{ background:yes?'#f0fdf4':'#fef2f2',border:`1px solid ${yes?'#86efac':'#fca5a5'}`,borderRadius:10,padding:'12px 14px',cursor:'pointer' }} onClick={()=>setOpen(o=>!o)}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
        <div style={{ fontSize:12,fontWeight:700,color:col }}>{yes?'✅':'❌'} {name.replace(/_/g,' ')}</div>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <span style={{ fontSize:11,color:'#94a3b8' }}>{a.weight}</span>
          <span style={{ fontWeight:700,fontSize:13,color:col }}>{a.confidence}%</span>
          <span style={{ fontSize:10,color:'#94a3b8' }}>{open?'▲':'▼'}</span>
        </div>
      </div>
      <div style={{ background:'#e2e8f0',borderRadius:4,height:8,overflow:'hidden' }}>
        <div style={{ width:`${width}%`,background:`linear-gradient(90deg,${col}88,${col})`,height:8,borderRadius:4,transition:'width 1s ease-out' }} />
      </div>
      {open && (
        <div style={{ marginTop:10,borderTop:'1px solid #e2e8f0',paddingTop:10 }}>
          <div style={{ fontSize:11,fontWeight:600,color:'#64748b',marginBottom:6 }}>DELIBERATION LOG</div>
          {a.deliberation.map((line,i) => (
            <div key={i} style={{ fontSize:11,color:'#334155',padding:'3px 0',borderBottom:i<a.deliberation.length-1?'1px dashed #e2e8f0':undefined,display:'flex',gap:8 }}>
              <span style={{ color:'#94a3b8',minWidth:16 }}>{i+1}.</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimModal({ exec, onClose, hindi }: { exec:ExecuteResult; onClose:()=>void; hindi:boolean }) {
  const [confetti] = useState(() => Array.from({length:30},(_,i)=>({ id:i, x:Math.random()*100, color:['#16a34a','#0f766e','#d97706','#2563eb','#7c3aed'][i%5], delay:Math.random()*0.8, size:6+Math.random()*10 })));
  return (
    <div style={{ position:'fixed',inset:0,background:'#000a',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:24,padding:'40px 36px',maxWidth:480,width:'90%',textAlign:'center',position:'relative',overflow:'hidden',boxShadow:'0 25px 60px #0004' }} onClick={e=>e.stopPropagation()}>
        {confetti.map(c=>(
          <div key={c.id} style={{ position:'absolute',left:`${c.x}%`,top:-20,width:c.size,height:c.size,background:c.color,borderRadius:2,animation:`confettiFall 2s ease-in ${c.delay}s both` }} />
        ))}
        <div style={{ fontSize:60,marginBottom:8 }}>🎉</div>
        <div style={{ fontSize:22,fontWeight:900,color:'#16a34a',marginBottom:4 }}>
          {hindi?'भुगतान हो गया!':'Claim Triggered!'}
        </div>
        <div style={{ fontSize:40,fontWeight:900,color:'#0f766e',marginBottom:8 }}>₹{exec.payout_inr.toLocaleString()}</div>
        <div style={{ fontSize:14,color:'#64748b',marginBottom:20 }}>
          {hindi?`${exec.farmer} के खाते में IMPS द्वारा भेजा गया`:`Credited to ${exec.farmer} via IMPS`}
        </div>
        <div style={{ background:'#f0fdf4',border:'1px solid #86efac',borderRadius:12,padding:'14px 16px',marginBottom:16,textAlign:'left' }}>
          <div style={{ fontSize:11,color:'#64748b',fontWeight:600,marginBottom:6 }}>{hindi?'📱 किसान को SMS':'📱 SMS Sent to Farmer'}</div>
          <div style={{ fontSize:12,color:'#0f172a',lineHeight:1.7,fontFamily:'monospace' }}>{exec.sms_sent}</div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20 }}>
          {[['UPI Ref',exec.upi_ref],['RRN',exec.rrn],['Block',String(exec.block_number)],['Method',exec.method]].map(([k,v])=>(
            <div key={k} style={{ background:'#f8fafc',borderRadius:8,padding:'8px 10px' }}>
              <div style={{ fontSize:10,color:'#94a3b8' }}>{k}</div>
              <div style={{ fontSize:12,fontWeight:700,color:'#0f172a',fontFamily:'monospace' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:12,background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px',marginBottom:20 }}>
          <div><span style={{ color:'#94a3b8' }}>{hindi?'परंपरागत दावा:':'Traditional:'}</span> <b style={{ color:'#dc2626' }}>180 {hindi?'दिन':'days'}</b></div>
          <div><span style={{ color:'#94a3b8' }}>IIE:</span> <b style={{ color:'#16a34a' }}>2.3 sec</b></div>
          <div><span style={{ color:'#94a3b8' }}>{hindi?'फॉर्म:':'Forms:'}</span> <b style={{ color:'#16a34a' }}>{hindi?'शून्य':'Zero'}</b></div>
          <div><span style={{ color:'#94a3b8' }}>{hindi?'धोखाधड़ी:':'Fraud:'}</span> <b style={{ color:'#16a34a' }}>{hindi?'असंभव':'Impossible'}</b></div>
        </div>
        <button onClick={onClose} style={{ background:'linear-gradient(135deg,#0f766e,#059669)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer' }}>{hindi?'बंद करें':'Close'}</button>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [step, setStep]     = useState<Step>('enroll');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [hindi, setHindi]   = useState(false);
  const [dark, setDark]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  const [form, setForm] = useState({
    name:'Ramesh Kumar', aadhaar_last4:'4821', district:'Barmer', state:'Rajasthan',
    crop:'wheat', acreage:'4.5', plan:'Smart Shield', event_type:'drought',
  });

  const [policy,  setPolicy]  = useState<Policy|null>(null);
  const [verify,  setVerify]  = useState<VerifyResult|null>(null);
  const [execute, setExecute] = useState<ExecuteResult|null>(null);
  const [audit,   setAudit]   = useState<{chain_valid:boolean;total_entries:number;ledger:AuditEntry[]}|null>(null);
  const [ml,      setMl]      = useState<MLResult|null>(null);
  const [health,  setHealth]  = useState<{status:string;version:string}|null>(null);

  const ping = useCallback(async () => {
    try { const r = await fetch('/api/health'); setHealth(await r.json()); } catch { setHealth(null); }
  }, []);
  useEffect(() => { ping(); }, [ping]);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(()=>setElapsed(e=>e+1), 100) as unknown as NodeJS.Timeout;
  };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } };

  const post = async (url:string, body:object) => {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error||'API error');
    return d;
  };

  const doEnroll = async () => {
    setLoading(true); setError(''); startTimer();
    try {
      const d = await post('/api/oracle/enroll', { ...form, acreage:parseFloat(form.acreage) });
      setPolicy(d); setStep('verify'); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doRamesh = async () => {
    setForm({ name:'Ramesh Kumar', aadhaar_last4:'4821', district:'Barmer', state:'Rajasthan', crop:'wheat', acreage:'4.5', plan:'Smart Shield', event_type:'drought' });
    setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setError(''); setStep('enroll');
    await new Promise(r=>setTimeout(r,100));
    setLoading(true); setError(''); startTimer();
    try {
      const p = await post('/api/oracle/enroll', { name:'Ramesh Kumar',aadhaar_last4:'4821',district:'Barmer',state:'Rajasthan',crop:'wheat',acreage:4.5,plan:'Smart Shield' });
      setPolicy(p);
      const v = await post('/api/oracle/verify', { policy_id:p.policy_id,event_type:'drought',district:'Barmer',crop:'wheat',acreage:4.5 });
      setVerify(v); setStep('execute');
      const x = await post('/api/contract/execute', { policy_id:p.policy_id,farmer_name:'Ramesh Kumar',payout_amount:v.payout_amount });
      setExecute(x); setStep('audit'); setShowModal(true); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doVerify = async () => {
    if (!policy) return;
    setLoading(true); setError(''); startTimer();
    try {
      const d = await post('/api/oracle/verify', { policy_id:policy.policy_id, event_type:form.event_type, district:form.district, crop:form.crop, acreage:parseFloat(form.acreage) });
      setVerify(d); setStep('execute');
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doExecute = async () => {
    if (!policy) return;
    setLoading(true); setError(''); startTimer();
    try {
      const d = await post('/api/contract/execute', { policy_id:policy.policy_id, farmer_name:form.name, payout_amount:verify?.payout_amount });
      setExecute(d); setStep('audit'); setShowModal(true); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doAudit = async () => {
    setLoading(true); setError(''); startTimer();
    try {
      const r = await fetch('/api/audit/trail');
      setAudit(await r.json()); setStep('ml');
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doML = async () => {
    setLoading(true); setError(''); startTimer();
    try {
      const r  = await fetch('/api/oracle/feed');
      const fd = await r.json();
      const row = fd.districts?.[0];
      if (row) {
        const d = await post('/api/ml/predict', { district:row.district, ndvi:row.ndvi, temp_c:row.temp_c, rainfall_mm:row.rainfall_mm, soil_moisture_pct:row.soil_moisture });
        setMl(d);
      }
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const reset = () => {
    setStep('enroll'); setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setError('');
    stopTimer();
    setForm(f => ({ ...f,
      name:'Farmer '+Math.floor(Math.random()*9000+1000),
      aadhaar_last4:String(Math.floor(Math.random()*9000+1000)),
      district:DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)],
      crop:CROPS[Math.floor(Math.random()*CROPS.length)],
    }));
  };

  const bg = dark ? '#0f172a' : '#f1f5f9';
  const card = dark ? { background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:'20px 22px' } : { background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'20px 22px' };
  const txt = dark ? '#f1f5f9' : '#0f172a';
  const sub = dark ? '#94a3b8' : '#64748b';

  const STEPS: {id:Step;label:string}[] = [
    {id:'enroll', label:hindi?HI.enroll:'1. Enroll'},
    {id:'verify', label:hindi?'2. '+HI.oracle:'2. Oracle'},
    {id:'execute',label:hindi?'3. '+HI.execute:'3. Execute'},
    {id:'audit',  label:hindi?'4. '+HI.audit:'4. Audit'},
    {id:'ml',     label:hindi?'5. '+HI.ml:'5. ML'},
  ];
  const ORDER: Step[] = ['enroll','verify','execute','audit','ml'];
  const done = (id:Step) => ORDER.indexOf(id)<ORDER.indexOf(step);

  return (
    <div style={{ minHeight:'100vh', background:bg, fontFamily:"'Inter',system-ui,sans-serif", color:txt, transition:'background 0.3s' }}>
      <style>{`
        @keyframes spin         { to{transform:rotate(360deg)} }
        @keyframes fadeIn       { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes confettiFall { from{transform:translateY(-20px) rotate(0deg);opacity:1} to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes celebrate    { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
        .fi  { animation:fadeIn 0.35s ease }
        .cel { animation:celebrate 0.5s ease }
        *    { box-sizing:border-box }
        button { cursor:pointer }
        input,select { outline:none;font-family:inherit }
        input:focus,select:focus { border-color:#0f766e!important;box-shadow:0 0 0 3px #0f766e22 }
        @media(max-width:640px) { .grid2{grid-template-columns:1fr!important} .grid4{grid-template-columns:1fr 1fr!important} }
      `}</style>

      {showModal && execute && <ClaimModal exec={execute} onClose={()=>setShowModal(false)} hindi={hindi} />}

      {/* Top nav */}
      <div style={{ background:dark?'#1e293b':'#fff',borderBottom:`1px solid ${dark?'#334155':'#e2e8f0'}`,padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
        <div style={{ display:'flex',overflowX:'auto' }}>
          {STEPS.map((s,i)=>{
            const active=step===s.id, d=done(s.id);
            return (
              <div key={s.id} style={{ display:'flex',alignItems:'center' }}>
                <div onClick={()=>d?setStep(s.id):null}
                  style={{ display:'flex',alignItems:'center',gap:5,padding:'14px 16px',whiteSpace:'nowrap',
                    borderBottom:active?'3px solid #0f766e':d?'3px solid #16a34a':'3px solid transparent',
                    cursor:d?'pointer':'default' }}>
                  <span style={{ fontSize:14 }}>{d?'✅':['📋','🛰️','⚡','🔗','🤖'][i]}</span>
                  <span style={{ fontSize:12,fontWeight:active?700:500,color:active?'#0f766e':d?'#16a34a':sub }}>{s.label}</span>
                </div>
                {i<STEPS.length-1&&<span style={{ color:'#cbd5e1',fontSize:14 }}>›</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 0',flexShrink:0 }}>
          {health&&<span style={{ fontSize:11,color:'#16a34a',fontWeight:600 }}>🟢 {health.version}</span>}
          {loading&&<span style={{ fontSize:11,color:'#0f766e' }}>⏱ {(elapsed/10).toFixed(1)}s</span>}
          <button onClick={()=>setHindi(h=>!h)} title="Hindi toggle"
            style={{ background:hindi?'#0f766e':'#f1f5f9',color:hindi?'#fff':txt,border:`1px solid ${dark?'#475569':'#e2e8f0'}`,borderRadius:8,padding:'6px 10px',fontSize:12,fontWeight:600 }}>
            {hindi?'EN':'हि'}
          </button>
          <button onClick={()=>setDark(d=>!d)} title="Dark mode"
            style={{ background:dark?'#f1f5f9':'#0f172a',color:dark?'#0f172a':'#f1f5f9',border:'none',borderRadius:8,padding:'6px 10px',fontSize:12 }}>
            {dark?'☀️':'🌙'}
          </button>
          <button onClick={reset}
            style={{ background:'#0f766e',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:600 }}>+ New</button>
        </div>
      </div>

      {/* Ramesh one-click banner */}
      <div style={{ background:'linear-gradient(135deg,#0f766e,#0369a1)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}>
        <div>
          <div style={{ color:'#fff',fontWeight:700,fontSize:14 }}>{hindi?'⚡ एक क्लिक डेमो — रमेश कुमार, बाड़मेर':'⚡ One-click Demo — Enroll Ramesh Kumar in Barmer'}</div>
          <div style={{ color:'#a7f3d0',fontSize:12,marginTop:2 }}>{hindi?'नामांकन → ओरेकल → भुगतान — 3 चरण स्वचालित':'Enroll → Oracle → Payout in one shot. Watch live agent votes.'}</div>
        </div>
        <button onClick={doRamesh} disabled={loading}
          style={{ background:loading?'#94a3b8':'#fff',color:loading?'#fff':'#0f766e',border:'none',borderRadius:10,padding:'11px 24px',fontSize:14,fontWeight:800,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 14px #0004',flexShrink:0 }}>
          {loading?<><Spin/> {hindi?'चल रहा है…':'Running…'}</>:<>🚀 {hindi?'रमेश के रूप में नामांकित करें':'Enroll as Ramesh in Barmer'}</>}
        </button>
      </div>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'20px 16px' }}>
        {error&&<div className="fi" style={{ background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:10,padding:'10px 16px',color:'#dc2626',marginBottom:14,fontSize:13 }}>⚠️ {error}</div>}

        {/* STEP 1 */}
        {step==='enroll'&&(
          <div className="fi">
            <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:txt }}>{hindi?'📋 किसान नामांकन':'📋 Step 1 — Enroll Farmer'}</h2>
            <p style={{ color:sub,fontSize:13,marginBottom:18 }}>{hindi?'आधार eKYC · DigiLocker RoR · PM-FASAL सब्सिडी · ऑन-चेन कॉन्ट्रैक्ट':'Aadhaar eKYC OTP · DigiLocker RoR pull · PM-FASAL subsidy · On-chain contract deploy.'}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }} className="grid2">
              <div style={card}>
                <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14,color:txt }}>{hindi?'किसान विवरण':'Farmer Details'}</h3>
                {([['name',hindi?'किसान का नाम':'Farmer Name','text'],['aadhaar_last4',hindi?'आधार के अंतिम 4':'Aadhaar Last 4','text'],['district',hindi?'जिला':'District','text'],['state',hindi?'राज्य':'State','text'],['acreage',hindi?'एकड़':'Acreage (acres)','number']] as [keyof typeof form,string,string][]).map(([k,l,t])=>(
                  <div key={k} style={{ marginBottom:10 }}>
                    <label style={{ fontSize:11,color:sub,fontWeight:600,display:'block',marginBottom:3 }}>{l}</label>
                    <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} type={t}
                      style={{ width:'100%',border:`1px solid ${dark?'#475569':'#e2e8f0'}`,borderRadius:8,padding:'8px 11px',fontSize:13,background:dark?'#0f172a':'#fff',color:txt,transition:'all 0.2s' }} />
                  </div>
                ))}
              </div>
              <div style={card}>
                <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14,color:txt }}>{hindi?'फसल और योजना':'Crop & Plan'}</h3>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11,color:sub,fontWeight:600,display:'block',marginBottom:3 }}>{hindi?'फसल':'Crop'}</label>
                  <select value={form.crop} onChange={e=>setForm(f=>({...f,crop:e.target.value}))}
                    style={{ width:'100%',border:`1px solid ${dark?'#475569':'#e2e8f0'}`,borderRadius:8,padding:'8px 11px',fontSize:13,background:dark?'#0f172a':'#fff',color:txt }}>
                    {CROPS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11,color:sub,fontWeight:600,display:'block',marginBottom:3 }}>{hindi?'बीमा योजना':'Insurance Plan'}</label>
                  <select value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value}))}
                    style={{ width:'100%',border:`1px solid ${dark?'#475569':'#e2e8f0'}`,borderRadius:8,padding:'8px 11px',fontSize:13,background:dark?'#0f172a':'#fff',color:txt }}>
                    {PLANS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ background:dark?'#14532d':'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 14px' }}>
                  <div style={{ fontSize:11,color:'#16a34a',fontWeight:700,marginBottom:6 }}>📊 {hindi?'प्रीमियम पूर्वावलोकन':'Premium Preview'}</div>
                  {form.plan==='Basic Protect'&&<><div style={{ fontSize:12,color:sub }}>₹2,800 · Coverage ₹42,000</div><div style={{ fontSize:11,color:'#16a34a' }}>PM-FASAL ₹840 → Net ₹1,960</div></>}
                  {form.plan==='Smart Shield'&&<><div style={{ fontSize:12,color:sub }}>₹4,200 · Coverage ₹70,000</div><div style={{ fontSize:11,color:'#16a34a' }}>PM-FASAL ₹1,260 → Net ₹2,940</div></>}
                  {form.plan==='Full Season Pro'&&<><div style={{ fontSize:12,color:sub }}>₹6,300 · Coverage ₹1,22,500</div><div style={{ fontSize:11,color:'#16a34a' }}>PM-FASAL ₹1,890 → Net ₹4,410</div></>}
                </div>
              </div>
            </div>
            <div style={{ marginTop:16,display:'flex',justifyContent:'flex-end' }}>
              <button onClick={doEnroll} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#0f766e,#059669)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 14px #0f766e44' }}>
                {loading&&<Spin />} {loading?(hindi?HI.loading:'Enrolling…'):(hindi?HI.enroll_btn:'🚀 Issue Policy & Deploy Contract')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step==='verify'&&policy&&(
          <div className="fi">
            <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:txt }}>{hindi?'🛰️ ओरेकल + AI कोरम':'🛰️ Step 2 — Oracle + AI Quorum'}</h2>
            <p style={{ color:sub,fontSize:13,marginBottom:18 }}>{hindi?'4 स्रोत · 4 एजेंट · ≥75% भार विश्वास':'4 independent data sources · 4 specialist agents · ≥75% weighted confidence.'}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }} className="grid2">
              <div style={{ ...card,background:dark?'#14532d':'#f0fdf4',border:'1px solid #bbf7d0' }}>
                <div style={{ fontSize:11,color:'#16a34a',fontWeight:700,marginBottom:8 }}>✅ {hindi?'पॉलिसी जारी':'POLICY ISSUED'}</div>
                <div style={{ fontSize:18,fontWeight:900,fontFamily:'monospace',marginBottom:8,color:txt }}>{policy.policy_id}</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8 }}>
                  {[['Coverage','₹'+policy.coverage_inr.toLocaleString()],['Net Premium','₹'+policy.net_premium_inr.toLocaleString()],['PM-FASAL','₹'+policy.subsidy_applied.toLocaleString()],['Block',String(policy.block_deployed)]].map(([k,v])=>(
                    <div key={k}><div style={{ fontSize:10,color:sub }}>{k}</div><div style={{ fontSize:12,fontWeight:700,color:txt }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ fontSize:10,color:sub }}>Contract: <Chip h={policy.contract_address} /></div>
              </div>
              <div style={card}>
                <h3 style={{ fontSize:13,fontWeight:700,marginBottom:12,color:txt }}>{hindi?'घटना का प्रकार चुनें':'Select Event Type'}</h3>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                  {EVENTS.map(ev=>(
                    <button key={ev} onClick={()=>setForm(f=>({...f,event_type:ev}))}
                      style={{ border:`2px solid ${form.event_type===ev?EV_COL[ev]:dark?'#475569':'#e2e8f0'}`,background:form.event_type===ev?`${EV_COL[ev]}20`:dark?'#0f172a':'#fff',borderRadius:10,padding:'10px',transition:'all 0.18s',color:txt }}>
                      <div style={{ fontSize:18,marginBottom:3 }}>{ev==='drought'?'☀️':ev==='flood'?'🌊':ev==='heatwave'?'🔥':'🌀'}</div>
                      <div style={{ fontSize:12,fontWeight:700,color:form.event_type===ev?EV_COL[ev]:txt,textTransform:'capitalize' }}>{ev}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {verify&&(
              <div style={{ ...card,marginBottom:14 }}>
                <h4 style={{ fontSize:13,fontWeight:700,marginBottom:10,color:txt }}>🛰️ Oracle — {verify.district}</h4>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:18 }} className="grid4">
                  {Object.entries(verify.oracle_data.sources).map(([key,s])=>(
                    <div key={key} style={{ background:dark?'#0f172a':'#f8fafc',border:`1px solid ${dark?'#334155':'#e2e8f0'}`,borderRadius:8,padding:'10px 12px' }}>
                      <div style={{ fontSize:10,color:sub,fontWeight:600,marginBottom:3 }}>{ORC_ICONS[key]||'📡'} {key}</div>
                      <div style={{ fontSize:17,fontWeight:800,color:txt }}>{s.value}</div>
                      <div style={{ fontSize:10,color:sub }}>{s.unit}</div>
                    </div>
                  ))}
                </div>
                <h4 style={{ fontSize:13,fontWeight:700,marginBottom:10,color:txt }}>🤖 {hindi?'AI एजेंट मतदान — क्लिक करें':'Agent Votes — click to expand'}</h4>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }} className="grid2">
                  {Object.entries(verify.agent_quorum.agents).map(([name,a],i)=>(
                    <AgentBar key={name} name={name} a={a} delay={i*250} />
                  ))}
                </div>
                <div style={{ background:verify.agent_quorum.quorum_met?(dark?'#14532d':'#f0fdf4'):(dark?'#450a0a':'#fef2f2'),
                  border:`1px solid ${verify.agent_quorum.quorum_met?'#86efac':'#fca5a5'}`,
                  borderRadius:10,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:txt }}>{hindi?'भार विश्वास:':'Weighted Confidence:'} {verify.agent_quorum.weighted_confidence}%</div>
                    <div style={{ fontSize:11,color:sub,marginTop:1 }}>{verify.agent_quorum.yes_count}/{verify.agent_quorum.total_agents} YES · {verify.agent_quorum.quorum_rule}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{ fontSize:13,fontWeight:700,color:'#16a34a',marginTop:2 }}>₹{verify.payout_amount.toLocaleString()} queued</div>}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap' }}>
              <button onClick={doVerify} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#1d4ed8,#2563eb)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 14px #1d4ed844' }}>
                {loading&&<Spin />} {loading?(hindi?HI.loading:'Running…'):(hindi?'🛰️ ओरेकल चलाएं':'🛰️ Run Oracle + Agent Quorum')}
              </button>
              {verify&&<button onClick={()=>setStep('execute')} style={{ background:'linear-gradient(135deg,#d97706,#b45309)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontSize:13,fontWeight:700 }}>⚡ {hindi?'आगे बढ़ें':'Execute →'}</button>}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step==='execute'&&(
          <div className="fi">
            <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:txt }}>{hindi?'⚡ स्मार्ट कॉन्ट्रैक्ट निष्पादित करें':'⚡ Step 3 — Execute Smart Contract'}</h2>
            <p style={{ color:sub,fontSize:13,marginBottom:18 }}>FSM: TRIGGERED → EXECUTED · SHA-256 tx hash · IMPS · NPCI UTR · SMS</p>
            {verify&&(
              <div style={{ ...card,background:dark?'#422006':'#fffbeb',border:'1px solid #fde68a',marginBottom:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:txt }}>{verify.policy_id}</div>
                    <div style={{ fontSize:12,color:sub,marginTop:3 }}>Event: <Badge label={verify.event_type} color={EV_COL[verify.event_type]} /> · <b>{verify.agent_quorum.weighted_confidence}%</b></div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{ fontSize:20,fontWeight:900,color:'#16a34a',marginTop:2 }}>₹{verify.payout_amount.toLocaleString()}</div>}
                  </div>
                </div>
              </div>
            )}
            {execute&&(
              <div className="fi cel" style={{ ...card,background:dark?'#14532d':'#f0fdf4',border:'1px solid #86efac',marginBottom:14 }}>
                <div style={{ fontSize:15,fontWeight:800,color:'#16a34a',marginBottom:12 }}>{hindi?HI.payout_done:'✅ Payout Executed On-Chain + IMPS Credited'}</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12 }} className="grid2">
                  {[['Payout','₹'+execute.payout_inr.toLocaleString(),'#16a34a'],['Method',execute.method,'#0369a1'],['Farmer',execute.farmer,txt],['UPI Ref',execute.upi_ref,'#7c3aed'],['RRN',execute.rrn,'#0f766e'],['Block',String(execute.block_number),'#b45309']].map(([k,v,c])=>(
                    <div key={k} style={{ background:dark?'#0f172a':'#fff',borderRadius:8,padding:'8px 10px',border:`1px solid ${dark?'#334155':'#dcfce7'}` }}>
                      <div style={{ fontSize:10,color:sub,marginBottom:1 }}>{k}</div>
                      <div style={{ fontSize:12,fontWeight:700,color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:dark?'#0f172a':'#fff',border:`1px solid ${dark?'#334155':'#dcfce7'}`,borderRadius:10,padding:'10px 12px' }}>
                  <div style={{ fontSize:10,color:sub,fontWeight:600,marginBottom:3 }}>{hindi?HI.sms_label:'📱 SMS Sent to Farmer'}</div>
                  <div style={{ fontSize:12,color:txt,lineHeight:1.6,fontFamily:'monospace' }}>{execute.sms_sent}</div>
                </div>
              </div>
            )}
            <div style={{ display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap' }}>
              {!execute&&<button onClick={doExecute} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#059669,#16a34a)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 14px #16a34a44' }}>{loading&&<Spin />}{loading?(hindi?HI.loading:'Executing…'):(hindi?'⚡ कॉन्ट्रैक्ट निष्पादित करें':'⚡ Execute Contract + IMPS Payout')}</button>}
              {execute&&<button onClick={()=>setShowModal(true)} style={{ background:'linear-gradient(135deg,#16a34a,#059669)',color:'#fff',border:'none',borderRadius:10,padding:'12px 20px',fontSize:13,fontWeight:700 }}>🎉 {hindi?'भुगतान देखें':'View Payout'}</button>}
              {execute&&<button onClick={doAudit} disabled={loading} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8 }}>{loading&&<Spin />}🔗 {hindi?'ऑडिट देखें':'Audit Chain →'}</button>}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step==='audit'&&(
          <div className="fi">
            <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:txt }}>{hindi?'🔗 SHA-256 ऑडिट श्रृंखला':'🔗 Step 4 — Tamper-Evident Audit Chain'}</h2>
            <p style={{ color:sub,fontSize:13,marginBottom:18 }}>{hindi?'प्रत्येक प्रविष्टि पिछले हैश से जुड़ी है — अपरिवर्तनीय':'SHA-256 chained. Each entry prev_hash links to predecessor — immutable.'}</p>
            {audit&&(
              <div style={{ ...card,marginBottom:14 }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8 }}>
                  <div><div style={{ fontSize:15,fontWeight:800,color:txt }}>{hindi?'ऑडिट बही':'Audit Ledger'}</div><div style={{ fontSize:12,color:sub }}>{audit.total_entries} entries · SHA-256</div></div>
                  <Badge label={audit.chain_valid?'✓ Chain Valid':'⚠ Chain Broken'} color={audit.chain_valid?'#16a34a':'#dc2626'} />
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {[...audit.ledger].reverse().map(entry=>(
                    <div key={entry.seq} style={{ border:`1px solid ${dark?'#334155':'#e2e8f0'}`,borderRadius:10,padding:'10px 12px',
                      background:entry.event.includes('EXECUTED')?(dark?'#14532d':'#f0fdf4'):entry.event.includes('TRIGGERED')?(dark?'#422006':'#fffbeb'):(dark?'#1e293b':'#f8fafc') }}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap',gap:4 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                          <span style={{ fontWeight:700,color:sub,fontSize:11 }}>#{entry.seq}</span>
                          <Badge label={entry.event} color={entry.event.includes('EXECUTED')?'#16a34a':entry.event.includes('TRIGGERED')?'#d97706':'#0f766e'} />
                          <span style={{ fontSize:11,color:sub }}>{entry.policy_id}</span>
                        </div>
                        <span style={{ fontSize:10,color:sub }}>{entry.ts.slice(0,19).replace('T',' ')} UTC</span>
                      </div>
                      <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
                        <div><span style={{ fontSize:10,color:sub }}>HASH </span><Chip h={entry.hash} /></div>
                        <div><span style={{ fontSize:10,color:sub }}>PREV </span><Chip h={entry.prev_hash} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!audit&&(
              <div style={{ textAlign:'center',padding:40 }}>
                <button onClick={doAudit} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8 }}>{loading&&<Spin />}🔗 {hindi?'ऑडिट लाएं':'Fetch Audit Chain'}</button>
              </div>
            )}
            {audit&&<div style={{ display:'flex',justifyContent:'flex-end' }}><button onClick={doML} disabled={loading} style={{ background:'linear-gradient(135deg,#0369a1,#0284c7)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8 }}>{loading&&<Spin />}🤖 {hindi?'ML भविष्यवाणी →':'ML Predictor →'}</button></div>}
          </div>
        )}

        {/* STEP 5 */}
        {step==='ml'&&(
          <div className="fi">
            <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4,color:txt }}>{hindi?'🤖 NaiveBayes जोखिम मॉडल':'🤖 Step 5 — NaiveBayes LLR Risk Score'}</h2>
            <p style={{ color:sub,fontSize:13,marginBottom:18 }}>NDVI 40% + Temp 25% + Rainfall 25% + Soil 10% · Sigmoid → 0–100</p>
            {ml&&(
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }} className="grid2">
                <div style={card}>
                  <div style={{ textAlign:'center',padding:'14px 0 10px' }}>
                    <div style={{ fontSize:56,fontWeight:900,color:RK_COL[ml.risk_level]??txt,lineHeight:1 }}>{ml.risk_score.toFixed(1)}</div>
                    <div style={{ fontSize:10,color:sub,marginBottom:6 }}>{hindi?'/ 100 जोखिम स्कोर':'/ 100.0 risk score (sigmoid)'}</div>
                    <Badge label={ml.risk_level} color={RK_COL[ml.risk_level]} />
                    <div style={{ marginTop:6,fontSize:12,fontWeight:700,color:ml.triggered?'#16a34a':sub }}>
                      {ml.triggered?(hindi?'✅ स्वत: भुगतान ट्रिगर':'✅ AUTO-PAYOUT TRIGGERED'):(hindi?'🟡 ट्रिगर सीमा से नीचे':'🟡 Below threshold')}
                    </div>
                  </div>
                  <div style={{ marginTop:10 }}>
                    {Object.entries(ml.log_likelihoods).map(([feat,v])=>{
                      const pct=Math.max(0,Math.min(100,(v.llr+2)*25));
                      const col=v.llr>2?'#dc2626':v.llr>1?'#d97706':v.llr>0?'#f59e0b':'#16a34a';
                      return (
                        <div key={feat} style={{ marginBottom:9 }}>
                          <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:2 }}>
                            <span style={{ color:sub }}>{feat} <span style={{ color:sub,fontSize:9 }}>({v.weight})</span></span>
                            <span style={{ fontWeight:700,color:col }}>LLR={v.llr} · {v.label}</span>
                          </div>
                          <div style={{ background:dark?'#334155':'#f1f5f9',borderRadius:4,height:7 }}>
                            <div style={{ width:`${pct}%`,background:col,height:7,borderRadius:4,transition:'width 0.6s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={card}>
                  <div style={{ fontSize:12,fontWeight:700,marginBottom:10,color:txt }}>🚩 {hindi?'जोखिम संकेत':'Risk Flags'}</div>
                  {ml.flags.length===0
                    ?<div style={{ color:'#16a34a',fontSize:12 }}>✅ {hindi?'कोई संकेत नहीं':'No risk flags'}</div>
                    :<div style={{ display:'flex',flexDirection:'column',gap:6 }}>{ml.flags.map((f,i)=><div key={i} style={{ background:dark?'#450a0a':'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'7px 10px',fontSize:11,color:'#7f1d1d' }}>{f}</div>)}</div>
                  }
                  <div style={{ marginTop:14,padding:'9px 10px',background:dark?'#0f172a':'#f8fafc',borderRadius:8,fontSize:10,color:sub }}>
                    <b style={{ color:txt }}>Model:</b> {ml.model}<br/>
                    <b style={{ marginTop:4,display:'block',color:ml.triggered?'#16a34a':sub }}>→ {ml.recommendation}</b>
                  </div>
                </div>
              </div>
            )}
            {!ml&&<div style={{ textAlign:'center',padding:40 }}><button onClick={doML} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#0369a1,#0284c7)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:14,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8 }}>{loading&&<Spin />}🤖 {hindi?'जोखिम मॉडल चलाएं':'Run ML Predictor'}</button></div>}
            {ml&&<div style={{ marginTop:18,display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap' }}>
              <button onClick={reset} style={{ background:'linear-gradient(135deg,#0f766e,#059669)',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',fontSize:13,fontWeight:700 }}>🔄 {hindi?'नया डेमो':'New Demo'}</button>
              <a href="/impact" style={{ background:'#d97706',color:'#fff',textDecoration:'none',borderRadius:10,padding:'12px 24px',fontSize:13,fontWeight:700 }}>📊 {hindi?'प्रभाव देखें':'Impact →'}</a>
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}
