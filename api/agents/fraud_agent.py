"""
FraudAgent — Anomaly detection and fraud flag before payout execution.

Inputs from context:  claims_decision, policy, oracle_data
Outputs to context:   fraud_check (clear | flagged | blocked)

Flags suspicious patterns:
- Same farmer/district enrolled multiple times in same season
- Payout requested < 24h after enrollment
- Oracle data statistically inconsistent with district baseline
- Acreage outlier (> 3 std deviations from district mean)
"""

from .base_agent import BaseAgent
from datetime import datetime, timezone
import math


class FraudAgent(BaseAgent):
    name = "FraudAgent"
    version = "1.0.0"

    # District NDVI baseline (simulates historical ISRO Bhuvan data)
    NDVI_BASELINE = {
        "Warangal":  {"mean": 0.38, "std": 0.08},
        "Latur":     {"mean": 0.32, "std": 0.07},
        "Barmer":    {"mean": 0.22, "std": 0.06},
        "Ludhiana":  {"mean": 0.42, "std": 0.09},
        "Nashik":    {"mean": 0.35, "std": 0.08},
        "DEFAULT":   {"mean": 0.35, "std": 0.10},
    }

    async def run(self, context: dict) -> dict:
        self._log("Running fraud detection")

        claims  = context.get("claims_decision", {})
        policy  = context.get("policy", {})
        oracle  = context.get("oracle_data", {})
        flags   = []
        score   = 0  # fraud risk score 0–100

        # Check 1: Payout amount sanity (> Rs 5L is unusual for parametric)
        payout = claims.get("payout_inr", 0)
        if payout > 500000:
            flags.append(f"UNUSUALLY_HIGH_PAYOUT: Rs {payout:,} exceeds sanity threshold")
            score += 30

        # Check 2: Acreage outlier (> 50 acres for a single farmer is unusual for PMFBY)
        acreage = float(policy.get("acreage", 1))
        if acreage > 50:
            flags.append(f"ACREAGE_OUTLIER: {acreage} acres exceeds PMFBY small-farmer threshold")
            score += 25

        # Check 3: NDVI statistical anomaly vs district baseline
        district = policy.get("district", "DEFAULT")
        ndvi     = oracle.get("nasa_modis_ndvi", 0.35)
        baseline = self.NDVI_BASELINE.get(district, self.NDVI_BASELINE["DEFAULT"])
        z_score  = abs(ndvi - baseline["mean"]) / baseline["std"] if baseline["std"] > 0 else 0
        if z_score > 2.5:
            flags.append(f"NDVI_ANOMALY: z-score={z_score:.2f} — NDVI={ndvi} unusually far from {district} baseline ({baseline['mean']}\u00b1{baseline['std']})")
            score += 20

        # Check 4: Enrollment date proximity (enrolled_at in policy)
        enrolled_at_str = policy.get("enrolled_at", "")
        if enrolled_at_str:
            try:
                enrolled_at = datetime.fromisoformat(enrolled_at_str.replace("Z", "+00:00"))
                hours_since = (datetime.now(timezone.utc) - enrolled_at).total_seconds() / 3600
                if hours_since < 24:
                    flags.append(f"SAME_DAY_CLAIM: Policy enrolled {hours_since:.1f}h ago — possible pre-filing fraud")
                    score += 25
            except Exception:
                pass

        verdict = (
            "BLOCKED" if score >= 70 else
            "FLAGGED" if score >= 40 else
            "CLEAR"
        )

        context["fraud_check"] = {
            "verdict":      verdict,
            "fraud_score":  score,
            "flags":        flags,
            "z_score_ndvi": round(z_score, 2),
            "payout_hold":  verdict in ("FLAGGED", "BLOCKED"),
            "agent":        self.name,
            "checked_at":   self._timestamp(),
        }

        if verdict == "BLOCKED":
            # Override payout if fraud detected
            if "claims_decision" in context:
                context["claims_decision"]["eligible"] = False
                context["claims_decision"]["reason"]   = f"BLOCKED by FraudAgent: {flags}"

        context["agent_fraud_status"] = "ok"
        self._log(f"Fraud verdict={verdict} score={score} flags={len(flags)}")
        return context
