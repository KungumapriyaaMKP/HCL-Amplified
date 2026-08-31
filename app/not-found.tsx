import React from "react";
import Link from "next/link";
import { IconCompass, IconArrowLeft } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-xs p-8 shadow-md text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED]">
          <IconCompass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">404 - Quest Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The learning module, guild discussion, or benchmark you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-98 transition-all"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
