/**
 * POST /api/sbi/payment
 * ─────────────────────────────────────────────────────────────────
 * Mock SBI Payment Gateway — IMPS payout initiation.
 *
 * In production: calls SBI's NPCI IMPS channel via
 * the SBI Corporate Internet Banking (CIB) API.
 *
 * Request:  { policyId, beneficiaryVpa, amount, remarks }
 * Response: { status, rrn, utr, upiRef, txTimestamp, channel,
 *             settlementBank, npciMemberId, auditRef, fabricBlockHash }
 */
import { NextRequest, NextResponse } from 'next/server';

function sha256mock(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((Math.imul(31, h) + s.charCodeAt(i)) | 0);
  const b = Math.abs(h).toString(16).padStart(8, '0');
  return (b.repeat(9)).slice(0, 64);
}

function genRRN() {
  // NPCI RRN: 12-digit numeric
  return String(Math.floor(900000000000 + Math.random() * 99999999999));
}
function genUTR(rrn: string) {
  // SBI UTR format: SBIN + 18 chars
  return 'SBIN' + Date.now().toString().slice(-9) + rrn.slice(-5);
}
function genUPIRef() {
  // YONO UPI reference: YONO + 10 digits
  return 'YONO' + Date.now().toString().slice(-10);
}

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

export async function POST(req: NextRequest) {
  // Simulate NPCI IMPS network latency (250–350ms)
  await new Promise(r => setTimeout(r, 250 + Math.random() * 100));

  let body: { policyId?: string; beneficiaryVpa?: string; amount?: number; remarks?: string };
  try {
    body = await req.json();
  } catch {
    return cors(NextResponse.json({ status: 'FAILED', error: 'Invalid JSON body' }, { status: 400 }));
  }

  const { policyId, beneficiaryVpa, amount, remarks } = body;
  if (!policyId || !beneficiaryVpa || !amount) {
    return cors(NextResponse.json(
      { status: 'FAILED', error: 'Missing required fields: policyId, beneficiaryVpa, amount' },
      { status: 400 }
    ));
  }

  const rrn         = genRRN();
  const utr         = genUTR(rrn);
  const upiRef      = genUPIRef();
  const txTimestamp = new Date().toISOString();
  const auditRef    = `HLFC-${sha256mock(policyId + rrn).slice(0, 12).toUpperCase()}`;
  const fabricHash  = sha256mock(policyId + utr + txTimestamp);

  return cors(NextResponse.json({
    status:           'SUCCESS',

    // ── Payment identifiers ──────────────────────────────────────────
    rrn,                         // NPCI Retrieval Reference Number (12-digit)
    utr,                         // SBI UTR (Unique Transaction Reference)
    upiRef,                      // YONO UPI reference
    txTimestamp,

    // ── Transaction details ─────────────────────────────────────────
    policyId,
    beneficiaryVpa,
    amount,
    remarks:          remarks ?? 'IIE parametric crop insurance payout',
    channel:          'IMPS',
    settlementBank:   'STATE BANK OF INDIA',
    npciMemberId:     'SBIN0000001',

    // ── Audit chain references ───────────────────────────────────────
    auditRef,                    // Hyperledger Fabric event ref
    fabricBlockHash:  fabricHash, // deterministic from policy + UTR + ts

    // ── Meta ────────────────────────────────────────────────────────
    _note:    'Mock — SBI NPCI IMPS CIB channel (production integration pending IRDAI sandbox)',
    _endpoint:'api.onlinesbi.sbi/pgw/v2/imps/initiate  [MOCK]',
  }));
}
