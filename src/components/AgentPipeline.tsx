const STEPS = [
  { icon:'🔍', color:'#238636', title:'Agent 1: Risk Monitor',
    desc:'Ingests weather, NDVI, soil moisture from 600+ districts every 5 min. Sources: OpenWeatherMap, NASA MODIS, Sentinel-2, ICAR.' },
  { icon:'✅', color:'#388bfd', title:'Agent 2: Trigger Verifier',
    desc:'Cross-validates parametric events across 4 sources. Requires ≥75% quorum. Prevents false positives.' },
  { icon:'📋', color:'#d29922', title:'Agent 3: Policy Matcher',
    desc:'Maps triggers to enrolled YONO policies. Payout = base_rate × crop_mult × acres × confidence.' },
  { icon:'⚡', color:'#f85149', title:'Agent 4: Payout Executor',
    desc:'Initiates UPI/IMPS credits to SBI savings accounts. Average settlement: 47 minutes. Zero claims.' },
]
export default function AgentPipeline() {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-6">
      <h3 className="text-lg font-black text-[#e6edf3] mb-6">🤖 How the Engine Thinks</h3>
      <div className="flex flex-col">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background:`${s.color}20`, border:`2px solid ${s.color}` }}>{s.icon}</div>
              {i < STEPS.length-1 && <div className="w-0.5 h-8 mt-1" style={{ background:`linear-gradient(${s.color},${STEPS[i+1].color})` }} />}
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#e6edf3] text-sm">{s.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background:`${s.color}20`, color:s.color, border:`1px solid ${s.color}50` }}>● RUNNING</span>
              </div>
              <p className="text-xs text-[#7d8590] leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
