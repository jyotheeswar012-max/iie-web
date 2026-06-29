'use client';
import { useState, useEffect, useCallback } from 'react';

const API = '';

type Step = 'enroll' | 'verify' | 'execute' | 'audit' | 'ml';
type ContractState = 'ACTIVE' | 'TRIGGERED' | 'EXECUTED';

interface Policy {
  policy_id: string;
  contract_address: string;
  net_premium_inr: number;
  subsidy_applied: number;
  coverage_inr: number;
  block_deployed: number;
  deploy_tx: string;
  message: string;
  upi_debit_ref: string;
  aadhaar_hash: string;
}

interface OracleSource {
  metric: string;
  value: number;
  unit: string;
  latency_ms: number;
}

interface AgentVote {
  decision: string;
  reason: string;
}

interface VerifyResult {
  policy_id: string;
  district: string;
  event_type: string;
  contract_state: ContractState;
  payout_amount: number | null;
  oracle_data: {
    sources: Record<string, OracleSource>;
    derived: Record<string, number>;
    fetched_at: string;
  };
  agent_quorum: {
    votes: Record<string, AgentVote>;
    yes_count: number;
    total_agents: number;
    confidence_pct: number;
    quorum_met: boolean;
    quorum_rule: string;
  };
  next_step: string;
}

interface ExecuteResult {
  success: boolean;
  policy_id: string;
  payout_inr: number;
  tx_hash: string;
  block_number: number;
  upi_ref: string;
  rrn: string;
  farmer: string;
  credited_to: string;
  method: string;
  sms_sent: string;
  message: string;
}

interface AuditEntry {
  seq: number;
  ts: string;
  event: string;
  policy_id: string;
  hash: string;
  prev_hash: string;
  data: Record<string, unknown>;
}

interface MLResult {
  risk_score: number;
  risk_level: string;
  triggered: boolean;
  confidence_pct: number;
  component_scores: Record<string, number>;
  flags: string[];
  model: string;
  recommendation: string;
}

const CROPS = ['paddy','cotton','wheat','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const PLANS = ['Basic Protect','Smart Shield','Full Season Pro'];
const EVENTS = ['drought','flood','heatwave','cyclone'];
const DISTRICTS = ['Barmer','Puri','Latur','Warangal','Nashik','Ludhiana','Jodhpur','Adilabad'];

const EVENT_COLORS: Record<string, string> = {
  drought: '#b45309', flood: '#0369a1', heatwave: '#dc2626', cyclone: '#6d28d9'
};

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a'
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      background: color ? `${color}22` : '#0f766e22',
      color: color ?? '#0f766e',
      border: `1px solid ${color ?? '#0f766e'}44`,
      borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em'
    }}>{label}</span>
  );
}

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 24px', ...style
    }}>{children}</div>
  );
}

function HashChip({ hash }: { hash: string }) {
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9',
      border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px', color: '#475569'
    }}>{hash.slice(0,18)}…</span>
  );
}

function Spinner() {
  return (
    <span style={{ display:'inline-block', width:16, height:16, border:'2px solid #0f766e44',
      borderTop:'2px solid #0f766e', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
  );
}

function StatusDot({ state }: { state: ContractState }) {
  const c = state === 'EXECUTED' ? '#16a34a' : state === 'TRIGGERED' ? '#d97706' : '#0f766e';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <span style={{ width:9, height:9, borderRadius:'50%', background:c,
        boxShadow:`0 0 6px ${c}88`, display:'inline-block' }} />
      <span style={{ fontWeight:700, color:c, fontSize:13 }}>{state}</span>
    </span>
  );
}

function AgentVotes({ votes, quorumMet }: { votes: Record<string, AgentVote>; quorumMet: boolean }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
      {Object.entries(votes).map(([agent, v]) => {
        const yes = v.decision.includes('YES');
        return (
          <div key={agent} style={{
            background: yes ? '#dcfce722' : '#fee2e222',
            border: `1px solid ${yes ? '#16a34a44' : '#dc262644'}`,
            borderRadius:8, padding:'10px 12px'
          }}>
            <div style={{ fontSize:11, fontWeight:700, color: yes ? '#16a34a' : '#dc2626', marginBottom:3 }}>
              {yes ? '✅' : '❌'} {agent.replace('_',' ')}
            </div>
            <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>{v.reason}</div>
          </div>
        );
      })}
      <div style={{ gridColumn:'span 2', textAlign:'center', fontSize:13, fontWeight:700,
        color: quorumMet ? '#16a34a' : '#dc2626', marginTop:4 }}>
        {quorumMet ? '✅ Quorum Met — Contract TRIGGERED' : '❌ Quorum Not Met — Monitoring continues'}
      </div>
    </div>
  );
}

function OracleSources({ sources }: { sources: Record<string, OracleSource> }) {
  const icons: Record<string, string> = {
    NASA_MODIS:'🛰️', IMD_Rainfall:'🌧️', ISRO_Bhuvan:'🌡️', ICAR_Sensors:'🌱'
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, marginTop:10 }}>
      {Object.entries(sources).map(([key, s]) => (
        <div key={key} style={{
          background:'#f8fafc', border:'1px solid #e2e8f0',
          borderRadius:8, padding:'10px 12px'
        }}>
          <div style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>{icons[key]||'📡'} {key}</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', margin:'4px 0' }}>
            {s.value} <span style={{ fontSize:11, fontWeight:400, color:'#94a3b8' }}>{s.unit}</span>
          </div>
          <div style={{ fontSize:10, color:'#94a3b8' }}>latency: {s.latency_ms}ms</div>
        </div>
      ))}
    </div>
  );
}

function MLBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct > 60 ? '#dc2626' : pct > 35 ? '#d97706' : '#16a34a';
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
        <span style={{ color:'#475569' }}>{label}</span>
        <span style={{ fontWeight:700, color }}>{value}/{max}</span>
      </div>
      <div style={{ background:'#f1f5f9', borderRadius:4, height:7 }}>
        <div style={{ width:`${pct}%`, background:color, height:7, borderRadius:4, transition:'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [step, setStep] = useState<Step>('enroll');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: 'Ravi Kumar', aadhaar_last4: '3842', district: 'Barmer',
    state: 'Rajasthan', crop: 'wheat', acreage: '4', plan: 'Smart Shield',
    event_type: 'drought',
  });

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [verify, setVerify] = useState<VerifyResult | null>(null);
  const [execute, setExecute] = useState<ExecuteResult | null>(null);
  const [audit, setAudit] = useState<{ chain_valid: boolean; total_entries: number; ledger: AuditEntry[] } | null>(null);
  const [ml, setMl] = useState<MLResult | null>(null);
  const [health, setHealth] = useState<{ status: string; policies: number; contracts: number; chain_valid: boolean } | null>(null);

  const ping = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/health`);
      const d = await r.json();
      setHealth(d);
    } catch { setHealth(null); }
  }, []);

  useEffect(() => { ping(); }, [ping]);

  const post = async (url: string, body: object) => {
    const r = await fetch(`${API}${url}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'API error');
    return d;
  };

  const doEnroll = async () => {
    setLoading(true); setError('');
    try {
      const d = await post('/api/oracle/enroll', {
        name: form.name, aadhaar_last4: form.aadhaar_last4,
        district: form.district, state: form.state,
        crop: form.crop, acreage: parseFloat(form.acreage), plan: form.plan,
      });
      setPolicy(d);
      setStep('verify');
      ping();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const doVerify = async () => {
    if (!policy) return;
    setLoading(true); setError('');
    try {
      const d = await post('/api/oracle/verify', {
        policy_id: policy.policy_id, event_type: form.event_type,
      });
      setVerify(d);
      setStep('execute');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const doExecute = async () => {
    if (!policy) return;
    setLoading(true); setError('');
    try {
      const d = await post('/api/contract/execute', {
        policy_id: policy.policy_id, force: true,
      });
      setExecute(d);
      setStep('audit');
      ping();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const doAudit = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/audit/trail`);
      const d = await r.json();
      setAudit(d);
      setStep('ml');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const doML = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/oracle/feed`);
      const fd = await r.json();
      const row = fd.districts?.[0];
      if (row) {
        const d = await post('/api/ml/predict', {
          district: row.district, ndvi: row.ndvi, temp_c: row.temp_c,
          rainfall_mm: row.rainfall_mm, soil_moisture_pct: row.soil_moisture,
        });
        setMl(d);
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false);
  };

  const reset = () => {
    setStep('enroll'); setPolicy(null); setVerify(null);
    setExecute(null); setAudit(null); setMl(null); setError('');
    setForm(f => ({ ...f, name: 'Farmer ' + Math.floor(Math.random()*9000+1000), aadhaar_last4: String(Math.floor(Math.random()*9000+1000)),
      district: DISTRICTS[Math.floor(Math.random()*DISTRICTS.length)], crop: CROPS[Math.floor(Math.random()*CROPS.length)] }));
  };

  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'enroll',  label: 'Enroll',   icon: '📋' },
    { id: 'verify',  label: 'Oracle',   icon: '🛰️' },
    { id: 'execute', label: 'Execute',  icon: '⚡' },
    { id: 'audit',   label: 'Audit',    icon: '🔗' },
    { id: 'ml',      label: 'ML',       icon: '🤖' },
  ];

  const completed = (id: Step) => {
    const order: Step[] = ['enroll','verify','execute','audit','ml'];
    return order.indexOf(id) < order.indexOf(step);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif",
      color: '#0f172a'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        :root { --card: #ffffff; --border: #e2e8f0; }
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        input, select { outline: none; }
        input:focus, select:focus { border-color: #0f766e !important; box-shadow: 0 0 0 3px #0f766e22; }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', boxShadow: '0 2px 12px #0f766e44'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:10, background:'#ffffff22',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, border:'1px solid #ffffff33'
          }}>🌾</div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:18, letterSpacing:'-0.02em' }}>YONO-Oracle IIE</div>
            <div style={{ color:'#99f6e4', fontSize:12 }}>SBI GFF 2026 · Intelligent Insurance Engine</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {health && (
            <div style={{
              background:'#ffffff18', border:'1px solid #ffffff33', borderRadius:8,
              padding:'6px 12px', color:'#fff', fontSize:12, display:'flex', gap:10
            }}>
              <span>🟢 API Live</span>
              <span>📋 {health.policies} policies</span>
              <span>🔗 Chain {health.chain_valid ? '✓' : '✗'}</span>
            </div>
          )}
          <button onClick={reset} style={{
            background:'#ffffff22', border:'1px solid #ffffff44', borderRadius:8,
            color:'#fff', padding:'8px 16px', fontSize:13, fontWeight:600
          }}>+ New Demo</button>
        </div>
      </div>

      {/* Step Progress */}
      <div style={{
        background:'#fff', borderBottom:'1px solid #e2e8f0',
        padding:'0 24px', display:'flex', gap:0
      }}>
        {steps.map((s, i) => {
          const active = step === s.id;
          const done = completed(s.id);
          return (
            <div key={s.id} style={{
              display:'flex', alignItems:'center', padding:'14px 0',
              marginRight: i < steps.length - 1 ? 0 : 0,
            }}>
              <div style={{
                display:'flex', alignItems:'center', gap:8, padding:'8px 20px',
                borderBottom: active ? '3px solid #0f766e' : done ? '3px solid #16a34a' : '3px solid transparent',
                cursor: done ? 'pointer' : 'default',
              }} onClick={() => done ? setStep(s.id) : null}>
                <span style={{ fontSize:16 }}>{done ? '✅' : s.icon}</span>
                <span style={{
                  fontSize:13, fontWeight: active ? 700 : 500,
                  color: active ? '#0f766e' : done ? '#16a34a' : '#94a3b8'
                }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <span style={{ color:'#cbd5e1', fontSize:18, margin:'0 2px' }}>›</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>

        {error && (
          <div className="fade-in" style={{
            background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10,
            padding:'12px 16px', color:'#dc2626', marginBottom:16, fontSize:14
          }}>⚠️ {error}</div>
        )}

        {/* STEP 1: ENROLL */}
        {step === 'enroll' && (
          <div className="fade-in">
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>📋 Step 1 — Enroll Farmer</h2>
              <p style={{ color:'#64748b', fontSize:14 }}>DigiLocker KYC + PM-FASAL subsidy + Smart Contract deployment on-chain.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <Card>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Farmer Details</h3>
                {[['name','Farmer Name','text'],['aadhaar_last4','Aadhaar Last 4','text'],
                  ['district','District','text'],['state','State','text'],['acreage','Acreage (acres)','number']].map(([k,l,t]) => (
                  <div key={k} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'block', marginBottom:4 }}>{l}</label>
                    <input value={form[k as keyof typeof form]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                      type={t}
                      style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'9px 12px', fontSize:14, transition:'all 0.2s' }} />
                  </div>
                ))}
              </Card>
              <Card>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Crop &amp; Plan</h3>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'block', marginBottom:4 }}>Crop</label>
                  <select value={form.crop} onChange={e => setForm(f=>({...f,crop:e.target.value}))}
                    style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'9px 12px', fontSize:14 }}>
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'block', marginBottom:4 }}>Insurance Plan</label>
                  <select value={form.plan} onChange={e => setForm(f=>({...f,plan:e.target.value}))}
                    style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'9px 12px', fontSize:14 }}>
                    {PLANS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:12, color:'#16a34a', fontWeight:700, marginBottom:8 }}>📊 Premium Preview</div>
                  {form.plan === 'Basic Protect' && <><div style={{ fontSize:13, color:'#475569' }}>Premium: ₹2,800 | Coverage: ₹42,000</div><div style={{ fontSize:12, color:'#16a34a' }}>PM-FASAL subsidy: ₹840 → Net: ₹1,960</div></>}
                  {form.plan === 'Smart Shield' && <><div style={{ fontSize:13, color:'#475569' }}>Premium: ₹4,200 | Coverage: ₹70,000</div><div style={{ fontSize:12, color:'#16a34a' }}>PM-FASAL subsidy: ₹1,260 → Net: ₹2,940</div></>}
                  {form.plan === 'Full Season Pro' && <><div style={{ fontSize:13, color:'#475569' }}>Premium: ₹6,300 | Coverage: ₹1,22,500</div><div style={{ fontSize:12, color:'#16a34a' }}>PM-FASAL subsidy: ₹1,890 → Net: ₹4,410</div></>}
                </div>
              </Card>
            </div>
            <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
              <button onClick={doEnroll} disabled={loading} style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#0f766e,#059669)',
                color:'#fff', border:'none', borderRadius:10, padding:'13px 32px',
                fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:10,
                boxShadow:'0 4px 14px #0f766e44'
              }}>
                {loading && <Spinner />} {loading ? 'Enrolling…' : '🚀 Issue Policy & Deploy Contract'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFY */}
        {step === 'verify' && policy && (
          <div className="fade-in">
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>🛰️ Step 2 — Oracle Verification</h2>
              <p style={{ color:'#64748b', fontSize:14 }}>4 independent data sources · 4-agent AI quorum · ≥75% threshold.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <Card style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                <div style={{ fontSize:12, color:'#16a34a', fontWeight:700, marginBottom:12 }}>✅ POLICY ISSUED</div>
                <div style={{ fontSize:22, fontWeight:900, color:'#0f172a', fontFamily:'monospace', marginBottom:8 }}>
                  {policy.policy_id}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[['Coverage','₹'+policy.coverage_inr.toLocaleString()],
                    ['Net Premium','₹'+policy.net_premium_inr.toLocaleString()],
                    ['PM-FASAL Subsidy','₹'+policy.subsidy_applied.toLocaleString()],
                    ['Block',String(policy.block_deployed)]].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize:11, color:'#64748b' }}>{k}</div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:10, fontSize:11, color:'#64748b' }}>
                  Contract: <HashChip hash={policy.contract_address} />
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>
                  Tx: <HashChip hash={policy.deploy_tx} />
                </div>
              </Card>
              <Card>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Select Event Type</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {EVENTS.map(ev => (
                    <button key={ev} onClick={() => setForm(f=>({...f,event_type:ev}))}
                      style={{
                        border: `2px solid ${form.event_type === ev ? EVENT_COLORS[ev] : '#e2e8f0'}`,
                        background: form.event_type === ev ? `${EVENT_COLORS[ev]}15` : '#fff',
                        borderRadius:10, padding:'12px', cursor:'pointer',
                        transition:'all 0.18s'
                      }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>
                        {ev==='drought'?'🏙️':ev==='flood'?'🌊':ev==='heatwave'?'🔥':'🌀'}
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color: form.event_type===ev ? EVENT_COLORS[ev] : '#0f172a', textTransform:'capitalize' }}>{ev}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {verify && (
              <Card style={{ marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>🛰️ Oracle Data — 4 Sources</h3>
                <p style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>District: {verify.district} · {verify.oracle_data.fetched_at.slice(0,19).replace('T',' ')} UTC</p>
                <OracleSources sources={verify.oracle_data.sources} />
                <div style={{ marginTop:16 }}>
                  <h4 style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>🤖 4-Agent AI Quorum</h4>
                  <AgentVotes votes={verify.agent_quorum.votes} quorumMet={verify.agent_quorum.quorum_met} />
                  <div style={{
                    marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between',
                    background: verify.agent_quorum.quorum_met ? '#f0fdf4' : '#fef2f2',
                    border:`1px solid ${verify.agent_quorum.quorum_met?'#bbf7d0':'#fca5a5'}`,
                    borderRadius:10, padding:'10px 16px'
                  }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700 }}>Confidence: {verify.agent_quorum.confidence_pct}%</div>
                      <div style={{ fontSize:11, color:'#64748b' }}>{verify.agent_quorum.yes_count}/{verify.agent_quorum.total_agents} agents voted YES · Rule: {verify.agent_quorum.quorum_rule}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <StatusDot state={verify.contract_state} />
                      {verify.payout_amount && <div style={{ fontSize:13, fontWeight:700, color:'#16a34a', marginTop:2 }}>₹{verify.payout_amount.toLocaleString()} payout queued</div>}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={doVerify} disabled={loading} style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color:'#fff', border:'none', borderRadius:10, padding:'13px 28px',
                fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:10,
                boxShadow:'0 4px 14px #1d4ed844'
              }}>
                {loading && <Spinner />} {loading ? 'Running Oracle…' : '🛰️ Run Oracle + Agent Quorum'}
              </button>
              {verify && (
                <button onClick={() => setStep('execute')} style={{
                  background:'linear-gradient(135deg,#d97706,#b45309)', color:'#fff',
                  border:'none', borderRadius:10, padding:'13px 28px', fontSize:15, fontWeight:700
                }}>⚡ Next: Execute →</button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: EXECUTE */}
        {step === 'execute' && (
          <div className="fade-in">
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>⚡ Step 3 — Execute Contract</h2>
              <p style={{ color:'#64748b', fontSize:14 }}>State machine: TRIGGERED → EXECUTED · SHA-256 tx hash · IMPS credit · RRN generated.</p>
            </div>

            {verify && (
              <Card style={{ marginBottom:16, background:'#fffbeb', border:'1px solid #fde68a' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>Contract Ready for Execution</div>
                    <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>
                      Policy: <b>{verify.policy_id}</b> · Event: <Badge label={verify.event_type} color={EVENT_COLORS[verify.event_type]} /> · Confidence: <b>{verify.agent_quorum.confidence_pct}%</b>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <StatusDot state={verify.contract_state} />
                    {verify.payout_amount && <div style={{ fontSize:20, fontWeight:900, color:'#16a34a', marginTop:4 }}>₹{verify.payout_amount.toLocaleString()}</div>}
                  </div>
                </div>
              </Card>
            )}

            {execute && (
              <Card className="fade-in" style={{ marginBottom:16, background:'#f0fdf4', border:'1px solid #86efac' }}>
                <div style={{ fontSize:16, fontWeight:800, color:'#16a34a', marginBottom:12 }}>✅ Payout Executed</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[['Payout','₹'+execute.payout_inr.toLocaleString(),'#16a34a'],
                    ['Method',execute.method,'#0369a1'],
                    ['Farmer',execute.farmer,'#0f172a'],
                    ['UPI Ref',execute.upi_ref,'#7c3aed'],
                    ['RRN',execute.rrn,'#0f766e'],
                    ['Block',String(execute.block_number),'#b45309']].map(([k,v,c]) => (
                    <div key={k} style={{ background:'#fff', borderRadius:8, padding:'10px 12px', border:'1px solid #dcfce7' }}>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:c as string }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, color:'#64748b', marginBottom:3 }}>Tx Hash</div>
                  <HashChip hash={execute.tx_hash} />
                </div>
                <div style={{
                  marginTop:12, background:'#fff', border:'1px solid #dcfce7', borderRadius:10,
                  padding:'12px 14px'
                }}>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:600, marginBottom:4 }}>📱 SMS Sent</div>
                  <div style={{ fontSize:12, color:'#0f172a', lineHeight:1.6 }}>{execute.sms_sent}</div>
                </div>
              </Card>
            )}

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              {!execute && (
                <button onClick={doExecute} disabled={loading} style={{
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg,#059669,#16a34a)',
                  color:'#fff', border:'none', borderRadius:10, padding:'13px 32px',
                  fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:10,
                  boxShadow:'0 4px 14px #16a34a44'
                }}>
                  {loading && <Spinner />} {loading ? 'Executing…' : '⚡ Execute Smart Contract + IMPS Payout'}
                </button>
              )}
              {execute && (
                <button onClick={() => { doAudit(); }} disabled={loading} style={{
                  background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff',
                  border:'none', borderRadius:10, padding:'13px 28px', fontSize:15, fontWeight:700,
                  display:'flex', alignItems:'center', gap:10
                }}>
                  {loading && <Spinner />} 🔗 View Audit Chain →
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: AUDIT */}
        {step === 'audit' && (
          <div className="fade-in">
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>🔗 Step 4 — Tamper-Evident Audit Chain</h2>
              <p style={{ color:'#64748b', fontSize:14 }}>SHA-256 chained ledger. Each entry&apos;s prev_hash must match predecessor — verified in realtime.</p>
            </div>

            {audit && (
              <Card style={{ marginBottom:16 }}>
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  marginBottom:16, flexWrap:'wrap', gap:10
                }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800 }}>Audit Ledger</div>
                    <div style={{ fontSize:13, color:'#64748b' }}>{audit.total_entries} entries · SHA-256 chained</div>
                  </div>
                  <Badge label={audit.chain_valid ? '✓ Chain Valid' : '⚠ Chain Broken'} color={audit.chain_valid ? '#16a34a' : '#dc2626'} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {audit.ledger.slice().reverse().map((entry) => (
                    <div key={entry.seq} style={{
                      border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 14px',
                      background: entry.event.includes('EXECUTED') ? '#f0fdf4' :
                        entry.event.includes('TRIGGERED') ? '#fffbeb' : '#f8fafc'
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, flexWrap:'wrap', gap:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontWeight:700, color:'#94a3b8', fontSize:12 }}>#{entry.seq}</span>
                          <Badge label={entry.event}
                            color={entry.event.includes('EXECUTED') ? '#16a34a' :
                              entry.event.includes('TRIGGERED') ? '#d97706' : '#0f766e'} />
                          <span style={{ fontSize:12, color:'#94a3b8' }}>{entry.policy_id}</span>
                        </div>
                        <span style={{ fontSize:11, color:'#94a3b8' }}>{entry.ts.slice(0,19).replace('T',' ')} UTC</span>
                      </div>
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        <div><span style={{ fontSize:10, color:'#94a3b8' }}>HASH </span><HashChip hash={entry.hash} /></div>
                        <div><span style={{ fontSize:10, color:'#94a3b8' }}>PREV </span><HashChip hash={entry.prev_hash} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!audit && (
              <div style={{ textAlign:'center', padding:40 }}>
                <button onClick={doAudit} disabled={loading} style={{
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  color:'#fff', border:'none', borderRadius:10, padding:'13px 32px',
                  fontSize:15, fontWeight:700, display:'inline-flex', alignItems:'center', gap:10
                }}>
                  {loading && <Spinner />} 🔗 Fetch Audit Chain
                </button>
              </div>
            )}

            {audit && (
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={doML} disabled={loading} style={{
                  background:'linear-gradient(135deg,#0369a1,#0284c7)', color:'#fff',
                  border:'none', borderRadius:10, padding:'13px 28px', fontSize:15, fontWeight:700,
                  display:'flex', alignItems:'center', gap:10
                }}>
                  {loading && <Spinner />} 🤖 ML Predictor →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: ML */}
        {step === 'ml' && (
          <div className="fade-in">
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>🤖 Step 5 — ML Risk Predictor</h2>
              <p style={{ color:'#64748b', fontSize:14 }}>Weighted decision tree · NDVI 40% + Temp 25% + Rainfall 25% + Soil 10% · FAO/ISRO thresholds.</p>
            </div>

            {ml && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Card>
                  <div style={{ textAlign:'center', padding:'20px 0 16px' }}>
                    <div style={{ fontSize:64, fontWeight:900, color: RISK_COLORS[ml.risk_level] ?? '#0f172a', lineHeight:1 }}>
                      {ml.risk_score.toFixed(1)}
                    </div>
                    <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>/ 100.0 risk score</div>
                    <Badge label={ml.risk_level} color={RISK_COLORS[ml.risk_level]} />
                    <div style={{ marginTop:8, fontSize:13, fontWeight:700,
                      color: ml.triggered ? '#16a34a' : '#64748b' }}>
                      {ml.triggered ? '✅ AUTO-PAYOUT TRIGGERED' : '🟡 Below threshold'}
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Confidence: {ml.confidence_pct}%</div>
                  </div>

                  <div style={{ marginTop:8 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#475569', marginBottom:10 }}>Component Scores</div>
                    <MLBar label="NDVI (NASA MODIS)" value={ml.component_scores.ndvi_score} max={40} />
                    <MLBar label="Temperature (ISRO)" value={ml.component_scores.temp_score} max={25} />
                    <MLBar label="Rainfall (IMD)" value={ml.component_scores.rain_score} max={25} />
                    <MLBar label="Soil Moisture (ICAR)" value={ml.component_scores.soil_score} max={10} />
                  </div>
                </Card>
                <Card>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>🚩 Risk Flags</div>
                  {ml.flags.length === 0 ? (
                    <div style={{ color:'#16a34a', fontSize:13 }}>✅ No risk flags detected</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {ml.flags.map((f,i) => (
                        <div key={i} style={{
                          background:'#fef2f2', border:'1px solid #fca5a5',
                          borderRadius:8, padding:'8px 12px', fontSize:12, color:'#7f1d1d'
                        }}>⚠️ {f}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop:16, padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:11, color:'#475569' }}>
                    <b>Model:</b> {ml.model}<br/>
                    <b style={{ marginTop:6, display:'block', color: ml.triggered?'#16a34a':'#64748b' }}>→ {ml.recommendation}</b>
                  </div>
                </Card>
              </div>
            )}

            {!ml && (
              <div style={{ textAlign:'center', padding:40 }}>
                <button onClick={doML} disabled={loading} style={{
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg,#0369a1,#0284c7)',
                  color:'#fff', border:'none', borderRadius:10, padding:'13px 32px',
                  fontSize:15, fontWeight:700, display:'inline-flex', alignItems:'center', gap:10
                }}>
                  {loading && <Spinner />} 🤖 Run ML Predictor
                </button>
              </div>
            )}

            {ml && (
              <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:12 }}>
                <button onClick={reset} style={{
                  background:'linear-gradient(135deg,#0f766e,#059669)', color:'#fff',
                  border:'none', borderRadius:10, padding:'13px 32px', fontSize:15, fontWeight:700,
                  boxShadow:'0 4px 14px #0f766e44'
                }}>🔄 Run Another Demo</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
