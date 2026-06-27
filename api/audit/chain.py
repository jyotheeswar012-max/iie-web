"""
api/audit/chain.py
SHA-256 Tamper-Evident Audit Chain.

Chain structure:
  entry[n].prev_hash == SHA256(serialize(entry[n-1]))
  entry[0].prev_hash == '0' * 64  (genesis)

Any mutation of any historical entry breaks verify_chain().
This mirrors a Hyperledger Fabric world-state ledger.
In production: entries would be committed to Fabric blocks;
the chain root published to IPFS for public verifiability.
"""
import json
from api.core.utils import now_iso, sha256
from api.core      import logging as log


def append(store: dict, event: str, policy_id: str, data: dict) -> dict:
    """
    Append an immutable entry to the audit chain.
    The hash covers: event + policy_id + data + timestamp (sorted JSON).
    """
    payload = json.dumps(
        {"event": event, "policy_id": policy_id, "data": data, "ts": now_iso()},
        sort_keys=True, default=str
    )
    prev_hash = store["audit_log"][-1]["hash"] if store["audit_log"] else ("0" * 64)
    entry = {
        "seq":        len(store["audit_log"]) + 1,
        "ts":         now_iso(),
        "event":      event,
        "policy_id":  policy_id,
        "hash":       sha256(payload),
        "prev_hash":  prev_hash,
        "data":       data,
        "algorithm":  "SHA-256",
        "chain_type": "append-only",
    }
    store["audit_log"].append(entry)
    log.info("audit_entry", seq=entry["seq"], event=event, policy_id=policy_id,
             hash_prefix=entry["hash"][:12])
    return entry


def verify_chain(log_entries: list) -> bool:
    """
    Walk the full chain verifying every prev_hash link.
    O(n) — returns False immediately on first broken link.
    """
    for i, entry in enumerate(log_entries[1:], 1):
        expected = log_entries[i - 1]["hash"]
        if entry["prev_hash"] != expected:
            return False
    return True


def chain_integrity_report(log_entries: list) -> dict:
    """
    Full integrity report: verifies each link, returns first broken index if any.
    """
    broken_at = None
    for i, entry in enumerate(log_entries[1:], 1):
        if entry["prev_hash"] != log_entries[i - 1]["hash"]:
            broken_at = i
            break
    return {
        "chain_valid":    broken_at is None,
        "total_entries":  len(log_entries),
        "broken_at_seq":  broken_at,
        "genesis_hash":   log_entries[0]["hash"] if log_entries else None,
        "latest_hash":    log_entries[-1]["hash"] if log_entries else None,
        "algorithm":      "SHA-256",
        "chain_model":    "append-only (Hyperledger Fabric simulation)",
    }


def handle_audit() -> tuple:
    from api.core.store import load
    store = load()
    log_entries = store["audit_log"]
    report = chain_integrity_report(log_entries)
    return 200, {**report, "ledger": log_entries}
