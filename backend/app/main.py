"""
Pathfinder API.

Architecture (see plan Part 0.6): a modular monolith. Each bounded context
under app/modules/ exposes an interface.py and never reaches into another's
internals -- enforced by tests/test_architecture.py.

This layer is deliberately thin: it speaks HTTP and nothing else.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import account as account_routes
from app.api.routes import chat as chat_routes
from app.api.routes import diagnostic as diagnostic_routes
from app.api.routes import gamification as gamification_routes
from app.api.routes import plan as plan_routes
from app.api.routes import poincare as poincare_routes
from app.api.routes import profile as profile_routes
from app.api.routes import socratic as socratic_routes
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm the hot index and embedding model here so the first real request
    # is fast. Vectors are precomputed offline and committed -- never encoded
    # at boot, which would make every cold start 30s+ on HF Spaces.
    yield


app = FastAPI(
    title="Pathfinder API",
    description="AI-powered personalised learning path recommender",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


app.include_router(plan_routes.router, prefix="/api")
app.include_router(account_routes.router, prefix="/api")
app.include_router(profile_routes.router, prefix="/api")
app.include_router(diagnostic_routes.router, prefix="/api")
app.include_router(socratic_routes.router, prefix="/api")
app.include_router(chat_routes.chat_router, prefix="/api")
app.include_router(gamification_routes.router, prefix="/api")
app.include_router(poincare_routes.router, prefix="/api")


@app.get("/api/health")
async def health() -> dict:
    """Liveness plus a capability read-out, so a cold deploy is diagnosable."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "providers": {
            "gemini": settings.has_gemini,
            "groq": settings.has_groq,
            "youtube": settings.has_youtube,
            "supabase": settings.has_supabase,
        },
    }
