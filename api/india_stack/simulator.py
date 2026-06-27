"""
api/india_stack/simulator.py
India Stack Integration Simulator.

Simulates 3 India Stack building blocks:
  1. Aadhaar eKYC   — UIDAI OTP-based identity verification
                      Real: https://developer.uidai.gov.in (sandbox)
  2. DigiLocker API — Document pull for land records (RoR), crop certificate
                      Real: https://digilocker.gov.in/public/oauth2/1/token
  3. UPI IMPS       — SBI YONO instant payout via NPCI IMPS rail
                      Real: RBI Payment Aggregator API / SBI Corporate Banking API

DPDP Act 2023 compliance:
  - No raw Aadhaar numbers stored (HMAC token only)
  - DigiLocker ref stored; document content not persisted
  - UPI VPA stored; account number not logged
"""
import time, random
from api.core.utils import now_iso, uid, aadhaar_token, upi_ref as _upi_ref, rrn as _rrn, hmac_sha256
from api.core.store import load, save
from api.core       import logging as log

_LAND_RECORDS = {
    "Barmer":   "RJ-BJM-2024-LR-{uid}",
    "Puri":     "OD-PUR-2024-LR-{uid}",
    "Ludhiana": "PB-LDH-2024-LR-{uid}",
    "Nashik":   "MH-NSK-2024-LR-{uid}",
    "Latur":    "MH-LAT-2024-LR-{uid}",
    "Warangal": "TG-WGL-2024-LR-{uid}",
    "Adilabad": "TG-ADB-2024-LR-{uid}",
    "Jodhpur":  "RJ-JDH-2024-LR-{uid}",
    "Guntur":   "AP-GNT-2024-LR-{uid}",
    "Kurnool":  "AP-KNL-2024-LR-{uid}",
}
_DEFAULT_LR = "IN-{state}-2024-LR-{uid}"

_CROP_CERTS = {
    "paddy": "ICAR-KHARIF-PADDY-GR3", "cotton": "ICAR-KHARIF-COTTON-BT2",
    "wheat":  "ICAR-RABI-WHEAT-HD2967", "soybean": "ICAR-KHARIF-SOY-JS9560",
    "groundnut": "ICAR-KHARIF-GN-TMV7", "sugarcane": "ICAR-ANNUAL-SC-CO86032",
}


def simulate_kyc(name: str, aadhaar_last4: str, district: str) -> dict:
    """
    Simulates Aadhaar eKYC flow:
      1. OTP dispatch to masked mobile
      2. UIDAI demographic match
      3. DigiLocker pull: land record + crop certificate
    """
    token     = aadhaar_token(aadhaar_last4)
    masked_no = f"XXXX-XXXX-X{aadhaar_last4}"
    dl_ref    = "DL-" + uid(10)
    lr_tmpl   = _LAND_RECORDS.get(district, _DEFAULT_LR)
    lr_id     = lr_tmpl.replace("{uid}", uid(8)).replace("{state}", "IN")
    latency   = random.randint(180, 650)   # simulate API round-trip ms

    return {
        "status":            "VERIFIED",
        "method":            "Aadhaar_eKYC_OTP",
        "aadhaar_token":     token,
        "aadhaar_display":   masked_no,
        "uidai_txn_id":      "UIDAI-" + uid(12),
        "name_match":        True,
        "digilocker_ref":    dl_ref,
        "documents_pulled": {
            "land_record": {
                "ref":    lr_id,
                "type":   "Record of Rights (RoR) 7/12 extract",
                "issued": "Revenue Dept, " + district,
                "status": "VALID",
            },
            "crop_cert": {
                "ref":    "APEDA-" + uid(8),
                "type":   "Crop Insurance Eligibility Certificate",
                "status": "VALID",
            },
        },
        "dpdp_compliant":    True,
        "pii_stored":        False,
        "verified_at":       now_iso(),
        "latency_ms":        latency,
        "sandbox_note":      "Simulates UIDAI sandbox API — prod requires RBI/IRDAI approval",
    }


def handle_india_stack_verify(body: dict) -> tuple:
    name   = str(body.get("name",   "Farmer"))
    a4     = str(body.get("aadhaar_last4", "0000"))[:4]
    dist   = str(body.get("district", "Unknown"))
    kyc    = simulate_kyc(name, a4, dist)
    log.info("india_stack_kyc", district=dist, status=kyc["status"])
    return 200, {
        "success": True,
        "kyc":     kyc,
        "india_stack_components": [
            {"component": "Aadhaar eKYC",   "provider": "UIDAI",  "status": "VERIFIED"},
            {"component": "DigiLocker",     "provider": "MeitY",  "status": "DOCS_PULLED"},
            {"component": "UPI / NPCI",     "provider": "NPCI",   "status": "READY"},
            {"component": "PM-FASAL DB",    "provider": "DAC&FW", "status": "SUBSIDY_APPLIED"},
        ],
    }


def handle_upi_pay(body: dict) -> tuple:
    store  = load()
    pid    = str(body.get("policy_id", ""))
    amount = float(body.get("amount_inr", 0))

    if not pid or pid not in store.get("policies", {}):
        return 404, {"error": "Policy not found"}
    if amount <= 0:
        return 400, {"error": "amount_inr must be > 0"}

    policy  = store["policies"][pid]
    ref     = _upi_ref()
    rrn_val = _rrn()
    upi_id  = policy["name"].lower().replace(" ", ".")[:20] + "@sbi"

    entry = {
        "ref":         ref,
        "rrn":         rrn_val,
        "policy_id":   pid,
        "farmer":      policy["name"],
        "amount_inr":  amount,
        "upi_id":      upi_id,
        "status":      "SUCCESS",
        "method":      "IMPS",
        "credited_at": now_iso(),
        "npci_utr":    "NPCI" + uid(16),
        "bank":        "State Bank of India",
        "ifsc":        "SBIN0000001",
    }
    store["upi_txns"].append(entry)
    save(store)
    log.info("upi_pay", policy_id=pid, amount=amount, ref=ref)

    return 200, {
        "success":    True,
        "upi_ref":    ref,
        "rrn":        rrn_val,
        "npci_utr":   entry["npci_utr"],
        "amount_inr": amount,
        "credited_to": upi_id,
        "method":     "IMPS",
        "message": f"Rs {amount:,.0f} credited via IMPS to {upi_id}. RRN: {rrn_val}.",
    }


def handle_upi_txns() -> tuple:
    store = load()
    txns  = store.get("upi_txns", [])
    total = sum(t["amount_inr"] for t in txns)
    return 200, {
        "total_transactions": len(txns),
        "total_disbursed_inr": total,
        "transactions":       txns,
    }
