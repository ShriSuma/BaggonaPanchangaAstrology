import React, { useState } from "react";
import QRCode from "qrcode";
import type { RhythmResult } from "../../core/DailyRhythmEngine";
import { pick } from "../../features/seva/sevaLocale";
import { generatePDFFromElement } from "../../utils/pdfGenerator";
import { RoyalBooklet8PageTemplate } from "./pdf/RoyalBooklet8PageTemplate";
import { validateRoyalBookletData } from "../../features/seva/royalBookletValidator";
import { generateQrPayloadByTarget } from "../../features/seva/icsCalendarGenerator";

const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: "-9999px",
  top: "0",
  width: "794px",
  opacity: 0,
  pointerEvents: "none",
  overflow: "hidden",
  height: 0
};

export const formatSevaDocFileName = ({
  pandit,
  devotee,
  date,
  docType,
  ext = "pdf"
}: {
  pandit?: string;
  devotee?: string;
  date?: string;
  docType?: string;
  lang?: string;
  ext?: string;
}): string => {
  const sanitize = (str?: string, fallback = ""): string => {
    if (!str) return fallback;
    const clean = str.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
    return clean || fallback;
  };

  const pName = sanitize(pandit, "Shreeram_Pandit");
  const dName = sanitize(devotee, "Devotee");
  const dType = sanitize(docType, "Astrology_Doc");
  const dateStr = (date || new Date().toISOString().slice(0, 10)).replace(/[^\d-]/g, "");

  return `${dType}_${pName}_${dName}_${dateStr}.${ext}`;
};

interface RoyalBookletTabProps {
  rhythm: RhythmResult;
  identity: {
    personName: string;
    gotra?: string;
    rashiIndex?: number;
    nakshatraIndex?: number;
    placeLabel?: string;
    dob?: string;
    tob?: string;
  };
  lang: string;
  panditName?: string;
}

export default function RoyalBookletTab({
  rhythm,
  identity,
  lang,
  panditName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}: RoyalBookletTabProps): JSX.Element {
  const [pdfLang, setPdfLang] = useState<string>(lang || "kn");
  const [busy, setBusy] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const isKn = pdfLang === "kn";

  // Pre-generate QR Code whenever pdfLang or rhythm changes
  React.useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      try {
        const qrPayload = generateQrPayloadByTarget("google", {
          days: rhythm?.days || [],
          lang: pdfLang as any,
          panditName,
          notificationTime: "07:00",
          personName: identity?.personName,
          platform: "android",
          dob: identity?.dob,
          tob: identity?.tob
        });
        const url = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: { dark: "#78350F", light: "#FFFFFF" }
        });
        if (isMounted) setQrDataUrl(url);
      } catch (e) {
        const fallbackPayload = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga Calendar")}&recur=RRULE:FREQ=DAILY;COUNT=90&ctz=Asia/Kolkata`;
        const url = await QRCode.toDataURL(fallbackPayload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: { dark: "#78350F", light: "#FFFFFF" }
        });
        if (isMounted) setQrDataUrl(url);
      }
    };
    void generateQr();
    return () => {
      isMounted = false;
    };
  }, [pdfLang, rhythm, panditName, identity]);

  const handleDownload = async () => {
    setBusy(true);
    try {
      // 1. Run Pre-Flight Pre-Download Validation Engine
      const valRes = validateRoyalBookletData(pdfLang, identity, rhythm, panditName);
      if (!valRes.isValid) {
        console.error("Royal Booklet Validation Errors:", valRes.errors);
        alert(isKn ? `ದೋಷ: ${valRes.errors.join(", ")}` : `Validation Error: ${valRes.errors.join(", ")}`);
        setBusy(false);
        return;
      }

      // Small delay to ensure rendering frame is completely stable
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. Generate 8-Page PDF
      const fileName = formatSevaDocFileName({
        pandit: panditName,
        devotee: identity.personName,
        date: new Date().toISOString().slice(0, 10),
        docType: "8Page-Royal-Booklet",
        lang: pdfLang,
        ext: "pdf"
      });

      await generatePDFFromElement("seva-print-royal-booklet", fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(isKn ? "PDF ಪ್ರಿಂಟ್ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ." : "PDF generation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Gold Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 p-6 text-white shadow-2xl border-2 border-amber-400/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 mb-2">
              <span>👑</span>
              <span>{isKn ? "ಅಧಿಕೃತ ರಾಯಲ್ ಝೆರಾಕ್ಸ್ ಮುದ್ರಣ ಆವೃತ್ತಿ" : "Official Xerox Print Edition"}</span>
            </div>
            <h2 className="text-2xl font-black text-amber-100 tracking-wide font-serif">
              {isKn ? "೮ ಪುಟಗಳ ರಾಯಲ್ ಜ್ಯೋತಿಷ್ಯ ಗ್ರಂಥ (₹1,200 Plan)" : "8-Page Royal Astrological Booklet (₹1,200 Plan)"}
            </h2>
            <p className="text-sm text-amber-200/90 mt-1 max-w-xl">
              {isKn
                ? "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜನ್ಮ ಕುಂಡಲಿ, ೨೦-ವರ್ಷಗಳ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ನಕ್ಷೆ, ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿ ಹಾಗೂ ಪೂಜಾ ಮಂದಿರದ ಸ್ತೋತ್ರಗಳನ್ನು ಒಳಗೊಂಡ ಸಂಪೂರ್ಣ ಗ್ರಂಥ."
                : "Complete personalized astrological dossier featuring Janma Kundli, 20-Yr Dasha Timeline, Deep Bhavishya, and Altar Stotras."}
            </p>
          </div>
          <div className="shrink-0 bg-amber-900/60 p-4 rounded-2xl border border-amber-400/40 text-center">
            <div className="text-2xl font-black text-amber-300">₹1,200</div>
            <div className="text-[10px] text-amber-200/70 font-semibold uppercase">{isKn ? "ರಾಯಲ್ ಪ್ರಿಂಟ್ ಮೌಲ್ಯ" : "Royal Booklet Price"}</div>
          </div>
        </div>

        {/* 8-Page Feature Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-amber-500/30">
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-500/20 text-center">
            <div className="text-xs font-bold text-amber-200">📖 {isKn ? "ಪುಟ ೧: ಕವರ್" : "Page 1: Cover"}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">{isKn ? "ಭಕ್ತರ ಪ್ರೊಫೈಲ್" : "Devotee Profile"}</div>
          </div>
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-500/20 text-center">
            <div className="text-xs font-bold text-amber-200">📊 {isKn ? "ಪುಟ ೨: ಕುಂಡಲಿ" : "Page 2: Kundli"}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">{isKn ? "D1 & D9 ಚಾರ್ಟ್‌ಗಳು" : "D1 & D9 Grids"}</div>
          </div>
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-500/20 text-center">
            <div className="text-xs font-bold text-amber-200">⏳ {isKn ? "ಪುಟ ೩: ದಶಾ ನಕ್ಷೆ" : "Page 3: Dasha"}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">{isKn ? "೨೦-ವರ್ಷಗಳ ಫಲ" : "20-Yr Timeline"}</div>
          </div>
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-500/20 text-center">
            <div className="text-xs font-bold text-amber-200">🔮 {isKn ? "ಪುಟ ೪-೬: ಭವಿಷ್ಯ" : "Page 4-6: Forecast"}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">{isKn ? "೩ ಪೂರ್ಣ ಪುಟಗಳು" : "3 Full Pages"}</div>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-200">
        <div className="text-xs font-bold text-amber-900">
          🌐 {isKn ? "ದಾಖಲೆ ಮುದ್ರಣ ಭಾಷೆ:" : "Document Language:"}
        </div>
        <div className="flex gap-1.5">
          {["kn", "hi", "te", "ta", "en"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setPdfLang(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                pdfLang === l
                  ? "bg-amber-800 text-amber-50 shadow-sm"
                  : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              {l === "kn" ? "ಕನ್ನಡ" : l === "hi" ? "हिंदी" : l === "te" ? "తెలుగు" : l === "ta" ? "தமிழ்" : "English"}
            </button>
          ))}
        </div>
      </div>

      {/* DEDICATED SOLE ACTION BUTTON */}
      <button
        type="button"
        disabled={busy}
        onClick={handleDownload}
        className={`w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 p-5 text-white shadow-xl hover:from-amber-800 hover:to-amber-900 border-2 border-amber-400 ring-4 ring-amber-300/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
          busy ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <span className="text-4xl animate-bounce">{busy ? "⌛" : "👑"}</span>
            <div>
              <div className="text-base font-black tracking-wide text-amber-100 uppercase">
                {busy
                  ? (isKn ? "೮ ಪುಟಗಳ ಗ್ರಂಥ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating 8-Page Booklet PDF...")
                  : pick({
                      kn: "👑 ೮ ಪುಟಗಳ ರಾಯಲ್ ಜ್ಯೋತಿಷ್ಯ ಗ್ರಂಥ ಪೂರ್ಣ ಡೌನ್‌ಲೋಡ್ (₹1,200 Plan)",
                      hi: "👑 8-पृष्ठ रॉयल ज्योतिष ग्रंथ डाउनलोड (₹1,200 Plan)",
                      te: "👑 8-పేజీల రాయల్ జ్యోతిష్య గ్రంథం డౌన్‌లోడ్ (₹1,200 Plan)",
                      ta: "👑 8-பக்க ராயல் ஜோதிட நூல் பதிவிறக்கம் (₹1,200 Plan)",
                      en: "👑 Download 8-Page Royal Astrological Booklet (₹1,200 Plan)"
                    }, pdfLang)}
              </div>
              <div className="text-xs font-medium text-amber-200/90 mt-0.5">
                {isKn ? "ಎಲ್ಲಾ ೮ ಪುಟಗಳ ಪೂರ್ಣ ಜ್ಯೋತಿಷ್ಯ ಲೈಫ್ ವರದಿ High-Resolution PDF" : "All 8 Pages Complete Astrological Life Report High-Res PDF"}
              </div>
            </div>
          </div>
          <div className="shrink-0 bg-amber-950/50 px-4 py-2 rounded-xl border border-amber-300/50 text-xs font-bold text-amber-200">
            {busy ? "⏳" : "🖨️ PDF"}
          </div>
        </div>
      </button>

      {/* Hidden Print Container */}
      <div id="seva-print-royal-booklet" style={hiddenHost} aria-hidden>
        <RoyalBooklet8PageTemplate
          lang={pdfLang as any}
          identity={identity}
          panditName={panditName}
          rhythm={rhythm}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  );
}
