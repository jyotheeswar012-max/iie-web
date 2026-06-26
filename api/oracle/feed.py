from http.server import BaseHTTPRequestHandler
import json, time, random
from datetime import datetime, timezone

def _now(): return datetime.now(timezone.utc).isoformat()
def _block(): return 19823441+int(time.time())%10000

def _oracle(district):
    seed=sum(ord(c) for c in district)+int(time.time()//300)
    r=random.Random(seed)
    ndvi=round(r.uniform(0.16,0.44),3)
    rain=round(r.uniform(20,280),1)
    temp=round(r.uniform(36,48),1)
    soil=round(r.uniform(10,45),1)
    risk=0
    if ndvi<0.30: risk+=35
    if rain<100:  risk+=25
    if temp>44:   risk+=25
    if soil<20:   risk+=15
    alert="NORMAL"
    if risk>=70: alert="CRITICAL"
    elif risk>=50: alert="HIGH"
    elif risk>=30: alert="ELEVATED"
    return {"district":district,"ndvi":ndvi,"rainfall_mm":rain,"temp_c":temp,
            "soil_moisture":soil,"risk_score":risk,"alert":alert}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        districts=[("Barmer","RJ"),("Puri","OD"),("Ludhiana","PB"),("Nashik","MH"),("Latur","MH"),("Warangal","TG"),("Adilabad","TG"),("Jodhpur","RJ")]
        data={"block_height":_block(),"fetched_at":_now(),
              "districts":[{"state":s,**_oracle(d)} for d,s in districts]}
        self._send(200,data)
    def do_OPTIONS(self): self._send(200,{})
    def _send(self,code,data):
        b=json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Content-Length',str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def log_message(self,*a): pass
