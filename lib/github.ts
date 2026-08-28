import { SKILLS_BY_ID, SKILLS } from "@/data/skills";

export interface GitHubDiscoveredSkill {
  skillId: string;
  skillName: string;
  confidence: "low" | "medium" | "high";
  evidence: string;
}

export interface GitHubProfileResult {
  username: string;
  repoCount: number;
  topLanguages: { language: string; count: number }[];
  topics: string[];
  discoveredSkills: GitHubDiscoveredSkill[];
}

const LANGUAGE_TO_SKILL_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  sql: "sql",
  html: "html",
  css: "css",
  r: "r-programming",
  go: "golang",
  rust: "rust",
  java: "java",
  kotlin: "kotlin",
  swift: "swift",
  c: "c-programming",
  "c++": "cpp",
  "c#": "csharp",
};

const TOPIC_TO_SKILL_MAP: Record<string, string> = {
  react: "react-fundamentals",
  nextjs: "nextjs",
  vue: "vuejs",
  docker: "docker-containers",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  pytorch: "pytorch",
  tensorflow: "tensorflow",
  fastapi: "fastapi",
  django: "django",
  flask: "flask",
  express: "expressjs",
  nodejs: "nodejs",
  node: "nodejs",
  graphql: "graphql",
  postgres: "postgresql",
  postgresql: "postgresql",
  mongodb: "mongodb",
  aws: "aws-cloud",
  azure: "azure-cloud",
  gcp: "gcp-cloud",
  git: "git-version-control",
  linux: "linux-fundamentals",
};

export async function fetchGitHubProfile(username: string): Promise<GitHubProfileResult | null> {
  const cleanUser = username.trim().replace(/^@/, "");
  if (!cleanUser) return null;

  const headers: Record<string, string> = {
    "User-Agent": "Pathwise-Profiler/1.0",
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const url = `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=updated`;
  const res = await fetch(url, { headers, next: { revalidate: 300 } });
  if (!res.ok) return null;

  const repos = (await res.json()) as Array<{
    language?: string | null;
    topics?: string[];
    description?: string | null;
  }>;

  if (!Array.isArray(repos)) return null;

  const langCounts = new Map<string, number>();
  const topicsSet = new Set<string>();

  for (const repo of repos) {
    if (repo.language) {
      const l = repo.language.toLowerCase();
      langCounts.set(l, (langCounts.get(l) ?? 0) + 1);
    }

    if (Array.isArray(repo.topics)) {
      for (const t of repo.topics) topicsSet.add(t.toLowerCase());
    }

    const desc = (repo.description ?? "").toLowerCase();
    for (const keyword of Object.keys(TOPIC_TO_SKILL_MAP)) {
      if (desc.includes(keyword)) topicsSet.add(keyword);
    }
  }

  const discoveredSkills: GitHubDiscoveredSkill[] = [];
  const matchedSkillIds = new Set<string>();

  // Map languages
  for (const [lang, count] of langCounts.entries()) {
    const directId = LANGUAGE_TO_SKILL_MAP[lang] ?? lang;
    const skill = SKILLS_BY_ID.get(directId) ?? SKILLS.find((s) => s.name.toLowerCase() === lang);
    if (skill && !matchedSkillIds.has(skill.id)) {
      matchedSkillIds.add(skill.id);
      discoveredSkills.push({
        skillId: skill.id,
        skillName: skill.name,
        confidence: count >= 3 ? "high" : "medium",
        evidence: `${count} public repository(s) with primary language ${skill.name}`,
      });
    }
  }

  // Map topics & keywords
  for (const topic of topicsSet) {
    const directId = TOPIC_TO_SKILL_MAP[topic] ?? topic;
    const skill = SKILLS_BY_ID.get(directId) ?? SKILLS.find((s) => s.name.toLowerCase() === topic);
    if (skill && !matchedSkillIds.has(skill.id)) {
      matchedSkillIds.add(skill.id);
      discoveredSkills.push({
        skillId: skill.id,
        skillName: skill.name,
        confidence: "medium",
        evidence: `Identified across repository topics and descriptions: "${topic}"`,
      });
    }
  }

  const topLanguages = Array.from(langCounts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    username: cleanUser,
    repoCount: repos.length,
    topLanguages,
    topics: Array.from(topicsSet).slice(0, 15),
    discoveredSkills,
  };
}
