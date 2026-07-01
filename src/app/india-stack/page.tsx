'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:      '#060D1A',
  panel:   '#0C1829',
  border:  'rgba(246,139,31,0.14)',
  text:    '#F5F7FA',
  sub:     '#8FA3C0',
  orange:  '#F68B1F',
  green:   '#3fb950',
  blue:    '#82b1ff',
  purple:  '#e040fb',
  red:     '#f85149',
  teal:    '#64ffda',
  amber:   '#e3b341',
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA: field → act mapping (the core of the page)
// ─────────────────────────────────────────────────────────────────────────────
type Sensitivity = 'HIGH' | 'MEDIUM' | 'LOW';
type FieldMapping = {
  field:       string;
  icon:        string;
  value:       string;          // sample masked value
  act:         string;
  actShort:    string;
  provision:   string;
  treatment:   string;
  sensitivity: Sensitivity;
  color:       string;
  tag:         string;          // e.g. 'UIDAI', 'DPDP', 'RBI'
};

const FIELD_MAPPINGS: FieldMapping[] = [
  {
    field:       'Aadhaar Number',
    icon:        '🆔',
    value:       'XXXX-XXXX-4821',
    act:         'Aadhaar Act, 2016 + DPDP Act, 2023',
    actShort:    'UIDAI',
    provision:   'Section 29 — prohibition on publishing Aadhaar numbers in full',
    treatment:   'Partial masking compliant — stored as SHA-256 one-way hash only, first 8 digits suppressed',
    sensitivity: 'HIGH',
    color:       C.red,
    tag:         'UIDAI / MeitY',
  },
  {
    field:       'Farmer Name',
    icon:        '👤',
    value:       'R****h K****r',
    act:         'DPDP Act, 2023',
    actShort:    'DPDP',
    provision:   'Section 6 — explicit consent before processing personal data',
    treatment:   'Name tokenised post-enrollment; displayed masked in audit views; consent-receipted on Hyperledger Fabric',
    sensitivity: 'MEDIUM',
    color:       C.amber,
    tag:         'MeitY',
  },
  {
    field:       'Crop Location (GPS)',
    icon:        '📍',
    value:       'District: Barmer, RJ',
    act:         'DPDP Act, 2023 — Geospatial Data Policy',
    actShort:    'DPDP',
    provision:   'Section 8(3) — data minimisation; retain only what is necessary',
    treatment:   'Geospatial data coarsened to district level. Exact GPS coordinates not stored. Minimal retention: discarded after policy binding.',
    sensitivity: 'MEDIUM',
    color:       C.amber,
    tag:         'MeitY / DST',
  },
  {
    field:       'Land Parcel (Khasra)',
    icon:        '📜',
    value:       'KH-0482 — [discarded]',
    act:         'DPDP Act, 2023 · DigiLocker Act',
    actShort:    'DPDP',
    provision:   'Section 8(3) — purpose limitation; data deleted once purpose fulfilled',
    treatment:   'Fetched from DigiLocker via OAuth 2.0 · only acreage hash (SHA-256) retained · raw khasra discarded post-verification',
    sensitivity: 'MEDIUM',
    color:       C.amber,
    tag:         'MeitY',
  },
  {
    field:       'Payout Ledger (IMPS/UPI)',
    icon:        '💳',
    value:       'RRN: 924819023741',
    act:         'RBI IT Framework, 2011 + Payment & Settlement Systems Act, 2007',
    actShort:    'RBI',
    provision:   'Circular RBI/2021-22/112 — audit trail for all digital payment transactions',
    treatment:   'Audit trail active — every payout hashed and chained on Hyperledger Fabric. Retained 7 years per RBI mandate.',
    sensitivity: 'HIGH',
    color:       C.red,
    tag:         'RBI / NPCI',
  },
  {
    field:       'NPCI UTR Reference',
    icon:        '🏦',
    value:       'UTR: SBI26***8291',
    act:         'Payment & Settlement Systems Act, 2007',
    actShort:    'NPCI',
    provision:   'Section 10(2) — settlement finality; immutable transaction records',
    treatment:   'UTR stored immutably on Hyperledger Fabric. Accessible to IRDAI auditors and RBI inspectors via permissioned query.',
    sensitivity: 'HIGH',
    color:       C.red,
    tag:         'RBI / NPCI',
  },
  {
    field:       'Oracle Data (NDVI / Rainfall)',
    icon:        '🛰️',
    value:       'NDVI: 0.21 — Public API',
    act:         'National Data Governance Policy, 2022',
    actShort:    'MeitY',
    provision:   'Clause 4.1 — use of government datasets with attribution',
    treatment:   'All oracle sources (NASA MODIS, IMD, ISRO, ICAR) are public-domain government APIs. No PII. Attribution logged per fetch.',
    sensitivity: 'LOW',
    color:       C.green,
    tag:         'NASA / IMD / ISRO',
  },
  {
    field:       'Smart Contract State',
    icon:        '⛓️',
    value:       'Policy 0x3a9f…c12e',
    act:         'IRDAI (Insurance Electronic Marketplace) Guidelines, 2022',
    actShort:    'IRDAI',
    provision:   'Regulation 9 — immutable audit record for parametric policy triggers',
    treatment:   'Contract state transitions hashed with SHA-256 and linked in chain. IRDAI auditor key can query via Hyperledger Fabric permissioned API.',
    sensitivity: 'MEDIUM',
    color:       C.blue,
    tag:         'IRDAI',
  },
  {
    field:       'PM-FASAL Subsidy Eligibility',
    icon:        '🌾',
    value:       'Subsidy: 30% — PFMS ID',
    act:         'PMFBY Operational Guidelines 2023 + PFMS Act',
    actShort:    'AgriMin',
    provision:   'DBT mandate — direct benefit transfer via PFMS with Aadhaar-seeded bank accounts',
    treatment:   'Subsidy applied at enrollment via PFMS API. Aadhaar-bank linkage verified by NPCI mapper. Subsidy amount logged to DBT ledger.',
    sensitivity: 'LOW',
    color:       C.green,
    tag:         'Agri Ministry',
  },
];

const SENSITIVITY_COLOR: Record<Sensitivity, string> = {
  HIGH:   C.red,
  MEDIUM: C.amber,
  LOW:    C.green,
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG DATA
// ─────────────────────────────────────────────────────────────────────────────
type LogLevel = 'INFO' | 'WARN' | 'ACCESS' | 'SYSTEM';
interface LogEntry {
  ts:      string;
  level:   LogLevel;
  actor:   string;
  action:  string;
  ref:     string;
}

const LOG_LEVEL_COLOR: Record<LogLevel, string> = {
  ACCESS: C.orange,
  INFO:   C.teal,
  WARN:   C.amber,
  SYSTEM: C.blue,
};

const ACTORS = [
  'SBI Internal Audit',
  'IRDAI Inspector',
  'SBI Risk Desk',
  'NPCI Reconciliation',
  'SBI Internal Audit',
  'SBI Internal Audit',
  'DPDP Compliance Bot',
  'SBI Internal Audit',
];
const ACTIONS = [
  ['ACCESS', 'Record fetched — payout ledger (RRN: 924819023741)',           'REF-AUD-001'],
  ['INFO',   'Oracle quorum validated — Barmer district data verified',      'REF-ORC-014'],
  ['ACCESS', 'Record fetched — Aadhaar hash (masked) for policy SBI-IIE-00341', 'REF-AUD-002'],
  ['WARN',   'Rate-limit threshold 80% reached — MPIN attempts, Jodhpur',   'REF-SEC-007'],
  ['ACCESS', 'Record fetched — NPCI UTR SBI26***8291 settlement confirmed',  'REF-AUD-003'],
  ['SYSTEM', 'Hyperledger Fabric block #4821 finalised — 4 events anchored', 'REF-CHN-021'],
  ['ACCESS', 'Record fetched — smart contract state TRIGGERED → EXECUTED',   'REF-AUD-004'],
  ['INFO',   'DPDP consent token verified — Ramesh Kumar, Barmer',           'REF-DPD-008'],
  ['ACCESS', 'Record fetched — payout ledger (RRN: 512930481726)',           'REF-AUD-005'],
  ['SYSTEM', 'Oracle cache refreshed — NASA MODIS + IMD batch complete',     'REF-ORC-015'],
] as const;

function nowIST(): string {
  return new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST';
}

function makeEntry(i: number): LogEntry {
  const [level, action, ref] = ACTIONS[i % ACTIONS.length];
  return {
    ts:     nowIST(),
    level:  level as LogLevel,
    actor:  ACTORS[i % ACTORS.length],
    action,
    ref,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function AuditLog() {
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    Array.from({ length: 6 }, (_, i) => makeEntry(i))
  );
  const [paused, setPaused] = useState(false);
  const [counter, setCounter] = useState(6);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setCounter(c => {
        const next = c + 1;
        const entry = makeEntry(next);
        setEntries(prev => {
          const updated = [entry, ...prev];
          return updated.slice(0, 60); // keep max 60 lines
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${C.border}`, background: `${C.orange}0a`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: paused ? C.amber : C.green, boxShadow: paused ? 'none' : `0 0 10px ${C.green}` }} />
          <span style={{ fontWeight: 900, fontSize: 14, color: C.text }}>📝 Enterprise Audit Log</span>
          <span style={{ fontSize: 11, color: C.sub }}>— Hyperledger Fabric · Permissioned Read · Tamper-Evident</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setPaused(p => !p)}
            style={{ padding: '5px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', color: paused ? C.green : C.amber, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Column labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 64px 160px 1fr 130px', gap: 8, padding: '8px 22px', borderBottom: `1px solid ${C.border}`, background: '#0a1120' }}>
        {['TIMESTAMP', 'LEVEL', 'ACTOR', 'ACTION', 'REF'].map(h => (
          <div key={h} style={{ fontSize: 9, fontWeight: 800, color: C.sub, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
        ))}
      </div>

      {/* Scrolling log */}
      <div ref={scrollRef} style={{ height: 300, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
        {entries.map((e, i) => (
          <div
            key={`${e.ref}-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 64px 160px 1fr 130px',
              gap: 8,
              padding: '7px 22px',
              borderBottom: `1px solid ${C.border}40`,
              background: i === 0 ? `${LOG_LEVEL_COLOR[e.level]}08` : 'transparent',
              transition: 'background 0.5s',
              alignItems: 'center',
            }}
          >
            <span style={{ color: C.sub, fontSize: 10 }}>{e.ts}</span>
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
              background: `${LOG_LEVEL_COLOR[e.level]}18`,
              color: LOG_LEVEL_COLOR[e.level],
              border: `1px solid ${LOG_LEVEL_COLOR[e.level]}33`,
              textAlign: 'center',
            }}>{e.level}</span>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 11 }}>{e.actor}</span>
            <span style={{ color: C.sub }}>{e.action}</span>
            <span style={{ color: `${C.blue}99`, fontSize: 10 }}>{e.ref}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 22px', borderTop: `1px solid ${C.border}`, background: '#0a1120', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: C.sub }}>{entries.length} entries in view · Rotating buffer of 60 · Full ledger on Hyperledger Fabric</span>
        <span style={{ fontSize: 10, color: `${C.green}88` }}>⚡ Live stream {paused ? 'paused' : 'active'}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD-TO-ACT MAP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function FieldActMap() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {FIELD_MAPPINGS.map((f, i) => (
          <div
            key={i}
            onClick={() => setActive(active === i ? null : i)}
            style={{
              borderRadius: 16,
              border: `1px solid ${active === i ? f.color : C.border}`,
              background: active === i ? `${f.color}08` : C.panel,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {/* Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '32px 180px 1fr auto auto auto', gap: 12, alignItems: 'center', padding: '14px 18px' }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>

              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: active === i ? f.color : C.text }}>{f.field}</div>
                <div style={{ fontSize: 10, color: C.sub, fontFamily: 'monospace', marginTop: 2 }}>{f.value}</div>
              </div>

              <div style={{ fontSize: 12, color: C.sub }}>{f.act}</div>

              <span style={{
                fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                background: `${f.color}18`, color: f.color,
                border: `1px solid ${f.color}33`,
                whiteSpace: 'nowrap',
              }}>{f.tag}</span>

              <span style={{
                fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
                background: `${SENSITIVITY_COLOR[f.sensitivity]}18`,
                color: SENSITIVITY_COLOR[f.sensitivity],
                border: `1px solid ${SENSITIVITY_COLOR[f.sensitivity]}33`,
                whiteSpace: 'nowrap',
              }}>{f.sensitivity}</span>

              <span style={{ color: C.sub, fontSize: 12 }}>{active === i ? '▲' : '▼'}</span>
            </div>

            {/* Expanded detail */}
            {active === i && (
              <div style={{
                borderTop: `1px solid ${C.border}`,
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 16, padding: '16px 20px',
                background: `${f.color}05`,
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Legal Provision</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontWeight: 600 }}>{f.provision}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Data Treatment</div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{f.treatment}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSENT SIMULATOR (kept + styled)
// ─────────────────────────────────────────────────────────────────────────────
const CONSENT_ITEMS = [
  { id: 'c1', label: 'Aadhaar number (stored as SHA-256 hash only — never plaintext)', required: true,  icon: '🆔' },
  { id: 'c2', label: 'Name + district from UIDAI for policy issuance',                  required: true,  icon: '👤' },
  { id: 'c3', label: 'Land records (Khasra/Khatauni) via DigiLocker — discarded post-verification', required: true, icon: '📜' },
  { id: 'c4', label: 'PM-FASAL subsidy eligibility via PFMS lookup',                  required: false, icon: '🌾' },
  { id: 'c5', label: 'SMS/push notifications for oracle triggers and payouts',         required: false, icon: '📱' },
];

function ConsentSimulator() {
  const [consents,  setConsents]  = useState<Record<string, boolean>>({ c1: false, c2: false, c3: false, c4: false, c5: false });
  const [submitted, setSubmitted] = useState(false);
  const [txHash]                  = useState('0x' + Math.random().toString(16).slice(2, 12) + '...');

  const allRequired = CONSENT_ITEMS.filter(c => c.required).every(c => consents[c.id]);
  const toggle = (id: string) => !submitted && setConsents(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${C.border}`, background: `${C.teal}0a` }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: C.teal }}>🔒 Consent Flow Simulator — DPDP Act 2023, Section 6</div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>Explicit per-purpose consent before any data processing · Withdrawal available anytime via YONO Settings</div>
      </div>
      <div style={{ padding: 22 }}>
        {!submitted ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {CONSENT_ITEMS.map(item => (
                <div
                  key={item.id}
                  onClick={() => !item.required && toggle(item.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                    borderRadius: 14, cursor: item.required ? 'default' : 'pointer',
                    background: consents[item.id] ? `${C.teal}0a` : '#0a1120',
                    border: `1px solid ${consents[item.id] ? C.teal + '44' : C.border}`,
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${consents[item.id] ? C.teal : '#444'}`, background: consents[item.id] ? C.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                    {consents[item.id] && <span style={{ fontSize: 11, color: '#030712', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{item.icon}</span>
                      <span style={{ fontSize: 12, color: C.text }}>{item.label}</span>
                      {item.required && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#f8514922', color: C.red }}>Required</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConsents({ c1: true, c2: true, c3: true, c4: true, c5: true })} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#0a1120', color: C.text, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Accept All</button>
              <button onClick={() => allRequired && setSubmitted(true)} disabled={!allRequired} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: allRequired ? `linear-gradient(135deg,${C.teal},${C.green})` : '#0a1120', color: allRequired ? '#030712' : '#555', fontSize: 12, fontWeight: 800, cursor: allRequired ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>Submit Consent</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 900, color: C.teal, fontSize: 15, marginBottom: 4 }}>Consent Recorded On-Chain</div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 20 }}>DPDP Act 2023 · Consent ID: <span style={{ fontFamily: 'monospace', color: C.text }}>{txHash}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, textAlign: 'left' }}>
              {[['Timestamp', new Date().toISOString().replace('T',' ').slice(0,19)+' IST'], ['Basis','Explicit consent (Sec 6 DPDP)'], ['Stored','Hyperledger Fabric block'], ['Retention','7 years (RBI mandate)'], ['Withdrawal','YONO Settings > Data & Privacy'], ['Grievance','dpo@sbiyono.in']].map(([k,v]) => (
                <div key={k} style={{ borderRadius: 12, padding: 12, background: '#0a1120', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.text, fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setSubmitted(false); setConsents({ c1:false,c2:false,c3:false,c4:false,c5:false }); }} style={{ marginTop: 14, padding: '8px 20px', borderRadius: 12, border: `1px solid ${C.border}`, background: '#0a1120', color: C.sub, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Reset Simulator</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGULATORY BODIES PANEL
// ─────────────────────────────────────────────────────────────────────────────
const REG_BODIES = [
  { name: 'IRDAI',     full: 'Insurance Regulatory & Development Authority',  color: C.orange, icon: '🛡️', scope: 'Parametric policy design · Electronic marketplace guidelines · Audit access', status: 'Sandbox-ready' },
  { name: 'RBI',       full: 'Reserve Bank of India',                         color: C.red,    icon: '🏦', scope: 'IMPS / UPI settlement · IT Framework 2011 · 7-year audit retention',       status: 'Compliant' },
  { name: 'UIDAI',     full: 'Unique Identification Authority of India',       color: C.teal,   icon: '🆔', scope: 'Aadhaar eKYC OTP · Partial masking · SHA-256 hash storage only',           status: 'Compliant' },
  { name: 'MeitY',     full: 'Ministry of Electronics & IT',                  color: C.blue,   icon: '💻', scope: 'DPDP Act 2023 · DigiLocker OAuth 2.0 · Data localisation (India servers)',  status: 'Compliant' },
  { name: 'NPCI',      full: 'National Payments Corporation of India',         color: C.green,  icon: '💸', scope: 'UTR settlement finality · Batch IMPS · UPI VPA routing',                   status: 'Compliant' },
  { name: 'Agri Min',  full: 'Ministry of Agriculture & Farmers Welfare',     color: C.amber,  icon: '🌾', scope: 'PM-FASAL 2023-24 · PFMS DBT routing · Subsidy eligibility API',           status: 'Pilot-ready' },
];

function RegBodies() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
      {REG_BODIES.map(r => (
        <div key={r.name} style={{ borderRadius: 16, border: `1px solid ${r.color}33`, background: `${r.color}06`, padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{r.icon}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: r.color }}>{r.name}</div>
              <div style={{ fontSize: 10, color: C.sub, lineHeight: 1.3 }}>{r.full}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}44`, whiteSpace: 'nowrap' }}>{r.status}</div>
          </div>
          <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>{r.scope}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ComplianceCommandCenter() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 48px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 18px 0' }}>

        {/* ── Hero ── */}
        <div style={{ borderRadius: 24, padding: '36px 36px 28px', marginBottom: 22, background: 'linear-gradient(135deg,#060D1A,#0F1E36,#1a1a36)', border: `1px solid ${C.orange}30` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>India Stack · Regulatory Compliance</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 36, fontWeight: 900, lineHeight: 1.15 }}>Compliance Command Center</h1>
          <p style={{ margin: '0 0 20px', color: C.sub, maxWidth: 760, fontSize: 14, lineHeight: 1.7 }}>Every data field IIE touches is mapped to a specific Act, provision, and treatment. This page is the single source of truth for IRDAI inspectors, RBI auditors, and DPDP compliance officers.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '9 fields mapped', sub: 'to specific Acts',        color: C.orange },
              { label: '6 regulators',    sub: 'IRDAI · RBI · UIDAI · MeitY · NPCI · AgriMin', color: C.teal },
              { label: 'Live audit log',  sub: 'Hyperledger Fabric',      color: C.green },
              { label: 'DPDP compliant',  sub: 'Section 6 consent flow',  color: C.blue },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 14, padding: '10px 18px', background: `${s.color}10`, border: `1px solid ${s.color}33` }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: s.color }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Regulatory Bodies ── */}
        <div style={{ marginBottom: 6 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800, color: C.text }}>Regulatory Oversight Map</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>IIE is designed for direct audit access by each of these bodies.</p>
        </div>
        <RegBodies />

        {/* ── Field → Act Map ── */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: C.text }}>Data Field → Act Compliance Map</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>Click any row to expand the legal provision and data treatment. <span style={{ color: C.red }}>HIGH</span> = PII / financial. <span style={{ color: C.amber }}>MEDIUM</span> = pseudonymous. <span style={{ color: C.green }}>LOW</span> = public-domain.</p>
        </div>
        <FieldActMap />

        {/* ── Live Audit Log ── */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: C.text }}>Live Audit Log Stream</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>Every record access generates an immutable log entry on Hyperledger Fabric. SBI Internal Audit receives a read-only permissioned feed in real time.</p>
        </div>
        <AuditLog />

        {/* ── Consent Simulator ── */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: C.text }}>Interactive Consent Simulator</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.sub }}>Demonstrates the DPDP Act 2023 Section 6 consent flow a farmer sees inside YONO Kisan Insurance at enrollment.</p>
        </div>
        <ConsentSimulator />

        {/* ── DPDP / Privacy Grid ── */}
        <div style={{ borderRadius: 20, border: `1px solid ${C.red}33`, background: `${C.red}06`, padding: 24, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: C.red }}>Privacy & DPDP Compliance Summary</h2>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: C.sub }}>Four principles enforced by architecture, not policy.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
            {[
              ['Data Minimisation',    'Only Aadhaar hash (SHA-256) stored. Land records fetched and discarded post-verification. GPS coarsened to district. No UID, no biometrics retained.'],
              ['Consent Architecture', 'Granular per-purpose consent under Section 6, DPDP Act 2023. Logged on Hyperledger Fabric. Withdrawable anytime via YONO Settings › Data & Privacy.'],
              ['Data Localisation',    'All data on SBI-owned servers within India. No cross-border transfer. Compliant with IRDAI data localisation norms and RBI cloud framework.'],
              ['Retention Policy',     'NPCI UTR and UPI transaction refs retained 7 years per RBI mandate. Aadhaar hash retained for policy duration only. Oracle data not retained (public source).'],
            ].map(([title, desc]) => (
              <div key={title} style={{ borderRadius: 14, padding: '16px 18px', background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: C.red, marginBottom: 6 }}>{title}</div>
                <p style={{ margin: 0, fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer links ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/yono" style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: 'linear-gradient(135deg,#1a3a6b,#009999)', color: '#fff', textDecoration: 'none' }}>YONO App Simulator</Link>
          <Link href="/demo" style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: `linear-gradient(135deg,${C.teal},${C.green})`, color: '#030712', textDecoration: 'none' }}>Live Demo</Link>
          <Link href="/dashboard" style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 800, fontSize: 13, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, textDecoration: 'none' }}>Operations Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
