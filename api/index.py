"""
YONO-Oracle IIE — Vercel Python Serverless Entry Point
Single handler serving ALL routes. stdlib only — no FastAPI, no pip install.

Real implementations:
  [1] Oracle Engine      — 4 independent data sources, weighted parametric scoring
  [2] Smart Contract SM  — ACTIVE → TRIGGERED → EXECUTED state machine, SHA-256 tx hash
  [3] Audit Chain        — append-only ledger, each entry hashed + prev_hash chained
  [4] ML Predictor       — NDVI decision tree (FAO/ISRO thresholds), weighted scoring
  [5] YONO UPI Sim       — IMPS credit, RRN, SMS string generation

NOTE: Proof-of-concept for SBI GFF 2026.
Real deployment: RBI Sandbox + IRDAI filing + SBI Core Banking API.
"""

from http.server import BaseHTTPRequestHandler
import json, hashlib, hmac, time, uuid, os, shelve, threading
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs
import random, math

# ---------------------------------------------------------------------------
# PERSISTENT STORE  (shelve → /tmp on Vercel, real DB in prod)
# ---------------------------------------------------------------------------
_LOCK  = threading.Lock()
_DB    = os.path.join("/tmp", "iie_store")

def _load():
    try:
        with shelve.open(_DB) as db:
            return {
                "policies":   dict(db.get("policies",   {})),
                "contracts":  dict(db.get("contracts",  {})),
                "audit_log":  list(db.get("audit_log",  [])),
                "upi_txns":   list(db.get("upi_txns",   [])),
            }
    except Exception:
        return {"policies":{},"contracts":{},"audit_log":[],"upi_txns":[]}

def _save(store):
    try:
        with shelve.open(_DB) as db:
            for k,v in store.items():
                db[k] = v
    except Exception:
        pass

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def _now():          return datetime.now(timezone.utc).isoformat()
def _sha(s):         return hashlib.sha256(s.encode()).hexdigest()
def _tx(seed):       return "0x" + _sha(seed + str(time.time_ns()))[:40]
def _block():        return 19823441 + (int(time.time()) % 50000)
def _uid(n=8):       return uuid.uuid4().hex[:n].upper()

def _aadhaar_hash(a4: str) -> str:
    """One-way HMAC of last-4. DPDP compliant — no raw PII stored."""
    return "AH_" + hmac.new(b"iie-gff-2026", a4.encode(), hashlib.sha256).hexdigest()[:16]

def _append_audit(store, event: str, policy_id: str, data: dict) -> dict:
    """Append-only chained ledger. Each entry contains prev_hash — tamper-evident."""
    payload_str = json.dumps({"event": event, "policy_id": policy_id, "data": data, "ts": _now()}, sort_keys=True)
    entry = {
        "seq":       len(store["audit_log"]) + 1,
        "ts":        _now(),
        "event":     event,
        "policy_id": policy_id,
        "hash":      _sha(payload_str),
        "prev_hash": store["audit_log"][-1]["hash"] if store["audit_log"] else ("0" * 64),
        "data":      data,
    }
    store["audit_log"].append(entry)
    return entry

def _verify_chain(log: list) -> bool:
    """Verify each entry's prev_hash matches predecessor's hash."""
    for i, entry in enumerate(log[1:], 1):
        expected = log[i-1]["hash"]
        if entry["prev_hash"] != expected:
            return False
    return True

# ---------------------------------------------------------------------------
# [1] ORACLE ENGINE — 4 independent parametric data sources
# ---------------------------------------------------------------------------
_THRESHOLDS = {
    "drought":  {"ndvi_max": 0.30, "rain_min_mm": 50,  "soil_max": 25},
    "flood":    {"rain_6hr_mm": 200, "soil_min": 70},
    "heatwave": {"temp_max_c": 45.0, "ndvi_max": 0.38},
    "cyclone":  {"wind_kmh": 75,  "rain_mm": 80},
}

def _fetch_oracle(district: str) -> dict:
    """
    Simulates 4 independent oracle data source pulls.
    Seed is district + 5-minute bucket — stable within window, changes across time.
    In prod: async calls to NASA MODIS API, IMD datastore, ISRO Bhuvan WMS, ICAR REST.
    """
    seed = sum(ord(c) for c in district.lower()) + int(time.time() // 300)
    r    = random.Random(seed)
    ndvi = round(r.uniform(0.13, 0.46), 3)   # NASA MODIS band-ratio
    rain = round(r.uniform(15,  285),   1)   # IMD rainfall mm / 24hr
    temp = round(r.uniform(34,  48.5),  1)   # ISRO land surface temp °C
    soil = round(r.uniform(8,   52),    1)   # ICAR soil moisture %
    wind = round(r.uniform(8,   98),    1)   # IMD wind km/h
    return {
        "sources": {
            "NASA_MODIS":   {"metric": "NDVI",         "value": ndvi, "unit": "index",   "latency_ms": r.randint(80, 220)},
            "IMD_Rainfall": {"metric": "rainfall_mm",  "value": rain, "unit": "mm/24hr", "latency_ms": r.randint(40, 110)},
            "ISRO_Bhuvan":  {"metric": "land_temp_c",  "value": temp, "unit": "celsius", "latency_ms": r.randint(100,280)},
            "ICAR_Sensors": {"metric": "soil_moisture","value": soil, "unit": "percent", "latency_ms": r.randint(30, 90)},
        },
        "derived": {"ndvi": ndvi, "rainfall_mm": rain, "temp_c": temp, "soil_moisture": soil, "wind_kmh": wind},
        "fetched_at":   _now(),
        "district":     district,
        "bucket_5min":  int(time.time() // 300),
    }

# ---------------------------------------------------------------------------
# [2] SMART CONTRACT STATE MACHINE — 4-agent quorum
# ---------------------------------------------------------------------------
_BASE_PAYOUT  = {"drought": 6000, "flood": 8500, "heatwave": 7200, "cyclone": 9500}
_CROP_MULT    = {
    "paddy":1.2,"cotton":1.3,"wheat":1.1,"soybean":1.0,
    "groundnut":1.15,"sugarcane":1.4,"maize":1.0,"chilli":1.25,
    "tomato":1.1,"onion":1.05,"potato":1.0,"rice":1.2,
}
_PLAN_COV = {"Basic Protect": 42000, "Smart Shield": 70000, "Full Season Pro": 122500}
_PLAN_PRM = {"Basic Protect": 2800,  "Smart Shield": 4200,  "Full Season Pro": 6300}

def _run_agents(oracle: dict, event_type: str) -> dict:
    """
    4 AI agents each independently evaluate oracle data against IRDAI parametric thresholds.
    Each agent = 25% weight. Quorum >= 75% (3 of 4) executes contract.

    Agent 1 – Risk Monitor:   Primary threshold check on lead indicator
    Agent 2 – Verifier:       Secondary/cross-source validation
    Agent 3 – Policy Matcher: KYC + compliance + secondary indicator
    Agent 4 – Executor:       Dual-source confirmation before final vote
    """
    d = oracle["derived"]
    n, rain, t, s, w = d["ndvi"], d["rainfall_mm"], d["temp_c"], d["soil_moisture"], d["wind_kmh"]
    th = _THRESHOLDS.get(event_type, {})

    if event_type == "drought":
        agents = {
            "Agent1_RiskMonitor":  (n    < th["ndvi_max"],           f"NDVI {n} < {th['ndvi_max']} (NASA MODIS)"),
            "Agent2_Verifier":     (rain < th["rain_min_mm"],         f"Rainfall {rain}mm < {th['rain_min_mm']}mm (IMD)"),
            "Agent3_PolicyMatch":  (s    < th["soil_max"],            f"Soil moisture {s}% < {th['soil_max']}% (ICAR)"),
            "Agent4_Executor":     (n < 0.33 and rain < 80,           f"Dual confirm: NDVI {n} + Rain {rain}mm"),
        }
    elif event_type == "flood":
        agents = {
            "Agent1_RiskMonitor":  (rain > th["rain_6hr_mm"],         f"Rainfall {rain}mm > {th['rain_6hr_mm']}mm (IMD)"),
            "Agent2_Verifier":     (rain > 160,                        f"Verifier threshold 160mm: {rain}mm (IMD)"),
            "Agent3_PolicyMatch":  (s    > th["soil_min"],             f"Soil saturation {s}% > {th['soil_min']}% (ICAR)"),
            "Agent4_Executor":     (rain > 140 and s > 60,             f"Dual confirm: Rain {rain}mm + Soil {s}%"),
        }
    elif event_type == "heatwave":
        agents = {
            "Agent1_RiskMonitor":  (t    > th["temp_max_c"],           f"Temp {t}°C > {th['temp_max_c']}°C (ISRO)"),
            "Agent2_Verifier":     (t    > 43.0,                       f"Verifier threshold 43°C: {t}°C"),
            "Agent3_PolicyMatch":  (n    < th["ndvi_max"],             f"Vegetation stress NDVI {n} < {th['ndvi_max']}"),
            "Agent4_Executor":     (t > 42 and n < 0.40,               f"Dual confirm: Temp {t} + NDVI {n}"),
        }
    else:  # cyclone
        agents = {
            "Agent1_RiskMonitor":  (w    > th["wind_kmh"],             f"Wind {w}km/h > {th['wind_kmh']}km/h"),
            "Agent2_Verifier":     (w    > 60,                         f"Verifier threshold 60km/h: {w}km/h"),
            "Agent3_PolicyMatch":  (rain > th["rain_mm"],              f"Associated rainfall {rain}mm > {th['rain_mm']}mm"),
            "Agent4_Executor":     (w > 55 and rain > 70,              f"Dual confirm: Wind {w} + Rain {rain}mm"),
        }

    yes  = sum(1 for v, _ in agents.values() if v)
    conf = round((yes / 4) * 100, 1)
    return {
        "votes":        {k: {"decision": "✅ YES" if v else "❌ NO", "reason": r} for k, (v, r) in agents.items()},
        "yes_count":    yes,
        "total_agents": 4,
        "confidence_pct": conf,
        "quorum_met":   conf >= 75,
        "quorum_rule":  ">=75% (3/4 agents)",
    }

# ---------------------------------------------------------------------------
# [3] ML PREDICTOR — NDVI weighted decision tree (FAO/ISRO thresholds)
# ---------------------------------------------------------------------------
def _ml_predict(ndvi: float, temp_c: float, rain_mm: float, soil: float) -> dict:
    """
    Weighted multi-feature drought risk scorer.
    Weights: NDVI 40%, Temperature 25%, Rainfall 25%, Soil 10%
    Based on: FAO NDVI drought thresholds + ISRO MNCFC published guidelines.
    In prod: replace with trained sklearn GradientBoostingClassifier on MODIS time-series.
    """
    score  = 0.0
    flags  = []

    # NDVI component (40% max)
    if   ndvi < 0.10: score += 40; flags.append(f"Bare soil / complete crop failure (NDVI={ndvi})<0.10")
    elif ndvi < 0.20: score += 38; flags.append(f"Severe vegetation loss (NDVI={ndvi})<0.20")
    elif ndvi < 0.30: score += 30; flags.append(f"Moderate drought stress (NDVI={ndvi})<0.30")
    elif ndvi < 0.40: score += 15; flags.append(f"Mild vegetation stress (NDVI={ndvi})<0.40")

    # Temperature component (25% max)
    if   temp_c > 47:  score += 25; flags.append(f"Fatal heat — crop wilting threshold exceeded ({temp_c}°C)")
    elif temp_c > 46:  score += 23; flags.append(f"Extreme heat ({temp_c}°C)>46")
    elif temp_c > 44:  score += 18; flags.append(f"Severe heat ({temp_c}°C)>44")
    elif temp_c > 42:  score += 10; flags.append(f"Heat stress ({temp_c}°C)>42")

    # Rainfall component (25% max)
    if   rain_mm < 20:  score += 25; flags.append(f"Near-zero rainfall — desert conditions ({rain_mm}mm)")
    elif rain_mm < 50:  score += 22; flags.append(f"Severe deficit ({rain_mm}mm)<50mm")
    elif rain_mm < 100: score += 17; flags.append(f"Rainfall deficit ({rain_mm}mm)<100mm")
    elif rain_mm < 150: score += 9;  flags.append(f"Below normal ({rain_mm}mm)<150mm")

    # Soil moisture component (10% max)
    if   soil < 10: score += 10; flags.append(f"Critical — wilting point reached (soil={soil}%)")
    elif soil < 15: score += 8;  flags.append(f"Critical soil moisture ({soil}%)<15%")
    elif soil < 25: score += 5;  flags.append(f"Low soil moisture ({soil}%)<25%")

    s      = min(round(score, 1), 100.0)
    level  = "CRITICAL" if s >= 70 else "HIGH" if s >= 50 else "MEDIUM" if s >= 30 else "LOW"
    payout = s >= 50

    return {
        "risk_score":     s,
        "risk_level":     level,
        "triggered":      payout,
        "confidence_pct": round(min(s * 1.05, 99.9), 1),
        "component_scores": {
            "ndvi_score":     min(40, score if ndvi < 0.40 else 0),
            "temp_score":     min(25, 25 if temp_c > 47 else 23 if temp_c > 46 else 18 if temp_c > 44 else 10 if temp_c > 42 else 0),
            "rain_score":     min(25, 25 if rain_mm < 20 else 22 if rain_mm < 50 else 17 if rain_mm < 100 else 9 if rain_mm < 150 else 0),
            "soil_score":     min(10, 10 if soil < 10 else 8 if soil < 15 else 5 if soil < 25 else 0),
        },
        "flags":          flags,
        "model":          "IIE-NDVIv1 (FAO/ISRO thresholds, weighted decision tree)",
        "recommendation": "AUTO-PAYOUT TRIGGERED" if payout else "MONITORING — below trigger threshold",
    }

# ---------------------------------------------------------------------------
# ROUTE HANDLERS
# ---------------------------------------------------------------------------
PREMIUMS = _PLAN_PRM
COVERAGE = _PLAN_COV

def handle_enroll(body: dict) -> tuple:
    store   = _load()
    name    = str(body.get("name",  "Farmer")).strip()
    a4      = str(body.get("aadhaar_last4", "0000"))[:4]
    dist    = str(body.get("district",  "Unknown")).strip()
    state   = str(body.get("state",     "India")).strip()
    crop    = str(body.get("crop",      "wheat")).lower().strip()
    acres   = max(0.1, float(body.get("acreage", 5)))
    plan    = str(body.get("plan",      "Smart Shield")).strip()
    if plan not in PREMIUMS: plan = "Smart Shield"

    pid     = "IIE-" + _sha(f"{name.lower()}{dist.lower()}{a4}")[:8].upper()
    if pid in store["policies"]:
        return 400, {"error": f"Farmer already enrolled. Policy: {pid}"}

    sub     = round(PREMIUMS[plan] * 0.30)   # PM-FASAL 30% subsidy
    net     = PREMIUMS[plan] - sub
    caddr   = "0x" + _sha(pid + "contract")[:40]
    tx_hash = _tx("deploy" + pid)
    block   = _block()

    policy = {
        "policy_id": pid, "name": name, "aadhaar_hash": _aadhaar_hash(a4),
        "district": dist, "state": state, "crop": crop, "acreage": acres, "plan": plan,
        "premium_inr": PREMIUMS[plan], "subsidy_inr": sub, "net_premium_inr": net,
        "coverage_inr": COVERAGE.get(plan, 70000), "status": "ACTIVE",
        "enrolled_at": _now(),
        "upi_debit_ref":  "UPI-D-" + _uid(8),
        "digilocker_ref": "DL-"   + _uid(10),
    }
    contract = {
        "address": caddr, "policy_id": pid, "state": "ACTIVE",
        "block_deployed": block, "deployed_at": _now(), "tx_hash": tx_hash,
        "oracle_data": None, "agent_quorum": None,
        "payout_tx": None, "payout_amount": None,
        "history": [{"state": "ACTIVE", "at": _now(), "tx": tx_hash}],
    }
    store["policies"][pid]  = policy
    store["contracts"][pid] = contract
    _append_audit(store, "POLICY_ENROLLED", pid, {
        "plan": plan, "district": dist, "crop": crop,
        "contract_address": caddr, "block": block, "net_premium": net,
    })
    _save(store)

    return 200, {
        "success": True, "policy_id": pid, "contract_address": caddr,
        "aadhaar_hash": policy["aadhaar_hash"], "digilocker_ref": policy["digilocker_ref"],
        "upi_debit_ref": policy["upi_debit_ref"], "net_premium_inr": net,
        "subsidy_applied": sub, "coverage_inr": COVERAGE.get(plan, 70000),
        "block_deployed": block, "deploy_tx": tx_hash,
        "message": f"Policy {pid} issued. Contract deployed at {caddr} (block #{block}). PM-FASAL subsidy ₹{sub} applied. UPI debit ref: {policy['upi_debit_ref']}.",
    }

def handle_verify(body: dict) -> tuple:
    store   = _load()
    pid     = str(body.get("policy_id", ""))
    ev      = str(body.get("event_type", "drought")).lower()

    if pid not in store["policies"]:
        return 404, {"error": f"Policy {pid} not found. Enroll first at /api/oracle/enroll"}
    if ev not in _THRESHOLDS:
        return 400, {"error": f"Unknown event_type. Use: {list(_THRESHOLDS.keys())}"}

    policy   = store["policies"][pid]
    oracle   = _fetch_oracle(policy["district"])
    quorum   = _run_agents(oracle, ev)
    contract = store["contracts"][pid]

    if quorum["quorum_met"] and contract["state"] == "ACTIVE":
        mult   = _CROP_MULT.get(policy["crop"], 1.0)
        payout = round(_BASE_PAYOUT.get(ev, 6000) * mult * policy["acreage"] * (quorum["confidence_pct"] / 100))
        contract.update({
            "state": "TRIGGERED", "oracle_data": oracle,
            "agent_quorum": quorum, "triggered_at": _now(),
            "event_type": ev, "payout_amount": payout,
        })
        contract["history"].append({"state": "TRIGGERED", "at": _now(), "event": ev, "confidence": quorum["confidence_pct"]})
        _append_audit(store, "ORACLE_TRIGGERED", pid, {
            "event_type": ev, "confidence": quorum["confidence_pct"],
            "ndvi": oracle["derived"]["ndvi"], "rainfall": oracle["derived"]["rainfall_mm"],
            "payout_amount": payout,
        })
        store["contracts"][pid] = contract
        _save(store)

    return 200, {
        "policy_id": pid, "district": policy["district"], "event_type": ev,
        "oracle_data": oracle, "agent_quorum": quorum,
        "contract_state": contract["state"],
        "payout_amount": contract.get("payout_amount"),
        "next_step": "POST /api/contract/execute" if quorum["quorum_met"] else "Quorum not met — monitoring continues",
    }

def handle_execute(body: dict) -> tuple:
    store    = _load()
    pid      = str(body.get("policy_id", ""))
    force    = bool(body.get("force", False))

    if pid not in store["contracts"]:
        return 404, {"error": "Contract not found"}

    contract = store["contracts"][pid]
    policy   = store["policies"][pid]

    if contract["state"] == "EXECUTED":
        return 200, {"message": "Already executed", "contract": contract}
    if contract["state"] != "TRIGGERED" and not force:
        return 400, {"error": f"Contract state is '{contract['state']}'. Run /api/oracle/verify first."}

    payout   = contract.get("payout_amount") or round(_BASE_PAYOUT["drought"] * policy["acreage"])
    tx_hash  = _tx("execute" + pid)
    block    = _block()
    upi_ref  = "UPI-" + _uid(10)
    rrn      = str(int(time.time()))[-12:]   # RBI transaction reference number
    upi_id   = policy["name"].lower().replace(" ", ".") + "@sbi"
    sms      = (f"SBI IIE ALERT: Dear {policy['name']}, your crop insurance claim of "
                f"Rs {payout:,} has been auto-credited to your SBI a/c via IMPS. "
                f"Ref: {upi_ref} | RRN: {rrn}. "
                f"No claim form needed. Powered by YONO-Oracle IIE. "
                f"Helpline: 1800-11-2211")

    contract.update({
        "state": "EXECUTED", "executed_at": _now(),
        "tx_hash": tx_hash, "block_number": block,
        "payout_tx": upi_ref, "payout_amount": payout,
    })
    contract["history"].append({"state": "EXECUTED", "at": _now(), "tx": tx_hash, "block": block, "payout": payout})

    upi_entry = {
        "ref": upi_ref, "rrn": rrn, "policy_id": pid, "farmer": policy["name"],
        "amount_inr": payout, "upi_id": upi_id, "status": "SUCCESS",
        "method": "IMPS", "credited_at": _now(),
        "tx_hash": tx_hash, "block_number": block,
    }
    store["upi_txns"].append(upi_entry)
    store["contracts"][pid] = contract
    _append_audit(store, "CONTRACT_EXECUTED", pid, {
        "tx_hash": tx_hash, "block_number": block,
        "payout_inr": payout, "upi_ref": upi_ref, "rrn": rrn, "farmer": policy["name"],
    })
    _save(store)

    return 200, {
        "success": True, "policy_id": pid, "contract_state": "EXECUTED",
        "payout_inr": payout, "tx_hash": tx_hash, "block_number": block,
        "upi_ref": upi_ref, "rrn": rrn, "farmer": policy["name"],
        "credited_to": upi_id, "method": "IMPS",
        "sms_sent": sms, "audit_seq": len(store["audit_log"]),
        "message": f"Rs {payout:,} executed on-chain (block #{block}, tx {tx_hash[:18]}...) and credited via IMPS. Zero claim forms filed.",
    }

def handle_audit(_) -> tuple:
    store = _load()
    log   = store["audit_log"]
    return 200, {
        "chain_valid":    _verify_chain(log),
        "total_entries":  len(log),
        "algorithm":      "SHA-256 chained (Hyperledger Fabric simulation)",
        "ledger":         log,
    }

def handle_contract_get(policy_id: str) -> tuple:
    store = _load()
    if policy_id not in store["contracts"]:
        return 404, {"error": "Contract not found"}
    return 200, {"contract": store["contracts"][policy_id], "policy": store["policies"].get(policy_id)}

def handle_contracts_all(_) -> tuple:
    store = _load()
    return 200, {"total": len(store["contracts"]), "contracts": list(store["contracts"].values())}

def handle_feed(_) -> tuple:
    districts = [
        ("Barmer", "RJ"), ("Puri", "OD"), ("Ludhiana", "PB"), ("Nashik", "MH"),
        ("Latur", "MH"),  ("Warangal", "TG"), ("Adilabad", "TG"), ("Jodhpur", "RJ"),
    ]
    rows = []
    for d, s in districts:
        ora = _fetch_oracle(d)
        ml  = _ml_predict(ora["derived"]["ndvi"], ora["derived"]["temp_c"],
                          ora["derived"]["rainfall_mm"], ora["derived"]["soil_moisture"])
        rows.append({"district": d, "state": s, **ora["derived"],
                     "risk_score": ml["risk_score"], "risk_level": ml["risk_level"],
                     "triggered": ml["triggered"]})
    return 200, {"block_height": _block(), "fetched_at": _now(), "districts": rows}

def handle_ml_predict(body: dict) -> tuple:
    result = _ml_predict(
        float(body.get("ndvi", 0.3)), float(body.get("temp_c", 40)),
        float(body.get("rainfall_mm", 100)), float(body.get("soil_moisture_pct", 20)),
    )
    return 200, {"district": body.get("district", "Unknown"), "input": body, **result}

def handle_ml_batch(_) -> tuple:
    rows = [
        ("Barmer, RJ",   0.21, 46.4, 38,  14),
        ("Puri, OD",     0.51, 34.2, 218, 78),
        ("Ludhiana, PB", 0.24, 39.8, 72,  21),
        ("Nashik, MH",   0.29, 42.1, 88,  19),
        ("Latur, MH",    0.18, 46.8, 31,  12),
        ("Warangal, TG", 0.33, 38.4, 124, 29),
    ]
    return 200, {"model": "IIE-NDVIv1", "predictions": [
        {"district": d, **_ml_predict(n, t, r, s)} for d, n, t, r, s in rows
    ]}

def handle_upi_transactions(_) -> tuple:
    store = _load()
    return 200, {"total": len(store["upi_txns"]), "transactions": store["upi_txns"]}

def handle_health(_) -> tuple:
    store = _load()
    return 200, {
        "status": "ok", "version": "3.0.0",
        "ts": _now(), "python": "3.12",
        "engines": ["Oracle", "SmartContractSM", "AuditChain", "MLPredictor", "YONOSimulator"],
        "policies": len(store["policies"]),
        "contracts": len(store["contracts"]),
        "audit_entries": len(store["audit_log"]),
        "chain_valid": _verify_chain(store["audit_log"]),
        "upi_txns": len(store["upi_txns"]),
    }

# ---------------------------------------------------------------------------
# VERCEL REQUEST HANDLER — routes requests to above functions
# ---------------------------------------------------------------------------
class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors(204, b"")

    def do_GET(self):
        path = urlparse(self.path).path.rstrip("/")
        if   path == "/api/health":              code, data = handle_health(None)
        elif path == "/api/oracle/feed":          code, data = handle_feed(None)
        elif path == "/api/audit/trail":          code, data = handle_audit(None)
        elif path == "/api/contract/all":         code, data = handle_contracts_all(None)
        elif path == "/api/ml/batch":             code, data = handle_ml_batch(None)
        elif path == "/api/yono/transactions":    code, data = handle_upi_transactions(None)
        elif path.startswith("/api/contract/"):
            pid = path.split("/api/contract/")[-1]
            code, data = handle_contract_get(pid)
        else:
            code, data = 404, {"error": "Unknown route", "path": path}
        self._json(code, data)

    def do_POST(self):
        path   = urlparse(self.path).path.rstrip("/")
        length = int(self.headers.get("Content-Length", 0))
        body   = json.loads(self.rfile.read(length)) if length else {}

        with _LOCK:
            if   path == "/api/oracle/enroll":    code, data = handle_enroll(body)
            elif path == "/api/oracle/verify":    code, data = handle_verify(body)
            elif path == "/api/contract/execute": code, data = handle_execute(body)
            elif path == "/api/ml/predict":       code, data = handle_ml_predict(body)
            else:
                code, data = 404, {"error": "Unknown route", "path": path}
        self._json(code, data)

    def _json(self, code: int, data: dict):
        body = json.dumps(data, default=str).encode()
        self.send_response(code)
        self.send_header("Content-Type",                  "application/json")
        self.send_header("Access-Control-Allow-Origin",   "*")
        self.send_header("Access-Control-Allow-Methods",  "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers",  "Content-Type")
        self.send_header("Content-Length",                str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _cors(self, code: int, body: bytes):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args): pass  # suppress Vercel log noise
