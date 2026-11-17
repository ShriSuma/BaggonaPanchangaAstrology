import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAppStore } from "../stores/appStore";
import {
  AntarangaAstrologicalScreenLoader,
  type AntarangaLoaderStage
} from "../components/loaders/AntarangaAstrologicalScreenLoader";
import {
  RotatingSuryaKalachakra,
  AmbientRotatingMandalaWatermark
} from "./AntarangadaSatyaPage";

type CardFormat = "table_tent" | "acrylic_insert" | "compact_sticker";

interface TableCardData {
  tableNumber: string | number;
  qrDataUrl: string;
  targetUrl: string;
}

export default function HotelTableQrPage(): JSX.Element {
  const setAppPage = useAppStore((s) => s.setPage);

  // Configuration State
  const [hotelName, setHotelName] = useState("Pandit Palette (ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್)");
  const [hotelTagline, setHotelTagline] = useState("ಅತ್ಯುತ್ತಮ ಉಪಹಾರ & ಸಸ್ಯಾಹಾರಿ ಭೋಜನ ಮಂದಿರ (Fine Dining Restaurant)");
  const [generationMode, setGenerationMode] = useState<"single" | "batch">("batch");
  const [singleTableNumber, setSingleTableNumber] = useState<string>("1");
  const [batchStart, setBatchStart] = useState<number>(1);
  const [batchEnd, setBatchEnd] = useState<number>(10);
  const [cardFormat, setCardFormat] = useState<CardFormat>("table_tent");
  const [cardLang, setCardLang] = useState<"bilingual" | "kn" | "en">("bilingual");

  // Output cards
  const [generatedCards, setGeneratedCards] = useState<TableCardData[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [customBaseHost, setCustomBaseHost] = useState<string>("");

  // Full-Screen Astrological Screen Loader
  const [screenLoaderOpen, setScreenLoaderOpen] = useState(false);
  const [screenLoaderStage, setScreenLoaderStage] = useState<AntarangaLoaderStage>("table_qr_generate");
  const [screenLoaderProgress, setScreenLoaderProgress] = useState<number | undefined>(undefined);

  const printContainerRef = useRef<HTMLDivElement>(null);

  // Base Customer URL
  const getCustomerBaseUrl = () => {
    if (customBaseHost.trim()) {
      const clean = customBaseHost.trim().replace(/\/+$/, "");
      return `${clean}/antaranga`;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/antaranga`;
    }
    return "https://baggona.com/antaranga";
  };

  // Generate QR Codes with Astrological Screen Loader
  const generateAllCards = async (showLoader = false) => {
    setIsGenerating(true);
    if (showLoader) {
      setScreenLoaderStage("table_qr_generate");
      setScreenLoaderProgress(20);
      setScreenLoaderOpen(true);
    }

    const baseUrl = getCustomerBaseUrl();
    const tables: (string | number)[] = [];

    if (generationMode === "single") {
      tables.push(singleTableNumber.trim() || "1");
    } else {
      const start = Math.max(1, batchStart);
      const end = Math.max(start, Math.min(start + 50, batchEnd));
      for (let i = start; i <= end; i++) {
        tables.push(i);
      }
    }

    try {
      if (showLoader) {
        await new Promise((r) => setTimeout(r, 300));
        setScreenLoaderProgress(50);
      }
      const cards: TableCardData[] = [];
      for (const tableNum of tables) {
        const targetUrl = `${baseUrl}?table=${encodeURIComponent(String(tableNum))}&hotel=${encodeURIComponent(hotelName.trim())}`;
        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: "#1c1917", // warm deep charcoal/black
            light: "#ffffff"
          }
        });
        cards.push({
          tableNumber: tableNum,
          qrDataUrl,
          targetUrl
        });
      }
      setGeneratedCards(cards);
      if (showLoader) setScreenLoaderProgress(100);
    } catch (err) {
      console.error("QR Generation error:", err);
      alert("QR ಕೋಡ್ ರಚನೆಯಲ್ಲಿ ದೋಷವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setIsGenerating(false);
      if (showLoader) {
        setTimeout(() => setScreenLoaderOpen(false), 350);
      }
    }
  };

  // Auto-generate on initial load or parameter change
  useEffect(() => {
    void generateAllCards(false);
  }, [hotelName, generationMode, singleTableNumber, batchStart, batchEnd, customBaseHost]);

  // Direct Print action
  const handlePrint = () => {
    window.print();
  };

  // Export to PDF with Astrological Screen Loader & Progress Tracking
  const handleExportPdf = async () => {
    if (!printContainerRef.current) return;
    setIsExportingPdf(true);
    setScreenLoaderStage("table_qr_pdf");
    setScreenLoaderProgress(10);
    setScreenLoaderOpen(true);

    try {
      const cards = printContainerRef.current.querySelectorAll(".hotel-table-card") as NodeListOf<HTMLElement>;
      if (!cards || cards.length === 0) {
        alert("ಯಾವುದೇ ಟೇಬಲ್ ಕಾರ್ಡ್ ಕಂಡುಬಂದಿಲ್ಲ.");
        return;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < cards.length; i++) {
        const cardEl = cards[i];
        setScreenLoaderProgress(Math.round(15 + (i / cards.length) * 75));
        const canvas = await html2canvas(cardEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFBEB"
        });

        if (i > 0) pdf.addPage("a4", "portrait");
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 10, 10, 190, 277);
      }

      setScreenLoaderProgress(95);
      pdf.save(`Hotel_${hotelName.replace(/\s+/g, "_")}_Table_Tents.pdf`);
      setScreenLoaderProgress(100);
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error("Export PDF error:", err);
      alert("PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷವಾಗಿದೆ.");
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setScreenLoaderOpen(false), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#FFF3DE] text-stone-900 font-sans selection:bg-amber-500 selection:text-stone-950 pb-16 relative overflow-x-hidden">
      {/* Ambient Celestial Rotating Mandalas */}
      <AmbientRotatingMandalaWatermark />

      {/* Print CSS Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break-after {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* Top Gold Accent */}
      <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 w-full no-print shadow-sm" />

      {/* Screen Header */}
      <header className="max-w-6xl mx-auto px-4 py-4 border-b border-amber-300/80 bg-white/80 backdrop-blur-sm shadow-sm no-print relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAppPage("home")}
              className="p-2 rounded-xl bg-white border-2 border-amber-300 text-amber-900 hover:bg-amber-100 transition shadow-sm cursor-pointer"
              title="ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ"
            >
              ←
            </button>
            <RotatingSuryaKalachakra size={46} />
            <div>
              <div className="text-xs text-amber-800 font-serif font-bold uppercase tracking-wider">
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಹೋಟೆಲ್ ಪೋರ್ಟಲ್ ॥
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-950 font-serif">
                ಹೋಟೆಲ್ ಟೇಬಲ್ QR ಸ್ಟ್ಯಾಂಡ್ ಜನರೇಟರ್ (Hotel Table QR Stand Generator)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition"
            >
              <span>🖨️</span>
              <span>ಪ್ರಿಂಟ್ ಮಾಡಿ (Print)</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition"
            >
              {isExportingPdf ? (
                <span>PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
              ) : (
                <>
                  <span>📥</span>
                  <span>PDF ಡೌನ್‌ಲೋಡ್</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Settings & Generator Studio */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column: Settings & Controls (No Print) */}
        <div className="no-print space-y-5">
          <div className="bg-white/95 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2 border-b border-amber-200 pb-2">
              <span>⚙️</span>
              <span>ಹೋಟೆಲ್ ವಿವರಗಳು & ಕಾನ್ಫಿಗರೇಶನ್</span>
            </h2>

            {/* Hotel Name */}
            <div>
              <label className="block text-xs text-stone-700 font-semibold mb-1">
                ಹೋಟೆಲ್ ಹೆಸರು (Hotel Name) *
              </label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="ಉದಾ: ಶ್ರೀ ಕೃಷ್ಣ ಭವನ"
                className="w-full bg-[#FFFDF7] border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Hotel Tagline */}
            <div>
              <label className="block text-xs text-stone-700 font-semibold mb-1">
                ಹೋಟೆಲ್ ಟ್ಯಾಗ್‌ಲೈನ್ (Tagline / Cuisine)
              </label>
              <input
                type="text"
                value={hotelTagline}
                onChange={(e) => setHotelTagline(e.target.value)}
                placeholder="ಉದಾ: ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಉಪಹಾರ & ಭೋಜನ"
                className="w-full bg-[#FFFDF7] border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Target Host / Domain Configuration for Mobile QR Scanning */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-stone-700 font-semibold">
                  QR ಲಿಂಕ್ ಡೊಮೇನ್ (Target Domain / Host)
                </label>
                <span className="text-[10px] text-amber-900 font-mono font-bold">
                  {customBaseHost || (typeof window !== "undefined" ? window.location.origin : "Auto")}
                </span>
              </div>
              <input
                type="text"
                value={customBaseHost}
                onChange={(e) => setCustomBaseHost(e.target.value)}
                placeholder="ಖಾಲಿ ಬಿಟ್ಟರೆ: ಆಟೋ (ಅಥವಾ: http://192.168.0.116:5173)"
                className="w-full bg-[#FFFDF7] border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 font-mono"
              />
              <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCustomBaseHost("http://192.168.0.116:5173")}
                  className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-medium cursor-pointer"
                >
                  📱 ಮೊಬೈಲ್ Wi-Fi (192.168.0.116)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBaseHost("http://localhost:5173")}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-amber-50 text-stone-700 border border-amber-200 font-medium cursor-pointer"
                >
                  💻 Localhost
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBaseHost("https://baggona.com")}
                  className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-medium cursor-pointer"
                >
                  🌐 Production (baggona.com)
                </button>
                {customBaseHost && (
                  <button
                    type="button"
                    onClick={() => setCustomBaseHost("")}
                    className="px-2 py-0.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 cursor-pointer"
                  >
                    ✕ ರದ್ದು
                  </button>
                )}
              </div>
            </div>

            {/* Mode: Single vs Batch */}
            <div>
              <label className="block text-xs text-stone-700 font-semibold mb-1">
                ರಚನೆಯ ವಿಧಾನ (Generation Mode)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGenerationMode("single")}
                  className={`py-2 px-3 rounded-xl border-2 font-bold transition cursor-pointer ${
                    generationMode === "single"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಒಂದೇ ಟೇಬಲ್ (Single Table)
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode("batch")}
                  className={`py-2 px-3 rounded-xl border-2 font-bold transition cursor-pointer ${
                    generationMode === "batch"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಎಲ್ಲಾ ಟೇಬಲ್‌ಗಳು (Batch 1-N)
                </button>
              </div>
            </div>

            {/* Single Table Input */}
            {generationMode === "single" ? (
              <div>
                <label className="block text-xs text-stone-700 font-semibold mb-1">
                  ಟೇಬಲ್ ಸಂಖ್ಯೆ (Table Number / Label)
                </label>
                <input
                  type="text"
                  value={singleTableNumber}
                  onChange={(e) => setSingleTableNumber(e.target.value)}
                  placeholder="ಉದಾ: 1 ಅಥವಾ VIP 1"
                  className="w-full bg-[#FFFDF7] border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-stone-700 font-semibold mb-1">
                    ಪ್ರಾರಂಭದ ಟೇಬಲ್ (From)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={batchStart}
                    onChange={(e) => setBatchStart(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#FFFDF7] border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-700 font-semibold mb-1">
                    ಅಂತಿಮ ಟೇಬಲ್ (To)
                  </label>
                  <input
                    type="number"
                    min={batchStart}
                    max={batchStart + 50}
                    value={batchEnd}
                    onChange={(e) => setBatchEnd(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-[#FFFDF7] border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Card Format Selector */}
            <div>
              <label className="block text-xs text-stone-700 font-semibold mb-1">
                ಕಾರ್ಡ್ ಮಾದರಿ (Card Format)
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCardFormat("table_tent")}
                  className={`py-2 px-1 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    cardFormat === "table_tent"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಮಡಚುವ ಟೆಂಟ್ (Foldable)
                </button>
                <button
                  type="button"
                  onClick={() => setCardFormat("acrylic_insert")}
                  className={`py-2 px-1 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    cardFormat === "acrylic_insert"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಅಕ್ರಿಲಿಕ್ ಸ್ಟ್ಯಾಂಡ್ (A5 Stand)
                </button>
                <button
                  type="button"
                  onClick={() => setCardFormat("compact_sticker")}
                  className={`py-2 px-1 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    cardFormat === "compact_sticker"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಸ್ಟಿಕ್ಕರ್ (Sticker)
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs text-stone-700 font-semibold mb-1">
                ಕಾರ್ಡ್ ಭಾಷೆ (Card Language)
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCardLang("bilingual")}
                  className={`py-1.5 rounded-xl border font-semibold cursor-pointer ${
                    cardLang === "bilingual"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಕನ್ನಡ + English
                </button>
                <button
                  type="button"
                  onClick={() => setCardLang("kn")}
                  className={`py-1.5 rounded-xl border font-semibold cursor-pointer ${
                    cardLang === "kn"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  ಕನ್ನಡ ಮಾತ್ರ
                </button>
                <button
                  type="button"
                  onClick={() => setCardLang("en")}
                  className={`py-1.5 rounded-xl border font-semibold cursor-pointer ${
                    cardLang === "en"
                      ? "bg-amber-400 text-stone-950 border-amber-500 shadow-sm"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400"
                  }`}
                >
                  English Only
                </button>
              </div>
            </div>

            {/* Re-generate button with Astrological Screen Loader */}
            <button
              type="button"
              onClick={() => void generateAllCards(true)}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-md hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
            >
              {isGenerating ? "QR ಕೋಡ್ ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "🔄 QR ಕೋಡ್ ಅಪ್ಡೇಟ್ ಮಾಡಿ"}
            </button>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-2 text-stone-800 shadow-md">
            <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
              <span>💡</span>
              <span>ಹೋಟೆಲ್ ಟೇಬಲ್ QR ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-stone-700">
              <li>ಈ ಕಾರ್ಡ್‌ಗಳನ್ನು ಪ್ರಿಂಟ್ ಮಾಡಿ ಹೋಟೆಲ್‌ನ ಪ್ರತಿ ಟೇಬಲ್ ಮೇಲೆ ಇರಿಸಿ.</li>
              <li>ಗ್ರಾಹಕರು ಊಟಕ್ಕೆ ಕಾಯುವ ಸಮಯದಲ್ಲಿ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತಾರೆ.</li>
              <li>ಅವರ ಜನ್ಮ ವಿವರ ನೀಡಿ ೧-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಅಂತರಂಗದ ಗುಪ್ತ ಸತ್ಯವನ್ನು ಉಚಿತವಾಗಿ ತಿಳಿಯುತ್ತಾರೆ.</li>
              <li>ನಂತರ ಸಂಪೂರ್ಣ ೫ ವರ್ಷಗಳ ಜಾತಕಕ್ಕಾಗಿ ₹೩೫೦ ಪಾವತಿಸಿ ತಕ್ಷಣ iPhone/ಮೊಬೈಲ್‌ನಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳುತ್ತಾರೆ!</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Live Interactive Printable Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="no-print flex items-center justify-between border-b border-amber-300 pb-2">
            <span className="text-xs font-bold text-amber-950">
              ಲೈವ್ ಮುದ್ರಣ ಪೂರ್ವವೀಕ್ಷಣೆ (Live Printable Preview): {generatedCards.length} ಟೇಬಲ್ ಕಾರ್ಡ್‌ಗಳು
            </span>
            <div className="text-xs text-stone-600 font-medium">
              ಕಾಗದದ ಗಾತ್ರ: <span className="text-amber-900 font-mono font-bold">A4 / A5</span>
            </div>
          </div>

          {/* Print Container holding all generated cards */}
          <div id="print-area" ref={printContainerRef} className="space-y-8">
            {generatedCards.map((card, idx) => (
              <div
                key={String(card.tableNumber)}
                className={`hotel-table-card page-break-after bg-[#FFFBEB] text-[#1c1917] font-serif border-4 border-amber-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-w-lg mx-auto ${
                  cardFormat === "compact_sticker" ? "max-w-xs p-4" : ""
                }`}
                style={{
                  backgroundImage: "radial-gradient(#FDE68A 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}
              >
                {/* Traditional Sacred Top Border */}
                <div className="text-center pb-2 border-b-2 border-amber-800/40">
                  <div className="text-[11px] text-amber-900 font-bold tracking-widest uppercase">
                    ॥ ಶ್ರೀ ಮಹಾಗಣಪತಯೇ ನಮಃ · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ ॥
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-950 tracking-wide mt-1">
                    {hotelName}
                  </h2>
                  {hotelTagline && (
                    <div className="text-xs text-amber-800 font-medium">
                      {hotelTagline}
                    </div>
                  )}
                </div>

                {/* Table Number Ribbon */}
                <div className="text-center my-3">
                  <span className="inline-block px-4 py-1 rounded-full bg-amber-700 text-amber-50 text-xs sm:text-sm font-black tracking-wider uppercase shadow">
                    ಟೇಬಲ್ ಸಂಖ್ಯೆ (Table No): {card.tableNumber}
                  </span>
                </div>

                {/* Main Enticing Hook Header */}
                <div className="text-center space-y-1 mb-4">
                  <h3 className="text-lg sm:text-xl font-black text-red-950 font-serif leading-tight">
                    ಊಟ ಮಾಡುವ ಮುನ್ನ ನಿಮ್ಮ ಅಂತರಂಗದ ಸತ್ಯ ತಿಳಿಯಿರಿ!
                  </h3>
                  <p className="text-xs text-amber-900 font-sans font-semibold">
                    (Waiting for your food? Scan to reveal what's hidden in your mind & heart - 100% Free!)
                  </p>
                </div>

                {/* Prominent High-Contrast Scannable QR Code */}
                <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-amber-700/50 rounded-2xl shadow-md my-2 max-w-[260px] mx-auto">
                  <img
                    src={card.qrDataUrl}
                    alt={`Table ${card.tableNumber} QR Code`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                  <div className="mt-2 text-[11px] font-sans font-bold text-stone-800 tracking-wide text-center">
                    📸 ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (Scan with Camera)
                  </div>
                </div>

                {/* 3-Step Simple Instructions */}
                <div className="bg-amber-100/90 border border-amber-800/30 rounded-xl p-3 my-3 text-xs text-amber-950 font-sans space-y-1">
                  <div className="font-bold text-center text-amber-900 mb-1">
                    ೩ ಸುಲಭ ಹಂತಗಳಲ್ಲಿ (3 Simple Steps):
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px] sm:text-[11px]">
                    <div className="p-1 rounded bg-white/70">
                      <span className="block font-bold text-amber-900">೧. ಸ್ಕ್ಯಾನ್ ಮಾಡಿ</span>
                      <span className="text-stone-600">Scan QR Code</span>
                    </div>
                    <div className="p-1 rounded bg-white/70">
                      <span className="block font-bold text-amber-900">೨. ಜನ್ಮ ಸಮಯ ನೀಡಿ</span>
                      <span className="text-stone-600">Enter Birth Time</span>
                    </div>
                    <div className="p-1 rounded bg-white/70">
                      <span className="block font-bold text-amber-900">೩. ಸತ್ಯ ತಿಳಿಯಿರಿ</span>
                      <span className="text-stone-600">Get Dark Secret!</span>
                    </div>
                  </div>
                </div>

                {/* Footer Trust Seal */}
                <div className="text-center pt-2 border-t border-amber-800/30 text-[10px] text-amber-900 font-sans">
                  <div>ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದೈವಜ್ಞ ಪೀಠ · ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ</div>
                  <div className="text-stone-600 text-[9px] mt-0.5">
                    100% Authentic Vedic Astrology Calculation • Instant & Private
                  </div>
                </div>

                {/* No-print Actions bar on card */}
                <div className="no-print mt-4 pt-3 border-t border-amber-300 flex items-center justify-between text-xs">
                  <a
                    href={card.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>👁️</span>
                    <span>ಗ್ರಾಹಕರ ಸ್ಕ್ರೀನ್ ಪರೀಕ್ಷಿಸಿ (Test Customer Screen)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(card.targetUrl);
                      setCopiedLink(String(card.tableNumber));
                      setTimeout(() => setCopiedLink(null), 2000);
                    }}
                    className="px-2 py-1 bg-amber-200 text-amber-900 rounded font-semibold text-[11px] hover:bg-amber-300"
                  >
                    {copiedLink === String(card.tableNumber) ? "✓ ಲಿಂಕ್ ನಕಲಿಸಿದೆ" : "📋 ಲಿಂಕ್ ಕಾಪಿ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Screen Astrological Screen Loader for Hotel Table QR Operations */}
      <AntarangaAstrologicalScreenLoader
        isOpen={screenLoaderOpen}
        stage={screenLoaderStage}
        lang={cardLang === "en" ? "en" : "kn"}
        progressPercent={screenLoaderProgress}
      />
    </div>
  );
}
