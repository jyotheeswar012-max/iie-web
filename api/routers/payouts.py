from fastapi import APIRouter
from pydantic import BaseModel
import random, time as _time
from datetime import datetime, timedelta

router = APIRouter()

FARMERS = ["Raju Patil","Suresh Kumar","Anita Devi","Mahesh Reddy","Kavitha Bai",
           "Vijay Singh","Priya Sharma","Ramesh Yadav","Lakshmi Nair","Arun Patel",
           "Geeta Kumari","Mohan Lal","Sarla Devi","Prakash Rao","Uma Shankar"]
DISTRICTS = ["Warangal","Barmer","Puri","Nashik","Ludhiana","Latur","Amritsar","Khammam"]
TRIGGERS  = ["Drought","Flood","Cyclone","Heatwave"]

@router.get("/feed")
def payout_feed(n: int = 20):
    rng  = random.Random(int(datetime.now().strftime("%Y%m%d%H%M"))//5)
    now  = datetime.now()
    feed = []
    for i in range(n):
        status = "SUCCESS" if rng.random()<0.993 else ("PENDING" if rng.random()<0.5 else "FAILED")
        feed.append({
            "farmer":   rng.choice(FARMERS),
            "district": rng.choice(DISTRICTS),
            "amount":   f"₹{rng.randint(2000,18000):,}",
            "status":   status,
            "trigger":  rng.choice(TRIGGERS),
            "time":     (now-timedelta(minutes=rng.randint(1,120))).strftime("%H:%M"),
        })
    return {"feed": sorted(feed, key=lambda x: x["time"], reverse=True)}

@router.get("/volume")
def payout_volume():
    today = datetime.today()
    rng   = random.Random(int(today.strftime("%Y%m%d")))
    rows  = []
    for i in range(14):
        date = (today-timedelta(days=13-i)).strftime("%b %d")
        amt  = round(rng.uniform(0.8,3.8),2)
        rows.append({"date":date,"amount_cr":amt,"farmers":int(amt*rng.uniform(1800,2600))})
    return {"volume": rows}

class SimulateRequest(BaseModel):
    district: str
    trigger: str
    farmers: int
    avg_payout: int

@router.post("/simulate")
def simulate(req: SimulateRequest):
    total = req.farmers * req.avg_payout
    time_mins = random.randint(38,94)
    return {
        "success": True,
        "district": req.district,
        "trigger":  req.trigger,
        "farmers_paid": req.farmers,
        "total_inr": total,
        "total_cr":  round(total/1e7,2),
        "time_mins": time_mins,
        "utr": f"UTR{abs(hash(req.district))%10**12:012d}",
    }
