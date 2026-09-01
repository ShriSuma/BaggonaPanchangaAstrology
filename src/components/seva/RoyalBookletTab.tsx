import React, { useState } from "react";
import QRCode from "qrcode";
import { RoyalBooklet8PageTemplate } from "./pdf/RoyalBooklet8PageTemplate";
import { validateRoyalBookletData } from "../../features/seva/royalBookletValidator";
import type { RhythmResult } from "../../core/DailyRhythmEngine";
import { generatePDFFromElement } from "../../utils/pdfGenerator";
import { generateQrPayloadByTarget } from "../../features/seva/icsCalendarGenerator";
import { pick } from "../../features/seva/sevaLocale";
import { PREDEFINED_PRIESTS, type PriestProfile } from "../../features/seva/sevaPriestDirectory";

const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: "-10000px",
  top: 0,
  width: "210mm",
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
  transform: "scale(1)",
  background: "#FFFFFF"
};

/**
 * Builds a deterministic, structured PDF filename according to Baggona naming specs.
 */
export const buildRoyalPdfFileName = (
  docType: string,
  personName: string,
  lang: string,
  extension: "pdf" | "jpg" = "pdf"
): string => {
  const sanitize = (s: string) =>
    (s || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\u0C80-\u0CFF-]/g, "");

  const dType = sanitize(docType) || "Baggona_Panchanga";
  const pName = sanitize(personName) || "Devotee";
  const dName = sanitize(lang) || "kn";
  const dateStr = new Date().toISOString().split("T")[0];
  const ext = extension === "jpg" ? "jpg" : "pdf";

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
  const [selectedPandit, setSelectedPandit] = useState<string>(panditName);
  const [busy, setBusy] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const isKn = pdfLang === "kn";

  // Pre-generate QR Code whenever pdfLang, rhythm, or selectedPandit changes
  React.useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      try {
        const qrPayload = generateQrPayloadByTarget("google", {
          days: rhythm?.days || [],
          lang: pdfLang as any,
          panditName: selectedPandit,
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
        const fallbackPayload = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga Calendar")}&ctz=Asia/Kolkata`;
        const url = await QRCode.toDataURL(fallbackPayload, {
          errorCorrectionLevel: "L",
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
  }, [pdfLang, rhythm, selectedPandit, identity]);

  const handleDownload = async () => {
    setBusy(true);
    try {
      // 1. Run Pre-Flight Pre-Download Validation Engine
      const valRes = validateRoyalBookletData(pdfLang, identity, rhythm, selectedPandit);
      if (!valRes.isValid) {
        console.error("Royal Booklet Validation Errors:", valRes.errors);
      }

      // 2. Deterministic Structured Filename
      const fileName = buildRoyalPdfFileName(
        "8Page_Royal_Astrological_Booklet",
        identity.personName,
        pdfLang,
        "pdf"
      );

      // 3. Multi-Page A4 PDF Generation with Zero Section Break Clipping
      await generatePDFFromElement("seva-print-royal-booklet", fileName);
    } catch (e) {
      console.error("Failed to generate 8-Page Royal Booklet PDF:", e);
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

      {/* Priest Selector & Language Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chief Priest Selector */}
        <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <div className="text-xs font-bold text-amber-900">
            🙏 {isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರು (Chief Priest):" : "Chief Priest:"}
          </div>
          <select
            value={selectedPandit}
            onChange={(e) => setSelectedPandit(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-amber-950 border border-amber-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {PREDEFINED_PRIESTS.map((p: PriestProfile) => (
              <option key={p.id} value={p.name.kn}>
                {isKn ? p.name.kn : p.name.en}
              </option>
            ))}
          </select>
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
                      kn: `👑 ೮ ಪುಟಗಳ ರಾಯಲ್ ಜ್ಯೋತಿಷ್ಯ ಗ್ರಂಥ ಪೂರ್ಣ ಡೌನ್‌ಲೋಡ್ (${selectedPandit})`,
                      hi: `👑 8-पृष्ठ रॉयल ज्योतिष ग्रंथ डाउनलोड (${selectedPandit})`,
                      te: `👑 8-పేజీల రాయల్ జ్యోతిష్య గ్రంథం డౌన్‌లోడ్ (${selectedPandit})`,
                      ta: `👑 8-பக்க ராயல் ஜோதிட நூல் பதிவிறக்கம் (${selectedPandit})`,
                      en: `👑 Download 8-Page Royal Booklet (${selectedPandit})`
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
          panditName={selectedPandit}
          rhythm={rhythm}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  );
}
