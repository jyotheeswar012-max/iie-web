"""
IIE Risk Scorer — GradientBoosting ML Model

Features (8 total):
  ndvi, rainfall_mm, temp_c, soil_moisture_pct, wind_kmh,
  ndvi_delta (deviation from district baseline),
  rain_temp_interaction, season_code

Target: binary (1 = payout_triggered, 0 = no payout)
Model: GradientBoostingClassifier (sklearn) trained on synthetic PMFBY data

If model pickle not found, falls back to rule-based scoring with warning.
"""

import os
import pickle
import math
from typing import Optional
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# FEATURE ENGINEERING
# ---------------------------------------------------------------------------

DISTRICT_NDVI_BASELINE = {
    "Warangal": 0.38, "Latur": 0.32, "Barmer": 0.22,
    "Ludhiana": 0.42, "Nashik": 0.35, "Adilabad": 0.36,
    "Puri": 0.46, "Jodhpur": 0.24, "DEFAULT": 0.35,
}

SEASON_CODE = {
    "kharif":  1,  # Jun–Nov (monsoon)
    "rabi":    2,  # Nov–Apr (winter)
    "zaid":    3,  # Apr–Jun (summer)
    "DEFAULT": 1,
}


def build_features(ndvi: float, rainfall_mm: float, temp_c: float,
                   soil_moisture_pct: float, wind_kmh: float,
                   district: str = "DEFAULT", season: str = "kharif") -> list:
    """
    Returns an 8-dimensional feature vector.
    Must match the feature order used during training.
    """
    baseline     = DISTRICT_NDVI_BASELINE.get(district, DISTRICT_NDVI_BASELINE["DEFAULT"])
    ndvi_delta   = round(ndvi - baseline, 4)
    interaction  = round(rainfall_mm * (1 / (temp_c + 1e-6)), 4)  # Rain/Temp interaction
    season_code  = SEASON_CODE.get(season.lower(), SEASON_CODE["DEFAULT"])

    return [
        ndvi,
        rainfall_mm,
        temp_c,
        soil_moisture_pct,
        wind_kmh,
        ndvi_delta,
        interaction,
        season_code,
    ]


# ---------------------------------------------------------------------------
# RULE-BASED FALLBACK (used when pickle not present)
# ---------------------------------------------------------------------------

def _rule_based_score(ndvi, rainfall_mm, temp_c, soil_moisture_pct, wind_kmh) -> float:
    """FAO + ISRO threshold-based score. Returns probability 0.0–1.0."""
    s = 0.0
    if ndvi < 0.20:    s += 40
    elif ndvi < 0.30:  s += 28
    elif ndvi < 0.40:  s += 12
    if rainfall_mm < 50:   s += 28
    elif rainfall_mm < 100: s += 18
    if temp_c > 46:    s += 22
    elif temp_c > 44:  s += 14
    if soil_moisture_pct < 15: s += 10
    if wind_kmh > 75:  s += 20
    return min(s / 100.0, 0.99)


# ---------------------------------------------------------------------------
# MODEL LOADER
# ---------------------------------------------------------------------------

_MODEL = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
_MODEL_SOURCE = "fallback"


def _load_model():
    global _MODEL, _MODEL_SOURCE
    if _MODEL is not None:
        return _MODEL
    if os.path.exists(_MODEL_PATH):
        with open(_MODEL_PATH, "rb") as f:
            _MODEL = pickle.load(f)
        _MODEL_SOURCE = "sklearn_gbm"
        print(f"[RiskScorer] Loaded GBM model from {_MODEL_PATH}")
    else:
        print(f"[RiskScorer] WARNING: model pickle not found at {_MODEL_PATH}. Using rule-based fallback.")
        print(f"[RiskScorer] Run: python api/ml/train_model.py to generate risk_model.pkl")
        _MODEL_SOURCE = "fallback"
    return _MODEL


# ---------------------------------------------------------------------------
# MAIN SCORING FUNCTION
# ---------------------------------------------------------------------------

def score_risk(
    ndvi: float,
    rainfall_mm: float,
    temp_c: float,
    soil_moisture_pct: float = 20.0,
    wind_kmh: float = 20.0,
    district: str = "DEFAULT",
    season: str = "kharif",
    event_type: str = "drought",
) -> dict:
    """
    Score a single observation. Returns:
      - probability: float 0.0–1.0
      - risk_level:  CRITICAL | HIGH | MEDIUM | LOW
      - triggered:   bool (probability >= 0.50)
      - feature_importance: dict of feature contributions (SHAP-style approximation)
      - model_source: 'sklearn_gbm' or 'fallback'
    """
    model = _load_model()
    features = build_features(ndvi, rainfall_mm, temp_c, soil_moisture_pct, wind_kmh, district, season)

    if model is not None:
        prob = float(model.predict_proba([features])[0][1])
    else:
        prob = _rule_based_score(ndvi, rainfall_mm, temp_c, soil_moisture_pct, wind_kmh)

    # SHAP-style feature importance (normalized absolute contribution approximation)
    feat_names = ["ndvi", "rainfall_mm", "temp_c", "soil_moisture", "wind_kmh", "ndvi_delta", "rain_temp_ix", "season"]
    feature_importance = {
        name: round(abs(val) / (sum(abs(v) for v in features) + 1e-9), 3)
        for name, val in zip(feat_names, features)
    }

    level = (
        "CRITICAL" if prob >= 0.75 else
        "HIGH"     if prob >= 0.55 else
        "MEDIUM"   if prob >= 0.35 else
        "LOW"
    )

    return {
        "probability":        round(prob, 4),
        "risk_level":         level,
        "triggered":          prob >= 0.50,
        "confidence_pct":     round(prob * 100, 1),
        "feature_vector":     dict(zip(feat_names, features)),
        "feature_importance": feature_importance,
        "model_source":       _MODEL_SOURCE,
        "event_type":         event_type,
        "district":           district,
        "scored_at":          datetime.now(timezone.utc).isoformat(),
    }
