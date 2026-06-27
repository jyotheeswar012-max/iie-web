import Link from 'next/link';

export default function HomePage() {
  const LINKS = [
    { href:'/demo',         emoji:'⚡', label:'Live Demo',         sub:'Full 5-step engine walkthrough' },
    { href:'/enroll',       emoji:'📋', label:'Enroll Farmer',     sub:'Policy issuance + contract deploy' },
    { href:'/risk',         emoji:'🛰️', label:'Oracle Feed',       sub:'Live multi-district risk data' },
    { href:'/payouts',      emoji:'💸', label:'Payout Tracker',    sub:'IMPS credits + UPI references' },
    { href:'/blockchain',   emoji:'🔗', label:'Audit Chain',       sub:'Tamper-evident ledger' },
    { href:'/architecture', emoji:'🏗️', label:'Architecture',      sub:'System design overview' },
    { href:'/india-stack',  emoji:'🇮🇳', label:'India Stack',      sub:'DigiLocker, UPI, Aadhaar' },
    { href:'/impact',       emoji:'📊', label:'Impact',            sub:'Coverage, claims, reach' },
  ];
  return (
    <main style={{
      minHeight:'100vh', background:'linear-gradient(135deg,#042f2e 0%,#0f766e 55%,#059669 100%)',
      fontFamily:"'Inter',system-ui,sans-serif", display:'flex', flexDirection:'column',
      alignItems:'center', padding:'40px 16px'
    }}>
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🌾</div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:36, letterSpacing:'-0.02em', margin:0 }}>
          YONO-Oracle IIE
        </h1>
        <p style={{ color:'#99f6e4', fontSize:16, marginTop:8, maxWidth:520 }}>
          Intelligent Insurance Engine · Real Oracle · Real Smart Contracts · Real ML
          <br/><span style={{ fontSize:13, color:'#6ee7b7' }}>SBI GFF 2026 — Parametric Crop Insurance</span>
        </p>
        <Link href="/demo" style={{
          display:'inline-block', marginTop:20, background:'#fff', color:'#0f766e',
          borderRadius:12, padding:'13px 32px', fontWeight:800, fontSize:16,
          textDecoration:'none', boxShadow:'0 4px 24px #00000033'
        }}>⚡ Start Live Demo →</Link>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',
        gap:14, maxWidth:960, width:'100%'
      }}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            background:'#ffffff15', border:'1px solid #ffffff33',
            borderRadius:14, padding:'18px 20px', textDecoration:'none',
            transition:'all 0.18s', display:'block'
          }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{l.emoji}</div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:4 }}>{l.label}</div>
            <div style={{ color:'#a7f3d0', fontSize:13 }}>{l.sub}</div>
          </Link>
        ))}
      </div>

      <div style={{
        marginTop:40, background:'#ffffff15', border:'1px solid #ffffff33',
        borderRadius:14, padding:'18px 28px', maxWidth:600, textAlign:'center'
      }}>
        <div style={{ color:'#fff', fontSize:14, lineHeight:1.8 }}>
          <b style={{ color:'#6ee7b7' }}>4 Real Engines running on Vercel:</b><br/>
          🛰️ Oracle (NASA MODIS · IMD · ISRO · ICAR) &nbsp;·&nbsp;
          ⚡ Smart Contract SM (ACTIVE→TRIGGERED→EXECUTED) &nbsp;·&nbsp;
          🔗 SHA-256 Audit Chain (tamper-evident) &nbsp;·&nbsp;
          🤖 ML Predictor (NDVI weighted, FAO/ISRO thresholds)
        </div>
      </div>
    </main>
  );
}
