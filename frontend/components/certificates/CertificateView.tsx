"use client";

import React, { forwardRef } from "react";
import { QuestLearnBrandIcon } from "@/frontend/components/dashboard/Illustrations";
import { IconShieldCheck } from "@tabler/icons-react";

export interface CertificateData {
  type: "milestone" | "grand";
  recipientName: string;
  title: string;
  domainName?: string;
  issueDate?: string;
  credentialId?: string;
  score?: number | null;
  skillsMastered?: string[];
}

export const CertificateView = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificateView({ data }, ref) {
    const isGrand = data.type === "grand";
    const formattedDate =
      data.issueDate ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    const credId =
      data.credentialId ||
      `QL-${isGrand ? "GRAND" : "MILE"}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

    // Format recipient name with nice title-casing if provided in lowercase
    const formattedName = (data.recipientName || "Learner")
      .split(" ")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");

    return (
      <div
        ref={ref}
        className="certificate-print-container w-full max-w-[940px] mx-auto bg-white text-slate-900 shadow-2xl relative overflow-hidden select-none border-8 border-[#1E1B4B] p-5 sm:p-7 font-serif box-border"
      >
        {/* Outer Golden Guilloche & Ornamental Frame */}
        <div className="border-2 border-[#D97706] p-4 sm:p-5 relative bg-gradient-to-b from-[#FFFDF7] via-[#FFFFFF] to-[#FFFBEB] overflow-hidden">
          
          {/* Corner Decorative Ornaments */}
          <div className="absolute top-2 left-2 text-[#D97706] text-xl font-sans select-none leading-none">❖</div>
          <div className="absolute top-2 right-2 text-[#D97706] text-xl font-sans select-none leading-none">❖</div>
          <div className="absolute bottom-2 left-2 text-[#D97706] text-xl font-sans select-none leading-none">❖</div>
          <div className="absolute bottom-2 right-2 text-[#D97706] text-xl font-sans select-none leading-none">❖</div>

          {/* Ambient Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <QuestLearnBrandIcon className="w-80 h-80" />
          </div>

          {/* Inner Content Stack */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4">
            
            {/* Header Institution */}
            <div className="flex items-center gap-3">
              <QuestLearnBrandIcon className="w-9 h-9 shrink-0" />
              <div className="text-left">
                <div className="text-sm sm:text-base font-black tracking-widest text-[#1E1B4B] uppercase font-sans">
                  QuestLearn Academy
                </div>
                <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#7C3AED] uppercase font-sans">
                  Advanced AI Adaptive Learning &amp; Certification
                </div>
              </div>
            </div>

            {/* Certificate Main Title */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.28em] uppercase text-amber-700 font-sans">
                {isGrand ? "OFFICIAL PROFESSIONAL CREDENTIAL" : "OFFICIAL MILESTONE MASTERY CREDENTIAL"}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E1B4B] tracking-tight font-serif uppercase drop-shadow-xs leading-tight">
                {isGrand ? "Grand Certificate of Domain Mastery" : "Certificate of Milestone Mastery"}
              </h1>
              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#D97706] to-transparent mx-auto mt-1.5" />
            </div>

            {/* Subheading */}
            <p className="text-xs italic text-slate-600 font-serif">
              This is proudly and officially conferred upon
            </p>

            {/* Recipient Name in Regal Calligraphy Typography */}
            <div className="py-0.5">
              <div className="text-2xl sm:text-4xl lg:text-[42px] font-black text-[#6D28D9] tracking-normal font-serif border-b-2 border-[#D97706]/50 pb-1 px-8 inline-block drop-shadow-sm">
                {formattedName}
              </div>
            </div>

            {/* Achievement Description */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif">
              {isGrand ? (
                <>
                  for successfully completing the full curriculum, hands-on programming labs, and certified comprehensive domain mastery in{" "}
                  <strong className="text-[#1E1B4B] font-bold underline decoration-[#D97706]">{data.title}</strong>
                  {data.domainName ? ` (${data.domainName})` : ""}.
                </>
              ) : (
                <>
                  for successfully completing all curriculum modules, live coding lab benchmarks, and achieving mastery in{" "}
                  <strong className="text-[#1E1B4B] font-bold underline decoration-[#D97706]">{data.title}</strong>
                  {data.domainName ? ` under the ${data.domainName} pathway` : ""}
                  {data.score ? ` with a proctored assessment score of ${data.score}%` : ""}.
                </>
              )}
            </p>

            {/* Skills Badges */}
            {data.skillsMastered && data.skillsMastered.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-0.5 max-w-xl">
                {data.skillsMastered.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold font-sans rounded-none shadow-2xs"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Row: Date, Gold Medal Seal, Signatures, Verification */}
            <div className="w-full pt-4 sm:pt-6 border-t border-amber-200/80 grid grid-cols-3 items-end font-sans text-left gap-4">
              
              {/* Left: Issue Date & Verification ID */}
              <div className="space-y-0.5 text-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date of Issue
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 font-serif">
                  {formattedDate}
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                  ID: <span className="text-purple-800 font-bold">{credId}</span>
                </div>
              </div>

              {/* Center: 3D Gold Ribbon Medal Seal */}
              <div className="flex flex-col items-center justify-center text-center -mb-1">
                <div className="relative flex items-center justify-center">
                  {/* Ribbon tails */}
                  <div className="absolute -bottom-3 w-5 h-8 bg-[#B45309] -rotate-12 transform origin-top shadow-md" />
                  <div className="absolute -bottom-3 w-5 h-8 bg-[#D97706] rotate-12 transform origin-top shadow-md" />
                  
                  {/* Circular Gold Seal Body */}
                  <div className="relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#92400E] via-[#F59E0B] to-[#FEF3C7] p-0.5 shadow-xl flex items-center justify-center border-2 border-white ring-4 ring-[#D97706]/40">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#78350F] flex flex-col items-center justify-center bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-white p-1 text-center">
                      <IconShieldCheck className="w-5 h-5 text-white drop-shadow-md" />
                      <span className="text-[7px] font-black uppercase tracking-wider font-sans leading-tight mt-0.5">
                        Verified
                      </span>
                      <span className="text-[6px] font-extrabold uppercase text-amber-100 font-sans leading-none">
                        Mastery
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Academic Director Signature */}
              <div className="space-y-0.5 text-right text-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Academic Authority
                </div>
                <div className="text-sm sm:text-base font-serif italic text-purple-900 font-bold leading-tight">
                  Dr. Elena Vance
                </div>
                <div className="text-[10px] text-slate-500 font-sans border-t border-slate-300 pt-0.5 inline-block">
                  QuestLearn Certification Board
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    );
  }
);
