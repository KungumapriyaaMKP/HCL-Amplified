import { SKILLS, SKILLS_BY_ID } from "./skills";

export type ResourceDef = {
  key: string; // stable slug used as externalId for internal/curated rows
  source: "internal" | "curated";
  title: string;
  url: string;
  type: "course" | "project" | "article";
  description: string;
  provider: string;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  skillWeights: Record<string, number>;
};

// Skills that are hands-on/integrative enough to warrant a project resource
// in addition to a course, and the difficulty tier that project sits at.
const PROJECT_SKILLS: Record<string, "intermediate" | "advanced"> = {
  "dom-manipulation": "intermediate",
  "react-fundamentals": "intermediate",
  "state-management": "intermediate",
  "rest-apis": "intermediate",
  "fullstack-integration": "advanced",
  "data-analysis-pandas": "intermediate",
  "exploratory-data-analysis": "intermediate",
  "supervised-learning": "intermediate",
  "unsupervised-learning": "intermediate",
  "deep-learning-fundamentals": "advanced",
  "nlp-fundamentals": "advanced",
  "computer-vision-fundamentals": "advanced",
  "llm-and-genai": "advanced",
  "containers-docker": "intermediate",
  "cloud-deployment": "advanced",
  "kubernetes-basics": "advanced",
  "react-native-basics": "intermediate",
  "web-security": "intermediate",
  "penetration-testing-basics": "advanced",
  "ci-cd-fundamentals": "intermediate",
  "infrastructure-as-code": "advanced",
};

const PROVIDERS_BY_DOMAIN: Record<string, string[]> = {
  "web-dev": ["Frontend Masters Path", "Internal Curriculum"],
  "data-science": ["Applied Data Science Path", "Internal Curriculum"],
  "ai-ml": ["ML Engineering Path", "Internal Curriculum"],
  "cloud-devops": ["Cloud Practitioner Path", "Internal Curriculum"],
  "mobile-dev": ["Mobile Engineering Path", "Internal Curriculum"],
  "cybersecurity": ["Security Practitioner Path", "Internal Curriculum"],
};

// Depth-based difficulty: skills with more prerequisites are harder. Cheap
// heuristic, computed once here rather than hand-typed per skill.
function difficultyForDepth(skillId: string, memo = new Map<string, number>()): "beginner" | "intermediate" | "advanced" {
  function depth(id: string, seen = new Set<string>()): number {
    if (memo.has(id)) return memo.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const skill = SKILLS_BY_ID.get(id);
    if (!skill || skill.prerequisites.length === 0) {
      memo.set(id, 0);
      return 0;
    }
    const d = 1 + Math.max(...skill.prerequisites.map((p) => depth(p, seen)));
    memo.set(id, d);
    return d;
  }
  const d = depth(skillId);
  if (d <= 1) return "beginner";
  if (d <= 3) return "intermediate";
  return "advanced";
}

function buildInternalCatalog(): ResourceDef[] {
  const resources: ResourceDef[] = [];

  for (const skill of SKILLS) {
    const difficulty = difficultyForDepth(skill.id);
    const providers = PROVIDERS_BY_DOMAIN[skill.category] ?? ["Internal Curriculum"];

    resources.push({
      key: `course-${skill.id}`,
      source: "internal",
      title: `${skill.name}: Core Concepts`,
      url: `https://learn.example.dev/courses/${skill.id}`,
      type: "course",
      description: `A structured course covering ${skill.description.toLowerCase()}`,
      provider: providers[0],
      estimatedMinutes: difficulty === "beginner" ? 180 : difficulty === "intermediate" ? 300 : 420,
      difficulty,
      rating: 4.3 + Math.random() * 0.6,
      skillWeights: { [skill.id]: 1 },
    });

    if (skill.id in PROJECT_SKILLS) {
      const projectDifficulty = PROJECT_SKILLS[skill.id];
      const reinforced = skill.prerequisites.slice(0, 2);
      const weights: Record<string, number> = { [skill.id]: 1 };
      reinforced.forEach((p) => (weights[p] = 0.4));

      resources.push({
        key: `project-${skill.id}`,
        source: "internal",
        title: `Hands-on Project: Applying ${skill.name}`,
        url: `https://learn.example.dev/projects/${skill.id}`,
        type: "project",
        description: `A guided project that puts ${skill.name.toLowerCase()} into practice end-to-end.`,
        provider: "Internal Curriculum",
        estimatedMinutes: projectDifficulty === "advanced" ? 480 : 300,
        difficulty: projectDifficulty,
        rating: 4.4 + Math.random() * 0.5,
        skillWeights: weights,
      });
    }
  }

  return resources;
}

// A small, hand-picked set of real, working links from providers that don't
// expose a public API (MIT OpenCourseWare, freeCodeCamp). Labeled "curated"
// so the UI is honest that these aren't a live API integration, unlike the
// Microsoft Learn Catalog API results (lib/external/msLearn.ts).
const CURATED: ResourceDef[] = [
  {
    key: "curated-mit-python",
    source: "curated",
    title: "Introduction to Computer Science and Programming in Python",
    url: "https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/",
    type: "course",
    description: "MIT's classic intro programming course, taught in Python.",
    provider: "MIT OpenCourseWare",
    estimatedMinutes: 900,
    difficulty: "beginner",
    rating: 4.9,
    skillWeights: { "python-fundamentals": 1 },
  },
  {
    key: "curated-mit-linear-algebra",
    source: "curated",
    title: "Linear Algebra",
    url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    type: "course",
    description: "Gilbert Strang's renowned linear algebra course.",
    provider: "MIT OpenCourseWare",
    estimatedMinutes: 1200,
    difficulty: "intermediate",
    rating: 4.9,
    skillWeights: { "linear-algebra": 1 },
  },
  {
    key: "curated-mit-calculus",
    source: "curated",
    title: "Single Variable Calculus",
    url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/",
    type: "course",
    description: "Foundational calculus: derivatives, gradients, optimization.",
    provider: "MIT OpenCourseWare",
    estimatedMinutes: 900,
    difficulty: "intermediate",
    rating: 4.7,
    skillWeights: { "calculus-basics": 1 },
  },
  {
    key: "curated-mit-probability",
    source: "curated",
    title: "Introduction to Probability and Statistics",
    url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/",
    type: "course",
    description: "Rigorous, applied introduction to probability and statistics.",
    provider: "MIT OpenCourseWare",
    estimatedMinutes: 900,
    difficulty: "intermediate",
    rating: 4.8,
    skillWeights: { "statistics-fundamentals": 1, probability: 0.6 },
  },
  {
    key: "curated-mit-ml",
    source: "curated",
    title: "Introduction to Machine Learning",
    url: "https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020/",
    type: "course",
    description: "MIT's foundational machine learning course.",
    provider: "MIT OpenCourseWare",
    estimatedMinutes: 1200,
    difficulty: "advanced",
    rating: 4.8,
    skillWeights: { "ml-fundamentals": 1, "supervised-learning": 0.5 },
  },
  {
    key: "curated-mit-networks",
    source: "curated",
    title: "Computer Networks",
    url: "https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/",
    type: "course",
    description: "How networks, protocols and routing actually work.",
    provider: "MIT OpenCourseWare",
    estimatedMinutes: 900,
    difficulty: "intermediate",
    rating: 4.5,
    skillWeights: { "networking-fundamentals": 1 },
  },
  {
    key: "curated-fcc-responsive-web-design",
    source: "curated",
    title: "Responsive Web Design Certification",
    url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    type: "course",
    description: "freeCodeCamp's hands-on HTML/CSS certification path.",
    provider: "freeCodeCamp",
    estimatedMinutes: 900,
    difficulty: "beginner",
    rating: 4.8,
    skillWeights: { html: 1, css: 0.8, "responsive-design": 0.6 },
  },
  {
    key: "curated-fcc-js-algorithms",
    source: "curated",
    title: "JavaScript Algorithms and Data Structures",
    url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    type: "course",
    description: "freeCodeCamp's core JavaScript certification.",
    provider: "freeCodeCamp",
    estimatedMinutes: 1500,
    difficulty: "beginner",
    rating: 4.8,
    skillWeights: { "js-fundamentals": 1 },
  },
  {
    key: "curated-fcc-frontend-libraries",
    source: "curated",
    title: "Front End Development Libraries (React)",
    url: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
    type: "course",
    description: "React, Redux and friends via freeCodeCamp's project-based path.",
    provider: "freeCodeCamp",
    estimatedMinutes: 1200,
    difficulty: "intermediate",
    rating: 4.6,
    skillWeights: { "react-fundamentals": 1, "state-management": 0.5 },
  },
  {
    key: "curated-fcc-apis-microservices",
    source: "curated",
    title: "Back End Development and APIs",
    url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
    type: "course",
    description: "Node.js, Express and REST API design, hands-on.",
    provider: "freeCodeCamp",
    estimatedMinutes: 900,
    difficulty: "intermediate",
    rating: 4.6,
    skillWeights: { "nodejs-fundamentals": 1, "rest-apis": 0.8 },
  },
  {
    key: "curated-fcc-relational-db",
    source: "curated",
    title: "Relational Database Certification",
    url: "https://www.freecodecamp.org/learn/relational-database/",
    type: "course",
    description: "SQL fundamentals via freeCodeCamp's interactive terminal.",
    provider: "freeCodeCamp",
    estimatedMinutes: 900,
    difficulty: "beginner",
    rating: 4.6,
    skillWeights: { sql: 1 },
  },
  {
    key: "curated-fcc-data-analysis-python",
    source: "curated",
    title: "Data Analysis with Python Certification",
    url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
    type: "course",
    description: "Pandas, NumPy and applied data analysis.",
    provider: "freeCodeCamp",
    estimatedMinutes: 1500,
    difficulty: "intermediate",
    rating: 4.7,
    skillWeights: { "data-analysis-pandas": 1, "python-data-structures": 0.4 },
  },
  {
    key: "curated-fcc-scientific-computing-python",
    source: "curated",
    title: "Scientific Computing with Python Certification",
    url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
    type: "course",
    description: "Python fundamentals through a scientific-computing lens.",
    provider: "freeCodeCamp",
    estimatedMinutes: 1200,
    difficulty: "beginner",
    rating: 4.6,
    skillWeights: { "python-fundamentals": 1, "python-data-structures": 0.5 },
  },
];

export function buildCatalog(): ResourceDef[] {
  return [...buildInternalCatalog(), ...CURATED];
}
