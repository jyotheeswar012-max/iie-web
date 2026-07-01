'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const C = {
  bg:     '#06080F',
  panel:  '#0C1420',
  border: '#1A2840',
  text:   '#F0F6FF',
  sub:    '#6B89A8',
  red:    '#f87171',
  green:  '#22c55e',
  teal:   '#64ffda',
  blue:   '#60a5fa',
  orange: '#F68B1F',
  amber:  '#fbbf24',
  dim:    '#374151',
};

const TODAY = [
  { t: 'Day 0',    icon: '🌧️', label: 'Heatwave hits Bundelkhand',      detail: 'Temperature crosses 47°C for 3 consecutive days. Ramesh\'s cotton crop fails.', col: C.red    },
  { t: 'Day 3',    icon: '📝', label: 'Ramesh files a claim',            detail: 'He travels 40 km to the nearest insurance office. Fills 12 forms in Hindi — most of which he cannot read.', col: C.red    },
  { t: 'Day 24',   icon: '👨\u200d💼', label: 'Adjuster visits the field', detail: 'The adjuster arrives 3 weeks later. He disputes the loss estimate — says the damage looks like "pest infestation, not heatwave." Ramesh has no way to prove otherwise.', col: C.red    },
  { t: 'Day 31',   icon: '📄', label: 'Paperwork referred to head office', detail: 'Case escalated. Ramesh is told to wait. He has no harvest income, a loan due, and no timeline.', col: C.red    },
  { t: 'Day 118',  icon: '❌', label: 'Claim denied',                  detail: '"Insufficient documentation of peril." Ramesh receives nothing. He defaults on his Kisan Credit Card loan.', col: C.red    },
];

const WITH_IIE = [
  { t: 'Day 0',         icon: '🌡️', label: 'Satellite detects heatwave',  detail: 'Open-Meteo satellite data shows temp_c = 47.2°C for Ramesh\'s district. Threshold: 45°C. Crossed.', col: C.teal   },
  { t: '+ 0 seconds',   icon: '🧐', label: 'Oracle quorum fires',          detail: '4 independent agents evaluate: Risk Monitor, Verifier, Policy Match, Executor. Weighted confidence: 91%. Quorum met.', col: C.teal   },
  { t: '+ 1.1 seconds', icon: '⛓️', label: 'Contract state: TRIGGERED',    detail: 'Smart contract transitions ACTIVE → TRIGGERED. execute_payout() called automatically. No human decision.', col: C.blue   },
  { t: '+ 2.3 seconds', icon: '💸', label: 'SBI IMPS transfer fires',       detail: '₹52,000 sent to rameshkumar@sbi via NPCI IMPS. RRN: 924819023741. UTR: SBIN192305723. Status: SUCCESS.', col: C.green  },
  { t: '+ 3 seconds',   icon: '✅', label: 'Ramesh\'s phone buzzes',          detail: '"Credit ₹52,000 from SBI YONO IIE. Your heatwave policy has been settled. Ref: YONO1751339076." No form. No adjuster. No dispute.', col: C.green  },
];

export default function StoryPage() {
  const [reveal, setReveal]     = useState<'none'|'today'|'both'>('none');
  const [todayStep, setTodayStep] = useState(0);
  const [iieStep,   setIieStep]   = useState(0);
  const [iieRunning, setIieRunning] = useState(false);

  // Auto-step TODAY timeline when revealed
  useEffect(() => {
    if (reveal !== 'today' && reveal !== 'both') return;
    if (todayStep >= TODAY.length - 1) return;
    const t = setTimeout(() => setTodayStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [reveal, todayStep]);

  // Auto-step IIE timeline after a short delay
  useEffect(() => {
    if (!iieRunning) return;
    if (iieStep >= WITH_IIE.length - 1) { setIieRunning(false); return; }
    // IIE steps are fast (it's 3 seconds real-time, we dramatise at 600ms each)
    const t = setTimeout(() => setIieStep(s => s + 1), 600);
    return () => clearTimeout(t);
  }, [iieRunning, iieStep]);

  function startIie() {
    setIieStep(0);
    setIieRunning(true);
    setReveal('both');
  }

  function restart() {
    setReveal('none');
    setTodayStep(0);
    setIieStep(0);
    setIieRunning(false);
    setTimeout(() => setReveal('today'), 120);
  }

  const todayDone = todayStep >= TODAY.length - 1;
  const iieDone   = iieStep   >= WITH_IIE.length - 1;

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '48px 24px 36px',
        background: 'linear-gradient(180deg,#0C1420 0%,#06080F 100%)',
        borderBottom: `1px solid ${C.border}`,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 999,
          background: `${C.orange}14`, border: `1px solid ${C.orange}44`,
          color: C.orange, fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20,
        }}>IIE · SBI GFF 2026</div>

        <h1 style={{
          margin: '0 0 16px', fontSize: 'clamp(28px,6vw,52px)',
          fontWeight: 900, lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          Meet Ramesh.
        </h1>

        <p style={{
          maxWidth: 560, margin: '0 auto 12px', fontSize: 'clamp(15px,2.5vw,19px)',
          color: C.sub, lineHeight: 1.7,
        }}>
          He farms 4 acres of cotton in Bundelkhand.
          Last June, a heatwave killed his crop.
          <br />
          <strong style={{ color: C.text }}>He never got paid.</strong>
        </p>
        <p style={{
          maxWidth: 520, margin: '0 auto 28px',
          fontSize: 'clamp(13px,2vw,16px)',
          color: C.sub, lineHeight: 1.7,
        }}>
          Not because the heatwave didn&rsquo;t happen.
          Not because the policy didn&rsquo;t cover it.<br />
          Because a human adjuster said the paperwork was wrong.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {reveal === 'none' && (
            <button
              onClick={() => setReveal('today')}
              style={{
                padding: '14px 32px', borderRadius: 14, fontSize: 15,
                fontWeight: 800, cursor: 'pointer',
                background: `${C.red}18`, border: `2px solid ${C.red}66`,
                color: C.red,
              }}>
              Show what happens today →
            </button>
          )}
          {reveal !== 'none' && !iieRunning && iieStep === 0 && (
            <button
              onClick={startIie}
              style={{
                padding: '14px 32px', borderRadius: 14, fontSize: 15,
                fontWeight: 800, cursor: 'pointer',
                background: `${C.green}18`, border: `2px solid ${C.green}66`,
                color: C.green,
              }}>
              ▶ Now show IIE →
            </button>
          )}
          {iieDone && (
            <button
              onClick={restart}
              style={{
                padding: '14px 28px', borderRadius: 14, fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.sub,
              }}>
              ↺ Replay
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column timeline ───────────────────────────────────────── */}
      {reveal !== 'none' && (
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: reveal === 'both' ? '1fr 1fr' : '1fr',
          gap: 0,
          padding: '0 0 60px',
        }}>

          {/* TODAY column */}
          <div style={{
            padding: '32px 24px',
            borderRight: reveal === 'both' ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: 2, color: C.red, marginBottom: 6,
            }}>TODAY — without IIE</div>
            <div style={{
              fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 1.5,
            }}>
              Claim settled in <strong style={{ color: C.red }}>118 days</strong>.
              Result: <strong style={{ color: C.red }}>denied</strong>.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {TODAY.map((step, i) => {
                const visible = i <= todayStep;
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 0,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(8px)',
                    transition: 'opacity 0.4s, transform 0.4s',
                  }}>
                    {/* Spine */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `${step.col}18`,
                        border: `2px solid ${step.col}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, flexShrink: 0, zIndex: 1,
                      }}>{step.icon}</div>
                      {i < TODAY.length - 1 && (
                        <div style={{ width: 2, flexGrow: 1, minHeight: 32,
                          background: `${C.red}30`, margin: '4px 0' }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingLeft: 14, paddingBottom: 24, flex: 1 }}>
                      <div style={{
                        fontSize: 10, color: step.col, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3,
                      }}>{step.t}</div>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 5, color: C.text }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                        {step.detail}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Final outcome */}
              {todayDone && (
                <div style={{
                  marginTop: 4, padding: '16px 18px', borderRadius: 12,
                  background: `${C.red}0d`, border: `1.5px solid ${C.red}44`,
                  animation: 'fadeIn 0.5s ease',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.red, marginBottom: 4 }}>
                    ₹0 received. Loan defaulted.
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                    Ramesh lost his crop to an act of nature.
                    He lost his payout to an act of administration.
                    These are not the same problem —
                    but they have the same solution.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WITH IIE column */}
          {reveal === 'both' && (
            <div style={{ padding: '32px 24px' }}>
              <div style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: 2, color: C.green, marginBottom: 6,
              }}>WITH IIE</div>
              <div style={{
                fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 1.5,
              }}>
                Payout in <strong style={{ color: C.green }}>3 seconds</strong>.
                No form. No adjuster. No dispute.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {WITH_IIE.map((step, i) => {
                  const visible = i <= iieStep;
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 0,
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'none' : 'translateY(8px)',
                      transition: 'opacity 0.4s, transform 0.4s',
                    }}>
                      {/* Spine */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `${step.col}18`,
                          border: `2px solid ${step.col}66`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, flexShrink: 0, zIndex: 1,
                        }}>{step.icon}</div>
                        {i < WITH_IIE.length - 1 && (
                          <div style={{ width: 2, flexGrow: 1, minHeight: 32,
                            background: `${C.green}30`, margin: '4px 0' }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ paddingLeft: 14, paddingBottom: 24, flex: 1 }}>
                        <div style={{
                          fontSize: 10, color: step.col, fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3,
                        }}>{step.t}</div>
                        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 5, color: C.text }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Final outcome */}
                {iieDone && (
                  <div style={{
                    marginTop: 4, padding: '16px 18px', borderRadius: 12,
                    background: `${C.green}0d`, border: `1.5px solid ${C.green}44`,
                    animation: 'fadeIn 0.5s ease',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: C.green, marginBottom: 4 }}>
                      ₹52,000 received in 3 seconds.
                    </div>
                    <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 14 }}>
                      Same crop. Same heatwave. Same farmer.
                      Different system — one where the data decides,
                      not the adjuster.
                    </div>
                    <Link href="/flow" style={{
                      display: 'inline-block', padding: '12px 24px',
                      borderRadius: 10, background: `${C.green}18`,
                      border: `2px solid ${C.green}66`, color: C.green,
                      fontWeight: 800, fontSize: 14, textDecoration: 'none',
                    }}>
                      ▶ See it run live →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Context bar ───────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '20px 24px',
        display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center',
        background: C.panel,
      }}>
        {[
          { v: '150M+',  label: 'farmers in India',                  col: C.orange },
          { v: '47 days', label: 'avg PMFBY claim settlement',        col: C.red    },
          { v: '42%',    label: 'claims denied on paperwork alone',   col: C.red    },
          { v: '<30%',   label: 'PMFBY penetration among smallholders', col: C.amber },
          { v: '3 sec',  label: 'IIE settlement time',                col: C.green  },
        ].map(({ v, label, col }) => (
          <div key={label} style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: col }}>{v}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2, lineHeight: 1.4 }}>{label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
