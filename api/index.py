"""
api/index.py  —  Vercel Python Serverless Entrypoint  v5.1.0

Fixes:
  1. Double sys.path injection so all `from api.*` imports resolve in /var/task
  2. Graceful fallback if heavy deps (scikit-learn, slowapi) are missing
  3. All HTTP methods handled
"""
import sys, os

# Inject repo root so `from api.xxx import ...` works inside Vercel /var/task
_repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

# Also inject api/ dir so relative imports inside api/ work
_api_root = os.path.dirname(os.path.abspath(__file__))
if _api_root not in sys.path:
    sys.path.insert(0, _api_root)

from http.server import BaseHTTPRequestHandler
import json

try:
    from api.core.app import dispatch
except ImportError:
    from core.app import dispatch


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors(204, b"")

    def do_GET(self):
        self._handle("GET")

    def do_POST(self):
        self._handle("POST")

    def do_PUT(self):
        self._handle("PUT")

    def do_PATCH(self):
        self._handle("PATCH")

    def do_DELETE(self):
        self._handle("DELETE")

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
                "trace":  traceback.format_exc()[-2000:],
            })
            return

        self._json(status, data)

    def _json(self, code: int, data: dict):
        payload = json.dumps(data, default=str).encode()
        self.send_response(code)
        self.send_header("Content-Type",                 "application/json")
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-IIE-Key, Authorization")
        self.send_header("Content-Length",               str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _cors(self, code: int, body: bytes):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-IIE-Key, Authorization")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args): pass
