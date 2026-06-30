'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type Step = 'enroll'|'verify'|'execute'|'audit'|'ml';
type CState = 'ACTIVE'|'TRIGGERED'|'FRAUD_REVIEW'|'EXECUTED'|'REJECTED';
type ForceState = ''|'FRAUD_REVIEW'|'REJECTED';

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
  current_state?:CState; previous_state?:CState;
}
interface AuditEntry { seq:number; ts:string; event:string; policy_id:string; hash:string; prev_hash:string; data:Record<string,unknown>; }
interface MLResult {
  risk_score:number; risk_level:string; triggered:boolean; confidence_pct:number;
  log_likelihoods:Record<string,{llr:number;weight:string;label:string}>;
  total_llr:number; flags:string[]; model:string; recommendation:string;
}
interface TrainMetrics {
  version:string; algorithm:string; metrics:{ accuracy:number; precision:number; recall:number; f1:number; auc:number; train_rows:number; val_rows:number; feature_count:number; };
  feature_importance:Array<{feature:string;importance:number}>;
  confusion_matrix?:{ tp:number; fp:number; tn:number; fn:number };
}

const CROPS     = ['paddy','cotton','wheat','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const PLANS     = ['Basic Protect','Smart Shield','Full Season Pro'];
const EVENTS    = ['drought','flood','heatwave','cyclone'];
const DISTRICTS = ['Barmer','Puri','Latur','Warangal','Nashik','Ludhiana','Jodhpur','Adilabad'];
const EV_COL: Record<string,string>  = { drought:'#f59e0b', flood:'#38bdf8', heatwave:'#f87171', cyclone:'#a78bfa' };
const EV_ICO: Record<string,string>  = { drought:'\u2600\uFE0F', flood:'\u{1F30A}', heatwave:'\u{1F525}', cyclone:'\u{1F300}' };
const RK_COL: Record<string,string>  = { CRITICAL:'#f87171', HIGH:'#fb923c', MEDIUM:'#fbbf24', LOW:'#4ade80' };
const ORC_ICO: Record<string,string> = { NASA_MODIS:'\u{1F6F0}', IMD_Rainfall:'\u{1F327}', ISRO_Bhuvan:'\u{1F321}', ICAR_Sensors:'\u{1F331}' };
const STATE_COL: Record<CState,string> = { ACTIVE:'#34d399', TRIGGERED:'#fbbf24', FRAUD_REVIEW:'#f97316', EXECUTED:'#4ade80', REJECTED:'#f87171' };

const HI: Record<string,string> = {
  enroll:'\u0915\u093F\u0938\u093E\u0928 \u0928\u093E\u092E\u093E\u0902\u0915\u0928',
  oracle:'\u0913\u0930\u0947\u0915\u0932 \u091C\u093E\u0901\u091A',
  execute:'\u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902',
  audit:'\u0911\u0921\u093F\u091F \u0936\u0943\u0902\u0916\u0932\u093E',
  ml:'\u091C\u094B\u0916\u093F\u092E \u092E\u0949\u0921\u0932',
  loading:'\u092A\u094D\u0930\u0938\u0902\u0938\u094D\u0915\u0930\u0923\u2026',
  payout_done:'\u2705 \u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u094B \u0917\u092F\u093E!',
  sms_label:'\u{1F4F1} \u0915\u093F\u0938\u093E\u0928 \u0915\u094B SMS',
  ramesh_btn:'\u0930\u092E\u0947\u0936 \u0915\u0947 \u0930\u0942\u092A \u092E\u0947\u0902 \u0928\u093E\u092E\u093E\u0902\u0915\u093F\u0924 \u0915\u0930\u0947\u0902',
};

function Spin() {
  return <span style={{ display:'inline-block',width:14,height:14,border:'2px solid #ffffff33',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0 }} />;
}
function Chip({ h }: { h:string }) {
  return <span style={{ fontFamily:'monospace',fontSize:10,background:'#1e293b',border:'1px solid #334155',borderRadius:4,padding:'2px 6px',color:'#94a3b8',wordBreak:'break-all' }}>{h.slice(0,22)}\u2026</span>;
}
function Badge({ label, color='#0f766e' }: { label:string; color?:string }) {
  return <span style={{ background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:6,padding:'2px 9px',fontSize:11,fontWeight:600,whiteSpace:'nowrap' }}>{label}</span>;
}
function Dot({ s }: { s:CState }) {
  const c = STATE_COL[s];
  return <span style={{ display:'inline-flex',alignItems:'center',gap:5 }}>
    <span style={{ width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 7px ${c}`,display:'inline-block',animation:s==='TRIGGERED'||s==='FRAUD_REVIEW'?'pulse 1s infinite':undefined }} />
    <b style={{ color:c,fontSize:12 }}>{s}</b>
  </span>;
}
function Card({ children, style }: { children:React.ReactNode; style?:React.CSSProperties }) {
  return <div style={{ background:'#0f172a',border:'1px solid #1e293b',borderRadius:14,padding:'18px 20px',...style }}>{children}</div>;
}
function Label({ children }: { children:React.ReactNode }) {
  return <div style={{ fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3 }}>{children}</div>;
}

function AgentBar({ name, a, delay }: { name:string; a:Agent; delay:number }) {
  const [width, setWidth] = useState(0);
  const [open, setOpen]   = useState(false);
  const yes = a.decision.includes('YES');
  useEffect(() => { const t = setTimeout(()=>setWidth(a.confidence), delay); return ()=>clearTimeout(t); }, [a.confidence, delay]);
  const col = yes ? '#4ade80' : '#f87171';
  return (
    <div role="button" tabIndex={0} aria-expanded={open}
      onKeyDown={e => { if (e.key === 'Enter') setOpen(o => !o); }}
      onClick={() => setOpen(o => !o)}
      style={{ background:yes?'#052e16':'#2d0a0a',border:`1px solid ${yes?'#166534':'#7f1d1d'}`,borderRadius:10,padding:'12px 14px',cursor:'pointer',transition:'border-color 0.2s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
        <div style={{ fontSize:11,fontWeight:700,color:col }}>{yes?'\u2705':'\u274C'} {name.replace(/_/g,' ')}</div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          <span style={{ fontSize:10,color:'#64748b' }}>{a.weight}</span>
          <span style={{ fontWeight:800,fontSize:13,color:col }}>{a.confidence}%</span>
          <span style={{ fontSize:9,color:'#475569' }}>{open?'\u25B2':'\u25BC'}</span>
        </div>
      </div>
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

function FeatureImportance({ train }:{ train:TrainMetrics }) {
  const top = train.feature_importance.slice(0,8);
  const max = Math.max(...top.map(f=>f.importance), 1);
  const [animate, setAnimate] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setAnimate(true),150); return ()=>clearTimeout(t); }, [train.version]);
  return (
    <Card>
      <div style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>\u{1F4C8} GB Feature Importance</div>
      <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
        {top.map((f,i)=>{
          const pct = (f.importance/max)*100;
          const col = i===0 ? '#4ade80' : i<3 ? '#38bdf8' : '#a78bfa';
          return (
            <div key={f.feature}>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:3 }}>
                <span style={{ color:'#94a3b8',fontWeight:600 }}>{f.feature}</span>
                <span style={{ color:col,fontWeight:800 }}>{(f.importance*100).toFixed(1)}%</span>
              </div>
              <div style={{ background:'#1e293b',borderRadius:5,height:9,overflow:'hidden' }}>
                <div style={{ width: animate ? `${pct}%` : 0, height:9, borderRadius:5, background:`linear-gradient(90deg,${col}88,${col})`, transition:`width 0.9s ease ${i*0.08}s` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TrainPanel({ train }:{ train:TrainMetrics }) {
  const m = train.metrics;
  return (
    <Card>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:6 }}>
        <div style={{ fontSize:12,fontWeight:700,color:'#e2e8f0' }}>\u{1F9E0} ML Training Metrics</div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          <Badge label={train.algorithm} color='#38bdf8' />
          <Badge label={train.version} color='#a78bfa' />
        </div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7 }} className="g4">
        {[
          ['Accuracy',`${(m.accuracy*100).toFixed(1)}%`,'#4ade80'],
          ['Precision',`${(m.precision*100).toFixed(1)}%`,'#38bdf8'],
          ['Recall',`${(m.recall*100).toFixed(1)}%`,'#fbbf24'],
          ['AUC',`${(m.auc*100).toFixed(1)}%`,'#a78bfa'],
          ['Train Rows',String(m.train_rows),'#94a3b8'],
          ['Val Rows',String(m.val_rows),'#94a3b8'],
          ['Features',String(m.feature_count),'#94a3b8'],
          ['F1',`${(m.f1*100).toFixed(1)}%`,'#f87171'],
        ].map(([k,v,c])=>(
          <div key={k as string} style={{ background:'#030712',border:'1px solid #1e293b',borderRadius:8,padding:'8px 9px' }}>
            <div style={{ fontSize:9,color:'#475569',marginBottom:2 }}>{k as string}</div>
            <div style={{ fontSize:13,fontWeight:800,color:c as string }}>{v as string}</div>
          </div>
        ))}
      </div>
      {train.confusion_matrix && (
        <div style={{ marginTop:10,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7 }} className="g4">
          {([
            ['TP',train.confusion_matrix.tp,'#4ade80'],['FP',train.confusion_matrix.fp,'#fbbf24'],['TN',train.confusion_matrix.tn,'#38bdf8'],['FN',train.confusion_matrix.fn,'#f87171']
          ] as [string,number,string][]).map(([k,v,c])=>(
            <div key={k} style={{ background:'#0b1220',border:'1px solid #1e293b',borderRadius:8,padding:'8px 9px' }}>
              <div style={{ fontSize:9,color:'#475569',marginBottom:2 }}>{k}</div>
              <div style={{ fontSize:13,fontWeight:800,color:c }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function FSMPath({ current, previous }:{ current?:CState; previous?:CState }) {
  const states:CState[] = ['ACTIVE','TRIGGERED','FRAUD_REVIEW','EXECUTED','REJECTED'];
  const stateIcon: Record<CState,string> = {
    ACTIVE:       '\u{1F7E2}',
    TRIGGERED:    '\u26A1',
    FRAUD_REVIEW: '\u{1F575}',
    EXECUTED:     '\u2705',
    REJECTED:     '\u274C',
  };
  return (
    <Card style={{ background:'#0d1117',border:'1px solid #1e293b' }}>
      <div style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>\u{1F517} 6-State FSM Path</div>
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:12 }}>
        {states.map(s=>{
          const active = s===current;
          const passed = previous===s || (s==='ACTIVE'&&current&&current!=='ACTIVE') || (s==='TRIGGERED'&&['EXECUTED','FRAUD_REVIEW','REJECTED'].includes(current||''));
          const col = STATE_COL[s];
          return (
            <div key={s} style={{ flex:'1 1 90px',minWidth:90,background:active?`${col}18`:'#030712',border:`${active?2:1}px solid ${active?col:passed?`${col}66`:'#1e293b'}`,borderRadius:10,padding:'10px 8px',textAlign:'center',boxShadow:active?`0 0 18px ${col}44`:undefined,animation:s==='FRAUD_REVIEW'&&active?'fraudPulse 1.2s ease-in-out infinite':undefined }}>
              <div style={{ fontSize:18 }}>{stateIcon[s]}</div>
              <div style={{ fontSize:10,fontWeight:800,color:active?col:passed?col:'#475569' }}>{s}</div>
            </div>
          );
        })}
      </div>
      {current && (
        <div style={{ fontSize:11,color:'#94a3b8',background:'#030712',border:'1px solid #1e293b',borderRadius:8,padding:'8px 10px' }}>
          Transition: <b style={{ color: previous ? STATE_COL[previous] : '#94a3b8' }}>{previous ?? 'ACTIVE'}</b> \u2192 <b style={{ color:STATE_COL[current] }}>{current}</b>
        </div>
      )}
    </Card>
  );
}

interface Particle { id:number; x:number; color:string; delay:number; size:number; rot:number; }
function ClaimModal({ exec, onClose, hindi }: { exec:ExecuteResult; onClose:()=>void; hindi:boolean }) {
  const particles: Particle[] = Array.from({length:40},(_,i)=>({
    id:i, x:Math.random()*100, color:['#4ade80','#34d399','#fbbf24','#38bdf8','#a78bfa','#f472b6'][i%6],
    delay:Math.random()*1.2, size:5+Math.random()*9, rot:Math.random()*360,
  }));
  return (
    <div role="dialog" aria-modal="true" aria-label="Payout confirmed" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }} onClick={onClose}>
      <div style={{ background:'#0d1117',border:'2px solid #166534',borderRadius:24,padding:'36px 32px',maxWidth:460,width:'100%',textAlign:'center',position:'relative',overflow:'hidden',boxShadow:'0 0 60px #4ade8044' }} onClick={e=>e.stopPropagation()}>
        {particles.map(p=>(<div key={p.id} style={{ position:'absolute',left:`${p.x}%`,top:-16,width:p.size,height:p.size,background:p.color,borderRadius:3,transform:`rotate(${p.rot}deg)`,animation:`confettiFall 2.2s ease-in ${p.delay}s both` }} />))}
        <div style={{ position:'relative',display:'inline-block',marginBottom:8 }}>
          <div style={{ position:'absolute',inset:-20,borderRadius:'50%',border:'4px solid #4ade80',animation:'burstRing 0.7s ease-out both',opacity:0 }} />
          <div style={{ fontSize:56,lineHeight:1 }}>\u{1F389}</div>
        </div>
        <div style={{ fontSize:20,fontWeight:900,color:'#4ade80',marginBottom:4 }}>{hindi?'\u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u094B \u0917\u092F\u093E!':'Claim Triggered!'}</div>
        <div style={{ fontSize:38,fontWeight:900,color:'#34d399',marginBottom:6,animation:'celebrate 0.6s ease' }}>\u20B9{exec.payout_inr.toLocaleString()}</div>
        <div style={{ fontSize:13,color:'#64748b',marginBottom:18 }}>{hindi?`${exec.farmer} \u0915\u0947 \u0916\u093E\u0924\u0947 \u092E\u0947\u0902 IMPS \u0926\u094D\u0935\u093E\u0930\u093E`:`Credited to ${exec.farmer} via IMPS`}</div>
        <div style={{ background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'12px 14px',marginBottom:14,textAlign:'left' }}>
          <div style={{ fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:5,letterSpacing:'0.04em' }}>{hindi?HI.sms_label:'\u{1F4F1} SMS SENT TO FARMER'}</div>
          <div style={{ fontSize:11,color:'#d1fae5',lineHeight:1.7,fontFamily:'monospace' }}>{exec.sms_sent}</div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
          {([['UPI Ref',exec.upi_ref,'#a78bfa'],['RRN',exec.rrn,'#38bdf8'],['Block',String(exec.block_number),'#fbbf24'],['Method',exec.method,'#4ade80']] as [string,string,string][]).map(([k,v,c])=>(
            <div key={k} style={{ background:'#0f172a',borderRadius:8,padding:'8px 10px',border:'1px solid #1e293b' }}>
              <div style={{ fontSize:9,color:'#475569',marginBottom:1 }}>{k}</div>
              <div style={{ fontSize:11,fontWeight:700,color:c,fontFamily:'monospace' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:11,background:'#1c1400',border:'1px solid #854d0e',borderRadius:10,padding:'10px',marginBottom:18 }}>
          <div><span style={{ color:'#78716c' }}>{hindi?'\u092A\u0930\u0902\u092A\u0930\u093E\u0917\u0924:':'Traditional:'}</span> <b style={{ color:'#f87171' }}>180 {hindi?'\u0926\u093F\u0928':'days'}</b></div>
          <div><span style={{ color:'#78716c' }}>IIE:</span> <b style={{ color:'#4ade80' }}>2.3 sec</b></div>
          <div><span style={{ color:'#78716c' }}>{hindi?'\u092B\u093C\u0949\u0930\u094D\u092E:':'Forms:'}</span> <b style={{ color:'#4ade80' }}>{hindi?'\u0936\u0942\u0928\u094D\u092F':'Zero'}</b></div>
          <div><span style={{ color:'#78716c' }}>{hindi?'\u0927\u094B\u0916\u093E\u0927\u095C\u0940:':'Fraud:'}</span> <b style={{ color:'#4ade80' }}>{hindi?'\u0905\u0938\u0902\u092D\u0935':'Impossible'}</b></div>
        </div>
        <button onClick={onClose} style={{ background:'linear-gradient(135deg,#065f46,#047857)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 28px',fontSize:13,fontWeight:700,cursor:'pointer' }}>{hindi?'\u092C\u0902\u0926 \u0915\u0930\u0947\u0902':'Close'}</button>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [step, setStep] = useState<Step>('enroll');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [hindi, setHindi] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [forceState, setForceState] = useState<ForceState>('');
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const [form, setForm] = useState({
    name:'Ramesh Kumar', aadhaar_last4:'4821', district:'Barmer', state:'Rajasthan',
    crop:'wheat', acreage:'4.5', plan:'Smart Shield', event_type:'drought',
  });

  const [policy, setPolicy] = useState<Policy|null>(null);
  const [verify, setVerify] = useState<VerifyResult|null>(null);
  const [execute, setExecute] = useState<ExecuteResult|null>(null);
  const [audit, setAudit] = useState<{chain_valid:boolean;total_entries:number;ledger:AuditEntry[]}|null>(null);
  const [ml, setMl] = useState<MLResult|null>(null);
  const [train, setTrain] = useState<TrainMetrics|null>(null);
  const [health, setHealth] = useState<{status:string;version:string}|null>(null);

  const ping = useCallback(async () => { try { const r = await fetch('/api/health'); setHealth(await r.json()); } catch { setHealth(null); } }, []);
  useEffect(() => { ping(); }, [ping]);

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(()=>setElapsed(e=>e+1), 100); };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } };

  const post = async (url:string, body:object) => {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error||'API error');
    return d;
  };

  const doRamesh = async () => {
    const f = { name:'Ramesh Kumar', aadhaar_last4:'4821', district:'Barmer', state:'Rajasthan', crop:'wheat', acreage:'4.5', plan:'Smart Shield', event_type:'drought' };
    setForm(f); setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setTrain(null); setError(''); setStep('enroll');
    setLoading(true); startTimer();
    try {
      const p = await post('/api/oracle/enroll', { ...f, acreage:4.5 });
      setPolicy(p); setStep('verify');
      const v = await post('/api/oracle/verify', { policy_id:p.policy_id, event_type:'drought', district:'Barmer', crop:'wheat', acreage:4.5 });
      setVerify(v); setStep('execute');
      const x = await post('/api/contract/execute', { policy_id:p.policy_id, farmer_name:'Ramesh Kumar', payout_amount:v.payout_amount, ...(forceState ? { force_state: forceState } : {}) });
      setExecute(x); setStep('audit'); if ((x.current_state ?? 'EXECUTED') === 'EXECUTED') setShowModal(true); ping();
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const doEnroll = async () => {
    setLoading(true); setError(''); startTimer();
    try { const d = await post('/api/oracle/enroll', { ...form, acreage:parseFloat(form.acreage) }); setPolicy(d); setStep('verify'); ping(); }
    catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };
  const doVerify = async () => {
    if (!policy) return;
    setLoading(true); setError(''); startTimer();
    try { const d = await post('/api/oracle/verify', { policy_id:policy.policy_id, event_type:form.event_type, district:form.district, crop:form.crop, acreage:parseFloat(form.acreage) }); setVerify(d); setStep('execute'); }
    catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };
  const doExecute = async () => {
    if (!policy) return;
    setLoading(true); setError(''); startTimer();
    try {
      const d = await post('/api/contract/execute', { policy_id:policy.policy_id, farmer_name:form.name, payout_amount:verify?.payout_amount, ...(forceState ? { force_state: forceState } : {}) });
      setExecute(d); setStep('audit'); if ((d.current_state ?? 'EXECUTED') === 'EXECUTED') setShowModal(true); ping();
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
        const pred = await post('/api/ml/predict', { district:row.district, ndvi:row.ndvi, temp_c:row.temp_c, rainfall_mm:row.rainfall_mm, soil_moisture_pct:row.soil_moisture });
        setMl(pred);
      }
      try {
        const t = await fetch('/api/ml/train');
        const td = await t.json();
        setTrain(td);
      } catch {}
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Error'); }
    stopTimer(); setLoading(false);
  };

  const reset = () => {
    setStep('enroll'); setPolicy(null); setVerify(null); setExecute(null); setAudit(null); setMl(null); setTrain(null); setError(''); stopTimer(); setForceState('');
    setForm(f => ({ ...f, name:'Farmer '+Math.floor(Math.random()*9000+1000), aadhaar_last4:String(Math.floor(Math.random()*9000+1000)), district:DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)], crop:CROPS[Math.floor(Math.random()*CROPS.length)] }));
  };

  const STEPS: {id:Step;label:string;icon:string}[] = [
    {id:'enroll', icon:'\u{1F4CB}', label:hindi?HI.enroll:'1. Enroll'},
    {id:'verify', icon:'\u{1F6F0}', label:hindi?'2. '+HI.oracle:'2. Oracle'},
    {id:'execute',icon:'\u26A1',    label:hindi?'3. '+HI.execute:'3. Execute'},
    {id:'audit',  icon:'\u{1F517}', label:hindi?'4. '+HI.audit:'4. Audit'},
    {id:'ml',     icon:'\u{1F916}', label:hindi?'5. '+HI.ml:'5. ML'},
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
        @keyframes fraudPulse   { 0%,100%{box-shadow:0 0 12px #f9731644} 50%{box-shadow:0 0 32px #f97316cc} }
        .fi { animation:fadeIn 0.35s ease }
        .cel{ animation:celebrate 0.5s ease }
        * { box-sizing:border-box }
        button,a { cursor:pointer }
        input,select { outline:none;font-family:inherit }
        input:focus,select:focus { border-color:#34d399!important;box-shadow:0 0 0 3px #34d39922 }
        ::-webkit-scrollbar { width:4px;height:4px }
        ::-webkit-scrollbar-track { background:#0f172a }
        ::-webkit-scrollbar-thumb { background:#334155;border-radius:2px }
        @media(max-width:640px){.g2{grid-template-columns:1fr!important}.g4{grid-template-columns:1fr 1fr!important}.g3{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {showModal && execute && <ClaimModal exec={execute} onClose={()=>setShowModal(false)} hindi={hindi} />}

      <div style={{ background:'#0d1117',borderBottom:'1px solid #1e293b',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,position:'sticky',top:0,zIndex:50 }}>
        <div style={{ display:'flex',overflowX:'auto',scrollbarWidth:'none' }}>
          {STEPS.map((s,i) => {
            const active = step===s.id, d = done(s.id);
            return (
              <div key={s.id} style={{ display:'flex',alignItems:'center' }}>
                <button onClick={()=>d?setStep(s.id):undefined} disabled={!d&&!active} aria-current={active?'step':undefined}
                  style={{ display:'flex',alignItems:'center',gap:5,padding:'13px 14px',whiteSpace:'nowrap',background:'transparent',border:'none',borderBottom:active?'2px solid #34d399':d?'2px solid #4ade80':'2px solid transparent',color:active?'#34d399':d?'#4ade80':'#475569',cursor:d?'pointer':active?'default':'not-allowed',fontSize:12,fontWeight:active?700:500,fontFamily:'inherit' }}>
                  <span style={{ fontSize:13 }}>{d?'\u2705':s.icon}</span>{s.label}
                </button>
                {i<STEPS.length-1&&<span style={{ color:'#1e293b',fontSize:12 }}>\u203A</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 0',flexShrink:0 }}>
          {health&&<span style={{ fontSize:10,color:'#4ade80',fontWeight:700 }}>\u{1F7E2} {health.version}</span>}
          {loading&&<span style={{ fontSize:10,color:'#34d399',fontFamily:'monospace' }}>\u23F1 {(elapsed/10).toFixed(1)}s</span>}
          <button onClick={()=>setHindi(h=>!h)} aria-label="Toggle Hindi" style={{ background:hindi?'#065f46':'#1e293b',color:hindi?'#d1fae5':'#94a3b8',border:'1px solid #334155',borderRadius:7,padding:'5px 9px',fontSize:11,fontWeight:700 }}>{hindi?'EN':'\u0939\u093F'}</button>
          <button onClick={reset} style={{ background:'#0f766e',color:'#fff',border:'none',borderRadius:7,padding:'5px 13px',fontSize:11,fontWeight:700 }}>+ New</button>
        </div>
      </div>

      <div style={{ background:'linear-gradient(135deg,#064e3b,#0c4a6e)',borderBottom:'1px solid #065f46',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}>
        <div>
          <div style={{ color:'#d1fae5',fontWeight:800,fontSize:14 }}>{hindi?'\u26A1 \u090F\u0915 \u0915\u094D\u0932\u093F\u0915 \u0921\u0947\u092E\u094B \u2014 \u0930\u092E\u0947\u0936 \u0915\u0941\u092E\u093E\u0930, \u092C\u093E\u095C\u092E\u0947\u0930':'\u26A1 One-click Demo \u2014 Enroll Ramesh Kumar in Barmer'}</div>
          <div style={{ color:'#6ee7b7',fontSize:11,marginTop:2 }}>{hindi?'\u0928\u093E\u092E\u093E\u0902\u0915\u0928 \u2192 \u0913\u0930\u0947\u0915\u0932 \u2192 FSM \u092A\u0925 \u2192 ML \u092A\u0948\u0928\u0932':'Enroll \u2192 Oracle quorum \u2192 FSM path \u2192 ML metrics in one shot.'}</div>
        </div>
        <button onClick={doRamesh} disabled={loading} aria-label="One-click enroll Ramesh Kumar" style={{ background:loading?'#374151':'#ecfdf5',color:loading?'#9ca3af':'#065f46',border:'none',borderRadius:10,padding:'10px 22px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px #00000066',flexShrink:0,transition:'all 0.2s' }}>
          {loading?<><Spin/> {hindi?HI.loading:'Running\u2026'}</>:<>\u{1F680} {hindi?HI.ramesh_btn:'Enroll as Ramesh in Barmer'}</>}
        </button>
      </div>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'20px 14px' }}>
        {error&&(<div className="fi" role="alert" style={{ background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:10,padding:'10px 14px',color:'#fca5a5',marginBottom:14,fontSize:12 }}>\u26A0\uFE0F {error}</div>)}

        {step==='enroll'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'\u{1F4CB} '+HI.enroll:'\u{1F4CB} Step 1 \u2014 Enroll Farmer'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>{hindi?'\u0906\u0927\u093E\u0930 eKYC \u00B7 DigiLocker RoR \u00B7 PM-FASAL \u0938\u092C\u094D\u0938\u093F\u0921\u0940 \u00B7 \u0911\u0928-\u091A\u0947\u0928 \u0915\u0949\u0928\u094D\u091F\u094D\u0930\u0948\u0915\u094D\u091F':'Aadhaar eKYC OTP \u00B7 DigiLocker RoR pull \u00B7 PM-FASAL subsidy \u00B7 On-chain contract deploy.'}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }} className="g2">
              <Card>
                <h2 style={{ fontSize:13,fontWeight:700,marginBottom:12,color:'#e2e8f0' }}>{hindi?'\u0915\u093F\u0938\u093E\u0928 \u0935\u093F\u0935\u0930\u0923':'Farmer Details'}</h2>
                {([['name',hindi?'\u0915\u093F\u0938\u093E\u0928 \u0915\u093E \u0928\u093E\u092E':'Farmer Name','text'],['aadhaar_last4',hindi?'\u0906\u0927\u093E\u0930 \u0915\u0947 \u0905\u0902\u0924\u093F\u092E 4':'Aadhaar Last 4','text'],['district',hindi?'\u091C\u093F\u0932\u093E':'District','text'],['state',hindi?'\u0930\u093E\u091C\u094D\u092F':'State','text'],['acreage',hindi?'\u090F\u0915\u095C':'Acreage (acres)','number']] as [keyof typeof form,string,string][]).map(([k,l,t])=>(
                  <div key={k} style={{ marginBottom:10 }}><Label>{l}</Label><input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} type={t} style={inp()} /></div>
                ))}
              </Card>
              <Card>
                <h2 style={{ fontSize:13,fontWeight:700,marginBottom:12,color:'#e2e8f0' }}>{hindi?'\u092B\u0938\u0932 \u0914\u0930 \u092F\u094B\u091C\u0928\u093E':'Crop & Plan'}</h2>
                <div style={{ marginBottom:10 }}><Label>{hindi?'\u092B\u0938\u0932':'Crop'}</Label><select value={form.crop} onChange={e=>setForm(f=>({...f,crop:e.target.value}))} style={inp()}>{CROPS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div style={{ marginBottom:10 }}><Label>{hindi?'\u092C\u0940\u092E\u093E \u092F\u094B\u091C\u0928\u093E':'Insurance Plan'}</Label><select value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value}))} style={inp()}>{PLANS.map(p=><option key={p}>{p}</option>)}</select></div>
                <div style={{ marginBottom:14 }}><Label>Demo State Path</Label><select value={forceState} onChange={e=>setForceState(e.target.value as ForceState)} style={inp()}><option value=''>Normal EXECUTED path</option><option value='FRAUD_REVIEW'>Force FRAUD_REVIEW</option><option value='REJECTED'>Force REJECTED</option></select></div>
                <div style={{ background:forceState==='FRAUD_REVIEW'?'#1c0a00':forceState==='REJECTED'?'#2d0a0a':'#052e16',border:`1px solid ${forceState==='FRAUD_REVIEW'?'#9a3412':forceState==='REJECTED'?'#7f1d1d':'#166534'}`,borderRadius:10,padding:'12px 14px' }}>
                  <div style={{ fontSize:10,color:forceState==='FRAUD_REVIEW'?'#f97316':forceState==='REJECTED'?'#f87171':'#4ade80',fontWeight:700,marginBottom:5,letterSpacing:'0.04em' }}>\u{1F4CA} DEMO MODE</div>
                  <div style={{ fontSize:12,color:'#94a3b8' }}>{forceState==='FRAUD_REVIEW'?'Shows orange review path before final settlement.':forceState==='REJECTED'?'Shows failed transition and claim rejection path.':'Shows standard TRIGGERED \u2192 EXECUTED payout flow.'}</div>
                </div>
              </Card>
            </div>
            <div style={{ marginTop:14,display:'flex',justifyContent:'flex-end' }}>
              <button onClick={doEnroll} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#065f46,#047857)',color:loading?'#475569':'#d1fae5',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:loading?'none':'0 4px 16px #065f4666' }}>{loading&&<Spin/>} {loading?(hindi?HI.loading:'Enrolling\u2026'):(hindi?'\u{1F680} \u092A\u094B\u0932\u093F\u0938\u0940 \u091C\u093E\u0930\u0940 \u0915\u0930\u0947\u0902':'\u{1F680} Issue Policy & Deploy Contract')}</button>
            </div>
          </div>
        )}

        {step==='verify'&&policy&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'\u{1F6F0} \u0913\u0930\u0947\u0915\u0932 + AI \u0915\u094B\u0930\u092E':'\u{1F6F0} Step 2 \u2014 Oracle + AI Quorum'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>{hindi?'4 \u0938\u094D\u0930\u094B\u0924 \u00B7 4 \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E \u090F\u091C\u0947\u0902\u091F \u00B7 \u226575% \u092D\u093E\u0930 \u0935\u093F\u0936\u094D\u0935\u093E\u0938':'4 independent sources \u00B7 4 specialist agents \u00B7 \u226575% weighted confidence required.'}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12 }} className="g2">
              <Card style={{ background:'#052e16',border:'1px solid #166534' }}>
                <div style={{ fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:7,letterSpacing:'0.05em' }}>\u2705 POLICY ISSUED</div>
                <div style={{ fontSize:17,fontWeight:900,fontFamily:'monospace',marginBottom:8,color:'#d1fae5' }}>{policy.policy_id}</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:7 }}>{[['Coverage','\u20B9'+policy.coverage_inr.toLocaleString()],['Net Premium','\u20B9'+policy.net_premium_inr.toLocaleString()],['PM-FASAL','\u20B9'+policy.subsidy_applied.toLocaleString()],['Block',String(policy.block_deployed)]].map(([k,v])=>(<div key={k}><div style={{ fontSize:9,color:'#64748b' }}>{k}</div><div style={{ fontSize:11,fontWeight:700,color:'#e2e8f0' }}>{v}</div></div>))}</div>
                <div style={{ fontSize:9,color:'#64748b' }}>Contract: <Chip h={policy.contract_address} /></div>
              </Card>
              <Card>
                <h2 style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>{hindi?'\u0918\u091F\u0928\u093E \u0915\u093E \u092A\u094D\u0930\u0915\u093E\u0930':'Event Type'}</h2>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>{EVENTS.map(ev=>(<button key={ev} onClick={()=>setForm(f=>({...f,event_type:ev}))} aria-pressed={form.event_type===ev} style={{ border:`2px solid ${form.event_type===ev?EV_COL[ev]:'#1e293b'}`,background:form.event_type===ev?`${EV_COL[ev]}18`:'#0f172a',borderRadius:10,padding:'10px 6px',transition:'all 0.18s',color:'#e2e8f0' }}><div style={{ fontSize:20,marginBottom:3 }}>{EV_ICO[ev]}</div><div style={{ fontSize:11,fontWeight:700,color:form.event_type===ev?EV_COL[ev]:'#94a3b8',textTransform:'capitalize' }}>{ev}</div></button>))}</div>
              </Card>
            </div>

            {verify&&(
              <Card style={{ marginBottom:12 }}>
                <h2 style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>\u{1F6F0} Oracle \u2014 {verify.district}</h2>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:18 }} className="g4">{Object.entries(verify.oracle_data.sources).map(([key,s])=>(<div key={key} style={{ background:'#030712',border:'1px solid #1e293b',borderRadius:8,padding:'9px 10px' }}><div style={{ fontSize:9,color:'#64748b',fontWeight:600,marginBottom:2 }}>{ORC_ICO[key]||'\u{1F4E1}'} {key}</div><div style={{ fontSize:16,fontWeight:900,color:'#e2e8f0' }}>{s.value}</div><div style={{ fontSize:9,color:'#475569' }}>{s.unit}</div></div>))}</div>
                <h2 style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>\u{1F916} Agent Votes \u2014 click to expand deliberation</h2>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }} className="g2">{Object.entries(verify.agent_quorum.agents).map(([name,a],i)=><AgentBar key={name} name={name} a={a} delay={i*300} />)}</div>
                <div style={{ background:verify.agent_quorum.quorum_met?'#052e16':'#2d0a0a',border:`1px solid ${verify.agent_quorum.quorum_met?'#166534':'#7f1d1d'}`,borderRadius:10,padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
                  <div><div style={{ fontWeight:700,fontSize:13,color:'#e2e8f0' }}>Weighted Confidence: <span style={{ color:verify.agent_quorum.quorum_met?'#4ade80':'#f87171' }}>{verify.agent_quorum.weighted_confidence}%</span></div><div style={{ fontSize:10,color:'#64748b',marginTop:1 }}>{verify.agent_quorum.yes_count}/{verify.agent_quorum.total_agents} YES \u00B7 {verify.agent_quorum.quorum_rule}</div></div>
                  <div style={{ textAlign:'right' }}><Dot s={verify.contract_state} />{verify.payout_amount&&<div style={{ fontSize:13,fontWeight:700,color:'#4ade80',marginTop:2 }}>\u20B9{verify.payout_amount.toLocaleString()} queued</div>}</div>
                </div>
              </Card>
            )}
            <div style={{ display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap' }}>
              <button onClick={doVerify} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#1e3a8a,#1d4ed8)',color:loading?'#475569':'#dbeafe',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7,boxShadow:loading?'none':'0 4px 14px #1d4ed844' }}>{loading&&<Spin/>} {loading?(hindi?HI.loading:'Running\u2026'):'\u{1F6F0} Run Oracle + Agent Quorum'}</button>
              {verify&&<button onClick={()=>setStep('execute')} style={{ background:'linear-gradient(135deg,#92400e,#b45309)',color:'#fde68a',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>\u26A1 Execute \u2192</button>}
            </div>
          </div>
        )}

        {step==='execute'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'\u26A1 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0915\u0949\u0928\u094D\u091F\u094D\u0930\u0948\u0915\u094D\u091F':'\u26A1 Step 3 \u2014 Execute Smart Contract'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>FSM demo: ACTIVE \u2192 TRIGGERED \u2192 EXECUTED | FRAUD_REVIEW | REJECTED</p>
            {verify&&(
              <Card style={{ background:'#1c1400',border:'1px solid #854d0e',marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:'#fef3c7',fontFamily:'monospace' }}>{verify.policy_id}</div>
                    <div style={{ fontSize:11,color:'#94a3b8',marginTop:3 }}>Event: <Badge label={verify.event_type} color={EV_COL[verify.event_type]} /> \u00B7 <b style={{ color:'#e2e8f0' }}>{verify.agent_quorum.weighted_confidence}%</b></div>
                  </div>
                  <div style={{ textAlign:'right' }}><Dot s={verify.contract_state} />{verify.payout_amount&&<div style={{ fontSize:22,fontWeight:900,color:'#4ade80',marginTop:2 }}>\u20B9{verify.payout_amount.toLocaleString()}</div>}</div>
                </div>
              </Card>
            )}

            <FSMPath current={(execute?.current_state || execute?.success ? 'EXECUTED' : verify?.contract_state) as CState|undefined} previous={execute?.previous_state || 'TRIGGERED'} />

            {execute&&(
              <Card className="fi cel" style={{ background:(execute.current_state==='FRAUD_REVIEW')?'#1c0a00':(execute.current_state==='REJECTED')?'#2d0a0a':'#052e16',border:`1px solid ${(execute.current_state==='FRAUD_REVIEW')?'#9a3412':(execute.current_state==='REJECTED')?'#7f1d1d':'#166534'}`,marginTop:12,marginBottom:12,animation:execute.current_state==='FRAUD_REVIEW'?'fraudPulse 1.2s ease-in-out infinite':undefined }}>
                <div style={{ fontSize:14,fontWeight:800,color:STATE_COL[(execute.current_state||'EXECUTED') as CState],marginBottom:12 }}>
                  {execute.current_state==='FRAUD_REVIEW'?'\u{1F575} Claim diverted to FRAUD_REVIEW':execute.current_state==='REJECTED'?'\u274C Claim rejected by FSM path':'\u2705 Payout Executed On-Chain + IMPS Credited'}
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:12 }} className="g3">{([['Payout','\u20B9'+execute.payout_inr.toLocaleString(),'#4ade80'],['Method',execute.method,'#38bdf8'],['Farmer',execute.farmer,'#e2e8f0'],['UPI Ref',execute.upi_ref,'#a78bfa'],['RRN',execute.rrn,'#34d399'],['Block',String(execute.block_number),'#fbbf24']] as [string,string,string][]).map(([k,v,c])=>(<div key={k} style={{ background:'#030712',borderRadius:8,padding:'7px 9px',border:'1px solid #1e293b' }}><div style={{ fontSize:9,color:'#475569',marginBottom:1 }}>{k}</div><div style={{ fontSize:11,fontWeight:700,color:c,fontFamily:'monospace',wordBreak:'break-all' }}>{v}</div></div>))}</div>
                <div style={{ background:'#030712',border:'1px solid #1e293b',borderRadius:10,padding:'9px 12px' }}><div style={{ fontSize:9,color:'#475569',fontWeight:700,marginBottom:3,letterSpacing:'0.04em' }}>{hindi?HI.sms_label:'\u{1F4F1} SMS SENT TO FARMER'}</div><div style={{ fontSize:11,color:'#d1fae5',lineHeight:1.7,fontFamily:'monospace' }}>{execute.sms_sent}</div></div>
              </Card>
            )}
            <div style={{ display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap' }}>
              {!execute&&<button onClick={doExecute} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#065f46,#047857)',color:loading?'#475569':'#d1fae5',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:loading?'none':'0 4px 16px #065f4666' }}>{loading&&<Spin/>} {loading?(hindi?HI.loading:'Executing\u2026'):'\u26A1 Execute Contract Path'}</button>}
              {execute&&execute.current_state==='EXECUTED'&&<button onClick={()=>setShowModal(true)} style={{ background:'linear-gradient(135deg,#065f46,#059669)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 18px',fontSize:12,fontWeight:700 }}>\u{1F389} View Payout</button>}
              {execute&&<button onClick={doAudit} disabled={loading} style={{ background:'linear-gradient(135deg,#4c1d95,#6d28d9)',color:'#ede9fe',border:'none',borderRadius:10,padding:'11px 20px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7 }}>{loading&&<Spin/>}\u{1F517} Audit \u2192</button>}
            </div>
          </div>
        )}

        {step==='audit'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'\u{1F517} SHA-256 \u0911\u0921\u093F\u091F \u0936\u0943\u0902\u0916\u0932\u093E':'\u{1F517} Step 4 \u2014 Tamper-Evident Audit Chain'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>{hindi?'\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u092A\u094D\u0930\u0935\u093F\u0937\u094D\u091F\u093F \u092A\u093F\u091B\u0932\u0947 SHA-256 \u0939\u0948\u0936 \u0938\u0947 \u091C\u0941\u095C\u0940 \u2014 \u0905\u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928\u0940\u092F':'SHA-256 chained. Every entry links to predecessor \u2014 any mutation is instantly detectable.'}</p>
            {audit&&(<Card style={{ marginBottom:12 }}><div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8 }}><div><div style={{ fontSize:14,fontWeight:800,color:'#e2e8f0' }}>Audit Ledger</div><div style={{ fontSize:11,color:'#64748b' }}>{audit.total_entries} entries \u00B7 SHA-256</div></div><Badge label={audit.chain_valid?'\u2713 Chain Valid':'\u26A0 Chain Broken'} color={audit.chain_valid?'#4ade80':'#f87171'} /></div><div style={{ display:'flex',flexDirection:'column',gap:7 }}>{[...audit.ledger].reverse().map(entry=>(<div key={entry.seq} style={{ border:'1px solid #1e293b',borderRadius:10,padding:'9px 12px',background:entry.event.includes('EXECUTED')?'#052e16':entry.event.includes('TRIGGERED')?'#1c1400':'#0f172a' }}><div style={{ display:'flex',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap',gap:4 }}><div style={{ display:'flex',alignItems:'center',gap:6 }}><span style={{ fontWeight:700,color:'#475569',fontSize:10 }}>#{entry.seq}</span><Badge label={entry.event} color={entry.event.includes('EXECUTED')?'#4ade80':entry.event.includes('TRIGGERED')?'#fbbf24':'#34d399'} /><span style={{ fontSize:10,color:'#475569',fontFamily:'monospace' }}>{entry.policy_id}</span></div><span style={{ fontSize:9,color:'#475569' }}>{entry.ts.slice(0,19).replace('T',' ')} UTC</span></div><div style={{ display:'flex',gap:10,flexWrap:'wrap' }}><div><span style={{ fontSize:9,color:'#475569' }}>HASH </span><Chip h={entry.hash} /></div><div><span style={{ fontSize:9,color:'#475569' }}>PREV </span><Chip h={entry.prev_hash} /></div></div></div>))}</div></Card>)}
            {!audit&&(<div style={{ textAlign:'center',padding:40 }}><button onClick={doAudit} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#4c1d95,#6d28d9)',color:loading?'#475569':'#ede9fe',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8 }}>{loading&&<Spin/>}\u{1F517} Fetch Audit Chain</button></div>)}
            {audit&&<div style={{ display:'flex',justifyContent:'flex-end' }}><button onClick={doML} disabled={loading} style={{ background:'linear-gradient(135deg,#0c4a6e,#0369a1)',color:'#bae6fd',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7 }}>{loading&&<Spin/>}\u{1F916} ML Predictor \u2192</button></div>}
          </div>
        )}

        {step==='ml'&&(
          <div className="fi">
            <h1 style={{ fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9' }}>{hindi?'\u{1F916} GB v3.0 \u091C\u094B\u0916\u093F\u092E \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923':'\u{1F916} Step 5 \u2014 GB v3.0 Risk Analysis'}</h1>
            <p style={{ color:'#64748b',fontSize:12,marginBottom:16 }}>Prediction panel + training metrics + feature importance bars.</p>
            {ml&&(
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }} className="g2">
                <Card>
                  <div style={{ textAlign:'center',padding:'12px 0 8px' }}>
                    <div style={{ fontSize:52,fontWeight:900,color:RK_COL[ml.risk_level]??'#e2e8f0',lineHeight:1,animation:'celebrate 0.5s ease' }}>{ml.risk_score.toFixed(1)}</div>
                    <div style={{ fontSize:9,color:'#475569',marginBottom:5 }}>/ 100.0 risk score</div>
                    <Badge label={ml.risk_level} color={RK_COL[ml.risk_level]} />
                    <div style={{ marginTop:6,fontSize:11,fontWeight:700,color:ml.triggered?'#4ade80':'#64748b' }}>{ml.triggered?'\u2705 AUTO-PAYOUT TRIGGERED':'\u{1F7E1} Below trigger threshold'}</div>
                  </div>
                  <div style={{ marginTop:10 }}>{Object.entries(ml.log_likelihoods).map(([feat,v])=>{const pct=Math.max(0,Math.min(100,(v.llr+2)*25));const col=v.llr>2?'#f87171':v.llr>1?'#fb923c':v.llr>0?'#fbbf24':'#4ade80';return <div key={feat} style={{ marginBottom:8 }}><div style={{ display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:2 }}><span style={{ color:'#94a3b8' }}>{feat} <span style={{ color:'#475569',fontSize:9 }}>({v.weight})</span></span><span style={{ fontWeight:700,color:col }}>LLR={v.llr} \u00B7 {v.label}</span></div><div style={{ background:'#1e293b',borderRadius:4,height:6 }}><div style={{ width:`${pct}%`,background:col,height:6,borderRadius:4,transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} /></div></div>;})}<div style={{ fontSize:10,color:'#475569',marginTop:6,fontFamily:'monospace',background:'#030712',padding:'5px 8px',borderRadius:5 }}>\u03A3 LLR = {ml.total_llr} \u2192 score {ml.risk_score}</div></div>
                </Card>
                <Card>
                  <div style={{ fontSize:11,fontWeight:700,marginBottom:9,color:'#e2e8f0' }}>\u{1F6A9} Risk Flags</div>
                  {ml.flags.length===0?<div style={{ color:'#4ade80',fontSize:11 }}>\u2705 No risk flags</div>:<div style={{ display:'flex',flexDirection:'column',gap:5 }}>{ml.flags.map((f,i)=><div key={i} style={{ background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:7,padding:'6px 9px',fontSize:10,color:'#fca5a5' }}>{f}</div>)}</div>}
                  <div style={{ marginTop:12,padding:'8px 10px',background:'#030712',borderRadius:7,fontSize:9,color:'#64748b' }}><b style={{ color:'#94a3b8' }}>Model:</b> {ml.model}<br/><b style={{ marginTop:3,display:'block',color:ml.triggered?'#4ade80':'#64748b' }}>\u2192 {ml.recommendation}</b></div>
                </Card>
              </div>
            )}
            {train&&(<div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }} className="g2"><TrainPanel train={train} /><FeatureImportance train={train} /></div>)}
            {!ml&&(<div style={{ textAlign:'center',padding:40 }}><button onClick={doML} disabled={loading} style={{ background:loading?'#1e293b':'linear-gradient(135deg,#0c4a6e,#0369a1)',color:loading?'#475569':'#bae6fd',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8 }}>{loading&&<Spin/>}\u{1F916} Run ML Predictor</button></div>)}
            {(ml||train)&&(<div style={{ marginTop:16,display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap' }}><button onClick={reset} style={{ background:'linear-gradient(135deg,#065f46,#047857)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>\u{1F504} New Demo</button><a href="/impact" style={{ background:'linear-gradient(135deg,#92400e,#b45309)',color:'#fde68a',textDecoration:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>\u{1F4CA} Impact \u2192</a><a href="/dashboard" style={{ background:'linear-gradient(135deg,#0c4a6e,#0369a1)',color:'#bae6fd',textDecoration:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700 }}>\u{1F5FA} Dashboard \u2192</a></div>)}
          </div>
        )}
      </div>
    </div>
  );
}
