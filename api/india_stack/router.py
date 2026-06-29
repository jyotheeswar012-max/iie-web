"""
India Stack Router — mounts Aadhaar + DigiLocker under /india-stack prefix.
Import and include this router in api/main.py.

Usage in main.py:
    from india_stack.router import india_stack_router
    app.include_router(india_stack_router)
"""

from fastapi import APIRouter
from .aadhaar_mock import router as aadhaar_router
from .digilocker_mock import router as digilocker_router

india_stack_router = APIRouter()
india_stack_router.include_router(aadhaar_router)
india_stack_router.include_router(digilocker_router)
