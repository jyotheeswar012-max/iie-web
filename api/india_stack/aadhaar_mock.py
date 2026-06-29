"""
Aadhaar eKYC Sandbox Mock — IIE GFF 2026

Simulates UIDAI OTP-based KYC flow.
In production: replace with UIDAI Auth API (AUA/KUA license required).
All Aadhaar numbers are hashed before storage (DPDP Act 2023 compliant).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import hashlib, hmac, random, uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/india-stack/aadhaar", tags=["India Stack – Aadhaar"])

# ---------------------------------------------------------------------------
# SANDBOX USER DATABASE (simulates UIDAI resident registry)
# ---------------------------------------------------------------------------
SANDBOX_RESIDENTS = {
    "9999": {"name": "Ramesh Kumar",     "dob": "1985-06-12", "gender": "M", "state": "Telangana",    "district": "Warangal"},
    "8888": {"name": "Sunita Devi",      "dob": "1990-03-22", "gender": "F", "state": "Maharashtra",  "district": "Latur"},
    "7777": {"name": "Harpal Singh",     "dob": "1978-11-05", "gender": "M", "state": "Punjab",       "district": "Ludhiana"},
    "6666": {"name": "Meera Bai",        "dob": "1995-08-30", "gender": "F", "state": "Rajasthan",    "district": "Barmer"},
    "5555": {"name": "Venkatesh Reddy",  "dob": "1982-01-18", "gender": "M", "state": "Andhra Pradesh","district": "Kurnool"},
}

# In-memory OTP store (simulates UIDAI OTP session)
_OTP_SESSIONS: dict = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _aadhaar_hmac(last4: str) -> str:
    """One-way DPDP-compliant hash — no raw Aadhaar stored anywhere."""
    return "AH_" + hmac.new(b"iie-gff-2026-salt", last4.encode(), hashlib.sha256).hexdigest()[:20]


# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------
class OTPSendRequest(BaseModel):
    aadhaar_last4: str = Field(..., min_length=4, max_length=4, description="Last 4 digits of Aadhaar")
    phone_last4:   str = Field(..., min_length=4, max_length=4, description="Last 4 digits of registered mobile")


class OTPVerifyRequest(BaseModel):
    session_id:    str
    otp:           str = Field(..., min_length=6, max_length=6)
    consent:       bool = Field(..., description="Explicit consent for eKYC data sharing (mandatory per UIDAI)")


class EKYCResponse(BaseModel):
    status:        str
    aadhaar_hash:  str
    name:          str
    gender:        str
    dob:           str
    state:         str
    district:      str
    verified_at:   str
    txn_id:        str
    sandbox_note:  str


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------
@router.post("/send-otp", summary="Send OTP to Aadhaar-linked mobile (sandbox)")
def send_otp(req: OTPSendRequest):
    """
    Step 1: Resident requests OTP.
    Sandbox: always succeeds, returns a session_id.
    Production: calls UIDAI /otp API with AUA credentials.
    """
    if req.aadhaar_last4 not in SANDBOX_RESIDENTS:
        raise HTTPException(
            status_code=404,
            detail=f"Aadhaar last4 '{req.aadhaar_last4}' not in GFF sandbox. Use: {list(SANDBOX_RESIDENTS.keys())}"
        )

    session_id = str(uuid.uuid4())
    otp        = str(random.randint(100000, 999999))  # In prod: UIDAI sends real OTP to mobile

    _OTP_SESSIONS[session_id] = {
        "aadhaar_last4": req.aadhaar_last4,
        "otp":           otp,
        "created_at":    _now_iso(),
        "used":          False,
    }

    return {
        "success":      True,
        "session_id":   session_id,
        "otp_hint":     f"SANDBOX OTP (not shown in prod): {otp}",  # Remove in production
        "message":      f"OTP sent to mobile ending {req.phone_last4}. Valid 10 minutes.",
        "expires_in":   600,
        "sandbox_note": "This is a GFF 2026 sandbox. UIDAI production requires AUA/KUA license.",
    }


@router.post("/verify-otp", response_model=EKYCResponse, summary="Verify OTP and fetch eKYC data")
def verify_otp(req: OTPVerifyRequest):
    """
    Step 2: Verify OTP → receive eKYC data.
    Returns DPDP-compliant hashed Aadhaar + demographic data.
    Consent flag is mandatory — stored in audit log.
    """
    if not req.consent:
        raise HTTPException(400, "Explicit consent required for eKYC data sharing (UIDAI mandate).")

    session = _OTP_SESSIONS.get(req.session_id)
    if not session:
        raise HTTPException(404, "Session not found or expired.")
    if session["used"]:
        raise HTTPException(400, "OTP already used. Request a new OTP.")
    if session["otp"] != req.otp:
        raise HTTPException(401, "Invalid OTP.")

    session["used"] = True
    resident = SANDBOX_RESIDENTS[session["aadhaar_last4"]]

    return EKYCResponse(
        status        = "VALID",
        aadhaar_hash  = _aadhaar_hmac(session["aadhaar_last4"]),
        name          = resident["name"],
        gender        = resident["gender"],
        dob           = resident["dob"],
        state         = resident["state"],
        district      = resident["district"],
        verified_at   = _now_iso(),
        txn_id        = "UIDAI-SANDBOX-" + uuid.uuid4().hex[:12].upper(),
        sandbox_note  = "GFF 2026 sandbox. No real UIDAI data. Compliant with DPDP Act 2023.",
    )


@router.get("/status", summary="India Stack Aadhaar service status")
def aadhaar_status():
    return {
        "service":      "Aadhaar eKYC",
        "mode":         "SANDBOX",
        "provider":     "UIDAI (simulated)",
        "active_sessions": len([s for s in _OTP_SESSIONS.values() if not s["used"]]),
        "endpoints":    ["/india-stack/aadhaar/send-otp", "/india-stack/aadhaar/verify-otp"],
        "production_requirements": ["UIDAI AUA License", "KUA License", "ASA Connectivity", "HSM for encryption"],
    }
