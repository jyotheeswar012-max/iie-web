"""
api/core/utils.py
Shared cryptographic + formatting utilities.
"""
import hashlib, hmac, uuid, time
from datetime import datetime, timezone

SECRET = b"iie-gff-sbi-2026-oracle"

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def hmac_sha256(val: str) -> str:
    return hmac.new(SECRET, val.encode(), hashlib.sha256).hexdigest()

def tx_hash(seed: str) -> str:
    """Unique on-chain tx hash — seed + nanosecond timestamp."""
    return "0x" + sha256(seed + str(time.time_ns()))[:40]

def contract_address(policy_id: str) -> str:
    return "0x" + sha256(policy_id + "contract-v4")[:40]

def block_number() -> int:
    """Simulated block height — increments every ~15 seconds."""
    return 19_823_441 + (int(time.time()) // 15 % 100_000)

def uid(n: int = 8) -> str:
    return uuid.uuid4().hex[:n].upper()

def aadhaar_token(last4: str) -> str:
    """
    DPDP-compliant one-way token. No raw Aadhaar stored.
    Format: AH_<16-char HMAC prefix>
    """
    return "AH_" + hmac_sha256(f"aadhaar:{last4}")[:16]

def digilocker_ref() -> str:
    return "DL-" + uid(10)

def upi_ref() -> str:
    return "UPI-" + uid(10)

def rrn() -> str:
    """RBI Retrieval Reference Number — 12-digit timestamp suffix."""
    return str(int(time.time() * 1000))[-12:]
