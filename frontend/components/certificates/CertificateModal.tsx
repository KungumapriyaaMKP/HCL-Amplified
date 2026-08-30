"use client";

import React, { useState } from "react";
import { CertificateView, CertificateData } from "./CertificateView";
import { IconPrinter, IconShare, IconX, IconCheck, IconAward } from "@tabler/icons-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
}

export function CertificateModal({ isOpen, onClose, data }: CertificateModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container Card with Sharp Borders */}
      <div className="relative w-full max-w-5xl bg-white border-2 border-purple-500/40 shadow-2xl p-4 sm:p-8 space-y-6 my-auto print:border-none print:shadow-none print:p-0 rounded-none">
        
        {/* Top Controls Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-slate-900">
            <IconAward className="w-6 h-6 text-[#7C3AED]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              {data.type === "grand" ? "Grand Domain Mastery Certificate" : "Milestone Mastery Certificate"}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 cursor-pointer rounded-none"
            >
              <IconPrinter className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer rounded-none"
            >
              {copied ? <IconCheck className="w-4 h-4 text-emerald-600" /> : <IconShare className="w-4 h-4" />}
              <span>{copied ? "Copied Link!" : "Share"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer rounded-none"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Authentic Certificate Canvas */}
        <div className="overflow-x-auto py-2">
          <CertificateView data={data} />
        </div>

        {/* Bottom Helper Notice */}
        <div className="text-center text-[11px] text-slate-400 font-sans print:hidden">
          🔒 Cryptographically verifiable credential issued by QuestLearn AI Academic Board. Click &apos;Print / Download PDF&apos; to save a high-res certified copy.
        </div>

      </div>
    </div>
  );
}
