import io
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 60)
print("AUDIT: Testing all 13 endpoints in keyless fallback mode")
print("=" * 60)

# 1. Health
t0 = time.perf_counter()
r = client.get("/api/health")
dt = (time.perf_counter() - t0) * 1000
print(f"1. GET /api/health: {r.status_code} ({dt:.1f}ms)")
assert r.status_code == 200

# 2. Roles
t0 = time.perf_counter()
r = client.get("/api/roles")
dt = (time.perf_counter() - t0) * 1000
roles = r.json().get("roles", [])
print(f"2. GET /api/roles: {r.status_code} ({dt:.1f}ms) -> {len(roles)} tracks")
assert r.status_code == 200 and len(roles) == 4

# 3. Poincare
t0 = time.perf_counter()
r = client.get("/api/poincare")
dt = (time.perf_counter() - t0) * 1000
poincare_data = r.json()
print(f"3. GET /api/poincare: {r.status_code} ({dt:.1f}ms) -> {len(poincare_data.get('nodes', []))} nodes, {len(poincare_data.get('edges', []))} edges")
assert r.status_code == 200

# 4. Gamification
t0 = time.perf_counter()
r = client.get("/api/gamification")
dt = (time.perf_counter() - t0) * 1000
gam = r.json()
print(f"4. GET /api/gamification: {r.status_code} ({dt:.1f}ms) -> Level {gam.get('level')}, {gam.get('total_xp')} XP, {len(gam.get('badges', []))} badges")
assert r.status_code == 200

# 5. Diagnostic Generate
t0 = time.perf_counter()
r = client.post("/api/diagnostic/generate", json={"goal": "Machine Learning Engineer", "num_questions": 3})
dt = (time.perf_counter() - t0) * 1000
diag_gen = r.json()
print(f"5. POST /api/diagnostic/generate: {r.status_code} ({dt:.1f}ms) -> {len(diag_gen.get('questions', []))} questions")
assert r.status_code == 200

# 6. Diagnostic Submit
t0 = time.perf_counter()
r = client.post("/api/diagnostic/submit", json={
    "responses": [{"skill_id": "linear-algebra", "discrimination": 1.4, "difficulty": 0.3, "is_correct": True}],
    "goal": "Machine Learning Engineer"
})
dt = (time.perf_counter() - t0) * 1000
diag_sub = r.json()
print(f"6. POST /api/diagnostic/submit: {r.status_code} ({dt:.1f}ms) -> theta={diag_sub.get('theta')}, readiness={diag_sub.get('readiness_pct')}%")
assert r.status_code == 200

# 7. Socratic
t0 = time.perf_counter()
r = client.post("/api/socratic", json={
    "skill_id": "neural-networks",
    "skill_name": "Neural Networks",
    "chosen_answer": "Use mean squared error",
    "question": "How to fix vanishing gradients?"
})
dt = (time.perf_counter() - t0) * 1000
soc = r.json()
print(f"7. POST /api/socratic: {r.status_code} ({dt:.1f}ms) -> {len(soc.get('scaffolding_questions', []))} scaffolding Qs")
assert r.status_code == 200

# 8. Profile Resume
t0 = time.perf_counter()
txt_content = b"Extensive experience with Python, PyTorch, SQL and Docker in production."
r = client.post("/api/profile/resume", files={"file": ("resume.txt", io.BytesIO(txt_content), "text/plain")})
dt = (time.perf_counter() - t0) * 1000
res_prof = r.json()
print(f"8. POST /api/profile/resume: {r.status_code} ({dt:.1f}ms) -> {len(res_prof.get('skills', []))} skills extracted")
assert r.status_code == 200

# 9. Profile GitHub
t0 = time.perf_counter()
r = client.post("/api/profile/github", json={"username": "torvalds"})
dt = (time.perf_counter() - t0) * 1000
git_prof = r.json()
print(f"9. POST /api/profile/github: {r.status_code} ({dt:.1f}ms) -> {len(git_prof.get('skills', []))} skills found")
assert r.status_code == 200

# 10. Plan Relax
t0 = time.perf_counter()
r = client.post("/api/plan/relax", json={
    "goal": "Machine Learning Engineer",
    "hours_per_week": 5.0,
    "deadline_weeks": 10,
    "priority": "balanced"
})
dt = (time.perf_counter() - t0) * 1000
relax_res = r.json()
print(f"10. POST /api/plan/relax: {r.status_code} ({dt:.1f}ms) -> feasible: {relax_res.get('is_feasible')}, {len(relax_res.get('options', []))} options")
assert r.status_code == 200

# 11. Adapt Detour
t0 = time.perf_counter()
r = client.post("/api/adapt/detour", json={
    "blocked_skill_id": "neural-networks",
    "goal": "Machine Learning Engineer"
})
dt = (time.perf_counter() - t0) * 1000
detour_res = r.json()
print(f"11. POST /api/adapt/detour: {r.status_code} ({dt:.1f}ms) -> bridge: {detour_res.get('bridge_skill_id')}")
assert r.status_code == 200

# 12. Plan Generation with Live Catalog (Warm Latency Check)
t0 = time.perf_counter()
r = client.post("/api/plan", json={
    "goal": "Machine Learning Engineer",
    "hours_per_week": 10.0,
    "priority": "balanced"
})
dt = (time.perf_counter() - t0) * 1000
plan_res = r.json()
print(f"12. POST /api/plan (balanced): {r.status_code} ({dt:.1f}ms) -> {len(plan_res.get('milestones', []))} milestones, {plan_res.get('total_hours')}h total")
assert r.status_code == 200

# 13. Chat SSE
t0 = time.perf_counter()
r = client.post("/api/chat", json={"messages": [{"role": "user", "content": "I want to become an AI Engineer"}]})
dt = (time.perf_counter() - t0) * 1000
print(f"13. POST /api/chat (SSE): {r.status_code} ({dt:.1f}ms) -> content-type: {r.headers.get('content-type')}")
assert r.status_code == 200

print("=" * 60)
print("SUCCESS: All 13 endpoints verified with 0 errors in keyless mode!")
print("=" * 60)
