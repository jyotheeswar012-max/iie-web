'use client'
import { useState, useEffect } from 'react'

const CONTRACTS = [
  { id:'IIE-0xA3f7', farmer:'Raju Patil',    district:'Barmer, RJ',   crop:'Cotton',  trigger:'Drought',  ndvi:'0.21', confidence:94, status:'EXECUTED', hash:'0xa3f7...d291', block:19823441, ts:'14:32:18', amount:'\u20B948,200' },
  { id:'IIE-0xB8c2', farmer:'Anita Devi',    district:'Puri, OD',     crop:'Paddy',   trigger:'Flood',    ndvi:'N/A',  confidence:97, status:'EXECUTED', hash:'0xb8c2...f104', block:19823398, ts:'14:18:44', amount:'\u20B932,800' },
  { id:'IIE-0xC1d9', farmer:'Vijay Singh',   district:'Ludhiana, PB', crop:'Wheat',   trigger:'Drought',  ndvi:'0.24', confidence:91, status:'EXECUTED', hash:'0xc1d9...a882', block:19823301, ts:'13:55:02', amount:'\u20B962,500' },
  { id:'IIE-0xD4e5', farmer:'Meena Kumari',  district:'Nashik, MH',   crop:'Soybean', trigger:'Heatwave', ndvi:'0.31', confidence:88, status:'PENDING',  hash:'0xd4e5...pending', block:null, ts:'14:41:00', amount:'\u20B928,400' },
  { id:'IIE-0xE2f1', farmer:'Suresh Rao',    district:'Khammam, TG',  crop:'Paddy',   trigger:'Flood',    ndvi:'N/A',  confidence:82, status:'VERIFYING',hash:'0xe2f1...verify',  block:null, ts:'14:38:00', amount:'\u20B941,100' },
]

const ORACLE_SOURCES = [
  { name:'NASA MODIS', type:'NDVI/Vegetation', status:'LIVE', lat:222, icon:'🛰️' },
  { name:'IMD Rainfall', type:'Precipitation', status:'LIVE', lat:89, icon:'🌧️' },
  { name:'ISRO Bhuvan', type:'Geo + Soil', status:'LIVE', lat:134, icon:'🌍' },
  { name:'ICAR Sensors', type:'Soil Moisture', status:'LIVE', lat:45, icon:'🌱' },
]

const SOLIDITY_SNIPPET = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title IIE Parametric Insurance Contract
/// @notice Auto-executes payout when oracle quorum >= 75%
contract IIEPolicy {
    struct Policy {
        address farmer;    // Aadhaar-seeded wallet
        uint256 premium;   // in wei (INR mapped)
        uint256 coverage;  // max payout
        uint8   quorum;    // required: 75
        bool    active;
    }

    mapping(bytes32 => Policy) public policies;
    mapping(bytes32 => uint8)  public agentVotes;

    event PolicyIssued(bytes32 indexed policyId, address farmer);
    event PayoutExecuted(bytes32 indexed policyId, uint256 amount);

    function submitVote(bytes32 policyId, bool triggered) external onlyAgent {
        if (triggered) agentVotes[policyId] += 25;
        if (agentVotes[policyId] >= 75) {
            _executePayout(policyId);
        }
    }

    function _executePayout(bytes32 policyId) internal {
        Policy storage p = policies[policyId];
        require(p.active, "Policy inactive");
        p.active = false;
        emit PayoutExecuted(policyId, p.coverage);
    }
}`

function highlightSolidity(code: string): string {
  return code
    .replace(/\/\/[^\n]*/g, s => `<span style="color:#6e7681">${s}</span>`)
    .replace(/\b(pragma|contract|struct|mapping|event|function|emit|require|internal|external|bool|uint256|uint8|address|bytes32|public|true|false|if)\b/g, s => `<span style="color:#ff7b72">${s}</span>`)
    .replace(/"[^"]*"/g, s => `<span style="color:#a5d6ff">${s}</span>`)
}

export default function BlockchainPage() {
  const [selected, setSelected] = useState(0)
  const [lats, setLats] = useState(ORACLE_SOURCES.map(o => o.lat))
  const [blockHeight, setBlockHeight] = useState(19823441)
  const [tab, setTab] = useState<'contracts'|'oracle'|'solidity'>('contracts')

  useEffect(() => {
    const t1 = setInterval(() => setBlockHeight(h => h + 1), 3000)
    const t2 = setInterval(() => setLats(prev => prev.map(l => Math.max(20, l + Math.floor(Math.random()*20)-10))), 1200)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const c = CONTRACTS[selected]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="rounded-3xl p-8 relative overflow-hidden grid-bg" style={{ background:'linear-gradient(135deg,#030712,#0a0f1e,#0d1f12)', border:'1px solid rgba(100,255,218,0.12)' }}>
        <div className="absolute top-6 right-8 text-6xl opacity-10 select-none">⛓️</div>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-3">Hybrid Blockchain - Polygon + Hyperledger Fabric</div>
        <h1 className="text-4xl font-black gradient-text mb-2">YONO-Oracle Smart Contracts</h1>
        <p className="text-white/50 text-sm max-w-2xl">Every policy is a smart contract. Every payout is immutable. Zero disputes. Zero fraud. Verifiable by any judge, auditor, or regulator on-chain.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-[#64ffda]/10 border border-[#64ffda]/20 text-[#64ffda] font-bold">
            <span className="pulse-dot" /> Block #{blockHeight.toLocaleString()}
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/20 text-[#3fb950] font-bold">✅ {CONTRACTS.filter(c=>c.status==='EXECUTED').length} Contracts Executed</div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-[#e3b341]/10 border border-[#e3b341]/20 text-[#e3b341] font-bold">⏳ {CONTRACTS.filter(c=>c.status!=='EXECUTED').length} In Progress</div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-[#82b1ff]/10 border border-[#82b1ff]/20 text-[#82b1ff] font-bold">📡 4 Oracle Feeds Live</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['contracts','oracle','solidity'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab===t ? 'bg-[#64ffda] text-[#030712]' : 'bg-[#161b22] border border-[#21262d] text-[#7d8590] hover:text-[#e6edf3]'
            }`}>{t==='contracts'?'Smart Contracts':t==='oracle'?'Oracle Network':'Solidity Code'}</button>
        ))}
      </div>

      {tab==='contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {CONTRACTS.map((c,i) => (
              <div key={i} onClick={() => setSelected(i)}
                className={`rounded-xl p-4 cursor-pointer border transition-all ${
                  selected===i ? 'border-[#64ffda]/50 bg-[#64ffda]/5' : 'border-[#21262d] bg-[#161b22] hover:border-[#484f58]'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#64ffda]">{c.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status==='EXECUTED' ? 'bg-green-950/50 border border-green-800 text-green-400' :
                    c.status==='PENDING'  ? 'bg-yellow-950/50 border border-yellow-800 text-yellow-400' :
                    'bg-blue-950/50 border border-blue-800 text-blue-400'
                  }`}>{c.status}</span>
                </div>
                <div className="font-bold text-[#e6edf3] text-sm">{c.farmer}</div>
                <div className="text-[11px] text-[#7d8590]">{c.district} · {c.crop} · {c.trigger}</div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-3">
            <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[#64ffda] text-sm mb-1">{c.id}</div>
                  <div className="text-xl font-black text-[#e6edf3]">{c.farmer}</div>
                  <div className="text-sm text-[#7d8590]">{c.district} · {c.crop}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#3fb950]">{c.amount}</div>
                  <div className="text-xs text-[#7d8590]">Payout Amount</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Trigger Type', c.trigger, '#f85149'],
                  ['NDVI Score', c.ndvi, '#64ffda'],
                  ['AI Confidence', `${c.confidence}%`, '#3fb950'],
                  ['Block #', c.block ? c.block.toLocaleString() : 'Pending...', '#82b1ff'],
                  ['Timestamp', c.ts, '#e3b341'],
                  ['Status', c.status, c.status==='EXECUTED'?'#3fb950':'#e3b341'],
                ].map(([l,v,col]) => (
                  <div key={l} className="bg-[#161b22] rounded-xl p-3">
                    <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">{l}</div>
                    <div className="font-bold text-sm" style={{color:col as string}}>{v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-2">Transaction Hash</div>
                <div className="font-mono text-xs text-[#64ffda] bg-[#161b22] rounded-xl px-4 py-3 break-all">{c.hash}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-3">Agent Quorum Votes</div>
                <div className="grid grid-cols-4 gap-2">
                  {['Risk Monitor','Verifier','Policy Match','Executor'].map((a,i) => (
                    <div key={a} className="text-center">
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg mb-1 ${
                        c.status==='EXECUTED' || i < (c.confidence > 90 ? 4 : c.confidence > 85 ? 3 : 2)
                          ? 'bg-green-950/50 border-2 border-green-600'
                          : 'bg-[#21262d] border-2 border-[#30363d]'
                      }`}>
                        {c.status==='EXECUTED' || i < (c.confidence > 90 ? 4 : 3) ? '✅' : '⏳'}
                      </div>
                      <div className="text-[9px] text-[#7d8590] leading-tight">{a}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#7d8590]">Quorum Progress</span>
                    <span className="font-bold text-[#3fb950]">{c.confidence}% / 75% required</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${c.confidence}%`, background:'linear-gradient(90deg,#3fb950,#64ffda)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==='oracle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ORACLE_SOURCES.map((o,i) => (
              <div key={i} className="glass card-hover p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{o.icon}</span>
                  <span className="badge-live"><span className="pulse-dot" />LIVE</span>
                </div>
                <div className="font-black text-[#e6edf3] mb-1">{o.name}</div>
                <div className="text-xs text-[#7d8590] mb-3">{o.type}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#64ffda] rounded-full transition-all duration-500" style={{ width:`${Math.min(100,(lats[i]/300)*100+30)}%` }} />
                  </div>
                  <span className="font-mono text-xs text-[#64ffda]">{lats[i]}ms</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-6">
            <h3 className="font-black text-[#e6edf3] mb-4">Oracle Data Flow</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {['NASA MODIS','IMD Rainfall','ISRO Bhuvan','ICAR Soil'].map((s,i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#21262d] text-xs font-bold text-[#64ffda]">{s}</div>
                  {i < 3 && <span className="text-[#7d8590]">→</span>}
                </div>
              ))}
              <span className="text-[#7d8590]">→</span>
              <div className="px-3 py-2 rounded-xl bg-[#64ffda]/10 border border-[#64ffda]/30 text-xs font-bold text-[#64ffda]">Oracle Aggregator</div>
              <span className="text-[#7d8590]">→</span>
              <div className="px-3 py-2 rounded-xl bg-[#e040fb]/10 border border-[#e040fb]/30 text-xs font-bold text-[#e040fb]">Smart Contract</div>
              <span className="text-[#7d8590]">→</span>
              <div className="px-3 py-2 rounded-xl bg-[#3fb950]/10 border border-[#3fb950]/30 text-xs font-bold text-[#3fb950]">UPI Payout</div>
            </div>
            <div className="mt-4 text-xs text-[#7d8590] bg-[#161b22] rounded-xl p-4 font-mono leading-relaxed">
              <div className="text-[#3fb950] mb-2"># Chainlink-style oracle feed (mocked with live IMD/ISRO data)</div>
              <div><span className="text-[#82b1ff]">oracle.getLatestRound</span>(<span className="text-[#e3b341]">&quot;NDVI_BARMER&quot;</span>) → <span className="text-[#f85149]">0.21</span> threshold=0.30</div>
              <div><span className="text-[#82b1ff]">oracle.getLatestRound</span>(<span className="text-[#e3b341]">&quot;RAIN_PURI&quot;</span>) → <span className="text-[#f85149]">218mm</span> threshold=200mm</div>
              <div><span className="text-[#82b1ff]">oracle.getLatestRound</span>(<span className="text-[#e3b341]">&quot;TEMP_LATUR&quot;</span>) → <span className="text-[#f85149]">46.2°C</span> threshold=45°C</div>
              <div className="mt-2 text-[#64ffda]">→ quorum: 3/4 sources triggered → smart contract._executePayout() → UPI</div>
            </div>
          </div>
        </div>
      )}

      {tab==='solidity' && (
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262d] bg-[#161b22]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f85149]" />
                <div className="w-3 h-3 rounded-full bg-[#e3b341]" />
                <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
                <span className="ml-2 text-xs text-[#7d8590] font-mono">IIEPolicy.sol</span>
              </div>
              <span className="text-xs text-[#64ffda] font-bold">Polygon Mumbai Testnet</span>
            </div>
            <pre className="p-5 text-xs font-mono text-[#e6edf3] leading-relaxed overflow-x-auto" style={{ background:'#0d1117' }}>
              <code dangerouslySetInnerHTML={{ __html: highlightSolidity(SOLIDITY_SNIPPET) }} />
            </pre>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title:'Polygon Mumbai', desc:'Low-cost, EVM-compatible. Ideal for high-frequency micro-transactions like crop payouts.', color:'#82b1ff' },
              { title:'Hyperledger Fabric', desc:'Private permissioned chain for SBI internal audit trail. Regulators can query directly.', color:'#64ffda' },
              { title:'IPFS Policy Docs', desc:'Each policy PDF stored on IPFS. Immutable, decentralized, always accessible by farmer.', color:'#e040fb' },
            ].map((c,i) => (
              <div key={i} className="glass p-5">
                <div className="font-black mb-2" style={{ color:c.color }}>{c.title}</div>
                <p className="text-xs text-[#7d8590] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
