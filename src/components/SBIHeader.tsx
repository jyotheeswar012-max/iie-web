'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SBIHeader() {
  const [health, setHealth] = useState<{status:string}|null>(null);
  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>{});
  }, []);
  return (
    <header style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* SBI brand bar */}
      <div style={{
        background:'linear-gradient(90deg,#1a237e 0%,#283593 60%,#1565c0 100%)',
        padding:'8px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {/* SBI wordmark */}
          <div style={{
            background:'#fff', borderRadius:6, padding:'4px 10px',
            fontWeight:900, fontSize:18, color:'#1a237e', letterSpacing:'0.08em',
            lineHeight:1, border:'2px solid #ffffff44',
          }}>SBI</div>
          <div style={{ borderLeft:'1px solid #ffffff44', paddingLeft:14 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:13, letterSpacing:'0.02em' }}>State Bank of India</div>
            <div style={{ color:'#90caf9', fontSize:11 }}>YONO · India&apos;s Largest Bank by Assets</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ color:'#90caf9', fontSize:12 }}>SBI Global Fintech Fest 2026</span>
          <span style={{
            background: health?.status==='ok' ? '#00c85322' : '#ff000022',
            border:`1px solid ${health?.status==='ok'?'#00c853':'#ff1744'}66`,
            borderRadius:999, padding:'3px 10px', fontSize:11, fontWeight:700,
            color: health?.status==='ok' ? '#00e676' : '#ff6b6b',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: health?.status==='ok'?'#00e676':'#ff6b6b', display:'inline-block', animation:'sbipulse 1.4s infinite' }} />
            {health?.status==='ok' ? 'ALL SYSTEMS LIVE' : 'CONNECTING…'}
          </span>
        </div>
      </div>
      {/* YONO product bar */}
      <div style={{
        background:'linear-gradient(90deg,#042f2e,#0f766e)',
        padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow:'0 2px 12px #0f766e33',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>🌾</span>
          <div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:17, letterSpacing:'-0.02em' }}>YONO-Oracle IIE</div>
            <div style={{ color:'#6ee7b7', fontSize:11 }}>Intelligent Insurance Engine · Parametric · Oracle-verified · IMPS-settled</div>
          </div>
        </div>
        <nav style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[
            ['/','Home'],['​/demo','⚡ Demo'],['​/impact','📊 Impact'],
            ['​/blockchain','🔗 Audit'],['​/india-stack','🇮🇳 India Stack'],
          ].map(([href,label])=>(
            <Link key={href} href={href} style={{
              color:'#a7f3d0', fontSize:12, fontWeight:600, textDecoration:'none',
              padding:'5px 12px', borderRadius:6, background:'#ffffff12', border:'1px solid #ffffff1a',
              whiteSpace:'nowrap',
            }}>{label}</Link>
          ))}
        </nav>
      </div>
      <style>{`@keyframes sbipulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </header>
  );
}
