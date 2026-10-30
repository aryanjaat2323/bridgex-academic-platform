import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import (
    auth, academic, doubts, duplicates, repository, office_hours, notifications, analytics, admin
)
from app.seed.seed_data import init_db

# Create tables
Base.metadata.create_all(bind=engine)

# Run seed data if database is fresh
try:
    init_db()
except Exception as e:
    print(f"Seed note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BridgeX - Academic Doubt Management & Faculty Consultation SaaS API",
    version="1.0.0"
)

# CORS configuration.
# In production, set ALLOWED_ORIGINS env var to a comma-separated list of allowed origins,
# e.g. "https://aryanjaat2323.github.io,https://your-custom-domain.com"
# In development this defaults to open for convenience — restrict before production deployment.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    _allow_origins = ["*"]
    _allow_credentials = False  # credentials cannot be used with wildcard origins
else:
    _allow_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    _allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(academic.router, prefix=settings.API_V1_STR)
app.include_router(doubts.router, prefix=settings.API_V1_STR)
app.include_router(duplicates.router, prefix=settings.API_V1_STR)
app.include_router(repository.router, prefix=settings.API_V1_STR)
app.include_router(office_hours.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "sla_escalation_threshold_hours": settings.ESCALATION_HOURS_THRESHOLD
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

