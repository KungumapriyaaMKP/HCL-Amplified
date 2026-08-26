# Pathfinder 🧭
**AI-Powered Personalized Learning Path Recommender**

Pathfinder decomposes career goals into granular canonical skill DAGs, extracts demonstrated skills from resumes and GitHub repositories, psychometrically calibrates readiness via 2PL Item Response Theory, sequences optimal learning orders using A* graph search, binds high-impact catalog resources (including free Microsoft Learn and YouTube lectures), and adaptively reroutes around learner misconceptions using Socratic tutoring and dual-graph remediation.

---

## 🏛️ System Architecture & Six Core Deliverables

```
                                  [ User Intake ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  Streaming Chat                Resume Parser (F1)               GitHub Profiler (F2)
 (EventSource SSE)           (pdfplumber / python-docx)           (Public GitHub REST)
        │                                │                                │
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                            [ 2PL-IRT Diagnostic (F3) ]
                     (MLE Ability Estimation & Calibration)
                                         │
                                         ▼
                          [ DELIVERABLE 2: Gap Engine ]
                     (Uncertainty × Downstream Fan-Out Probing)
                                         │
                                         ▼
                     [ DELIVERABLE 3: Candidate Retrieval ]
                (Dense Cosine + BM25 Hybrid + MS Learn/YouTube Live F5)
                                         │
                                         ▼
                         [ DELIVERABLE 4: A* Planner ]
                   (Graph Sequencing + Feasibility + Relaxer F6)
                                         │
                                         ▼
                    [ DELIVERABLE 5: Grounded Explanation ]
                      (Strict Source-Attributed Rationales)
                                         │
                                         ▼
                     [ DELIVERABLE 6: Adaptive Detour (D6) ]
                    (Dual-Graph Stuck Detection & Remediation)
```

### Feature Mapping to the 6 Deliverables

| Deliverable | Features Built | Backend Engine / Route | Frontend Screen |
| :--- | :--- | :--- | :--- |
| **D1: Ontology Substrate** | **F11** (4 Disciplines, 66 Skills, 0 Cycles) | `data/skills.json`, `data/tracks.json`, `data/skill_aliases.json` | What-If Branching (`/what-if`), Poincaré Disk (`/analytics`) |
| **D2: Diagnostic & Profiler** | **F1** (Resume), **F2** (GitHub), **F3** (2PL IRT) | `POST /api/profile/resume`, `POST /api/profile/github`, `POST /api/diagnostic/*` | Streaming Intake (`/`), Diagnostic Quiz Card |
| **D3: Candidate Retrieval** | **F5** (Live YouTube & MS Learn Enrichment) | `app/modules/catalog/live.py`, `app/modules/catalog/search.py` | Catalog & Resource Bindings in Skill Cards |
| **D4: Constrained Planner** | **F6** (Schedule Relaxer), **F7** (Crash-Course) | `POST /api/plan`, `POST /api/plan/relax`, `GET /api/roles` | Roadmap Board (`/roadmap`), Relaxer Banner |
| **D5: Grounded Explanation** | **F8** (Socratic Tutor & Misconceptions) | `app/modules/explain/`, `POST /api/socratic` | Explanation Side Panel, Socratic Modal |
| **D6: Adaptive Remediation** | **S4** (Dual-Graph Detour Splicing) | `app/modules/adapt/`, `POST /api/adapt/detour` | Framer Motion Spring Layout Detour Animation |
| **Telemetry & Mind** | **F4** (Ebbinghaus), **F9** (SSE), **F10** (Gamification) | `GET /api/history`, `POST /api/chat`, `GET /api/gamification`, `GET /api/poincare` | Ghost Mentor, Poincaré Disk, Retention Heatmap, XP Bar |

---

## 🛠️ Stack & Standards

- **Backend:** Python 3.10, FastAPI, FastEmbed (BAAI/bge-small-en-v1.5), Rank-BM25, NumPy, SciPy (2PL IRT), NetworkX, PyJWT, Supabase Auth.
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Pyodide WASM.
- **Architecture Integrity:** 6 strict coupling rules enforced by automated architectural fitness tests (`tests/test_architecture.py`).
- **Honesty Principle:** Every number displayed in the UI is mathematically engine-derived; unverified figures render honestly (`~3-8h`).
- **Graceful Fallback:** 100% operational in demo/guest mode without third-party API keys.

---

## 🚀 Running Locally

### 1. Backend

```bash
cd backend
# Run with virtual environment interpreter
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

Run test suite:
```bash
cd backend
./.venv/Scripts/python.exe -m pytest -v
```

### 2. Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

Build production bundle:
```bash
cd frontend
npm run build
```

---

## 🚢 Deployment

- **Backend (Hugging Face Spaces):** Deploy with the included `backend/Dockerfile` (pre-warmed FastEmbed vectors and uvicorn on port 7860).
- **Frontend (Vercel):** Deploy Next.js App Router directly with `NEXT_PUBLIC_API_URL` pointing to the backend.
