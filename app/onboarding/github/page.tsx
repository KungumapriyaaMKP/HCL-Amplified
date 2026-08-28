"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { Input, Label } from "@/frontend/components/ui/Input";
import type { GitHubProfileResult } from "@/lib/github";

function GitHubOnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    githubResult: GitHubProfileResult;
    seededCount: number;
  } | null>(null);

  async function submit() {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not analyze GitHub profile");
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 space-y-4">
          <h1 className="text-xl font-semibold">GitHub Profile Analyzed</h1>
          <p className="text-sm text-foreground/85">
            Analyzed <strong>{result.githubResult.repoCount}</strong> repositories for @{result.githubResult.username}.
          </p>

          <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs space-y-2">
            <span className="font-semibold text-accent">Discovered Skills & Languages:</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.githubResult.discoveredSkills.map((s) => (
                <span
                  key={s.skillId}
                  className="rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                >
                  {s.skillName}
                </span>
              ))}
            </div>
          </div>

          {result.seededCount > 0 ? (
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Credited {result.seededCount} new skill{result.seededCount === 1 ? "" : "s"} to your knowledge baseline.
            </p>
          ) : (
            <p className="text-xs text-muted">
              All detected skills were already calibrated with your prior profile.
            </p>
          )}

          <Button className="w-full mt-2" onClick={() => router.push(next)}>
            Continue to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="mb-1 text-xl font-semibold">Connect Public GitHub Profile</h1>
          <p className="text-sm text-muted">
            Enter your GitHub handle to automatically extract and verify your public code repositories, languages, and technical stacks (no login/OAuth required).
          </p>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="space-y-2">
          <Label>GitHub Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. torvalds or octocat"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push(next)}
          >
            Skip
          </Button>
          <Button
            className="flex-1"
            disabled={!username.trim() || loading}
            onClick={submit}
          >
            {loading ? "Analyzing..." : "Analyze Profile"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function GitHubOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading...</div>}>
      <GitHubOnboardingInner />
    </Suspense>
  );
}
