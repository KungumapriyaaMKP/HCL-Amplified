"""
Public surface of the Socratic module.

Provides guided scaffolding dialogues on incorrect diagnostic and quiz attempts
without revealing direct answers.
"""
from __future__ import annotations

from app.modules.socratic.tutor import guide

__all__ = ["guide"]
