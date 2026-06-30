'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href:'/',            label:'Home' },
  { href:'/demo',        label:'Demo' },
  { href:'/agents',      label:'Agents' },
  { href:'/dashboard',   label:'Dashboard' },
  { href:'/risk',        label:'Oracle' },
  { href:'/payouts',     label:'Payouts' },
  { href:'/blockchain',  label:'Audit' },
  { href:'/impact',      label:'Impact' },
];

export function TopNav({ version }: { version?: string }) {
  const path = usePathname();
  return (
    <nav style={{ background:'#0d1117', borderBottom:'1px solid #1e293b', position:'sticky', top:0, zIndex:60,
      display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', flexWrap:'wrap', gap:4 }}>
      {/* Logo */}
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', padding:'10px 0', flexShrink:0 }}>
        <span style={{ fontSize:18 }}>🌾</span>
        <span style={{ fontSize:13, fontWeight:900, color:'#e2e8f0' }}>IIE</span>
        {version && <span style={{ fontSize:9, color:'#34d399', fontFamily:'monospace', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:5, padding:'1px 5px' }}>{version}</span>}
      </Link>
      {/* Links */}
      <div style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none', flex:1, justifyContent:'center' }}>
        {LINKS.map(l => {
          const active = path === l.href || (l.href !== '/' && path.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href}
              style={{ padding:'12px 11px', fontSize:11.5, fontWeight: active ? 700 : 500,
                color: active ? '#34d399' : '#64748b',
                borderBottom: active ? '2px solid #34d399' : '2px solid transparent',
                textDecoration:'none', whiteSpace:'nowrap', transition:'color 0.15s' }}>
              {l.label}
            </Link>
          );
        })}
      </div>
      {/* CTA */}
      <Link href="/demo"
        style={{ fontSize:11, fontWeight:700, color:'#030712', background:'linear-gradient(135deg,#64ffda,#3fb950)',
          borderRadius:8, padding:'6px 14px', textDecoration:'none', flexShrink:0 }}>
        ⚡ Demo
      </Link>
    </nav>
  );
}
