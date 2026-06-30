'use client';
import { useState, useEffect } from 'react';

const SEED: Payout[] = [
  { id:'SBI-IIE-00341', farmer:'Raju Patil',   district:'Warangal, TG',  crop:'Cotton',   event:'Drought',  amount:48200, upi:'UPI7841029483', rrn:'924819023741', ts:'2026-06-29 14:32:18', status:'COMPLETED', conf:94 },
  { id:'SBI-IIE-00298', farmer:'Anita Devi',   district:'Puri, OD',      crop:'Paddy',    event:'Flood',    amount:32800, upi:'UPI3920184736', rrn:'831920017463', ts:'2026-06-29 14:18:44', status:'COMPLETED', conf:97 },
  { id:'SBI-IIE-00412', farmer:'Vijay Singh',  district:'Ludhiana, PB',  crop:'Wheat',    event:'Drought',  amount:62500, upi:'UPI6018274930', rrn:'719283649182', ts:'2026-06-29 13:55:02', status:'COMPLETED', conf:91 },
  { id:'SBI-IIE-00187', farmer:'Meena Kumari', district:'Nashik, MH',    crop:'Soybean',  event:'Heatwave', amount:28400, upi:'UPI2047381920', rrn:'604817293048', ts:'2026-06-29 14:41:00', status:'PROCESSING',conf:88 },
  { id:'SBI-IIE-00523', farmer:'Suresh Rao',   district:'Khammam, TG',   crop:'Paddy',    event:'Flood',    amount:41100, upi:'UPI9182736450', rrn:'PENDING',       ts:'2026-06-29 14:38:00', status:'VERIFYING', conf:82 },
  { id:'SBI-IIE-00609', farmer:'Kavitha Reddy',district:'Adilabad, TG',  crop:'Cotton',   event:'Cyclone',  amount:55000, upi:'UPI4738291046', rrn:'512930481726', ts:'2026-06-29 14:55:10', status:'COMPLETED', conf:96 },
  { id:'SBI-IIE-00734', farmer:'Mohan Lal',    district:'Barmer, RJ',    crop:'Wheat',    event:'Drought',  amount:70000, upi:'UPI8192047364', rrn:'401829304716', ts:'2026-06-29 15:01:33', status:'COMPLETED', conf:93 },
  { id:'SBI-IIE-00821', farmer:'Priya Sharma', district:'Jodhpur, RJ',   crop:'Groundnut',event:'Heatwave', amount:22100, upi:'UPI2930184756', rrn:'318294017483', ts:'2026-06-29 15:12:44', status:'PROCESSING',conf:79 },
];

type Payout = {
  id:string; farmer:string; district:string; crop:string; event:string;
  amount:number; upi:string; rrn:string; ts:string; status:string; conf:number;
};

const S_COL: Record<string,string> = {
  COMPLETED:'text-green-400 bg-green-950/50 border-green-800',
  PROCESSING:'text-yellow-400 bg-yellow-950/50 border-yellow-800',
  VERIFYING:'text-blue-400 bg-blue-950/50 border-blue-800',
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(SEED);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [last, setLast] = useState('');

  useEffect(() => {
    // Simulate a new payout arriving every 12s
    const t = setInterval(() => {
      const names = ['Ramesh Kumar','Sunita Devi','Arjun Patel','Lakshmi Bai','Gopal Reddy'];
      const districts = ['Latur, MH','Amritsar, PB','Surat, GJ','Bhubaneswar, OD','Khammam, TG'];
      const crops = ['Paddy','Cotton','Wheat','Soybean','Maize'];
      const events = ['Drought','Flood','Heatwave','Cyclone'];
      const newP: Payout = {
        id: 'SBI-IIE-' + String(Math.floor(Math.random()*9000+1000)),
        farmer: names[Math.floor(Math.random()*names.length)],
        district: districts[Math.floor(Math.random()*districts.length)],
        crop: crops[Math.floor(Math.random()*crops.length)],
        event: events[Math.floor(Math.random()*events.length)],
        amount: Math.floor(Math.random()*70000+20000),
        upi: 'UPI' + Math.floor(Math.random()*9e9+1e9),
        rrn: String(Math.floor(Math.random()*9e11+1e11)),
        ts: new Date().toISOString().slice(0,19).replace('T',' '),
        status: 'COMPLETED',
        conf: Math.floor(Math.random()*15+80),
      };
      setPayouts(prev => [newP, ...prev.slice(0,19)]);
      setLast(newP.farmer + ' — ₹' + newP.amount.toLocaleString());
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const filtered = payouts
    .filter(p => filter==='All' || p.status===filter)
    .filter(p => !search || p.farmer.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.district.toLowerCase().includes(search.toLowerCase()));

  const total   = payouts.filter(p=>p.status==='COMPLETED').reduce((s,p)=>s+p.amount,0);
  const pending = payouts.filter(p=>p.status!=='COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#0a0e27,#0d2818,#030712)', border:'1px solid rgba(63,185,80,0.15)' }}>
        <div className="text-xs font-bold tracking-[3px] text-[#3fb950] uppercase mb-2">💸 IMPS · UPI · NPCI Settlement</div>
        <h1 className="text-3xl font-black gradient-text">Live Payout Tracker</h1>
        <p className="text-white/50 text-sm mt-1">Real-time oracle-triggered payouts · every settlement under 3 seconds</p>
      </div>

      {/* Live notification */}
      {last && (
        <div className="rounded-xl px-4 py-2.5 mb-4 flex items-center gap-3 text-sm animate-fadeIn" style={{ background:'rgba(63,185,80,0.1)', border:'1px solid rgba(63,185,80,0.3)' }}>
          <span className="pulse-dot" />
          <span className="text-[#3fb950] font-bold">New payout:</span>
          <span className="text-[#e6edf3]">{last}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          ['₹'+total.toLocaleString(), 'Total Settled', '#3fb950'],
          [String(payouts.filter(p=>p.status==='COMPLETED').length), 'Completed', '#64ffda'],
          [String(pending), 'In Progress', '#e3b341'],
          ['< 3s', 'Avg Settlement', '#82b1ff'],
        ].map(([v,l,c],i)=>(
          <div key={i} className="glass text-center py-4">
            <div className="text-2xl font-black" style={{ color:c }}>{v}</div>
            <div className="text-[10px] text-[#7d8590] uppercase tracking-widest mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass p-3 mb-4 flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search farmer / ID / district…"
          className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] focus:outline-none focus:border-[#64ffda] flex-1 min-w-48" />
        {['All','COMPLETED','PROCESSING','VERIFYING'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter===f ? 'bg-[#64ffda] text-[#030712]' : 'bg-[#161b22] border border-[#21262d] text-[#7d8590] hover:border-[#484f58]'
            }`}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#21262d]">
              {['Policy ID','Farmer','District/Crop','Event','Amount','UPI / RRN','Confidence','Status'].map(h=>(
                <th key={h} className="px-3 py-3 text-left text-[11px] font-bold text-[#7d8590] uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={i} className="border-b border-[#21262d]/40 hover:bg-white/2 transition-colors">
                <td className="px-3 py-3 font-mono text-xs text-[#64ffda]">{p.id}</td>
                <td className="px-3 py-3 font-bold text-[#e6edf3] whitespace-nowrap">{p.farmer}</td>
                <td className="px-3 py-3 text-[#7d8590] text-xs">{p.district}<br/><span className="text-[#e6edf3]">{p.crop}</span></td>
                <td className="px-3 py-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background:'rgba(100,255,218,0.1)', border:'1px solid rgba(100,255,218,0.25)', color:'#64ffda' }}>{p.event}</span>
                </td>
                <td className="px-3 py-3 font-black text-[#3fb950]">₹{p.amount.toLocaleString()}</td>
                <td className="px-3 py-3 font-mono text-[10px] text-[#7d8590]">{p.upi}<br/>{p.rrn}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-14 h-1 bg-[#21262d] rounded-full overflow-hidden">
                      <div style={{ width:`${p.conf}%`, height:'100%', background:'#3fb950', borderRadius:4 }} />
                    </div>
                    <span className="text-xs font-bold text-[#3fb950]">{p.conf}%</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${S_COL[p.status]}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
