"""
ML Router — exposes risk scoring endpoints.

Mount in main.py:
    from ml.router import ml_router
    app.include_router(ml_router)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from .risk_scorer import score_risk, _MODEL_SOURCE, DISTRICT_NDVI_BASELINE

router = APIRouter(prefix="/ml", tags=["ML Risk Scorer"])
ml_router = router


class ScoreRequest(BaseModel):
    ndvi:               float = Field(..., ge=0.0, le=1.0)
    rainfall_mm:        float = Field(..., ge=0.0)
    temp_c:             float = Field(..., ge=0.0, le=60.0)
    soil_moisture_pct:  float = Field(20.0, ge=0.0, le=100.0)
    wind_kmh:           float = Field(20.0, ge=0.0)
    district:           str   = Field("DEFAULT")
    season:             str   = Field("kharif", description="kharif | rabi | zaid")
    event_type:         str   = Field("drought", description="drought | flood | heatwave | cyclone")


class BatchScoreRequest(BaseModel):
    observations: List[ScoreRequest] = Field(..., max_items=50)


@router.post("/score", summary="Score a single observation for parametric risk")
def score_single(req: ScoreRequest):
    return score_risk(
        ndvi              = req.ndvi,
        rainfall_mm       = req.rainfall_mm,
        temp_c            = req.temp_c,
        soil_moisture_pct = req.soil_moisture_pct,
        wind_kmh          = req.wind_kmh,
        district          = req.district,
        season            = req.season,
        event_type        = req.event_type,
    )


@router.post("/batch-score", summary="Score multiple observations in one call (max 50)")
def score_batch(req: BatchScoreRequest):
    results = []
    for obs in req.observations:
        result = score_risk(
            ndvi              = obs.ndvi,
            rainfall_mm       = obs.rainfall_mm,
            temp_c            = obs.temp_c,
            soil_moisture_pct = obs.soil_moisture_pct,
            wind_kmh          = obs.wind_kmh,
            district          = obs.district,
            season            = obs.season,
            event_type        = obs.event_type,
        )
        results.append(result)
    return {
        "count":   len(results),
        "results": results,
        "triggered_count": sum(1 for r in results if r["triggered"]),
    }


@router.get("/model-info", summary="Model metadata and feature schema")
def model_info():
    return {
        "model":          "IIE-GBM-v1",
        "algorithm":      "GradientBoostingClassifier (sklearn)",
        "features":       ["ndvi", "rainfall_mm", "temp_c", "soil_moisture_pct", "wind_kmh", "ndvi_delta", "rain_temp_interaction", "season_code"],
        "target":         "payout_triggered (binary)",
        "training_data":  "Synthetic PMFBY-aligned parametric data (N=3000)",
        "model_source":   _MODEL_SOURCE,
        "districts":      list(DISTRICT_NDVI_BASELINE.keys()),
        "train_script":   "Run: python api/ml/train_model.py to generate risk_model.pkl",
        "note":           "If risk_model.pkl missing, rule-based fallback activates automatically.",
    }
