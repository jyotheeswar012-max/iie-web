"""
api/core/app.py  v5.1.0
Central request dispatcher for Vercel serverless handler.
All heavy imports are wrapped in try/except — app stays alive even if
scikit-learn, slowapi, or other optional packages are missing on Vercel.
"""
import time
from urllib.parse import urlparse, parse_qs

# ---------------------------------------------------------------------------
# CORE IMPORTS (always available — stdlib only)
# ---------------------------------------------------------------------------
try:
    from api.core import security, logging as log
except ImportError:
    from core import security, logging as log

try:
    from api.core.store import load
    from api.core.utils import now_iso, block_number
except ImportError:
    from core.store import load
    from core.utils import now_iso, block_number

# ---------------------------------------------------------------------------
# EXISTING MODULE IMPORTS
# ---------------------------------------------------------------------------
try:
    from api.oracle.engine            import handle_enroll, handle_verify, handle_feed
    from api.blockchain.state_machine import handle_execute, handle_contract_get, handle_contracts_all
    from api.audit.chain              import handle_audit, verify_chain
    from api.ml.predictor             import handle_ml_predict, handle_ml_batch
    from api.india_stack.simulator    import handle_india_stack_verify, handle_upi_pay, handle_upi_txns
    _CORE_AVAILABLE = True
except ImportError:
    try:
        from oracle.engine            import handle_enroll, handle_verify, handle_feed
        from blockchain.state_machine import handle_execute, handle_contract_get, handle_contracts_all
        from audit.chain              import handle_audit, verify_chain
        from ml.predictor             import handle_ml_predict, handle_ml_batch
        from india_stack.simulator    import handle_india_stack_verify, handle_upi_pay, handle_upi_txns
        _CORE_AVAILABLE = True
    except ImportError as e:
        print(f"[app] Core module import failed: {e}")
        _CORE_AVAILABLE = False
        def handle_enroll(b): return 503, {"error": "Core module unavailable"}
        def handle_verify(b): return 503, {"error": "Core module unavailable"}
        def handle_feed():    return 503, {"error": "Core module unavailable"}
        def handle_execute(b):        return 503, {"error": "Core module unavailable"}
        def handle_contract_get(p):   return 503, {"error": "Core module unavailable"}
        def handle_contracts_all():   return 503, {"error": "Core module unavailable"}
        def handle_audit():           return 503, {"error": "Core module unavailable"}
        def verify_chain(l):          return True
        def handle_ml_predict(b):     return 503, {"error": "Core module unavailable"}
        def handle_ml_batch():        return 503, {"error": "Core module unavailable"}
        def handle_india_stack_verify(b): return 503, {"error": "Core module unavailable"}
        def handle_upi_pay(b):        return 503, {"error": "Core module unavailable"}
        def handle_upi_txns():        return 503, {"error": "Core module unavailable"}

# ---------------------------------------------------------------------------
# NEW MODULE IMPORTS (optional — graceful fallback if missing)
# ---------------------------------------------------------------------------

# Agents
_AGENTS_AVAILABLE = False
try:
    try:
        from api.agents.orchestrator import orchestrate as _orchestrate, PIPELINE as _PIPELINE
    except ImportError:
        from agents.orchestrator import orchestrate as _orchestrate, PIPELINE as _PIPELINE
    _AGENTS_AVAILABLE = True
except Exception as e:
    print(f"[app] Agents import failed: {e}")
    _PIPELINE = []

# ML Scorer (needs scikit-learn — optional)
_ML_SCORER_AVAILABLE = False
_MODEL_SOURCE = "unavailable"
try:
    try:
        from api.ml.risk_scorer import score_risk as _score_risk, DISTRICT_NDVI_BASELINE as _DISTRICTS, _MODEL_SOURCE
    except ImportError:
        from ml.risk_scorer import score_risk as _score_risk, DISTRICT_NDVI_BASELINE as _DISTRICTS, _MODEL_SOURCE
    _ML_SCORER_AVAILABLE = True
except Exception as e:
    print(f"[app] ML scorer import failed (scikit-learn missing?): {e}")
    def _score_risk(**kwargs): return {"error": "ML scorer unavailable — scikit-learn not installed"}
    _DISTRICTS = {}

# Auth
_AUTH_AVAILABLE = False
try:
    try:
        from api.core.auth import create_access_token, verify_token, authenticate_user, ROLES, SANDBOX_USERS
    except ImportError:
        from core.auth import create_access_token, verify_token, authenticate_user, ROLES, SANDBOX_USERS
    _AUTH_AVAILABLE = True
except Exception as e:
    print(f"[app] Auth import failed: {e}")
    ROLES = {}; SANDBOX_USERS = {}
    def authenticate_user(u, p): return None
    def create_access_token(d): return ""
    def verify_token(t): raise Exception("Auth unavailable")

# India Stack v2
_INDIA_STACK_V2 = False
try:
    try:
        from api.india_stack.aadhaar_mock    import _OTP_SESSIONS, SANDBOX_RESIDENTS, _aadhaar_hmac
        from api.india_stack.digilocker_mock import MOCK_DOCUMENTS
    except ImportError:
        from india_stack.aadhaar_mock    import _OTP_SESSIONS, SANDBOX_RESIDENTS, _aadhaar_hmac
        from india_stack.digilocker_mock import MOCK_DOCUMENTS
    _INDIA_STACK_V2 = True
except Exception as e:
    print(f"[app] India Stack v2 import failed: {e}")
    _OTP_SESSIONS = {}; SANDBOX_RESIDENTS = {}; MOCK_DOCUMENTS = {}
    def _aadhaar_hmac(x): return ""

import asyncio
import uuid, random
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# MAIN DISPATCHER
# ---------------------------------------------------------------------------
def dispatch(method: str, raw_path: str, headers: dict, body: dict, client_ip: str) -> tuple:
    t0     = time.time()
    parsed = urlparse(raw_path)
    path   = parsed.path.rstrip("/")
    qs     = parse_qs(parsed.query)

    key = headers.get("x-iie-key") or headers.get("X-IIE-Key") or (qs.get("key") or [""])[0]
    allowed, tier, reason = security.check(path, key, client_ip)
    if not allowed:
        return 401, {"error": reason, "hint": "Add header X-IIE-Key: iie-demo-2026"}

    status, data = _route(method, path, body, headers, tier)

    ms = (time.time() - t0) * 1000
    log.trace_request(method, path, tier, ms, status)
    if isinstance(data, dict):
        data["_meta"] = {"duration_ms": round(ms, 2), "tier": tier, "ts": now_iso(), "v": "5.1.0"}
    return status, data


# ---------------------------------------------------------------------------
# ROUTER
# ---------------------------------------------------------------------------
def _route(method: str, path: str, body: dict, headers: dict, tier: str) -> tuple:

    if method == "GET" and path == "/api/health":
        return _health()

    if path.startswith("/api/auth"):
        return _route_auth(method, path, body, headers)

    if path.startswith("/api/india-stack/aadhaar"):
        return _route_aadhaar(method, path, body)

    if path.startswith("/api/india-stack/digilocker"):
        return _route_digilocker(method, path, body)

    if method == "POST" and path == "/api/india-stack/verify":
        return handle_india_stack_verify(body)

    if method == "POST" and path == "/api/oracle/enroll":
        return handle_enroll(body)
    if method == "POST" and path == "/api/oracle/verify":
        return handle_verify(body)
    if method == "GET"  and path == "/api/oracle/feed":
        return handle_feed()

    if method == "POST" and path == "/api/contract/execute":
        return handle_execute(body)
    if method == "GET"  and path == "/api/contract/all":
        return handle_contracts_all()
    if method == "GET"  and path.startswith("/api/contract/"):
        return handle_contract_get(path.split("/api/contract/")[-1])

    if path.startswith("/api/agents"):
        return _route_agents(method, path, body)

    if method == "POST" and path == "/api/ml/score":
        return _ml_score(body)
    if method == "POST" and path == "/api/ml/batch-score":
        return _ml_batch_score(body)
    if method == "GET"  and path == "/api/ml/model-info":
        return _ml_model_info()
    if method == "POST" and path == "/api/ml/predict":
        return handle_ml_predict(body)
    if method == "GET"  and path == "/api/ml/batch":
        return handle_ml_batch()

    if method == "GET"  and path == "/api/audit/trail":
        return handle_audit()
    if method == "POST" and path == "/api/yono/pay":
        return handle_upi_pay(body)
    if method == "GET"  and path == "/api/yono/transactions":
        return handle_upi_txns()

    return 404, {
        "error": "Route not found", "path": path,
        "routes": {
            "auth":    ["POST /api/auth/token","GET /api/auth/me","GET /api/auth/sandbox-users"],
            "oracle":  ["POST /api/oracle/enroll","POST /api/oracle/verify","GET /api/oracle/feed"],
            "agents":  ["POST /api/agents/orchestrate","GET /api/agents/status"],
            "ml":      ["POST /api/ml/score","POST /api/ml/batch-score","GET /api/ml/model-info"],
            "contract":["POST /api/contract/execute","GET /api/contract/all","GET /api/contract/{id}"],
            "audit":   ["GET /api/audit/trail"],
            "yono":    ["POST /api/yono/pay","GET /api/yono/transactions"],
        }
    }


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------
def _route_auth(method, path, body, headers):
    if not _AUTH_AVAILABLE:
        return 503, {"error": "Auth module unavailable"}

    if method == "POST" and path == "/api/auth/token":
        user = authenticate_user(body.get("username",""), body.get("password",""))
        if not user:
            return 401, {"error": "Invalid credentials"}
        return 200, {
            "access_token": create_access_token(user),
            "token_type":   "bearer",
            "role":         user["role"],
            "permissions":  ROLES.get(user["role"], []),
            "expires_in":   3600,
        }

    if method == "GET" and path == "/api/auth/me":
        auth = headers.get("authorization", "")
        if not auth.startswith("Bearer "):
            return 401, {"error": "Bearer token required"}
        try:
            p = verify_token(auth[7:])
            return 200, {"sub": p.get("sub"), "role": p.get("role"), "exp": p.get("exp")}
        except Exception as e:
            return 401, {"error": str(e)}

    if method == "GET" and path == "/api/auth/sandbox-users":
        return 200, {"note": "GFF 2026 sandbox only.",
                     "users": [{"username": u, "password": v["password"], "role": v["role"]}
                               for u, v in SANDBOX_USERS.items() if u != "admin"]}
    return 404, {"error": f"Auth route not found: {method} {path}"}


# ---------------------------------------------------------------------------
# AADHAAR
# ---------------------------------------------------------------------------
def _route_aadhaar(method, path, body):
    if not _INDIA_STACK_V2:
        return 503, {"error": "India Stack v2 unavailable"}

    if method == "POST" and path == "/api/india-stack/aadhaar/send-otp":
        last4 = body.get("aadhaar_last4", "")
        if last4 not in SANDBOX_RESIDENTS:
            return 404, {"error": f"Aadhaar last4 '{last4}' not in sandbox",
                         "available": list(SANDBOX_RESIDENTS.keys())}
        session_id = str(uuid.uuid4())
        otp = str(random.randint(100000, 999999))
        _OTP_SESSIONS[session_id] = {"aadhaar_last4": last4, "otp": otp, "used": False}
        return 200, {"success": True, "session_id": session_id,
                     "otp_hint": f"SANDBOX OTP: {otp}",
                     "sandbox_note": "GFF 2026 sandbox only."}

    if method == "POST" and path == "/api/india-stack/aadhaar/verify-otp":
        if not body.get("consent"):
            return 400, {"error": "Explicit consent required"}
        session = _OTP_SESSIONS.get(body.get("session_id",""))
        if not session:            return 404, {"error": "Session not found"}
        if session.get("used"):   return 400, {"error": "OTP already used"}
        if session["otp"] != body.get("otp",""):  return 401, {"error": "Invalid OTP"}
        session["used"] = True
        r = SANDBOX_RESIDENTS[session["aadhaar_last4"]]
        return 200, {"status": "VALID", "aadhaar_hash": _aadhaar_hmac(session["aadhaar_last4"]),
                     "name": r["name"], "district": r["district"], "state": r["state"],
                     "verified_at": datetime.now(timezone.utc).isoformat()}

    if method == "GET" and path == "/api/india-stack/aadhaar/status":
        return 200, {"service": "Aadhaar eKYC", "mode": "SANDBOX",
                     "residents": list(SANDBOX_RESIDENTS.keys())}
    return 404, {"error": f"Aadhaar route not found: {path}"}


# ---------------------------------------------------------------------------
# DIGILOCKER
# ---------------------------------------------------------------------------
def _route_digilocker(method, path, body):
    if not _INDIA_STACK_V2:
        return 503, {"error": "India Stack v2 unavailable"}

    if method == "POST" and path == "/api/india-stack/digilocker/fetch":
        if not body.get("consent"):
            return 400, {"error": "Explicit consent required"}
        doc = MOCK_DOCUMENTS.get(body.get("doc_type","").upper())
        if not doc:
            return 404, {"error": "Document not found", "available": list(MOCK_DOCUMENTS.keys())}
        return 200, {"success": True, "request_id": "DL-" + uuid.uuid4().hex[:12].upper(),
                     "document": doc, "fetched_at": datetime.now(timezone.utc).isoformat()}

    if method == "GET" and path == "/api/india-stack/digilocker/available-docs":
        return 200, {"documents": list(MOCK_DOCUMENTS.keys())}

    if method == "GET" and path == "/api/india-stack/digilocker/status":
        return 200, {"service": "DigiLocker", "mode": "SANDBOX", "docs": len(MOCK_DOCUMENTS)}
    return 404, {"error": f"DigiLocker route not found: {path}"}


# ---------------------------------------------------------------------------
# AGENTS
# ---------------------------------------------------------------------------
def _route_agents(method, path, body):
    if not _AGENTS_AVAILABLE:
        return 503, {"error": "Agents module unavailable"}

    if method == "POST" and path == "/api/agents/orchestrate":
        event_type  = body.get("event_type", "drought")
        oracle_data = body.get("oracle_data", {})
        policy      = body.get("policy", {})
        if not oracle_data:
            return 400, {"error": "oracle_data is required"}
        try:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_closed(): raise RuntimeError
                result = loop.run_until_complete(_orchestrate({"event_type": event_type, "oracle_data": oracle_data, "policy": policy}))
            except RuntimeError:
                loop = asyncio.new_event_loop()
                result = loop.run_until_complete(_orchestrate({"event_type": event_type, "oracle_data": oracle_data, "policy": policy}))
                loop.close()
            return 200, result
        except Exception as e:
            return 500, {"error": str(e)}

    if method == "GET" and path == "/api/agents/status":
        return 200, {"pipeline": len(_PIPELINE),
                     "agents": [{"name": a.name, "version": a.version} for a in _PIPELINE]}
    return 404, {"error": f"Agent route not found: {path}"}


# ---------------------------------------------------------------------------
# ML SCORER
# ---------------------------------------------------------------------------
def _ml_score(body):
    if not _ML_SCORER_AVAILABLE:
        return 503, {"error": "ML scorer unavailable — scikit-learn not installed on this runtime"}
    try:
        return 200, _score_risk(
            ndvi=float(body.get("ndvi",0.3)), rainfall_mm=float(body.get("rainfall_mm",100)),
            temp_c=float(body.get("temp_c",35)), soil_moisture_pct=float(body.get("soil_moisture_pct",20)),
            wind_kmh=float(body.get("wind_kmh",20)), district=body.get("district","DEFAULT"),
            season=body.get("season","kharif"), event_type=body.get("event_type","drought"),
        )
    except Exception as e:
        return 500, {"error": str(e)}

def _ml_batch_score(body):
    obs = body.get("observations", [])
    if not obs or len(obs) > 50:
        return 400, {"error": "observations: list of 1-50 required"}
    results = []
    for o in obs:
        try:
            results.append(_score_risk(
                ndvi=float(o.get("ndvi",0.3)), rainfall_mm=float(o.get("rainfall_mm",100)),
                temp_c=float(o.get("temp_c",35)), soil_moisture_pct=float(o.get("soil_moisture_pct",20)),
                wind_kmh=float(o.get("wind_kmh",20)), district=o.get("district","DEFAULT"),
                season=o.get("season","kharif"), event_type=o.get("event_type","drought"),
            ))
        except Exception as e:
            results.append({"error": str(e)})
    return 200, {"count": len(results), "triggered_count": sum(1 for r in results if r.get("triggered")), "results": results}

def _ml_model_info():
    return 200, {"model": "IIE-GBM-v1", "available": _ML_SCORER_AVAILABLE,
                 "model_source": _MODEL_SOURCE, "features": ["ndvi","rainfall_mm","temp_c",
                 "soil_moisture_pct","wind_kmh","ndvi_delta","rain_temp_interaction","season_code"]}


# ---------------------------------------------------------------------------
# HEALTH
# ---------------------------------------------------------------------------
def _health():
    try:
        store = load()
        policies  = len(store.get("policies", {}))
        contracts = len(store.get("contracts", {}))
        audit     = len(store.get("audit_log", []))
        chain_ok  = verify_chain(store.get("audit_log", []))
    except Exception:
        policies = contracts = audit = 0; chain_ok = True
    return 200, {
        "status":   "ok",
        "version":  "5.1.0",
        "modules": {
            "core":           _CORE_AVAILABLE,
            "agents":         _AGENTS_AVAILABLE,
            "ml_scorer":      _ML_SCORER_AVAILABLE,
            "auth":           _AUTH_AVAILABLE,
            "india_stack_v2": _INDIA_STACK_V2,
        },
        "policies":  policies,
        "contracts": contracts,
        "audit":     audit,
        "chain_ok":  chain_ok,
        "block":     block_number(),
    }
