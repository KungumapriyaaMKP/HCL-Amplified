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
  const [printing, setPrinting] = useState(false);

  if (!isOpen) return null;

  function handlePrint() {
    setPrinting(true);
    const certElement = document.getElementById("certificate-view-render");
    if (!certElement) {
      window.print();
      setPrinting(false);
      return;
    }

    // Collect all stylesheets from current document
    const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((el) => el.outerHTML)
      .join("\n");

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0px";
    printFrame.style.height = "0px";
    printFrame.style.border = "none";
    printFrame.style.zIndex = "-1000";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      setPrinting(false);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.title} - Certificate of Mastery</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          ${styleTags}
          <style>
            @page {
              size: landscape;
              margin: 8mm;
            }
            *, *::before, *::after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .certificate-print-container {
              width: 100% !important;
              max-width: 960px !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${certElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setPrinting(false);
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }, 400);
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Global Scoped Print Styles to isolate certificate if direct window.print() is called */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body > *:not(#certificate-modal-wrapper) {
            display: none !important;
          }
          #certificate-modal-wrapper {
            position: static !important;
            padding: 0 !important;
            background: white !important;
          }
          .certificate-print-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-width: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
      
      {/* Container Card with Sharp Borders */}
      <div id="certificate-modal-wrapper" className="relative w-full max-w-5xl bg-white border-2 border-purple-500/40 shadow-2xl p-4 sm:p-8 space-y-6 my-auto print:border-none print:shadow-none print:p-0 rounded-none">
        
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
              disabled={printing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 cursor-pointer rounded-none disabled:opacity-75"
            >
              <IconPrinter className="w-4 h-4" />
              <span>{printing ? "Preparing PDF..." : "Print / Download PDF"}</span>
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
