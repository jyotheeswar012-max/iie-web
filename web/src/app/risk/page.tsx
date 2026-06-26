'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

const DISTRICTS = [
  { district:'Warangal',    state:'Telangana',   lat:17.98, lon:79.60, score:82, level:'Critical', type:'Drought',  farmers:18400 },
  { district:'Khammam',     state:'Telangana',   lat:17.25, lon:80.15, score:67, level:'High',     type:'Flood',    farmers:12200 },
  { district:'Adilabad',    state:'Telangana',   lat:19.67, lon:78.53, score:55, level:'High',     type:'Cyclone',  farmers:9800  },
  { district:'Nashik',      state:'Maharashtra', lat:19.99, lon:73.79, score:71, level:'Critical', type:'Drought',  farmers:22100 },
  { district:'Latur',       state:'Maharashtra', lat:18.40, lon:76.58, score:88, level:'Critical', type:'Heatwave', farmers:16700 },
  { district:'Barmer',      state:'Rajasthan',   lat:25.75, lon:71.39, score:91, level:'Critical', type:'Drought',  farmers:24300 },
  { district:'Jodhpur',     state:'Rajasthan',   lat:26.29, lon:73.01, score:62, level:'High',     type:'Heatwave', farmers:19500 },
  { district:'Ludhiana',    state:'Punjab',      lat:30.90, lon:75.85, score:38, level:'Medium',   type:'Flood',    farmers:11200 },
  { district:'Amritsar',    state:'Punjab',      lat:31.63, lon:74.87, score:28, level:'Low',      type:'Drought',  farmers:8900  },
  { district:'Puri',        state:'Odisha',      lat:19.81, lon:85.83, score:79, level:'Critical', type:'Cyclone',  farmers:14600 },
  { district:'Bhubaneswar', state:'Odisha',      lat:20.30, lon:85.82, score:51, level:'High',     type:'Flood',    farmers:10300 },
  { district:'Surat',       state:'Gujarat',     lat:21.17, lon:72.83, score:44, level:'Medium',   type:'Flood',    farmers:17800 },
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
    .sort((a,b) => b.score - a.score)
  const critical = filtered.filter(d=>d.level==='Critical').length
  const high     = filtered.filter(d=>d.level==='High').length
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
        className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#0a0e27,#0d1b4b,#1a237e)' }}>
        <div className="text-xs font-bold tracking-[3px] text-brand-teal uppercase mb-2">🛰️ Satellite Risk Intelligence</div>
        <h1 className="text-3xl font-black gradient-text">Live Risk Heatmap — India</h1>
        <p className="text-white/60 text-sm mt-2">Real-time parametric risk scoring across 600+ Indian districts · NASA MODIS, IMD, Sentinel-2 & ICAR</p>
      </motion.div>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[['🔴',critical,'Critical','text-red-400'],['🟠',high,'High','text-orange-400'],
          ['📊',filtered.length,'Total Districts','text-brand-teal'],
          ['👨‍🌾',filtered.reduce((s,d)=>s+d.farmers,0).toLocaleString(),'Farmers Exposed','text-brand-orange']
        ].map(([icon,val,lbl,cls],i) => (
          <div key={i} className="glass p-4 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-2xl font-black ${cls}`}>{val}</div>
            <div className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">{lbl}</div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="glass p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-brand-muted">State:</label>
          <select value={filterState} onChange={e=>setFilterState(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-xs text-brand-text">
            {states.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-brand-muted">Risk Level:</label>
          <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-xs text-brand-text">
            {levels.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        <span className="text-xs text-brand-muted ml-auto">{filtered.length} districts shown</span>
      </div>
      {/* Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['District','State','Risk Score','Level','Type','Farmers at Risk'].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d,i) => (
              <motion.tr key={d.district} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }}
                transition={{ delay:i*0.04 }}
                className="border-b border-brand-border/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-bold text-brand-text">{d.district}</td>
                <td className="px-4 py-3 text-brand-muted">{d.state}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-brand-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${d.score}%`, background: d.score>=70?'#f85149':d.score>=50?'#e3b341':'#3fb950' }} />
                    </div>
                    <span className="font-mono text-xs text-brand-text">{d.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[d.level]}`}>{d.level}</span>
                </td>
                <td className="px-4 py-3 text-brand-muted text-xs">{d.type}</td>
                <td className="px-4 py-3 text-brand-text font-mono text-xs">{d.farmers.toLocaleString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
