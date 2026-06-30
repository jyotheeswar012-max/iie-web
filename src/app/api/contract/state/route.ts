import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function cors(r: NextResponse) {
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Judge-Key');
  return r;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

const ALL_STATES = ['ACTIVE', 'TRIGGERED', 'FRAUD_REVIEW', 'EXECUTED', 'REJECTED'] as const;
type FSMState = typeof ALL_STATES[number];

const STATE_COLORS: Record<FSMState, string> = {
  ACTIVE:       '#34d399',
  TRIGGERED:    '#fbbf24',
  FRAUD_REVIEW: '#f97316',
  EXECUTED:     '#4ade80',
  REJECTED:     '#f87171',
};

const STATE_DESCRIPTIONS: Record<FSMState, string> = {
  ACTIVE:       'Policy live. Monitoring oracle feeds. No trigger event detected yet.',
  TRIGGERED:    'Quorum met. Payout amount locked. Awaiting smart contract execution.',
  FRAUD_REVIEW: 'Anomaly detected. Escalated to human investigator (SLA: 72h). Payout frozen.',
  EXECUTED:     'Payout disbursed via IMPS. State is terminal. Immutable on-chain.',
  REJECTED:     'Claim rejected. Threshold not met or fraud confirmed. State is terminal.',
};

const VALID_TRANSITIONS: Record<FSMState, FSMState[]> = {
  ACTIVE:       ['TRIGGERED', 'FRAUD_REVIEW', 'REJECTED'],
  TRIGGERED:    ['EXECUTED', 'FRAUD_REVIEW'],
  FRAUD_REVIEW: ['EXECUTED', 'REJECTED'],
  EXECUTED:     [],
  REJECTED:     [],
};

export async function GET(req: NextRequest) {
  const url    = new URL(req.url);
  const policy = url.searchParams.get('policy_id') ?? 'SBI-IIE-00341';
  const state  = (url.searchParams.get('state') ?? 'ACTIVE').toUpperCase() as FSMState;
  const valid  = ALL_STATES.includes(state) ? state : 'ACTIVE';

  const GENESIS_BLOCK = 48_291_004;
  const GENESIS_TS    = 1751280000000;
  const block = GENESIS_BLOCK + Math.floor((Date.now() - GENESIS_TS) / 2000);

  return cors(NextResponse.json({
    policy_id: policy,
    current_state: valid,
    color: STATE_COLORS[valid],
    description: STATE_DESCRIPTIONS[valid],
    can_transition_to: VALID_TRANSITIONS[valid],
    is_terminal: VALID_TRANSITIONS[valid].length === 0,
    all_states: ALL_STATES.map(s => ({
      state: s,
      color: STATE_COLORS[s],
      description: STATE_DESCRIPTIONS[s],
      is_current: s === valid,
      is_terminal: VALID_TRANSITIONS[s].length === 0,
      transitions: VALID_TRANSITIONS[s],
    })),
    block_number: block,
    network: 'Polygon Mumbai (testnet)',
    hyperledger_ready: true,
    ts: new Date().toISOString(),
  }));
}
