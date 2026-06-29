"""
DigiLocker Sandbox Mock — IIE GFF 2026

Simulates DigiLocker document fetch API.
In production: replace with DigiLocker Pull API (NIC/MeitY OAuth 2.0).
Returns structured document data for land records, Aadhaar XML, PAN, voter ID.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/india-stack/digilocker", tags=["India Stack – DigiLocker"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# SANDBOX DOCUMENT STORE
# ---------------------------------------------------------------------------
MOCK_DOCUMENTS = {
    "LAND_RECORD": {
        "doc_type":    "ROR (Record of Rights)",
        "issued_by":   "Department of Land Records, GoI",
        "survey_no":   "147/B",
        "khata_no":    "KH-2091",
        "area_acres":  4.5,
        "crop_season": "Kharif 2025-26",
        "owner_name":  "Ramesh Kumar",
        "taluk":       "Warangal Urban",
        "district":    "Warangal",
        "state":       "Telangana",
        "verified":    True,
    },
    "AADHAAR_XML": {
        "doc_type":    "Aadhaar e-Document (XML)",
        "issued_by":   "UIDAI",
        "uid_hash":    "AH_e3f1a9b2c4d5",  # Always hashed — no raw UID
        "name":        "Ramesh Kumar",
        "dob":         "1985-06-12",
        "gender":      "M",
        "address": {
            "house":   "12-45, Hanamkonda",
            "district":"Warangal",
            "state":   "Telangana",
            "pincode": "506001",
        },
        "photo_hash":  "PHO_" + uuid.uuid4().hex[:16],  # Photo hash (not base64 image in sandbox)
    },
    "PAN": {
        "doc_type":    "Permanent Account Number",
        "issued_by":   "Income Tax Department, CBDT",
        "pan_masked":  "ABCPK1234F",  # Masked per IT guidelines
        "name":        "Ramesh Kumar",
        "dob":         "1985-06-12",
        "father_name": "Suresh Kumar",
        "status":      "ACTIVE",
    },
    "VOTER_ID": {
        "doc_type":    "Elector Photo Identity Card (EPIC)",
        "issued_by":   "Election Commission of India",
        "epic_no":     "TG/06/2019/0012345",
        "name":        "Ramesh Kumar",
        "father_name": "Suresh Kumar",
        "dob":         "1985-06-12",
        "constituency":"Warangal East",
        "state":       "Telangana",
    },
    "PMFBY_POLICY": {
        "doc_type":    "PMFBY Insurance Certificate",
        "issued_by":   "Ministry of Agriculture & Farmers Welfare",
        "scheme":      "Pradhan Mantri Fasal Bima Yojana",
        "season":      "Kharif 2025-26",
        "crop":        "Paddy",
        "sum_insured": 70000,
        "premium_paid":1260,
        "district":    "Warangal",
        "state":       "Telangana",
        "bank":        "State Bank of India",
        "status":      "ACTIVE",
    },
}


# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------
class FetchRequest(BaseModel):
    aadhaar_last4:  str
    doc_type:       str  # LAND_RECORD | AADHAAR_XML | PAN | VOTER_ID | PMFBY_POLICY
    consent:        bool
    purpose:        str = "Insurance enrollment"


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------
@router.post("/fetch", summary="Fetch document from DigiLocker (sandbox)")
def fetch_document(req: FetchRequest):
    """
    Fetch a specific document type from DigiLocker.
    Consent is mandatory per IT Act 2000 + DPDP Act 2023.
    """
    if not req.consent:
        raise HTTPException(400, "Explicit user consent required to fetch documents from DigiLocker.")

    doc = MOCK_DOCUMENTS.get(req.doc_type.upper())
    if not doc:
        raise HTTPException(
            404,
            f"Document type '{req.doc_type}' not found. Available: {list(MOCK_DOCUMENTS.keys())}"
        )

    return {
        "success":       True,
        "request_id":    "DL-" + uuid.uuid4().hex[:12].upper(),
        "doc_type":      req.doc_type.upper(),
        "fetched_at":    _now_iso(),
        "consent_given": req.consent,
        "purpose":       req.purpose,
        "document":      doc,
        "sandbox_note":  "GFF 2026 sandbox. Production requires DigiLocker Pull API OAuth 2.0 integration via NIC.",
    }


@router.get("/available-docs", summary="List all fetchable document types")
def list_docs():
    return {
        "available_documents": list(MOCK_DOCUMENTS.keys()),
        "descriptions": {
            "LAND_RECORD":  "ROR (Record of Rights) — land ownership proof for PMFBY enrollment",
            "AADHAAR_XML":  "Aadhaar eDocument XML — identity verification",
            "PAN":          "PAN card — tax + subsidy eligibility",
            "VOTER_ID":     "EPIC card — alternate identity proof",
            "PMFBY_POLICY": "Existing PMFBY insurance certificate — policy continuity check",
        },
    }


@router.get("/status", summary="DigiLocker service health")
def digilocker_status():
    return {
        "service":   "DigiLocker Pull API",
        "mode":      "SANDBOX",
        "provider":  "NIC / MeitY (simulated)",
        "total_docs":len(MOCK_DOCUMENTS),
        "production_requirements": [
            "DigiLocker Issuer/Requester API credentials",
            "OAuth 2.0 integration with accounts.digitallocker.gov.in",
            "XML/JSON document parser per doc schema",
        ],
    }
