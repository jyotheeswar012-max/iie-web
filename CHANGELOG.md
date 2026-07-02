# Changelog — AgroShield IIE (YONO Kisan)

All notable changes are documented here.
Format: [Semantic Versioning](https://semver.org/) | [Keep a Changelog](https://keepachangelog.com/)

> **Architecture note:** The live Vercel deployment is a pure Next.js 14 app.
> All ML inference runs in Next.js Edge Route Handlers (TypeScript, no Python runtime required).
> A FastAPI backend (`web/`) exists as a reference implementation but is **not wired into the
> judge-facing Vercel deploy**. The single source of truth for what is live is [`JUDGES.md`](JUDGES.md).

---

## [4.0.0] — 2026-07-02

### Added
- `feat(ml)`: Real Logistic Regression model trained on 423 district-season rows calibrated to
  published IMD / ICAR ranges (`scripts/train_model.py`) — reproducible in 30 seconds
- `feat(ml)`: Exported coefficients + StandardScaler params in `src/data/model_weights.json`
- `feat(ml)`: Rewrote `/api/ml/predict` as pure TypeScript edge inference:
  StandardScaler → dot-product → sigmoid → exact SHAP (LinearExplainer)
- `feat(ml)`: Real metrics on held-out 20% test set:
  AUC = 0.8333, Precision = 0.7879, Recall = 0.9123, F1 = 0.8455, Accuracy = 0.7765
- `feat(ml)`: 500-row training dataset committed at `scripts/training_data.csv`
- `feat(risk)`: Basis risk & moral hazard disclosure section on `/risk` page
  (3-paragraph callout: definition → 4-oracle mitigation → IRDAI 2023 compliance)
- `fix(docs)`: `JUDGES.md` rewritten — every claim labelled ✅ Real or ⚠️ Simulated
- `fix(docs)`: `UPGRADE_STATUS.md` retired; `JUDGES.md` is now single source of truth

### Removed
- Hardcoded piecewise `gb_*_transform()` lookup tables from `/api/ml/predict`
  (were hand-written if/else blocks, not a trained model)
- Fabricated metrics ("GradientBoosting F1=0.91, AUC=0.931, 6050 training samples")

---

## [3.0.0] — 2026-06-29

### Added (FastAPI reference backend — not deployed to judge URL)
- Multi-agent orchestration pipeline in `web/api/agents/`
- Oracle engine with 4-agent quorum voting
- Smart contract state machine (ACTIVE → TRIGGERED → EXECUTED)
- India Stack mocks: Aadhaar eKYC, DigiLocker Pull API
- JWT / RBAC auth layer, rate limiter, structured logging

> These features exist in `web/` but are **not reachable from iie-web-yono.vercel.app**.
> The Vercel deploy is Next.js only (`vercel.json`: `"framework": "nextjs"`).
> Production roadmap: deploy FastAPI backend to Railway and proxy via Next.js rewrites.

---

## [2.0.0] — 2026-06-27

### Added
- Next.js 14 App Router scaffold with full route set
- Oracle quorum voting panel (`/agents`)
- Smart contract state machine UI (`/blockchain`)
- Immutable SHA-256 audit trail (in-memory, demo session)
- YONO IMPS payout simulation
- Vercel deployment config

---

## [1.0.0] — 2026-06-26

### Added
- Initial Next.js 14 + TypeScript project scaffold
- SBI GFF 2026 theme and branding
- Basic farmer enrollment form
- `/api/health` endpoint
