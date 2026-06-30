'use client';
import { useState, useEffect } from 'react';

type Screen = 'splash' | 'login' | 'otp' | 'home' | 'insurance' | 'enroll' | 'aadhaar' | 'digilocker' | 'plan' | 'processing' | 'success' | 'payout';

const SBI_BLUE   = '#1a3a6b';
const SBI_NAVY   = '#0f2347';
const SBI_TEAL   = '#009999';
const SBI_GOLD   = '#f0a500';
const SBI_GREEN  = '#2ecc71';
const SBI_LIGHT  = '#e8f4fd';

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%', maxWidth: 390, margin: '0 auto',
      background: '#111', borderRadius: 44, padding: '12px 10px',
      boxShadow: '0 40px 120px #00000088, 0 0 0 2px #333',
      position: 'relative', minHeight: 780,
    }}>
      {/* notch */}
      <div style={{ width: 120, height: 28, background: '#111', borderRadius: 20, margin: '0 auto 8px', position: 'relative', zIndex: 10 }} />
      <div style={{
        background: '#fff', borderRadius: 34, overflow: 'hidden',
        minHeight: 700, position: 'relative', display: 'flex', flexDirection: 'column',
      }}>
        {children}
      </div>
      {/* home bar */}
      <div style={{ width: 120, height: 5, background: '#444', borderRadius: 3, margin: '10px auto 0' }} />
    </div>
  );
}

function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 4px', fontSize: 11, fontWeight: 700, color: light ? '#fff' : '#1a1a1a' }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span>4G</span>
        <span>📡</span>
        <span>🔋</span>
      </div>
    </div>
  );
}

function SBILogo({ size = 32, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: light ? '#fff' : SBI_BLUE,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: size * 0.38, color: light ? SBI_BLUE : '#fff',
        boxShadow: light ? '0 2px 8px #00000044' : 'none',
        flexShrink: 0,
      }}>SBI</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: size * 0.44, color: light ? '#fff' : SBI_BLUE, lineHeight: 1 }}>YONO</div>
        <div style={{ fontSize: size * 0.28, color: light ? '#ffffff99' : '#666', lineHeight: 1.2 }}>You Only Need One</div>
      </div>
    </div>
  );
}

// ── SCREENS ──────────────────────────────────────────────────────────────────

function SplashScreen({ next }: { next: () => void }) {
  useEffect(() => { const t = setTimeout(next, 2000); return () => clearTimeout(t); }, [next]);
  return (
    <div style={{ flex: 1, background: `linear-gradient(160deg, ${SBI_NAVY} 0%, ${SBI_BLUE} 60%, ${SBI_TEAL} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, minHeight: 700 }}>
      <StatusBar light />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 40px #00000055', fontSize: 36 }}>🏦</div>
        <SBILogo size={48} light />
        <div style={{ width: 180, height: 3, background: '#ffffff22', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ height: 3, background: SBI_GOLD, borderRadius: 2, animation: 'loadBar 1.8s ease forwards' }} />
        </div>
      </div>
      <div style={{ padding: '0 0 32px', fontSize: 11, color: '#ffffff55' }}>Powered by State Bank of India</div>
      <style>{`@keyframes loadBar { from{width:0} to{width:100%} }`}</style>
    </div>
  );
}

function LoginScreen({ next }: { next: () => void }) {
  const [mobile, setMobile] = useState('98765 43210');
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700 }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, ${SBI_NAVY}, ${SBI_BLUE})`, padding: '24px 24px 40px', borderRadius: '0 0 32px 32px' }}>
        <SBILogo size={36} light />
        <div style={{ marginTop: 20, color: '#fff', fontSize: 22, fontWeight: 800 }}>Welcome back!</div>
        <div style={{ color: '#ffffff88', fontSize: 13, marginTop: 4 }}>Login to your YONO account</div>
      </div>
      <div style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number</div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `2px solid ${focused ? SBI_TEAL : '#e0e0e0'}`, borderRadius: 14, padding: '12px 16px', gap: 10, transition: 'border-color 0.2s' }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <span style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>+91</span>
            <input value={mobile} onChange={e => setMobile(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontWeight: 700, color: '#1a1a1a', background: 'transparent' }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MPIN</div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `2px solid #e0e0e0`, borderRadius: 14, padding: '12px 16px', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <input type="password" defaultValue="123456"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 22, letterSpacing: 8, color: '#1a1a1a', background: 'transparent' }} />
          </div>
        </div>
        <button onClick={next} style={{ background: `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})`, color: '#fff', border: 'none', borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 800, marginTop: 8, cursor: 'pointer', boxShadow: '0 4px 20px #1a3a6b44' }}>
          Login to YONO
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: SBI_TEAL, fontWeight: 600 }}>Forgot MPIN? · Register</div>
        <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#aaa' }}>Secured by 256-bit encryption · NPCI certified</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: SBI_GOLD, marginTop: 4 }}>Powered by YONO Oracle — Insurance that pays before you claim.</div>
        </div>
      </div>
    </div>
  );
}

function OTPScreen({ next }: { next: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const fill = (val: string, idx: number) => {
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n);
    if (val && idx < 5) (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement)?.focus();
    if (idx === 5 && val) { setVerified(true); setTimeout(next, 800); }
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700 }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, ${SBI_NAVY}, ${SBI_BLUE})`, padding: '24px 24px 32px', borderRadius: '0 0 24px 24px' }}>
        <SBILogo size={28} light />
      </div>
      <div style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 40 }}>📲</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a1a' }}>OTP Verification</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Enter the 6-digit OTP sent to<br /><b style={{ color: SBI_BLUE }}>+91 98765 43210</b></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {otp.map((v, i) => (
            <input key={i} id={`otp-${i}`} value={v} onChange={e => fill(e.target.value, i)} maxLength={1}
              style={{ width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 800, border: `2px solid ${v ? SBI_TEAL : '#ddd'}`, borderRadius: 12, outline: 'none', color: SBI_BLUE, background: v ? '#e8f9f9' : '#fff', transition: 'all 0.2s' }} />
          ))}
        </div>
        {verified && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: SBI_GREEN, fontWeight: 700, fontSize: 14 }}>
            <span style={{ fontSize: 20 }}>✅</span> OTP Verified!
          </div>
        )}
        <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>Demo: type any 6 digits · Resend OTP in 28s</div>
        <button onClick={() => { setOtp(['1','2','3','4','5','6']); setVerified(true); setTimeout(next, 600); }}
          style={{ background: SBI_TEAL, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 36px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          Auto-fill & Continue
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ next }: { next: () => void }) {
  const tiles = [
    { icon: '💳', label: 'Accounts', color: '#e8f0fe' },
    { icon: '💸', label: 'Transfer', color: '#e8fdf0' },
    { icon: '🏠', label: 'Loans', color: '#fff8e1' },
    { icon: '🛡️', label: 'Insurance', color: '#fce8ff', highlight: true },
    { icon: '📈', label: 'Invest', color: '#e8f4ff' },
    { icon: '💰', label: 'FD / RD', color: '#fff0e8' },
    { icon: '📱', label: 'Recharge', color: '#f0ffe8' },
    { icon: '⚙️', label: 'Settings', color: '#f5f5f5' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700 }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, ${SBI_NAVY}, ${SBI_BLUE})`, padding: '16px 20px 28px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SBILogo size={28} light />
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: SBI_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
        </div>
        <div style={{ marginTop: 16, color: '#fff' }}>
          <div style={{ fontSize: 12, color: '#ffffff88' }}>Good Morning,</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Ramesh Kumar</div>
        </div>
        <div style={{ marginTop: 14, background: '#ffffff15', borderRadius: 16, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: '#ffffff88', marginBottom: 2 }}>Savings Account · ****4821</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>₹1,84,320.50</div>
          <div style={{ fontSize: 11, color: SBI_GOLD, marginTop: 4 }}>+₹12,500 credited today</div>
        </div>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: `linear-gradient(135deg, ${SBI_TEAL}22, ${SBI_GOLD}22)`, border: `1px solid ${SBI_GOLD}44`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: SBI_NAVY }}>YONO Kisan Insurance — New!</div>
            <div style={{ fontSize: 11, color: '#666' }}>Parametric crop insurance · pays in 3 seconds</div>
          </div>
          <button onClick={next} style={{ marginLeft: 'auto', background: SBI_TEAL, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Explore</button>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Services</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          {tiles.map(tile => (
            <button key={tile.label} onClick={tile.highlight ? next : undefined}
              style={{ background: tile.highlight ? `linear-gradient(135deg, ${SBI_TEAL}33, #9b59b633)` : tile.color, border: tile.highlight ? `2px solid ${SBI_TEAL}` : '2px solid transparent', borderRadius: 14, padding: '14px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: tile.highlight ? 'pointer' : 'default', position: 'relative' }}>
              {tile.highlight && <div style={{ position: 'absolute', top: -4, right: -4, background: SBI_GOLD, borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>N</div>}
              <span style={{ fontSize: 22 }}>{tile.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: tile.highlight ? SBI_TEAL : '#444', textAlign: 'center' }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 16px 0', marginTop: 'auto' }}>
        <div style={{ textAlign: 'center', fontSize: 10, color: '#aaa', padding: '8px 0', borderTop: '1px solid #eee' }}>
          Powered by YONO Oracle — Insurance that pays before you claim.
        </div>
      </div>
    </div>
  );
}

function InsuranceScreen({ next }: { next: () => void }) {
  const plans = [
    { name: 'Basic Protect', premium: '₹499/season', coverage: '₹50,000', subsidy: '30% PM-FASAL', tag: '' },
    { name: 'Smart Shield', premium: '₹999/season', coverage: '₹1,20,000', subsidy: '30% PM-FASAL', tag: 'POPULAR' },
    { name: 'Full Season Pro', premium: '₹1,799/season', coverage: '₹2,50,000', subsidy: '30% PM-FASAL', tag: 'BEST' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700, overflowY: 'auto' }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, ${SBI_NAVY}, ${SBI_TEAL})`, padding: '16px 20px 28px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ fontSize: 11, color: '#ffffff88', marginBottom: 6 }}>← Back to Home</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>🌾 YONO Kisan Insurance</div>
        <div style={{ fontSize: 12, color: '#ffffff99', marginTop: 4 }}>Parametric · Blockchain-secured · Instant payout</div>
      </div>
      <div style={{ padding: '16px', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px', marginBottom: 14, border: `1px solid ${SBI_TEAL}33` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: SBI_NAVY, marginBottom: 8 }}>How it works</div>
          {['Enroll with Aadhaar + DigiLocker land records', 'Smart contract deployed on blockchain', 'NASA/IMD/ISRO oracles watch your district', 'Payout credited in under 3 seconds via IMPS'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: SBI_TEAL, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 12, color: '#444' }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Your Plan</div>
        {plans.map((plan, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '14px', marginBottom: 10, border: `2px solid ${i === 1 ? SBI_TEAL : '#eee'}`, position: 'relative' }}>
            {plan.tag && <div style={{ position: 'absolute', top: -8, right: 12, background: i === 2 ? SBI_GOLD : SBI_TEAL, color: '#fff', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6 }}>{plan.tag}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: SBI_NAVY }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Coverage: <b style={{ color: SBI_BLUE }}>{plan.coverage}</b></div>
                <div style={{ fontSize: 10, color: SBI_GREEN, marginTop: 2 }}>✓ {plan.subsidy} applied</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: SBI_TEAL }}>{plan.premium}</div>
                <button onClick={next} style={{ marginTop: 6, background: i === 1 ? SBI_TEAL : '#f0f4ff', color: i === 1 ? '#fff' : SBI_BLUE, border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Select</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AadhaarScreen({ next }: { next: () => void }) {
  const [step, setStep] = useState<'input' | 'otp' | 'done'>('input');
  const [uid, setUid] = useState('XXXX XXXX 4821');
  const [consent, setConsent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700 }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, #1a3a6b, #2980b9)`, padding: '16px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 11, color: '#ffffff88', marginBottom: 6 }}>← Back</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>🆔 Aadhaar eKYC</div>
        <div style={{ fontSize: 11, color: '#ffffff99', marginTop: 4 }}>Powered by UIDAI · Secure OTP-based verification</div>
      </div>
      <div style={{ padding: '20px 20px', flex: 1 }}>
        {step === 'input' && (
          <>
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#856404' }}>
              ⚠️ UIDAI OTP will be sent to your Aadhaar-linked mobile. Your UID is masked for security.
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Aadhaar Number</div>
              <input value={uid} onChange={e => setUid(e.target.value)}
                style={{ width: '100%', background: '#fff', border: '2px solid #ddd', borderRadius: 12, padding: '12px 16px', fontSize: 15, fontWeight: 700, letterSpacing: 4, color: SBI_NAVY, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ background: '#f0f8ff', border: '1px solid #bee3f8', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SBI_BLUE, marginBottom: 8 }}>Consent for Data Sharing (DPDP Act 2023)</div>
              {['Share name & address for policy issuance', 'Allow DigiLocker RoR fetch for land verification', 'Store Aadhaar hash (SHA-256) — not UID'].map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: SBI_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', flexShrink: 0 }}>✓</div>
                  <div style={{ fontSize: 11, color: '#444' }}>{c}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, padding: '8px 0 0', borderTop: '1px solid #bee3f8' }}>
                <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor="consent" style={{ fontSize: 11, color: SBI_BLUE, fontWeight: 600, cursor: 'pointer' }}>I agree to share my data as described above</label>
              </div>
            </div>
            <button onClick={() => consent && setStep('otp')} disabled={!consent}
              style={{ width: '100%', background: consent ? `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})` : '#ccc', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: consent ? 'pointer' : 'not-allowed' }}>
              Send OTP to Aadhaar Mobile
            </button>
          </>
        )}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📲</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: SBI_NAVY }}>UIDAI OTP Sent</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>6-digit OTP sent to ****3210</div>
            </div>
            <input value={otpVal} onChange={e => setOtpVal(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6}
              style={{ width: '100%', background: '#fff', border: `2px solid ${otpVal.length === 6 ? SBI_GREEN : '#ddd'}`, borderRadius: 12, padding: '14px', fontSize: 22, fontWeight: 800, textAlign: 'center', letterSpacing: 8, boxSizing: 'border-box', outline: 'none', color: SBI_NAVY }} />
            <button onClick={() => { setOtpVal('123456'); setTimeout(() => setStep('done'), 300); }}
              style={{ width: '100%', marginTop: 10, background: SBI_TEAL, color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Auto-fill OTP (Demo)</button>
            {step === 'otp' && otpVal.length === 6 && (
              <button onClick={() => setStep('done')}
                style={{ width: '100%', marginTop: 10, background: `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Verify OTP</button>
            )}
          </>
        )}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8fdf0', border: `3px solid ${SBI_GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>✅</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: SBI_GREEN }}>Aadhaar Verified!</div>
            <div style={{ fontSize: 12, color: '#666', margin: '8px 0 20px' }}>Identity confirmed · KYC complete</div>
            {[['Name', 'Ramesh Kumar'], ['District', 'Barmer, Rajasthan'], ['Aadhaar Hash', 'sha256:a3f8...d291'], ['KYC Status', 'VERIFIED']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: 12 }}>
                <span style={{ color: '#888' }}>{k}</span>
                <span style={{ fontWeight: 700, color: k === 'KYC Status' ? SBI_GREEN : SBI_NAVY }}>{v}</span>
              </div>
            ))}
            <button onClick={next} style={{ width: '100%', marginTop: 20, background: `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Continue to DigiLocker →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DigiLockerScreen({ next }: { next: () => void }) {
  const [fetching, setFetching] = useState(false);
  const [done, setDone] = useState(false);
  const docs = [
    { icon: '📄', name: 'Khasra / Khatauni', id: 'RJ-BR-2024-00482', status: 'Verified', detail: '4.5 acres · Kharif crop · Barmer' },
    { icon: '🏛️', name: 'Revenue Record (RoR)', id: 'RJ-REV-004821', status: 'Verified', detail: 'Owner: Ramesh Kumar · No encumbrance' },
    { icon: '🌾', name: 'PM-FASAL Registration', id: 'PMFBY-2024-RJ-8821', status: 'Verified', detail: '30% subsidy eligible · Wheat crop' },
  ];
  const startFetch = () => {
    setFetching(true);
    setTimeout(() => { setFetching(false); setDone(true); }, 2200);
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700 }}>
      <StatusBar />
      <div style={{ background: 'linear-gradient(135deg, #1a5276, #2e86c1)', padding: '16px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 11, color: '#ffffff88', marginBottom: 6 }}>← Aadhaar eKYC ✓</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>📁 DigiLocker Fetch</div>
        <div style={{ fontSize: 11, color: '#ffffff99', marginTop: 4 }}>Fetching land records from MeitY DigiLocker</div>
      </div>
      <div style={{ padding: '20px', flex: 1 }}>
        {!done && !fetching && (
          <>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, border: '1px solid #e0e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: SBI_NAVY, marginBottom: 10 }}>Documents to Fetch</div>
              {docs.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < docs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <span style={{ fontSize: 20 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>{d.detail}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 10, color: '#aaa', background: '#f5f5f5', borderRadius: 6, padding: '2px 8px' }}>Pending</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fffbec', border: '1px solid #f0c040', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#7d5700' }}>
              🔐 You are authorizing SBI YONO to access your DigiLocker documents. Consent logged under DPDP Act 2023.
            </div>
            <button onClick={startFetch} style={{ width: '100%', background: 'linear-gradient(135deg, #1a5276, #2e86c1)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Fetch from DigiLocker</button>
          </>
        )}
        {fetching && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
            <div style={{ fontWeight: 700, color: SBI_NAVY, marginBottom: 8 }}>Connecting to DigiLocker...</div>
            {['Authenticating with MeitY', 'Fetching Khasra records', 'Verifying land ownership', 'Computing acreage hash'].map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: '#888', padding: '3px 0' }}>• {s}</div>
            ))}
          </div>
        )}
        {done && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: SBI_GREEN }}>Documents Verified!</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>All land records confirmed via DigiLocker</div>
            </div>
            {docs.map((d, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: `1px solid ${SBI_GREEN}44`, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>{d.id} · {d.detail}</div>
                </div>
                <div style={{ fontSize: 10, color: SBI_GREEN, fontWeight: 700, background: '#e8fdf0', borderRadius: 6, padding: '2px 8px' }}>✓ {d.status}</div>
              </div>
            ))}
            <button onClick={next} style={{ width: '100%', marginTop: 12, background: `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Deploy Smart Contract →</button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProcessingScreen({ next }: { next: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Aadhaar KYC confirmed', icon: '🆔', done: true },
    { label: 'DigiLocker RoR verified', icon: '📁', done: true },
    { label: 'PM-FASAL subsidy applied (30%)', icon: '🌾', done: false },
    { label: 'Smart contract deploying...', icon: '⛓️', done: false },
    { label: 'Policy NFT minted on-chain', icon: '🏷️', done: false },
    { label: 'Oracle watchers activated', icon: '🛰️', done: false },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) { clearInterval(interval); setTimeout(next, 800); return s; }
        return s + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [next, steps.length]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700 }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, ${SBI_NAVY}, ${SBI_BLUE})`, padding: '16px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⛓️ Deploying Policy</div>
        <div style={{ fontSize: 11, color: '#ffffff99', marginTop: 4 }}>Smart Shield Plan · Wheat · Barmer</div>
      </div>
      <div style={{ padding: '28px 20px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.4s' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: i < step ? SBI_GREEN : i === step ? SBI_TEAL : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, transition: 'background 0.4s' }}>
                {i < step ? '✓' : s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: i <= step ? SBI_NAVY : '#aaa' }}>{s.label}</div>
                {i === step && <div style={{ fontSize: 10, color: SBI_TEAL, marginTop: 2 }}>Processing...</div>}
                {i < step && <div style={{ fontSize: 10, color: SBI_GREEN, marginTop: 2 }}>Completed</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ next }: { next: () => void }) {
  const txId = 'IIE-2026-RJ-' + Math.floor(Math.random() * 900000 + 100000);
  const contractAddr = '0x3f8A...d921';
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700, overflowY: 'auto' }}>
      <StatusBar />
      <div style={{ background: `linear-gradient(135deg, #1a4731, ${SBI_GREEN})`, padding: '24px 20px 28px', borderRadius: '0 0 28px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Policy Issued!</div>
        <div style={{ fontSize: 12, color: '#ffffff99', marginTop: 4 }}>Smart Shield · Wheat · Barmer District</div>
      </div>
      <div style={{ padding: '16px', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, border: `1px solid ${SBI_GREEN}44` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Policy Details</div>
          {[['Policy ID', txId], ['Coverage', '₹1,20,000'], ['Net Premium', '₹699 (after 30% subsidy)'], ['Contract', contractAddr], ['Status', 'ACTIVE'], ['Oracle Watch', 'LIVE']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
              <span style={{ color: '#888' }}>{k}</span>
              <span style={{ fontWeight: 700, color: k === 'Status' ? SBI_GREEN : k === 'Oracle Watch' ? SBI_TEAL : SBI_NAVY, fontFamily: k === 'Contract' ? 'monospace' : 'inherit' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: `linear-gradient(135deg, ${SBI_TEAL}11, ${SBI_BLUE}11)`, border: `1px solid ${SBI_TEAL}33`, borderRadius: 12, padding: '12px 14px', marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: SBI_NAVY, fontWeight: 700 }}>Powered by YONO Oracle</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Insurance that pays before you claim.</div>
          <div style={{ fontSize: 10, color: SBI_TEAL, marginTop: 4 }}>4 satellite oracles watching your district 24/7</div>
        </div>
        <button onClick={next} style={{ width: '100%', background: `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Simulate Drought Payout →</button>
      </div>
    </div>
  );
}

function PayoutScreen({ onRestart }: { onRestart: () => void }) {
  const [phase, setPhase] = useState<'trigger' | 'processing' | 'success'>('trigger');
  const rrn = 'RRN' + Math.floor(Math.random() * 9000000000 + 1000000000);
  const upiRef = 'UPI' + Math.floor(Math.random() * 900000 + 100000);
  useEffect(() => {
    if (phase === 'processing') {
      const t = setTimeout(() => setPhase('success'), 2400);
      return () => clearTimeout(t);
    }
  }, [phase]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f8ff', minHeight: 700, overflowY: 'auto' }}>
      <StatusBar />
      {phase === 'trigger' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #7d3c00, #c0392b)', padding: '16px 20px 24px', borderRadius: '0 0 24px 24px' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚡ Drought Trigger Event</div>
            <div style={{ fontSize: 11, color: '#ffffff99', marginTop: 4 }}>Oracle alert received · Barmer District</div>
          </div>
          <div style={{ padding: '16px', flex: 1 }}>
            <div style={{ background: '#fff8f0', border: '1px solid #f39c12', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#856404', marginBottom: 10 }}>Oracle Report — Barmer District</div>
              {[['NASA MODIS NDVI', '0.19 (threshold: 0.30)', '#e74c3c'], ['IMD Rainfall', '12mm / 30-day avg (threshold: 40mm)', '#e74c3c'], ['ISRO Temp', '46.2°C (threshold: 45°C)', '#e74c3c'], ['ICAR Soil Moisture', '11% (wilting point: 15%)', '#e74c3c']].map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #fde8c8', fontSize: 11 }}>
                  <span style={{ color: '#666' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, background: '#fdedec', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#c0392b', fontWeight: 700, textAlign: 'center' }}>🚨 AI Quorum: 94% confidence · Drought CONFIRMED</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 14, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#888' }}>Policy</span><span style={{ fontWeight: 700, color: SBI_NAVY }}>Smart Shield — Wheat</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#888' }}>Payout Amount</span><span style={{ fontWeight: 900, fontSize: 18, color: SBI_GREEN }}>₹72,000</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: '#888' }}>Payout Method</span><span style={{ fontWeight: 700, color: SBI_BLUE }}>IMPS to SBI Account ****4821</span></div>
            </div>
            <button onClick={() => setPhase('processing')} style={{ width: '100%', background: 'linear-gradient(135deg, #1a4731, #27ae60)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Approve Payout via Smart Contract</button>
          </div>
        </>
      )}
      {phase === 'processing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 16 }}>
          <div style={{ fontSize: 48, animation: 'pulse 0.8s ease-in-out infinite alternate' }}>💸</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: SBI_NAVY }}>Processing IMPS Transfer...</div>
          {['Smart contract executing', 'NPCI IMPS gateway connected', 'Crediting SBI Account ****4821', 'Generating UTR / RRN'].map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: '#888' }}>• {s}</div>
          ))}
          <style>{`@keyframes pulse { from{transform:scale(1)} to{transform:scale(1.15)} }`}</style>
        </div>
      )}
      {phase === 'success' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #1a4731, #27ae60)', padding: '28px 20px', borderRadius: '0 0 28px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>₹72,000 Credited!</div>
            <div style={{ fontSize: 12, color: '#ffffff99', marginTop: 4 }}>IMPS · 2.3 seconds · Zero forms</div>
          </div>
          <div style={{ padding: '16px', flex: 1 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, border: `2px solid ${SBI_GREEN}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction Receipt</div>
              {[['Amount', '₹72,000'], ['Account', 'SBI ****4821 (Ramesh Kumar)'], ['Method', 'IMPS — Instant Transfer'], ['RRN', rrn], ['UPI Ref', upiRef], ['Time', new Date().toLocaleTimeString('en-IN')], ['Status', 'SUCCESS']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
                  <span style={{ color: '#888' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: k === 'Status' ? SBI_GREEN : SBI_NAVY, fontFamily: ['RRN', 'UPI Ref'].includes(k) ? 'monospace' : 'inherit', fontSize: ['RRN', 'UPI Ref'].includes(k) ? 10 : 12 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#f0fff4', border: `1px solid ${SBI_GREEN}`, borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 11, color: '#1a4731' }}>
              📱 SMS sent: "IMPS Dr ₹72,000 UPI Ref {upiRef}. Crop insurance claim settled via YONO Oracle IIE. Traditional wait: 180 days. Yours: 2.3 sec."
            </div>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: SBI_TEAL, fontWeight: 700 }}>Powered by YONO Oracle</div>
              <div style={{ fontSize: 11, color: '#888' }}>Insurance that pays before you claim.</div>
            </div>
            <button onClick={onRestart} style={{ width: '100%', background: `linear-gradient(135deg, ${SBI_BLUE}, ${SBI_TEAL})`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>🔄 Start New Demo</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function YonoPage() {
  const [screen, setScreen] = useState<Screen>('splash');
  const go = (s: Screen) => setScreen(s);

  const SCREEN_MAP: Record<Screen, React.ReactNode> = {
    splash:     <SplashScreen next={() => go('login')} />,
    login:      <LoginScreen next={() => go('otp')} />,
    otp:        <OTPScreen next={() => go('home')} />,
    home:       <HomeScreen next={() => go('insurance')} />,
    insurance:  <InsuranceScreen next={() => go('enroll')} />,
    enroll:     <AadhaarScreen next={() => go('digilocker')} />,
    aadhaar:    <AadhaarScreen next={() => go('digilocker')} />,
    digilocker: <DigiLockerScreen next={() => go('processing')} />,
    plan:       <InsuranceScreen next={() => go('enroll')} />,
    processing: <ProcessingScreen next={() => go('success')} />,
    success:    <SuccessScreen next={() => go('payout')} />,
    payout:     <PayoutScreen onRestart={() => go('splash')} />,
  };

  const FLOW_STEPS: { id: Screen; label: string }[] = [
    { id: 'splash', label: 'Splash' },
    { id: 'login', label: 'Login' },
    { id: 'otp', label: 'OTP' },
    { id: 'home', label: 'Home' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'enroll', label: 'Aadhaar' },
    { id: 'digilocker', label: 'DigiLocker' },
    { id: 'processing', label: 'Deploy' },
    { id: 'success', label: 'Policy' },
    { id: 'payout', label: 'Payout' },
  ];

  const ORDER = FLOW_STEPS.map(s => s.id);
  const currentIdx = ORDER.indexOf(screen);

  return (
    <div style={{ minHeight: '100vh', background: '#030712', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px 16px 40px' }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 40, padding: '8px 20px', marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>SBI YONO · MOCK SIMULATOR · HACKATHON DEMO</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px' }}>YONO Kisan Insurance Flow</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Full end-to-end SBI YONO app simulation — Login → Enroll → Aadhaar → DigiLocker → IMPS Payout</p>
      </div>

      {/* Step indicator */}
      <div style={{ maxWidth: 640, margin: '0 auto 24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, padding: '4px 0', minWidth: 'max-content', justifyContent: 'center' }}>
          {FLOW_STEPS.map((s, i) => {
            const active = screen === s.id;
            const done = i < currentIdx;
            return (
              <button key={s.id} onClick={() => setScreen(s.id)}
                style={{ background: active ? SBI_TEAL : done ? '#1e3a2a' : '#0d1117', color: active ? '#fff' : done ? '#34d399' : '#475569', border: `1px solid ${active ? SBI_TEAL : done ? '#34d39966' : '#1e293b'}`, borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                {done ? '✓ ' : ''}{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone */}
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <PhoneFrame>
          {SCREEN_MAP[screen]}
        </PhoneFrame>
      </div>

      {/* Tagline */}
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#34d399', fontWeight: 700 }}>
        Powered by YONO Oracle — Insurance that pays before you claim.
      </div>
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: '#475569' }}>
        SBI branding used for hackathon demonstration purposes only · Not an official SBI product
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        {[['Demo', '/demo'], ['India Stack', '/india-stack'], ['Dashboard', '/dashboard']].map(([label, href]) => (
          <a key={href} href={href} style={{ background: '#0d1117', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 10, padding: '8px 18px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>{label} →</a>
        ))}
      </div>
    </div>
  );
}
