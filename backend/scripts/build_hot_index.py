"""
Build the hot index: tag the catalog, keep confidently-tagged courses, and
attach inferred difficulty and duration. Committed so the API never tags
23.6k courses at boot.

    python backend/scripts/build_hot_index.py

Writes data/hot_index.json (resources) and data/hot_vectors.npy (aligned).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.modules.catalog.difficulty import infer_difficulty
from app.modules.catalog.duration import Duration, DurationSource, parse_workload

DATA = Path(__file__).resolve().parents[1] / "data"
ART = Path(__file__).resolve().parents[1] / "app" / "ml" / "artifacts"

CATALOG = DATA / "catalog_coursera.jsonl"
VEC = DATA / "catalog_vectors.npy"
IDS = DATA / "catalog_vector_ids.json"
TAGGER = ART / "skill_tagger.joblib"

OUT_INDEX = DATA / "hot_index.json"
OUT_VEC = DATA / "hot_vectors.npy"

# a course joins the hot index if at least one tag clears this bar
THRESHOLD = settings.tag_confidence_threshold
# keep at most this many tags per course (the most confident)
MAX_TAGS = 4


def main() -> int:
    for f in (CATALOG, VEC, IDS, TAGGER):
        if not f.exists():
            print(f"missing {f.name}", file=sys.stderr)
            return 1

    rows = {r["id"]: r for r in (json.loads(l) for l in CATALOG.open(encoding="utf-8"))}
    ids = json.loads(IDS.read_text(encoding="utf-8"))
    vecs = np.load(VEC).astype(np.float32)
    bundle = joblib.load(TAGGER)
    model, skills = bundle["model"], bundle["skills"]
    print(f"catalog {len(rows)}, tagger over {len(skills)} skills, threshold {THRESHOLD}")

    proba = model.predict_proba(vecs)  # (N, n_skills)

    hot: list[dict] = []
    hot_vecs: list[np.ndarray] = []
    non_english = 0
    for i, cid in enumerate(ids):
        row = rows.get(cid)
        if row is None:
            continue
        # English-primary only -- a Hebrew course in an English roadmap is a
        # demo failure, and the catalog carries many translated duplicates
        langs = row.get("languages") or []
        if langs and "en" not in langs:
            non_english += 1
            continue
        scores = proba[i]
        # tags above threshold, most confident first, capped
        ranked = sorted(
            ((skills[j], float(scores[j])) for j in range(len(skills)) if scores[j] >= THRESHOLD),
            key=lambda x: -x[1],
        )[:MAX_TAGS]
        if not ranked:
            continue

        dur = parse_workload(row.get("workload")) or Duration.fallback()
        diff = infer_difficulty(row["title"], row.get("description", ""))

        hot.append({
            "id": cid,
            "provider": "coursera",
            "title": row["title"],
            "url": row["url"],
            "description": (row.get("description") or "")[:500],
            "thumbnail_url": row.get("thumbnail_url"),
            "duration_hours": dur.hours,
            "duration_source": dur.source.value,
            "duration_low": dur.low,
            "duration_high": dur.high,
            "difficulty": diff.value if diff else None,
            "cost_type": "subscription",
            "price_usd": 59.0,
            "price_is_estimate": True,
            "skills_taught": [s for s, _ in ranked],
            "tag_confidence": {s: round(c, 3) for s, c in ranked},
            "tags_verified": False,
        })
        hot_vecs.append(vecs[i])

    OUT_INDEX.write_text(json.dumps(hot, ensure_ascii=False), encoding="utf-8")
    np.save(OUT_VEC, np.asarray(hot_vecs, dtype=np.float16))

    # coverage report: courses per skill
    from collections import Counter
    per = Counter(s for h in hot for s in h["skills_taught"])
    covered = sum(1 for s in skills if per.get(s, 0) > 0)
    print(f"hot index: {len(hot)} courses ({100*len(hot)/len(rows):.0f}% of catalog)")
    print(f"skills with >=1 course: {covered}/{len(skills)}")
    thin = [s for s in skills if per.get(s, 0) < 3]
    if thin:
        print(f"thin skills (<3 courses, need curation): {thin}")
    print(f"filtered out {non_english} non-English courses")
    print(f"-> {OUT_INDEX.name}, {OUT_VEC.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
