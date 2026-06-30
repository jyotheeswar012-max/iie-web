'use client';

interface Props {
  icon?: string;
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  compact?: boolean;
}

export function EmptyState({ icon = '📭', title = 'No data yet', message, action, compact }: Props) {
  if (compact) {
    return (
      <div style={{ background:'#0f172a', border:'1px dashed #334155', borderRadius:10,
        padding:'14px', color:'#475569', fontSize:12, textAlign:'center' }}>
        {icon} {title}
      </div>
    );
  }
  return (
    <div style={{ background:'#0f172a', border:'1px dashed #334155', borderRadius:14,
      padding:'40px 20px', textAlign:'center' }}>
      <div style={{ fontSize:40, marginBottom:10 }}>{icon}</div>
      <div style={{ fontSize:14, fontWeight:700, color:'#475569', marginBottom:6 }}>{title}</div>
      {message && <div style={{ fontSize:12, color:'#334155', marginBottom:16 }}>{message}</div>}
      {action && (
        <button onClick={action.onClick}
          style={{ background:'linear-gradient(135deg,#065f46,#047857)', color:'#d1fae5',
            border:'none', borderRadius:9, padding:'9px 18px', fontSize:12,
            fontWeight:700, cursor:'pointer' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
