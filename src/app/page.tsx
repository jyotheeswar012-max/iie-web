'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const STATS = [
  { value: '₹1.22L', label: 'Max Coverage', sub: 'Full Season Pro' },
  { value: '4', label: 'Oracle Sources', sub: 'NASA · IMD · ISRO · ICAR' },
  { value: '≥75%', label: 'AI Quorum', sub: '4-agent consensus' },
  { value: '<3s', label: 'Payout Speed', sub: 'IMPS settlement' },
];

const LINKS = [
  { href: '/demo',         emoji: '⚡', label: 'Live Demo',       sub: 'Full 5-step engine walkthrough', color: '#0f766e' },
  { href: '/enroll',       emoji: '📋', label: 'Enroll Farmer',   sub: 'Policy issuance + contract deploy', color: '#1d4ed8' },
  { href: '/risk',         emoji: '🛰️', label: 'Oracle Feed',     sub: 'Live multi-district risk data', color: '#7c3aed' },
  { href: '/payouts',      emoji: '💸', label: 'Payout Tracker',  sub: 'IMPS credits + UPI references', color: '#b45309' },
  { href: '/blockchain',   emoji: '🔗', label: 'Audit Chain',     sub: 'SHA-256 tamper-evident ledger', color: '#0369a1' },
  { href: '/architecture', emoji: '🏗️', label: 'Architecture',    sub: 'System design overview', color: '#059669' },
  { href: '/india-stack',  emoji: '🇮🇳', label: 'India Stack',    sub: 'DigiLocker · UPI · Aadhaar', color: '#dc2626' },
  { href: '/impact',       emoji: '📊', label: 'GFF Impact',      sub: 'Coverage, claims & reach', color: '#d97706' },
];

const PIPELINE = [
  { icon: '📋', step: 'KYC + Enroll', detail: 'DigiLocker · Aadhaar · PM-FASAL subsidy' },
  { icon: '🛰️', step: 'Oracle Fetch', detail: 'NASA MODIS · IMD · ISRO · ICAR sensors' },
  { icon: '🤖', step: 'AI Quorum',    detail: '4 agents vote · ≥75% triggers payout' },
  { icon: '⚡', step: 'Smart Contract', detail: 'ACTIVE → TRIGGERED → EXECUTED on-chain' },
  { icon: '💸', step: 'IMPS Payout',  detail: 'UPI ref + RRN · SMS to farmer in <3s' },
];

export default function HomePage() {
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const activePipe = tick % PIPELINE.length;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #020d0c 0%, #042f2e 40%, #0f766e 80%, #059669 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#fff',
      overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .card-hover:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 40px #00000055 !important; }
        .card-hover { transition: all 0.22s ease; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Hero */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '64px 20px 40px',
        textAlign: 'center',
        opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease',
      }}>
        {/* Live badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{
            background: '#ffffff15', border: '1px solid #6ee7b766',
            borderRadius: 999, padding: '6px 18px', fontSize: 13, fontWeight: 600,
            color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            LIVE · SBI Global Fintech Fest 2026 · All engines running on Vercel
          </span>
        </div>

        <div style={{ fontSize: 72, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🌾</div>

        <h1 style={{
          fontWeight: 900, fontSize: 'clamp(32px, 6vw, 60px)',
          letterSpacing: '-0.03em', margin: '0 0 16px',
          background: 'linear-gradient(90deg, #ffffff, #6ee7b7, #34d399)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'shimmer 4s linear infinite',
        }}>
          YONO-Oracle IIE
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#a7f3d0', maxWidth: 640, margin: '0 auto 12px', lineHeight: 1.6 }}>
          India's first <b style={{ color: '#fff' }}>fully autonomous parametric crop insurance engine</b> —
          oracle-verified, AI-quorum-governed, blockchain-audited, IMPS-settled.
        </p>
        <p style={{ fontSize: 14, color: '#6ee7b7', marginBottom: 36 }}>Powered by NASA · IMD · ISRO · ICAR · PM-FASAL · DigiLocker · UPI · Aadhaar</p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/demo" style={{
            background: 'linear-gradient(135deg, #0f766e, #059669)',
            color: '#fff', borderRadius: 14, padding: '15px 36px',
            fontWeight: 800, fontSize: 17, textDecoration: 'none',
            boxShadow: '0 4px 28px #0f766e88', display: 'flex', alignItems: 'center', gap: 10,
          }}>⚡ Start Live Demo →</Link>
          <Link href="/architecture" style={{
            background: '#ffffff18', border: '1px solid #ffffff44',
            color: '#fff', borderRadius: 14, padding: '15px 28px',
            fontWeight: 700, fontSize: 16, textDecoration: 'none',
          }}>🏗️ Architecture</Link>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 1100, margin: '0 auto 48px', padding: '0 20px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, background: '#ffffff0e', border: '1px solid #ffffff22',
          borderRadius: 20, padding: '24px 20px',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#6ee7b7' }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#a7f3d0', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Pipeline */}
      <div style={{ maxWidth: 1100, margin: '0 auto 56px', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 22, marginBottom: 24, color: '#e2e8f0' }}>
          🔄 Autonomous Pipeline — Live
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
          {PIPELINE.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
              <div style={{
                flex: 1, background: i === activePipe ? '#0f766e' : '#ffffff12',
                border: `2px solid ${i === activePipe ? '#6ee7b7' : '#ffffff22'}`,
                borderRadius: 16, padding: '16px 12px', textAlign: 'center',
                transition: 'all 0.5s ease',
                boxShadow: i === activePipe ? '0 0 24px #0f766e88' : 'none',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: i === activePipe ? '#fff' : '#cbd5e1' }}>{p.step}</div>
                <div style={{ fontSize: 11, color: i === activePipe ? '#a7f3d0' : '#64748b', marginTop: 3, lineHeight: 1.4 }}>{p.detail}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div style={{ color: i === activePipe ? '#6ee7b7' : '#334155', fontSize: 22, margin: '0 6px', flexShrink: 0 }}>›</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nav Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto 56px', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 22, marginBottom: 24, color: '#e2e8f0' }}>🚀 Explore the Engine</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="card-hover" style={{
              background: '#ffffff0d', border: `1px solid ${l.color}55`,
              borderRadius: 16, padding: '20px', textDecoration: 'none', display: 'block',
              boxShadow: '0 2px 12px #00000033',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${l.color}22`, border: `1px solid ${l.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 12,
              }}>{l.emoji}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{l.label}</div>
              <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>{l.sub}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: l.color, fontWeight: 600 }}>Explore →</div>
            </Link>
          ))}
        </div>
      </div>

      {/* India Stack badge row */}
      <div style={{ maxWidth: 1100, margin: '0 auto 56px', padding: '0 20px' }}>
        <div style={{
          background: '#ffffff0a', border: '1px solid #ffffff1a',
          borderRadius: 20, padding: '28px 32px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>India Stack Integration</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {[
              ['🆔', 'Aadhaar KYC'],
              ['📁', 'DigiLocker'],
              ['💳', 'UPI / IMPS'],
              ['🌾', 'PM-FASAL Subsidy'],
              ['🛰️', 'NASA MODIS NDVI'],
              ['🌧️', 'IMD Rainfall'],
              ['🌡️', 'ISRO Bhuvan'],
              ['🌱', 'ICAR Soil Sensors'],
              ['⛓️', 'SHA-256 Ledger'],
              ['🤖', 'ML Risk Model'],
            ].map(([icon, label]) => (
              <span key={label as string} style={{
                background: '#ffffff12', border: '1px solid #ffffff22',
                borderRadius: 999, padding: '7px 16px',
                fontSize: 13, fontWeight: 600, color: '#e2e8f0',
                display: 'flex', alignItems: 'center', gap: 7,
              }}><span>{icon}</span><span>{label}</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 20px 48px', color: '#475569', fontSize: 13 }}>
        <div style={{ color: '#334155', marginBottom: 8 }}>Built for SBI Global Fintech Fest 2026 · YONO-Oracle Intelligent Insurance Engine</div>
        <div>All engines live on Vercel Edge · Next.js 14 · 100% serverless · Zero external dependencies</div>
      </div>
    </main>
  );
}
