"""Settings. Keys come from backend/.env and NEVER reach the frontend bundle."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BACKEND_DIR / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "Pathfinder"
    debug: bool = False

    # ── LLM providers ────────────────────────────────────────────────────────
    # Gemini Flash for structured output, Groq for streaming chat.
    google_api_key: str = ""
    groq_api_key: str = ""
    # Verified live 2026-08-25. Model IDs move fast -- these were chosen by
    # measurement, not memory:
    #   gemini-2.5-flash    1.4s, native JSON mode, exact output
    #   gemini-3.6-flash    works but ~17s -- too slow for interactive use
    #   gpt-oss-120b        0.63s on Groq, clean JSON
    #   qwen3.6-27b         faster still but emits <think> blocks
    # Groq no longer serves Llama chat models.
    gemini_model: str = "gemini-2.5-flash"
    groq_model: str = "openai/gpt-oss-120b"

    # ── Catalog providers ────────────────────────────────────────────────────
    youtube_api_key: str = ""          # Coursera + MS Learn need no key

    # ── Supabase (auth + per-user persistence) ───────────────────────────────
    # All optional: when unset, the app runs in guest/demo fallback and never
    # hard-fails. Data access uses the service key over PostgREST (HTTPS), which
    # sidesteps the direct-Postgres IPv6/DNS pain an earlier build hit.
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""      # legacy HS256 projects; JWKS derived from url otherwise

    # ── Retrieval ────────────────────────────────────────────────────────────
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    hybrid_alpha: float = 0.6          # alpha*dense + (1-alpha)*bm25

    # ── 7-factor reranker weights (must sum to 1.0 -- asserted in tests) ─────
    w_skill_coverage: float = 0.30
    w_semantic: float = 0.25
    w_prerequisite: float = 0.15
    w_difficulty: float = 0.10
    w_modality: float = 0.08
    w_quality: float = 0.07
    w_freshness: float = 0.05

    # ── Tagger safety (see plan: the tagger is the highest-risk component) ───
    tag_confidence_threshold: float = 0.55

    # ── Adaptation ───────────────────────────────────────────────────────────
    pass_threshold: float = 0.70
    stuck_threshold: float = 0.50
    stuck_attempts: int = 2
    max_detours_per_skill: int = 1     # guards the infinite-remediation bug

    # ── CORS ─────────────────────────────────────────────────────────────────
    allowed_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def rerank_weights(self) -> dict[str, float]:
        return {
            "skill_coverage": self.w_skill_coverage,
            "semantic": self.w_semantic,
            "prerequisite": self.w_prerequisite,
            "difficulty": self.w_difficulty,
            "modality": self.w_modality,
            "quality": self.w_quality,
            "freshness": self.w_freshness,
        }

    @property
    def has_gemini(self) -> bool:
        return bool(self.google_api_key)

    @property
    def has_groq(self) -> bool:
        return bool(self.groq_api_key)

    @property
    def has_youtube(self) -> bool:
        return bool(self.youtube_api_key)

    @property
    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
