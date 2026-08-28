import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`h-11 w-full rounded-md border border-purple-500/30 bg-[#080a1a]/90 px-3.5 text-sm text-white placeholder:text-slate-500 shadow-inner transition-all focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 ${className}`}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full rounded-md border border-purple-500/30 bg-[#080a1a]/90 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 shadow-inner transition-all focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-purple-300/80">{children}</label>;
}
