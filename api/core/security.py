"""
Security middleware — rate limiting, CORS hardening, request ID injection.

Integration with main.py:
    from core.security import setup_security
    setup_security(app)  # call after app = FastAPI()
"""

import os
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# ---------------------------------------------------------------------------
# CORS (tighten origins in production)
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,https://iie-web.vercel.app,https://iie-web-git-main.vercel.app"
).split(",")


# ---------------------------------------------------------------------------
# REQUEST ID + TIMING MIDDLEWARE
# ---------------------------------------------------------------------------
class RequestIDMiddleware(BaseHTTPMiddleware):
    """Injects X-Request-ID and X-Response-Time into every response."""

    async def dispatch(self, request: Request, call_next):
        import time
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        start = time.perf_counter()
        response: Response = await call_next(request)
        elapsed = round((time.perf_counter() - start) * 1000, 1)
        response.headers["X-Request-ID"]    = request_id
        response.headers["X-Response-Time"] = f"{elapsed}ms"
        return response


# ---------------------------------------------------------------------------
# RATE LIMITER (slowapi)
# ---------------------------------------------------------------------------
def _make_limiter():
    try:
        from slowapi import Limiter
        from slowapi.util import get_remote_address
        return Limiter(key_func=get_remote_address)
    except ImportError:
        print("[Security] slowapi not installed — rate limiting disabled. Run: pip install slowapi")
        return None

limiter = _make_limiter()


# ---------------------------------------------------------------------------
# SETUP FUNCTION
# ---------------------------------------------------------------------------
def setup_security(app: FastAPI):
    """Call once after app = FastAPI() to attach all security middleware."""

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins    = ALLOWED_ORIGINS,
        allow_credentials= True,
        allow_methods    = ["GET", "POST", "OPTIONS"],
        allow_headers    = ["*"],
    )

    # Request ID + timing
    app.add_middleware(RequestIDMiddleware)

    # Rate limiter (if available)
    if limiter is not None:
        try:
            from slowapi import _rate_limit_exceeded_handler
            from slowapi.errors import RateLimitExceeded
            app.state.limiter = limiter
            app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        except Exception as e:
            print(f"[Security] slowapi setup warning: {e}")

    print(f"[Security] CORS origins: {ALLOWED_ORIGINS}")
    print(f"[Security] Rate limiter: {'enabled' if limiter else 'disabled'}")
    return app
