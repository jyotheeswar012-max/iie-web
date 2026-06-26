'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const FEED = [
  { farmer:'Raju Patil',   district:'Barmer',   amount:'₹48,200', status:'SUCCESS', trigger:'Drought',  time:'14:32' },
  { farmer:'Anita Devi',   district:'Puri',     amount:'₹32,800', status:'SUCCESS', trigger:'Flood',    time:'14:18' },
  { farmer:'Vijay Singh',  district:'Ludhiana', amount:'₹62,500', status:'SUCCESS', trigger:'Drought',  time:'13:55' },
  { farmer:'Meena Kumari', district:'Nashik',   amount:'₹28,400', status:'SUCCESS', trigger:'Heatwave', time:'13:42' },
  { farmer:'Suresh Rao',   district:'Khammam',  amount:'₹41,100', status:'PENDING', trigger:'Flood',    time:'13:38' },
  { farmer:'Priya Sharma', district:'Latur',    amount:'₹55,700', status:'SUCCESS', trigger:'Heatwave', time:'13:21' },
  { farmer:'Ramesh Yadav', district:'Adilabad', amount:'₹19,300', status:'SUCCESS', trigger:'Cyclone',  time:'13:10' },
  { farmer:'Lakshmi Bai',  district:'Jodhpur',  amount:'₹33,900', status:'SUCCESS', trigger:'Drought',  time:'12:58' },
]
const VOLUME = [
  {date:'Jun 12',amount:1.2,farmers:2800},{date:'Jun 13',amount:2.1,farmers:4200},
  {date:'Jun 14',amount:0.9,farmers:1900},{date:'Jun 15',amount:3.4,farmers:6800},
  {date:'Jun 16',amount:2.8,farmers:5600},{date:'Jun 17',amount:1.5,farmers:3100},
  {date:'Jun 18',amount:3.8,farmers:7600},{date:'Jun 19',amount:2.2,farmers:4400},
  {date:'Jun 20',amount:1.7,farmers:3400},{date:'Jun 21',amount:4.1,farmers:8200},
  {date:'Jun 22',amount:3.1,farmers:6200},{date:'Jun 23',amount:2.6,farmers:5200},
  {date:'Jun 24',amount:1.9,farmers:3800},{date:'Jun 25',amount:2.1,farmers:4100},
]
export default function PayoutsPage() {
  const [filter, setFilter] = useState('ALL')
  const shown = filter==='ALL' ? FEED : FEED.filter(f=>f.status===filter)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#0a0e27,#0d1b4b,#00695c)' }}>
        <div className="text-xs font-bold tracking-[3px] text-[#64ffda] uppercase mb-2">⚡ Auto-Payment Engine</div>
        <h1 className="text-3xl font-black gradient-text">Live Payout Dashboard</h1>
        <p className="text-white/60 text-sm mt-2">Real-time UPI/IMPS auto-credits to SBI accounts · Zero claims · Zero waiting</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[['₹',`₹${(FEED.filter(f=>f.status==='SUCCESS').reduce((s,f)=>s+parseInt(f.amount.replace(/[₹,]/g,'')),0)/100000).toFixed(1)}L`,'Today Payouts','text-[#64ffda]'],
          ['✅',FEED.filter(f=>f.status==='SUCCESS').length,'Successful','text-[#3fb950]'],
          ['⏳',FEED.filter(f=>f.status==='PENDING').length,'Pending','text-[#e3b341]'],
          ['⚡','47 min','Avg Settlement','text-[#82b1ff]'],
        ].map(([icon,val,lbl,cls],i)=>(
          <div key={i} className="glass p-4 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-2xl font-black ${cls}`}>{val}</div>
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1">{lbl}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4">
          <h3 className="font-bold text-[#e6edf3] text-sm mb-3">📈 14-Day Payout Volume (₹ Cr)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VOLUME} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="date" tick={{fill:'#7d8590',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#7d8590',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#161b22',border:'1px solid #21262d',borderRadius:'8px',fontSize:'12px',color:'#e6edf3'}}/>
              <Bar dataKey="amount" fill="#64ffda" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-4">
          <h3 className="font-bold text-[#e6edf3] text-sm mb-3">👨‍🌾 Farmers Paid Per Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={VOLUME} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="date" tick={{fill:'#7d8590',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#7d8590',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#161b22',border:'1px solid #21262d',borderRadius:'8px',fontSize:'12px',color:'#e6edf3'}}/>
              <Line type="monotone" dataKey="farmers" stroke="#3fb950" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
          <h3 className="font-bold text-[#e6edf3] text-sm">⚡ Live Payout Feed</h3>
          <div className="flex gap-2">
            {['ALL','SUCCESS','PENDING'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition ${
                  filter===f?'bg-[#64ffda] text-[#0a0e27]':'text-[#7d8590] hover:bg-white/5'
                }`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-[#21262d]">
          {shown.map((p,i)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                p.status==='SUCCESS'?'text-green-400 bg-green-950/50 border-green-800':'text-yellow-400 bg-yellow-950/50 border-yellow-800'
              }`}>{p.status}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[#e6edf3] text-sm">{p.farmer}</span>
                <span className="text-[#7d8590] text-xs ml-2">{p.district}</span>
              </div>
              <span className="text-xs text-[#7d8590]">{p.trigger}</span>
              <span className="font-black text-[#3fb950] text-sm">{p.amount}</span>
              <span className="text-[11px] text-[#7d8590] font-mono">{p.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
