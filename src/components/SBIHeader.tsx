'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function SBIHeader() {
  const [health, setHealth] = useState<{ status: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => {});
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const NAV = [
    { href: '/',             label: 'Home' },
    { href: '/demo',         label: '⚡ Demo' },
    { href: '/dashboard',   label: '📊 Dashboard' },
    { href: '/impact',       label: '🌾 Impact' },
    { href: '/blockchain',  label: '🔗 Audit' },
    { href: '/risk',         label: '🛰️ Risk' },
    { href: '/enroll',       label: '📋 Enroll' },
    { href: '/payouts',      label: '💸 Payouts' },
    { href: '/india-stack', label: '🇮🇳 India Stack' },
    { href: '/architecture',label: '🏗️ Arch' },
  ];

  return (
    <header style={{ fontFamily: "'Inter',system-ui,sans-serif", position: 'sticky', top: 0, zIndex: 100 }}>
      <style>{`
        @keyframes sbi-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .sbi-nav-link { color:#7d8590; font-size:11.5px; font-weight:600; text-decoration:none; padding:5px 9px; border-radius:7px; border:1px solid transparent; transition:all 0.15s; white-space:nowrap; }
        .sbi-nav-link:hover, .sbi-nav-link[aria-current='page'] { background:rgba(100,255,218,0.08); color:#64ffda; border-color:rgba(100,255,218,0.2); }
        .sbi-nav-link:focus-visible { outline:2px solid #64ffda; outline-offset:2px; }
        @media (max-width: 768px) { .sbi-desktop-nav { display: none !important; } .sbi-hamburger { display: flex !important; } }
        @media (min-width: 769px) { .sbi-mobile-nav { display: none !important; } }
      `}</style>

      {/* ── SBI brand bar ── */}
      <div style={{ background:'linear-gradient(90deg,#0d1b4b 0%,#1a237e 60%,#1565c0 100%)', padding:'7px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:5, padding:'3px 9px', fontWeight:900, fontSize:17, color:'#1a237e', letterSpacing:'0.06em', lineHeight:1 }}>SBI</div>
          <div style={{ borderLeft:'1px solid rgba(255,255,255,0.2)', paddingLeft:12 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:12.5 }}>State Bank of India</div>
            <div style={{ color:'#90caf9', fontSize:10.5 }}>YONO · GFF 2026 · Parametric Insurance Engine</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className="hide-mobile" style={{ color:'#90caf9', fontSize:11 }}>SBI Global Fintech Fest 2026</span>
          <span style={{ background: health?.status==='ok'?'rgba(63,185,80,0.18)':'rgba(248,81,73,0.18)', border:`1px solid ${health?.status==='ok'?'rgba(63,185,80,0.5)':'rgba(248,81,73,0.5)'}`, borderRadius:999, padding:'3px 10px', fontSize:10.5, fontWeight:700, color:health?.status==='ok'?'#3fb950':'#f85149', display:'inline-flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:health?.status==='ok'?'#3fb950':'#f85149', display:'inline-block', animation:'sbi-pulse 1.4s infinite' }} />
            {health?.status==='ok'?'ALL SYSTEMS LIVE':'CONNECTING…'}
          </span>
        </div>
      </div>

      {/* ── YONO product nav ── */}
      <div style={{ background:'linear-gradient(90deg,#0d1117,#0a0f1e,#030712)', padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(100,255,218,0.1)', boxShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>🌾</span>
          <div>
            <div style={{ color:'#e6edf3', fontWeight:900, fontSize:14, letterSpacing:'-0.02em' }}>YONO-Oracle IIE</div>
            <div style={{ color:'#64ffda', fontSize:9.5 }}>AI·Blockchain·IMPS·IndiaStack</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="sbi-desktop-nav" style={{ display:'flex', gap:2, flexWrap:'wrap', alignItems:'center' }} aria-label="Main navigation">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="sbi-nav-link" aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          className="sbi-hamburger"
          style={{ display:'none', background:'transparent', border:'1px solid rgba(100,255,218,0.3)', borderRadius:8, padding:'6px 10px', color:'#64ffda', cursor:'pointer', alignItems:'center', gap:6 }}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span style={{ fontSize:16 }}>{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div ref={menuRef} className="sbi-mobile-nav" style={{ background:'#0d1117', borderBottom:'1px solid rgba(100,255,218,0.1)', padding:'8px 16px 12px', display:'flex', flexDirection:'column', gap:4 }} aria-label="Mobile navigation">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="sbi-nav-link" style={{ display:'block', padding:'8px 12px' }} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
