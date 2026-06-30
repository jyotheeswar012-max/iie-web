'use client';
import Link from 'next/link';
import { useState } from 'react';

const LAYERS = [
  {
    title: 'Identity Layer', color: '#64ffda',
    items: [
      { icon: '🆔', name: 'Aadhaar eKYC OTP',    detail: 'Instant biometric verification · no physical documents · DPDP compliant' },
      { icon: '📁', name: 'DigiLocker Land RoR', detail: 'Khasra/Khatauni auto-fetched · verifies acreage without field visit' },
      { icon: '📱', name: 'GSMA SIM Binding',    detail: 'Mobile number linked to Aadhaar · OTP 2FA · SMS payout alerts' },
    ],
  },
  {
    title: 'Payments Layer', color: '#3fb950',
    items: [
      { icon: '💳', name: 'UPI / IMPS',          detail: 'Instant payout to farmer UPI VPA · NPCI UTR generated · < 3 seconds' },
      { icon: '🏛️', name: 'NPCI UTR',           detail: 'Unique Transaction Reference · immutable payment proof on NPCI ledger' },
      { icon: '🌾', name: 'PM-FASAL Subsidy',   detail: '30% govt subsidy auto-applied at enrollment · DBT routed via PFMS' },
    ],
  },
  {
    title: 'Oracle / Data Layer', color: '#82b1ff',
    items: [
      { icon: '🛰️', name: 'NASA MODIS NDVI',   detail: 'Vegetation index · drought detection threshold 0.30 · 250m resolution' },
      { icon: '🌧️', name: 'IMD Rainfall API',  detail: 'District 24hr rainfall · flood threshold 200mm · official GoI data' },
      { icon: '🌡️', name: 'ISRO Bhuvan',       detail: 'Land surface temp · heatwave threshold 45°C · 1km resolution' },
      { icon: '🌱', name: 'ICAR Soil Sensors',  detail: 'Volumetric soil moisture · wilting point 15% · ICAR-IARI network' },
    ],
  },
  {
    title: 'Audit / Ledger Layer', color: '#e040fb',
    items: [
      { icon: '⛓️', name: 'SHA-256 Audit Chain', detail: 'Every event hashed + chained · tamper-evident · regulator-accessible' },
      { icon: '📜', name: 'Polygon Smart Contract', detail: 'SPDX MIT license · on-chain payout execution · EVM-compatible' },
      { icon: '🗃️', name: 'Hyperledger Fabric', detail: 'SBI private permissioned chain · IRDAI audit queries direct' },
    ],
  },
];

const FLOW = [
  { step: 'Farmer enrolls via YONO',     detail: 'Aadhaar OTP + DigiLocker RoR + PM-FASAL subsidy applied', icon: '📋' },
  { step: 'Smart contract deployed',     detail: 'Policy ID minted on-chain · coverage + trigger params encoded', icon: '⛓️' },
  { step: 'Oracles fetch real-time data', detail: 'NASA NDVI + IMD rain + ISRO temp + ICAR soil moisture', icon: '🛰️' },
  { step: '4-agent AI quorum votes',     detail: 'Weighted confidence >= 75% triggers contract state change', icon: '🤖' },
  { step: 'IMPS payout <= 3 seconds',    detail: 'UPI VPA credit · RRN generated · SMS to farmer · audit logged', icon: '💸' },
];

// ── Consent Flow Simulator ────────────────────────────────────────────────────

const CONSENT_ITEMS = [
  { id: 'c1', label: 'Aadhaar number (stored as SHA-256 hash only — never plaintext)', required: true, icon: '🆔' },
  { id: 'c2', label: 'Name + district from UIDAI for policy issuance', required: true, icon: '👤' },
  { id: 'c3', label: 'Land records (Khasra/Khatauni) via DigiLocker — discarded post-verification', required: true, icon: '📄' },
  { id: 'c4', label: 'PM-FASAL subsidy eligibility via PFMS lookup', required: false, icon: '🌾' },
  { id: 'c5', label: 'SMS/push notifications for oracle triggers and payouts', required: false, icon: '📱' },
];

function ConsentSimulator() {
  const [consents, setConsents] = useState<Record<string, boolean>>({ c1: false, c2: false, c3: false, c4: false, c5: false });
  const [submitted, setSubmitted] = useState(false);
  const [txHash] = useState('0x' + Math.random().toString(16).slice(2, 12) + '...');

  const allRequired = CONSENT_ITEMS.filter(c => c.required).every(c => consents[c.id]);
  const toggle = (id: string) => !submitted && setConsents(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden mb-8">
      <div className="px-6 py-3 border-b border-[#21262d]" style={{ background: '#64ffda0d' }}>
        <h2 className="font-black text-sm" style={{ color: '#64ffda' }}>Interactive Consent Flow Simulator — DPDP Act 2023</h2>
      </div>
      <div className="p-6">
        {!submitted ? (
          <>
            <p className="text-xs text-[#7d8590] mb-4 leading-relaxed">
              YONO Kisan Insurance requests the following data under <b className="text-[#e6edf3]">Section 6, DPDP Act 2023</b>. Required items cannot be unchecked. You may withdraw consent at any time via YONO Settings.
            </p>
            <div className="space-y-3 mb-5">
              {CONSENT_ITEMS.map(item => (
                <div key={item.id}
                  onClick={() => !item.required && toggle(item.id)}
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                  style={{ background: consents[item.id] ? '#64ffda0d' : '#161b22', border: `1px solid ${consents[item.id] ? '#64ffda33' : '#21262d'}`, cursor: item.required ? 'default' : 'pointer' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${consents[item.id] ? '#64ffda' : '#444'}`, background: consents[item.id] ? '#64ffda' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                    {consents[item.id] && <span style={{ fontSize: 11, color: '#030712', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-sm text-[#e6edf3]">{item.label}</span>
                      {item.required && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#ff000022', color: '#ff7b72' }}>Required</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setConsents({ c1: true, c2: true, c3: true, c4: true, c5: true }); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }}>Accept All</button>
              <button
                onClick={() => allRequired && setSubmitted(true)}
                disabled={!allRequired}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: allRequired ? 'linear-gradient(135deg,#64ffda,#3fb950)' : '#21262d', color: allRequired ? '#030712' : '#555', border: 'none', cursor: allRequired ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>Submit Consent</button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <div className="font-black text-[#64ffda] text-base mb-1">Consent Recorded On-Chain</div>
            <div className="text-xs text-[#7d8590] mb-4">Logged under DPDP Act 2023 · Consent ID: <span className="font-mono text-[#e6edf3]">{txHash}</span></div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[['Timestamp', new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST'], ['Basis', 'Explicit consent (Sec 6 DPDP)'], ['Stored', 'Hyperledger Fabric block'], ['Retention', '7 years (RBI mandate)'], ['Withdrawal', 'YONO Settings > Data & Privacy'], ['Grievance', 'dpo@sbiyono.in']
              ].map(([k, v]) => (
                <div key={k} className="bg-[#161b22] rounded-xl p-3">
                  <div className="text-xs text-[#7d8590] mb-1">{k}</div>
                  <div className="text-xs font-bold text-[#e6edf3] font-mono break-all">{v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setSubmitted(false); setConsents({ c1: false, c2: false, c3: false, c4: false, c5: false }); }}
              className="mt-4 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: '#21262d', color: '#7d8590', border: '1px solid #30363d' }}>Reset Simulator</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DigiLocker Simulator ─────────────────────────────────────────────────────────────

const DL_DOCS = [
  { icon: '📄', name: 'Khasra / Khatauni', issuer: 'State Revenue Dept, Rajasthan', id: 'RJ-BR-2024-00482', fields: [['Farmer Name', 'Ramesh Kumar'], ['Survey No', '482/1'], ['Area', '4.5 Acres'], ['Crop Season', 'Kharif 2024'], ['District', 'Barmer']], color: '#64ffda' },
  { icon: '🏛️', name: 'Revenue Record (RoR)', issuer: 'Tehsildar Office, Barmer', id: 'RJ-REV-004821', fields: [['Owner', 'Ramesh Kumar'], ['Khata No', 'KH-0482'], ['Encumbrance', 'NIL'], ['Last Updated', 'Mar 2025'], ['Stamp', 'Verified']], color: '#82b1ff' },
  { icon: '🌾', name: 'PM-FASAL Registration', issuer: 'PMFBY Portal / Agri Ministry', id: 'PMFBY-2024-RJ-8821', fields: [['Scheme', 'PMFBY 2024-25'], ['Subsidy', '30% of premium'], ['Crop', 'Wheat'], ['Season', 'Rabi 2024-25'], ['Status', 'ACTIVE']], color: '#3fb950' },
];

function DigiLockerSimulator() {
  const [phase, setPhase] = useState<'idle' | 'auth' | 'fetching' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const startFetch = () => {
    setPhase('auth');
    setTimeout(() => {
      setPhase('fetching');
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setProgress(p);
        if (p >= 100) { clearInterval(interval); setPhase('done'); }
      }, 300);
    }, 1200);
  };

  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden mb-8">
      <div className="px-6 py-3 border-b border-[#21262d]" style={{ background: '#82b1ff0d' }}>
        <h2 className="font-black text-sm" style={{ color: '#82b1ff' }}>DigiLocker Document Fetch — Mock Simulator</h2>
      </div>
      <div className="p-6">
        {phase === 'idle' && (
          <>
            <p className="text-xs text-[#7d8590] mb-4">Simulates the MeitY DigiLocker API call to fetch land records for crop insurance enrollment. In production, this uses OAuth 2.0 with the farmer's Aadhaar-linked DigiLocker account.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {DL_DOCS.map((doc, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: '#161b22', border: `1px solid ${doc.color}22` }}>
                  <div className="text-2xl mb-2">{doc.icon}</div>
                  <div className="text-xs font-bold text-[#e6edf3] mb-1">{doc.name}</div>
                  <div className="text-xs text-[#7d8590]">{doc.issuer}</div>
                  <div className="text-xs font-mono mt-2" style={{ color: doc.color }}>{doc.id}</div>
                </div>
              ))}
            </div>
            <button onClick={startFetch}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #1a5276, #2e86c1)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Fetch Documents from DigiLocker
            </button>
          </>
        )}
        {phase === 'auth' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <div className="font-bold text-[#e6edf3] mb-2">Authenticating with MeitY DigiLocker...</div>
            <div className="text-xs text-[#7d8590]">OAuth 2.0 · Aadhaar-linked account · Consent token verified</div>
          </div>
        )}
        {phase === 'fetching' && (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📡</div>
            <div className="font-bold text-[#e6edf3] mb-4">Fetching Documents...</div>
            <div className="w-full bg-[#21262d] rounded-full h-2 mb-3">
              <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #64ffda, #3fb950)' }} />
            </div>
            <div className="text-xs text-[#7d8590]">{progress}% complete</div>
          </div>
        )}
        {phase === 'done' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✅</span>
              <span className="font-black text-[#3fb950]">All documents verified via DigiLocker</span>
            </div>
            <div className="space-y-3">
              {DL_DOCS.map((doc, i) => (
                <div key={i}>
                  <div
                    onClick={() => setSelected(selected === i ? null : i)}
                    className="rounded-xl p-4 cursor-pointer transition-colors"
                    style={{ background: '#161b22', border: `2px solid ${selected === i ? doc.color : doc.color + '44'}` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{doc.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-[#e6edf3]">{doc.name}</div>
                          <div className="text-xs text-[#7d8590]">{doc.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: doc.color + '22', color: doc.color }}>✓ Verified</span>
                        <span className="text-[#7d8590] text-xs">{selected === i ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {selected === i && (
                      <div className="mt-3 pt-3 border-t border-[#21262d] grid grid-cols-2 gap-2">
                        {doc.fields.map(([k, v]) => (
                          <div key={k}>
                            <div className="text-xs text-[#7d8590]">{k}</div>
                            <div className="text-xs font-bold text-[#e6edf3]">{v}</div>
                          </div>
                        ))}
                        <div className="col-span-2 mt-2 pt-2 border-t border-[#21262d]">
                          <div className="text-xs text-[#7d8590]">Issuer</div>
                          <div className="text-xs font-bold text-[#e6edf3]">{doc.issuer}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: '#ff000011', border: '1px solid #ff000033', color: '#ff7b72' }}>
              🛡️ Land records discarded from IIE servers post-verification · Only acreage hash retained · DPDP Act 2023 compliant
            </div>
            <button onClick={() => { setPhase('idle'); setProgress(0); setSelected(null); }}
              className="mt-3 w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: '#21262d', color: '#7d8590', border: '1px solid #30363d' }}>Reset</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────────
export default function IndiaStackPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="rounded-2xl p-8 mb-8 grid-bg" style={{ background: 'linear-gradient(135deg,#030712,#0a0e27,#1a0533)', border: '1px solid #e040fb26' }}>
        <div className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: '#e040fb' }}>Built on India Stack · Aadhaar · UPI · DigiLocker · PM-FASAL</div>
        <h1 className="text-4xl font-black gradient-text mb-2">India Stack Integration</h1>
        <p className="text-white/50 text-sm max-w-2xl">IIE is not a standalone app — it is a layer built entirely on India's digital public infrastructure. Every enrollment, every oracle fetch, every payout flows through sovereign Indian systems.</p>
        <Link href="/yono" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#1a3a6b,#009999)', color: '#fff', textDecoration: 'none' }}>
          See Full YONO App Flow
        </Link>
      </div>

      {/* Layer cards */}
      <div className="space-y-6 mb-8">
        {LAYERS.map((layer, li) => (
          <div key={li} className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-[#21262d]" style={{ background: `${layer.color}0d` }}>
              <h2 className="font-black text-sm" style={{ color: layer.color }}>{layer.title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#21262d]">
              {layer.items.map((item, ii) => (
                <div key={ii} className="p-5">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-bold text-[#e6edf3] mb-2 text-sm">{item.name}</div>
                  <p className="text-xs text-[#7d8590] leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Consent Simulator */}
      <ConsentSimulator />

      {/* DigiLocker Simulator */}
      <DigiLockerSimulator />

      {/* End-to-end flow */}
      <div className="glass p-6 mb-8">
        <h2 className="font-black text-[#e6edf3] mb-5">End-to-End Flow via India Stack</h2>
        <div className="space-y-3">
          {FLOW.map((f, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: 'rgba(100,255,218,0.12)', border: '1px solid rgba(100,255,218,0.3)', color: '#64ffda' }}>{i + 1}</div>
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="font-bold text-[#e6edf3] text-sm">{f.step}</div>
                  <div className="text-xs text-[#7d8590] mt-0.5">{f.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy / DPDP note */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)' }}>
        <h3 className="font-black text-[#f85149] mb-3">Privacy &amp; DPDP Compliance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[['Data Minimisation', 'Only Aadhaar hash (SHA-256) stored. Land records fetched and discarded post-verification. No UID, no biometrics retained.'],
            ['Consent Architecture', 'Granular per-purpose consent under Section 6 DPDP Act 2023. Logged on Hyperledger Fabric block. Withdrawable anytime via YONO Settings.'],
            ['Data Localisation', 'All data stored on SBI-owned servers within India. No cross-border transfer. Compliant with IRDAI data localisation norms.'],
            ['Retention Policy', 'NPCI UTR and UPI transaction refs retained 7 years per RBI mandate. Aadhaar hash retained for policy duration only.']
          ].map(([title, desc]) => (
            <div key={title} className="bg-[#0d1117] rounded-xl p-4">
              <div className="text-sm font-bold text-[#f85149] mb-2">{title}</div>
              <p className="text-xs text-[#7d8590] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        <Link href="/yono" className="px-8 py-3 rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg,#1a3a6b,#009999)', color: '#fff', textDecoration: 'none' }}>YONO App Simulator</Link>
        <Link href="/demo" className="px-8 py-3 rounded-xl font-bold text-sm text-[#030712]" style={{ background: 'linear-gradient(135deg,#64ffda,#3fb950)', textDecoration: 'none' }}>Live Demo</Link>
        <Link href="/architecture" className="px-6 py-3 rounded-xl font-bold text-sm text-[#e6edf3]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>Architecture</Link>
      </div>
    </div>
  );
}
