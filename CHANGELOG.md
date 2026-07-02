# Changelog — AgroShield IIE (YONO Kisan)

All notable changes are documented here.
Format: [Semantic Versioning](https://semver.org/) | [Keep a Changelog](https://keepachangelog.com/)

> **Architecture note:** The live Vercel deployment is a pure Next.js 14 app.
> All ML inference runs in Next.js Edge Route Handlers (TypeScript, no Python runtime).
> The single source of truth for what is live vs. prototype is [`JUDGES.md`](JUDGES.md).

---

## [4.1.0] — 2026-07-02

### Fixed
- `fix(payout)`: Payout formula and displayed receipt now always match.
  SI changed from ₹10,711 → **₹15,700/acre** (SBI KCC holder rate, PMFBY 2024-25).
  `kcc_bonus` fudge parameter removed entirely.
  Formula: `4.5 × ₹15,700 × 0.6825 = ₹48,238` — the displayed number IS `Math.round(formula)`.
- `fix(docs)`: Dataset row counts now consistent across all files:
  **500 rows raw → 423 used after cleaning → 338 train / 85 test**.
  Previously README said "423", train_model.py said "500", CHANGELOG said "423".

---

## [4.0.0] — 2026-07-02

### Added
- `feat(ml)`: Real Logistic Regression trained on a 500-row dataset
  (423 used after cleaning, 338 train / 85 test — 80/20 stratified split)
  calibrated to published IMD / ICAR ranges.
  → `scripts/train_model.py` (reproducible, run in 30 seconds)
  → `scripts/training_data.csv` (500 rows, 9 districts, 4 event types)
- `feat(ml)`: Exported model weights in `src/data/model_weights.json`
  (coefficients, StandardScaler params, feature importance, metrics)
- `feat(ml)`: Rewrote `src/app/api/ml/predict/route.ts` as pure TypeScript
  edge inference: StandardScaler → dot-product → sigmoid → exact SHAP
- `feat(ml)`: Real held-out metrics (20% test set, 85 rows):
  AUC = 0.8333, Precision = 0.7879, Recall = 0.9123, F1 = 0.8455
- `feat(risk)`: Basis risk & moral hazard disclosure section on `/risk`
  (definition → 4-oracle mitigation → IRDAI 2023 compliance)
- `fix(docs)`: `JUDGES.md` — every claim labelled ✅ Real or ⚠️ Simulated;
  self-score table removed
- `fix(docs)`: `CHANGELOG.md` — removed references to files that were
  never committed to this repo
- `fix(docs)`: `requirements.txt` — clarified as training-only,
  not used by Vercel deployment
- `fix(docs)`: `UPGRADE_STATUS.md` retired; `JUDGES.md` is single source of truth

### Removed
- Hardcoded piecewise `gb_*_transform()` lookup tables from
  `src/app/api/ml/predict/route.ts` (hand-written if/else, not a trained model)
- Fabricated metrics ("GradientBoosting F1=0.91, AUC=0.931, 6050 samples")
- Self-assigned "57/60 · 95%" score from `JUDGES.md`

---

## [3.0.0] — 2026-06-29

### Added
- Oracle quorum voting panel (`src/app/agents/`)
- 4-agent architecture UI: RiskAgent, ClaimsAgent, FraudAgent, WeatherAgent
- Smart contract state machine UI (`src/app/blockchain/`)
  state transitions: ACTIVE → TRIGGERED → EXECUTED
- India Stack compliance checklist (`src/app/india-stack/`) — 28 checks
- Aadhaar eKYC + DigiLocker mock flow UI (`src/app/enroll/`)
- Agentic AI scenario page (`src/app/agentic/`) —
  72h proactive timeline, passive vs. agentic comparison table
- Immutable SHA-256 audit trail (in-memory, demo session)

---

## [2.0.0] — 2026-06-27

### Added
- Next.js 14 App Router scaffold with full route set
- YONO IMPS payout simulation (`src/app/payouts/`)
- District risk map with state/level filters (`src/app/risk/`)
- SBI API mock request/response panels (`src/app/sbi-apis/`)
- Vercel deployment config (`vercel.json`)

---

## [1.0.0] — 2026-06-26

### Added
- Initial Next.js 14 + TypeScript project scaffold
- SBI GFF 2026 theme and branding
- Basic farmer enrollment form
- `/api/health` endpoint
