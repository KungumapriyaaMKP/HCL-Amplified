import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestLearnAuth } from "@/frontend/components/auth/QuestLearnAuth";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to QuestLearn to access your personalized adaptive learning roadmaps and hands-on coding labs.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070913]" />}>
      <QuestLearnAuth initialMode="login" />
    </Suspense>
  );
}
