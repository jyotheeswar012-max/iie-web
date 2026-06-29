import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const ndvi   = parseFloat((0.18 + Math.random()*0.15).toFixed(2));
  const rain   = Math.floor(150 + Math.random()*100);
  const temp   = parseFloat((40 + Math.random()*8).toFixed(1));
  const soil   = Math.floor(12 + Math.random()*10);
  const conf   = Math.floor(82 + Math.random()*15);
  const quorum = conf >= 75;
  return NextResponse.json({
    policy_id: body.policy_id,
    district:  body.district ?? 'Barmer',
    event_type: body.event_type,
    contract_state: quorum ? 'TRIGGERED' : 'ACTIVE',
    payout_amount: quorum ? 48200 : null,
    oracle_data: {
      sources: {
        NASA_MODIS:   { metric:'NDVI',        value: ndvi, unit:'index',  latency_ms: 89 },
        IMD_Rainfall: { metric:'Rainfall',    value: rain, unit:'mm',     latency_ms: 134 },
        ISRO_Bhuvan:  { metric:'Temperature', value: temp, unit:'°C',     latency_ms: 112 },
        ICAR_Sensors: { metric:'SoilMoisture',value: soil, unit:'%',      latency_ms: 45 },
      },
      derived: { ndvi_anomaly: ndvi, rain_deficit: 200 - rain, heat_index: temp },
      fetched_at: new Date().toISOString(),
    },
    agent_quorum: {
      votes: {
        risk_monitor: { decision: conf>80?'YES-TRIGGER':'NO',    reason: conf>80?'NDVI below drought threshold 0.30':'NDVI borderline' },
        verifier:     { decision: conf>78?'YES-TRIGGER':'NO',    reason: conf>78?'Rainfall deficit confirmed':'Insufficient data' },
        policy_match: { decision: 'YES-TRIGGER',                 reason: 'Event type matches policy coverage' },
        executor:     { decision: conf>75?'YES-TRIGGER':'HOLD',  reason: conf>75?'Quorum reached, payout authorized':'Awaiting quorum' },
      },
      yes_count:      conf > 75 ? 4 : 2,
      total_agents:   4,
      confidence_pct: conf,
      quorum_met:     quorum,
      quorum_rule:    '>=75% agent consensus',
    },
    next_step: quorum ? 'execute_payout' : 'monitor',
  });
}
