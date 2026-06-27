"""
api/index.py  —  Vercel Python Serverless Entrypoint  (v4.0.0)

This file is intentionally THIN. All business logic lives in:
  api/core/           — store, utils, logging, security, app dispatcher
  api/oracle/         — 4-source oracle engine + enroll/verify handlers
  api/contract/       — multi-agent orchestrator (4 agents, weighted quorum)
  api/blockchain/     — smart contract state machine (ACTIVE→TRIGGERED→EXECUTED)
  api/audit/          — SHA-256 tamper-evident append-only chain
  api/ml/             — Naive Bayes log-likelihood risk scorer
  api/india_stack/    — Aadhaar eKYC, DigiLocker, UPI IMPS simulator

Vercel routes ALL /api/* requests here via vercel.json.
"""
from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
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

        headers = {k.lower(): v for k, v in self.headers.items()}
        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0])

        try:
            status, data = dispatch(method, self.path, headers, body, client_ip)
        except Exception as exc:
            import traceback
            self._json(500, {
                "error":   "Internal server error",
                "detail":  str(exc),
                "trace":   traceback.format_exc()[-800:],
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

    def log_message(self, *args): pass   # suppress Vercel access log noise
