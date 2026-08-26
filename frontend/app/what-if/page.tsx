"use client";

import { WhatIfBranching } from "@/features/whatif/WhatIfBranching";

export default function WhatIfPage() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Career Architecture
          </span>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">
            What-If Career Track Branching
          </h1>
          <p className="text-sm text-muted">
            Compare transferability, shared curriculum nodes, and delta study hours across the top 4 in-demand engineering disciplines.
          </p>
        </div>

        <WhatIfBranching />
      </main>
    </div>
  );
}
