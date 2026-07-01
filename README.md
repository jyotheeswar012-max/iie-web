# 🌾 IIE — Invisible Insurance Engine for YONO Kisan

[![Live](https://img.shields.io/badge/Vercel-Live-brightgreen?logo=vercel)](https://iie-web-yono.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4.4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![Pitch Deck](https://img.shields.io/badge/Pitch%20Deck-PDF-F68B1F?logo=adobeacrobatreader)](https://github.com/jyotheeswar012-max/iie-web/blob/main/pitch-deck.pdf)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> **SBI Global Fintech Fest 2026** · A Next.js 14 simulation of a parametric crop insurance engine, built natively on SBI's YONO stack — demonstrating zero-paperwork enrollment, 4-oracle quorum logic, and sub-3-second IMPS payout flows.

---

## 📊 Pitch Deck

> **📅 [Download pitch-deck.pdf](pitch-deck.pdf)** — 10 slides, A4 landscape
> **🔗 [Interactive Pitch Toolkit](https://iie-web-yono.vercel.app/pitch)** — Script + Slides + Video Guide + Q&A Prep (`src/app/pitch/page.tsx`)

---

## ⚡ START HERE — Judge Demo

**[https://iie-web-yono.vercel.app/judge](https://iie-web-yono.vercel.app/judge)**

6-step auto-play · ~3 minutes · No login · Source: [`src/app/judge/page.tsx`](src/app/judge/page.tsx)

```
Step 1 📱  YONO Open        →  SBI YONO session screen (simulated)
Step 2 🤖  Agentic AI Offer →  AI pushes insurance 18h before drought window
Step 3 🛰️  Oracle Quorum    →  4 data sources · 94% consensus (JS logic)
Step 4 ⛓️  Smart Contract   →  State machine: TRIGGERED → EXECUTED
Step 5 💸  IMPS Payout      →  ₹48,200 settlement receipt in 2.8s (simulated)
Step 6 📝  Audit + KCC      →  Immutable log entry + KCC top-up offer
```

> All flows are **simulated in TypeScript** — no live bank credentials, no production blockchain. This is a working prototype designed for GFF 2026 evaluation.

---

## 🚀 Live App

| Route | Description | Source |
|-------|-------------|--------|
| `/judge` | ⭐ **START HERE** — 3-min demo + GFF scorecard | `src/app/judge/` |
| `/` | Hero — pipeline animation, outcome numbers | `src/app/page.tsx` |
| `/agentic` | 72h proactive scenario, 4-agent cards | `src/app/agentic/` |
| `/agents` | Oracle quorum voting panel | `src/app/agents/` |
| `/architecture` | System architecture + roadmap | `src/app/architecture/` |
| `/blockchain` | Smart contract state machine | `src/app/blockchain/` |
| `/dashboard` | Risk map, FSM state, audit timeline | `src/app/dashboard/` |
| `/demo` | 5-step interactive demo flow | `src/app/demo/` |
| `/enroll` | Farmer enrollment flow | `src/app/enroll/` |
| `/impact` | IIE vs PMFBY evidence table | `src/app/impact/` |
| `/india-stack` | Compliance checklist (28 items) | `src/app/india-stack/` |
| `/ml` | ML model explainability panel | `src/app/ml/` |
| `/multimodal` | Voice/image/text enrollment UI | `src/app/multimodal/` |
| `/payouts` | Payout tracker | `src/app/payouts/` |
| `/pitch` | Pitch toolkit: script, slides, Q&A | `src/app/pitch/` |
| `/risk` | District risk table | `src/app/risk/` |
| `/sbi-apis` | SBI API mock request/response panels | `src/app/sbi-apis/` |
| `/scalability` | Architecture + load test writeup | `src/app/scalability/` |
| `/sustainability` | Climate alignment panel | `src/app/sustainability/` |
| `/team` | Builder profile | `src/app/team/` |
| `/yono` | YONO Kisan enrollment flow | `src/app/yono/` |

---

## 🔌 API Routes

All routes are Next.js Route Handlers (`src/app/api/*/route.ts`) — no external backend.

```bash
# Health check
curl https://iie-web-yono.vercel.app/api/health

# Oracle quorum (simulated)
curl -X POST https://iie-web-yono.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' \
  -d '{"policy_id":"SBI-IIE-00341","event_type":"drought","district":"Barmer","crop":"wheat","acreage":4.5}'

# IMPS payout (simulated)
curl -X POST https://iie-web-yono.vercel.app/api/sbi/payment \
  -H 'Content-Type: application/json' \
  -d '{"policyId":"SBI-IIE-00341","beneficiaryVpa":"rameshkumar@sbi","amount":48200}'

# Audit trail
curl https://iie-web-yono.vercel.app/api/audit/trail
```

Available: `/api/health` · `/api/oracle/` · `/api/sbi/` · `/api/agents` · `/api/audit/` · `/api/contract/` · `/api/ml/` · `/api/weather/`

---

## 📦 Actual Stack

Everything in this table is in [`package.json`](package.json).

| Layer | What's actually used |
|-------|----------------------|
| Framework | **Next.js 14.2.3** (App Router) |
| Language | **TypeScript 5.4.5** |
| Styling | **Tailwind CSS 3.4.4** |
| Animation | **Framer Motion 11.2.6** |
| Charts | **Recharts 2.12.7** |
| Icons | **Lucide React 0.378.0** |
| Runtime | **Node.js ≥ 18**, deployed on Vercel |
| Backend | **Next.js Route Handlers** — no separate API server |
| Database | **None** — all state is in-memory / simulated |
| Blockchain | **Simulated** — state machine in TypeScript, no on-chain calls |
| ML/AI | **Simulated** — deterministic scoring logic in TypeScript |
| Identity | **Simulated** — Aadhaar/DigiLocker/IMPS mock flows, no live credentials |

---

## 🏦 Why SBI?

IIE is designed exclusively around SBI's existing infrastructure. The simulation demonstrates integration points that only SBI can activate:

- **45% KCC market share** — 145M farmers addressable without cold acquisition
- **YONO Kisan (100M+ downloads)** — distribution already solved; IIE adds a feature tab
- **22,500+ rural branches + 65,000 BCs** — enrollment via existing BC tablets
- **SBI API surface demonstrated** (`/sbi-apis`): YONO session validation, AA FIP consent, IMPS payment initiation, Credit Assessment — all mocked to spec

Remove SBI and the enrollment channel, trust layer, and payment rail all break. That is the core architectural argument.

---

## 🛠️ Local Development

```bash
git clone https://github.com/jyotheeswar012-max/iie-web
cd iie-web
npm install
npm run dev
# → http://localhost:3000
```

Node ≥ 18 required. No environment variables needed — all external calls are simulated.

---

## 📄 License

MIT — Built for SBI GFF 2026
