from http.server import BaseHTTPRequestHandler
import json

def _predict(ndvi,temp,rain,soil):
    score=0; flags=[]
    if ndvi<0.20:   score+=40;flags.append(f"Severe NDVI={ndvi}<0.20")
    elif ndvi<0.30: score+=30;flags.append(f"Drought stress NDVI={ndvi}<0.30")
    elif ndvi<0.40: score+=15;flags.append(f"Mild stress NDVI={ndvi}")
    if temp>46:    score+=25;flags.append(f"Extreme heat {temp}C")
    elif temp>44:  score+=18;flags.append(f"Severe heat {temp}C")
    elif temp>42:  score+=10;flags.append(f"Heat stress {temp}C")
    if rain<50:    score+=25;flags.append(f"Severe deficit {rain}mm")
    elif rain<100: score+=18;flags.append(f"Deficit {rain}mm")
    elif rain<150: score+=10;flags.append(f"Below normal {rain}mm")
    if soil<15:    score+=10;flags.append(f"Critical moisture {soil}%")
    elif soil<25:  score+=6; flags.append(f"Low moisture {soil}%")
    s=min(score,100)
    return {"risk_score":round(s,1),"risk_level":"CRITICAL" if s>=70 else "HIGH" if s>=50 else "MEDIUM" if s>=30 else "LOW",
            "triggered":s>=50,"confidence_pct":round(min(s*1.04,99.9),1),"flags":flags}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length=int(self.headers.get('Content-Length',0))
        b=json.loads(self.rfile.read(length))
        result=_predict(b.get('ndvi',0.3),b.get('temp_c',40),b.get('rainfall_mm',100),b.get('soil_moisture_pct',20))
        self._send(200,{"district":b.get('district','Unknown'),"input":b,"model":"IIE-NDVIv1"  ,**result})
    def do_OPTIONS(self): self._send(200,{})
    def _send(self,code,data):
        byt=json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.send_header('Content-Length',str(len(byt)))
        self.end_headers()
        self.wfile.write(byt)
    def log_message(self,*a): pass
