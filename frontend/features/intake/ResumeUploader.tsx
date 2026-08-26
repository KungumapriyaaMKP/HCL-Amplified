"use client";

import { useState, useRef } from "react";
import { FileText } from "lucide-react";
import { uploadResume, Mastery } from "@/lib/api/pathfinder";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";

interface ResumeUploaderProps {
  onSkillsExtracted: (skills: Record<string, number>) => void;
}

export function ResumeUploader({ onSkillsExtracted }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedList, setExtractedList] = useState<Mastery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const res = await uploadResume(file);
      setExtractedList(res.skills);

      const knownDict: Record<string, number> = {};
      for (const m of res.skills) {
        knownDict[m.skill_id] = m.level;
      }
      onSkillsExtracted(knownDict);
    } catch (err: any) {
      setError(err?.message || "Failed to parse resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isUploading
            ? "border-accent bg-accent/5"
            : "border-border hover:border-ink/40 bg-surface/50 hover:bg-surface"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        <div className="flex justify-center mb-1.5">
          <FileText className="w-8 h-8 text-muted" />
        </div>
        <p className="text-sm font-medium text-ink">
          {isUploading ? "Extracting verified skills..." : "Drop your resume (PDF or DOCX)"}
        </p>
        <p className="text-xs text-muted mt-0.5">
          Extracts technical skills with verbatim evidence quotes
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-md">
          {error}
        </p>
      )}

      {extractedList.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Verified Skills ({extractedList.length})</span>
            <span className="text-emerald-600 font-medium">Mapped to DAG</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {extractedList.map((m) => (
              <Card key={m.skill_id} className="p-2.5 bg-canvas text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink capitalize">
                    {m.skill_id.replace(/-/g, " ")}
                  </span>
                  <Pill variant="mastered">
                    {Math.round(m.level * 100)}% mastery
                  </Pill>
                </div>
                {m.evidence?.[0]?.quote && (
                  <p className="text-[11px] text-muted italic line-clamp-2">
                    &ldquo;{m.evidence[0].quote}&rdquo;
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
