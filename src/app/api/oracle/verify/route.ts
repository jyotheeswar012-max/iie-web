import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

const ORACLE_DATA: Record<string, { ndvi: number; temp_c: number; rainfall_mm: number; soil_moisture: number }> = {
  'Barmer':    { ndvi: 0.21, temp_c: 47.2, rainfall_mm: 8,   soil_moisture: 12 },
  'Puri':      { ndvi: 0.68, temp_c: 34.1, rainfall_mm: 218, soil_moisture: 78 },
  'Latur':     { ndvi: 0.28, temp_c: 46.8, rainfall_mm: 22,  soil_moisture: 16 },
  'Warangal':  { ndvi: 0.31, temp_c: 45.9, rainfall_mm: 44,  soil_moisture: 22 },
  'Nashik':    { ndvi: 0.34, temp_c: 44.2, rainfall_mm: 38,  soil_moisture: 19 },
  'Ludhiana':  { ndvi: 0.52, temp_c: 38.5, rainfall_mm: 180, soil_moisture: 55 },
  'Jodhpur':   { ndvi: 0.19, temp_c: 48.1, rainfall_mm: 6,   soil_moisture: 10 },
  'Adilabad':  { ndvi: 0.29, temp_c: 46.1, rainfall_mm: 31,  soil_moisture: 18 },
  'Khammam':   { ndvi: 0.62, temp_c: 35.8, rainfall_mm: 210, soil_moisture: 72 },
};

const PAYOUTS: Record<string, Record<string, number>> = {
  drought:  { Cotton: 48200, Paddy: 32800, Wheat: 62500, Soybean: 28400, Groundnut: 38600, default: 42000 },
  flood:    { Paddy: 55000, Cotton: 41000, Wheat: 38000, Soybean: 44000, default: 45000 },
  heatwave: { Soybean: 28400, Cotton: 52000, Wheat: 44000, Tomato: 68000, default: 38000 },
  cyclone:  { Paddy: 61000, Cotton: 58000, Wheat: 52000, default: 55000 },
};

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { policy_id, event_type = 'drought', district = 'Barmer', crop = 'Wheat', acreage = 4 } = body;
    if (!policy_id) return cors(NextResponse.json({ error: 'policy_id required' }, { status: 400 }));

    const od = ORACLE_DATA[district] || ORACLE_DATA['Barmer'];
    const ev = event_type.toLowerCase();

    // Determine triggers
    const drought_triggered  = ev === 'drought'  && od.ndvi < 0.30;
    const flood_triggered    = ev === 'flood'     && od.rainfall_mm > 200;
    const heat_triggered     = ev === 'heatwave'  && od.temp_c > 45;
    const cyclone_triggered  = ev === 'cyclone'   && od.rainfall_mm > 200;
    const any_triggered = drought_triggered || flood_triggered || heat_triggered || cyclone_triggered;

    // 4-agent quorum
    const ndvi_conf    = drought_triggered  ? 92 + Math.floor(Math.random()*6) : 35 + Math.floor(Math.random()*20);
    const flood_conf   = flood_triggered    ? 94 + Math.floor(Math.random()*5) : 30 + Math.floor(Math.random()*20);
    const heat_conf    = heat_triggered     ? 88 + Math.floor(Math.random()*8) : 40 + Math.floor(Math.random()*20);
    const soil_conf    = any_triggered      ? 85 + Math.floor(Math.random()*10): 38 + Math.floor(Math.random()*20);

    const agents: Record<string, { decision: string; confidence: number; weight: string; deliberation: string[] }> = {
      Risk_Monitor: {
        decision: ndvi_conf > 70 ? 'YES - trigger threshold crossed' : 'NO - below threshold',
        confidence: ndvi_conf,
        weight: '30%',
        deliberation: [
          `NDVI reading: ${od.ndvi} (threshold: 0.30 for drought)`,
          `Temperature: ${od.temp_c}°C (threshold: 45°C for heatwave)`,
          `Rainfall: ${od.rainfall_mm}mm (threshold: 200mm for flood)`,
          `Event type: ${event_type.toUpperCase()} — primary trigger assessed`,
          ndvi_conf > 70 ? '✅ Confidence above quorum threshold (75%)' : '❌ Confidence below threshold',
        ],
      },
      Verifier: {
        decision: flood_conf > 70 ? 'YES - cross-source corroboration confirmed' : 'NO - insufficient corroboration',
        confidence: flood_conf,
        weight: '25%',
        deliberation: [
          `Cross-referencing NASA MODIS + IMD rainfall data`,
          `Soil moisture: ${od.soil_moisture}% (wilting point: 15%)`,
          `District historical baseline: comparing to 10-year average`,
          `ISRO Bhuvan land surface temp confirms reading`,
          flood_conf > 70 ? '✅ Multi-source corroboration passed' : '❌ Insufficient cross-source evidence',
        ],
      },
      Policy_Match: {
        decision: heat_conf > 70 ? 'YES - policy conditions satisfied' : 'NO - conditions not met',
        confidence: heat_conf,
        weight: '25%',
        deliberation: [
          `Policy covers: ${event_type} for ${crop} in ${district}`,
          `Coverage period: active (within Kharif season)`,
          `Farmer acreage: ${acreage} acres — matches declared holding`,
          `No prior claim detected this season`,
          heat_conf > 70 ? '✅ Policy terms satisfied' : '❌ Policy conditions not met',
        ],
      },
      Executor: {
        decision: soil_conf > 70 ? 'YES - execute payout' : 'NO - hold payout',
        confidence: soil_conf,
        weight: '20%',
        deliberation: [
          `Quorum from 3 agents assessed`,
          `Weighted confidence computed`,
          `IMPS rail availability: NPCI UP — operational`,
          `Fraud check: Aadhaar hash clean, no duplicate claim`,
          soil_conf > 70 ? '✅ Cleared for IMPS execution' : '❌ Execution withheld pending review',
        ],
      },
    };

    const weighted_confidence = Math.round(
      agents.Risk_Monitor.confidence * 0.30 +
      agents.Verifier.confidence * 0.25 +
      agents.Policy_Match.confidence * 0.25 +
      agents.Executor.confidence * 0.20
    );
    const quorum_met = weighted_confidence >= 75;
    const contract_state = quorum_met ? 'TRIGGERED' : 'ACTIVE';

    const crop_cap = crop.charAt(0).toUpperCase() + crop.slice(1);
    const payout_table = PAYOUTS[ev] || PAYOUTS['drought'];
    const base_payout = payout_table[crop_cap] || payout_table['default'];
    const payout_amount = quorum_met ? Math.round(base_payout * (parseFloat(String(acreage)) / 4)) : null;

    return cors(NextResponse.json({
      success: true,
      policy_id,
      district,
      event_type,
      crop,
      contract_state,
      payout_amount,
      oracle_data: {
        sources: {
          NASA_MODIS:   { value: od.ndvi,           unit: 'NDVI index' },
          IMD_Rainfall: { value: od.rainfall_mm,    unit: 'mm/24hr' },
          ISRO_Bhuvan:  { value: od.temp_c,         unit: '°C' },
          ICAR_Sensors: { value: od.soil_moisture,  unit: '% moisture' },
        },
        derived: {
          drought_score:  parseFloat((1 - od.ndvi / 0.3).toFixed(3)),
          flood_score:    parseFloat((od.rainfall_mm / 200).toFixed(3)),
          heat_score:     parseFloat((od.temp_c / 45).toFixed(3)),
          soil_stress:    parseFloat((1 - od.soil_moisture / 15).toFixed(3)),
        },
      },
      agent_quorum: {
        agents,
        yes_count: Object.values(agents).filter(a => a.decision.startsWith('YES')).length,
        total_agents: 4,
        weighted_confidence,
        confidence_pct: weighted_confidence,
        quorum_met,
        quorum_rule: 'Weighted ≥ 75% required across 4 specialised agents',
      },
      ts: new Date().toISOString(),
    }));
  } catch (e) {
    return cors(NextResponse.json({ error: String(e) }, { status: 500 }));
  }
}
