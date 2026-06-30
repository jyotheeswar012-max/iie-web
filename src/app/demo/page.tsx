'use client';
import { useState, useEffect, useCallback } from 'react';

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

function Spin() {
  return <span style={{ display:'inline-block',width:15,height:15,border:'2px solid #fff4',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />;
}
function Chip({ h }: { h:string }) {
  return <span style={{ fontFamily:'monospace',fontSize:11,background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:4,padding:'2px 6px',color:'#475569' }}>{h.slice(0,20)}…</span>;
}
function Badge({ label, color }: { label:string; color?:string }) {
  return <span style={{ background:`${color??'#0f766e'}22`,color:color??'#0f766e',border:`1px solid ${color??'#0f766e'}44`,borderRadius:6,padding:'2px 10px',fontSize:12,fontWeight:600 }}>{label}</span>;
}
function Dot({ s }: { s:CState }) {
  const c = s==='EXECUTED'?'#16a34a':s==='TRIGGERED'?'#d97706':'#0f766e';
  return <span style={{ display:'inline-flex',alignItems:'center',gap:6 }}><span style={{ width:9,height:9,borderRadius:'50%',background:c,boxShadow:`0 0 6px ${c}88`,display:'inline-block' }} /><b style={{ color:c,fontSize:13 }}>{s}</b></span>;
}

function AgentCard({ name, a }: { name:string; a:Agent }) {
  const [open, setOpen] = useState(false);
  const yes = a.decision.includes('YES');
  return (
    <div style={{ background:yes?'#f0fdf4':'#fef2f2', border:`1px solid ${yes?'#86efac':'#fca5a5'}`,
      borderRadius:10, padding:'12px 14px', cursor:'pointer' }} onClick={()=>setOpen(o=>!o)}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:12, fontWeight:700, color:yes?'#16a34a':'#dc2626' }}>
          {yes?'✅':'❌'} {name.replace(/_/g,' ')}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#94a3b8' }}>{a.weight} weight</span>
          <span style={{ fontWeight:700, fontSize:12, color:yes?'#16a34a':'#dc2626' }}>{a.confidence}%</span>
          <span style={{ fontSize:10, color:'#94a3b8' }}>{open?'▲':'▼'}</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop:10, borderTop:'1px solid #e2e8f0', paddingTop:10 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', marginBottom:6 }}>DELIBERATION LOG</div>
          {a.deliberation.map((line,i) => (
            <div key={i} style={{ fontSize:11, color:'#334155', padding:'3px 0',
              borderBottom:i<a.deliberation.length-1?'1px dashed #e2e8f0':undefined,
              display:'flex', gap:8 }}>
              <span style={{ color:'#94a3b8', minWidth:16 }}>{i+1}.</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DemoPage() {
  const [step, setStep]     = useState<Step>('enroll');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timer, setTimer]   = useState<NodeJS.Timeout|null>(null);

  const [form, setForm] = useState({
    name:'Ravi Kumar', aadhaar_last4:'3842', district:'Barmer', state:'Rajasthan',
    crop:'wheat', acreage:'4', plan:'Smart Shield', event_type:'drought',
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
    const t = setInterval(()=>setElapsed(e=>e+1), 100) as unknown as NodeJS.Timeout;
    setTimer(t);
    return t;
  };
  const stopTimer = (t: NodeJS.Timeout) => clearInterval(t);

  const post = async (url:string, body:object) => {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error||'API error');
    return d;
  };

  const doEnroll = async () => {
    setLoading(true); setError('');
    const t = startTimer();
    try {
      const d = await post('/api/oracle/enroll', { ...form, acreage:parseFloat(form.acreage) });
      setPolicy(d); setStep('verify'); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(t); setLoading(false);
  };

  const doVerify = async () => {
    if (!policy) return;
    setLoading(true); setError('');
    const t = startTimer();
    try {
      const d = await post('/api/oracle/verify', { policy_id:policy.policy_id, event_type:form.event_type, district:form.district, crop:form.crop, acreage:parseFloat(form.acreage) });
      setVerify(d); setStep('execute');
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(t); setLoading(false);
  };

  const doExecute = async () => {
    if (!policy) return;
    setLoading(true); setError('');
    const t = startTimer();
    try {
      const d = await post('/api/contract/execute', { policy_id:policy.policy_id, farmer_name:form.name, payout_amount:verify?.payout_amount });
      setExecute(d); setStep('audit'); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(t); setLoading(false);
  };

  const doAudit = async () => {
    setLoading(true); setError('');
    const t = startTimer();
    try {
      const r = await fetch('/api/audit/trail');
      setAudit(await r.json()); setStep('ml');
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(t); setLoading(false);
  };

  const doML = async () => {
    setLoading(true); setError('');
    const t = startTimer();
    try {
      const r  = await fetch('/api/oracle/feed');
      const fd = await r.json();
      const row = fd.districts?.[0];
      if (row) {
        const d = await post('/api/ml/predict', { district:row.district, ndvi:row.ndvi, temp_c:row.temp_c, rainfall_mm:row.rainfall_mm, soil_moisture_pct:row.soil_moisture });
        setMl(d);
      }
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(t); setLoading(false);
  };

  const reset = () => {
    setStep('enroll'); setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setError('');
    if (timer) clearInterval(timer);
    setForm(f => ({ ...f,
      name:'Farmer '+Math.floor(Math.random()*9000+1000),
      aadhaar_last4:String(Math.floor(Math.random()*9000+1000)),
      district:DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)],
      crop:CROPS[Math.floor(Math.random()*CROPS.length)],
    }));
  };

  const STEPS: {id:Step;label:string;icon:string}[] = [
    {id:'enroll',label:'1. Enroll',icon:'📋'},
    {id:'verify',label:'2. Oracle',icon:'🛰️'},
    {id:'execute',label:'3. Execute',icon:'⚡'},
    {id:'audit',label:'4. Audit',icon:'🔗'},
    {id:'ml',label:'5. ML',icon:'🤖'},
  ];
  const ORDER: Step[] = ['enroll','verify','execute','audit','ml'];
  const done = (id:Step) => ORDER.indexOf(id)<ORDER.indexOf(step);

  const cs: React.CSSProperties = {
    background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'20px 22px',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Inter',system-ui,sans-serif", color:'#0f172a' }}>
      <style>{`
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fi { animation:fadeIn 0.3s ease }
        *   { box-sizing:border-box }
        button { cursor:pointer }
        input,select { outline:none; font-family:inherit }
        input:focus,select:focus { border-color:#0f766e!important; box-shadow:0 0 0 3px #0f766e22 }
      `}</style>

      {/* Step bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex' }}>
          {STEPS.map((s,i) => {
            const active=step===s.id, d=done(s.id);
            return (
              <div key={s.id} style={{ display:'flex', alignItems:'center' }}>
                <div onClick={()=>d?setStep(s.id):null}
                  style={{ display:'flex',alignItems:'center',gap:6,padding:'14px 18px',
                    borderBottom:active?'3px solid #0f766e':d?'3px solid #16a34a':'3px solid transparent',
                    cursor:d?'pointer':'default' }}>
                  <span style={{ fontSize:15 }}>{d?'✅':s.icon}</span>
                  <span style={{ fontSize:13,fontWeight:active?700:500,color:active?'#0f766e':d?'#16a34a':'#94a3b8' }}>{s.label}</span>
                </div>
                {i<STEPS.length-1&&<span style={{ color:'#cbd5e1',fontSize:16,margin:'0 2px' }}>›</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0' }}>
          {health&&<span style={{ fontSize:12,color:'#16a34a',fontWeight:600 }}>🟢 {health.version} live</span>}
          {loading&&<span style={{ fontSize:12,color:'#0f766e' }}>⏱ {(elapsed/10).toFixed(1)}s</span>}
          <button onClick={reset} style={{ background:'#0f766e',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:13,fontWeight:600 }}>+ New Demo</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        {error&&<div className="fi" style={{ background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:10,padding:'11px 16px',color:'#dc2626',marginBottom:16,fontSize:14 }}>⚠️ {error}</div>}

        {/* ── STEP 1: ENROLL ── */}
        {step==='enroll'&&(
          <div className="fi">
            <h2 style={{ fontSize:22,fontWeight:800,marginBottom:4 }}>📋 Step 1 — Enroll Farmer</h2>
            <p style={{ color:'#64748b',fontSize:14,marginBottom:20 }}>Aadhaar eKYC OTP · DigiLocker RoR pull · PM-FASAL subsidy · On-chain contract deploy.</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              <div style={cs}>
                <h3 style={{ fontSize:15,fontWeight:700,marginBottom:16 }}>Farmer Details</h3>
                {([['name','Farmer Name','text'],['aadhaar_last4','Aadhaar Last 4','text'],['district','District','text'],['state','State','text'],['acreage','Acreage (acres)','number']] as [keyof typeof form,string,string][]).map(([k,l,t])=>(
                  <div key={k} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12,color:'#64748b',fontWeight:600,display:'block',marginBottom:4 }}>{l}</label>
                    <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} type={t}
                      style={{ width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'9px 12px',fontSize:14,transition:'all 0.2s' }} />
                  </div>
                ))}
              </div>
              <div style={cs}>
                <h3 style={{ fontSize:15,fontWeight:700,marginBottom:16 }}>Crop &amp; Plan</h3>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12,color:'#64748b',fontWeight:600,display:'block',marginBottom:4 }}>Crop</label>
                  <select value={form.crop} onChange={e=>setForm(f=>({...f,crop:e.target.value}))}
                    style={{ width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'9px 12px',fontSize:14 }}>
                    {CROPS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12,color:'#64748b',fontWeight:600,display:'block',marginBottom:4 }}>Insurance Plan</label>
                  <select value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value}))}
                    style={{ width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'9px 12px',fontSize:14 }}>
                    {PLANS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'14px 16px' }}>
                  <div style={{ fontSize:12,color:'#16a34a',fontWeight:700,marginBottom:8 }}>📊 Premium Preview</div>
                  {form.plan==='Basic Protect'&&<><div style={{ fontSize:13,color:'#475569' }}>Premium: ₹2,800 · Coverage: ₹42,000</div><div style={{ fontSize:12,color:'#16a34a' }}>PM-FASAL: ₹840 subsidy → Net: ₹1,960</div></>}
                  {form.plan==='Smart Shield'&&<><div style={{ fontSize:13,color:'#475569' }}>Premium: ₹4,200 · Coverage: ₹70,000</div><div style={{ fontSize:12,color:'#16a34a' }}>PM-FASAL: ₹1,260 subsidy → Net: ₹2,940</div></>}
                  {form.plan==='Full Season Pro'&&<><div style={{ fontSize:13,color:'#475569' }}>Premium: ₹6,300 · Coverage: ₹1,22,500</div><div style={{ fontSize:12,color:'#16a34a' }}>PM-FASAL: ₹1,890 subsidy → Net: ₹4,410</div></>}
                </div>
              </div>
            </div>
            <div style={{ marginTop:20,display:'flex',justifyContent:'flex-end' }}>
              <button onClick={doEnroll} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#0f766e,#059669)',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 14px #0f766e44' }}>
                {loading&&<Spin />} {loading?'Enrolling…':'🚀 Issue Policy & Deploy Contract'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ORACLE ── */}
        {step==='verify'&&policy&&(
          <div className="fi">
            <h2 style={{ fontSize:22,fontWeight:800,marginBottom:4 }}>🛰️ Step 2 — Oracle + AI Quorum</h2>
            <p style={{ color:'#64748b',fontSize:14,marginBottom:20 }}>4 independent data sources · 4 specialist agents with deliberation logs · ≥75% weighted confidence.</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
              <div style={{ ...cs, background:'#f0fdf4',border:'1px solid #bbf7d0' }}>
                <div style={{ fontSize:12,color:'#16a34a',fontWeight:700,marginBottom:10 }}>✅ POLICY ISSUED</div>
                <div style={{ fontSize:21,fontWeight:900,fontFamily:'monospace',marginBottom:10 }}>{policy.policy_id}</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10 }}>
                  {[['Coverage','₹'+policy.coverage_inr.toLocaleString()],['Net Premium','₹'+policy.net_premium_inr.toLocaleString()],['PM-FASAL Subsidy','₹'+policy.subsidy_applied.toLocaleString()],['Block',String(policy.block_deployed)]].map(([k,v])=>(
                    <div key={k}><div style={{ fontSize:11,color:'#64748b' }}>{k}</div><div style={{ fontSize:13,fontWeight:700 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ fontSize:11,color:'#64748b' }}>Contract: <Chip h={policy.contract_address} /></div>
                <div style={{ fontSize:11,color:'#64748b',marginTop:4 }}>KYC: <Badge label={String(policy.kyc?.status||'VERIFIED')} color="#16a34a" /> DPDP ✓</div>
              </div>
              <div style={cs}>
                <h3 style={{ fontSize:15,fontWeight:700,marginBottom:14 }}>Select Event Type</h3>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                  {EVENTS.map(ev=>(
                    <button key={ev} onClick={()=>setForm(f=>({...f,event_type:ev}))}
                      style={{ border:`2px solid ${form.event_type===ev?EV_COL[ev]:'#e2e8f0'}`,background:form.event_type===ev?`${EV_COL[ev]}15`:'#fff',borderRadius:10,padding:'12px',transition:'all 0.18s' }}>
                      <div style={{ fontSize:20,marginBottom:4 }}>{ev==='drought'?'🏙️':ev==='flood'?'🌊':ev==='heatwave'?'🔥':'🌀'}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:form.event_type===ev?EV_COL[ev]:'#0f172a',textTransform:'capitalize' }}>{ev}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {verify&&(
              <div style={{ ...cs, marginBottom:16 }}>
                {/* Oracle sources */}
                <h4 style={{ fontSize:14,fontWeight:700,marginBottom:10 }}>🛰️ Oracle Data — 4 Sources ({verify.district})</h4>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20 }}>
                  {Object.entries(verify.oracle_data.sources).map(([key,s])=>(
                    <div key={key} style={{ background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'10px 12px' }}>
                      <div style={{ fontSize:11,color:'#64748b',fontWeight:600,marginBottom:4 }}>{ORC_ICONS[key]||'📡'} {key}</div>
                      <div style={{ fontSize:18,fontWeight:800,color:'#0f172a' }}>{s.value}</div>
                      <div style={{ fontSize:10,color:'#94a3b8' }}>{s.unit}</div>
                    </div>
                  ))}
                </div>

                {/* Agent cards with deliberation */}
                <h4 style={{ fontSize:14,fontWeight:700,marginBottom:10 }}>🤖 4-Agent AI Quorum — click to expand deliberation</h4>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
                  {Object.entries(verify.agent_quorum.agents).map(([name,a])=>(
                    <AgentCard key={name} name={name} a={a} />
                  ))}
                </div>

                {/* Quorum verdict */}
                <div style={{ background:verify.agent_quorum.quorum_met?'#f0fdf4':'#fef2f2',
                  border:`1px solid ${verify.agent_quorum.quorum_met?'#86efac':'#fca5a5'}`,
                  borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14 }}>Weighted Confidence: {verify.agent_quorum.weighted_confidence}%</div>
                    <div style={{ fontSize:12,color:'#64748b',marginTop:2 }}>{verify.agent_quorum.yes_count}/{verify.agent_quorum.total_agents} YES · {verify.agent_quorum.quorum_rule}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{ fontSize:14,fontWeight:700,color:'#16a34a',marginTop:3 }}>₹{verify.payout_amount.toLocaleString()} queued</div>}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:'flex',gap:12,justifyContent:'flex-end' }}>
              <button onClick={doVerify} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#1d4ed8,#2563eb)',color:'#fff',border:'none',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 14px #1d4ed844' }}>
                {loading&&<Spin />} {loading?'Running Oracle…':'🛰️ Run Oracle + Agent Quorum'}
              </button>
              {verify&&<button onClick={()=>setStep('execute')} style={{ background:'linear-gradient(135deg,#d97706,#b45309)',color:'#fff',border:'none',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:700 }}>⚡ Execute →</button>}
            </div>
          </div>
        )}

        {/* ── STEP 3: EXECUTE ── */}
        {step==='execute'&&(
          <div className="fi">
            <h2 style={{ fontSize:22,fontWeight:800,marginBottom:4 }}>⚡ Step 3 — Execute Smart Contract</h2>
            <p style={{ color:'#64748b',fontSize:14,marginBottom:20 }}>FSM: TRIGGERED → EXECUTED · SHA-256 tx hash · IMPS credit · NPCI UTR · SMS.</p>
            {verify&&(
              <div style={{ ...cs, background:'#fffbeb',border:'1px solid #fde68a',marginBottom:16 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:15 }}>Contract Ready — {verify.policy_id}</div>
                    <div style={{ fontSize:13,color:'#64748b',marginTop:4 }}>Event: <Badge label={verify.event_type} color={EV_COL[verify.event_type]} /> · Confidence: <b>{verify.agent_quorum.weighted_confidence}%</b></div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{ fontSize:22,fontWeight:900,color:'#16a34a',marginTop:4 }}>₹{verify.payout_amount.toLocaleString()}</div>}
                  </div>
                </div>
              </div>
            )}
            {execute&&(
              <div className="fi" style={{ ...cs, background:'#f0fdf4',border:'1px solid #86efac',marginBottom:16 }}>
                <div style={{ fontSize:16,fontWeight:800,color:'#16a34a',marginBottom:14 }}>✅ Payout Executed On-Chain + IMPS Credited</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14 }}>
                  {[['Payout','₹'+execute.payout_inr.toLocaleString(),'#16a34a'],['Method',execute.method,'#0369a1'],['Farmer',execute.farmer,'#0f172a'],['UPI Ref',execute.upi_ref,'#7c3aed'],['RRN',execute.rrn,'#0f766e'],['Block',String(execute.block_number),'#b45309']].map(([k,v,c])=>(
                    <div key={k} style={{ background:'#fff',borderRadius:8,padding:'10px 12px',border:'1px solid #dcfce7' }}>
                      <div style={{ fontSize:11,color:'#64748b',marginBottom:2 }}>{k}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:c as string }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:12 }}><span style={{ fontSize:10,color:'#94a3b8' }}>TX </span><Chip h={execute.tx_hash} /></div>
                <div style={{ background:'#fff',border:'1px solid #dcfce7',borderRadius:10,padding:'12px 14px' }}>
                  <div style={{ fontSize:11,color:'#64748b',fontWeight:600,marginBottom:4 }}>📱 SMS Sent to Farmer</div>
                  <div style={{ fontSize:12,color:'#0f172a',lineHeight:1.6 }}>{execute.sms_sent}</div>
                </div>
                <div style={{ marginTop:12,background:'#fff',border:'1px solid #dcfce7',borderRadius:10,padding:'12px 14px' }}>
                  <div style={{ fontSize:11,color:'#64748b',fontWeight:600,marginBottom:6 }}>📊 Impact vs Traditional</div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:12 }}>
                    <div><span style={{ color:'#94a3b8' }}>Traditional claim:</span> <b style={{ color:'#dc2626' }}>180 days</b></div>
                    <div><span style={{ color:'#94a3b8' }}>IIE settlement:</span> <b style={{ color:'#16a34a' }}>2.3 seconds</b></div>
                    <div><span style={{ color:'#94a3b8' }}>Forms required:</span> <b style={{ color:'#16a34a' }}>Zero</b></div>
                    <div><span style={{ color:'#94a3b8' }}>Fraud vector:</span> <b style={{ color:'#16a34a' }}>None (oracle-parametric)</b></div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display:'flex',gap:12,justifyContent:'flex-end' }}>
              {!execute&&<button onClick={doExecute} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#059669,#16a34a)',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 14px #16a34a44' }}>{loading&&<Spin />}{loading?'Executing…':'⚡ Execute Contract + IMPS Payout'}</button>}
              {execute&&<button onClick={doAudit} disabled={loading} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:10 }}>{loading&&<Spin />}🔗 View Audit Chain →</button>}
            </div>
          </div>
        )}

        {/* ── STEP 4: AUDIT ── */}
        {step==='audit'&&(
          <div className="fi">
            <h2 style={{ fontSize:22,fontWeight:800,marginBottom:4 }}>🔗 Step 4 — Tamper-Evident Audit Chain</h2>
            <p style={{ color:'#64748b',fontSize:14,marginBottom:20 }}>SHA-256 chained ledger. Each entry&apos;s prev_hash links to predecessor — immutable audit trail.</p>
            {audit&&(
              <div style={{ ...cs, marginBottom:16 }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10 }}>
                  <div><div style={{ fontSize:16,fontWeight:800 }}>Audit Ledger</div><div style={{ fontSize:13,color:'#64748b' }}>{audit.total_entries} entries · SHA-256 chained</div></div>
                  <Badge label={audit.chain_valid?'✓ Chain Valid':'⚠ Chain Broken'} color={audit.chain_valid?'#16a34a':'#dc2626'} />
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {[...audit.ledger].reverse().map(entry=>(
                    <div key={entry.seq} style={{ border:'1px solid #e2e8f0',borderRadius:10,padding:'12px 14px',
                      background:entry.event.includes('EXECUTED')?'#f0fdf4':entry.event.includes('TRIGGERED')?'#fffbeb':'#f8fafc' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6,flexWrap:'wrap',gap:6 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <span style={{ fontWeight:700,color:'#94a3b8',fontSize:12 }}>#{entry.seq}</span>
                          <Badge label={entry.event} color={entry.event.includes('EXECUTED')?'#16a34a':entry.event.includes('TRIGGERED')?'#d97706':'#0f766e'} />
                          <span style={{ fontSize:12,color:'#94a3b8' }}>{entry.policy_id}</span>
                        </div>
                        <span style={{ fontSize:11,color:'#94a3b8' }}>{entry.ts.slice(0,19).replace('T',' ')} UTC</span>
                      </div>
                      <div style={{ display:'flex',gap:16,flexWrap:'wrap' }}>
                        <div><span style={{ fontSize:10,color:'#94a3b8' }}>HASH </span><Chip h={entry.hash} /></div>
                        <div><span style={{ fontSize:10,color:'#94a3b8' }}>PREV </span><Chip h={entry.prev_hash} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!audit&&(
              <div style={{ textAlign:'center',padding:40 }}>
                <button onClick={doAudit} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:700,display:'inline-flex',alignItems:'center',gap:10 }}>{loading&&<Spin />}🔗 Fetch Audit Chain</button>
              </div>
            )}
            {audit&&<div style={{ display:'flex',justifyContent:'flex-end' }}><button onClick={doML} disabled={loading} style={{ background:'linear-gradient(135deg,#0369a1,#0284c7)',color:'#fff',border:'none',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:10 }}>{loading&&<Spin />}🤖 ML Predictor →</button></div>}
          </div>
        )}

        {/* ── STEP 5: ML ── */}
        {step==='ml'&&(
          <div className="fi">
            <h2 style={{ fontSize:22,fontWeight:800,marginBottom:4 }}>🤖 Step 5 — NaiveBayes LLR Risk Predictor</h2>
            <p style={{ color:'#64748b',fontSize:14,marginBottom:20 }}>Log-likelihood ratios · NDVI 40% + Temp 25% + Rainfall 25% + Soil 10% · Sigmoid transform → 0–100 score · FAO/ISRO/ICAR thresholds.</p>
            {ml&&(
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                <div style={cs}>
                  <div style={{ textAlign:'center',padding:'16px 0 14px' }}>
                    <div style={{ fontSize:60,fontWeight:900,color:RK_COL[ml.risk_level]??'#0f172a',lineHeight:1 }}>{ml.risk_score.toFixed(1)}</div>
                    <div style={{ fontSize:11,color:'#64748b',marginBottom:8 }}>/ 100.0 risk score (sigmoid)</div>
                    <Badge label={ml.risk_level} color={RK_COL[ml.risk_level]} />
                    <div style={{ marginTop:8,fontSize:13,fontWeight:700,color:ml.triggered?'#16a34a':'#64748b' }}>
                      {ml.triggered?'✅ AUTO-PAYOUT TRIGGERED':'🟡 Below trigger threshold'}
                    </div>
                    <div style={{ fontSize:11,color:'#94a3b8',marginTop:3 }}>Confidence: {ml.confidence_pct}% · Model: sigmoid(LLR)</div>
                  </div>
                  {/* LLR table */}
                  <div style={{ marginTop:12 }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#475569',marginBottom:8 }}>Log-Likelihood Ratios (FAO/ISRO/ICAR)</div>
                    {Object.entries(ml.log_likelihoods).map(([feat,v])=>{
                      const pct=Math.max(0,Math.min(100,(v.llr+2)*25));
                      const col=v.llr>2?'#dc2626':v.llr>1?'#d97706':v.llr>0?'#f59e0b':'#16a34a';
                      return (
                        <div key={feat} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3 }}>
                            <span style={{ color:'#475569' }}>{feat} <span style={{ color:'#94a3b8',fontSize:10 }}>({v.weight})</span></span>
                            <span style={{ fontWeight:700,color:col }}>LLR={v.llr} · {v.label}</span>
                          </div>
                          <div style={{ background:'#f1f5f9',borderRadius:4,height:7 }}>
                            <div style={{ width:`${pct}%`,background:col,height:7,borderRadius:4,transition:'width 0.5s' }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize:11,color:'#64748b',marginTop:8,fontFamily:'monospace',background:'#f8fafc',padding:'6px 10px',borderRadius:6 }}>
                      Total LLR = {ml.total_llr} → score = 100/(1+e^(-{ml.total_llr}×0.55)) = {ml.risk_score}
                    </div>
                  </div>
                </div>
                <div style={cs}>
                  <div style={{ fontSize:13,fontWeight:700,marginBottom:12 }}>🚩 Risk Flags</div>
                  {ml.flags.length===0
                    ?<div style={{ color:'#16a34a',fontSize:13 }}>✅ No risk flags</div>
                    :<div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                      {ml.flags.map((f,i)=><div key={i} style={{ background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#7f1d1d' }}>{f}</div>)}
                    </div>
                  }
                  <div style={{ marginTop:16,padding:'10px 12px',background:'#f8fafc',borderRadius:8,fontSize:11,color:'#475569' }}>
                    <b>Model:</b> {ml.model}<br/>
                    <b style={{ marginTop:6,display:'block',color:ml.triggered?'#16a34a':'#64748b' }}>→ {ml.recommendation}</b>
                  </div>
                </div>
              </div>
            )}
            {!ml&&(
              <div style={{ textAlign:'center',padding:40 }}>
                <button onClick={doML} disabled={loading} style={{ background:loading?'#94a3b8':'linear-gradient(135deg,#0369a1,#0284c7)',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:700,display:'inline-flex',alignItems:'center',gap:10 }}>{loading&&<Spin />}🤖 Run ML Predictor</button>
              </div>
            )}
            {ml&&(
              <div style={{ marginTop:20,display:'flex',justifyContent:'center',gap:12 }}>
                <button onClick={reset} style={{ background:'linear-gradient(135deg,#0f766e,#059669)',color:'#fff',border:'none',borderRadius:10,padding:'13px 32px',fontSize:15,fontWeight:700,boxShadow:'0 4px 14px #0f766e44' }}>🔄 Run Another Demo</button>
                <a href="/impact" style={{ background:'#d97706',color:'#fff',textDecoration:'none',borderRadius:10,padding:'13px 28px',fontSize:15,fontWeight:700 }}>📊 See Impact →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
