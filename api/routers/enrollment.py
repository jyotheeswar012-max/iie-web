from fastapi import APIRouter
from pydantic import BaseModel
import random, hashlib
from datetime import datetime

router = APIRouter()

CROP_MULT = {"Paddy":1.2,"Cotton":1.5,"Wheat":1.0,"Soybean":1.1,"Groundnut":1.3,"Sugarcane":1.4,"Maize":1.05,"Chilli":1.35}
BASE_ACRE = 3500

class FarmerProfile(BaseModel):
    name: str
    state: str
    district: str
    crop: str
    land_acres: float
    aadhaar_last4: str = ""
    phone: str = ""

@router.get("/nudges")
def get_nudges():
    return {"nudges": [
        {"icon":"🌧️","title":"Flood Risk Alert",    "message":"Your district shows 73% flood probability this monsoon. Enroll before June 30.","urgency":"HIGH"},
        {"icon":"☀️", "title":"Drought Protection","message":"NDVI history shows drought in 3 of last 5 years for cotton farmers in your area.","urgency":"MEDIUM"},
        {"icon":"🌾","title":"First-Timer Subsidy","message":"PM-FASAL subsidy gives 30% off premium. Est. payout: ₹12,400 per trigger event.","urgency":"LOW"},
    ]}

@router.post("/recommend")
def recommend_plans(profile: FarmerProfile):
    base   = BASE_ACRE * profile.land_acres
    mult   = CROP_MULT.get(profile.crop, 1.0)
    seed   = abs(hash(f"{profile.district}{profile.crop}")) % 10000
    rng    = random.Random(seed)
    risk_s = rng.randint(42,88)
    plans  = [
        {"icon":"🌱","name":"Basic Protect",  "premium":f"₹{int(base*mult*0.08):,}", "coverage":f"₹{int(base*mult*1.2):,}/event", "trigger":"Drought or Flood only",        "recommended":False},
        {"icon":"🛡️","name":"Smart Shield",   "premium":f"₹{int(base*mult*0.12):,}", "coverage":f"₹{int(base*mult*2.0):,}/event", "trigger":"4 parametric triggers",        "recommended":True},
        {"icon":"⭐", "name":"Full Season Pro","premium":f"₹{int(base*mult*0.18):,}", "coverage":f"₹{int(base*mult*3.5):,}/event", "trigger":"Unlimited + replanting cover",  "recommended":False},
    ]
    return {
        "risk_score": risk_s,
        "flood_prob": rng.randint(55,78),
        "heatwave_days": rng.randint(8,18),
        "plans": plans,
    }

@router.post("/enroll")
def enroll(profile: FarmerProfile, plan_name: str = "Smart Shield"):
    pid = abs(hash(f"{profile.name}{profile.district}{profile.crop}")) % 100000
    return {
        "success": True,
        "policy_id": f"SBI-IIE-{pid:05d}",
        "plan": plan_name,
        "farmer": profile.name,
        "message": f"Policy activated. SMS sent to {profile.phone or 'registered number'}.",
        "activated_at": datetime.utcnow().isoformat(),
    }
