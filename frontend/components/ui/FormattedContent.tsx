"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";

interface FormattedContentProps {
  text?: string | null;
  className?: string;
}

function normalizeMathDelimiters(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\\\(/g, () => "$")
    .replace(/\\\)/g, () => "$")
    .replace(/\\\[/g, () => "$$")
    .replace(/\\\]/g, () => "$$");
}

function PreBlock({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    const text = preRef.current?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-[11px] font-medium transition-all opacity-80 hover:opacity-100 inline-flex items-center gap-1 cursor-pointer z-10"
        title="Copy code"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>
      <pre
        ref={preRef}
        className="bg-zinc-950 text-zinc-100 rounded-xl p-3 overflow-x-auto text-[12px] font-mono leading-relaxed"
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

export function FormattedContent({ text, className }: FormattedContentProps) {
  if (!text) return null;

  const normalized = normalizeMathDelimiters(text);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          pre: PreBlock,
          code({ className: codeClassName, children, ...props }) {
            const isInline = !codeClassName && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-surface font-mono text-xs text-ink"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                {...props}
              >
                {children}
              </a>
            );
          },
          p({ children, ...props }) {
            return <p className="mb-2 last:mb-0" {...props}>{children}</p>;
          },
          ul({ children, ...props }) {
            return <ul className="list-disc list-inside my-1 space-y-0.5" {...props}>{children}</ul>;
          },
          ol({ children, ...props }) {
            return <ol className="list-decimal list-inside my-1 space-y-0.5" {...props}>{children}</ol>;
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
