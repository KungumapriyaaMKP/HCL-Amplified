"""
Supabase data client -- the ONLY module that talks to Supabase Postgres,
mirroring the discipline that only llm/ calls LLM providers.

Access is via the service-role key over PostgREST (HTTPS), not a direct
Postgres connection: an earlier build hit IPv6/DNS pain connecting straight
to Supabase Postgres, and HTTPS sidesteps it on the deploy target.

When Supabase is unconfigured the client is None and every caller falls back
to in-memory demo behaviour -- the app never hard-fails on missing config.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Any

from app.core.config import settings


@lru_cache(maxsize=1)
def client() -> Any | None:
    """The service-role Supabase client, or None when unconfigured."""
    if not settings.has_supabase:
        return None
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_key)


def enabled() -> bool:
    return client() is not None
