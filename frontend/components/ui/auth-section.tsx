"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface AuthSectionProps {
  title: string;
  subtitle: string;
  formFields: Array<{
    label: string;
    type?: string;
    placeholder?: string;
  }>;
  buttonText: string;
  termsText?: ReactNode;
  onSubmit?: (formData: Record<string, string>) => void;
  actionText?: string;
  actionLink?: string;
  actionLabel?: string;
}

export default function AuthSection({
  title,
  subtitle,
  formFields,
  buttonText,
  termsText,
  onSubmit,
  actionText,
  actionLink,
  actionLabel,
}: AuthSectionProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    formFields.reduce((acc, field) => ({ ...acc, [field.label]: "" }), {})
  );

  const handleInputChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 text-white antialiased [font-synthesis:none]">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[1fr] items-center justify-center">
        <div className="flex min-h-auto items-start justify-center rounded-2xl px-6 py-12 sm:px-10 lg:px-14 lg:py-0">
          <div className="mx-auto w-full max-w-[500px]">
            <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl text-white">
                {title}
              </h1>
              <p className="mt-3 text-lg leading-snug text-white/60 sm:text-xl">
                {subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {formFields.slice(0, 2).map((field) => (
                  <FieldBox
                    key={field.label}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.label]}
                    onChange={(value) => handleInputChange(field.label, value)}
                  />
                ))}
              </div>

              {formFields.slice(2).map((field) => (
                <FieldBox
                  key={field.label}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.label]}
                  onChange={(value) => handleInputChange(field.label, value)}
                />
              ))}

              {termsText && (
                <div className="space-y-4 pt-4 text-sm leading-5 text-white/50 sm:text-[15px]">
                  <CheckboxLine>{termsText}</CheckboxLine>
                </div>
              )}

              <button
                type="submit"
                className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/50 hover:from-blue-500 hover:to-blue-400 active:scale-95"
              >
                {buttonText}
              </button>

              {actionText && actionLink && (
                <p className="text-center text-white/70 text-sm pt-4">
                  {actionText}{" "}
                  <a
                    href={actionLink}
                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                  >
                    {actionLabel}
                  </a>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldBox({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.trim().length > 0;

  return (
    <div className="relative w-full">
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        isFocused || hasValue
          ? "top-2 text-xs text-blue-400"
          : "top-1/2 -translate-y-1/2 text-sm text-white/60"
      }`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        aria-label={label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full h-12 px-4 pt-5 pb-2 rounded-lg bg-white/10 border border-white/20 text-white text-base outline-none transition-all duration-200 hover:border-white/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 hover:bg-white/15"
      />
    </div>
  );
}

function CheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-3">
      <span className="relative mt-1 size-3.5 shrink-0">
        <input
          type="checkbox"
          className="peer size-full appearance-none rounded-[2px] border border-black/25 bg-white checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}
