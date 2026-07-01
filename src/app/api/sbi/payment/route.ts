/**
 * POST /api/sbi/payment
 * -------------------------------------------------
 * Mock: SBI Payment Gateway — IMPS payout initiation.
 * In production calls SBI's NPCI IMPS channel via
 * the SBI Corporate Internet Banking API (CIB).
 *
 * Request body: { policyId, beneficiaryVpa, amount, remarks }
 * Response:     { status, rrn, utr, txTimestamp, channel, settlementBank }
 */
import { NextRequest, NextResponse } from 'next/server';

function genRRN() { return String(Math.floor(900000000000 + Math.random() * 99999999999)); }
function genUTR() { return 'SBI' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000); }

export async function POST(req: NextRequest) {
  await new Promise(r => setTimeout(r, 310)); // IMPS latency simulation
  const { policyId, beneficiaryVpa, amount, remarks } = await req.json();

  if (!policyId || !beneficiaryVpa || !amount) {
    return NextResponse.json({ status: 'FAILED', error: 'Missing required fields' }, { status: 400 });
  }

  const rrn = genRRN();
  const utr = genUTR();

  return NextResponse.json({
    status:          'SUCCESS',
    rrn,
    utr,
    policyId,
    beneficiaryVpa,
    amount,
    remarks:         remarks ?? 'IIE parametric payout',
    txTimestamp:     new Date().toISOString(),
    channel:         'IMPS',
    settlementBank:  'STATE BANK OF INDIA',
    npciMemberId:    'SBIN0000001',
    auditRef:        `HLFC-${rrn.slice(0, 8)}`,
    _source:         'SBI Payment Gateway — IMPS (NPCI CIB channel — mock)',
    _endpoint:       'https://api.onlinesbi.sbi/pgw/v2/imps/initiate  [MOCK]',
  });
}
