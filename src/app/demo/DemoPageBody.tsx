'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import OfflineBoot from './OfflineBoot';
import {
  CROPS, PLANS, EVENTS, DISTRICTS, EV_COL, EV_ICO, ORC_ICO, STATE_COL,
  DIST_DEFAULTS, SRC_COL, SRC_LABEL, HI, PAGE_CSS,
  type Step, type CState, type ForceState, type OracleSource,
  type Policy, type VerifyResult, type ExecuteResult, type AuditEntry,
  type MLResult, type TrainMetrics, type RawContrib, type FeatImportRow,
} from './DemoTypes';
import {
  Spin, Chip, Badge, Dot, Card, Label,
  AgentBar, FeatureImportance, TrainPanel, FSMPath, ClaimModal,
} from './DemoWidgets';

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
        rainfall_mm:oi?.rainfall_mm?.value??defaults.rainfall_mm,
        soil_moisture_pct:oi?.soil_moisture?.value??defaults.soil_moisture,
      });
      const contributions=(pred.contributions??{}) as Record<string,RawContrib>;
      const log_likelihoods:Record<string,{llr:number;weight:string;label:string}>= {};
      for(const [feat,c] of Object.entries(contributions)){
        log_likelihoods[feat]={llr:+(c as RawContrib).raw_contrib.toFixed(3),weight:`${((c as RawContrib).importance*100).toFixed(1)}%`,label:(c as RawContrib).direction??((c as RawContrib).raw_contrib>0?'risk↑':'risk↓')};
      }
      const modelObj=pred.model??{};
      setMl({risk_score:pred.risk_score,risk_level:pred.risk_level,triggered:pred.triggered,
        confidence_pct:+((pred.probability??pred.risk_score/100)*100).toFixed(1),
        log_likelihoods,total_llr:+(pred.logit??0).toFixed(3),flags:pred.flags??[],
        model:modelObj.name?`${modelObj.name} v${modelObj.version} · AUC ${modelObj.roc_auc} · F1 ${modelObj.f1_score}`:String(modelObj),
        recommendation:pred.recommendation??''});
      const tdRaw=await fetch('/api/ml/train').then(r=>r.json()).catch(()=>null);
      if(tdRaw){
        const gb=tdRaw.final_metrics?.GradientBoosting??{};const ds=tdRaw.dataset??{};const cm=tdRaw.confusion_matrix??null;
        setTrain({version:tdRaw.config?.best_round?`v3.0 (round ${tdRaw.config.best_round})`:'v3.0.0',
          algorithm:tdRaw.model??'GradientBoostingClassifier',
          metrics:{accuracy:gb.accuracy??0,precision:gb.precision??0,recall:gb.recall??0,f1:gb.f1_score??0,auc:gb.roc_auc??0,train_rows:ds.train_samples??0,val_rows:ds.test_samples??0,feature_count:tdRaw.config?.n_features??6},
          feature_importance:(tdRaw.feature_importances??[] as FeatImportRow[]).map((f:FeatImportRow)=>({feature:f.feature,importance:f.importance})),
          confusion_matrix:cm?{tp:cm.tp,fp:cm.fp,tn:cm.tn,fn:cm.fn}:undefined});
      }
    }catch(e:unknown){setError(e instanceof Error?e.message:'Error');}
    stopTimer();setLoading(false);
  };

  const reset=()=>{
    setStep('enroll');setPolicy(null);setVerify(null);setExecute(null);setAudit(null);
    setMl(null);setTrain(null);setError('');stopTimer();setForceState('');
    setForm(f=>({...f,
      name:'Farmer '+Math.floor(Math.random()*9000+1000),
      aadhaar_last4:String(Math.floor(Math.random()*9000+1000)),
      district:DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)],
      crop:CROPS[Math.floor(Math.random()*CROPS.length)],
    }));
  };

  const STEPS=[{id:'enroll' as Step,icon:'📋',label:hindi?HI.enroll:'1. Enroll'},{id:'verify' as Step,icon:'🛰️',label:hindi?'2. '+HI.oracle:'2. Oracle'},{id:'execute' as Step,icon:'⚡',label:hindi?'3. '+HI.execute:'3. Execute'},{id:'audit' as Step,icon:'🔗',label:hindi?'4. '+HI.audit:'4. Audit'},{id:'ml' as Step,icon:'🤖',label:hindi?'5. '+HI.ml:'5. ML'}];
  const ORDER:Step[]=['enroll','verify','execute','audit','ml'];
  const done=(id:Step)=>ORDER.indexOf(id)<ORDER.indexOf(step);
  const inp=(extra?:React.CSSProperties):React.CSSProperties=>({width:'100%',border:'1px solid #1e293b',borderRadius:8,padding:'8px 11px',fontSize:13,background:'#030712',color:'#e2e8f0',transition:'border-color 0.2s',...extra});
  const fsmCurrent:CState|undefined=execute?.current_state??(execute?.success?'EXECUTED':verify?.contract_state??undefined);
  const btnPrimary=(loading:boolean):React.CSSProperties=>({background:loading?'#1e293b':'linear-gradient(135deg,#065f46,#047857)',color:loading?'#475569':'#d1fae5',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:loading?'none':'0 4px 16px #065f4666'});

  return(
    <div style={{minHeight:'100vh',background:'#030712',fontFamily:"'Inter',system-ui,sans-serif",color:'#e2e8f0'}}>
      <style>{PAGE_CSS}</style>
      <Suspense fallback={null}><OfflineBoot onOffline={doRamesh} /></Suspense>
      {showModal&&execute&&<ClaimModal exec={execute} onClose={()=>setShowModal(false)} hindi={hindi} />}

      {/* Nav */}
      <div style={{background:'#0d1117',borderBottom:'1px solid #1e293b',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',overflowX:'auto',scrollbarWidth:'none'}}>
          {STEPS.map((s,i)=>{
            const active=step===s.id;const d=done(s.id);
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
          <button onClick={()=>setHindi(h=>!h)} style={{background:hindi?'#065f46':'#1e293b',color:hindi?'#d1fae5':'#94a3b8',border:'1px solid #334155',borderRadius:7,padding:'5px 9px',fontSize:11,fontWeight:700}}>{hindi?'EN':'हि'}</button>
          <button onClick={reset} style={{background:'#0f766e',color:'#fff',border:'none',borderRadius:7,padding:'5px 13px',fontSize:11,fontWeight:700}}>+ New</button>
        </div>
      </div>

      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#064e3b,#0c4a6e)',borderBottom:'1px solid #065f46',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{color:'#d1fae5',fontWeight:800,fontSize:14}}>{hindi?'⚡ एक क्लिक डेमो — रमेश कुमार, बाड़मेर':'⚡ One-click Demo — Enroll Ramesh Kumar in Barmer'}</div>
          <div style={{color:'#6ee7b7',fontSize:11,marginTop:2}}>{hindi?'नामांकन → ओरेकल → FSM पथ → ML पैनल':'Enroll → Oracle quorum → FSM path → ML metrics in one shot.'}</div>
        </div>
        <button onClick={doRamesh} disabled={loading}
          style={{background:loading?'#374151':'#ecfdf5',color:loading?'#9ca3af':'#065f46',border:'none',borderRadius:10,padding:'10px 22px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px #00000066',flexShrink:0}}>
          {loading?<><Spin/> {hindi?HI.loading:'Running…'}</>:<>🚀 {hindi?HI.ramesh_btn:'Enroll as Ramesh in Barmer'}</>}
        </button>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'20px 14px'}}>
        {error&&<div className="fi" role="alert" style={{background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:10,padding:'10px 14px',color:'#fca5a5',marginBottom:14,fontSize:12}}>⚠️ {error}</div>}

        {/* STEP 1 */}
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
                  <div style={{fontSize:10,color:forceState==='FRAUD_REVIEW'?'#f97316':forceState==='REJECTED'?'#f87171':'#4ade80',fontWeight:700,marginBottom:5}}>📊 DEMO MODE</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>{forceState==='FRAUD_REVIEW'?'Shows orange review path before final settlement.':forceState==='REJECTED'?'Shows failed transition and claim rejection path.':'Shows standard TRIGGERED → EXECUTED payout flow.'}</div>
                </div>
              </Card>
            </div>
            <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}>
              <button onClick={doEnroll} disabled={loading} style={btnPrimary(loading)}>
                {loading&&<Spin/>} {loading?(hindi?HI.loading:'Enrolling…'):(hindi?'🚀 पोलिसी जारी करें':'🚀 Issue Policy & Deploy Contract')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step==='verify'&&policy&&(
          <div className="fi">
            <h1 style={{fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9'}}>{hindi?'🛰️ ओरेकल + AI कोरम':'🛰️ Step 2 — Oracle + AI Quorum'}</h1>
            <p style={{color:'#64748b',fontSize:12,marginBottom:16}}>{hindi?'4 स्रोत · 4 विशेषज्ञ एजेंट · ≥75% भार विश्वास':'4 independent sources · 4 specialist agents · ≥75% weighted confidence required.'}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}} className="g2">
              <Card style={{background:'#052e16',border:'1px solid #166534'}}>
                <div style={{fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:7}}>✅ POLICY ISSUED</div>
                <div style={{fontSize:17,fontWeight:900,fontFamily:'monospace',marginBottom:8,color:'#d1fae5'}}>{policy.policy_id}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:7}}>
                  {[['Coverage','₹'+policy.coverage_inr.toLocaleString()],['Net Premium','₹'+policy.net_premium_inr.toLocaleString()],['PM-FASAL','₹'+policy.subsidy_applied.toLocaleString()],['Block',String(policy.block_deployed)]].map(([k,v])=>(
                    <div key={k}><div style={{fontSize:9,color:'#64748b'}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:'#e2e8f0'}}>{v}</div></div>
                  ))}
                </div>
                <div style={{fontSize:9,color:'#64748b'}}>Contract: <Chip h={policy.contract_address} /></div>
              </Card>
              <Card>
                <h2 style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0'}}>{hindi?'घटना का प्रकार':'Event Type'}</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {EVENTS.map(ev=>(
                    <button key={ev} onClick={()=>setForm(f=>({...f,event_type:ev}))} aria-pressed={form.event_type===ev}
                      style={{border:`2px solid ${form.event_type===ev?EV_COL[ev]:'#1e293b'}`,background:form.event_type===ev?`${EV_COL[ev]}18`:'#0f172a',borderRadius:10,padding:'10px 6px',color:'#e2e8f0'}}>
                      <div style={{fontSize:20,marginBottom:3}}>{EV_ICO[ev]}</div>
                      <div style={{fontSize:11,fontWeight:700,color:form.event_type===ev?EV_COL[ev]:'#94a3b8',textTransform:'capitalize'}}>{ev}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            {verify&&(
              <Card style={{marginBottom:12}}>
                <h2 style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0'}}>🛰️ Oracle — {verify.district}</h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:18}} className="g4">
                  {Object.entries(verify.oracle_inputs).map(([key,v])=>{
                    const src=v.source as OracleSource;
                    return(<div key={key} style={{background:'#030712',border:`1px solid ${src==='live_today'?'#166534':'#1e293b'}`,borderRadius:8,padding:'9px 10px'}}>
                      <div style={{fontSize:9,color:'#64748b',fontWeight:600,marginBottom:2}}>{ORC_ICO[key]||'📡'} {key.replace(/_/g,' ')}</div>
                      <div style={{fontSize:16,fontWeight:900,color:'#e2e8f0'}}>{v.value}</div>
                      <div style={{fontSize:9,color:'#475569',marginBottom:4}}>{v.unit}</div>
                      <div style={{display:'inline-block',background:`${SRC_COL[src]}18`,color:SRC_COL[src],border:`1px solid ${SRC_COL[src]}44`,borderRadius:4,padding:'1px 5px',fontSize:8,fontWeight:700}}>{SRC_LABEL[src]}</div>
                    </div>);
                  })}
                </div>
                <h2 style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0'}}>🤖 Agent Votes</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}} className="g2">
                  {Object.entries(verify.agent_quorum.agents).map(([name,a],i)=><AgentBar key={name} name={name} a={a} delay={i*300} />)}
                </div>
                <div style={{background:verify.agent_quorum.quorum_met?'#052e16':'#2d0a0a',border:`1px solid ${verify.agent_quorum.quorum_met?'#166534':'#7f1d1d'}`,borderRadius:10,padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:'#e2e8f0'}}>Weighted Confidence: <span style={{color:verify.agent_quorum.quorum_met?'#4ade80':'#f87171'}}>{verify.agent_quorum.weighted_confidence}%</span></div>
                    <div style={{fontSize:10,color:'#64748b',marginTop:1}}>{verify.agent_quorum.yes_count}/{verify.agent_quorum.total_agents} YES · {verify.agent_quorum.quorum_rule}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{fontSize:13,fontWeight:700,color:'#4ade80',marginTop:2}}>₹{verify.payout_amount.toLocaleString()} queued</div>}
                  </div>
                </div>
              </Card>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap'}}>
              <button onClick={doVerify} disabled={loading} style={{background:loading?'#1e293b':'linear-gradient(135deg,#1e3a8a,#1d4ed8)',color:loading?'#475569':'#dbeafe',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7}}>
                {loading&&<Spin/>} {loading?(hindi?HI.loading:'Running…'):'🛰️ Run Oracle + Agent Quorum'}
              </button>
              {verify&&<button onClick={()=>setStep('execute')} style={{background:'linear-gradient(135deg,#92400e,#b45309)',color:'#fde68a',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700}}>⚡ Execute →</button>}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step==='execute'&&(
          <div className="fi">
            <h1 style={{fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9'}}>{hindi?'⚡ स्मार्ट कॉन्ट्रैक्ट':'⚡ Step 3 — Execute Smart Contract'}</h1>
            <p style={{color:'#64748b',fontSize:12,marginBottom:16}}>FSM demo: ACTIVE → TRIGGERED → EXECUTED | FRAUD_REVIEW | REJECTED</p>
            {verify&&(
              <Card style={{background:'#1c1400',border:'1px solid #854d0e',marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:'#fef3c7',fontFamily:'monospace'}}>{verify.policy_id}</div>
                    <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>Event: <Badge label={verify.event_type} color={EV_COL[verify.event_type]} /> · <b style={{color:'#e2e8f0'}}>{verify.agent_quorum.weighted_confidence}%</b></div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <Dot s={verify.contract_state} />
                    {verify.payout_amount&&<div style={{fontSize:22,fontWeight:900,color:'#4ade80',marginTop:2}}>₹{verify.payout_amount.toLocaleString()}</div>}
                  </div>
                </div>
              </Card>
            )}
            <FSMPath current={fsmCurrent} previous={execute?.previous_state??(execute?'TRIGGERED':undefined)} />
            {execute&&(
              <Card className="fi cel"
                style={{background:execute.current_state==='FRAUD_REVIEW'?'#1c0a00':execute.current_state==='REJECTED'?'#2d0a0a':'#052e16',border:`1px solid ${execute.current_state==='FRAUD_REVIEW'?'#9a3412':execute.current_state==='REJECTED'?'#7f1d1d':'#166534'}`,marginTop:12,marginBottom:12,animation:execute.current_state==='FRAUD_REVIEW'?'fraudPulse 1.2s ease-in-out infinite':undefined}}>
                <div style={{fontSize:14,fontWeight:800,color:STATE_COL[(execute.current_state||'EXECUTED') as CState],marginBottom:12}}>
                  {execute.current_state==='FRAUD_REVIEW'?'🕵️ Claim diverted to FRAUD_REVIEW':execute.current_state==='REJECTED'?'❌ Claim rejected by FSM':'✅ Payout Executed On-Chain + IMPS Credited'}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:12}} className="g3">
                  {([['Payout','₹'+execute.payout_inr.toLocaleString(),'#4ade80'],['Method',execute.method,'#38bdf8'],['Farmer',execute.farmer,'#e2e8f0'],['UPI Ref',execute.upi_ref,'#a78bfa'],['RRN',execute.rrn,'#34d399'],['Block',String(execute.block_number),'#fbbf24']] as [string,string,string][]).map(([k,v,c])=>(
                    <div key={k} style={{background:'#030712',borderRadius:8,padding:'7px 9px',border:'1px solid #1e293b'}}>
                      <div style={{fontSize:9,color:'#475569',marginBottom:1}}>{k}</div>
                      <div style={{fontSize:11,fontWeight:700,color:c,fontFamily:'monospace',wordBreak:'break-all'}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'#030712',border:'1px solid #1e293b',borderRadius:10,padding:'9px 12px'}}>
                  <div style={{fontSize:9,color:'#475569',fontWeight:700,marginBottom:3}}>{hindi?HI.sms_label:'📱 SMS SENT TO FARMER'}</div>
                  <div style={{fontSize:11,color:'#d1fae5',lineHeight:1.7,fontFamily:'monospace'}}>{execute.sms_sent}</div>
                </div>
              </Card>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap'}}>
              {!execute&&(
                <button onClick={doExecute} disabled={loading} style={btnPrimary(loading)}>
                  {loading&&<Spin/>} {loading?(hindi?HI.loading:'Executing…'):'⚡ Execute Contract Path'}
                </button>
              )}
              {execute&&execute.current_state==='EXECUTED'&&(
                <button onClick={()=>setShowModal(true)} style={{background:'linear-gradient(135deg,#065f46,#059669)',color:'#d1fae5',border:'none',borderRadius:10,padding:'11px 18px',fontSize:12,fontWeight:700}}>🎉 View Payout</button>
              )}
              {execute&&(
                <button onClick={doAudit} disabled={loading} style={{background:'linear-gradient(135deg,#4c1d95,#6d28d9)',color:'#ede9fe',border:'none',borderRadius:10,padding:'11px 20px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7}}>
                  {loading&&<Spin/>}🔗 Audit →
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step==='audit'&&(
          <div className="fi">
            <h1 style={{fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9'}}>{hindi?'🔗 SHA-256 ऑडिट शृंखला':'🔗 Step 4 — Tamper-Evident Audit Chain'}</h1>
            <p style={{color:'#64748b',fontSize:12,marginBottom:16}}>{hindi?'प्रत्येक प्रविष्टि पिछले SHA-256 हैश से जुड़ी':'SHA-256 chained — any mutation is instantly detectable.'}</p>
            {audit&&(
              <Card style={{marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
                  <div><div style={{fontSize:14,fontWeight:800,color:'#e2e8f0'}}>Audit Ledger</div><div style={{fontSize:11,color:'#64748b'}}>{audit.total_entries} entries · SHA-256</div></div>
                  <Badge label={audit.chain_valid?'✓ Chain Valid':'⚠ Chain Broken'} color={audit.chain_valid?'#4ade80':'#f87171'} />
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {[...audit.ledger].reverse().map(entry=>(
                    <div key={entry.seq} style={{border:'1px solid #1e293b',borderRadius:10,padding:'9px 12px',background:entry.event.includes('EXECUTED')?'#052e16':entry.event.includes('TRIGGERED')?'#1c1400':'#0f172a'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap',gap:4}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontWeight:700,color:'#475569',fontSize:10}}>#{entry.seq}</span>
                          <Badge label={entry.event} color={entry.event.includes('EXECUTED')?'#4ade80':entry.event.includes('TRIGGERED')?'#fbbf24':'#34d399'} />
                          <span style={{fontSize:10,color:'#475569',fontFamily:'monospace'}}>{entry.policy_id}</span>
                        </div>
                        <span style={{fontSize:9,color:'#475569'}}>{entry.ts.slice(0,19).replace('T',' ')} UTC</span>
                      </div>
                      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                        <div><span style={{fontSize:9,color:'#475569'}}>HASH </span><Chip h={entry.hash} /></div>
                        <div><span style={{fontSize:9,color:'#475569'}}>PREV </span><Chip h={entry.prev_hash} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {!audit&&(
              <div style={{textAlign:'center',padding:40}}>
                <button onClick={doAudit} disabled={loading} style={{background:loading?'#1e293b':'linear-gradient(135deg,#4c1d95,#6d28d9)',color:loading?'#475569':'#ede9fe',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8}}>
                  {loading&&<Spin/>}🔗 Fetch Audit Chain
                </button>
              </div>
            )}
            {audit&&(
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={doML} disabled={loading} style={{background:'linear-gradient(135deg,#0c4a6e,#0369a1)',color:'#bae6fd',border:'none',borderRadius:10,padding:'11px 22px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:7}}>
                  {loading&&<Spin/>}🤖 ML Risk →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 */}
        {step==='ml'&&(
          <div className="fi">
            <h1 style={{fontSize:20,fontWeight:800,marginBottom:3,color:'#f1f5f9'}}>{hindi?'🤖 जोखिम मॉडल':'🤖 Step 5 — ML Risk Model'}</h1>
            <p style={{color:'#64748b',fontSize:12,marginBottom:16}}>{hindi?'GradientBoosting · log-likelihood · feature importance':'GradientBoosting · log-likelihood ratios · SHAP-style feature importance.'}</p>
            {!ml&&(
              <div style={{textAlign:'center',padding:40}}>
                <button onClick={doML} disabled={loading} style={{background:loading?'#1e293b':'linear-gradient(135deg,#0c4a6e,#0369a1)',color:loading?'#475569':'#bae6fd',border:'none',borderRadius:10,padding:'11px 26px',fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8}}>
                  {loading&&<Spin/>}🤖 Run ML Prediction
                </button>
              </div>
            )}
            {ml&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <Card style={{background:ml.triggered?'#052e16':'#0f172a',border:`1px solid ${ml.triggered?'#166534':'#1e293b'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:'#e2e8f0'}}>{ml.triggered?'🟢 TRIGGER CONFIRMED':'🔴 BELOW THRESHOLD'}</div>
                      <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{ml.model}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:28,fontWeight:900,color:ml.triggered?'#4ade80':'#f87171'}}>{ml.risk_score}/100</div>
                      <Badge label={ml.risk_level} color={{CRITICAL:'#f87171',HIGH:'#fb923c',MEDIUM:'#fbbf24',LOW:'#4ade80'}[ml.risk_level]??'#94a3b8'} />
                    </div>
                  </div>
                  <div style={{background:'#1e293b',borderRadius:6,height:12,overflow:'hidden',marginBottom:8}}>
                    <div style={{width:`${ml.risk_score}%`,height:12,borderRadius:6,background:ml.triggered?'linear-gradient(90deg,#16a34a,#4ade80)':'linear-gradient(90deg,#dc2626,#f87171)',transition:'width 1s ease'}} />
                  </div>
                  {ml.recommendation&&<div style={{fontSize:11,color:'#94a3b8',fontStyle:'italic'}}>💡 {ml.recommendation}</div>}
                  {ml.flags.length>0&&(
                    <div style={{marginTop:8,display:'flex',gap:5,flexWrap:'wrap'}}>
                      {ml.flags.map(f=>(<Badge key={f} label={f} color='#f97316'/>))}
                    </div>
                  )}
                </Card>
                <Card>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0'}}>📊 Log-Likelihood Ratios <span style={{fontSize:10,color:'#475569',fontWeight:400}}>Total LLR: {ml.total_llr}</span></div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {Object.entries(ml.log_likelihoods).map(([feat,v])=>{
                      const pos=v.llr>0;const w=Math.min(Math.abs(v.llr)*15,100);
                      return(<div key={feat} style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:110,fontSize:10,color:'#94a3b8',flexShrink:0,textAlign:'right'}}>{feat}</div>
                        <div style={{flex:1,background:'#1e293b',borderRadius:4,height:8,overflow:'hidden'}}>
                          <div style={{width:`${w}%`,height:8,borderRadius:4,background:pos?'#4ade80':'#f87171',marginLeft:pos?0:`${100-w}%`}} />
                        </div>
                        <div style={{width:50,fontSize:10,fontWeight:700,color:pos?'#4ade80':'#f87171',textAlign:'right'}}>{v.llr>0?'+':''}{v.llr}</div>
                        <Badge label={v.label} color={pos?'#4ade80':'#f87171'} />
                      </div>);
                    })}
                  </div>
                </Card>
                {train&&<TrainPanel train={train} />}
                {train&&<FeatureImportance train={train} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
