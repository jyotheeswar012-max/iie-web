from http.server import BaseHTTPRequestHandler
import json, hashlib, hmac, time, uuid
from datetime import datetime, timezone

# Shared in-memory store (persists within same serverless instance)
try:
    from api._store import POLICIES, CONTRACTS, AUDIT_LOG
except:
    POLICIES = {}
    CONTRACTS = {}
    AUDIT_LOG = []

def _now(): return datetime.now(timezone.utc).isoformat()
def _sha(s): return hashlib.sha256(s.encode()).hexdigest()
def _tx(seed): return "0x" + _sha(seed + str(time.time()))[:40]
def _block(): return 19823441 + int(time.time()) % 10000
def _aadhaar_hash(a4):
    return "AH_" + hmac.new(b"iie-salt-2026", a4.encode(), hashlib.sha256).hexdigest()[:16]

PREMIUMS  = {"Basic Protect": 2800, "Smart Shield": 4200, "Full Season Pro": 6300}
COVERAGE  = {"Basic Protect": 42000, "Smart Shield": 70000, "Full Season Pro": 122500}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body   = json.loads(self.rfile.read(length))

        name   = body.get('name', 'Farmer')
        a4     = body.get('aadhaar_last4', '0000')
        dist   = body.get('district', 'Unknown')
        state  = body.get('state', 'India')
        crop   = body.get('crop', 'wheat').lower()
        acres  = float(body.get('acreage', 5))
        plan   = body.get('plan', 'Smart Shield')

        pid    = "IIE-" + _sha(f"{name}{dist}{a4}")[:8].upper()
        sub    = round(PREMIUMS.get(plan, 4200) * 0.30)
        net    = PREMIUMS.get(plan, 4200) - sub
        caddr  = "0x" + _sha(pid)[:40]

        policy = {
            "policy_id": pid, "name": name,
            "aadhaar_hash": _aadhaar_hash(a4),
            "district": dist, "state": state, "crop": crop,
            "acreage": acres, "plan": plan,
            "premium_inr": PREMIUMS.get(plan, 4200),
            "subsidy_inr": sub, "net_premium_inr": net,
            "coverage_inr": COVERAGE.get(plan, 70000),
            "status": "ACTIVE", "enrolled_at": _now(),
            "upi_debit": "UPI-DEBIT-" + uuid.uuid4().hex[:8].upper(),
            "digilocker_ref": "DL-" + uuid.uuid4().hex[:10].upper(),
        }
        POLICIES[pid] = policy
        CONTRACTS[pid] = {
            "address": caddr, "policy_id": pid, "state": "ACTIVE",
            "block_deployed": _block(), "deployed_at": _now(),
            "tx_hash": _tx("deploy"+pid),
            "oracle_data": None, "agent_quorum": None,
            "payout_tx": None, "payout_amount": None,
        }

        result = {
            "success": True, "policy_id": pid,
            "contract_address": caddr,
            "aadhaar_hash": policy["aadhaar_hash"],
            "digilocker_ref": policy["digilocker_ref"],
            "upi_debit_ref": policy["upi_debit"],
            "net_premium_inr": net, "subsidy_applied": sub,
            "coverage_inr": COVERAGE.get(plan, 70000),
            "message": f"Policy {pid} issued. Contract at {caddr}. PM-FASAL subsidy \u20b9{sub} applied.",
        }
        self._send(200, result)

    def do_OPTIONS(self):
        self._send(200, {})

    def _send(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a): pass
