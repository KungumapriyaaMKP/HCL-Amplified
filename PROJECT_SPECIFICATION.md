# Project Specification — Pathfinder

> **Challenge**: HCLTech AMPlified — The AI Challenge (Season 1)
> **Track**: AI-Powered Personalized Learning Path Recommender
> **Target Alignment**: Next-Generation Adaptive Upskilling & Talent Transformation (HCLTech Career Shaper™)
> **Purpose**: Problem description, the six graded deliverables, the official judging rubric, and how Pathfinder satisfies each.

> **Companion documents**
> `SYSTEM_DESIGN_BLUEPRINT.md` — subsystem architecture, algorithms, design system
> `CLAUDE.md` — engineering conventions and decisions for contributors
> `ui_designs/` — 7 page mockups and the token source of truth

---

## 1. Problem

### 1.1 Context

Enterprise and educational platforms host tens of thousands of courses, lectures, labs and assessments. Catalog search surfaces individual courses matching keywords, but learners face severe cognitive overload when trying to chart an efficient, prerequisite-aware journey toward a career goal such as *Machine Learning Engineer*, *Cloud Solutions Architect* or *Full-Stack Developer*.

### 1.2 The core problem

Learners arrive with disparate baselines, histories, time commitments, budgets and preferences. Four failures follow:

1. **The curse of choice** — flat lists of hundreds of unsequenced resources, with no entry point and no progression logic.
2. **Prerequisite violations** — recommenders lack structural understanding and suggest Deep Learning to someone who has not mastered Linear Algebra or Python data structures.
3. **Static, fragile paths** — fixed curricula cannot adapt when a learner struggles or fails an assessment, producing frustration and abandonment.
4. **Black-box and hallucinated justifications** — generative chatbots invent fictitious course titles or offer ungrounded praise ("this course is great for you!") instead of transparent, metric-grounded reasoning.

> Failure 4 sets a hard constraint on this build: **every course link must resolve, and every number displayed must be computed by the engine.** A dead link or a decorative figure reproduces precisely the failure the project claims to solve.

---

## 2. Mission

> Build an end-to-end learning assistant that transforms a stated career goal into a personalized, prerequisite-aware, explainable and dynamically adaptive learning roadmap.

**Functional objectives**

- **Natural-language intake** — express ambitions, constraints and preferences in open dialogue
- **Granular gap analysis** — decompose goals into competencies and compute precise mathematical gaps against verified mastery
- **Hybrid multi-factor recommendation** — dense semantic retrieval blended with BM25, then deterministic multi-factor re-ranking over a **real** catalog
- **Deterministic graph sequencing** — A\* over an authoritative prerequisite DAG, with zero prerequisite violations
- **Score-grounded explainability** — hallucination-free rationales built from real similarity scores, gap deltas and prerequisite satisfaction
- **Adaptive rerouting** — detect blockage and splice remediation detours without breaking downstream dependencies

---

## 3. The Six Core Deliverables

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           6 CORE DELIVERABLES ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [D1: Conversational Interface]                                                             │
│          │ (Natural language goal intake & clarification)                                   │
│          ▼                                                                                  │
│  [D2: Learner Profiling & Skill Gap Engine]                                                 │
│          │ (CoT decomposition · deterministic gap math · per-skill mastery)                 │
│          ▼                                                                                  │
│  [D3: Hybrid Recommendation Engine] ─────────► [D4: Path Generator]                         │
│    (BM25 + Dense Embeddings + 7-Factor Rerank)   (A* over the prerequisite DAG)             │
│          │                                              │                                   │
│          ▼                                              ▼                                   │
│  [D5: Grounded Explainability]                 [D6: Progress Dashboard]                     │
│    (Score-grounded rationale)                    (Visual DAG · dual-graph rerouting)        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Deliverable 1 — Conversational Interface

**Purpose**: a natural-language interface for expressing aspirations, background and study constraints.

- Intent extraction with **active clarifying dialogue** when input is underspecified
- Quick-action chips for goal refinement (target role, timeframe, weekly hours)
- Conversational state management with responsive streaming

> **Implementation note**: the clarifying dialogue has a concrete job — it captures **weekly hours, deadline and course budget**, which feed the feasibility check (D4) and budget-aware binding. This is what makes D1 a genuine conversation rather than a form with a chat skin.

### Deliverable 2 — Learner Profiling & Skill Gap Engine

**Purpose**: maintain a structured 4D learner profile (goals, proficiencies, history, constraints) and compute accurate gaps.

- **Chain-of-thought goal decomposition** (*GenMentor* pattern):
  $$\text{Objective} \rightarrow \text{Job Duties} \rightarrow \text{Competencies} \rightarrow \text{Granular Skills} \rightarrow \text{Target Mastery}$$
- **Deterministic gap formulation**:
  $$\text{SkillGap}(s) = \max(0,\ \text{Required}(s) - \text{Current}(s))$$
  $$\text{Priority}(s) = \text{Importance}(s) \times \text{SkillGap}(s)$$
- **EduCOR ontology**: $\text{Skill} \rightarrow \text{Knowledge Topic} \rightarrow \text{Educational Resource}$

> **Implementation note**: mastery is stored **per skill with a confidence level**, not as one global number. Quiz-probed skills carry high confidence, resume-evidenced skills medium, unevidenced skills low with a wide band. An unverified claim is probed or conservatively discounted, never silently trusted — this is what makes the zero-assumption property real. Diagnostic items are selected by `uncertainty × downstream_fan_out`, so the questions asked are the ones whose answers matter most to the rest of the graph.

### Deliverable 3 — Hybrid Recommendation & Retrieval Engine

**Purpose**: retrieve and rank real courses, projects and assessments from the catalog.

- **Hybrid search**:
  $$\text{Score}_{\text{hybrid}} = \alpha \cdot \text{CosineSim}(v_{\text{goal}}, v_{\text{res}}) + (1 - \alpha) \cdot \text{BM25}(q, d)$$
- **7-factor deterministic re-ranker** — weights sum to exactly 1.0:

| # | Factor | Weight |
|---|---|---|
| 1 | Skill coverage & gap reduction | 0.30 |
| 2 | Semantic relevance | 0.25 |
| 3 | Prerequisite readiness | 0.15 |
| 4 | Difficulty & baseline fit | 0.10 |
| 5 | Modality preference | 0.08 |
| 6 | Content quality & rating | 0.07 |
| 7 | Catalog freshness | 0.05 |

> **Implementation note**: the catalog is genuinely real — **23,614 Coursera courses** ingested from their public keyless API, plus live Microsoft Learn and YouTube enrichment, plus dataset-sourced Udemy entries carrying real list prices. Every link resolves. Because live-fetched resources arrive without skill tags or difficulty labels, two supervised classifiers supply them (see §6.2); every component score is retained so D5 can quote real numbers.

### Deliverable 4 — Personalized Learning Path Generator

**Purpose**: turn disjoint recommendations into an optimal, topologically ordered, milestone-grouped curriculum.

- **Deterministic A\* planning**: $f(n) = g(n) + h(n)$, where $g$ accumulates time, cost, difficulty-jump penalties and prior-experience credit, and $h$ is an admissible heuristic over remaining gaps
- **Topological consistency** via Kahn's algorithm — zero prerequisite violations, asserted in tests and surfaced in the UI
- **Milestone partitioning**: Foundations → Core Concepts → Advanced Applications → Capstone

> **Implementation note**: A\* sequences **skill nodes, not course nodes** — courses have messy inter-dependencies while canonical skills have clean ones — and each sequenced skill then binds its best available resource. Learner budget is a **hard ceiling enforced at bind time** rather than inside the search, since constrained shortest path with a budget dimension is NP-hard and would explode the frontier.

### Deliverable 5 — Score-Grounded Explainability

**Purpose**: eliminate black-box recommendations and hallucinated rationales.

- **Metric-grounded explanations** (*KnowPath* pattern), incorporating the exact target skills addressed, the computed gap-reduction delta, the prerequisites satisfied, and the hybrid similarity score
- Interactive Q&A — *"why was this recommended before that?"*

> **Implementation note**: numbers are computed first and passed to the LLM as facts. The model may reword an explanation; it may never introduce, alter or round a figure. Where the system is uncertain it says so — estimated durations render as `~3–8h` rather than a false point value, and low-confidence skill tags are discarded rather than shown.

### Deliverable 6 — Progress Dashboard & Adaptive Rerouting

**Purpose**: visualise progression and adapt the path in real time.

- **Interactive DAG & milestone roadmap** — completed, active and locked nodes with progress indicators
- **Stuck detection** — below 50% on two consecutive attempts, or explicit "too difficult"
- **Dual-graph rerouting** (*DLELP / KnowLP* pattern) — on blockage at topic $T_A$, query the concept-similarity graph for a bridging prerequisite $T_B$ and splice a remediation detour without breaking downstream dependencies

> **Implementation note**: detour insertion is guarded so a remediation never spawns its own remediation, with a cap per skill — an unguarded version of this logic produced an infinite loop in an earlier internal build.

---

## 4. End-to-End Workflow

```
[0. Evidence]   ──► Resume (PDF/DOCX) + GitHub profile ──► skills with provenance
                           │                                (evidence proposes)
                           ▼
[1. Intake]     ──► Conversational goal + constraints (hours · deadline · budget)
                           │
                           ▼
[2. Profiling]  ──► CoT decomposition · targeted diagnostic · per-skill θ + confidence
                           │                                (the quiz verifies)
                           ▼
[3. Retrieval]  ──► Hybrid BM25 + dense candidate generation over the real catalog
                           │
                           ▼
[4. Reranking]  ──► 7-factor deterministic scoring · component scores retained
                           │
                           ▼
[5. Path Gen]   ──► A* over the prerequisite DAG · budget binding · milestones
                           │
                           ▼
[6. Explain]    ──► Rationale generated from the computed numbers
                           │
                           ▼
[7. Dashboard]  ──► Visual roadmap · Poincaré projection · assessment
                           │
                           ▼
[8. Adapt]      ──► Assessment result
                    ├── Passed (≥70%)  ──► advance mastery, unlock next milestone
                    ├── Failed         ──► Socratic guided questioning
                    └── Stuck (2 fails)──► dual-graph remediation detour
```

---

## 5. Official Judging Criteria

Submissions are evaluated against six criteria totalling 100%.

| Evaluation Criterion | Weight | Assessment Focus & Scoring Factors |
| :--- | :---: | :--- |
| **Functionality & Feature Completeness** | **25%** | • Flawless execution across all 6 deliverables.<br>• Seamless transition from natural language intake to structured path generation, interactive dashboard, and adaptive rerouting.<br>• Real catalog data integration and verified end-to-end workflows. |
| **Problem Understanding & Solution Design** | **20%** | • Clear appreciation of the learner dilemma and prerequisite constraints.<br>• Robust knowledge ontology (*EduCOR* schema: Skill $\rightarrow$ Topic $\rightarrow$ Resource).<br>• Clear architectural separation between generative reasoning and deterministic logic. |
| **AI/ML Implementation & Algorithmic Rigor** | **20%** | • Evidence-backed algorithms: CoT decomposition (*GenMentor*), Hybrid Retrieval (BM25 + Dense Embeddings), $A^*$ DAG search, and Dual-Graph rerouting (*DLELP/KnowLP*).<br>• Zero naive prompt wrappers or mock heuristics.<br>• Grounded, hallucination-free explainability (*KnowPath*). |
| **Innovation & Creativity** | **15%** | • Dynamic blockage detection and automatic remediation detour insertion.<br>• Multi-factor re-ranking incorporating difficulty progression and modality matching.<br>• Interactive visual graph representations and rich learner telemetry. |
| **User Experience & Interface Design** | **10%** | • Intuitive, modern, and responsive UI (desktop, tablet, mobile).<br>• Clear visual DAG roadmap representation with interactive node details.<br>• Sub-second UI updates and conversational responsiveness. |
| **Performance, Code Quality & Engineering** | **10%** | • Clean, modular, decoupled architecture with strict data validation (Pydantic / TypeScript).<br>• Comprehensive automated test suite (Unit tests for algorithms, Integration tests for APIs).<br>• Sub-second response times for retrieval and path generation. |

> **Advancement Threshold**: The **Top 25 Teams** nationwide are selected based on prototype evaluation scores to advance to the Grand Finale & Pitch Day.

---

## 6. Engineering Standards

### 6.1 The hybrid deterministic + generative paradigm

> **Core rule**: use LLMs strictly where natural-language comprehension or synthesis is genuinely needed. Use deterministic algorithms for retrieval, scoring, graph traversal, prerequisite validation, planning and stuck detection.

- **LLM responsibility** — conversational intake, skill decomposition, and phrasing grounded explanations
- **Deterministic responsibility** — gap computation, vector similarity, BM25, 7-factor re-ranking, A\* search, topological sorting, decay modelling, stuck detection

The deterministic core is implemented as **pure functions with no network calls**. They test in milliseconds, remain correct when a provider rate-limits, and make the architectural claim above verifiable rather than asserted.

### 6.2 Naming the AI/ML honestly

Mislabeling is the easiest way to lose marks in a 20%-weighted band, so each component is named precisely:

| Category | Components |
|---|---|
| **Trained supervised models** | Multi-label skill tagger · difficulty classifier (sklearn, reported macro-F1 / accuracy on held-out splits) |
| **Fitted statistical models** | 2PL-IRT ability estimation · Ebbinghaus stability |
| **Pretrained, used as-is** | MiniLM/BGE sentence embeddings |
| **Classical algorithms** | BM25 · A\* · Kahn's sort · cosine similarity · Poincaré geodesics — *algorithms, not machine learning* |

The two supervised models are load-bearing rather than decorative: live-fetched resources arrive without skill tags or difficulty labels, and 23,614 courses cannot be hand-labelled, so these models are the bridge between the live catalog and the deterministic engine.

### 6.3 Modular architecture

A **modular monolith** with hard boundaries: eight bounded contexts, each exposing a single `interface.py`, with dependency direction `api → modules → domain`. Six coupling rules are encoded as executable tests that fail the build on violation, naming the offending import.

Contract-first: Pydantic v2 models are the single source of truth, and TypeScript types are generated from the OpenAPI schema.

### 6.4 Prototype fidelity

This is a **polished working prototype**, not a production system. Out of scope by decision: authentication hardening, rate limiting, input sanitisation, CI pipelines, and scale engineering.

Seeded and simplified data is acceptable and expected — seeded learner history, a dated job-demand snapshot, deterministic Poincaré coordinates, pre-authored quiz items. Round 1 simplifications are stated plainly in the README as current-iteration choices.

Two things are never simplified, both because §1.2 names them as the problem being solved:

1. **Course titles and URLs are real** and resolve.
2. **Displayed scores are the computed scores.**
