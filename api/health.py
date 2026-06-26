from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime, timezone

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            import api._store as s
            data={"status":"ok","version":"2.0.0","ts":datetime.now(timezone.utc).isoformat(),
                  "policies":len(s.POLICIES),"contracts":len(s.CONTRACTS),"audit_entries":len(s.AUDIT_LOG)}
        except:
            data={"status":"ok","version":"2.0.0"}
        b=json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Content-Length',str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def log_message(self,*a): pass
