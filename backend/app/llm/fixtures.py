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
    "machine learning engineer": "ml-engineer",
    "ml engineer": "ml-engineer",
    "ai engineer": "ml-engineer",
    "deep learning engineer": "ml-engineer",
    "artificial intelligence": "ml-engineer",
}


def match_seeded_track(goal_text: str) -> str | None:
    g = goal_text.lower()
    for phrase, track_id in TRACK_ALIASES.items():
        if phrase in g:
            return track_id
    return None
