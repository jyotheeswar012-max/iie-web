"""
api/oracle/engine.py
Real Oracle Engine — 4 independent parametric data sources.

Data source mapping (simulation → production):
  NASA_MODIS   → https://modis.gsfc.nasa.gov/data/ (NDVI, 250m, 16-day composite)
  IMD_Rainfall → https://mausam.imd.gov.in/imd_latest/contents/gridded-data.php
  ISRO_Bhuvan  → https://bhuvan.nrsc.gov.in/bhuvan_links.php (LST product)
  ICAR_Sensors → https://icar.org.in/content/soil-health-card-scheme (IoT soil nodes)

Seed logic: district_hash + 5-min bucket → deterministic within window,
naturally drifts across time (simulates live API polling).
"""
import random, time
from api.core.utils    import now_iso, sha256, aadhaar_token, digilocker_ref, upi_ref as _upi_ref, uid, tx_hash, contract_address, block_number
from api.core.store    import load, save
from api.core          import logging as log
from api.audit.chain   import append as audit_append
from api.contract.agents import run_quorum

# IRDAI published parametric thresholds (Kharif 2025 circular)
THRESHOLDS = {
    "drought":  {"ndvi_max": 0.30, "rain_min_mm": 50,  "soil_max": 25},
    "flood":    {"rain_6hr_mm": 200, "soil_min": 70},
    "heatwave": {"temp_max_c": 45.0, "ndvi_max": 0.38},
    "cyclone":  {"wind_kmh": 75,  "rain_mm": 80},
}

BASE_PAYOUT = {"drought": 6000, "flood": 8500, "heatwave": 7200, "cyclone": 9500}
CROP_MULT   = {
    "paddy":1.2,"cotton":1.3,"wheat":1.1,"soybean":1.0,
    "groundnut":1.15,"sugarcane":1.4,"maize":1.0,"chilli":1.25,
    "tomato":1.1,"onion":1.05,"potato":1.0,"rice":1.2,
}
PLAN_COV = {"Basic Protect": 42000, "Smart Shield": 70000, "Full Season Pro": 122500}
PLAN_PRM = {"Basic Protect": 2800,  "Smart Shield": 4200,  "Full Season Pro": 6300}


def fetch_oracle(district: str) -> dict:
    """
    Pull readings from 4 independent data sources.
    Each source has its own latency and measurement unit.
    Bucket-seeded: stable within 5-min window, changes with each new bucket.
    """
    # District-specific entropy + time bucket
    d_hash  = sum(ord(c) * (i + 1) for i, c in enumerate(district.lower()))
    bucket  = int(time.time() // 300)
    seed    = d_hash * 31 + bucket * 997
    rng     = random.Random(seed)

    ndvi  = round(rng.uniform(0.10, 0.52), 3)   # MODIS NDVI (0=bare, 1=dense vegetation)
    rain  = round(rng.uniform(10,  310),   1)   # IMD 24hr cumulative mm
    temp  = round(rng.uniform(32,  49.5),  1)   # ISRO land surface temp °C
    soil  = round(rng.uniform(6,   58),    1)   # ICAR volumetric soil water content %
    wind  = round(rng.uniform(5,   105),   1)   # IMD 10m wind speed km/h

    sources = {
        "NASA_MODIS": {
            "metric":     "NDVI",
            "value":      ndvi,
            "unit":       "index (0–1)",
            "source_url": "https://modis.gsfc.nasa.gov",
            "product":    "MOD13Q1 v6.1",
            "latency_ms": rng.randint(80, 240),
            "freshness":  "16-day composite",
        },
        "IMD_Rainfall": {
            "metric":     "rainfall_mm",
            "value":      rain,
            "unit":       "mm / 24hr",
            "source_url": "https://mausam.imd.gov.in",
            "product":    "GPM IMERG Final",
            "latency_ms": rng.randint(30, 120),
            "freshness":  "30-min granularity",
        },
        "ISRO_Bhuvan": {
            "metric":     "land_temp_c",
            "value":      temp,
            "unit":       "celsius",
            "source_url": "https://bhuvan.nrsc.gov.in",
            "product":    "MODIS LST MOD11A1",
            "latency_ms": rng.randint(100, 290),
            "freshness":  "daily",
        },
        "ICAR_Sensors": {
            "metric":     "soil_moisture",
            "value":      soil,
            "unit":       "% volumetric",
            "source_url": "https://icar.org.in",
            "product":    "Agri-IoT Node v3",
            "latency_ms": rng.randint(20, 95),
            "freshness":  "15-min",
        },
    }

    return {
        "district":    district,
        "bucket_5min": bucket,
        "fetched_at":  now_iso(),
        "sources":     sources,
        "derived": {
            "ndvi":         ndvi,
            "rainfall_mm":  rain,
            "temp_c":       temp,
            "soil_moisture": soil,
            "wind_kmh":     wind,
        },
    }


def handle_enroll(body: dict) -> tuple:
    store  = load()
    name   = str(body.get("name",  "Farmer")).strip()
    a4     = str(body.get("aadhaar_last4", "0000"))[:4]
    dist   = str(body.get("district", "Unknown")).strip()
    state  = str(body.get("state",    "India")).strip()
    crop   = str(body.get("crop",     "wheat")).lower().strip()
    acres  = max(0.1, float(body.get("acreage", 5)))
    plan   = str(body.get("plan",  "Smart Shield")).strip()
    if plan not in PLAN_PRM: plan = "Smart Shield"

    pid    = "IIE-" + sha256(f"{name.lower()}{dist.lower()}{a4}")[:8].upper()
    if pid in store["policies"]:
        return 400, {"error": f"Already enrolled. Policy: {pid}"}

    sub    = round(PLAN_PRM[plan] * 0.30)   # PM-FASAL subsidy
    net    = PLAN_PRM[plan] - sub
    caddr  = contract_address(pid)
    tx     = tx_hash("deploy:" + pid)
    blk    = block_number()
    dl_ref = digilocker_ref()
    up_ref = "UPI-D-" + uid(8)

    # India Stack KYC simulation
    from api.india_stack.simulator import simulate_kyc
    kyc = simulate_kyc(name, a4, dist)

    policy = {
        "policy_id":       pid,
        "name":            name,
        "aadhaar_hash":    aadhaar_token(a4),
        "district":        dist,
        "state":           state,
        "crop":            crop,
        "acreage":         acres,
        "plan":            plan,
        "premium_inr":     PLAN_PRM[plan],
        "subsidy_inr":     sub,
        "net_premium_inr": net,
        "coverage_inr":    PLAN_COV.get(plan, 70000),
        "status":          "ACTIVE",
        "enrolled_at":     now_iso(),
        "upi_debit_ref":   up_ref,
        "digilocker_ref":  dl_ref,
        "kyc":             kyc,
    }
    contract = {
        "address":        caddr,
        "policy_id":      pid,
        "state":          "ACTIVE",
        "block_deployed": blk,
        "deployed_at":    now_iso(),
        "deploy_tx":      tx,
        "oracle_data":    None,
        "agent_quorum":   None,
        "payout_tx":      None,
        "payout_amount":  None,
        "history": [{"state": "ACTIVE", "at": now_iso(), "tx": tx, "block": blk}],
    }
    store["policies"][pid]  = policy
    store["contracts"][pid] = contract
    audit_append(store, "POLICY_ENROLLED", pid, {
        "plan": plan, "district": dist, "crop": crop,
        "contract_address": caddr, "block": blk, "net_premium": net,
        "digilocker_ref": dl_ref, "kyc_status": kyc["status"],
    })
    save(store)
    log.info("policy_enrolled", policy_id=pid, plan=plan, district=dist, crop=crop)

    return 200, {
        "success":          True,
        "policy_id":        pid,
        "contract_address": caddr,
        "aadhaar_hash":     policy["aadhaar_hash"],
        "digilocker_ref":   dl_ref,
        "upi_debit_ref":    up_ref,
        "kyc":              kyc,
        "net_premium_inr":  net,
        "subsidy_applied":  sub,
        "coverage_inr":     PLAN_COV.get(plan, 70000),
        "block_deployed":   blk,
        "deploy_tx":        tx,
        "message": (f"Policy {pid} issued. Contract @ {caddr} deployed at block #{blk}. "
                    f"PM-FASAL subsidy ₹{sub} applied. DigiLocker: {dl_ref}."),
    }


def handle_verify(body: dict) -> tuple:
    store = load()
    pid   = str(body.get("policy_id", ""))
    ev    = str(body.get("event_type", "drought")).lower()

    if pid not in store["policies"]:
        return 404, {"error": f"Policy {pid} not found."}
    if ev not in THRESHOLDS:
        return 400, {"error": f"Unknown event_type. Options: {list(THRESHOLDS)}"}

    policy   = store["policies"][pid]
    oracle   = fetch_oracle(policy["district"])
    quorum   = run_quorum(oracle, ev)          # multi-agent orchestration
    contract = store["contracts"][pid]

    if quorum["quorum_met"] and contract["state"] == "ACTIVE":
        mult   = CROP_MULT.get(policy["crop"], 1.0)
        payout = round(BASE_PAYOUT.get(ev, 6000) * mult * policy["acreage"]
                       * (quorum["confidence_pct"] / 100))
        contract.update({
            "state":        "TRIGGERED",
            "oracle_data":  oracle,
            "agent_quorum": quorum,
            "triggered_at": now_iso(),
            "event_type":   ev,
            "payout_amount": payout,
        })
        contract["history"].append({
            "state": "TRIGGERED", "at": now_iso(),
            "event": ev, "confidence": quorum["confidence_pct"],
        })
        audit_append(store, "ORACLE_TRIGGERED", pid, {
            "event_type": ev, "confidence": quorum["confidence_pct"],
            "yes_agents": quorum["yes_count"],
            "payout_amount": payout,
        })
        store["contracts"][pid] = contract
        save(store)
        log.info("oracle_triggered", policy_id=pid, event=ev,
                 confidence=quorum["confidence_pct"], payout=payout)

    return 200, {
        "policy_id":      pid,
        "district":       policy["district"],
        "event_type":     ev,
        "oracle_data":    oracle,
        "agent_quorum":   quorum,
        "contract_state": contract["state"],
        "payout_amount":  contract.get("payout_amount"),
        "next_step":      "POST /api/contract/execute" if quorum["quorum_met"]
                          else "Quorum not met — monitoring continues",
    }


def handle_feed() -> tuple:
    districts = [
        ("Barmer",   "RJ"), ("Puri",     "OD"), ("Ludhiana", "PB"),
        ("Nashik",   "MH"), ("Latur",    "MH"), ("Warangal", "TG"),
        ("Adilabad", "TG"), ("Jodhpur",  "RJ"), ("Guntur",   "AP"),
        ("Kurnool",  "AP"),
    ]
    from api.ml.predictor import predict
    rows = []
    for d, s in districts:
        ora = fetch_oracle(d)
        der = ora["derived"]
        ml  = predict(der["ndvi"], der["temp_c"], der["rainfall_mm"], der["soil_moisture"])
        rows.append({
            "district":    d, "state": s,
            **der,
            "risk_score":  ml["risk_score"],
            "risk_level":  ml["risk_level"],
            "triggered":   ml["triggered"],
        })
    return 200, {"block_height": block_number(), "fetched_at": now_iso(), "districts": rows}
