"""
Author the canonical skill DAG and validate it.

Naming conventions and several foundation nodes are carried over from an
earlier internal build (`project 3/data/skills.ts`), which had a sound
48-skill graph but only 11 AI/ML nodes -- too shallow to sequence a real
ML Engineer roadmap. This expands the AI/ML spine to ~50 while keeping the
shared foundations intact.

Run:  python backend/scripts/build_skill_graph.py
Writes backend/data/skills.json and refuses to write a cyclic graph.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import networkx as nx

OUT = Path(__file__).resolve().parents[1] / "data" / "skills.json"

# (id, name, topic, prerequisites, is_programming, description)
SKILLS: list[tuple[str, str, str, list[str], bool, str]] = [
    # ── Mathematical foundations ─────────────────────────────────────────────
    ("linear-algebra", "Linear Algebra", "Mathematics", [], False,
     "Vectors, matrices, dot products, eigenvalues, matrix decomposition."),
    ("calculus-basics", "Calculus Basics", "Mathematics", [], False,
     "Derivatives, integrals, limits, the chain rule in one variable."),
    ("multivariate-calculus", "Multivariate Calculus", "Mathematics", ["calculus-basics"], False,
     "Partial derivatives, gradients, Jacobians, the multivariate chain rule."),
    ("statistics-fundamentals", "Statistics Fundamentals", "Mathematics", [], False,
     "Descriptive statistics, distributions, hypothesis testing, confidence intervals."),
    ("probability", "Probability", "Mathematics", ["statistics-fundamentals"], False,
     "Random variables, expectation, conditional probability, Bayes' theorem."),
    ("optimization-basics", "Optimization Basics", "Mathematics",
     ["multivariate-calculus", "linear-algebra"], False,
     "Convexity, local vs global minima, constrained optimization, Lagrange multipliers."),

    # ── Programming foundations ──────────────────────────────────────────────
    ("python-fundamentals", "Python Fundamentals", "Programming", [], True,
     "Syntax, control flow, functions, modules, error handling."),
    ("python-data-structures", "Python Data Structures", "Programming", ["python-fundamentals"], True,
     "Lists, dicts, sets, comprehensions, iterators, generators."),
    ("numpy-arrays", "NumPy & Array Computing", "Programming",
     ["python-data-structures", "linear-algebra"], True,
     "N-dimensional arrays, broadcasting, vectorization, axis semantics."),
    ("git-basics", "Git & Version Control", "Engineering", [], True,
     "Commits, branching, merging, collaborative workflows."),
    ("testing-fundamentals", "Testing Fundamentals", "Engineering", ["python-data-structures"], True,
     "Unit and integration testing, fixtures, assertions, coverage."),

    # ── Data ─────────────────────────────────────────────────────────────────
    ("sql", "SQL", "Data", [], True,
     "Relational queries, joins, aggregation, schema design."),
    ("data-analysis-pandas", "Data Analysis with Pandas", "Data",
     ["python-data-structures", "statistics-fundamentals"], True,
     "DataFrames, indexing, groupby, joins, time series."),
    ("data-visualization", "Data Visualization", "Data", ["data-analysis-pandas"], True,
     "Matplotlib and Seaborn, chart selection, encoding data visually."),
    ("data-wrangling", "Data Wrangling", "Data", ["data-analysis-pandas", "sql"], True,
     "Cleaning, missing values, outliers, reshaping, merging sources."),
    ("exploratory-data-analysis", "Exploratory Data Analysis", "Data",
     ["data-visualization", "data-wrangling"], True,
     "Distributions, correlation, leakage detection, hypothesis forming."),
    ("feature-engineering", "Feature Engineering", "Data",
     ["data-wrangling", "statistics-fundamentals"], True,
     "Encoding, scaling, binning, interaction terms, target leakage avoidance."),

    # ── Classical machine learning ───────────────────────────────────────────
    ("ml-fundamentals", "Machine Learning Fundamentals", "Machine Learning",
     ["numpy-arrays", "statistics-fundamentals", "linear-algebra"], True,
     "Learning paradigms, train/test splits, bias-variance, generalization."),
    ("supervised-learning", "Supervised Learning", "Machine Learning", ["ml-fundamentals"], True,
     "Linear and logistic regression, decision trees, k-NN, SVMs."),
    ("unsupervised-learning", "Unsupervised Learning", "Machine Learning", ["ml-fundamentals"], True,
     "Clustering, dimensionality reduction, PCA, anomaly detection."),
    ("model-evaluation", "Model Evaluation", "Machine Learning", ["supervised-learning"], True,
     "Cross-validation, precision/recall/F1, ROC-AUC, confusion matrices."),
    ("regularization", "Regularization", "Machine Learning",
     ["supervised-learning", "optimization-basics"], True,
     "L1/L2 penalties, dropout, early stopping, overfitting control."),
    ("ensemble-methods", "Ensemble Methods", "Machine Learning",
     ["supervised-learning", "model-evaluation"], True,
     "Bagging, boosting, random forests, gradient boosting, stacking."),
    ("hyperparameter-tuning", "Hyperparameter Tuning", "Machine Learning", ["model-evaluation"], True,
     "Grid and random search, Bayesian optimization, search budgets."),
    ("scikit-learn", "scikit-learn in Practice", "Machine Learning",
     ["supervised-learning", "data-analysis-pandas"], True,
     "Estimator API, pipelines, transformers, custom components."),

    # ── Deep learning ────────────────────────────────────────────────────────
    ("gradient-descent", "Gradient Descent & Optimizers", "Deep Learning",
     ["optimization-basics", "multivariate-calculus"], True,
     "SGD, momentum, Adam, learning-rate schedules, convergence behaviour."),
    ("deep-learning-fundamentals", "Deep Learning Fundamentals", "Deep Learning",
     ["supervised-learning", "multivariate-calculus"], True,
     "Perceptrons, activation functions, layers, loss functions."),
    ("backpropagation", "Backpropagation", "Deep Learning",
     ["deep-learning-fundamentals", "multivariate-calculus"], True,
     "Computational graphs, reverse-mode differentiation, gradient flow."),
    ("neural-networks", "Neural Network Architectures", "Deep Learning",
     ["backpropagation", "gradient-descent"], True,
     "Feedforward networks, depth vs width, initialization, normalization."),
    ("pytorch-basics", "PyTorch", "Deep Learning", ["neural-networks", "numpy-arrays"], True,
     "Tensors, autograd, modules, training loops, GPU execution."),
    ("cnn-architectures", "Convolutional Networks", "Deep Learning", ["neural-networks"], True,
     "Convolution, pooling, receptive fields, ResNet-style architectures."),
    ("rnn-sequence-models", "Sequence Models", "Deep Learning", ["neural-networks"], True,
     "RNNs, LSTMs, GRUs, sequence-to-sequence, vanishing gradients."),
    ("attention-mechanisms", "Attention Mechanisms", "Deep Learning", ["rnn-sequence-models"], True,
     "Query-key-value attention, scaled dot-product, multi-head attention."),
    ("transformer-architecture", "Transformer Architecture", "Deep Learning",
     ["attention-mechanisms"], True,
     "Encoder-decoder stacks, positional encoding, residual streams."),
    ("transfer-learning", "Transfer Learning & Fine-Tuning", "Deep Learning",
     ["cnn-architectures", "pytorch-basics"], True,
     "Pretrained backbones, freezing, fine-tuning strategies, LoRA."),

    # ── Applied specializations ──────────────────────────────────────────────
    ("nlp-fundamentals", "NLP Fundamentals", "Applied AI", ["deep-learning-fundamentals"], True,
     "Text preprocessing, language modelling, classification, NER."),
    ("tokenization-embeddings", "Tokenization & Embeddings", "Applied AI", ["nlp-fundamentals"], True,
     "Subword tokenization, word and sentence embeddings, vector semantics."),
    ("computer-vision-fundamentals", "Computer Vision", "Applied AI", ["cnn-architectures"], True,
     "Image classification, detection, segmentation, augmentation."),
    ("llm-fundamentals", "Large Language Models", "Applied AI",
     ["transformer-architecture", "tokenization-embeddings"], True,
     "Pretraining, instruction tuning, RLHF, decoding strategies, context windows."),
    ("prompt-engineering", "Prompt Engineering", "Applied AI", ["llm-fundamentals"], True,
     "Few-shot prompting, chain-of-thought, structured output, evaluation."),
    ("vector-databases", "Vector Databases", "Applied AI", ["tokenization-embeddings"], True,
     "ANN indexes, similarity metrics, hybrid search, index tradeoffs."),
    ("rag-systems", "Retrieval-Augmented Generation", "Applied AI",
     ["llm-fundamentals", "vector-databases"], True,
     "Chunking, retrieval, reranking, grounding, citation and evaluation."),

    # ── Production & MLOps ───────────────────────────────────────────────────
    ("linux-fundamentals", "Linux Fundamentals", "Engineering", [], True,
     "Shell, filesystem, processes, permissions, package management."),
    ("cloud-fundamentals", "Cloud Fundamentals", "Engineering", [], False,
     "Compute, storage, networking, IAM, managed service models."),
    ("containers-docker", "Containers with Docker", "Engineering", ["linux-fundamentals"], True,
     "Images, layers, Dockerfiles, volumes, container networking."),
    ("rest-apis-python", "REST APIs in Python", "Engineering", ["python-data-structures"], True,
     "HTTP semantics, FastAPI, request validation, async handlers."),
    ("experiment-tracking", "Experiment Tracking", "MLOps", ["ml-fundamentals", "git-basics"], True,
     "Run metadata, metrics, artifacts, reproducibility, model registries."),
    ("ci-cd-fundamentals", "CI/CD Fundamentals", "MLOps", ["git-basics", "containers-docker"], True,
     "Automated builds, test gates, deployment pipelines."),
    ("model-serving", "Model Serving", "MLOps",
     ["rest-apis-python", "containers-docker", "pytorch-basics", "cloud-fundamentals"], True,
     "Inference endpoints, batching, latency budgets, quantization."),
    ("model-monitoring", "Model Monitoring", "MLOps", ["model-serving", "model-evaluation"], True,
     "Drift detection, data quality, performance decay, alerting."),
    ("mlops-pipelines", "MLOps Pipelines", "MLOps",
     ["ci-cd-fundamentals", "model-serving", "experiment-tracking"], True,
     "Orchestrated training, automated retraining, versioned deployment."),
]


def main() -> int:
    ids = [s[0] for s in SKILLS]

    if len(ids) != len(set(ids)):
        dupes = {i for i in ids if ids.count(i) > 1}
        print(f"FAIL duplicate skill ids: {dupes}", file=sys.stderr)
        return 1

    known = set(ids)
    for sid, _, _, prereqs, _, _ in SKILLS:
        for p in prereqs:
            if p not in known:
                print(f"FAIL {sid!r} requires unknown skill {p!r}", file=sys.stderr)
                return 1

    g = nx.DiGraph()
    g.add_nodes_from(ids)
    for sid, _, _, prereqs, _, _ in SKILLS:
        for p in prereqs:
            g.add_edge(p, sid)  # prerequisite -> dependent

    if not nx.is_directed_acyclic_graph(g):
        print(f"FAIL graph has cycles: {list(nx.simple_cycles(g))[:3]}", file=sys.stderr)
        return 1

    depth = {n: 0 for n in nx.topological_sort(g)}
    for n in nx.topological_sort(g):
        for succ in g.successors(n):
            depth[succ] = max(depth[succ], depth[n] + 1)

    payload = [
        {
            "id": sid,
            "name": name,
            "category": topic,          # EduCOR middle tier, carried as a field
            "topic": topic,
            "description": desc,
            "prerequisites": prereqs,
            "is_programming": is_prog,
            "depth": depth[sid],                     # drives Poincare radius
            "fan_out": len(nx.descendants(g, sid)),  # drives probe priority + review urgency
        }
        for sid, name, topic, prereqs, is_prog, desc in SKILLS
    ]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    roots = [n for n in g if g.in_degree(n) == 0]
    leaves = [n for n in g if g.out_degree(n) == 0]
    print(f"OK  {len(SKILLS)} skills, {g.number_of_edges()} edges, acyclic")
    print(f"    depth 0..{max(depth.values())}   roots {len(roots)}   leaves {len(leaves)}")
    print(f"    highest fan-out: " + ", ".join(
        f"{n}({len(nx.descendants(g, n))})"
        for n in sorted(ids, key=lambda x: -len(nx.descendants(g, x)))[:5]))
    print(f"    -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
