"""
Agents FastAPI Router — exposes orchestration pipeline as HTTP endpoints.

Mount in main.py:
    from agents.router import agents_router
    app.include_router(agents_router)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from .orchestrator import orchestrate, PIPELINE

router = APIRouter(prefix="/agents", tags=["Multi-Agent Orchestration"])
agents_router = router


class OrchestrationRequest(BaseModel):
    event_type:   str = Field(..., description="drought | flood | heatwave | cyclone")
    oracle_data:  dict = Field(..., description="Oracle feed data (ndvi, rainfall_mm, temp_c, etc.)")
    policy:       dict = Field(..., description="Policy object (crop, acreage, district, coverage_inr, enrolled_at)")


@router.post("/orchestrate", summary="Run full multi-agent pipeline for a policy event")
async def run_orchestration(req: OrchestrationRequest):
    """
    Runs RiskAgent → ClaimsAgent → FraudAgent sequentially.
    Returns enriched context with per-agent decisions and final verdict.
    """
    if req.event_type not in ("drought", "flood", "heatwave", "cyclone"):
        raise HTTPException(400, f"Invalid event_type. Use: drought | flood | heatwave | cyclone")

    result = await orchestrate({
        "event_type":  req.event_type,
        "oracle_data": req.oracle_data,
        "policy":      req.policy,
    })
    return result


@router.get("/status", summary="List all registered agents and their versions")
def agents_status():
    return {
        "pipeline_length":  len(PIPELINE),
        "agents": [
            {"name": a.name, "version": a.version, "type": type(a).__name__}
            for a in PIPELINE
        ],
        "description": "Sequential multi-agent pipeline: RiskAgent → ClaimsAgent → FraudAgent",
    }
