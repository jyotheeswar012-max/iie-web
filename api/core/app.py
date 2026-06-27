"""
api/core/app.py
Central request dispatcher — maps (method, path) to handler functions.
All handlers return (http_status: int, response_dict: dict).
"""
import time
from urllib.parse import urlparse, parse_qs
from api.core import security, logging as log

# Import all route handlers
from api.oracle.engine         import handle_enroll, handle_verify, handle_feed
from api.blockchain.state_machine import handle_execute, handle_contract_get, handle_contracts_all
from api.audit.chain           import handle_audit
from api.ml.predictor          import handle_ml_predict, handle_ml_batch
from api.india_stack.simulator import handle_india_stack_verify, handle_upi_pay, handle_upi_txns
from api.core.store            import load
from api.core.utils            import now_iso, block_number

def dispatch(method: str, raw_path: str, headers: dict, body: dict, client_ip: str) -> tuple:
    t0    = time.time()
    parsed = urlparse(raw_path)
    path  = parsed.path.rstrip("/")
    qs    = parse_qs(parsed.query)

    # API key from header or query string
    key   = headers.get("x-iie-key") or headers.get("X-IIE-Key") or ""
    if not key:
        key = (qs.get("key") or [""])[0]

    allowed, tier, reason = security.check(path, key, client_ip)
    if not allowed:
        return 401, {"error": reason, "hint": "Add header X-IIE-Key: iie-demo-2026 or append ?key=iie-demo-2026"}

    status, data = _route(method, path, body, tier)

    ms = (time.time() - t0) * 1000
    log.trace_request(method, path, tier, ms, status)
    data["_meta"] = {"duration_ms": round(ms, 2), "tier": tier, "ts": now_iso()}
    return status, data

def _route(method: str, path: str, body: dict, tier: str) -> tuple:
    # Health
    if method == "GET" and path == "/api/health":
        return _health()

    # Oracle
    if method == "POST" and path == "/api/oracle/enroll":
        return handle_enroll(body)
    if method == "POST" and path == "/api/oracle/verify":
        return handle_verify(body)
    if method == "GET"  and path == "/api/oracle/feed":
        return handle_feed()

    # Blockchain / Smart Contract
    if method == "POST" and path == "/api/contract/execute":
        return handle_execute(body)
    if method == "GET"  and path == "/api/contract/all":
        return handle_contracts_all()
    if method == "GET"  and path.startswith("/api/contract/"):
        pid = path.split("/api/contract/")[-1]
        return handle_contract_get(pid)

    # Audit
    if method == "GET"  and path == "/api/audit/trail":
        return handle_audit()

    # ML
    if method == "POST" and path == "/api/ml/predict":
        return handle_ml_predict(body)
    if method == "GET"  and path == "/api/ml/batch":
        return handle_ml_batch()

    # India Stack
    if method == "POST" and path == "/api/india-stack/verify":
        return handle_india_stack_verify(body)
    if method == "POST" and path == "/api/yono/pay":
        return handle_upi_pay(body)
    if method == "GET"  and path == "/api/yono/transactions":
        return handle_upi_txns()

    return 404, {"error": "Route not found", "path": path,
                 "available": ["/api/health","/api/oracle/enroll","/api/oracle/verify",
                               "/api/oracle/feed","/api/contract/execute","/api/contract/all",
                               "/api/audit/trail","/api/ml/predict","/api/ml/batch",
                               "/api/india-stack/verify","/api/yono/pay","/api/yono/transactions"]}

def _health() -> tuple:
    store = load()
    from api.audit.chain import verify_chain
    return 200, {
        "status":         "ok",
        "version":        "4.0.0",
        "engines":        ["OracleEngine","MultiAgentOrchestrator","BlockchainSM",
                           "SHA256AuditChain","NaiveBayesML","IndiaStackSim"],
        "policies":       len(store["policies"]),
        "contracts":      len(store["contracts"]),
        "audit_entries":  len(store["audit_log"]),
        "chain_valid":    verify_chain(store["audit_log"]),
        "upi_txns":       len(store["upi_txns"]),
        "block_height":   block_number(),
    }
