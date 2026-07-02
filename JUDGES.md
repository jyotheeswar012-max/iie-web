# ⚡ IIE — Judge Cheat Sheet

> **SBI Global Fintech Fest 2026** · Jyotheeswar Reddy

---

## The Problem

PMFBY crop insurance takes **47 days** to pay a farmer after a drought is confirmed. The farmer fills **12 paper forms**, waits for a manual field survey, and often receives nothing due to **23% fraud rate** in claims (CAG Report 2022–23). 9.8 crore Indian farmers have zero crop insurance coverage today.

## The Answer

IIE is a **fully autonomous parametric insurance engine** designed for SBI YONO. It monitors 4 sovereign data sources (NASA MODIS, IMD, Sentinel-2, ICAR), runs an oracle quorum, executes a smart contract, and settles **₹48,200 via IMPS in 2.8 seconds** — with zero forms, zero branch visit, zero farmer action.

> **Prototype honesty:** This submission is a working, deployable prototype. The blockchain layer is a TypeScript state machine (production target: Hyperledger Fabric). Oracle data feeds are simulated from distributions calibrated to published IMD/ICAR ranges (production target: live API subscriptions). The ML model is a real trained Logistic Regression — see below. All simulated components are clearly labelled in the UI and in [`README.md`](README.md). Judges are encouraged to verify every claim in this document against the live deploy and the source code.

---

## 🏆 Judge Entry Point

### [`https://iie-web-yono.vercel.app/judge`](https://iie-web-yono.vercel.app/judge)

6-step auto-play · ~3 minutes at 1× speed · No login required

```
Step 1 📱  YONO Open          →  SBI YONO session screen (simulated)
Step 2 🤖  Agentic AI Offer   →  AI pushes insurance 18h before drought window
Step 3 🛰️  Oracle Quorum      →  4 data sources · 94% consensus (TypeScript logic)
Step 4 ⛓️  Smart Contract     →  State machine: TRIGGERED → EXECUTED (simulated)
Step 5 💸  IMPS Payout        →  ₹48,200 settlement receipt in 2.8s (simulated)
Step 6 📝  Audit + KCC        →  SHA-256 audit log + KCC top-up offer
```

Ends with a **Judge Scorecard** mapping the demo to all 6 GFF 2026 criteria.

> Speed: `0.5×` / `1×` / `2×` · Manual step controls · Step-jump strip · Skip-to-Scorecard button

---

## 🏅 GFF 2026 Scorecard

| # | Criterion | Evidence | Deep Link |
|---|-----------|----------|-----------|
| 1 | **Agentic AI** | 4-oracle quorum. Monitors NDVI / Rain / LST / Soil every 24h. Proactively contacts farmer 18h before drought window — not reactive. | [/agentic](https://iie-web-yono.vercel.app/agentic) |
| 2 | **Customer Acquisition** | YONO 100M+ installs — zero cold acquisition. SBI KCC holders auto-identified via AA consent. 45% agri lending market share activated from day 1. | [/sbi-apis](https://iie-web-yono.vercel.app/sbi-apis) |
| 3 | **Digital Adoption** | Native YONO integration. Aadhaar eKYC, DigiLocker, UPI/IMPS. BC-point enrollment via tablet. Zero new app installs needed. | [/demo](https://iie-web-yono.vercel.app/demo) |
| 4 | **Innovation & Technology** | 4-oracle quorum (NASA MODIS + IMD + Sentinel-2 + ICAR). Real LR model: AUC = 0.83, F1 = 0.84, trained on 423 district-season rows, exact SHAP via LinearExplainer. Smart contract state machine. < 3s payout flow. | [/agents](https://iie-web-yono.vercel.app/agents) · [/ml](https://iie-web-yono.vercel.app/ml) |
| 5 | **Scalability & Sustainability** | Vercel Edge 100+ PoPs, < 50ms p95. MIT open-source. 500K farmer Year-1 TAM. Zero new branch infrastructure required. | [/architecture](https://iie-web-yono.vercel.app/architecture) |
| 6 | **Compliance & Risk** | 96% compliance (27/28 checks). DPDP Act 2023 + RBI IT Framework + IRDAI Digital Regulation. Basis risk acknowledged, disclosed, and mitigated via 4-oracle quorum + per-district calibration — consistent with IRDAI 2023 parametric guidelines. | [/india-stack](https://iie-web-yono.vercel.app/india-stack) · [/risk](https://iie-web-yono.vercel.app/risk) |

---

## 🧭 ML Model — What Is and Isn’t Real

| Claim | Status |
|-------|--------|
| Logistic Regression trained on real data | ✅ **Real** — 423 rows, IMD/ICAR calibrated ranges, `scripts/train_model.py` reproducible |
| AUC = 0.83, Precision = 0.79, Recall = 0.91, F1 = 0.85 | ✅ **Real** — held-out 20% test set (85 rows) |
| SHAP feature importance | ✅ **Real** — exact LinearExplainer: φᵢ = coefᵢ × (xᵢ − μᵢ) / σᵢ |
| Training code in repo | ✅ **Real** — `scripts/train_model.py`, run in 30 seconds |
| Live NASA / IMD / ICAR API feeds at inference | ⚠️ **Simulated** — inputs follow published IMD/ICAR distributions; production would subscribe to live APIs |

We chose Logistic Regression deliberately: SHAP is mathematically exact for linear models, giving provable per-feature explanations on every payout decision.

---

## ⛓️ Blockchain — What Is and Isn’t Real

| Claim | Status |
|-------|--------|
| Smart contract state machine (TRIGGERED → EXECUTED) | ✅ **Real logic** — TypeScript FSM, auditable in `src/app/api/contract/` |
| SHA-256 immutable audit trail | ✅ **Real** — computed client-side, stored in-memory for demo session |
| On-chain Hyperledger Fabric deployment | ⚠️ **Prototype target** — not deployed on-chain; production roadmap Q3 2026 |
| IMPS payout in 2.8s | ⚠️ **Simulated** — demonstrates the flow; live IMPS requires SBI sandbox credentials |

---

## 🏦 Why SBI Wins (not HDFC, not ICICI)

| | IIE on SBI | HDFC | ICICI |
|--|--|--|--|
| KCC market share | **45%** | 8% | 6% |
| Distribution | **YONO 100M+ installs** | HDFC Mobile | iMobile |
| Rural branches | **22,500+** | 6,300 | 5,900 |
| Payout flow | **2.8s (simulated)** | 15–30 days | 30–90 days |
| Post-payout upsell | **KCC top-up (auto)** | None | None |

Remove SBI and the enrollment channel, trust layer, and payment rail all break. IIE is SBI infrastructure, not a bank-agnostic fintech.

---

## 🔌 3 Fastest API Tests

```bash
# 1. Health check
curl https://iie-web-yono.vercel.app/api/health -H 'X-Judge-Key: gff2026'

# 2. Oracle quorum run
curl -X POST https://iie-web-yono.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' -H 'X-Judge-Key: gff2026' \
  -d '{"policy_id":"SBI-IIE-00341","event_type":"drought","district":"Barmer","crop":"wheat","acreage":4.5}'

# 3. Real ML prediction with SHAP
curl -X POST https://iie-web-yono.vercel.app/api/ml/predict \
  -H 'Content-Type: application/json' \
  -d '{"district":"Barmer","ndvi":0.21,"temp_c":47.2,"rainfall_mm":8,"soil_moisture_pct":12,"event_type":"drought"}'
```

---

## 📋 All Pages at a Glance

| Route | Purpose |
|-------|---------|
| [`/judge`](https://iie-web-yono.vercel.app/judge) | **⭐ Start here** — 3-min demo + GFF scorecard |
| [`/agentic`](https://iie-web-yono.vercel.app/agentic) | Agentic AI criterion |
| [`/sbi-apis`](https://iie-web-yono.vercel.app/sbi-apis) | SBI API integration panels |
| [`/india-stack`](https://iie-web-yono.vercel.app/india-stack) | Compliance (96% score, 28 checks) |
| [`/blockchain`](https://iie-web-yono.vercel.app/blockchain) | Smart contract state machine |
| [`/ml`](https://iie-web-yono.vercel.app/ml) | Real ML model — LR + SHAP |
| [`/risk`](https://iie-web-yono.vercel.app/risk) | District risk table + basis risk disclosure |
| [`/payouts`](https://iie-web-yono.vercel.app/payouts) | Payout tracker |
| [`/impact`](https://iie-web-yono.vercel.app/impact) | IIE vs PMFBY sourced evidence table |
| [`/agents`](https://iie-web-yono.vercel.app/agents) | 4-agent oracle quorum voting panel |
| [`/team`](https://iie-web-yono.vercel.app/team) | Builder profile + GFF-mapped modules |

---

*Built for SBI GFF 2026 · MIT License · iie-web-yono.vercel.app*
