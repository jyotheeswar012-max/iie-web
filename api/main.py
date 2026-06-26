from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import risk, enrollment, payouts

app = FastAPI(title="Invisible Insurance Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk.router,       prefix="/risk",       tags=["Risk"])
app.include_router(enrollment.router, prefix="/enrollment", tags=["Enrollment"])
app.include_router(payouts.router,    prefix="/payouts",    tags=["Payouts"])

@app.get("/")
def root():
    return {"status": "Invisible Insurance Engine API is live", "version": "1.0.0"}
