"""
ClaimsAgent — Calculates payout amount if risk is triggered.

Inputs from context:  risk_assessment, policy, event_type
Outputs to context:   claims_decision (payout_inr, eligible, irdai_band)
"""

from .base_agent import BaseAgent


class ClaimsAgent(BaseAgent):
    name = "ClaimsAgent"
    version = "1.1.0"

    BASE_PAYOUT = {"drought": 6000, "flood": 8000, "heatwave": 7000, "cyclone": 9000}
    CROP_MULTIPLIERS = {
        "paddy": 1.2, "cotton": 1.3, "wheat": 1.1, "soybean": 1.0,
        "groundnut": 1.15, "sugarcane": 1.4, "maize": 1.0, "chilli": 1.25,
    }
    # IRDAI parametric payout bands (% of sum insured)
    IRDAI_BANDS = {
        "CRITICAL": (0.80, 1.00),
        "HIGH":     (0.55, 0.79),
        "MEDIUM":   (0.30, 0.54),
        "LOW":      (0.00, 0.29),
    }

    async def run(self, context: dict) -> dict:
        self._log("Calculating claim payout")

        risk   = context.get("risk_assessment", {})
        policy = context.get("policy", {})
        event  = context.get("event_type", "drought")

        if not risk.get("triggered", False):
            context["claims_decision"] = {
                "eligible":   False,
                "reason":     "Risk threshold not met — no payout triggered",
                "payout_inr": 0,
                "agent":      self.name,
            }
            context["agent_claims_status"] = "ok"
            self._log("Payout not triggered")
            return context

        crop     = policy.get("crop", "paddy").lower()
        acreage  = float(policy.get("acreage", 1.0))
        level    = risk.get("risk_level", "MEDIUM")
        score    = risk.get("risk_score", 50)
        coverage = float(policy.get("coverage_inr", 70000))

        base     = self.BASE_PAYOUT.get(event, 6000)
        mult     = self.CROP_MULTIPLIERS.get(crop, 1.0)
        band_lo, band_hi = self.IRDAI_BANDS[level]
        band_pct = band_lo + (score / 100) * (band_hi - band_lo)

        # Payout = min(base * multiplier * acreage * confidence, IRDAI band of coverage)
        computed    = round(base * mult * acreage * (score / 100))
        irdai_cap   = round(coverage * band_pct)
        payout      = min(computed, irdai_cap)

        context["claims_decision"] = {
            "eligible":      True,
            "payout_inr":    payout,
            "computed_inr":  computed,
            "irdai_cap_inr": irdai_cap,
            "irdai_band":    f"{int(band_lo*100)}–{int(band_hi*100)}% of sum insured",
            "risk_level":    level,
            "crop":          crop,
            "acreage":       acreage,
            "event":         event,
            "agent":         self.name,
            "decided_at":    self._timestamp(),
        }
        context["agent_claims_status"] = "ok"
        self._log(f"Payout approved: Rs {payout:,} | IRDAI band {int(band_lo*100)}-{int(band_hi*100)}%")
        return context
