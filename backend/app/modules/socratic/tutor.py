"""
Socratic pedagogical tutor implementation.

Maps common conceptual misconceptions and generates guided scaffolding prompts
that steer the student toward discovery without revealing the correct answer.
"""
from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from app.core.config import DATA_DIR
from app.llm import router


@lru_cache(maxsize=1)
def _load_misconceptions() -> dict[str, dict[str, str]]:
    path = DATA_DIR / "misconceptions.json"
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def guide(
    skill_id: str,
    skill_name: str,
    chosen_answer: str,
    question: str,
    correct_answer: str = "",
) -> dict[str, Any]:
    """
    Generate non-revealing scaffolding dialogue and visual mismatch diagram.
    """
    misconceptions = _load_misconceptions()
    skill_mis = misconceptions.get(skill_id, {})

    guidance = router.generate_socratic_guidance(
        skill_name=skill_name,
        chosen_answer=chosen_answer,
        question=question,
        correct_answer=correct_answer or "Core invariant of the skill",
    )

    # Attach known misconception label if matched
    matched_label = None
    for label, desc in skill_mis.items():
        if any(w in chosen_answer.lower() for w in label.split("_")):
            matched_label = desc
            break

    if matched_label and "conceptual_hint" in guidance:
        guidance["conceptual_hint"] = f"{guidance['conceptual_hint']} (Note: {matched_label})"

    return guidance
