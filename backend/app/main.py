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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        },
    }
