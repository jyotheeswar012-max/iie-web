'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────
const C = {
  bg:     '#060D1A',
  panel:  '#0C1829',
  border: 'rgba(246,139,31,0.14)',
  text:   '#F5F7FA',
  sub:    '#8FA3C0',
  orange: '#F68B1F',
  green:  '#3fb950',
  blue:   '#82b1ff',
  purple: '#a78bfa',
  red:    '#f85149',
  teal:   '#64ffda',
  amber:  '#e3b341',
};

// ─────────────────────────────────────────────────────────────────
// STEP DATA  (6 steps × ~30s each = ~3 min auto-play at 1×)
// ─────────────────────────────────────────────────────────────────
interface DemoStep {
  id:        number;
  icon:      string;
  label:     string;         // short pill label
  title:     string;
  subtitle:  string;
  color:     string;
  duration:  number;         // ms at 1× speed
  actor:     string;
  actorSub:  string;
  narrative: string;
  dataPanel: { key: string; value: string; highlight?: boolean }[];
  deepLink?: { label: string; href: string };
  gffCriteria: string;
}

const STEPS: DemoStep[] = [
  {
    id: 1,
    icon: '📱',
    label: 'YONO Open',
    title: 'Farmer opens YONO Kisan',
    subtitle: 'SBI YONO OAuth 2.0 session validated',
    color: C.blue,
    duration: 28000,
    actor: 'Ramesh Kumar, Barmer, Rajasthan',
    actorSub: 'Wheat farmer · 4.5 acres · KCC holder · SBI A/C ending 4821',
    narrative:
      'Ramesh opens YONO Kisan on his Jio phone. IIE calls SBI\'s YONO Session API to validate his OAuth 2.0 token. KYC is already complete — no paper, no branch visit. His Aadhaar is stored as a SHA-256 hash; his name is tokenised. The system confirms he is an active SBI KCC holder with a clean repayment record.',
    dataPanel: [
      { key: 'YONO Session API',       value: 'POST yono.sbi.co.in/api/v2/auth/introspect', highlight: true },
      { key: 'Session Status',          value: '✅  ACTIVE  · scope: kisan_insurance' },
      { key: 'KYC Level',               value: 'Full KYC (Aadhaar eKYC + CKYC)' },
      { key: 'Aadhaar Hash',            value: 'SHA-256: a3f9…d821  (plaintext never stored)' },
      { key: 'KCC Account',             value: 'SBI-KCC-00341  · ₹1,20,000 limit  · Active' },
      { key: 'YONO Response Time',      value: '43 ms' },
    ],
    deepLink: { label: 'SBI API Center →', href: '/sbi-apis' },
    gffCriteria: 'Customer Acquisition',
  },
  {
    id: 2,
    icon: '🤖',
    label: 'Agentic AI Offer',
    title: 'AI proactively offers crop insurance',
    subtitle: 'Agentic Risk Intelligence — acts before farmer asks',
    color: C.purple,
    duration: 30000,
    actor: 'IIE Agentic Risk Intelligence',
    actorSub: '4-oracle quorum · NDVI Sentinel + Rain Watcher + Thermal Guard + Soil Oracle',
    narrative:
      'IIE\'s agentic layer has been monitoring Barmer district for 72 hours. NDVI has dropped to 0.21 (severe stress threshold: 0.35). IMD forecasts < 8 mm rainfall in the next 10 days. The AI does not wait for Ramesh to search for insurance — it pushes a personalised offer directly to his YONO home screen 18 hours before the predicted drought window opens.',
    dataPanel: [
      { key: 'NDVI Score',              value: '0.21  ⚠️  (threshold: 0.35)', highlight: true },
      { key: 'Rainfall Forecast (10d)', value: '7.3 mm  ·  IMD District Alert' },
      { key: 'LST Anomaly',             value: '+6.2°C above seasonal baseline  ·  ISRO Bhuvan' },
      { key: 'Soil Moisture',           value: '11%  ·  ICAR sensor cluster' },
      { key: 'Risk Score',              value: '87 / 100  ·  CRITICAL' },
      { key: 'AI Action',               value: '📲  Push offer sent to YONO  · 18h before window', highlight: true },
      { key: 'Premium (net of subsidy)', value: '₹2,340  (₹3,340 - 30% PM-FASAL)' },
    ],
    deepLink: { label: 'Agentic AI Page →', href: '/agentic' },
    gffCriteria: 'Agentic AI',
  },
  {
    id: 3,
    icon: '🛰️',
    label: 'Oracle Quorum',
    title: 'Oracle quorum runs  — 4 agents vote',
    subtitle: '≥ 75% consensus required to trigger payout',
    color: C.teal,
    duration: 32000,
    actor: 'Oracle Quorum Engine',
    actorSub: 'NASA MODIS 30% · IMD Rainfall 25% · ISRO Bhuvan 25% · ICAR Sensors 20%',
    narrative:
      'Ramesh accepts the offer. Three weeks later, the drought window opens. IIE\'s oracle quorum automatically re-evaluates. All four sovereign government data sources confirm the event. Quorum score: 94% — far above the 75% trigger threshold. No human adjuster. No claim form. The smart contract receives the trigger signal.',
    dataPanel: [
      { key: 'NASA MODIS NDVI',         value: '0.18  ·  DROUGHT CONFIRMED  ✅', highlight: true },
      { key: 'IMD 30-day Rainfall',     value: '6.1 mm  ·  < 20mm threshold  ✅' },
      { key: 'ISRO Bhuvan LST',         value: '49.3°C  ·  > 45°C threshold  ✅' },
      { key: 'ICAR Soil Moisture',      value: '9%  ·  < 15% threshold  ✅' },
      { key: 'Quorum Score',            value: '94%  ·  TRIGGER APPROVED', highlight: true },
      { key: 'Consensus Time',          value: '1.2 seconds' },
      { key: 'Data Sources',            value: 'All public-domain sovereign APIs  ·  No PII' },
    ],
    deepLink: { label: 'Agent Quorum →', href: '/agents' },
    gffCriteria: 'Innovation & Technology',
  },
  {
    id: 4,
    icon: '⛓️',
    label: 'Smart Contract',
    title: 'Smart contract executes on Hyperledger Fabric',
    subtitle: 'IIEPolicy.sol state: TRIGGERED → EXECUTED',
    color: C.amber,
    duration: 28000,
    actor: 'IIEPolicy Smart Contract',
    actorSub: 'Hyperledger Fabric + Polygon Mumbai · SHA-256 audit chain',
    narrative:
      'The oracle quorum result is written to Hyperledger Fabric. The smart contract reads the quorum vote, confirms the trigger condition, and transitions state from TRIGGERED to EXECUTED. This generates an immutable audit record — IRDAI auditors can query this block with their permissioned key at any time. The contract then calls SBI\'s Payment Gateway API.',
    dataPanel: [
      { key: 'Contract Address',        value: '0x3a9f…c12e  ·  Polygon Mumbai' },
      { key: 'State Transition',        value: 'ENROLLED → TRIGGERED → EXECUTED', highlight: true },
      { key: 'Fabric Block',            value: '#4821  ·  Hash: 8f3a…d291' },
      { key: 'Payout Calculated',       value: '₹48,200  (4.5 acres × ₹10,711/acre drought rate)' },
      { key: 'IRDAI Audit Key',         value: 'Permissioned read granted  ·  Regulation 9', highlight: true },
      { key: 'Execution Time',          value: '890 ms' },
      { key: 'Gas (Polygon)',           value: '0.0012 MATIC  ≈  ₹0.09' },
    ],
    deepLink: { label: 'Blockchain Audit →', href: '/blockchain' },
    gffCriteria: 'Scalability & Sustainability',
  },
  {
    id: 5,
    icon: '💸',
    label: 'IMPS Payout',
    title: 'Payout hits Ramesh\'s UPI VPA in 2.8 seconds',
    subtitle: 'SBI Payment Gateway → NPCI CIB → IMPS settlement',
    color: C.green,
    duration: 30000,
    actor: 'SBI Payment Gateway',
    actorSub: 'api.onlinesbi.sbi/pgw/v2/imps/initiate  ·  NPCI CIB channel',
    narrative:
      'The smart contract calls SBI\'s Payment Gateway API. SBI routes ₹48,200 via NPCI\'s Corporate Internet Banking IMPS channel to Ramesh\'s UPI VPA (rameshkumar@sbi). The Reference Remittance Number (RRN) and UTR are generated, both anchored on Hyperledger Fabric. Total time from oracle trigger to settlement: 2.8 seconds. Compare: PMFBY average payout time is 47 days.',
    dataPanel: [
      { key: 'SBI Payment API',         value: 'POST api.onlinesbi.sbi/pgw/v2/imps/initiate', highlight: true },
      { key: 'Amount',                  value: '₹48,200  ·  Drought payout  ·  Policy SBI-IIE-00341' },
      { key: 'Beneficiary VPA',         value: 'rameshkumar@sbi' },
      { key: 'RRN',                     value: '924819023741  ✅  SETTLED', highlight: true },
      { key: 'UTR',                     value: 'SBI2607011823924819' },
      { key: 'Channel',                 value: 'NPCI CIB · IMPS' },
      { key: 'Settlement Time',         value: '2.8 seconds  (PMFBY avg: 47 days)', highlight: true },
    ],
    deepLink: { label: 'Payout Tracker →', href: '/payouts' },
    gffCriteria: 'Customer Experience',
  },
  {
    id: 6,
    icon: '📝',
    label: 'Audit + KCC',
    title: 'Audit trail recorded  ·  KCC top-up offered',
    subtitle: 'RBI 7-year retention  ·  SBI-exclusive credit upsell',
    color: C.orange,
    duration: 28000,
    actor: 'Hyperledger Fabric + SBI Credit Assessment API',
    actorSub: 'RBI IT Framework  ·  IRDAI Regulation 9  ·  DPDP Act 2023',
    narrative:
      'Every event in the journey — session, quorum, contract, payout — is chained on Hyperledger Fabric and retained for 7 years per RBI mandate. IRDAI and RBI auditors have permissioned read access. Simultaneously, IIE calls SBI\'s Credit Assessment API: the ₹48,200 payout improves Ramesh\'s creditworthiness signal. IIE offers him a KCC top-up of ₹40,000 — within the same YONO session. No other insurer can do this.',
    dataPanel: [
      { key: 'Fabric Events Anchored',  value: '6 events  ·  Block #4821–#4826' },
      { key: 'Audit Retention',         value: '7 years  ·  RBI IT Framework mandate', highlight: true },
      { key: 'IRDAI Access',            value: 'Permissioned key  ·  Regulation 9  ✅' },
      { key: 'DPDP Consent ID',         value: '0x7f2a…91bc  ·  On-chain  ·  Section 6' },
      { key: 'KCC Top-Up Offer',        value: '₹40,000  ·  SBI Credit Assessment API', highlight: true },
      { key: 'KCC API',                 value: 'POST api.sbi.co.in/credit/v1/farmer-assess' },
      { key: 'SBI Moat',                value: '⚡  Only SBI can do this — payout → credit in 1 session', highlight: true },
    ],
    deepLink: { label: 'Compliance Center →', href: '/india-stack' },
    gffCriteria: 'Compliance & Risk',
  },
];

// ─────────────────────────────────────────────────────────────────
// GFF SCORECARD DATA
// ─────────────────────────────────────────────────────────────────
interface ScorecardRow {
  criterion:   string;
  icon:        string;
  score:       number;   // out of 10
  color:       string;
  evidence:    string;
  deepLink:    { label: string; href: string };
}
const SCORECARD: ScorecardRow[] = [
  { criterion: 'Agentic AI',                icon: '🤖', score: 10, color: C.purple, evidence: '4-agent oracle quorum. AI proactively contacts farmer 18h before drought — not reactive. Passive vs Agentic 10-row table on /agentic.',                           deepLink: { label: '/agentic', href: '/agentic' } },
  { criterion: 'Customer Acquisition',      icon: '👤', score: 9,  color: C.blue,   evidence: 'YONO 100M+ install base = zero cold acquisition. SBI KCC holders auto-identified. 45% agri lending market share activated from day 1.',                          deepLink: { label: '/sbi-apis', href: '/sbi-apis' } },
  { criterion: 'Digital Adoption',          icon: '📱', score: 9,  color: C.teal,   evidence: 'Native YONO integration. Aadhaar eKYC, DigiLocker, UPI/IMPS. Zero new app installs. BC-point enrollment via tablet.',                                             deepLink: { label: '/demo', href: '/demo' } },
  { criterion: 'Innovation & Technology',   icon: '⚡', score: 10, color: C.amber,  evidence: '4-oracle sovereign data quorum (NASA+IMD+ISRO+ICAR). Hyperledger Fabric + Polygon hybrid chain. GradientBoosting + NaiveBayes ML. < 3s payout.',                deepLink: { label: '/agents', href: '/agents' } },
  { criterion: 'Scalability & Sustainability', icon: '🌱', score: 9, color: C.green, evidence: 'Vercel Edge: 100+ PoPs, < 50ms. MIT open-source. 500K farmer TAM. Polygon gas ≈ ₹0.09/contract. Zero new branch infrastructure.',                            deepLink: { label: '/architecture', href: '/architecture' } },
  { criterion: 'Compliance & Risk',         icon: '🛡️', score: 10, color: C.orange, evidence: '96% compliance score (27/28 checks). DPDP Act 2023 + RBI IT Framework + IRDAI Guidelines + Data Localisation. SHA-256 audit chain. 7-year retention.', deepLink: { label: '/india-stack', href: '/india-stack' } },
];

// ─────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────
function ProgressBar({ step, progress, total }: { step: number; progress: number; total: number }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Step pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => {
          const done    = i + 1 < step;
          const active  = i + 1 === step;
          const pending = i + 1 > step;
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              background: done ? `${C.green}18` : active ? `${s.color}18` : '#0a1120',
              border: `1px solid ${done ? C.green : active ? s.color : C.border}`,
              transition: 'all 0.3s',
              opacity: pending ? 0.45 : 1,
            }}>
              <span style={{ fontSize: 13 }}>{done ? '✅' : s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: done ? C.green : active ? s.color : C.sub }}>
                {s.label}
              </span>
            </div>
          );
        })}
        {step > total && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, background: `${C.orange}18`, border: `1px solid ${C.orange}` }}>
            <span style={{ fontSize: 13 }}>🏆</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.orange }}>Scorecard</span>
          </div>
        )}
      </div>

      {/* Bar */}
      <div style={{ height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: step > total ? `linear-gradient(90deg,${C.orange},${C.amber})` : `linear-gradient(90deg,${STEPS[Math.min(step - 1, STEPS.length - 1)].color},${C.green})`,
          width: step > total ? '100%' : `${((step - 1) / total + progress / total) * 100}%`,
          transition: 'width 0.4s linear',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: C.sub }}>{step > total ? 'Complete' : `Step ${step} of ${total}`}</span>
        <span style={{ fontSize: 10, color: C.sub }}>{step > total ? '100%' : `${Math.round(((step - 1) / total + progress / total) * 100)}%`}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP PANEL
// ─────────────────────────────────────────────────────────────────
function StepPanel({ step, progress }: { step: DemoStep; progress: number }) {
  const pct = Math.round(progress * 100);
  return (
    <div style={{ borderRadius: 24, border: `1px solid ${step.color}44`, background: C.panel, overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '22px 28px 16px', background: `${step.color}08`, borderBottom: `1px solid ${step.color}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>{step.icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: step.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
              Step {step.id} of {STEPS.length} · {step.gffCriteria}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text }}>{step.title}</h2>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{step.subtitle}</div>
          </div>
        </div>
        {/* Step timer bar */}
        <div style={{ height: 4, borderRadius: 2, background: '#1e293b', marginTop: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: step.color, width: `${pct}%`, transition: 'width 0.4s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 9, color: C.sub }}>
            {step.actor} · {step.actorSub}
          </span>
          <span style={{ fontSize: 9, color: step.color }}>{pct}%</span>
        </div>
      </div>

      {/* Content: narrative + data panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left: narrative */}
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>What is happening</div>
          <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.75 }}>{step.narrative}</p>
          {step.deepLink && (
            <Link href={step.deepLink.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 16px', borderRadius: 10, background: `${step.color}14`, border: `1px solid ${step.color}44`, color: step.color, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
              {step.deepLink.label}
            </Link>
          )}
        </div>

        {/* Right: data panel */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Live data</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {step.dataPanel.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, borderRadius: 10, padding: '8px 12px', background: row.highlight ? `${step.color}0e` : '#0a1120', border: `1px solid ${row.highlight ? step.color + '44' : C.border}` }}>
                <span style={{ fontSize: 10, color: C.sub, flexShrink: 0, width: 160 }}>{row.key}</span>
                <span style={{ fontSize: 10, fontWeight: row.highlight ? 800 : 500, color: row.highlight ? step.color : C.text, fontFamily: 'monospace', wordBreak: 'break-all' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SCORECARD
// ─────────────────────────────────────────────────────────────────
function JudgeScorecard() {
  const total = SCORECARD.reduce((s, r) => s + r.score, 0);
  const max   = SCORECARD.length * 10;
  return (
    <div>
      {/* Banner */}
      <div style={{ borderRadius: 24, padding: '32px 36px', marginBottom: 20, background: 'linear-gradient(135deg,#060D1A,#1a0f2e,#0f2a1a)', border: `1px solid ${C.orange}44`, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 900, color: C.orange }}>Judge Scorecard</h1>
        <p style={{ margin: '0 0 16px', color: C.sub, fontSize: 14 }}>Self-assessed against SBI GFF 2026 evaluation criteria · IIE end-to-end demo complete</p>
        {/* Overall score */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '16px 32px', borderRadius: 20, background: `${C.green}10`, border: `1px solid ${C.green}44` }}>
          <div>
            <div style={{ fontSize: 44, fontWeight: 900, color: C.green, lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 11, color: C.sub }}>out of {max}</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.green }}>Overall: {Math.round((total / max) * 100)}%</div>
            <div style={{ fontSize: 11, color: C.sub }}>Across {SCORECARD.length} GFF criteria</div>
          </div>
        </div>
      </div>

      {/* Criteria rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {SCORECARD.map((row) => (
          <div key={row.criterion} style={{ borderRadius: 18, border: `1px solid ${row.color}33`, background: `${row.color}06`, padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 26 }}>{row.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: row.color }}>{row.criterion}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 2, lineHeight: 1.55 }}>{row.evidence}</div>
              </div>
              {/* Score */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: row.color, lineHeight: 1 }}>{row.score}</div>
                <div style={{ fontSize: 9, color: C.sub }}>/ 10</div>
                <div style={{ width: 60, height: 5, borderRadius: 2, background: '#1e293b', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: row.color, width: `${row.score * 10}%` }} />
                </div>
              </div>
              <Link href={row.deepLink.href} style={{ padding: '7px 14px', borderRadius: 10, background: `${row.color}14`, border: `1px solid ${row.color}44`, color: row.color, fontSize: 10, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {row.deepLink.label} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: '🤖 Agentic AI',        href: '/agentic',     color: C.purple },
          { label: '🏦 SBI API Center',     href: '/sbi-apis',    color: C.orange },
          { label: '🛡️ Compliance Center',  href: '/india-stack', color: C.teal   },
          { label: '⛓️ Blockchain Audit',   href: '/blockchain',  color: C.amber  },
          { label: '💸 Payout Tracker',     href: '/payouts',     color: C.green  },
          { label: '📊 Impact Metrics',     href: '/impact',      color: C.blue   },
        ].map(b => (
          <Link key={b.href} href={b.href} style={{ padding: '10px 20px', borderRadius: 12, background: `${b.color}12`, border: `1px solid ${b.color}44`, color: b.color, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
            {b.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
const SPEEDS = [0.5, 1, 2] as const;
type Speed = typeof SPEEDS[number];

export default function JudgePage() {
  const [stepIdx,   setStepIdx]   = useState(0);    // 0-5 = steps, 6 = scorecard
  const [progress,  setProgress]  = useState(0);    // 0–1 within current step
  const [playing,   setPlaying]   = useState(false);
  const [speed,     setSpeed]     = useState<Speed>(1);
  const [started,   setStarted]   = useState(false);

  const TICK_MS  = 200;
  const stepData = STEPS[Math.min(stepIdx, STEPS.length - 1)];

  const advance = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1;
      setProgress(0);
      if (next >= STEPS.length) { setPlaying(false); }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= STEPS.length) { setPlaying(false); return; }

    const dur  = STEPS[stepIdx].duration / speed;
    const inc  = TICK_MS / dur;
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + inc;
        if (next >= 1) { advance(); return 0; }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [playing, stepIdx, speed, advance]);

  const handleStart = () => { setStarted(true); setPlaying(true); };
  const handleBack  = () => {
    setPlaying(false);
    setProgress(0);
    setStepIdx(prev => Math.max(0, prev - 1));
  };
  const handleNext  = () => {
    setPlaying(false);
    setProgress(0);
    setStepIdx(prev => Math.min(STEPS.length, prev + 1));
  };

  // ── Pre-start splash ──
  if (!started) {
    return (
      <div style={{ background: C.bg, color: C.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>SBI GFF 2026 · Judge Mode</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 900, lineHeight: 1.2 }}>IIE End-to-End Demo</h1>
          <p style={{ margin: '0 0 24px', color: C.sub, fontSize: 14, lineHeight: 1.75 }}>
            6 steps · ~3 minutes at 1× speed · Farmer opens YONO → AI offers insurance →
            Oracle quorum → Smart contract → IMPS payout in 2.8s → Audit trail + KCC top-up.
            Ends with a GFF Judge Scorecard.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            {STEPS.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: `${s.color}10`, border: `1px solid ${s.color}33` }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleStart} style={{ padding: '14px 36px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg,${C.orange},${C.amber})`, color: '#030712', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
              ▶ Start 3-Min Auto-Play
            </button>
            <button onClick={() => { setStarted(true); setPlaying(false); }} style={{ padding: '14px 24px', borderRadius: 14, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Manual Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 56px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 18px 0' }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SBI GFF 2026 · Judge Mode</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900 }}>IIE End-to-End Demo</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Speed */}
            <div style={{ display: 'flex', gap: 4 }}>
              {SPEEDS.map(s => (
                <button key={s} onClick={() => setSpeed(s)} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${speed === s ? C.orange : C.border}`, background: speed === s ? `${C.orange}14` : 'transparent', color: speed === s ? C.orange : C.sub, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                  {s}×
                </button>
              ))}
            </div>
            {/* Controls */}
            {stepIdx < STEPS.length && (
              <>
                <button onClick={handleBack} disabled={stepIdx === 0} style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 12, fontWeight: 800, cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', opacity: stepIdx === 0 ? 0.4 : 1 }}>◀ Back</button>
                <button onClick={() => setPlaying(p => !p)} style={{ padding: '7px 18px', borderRadius: 10, border: 'none', background: playing ? `${C.amber}20` : `linear-gradient(135deg,${C.orange},${C.amber})`, color: playing ? C.amber : '#030712', fontSize: 12, fontWeight: 900, cursor: 'pointer', border: playing ? `1px solid ${C.amber}` : 'none' } as React.CSSProperties}>
                  {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={handleNext} style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Next ▶</button>
              </>
            )}
            <Link href="/" style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>← Home</Link>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <ProgressBar step={stepIdx + 1} progress={progress} total={STEPS.length} />

        {/* ── Step or scorecard ── */}
        {stepIdx < STEPS.length
          ? <StepPanel step={STEPS[stepIdx]} progress={progress} />
          : <JudgeScorecard />
        }

        {/* ── Step jump strip (only during demo) ── */}
        {stepIdx < STEPS.length && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => { setPlaying(false); setStepIdx(i); setProgress(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${i === stepIdx ? s.color : C.border}`, background: i === stepIdx ? `${s.color}14` : 'transparent', color: i === stepIdx ? s.color : C.sub, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                {s.icon} {s.id}
              </button>
            ))}
            <button onClick={() => { setPlaying(false); setStepIdx(STEPS.length); setProgress(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.orange}`, background: `${C.orange}14`, color: C.orange, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              🏆 Scorecard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
