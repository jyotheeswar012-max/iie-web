"""
api/blockchain/state_machine.py
Smart Contract State Machine — ACTIVE → TRIGGERED → EXECUTED → DISPUTED?

Each state transition:
  - Generates a unique SHA-256 tx hash
  - Appended to on-chain history with block number
  - Locked — cannot go backward
  - Written to tamper-evident audit chain

Simulates Hyperledger Fabric channel transaction lifecycle.
In production: Fabric SDK chaincode invoke via gRPC.
"""
from api.core.utils  import now_iso, tx_hash, block_number, upi_ref, rrn as _rrn, uid
from api.core.store  import load, save
from api.core        import logging as log
from api.audit.chain import append as audit_append

BASE_PAYOUT = {"drought": 6000, "flood": 8500, "heatwave": 7200, "cyclone": 9500}

VALID_TRANSITIONS = {
    "ACTIVE":    ["TRIGGERED", "CANCELLED"],
    "TRIGGERED": ["EXECUTED",  "DISPUTED"],
    "EXECUTED":  [],  # terminal
    "DISPUTED":  ["EXECUTED", "REJECTED"],
    "CANCELLED": [],  # terminal
    "REJECTED":  [],  # terminal
}


def _can_transition(current: str, target: str) -> bool:
    return target in VALID_TRANSITIONS.get(current, [])


def handle_execute(body: dict) -> tuple:
    store    = load()
    pid      = str(body.get("policy_id", ""))
    force    = bool(body.get("force", False))

    if pid not in store["contracts"]:
        return 404, {"error": f"Contract not found for policy {pid}"}

    contract = store["contracts"][pid]
    policy   = store["policies"][pid]
    current  = contract["state"]

    if current == "EXECUTED":
        return 200, {"message": "Already executed.", "contract": contract}

    target = "EXECUTED"
    if not _can_transition(current, target) and not force:
        return 400, {
            "error": f"Invalid transition: {current} → {target}.",
            "hint":  f"Valid next states from '{current}': {VALID_TRANSITIONS.get(current, [])}",
            "run_first": "POST /api/oracle/verify to trigger the contract first.",
        }

    payout  = contract.get("payout_amount") or round(
        BASE_PAYOUT.get(contract.get("event_type", "drought"), 6000) * policy.get("acreage", 1)
    )
    tx      = tx_hash("execute:" + pid)
    blk     = block_number()
    ref     = upi_ref()
    rrn_val = _rrn()
    upi_id  = policy["name"].lower().replace(" ", ".")[:20] + "@sbi"
    sms     = (
        f"SBI IIE ALERT: Dear {policy['name']}, your crop insurance claim of "
        f"Rs {payout:,} has been auto-credited to your SBI a/c via IMPS. "
        f"Ref: {ref} | RRN: {rrn_val}. No claim form needed. "
        f"Powered by YONO-Oracle IIE. Helpline: 1800-11-2211"
    )

    # State transition
    prev_state = current
    contract.update({
        "state":          "EXECUTED",
        "executed_at":    now_iso(),
        "tx_hash":        tx,
        "block_number":   blk,
        "payout_tx":      ref,
        "payout_amount":  payout,
        "upi_id":         upi_id,
        "rrn":            rrn_val,
    })
    contract["history"].append({
        "state":      "EXECUTED",
        "prev_state": prev_state,
        "at":         now_iso(),
        "tx":         tx,
        "block":      blk,
        "payout_inr": payout,
        "transition": f"{prev_state} → EXECUTED",
    })

    upi_entry = {
        "ref":         ref,
        "rrn":         rrn_val,
        "policy_id":   pid,
        "farmer":      policy["name"],
        "amount_inr":  payout,
        "upi_id":      upi_id,
        "status":      "SUCCESS",
        "method":      "IMPS",
        "credited_at": now_iso(),
        "tx_hash":     tx,
        "block_number": blk,
    }
    store["upi_txns"].append(upi_entry)
    store["contracts"][pid] = contract
    audit_append(store, "CONTRACT_EXECUTED", pid, {
        "tx_hash":       tx,
        "block_number":  blk,
        "payout_inr":    payout,
        "upi_ref":       ref,
        "rrn":           rrn_val,
        "farmer":        policy["name"],
        "transition":    f"{prev_state} → EXECUTED",
    })
    save(store)
    log.info("contract_executed", policy_id=pid, payout=payout, tx=tx, block=blk)

    return 200, {
        "success":         True,
        "policy_id":       pid,
        "contract_state":  "EXECUTED",
        "transition":      f"{prev_state} → EXECUTED",
        "payout_inr":      payout,
        "tx_hash":         tx,
        "block_number":    blk,
        "upi_ref":         ref,
        "rrn":             rrn_val,
        "farmer":          policy["name"],
        "credited_to":     upi_id,
        "method":          "IMPS",
        "sms_sent":        sms,
        "valid_transitions": VALID_TRANSITIONS,
        "message": (f"Rs {payout:,} executed on-chain (block #{blk}, tx {tx[:20]}...) "
                    f"and credited via IMPS to {upi_id}. Zero claim forms."),
    }


def handle_contract_get(pid: str) -> tuple:
    store = load()
    if pid not in store["contracts"]:
        return 404, {"error": f"Contract not found: {pid}"}
    c = store["contracts"][pid]
    return 200, {
        "contract": c,
        "policy":   store["policies"].get(pid),
        "valid_next_states": VALID_TRANSITIONS.get(c["state"], []),
        "state_machine": VALID_TRANSITIONS,
    }


def handle_contracts_all() -> tuple:
    store = load()
    contracts = list(store["contracts"].values())
    by_state = {}
    for c in contracts:
        by_state.setdefault(c["state"], 0)
        by_state[c["state"]] += 1
    return 200, {"total": len(contracts), "by_state": by_state, "contracts": contracts}
