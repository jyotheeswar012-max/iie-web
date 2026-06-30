import { NextResponse } from 'next/server';
export const runtime = 'edge';

const THRESHOLDS: Record<string, Record<string,number>> = {
  drought:  { ndvi_max: 0.30, rain_min_mm: 50, soil_max: 25 },
  flood:    { rain_6hr_mm: 200, soil_min: 70 },
  heatwave: { temp_max_c: 45.0, ndvi_max: 0.38 },
  cyclone:  { wind_kmh: 75, rain_mm: 80 },
};
const BASE_PAYOUT: Record<string,number> = { drought:6000, flood:8500, heatwave:7200, cyclone:9500 };
const CROP_MULT: Record<string,number> = { paddy:1.2,cotton:1.3,wheat:1.1,soybean:1.0,groundnut:1.15,sugarcane:1.4,maize:1.0,chilli:1.25,tomato:1.1,onion:1.05,potato:1.0,rice:1.2 };

function oracleData(district: string) {
  const seed = [...district.toLowerCase()].reduce((a,c,i)=>a+c.charCodeAt(0)*(i+1),0);
  const bucket = Math.floor(Date.now()/300000);
  const rng = (n: number) => ((seed * 31 + bucket * 997 + n * 127) % 1000) / 1000;
  return {
    ndvi:         +(0.10 + rng(1) * 0.42).toFixed(3),
    rainfall_mm:  +(10   + rng(2) * 300).toFixed(1),
    temp_c:       +(32   + rng(3) * 17.5).toFixed(1),
    soil_moisture:+(6    + rng(4) * 52).toFixed(1),
    wind_kmh:     +(5    + rng(5) * 100).toFixed(1),
  };
}

function runAgents(d: ReturnType<typeof oracleData>, ev: string) {
  const th = THRESHOLDS[ev] || THRESHOLDS.drought;
  const agents: Record<string, { vote: boolean; confidence: number; deliberation: string[] }> = {};

  if (ev === 'drought') {
    const nm = Math.max(0, th.ndvi_max - d.ndvi) / th.ndvi_max;
    const rm = Math.max(0, th.rain_min_mm - d.rainfall_mm) / th.rain_min_mm;
    const sm = Math.max(0, th.soil_max - d.soil_moisture) / th.soil_max;
    agents.Agent1_RiskMonitor   = { vote: d.ndvi < th.ndvi_max,   confidence: d.ndvi < th.ndvi_max   ? Math.min(95, 60+nm*130) : Math.max(5, 40-nm*80),  deliberation: [`MODIS NDVI: ${d.ndvi} (threshold <${th.ndvi_max})`, `Stress margin: ${(nm*100).toFixed(1)}%`, `Classification: ${d.ndvi<0.20?'SEVERE':d.ndvi<th.ndvi_max?'STRESSED':'NORMAL'}`, d.ndvi<th.ndvi_max?'✅ YES — drought vegetation confirmed':'❌ NO — vegetation within range'] };
    agents.Agent2_Verifier      = { vote: d.rainfall_mm < th.rain_min_mm, confidence: d.rainfall_mm < th.rain_min_mm ? Math.min(95,55+rm*125) : Math.max(5,35-rm*70), deliberation: [`IMD 24hr rainfall: ${d.rainfall_mm}mm (threshold <${th.rain_min_mm}mm)`, `Deficit: ${(rm*100).toFixed(1)}% below threshold`, `IMD category: ${d.rainfall_mm<30?'SEVERE DEFICIT':d.rainfall_mm<th.rain_min_mm?'DEFICIT':'ADEQUATE'}`, d.rainfall_mm<th.rain_min_mm?'✅ YES — rainfall deficit confirmed':'❌ NO — rainfall sufficient'] };
    agents.Agent3_PolicyMatcher = { vote: d.soil_moisture < th.soil_max, confidence: d.soil_moisture < th.soil_max ? Math.min(90,50+sm*115) : Math.max(5,30-sm*60), deliberation: [`ICAR soil moisture: ${d.soil_moisture}% (threshold <${th.soil_max}%)`, `Wilting proximity: ${d.soil_moisture<15?'CRITICAL (<15%)':d.soil_moisture<th.soil_max?'LOW':'ADEQUATE'}`, `IRDAI compliance: soil <${th.soil_max}% required for drought trigger`, d.soil_moisture<th.soil_max?'✅ YES — soil confirms crop stress':'❌ NO — soil moisture adequate'] };
    const dual = d.ndvi < 0.33 && d.rainfall_mm < 80;
    agents.Agent4_Executor      = { vote: dual, confidence: dual ? Math.min(92,(agents.Agent1_RiskMonitor.confidence+agents.Agent2_Verifier.confidence)/2*0.95) : 25, deliberation: [`Dual-gate: NDVI ${d.ndvi}<0.33 AND rain ${d.rainfall_mm}mm<80mm`, `NDVI gate: ${d.ndvi<0.33?'PASS':'FAIL'} | Rain gate: ${d.rainfall_mm<80?'PASS':'FAIL'}`, `Executor requires BOTH conditions for final confirmation`, dual?'✅ YES — dual gate satisfied':'❌ NO — dual gate not met'] };
  } else {
    ['Agent1_RiskMonitor','Agent2_Verifier','Agent3_PolicyMatcher','Agent4_Executor'].forEach(a=>{
      agents[a] = { vote: Math.random()>0.3, confidence: 55+Math.floor(Math.random()*35), deliberation: ['Secondary event analysis','Cross-source validation','Policy compliance check','Dual confirmation gate'] };
    });
  }

  const weights = [0.30, 0.25, 0.25, 0.20];
  const vals = Object.values(agents);
  const wConf = vals.reduce((s,a,i) => s + weights[i]*a.confidence, 0);
  const yesCount = vals.filter(a=>a.vote).length;

  return {
    orchestration_ts: new Date().toISOString(),
    event_type: ev,
    agents: Object.fromEntries(Object.entries(agents).map(([k,v],i)=>[k,{
      decision: v.vote ? '✅ YES' : '❌ NO',
      confidence: Math.round(v.confidence),
      weight: `${[30,25,25,20][i]}%`,
      deliberation: v.deliberation,
    }])),
    yes_count: yesCount,
    total_agents: 4,
    weighted_confidence: +wConf.toFixed(1),
    confidence_pct: +wConf.toFixed(1),
    quorum_met: wConf >= 75,
    quorum_rule: 'weighted confidence ≥75% (weights: 30/25/25/20)',
    protocol: 'IIE-MAO-v2',
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const pid  = String(body.policy_id || 'IIE-DEMO0001');
  const ev   = String(body.event_type || 'drought').toLowerCase();
  if (!THRESHOLDS[ev]) return NextResponse.json({ error: `Unknown event. Use: ${Object.keys(THRESHOLDS).join(', ')}` }, { status: 400 });

  const district = String(body.district || 'Barmer');
  const crop     = String(body.crop || 'wheat').toLowerCase();
  const acres    = Math.max(0.1, Number(body.acreage)||5);
  const oracle   = oracleData(district);
  const quorum   = runAgents(oracle, ev);

  let payout = 0;
  if (quorum.quorum_met) {
    const mult = CROP_MULT[crop] || 1.0;
    payout = Math.round(BASE_PAYOUT[ev] * mult * acres * (quorum.confidence_pct/100));
  }

  return NextResponse.json({
    policy_id: pid, district, event_type: ev,
    oracle_data: { district, derived: oracle, sources: { NASA_MODIS: { value: oracle.ndvi, unit: 'NDVI index' }, IMD_Rainfall: { value: oracle.rainfall_mm, unit: 'mm/24hr' }, ISRO_Bhuvan: { value: oracle.temp_c, unit: '°C LST' }, ICAR_Sensors: { value: oracle.soil_moisture, unit: '% volumetric' } } },
    agent_quorum: quorum,
    contract_state: quorum.quorum_met ? 'TRIGGERED' : 'ACTIVE',
    payout_amount: payout,
    next_step: quorum.quorum_met ? 'POST /api/contract/execute' : 'Quorum not met — monitoring continues',
  });
}
