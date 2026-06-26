'use client'
import { useState } from 'react'

const KYC_STEPS = [
  { icon:'📱', title:'Open SBI YONO', desc:'Farmer opens YONO app. Taps "Get Crop Insurance". No branch visit.', color:'#64ffda', done:true },
  { icon:'🔑', title:'Aadhaar e-KYC', desc:'OTP-based Aadhaar verification. UIDAI API validates identity in <3 seconds.', color:'#82b1ff', done:true },
  { icon:'📂', title:'DigiLocker Fetch', desc:'Land records (Khasra/Bhu-Naksha) fetched from DigiLocker. Zero paperwork.', color:'#e040fb', done:true },
  { icon:'📍', title:'ISRO Geotagging', desc:'Farm boundary auto-tagged via Bhuvan API. No field visit required.', color:'#e3b341', done:true },
  { icon:'💳', title:'UPI Premium Debit', desc:'₹4,200 debited via UPI auto-pay. PM-FASAL subsidy (30%) auto-applied.', color:'#3fb950', done:true },
  { icon:'✅', title:'Policy Issued (On-Chain)', desc:'Smart contract deployed on Polygon. Policy PDF saved to IPFS + DigiLocker.', color:'#f85149', done:true },
]

export default function IndiaStackPage() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)
  const [policyId, setPolicyId] = useState('')

  const runDemo = async () => {
    setRunning(true)
    setStep(-1)
    setPolicyId('')
    for (let i = 0; i < KYC_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 900))
      setStep(i)
    }
    setPolicyId('IIE-0x' + Math.random().toString(16).slice(2,8).toUpperCase())
    setRunning(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="rounded-3xl p-8 relative overflow-hidden grid-bg" style={{ background:'linear-gradient(135deg,#030712,#0f1a00,#1a1000)', border:'1px solid rgba(227,179,65,0.15)' }}>
        <div className="text-xs font-bold tracking-[3px] text-[#e3b341] uppercase mb-3">🇮🇳 India Stack Integration</div>
        <h1 className="text-4xl font-black gradient-text mb-2">Powered by India Stack</h1>
        <p className="text-white/50 text-sm max-w-2xl">Aadhaar e-KYC + DigiLocker + ISRO Bhuvan + UPI — the same infrastructure India uses for ₹50Tr+ in payments, now powering instant crop insurance.</p>
      </div>

      {/* Stack cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon:'🔑', name:'Aadhaar e-KYC', org:'UIDAI', use:'Identity in 3 sec', color:'#82b1ff', stat:'1.4B enrolled' },
          { icon:'📂', name:'DigiLocker', org:'MeitY', use:'Land records', color:'#64ffda', stat:'250M+ users' },
          { icon:'📍', name:'Bhuvan (ISRO)', org:'ISRO', use:'Farm geotagging', color:'#e3b341', stat:'600+ districts' },
          { icon:'💳', name:'UPI / DBT', org:'NPCI', use:'Auto payout', color:'#3fb950', stat:'₹18Tr/month' },
        ].map((s,i) => (
          <div key={i} className="glass card-hover p-5">
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="font-black text-[#e6edf3] mb-0.5">{s.name}</div>
            <div className="text-[10px] text-[#7d8590] mb-2">{s.org} · {s.use}</div>
            <div className="text-xs font-bold" style={{ color:s.color }}>{s.stat}</div>
          </div>
        ))}
      </div>

      {/* Live enrollment demo */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-[#e6edf3]">Live Enrollment Demo</h2>
            <p className="text-xs text-[#7d8590] mt-1">Watch the full India Stack flow — tap to simulate</p>
          </div>
          <button onClick={runDemo} disabled={running}
            className="px-6 py-3 rounded-xl font-black text-sm text-[#030712] transition-all hover:scale-105 disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#64ffda,#82b1ff)' }}>
            {running ? '⏳ Running...' : '▶ Run Demo'}
          </button>
        </div>
        <div className="space-y-3">
          {KYC_STEPS.map((s,i) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-500 ${
              step >= i
                ? 'border-opacity-40 scale-[1.01]'
                : 'border-[#21262d] bg-[#161b22] opacity-40'
            }`} style={step >= i ? { borderColor:`${s.color}40`, background:`${s.color}08` } : {}}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                step >= i ? 'scale-110' : ''
              }`} style={step >= i ? { background:`${s.color}20`, border:`2px solid ${s.color}` } : { background:'#21262d' }}>
                {step >= i ? '✅' : s.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={step >= i ? { color:s.color } : { color:'#7d8590' }}>{s.title}</div>
                <div className="text-xs text-[#7d8590] mt-0.5">{s.desc}</div>
              </div>
              {step >= i && (
                <div className="text-[10px] font-bold text-[#3fb950] flex items-center gap-1">
                  <span className="pulse-dot" style={{ background:'#3fb950', width:6, height:6 }} />DONE
                </div>
              )}
            </div>
          ))}
        </div>
        {policyId && (
          <div className="mt-6 text-center py-8 rounded-2xl" style={{ background:'linear-gradient(135deg,rgba(63,185,80,0.08),rgba(100,255,218,0.05))', border:'1px solid rgba(63,185,80,0.2)' }}>
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-2xl font-black text-[#3fb950]">Policy Issued On-Chain!</div>
            <div className="font-mono text-[#64ffda] text-lg mt-2">{policyId}</div>
            <div className="text-xs text-[#7d8590] mt-2">Smart contract deployed · DigiLocker saved · SMS sent · Premium debited via UPI</div>
          </div>
        )}
      </div>

      {/* ONDC / OCEN */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-black text-[#e6edf3] mb-4">🌐 Future: ONDC + OCEN Ecosystem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161b22] rounded-xl p-4">
            <div className="font-black text-[#64ffda] mb-2">🛒 ONDC Integration</div>
            <p className="text-xs text-[#7d8590] leading-relaxed">List IIE crop insurance as a financial product on ONDC network. Any agri-platform (DeHaat, AgroStar, Farmart) can embed IIE and earn distribution fees. Massive channel partner play for SBI.</p>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4">
            <div className="font-black text-[#82b1ff] mb-2">💰 OCEN Credit Link</div>
            <p className="text-xs text-[#7d8590] leading-relaxed">IIE policy as collateral for OCEN-based Kisan Credit Card top-up. Insured farmer = lower default risk = better credit terms. Closes the full rural financial inclusion loop.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
