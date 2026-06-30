'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SBIHeader() {
  const [health, setHealth] = useState<{ status: string } | null>(null);
  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => {});
  }, []);

  return (
    <header style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes sbi-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .sbi-nav-link:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
      `}</style>

      {/* ── Top: SBI brand bar ── */}
      <div style={{
        background: 'linear-gradient(90deg,#0d1b4b 0%,#1a237e 60%,#1565c0 100%)',
        padding: '7px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: '#fff', borderRadius: 5, padding: '3px 9px',
            fontWeight: 900, fontSize: 17, color: '#1a237e', letterSpacing: '0.06em', lineHeight: 1,
          }}>SBI</div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 14 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.01em' }}>State Bank of India</div>
            <div style={{ color: '#90caf9', fontSize: 10.5 }}>YONO · India’s Largest Bank by Assets · GFF 2026</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#90caf9', fontSize: 11 }}>SBI Global Fintech Fest 2026</span>
          <span style={{
            background: health?.status === 'ok' ? 'rgba(63,185,80,0.18)' : 'rgba(248,81,73,0.18)',
            border: `1px solid ${health?.status === 'ok' ? 'rgba(63,185,80,0.5)' : 'rgba(248,81,73,0.5)'}`,
            borderRadius: 999, padding: '3px 10px', fontSize: 10.5, fontWeight: 700,
            color: health?.status === 'ok' ? '#3fb950' : '#f85149',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: health?.status === 'ok' ? '#3fb950' : '#f85149',
              display: 'inline-block',
              animation: 'sbi-pulse 1.4s infinite',
            }} />
            {health?.status === 'ok' ? 'ALL SYSTEMS LIVE' : 'CONNECTING…'}
          </span>
        </div>
      </div>

      {/* ── Bottom: YONO product nav ── */}
      <div style={{
        background: 'linear-gradient(90deg,#0d1117,#0a0f1e,#030712)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(100,255,218,0.1)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <div>
            <div style={{ color: '#e6edf3', fontWeight: 900, fontSize: 15.5, letterSpacing: '-0.02em' }}>YONO-Oracle IIE</div>
            <div style={{ color: '#64ffda', fontSize: 10.5 }}>Intelligent Insurance Engine · Parametric · AI-Quorum · IMPS-settled</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            ['/', 'Home'],
            ['/demo', '⚡ Demo'],
            ['/impact', '📊 Impact'],
            ['/blockchain', '🔗 Audit'],
            ['/risk', '🛰️ Risk Map'],
            ['/enroll', '📋 Enroll'],
            ['/payouts', '💸 Payouts'],
            ['/india-stack', '🇮🇳 India Stack'],
            ['/architecture', '🏗️ Architecture'],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="sbi-nav-link" style={{
              color: '#7d8590', fontSize: 11.5, fontWeight: 600, textDecoration: 'none',
              padding: '5px 10px', borderRadius: 7,
              background: 'transparent', border: '1px solid transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
