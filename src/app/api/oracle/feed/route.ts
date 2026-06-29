import { NextResponse } from 'next/server';

export async function GET() {
  const districts = [
    { district:'Barmer',   ndvi:0.21, temp_c:46.2, rainfall_mm:18,  soil_moisture:14 },
    { district:'Puri',     ndvi:0.38, temp_c:34.1, rainfall_mm:218, soil_moisture:72 },
    { district:'Latur',    ndvi:0.29, temp_c:44.8, rainfall_mm:22,  soil_moisture:16 },
    { district:'Warangal', ndvi:0.19, temp_c:43.5, rainfall_mm:15,  soil_moisture:11 },
  ];
  return NextResponse.json({ districts, fetched_at: new Date().toISOString() });
}
