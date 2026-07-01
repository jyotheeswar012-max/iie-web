# 🌾 YONO-Oracle IIE — Intelligent Insurance Engine

[![Deploy Status](https://img.shields.io/badge/Vercel-Live-brightgreen?logo=vercel&logoColor=white)](https://yono-iie-web.vercel.app)
[![Health](https://img.shields.io/badge/API%20Health-ok-3fb950?logo=statuspal)](https://yono-iie-web.vercel.app/api/health)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Edge Runtime](https://img.shields.io/badge/Runtime-Vercel%20Edge-purple?logo=vercel)](https://vercel.com/docs/functions/edge-functions)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> **SBI Global Fintech Fest 2026** · Parametric crop insurance with AI oracle quorum, blockchain smart contracts, and IMPS instant payouts via India Stack.

---

## 🚀 Live Demo

| Endpoint | URL |
|----------|-----|
| 🌐 **Frontend** | https://yono-iie-web.vercel.app |
| ⚡ **Demo Flow** | https://yono-iie-web.vercel.app/demo |
| 🗺️ **Dashboard** | https://yono-iie-web.vercel.app/dashboard |
| 🔗 **Blockchain Audit** | https://yono-iie-web.vercel.app/blockchain |
| 🏗️ **Architecture** | https://yono-iie-web.vercel.app/architecture |
| 🛰️ **Oracle Feed** | https://yono-iie-web.vercel.app/risk |
| 💸 **Payout Tracker** | https://yono-iie-web.vercel.app/payouts |
| 🤖 **Agent Quorum** | https://yono-iie-web.vercel.app/agents |
| 📊 **Impact Metrics** | https://yono-iie-web.vercel.app/impact |
| 🇮🇳 **India Stack** | https://yono-iie-web.vercel.app/india-stack |

---

## 🔌 Public API Endpoints

All endpoints are publicly accessible. Use header `X-Judge-Key: gff2026` for priority access.

```bash
# Health check
curl https://yono-iie-web.vercel.app/api/health

# Enroll a farmer
curl -X POST https://yono-iie-web.vercel.app/api/oracle/enroll \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ramesh Kumar","aadhaar_last4":"4821","district":"Barmer","state":"Rajasthan","crop":"wheat","acreage":4.5,"plan":"Smart Shield"}'

# Verify + run oracle quorum
curl -X POST https://yono-iie-web.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' \
  -d '{"policy_id":"SBI-IIE-00341","event_type":"drought","district":"Barmer","crop":"wheat","acreage":4.5}'

# Execute smart contract
curl -X POST https://yono-iie-web.vercel.app/api/contract/execute \
  -H 'Content-Type: application/json' \
  -d '{"policy_id":"SBI-IIE-00341","farmer_name":"Ramesh Kumar","payout_amount":45000}'

# Audit trail
curl https://yono-iie-web.vercel.app/api/audit/trail

# ML risk prediction
curl -X POST https://yono-iie-web.vercel.app/api/ml/predict \
  -H 'Content-Type: application/json' \
  -d '{"district":"Barmer","ndvi":0.21,"temp_c":47.2,"rainfall_mm":8,"soil_moisture_pct":12}'
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  YONO Mobile App / Web Browser                          │
│  Next.js 14 · React 18 · Tailwind CSS                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│  Vercel Edge Functions (< 50ms, 100+ PoPs)              │
│  /api/oracle/enroll  /api/oracle/verify                 │
│  /api/contract/execute  /api/audit/trail                │
│  /api/ml/predict  /api/health                           │
└───────────┬────────────────┬───────────────┬────────────┘
            │                │               │
┌───────────▼──┐  ┌──────────▼───┐  ┌───────▼──────────┐
│ Oracle Layer │  │ AI Quorum    │  │ Blockchain FSM   │
│ NASA MODIS   │  │ 4 Agents     │  │ Polygon + HLF    │
│ IMD Rainfall │  │ 30/25/25/20% │  │ SHA-256 Audit    │
│ ISRO Bhuvan  │  │ ≥75% quorum  │  │ IIEPolicy.sol    │
│ ICAR Sensors │  └──────────────┘  └──────────────────┘
└──────────────┘
            │
┌───────────▼──────────────────────────────────────────┐
│  India Stack Settlement                              │
│  Aadhaar eKYC · DigiLocker RoR · UPI/IMPS · PM-FASAL│
│  NPCI UTR · < 3 second settlement                   │
└──────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Vercel Edge Functions (TypeScript) |
| Oracle | NASA MODIS NDVI, IMD Rainfall, ISRO Bhuvan, ICAR Sensors |
| AI/ML | GradientBoosting v3.0 + NaiveBayes LLR |
| Blockchain | Polygon Mumbai (Solidity 0.8.19) + Hyperledger Fabric |
| Audit | SHA-256 chained ledger |
| Payments | UPI/IMPS via NPCI (simulated) |
| Identity | Aadhaar eKYC, DigiLocker, PM-FASAL DBT |

---

## 🛠️ Local Development

```bash
git clone https://github.com/jyotheeswar012-max/iie-web
cd iie-web
npm install
npm run dev
# → http://localhost:3000
```

---

## 🌿 Pages

| Route | Description |
|-------|-------------|
| `/` | Hero — pipeline animation, live stats |
| `/demo` | 5-step interactive demo flow |
| `/agents` | AI agent quorum voting panel |
| `/dashboard` | Risk map, FSM state, audit timeline |
| `/risk` | District risk table with ML scores |
| `/payouts` | Live payout tracker |
| `/impact` | IIE vs PMFBY comparison |
| `/blockchain` | Smart contracts + Solidity code |
| `/enroll` | Farmer enrollment flow |
| `/india-stack` | India Stack DPI layers |
| `/architecture` | System architecture + roadmap |
| `/ml` | ML model panel |
| `/pitch` | Pitch deck |
| `/team` | Team page |

---

## 🔐 Judge Access

Add `X-Judge-Key: gff2026` header to any API call for priority routing and verbose responses.

---

## 📄 License

MIT — Built with ❤️ for SBI GFF 2026
