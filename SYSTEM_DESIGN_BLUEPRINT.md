# System Design Blueprint — Pathfinder

> **Project**: Pathfinder — AI-Powered Personalized Learning Path Recommender
> **Challenge**: HCLTech AMPlified (Season 1)
> **Target Alignment**: Next-Generation Adaptive Upskilling & Talent Transformation (HCLTech Career Shaper™)
> **Status**: Implementation. Round 1 prototype scope marked `R1`; Round 2 weeks marked `W1`–`W4`.

---

## 1. Core Philosophy

Pathfinder turns a stated career goal into a prerequisite-aware, mathematically grounded, dynamically adaptive learning roadmap.

### 1.1 The hybrid deterministic + generative paradigm

> **Rule**: use an LLM only where natural-language comprehension or synthesis is genuinely required. Use deterministic algorithms for retrieval, scoring, graph traversal, prerequisite validation, planning, and stuck detection.

The LLM touches the system at exactly **three seams**:

1. Conversational intake and clarifying dialogue
2. Chain-of-thought goal decomposition (goal → competencies → leaf skills)
3. Phrasing an explanation whose numbers were already computed

Everything else — gap arithmetic, BM25, cosine similarity, the 7-factor rerank, A\*, Kahn validation, Ebbinghaus decay, stuck detection — is deterministic, pure, and testable without a network call.

### 1.2 The honesty principle

The project's central claim is hallucination-free, score-grounded explanation. Two constraints follow, and they shape the data model as much as the UI:

- **Every number shown to a user is computed by the engine.** The LLM may reword an explanation; it may never introduce, alter, or round a figure.
- **When the system does not know something, it says so.** Estimated durations render as `~3–8h`, never a false point value. Coursera pricing is modelled as a subscription and labelled an estimate. Skill tags below the confidence threshold are discarded rather than displayed.

Provenance travels with the value: every duration carries a `source` enum (`PARSED` / `ESTIMATED` / `FALLBACK`), and display formatting depends on it. See §7.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             END-TO-END PIPELINE & SUBSYSTEMS                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [1. Intake & Profiling]                                                                    │
│  ├── Multi-Modal Resume Parser (PDF/DOCX layout-aware + GitHub Profiler)          W1        │
│  ├── Zero-Assumption Diagnostic (targeted probing → per-skill θ via 2PL-IRT)      W1  R1*   │
│  └── Poincaré Hyperbolic Skill Projection (unit-disk geodesic distance)               R1    │
│                                                                                             │
│  [2. Skill Gap & Ontology Engine]                                                           │
│  ├── CoT Skill Decomposition (Goal ─► Competencies ─► Granular Leaf Skills)           R1    │
│  ├── Deterministic Gap: SkillGap(s) = max(0, Req(s) − Current(s))                     R1    │
│  └── EduCOR 3-Tier Ontology (Skill ─► Knowledge Topic ─► Resource)                    R1    │
│                                                                                             │
│  [3. Multi-Platform Hybrid Retrieval & 7-Factor Re-Ranker]                                  │
│  ├── Catalog: Coursera · YouTube · Microsoft Learn · Udemy          ~70 R1 / 23.6k W1      │
│  ├── Hybrid: α · CosineSim(v_goal, v_res) + (1−α) · BM25(q, d)                        R1    │
│  └── 7-Factor Weighted Scorer (weights sum to exactly 1.0)                            R1    │
│                                                                                             │
│  [4. Multi-Constraint A* Pathfinder & Conflict Relaxer]                                     │
│  ├── A* over verified cycle-free DAG (nx.is_directed_acyclic_graph)                   R1    │
│  ├── min f(n) = g(n)[Time, Cost, DiffJump, Exp] + h(n)[Remaining Gap]                 R1    │
│  ├── Budget-aware resource binding (hard ceiling, enforced at bind time)           W2        │
│  └── 1-Click Prerequisite Conflict Relaxer (feasibility solver)                    W3        │
│                                                                                             │
│  [5. Explainability & Interactive Practice]                                                 │
│  ├── Metric-Grounded Rationale (Gap Δ, pre-req match, hybrid score)                   R1    │
│  ├── Socratic Misconception Engine (guided questioning, visual counter-examples)   W2        │
│  └── In-Browser Pyodide (Wasm) Practice Lab (NumPy, Pandas, sklearn, Matplotlib)   W3        │
│                                                                                             │
│  [6. Telemetry, Analytics & Dynamic Detour Loop]                                            │
│  ├── Dual-Graph Remediation Rerouting (concept bridge detour on blockage)             R1    │
│  ├── Ebbinghaus Retention Matrix & 2-Minute Micro-Review Scheduler                 W2  R1*  │
│  ├── "What-If" Career Branching Comparison Sandbox                                 W3        │
│  └── 52-Week Activity Heatmap & Gap-Closure Trend                                  W2  R1*  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

R1  = ships in the 2-day Round 1 build
R1* = ships in R1 in simplified form (§9.2)
```

### 2.1 Code architecture: modular monolith with enforced boundaries

Not microservices — separate services would cost N deployments and network hops between the gap engine and the planner, for no benefit at this scale. Instead: **hard module boundaries with explicit interfaces**, such that any module *could* be extracted into a service later without touching its callers.

```
backend/app/
├── domain/         pure types — the shared vocabulary
├── modules/        8 bounded contexts, each exposing ONLY interface.py
│                   catalog · profiling · gap · retrieval
│                   planning · explain · adapt · telemetry
├── ml/             trained models, exposed as predict()
├── llm/            provider router — the ONLY caller of LLM APIs
├── api/routes/     thin HTTP layer
└── core/           configuration
```

**Six coupling rules**, encoded as executable tests in `backend/tests/test_architecture.py`:

| # | Rule |
|---|---|
| 1 | `domain/` imports nothing internal — everything depends on it, it depends on nobody |
| 2 | A module may import another module's `interface.py` only, never its internals |
| 3 | Only `llm/` imports a provider SDK; modules pass and receive plain text |
| 4 | Only `api/` imports FastAPI; modules take and return domain objects |
| 5 | Dependency direction is `api → modules → domain`, never backwards |
| 6 | Modules call `ml.*.predict()`; they never load models directly |

These are architectural fitness functions, not documentation. Violations fail the build with the exact offending import — verified by deliberately injecting one.

The frontend mirrors this: `features/{intake,roadmap,catalog,analytics,adapt}` colocate their components and hooks, and **features never import from each other**; shared code lives in `components/ui/` or `lib/`.

---

## 3. The ML Engine

**AI/ML Implementation is 20% of the rubric, and mislabeling is the easiest way to lose it.** Three distinct categories, named precisely:

| Category | Components | Fitted from data? |
|---|---|---|
| **Trained supervised models** | Multi-label skill tagger · Difficulty classifier | **Yes** — sklearn, with held-out metrics |
| **Fitted statistical models** | 2PL-IRT θ estimation · Ebbinghaus stability `S` | **Yes** |
| **Pretrained, used as-is** | MiniLM/BGE sentence embeddings (fastembed/ONNX) | No — but legitimate ML |
| **Classical algorithms** | BM25 · A\* · Kahn's sort · cosine similarity · Poincaré geodesics | **No** — algorithms, not ML |

### 3.1 The two supervised models are load-bearing, not decorative

Live-fetched resources arrive with **no skill tags and no difficulty label**. The gap engine needs `skills_taught`; the reranker needs `difficulty_fit`. 23,614 courses cannot be hand-labelled. These models *are* the bridge between the live catalog and the deterministic engine — without them nothing enters the pipeline.

**Multi-label skill tagger** — title + description → subset of the ~50 canonical skills.
Features: MiniLM embeddings (already computed for retrieval). Model: One-vs-Rest logistic regression. Training data: hand-labelled seed catalog. Reported: macro-F1 and precision@k on a held-out split. Served behind a confidence threshold.

**Difficulty classifier** — same features → beginner / intermediate / advanced. Reported: accuracy and confusion matrix.

### 3.2 Fitted statistical models

**2PL-IRT ability estimation**

$$P(Y = 1 \mid \theta) = \frac{1}{1 + e^{-a(\theta - b)}}$$

θ is estimated per learner by maximum likelihood over quiz responses (`scipy.optimize`), where `b` is item difficulty and `a` is discrimination.

**Ebbinghaus stability fitting** — `S` is fitted per skill from real review outcomes rather than assumed constant, growing on success and shrinking on failure (SM-2/FSRS-style). This makes review scheduling genuinely adaptive rather than a fixed curve.

### 3.3 No neural network

sklearn over MiniLM features trains in seconds, needs no GPU, and produces real evaluation metrics. Adding a neural network for appearances would contradict §1.1's own thesis. Technical judges reward correct tool selection and punish mislabeling — calling BM25 "machine learning" invites a question we do not want. A PyTorch head or fine-tuned encoder remains an optional `W4` upgrade if slack exists.

### 3.4 Highest-risk component

**The skill tagger.** It trains on a few hundred hand-labelled rows and then labels ~23.6k courses. A false *"teaches backpropagation"* tag does not merely misrank a course — it makes a grounded explanation **state something untrue**, which is the one failure Deliverable 5 cannot survive.

Mitigations are mandatory, not cleanup:
1. **Confidence thresholding** — discard uncertain tags. With 23.6k courses we can afford precision over recall.
2. **Verify the ranked output, not the raw catalog** — hand-check the **top ~10 courses per skill** (~500 checks). Only top-ranked courses ever surface.

---

## 4. Catalog & Prerequisite Knowledge Engine

### 4.1 Four providers, every link real

API availability was researched and tested rather than assumed:

| Leg | Source | Key? | Notes |
|---|---|---|---|
| 1 | **Coursera** Catalog API | **No** | **23,614 courses** bulk-ingested, paginated 100/page. The `search` finder is not implemented — irrelevant, since we build our own index. URLs are `coursera.org/learn/{slug}`; sampled links validated 8/8 at HTTP 200. |
| 2 | **YouTube** Data API v3 | Yes | Free quota ≈ **100 searches/day** (`search.list` costs 100 of 10,000 units). Caching is required, not optional. |
| 3 | **Microsoft Learn** Catalog | **No** | Live, keyless, 1-hour cache. |
| 4 | **Udemy** | — | **The Affiliate API was discontinued 1 Jan 2025.** No key is obtainable. Sourced from public datasets carrying real URLs and list prices. |

### 4.2 EduCOR ontology binding

$$\text{Canonical Skill DAG} \xleftarrow{\text{maps to}} \text{Multi-Platform Resources}$$

Rather than rely on unreliable course-to-course links, all external resources bind to an authoritative, cycle-free **canonical concept prerequisite DAG**. The spec's middle tier (Skill → *Knowledge Topic* → Resource) is carried as a `topic` grouping field on the resource, keeping the three tiers representable without maintaining a second graph.

### 4.3 Two-tier hybrid index

- **Hot index** — resources whose predicted tags clear the confidence threshold and map onto the canonical DAG. BM25 and dense retrieval run over this alone.
- **Cold store** — all 23.6k retained on disk, re-taggable when new tracks are added, not indexed.

*Why not filter by keyword at ingest:* that applies a **lexical filter before embeddings exist**. "Neural Networks and Deep Learning" contains neither word of "machine learning" and would be silently dropped. Maximum recall in; precision enforced by tag confidence and the reranker.

**Live enrichment** — YouTube and Microsoft Learn results are fetched at query time, embedded on the fly, tagged, and cached. Core catalog vectors are precomputed **offline and committed** as float16; encoding at boot would make every cold start 30s+.

### 4.4 Resource schema

`id` · `provider` · `title` · `url` · `thumbnail_url` · `description`
`duration_hours` + `duration_source` · `cost_type` · `price_usd` + `price_is_estimate`
`difficulty` · `modality` · `rating` · `num_reviews` · `last_updated_year`
`skills_taught` + `tag_confidence` + `tags_verified` · `prerequisite_skills`
`is_elective` · `topic`

---

## 5. Intake & Profiling

### 5.1 Evidence gathering `W1`

**Principle: evidence proposes, the quiz verifies.** A resume claim never becomes mastery without either a probe or an explicit confidence downgrade.

1. **Resume parsing** — `pdfplumber` bounding-box clustering handles two-column and sidebar layouts without cross-column text interleaving; `python-docx` for Word. Extraction is evidence-grounded:
   $$\text{SkillEntity} = \{\text{name}, \text{canonical\_id}, \text{evidence\_quote}, \text{years\_exp}, \text{confidence}\}$$
2. **GitHub profiler** — public REST, **no OAuth required**. Language byte counts, frameworks from `requirements.txt` / `package.json`, commit recency, repository depth. Behavioural evidence rather than self-report.
3. **Canonical mapping** — "deep learning" → `neural-networks`, via the embedding model already loaded for retrieval. No new infrastructure.

### 5.2 Targeted diagnostic

Do not quiz everything, and do not quiz randomly. Rank candidate skills by:

$$\text{probe\_priority}(s) = \text{uncertainty}(s) \times \text{downstream\_fan\_out}(s)$$

Fan-out is what makes this work: a wrong *Linear Algebra* estimate poisons every downstream estimate, while a wrong leaf estimate costs almost nothing. **The same fan-out weighting is reused for review urgency in §6.2 — one idea, two uses.**

Probe **4–6 skills × 2–3 items ≈ 10–15 questions (~4 minutes)**, stopping early per skill once θ converges. That adaptivity is what makes it a CAT rather than a fixed quiz.

### 5.3 Mastery is per-skill, with confidence

Not a single global θ. Each skill carries mastery **and** how much that number can be trusted:

| Evidence state | Mastery source | Confidence |
|---|---|---|
| Probed by quiz | IRT θ | High |
| Evidenced, unprobed | Resume / GitHub prior | Medium |
| No evidence | Assumed low | Low (wide band) |

The gap engine consumes uncertainty honestly — an unverified claim is probed or conservatively discounted, never silently trusted. This is what makes "zero-assumption" a real property rather than a slogan.

---

## 6. Signature Features

### 6.1 Poincaré hyperbolic skill projection

Hyperbolic space ($\mathbb{H}^n$, Poincaré disk model) represents hierarchical trees with exponential volume expansion and no distortion, unlike Euclidean space.

**Coordinates are derived deterministically, not trained.** Radius from DAG depth (foundations near the origin $r \to 0$, specialisations toward the boundary $r \to 1$); angle from branch sector, subdivided per subtree. This is a genuine Poincaré disk, and the geodesic distance applies exactly as written:

$$d_{\mathbb{H}}(u, v) = \operatorname{arcosh}\left(1 + 2\frac{\|u - v\|^2}{(1 - \|u\|^2)(1 - \|v\|^2)}\right)$$

Numerical guards: norms clipped to $1 - \varepsilon$; distance is symmetric and non-negative (asserted in tests).

Described accurately as a **hierarchy-derived Poincaré projection**; trained hyperbolic embeddings are the next iteration. This is deliberate — an untuned trained layout looks worse and carries real tuning risk.

Rendered as **D3 + SVG in an inverted dark panel** — concentric guide circles, a current-skill centroid pin, a target-role pin, one curved geodesic arc labelled with $d_{\mathbb{H}}$.

### 6.2 Skill decay & Ebbinghaus spaced repetition

Retention follows $R(t) = e^{-t/S}$, colour-coded green (fresh > 70%), amber (at risk 40–70%), red (decayed < 40%), with a 1-click 2-minute micro-review.

**Review urgency is weighted by prerequisite fan-out:**

$$\text{urgency}(s) = (1 - R_s) \times \text{downstream\_dependents}(s)$$

A decayed *foundation* outranks a decayed leaf. This reuses the DAG already built and is far more defensible than raw decay ordering.

### 6.3 "What-if" career branching

Branch into alternative trajectories and compare. The headline figure is **shared versus incremental effort**, which A\* already produces — *"32h to ML Engineer, or 80h to MLOps Architect, 48 of which overlap"* — rather than an unjustifiable "% match" number.

### 6.4 Prerequisite conflict & 1-click relaxer

Feasibility is arithmetic:

$$\sum_{c \in \text{Path}} \text{Hours}(c) > \text{HoursPerWeek} \times \text{WeeksToDeadline}$$

On conflict, offer **ranked options with computed consequences** — *"drop 2 electives → −18h, all target skills still covered"* / *"extend 3 weeks"* / *"increase to 20h/week"* — not a single generic toggle. Requires `is_elective` on the resource schema.

### 6.5 Multi-constraint A\* pathfinder

$$f(n) = g(n) + h(n)$$
$$g(n) = w_t \cdot \text{Time}(n) + w_c \cdot \text{Cost}(n) + w_d \cdot \text{DiffDelta}(n) - w_e \cdot \text{PriorExp}(n)$$

`h(n)` is an admissible heuristic over remaining skill gaps. Cycle detection and topological validation via Kahn's algorithm; **the violation count is asserted to be zero in tests and surfaced in the UI**.

**A\* sequences skill nodes, not course nodes.** Courses have messy inter-dependencies; canonical skills have clean ones. Each sequenced skill then binds its best resource. This keeps the graph small and guarantees acyclicity.

**Budget is a hard ceiling enforced at bind time, not inside A\*.** Constrained shortest path with a budget dimension is NP-hard in general, and carrying cumulative spend in the search state explodes the frontier. Instead: bind the best affordable resource per skill, then downgrade the most expensive picks to free equivalents until the total fits — *"swapped 2 paid courses for free equivalents to fit $50; same skills, +4 hours."*

**The priority control is a 3-way segmented control** (Fastest · Cheapest · Most Rigorous), not three independent toggles — those would yield eight ambiguous combinations. Switching re-runs the planner and surfaces the trade-off: *"saves $180, adds 12 hours."*

### 6.6 In-browser practice lab `W3`

Client-side **Pyodide (WebAssembly)** loading NumPy, Pandas, SciPy, scikit-learn and Matplotlib, executing without a server round-trip. Lazy-loaded on route only — the runtime is a 30–50MB download.

Exercises cover algorithmic implementations, data pipelines, model training and evaluation, and deep-learning micro-architectures, with a hidden-edge-case test harness returning pass/fail telemetry.

**The real cost is exercise authoring, not the runtime.** Two mitigations: restrict to programming-capable skills (`skill.is_programming`), and generate problem + reference solution + tests together, then **run the reference solution against its own tests before showing it**, regenerating on failure. Passing results feed back into mastery θ so the lab is not disconnected from the roadmap.

> A backend execution sandbox is explicitly **out of scope**. Pyodide alone suffices, and a server-side code runner is a security liability we decline to take on.

### 6.7 Socratic misconception engine `W2`

**Trigger**: an incorrect quiz answer or buggy playground logic.
**Rule**: never reveal the answer, never give passive hints.

1. **Guided questioning (2–3 steps)** leading the learner to the principle
2. **Interactive visual counter-example** — e.g. a colour-coded matrix dimension diagram
3. **1-minute concept lock-in** check before moving on

**A misconception taxonomy is what makes this work.** Generic "ask guided questions" prompting produces generic questions. Each quiz option maps to a *named* misconception (`confuses transpose with inverse`, `off-by-one on index`) via `quiz_option.misconception_id`, giving the LLM a specific target to dismantle. This is also what makes the visual counter-example possible — **you cannot draw a counter-example to an unknown error.**

### 6.8 Adaptive roadmap detour engine

**Trigger**: two attempts below 50% on a skill despite Socratic guidance, or explicit "too difficult".

1. **Concept graph query** — locate the root missing upstream concept (e.g. *Multivariate Chain Rule* beneath *Backpropagation*)
2. **Remedial retrieval** — a short, high-impact resource
3. **Non-destructive splice** — insert a detour node into the active milestone without resetting completed work or reordering downstream nodes
4. **UI** — *"Quick 10-min foundation refresher to unlock this module."*

**Guard**: never insert a remediation for a node that is already a remediation, and cap detours per skill. A prior internal build shipped exactly this infinite loop.

### 6.9 Job demand, budget & crash-course mode `W2`–`W3`

Learner-supplied budget and time availability are first-class constraints (§6.5). Job-market demand ranks **suggested career goals** and breaks ties among **optional electives** — deliberately *not* an eighth reranker factor, since the reranker scores resources within a skill while demand is a property of roles.

Demand figures come from a **curated snapshot, labelled with its date in the UI**. There is no free live job-postings API worth building on, and a fabricated live feed is exactly the claim a judge will probe.

**Crash-course mode** is a preset: strip electives, weight toward short high-yield resources, re-run the planner.

---

## 7. Data Provenance & Fidelity

A prototype may seed data; it may not misrepresent it.

### 7.1 Course duration — a worked example of the principle

Only ~54% of the Coursera catalog exposes a workload string, and descriptions state a duration in just 1% of cases. Options were **measured, not assumed**:

| Approach | MAE |
|---|---|
| Global-median baseline | 5.68h |
| TF-IDF → ridge regression (log target) | **4.43h** |
| Bucket classification | 4.86h |

Duration is genuinely hard to predict from text — the same blurb describes a 2-hour lab or a 20-hour course. Chasing accuracy here is low return, and **false precision is the real risk**. So the design records provenance instead:

| Source | Coverage | Rendered as |
|---|---|---|
| `PARSED` | 50% of catalog (92% of strings present) | `18h` |
| `ESTIMATED` | 45% | `~3–8h` |
| `FALLBACK` | remainder | wide band |

The tilde is load-bearing: a user can distinguish what the system knows from what it inferred. A reranker tiebreak toward known durations further skews *selected* courses toward exact values, so the headline path total rests mostly on real numbers.

### 7.2 What may be seeded

**Acceptable**: seeded learner history (study logs, review timestamps, streaks), a dated job-demand snapshot, deterministic Poincaré coordinates, pre-authored quiz items and misconceptions.

**Never**: fabricated course titles or URLs (the problem statement names inventing fictitious courses as the failure being solved), and displayed scores that were not produced by the engine.

---

## 8. Interface Design

### 8.1 Design direction — Swiss precision

> This section supersedes the earlier "Obsidian Glass" dark theme. The implemented direction is **Squarespace-style luxury minimalism**: pure white canvas, alabaster surfaces, 1px hairline rules, solid black pill actions, high-contrast grotesque typography.

Source of truth for tokens is the `:root` block in `ui_designs/ui_preview.html` — it carries the `-bg` tint variants that `DESIGN_SYSTEM.md` omits.

```css
--canvas: #FFFFFF;   --surface: #F9F9FB;   --card: #FFFFFF;
--border: #EAEAEA;   --border-hover: #D1D5DB;
--ink: #0B0B0C;      --ink-muted: #6B7280;  --ink-subtle: #9CA3AF;
--pill: #000000;                            /* the one signature action */

--mastered: #10B981;  --mastered-bg: #ECFDF5;   /* mastered · fresh >70%  */
--active:   #2563EB;  --active-bg:   #EFF6FF;   /* in progress            */
--at-risk:  #F59E0B;  --at-risk-bg:  #FFFBEB;   /* at risk 40–70%         */
--gap:      #EF4444;  --gap-bg:      #FEF2F2;   /* gap · decayed <40%     */

--obsidian: #0B0B0C;  --geodesic: #38BDF8;      /* the Poincaré inversion */
```

Typography: **Plus Jakarta Sans** (display), **Inter** (body), **JetBrains Mono** (code).

**Rule: no raw hex in components.** The accents are semantic; hardcoding one breaks the visual language that makes the DAG readable at a glance.

Three details carry the whole aesthetic:
1. **One solid black pill per screen** — a cognitive-load rule as much as an aesthetic one; two primary actions force a decision before the user can act
2. **Elevation is a 1px hairline, never a shadow**
3. **Whitespace is not wasted space** — the system's legibility comes from restraint

**The single inversion**: the Poincaré disk sits in a near-black inset card with a glowing geodesic. Inverted panels for emphasis are a legitimate Swiss pattern, and it buys the striking image for one component's theming rather than the whole application.

### 8.2 Information density

Every page gets **one primary job** and at most three tiers: the answer the user came for (T1), 3–5 supporting items (T2), everything else behind a click or hover (T3).

| Page | Primary job | Density budget |
|---|---|---|
| 1 · Intake | Understand the learner | **Sequential reveal**: goal → evidence → quiz, never simultaneously |
| 2 · Hub | Orient | ≤ 5 elements; readiness ring + **one** next action |
| 3 · Roadmap | Show the route | ≤ 4 facts per card |
| 4 · Catalog | Justify **one** choice | ≤ 4 content clusters |
| 6 · Analytics | Show retention state | one visualisation at a time; ≤ 7 rows before "show all" |
| 7 · What-If | Compare trajectories | 3 cards + one overlap diagram |

Numbers carry direction and unit (`Gap ↓ 18%`, not `−18%`). Progressive disclosure beats density.

### 8.3 Visualisation technology

| Surface | Technology | Rationale |
|---|---|---|
| Prerequisite DAG | **CSS grid + SVG connectors** | Page 3 is a fixed 4-column phase layout, not a free-form graph — no auto-layout engine needed |
| Poincaré disk | **D3 + SVG**, dark inset | `d3-zoom` free; nodes are DOM elements, so tokens and tooltips work naturally |
| Retention bars | Plain divs + tokens | Three-state colour coding |
| 52-week heatmap | CSS grid + `d3-scale-chromatic` | Grid is trivial; D3 only for colour interpolation |
| Rings | SVG `stroke-dasharray` | Calibration and readiness |
| Motion | **Framer Motion** | State transitions only |

**D3 usage boundary: React owns the DOM, D3 owns the math.** Use `d3-scale`, `d3-shape`, `d3-zoom`, `d3-interpolate` as calculation libraries and render with JSX. Never `d3.select().append()` — D3 and React both mutating the same nodes produces ghost elements.

**Motion discipline**: animate state transitions (node unlocking, milestone completion, path recalculation, detour insertion), never decoration. On a minimal white system, ambient motion reads as noise and costs the rubric's "sub-second UI updates" line.

### 8.4 Navigation

Top bar — `PATHFINDER` wordmark · sections (Intake · Roadmap · Catalog · Analytics) · profile affordance — with breadcrumbs on detail pages.

> The floating macOS-style dock from the earlier draft is **dropped**. No mockup uses it, and conventional top navigation suits the Swiss system better.

---

## 9. Backend & Delivery

### 9.1 Stack

| Concern | Choice | Rationale |
|---|---|---|
| Backend | FastAPI + Pydantic v2 | NetworkX, BM25 and the embedding stack have no credible TypeScript equivalent. Pydantic guarantees the frontend contract; TS types are generated from the OpenAPI schema. |
| Embeddings | **`fastembed` (ONNX)** | ~50MB and instant startup. `sentence-transformers` drags ~2GB of PyTorch to encode a few hundred short strings. **Do not add torch.** |
| Vector search | numpy dot product | At this scale a vector DB is pure overhead — 23k × 384 resolves in ~5ms |
| Sparse retrieval | `rank-bm25` (BM25Okapi) | Matches the spec formula directly |
| Graph | NetworkX | Kahn topological sort, `is_directed_acyclic_graph()` |
| Frontend | Next.js 16 · React 19 · Tailwind v4 | |
| Deployment | **Vercel** + **Hugging Face Spaces (Docker)** | HF free CPU gives 2 vCPU / 16GB — comfortable for ONNX + numpy. Render's 512MB free tier sleeps after 15 min, so a judge would wait ~50s on a cold start. |

### 9.2 LLM integration

| Seam | Provider | Model |
|---|---|---|
| Structured decomposition | Google AI Studio | `gemini-2.5-flash` — 1.4s, native JSON-schema output |
| Streaming chat | Groq | `openai/gpt-oss-120b` — 0.63s |

Both chosen by **live measurement, not memory**. Model IDs go stale fast: `gemini-2.0-flash` is retired and Groq no longer serves any Llama chat model. On a 404, list the provider's models before editing code.

**Resilience**: an ordered fallback chain plus a cached fixture for the canonical demo goal. Free tiers rate-limit; the demo must never hard-fail mid-judging. All keys are server-side — never `NEXT_PUBLIC_*`.

**Deterministic guardrails**: all numerical recommendations, rankings and sequences are computed before any LLM call. Low temperature, strict JSON schemas.

### 9.3 Round 1 simplifications

Stated as current-iteration choices in the README, not concealed:

- **Stage 0 evidence gathering is deferred to `W1`.** Round 1's diagnostic is a fixed, untargeted 4-question calibration producing a single global θ. The resume dropzone and GitHub field render but are visibly inert.
- **Poincaré coordinates are hierarchy-derived**, not trained embeddings.
- **Retention analytics run on seeded study history**, not live telemetry.
- **Catalog is ~70 curated courses** in Round 1; full 23.6k index lands `W1`.

### 9.4 Verification

- DAG acyclic; every resource's skill ids resolve to known skills
- Gap math matches `max(0, req − current)` on hand-computed fixtures
- **7-factor weights sum to exactly 1.0** — a prior build added an unnormalized bias term reaching 1.45
- Target-skill vectors built explicitly, never via object-spread precedence
- **A\* output passes topological validation with zero prerequisite violations**
- Detour insertion preserves completed nodes and downstream ordering, and never remediates a remediation
- Poincaré coordinates satisfy $\|v\| < 1$; geodesic distance symmetric and non-negative
- `/api/plan` returns a schema-valid path in **< 1s** warm; provider failure falls back correctly
- All six architectural coupling rules hold

### 9.5 Pre-seeded tracks

1. **AI / Machine Learning Engineer** — Linear Algebra, PyTorch, Transformers, LLMs, MLOps *(Round 1 track)*
2. **Full-Stack Web Developer** — TypeScript, React, Next.js, Node.js, PostgreSQL, System Design
3. **Cloud & DevOps Architect** — Linux, Docker, Kubernetes, AWS/GCP, Terraform, CI/CD
4. **Data Engineer / Scientist** — SQL, Pandas, Spark, BigQuery, Airflow, Statistical Modelling
5. **Cybersecurity Specialist** — Network Security, Cryptography, Ethical Hacking, SIEM, DevSecOps

Plus dynamic decomposition for any custom role — no path is hardcoded.

---

## Appendix — Scope decisions

Recorded so they are not silently reversed:

| Decision | Rationale |
|---|---|
| **Cut**: hidden prerequisite edge discovery | Requires a learner population; with one demo user it can only be faked. Presented as future work. |
| **Cut**: backend code-execution sandbox | Pyodide suffices; a server-side runner is a security liability. |
| **Cut**: proctored exams with webcam telemetry | Outside all six deliverables. |
| **Cut**: floating macOS dock | Superseded by top navigation. |
| **Deferred**: trained hyperbolic embeddings | Deterministic layout is visually equivalent, mathematically valid, and carries no tuning risk. |
| **Deferred**: live job-postings integration | No free source worth building on; dated snapshot instead. |
