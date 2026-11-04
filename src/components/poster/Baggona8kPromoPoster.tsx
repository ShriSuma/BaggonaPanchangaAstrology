import React, { useRef, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface Baggona8kPromoPosterProps {
  initialMode?: "cashier_poster" | "table_tent";
  onClose?: () => void;
}

export const Baggona8kPromoPoster: React.FC<Baggona8kPromoPosterProps> = ({
  initialMode = "cashier_poster",
  onClose
}) => {
  const [viewMode, setViewMode] = useState<"cashier_poster" | "table_tent">(initialMode);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");
  const posterRef = useRef<HTMLDivElement>(null);
  const tableTentRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // SUPER ADMIN (SUPER OMI) CONFIGURABLE OFFERS & PRICING STATE
  // =========================================================================
  const [offer1Price, setOffer1Price] = useState(330);
  const [offer1RegularPrice, setOffer1RegularPrice] = useState(500);
  const [offer1TitleKn, setOffer1TitleKn] = useState("ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ದರ್ಶನ V1 + ಜನ್ಮ ಕುಂಡಲಿ");
  const [offer1TitleEn, setOffer1TitleEn] = useState("Premium Life Bhavishya V1 (40+ Pgs) + South Indian Kundali");

  const [offer2Price, setOffer2Price] = useState(430);
  const [offer2RegularPrice, setOffer2RegularPrice] = useState(700);
  const [offer2TitleKn, setOffer2TitleKn] = useState("ಕುಂಡಲಿ + ಭವಿಷ್ಯ V1 + ದೈವಿಕ ಪರಿಹಾರ ವರದಿ");
  const [offer2TitleEn, setOffer2TitleEn] = useState("Kundali + Bhavishya V1 + Daivika Parihara (Remedy Report)");

  const [heritageTextKn, setHeritageTextKn] = useState("೧೪೦+ ವರ್ಷಗಳ ಪವಿತ್ರ ಪರಾಶರೀ ಸಿದ್ಧಾಂತ ಜ್ಯೋತಿಷ್ಯ ಪರಂಪರೆ");
  const [heritageTextEn, setHeritageTextEn] = useState("140+ YEARS OF SACRED VEDIC HERITAGE");
  const [templeInvocation, setTempleInvocation] = useState("॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥");
  const [dispatchTime, setDispatchTime] = useState("5 Minutes");
  const [ctaTextKn, setCtaTextKn] = useState("ಪಡೆಯಲು ದಯವಿಟ್ಟು ಕ್ಯಾಷಿಯರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ");
  const [ctaTextEn, setCtaTextEn] = useState("FOR BOOKING & DETAILS, PLEASE CONTACT THE CASHIER DESK");
  const [customAnnouncement, setCustomAnnouncement] = useState("");

  // Studio Drawer Controls (Super Omi Control Panel)
  const [showStudioPanel, setShowStudioPanel] = useState(false);
  const [studioTab, setStudioTab] = useState<"offers" | "prompt" | "gallery">("offers");
  const [customPromptTweaks, setCustomPromptTweaks] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Dynamic Savings Calculations
  const offer1Savings = Math.max(0, offer1RegularPrice - offer1Price);
  const offer2Savings = Math.max(0, offer2RegularPrice - offer2Price);

  // Dynamic Nano Banana / Imagen AI Generation Prompt
  const generatedAiPrompt = useMemo(() => {
    return `Create an ultra-high quality, professional luxury temple marketing poster (A4 portrait aspect ratio 1:1.414, 8K print quality) for "Baggona Panchanga" (${heritageTextEn} / ${heritageTextKn}).
The poster is designed for a cashier desk display and restaurant table standee.
Key visual and textual elements to render with crisp, clear, beautiful luxury gold and deep maroon styling:
- Header: "${templeInvocation}" and "BAGGONA PANCHANGA (${heritageTextKn}) - ${heritageTextEn}"
- Special Pricing Badges:
  1. Standard Package: ₹${offer1Price} (Original ₹${offer1RegularPrice}, SAVE ₹${offer1Savings}) - ${offer1TitleEn} (South Indian Janana Kundali with Lagna, Navagrahas, and Maandi/Gulika placements + 40-Page Premium Bhavishya PDF with 10 Chapters).
  2. Complete Sacred Package + Daivika Parihara: ₹${offer2Price} (Original ₹${offer2RegularPrice}, SAVE ₹${offer2Savings}) - ${offer2TitleEn} (Kaal Sarp, Pitru, Kuja dosha diagnostics, 45-day Mandala Vrata, Beeja mantras, Gokarna Temple Sevas, and Chief Priest Vedic Blessing).
- Delivery badge: "Lightning ${dispatchTime} Dispatch via WhatsApp & Email in a secure ZIP file!"
- Call to action at bottom: "${ctaTextEn} (Provide Name, DOB, Time, & Place of Birth)"
${customAnnouncement ? `- Special Announcement Banner: "${customAnnouncement}"\n` : ""}${customPromptTweaks ? `- Stylistic Notes: ${customPromptTweaks}\n` : ""}- Traditional sacred Vedic aesthetic: ornate gold filigree borders, glowing Diya / deepam, temple motifs, sacred warm golden parchment background, ultra-sharp typography in English and Kannada script.`;
  }, [
    offer1Price,
    offer1RegularPrice,
    offer1Savings,
    offer1TitleEn,
    offer2Price,
    offer2RegularPrice,
    offer2Savings,
    offer2TitleEn,
    heritageTextEn,
    heritageTextKn,
    templeInvocation,
    dispatchTime,
    ctaTextEn,
    customAnnouncement,
    customPromptTweaks
  ]);

  const handleCopyPrompt = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generatedAiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleResetDefaults = () => {
    setOffer1Price(330);
    setOffer1RegularPrice(500);
    setOffer1TitleKn("ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ದರ್ಶನ V1 + ಜನ್ಮ ಕುಂಡಲಿ");
    setOffer1TitleEn("Premium Life Bhavishya V1 (40+ Pgs) + South Indian Kundali");
    setOffer2Price(430);
    setOffer2RegularPrice(700);
    setOffer2TitleKn("ಕುಂಡಲಿ + ಭವಿಷ್ಯ V1 + ದೈವಿಕ ಪರಿಹಾರ ವರದಿ");
    setOffer2TitleEn("Kundali + Bhavishya V1 + Daivika Parihara (Remedy Report)");
    setHeritageTextKn("೧೪೦+ ವರ್ಷಗಳ ಪವಿತ್ರ ಪರಾಶರೀ ಸಿದ್ಧಾಂತ ಜ್ಯೋತಿಷ್ಯ ಪರಂಪರೆ");
    setHeritageTextEn("140+ YEARS OF SACRED VEDIC HERITAGE");
    setTempleInvocation("॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥");
    setDispatchTime("5 Minutes");
    setCtaTextKn("ಪಡೆಯಲು ದಯವಿಟ್ಟು ಕ್ಯಾಷಿಯರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ");
    setCtaTextEn("FOR BOOKING & DETAILS, PLEASE CONTACT THE CASHIER DESK");
    setCustomAnnouncement("");
    setCustomPromptTweaks("");
  };

  // High-Resolution 8K Print / PDF Export Handler
  const handleDownloadPdf = async () => {
    const targetElement = viewMode === "cashier_poster" ? posterRef.current : tableTentRef.current;
    if (!targetElement) return;

    try {
      setIsExporting(true);
      setExportStage("Generating 8K Ultra-HD Master Canvas (300+ DPI)...");

      const canvas = await html2canvas(targetElement, {
        scale: 3, // Ultra-high 300+ DPI rendering for ultra-crisp text
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFDF8",
        logging: false
      });

      setExportStage("Compiling Press-Ready A4 PDF Document...");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

      const fileName =
        viewMode === "cashier_poster"
          ? "Baggona_Panchanga_Cashier_Poster_8K_A4.pdf"
          : "Baggona_Panchanga_Table_Tent_Fold_8K_A4.pdf";

      pdf.save(fileName);
    } catch (err) {
      console.error("[BaggonaPoster] PDF Export Error:", err);
      alert("Failed to export poster. You can use browser print (Ctrl+P / Cmd+P).");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  const handleDownloadImage = async () => {
    const targetElement = viewMode === "cashier_poster" ? posterRef.current : tableTentRef.current;
    if (!targetElement) return;

    try {
      setIsExporting(true);
      setExportStage("Rendering 8K PNG Image for Printing Press...");

      const canvas = await html2canvas(targetElement, {
        scale: 4, // 8K print quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFDF8",
        logging: false
      });

      const link = document.createElement("a");
      link.download =
        viewMode === "cashier_poster"
          ? "Baggona_Cashier_Poster_8K_UltraHD.png"
          : "Baggona_Table_Tent_8K_UltraHD.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("[BaggonaPoster] Image Export Error:", err);
      alert("Image generation failed.");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-3 sm:p-6 text-slate-100 flex flex-col items-center">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="w-full max-w-5xl mb-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <h1 className="text-lg sm:text-xl font-black text-amber-300 font-serif">
              ಸೂಪರ್ ಓಮಿ ೮K ಪ್ರಚಾರ ಪೋಸ್ಟರ್ & AI ಸ್ಟುಡಿಯೋ (Super Admin Studio)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ಕೇವಲ ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ · 140+ Years Heritage · Custom Offers, AI Prompts & 8K Exports
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-amber-500/30 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode("cashier_poster")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === "cashier_poster"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200 hover:text-white"
            }`}
          >
            📋 ಕ್ಯಾಷಿಯರ್ ಡೆಸ್ಕ್ ಪೋಸ್ಟರ್ (A4 Wall/Desk)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table_tent")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === "table_tent"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200 hover:text-white"
            }`}
          >
            ⛺ ಡೈನಿಂಗ್ ಟೇಬಲ್ ಫೋಲ್ಡ್ (Table Tent Stand)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Studio Toggle Button */}
          <button
            type="button"
            onClick={() => setShowStudioPanel(!showStudioPanel)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow cursor-pointer ${
              showStudioPanel
                ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                : "bg-amber-950/70 border border-amber-500/60 text-amber-300 hover:bg-amber-900"
            }`}
          >
            <span>✨</span>
            <span>{showStudioPanel ? "ಸ್ಟುಡಿಯೋ ಮುಚ್ಚಿ (Hide Studio)" : "ಸೂಪರ್ ಓಮಿ ಸ್ಟುಡಿಯೋ (Studio Controls)"}</span>
          </button>

          <button
            type="button"
            onClick={handleBrowserPrint}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <span>🖨️</span>
            <span>A4 Print</span>
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <span>📄</span>
            <span>{isExporting ? exportStage || "Exporting..." : "Download PDF"}</span>
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadImage}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <span>🖼️</span>
            <span>8K PNG</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold transition cursor-pointer"
            >
              ✕ Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SUPER ADMIN (SUPER OMI) STUDIO CONTROL PANEL (COLLAPSIBLE DRAWER)      */}
      {/* ====================================================================== */}
      {showStudioPanel && (
        <div className="w-full max-w-5xl mb-6 bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-lg print:hidden animate-fade-in">
          {/* Panel Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-amber-500/30 pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪄</span>
              <div>
                <h2 className="text-base font-black text-amber-300">
                  ಸೂಪರ್ ಓಮಿ ಆಫರ್ ಎಡಿಟರ್ & ನ್ಯಾನೋ ಬನಾನಾ AI ಪ್ರಾಂಪ್ಟ್ ಲ್ಯಾಬ್
                </h2>
                <p className="text-xs text-slate-400">
                  ಇಲ್ಲಿ ನೀಡಲಾದ ಹೊಸ ಆಫರ್‌ಗಳು, ಬೆಲೆಗಳು ಹಾಗೂ ಪಠ್ಯವು ನೇರವಾಗಿ ಕೆಳಗಿನ ಪೋಸ್ಟರ್‌ನಲ್ಲಿ ಹಾಗೂ AI ಪ್ರಾಂಪ್ಟ್‌ನಲ್ಲಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತವೆ.
                </p>
              </div>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStudioTab("offers")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  studioTab === "offers" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-300 hover:text-white"
                }`}
              >
                🎛️ ಹೊಸ ಆಫರ್‌ಗಳು & ಬೆಲೆ
              </button>
              <button
                type="button"
                onClick={() => setStudioTab("prompt")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  studioTab === "prompt" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-300 hover:text-white"
                }`}
              >
                🍌 Nano Banana Prompt
              </button>
              <button
                type="button"
                onClick={() => setStudioTab("gallery")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  studioTab === "gallery" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-300 hover:text-white"
                }`}
              >
                🖼️ ೮K AI ಗ್ಯಾಲರಿ
              </button>
            </div>
          </div>

          {/* TAB 1: OFFERS & PRICING CUSTOMIZATION */}
          {studioTab === "offers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Offer 1 Controls */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      ⭐ ಕೊಡುಗೆ ೧ (Standard Offer)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                      ರಿಯಾಯಿತಿ: ₹{offer1Savings}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ವಿಶೇಷ ಬೆಲೆ (Special Price ₹)</label>
                      <input
                        type="number"
                        value={offer1Price}
                        onChange={(e) => setOffer1Price(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 text-sm font-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ಮೂಲ ಬೆಲೆ (Original Price ₹)</label>
                      <input
                        type="number"
                        value={offer1RegularPrice}
                        onChange={(e) => setOffer1RegularPrice(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)</label>
                      <input
                        type="text"
                        value={offer1TitleKn}
                        onChange={(e) => setOffer1TitleKn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={offer1TitleEn}
                        onChange={(e) => setOffer1TitleEn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Offer 2 Controls */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                      🔱 ಕೊಡುಗೆ ೨ (Complete Sacred Package)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                      ರಿಯಾಯಿತಿ: ₹{offer2Savings}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ವಿಶೇಷ ಬೆಲೆ (Special Price ₹)</label>
                      <input
                        type="number"
                        value={offer2Price}
                        onChange={(e) => setOffer2Price(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-1.5 text-sm font-black text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ಮೂಲ ಬೆಲೆ (Original Price ₹)</label>
                      <input
                        type="number"
                        value={offer2RegularPrice}
                        onChange={(e) => setOffer2RegularPrice(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)</label>
                      <input
                        type="text"
                        value={offer2TitleKn}
                        onChange={(e) => setOffer2TitleKn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={offer2TitleEn}
                        onChange={(e) => setOffer2TitleEn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Announcement & Heritage Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ಪರಂಪರೆಯ ವರ್ಷಗಳು (Heritage)</label>
                  <input
                    type="text"
                    value={heritageTextKn}
                    onChange={(e) => setHeritageTextKn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ರವಾನೆ ಅವಧಿ (Dispatch Time)</label>
                  <input
                    type="text"
                    value={dispatchTime}
                    onChange={(e) => setDispatchTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ವಿಶೇಷ ಸಂದೇಶ / ಹೊಸ ಘೋಷಣೆ (Optional Banner)</label>
                  <input
                    type="text"
                    placeholder="ಉದಾ: ದೀಪಾವಳಿ ವಿಶೇಷ ಶುಭ ಸಂದರ್ಭ / Limited Festive Offer"
                    value={customAnnouncement}
                    onChange={(e) => setCustomAnnouncement(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-200"
                  />
                </div>
              </div>

              {/* Reset to standard prices */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  ↺ ಮೂಲ ಸೆಟ್ಟಿಂಗ್ಸ್‌ಗಳಿಗೆ ಮರುಹೊಂದಿಸಿ (Reset to ₹330 / ₹430 Defaults)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NANO BANANA AI PROMPT STUDIO */}
          {studioTab === "prompt" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    🍌 Nano Banana / Imagen 8K AI Image Prompt Generator
                  </span>
                  <p className="text-[11px] text-slate-400">
                    ಈ ಪ್ರಾಂಪ್ಟ್ ನೀವು ಮೇಲಿನ ಆಫರ್‌ಗಳಲ್ಲಿ ನಮೂದಿಸಿದ ಪ್ರತಿಯೊಂದು ಬೆಲೆ ಹಾಗೂ ವಿವರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಒಳಗೊಂಡಿರುತ್ತದೆ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <span>{copiedPrompt ? "✅ ಕಾಪಿ ಆಗಿದೆ!" : "📋 ಕಾಪಿ ಪ್ರಾಂಪ್ಟ್ (Copy Prompt)"}</span>
                </button>
              </div>

              {/* Live Generated Prompt Box */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={7}
                  value={generatedAiPrompt}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-100 font-mono focus:outline-none select-all"
                />
              </div>

              {/* Extra Prompt Tweaks */}
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  ಹೊಸ ಕಲಾತ್ಮಕ ಶೈಲಿ ಅಥವಾ ಅಂಶಗಳನ್ನು ಸೇರಿಸಿ (Custom Prompt Tweaks):
                </label>
                <input
                  type="text"
                  placeholder="ಉದಾ: Add Lord Ganesha motif at top, royal peacock feathers, saffron golden silk texture..."
                  value={customPromptTweaks}
                  onChange={(e) => setCustomPromptTweaks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          )}

          {/* TAB 3: GENERATED 8K NANO BANANA GALLERY */}
          {studioTab === "gallery" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  🖼️ ಸೂಪರ್ ಓಮಿ ೮K AI ಮುದ್ರಣ ಗ್ಯಾಲರಿ (Ultra-HD AI Master Prints)
                </h3>
                <p className="text-[11px] text-slate-400">
                  ನ್ಯಾನೋ ಬನಾನಾ AI ಮೂಲಕ ಸಿದ್ಧಪಡಿಸಲಾದ ಅಲ್ಟ್ರಾ-ಹೆಚ್‌ಡಿ ಪೋಸ್ಟರ್‌ಗಳು. ನೇರವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಕ್ಯಾಷಿಯರ್ ಡೆಸ್ಕ್ ಅಥವಾ ಟೇಬಲ್ ಸ್ಟ್ಯಾಂಡ್ ಮುದ್ರಣಕ್ಕೆ ಬಳಸಿ.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Poster 1 Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-48 bg-slate-900 rounded-lg overflow-hidden border border-amber-500/20 mb-2 flex items-center justify-center">
                      <img
                        src="/posters/Baggona_Panchanga_Cashier_Poster_8K.jpg"
                        alt="Nano Banana Poster 1"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="font-bold text-xs text-amber-200">
                      ಆಯ್ಕೆ ೧: ರಾಯಲ್ ವೆಲ್ವೆಟ್ ಮರೂನ್ & ದೀಪ ಸಂಪುಟ (8K Master)
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      ಶಿವ ಲಿಂಗ ಲಾಂಛನ, ಬೆಳಗುವ ಹಿತ್ತಾಳೆ ದೀಪ, ₹330 & ₹430 ಗೋಲ್ಡ್ ಬ್ಯಾಡ್ಜ್, 5-ನಿಮಿಷ WhatsApp ರಿಬ್ಬನ್.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/posters/Baggona_Panchanga_Cashier_Poster_8K.jpg"
                      download="Baggona_Panchanga_Cashier_Poster_8K_Maroon.jpg"
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black text-center transition flex items-center justify-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>ಡೌನ್‌ಲೋಡ್ ೮K ಚಿತ್ರ (813 KB)</span>
                    </a>
                  </div>
                </div>

                {/* Poster 2 Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-48 bg-slate-900 rounded-lg overflow-hidden border border-amber-500/20 mb-2 flex items-center justify-center">
                      <img
                        src="/posters/Baggona_Panchanga_Cashier_Poster_Variant2_8K.jpg"
                        alt="Nano Banana Poster 2"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="font-bold text-xs text-amber-200">
                      ಆಯ್ಕೆ ೨: ಪವಿತ್ರ ಸುವರ್ಣ ಪತ್ರಿಕೆ & ಜನ್ಮ ಕುಂಡಲಿ ಚಾರ್ಟ್ (8K Master)
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ (Lagna, Maandi, Gulika), ೧೦ ಅಧ್ಯಾಯಗಳ ಭವಿಷ್ಯ & ದೈವಿಕ ಪರಿಹಾರ ವರದಿ ವಿವರಣೆ.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/posters/Baggona_Panchanga_Cashier_Poster_Variant2_8K.jpg"
                      download="Baggona_Panchanga_Cashier_Poster_8K_GoldKundli.jpg"
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black text-center transition flex items-center justify-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>ಡೌನ್‌ಲೋಡ್ ೮K ಚಿತ್ರ (981 KB)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODE 1: CASHIER DESK FULL A4 POSTER (FLAT LAMINATED SHEET)             */}
      {/* ====================================================================== */}
      {viewMode === "cashier_poster" && (
        <div className="w-full flex justify-center overflow-x-auto pb-12">
          {/* A4 Proportion Container (210mm x 297mm @ 900px x 1273px) */}
          <div
            id="baggona-cashier-8k-poster"
            ref={posterRef}
            className="poster-print-container"
            style={{
              width: "900px",
              minWidth: "900px",
              maxWidth: "900px",
              height: "1273px",
              minHeight: "1273px",
              maxHeight: "1273px",
              padding: "16px 20px",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
              background: "#FFFDF8",
              fontFamily: "'Cinzel', 'Playfair Display', 'Noto Serif Kannada', 'Noto Serif', serif, sans-serif",
              color: "#1C1917",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* Outer Luxury Symmetrical Gold Double Border */}
            <div
              style={{
                width: "100%",
                height: "100%",
                border: "4px solid #B45309",
                outline: "2px solid #D97706",
                outlineOffset: "-8px",
                borderRadius: "16px",
                padding: "12px 16px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* 4 Corner Florets */}
              <div style={{ position: "absolute", top: "10px", left: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>
              <div style={{ position: "absolute", top: "10px", right: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>
              <div style={{ position: "absolute", bottom: "10px", left: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>
              <div style={{ position: "absolute", bottom: "10px", right: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>

              {/* ============================================================== */}
              {/* 1. TOP HEADER: 140+ YEAR SACRED HERITAGE                       */}
              {/* ============================================================== */}
              <div
                style={{
                  textAlign: "center",
                  background: "linear-gradient(135deg, #450A0A 0%, #780206 50%, #450A0A 100%)",
                  borderRadius: "12px",
                  padding: "9px 18px",
                  color: "#FFFFFF",
                  border: "2px solid #F59E0B",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  flexShrink: 0
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "1px" }}>
                  {templeInvocation}
                </div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.25 }}>
                  {heritageTextKn}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#FBBF24", marginTop: "1px", letterSpacing: "0.5px" }}>
                  {heritageTextEn}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "rgba(254, 243, 199, 0.15)",
                    border: "1px solid #F59E0B",
                    borderRadius: "20px",
                    padding: "2px 14px",
                    marginTop: "4px",
                    fontSize: "11px",
                    color: "#FEF08A",
                    fontWeight: 700
                  }}
                >
                  ⚡ ನಿಮ್ಮ ಊಟದ ಸಿದ್ಧತೆಯ ನಡುವೆ, ನಿಮ್ಮ ಜೀವಿತದ ಭವಿಷ್ಯ ತಿಳಿಯಿರಿ! | Discover Your Life's Destiny While You Wait!
                </div>
                {customAnnouncement && (
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "2px 12px",
                      background: "rgba(245, 158, 11, 0.25)",
                      border: "1px dashed #FDE68A",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#FFFBEB"
                    }}
                  >
                    🔔 {customAnnouncement}
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* 2. DUAL PRICING OFFERS (NO NOVEMBER MENTION - DIRECT SAVINGS)  */}
              {/* ============================================================== */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flexShrink: 0, marginTop: "6px" }}>
                {/* OFFER 1: STANDARD PACKAGE */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #D97706",
                    borderRadius: "12px",
                    padding: "9px 12px",
                    boxShadow: "0 3px 8px rgba(180, 83, 9, 0.08)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)",
                      color: "#FFFFFF",
                      fontSize: "9.5px",
                      fontWeight: 900,
                      padding: "2px 10px",
                      borderBottomLeftRadius: "8px",
                      letterSpacing: "0.5px"
                    }}
                  >
                    POPULAR CHOICE
                  </div>

                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309" }}>
                    ⭐ ಕೊಡುಗೆ ೧ · OFFER 1
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#780206", lineHeight: 1.25 }}>
                    {offer1TitleKn}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#451A03" }}>
                    {offer1TitleEn}
                  </div>

                  {/* Price Block */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "5px" }}>
                    <span style={{ fontSize: "13px", color: "#6B7280", textDecoration: "line-through", fontWeight: 700 }}>
                      ₹{offer1RegularPrice}
                    </span>
                    <span style={{ fontSize: "24px", color: "#B45309", fontWeight: 900, lineHeight: 1 }}>
                      ₹{offer1Price}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#DCFCE7",
                        color: "#166534",
                        border: "1px solid #86EFAC",
                        fontSize: "10px",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "6px"
                      }}
                    >
                      SAVE ₹{offer1Savings}! (ರಿಯಾಯಿತಿ)
                    </span>
                  </div>

                  <div style={{ fontSize: "10px", color: "#78350F", marginTop: "4px", lineHeight: 1.35 }}>
                    ✓ ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯ ಜನ್ಮ ಕುಂಡಲಿ (Lagna & Maandi Placements)<br />
                    ✓ ೪೦+ ಪುಟಗಳ ೧೦ ಅಧ್ಯಾಯಗಳ ಸಮಗ್ರ ಜೀವನ ಭವಿಷ್ಯ (10 Full Chapters)<br />
                    ✓ ೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ-ಭುಕ್ತಿ ರೋಡ್‌ಮ್ಯಾಪ್ (120-Yr Dasha)
                  </div>
                </div>

                {/* OFFER 2: COMPLETE SACRED PACKAGE WITH REMEDY */}
                <div
                  style={{
                    backgroundColor: "#FEFCE8",
                    border: "2.5px solid #780206",
                    borderRadius: "12px",
                    padding: "9px 12px",
                    boxShadow: "0 4px 12px rgba(120, 2, 6, 0.12)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      background: "linear-gradient(135deg, #780206 0%, #991B1B 100%)",
                      color: "#FFFFFF",
                      fontSize: "9.5px",
                      fontWeight: 900,
                      padding: "2px 10px",
                      borderBottomLeftRadius: "8px",
                      letterSpacing: "0.5px"
                    }}
                  >
                    👑 ALL-IN-ONE MASTER
                  </div>

                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B" }}>
                    🔱 ಕೊಡುಗೆ ೨ · COMPLETE SACRED PACKAGE
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#780206", lineHeight: 1.25 }}>
                    {offer2TitleKn}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#451A03" }}>
                    {offer2TitleEn}
                  </div>

                  {/* Price Block */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "5px" }}>
                    <span style={{ fontSize: "13px", color: "#6B7280", textDecoration: "line-through", fontWeight: 700 }}>
                      ₹{offer2RegularPrice}
                    </span>
                    <span style={{ fontSize: "24px", color: "#780206", fontWeight: 900, lineHeight: 1 }}>
                      ₹{offer2Price}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#FEE2E2",
                        color: "#991B1B",
                        border: "1px solid #FCA5A5",
                        fontSize: "10px",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "6px"
                      }}
                    >
                      SAVE ₹{offer2Savings}! (ಅತ್ಯುತ್ತಮ ಮೌಲ್ಯ)
                    </span>
                  </div>

                  <div style={{ fontSize: "10px", color: "#78350F", marginTop: "4px", lineHeight: 1.35 }}>
                    ✓ ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 & ಜನ್ಮ ಕುಂಡಲಿಯ ಸಕಲ ವಿವರಗಳು<br />
                    ✓ ಕಾಲಸರ್ಪ, ಪಿತೃ, ಕುಜ, ಅಂಗಾರಕ ದೋಷ ನಿರ್ಣಯ & ಗೋಕರ್ಣ ಸೇವೆಗಳು<br />
                    ✓ ೪೫-ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಾಧನೆ, ತುರ್ತು ಮಂತ್ರಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 3. DETAILED BREAKDOWN OF THE THREE INCLUDED MASTER REPORTS       */}
              {/* ============================================================== */}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px", flexShrink: 0, marginTop: "6px" }}>
                {/* REPORT A: SOUTH INDIAN JANANA KUNDALI */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E5E7EB",
                    borderLeft: "5px solid #B45309",
                    borderRadius: "8px",
                    padding: "7px 12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: "#780206" }}>
                      🪐 ೧. ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯ ಜನ್ಮ ಕುಂಡಲಿ (South Indian Janana Kundali)
                    </div>
                    <span style={{ fontSize: "9.5px", background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                      INCLUDED IN BOTH
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "9.5px", color: "#451A03", marginTop: "3px", lineHeight: 1.35 }}>
                    <div>
                      • <strong>ಆರೂಢ ಲಗ್ನ & ಮಾಂದಿ & ಗುಳಿಕ (Lagna & Maandi / Gulika Placements):</strong> ಸೂಕ್ಷ್ಮ ಕರ್ಮ ಬಿಂದುಗಳು ಮತ್ತು ೧೨ ಭಾವಗಳ ಸ್ಪಷ್ಟ ವಿನ್ಯಾಸ.<br />
                      • <strong>ರಾಶಿ & ನವಾಂಶ ಚಾರ್ಟ್‌ಗಳು (D1 & D9 Charts):</strong> ಗ್ರಹಗಳ ನಿಖರ ಅಂಶ, ಡಿಗ್ರಿ, ದೃಷ್ಟಿ ಬಲ ಮತ್ತು ಶಕ್ತಿ ವಿಶ್ಲೇಷಣೆ.
                    </div>
                    <div>
                      • <strong>Precise Degree & House Alignments:</strong> Exact placements of all 9 planets in South Indian square format.<br />
                      • <strong>Maandi/Gulika Calculation:</strong> Authentic karmic shadow planet calculation as per Parashari Siddhanta.
                    </div>
                  </div>
                </div>

                {/* REPORT B: PREMIUM BHAVISHYA V1 (10 FULL CHAPTERS) */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E5E7EB",
                    borderLeft: "5px solid #D97706",
                    borderRadius: "8px",
                    padding: "7px 12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: "#780206" }}>
                      📖 ೨. ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ದರ್ಶನ V1 (೪೦+ ಪುಟಗಳ ಸಮಗ್ರ ೧೦ ಅಧ್ಯಾಯಗಳು)
                    </div>
                    <span style={{ fontSize: "9.5px", background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                      40+ PAGES · 10 CHAPTERS
                    </span>
                  </div>
                  <div style={{ fontSize: "9px", color: "#451A03", marginTop: "3px", lineHeight: 1.3 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                      <div>
                        • <strong>ಅಧ್ಯಾಯ ೧-೪:</strong> ಜಾತಕ ದರ್ಪಣ · ಧನ-ಧಾನ್ಯ, ಕುಟುಂಬ · ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿ · ಆರೋಗ್ಯ, ಋಣ ನಿವಾರಣೆ<br />
                        • <strong>Ch 1-4:</strong> Personality, Wealth & Family, Education & Children, Health & Debt Mastery
                      </div>
                      <div>
                        • <strong>ಅಧ್ಯಾಯ ೫-೮:</strong> ವಿವಾಹ, ಕಳತ್ರ ಭಾಗ್ಯ · ಆಯುಷ್ಯ, ಗಂಡಾಂತರ ರಕ್ಷೆ · ಭಾಗ್ಯೋದಯ, ಧರ್ಮ · ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ರಾಜಯೋಗ<br />
                        • <strong>Ch 5-8:</strong> Marriage & Spouse, Longevity & Protection, Fortune & Dharma, Career & Raja Yoga
                      </div>
                    </div>
                    <div style={{ marginTop: "2px", borderTop: "1px dotted #E5E7EB", paddingTop: "2px" }}>
                      • <strong>ಅಧ್ಯಾಯ ೯-೧೦:</strong> ಲಾಭ, ಐಶ್ವರ್ಯ · ೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ-ಭುಕ್ತಿ ರೋಡ್‌ಮ್ಯಾಪ್ & ಮುಂದಿನ ೧೦ ವರ್ಷಗಳ ಮಾರ್ಗದರ್ಶಿ<br />
                      • <strong>Ch 9-10:</strong> Gains & Fulfillment, 120-Year Vimshottari Mahadasha-Bhukti Roadmap & Next 10-Year Life Guide
                    </div>
                  </div>
                </div>

                {/* REPORT C: DAIVIKA PARIHARA DOSSIER */}
                <div
                  style={{
                    backgroundColor: "#FFFBEB",
                    border: "1.5px solid #FCD34D",
                    borderLeft: "5px solid #DC2626",
                    borderRadius: "8px",
                    padding: "7px 12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: "#780206" }}>
                      🪔 ೩. ದೈವಿಕ ಪರಿಹಾರ & ದೋಷ ಮುಕ್ತಿ ವರದಿ (Daivika Parihara Dossier)
                    </div>
                    <span style={{ fontSize: "9.5px", background: "#FEE2E2", color: "#991B1B", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                      INCLUDED IN ₹{offer2Price} PACKAGE
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "9.5px", color: "#451A03", marginTop: "3px", lineHeight: 1.35 }}>
                    <div>
                      • <strong>ದೋಷ ನಿರ್ಣಯ:</strong> ಕಾಲಸರ್ಪ, ಪಿತೃ ದೋಷ, ಕುಜ ದೋಷ, ಬಾಧಕ ಗ್ರಹ ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರ ಶಾಂತಿ ಪರಿಹಾರಗಳು.<br />
                      • <strong>Dosha Diagnostics:</strong> Root-cause analysis for Kaal Sarp, Pitru, Kuja & ancestral karma.
                    </div>
                    <div>
                      • <strong>೪೫-ದಿನಗಳ ಸಾಧನೆ:</strong> ಮಂಡಲ ವ್ರತ ಸಾಧನಾ ಪತ್ರಿಕೆ, ತುರ್ತು ಮಂತ್ರಗಳು, ರುದ್ರಾಕ್ಷಿ-ರತ್ನ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಸೇವೆಗಳು.<br />
                      • <strong>Mandala Sadhana:</strong> 45-day discipline, daily stotras, Gokarna temple sevas & priest blessing.
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 4. SPEED & DELIVERY CALL-OUT (5 MINUTES ON WHATSAPP / EMAIL)   */}
              {/* ============================================================== */}
              <div
                style={{
                  backgroundColor: "#FEF3C7",
                  border: "2px dashed #B45309",
                  borderRadius: "12px",
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  marginTop: "6px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontSize: "32px", lineHeight: 1 }}>⚡</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "#780206", lineHeight: 1.2 }}>
                      ಕೇವಲ ೫ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ! · Delivered within 5 Minutes!
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#78350F", fontWeight: 700, marginTop: "1px" }}>
                      ಎಲ್ಲಾ ವರದಿಗಳು ಸುರಕ್ಷಿತ <strong>ZIP ಕಡತದಲ್ಲಿ</strong> ನಿಮ್ಮ <strong>WhatsApp</strong> ಅಥವಾ <strong>Email</strong> ಗೆ ನೇರವಾಗಿ ರವಾನೆಯಾಗುತ್ತವೆ.
                    </div>
                    <div style={{ fontSize: "10px", color: "#92400E" }}>
                      Instant delivery as an official compressed ZIP package directly to your phone.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#166534",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "11px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    flexShrink: 0
                  }}
                >
                  <div>5 MINS 🚀</div>
                  <div style={{ fontSize: "9px", opacity: 0.9 }}>FAST DELIVERY</div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 5. HOW TO ORDER & CASHIER DESK CALL-TO-ACTION                  */}
              {/* ============================================================== */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1C1917 0%, #292524 50%, #1C1917 100%)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  color: "#FFFFFF",
                  border: "2px solid #F59E0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  marginTop: "6px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "18px" }}>🛎️</span>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: "#FDE68A" }}>
                      {ctaTextKn}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                    {ctaTextEn}
                  </div>
                  <div style={{ fontSize: "10px", color: "#D6D3D1", marginTop: "2px" }}>
                    ಕೇವಲ ೪ ವಿವರಗಳನ್ನು ನೀಡಿ: <strong>ಹೆಸರು (Name) · ಜನ್ಮ ದಿನಾಂಕ (DOB) · ಜನನ ಸಮಯ (Birth Time) · ಹುಟ್ಟಿದ ಊರು (Place)</strong>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#F59E0B",
                    color: "#1C1917",
                    borderRadius: "10px",
                    padding: "7px 14px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "12px",
                    boxShadow: "0 2px 6px rgba(245, 158, 11, 0.4)",
                    flexShrink: 0
                  }}
                >
                  <div>ORDER NOW</div>
                  <div style={{ fontSize: "9px", fontWeight: 800 }}>ಕ್ಯಾಷಿಯರ್ ಕೌಂಟರ್</div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 6. SACRED FOOTER & PRIEST ENDORSEMENT                          */}
              {/* ============================================================== */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  color: "#78350F",
                  fontWeight: 800,
                  borderTop: "1.5px dashed #D97706",
                  paddingTop: "6px",
                  marginTop: "4px",
                  flexShrink: 0
                }}
              >
                <div>
                  🙏 ಪ್ರಧಾನ ಅರ್ಚಕರು: <strong>ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್</strong> (+91 94821 09844) · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ
                </div>
                <div>
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ · ೧೪೦+ ವರ್ಷಗಳ ಅಧಿಕೃತ ಮುದ್ರೆ ॥
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODE 2: DINING TABLE TENT FOLD (BI-FOLD A4 STAND FOR RESTAURANT TABLES)*/}
      {/* ====================================================================== */}
      {viewMode === "table_tent" && (
        <div className="w-full flex justify-center overflow-x-auto pb-12">
          {/* A4 Proportion (210mm x 297mm @ 900px x 1273px) with Central Fold Line */}
          <div
            id="baggona-table-tent-8k-poster"
            ref={tableTentRef}
            className="poster-print-container"
            style={{
              width: "900px",
              minWidth: "900px",
              maxWidth: "900px",
              height: "1273px",
              minHeight: "1273px",
              maxHeight: "1273px",
              padding: "14px 16px",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
              background: "#FFFDF8",
              fontFamily: "'Cinzel', 'Playfair Display', 'Noto Serif Kannada', 'Noto Serif', serif, sans-serif",
              color: "#1C1917",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* SIDE A: TOP HALF (FOLD OVER FOR DINER 1) */}
            <div
              style={{
                height: "595px",
                border: "2px solid #B45309",
                borderRadius: "14px",
                padding: "10px 14px",
                boxSizing: "border-box",
                background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF8 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}
            >
              {/* Side A Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #450A0A 0%, #780206 100%)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  color: "#FFFFFF",
                  border: "1.5px solid #F59E0B",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 800 }}>
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — {heritageTextKn} ॥
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#FFFFFF", marginTop: "1px" }}>
                  ನಿಮ್ಮ ಊಟದ ನಿರೀಕ್ಷೆಯ ನಡುವೆ, ನಿಮ್ಮ ಭವಿಷ್ಯ ತಿಳಿಯಿರಿ!
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#FBBF24" }}>
                  Discover Your Destiny While Waiting For Your Food!
                </div>
              </div>

              {/* Side A Dual Price Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                <div style={{ backgroundColor: "#FFFFFF", border: "2px solid #D97706", borderRadius: "10px", padding: "8px 10px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#B45309" }}>⭐ OFFER 1: KUNDALI + BHAVISHYA V1</div>
                  <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#780206" }}>{offer1TitleKn}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                    <span style={{ fontSize: "11.5px", color: "#6B7280", textDecoration: "line-through" }}>₹{offer1RegularPrice}</span>
                    <span style={{ fontSize: "20px", color: "#B45309", fontWeight: 900 }}>₹{offer1Price}</span>
                    <span style={{ fontSize: "9.5px", background: "#DCFCE7", color: "#166534", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>SAVE ₹{offer1Savings}</span>
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#78350F", marginTop: "3px", lineHeight: 1.3 }}>
                    • ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ (Lagna & Maandi)<br />
                    • ೪೦+ ಪುಟಗಳ ೧೦ ಅಧ್ಯಾಯಗಳ ವರದಿ<br />
                    • ೧೨೦-ವರ್ಷ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ ಭವಿಷ್ಯ
                  </div>
                </div>

                <div style={{ backgroundColor: "#FEFCE8", border: "2px solid #780206", borderRadius: "10px", padding: "8px 10px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#991B1B" }}>🔱 OFFER 2: COMPLETE REMEDY PACK</div>
                  <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#780206" }}>{offer2TitleKn}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                    <span style={{ fontSize: "11.5px", color: "#6B7280", textDecoration: "line-through" }}>₹{offer2RegularPrice}</span>
                    <span style={{ fontSize: "20px", color: "#780206", fontWeight: 900 }}>₹{offer2Price}</span>
                    <span style={{ fontSize: "9.5px", background: "#FEE2E2", color: "#991B1B", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>SAVE ₹{offer2Savings}</span>
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#78350F", marginTop: "3px", lineHeight: 1.3 }}>
                    • ಭವಿಷ್ಯ V1 & ಜನ್ಮ ಕುಂಡಲಿ ಸಂಪೂರ್ಣ ವಿವರ<br />
                    • ಕಾಲಸರ್ಪ, ಪಿತೃ, ಕುಜ ದೋಷ ಶಾಂತಿ ಪರಿಹಾರ<br />
                    • ೪೫-ದಿನ ಮಂಡಲ ವ್ರತ & ಗೋಕರ್ಣ ಸೇವೆಗಳು
                  </div>
                </div>
              </div>

              {/* Side A 5-Min Delivery Banner */}
              <div style={{ background: "#FEF3C7", border: "1.5px dashed #B45309", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206" }}>
                  ⚡ ಕೇವಲ {dispatchTime}ಗಳಲ್ಲಿ ನಿಮ್ಮ WhatsApp ಅಥವಾ Email ಗೆ ZIP ಫೈಲ್ ರವಾನೆ!
                </div>
                <span style={{ fontSize: "10px", background: "#166534", color: "#FFFFFF", padding: "2px 8px", borderRadius: "6px", fontWeight: 900 }}>
                  5 MINS 🚀
                </span>
              </div>

              {/* Side A Cashier Call to Action */}
              <div style={{ background: "#1C1917", borderRadius: "8px", padding: "7px 12px", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 900, color: "#FDE68A" }}>
                    🛎️ {ctaTextKn} | Contact Cashier
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#D6D3D1" }}>
                    ನೀಡಿ: ಹೆಸರು (Name) · ಜನ್ಮ ದಿನಾಂಕ (DOB) · ಸಮಯ (Birth Time) · ಹುಟ್ಟಿದ ಊರು (Place)
                  </div>
                </div>
                <div style={{ background: "#F59E0B", color: "#1C1917", padding: "4px 10px", borderRadius: "6px", fontWeight: 900, fontSize: "10.5px" }}>
                  ORDER AT CASHIER
                </div>
              </div>
            </div>

            {/* DOTTED FOLD LINE IN THE CENTER (A4 BI-FOLD GUIDE) */}
            <div
              style={{
                width: "100%",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}
            >
              <div style={{ width: "100%", height: "1px", borderTop: "2px dashed #B45309", opacity: 0.7 }} />
              <div
                style={{
                  position: "absolute",
                  background: "#FFFDF8",
                  padding: "2px 12px",
                  border: "1px solid #D97706",
                  borderRadius: "10px",
                  fontSize: "9px",
                  fontWeight: 900,
                  color: "#B45309",
                  letterSpacing: "1px"
                }}
              >
                ✂️ ಕಾಗದದ ಮಧ್ಯಭಾಗದ ಮಡಚುವ ಗೆರೆ · FOLD HERE FOR TABLE TENT STANDEE (BI-FOLD A4)
              </div>
            </div>

            {/* SIDE B: BOTTOM HALF (FOLD OVER FOR DINER 2) */}
            <div
              style={{
                height: "595px",
                border: "2px solid #780206",
                borderRadius: "14px",
                padding: "10px 14px",
                boxSizing: "border-box",
                background: "linear-gradient(180deg, #FFFDF8 0%, #FFFBEB 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}
            >
              {/* Side B Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1C1917 0%, #292524 100%)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  color: "#FFFFFF",
                  border: "1.5px solid #F59E0B",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 800 }}>
                  ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಆಶೀರ್ವಾದ ॥
                </div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", marginTop: "1px" }}>
                  ವರದಿಗಳ ಸಮಗ್ರ ವಿವರ · FULL REPORT SPECIFICATIONS
                </div>
              </div>

              {/* Side B 3 Report Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderLeft: "4px solid #B45309", borderRadius: "8px", padding: "6px 10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206" }}>
                    🪐 ೧. ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ (Lagna & Maandi Placements)
                  </div>
                  <div style={{ fontSize: "9px", color: "#451A03", marginTop: "2px" }}>
                    ಆರೂಢ ಲಗ್ನ, ೧೨ ಭಾವಗಳು, ಗ್ರಹ ಸ್ಪಷ್ಟಾಂಶ ಹಾಗೂ ಮಾಂದಿ-ಗುಳಿಕ ಕರ್ಮ ಬಿಂದುಗಳು. D1 & D9 ಚಾರ್ಟ್‌ಗಳು.
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderLeft: "4px solid #D97706", borderRadius: "8px", padding: "6px 10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206" }}>
                    📖 ೨. ೪೦+ ಪುಟಗಳ ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ದರ್ಶನ V1 (10 Full Chapters)
                  </div>
                  <div style={{ fontSize: "8.5px", color: "#451A03", marginTop: "2px" }}>
                    ಜಾತಕ ದರ್ಪಣ · ಧನ-ಕುಟುಂಬ · ವಿದ್ಯಾ-ಸಂತಾನ · ರೋಗ-ಋಣ ಜಯ · ವಿವಾಹ · ಆಯುಷ್ಯ · ಭಾಗ್ಯ · ಉದ್ಯೋಗ · ಲಾಭ · ೧೨೦-ವರ್ಷ ದಶಾ ರೋಡ್‌ಮ್ಯಾಪ್.
                  </div>
                </div>

                <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderLeft: "4px solid #DC2626", borderRadius: "8px", padding: "6px 10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206" }}>
                    🪔 ೩. ದೈವಿಕ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆಗಳು (Daivika Parihara Dossier)
                  </div>
                  <div style={{ fontSize: "8.5px", color: "#451A03", marginTop: "2px" }}>
                    ಕಾಲಸರ್ಪ, ಪಿತೃ, ಕುಜ ದೋಷ ಶಾಂತಿ · ೪೫-ದಿನ ಮಂಡಲ ಸಾಧನೆ · ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ.
                  </div>
                </div>
              </div>

              {/* Side B Footer */}
              <div
                style={{
                  borderTop: "1px dashed #D97706",
                  paddingTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "9.5px",
                  color: "#78350F",
                  fontWeight: 800
                }}
              >
                <div>
                  🙏 ಪ್ರಧಾನ ಅರ್ಚಕರು: ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್ (+91 94821 09844)
                </div>
                <div style={{ color: "#B45309" }}>
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Media Styles (A4 Page Fit) */}
      <style>{`
        @media print {
          body {
            background-color: #FFFFFF !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          .poster-print-container {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 8mm 10mm !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Baggona8kPromoPoster;
