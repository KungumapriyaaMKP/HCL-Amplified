# Project Instructions & Master Specification

> **Challenge**: HCLTech AMPlified — The AI Challenge (Season 1)  
> **Phase**: Round 2 (Pathfinder Prototype Phase)  
> **Track**: AI-Powered Personalized Learning Path Recommender  
> **Target Alignment**: Next-Generation Adaptive Upskilling & Talent Transformation (e.g., HCLTech Career Shaper™)  
> **Document Purpose**: Comprehensive Problem Description, Project Goals, Architecture Deliverables, Judging Criteria, Quality Expectations, and Execution Guidelines.

---

## 1. Executive Summary & Problem Description

### 1.1 The Challenge Context
Modern digital enterprise and educational platforms host tens of thousands of courses, video lectures, coding labs, and assessments across diverse technical and professional domains. While standard catalog search engines can surface individual courses matching broad keywords, learners face severe cognitive overload when attempting to chart an efficient, prerequisite-aware journey toward a target career goal (e.g., *Machine Learning Engineer*, *Cloud Solutions Architect*, or *Full-Stack Developer*).

### 1.2 The Core Problem
Different learners come with disparate skill baselines, prior learning histories, time commitments, and learning preferences:
1. **The "Curse of Choice" & Unstructured Catalog Sprawl**: Learners are confronted with flat lists of hundreds of unsequenced resources without clear entry points or progression logic.
2. **Prerequisite Violations**: Standard recommendation engines lack structural prerequisite understanding, often recommending advanced topics (e.g., Deep Learning) to learners who have not mastered foundational prerequisites (e.g., Linear Algebra, Python data structures).
3. **Static & Fragile Paths**: Traditional static curricula cannot adapt when a learner struggles with a topic or fails an assessment, resulting in frustration and course abandonment.
4. **Black-Box & Hallucinated Justifications**: Generative AI chatbots often invent fictitious course titles or provide generic, ungrounded justifications ("This course is great for you!") rather than transparent, metric-grounded explanations.

---

## 2. Project Goal & Core Mission

> **Mission Statement**: Design, build, and evaluate an intelligent, end-to-end learning assistant that transforms raw learner goals into personalized, structured, prerequisite-aware, explainable, and dynamically adaptive learning roadmaps.

### Key Functional Objectives
- **Natural Language Intake**: Allow learners to express career ambitions, time constraints, and preferences in open-ended natural dialogue.
- **Granular Skill Gap Analysis**: Deconstruct high-level goals into multi-tiered competency requirements and compute precise mathematical skill gaps against the learner's existing mastery.
- **Hybrid Multi-Factor Recommendation**: Retrieve and rank real educational catalog assets using dense semantic vector search blended with sparse lexical keyword matching (BM25) and multi-factor re-ranking.
- **Deterministic Graph Sequencing**: Generate optimal, topologically ordered learning paths using deterministic $A^*$ graph search over an authoritative prerequisite Directed Acyclic Graph (DAG).
- **Score-Grounded Explainability**: Generate clear, hallucination-free natural language explanations grounded directly in mathematical similarity scores, gap reduction deltas, and prerequisite necessity.
- **Adaptive Rerouting & Progress Tracking**: Dynamically detect learning bottlenecks (stuck states from assessment failures) and insert remedial detour paths via dual-graph similarity search.

---

## 3. System Architecture & The 6 Core Deliverables

The system is organized into six interconnected, modular deliverables:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           6 CORE DELIVERABLES ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  [Deliverable 1: Conversational Interface]                                                  │
│          │ (Natural Language Goal Intake & Clarification)                                   │
│          ▼                                                                                  │
│  [Deliverable 2: Learner Profiling & Skill Gap Engine]                                      │
│          │ (Chain-of-Thought Goal Decomposition & Deterministic Gap Math)                   │
│          ▼                                                                                  │
│  [Deliverable 3: Hybrid Recommendation Engine] ──► [Deliverable 4: Path Generator]          │
│    (BM25 + Dense Embeddings + 7-Factor Rerank)       (A* Search over Prerequisite DAG)      │
│          │                                                        │                         │
│          ▼                                                        ▼                         │
│  [Deliverable 5: Grounded Explainability]            [Deliverable 6: Progress Dashboard]    │
│    (Score-Grounded Rationale Generation)               (Visual DAG & Dual-Graph Rerouting)  │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Deliverable 1: Conversational Interface
* **Purpose**: Provide an engaging, natural-language interface for learners to express aspirations, backgrounds, and study schedules.
* **Key Capabilities**:
  - Intent extraction and active clarifying dialog when user input is ambiguous or underspecified.
  - Interactive quick-action chips for goal refinement (e.g., target role, timeframe, weekly hours).
  - Clean conversational state management and responsive streaming.

---

### Deliverable 2: Learner Profiling & Skill Gap Engine
* **Purpose**: Capture and maintain a structured 4D learner profile (Goals, Current Proficiencies, Completed History, Learning Constraints) and compute accurate skill gaps.
* **Key Capabilities**:
  - **Chain-of-Thought (CoT) Goal Decomposition** (*GenMentor* pattern): Deconstructs user objectives into:
    $$\text{User Objective} \longrightarrow \text{Job Duties} \longrightarrow \text{Required Competencies} \longrightarrow \text{Granular Skills} \longrightarrow \text{Target Mastery Levels}$$
  - **Deterministic Skill Gap Formulation**:
    $$\text{SkillGap}(s) = \max\left(0, \text{RequiredLevel}(s) - \text{CurrentMastery}(s)\right)$$
    $$\text{PriorityScore}(s) = \text{ImportanceWeight}(s) \times \text{SkillGap}(s)$$
  - Explicit multi-tiered ontology mapping based on the *EduCOR* schema:
    $$\text{Skill} \longrightarrow \text{Knowledge Topic} \longrightarrow \text{Educational Resource}$$

---

### Deliverable 3: Hybrid Recommendation & Retrieval Engine
* **Purpose**: Retrieve and rank candidate learning resources, courses, hands-on projects, and assessments from the educational catalog.
* **Key Capabilities**:
  - **Hybrid Search**: Fuses dense vector embeddings (e.g., BAAI/bge or text-embedding models) with sparse lexical keyword matching (BM25):
    $$\text{Score}_{\text{Hybrid}} = \alpha \cdot \text{CosineSim}(v_{\text{goal}}, v_{\text{resource}}) + (1 - \alpha) \cdot \text{Score}_{\text{BM25}}(q_{\text{keywords}}, d_{\text{resource}})$$
  - **7-Factor Deterministic Re-Ranker**: Evaluates candidates across comprehensive dimensions:
    1. Skill Coverage & Gap Reduction ($w_1 = 0.30$)
    2. Semantic Relevance ($w_2 = 0.25$)
    3. Prerequisite Readiness ($w_3 = 0.15$)
    4. Difficulty & Baseline Fit ($w_4 = 0.10$)
    5. Learner Format/Modality Preference ($w_5 = 0.08$)
    6. Content Quality & Rating ($w_6 = 0.07$)
    7. Catalog Freshness ($w_7 = 0.05$)

---

### Deliverable 4: Personalized Learning Path Generator
* **Purpose**: Transform disjoint recommendations into an optimal, topologically ordered, milestone-grouped curriculum.
* **Key Capabilities**:
  - **Deterministic $A^*$ Graph Planning**: Navigates the prerequisite DAG to construct an optimal learning path minimizing total cost:
    $$f(n) = g(n) + h(n)$$
    Where $g(n)$ is the accumulated learning effort/time plus penalties for steep difficulty jumps, and $h(n)$ is the admissible heuristic distance to target skill mastery.
  - **Topological Consistency**: Enforces Kahn's algorithm or DAG cycle checks to ensure zero prerequisite violations.
  - **Milestone Partitioning**: Groups learning modules into progressive stages (Foundations $\rightarrow$ Core Concepts $\rightarrow$ Advanced Applications $\rightarrow$ Capstone Project).

---

### Deliverable 5: Score-Grounded Explainability Assistant
* **Purpose**: Eliminate black-box recommendations and hallucinated rationales by providing transparent, evidence-backed justifications.
* **Key Capabilities**:
  - **Metric-Grounded Explanations** (*KnowPath* pattern): Every explanation directly incorporates real underlying data:
    - Exact target skills addressed and computed gap reduction delta.
    - Prerequisite dependencies satisfied.
    - Hybrid similarity score and content difficulty alignment.
  - Interactive Q&A allowing learners to query "Why was this course recommended before that one?" or "How does this project help my career goal?".

---

### Deliverable 6: Progress Dashboard & Adaptive Rerouting Engine
* **Purpose**: Visualize learner progression and dynamically adapt the learning path in real time based on feedback and assessment performance.
* **Key Capabilities**:
  - **Interactive DAG & Milestone Roadmap**: Dynamic UI displaying completed, active, and locked nodes with progress indicators.
  - **Stuck Detection**: Identifies learning blockages (e.g., scoring $< 50\%$ on two consecutive module quizzes or explicit "Too Difficult" feedback).
  - **Dual-Graph Rerouting** (*DLELP / KnowLP* pattern):
    - When a blockage occurs on topic $T_A$, query the **Concept Similarity Graph** to locate an alternative conceptual bridge or prerequisite reinforcement topic $T_B$.
    - Insert a targeted remediation detour into the path without breaking downstream dependencies.

---

## 4. End-to-End Operational Workflow

The complete execution loop for a learner proceeds as follows:

```
[1. User Input] ──► Conversational Goal & Constraint Intake
                           │
                           ▼
[2. Profiling]  ──► CoT Skill Extraction + Baseline Assessment + Gap Matrix
                           │
                           ▼
[3. Retrieval]  ──► Hybrid BM25 & Dense Semantic Vector Candidate Filtering
                           │
                           ▼
[4. Reranking]  ──► 7-Factor Deterministic Scoring & Catalog Filtering
                           │
                           ▼
[5. Path Gen]   ──► A* Graph Traversal on Prerequisite DAG + Milestone Grouping
                           │
                           ▼
[6. Explain]    ──► Score-Grounded Rationale Generation & Verification
                           │
                           ▼
[7. Dashboard]  ──► Visual Roadmap Render + Quiz/Assessment Module
                           │
                           ▼
[8. Adapt Loop] ──► Assessment Result / Feedback 
                           ├── Passed (>=70%) ──► Unlock Next Milestone & Advance Mastery
                           └── Failed / Stuck  ──► Trigger Dual-Graph Remediation Detour
```

---

## 5. Official Judging Criteria & Evaluation Rubric

Submissions are evaluated against six core criteria totaling 100%:

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

## 6. Project-Level Expectations & Engineering Standards

To achieve a top-tier evaluation, the project must adhere to strict production-grade engineering principles:

### 6.1 Architectural Principle: The Hybrid Deterministic + Generative Paradigm
> **Core Rule**: *"Use Large Language Models (LLMs) strictly where natural language comprehension or synthesis is genuinely needed. Use deterministic algorithms for retrieval, scoring, graph traversal, prerequisite validation, path planning, and stuck detection."*

- **LLM Responsibility**: Conversational intake understanding, skill decomposition synthesis, and natural language formatting of grounded explanations.
- **Deterministic Engine Responsibility**: Mathematical skill gap computation, vector similarity calculation, BM25 keyword scoring, 7-factor re-ranking, $A^*$ graph path finding, and topological sorting.
