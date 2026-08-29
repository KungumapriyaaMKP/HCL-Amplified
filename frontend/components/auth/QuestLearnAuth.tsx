"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  IconArrowRight,
  IconDeviceGamepad2,
  IconPlayerPlay,
} from "@tabler/icons-react";

export function QuestLearnAuth({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("questlearn_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (rememberMe && email) {
        localStorage.setItem("questlearn_email", email);
      } else {
        localStorage.removeItem("questlearn_email");
      }

      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName: displayName || email.split("@")[0] }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Could not create account");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const next = searchParams?.get("next") || "/dashboard";
      if (mode === "signup") {
        const afterFace = `/onboarding/resume?next=${encodeURIComponent(next)}`;
        router.push(`/onboarding/face?next=${encodeURIComponent(afterFace)}`);
      } else {
        router.push(next);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#070913] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Background artwork and atmospheric glows */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity filter blur-[1px]"
        style={{ backgroundImage: "url('/quest-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#090d20]/80 to-[#070913]/90" />
      
      {/* Ambient glowing radial orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 left-10 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-[600px] w-[600px] rounded-full bg-fuchsia-600/20 blur-[150px]" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-between p-4 sm:p-6 lg:p-8">
        
        {/* TOP BAR */}
        <header className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-11 w-11 items-center justify-center rounded-none bg-gradient-to-br from-purple-600 to-indigo-700 shadow-[0_0_15px_rgba(147,51,234,0.6)] border border-purple-400/40">
              <IconDeviceGamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-wider text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                Quest<span className="text-purple-400">Learn</span>
              </div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-purple-300/70 uppercase">
                LEVEL UP YOUR FUTURE
              </div>
            </div>
          </Link>

          {/* Top Right Mode Switch Button */}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="group flex items-center gap-2 rounded-none border border-purple-500/50 bg-[#121128]/80 px-5 py-2 text-xs font-semibold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-md transition-all hover:border-purple-400 hover:bg-purple-950/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-95"
          >
            <span className="text-purple-400/80 uppercase tracking-wider text-[10px]">
              {mode === "login" ? "NEW HERE?" : "HAVE AN ACCOUNT?"}
            </span>
            <span className="font-bold text-white group-hover:text-purple-300">
              {mode === "login" ? "JOIN ADVENTURE" : "CONTINUE QUEST"}
            </span>
            <IconArrowRight className="h-3.5 w-3.5 text-purple-400 transition-transform group-hover:translate-x-1" />
          </button>
        </header>

        {/* CENTER MAIN GRID */}
        <main className="my-auto grid grid-cols-1 items-center gap-10 py-8 lg:grid-cols-12 lg:gap-12">
          
          {/* LEFT HERO AREA: Title, Character & Portal (6 cols) */}
          <div className="flex flex-col items-center justify-center text-center lg:col-span-6 lg:items-start lg:text-left">
            
            {/* Header Titles */}
            <div className="mb-4">
              <div className="text-base sm:text-lg font-black tracking-widest text-purple-300/90 uppercase drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)]">
                READY TO
              </div>
              <h1 className="mt-1 text-4xl font-black sm:text-5xl lg:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-500 drop-shadow-[0_4px_25px_rgba(168,85,247,0.8)] filter">
                LEVEL UP?
              </h1>
              <p className="mt-3 text-xs sm:text-sm font-medium text-purple-200/80 max-w-md">
                Your personalized curriculum is waiting. Master engineering skills with AI-guided learning, interactive coding challenges, and adaptive assessments.
              </p>
            </div>

            {/* Character Graphic / Interactive Portal Visual */}
            <div className="relative my-4 flex h-52 sm:h-64 w-full items-center justify-center lg:justify-start">
              <div className="relative flex h-52 w-52 sm:h-60 sm:w-60 items-center justify-center">
                <div className="absolute h-48 w-48 border border-purple-500/40 bg-purple-600/10 blur-sm shadow-[0_0_40px_rgba(147,51,234,0.4)] animate-pulse" />
                <div className="absolute h-40 w-40 border-2 border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: "25s" }} />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-none bg-gradient-to-tr from-purple-900 via-indigo-900 to-fuchsia-900 p-1 shadow-[0_0_35px_rgba(168,85,247,0.7)] ring-2 ring-purple-400/50">
                    <div className="flex h-full w-full items-center justify-center rounded-none bg-[#0d0f24] overflow-hidden relative">
                      <img 
                        src="/quest-bg.jpg" 
                        alt="Hero Portal" 
                        className="absolute inset-0 h-full w-full object-cover object-center transform scale-125 hover:scale-150 transition-transform duration-500" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* "ENTER THE GAME" Action Button */}
            <Link
              href="/dashboard"
              className="group relative mt-2 inline-flex items-center gap-3 overflow-hidden rounded-none border-2 border-purple-400/80 bg-gradient-to-r from-purple-700 via-indigo-600 to-fuchsia-600 px-8 py-3.5 text-sm font-black tracking-wider text-white uppercase shadow-[0_0_30px_rgba(147,51,234,0.8),inset_0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(168,85,247,1)] active:scale-95"
            >
              <span className="relative z-10">ENTER PLATFORM</span>
              <IconPlayerPlay className="relative z-10 h-4 w-4 fill-current transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Link>

            <div className="mt-4 text-xs font-semibold text-purple-300/70">
              Mastery-based adaptive learning engine.
            </div>

          </div>

          {/* RIGHT COLUMN: Glassmorphic Auth Card (6 cols) */}
          <div className="w-full max-w-md mx-auto lg:col-span-6 lg:max-w-lg">
            <div className="relative rounded-none border-2 border-purple-500/40 bg-[#0c1026]/95 p-6 sm:p-8 shadow-[0_0_40px_rgba(139,92,246,0.35),inset_0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-2xl">
              
              {/* Precision Sharp 90-Degree Cyber HUD Corner Accents */}
              <div className="pointer-events-none absolute -top-2 -right-2 h-7 w-7 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_14px_#22d3ee]" />
              <div className="pointer-events-none absolute -bottom-2 -left-2 h-7 w-7 border-b-2 border-l-2 border-purple-400 shadow-[0_0_14px_#a855f7]" />
              <div className="pointer-events-none absolute -top-2 -left-2 h-7 w-7 border-t-2 border-l-2 border-purple-400/60 shadow-[0_0_10px_#a855f7]" />
              <div className="pointer-events-none absolute -bottom-2 -right-2 h-7 w-7 border-b-2 border-r-2 border-cyan-400/60 shadow-[0_0_10px_#22d3ee]" />

              <div className="mb-6">
                <div className="text-[11px] font-extrabold tracking-[0.2em] text-purple-300/80 uppercase">
                  {mode === "login" ? "WELCOME BACK," : "CREATE YOUR ACCOUNT,"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 drop-shadow-[0_2px_12px_rgba(217,70,239,0.5)]">
                    LEARNER
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {mode === "login"
                    ? "Log in to continue your path"
                    : "Begin your personalized learning roadmap"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === "signup" && (
                  <div>
                    <div className="relative flex items-center">
                      <div className="pointer-events-none absolute left-3.5 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Display Name"
                        className="w-full rounded-none border border-purple-500/30 bg-[#080a1a]/90 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 shadow-inner focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Username Input */}
                <div>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full rounded-none border border-purple-500/30 bg-[#080a1a]/90 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 shadow-inner focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-none border border-purple-500/30 bg-[#080a1a]/90 py-3 pl-10 pr-10 text-xs text-white placeholder-slate-500 shadow-inner focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-purple-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-none border-purple-500/40 bg-purple-950 text-purple-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset link will be sent to your registered email.")}
                    className="text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="rounded-none border border-red-500/40 bg-red-950/80 p-2.5 text-center text-xs font-semibold text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    {error}
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-none border border-fuchsia-400/50 bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#7c3aed] py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-[0_0_25px_rgba(217,70,239,0.6)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_35px_rgba(217,70,239,0.9)] active:scale-98 disabled:opacity-50"
                >
                  <span>{loading ? "AUTHENTICATING..." : mode === "signup" ? "CREATE ACCOUNT" : "START LEARNING"}</span>
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>

              </form>

              {/* Social Login Section */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-purple-500/20" />
                  <span className="absolute bg-[#0c1026] px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                    OR
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Sign in with Google"
                    onClick={() => alert("Google OAuth integration: Please configure in Supabase dashboard settings.")}
                    className="flex h-11 w-11 items-center justify-center rounded-none bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform hover:scale-110 active:scale-95"
                    title="Sign in with Google"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    aria-label="Sign in with Discord"
                    onClick={() => alert("Discord OAuth integration: Please configure in Supabase dashboard settings.")}
                    className="flex h-11 w-11 items-center justify-center rounded-none bg-[#5865F2] shadow-[0_0_15px_rgba(88,101,242,0.5)] transition-transform hover:scale-110 active:scale-95"
                    title="Sign in with Discord"
                  >
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </main>

      </div>
    </div>
  );
}
