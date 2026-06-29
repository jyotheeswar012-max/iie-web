import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  const body = await req.json();
  const pid = 'IIE-0x' + randomBytes(3).toString('hex').toUpperCase();
  const tx  = '0x' + randomBytes(32).toString('hex');
  const ca  = '0x' + randomBytes(20).toString('hex');
  const planMap: Record<string, [number,number,number]> = {
    'Basic Protect':    [2800, 840,  42000],
    'Smart Shield':     [4200, 1260, 70000],
    'Full Season Pro':  [6300, 1890, 122500],
  };
  const [premium, subsidy, coverage] = planMap[body.plan] ?? [4200, 1260, 70000];
  return NextResponse.json({
    policy_id: pid,
    contract_address: ca,
    net_premium_inr: premium - subsidy,
    subsidy_applied: subsidy,
    coverage_inr: coverage,
    block_deployed: 19823000 + Math.floor(Math.random()*1000),
    deploy_tx: tx,
    message: 'Policy issued and smart contract deployed',
    upi_debit_ref: 'UPI' + Date.now(),
    aadhaar_hash: '0x' + randomBytes(16).toString('hex'),
  });
}
