'use client'
import { useState } from 'react'

const PLANS = [
  { icon:'🌱', name:'Basic Protect',   premium:'₹2,800', coverage:'₹42,000/event', trigger:'Drought or Flood',         recommended:false },
  { icon:'🛡️', name:'Smart Shield',    premium:'₹4,200', coverage:'₹70,000/event', trigger:'4 parametric triggers',      recommended:true  },
  { icon:'⭐', name:'Full Season Pro', premium:'₹6,300', coverage:'₹1,22,500/event','trigger':'Unlimited + replanting',  recommended:false },
]
export default function EnrollPage() {
  const [form, setForm] = useState({ name:'',state:'Telangana',district:'',crop:'Paddy',acres:'5',phone:'' })
  const [plan, setPlan] = useState('Smart Shield')
  const [step, setStep] = useState<'form'|'plans'|'success'>('form')
  const [loading, setLoading] = useState(false)
  const [policyId, setPolicyId] = useState('')
  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.district) return alert('Please fill name and district')
    setStep('plans')
  }
  const handleEnroll = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    const pid = Math.abs(Array.from(form.name+form.district).reduce((h,c)=>Math.imul(31,h)+c.charCodeAt(0)|0,0)) % 100000
    setPolicyId(`SBI-IIE-${String(pid).padStart(5,'0')}`)
    setStep('success')
    setLoading(false)
  }
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#0d2818,#0a3060,#0a0e27)' }}>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-2">📱 SBI YONO Integration</div>
        <h1 className="text-3xl font-black" style={{ background:'linear-gradient(90deg,#64ffda,#82b1ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Enroll. Cover. Forget.</h1>
        <p className="text-white/60 text-sm mt-2">Parametric insurance via SBI YONO — one tap, no paperwork, no agents.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon:'🌧️',title:'Flood Alert',    msg:'73% flood probability this monsoon.',urgency:'HIGH',   cls:'border-red-700   text-red-400'   },
          { icon:'☀️', title:'Drought Risk',   msg:'Drought in 3 of last 5 years.',       urgency:'MEDIUM', cls:'border-orange-700 text-orange-400' },
          { icon:'🌾', title:'PM-FASAL 30% off',msg:'Estimated payout: ₹12,400/event.',    urgency:'LOW',    cls:'border-green-700  text-green-400'  },
        ].map((n,i)=>(
          <div key={i} className={`bg-[#161b22] border-t-4 rounded-xl p-4 ${n.cls.split(' ')[0]}`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${n.cls.split(' ')[1]}`}>{n.urgency} URGENCY</span>
            <div className="text-2xl mt-2 mb-1">{n.icon}</div>
            <div className="font-bold text-[#e6edf3] text-sm mb-1">{n.title}</div>
            <div className="text-xs text-[#7d8590]">{n.msg}</div>
          </div>
        ))}
      </div>
      {step==='form' && (
        <form onSubmit={handleProfile} className="glass p-6 rounded-2xl">
          <h2 className="font-black text-[#e6edf3] mb-4">📋 Farmer Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['name','Full Name','e.g. Raju Patil'],['district','District','e.g. Warangal'],['phone','Mobile','e.g. +91 9876543210']].map(([k,l,p])=>(
              <div key={k}>
                <label className="block text-xs text-[#7d8590] mb-1">{l}</label>
                <input value={form[k as keyof typeof form]} placeholder={p} onChange={e=>setForm({...form,[k]:e.target.value})}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2.5 text-sm text-[#e6edf3] placeholder:text-[#7d8590] focus:outline-none focus:border-[#64ffda]" />
              </div>
            ))}
            {[['state','State',['Telangana','Maharashtra','Rajasthan','Punjab','Odisha','Gujarat']],
              ['crop','Crop',['Paddy','Cotton','Wheat','Soybean','Groundnut','Sugarcane','Maize','Chilli']]].map(([k,l,opts])=>(
              <div key={k as string}>
                <label className="block text-xs text-[#7d8590] mb-1">{l as string}</label>
                <select value={form[k as keyof typeof form]} onChange={e=>setForm({...form,[k as string]:e.target.value})}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#64ffda]">
                  {(opts as string[]).map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs text-[#7d8590] mb-1">Land (acres)</label>
              <input type="number" value={form.acres} min="0.5" step="0.5" onChange={e=>setForm({...form,acres:e.target.value})}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#64ffda]" />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full py-3 rounded-xl bg-[#64ffda] text-[#0a0e27] font-bold text-sm hover:opacity-90 transition">
            🔍 Generate Risk Profile & Plans →
          </button>
        </form>
      )}
      {step==='plans' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PLANS.map(p=>(
              <div key={p.name} onClick={()=>setPlan(p.name)}
                className={`relative rounded-2xl p-5 cursor-pointer border-2 transition-all ${
                  plan===p.name ? 'border-[#64ffda] bg-[#64ffda]/5' : 'border-[#21262d] bg-[#161b22] hover:border-[#484f58]'
                }`}>
                {p.recommended && <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-bold text-[#0a0e27] py-1 rounded-t-xl" style={{ background:'linear-gradient(90deg,#64ffda,#82b1ff)' }}>⭐ RECOMMENDED</div>}
                <div className={`text-center ${p.recommended?'mt-5':''}`}>
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="font-black text-[#e6edf3]">{p.name}</div>
                  <div className="text-2xl font-black text-[#64ffda] mt-2">{p.premium}</div>
                  <div className="text-[11px] text-[#7d8590]">per season</div>
                  <div className="text-sm text-[#e6edf3] mt-2">{p.coverage}</div>
                  <div className="text-xs text-[#3fb950] bg-green-950/40 rounded-lg px-2 py-1 mt-2">{p.trigger}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-[#64ffda] font-bold mb-3 text-sm">📱 Powered by SBI YONO · One-Tap Enrollment</div>
            <button onClick={handleEnroll} disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#64ffda] text-[#0a0e27] font-bold text-sm hover:opacity-90 transition disabled:opacity-60">
              {loading ? '📱 Activating...' : '✅ Enroll Now via SBI YONO'}
            </button>
          </div>
        </div>
      )}
      {step==='success' && (
        <div className="text-center py-12 glass rounded-2xl">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-3xl font-black text-[#3fb950]">Policy Activated!</div>
          <div className="text-[#64ffda] font-mono text-lg mt-2">{policyId}</div>
          <div className="text-[#7d8590] text-sm mt-3">Farmer: <span className="text-[#e6edf3] font-bold">{form.name}</span> · Plan: <span className="text-[#e6edf3] font-bold">{plan}</span></div>
          <div className="text-[#7d8590] text-xs mt-2">SMS sent to registered mobile ✅</div>
          <button onClick={()=>setStep('form')} className="mt-6 px-6 py-2.5 rounded-xl border border-[#21262d] text-[#7d8590] text-sm hover:bg-white/5 transition">Enroll Another</button>
        </div>
      )}
    </div>
  )
}
