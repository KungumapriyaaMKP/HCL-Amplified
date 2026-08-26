"""
Bootstrap the tagger's training set by high-precision phrase matching.

The tagger cannot be hand-labelled at 23.6k scale, so we weak-label: a
course whose title/description contains a canonical skill's alias phrase
(on a word boundary) is taken as a positive example for that skill. These
labels train the classifier, which then generalises to courses that use
different wording.

Precision over recall, deliberately: a false phrase match becomes a false
training label becomes a false "teaches X" claim. Title matches count
double, since the title is the strongest signal of what a course is about.

    python backend/scripts/weak_label.py

Writes backend/data/seed_labels.jsonl : {id, title, text, skills[]}.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"
SRC = DATA / "catalog_coursera.jsonl"
ALIASES = DATA / "skill_aliases.json"
OUT = DATA / "seed_labels.jsonl"

# A course needs this much evidence before it becomes a training row, so the
# seed set is clean rather than large.
MIN_TITLE_HIT = 1        # one title phrase is decisive
MIN_TOTAL_WEIGHT = 2     # or two description phrases


def compile_aliases(raw: dict[str, list[str]]) -> dict[str, list[re.Pattern]]:
    patterns: dict[str, list[re.Pattern]] = {}
    for skill_id, phrases in raw.items():
        if skill_id.startswith("_"):
            continue
        patterns[skill_id] = [
            re.compile(r"\b" + re.escape(p) + r"\b", re.I) for p in phrases
        ]
    return patterns


def main() -> int:
    if not SRC.exists():
        print(f"missing {SRC}", file=sys.stderr)
        return 1

    raw = json.loads(ALIASES.read_text(encoding="utf-8"))
    patterns = compile_aliases(raw)

    rows = [json.loads(line) for line in SRC.open(encoding="utf-8")]
    labelled = 0
    per_skill: Counter[str] = Counter()

    with OUT.open("w", encoding="utf-8") as fh:
        for r in rows:
            title = r.get("title", "")
            desc = (r.get("description") or "")[:1500]
            skills: list[str] = []

            for skill_id, pats in patterns.items():
                title_hits = sum(bool(p.search(title)) for p in pats)
                desc_hits = sum(bool(p.search(desc)) for p in pats)
                # title evidence is worth 2, description worth 1
                weight = title_hits * 2 + desc_hits
                if title_hits >= MIN_TITLE_HIT or weight >= MIN_TOTAL_WEIGHT:
                    skills.append(skill_id)

            if skills:
                fh.write(json.dumps({
                    "id": r["id"],
                    "title": title,
                    "text": f"{title}. {desc[:600]}",
                    "skills": skills,
                }, ensure_ascii=False) + "\n")
                labelled += 1
                per_skill.update(skills)

    print(f"weak-labelled {labelled} / {len(rows)} courses "
          f"({100*labelled/len(rows):.0f}%)")
    print(f"skills with >=30 positives: "
          f"{sum(1 for v in per_skill.values() if v >= 30)} / {len(patterns)}")

    thin = {s: per_skill.get(s, 0) for s in patterns if per_skill.get(s, 0) < 30}
    if thin:
        print("\nUNDER-COVERED skills (need alias tuning or synthetic examples):")
        for s, c in sorted(thin.items(), key=lambda x: x[1]):
            print(f"  {c:>4}  {s}")

    print(f"\n-> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
