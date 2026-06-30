'use client';
import Link from 'next/link';

const LAYERS = [
  {
    title: 'Identity Layer', color: '#64ffda',
    items: [
      { icon:'🆔', name:'Aadhaar eKYC OTP',    detail:'Instant biometric verification · no physical documents · DPDP compliant' },
      { icon:'📁', name:'DigiLocker Land RoR', detail:'Khasra/Khatauni auto-fetched · verifies acreage without field visit' },
      { icon:'📱', name:'GSMA SIM Binding',    detail:'Mobile number linked to Aadhaar · OTP 2FA · SMS payout alerts' },
    ],
  },
  {
    title: 'Payments Layer', color: '#3fb950',
    items: [
      { icon:'💳', name:'UPI / IMPS',          detail:'Instant payout to farmer UPI VPA · NPCI UTR generated · < 3 seconds' },
      { icon:'🏛️', name:'NPCI UTR',           detail:'Unique Transaction Reference · immutable payment proof on NPCI ledger' },
      { icon:'🌾', name:'PM-FASAL Subsidy',  detail:'30% govt subsidy auto-applied at enrollment · DBT routed via PFMS' },
    ],
  },
  {
    title: 'Oracle / Data Layer', color: '#82b1ff',
    items: [
      { icon:'🛰️', name:'NASA MODIS NDVI',   detail:'Vegetation index · drought detection threshold 0.30 · 250m resolution' },
      { icon:'🌧️', name:'IMD Rainfall API',  detail:'District 24hr rainfall · flood threshold 200mm · official GoI data' },
      { icon:'🌡️', name:'ISRO Bhuvan',       detail:'Land surface temp · heatwave threshold 45°C · 1km resolution' },
      { icon:'🌱', name:'ICAR Soil Sensors',  detail:'Volumetric soil moisture · wilting point 15% · ICAR-IARI network' },
    ],
  },
  {
    title: 'Audit / Ledger Layer', color: '#e040fb',
    items: [
      { icon:'⛓️', name:'SHA-256 Audit Chain', detail:'Every event hashed + chained · tamper-evident · regulator-accessible' },
      { icon:'📜', name:'Polygon Smart Contract', detail:'SPDX MIT license · on-chain payout execution · EVM-compatible' },
      { icon:'🗃️', name:'Hyperledger Fabric', detail:'SBI private permissioned chain · IRDAI audit queries direct' },
    ],
  },
];

const FLOW = [
  { step:'Farmer enrolls via YONO',    detail:'Aadhaar OTP + DigiLocker RoR + PM-FASAL subsidy applied', icon:'📋' },
  { step:'Smart contract deployed',    detail:'Policy ID minted on-chain · coverage + trigger params encoded', icon:'⛓️' },
  { step:'Oracles fetch real-time data', detail:'NASA NDVI + IMD rain + ISRO temp + ICAR soil moisture', icon:'🛰️' },
  { step:'4-agent AI quorum votes',    detail:'Weighted confidence ≥ 75% triggers contract state change', icon:'🤖' },
  { step:'IMPS payout ≤ 3 seconds',    detail:'UPI VPA credit · RRN generated · SMS to farmer · audit logged', icon:'💸' },
];

export default function IndiaStackPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="rounded-2xl p-8 mb-8 grid-bg" style={{ background:'linear-gradient(135deg,#030712,#0a0e27,#1a0533)', border:'1px solid rgba(224,64,251,0.15)' }}>
        <div className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color:'#e040fb' }}>Built on India Stack · Aadhaar · UPI · DigiLocker · PM-FASAL</div>
        <h1 className="text-4xl font-black gradient-text mb-2">🇮🇳 India Stack Integration</h1>
        <p className="text-white/50 text-sm max-w-2xl">IIE is not a standalone app — it is a layer built entirely on India’s digital public infrastructure. Every enrollment, every oracle fetch, every payout flows through sovereign Indian systems.</p>
      </div>

      {/* Layer cards */}
      <div className="space-y-6 mb-8">
        {LAYERS.map((layer, li) => (
          <div key={li} className="bg-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-[#21262d]" style={{ background:`${layer.color}0d` }}>
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

      {/* End-to-end flow */}
      <div className="glass p-6 mb-8">
        <h2 className="font-black text-[#e6edf3] mb-5">End-to-End Flow via India Stack</h2>
        <div className="space-y-3">
          {FLOW.map((f, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background:'rgba(100,255,218,0.12)', border:'1px solid rgba(100,255,218,0.3)', color:'#64ffda' }}>{i+1}</div>
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
      <div className="rounded-2xl p-6 mb-8" style={{ background:'rgba(248,81,73,0.06)', border:'1px solid rgba(248,81,73,0.2)' }}>
        <h3 className="font-black text-[#f85149] mb-2">🔒 Privacy & DPDP Compliance</h3>
        <p className="text-sm text-[#7d8590] leading-relaxed">
          IIE stores only Aadhaar hash (SHA-256, one-way) — never plaintext UID. Land records are fetched at enrollment and discarded post-verification.
          All data flows comply with India’s <b className="text-[#e6edf3]">Digital Personal Data Protection Act 2023</b> and IRDAI data localisation norms.
          NPCI UTR and UPI refs are retained for 7 years per RBI audit requirements.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Link href="/demo" className="px-8 py-3 rounded-xl font-bold text-sm text-[#030712]" style={{ background:'linear-gradient(135deg,#64ffda,#3fb950)' }}>⚡ See It Live in Demo</Link>
        <Link href="/architecture" className="px-6 py-3 rounded-xl font-bold text-sm text-[#e6edf3]" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)' }}>🏗️ Architecture</Link>
      </div>
    </div>
  );
}
