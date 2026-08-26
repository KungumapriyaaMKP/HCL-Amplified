"""
Embed the catalog offline and commit the vectors.

Encoding at boot would make every cold start 30s+ on Hugging Face Spaces,
so this runs once, offline, and writes float16 vectors (~18MB for 23.6k
rather than ~36MB at float32).

Resumable: re-running skips work already on disk.

    python backend/scripts/embed_catalog.py
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding

DATA = Path(__file__).resolve().parents[1] / "data"
SRC = DATA / "catalog_coursera.jsonl"
VEC = DATA / "catalog_vectors.npy"
IDS = DATA / "catalog_vector_ids.json"

MODEL = "BAAI/bge-small-en-v1.5"
CHUNK = 512          # flush to disk this often, so a crash costs little
DESC_CHARS = 600     # measured: longer text slows encoding without helping


def doc_text(row: dict) -> str:
    """Title carries most of the signal; description disambiguates."""
    return f"{row['title']}. {row.get('description', '')[:DESC_CHARS]}"


def main() -> int:
    if not SRC.exists():
        print(f"missing {SRC} -- run ingest_coursera.py first", file=sys.stderr)
        return 1

    rows = [json.loads(line) for line in SRC.open(encoding="utf-8")]
    print(f"catalog: {len(rows)} courses")

    done_ids: list[str] = []
    done_vecs: np.ndarray | None = None
    if VEC.exists() and IDS.exists():
        done_ids = json.loads(IDS.read_text(encoding="utf-8"))
        done_vecs = np.load(VEC)
        print(f"resuming: {len(done_ids)} already embedded")

    have = set(done_ids)
    todo = [r for r in rows if r["id"] not in have]
    if not todo:
        print("nothing to do")
        return 0
    print(f"to embed: {len(todo)}")

    model = TextEmbedding(model_name=MODEL)
    new_ids: list[str] = []
    new_vecs: list[np.ndarray] = []
    start = time.time()

    for i in range(0, len(todo), CHUNK):
        batch = todo[i : i + CHUNK]
        vecs = list(model.embed([doc_text(r) for r in batch], batch_size=64))
        new_ids.extend(r["id"] for r in batch)
        new_vecs.extend(vecs)

        # flush cumulative state -- resumable at chunk granularity
        arr = np.asarray(new_vecs, dtype=np.float16)
        combined = arr if done_vecs is None else np.vstack([done_vecs, arr])
        np.save(VEC, combined)
        IDS.write_text(json.dumps(done_ids + new_ids), encoding="utf-8")

        elapsed = time.time() - start
        rate = len(new_ids) / elapsed
        remaining = (len(todo) - len(new_ids)) / rate / 60 if rate else 0
        print(f"  {len(new_ids)}/{len(todo)}  {rate:.0f}/s  ~{remaining:.0f} min left",
              flush=True)

    final = np.load(VEC)
    size_mb = VEC.stat().st_size / 1e6
    print(f"done: {final.shape} float16, {size_mb:.1f}MB -> {VEC}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
