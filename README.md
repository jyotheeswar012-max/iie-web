# Invisible Insurance Engine — iie-web

> **Insurance that pays before you ask.**
> SBI GFF 2026 Hackathon Submission

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |
| Data | Mock parametric data (NASA MODIS, IMD, Sentinel-2 simulation) |

## 📁 Project Structure

```
iie-web/
├── web/          # Next.js 14 frontend
│   └── src/
│       ├── app/  # Pages: /, /risk, /enroll, /payouts, /impact
│       └── components/
└── api/          # FastAPI backend
    ├── main.py
    └── routers/  # risk, enrollment, payouts
```

## ⚡ Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import `iie-web`
3. Framework: **Next.js** · Root Directory: `web`
4. Click **Deploy** — done in 60 seconds!

## 🐍 Run FastAPI Backend Locally

```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 🌐 Pages

| Route | Page |
|-------|------|
| `/` | Mission Control — Hero, metrics, farmer stories, alert feed, agent pipeline |
| `/risk` | Satellite Risk Map — district table, filters, KPIs |
| `/enroll` | Enroll a Farmer — profile form, plan picker, YONO enrollment |
| `/payouts` | Live Payouts — charts, payout feed, filters |
| `/impact` | Impact & Submission — GFF doc, pillars, copy-paste text |

## 🏆 SBI GFF 2026

Built by **Jyotheeswar Reddy**, Hyderabad.
