"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { createClient, hasSupabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!hasSupabase()) {
        // Guest mode fallback
        router.push(redirectedFrom);
        return;
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push(redirectedFrom);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
          Welcome Back
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Sign In to Pathfinder
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Access your personalized learning paths and tracked mastery.
        </p>
      </div>

      <Card className="mt-8 p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-gap/30 bg-gap-bg p-3 text-sm text-gap">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-full border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-border-hover"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-2 w-full rounded-full border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-border-hover"
            />
          </div>

          <div className="pt-2">
            <Pill
              type="submit"
              variant="solid"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Pill>
          </div>
        </form>
      </Card>

      <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm text-ink-muted">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${redirectedFrom !== "/" ? `?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : ""}`}
            className="font-medium text-ink underline hover:text-ink-muted"
          >
            Create one
          </Link>
        </p>
        <Link
          href="/"
          className="text-xs text-ink-subtle hover:text-ink-muted"
        >
          ← Back to home (Explore as Guest)
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
