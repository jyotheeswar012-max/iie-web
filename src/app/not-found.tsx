import Link from 'next/link';

const QUICK = [
  { href:'/demo',      emoji:'⚡', label:'Live Demo' },
  { href:'/agents',    emoji:'🤖', label:'Agent Quorum' },
  { href:'/dashboard', emoji:'🗺️', label:'Dashboard' },
  { href:'/impact',    emoji:'📊', label:'Impact' },
];

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#030712', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif", padding:24 }}>
      <style>{`
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .floaty { animation:floaty 3s ease-in-out infinite; }
        .fade-up { animation:fadeUp 0.5s ease both; }
      `}</style>
      <div style={{ textAlign:'center', maxWidth:520 }} className="fade-up">
        <div style={{ fontSize:64, marginBottom:12 }} className="floaty">🌾</div>
        <div style={{ fontSize:80, fontWeight:900, color:'#1e293b', lineHeight:1, marginBottom:4, fontFamily:'monospace' }}>404</div>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#e2e8f0', marginBottom:8 }}>Page not found</h1>
        <p style={{ color:'#64748b', fontSize:13, marginBottom:24, lineHeight:1.7 }}>
          This route doesn&apos;t exist in the IIE engine. Head back to an active page below.
        </p>
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:24 }}>
          {QUICK.map(q => (
            <Link key={q.href} href={q.href}
              style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid #1e293b', borderRadius:10, padding:'9px 16px', fontSize:12, fontWeight:700, color:'#e2e8f0', textDecoration:'none' }}>
              <span>{q.emoji}</span> {q.label}
            </Link>
          ))}
        </div>
        <Link href="/"
          style={{ display:'inline-block', background:'linear-gradient(135deg,#64ffda22,#3fb95022)', border:'1px solid #3fb95044', color:'#64ffda', borderRadius:10, padding:'10px 24px', fontSize:13, fontWeight:700, textDecoration:'none' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
