import { Suspense } from "react";
import { QuestLearnAuth } from "@/frontend/components/auth/QuestLearnAuth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070913]" />}>
      <QuestLearnAuth initialMode="login" />
    </Suspense>
  );
}
