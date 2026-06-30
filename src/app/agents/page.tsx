'use client';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────
type AgentVerdict = 'APPROVE' | 'REJECT' | 'REVIEW';
type ContractState = 'ACTIVE' | 'TRIGGERED' | 'FRAUD_REVIEW' | 'EXECUTED' | 'REJECTED';
type WeatherCode = 'HVY_RAIN'|'MOD_RAIN'|'LT_RAIN'|'HEAT_WAVE'|'HOT_DRY'|'CLEAR';

interface AgentResult {
  agent: string; role: string; emoji: string;
  verdict: AgentVerdict; confidence: number; weight: number;
  reasoning: string[]; flags: string[];
  metrics: Record<string, number|string>; latency_ms: number;
}
interface OrchestrateResult {
  policy_id: string; district: string; event_type: string; crop: string;
  contract_state: ContractState; payout_amount: number|null;
  quorum: { weighted_confidence: number; threshold: number; met: boolean; yes: number; review: number; reject: number; rule: string; reason: string; };
  agents: AgentResult[];
  oracle_snapshot: { ndvi: number; temp_c: number; rain_mm: number; soil: number; };
  blockchain: { previous_state: string; new_state: string; valid: boolean; states: string[]; note: string; };
  ts: string;
}
interface DailyWeather {
  date: string; temp_c: number; temp_max: number; temp_min: number;
  rainfall_mm: number; humidity_pct: number; wind_speed_kmh: number;
  wind_direction: string; ndvi: number; soil_moisture_pct: number;
  heat_index_c: number; imd_weather_code: WeatherCode;
  event_probabilities: Record<string, number>;
  most_likely_event: string;
}
interface WeatherResult {
  district: string; state: string;
  period: { from: string; days: number };
  enso: { phase: string; rain_multiplier: number; temp_offset: number };
  summary: { avg_temp_c: number; max_temp_c: number; total_rainfall_mm: number; avg_ndvi: number; avg_soil_pct: number; alert_days: number; anomaly_pct: number };
  daily: DailyWeather[];
}

// ─── Constants ───────────────────────────────────────────────────────
const DISTRICTS = ['Barmer','Jodhpur','Puri','Latur','Warangal','Nashik','Ludhiana','Adilabad','Khammam'];
const CROPS     = ['wheat','cotton','paddy','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const EVENTS    = ['drought','flood','heatwave','cyclone'];

const STATE_META: Record<ContractState, { color: string; bg: string; border: string; emoji: string; label: string; desc: string }> = {
  ACTIVE:       { color:'#34d399', bg:'#052e16', border:'#166534', emoji:'\u{1F7E2}',     label:'Active',       desc:'Policy live — monitoring oracle feeds' },
  TRIGGERED:    { color:'#fbbf24', bg:'#1c1400', border:'#854d0e', emoji:'\u26A1',        label:'Triggered',    desc:'Quorum met — payout queued for IMPS' },
  FRAUD_REVIEW: { color:'#f97316', bg:'#1c0a00', border:'#9a3412', emoji:'\u{1F575}',    label:'Fraud Review', desc:'Anomaly detected — under review' },
  EXECUTED:     { color:'#4ade80', bg:'#052e16', border:'#166534', emoji:'\u2705',        label:'Executed',     desc:'Payout completed — IMPS credited' },
  REJECTED:     { color:'#f87171', bg:'#2d0a0a', border:'#7f1d1d', emoji:'\u274C',        label:'Rejected',     desc:'Claim rejected — quorum not met' },
};

const WC_META: Record<WeatherCode, { emoji: string; label: string; color: string }> = {
  HVY_RAIN:  { emoji:'\u{1F327}', label:'Heavy Rain',  color:'#38bdf8' },
  MOD_RAIN:  { emoji:'\u{1F326}', label:'Mod Rain',    color:'#60a5fa' },
  LT_RAIN:   { emoji:'\u{1F324}', label:'Light Rain',  color:'#93c5fd' },
  HEAT_WAVE: { emoji:'\u{1F525}', label:'Heat Wave',   color:'#f87171' },
  HOT_DRY:   { emoji:'\u2600',    label:'Hot & Dry',   color:'#fb923c' },
  CLEAR:     { emoji:'\u{1F324}', label:'Clear',       color:'#fde68a' },
};

const EV_COLOR: Record<string,string> = { drought:'#fb923c', flood:'#38bdf8', heatwave:'#f87171', cyclone:'#a78bfa' };

// ─── Atoms ─────────────────────────────────────────────────────────────
function Spin() {
  return <span style={{ display:'inline-block',width:13,height:13,border:'2px solid #ffffff22',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0 }} />;
}
function Badge({ label, color='#0f766e' }: { label:string; color?:string }) {
  return <span style={{ background:`${color}22`,color,border:`1px solid ${color}55`,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700,whiteSpace:'nowrap' }}>{label}</span>;
}
function Card({ children, style }: { children:React.ReactNode; style?:React.CSSProperties }) {
  return <div style={{ background:'#0f172a',border:'1px solid #1e293b',borderRadius:14,padding:'16px 18px',...style }}>{children}</div>;
}
function SectionTitle({ children }: { children:React.ReactNode }) {
  return <h2 style={{ fontSize:12,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:12 }}>{children}</h2>;
}

// ─── Animated agent bar with expandable deliberation ───────────────────────────
function AgentCard({ a, delay, hindi }: { a: AgentResult; delay: number; hindi: boolean }) {
  const [width, setWidth] = useState(0);
  const [open,  setOpen]  = useState(false);
  const approve = a.verdict === 'APPROVE';
  const review  = a.verdict === 'REVIEW';
  const col = approve ? '#4ade80' : review ? '#fbbf24' : '#f87171';
  const bg  = approve ? '#052e16' : review ? '#1c1400' : '#2d0a0a';
  const br  = approve ? '#166534' : review ? '#854d0e' : '#7f1d1d';

  useEffect(() => {
    const t = setTimeout(() => setWidth(a.confidence), delay);
    return () => clearTimeout(t);
  }, [a.confidence, delay]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onKeyDown={e => { if (e.key === 'Enter') setOpen(o => !o); }}
      onClick={() => setOpen(o => !o)}
      style={{ background:bg, border:`1px solid ${br}`, borderRadius:12, padding:'14px 16px', cursor:'pointer', transition:'border-color 0.2s', animation:'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>{a.emoji}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:col }}>{a.agent}</div>
            <div style={{ fontSize:10, color:'#64748b' }}>{a.role}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Badge label={a.verdict} color={col} />
          <span style={{ fontSize:14, fontWeight:900, color:col }}>{a.confidence}%</span>
          <span style={{ fontSize:9, color:'#334155' }}>{open ? '\u25B2' : '\u25BC'}</span>
        </div>
      </div>
      {/* Confidence bar */}
      <div style={{ background:'#1e293b', borderRadius:4, height:8, overflow:'hidden', marginBottom:8 }}>
        <div style={{ width:`${width}%`, height:8, borderRadius:4,
          background:`linear-gradient(90deg,${col}66,${col})`,
          transition:'width 1.2s cubic-bezier(0.4,0,0.2,1)', boxShadow:`0 0 8px ${col}44` }} />
      </div>
      {/* Metrics chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:open ? 10 : 0 }}>
        {Object.entries(a.metrics).slice(0,4).map(([k,v]) => (
          <span key={k} style={{ fontSize:9, background:'#1e293b', border:'1px solid #334155', borderRadius:4, padding:'2px 6px', color:'#94a3b8', fontFamily:'monospace' }}>
            {k}: <b style={{ color:'#e2e8f0' }}>{typeof v === 'number' ? +v.toFixed?.(2) : v}</b>
          </span>
        ))}
        <span style={{ fontSize:9, background:'#1e293b', border:'1px solid #334155', borderRadius:4, padding:'2px 6px', color:'#64748b' }}>
          weight: <b style={{ color:'#e2e8f0' }}>{a.weight}%</b>
        </span>
        <span style={{ fontSize:9, background:'#1e293b', border:'1px solid #334155', borderRadius:4, padding:'2px 6px', color:'#64748b' }}>
          {'\u23F1'} {a.latency_ms}ms
        </span>
      </div>
      {/* Flags */}
      {a.flags.length > 0 && (
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:6 }}>
          {a.flags.map((f,i) => (
            <span key={i} style={{ fontSize:9, background:approve ? '#052e16' : review ? '#1c1400' : '#2d0a0a', border:`1px solid ${br}`, borderRadius:4, padding:'2px 6px', color:col }}>{f}</span>
          ))}
        </div>
      )}
      {/* Deliberation log */}
      {open && (
        <div style={{ marginTop:12, borderTop:'1px solid #1e293b', paddingTop:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#475569', marginBottom:6, letterSpacing:'0.05em' }}>
            {hindi ? '\u092E\u0902\u0925\u0928 \u0932\u0949\u0917:' : 'DELIBERATION LOG'}
          </div>
          {a.reasoning.map((line,i) => (
            <div key={i} style={{ fontSize:10, color:'#94a3b8', padding:'3px 0', borderBottom:i<a.reasoning.length-1 ? '1px dashed #1e293b' : undefined, display:'flex', gap:8 }}>
              <span style={{ color:'#334155', minWidth:16, flexShrink:0 }}>{i+1}.</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quorum meter ───────────────────────────────────────────────────────────
function QuorumMeter({ wc, met, hindi }: { wc: number; met: boolean; hindi: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(wc), 600); return () => clearTimeout(t); }, [wc]);
  const col = met ? '#4ade80' : wc >= 50 ? '#fbbf24' : '#f87171';
  return (
    <Card style={{ background: met ? '#052e16' : wc >= 50 ? '#1c1400' : '#2d0a0a', border:`1px solid ${met ? '#166534' : wc >= 50 ? '#854d0e' : '#7f1d1d'}` }}>
      <SectionTitle>{hindi ? '\u092E\u0924\u0926\u093E\u0928 \u0928\u0924\u0940\u091C\u093E' : 'QUORUM RESULT'}</SectionTitle>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:10 }}>
        <div>
          <div style={{ fontSize:42, fontWeight:900, color:col, lineHeight:1, animation:'celebrate 0.5s ease' }}>{w}%</div>
          <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{hindi ? '\u092D\u093E\u0930\u093F\u0924 \u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u2014 \u0938\u0940\u092E\u093E: 75%' : 'Weighted confidence — threshold: 75%'}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <Badge label={met ? (hindi ? '\u2705 \u0915\u094B\u0930\u092E \u092A\u0942\u0930\u094D\u0923' : '\u2705 QUORUM MET') : (hindi ? '\u274C \u0915\u094B\u0930\u092E \u0928\u0939\u0940\u0902' : '\u274C QUORUM FAILED')} color={col} />
        </div>
      </div>
      {/* Meter bar with 75% threshold marker */}
      <div style={{ position:'relative', background:'#1e293b', borderRadius:6, height:14, overflow:'visible', marginBottom:10 }}>
        <div style={{ width:`${w}%`, height:14, borderRadius:6,
          background:`linear-gradient(90deg,${col}66,${col})`,
          transition:'width 1.4s cubic-bezier(0.4,0,0.2,1)', boxShadow:`0 0 12px ${col}55` }} />
        <div style={{ position:'absolute', left:'75%', top:-4, bottom:-4, width:2, background:'#ffffff44', borderRadius:1 }} />
        <div style={{ position:'absolute', left:'75%', top:-16, fontSize:8, color:'#94a3b8', transform:'translateX(-50%)' }}>75%</div>
      </div>
      {/* Vote tally */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {(['APPROVE','REVIEW','REJECT'] as const).map((v) => {
          const c = v === 'APPROVE' ? '#4ade80' : v === 'REVIEW' ? '#fbbf24' : '#f87171';
          const count = v === 'APPROVE' ? (w >= 75 ? 2 : 1) : v === 'REVIEW' ? 1 : 0;
          return (
            <div key={v} style={{ background:'#0f172a', border:`1px solid ${c}33`, borderRadius:8, padding:'8px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, color:c }}>{count}</div>
              <div style={{ fontSize:9, color:'#64748b' }}>{v}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── 6-State FSM Visualiser ────────────────────────────────────────────────────
function FSMVisualiser({ active, hindi }: { active?: ContractState; hindi: boolean }) {
  const states: ContractState[] = ['ACTIVE','TRIGGERED','FRAUD_REVIEW','EXECUTED','REJECTED'];
  const flow = [
    { from:'ACTIVE' as ContractState,       to:'TRIGGERED' as ContractState,    label: hindi ? '\u0915\u094B\u0930\u092E \u2705' : 'quorum \u2705',          normal:true  },
    { from:'ACTIVE' as ContractState,       to:'REJECTED' as ContractState,     label: hindi ? '\u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924' : 'rejected',  normal:false },
    { from:'TRIGGERED' as ContractState,    to:'EXECUTED' as ContractState,     label: hindi ? 'IMPS \u092D\u0941\u0917\u0924\u093E\u0928' : 'IMPS payout',     normal:true  },
    { from:'TRIGGERED' as ContractState,    to:'FRAUD_REVIEW' as ContractState, label: hindi ? '\u0927\u094B\u0916\u093E \u0938\u0902\u0915\u0947\u0924' : 'fraud signal', normal:false },
    { from:'FRAUD_REVIEW' as ContractState, to:'EXECUTED' as ContractState,     label: hindi ? '\u0938\u092E\u0940\u0915\u094D\u0937\u093E \u2705' : 'review \u2705', normal:true  },
    { from:'FRAUD_REVIEW' as ContractState, to:'REJECTED' as ContractState,     label: hindi ? '\u092A\u0941\u0937\u094D\u091F\u093F \u0927\u094B\u0916\u093E' : 'confirmed fraud', normal:false },
  ];
  return (
    <Card>
      <SectionTitle>{hindi ? '\u{1F517} \u0938\u094D\u091F\u0947\u091F \u092E\u0936\u0940\u0928 (6 \u0938\u094D\u0925\u093F\u0924\u093F)' : '\u{1F517} 6-STATE CONTRACT MACHINE'}</SectionTitle>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        {states.map(s => {
          const m = STATE_META[s];
          const isActive = s === active;
          return (
            <div key={s} style={{ flex:'1 1 80px', minWidth:80,
              background: isActive ? m.bg : '#0f172a',
              border: `${isActive ? 2 : 1}px solid ${isActive ? m.color : '#1e293b'}`,
              borderRadius:10, padding:'10px 8px', textAlign:'center',
              boxShadow: isActive ? `0 0 18px ${m.color}44` : undefined,
              animation: isActive && s === 'FRAUD_REVIEW' ? 'fraudPulse 1.2s ease-in-out infinite' : undefined,
              transition:'all 0.3s' }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{m.emoji}</div>
              <div style={{ fontSize:10, fontWeight:700, color: isActive ? m.color : '#475569' }}>{m.label}</div>
              {isActive && <div style={{ fontSize:8, color:m.color, marginTop:2 }}>{'\u25C4'} CURRENT</div>}
            </div>
          );
        })}
      </div>
      {/* Transition arrows legend */}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {flow.map((f,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:10,
            color: f.from === active || f.to === active ? '#e2e8f0' : '#334155',
            opacity: f.from === active || f.to === active ? 1 : 0.45, transition:'opacity 0.3s' }}>
            <span style={{ color: STATE_META[f.from]?.color ?? '#64748b', fontWeight:700, minWidth:90 }}>{f.from}</span>
            <span style={{ color: f.normal ? '#4ade80' : '#f87171' }}>{f.normal ? '\u27A1' : '\u26A0'}</span>
            <span style={{ color: STATE_META[f.to]?.color ?? '#64748b', fontWeight:700, minWidth:90 }}>{f.to}</span>
            <span style={{ color:'#475569', fontStyle:'italic' }}>[{f.label}]</span>
          </div>
        ))}
      </div>
      {active && (
        <div style={{ marginTop:12, padding:'9px 12px',
          background: STATE_META[active].bg, border:`1px solid ${STATE_META[active].border}`,
          borderRadius:8, fontSize:11, color: STATE_META[active].color }}>
          {STATE_META[active].emoji} <b>{STATE_META[active].label}:</b> {STATE_META[active].desc}
        </div>
      )}
    </Card>
  );
}

// ─── Oracle snapshot ─────────────────────────────────────────────────────────
function OracleSnapshot({ snap, hindi }: { snap: OrchestrateResult['oracle_snapshot']; hindi: boolean }) {
  const items = [
    { label:hindi ? 'NDVI (\u0935\u0928\u0938\u094D\u092A\u0924\u093F)' : 'NDVI', value:snap.ndvi.toFixed(3), icon:'\u{1F331}', color: snap.ndvi < 0.28 ? '#f87171' : '#4ade80' },
    { label:hindi ? '\u0924\u093E\u092A\u092E\u093E\u0928 \u00B0C' : 'Temp \u00B0C', value:`${snap.temp_c}\u00B0`, icon:'\u{1F321}', color: snap.temp_c > 45 ? '#f87171' : '#fbbf24' },
    { label:hindi ? '\u0935\u0930\u094D\u0937\u093E mm' : 'Rain mm', value:`${snap.rain_mm}mm`, icon:'\u{1F327}', color: snap.rain_mm < 10 ? '#fb923c' : '#38bdf8' },
    { label:hindi ? '\u092E\u093F\u091F\u094D\u091F\u0940 %' : 'Soil %', value:`${snap.soil}%`, icon:'\u{1F3DC}', color: snap.soil < 15 ? '#f87171' : '#a78bfa' },
  ];
  return (
    <Card>
      <SectionTitle>{hindi ? '\u{1F6F0} \u0913\u0930\u0947\u0915\u0932 \u0938\u094D\u0928\u0948\u092A\u0936\u0949\u091F' : '\u{1F6F0} ORACLE SNAPSHOT'}</SectionTitle>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {items.map(it => (
          <div key={it.label} style={{ background:'#030712', border:'1px solid #1e293b', borderRadius:9, padding:'10px 12px' }}>
            <div style={{ fontSize:16, marginBottom:3 }}>{it.icon}</div>
            <div style={{ fontSize:18, fontWeight:900, color:it.color, lineHeight:1 }}>{it.value}</div>
            <div style={{ fontSize:9, color:'#475569', marginTop:2 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Weather panel ───────────────────────────────────────────────────────────
function WeatherPanel({ weather, hindi }: { weather: WeatherResult; hindi: boolean }) {
  const s = weather.summary;
  return (
    <Card>
      <SectionTitle>{hindi ? `\u{1F326} ${weather.district} \u092E\u094C\u0938\u092E \u092A\u0942\u0930\u094D\u0935\u093E\u0928\u0941\u092E\u093E\u0928` : `\u{1F326} ${weather.district} \u2014 ${weather.period.days}-day Weather`}</SectionTitle>
      {/* ENSO badge */}
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        <Badge label={`ENSO: ${weather.enso.phase}`}   color='#a78bfa' />
        <Badge label={`Rain \u00D7${weather.enso.rain_multiplier}`} color='#38bdf8' />
        <Badge label={`Temp ${weather.enso.temp_offset > 0 ? '+' : ''}${weather.enso.temp_offset}\u00B0C`} color='#fbbf24' />
        {s.alert_days > 0 && <Badge label={`\u26A0\uFE0F ${s.alert_days} alert days`} color='#f87171' />}
      </div>
      {/* Summary grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:14 }}>
        {([
          ['Max Temp',`${s.max_temp_c}\u00B0C`,'#f87171'],
          ['Total Rain',`${s.total_rainfall_mm}mm`,'#38bdf8'],
          ['Avg NDVI',`${s.avg_ndvi}`,'#4ade80'],
          ['Avg Soil',`${s.avg_soil_pct}%`,'#a78bfa'],
          ['Rain Anomaly',`${s.anomaly_pct > 0 ? '+' : ''}${s.anomaly_pct}%`, s.anomaly_pct > 10 ? '#38bdf8' : s.anomaly_pct < -10 ? '#f87171' : '#fbbf24'],
          ['Alert Days',`${s.alert_days}`,'#fb923c'],
        ] as [string,string,string][]).map(([k,v,c]) => (
          <div key={k} style={{ background:'#030712', border:'1px solid #1e293b', borderRadius:8, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'#475569', marginBottom:2 }}>{k}</div>
            <div style={{ fontSize:13, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Daily strip */}
      <div style={{ overflowX:'auto', paddingBottom:4 }}>
        <div style={{ display:'flex', gap:7, minWidth:'max-content' }}>
          {weather.daily.map(d => {
            const wm = WC_META[d.imd_weather_code] ?? WC_META.CLEAR;
            const maxEv = Object.entries(d.event_probabilities).sort((a,b) => b[1]-a[1])[0];
            return (
              <div key={d.date} style={{ background:'#030712', border:'1px solid #1e293b', borderRadius:10, padding:'10px', textAlign:'center', minWidth:80 }}>
                <div style={{ fontSize:10, color:'#475569', marginBottom:4 }}>{d.date.slice(5)}</div>
                <div style={{ fontSize:20 }}>{wm.emoji}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'#f87171', lineHeight:1.2 }}>{d.temp_max}\u00B0</div>
                <div style={{ fontSize:10, color:'#475569' }}>{d.temp_min}\u00B0</div>
                <div style={{ fontSize:10, color:'#38bdf8', marginTop:2 }}>{d.rainfall_mm}mm</div>
                <div style={{ fontSize:9, marginTop:4 }}>
                  <span style={{ color: EV_COLOR[maxEv[0]] ?? '#94a3b8', fontWeight:700 }}>
                    {maxEv[1] > 0.3 ? `\u26A0${(maxEv[1]*100).toFixed(0)}%` : '\u2705'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Event probability bars */}
      {weather.daily.length > 0 && (
        <div style={{ marginTop:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#475569', marginBottom:7, letterSpacing:'0.05em' }}>
            {hindi ? '\u0918\u091F\u0928\u093E \u0938\u0902\u092D\u093E\u0935\u0928\u093E (\u0906\u091C):' : 'EVENT PROBABILITY (TODAY):'}
          </div>
          {Object.entries(weather.daily[0].event_probabilities).map(([ev,p]) => (
            <div key={ev} style={{ marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:2 }}>
                <span style={{ color: EV_COLOR[ev] ?? '#94a3b8', fontWeight:700, textTransform:'capitalize' }}>{ev}</span>
                <span style={{ color: p > 0.6 ? '#f87171' : p > 0.3 ? '#fbbf24' : '#4ade80', fontWeight:700 }}>{(p*100).toFixed(1)}%</span>
              </div>
              <div style={{ background:'#1e293b', borderRadius:4, height:5 }}>
                <div style={{ width:`${p*100}%`, height:5, borderRadius:4, background: EV_COLOR[ev] ?? '#94a3b8', transition:'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<OrchestrateResult|null>(null);
  const [weather,  setWeather]  = useState<WeatherResult|null>(null);
  const [wLoading, setWLoading] = useState(false);
  const [error,    setError]    = useState('');
  const [hindi,    setHindi]    = useState(false);

  const [form, setForm] = useState({
    district:'Barmer', event_type:'drought', crop:'wheat', acreage:'4.5',
    policy_id:'SBI-IIE-00341', farmer:'Ramesh Kumar',
  });

  const runAgents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/agents/orchestrate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, acreage: parseFloat(form.acreage) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'API error');
      setResult(d);
    } catch(e) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  }, [form]);

  const fetchWeather = useCallback(async () => {
    setWLoading(true);
    try {
      const r = await fetch(`/api/weather/simulate?district=${form.district}&days=7`);
      setWeather(await r.json());
    } catch { /* ignore */ }
    setWLoading(false);
  }, [form.district]);

  useEffect(() => { runAgents(); fetchWeather(); }, []); // eslint-disable-line

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width:'100%', border:'1px solid #1e293b', borderRadius:8, padding:'8px 10px',
    fontSize:12, background:'#030712', color:'#e2e8f0', fontFamily:'inherit', ...extra,
  });

  return (
    <div style={{ minHeight:'100vh', background:'#030712', fontFamily:"'Inter',system-ui,sans-serif", color:'#e2e8f0' }}>
      <style>{`
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes celebrate  { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes fraudPulse { 0%,100%{box-shadow:0 0 12px #f9731644} 50%{box-shadow:0 0 32px #f97316cc} }
        *  { box-sizing:border-box }
        button,a { cursor:pointer }
        input,select { outline:none; font-family:inherit }
        input:focus,select:focus { border-color:#34d399!important; box-shadow:0 0 0 3px #34d39922 }
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:#0f172a }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:2px }
        @media(max-width:768px) { .two-col{grid-template-columns:1fr!important} }
      `}</style>

      {/* Topbar */}
      <div style={{ background:'#0d1117', borderBottom:'1px solid #1e293b', padding:'12px 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8,
        position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <a href="/" style={{ color:'#475569', textDecoration:'none', fontSize:12 }}>{'\u2190'} Home</a>
          <span style={{ color:'#1e293b' }}>|</span>
          <span style={{ fontSize:14, fontWeight:800, color:'#e2e8f0' }}>{'\u{1F916}'} {hindi ? '\u092E\u0932\u094D\u091F\u093F-\u090F\u091C\u0947\u0902\u091F \u0913\u0930\u094D\u0915\u0947\u0938\u094D\u091F\u094D\u0930\u0947\u091F\u0930' : 'Multi-Agent Orchestrator'}</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <a href="/demo"      style={{ fontSize:11, color:'#4ade80',  textDecoration:'none', fontWeight:600 }}>Demo</a>
          <a href="/dashboard" style={{ fontSize:11, color:'#38bdf8',  textDecoration:'none', fontWeight:600 }}>Dashboard</a>
          <button onClick={() => setHindi(h => !h)}
            style={{ background:hindi ? '#065f46' : '#1e293b', color:hindi ? '#d1fae5' : '#94a3b8',
              border:'1px solid #334155', borderRadius:7, padding:'5px 9px', fontSize:11, fontWeight:700 }}>
            {hindi ? 'EN' : '\u0939\u093F'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 14px' }}>
        {/* Hero */}
        <div style={{ marginBottom:20, animation:'fadeIn 0.4s ease' }}>
          <h1 style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', marginBottom:4 }}>
            {hindi ? '\u{1F916} AI \u090F\u091C\u0947\u0902\u091F \u0915\u094B\u0930\u092E \u2014 \u0932\u093E\u0907\u0935 \u0935\u094B\u091F\u093F\u0902\u0917' : '\u{1F916} AI Agent Quorum \u2014 Live Voting'}
          </h1>
          <p style={{ color:'#64748b', fontSize:12 }}>
            {hindi
              ? '3 \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E \u090F\u091C\u0947\u0902\u091F \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930 \u0930\u0942\u092A \u0938\u0947 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902 \u00B7 \u092D\u093E\u0930\u093F\u0924 \u092C\u0939\u0941\u092E\u0924 \u00B7 FRAUD_REVIEW \u0938\u094D\u0925\u093F\u0924\u093F \u00B7 \u0939\u093E\u0907\u092A\u0930\u0932\u0947\u091C\u0930 \u0924\u0948\u092F\u093E\u0930'
              : '3 specialist agents analyse independently \u00B7 Weighted quorum voting \u00B7 FRAUD_REVIEW FSM state \u00B7 Hyperledger-ready'}
          </p>
        </div>

        {error && (
          <div style={{ background:'#2d0a0a', border:'1px solid #7f1d1d', borderRadius:10,
            padding:'10px 14px', color:'#fca5a5', marginBottom:14, fontSize:12 }} role="alert">
            {'\u26A0\uFE0F'} {error}
          </div>
        )}

        {/* Top row: controls + oracle + quorum */}
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:16, marginBottom:16, alignItems:'start' }} className="two-col">
          {/* Controls */}
          <Card>
            <SectionTitle>{hindi ? '\u2699\uFE0F \u0907\u0928\u092A\u0941\u091F \u092A\u0948\u0930\u093E\u092E\u0940\u091F\u0930' : '\u2699\uFE0F INPUT PARAMETERS'}</SectionTitle>
            {[
              { k:'district',   label:hindi ? '\u091C\u093F\u0932\u093E'  : 'District', type:'select', opts:DISTRICTS },
              { k:'event_type', label:hindi ? '\u0918\u091F\u0928\u093E'  : 'Event',    type:'select', opts:EVENTS    },
              { k:'crop',       label:hindi ? '\u092B\u0938\u0932'        : 'Crop',     type:'select', opts:CROPS     },
              { k:'acreage',    label:hindi ? '\u090F\u0915\u0921\u093C'  : 'Acreage',  type:'number', opts:null      },
              { k:'farmer',     label:hindi ? '\u0915\u093F\u0938\u093E\u0928' : 'Farmer', type:'text', opts:null     },
            ].map(({ k, label, type, opts }) => (
              <div key={k} style={{ marginBottom:10 }}>
                <div style={{ fontSize:9, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{label}</div>
                {opts ? (
                  <select value={form[k as keyof typeof form]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} style={inp()}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={form[k as keyof typeof form]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} style={inp()} />
                )}
              </div>
            ))}
            <button onClick={() => { runAgents(); fetchWeather(); }} disabled={loading}
              style={{ width:'100%', background:loading ? '#1e293b' : 'linear-gradient(135deg,#065f46,#047857)',
                color:loading ? '#475569' : '#d1fae5', border:'none', borderRadius:10,
                padding:'11px', fontSize:13, fontWeight:700, display:'flex', alignItems:'center',
                justifyContent:'center', gap:8, marginTop:4 }}>
              {loading && <Spin />}
              {loading ? (hindi ? '\u091A\u0932 \u0930\u0939\u093E \u0939\u0948\u2026' : 'Running\u2026') : (hindi ? '\u25B6\uFE0F \u090F\u091C\u0947\u0902\u091F \u091A\u0932\u093E\u090F\u0902' : '\u25B6\uFE0F Run Agent Quorum')}
            </button>
            {/* Quick presets */}
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:9, color:'#475569', fontWeight:700, letterSpacing:'0.05em', marginBottom:6 }}>QUICK PRESETS</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  { label:'\u{1F335} Barmer Drought', d:'Barmer', e:'drought',  c:'wheat'  },
                  { label:'\u{1F30A} Puri Flood',     d:'Puri',   e:'flood',    c:'paddy'  },
                  { label:'\u{1F525} Jodhpur Heat',   d:'Jodhpur',e:'heatwave', c:'cotton' },
                ].map(p => (
                  <button key={p.label} onClick={() => setForm(f => ({...f,district:p.d,event_type:p.e,crop:p.c}))}
                    style={{ fontSize:10, background:'#1e293b', color:'#94a3b8', border:'1px solid #334155',
                      borderRadius:7, padding:'4px 9px', fontFamily:'inherit' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Oracle + Quorum */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {result && <OracleSnapshot snap={result.oracle_snapshot} hindi={hindi} />}
            {result && <QuorumMeter wc={result.quorum.weighted_confidence} met={result.quorum.met} hindi={hindi} />}
            {!result && loading && (
              <Card style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:160 }}>
                <Spin /><span style={{ marginLeft:10, color:'#64748b' }}>{hindi ? '\u090F\u091C\u0947\u0902\u091F \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u2026' : 'Agents deliberating\u2026'}</span>
              </Card>
            )}
          </div>
        </div>

        {/* Agent cards */}
        {result && (
          <div style={{ marginBottom:16 }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:12 }}>
              {hindi ? '\u{1F916} \u090F\u091C\u0947\u0902\u091F \u0935\u093F\u091A\u093E\u0930-\u0935\u093F\u092E\u0930\u094D\u0936 (\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0932\u0949\u0917 \u0926\u0947\u0916\u0947\u0902)' : '\u{1F916} Agent Deliberations \u2014 click any card to expand reasoning log'}
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} className="two-col">
              {result.agents.map((a,i) => <AgentCard key={a.agent} a={a} delay={i*400} hindi={hindi} />)}
            </div>
          </div>
        )}

        {/* Bottom row: FSM + Weather */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }} className="two-col">
          <FSMVisualiser active={result?.contract_state} hindi={hindi} />
          {weather
            ? <WeatherPanel weather={weather} hindi={hindi} />
            : <Card style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
                {wLoading ? <><Spin /><span style={{ marginLeft:8, color:'#64748b', fontSize:12 }}>{hindi ? '\u092E\u094C\u0938\u092E \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948\u2026' : 'Loading weather\u2026'}</span></> : null}
              </Card>
          }
        </div>

        {/* Blockchain note */}
        {result && (
          <Card style={{ background:'#0d0d1a', border:'1px solid #1e3a8a', animation:'fadeIn 0.4s ease' }}>
            <SectionTitle>{hindi ? '\u26D3\uFE0F \u092C\u094D\u0932\u0949\u0915\u091A\u0947\u0928 + \u0939\u093E\u0907\u092A\u0930\u0932\u0947\u091C\u0930' : '\u26D3\uFE0F BLOCKCHAIN + HYPERLEDGER FABRIC'}</SectionTitle>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }} className="two-col">
              {([
                ['Network',    'Polygon Mumbai Testnet',                                         '#a78bfa'],
                ['FSM States', 'ACTIVE \u203A TRIGGERED \u203A FRAUD_REVIEW \u203A EXECUTED | REJECTED', '#38bdf8'],
                ['Hyperledger','Fabric v2.4 \u00B7 iie-claims-channel \u00B7 3/3 endorsers',    '#4ade80'],
              ] as [string,string,string][]).map(([k,v,c]) => (
                <div key={k} style={{ background:'#030712', border:'1px solid #1e293b', borderRadius:9, padding:'10px 12px' }}>
                  <div style={{ fontSize:9, color:'#475569', marginBottom:3, fontWeight:700, textTransform:'uppercase' }}>{k}</div>
                  <div style={{ fontSize:11, color:c, fontFamily:'monospace', lineHeight:1.5 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, padding:'8px 12px', background:'#1e293b', borderRadius:8, fontSize:10, color:'#64748b' }}>
              <b style={{ color:'#94a3b8' }}>Transition:</b>{' '}
              {result.blockchain.previous_state} {'\u2192'} <b style={{ color: STATE_META[result.contract_state]?.color ?? '#e2e8f0' }}>{result.blockchain.new_state}</b>
              {' '}<Badge label={result.blockchain.valid ? '\u2713 Valid' : '\u26A0 Invalid'} color={result.blockchain.valid ? '#4ade80' : '#f87171'} />
              <span style={{ marginLeft:10, color:'#334155' }}>{result.blockchain.note}</span>
            </div>
          </Card>
        )}

        {/* Nav */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:20, justifyContent:'center' }}>
          {([
            ['/demo',      '\u26A1 Full Demo',   '#065f46'],
            ['/dashboard', '\u{1F5FA}\uFE0F Dashboard', '#0c4a6e'],
            ['/impact',    '\u{1F4CA} Impact',   '#4c1d95'],
          ] as [string,string,string][]).map(([href,label,bg]) => (
            <a key={href} href={href} style={{ background:`linear-gradient(135deg,${bg},${bg}dd)`, color:'#e2e8f0',
              textDecoration:'none', borderRadius:10, padding:'10px 20px', fontSize:12, fontWeight:700 }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
