"""
Difficulty inference from title/description keywords.

Coursera exposes no difficulty field, and there is no labelled data to train
a classifier on, so this is an honest keyword heuristic rather than a trained
model dressed up as one. Unknown difficulty stays None and the reranker
treats it as neutral -- we do not guess a tier we cannot support.
"""
from __future__ import annotations

import re

from app.domain import Difficulty

_ADVANCED = re.compile(
    r"\b(advanced|expert|mastering|master class|masterclass|in depth|"
    r"deep dive|professional|graduate)\b", re.I,
)
_BEGINNER = re.compile(
    r"\b(beginner|introduction|introductory|intro to|fundamental|basics|"
    r"getting started|for everyone|101|first steps|foundations?)\b", re.I,
)


def infer_difficulty(title: str, description: str = "") -> Difficulty | None:
    text = f"{title} {description[:200]}"
    if _ADVANCED.search(text):
        return Difficulty.ADVANCED
    if _BEGINNER.search(text):
        return Difficulty.BEGINNER
    return None  # unknown -> neutral in scoring, never a false tier
