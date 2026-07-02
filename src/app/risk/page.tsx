'use client'
import { useState } from 'react'

const DISTRICTS = [
  { district:'Warangal',    state:'Telangana',   score:82, level:'Critical', type:'Drought',  farmers:18400 },
  { district:'Khammam',     state:'Telangana',   score:67, level:'High',     type:'Flood',    farmers:12200 },
  { district:'Adilabad',    state:'Telangana',   score:55, level:'High',     type:'Cyclone',  farmers:9800  },
  { district:'Nashik',      state:'Maharashtra', score:71, level:'Critical', type:'Drought',  farmers:22100 },
  { district:'Latur',       state:'Maharashtra', score:88, level:'Critical', type:'Heatwave', farmers:16700 },
  { district:'Barmer',      state:'Rajasthan',   score:91, level:'Critical', type:'Drought',  farmers:24300 },
  { district:'Jodhpur',     state:'Rajasthan',   score:62, level:'High',     type:'Heatwave', farmers:19500 },
  { district:'Ludhiana',    state:'Punjab',      score:38, level:'Medium',   type:'Flood',    farmers:11200 },
  { district:'Amritsar',    state:'Punjab',      score:28, level:'Low',      type:'Drought',  farmers:8900  },
  { district:'Puri',        state:'Odisha',      score:79, level:'Critical', type:'Cyclone',  farmers:14600 },
  { district:'Bhubaneswar', state:'Odisha',      score:51, level:'High',     type:'Flood',    farmers:10300 },
  { district:'Surat',       state:'Gujarat',     score:44, level:'Medium',   type:'Flood',    farmers:17800 },
]
const LEVEL_COLORS: Record<string,string> = {
  Critical:'text-red-400 bg-red-950/50 border-red-800',
  High:    'text-orange-400 bg-orange-950/50 border-orange-800',
  Medium:  'text-yellow-400 bg-yellow-950/50 border-yellow-800',
  Low:     'text-green-400 bg-green-950/50 border-green-800',
}

export default function RiskPage() {
  const [filterState, setFilterState] = useState('All')
  const [filterLevel, setFilterLevel] = useState('All')
  const states = ['All','Telangana','Maharashtra','Rajasthan','Punjab','Odisha','Gujarat']
  const levels = ['All','Critical','High','Medium','Low']
  const filtered = DISTRICTS
    .filter(d => filterState==='All' || d.state===filterState)
    .filter(d => filterLevel==='All' || d.level===filterLevel)
    .sort((a,b) => b.score-a.score)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page header ── */}
      <div className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#0a0e27,#0d1b4b,#1a237e)' }}>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-2">🛰️ Satellite Risk Intelligence</div>
        <h1 className="text-3xl font-black gradient-text">Live Risk Map — India</h1>
        <p className="text-white/60 text-sm mt-2">Real-time parametric risk scoring · NASA MODIS, IMD, Sentinel-2 &amp; ICAR</p>
      </div>

      {/* ── Basis Risk & Moral Hazard callout ── */}
      <div className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden>⚠️</span>
          <div>
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-widest mb-2">
              Known Limitation — Basis Risk &amp; Moral Hazard
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-2">
              Parametric insurance carries inherent <span className="text-amber-200 font-semibold">basis risk</span>: a
              trigger may fire when a specific farmer suffered no loss (false positive), or fail to fire when
              they did (false negative), because index measurements are district-level proxies rather than
              plot-level observations.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mb-2">
              AgroShield mitigates this through a <span className="text-[#64ffda] font-semibold">4-oracle quorum</span> —
              a payout requires corroborating signals from NASA MODIS (NDVI), IMD weather stations,
              Sentinel-2 imagery, and ICAR soil sensors simultaneously. Requiring consensus across four
              independent data sources eliminates single-sensor noise and reduces false triggers by design.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Risk scoring is computed at <span className="text-[#64ffda] font-semibold">sub-district granularity</span>
              (tehsil level where data permits), and trigger thresholds are calibrated per district using
              historical IMD normals — so a Barmer drought boundary is not the same as a Puri cyclone
              boundary. Residual basis risk is disclosed in every policy certificate as a known, priced
              parameter, consistent with IRDAI&apos;s 2023 parametric insurance guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          ['🔴', filtered.filter(d=>d.level==='Critical').length, 'Critical','text-red-400'],
          ['🟠', filtered.filter(d=>d.level==='High').length,     'High',    'text-orange-400'],
          ['📊', filtered.length,                                  'Districts','text-[#64ffda]'],
          ['👨\u200d🌾', filtered.reduce((s,d)=>s+d.farmers,0).toLocaleString(),'Farmers','text-[#e3b341]'],
        ].map(([icon,val,lbl,cls],i) => (
          <div key={i} className="glass p-4 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-2xl font-black ${cls}`}>{val}</div>
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1">{lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="glass p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#7d8590]">State:</label>
          <select value={filterState} onChange={e=>setFilterState(e.target.value)}
            className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3]">
            {states.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#7d8590]">Level:</label>
          <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)}
            className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3]">
            {levels.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* ── District table ── */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#21262d]">
              {['District','State','Risk Score','Level','Type','Farmers'].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[#7d8590] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d,i) => (
              <tr key={i} className="border-b border-[#21262d]/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-bold text-[#e6edf3]">{d.district}</td>
                <td className="px-4 py-3 text-[#7d8590]">{d.state}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${d.score}%`, background:d.score>=70?'#f85149':d.score>=50?'#e3b341':'#3fb950' }} />
                    </div>
                    <span className="font-mono text-xs text-[#e6edf3]">{d.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[d.level]}`}>{d.level}</span>
                </td>
                <td className="px-4 py-3 text-[#7d8590] text-xs">{d.type}</td>
                <td className="px-4 py-3 text-[#e6edf3] font-mono text-xs">{d.farmers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
