"""
Public surface of the adapt module. Deliverable 6.

Dual-graph rerouting: on blockage, query the concept graph for the missing
upstream concept and splice a detour into the active path without disturbing
completed work or downstream order.
"""
from __future__ import annotations

from app.modules.adapt.reroute import detect_stuck, find_bridge_concept, insert_detour

__all__ = ["detect_stuck", "find_bridge_concept", "insert_detour"]
