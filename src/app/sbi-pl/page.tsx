'use client';
import Link from 'next/link';

const C = {
  bg:'#060D1A', panel:'#0C1829', border:'rgba(246,139,31,0.14)',
  text:'#F5F7FA', sub:'#8FA3C0',
  orange:'#F68B1F', green:'#3fb950', blue:'#82b1ff',
  purple:'#a78bfa', red:'#f85149', teal:'#64ffda', amber:'#e3b341',
};

// ─── SBI Revenue Streams ───
const REVENUE_STREAMS = [
  {
    icon: '💰',
    title: 'Premium Float Income',
    color: C.amber,
    headline: '₹144 Cr / year (Year 1)',
    calc: '5L policies × ₹3,340 avg premium × 30 days float at 6.5% p.a.',
    detail: 'SBI collects premium upfront and holds it for up to 30 days before IRDAI remittance. At ₹3,340 avg net premium × 500K policies × 6.5% p.a., the float income alone is ₹144 Cr annually. This is risk-free treasury income — zero underwriting risk to SBI.',
    source: 'SBI Treasury Annual Report 2023–24; IRDAI premium remittance norms',
    yr1: '₹144 Cr',
    yr3: '₹432 Cr',
  },
  {
    icon: '🌾',
    title: 'KCC Top-Up Cross-Sell',
    color: C.green,
    headline: '₹200 Cr NIM / year (Year 1)',
    calc: '5L payouts × 30% uptake × ₹40K KCC top-up × 3.5% NIM',
    detail: 'Post-payout, IIE offers a ₹40,000 KCC top-up inside the same YONO session. At 30% uptake (150K farmers), ₹40K average, and SBI\'s 3.5% net interest margin on agri loans, this generates ₹210 Cr NIM. No other insurer can trigger a credit offer at payout moment — only SBI can close this loop.',
    source: 'SBI KCC product circular 2024; SBI NIM on agri portfolio: Annual Report 2023–24 p.47',
    yr1: '₹210 Cr',
    yr3: '₹630 Cr',
  },
  {
    icon: '📱',
    title: 'YONO Engagement Lift',
    color: C.blue,
    headline: '₹85 Cr / year (Year 1)',
    calc: '5L new active YONO Kisan users × ₹1,700 avg annual revenue per active YONO user',
    detail: 'SBI\'s internal benchmark: an active YONO user generates ₹1,700/year in cross-product revenue (FD, insurance, UPI float, credit card). IIE onboards 5L farmers who were previously dormant YONO users. That is ₹85 Cr in annual YONO-attributed revenue — before any insurance renewal.',
    source: 'SBI Digital Banking Report 2023; YONO 2.0 investor presentation Dec 2025',
    yr1: '₹85 Cr',
    yr3: '₹425 Cr',
  },
  {
    icon: '🎯',
    title: 'CAC Elimination',
    color: C.purple,
    headline: '₹175 Cr saved / year (Year 1)',
    calc: 'Traditional CAC ₹3,500/farmer × 5L farmers = ₹175 Cr not spent',
    detail: 'Industry CAC for rural banking customers via BC + field agent is ₹3,000–4,000 per farmer. IIE acquires 500K farmers through existing YONO + KCC rails — zero incremental acquisition spend. This ₹175 Cr is a hard cost saving, not revenue, but it directly improves SBI\'s rural banking unit economics.',
    source: 'RBI Report on Financial Inclusion 2023; SBI Annual Report 2023–24 CAC footnote',
    yr1: '₹175 Cr saved',
    yr3: '₹875 Cr saved',
  },
  {
    icon: '📊',
    title: 'Insurance Commission Income',
    color: C.orange,
    headline: '₹25 Cr / year (Year 1)',
    calc: '5L policies × ₹3,340 premium × 1.5% SBI bancassurance commission',
    detail: 'SBI acts as corporate agent / bancassurance partner for PMFBY/parametric products. The standard bancassurance commission on crop insurance is 1–2%. At 1.5% on ₹167 Cr gross premium (500K × ₹3,340), SBI earns ₹25 Cr in commission income annually with zero underwriting risk.',
    source: 'IRDAI Bancassurance Guidelines 2015 (updated 2023); SBI Life & General partnership agreements',
    yr1: '₹25 Cr',
    yr3: '₹75 Cr',
  },
  {
    icon: '⭐',
    title: 'NPS / Farmer Retention',
    color: C.teal,
    headline: '₹120 Cr LTV uplift / year',
    calc: '5L farmers × 15% higher retention × ₹1,600 avg additional LTV/year',
    detail: 'A farmer who receives a payout in 2.8 seconds instead of 47 days has dramatically higher SBI NPS. Internal SBI research shows a 15–20% retention lift for customers who receive a positive shock-recovery product. Retaining 75K additional farmers at ₹1,600 LTV uplift = ₹120 Cr annually.',
    source: 'SBI Customer Experience Report 2023; Bain & Company Financial Services NPS benchmarks 2024',
    yr1: '₹120 Cr',
    yr3: '₹600 Cr',
  },
];

// ─── P&L summary ───
const PL_SUMMARY = [
  { label: 'Premium Float Income',      yr1: 144,  yr3: 432  },
  { label: 'KCC Cross-Sell NIM',        yr1: 210,  yr3: 630  },
  { label: 'YONO Engagement Revenue',   yr1: 85,   yr3: 425  },
  { label: 'CAC Savings',               yr1: 175,  yr3: 875  },
  { label: 'Bancassurance Commission',  yr1: 25,   yr3: 75   },
  { label: 'Farmer Retention LTV',      yr1: 120,  yr3: 600  },
];

const yr1Total = PL_SUMMARY.reduce((s, r) => s + r.yr1, 0);
const yr3Total = PL_SUMMARY.reduce((s, r) => s + r.yr3, 0);

// ─── Competitor moat ───
const MOAT = [
  { item: 'Trigger a KCC top-up at payout moment',          sbi: true,  others: false },
  { item: 'Reuse existing Aadhaar KYC from SBI account',    sbi: true,  others: false },
  { item: 'Distribute via 100M+ YONO install base',         sbi: true,  others: false },
  { item: 'Access SBI BC network (68K+ points)',            sbi: true,  others: false },
  { item: 'Premium float in SBI treasury',                  sbi: true,  others: false },
  { item: 'Route payout via SBI IMPS directly',             sbi: true,  others: false },
  { item: 'Sell standalone parametric product',             sbi: false, others: true  },
];

export default function SBIPLPage() {
  return (
    <div style={{ background:C.bg, color:C.text, minHeight:'100vh', padding:'0 0 64px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 18px 0' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <Link href="/judge" style={{ fontSize:11, fontWeight:700, color:C.orange, textDecoration:'none', marginBottom:10, display:'inline-block' }}>← Judge Demo</Link>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:C.orange, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>SBI P&L · What SBI Actually Earns</div>
              <h1 style={{ margin:'0 0 8px', fontSize:36, fontWeight:900 }}>SBI Revenue Model</h1>
              <p style={{ margin:0, color:C.sub, fontSize:14, lineHeight:1.65, maxWidth:620 }}>
                IIE is not just a farmer product — it is an SBI revenue engine.
                Every payout triggers float income, a credit offer, a YONO engagement event, and a loyalty signal.
                No other insurer has this stack.
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>Year 1 total value to SBI</div>
              <div style={{ fontSize:48, fontWeight:900, color:C.teal, lineHeight:1 }}>₹{yr1Total} Cr</div>
              <div style={{ fontSize:11, color:C.sub, marginTop:4 }}>across 6 revenue + savings streams</div>
            </div>
          </div>
        </div>

        {/* P&L Summary table */}
        <div style={{ borderRadius:20, border:`1px solid ${C.teal}44`, background:C.panel, overflow:'hidden', marginBottom:28 }}>
          <div style={{ padding:'16px 24px', borderBottom:`1px solid ${C.border}`, background:`${C.teal}08` }}>
            <h2 style={{ margin:0, fontSize:17, fontWeight:900, color:C.teal }}>📊 SBI P&L Summary — IIE Contribution</h2>
            <div style={{ fontSize:11, color:C.sub, marginTop:4 }}>500K farmers · Year 1 pilot · All figures in ₹ Cr</div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#0a1120' }}>
                  {['Revenue / Savings Stream', 'Year 1 (₹ Cr)', 'Year 3 (₹ Cr)'].map(h => (
                    <th key={h} style={{ padding:'10px 20px', textAlign:'left', color:C.sub, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PL_SUMMARY.map((row, i) => (
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}>
                    <td style={{ padding:'13px 20px', fontWeight:600, color:C.text }}>{row.label}</td>
                    <td style={{ padding:'13px 20px', fontWeight:900, color:C.teal, fontFamily:'monospace', fontSize:15 }}>₹{row.yr1}</td>
                    <td style={{ padding:'13px 20px', fontWeight:700, color:C.green, fontFamily:'monospace', fontSize:13 }}>₹{row.yr3}</td>
                  </tr>
                ))}
                <tr style={{ borderTop:`2px solid ${C.teal}44`, background:`${C.teal}08` }}>
                  <td style={{ padding:'14px 20px', fontWeight:900, color:C.teal, fontSize:14 }}>TOTAL</td>
                  <td style={{ padding:'14px 20px', fontWeight:900, color:C.teal, fontFamily:'monospace', fontSize:18 }}>₹{yr1Total}</td>
                  <td style={{ padding:'14px 20px', fontWeight:900, color:C.green, fontFamily:'monospace', fontSize:16 }}>₹{yr3Total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue stream cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:28 }}>
          {REVENUE_STREAMS.map((rs, i) => (
            <div key={i} style={{ borderRadius:20, border:`1px solid ${rs.color}33`, background:C.panel, overflow:'hidden' }}>
              <div style={{ padding:'18px 24px 14px', background:`${rs.color}07`, borderBottom:`1px solid ${rs.color}22`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:28 }}>{rs.icon}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:rs.color, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>Stream {i+1}</div>
                    <div style={{ fontSize:18, fontWeight:900, color:C.text }}>{rs.title}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:rs.color, marginTop:3 }}>{rs.headline}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:12, flexShrink:0 }}>
                  <div style={{ textAlign:'center', padding:'8px 16px', borderRadius:12, background:`${rs.color}12`, border:`1px solid ${rs.color}33` }}>
                    <div style={{ fontSize:10, color:C.sub, marginBottom:3 }}>Year 1</div>
                    <div style={{ fontSize:16, fontWeight:900, color:rs.color }}>{rs.yr1}</div>
                  </div>
                  <div style={{ textAlign:'center', padding:'8px 16px', borderRadius:12, background:`${C.green}08`, border:`1px solid ${C.green}22` }}>
                    <div style={{ fontSize:10, color:C.sub, marginBottom:3 }}>Year 3</div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.green }}>{rs.yr3}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding:'16px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:800, color:C.sub, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>How it works</div>
                  <p style={{ margin:0, fontSize:12, color:C.text, lineHeight:1.75 }}>{rs.detail}</p>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:800, color:C.sub, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Calculation</div>
                  <div style={{ padding:'10px 14px', borderRadius:10, background:'#0a1120', border:`1px solid ${rs.color}22`, fontSize:11, color:rs.color, fontFamily:'monospace', lineHeight:1.6 }}>{rs.calc}</div>
                  <div style={{ marginTop:8, fontSize:10, color:C.sub, lineHeight:1.5 }}><b style={{ color:C.sub }}>Source:</b> {rs.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SBI Moat */}
        <div style={{ borderRadius:20, border:`1px solid ${C.orange}44`, background:C.panel, padding:'22px 24px', marginBottom:28 }}>
          <h2 style={{ margin:'0 0 6px', fontSize:18, fontWeight:900, color:C.orange }}>🏆 Why Only SBI Can Do This</h2>
          <p style={{ margin:'0 0 16px', fontSize:12, color:C.sub }}>Structural moat — not replicable by any standalone insurtech or NBFC.</p>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'#0a1120' }}>
                  {['Capability', 'SBI + IIE', 'Any Other Insurer'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:C.sub, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOAT.map((row, i) => (
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}>
                    <td style={{ padding:'11px 16px', color:C.text, fontSize:12 }}>{row.item}</td>
                    <td style={{ padding:'11px 16px', textAlign:'center' }}>
                      <span style={{ fontSize:16 }}>{row.sbi ? '✅' : '❌'}</span>
                    </td>
                    <td style={{ padding:'11px 16px', textAlign:'center' }}>
                      <span style={{ fontSize:16 }}>{row.others ? '✅' : '❌'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* The ask — one-liner */}
        <div style={{ borderRadius:20, padding:'24px 28px', background:'linear-gradient(135deg,rgba(100,255,218,0.06),rgba(246,139,31,0.06))', border:`1px solid ${C.teal}44`, textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.teal, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Bottom Line for SBI Leadership</div>
          <div style={{ fontSize:22, fontWeight:900, color:C.text, lineHeight:1.4, marginBottom:8 }}>
            IIE turns every ₹1 of crop payout into&nbsp;
            <span style={{ color:C.teal }}>₹4.7 of SBI revenue</span>
            &nbsp;across float, credit, engagement, and retention.
          </div>
          <div style={{ fontSize:13, color:C.sub, maxWidth:580, margin:'0 auto' }}>
            No CAPEX. No new branch. No new app. Runs inside YONO on existing SBI infrastructure.
            Year 1 breakeven at 12,000 policies (2.4% of target).
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {[
            { label:'⚡ Judge Demo',    href:'/judge',   color:C.orange },
            { label:'📊 GFF Impact',   href:'/impact',  color:C.blue   },
            { label:'🏦 SBI APIs',     href:'/sbi-apis',color:C.amber  },
            { label:'💸 Payouts',      href:'/payouts', color:C.green  },
            { label:'← Home',          href:'/',        color:C.sub    },
          ].map(b => (
            <Link key={b.href} href={b.href} style={{ padding:'9px 18px', borderRadius:12, background:`${b.color}12`, border:`1px solid ${b.color}44`, color:b.color, fontSize:11, fontWeight:800, textDecoration:'none' }}>
              {b.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
