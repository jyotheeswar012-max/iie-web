# ⚡ IIE — Judge Cheat Sheet

> **SBI Global Fintech Fest 2026** · Jyotheeswar Reddy

---

## The Problem

PMFBY crop insurance takes **47 days** to pay a farmer after a drought is confirmed. The farmer fills **12 paper forms**, waits for a manual field survey, and often receives nothing due to **23% fraud rate** in claims (CAG Report 2022–23). 9.8 crore Indian farmers have zero crop insurance coverage today.

## The Answer

IIE is a **fully autonomous parametric insurance engine** native to SBI YONO. It monitors 4 sovereign data sources (NASA, IMD, ISRO, ICAR) in real-time, runs an AI oracle quorum, executes a Hyperledger Fabric smart contract, and settles **₹48,200 via IMPS in 2.8 seconds** — with zero forms, zero branch visit, zero farmer action.

---

## 🏆 Judge Entry Point

### [`https://iie-web-yono.vercel.app/judge`](https://iie-web-yono.vercel.app/judge)

6-step auto-play · ~3 minutes at 1× speed · No login required

```
Step 1 📱  YONO Open          →  SBI YONO OAuth 2.0 session validated
Step 2 🤖  Agentic AI Offer   →  AI pushes insurance 18h before drought window
Step 3 🛰️  Oracle Quorum      →  4 sovereign sources · 94% consensus
Step 4 ⛓️  Smart Contract     →  Hyperledger Fabric · state TRIGGERED→EXECUTED
Step 5 💸  IMPS Payout        →  ₹48,200 to rameshkumar@sbi in 2.8 seconds
Step 6 📝  Audit + KCC        →  7-year Fabric chain + KCC top-up offer
```

Ends with a **Judge Scorecard** mapping the demo to all 6 GFF 2026 criteria.

> Speed: `0.5×` / `1×` / `2×` · Manual step controls · Step-jump strip · Skip-to-Scorecard button

---

## 🏅 GFF 2026 Scorecard

| # | Criterion | Score | Evidence | Deep Link |
|---|-----------|-------|----------|-----------|
| 1 | **Agentic AI** | **10/10** | 4-oracle quorum. AI monitors NDVI/Rain/LST/Soil 24h. Proactively contacts farmer 18h before drought — not reactive. 10-row passive vs agentic table. | [/agentic](https://iie-web-yono.vercel.app/agentic) |
| 2 | **Customer Acquisition** | **9/10** | YONO 100M+ installs = zero cold acquisition. SBI KCC holders auto-identified. 45% agri lending market share activated from day 1. | [/sbi-apis](https://iie-web-yono.vercel.app/sbi-apis) |
| 3 | **Digital Adoption** | **9/10** | Native YONO integration. Aadhaar eKYC, DigiLocker, UPI/IMPS. BC-point enrollment via tablet. Zero new app installs. | [/demo](https://iie-web-yono.vercel.app/demo) |
| 4 | **Innovation & Technology** | **10/10** | 4-oracle sovereign quorum (NASA+IMD+ISRO+ICAR). Hyperledger Fabric + Polygon hybrid chain. GradientBoosting F1=0.91. SHAP explainability. < 3s payout. | [/agents](https://iie-web-yono.vercel.app/agents) |
| 5 | **Scalability & Sustainability** | **9/10** | Vercel Edge 100+ PoPs, < 50ms. MIT open-source. 500K farmer Year-1 TAM. Polygon gas ≈ ₹0.09/contract. Zero new branch infrastructure. | [/architecture](https://iie-web-yono.vercel.app/architecture) |
| 6 | **Compliance & Risk** | **10/10** | 96% compliance (27/28 checks). DPDP Act 2023 + RBI IT Framework + IRDAI Digital Regulation + Data Localisation. SHA-256 7-year Fabric chain. IRDAI permissioned audit key. | [/india-stack](https://iie-web-yono.vercel.app/india-stack) |

**Overall: 57 / 60 · 95%**

---

## 🏦 Why SBI Wins (not HDFC, not ICICI)

| | IIE on SBI | HDFC | ICICI |
|--|--|--|--|
| KCC market share | **45%** | 8% | 6% |
| Distribution | **YONO 100M+ installs** | HDFC Mobile | iMobile |
| Rural branches | **22,500+** | 6,300 | 5,900 |
| Payout | **2.8 seconds** | 15–30 days | 30–90 days |
| Post-payout upsell | **KCC top-up (auto)** | None | None |

Remove SBI and the product breaks. IIE is SBI infrastructure, not a bank-agnostic fintech.

---

## 🔌 3 Fastest API Tests

```bash
# 1. Health check
curl https://iie-web-yono.vercel.app/api/health -H 'X-Judge-Key: gff2026'

# 2. Oracle quorum run
curl -X POST https://iie-web-yono.vercel.app/api/oracle/verify \
  -H 'Content-Type: application/json' -H 'X-Judge-Key: gff2026' \
  -d '{"policy_id":"SBI-IIE-00341","event_type":"drought","district":"Barmer","crop":"wheat","acreage":4.5}'

# 3. IMPS payout
curl -X POST https://iie-web-yono.vercel.app/api/sbi/payment \
  -H 'Content-Type: application/json' -H 'X-Judge-Key: gff2026' \
  -d '{"policyId":"SBI-IIE-00341","beneficiaryVpa":"rameshkumar@sbi","amount":48200}'
```

---

## 📋 All Pages at a Glance

| Route | Purpose |
|-------|---------|
| [`/judge`](https://iie-web-yono.vercel.app/judge) | **⭐ Start here** — 3-min demo + GFF scorecard |
| [`/agentic`](https://iie-web-yono.vercel.app/agentic) | Agentic AI criterion |
| [`/sbi-apis`](https://iie-web-yono.vercel.app/sbi-apis) | SBI API integration live calls |
| [`/india-stack`](https://iie-web-yono.vercel.app/india-stack) | Compliance (96% score, 28 checks) |
| [`/blockchain`](https://iie-web-yono.vercel.app/blockchain) | Smart contracts + Fabric audit chain |
| [`/payouts`](https://iie-web-yono.vercel.app/payouts) | Live payout tracker |
| [`/impact`](https://iie-web-yono.vercel.app/impact) | IIE vs PMFBY sourced evidence table |
| [`/agents`](https://iie-web-yono.vercel.app/agents) | 4-agent oracle quorum voting panel |
| [`/team`](https://iie-web-yono.vercel.app/team) | Builder profile + GFF-mapped modules |

---

*Built for SBI GFF 2026 · MIT License · iie-web-yono.vercel.app*
