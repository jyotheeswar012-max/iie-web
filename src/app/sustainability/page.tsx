'use client';
import { useState } from 'react';

const C = {
  bg: '#030712', panel: '#0d1117', border: 'rgba(255,255,255,0.08)',
  text: '#e6edf3', sub: '#7d8590',
  teal: '#64ffda', green: '#3fb950', yellow: '#e3b341', blue: '#82b1ff', red: '#f85149', purple: '#e040fb',
};

const GOALS = [
  {
    icon: '🌍', label: 'NDC 2070 Alignment', color: C.green,
    desc: 'India\'s Nationally Determined Contribution targets net-zero by 2070. IIE accelerates climate-adaptive agriculture by pricing drought and flood risk transparently, incentivising farmers to adopt drought-resistant crops.',
    metrics: [['Crops incentivised', 'Drought-resistant varieties (+12% premium discount)'], ['Risk repriced', 'Live climate data feeds into ICAR model quarterly'], ['Coverage gap', 'Reduces uninsured climate exposure by est. 40%']],
  },
  {
    icon: '🌧', label: 'NAPCC — National Action Plan on Climate Change', color: C.blue,
    desc: 'Aligned with NAPCC Mission for Sustainable Agriculture. Each IIE policy carries a carbon-weighted risk score derived from district-level Sentinel-2 NDVI trend data. High-deforestation districts attract a 0.2% premium uplift that funds ICAR reforestation credit.',
    metrics: [['NDVI trend tracking', '8 districts · daily Sentinel-2 feed'], ['Premium signal', '+0.2% uplift for deforestation-risk zones'], ['ICAR data loop', 'Payout event data fed back to climate model']],
  },
  {
    icon: '🌱', label: 'Soil Health & FPO Incentives', color: C.teal,
    desc: 'FPO group policies include a Soil Health Rider: groups that maintain ICAR soil health card score above 7.5 receive a 5% premium rebate the following year. This creates a direct financial incentive for regenerative farming.',
    metrics: [['Soil health threshold', 'ICAR score ≥ 7.5 for rebate'], ['Rebate', '5% premium reduction year-2'], ['FPO coverage', 'Up to 500 members per group policy']],
  },
  {
    icon: '☀️', label: 'Paris Agreement SDG 13', color: C.yellow,
    desc: 'SDG 13: Climate Action. Parametric insurance is the most capital-efficient climate adaptation tool for smallholders. IIE brings it to 120 million unreached farmers with zero paperwork, reducing the protection gap that the UNEP Adaptation Gap Report highlights.',
    metrics: [['SDG target', '13.1 — Climate resilience & adaptive capacity'], ['Protection gap', '120M uninsured smallholders addressed'], ['UNEP alignment', 'Parametric model endorsed in Adaptation Gap 2024']],
  },
  {
    icon: '📊', label: 'Carbon-Weighted Risk Score', color: C.purple,
    desc: 'Each policy at enrollment is assigned a Carbon Risk Index (CRI) = 0.4×NDVI_deficit + 0.3×rainfall_anomaly + 0.3×deforestation_rate. CRI feeds back into next-season premium pricing, creating a real-time climate signal in insurance pricing — a first for Indian crop insurance.',
    metrics: [['CRI formula', '0.4×NDVI + 0.3×rainfall + 0.3×deforestation'], ['Data sources', 'Sentinel-2, IMD, Global Forest Watch'], ['Update frequency', 'Quarterly recompute per district']],
  },
];

export default function SustainabilityPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ borderRadius: 20, background: 'linear-gradient(135deg,#0d1117,#0a1a0d,#0d2a1a)', border: `1px solid ${C.border}`, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.green, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Climate Resilience · IIE</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900 }}>Sustainability & Climate Alignment</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.sub }}>IIE is not just InsurTech — it is a climate infrastructure layer for Indian agriculture. Every policy prices climate risk in real time, incentivises resilience, and feeds data back to national climate models.</p>
        </div>

        {/* SDG badges */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['SDG 1 — No Poverty', 'SDG 2 — Zero Hunger', 'SDG 13 — Climate Action', 'SDG 17 — Partnerships'].map(b => (
            <span key={b} style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${C.green}44`, background: `${C.green}10`, color: C.green, fontSize: 11, fontWeight: 800 }}>{b}</span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{ borderRadius: 16, border: `1px solid ${open === i ? g.color : C.border}`, background: open === i ? `${g.color}06` : C.panel, overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>{g.icon}</span>
                <span style={{ flex: 1, fontWeight: 800, fontSize: 15, color: open === i ? g.color : C.text }}>{g.label}</span>
                <span style={{ color: C.sub }}>{open === i ? '▲' : '▼'}</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>{g.desc}</p>
                  <div style={{ borderRadius: 12, background: '#0d1117', border: `1px solid ${C.border}`, padding: 14 }}>
                    {g.metrics.map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 12, gap: 12 }}>
                        <span style={{ color: C.sub, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontWeight: 700, color: C.text, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
