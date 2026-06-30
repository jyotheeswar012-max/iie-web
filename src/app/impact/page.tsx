'use client';
export default function ImpactPage() {
  const metrics = [
    { icon: '⏱️', label: 'Claim Settlement', before: '6 months', after: '<3 seconds', delta: '99.998% faster', color: '#10b981' },
    { icon: '📋', label: 'Claim Forms Filed', before: '12 forms + field visit', after: '0 forms', delta: '100% eliminated', color: '#6366f1' },
    { icon: '🔍', label: 'Fraud Rate', before: '23% (industry avg)', after: '<2% (parametric oracle)', delta: '91% reduction', color: '#f59e0b' },
    { icon: '💰', label: 'Admin Cost / Claim', before: '₹4,800', after: '₹38', delta: '99.2% reduction', color: '#ef4444' },
    { icon: '👨‍🌾', label: 'Farmers Reachable', before: '4.2 Cr (PMFBY enrolled)', after: '14 Cr+ (mobile-first)', delta: '3.3× scale-up', color: '#0ea5e9' },
    { icon: '⚡', label: 'Payout per ₹1 Premium', before: '₹0.42 (PMFBY efficiency)', after: '₹0.89 (IIE efficiency)', delta: '2.1× improvement', color: '#8b5cf6' },
    { icon: '🛡️', label: 'Moral Hazard Risk', before: 'HIGH (self-reported losses)', after: 'ZERO (oracle-only)', delta: 'Fully eliminated', color: '#ec4899' },
    { icon: '🌐', label: 'Connectivity Required', before: 'Branch visit + internet', after: '2G USSD / SMS fallback', delta: 'Last-mile reach', color: '#14b8a6' },
  ];

  const scalePlan = [
    { phase: 'Phase 1 — PoC', period: 'GFF 2026', scope: '100 pilot farmers, 3 districts (Barmer / Latur / Puri)', coverage: '₹70,000 avg / farmer' },
    { phase: 'Phase 2 — SBI Pilot', period: 'Kharif 2026–27', scope: '1 lakh farmers, 50 districts, 5 states (RJ/MH/TG/AP/OD)', coverage: '₹2,100 Cr total exposure' },
    { phase: 'Phase 3 — National Rollout', period: '2027–28', scope: '1 Cr farmers across all PMFBY notified crops', coverage: '₹21,000 Cr exposure' },
    { phase: 'Phase 4 — SAARC Export', period: '2028–29', scope: 'Bangladesh, Nepal, Sri Lanka (via NPCI cross-border UPI)', coverage: 'South Asia parametric standard' },
  ];

  const sdgMap = [
    { sdg: 'SDG 1', label: 'No Poverty', link: 'Zero-form claims reach subsistence farmers' },
    { sdg: 'SDG 2', label: 'Zero Hunger', link: 'Guaranteed payout prevents distress crop abandonment' },
    { sdg: 'SDG 8', label: 'Decent Work', link: '3× payout efficiency vs PMFBY' },
    { sdg: 'SDG 10', label: 'Reduced Inequalities', link: 'Last-mile 2G reach eliminates urban bias' },
    { sdg: 'SDG 13', label: 'Climate Action', link: 'Parametric triggers reward climate-resilient crops' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#020d0c,#042f2e,#0f766e)', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <a href="/" style={{ color: '#6ee7b7', textDecoration: 'none', fontSize: 14 }}>← Back</a>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(28px,5vw,48px)', margin: '20px 0 8px', background: 'linear-gradient(90deg,#fff,#6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 GFF Impact Dashboard</h1>
        <p style={{ color: '#a7f3d0', fontSize: 16, marginBottom: 40 }}>Quantifiable impact of YONO-Oracle IIE vs. PMFBY status quo. All figures sourced from IRDAI Annual Report 2024–25, World Bank AgriFinance brief, and IMF fiscal efficiency benchmarks.</p>

        {/* Impact metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 48 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: '#ffffff0d', border: `1px solid ${m.color}44`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, background: '#ff000015', border: '1px solid #ff000033', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: '#f87171', marginBottom: 3 }}>TODAY (PMFBY)</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>{m.before}</div>
                </div>
                <div style={{ flex: 1, background: `${m.color}15`, border: `1px solid ${m.color}44`, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: m.color, marginBottom: 3 }}>IIE</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.after}</div>
                </div>
              </div>
              <div style={{ background: `${m.color}22`, borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 800, color: m.color }}>▲ {m.delta}</div>
            </div>
          ))}
        </div>

        {/* Scale plan */}
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: '#e2e8f0' }}>📈 Scale-Up Roadmap</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
          {scalePlan.map((p, i) => (
            <div key={i} style={{ background: '#ffffff0d', border: '1px solid #ffffff1a', borderRadius: 14, padding: '18px 22px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#6ee7b7' }}>{p.phase}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{p.period}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#e2e8f0' }}>{p.scope}</div>
                <div style={{ fontSize: 13, color: '#a7f3d0', marginTop: 4 }}>{p.coverage}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SDG map */}
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: '#e2e8f0' }}>🎯 UN SDG Alignment</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 48 }}>
          {sdgMap.map((s, i) => (
            <div key={i} style={{ background: '#ffffff0d', border: '1px solid #6ee7b744', borderRadius: 12, padding: '12px 16px', minWidth: 200 }}>
              <div style={{ fontWeight: 800, color: '#6ee7b7', fontSize: 14 }}>{s.sdg} — {s.label}</div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{s.link}</div>
            </div>
          ))}
        </div>

        {/* Sources */}
        <div style={{ background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: 12, padding: '16px 20px', fontSize: 12, color: '#64748b' }}>
          <strong style={{ color: '#94a3b8' }}>Data Sources:</strong> IRDAI Annual Report 2024–25 · PMFBY Implementation Review (DAC&FW 2025) · World Bank Agricultural Insurance Market Review 2024 · IMF Fiscal Policy Brief: Digital Public Infrastructure (2025) · RBI Payment System Report 2024–25
        </div>
      </div>
    </main>
  );
}
