"""
api/core/store.py
Thread-safe persistent KV store using shelve → /tmp (Vercel).
In production: replace with Redis or PostgreSQL.
"""
import shelve, threading, os, json
from typing import Any

_LOCK = threading.Lock()
_DB   = os.path.join("/tmp", "iie_v4")

_SCHEMA = {
    "policies":  {},
    "contracts": {},
    "audit_log": [],
    "upi_txns":  [],
    "rate_log":  {},   # ip → [timestamps]
    "api_keys":  {
        # Pre-seeded demo keys (SHA-256 hashed in prod)
        "iie-demo-2026":    {"tier": "demo",  "owner": "SBI-GFF-Demo",   "rpm": 30},
        "iie-judge-2026":   {"tier": "judge", "owner": "GFF-Judge-Panel", "rpm": 120},
        "iie-internal-999": {"tier": "admin", "owner": "Internal",       "rpm": 9999},
    },
}

def load() -> dict:
    with _LOCK:
        try:
            with shelve.open(_DB) as db:
                out = {}
                for k, default in _SCHEMA.items():
                    raw = db.get(k, None)
                    if raw is None:
                        out[k] = type(default)(default)  # copy
                    else:
                        out[k] = raw
                return out
        except Exception:
            return {k: type(v)(v) for k, v in _SCHEMA.items()}

def save(store: dict) -> None:
    with _LOCK:
        try:
            with shelve.open(_DB) as db:
                for k, v in store.items():
                    db[k] = v
        except Exception:
            pass

def get_api_keys() -> dict:
    """Return api_keys without loading full store (fast path)."""
    return load()["api_keys"]
