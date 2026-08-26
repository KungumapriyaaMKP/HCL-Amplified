"use client";

import { useState } from "react";
import { profileGithub, Mastery } from "@/lib/api/pathfinder";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";

interface GitHubProfilerProps {
  onSkillsExtracted: (skills: Record<string, number>) => void;
}

export function GitHubProfiler({ onSkillsExtracted }: GitHubProfilerProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedList, setExtractedList] = useState<Mastery[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await profileGithub(username.trim());
      setExtractedList(res.skills);

      const knownDict: Record<string, number> = {};
      for (const m of res.skills) {
        knownDict[m.skill_id] = m.level;
      }
      onSkillsExtracted(knownDict);

      if (res.skills.length === 0) {
        setError("No public technical repositories found or rate limit reached.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to analyze GitHub profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleProfile} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-muted text-xs font-mono">@</span>
          <input
            type="text"
            placeholder="GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink/50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="bg-ink text-canvas font-medium text-xs px-3.5 py-2 rounded-lg hover:bg-ink/90 disabled:opacity-50 transition-opacity whitespace-nowrap cursor-pointer"
        >
          {isLoading ? "Profiling..." : "Scan Stack"}
        </button>
      </form>

      {error && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
          {error}
        </p>
      )}

      {extractedList.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Stack Signals ({extractedList.length})</span>
            <span className="text-emerald-600 font-medium">Public Repos Analyzed</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {extractedList.map((m) => (
              <Card key={m.skill_id} className="p-2.5 bg-canvas text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink capitalize">
                    {m.skill_id.replace(/-/g, " ")}
                  </span>
                  <Pill variant="active">
                    {Math.round(m.level * 100)}% verified
                  </Pill>
                </div>
                {m.evidence?.[0]?.quote && (
                  <p className="text-[11px] text-muted">
                    {m.evidence[0].quote}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
