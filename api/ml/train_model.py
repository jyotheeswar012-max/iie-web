"""
IIE Risk Model Training Script

Generates a GradientBoostingClassifier trained on synthetic PMFBY-aligned data.
Run this once to produce risk_model.pkl:

    python api/ml/train_model.py

Training data simulates ISRO Bhuvan + IMD + NASA MODIS parametric inputs
calibrated against PMFBY payout trigger thresholds.
"""

import os
import pickle
import random
import math

def main():
    try:
        from sklearn.ensemble import GradientBoostingClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import classification_report, roc_auc_score
        import numpy as np
    except ImportError:
        print("scikit-learn not installed. Run: pip install scikit-learn numpy")
        return

    random.seed(42)
    np.random.seed(42)

    N = 3000
    records = []

    for _ in range(N):
        # Simulate oracle sensor readings
        ndvi         = round(random.uniform(0.10, 0.60), 3)
        rainfall_mm  = round(random.uniform(10, 300), 1)
        temp_c       = round(random.uniform(28, 50), 1)
        soil         = round(random.uniform(5, 80), 1)
        wind_kmh     = round(random.uniform(5, 110), 1)
        baseline     = random.choice([0.22, 0.32, 0.35, 0.38, 0.42, 0.46])
        ndvi_delta   = round(ndvi - baseline, 4)
        interaction  = round(rainfall_mm / (temp_c + 1e-6), 4)
        season_code  = random.choice([1, 2, 3])

        # Label: triggered if drought/flood/heat conditions exceed thresholds
        triggered = (
            (ndvi < 0.30 and rainfall_mm < 100) or       # drought
            (rainfall_mm > 180 and soil > 65) or          # flood
            (temp_c > 44 and ndvi < 0.35) or              # heatwave
            (wind_kmh > 70 and rainfall_mm > 90)           # cyclone
        )
        # Add 8% noise to labels (real-world uncertainty)
        if random.random() < 0.08:
            triggered = not triggered

        records.append([
            ndvi, rainfall_mm, temp_c, soil, wind_kmh,
            ndvi_delta, interaction, season_code,
            int(triggered)
        ])

    X = np.array([r[:8] for r in records])
    y = np.array([r[8] for r in records])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\n=== IIE Risk Model Training Complete ===")
    print(classification_report(y_test, y_pred, target_names=["No Trigger", "Triggered"]))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(f"Feature importances: {dict(zip(['ndvi','rainfall','temp','soil','wind','ndvi_delta','interaction','season'], model.feature_importances_.round(3)))}")

    out_path = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
    with open(out_path, "wb") as f:
        pickle.dump(model, f)
    print(f"\nModel saved to: {out_path}")
    print("Import in risk_scorer.py: model will auto-load from this path.")


if __name__ == "__main__":
    main()
