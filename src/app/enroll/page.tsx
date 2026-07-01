'use client';

import { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════
// SBI YONO IIE — Insurance Enrollment  
// Full YONO bottom-sheet 4-step flow
// Palette: Navy #1B2A4A · Orange #F68B1F
// ═══════════════════════════════════════════════════

const NAVY   = '#1B2A4A';
const NAVY_D = '#0F1E36';
const NAVY_M = '#243656';
const ORANGE = '#F68B1F';
const ORANGE_D = '#D4750F';
const GOLD   = '#E8A020';
const WHITE  = '#F5F7FA';
const MUTED  = '#8FA3C0';
const BORDER = 'rgba(245,247,250,0.10)';
const SUCCESS = '#3fb950';

type Step = 1 | 2 | 3 | 4;

const POLICIES = [
  {
    id: 'smart-shield',
    icon: '🛡️',
    name: 'Smart Shield',
    tagline: 'Drought · Heatwave · NDVI',
    cover: '₹1,00,000',
    premium: '₹2,200',
    color: ORANGE,
    features: ['NDVI satellite trigger', 'IMD temperature oracle', '3-second IMPS payout'],
  },
  {
    id: 'crop-guard',
    icon: '🌾',
    name: 'Crop Guard',
    tagline: 'Flood · Cyclone · Excess Rain',
    cover: '₹75,000',
    premium: '₹1,650',
    color: '#82b1ff',
    features: ['Rainfall threshold trigger', 'NDRF cyclone alert integration', 'Multi-crop coverage'],
  },
  {
    id: 'weather-plus',
    icon: '🌤️',
    name: 'Weather Plus',
    tagline: 'All-risk composite cover',
    cover: '₹1,50,000',
    premium: '₹3,300',
    color: GOLD,
    features: ['Combines drought + flood triggers', '4-oracle quorum', 'FPO group eligible'],
  },
];

function OTPInput({ onComplete }: { onComplete: (otp: string) => void }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) onComplete(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          className="yono-otp-box"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}

function StepBar({ step, total = 4 }: { step: Step; total?: number }) {
  return (
    <div className="yono-step-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`yono-step-seg ${i + 1 < step ? 'done' : i + 1 === step ? 'active' : ''}`} />
      ))}
    </div>
  );
}

// ── STEP 1 — Aadhaar OTP Verification ──────────────────────────────────────
function Step1({ onNext }: { onNext: () => void }) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => { setOtpSent(true); setLoading(false); }, 900);
  };

  const handleOtp = (_otp: string) => {
    setTimeout(() => { setVerified(true); }, 600);
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: ORANGE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Step 1 of 4</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: WHITE, marginBottom: 4 }}>Verify your identity</h2>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>We use Aadhaar-linked mobile OTP — same as YONO login. Your data stays within SBI systems.</p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, display: 'block', marginBottom: 8 }}>Aadhaar-linked mobile number</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${BORDER}`, background: NAVY_D, color: MUTED, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>+91</div>
          <input
            type="tel" inputMode="numeric" maxLength={10}
            value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="9XXXXXXXXX"
            style={{ flex: 1, padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${phone.length === 10 ? ORANGE : BORDER}`, background: NAVY_D, color: WHITE, fontSize: 16, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s' }}
          />
        </div>
      </div>

      {!otpSent ? (
        <button className="yono-orange-btn" onClick={sendOtp} disabled={phone.length < 10 || loading}>
          {loading ? '⏳ Sending OTP…' : '📱 Send OTP via YONO'}
        </button>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginBottom: 14 }}>Enter 6-digit OTP sent to +91 {phone}</p>
            <OTPInput onComplete={handleOtp} />
          </div>
          {verified ? (
            <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 14, background: 'rgba(63,185,80,0.10)', border: '1px solid rgba(63,185,80,0.35)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: SUCCESS }}>Identity verified — Aadhaar eKYC complete</span>
            </div>
          ) : (
            <div style={{ height: 48 }} />
          )}
          <button className="yono-orange-btn" onClick={onNext} disabled={!verified}>
            Continue → Select Policy
          </button>
        </>
      )}

      <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        🔒 End-to-end encrypted · No Aadhaar stored · SHA-256 one-way hash
      </p>
    </div>
  );
}

// ── STEP 2 — Policy Picker ─────────────────────────────────────────────────
function Step2({ onNext, onBack }: { onNext: (policy: typeof POLICIES[0]) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<string>('smart-shield');
  const policy = POLICIES.find(p => p.id === selected)!;

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: ORANGE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Step 2 of 4</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: WHITE, marginBottom: 4 }}>Choose your policy</h2>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Premiums auto-subsidised under PM-FASAL DBT. You pay only the farmer share.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {POLICIES.map(p => (
          <div key={p.id} className={`yono-policy-card ${selected === p.id ? 'selected' : ''}`} onClick={() => setSelected(p.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: selected === p.id ? p.color : WHITE }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{p.tagline}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: p.color }}>{p.premium}</div>
                <div style={{ fontSize: 10, color: MUTED }}>/ season</div>
              </div>
            </div>
            {selected === p.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>Cover: <b style={{ color: WHITE }}>{p.cover}</b> · What's included:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: MUTED }}>
                      <span style={{ color: p.color, fontWeight: 900 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="yono-orange-btn" onClick={() => onNext(policy)} style={{ marginBottom: 10 }}>
        Continue → Review & Pay
      </button>
      <button className="yono-ghost-btn" onClick={onBack} style={{ width: '100%' }}>← Back</button>
    </div>
  );
}

// ── STEP 3 — Review & Confirm ──────────────────────────────────────────────
function Step3({ policy, onNext, onBack }: { policy: typeof POLICIES[0]; onNext: () => void; onBack: () => void }) {
  const rows = [
    ['Policy',       policy.name],
    ['Coverage',     policy.cover],
    ['Season',       'Kharif 2026–27'],
    ['Premium',      policy.premium],
    ['Subsidy',      'PM-FASAL — 70% covered by Govt'],
    ['Net payable',  '₹660'],
    ['Payment',      'SBI YONO Wallet / IMPS'],
    ['KYC',          'Aadhaar eKYC ✅'],
    ['Smart Contract', 'Polygon — auto-trigger on oracle quorum'],
    ['Payout SLA',   '< 3 seconds after trigger'],
  ];

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: ORANGE, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Step 3 of 4</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: WHITE, marginBottom: 4 }}>Review & confirm</h2>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Please verify all details before payment. Smart contract terms are immutable post-enrollment.</p>

      <div style={{ borderRadius: 20, border: `1px solid ${BORDER}`, background: NAVY_D, overflow: 'hidden', marginBottom: 20 }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <span style={{ fontSize: 12, color: MUTED }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: WHITE, textAlign: 'right', maxWidth: '55%' }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 16px', borderRadius: 16, background: `rgba(246,139,31,0.07)`, border: `1px solid rgba(246,139,31,0.25)`, marginBottom: 20, fontSize: 12, color: MUTED, lineHeight: 1.65 }}>
        <b style={{ color: ORANGE }}>⚡ Auto-payout guarantee: </b>
        If oracle quorum fires (NDVI + IMD + ISRO + ICAR all agree), {policy.cover} is transferred to your SBI account via IMPS in under 3 seconds — no claim form, no agent, no delay.
      </div>

      <button className="yono-orange-btn" onClick={onNext} style={{ marginBottom: 10 }}>
        🔒 Confirm & Pay ₹660
      </button>
      <button className="yono-ghost-btn" onClick={onBack} style={{ width: '100%' }}>← Back</button>
    </div>
  );
}

// ── STEP 4 — IMPS Receipt ──────────────────────────────────────────────────
function Step4({ policy }: { policy: typeof POLICIES[0] }) {
  const [progress, setProgress] = useState(0);
  const rrn = '924' + Math.floor(Math.random() * 1e9).toString().padStart(9, '0');
  const policyId = 'SBI-IIE-' + Math.floor(Math.random() * 90000 + 10000);
  const ts = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  useEffect(() => {
    const t = setTimeout(() => setProgress(100), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ padding: '0 20px 32px', textAlign: 'center' }}>
      {/* Success ring */}
      <div style={{ position: 'relative', width: 88, height: 88, margin: '8px auto 20px' }}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="38" fill="none" stroke={BORDER} strokeWidth="5" />
          <circle
            cx="44" cy="44" r="38"
            fill="none"
            stroke={ORANGE}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 38}`}
            strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress / 100)}`}
            transform="rotate(-90 44 44)"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✅</div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, color: SUCCESS, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Enrollment Successful</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: WHITE, marginBottom: 6 }}>{policy.name} Active</h2>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Smart contract deployed · Oracles watching · IMPS payout armed</p>

      {/* IMPS Receipt */}
      <div style={{ borderRadius: 20, border: `1px solid ${BORDER}`, background: NAVY_D, textAlign: 'left', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 16px', background: `rgba(246,139,31,0.08)`, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏦</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: ORANGE }}>IMPS Payment Receipt</span>
        </div>
        {[
          ['Policy ID',   policyId],
          ['RRN',         rrn],
          ['Amount Paid', '₹660'],
          ['Method',      'SBI YONO · IMPS'],
          ['Status',      '✅ SUCCESS'],
          ['Timestamp',   ts],
          ['Policy Cover', policy.cover],
          ['Blockchain',  'Polygon · Smart Contract Active'],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <span style={{ fontSize: 12, color: MUTED }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: v.startsWith('✅') ? SUCCESS : WHITE, fontFamily: k === 'RRN' || k === 'Policy ID' ? 'monospace' : 'inherit' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div style={{ borderRadius: 16, border: `1px solid rgba(246,139,31,0.2)`, background: `rgba(246,139,31,0.05)`, padding: '14px 16px', textAlign: 'left', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: ORANGE, marginBottom: 10 }}>📋 What happens next?</div>
        {[
          '🛰️  Oracles (NASA, IMD, ISRO, ICAR) monitor your district 24×7',
          '⚡  If quorum threshold is met, smart contract triggers automatically',
          '💸  IMPS payout hits your SBI account in < 3 seconds',
          '📊  Track live oracle data on the Operations Dashboard',
        ].map(s => (
          <div key={s} style={{ fontSize: 12, color: MUTED, marginBottom: 6, lineHeight: 1.55 }}>{s}</div>
        ))}
      </div>

      <a href="/dashboard" style={{ textDecoration: 'none' }}>
        <button className="yono-orange-btn">View Live Dashboard →</button>
      </a>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EnrollPage() {
  const [step, setStep] = useState<Step>(1);
  const [policy, setPolicy] = useState(POLICIES[0]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Open sheet on mount with a tiny delay so animation fires
  useEffect(() => { const t = setTimeout(() => setSheetOpen(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY_D} 0%, ${NAVY} 50%, #1a3060 100%)`, position: 'relative', overflow: 'hidden' }}>

      {/* Background texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(246,139,31,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(246,139,31,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* YONO-style hero behind sheet */}
      <div style={{ padding: '40px 24px 200px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: `rgba(246,139,31,0.12)`, border: `1px solid rgba(246,139,31,0.30)`, marginBottom: 20 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 11, fontWeight: 800, color: ORANGE, letterSpacing: '0.08em' }}>YONO AGRI INSURANCE · LIVE</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: WHITE, lineHeight: 1.2, marginBottom: 12 }}>
          Kisan Suraksha<br />
          <span style={{ background: `linear-gradient(135deg, ${ORANGE}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Powered by AI Oracles</span>
        </h1>
        <p style={{ fontSize: 14, color: MUTED, maxWidth: 360, margin: '0 auto' }}>Zero-claim-form insurance. Smart contract pays you automatically when disaster strikes.</p>
      </div>

      {/* Overlay */}
      {sheetOpen && <div className="yono-overlay" onClick={() => {}} />}

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div className="yono-sheet">
          <div className="yono-sheet-handle" />
          <StepBar step={step} />

          {/* Step label row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Verify', 'Policy', 'Review', 'Done'] as const).map((label, i) => (
                <span key={label} style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                  background: i + 1 === step ? `rgba(246,139,31,0.15)` : 'transparent',
                  color: i + 1 === step ? ORANGE : i + 1 < step ? SUCCESS : MUTED,
                  border: i + 1 === step ? `1px solid rgba(246,139,31,0.35)` : '1px solid transparent',
                }}>{i + 1 < step ? '✓ ' : ''}{label}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{step}/4</div>
          </div>

          {step === 1 && <Step1 onNext={() => setStep(2)} />}
          {step === 2 && <Step2 onNext={p => { setPolicy(p); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 policy={policy} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <Step4 policy={policy} />}
        </div>
      )}
    </div>
  );
}
