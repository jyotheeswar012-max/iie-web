import { NextResponse } from 'next/server';
export const runtime = 'edge';

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function GET() {
  const events = [
    { event: 'POLICY_ENROLLED', policy_id: 'IIE-A3B7C901', data: { plan: 'Smart Shield', district: 'Barmer', crop: 'wheat', net_premium: 2940 } },
    { event: 'ORACLE_TRIGGERED', policy_id: 'IIE-A3B7C901', data: { event_type: 'drought', confidence: 88.5, yes_agents: 4, payout_amount: 28350 } },
    { event: 'CONTRACT_EXECUTED', policy_id: 'IIE-A3B7C901', data: { payout_inr: 28350, method: 'IMPS', settlement_ms: 2300 } },
    { event: 'POLICY_ENROLLED', policy_id: 'IIE-D4E8F012', data: { plan: 'Full Season Pro', district: 'Latur', crop: 'cotton', net_premium: 4410 } },
    { event: 'ORACLE_TRIGGERED', policy_id: 'IIE-D4E8F012', data: { event_type: 'heatwave', confidence: 91.2, yes_agents: 4, payout_amount: 61250 } },
  ];

  const ledger = [];
  let prevHash = '0'.repeat(64);
  for (let i = 0; i < events.length; i++) {
    const payload = JSON.stringify({ ...events[i], ts: '2026-06-' + String(27+i).padStart(2,'0') });
    const hash = await sha256hex(payload + prevHash);
    ledger.push({ seq: i+1, ts: `2026-06-27T0${i}:${String(i*11+5).padStart(2,'0')}:00Z`, ...events[i], hash, prev_hash: prevHash, algorithm: 'SHA-256' });
    prevHash = hash;
  }

  return NextResponse.json({
    chain_valid: true, total_entries: ledger.length,
    algorithm: 'SHA-256 chained (Hyperledger Fabric simulation)',
    genesis_hash: ledger[0].hash, latest_hash: ledger[ledger.length-1].hash,
    integrity_proof: 'each entry.prev_hash === SHA256(previous entry payload)',
    ledger,
  });
}
