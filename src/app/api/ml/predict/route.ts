import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function sigmoid(x: number): number { return 100 / (1 + Math.exp(-x)); }

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
    const { district = 'Barmer', ndvi = 0.21, temp_c = 47.2, rainfall_mm = 8, soil_moisture_pct = 12 } = body;

    const ndvi_llr        = ndvi < 0.25 ? 3.1 : ndvi < 0.30 ? 2.2 : ndvi < 0.35 ? 1.1 : -0.5;
    const temp_llr        = temp_c > 46 ? 2.4 : temp_c > 44 ? 1.6 : temp_c > 42 ? 0.8 : -0.4;
    const rain_llr        = rainfall_mm < 20 ? 2.8 : rainfall_mm < 50 ? 1.4 : rainfall_mm < 100 ? 0.2 : -1.2;
    const soil_llr        = soil_moisture_pct < 15 ? 2.0 : soil_moisture_pct < 20 ? 1.2 : soil_moisture_pct < 30 ? 0.4 : -0.8;

    const total_llr = +(ndvi_llr * 0.40 + temp_llr * 0.25 + rain_llr * 0.25 + soil_llr * 0.10).toFixed(3);
    const raw_score = sigmoid(total_llr);
    const risk_score = +raw_score.toFixed(1);
    const risk_level = risk_score >= 85 ? 'CRITICAL' : risk_score >= 70 ? 'HIGH' : risk_score >= 50 ? 'MEDIUM' : 'LOW';
    const triggered = risk_score >= 65;

    const flags = [];
    if (ndvi < 0.25)            flags.push(`🚨 Severe vegetation loss: NDVI ${ndvi} (< 0.25 critical)`);
    if (temp_c > 45)            flags.push(`🌡️ Extreme heat: ${temp_c}°C exceeds IRDAI heatwave threshold`);
    if (rainfall_mm < 20)       flags.push(`🌵 Near-zero rainfall: ${rainfall_mm}mm — drought confirmed`);
    if (soil_moisture_pct < 15) flags.push(`🏜️ Soil moisture below wilting point: ${soil_moisture_pct}%`);

    return cors(NextResponse.json({
      district,
      risk_score,
      risk_level,
      triggered,
      confidence_pct: Math.min(99, Math.round(risk_score + 3)),
      log_likelihoods: {
        NDVI:         { llr: ndvi_llr,   weight: '40%', label: ndvi_llr > 1.5 ? 'SEVERE' : ndvi_llr > 0 ? 'MODERATE' : 'NORMAL' },
        Temperature:  { llr: temp_llr,   weight: '25%', label: temp_llr > 1.5 ? 'EXTREME' : temp_llr > 0 ? 'ELEVATED' : 'NORMAL' },
        Rainfall:     { llr: rain_llr,   weight: '25%', label: rain_llr > 1.5 ? 'DEFICIT' : rain_llr > 0 ? 'LOW' : 'ADEQUATE' },
        'Soil Moisture': { llr: soil_llr, weight: '10%', label: soil_llr > 1 ? 'STRESS' : soil_llr > 0 ? 'LOW' : 'ADEQUATE' },
      },
      total_llr,
      flags,
      model: 'NaiveBayes-LLR v2.1 (NDVI×0.4 + Temp×0.25 + Rain×0.25 + Soil×0.1) → sigmoid',
      recommendation: triggered
        ? `AUTO-PAYOUT RECOMMENDED — risk score ${risk_score}/100 exceeds trigger threshold (65)`
        : `MONITOR — risk score ${risk_score}/100 below trigger threshold (65)`,
      ts: new Date().toISOString(),
    }));
  } catch (e) {
    return cors(NextResponse.json({ error: String(e) }, { status: 500 }));
  }
}
