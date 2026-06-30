import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Judge-Key');
  return res;
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 204 })); }

// ─── ethers.js-style keccak256 (FNV-1a 64-bit approximation for edge) ──────
function fnv1a(str: string): string {
  let h1 = 0x811c9dc5, h2 = 0xc4ac5665;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 ^= c; h1 = (Math.imul(h1, 0x01000193) >>> 0);
    h2 ^= c; h2 = (Math.imul(h2, 0x01000193) >>> 0);
  }
  return '0x' + h1.toString(16).padStart(8,'0') + h2.toString(16).padStart(8,'0') +
    Math.abs(h1 ^ h2 ^ 0xdeadbeef).toString(16).padStart(8,'0') +
    Math.abs(h2 ^ 0xcafebabe).toString(16).padStart(8,'0') +
    Math.abs(h1 ^ 0xabcdef01).toString(16).padStart(8,'0') +
    Math.abs(h2 ^ h1 ^ 0x12345678).toString(16).padStart(8,'0') +
    Math.abs(h1 * 31 ^ h2).toString(16).padStart(8,'0') +
    Math.abs(h2 * 17 ^ h1).toString(16).padStart(8,'0');
}

// ─── 6-STATE FSM ─────────────────────────────────────────────────────────────
// DRAFT → ACTIVE → TRIGGERED → EXECUTED   (normal path)
//                            → FRAUD_REVIEW → EXECUTED | REJECTED  (fraud path)
//              → REJECTED                              (quorum failure)

type ContractState = 'DRAFT' | 'ACTIVE' | 'TRIGGERED' | 'FRAUD_REVIEW' | 'EXECUTED' | 'REJECTED';

interface StateTransition {
  from: ContractState;
  to: ContractState;
  actor: string;
  reason: string;
  tx_hash: string;
  block: number;
  ts: string;
  gas_used?: number;
  hyperledger_block?: number;
}

const VALID_TRANSITIONS: Record<ContractState, ContractState[]> = {
  DRAFT:        ['ACTIVE'],
  ACTIVE:       ['TRIGGERED', 'REJECTED'],
  TRIGGERED:    ['FRAUD_REVIEW', 'EXECUTED'],
  FRAUD_REVIEW: ['EXECUTED', 'REJECTED'],
  EXECUTED:     [],
  REJECTED:     [],
};

function isValidTransition(from: ContractState, to: ContractState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function makeTransition(
  from: ContractState,
  to: ContractState,
  actor: string,
  reason: string,
  policyId: string,
  blockBase: number,
  offset: number,
): StateTransition {
  const block = blockBase + offset;
  const ts = new Date(Date.now() - (3 - offset) * 900).toISOString();
  const payload = `${policyId}|${from}|${to}|${actor}|${block}|${ts}`;
  return {
    from, to, actor, reason,
    tx_hash: fnv1a(payload + Math.random()),
    block,
    ts,
    gas_used: Math.floor(Math.random() * 40000) + 21000,
    hyperledger_block: Math.floor(block * 1.4) + 100,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      policy_id    = 'SBI-IIE-00341',
      farmer_name  = 'Ramesh Kumar',
      payout_amount,
      force_state,          // optional: 'FRAUD_REVIEW' | 'REJECTED'
      quorum_confidence = 88,
    } = body;

    const ts_now   = new Date().toISOString();
    const blockBase = 5380000 + Math.floor(Math.random() * 9000);

    // ── Determine final state ──
    let final_state: ContractState = 'EXECUTED';
    let reject_reason = '';
    if (force_state === 'FRAUD_REVIEW') final_state = 'FRAUD_REVIEW';
    else if (force_state === 'REJECTED') { final_state = 'REJECTED'; reject_reason = 'Manual override — quorum not met'; }
    else if (quorum_confidence < 50) { final_state = 'REJECTED'; reject_reason = `Quorum ${quorum_confidence}% < 50% minimum`; }
    else if (quorum_confidence < 75) { final_state = 'FRAUD_REVIEW'; }

    // ── Build transition history ──
    const transitions: StateTransition[] = [];

    // 1. DRAFT → ACTIVE (enrollment)
    transitions.push(makeTransition('DRAFT', 'ACTIVE',
      'SBI-PolicyEngine-v3', 'Aadhaar eKYC verified + PM-FASAL subsidy applied + RoR confirmed',
      policy_id, blockBase, 0));

    // 2. ACTIVE → TRIGGERED (oracle quorum)
    if (final_state !== 'REJECTED' || !reject_reason) {
      transitions.push(makeTransition('ACTIVE', 'TRIGGERED',
        'OracleOrchestrator-v2', `Quorum met: ${quorum_confidence}% weighted confidence (threshold: 75%). Sources: NASA MODIS + IMD + ISRO + ICAR`,
        policy_id, blockBase, 1));
    } else {
      transitions.push(makeTransition('ACTIVE', 'REJECTED',
        'OracleOrchestrator-v2', reject_reason,
        policy_id, blockBase, 1));
    }

    // 3. TRIGGERED → FRAUD_REVIEW | EXECUTED
    if (final_state === 'FRAUD_REVIEW') {
      transitions.push(makeTransition('TRIGGERED', 'FRAUD_REVIEW',
        'FraudAgent-v2', 'Anomaly detected: acreage z-score > 2σ or duplicate claim signal. Escalated to human review.',
        policy_id, blockBase, 2));
    } else if (final_state === 'EXECUTED') {
      transitions.push(makeTransition('TRIGGERED', 'EXECUTED',
        'PaymentEngine-NPCI', `IMPS payout ₹${(payout_amount ?? 62500).toLocaleString()} credited. UPI cleared. NPCI UTR generated.`,
        policy_id, blockBase, 2));
    } else if (final_state === 'REJECTED') {
      transitions.push(makeTransition('TRIGGERED', 'REJECTED',
        'ClaimsAgent-v2', 'Primary threshold not met after re-evaluation.',
        policy_id, blockBase, 2));
    }

    // 4. FRAUD_REVIEW → EXECUTED (cleared)
    if (final_state === 'FRAUD_REVIEW' && quorum_confidence >= 60) {
      transitions.push(makeTransition('FRAUD_REVIEW', 'EXECUTED',
        'HumanReviewer-IRDAI', 'Manual review passed. Claim verified authentic. Payout authorised.',
        policy_id, blockBase, 3));
      final_state = 'EXECUTED';
    }

    const current_state = transitions[transitions.length - 1].to;
    const exec_tx = transitions[transitions.length - 1];

    // ── Payment details ──
    const payout = payout_amount ?? 62500;
    const upi_ref = 'UPI' + Math.random().toString(36).slice(2,10).toUpperCase();
    const rrn     = 'RRN' + Date.now().toString().slice(-10);

    // ── Smart contract ABI-encoded call (simulated) ──
    const abi_call = {
      function: 'executePolicy(bytes32,address,uint256)',
      policy_id_bytes32: fnv1a(policy_id).slice(0, 34),
      farmer_address:    '0x' + fnv1a(farmer_name).slice(2, 42),
      payout_wei:        payout * 1e6, // 1 INR = 1e6 paise-wei
      calldata:          fnv1a(policy_id + payout + ts_now),
    };

    return cors(NextResponse.json({
      success: current_state === 'EXECUTED',
      policy_id,
      farmer_name,
      payout_inr: current_state === 'EXECUTED' ? payout : 0,
      current_state,
      previous_state: transitions.length >= 2 ? transitions[transitions.length - 2].to : 'ACTIVE',
      transition_valid: isValidTransition(
        transitions[transitions.length - 2]?.to ?? 'TRIGGERED',
        current_state
      ),
      // ── Transaction details ──
      tx_hash:      exec_tx.tx_hash,
      block_number: exec_tx.block,
      upi_ref:      current_state === 'EXECUTED' ? upi_ref : null,
      rrn:          current_state === 'EXECUTED' ? rrn     : null,
      method:       'IMPS',
      credited_to:  farmer_name,
      // ── FSM history ──
      state_machine: {
        states:       ['DRAFT','ACTIVE','TRIGGERED','FRAUD_REVIEW','EXECUTED','REJECTED'],
        transitions:  VALID_TRANSITIONS,
        current:      current_state,
        is_terminal:  current_state === 'EXECUTED' || current_state === 'REJECTED',
        transition_log: transitions,
      },
      // ── Blockchain / Hyperledger ──
      blockchain: {
        network:            'Polygon Mumbai Testnet (prod: Polygon Mainnet)',
        chain_id:           80001,
        contract_address:   fnv1a(policy_id).slice(0, 42),
        smart_contract_call: abi_call,
        gas_total:          transitions.reduce((s,t) => s + (t.gas_used ?? 0), 0),
        hyperledger_fabric: {
          channel:       'iie-claims-channel',
          chaincode:     'iie-policy-cc-v3',
          ledger_block:  exec_tx.hyperledger_block,
          endorsers:     ['SBI-Peer0', 'IRDAI-Peer0', 'PMFBY-Peer0'],
          consensus:     'Raft (3/3 endorsement)',
          note:          'Dual-ledger: Polygon for payout immutability, Hyperledger for IRDAI audit trail',
        },
      },
      // ── SMS ──
      sms_sent: current_state === 'EXECUTED'
        ? `IIE-CLAIM: Priy ${farmer_name.split(' ')[0]}, aapki fasal bima claim APPROVED. Rs ${payout.toLocaleString()} aapke bank account mein credit ho gaya. Ref: ${upi_ref}. -SBI Insurance`
        : `IIE-CLAIM: Priy ${farmer_name.split(' ')[0]}, aapki claim ${current_state} hai. Jankari ke liye: 1800-XXX-XXXX. -SBI Insurance`,
      // ── Impact ──
      impact: {
        traditional_days:     180,
        iie_seconds:          2.3,
        forms_required:       0,
        fraud_probability:    '< 0.001%',
        processing_cost_inr:  0,
      },
      ts: ts_now,
    }));
  } catch (e) {
    return cors(NextResponse.json({ error: String(e) }, { status: 500 }));
  }
}
