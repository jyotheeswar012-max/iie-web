'use client';
import { useState, useEffect, useCallback } from 'react';

type Decision = 'APPROVE' | 'REJECT' | 'FRAUD_REVIEW';
type ContractState = 'ACTIVE' | 'TRIGGERED' | 'FRAUD_REVIEW';

interface AgentResult {
  agent: string;
  role: string;
  model: string;
  weight: string;
  decision: Decision;
  confidence: number;
  reasoning: string[];
  fraud_flags?: string[];
  fraud_score?: number;
  risk_score?: number;
  z_scores?: Record<string, { value: number; threshold: number; flagged: boolean }>;
  checks?: Record<string, { pass: boolean; detail: string }>;
  features?: Record<string, number>;
}

interface OrchestrateResult {
  policy_id: string;
  district: string;
  event_type: string;
  crop: string;
  acreage: number;
  agents: AgentResult[];
  orchestrator: {
    quorum_confidence: number;
    quorum_met: boolean;
    quorum_rule: string;
    approve_count: number;
    total_agents: number;
    fraud_review: boolean;
    contract_state: ContractState;
    decision_rationale: string;
  };
  ts: string;
}

const DISTRICTS = ['Barmer','Jodhpur','Latur','Nashik','Warangal','Khammam','Puri','Ludhiana','Adilabad'];
const CROPS     = ['wheat','paddy','cotton','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
const EVENTS    = ['drought','flood','heatwave','cyclone'];

const AGENT_COLOR: Record<string, string> = {
  RiskAgent:   '#3b82f6',
  ClaimsAgent: '#10b981',
  FraudAgent:  '#f59e0b',
};
const AGENT_ICON: Record<string, string> = {
  RiskAgent:   '🛰️',
  ClaimsAgent: '📋',
  FraudAgent:  '🔍',
};
const DEC_COLOR: Record<string, string> = {
  APPROVE:      '#22c55e',
  REJECT:       '#ef4444',
  FRAUD_REVIEW: '#f59e0b',
};
const STATE_COLOR: Record<string, string> = {
  ACTIVE:       '#64748b',
  TRIGGERED:    '#22c55e',
  FRAUD_REVIEW: '#f59e0b',
};

function AnimBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 200); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ background: '#1e293b', borderRadius: 6, height: 10, overflow: 'hidden' }}>
      <div style={{ width: `${w}%`, background: `linear-gradient(90deg,${color}88,${color})`, height: 10, borderRadius: 6, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${color}55` }} />
    </div>
  );
}

function AgentCard({ a, idx, open, onToggle }: { a: AgentResult; idx: number; open: boolean; onToggle: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), idx * 250); return () => clearTimeout(t); }, [idx]);
  const col   = AGENT_COLOR[a.agent] || '#64ffda';
  const icon  = AGENT_ICON[a.agent]  || '🤖';
  const dcol  = DEC_COLOR[a.decision] || '#94a3b8';
  const isOk  = a.decision === 'APPROVE';
  const isFr  = a.decision === 'FRAUD_REVIEW';

  return (
    <div
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.4s ease, transform 0.4s ease',
        background: isFr ? 'rgba(245,158,11,0.06)' : isOk ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${dcol}44`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer' }}
      onClick={onToggle} role="button" tabIndex={0} aria-expanded={open}
      onKeyDown={e => e.key === 'Enter' && onToggle()}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 26 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: col }}>{a.agent}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{a.role}</div>
            <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{a.model}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: `${dcol}22`, border: `1px solid ${dcol}55`, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: dcol }}>
            {a.decision}
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Weight: {a.weight}</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#64748b' }}>Confidence</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: dcol }}>{a.confidence}%</span>
        </div>
        <AnimBar value={a.confidence} color={dcol} delay={idx * 250} />
      </div>

      {/* Extra metrics */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: open ? 12 : 0 }}>
        {a.risk_score !== undefined && (
          <span style={{ fontSize: 10, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '3px 8px', color: '#94a3b8' }}>
            Risk Score: <b style={{ color: '#f87171' }}>{a.risk_score}/100</b>
          </span>
        )}
        {a.fraud_score !== undefined && (
          <span style={{ fontSize: 10, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '3px 8px', color: '#94a3b8' }}>
            Fraud Score: <b style={{ color: a.fraud_score > 60 ? '#f59e0b' : '#22c55e' }}>{a.fraud_score}/100</b>
          </span>
        )}
        {a.z_scores && Object.entries(a.z_scores).map(([k, v]) => (
          <span key={k} style={{ fontSize: 10, background: '#0f172a', border: `1px solid ${v.flagged ? '#f59e0b44' : '#1e293b'}`, borderRadius: 6, padding: '3px 8px', color: v.flagged ? '#fbbf24' : '#64748b' }}>
            {k} z={v.value}σ {v.flagged ? '🚨' : '✅'}
          </span>
        ))}
      </div>

      {/* Fraud flags */}
      {a.fraud_flags && a.fraud_flags.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {a.fraud_flags.map((f, i) => (
            <div key={i} style={{ background: '#431407', border: '1px solid #92400e', borderRadius: 6, padding: '4px 9px', fontSize: 10, color: '#fbbf24', marginBottom: 4 }}>{f}</div>
          ))}
        </div>
      )}

      {/* Expandable deliberation */}
      {open && (
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 12, marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.05em' }}>DELIBERATION LOG</div>
          {a.reasoning.map((line, i) => (
            <div key={i} style={{ fontSize: 10, color: '#94a3b8', padding: '3px 0', borderBottom: i < a.reasoning.length - 1 ? '1px dashed #1e293b' : undefined, display: 'flex', gap: 6 }}>
              <span style={{ color: '#334155', minWidth: 16, fontFamily: 'monospace' }}>{i + 1}.</span>
              <span>{line}</span>
            </div>
          ))}
          {/* Checks */}
          {a.checks && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 5 }}>POLICY CHECKS</div>
              {Object.entries(a.checks).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 11 }}>{v.pass ? '✅' : '❌'}</span>
                  <span style={{ fontSize: 10, color: v.pass ? '#86efac' : '#fca5a5' }}><b>{k}:</b> {v.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ textAlign: 'right', marginTop: 6, fontSize: 9, color: '#334155' }}>{open ? '▲ collapse' : '▼ expand deliberation'}</div>
    </div>
  );
}

export default function AgentsPage() {
  const [form, setForm] = useState({ district: 'Barmer', event_type: 'drought', crop: 'wheat', acreage: '4.5' });
  const [result, setResult] = useState<OrchestrateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [opened,  setOpened]  = useState<Record<number, boolean>>({});
  const [elapsed, setElapsed] = useState(0);

  const runOrchestrate = useCallback(async () => {
    setLoading(true); setError(''); setResult(null); setOpened({});
    const start = Date.now();
    const tick = setInterval(() => setElapsed(Date.now() - start), 80);
    try {
      const r = await fetch('/api/agents/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, acreage: parseFloat(form.acreage), policy_id: `SBI-IIE-${String(Math.floor(Math.random()*90000+10000))}`}),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      clearInterval(tick);
      setLoading(false);
    }
  }, [form]);

  // Run on mount with default params
  useEffect(() => { runOrchestrate(); }, []); // eslint-disable-line

  const stateCol = result ? STATE_COLOR[result.orchestrator.contract_state] || '#64748b' : '#64748b';

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
        input,select { font-family: inherit; }
        input:focus,select:focus { outline: 2px solid #3b82f6; outline-offset: 2px; }
        @media(max-width:768px) { .agent-grid { grid-template-columns: 1fr !important; } .form-row { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Multi-Agent Orchestrator</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>🤖 AI Agent <span style={{ background: 'linear-gradient(90deg,#3b82f6,#10b981,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quorum</span></h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 13 }}>Three specialist agents vote with weighted confidence. Orchestrator aggregates into a binding decision.</p>
        </div>

        {/* Controls */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }} className="form-row">
            {([ ['district','District',DISTRICTS], ['event_type','Event',EVENTS], ['crop','Crop',CROPS] ] as [keyof typeof form, string, string[]][]).map(([k,l,opts]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase' }}>{l}</div>
                <select value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                  style={{ width: '100%', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: 12 }}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase' }}>Acreage</div>
              <input type="number" value={form.acreage} onChange={e => setForm(f => ({...f,acreage:e.target.value}))}
                style={{ width: '100%', background: '#030712', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: 12 }} />
            </div>
          </div>
          <button onClick={runOrchestrate} disabled={loading}
            style={{ background: loading ? '#1e293b' : 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: loading ? '#475569' : '#fff',
              border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? (
              <><span style={{ width:14,height:14,border:'2px solid #ffffff33',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} /> Running agents… ({(elapsed/1000).toFixed(1)}s)</>
            ) : '🚀 Run Orchestrator'}
          </button>
        </div>

        {error && <div style={{ background:'#2d0a0a',border:'1px solid #7f1d1d',borderRadius:10,padding:'10px 14px',color:'#fca5a5',marginBottom:16,fontSize:12 }}>⚠️ {error}</div>}

        {result && (
          <div className="fade-up">

            {/* Orchestrator verdict */}
            <div style={{ background: `${stateCol}11`, border: `2px solid ${stateCol}44`, borderRadius: 18, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orchestrator Verdict</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: stateCol }}>{result.orchestrator.contract_state}</span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: stateCol, display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, maxWidth: 480 }}>{result.orchestrator.decision_rationale}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: stateCol }}>{result.orchestrator.quorum_confidence}%</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Weighted Confidence</div>
                  </div>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#e2e8f0' }}>{result.orchestrator.approve_count}/{result.orchestrator.total_agents}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Agents Approved</div>
                  </div>
                </div>
              </div>
              {/* Quorum bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginBottom: 4 }}>
                  <span>Quorum threshold: 65%</span>
                  <span>{result.orchestrator.quorum_met ? '✅ Met' : '❌ Not met'}</span>
                </div>
                <div style={{ background: '#1e293b', borderRadius: 8, height: 12, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '65%', top: 0, bottom: 0, width: 2, background: '#475569', zIndex: 1 }} />
                  <div style={{ width: `${result.orchestrator.quorum_confidence}%`, background: `linear-gradient(90deg,${stateCol}88,${stateCol})`, height: 12, borderRadius: 8, transition: 'width 1.5s ease', boxShadow: `0 0 12px ${stateCol}66` }} />
                </div>
              </div>
            </div>

            {/* Agent cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }} className="agent-grid">
              {result.agents.map((a, i) => (
                <AgentCard key={a.agent} a={a} idx={i} open={!!opened[i]} onToggle={() => setOpened(o => ({...o,[i]:!o[i]}))} />
              ))}
            </div>

            {/* Weight breakdown */}
            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: '18px 22px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: '#94a3b8' }}>⚖️ Weight Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="agent-grid">
                {result.agents.map(a => {
                  const col = AGENT_COLOR[a.agent] || '#64ffda';
                  const dcol = DEC_COLOR[a.decision] || '#94a3b8';
                  const contribution = Math.round(parseFloat(a.weight) * a.confidence / 100);
                  return (
                    <div key={a.agent} style={{ background: '#030712', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{AGENT_ICON[a.agent]} {a.agent}</span>
                        <span style={{ fontSize: 10, color: '#475569' }}>×{a.weight}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: dcol }}>{a.confidence}% × {a.weight}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>= ~{contribution}pts weighted</div>
                      <AnimBar value={parseFloat(a.weight) * a.confidence} color={dcol} delay={200} />
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: '#475569', fontFamily: 'monospace', background: '#030712', padding: '8px 12px', borderRadius: 8 }}>
                {result.orchestrator.quorum_rule}
              </div>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <a href="/demo" style={{ background: 'linear-gradient(135deg,#065f46,#047857)', color: '#d1fae5', textDecoration: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 12, fontWeight: 700 }}>⚡ Full Demo →</a>
              <a href="/dashboard" style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)', color: '#dbeafe', textDecoration: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 12, fontWeight: 700 }}>📊 Dashboard →</a>
              <a href="/blockchain" style={{ background: 'linear-gradient(135deg,#4c1d95,#6d28d9)', color: '#ede9fe', textDecoration: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 12, fontWeight: 700 }}>🔗 Blockchain →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
