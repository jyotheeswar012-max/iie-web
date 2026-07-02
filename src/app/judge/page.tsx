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
// VOICEOVER SCRIPTS
// ─────────────────────────────────────────────────────────────────
const VOICEOVER: string[] = [
  `Step 1. The farmer opens YONO Kisan on his mobile phone.
   IIE calls SBI's YONO Session API and validates his identity in 43 milliseconds.
   There is no paper form. There is no branch visit.
   Aadhaar KYC was completed once when he opened his SBI account — IIE reuses it.
   This is how SBI's 100 million YONO users become IIE candidates from day one,
   with zero new customer acquisition cost.`,

  `Step 2. This is where IIE becomes truly agentic.
   The AI has been monitoring Barmer district for 72 hours.
   Crop stress index — called NDVI — has dropped to 0.21.
   The danger threshold is 0.35.
   Rainfall forecast is only 7 millimetres over the next 10 days.
   The AI does not wait for the farmer to search for insurance.
   It pushes a personalised offer directly to his YONO home screen,
   18 hours before the predicted drought window opens.
   The net premium, after the government's 30 percent PM-FASAL subsidy, is just 2,340 rupees.`,

  `Step 3. Three weeks later, the drought window opens.
   IIE's Oracle Quorum engine queries all four sovereign government data sources simultaneously.
   All four confirm the drought.
   The quorum consensus score is 94 percent — well above the 75 percent trigger threshold.
   This entire verification takes 1.2 seconds.
   Under PMFBY, a human adjuster would need 30 to 45 days to conduct a manual field survey.`,

  `Step 4. The oracle quorum result is written to an immutable audit chain.
   The smart contract reads the quorum vote, confirms the trigger condition,
   and transitions its state from TRIGGERED to EXECUTED.
   IRDAI and RBI auditors can query this record using their permissioned key at any time.
   The entire execution takes 890 milliseconds.`,

  `Step 5. The smart contract calls SBI's Payment Gateway API.
   SBI routes 48,221 rupees via NPCI's IMPS channel to the farmer's UPI address.
   The Reference Remittance Number is generated.
   Total time from oracle trigger to money in the farmer's account: 2.8 seconds.
   PMFBY average payout time is 47 days.`,

  `Step 6. Every event in this journey is permanently anchored on an immutable audit chain
   and retained for 7 years as required by the RBI IT Framework.
   The payout improves the farmer's creditworthiness signal.
   IIE immediately offers the farmer a KCC top-up of 40,000 rupees —
   inside the same YONO session, with no new application.
   No other insurer in India can do this.`,
];

// ─────────────────────────────────────────────────────────────────
// STEP DATA
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
      { key: 'YONO Session API',        value: 'POST yono.sbi.co.in/api/v2/auth/introspect', highlight: true },
      { key: 'Session Status',           value: 'ACTIVE · scope: kisan_insurance' },
      { key: 'KYC Level',                value: 'Full KYC (Aadhaar eKYC + CKYC)' },
      { key: 'Aadhaar Hash',             value: 'SHA-256: a3f9...d821 (plaintext never stored)' },
      { key: 'KCC Account',              value: 'SBI-KCC-00341 · Rs 1,20,000 limit · Active' },
      { key: 'YONO Response Time',       value: '43 ms' },
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
      { key: 'NDVI Score',               value: '0.21 (threshold: 0.35)', highlight: true },
      { key: 'Rainfall Forecast (10d)',   value: '7.3 mm · IMD District Alert' },
      { key: 'LST Anomaly',              value: '+6.2°C above seasonal baseline · ISRO Bhuvan' },
      { key: 'Soil Moisture',            value: '11% · ICAR sensor cluster' },
      { key: 'Risk Score',               value: '87 / 100 · CRITICAL' },
      { key: 'AI Action',                value: 'Push offer sent to YONO · 18h before window', highlight: true },
      { key: 'Premium (net of subsidy)', value: 'Rs 2,340 (Rs 3,340 − 30% PM-FASAL)' },
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
    actorSub: 'NASA POWER 30% · IMD Rainfall 25% · Sentinel-2 NDVI 25% · ICAR Sensors 20%',
    narrative:
      'Ramesh accepts the offer. Three weeks later, the drought window opens. IIE\'s oracle quorum automatically re-evaluates. All four sovereign government data sources confirm the event. Quorum score: 94% — far above the 75% trigger threshold. No human adjuster. No claim form. The smart contract receives the trigger signal.',
    dataPanel: [
      { key: 'NASA POWER Rainfall',      value: '6.1 mm / 7d · DROUGHT CONFIRMED', highlight: true },
      { key: 'IMD 30-day Rainfall',      value: '6.1 mm · < 20 mm threshold (simulated)' },
      { key: 'Sentinel-2 NDVI',          value: '0.18 · < 0.28 threshold (simulated)' },
      { key: 'ICAR Soil Moisture',       value: '9% · < 15% threshold (simulated)' },
      { key: 'Quorum Score',             value: '94% · TRIGGER APPROVED', highlight: true },
      { key: 'Consensus Time',           value: '1.2 seconds' },
      { key: 'Oracle-1 status',          value: '🟢 LIVE — NASA POWER MERRA-2 real data' },
    ],
    deepLink: { label: 'Agent Quorum', href: '/agents' },
    gffCriteria: 'Innovation & Technology',
  },
  {
    id: 4,
    icon: '⛓️',
    label: 'Smart Contract',
    title: 'Smart contract executes',
    subtitle: 'IIEPolicy state: TRIGGERED → EXECUTED · SHA-256 audit chain',
    color: C.amber,
    duration: 28000,
    actor: 'IIEPolicy Smart Contract',
    actorSub: 'TypeScript FSM · Fabric-ready design · SHA-256 audit chain',
    narrative:
      'The oracle quorum result is written to an immutable SHA-256 audit chain. The smart contract reads the quorum vote, confirms the trigger condition, and transitions state from TRIGGERED to EXECUTED. This generates an immutable audit record — IRDAI auditors can query this record with their permissioned key at any time.',
    dataPanel: [
      { key: 'State Transition',         value: 'ENROLLED → TRIGGERED → EXECUTED', highlight: true },
      { key: 'Audit Hash',               value: 'SHA-256: 8f3a...d291 (crypto.subtle)' },
      { key: 'Payout Calculated',        value: 'Rs 48,221 (4.5 acres × Rs 15,700/acre × loss_factor 0.6825)', highlight: true },
      { key: 'Payout Formula',           value: 'deficit 80.95% → loss_factor (80.95−40)/60 = 0.6825' },
      { key: 'IRDAI Audit Key',          value: 'Permissioned read granted · Regulation 9' },
      { key: 'Execution Time',           value: '890 ms' },
    ],
    deepLink: { label: 'Blockchain Audit', href: '/blockchain' },
    gffCriteria: 'Scalability & Sustainability',
  },
  {
    id: 5,
    icon: '💸',
    label: 'IMPS Payout',
    title: 'Payout hits Ramesh in 2.8 seconds',
    subtitle: 'SBI Payment Gateway → NPCI CIB → IMPS settlement (simulated)',
    color: C.green,
    duration: 30000,
    actor: 'SBI Payment Gateway',
    actorSub: 'api.onlinesbi.sbi/pgw/v2/imps/initiate · NPCI CIB channel',
    narrative:
      'The smart contract calls SBI\'s Payment Gateway API. SBI routes Rs 48,221 via NPCI\'s Corporate Internet Banking IMPS channel to Ramesh\'s UPI VPA. The Reference Remittance Number and UTR are generated, both anchored on the audit chain. Total time from oracle trigger to settlement: 2.8 seconds (simulated — live IMPS requires SBI sandbox). Compare: PMFBY average is 47 days.',
    dataPanel: [
      { key: 'SBI Payment API',          value: 'POST api.onlinesbi.sbi/pgw/v2/imps/initiate', highlight: true },
      { key: 'Amount',                   value: 'Rs 48,221 · Drought payout · Policy SBI-IIE-00341' },
      { key: 'Beneficiary VPA',          value: 'rameshkumar@sbi' },
      { key: 'RRN',                      value: '924819023741 SETTLED', highlight: true },
      { key: 'UTR',                      value: 'SBI2607011823924819' },
      { key: 'Settlement Time',          value: '2.8 seconds (PMFBY avg: 47 days)', highlight: true },
      { key: 'Status',                   value: '🟡 SIMULATED — production: SBI YONO IMPS API' },
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
    actor: 'SHA-256 Audit Chain + SBI Credit Assessment API',
    actorSub: 'RBI IT Framework · IRDAI Regulation 9 · DPDP Act 2023',
    narrative:
      'Every event in the journey — session, quorum, contract, payout — is chained via SHA-256 and retained for 7 years per RBI mandate. IRDAI and RBI auditors have permissioned read access. Simultaneously, IIE calls SBI\'s Credit Assessment API: the Rs 48,221 payout improves Ramesh\'s creditworthiness signal. IIE offers him a KCC top-up of Rs 40,000 — within the same YONO session. No other insurer can do this.',
    dataPanel: [
      { key: 'Audit Events Chained',     value: '6 events · SHA-256 hash chain' },
      { key: 'Audit Retention',          value: '7 years · RBI IT Framework mandate', highlight: true },
      { key: 'IRDAI Access',             value: 'Permissioned key · Regulation 9' },
      { key: 'DPDP Consent ID',          value: '0x7f2a...91bc · On-chain · Section 6' },
      { key: 'KCC Top-Up Offer',         value: 'Rs 40,000 · SBI Credit Assessment API', highlight: true },
      { key: 'KCC API',                  value: 'POST api.sbi.co.in/credit/v1/farmer-assess' },
      { key: 'SBI Moat',                 value: 'Only SBI can do this — payout to credit in 1 session', highlight: true },
    ],
    deepLink: { label: 'Compliance Center', href: '/india-stack' },
    gffCriteria: 'Compliance & Risk',
  },
];

// ─────────────────────────────────────────────────────────────────
// EVIDENCE INDEX  (replaces scorecard — no self-scores)
// ─────────────────────────────────────────────────────────────────
const EVIDENCE_INDEX = [
  {
    criterion: 'Agentic AI',
    icon: '🤖',
    color: C.purple,
    evidence: '4-oracle quorum monitors NDVI / Rain / LST / Soil every 24 h. Proactively contacts farmer 18 h before drought window — not reactive.',
    link: { label: '/agentic', href: '/agentic' },
  },
  {
    criterion: 'Customer Acquisition',
    icon: '👤',
    color: C.blue,
    evidence: 'YONO 100 M+ install base — zero cold acquisition cost. SBI KCC holders auto-identified via AA consent. 45% agri lending market share activated from day 1.',
    link: { label: '/sbi-apis', href: '/sbi-apis' },
  },
  {
    criterion: 'Digital Adoption',
    icon: '📱',
    color: C.teal,
    evidence: 'Native YONO integration. Aadhaar eKYC, DigiLocker, UPI/IMPS. Zero new app installs. BC-point enrollment via existing SBI tablets.',
    link: { label: '/demo', href: '/demo' },
  },
  {
    criterion: 'Innovation & Technology',
    icon: '⚡',
    color: C.amber,
    evidence: 'Real Logistic Regression model (AUC 0.83, F1 0.85) — 500-row dataset, 423 used after cleaning, 338 train / 85 test. Exact SHAP via LinearExplainer. 4-oracle quorum. Oracle-1 (NASA POWER) is live. < 3 s payout flow.',
    link: { label: '/ml', href: '/ml' },
  },
  {
    criterion: 'Scalability & Sustainability',
    icon: '🌱',
    color: C.green,
    evidence: 'Vercel Edge — 100+ PoPs, < 50 ms p95. MIT open-source. 500 K farmer Year-1 TAM. Zero new branch infrastructure required.',
    link: { label: '/architecture', href: '/architecture' },
  },
  {
    criterion: 'Compliance & Risk',
    icon: '🛡️',
    color: C.orange,
    evidence: '27/28 India Stack checks. DPDP Act 2023 + RBI IT Framework + IRDAI Digital Regulation. Basis risk disclosed and mitigated on /risk. IRDAI 2023 parametric guidelines referenced.',
    link: { label: '/india-stack', href: '/india-stack' },
  },
];

function EvidenceIndex() {
  return (
    <div>
      <div style={{ borderRadius: 24, padding: '32px 36px', marginBottom: 20, background: 'linear-gradient(135deg,#060D1A,#0d1b4b,#0f2a1a)', border: `1px solid ${C.teal}44`, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, color: C.teal }}>Demo Complete</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: 14 }}>
          IIE end-to-end · Farmer enrolled → oracle quorum → smart contract → payout in 2.8 s → audit trail + KCC upsell
        </p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          GFF 2026 Evidence Index — criterion → artifact
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EVIDENCE_INDEX.map((row) => (
            <div key={row.criterion} style={{ borderRadius: 18, border: `1px solid ${row.color}33`, background: `${row.color}06`, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 24, marginTop: 2 }}>{row.icon}</span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: row.color, marginBottom: 4 }}>{row.criterion}</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{row.evidence}</div>
              </div>
              <Link href={row.link.href} style={{ padding: '7px 14px', borderRadius: 10, background: `${row.color}14`, border: `1px solid ${row.color}44`, color: row.color, fontSize: 10, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                {row.link.label} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        {[
          { label: '🟢 Live Oracle',      href: '/api/oracle/weather?district=Barmer', color: C.teal   },
          { label: 'ML + SHAP',           href: '/ml',           color: C.purple },
          { label: 'Risk + Basis Risk',   href: '/risk',         color: C.amber  },
          { label: 'Blockchain Audit',    href: '/blockchain',   color: C.orange },
          { label: 'Payout Tracker',      href: '/payouts',      color: C.green  },
          { label: 'Impact vs PMFBY',     href: '/impact',       color: C.blue   },
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
    utter.rate   = 0.92;
    utter.pitch  = 1.0;
    utter.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang === 'en-GB') ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMutedState(mutedRef.current);
    if (mutedRef.current) window.speechSynthesis?.cancel();
  }, []);

  // suppress unused warning
  void utterRef;

  return { speak, cancel, toggleMute, muted };
}

// ─────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────
function ProgressBar({ step, progress, total }: { step: number; progress: number; total: number }) {
  const done = step > total;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => {
          const isDone    = i + 1 < step;
          const isActive  = i + 1 === step;
          const isPending = i + 1 > step;
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              background: isDone ? `${C.green}18` : isActive ? `${s.color}18` : '#0a1120',
              border: `1px solid ${isDone ? C.green : isActive ? s.color : C.border}`,
              transition: 'all 0.3s',
              opacity: isPending ? 0.45 : 1,
            }}>
              <span style={{ fontSize: 13 }}>{isDone ? '✅' : s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: isDone ? C.green : isActive ? s.color : C.sub }}>
                {s.label}
              </span>
            </div>
          );
        })}
        {done && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, background: `${C.teal}18`, border: `1px solid ${C.teal}` }}>
            <span style={{ fontSize: 13 }}>✅</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.teal }}>Complete</span>
          </div>
        )}
      </div>
      <div style={{ height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: done
            ? `linear-gradient(90deg,${C.teal},${C.green})`
            : `linear-gradient(90deg,${STEPS[Math.min(step - 1, STEPS.length - 1)].color},${C.green})`,
          width: done ? '100%' : `${((step - 1) / total + progress / total) * 100}%`,
          transition: 'width 0.4s linear',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: C.sub }}>{done ? 'Complete' : `Step ${step} of ${total}`}</span>
        <span style={{ fontSize: 10, color: C.sub }}>{done ? '100%' : `${Math.round(((step - 1) / total + progress / total) * 100)}%`}</span>
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
              Step {step.id} of {STEPS.length} · {step.gffCriteria}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text }}>{step.title}</h2>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{step.subtitle}</div>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#1e293b', marginTop: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: step.color, width: `${pct}%`, transition: 'width 0.4s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 9, color: C.sub }}>{step.actor} · {step.actorSub}</span>
          <span style={{ fontSize: 9, color: step.color }}>{pct}%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>What is happening</div>
          <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.75 }}>{step.narrative}</p>
          {step.deepLink && (
            <Link href={step.deepLink.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 16px', borderRadius: 10, background: `${step.color}14`, border: `1px solid ${step.color}44`, color: step.color, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
              {step.deepLink.label} →
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
  const TICK_MS = 200;

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

  const prevStepRef = useRef(-1);
  useEffect(() => {
    if (!started) return;
    if (stepIdx >= STEPS.length) { cancel(); return; }
    if (stepIdx === prevStepRef.current) return;
    prevStepRef.current = stepIdx;
    const t = setTimeout(() => speak(VOICEOVER[stepIdx]), 300);
    return () => clearTimeout(t);
  }, [stepIdx, started, speak, cancel]);

  useEffect(() => {
    if (!playing) cancel();
  }, [playing, cancel]);

  const handleStart = () => { setStarted(true); setPlaying(true); };
  const handleBack  = () => { cancel(); setPlaying(false); setProgress(0); setStepIdx(prev => Math.max(0, prev - 1)); };
  const handleNext  = () => { cancel(); setPlaying(false); setProgress(0); setStepIdx(prev => Math.min(STEPS.length, prev + 1)); };

  // ── Pre-start splash ──
  if (!started) {
    return (
      <div style={{ background: C.bg, color: C.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>SBI GFF 2026 · Judge Mode</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 900, lineHeight: 1.2 }}>IIE End-to-End Demo</h1>
          <p style={{ margin: '0 0 16px', color: C.sub, fontSize: 14, lineHeight: 1.75 }}>
            6 steps · ~3 minutes at 1× speed · Farmer opens YONO → AI offers insurance →
            Oracle quorum → Smart contract → IMPS payout in 2.8 s → Audit trail + KCC top-up.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 18px', borderRadius: 12, background: 'rgba(100,255,218,0.06)', border: '1px solid rgba(100,255,218,0.25)', fontSize: 12, color: '#64ffda' }}>
            🔊 Audio narration included — turn up your volume for the full experience
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
            <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SBI GFF 2026 · Judge Mode</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900 }}>IIE End-to-End Demo</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={toggleMute} title={muted ? 'Unmute narrator' : 'Mute narrator'} style={{ padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800, border: `1px solid ${muted ? C.red : C.teal}`, background: muted ? `${C.red}14` : `${C.teal}14`, color: muted ? C.red : C.teal }}>
              {muted ? '🔇 Muted' : '🔊 Narrator'}
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              {SPEEDS.map(s => (
                <button key={s} onClick={() => setSpeed(s)} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${speed === s ? C.orange : C.border}`, background: speed === s ? `${C.orange}14` : 'transparent', color: speed === s ? C.orange : C.sub, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                  {s}×
                </button>
              ))}
            </div>
            {stepIdx < STEPS.length && (
              <>
                <button onClick={handleBack} disabled={stepIdx === 0} style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 12, fontWeight: 800, cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', opacity: stepIdx === 0 ? 0.4 : 1 }}>◀ Back</button>
                <button onClick={() => setPlaying(p => !p)} style={{ padding: '7px 18px', borderRadius: 10, background: playing ? `${C.amber}20` : `linear-gradient(135deg,${C.orange},${C.amber})`, color: playing ? C.amber : '#030712', fontSize: 12, fontWeight: 900, cursor: 'pointer', border: playing ? `1px solid ${C.amber}` : 'none' } as React.CSSProperties}>
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

        {/* ── Step or evidence index ── */}
        {stepIdx < STEPS.length
          ? <StepPanel step={STEPS[stepIdx]} progress={progress} />
          : <EvidenceIndex />
        }

        {/* ── Step jump strip ── */}
        {stepIdx < STEPS.length && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => { cancel(); setPlaying(false); setStepIdx(i); setProgress(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${i === stepIdx ? s.color : C.border}`, background: i === stepIdx ? `${s.color}14` : 'transparent', color: i === stepIdx ? s.color : C.sub, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                {s.icon} {s.id}
              </button>
            ))}
            <button onClick={() => { cancel(); setPlaying(false); setStepIdx(STEPS.length); setProgress(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.teal}`, background: `${C.teal}14`, color: C.teal, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              ✅ Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
