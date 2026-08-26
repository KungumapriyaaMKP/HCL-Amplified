"""
Supabase JWT verification -> a trusted user id.

The frontend handles sign-up / sign-in via Supabase Auth and sends the
session JWT as `Authorization: Bearer <token>`. Here we verify the signature
so `user_id` cannot be spoofed, then hand it to routes as a FastAPI
dependency.

Two signing schemes are supported because Supabase changed defaults:
  - legacy projects sign HS256 with the shared JWT secret
  - newer projects use asymmetric keys, verified against the project JWKS
We try the shared secret first (if provided), then JWKS.

When Supabase is unconfigured, `current_user` returns the demo learner so
the whole app still runs -- guest/demo fallback, never a hard failure.
"""
from __future__ import annotations

from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, Request

from app.core.config import settings

DEMO_USER = "demo"


@lru_cache(maxsize=1)
def _jwks_client() -> "jwt.PyJWKClient | None":
    if not settings.supabase_url:
        return None
    url = settings.supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json"
    return jwt.PyJWKClient(url)


def verify_jwt(token: str) -> str:
    """Return the Supabase user id (`sub`) from a valid token, or raise."""
    # 1. legacy HS256 shared secret
    if settings.supabase_jwt_secret:
        try:
            claims = jwt.decode(
                token, settings.supabase_jwt_secret, algorithms=["HS256"],
                audience="authenticated", options={"verify_aud": False},
            )
            return claims["sub"]
        except jwt.InvalidTokenError:
            pass  # fall through to JWKS

    # 2. asymmetric via JWKS
    jwks = _jwks_client()
    if jwks is not None:
        try:
            key = jwks.get_signing_key_from_jwt(token).key
            claims = jwt.decode(
                token, key, algorithms=["ES256", "RS256"],
                options={"verify_aud": False},
            )
            return claims["sub"]
        except jwt.PyJWTError as exc:
            raise HTTPException(status_code=401, detail="invalid token") from exc

    raise HTTPException(status_code=401, detail="token verification unavailable")


def _bearer(request: Request) -> str | None:
    header = request.headers.get("authorization", "")
    if header.lower().startswith("bearer "):
        return header[7:].strip()
    return None


def current_user(request: Request) -> str:
    """
    FastAPI dependency. Returns the verified user id, or the demo learner
    when Supabase is off. Use for routes that read/write per-user data but
    should still work in guest mode.
    """
    if not settings.has_supabase:
        return DEMO_USER
    token = _bearer(request)
    if not token:
        return DEMO_USER  # guest -- allowed to browse; writes are per-guest
    return verify_jwt(token)


def require_user(user: str = Depends(current_user)) -> str:
    """Stricter variant: reject guests. For routes that must have an account."""
    if user == DEMO_USER and settings.has_supabase:
        raise HTTPException(status_code=401, detail="authentication required")
    return user
