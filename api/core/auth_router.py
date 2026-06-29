"""
Auth Router — /auth endpoints for token issuance.

Mount in main.py:
    from core.auth_router import auth_router
    app.include_router(auth_router)
"""

from fastapi import APIRouter, HTTPException, status, Depends
from .auth import TokenRequest, authenticate_user, create_access_token, get_current_user, ROLES

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/token", summary="Issue JWT access token")
def issue_token(req: TokenRequest):
    """
    Exchange username+password for a JWT access token.
    Sandbox credentials:
      - demo / demo2026 (role: demo)
      - farmer1 / farmer2026 (role: farmer)
      - insurer / insure2026 (role: insurer)
      - admin / admin2026 (role: admin)
    """
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    token = create_access_token(user)
    return {
        "access_token": token,
        "token_type":   "bearer",
        "role":         user["role"],
        "permissions":  ROLES.get(user["role"], []),
        "expires_in":   3600,
        "sandbox_note": "GFF 2026 sandbox. Replace with Firebase Auth / Aadhaar OIDC in production.",
    }


@auth_router.get("/me", summary="Get current authenticated user")
def get_me(user: dict = Depends(get_current_user)):
    return {
        "sub":         user.get("sub"),
        "role":        user.get("role"),
        "permissions": ROLES.get(user.get("role", ""), []),
        "issued_at":   user.get("iat"),
        "expires_at":  user.get("exp"),
    }


@auth_router.get("/sandbox-users", summary="List sandbox demo users (GFF demo only)")
def sandbox_users():
    return {
        "note": "GFF 2026 sandbox credentials only. Do NOT use in production.",
        "users": [
            {"username": "demo",    "password": "demo2026",   "role": "demo"},
            {"username": "farmer1", "password": "farmer2026", "role": "farmer"},
            {"username": "insurer", "password": "insure2026", "role": "insurer"},
        ]
    }
