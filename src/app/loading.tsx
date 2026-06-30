export default function Loading() {
  return (
    <div style={{ minHeight:'100vh', background:'#030712', fontFamily:"'Inter',system-ui,sans-serif", padding:'20px 14px' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .sk { background:linear-gradient(90deg,#0f172a 25%,#1e293b 50%,#0f172a 75%); background-size:800px 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
      `}</style>
      {/* Topbar skeleton */}
      <div style={{ height:44, marginBottom:20, borderRadius:10 }} className="sk" />
      {/* Hero */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:28 }}>
        <div style={{ width:56, height:56, borderRadius:'50%' }} className="sk" />
        <div style={{ width:280, height:32, borderRadius:8 }} className="sk" />
        <div style={{ width:420, height:14, borderRadius:6 }} className="sk" />
        <div style={{ width:320, height:12, borderRadius:6 }} className="sk" />
        <div style={{ display:'flex', gap:8 }}>
          {[140,100,110].map(w => <div key={w} style={{ width:w, height:38, borderRadius:10 }} className="sk" />)}
        </div>
      </div>
      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[1,2,3,4,5,6].map(i => <div key={i} style={{ height:76, borderRadius:12 }} className="sk" />)}
      </div>
      {/* Two wide cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        {[200,180].map(h => <div key={h} style={{ height:h, borderRadius:14 }} className="sk" />)}
      </div>
      {/* Nav grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[1,2,3,4,5,6,7,8].map(i => <div key={i} style={{ height:100, borderRadius:14 }} className="sk" />)}
      </div>
    </div>
  );
}
