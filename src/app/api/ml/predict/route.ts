import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const ndvi  = Number(body.ndvi  ?? 0.21);
  const temp  = Number(body.temp_c ?? 46);
  const rain  = Number(body.rainfall_mm ?? 18);
  const soil  = Number(body.soil_moisture_pct ?? 14);

  const ndvi_score = ndvi < 0.20 ? 40 : ndvi < 0.25 ? 32 : ndvi < 0.30 ? 22 : 10;
  const temp_score = temp > 45 ? 25 : temp > 42 ? 18 : temp > 38 ? 10 : 4;
  const rain_score = rain < 20 ? 25 : rain < 50 ? 18 : rain > 200 ? 22 : 8;
  const soil_score = soil < 15 ? 10 : soil < 25 ? 6 : 2;
  const total = ndvi_score + temp_score + rain_score + soil_score;

  const level = total >= 70 ? 'CRITICAL' : total >= 50 ? 'HIGH' : total >= 30 ? 'MEDIUM' : 'LOW';
  const triggered = total >= 60;
  const flags: string[] = [];
  if (ndvi < 0.25) flags.push('Severe vegetation stress detected (NDVI < 0.25)');
  if (temp > 44)   flags.push('Extreme heat event (Temp > 44°C)');
  if (rain < 25)   flags.push('Critical rainfall deficit (<25mm recorded)');
  if (soil < 15)   flags.push('Soil moisture critically low (<15%)');

  return NextResponse.json({
    risk_score:        total,
    risk_level:        level,
    triggered,
    confidence_pct:    Math.min(98, 70 + Math.floor(total/3)),
    component_scores:  { ndvi_score, temp_score, rain_score, soil_score },
    flags,
    model:             'IIE-WeightedDecisionTree-v2.1 (NDVI×0.4 + Temp×0.25 + Rain×0.25 + Soil×0.10)',
    recommendation:    triggered ? 'AUTO-PAYOUT AUTHORIZED — Parametric threshold exceeded' : 'Continue monitoring — below trigger threshold',
  });
}
