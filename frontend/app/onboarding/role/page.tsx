"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronDown,
  Check,
} from "lucide-react";
import { getRoles, RoleItem } from "@/lib/api/pathfinder";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import {
  getOnboardingDraft,
  saveOnboardingDraft,
  updateOnboardingStatus,
} from "@/lib/onboardingDraft";

const FALLBACK_ROLES: RoleItem[] = [
  {
    id: "ml-engineer",
    name: "AI / Machine Learning Engineer",
    summary: "Builds, trains and ships machine learning systems to production.",
    demand_score: 0.92,
    demand_label: "Very High",
    demand_snapshot_date: "2026-08",
    skills_count: 51,
    skill_ids: [
      "python-fundamentals",
      "python-data-structures",
      "numpy-arrays",
      "linear-algebra",
      "calculus-basics",
      "multivariate-calculus",
      "statistics-fundamentals",
      "probability",
      "optimization-basics",
      "sql",
      "data-analysis-pandas",
      "data-visualization",
      "data-wrangling",
      "exploratory-data-analysis",
      "feature-engineering",
      "ml-fundamentals",
      "supervised-learning",
      "unsupervised-learning",
      "model-evaluation",
      "regularization",
      "ensemble-methods",
      "hyperparameter-tuning",
      "scikit-learn",
      "gradient-descent",
      "deep-learning-fundamentals",
      "backpropagation",
      "neural-networks",
      "pytorch-basics",
      "cnn-architectures",
      "rnn-sequence-models",
      "attention-mechanisms",
      "transformer-architecture",
      "transfer-learning",
      "nlp-fundamentals",
      "tokenization-embeddings",
      "computer-vision-fundamentals",
      "llm-fundamentals",
      "prompt-engineering",
      "vector-databases",
      "rag-systems",
      "git-basics",
      "testing-fundamentals",
      "linux-fundamentals",
      "cloud-fundamentals",
      "containers-docker",
      "rest-apis-python",
      "experiment-tracking",
      "ci-cd-fundamentals",
      "model-serving",
      "model-monitoring",
      "mlops-pipelines",
    ],
  },
  {
    id: "full-stack-engineer",
    name: "Full-Stack Web & AI Application Engineer",
    summary: "Builds, scales, and ships full-stack web applications integrated with modern LLMs and APIs.",
    demand_score: 0.95,
    demand_label: "Very High",
    demand_snapshot_date: "2026-08",
    skills_count: 36,
    skill_ids: [
      "optimization-basics",
      "llm-fundamentals",
      "neural-networks",
      "js-fundamentals",
      "backpropagation",
      "python-fundamentals",
      "nodejs-backend",
      "deep-learning-fundamentals",
      "git-basics",
      "testing-fundamentals",
      "supervised-learning",
      "typescript-fundamentals",
      "cloud-deployment",
      "linux-fundamentals",
      "calculus-basics",
      "ci-cd-fundamentals",
      "attention-mechanisms",
      "numpy-arrays",
      "rest-apis-python",
      "statistics-fundamentals",
      "sql",
      "prompt-engineering",
      "python-data-structures",
      "vector-databases",
      "gradient-descent",
      "transformer-architecture",
      "tokenization-embeddings",
      "multivariate-calculus",
      "ml-fundamentals",
      "rnn-sequence-models",
      "linear-algebra",
      "rag-systems",
      "containers-docker",
      "cloud-fundamentals",
      "nlp-fundamentals",
      "react-basics",
    ],
  },
  {
    id: "cloud-devops-engineer",
    name: "Cloud Infrastructure & DevOps Engineer",
    summary: "Automates cloud infrastructure, continuous deployment, and high-availability container clusters.",
    demand_score: 0.89,
    demand_label: "High",
    demand_snapshot_date: "2026-08",
    skills_count: 30,
    skill_ids: [
      "optimization-basics",
      "cloud-monitoring",
      "model-serving",
      "pytorch-basics",
      "neural-networks",
      "backpropagation",
      "python-fundamentals",
      "deep-learning-fundamentals",
      "networking-fundamentals",
      "git-basics",
      "testing-fundamentals",
      "supervised-learning",
      "model-monitoring",
      "model-evaluation",
      "linux-fundamentals",
      "calculus-basics",
      "infrastructure-as-code",
      "ci-cd-fundamentals",
      "numpy-arrays",
      "rest-apis-python",
      "python-data-structures",
      "gradient-descent",
      "kubernetes-basics",
      "multivariate-calculus",
      "ml-fundamentals",
      "linear-algebra",
      "security-fundamentals",
      "containers-docker",
      "cloud-fundamentals",
      "statistics-fundamentals",
    ],
  },
  {
    id: "data-engineer",
    name: "Data Platform & Analytics Engineer",
    summary: "Architects high-throughput ETL/ELT pipelines, data lakes, distributed Spark clusters, and real-time streams.",
    demand_score: 0.92,
    demand_label: "Very High",
    demand_snapshot_date: "2026-08",
    skills_count: 29,
    skill_ids: [
      "airflow-orchestration",
      "distributed-computing-spark",
      "dbt-transformations",
      "data-wrangling",
      "kafka-streaming",
      "data-warehousing",
      "data-visualization",
      "python-fundamentals",
      "deep-learning-fundamentals",
      "git-basics",
      "testing-fundamentals",
      "supervised-learning",
      "nlp-fundamentals",
      "linux-fundamentals",
      "calculus-basics",
      "ci-cd-fundamentals",
      "data-analysis-pandas",
      "numpy-arrays",
      "rest-apis-python",
      "sql",
      "python-data-structures",
      "vector-databases",
      "tokenization-embeddings",
      "multivariate-calculus",
      "ml-fundamentals",
      "linear-algebra",
      "containers-docker",
      "cloud-fundamentals",
      "statistics-fundamentals",
    ],
  },
];

export default function OnboardingRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [knownSkills, setKnownSkills] = useState<Record<string, number>>({});
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [showAllRoles, setShowAllRoles] = useState(false);

  // Hydrate captured skills + prior selection from the draft after mount
  // (reading localStorage during render causes an SSR hydration mismatch).
  useEffect(() => {
    const d = getOnboardingDraft();
    setKnownSkills(d.knownSkills || {});
    setSelectedRoleId(d.targetRoleId || "");
  }, []);
  const [loading, setLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      setLoading(true);
      try {
        const res = await getRoles();
        if (res?.roles && res.roles.length > 0) {
          setRoles(res.roles);
        } else {
          setRoles(FALLBACK_ROLES);
        }
      } catch {
        setRoles(FALLBACK_ROLES);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  const capturedSkillIds = Object.keys(knownSkills);
  const hasCapturedSkills = capturedSkillIds.length > 0;

  // Compute real background match % and ranking
  const rankedRoles = roles.map((role) => {
    const roleSkillIds = role.skill_ids || [];
    const overlapIds = capturedSkillIds.filter((id) =>
      roleSkillIds.some(
        (rsId) => rsId.toLowerCase() === id.toLowerCase() || id.toLowerCase().includes(rsId.toLowerCase())
      )
    );
    const overlapCount = overlapIds.length;
    const matchPct =
      roleSkillIds.length > 0
        ? Math.min(100, Math.round((overlapCount / roleSkillIds.length) * 100))
        : 0;

    return {
      ...role,
      overlapCount,
      overlapIds,
      matchPct,
    };
  });

  rankedRoles.sort((a, b) => {
    if (hasCapturedSkills && b.overlapCount !== a.overlapCount) {
      return b.overlapCount - a.overlapCount;
    }
    return b.demand_score - a.demand_score;
  });

  const activeRoleId = selectedRoleId || rankedRoles[0]?.id || "";
  const topRoles = rankedRoles.slice(0, 3);
  const remainingRoles = rankedRoles.slice(3);
  const selectedRole = rankedRoles.find((r) => r.id === activeRoleId) || topRoles[0];

  const handleSelectRole = (role: (typeof rankedRoles)[0]) => {
    setSelectedRoleId(role.id);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsAdvancing(true);
    saveOnboardingDraft({
      targetRole: selectedRole.name,
      targetRoleId: selectedRole.id,
      goal: selectedRole.name,
    });
    await updateOnboardingStatus("diagnostic_pending");
    router.push("/onboarding/diagnostic");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-muted uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
          Step 3: Role Track Recommendations
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Choose Your Target Role
        </h1>
        <p className="text-sm text-muted">
          {hasCapturedSkills
            ? `Ranked by verifiable skill overlap with your ${capturedSkillIds.length} captured background skills and market demand.`
            : "Explore in-demand industry tracks tailored to your goal timeline. No background skills imported."}
        </p>
      </div>

      {/* Role Cards List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="text-sm font-semibold text-ink animate-pulse">
            Analyzing graph overlap & industry demand scores...
          </div>
          <p className="text-xs text-muted">Evaluating prerequisite dependencies</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRoles.map((role, idx) => {
              const isSelected = activeRoleId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                    isSelected
                      ? "bg-surface border-ink shadow-md ring-2 ring-ink/20"
                      : "bg-canvas border-border hover:border-border-hover hover:bg-surface/40"
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-ink/10 text-ink">
                        #{idx + 1}
                      </span>
                      {hasCapturedSkills ? (
                        role.matchPct > 0 ? (
                          <Pill variant="mastered">
                            {role.matchPct}% Match
                          </Pill>
                        ) : (
                          <Pill variant="neutral">
                            0% Overlap
                          </Pill>
                        )
                      ) : (
                        <span className="text-[11px] font-medium text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                          New to this track
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "border-ink bg-ink text-canvas"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-canvas" />}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-base text-ink leading-snug">
                      {role.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-3">
                      {role.summary}
                    </p>
                  </div>

                  {/* Card Meta Footer */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {role.skills_count} skills
                    </span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      {role.demand_label} Demand
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Other Roles */}
          {remainingRoles.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAllRoles((prev) => !prev)}
                className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface/30 hover:bg-surface text-xs font-medium text-muted hover:text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{showAllRoles ? "Hide additional tracks" : `Show ${remainingRoles.length} other tracks`}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllRoles ? "rotate-180" : ""}`} />
              </button>

              {showAllRoles && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {remainingRoles.map((role) => {
                    const isSelected = activeRoleId === role.id;
                    return (
                      <div
                        key={role.id}
                        onClick={() => handleSelectRole(role)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-surface border-ink shadow-2xs ring-1 ring-ink/20"
                            : "bg-canvas border-border hover:border-border-hover"
                        }`}
                      >
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-ink">{role.name}</span>
                            {hasCapturedSkills ? (
                              role.matchPct > 0 ? (
                                <Pill variant="mastered">{role.matchPct}%</Pill>
                              ) : (
                                <Pill variant="neutral">0%</Pill>
                              )
                            ) : (
                              <span className="text-[10px] text-muted">New to track</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted line-clamp-1">{role.summary}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-ink bg-ink text-canvas" : "border-border"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-canvas" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Role Summary Callout */}
      {selectedRole && (
        <Card className="p-4 bg-surface border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-canvas border border-border text-ink">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Selected Role Track
              </span>
              <h4 className="text-sm font-bold text-ink">{selectedRole.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasCapturedSkills ? (
              selectedRole.matchPct > 0 ? (
                <Pill variant="mastered">
                  {selectedRole.overlapCount} / {selectedRole.skills_count} Skills Mastered ({selectedRole.matchPct}%)
                </Pill>
              ) : (
                <Pill variant="neutral">Foundational Prerequisites Required</Pill>
              )
            ) : (
              <Pill variant="neutral">Zero-Assumption Baseline</Pill>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Link
          href="/onboarding/discovery"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discovery</span>
        </Link>

        <button
          type="button"
          disabled={!activeRoleId || isAdvancing}
          onClick={handleContinue}
          className="bg-ink text-canvas font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-ink/90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <span>Confirm & Start Diagnostic Probe</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
