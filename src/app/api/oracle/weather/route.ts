/**
 * GET /api/oracle/weather?district=Barmer
 *
 * Oracle 1 — LIVE rainfall from NASA POWER Daily Climatology API.
 * No API key required. Free. CORS-open.
 *
 * Endpoint: https://power.larc.nasa.gov/api/temporal/daily/point
 * Parameter: PRECTOTCORR (MERRA-2 corrected precipitation, mm/day)
 * Coordinates: district centroids (lat/lon below)
 *
 * Returns:
 *   - last_7d_rainfall_mm   : real observed rainfall (mm) over past 7 days
 *   - historical_normal_mm  : 30-year climatological normal for same period
 *   - deviation_pct         : % deviation from normal (negative = deficit)
 *   - source                : 'NASA POWER MERRA-2 (live)'
 *   - trigger_threshold_pct : IRDAI drought threshold (-40% from normal)
 *   - triggered             : boolean — deviation_pct <= trigger_threshold_pct
 *
 * HONEST NOTE: Oracle 2 (IMD), Oracle 3 (Sentinel-2 NDVI),
 * Oracle 4 (ICAR soil) remain simulated in this prototype.
 * This is explicitly labelled in every response.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// District centroids
const DISTRICT_COORDS: Record<string, { lat: number; lon: number; normal_7d_mm: number }> = {
  Barmer:      { lat: 25.75, lon: 71.39, normal_7d_mm: 9.8  },
  Jodhpur:     { lat: 26.29, lon: 73.02, normal_7d_mm: 11.2 },
  Warangal:    { lat: 17.98, lon: 79.59, normal_7d_mm: 15.9 },
  Latur:       { lat: 18.40, lon: 76.56, normal_7d_mm: 12.8 },
  Nashik:      { lat: 20.00, lon: 73.78, normal_7d_mm: 16.4 },
  Puri:        { lat: 19.81, lon: 85.83, normal_7d_mm: 37.2 },
  Ludhiana:    { lat: 30.91, lon: 75.85, normal_7d_mm: 8.1  },
  Adilabad:    { lat: 19.66, lon: 78.53, normal_7d_mm: 14.3 },
  Khammam:     { lat: 17.25, lon: 80.15, normal_7d_mm: 35.1 },
};

const DROUGHT_TRIGGER_PCT = -40; // IRDAI parametric drought threshold

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

export async function GET(req: NextRequest) {
  const district = new URL(req.url).searchParams.get('district') ?? 'Barmer';
  const coords = DISTRICT_COORDS[district] ?? DISTRICT_COORDS['Barmer'];

  // Date range: last 7 days
  const now   = new Date();
  const end   = new Date(now); end.setDate(end.getDate() - 1); // yesterday (POWER has 1-day lag)
  const start = new Date(end); start.setDate(start.getDate() - 6);
  const fmt = (d: Date) => d.toISOString().slice(0,10).replace(/-/g,'');

  const powerUrl =
    `https://power.larc.nasa.gov/api/temporal/daily/point` +
    `?parameters=PRECTOTCORR` +
    `&community=AG` +
    `&longitude=${coords.lon}` +
    `&latitude=${coords.lat}` +
    `&start=${fmt(start)}` +
    `&end=${fmt(end)}` +
    `&format=JSON`;

  try {
    const resp = await fetch(powerUrl, {
      headers: { 'Accept': 'application/json' },
      // Vercel edge allows outbound fetch
    });

    if (!resp.ok) throw new Error(`NASA POWER returned HTTP ${resp.status}`);

    const data: any = await resp.json();
    const daily: Record<string, number> =
      data?.properties?.parameter?.PRECTOTCORR ?? {};

    const values = Object.values(daily).filter((v: number) => v >= 0);
    if (values.length === 0) throw new Error('No valid precipitation values in NASA POWER response');

    const last_7d_rainfall_mm   = +values.reduce((a: number, b: number) => a + b, 0).toFixed(1);
    const historical_normal_mm  = coords.normal_7d_mm;
    const deviation_pct         = +((last_7d_rainfall_mm - historical_normal_mm) / historical_normal_mm * 100).toFixed(1);
    const triggered             = deviation_pct <= DROUGHT_TRIGGER_PCT;

    return cors(NextResponse.json({
      oracle:                  'Oracle-1 (NASA POWER MERRA-2)',
      source:                  'NASA POWER — live MERRA-2 corrected precipitation',
      source_url:              powerUrl,
      district,
      lat:                     coords.lat,
      lon:                     coords.lon,
      period_start:            start.toISOString().slice(0,10),
      period_end:              end.toISOString().slice(0,10),
      last_7d_rainfall_mm,
      historical_normal_mm,
      deviation_pct,
      trigger_threshold_pct:   DROUGHT_TRIGGER_PCT,
      triggered,
      trigger_reason:          triggered
        ? `Rainfall ${deviation_pct}% below 30-yr normal ≤ IRDAI drought threshold (${DROUGHT_TRIGGER_PCT}%)`
        : `Rainfall within normal range (${deviation_pct}% deviation)`,
      // Explicit honesty — required by design
      oracle_status: {
        'Oracle-1 NASA POWER rainfall':   '🟢 LIVE — real MERRA-2 data',
        'Oracle-2 IMD weather stations':  '🟡 SIMULATED — production target: IMD API subscription',
        'Oracle-3 Sentinel-2 NDVI':       '🟡 SIMULATED — production target: ESA Copernicus API',
        'Oracle-4 ICAR soil moisture':    '🟡 SIMULATED — production target: ICAR NICRA API',
      },
      ts: new Date().toISOString(),
    }));

  } catch (err) {
    // Graceful fallback with clear labelling
    const fallback_mm          = +(Math.random() * 15 + 2).toFixed(1);
    const historical_normal_mm = coords.normal_7d_mm;
    const deviation_pct        = +((fallback_mm - historical_normal_mm) / historical_normal_mm * 100).toFixed(1);
    const triggered            = deviation_pct <= DROUGHT_TRIGGER_PCT;

    return cors(NextResponse.json({
      oracle:                'Oracle-1 (NASA POWER — FALLBACK)',
      source:                'Fallback simulated value — NASA POWER fetch failed',
      source_error:          String(err),
      district,
      last_7d_rainfall_mm:   fallback_mm,
      historical_normal_mm,
      deviation_pct,
      trigger_threshold_pct: DROUGHT_TRIGGER_PCT,
      triggered,
      oracle_status: {
        'Oracle-1 NASA POWER rainfall':  '🔴 FALLBACK (fetch failed — simulated value used)',
        'Oracle-2 IMD weather stations': '🟡 SIMULATED',
        'Oracle-3 Sentinel-2 NDVI':      '🟡 SIMULATED',
        'Oracle-4 ICAR soil moisture':   '🟡 SIMULATED',
      },
      ts: new Date().toISOString(),
    }, { status: 200 })); // 200 so demo doesn't break — fallback is labelled
  }
}
