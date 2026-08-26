import { db } from "@/lib/db";
import { resources, resourceSkills } from "@/db/schema";
import { eq } from "drizzle-orm";

const CATALOG_URL = "https://learn.microsoft.com/api/catalog/?type=modules,learningPaths&locale=en-us";

type CatalogEntry = {
  uid: string;
  title: string;
  summary: string;
  url: string;
  duration_in_minutes?: number;
  levels?: string[];
  type: "module" | "learningPath";
};

type Catalog = { modules: CatalogEntry[]; learningPaths: CatalogEntry[] };

let catalogCache: CatalogEntry[] | null = null;
let catalogCacheAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

// Extra search keywords beyond the skill's own name, for skills whose
// canonical name doesn't match Microsoft Learn's terminology well.
const ALIASES: Record<string, string[]> = {
  "js-fundamentals": ["javascript"],
  "nodejs-fundamentals": ["node.js"],
  sql: ["sql", "transact-sql", "database fundamentals"],
  "cloud-fundamentals": ["azure fundamentals", "cloud concepts"],
  "containers-docker": ["docker", "containers"],
  "kubernetes-basics": ["kubernetes", "aks"],
  "cloud-deployment": ["deploy", "app service"],
  "infrastructure-as-code": ["bicep", "terraform", "arm templates"],
  "ci-cd-fundamentals": ["github actions", "azure devops", "ci/cd"],
  "linux-fundamentals": ["linux"],
  "security-fundamentals": ["security fundamentals"],
  "networking-fundamentals": ["networking"],
  "cryptography-basics": ["encryption"],
  "ml-fundamentals": ["machine learning"],
  "deep-learning-fundamentals": ["deep learning", "neural network"],
  "llm-and-genai": ["generative ai", "azure openai", "large language model"],
  "nlp-fundamentals": ["natural language processing", "text analytics"],
  "computer-vision-fundamentals": ["computer vision"],
  "python-fundamentals": ["python"],
  "data-analysis-pandas": ["data analysis"],
};

async function getCatalog(): Promise<CatalogEntry[]> {
  if (catalogCache && Date.now() - catalogCacheAt < CACHE_TTL_MS) return catalogCache;
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error(`Microsoft Learn catalog request failed (${res.status})`);
  const data: Catalog = await res.json();
  catalogCache = [
    ...data.modules.map((m) => ({ ...m, type: "module" as const })),
    ...data.learningPaths.map((p) => ({ ...p, type: "learningPath" as const })),
  ];
  catalogCacheAt = Date.now();
  return catalogCache;
}

function mapLevel(levels?: string[]): "beginner" | "intermediate" | "advanced" {
  const l = levels?.[0]?.toLowerCase();
  if (l === "intermediate") return "intermediate";
  if (l === "advanced") return "advanced";
  return "beginner";
}

/**
 * Searches the live, public Microsoft Learn Catalog API for content
 * matching a skill, and upserts matches into the shared `resources` table
 * (source='ms_learn') so the recommendation engine can rank them alongside
 * internal/curated resources. Cached in-memory for an hour since the full
 * catalog is a multi-MB fetch.
 */
export async function syncMsLearnResourcesForSkill(
  skillId: string,
  skillName: string,
  limit = 3,
): Promise<number> {
  let catalog: CatalogEntry[];
  try {
    catalog = await getCatalog();
  } catch {
    return 0; // network hiccup - internal/curated catalog still covers this skill
  }

  const keywords = [skillName.toLowerCase(), ...(ALIASES[skillId] ?? [])];
  // Word-boundary match, not substring - a plain `.includes("sql")` also
  // matches "NoSQL"/"MySQL"/"Cosmos DB ... SQL API" content, which pollutes
  // the pool with resources that don't actually teach the skill.
  const keywordPatterns = keywords.map(
    (k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
  );
  // Title only, not title+summary: a summary often lists supported/adjacent
  // technologies in passing (e.g. an Azure App Service deployment article
  // mentioning ".NET, Java, Node.js, PHP, and Python" as runtime options),
  // which used to match the "python" keyword despite the module having
  // nothing to do with learning Python. A title names the actual subject.
  const matches = catalog
    .filter((entry) => keywordPatterns.some((re) => re.test(entry.title)))
    .slice(0, limit);

  let count = 0;
  for (const entry of matches) {
    const values = {
      source: "ms_learn" as const,
      title: entry.title,
      url: entry.url.startsWith("http") ? entry.url : `https://learn.microsoft.com${entry.url}`,
      type: entry.type === "learningPath" ? ("course" as const) : ("article" as const),
      description: entry.summary,
      provider: "Microsoft Learn",
      estimatedMinutes: entry.duration_in_minutes ?? 60,
      difficulty: mapLevel(entry.levels),
      rating: 4.5,
      externalId: `ms_learn-${entry.uid}`,
      cachedAt: new Date(),
    };

    const [row] = await db
      .insert(resources)
      .values(values)
      .onConflictDoUpdate({ target: resources.externalId, set: values })
      .returning();

    await db.delete(resourceSkills).where(eq(resourceSkills.resourceId, row.id));
    await db.insert(resourceSkills).values({ resourceId: row.id, skillId, weight: 1 });
    count++;
  }

  return count;
}
