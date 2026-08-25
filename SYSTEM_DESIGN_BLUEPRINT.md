# System Design Blueprint & Master Implementation Specification

> **Project**: AI-Powered Personalized Learning Path Recommender (HCLTech AMPlified - Round 2)  
> **Target Alignment**: Next-Generation Adaptive Upskilling & Talent Transformation (HCLTech Career Shaper™)  
> **Status**: Planning & Architecture Phase (Live Blueprint)

---

## 1. System Overview & Core Philosophy

The system transforms raw learner aspirations into personalized, topologically sequenced, mathematically grounded, and dynamically adaptive learning roadmaps. 

### Core Architectural Principle: Hybrid Deterministic + Generative Paradigm
- **Generative AI (LLMs)**: Natural language intake, semantic resume parsing, Socratic dialogue synthesis, and conversational explanations.
- **Deterministic AI / ML Algorithms**: Hyperbolic Poincaré embeddings, BM25 + dense semantic retrieval, 7-factor candidate scoring, $A^*$ prerequisite graph traversal, topological validation, and Ebbinghaus memory decay modeling.

---

## 2. Architecture: The 6 Core Deliverables + Custom Innovations

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                SYSTEM ARCHITECTURE & DATA FLOW                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  [1. Intake & Profiling]                                                                         │
│  ├── Multi-Modal Resume & Profile Parser (Layout-Aware PDF/DOCX + GitHub Profile)                │
│  ├── Zero-Assumption Diagnostic Engine (3-Min Adaptive CAT / 2PL-IRT)                            │
│  └── Poincaré Hyperbolic Hierarchical Skill Mapping (Disk Geodesics)                             │
│                                                                                                  │
│  [2. Skill Gap & Constraint Engine]                                                              │
│  ├── CoT Skill Decomposition (GenMentor Pattern: Goal -> Competency -> Granular Skill)           │
│  ├── Deterministic Gap Formula: SkillGap(s) = max(0, Req(s) - Current(s))                        │
│  └── Prerequisite & Time Conflict Detection (Hours/Week vs Deadline Feasibility)                │
│                                                                                                  │
│  [3. Hybrid Recommendation & Multi-Constraint Pathfinder]                                        │
│  ├── Hybrid Retrieval: Score = α · CosineSim(v_goal, v_res) + (1-α) · BM25(q, d)                 │
│  ├── 7-Factor Deterministic Re-Ranker (Coverage, Relevance, Pre-reqs, Difficulty, Modality...)   │
│  └── Multi-Constraint A* Graph Planner (Optimizing for Time, Cost, Difficulty, Experience)       │
│                                                                                                  │
│  [4. Execution, Practice & Explainability]                                                       │
│  ├── Metric-Grounded Explanations (KnowPath Pattern: Gap Δ, Pre-reqs, Match Scores)              │
│  ├── In-Browser Code Playground / Practice Sandbox                                               │
│  └── "What-If" Roadmap Branching Sandbox (Compare multi-track careers)                           │
│                                                                                                  │
│  [5. Adaptive Telemetry & Remediation Engine]                                                    │
│  ├── Socratic Misconception Diagnostic Engine (Counter-examples + 2-3 guided questions)          │
│  ├── Dual-Graph Rerouting (DLELP/KnowLP: Concept Similarity Bridge on Blockage)                 │
│  ├── Skill Decay Heatmap & Ebbinghaus 2-Minute Micro-Review Scheduler                            │
│  └── LeetCode-Style Analytics Dashboard & Activity Heatmap                                       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Multi-Modal Resume & Profile Ingestion Pipeline
* **Layout-Aware Extraction Architecture**:
  1. **Document Layer Sorting**: Uses `pdfplumber` bounding-box coordinate clustering to parse complex 2-column, sidebar, and tabular resume layouts without cross-column text interleaving.
  2. **DOCX Parsing**: Structured XML / `python-docx` traversal extracting tables, bulleted lists, and project descriptions.
  3. **Visual & Multi-Modal Fallback**: Vision-enabled OCR fallback (Gemini Vision API) for graphic-heavy, styled, or scanned resumes with logos and custom visual iconography.
  4. **Evidence-Grounded Extraction**: Extracts skills with explicit textual provenance:
     $$\text{SkillEntity} = \{\text{name}, \text{canonical\_id}, \text{evidence\_quote}, \text{years\_exp}, \text{confidence\_score}\}$$
* **GitHub Repository Profiler**:
  - Analyzes public GitHub repositories: programming languages, framework usage, commit frequency, and repository architectural complexity.

### 2.2 Zero-Assumption Adaptive Diagnostic Engine (CAT & 2PL-IRT)
* **Goal**: Achieve $>95\%$ calibration accuracy of baseline mastery without making naive assumptions from raw resume keywords.
* **Computerized Adaptive Testing (CAT) via 2-Parameter Item Response Theory (2PL-IRT)**:
  $$P(Y=1 \mid \theta) = \frac{1}{1 + e^{-a(\theta - b)}}$$
  Where $\theta \in [0.0, 1.0]$ is the learner's true latent ability, $b$ is question difficulty, and $a$ is question discrimination power.
* **Dynamic 3-Minute Execution**:
  1. Identifies borderline or high-impact prerequisite skills extracted from the profile.
  2. Synthesizes 3–5 targeted, scenario-based debugging/architecture questions using deep reasoning LLM.
  3. Dynamically updates $\theta$ after each response using Bayesian maximum-likelihood estimation (MLE), rapidly converging to $>95\%$ confidence on true baseline mastery in under 3 minutes.


---

## 3. Detailed Specification for the 8 Signature Features

### 3.0 Multi-Platform Educational Catalog & Prerequisite Knowledge Engine
* **Supported Course Providers**:
  - **Coursera**: Structured specializations, academic rigor, graded assessments, university certifications.
  - **Udemy**: Hands-on practical bootcamps, project-based courses, commercial skill focus, price/discount attributes.
  - **YouTube Tutorials**: Modular crash courses, full free playlists, cutting-edge tech tutorials with direct timestamped links.
  - **Interactive Labs & Official Docs**: Hands-on coding sandboxes, documentation tutorials (e.g., PyTorch, MDN, Kubernetes docs).
* **Canonical Concept-to-Course Binding (EduCOR Schema)**:
  $$\text{Canonical Skill/Topic DAG} \xleftarrow{\quad\text{Maps To}\quad} \text{Multi-Platform Resources (Coursera / Udemy / YouTube)}$$
  - Instead of relying on unreliable course-to-course links, the system maps all external resources to an authoritative, cycle-free **Canonical Concept Prerequisite DAG**.
  - **Ingestion & Metadata Schema**:
    - `id`, `title`, `provider`, `url`, `thumbnail_url`
    - `duration_hours`, `cost_type` (`Free` vs `Paid`), `price_usd`
    - `difficulty` (`Beginner`, `Intermediate`, `Advanced`)
    - `modality` (`Video Lecture`, `Hands-on Lab`, `Reading/Docs`, `Capstone Project`, `Assessment`)
    - `rating`, `num_reviews`, `last_updated_year`
    - `skills_taught` (Granular skill ontology tags)
    - `prerequisite_skills` (Required incoming mastery)
    - `dense_embedding` (Pre-calculated dense vector for sub-second semantic retrieval)
* **Hybrid Dynamic Indexing**: Pre-indexed master catalog of top-tier verified courses + real-time search enricher (YouTube & Web API integration) with instant dense embedding computation and canonical DAG binding.

### 3.1 Poincaré Hyperbolic Skill Hierarchy & Geodesic Projection
* **Theoretical Grounding**: Hyperbolic space ($\mathbb{H}^n$, Poincaré disk model) naturally represents hierarchical tree structures with exponential volume expansion without distortion compared to Euclidean space.
* **Mechanism**:
  1. Map course ontology and skill taxonomy to Poincaré disk coordinates $(r, \theta)$ where $r \in [0, 1)$. Foundational root concepts cluster near origin $r \to 0$, and specialized leaf skills disperse near the disk boundary $r \to 1$.
  2. Embed learner's current verified skills as a centroid/pin $P_{\text{current}}$.
  3. Embed target career goal as target pin $P_{\text{target}}$.
  4. Compute the hyperbolic geodesic distance:
     $$d_{\mathbb{H}}(u, v) = \text{arcosh}\left(1 + 2 \frac{\|u - v\|^2}{(1 - \|u\|^2)(1 - \|v\|^2)}\right)$$
  5. Calculate and render the circular arc geodesic curve connecting $P_{\text{current}}$ and $P_{\text{target}}$, highlighting missing leaf competencies.
* **Frontend Visualization Engine**: High-performance interactive HTML5 Canvas / D3.js with hyperbolic pan/zoom, animated glowing geodesics, and zero-clutter progressive disclosure (clean tooltips showing skill name, mastery level, and gap delta on hover).


### 3.2 Skill Decay Heatmap & Ebbinghaus Spaced Repetition
* **Theoretical Grounding**: Ebbinghaus Forgetting Curve $R(t) = e^{-\frac{t}{S}}$, where $R$ is retention, $t$ is time elapsed since review, and $S$ is memory stability.
* **Mechanism**:
  - Color-codes learner competencies in Red (decayed $< 40\%$), Yellow (at risk $40-70\%$), and Green (fresh $> 70\%$).
  - Schedules dynamic 2-minute micro-review quizzes right when foundational prerequisite nodes are about to decay.

### 3.3 "What-If" Career Branching Sandbox
* **Mechanism**:
  - Enables learners to branch from their current node into alternative career trajectories (e.g., from *Backend Engineer* $\rightarrow$ *DevOps* vs. *Cloud Architect* vs. *MLOps*).
  - Highlights shared foundation vs. incremental unique effort and calculated transition time.

### 3.4 Mathematical Prerequisite Conflict & 1-Click Relaxer
* **Mechanism**:
  - Validates total path duration against learner's weekly commitment:
    $$\sum_{c \in \text{Path}} \text{Hours}(c) > \text{AvailableHours/Week} \times \text{WeeksToDeadline}$$
  - Identifies critical path bottleneck and provides a 1-click action to extend deadline, filter out optional electives, or increase weekly commitment safely.

### 3.5 Multi-Constraint $A^*$ Pathfinder
* **Mechanism**:
  - Cost function: $f(n) = g(n) + h(n)$
  - $g(n) = w_t \cdot \text{Time}(n) + w_c \cdot \text{Cost}(n) + w_d \cdot \text{DifficultyDelta}(n) - w_e \cdot \text{PriorExp}(n)$
  - $h(n)$: Admissible heuristic distance to goal state across remaining skill gaps.
  - Cycle detection and topological validation via Kahn's algorithm.

### 3.6 In-Browser Code Playground & ML/Data Science Verification Engine
* **Execution Architecture (Pyodide WebAssembly + Backend Sandbox)**:
  - **Client-Side Pyodide (Wasm)**: Loads `numpy`, `pandas`, `scipy`, `scikit-learn`, and `matplotlib` directly in the browser's WebAssembly sandbox. Executes in sub-50ms without server round-trips.
  - **Backend Sandbox Fallback**: Isolated FastAPI container for heavy execution tasks or multi-file scripts.
* **Domain-Specific ML & Data Science Coding Modules**:
  1. **Algorithmic & Math Implementations**: Coding vector operations, manual gradient descent updates, Cosine/Euclidean similarity functions, Softmax/Cross-Entropy losses, and A* heuristic scoring.
  2. **Data Pipeline & Feature Engineering**: Pandas dataframe manipulation, missing value imputation, one-hot encoding, and feature scaling tasks.
  3. **Model Training & Evaluation**: Scikit-learn pipelines, hyperparameter tuning (GridSearchCV), confusion matrix generation, and precision/recall/F1 scoring.
  4. **Deep Learning Micro-Architectures**: Writing tensor transformations, PyTorch forward passes, attention matrix dot-products, and token embedding lookups.
  5. **Live Visualization Output**: Dynamic rendering of Matplotlib/Seaborn plots (decision boundaries, loss curves, clustering graphs) right in the web output console.
* **Automated Test Harness**: Pre-configured test cases with hidden edge cases (e.g. empty arrays, zero-division, mismatched tensor dimensions) returning instant pass/fail telemetry.

### 3.7 Socratic Misconception Diagnostic Engine (Stage 1: Micro-Level)
* **Trigger**: Fires immediately whenever a learner selects an incorrect answer on a quiz or writes buggy logic in the playground.
* **Strict Pedagogical Rule**: **NEVER** give away the answer or provide passive hints.
* **Execution Flow**:
  1. **Active Guided Questioning (2-3 Steps)**: Poses targeted questions that lead the learner to recall fundamental principles and reason their way to the correct answer.
     - *Example*: Learner forgets to transpose a weight matrix in backpropagation.
     - *Question 1*: *"Recall matrix multiplication $(A \times B) \cdot (C \times D)$. What condition must hold between the inner dimensions $B$ and $C$?"*
     - *Question 2*: *"If input $X$ is shape $(128, 512)$ and weights $W$ are $(256, 512)$, how must we transform $W$ so the inner dimensions match?"*
  2. **Interactive Visual Counter-Example**: Displays an animated or color-coded matrix dimension diagram showing the mismatch error.
  3. **1-Minute Concept Lock-In**: A fast single-check question ensuring the mental model is permanently corrected.

### 3.7.1 Adaptive Roadmap Detour Engine (Stage 2: Macro-Level)
* **Trigger**: Activated if a learner continues to struggle (e.g., scoring $<50\%$ twice despite Socratic guidance), indicating a missing foundational prerequisite.
* **Algorithmic Mechanics**:
  1. **Prerequisite & Concept Graph Query**: The engine traverses the knowledge graph to identify the root missing upstream concept (e.g., `Multivariate Chain Rule` missing before `Backpropagation`).
  2. **Remedial Micro-Lesson Insertion**: Automatically retrieves a high-impact, short tutorial (e.g., a 10-minute visual explainer from 3Blue1Brown or interactive documentation).
  3. **Non-Destructive Graph Detour**: Dynamically splices a `[Remediation Detour]` node into the active milestone without resetting or altering completed downstream goals.
  4. **UI Notification & Unlock**: The user's roadmap highlights the detour with an encouraging badge: *"Quick 10-min foundation refresher to unlock your current module"*. Completing it seamlessly unlocks the blocked module.



## 5. UI Component Systems & Interaction Recipes (21st.dev, Aceternity UI, Magic UI)

### 5.1 Color Tokens & Semantic Layering (Obsidian Glass Architecture)
```css
/* Deep Obsidian & Slate Backgrounds */
--bg-canvas: #08090C;         /* Main application canvas */
--bg-surface-1: #0D0F14;      /* Card & sidebar containers */
--bg-surface-2: #13161F;      /* Elevated cards & active states */
--bg-surface-3: #1A1E2B;      /* Popovers, tooltips, modals */

/* Micro-Borders & Neon Accents */
--border-subtle: rgba(255, 255, 255, 0.08);
--border-hover: rgba(255, 255, 255, 0.20);
--accent-cyan: #06B6D4;       /* Hyperbolic geodesic & active node */
--accent-indigo: #6366F1;     /* AI Path recommendation flow */
--accent-violet: #8B5CF6;     /* Target career goal pin */
--accent-emerald: #10B981;    /* Mastered skill & fresh retention (>70%) */
--accent-amber: #F59E0B;      /* In-progress & at-risk retention (40-70%) */
--accent-rose: #F43F5E;       /* Decayed skill (<40%) & prerequisite bottleneck */
```

### 5.2 Key Component Recipes Selected for the Platform
1. **Interactive Poincaré Canvas & Skill DAG (React Flow + Canvas)**:
   - Hyperbolic disk projection with animated circular arc geodesics and interactive node popovers.
   - Skill tree nodes featuring status badges (`mastered`, `in-progress`, `recommended`, `locked`), XP rewards, and estimated study hours.
2. **Tracing Beam Milestone Roadmap (Aceternity UI pattern)**:
   - Scroll-linked glowing gradient beam tracing down the curriculum phases.
   - Course cards displaying provider badges (Coursera, Udemy, YouTube), duration, and metric-grounded justification chips.
3. **Learner Bento Dashboard Grid (21st.dev / Linear pattern)**:
   - Dynamic radial spotlight following cursor position.
   - High-density cards for:
     - **AI Recommendation Engine Spotlight** (Primary next action with +XP gain).
     - **Daily Study Streak & Flame Multiplier**.
     - **Role Readiness Index & Elo Score**.
     - **Instant Code Sandbox Mini-Launcher**.
4. **Socratic Diagnostic Studio & Wasm Code Runner**:
   - In-browser code console with Pyodide Wasm execution for NumPy, Pandas, Scikit-learn, and live Matplotlib loss curve output.
   - 3-Step Guided Socratic dialogue and interactive visual dimension mismatch diagrams.
5. **LeetCode-Style Activity Heatmap & Skill Retention Hex-Grid**:
   - 52-week activity contribution grid with interactive hover tooltips showing daily topics studied.
   - Ebbinghaus retention matrix with 1-click **"2-Minute Micro-Review"** triggers.
6. **Floating macOS-Style Navigation Dock**:
   - Persistent bottom dock with spring physics magnification for zero-friction switching between **Intake**, **Poincaré Skill Radar**, **Roadmap**, **Coding Lab**, and **Analytics**.

## 6. Dynamic Continuous Learning & Feedback Reasoning Engine


```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       DYNAMIC FEEDBACK & ADAPTIVE REASONING ENGINE                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  [Multi-Source Feedback Intake]                                                             │
│  ├── Explicit: 1-5 Star Ratings, "Too Easy/Hard" tags, "Already Know This" overrides        │
│  └── Implicit: Quiz accuracy, Code playground attempts, time spent, review responsiveness    │
│                                      │                                                      │
│                                      ▼                                                      │
│  [Bayesian Parameter & Weight Calibration]                                                  │
│  ├── 7-Factor Re-ranker weight adjustment (Modality, Difficulty Fit, Gap Reduction)        │
│  └── Learner Latent Ability θ dynamic update via Item Response Theory (IRT)                 │
│                                      │                                                      │
│                                      ▼                                                      │
│  [Knowledge Graph Edge Discovery & Self-Healing]                                            │
│  ├── Hidden Dependency Detector: Discovers unmapped prerequisites from failure clusters     │
│  └── Concept Bridge Synthesizer: Dynamically updates remediation lookup graph               │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Multi-Source Feedback Intake
1. **Explicit Feedback Channels**:
   - Resource-level ratings and tags (*"Crystal Clear"*, *"Too Theoretical"*, *"Too Difficult"*, *"Outdated"*).
   - Direct node overrides (*"Skip, I already mastered this"* $\to$ immediately marks node complete and recalculates downstream $A^*$ path).
2. **Implicit Behavioral Telemetry**:
   - Quiz scores and time-to-completion per question.
   - Code playground execution attempts, error types, and Socratic hint usage.
   - Velocity tracking (actual hours completed vs. scheduled weekly targets).

### 6.2 Adaptive Re-Ranking & Pacing Calibration
* **Dynamic Modality Tuning**: If telemetry shows higher completion rates on video tutorials over written docs, the modality weight $w_5$ dynamically prioritizes hands-on video playlists from YouTube/Udemy.
* **Dynamic Difficulty Escalation**: If learner achieves $>90\%$ on first-try assessments, the system elevates their latent ability parameter $\theta$, automatically surfacing intermediate/advanced electives and compressing foundational modules.
* **Hidden Prerequisite Edge Discovery**: If a cluster of learners fail a specific downstream topic $T_{\text{target}}$, the engine identifies the common missing upstream concept $T_{\text{source}}$ and proposes a new prerequisite DAG edge with confidence score:
  $$\text{Confidence}(T_{\text{source}} \to T_{\text{target}}) = \frac{N(\text{Failed } T_{\text{target}} \mid \text{Missing } T_{\text{source}})}{N(\text{Total Failures})}$$

### 6.3 5 Pre-Seeded Industry Tracks + Dynamic Custom Role Generator
* **Pre-Seeded Master Tracks**:
  1. **AI / Machine Learning Engineer** (Linear Algebra, PyTorch, Transformers, LLMs, MLOps)
  2. **Full-Stack Web Developer** (TypeScript, React, Next.js, Node.js, PostgreSQL, System Design)
  3. **Cloud & DevOps Architect** (Linux, Docker, Kubernetes, AWS/GCP, Terraform, CI/CD)
  4. **Data Engineer / Scientist** (SQL, Pandas, Spark, BigQuery, Airflow, Statistical Modeling)
  5. **CyberSecurity Specialist** (Network Security, Cryptography, Ethical Hacking, SIEM, DevSecOps)
## 7. Catalog Verification & Dynamic Open-Ended Intake Architecture

### 7.1 Master Catalog Quality & Prerequisite Graph Verification Pipeline
1. **Curated High-Quality Source Base**:
   - 500+ structured courses and hands-on modules across Coursera (DeepLearning.AI, Stanford, Google), Udemy (top-rated bootcamps), YouTube (3Blue1Brown, Karpathy, StatQuest, freeCodeCamp), and official documentation.
2. **Automated Mathematical Quality Gates**:
   - **Strict Pydantic Schema**: Every course has validated `duration_hours`, `difficulty`, `cost`, `modality`, and `skills_taught`.
   - **DAG Cycle-Free Proof**: NetworkX cycle check (`nx.is_directed_acyclic_graph(G) == True`) mathematically proving zero recursive prerequisite deadlocks.
   - **Embedding Indexing**: Pre-computed 384/768-dimensional normalized dense vectors enabling sub-200ms vector search.

### 7.2 100% Dynamic Intake & Open-Ended Career Decomposition
```
[User Drops ANY PDF/DOCX Resume or Custom Goal]
                     │
                     ▼
[Layout-Aware Multi-Modal Parser + Evidence Extractor]
  Extracts: {Skill, Mastery Level (0.0-1.0), Text Evidence}
                     │
                     ▼
[Chain-of-Thought Goal Decomposer (GenMentor Pattern)]
  Goal ──► Job Responsibilities ──► Competencies ──► Granular Leaf Skills
                     │
                     ▼
[Deterministic Gap & Poincaré Projector]
  SkillGap(s) = max(0, Req(s) - Current(s))
  Computes hyperbolic geodesic distance d_H(P_current, P_target)
                     │
                     ▼
[Hybrid Retrieval + 7-Factor Re-Ranker + A* Sequencer]
  Matches skills to catalog / live YouTube enricher and generates topological milestones
```

### 7.3 Real-Time Dynamic Learning Adaptability
* **No Hardcoded Paths**: Learning paths are generated dynamically on-the-fly for every individual based on their unique skill gap matrix.
* **Continuous Recalibration**: Assessment results and user feedback directly adjust the $A^*$ search heuristic weights ($w_t, w_c, w_d, w_e$) to dynamically alter upcoming milestone difficulty and content formats.




---

## 4. ML Engine & Backend Architecture Specification

### 4.1 Why Python FastAPI Backend?
1. **Direct Mathematical & ML Library Integration**:
   - **Poincaré Hyperbolic Embeddings**: Python provides direct implementations (PyTorch, Gensim `PoincareModel`, Geoopt, Scipy) to compute hyperbolic geodesics $d_{\mathbb{H}}(u, v) = \text{arcosh}\left(1 + 2 \frac{\|u - v\|^2}{(1 - \|u\|^2)(1 - \|v\|^2)}\right)$ on the Poincaré unit disk.
   - **Graph Theory & Prerequisite DAGs**: NetworkX / Rustworkx for topological sorting (Kahn's algorithm), cycle detection, and custom heuristic $A^*$ graph search.
   - **Hybrid Retrieval**: Native `rank-bm25` (BM25Okapi) blended with `sentence-transformers` vector embeddings.
   - **Ebbinghaus Memory Math**: Vectorized NumPy/SciPy computation of exponential skill decay $R(t) = e^{-t/S}$.
2. **High-Throughput Asynchronous Performance**: Built on Starlette/Uvicorn ASGI with sub-millisecond route handling and server-sent event (SSE) streaming for conversational intake.
3. **Strict Type Safety**: Pydantic v2 schemas guaranteeing 100% data contract compliance between frontend and backend.

### 4.2 ML Engine Component Architecture
```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ML ENGINE ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  [Module A: Poincaré Skill Hierarchy Space]                                                 │
│  ├── Hyperbolic tree embedding of course & competency ontologies                            │
│  └── Geodesic distance calculator (Current skill centroid ──► Target goal pin)              │
│                                                                                             │
│  [Module B: Hybrid Retrieval & 7-Factor Re-Ranker]                                          │
│  ├── Dense Semantic Vector Index (Cosine Similarity)                                        │
│  ├── Sparse Lexical Index (BM25 Okapi)                                                      │
│  └── 7-Factor Weighted Scorer (Coverage, Relevance, Pre-reqs, Difficulty, Modality, etc.)     │
│                                                                                             │
│  [Module C: Deterministic Multi-Constraint A* Graph Planner]                                │
│  ├── Prerequisite DAG (Topological ordering & cycle-free verification)                      │
│  └── Heuristic Cost Optimizer (Minimizing time, cost, difficulty jumps vs. experience)      │
│                                                                                             │
│  [Module D: Dual-Graph Remediation & Socratic Diagnostic Engine]                            │
│  ├── Concept Similarity Graph (Bridge lookup when blockage is detected)                     │
│  ├── Ebbinghaus Memory Retention Matrix (Red/Yellow/Green skill decay tracking)             │
│  └── Socratic Misconception Evaluator (Guided 2-3 step questions + visual counter-examples) │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Frontend Design, Sleek UI & Animation Stack
* **Framework**: React / Next.js with TypeScript.
* **Styling & Aesthetics**: Tailwind CSS with custom Glassmorphic dark/light enterprise theme (deep obsidian backgrounds, vivid neon accents for active nodes, subtle gradients).
* **Animations & Micro-Interactions**: Framer Motion for smooth card reveals, milestone completion effects, glowing path pulses, and fluid modal transitions.
* **Interactive Visualizations**:
  - **Poincaré Disk**: Interactive 2D HTML5 Canvas / D3.js hyperbolic projection with draggable learner pins and curved geodesic paths.
  - **Prerequisite Roadmap**: Interactive React Flow / Dagre DAG layout with expandable nodes, lock icons, and real-time progress pulses.
### 4.4 Proactive AI Advisor & Learning Copilot
* **Role & Architecture**: An omnipresent, contextual AI mentor that guides the learner at every stage of their journey.
* **Core Modes / Personas**:
  1. **Career Strategist**: Analyzes job market demands, compares "What-If" career trajectories, and advises on skill ROI.
  2. **Socratic Tutor**: Intervenes during assessments and code playground struggles with guided questions and visual counter-examples.
  3. **Accountability Coach**: Monitors study streaks, detects pacing lag, and suggests 1-click schedule relaxation when prerequisite bottlenecks occur.
* **Telemetry Grounding**: The AI Advisor has full real-time access to the learner's 4D profile, Poincaré coordinates, Ebbinghaus decay matrix, and current DAG node state.

### 4.5 LLM & NLP Integration Strategy
* **API Integration**: Hybrid LLM client supporting Google Gemini (Gemini 1.5 Pro / Flash) with fallbacks, optimized with strict JSON schema outputs and low-temperature grounding to prevent hallucination.
* **Deterministic Guardrails**: All numerical recommendations, course rankings, and prerequisite sequences are computed deterministically before passing to the LLM for natural language synthesis.

