import { Suspense } from "react";
import { QuestLearnAuth } from "@/frontend/components/auth/QuestLearnAuth";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070913]" />}>
      <QuestLearnAuth initialMode="signup" />
    </Suspense>
  );
}
