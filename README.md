# YONO-Oracle IIE — Intelligent Insurance Engine

> **SBI Global FinTech Fest 2026 — Proof of Concept**
> Parametric crop insurance with zero claim forms, powered by multi-agent AI + blockchain + India Stack.

🌐 **Live:** https://iie-6hpoxmb7q-jyotheeswar.vercel.app

---

## Architecture (v4.0.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FARMER INTERFACE (YONO App / Web)                    │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                    ┌─────────┴─────────┐
                    │   api/index.py          │  ← Thin Vercel entrypoint
                    │   api/core/app.py        │  ← Route dispatcher + auth
                    └─────────┬─────────┘
                              │
     ┌────────────────┬─────────┴─────────┬────────────────┐
     │               │          │          │                │
┌───┴───┐  ┌────┴───┐  ┌───┴───┐  ┌───┴───┐  ┌────┴───┐
│ Oracle  │  │ Agents  │  │Blockchain│  │  ML    │  │IndiaStack│
│ Engine  │  │ (x4)    │  │   SM     │  │Scorer  │  │Simulator │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘
4 Sources    Weighted       ACTIVE→       NB Log-      Aadhaar/
NASA/IMD/    Quorum 75%     TRIGGERED→    Likelihood   DigiLocker
ISRO/ICAR    (30/25/25/20)  EXECUTED       Sigmoid      UPI IMPS
```

---

## Module Map

| Module | Purpose |
|--------|--------|
| `api/core/store.py` | Thread-safe shelve KV (Redis-ready) |
| `api/core/utils.py` | SHA-256, HMAC, tx_hash, Aadhaar token |
| `api/core/logging.py` | Structured JSON trace logs → stderr |
| `api/core/security.py` | API-key auth + rolling rate limiter |
| `api/core/app.py` | Central route dispatcher |
| `api/oracle/engine.py` | 4-source oracle + enroll + verify |
| `api/contract/agents.py` | Multi-agent orchestrator (MAO-v2) |
| `api/blockchain/state_machine.py` | SM: ACTIVE→TRIGGERED→EXECUTED |
| `api/audit/chain.py` | SHA-256 append-only tamper-evident chain |
| `api/ml/predictor.py` | Naive Bayes log-likelihood risk scorer |
| `api/india_stack/simulator.py` | Aadhaar eKYC, DigiLocker, UPI/IMPS |

---

## API Reference

### Authentication
All protected routes require `X-IIE-Key` header (or `?key=` query param).

| Key | Tier | RPM |
|-----|------|-----|
| `iie-demo-2026` | demo | 30 |
| `iie-judge-2026` | judge | 120 |

Open (no key needed): `GET /api/health`, `GET /api/oracle/feed`, `GET /api/ml/batch`

### Endpoints

```
GET  /api/health                     — system status, chain validity, counters
GET  /api/oracle/feed                — live risk feed: 10 districts
POST /api/oracle/enroll              — enroll farmer, deploy smart contract
POST /api/oracle/verify              — run 4-agent quorum on oracle data
POST /api/contract/execute           — execute state transition, IMPS payout
GET  /api/contract/all               — all contracts with state distribution
GET  /api/contract/:policy_id        — single contract detail + state machine
GET  /api/audit/trail                — full SHA-256 chained ledger + integrity report
POST /api/ml/predict                 — Naive Bayes drought risk score
GET  /api/ml/batch                   — batch predictions: 8 Indian districts
POST /api/india-stack/verify         — Aadhaar eKYC + DigiLocker simulation
POST /api/yono/pay                   — IMPS payout simulation
GET  /api/yono/transactions          — all UPI/IMPS transactions
```

### Quick Start (curl)

```bash
# 1. Enroll
curl -X POST https://iie-6hpoxmb7q-jyotheeswar.vercel.app/api/oracle/enroll \
  -H 'Content-Type: application/json' \
  -H 'X-IIE-Key: iie-demo-2026' \
  -d '{"name":"Ramesh Kumar","aadhaar_last4":"4821","district":"Barmer",
       "state":"Rajasthan","crop":"wheat","acreage":4.5,"plan":"Smart Shield"}'

# 2. Verify (triggers 4-agent quorum)
curl -X POST .../api/oracle/verify \
  -H 'X-IIE-Key: iie-demo-2026' \
  -d '{"policy_id":"IIE-XXXXXXXX","event_type":"drought"}'

# 3. Execute (auto IMPS payout)
curl -X POST .../api/contract/execute \
  -H 'X-IIE-Key: iie-demo-2026' \
  -d '{"policy_id":"IIE-XXXXXXXX"}'

# 4. Audit trail
curl https://iie-6hpoxmb7q-jyotheeswar.vercel.app/api/audit/trail?key=iie-demo-2026
```

---

## Security & Compliance

- **DPDP Act 2023**: No raw Aadhaar stored — HMAC-SHA256 one-way token only
- **API key auth**: X-IIE-Key header, per-key rolling rate limits
- **Audit chain**: SHA-256 prev_hash chaining — any mutation is detectable
- **State machine**: Irreversible transitions — no double-payout possible
- **TLS**: All traffic over HTTPS (Vercel edge)

---

## Production Roadmap

| Component | PoC (now) | Production |
|-----------|-----------|------------|
| Data store | shelve / /tmp | Redis / PostgreSQL |
| Oracle data | Deterministic simulation | NASA MODIS + IMD REST + ISRO WMS |
| Blockchain | SHA-256 simulation | Hyperledger Fabric channel |
| ML model | Naive Bayes LLR | sklearn GBM on 10yr MODIS |
| India Stack | Simulation | UIDAI sandbox → RBI approval |
| Auth | API key | OAuth2 + mTLS |
| Payout | IMPS simulation | SBI Core Banking API |

---

*YONO-Oracle IIE — Built for SBI GFF 2026. Not for production use without RBI/IRDAI approval.*
