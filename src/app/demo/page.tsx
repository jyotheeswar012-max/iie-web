'use client'
import { useState } from 'react'

type Step = 'idle'|'enrolling'|'enrolled'|'verifying'|'triggered'|'executing'|'done'|'error'

// Auto-detects: uses /api/* routes (Vercel serverless) when deployed
const API = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? ''   // same-origin Vercel: /api/oracle/enroll etc.
  : 'http://localhost:8000'

export default function DemoPage() {
  const [step, setStep]     = useState<Step>('idle')
  const [policyId, setPid]  = useState('')
  const [enrollRes, setEnR] = useState<any>(null)
  const [oracleRes, setOrR] = useState<any>(null)
  const [execRes, setExR]   = useState<any>(null)
  const [auditRes, setAuR]  = useState<any>(null)
  const [error, setErr]     = useState('')
  const [eventType, setEv]  = useState('drought')
  const [form, setForm]     = useState({
    name:'Raju Patil', aadhaar_last4:'8821',
    district:'Barmer', state:'Rajasthan',
    crop:'cotton', acreage:8, plan:'Smart Shield'
  })

  const post = async (path: string, body: any) => {
    const r = await fetch(`${API}${path}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || data.detail || 'API error')
    return data
  }
  const get = async (path: string) => (await fetch(`${API}${path}`)).json()

  const runEnroll = async () => {
    try { setStep('enrolling'); setErr('')
      const res = await post('/api/oracle/enroll', form)
      setEnR(res); setPid(res.policy_id); setStep('enrolled')
    } catch(e:any) { setErr(e.message); setStep('error') }
  }

  const runVerify = async () => {
    try { setStep('verifying')
      const res = await post('/api/oracle/verify', {policy_id:policyId, event_type:eventType})
      setOrR(res)
      if (res.agent_quorum?.quorum_met) setStep('triggered')
      else { setStep('enrolled'); setErr('Quorum not met — try switching event type or use Barmer+drought (high risk district)') }
    } catch(e:any) { setErr(e.message); setStep('error') }
  }

  const runExecute = async () => {
    try { setStep('executing')
      const res = await post('/api/contract/execute', {policy_id:policyId})
      setExR(res)
      const audit = await get('/api/audit/trail')
      setAuR(audit); setStep('done')
    } catch(e:any) { setErr(e.message); setStep('error') }
  }

  const reset = () => { setStep('idle'); setPid(''); setEnR(null); setOrR(null); setExR(null); setAuR(null); setErr('') }

  const STEPS_UI = [
    { label:'1. YONO Enroll',      color:'#64ffda', done:!!enrollRes },
    { label:'2. Oracle + Quorum',  color:'#82b1ff', done:!!oracleRes && oracleRes.agent_quorum?.quorum_met },
    { label:'3. Contract + UPI',   color:'#3fb950', done:!!execRes },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* Header */}
      <div className="rounded-3xl p-7 grid-bg" style={{background:'linear-gradient(135deg,#030712,#0a1628,#0d1f12)',border:'1px solid rgba(100,255,218,0.12)'}}>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-2">⚡ LIVE END-TO-END DEMO — Real API Calls</div>
        <h1 className="text-3xl font-black gradient-text mb-2">YONO-Oracle Full Cycle</h1>
        <p className="text-white/50 text-sm">Enroll → Oracle verify → Smart contract executes → UPI payout → Audit chain. All real backend calls.</p>
        <div className="mt-3 text-xs font-mono text-[#7d8590] bg-[#161b22] rounded-xl px-4 py-2 border border-[#21262d]">
          Backend: <span className="text-[#64ffda]">{API || window?.location?.origin}/api/*</span> — Vercel Python serverless
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {STEPS_UI.map((s,i) => (
          <div key={i} className={`flex-1 rounded-xl p-3 border text-center transition-all duration-500 ${
            s.done ? 'scale-[1.02]' : 'opacity-40 border-[#21262d]'
          }`} style={s.done ? {borderColor:`${s.color}40`,background:`${s.color}08`} : {}}>
            <div className="text-base mb-1">{s.done?'✅':'⏳'}</div>
            <div className="text-[10px] font-bold" style={s.done?{color:s.color}:{color:'#7d8590'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-4 text-sm text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* STEP 1: Enroll form */}
      {step==='idle' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-black text-[#e6edf3]">Step 1 — Enroll via YONO (Aadhaar e-KYC)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['name','district','state','crop'] .map(k=>(
              <div key={k}>
                <label className="text-[11px] text-[#7d8590] uppercase tracking-wider block mb-1">{k}</label>
                <input value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#64ffda]/40" />
              </div>
            ))}
            <div>
              <label className="text-[11px] text-[#7d8590] uppercase tracking-wider block mb-1">Aadhaar Last 4</label>
              <input maxLength={4} value={form.aadhaar_last4} onChange={e=>setForm({...form,aadhaar_last4:e.target.value})}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#64ffda]/40" />
            </div>
            <div>
              <label className="text-[11px] text-[#7d8590] uppercase tracking-wider block mb-1">Acreage</label>
              <input type="number" value={form.acreage} onChange={e=>setForm({...form,acreage:parseFloat(e.target.value)||1})}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#64ffda]/40" />
            </div>
            <div>
              <label className="text-[11px] text-[#7d8590] uppercase tracking-wider block mb-1">Plan</label>
              <select value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3]">
                {['Basic Protect','Smart Shield','Full Season Pro'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button onClick={runEnroll}
            className="w-full py-3.5 rounded-xl font-black text-sm text-[#030712] transition hover:scale-[1.01]"
            style={{background:'linear-gradient(135deg,#64ffda,#82b1ff)'}}>
            🔑 Enroll via Aadhaar e-KYC + Deploy Smart Contract
          </button>
        </div>
      )}

      {step==='enrolling' && (
        <div className="glass p-10 text-center">
          <div className="text-5xl mb-4 animate-pulse">🔑</div>
          <div className="text-[#64ffda] font-bold">Verifying Aadhaar → DigiLocker fetch → Deploying smart contract on Polygon...</div>
        </div>
      )}

      {/* Enroll result */}
      {enrollRes && (
        <div className="bg-[#0d1117] border border-[#64ffda]/20 rounded-2xl p-5 space-y-3">
          <div className="text-[#3fb950] font-black">✅ Policy Issued — Smart Contract Deployed</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              ['Policy ID',      enrollRes.policy_id,                              '#64ffda'],
              ['Contract Addr',  (enrollRes.contract_address||'').slice(0,18)+'...','#82b1ff'],
              ['Aadhaar Hash',   enrollRes.aadhaar_hash,                            '#e040fb'],
              ['Net Premium',    `\u20b9${enrollRes.net_premium_inr?.toLocaleString()}`,'#e3b341'],
              ['PM-FASAL Sub',   `\u20b9${enrollRes.subsidy_applied}`,               '#3fb950'],
              ['Coverage',       `\u20b9${enrollRes.coverage_inr?.toLocaleString()}`, '#f85149'],
            ] as [string,string,string][]).map(([l,v,c])=>(
              <div key={l} className="bg-[#161b22] rounded-xl p-3">
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">{l}</div>
                <div className="text-[11px] font-bold font-mono break-all" style={{color:c}}>{v}</div>
              </div>
            ))}
          </div>

          {step==='enrolled' && (
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#7d8590]">Event Type:</span>
                <select value={eventType} onChange={e=>setEv(e.target.value)}
                  className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3]">
                  {['drought','flood','heatwave','cyclone'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={runVerify}
                className="w-full py-3.5 rounded-xl font-black text-sm text-[#030712] transition hover:scale-[1.01]"
                style={{background:'linear-gradient(135deg,#82b1ff,#e040fb)'}}>
                📡 Step 2 — Run Oracle + 4-Agent Quorum
              </button>
            </div>
          )}
        </div>
      )}

      {step==='verifying' && <div className="glass p-10 text-center text-[#82b1ff] font-bold animate-pulse">📡 Querying NASA MODIS • IMD • ISRO Bhuvan • ICAR — running 4 AI agents...</div>}

      {/* Oracle result */}
      {oracleRes && (
        <div className="bg-[#0d1117] border border-[#82b1ff]/20 rounded-2xl p-5 space-y-4">
          <div className="font-black text-[#e6edf3]">
            {oracleRes.agent_quorum?.quorum_met ? '✅ QUORUM MET — Payout Triggered' : '⚠️ Quorum NOT Met'}
            <span className="ml-2 text-sm text-[#7d8590]">({oracleRes.agent_quorum?.confidence_pct}% / 75% required)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {oracleRes.agent_quorum?.votes && Object.entries(oracleRes.agent_quorum.votes).map(([ag,v]:any)=>(
              <div key={ag} className={`rounded-xl p-3 border text-center ${
                v.decision.includes('✅') ? 'border-green-800/50 bg-green-950/20' : 'border-red-800/50 bg-red-950/20'
              }`}>
                <div className="text-base mb-1">{v.decision.includes('✅')?'✅':'❌'}</div>
                <div className="text-[10px] font-bold text-[#e6edf3]">{ag.replace('Agent','A')}</div>
                <div className="text-[9px] text-[#7d8590] mt-1">{v.reason}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#21262d] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{width:`${oracleRes.agent_quorum?.confidence_pct}%`,background:'linear-gradient(90deg,#82b1ff,#3fb950)'}} />
            </div>
            <span className="font-black text-[#3fb950]">{oracleRes.agent_quorum?.confidence_pct}%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {oracleRes.oracle_data && [
              ['NDVI', oracleRes.oracle_data.nasa_modis_ndvi, '#64ffda'],
              ['Rainfall', `${oracleRes.oracle_data.imd_rainfall_mm}mm`, '#82b1ff'],
              ['Temp', `${oracleRes.oracle_data.isro_temp_c}\u00b0C`, '#f85149'],
              ['Soil', `${oracleRes.oracle_data.icar_soil_moisture}%`, '#e3b341'],
            ].map(([l,v,c]:any)=>(
              <div key={l} className="bg-[#161b22] rounded-xl p-2 text-center">
                <div className="text-[9px] text-[#7d8590] uppercase">{l}</div>
                <div className="font-bold font-mono" style={{color:c}}>{v}</div>
              </div>
            ))}
          </div>

          {step==='triggered' && (
            <button onClick={runExecute}
              className="w-full py-3.5 rounded-xl font-black text-sm text-[#030712] transition hover:scale-[1.01]"
              style={{background:'linear-gradient(135deg,#3fb950,#64ffda)'}}>
              ⚡ Step 3 — Execute Smart Contract + UPI Credit
            </button>
          )}
        </div>
      )}

      {step==='executing' && <div className="glass p-10 text-center text-[#3fb950] font-bold animate-pulse">⛓️ Contract executing on Polygon → IMPS initiating → SMS dispatching...</div>}

      {/* Execution result */}
      {execRes && (
        <div className="bg-[#0d1117] border border-[#3fb950]/30 rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-3xl font-black text-[#3fb950]">₹{execRes.payout_inr?.toLocaleString()}</div>
            <div className="text-sm text-[#7d8590] mt-1">Credited to {execRes.credited_to} via IMPS</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['TX Hash',      (execRes.tx_hash||'').slice(0,20)+'...','#64ffda'],
              ['Block #',      execRes.block_number,                   '#82b1ff'],
              ['UPI Ref',      execRes.upi_ref,                        '#3fb950'],
              ['Audit Entries',execRes.audit_seq,                      '#e3b341'],
            ] as [string,any,string][]).map(([l,v,c])=>(
              <div key={l} className="bg-[#161b22] rounded-xl p-3">
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">{l}</div>
                <div className="text-xs font-bold font-mono" style={{color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#161b22] rounded-xl p-3">
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">SMS Sent to Farmer</div>
            <div className="text-xs text-[#e6edf3] leading-relaxed">{execRes.sms_sent}</div>
          </div>
        </div>
      )}

      {/* Audit chain */}
      {auditRes && (
        <div className="bg-[#0d1117] border border-[#e3b341]/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-[#e6edf3]">📜 Hyperledger Fabric Audit Chain</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
              auditRes.chain_valid ? 'bg-green-950/50 border-green-800 text-green-400' : 'bg-red-950/50 border-red-800 text-red-400'
            }`}>{auditRes.chain_valid ? '✅ CHAIN VALID' : '❌ TAMPERED'}</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {auditRes.ledger?.slice().reverse().map((e:any,i:number)=>(
              <div key={i} className="bg-[#161b22] rounded-xl p-3 font-mono">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-[#64ffda] font-bold">#{e.seq} · {e.event}</span>
                  <span className="text-[10px] text-[#7d8590]">{e.ts?.slice(11,19)} UTC</span>
                </div>
                <div className="text-[10px] text-[#7d8590] break-all">hash: {e.hash?.slice(0,32)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step==='done' && (
        <button onClick={reset} className="w-full py-3 rounded-xl border border-[#21262d] text-[#7d8590] text-sm font-bold hover:bg-white/5 transition">
          🔁 Run Another Demo
        </button>
      )}
    </div>
  )
}
