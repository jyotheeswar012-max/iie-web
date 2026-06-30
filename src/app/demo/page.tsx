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
const EV_ICO: Record<string,string>  = { drought:'☀️', flood:'🌊', heatwave:'🔥', cyclone:'🌀' };
const RK_COL: Record<string,string>  = { CRITICAL:'#f87171', HIGH:'#fb923c', MEDIUM:'#fbbf24', LOW:'#4ade80' };
const ORC_ICO: Record<string,string> = { NASA_MODIS:'🛰️', IMD_Rainfall:'🌧️', ISRO_Bhuvan:'🌡️', ICAR_Sensors:'🌱' };
const STATE_COL: Record<CState,string> = { ACTIVE:'#34d399', TRIGGERED:'#fbbf24', FRAUD_REVIEW:'#f97316', EXECUTED:'#4ade80', REJECTED:'#f87171' };

const HI: Record<string,string> = {
  enroll:'किसान नामांकन',
  oracle:'ओरेकल जाँच',
  execute:'भुगतान करें',
  audit:'ऑडिट शृंखला',
  ml:'जोखिम मॉडल',
  loading:'प्रसंस्करण…',
  payout_done:'✅ भुगतान हो गया!',
  sms_label:'📱 किसान को SMS',
  ramesh_btn:'रमेश के रूप में नामांकित करें',
};

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
  const c = STATE_COL[s] ?? '#94a3b8';
  return <span style={{ display:'inline-flex',alignItems:'center',gap:5 }}>
    <span style={{ width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 7px ${c}`,display:'inline-block',animation:s==='TRIGGERED'||s==='FRAUD_REVIEW'?'pulse 1s infinite':undefined }} />
    <b style={{ color:c,fontSize:12 }}>{s}</b>
  </span>;
}
function Card({ children, style, className }: { children:React.ReactNode; style?:React.CSSProperties; className?:string }) {
  return <div className={className} style={{ background:'#0f172a',border:'1px solid #1e293b',borderRadius:14,padding:'18px 20px',...style }}>{children}</div>;
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
        <div style={{ fontSize:11,fontWeight:700,color:col }}>{yes?'✅':'❌'} {name.replace(/_/g,' ')}</div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          <span style={{ fontSize:10,color:'#64748b' }}>{a.weight}</span>
          <span style={{ fontWeight:800,fontSize:13,color:col }}>{a.confidence}%</span>
          <span style={{ fontSize:9,color:'#475569' }}>{open?'▲':'▼'}</span>
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
      <div style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>📈 GB Feature Importance</div>
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
        <div style={{ fontSize:12,fontWeight:700,color:'#e2e8f0' }}>🧠 ML Training Metrics</div>
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
    ACTIVE:       '🟢',
    TRIGGERED:    '⚡',
    FRAUD_REVIEW: '🕵️',
    EXECUTED:     '✅',
    REJECTED:     '❌',
  };
  return (
    <Card style={{ background:'#0d1117',border:'1px solid #1e293b' }}>
      <div style={{ fontSize:12,fontWeight:700,marginBottom:10,color:'#e2e8f0' }}>🔗 6-State FSM Path</div>
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:12 }}>
        {states.map(s=>{
          const active = s===current;
          const passed = previous===s || (s==='ACTIVE'&&current&&current!=='ACTIVE') || (s==='TRIGGERED'&&['EXECUTED','FRAUD_REVIEW','REJECTED'].includes(current||''));
          const col = STATE_COL[s];
          return (
            <div key={s} style={{ flex:'1 1 90px',minWidth:90,background:active?`${col}18`:'#030712',border:`${active?2:1}px solid ${activ