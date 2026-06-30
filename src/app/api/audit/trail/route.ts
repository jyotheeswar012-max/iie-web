import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function sha256mock(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = ((Math.imul(31, h) + input.charCodeAt(i)) | 0);
  const base = Math.abs(h).toString(16).padStart(8, '0');
  return (base + base + base + base + base + base + base + base).slice(0, 64);
}

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

export async function GET(_req: NextRequest) {
  const now = new Date();
  const base_time = new Date(now.getTime() - 5 * 60 * 1000);
  const entries = [
    { event: 'POLICY_ENROLLED',         data: { policy_id: 'SBI-IIE-00341', farmer: 'Ramesh Kumar', district: 'Barmer', plan: 'Smart Shield', premium: 2940 } },
    { event: 'ORACLE_QUORUM_TRIGGERED', data: { policy_id: 'SBI-IIE-00341', confidence: 94, event_type: 'drought', agents_yes: 4 } },
    { event: 'CONTRACT_EXECUTED',       data: { policy_id: 'SBI-IIE-00341', payout: 48200, tx: '0xa3f7...d291', block: 19823441 } },
    { event: 'IMPS_SETTLED',            data: { policy_id: 'SBI-IIE-00341', rrn: '924819023741', upi_ref: 'YONO1751269338', amount: 48200 } },
    { event: 'POLICY_ENROLLED',         data: { policy_id: 'SBI-IIE-00609', farmer: 'Kavitha Reddy', district: 'Adilabad', plan: 'Full Season Pro', premium: 5880 } },
    { event: 'ORACLE_QUORUM_TRIGGERED', data: { policy_id: 'SBI-IIE-00609', confidence: 89, event_type: 'drought', agents_yes: 4 } },
    { event: 'CONTRACT_EXECUTED',       data: { policy_id: 'SBI-IIE-00609', payout: 55000, tx: '0xb9c1...f221', block: 19823502 } },
    { event: 'IMPS_SETTLED',            data: { policy_id: 'SBI-IIE-00609', rrn: '512930481726', upi_ref: 'YONO1751269420', amount: 55000 } },
  ];

  let prev_hash = '0000000000000000000000000000000000000000000000000000000000000000';
  const ledger = entries.map((e, i) => {
    const ts = new Date(base_time.getTime() + i * 35000).toISOString();
    const payload = JSON.stringify({ seq: i + 1, event: e.event, ts, prev_hash, ...e.data });
    const hash = sha256mock(payload);
    const entry = { seq: i + 1, ts, event: e.event, policy_id: (e.data as { policy_id?: string }).policy_id || '', hash, prev_hash, data: e.data };
    prev_hash = hash;
    return entry;
  });

  return cors(NextResponse.json({
    chain_valid: true,
    total_entries: ledger.length,
    algorithm: 'SHA-256 (deterministic mock)',
    note: 'Production uses Polygon + Hyperledger Fabric dual ledger',
    ledger,
    ts: now.toISOString(),
  }));
}
