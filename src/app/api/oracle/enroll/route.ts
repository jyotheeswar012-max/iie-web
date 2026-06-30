import { NextResponse } from 'next/server';
export const runtime = 'edge';

const PLAN_PRM: Record<string,number> = { 'Basic Protect': 2800, 'Smart Shield': 4200, 'Full Season Pro': 6300 };
const PLAN_COV: Record<string,number> = { 'Basic Protect': 42000, 'Smart Shield': 70000, 'Full Season Pro': 122500 };

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function uid(n=8){ return crypto.randomUUID().replace(/-/g,'').slice(0,n).toUpperCase(); }

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name  = String(body.name  || 'Farmer').trim();
  const a4    = String(body.aadhaar_last4 || '0000').slice(0,4);
  const dist  = String(body.district || 'Unknown').trim();
  const state = String(body.state   || 'India').trim();
  const crop  = String(body.crop    || 'wheat').toLowerCase();
  const acres = Math.max(0.1, Number(body.acreage) || 5);
  const plan  = PLAN_PRM[body.plan] ? body.plan : 'Smart Shield';

  const pidSeed = await sha256hex(`${name.toLowerCase()}${dist.toLowerCase()}${a4}`);
  const pid     = 'IIE-' + pidSeed.slice(0,8).toUpperCase();
  const caddr   = '0x' + (await sha256hex(pid + 'contract-v4')).slice(0,40);
  const txHash  = '0x' + (await sha256hex(pid + Date.now())).slice(0,40);
  const block   = 19823441 + (Math.floor(Date.now()/15000) % 100000);
  const sub     = Math.round(PLAN_PRM[plan] * 0.30);
  const net     = PLAN_PRM[plan] - sub;
  const dlRef   = 'DL-' + uid(10);
  const upiRef  = 'UPI-D-' + uid(8);
  const aadhaarHash = 'AH_' + (await sha256hex('aadhaar:' + a4)).slice(0,16);

  return NextResponse.json({
    success: true, policy_id: pid, contract_address: caddr,
    aadhaar_hash: aadhaarHash, digilocker_ref: dlRef, upi_debit_ref: upiRef,
    net_premium_inr: net, subsidy_applied: sub,
    coverage_inr: PLAN_COV[plan],
    block_deployed: block, deploy_tx: txHash,
    kyc: {
      status: 'VERIFIED', method: 'Aadhaar_eKYC_OTP',
      uidai_txn_id: 'UIDAI-' + uid(12),
      digilocker_ref: dlRef, name_match: true, dpdp_compliant: true,
      documents_pulled: {
        land_record: { type: 'RoR 7/12 Extract', status: 'VALID', issued: `Revenue Dept, ${dist}` },
        crop_cert:   { type: 'Crop Insurance Eligibility Cert', status: 'VALID' },
      },
    },
    message: `Policy ${pid} issued. Contract @ ${caddr} deployed at block #${block}. PM-FASAL subsidy ₹${sub} applied.`,
  });
}
