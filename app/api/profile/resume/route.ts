import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { db } from "@/lib/db";
import { profiles, skillMastery } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { extractResumeText } from "@/lib/resume";
import { chatJson } from "@/lib/llm";
import { resumeExtractionMessages } from "@/lib/prompts";
import { SKILLS_BY_ID } from "@/data/skills";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB - resumes are small; this just bounds abuse
const CONFIDENCE_SCORE: Record<string, number> = { low: 40, medium: 55, high: 70 };

type Extraction = {
  currentRole: string | null;
  careerGoal: string | null;
  yearsExperience: number | null;
  summary: string;
  skillMastery: { skillId: string; confidence: "low" | "medium" | "high" }[];
};

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const currentRole = (formData.get("currentRole") as string | null)?.trim() || null;
    const careerGoal = (formData.get("careerGoal") as string | null)?.trim() || null;
    const yearsRaw = formData.get("yearsExperience") as string | null;
    const yearsExperience = yearsRaw ? Number(yearsRaw) : null;

    let resumeText: string | null = null;
    if (file) {
      if (file.size > MAX_FILE_BYTES) return jsonError("Resume file is too large (5MB max)");
      const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "text/plain");
      if (mimeType !== "application/pdf" && !mimeType.startsWith("text/")) {
        return jsonError("Only PDF or plain text resumes are supported");
      }
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        resumeText = await extractResumeText(buffer, mimeType);
      } catch (err) {
        console.error("Resume parsing error:", err);
      }
    }

    if (!resumeText && !currentRole && !careerGoal && yearsExperience == null) {
      return jsonError(
        "Could not extract readable text from the uploaded document. Please fill in your Current Role or Career Goal below.",
        400
      );
    }

    const extraction = await chatJson<Extraction>(
      resumeExtractionMessages({ resumeText, currentRole, careerGoal, yearsExperience }),
      { temperature: 0.3, maxTokens: 1500 },
    );

    await db
      .update(profiles)
      .set({ resumeText, resumeProfile: extraction })
      .where(eq(profiles.userId, user.id));

    // Seed skill_mastery from the resume - but only for skills this learner
    // has no existing mastery row for at all. A resume-inferred guess is
    // the weakest signal in the app (stated < resume < diagnostic <
    // practice < proctored); it must never overwrite anything stronger,
    // and shouldn't even overwrite an equally-weak self-reported value.
    const skillList = extraction.skillMastery ?? [];
    const validSkillIds = skillList.filter((s) => SKILLS_BY_ID.has(s.skillId)).map((s) => s.skillId);
    let seededCount = 0;
    if (validSkillIds.length > 0) {
      const existing = await db
        .select({ skillId: skillMastery.skillId })
        .from(skillMastery)
        .where(and(eq(skillMastery.userId, user.id), inArray(skillMastery.skillId, validSkillIds)));
      const existingIds = new Set(existing.map((r) => r.skillId));

      for (const s of skillList) {
        if (!SKILLS_BY_ID.has(s.skillId) || existingIds.has(s.skillId)) continue;
        await db.insert(skillMastery).values({
          userId: user.id,
          skillId: s.skillId,
          score: CONFIDENCE_SCORE[s.confidence] ?? 40,
          source: "resume",
        });
        seededCount++;
      }
    }

    return NextResponse.json({ extraction, seededCount });
  });
}
