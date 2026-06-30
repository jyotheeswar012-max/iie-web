# YONO-Oracle IIE — Intelligent Insurance Engine

> **SBI Global FinTech Fest 2026 — Proof of Concept**
> Parametric crop insurance with zero claim forms, powered by multi-agent AI + blockchain + India Stack.

[![Live](https://img.shields.io/badge/Live-Vercel-black?logo=vercel)](https://iie-web-theta.vercel.app)
[![Health](https://img.shields.io/badge/API-Health%20OK-brightgreen)](https://iie-web-theta.vercel.app/api/health)
[![Audit](https://img.shields.io/badge/Audit-SHA--256%20Chain-blue)](https://iie-web-theta.vercel.app/api/audit/trail)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20Vercel%20Edge%20%7C%20TypeScript-blueviolet)](https://nextjs.org)

🌐 **Live:** https://iie-web-theta.vercel.app
🔑 **Judge Key:** `iie-judge-2026` (120 RPM, all endpoints)
🔑 **Demo Key:** `iie-demo-2026` (30 RPM)

---

## Quick Demo (one curl — full pipeline)

```bash
# Health check (no key needed)
curl https://iie-web-theta.vercel.app/api/health

# Enroll Ramesh Kumar in Barmer
curl -X POST https://iie-web-theta.vercel.app/api/oracle/enroll \
  -H 'Content-Type: application/json' \
  -H 'X-IIE-Key: iie-judge-2026' \
  -d '{"name":"Ramesh Kumar","aadhaar_last4":"4821","district":"Barmer",
       "state":"Rajasthan","crop":"wheat","acreage":4.5,"plan":"Smart Shield"}'

# Run 4-agent oracle quorum
curl -X POST https://iie-web-theta.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' \
  -H 'X-IIE-Key: iie-judge-2026' \
  -d '{"policy_id":"IIE-DEMO0001","event_type":"drought","district":"Barmer","crop":"wheat","acreage":4.5}'

# Execute smart contract + IMPS payout
curl -X POST https://iie-web-theta.vercel.app/api/contract/execute \
  -H 'Content-Type: application/json' \
  -H 'X-IIE-Key: iie-judge-2026' \
  -d '{"policy_id":"IIE-DEMO0001","farmer_name":"Ramesh Kumar"}'

# SHA-256 audit trail
curl https://iie-web-theta.vercel.app/api/audit/trail
```

---

## Architecture (v5.0.0)

```
┌─────────────────────────────────────────────────────────┐
│          FARMER INTERFACE  (YONO Web / Mobile)          │
│  Dashboard · Demo · Enroll · Risk Map · Payouts · Audit │
└───────────────────────┬─────────────────────────────────┘
                        │  Next.js 14 App Router (Edge)
          ┌─────────────┴──────────────┐
          │      Vercel Edge Runtime   │
          │  /api/health               │
          │  /api/oracle/enroll        │
          │  /api/oracle/verify        │
          │  /api/oracle/feed          │
          │  /api/contract/execute     │
          │  /api/audit/trail          │
          │  /api/ml/predict           │
          └──────┬──────────┬──────────┘
                 │          │
     ┌───────────┘          └──────────────┐
     │  Oracle Engine                       │  Blockchain SM
     │  NASA MODIS · IMD · ISRO · ICAR     │  ACTIVE→TRIGGERED→EXECUTED
     │  4-agent quorum (30/25/25/20)        │  SHA-256 chained audit
     └───────────────────────────────────────┘
                        │
              India Stack Layer
              Aadhaar · DigiLocker · UPI/IMPS · PM-FASAL
```

---

## Live Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | Open | System status + version |
| `/api/oracle/feed` | GET | Open | Live risk feed — 10 districts |
| `/api/oracle/enroll` | POST | Key | Enroll farmer + deploy contract |
| `/api/oracle/verify` | POST | Key | 4-agent quorum on oracle data |
| `/api/contract/execute` | POST | Key | Execute SM + IMPS payout |
| `/api/audit/trail` | GET | Open | SHA-256 chained ledger |
| `/api/ml/predict` | POST | Key | NaiveBayes LLR risk score |

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero + live stats + pipeline |
| Demo | `/demo` | Interactive 5-step engine |
| Risk Map | `/risk` | District risk scores (filterable) |
| Payouts | `/payouts` | Live IMPS payout tracker |
| Blockchain | `/blockchain` | Smart contracts + Solidity |
| Enroll | `/enroll` | Farmer enrollment flow |
| Impact | `/impact` | IIE vs PMFBY metrics |
| India Stack | `/india-stack` | DPI layer breakdown |
| Architecture | `/architecture` | Design decisions + roadmap |

---

## Security & Compliance

- **DPDP Act 2023** — no raw Aadhaar stored; HMAC-SHA256 one-way token only
- **API key auth** — `X-IIE-Key` header; per-key rolling rate limits
- **Audit chain** — SHA-256 prev_hash chaining; any mutation detectable in O(n)
- **State machine** — irreversible transitions; no double-payout possible
- **TLS** — all traffic HTTPS via Vercel Edge

---

## Production Roadmap

| Component | PoC (now) | Production |
|-----------|-----------|------------|
| Data store | In-memory | Redis + PostgreSQL |
| Oracle data | Deterministic sim | NASA MODIS + IMD REST |
| Blockchain | SHA-256 sim | Hyperledger Fabric |
| ML model | Naive Bayes LLR | GBM on 10yr MODIS |
| India Stack | Simulation | UIDAI sandbox → RBI |
| Payout | IMPS sim | SBI Core Banking API |

---

*YONO-Oracle IIE · SBI GFF 2026 · Not for production without RBI/IRDAI approval.*
