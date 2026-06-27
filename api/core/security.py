"""
api/core/security.py
API-key authentication + per-key rate limiting.

Flow:
  1. Client sends header:  X-IIE-Key: <key>
     OR query param:       ?key=<key>
  2. Key validated against store.api_keys
  3. Rate window (60s rolling) checked against key.rpm limit
  4. Returns (ok: bool, tier: str, error_msg: str)
"""
import time
from api.core.store import load, save
from api.core import logging as log

OPEN_PATHS = {"/api/health", "/api/oracle/feed", "/api/ml/batch"}

def check(path: str, key: str, client_ip: str) -> tuple:
    """
    Returns (allowed: bool, tier: str, reason: str)
    """
    # Open paths — no key required
    if path in OPEN_PATHS:
        return True, "open", ""

    if not key:
        return False, "", "Missing X-IIE-Key header. Use key=iie-demo-2026 for demo access."

    store = load()
    keys  = store.get("api_keys", {})

    if key not in keys:
        log.warn("auth_failed", key_prefix=key[:8], ip=client_ip)
        return False, "", "Invalid API key."

    meta  = keys[key]
    tier  = meta["tier"]
    rpm   = meta.get("rpm", 30)

    # Rolling 60-second rate window per key
    now   = time.time()
    rlog  = store.get("rate_log", {})
    hits  = [t for t in rlog.get(key, []) if now - t < 60]

    if len(hits) >= rpm:
        log.warn("rate_limited", key_prefix=key[:8], tier=tier, hits=len(hits), rpm=rpm)
        return False, tier, f"Rate limit exceeded ({rpm} req/min for {tier} tier). Retry after 60s."

    hits.append(now)
    rlog[key] = hits
    store["rate_log"] = rlog
    save(store)

    log.info("auth_ok", key_prefix=key[:8], tier=tier, rpm_used=len(hits))
    return True, tier, ""
