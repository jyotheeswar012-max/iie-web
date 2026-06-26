'use client'
import { useState } from 'react'

type Step = 'idle' | 'enrolling' | 'enrolled' | 'verifying' | 'triggered' | 'executing' | 'done' | 'error'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DemoPage() {
  const [step, setStep]       = useState<Step>('idle')
  const [policyId, setPid]    = useState('')
  const [enrollRes, setEnR]   = useState<any>(null)
  const [oracleRes, setOrR]   = useState<any>(null)
  const [execRes, setExR]     = useState<any>(null)
  const [auditRes, setAuR]    = useState<any>(null)
  const [error, setErr]       = useState('')
  const [eventType, setEvent] = useState('drought')
  const [form, setForm]       = useState({ name:'Raju Patil', aadhaar_last4:'8821', district:'Barmer', state:'Rajasthan', crop:'cotton', acreage:8, plan:'Smart Shield' })

  const post = async (url: string, body: any) => {
    const r = await fetch(`${API}${url}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'API error') }
    return r.json()
  }
  const get = async (url: string) => {
    const r = await fetch(`${API}${url}`)
    return r.json()
  }

  const runEnroll = async () => {
    try {
      setStep('enrolling'); setErr('')
      const res = await post('/oracle/enroll', form)
      setEnR(res); setPid(res.policy_id); setStep('enrolled')
    } catch(e: any) { setErr(e.message); setStep('error') }
  }

  const runVerify = async () => {
    try {
      setStep('verifying')
      const res = await post('/oracle/verify', { policy_id: policyId, event_type: eventType })
      setOrR(res)
      setStep(res.agent_quorum?.quorum_met ? 'triggered' : 'enrolled')
      if (!res.agent_quorum?.quorum_met) setErr('Quorum not met — try a different event type or district with higher risk')
    } catch(e: any) { setErr(e.message); setStep('error') }
  }

  const runExecute = async () => {
    try {
      setStep('executing')
      const res = await post('/contract/execute', { policy_id: policyId })
      setExR(res)
      const audit = await get('/audit/trail')
      setAuR(audit)
      setStep('done')
    } catch(e: any) { setErr(e.message); setStep('error') }
  }

  const reset = () => { setStep('idle'); setPid(''); setEnR(null); setOrR(null); setExR(null); setAuR(null); setErr('') }

  const STEPS_UI = [
    { id:'enrolled',  label:'1. Enroll via YONO',      color:'#64ffda', done: !!enrollRes },
    { id:'triggered', label:'2. Oracle + AI Quorum',   color:'#82b1ff', done: !!oracleRes },
    { id:'done',      label:'3. Smart Contract + UPI', color:'#3fb950', done: !!execRes   },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="rounded-3xl p-8 grid-bg relative overflow-hidden" style={{ background:'linear-gradient(135deg,#030712,#0a1628,#0d1f12)', border:'1px solid rgba(100,255,218,0.12)' }}>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-2">⚡ Live End-to-End Demo</div>
        <h1 className="text-4xl font-black gradient-text mb-2">YONO-Oracle Full Cycle</h1>
        <p className="text-white/50 text-sm">Real API calls — enroll → oracle verify → smart contract → UPI payout → audit trail. Hits actual FastAPI backend.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-3">
        {STEPS_UI.map((s,i) => (
          <div key={i} className={`flex-1 rounded-xl p-3 text-center border transition-all ${
            s.done ? 'border-opacity-40' : 'border-[#21262d] opacity-40'
          }`} style={s.done ? { borderColor:`${s.color}40`, background:`${s.color}08` } : {}}>
            <div className="text-lg mb-1">{s.done ? '✅' : '⏳'}</div>
            <div className="text-[11px] font-bold" style={s.done ? { color:s.color } : { color:'#7d8590' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800 rounded-xl p-4 text-sm text-red-300">
          ❌ {error} {error.includes('localhost') && <span className="text-[#e3b341]"> — Start the FastAPI backend: <code className="font-mono">cd api && uvicorn main:app --reload</code></span>}
        </div>
      )}

      {/* Step 1: Enroll */}
      {step === 'idle' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-black text-[#e6edf3]">📱 Step 1 — Enroll via YONO (Aadhaar e-KYC)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(['name','district','state','crop','aadhaar_last4','plan'] as const).map(k => (
              <div key={k}>
                <label className="text-[11px] text-[#7d8590] uppercase tracking-wider block mb-1">{k.replace('_',' ')}</label>
                {k === 'plan' ? (
                  <select value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})}
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3]">
                    {['Basic Protect','Smart Shield','Full Season Pro'].map(p => <option key={p}>{p}</option>)}
                  </select>
                ) : (
                  <input value={String(form[k])} onChange={e => setForm({...form,[k]:e.target.value as any})}
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3]" />
                )}
              </div>
            ))}
            <div>
              <label className="text-[11px] text-[#7d8590] uppercase tracking-wider block mb-1">Acreage</label>
              <input type="number" value={form.acreage} onChange={e => setForm({...form,acreage:parseFloat(e.target.value)})}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-[#e6edf3]" />
            </div>
          </div>
          <button onClick={runEnroll} className="w-full py-3 rounded-xl font-black text-sm text-[#030712] hover:scale-[1.01] transition" style={{ background:'linear-gradient(135deg,#64ffda,#82b1ff)' }}>
            🔑 Enroll via Aadhaar e-KYC + Deploy Smart Contract
          </button>
        </div>
      )}

      {step === 'enrolling' && (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3 animate-float">⏳</div>
          <div className="text-[#64ffda] font-bold">Verifying Aadhaar → Fetching DigiLocker → Deploying Contract...</div>
        </div>
      )}

      {enrollRes && (
        <div className="bg-[#0d1117] border border-[#64ffda]/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#3fb950] text-lg">✅</span>
            <span className="font-black text-[#e6edf3]">Policy Issued + Smart Contract Deployed</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ['Policy ID', enrollRes.policy_id, '#64ffda'],
              ['Contract', enrollRes.contract_address?.slice(0,18)+'...', '#82b1ff'],
              ['Aadhaar Hash', enrollRes.aadhaar_hash, '#e040fb'],
              ['Net Premium', `\u20b9${enrollRes.net_premium_inr?.toLocaleString()}`, '#e3b341'],
              ['Subsidy', `\u20b9${enrollRes.subsidy_applied} (PM-FASAL)`, '#3fb950'],
              ['Coverage', `\u20b9${enrollRes.coverage_inr?.toLocaleString()}`, '#f85149'],
            ].map(([l,v,c]) => (
              <div key={l as string} className="bg-[#161b22] rounded-xl p-3">
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">{l}</div>
                <div className="text-xs font-bold font-mono" style={{color: c as string}}>{v}</div>
              </div>
            ))}
          </div>
          {step === 'enrolled' && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#7d8590]">Event Type:</label>
                <select value={eventType} onChange={e => setEvent(e.target.value)}
                  className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3]">
                  {['drought','flood','heatwave','cyclone'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={runVerify} className="w-full py-3 rounded-xl font-black text-sm text-[#030712] hover:scale-[1.01] transition" style={{ background:'linear-gradient(135deg,#82b1ff,#e040fb)' }}>
                📡 Step 2 — Run Oracle + 4-Agent Quorum Verification
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'verifying' && <div className="glass p-8 text-center text-[#82b1ff] font-bold animate-pulse">Running 4 AI agents across NASA / IMD / ISRO / ICAR oracle feeds...</div>}

      {oracleRes && (
        <div className="bg-[#0d1117] border border-[#82b1ff]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{oracleRes.agent_quorum?.quorum_met ? '✅' : '⚠️'}</span>
            <span className="font-black text-[#e6edf3]">Oracle Results — {oracleRes.agent_quorum?.quorum_met ? 'QUORUM MET — Payout Triggered' : 'Quorum NOT met'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {oracleRes.agent_quorum?.votes && Object.entries(oracleRes.agent_quorum.votes).map(([agent, v]: any) => (
              <div key={agent} className={`rounded-xl p-3 border ${ v.decision.includes('✅') ? 'border-green-800 bg-green-950/30' : 'border-red-800 bg-red-950/30' }`}>
                <div className="text-[10px] text-[#7d8590] mb-1">{agent.replace('Agent','A')}</div>
                <div className="text-xs font-bold">{v.decision}</div>
                <div className="text-[10px] text-[#7d8590] mt-1">{v.reason}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#21262d] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width:`${oracleRes.agent_quorum?.confidence_pct}%`, background:'linear-gradient(90deg,#82b1ff,#3fb950)' }} />
            </div>
            <span className="font-black text-sm text-[#3fb950]">{oracleRes.agent_quorum?.confidence_pct}%</span>
            <span className="text-xs text-[#7d8590]">/ 75% required</span>
          </div>
          {step === 'triggered' && (
            <button onClick={runExecute} className="w-full py-3 rounded-xl font-black text-sm text-[#030712] hover:scale-[1.01] transition" style={{ background:'linear-gradient(135deg,#3fb950,#64ffda)' }}>
              ⚡ Step 3 — Execute Smart Contract + UPI Credit
            </button>
          )}
        </div>
      )}

      {step === 'executing' && <div className="glass p-8 text-center text-[#3fb950] font-bold animate-pulse">Contract executing on-chain → IMPS credit initiating → SMS sending...</div>}

      {execRes && (
        <div className="bg-[#0d1117] border border-[#3fb950]/30 rounded-2xl p-5 space-y-3">
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-3xl font-black text-[#3fb950]">₹{execRes.payout_inr?.toLocaleString()}</div>
            <div className="text-sm text-[#7d8590] mt-1">Credited to {execRes.credited_to} via IMPS</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['TX Hash', execRes.tx_hash?.slice(0,20)+'...', '#64ffda'],
              ['Block #', execRes.block_number, '#82b1ff'],
              ['UPI Ref', execRes.upi_ref, '#3fb950'],
              ['Audit Entries', execRes.audit_seq, '#e3b341'],
            ].map(([l,v,c]) => (
              <div key={l as string} className="bg-[#161b22] rounded-xl p-3">
                <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">{l}</div>
                <div className="text-xs font-bold font-mono" style={{color:c as string}}>{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#161b22] rounded-xl p-3">
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-1">SMS Sent</div>
            <div className="text-xs text-[#e6edf3]">{execRes.sms_sent}</div>
          </div>
        </div>
      )}

      {auditRes && (
        <div className="bg-[#0d1117] border border-[#e3b341]/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-[#e6edf3]">📜 Audit Trail (Hyperledger Fabric sim)</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${ auditRes.chain_valid ? 'bg-green-950/50 text-green-400 border border-green-800' : 'bg-red-950/50 text-red-400' }`}>
              {auditRes.chain_valid ? '✅ Chain Valid' : '❌ Tampered'}
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditRes.ledger?.slice().reverse().map((entry: any, i: number) => (
              <div key={i} className="bg-[#161b22] rounded-xl p-3 font-mono">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#64ffda] font-bold"># {entry.seq} · {entry.event}</span>
                  <span className="text-[10px] text-[#7d8590]">{entry.ts?.slice(11,19)}</span>
                </div>
                <div className="text-[10px] text-[#7d8590] break-all">hash: {entry.hash?.slice(0,32)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'done' && (
        <button onClick={reset} className="w-full py-3 rounded-xl border border-[#21262d] text-[#7d8590] text-sm hover:bg-white/5 transition">
          🔁 Run Another Demo
        </button>
      )}
    </div>
  )
}
