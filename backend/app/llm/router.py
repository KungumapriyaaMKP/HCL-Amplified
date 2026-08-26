"""
Provider router -- the ONLY module that calls an LLM SDK (coupling rule 3).

Fallback chain for structured operations:
    Gemini 2.5 Flash (native JSON)  ->  Groq gpt-oss-120b  ->  Deterministic Fallback

Seeded tracks and deterministic extractors short-circuit the chain when unconfigured,
guaranteeing 100% graceful guest fallback.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
import json
import re
from typing import Any

from app.core.config import settings
from app.llm.fixtures import match_seeded_track

# JSON schemas and instructions
_DECOMPOSE_INSTRUCTION = """You are a curriculum architect. Decompose the \
learner's career goal into granular, canonical skills.

Return ONLY JSON of the form:
{"role": "<role name>", "skills": [{"id": "<kebab-case-skill-id>", \
"name": "<skill name>", "required": <0.0-1.0>, "importance": <0.0-1.0>}]}

Use between 15 and 40 skills. `required` is the target mastery; `importance` \
is how central the skill is to the role."""

_RESUME_INSTRUCTION = """You are an expert technical evaluator. Extract demonstrated \
technical skills from the candidate's resume text. For every skill found, quote the \
exact sentence from the resume as evidence.

Return ONLY JSON of the form:
{"skills": [
  {"skill": "<skill name>", "evidence_quote": "<exact quote from text>", \
"level": <0.0-1.0>, "confidence": "high"|"medium"|"low"}
]}"""

_DIAGNOSTIC_INSTRUCTION = """You are a psychometric psychometrician. Generate high-quality \
conceptual and scenario-based multiple choice questions to probe a learner's mastery. \
For each skill, generate 1 scenario question with 4 options (A, B, C, D), exactly one correct answer, \
and 2PL-IRT parameters (discrimination a between 0.8 and 2.0, difficulty b between -2.0 and 2.0).

Return ONLY JSON of the form:
{"questions": [
  {
    "id": "<uuid-or-id>",
    "skill_id": "<skill_id>",
    "skill_name": "<skill_name>",
    "question": "<scenario question text>",
    "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
    "correct_index": <0-3>,
    "explanation": "<why correct>",
    "discrimination": <float 0.8-2.0>,
    "difficulty": <float -2.0-2.0>
  }
]}"""

_SOCRATIC_INSTRUCTION = """You are a master Socratic tutor. The student answered a question incorrectly. \
DO NOT reveal the correct answer. Instead:
1. Provide a friendly pedagogical acknowledgment.
2. Ask 2-3 progressive scaffolding questions that guide the learner to spot their misconception.
3. Provide a visual matrix/concept diagram specification (in ASCII or structured format) highlighting the mismatch.

Return ONLY JSON of the form:
{
  "scaffolding_questions": ["<question 1>", "<question 2>"],
  "conceptual_hint": "<gentle hint without the answer>",
  "diagram": "<ASCII or markdown diagram showing the conceptual relationship>"
}"""


def match_track(goal_text: str) -> str | None:
    """Deterministic fast path -- returns a seeded track id or None."""
    return match_seeded_track(goal_text)


def decompose_goal(goal_text: str) -> dict:
    """Decompose a free-text goal into canonical skills via LLM or fallback."""
    if settings.has_gemini:
        try:
            return _decompose_gemini(goal_text)
        except Exception:
            pass
    if settings.has_groq:
        try:
            return _decompose_groq(goal_text)
        except Exception:
            pass

    # Fallback to general AI Engineer track if LLM providers are unconfigured
    return {
        "role": goal_text,
        "skills": [
            {"id": "python-fundamentals", "name": "Python Fundamentals", "required": 0.9, "importance": 1.0},
            {"id": "sql", "name": "SQL", "required": 0.8, "importance": 0.8},
            {"id": "linear-algebra", "name": "Linear Algebra", "required": 0.8, "importance": 0.9},
            {"id": "ml-fundamentals", "name": "Machine Learning Fundamentals", "required": 0.9, "importance": 1.0},
            {"id": "deep-learning-fundamentals", "name": "Deep Learning", "required": 0.85, "importance": 0.95},
        ],
    }


def extract_skills_from_text(text: str) -> list[dict]:
    """Extract technical skills and supporting evidence quotes from resume text."""
    if settings.has_gemini:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=settings.google_api_key)
            resp = client.models.generate_content(
                model=settings.gemini_model,
                contents=f"{_RESUME_INSTRUCTION}\n\nResume text:\n{text[:4000]}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", temperature=0.1
                ),
            )
            data = json.loads(resp.text)
            return data.get("skills", [])
        except Exception:
            pass

    if settings.has_groq:
        try:
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)
            resp = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": _RESUME_INSTRUCTION},
                    {"role": "user", "content": text[:4000]},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            data = json.loads(resp.choices[0].message.content)
            return data.get("skills", [])
        except Exception:
            pass

    # Deterministic rule-based extraction fallback for key skills
    found: list[dict] = []
    lines = text.splitlines()
    keywords = {
        "Python": "python-fundamentals",
        "SQL": "sql",
        "Docker": "containers-docker",
        "Kubernetes": "kubernetes-basics",
        "PyTorch": "pytorch-basics",
        "TensorFlow": "deep-learning-fundamentals",
        "React": "react-basics",
        "JavaScript": "js-fundamentals",
        "TypeScript": "typescript-fundamentals",
        "Linux": "linux-fundamentals",
        "Git": "git-basics",
        "FastAPI": "rest-apis-python",
        "Pandas": "data-analysis-pandas",
        "Spark": "distributed-computing-spark",
        "Kafka": "kafka-streaming",
        "Airflow": "airflow-orchestration",
        "Linear Algebra": "linear-algebra",
        "Machine Learning": "ml-fundamentals",
    }
    for kw, sid in keywords.items():
        pattern = rf"\b{re.escape(kw)}\b"
        for line in lines:
            if re.search(pattern, line, re.IGNORECASE) and len(line.strip()) > 5:
                found.append({
                    "skill": kw,
                    "evidence_quote": line.strip()[:150],
                    "level": 0.8,
                    "confidence": "medium",
                })
                break
    return found


def generate_diagnostic_questions(skills_info: list[dict]) -> list[dict]:
    """Generate scenario MCQs for the specified skills."""
    if settings.has_gemini or settings.has_groq:
        prompt = f"{_DIAGNOSTIC_INSTRUCTION}\n\nSkills to probe:\n{json.dumps(skills_info)}"
        if settings.has_gemini:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=settings.google_api_key)
                resp = client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json", temperature=0.2
                    ),
                )
                return json.loads(resp.text).get("questions", [])
            except Exception:
                pass
        if settings.has_groq:
            try:
                from groq import Groq
                client = Groq(api_key=settings.groq_api_key)
                resp = client.chat.completions.create(
                    model=settings.groq_model,
                    messages=[
                        {"role": "system", "content": _DIAGNOSTIC_INSTRUCTION},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )
                return json.loads(resp.choices[0].message.content).get("questions", [])
            except Exception:
                pass

    # High-quality deterministic diagnostic questions fallback
    fixtures = {
        "linear-algebra": {
            "question": "You are training a low-rank matrix decomposition model. If matrix A has shape (5000, 100) with rank 40, what is the dimension of the null space of A?",
            "options": ["60", "4960", "40", "5000"],
            "correct_index": 0,
            "explanation": "By Rank-Nullity Theorem: nullity = number of columns (100) - rank (40) = 60.",
            "discrimination": 1.4,
            "difficulty": 0.3,
        },
        "python-fundamentals": {
            "question": "In Python, what is the time complexity of looking up a key in a standard dictionary with N items on average?",
            "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            "correct_index": 0,
            "explanation": "Python dictionaries use hash tables with average O(1) key lookup complexity.",
            "discrimination": 1.2,
            "difficulty": -1.0,
        },
        "neural-networks": {
            "question": "When training a deep MLP, gradients vanish in the lower layers. Which architectural change most directly remedies this issue?",
            "options": [
                "Switching from Sigmoid to ReLU activations and adding Residual connections",
                "Increasing the learning rate by a factor of 100",
                "Removing all normalization layers",
                "Using mean squared error instead of cross-entropy"
            ],
            "correct_index": 0,
            "explanation": "ReLU prevents saturation in the positive regime, and skip/residual connections preserve gradient flow.",
            "discrimination": 1.5,
            "difficulty": 0.5,
        },
        "sql": {
            "question": "Which SQL clause is evaluated BEFORE the SELECT clause in a standard SQL query lifecycle?",
            "options": ["WHERE", "ORDER BY", "LIMIT", "SELECT DISTINCT"],
            "correct_index": 0,
            "explanation": "SQL query evaluation order is FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.",
            "discrimination": 1.1,
            "difficulty": -0.5,
        },
    }

    questions = []
    for s in skills_info:
        sid = s.get("id") or s.get("skill_id", "")
        sname = s.get("name") or s.get("skill_name", sid)
        if sid in fixtures:
            item = dict(fixtures[sid])
            item["id"] = f"diag-{sid}"
            item["skill_id"] = sid
            item["skill_name"] = sname
            questions.append(item)
        else:
            questions.append({
                "id": f"diag-{sid}",
                "skill_id": sid,
                "skill_name": sname,
                "question": f"Which principle best describes core best practices in {sname}?",
                "options": [
                    f"Applying principled abstraction and validation standard to {sname}",
                    "Ignoring edge constraints and avoiding testing",
                    "Hardcoding parameters directly in production",
                    "Bypassing dependency checks"
                ],
                "correct_index": 0,
                "explanation": f"Systematic execution and validation is fundamental to {sname}.",
                "discrimination": 1.0,
                "difficulty": 0.0,
            })
    return questions


def generate_socratic_guidance(
    skill_name: str, chosen_answer: str, question: str, correct_answer: str
) -> dict:
    """Generate guided Socratic tutor dialogue without revealing the answer."""
    if settings.has_gemini or settings.has_groq:
        prompt = (
            f"{_SOCRATIC_INSTRUCTION}\n\nSkill: {skill_name}\nQuestion: {question}\n"
            f"Student Chosen: {chosen_answer}\nTarget Understanding: {correct_answer}"
        )
        if settings.has_gemini:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=settings.google_api_key)
                resp = client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json", temperature=0.3
                    ),
                )
                return json.loads(resp.text)
            except Exception:
                pass
        if settings.has_groq:
            try:
                from groq import Groq
                client = Groq(api_key=settings.groq_api_key)
                resp = client.chat.completions.create(
                    model=settings.groq_model,
                    messages=[
                        {"role": "system", "content": _SOCRATIC_INSTRUCTION},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                )
                return json.loads(resp.choices[0].message.content)
            except Exception:
                pass

    return {
        "scaffolding_questions": [
            f"Let's break down {skill_name}: What are the fundamental inputs and outputs of this operation?",
            f"If you trace how {chosen_answer} behaves under edge cases, where does the contradiction arise?",
        ],
        "conceptual_hint": f"Think about the dimensional constraints and how invariants are preserved in {skill_name}.",
        "diagram": (
            "+-----------------------------------------+\n"
            f"| Conceptual Invariant for {skill_name:<16} |\n"
            "+-----------------------------------------+\n"
            "| Input Vector (d) ---> [ Transformer ]    |\n"
            "|                          |              |\n"
            "|                          v              |\n"
            "| Dimension Mismatch: (d) != (k_proj)     |\n"
            "+-----------------------------------------+"
        ),
    }


async def stream_intake_chat(messages: list[dict[str, str]]) -> AsyncIterator[str]:
    """
    Stream conversational intake dialogue for Page 1 via SSE.
    Clarifies goal, hours per week, deadline weeks, and budget.
    """
    system_prompt = """You are Pathfinder AI, an expert career advisor.
Your goal is to conduct a crisp, conversational intake dialogue to extract:
1. Career Goal (e.g. Machine Learning Engineer)
2. Weekly Study Hours (e.g. 10 hours/week)
3. Target Timeframe (e.g. 24 weeks)
4. Learning Budget (e.g. Free only or $100)

When you have sufficient information to build their roadmap, append this exact marker at the very end:
[INTAKE_COMPLETE: {"goal": "<goal>", "hours_per_week": <float>, "deadline_weeks": <int_or_null>, "budget_usd": <float_or_null>}]
Keep answers friendly, concise, and focused."""

    if settings.has_groq:
        try:
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)
            formatted_messages = [{"role": "system", "content": system_prompt}] + messages
            completion = client.chat.completions.create(
                model=settings.groq_model,
                messages=formatted_messages,
                stream=True,
                temperature=0.4,
            )
            for chunk in completion:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            return
        except Exception:
            pass

    # Deterministic streaming simulation for guest fallback
    latest = messages[-1]["content"] if messages else ""
    response_text = (
        f"Welcome! I see you're aiming for **{latest or 'a career in AI/Software'}**. "
        "To tailor your personalized curriculum:\n\n"
        "1. **How many hours per week** can you dedicate to studying?\n"
        "2. Do you have a **specific target timeframe** (e.g., 12 or 24 weeks)?\n\n"
        "Feel free to upload your resume or link your GitHub on the right to pre-fill your verified skills!"
    )
    for word in response_text.split(" "):
        yield word + " "


def _decompose_gemini(goal_text: str) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.google_api_key)
    resp = client.models.generate_content(
        model=settings.gemini_model,
        contents=f"{_DECOMPOSE_INSTRUCTION}\n\nGoal: {goal_text}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json", temperature=0.2
        ),
    )
    return json.loads(resp.text)


def _decompose_groq(goal_text: str) -> dict:
    from groq import Groq

    client = Groq(api_key=settings.groq_api_key)
    resp = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": _DECOMPOSE_INSTRUCTION},
            {"role": "user", "content": f"Goal: {goal_text}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(resp.choices[0].message.content)
