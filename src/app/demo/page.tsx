'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type Step = 'enroll'|'verify'|'execute'|'audit'|'ml';
type CState = 'ACTIVE'|'TRIGGERED'|'EXECUTED';

interface Policy {
  policy_id:string; contract_address:string; net_premium_inr:number;
  subsidy_applied:number; coverage_inr:number; block_deployed:number;
  deploy_tx:string; message:string; upi_debit_ref:string; aadhaar_hash:string; kyc:Record<string,unknown>;
}
interface Agent { decision:string; confidence:number; weight:string; deliberation:string[]; }
interface VerifyResult {
  policy_id:string; district:string; event_type:string; contract_state:CState; payout_amount:number|null;
  oracle_data:{ sources:Record<string,{value:number;unit:string}>; derived:Record<string,number>; };
  agent_quorum:{ agents:Record<string,Agent>; yes_count:number; total_agents:number; weighted_confidence:number; confidence_pct:number; quorum_met:boolean; quorum_rule:string; };
}
interface ExecuteResult {
  success:boolean; policy_id:string; payout_inr:number; tx_hash:string;
  block_number:number; upi_ref:string; rrn:string; farmer:string;
  credited_to:string; method:string; sms_sent:string; message:string; impact:Record<string,unknown>;
}
interface AuditEntry { seq:number; ts:string; event:string; policy_id:string; hash:string; prev_hash:string; data:Record<string,unknown>; }
interface MLResult {
  risk_score:number; risk_level:string; triggered:boolean; confidence_pct:number;
  log_likelihoods:Record<string,{llr:number;weight:string;label:string}>;
  total_llr:number; flags:string[]; model:string; recommendation:string;
}

const CROPS     = ['paddy','cotton','wheat','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const PLANS     = ['Basic Protect','Smart Shield','Full Season Pro'];
const EVENTS    = ['drought','flood','heatwave','cyclone'];
const DISTRICTS = ['Barmer','Puri','Latur','Warangal','Nashik','Ludhiana','Jodhpur','Adilabad'];
const EV_COL: Record<string,string>  = { drought:'#f59e0b', flood:'#38bdf8', heatwave:'#f87171', cyclone:'#a78bfa' };
const EV_ICO: Record<string,string>  = { drought:'☀️', flood:'🌊', heatwave:'🔥', cyclone:'🌀' };
const RK_COL: Record<string,string>  = { CRITICAL:'#f87171', HIGH:'#fb923c', MEDIUM:'#fbbf24', LOW:'#4ade80' };
const ORC_ICO: Record<string,string> = { NASA_MODIS:'🛰️', IMD_Rainfall:'🌧️', ISRO_Bhuvan:'🌡️', ICAR_Sensors:'🌱' };

const HI: Record<string,string> = {
  enroll:'किसान नामांकन', oracle:'ओरेकल जाँच', execute:'भुगतान करें', audit:'ऑडिट श्रृंखला', ml:'जोखिम मॉडल',
  loading:'प्रसंस्करण…', payout_done:'✅ भुगतान हो गया!', sms_label:'📱 किसान को SMS',
  ramesh_btn:'रमेश के रूप में नामांकित करें',
};

/* ─── tiny reusable atoms ─── */
function Spin() {
  return <span style={{ display:'inline-block',width:14,height:14,border:'2px solid #ffffff33',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0 }} />;
}
function Chip({ h }: { h:string }) {
  return <span style={{ fontFamily:'monospace',fontSize:10,background:'#1e293b',border:'1px solid #334155',borderRadius:4,padding:'2px 6px',color:'#94a3b8',wordBreak:'break-all' }}>{h.slice(0,22)}…</span>;
}
function Badge({ label, color='#0f766e' }: { label:string; color?:string }) {
  return <span style={{ background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:6,padding:'2px 9px',fontSize:11,fontWeight:600,whiteSpace:'nowrap' }}>{label}</span>;
}
function Dot({ s }: { s:CState }) {
  const c = s==='EXECUTED'?'#4ade80':s==='TRIGGERED'?'#fbbf24':'#34d399';
  return <span style={{ display:'inline-flex',alignItems:'center',gap:5 }}>
    <span style={{ width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 7px ${c}`,display:'inline-block',animation:s==='TRIGGERED'?'pulse 1s infinite':undefined }} />
    <b style={{ color:c,fontSize:12 }}>{s}</b>
  </span>;
}
function Card({ children, style }: { children:React.ReactNode; style?:React.CSSProperties }) {
  return <div style={{ background:'#0f172a',border:'1px solid #1e293b',borderRadius:14,padding:'18px 20px',...style }}>{children}</div>;
}
function Label({ children }: { children:React.ReactNode }) {
  return <div style={{ fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3 }}>{children}</div>;
}

/* ─── animated agent confidence bar ─── */
function AgentBar({ name, a, delay }: { name:string; a:Agent; delay:number }) {
  const [width, setWidth] = useState(0);
  const [open, setOpen]   = useState(false);
  const yes = a.decision.includes('YES');
  useEffect(() => { const t = setTimeout(()=>setWidth(a.confidence), delay); return ()=>clearTimeout(t); }, [a.confidence, delay]);
  const col = yes ? '#4ade80' : '#f87171';
  return (
    <div
      role="button" tabIndex={0} aria-expanded={open}
      onKeyDown={e=>e.key==='Enter'&&setOpen(o=>!o)}
      onClick={()=>setOpen(o=>!o)}
      style={{ background:yes?'#052e16':'#2d0a0a',border:`1px solid ${yes?'#166534':'#7f1d1d'}`,borderRadius:10,padding:'12px 14px',cursor:'pointer',transition:'border-color 0.2s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
        <div style={{ fontSize:11,fontWeight:700,color:col }}>{yes?'✅':'❌'} {name.replace(/_/g,' ')}</div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          <span style={{ fontSize:10,color:'#64748b' }}>{a.weight}</span>
          <span style={{ fontWeight:800,fontSize:13,color:col }}>{a.confidence}%</span>
          <span style={{ fontSize:9,color:'#475569' }}>{open?'▲':'▼'}</span>
        </div>
      </div>
      {/* animated bar */}
      <div style={{ background:'#1e293b',borderRadius:4,height:7,overflow:'hidden' }}>
        <div style={{ width:`${width}%`,background:`linear-gradient(90deg,${col}66,${col})`,height:7,borderRadius:4,transition:'width 1.1s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      {open && (
        <div style={{ marginTop:10,borderTop:'1px solid #1e293b',paddingTop:10 }}>
          <div style={{ fontSize:10,fontWeight:700,color:'#475569',marginBottom:5,letterSpacing:'0.04em' }}>DELIBERATION LOG</div>
          {a.deliberation.map((line,i) => (
            <div key={i} style={{ fontSize:10,color:'#94a3b8',padding:'2px 0',borderBottom:i<a.deliberation.length-1?'1px dashed #1e293b':undefined,display:'flex',gap:6 }}>
              <span style={{ color:'#475569',minWidth:14 }}>{i+1}.</span><span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── confetti particle ─── */
interface Particle { id:number; x:number; color:string; delay:number; size:number; rot:number; }

/* ─── SMS + Claim modal ─── */
function ClaimModal({ exec, onClose, hindi }: { exec:ExecuteResult; onClose:()=>void; hindi:boolean }) {
  const particles: Particle[] = Array.from({length:40},(_,i)=>({
    id:i, x:Math.random()*100, color:['#4ade80','#34d399','#fbbf24','#38bdf8','#a78bfa','#f472b6'][i%6],
    delay:Math.random()*1.2, size:5+Math.random()*9, rot:Math.random()*360,
  }));
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Payout confirmed"
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}
      onClick={onClose}>
      <div
        style={{ background:'#0d1117',border:'2px solid #166534',borderRadius:24,padding:'36px 32px',maxWidth:460,width:'100%',textAlign:'center',position:'relative',overflow:'hidden',boxShadow:'0 0 60px #4ade8044' }}
        onClick={e=>e.stopPropagation()}>
        {/* confetti */}
        {particles.map(p=>(
          <div key={p.id} style={{ position:'absolute',left:`${p.x}%`,top:-16,width:p.size,height:p.size,background:p.color,borderRadius:3,transform:`rotate(${p.rot}deg)`,animation:`confettiFall 2.2s ease-in ${p.delay}s both` }} />
        ))}
        {/* burst ring */}
        <div style={{ position:'relative',display:'inline-block',marginBottom:8 }}>
          <div style={{ position:'absolute',inset:-20,borderRadius:'50%',border:'4px solid #4ade80',animation:'burstRing 0.7s ease-out both',opacity:0 }} />
          <div style={{ fontSize:56,lineHeight:1 }}>🎉</div>
        </div>
        <div style={{ fontSize:20,fontWeight:900,color:'#4ade80',marginBottom:4 }}>
          {hindi?'भुगतान हो गया!':'Claim Triggered!'}
        </div>
        <div style={{ fontSize:38,fontWeight:900,color:'#34d399',marginBottom:6,animation:'celebrate 0.6s ease' }}>
          ₹{exec.payout_inr.toLocaleString()}
        </div>
        <div style={{ fontSize:13,color:'#64748b',marginBottom:18 }}>
          {hindi?`${exec.farmer} के खाते में IMPS द्वारा`:`Credited to ${exec.farmer} via IMPS`}
        </div>
        {/* SMS box */}
        <div style={{ background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'12px 14px',marginBottom:14,textAlign:'left' }}>
          <div style={{ fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:5,letterSpacing:'0.04em' }}>{hindi?HI.sms_label:'📱 SMS SENT TO FARMER'}</div>
          <div style={{ fontSize:11,color:'#d1fae5',lineHeight:1.7,fontFamily:'monospace' }}>{exec.sms_sent}</div>
        </div>
        {/* stats grid */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
          {([['UPI Ref',exec.upi_ref,'#a78bfa'],['RRN',exec.rrn,'#38bdf8'],['Block',String(exec.block_number),'#fbbf24'],['Method',exec.method,'#4ade80']] as [string,string,string][]).map(([k,v,c])=>(
            <div key={k} style={{ background:'#0f172a',borderRadius:8,padding:'8px 10px',border:'1px solid #1e293b' }}>
              <div style={{ fontSize:9,color:'#475569',marginBottom:1 }}>{k}</div>
              <div style={{ fontSize:11,fontWeight:700,color:c,fontFamily:'monospace' }}>{v}</div>
            </div>
          ))}
        </div>
        {/* impact */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:11,background:'#1c1400',border:'1px solid #854d0e',borderRadius:10,padding:'10px',marginBottom:18 }}>
          <div><span style={{ color:'#78716c' }}>{hindi?'परंपरागत:':'Traditional:'}</span> <b style={{ color:'#f87171' }}>180 {hindi?'दिन':'days'}</b></div>
          <div><span style={{ color:'#78716c' }}>IIE:</span> <b style={{ color:'#4ade80' }}>2.3 sec</b></div>
          <div><span style={{ color:'#78716c' }}>{hindi?'फॉर्म:':'Forms:'}</span> <b style={{ color:'#4ade80' }}>{hindi?'शून्य':'Zero'}</b></div>
          <div><span style={{ color:'#78716c' }}>{hindi?'धोखाधड़ी:':'Fraud:'}</span> <b style={{ color:'#4ade80' }}>{hindi?'असंभव':'Impossible'}</b></div>
        </div>
        <button
          onClick={onClose}
          style={{ background:'linear-gradient(135deg,#065f46,#047857)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 28px',fontSize:13,fontWeight:700,cursor:'pointer' }}>
          {hindi?'बंद करें':'Close'}
        </button>
      </div>
    </div>
  );
}

/* ─── main page ─── */
export default function DemoPage() {
  const [step,      setStep]      = useState<Step>('enroll');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [elapsed,   setElapsed]   = useState(0);
  const [hindi,     setHindi]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

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
    timerRef.current = setInterval(()=>setElapsed(e=>e+1), 100);
  };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } };

  const post = async (url:string, body:object) => {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error||'API error');
    return d;
  };

  /* one-click Ramesh flow */
  const doRamesh = async () => {
    const f = { name:'Ramesh Kumar', aadhaar_last4:'4821', district:'Barmer', state:'Rajasthan', crop:'wheat', acreage:'4.5', plan:'Smart Shield', event_type:'drought' };
    setForm(f);
    setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setError('');
    setStep('enroll');
    setLoading(true); startTimer();
    try {
      const p = await post('/api/oracle/enroll', { ...f, acreage:4.5 });
      setPolicy(p); setStep('verify');
      const v = await post('/api/oracle/verify', { policy_id:p.policy_id, event_type:'drought', district:'Barmer', crop:'wheat', acreage:4.5 });
      setVerify(v); setStep('execute');
      const x = await post('/api/contract/execute', { policy_id:p.policy_id, farmer_name:'Ramesh Kumar', payout_amount:v.payout_amount });
      setExecute(x); setStep('audit'); setShowModal(true); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doEnroll = async () => {
    setLoading(true); setError(''); startTimer();
    try {
      const d = await post('/api/oracle/enroll', { ...form, acreage:parseFloat(form.acreage) });
      setPolicy(d); setStep('verify'); ping();
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
    try { const r = await fetch('/api/audit/trail'); setAudit(await r.json()); setStep('ml'); }
    catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };
  const doML = async () => {
    setLoading(true); setError(''); startTimer();
    try {
      const fd = await (await fetch('/api/oracle/feed')).json();
      const row = fd.districts?.[0];
      if (row) {
        const d = await post('/api/ml/predict', { district:row.district, ndvi:row.ndvi, temp_c:row.temp_c, rainfall_mm:row.rainfall_mm, soil_moisture_pct:row.soil_moisture });
        setMl(d);
      }
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const reset = () => {
    setStep('enroll'); setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setError(''); stopTimer();
    setForm(f => ({ ...f, name:'Farmer '+Math.floor(Math.random()*9000+1000), aadhaar_last4:String(Math.floor(Math.random()*9000+1000)), district:DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)], crop:CROPS[Math.floor(Math.random()*CROPS.length)] }));
  };

  const STEPS: {id:Step;label:string;icon:string}[] = [
    {id:'enroll', icon:'📋', label:hindi?HI.enroll:'1. Enroll'},
    {id:'verify', icon:'🛰️', label:hindi?'2. '+HI.oracle:'2. Oracle'},
    {id:'execute',icon:'⚡', label:hindi?'3. '+HI.execute:'3. Execute'},
    {id:'audit',  icon:'🔗', label:hindi?'4. '+HI.audit:'4. Audit'},
    {id:'ml',     icon:'🤖', label:hindi?'5. '+HI.ml:'5. ML'},
  ];
  const ORDER: Step[] = ['enroll','verify','execute','audit','ml'];
  const done = (id:Step) => ORDER.indexOf(id) < ORDER.indexOf(step);

  const inp = (extra?:React.CSSProperties): React.CSSProperties => ({ width:'100%',border:'1px solid #1e293b',borderRadius:8,padding:'8px 11px',fontSize:13,background:'#030712',color:'#e2e8f0',transition:'border-color 0.2s',...extra });

  return (
    <div style={{ minHeight:'100vh',background:'#030712',fontFamily:"'Inter',system-ui,sans-serif",color:'#e2e8f0' }}>
      <style>{`
        @keyframes spin         { to{transform:rotate(360deg)} }
        @keyframes fadeIn       { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes confettiFall { from{transform:translateY(-20px) rotate(0deg);opacity:1} to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes celebrate    { 0%{transform:scale(1)} 40%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes burstRing    { from{transform:scale(0.5);opacity:0.8} to{transform:scale(2.5);opacity:0} }
        @keyframes slideIn      { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .fi   { animation:fadeIn 0.35s ease }
        .cel  { animation:celebrate 0.5s ease }
        *     { box-sizing:border-box }
        button,a { cursor:pointer }
        input,select { outline:none;font-family:inherit }
        input:focus,select:focus { border-color:#34d399!important;box-shadow:0 0 0 3px #34d39922 }
        ::-webkit-scrollbar { width:4px;height:4px }
        ::-webkit-scrollbar-track { background:#0f172a }
        ::-webkit-scrollbar-thumb { background:#334155;border-radius:2px }
        @media(max-width:640px){.g2{grid-template-columns:1fr!important}.g4{grid-template-columns:1fr 1fr!important}.g3{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {showModal && execute && <ClaimModal exec={execute} onClose={()=>setShowModal(false)} hindi={hindi} />}

      {/* ── Top nav bar ── */}
      <div style={{ background:'#0d1117',borderBottom:'1px solid #1e293b',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,position:'sticky',top:0,zIndex:50 }}>
        <div style={{ display:'flex',overflowX:'auto',scrollbarWidth:'none' }}>
          {STEPS.map((s,i) => {
            const active = step===s.id, d = done(s.id);
            return (
              <div key={s.id} style={{ display:'flex',alignItems:'center' }}>
                <button
                  onClick={()=>d?setStep(s.id):undefined}
                  disabled={!d&&!active}
                  aria-current={active?'step':undefined}
                  style={{ display:'flex',alignItems:'center',gap:5,padding:'13px 14px',whiteSpace:'nowrap',
                    borderBottom:active?'2px solid #34d399':d?'2px solid #4ade80':'2px solid transparent',
                    background:'transparent',border:'none',borderBottom:active?'2px solid #34d399':d?'2px solid #4ade80':'2px solid transparent',
                    color:active?'#34d399':d?'#4ade80':'#475569',cursor:d?'pointer':active?'default':'not-allowed',
                    fontSize:12,fontWeight:active?700:500,fontFamily:'inherit' }}>
                  <span style={{ fontSize:13 }}>{d?'✅':s.icon}</span>
                  {s.label}
                </button>
                {i<STEPS.length-1&&<span style={{ color:'#1e293b',fontSize:12 }}>›</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 0',flexShrink:0 }}>
          {health&&<span style={{ fontSize:10,color:'#4ade80',fontWeight:700 }}>🟢 {health.version}</span>}
          {loading&&<span style={{ fontSize:10,color:'#34d399',fontFamily:'monospace' }}>⏱ {(elapsed/10).toFixed(1)}s</span>}
          <button onClick={()=>setHindi(h=>!h)} title="Hindi / English toggle"
            aria-label="Toggle Hindi"
            style={{ background:hindi?'#065f46':'#1e293b',color:hindi?'#d1fae5':'#94a3b8',border:'1px solid #334155',borderRadius:7,padding:'5px 9px',fontSize:11,fontWeight:700 }}>
            {hindi?'EN':'हि'}
          </button>
          <button onClick={reset} style={{ background:'#0f766e',color:'#fff',border:'none',borderRadius:7,padding:'5px 13px',fontSize:11,fontWeight:700 }}>+ New</button>
        </div>
      </div>

      {/* ── One-click Ramesh banner ── */}
      <div style={{ background:'linear-gradient(135deg,#064e3b,#0c4a6e)',borderBottom:'1px solid #065f46',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}>
        <div>
          <div style={{ color:'#d1fae5',fontWeight:800,fontSize:14 }}>
            {hindi?'⚡ एक क्लिक डेमो — रमेश कुमार, बाड़मेर':'⚡ One-click Demo — Enroll Ramesh Kumar in Barmer'}
          </div>
          <div style={{ color:'#6ee7b7',fontSize:11,marginTop:2 }}>
            {hindi?'नामांकन → ओरेकल → IMPS भुगतान — 3 चरण स्वचालित, लाइव एजेंट वोट देखें':'Enroll → Oracle quorum → IMPS payout in one shot. Watch 4 live agent votes animate.'}
          </div>
        </div>
        <button
          onClick={doRamesh} disabled={loading}
          aria-label="One-click enroll Ramesh Kumar"
          style={{ background:loading?'#374151':'#ecfdf5',color:loading?'#9ca3af':'#065f46',border:'none',borderRadius:10,padding:'10px 22px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px #00000066',flexShrink:0,transition:'all 0.2s' }}>
          {loading?<><Spin/> {hindi?HI.loading:'Running…'}</>:<>🚀 {hindi?HI.ramesh_btn:'Enroll as Ramesh in Barmer'}</>}
        </button>
      </div>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'20px 14px' }}>
        {error&&(
          <div className="fi" role="alert" style={{ background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:10,padding:'10px 14px',color:'#fca5a5',marginBottom:14,fontSize:12 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── STEP 1: ENROLL ── */}
        {step==='enroll'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'📋 '+HI.enroll:'📋 Step 1 — Enroll Farmer'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>{hindi?'आधार eKYC · DigiLocker RoR · PM-FASAL सब्सिडी · ऑन-चेन कॉन्ट्रैक्ट':'Aadhaar eKYC OTP · DigiLocker RoR pull · PM-FASAL subsidy · On-chain contract deploy.'}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }} className="g2">
              <Card>
                <h2 style={{ fontSize:13,fontWeight:700,marginBottom:12,color:'#e2e8f0' }}>{hindi?'किसान विवरण':'Farmer Details'}</h2>
                {([['name',hindi?'किसान का नाम':'Farmer Name','text'],['aadhaar_last4',hindi?'आधार के अंतिम 4':'Aadhaar Last 4','text'],['district',hindi?'जिला':'District','text'],['state',hindi?'राज्य':'State','text'],['acreage',hindi?'एकड़':'Acreage (acres)','number']] as [keyof typeof form,string,string][]).map(([k,l,t])=>(
                  <div key={k} style={{ marginBottom:10 }}>
                    <Label>{l}</Label>
                    <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} type={t} style={inp()} />
                  </div>
                ))}
              </Card>
              <Card>
                <h2 style={{ fontSize:13,fontWeight:700,marginBottom:12,color:'#e2e8f0' }}>{hindi?'फसल और योजना':'Crop & Plan'}</h2>
                <div style={{ marginBottom:10 }}>
                  <Label>{hindi?'फसल':'Crop'}</Label>
                  <select value={form.crop} onChange={e=>setForm(f=>({...f,crop:e.target.value}))} style={inp()}>
                    {CROPS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:14 }}>
                  <Label>{hindi?'बीमा योजना':'Insurance Plan'}</Label>
                  <select value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value}))} style={inp()}>
                    {PLANS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ background:'#052e16',border:'1px solid #166534',borderRadius:10,padding:'12px 14px' }}>
                  <div style={{ fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:5,letterSpacing:'0.04em' }}>📊 {hindi?'प्रीमियम पूर्वावलोकन':'PREMIUM PREVIEW'}</div>
                  {form.plan==='Basic Protect'&&<><div style={{ fontSize:12,color:'#94a3b8' }}>₹2,800 · Coverage ₹42,000</div><div style={{ fontSize:11,color:'#4ade80' }}>PM-FASAL ₹840 → Net ₹1,960</div></>}
                  {form.plan==='Smart Shield'&&<><div style={{ fontSize:12,color:'#94a3b8' }}>₹4,200 · Coverage ₹70,000</div><div style={{ fontSize:11,color:'#4ade80' }}>PM-FASAL ₹1,260 → Net ₹2,940</div></>}
                  {form.plan==='Full Season Pro'&&<><div style={{ fontSize:12,color:'#94a3b8' }}>₹6,300 · Coverage ₹1,22,500</div><div style={{ fontSize:11,color:'#4ade80' }}>PM-FASAL ₹1,890 → Net ₹4,410</div></>}
                </div>
              </Card>
            </div>
            <div style={{ marginTop:14,display:'flex',justifyContent:'flex-end' }}>
              <button onClick={doEnroll} disabled={loading}
                style={{ background:loading?'#1e293b':'linear-gradient(135deg,#065f46,#047857)',color:loading?'#475569':'#d1fae5',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:loading?'none':'0 4px 16px #065f4666' }}>
                {loading&&<Spin/>} {loading?(hindi?HI.loading:'Enrolling…'):(hindi?'🚀 पॉलिसी जारी करें':'🚀 Issue Policy & Deploy Contract')}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ORACLE ── */}
        {step==='verify'&&policy&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'🛰️ ओरेकल + AI कोरम':'🛰️ Step 2 — Oracle + AI Quorum'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>{hindi?'4 स्रोत · 4 विशेषज्ञ एजेंट · ≥75% भार विश्वास':'4 independent sources · 4 specialist agents · ≥75% weighted confidence required.'}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12 }} className="g2">
              <Card style={{ background:'#052e16',border:'1px solid #166534' }}>
                <div style={{ fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:7,letterSpacing:'0.05em' }}>✅ {hindi?'पॉलिसी जारी':'POLICY ISSUED'}</div>
                <div style={{ fontSize:17,fontWeight:900,fontFamily:'monospace',marginBottom:8,color:'#d1fae5' }}>{policy.policy_id}</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:7 }}>
                  {[['Coverage','₹'+policy.coverage_inr.toLocaleString()],['Net Premium','₹'+policy.net_premium_inr.toLocaleString()],['PM-FASAL','₹'+policy.subsidy_applied.toLocaleString()],['Block',String(policy.block_deployed)]].map(([k,v])=>(
                    <div key={k}><div style={{ fontSize:9,color:'#64748b' }}>{k}</div><div style={{ fontSize:11,fontWeight:700,color:'#e2e8f0' }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ fontSize:9,color:'#64748b' }}>Contract: <Chip h={policy.contract_address} /></div>
              </Card>
              <Card>
                <h2 style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>{hindi?'घटना का प्रकार':'Event Type'}</h2>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                  {EVENTS.map(ev=>(
                    <button key={ev} onClick={()=>setForm(f=>({...f,event_type:ev}))}
                      aria-pressed={form.event_type===ev}
                      style={{ border:`2px solid ${form.event_type===ev?EV_COL[ev]:'#1e293b'}`,background:form.event_type===ev?`${EV_COL[ev]}18`:'#0f172a',borderRadius:10,padding:'10px 6px',transition:'all 0.18s',color:'#e2e8f0',cursor:'pointer' }}>
                      <div style={{ fontSize:20,marginBottom:3 }}>{EV_ICO[ev]}</div>
                      <div style={{ fontSize:11,fontWeight:700,color:form.event_type===ev?EV_COL[ev]:'#94a3b8',textTransform:'capitalize' }}>{ev}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {verify&&(
              <Card style={{ marginBottom:12 }}>
                <h2 style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>🛰️ Oracle — {verify.district}</h2>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:18 }} className="g4">
                  {Object.entries(verify.oracle_data.sources).map(([key,s])=>(
                    <div key={key} style={{ background:'#030712',border:'1px solid #1e293b',borderRadius:8,padding:'9px 10px' }}>
                      <div style={{ fontSize:9,color:'#64748b',fontWeight:600,marginBottom:2 }}>{ORC_ICO[key]||'📡'} {key}</div>
                      <div style={{ fontSize:16,fontWeight:900,color:'#e2e8f0' }}>{s.value}</div>
                      <div style={{ fontSize:9,color:'#475569' }}>{s.unit}</div>
                    </div>
                  ))}
                </div>
                <h2 style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>🤖 {hindi?'AI एजेंट वोट — क्लिक करें':'Agent Votes — click to expand deliberation'}</h2>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }} className="g2">
                  {Object.entries(verify.agent_quorum.agents).map(([name,a],i)=>(
                    <AgentBar key={name} name={name} a={a} delay={i*300} />
                  ))}
                </div>
                <div style={{
                  background:verify.agent_quorum.quorum_met?'#052e16':'#2d0a0a',
                  border:`1px solid ${verify.agent_quorum.quorum_met?'#166534':'#7f1d1d'}`,
                  borderRadius:10,padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:'#e2e8f0' }}>{hindi?'भार विश्वास:':'Weighted Confidence:'} <span style={{ color:verify.agent_quorum.quorum_met?'#4ade80':'#f87171' }}>{verify.agent_quorum.weighted_confidence}%</span></div>
                    <div style={{ fontSize:10,color:'#64748b',marginTop:1 }}>{verify.agent_quorum.yes_count}/{verify.agent_quorum.total_agents} YES · {verify.agent_quorum.quorum_rule}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{ fontSize:13,fontWeight:700,color:'#4ade80',marginTop:2 }}>₹{verify.payout_amount.toLocaleString()} queued</div>}
                  </div>
                </div>
              </Card>
            )}

            <div style={{ display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap' }}>
              <button onClick={doVerify} disabled={loading}
                style={{ background:loading?'#1e293b':'linear-gradient(135deg,#1e3a8a,#1d4ed8)',color:loading?'#475569':'#dbeafe',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7,boxShadow:loading?'none':'0 4px 14px #1d4ed844' }}>
                {loading&&<Spin/>} {loading?(hindi?HI.loading:'Running…'):(hindi?'🛰️ ओरेकल चलाएं':'🛰️ Run Oracle + Agent Quorum')}
              </button>
              {verify&&<button onClick={()=>setStep('execute')} style={{ background:'linear-gradient(135deg,#92400e,#b45309)',color:'#fde68a',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>⚡ {hindi?'आगे':'Execute →'}</button>}
            </div>
          </div>
        )}

        {/* ── STEP 3: EXECUTE ── */}
        {step==='execute'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'⚡ स्मार्ट कॉन्ट्रैक्ट':'⚡ Step 3 — Execute Smart Contract'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>FSM: TRIGGERED → EXECUTED · SHA-256 tx · IMPS · NPCI UTR · SMS</p>
            {verify&&(
              <Card style={{ background:'#1c1400',border:'1px solid #854d0e',marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:'#fef3c7',fontFamily:'monospace' }}>{verify.policy_id}</div>
                    <div style={{ fontSize:11,color:'#94a3b8',marginTop:3 }}>Event: <Badge label={verify.event_type} color={EV_COL[verify.event_type]} /> · <b style={{ color:'#e2e8f0' }}>{verify.agent_quorum.weighted_confidence}%</b></div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{ fontSize:22,fontWeight:900,color:'#4ade80',marginTop:2 }}>₹{verify.payout_amount.toLocaleString()}</div>}
                  </div>
                </div>
              </Card>
            )}
            {execute&&(
              <Card className="fi cel" style={{ background:'#052e16',border:'1px solid #166534',marginBottom:12 }}>
                <div style={{ fontSize:14,fontWeight:800,color:'#4ade80',marginBottom:12 }}>{hindi?HI.payout_done:'✅ Payout Executed On-Chain + IMPS Credited'}</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:12 }} className="g3">
                  {([['Payout','₹'+execute.payout_inr.toLocaleString(),'#4ade80'],['Method',execute.method,'#38bdf8'],['Farmer',execute.farmer,'#e2e8f0'],['UPI Ref',execute.upi_ref,'#a78bfa'],['RRN',execute.rrn,'#34d399'],['Block',String(execute.block_number),'#fbbf24']] as [string,string,string][]).map(([k,v,c])=>(
                    <div key={k} style={{ background:'#030712',borderRadius:8,padding:'7px 9px',border:'1px solid #1e293b' }}>
                      <div style={{ fontSize:9,color:'#475569',marginBottom:1 }}>{k}</div>
                      <div style={{ fontSize:11,fontWeight:700,color:c,fontFamily:'monospace',wordBreak:'break-all' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#030712',border:'1px solid #1e293b',borderRadius:10,padding:'9px 12px' }}>
                  <div style={{ fontSize:9,color:'#475569',fontWeight:700,marginBottom:3,letterSpacing:'0.04em' }}>{hindi?HI.sms_label:'📱 SMS SENT TO FARMER'}</div>
                  <div style={{ fontSize:11,color:'#d1fae5',lineHeight:1.7,fontFamily:'monospace' }}>{execute.sms_sent}</div>
                </div>
              </Card>
            )}
            <div style={{ display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap' }}>
              {!execute&&<button onClick={doExecute} disabled={loading}
                style={{ background:loading?'#1e293b':'linear-gradient(135deg,#065f46,#047857)',color:loading?'#475569':'#d1fae5',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:loading?'none':'0 4px 16px #065f4666' }}>
                {loading&&<Spin/>} {loading?(hindi?HI.loading:'Executing…'):(hindi?'⚡ कॉन्ट्रैक्ट निष्पादित':'⚡ Execute Contract + IMPS Payout')}
              </button>}
              {execute&&<button onClick={()=>setShowModal(true)} style={{ background:'linear-gradient(135deg,#065f46,#059669)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 18px',fontSize:12,fontWeight:700 }}>🎉 {hindi?'भुगतान देखें':'View Payout'}</button>}
              {execute&&<button onClick={doAudit} disabled={loading} style={{ background:'linear-gradient(135deg,#4c1d95,#6d28d9)',color:'#ede9fe',border:'none',borderRadius:10,padding:'11px 20px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7 }}>{loading&&<Spin/>}🔗 {hindi?'ऑडिट':'Audit →'}</button>}
            </div>
          </div>
        )}

        {/* ── STEP 4: AUDIT ── */}
        {step==='audit'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'🔗 SHA-256 ऑडिट श्रृंखला':'🔗 Step 4 — Tamper-Evident Audit Chain'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>{hindi?'प्रत्येक प्रविष्टि पिछले SHA-256 हैश से जुड़ी — अपरिवर्तनीय':'SHA-256 chained. Every entry links to predecessor — any mutation is instantly detectable.'}</p>
            {audit&&(
              <Card style={{ marginBottom:12 }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8 }}>
                  <div><div style={{ fontSize:14,fontWeight:800,color:'#e2e8f0' }}>{hindi?'ऑडिट बही':'Audit Ledger'}</div><div style={{ fontSize:11,color:'#64748b' }}>{audit.total_entries} entries · SHA-256</div></div>
                  <Badge label={audit.chain_valid?'✓ Chain Valid':'⚠ Chain Broken'} color={audit.chain_valid?'#4ade80':'#f87171'} />
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
                  {[...audit.ledger].reverse().map(entry=>(
                    <div key={entry.seq} style={{ border:'1px solid #1e293b',borderRadius:10,padding:'9px 12px',
                      background:entry.event.includes('EXECUTED')?'#052e16':entry.event.includes('TRIGGERED')?'#1c1400':'#0f172a' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap',gap:4 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                          <span style={{ fontWeight:700,color:'#475569',fontSize:10 }}>#{entry.seq}</span>
                          <Badge label={entry.event} color={entry.event.includes('EXECUTED')?'#4ade80':entry.event.includes('TRIGGERED')?'#fbbf24':'#34d399'} />
                          <span style={{ fontSize:10,color:'#475569',fontFamily:'monospace' }}>{entry.policy_id}</span>
                        </div>
                        <span style={{ fontSize:9,color:'#475569' }}>{entry.ts.slice(0,19).replace('T',' ')} UTC</span>
                      </div>
                      <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                        <div><span style={{ fontSize:9,color:'#475569' }}>HASH </span><Chip h={entry.hash} /></div>
                        <div><span style={{ fontSize:9,color:'#475569' }}>PREV </span><Chip h={entry.prev_hash} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {!audit&&(
              <div style={{ textAlign:'center',padding:40 }}>
                <button onClick={doAudit} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#4c1d95,#6d28d9)',color:loading?'#475569':'#ede9fe',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8 }}>{loading&&<Spin/>}🔗 {hindi?'ऑडिट लाएं':'Fetch Audit Chain'}</button>
              </div>
            )}
            {audit&&<div style={{ display:'flex',justifyContent:'flex-end' }}><button onClick={doML} disabled={loading} style={{ background:'linear-gradient(135deg,#0c4a6e,#0369a1)',color:'#bae6fd',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7 }}>{loading&&<Spin/>}🤖 {hindi?'ML भविष्यवाणी →':'ML Predictor →'}</button></div>}
          </div>
        )}

        {/* ── STEP 5: ML ── */}
        {step==='ml'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'🤖 NaiveBayes जोखिम स्कोर':'🤖 Step 5 — NaiveBayes LLR Risk Score'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>NDVI 40% + Temp 25% + Rainfall 25% + Soil 10% · Log-likelihood ratios · Sigmoid → 0–100</p>
            {ml&&(
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }} className="g2">
                <Card>
                  <div style={{ textAlign:'center',padding:'12px 0 8px' }}>
                    <div style={{ fontSize:52,fontWeight:900,color:RK_COL[ml.risk_level]??'#e2e8f0',lineHeight:1,animation:'celebrate 0.5s ease' }}>{ml.risk_score.toFixed(1)}</div>
                    <div style={{ fontSize:9,color:'#475569',marginBottom:5 }}>{hindi?'/ 100 जोखिम स्कोर':'/ 100.0 risk score (sigmoid)'}</div>
                    <Badge label={ml.risk_level} color={RK_COL[ml.risk_level]} />
                    <div style={{ marginTop:6,fontSize:11,fontWeight:700,color:ml.triggered?'#4ade80':'#64748b' }}>
                      {ml.triggered?(hindi?'✅ स्वत: भुगतान ट्रिगर':'✅ AUTO-PAYOUT TRIGGERED'):(hindi?'🟡 ट्रिगर सीमा से नीचे':'🟡 Below trigger threshold')}
                    </div>
                  </div>
                  <div style={{ marginTop:10 }}>
                    {Object.entries(ml.log_likelihoods).map(([feat,v])=>{
                      const pct=Math.max(0,Math.min(100,(v.llr+2)*25));
                      const col=v.llr>2?'#f87171':v.llr>1?'#fb923c':v.llr>0?'#fbbf24':'#4ade80';
                      return (
                        <div key={feat} style={{ marginBottom:8 }}>
                          <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:2 }}>
                            <span style={{ color:'#94a3b8' }}>{feat} <span style={{ color:'#475569',fontSize:9 }}>({v.weight})</span></span>
                            <span style={{ fontWeight:700,color:col }}>LLR={v.llr} · {v.label}</span>
                          </div>
                          <div style={{ background:'#1e293b',borderRadius:4,height:6 }}>
                            <div style={{ width:`${pct}%`,background:col,height:6,borderRadius:4,transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize:10,color:'#475569',marginTop:6,fontFamily:'monospace',background:'#030712',padding:'5px 8px',borderRadius:5 }}>
                      Σ LLR = {ml.total_llr} → sigmoid → {ml.risk_score}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div style={{ fontSize:11,fontWeight:700,marginBottom:9,color:'#e2e8f0' }}>🚩 {hindi?'जोखिम संकेत':'Risk Flags'}</div>
                  {ml.flags.length===0
                    ?<div style={{ color:'#4ade80',fontSize:11 }}>✅ {hindi?'कोई संकेत नहीं':'No risk flags'}</div>
                    :<div style={{ display:'flex',flexDirection:'column',gap:5 }}>{ml.flags.map((f,i)=><div key={i} style={{ background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:7,padding:'6px 9px',fontSize:10,color:'#fca5a5' }}>{f}</div>)}</div>
                  }
                  <div style={{ marginTop:12,padding:'8px 10px',background:'#030712',borderRadius:7,fontSize:9,color:'#64748b' }}>
                    <b style={{ color:'#94a3b8' }}>Model:</b> {ml.model}<br/>
                    <b style={{ marginTop:3,display:'block',color:ml.triggered?'#4ade80':'#64748b' }}>→ {ml.recommendation}</b>
                  </div>
                </Card>
              </div>
            )}
            {!ml&&(
              <div style={{ textAlign:'center',padding:40 }}>
                <button onClick={doML} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#0c4a6e,#0369a1)',color:loading?'#475569':'#bae6fd',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8 }}>{loading&&<Spin/>}🤖 {hindi?'जोखिम मॉडल चलाएं':'Run ML Predictor'}</button>
              </div>
            )}
            {ml&&(
              <div style={{ marginTop:16,display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap' }}>
                <button onClick={reset} style={{ background:'linear-gradient(135deg,#065f46,#047857)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>🔄 {hindi?'नया डेमो':'New Demo'}</button>
                <a href="/impact" style={{ background:'linear-gradient(135deg,#92400e,#b45309)',color:'#fde68a',textDecoration:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>📊 {hindi?'प्रभाव देखें':'Impact →'}</a>
                <a href="/dashboard" style={{ background:'linear-gradient(135deg,#0c4a6e,#0369a1)',color:'#bae6fd',textDecoration:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>🗺️ {hindi?'डैशबोर्ड':'Dashboard →'}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
