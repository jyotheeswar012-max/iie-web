export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ndvi = Number(body.ndvi  ?? 0.21);
    const temp = Number(body.temp_c ?? 46);
    const rain = Number(body.rainfall_mm ?? 18);
    const soil = Number(body.soil_moisture_pct ?? 14);
    const ndvi_score = ndvi < 0.20 ? 40 : ndvi < 0.25 ? 32 : ndvi < 0.30 ? 22 : 10;
    const temp_score = temp > 45 ? 25 : temp > 42 ? 18 : temp > 38 ? 10 : 4;
    const rain_score = rain < 20 ? 25 : rain < 50 ? 18 : rain > 200 ? 22 : 8;
    const soil_score = soil < 15 ? 10 : soil < 25 ? 6 : 2;
    const total = ndvi_score + temp_score + rain_score + soil_score;
    const level = total >= 70 ? 'CRITICAL' : total >= 50 ? 'HIGH' : total >= 30 ? 'MEDIUM' : 'LOW';
    const flags: string[] = [];
    if (ndvi < 0.25) flags.push('Severe vegetation stress detected (NDVI < 0.25)');
    if (temp > 44)   flags.push('Extreme heat event (Temp > 44\u00b0C)');
    if (rain < 25)   flags.push('Critical rainfall deficit (<25mm recorded)');
    if (soil < 15)   flags.push('Soil moisture critically low (<15%)');
    return NextResponse.json({
      risk_score:       total,
      risk_level:       level,
      triggered:        total >= 60,
      confidence_pct:   Math.min(98, 70 + Math.floor(total / 3)),
      component_scores: { ndvi_score, temp_score, rain_score, soil_score },
      flags,
      model:            'IIE-WeightedDecisionTree-v2.1 (NDVI\u00d70.4 + Temp\u00d70.25 + Rain\u00d70.25 + Soil\u00d70.10)',
      recommendation:   total >= 60
        ? 'AUTO-PAYOUT AUTHORIZED \u2014 Parametric threshold exceeded'
        : 'Continue monitoring \u2014 below trigger threshold',
    });
  } catch {
    return NextResponse.json({ error: 'predict failed' }, { status: 500 });
  }
}
