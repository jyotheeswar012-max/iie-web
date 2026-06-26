"""
YONO-Oracle IIE — Chainlink-style Parametric Oracle Simulation
Simulates decentralized oracle feeding parametric data to smart contracts.

NOTE: This is a proof-of-concept simulation for SBI GFF 2026.
Real deployment requires RBI Sandbox approval + IRDAI product filing.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import random
import hashlib
import time

router = APIRouter(prefix="/oracle", tags=["Oracle"])

# Parametric thresholds (based on IRDAI guidelines)
THRESHOLDS = {
    "drought":  {"ndvi_max": 0.30, "deficit_pct": 30},
    "flood":    {"rainfall_mm_6hr": 200},
    "heatwave": {"temp_max_c": 45.0},
    "cyclone":  {"wind_kmh": 75},
}

class OracleRequest(BaseModel):
    district: str
    state: str
    crop: str
    acreage: float
    event_type: str

class OracleResult(BaseModel):
    policy_id: str
    triggered: bool
    confidence: float
    quorum: str
    agents: dict
    payout_inr: Optional[float]
    tx_hash: Optional[str]
    block_number: Optional[int]
    oracle_sources: list

def _mock_ndvi(district: str) -> float:
    seed = sum(ord(c) for c in district)
    random.seed(seed + int(time.time() / 300))  # changes every 5 min
    return round(random.uniform(0.18, 0.42), 2)

def _mock_rainfall(district: str) -> float:
    seed = sum(ord(c) for c in district) + 1
    random.seed(seed + int(time.time() / 300))
    return round(random.uniform(80, 260), 1)

def _mock_temp(district: str) -> float:
    seed = sum(ord(c) for c in district) + 2
    random.seed(seed + int(time.time() / 300))
    return round(random.uniform(38, 48), 1)

def _calc_payout(event: str, acreage: float, confidence: float) -> float:
    base_rates = {"drought": 6000, "flood": 8000, "heatwave": 7000, "cyclone": 9000}
    base = base_rates.get(event, 6000)
    return round(base * acreage * (confidence / 100), 0)

def _generate_tx_hash(policy_id: str) -> str:
    return "0x" + hashlib.sha256(policy_id.encode()).hexdigest()[:40]

@router.post("/verify", response_model=OracleResult)
def verify_trigger(req: OracleRequest):
    """Multi-source oracle verification with AI agent quorum."""
    policy_id = f"IIE-{hashlib.md5(f'{req.district}{req.crop}{time.time()}'.encode()).hexdigest()[:6].upper()}"
    ndvi = _mock_ndvi(req.district)
    rainfall = _mock_rainfall(req.district)
    temp = _mock_temp(req.district)

    # Agent votes (each source = 25% weight)
    agent_votes = {
        "Agent1_RiskMonitor":  ndvi < THRESHOLDS["drought"]["ndvi_max"] if req.event_type == "drought" else rainfall > 150,
        "Agent2_Verifier":     ndvi < 0.32 if req.event_type == "drought" else rainfall > 140,
        "Agent3_PolicyMatch":  True,   # KYC + policy active check
        "Agent4_Executor":     True,   # RBI compliance check passed
    }
    votes_yes = sum(1 for v in agent_votes.values() if v)
    confidence = round((votes_yes / 4) * 100, 1)
    triggered = confidence >= 75

    oracle_sources = [
        {"source": "NASA MODIS",  "metric": "NDVI",     "value": str(ndvi),       "threshold": "0.30",  "triggered": ndvi < 0.30},
        {"source": "IMD Rainfall","metric": "Rain(mm)", "value": str(rainfall),  "threshold": "200mm", "triggered": rainfall > 200},
        {"source": "ISRO Bhuvan", "metric": "Temp(°C)", "value": str(temp),      "threshold": "45°C",  "triggered": temp > 45},
        {"source": "ICAR Soil",   "metric": "Moisture", "value": "18%",           "threshold": "25%",   "triggered": True},
    ]

    return OracleResult(
        policy_id=policy_id,
        triggered=triggered,
        confidence=confidence,
        quorum=f"{votes_yes}/4 agents ({confidence}%)",
        agents={k: ("✅ VOTED YES" if v else "❌ VOTED NO") for k, v in agent_votes.items()},
        payout_inr=_calc_payout(req.event_type, req.acreage, confidence) if triggered else None,
        tx_hash=_generate_tx_hash(policy_id) if triggered else None,
        block_number=19823441 + random.randint(0, 500) if triggered else None,
        oracle_sources=oracle_sources,
    )

@router.get("/feed")
def get_oracle_feed():
    """Live oracle feed from all 4 data sources."""
    districts = ["Barmer", "Puri", "Ludhiana", "Nashik", "Warangal", "Latur"]
    return {
        "timestamp": int(time.time()),
        "block_height": 19823441 + random.randint(0, 1000),
        "feeds": [
            {
                "district": d,
                "ndvi": _mock_ndvi(d),
                "rainfall_mm": _mock_rainfall(d),
                "temp_c": _mock_temp(d),
                "risk_score": round(random.uniform(30, 95), 1),
                "alert": random.choice(["DROUGHT", "FLOOD", "HEATWAVE", "NORMAL"]),
            }
            for d in districts
        ]
    }
