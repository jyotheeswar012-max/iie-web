export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

function fakeHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return '0x' + hex.repeat(8);
}

export async function GET() {
  const events = [
    'POLICY_ISSUED', 'ORACLE_FETCHED', 'QUORUM_MET', 'CONTRACT_TRIGGERED', 'PAYOUT_EXECUTED'
  ];
  let prev = '0x' + '0'.repeat(64);
  const ledger = events.map((event, i) => {
    const ts   = new Date(Date.now() - (events.length - i) * 60000).toISOString();
    const hash = fakeHash(event + 'IIE-0xA3F7' + ts + prev);
    const entry = { seq: i+1, ts, event, policy_id: 'IIE-0xA3F7', hash, prev_hash: prev, data: {} };
    prev = hash;
    return entry;
  });
  return NextResponse.json({ chain_valid: true, total_entries: ledger.length, ledger });
}
