'use client';
import { useState } from 'react';

const C = {
  bg:     '#06080F',
  panel:  '#0C1420',
  panel2: '#0f1d2e',
  border: '#1A2840',
  text:   '#F0F6FF',
  sub:    '#6B89A8',
  teal:   '#64ffda',
  green:  '#22c55e',
  blue:   '#60a5fa',
  orange: '#F68B1F',
  amber:  '#fbbf24',
  red:    '#f87171',
  purple: '#a78bfa',
};

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      background: `${color}18`, border: `1px solid ${color}44`,
      color, fontSize: 10, fontWeight: 800, letterSpacing: 1,
    }}>{label}</span>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      fontSize: 10, color, fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: 2.5,
      marginBottom: 16,
    }}>{label}</div>
  );
}

// ─── SECTION 1: IRDAI SANDBOX ────────────────────────────────────────────────
const SANDBOX_CRITERIA = [
  { ok: true,  item: 'Promotes innovation beneficial to insurance sector in India' },
  { ok: true,  item: 'In the interest of policyholders (faster settlement, zero paperwork)' },
  { ok: true,  item: 'Conducive to orderly growth — parametric market precedent exists (WBCIS, PMFBY)' },
  { ok: true,  item: 'Promotes increase in insurance penetration (currently <30% smallholder)' },
  { ok: true,  item: 'Brings efficiency in insurance business (auto-trigger replaces field adjuster)' },
  { ok: true,  item: 'Promotes ease of doing insurance business (API-first, no paper forms)' },
  { ok: false, item: 'Applicant must be an IRDAI-licensed entity or partner with one — IIE applies as InsurTech platform; SBI General underwrites' },
];

const PARAMETRIC_PRECEDENTS = [
  { name: 'WBCIS (Weather-Based Crop Insurance Scheme)', detail: 'State-run parametric crop insurance since 2007. Triggers on IMD weather station readings. Already establishes data-driven payout as legally valid in Indian insurance law.', status: 'ESTABLISHED' },
  { name: 'PMFBY parametric component', detail: 'Area-yield index insurance with parametric triggers for mid-season adversity. SBI General Insurance is an active PMFBY implementer — IIE extends this model.', status: 'ESTABLISHED' },
  { name: 'IRDAI Sandbox: 11 parametric products approved (FY2022–25)', detail: 'IRDAI Innovation Sandbox has approved 11 commercial parametric products for piloting. 4 are transitioning to full product approval as of March 2025.', status: 'PRECEDENT' },
  { name: 'Heatwave disruption parametric (Rajasthan & MP pilot)', detail: 'IRDAI sandbox pilots in Rajasthan and MP tested heat-trigger (44–46°C threshold) parametric covers. Trigger events: 2–4 per season. This is IIE\'s exact peril and geography.', status: 'DIRECTLY RELEVANT' },
];

// ─── SECTION 2: DPDP COMPLIANCE ──────────────────────────────────────────────
const DPDP_PRINCIPLES = [
  {
    principle: 'Data Minimisation',
    requirement: 'Collect only what is necessary for the stated purpose',
    implementation: 'IIE stores: Aadhaar SHA-256 hash (not the number), district code, land parcel ID, UPI VPA. No raw biometric. No family data. No income data.',
    status: 'COMPLIANT',
    col: C.green,
  },
  {
    principle: 'Purpose Limitation',
    requirement: 'Data may not be used beyond the stated purpose',
    implementation: 'Three purposes, each with separate on-chain consent event: (1) enrollment eKYC, (2) oracle evaluation, (3) IMPS settlement. Consent hash stored on Hyperledger Fabric ledger with timestamp.',
    status: 'COMPLIANT',
    col: C.green,
  },
  {
    principle: 'Storage Limitation',
    requirement: 'Data must not be retained beyond necessity',
    implementation: 'Policy data retained 7 years (IRDAI statutory minimum). After 7 years, all PII fields are zeroed; only the anonymised oracle outcome and payout amount remain for audit.',
    status: 'COMPLIANT',
    col: C.green,
  },
  {
    principle: 'Consent & Notice',
    requirement: 'Data Principal must give free, informed, specific consent',
    implementation: 'Consent collected at enrollment via YONO UI — three per-purpose checkboxes, plain-language in regional language. Consent withdrawal available at any time via YONO settings; withdrawal freezes new policy issuance but does not affect in-force policies.',
    status: 'COMPLIANT',
    col: C.green,
  },
  {
    principle: 'Data Principal Rights',
    requirement: 'Right to access, correction, and erasure',
    implementation: 'Farmers can view all stored data via YONO dashboard. Correction requests routed to DPO within 72 hours. Erasure available post-policy expiry (cannot erase during active cover period — insurance regulatory obligation supersedes).',
    status: 'COMPLIANT',
    col: C.green,
  },
  {
    principle: 'Cross-Border Restriction',
    requirement: 'Personal data may not be transferred to countries not notified by GOI',
    implementation: 'All data resides on SBI-hosted infrastructure in India. Oracle data pulled from open APIs (Open-Meteo, ISRO, IMD) — no personal data transmitted to foreign servers. Zero cross-border transfer.',
    status: 'COMPLIANT',
    col: C.green,
  },
  {
    principle: 'Aadhaar-Specific (UIDAI)',
    requirement: 'Aadhaar number must not be stored in plaintext; eKYC via UIDAI-certified AUA/KUA only',
    implementation: 'IIE uses SBI\'s existing AUA (Authentication User Agency) licence. Aadhaar number hashed at point of entry using SHA-256 + per-user salt. UIDAI Virtual ID (VID) used for subsequent authentications. No Aadhaar number ever written to any IIE database.',
    status: 'COMPLIANT',
    col: C.green,
  },
];

// ─── SECTION 3: PILOT PARTNER ────────────────────────────────────────────────
const PARTNER_REASONS = [
  {
    icon: '🏦',
    title: 'Already a PMFBY implementer',
    detail: 'SBI General Insurance is one of India\'s largest PMFBY implementing insurers, with active portfolios in MP, Rajasthan, UP, and Maharashtra. They have the district-level land record integration and state government MoUs that a new entrant would spend 18 months acquiring.',
  },
  {
    icon: '🔗',
    title: 'SBI Group alignment',
    detail: 'SBI holds 70% of SBI General. The CBS (Finacle) integration IIE needs for IMPS settlement already exists inside the group. A pilot MoU between IIE (technology layer) and SBI General (underwriting layer) is a single-group conversation, not a multi-party procurement.',
  },
  {
    icon: '⚡',
    title: 'Parametric is faster to file than indemnity',
    detail: 'Under IRDAI (Insurance Products) Regulations 2024, parametric products with defined index triggers and fixed payouts follow a simplified Use & File procedure — no actuarial justification for individual loss assessment required. SBI General can file a heatwave parametric product for a 5-district pilot in 6–8 weeks.',
  },
  {
    icon: '📋',
    title: 'Regulatory sandbox sponsor',
    detail: 'Under IRDAI Sandbox Regulations 2025, the application must be filed by or co-filed with an IRDAI-licensed entity. SBI General as the licensed insurer co-applies; IIE as the InsurTech platform is the named innovation partner. This is the standard sandbox partnership structure.',
  },
];

// ─── SECTION 4: PILOT ROADMAP ────────────────────────────────────────────────
const MILESTONES = [
  {
    q: 'Q3 2026',
    label: 'Foundation',
    col: C.blue,
    status: 'NOW',
    items: [
      'Finalise SBI General MoU (technology partnership, not underwriting)',
      'File IRDAI Regulatory Sandbox application (co-filed with SBI General)',
      'Select 5 pilot districts in MP — all existing PMFBY coverage areas with IMD station within 15km',
      'Peril: heatwave only (temp_c ≥ 45°C for 3 consecutive days)',
      'Target: 10,000 farmer policies, avg sum insured ₹40,000',
    ],
  },
  {
    q: 'Q4 2026',
    label: 'Sandbox Approval',
    col: C.teal,
    status: 'GATE 1',
    items: [
      'IRDAI sandbox permission granted (6-month experiment period)',
      'SBI General files heatwave parametric product under Use & File',
      'Enrollment opens on SBI YONO — voice + Hindi — rabi season cutoff',
      'Oracle quorum tested live: Open-Meteo + IMD + ISRO NDVI + soil sensor',
      'DPDP compliance audit by SBI\'s internal DPO before any enrollment',
    ],
  },
  {
    q: 'Q1 2027',
    label: 'First Live Season',
    col: C.green,
    status: 'GATE 2',
    items: [
      'Kharif 2027 season: policies active, oracle watching',
      'First payout trigger event: any district crossing heatwave threshold',
      'Sub-3-second IMPS settlement demonstrated live with RRN/UTR audit trail',
      'Basis risk monitoring: compare auto-payout outcomes vs PMFBY indemnity outcomes for same farmers',
      'Publish sandbox interim report to IRDAI',
    ],
  },
  {
    q: 'Q2–Q3 2027',
    label: 'Sandbox Completion',
    col: C.orange,
    status: 'GATE 3',
    items: [
      'Sandbox experiment period ends. File completion report with IRDAI.',
      'Outcome metrics: settlement speed, fraud incidents (target: 0), farmer NPS',
      'Apply for full IRDAI product approval based on sandbox data',
      'Expand to 2nd peril (drought — NDVI deficit) using same oracle infrastructure',
      '2nd state: Rajasthan (highest heatwave frequency, lowest PMFBY penetration)',
    ],
  },
  {
    q: 'Q4 2027 – Q1 2028',
    label: 'Commercial Scale',
    col: C.purple,
    status: 'SCALE',
    items: [
      'Full IRDAI product approval: heatwave + drought parametric, pan-India filing',
      'SBI Core Banking (Finacle CBS) integration for direct loan account linkage',
      'PM-FASAL subsidy routing: IIE policies qualify for government premium subsidy',
      '50 districts, 5 lakh farmers, 3 perils (heatwave, drought, excess rainfall)',
      'Target: ₹2,000 Cr insured value by end of FY2028',
    ],
  },
];

const GATES = [
  { label: 'Sandbox Application Filed',       gate: '≥1 IRDAI-licensed co-applicant', col: C.blue   },
  { label: 'First Season Completion',          gate: '≥5,000 policies, 0 fraud events', col: C.teal  },
  { label: 'Full Product Approval',            gate: 'Sandbox interim report accepted', col: C.green },
  { label: '₹2,000 Cr insured value',          gate: '50 districts, 3 perils live',     col: C.purple},
];

export default function RegulatoryPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [expandedDpdp, setExpandedDpdp] = useState<number | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(0);

  const SECTIONS = [
    { id: 0, label: 'IRDAI Pathway',    icon: '⚖️',  col: C.blue   },
    { id: 1, label: 'DPDP Compliance', icon: '🔒',  col: C.teal   },
    { id: 2, label: 'Pilot Partner',   icon: '🤝',  col: C.orange },
    { id: 3, label: '12–18M Roadmap',  icon: '🗺️',  col: C.purple },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '36px 24px 28px',
        background: 'linear-gradient(180deg,#0C1D30 0%,#06080F 100%)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px', borderRadius: 999,
            background: `${C.blue}12`, border: `1px solid ${C.blue}44`,
            color: C.blue, fontSize: 11, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16,
          }}>
            ⚖️ Regulatory &amp; Pilot Strategy
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 900, lineHeight: 1.2 }}>
            This isn&rsquo;t a toy.
          </h1>
          <p style={{
            margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.7, maxWidth: 620,
          }}>
            Here is the exact regulatory pathway, the DPDP compliance architecture,
            the partner logic, and the 12–18 month pilot plan
            that turns a working demo into a licensed insurance product.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 60px' }}>
        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{
                padding: '10px 18px', borderRadius: 12, border: `1px solid ${
                  activeSection === s.id ? s.col : C.border}`,
                background: activeSection === s.id ? `${s.col}18` : C.panel,
                color: activeSection === s.id ? s.col : C.sub,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        {/* ── SECTION 0: IRDAI ─────────────────────────────────────────────── */}
        {activeSection === 0 && (
          <div>
            <SectionHeader label="IRDAI Regulatory Sandbox Regulations 2025" color={C.blue} />

            <div style={{
              padding: '16px 20px', borderRadius: 14,
              background: `${C.blue}0d`, border: `1px solid ${C.blue}33`,
              marginBottom: 20, fontSize: 13, color: C.sub, lineHeight: 1.7,
            }}>
              IRDAI notified the <strong style={{ color: C.text }}>Regulatory Sandbox Regulations 2025</strong> on
              3 January 2025, replacing the 2019 framework. The new regulations
              allow any entity — not just licensed insurers — to apply for a sandbox
              experiment period, provided they meet six eligibility criteria and
              partner with or become a licensed entity before enrollment begins.
              The experiment period cap is <strong style={{ color: C.text }}>12 months</strong> (extendable).
              IIE satisfies all six criteria.
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginBottom: 10 }}>Eligibility checklist — all six criteria:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SANDBOX_CRITERIA.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10,
                    background: C.panel, border: `1px solid ${
                      c.ok ? C.green + '33' : C.amber + '44'}`,
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ color: c.ok ? C.green : C.amber, fontSize: 16, flexShrink: 0 }}>
                      {c.ok ? '✓' : '⚠'}
                    </span>
                    <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{c.item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginBottom: 10 }}>Parametric precedents that de-risk IRDAI approval:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PARAMETRIC_PRECEDENTS.map((p, i) => {
                const col = p.status === 'DIRECTLY RELEVANT' ? C.teal
                          : p.status === 'PRECEDENT' ? C.blue : C.green;
                return (
                  <div key={i} style={{
                    borderRadius: 12, padding: '14px 18px',
                    background: C.panel, border: `1px solid ${col}33`,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 10, marginBottom: 6, flexWrap: 'wrap',
                    }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{p.name}</span>
                      <Pill color={col} label={p.status} />
                    </div>
                    <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{p.detail}</div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: 20, padding: '14px 18px', borderRadius: 12,
              background: `${C.teal}0d`, border: `1px solid ${C.teal}33`,
              fontSize: 13, color: C.sub, lineHeight: 1.7,
            }}>
              <strong style={{ color: C.teal }}>Key precedent: </strong>
              WBCIS (Weather-Based Crop Insurance Scheme) has operated IMD-triggered
              parametric payouts in Indian agriculture since 2007. IIE does not need
              to persuade IRDAI that parametric is valid — it is already the law
              for crop insurance. IIE needs only to demonstrate that its
              multi-source oracle is a more accurate and fraud-resistant trigger
              than a single ground station reading.
            </div>
          </div>
        )}

        {/* ── SECTION 1: DPDP ──────────────────────────────────────────────── */}
        {activeSection === 1 && (
          <div>
            <SectionHeader label="DPDP Act 2023 — Compliance Architecture" color={C.teal} />

            <div style={{
              padding: '14px 18px', borderRadius: 12,
              background: `${C.teal}0d`, border: `1px solid ${C.teal}33`,
              marginBottom: 20, fontSize: 13, color: C.sub, lineHeight: 1.7,
            }}>
              The Digital Personal Data Protection Act 2023 applies to all digital
              processing of personal data of Indian residents. Farmer enrollment data —
              Aadhaar-linked identity, land records, mobile number — is personal data
              under DPDP. IIE\'s architecture was designed from the ground up
              to comply. Every principle below has a specific technical control.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DPDP_PRINCIPLES.map((p, i) => {
                const open = expandedDpdp === i;
                return (
                  <div key={i} style={{
                    borderRadius: 12, border: `1px solid ${
                      open ? p.col + '66' : C.border}`,
                    overflow: 'hidden', transition: 'border 0.2s',
                  }}>
                    <button
                      onClick={() => setExpandedDpdp(open ? null : i)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '14px 18px', border: 'none', cursor: 'pointer',
                        background: open ? `${p.col}0d` : C.panel,
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: 12, color: C.text,
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: p.col, fontSize: 16 }}>✓</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: open ? p.col : C.text }}>
                            {p.principle}
                          </div>
                          <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                            {p.requirement}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <Pill color={p.col} label={p.status} />
                        <span style={{ color: C.sub, fontSize: 14 }}>{open ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {open && (
                      <div style={{
                        padding: '0 18px 16px',
                        background: C.panel2,
                        borderTop: `1px solid ${p.col}22`,
                      }}>
                        <div style={{
                          marginTop: 14, fontSize: 13, color: C.sub,
                          lineHeight: 1.75,
                        }}>
                          <strong style={{ color: C.text }}>IIE implementation: </strong>
                          {p.implementation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION 2: PILOT PARTNER ─────────────────────────────────────── */}
        {activeSection === 2 && (
          <div>
            <SectionHeader label="Pilot Partner — SBI General Insurance" color={C.orange} />

            <div style={{
              padding: '18px 20px', borderRadius: 14,
              background: `${C.orange}0d`, border: `1.5px solid ${C.orange}44`,
              marginBottom: 24,
            }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: C.text, marginBottom: 8 }}>
                Why SBI General, not a fresh insurer?
              </div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
                The two hardest things in Indian crop insurance are not the technology —
                they are <strong style={{ color: C.text }}>state government MoUs</strong> and
                <strong style={{ color: C.text }}> PMFBY district allocation</strong>.
                SBI General already has both. IIE brings the oracle, the automation,
                and the fraud resistance. SBI General brings the licence, the district
                coverage, and the reinsurance. Neither can do this alone;
                together, the pilot roadmap compresses from 5 years to 18 months.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PARTNER_REASONS.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, padding: '16px 18px',
                  borderRadius: 12, background: C.panel,
                  border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 5 }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20, padding: '16px 20px', borderRadius: 12,
              background: C.panel, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Pilot structure (one-pager)</div>
              {[
                { k: 'Technology layer',   v: 'IIE — oracle, smart contract, YONO enrollment, audit ledger' },
                { k: 'Underwriting layer', v: 'SBI General Insurance (IRDAI licence CIN: U66000MH2009PLC190546)' },
                { k: 'Distribution',       v: 'SBI YONO app + SBI branch network (existing KYC-verified base)' },
                { k: 'Settlement',         v: 'SBI IMPS via Finacle CBS — existing group infrastructure' },
                { k: 'Reinsurance',        v: 'GIC Re mandatory cession (5%) + optional surplus from Lloyd\'s India' },
                { k: 'State regulator',    v: 'State Agriculture Dept MoU (MP has active PMFBY MoU with SBI General)' },
              ].map(({ k, v }) => (
                <div key={k} style={{
                  display: 'grid', gridTemplateColumns: '180px 1fr',
                  gap: 12, padding: '8px 0',
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.sub }}>{k}</div>
                  <div style={{ fontSize: 12, color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 3: ROADMAP ───────────────────────────────────────────── */}
        {activeSection === 3 && (
          <div>
            <SectionHeader label="12–18 Month Pilot Roadmap — One State, One Peril" color={C.purple} />

            <div style={{
              padding: '14px 18px', borderRadius: 12,
              background: `${C.purple}0d`, border: `1px solid ${C.purple}33`,
              marginBottom: 20, fontSize: 13, color: C.sub, lineHeight: 1.7,
            }}>
              Pilot scope is deliberately narrow:
              <strong style={{ color: C.text }}> Madhya Pradesh</strong>,
              <strong style={{ color: C.text }}> 5 districts</strong>,
              <strong style={{ color: C.text }}> heatwave peril only</strong>,
              <strong style={{ color: C.text }}> 10,000 farmers</strong>,
              kharif 2027 season. This is the minimum viable scope to generate
              IRDAI-acceptable sandbox data and a statistically significant
              fraud-free payout record. Scale comes after the data, not before.
            </div>

            {/* Milestone cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {MILESTONES.map((m, i) => {
                const open = expandedMilestone === i;
                return (
                  <div key={i} style={{
                    borderRadius: 14, overflow: 'hidden',
                    border: `1.5px solid ${open ? m.col + '88' : C.border}`,
                    transition: 'border 0.2s',
                    boxShadow: open ? `0 0 16px ${m.col}14` : 'none',
                  }}>
                    <button
                      onClick={() => setExpandedMilestone(open ? null : i)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '14px 18px', border: 'none', cursor: 'pointer',
                        background: open
                          ? `linear-gradient(90deg,${m.col}14,${C.panel})`
                          : C.panel,
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: 12, color: C.text,
                        transition: 'background 0.2s',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                          background: `${m.col}18`, border: `1.5px solid ${m.col}44`,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ fontSize: 9, fontWeight: 900, color: m.col, letterSpacing: 0.5 }}>{m.q.split(' ')[0]}</div>
                          <div style={{ fontSize: 9, fontWeight: 900, color: m.col }}>{m.q.split(' ')[1]}</div>
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 900, fontSize: 15,
                            color: open ? m.col : C.text,
                          }}>{m.label}</div>
                          <Pill color={m.col} label={m.status} />
                        </div>
                      </div>
                      <span style={{ color: m.col, fontSize: 18,
                        transform: open ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
                    </button>

                    {open && (
                      <div style={{
                        background: C.panel2, padding: '4px 18px 18px',
                        borderTop: `1px solid ${m.col}22`,
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                          {m.items.map((item, j) => (
                            <div key={j} style={{
                              display: 'flex', gap: 10, padding: '8px 12px',
                              borderRadius: 8, background: C.panel,
                              border: `1px solid ${C.border}`, alignItems: 'flex-start',
                            }}>
                              <span style={{
                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                background: `${m.col}18`, border: `1px solid ${m.col}44`,
                                color: m.col, fontSize: 9, fontWeight: 900,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>{j + 1}</span>
                              <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scaling gates */}
            <div style={{ marginBottom: 8, fontSize: 11, color: C.sub,
              textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800 }}>Scaling gates — what unlocks each stage</div>
            <div style={{
              borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.panel, overflow: 'hidden',
            }}>
              {GATES.map((g, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 12, padding: '12px 18px',
                  borderBottom: i < GATES.length - 1 ? `1px solid ${C.border}` : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>
                    <span style={{ color: g.col, marginRight: 6 }}>→</span>{g.gate}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20, padding: '16px 18px', borderRadius: 12,
              background: `${C.amber}08`, border: `1px solid ${C.amber}33`,
              fontSize: 13, color: C.sub, lineHeight: 1.7,
            }}>
              <strong style={{ color: C.amber }}>Why one state, one peril? </strong>
              India\'s parametric insurance landscape has two dead pilots for every live product
              — most failed on pricing calibration and basis risk after scaling too fast.
              10,000 farmers in 5 MP districts gives us 2–3 trigger seasons of outcome data
              before we ask IRDAI for a pan-India product filing.
              The sandbox is the proof; the proof is the product.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
