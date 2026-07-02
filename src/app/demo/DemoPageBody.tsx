'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import OfflineBoot from './OfflineBoot';

type Step = 'enroll'|'verify'|'execute'|'audit'|'ml';
type CState = 'ACTIVE'|'TRIGGERED'|'FRAUD_REVIEW'|'EXECUTED'|'REJECTED';
type ForceState = ''|'FRAUD_REVIEW'|'REJECTED';

interface Policy {
  policy_id:string; contract_address:string; net_premium_inr:number;
  subsidy_applied:number; coverage_inr:number; block_deployed:number;
  deploy_tx:string; message:string; upi_debit_ref:string; aadhaar_hash:string; kyc:Record<string,unknown>;
}
interface Agent { decision:string; confidence:number; weight:string; deliberation:string[]; }
type OracleSource = 'live_today'|'live_yesterday'|'cached_baseline'|'manual_override';
interface OracleVar { value:number; source:OracleSource; unit:string; }
interface VerifyResult {
  policy_id:string; district:string; event_type:string; contract_state:CState; payout_amount:number|null;
  oracle_inputs:Record<string,OracleVar>; weather_api_url:string|null; weather_api_error:string|null;
  agent_quorum:{agents:Record<string,Agent>;yes_count:number;total_agents:number;weighted_confidence:number;confidence_pct:number;quorum_met:boolean;quorum_rule:string;};
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
  version:string; algorithm:string;
  metrics:{accuracy:number;precision:number;recall:number;f1:number;auc:number;train_rows:number;val_rows:number;feature_count:number;};
  feature_importance:Array<{feature:string;importance:number}>;
  confusion_matrix?:{tp:number;fp:number;tn:number;fn:number};
}
type RawContrib    = {raw_contrib:number;pct_contrib:number;direction:string;importance:number};
type FeatImportRow = {feature:string;importance:number};

const CROPS     = ['paddy','cotton','wheat','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const PLANS     = ['Basic Protect','Smart Shield','Full Season Pro'];
const EVENTS    = ['drought','flood','heatwave','cyclone'];
const DISTRICTS = ['Barmer','Puri','Latur','Warangal','Nashik','Ludhiana','Jodhpur','Adilabad'];
const EV_COL:Record<string,string>  = {drought:'#f59e0b',flood:'#38bdf8',heatwave:'#f87171',cyclone:'#a78bfa'};
const EV_ICO:Record<string,string>  = {drought:'☀️',flood:'🌊',heatwave:'🔥',cyclone:'🌀'};
const RK_COL:Record<string,string>  = {CRITICAL:'#f87171',HIGH:'#fb923c',MEDIUM:'#fbbf24',LOW:'#4ade80'};
const ORC_ICO:Record<string,string> = {rainfall_mm:'🌧️',temp_c:'🌡️',ndvi:'🌱',soil_moisture:'💧'};
const STATE_COL:Record<CState,string> = {ACTIVE:'#34d399',TRIGGERED:'#fbbf24',FRAUD_REVIEW:'#f97316',EXECUTED:'#4ade80',REJECTED:'#f87171'};
const DIST_DEFAULTS:Record<string,{ndvi:number;temp_c:number;rainfall_mm:number;soil_moisture:number}> = {
  Barmer:{ndvi:0.21,temp_c:47.2,rainfall_mm:8,soil_moisture:12},
  Jodhpur:{ndvi:0.19,temp_c:48.1,rainfall_mm:6,soil_moisture:10},
  Puri:{ndvi:0.68,temp_c:34.1,rainfall_mm:218,soil_moisture:78},
  Latur:{ndvi:0.28,temp_c:46.8,rainfall_mm:22,soil_moisture:16},
  Warangal:{ndvi:0.31,temp_c:45.9,rainfall_mm:44,soil_moisture:22},
  Nashik:{ndvi:0.34,temp_c:44.2,rainfall_mm:38,soil_moisture:19},
  Ludhiana:{ndvi:0.52,temp_c:38.5,rainfall_mm:180,soil_moisture:55},
  Adilabad:{ndvi:0.29,temp_c:46.1,rainfall_mm:31,soil_moisture:18},
};
const SRC_COL:Record<OracleSource,string>   = {live_today:'#4ade80',live_yesterday:'#fbbf24',cached_baseline:'#94a3b8',manual_override:'#a78bfa'};
const SRC_LABEL:Record<OracleSource,string> = {live_today:'🛰️ live · today',live_yesterday:'🕐 live · yesterday',cached_baseline:'📦 baseline',manual_override:'✏️ manual'};
const HI:Record<string,string> = {
  enroll:'किसान नामांकन',oracle:'ओरेकल जाँच',execute:'भुगतान करें',audit:'ऑडिट शृंखला',ml:'जोखिम मॉडल',
  loading:'प्रसंस्करण…',payout_done:'✅ भुगतान हो गया!',sms_label:'📱 किसान को SMS',ramesh_btn:'रमेश के रूप में नामांकित करें',
};
const PAGE_CSS = [
  '@keyframes spin{to{transform:rotate(360deg)}}',
  '@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}',
  '@keyframes confettiFall{from{transform:translateY(-20px) rotate(0deg);opacity:1}to{transform:translateY(110vh) rotate(720deg);opacity:0}}',
  '@keyframes celebrate{0%{transform:scale(1)}40%{transform:scale(1.1)}100%{transform:scale(1)}}',
  '@keyframes burstRing{from{transform:scale(0.5);opacity:0.8}to{transform:scale(2.5);opacity:0}}',
  '@keyframes fraudPulse{0%,100%{box-shadow:0 0 12px #f9731644}50%{box-shadow:0 0 32px #f97316cc}}',
  '.fi{animation:fadeIn 0.35s ease}','.cel{animation:celebrate 0.5s ease}',
  '*{box-sizing:border-box}','button,a{cursor:pointer}',
  'input,select{outline:none;font-family:inherit}',
  'input:focus,select:focus{border-color:#34d399!important;box-shadow:0 0 0 3px #34d39922}',
  '::-webkit-scrollbar{width:4px;height:4px}','::-webkit-scrollbar-track{background:#0f172a}',
  '::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}',
  '@media(max-width:640px){.g2{grid-template-columns:1fr!important}.g4{grid-template-columns:1fr 1fr!important}.g3{grid-template-columns:1fr 1fr!important}}',
].join('\n');

function Spin(){return <span style={{display:'inline-block',width:14,height:14,border:'2px solid #ffffff33',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}} />;}
function Chip({h}:{h:string}){return <span style={{fontFamily:'monospace',fontSize:10,background:'#1e293b',border:'1px solid #334155',borderRadius:4,padding:'2px 6px',color:'#94a3b8',wordBreak:'break-all'}}>{h.slice(0,22)}…</span>;}
function Badge({label,color='#0f766e'}:{label:string;color?:string}){return <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:6,padding:'2px 9px',fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>{label}</span>;}
function Dot({s}:{s:CState}){
  const c=STATE_COL[s]??'#94a3b8';
  return(<span style={{display:'inline-flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 7px ${c}`,display:'inline-block',animation:s==='TRIGGERED'||s==='FRAUD_REVIEW'?'pulse 1s infinite':undefined}} /><b style={{color:c,fontSize:12}}>{s}</b></span>);
}
function Card({children,style,className}:{children:React.ReactNode;style?:React.CSSProperties;className?:string}){return <div className={className} style={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:14,padding:'18px 20px',...style}}>{children}</div>;}
function Label({children}:{children:React.ReactNode}){return <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{children}</div>;}

function AgentBar({name,a,delay}:{name:string;a:Agent;delay:number}){
  const [width,setWidth]=useState(0);
  const [open,setOpen]=useState(false);
  const yes=a.decision.includes('YES');
  useEffect(()=>{const t=setTimeout(()=>setWidth(a.confidence),delay);return()=>clearTimeout(t);},[a.confidence,delay]);
  const col=yes?'#4ade80':'#f87171';
  return(
    <div role="button" tabIndex={0} aria-expanded={open} onKeyDown={e=>{if(e.key==='Enter')setOpen(o=>!o);}} onClick={()=>setOpen(o=>!o)}
      style={{background:yes?'#052e16':'#2d0a0a',border:`1px solid ${yes?'#166534':'#7f1d1d'}`,borderRadius:10,padding:'12px 14px',cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700,color:col}}>{yes?'✅':'❌'} {name.replace(/_/g,' ')}</div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}><span style={{fontSize:10,color:'#64748b'}}>{a.weight}</span><span style={{fontWeight:800,fontSize:13,color:col}}>{a.confidence}%</span><span style={{fontSize:9,color:'#475569'}}>{open?'▲':'▼'}</span></div>
      </div>
      <div style={{background:'#1e293b',borderRadius:4,height:7,overflow:'hidden'}}><div style={{width:`${width}%`,background:`linear-gradient(90deg,${col}66,${col})`,height:7,borderRadius:4,transition:'width 1.1s cubic-bezier(0.4,0,0.2,1)'}} /></div>
      {open&&(<div style={{marginTop:10,borderTop:'1px solid #1e293b',paddingTop:10}}>
        <div style={{fontSize:10,fontWeight:700,color:'#475569',marginBottom:5,letterSpacing:'0.04em'}}>DELIBERATION LOG</div>
        {a.deliberation.map((line,i)=>(<div key={i} style={{fontSize:10,color:'#94a3b8',padding:'2px 0',borderBottom:i<a.deliberation.length-1?'1px dashed #1e293b':undefined,display:'flex',gap:6}}><span style={{color:'#475569',minWidth:14}}>{i+1}.</span><span>{line}</span></div>))}
      </div>)}
    </div>
  );
}

function FeatureImportance({train}:{train:TrainMetrics}){
  const top=train.feature_importance.slice(0,8);
  const max=Math.max(...top.map(f=>f.importance),1);
  const [animate,setAnimate]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnimate(true),150);return()=>clearTimeout(t);},[train.version]);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0'}}>📈 GB Feature Importance</div>
      <div style={{display:'flex',flexDirection:'column',gap:9}}>
        {top.map((f,i)=>{
          const pct=(f.importance/max)*100;
          const col=i===0?'#4ade80':i<3?'#38bdf8':'#a78bfa';
          return(<div key={f.feature}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:3}}><span style={{color:'#94a3b8',fontWeight:600}}>{f.feature}</span><span style={{color:col,fontWeight:800}}>{(f.importance*100).toFixed(1)}%</span></div>
            <div style={{background:'#1e293b',borderRadius:5,height:9,overflow:'hidden'}}><div style={{width:animate?`${pct}%`:0,height:9,borderRadius:5,background:`linear-gradient(90deg,${col}88,${col})`,transition:`width 0.9s ease ${i*0.08}s`}} /></div>
          </div>);
        })}
      </div>
    </Card>
  );
}

function TrainPanel({train}:{train:TrainMetrics}){
  const m=train.metrics;
  return(
    <Card>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:6}}>
        <div style={{fontSize:12,fontWeight:700,color:'#e2e8f0'}}>🧠 ML Training Metrics</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><Badge label={train.algorithm} color='#38bdf8'/><Badge label={train.version} color='#a78bfa'/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}} className="g4">
        {(['Accuracy','Precision','Recall','AUC','Train Rows','Val Rows','Features','F1'] as const).map((k,i)=>{
          const vals=[`${(m.accuracy*100).toFixed(1)}%`,`${(m.precision*100).toFixed(1)}%`,`${(m.recall*100).toFixed(1)}%`,`${(m.auc*100).toFixed(1)}%`,String(m.train_rows),String(m.val_rows),String(m.feature_count),`${(m.f1*100).toFixed(1)}%`];
          const cols=['#4ade80','#38bdf8','#fbbf24','#a78bfa','#94a3b8','#94a3b8','#94a3b8','#f87171'];
          return(<div key={k} style={{background:'#030712',border:'1px solid #1e293b',borderRadius:8,padding:'8px 9px'}}><div style={{fontSize:9,color:'#475569',marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:800,color:cols[i]}}>{vals[i]}</div></div>);
        })}
      </div>
      {train.confusion_matrix&&(
        <div style={{marginTop:10,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}} className="g4">
          {(['TP','FP','TN','FN'] as const).map((k)=>{
            const v=train.confusion_matrix![k.toLowerCase() as 'tp'|'fp'|'tn'|'fn'];
            const c={TP:'#4ade80',FP:'#fbbf24',TN:'#38bdf8',FN:'#f87171'}[k];
            return(<div key={k} style={{background:'#0b1220',border:'1px solid #1e293b',borderRadius:8,padding:'8px 9px'}}><div style={{fontSize:9,color:'#475569',marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div></div>);
          })}
        </div>
      )}
    </Card>
  );
}

function FSMPath({current,previous}:{current?:CState;previous?:CState}){
  const states:CState[]=['ACTIVE','TRIGGERED','FRAUD_REVIEW','EXECUTED','REJECTED'];
  const ico:Record<CState,string>={ACTIVE:'🟢',TRIGGERED:'⚡',FRAUD_REVIEW:'🕵️',EXECUTED:'✅',REJECTED:'❌'};
  return(
    <Card style={{background:'#0d1117',border:'1px solid #1e293b'}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0'}}>🔗 6-State FSM Path</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
        {states.map(s=>{
          const active=s===current;
          const passed=previous===s||(s==='ACTIVE'&&current&&current!=='ACTIVE')||(s==='TRIGGERED'&&['EXECUTED','FRAUD_REVIEW','REJECTED'].includes(current||''));
          const col=STATE_COL[s];
          return(<div key={s} style={{flex:'1 1 90px',minWidth:90,background:active?`${col}18`:'#030712',border:`${active?2:1}px solid ${active?col:passed?`${col}66`:'#1e293b'}`,borderRadius:10,padding:'10px 8px',textAlign:'center',boxShadow:active?`0 0 18px ${col}44`:undefined,animation:s==='FRAUD_REVIEW'&&active?'fraudPulse 1.2s ease-in-out infinite':undefined}}>
            <div style={{fontSize:18}}>{ico[s]}</div>
            <div style={{fontSize:10,fontWeight:800,color:active?col:passed?col:'#475569'}}>{s}</div>
          </div>);
        })}
      </div>
      {current&&(<div style={{fontSize:11,color:'#94a3b8',background:'#030712',border:'1px solid #1e293b',borderRadius:8,padding:'8px 10px'}}>Transition: <b style={{color:previous?STATE_COL[previous]:'#94a3b8'}}>{previous??'ACTIVE'}</b> → <b style={{color:STATE_COL[current]}}>{current}</b></div>)}
    </Card>
  );
}

interface Particle{id:number;x:number;color:string;delay:number;size:number;rot:number;}
function ClaimModal({exec,onClose,hindi}:{exec:ExecuteResult;onClose:()=>void;hindi:boolean}){
  const particles:Particle[]=Array.from({length:40},(_,i)=>({id:i,x:Math.random()*100,color:['#4ade80','#34d399','#fbbf24','#38bdf8','#a78bfa','#f472b6'][i%6],delay:Math.random()*1.2,size:5+Math.random()*9,rot:Math.random()*360}));
  return(
    <div role="dialog" aria-modal="true" aria-label="Payout confirmed" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}} onClick={onClose}>
      <div style={{background:'#0d1117',border:'2px solid #166534',borderRadius:24,padding:'36px 32px',maxWidth:460,width:'100%',textAlign:'center',position:'relative',overflow:'hidden',boxShadow:'0 0 60px #4ade8044'}} onClick={e=>e.stopPropagation()}>
        {particles.map(p=>(<div key={p.id} style={{position:'absolute',left:`${p.x}%`,top:-16,width:p.size,height:p.size,background:p.color,borderRadius:3,transform:`rotate(${p.rot}deg)`,animation:`confettiFall 2.2s ease-in ${p.delay}s both`}} />))}
        <div style={{position:'relative',display:'inline-block',marginBottom:8}}>
          <div style={{position:'absolute',inset:-20,borderRadius:'50%',border:'4px solid #4ade80',animation:'burstRing 0.7s ease-out both',opacity:0}} />
          <div style={{fontSize:56,lineHeight:1}}>🎉</div>
        </div>
        <div style={{fontSize:20,fontWeight:900,color:'#4ade80',marginBottom:4}}>{hindi?'भुगतान हो गया!':'Claim Triggered!'}</div>
        <div style={{fontSize:38,fontWeight:900,color:'#34d399',marginBottom:6,animation:'celebrate 0.6s ease'}}>₹{exec.payout_inr.toLocaleString()}</div>
        <div style={{fontSize:13,color:'#64748b',marginBottom:18}}>{hindi?`${exec.farmer} के खाते में IMPS द्वारा`:`Credited to ${exec.farmer} via IMPS`}</div>
        <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'12px 14px',marginBottom:14,textAlign:'left'}}>
          <div style={{fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:5,letterSpacing:'0.04em'}}>{hindi?HI.sms_label:'📱 SMS SENT TO FARMER'}</div>
          <div style={{fontSize:11,color:'#d1fae5',lineHeight:1.7,fontFamily:'monospace'}}>{exec.sms_sent}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {(['UPI Ref','RRN','Block','Method'] as const).map((k)=>{
            const v=k==='UPI Ref'?exec.upi_ref:k==='RRN'?exec.rrn:k==='Block'?String(exec.block_number):exec.method;
            const c=k==='UPI Ref'?'#a78bfa':k==='RRN'?'#38bdf8':k==='Block'?'#fbbf24':'#4ade80';
            return(<div key={k} style={{background:'#0f172a',borderRadius:8,padding:'8px 10px',border:'1px solid #1e293b'}}><div style={{fontSize:9,color:'#475569',marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</div></div>);
          })}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:11,background:'#1c1400',border:'1px solid #854d0e',borderRadius:10,padding:'10px',marginBottom:18}}>
          <div><span style={{color:'#78716c'}}>{hindi?'परंपरागत:':'Traditional:'}</span> <b style={{color:'#f87171'}}>180 {hindi?'दिन':'days'}</b></div>
          <div><span style={{color:'#78716c'}}>IIE:</span> <b style={{color:'#4ade80'}}>2.3 sec</b></div>
          <div><span style={{color:'#78716c'}}>{hindi?'फ़ॉर्म:':'Forms:'}</span> <b style={{color:'#4ade80'}}>{hindi?'शून्य':'Zero'}</b></div>
          <div><span style={{color:'#78716c'}}>{hindi?'धोखाधड़ी:':'Fraud:'}</span> <b style={{color:'#4ade80'}}>{hindi?'असंभव':'Impossible'}</b></div>
        </div>
        <button onClick={onClose} style={{background:'linear-gradient(135deg,#065f46,#047857)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 28px',fontSize:13,fontWeight:700,cursor:'pointer'}}>{hindi?'बंद करें':'Close'}</button>
      </div>
    </div>
  );
}

export default function DemoPage(){
  const [step,setStep]             = useState<Step>('enroll');
  const [loading,setLoading]       = useState(false);
  const [error,setError]           = useState('');
  const [elapsed,setElapsed]       = useState(0);
  const [hindi,setHindi]           = useState(false);
  const [showModal,setShowModal]   = useState(false);
  const [forceState,setForceState] = useState<ForceState>('');
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const [form,setForm] = useState({name:'Ramesh Kumar',aadhaar_last4:'4821',district:'Barmer',state:'Rajasthan',crop:'wheat',acreage:'4.5',plan:'Smart Shield',event_type:'drought'});
  const [policy,setPolicy]   = useState<Policy|null>(null);
  const [verify,setVerify]   = useState<VerifyResult|null>(null);
  const [execute,setExecute] = useState<ExecuteResult|null>(null);
  const [audit,setAudit]     = useState<{chain_valid:boolean;total_entries:number;ledger:AuditEntry[]}|null>(null);
  const [ml,setMl]           = useState<MLResult|null>(null);
  const [train,setTrain]     = useState<TrainMetrics|null>(null);
  const [health,setHealth]   = useState<{status:string;version:string}|null>(null);

  const ping=useCallback(async()=>{try{const r=await fetch('/api/health');setHealth(await r.json());}catch{setHealth(null);}},[]);
  useEffect(()=>{ping();},[ping]);
  useEffect(()=>{if((step==='verify'||step==='execute')&&!policy)setStep('enroll');},[step,policy]);
  useEffect(()=>{if(step==='execute'&&!verify)setStep('verify');},[step,verify]);

  const startTimer=()=>{setElapsed(0);timerRef.current=setInterval(()=>setElapsed(e=>e+1),100);};
  const stopTimer =()=>{if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;}};
  const post=async(url:string,body:object)=>{
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json(); if(!r.ok)throw new Error(d.error||'API error'); return d;
  };

  const doRamesh=useCallback(async()=>{
    const f={name:'Ramesh Kumar',aadhaar_last4:'4821',district:'Barmer',state:'Rajasthan',crop:'wheat',acreage:'4.5',plan:'Smart Shield',event_type:'drought'};
    setForm(f);setPolicy(null);setVerify(null);setExecute(null);setAudit(null);setMl(null);setTrain(null);setError('');setStep('enroll');
    setLoading(true);startTimer();
    try{
      const p=await post('/api/oracle/enroll',{...f,acreage:4.5});setPolicy(p);setStep('verify');
      const v=await post('/api/oracle/verify',{policy_id:p.policy_id,event_type:'drought',district:'Barmer',crop:'wheat',acreage:4.5});setVerify(v);setStep('execute');
      const x=await post('/api/contract/execute',{policy_id:p.policy_id,farmer_name:'Ramesh Kumar',payout_amount:v.payout_amount,...(forceState?{force_state:forceState}:{})});setExecute(x);setStep('audit');
      if((x.current_state??'EXECUTED')==='EXECUTED')setShowModal(true);
      ping();
    }catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[forceState,ping]);

  const doEnroll=async()=>{
    setLoading(true);setError('');startTimer();
    try{const d=await post('/api/oracle/enroll',{...form,acreage:parseFloat(form.acreage)});setPolicy(d);setStep('verify');ping();}catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  };
  const doVerify=async()=>{
    if(!policy)return;setLoading(true);setError('');startTimer();
    try{const d=await post('/api/oracle/verify',{policy_id:policy.policy_id,event_type:form.event_type,district:form.district,crop:form.crop,acreage:parseFloat(form.acreage)});setVerify(d);setStep('execute');}catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  };
  const doExecute=async()=>{
    if(!policy)return;setLoading(true);setError('');startTimer();
    try{
      const d=await post('/api/contract/execute',{policy_id:policy.policy_id,farmer_name:form.name,payout_amount:verify?.payout_amount,...(forceState?{force_state:forceState}:{})});setExecute(d);setStep('audit');
      if((d.current_state??'EXECUTED')==='EXECUTED')setShowModal(true);ping();
    }catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  };
  const doAudit=async()=>{
    setLoading(true);setError('');startTimer();
    try{const r=await fetch('/api/audit/trail');setAudit(await r.json());setStep('ml');}catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  };
  const doML=async()=>{
    setLoading(true);setError('');startTimer();
    try{
      const oi=verify?.oracle_inputs;
      const defaults=DIST_DEFAULTS[form.district]??DIST_DEFAULTS['Barmer'];
      const pred=await post('/api/ml/predict',{
        district:form.district,event_type:form.event_type,
        ndvi:oi?.ndvi?.value??defaults.ndvi,temp_c:oi?.temp_c?.value??defaults.temp_c,
        rainfall_mm:oi?.rainfall_mm?.value??defaults.rainfall_mm,soil_moisture_pct:oi?.soil_moisture?.value??defaults.soil_moisture,
      });
      const contributions=(pred.contributions??{}) as Record<string,RawContrib>;
      const log_likelihoods:Record<string,{llr:number;weight:string;label:string}>= {};
      for(const [feat,c] of Object.entries(contributions)){
        log_likelihoods[feat]={llr:+(c as RawContrib).raw_contrib.toFixed(3),weight:`${((c as RawContrib).importance*100).toFixed(1)}%`,label:(c as RawContrib).direction??((c as RawContrib).raw_contrib>0?'risk↑':'risk↓')};
      }
      const modelObj=pred.model??{};
      setMl({risk_score:pred.risk_score,risk_level:pred.risk_level,triggered:pred.triggered,confidence_pct:+((pred.probability??pred.risk_score/100)*100).toFixed(1),log_likelihoods,total_llr:+(pred.logit??0).toFixed(3),flags:pred.flags??[],model:modelObj.name?`${modelObj.name} v${modelObj.version} · AUC ${modelObj.roc_auc} · F1 ${modelObj.f1_score}`:String(modelObj),recommendation:pred.recommendation??''});
      const tdRaw=await fetch('/api/ml/train').then(r=>r.json()).catch(()=>null);
      if(tdRaw){
        const gb=tdRaw.final_metrics?.GradientBoosting??{};const ds=tdRaw.dataset??{};const cm=tdRaw.confusion_matrix??null;
        setTrain({version:tdRaw.config?.best_round?`v3.0 (round ${tdRaw.config.best_round})`:'v3.0.0',algorithm:tdRaw.model??'GradientBoostingClassifier',
          metrics:{accuracy:gb.accuracy??0,precision:gb.precision??0,recall:gb.recall??0,f1:gb.f1_score??0,auc:gb.roc_auc??0,train_rows:ds.train_samples??0,val_rows:ds.test_samples??0,feature_count:tdRaw.config?.n_features??6},
          feature_importance:(tdRaw.feature_importances??[] as FeatImportRow[]).map((f:FeatImportRow)=>({feature:f.feature,importance:f.importance})),
          confusion_matrix:cm?{tp:cm.tp,fp:cm.fp,tn:cm.tn,fn:cm.fn}:undefined});
      }
    }catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  };
  const reset=()=>{
    setStep('enroll');setPolicy(null);setVerify(null);setExecute(null);setAudit(null);setMl(null);setTrain(null);setError('');stopTimer();setForceState('');
    setForm(f=>({...f,name:'Farmer '+Math.floor(Math.random()*9000+1000),aadhaar_last4:String(Math.floor(Math.random()*9000+1000)),district:DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)],crop:CROPS[Math.floor(Math.random()*CROPS.length)]}));
  };

  const STEPS=[{id:'enroll' as Step,icon:'📋',label:hindi?HI.enroll:'1. Enroll'},{id:'verify' as Step,icon:'🛰️',label:hindi?'2. '+HI.oracle:'2. Oracle'},{id:'execute' as Step,icon:'⚡',label:hindi?'3. '+HI.execute:'3. Execute'},{id:'audit' as Step,icon:'🔗',label:hindi?'4. '+HI.audit:'4. Audit'},{id:'ml' as Step,icon:'🤖',label:hindi?'5. '+HI.ml:'5. ML'}];
  const ORDER:Step[]=['enroll','verify','execute','audit','ml'];
  const done=(id:Step)=>ORDER.indexOf(id)<ORDER.indexOf(step);
  const inp=(extra?:React.CSSProperties):React.CSSProperties=>({width:'100%',border:'1px solid #1e293b',borderRadius:8,padding:'8px 11px',fontSize:13,background:'#030712',color:'#e2e8f0',transition:'border-color 0.2s',...extra});
  const fsmCurrent:CState|undefined=execute?.current_state??(execute?.success?'EXECUTED':verify?.contract_state??undefined);

  return(
    <div style={{minHeight:'100vh',background:'#030712',fontFamily:"'Inter',system-ui,sans-serif",color:'#e2e8f0'}}>
      <style>{PAGE_CSS}</style>
      <Suspense fallback={null}><OfflineBoot onOffline={doRamesh} /></Suspense>
      {showModal&&execute&&<ClaimModal exec={execute} onClose={()=>setShowModal(false)} hindi={hindi} />}

      {/* Nav */}
      <div style={{background:'#0d1117',borderBottom:'1px solid #1e293b',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',overflowX:'auto',scrollbarWidth:'none'}}>
          {STEPS.map((s,i)=>{
            const active=step===s.id; const d=done(s.id);
            return(<div key={s.id} style={{display:'flex',alignItems:'center'}}>
              <button onClick={()=>d?setStep(s.id):undefined} disabled={!d&&!active} aria-current={active?'step':undefined}
                style={{display:'flex',alignItems:'center',gap:5,padding:'13px 14px',whiteSpace:'nowrap',background:'transparent',border:'none',borderBottom:active?'2px solid #34d399':d?'2px solid #4ade80':'2px solid transparent',color:active?'#34d399':d?'#4ade80':'#475569',cursor:d?'pointer':active?'default':'not-allowed',fontSize:12,fontWeight:active?700:500,fontFamily:'inherit'}}>
                <span style={{fontSize:13}}>{d?'✅':s.icon}</span>{s.label}
              </button>
              {i<STEPS.length-1&&<span style={{color:'#1e293b',fontSize:12}}>›</span>}
            </div>);
          })}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',flexShrink:0}}>
          {health&&<span style={{fontSize:10,color:'#4ade80',fontWeight:700}}>🟢 {health.version}</span>}
          {loading&&<span style={{fontSize:10,color:'#34d399',fontFamily:'monospace'}}>⏱ {(elapsed/10).toFixed(1)}s</span>}
          <button onClick={()=>setHindi(h=>!h)} aria-label="Toggle Hindi" style={{background:hindi?'#065f46':'#1e293b',color:hindi?'#d1fae5':'#94a3b8',border:'1px solid #334155',borderRadius:7,padding:'5px 9px',fontSize:11,fontWeight:700}}>{hindi?'EN':'हि'}</button>
          <button onClick={reset} style={{background:'#0f766e',color:'#fff',border:'none',borderRadius:7,padding:'5px 13px',fontSize:11,fontWeight:700}}>+ New</button>
        </div>
      </div>

      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#064e3b,#0c4a6e)',borderBottom:'1px solid #065f46',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{color:'#d1fae5',fontWeight:800,fontSize:14}}>{hindi?'⚡ एक क्लिक डेमो — रमेश कुमार, बाड़मेर':'⚡ One-click Demo — Enroll Ramesh Kumar in Barmer'}</div>
          <div style={{color:'#6ee7b7',fontSize:11,marginTop:2}}>{hindi?'नामांकन → ओरेकल → FSM पथ → ML पैनल':'Enroll → Oracle quorum → FSM path → ML metrics in one shot.'}</div>
        </div>
        <button onClick={doRamesh} disabled={loading} aria-label="One-click enroll Ramesh Kumar"
          style={{background:loading?'#374151':'#ecfdf5',color:loading?'#9ca3af':'#065f46',border:'none',borderRadius:10,padding:'10px 22px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px #00000066',flexShrink:0,transition:'all 0.2s'}}>
          {loading?<><Spin/> {hindi?HI.loading:'Running…'}</>:<>🚀 {hindi?HI.ramesh_btn:'Enroll as Ramesh in Barmer'}</>}
        </button>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'20px 14px'}}>
        {error&&<div className="fi" role="alert" style={{background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:10,padding:'10px 14px',color:'#fca5a5',marginBottom:14,fontSize:12}}>⚠️ {error}</div>}

        {/* Step 1 Enroll */}
        {step==='enroll'&&(
          <div className="fi">
            <h1 style={{fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9'}}>{hindi?'📋 '+HI.enroll:'📋 Step 1 — Enroll Farmer'}</h1>
            <p style={{color:'#64748b',fontSize:12,marginBottom:16}}>{hindi?'आधार eKYC · DigiLocker RoR · PM-FASAL सब्सिडी · ऑन-चेन कॉन्ट्रैक्ट':'Aadhaar eKYC OTP · DigiLocker RoR pull · PM-FASAL subsidy · On-chain contract deploy.'}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}} className="g2">
              <Card>
                <h2 style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#e2e8f0'}}>{hindi?'किसान विवरण':'Farmer Details'}</h2>
                {([['name',hindi?'किसान का नाम':'Farmer Name','text'],['aadhaar_last4',hindi?'आधार के अंतिम 4':'Aadhaar Last 4','text'],['district',hindi?'जिला':'District','text'],['state',hindi?'राज्य':'State','text'],['acreage',hindi?'एकड़':'Acreage (acres)','number']] as [keyof typeof form,string,string][]).map(([k,l,t])=>(
                  <div key={k} style={{marginBottom:10}}><Label>{l}</Label><input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} type={t} style={inp()} /></div>
                ))}
              </Card>
              <Card>
                <h2 style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#e2e8f0'}}>{hindi?'फसल और योजना':'Crop & Plan'}</h2>
                <div style={{marginBottom:10}}><Label>{hindi?'फसल':'Crop'}</Label><select value={form.crop} onChange={e=>setForm(f=>({...f,crop:e.target.value}))} style={inp()}>{CROPS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div style={{marginBottom:10}}><Label>{hindi?'बीमा योजना':'Insurance Plan'}</Label><select value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value}))} style={inp()}>{PLANS.map(p=><option key={p}>{p}</option>)}</select></div>
                <div style={{marginBottom:14}}>
                  <Label>Demo State Path</Label>
                  <select value={forceState} onChange={e=>setForceState(e.target.value as ForceState)} style={inp()}>
                    <option value=''>Normal EXECUTED path</option>
                    <option value='FRAUD_REVIEW'>Force FRAUD_REVIEW</option>
                    <option value='REJECTED'>Force REJECTED</option>
                  </select>
                </div>
                <div style={{background:forceState==='FRAUD_REVIEW'?'#1c0a00':forceState==='REJECTED'?'#2d0a0a':'#052e16',border:`1px solid ${forceState==='FRAUD_REVIEW'?'#9a3412':forceState==='REJECTED'?'#7f1d1d':'#166634'}`,borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:10,color:forceState==='FRAUD_REVIEW'?'#f97316':forceState==='REJECTED'?'#f87171':'#4ade80',fontWeight:700,marginBottom:5,letterSpacing:'0.04em'}}>📊 DEMO MODE</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>{forceState==='FRAUD_REVIEW'?'Shows orange review path before final settlement.':forceState==='REJECTED'?'Shows failed transition and claim rejection path.':'Shows standard TRIGGERED → EXECUTED payout flow.'}</div>
                </div>
              </Card>
            </div>
            <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}>
              <button onClick={doEnroll} disabled={loading} style={{background:loading?'#1e293b':'linear-gradient(135deg,#065f46,#047857)',color:loading?'#475569':'#d1