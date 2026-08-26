"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanResponse } from "@/lib/api/pathfinder";
import { loadPlan } from "@/lib/planStore";
import { RoadmapHeader } from "@/features/roadmap/RoadmapHeader";
import { RoadmapBoard } from "@/features/roadmap/RoadmapBoard";

export default function RoadmapPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  useEffect(() => {
    const p = loadPlan();
    if (!p) router.replace("/");
    else setPlan(p);
  }, [router]);

  if (!plan) return null;

  return (
    <main>
      <RoadmapHeader plan={plan} />
      <RoadmapBoard plan={plan} />
    </main>
  );
}
