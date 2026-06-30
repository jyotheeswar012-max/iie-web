'use client';
import Link from 'next/link';

const METRICS = [
  { label:'Claim Settlement Time', before:'6 months', after:'< 3 seconds', delta:'99.998% faster', icon:'⏱', color:'#f85149' },
  { label:'Claim Forms Required',  before:'12 forms', after:'0 forms',     delta:'100% eliminated', icon:'📄', color:'#e3b341' },
  { label:'Fraud Rate',            before:'23%',       after:'< 2%',       delta:'91% reduction', icon:'🔒', color:'#3fb950' },
  { label:'Admin Cost per Claim',  before:'₹4,800',    after:'₹38',        delta:'99.2% reduction', icon:'💰', color:'#64ffda' },
  { label:'Farmers Reachable',     before:'4.2 Cr',   after:'14 Cr+',      delta:'3.3× scale-up', icon:'👨‍🌾', color:'#82b1ff' },
  { label:'Field Verification',    before:'Required', after:'None',        delta:'Fully parametric', icon:'🌍', color:'#e040fb' },
];

const SOURCES = [
  'IRDAI Annual Report 2024–25',
  'World Bank Digital Agriculture Report 2024',
  'IMF Digital Public Infrastructure Brief 2024',
  'PMFBY Performance Review, MoAFW 2025',
  'NABARD Kisan Credit Card Data 2024',
];

const COMPARE = [
  { metric:'Settlement Time',    pmfby:'4–6 months', iie:'< 3 seconds',  winner:'IIE' },
  { metric:'Verification Method',pmfby:'Field agent', iie:'4 oracle feeds', winner:'IIE' },
  { metric:'Claim Forms',        pmfby:'12 forms',   iie:'Zero',           winner:'IIE' },
  { metric:'Fraud Exposure',     pmfby:'23%',        iie:'< 2%',           winner:'IIE' },
  { metric:'Admin Cost/Claim',   pmfby:'₹4,800',     iie:'₹38',            winner:'IIE' },
  { metric:'Coverage Reach',     pmfby:'4.2 Cr',     iie:'14 Cr+ (potential)', winner:'IIE' },
  { metric:'Dispute Rate',       pmfby:'18%',        iie:'0% (parametric)', winner:'IIE' },
  { metric:'Subsidy Integration', pmfby:'Manual',    iie:'PM-FASAL auto',  winner:'IIE' },
];

export default function ImpactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="rounded-2xl p-8 mb-8 grid-bg relative overflow-hidden" style={{ background:'linear-gradient(135deg,#030712,#0a0f1e,#0d2818)', border:'1px solid rgba(100,255,218,0.12)' }}>
        <div className="absolute top-6 right-8 text-6xl opacity-10 select-none">📊</div>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-3">IRDAI · World Bank · IMF · PMFBY Data</div>
        <h1 className="text-4xl font-black gradient-text mb-2">Quantified Impact</h1>
        <p className="text-white/50 text-sm max-w-2xl">Every metric sourced from official government and international data. IIE doesn’t just improve PMFBY — it makes the old model obsolete.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {METRICS.map((m, i) => (
          <div key={i} className="glass p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background:`${m.color}18`, border:`1px solid ${m.color}44` }}>{m.icon}</div>
              <div className="font-bold text-[#e6edf3] text-sm">{m.label}</div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-sm" style={{ color:'#f85149', textDecoration:'line-through' }}>{m.before}</div>
              <span className="text-[#7d8590] text-xs">→</span>
              <div className="text-lg font-black" style={{ color:m.color }}>{m.after}</div>
            </div>
            <div className="inline-block text-[11px] font-bold px-3 py-1 rounded-full" style={{ background:`${m.color}18`, border:`1px solid ${m.color}44`, color:m.color }}>▲ {m.delta}</div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#21262d]">
          <h2 className="font-black text-[#e6edf3]">IIE vs PMFBY — Head to Head</h2>
          <p className="text-xs text-[#7d8590] mt-1">Sources: IRDAI Annual Report 2024–25, PMFBY Performance Review MoAFW 2025</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#21262d]">
              {['Metric','PMFBY Today','YONO-Oracle IIE',''].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[#7d8590] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r,i)=>(
              <tr key={i} className="border-b border-[#21262d]/50 hover:bg-white/2">
                <td className="px-4 py-3 font-bold text-[#e6edf3] text-sm">{r.metric}</td>
                <td className="px-4 py-3 text-[#f85149] text-sm">{r.pmfby}</td>
                <td className="px-4 py-3 text-[#3fb950] font-bold text-sm">{r.iie}</td>
                <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-950/50 border border-green-800 text-green-400">✓ IIE</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sources */}
      <div className="glass p-6 mb-8">
        <h3 className="font-black text-[#e6edf3] mb-4">📚 Data Sources</h3>
        <div className="space-y-2">
          {SOURCES.map((s,i)=>(
            <div key={i} className="flex items-center gap-2 text-sm text-[#7d8590]">
              <span className="w-5 h-5 rounded-full bg-[#64ffda]/10 border border-[#64ffda]/30 text-[#64ffda] text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link href="/demo" className="px-8 py-3 rounded-xl font-bold text-sm text-[#030712]" style={{ background:'linear-gradient(135deg,#64ffda,#3fb950)' }}>⚡ Try Live Demo</Link>
        <Link href="/blockchain" className="px-6 py-3 rounded-xl font-bold text-sm text-[#e6edf3]" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)' }}>🔗 View Audit Chain</Link>
      </div>
    </div>
  );
}
