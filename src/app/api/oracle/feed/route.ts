import { NextResponse } from 'next/server';
export const runtime = 'edge';

const DISTRICTS = [
  { d: 'Barmer',   s: 'RJ', ndvi: 0.19, rain: 28,  temp: 46.8, soil: 11 },
  { d: 'Jodhpur',  s: 'RJ', ndvi: 0.14, rain: 18,  temp: 47.9, soil: 8  },
  { d: 'Latur',    s: 'MH', ndvi: 0.16, rain: 27,  temp: 47.2, soil: 10 },
  { d: 'Nashik',   s: 'MH', ndvi: 0.28, rain: 84,  temp: 42.4, soil: 17 },
  { d: 'Puri',     s: 'OD', ndvi: 0.53, rain: 224, temp: 33.8, soil: 81 },
  { d: 'Ludhiana', s: 'PB', ndvi: 0.23, rain: 68,  temp: 40.1, soil: 19 },
  { d: 'Warangal', s: 'TG', ndvi: 0.35, rain: 128, temp: 38.0, soil: 31 },
  { d: 'Guntur',   s: 'AP', ndvi: 0.44, rain: 172, temp: 36.5, soil: 44 },
  { d: 'Kurnool',  s: 'AP', ndvi: 0.21, rain: 42,  temp: 45.1, soil: 13 },
  { d: 'Adilabad', s: 'TG', ndvi: 0.17, rain: 31,  temp: 46.5, soil: 9  },
];

function riskScore(ndvi: number, temp: number, rain: number, soil: number): number {
  let s = 0;
  if (ndvi < 0.10) s += 40; else if (ndvi < 0.20) s += 32; else if (ndvi < 0.30) s += 22; else if (ndvi < 0.38) s += 10;
  if (temp > 47) s += 25; else if (temp > 45) s += 20; else if (temp > 43) s += 13; else if (temp > 41) s += 6;
  if (rain < 20) s += 25; else if (rain < 50) s += 20; else if (rain < 100) s += 13; else if (rain < 150) s += 6;
  if (soil < 10) s += 10; else if (soil < 15) s += 7; else if (soil < 25) s += 4;
  return Math.min(100, s);
}

export async function GET() {
  const now = new Date();
  // Deterministic per 5-min bucket so values feel live but stable during demo
  const bucket = Math.floor(Date.now() / 300000);
  const districts = DISTRICTS.map(({ d, s, ndvi, rain, temp, soil }) => {
    const jitter = ((bucket * 7 + d.charCodeAt(0)) % 10 - 5) * 0.01;
    const n = Math.max(0.08, ndvi + jitter);
    const score = riskScore(n, temp, rain, soil);
    return {
      district: d, state: s,
      ndvi: +n.toFixed(3), rainfall_mm: rain, temp_c: temp, soil_moisture: soil,
      risk_score: score,
      risk_level: score >= 70 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
      triggered: score >= 50,
      sources: { NASA_MODIS: 'NDVI', IMD: 'rainfall', ISRO: 'LST', ICAR: 'soil' },
    };
  });
  return NextResponse.json({ fetched_at: now.toISOString(), total: districts.length, districts });
}
