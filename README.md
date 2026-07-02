# 🌾 AgroShield IIE — Invisible Insurance Engine for YONO Kisan

[![Live](https://img.shields.io/badge/Vercel-Live-brightgreen?logo=vercel)](https://iie-web-yono.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4.4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![Pitch Deck](https://img.shields.io/badge/Pitch%20Deck-PDF-F68B1F?logo=adobeacrobatreader)](https://github.com/jyotheeswar012-max/iie-web/blob/main/pitch-deck.pdf)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> **SBI Global Fintech Fest 2026** · A Next.js 14 parametric crop insurance prototype built for SBI's YONO Kisan platform — demonstrating zero-paperwork enrollment, 4-oracle quorum logic, and sub-3-second IMPS payout flows.

---

## ⚡ START HERE — Judge Demo

**[https://iie-web-yono.vercel.app/judge](https://iie-web-yono.vercel.app/judge)**

6-step auto-play · ~3 minutes · No login required

---

## 🔍 What's Real vs Simulated — Single Source of Truth

Every row below is the same answer you will find in JUDGES.md and in the live UI.

| Component | Status | Evidence |
|-----------|--------|----------|
| **ML inference (Logistic Regression)** | 🟢 **Live** — runs on every `/api/ml/predict` call | `src/app/api/ml/predict/route.ts` · `src/data/model_weights.json` |
| **ML model training** | 🟢 **Real** — 500-row dataset, 423 used after cleaning, 338 train / 85 test; AUC=0.83, F1=0.85 | `scripts/train_model.py` · `scripts/training_data.csv` |
| **SHAP explanations** | 🟢 **Exact** — LinearExplainer (φᵢ = coefᵢ × (xᵢ−μᵢ)/σᵢ), not approximate | `src/app/api/ml/predict/route.ts` |
| **Oracle 1 — NASA POWER rainfall** | 🟢 **Live** — real MERRA-2 data, no API key, called at runtime | `src/app/api/oracle/weather/route.ts` |
| **Oracle 2 — IMD weather stations** | 🟡 **Simulated** — calibrated to IMD published normals | Production target: IMD API subscription |
| **Oracle 3 — Sentinel-2 NDVI** | 🟡 **Simulated** — calibrated to MODIS district baselines | Production target: ESA Copernicus API |
| **Oracle 4 — ICAR soil moisture** | 🟡 **Simulated** — calibrated to ICAR NICRA ranges | Production target: ICAR NICRA API |
| **Smart contract state machine** | 🟢 **Live logic** — TypeScript FSM, TRIGGERED→EXECUTED | `src/app/api/contract/` |
| **Hyperledger Fabric on-chain** | 🔴 **Not deployed** — immutable SHA-256 audit chain, Fabric-ready design | Production roadmap Q3 2026 |
| **SHA-256 audit trail** | 🟢 **Real** — computed via `crypto.subtle` on every verify call | `src/app/api/oracle/verify/route.ts` |
| **Payout math** | 🟢 **Transparent** — deficit% → loss_factor → acreage × SI × factor = payout | `src/app/api/oracle/verify/route.ts` · see formula below |
| **IMPS settlement (2.8s)** | 🟡 **Simulated** — demonstrates the flow; live IMPS needs SBI sandbox | Production target: SBI YONO IMPS API |
| **Aadhaar eKYC / DigiLocker** | 🟡 **Simulated** — mock flows, no live credentials | Production target: UIDAI sandbox |
| **SBI YONO session** | 🟡 **Simulated** — mock OAuth flow | Production target: SBI YONO OAuth |

---

## 💸 Payout Formula

```
rainfall_deficit_pct = (normal_mm − actual_mm) / normal_mm × 100
loss_factor          = max(0, min(1.0, (deficit_pct − 40) / 60))
                                          ↑ IRDAI drought trigger at 40%
payout_inr           = Math.round(acreage × sum_insured_per_acre × loss_factor)
```

**Example — Barmer drought, Ramesh Kumar (4.5 acres, ₹15,700/acre SI — SBI KCC holder rate, PMFBY 2024-25):**
```
deficit_pct = (42 − 1) / 42 × 100 = 97.62%
loss_factor = (97.62 − 40) / 60   = 0.9603
payout      = Math.round(4.5 × 15,700 × 0.9603)
            = Math.round(67,845.2)
            = ₹67,846
```

> The live API uses NASA POWER MERRA-2 float rainfall (e.g. 1.28 mm), so the returned figure will differ slightly from this integer-input example. The formula and rounding are identical.

The displayed payout is always `Math.round(formula)`. No separate bonus, no hardcoded override.
Full step-by-step breakdown in every `/api/oracle/verify` response (`payout_math.explanation`).

---

## 🚀 Live App Routes

| Route | Description |
|-------|-------------|
| `/judge` | ⭐ **START HERE** — 3-min demo + GFF scorecard |
| `/ml` | Real LR model · SHAP chart · live inference |
| `/risk` | District risk table + basis risk disclosure |
| `/agents` | 4-oracle quorum voting panel |
| `/agentic` | Agentic AI — 72h proactive timeline |
| `/blockchain` | Smart contract state machine |
| `/india-stack` | India Stack compliance (27/28 checks) |
| `/impact` | IIE vs PMFBY evidence table |
| `/architecture` | System design + production roadmap |
| `/pitch` | Pitch toolkit: script, slides, Q&A |

---

## 🔌 Key API Endpoints

```bash
# 1. Health
curl https://iie-web-yono.vercel.app/api/health \
  -H 'X-Judge-Key: gff2026'

# 2. Oracle quorum + payout math
curl -X POST https://iie-web-yono.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' \
  -d '{"district":"Barmer","event_type":"drought","acreage":4.5}'

# 3. Real ML inference + SHAP
curl -X POST https://iie-web-yono.vercel.app/api/ml/predict \
  -H 'Content-Type: application/json' \
  -d '{"district":"Barmer","ndvi":0.21,"temp_c":47.2,"rainfall_mm":8,"soil_moisture_pct":12,"event_type":"drought"}'
```

---

## 📦 Actual Stack

| Layer | What's actually used |
|-------|----------------------|
| Framework | **Next.js 14.2.3** (App Router) |
| Language | **TypeScript 5.4.5** |
| Styling | **Tailwind CSS 3.4.4** |
| Runtime | **Node.js ≥ 18**, deployed on Vercel Edge |
| ML inference | **TypeScript** — dot-product on `model_weights.json` (no Python at runtime) |
| ML training | **scikit-learn + numpy** — `scripts/train_model.py` (offline, not on Vercel) |
| Blockchain | **SHA-256 TypeScript FSM** — Fabric-ready design, not yet on-chain |
| Database | **None** — all state in-memory / simulated |
| Live external API | **NASA POWER** — rainfall only, no key required |

---

## 🏦 Why SBI?

- **45% KCC market share** — 145M farmers addressable without cold acquisition
- **YONO Kisan (100M+ downloads)** — distribution already solved; IIE adds a feature tab
- **22,500+ rural branches + 65,000 BCs** — enrollment via existing BC tablets
- Remove SBI and the enrollment channel, trust layer, and payment rail all break.

---

## 🛠️ Local Development

```bash
git clone https://github.com/jyotheeswar012-max/iie-web
cd iie-web
npm install
npm run dev
# → http://localhost:3000

# To retrain the ML model:
pip install scikit-learn numpy pandas
python scripts/train_model.py
```

No environment variables needed for local development — all external calls except NASA POWER are simulated.

---

## 📄 License

MIT — Built for SBI GFF 2026
