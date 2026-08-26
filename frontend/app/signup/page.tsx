"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { updateProfile } from "@/lib/api/pathfinder";
import { createClient, hasSupabase } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    const name = displayName.trim() || email.split("@")[0] || "Learner";

    try {
      if (!hasSupabase()) {
        // Guest mode fallback
        router.push(redirectedFrom);
        return;
      }

      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // If user was created or session is active, sync profile with backend
      if (data?.user) {
        try {
          await updateProfile(name);
        } catch {
          // Backend profile upsert will also occur automatically upon first authenticated request
        }
      }

      router.push(redirectedFrom);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during signup.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
          Get Started
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Persist your career roadmap and track verifiable skill mastery.
        </p>
      </div>

      <Card className="mt-8 p-8">
        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-gap/30 bg-gap-bg p-3 text-sm text-gap">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Turing"
              className="mt-2 w-full rounded-full border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-border-hover"
            />
          </div>

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
              Password (min 6 characters)
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
              {loading ? "Creating account…" : "Create Account"}
            </Pill>
          </div>
        </form>
      </Card>

      <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm text-ink-muted">
        <p>
          Already have an account?{" "}
          <Link
            href={`/login${redirectedFrom !== "/" ? `?redirectedFrom=${encodeURIComponent(redirectedFrom)}` : ""}`}
            className="font-medium text-ink underline hover:text-ink-muted"
          >
            Sign in
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignupForm />
    </Suspense>
  );
}
