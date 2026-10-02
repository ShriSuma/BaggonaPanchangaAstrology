import React, { useState, useEffect, useRef } from "react";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { RoyalA4PrintTemplate, type RoyalA4Data } from "./RoyalA4PrintTemplate";

interface RoyalA4PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: KundliViewerSession;
  lang: string;
  data: RoyalA4Data | null;
  qrCodeUrl?: string;
  onDownloadPdf?: () => void;
  isDownloading?: boolean;
}

export default function RoyalA4PreviewModal({
  isOpen,
  onClose,
  session,
  lang,
  data,
  qrCodeUrl,
  onDownloadPdf,
  isDownloading = false
}: RoyalA4PreviewModalProps): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [zoom, setZoom] = useState<number>(0.8);
  const printableRef = useRef<HTMLDivElement>(null);

  // Responsive default zoom on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) {
        setZoom(0.4);
      } else if (window.innerWidth < 1024) {
        setZoom(0.65);
      } else {
        setZoom(0.85);
      }
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isKn = lang === "kn";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";

  const labels = {
    title: isKn
      ? "👑 ಅಧಿಕೃತ ರಾಜಮುದ್ರಣ ಮುನ್ನೋಟ (Royal A4 Print Preview)"
      : isHi
      ? "👑 आधिकारिक राजमुद्रण पूर्वावलोकन (Royal A4 Print Preview)"
      : isTe
      ? "👑 అధికారిక రాజముద్రణ ముందస్తు వీక్షణ (Royal A4 Print Preview)"
      : isTa
      ? "👑 அதிகாரபூர்வ ராஜமுத்திரை முன்னோட்டம் (Royal A4 Print Preview)"
      : "👑 Official Royal A4 Printout Preview",
    subtitle: isKn
      ? `${session.input.name} — ೫ ಪುಟಗಳ ಭೌತಿಕ ಮುದ್ರಣ ಪ್ರತಿ • ದೋಷ ನಿವಾರಣೆ & ದೈವಿಕ ರಕ್ಷಾ ಕವಚ`
      : `${session.input.name} — 5-Page Physical Print Edition • Dosha Shanti & Protective Shield`,
    directPrint: isKn ? "🖨️ ಮುದ್ರಣ (Print)" : isHi ? "🖨️ प्रिंट करें" : "🖨️ Direct Print",
    downloadPdf: isKn ? "📥 ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್" : isHi ? "📥 पीडीएफ डाउनलोड" : "📥 Download PDF",
    downloading: isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : isHi ? "डाउनलोड हो रहा है..." : "Generating PDF...",
    close: isKn ? "ಮುಚ್ಚಿ" : isHi ? "बंद करें" : "Close",
    zoomIn: "Zoom In (+)",
    zoomOut: "Zoom Out (-)",
    resetZoom: "Reset (100%)",
    fitWidth: isKn ? "ಹೊಂದಿಸು" : "Fit",
    tabs: [
      { id: "all" as const, label: isKn ? "ಎಲ್ಲಾ ೫ ಪುಟಗಳು (All 1–5)" : isHi ? "सभी ५ पृष्ठ (All 1–5)" : isTe ? "అన్ని 5 పుటలు (All 1–5)" : isTa ? "அனைத்து 5 பக்கங்கள் (All 1–5)" : "All Pages (1–5)" },
      { id: 1 as const, label: isKn ? "೧. ಕುಂಡಲಿ & ದಶಾ ಕಾಲಕ್ರಮ" : isHi ? "१. कुंडली एवं दशा कालक्रम" : isTe ? "౧. కుండలి & దశా కాలక్రమం" : isTa ? "௧. குண்டலி & தசா காலவரிசை" : "Page 1: Kundali & Dasha Timeline" },
      { id: 2 as const, label: isKn ? "೨. ಲಗ್ನ ತತ್ವ & ದಶಾ" : isHi ? "२. लग्न तत्व एवं दशा" : isTe ? "౨. లగ్న తత్వం & దశ" : isTa ? "௨. லக்ன தத்துவம் & தசா" : "Page 2: Personality & Dasha" },
      { id: 3 as const, label: isKn ? "೩. ಯೋಗ & ದೋಷ ಶಾಂತಿ" : isHi ? "३. योग एवं दोष शांति" : isTe ? "౩. యోగ & దోష శాంతి" : isTa ? "௩. யோக & தோஷ சாந்தி" : "Page 3: Yogas & Doshas" },
      { id: 4 as const, label: isKn ? "೪. ಗೋಚಾರ & ಮಾರ್ಗಸೂಚಿ" : isHi ? "४. गोचर एवं ६-माह मार्ग" : isTe ? "౪. గోచార & 6-నెలల మార్గం" : isTa ? "௪. கோச்சார & 6 மாத வழி" : "Page 4: Gochara & Roadmap" },
      { id: 5 as const, label: isKn ? "೫. ಪಂಚ ಕ್ಷೇತ್ರ & ಮುದ್ರೆ" : isHi ? "५. ५ प्रमुख क्षेत्र एवं मुहर" : isTe ? "౫. పంచ క్షేత్రాలు & ముద్ర" : isTa ? "௫. 5 முக்கிய துறைகள் & முத்திரை" : "Page 5: 5 Domains & Seal" }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-slate-100 backdrop-blur-md">
      {/* Dynamic Print Styles for Direct window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #royal-a4-preview-printable,
          #royal-a4-preview-printable * {
            visibility: visible !important;
          }
          #royal-a4-preview-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }
          .pdf-page {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="shrink-0 flex items-center justify-between border-b border-amber-600/30 bg-slate-900/90 px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-xl font-bold shadow-md shadow-amber-500/20 text-slate-950">
            👑
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-300 font-serif">
              {labels.title}
            </h2>
            <p className="text-xs text-amber-200/80 font-sans">
              {labels.subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2">
          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition shadow-sm cursor-pointer"
            title="Direct Print using Browser"
          >
            <span>{labels.directPrint}</span>
          </button>

          {/* Download PDF Button */}
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 rounded-lg border border-yellow-400 bg-gradient-to-r from-amber-600 to-yellow-600 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isDownloading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{labels.downloading}</span>
                </>
              ) : (
                <span>{labels.downloadPdf}</span>
              )}
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer text-sm font-bold"
            title={labels.close}
          >
            ✕
          </button>
        </div>
      </header>

      {/* Sub-header Navigation & Zoom Controls Strip */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/30 bg-slate-900/60 px-4 py-2">
        {/* Page Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {labels.tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-slate-800/80 text-amber-200/80 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(0.3, prev - 0.1))}
            className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white font-bold"
            title={labels.zoomOut}
          >
            －
          </button>
          <span className="w-12 text-center font-mono font-bold text-amber-300 text-xs">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(1.4, prev + 0.1))}
            className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white font-bold"
            title={labels.zoomIn}
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white font-sans"
            title={labels.resetZoom}
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                const target = (window.innerWidth - 60) / 900;
                setZoom(Math.min(1.0, Math.max(0.35, target)));
              }
            }}
            className="rounded bg-slate-800 px-2 py-1 text-[11px] text-amber-300 hover:bg-slate-700 hover:text-white font-sans font-bold"
            title={labels.fitWidth}
          >
            {labels.fitWidth}
          </button>
        </div>
      </div>

      {/* Main Scrollable Canvas Preview */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex justify-center items-start">
        {data ? (
          <div
            id="royal-a4-preview-printable"
            ref={printableRef}
            className="transition-transform duration-200 ease-out origin-top flex flex-col items-center gap-10"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              width: 900
            }}
          >
            <RoyalA4PrintTemplate
              session={session}
              lang={lang}
              data={data}
              qrCodeUrl={qrCodeUrl}
              activePage={activeTab}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="h-12 w-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-amber-300 font-serif text-sm animate-pulse">
              {isKn ? "ಅಧಿಕೃತ ರಾಜಮುದ್ರಣ ಪ್ರತಿ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ..." : "Assembling Royal A4 Printout Preview..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
