'use client';
import { ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  back?: { href: string; label: string };
  badge?: { label: string; color: string };
  children: ReactNode;
}

export function PageWrapper({ title, subtitle, back, badge, children }: Props) {
  return (
    <div style={{ minHeight:'100vh', background:'#030712', fontFamily:"'Inter',system-ui,sans-serif", color:'#e2e8f0' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .pw-content { animation:fadeUp 0.35s ease both; }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:#0f172a }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:2px }
      `}</style>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 14px' }} className="pw-content">
        {(back || title) && (
          <div style={{ marginBottom:18 }}>
            {back && (
              <a href={back.href} style={{ fontSize:11, color:'#475569', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, marginBottom:8 }}>
                ← {back.label}
              </a>
            )}
            {title && (
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <h1 style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', margin:0 }}>{title}</h1>
                {badge && (
                  <span style={{ fontSize:10, fontWeight:700, color:badge.color, background:`${badge.color}22`, border:`1px solid ${badge.color}44`, borderRadius:7, padding:'2px 9px' }}>
                    {badge.label}
                  </span>
                )}
              </div>
            )}
            {subtitle && <p style={{ color:'#64748b', fontSize:12, marginTop:4, marginBottom:0 }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
