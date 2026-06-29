"""
Orchestrator — Runs all agents sequentially, passing shared context.

Pipeline:
  Input Event
      │
      ▼
  [RiskAgent]  → adds risk_assessment to context
      │
      ▼
  [ClaimsAgent] → adds claims_decision to context
      │
      ▼
  [FraudAgent]  → adds fraud_check, may block payout
      │
      ▼
  Final context returned as orchestration result

Designed to be extensible: add more agents to PIPELINE list.
"""

from .risk_agent   import RiskAgent
from .claims_agent import ClaimsAgent
from .fraud_agent  import FraudAgent
from datetime import datetime, timezone
import time

PIPELINE = [
    RiskAgent(),
    ClaimsAgent(),
    FraudAgent(),
]


async def orchestrate(event: dict) -> dict:
    """
    Main entry point: accepts an event dict, runs all agents in order.

    Required keys in event:
        - oracle_data:  dict from oracle engine (ndvi, rainfall_mm, temp_c, ...)
        - event_type:   str (drought | flood | heatwave | cyclone)
        - policy:       dict (crop, acreage, district, coverage_inr, enrolled_at)

    Returns:
        - Full enriched context with outputs from all agents
        - pipeline_summary: per-agent status + timing
    """
    context = dict(event)  # shallow copy so original event is not mutated
    context["orchestrated_at"] = datetime.now(timezone.utc).isoformat()
    context["pipeline_summary"] = []

    for agent in PIPELINE:
        t0 = time.perf_counter()
        try:
            context = await agent.run(context)
            elapsed = round((time.perf_counter() - t0) * 1000, 1)
            context["pipeline_summary"].append({
                "agent":   agent.name,
                "version": agent.version,
                "status":  context.get(f"agent_{agent.name.lower()}_status", "ok"),
                "ms":      elapsed,
            })
        except Exception as exc:
            elapsed = round((time.perf_counter() - t0) * 1000, 1)
            context["pipeline_summary"].append({
                "agent":   agent.name,
                "status":  "error",
                "error":   str(exc),
                "ms":      elapsed,
            })
            # Non-fatal: log and continue pipeline
            print(f"[Orchestrator] Agent {agent.name} failed: {exc}")

    # Final verdict
    fraud   = context.get("fraud_check", {})
    claims  = context.get("claims_decision", {})
    context["final_verdict"] = {
        "payout_approved": claims.get("eligible", False) and not fraud.get("payout_hold", False),
        "payout_inr":      claims.get("payout_inr", 0) if not fraud.get("payout_hold") else 0,
        "fraud_verdict":   fraud.get("verdict", "CLEAR"),
        "risk_level":      context.get("risk_assessment", {}).get("risk_level", "UNKNOWN"),
    }

    return context
