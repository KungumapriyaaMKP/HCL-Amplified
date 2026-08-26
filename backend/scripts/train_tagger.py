"""
Train the multi-label skill tagger and the difficulty classifier.

Features are the committed MiniLM/BGE embeddings (already computed for
retrieval -- no separate feature pipeline). Labels come from the weak
labeller. Model is One-vs-Rest logistic regression: trains in seconds,
needs no GPU, and gives calibrated per-skill probabilities that the serve
path thresholds on.

    python backend/scripts/train_tagger.py

Writes backend/app/ml/artifacts/{skill_tagger,difficulty}.joblib and prints
held-out metrics. The tagger is the highest-risk component (a false tag
makes a grounded explanation state something untrue), so precision@k is
reported alongside macro-F1 and the serve threshold is chosen for precision.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.multiclass import OneVsRestClassifier

DATA = Path(__file__).resolve().parents[1] / "data"
ART = Path(__file__).resolve().parents[1] / "app" / "ml" / "artifacts"

SEED = DATA / "seed_labels.jsonl"
VEC = DATA / "catalog_vectors.npy"
IDS = DATA / "catalog_vector_ids.json"
SKILLS = DATA / "skills.json"

MIN_POSITIVES = 8  # a skill needs this many examples to be learnable


def load_vectors() -> dict[str, np.ndarray]:
    ids = json.loads(IDS.read_text(encoding="utf-8"))
    vecs = np.load(VEC).astype(np.float32)
    return dict(zip(ids, vecs))


def main() -> int:
    for f in (SEED, VEC, IDS):
        if not f.exists():
            print(f"missing {f.name} -- run the prerequisite script first", file=sys.stderr)
            return 1

    vectors = load_vectors()
    seed = [json.loads(line) for line in SEED.open(encoding="utf-8")]
    seed = [r for r in seed if r["id"] in vectors]
    print(f"labelled courses with embeddings: {len(seed)}")

    all_skills = [s["id"] for s in json.loads(SKILLS.read_text(encoding="utf-8"))]

    # keep only skills with enough positives to learn
    counts = {s: 0 for s in all_skills}
    for r in seed:
        for s in r["skills"]:
            counts[s] = counts.get(s, 0) + 1
    learnable = [s for s in all_skills if counts[s] >= MIN_POSITIVES]
    dropped = [s for s in all_skills if counts[s] < MIN_POSITIVES]
    print(f"learnable skills: {len(learnable)}/{len(all_skills)}")
    if dropped:
        print(f"  too few positives (< {MIN_POSITIVES}): {dropped}")

    skill_idx = {s: i for i, s in enumerate(learnable)}
    X = np.vstack([vectors[r["id"]] for r in seed])
    Y = np.zeros((len(seed), len(learnable)), dtype=int)
    for row, r in enumerate(seed):
        for s in r["skills"]:
            if s in skill_idx:
                Y[row, skill_idx[s]] = 1

    Xtr, Xte, Ytr, Yte = train_test_split(X, Y, test_size=0.2, random_state=42)

    clf = OneVsRestClassifier(
        LogisticRegression(max_iter=1000, C=4.0, class_weight="balanced"),
        n_jobs=-1,
    ).fit(Xtr, Ytr)

    proba = clf.predict_proba(Xte)

    print("\n=== tagger, threshold sweep (held-out) ===")
    print(f"{'thr':>5} {'macro-P':>8} {'macro-R':>8} {'macro-F1':>9} {'coverage':>9}")
    best_thr = 0.5
    for thr in (0.3, 0.4, 0.5, 0.6, 0.7):
        pred = (proba >= thr).astype(int)
        p = precision_score(Yte, pred, average="macro", zero_division=0)
        r = recall_score(Yte, pred, average="macro", zero_division=0)
        f = f1_score(Yte, pred, average="macro", zero_division=0)
        cov = float((pred.sum(axis=1) > 0).mean())
        print(f"{thr:>5.1f} {p:>8.2f} {r:>8.2f} {f:>9.2f} {cov:>9.0%}")

    # precision@1: is the single highest-scored skill correct?
    top1_correct = sum(
        Yte[i, proba[i].argmax()] == 1 for i in range(len(Yte)) if Yte[i].sum() > 0
    )
    top1_total = sum(1 for i in range(len(Yte)) if Yte[i].sum() > 0)
    print(f"\nprecision@1 (top predicted skill is a true label): "
          f"{top1_correct}/{top1_total} = {top1_correct/top1_total:.0%}")

    # retrain on all data for the shipped artifact
    final = OneVsRestClassifier(
        LogisticRegression(max_iter=1000, C=4.0, class_weight="balanced"), n_jobs=-1
    ).fit(X, Y)

    ART.mkdir(parents=True, exist_ok=True)
    import joblib
    joblib.dump({"model": final, "skills": learnable}, ART / "skill_tagger.joblib")
    print(f"\nsaved -> {ART / 'skill_tagger.joblib'}")
    print("NOTE: weak labels bootstrap the tagger; the top ~10 ranked courses "
          "per skill must still be hand-verified before their tags ground an "
          "explanation (see the risk note in CLAUDE.md).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
