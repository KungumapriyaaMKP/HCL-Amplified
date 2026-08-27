"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Check } from "lucide-react";
import { updateOnboardingStatus } from "@/lib/onboardingDraft";

const STEPS = [
  { id: 1, label: "History", href: "/onboarding/history" },
  { id: 2, label: "Discovery", href: "/onboarding/discovery" },
  { id: 3, label: "Role Track", href: "/onboarding/role" },
  { id: 4, label: "Diagnostic", href: "/onboarding/diagnostic" },
  { id: 5, label: "Curriculum", href: "/onboarding/complete" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveStep = () => {
    if (pathname.includes("/history")) return 1;
    if (pathname.includes("/discovery")) return 2;
    if (pathname.includes("/role")) return 3;
    if (pathname.includes("/diagnostic")) return 4;
    if (pathname.includes("/complete")) return 5;
    return 1;
  };

  const currentStep = getActiveStep();

  const handleSkipSetup = async () => {
    await updateOnboardingStatus("completed");
    router.push("/roadmap");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Onboarding Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-base font-extrabold tracking-tight text-ink flex items-center gap-1.5 shrink-0"
          >
            <Compass className="w-5 h-5" />
            <span>PATHFINDER</span>
          </Link>

          {/* Slim Step Indicator (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-2">
              Step {currentStep} of 5
            </span>
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => {
                const isPassed = s.id < currentStep;
                const isCurrent = s.id === currentStep;
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-1.5"
                  >
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-ink text-canvas font-semibold shadow-2xs"
                          : isPassed
                          ? "bg-surface text-ink border border-border"
                          : "text-muted/60 bg-surface/30"
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span>{s.id}</span>
                      )}
                      <span>{s.label}</span>
                    </div>
                    {s.id < STEPS.length && (
                      <div
                        className={`w-3 h-0.5 rounded-full ${
                          isPassed ? "bg-ink/60" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skip Affordance */}
          <div className="flex items-center gap-3">
            <div className="sm:hidden text-xs font-semibold text-muted">
              Step {currentStep} of 5
            </div>
            <button
              onClick={handleSkipSetup}
              type="button"
              className="text-xs font-medium text-muted hover:text-ink transition-colors px-2 py-1 rounded-md hover:bg-surface cursor-pointer"
              title="Skip onboarding and explore app directly"
            >
              Skip setup →
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="h-0.5 w-full bg-border">
          <div
            className="h-full bg-ink transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
