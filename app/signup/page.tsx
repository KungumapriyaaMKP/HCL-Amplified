import { Suspense } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { AuthForm } from "@/frontend/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8">
        <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
        <p className="mb-6 text-sm text-muted">
          We&apos;ll use this to personalize every recommendation.
        </p>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </Card>
    </div>
  );
}
