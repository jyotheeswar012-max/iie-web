from http.server import BaseHTTPRequestHandler
import json

def _verify_chain(log):
    import hashlib
    for i,e in enumerate(log[1:],1):
        if e["prev_hash"]!=log[i-1]["hash"]: return False
    return True

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        import api._store as store
        data={"chain_valid":_verify_chain(store.AUDIT_LOG),
              "total_entries":len(store.AUDIT_LOG),
              "ledger":store.AUDIT_LOG}
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
