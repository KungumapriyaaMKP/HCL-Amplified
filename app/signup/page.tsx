import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestLearnAuth } from "@/frontend/components/auth/QuestLearnAuth";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join QuestLearn to build your AI-recommended mastery curriculum, take diagnostic evaluations, and earn verifiable certificates.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070913]" />}>
      <QuestLearnAuth initialMode="signup" />
    </Suspense>
  );
}
