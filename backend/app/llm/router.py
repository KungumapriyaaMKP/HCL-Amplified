"""
Provider router -- the ONLY module that calls an LLM SDK (coupling rule 3).

Fallback chain for structured decomposition:
    Gemini 2.5 Flash (native JSON)  ->  Groq gpt-oss-120b  ->  raise

Seeded tracks short-circuit the whole chain: a goal that matches a
pre-authored track returns deterministically without any network call, which
is both faster and unfailable for the demo path.
"""
from __future__ import annotations

import json

from app.core.config import settings
from app.llm.fixtures import match_seeded_track

# JSON schema the decomposer must return
_DECOMPOSE_INSTRUCTION = """You are a curriculum architect. Decompose the \
learner's career goal into granular, canonical skills.

Return ONLY JSON of the form:
{"role": "<role name>", "skills": [{"id": "<kebab-case-skill-id>", \
"name": "<skill name>", "required": <0.0-1.0>, "importance": <0.0-1.0>}]}

Use between 15 and 40 skills. `required` is the target mastery; `importance` \
is how central the skill is to the role."""


def match_track(goal_text: str) -> str | None:
    """Deterministic fast path -- returns a seeded track id or None."""
    return match_seeded_track(goal_text)


def decompose_goal(goal_text: str) -> dict:
    """
    Decompose a free-text goal into canonical skills via the LLM.

    Only called for goals that do NOT match a seeded track (the caller checks
    match_track first). Raises if every provider fails -- the caller decides
    whether to surface an error or fall back to a default track.
    """
    if settings.has_gemini:
        try:
            return _decompose_gemini(goal_text)
        except Exception:
            pass
    if settings.has_groq:
        try:
            return _decompose_groq(goal_text)
        except Exception:
            pass
    raise RuntimeError("no LLM provider available for goal decomposition")


def _decompose_gemini(goal_text: str) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.google_api_key)
    resp = client.models.generate_content(
        model=settings.gemini_model,
        contents=f"{_DECOMPOSE_INSTRUCTION}\n\nGoal: {goal_text}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json", temperature=0.2
        ),
    )
    return json.loads(resp.text)


def _decompose_groq(goal_text: str) -> dict:
    from groq import Groq

    client = Groq(api_key=settings.groq_api_key)
    resp = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": _DECOMPOSE_INSTRUCTION},
            {"role": "user", "content": f"Goal: {goal_text}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(resp.choices[0].message.content)
