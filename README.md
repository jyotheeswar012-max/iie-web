# 🛡️ Invisible Insurance Engine — Web

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![SBI GFF 2026](https://img.shields.io/badge/SBI%20GFF-2026-blue)]()

> **Agentic Parametric Insurance Payouts at Scale** — Next.js 14 + FastAPI full-stack app. Zero paperwork. Instant protection via SBI YONO.

---

## 🏗️ Architecture

```
iie-web/
├── web/          # Next.js 14 frontend (Vercel)
│   ├── app/      # App Router pages
│   ├── components/
│   └── lib/
├── api/          # FastAPI backend (Railway/Render)
│   ├── routers/
│   ├── agents/
│   └── main.py
└── README.md
```

## 🚀 Quick Start

```bash
# Frontend
cd web && npm install && npm run dev

# Backend
cd api && pip install -r requirements.txt && uvicorn main:app --reload
```

## 🌐 Deploy

- **Frontend** → Vercel (connect `web/` as root)
- **Backend** → Railway (connect `api/` as root)

---

*SBI GFF 2026 Hackathon · Jyotheeswar Reddy · Hyderabad*
