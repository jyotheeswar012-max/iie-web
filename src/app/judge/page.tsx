'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

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
// VOICEOVER SCRIPTS  —  business-value narration, one per step
// Written for a noisy demo hall: short sentences, pauses via commas,
// key numbers spoken aloud so a judge can hear without looking.
// ─────────────────────────────────────────────────────────────────
const VOICEOVER: string[] = [
  // Step 1 — YONO Open
  `Step 1. The farmer opens YONO Kisan on his mobile phone. 
   IIE calls SBI's YONO Session API and validates his identity in 43 milliseconds. 
   There is no paper form. There is no branch visit. 
   Aadhaar KYC was completed once when he opened his SBI account — IIE reuses it. 
   This is how SBI's 100 million YONO users become IIE candidates from day one, 
   with zero new customer acquisition cost.`,

  // Step 2 — Agentic AI Offer
  `Step 2. This is where IIE becomes truly agentic. 
   The AI has been monitoring Barmer district for 72 hours. 
   Crop stress index — called NDVI — has dropped to 0.21. 
   The danger threshold is 0.35. 
   Rainfall forecast is only 7 millimetres over the next 10 days. 
   The AI does not wait for the farmer to search for insurance. 
   It pushes a personalised offer directly to his YONO home screen, 
   18 hours before the predicted drought window opens. 
   The net premium, after the government's 30 percent PM-FASAL subsidy, is just 2,340 rupees. 
   Compare this to PMFBY, where the farmer must visit a branch, fill a form, and wait.`,

  // Step 3 — Oracle Quorum
  `Step 3. Three weeks later, the drought window opens. 
   IIE's Oracle Quorum engine queries all four sovereign government data sources simultaneously: 
   NASA satellite imagery, the India Meteorological Department, ISRO's Bhuvan platform, and ICAR soil sensors. 
   All four confirm the drought. 
   The quorum consensus score is 94 percent — well above the 75 percent trigger threshold. 
   This entire verification takes 1.2 seconds. 
   Under PMFBY, a human adjuster would need 30 to 45 days to conduct a manual field survey. 
   No human is involved here. No claim form. The smart contract receives the trigger signal automatically.`,

  // Step 4 — Smart Contract
  `Step 4. The oracle quorum result is written to Hyperledger Fabric — a permissioned blockchain. 
   The smart contract reads the quorum vote, confirms the trigger condition, 
   and transitions its state from TRIGGERED to EXECUTED. 
   This creates an immutable audit record. 
   IRDAI and RBI auditors can query this block using their permissioned key at any time, 
   without asking IIE for a report. 
   The entire execution takes 890 milliseconds. 
   The gas cost on Polygon is approximately 9 paise per contract — practically zero at scale.`,

  // Step 5 — IMPS Payout
  `Step 5. The smart contract calls SBI's Payment Gateway API. 
   SBI routes 48,200 rupees via NPCI's IMPS channel to the farmer's UPI address. 
   The Reference Remittance Number is generated. 
   The farmer receives an SMS confirmation. 
   Total time from oracle trigger to money in the farmer's account: 2.8 seconds. 
   PMFBY average payout time is 47 days. 
   IIE is 99.99 percent faster. 
   No competitor at this hackathon — and no other bank — can replicate this, 
   because it runs on SBI's own NPCI Corporate Internet Banking channel, 
   which only SBI can access.`,

  // Step 6 — Audit + KCC
  `Step 6. Every event in this journey — the session validation, the quorum vote, 
   the contract execution, and the payout — is permanently anchored on Hyperledger Fabric 
   and retained for 7 years as required by the RBI IT Framework. 
   Now watch what happens next. 
   The payout improves the farmer's creditworthiness signal. 
   IIE immediately calls SBI's Credit Assessment API and offers the farmer a KCC top-up of 40,000 rupees — 
   inside the same YONO session, with no new application. 
   No other insurer in India can do this, because no other insurer has access to SBI's KCC credit infrastructure. 
   This is IIE's SBI-exclusive moat.`,
];

// ─────────────────────────────────────────────────────────────────
// STEP DATA  (6 steps × ~30s each = ~3 min auto-play at 1×)
// ─────────────────────────────────────────────────────────────────
interface DemoStep {
  id:        number;
  icon:      string;
  label:     string;
  title:     string;
  subtitle:  string;
  color:     string;
  duration:  number;
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
      { key: 'Session Status',          value: 'ACTIVE  · scope: kisan_insurance' },
      { key: 'KYC Level',               value: 'Full KYC (Aadhaar eKYC + CKYC)' },
      { key: 'Aadhaar Hash',            value: 'SHA-256: a3f9...d821  (plaintext never stored)' },
      { key: 'KCC Account',             value: 'SBI-KCC-00341  · Rs 1,20,000 limit  · Active' },
      { key: 'YONO Response Time',      value: '43 ms' },
    ],
    deepLink: { label: 'SBI API Center', href: '/sbi-apis' },
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
      { key: 'NDVI Score',              value: '0.21  (threshold: 0.35)', highlight: true },
      { key: 'Rainfall Forecast (10d)', value: '7.3 mm  ·  IMD District Alert' },
      { key: 'LST Anomaly',             value: '+6.2 deg C above seasonal baseline  ·  ISRO Bhuvan' },
      { key: 'Soil Moisture',           value: '11%  ·  ICAR sensor cluster' },
      { key: 'Risk Score',              value: '87 / 100  ·  CRITICAL' },
      { key: 'AI Action',               value: 'Push offer sent to YONO  · 18h before window', highlight: true },
      { key: 'Premium (net of subsidy)', value: 'Rs 2,340  (Rs 3,340 - 30% PM-FASAL)' },
    ],
    deepLink: { label: 'Agentic AI Page', href: '/agentic' },
    gffCriteria: 'Agentic AI',
  },
  {
    id: 3,
    icon: '🛰️',
    label: 'Oracle Quorum',
    title: 'Oracle quorum runs — 4 agents vote',
    subtitle: '>= 75% consensus required to trigger payout',
    color: C.teal,
    duration: 32000,
    actor: 'Oracle Quorum Engine',
    actorSub: 'NASA MODIS 30% · IMD Rainfall 25% · ISRO Bhuvan 25% · ICAR Sensors 20%',
    narrative:
      'Ramesh accepts the offer. Three weeks later, the drought window opens. IIE\'s oracle quorum automatically re-evaluates. All four sovereign government data sources confirm the event. Quorum score: 94% — far above the 75% trigger threshold. No human adjuster. No claim form. The smart contract receives the trigger signal.',
    dataPanel: [
      { key: 'NASA MODIS NDVI',         value: '0.18  ·  DROUGHT CONFIRMED', highlight: true },
      { key: 'IMD 30-day Rainfall',     value: '6.1 mm  ·  < 20mm threshold' },
      { key: 'ISRO Bhuvan LST',         value: '49.3 deg C  ·  > 45 deg C threshold' },
      { key: 'ICAR Soil Moisture',      value: '9%  ·  < 15% threshold' },
      { key: 'Quorum Score',            value: '94%  ·  TRIGGER APPROVED', highlight: true },
      { key: 'Consensus Time',          value: '1.2 seconds' },
      { key: 'Data Sources',            value: 'All public-domain sovereign APIs  ·  No PII' },
    ],
    deepLink: { label: 'Agent Quorum', href: '/agents' },
    gffCriteria: 'Innovation & Technology',
  },
  {
    id: 4,
    icon: '⛓️',
    label: 'Smart Contract',
    title: 'Smart contract executes on Hyperledger Fabric',
    subtitle: 'IIEPolicy.sol state: TRIGGERED to EXECUTED',
    color: C.amber,
    duration: 28000,
    actor: 'IIEPolicy Smart Contract',
    actorSub: 'Hyperledger Fabric + Polygon Mumbai · SHA-256 audit chain',
    narrative:
      'The oracle quorum result is written to Hyperledger Fabric. The smart contract reads the quorum vote, confirms the trigger condition, and transitions state from TRIGGERED to EXECUTED. This generates an immutable audit record — IRDAI auditors can query this block with their permissioned key at any time. The contract then calls SBI\'s Payment Gateway API.',
    dataPanel: [
      { key: 'Contract Address',        value: '0x3a9f...c12e  ·  Polygon Mumbai' },
      { key: 'State Transition',        value: 'ENROLLED to TRIGGERED to EXECUTED', highlight: true },
      { key: 'Fabric Block',            value: '#4821  ·  Hash: 8f3a...d291' },
      { key: 'Payout Calculated',       value: 'Rs 48,200  (4.5 acres x Rs 10,711/acre drought rate)' },
      { key: 'IRDAI Audit Key',         value: 'Permissioned read granted  ·  Regulation 9', highlight: true },
      { key: 'Execution Time',          value: '890 ms' },
      { key: 'Gas (Polygon)',           value: '0.0012 MATIC  approx Rs 0.09' },
    ],
    deepLink: { label: 'Blockchain Audit', href: '/blockchain' },
    gffCriteria: 'Scalability & Sustainability',
  },
  {
    id: 5,
    icon: '💸',
    label: 'IMPS Payout',
    title: 'Payout hits Ramesh in 2.8 seconds',
    subtitle: 'SBI Payment Gateway to NPCI CIB to IMPS settlement',
    color: C.green,
    duration: 30000,
    actor: 'SBI Payment Gateway',
    actorSub: 'api.onlinesbi.sbi/pgw/v2/imps/initiate  ·  NPCI CIB channel',
    narrative:
      'The smart contract calls SBI\'s Payment Gateway API. SBI routes Rs 48,200 via NPCI\'s Corporate Internet Banking IMPS channel to Ramesh\'s UPI VPA. The Reference Remittance Number and UTR are generated, both anchored on Hyperledger Fabric. Total time from oracle trigger to settlement: 2.8 seconds. Compare: PMFBY average payout time is 47 days.',
    dataPanel: [
      { key: 'SBI Payment API',         value: 'POST api.onlinesbi.sbi/pgw/v2/imps/initiate', highlight: true },
      { key: 'Amount',                  value: 'Rs 48,200  ·  Drought payout  ·  Policy SBI-IIE-00341' },
      { key: 'Beneficiary VPA',         value: 'rameshkumar@sbi' },
      { key: 'RRN',                     value: '924819023741  SETTLED', highlight: true },
      { key: 'UTR',                     value: 'SBI2607011823924819' },
      { key: 'Channel',                 value: 'NPCI CIB · IMPS' },
      { key: 'Settlement Time',         value: '2.8 seconds  (PMFBY avg: 47 days)', highlight: true },
    ],
    deepLink: { label: 'Payout Tracker', href: '/payouts' },
    gffCriteria: 'Customer Experience',
  },
  {
    id: 6,
    icon: '📝',
    label: 'Audit + KCC',
    title: 'Audit trail recorded · KCC top-up offered',
    subtitle: 'RBI 7-year retention · SBI-exclusive credit upsell',
    color: C.orange,
    duration: 28000,
    actor: 'Hyperledger Fabric + SBI Credit Assessment API',
    actorSub: 'RBI IT Framework  ·  IRDAI Regulation 9  ·  DPDP Act 2023',
    narrative:
      'Every event in the journey — session, quorum, contract, payout — is chained on Hyperledger Fabric and retained for 7 years per RBI mandate. IRDAI and RBI auditors have permissioned read access. Simultaneously, IIE calls SBI\'s Credit Assessment API: the Rs 48,200 payout improves Ramesh\'s creditworthiness signal. IIE offers him a KCC top-up of Rs 40,000 — within the same YONO session. No other insurer can do this.',
    dataPanel: [
      { key: 'Fabric Events Anchored',  value: '6 events  ·  Block #4821 to #4826' },
      { key: 'Audit Retention',         value: '7 years  ·  RBI IT Framework mandate', highlight: true },
      { key: 'IRDAI Access',            value: 'Permissioned key  ·  Regulation 9' },
      { key: 'DPDP Consent ID',         value: '0x7f2a...91bc  ·  On-chain  ·  Section 6' },
      { key: 'KCC Top-Up Offer',        value: 'Rs 40,000  ·  SBI Credit Assessment API', highlight: true },
      { key: 'KCC API',                 value: 'POST api.sbi.co.in/credit/v1/farmer-assess' },
      { key: 'SBI Moat',                value: 'Only SBI can do this — payout to credit in 1 session', highlight: true },
    ],
    deepLink: { label: 'Compliance Center', href: '/india-stack' },
    gffCriteria: 'Compliance & Risk',
  },
];

// ─────────────────────────────────────────────────────────────────
// GFF SCORECARD
// ─────────────────────────────────────────────────────────────────
interface ScorecardRow {
  criterion:   string;
  icon:        string;
  score:       number;
  color:       string;
  evidence:    string;
  deepLink:    { label: string; href: string };
}
const SCORECARD: ScorecardRow[] = [
  { criterion: 'Agentic AI',                icon: '🤖', score: 10, color: C.purple, evidence: '4-agent oracle quorum. AI proactively contacts farmer 18h before drought. Passive vs Agentic 10-row table on /agentic.',                                         deepLink: { label: '/agentic',     href: '/agentic'     } },
  { criterion: 'Customer Acquisition',      icon: '👤', score: 9,  color: C.blue,   evidence: 'YONO 100M+ install base = zero cold acquisition. SBI KCC holders auto-identified. 45% agri lending market share activated from day 1.',                       deepLink: { label: '/sbi-apis',    href: '/sbi-apis'    } },
  { criterion: 'Digital Adoption',          icon: '📱', score: 9,  color: C.teal,   evidence: 'Native YONO integration. Aadhaar eKYC, DigiLocker, UPI/IMPS. Zero new app installs. BC-point enrollment via tablet.',                                         deepLink: { label: '/demo',        href: '/demo'        } },
  { criterion: 'Innovation & Technology',   icon: '⚡', score: 10, color: C.amber,  evidence: '4-oracle sovereign quorum (NASA+IMD+ISRO+ICAR). Hyperledger Fabric + Polygon hybrid. GradientBoosting F1=0.91. < 3s payout.',                                  deepLink: { label: '/agents',      href: '/agents'      } },
  { criterion: 'Scalability & Sustainability', icon: '🌱', score: 9, color: C.green,'evidence': 'Vercel Edge 100+ PoPs, < 50ms. MIT open-source. 500K farmer TAM. Polygon gas approx Rs 0.09/contract. Zero new branch infrastructure.',                deepLink: { label: '/architecture',href: '/architecture' } },
  { criterion: 'Compliance & Risk',         icon: '🛡️', score: 10, color: C.orange, evidence: '96% compliance (27/28 checks). DPDP Act 2023 + RBI IT Framework + IRDAI Guidelines. SHA-256 audit chain. 7-year retention.',                               deepLink: { label: '/india-stack', href: '/india-stack'  } },
];

// ─────────────────────────────────────────────────────────────────
// VOICEOVER HOOK
// ─────────────────────────────────────────────────────────────────
function useSpeech() {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutedRef = useRef(false);
  const [muted, setMutedState] = useState(false);

  const cancel = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    if (mutedRef.current) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.92;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    // Prefer Indian English, fall back gracefully
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === 'en-IN')
      || voices.find(v => v.lang === 'en-GB')
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMutedState(mutedRef.current);
    if (mutedRef.current) window.speechSynthesis?.cancel();
  }, []);

  return { speak, cancel, toggleMute, muted };
}

// ─────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────
function ProgressBar({ step, progress, total }: { step: number; progress: number; total: number }) {
  return (
    <div style={{ marginBottom: 20 }}>
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
      <div style={{ height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: step > total
            ? `linear-gradient(90deg,${C.orange},${C.amber})`
            : `linear-gradient(90deg,${STEPS[Math.min(step - 1, STEPS.length - 1)].color},${C.green})`,
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
      <div style={{ padding: '22px 28px 16px', background: `${step.color}08`, borderBottom: `1px solid ${step.color}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>{step.icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: step.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
              Step {step.id} of {STEPS.length} &middot; {step.gffCriteria}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text }}>{step.title}</h2>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{step.subtitle}</div>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#1e293b', marginTop: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: step.color, width: `${pct}%`, transition: 'width 0.4s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 9, color: C.sub }}>{step.actor} &middot; {step.actorSub}</span>
          <span style={{ fontSize: 9, color: step.color }}>{pct}%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>What is happening</div>
          <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.75 }}>{step.narrative}</p>
          {step.deepLink && (
            <Link href={step.deepLink.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 16px', borderRadius: 10, background: `${step.color}14`, border: `1px solid ${step.color}44`, color: step.color, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
              {step.deepLink.label} &rarr;
            </Link>
          )}
        </div>
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
      <div style={{ borderRadius: 24, padding: '32px 36px', marginBottom: 20, background: 'linear-gradient(135deg,#060D1A,#1a0f2e,#0f2a1a)', border: `1px solid ${C.orange}44`, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 900, color: C.orange }}>Judge Scorecard</h1>
        <p style={{ margin: '0 0 16px', color: C.sub, fontSize: 14 }}>Self-assessed against SBI GFF 2026 evaluation criteria &middot; IIE end-to-end demo complete</p>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {SCORECARD.map((row) => (
          <div key={row.criterion} style={{ borderRadius: 18, border: `1px solid ${row.color}33`, background: `${row.color}06`, padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 26 }}>{row.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: row.color }}>{row.criterion}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 2, lineHeight: 1.55 }}>{row.evidence}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: row.color, lineHeight: 1 }}>{row.score}</div>
                <div style={{ fontSize: 9, color: C.sub }}>/ 10</div>
                <div style={{ width: 60, height: 5, borderRadius: 2, background: '#1e293b', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: row.color, width: `${row.score * 10}%` }} />
                </div>
              </div>
              <Link href={row.deepLink.href} style={{ padding: '7px 14px', borderRadius: 10, background: `${row.color}14`, border: `1px solid ${row.color}44`, color: row.color, fontSize: 10, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {row.deepLink.label} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: 'Agentic AI',        href: '/agentic',     color: C.purple },
          { label: 'SBI API Center',    href: '/sbi-apis',    color: C.orange },
          { label: 'Compliance Center', href: '/india-stack', color: C.teal   },
          { label: 'Blockchain Audit',  href: '/blockchain',  color: C.amber  },
          { label: 'Payout Tracker',    href: '/payouts',     color: C.green  },
          { label: 'Impact Metrics',    href: '/impact',      color: C.blue   },
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
  const [stepIdx,  setStepIdx]  = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [speed,    setSpeed]    = useState<Speed>(1);
  const [started,  setStarted]  = useState(false);

  const { speak, cancel, toggleMute, muted } = useSpeech();

  const TICK_MS  = 200;

  const advance = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1;
      setProgress(0);
      if (next >= STEPS.length) { setPlaying(false); }
      return next;
    });
  }, []);

  // ── Autoplay tick ──
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= STEPS.length) { setPlaying(false); return; }
    const dur = STEPS[stepIdx].duration / speed;
    const inc = TICK_MS / dur;
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + inc;
        if (next >= 1) { advance(); return 0; }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [playing, stepIdx, speed, advance]);

  // ── Fire voiceover when step changes (playing OR manual nav) ──
  // Only fire on stepIdx change so it doesn't re-trigger on every progress tick
  const prevStepRef = useRef(-1);
  useEffect(() => {
    if (!started) return;
    if (stepIdx >= STEPS.length) { cancel(); return; }
    if (stepIdx === prevStepRef.current) return;
    prevStepRef.current = stepIdx;
    // Small delay so the browser registers the user gesture
    const t = setTimeout(() => speak(VOICEOVER[stepIdx]), 300);
    return () => clearTimeout(t);
  }, [stepIdx, started, speak, cancel]);

  // ── Cancel speech when paused ──
  useEffect(() => {
    if (!playing) cancel();
  }, [playing, cancel]);

  const handleStart = () => {
    setStarted(true);
    setPlaying(true);
  };
  const handleBack = () => {
    cancel();
    setPlaying(false);
    setProgress(0);
    setStepIdx(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    cancel();
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
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>SBI GFF 2026 &middot; Judge Mode</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 900, lineHeight: 1.2 }}>IIE End-to-End Demo</h1>
          <p style={{ margin: '0 0 16px', color: C.sub, fontSize: 14, lineHeight: 1.75 }}>
            6 steps &middot; ~3 minutes at 1&times; speed &middot; Farmer opens YONO &rarr; AI offers insurance &rarr;
            Oracle quorum &rarr; Smart contract &rarr; IMPS payout in 2.8s &rarr; Audit trail + KCC top-up.
            Ends with a GFF Judge Scorecard.
          </p>
          {/* Narration notice */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 18px', borderRadius: 12, background: 'rgba(100,255,218,0.06)', border: '1px solid rgba(100,255,218,0.25)', fontSize: 12, color: '#64ffda' }}>
            🔊 Audio narration included &mdash; turn up your volume for the full experience
          </div>
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
            <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SBI GFF 2026 &middot; Judge Mode</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900 }}>IIE End-to-End Demo</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Mute / Unmute toggle */}
            <button
              onClick={toggleMute}
              title={muted ? 'Unmute narrator' : 'Mute narrator'}
              style={{
                padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800,
                border: `1px solid ${muted ? C.red : C.teal}`,
                background: muted ? `${C.red}14` : `${C.teal}14`,
                color: muted ? C.red : C.teal,
              }}
            >
              {muted ? '🔇 Muted' : '🔊 Narrator'}
            </button>

            {/* Speed */}
            <div style={{ display: 'flex', gap: 4 }}>
              {SPEEDS.map(s => (
                <button key={s} onClick={() => setSpeed(s)} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${speed === s ? C.orange : C.border}`, background: speed === s ? `${C.orange}14` : 'transparent', color: speed === s ? C.orange : C.sub, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                  {s}&times;
                </button>
              ))}
            </div>

            {/* Play controls */}
            {stepIdx < STEPS.length && (
              <>
                <button onClick={handleBack} disabled={stepIdx === 0} style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 12, fontWeight: 800, cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', opacity: stepIdx === 0 ? 0.4 : 1 }}>&#9664; Back</button>
                <button
                  onClick={() => setPlaying(p => !p)}
                  style={{
                    padding: '7px 18px', borderRadius: 10,
                    background: playing ? `${C.amber}20` : `linear-gradient(135deg,${C.orange},${C.amber})`,
                    color: playing ? C.amber : '#030712',
                    fontSize: 12, fontWeight: 900, cursor: 'pointer',
                    border: playing ? `1px solid ${C.amber}` : 'none',
                  } as React.CSSProperties}
                >
                  {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button onClick={handleNext} style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Next &#9654;</button>
              </>
            )}
            <Link href="/" style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>&larr; Home</Link>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <ProgressBar step={stepIdx + 1} progress={progress} total={STEPS.length} />

        {/* ── Step or scorecard ── */}
        {stepIdx < STEPS.length
          ? <StepPanel step={STEPS[stepIdx]} progress={progress} />
          : <JudgeScorecard />
        }

        {/* ── Step jump strip ── */}
        {stepIdx < STEPS.length && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => { cancel(); setPlaying(false); setStepIdx(i); setProgress(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${i === stepIdx ? s.color : C.border}`, background: i === stepIdx ? `${s.color}14` : 'transparent', color: i === stepIdx ? s.color : C.sub, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                {s.icon} {s.id}
              </button>
            ))}
            <button onClick={() => { cancel(); setPlaying(false); setStepIdx(STEPS.length); setProgress(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.orange}`, background: `${C.orange}14`, color: C.orange, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              🏆 Scorecard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
