"""
Course duration: parse where stated, estimate where not, never fake precision.

Only ~49% of the Coursera catalog exposes a `workload` string, and course
descriptions almost never state a duration (measured: 1%). Measured options
for the remaining half:

    global-median baseline        MAE 5.68h
    tfidf -> ridge (log target)   MAE 4.43h   <- chosen
    bucket classification         MAE 4.86h

Duration is genuinely hard to predict from text -- the same blurb describes
a 2-hour lab or a 20-hour course. So rather than chase accuracy we record
*where the number came from* and surface estimates as ranges. A visible
"~3-6h" is honest; a confident "4.3h" is not.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum

__all__ = ["DurationSource", "Duration", "parse_workload", "GLOBAL_MEDIAN_HOURS"]

GLOBAL_MEDIAN_HOURS = 4.0

# Residual spread of the chosen regressor, used to widen estimated ranges.
_ESTIMATE_LOW = 0.6
_ESTIMATE_HIGH = 1.8


class DurationSource(str, Enum):
    PARSED = "parsed"        # stated by the provider -- exact
    ESTIMATED = "estimated"  # model prediction -- show as a range
    FALLBACK = "fallback"    # nothing to go on -- category median


@dataclass(frozen=True)
class Duration:
    hours: float
    source: DurationSource
    low: float | None = None
    high: float | None = None

    @property
    def is_exact(self) -> bool:
        return self.source is DurationSource.PARSED

    def display(self) -> str:
        """`18h` when known; `~3-6h` when not. The tilde is load-bearing."""
        if self.is_exact:
            return f"{self.hours:g}h"
        if self.low and self.high:
            return f"~{self.low:.0f}-{self.high:.0f}h"
        return f"~{self.hours:.0f}h"

    @classmethod
    def estimated(cls, hours: float) -> "Duration":
        return cls(
            hours=hours,
            source=DurationSource.ESTIMATED,
            low=max(0.5, hours * _ESTIMATE_LOW),
            high=hours * _ESTIMATE_HIGH,
        )

    @classmethod
    def fallback(cls) -> "Duration":
        return cls(
            hours=GLOBAL_MEDIAN_HOURS,
            source=DurationSource.FALLBACK,
            low=1.0,
            high=12.0,
        )


# ── Parsing ──────────────────────────────────────────────────────────────────
# Coursera workload strings are multilingual and inconsistent:
#   "2 hours" | "90 minutes" | "1 Hour" | "2 heures" | "2 horas"
#   "4 weeks of study, 2-3 hours/week"
# These three patterns cover 91% of the 12,866 strings present.

_WEEKS = re.compile(
    r"([\d.]+)\s*weeks?\s*of\s*study.*?([\d.]+)\s*(?:-\s*([\d.]+))?\s*hours?\s*/\s*week",
    re.I,
)
_HOURS = re.compile(r"([\d.]+)\s*(?:hours?|hrs?|heures?|horas?|ore|stunden?)", re.I)
_MINUTES = re.compile(r"([\d.]+)\s*(?:minutes?|mins?|minutos?)", re.I)


def parse_workload(workload: str | None) -> Duration | None:
    """Exact hours from a provider-stated workload string, or None."""
    if not workload:
        return None
    text = workload.strip()

    if m := _WEEKS.search(text):
        weeks = float(m.group(1))
        low = float(m.group(2))
        high = float(m.group(3) or m.group(2))
        hours = weeks * (low + high) / 2
    elif m := _HOURS.search(text):
        hours = float(m.group(1))
    elif m := _MINUTES.search(text):
        hours = float(m.group(1)) / 60
    else:
        return None

    if not 0.2 <= hours <= 200:  # reject nonsense rather than propagate it
        return None
    return Duration(hours=round(hours, 2), source=DurationSource.PARSED)
