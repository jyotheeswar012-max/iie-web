from http.server import BaseHTTPRequestHandler
import json, hashlib, time, random
from datetime import datetime, timezone

THRESHOLDS = {
    "drought":  {"ndvi_max": 0.30, "rain_min": 50},
    "flood":    {"rain_6hr": 200},
    "heatwave": {"temp_max": 45.0},
    "cyclone":  {"wind_kmh": 75},
}
BASE_PAYOUT = {"drought": 6000, "flood": 8000, "heatwave": 7000, "cyclone": 9000}
CROP_MULT   = {"paddy":1.2,"cotton":1.3,"wheat":1.1,"soybean":1.0,"groundnut":1.15,"sugarcane":1.4,"maize":1.0,"chilli":1.25}

def _now(): return datetime.now(timezone.utc).isoformat()

def _oracle(district):
    seed = sum(ord(c) for c in district) + int(time.time() // 300)
    r = random.Random(seed)
    return {
        "nasa_modis_ndvi":    round(r.uniform(0.16, 0.44), 3),
        "imd_rainfall_mm":   round(r.uniform(20, 280), 1),
        "isro_temp_c":       round(r.uniform(36, 48), 1),
        "icar_soil_moisture":round(r.uniform(10, 45), 1),
        "isro_wind_kmh":     round(r.uniform(10, 95), 1),
        "fetched_at":        _now(),
    }

def _agents(o, ev):
    n,rain,t,s,w = o["nasa_modis_ndvi"],o["imd_rainfall_mm"],o["isro_temp_c"],o["icar_soil_moisture"],o["isro_wind_kmh"]
    if ev=="drought":   v={"Agent1_RiskMonitor":(n<0.30,f"NDVI={n}<0.30"),"Agent2_Verifier":(rain<50,f"Rain={rain}mm<50"),"Agent3_PolicyMatch":(s<25,f"Soil={s}%<25"),"Agent4_Executor":(n<0.33 and rain<80,"Dual NDVI+Rain")}
    elif ev=="flood":   v={"Agent1_RiskMonitor":(rain>200,f"Rain={rain}>200mm"),"Agent2_Verifier":(rain>170,"Secondary"),"Agent3_PolicyMatch":(s>70,f"Soil={s}%>70"),"Agent4_Executor":(rain>150 and s>60,"Dual Rain+Soil")}
    elif ev=="heatwave":v={"Agent1_RiskMonitor":(t>45,f"Temp={t}>45"),"Agent2_Verifier":(t>43,"Secondary"),"Agent3_PolicyMatch":(n<0.35,f"NDVI={n}<0.35"),"Agent4_Executor":(t>42 and n<0.38,"Dual Temp+NDVI")}
    else:               v={"Agent1_RiskMonitor":(w>75,f"Wind={w}>75"),"Agent2_Verifier":(w>60,"Secondary"),"Agent3_PolicyMatch":(rain>100,f"Rain={rain}"),"Agent4_Executor":(w>55 and rain>80,"Dual Wind+Rain")}
    yes = sum(1 for (vv,_) in v.values() if vv)
    conf = round((yes/4)*100,1)
    return {"votes":{k:{"decision":"✅ YES" if vv else "❌ NO","reason":r} for k,(vv,r) in v.items()},"yes_count":yes,"confidence_pct":conf,"quorum_met":conf>=75}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Use module-level store shared across Vercel function
        import api._store as store
        length = int(self.headers.get('Content-Length',0))
        body   = json.loads(self.rfile.read(length))
        pid    = body.get('policy_id','')
        ev     = body.get('event_type','drought')

        if pid not in store.POLICIES:
            return self._send(404,{"error":f"Policy {pid} not found"})

        policy  = store.POLICIES[pid]
        oracle  = _oracle(policy["district"])
        quorum  = _agents(oracle, ev)
        contract= store.CONTRACTS[pid]

        if quorum["quorum_met"] and contract["state"]=="ACTIVE":
            mult   = CROP_MULT.get(policy["crop"],1.0)
            payout = round(BASE_PAYOUT.get(ev,6000)*mult*policy["acreage"]*(quorum["confidence_pct"]/100))
            contract.update({"state":"TRIGGERED","oracle_data":oracle,"agent_quorum":quorum,
                             "triggered_at":_now(),"event_type":ev,"payout_amount":payout})

        self._send(200,{"policy_id":pid,"district":policy["district"],"event_type":ev,
                        "oracle_data":oracle,"agent_quorum":quorum,
                        "contract_state":contract["state"],
                        "payout_amount":contract.get("payout_amount"),
                        "next_step":"POST /api/contract/execute" if quorum["quorum_met"] else "Quorum not met"})

    def do_OPTIONS(self): self._send(200,{})
    def _send(self,code,data):
        b=json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.send_header('Content-Length',str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def log_message(self,*a): pass
