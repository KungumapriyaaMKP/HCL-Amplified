"use client";

import { CodeLab } from "@/features/lab/CodeLab";

export default function LabPage() {
  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Interactive Sandbox
          </span>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">
            Code Laboratory
          </h1>
          <p className="text-sm text-muted">
            Verify code algorithms, mathematical transforms, and neural network routines client-side.
          </p>
        </div>

        <CodeLab />
      </main>
    </div>
  );
}
