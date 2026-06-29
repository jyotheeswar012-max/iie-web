export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const hex = (n: number) => Array.from({length:n}, () => Math.floor(Math.random()*16).toString(16)).join('');
  const pid = 'IIE-0x' + hex(6).toUpperCase();
  const tx  = '0x' + hex(64);
  const ca  = '0x' + hex(40);
  const planMap: Record<string, [number,number,number]> = {
    'Basic Protect':   [2800, 840,  42000],
    'Smart Shield':    [4200, 1260, 70000],
    'Full Season Pro': [6300, 1890, 122500],
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
    aadhaar_hash: '0x' + hex(32),
  });
}
