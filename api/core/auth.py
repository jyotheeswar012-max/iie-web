"""
JWT Authentication — IIE GFF 2026

Issues HS256 JWT tokens. In production, replace with:
  - Firebase Auth (already in your stack) OR
  - OIDC via Aadhaar eKYC verified identity.

Usage:
  token = create_access_token({"sub": "farmer-uid-123", "role": "farmer"})
  payload = verify_token(token)  # raises 401 if invalid/expired

FastAPI dependency injection:
  @app.get("/protected")
  async def protected(user=Depends(get_current_user)):
      ...
"""

import os
import time
import hashlib
import hmac
import base64
import json
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Optional

# ---------------------------------------------------------------------------
# CONFIG (from environment — never hardcode secrets)
# ---------------------------------------------------------------------------
JWT_SECRET      = os.getenv("JWT_SECRET", "iie-dev-secret-change-in-production-2026")
JWT_ALGORITHM   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

API_KEY         = os.getenv("IIE_API_KEY", "iie-demo-key-2026")

security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# ROLES
# ---------------------------------------------------------------------------
ROLES = {
    "farmer":   ["read:policy", "read:oracle", "write:enroll"],
    "insurer":  ["read:policy", "read:oracle", "write:contract", "read:audit"],
    "admin":    ["*"],
    "demo":     ["read:policy", "read:oracle", "read:audit", "write:enroll"],  # GFF demo role
}

# ---------------------------------------------------------------------------
# PURE-PYTHON JWT (no external lib — keeps deployment dependency-free)
# Uses python-jose if available, else native HMAC
# ---------------------------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + "=" * padding)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = dict(data)
    expire  = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload.update({"exp": int(expire.timestamp()), "iat": int(time.time()), "iss": "iie-gff-2026"})

    header  = _b64url_encode(json.dumps({"alg": JWT_ALGORITHM, "typ": "JWT"}).encode())
    body    = _b64url_encode(json.dumps(payload).encode())
    sig_input = f"{header}.{body}".encode()
    sig     = _b64url_encode(hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest())
    return f"{header}.{body}.{sig}"


def verify_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Malformed token")
        header, body, sig = parts
        sig_input = f"{header}.{body}".encode()
        expected  = _b64url_encode(hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            raise ValueError("Invalid signature")
        payload = json.loads(_b64url_decode(body))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        return payload
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# FASTAPI DEPENDENCIES
# ---------------------------------------------------------------------------

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency: validates Bearer JWT. Use as Depends(get_current_user)."""
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bearer token required")
    return verify_token(credentials.credentials)


def require_role(required_role: str):
    """Dependency factory: enforces role. Use as Depends(require_role('admin'))."""
    def _check(user: dict = Depends(get_current_user)):
        role = user.get("role", "")
        permissions = ROLES.get(role, [])
        if "*" not in permissions and required_role not in permissions:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Role '{role}' lacks permission '{required_role}'")
        return user
    return _check


def verify_api_key(x_api_key: Optional[str] = None) -> bool:
    """Verify X-API-Key header for service-to-service calls."""
    if x_api_key != API_KEY:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")
    return True


# ---------------------------------------------------------------------------
# TOKEN ENDPOINT MODELS
# ---------------------------------------------------------------------------

class TokenRequest(BaseModel):
    username: str
    password: str
    role:     str = "demo"


# Sandbox user store (production: replace with DB + bcrypt)
SANDBOX_USERS = {
    "demo":    {"password": "demo2026",   "role": "demo"},
    "farmer1": {"password": "farmer2026", "role": "farmer"},
    "insurer": {"password": "insure2026", "role": "insurer"},
    "admin":   {"password": "admin2026",  "role": "admin"},
}


def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = SANDBOX_USERS.get(username)
    if not user or user["password"] != password:
        return None
    return {"sub": username, "role": user["role"]}
