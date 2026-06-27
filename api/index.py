"""
api/index.py  —  Vercel Python Serverless Entrypoint  (v4.0.1)

FIX: Vercel executes api/index.py with cwd=/var/task but sys.path does NOT
include the repo root, so `from api.core import ...` raises ModuleNotFoundError.
The two lines below inject the repo root (/var/task) into sys.path at import
time — before any api.* submodule is touched.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- everything below only runs after the path fix is in place ---
from http.server import BaseHTTPRequestHandler
import json
from api.core.app import dispatch


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors(204, b"")

    def do_GET(self):
        self._handle("GET")

    def do_POST(self):
        self._handle("POST")

    def _handle(self, method: str):
        length = int(self.headers.get("Content-Length", 0))
        body   = {}
        if length:
            try:
                body = json.loads(self.rfile.read(length))
            except Exception:
                self._json(400, {"error": "Invalid JSON body"})
                return

        headers   = {k.lower(): v for k, v in self.headers.items()}
        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0])

        try:
            status, data = dispatch(method, self.path, headers, body, client_ip)
        except Exception as exc:
            import traceback
            self._json(500, {
                "error":  "Internal server error",
                "detail": str(exc),
                "trace":  traceback.format_exc()[-1200:],
            })
            return

        self._json(status, data)

    def _json(self, code: int, data: dict):
        payload = json.dumps(data, default=str).encode()
        self.send_response(code)
        self.send_header("Content-Type",                 "application/json")
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-IIE-Key")
        self.send_header("Content-Length",               str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _cors(self, code: int, body: bytes):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-IIE-Key")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args): pass
