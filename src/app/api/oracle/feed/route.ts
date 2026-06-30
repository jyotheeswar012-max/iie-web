import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

export async function GET(_req: NextRequest) {
  const districts = [
    { district:'Barmer',   state:'Rajasthan',  ndvi:0.21, temp_c:47.2, rainfall_mm:8,   soil_moisture:12, risk_score:91, event:'Drought',  farmers:24300 },
    { district:'Jodhpur',  state:'Rajasthan',  ndvi:0.19, temp_c:48.1, rainfall_mm:6,   soil_moisture:10, risk_score:94, event:'Drought',  farmers:19500 },
    { district:'Puri',     state:'Odisha',     ndvi:0.68, temp_c:34.1, rainfall_mm:218, soil_moisture:78, risk_score:87, event:'Flood',    farmers:14600 },
    { district:'Khammam',  state:'Telangana',  ndvi:0.62, temp_c:35.8, rainfall_mm:210, soil_moisture:72, risk_score:79, event:'Flood',    farmers:12200 },
    { district:'Latur',    state:'Maharashtra',ndvi:0.28, temp_c:46.8, rainfall_mm:22,  soil_moisture:16, risk_score:88, event:'Heatwave', farmers:16700 },
    { district:'Nashik',   state:'Maharashtra',ndvi:0.34, temp_c:44.2, rainfall_mm:38,  soil_moisture:19, risk_score:71, event:'Drought',  farmers:22100 },
    { district:'Warangal', state:'Telangana',  ndvi:0.31, temp_c:45.9, rainfall_mm:44,  soil_moisture:22, risk_score:82, event:'Drought',  farmers:18400 },
    { district:'Ludhiana', state:'Punjab',     ndvi:0.52, temp_c:38.5, rainfall_mm:180, soil_moisture:55, risk_score:38, event:'Flood',    farmers:11200 },
    { district:'Adilabad', state:'Telangana',  ndvi:0.29, temp_c:46.1, rainfall_mm:31,  soil_moisture:18, risk_score:85, event:'Drought',  farmers:17800 },
  ];
  return cors(NextResponse.json({
    districts,
    sources: ['NASA MODIS', 'IMD District', 'ISRO Bhuvan', 'ICAR Sensors'],
    ts: new Date().toISOString(),
    high_risk_count: districts.filter(d => d.risk_score >= 80).length,
  }));
}
