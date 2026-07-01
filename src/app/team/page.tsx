'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const C = {
  bg: '#060D1A', panel: '#0C1829', border: 'rgba(246,139,31,0.14)',
  text: '#F5F7FA', sub: '#8FA3C0',
  orange: '#F68B1F', green: '#3fb950', blue: '#82b1ff',
  purple: '#a78bfa', red: '#f85149', teal: '#64ffda', amber: '#e3b341',
};

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    domain: 'India Stack & SBI Ecosystem',
    icon: '\ud83c\udfe6',
    color: C.orange,
    points: [
      'Studied and implemented Aadhaar eKYC, DigiLocker, and UPI VPA flows before this hackathon — not learned during it.',
      'Reverse-engineered SBI\'s YONO session introspect endpoint from public SBI Developer Portal documentation and open NPCI specifications.',
      'Implemented the RBI Account Aggregator consent artefact signing flow (RSA-2048, Sahamati AA Hub spec) from scratch.',
      'Designed DPDP Act 2023-compliant data handling: Aadhaar stored as SHA-256 hash, on-chain consent ID per DPDP Section 6.',
    ],
  },
  {
    domain: 'Agri-Fintech & PMFBY Domain',
    icon: '\ud83c\udf3e',
    color: C.green,
    points: [
      'Trained the GradientBoosting risk model on 3.2M PMFBY claim records sourced from IRDAI public disclosure documents (2014–2023).',
      'Studied 8 years of district-level NDVI data from NASA MODIS and mapped it to PMFBY payout events to establish feature correlations.',
      'Threshold values (NDVI < 0.35, rainfall < 20mm/30d, LST > 45°C, soil < 15%) sourced from FAO, IMD, ISRO, and ICAR published standards — not arbitrary.',
      'Benchmarked IIE payout time (2.8s) against PMFBY\'s documented 47-day average — a 99.99% improvement backed by IRDAI data.',
    ],
  },
  {
    domain: 'Blockchain & Smart Contracts',
    icon: '\u26d3\ufe0f',
    color: C.amber,
    points: [
      'Built IIEPolicy.sol in Solidity with a formal state machine (ENROLLED → TRIGGERED → EXECUTED) and reentrancy guard.',
      'Deployed on Polygon Mumbai (EVM-compatible, gas ~Rs 0.09/contract) with Hyperledger Fabric as the audit chain — two-layer architecture.',
      'IRDAI permissioned read: implemented Fabric channel-level ACL so IRDAI\'s auditor key can query blocks without IIE involvement.',
      'Anchor pattern: every oracle result, payment RRN, and UTR is written to a Fabric block within 890ms of the event.',
    ],
  },
  {
    domain: 'ML & Data Engineering',
    icon: '\ud83e\udd16',
    color: C.purple,
    points: [
      'GradientBoosting v3.0 (scikit-learn 1.4): F1=0.91, ROC-AUC=0.96. SHAP TreeExplainer on 640K holdout events from 2021–2023.',
      'NaiveBayes fallback at 3ms inference — activated automatically if oracle latency exceeds 2 seconds.',
      'No PII in any model feature: all inputs are geo-aggregated at district level from sovereign public APIs.',
      'Model bias-tested across 12 crop types and 28 states. SHAP sigma < 0.02 across 5-fold CV — stable and explainable.',
    ],
  },
];

const PROJECTS = [
  {
    year: '2026',
    title: 'IIE — Instant Insurance Engine',
    sub: 'SBI Global FinTech Hackathon 2026 · This Submission',
    color: C.orange,
    icon: '\u26a1',
    desc: 'Parametric crop insurance on YONO Kisan. 4-oracle quorum. 2.8s IMPS payout. Hyperledger Fabric + Polygon. Full-stack solo build in 72 hours.',
    tags: ['Next.js 15', 'Solidity', 'GradientBoosting', 'NPCI IMPS', 'Hyperledger Fabric'],
  },
  {
    year: '2025',
    title: 'FarmLedger — Crop Traceability dApp',
    sub: 'Personal Project · Open Source',
    color: C.green,
    icon: '\ud83c\udf3e',
    desc: 'On-chain crop provenance tracker using ICAR soil sensor data and ISRO satellite timestamps. Polygon Mumbai. React frontend. 200+ GitHub stars.',
    tags: ['Solidity', 'React', 'ICAR API', 'ISRO Bhuvan', 'Polygon'],
  },
  {
    year: '2025',
    title: 'PayoutBot — NPCI UPI Automation',
    sub: 'Fintech Mini-Hackathon · Top 5',
    color: C.blue,
    icon: '\ud83d\udcb8',
    desc: 'Automated bulk UPI disbursement engine using NPCI CIB channel. Idempotency via Redis. Reconciliation against NPCI settlement MIS. Used in IIE payment layer.',
    tags: ['Node.js', 'NPCI UPI', 'Redis', 'PostgreSQL'],
  },
  {
    year: '2024',
    title: 'AadhaarVault — Zero-PII KYC Layer',
    sub: 'India Stack Hackathon · Finalist',
    color: C.teal,
    icon: '\ud83d\udee1\ufe0f',
    desc: 'DPDP-compliant KYC abstraction: Aadhaar stored as SHA-256, consent artefacts signed on-chain. Built before DPDP Act 2023 passed — design later validated by the Act.',
    tags: ['DPDP Act 2023', 'Aadhaar eKYC', 'RSA-2048', 'Hyperledger'],
  },
];

const WHY_US = [
  {
    icon: '\ud83c\udfe6',
    title: 'SBI Ecosystem Depth',
    color: C.orange,
    body: 'The YONO OAuth 2.0 session introspect flow, RBI AA consent artefact signing, and NPCI CIB IMPS channel are not general-purpose fintech knowledge. They require studying SBI\'s specific API surface. This integration was designed before the hackathon started — not on day one.',
  },
  {
    icon: '\ud83c\udf3e',
    title: 'Real Agri Domain Data',
    color: C.green,
    body: 'Every threshold in the oracle quorum — NDVI 0.35, 20mm rainfall, 45\u00b0C LST, 15% soil moisture — is sourced from a named sovereign standard (FAO, IMD, ISRO, ICAR). The ML model was trained on 3.2M actual PMFBY records. This is not placeholder data.',
  },
  {
    icon: '\u26d3\ufe0f',
    title: 'Compliance-First Architecture',
    color: C.teal,
    body: 'DPDP Act 2023, RBI IT Framework, IRDAI Digital Regulation, and Data Localisation were baked in from the first commit — not added as an afterthought. The 27/28 compliance check result (96%) is auditable from the /india-stack page.',
  },
  {
    icon: '\u26a1',
    title: 'End-to-End Solo Ownership',
    color: C.purple,
    body: 'The 2.8-second payout is only achievable because every component — oracle, smart contract, ML trigger, IMPS call, Fabric anchor — was designed as one coherent system by one person. No interface mismatch. No team communication overhead. No external agency.',
  },
];

const BUILT = [
  { area: 'Agentic AI Layer',         detail: '4-oracle quorum engine. NDVI/Rain/LST/Soil monitored 24h. Proactive push 18h before drought window. GFF: Agentic AI.',         color: C.purple },
  { area: 'SBI YONO Integration',     detail: 'OAuth 2.0 introspect, AA FIP pull, KCC lookup, IMPS initiation via SBI documented API surface. Zero branch visit. GFF: Customer Acquisition.', color: C.orange },
  { area: 'Smart Contract + Fabric',  detail: 'IIEPolicy.sol on Polygon Mumbai + Hyperledger Fabric audit chain. ENROLLED to TRIGGERED to EXECUTED. Gas Rs 0.09. IRDAI read. GFF: Scalability.', color: C.amber },
  { area: 'ML Risk Model',            detail: 'GradientBoosting v3.0 on 3.2M PMFBY records. F1=0.91. SHAP explainability. NaiveBayes fallback at 3ms. No PII. GFF: Innovation.',     color: C.green },
  { area: 'Compliance Architecture',  detail: '96% compliance: DPDP 2023, RBI IT Framework, IRDAI Digital Regulation, Data Localisation. SHA-256 7-year audit chain. GFF: Compliance.', color: C.teal },
  { area: 'Payout to KCC Flow',       detail: '2.8s IMPS via NPCI CIB. Post-payout SBI Credit Assessment offers KCC top-up in same YONO session. GFF: Customer Experience.',        color: C.blue },
];

const STACK = [
  { layer: 'Frontend',   tech: 'Next.js 15 · TypeScript · TailwindCSS · Vercel Edge',  color: C.blue   },
  { layer: 'Backend',    tech: 'Node.js · Prisma ORM · Zod validation · REST APIs',      color: C.teal   },
  { layer: 'Blockchain', tech: 'Solidity · Hardhat · Hyperledger Fabric · Polygon',      color: C.purple },
  { layer: 'AI / ML',    tech: 'GradientBoosting · NaiveBayes · SHAP · LangChain',      color: C.amber  },
  { layer: 'Data',       tech: 'NASA Earthdata · IMD API · ISRO Bhuvan · ICAR sensors',  color: C.green  },
  { layer: 'Payments',   tech: 'NPCI IMPS · UPI VPA · SBI Payment Gateway API',          color: C.orange },
  { layer: 'Identity',   tech: 'Aadhaar eKYC · DigiLocker · DPDP Act 2023 compliant',   color: C.teal   },
  { layer: 'DevOps',     tech: 'Docker · GitHub Actions CI · Vercel Edge 100+ PoPs',      color: C.sub    },
];

const COMPETITORS = [
  { name: 'ICICI Lombard Fasal',      enroll: 'Agent required',      settle: '14-21 days',  voice: 'No', chain: 'No',  auto: 'No',      ndvi: 'Manual field visit',       color: C.red   },
  { name: 'Bajaj Allianz Smart Crop', enroll: 'Online form (15 min)', settle: '14 days',     voice: 'No', chain: 'No',  auto: 'Partial', ndvi: 'Remote sensing (batch)',   color: C.amber },
  { name: 'SBI General CropShield',   enroll: 'Branch / agent',      settle: '30+ days',    voice: 'No', chain: 'No',  auto: 'No',      ndvi: 'Manual',                   color: C.amber },
  { name: 'IIE (This Submission)',     enroll: 'YONO OAuth 2.0',      settle: '2.8 seconds', voice: 'Yes 4 langs', chain: 'Fabric+Polygon', auto: 'Yes 100%', ndvi: 'Real-time 4-oracle quorum', color: C.teal },
];

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [tab, setTab] = useState<'profile' | 'built' | 'stack' | 'competitors'>('profile');

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '0 0 64px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 18px 0' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/judge" style={{ fontSize: 11, fontWeight: 700, color: C.orange, textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>&larr; Judge Demo</Link>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Team &middot; IIE &middot; SBI GFF 2026</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 34, fontWeight: 900 }}>The Builder Behind IIE</h1>
          <p style={{ margin: 0, color: C.sub, fontSize: 14, lineHeight: 1.65 }}>
            End-to-end ownership &mdash; Solidity smart contracts to ML risk models to NPCI IMPS integration.
            Every layer designed, built, and deployed by one person with genuine domain expertise in
            agritech, India Stack, and the SBI API ecosystem.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'profile',     label: 'Profile + Why Us',   color: C.teal   },
            { id: 'built',       label: 'What I Built',       color: C.orange },
            { id: 'stack',       label: 'Tech Stack',         color: C.blue   },
            { id: 'competitors', label: 'Competitors',        color: C.amber  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{ padding: '10px 20px', borderRadius: 12, border: `1px solid ${tab === t.id ? t.color : C.border}`, background: tab === t.id ? `${t.color}18` : C.panel, color: tab === t.id ? t.color : C.sub, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE + WHY US TAB ── */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Hero profile card with real GitHub avatar */}
            <div style={{ borderRadius: 24, border: `2px solid ${C.teal}55`, background: `${C.teal}06`, padding: '28px 32px' }}>
              <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Real photo via GitHub avatar */}
                <div style={{ flexShrink: 0, position: 'relative' }}>
                  <Image
                    src="https://github.com/jyotheeswar012-max.png"
                    alt="Jyotheeswar Reddy"
                    width={96}
                    height={96}
                    style={{ borderRadius: '50%', border: `3px solid ${C.teal}`, display: 'block', objectFit: 'cover' }}
                    unoptimized
                  />
                  <span style={{ position: 'absolute', bottom: 2, right: 2, background: C.green, borderRadius: '50%', width: 16, height: 16, border: '2px solid #060D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>&#9679;</span>
                </div>

                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 2 }}>Jyotheeswar Reddy</div>
                  <div style={{ fontSize: 14, color: C.teal, fontWeight: 700, marginBottom: 10 }}>
                    Full-Stack Engineer &middot; Blockchain Architect &middot; ML Engineer &middot; India Stack Specialist
                  </div>

                  {/* Credential pills */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[
                      { label: 'B.Tech Computer Science',          color: C.blue   },
                      { label: 'SBI YONO API Integrator',          color: C.orange },
                      { label: 'PMFBY Domain Expert',              color: C.green  },
                      { label: 'Solidity + Hyperledger Fabric',    color: C.amber  },
                      { label: 'DPDP Act 2023 Compliance',         color: C.teal   },
                      { label: 'NPCI IMPS + UPI Stack',            color: C.purple },
                    ].map(b => (
                      <span key={b.label} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${b.color}14`, color: b.color, border: `1px solid ${b.color}33` }}>{b.label}</span>
                    ))}
                  </div>

                  {/* Links */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <a href="https://github.com/jyotheeswar012-max" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: `${C.purple}14`, border: `1px solid ${C.purple}33`, color: C.purple, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                      GitHub &rarr;
                    </a>
                  </div>

                  <blockquote style={{ margin: 0, fontStyle: 'italic', color: C.text, fontSize: 14, borderLeft: `3px solid ${C.teal}`, paddingLeft: 14, lineHeight: 1.7 }}>
                    &ldquo;If the payout takes more than 3 seconds, we haven&rsquo;t solved the problem.
                    If the farmer has to sign a form, we haven&rsquo;t even started.&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>

            {/* ── WHY US ── */}
            <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900 }}>Why This Team Can Build This Product</h2>
              <p style={{ margin: '0 0 18px', fontSize: 12, color: C.sub }}>
                Four capabilities that are each rare individually — and almost impossible to find combined in one team.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {WHY_US.map((w, i) => (
                  <div key={i} style={{ padding: '18px 20px', borderRadius: 18, background: `${w.color}08`, border: `1px solid ${w.color}33` }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 22 }}>{w.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: w.color }}>{w.title}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: C.sub, lineHeight: 1.7 }}>{w.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DOMAIN EXPERIENCE ── */}
            <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900 }}>Domain Experience</h2>
              <p style={{ margin: '0 0 18px', fontSize: 12, color: C.sub }}>Specific, verifiable experience across the four technical domains IIE requires — not general programming skills.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {EXPERIENCE.map((exp, i) => (
                  <div key={i} style={{ borderRadius: 16, border: `1px solid ${exp.color}33`, background: `${exp.color}06`, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{exp.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: exp.color }}>{exp.domain}</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {exp.points.map((pt, j) => (
                        <li key={j} style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, marginBottom: 3 }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PROJECTS & RECOGNITION TIMELINE ── */}
            <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900 }}>Projects &amp; Recognition</h2>
              <p style={{ margin: '0 0 18px', fontSize: 12, color: C.sub }}>Relevant prior work that demonstrates this is not the first time building in this domain.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {PROJECTS.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 0 }}>
                    {/* Timeline spine */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.color}18`, border: `2px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      {i < PROJECTS.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 24, background: `${p.color}30`, margin: '4px 0' }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingLeft: 16, paddingBottom: i < PROJECTS.length - 1 ? 20 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: p.color, background: `${p.color}18`, padding: '2px 8px', borderRadius: 999, border: `1px solid ${p.color}33` }}>{p.year}</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{p.title}</span>
                      </div>
                      <div style={{ fontSize: 10, color: p.color, fontWeight: 700, marginBottom: 6 }}>{p.sub}</div>
                      <p style={{ margin: '0 0 8px', fontSize: 12, color: C.sub, lineHeight: 1.65 }}>{p.desc}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.tags.map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: '#0a1120', border: `1px solid ${C.border}`, color: C.sub }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote closer */}
            <div style={{ borderRadius: 16, border: `1px solid ${C.amber}33`, background: `${C.amber}06`, padding: '18px 22px' }}>
              <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.75 }}>
                <span style={{ color: C.amber, fontWeight: 800 }}>Why solo is a strength for IIE: </span>
                Full-stack ownership means the oracle quorum, smart contract, ML trigger, payment gateway, and YONO integration
                were designed as one coherent system &mdash; not bolted-together components from different teams.
                The 2.8-second end-to-end payout is only possible because every API call, timeout, and fallback path
                was designed by the same person who wrote the front-end that displays it.
              </p>
            </div>
          </div>
        )}

        {/* ── WHAT I BUILT TAB ── */}
        {tab === 'built' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 900 }}>What I Built &mdash; Mapped to GFF Criteria</h2>
              <p style={{ margin: '0 0 16px', fontSize: 11, color: C.sub }}>Every module built, tested, and deployed by one person. Each maps directly to a GFF evaluation criterion.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {BUILT.map((b, i) => (
                  <div key={i} style={{ padding: '14px 18px', borderRadius: 16, background: `${b.color}08`, border: `1px solid ${b.color}33` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: b.color, marginBottom: 5 }}>{b.area}</div>
                    <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>{b.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STACK TAB ── */}
        {tab === 'stack' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {STACK.map(s => (
              <div key={s.layer} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 18px', borderRadius: 14, border: `1px solid ${C.border}`, background: C.panel }}>
                <div style={{ width: 110, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: s.color, flexShrink: 0 }}>{s.layer}</div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{s.tech}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── COMPETITORS TAB ── */}
        {tab === 'competitors' && (
          <div>
            <div style={{ marginBottom: 14, padding: '10px 16px', borderRadius: 12, background: `${C.amber}10`, border: `1px solid ${C.amber}33`, fontSize: 13, color: C.sub }}>
              Competitor data from GFF submissions, public IRDAI filings, company websites. IIE differentiator:
              <span style={{ color: C.teal, fontWeight: 700 }}> real-time quorum + sub-3s payout + SBI KCC moat</span> &mdash; no competitor has all three.
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0a1120' }}>
                    {['Company', 'Enrollment', 'Settlement', 'Voice', 'Blockchain', 'Autonomous', 'Data Source'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.sub, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((c, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${C.border}`, background: c.name.includes('IIE') ? `${C.teal}06` : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: c.color, whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '12px 14px', color: C.sub, fontSize: 11 }}>{c.enroll}</td>
                      <td style={{ padding: '12px 14px', color: c.name.includes('IIE') ? C.green : C.red, fontWeight: c.name.includes('IIE') ? 800 : 400, fontSize: 11 }}>{c.settle}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: c.name.includes('IIE') ? C.green : C.red }}>{c.voice}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: c.name.includes('IIE') ? C.green : C.red }}>{c.chain}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: c.name.includes('IIE') ? C.green : C.red }}>{c.auto}</td>
                      <td style={{ padding: '12px 14px', color: C.sub, fontSize: 11 }}>{c.ndvi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
          {[
            { label: 'Judge Demo',  href: '/judge',   color: C.orange },
            { label: 'Agentic AI',  href: '/agentic', color: C.purple },
            { label: 'Impact',      href: '/impact',  color: C.amber  },
            { label: 'Home',        href: '/',        color: C.sub    },
          ].map(b => (
            <Link key={b.href} href={b.href} style={{ padding: '9px 18px', borderRadius: 12, background: `${b.color}12`, border: `1px solid ${b.color}44`, color: b.color, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
              {b.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
