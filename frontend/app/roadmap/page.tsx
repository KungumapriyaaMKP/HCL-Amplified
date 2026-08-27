"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanResponse } from "@/lib/api/pathfinder";
import { loadPlan, storePlan } from "@/lib/planStore";
import { RoadmapHeader } from "@/features/roadmap/RoadmapHeader";
import { RoadmapBoard } from "@/features/roadmap/RoadmapBoard";

export default function RoadmapPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanResponse | null>(() => {
    if (typeof window !== "undefined") {
      return loadPlan();
    }
    return null;
  });

  useEffect(() => {
    if (!plan) {
      const p = loadPlan();
      if (!p) {
        router.replace("/");
      }
    }
  }, [plan, router]);

  if (!plan) return null;

  return (
    <main>
      <RoadmapHeader plan={plan} />
      <RoadmapBoard
        plan={plan}
        onPlanUpdated={(p) => {
          setPlan(p);
          storePlan(p);
        }}
      />
    </main>
  );
}
