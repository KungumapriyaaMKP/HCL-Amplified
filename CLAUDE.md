# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Pathfinder** — AI-powered personalized learning path recommender, built for the HCLTech AMPlified challenge. A learner states a career goal; the system decomposes it into skills, measures gaps, retrieves real courses, sequences them with A* over a prerequisite DAG, and explains every recommendation with computed numbers.

Governing documents (source of truth for scope):

- `PROJECT_SPECIFICATION.md` — the 6 graded deliverables and the judging rubric
- `SYSTEM_DESIGN_BLUEPRINT.md` — subsystem architecture, algorithms, design system. Rewritten to match the implemented plan; §8 is the Swiss-white design direction and §7 the data-provenance rules.
- `ui_designs/` — 7 page mockups plus `DESIGN_SYSTEM.md` and `ui_preview.html`. **The `:root` block in `ui_preview.html` is the real token source**, not the abbreviated list in `DESIGN_SYSTEM.md`, which omits the `-bg` tint variants.
- Full build plan, feature tiers and week-by-week schedule: `~/.claude/plans/hi-delightful-dragonfly.md`

## Commands

```bash
# Backend (from backend/)
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
./.venv/Scripts/python.exe -m pytest
./.venv/Scripts/python.exe -m pytest tests/test_duration.py -q
./.venv/Scripts/python.exe -m pytest -k architecture
./.venv/Scripts/python.exe -m pip install -r requirements.txt

# Catalog ingest (offline, ~20 min, resumable — safe to re-run)
python backend/scripts/ingest_coursera.py

# Frontend (from frontend/)
npm run dev
npm run build
npm run lint
```

Windows: the venv interpreter is `backend/.venv/Scripts/python.exe`. Shell tooling is Git Bash — use forward slashes.

## Architecture: modular monolith with enforced boundaries

Not microservices. Separate services would cost N deploys and network hops between the gap engine and the planner for no benefit at this scale. Instead: hard module boundaries with explicit interfaces, so any module *could* be extracted later.

```
backend/app/
├── domain/         pure types — the shared vocabulary
├── modules/        8 bounded contexts, each exposing ONLY interface.py
│                   catalog · profiling · gap · retrieval
│                   planning · explain · adapt · telemetry
├── ml/             trained models, exposed as predict()
├── llm/            provider router — the ONLY caller of LLM APIs
├── api/routes/     thin HTTP layer
└── core/           config
```

**Six coupling rules, enforced by `tests/test_architecture.py`.** They genuinely fail on violation (verified by injecting one):

1. `domain/` imports nothing internal
2. Modules import other modules' `interface.py` only, never internals
3. Only `llm/` imports a provider SDK; modules pass text
4. Only `api/` imports FastAPI; modules take and return domain objects
5. Direction is `api → modules → domain`, never backwards
6. Modules call `ml.*.predict()`; they never load models

Run these before committing structural changes — cheapest signal that a refactor drifted.

Frontend mirrors this: `features/{intake,roadmap,catalog,analytics,adapt}` colocate components and hooks, and **features never import each other**. Shared code goes to `components/ui/` or `lib/`.

## Decisions that look wrong but aren't

Each was measured or reasoned deliberately; re-deriving them wastes time.

- **`fastembed` (ONNX), not `sentence-transformers`.** The latter drags ~2GB of PyTorch to encode a few hundred short strings. Do not add torch.
- **A\* sequences SKILL nodes, not course nodes.** Courses have messy inter-dependencies; canonical skills have clean ones. Each sequenced skill then binds its best resource.
- **Budget is enforced at bind time, not inside A\*.** Constrained shortest path with a budget dimension is NP-hard, and cumulative spend explodes the search state. Bind the best affordable resource per skill, then downgrade the most expensive picks until the total fits.
- **Job demand is not an 8th reranker factor.** The reranker scores *resources within a skill*; demand is a property of *roles*. It belongs at goal ranking and elective tie-breaking. The spec names exactly seven weighted factors — keep it seven.
- **The 7 factor weights must sum to 1.0.** A prior build added an unnormalized bias term and pushed the total to 1.45. There is a test for this.
- **LLM model IDs go stale fast.** `gemini-2.0-flash` is retired and Groq no longer serves any Llama chat model. Current picks were chosen by live measurement: `gemini-2.5-flash` (1.4s, native JSON mode) for structured output, `openai/gpt-oss-120b` (0.63s) for streaming chat. If a call 404s, list the provider's models before editing code.

## The honesty principle

The project's central claim is hallucination-free, score-grounded explanations. Two constraints follow:

- **Every number shown to a user must be computed by the engine.** The LLM may reword an explanation but must never introduce, alter, or round a figure.
- **When the system doesn't know something, it says so.** Estimated durations render as `~3-8h`, never a false point value. The Coursera price is modelled as a subscription and labelled an estimate. Skill tags below the confidence threshold are discarded rather than shown.

See `app/modules/catalog/duration.py` for the pattern: a `source` enum travels with the value, and display formatting depends on it.

## Highest-risk component

**The multi-label skill tagger** (`ml/`, not yet built). It trains on a few hundred hand-labelled rows and then labels ~23.6k courses. A false "teaches backpropagation" tag does not merely misrank a course — it makes a grounded explanation *state something untrue*, which is the one failure Deliverable 5 cannot survive.

Mitigations are not optional: threshold on prediction confidence, and hand-verify the **top ~10 ranked courses per skill** (~500 checks) rather than the raw catalog, since only top-ranked courses ever surface.

## Catalog

Four providers, every link real. Coursera and Microsoft Learn need no API key.

| Leg | Source | Notes |
|---|---|---|
| Coursera | Public Catalog API, keyless | 23,614 courses bulk-ingested. The `search` finder is not implemented, so we build our own index. |
| YouTube | Data API v3, keyed | Free quota ≈ **100 searches/day** (`search.list` costs 100 of 10,000 units). Cache aggressively. |
| Microsoft Learn | Live, keyless | Port from `C:/HCL/project 3/lib/external/msLearn.ts` |
| Udemy | Kaggle datasets | **The Affiliate API was discontinued 1 Jan 2025** — there is no key to obtain. Do not plan around one. |

Two-tier index: the **hot index** holds confidently-tagged resources and is what BM25 and dense search run over; the **cold store** keeps all 23.6k for re-tagging when tracks are added.

`backend/data/catalog_coursera.jsonl` is gitignored (39MB) — regenerate with the ingest script.

## Prior builds as a parts bin

Three earlier attempts sit under `C:/HCL/` (`Project`, `project2`, `project 3`). **None run correctly** — reference only, never fork. Worth reading:

- `project 3/data/skills.ts` — hand-authored 48-skill DAG, every prerequisite resolves
- `project2/.../retrieval/reranker.py` — implements the exact 7-factor spec weights
- `project2/.../planning/astar.py` — sound A* structure (frozenset state, heapq frontier)
- `Project/backend/engines/poincare_profiler.py` — correct geodesic formula with numerical guards
- `project 3/CODEBASE_LOGIC_ISSUES_SUMMARY.md` — three bugs worth designing out, notably an **infinite remediation loop** (a remediation inserted without checking the current node is already one). `adapt/interface.py` guards this.
