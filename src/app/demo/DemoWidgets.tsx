'use client';
import { useState, useEffect } from 'react';
import type { CState, Agent, TrainMetrics, ExecuteResult } from './DemoTypes';
import { STATE_COL, SRC_COL, SRC_LABEL, HI } from './DemoTypes';

export function Spin(){return <span style={{display:'inline-block',width:14,height:14,border:'2px solid #ffffff33',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}} />;}
export function Chip({h}:{h:string}){return <span style={{fontFamily:'monospace',fontSize:10,background:'#1e293b',border:'1px solid #334155',borderRadius:4,padding:'2px 6px',color:'#94a3b8',wordBreak:'break-all'}}>{h.slice(0,22)}…</span>;}
export function Badge({label,color='#0f766e'}:{label:string;color?:string}){return <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:6,padding:'2px 9px',fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>{label}</span>;}
export function Dot({s}:{s:CState}){
  const c=STATE_COL[s]??'#94a3b8';
  return(<span style={{display:'inline-flex',alignItems:'center',gap:5}}><span style={{width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 7px ${c}`,display:'inline-block',animation:s==='TRIGGERED'||s==='FRAUD_REVIEW'?'pulse 1s infinite':undefined}} /><b style={{color:c,fontSize:12}}>{s}</b></span>);
}
export function Card({children,style,className}:{children:React.ReactNode;style?:React.CSSProperties;className?:string}){return <div className={className} style={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:14,padding:'18px 20px',...style}}>{children}</div>;}
export function Label({children}:{children:React.ReactNode}){return <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{children}</div>;}

export function AgentBar({name,a,delay}:{name:string;a:Agent;delay:number}){
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

export function FeatureImportance({train}:{train:TrainMetrics}){
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

export function TrainPanel({train}:{train:TrainMetrics}){
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

export function FSMPath({current,previous}:{current?:CState;previous?:CState}){
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
export function ClaimModal({exec,onClose,hindi}:{exec:ExecuteResult;onClose:()=>void;hindi:boolean}){
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
