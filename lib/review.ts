import { db } from "@/lib/db";
import { reviewSchedule } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface ScheduleState {
  intervalDays: number;
  ease: number;
  reps: number;
}

export interface NextScheduleResult {
  intervalDays: number;
  ease: number;
  reps: number;
  dueAt: Date;
}

/**
 * Computes SM-2 spaced repetition intervals and ease factors based on learner grade.
 */
export function calculateNextReview(
  current: ScheduleState,
  grade: ReviewGrade
): NextScheduleResult {
  let intervalDays = current.intervalDays || 1;
  let ease = current.ease || 2.5;
  let reps = current.reps || 0;

  switch (grade) {
    case "again":
      reps = 0;
      intervalDays = 1;
      ease = Math.max(1.3, ease - 0.2);
      break;

    case "hard":
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      ease = Math.max(1.3, ease - 0.15);
      break;

    case "good":
      reps += 1;
      if (reps === 1) {
        intervalDays = 1;
      } else if (reps === 2) {
        intervalDays = 6;
      } else {
        intervalDays = Math.max(1, Math.round(intervalDays * ease));
      }
      break;

    case "easy":
      reps += 1;
      if (reps === 1) {
        intervalDays = 4;
      } else {
        intervalDays = Math.max(1, Math.round(intervalDays * ease * 1.3));
      }
      ease = Number((ease + 0.15).toFixed(2));
      break;
  }

  const dueAt = new Date(Date.now() + intervalDays * 86_400_000);

  return {
    intervalDays,
    ease: Number(ease.toFixed(2)),
    reps,
    dueAt,
  };
}

/**
 * Seeds a default review schedule row for a user & skill if one does not exist.
 */
export async function seedReviewSchedule(userId: string, skillId: string) {
  const existing = await db
    .select()
    .from(reviewSchedule)
    .where(and(eq(reviewSchedule.userId, userId), eq(reviewSchedule.skillId, skillId)));

  if (existing.length === 0) {
    await db
      .insert(reviewSchedule)
      .values({
        userId,
        skillId,
        dueAt: new Date(), // due now
        intervalDays: 1,
        ease: 2.5,
        reps: 0,
      })
      .onConflictDoNothing();
  }
}
