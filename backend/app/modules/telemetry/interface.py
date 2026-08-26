"""
Public surface of the telemetry module. F1 + F8.

One event stream feeds decay, analytics and stuck detection. Three
feature-specific tables would be the wrong shape.
"""
from __future__ import annotations

from app.modules.telemetry.store import (
    activity_grid,
    events_for,
    record,
    retention,
    review_urgency,
)

__all__ = ["record", "events_for", "retention", "review_urgency", "activity_grid"]
