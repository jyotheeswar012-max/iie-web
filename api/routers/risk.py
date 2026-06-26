from fastapi import APIRouter
import random, math
from datetime import datetime, timedelta

router = APIRouter()

DISTRICTS = [
    {"district":"Warangal",    "state":"Telangana",   "lat":17.98,"lon":79.60},
    {"district":"Khammam",     "state":"Telangana",   "lat":17.25,"lon":80.15},
    {"district":"Adilabad",    "state":"Telangana",   "lat":19.67,"lon":78.53},
    {"district":"Nashik",      "state":"Maharashtra", "lat":19.99,"lon":73.79},
    {"district":"Latur",       "state":"Maharashtra", "lat":18.40,"lon":76.58},
    {"district":"Barmer",      "state":"Rajasthan",   "lat":25.75,"lon":71.39},
    {"district":"Jodhpur",     "state":"Rajasthan",   "lat":26.29,"lon":73.01},
    {"district":"Ludhiana",    "state":"Punjab",      "lat":30.90,"lon":75.85},
    {"district":"Amritsar",    "state":"Punjab",      "lat":31.63,"lon":74.87},
    {"district":"Puri",        "state":"Odisha",      "lat":19.81,"lon":85.83},
    {"district":"Bhubaneswar", "state":"Odisha",      "lat":20.30,"lon":85.82},
    {"district":"Surat",       "state":"Gujarat",     "lat":21.17,"lon":72.83},
]
RISK_TYPES = ["Drought","Flood","Cyclone","Heatwave"]

def _score(district):
    seed = abs(hash(f"{district}{datetime.today().date()}")) % 10000
    rng  = random.Random(seed)
    s    = rng.uniform(15, 95)
    level = "Critical" if s>=70 else "High" if s>=50 else "Medium" if s>=30 else "Low"
    return round(s,1), level, rng.choice(RISK_TYPES), rng.randint(500,25000)

@router.get("/overview")
def risk_overview():
    rng = random.Random(int(datetime.now().strftime("%Y%m%d%H")))
    return {
        "farmers_covered": f"{rng.randint(9,11)*100000+rng.randint(0,9999):,}",
        "total_payouts":   f"₹{rng.randint(480,520)} Cr",
        "avg_time":        f"{rng.randint(42,58)} min",
        "risk_zones":      str(rng.randint(12,22)),
        "policies":        f"{rng.randint(95,105)*1000:,}",
        "last_updated":    datetime.utcnow().isoformat(),
    }

@router.get("/districts")
def risk_districts(state: str = None, level: str = None):
    results = []
    for d in DISTRICTS:
        score, lv, rtype, farmers = _score(d["district"])
        row = {**d, "risk_score": score, "risk_level": lv, "risk_type": rtype, "farmers_covered": farmers}
        if state and d["state"] != state: continue
        if level and lv != level: continue
        results.append(row)
    return {"districts": results, "count": len(results)}

@router.get("/alerts")
def risk_alerts():
    now = datetime.now()
    return {"alerts": [
        {"icon":"🔴","district":"Barmer, RJ",   "message":"NDVI 0.21 — Drought trigger verified",   "level":"CRITICAL","time":(now-timedelta(minutes=3)).strftime("%H:%M")},
        {"icon":"🟠","district":"Puri, OD",     "message":"Rainfall 187mm — approaching flood",     "level":"WARNING", "time":(now-timedelta(minutes=11)).strftime("%H:%M")},
        {"icon":"🔴","district":"Latur, MH",    "message":"Temp 46.2°C — Heatwave activated",        "level":"CRITICAL","time":(now-timedelta(minutes=19)).strftime("%H:%M")},
        {"icon":"🟢","district":"Ludhiana, PB", "message":"₹34Cr paid to 3,840 farmers — done",      "level":"SAFE",   "time":(now-timedelta(minutes=34)).strftime("%H:%M")},
        {"icon":"🟠","district":"Adilabad, TG","message":"Wind 78km/h — monitoring cyclone",         "level":"WARNING","time":(now-timedelta(minutes=47)).strftime("%H:%M")},
        {"icon":"🟢","district":"Amritsar, PB","message":"₹21Cr auto-credited to 2,100 accounts",     "level":"SAFE",   "time":(now-timedelta(minutes=62)).strftime("%H:%M")},
    ]}

@router.get("/trend")
def risk_trend():
    today = datetime.today()
    top = ["Warangal","Barmer","Latur","Puri","Ludhiana"]
    rows = []
    for d in top:
        rng  = random.Random(abs(hash(d))%10000)
        base = rng.uniform(30,70)
        for i in range(7):
            date  = (today-timedelta(days=6-i)).strftime("%b %d")
            noise = rng.uniform(-12,12)
            rows.append({"district":d,"date":date,"risk_score":round(min(100,max(0,base+noise)),1)})
            base += rng.uniform(-5,8)
    return {"trend": rows}
