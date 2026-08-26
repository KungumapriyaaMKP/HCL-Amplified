"""
Cached LLM responses for canonical demo goals.

The demo must never hard-fail on a rate limit mid-judging. When every
provider is unreachable, the router falls back to these. They are also the
fast path for the pre-seeded tracks: an "ML Engineer" goal need not call an
LLM at all -- it maps directly to the authored track.
"""
from __future__ import annotations

# goal phrase (lowercased substring) -> track id
TRACK_ALIASES: dict[str, str] = {
    # ML / AI
    "machine learning engineer": "ml-engineer",
    "ml engineer": "ml-engineer",
    "ai engineer": "ml-engineer",
    "deep learning engineer": "ml-engineer",
    "artificial intelligence": "ml-engineer",
    # Full-Stack Web & AI
    "full-stack engineer": "full-stack-engineer",
    "full stack engineer": "full-stack-engineer",
    "full-stack developer": "full-stack-engineer",
    "full stack developer": "full-stack-engineer",
    "fullstack": "full-stack-engineer",
    "frontend developer": "full-stack-engineer",
    "web developer": "full-stack-engineer",
    "react developer": "full-stack-engineer",
    "software engineer": "full-stack-engineer",
    # Cloud / DevOps
    "cloud engineer": "cloud-devops-engineer",
    "devops engineer": "cloud-devops-engineer",
    "devops": "cloud-devops-engineer",
    "site reliability engineer": "cloud-devops-engineer",
    "sre": "cloud-devops-engineer",
    "cloud architect": "cloud-devops-engineer",
    "infrastructure engineer": "cloud-devops-engineer",
    # Data Engineering
    "data engineer": "data-engineer",
    "data engineering": "data-engineer",
    "big data engineer": "data-engineer",
    "analytics engineer": "data-engineer",
    "data platform engineer": "data-engineer",
}


def match_seeded_track(goal_text: str) -> str | None:
    g = goal_text.lower()
    for phrase, track_id in TRACK_ALIASES.items():
        if phrase in g:
            return track_id
    return None
