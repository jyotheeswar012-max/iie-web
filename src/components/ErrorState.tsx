'use client';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ title = 'Failed to load', message, onRetry, compact }: Props) {
  if (compact) {
    return (
      <div style={{ background:'#2d0a0a', border:'1px solid #7f1d1d', borderRadius:10,
        padding:'10px 14px', color:'#fca5a5', fontSize:12, display:'flex',
        alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <span>⚠️ {title}{message ? ` — ${message}` : ''}</span>
        {onRetry && (
          <button onClick={onRetry} style={{ background:'#7f1d1d', color:'#fca5a5', border:'none',
            borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
            Retry
          </button>
        )}
      </div>
    );
  }
  return (
    <div style={{ background:'#0f172a', border:'1px solid #7f1d1d', borderRadius:14,
      padding:'32px 20px', textAlign:'center' }}>
      <div style={{ fontSize:36, marginBottom:10 }}>⚠️</div>
      <div style={{ fontSize:15, fontWeight:700, color:'#f87171', marginBottom:6 }}>{title}</div>
      {message && <div style={{ fontSize:12, color:'#64748b', marginBottom:16, lineHeight:1.6 }}>{message}</div>}
      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
        {onRetry && (
          <button onClick={onRetry} style={{ background:'linear-gradient(135deg,#7f1d1d,#991b1b)',
            color:'#fca5a5', border:'none', borderRadius:9, padding:'9px 18px',
            fontSize:12, fontWeight:700, cursor:'pointer' }}>
            🔄 Retry
          </button>
        )}
        <a href="/" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #1e293b',
          color:'#94a3b8', borderRadius:9, padding:'9px 18px', fontSize:12,
          fontWeight:700, textDecoration:'none' }}>← Home</a>
      </div>
    </div>
  );
}
