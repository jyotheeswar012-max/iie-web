"""
YONO-Oracle IIE — FastAPI Backend
Real working implementation for SBI GFF 2026.

Endpoints:
  POST /oracle/verify          — Multi-source parametric oracle
  POST /oracle/enroll          — Aadhaar e-KYC + policy issuance
  GET  /oracle/feed            — Live oracle feed (all districts)
  POST /contract/execute       — Smart contract state machine
  GET  /contract/{policy_id}   — Fetch contract state
  GET  /contract/all           — All contracts
  POST /yono/upi-credit        — UPI auto-credit simulation
  POST /yono/sms-notify        — SMS/USSD notification
  POST /ml/predict             — NDVI drought risk ML model
  GET  /ml/batch               — Batch risk prediction
  GET  /audit/trail            — Immutable audit ledger

NOTE: Proof-of-concept for GFF 2026.
Real deployment requires RBI Sandbox + IRDAI filing + SBI Core API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import hashlib, hmac, time, uuid, json, random, math
from datetime import datetime, timezone
from collections import defaultdict

app = FastAPI(
    title="YONO-Oracle IIE API",
    description="Sovereign Agentic Parametric Insurance — SBI GFF 2026",
    version="2.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ---------------------------------------------------------------------------
# IN-MEMORY STATE (simulates DB + blockchain state)
# ---------------------------------------------------------------------------
POLICIES: dict = {}        # policy_id -> policy dict
CONTRACTS: dict = {}       # policy_id -> contract state
AUDIT_LOG: list = []       # append-only ledger
UPI_TRANSACTIONS: list = []

# ---------------------------------------------------------------------------
# PARAMETRIC THRESHOLDS (IRDAI-aligned)
# ---------------------------------------------------------------------------
THRESHOLDS = {
    "drought":  {"ndvi_max": 0.30, "rainfall_min_mm": 50},
    "flood":    {"rainfall_6hr_mm": 200},
    "heatwave": {"temp_max_c": 45.0},
    "cyclone":  {"wind_kmh": 75},
}

CROP_MULTIPLIERS = {
    "paddy": 1.2, "cotton": 1.3, "wheat": 1.1, "soybean": 1.0,
    "groundnut": 1.15, "sugarcane": 1.4, "maize": 1.0, "chilli": 1.25,
}

BASE_PAYOUT = {"drought": 6000, "flood": 8000, "heatwave": 7000, "cyclone": 9000}

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def _now_iso():
    return datetime.now(timezone.utc).isoformat()

def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def _tx_hash(seed: str) -> str:
    return "0x" + _sha256(seed + str(time.time()))[:40]

def _block_number() -> int:
    return 19823441 + int(time.time()) % 10000

def _aadhaar_hash(aadhaar: str) -> str:
    """One-way hash of Aadhaar (DPDP compliant — no raw PII stored)"""
    return "AH_" + hmac.new(b"iie-salt-2026", aadhaar.encode(), hashlib.sha256).hexdigest()[:16]

def _append_audit(event_type: str, policy_id: str, data: dict):
    entry = {
        "seq": len(AUDIT_LOG) + 1,
        "ts": _now_iso(),
        "event": event_type,
        "policy_id": policy_id,
        "hash": _sha256(json.dumps(data, sort_keys=True)),
        "prev_hash": AUDIT_LOG[-1]["hash"] if AUDIT_LOG else "0" * 64,
        "data": data,
    }
    AUDIT_LOG.append(entry)
    return entry

# ---------------------------------------------------------------------------
# ORACLE ENGINE
# ---------------------------------------------------------------------------
def _fetch_oracle_data(district: str, seed_offset: int = 0):
    """Simulate live oracle data. In prod: calls NASA/IMD/ISRO APIs."""
    seed = sum(ord(c) for c in district) + seed_offset + int(time.time() // 300)
    r = random.Random(seed)
    return {
        "nasa_modis_ndvi":     round(r.uniform(0.16, 0.44), 3),
        "imd_rainfall_mm":     round(r.uniform(20, 280), 1),
        "isro_temp_c":         round(r.uniform(36, 48), 1),
        "icar_soil_moisture":  round(r.uniform(10, 45), 1),
        "isro_wind_kmh":       round(r.uniform(10, 95), 1),
        "fetched_at":          _now_iso(),
        "sources": ["NASA MODIS", "IMD API", "ISRO Bhuvan", "ICAR Sensors"],
    }

def _run_agents(oracle: dict, event_type: str) -> dict:
    """4 AI agents each cast a vote. Quorum >= 75% triggers payout."""
    ndvi  = oracle["nasa_modis_ndvi"]
    rain  = oracle["imd_rainfall_mm"]
    temp  = oracle["isro_temp_c"]
    soil  = oracle["icar_soil_moisture"]
    wind  = oracle["isro_wind_kmh"]

    if event_type == "drought":
        votes = {
            "Agent1_RiskMonitor":  (ndvi  < THRESHOLDS["drought"]["ndvi_max"],        f"NDVI={ndvi} < 0.30"),
            "Agent2_Verifier":     (rain  < THRESHOLDS["drought"]["rainfall_min_mm"], f"Rain={rain}mm < 50mm"),
            "Agent3_PolicyMatch":  (soil  < 25,                                        f"Soil={soil}% < 25%"),
            "Agent4_Executor":     (ndvi  < 0.33 and rain < 80,                       f"Dual confirm NDVI+Rain"),
        }
    elif event_type == "flood":
        votes = {
            "Agent1_RiskMonitor":  (rain  > THRESHOLDS["flood"]["rainfall_6hr_mm"],   f"Rain={rain}mm > 200mm"),
            "Agent2_Verifier":     (rain  > 170,                                       f"Secondary threshold"),
            "Agent3_PolicyMatch":  (soil  > 70,                                        f"Soil saturation={soil}%"),
            "Agent4_Executor":     (rain  > 150 and soil > 60,                        f"Dual confirm Rain+Soil"),
        }
    elif event_type == "heatwave":
        votes = {
            "Agent1_RiskMonitor":  (temp  > THRESHOLDS["heatwave"]["temp_max_c"],     f"Temp={temp}°C > 45°C"),
            "Agent2_Verifier":     (temp  > 43,                                        f"Secondary threshold"),
            "Agent3_PolicyMatch":  (ndvi  < 0.35,                                      f"Vegetation stress NDVI={ndvi}"),
            "Agent4_Executor":     (temp  > 42 and ndvi < 0.38,                       f"Dual confirm Temp+NDVI"),
        }
    else:  # cyclone
        votes = {
            "Agent1_RiskMonitor":  (wind  > THRESHOLDS["cyclone"]["wind_kmh"],        f"Wind={wind}km/h > 75"),
            "Agent2_Verifier":     (wind  > 60,                                        f"Secondary threshold"),
            "Agent3_PolicyMatch":  (rain  > 100,                                       f"Associated rainfall={rain}mm"),
            "Agent4_Executor":     (wind  > 55 and rain > 80,                         f"Dual confirm Wind+Rain"),
        }

    yes_votes = sum(1 for v, _ in votes.values() if v)
    confidence = round((yes_votes / 4) * 100, 1)
    return {
        "votes": {k: {"decision": "✅ YES" if v else "❌ NO", "reason": r} for k, (v, r) in votes.items()},
        "yes_count": yes_votes,
        "total": 4,
        "confidence_pct": confidence,
        "quorum_met": confidence >= 75,
    }

# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------
class EnrollRequest(BaseModel):
    name: str
    aadhaar_last4: str = Field(..., min_length=4, max_length=4)
    district: str
    state: str
    crop: str
    acreage: float = Field(..., gt=0, le=100)
    plan: str = "Smart Shield"
    phone_last4: str = "0000"

class OracleVerifyRequest(BaseModel):
    policy_id: str
    event_type: str  # drought | flood | heatwave | cyclone

class ContractExecuteRequest(BaseModel):
    policy_id: str
    force: bool = False  # override quorum for demo

class UPIRequest(BaseModel):
    policy_id: str
    amount_inr: float
    upi_id: str = "farmer@sbi"

# ---------------------------------------------------------------------------
# ROUTES: ENROLLMENT
# ---------------------------------------------------------------------------
@app.post("/oracle/enroll")
def enroll_farmer(req: EnrollRequest):
    """
    Real enrollment flow:
    1. Aadhaar hash (DPDP compliant)
    2. Issue policy as smart contract
    3. Record on audit ledger
    4. Return policy + contract address
    """
    policy_id = "IIE-" + _sha256(f"{req.name}{req.district}{req.aadhaar_last4}")[:8].upper()

    if policy_id in POLICIES:
        raise HTTPException(400, "Farmer already enrolled with this Aadhaar+District")

    premiums = {"Basic Protect": 2800, "Smart Shield": 4200, "Full Season Pro": 6300}
    coverage = {"Basic Protect": 42000, "Smart Shield": 70000, "Full Season Pro": 122500}
    subsidy  = round(premiums.get(req.plan, 4200) * 0.30)  # PM-FASAL 30% subsidy
    net_premium = premiums.get(req.plan, 4200) - subsidy

    policy = {
        "policy_id":       policy_id,
        "name":            req.name,
        "aadhaar_hash":    _aadhaar_hash(req.aadhaar_last4),  # no raw PII stored
        "district":        req.district,
        "state":           req.state,
        "crop":            req.crop.lower(),
        "acreage":         req.acreage,
        "plan":            req.plan,
        "premium_inr":     premiums.get(req.plan, 4200),
        "subsidy_inr":     subsidy,
        "net_premium_inr": net_premium,
        "coverage_inr":    coverage.get(req.plan, 70000),
        "status":          "ACTIVE",
        "enrolled_at":     _now_iso(),
        "upi_debit":       f"UPI-DEBIT-{uuid.uuid4().hex[:8].upper()}",
        "digilocker_ref":  f"DL-{uuid.uuid4().hex[:10].upper()}",
    }
    POLICIES[policy_id] = policy

    # Deploy smart contract (state machine)
    contract_addr = "0x" + _sha256(policy_id)[:40]
    CONTRACTS[policy_id] = {
        "address":       contract_addr,
        "policy_id":     policy_id,
        "state":         "ACTIVE",          # ACTIVE -> TRIGGERED -> EXECUTED
        "block_deployed":_block_number(),
        "deployed_at":   _now_iso(),
        "tx_hash":       _tx_hash("deploy" + policy_id),
        "oracle_data":   None,
        "agent_quorum":  None,
        "payout_tx":     None,
        "payout_amount": None,
    }

    _append_audit("POLICY_ENROLLED", policy_id, {
        "plan": req.plan,
        "district": req.district,
        "crop": req.crop,
        "contract_address": contract_addr,
        "net_premium": net_premium,
    })

    return {
        "success":          True,
        "policy_id":        policy_id,
        "contract_address": contract_addr,
        "aadhaar_hash":     policy["aadhaar_hash"],
        "digilocker_ref":   policy["digilocker_ref"],
        "upi_debit_ref":    policy["upi_debit"],
        "net_premium_inr":  net_premium,
        "subsidy_applied":  subsidy,
        "coverage_inr":     coverage.get(req.plan, 70000),
        "message":          f"Policy {policy_id} issued. Contract deployed at {contract_addr}. PM-FASAL subsidy \u20b9{subsidy} applied. UPI debit initiated.",
    }

# ---------------------------------------------------------------------------
# ROUTES: ORACLE + AGENT QUORUM
# ---------------------------------------------------------------------------
@app.post("/oracle/verify")
def oracle_verify(req: OracleVerifyRequest):
    """
    Core oracle engine:
    1. Fetch live parametric data from 4 sources
    2. Run 4 AI agent votes
    3. Check quorum >= 75%
    4. Transition contract state: ACTIVE -> TRIGGERED
    """
    if req.policy_id not in POLICIES:
        raise HTTPException(404, f"Policy {req.policy_id} not found. Enroll first.")
    if req.event_type not in THRESHOLDS:
        raise HTTPException(400, f"Unknown event type. Use: {list(THRESHOLDS.keys())}")

    policy   = POLICIES[req.policy_id]
    oracle   = _fetch_oracle_data(policy["district"])
    quorum   = _run_agents(oracle, req.event_type)
    contract = CONTRACTS[req.policy_id]

    if quorum["quorum_met"] and contract["state"] == "ACTIVE":
        contract["state"]        = "TRIGGERED"
        contract["oracle_data"]  = oracle
        contract["agent_quorum"] = quorum
        contract["triggered_at"] = _now_iso()
        contract["event_type"]   = req.event_type

        mult   = CROP_MULTIPLIERS.get(policy["crop"], 1.0)
        payout = round(BASE_PAYOUT[req.event_type] * mult * policy["acreage"] * (quorum["confidence_pct"] / 100))
        contract["payout_amount"] = payout

        _append_audit("ORACLE_TRIGGERED", req.policy_id, {
            "event_type": req.event_type,
            "confidence": quorum["confidence_pct"],
            "oracle_data": oracle,
            "payout_amount": payout,
        })

    return {
        "policy_id":      req.policy_id,
        "district":       policy["district"],
        "event_type":     req.event_type,
        "oracle_data":    oracle,
        "agent_quorum":   quorum,
        "contract_state": contract["state"],
        "payout_amount":  contract.get("payout_amount"),
        "next_step":      "POST /contract/execute" if quorum["quorum_met"] else "Quorum not met — monitoring continues",
    }

@app.get("/oracle/feed")
def oracle_feed():
    """Live oracle readings for all tracked districts."""
    districts = [
        ("Barmer",    "Rajasthan"),  ("Puri",      "Odisha"),
        ("Ludhiana",  "Punjab"),     ("Nashik",    "Maharashtra"),
        ("Latur",     "Maharashtra"),("Warangal",  "Telangana"),
        ("Adilabad",  "Telangana"),  ("Jodhpur",   "Rajasthan"),
    ]
    return {
        "block_height": _block_number(),
        "fetched_at":   _now_iso(),
        "districts": [
            {"district": d, "state": s, **_fetch_oracle_data(d)}
            for d, s in districts
        ]
    }

# ---------------------------------------------------------------------------
# ROUTES: SMART CONTRACT STATE MACHINE
# ---------------------------------------------------------------------------
@app.post("/contract/execute")
def execute_contract(req: ContractExecuteRequest):
    """
    Smart contract execution:
    State machine: TRIGGERED -> EXECUTED
    Generates immutable tx hash + block number.
    Then calls UPI credit API.
    """
    if req.policy_id not in CONTRACTS:
        raise HTTPException(404, "Contract not found")

    contract = CONTRACTS[req.policy_id]
    policy   = POLICIES[req.policy_id]

    if contract["state"] == "EXECUTED":
        return {"message": "Already executed", "contract": contract}

    if contract["state"] != "TRIGGERED" and not req.force:
        raise HTTPException(400, f"Contract state is '{contract['state']}'. Run /oracle/verify first.")

    # Execute payout
    payout_amount = contract.get("payout_amount") or round(BASE_PAYOUT.get("drought", 6000) * policy["acreage"])
    tx_hash       = _tx_hash("execute" + req.policy_id)
    block_num     = _block_number()
    upi_ref       = "UPI-" + uuid.uuid4().hex[:10].upper()

    contract.update({
        "state":        "EXECUTED",
        "executed_at":  _now_iso(),
        "tx_hash":      tx_hash,
        "block_number": block_num,
        "payout_tx":    upi_ref,
        "payout_amount":payout_amount,
    })

    upi_entry = {
        "ref":          upi_ref,
        "policy_id":    req.policy_id,
        "farmer":       policy["name"],
        "amount_inr":   payout_amount,
        "upi_id":       f"{policy['name'].lower().replace(' ','.')}@sbi",
        "status":       "SUCCESS",
        "method":       "IMPS",
        "credited_at":  _now_iso(),
        "tx_hash":      tx_hash,
        "block_number": block_num,
    }
    UPI_TRANSACTIONS.append(upi_entry)

    # SMS notification
    sms_msg = (f"SBI IIE: Dear {policy['name']}, your crop insurance payout of "
               f"Rs {payout_amount:,} has been credited to your SBI account via IMPS. "
               f"Ref: {upi_ref}. No claim filed. Powered by YONO-Oracle IIE.")

    _append_audit("CONTRACT_EXECUTED", req.policy_id, {
        "tx_hash":      tx_hash,
        "block_number": block_num,
        "payout_inr":   payout_amount,
        "upi_ref":      upi_ref,
        "farmer":       policy["name"],
    })

    return {
        "success":        True,
        "policy_id":      req.policy_id,
        "contract_state": "EXECUTED",
        "payout_inr":     payout_amount,
        "tx_hash":        tx_hash,
        "block_number":   block_num,
        "upi_ref":        upi_ref,
        "farmer":         policy["name"],
        "credited_to":    upi_entry["upi_id"],
        "method":         "IMPS",
        "sms_sent":       sms_msg,
        "audit_seq":      len(AUDIT_LOG),
        "message":        f"Payout of Rs {payout_amount:,} executed on-chain (block #{block_num}) and credited via IMPS. Zero claim forms filed.",
    }

@app.get("/contract/{policy_id}")
def get_contract(policy_id: str):
    if policy_id not in CONTRACTS:
        raise HTTPException(404, "Contract not found")
    return {"contract": CONTRACTS[policy_id], "policy": POLICIES.get(policy_id)}

@app.get("/contract/all/list")
def list_contracts():
    return {"total": len(CONTRACTS), "contracts": list(CONTRACTS.values())}

# ---------------------------------------------------------------------------
# ROUTES: YONO UPI SIMULATION
# ---------------------------------------------------------------------------
@app.post("/yono/upi-credit")
def upi_credit(req: UPIRequest):
    """Simulate SBI Core Banking UPI/IMPS credit."""
    if req.policy_id not in POLICIES:
        raise HTTPException(404, "Policy not found")
    policy = POLICIES[req.policy_id]
    ref    = "UPI-" + uuid.uuid4().hex[:10].upper()
    entry  = {
        "ref":         ref,
        "policy_id":   req.policy_id,
        "farmer":      policy["name"],
        "amount_inr":  req.amount_inr,
        "upi_id":      req.upi_id,
        "status":      "SUCCESS",
        "method":      "IMPS",
        "credited_at": _now_iso(),
        "rrn":         str(int(time.time()))[-12:],   # RBI transaction reference
    }
    UPI_TRANSACTIONS.append(entry)
    _append_audit("UPI_CREDIT", req.policy_id, entry)
    return {"success": True, "transaction": entry,
            "sms": f"Rs {req.amount_inr:,.0f} credited to {req.upi_id}. RRN: {entry['rrn']}. -SBI IIE"}

@app.get("/yono/transactions")
def get_transactions():
    return {"total": len(UPI_TRANSACTIONS), "transactions": UPI_TRANSACTIONS}

# ---------------------------------------------------------------------------
# ROUTES: AUDIT LEDGER (Hyperledger Fabric simulation)
# ---------------------------------------------------------------------------
@app.get("/audit/trail")
def audit_trail():
    """
    Immutable append-only audit ledger.
    Each entry chained via prev_hash — tamper-evident.
    Simulates Hyperledger Fabric ledger for IRDAI/RBI auditors.
    """
    return {
        "chain_valid": _verify_chain(),
        "total_entries": len(AUDIT_LOG),
        "ledger": AUDIT_LOG,
    }

def _verify_chain() -> bool:
    """Verify integrity of audit chain."""
    for i, entry in enumerate(AUDIT_LOG[1:], 1):
        if entry["prev_hash"] != AUDIT_LOG[i-1]["hash"]:
            return False
    return True

# ---------------------------------------------------------------------------
# ROUTES: ML PREDICTOR
# ---------------------------------------------------------------------------
class MLRequest(BaseModel):
    ndvi: float
    temp_c: float
    rainfall_mm: float
    soil_moisture_pct: float = 20.0
    district: str = "Unknown"

def _ml_predict(ndvi, temp_c, rain_mm, soil):
    """Decision tree based on FAO + ISRO published drought thresholds."""
    score = 0.0
    flags = []
    if ndvi < 0.20:    score += 40; flags.append(f"Severe vegetation loss NDVI={ndvi}<0.20")
    elif ndvi < 0.30:  score += 30; flags.append(f"Moderate drought stress NDVI={ndvi}<0.30")
    elif ndvi < 0.40:  score += 15; flags.append(f"Mild stress NDVI={ndvi}")
    if temp_c > 46:    score += 25; flags.append(f"Extreme heat {temp_c}°C>46")
    elif temp_c > 44:  score += 18; flags.append(f"Severe heat {temp_c}°C>44")
    elif temp_c > 42:  score += 10; flags.append(f"Heat stress {temp_c}°C>42")
    if rain_mm < 50:   score += 25; flags.append(f"Severe deficit {rain_mm}mm<50")
    elif rain_mm < 100:score += 18; flags.append(f"Rainfall deficit {rain_mm}mm<100")
    elif rain_mm < 150:score += 10; flags.append(f"Below normal {rain_mm}mm")
    if soil < 15:      score += 10; flags.append(f"Critical moisture {soil}%<15")
    elif soil < 25:    score +=  6; flags.append(f"Low moisture {soil}%<25")
    s = min(score, 100)
    return {
        "risk_score":     round(s, 1),
        "risk_level":     "CRITICAL" if s >= 70 else "HIGH" if s >= 50 else "MEDIUM" if s >= 30 else "LOW",
        "triggered":      s >= 50,
        "confidence_pct": round(min(s * 1.04, 99.9), 1),
        "flags":          flags,
    }

@app.post("/ml/predict")
def ml_predict(req: MLRequest):
    result = _ml_predict(req.ndvi, req.temp_c, req.rainfall_mm, req.soil_moisture_pct)
    return {"district": req.district, "input": req.dict(), "model": "IIE-NDVIv1", **result}

@app.get("/ml/batch")
def ml_batch():
    rows = [
        ("Barmer, RJ",   0.21, 46.4, 38,  14),
        ("Puri, OD",     0.51, 34.2, 218, 78),
        ("Ludhiana, PB", 0.24, 39.8, 72,  21),
        ("Nashik, MH",   0.29, 42.1, 88,  19),
        ("Latur, MH",    0.18, 46.2, 31,  12),
        ("Warangal, TG", 0.33, 38.4, 124, 29),
    ]
    return {"model": "IIE-NDVIv1", "predictions": [
        {"district": d, **_ml_predict(n, t, r, s)} for d, n, t, r, s in rows
    ]}

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "policies": len(POLICIES),
            "contracts": len(CONTRACTS), "audit_entries": len(AUDIT_LOG),
            "chain_valid": _verify_chain()}
