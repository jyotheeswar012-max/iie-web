from http.server import BaseHTTPRequestHandler
import json, hashlib, time, uuid
from datetime import datetime, timezone

def _now(): return datetime.now(timezone.utc).isoformat()
def _sha(s): return hashlib.sha256(s.encode()).hexdigest()
def _tx(seed): return "0x"+_sha(seed+str(time.time()))[:40]
def _block(): return 19823441+int(time.time())%10000

BASE_PAYOUT={"drought":6000,"flood":8000,"heatwave":7000,"cyclone":9000}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        import api._store as store
        length  = int(self.headers.get('Content-Length',0))
        body    = json.loads(self.rfile.read(length))
        pid     = body.get('policy_id','')
        force   = body.get('force', False)

        if pid not in store.CONTRACTS:
            return self._send(404,{"error":"Contract not found"})

        contract = store.CONTRACTS[pid]
        policy   = store.POLICIES[pid]

        if contract["state"]=="EXECUTED":
            return self._send(200,{"message":"Already executed","contract":contract})
        if contract["state"]!="TRIGGERED" and not force:
            return self._send(400,{"error":f"State is '{contract['state']}'. Run /api/oracle/verify first."})

        payout   = contract.get("payout_amount") or round(BASE_PAYOUT.get("drought",6000)*policy["acreage"])
        tx_hash  = _tx("execute"+pid)
        block    = _block()
        upi_ref  = "UPI-"+uuid.uuid4().hex[:10].upper()
        upi_id   = f"{policy['name'].lower().replace(' ','.')}@sbi"
        sms      = (f"SBI IIE: Dear {policy['name']}, your crop insurance payout of "
                    f"Rs {payout:,} has been credited via IMPS. Ref: {upi_ref}. "
                    f"No claim filed. Powered by YONO-Oracle IIE.")

        contract.update({"state":"EXECUTED","executed_at":_now(),"tx_hash":tx_hash,
                         "block_number":block,"payout_tx":upi_ref,"payout_amount":payout})

        upi_entry={"ref":upi_ref,"policy_id":pid,"farmer":policy["name"],
                   "amount_inr":payout,"upi_id":upi_id,"status":"SUCCESS",
                   "method":"IMPS","credited_at":_now(),"tx_hash":tx_hash,"block_number":block}
        store.UPI_TRANSACTIONS.append(upi_entry)

        entry={"seq":len(store.AUDIT_LOG)+1,"ts":_now(),"event":"CONTRACT_EXECUTED",
               "policy_id":pid,"hash":_sha(json.dumps(upi_entry,sort_keys=True)),
               "prev_hash":store.AUDIT_LOG[-1]["hash"] if store.AUDIT_LOG else "0"*64,
               "data":upi_entry}
        store.AUDIT_LOG.append(entry)

        self._send(200,{"success":True,"policy_id":pid,"contract_state":"EXECUTED",
                        "payout_inr":payout,"tx_hash":tx_hash,"block_number":block,
                        "upi_ref":upi_ref,"farmer":policy["name"],"credited_to":upi_id,
                        "method":"IMPS","sms_sent":sms,"audit_seq":len(store.AUDIT_LOG),
                        "message":f"Rs {payout:,} executed on-chain (block #{block}) and credited via IMPS. Zero claim forms."})

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
