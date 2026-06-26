'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const PLANS = [
  { icon:'🌱', name:'Basic Protect',   premium:'₹2,800', coverage:'₹42,000/event', trigger:'Drought or Flood only',       recommended:false },
  { icon:'🛡️', name:'Smart Shield',    premium:'₹4,200', coverage:'₹70,000/event', trigger:'4 parametric triggers',       recommended:true  },
  { icon:'⭐', name:'Full Season Pro', premium:'₹6,300', coverage:'₹1,22,500/event','trigger':'Unlimited + replanting cover',recommended:false },
]

export default function EnrollPage() {
  const [form, setForm] = useState({ name:'',state:'Telangana',district:'',crop:'Paddy',acres:'5',phone:'',aadhaar:'' })
  const [plan, setPlan] = useState('Smart Shield')
  const [step, setStep] = useState<'form'|'plans'|'success'>('form')
  const [loading, setLoading] = useState(false)
  const [policyId, setPolicyId] = useState('')

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.district) { toast.error('Please fill in your name and district'); return }
    setStep('plans')
  }

  const handleEnroll = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    const pid = Math.abs(Array.from(form.name+form.district).reduce((h,c)=>Math.imul(31,h)+c.charCodeAt(0)|0,0)) % 100000
    setPolicyId(`SBI-IIE-${String(pid).padStart(5,'0')}`)
    setStep('success')
    setLoading(false)
    toast.success('Policy activated! SMS sent.')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
        className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#0d2818,#0a3060,#0a0e27)' }}>
        <div className="text-xs font-bold tracking-[3px] text-brand-teal uppercase mb-2">📱 SBI YONO Integration</div>
        <h1 className="text-3xl font-black" style={{ background:'linear-gradient(90deg,#64ffda,#82b1ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Enroll. Cover. Forget.</h1>
        <p className="text-white/60 text-sm mt-2">Parametric insurance via SBI YONO — one tap, no paperwork, no agents.</p>
      </motion.div>

      {/* Nudge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon:'🌧️',title:'Flood Alert',     msg:'73% flood probability this monsoon. Enroll before June 30.',urgency:'HIGH',   c:'border-red-700   text-red-400'  },
          { icon:'☀️', title:'Drought Risk',    msg:'NDVI history shows drought in 3 of last 5 years for cotton.', urgency:'MEDIUM', c:'border-orange-700 text-orange-400' },
          { icon:'🌾', title:'PM-FASAL Subsidy',msg:'30% off premium available. Estimated payout: ₹12,400/event.',  urgency:'LOW',    c:'border-green-700  text-green-400'  },
        ].map((n,i) => (
          <div key={i} className={`bg-brand-card border-t-4 rounded-xl p-4 ${n.c.split(' ')[0]}`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${n.c.split(' ')[1]}`}>{n.urgency} URGENCY</span>
            <div className="text-2xl mt-2 mb-1">{n.icon}</div>
            <div className="font-bold text-brand-text text-sm mb-1">{n.title}</div>
            <div className="text-xs text-brand-muted leading-relaxed">{n.msg}</div>
          </div>
        ))}
      </div>

      {step === 'form' && (
        <motion.form initial={{ opacity:0 }} animate={{ opacity:1 }} onSubmit={handleProfile}
          className="glass p-6 rounded-2xl">
          <h2 className="font-black text-brand-text mb-4">📋 Your Farmer Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['name','Full Name','e.g. Raju Patil'],['district','District','e.g. Warangal'],['phone','Mobile','e.g. +91 9876543210'],['aadhaar','Aadhaar (last 4)','XXXX']].map(([k,l,p]) => (
              <div key={k}>
                <label className="block text-xs text-brand-muted mb-1">{l}</label>
                <input value={form[k as keyof typeof form]} placeholder={p}
                  onChange={e=>setForm({...form,[k]:e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-teal" />
              </div>
            ))}
            {[['state','State',['Telangana','Maharashtra','Rajasthan','Punjab','Odisha','Gujarat']],
              ['crop','Primary Crop',['Paddy','Cotton','Wheat','Soybean','Groundnut','Sugarcane','Maize','Chilli']]].map(([k,l,opts]) => (
              <div key={k as string}>
                <label className="block text-xs text-brand-muted mb-1">{l as string}</label>
                <select value={form[k as keyof typeof form]} onChange={e=>setForm({...form,[k as string]:e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-teal">
                  {(opts as string[]).map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs text-brand-muted mb-1">Land (acres)</label>
              <input type="number" value={form.acres} min="0.5" step="0.5"
                onChange={e=>setForm({...form,acres:e.target.value})}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-teal" />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full py-3 rounded-xl bg-brand-teal text-brand-navy font-bold text-sm hover:bg-brand-teal/90 transition">
            🔍 Generate My Risk Profile & Plans →
          </button>
        </motion.form>
      )}

      {step === 'plans' && (
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PLANS.map(p => (
              <div key={p.name} onClick={()=>setPlan(p.name)}
                className={`relative rounded-2xl p-5 cursor-pointer border-2 transition-all ${
                  plan===p.name ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border bg-brand-card hover:border-brand-border/80'
                }`}>
                {p.recommended && <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-bold tracking-widest text-brand-navy py-1 rounded-t-xl" style={{ background:'linear-gradient(90deg,#64ffda,#82b1ff)' }}>⭐ RECOMMENDED</div>}
                <div className={`text-center ${p.recommended ? 'mt-5':''}`}>
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="font-black text-brand-text">{p.name}</div>
                  <div className="text-2xl font-black text-brand-teal mt-2">{p.premium}</div>
                  <div className="text-[11px] text-brand-muted">per season</div>
                  <div className="text-sm text-brand-text mt-2">{p.coverage}</div>
                  <div className="text-xs text-brand-green bg-green-950/40 rounded-lg px-2 py-1 mt-2">{p.trigger}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-brand-teal font-bold mb-3 text-sm">📱 Powered by SBI YONO · One-Tap Enrollment</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-brand-muted mb-2">Selected plan: <span className="text-brand-text font-bold">{plan}</span></div>
                <button onClick={handleEnroll} disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-teal text-brand-navy font-bold text-sm hover:bg-brand-teal/90 transition disabled:opacity-60">
                  {loading ? '📱 Activating via SBI YONO...' : '✅ Enroll Now via SBI YONO'}
                </button>
              </div>
              <div className="bg-brand-dark rounded-xl p-4 text-xs text-brand-muted leading-7">
                🔍 Agent 1 monitors 24/7<br/>
                ✅ Agent 2 verifies trigger automatically<br/>
                📋 Agent 3 calculates payout<br/>
                ⚡ Agent 4 credits SBI account <span className="text-brand-green font-bold">in &lt;2 hrs</span><br/>
                📱 You get an SMS — <span className="text-brand-teal font-bold">that's it</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div initial={{ scale:0.9,opacity:0 }} animate={{ scale:1,opacity:1 }}
          className="text-center py-12 glass rounded-2xl">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-3xl font-black text-brand-green">Policy Activated!</div>
          <div className="text-brand-teal font-mono text-lg mt-2">{policyId}</div>
          <div className="text-brand-muted text-sm mt-3">Farmer: <span className="text-brand-text font-bold">{form.name}</span> · Plan: <span className="text-brand-text font-bold">{plan}</span></div>
          <div className="text-brand-muted text-xs mt-2">SMS sent to registered mobile ✅</div>
          <button onClick={()=>setStep('form')} className="mt-6 px-6 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm hover:bg-white/5 transition">
            Enroll Another Farmer
          </button>
        </motion.div>
      )}
    </div>
  )
}
