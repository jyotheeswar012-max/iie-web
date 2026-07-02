# ⚡ IIE — Judge Reference

> **SBI Global Fintech Fest 2026** · Jyotheeswar Reddy

---

## The Problem

PMFBY crop insurance takes **47 days** to pay a farmer after a drought is confirmed.
The farmer fills **12 paper forms**, waits for a manual field survey, and often receives
nothing due to **23% fraud rate** in claims (CAG Report 2022–23).
9.8 crore Indian farmers have zero crop insurance coverage today.

## The Answer

IIE is a **parametric insurance engine** designed for SBI YONO. It monitors 4 sovereign
data sources (NASA MODIS, IMD, Sentinel-2, ICAR), runs an oracle quorum, executes a
smart contract, and settles **₹48,238 via IMPS in 2.8 seconds** —
with zero forms, zero branch visit, zero farmer action.

> **Prototype scope:** The blockchain layer is a TypeScript state machine
> (production target: Hyperledger Fabric). Oracle feeds are simulated from
> distributions calibrated to published IMD/ICAR ranges
> (production target: live API subscriptions). The ML model is a real trained
> Logistic Regression — see the table below. All simulated components are
> labelled in the UI. Verify any claim in this document against the live
> deploy or the source code.

---

## 🏆 Judge Entry Point

**[https://iie-web-yono.vercel.app/judge](https://iie-web-yono.vercel.app/judge)**

6-step auto-play · ~3 minutes at 1× · No login required

```
Step 1 📱  YONO Open          →  SBI YONO session screen (simulated)
Step 2 🤖  Agentic AI Offer   →  AI pushes insurance 18h before drought window
Step 3 🛰️  Oracle Quorum      →  4 data sources · 94% consensus (TypeScript logic)
Step 4 ⛓️  Smart Contract     →  State machine: TRIGGERED → EXECUTED (simulated)
Step 5 💸  IMPS Payout        →  ₹48,238 settlement receipt in 2.8s (simulated)
Step 6 📝  Audit + KCC        →  SHA-256 audit log + KCC top-up offer
```

> Controls: `0.5×` / `1×` / `2×` speed · Manual step · Step-jump strip · Skip-to-end

---

## 🧭 ML Model — What Is and Isn’t Real

| Claim | Status | Verify |
|-------|--------|--------|
| Logistic Regression trained on real data | ✅ Real | `scripts/train_model.py` |
| 500-row dataset, 423 used after cleaning, 338 train / 85 test | ✅ Real | `scripts/training_data.csv` |
| AUC = 0.8333, Precision = 0.79, Recall = 0.91, F1 = 0.85 | ✅ Real | `src/data/model_weights.json` → `metrics` |
| Exact SHAP (LinearExplainer) on every prediction | ✅ Real | `src/app/api/ml/predict/route.ts` |
| Inference runs in the live Vercel deploy | ✅ Real | `curl` test below |
| Live NASA / IMD / ICAR API feeds at inference | ⚠️ Simulated | Production target: live API subscriptions |

---

## ⛓️ Blockchain — What Is and Isn’t Real

| Claim | Status | Verify |
|-------|--------|--------|
| Smart contract state machine (TRIGGERED → EXECUTED) | ✅ Real logic | `src/app/api/contract/` |
| SHA-256 immutable audit trail | ✅ Real | `src/app/api/audit/` |
| On-chain Hyperledger Fabric deployment | ⚠️ Prototype target | Production roadmap Q3 2026 |
| IMPS payout in 2.8s | ⚠️ Simulated | Live IMPS requires SBI sandbox credentials |

---

## 🔌 GFF 2026 Criteria — Evidence Index

| Criterion | What to look at |
|-----------|----------------|
| **Agentic AI** | 4-oracle quorum monitors NDVI/Rain/LST/Soil every 24h. Proactive farmer contact 18h before event. [/agentic](https://iie-web-yono.vercel.app/agentic) |
| **Customer Acquisition** | YONO 100M+ installs — zero cold acquisition. KCC holders auto-identified via AA consent. 45% agri lending share. [/sbi-apis](https://iie-web-yono.vercel.app/sbi-apis) |
| **Digital Adoption** | Native YONO integration. Aadhaar eKYC, DigiLocker, UPI/IMPS. BC-point enrollment. Zero new app installs. [/demo](https://iie-web-yono.vercel.app/demo) |
| **Innovation & Technology** | Real LR model (AUC = 0.83) with exact SHAP. 4-oracle quorum. < 3s payout flow. Training code reproducible. [/ml](https://iie-web-yono.vercel.app/ml) · [/agents](https://iie-web-yono.vercel.app/agents) |
| **Scalability & Sustainability** | Vercel Edge 100+ PoPs. MIT open-source. 500K farmer Year-1 TAM. Zero new branch infrastructure. [/architecture](https://iie-web-yono.vercel.app/architecture) |
| **Compliance & Risk** | 27/28 India Stack checks. DPDP 2023 + RBI IT + IRDAI Digital. Basis risk disclosed on [/risk](https://iie-web-yono.vercel.app/risk). IRDAI 2023 parametric guidelines referenced. [/india-stack](https://iie-web-yono.vercel.app/india-stack) |

---

## 🏦 Why SBI (not HDFC, not ICICI)

| | IIE on SBI | HDFC | ICICI |
|--|--|--|--|
| KCC market share | **45%** | 8% | 6% |
| Distribution | **YONO 100M+ installs** | HDFC Mobile | iMobile |
| Rural branches | **22,500+** | 6,300 | 5,900 |
| Payout flow | **2.8s (simulated)** | 15–30 days | 30–90 days |
| Post-payout upsell | **KCC top-up (auto)** | None | None |

Remove SBI and the enrollment channel, trust layer, and payment rail all break.
IIE is SBI infrastructure, not a bank-agnostic fintech.

---

## 🔌 3 Fastest API Tests

```bash
# 1. Health (X-Judge-Key required)
curl https://iie-web-yono.vercel.app/api/health \
  -H 'X-Judge-Key: gff2026'

# 2. Oracle quorum + payout math
curl -X POST https://iie-web-yono.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' -H 'X-Judge-Key: gff2026' \
  -d '{"policy_id":"SBI-IIE-00341","event_type":"drought","district":"Barmer","crop":"wheat","acreage":4.5}'

# 3. Real ML prediction + SHAP (live edge inference, no Python)
curl -X POST https://iie-web-yono.vercel.app/api/ml/predict \
  -H 'Content-Type: application/json' \
  -d '{"district":"Barmer","ndvi":0.21,"temp_c":47.2,"rainfall_mm":8,"soil_moisture_pct":12,"event_type":"drought"}'
```

---

## 📋 All Pages

| Route | Purpose |
|-------|---------|
| [`/judge`](https://iie-web-yono.vercel.app/judge) | **⭐ Start here** — 3-min demo |
| [`/ml`](https://iie-web-yono.vercel.app/ml) | Real ML model — LR + SHAP |
| [`/risk`](https://iie-web-yono.vercel.app/risk) | District risk + basis risk disclosure |
| [`/agents`](https://iie-web-yono.vercel.app/agents) | 4-oracle quorum panel |
| [`/agentic`](https://iie-web-yono.vercel.app/agentic) | Agentic AI criterion |
| [`/blockchain`](https://iie-web-yono.vercel.app/blockchain) | Smart contract state machine |
| [`/india-stack`](https://iie-web-yono.vercel.app/india-stack) | Compliance (27/28 checks) |
| [`/impact`](https://iie-web-yono.vercel.app/impact) | IIE vs PMFBY evidence table |
| [`/sbi-apis`](https://iie-web-yono.vercel.app/sbi-apis) | SBI API integration panels |
| [`/architecture`](https://iie-web-yono.vercel.app/architecture) | System design + roadmap |
| [`/team`](https://iie-web-yono.vercel.app/team) | Builder profile |

---

*Built for SBI GFF 2026 · MIT License · iie-web-yono.vercel.app*
