export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const hex = (n: number) => Array.from({length:n}, () => Math.floor(Math.random()*16).toString(16)).join('');
  const tx  = '0x' + hex(64);
  const upi = 'UPI' + Date.now();
  const rrn = String(100000000000 + Math.floor(Math.random()*899999999999));
  return NextResponse.json({
    success: true,
    policy_id:    body.policy_id,
    payout_inr:   48200,
    tx_hash:      tx,
    block_number: 19823000 + Math.floor(Math.random()*2000),
    upi_ref:      upi,
    rrn,
    farmer:       'Ravi Kumar',
    credited_to:  'YONO SBI ••3842',
    method:       'IMPS/UPI',
    sms_sent:     'Dear Ravi Kumar, ₹48,200 credited to your YONO SBI account via IMPS. Ref: ' + upi + '. IIE Parametric Payout — Drought Event Barmer.',
    message:      'Payout executed and credited via IMPS',
  });
}
