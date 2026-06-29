import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

function sha(data: string) { return '0x' + createHash('sha256').update(data).digest('hex'); }

export async function GET() {
  const events = [
    { event:'POLICY_ISSUED',    pid:'IIE-0xA3F7' },
    { event:'ORACLE_FETCHED',   pid:'IIE-0xA3F7' },
    { event:'QUORUM_MET',       pid:'IIE-0xA3F7' },
    { event:'CONTRACT_TRIGGERED',pid:'IIE-0xA3F7'},
    { event:'PAYOUT_EXECUTED',  pid:'IIE-0xA3F7' },
  ];
  let prev = '0x' + '0'.repeat(64);
  const ledger = events.map((e, i) => {
    const ts   = new Date(Date.now() - (events.length - i)*60000).toISOString();
    const hash = sha(e.event + e.pid + ts + prev);
    const entry = { seq: i+1, ts, event: e.event, policy_id: e.pid, hash, prev_hash: prev, data: {} };
    prev = hash;
    return entry;
  });
  return NextResponse.json({ chain_valid: true, total_entries: ledger.length, ledger });
}
