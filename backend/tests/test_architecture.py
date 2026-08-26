"""
Architectural fitness functions.

These encode the coupling rules from the plan (Part 0.6) as tests, so the
architecture is checkable rather than aspirational. A violation fails the
build with the exact offending import.
"""
from __future__ import annotations

import ast
from pathlib import Path

import pytest

APP = Path(__file__).resolve().parents[1] / "app"
MODULES = APP / "modules"


def _imports(py: Path) -> list[str]:
    """Every module path imported by `py`, as dotted strings."""
    tree = ast.parse(py.read_text(encoding="utf-8"), filename=str(py))
    found: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            found.extend(a.name for a in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
            found.append(node.module)
    return found


def _py_files(root: Path) -> list[Path]:
    return [p for p in root.rglob("*.py") if "__pycache__" not in p.parts]


# ── Rule 1: domain imports nothing internal ──────────────────────────────────

def test_domain_depends_on_nothing_internal():
    for py in _py_files(APP / "domain"):
        for imp in _imports(py):
            if imp.startswith("app.") and not imp.startswith("app.domain"):
                pytest.fail(
                    f"RULE 1 violated: {py.relative_to(APP)} imports {imp!r}. "
                    "domain/ is the shared vocabulary -- it depends on nobody."
                )


# ── Rule 2: modules touch only each other's interface.py ─────────────────────

def test_modules_do_not_reach_into_each_other():
    for module_dir in (d for d in MODULES.iterdir() if d.is_dir()):
        own = f"app.modules.{module_dir.name}"
        for py in _py_files(module_dir):
            for imp in _imports(py):
                if not imp.startswith("app.modules."):
                    continue
                if imp.startswith(own):
                    continue  # own internals are fine
                allowed = imp.endswith(".interface") or imp.count(".") == 2
                if not allowed:
                    pytest.fail(
                        f"RULE 2 violated: {py.relative_to(APP)} imports {imp!r}. "
                        "Cross-module imports must target interface.py only."
                    )


# ── Rule 3: only llm/ talks to LLM providers; only core/supa.py imports supabase ──

PROVIDER_SDKS = {"groq", "google", "google.generativeai", "openai", "anthropic"}
SUPABASE_SDKS = {"supabase", "gotrue", "postgrest", "storage3", "realtime"}


def test_only_llm_package_calls_providers():
    for py in _py_files(APP):
        if "llm" in py.relative_to(APP).parts:
            continue
        for imp in _imports(py):
            root = imp.split(".")[0]
            if root in PROVIDER_SDKS:
                pytest.fail(
                    f"RULE 3 violated: {py.relative_to(APP)} imports {imp!r}. "
                    "Only app/llm/ may call a provider; modules pass text."
                )


def test_only_core_supa_imports_supabase():
    for py in _py_files(APP):
        rel = py.relative_to(APP).as_posix()
        if rel == "core/supa.py":
            continue
        for imp in _imports(py):
            root = imp.split(".")[0]
            if root in SUPABASE_SDKS:
                pytest.fail(
                    f"RULE 3 extended violated: {py.relative_to(APP)} imports {imp!r}. "
                    "The supabase package must be imported ONLY inside app/core/supa.py."
                )


# ── Rule 4: only api/ knows HTTP ─────────────────────────────────────────────

def test_only_api_layer_imports_fastapi():
    for py in _py_files(APP):
        parts = py.relative_to(APP).parts
        if parts[0] in {"api", "core"} or py.name == "main.py":
            continue
        for imp in _imports(py):
            if imp.split(".")[0] in {"fastapi", "starlette"}:
                pytest.fail(
                    f"RULE 4 violated: {py.relative_to(APP)} imports {imp!r}. "
                    "Modules take and return domain objects, not HTTP types."
                )


# ── Rule 5: dependency direction is one-way ──────────────────────────────────

def test_modules_never_import_the_api_layer():
    for py in _py_files(MODULES):
        for imp in _imports(py):
            if imp.startswith("app.api"):
                pytest.fail(
                    f"RULE 5 violated: {py.relative_to(APP)} imports {imp!r}. "
                    "Direction is api -> modules -> domain, never backwards."
                )


# ── Rule 6: modules do not load models directly ──────────────────────────────

def test_modules_use_ml_predict_not_raw_model_libs():
    raw = {"sklearn", "joblib", "torch", "fastembed"}
    for py in _py_files(MODULES):
        for imp in _imports(py):
            if imp.split(".")[0] in raw:
                pytest.fail(
                    f"RULE 6 violated: {py.relative_to(APP)} imports {imp!r}. "
                    "Modules call app.ml.*.predict(); they never load models."
                )


# ── Every module exposes a public surface ────────────────────────────────────

def test_every_module_has_an_interface():
    for module_dir in (d for d in MODULES.iterdir() if d.is_dir()):
        if module_dir.name == "__pycache__":
            continue
        assert (module_dir / "interface.py").exists(), (
            f"{module_dir.name}/ has no interface.py -- every bounded context "
            "must declare its public surface."
        )
