"""
GitHub public profile analyzer.

Analyzes public repositories, programming languages, topics, and frameworks
via the public GitHub REST API without requiring OAuth authentication.
"""
from __future__ import annotations

import json
from collections import Counter
from functools import lru_cache

import httpx

from app.core.config import DATA_DIR
from app.domain import Confidence, Mastery, MasteryEvidence, Skill
from app.modules.profiling.canonical import map_to_canonical


@lru_cache(maxsize=1)
def _load_canonical_skills() -> dict[str, Skill]:
    path = DATA_DIR / "skills.json"
    if path.exists():
        rows = json.loads(path.read_text(encoding="utf-8"))
        return {
            r["id"]: Skill(
                id=r["id"],
                name=r["name"],
                category=r["topic"],
                description=r["description"],
                prerequisites=r["prerequisites"],
                is_programming=r["is_programming"],
                topic=r["topic"],
            )
            for r in rows
        }
    return {}


def profile_github(username: str) -> list[Mastery]:
    """
    Fetch and analyze public GitHub activity for a username.
    Returns list of verified Mastery objects with provenance quotes.
    """
    clean_user = username.strip().lstrip("@")
    if not clean_user:
        return []

    skills = _load_canonical_skills()
    mastery_by_skill: dict[str, Mastery] = {}

    repos: list[dict] = []
    try:
        url = f"https://api.github.com/users/{clean_user}/repos?per_page=100&sort=updated"
        headers = {"User-Agent": "Pathfinder-Profiler/1.0", "Accept": "application/vnd.github.v3+json"}
        with httpx.Client(timeout=6.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                repos = resp.json()
    except Exception:
        pass

    if not repos:
        # Graceful heuristic fallback if GitHub API rate-limits or is unreachable
        return []

    lang_counts: Counter[str] = Counter()
    topics_set: set[str] = set()

    for repo in repos:
        lang = repo.get("language")
        if lang:
            lang_counts[lang] += 1

        for topic in repo.get("topics", []):
            topics_set.add(topic.lower())

        desc = (repo.get("description") or "").lower()
        if "docker" in desc:
            topics_set.add("docker")
        if "pytorch" in desc:
            topics_set.add("pytorch")
        if "kubernetes" in desc or "k8s" in desc:
            topics_set.add("kubernetes")
        if "fastapi" in desc:
            topics_set.add("fastapi")
        if "react" in desc:
            topics_set.add("react")
        if "spark" in desc:
            topics_set.add("spark")
        if "kafka" in desc:
            topics_set.add("kafka")

    # Map languages
    for lang, count in lang_counts.items():
        mapped = map_to_canonical(lang, skills)
        if mapped:
            sid, _ = mapped
            level = min(0.95, 0.65 + (count * 0.05))
            evidence = MasteryEvidence(
                source="github",
                quote=f"{count} public repositories with primary language {lang}",
                detail=f"GitHub user @{clean_user}",
            )
            mastery_by_skill[sid] = Mastery(
                skill_id=sid,
                level=round(level, 2),
                confidence=Confidence.MEDIUM,
                evidence=[evidence],
            )

    # Map topics & frameworks
    for topic in topics_set:
        mapped = map_to_canonical(topic, skills)
        if mapped:
            sid, _ = mapped
            if sid not in mastery_by_skill:
                evidence = MasteryEvidence(
                    source="github",
                    quote=f"Identified in repository topics and descriptions: {topic}",
                    detail=f"GitHub user @{clean_user}",
                )
                mastery_by_skill[sid] = Mastery(
                    skill_id=sid,
                    level=0.75,
                    confidence=Confidence.MEDIUM,
                    evidence=[evidence],
                )

    return list(mastery_by_skill.values())
