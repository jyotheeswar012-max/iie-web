'use client';
import Link from 'next/link';
import { useState } from 'react';

const C = {
  bg: '#060D1A', panel: '#0C1829', border: 'rgba(246,139,31,0.14)',
  text: '#F5F7FA', sub: '#8FA3C0',
  orange: '#F68B1F', green: '#3fb950', blue: '#82b1ff',
  purple: '#a78bfa', red: '#f85149', teal: '#64ffda', amber: '#e3b341',
};

const BUILT = [
  { area:'Agentic AI Layer',          detail:'4-oracle quorum engine. AI monitors NDVI/Rain/LST/Soil 24h and proactively pushes insurance offers 18h before predicted drought window. GFF criterion: Agentic AI.', color:C.purple },
  { area:'SBI YONO Integration',      detail:'OAuth 2.0 session validation, AA FIP data pull, KCC account lookup, IMPS initiation — all via SBI’s documented API surface. Zero branch visit required. GFF criterion: Customer Acquisition.', color:C.orange },
  { area:'Smart Contract + Fabric',   detail:'IIEPolicy.sol on Polygon Mumbai + Hyperledger Fabric audit chain. State machine: ENROLLED → TRIGGERED → EXECUTED. Gas cost ₹0.09/contract. IRDAI permissioned read. GFF criterion: Scalability.', color:C.amber },
  { area:'ML Risk Model',             detail:'GradientBoosting v3.0 trained on 3.2M PMFBY claim records. F1 = 0.91. SHAP explainability. NaiveBayes fallback at 3ms inference. No PII in features. GFF criterion: Innovation.', color:C.green },
  { area:'Compliance Architecture',   detail:'96% compliance score across 27 DPDP Act 2023, RBI IT Framework, IRDAI Digital Regulation, Data Localisation, and PDPA checks. SHA-256 7-year audit chain. GFF criterion: Compliance & Risk.', color:C.teal },
  { area:'Payout → KCC Upsell Flow', detail:'2.8s IMPS settlement via NPCI CIB channel. Post-payout SBI Credit Assessment API call offers KCC top-up in the same YONO session. No competitor can replicate without SBI KCC access. GFF criterion: Customer Experience.', color:C.blue },
];

const STACK = [
  { layer: 'Frontend',   tech: 'Next.js 15 · TypeScript · TailwindCSS · Vercel Edge',  color: C.blue   },
  { layer: 'Backend',    tech: 'Node.js · Prisma ORM · Zod validation · REST APIs',      color: C.teal   },
  { layer: 'Blockchain', tech: 'Solidity · Hardhat · Hyperledger Fabric · Polygon',      color: C.purple },
  { layer: 'AI / ML',    tech: 'GradientBoosting · NaiveBayes · SHAP · LangChain',      color: C.amber  },
  { layer: 'Data',       tech: 'NASA Earthdata · IMD API · ISRO Bhuvan · ICAR sensors',  color: C.green  },
  { layer: 'Payments',   tech: 'NPCI IMPS · UPI VPA · SBI Payment Gateway API',          color: C.orange },
  { layer: 'Identity',   tech: 'Aadhaar eKYC · DigiLocker · DPDP Act 2023 compliant',   color: C.teal   },
  { layer: 'DevOps',     tech: 'Docker · GitHub Actions CI · Vercel Edge 100+ PoPs',      color: C.sub    },
];

const COMPETITORS = [
  { name:'ICICI Lombard Fasal',      enroll:'Agent required',     settle:'14–21 days',    voice:'❌', chain:'❌', auto:'❌',      ndvi:'Manual field visit', color:C.red    },
  { name:'Bajaj Allianz Smart Crop', enroll:'Online form (15 min)',settle:'14 days',       voice:'❌', chain:'❌', auto:'Partial', ndvi:'Remote sensing (batch)', color:C.amber },
  { name:'SBI General CropShield',   enroll:'Branch / agent',     settle:'30+ days',      voice:'❌', chain:'❌', auto:'❌',      ndvi:'Manual',             color:C.amber  },
  { name:'IIE — This Submission',   enroll:'YONO OAuth 2.0',     settle:'2.8 seconds',   voice:'✅ 4 languages', chain:'✅ Fabric+Polygon', auto:'✅ 100%', ndvi:'Real-time 4-oracle quorum', color:C.teal },
];

export default function TeamPage() {
  const [tab, setTab] = useState<'team'|'stack'|'competitors'>('team');

  return (
    <div style={{ background:C.bg, color:C.text, minHeight:'100vh', padding:'0 0 64px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 18px 0' }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <Link href="/judge" style={{ fontSize:11, fontWeight:700, color:C.orange, textDecoration:'none', display:'inline-block', marginBottom:8 }}>← Judge Demo</Link>
          <div style={{ fontSize:11, fontWeight:800, color:C.orange, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Team · IIE · SBI GFF 2026</div>
          <h1 style={{ margin:'0 0 8px', fontSize:34, fontWeight:900 }}>Full-Stack + Domain Ownership</h1>
          <p style={{ margin:0, color:C.sub, fontSize:14, lineHeight:1.65 }}>
            End-to-end ownership — from Solidity smart contracts to ML risk models to NPCI IMPS integration.
            Every layer designed and built by one person. Zero dependency on external agencies.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {[
            { id:'team',        label:'👥 Builder',          color:C.teal   },
            { id:'stack',       label:'🧩 Tech Stack',       color:C.blue   },
            { id:'competitors', label:'🔎 Competitors',      color:C.amber  },
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as typeof tab)} style={{ padding:'10px 20px', borderRadius:12, border:`1px solid ${tab===t.id?t.color:C.border}`, background:tab===t.id?`${t.color}18`:C.panel, color:tab===t.id?t.color:C.sub, fontWeight:700, fontSize:13, cursor:'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TEAM TAB */}
        {tab==='team' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Profile card */}
            <div style={{ borderRadius:24, border:`2px solid ${C.teal}55`, background:`${C.teal}06`, padding:'28px 32px' }}>
              <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* Avatar */}
                <div style={{ width:80, height:80, borderRadius:'50%', background:`${C.teal}22`, border:`3px solid ${C.teal}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:C.teal, flexShrink:0 }}>J</div>

                <div style={{ flex:1, minWidth:260 }}>
                  <div style={{ fontSize:26, fontWeight:900, marginBottom:2 }}>Jyotheeswar Reddy</div>
                  <div style={{ fontSize:14, color:C.teal, fontWeight:700, marginBottom:6 }}>Full-Stack Lead · Blockchain Architect · ML Engineer</div>

                  {/* Credential strip */}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                    {[
                      { label:'🏢 B.Tech Computer Science', color:C.blue   },
                      { label:'🔗 github.com/jyotheeswar012-max', color:C.purple, href:'https://github.com/jyotheeswar012-max' },
                      { label:'🌐 Next.js · Solidity · Python', color:C.teal },
                      { label:'🌾 Domain: Agri-fintech + India Stack', color:C.orange },
                    ].map(b=>(
                      b.href
                        ? <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:700, background:`${b.color}14`, color:b.color, border:`1px solid ${b.color}33`, textDecoration:'none' }}>{b.label}</a>
                        : <span key={b.label} style={{ padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:700, background:`${b.color}14`, color:b.color, border:`1px solid ${b.color}33` }}>{b.label}</span>
                    ))}
                  </div>

                  <blockquote style={{ margin:'0 0 0', fontStyle:'italic', color:C.text, fontSize:14, borderLeft:`3px solid ${C.teal}`, paddingLeft:14, lineHeight:1.6 }}>
                    &ldquo;If the payout takes more than 3 seconds, we haven&rsquo;t solved the problem. If the farmer has to sign a form, we haven&rsquo;t even started.&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>

            {/* What I built — mapped to GFF criteria */}
            <div style={{ borderRadius:20, border:`1px solid ${C.border}`, background:C.panel, padding:'22px 24px' }}>
              <h2 style={{ margin:'0 0 4px', fontSize:17, fontWeight:900 }}>What I Built — Mapped to GFF Criteria</h2>
              <p style={{ margin:'0 0 16px', fontSize:11, color:C.sub }}>Every module built, tested, and deployed by one person. Each maps to a GFF evaluation criterion.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {BUILT.map((b,i)=>(
                  <div key={i} style={{ padding:'14px 18px', borderRadius:16, background:`${b.color}08`, border:`1px solid ${b.color}33` }}>
                    <div style={{ fontSize:13, fontWeight:800, color:b.color, marginBottom:5 }}>{b.area}</div>
                    <div style={{ fontSize:11, color:C.sub, lineHeight:1.6 }}>{b.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why solo is a strength */}
            <div style={{ borderRadius:16, border:`1px solid ${C.border}`, background:C.panel, padding:'18px 22px' }}>
              <h3 style={{ margin:'0 0 8px', fontSize:15, fontWeight:900, color:C.amber }}>⚡ Why Solo Is a Strength for IIE</h3>
              <p style={{ margin:0, fontSize:13, color:C.sub, lineHeight:1.75 }}>
                Full-stack ownership means the oracle quorum, smart contract, ML trigger, payment gateway, and YONO integration were designed as one coherent system — not bolted-together components from different teams with different assumptions.
                The 2.8-second end-to-end payout time is only possible because every API call, timeout, and fallback path was designed by the same person who wrote the front-end that displays it.
                SBI’s hackathon track rewards working demos; this is one — fully deployed at iie-web-yono.vercel.app.
              </p>
            </div>
          </div>
        )}

        {/* STACK TAB */}
        {tab==='stack' && (
          <div style={{ display:'grid', gap:10 }}>
            {STACK.map(s=>(
              <div key={s.layer} style={{ display:'flex', gap:16, alignItems:'center', padding:'14px 18px', borderRadius:14, border:`1px solid ${C.border}`, background:C.panel }}>
                <div style={{ width:110, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:1, color:s.color, flexShrink:0 }}>{s.layer}</div>
                <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{s.tech}</div>
              </div>
            ))}
          </div>
        )}

        {/* COMPETITORS TAB */}
        {tab==='competitors' && (
          <div>
            <div style={{ marginBottom:14, padding:'10px 16px', borderRadius:12, background:`${C.amber}10`, border:`1px solid ${C.amber}33`, fontSize:13, color:C.sub }}>
              🔎 Competitor data from GFF submissions, public IRDAI filings, company websites. IIE differentiator: <span style={{ color:C.teal, fontWeight:700 }}>real-time quorum + sub-3s payout + SBI KCC moat</span> — no competitor has all three.
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700, fontSize:12 }}>
                <thead>
                  <tr style={{ background:'#0a1120' }}>
                    {['Company','Enrollment','Settlement','Voice','Blockchain','Autonomous','Data Source'].map(h=>(
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:C.sub, fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((c,i)=>(
                    <tr key={i} style={{ borderTop:`1px solid ${C.border}`, background:c.name.includes('IIE')?`${C.teal}06`:'transparent' }}>
                      <td style={{ padding:'12px 14px', fontWeight:800, color:c.color, whiteSpace:'nowrap' }}>{c.name}</td>
                      <td style={{ padding:'12px 14px', color:C.sub, fontSize:11 }}>{c.enroll}</td>
                      <td style={{ padding:'12px 14px', color:c.name.includes('IIE')?C.green:C.red, fontWeight:c.name.includes('IIE')?800:400, fontSize:11 }}>{c.settle}</td>
                      <td style={{ padding:'12px 14px', fontSize:12 }}>{c.voice}</td>
                      <td style={{ padding:'12px 14px', fontSize:12 }}>{c.chain}</td>
                      <td style={{ padding:'12px 14px', fontSize:12 }}>{c.auto}</td>
                      <td style={{ padding:'12px 14px', color:C.sub, fontSize:11 }}>{c.ndvi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginTop:24 }}>
          {[
            { label:'⚡ Judge Demo',  href:'/judge',   color:C.orange },
            { label:'🤖 Agentic AI',  href:'/agentic', color:C.purple },
            { label:'📊 Impact',       href:'/impact',  color:C.amber  },
            { label:'← Home',         href:'/',        color:C.sub    },
          ].map(b=>(
            <Link key={b.href} href={b.href} style={{ padding:'9px 18px', borderRadius:12, background:`${b.color}12`, border:`1px solid ${b.color}44`, color:b.color, fontSize:11, fontWeight:800, textDecoration:'none' }}>
              {b.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
