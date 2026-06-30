'use client';
import { useState } from 'react';

const C = {
  bg: '#030712', panel: '#0d1117', border: 'rgba(255,255,255,0.08)',
  text: '#e6edf3', sub: '#7d8590',
  teal: '#64ffda', green: '#3fb950', yellow: '#e3b341', blue: '#82b1ff', red: '#f85149', purple: '#e040fb',
};

const TEAM = [
  {
    name: 'Jyotheeswar',
    role: 'Full-Stack Lead & Blockchain Architect',
    avatar: 'J',
    color: C.teal,
    skills: ['Next.js 15', 'Solidity', 'Hyperledger Fabric', 'TypeScript', 'Node.js'],
    domain: ['Smart contract design', 'Oracle quorum architecture', 'NPCI IMPS integration'],
    quote: '"If the payout takes more than 3 seconds, we haven\'t solved the problem."',
  },
];

const STACK = [
  { layer: 'Frontend',    tech: 'Next.js 15 · TypeScript · TailwindCSS', color: C.blue },
  { layer: 'Backend',     tech: 'Node.js · Prisma ORM · Zod validation', color: C.teal },
  { layer: 'Blockchain',  tech: 'Solidity · Hardhat · Hyperledger Fabric', color: C.purple },
  { layer: 'AI / ML',     tech: 'Whisper ASR · ResNet18 · LangChain', color: C.yellow },
  { layer: 'Data',        tech: 'NASA Earthdata · IMD API · ISRO Bhuvan · ICAR', color: C.green },
  { layer: 'Payments',    tech: 'NPCI IMPS · UPI · PFMS DBT', color: C.red },
  { layer: 'Identity',    tech: 'Aadhaar eKYC · DigiLocker · DPDP-compliant', color: C.teal },
  { layer: 'DevOps',      tech: 'Docker · GitHub Actions CI · Vercel Edge', color: C.sub },
];

const COMPETITORS = [
  {
    name: 'ICICI Lombard Fasal',
    enrollment: 'Agent required',
    settlement: '14–21 days',
    voice: '❌',
    blockchain: '❌',
    autonomous: '❌',
    ndvi: 'Manual field visit',
    color: C.red,
  },
  {
    name: 'Bajaj Allianz Smart Crop',
    enrollment: 'Online form (15 min)',
    settlement: '14 days',
    voice: '❌',
    blockchain: '❌',
    autonomous: 'Partial',
    ndvi: 'Remote sensing (batch)',
    color: C.yellow,
  },
  {
    name: 'SBI General CropShield',
    enrollment: 'Branch / agent',
    settlement: '30+ days',
    voice: '❌',
    blockchain: '❌',
    autonomous: '❌',
    ndvi: 'Manual',
    color: C.yellow,
  },
  {
    name: 'IIE (Ours)',
    enrollment: '40s voice / YONO',
    settlement: '< 3 seconds',
    voice: '✅ Hindi/Telugu/Tamil',
    blockchain: '✅ Hyperledger + Polygon',
    autonomous: '✅ 100% autonomous',
    ndvi: 'Real-time satellite + image AI',
    color: C.teal,
  },
];

export default function TeamPage() {
  const [tab, setTab] = useState<'team' | 'stack' | 'competitors'>('team');
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ borderRadius: 20, background: 'linear-gradient(135deg,#0d1117,#0a0f1e,#1a0d3b)', border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.purple, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Team · IIE · SBI Fintech Fest 2026</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900 }}>Full-Stack + Domain Knowledge</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.sub }}>End-to-end ownership — from Solidity smart contracts to Whisper ASR to NPCI IMPS integration. Zero dependency on external agencies.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ id: 'team', label: '👥 Team', color: C.teal }, { id: 'stack', label: '🧩 Tech Stack', color: C.blue }, { id: 'competitors', label: '🔎 Competitor Tracker', color: C.yellow }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'team' | 'stack' | 'competitors')}
              style={{ padding: '10px 20px', borderRadius: 12, border: `1px solid ${tab === t.id ? t.color : C.border}`, background: tab === t.id ? `${t.color}18` : C.panel, color: tab === t.id ? t.color : C.sub, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'team' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ borderRadius: 20, border: `2px solid ${m.color}44`, background: `${m.color}06`, padding: 28 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${m.color}22`, border: `3px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: m.color, flexShrink: 0 }}>{m.avatar}</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{m.name}</div>
                    <div style={{ fontSize: 13, color: m.color, fontWeight: 700, marginBottom: 12 }}>{m.role}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {m.skills.map(s => <span key={s} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}33` }}>{s}</span>)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {m.domain.map(d => <div key={d} style={{ fontSize: 13, color: C.sub }}>▸ {d}</div>)}
                    </div>
                    <div style={{ fontStyle: 'italic', color: C.text, fontSize: 14, borderLeft: `3px solid ${m.color}`, paddingLeft: 14 }}>{m.quote}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel, padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Why Solo is a Strength Here</div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>Full-stack ownership means zero coordination overhead. Every layer — smart contract, oracle ingestion, IMPS settlement, YONO UI, AI voice parser — was designed as an integrated system, not bolted-together components. The architecture is coherent because one mind held all the constraints simultaneously.</div>
            </div>
          </div>
        )}

        {tab === 'stack' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {STACK.map(s => (
              <div key={s.layer} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 18px', borderRadius: 14, border: `1px solid ${C.border}`, background: C.panel }}>
                <div style={{ width: 110, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: s.color, flexShrink: 0 }}>{s.layer}</div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{s.tech}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'competitors' && (
          <div>
            <div style={{ marginBottom: 14, padding: '10px 16px', borderRadius: 12, background: `${C.yellow}10`, border: `1px solid ${C.yellow}33`, fontSize: 13, color: C.sub }}>
              🔎 Competitor intelligence from GFF / public filings. Our differentiation: <span style={{ color: C.teal, fontWeight: 700 }}>zero paperwork + 100% agent autonomy</span> — no competitor offers both.
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr>
                    {['Company', 'Enrollment', 'Settlement', 'Voice Input', 'Blockchain', 'Autonomous', 'NDVI Method'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: C.sub, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map(c => (
                    <tr key={c.name} style={{ background: c.name === 'IIE (Ours)' ? `${C.teal}08` : 'transparent' }}>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontWeight: 800, color: c.color }}>{c.name}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.sub }}>{c.enrollment}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: c.name === 'IIE (Ours)' ? C.green : C.red, fontWeight: c.name === 'IIE (Ours)' ? 800 : 400 }}>{c.settlement}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{c.voice}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{c.blockchain}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{c.autonomous}</td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.sub }}>{c.ndvi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
