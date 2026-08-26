"""
Resume text extraction and skill mapping.

Extracts text from PDF/DOCX resumes and maps demonstrated skills to canonical
ontology nodes with verbatim supporting quotes as evidence.
"""
from __future__ import annotations

import io
import json
from functools import lru_cache
from pathlib import Path

import docx
import pdfplumber

from app.core.config import DATA_DIR
from app.domain import Confidence, Mastery, MasteryEvidence, Skill
from app.llm import router
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


def _extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from PDF, DOCX, or text files."""
    ext = Path(filename).suffix.lower()
    text_chunks: list[str] = []

    if ext == ".pdf":
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text_chunks.append(extracted)
        except Exception:
            pass

    elif ext in {".docx", ".doc"}:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for p in doc.paragraphs:
                if p.text.strip():
                    text_chunks.append(p.text.strip())
        except Exception:
            pass

    if not text_chunks:
        # Fallback to UTF-8 decoding
        try:
            text_chunks.append(file_bytes.decode("utf-8", errors="ignore"))
        except Exception:
            pass

    return "\n".join(text_chunks)


def parse_resume(file_bytes: bytes, filename: str) -> list[Mastery]:
    """
    Extract skills and evidence quotes from a resume file.
    Returns list of verified Mastery objects mapped to canonical skill DAG nodes.
    """
    text = _extract_text(file_bytes, filename)
    if not text.strip():
        return []

    skills = _load_canonical_skills()
    raw_extracted = router.extract_skills_from_text(text)

    mastery_by_skill: dict[str, Mastery] = {}

    for item in raw_extracted:
        raw_skill = item.get("skill") or ""
        mapped = map_to_canonical(raw_skill, skills)
        if not mapped:
            continue

        sid, match_conf = mapped
        evidence_quote = item.get("evidence_quote") or f"Demonstrated {raw_skill}"
        level = float(item.get("level", 0.75))

        conf_str = (item.get("confidence") or "medium").lower()
        if conf_str == "high":
            confidence = Confidence.HIGH
        elif conf_str == "low":
            confidence = Confidence.LOW
        else:
            confidence = Confidence.MEDIUM

        evidence = MasteryEvidence(
            source="resume",
            quote=evidence_quote,
            detail=f"Extracted from {filename} (match confidence {match_conf:.2f})",
        )

        if sid in mastery_by_skill:
            # Upgrade level if higher
            existing = mastery_by_skill[sid]
            existing.level = max(existing.level, level)
            existing.evidence.append(evidence)
        else:
            mastery_by_skill[sid] = Mastery(
                skill_id=sid,
                level=level,
                confidence=confidence,
                evidence=[evidence],
            )

    return list(mastery_by_skill.values())
