# Changelog — YONO-Oracle IIE

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org/) | [Keep a Changelog](https://keepachangelog.com/)

---

## [3.0.0] — 2026-06-29

### Added
- `feat(india-stack)`: Aadhaar eKYC sandbox mock with OTP flow, DPDP-compliant hashing (`api/india_stack/aadhaar_mock.py`)
- `feat(india-stack)`: DigiLocker Pull API mock for land records, Aadhaar XML, PAN, Voter ID, PMFBY policy (`api/india_stack/digilocker_mock.py`)
- `feat(agents)`: Multi-agent orchestration pipeline — RiskAgent → ClaimsAgent → FraudAgent (`api/agents/`)
- `feat(agents)`: BaseAgent abstract contract for extensible agent architecture
- `feat(agents)`: FraudAgent with z-score NDVI anomaly detection, acreage outlier check, same-day claim flag
- `feat(agents)`: ClaimsAgent with IRDAI payout band calculation (CRITICAL/HIGH/MEDIUM/LOW)
- `feat(ml)`: GradientBoostingClassifier risk scorer with 8-feature engineering (`api/ml/risk_scorer.py`)
- `feat(ml)`: Reproducible training script on synthetic PMFBY data N=3000 (`api/ml/train_model.py`)
- `feat(ml)`: SHAP-style feature importance in every score response
- `feat(ml)`: Batch scoring endpoint (up to 50 observations) at `POST /ml/batch-score`
- `feat(auth)`: Pure-Python HS256 JWT implementation — no external lib required for Vercel/Railway deploy
- `feat(auth)`: Role-based access control (farmer / insurer / admin / demo)
- `feat(auth)`: `/auth/token` endpoint for JWT issuance; `/auth/me` for introspection
- `feat(security)`: slowapi rate limiter integration
- `feat(security)`: CORS origin whitelist (replaces `allow_origins=["*"]`)
- `feat(security)`: RequestIDMiddleware — injects `X-Request-ID` and `X-Response-Time` on every response
- `feat(logging)`: Structured JSON logging (`core/logging_config.py`) compatible with Railway + Datadog
- `chore(deps)`: Updated `requirements.txt` with slowapi, python-jose, scikit-learn, numpy

### Changed
- `main.py` upgraded to v3.0.0 — mounts all routers, uses structured logging
- Legacy `/ml/predict` and `/ml/batch` endpoints marked `deprecated=True`; superseded by `/ml/score` and `/ml/batch-score`
- CORS now uses environment variable `CORS_ORIGINS` (comma-separated list)

---

## [2.0.0] — 2026-06-27

### Added
- Oracle engine with 4-agent quorum voting (drought, flood, heatwave, cyclone)
- Smart contract state machine (ACTIVE → TRIGGERED → EXECUTED)
- Immutable audit ledger with SHA-256 hash chaining
- YONO UPI/IMPS payout simulation
- In-memory policy + contract store
- Vercel + Railway deployment config

---

## [1.0.0] — 2026-06-26

### Added
- Initial Next.js 14 + FastAPI project scaffold
- SBI GFF 2026 hackathon theme and branding
- Basic farmer enrollment form (frontend)
- `/health` endpoint
