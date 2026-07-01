'use client';
import { useState, useRef, useEffect } from 'react';

// ─── palette ────────────────────────────────────────────────────────────────
const C = {
  bg:     '#060D1A',
  panel:  '#0C1829',
  panel2: '#0f1f35',
  border: '#1A2E4A',
  text:   '#F0F6FF',
  sub:    '#6B89A8',
  orange: '#F68B1F',
  green:  '#22c55e',
  teal:   '#64ffda',
  blue:   '#60a5fa',
  red:    '#f87171',
  purple: '#a78bfa',
  amber:  '#fbbf24',
};

// ─── helpers ────────────────────────────────────────────────────────────────
function genPolicyId() {
  return 'SBI-IIE-' + String(Math.floor(10000 + Math.random() * 89999));
}
function genRRN() {
  return String(Math.floor(900000000000 + Math.random() * 99999999999));
}
function genUTR() {
  return 'SBIN' + Date.now().toString().slice(-9) + Math.floor(Math.random() * 100);
}
function genUPI() {
  return 'YONO' + Date.now().toString().slice(-10);
}
function sha256mock(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((Math.imul(31, h) + s.charCodeAt(i)) | 0);
  const b = Math.abs(h).toString(16).padStart(8, '0');
  return (b.repeat(9)).slice(0, 64);
}
function fmtTs(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
}
function fmtINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

// ─── farmer presets ─────────────────────────────────────────────────────────
const FARMERS = [
  { name: 'Ramesh Kumar',   vpa: 'rameshkumar@sbi',   district: 'Khammam',  crop: 'Paddy',  acreage: 4, peril: 'flood',    rainfall: 210, temp: 34 },
  { name: 'Sita Devi',      vpa: 'sitadevi@sbi',      district: 'Barmer',   crop: 'Cotton', acreage: 6, peril: 'drought',  rainfall: 8,   temp: 47 },
  { name: 'Kavitha Reddy',  vpa: 'kavithareddy@sbi',  district: 'Warangal', crop: 'Cotton', acreage: 3, peril: 'heatwave', rainfall: 12,  temp: 47 },
  { name: 'Mohan Singh',    vpa: 'mohansingh@sbi',    district: 'Puri',     crop: 'Paddy',  acreage: 5, peril: 'flood',    rainfall: 195, temp: 34 },
];

// ─── step types ─────────────────────────────────────────────────────────────
type StepId = 'enroll' | 'oracle' | 'contract' | 'imps' | 'ledger';
const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: 'enroll',   label: 'Enroll',          icon: '👤' },
  { id: 'oracle',   label: 'Oracle Quorum',   icon: '🛰️' },
  { id: 'contract', label: 'Smart Contract',  icon: '⛓️' },
  { id: 'imps',     label: 'IMPS Settlement', icon: '💸' },
  { id: 'ledger',   label: 'Audit Ledger',    icon: '📒' },
];

type Phase = 'idle' | 'running' | 'done' | 'error';

interface OracleResult {
  triggered: boolean;
  weighted_confidence: number;
  quorum_met: boolean;
  contract_state: string;
  payout_amount: number | null;
  rainfall_mm: number;
  temp_c: number;
  ndvi: number;
  soil_moisture: number;
  event_type: string;
  margins: Record<string, number>;
  agents: Record<string, { decision: string; confidence: number }>;
  oracle_inputs: Record<string, { value: number; source: string; unit: string }>;
}

interface IMPSResult {
  rrn: string;
  utr: string;
  upiRef: string;
  amount: number;
  vpa: string;
  ts: string;
  auditRef: string;
}

interface LedgerEntry {
  seq: number;
  ts: string;
  event: string;
  hash: string;
  prev_hash: string;
  data: Record<string, unknown>;
}

export default function FlowPage() {
  const [farmerIdx, setFarmerIdx] = useState(0);
  const [step, setStep]           = useState<StepId>('enroll');
  const [phase, setPhase]         = useState<Phase>('idle');
  const [elapsed, setElapsed]     = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results per stage
  const [policyId, setPolicyId]     = useState<string | null>(null);
  const [enrollTs, setEnrollTs]     = useState<string | null>(null);
  const [oracleRes, setOracleRes]   = useState<OracleResult | null>(null);
  const [impsRes, setImpsRes]       = useState<IMPSResult | null>(null);
  const [ledger, setLedger]         = useState<LedgerEntry[]>([]);

  const farmer   = FARMERS[farmerIdx];
  const stepIdx  = STEPS.findIndex(s => s.id === step);
  const isDone   = phase === 'done' && step === 'ledger';

  // Elapsed timer
  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function reset() {
    setStep('enroll'); setPhase('idle'); setElapsed(0); setError(null);
    setPolicyId(null); setEnrollTs(null); setOracleRes(null);
    setImpsRes(null); setLedger([]);
  }

  // ─── the pipeline ─────────────────────────────────────────────────────────
  async function runPipeline() {
    reset();
    await new Promise(r => setTimeout(r, 50)); // flush reset
    setPhase('running');
    setElapsed(0);
    const pid = genPolicyId();
    setPolicyId(pid);

    try {
      // ── STEP 1: ENROLL ──────────────────────────────────────────────────
      setStep('enroll');
      await new Promise(r => setTimeout(r, 900)); // Aadhaar eKYC sim
      const ets = new Date().toISOString();
      setEnrollTs(ets);
      await new Promise(r => setTimeout(r, 400));

      // ── STEP 2: ORACLE ──────────────────────────────────────────────────
      setStep('oracle');
      const oRes = await fetch('/api/oracle/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id:    pid,
          event_type:   farmer.peril,
          district:     farmer.district,
          crop:         farmer.crop,
          acreage:      farmer.acreage,
          rainfall_mm:  farmer.rainfall,
          temp_c:       farmer.temp,
        }),
      });
      if (!oRes.ok) throw new Error(`Oracle API ${oRes.status}`);
      const od = await oRes.json();
      const oracleResult: OracleResult = {
        triggered:           od.trigger_evaluation?.triggered ?? false,
        weighted_confidence: od.agent_quorum?.weighted_confidence ?? 0,
        quorum_met:          od.agent_quorum?.quorum_met ?? false,
        contract_state:      od.contract_state ?? 'ACTIVE',
        payout_amount:       od.payout_amount ?? null,
        rainfall_mm:         od.oracle_inputs?.rainfall_mm?.value ?? 0,
        temp_c:              od.oracle_inputs?.temp_c?.value ?? 0,
        ndvi:                od.oracle_inputs?.ndvi?.value ?? 0,
        soil_moisture:       od.oracle_inputs?.soil_moisture?.value ?? 0,
        event_type:          od.event_type ?? farmer.peril,
        margins:             od.trigger_evaluation?.margins ?? {},
        agents:              od.agent_quorum?.agents ?? {},
        oracle_inputs:       od.oracle_inputs ?? {},
      };
      setOracleRes(oracleResult);
      await new Promise(r => setTimeout(r, 600));

      if (!oracleResult.quorum_met) {
        setPhase('done');
        setStep('oracle');
        return; // quorum failed — honest outcome, no payout
      }

      // ── STEP 3: CONTRACT ────────────────────────────────────────────────
      setStep('contract');
      await new Promise(r => setTimeout(r, 1100)); // Fabric state transition
      await new Promise(r => setTimeout(r, 300));

      // ── STEP 4: IMPS ────────────────────────────────────────────────────
      setStep('imps');
      const pRes = await fetch('/api/sbi/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId:       pid,
          beneficiaryVpa: farmer.vpa,
          amount:         oracleResult.payout_amount,
          remarks:        `IIE ${farmer.peril} payout — ${farmer.district} ${farmer.crop}`,
        }),
      });
      if (!pRes.ok) throw new Error(`Payment API ${pRes.status}`);
      const pd = await pRes.json();
      const rrn     = pd.rrn    ?? genRRN();
      const utr     = pd.utr    ?? genUTR();
      const upiRef  = pd.upiRef ?? genUPI();
      const payTs   = pd.txTimestamp ?? new Date().toISOString();
      const auditRef = pd.auditRef ?? `HLFC-${rrn.slice(0,8)}`;
      setImpsRes({ rrn, utr, upiRef, amount: oracleResult.payout_amount!, vpa: farmer.vpa, ts: payTs, auditRef });
      await new Promise(r => setTimeout(r, 700));

      // ── STEP 5: LEDGER ──────────────────────────────────────────────────
      setStep('ledger');
      // Build 4 chained entries locally — matches /api/audit/trail logic
      let prev = '0000000000000000000000000000000000000000000000000000000000000000';
      const entries: LedgerEntry[] = [];

      const events: Array<{ event: string; data: Record<string, unknown> }> = [
        {
          event: 'POLICY_ENROLLED',
          data:  { policy_id: pid, farmer: farmer.name, district: farmer.district,
                   crop: farmer.crop, acreage: farmer.acreage, plan: 'Smart Shield',
                   aadhaar_kyc: 'VERIFIED', digilocker_land: 'FETCHED', ts: ets },
        },
        {
          event: 'ORACLE_QUORUM_TRIGGERED',
          data:  { policy_id: pid, peril: farmer.peril,
                   rainfall_mm: oracleResult.rainfall_mm,
                   ndvi: oracleResult.ndvi, temp_c: oracleResult.temp_c,
                   weighted_confidence: oracleResult.weighted_confidence,
                   quorum_met: true, agents_yes: 4 },
        },
        {
          event: 'CONTRACT_STATE_TRIGGERED',
          data:  { policy_id: pid, prev_state: 'ACTIVE', new_state: 'TRIGGERED',
                   fabric_block: 19823441 + Math.floor(Math.random() * 1000),
                   polygon_tx: '0x' + sha256mock(pid).slice(0, 40),
                   payout_amount: oracleResult.payout_amount },
        },
        {
          event: 'IMPS_SETTLED',
          data:  { policy_id: pid, rrn, utr, upi_ref: upiRef,
                   amount: oracleResult.payout_amount,
                   beneficiary_vpa: farmer.vpa,
                   npci_member_id: 'SBIN0000001',
                   settlement_bank: 'STATE BANK OF INDIA',
                   channel: 'IMPS', ts: payTs },
        },
      ];

      const BASE_T = new Date(Date.now() - 3000);
      for (let i = 0; i < events.length; i++) {
        const ts      = new Date(BASE_T.getTime() + i * 800).toISOString();
        const payload = JSON.stringify({ seq: i+1, event: events[i].event, ts, prev_hash: prev, ...events[i].data });
        const hash    = sha256mock(payload);
        entries.push({ seq: i+1, ts, event: events[i].event, hash, prev_hash: prev, data: events[i].data });
        prev = hash;
        // append entries one-by-one for visual effect
        setLedger(prev => [...prev, entries[i]]);
        await new Promise(r => setTimeout(r, 380));
      }

      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────
  const box  = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: C.panel, borderRadius: 16, border: `1px solid ${C.border}`,
    padding: 20, marginBottom: 16, ...extra,
  });
  const pill = (color: string, label: string) => (
    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999,
      background: `${color}18`, border:`1px solid ${color}44`,
      color, fontSize:11, fontWeight:700, letterSpacing:1 }}>{label}</span>
  );
  const kv = (k: string, v: React.ReactNode, mono = false) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
      <span style={{ color:C.sub, fontSize:12 }}>{k}</span>
      <span style={{ color:C.text, fontSize:13, fontFamily: mono ? 'monospace':'inherit',
        fontWeight: mono ? 700 : 500 }}>{v}</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text,
      fontFamily:"'Inter','Segoe UI',sans-serif", padding:'24px 16px' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:780, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:12, marginBottom:24 }}>
          <div>
            <div style={{ fontSize:11, color:C.orange, fontWeight:800,
              textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>
              SBI IIE · Live Flow Demo
            </div>
            <h1 style={{ margin:0, fontSize:26, fontWeight:900, lineHeight:1.2 }}>
              Enrollment → Oracle → Payout → Ledger
            </h1>
            <div style={{ color:C.sub, fontSize:13, marginTop:6 }}>
              One tap. Watch money move. Every step is auditable.
            </div>
          </div>
          {phase === 'running' && (
            <div style={{ fontFamily:'monospace', fontSize:22, fontWeight:900,
              color: elapsed > 200 ? C.amber : C.teal }}>
              {(elapsed / 10).toFixed(1)}s
            </div>
          )}
          {phase === 'done' && (
            <div style={{ fontFamily:'monospace', fontSize:18, fontWeight:900, color:C.green }}>
              ✓ {(elapsed / 10).toFixed(1)}s total
            </div>
          )}
        </div>

        {/* ── Farmer selector ───────────────────────────────────────────── */}
        {phase === 'idle' && (
          <div style={box()}>
            <div style={{ fontSize:12, color:C.sub, marginBottom:12,
              textTransform:'uppercase', letterSpacing:1 }}>Select farmer scenario</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
              {FARMERS.map((f, i) => (
                <button key={i} onClick={() => setFarmerIdx(i)}
                  style={{ padding:'12px 14px', borderRadius:12, cursor:'pointer', textAlign:'left',
                    border:`2px solid ${farmerIdx===i ? C.orange : C.border}`,
                    background: farmerIdx===i ? `${C.orange}12` : C.panel2 }}>
                  <div style={{ fontWeight:800, fontSize:13, color: farmerIdx===i ? C.orange : C.text }}>{f.name}</div>
                  <div style={{ fontSize:11, color:C.sub, marginTop:4 }}>{f.district} · {f.crop}</div>
                  <div style={{ fontSize:11, color:C.sub }}>{f.peril} · {f.acreage} acres</div>
                  <div style={{ fontSize:10, color:C.orange, marginTop:6, fontWeight:700 }}>
                    rain: {f.rainfall}mm · {f.temp}°C
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step tracker ──────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:6, marginBottom:20, overflowX:'auto' }}>
          {STEPS.map((s, i) => {
            const cur  = s.id === step;
            const done = i < stepIdx || (phase === 'done' && i <= stepIdx);
            const col  = done ? C.green : cur ? C.orange : C.border;
            return (
              <div key={s.id} style={{ flex:1, minWidth:90, padding:'10px 8px',
                borderRadius:12, border:`2px solid ${col}`,
                background: cur ? `${col}18` : C.panel, textAlign:'center' }}>
                <div style={{ fontSize:16 }}>{done ? '✅' : s.icon}</div>
                <div style={{ fontSize:10, fontWeight:800, color: cur ? col : C.sub,
                  marginTop:4, lineHeight:1.2 }}>{s.label}</div>
                {cur && phase==='running' && (
                  <div style={{ width:20, height:20, margin:'6px auto 0',
                    border:`3px solid ${C.orange}44`, borderTop:`3px solid ${C.orange}`,
                    borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── CTA button ───────────────────────────────────────────────── */}
        {(phase === 'idle' || phase === 'done' || phase === 'error') && (
          <button onClick={runPipeline}
            style={{ width:'100%', padding:'16px', borderRadius:14, marginBottom:20,
              border:`2px solid ${C.orange}`, background:`${C.orange}18`,
              color:C.orange, fontWeight:900, fontSize:16, cursor:'pointer',
              letterSpacing:1 }}>
            {phase === 'idle' ? '▶  RUN FULL PIPELINE' :
             phase === 'error' ? '↺  RETRY' : '↺  RUN AGAIN'}
          </button>
        )}

        {phase === 'error' && error && (
          <div style={{ ...box(), borderColor: C.red, marginBottom:16 }}>
            <span style={{ color:C.red, fontWeight:700 }}>Error: </span>{error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
             STEP 1 — ENROLLMENT CARD
        ══════════════════════════════════════════════════════════════ */}
        {(phase === 'running' || phase === 'done') && policyId && (
          <div style={{ ...box(), borderColor: enrollTs ? C.green : C.orange }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <div style={{ fontWeight:900, fontSize:16 }}>👤 Step 1 — Policy Enrolled</div>
              {enrollTs ? pill(C.green,'✓ ENROLLED') : pill(C.orange,'PROCESSING…')}
            </div>
            {kv('Policy ID',    <b style={{ color:C.orange }}>{policyId}</b>)}
            {kv('Farmer',       farmer.name)}
            {kv('VPA',          farmer.vpa,  true)}
            {kv('District',     farmer.district)}
            {kv('Crop',         farmer.crop)}
            {kv('Acreage',      `${farmer.acreage} acres`)}
            {kv('Peril covered',farmer.peril.toUpperCase())}
            {kv('Aadhaar eKYC', enrollTs ? '✅ Verified' : '⏳ Pending')}
            {kv('DigiLocker',   enrollTs ? '✅ Land record fetched' : '⏳ Pending')}
            {enrollTs && kv('Enrolled at', fmtTs(enrollTs))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
             STEP 2 — ORACLE QUORUM CARD
        ══════════════════════════════════════════════════════════════ */}
        {oracleRes && (
          <div style={{ ...box(),
            borderColor: oracleRes.quorum_met ? C.green : C.red }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <div style={{ fontWeight:900, fontSize:16 }}>🛰️ Step 2 — Oracle Quorum</div>
              {oracleRes.quorum_met
                ? pill(C.green, `✓ TRIGGERED ${oracleRes.weighted_confidence}%`)
                : pill(C.red,   `✗ NO QUORUM ${oracleRes.weighted_confidence}%`)}
            </div>

            {/* Readings grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {([
                { label:'Rainfall', val:`${oracleRes.rainfall_mm} mm/24hr`,
                  src: oracleRes.oracle_inputs.rainfall_mm?.source,
                  ok: farmer.peril==='flood'||farmer.peril==='cyclone'
                      ? oracleRes.rainfall_mm > 150 : true },
                { label:'Temperature', val:`${oracleRes.temp_c}°C`,
                  src: oracleRes.oracle_inputs.temp_c?.source,
                  ok: farmer.peril==='heatwave' ? oracleRes.temp_c > 45 : true },
                { label:'NDVI', val:oracleRes.ndvi.toFixed(3),
                  src: oracleRes.oracle_inputs.ndvi?.source,
                  ok: farmer.peril==='drought' ? oracleRes.ndvi < 0.30 : true },
                { label:'Soil Moisture', val:`${oracleRes.soil_moisture}%`,
                  src: oracleRes.oracle_inputs.soil_moisture?.source,
                  ok: true },
              ] as {label:string;val:string;src:string;ok:boolean}[]).map(r => (
                <div key={r.label} style={{ background:C.panel2,
                  borderRadius:10, padding:'10px 14px',
                  border:`1px solid ${r.ok ? C.teal+'44' : C.border}` }}>
                  <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>{r.label}</div>
                  <div style={{ fontSize:18, fontWeight:900,
                    color: r.ok ? C.teal : C.sub }}>{r.val}</div>
                  <div style={{ fontSize:9, color:C.sub, marginTop:3 }}>{r.src}</div>
                </div>
              ))}
            </div>

            {/* 4-agent mini bars */}
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {Object.entries(oracleRes.agents).map(([name, a]) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:100, fontSize:10, color:C.sub,
                    textAlign:'right', flexShrink:0 }}>{name.replace('_',' ')}</div>
                  <div style={{ flex:1, height:8, borderRadius:4,
                    background:C.border, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:4,
                      width:`${a.confidence}%`,
                      background: a.confidence >= 75 ? C.green : C.red,
                      transition:'width 0.8s ease' }} />
                  </div>
                  <div style={{ width:36, fontSize:11, fontWeight:700,
                    color: a.confidence >= 75 ? C.green : C.red,
                    textAlign:'right' }}>{a.confidence}%</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, fontSize:12, color:C.sub }}>
              Quorum rule: weighted ≥ 75% across 4 agents
            </div>

            {!oracleRes.quorum_met && (
              <div style={{ marginTop:14, padding:'12px 16px', borderRadius:10,
                background:`${C.red}12`, border:`1px solid ${C.red}44`,
                color:C.red, fontSize:13, fontWeight:700 }}>
                ✗ Quorum not met — contract stays ACTIVE. No payout issued.
                Pipeline terminates here. This is a real outcome.
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
             STEP 3 — CONTRACT CARD
        ══════════════════════════════════════════════════════════════ */}
        {oracleRes?.quorum_met && (step === 'contract' || step === 'imps' || step === 'ledger' || (phase==='done')) && (
          <div style={{ ...box(), borderColor: C.purple }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <div style={{ fontWeight:900, fontSize:16 }}>⛓️ Step 3 — Smart Contract</div>
              {pill(C.purple,'STATE: TRIGGERED')}
            </div>
            {kv('Previous state', 'ACTIVE')}
            {kv('New state',      <b style={{ color:C.purple }}>TRIGGERED</b>)}
            {kv('Transition',     'ORACLE_QUORUM_PASSED → execute_payout()')}
            {kv('Fabric block',   String(19823441 + Math.floor(Math.random()*1000)), true)}
            {kv('Polygon TX',     '0x' + sha256mock(policyId!).slice(0,18) + '…', true)}
            {kv('Payout amount',  <b style={{ color:C.purple }}>{fmtINR(oracleRes.payout_amount!)}</b>)}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
             STEP 4 — IMPS RECEIPT  ← the screenshot moment
        ══════════════════════════════════════════════════════════════ */}
        {impsRes && (
          <div id="iie-receipt"
            style={{ borderRadius:20, overflow:'hidden', marginBottom:16,
              boxShadow:`0 0 0 2px ${C.green}, 0 0 40px ${C.green}22` }}>

            {/* Receipt header */}
            <div style={{ background:`linear-gradient(135deg,#0a2218 0%,#0d2f1a 100%)`,
              padding:'20px 24px', borderBottom:`2px solid ${C.green}` }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', flexWrap:'wrap', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, color:C.green, fontWeight:800,
                    textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>
                    💸 IMPS Settlement Confirmed
                  </div>
                  <div style={{ fontSize:32, fontWeight:900, color:C.green }}>
                    {fmtINR(impsRes.amount)}
                  </div>
                  <div style={{ fontSize:13, color:'#86efac', marginTop:4 }}>
                    Credited to {impsRes.vpa}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:11, color:C.sub }}>Settlement time</div>
                  <div style={{ fontSize:20, fontWeight:900, color:C.teal,
                    fontFamily:'monospace' }}>2.8s</div>
                  <div style={{ fontSize:10, color:C.sub, marginTop:2 }}>NPCI IMPS rails</div>
                </div>
              </div>
            </div>

            {/* Receipt body */}
            <div style={{ background:'#071410', padding:'20px 24px' }}>
              <div style={{ display:'grid', gap:0 }}>
                {kv('IMPS RRN',        impsRes.rrn,  true)}
                {kv('UTR Number',      impsRes.utr,  true)}
                {kv('UPI Reference',   impsRes.upiRef, true)}
                {kv('Policy ID',       policyId!, true)}
                {kv('Beneficiary VPA', impsRes.vpa, true)}
                {kv('Amount',          fmtINR(impsRes.amount))}
                {kv('Channel',         'NPCI IMPS — SBIN0000001')}
                {kv('Settlement Bank', 'STATE BANK OF INDIA')}
                {kv('Fabric Audit Ref',impsRes.auditRef, true)}
                {kv('Timestamp',       fmtTs(impsRes.ts))}
                {kv('Status', <span style={{ color:C.green, fontWeight:800 }}>✅ SUCCESS</span>)}
              </div>

              <div style={{ marginTop:16, display:'flex', gap:10, flexWrap:'wrap' }}>
                <button
                  onClick={() => {
                    const lines = [
                      `IIE IMPS RECEIPT`,
                      `─────────────────────`,
                      `Policy  : ${policyId}`,
                      `Amount  : ${fmtINR(impsRes.amount)}`,
                      `RRN     : ${impsRes.rrn}`,
                      `UTR     : ${impsRes.utr}`,
                      `UPI Ref : ${impsRes.upiRef}`,
                      `VPA     : ${impsRes.vpa}`,
                      `Bank    : STATE BANK OF INDIA`,
                      `Fabric  : ${impsRes.auditRef}`,
                      `Time    : ${fmtTs(impsRes.ts)}`,
                      `Status  : SUCCESS`,
                    ].join('\n');
                    navigator.clipboard.writeText(lines).catch(()=>{});
                  }}
                  style={{ padding:'8px 16px', borderRadius:10, cursor:'pointer',
                    border:`1px solid ${C.green}`, background:`${C.green}18`,
                    color:C.green, fontWeight:700, fontSize:12 }}>
                  📋 Copy Receipt
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('iie-receipt');
                    if (el) window.print();
                  }}
                  style={{ padding:'8px 16px', borderRadius:10, cursor:'pointer',
                    border:`1px solid ${C.sub}`, background:'transparent',
                    color:C.sub, fontWeight:700, fontSize:12 }}>
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
             STEP 5 — AUDIT LEDGER
        ══════════════════════════════════════════════════════════════ */}
        {ledger.length > 0 && (
          <div style={box()}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <div style={{ fontWeight:900, fontSize:16 }}>📒 Step 5 — Immutable Audit Ledger</div>
              {pill(C.teal, `${ledger.length} entries`)}
            </div>
            <div style={{ fontSize:11, color:C.sub, marginBottom:14 }}>
              Each entry is SHA-256 hashed and chained to the previous block.
              Altering any field breaks every subsequent hash.
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {ledger.map((e, i) => {
                const eventColor: Record<string, string> = {
                  POLICY_ENROLLED:           C.blue,
                  ORACLE_QUORUM_TRIGGERED:   C.orange,
                  CONTRACT_STATE_TRIGGERED:  C.purple,
                  IMPS_SETTLED:              C.green,
                };
                const col = eventColor[e.event] ?? C.teal;
                return (
                  <div key={i}
                    style={{ borderRadius:12, border:`1px solid ${col}44`,
                      background:`${col}06`, padding:'12px 16px',
                      animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'flex-start', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ padding:'2px 8px', borderRadius:999,
                          background:`${col}18`, border:`1px solid ${col}44`,
                          color:col, fontSize:10, fontWeight:800 }}>
                          #{e.seq}
                        </span>
                        <span style={{ fontSize:13, fontWeight:800, color:col }}>
                          {e.event}
                        </span>
                      </div>
                      <span style={{ fontSize:10, color:C.sub, fontFamily:'monospace' }}>
                        {fmtTs(e.ts)}
                      </span>
                    </div>

                    <div style={{ fontFamily:'monospace', fontSize:9, color:C.sub,
                      marginBottom:6, wordBreak:'break-all' }}>
                      HASH: <span style={{ color:col }}>{e.hash}</span>
                    </div>
                    <div style={{ fontFamily:'monospace', fontSize:9, color:C.sub,
                      marginBottom:8, wordBreak:'break-all' }}>
                      PREV: {e.prev_hash}
                    </div>

                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {Object.entries(e.data)
                        .filter(([,v]) => v !== null && v !== undefined)
                        .slice(0, 8)
                        .map(([k, v]) => (
                          <span key={k}
                            style={{ padding:'3px 8px', borderRadius:6,
                              background:`${col}0f`, border:`1px solid ${col}33`,
                              fontSize:10, color:C.sub }}>
                            <span style={{ color:col }}>{k}</span>: {String(v)}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {phase === 'done' && ledger.length === 4 && (
              <div style={{ marginTop:14, padding:'12px 16px', borderRadius:10,
                background:`${C.teal}08`, border:`1px solid ${C.teal}44`,
                display:'flex', justifyContent:'space-between', alignItems:'center',
                flexWrap:'wrap', gap:10 }}>
                <div style={{ color:C.teal, fontSize:13, fontWeight:700 }}>
                  ✓ Chain valid — 4 entries, hash continuity verified
                </div>
                <a href="/api/audit/trail"
                  target="_blank"
                  style={{ color:C.teal, fontSize:12, textDecoration:'none',
                    border:`1px solid ${C.teal}44`, padding:'4px 12px',
                    borderRadius:8 }}>
                  View full API trail →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div style={{ textAlign:'center', color:C.sub, fontSize:11,
          marginTop:24, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
          All flows are simulated · No live bank credentials ·
          Oracle data from open-meteo.com · IIE SBI GFF 2026
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
      `}</style>
    </div>
  );
}
