'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[IIE Error]', error); }, [error]);
  return (
    <div style={{ minHeight:'100vh', background:'#030712', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',system-ui,sans-serif", padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>⚠️</div>
        <h1 style={{ fontSize:22, fontWeight:900, color:'#f87171', marginBottom:8 }}>Something went wrong</h1>
        <p style={{ color:'#64748b', fontSize:13, marginBottom:20, lineHeight:1.7 }}>
          An unexpected error occurred in the IIE engine. The error has been logged.
          {error?.digest && <><br /><code style={{ fontSize:10, color:'#334155', background:'#0f172a', padding:'2px 6px', borderRadius:4 }}>digest: {error.digest}</code></>}
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={reset}
            style={{ background:'linear-gradient(135deg,#065f46,#047857)', color:'#d1fae5', border:'none', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            🔄 Try Again
          </button>
          <a href="/"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', color:'#e2e8f0', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, textDecoration:'none' }}>
            ← Home
          </a>
        </div>
      </div>
    </div>
  );
}
