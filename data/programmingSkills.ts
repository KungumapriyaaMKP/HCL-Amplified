// Skills that involve writing and running real code. The mapped value is the
// runner language slug (see lib/external/codeRunner.ts) used to power the
// in-app compiler/practice page for modules teaching that skill.
export const PROGRAMMING_SKILLS: Record<string, string> = {
  "js-fundamentals": "javascript",
  "dom-manipulation": "javascript",
  typescript: "typescript",
  "react-fundamentals": "javascript",
  "state-management": "javascript",
  "nodejs-fundamentals": "javascript",
  "rest-apis": "javascript",
  "fullstack-integration": "javascript",
  "testing-fundamentals": "javascript",
  "python-fundamentals": "python",
  "python-data-structures": "python",
  "data-analysis-pandas": "python",
  "data-visualization": "python",
  "data-wrangling": "python",
  "exploratory-data-analysis": "python",
  "ml-fundamentals": "python",
  "supervised-learning": "python",
  "unsupervised-learning": "python",
  "model-evaluation": "python",
  "deep-learning-fundamentals": "python",
  "neural-networks": "python",
  "nlp-fundamentals": "python",
  "computer-vision-fundamentals": "python",
  "llm-and-genai": "python",
  "react-native-basics": "javascript",
  "mobile-dev-fundamentals": "javascript",
};

export function isProgrammingSkill(skillId: string): boolean {
  return skillId in PROGRAMMING_SKILLS;
}

export function languageForSkill(skillId: string): string | null {
  return PROGRAMMING_SKILLS[skillId] ?? null;
}
