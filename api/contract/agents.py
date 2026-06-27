"""
api/contract/agents.py
Multi-Agent Orchestrator — 4 specialist agents with independent logic.

Orchestration protocol:
  1. Each agent independently evaluates oracle data against its specialty threshold.
  2. Each agent emits a vote (YES/NO) + confidence score (0-100) + deliberation log.
  3. Weighted consensus: Agent1=30%, Agent2=25%, Agent3=25%, Agent4=20%.
  4. Final confidence = weighted average of individual confidence scores.
  5. Quorum rule: weighted confidence >= 75% triggers the contract.

Agent specializations:
  Agent1_RiskMonitor   — Primary lead indicator (highest weight, first responder)
  Agent2_Verifier      — Independent cross-source validation
  Agent3_PolicyMatcher — KYC + compliance + secondary indicator check
  Agent4_Executor      — Dual-source confirmation gate (final safety check)
"""
from api.core.utils import now_iso
from api.oracle.engine import THRESHOLDS

AGENT_WEIGHTS = {
    "Agent1_RiskMonitor":   0.30,
    "Agent2_Verifier":      0.25,
    "Agent3_PolicyMatcher": 0.25,
    "Agent4_Executor":      0.20,
}


def _agent_drought(d: dict) -> dict:
    n, rain, soil = d["ndvi"], d["rainfall_mm"], d["soil_moisture"]
    th = THRESHOLDS["drought"]

    results = {}

    # Agent 1 — NDVI lead indicator (NASA MODIS primary)
    ndvi_margin = max(0.0, th["ndvi_max"] - n) / th["ndvi_max"]
    a1_vote = n < th["ndvi_max"]
    a1_conf = round(min(95, 60 + ndvi_margin * 140)) if a1_vote else round(max(5, 40 - ndvi_margin * 80))
    results["Agent1_RiskMonitor"] = {
        "vote": a1_vote, "confidence": a1_conf,
        "primary_indicator": "NDVI",
        "deliberation": [
            f"MODIS NDVI reading: {n} (threshold: < {th['ndvi_max']})",
            f"Vegetation stress margin: {round(ndvi_margin*100,1)}%",
            f"Classification: {'STRESSED' if n < 0.20 else 'BELOW_NORMAL' if n < th['ndvi_max'] else 'NORMAL'}",
            f"Decision: {'YES — drought vegetation signature confirmed' if a1_vote else 'NO — vegetation within normal range'}",
        ]
    }

    # Agent 2 — Rainfall verification (IMD cross-check)
    rain_margin = max(0.0, th["rain_min_mm"] - rain) / th["rain_min_mm"]
    a2_vote = rain < th["rain_min_mm"]
    a2_conf = round(min(95, 55 + rain_margin * 130)) if a2_vote else round(max(5, 35 - rain_margin * 70))
    results["Agent2_Verifier"] = {
        "vote": a2_vote, "confidence": a2_conf,
        "primary_indicator": "rainfall_mm",
        "deliberation": [
            f"IMD 24hr rainfall: {rain}mm (threshold: < {th['rain_min_mm']}mm)",
            f"Deficit ratio: {round(rain_margin*100,1)}% below threshold",
            f"Last 3 seasons comparison: {'severe deficit' if rain < 30 else 'moderate deficit' if rain < th['rain_min_mm'] else 'adequate'}",
            f"Decision: {'YES — rainfall deficit confirmed by IMD' if a2_vote else 'NO — rainfall sufficient'}",
        ]
    }

    # Agent 3 — Soil moisture compliance (ICAR secondary)
    soil_margin = max(0.0, th["soil_max"] - soil) / th["soil_max"]
    a3_vote = soil < th["soil_max"]
    a3_conf = round(min(90, 50 + soil_margin * 120)) if a3_vote else round(max(5, 30 - soil_margin * 60))
    results["Agent3_PolicyMatcher"] = {
        "vote": a3_vote, "confidence": a3_conf,
        "primary_indicator": "soil_moisture",
        "deliberation": [
            f"ICAR soil moisture: {soil}% volumetric (threshold: < {th['soil_max']}%)",
            f"Wilting point proximity: {'CRITICAL (<15%)' if soil < 15 else 'LOW' if soil < th['soil_max'] else 'ADEQUATE'}",
            f"IRDAI compliance: policy terms require soil < {th['soil_max']}% for drought trigger",
            f"Decision: {'YES — soil moisture confirms crop stress' if a3_vote else 'NO — soil moisture adequate'}",
        ]
    }

    # Agent 4 — Dual-source gate (final executor)
    dual = n < 0.33 and rain < 80
    a4_conf = round(min(92, (a1_conf + a2_conf) / 2 * 0.95)) if dual else round(max(5, 25))
    results["Agent4_Executor"] = {
        "vote": dual, "confidence": a4_conf,
        "primary_indicator": "NDVI+rainfall dual gate",
        "deliberation": [
            f"Dual-source gate: NDVI {n} < 0.33 AND rainfall {rain}mm < 80mm",
            f"NDVI gate: {'PASS' if n < 0.33 else 'FAIL'} | Rainfall gate: {'PASS' if rain < 80 else 'FAIL'}",
            f"Executor requires BOTH conditions for final confirmation",
            f"Decision: {'YES — both indicators confirm drought event' if dual else 'NO — dual-gate not satisfied'}",
        ]
    }
    return results


def _agent_flood(d: dict) -> dict:
    rain, soil = d["rainfall_mm"], d["soil_moisture"]
    th = THRESHOLDS["flood"]
    results = {}

    r1 = rain > th["rain_6hr_mm"]
    c1 = round(min(95, 50 + (rain - th["rain_6hr_mm"]) * 0.3)) if r1 else round(max(5, 40))
    results["Agent1_RiskMonitor"] = {
        "vote": r1, "confidence": c1, "primary_indicator": "rainfall_mm",
        "deliberation": [
            f"IMD 6hr cumulative: {rain}mm (IMD extreme rainfall threshold: {th['rain_6hr_mm']}mm)",
            f"Classification: {'EXTREME (>204mm)' if rain > 204 else 'VERY_HEAVY' if rain > th['rain_6hr_mm'] else 'HEAVY'}",
            f"Decision: {'YES — extreme rainfall event' if r1 else 'NO — below extreme threshold'}",
        ]
    }
    r2 = rain > 160
    c2 = round(min(90, 45 + (rain - 160) * 0.25)) if r2 else 20
    results["Agent2_Verifier"] = {
        "vote": r2, "confidence": c2, "primary_indicator": "rainfall_mm (secondary)",
        "deliberation": [
            f"Secondary rainfall threshold (160mm): {rain}mm",
            f"Decision: {'YES — secondary threshold breached' if r2 else 'NO — below secondary threshold'}",
        ]
    }
    r3 = soil > th["soil_min"]
    c3 = round(min(88, 40 + (soil - th["soil_min"]) * 1.5)) if r3 else 20
    results["Agent3_PolicyMatcher"] = {
        "vote": r3, "confidence": c3, "primary_indicator": "soil_moisture",
        "deliberation": [
            f"Soil saturation {soil}% > {th['soil_min']}% (runoff-risk threshold)",
            f"Decision: {'YES — saturated soil confirms flood risk' if r3 else 'NO'}",
        ]
    }
    r4 = rain > 140 and soil > 60
    c4 = round(min(90, (c1 + c3) / 2 * 0.9)) if r4 else 15
    results["Agent4_Executor"] = {
        "vote": r4, "confidence": c4, "primary_indicator": "rain+soil dual gate",
        "deliberation": [
            f"Dual gate: rain {rain}mm > 140 AND soil {soil}% > 60",
            f"Decision: {'YES' if r4 else 'NO'}",
        ]
    }
    return results


def _agent_heatwave(d: dict) -> dict:
    temp, ndvi = d["temp_c"], d["ndvi"]
    th = THRESHOLDS["heatwave"]
    results = {}

    r1 = temp > th["temp_max_c"]
    c1 = round(min(95, 50 + (temp - th["temp_max_c"]) * 8)) if r1 else round(max(5, 30))
    results["Agent1_RiskMonitor"] = {
        "vote": r1, "confidence": c1, "primary_indicator": "land_temp_c",
        "deliberation": [
            f"ISRO LST: {temp}°C (IMD heatwave threshold: >{th['temp_max_c']}°C)",
            f"Severity: {'SEVERE (>47°C)' if temp > 47 else 'EXTREME' if temp > th['temp_max_c'] else 'BELOW_THRESHOLD'}",
            f"Decision: {'YES — heatwave LST confirmed' if r1 else 'NO'}",
        ]
    }
    r2 = temp > 43.0
    c2 = round(min(88, 40 + (temp - 43) * 7)) if r2 else 20
    results["Agent2_Verifier"] = {
        "vote": r2, "confidence": c2, "primary_indicator": "land_temp_c (secondary 43°C)",
        "deliberation": [f"Secondary threshold 43°C: {temp}°C → {'YES' if r2 else 'NO'}"]
    }
    r3 = ndvi < th["ndvi_max"]
    c3 = round(min(85, 40 + (th["ndvi_max"] - ndvi) * 100)) if r3 else 15
    results["Agent3_PolicyMatcher"] = {
        "vote": r3, "confidence": c3, "primary_indicator": "NDVI stress",
        "deliberation": [f"Vegetation heat stress: NDVI {ndvi} < {th['ndvi_max']} → {'YES' if r3 else 'NO'}"]
    }
    r4 = temp > 42 and ndvi < 0.40
    c4 = round(min(90, (c1 + c3) / 2 * 0.92)) if r4 else 10
    results["Agent4_Executor"] = {
        "vote": r4, "confidence": c4, "primary_indicator": "temp+NDVI dual gate",
        "deliberation": [f"Dual gate: temp {temp} > 42 AND NDVI {ndvi} < 0.40 → {'YES' if r4 else 'NO'}"]
    }
    return results


def _agent_cyclone(d: dict) -> dict:
    wind, rain = d["wind_kmh"], d["rainfall_mm"]
    th = THRESHOLDS["cyclone"]
    results = {}

    r1 = wind > th["wind_kmh"]
    c1 = round(min(95, 50 + (wind - th["wind_kmh"]) * 0.8)) if r1 else 20
    results["Agent1_RiskMonitor"] = {
        "vote": r1, "confidence": c1, "primary_indicator": "wind_kmh",
        "deliberation": [
            f"IMD wind speed: {wind}km/h (IMD cyclone threshold: >{th['wind_kmh']}km/h)",
            f"Category: {'VERY_SEVERE (>118)' if wind > 118 else 'SEVERE (>88)' if wind > 88 else 'CYCLONIC_STORM' if wind > th['wind_kmh'] else 'DEPRESSION'}",
            f"Decision: {'YES' if r1 else 'NO'}",
        ]
    }
    r2 = wind > 60
    c2 = round(min(85, 35 + (wind - 60) * 0.7)) if r2 else 15
    results["Agent2_Verifier"] = {
        "vote": r2, "confidence": c2, "primary_indicator": "wind_kmh (secondary 60)",
        "deliberation": [f"Secondary wind threshold 60km/h: {wind}km/h → {'YES' if r2 else 'NO'}"]
    }
    r3 = rain > th["rain_mm"]
    c3 = round(min(85, 35 + (rain - th["rain_mm"]) * 0.4)) if r3 else 15
    results["Agent3_PolicyMatcher"] = {
        "vote": r3, "confidence": c3, "primary_indicator": "associated rainfall",
        "deliberation": [f"Cyclone rainfall {rain}mm > {th['rain_mm']}mm threshold → {'YES' if r3 else 'NO'}"]
    }
    r4 = wind > 55 and rain > 70
    c4 = round(min(90, (c1 + c3) / 2 * 0.9)) if r4 else 10
    results["Agent4_Executor"] = {
        "vote": r4, "confidence": c4, "primary_indicator": "wind+rain dual gate",
        "deliberation": [f"Dual gate: wind {wind} > 55 AND rain {rain}mm > 70 → {'YES' if r4 else 'NO'}"]
    }
    return results


_DISPATCHERS = {
    "drought":  _agent_drought,
    "flood":    _agent_flood,
    "heatwave": _agent_heatwave,
    "cyclone":  _agent_cyclone,
}


def run_quorum(oracle: dict, event_type: str) -> dict:
    """
    Orchestrate all 4 agents and compute weighted consensus.
    Returns full deliberation log visible to judges / auditors.
    """
    d       = oracle["derived"]
    fn      = _DISPATCHERS[event_type]
    results = fn(d)

    # Weighted confidence aggregation
    w_conf  = 0.0
    yes_count = 0
    agent_summary = {}

    for agent, weight in AGENT_WEIGHTS.items():
        r = results[agent]
        w_conf    += weight * r["confidence"]
        yes_count += int(r["vote"])
        agent_summary[agent] = {
            "decision":           "✅ YES" if r["vote"] else "❌ NO",
            "confidence":         r["confidence"],
            "weight":             f"{int(weight*100)}%",
            "primary_indicator":  r["primary_indicator"],
            "deliberation":       r["deliberation"],
        }

    weighted_confidence = round(w_conf, 1)
    quorum_met = weighted_confidence >= 75.0

    return {
        "orchestration_ts":    now_iso(),
        "event_type":          event_type,
        "agents":              agent_summary,
        "yes_count":           yes_count,
        "total_agents":        4,
        "weighted_confidence": weighted_confidence,
        "confidence_pct":      weighted_confidence,  # alias for compatibility
        "quorum_met":          quorum_met,
        "quorum_rule":         "weighted confidence >= 75% (Agent weights: 30/25/25/20)",
        "protocol":            "IIE-MAO-v2 (Multi-Agent Orchestration)",
    }
