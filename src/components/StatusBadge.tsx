// Shared status badge — import anywhere
export type ContractState = 'ACTIVE'|'TRIGGERED'|'FRAUD_REVIEW'|'EXECUTED'|'REJECTED'|'DRAFT';

export const STATE_META: Record<ContractState,{color:string;bg:string;border:string;emoji:string;label:string}> = {
  ACTIVE:       { color:'#34d399', bg:'#052e16', border:'#166534', emoji:'🟢', label:'Active'       },
  TRIGGERED:    { color:'#fbbf24', bg:'#1c1400', border:'#854d0e', emoji:'⚡',    label:'Triggered'    },
  FRAUD_REVIEW: { color:'#f97316', bg:'#1c0a00', border:'#9a3412', emoji:'🕵️', label:'Fraud Review' },
  EXECUTED:     { color:'#4ade80', bg:'#052e16', border:'#166534', emoji:'✅',    label:'Executed'     },
  REJECTED:     { color:'#f87171', bg:'#2d0a0a', border:'#7f1d1d', emoji:'❌',    label:'Rejected'     },
  DRAFT:        { color:'#94a3b8', bg:'#0f172a', border:'#1e293b', emoji:'📄', label:'Draft'        },
};

export function StateBadge({ state }: { state: ContractState }) {
  const m = STATE_META[state];
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:5,
      background:m.bg,border:`1px solid ${m.border}`,borderRadius:8,
      padding:'3px 10px',fontSize:11,fontWeight:700,color:m.color,whiteSpace:'nowrap' }}>
      {m.emoji} {m.label}
    </span>
  );
}

export function StateDot({ state }: { state: ContractState }) {
  const m = STATE_META[state];
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:5 }}>
      <span style={{ width:8,height:8,borderRadius:'50%',background:m.color,
        boxShadow:`0 0 7px ${m.color}99`,display:'inline-block',
        animation:state==='TRIGGERED'||state==='FRAUD_REVIEW'?'pulse 1s infinite':undefined }} />
      <b style={{ color:m.color,fontSize:12 }}>{state}</b>
    </span>
  );
}
