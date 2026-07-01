'use client';

import { useState } from 'react';
import Link from 'next/link';

const C = {
  bg:     '#060D1A',
  panel:  '#0C1829',
  border: 'rgba(246,139,31,0.14)',
  text:   '#F5F7FA',
  sub:    '#8FA3C0',
  orange: '#F68B1F',
  green:  '#3fb950',
  blue:   '#82b1ff',
  red:    '#f85149',
  teal:   '#64ffda',
  amber:  '#e3b341',
  purple: '#a78bfa',
};

type ApiState = 'idle' | 'loading' | 'success' | 'error';
interface ApiResult { state: ApiState; data: object | null; ms: number | null; }
function fresh(): ApiResult { return { state: 'idle', data: null, ms: null }; }

// ─────────────────────────────────────────────────────────────────
// JSON RENDERER
// ─────────────────────────────────────────────────────────────────
function JsonView({ data }: { data: object }) {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.7, fontFamily: 'monospace', color: C.teal, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {lines.map((line, i) => {
        const coloured = line
          .replace(/("[^"]+"):/g, '<k>$1</k>:')
          .replace(/: ("[^"]*")/g, ': <s>$1</s>')
          .replace(/: (\d+\.?\d*)/g, ': <n>$1</n>')
          .replace(/: (true|false)/g, ': <b>$1</b>');
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: coloured
            .replace(/<k>/g,  `<span style="color:${C.orange}">`).replace(/<\/k>/g, '</span>')
            .replace(/<s>/g,  `<span style="color:${C.teal}">`  ).replace(/<\/s>/g, '</span>')
            .replace(/<n>/g,  `<span style="color:${C.blue}">`  ).replace(/<\/n>/g, '</span>')
            .replace(/<b>/g,  `<span style="color:${C.purple}">`).replace(/<\/b>/g, '</span>') + '\n',
          }} />
        );
      })}
    </pre>
  );
}

// ─────────────────────────────────────────────────────────────────
// SEQUENCE DIAGRAM  (pure JSX, no SVG lib)
// ─────────────────────────────────────────────────────────────────
interface SeqStep {
  from:   string;
  to:     string;
  label:  string;
  note?:  string;
  color?: string;
  ret?:   boolean;   // true = return arrow (dashed)
}
interface SeqDiagramProps {
  actors: { id: string; label: string; color: string }[];
  steps:  SeqStep[];
}

function SeqDiagram({ actors, steps }: SeqDiagramProps) {
  const COL_W  = 140;
  const ROW_H  = 62;
  const HEAD_H = 52;
  const PAD    = 16;
  const totalW = actors.length * COL_W + PAD * 2;
  const totalH = HEAD_H + steps.length * ROW_H + PAD;

  const cx = (id: string) => {
    const idx = actors.findIndex(a => a.id === id);
    return PAD + idx * COL_W + COL_W / 2;
  };

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      width="100%"
      style={{ display: 'block', fontFamily: 'monospace', maxWidth: totalW }}
    >
      {/* actor boxes */}
      {actors.map(a => (
        <g key={a.id}>
          <rect x={cx(a.id) - 54} y={6} width={108} height={30} rx={8}
            fill={`${a.color}18`} stroke={a.color} strokeWidth={1} />
          <text x={cx(a.id)} y={26} textAnchor="middle" fontSize={10}
            fontWeight="bold" fill={a.color}>{a.label}</text>
          {/* lifeline */}
          <line x1={cx(a.id)} y1={36} x2={cx(a.id)} y2={HEAD_H + steps.length * ROW_H}
            stroke={`${a.color}40`} strokeWidth={1} strokeDasharray="4 3" />
        </g>
      ))}

      {/* sequence steps */}
      {steps.map((s, i) => {
        const y   = HEAD_H + i * ROW_H + ROW_H / 2;
        const x1  = cx(s.from);
        const x2  = cx(s.to);
        const col = s.color || C.sub;
        const dir = x2 > x1 ? 1 : -1;
        return (
          <g key={i}>
            {/* arrow line */}
            <line
              x1={x1} y1={y} x2={x2 - dir * 8} y2={y}
              stroke={col} strokeWidth={1.5}
              strokeDasharray={s.ret ? '5 3' : undefined}
            />
            {/* arrowhead */}
            <polygon
              points={`${x2},${y} ${x2 - dir * 10},${y - 5} ${x2 - dir * 10},${y + 5}`}
              fill={col}
            />
            {/* label */}
            <rect
              x={Math.min(x1, x2) + Math.abs(x2 - x1) / 2 - 58}
              y={y - 18}
              width={116} height={16} rx={4}
              fill="#060D1A" stroke={`${col}44`} strokeWidth={1}
            />
            <text
              x={Math.min(x1, x2) + Math.abs(x2 - x1) / 2}
              y={y - 6}
              textAnchor="middle" fontSize={8.5} fill={col} fontWeight="600"
            >{s.label}</text>
            {/* optional note */}
            {s.note && (
              <text x={Math.min(x1, x2) + Math.abs(x2 - x1) / 2} y={y + 14}
                textAnchor="middle" fontSize={8} fill={C.sub}>{s.note}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// ERROR HANDLING TABLE
// ─────────────────────────────────────────────────────────────────
interface ErrRow {
  code:    string;
  meaning: string;
  action:  string;
  retry:   string;
}
function ErrorTable({ rows, color }: { rows: ErrRow[]; color: string }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
      <thead>
        <tr style={{ background: '#0a1120' }}>
          {['HTTP / Error Code', 'Meaning', 'IIE Action', 'Retry Policy'].map(h => (
            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: C.sub, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
            <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: color, fontWeight: 700 }}>{r.code}</td>
            <td style={{ padding: '9px 12px', color: C.sub }}>{r.meaning}</td>
            <td style={{ padding: '9px 12px', color: C.text }}>{r.action}</td>
            <td style={{ padding: '9px 12px', color: C.amber, fontFamily: 'monospace', fontSize: 10 }}>{r.retry}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────
// INTEGRATION PLAN  (collapsible accordion per API)
// ─────────────────────────────────────────────────────────────────
interface IntegrationPlanProps {
  color:   string;
  diagram: SeqDiagramProps;
  errors:  ErrRow[];
  prodNotes: string[];
}
function IntegrationPlan({ color, diagram, errors, prodNotes }: IntegrationPlanProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {open ? '&#9660; ' : '&#9658; '} Production Integration Plan
        </span>
        <span style={{ fontSize: 10, color: C.sub }}>{open ? 'Collapse' : 'Expand sequence diagram + error handling'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 18px' }}>
          {/* Sequence diagram */}
          <div style={{ fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Sequence Diagram &mdash; Production Flow</div>
          <div style={{ background: '#070e1c', borderRadius: 12, border: `1px solid ${color}22`, padding: '14px 10px', marginBottom: 18, overflowX: 'auto' }}>
            <SeqDiagram actors={diagram.actors} steps={diagram.steps} />
          </div>
          {/* Production notes */}
          <div style={{ fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Production Wiring Notes</div>
          <ul style={{ margin: '0 0 18px', paddingLeft: 18 }}>
            {prodNotes.map((n, i) => (
              <li key={i} style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, marginBottom: 3 }}>{n}</li>
            ))}
          </ul>
          {/* Error table */}
          <div style={{ fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Error Handling &amp; Retry Logic</div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <ErrorTable rows={errors} color={color} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// API PANEL  (interactive mock call + integration plan)
// ─────────────────────────────────────────────────────────────────
interface ApiPanelProps {
  number:      string;
  title:       string;
  subtitle:    string;
  method:      string;
  endpoint:    string;
  mockUrl:     string;
  description: string;
  color:       string;
  icon:        string;
  sbiProduct:  string;
  payload:     object;
  result:      ApiResult;
  onCall:      () => void;
  plan:        IntegrationPlanProps;
}

function ApiPanel(p: ApiPanelProps) {
  const isLoading = p.result.state === 'loading';
  const isSuccess = p.result.state === 'success';
  const isError   = p.result.state === 'error';

  return (
    <div style={{ borderRadius: 20, border: `1px solid ${isSuccess ? p.color + '55' : isError ? C.red + '44' : C.border}`, background: isSuccess ? `${p.color}06` : C.panel, overflow: 'hidden', transition: 'all 0.2s', boxShadow: isSuccess ? `0 0 28px ${p.color}12` : 'none' }}>
      {/* Header */}
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}`, background: `${p.color}0a`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>{p.icon}</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: p.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>SBI API {p.number} &middot; {p.sbiProduct}</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: C.text }}>{p.title}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{p.subtitle}</div>
          </div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}33`, whiteSpace: 'nowrap', flexShrink: 0 }}>{p.method}</span>
      </div>

      {/* Body: description + mock call */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: '18px 20px', borderRight: `1px solid ${C.border}` }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub, lineHeight: 1.65 }}>{p.description}</p>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.sub, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Production endpoint</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.amber, background: '#0a1120', padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, wordBreak: 'break-all' }}>{p.endpoint}</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: C.sub, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sandbox mock route</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.teal, background: '#0a1120', padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}` }}>{p.mockUrl}</div>
          </div>
          <div style={{ fontSize: 10, color: C.sub, marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Request payload</div>
          <div style={{ background: '#0a1120', borderRadius: 10, border: `1px solid ${C.border}`, padding: '10px 14px', marginBottom: 16 }}>
            <JsonView data={p.payload} />
          </div>
          <button onClick={p.onCall} disabled={isLoading} style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: isLoading ? C.amber : `linear-gradient(135deg,${p.color},${p.color}cc)`, color: '#030712', fontSize: 13, fontWeight: 900, cursor: isLoading ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
            <style>{`@keyframes pulse-btn{0%,100%{opacity:1}50%{opacity:0.65}}`}</style>
            {isLoading ? '&#9203; Calling SBI API&hellip;' : `&#9658; Call ${p.title}`}
          </button>
        </div>
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Response</span>
            {p.result.ms !== null && <span style={{ color: C.green, fontSize: 10 }}>&#9889; {p.result.ms}ms</span>}
          </div>
          {p.result.state === 'idle' && (
            <div style={{ borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}`, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>&#127968;</div>
              <div style={{ fontSize: 11, color: C.sub }}>Hit the button to fire the sandbox call</div>
            </div>
          )}
          {p.result.state === 'loading' && (
            <div style={{ borderRadius: 12, background: '#0a1120', border: `1px solid ${C.border}`, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.amber, fontFamily: 'monospace' }}>Awaiting response&hellip;</div>
            </div>
          )}
          {(isSuccess || isError) && p.result.data && (
            <div style={{ borderRadius: 12, background: '#0a1120', border: `1px solid ${isError ? C.red + '44' : p.color + '33'}`, padding: '14px 16px', maxHeight: 340, overflowY: 'auto' }}>
              <JsonView data={p.result.data} />
            </div>
          )}
        </div>
      </div>

      {/* Integration plan accordion */}
      <IntegrationPlan {...p.plan} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRODUCTION READINESS CHECKLIST
// ─────────────────────────────────────────────────────────────────
const CHECKLIST = [
  { item: 'SBI API credentials (client_id + client_secret) provisioned in AWS Secrets Manager',          done: false },
  { item: 'Mutual TLS (mTLS) certificate exchange with SBI API Gateway completed',                       done: false },
  { item: 'IP whitelist submitted to SBI: Vercel Edge IPs + NAT gateway static IPs',                     done: false },
  { item: 'YONO OAuth 2.0 redirect URI registered in SBI Developer Portal',                              done: false },
  { item: 'RBI Account Aggregator consent artefact signed and FIP onboarding complete',                  done: false },
  { item: 'SBI Payment Gateway merchant ID (MID) issued and settlement account linked',                  done: false },
  { item: 'NPCI CIB transaction limit set: Rs 2,00,000 per policy per event',                            done: false },
  { item: 'SBI Credit Assessment API MOU signed; CIBIL bureau data access approved',                     done: false },
  { item: 'End-to-end UAT on SBI sandbox environment with test farmer profiles',                         done: false },
  { item: 'IRDAI product filing for parametric trigger clause approved',                                 done: false },
  { item: 'Penetration test + VAPT report submitted to SBI CISO',                                        done: false },
  { item: 'Disaster recovery runbook tested: fallback to NaiveBayes oracle if YONO API > 2s latency',    done: true  },
  { item: 'Sandbox mock routes (this page) passing 100% contract tests',                                 done: true  },
  { item: 'API request/response schema frozen and versioned in GitHub',                                  done: true  },
];

function ReadinessChecklist() {
  const done = CHECKLIST.filter(c => c.done).length;
  return (
    <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px', marginTop: 22 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 900 }}>Production Readiness Checklist</h2>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: C.sub }}>
        {done} of {CHECKLIST.length} items complete &mdash; remaining items unblock the moment SBI API credentials are provisioned.
      </p>
      <div style={{ height: 6, borderRadius: 3, background: '#1e293b', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg,${C.orange},${C.amber})`, width: `${(done / CHECKLIST.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {CHECKLIST.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', borderRadius: 10, background: c.done ? `${C.green}08` : '#0a1120', border: `1px solid ${c.done ? C.green + '33' : C.border}` }}>
            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{c.done ? '\u2705' : '\u25a1'}</span>
            <span style={{ fontSize: 11, color: c.done ? C.green : C.sub, lineHeight: 1.55 }}>{c.item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// INTEGRATION PLAN DATA
// ─────────────────────────────────────────────────────────────────
const ACTORS_YONO   = [
  { id: 'farmer', label: 'YONO App',      color: C.blue   },
  { id: 'iie',    label: 'IIE Backend',   color: C.orange },
  { id: 'yono',   label: 'SBI YONO API',  color: C.amber  },
  { id: 'kyc',    label: 'CKYC Registry', color: C.purple },
];
const STEPS_YONO: SeqStep[] = [
  { from: 'farmer', to: 'iie',    label: 'Enroll — YONO token',    color: C.blue   },
  { from: 'iie',    to: 'yono',   label: 'POST /auth/introspect',   color: C.orange, note: 'mTLS + client_id' },
  { from: 'yono',   to: 'kyc',    label: 'Validate CKYC ref',      color: C.amber  },
  { from: 'kyc',    to: 'yono',   label: 'KYC level + status',     color: C.purple, ret: true },
  { from: 'yono',   to: 'iie',    label: '200 token_active:true',  color: C.amber,  ret: true, note: '< 80ms SLA' },
  { from: 'iie',    to: 'farmer', label: 'Enrollment confirmed',   color: C.orange, ret: true },
];

const ACTORS_AA = [
  { id: 'iie',  label: 'IIE Backend',  color: C.orange },
  { id: 'aa',   label: 'SBI AA FIP',   color: C.teal   },
  { id: 'npci', label: 'NPCI UPI Reg', color: C.blue   },
  { id: 'rbi',  label: 'RBI AA Hub',   color: C.purple },
];
const STEPS_AA: SeqStep[] = [
  { from: 'iie',  to: 'rbi',  label: 'Verify consent artefact',  color: C.orange },
  { from: 'rbi',  to: 'aa',   label: 'Consent valid — fetch FI', color: C.purple },
  { from: 'iie',  to: 'aa',   label: 'POST /account/verify',     color: C.orange, note: 'accountNumber + ifsc' },
  { from: 'aa',   to: 'npci', label: 'VPA lookup',               color: C.teal   },
  { from: 'npci', to: 'aa',   label: 'VPA registered + active',  color: C.blue,   ret: true },
  { from: 'aa',   to: 'iie',  label: '200 account_active:true',  color: C.teal,   ret: true, note: '< 120ms SLA' },
];

const ACTORS_PAY = [
  { id: 'sc',   label: 'Smart Contract', color: C.amber  },
  { id: 'iie',  label: 'IIE Backend',    color: C.orange },
  { id: 'pgw',  label: 'SBI PGW',        color: C.green  },
  { id: 'npci', label: 'NPCI IMPS',      color: C.blue   },
  { id: 'dst',  label: 'Farmer Bank',    color: C.teal   },
];
const STEPS_PAY: SeqStep[] = [
  { from: 'sc',   to: 'iie',  label: 'quorumApproved event',      color: C.amber  },
  { from: 'iie',  to: 'pgw',  label: 'POST /imps/initiate',       color: C.orange, note: 'MID + amount + VPA' },
  { from: 'pgw',  to: 'npci', label: 'IMPS credit transfer',      color: C.green  },
  { from: 'npci', to: 'dst',  label: 'Credit to farmer account',  color: C.blue   },
  { from: 'dst',  to: 'npci', label: 'ACK',                       color: C.teal,   ret: true },
  { from: 'npci', to: 'pgw',  label: 'RRN + UTR',                 color: C.blue,   ret: true },
  { from: 'pgw',  to: 'iie',  label: '200 status:SETTLED',        color: C.green,  ret: true, note: '< 3s SLA' },
  { from: 'iie',  to: 'sc',   label: 'Anchor RRN on Fabric',      color: C.orange, ret: true },
];

const ACTORS_CREDIT = [
  { id: 'iie',   label: 'IIE Backend',   color: C.orange },
  { id: 'ca',    label: 'SBI Credit API',color: C.purple },
  { id: 'cibil', label: 'CIBIL Bureau',  color: C.blue   },
  { id: 'kcc',   label: 'SBI KCC Core',  color: C.amber  },
];
const STEPS_CREDIT: SeqStep[] = [
  { from: 'iie',   to: 'ca',    label: 'POST /farmer-assess',      color: C.orange, note: 'customerId + aadhaarHash' },
  { from: 'ca',    to: 'cibil', label: 'Bureau pre-screen',        color: C.purple },
  { from: 'cibil', to: 'ca',    label: 'Score + DPD history',      color: C.blue,   ret: true },
  { from: 'ca',    to: 'kcc',   label: 'Check KCC utilisation',    color: C.purple },
  { from: 'kcc',   to: 'ca',    label: 'Available headroom',       color: C.amber,  ret: true },
  { from: 'ca',    to: 'iie',   label: '200 eligible:true +limit', color: C.purple, ret: true, note: '< 200ms SLA' },
];

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function SbiApisPage() {
  const [yono,   setYono]   = useState<ApiResult>(fresh());
  const [acct,   setAcct]   = useState<ApiResult>(fresh());
  const [pay,    setPay]    = useState<ApiResult>(fresh());
  const [credit, setCredit] = useState<ApiResult>(fresh());

  async function call(setter: (r: ApiResult) => void, url: string, body: object) {
    setter({ state: 'loading', data: null, ms: null });
    const t0 = Date.now();
    try {
      const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      setter({ state: res.ok ? 'success' : 'error', data, ms: Date.now() - t0 });
    } catch (e) {
      setter({ state: 'error', data: { error: String(e) }, ms: Date.now() - t0 });
    }
  }

  const APIS: ApiPanelProps[] = [
    {
      number:      '01',
      title:       'YONO Session Validation',
      subtitle:    'Verify a farmer\'s YONO session token before policy enrollment',
      method:      'POST',
      endpoint:    'https://yono.sbi.co.in/api/v2/auth/introspect',
      mockUrl:     '/api/sbi/yono-session',
      description: 'IIE calls the YONO OAuth 2.0 token-introspection endpoint at enrollment. This confirms the farmer is a genuine, KYC-verified SBI customer. The response surfaces YONO tier, full-KYC status, and session expiry. Without this call, a policy could be enrolled for a non-SBI customer.',
      color:       C.orange,
      icon:        '\ud83d\udcf2',
      sbiProduct:  'YONO Kisan API',
      payload:     { token: 'YONO-DEMO-TOKEN-IIE' },
      result:      yono,
      onCall:      () => call(setYono, '/api/sbi/yono-session', { token: 'YONO-DEMO-TOKEN-IIE' }),
      plan: {
        color: C.orange,
        diagram: { actors: ACTORS_YONO, steps: STEPS_YONO },
        prodNotes: [
          'Auth: OAuth 2.0 client_credentials flow. IIE Backend holds client_id and client_secret in AWS Secrets Manager (never in source code).',
          'Transport: mTLS enforced. IIE presents a client certificate issued by SBI PKI CA. Certificate pinned in the Next.js API route.',
          'Token TTL: YONO tokens expire in 30 minutes. IIE caches validated tokens in Redis with a 25-minute TTL to avoid redundant calls.',
          'The introspect endpoint returns aadhaar_ref (hash only, never plaintext) and kyc_level. IIE stores aadhaar_ref as a SHA-256 index.',
          'SBI Developer Portal: redirect_uri must be registered as https://iie.vercel.app/api/auth/callback/sbi before production go-live.',
        ],
        errors: [
          { code: '401 invalid_token',   meaning: 'Token expired or forged',         action: 'Re-prompt farmer to re-authenticate via YONO SSO',          retry: 'No retry — user action required' },
          { code: '403 scope_missing',   meaning: 'kisan_insurance scope not granted',action: 'Redirect farmer to YONO consent screen to re-grant scope',  retry: 'No retry — user action required' },
          { code: '429 rate_limit',      meaning: 'SBI API rate limit exceeded',      action: 'Queue request; exponential back-off starting at 500ms',     retry: '3 retries: 0.5s, 1s, 2s' },
          { code: '500 / 503',           meaning: 'SBI YONO API unavailable',         action: 'Serve cached token if < 25min old; else block enrollment',  retry: '3 retries: 1s, 3s, 10s — then fail safe' },
          { code: 'Network timeout',     meaning: 'No response within 2s',            action: 'Abort; log to Sentry; show "Please try again" to farmer',    retry: '2 retries at 1s each; fail after 6s total' },
        ],
      },
    },
    {
      number:      '02',
      title:       'Account Aggregator Verify',
      subtitle:    'Confirm bank account + UPI VPA before payout disbursement',
      method:      'POST',
      endpoint:    'https://fip.sbi.co.in/aa/v1/account/verify',
      mockUrl:     '/api/sbi/account-verify',
      description: 'Before firing an IMPS payout, IIE calls SBI\'s Account Aggregator FIP to verify the destination account is active and linked to the farmer\'s AA consent. The farmer consents once at enrollment; IIE uses the consent reference for every subsequent payout. This is the RBI Account Aggregator framework in production.',
      color:       C.teal,
      icon:        '\ud83c\udfe6',
      sbiProduct:  'Account Aggregator FIP',
      payload:     { accountNumber: '30041234567', ifsc: 'SBIN0004821' },
      result:      acct,
      onCall:      () => call(setAcct, '/api/sbi/account-verify', { accountNumber: '30041234567', ifsc: 'SBIN0004821' }),
      plan: {
        color: C.teal,
        diagram: { actors: ACTORS_AA, steps: STEPS_AA },
        prodNotes: [
          'RBI AA Framework: IIE is an FIU (Financial Information User). SBI FIP is the data provider. Consent artefact is created at enrollment and stored on-chain.',
          'Consent artefact contains: consentId, purpose (insurance_payout), fiTypes (DEPOSIT), dateTimeRange. Signed with IIE\'s RSA-2048 private key.',
          'UPI VPA verification: the FIP calls NPCI\'s VPA Lookup API internally. IIE does not make a separate NPCI call — the FIP response includes vpa_active boolean.',
          'IFSC validation: cross-checked against RBI\'s IFSC master list (updated monthly). Mismatched IFSCs are rejected before the AA call is made.',
          'AA Hub route: SBI FIP is registered on Sahamati\'s AA Hub. IIE must register as an FIU on the same hub and pass technical certification.',
        ],
        errors: [
          { code: '404 account_not_found', meaning: 'Account number or IFSC invalid',       action: 'Flag policy for manual review; notify farmer via YONO notification',  retry: 'No retry — data error' },
          { code: '409 consent_expired',   meaning: 'AA consent artefact expired (> 1 year)',action: 'Re-initiate consent flow within YONO session',                        retry: 'No retry — consent refresh required' },
          { code: '422 vpa_inactive',      meaning: 'UPI VPA not registered or frozen',      action: 'Prompt farmer to update VPA via YONO; hold payout in escrow',         retry: 'Poll every 24h for up to 7 days' },
          { code: '429 rate_limit',        meaning: 'AA FIP throttled',                      action: 'Exponential back-off queue',                                          retry: '3 retries: 1s, 2s, 4s' },
          { code: '500 / 503',             meaning: 'SBI FIP unavailable',                   action: 'Hold payout; retry within 15 min window; alert ops team via PagerDuty',retry: 'Retry every 5min for 1hr' },
        ],
      },
    },
    {
      number:      '03',
      title:       'IMPS Payout Initiation',
      subtitle:    'SBI Payment Gateway — auto-disburse parametric payout via NPCI',
      method:      'POST',
      endpoint:    'https://api.onlinesbi.sbi/pgw/v2/imps/initiate',
      mockUrl:     '/api/sbi/payment',
      description: 'Once the 4-agent oracle quorum fires, the smart contract emits an event that IIE listens to. IIE calls SBI\'s IMPS channel via the SBI Corporate Internet Banking API. The response returns an RRN and UTR — the two identifiers NPCI and RBI use for settlement audit. Both are anchored to Hyperledger Fabric within 890ms.',
      color:       C.green,
      icon:        '\ud83d\udcb8',
      sbiProduct:  'SBI Payment Gateway',
      payload:     { policyId: 'SBI-IIE-00341', beneficiaryVpa: 'rameshkumar@sbi', amount: 48200, remarks: 'IIE Drought Payout Barmer 2026' },
      result:      pay,
      onCall:      () => call(setPay, '/api/sbi/payment', { policyId: 'SBI-IIE-00341', beneficiaryVpa: 'rameshkumar@sbi', amount: 48200, remarks: 'IIE Drought Payout Barmer 2026' }),
      plan: {
        color: C.green,
        diagram: { actors: ACTORS_PAY, steps: STEPS_PAY },
        prodNotes: [
          'Merchant ID (MID): SBI issues IIE a dedicated MID for the insurance payout use case. Transaction type: AGRI_INSURANCE_PAYOUT.',
          'Transaction limit: Rs 2,00,000 per IMPS transaction (NPCI limit). IIE\'s per-policy payout is capped at Rs 1,00,000 — well within limits.',
          'Idempotency: IIE sends a unique txnRef (policyId + quorumBlockHash) per initiate call. SBI PGW deduplicates on txnRef — prevents double payout.',
          'Reconciliation: IIE runs a nightly reconciliation job comparing Fabric anchor records vs SBI settlement MIS. Any UTR mismatch triggers a PagerDuty alert.',
          'Webhook: SBI PGW sends a signed webhook (HMAC-SHA256) to /api/webhooks/sbi-pgw when settlement status changes. IIE uses this to update policy state without polling.',
        ],
        errors: [
          { code: '400 invalid_vpa',       meaning: 'Beneficiary VPA malformed',          action: 'Reject; re-run AA Verify; hold payout',                                  retry: 'No retry — fix VPA first' },
          { code: '402 insufficient_funds',meaning: 'IIE settlement account low',          action: 'PagerDuty critical alert to finance; pause new payouts',                  retry: 'No retry — operational issue' },
          { code: '408 timeout',           meaning: 'NPCI IMPS timeout (> 30s)',           action: 'Mark payout as PENDING; query /status with txnRef after 60s',             retry: 'Status poll every 30s for 10min' },
          { code: '409 duplicate_txn',     meaning: 'txnRef already processed',            action: 'Fetch existing UTR from SBI; reconcile; no new payment sent',             retry: 'No retry — already settled' },
          { code: '503 pgw_unavailable',   meaning: 'SBI PGW scheduled maintenance',      action: 'Queue in Redis; retry when PGW health endpoint returns 200',              retry: 'Exponential: 30s, 1min, 5min, 15min' },
        ],
      },
    },
    {
      number:      '04',
      title:       'Credit Assessment',
      subtitle:    'Post-payout KCC top-up eligibility via SBI bureau pre-screen',
      method:      'POST',
      endpoint:    'https://api.sbi.co.in/credit/v1/farmer-assess',
      mockUrl:     '/api/sbi/credit-assessment',
      description: 'After a payout is settled, IIE calls SBI\'s Credit Assessment API (backed by CIBIL data) to check if the farmer qualifies for a KCC top-up. This turns a parametric insurance product into a full financial inclusion journey — insurance, then a top-up loan, all within the same YONO session. No other agri-insurtech does this today.',
      color:       C.purple,
      icon:        '\ud83d\udcca',
      sbiProduct:  'SBI Credit Assessment API',
      payload:     { customerId: 'SBI-CUST-84821', aadhaarHash: 'sha256:9bf23c9e0a12ab7c' },
      result:      credit,
      onCall:      () => call(setCredit, '/api/sbi/credit-assessment', { customerId: 'SBI-CUST-84821', aadhaarHash: 'sha256:9bf23c9e0a12ab7c' }),
      plan: {
        color: C.purple,
        diagram: { actors: ACTORS_CREDIT, steps: STEPS_CREDIT },
        prodNotes: [
          'CIBIL access: SBI holds the bureau relationship. IIE does not call CIBIL directly — it calls SBI\'s internal pre-screen wrapper, which IIE cannot replicate with any other bank.',
          'Aadhaar hash: IIE sends SHA-256(aadhaar_number) only. SBI maps this to the customer internally. IIE never touches plaintext Aadhaar at any point.',
          'MOU requirement: SBI\'s Credit Assessment API requires a signed MOU between IIE and SBI Retail Credit Division. This is a legal pre-requisite.',
          'DPDP consent: the credit assessment requires a separate DPDP consent item (purpose: kcc_topup_assessment). IIE collects this at enrollment alongside the insurance consent.',
          'KCC top-up is an offer, not a disbursement. The farmer must accept via YONO. Actual disbursement flows through SBI\'s retail loan origination system — IIE only triggers the eligibility check.',
        ],
        errors: [
          { code: '404 customer_not_found',meaning: 'customerId not in SBI retail core',     action: 'Do not offer KCC top-up; log for manual review',                     retry: 'No retry — data issue' },
          { code: '200 eligible:false',    meaning: 'Farmer does not qualify (low score)',   action: 'Suppress KCC offer; do not show rejection message in YONO',         retry: 'Re-assess at next payout event' },
          { code: '429 rate_limit',        meaning: 'SBI Credit API throttled',              action: 'Defer assessment to T+1; KCC offer shown next YONO session',        retry: 'Retry once after 24h' },
          { code: '500 bureau_timeout',    meaning: 'CIBIL bureau call timed out inside SBI',action: 'Suppress KCC offer silently; do not block insurance flow',          retry: 'Retry after 1hr' },
          { code: '503 api_unavailable',   meaning: 'SBI Credit Assessment API down',        action: 'Skip; insurance payout is independent and unaffected',              retry: 'Retry at next payout event (non-blocking)' },
        ],
      },
    },
  ];

  const allCalled = [yono, acct, pay, credit].every(r => r.state === 'success');

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 56px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 18px 0' }}>

        {/* ── SANDBOX BANNER ── */}
        <div style={{ borderRadius: 16, padding: '16px 22px', marginBottom: 22, background: `${C.amber}10`, border: `2px solid ${C.amber}`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>&#9888;</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: C.amber, marginBottom: 4 }}>
              Sandbox-Ready Integration Layer &mdash; Awaiting SBI API Credentials for Production Deployment
            </div>
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7 }}>
              All four SBI API integrations below are <strong style={{ color: C.text }}>fully implemented</strong> in code &mdash;
              request/response shapes match SBI production specs, error handling and retry logic are production-grade,
              and mTLS + OAuth 2.0 auth flows are wired. The only missing piece is live credentials
              (client_id, client_secret, MID, MOU sign-off) which SBI provisions after a formal partnership agreement.
              Expand any API panel below to view the full sequence diagram and error handling plan.
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ borderRadius: 24, padding: '34px 36px 26px', marginBottom: 22, background: 'linear-gradient(135deg,#060D1A,#0F1E36,#1a0d26)', border: `1px solid ${C.orange}33` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>SBI-Native Integration &middot; Not Just Any Bank</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 34, fontWeight: 900 }}>SBI API Command Center</h1>
          <p style={{ margin: '0 0 20px', color: C.sub, maxWidth: 820, fontSize: 14, lineHeight: 1.75 }}>
            IIE is built <em style={{ color: C.text }}>on top of SBI&rsquo;s own APIs</em> &mdash; not alongside them.
            Every enrollment, payout, and credit check flows through SBI&rsquo;s production endpoints.
            Hit the buttons below to fire sandbox calls against our Next.js route handlers that mirror the exact
            request/response shape of each SBI API. Expand each panel for the production sequence diagram.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'YONO Kisan API',        sub: 'Session token validation',  color: C.orange },
              { label: 'Account Aggregator',    sub: 'RBI AA Framework FIP',      color: C.teal   },
              { label: 'SBI Payment Gateway',   sub: 'IMPS/NPCI CIB channel',     color: C.green  },
              { label: 'Credit Assessment API', sub: 'CIBIL bureau pre-screen',   color: C.purple },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 12, padding: '8px 16px', background: `${s.color}10`, border: `1px solid ${s.color}33` }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: s.color }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── All-success banner ── */}
        {allCalled && (
          <div style={{ borderRadius: 16, padding: '14px 22px', marginBottom: 20, background: '#3fb95014', border: '1px solid #3fb95055', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>&#10003;</span>
            <div>
              <div style={{ fontWeight: 900, color: C.green, fontSize: 14 }}>All 4 sandbox APIs responded successfully</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>Enrollment &rarr; Payout &rarr; Credit journey demonstrated end-to-end. Awaiting production credentials to go live.</div>
            </div>
          </div>
        )}

        {/* ── API panels ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {APIS.map(api => <ApiPanel key={api.number} {...api} />)}
        </div>

        {/* ── Journey diagram ── */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: 26, marginTop: 22, marginBottom: 4 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>The SBI-Native Journey</h2>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: C.sub }}>Four SBI APIs form an unbroken chain from enrollment to financial inclusion &mdash; only possible because IIE runs inside the SBI ecosystem.</p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { step: '1', icon: '\ud83d\udcf2', label: 'YONO Session', sub: 'KYC gate',    color: C.orange },
              { step: '2', icon: '\ud83c\udfe6', label: 'AA Verify',    sub: 'Account gate',color: C.teal   },
              { step: '3', icon: '\ud83d\udcb8', label: 'IMPS Payout',  sub: 'Money moves', color: C.green  },
              { step: '4', icon: '\ud83d\udcca', label: 'KCC Top-Up',   sub: 'Credit offer',color: C.purple },
            ].map((item, i, arr) => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '14px 20px', borderRadius: 16, background: `${item.color}10`, border: `1px solid ${item.color}44`, minWidth: 110 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{item.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 36, height: 2, background: `linear-gradient(90deg,${item.color},${arr[i+1].color})`, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Readiness checklist ── */}
        <ReadinessChecklist />

        {/* ── Footer links ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
          <Link href="/dashboard"   style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.orange},${C.amber})`, color: '#030712', textDecoration: 'none' }}>Operations Dashboard</Link>
          <Link href="/agentic"     style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: '#fff', textDecoration: 'none' }}>Agentic AI</Link>
          <Link href="/india-stack" style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 800, fontSize: 13, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, textDecoration: 'none' }}>Compliance Center</Link>
        </div>

      </div>
    </div>
  );
}
