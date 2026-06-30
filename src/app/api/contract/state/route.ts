import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const policy_id = url.searchParams.get('policy_id') ?? 'SBI-IIE-00341';

  return cors(NextResponse.json({
    policy_id,
    current_state: 'ACTIVE',
    states: {
      DRAFT:        { label: 'Draft',        color: '#64748b', description: 'Policy application submitted, KYC pending' },
      ACTIVE:       { label: 'Active',       color: '#34d399', description: 'Policy live, premium collected, monitoring oracle feeds' },
      TRIGGERED:    { label: 'Triggered',    color: '#fbbf24', description: 'Oracle quorum met, payout queued for execution' },
      FRAUD_REVIEW: { label: 'Fraud Review', color: '#f97316', description: 'Anomaly detected — claim under human/AI review' },
      EXECUTED:     { label: 'Executed',     color: '#4ade80', description: 'Payout completed via IMPS, tx recorded on-chain' },
      REJECTED:     { label: 'Rejected',     color: '#f87171', description: 'Claim rejected — quorum not met or fraud confirmed' },
    },
    transitions: {
      DRAFT:        ['ACTIVE'],
      ACTIVE:       ['TRIGGERED', 'REJECTED'],
      TRIGGERED:    ['FRAUD_REVIEW', 'EXECUTED'],
      FRAUD_REVIEW: ['EXECUTED', 'REJECTED'],
      EXECUTED:     [],
      REJECTED:     [],
    },
    hyperledger_ready: true,
    ts: new Date().toISOString(),
  }));
}
