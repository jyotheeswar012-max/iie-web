"""
api/core/app.py  v5.0.0
Central request dispatcher for Vercel serverless handler (api/index.py).
Maps (method, path) → handler functions. All handlers return (int, dict).

New in v5.0.0:
  - /api/agents/orchestrate  POST  — multi-agent pipeline
  - /api/agents/status       GET   — agent registry
  - /api/ml/score            POST  — GBM risk scorer
  - /api/ml/batch-score      POST  — batch scoring
  - /api/ml/model-info       GET   — model metadata
  - /api/auth/token          POST  — JWT issuance
  - /api/auth/me             GET   — token introspection
  - /api/auth/sandbox-users  GET   — sandbox credentials list
  - /api/india-stack/aadhaar/send-otp   POST
  - /api/india-stack/aadhaar/verify-otp POST
  - /api/india-stack/aadhaar/status     GET
  - /api/india-stack/digilocker/fetch          POST
  - /api/india-stack/digilocker/available-docs GET
  - /api/india-stack/digilocker/status         GET
"""
import time
from urllib.parse import urlparse, parse_qs

try:
    from api.core import security, logging as log
except ImportError:
    from core import security, logging as log  # fallback for local uvicorn

# ---------------------------------------------------------------------------
# IMPORT HANDLERS — existing
# ---------------------------------------------------------------------------
try:
    from api.oracle.engine            import handle_enroll, handle_verify, handle_feed
    from api.blockchain.state_machine import handle_execute, handle_contract_get, handle_contracts_all
    from api.audit.chain              import handle_audit
    from api.ml.predictor             import handle_ml_predict, handle_ml_batch
    from api.india_stack.simulator    import handle_india_stack_verify, handle_upi_pay, handle_upi_txns
    from api.core.store               import load
    from api.core.utils               import now_iso, block_number
except ImportError:
    from oracle.engine            import handle_enroll, handle_verify, handle_feed
    from blockchain.state_machine import handle_execute, handle_contract_get, handle_contracts_all
    from audit.chain              import handle_audit
    from ml.predictor             import handle_ml_predict, handle_ml_batch
    from india_stack.simulator    import handle_india_stack_verify, handle_upi_pay, handle_upi_txns
    from core.store               import load
    from core.utils               import now_iso, block_number

# ---------------------------------------------------------------------------
# IMPORT HANDLERS — new modules
# ---------------------------------------------------------------------------

# --- Agents ---
try:
    from api.agents.orchestrator import orchestrate as _orchestrate
    from api.agents.orchestrator import PIPELINE as _PIPELINE
    _AGENTS_AVAILABLE = True
except ImportError:
    try:
        from agents.orchestrator import orchestrate as _orchestrate
        from agents.orchestrator import PIPELINE as _PIPELINE
        _AGENTS_AVAILABLE = True
    except ImportError:
        _AGENTS_AVAILABLE = False

# --- ML Scorer ---
try:
    from api.ml.risk_scorer import score_risk as _score_risk, DISTRICT_NDVI_BASELINE as _DISTRICTS, _MODEL_SOURCE
    _ML_SCORER_AVAILABLE = True
except ImportError:
    try:
        from ml.risk_scorer import score_risk as _score_risk, DISTRICT_NDVI_BASELINE as _DISTRICTS, _MODEL_SOURCE
        _ML_SCORER_AVAILABLE = True
    except ImportError:
        _ML_SCORER_AVAILABLE = False

# --- Auth ---
try:
    from api.core.auth import create_access_token, verify_token, authenticate_user, ROLES, SANDBOX_USERS
    _AUTH_AVAILABLE = True
except ImportError:
    try:
        from core.auth import create_access_token, verify_token, authenticate_user, ROLES, SANDBOX_USERS
        _AUTH_AVAILABLE = True
    except ImportError:
        _AUTH_AVAILABLE = False

# --- India Stack (new) ---
try:
    from api.india_stack.aadhaar_mock    import send_otp as _aadhaar_send_otp, verify_otp as _aadhaar_verify_otp, SANDBOX_RESIDENTS
    from api.india_stack.digilocker_mock import fetch_document as _dl_fetch, MOCK_DOCUMENTS
    _INDIA_STACK_V2 = True
except ImportError:
    try:
        from india_stack.aadhaar_mock    import send_otp as _aadhaar_send_otp, verify_otp as _aadhaar_verify_otp, SANDBOX_RESIDENTS
        from india_stack.digilocker_mock import fetch_document as _dl_fetch, MOCK_DOCUMENTS
        _INDIA_STACK_V2 = True
    except ImportError:
        _INDIA_STACK_V2 = False

import asyncio


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
    data["_meta"] = {"duration_ms": round(ms, 2), "tier": tier, "ts": now_iso(), "v": "5.0.0"}
    return status, data


# ---------------------------------------------------------------------------
# ROUTER
# ---------------------------------------------------------------------------
def _route(method: str, path: str, body: dict, headers: dict, tier: str) -> tuple:

    # ---- Health ------------------------------------------------------------
    if method == "GET" and path == "/api/health":
        return _health()

    # ---- Auth --------------------------------------------------------------
    if path.startswith("/api/auth"):
        return _route_auth(method, path, body, headers)

    # ---- India Stack (v2 Aadhaar + DigiLocker) -----------------------------
    if path.startswith("/api/india-stack/aadhaar"):
        return _route_aadhaar(method, path, body)

    if path.startswith("/api/india-stack/digilocker"):
        return _route_digilocker(method, path, body)

    # ---- India Stack (v1 legacy) -------------------------------------------
    if method == "POST" and path == "/api/india-stack/verify":
        return handle_india_stack_verify(body)

    # ---- Oracle ------------------------------------------------------------
    if method == "POST" and path == "/api/oracle/enroll":
        return handle_enroll(body)
    if method == "POST" and path == "/api/oracle/verify":
        return handle_verify(body)
    if method == "GET"  and path == "/api/oracle/feed":
        return handle_feed()

    # ---- Contract ----------------------------------------------------------
    if method == "POST" and path == "/api/contract/execute":
        return handle_execute(body)
    if method == "GET"  and path == "/api/contract/all":
        return handle_contracts_all()
    if method == "GET"  and path.startswith("/api/contract/"):
        return handle_contract_get(path.split("/api/contract/")[-1])

    # ---- Agents (new) ------------------------------------------------------
    if path.startswith("/api/agents"):
        return _route_agents(method, path, body)

    # ---- ML Scorer (new) ---------------------------------------------------
    if method == "POST" and path == "/api/ml/score":
        return _ml_score(body)
    if method == "POST" and path == "/api/ml/batch-score":
        return _ml_batch_score(body)
    if method == "GET"  and path == "/api/ml/model-info":
        return _ml_model_info()

    # ---- ML (legacy) -------------------------------------------------------
    if method == "POST" and path == "/api/ml/predict":
        return handle_ml_predict(body)
    if method == "GET"  and path == "/api/ml/batch":
        return handle_ml_batch()

    # ---- Audit -------------------------------------------------------------
    if method == "GET" and path == "/api/audit/trail":
        return handle_audit()

    # ---- YONO UPI ----------------------------------------------------------
    if method == "POST" and path == "/api/yono/pay":
        return handle_upi_pay(body)
    if method == "GET"  and path == "/api/yono/transactions":
        return handle_upi_txns()

    # ---- Routes index ------------------------------------------------------
    return 404, {
        "error": "Route not found",
        "path":  path,
        "available_routes": {
            "auth":        ["POST /api/auth/token", "GET /api/auth/me", "GET /api/auth/sandbox-users"],
            "india_stack": ["POST /api/india-stack/aadhaar/send-otp",
                            "POST /api/india-stack/aadhaar/verify-otp",
                            "GET  /api/india-stack/aadhaar/status",
                            "POST /api/india-stack/digilocker/fetch",
                            "GET  /api/india-stack/digilocker/available-docs",
                            "GET  /api/india-stack/digilocker/status"],
            "oracle":      ["POST /api/oracle/enroll", "POST /api/oracle/verify", "GET /api/oracle/feed"],
            "contract":    ["POST /api/contract/execute", "GET /api/contract/all", "GET /api/contract/{id}"],
            "agents":      ["POST /api/agents/orchestrate", "GET /api/agents/status"],
            "ml":          ["POST /api/ml/score", "POST /api/ml/batch-score", "GET /api/ml/model-info"],
            "audit":       ["GET /api/audit/trail"],
            "yono":        ["POST /api/yono/pay", "GET /api/yono/transactions"],
        }
    }


# ---------------------------------------------------------------------------
# AUTH HANDLERS
# ---------------------------------------------------------------------------
def _route_auth(method: str, path: str, body: dict, headers: dict) -> tuple:
    if not _AUTH_AVAILABLE:
        return 503, {"error": "Auth module not available"}

    if method == "POST" and path == "/api/auth/token":
        username = body.get("username", "")
        password = body.get("password", "")
        user = authenticate_user(username, password)
        if not user:
            return 401, {"error": "Invalid credentials"}
        token = create_access_token(user)
        return 200, {
            "access_token":  token,
            "token_type":    "bearer",
            "role":          user["role"],
            "permissions":   ROLES.get(user["role"], []),
            "expires_in":    3600,
            "sandbox_note":  "GFF 2026 sandbox. Replace with Firebase Auth in production.",
        }

    if method == "GET" and path == "/api/auth/me":
        auth_header = headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            return 401, {"error": "Bearer token required"}
        try:
            payload = verify_token(auth_header[7:])
            return 200, {
                "sub":  payload.get("sub"),
                "role": payload.get("role"),
                "exp":  payload.get("exp"),
                "iat":  payload.get("iat"),
            }
        except Exception as e:
            return 401, {"error": str(e)}

    if method == "GET" and path == "/api/auth/sandbox-users":
        return 200, {
            "note":  "GFF 2026 sandbox credentials. Do NOT use in production.",
            "users": [
                {"username": u, "password": v["password"], "role": v["role"]}
                for u, v in SANDBOX_USERS.items() if u != "admin"
            ],
        }

    return 404, {"error": f"Auth route not found: {method} {path}"}


# ---------------------------------------------------------------------------
# AADHAAR HANDLERS
# ---------------------------------------------------------------------------
def _route_aadhaar(method: str, path: str, body: dict) -> tuple:
    if not _INDIA_STACK_V2:
        return 503, {"error": "India Stack v2 module not available"}

    if method == "POST" and path == "/api/india-stack/aadhaar/send-otp":
        from api.india_stack.aadhaar_mock import OTPSendRequest, send_otp, _OTP_SESSIONS, SANDBOX_RESIDENTS
        import random, uuid
        last4 = body.get("aadhaar_last4", "")
        phone = body.get("phone_last4", "0000")
        if last4 not in SANDBOX_RESIDENTS:
            return 404, {"error": f"Aadhaar last4 '{last4}' not in sandbox. Use: {list(SANDBOX_RESIDENTS.keys())}"}
        session_id = str(uuid.uuid4())
        otp = str(random.randint(100000, 999999))
        _OTP_SESSIONS[session_id] = {"aadhaar_last4": last4, "otp": otp, "used": False}
        return 200, {"success": True, "session_id": session_id, "otp_hint": f"SANDBOX OTP: {otp}",
                     "message": f"OTP sent to mobile ending {phone}.",
                     "sandbox_note": "GFF 2026 sandbox only."}

    if method == "POST" and path == "/api/india-stack/aadhaar/verify-otp":
        from api.india_stack.aadhaar_mock import _OTP_SESSIONS, SANDBOX_RESIDENTS, _aadhaar_hmac
        import uuid
        from datetime import datetime, timezone
        if not body.get("consent"):
            return 400, {"error": "Explicit consent required."}
        session = _OTP_SESSIONS.get(body.get("session_id", ""))
        if not session:
            return 404, {"error": "Session not found or expired."}
        if session.get("used"):
            return 400, {"error": "OTP already used."}
        if session["otp"] != body.get("otp", ""):
            return 401, {"error": "Invalid OTP."}
        session["used"] = True
        r = SANDBOX_RESIDENTS[session["aadhaar_last4"]]
        return 200, {"status": "VALID", "aadhaar_hash": _aadhaar_hmac(session["aadhaar_last4"]),
                     "name": r["name"], "gender": r["gender"], "dob": r["dob"],
                     "state": r["state"], "district": r["district"],
                     "verified_at": datetime.now(timezone.utc).isoformat(),
                     "txn_id": "UIDAI-SANDBOX-" + uuid.uuid4().hex[:12].upper(),
                     "sandbox_note": "GFF 2026 sandbox. DPDP Act 2023 compliant."}

    if method == "GET" and path == "/api/india-stack/aadhaar/status":
        return 200, {"service": "Aadhaar eKYC", "mode": "SANDBOX",
                     "sandbox_residents": list(SANDBOX_RESIDENTS.keys())}

    return 404, {"error": f"Aadhaar route not found: {method} {path}"}


# ---------------------------------------------------------------------------
# DIGILOCKER HANDLERS
# ---------------------------------------------------------------------------
def _route_digilocker(method: str, path: str, body: dict) -> tuple:
    if not _INDIA_STACK_V2:
        return 503, {"error": "India Stack v2 module not available"}

    if method == "POST" and path == "/api/india-stack/digilocker/fetch":
        import uuid
        from datetime import datetime, timezone
        if not body.get("consent"):
            return 400, {"error": "Explicit consent required."}
        doc_type = body.get("doc_type", "").upper()
        doc = MOCK_DOCUMENTS.get(doc_type)
        if not doc:
            return 404, {"error": f"Document type '{doc_type}' not found.",
                         "available": list(MOCK_DOCUMENTS.keys())}
        return 200, {"success": True, "request_id": "DL-" + uuid.uuid4().hex[:12].upper(),
                     "doc_type": doc_type, "fetched_at": datetime.now(timezone.utc).isoformat(),
                     "document": doc, "sandbox_note": "GFF 2026 sandbox."}

    if method == "GET" and path == "/api/india-stack/digilocker/available-docs":
        return 200, {"available_documents": list(MOCK_DOCUMENTS.keys())}

    if method == "GET" and path == "/api/india-stack/digilocker/status":
        return 200, {"service": "DigiLocker Pull API", "mode": "SANDBOX",
                     "total_docs": len(MOCK_DOCUMENTS)}

    return 404, {"error": f"DigiLocker route not found: {method} {path}"}


# ---------------------------------------------------------------------------
# AGENTS HANDLERS
# ---------------------------------------------------------------------------
def _route_agents(method: str, path: str, body: dict) -> tuple:
    if not _AGENTS_AVAILABLE:
        return 503, {"error": "Agents module not available. Check api/agents/ imports."}

    if method == "POST" and path == "/api/agents/orchestrate":
        event_type  = body.get("event_type", "drought")
        oracle_data = body.get("oracle_data", {})
        policy      = body.get("policy", {})
        if event_type not in ("drought", "flood", "heatwave", "cyclone"):
            return 400, {"error": "Invalid event_type. Use: drought | flood | heatwave | cyclone"}
        if not oracle_data:
            return 400, {"error": "oracle_data is required"}
        try:
            result = asyncio.get_event_loop().run_until_complete(
                _orchestrate({"event_type": event_type, "oracle_data": oracle_data, "policy": policy})
            )
            return 200, result
        except RuntimeError:
            # If no event loop (Vercel), create a new one
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(
                _orchestrate({"event_type": event_type, "oracle_data": oracle_data, "policy": policy})
            )
            loop.close()
            return 200, result

    if method == "GET" and path == "/api/agents/status":
        return 200, {
            "pipeline_length": len(_PIPELINE),
            "agents": [{"name": a.name, "version": a.version} for a in _PIPELINE],
            "description": "RiskAgent → ClaimsAgent → FraudAgent",
        }

    return 404, {"error": f"Agent route not found: {method} {path}"}


# ---------------------------------------------------------------------------
# ML SCORER HANDLERS
# ---------------------------------------------------------------------------
def _ml_score(body: dict) -> tuple:
    if not _ML_SCORER_AVAILABLE:
        return 503, {"error": "ML scorer not available. Check api/ml/risk_scorer.py."}
    try:
        result = _score_risk(
            ndvi              = float(body.get("ndvi", 0.3)),
            rainfall_mm       = float(body.get("rainfall_mm", 100)),
            temp_c            = float(body.get("temp_c", 35)),
            soil_moisture_pct = float(body.get("soil_moisture_pct", 20)),
            wind_kmh          = float(body.get("wind_kmh", 20)),
            district          = body.get("district", "DEFAULT"),
            season            = body.get("season", "kharif"),
            event_type        = body.get("event_type", "drought"),
        )
        return 200, result
    except Exception as e:
        return 500, {"error": str(e)}


def _ml_batch_score(body: dict) -> tuple:
    if not _ML_SCORER_AVAILABLE:
        return 503, {"error": "ML scorer not available."}
    observations = body.get("observations", [])
    if not observations or len(observations) > 50:
        return 400, {"error": "observations must be a list of 1–50 items"}
    results = []
    for obs in observations:
        try:
            r = _score_risk(
                ndvi              = float(obs.get("ndvi", 0.3)),
                rainfall_mm       = float(obs.get("rainfall_mm", 100)),
                temp_c            = float(obs.get("temp_c", 35)),
                soil_moisture_pct = float(obs.get("soil_moisture_pct", 20)),
                wind_kmh          = float(obs.get("wind_kmh", 20)),
                district          = obs.get("district", "DEFAULT"),
                season            = obs.get("season", "kharif"),
                event_type        = obs.get("event_type", "drought"),
            )
            results.append(r)
        except Exception as e:
            results.append({"error": str(e)})
    return 200, {"count": len(results), "triggered_count": sum(1 for r in results if r.get("triggered")), "results": results}


def _ml_model_info() -> tuple:
    return 200, {
        "model":         "IIE-GBM-v1",
        "algorithm":     "GradientBoostingClassifier (sklearn)",
        "features":      ["ndvi", "rainfall_mm", "temp_c", "soil_moisture_pct", "wind_kmh",
                          "ndvi_delta", "rain_temp_interaction", "season_code"],
        "model_source":  _MODEL_SOURCE if _ML_SCORER_AVAILABLE else "unavailable",
        "available":     _ML_SCORER_AVAILABLE,
        "train_script":  "python api/ml/train_model.py",
    }


# ---------------------------------------------------------------------------
# HEALTH
# ---------------------------------------------------------------------------
def _health() -> tuple:
    store = load()
    try:
        from api.audit.chain import verify_chain
    except ImportError:
        from audit.chain import verify_chain
    return 200, {
        "status":         "ok",
        "version":        "5.0.0",
        "modules": {
            "agents":         _AGENTS_AVAILABLE,
            "ml_scorer":      _ML_SCORER_AVAILABLE,
            "auth":           _AUTH_AVAILABLE,
            "india_stack_v2": _INDIA_STACK_V2,
        },
        "policies":       len(store["policies"]),
        "contracts":      len(store["contracts"]),
        "audit_entries":  len(store["audit_log"]),
        "chain_valid":    verify_chain(store["audit_log"]),
        "block_height":   block_number(),
    }
