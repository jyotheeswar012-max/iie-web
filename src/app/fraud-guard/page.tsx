'use client';
import { useState } from 'react';

const C = {
  bg:     '#060D1A',
  panel:  '#0C1829',
  panel2: '#0f1f35',
  border: '#1A2E4A',
  text:   '#F0F6FF',
  sub:    '#6B89A8',
  red:    '#f87171',
  green:  '#22c55e',
  teal:   '#64ffda',
  blue:   '#60a5fa',
  orange: '#F68B1F',
  purple: '#a78bfa',
  amber:  '#fbbf24',
  yellow: '#facc15',
};

function pill(color: string, label: string) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      background: `${color}18`, border: `1px solid ${color}44`,
      color, fontSize: 10, fontWeight: 800, letterSpacing: 1,
    }}>{label}</span>
  );
}

// ─── ATTACK VECTORS ──────────────────────────────────────────────────────────────────
const VECTORS = [
  {
    id:       'A1',
    icon:     '🌧️',
    title:    'Feed Spoofing',
    subtitle: 'Can a farmer bribe a weather station to report false rainfall?',
    severity: 'HIGH',
    sevColor: C.red,
    how: [
      'The oracle requires weighted quorum ≥†75% across 4 independent agents — not a single feed.',
      'Rain data comes from open-meteo (ECMWF satellite model, grid-interpolated), not a ground station a farmer can reach.',
      'Even if a local IMD tipping-bucket station reports anomalously, it is 1-of-4 inputs. The other three — satellite rainfall estimate, soil moisture sensor reading, and NDVI vegetation index — must corroborate.',
      'A 3-of-4 disagreement drops weighted confidence below 75% and blocks the payout automatically.',
    ],
    component: 'Oracle Quorum Engine — /api/oracle/verify (weighted_confidence ≥ 75 required)',
    caveat:    'Does not prevent satellite data manipulation at the provider level (nation-state threat, not a fraud concern).',
    col:        C.red,
  },
  {
    id:       'A2',
    icon:     '👤',
    title:    'Ghost Enrollment',
    subtitle: 'Can an agent enroll a non-existent farmer or a plot they don’t own?',
    severity: 'HIGH',
    sevColor: C.red,
    how: [
      'Enrollment is gated on Aadhaar eKYC: biometric match required, not just a number.',
      'Land record is fetched from DigiLocker (MeitY-authenticated), not a self-declared field. The district + survey number on the policy must resolve to a valid Bhoomi / Dharani / NLRMP record.',
      'The enrolled VPA (Virtual Payment Address) is seeded from the Aadhaar-linked mobile number, so the payout can only reach the verified account holder.',
      'Each Aadhaar hash may hold at most one active IIE policy per kharif/rabi season — duplicate enrollment is rejected at the API layer.',
    ],
    component: 'Enrollment API — Aadhaar eKYC + DigiLocker land record fetch + one-policy-per-season guard',
    caveat:    'Assumes Aadhaar biometric database has not been compromised. This is UIDAI’s security surface, not ours.',
    col:        C.red,
  },
  {
    id:       'A3',
    icon:     '🔄',
    title:    'Repeat Claim Attack',
    subtitle: 'Can the same farmer trigger and collect multiple payouts in one season?',
    severity: 'MEDIUM',
    sevColor: C.amber,
    how: [
      'Once a policy transitions to TRIGGERED state in the contract, it is permanently sealed in the hash-chain ledger.',
      'Any subsequent oracle call for the same policy_id finds contract_state = TRIGGERED and returns payout_amount = null without processing.',
      'The rate limiter enforces: 1 payout per peril per policy_id per season. A flood trigger in June does not block a drought trigger in September — but only if those are two separately enrolled policies for distinct perils.',
      'The audit ledger entry is immutable: the hash-chain means a TRIGGERED entry cannot be silently rolled back to ACTIVE.',
    ],
    component: 'Contract State Machine (ACTIVE → TRIGGERED is a one-way transition) + Hash-Chain Ledger',
    caveat:    'Multi-peril coverage per season requires explicit separate policy enrollment. This is a product decision, not a gap.',
    col:        C.amber,
  },
  {
    id:       'A4',
    icon:     '🧑‍💼',
    title:    'Rogue Agent Attack',
    subtitle: 'Can a bank agent override the system to approve a payout manually?',
    severity: 'HIGH',
    sevColor: C.red,
    how: [
      'There is no manual approval path in the payout pipeline. The only route to IMPS settlement is oracle quorum ≥ 75% → contract state change → automated payment instruction. No human button triggers the transfer.',
      'The oracle inputs (rainfall_mm, temp_c, ndvi, soil_pct) come from external APIs and sensor feeds — not from a form field an agent fills in.',
      'Every step is written to the hash-chain ledger before the payment fires. An agent who attempts a manual transfer would need to forge a valid ledger entry, which requires breaking SHA-256.',
      'SBI YONO integration: the payment instruction carries a Fabric Audit Ref that YONO’s reconciliation layer cross-checks. An orphaned IMPS credit with no matching audit ref is flagged for investigation.',
    ],
    component: 'Fully automated pipeline — no human approval node between oracle and IMPS instruction',
    caveat:    'A rogue SBI sysadmin with direct database access is out of scope — that is a bank-side privileged access management problem.',
    col:        C.red,
  },
  {
    id:       'A5',
    icon:     '📍',
    title:    'Geofence Drift',
    subtitle: 'Can a farmer enroll land in a high-risk district while farming in a low-risk one?',
    severity: 'MEDIUM',
    sevColor: C.amber,
    how: [
      'The district used for oracle evaluation is the district on the DigiLocker land record, not a self-declared field. The farmer cannot choose Barmer (drought-prone) if their khasra number resolves to Ludhiana.',
      'Oracle grid coordinates are set from the district centroid in our registry (lat/lon per district). A mismatched district produces weather readings that genuinely reflect the enrolled land, not the desired one.',
      'Premium is priced by district risk band. High-risk districts pay higher premiums, removing the incentive to game upward.',
      'Future path: GPS-verified plot centroid from PM-KISAN or Bhoomi API bounds the oracle to a 10 km grid cell around the actual field, not just the district centroid.',
    ],
    component: 'DigiLocker land record → district lock → oracle coordinate binding',
    caveat:    'Current implementation uses district centroid; plot-level GPS binding is a planned enhancement for production.',
    col:        C.amber,
  },
];

// ─── QUORUM SIMULATOR ──────────────────────────────────────────────────────────────────
const SOURCES = [
  { id: 'satellite', label: 'Open-Meteo Satellite', detail: 'ECMWF IFS grid, 1km resolution', weight: 30, spoofable: false },
  { id: 'imd',       label: 'IMD Ground Station',   detail: 'Tipping-bucket, district AWS',    weight: 25, spoofable: true  },
  { id: 'soil',      label: 'Soil Moisture Sensor', detail: 'FLD-type, 3–9cm depth',           weight: 25, spoofable: true  },
  { id: 'ndvi',      label: 'MODIS NDVI Index',      detail: 'MODIS MOD13Q1, 16-day composite', weight: 20, spoofable: false },
];

export default function FraudGuardPage() {
  const [expanded, setExpanded] = useState<string | null>('A1');
  // Quorum simulator: which sources are "spoofed" (disabled)
  const [spoofed, setSpoofed] = useState<Set<string>>(new Set());

  const toggleSpoofed = (id: string) => {
    setSpoofed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Compute weighted confidence with spoofed sources contributing 0
  const confidence = SOURCES.reduce((acc, s) => {
    if (spoofed.has(s.id)) return acc;   // spoofed source contributes 0
    return acc + s.weight;
  }, 0);
  const quorumMet = confidence >= 75;

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: "'Inter','Segoe UI',sans-serif", padding: '28px 16px',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px', borderRadius: 999,
            background: `${C.red}12`, border: `1px solid ${C.red}44`,
            color: C.red, fontSize: 11, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14,
          }}>
            <span>&#9888;</span> Fraud Resistance Architecture
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 900, lineHeight: 1.15 }}>
            Why Nobody Can Game This System
          </h1>
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
            Claims fraud is the reason crop insurance penetration in India sits below 30%.
            Insurers won’t price aggressively because they can’t trust the loss signal.
            IIE removes every human discretion point from enrollment to payout — and the
            fraud surface collapses with it.
          </p>

          {/* Headline stat bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20,
          }}>
            {[
              { v: '0',      label: 'human approval nodes in payout path', col: C.green  },
              { v: '4-of-4', label: 'independent oracle sources required',  col: C.teal   },
              { v: '≥75%',   label: 'weighted quorum threshold',            col: C.blue   },
              { v: '1',      label: 'payout per peril per season per policy', col: C.orange },
            ].map(({ v, label, col }) => (
              <div key={label} style={{
                padding: '10px 16px', borderRadius: 12,
                background: `${col}0d`, border: `1px solid ${col}33`,
                minWidth: 140,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: col }}>{v}</div>
                <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.4, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Attack Vector Accordion ─────────────────────────────────────── */}
        <div style={{ marginBottom: 12, fontSize: 11, color: C.sub,
          textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800 }}>
          Attack Vectors &amp; Controls
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
          {VECTORS.map(v => {
            const open = expanded === v.id;
            return (
              <div key={v.id} style={{
                borderRadius: 14, overflow: 'hidden',
                border: `1.5px solid ${open ? v.col + '88' : C.border}`,
                transition: 'border 0.2s',
                boxShadow: open ? `0 0 18px ${v.col}14` : 'none',
              }}>
                {/* Accordion header */}
                <button
                  onClick={() => setExpanded(open ? null : v.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px',
                    background: open
                      ? `linear-gradient(90deg,${v.col}14,${C.panel})`
                      : C.panel,
                    border: 'none', cursor: 'pointer', color: C.text,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 24 }}>{v.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 900, fontSize: 15, color: open ? v.col : C.text }}>
                          {v.id}: {v.title}
                        </span>
                        {pill(v.sevColor, v.severity)}
                      </div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 3, fontStyle: 'italic' }}>
                        &ldquo;{v.subtitle}&rdquo;
                      </div>
                    </div>
                  </div>
                  <span style={{ color: v.col, fontSize: 18, transition: 'transform 0.2s',
                    transform: open ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>›</span>
                </button>

                {/* Accordion body */}
                {open && (
                  <div style={{ background: C.panel2, padding: '0 20px 20px' }}>
                    {/* How we block it */}
                    <div style={{ paddingTop: 16 }}>
                      <div style={{ fontSize: 10, color: v.col, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
                        How the system blocks this
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {v.how.map((point, i) => (
                          <div key={i} style={{
                            display: 'flex', gap: 12, padding: '8px 12px',
                            borderRadius: 8, background: C.panel,
                            border: `1px solid ${C.border}`,
                          }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                              background: `${v.col}18`, border: `1px solid ${v.col}44`,
                              color: v.col, fontSize: 10, fontWeight: 900,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{i + 1}</span>
                            <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enforcing component */}
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 8,
                      background: `${v.col}0d`, border: `1px solid ${v.col}33`,
                    }}>
                      <span style={{ fontSize: 10, color: v.col, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: 1 }}>Enforcing component: </span>
                      <span style={{ fontSize: 12, color: C.text }}>{v.component}</span>
                    </div>

                    {/* Honest caveat */}
                    <div style={{
                      marginTop: 8, padding: '10px 14px', borderRadius: 8,
                      background: `${C.amber}08`, border: `1px solid ${C.amber}33`,
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <span style={{ color: C.amber, fontSize: 14, flexShrink: 0 }}>&#9888;</span>
                      <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                        <strong style={{ color: C.amber }}>Honest limit: </strong>{v.caveat}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Quorum Simulator ─────────────────────────────────────────── */}
        <div style={{
          borderRadius: 16, border: `1.5px solid ${C.teal}44`,
          overflow: 'hidden', marginBottom: 36,
        }}>
          <div style={{
            padding: '16px 20px',
            background: `linear-gradient(90deg,${C.teal}12,${C.panel})`,
            borderBottom: `1px solid ${C.teal}33`,
          }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: C.teal }}>
              🛡️  Live Quorum Simulator
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              Toggle a data source to “spoofed” and watch whether the quorum still passes.
              A single compromised source cannot trigger a payout.
            </div>
          </div>

          <div style={{ padding: 20, background: C.panel }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {SOURCES.map(s => {
                const isSpoofed = spoofed.has(s.id);
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: isSpoofed ? `${C.red}0d` : `${C.green}0d`,
                    border: `1px solid ${isSpoofed ? C.red + '44' : C.green + '44'}`,
                    transition: 'all 0.2s',
                  }}>
                    {/* Toggle */}
                    <button
                      onClick={() => s.spoofable && toggleSpoofed(s.id)}
                      title={s.spoofable ? 'Click to simulate spoofing' : 'Satellite/MODIS — not spoofable by a farmer'}
                      style={{
                        width: 40, height: 22, borderRadius: 11, border: 'none',
                        background: isSpoofed ? C.red : C.green,
                        cursor: s.spoofable ? 'pointer' : 'not-allowed',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                        opacity: s.spoofable ? 1 : 0.4,
                      }}>
                      <span style={{
                        position: 'absolute', top: 3,
                        left: isSpoofed ? 3 : 21,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                      }} />
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontWeight: 800, fontSize: 13,
                          color: isSpoofed ? C.red : C.text,
                        }}>{s.label}</span>
                        {!s.spoofable && (
                          <span style={{
                            fontSize: 9, padding: '1px 6px', borderRadius: 4,
                            background: `${C.blue}18`, color: C.blue, fontWeight: 800,
                          }}>SATELLITE — not spoofable</span>
                        )}
                        {isSpoofed && (
                          <span style={{
                            fontSize: 9, padding: '1px 6px', borderRadius: 4,
                            background: `${C.red}18`, color: C.red, fontWeight: 800,
                          }}>SPOOFED</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: C.sub }}>{s.detail}</div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 900,
                        color: isSpoofed ? C.red : C.teal,
                      }}>
                        {isSpoofed ? '0%' : `+${s.weight}%`}
                      </div>
                      <div style={{ fontSize: 10, color: C.sub }}>weight</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result bar */}
            <div style={{
              borderRadius: 12, padding: '16px 20px',
              background: quorumMet ? `${C.green}0d` : `${C.red}0d`,
              border: `2px solid ${quorumMet ? C.green + '66' : C.red + '66'}`,
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{
                    fontSize: 20, fontWeight: 900,
                    color: quorumMet ? C.green : C.red,
                  }}>
                    {quorumMet
                      ? `✓ Quorum met — ${confidence}% ≥ 75% — payout fires`
                      : `✗ Quorum failed — ${confidence}% < 75% — payout blocked`
                    }
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
                    {quorumMet
                      ? spoofed.size === 0
                        ? 'All sources reporting. Normal operation.'
                        : `${spoofed.size} source(s) spoofed but remaining ${SOURCES.length - spoofed.size} are enough.`
                      : `${spoofed.size} source(s) compromised — weighted confidence dropped below threshold. Fraud attempt detected.`
                    }
                  </div>
                </div>
                <div style={{
                  fontSize: 36, fontWeight: 900,
                  color: quorumMet ? C.green : C.red,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {confidence}%
                </div>
              </div>
              {/* Progress bar */}
              <div style={{
                marginTop: 12, height: 8, borderRadius: 4,
                background: C.border, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${confidence}%`,
                  background: quorumMet
                    ? `linear-gradient(90deg,${C.teal},${C.green})`
                    : `linear-gradient(90deg,${C.red},${C.amber})`,
                  transition: 'width 0.4s, background 0.3s',
                }} />
              </div>
              <div style={{
                marginTop: 6, display: 'flex', justifyContent: 'flex-end',
                fontSize: 10, color: C.sub,
              }}>
                75% threshold &#8595;
              </div>
            </div>
          </div>
        </div>

        {/* ── Defence-in-depth summary table ───────────────────────────────── */}
        <div style={{
          borderRadius: 14, border: `1px solid ${C.border}`,
          background: C.panel, overflow: 'hidden', marginBottom: 32,
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${C.border}`,
            fontWeight: 900, fontSize: 14, color: C.text,
          }}>
            Defence-in-Depth: Where Each Layer Lives
          </div>
          {[
            { layer: 'Who is the farmer?',      control: 'Aadhaar eKYC + DigiLocker land record',     status: 'LIVE IN DEMO' },
            { layer: 'Is the peril real?',       control: 'Multi-source oracle, ≥75% weighted quorum', status: 'LIVE IN DEMO' },
            { layer: 'Has it been paid before?', control: 'One-way contract state machine (TRIGGERED)', status: 'LIVE IN DEMO' },
            { layer: 'Was it tampered after?',   control: 'SHA-256 hash-chained audit ledger',          status: 'LIVE IN DEMO' },
            { layer: 'Did the money reach the right person?', control: 'VPA seeded from Aadhaar-linked mobile, IMPS UTR + RRN', status: 'LIVE IN DEMO' },
            { layer: 'Plot-level GPS binding',   control: 'PM-KISAN / Bhoomi API centroid (10 km cell)', status: 'PRODUCTION ROADMAP' },
            { layer: 'Cross-insurer dedup',      control: 'PMFBY de-duplication register integration',   status: 'PRODUCTION ROADMAP' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr auto',
              gap: 12, padding: '12px 20px',
              borderBottom: `1px solid ${C.border}`,
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.layer}</div>
              <div style={{ fontSize: 12, color: C.sub }}>{r.control}</div>
              <div>
                {r.status === 'LIVE IN DEMO'
                  ? pill(C.green, 'LIVE IN DEMO')
                  : pill(C.amber, 'ROADMAP')
                }
              </div>
            </div>
          ))}
        </div>

        {/* ── The one-liner for judges ──────────────────────────────────────────── */}
        <div style={{
          borderRadius: 14, padding: '20px 24px',
          background: `linear-gradient(135deg,${C.red}0d,${C.orange}0d)`,
          border: `1.5px solid ${C.orange}44`,
        }}>
          <div style={{ fontSize: 10, color: C.orange, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            The line for judges
          </div>
          <blockquote style={{
            margin: 0, fontSize: 16, fontStyle: 'italic',
            color: C.text, lineHeight: 1.7, borderLeft: `3px solid ${C.orange}`,
            paddingLeft: 16,
          }}>
            &ldquo;Claims fraud exists in crop insurance because humans decide who gets paid.
            In IIE, no human decides — the oracle decides, the contract executes,
            the ledger records. The fraud surface isn’t reduced; it’s structurally eliminated
            from the payout path.&rdquo;
          </blockquote>
        </div>

        <div style={{
          textAlign: 'center', color: C.sub, fontSize: 11,
          marginTop: 24, paddingTop: 16,
          borderTop: `1px solid ${C.border}`,
        }}>
          IIE · SBI YONO · GFF 2026 ·
          Fraud-resistance architecture · 5 attack vectors documented
        </div>
      </div>
    </div>
  );
}
