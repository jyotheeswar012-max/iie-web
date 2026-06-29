export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const tx  = '0x' + hex(64);
    const upi = 'UPI' + Date.now();
    const rrn = String(100000000000 + Math.floor(Math.random() * 899999999999));
    const policyId = body.policy_id ?? 'IIE-DEMO';
    return NextResponse.json({
      success: true,
      policy_id:    policyId,
      payout_inr:   48200,
      tx_hash:      tx,
      block_number: 19823000 + Math.floor(Math.random() * 2000),
      upi_ref:      upi,
      rrn,
      farmer:       'Ravi Kumar',
      credited_to:  'YONO SBI \u2022\u20223842',
      method:       'IMPS/UPI',
      sms_sent:     'Dear Ravi Kumar, \u20b948,200 credited to your YONO SBI account via IMPS. Ref: ' + upi + '. IIE Parametric Payout \u2014 Drought Event Barmer.',
      message:      'Payout executed and credited via IMPS',
    });
  } catch {
    return NextResponse.json({ error: 'execute failed' }, { status: 500 });
  }
}
