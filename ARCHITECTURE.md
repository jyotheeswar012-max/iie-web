# IIE System Architecture — YONO-Oracle IIE
## SBI GFF 2026 — Invisible Insurance Engine

---

## Overview

YONO-Oracle IIE is a **parametric crop insurance platform** that issues, monitors, and settles insurance
claims autonomously — without farmers filing any paperwork.

```
Farmer enrolls via YONO SBI app
        │
        ▼
 [India Stack Layer]
  Aadhaar eKYC (identity)  +  DigiLocker (land records)
        │
        ▼
 [Oracle Layer]
  NASA MODIS NDVI  |  IMD Rainfall  |  ISRO Bhuvan Temp  |  ICAR Soil Moisture
        │
        ▼
 [Multi-Agent Orchestration]
  RiskAgent → ClaimsAgent → FraudAgent
        │
        ▼
 [ML Scorer]
  GradientBoostingClassifier (8 features)
  P(trigger) ≥ 0.50 ⇒ payout approved
        │
        ▼
 [Smart Contract State Machine]
  ACTIVE → TRIGGERED → EXECUTED
  Immutable audit hash chain
        │
        ▼
 [YONO UPI / IMPS Credit]
  Payout credited directly to farmer’s SBI account
  SMS notification sent
```

---

## Module Map

| Module | Path | Responsibility |
|---|---|---|
| Auth | `api/core/auth.py` | JWT HS256 issuance + verification |
| Security | `api/core/security.py` | CORS, rate limiting, request IDs |
| Logging | `api/core/logging_config.py` | Structured JSON logs |
| India Stack | `api/india_stack/` | Aadhaar eKYC + DigiLocker mocks |
| Oracle | `api/oracle/` | Parametric data feed engine |
| Agents | `api/agents/` | Multi-agent orchestration pipeline |
| ML | `api/ml/` | GBM risk scorer + training script |
| Blockchain | `api/blockchain/` | Smart contract state machine |
| Audit | `api/audit/` | Immutable ledger |
| Main | `api/main.py` | FastAPI app — mounts all routers |

---

## Key Design Decisions

### 1. Parametric — No Claims Forms
Payouts are triggered by objective sensor thresholds (NDVI < 0.30, rain < 50mm, etc.),
not subjective damage assessments. This eliminates the 6–18 month PMFBY claims backlog.

### 2. Agent Quorum ≥ 75%
Four independent agents each vote YES/NO. Payout requires ≥ 3/4 votes (75% quorum).
This prevents single-point manipulation of the oracle.

### 3. DPDP Act 2023 Compliance
No raw Aadhaar number is stored anywhere. Only HMAC-SHA256 hash of last-4 digits is persisted.
Consent flag is mandatory on all India Stack API calls.

### 4. Fraud Guard
FraudAgent runs after ClaimsAgent. Flags: same-day enrollment, acreage outlier,
NDVI z-score anomaly vs district baseline. Blocked policies require manual review.

### 5. Audit Chain
Every state transition appends a SHA-256 chained entry to AUDIT_LOG.
Chain integrity is verified on every `/audit/trail` call.

---

## Production Deployment Checklist

- [ ] Replace `JWT_SECRET` with 256-bit random secret in Railway env vars
- [ ] Replace `IIE_API_KEY` with rotatable API key
- [ ] Set `CORS_ORIGINS` to production Vercel domains only
- [ ] Replace in-memory `POLICIES` / `CONTRACTS` with PostgreSQL (Railway)
- [ ] Integrate UIDAI AUA/KUA for real Aadhaar verification
- [ ] Integrate DigiLocker Pull API via NIC OAuth 2.0
- [ ] Train ML model on real PMFBY + ISRO Bhuvan historical data
- [ ] File with IRDAI as Regulatory Sandbox participant
- [ ] Integrate SBI Core Banking API for real IMPS credits
