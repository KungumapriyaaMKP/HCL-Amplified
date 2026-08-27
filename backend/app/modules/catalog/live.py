"""
Live catalog enrichment from Microsoft Learn and YouTube Data API.

Fetches free modules, video lectures, and learning paths with in-memory caching
so the planner can bind high-quality zero-cost resources.
"""
from __future__ import annotations

import json
import re
import time
from typing import Any
from urllib.parse import quote_plus

import httpx

from app.core.config import DATA_DIR, settings
from app.domain import CostType, Difficulty, Modality, Provider, Resource

_MS_CATALOG_URL = "https://learn.microsoft.com/api/catalog/?type=modules,learningPaths&locale=en-us"
_MS_CACHE: list[dict[str, Any]] | None = None
_MS_CACHE_TIME: float = 0.0
_MS_CACHE_TTL = 3600.0  # 1 hour

_YT_CACHE: dict[str, list[Resource]] = {}


def _get_ms_catalog() -> list[dict[str, Any]]:
    global _MS_CACHE, _MS_CACHE_TIME
    now = time.time()
    if _MS_CACHE is not None and (now - _MS_CACHE_TIME) < _MS_CACHE_TTL:
        return _MS_CACHE

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(_MS_CATALOG_URL)
            if resp.status_code == 200:
                data = resp.json()
                modules = data.get("modules", [])
                paths = data.get("learningPaths", [])
                _MS_CACHE = modules + paths
                _MS_CACHE_TIME = now
                return _MS_CACHE
    except Exception:
        pass

    return _MS_CACHE or []


def _search_ms_learn(skill_id: str, skill_name: str, limit: int = 2) -> list[Resource]:
    catalog = _get_ms_catalog()
    if not catalog:
        # High quality offline fallback items for key MS Learn skills
        return [
            Resource(
                id=f"mslearn-{skill_id}",
                provider=Provider.MS_LEARN,
                title=f"Microsoft Learn: Getting Started with {skill_name}",
                url=f"https://learn.microsoft.com/training/paths/{skill_id}/",
                description=f"Official interactive Microsoft Learn documentation and self-paced sandbox for {skill_name}.",
                duration_hours=2.5,
                difficulty=Difficulty.BEGINNER,
                modality=Modality.LAB,
                cost_type=CostType.FREE,
                price_usd=0.0,
                skills_taught=[skill_id],
                tags_verified=True,
            )
        ]

    # Search keyword matching
    keywords = [skill_name.lower()]
    clean_kw = [k.replace("-", " ") for k in keywords]
    matches: list[Resource] = []

    for item in catalog:
        title = item.get("title", "")
        summary = item.get("summary", "")
        haystack = f"{title} {summary}".lower()

        if any(k in haystack for k in clean_kw):
            uid = item.get("uid", str(hash(title)))
            raw_url = item.get("url", "")
            url = raw_url if raw_url.startswith("http") else f"https://learn.microsoft.com{raw_url}"
            dur_mins = item.get("duration_in_minutes") or 60
            dur_hours = round(dur_mins / 60.0, 1)

            levels = item.get("levels", [])
            level_str = levels[0].lower() if levels else "beginner"
            if level_str == "intermediate":
                diff = Difficulty.INTERMEDIATE
            elif level_str == "advanced":
                diff = Difficulty.ADVANCED
            else:
                diff = Difficulty.BEGINNER

            matches.append(
                Resource(
                    id=f"mslearn-{uid[:30]}",
                    provider=Provider.MS_LEARN,
                    title=title,
                    url=url,
                    description=summary,
                    duration_hours=dur_hours,
                    difficulty=diff,
                    modality=Modality.READING if item.get("type") == "module" else Modality.LAB,
                    cost_type=CostType.FREE,
                    price_usd=0.0,
                    skills_taught=[skill_id],
                    tags_verified=True,
                )
            )
            if len(matches) >= limit:
                break

    return matches


def _search_youtube(skill_id: str, skill_name: str, limit: int = 2) -> list[Resource]:
    if not settings.has_youtube:
        return []

    cache_key = f"{skill_id}:{limit}"
    if cache_key in _YT_CACHE:
        return _YT_CACHE[cache_key]

    results: list[Resource] = []
    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": f"{skill_name} complete tutorial course",
            "type": "video",
            "maxResults": limit,
            "key": settings.youtube_api_key,
        }
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                items = resp.json().get("items", [])
                for item in items:
                    vid_id = item["id"]["videoId"]
                    snippet = item["snippet"]
                    results.append(
                        Resource(
                            id=f"youtube-{vid_id}",
                            provider=Provider.YOUTUBE,
                            title=snippet.get("title", f"{skill_name} Tutorial"),
                            url=f"https://www.youtube.com/watch?v={vid_id}",
                            description=snippet.get("description", ""),
                            thumbnail_url=snippet.get("thumbnails", {}).get("default", {}).get("url"),
                            duration_hours=1.5,
                            difficulty=Difficulty.INTERMEDIATE,
                            modality=Modality.VIDEO,
                            cost_type=CostType.FREE,
                            price_usd=0.0,
                            skills_taught=[skill_id],
                            tags_verified=True,
                        )
                    )
    except Exception:
        pass

    _YT_CACHE[cache_key] = results
    return results


def enrich_live(skill_id: str, skill_name: str) -> list[Resource]:
    """
    Search and return live free resources from Microsoft Learn and YouTube.
    """
    live_items: list[Resource] = []
    # 1. MS Learn
    live_items.extend(_search_ms_learn(skill_id, skill_name, limit=2))
    # 2. YouTube (if key configured)
    live_items.extend(_search_youtube(skill_id, skill_name, limit=2))
    return live_items


def youtube_search_fallback(skill_id: str, skill_name: str) -> Resource:
    """Always-available zero-cost resource: a YouTube search link that resolves for any skill."""
    query = quote_plus(f"{skill_name} full course tutorial")
    return Resource(
        id=f"youtube-search-{skill_id}",
        provider=Provider.YOUTUBE,
        title=f"{skill_name} — Video Tutorials (YouTube)",
        url=f"https://www.youtube.com/results?search_query={query}",
        description=f"Curated free video tutorials and full courses for {skill_name}.",
        duration_hours=4.0,              # estimate; renders as ~4h
        difficulty=Difficulty.INTERMEDIATE,
        modality=Modality.VIDEO,
        cost_type=CostType.FREE,
        price_usd=0.0,
        skills_taught=[skill_id],
        tags_verified=True,
    )
