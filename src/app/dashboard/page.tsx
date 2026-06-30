'use client';

import { useMemo, useState } from 'react';

type Lang = 'en' | 'hi';
type TxStatus = 'SUCCESS' | 'PROCESSING' | 'FAILED';
type PolicyState = 'ACTIVE' | 'TRIGGERED' | 'EXECUTED';

type DistrictPoint = {
  district: string;
  state: string;
  score: number;
  x: number;
  y: number;
  event: string;
  farmers: number;
};

type AuditItem = {
  id: number;
  title: string;
  ts: string;
  hash: string;
  prev: string;
  accent: string;
};

type TxItem = {
  policyId: string;
  farmer: string;
  district: string;
  amount: number;
  method: string;
  rrn: string;
  status: TxStatus;
  ts: string;
};

const DISTRICTS: DistrictPoint[] = [
  { district: 'Barmer', state: 'Rajasthan', score: 91, x: 150, y: 135, event: 'Drought', farmers: 24300 },
  { district: 'Jodhpur', state: 'Rajasthan', score: 62, x: 175, y: 150, event: 'Heatwave', farmers: 19500 },
  { district: 'Latur', state: 'Maharashtra', score: 88, x: 230, y: 245, event: 'Heatwave', farmers: 16700 },
  { district: 'Nashik', state: 'Maharashtra', score: 71, x: 210, y: 220, event: 'Drought', farmers: 22100 },
  { district: 'Warangal', state: 'Telangana', score: 82, x: 305, y: 230, event: 'Drought', farmers: 18400 },
  { district: 'Khammam', state: 'Telangana', score: 67, x: 320, y: 250, event: 'Flood', farmers: 12200 },
  { district: 'Puri', state: 'Odisha', score: 79, x: 410, y: 220, event: 'Cyclone', farmers: 14600 },
  { district: 'Ludhiana', state: 'Punjab', score: 38, x: 195, y: 92, event: 'Flood', farmers: 11200 },
];

const AUDIT: AuditItem[] = [
  { id: 1, title: 'Policy enrolled', ts: '2026-06-30 09:40', hash: '9bf23c9e0a12ab7cfa42e1f441aa8b0b', prev: '00000000000000000000000000000000', accent: '#64ffda' },
  { id: 2, title: 'Oracle quorum triggered', ts: '2026-06-30 09:42', hash: 'cb01918a8b2e7ce103aaf8f6e5b02d1e', prev: '9bf23c9e0a12ab7cfa42e1f441aa8b0b', accent: '#e3b341' },
  { id: 3, title: 'Smart contract executed', ts: '2026-06-30 09:42', hash: '44c2fbc17f5e1b99d48f337b874281be', prev: 'cb01918a8b2e7ce103aaf8f6e5b02d1e', accent: '#82b1ff' },
  { id: 4, title: 'IMPS payout settled', ts: '2026-06-30 09:42', hash: 'd10c91c71182aa2b6c81db6eb0ab7aa1', prev: '44c2fbc17f5e1b99d48f337b874281be', accent: '#3fb950' },
];

const TXS: TxItem[] = [
  { policyId: 'SBI-IIE-00341', farmer: 'Ramesh Kumar', district: 'Barmer', amount: 48200, method: 'IMPS', rrn: '924819023741', status: 'SUCCESS', ts: '2026-06-30 09:42:18' },
  { policyId: 'SBI-IIE-00609', farmer: 'Kavitha Reddy', district: 'Adilabad', amount: 55000, method: 'UPI', rrn: '512930481726', status: 'SUCCESS', ts: '2026-06-30 09:55:10' },
  { policyId: 'SBI-IIE-00821', farmer: 'Priya Sharma', district: 'Jodhpur', amount: 22100, method: 'IMPS', rrn: '318294017483', status: 'PROCESSING', ts: '2026-06-30 10:12:44' },
  { policyId: 'SBI-IIE-00187', farmer: 'Meena Kumari', district: 'Nashik', amount: 28400, method: 'IMPS', rrn: '604817293048', status: 'PROCESSING', ts: '2026-06-30 10:21:00' },
];

const COPY = {
  en: {
    title: 'Operations Dashboard',
    subtitle: 'Live risk, contract state, audit chain, and IMPS settlements in one judge-ready screen.',
    dark: 'Dark',
    light: 'Light',
    hindi: 'हिंदी',
    english: 'English',
    riskMap: 'Risk map',
    stateMachine: 'State machine',
    auditTrail: 'SHA-256 audit timeline',
    transactions: 'IMPS transactions',
    kpi1: 'Districts monitored',
    kpi2: 'Triggered policies',
    kpi3: 'Settled today',
    kpi4: 'Avg settlement',
    farmers: 'farmers',
    currentState: 'Current policy state',
    active: 'ACTIVE',
    triggered: 'TRIGGERED',
    executed: 'EXECUTED',
    tablePolicy: 'Policy',
    tableFarmer: 'Farmer',
    tableDistrict: 'District',
    tableAmount: 'Amount',
    tableMethod: 'Method',
    tableRRN: 'RRN',
    tableStatus: 'Status',
  },
  hi: {
    title: 'ऑपरेशंस डैशबोर्ड',
    subtitle: 'जज-रेडी स्क्रीन पर लाइव जोखिम, कॉन्ट्रैक्ट स्टेट, ऑडिट चेन और IMPS सेटलमेंट।',
    dark: 'डार्क',
    light: 'लाइट',
    hindi: 'हिंदी',
    english: 'English',
    riskMap: 'रिस्क मैप',
    stateMachine: 'स्टेट मशीन',
    auditTrail: 'SHA-256 ऑडिट टाइमलाइन',
    transactions: 'IMPS ट्रांज़ैक्शन',
    kpi1: 'मॉनिटर किए गए ज़िले',
    kpi2: 'ट्रिगर हुई पॉलिसी',
    kpi3: 'आज सेटल्ड',
    kpi4: 'औसत सेटलमेंट',
    farmers: 'किसान',
    currentState: 'वर्तमान पॉलिसी स्टेट',
    active: 'ACTIVE',
    triggered: 'TRIGGERED',
    executed: 'EXECUTED',
    tablePolicy: 'पॉलिसी',
    tableFarmer: 'किसान',
    tableDistrict: 'ज़िला',
    tableAmount: 'राशि',
    tableMethod: 'मेथड',
    tableRRN: 'RRN',
    tableStatus: 'स्टेटस',
  },
} as const;

function shortHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

function statusColor(status: TxStatus) {
  if (status === 'SUCCESS') return '#3fb950';
  if (status === 'PROCESSING') return '#e3b341';
  return '#f85149';
}

function riskColor(score: number) {
  if (score >= 80) return '#f85149';
  if (score >= 60) return '#e3b341';
  if (score >= 40) return '#82b1ff';
  return '#3fb950';
}

export default function DashboardPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [dark, setDark] = useState(true);
  const [selected, setSelected] = useState(DISTRICTS[0]);
  const [policyState, setPolicyState] = useState<PolicyState>('TRIGGERED');
  const t = COPY[lang];

  const theme = useMemo(() => ({
    bg: dark ? '#030712' : '#f8fafc',
    panel: dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    panelStrong: dark ? '#0d1117' : '#ffffff',
    border: dark ? 'rgba(255,255,255,0.08)' : '#dbe4f0',
    text: dark ? '#e6edf3' : '#0f172a',
    sub: dark ? '#7d8590' : '#64748b',
    grid: dark ? 'rgba(100,255,218,0.06)' : 'rgba(26,35,126,0.08)',
  }), [dark]);

  const kpis = [
    { label: t.kpi1, value: '8', sub: 'NASA · IMD · ISRO · ICAR', color: '#64ffda' },
    { label: t.kpi2, value: '3', sub: 'Weighted quorum ≥75%', color: '#e3b341' },
    { label: t.kpi3, value: '₹1.53L', sub: 'IMPS + UPI', color: '#3fb950' },
    { label: t.kpi4, value: '<3s', sub: 'Edge + NPCI sim', color: '#82b1ff' },
  ];

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh' }}>
      <style>{`
        .dash-grid { display:grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
        .panel { border-radius: 20px; border: 1px solid ${theme.border}; background: ${theme.panel}; backdrop-filter: blur(18px); }
        .chip-btn { border-radius: 999px; padding: 8px 12px; border: 1px solid ${theme.border}; background: ${theme.panelStrong}; color: ${theme.text}; font-size: 12px; font-weight: 700; }
        .table-wrap { overflow-x: auto; }
        .audit-line::before { content:''; position:absolute; left: 15px; top: 28px; bottom: -18px; width: 2px; background: ${theme.border}; }
        @media (max-width: 1024px) {
          .col-12, .col-8, .col-7, .col-6, .col-5, .col-4 { grid-column: span 12 / span 12 !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px 40px' }}>
        <div className="panel" style={{ padding: 24, marginBottom: 18, background: dark ? 'linear-gradient(135deg,#0d1117,#0a0f1e,#0d1b4b)' : 'linear-gradient(135deg,#ffffff,#eef4ff,#eafaf7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64ffda', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>YONO-Oracle IIE</div>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>{t.title}</h1>
              <p style={{ marginTop: 8, color: theme.sub, maxWidth: 760, fontSize: 14 }}>{t.subtitle}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="chip-btn" onClick={() => setDark(v => !v)} aria-label="Toggle color mode">
                {dark ? `☾ ${t.dark}` : `☀ ${t.light}`}
              </button>
              <button className="chip-btn" onClick={() => setLang(v => (v === 'en' ? 'hi' : 'en'))} aria-label="Toggle Hindi">
                {lang === 'en' ? t.hindi : t.english}
              </button>
            </div>
          </div>
        </div>

        <div className="dash-grid" role="region" aria-label="Dashboard content">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="panel col-3" style={{ gridColumn: 'span 3 / span 3', padding: 18 }}>
              <div style={{ fontSize: 12, color: theme.sub, marginBottom: 10 }}>{kpi.label}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: theme.sub, marginTop: 6 }}>{kpi.sub}</div>
            </div>
          ))}

          <section className="panel col-7" style={{ gridColumn: 'span 7 / span 7', padding: 20 }} aria-labelledby="risk-map-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <h2 id="risk-map-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.riskMap}</h2>
                <div style={{ marginTop: 4, fontSize: 12, color: theme.sub }}>SVG India schematic · district dots scale with risk score</div>
              </div>
              <div style={{ fontSize: 12, color: theme.sub }}>{selected.district}, {selected.state} · {selected.score}/100</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(280px,1fr)', gap: 16 }}>
              <div style={{ borderRadius: 18, border: `1px solid ${theme.border}`, background: theme.panelStrong, padding: 10, overflow: 'hidden' }}>
                <svg viewBox="0 0 520 360" width="100%" height="100%" role="img" aria-label="Risk map of India districts">
                  <defs>
                    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={dark ? '#0d1117' : '#f8fbff'} />
                      <stop offset="100%" stopColor={dark ? '#111827' : '#eef6ff'} />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="520" height="360" fill="url(#bgGrad)" rx="18" />
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={`v-${i}`} x1={40 + i * 55} y1="20" x2={40 + i * 55} y2="340" stroke={theme.grid} strokeWidth="1" />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h-${i}`} x1="20" y1={40 + i * 60} x2="500" y2={40 + i * 60} stroke={theme.grid} strokeWidth="1" />
                  ))}

                  <path d="M140 70 L200 58 L250 78 L296 98 L338 130 L382 162 L396 212 L380 258 L336 292 L290 286 L255 256 L235 226 L200 214 L165 176 L150 140 Z" fill={dark ? '#132033' : '#dcecff'} stroke={dark ? '#29415f' : '#aac4e8'} strokeWidth="2" />
                  <path d="M248 286 L266 315 L288 330" fill="none" stroke={dark ? '#29415f' : '#aac4e8'} strokeWidth="2" />

                  {DISTRICTS.map((d) => {
                    const r = 6 + (d.score / 100) * 12;
                    const color = riskColor(d.score);
                    const active = selected.district === d.district;
                    return (
                      <g key={d.district} onClick={() => setSelected(d)} style={{ cursor: 'pointer' }}>
                        <circle cx={d.x} cy={d.y} r={r + 7} fill={`${color}22`} />
                        <circle cx={d.x} cy={d.y} r={r} fill={color} stroke={active ? '#ffffff' : `${color}aa`} strokeWidth={active ? 3 : 1.5} />
                        <text x={d.x + 12} y={d.y - 10} fill={theme.text} fontSize="11" fontWeight="700">{d.district}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="panel" style={{ padding: 16, background: theme.panelStrong }}>
                <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6 }}>{selected.state}</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{selected.district}</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: riskColor(selected.score), border: `1px solid ${riskColor(selected.score)}66`, background: `${riskColor(selected.score)}18` }}>
                    Risk {selected.score}/100
                  </span>
                  <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#82b1ff', border: '1px solid #82b1ff55', background: 'rgba(130,177,255,0.12)' }}>
                    {selected.event}
                  </span>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: theme.sub }}>Risk score</span>
                    <span style={{ fontWeight: 700 }}>{selected.score}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: dark ? '#1f2937' : '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: `${selected.score}%`, height: '100%', background: riskColor(selected.score), borderRadius: 999 }} />
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: theme.sub }}>{t.farmers}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.farmers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: theme.sub }}>Oracle set</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>NASA · IMD · ISRO · ICAR</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: theme.sub }}>Suggested action</div>
                    <div style={{ fontSize: 13, color: '#64ffda', fontWeight: 700 }}>Run verify → execute payout</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel col-5" style={{ gridColumn: 'span 5 / span 5', padding: 20 }} aria-labelledby="state-machine-title">
            <h2 id="state-machine-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.stateMachine}</h2>
            <div style={{ fontSize: 12, color: theme.sub, marginTop: 4, marginBottom: 14 }}>{t.currentState}: {policyState}</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['ACTIVE', 'TRIGGERED', 'EXECUTED'] as PolicyState[]).map((s) => (
                <button key={s} className="chip-btn" onClick={() => setPolicyState(s)} aria-pressed={policyState === s}>{s}</button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {(['ACTIVE', 'TRIGGERED', 'EXECUTED'] as PolicyState[]).map((s, i) => {
                const active = s === policyState || (policyState === 'EXECUTED' && s !== 'ACTIVE') || (policyState === 'TRIGGERED' && s === 'ACTIVE');
                const isCurrent = s === policyState;
                const color = s === 'ACTIVE' ? '#64ffda' : s === 'TRIGGERED' ? '#e3b341' : '#3fb950';
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ minWidth: 120, padding: '18px 12px', textAlign: 'center', borderRadius: 18, background: isCurrent ? `${color}18` : theme.panelStrong, border: `1px solid ${active ? color : theme.border}`, boxShadow: isCurrent ? `0 0 25px ${color}22` : 'none' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: active ? color : theme.sub, margin: '0 auto 10px' }} />
                      <div style={{ fontSize: 12, color: active ? color : theme.sub, fontWeight: 800 }}>{s}</div>
                    </div>
                    {i < 2 && <div style={{ width: 36, height: 3, borderRadius: 999, background: active ? color : theme.border }} />}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 18, borderRadius: 14, padding: 14, background: theme.panelStrong, border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>Transition rule</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                ACTIVE → TRIGGERED when weighted quorum ≥ 75%; TRIGGERED → EXECUTED after smart contract call and IMPS settlement confirmation.
              </div>
            </div>
          </section>

          <section className="panel col-6" style={{ gridColumn: 'span 6 / span 6', padding: 20 }} aria-labelledby="audit-title">
            <h2 id="audit-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.auditTrail}</h2>
            <div style={{ fontSize: 12, color: theme.sub, marginTop: 4, marginBottom: 16 }}>Each record points to the previous hash for tamper evidence.</div>

            <div style={{ display: 'grid', gap: 14 }}>
              {AUDIT.map((item, index) => (
                <div key={item.id} style={{ position: 'relative', paddingLeft: 38 }} className={index < AUDIT.length - 1 ? 'audit-line' : ''}>
                  <div style={{ position: 'absolute', left: 8, top: 4, width: 16, height: 16, borderRadius: '50%', background: item.accent, boxShadow: `0 0 0 4px ${item.accent}22` }} />
                  <div style={{ borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.panelStrong, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: theme.sub }}>{item.ts}</div>
                    </div>
                    <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                      <div style={{ fontSize: 11, color: theme.sub }}>hash: <span style={{ color: theme.text, fontFamily: 'monospace' }}>{shortHash(item.hash)}</span></div>
                      <div style={{ fontSize: 11, color: theme.sub }}>prev: <span style={{ color: theme.text, fontFamily: 'monospace' }}>{shortHash(item.prev)}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel col-6" style={{ gridColumn: 'span 6 / span 6', padding: 20 }} aria-labelledby="tx-title">
            <h2 id="tx-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.transactions}</h2>
            <div style={{ fontSize: 12, color: theme.sub, marginTop: 4, marginBottom: 16 }}>Latest IMPS / UPI payout confirmations.</div>

            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr>
                    {[t.tablePolicy, t.tableFarmer, t.tableDistrict, t.tableAmount, t.tableMethod, t.tableRRN, t.tableStatus].map((head) => (
                      <th key={head} style={{ textAlign: 'left', padding: '10px 8px', fontSize: 11, color: theme.sub, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${theme.border}` }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TXS.map((tx) => (
                    <tr key={`${tx.policyId}-${tx.rrn}`}>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}`, fontFamily: 'monospace', color: '#64ffda', fontSize: 12 }}>{tx.policyId}</td>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}`, fontWeight: 700 }}>{tx.farmer}</td>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}`, color: theme.sub }}>{tx.district}</td>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}`, color: '#3fb950', fontWeight: 800 }}>₹{tx.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}` }}>{tx.method}</td>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}`, fontFamily: 'monospace', fontSize: 12 }}>{tx.rrn}</td>
                      <td style={{ padding: '12px 8px', borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: statusColor(tx.status), background: `${statusColor(tx.status)}18`, border: `1px solid ${statusColor(tx.status)}55` }}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
