'use client'
import Link from 'next/link'

const LAYERS = [
  {
    id: 'L1', label: 'Data Layer', color: '#64ffda',
    nodes: [
      { icon:'🛰️', name:'NASA MODIS', sub:'NDVI every 5min' },
      { icon:'🌧️', name:'IMD Rainfall', sub:'District-level' },
      { icon:'🌍', name:'ISRO Bhuvan', sub:'Geo + Soil' },
      { icon:'🌡️', name:'OpenWeather', sub:'Temp + Wind' },
    ]
  },
  {
    id: 'L2', label: 'Agent Layer (Agentic AI)', color: '#82b1ff',
    nodes: [
      { icon:'🔍', name:'Agent 1: Risk Monitor', sub:'Ingest + Score' },
      { icon:'✅', name:'Agent 2: Verifier', sub:'75% Quorum' },
      { icon:'📋', name:'Agent 3: Policy Matcher', sub:'KYC + RBI check' },
      { icon:'⚡', name:'Agent 4: Executor', sub:'Trigger payout' },
    ]
  },
  {
    id: 'L3', label: 'Oracle + Blockchain Layer', color: '#e040fb',
    nodes: [
      { icon:'📡', name:'Oracle Aggregator', sub:'Chainlink-style' },
      { icon:'⛓️', name:'Smart Contract', sub:'Solidity + Polygon' },
      { icon:'📜', name:'Audit Ledger', sub:'Hyperledger Fabric' },
      { icon:'🗂️', name:'IPFS Docs', sub:'Policy PDFs' },
    ]
  },
  {
    id: 'L4', label: 'India Stack Layer', color: '#e3b341',
    nodes: [
      { icon:'📱', name:'Aadhaar e-KYC', sub:'Instant verification' },
      { icon:'📂', name:'DigiLocker', sub:'Policy storage' },
      { icon:'🌏', name:'ONDC / OCEN', sub:'Ecosystem play' },
      { icon:'📍', name:'ISRO Geotagging', sub:'Farm boundary' },
    ]
  },
  {
    id: 'L5', label: 'Delivery Layer (SBI YONO)', color: '#3fb950',
    nodes: [
      { icon:'📲', name:'YONO App', sub:'One-tap enroll' },
      { icon:'💳', name:'UPI Auto-Credit', sub:'DBT to farmer' },
      { icon:'💬', name:'SMS / USSD', sub:'2G fallback' },
      { icon:'🤖', name:'YONO AI Nudge', sub:'Risk alerts' },
    ]
  },
]

const FLOW = [
  { step:'01', title:'Satellite detects anomaly', desc:'NDVI drops below 0.30 in Barmer. NASA MODIS + ISRO Bhuvan confirm.', color:'#64ffda', icon:'🛰️' },
  { step:'02', title:'4 AI Agents convene', desc:'Risk Monitor flags it. Verifier cross-checks 4 sources. 94% consensus reached in 8 seconds.', color:'#82b1ff', icon:'🤖' },
  { step:'03', title:'Oracle feeds smart contract', desc:'Chainlink-style oracle pushes verified data on-chain. IIEPolicy.sol receives the event.', color:'#e040fb', icon:'📡' },
  { step:'04', title:'Smart contract auto-executes', desc:'Quorum >= 75% - contract executes. Immutable. Zero human intervention. Block #19823441.', color:'#e3b341', icon:'⛓️' },
  { step:'05', title:'SBI Core API credits UPI', desc:"Aadhaar-seeded DBT flow. \u20B948,200 hits farmer's SBI savings account. SMS sent.", color:'#3fb950', icon:'⚡' },
]

export default function ArchitecturePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="rounded-3xl p-8 text-center relative overflow-hidden grid-bg" style={{ background:'linear-gradient(135deg,#030712,#0a1628,#10001a)', border:'1px solid rgba(130,177,255,0.12)' }}>
        <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ background:'linear-gradient(135deg,#64ffda,#82b1ff,#e040fb)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          System Architecture
        </h1>
        <p className="text-white/50 text-sm max-w-2xl mx-auto mb-4">
          5-layer sovereign AI architecture. Satellite data to Agentic AI to Blockchain Oracle to India Stack to YONO payout. End-to-end in under 2 hours.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['5 Layers','4 AI Agents','4 Data Sources','Smart Contracts','India Stack'].map(t => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-semibold">{t}</span>
          ))}
        </div>
      </div>

      {/* Architecture layers */}
      <div>
        <h2 className="text-xl font-black text-[#e6edf3] mb-5">System Layers</h2>
        <div className="space-y-3">
          {LAYERS.map((layer, li) => (
            <div key={li} className="rounded-2xl p-5 border" style={{ borderColor:`${layer.color}25`, background:`linear-gradient(90deg, ${layer.color}06, #0d1117)` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background:`${layer.color}20`, color:layer.color }}>{layer.id}</div>
                <div>
                  <div className="font-black text-[#e6edf3]">{layer.label}</div>
                </div>
                {li < LAYERS.length - 1 && <div className="ml-auto text-[#21262d] text-xl">↓</div>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {layer.nodes.map((node, ni) => (
                  <div key={ni} className="bg-[#161b22] rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">{node.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-[#e6edf3]">{node.name}</div>
                      <div className="text-[10px] text-[#7d8590]">{node.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* End-to-end flow */}
      <div>
        <h2 className="text-xl font-black text-[#e6edf3] mb-5">End-to-End Payout Flow</h2>
        <div className="relative">
          {FLOW.map((f, i) => (
            <div key={i} className="flex gap-5 mb-6 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:`${f.color}15`, border:`2px solid ${f.color}40` }}>{f.icon}</div>
                {i < FLOW.length - 1 && <div className="w-0.5 flex-1 mt-2" style={{ background:`linear-gradient(${f.color}, ${FLOW[i+1].color})` }} />}
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ background:`${f.color}20`, color:f.color }}>STEP {f.step}</span>
                  <span className="font-black text-[#e6edf3]">{f.title}</span>
                </div>
                <p className="text-sm text-[#7d8590] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-black text-[#e6edf3] mb-4">Compliance &amp; Regulatory Alignment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title:'RBI Sandbox Ready', body:'Architecture aligned with RBI Regulatory Sandbox framework. Pilot in 5 districts before scale.', color:'#64ffda', icon:'🏦' },
            { title:'DPDP Act Compliant', body:'No PII stored on-chain. Aadhaar hash only. DPDP 2023 data minimisation principles applied.', color:'#82b1ff', icon:'🔒' },
            { title:'IRDAI Parametric Rules', body:'Triggers based on objective indices (NDVI, rainfall mm). Fully compliant with IRDAI parametric guidelines.', color:'#e040fb', icon:'📊' },
            { title:'RBI UPI Guidelines', body:'Payouts via IMPS/UPI within RBI transaction limits. SBI Core Banking API integration layer.', color:'#3fb950', icon:'💳' },
            { title:'PM-FASAL Integration', body:'Subsidy auto-applied at enrollment. Government reinsurance via PMFBY backend linkage.', color:'#e3b341', icon:'🌾' },
            { title:'Audit Trail (Immutable)', body:'Every trigger, vote, and payout recorded on Hyperledger Fabric. Accessible to IRDAI/RBI auditors.', color:'#f85149', icon:'📜' },
          ].map((c,i) => (
            <div key={i} className="bg-[#161b22] rounded-2xl p-5 border-l-4" style={{ borderLeftColor:c.color }}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-black text-sm mb-2" style={{ color:c.color }}>{c.title}</div>
              <p className="text-xs text-[#7d8590] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#7d8590] bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
          <span className="text-[#e3b341] font-bold">Disclaimer:</span> This is a proof-of-concept demonstration built for SBI GFF 2026. Blockchain interactions, NDVI data, and payout flows are simulated. Real deployment requires RBI sandbox approval, IRDAI product filing, and SBI Core Banking API integration.
        </div>
      </div>
    </div>
  )
}
