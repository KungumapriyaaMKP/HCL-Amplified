"""
Bulk-ingest the public Coursera catalog.

The Catalog API is public and needs no key, but its `search` finder is not
implemented -- so we page the whole catalog once and build our own index.

    python backend/scripts/ingest_coursera.py

Writes backend/data/catalog_coursera.jsonl (one course per line).
Resumable: re-running skips pages already written.
"""
import json
import os
import sys
import time
from pathlib import Path

import httpx

API = "https://api.coursera.org/api/courses.v1"
FIELDS = "name,slug,description,photoUrl,workload,primaryLanguages,courseType"
PAGE = 100
OUT = Path(__file__).resolve().parents[1] / "data" / "catalog_coursera.jsonl"


def fetch_page(client: httpx.Client, start: int) -> tuple[list[dict], int]:
    r = client.get(API, params={"start": start, "limit": PAGE, "fields": FIELDS})
    r.raise_for_status()
    body = r.json()
    return body.get("elements", []), int(body.get("paging", {}).get("total", 0))


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    seen: set[str] = set()
    if OUT.exists():
        with OUT.open(encoding="utf-8") as fh:
            for line in fh:
                try:
                    seen.add(json.loads(line)["id"])
                except Exception:
                    continue
        print(f"resuming: {len(seen)} courses already stored")

    start, total, written = 0, None, 0
    with httpx.Client(timeout=30.0, headers={"Accept": "application/json"}) as client:
        with OUT.open("a", encoding="utf-8") as fh:
            while True:
                for attempt in range(4):
                    try:
                        elements, total = fetch_page(client, start)
                        break
                    except Exception as exc:  # transient -> back off
                        if attempt == 3:
                            print(f"FAILED at start={start}: {exc}", file=sys.stderr)
                            return 1
                        time.sleep(2 ** attempt)

                if not elements:
                    break

                for el in elements:
                    if el.get("id") in seen:
                        continue
                    slug = el.get("slug")
                    if not slug:
                        continue
                    fh.write(json.dumps({
                        "id": el["id"],
                        "provider": "coursera",
                        "title": el.get("name", ""),
                        "slug": slug,
                        "url": f"https://www.coursera.org/learn/{slug}",
                        "description": (el.get("description") or "")[:2000],
                        "thumbnail_url": el.get("photoUrl"),
                        "workload": el.get("workload"),
                        "languages": el.get("primaryLanguages") or [],
                        "course_type": el.get("courseType"),
                    }, ensure_ascii=False) + "\n")
                    seen.add(el["id"])
                    written += 1

                fh.flush()
                start += PAGE
                if total and start >= total:
                    break
                if start % 1000 == 0:
                    print(f"  {start}/{total} pages walked, {written} new", flush=True)
                time.sleep(0.15)  # be polite

    print(f"done: {written} new courses, {len(seen)} total -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
