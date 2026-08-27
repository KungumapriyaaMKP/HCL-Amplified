"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState } from "react";

interface AuthSectionOneProps {
  title: string;
  subtitle: string;
  formFields: Array<{
    label: string;
    type?: string;
  }>;
  buttonText: string;
  linkText: string;
  linkHref: string;
  linkLabel: string;
  authType: "login" | "signup";
}

export default function AuthSectionOne({
  title,
  subtitle,
  formFields,
  buttonText,
  linkText,
  linkHref,
  linkLabel,
  authType,
}: AuthSectionOneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data: Record<string, string> = {};

      formFields.forEach(field => {
        const value = formData.get(field.label);
        if (value) {
          data[field.label.toLowerCase().replace(/\s+/g, '')] = value as string;
        }
      });

      const endpoint = authType === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = authType === "login"
        ? { email: data.email, password: data.password }
        : { email: data.email, password: data.password, displayName: data.displayname };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      // Success - redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };
  return (
    <section className="min-h-screen bg-white p-3 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="flex min-h-[760px] items-start rounded-md border border-black/20 bg-white px-6 py-12 sm:px-10 dark:border-white/10 dark:bg-[#0a0a0a] lg:min-h-0 lg:px-14 lg:py-28 xl:px-20">
          <div className="mx-auto w-full max-w-[590px]">
            <div>
              <h1 className="whitespace-nowrap text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px]">
                {title}
              </h1>
              <p className="mt-3 whitespace-nowrap text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl lg:text-2xl xl:text-3xl">
                {subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-12">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {formFields.slice(0, Math.ceil(formFields.length / 2)).map((field) => (
                  <FieldBox
                    key={field.label}
                    label={field.label}
                    type={field.type}
                  />
                ))}
              </div>

              {formFields.length > 2 && (
                <div className="grid gap-5">
                  {formFields.slice(Math.ceil(formFields.length / 2)).map((field) => (
                    <FieldBox
                      key={field.label}
                      label={field.label}
                      type={field.type}
                    />
                  ))}
                </div>
              )}

              {formFields.length <= 2 && (
                formFields.slice(1).map((field) => (
                  <FieldBox
                    key={field.label}
                    label={field.label}
                    type={field.type}
                  />
                ))
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-9 flex h-12 w-full items-center justify-center rounded-[10px] border border-black/40 bg-black text-xl font-medium text-white transition-colors hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/85 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : buttonText}
              </button>

              <p className="text-center text-black/60 dark:text-white/60 text-sm pt-4">
                {linkText}{" "}
                <a
                  href={linkHref}
                  className="font-semibold text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 underline underline-offset-2"
                >
                  {linkLabel}
                </a>
              </p>
            </form>
          </div>
        </div>

        <div className="relative flex min-h-[720px] overflow-hidden rounded-md bg-black p-8 text-white sm:p-12 lg:min-h-0">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#FC7819", "#FC7819", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-black"
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-center items-center text-center">
            <h2 className="max-w-[620px] text-5xl font-medium tracking-[-0.05em] text-white sm:text-6xl lg:text-[64px] lg:leading-[0.98] xl:text-[70px]">
              Think fast,
              <br />
              Build faster
            </h2>
            <p className="mt-6 max-w-[500px] text-lg text-white/80">
              Master AI, machine learning, and cutting-edge technologies with personalized learning paths
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldBox({
  label,
  type = "text",
}: {
  label: string;
  type?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = inputValue.trim().length > 0;

  return (
    <div className="relative w-full">
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        isFocused || hasValue
          ? "top-2 text-xs text-gray-600 dark:text-white/60"
          : "top-1/2 -translate-y-1/2 text-sm text-gray-600 dark:text-white/60"
      }`}>
        {label}
      </label>
      <input
        type={type}
        name={label}
        value={inputValue}
        aria-label={label}
        required
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) => setInputValue(event.target.value)}
        className="w-full h-14 px-4 pt-5 pb-2 rounded-[10px] bg-gray-800 dark:bg-white/10 border border-gray-700 dark:border-white/20 text-white dark:text-white text-lg outline-none transition-all duration-200 hover:border-gray-600 dark:hover:border-white/30 focus:border-gray-500 dark:focus:border-white/40 focus:ring-1 focus:ring-gray-600 dark:focus:ring-white/20 hover:bg-gray-700 dark:hover:bg-white/15 placeholder:text-gray-500 dark:placeholder:text-white/40"
      />
    </div>
  );
}

