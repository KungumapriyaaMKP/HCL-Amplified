"use client";

import React, { useState, useRef } from "react";
import { CertificateView, CertificateData } from "./CertificateView";
import { exportCertificateToPdf } from "@/frontend/lib/certificatePdf";
import {
  IconPrinter,
  IconDownload,
  IconShare,
  IconX,
  IconCheck,
  IconAward,
  IconLoader2,
} from "@tabler/icons-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
}

export function CertificateModal({ isOpen, onClose, data }: CertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  async function handleDownloadPDF() {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const title = data.type === "grand" ? `Grand_${data.title}` : `Milestone_${data.title}`;
      const success = await exportCertificateToPdf(certRef.current, title, data.recipientName);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error during PDF download:", err);
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Global Print Isolation Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          html, body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all elements on the entire page */
          body * {
            visibility: hidden !important;
          }
          /* Make only the certificate container and all its children visible */
          #certificate-print-portal,
          #certificate-print-portal * {
            visibility: visible !important;
          }
          #certificate-print-portal {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 24px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            z-index: 2147483647 !important;
          }
          .certificate-print-container {
            width: 100% !important;
            max-width: 960px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
      
      {/* Container Card */}
      <div className="relative w-full max-w-5xl bg-white border-2 border-purple-500/40 shadow-2xl p-4 sm:p-6 space-y-4 my-auto print:border-none print:shadow-none print:p-0 print:m-0 rounded-none">
        
        {/* Top Controls Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 print-hide print:hidden">
          <div className="flex items-center gap-2 text-slate-900">
            <IconAward className="w-5 h-5 sm:w-6 sm:h-6 text-[#7C3AED]" />
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              {data.type === "grand" ? "Grand Domain Mastery Certificate" : "Milestone Mastery Certificate"}
            </h2>
          </div>

          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {/* Direct High-Res PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 disabled:opacity-75 cursor-pointer rounded-none transition-all"
            >
              {downloading ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <IconCheck className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded! ✓</span>
                </>
              ) : (
                <>
                  <IconDownload className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer rounded-none transition-all"
              title="Open browser print dialog for single-page landscape print"
            >
              <IconPrinter className="w-4 h-4 text-slate-600" />
              <span className="hidden xs:inline sm:inline">Print</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer rounded-none transition-all"
            >
              {copied ? <IconCheck className="w-4 h-4 text-emerald-600" /> : <IconShare className="w-4 h-4 text-slate-600" />}
              <span>{copied ? "Copied Link!" : "Share"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer rounded-none"
              aria-label="Close certificate preview"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Authentic Certificate Canvas & Print Portal */}
        <div className="overflow-x-auto py-1">
          <div id="certificate-print-portal" className="w-full flex items-center justify-center">
            <CertificateView ref={certRef} data={data} />
          </div>
        </div>

        {/* Bottom Helper Notice */}
        <div className="text-center text-[11px] text-slate-400 font-sans print-hide print:hidden">
          🔒 Cryptographically verifiable credential issued by QuestLearn AI Academic Board. Click &apos;Download PDF&apos; for certified high-res document.
        </div>

      </div>
    </div>
  );
}
