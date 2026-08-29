import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import { Button, LinkButton } from "@/frontend/components/ui/Button";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import {
  IconFileText,
  IconScan,
  IconBrandGithub,
  IconCheck,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";

export default async function OnboardingHubPage() {
  let profile = null;
  try {
    const user = await requireUser();
    const [p] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    profile = p;
  } catch (_e) {
    // Unauthenticated preview fallback
  }

  const hasResume = Boolean(profile?.resumeProfile || profile?.resumeText);
  const hasFace = Boolean(profile?.faceDescriptor);
  const hasGithub = Boolean(
    profile?.resumeProfile &&
      typeof profile.resumeProfile === "object" &&
      "githubProfile" in (profile.resumeProfile as Record<string, unknown>)
  );

  const completedCount = (hasResume ? 1 : 0) + (hasFace ? 1 : 0) + (hasGithub ? 1 : 0);
  const progressPct = Math.round((completedCount / 3) * 100);

  const steps = [
    {
      id: "resume",
      title: "1. Resume & Career Background",
      desc: "Upload a PDF or paste text to extract experience and auto-calibrate baseline skill proficiencies.",
      href: "/onboarding/resume?next=/onboarding",
      completed: hasResume,
      icon: IconFileText,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "face",
      title: "2. Biometric Face Verification",
      desc: "Register a secure client-side facial descriptor to enable seamless proctoring for certified milestone exams.",
      href: "/onboarding/face?next=/onboarding",
      completed: hasFace,
      icon: IconScan,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "github",
      title: "3. GitHub Skills Discovery",
      desc: "Link your public GitHub handle to verify languages and automatically credit mastered technical tools.",
      href: "/onboarding/github?next=/onboarding",
      completed: hasGithub,
      icon: IconBrandGithub,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FD] px-4 py-12 text-slate-900">
      <Card className="w-full max-w-2xl border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600">
            <IconSparkles className="h-4 w-4" />
            <span>Learner Setup & Calibration</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {completedCount} of 3 completed
          </span>
        </div>

        <h1 className="mb-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Personalize Your Learning Experience
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Complete these quick onboarding steps so our recommendation engine and AI tutors can tailor every roadmapped module and practice session to your background.
        </p>

        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Onboarding Progress</span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} />
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 sm:p-5 transition-all ${
                  step.completed
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${step.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                      {step.completed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <IconCheck className="h-3 w-3" />
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{step.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 sm:self-center">
                  <Link
                    href={step.href}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      step.completed
                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        : "bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
                    }`}
                  >
                    <span>{step.completed ? "Update" : "Start"}</span>
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            You can always revisit these calibration tools from your Profile page.
          </p>
          <LinkButton
            href="/dashboard"
            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800"
          >
            {completedCount === 3 ? "Go to Dashboard" : "Skip to Dashboard →"}
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
