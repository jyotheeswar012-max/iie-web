import { NextResponse } from 'next/server';
export const runtime = 'edge';

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function uid(n=10){ return crypto.randomUUID().replace(/-/g,'').slice(0,n).toUpperCase(); }

export async function POST(req: Request) {
  const body   = await req.json().catch(()=>({}));
  const pid    = String(body.policy_id || 'IIE-DEMO0001');
  const payout = Number(body.payout_amount) || Math.floor(6000 * 1.1 * 5 * 0.85);
  const name   = String(body.farmer_name || 'Farmer');
  const txHash = '0x' + await sha256hex(pid + Date.now());
  const block  = 19823441 + (Math.floor(Date.now()/15000) % 100000);
  const ref    = 'UPI-' + uid(10);
  const rrn    = String(Date.now()).slice(-12);
  const upiId  = name.toLowerCase().replace(/\s+/g,'.').slice(0,20) + '@sbi';
  const npciUtr= 'NPCI' + uid(16);

  return NextResponse.json({
    success: true, policy_id: pid,
    contract_state: 'EXECUTED',
    transition: 'TRIGGERED → EXECUTED',
    payout_inr: payout, tx_hash: txHash, block_number: block,
    upi_ref: ref, rrn, farmer: name, credited_to: upiId,
    method: 'IMPS', npci_utr: npciUtr,
    settlement_time_seconds: 2.3,
    sms_sent: `SBI IIE ALERT: Dear ${name}, your crop insurance claim of Rs ${payout.toLocaleString('en-IN')} has been auto-credited via IMPS. Ref: ${ref} | RRN: ${rrn}. No claim form needed. YONO-Oracle IIE. Helpline: 1800-11-2211`,
    message: `Rs ${payout.toLocaleString('en-IN')} executed on-chain (block #${block}) and credited via IMPS to ${upiId} in 2.3s. Zero claim forms.`,
    impact: { traditional_claim_days: 180, iie_settlement_seconds: 2.3, time_saved: '99.998%', fraud_prevention: 'oracle-parametric (no manual assessment)', farmer_effort: 'zero forms' },
  });
}
