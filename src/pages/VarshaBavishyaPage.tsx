import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RASHIS, type Rashi } from "../core/AstroTypes";
import { calculateVarshaBavishya, type VarshaPrediction } from "../core/VarshaBavishyaEngine";
import {
  getBaggonaVarshaBhavishyaForYear,
  toKannadaDigits,
  ALL_27_NAKSHATRAS_BAGGONA,
  getBaggonaRashiIndexForNakshatra,
  type BaggonaNakshatraInfo,
  type BaggonaVarshaRashiPayload,
  type BaggonaYearlyBhavishyaResult
} from "../core/BaggonaVarshaBhavishyaEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../features/audio/aiVoiceCloneEngine";
import type { SevaLang } from "../features/seva/sevaLocale";
import { generatePDFFromElement } from "../utils/pdfGenerator";

const RASHI_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export default function VarshaBavishyaPage() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<"all" | "single">("all");
  const [selectedRashi, setSelectedRashi] = useState<number>(0);
  const [selectedNakshatra, setSelectedNakshatra] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<VarshaPrediction | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelAudioRef = useRef<(() => void) | null>(null);

  const singleContentRef = useRef<HTMLDivElement>(null);

  // Compute authentic Baggona 12-Rashi yearly data whenever selectedYear changes
  const yearlyData: BaggonaYearlyBhavishyaResult = useMemo(() => {
    return getBaggonaVarshaBhavishyaForYear(selectedYear);
  }, [selectedYear]);

  // When switching to single rashi or changing year, update prediction
  useEffect(() => {
    const calc = calculateVarshaBavishya(selectedYear, selectedRashi);
    setPrediction(calc);
  }, [selectedYear, selectedRashi]);

  useEffect(() => {
    return () => {
      if (cancelAudioRef.current) {
        cancelAudioRef.current();
        cancelAudioRef.current = null;
      }
      stopClonedAudio();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSelectNakshatra = (nakIndex: number) => {
    setSelectedNakshatra(nakIndex);
    const nak = ALL_27_NAKSHATRAS_BAGGONA[nakIndex];
    if (nak) {
      setSelectedRashi(nak.rashiIndex);
    }
  };

  const handlePlayAudio = () => {
    if (!prediction) return;

    if (isSpeaking) {
      if (cancelAudioRef.current) {
        cancelAudioRef.current();
        cancelAudioRef.current = null;
      }
      stopClonedAudio();
      setIsSpeaking(false);
      return;
    }

    const currentRashiPayload = yearlyData.rashis[selectedRashi];
    const fullText = currentRashiPayload
      ? `${currentRashiPayload.titleKn}. ${currentRashiPayload.bookParagraph1Kn} ${currentRashiPayload.bookParagraph2Kn} ಶಾಂತಿ ಪರಿಹಾರ: ${currentRashiPayload.shantiPariharaKn}`
      : prediction.paragraphs.flat().map((p) => t(p)).join(". ");

    const rawLang = (i18n.language || "kn").split("-")[0].toLowerCase();
    const cleanLang: SevaLang = (["kn", "hi", "te", "ta", "en"].includes(rawLang)
      ? rawLang
      : "kn") as SevaLang;

    setIsSpeaking(true);
    void synthesizeAndPlayClonedVoice(
      fullText,
      cleanLang,
      "voice_sriram_pandit",
      () => {
        setIsSpeaking(false);
        cancelAudioRef.current = null;
      },
      () => {
        setIsSpeaking(true);
      }
    ).then((cancelFn) => {
      cancelAudioRef.current = cancelFn;
    });
  };

  const handleDownloadSinglePdf = async () => {
    if (!singleContentRef.current || !prediction) return;

    try {
      const canvas = await html2canvas(singleContentRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(pdfHeight, 287));
      pdf.save(`Baggona_Varsha_Bhavishya_${prediction.year}_${prediction.rashi.english}.pdf`);
    } catch (e) {
      console.error("Failed to generate Single Rashi PDF", e);
    }
  };

  const handleDownloadCompleteBookPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const fileName = `Baggona_12_Rashi_Varsha_Bhavishya_${yearlyData.shakaYear}_${yearlyData.samvatsaraEn}.pdf`;
      await generatePDFFromElement("baggona-complete-12-rashi-pdf-book", fileName, true);
    } catch (e) {
      console.error("Failed to generate complete 12-Rashi PDF", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const domainIcons = ["✨", "💼", "🩺", "🕉️"];
  const domainTitles = [
    t("varsha.section_overview", "Cosmic Overview (ಗ್ರಹ ಸಂಚಾರ & ಆದಾಯ)"),
    t("varsha.section_career", "Career & Finance (ವೃತ್ತಿ & ಆರ್ಥಿಕತೆ)"),
    t("varsha.section_health", "Health & Relationships (ಆರೋಗ್ಯ & ಕೌಟುಂಬಿಕ)"),
    t("varsha.section_remedies", "Spiritual Remedies (ಶಾಂತಿ-ಪರಿಹಾರ)")
  ];

  const currentRashiPayload = yearlyData.rashis[selectedRashi];

  // Group the 12 Rashis into 6 pairs (Pages 1 to 6) exactly matching Pages 20 to 25 of Baggona Panchanga Book
  const bookPagePairs = [
    { pageNum: 1, rashis: [yearlyData.rashis[0], yearlyData.rashis[1]], title: "ಮೇಷ & ವೃಷಭ ರಾಶಿಗಳು" },
    { pageNum: 2, rashis: [yearlyData.rashis[2], yearlyData.rashis[3]], title: "ಮಿಥುನ & ಕರ್ಕಾಟಕ ರಾಶಿಗಳು" },
    { pageNum: 3, rashis: [yearlyData.rashis[4], yearlyData.rashis[5]], title: "ಸಿಂಹ & ಕನ್ಯಾ ರಾಶಿಗಳು" },
    { pageNum: 4, rashis: [yearlyData.rashis[6], yearlyData.rashis[7]], title: "ತುಲಾ & ವೃಶ್ಚಿಕ ರಾಶಿಗಳು" },
    { pageNum: 5, rashis: [yearlyData.rashis[8], yearlyData.rashis[9]], title: "ಧನು & ಮಕರ ರಾಶಿಗಳು" },
    { pageNum: 6, rashis: [yearlyData.rashis[10], yearlyData.rashis[11]], title: "ಕುಂಭ & ಮೀನ ರಾಶಿಗಳು" }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* ── CSS PRINT RULES (Ensures 100% border safety and clean A4 pagination) ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #baggona-complete-12-rashi-pdf-book,
          #baggona-complete-12-rashi-pdf-book * {
            visibility: visible !important;
          }
          #baggona-complete-12-rashi-pdf-book {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            opacity: 1 !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            z-index: 999999 !important;
            background: #ffffff !important;
          }
          .pdf-page {
            display: flex !important;
            flex-direction: column !important;
            justifyContent: space-between !important;
            width: 100% !important;
            max-width: 195mm !important;
            min-height: 272mm !important;
            box-sizing: border-box !important;
            border: 2px solid #78350f !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 auto 12mm auto !important;
            padding: 12mm 10mm !important;
            background: #ffffff !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      {/* ── TOP HERO HEADER & YEAR CONTROLS ── */}
      <Card className="p-6 border-2 border-amber-600/30 bg-gradient-to-br from-[#fffdf8] via-[#fefbf0] to-[#fff8e7] shadow-lg rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Kshetra Holy Title */}
        <div className="text-center pb-3 border-b border-amber-500/20">
          <div className="text-xs sm:text-sm font-black text-amber-800 tracking-wider">
            ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನಃ ॥
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1 font-serif">
            ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಂವತ್ಸರ ಫಲಂ ॥
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 font-serif">
            ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ • ಆದಾಯ-ವ್ಯಯ, ರಾಜಪೂಜ್ಯ-ಅವಮಾನ ಹಾಗೂ ಗೋಕರ್ಣ ಶಾಂತಿ-ಪರಿಹಾರ
          </p>
        </div>

        {/* Year Selector & Samvatsara Badge */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Year Controls */}
          <div>
            <label className="block text-xs font-black text-indigo-900/70 uppercase tracking-wider mb-1.5">
              ಸಂವತ್ಸರ ವರ್ಷ ಆಯ್ಕೆ (Select Year)
            </label>
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-amber-300 shadow-sm">
              <button
                onClick={() => setSelectedYear((y) => y - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-lg transition-colors border border-amber-200"
                title="ಹಿಂದಿನ ವರ್ಷ"
              >
                ◀
              </button>
              <div className="flex-1 text-center font-black text-xl text-indigo-950">
                {selectedYear}
              </div>
              <button
                onClick={() => setSelectedYear((y) => y + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-lg transition-colors border border-amber-200"
                title="ಮುಂದಿನ ವರ್ಷ"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Samvatsara Metadata Badge */}
          <div className="md:col-span-2 bg-amber-50/70 border border-amber-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 font-serif">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                ಸಂವತ್ಸರ & ಶಕ ವರ್ಷ
              </span>
              <span className="text-base sm:text-lg font-black text-amber-950">
                ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ ({yearlyData.samvatsaraEn})
              </span>
              <span className="text-xs font-bold text-slate-600 block">
                ಶಕ ವರ್ಷ {yearlyData.shakaYear} • ಕ್ರಿ.ಶ {yearlyData.gregorianYears}
              </span>
            </div>

            {/* Quick Year Jump Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { year: 2024, name: "ಕ್ರೋಧಿ" },
                { year: 2025, name: "ವಿಶ್ವಾವಸು" },
                { year: 2026, name: "ಪರಾಭವ" },
                { year: 2027, name: "ಪ್ಲವಂಗ" },
                { year: 2028, name: "ಕೀಲಕ" }
              ].map((item) => (
                <button
                  key={item.year}
                  onClick={() => setSelectedYear(item.year)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    selectedYear === item.year
                      ? "bg-amber-800 text-white border-amber-900 shadow-sm"
                      : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                  }`}
                >
                  {item.year} {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── NAKSHATRA NAVIGATOR (All 27 Janma Nakshatras) ── */}
        <div className="mt-4 pt-3 border-t border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-900/80 uppercase tracking-wide flex items-center gap-1.5">
              <span>✨</span>
              <span>ಜನ್ಮ ನಕ್ಷತ್ರದಂತೆ ಫಲ ಶೋಧನೆ (Search by Janma Nakshatra - 27 Nakshatras):</span>
            </span>
            {selectedNakshatra !== null && (
              <button
                onClick={() => setSelectedNakshatra(null)}
                className="text-[10px] text-amber-800 hover:underline font-bold"
              >
                ಆಯ್ಕೆ ರದ್ದು (Clear Selection)
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-amber-50/50 rounded-xl border border-amber-200">
            {ALL_27_NAKSHATRAS_BAGGONA.map((nak) => (
              <button
                key={nak.index}
                onClick={() => handleSelectNakshatra(nak.index)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  selectedNakshatra === nak.index
                    ? "bg-amber-800 text-white border-amber-900 shadow-sm"
                    : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100/60"
                }`}
              >
                {nak.nameKn}
              </button>
            ))}
          </div>
          {selectedNakshatra !== null && (
            <div className="mt-2 text-xs font-bold text-amber-900 bg-amber-100/80 p-2.5 rounded-lg border border-amber-300 flex flex-wrap items-center justify-between gap-2">
              <span>
                🌟 ಆಯ್ಕೆ: <strong>{ALL_27_NAKSHATRAS_BAGGONA[selectedNakshatra]?.nameKn}</strong> ({ALL_27_NAKSHATRAS_BAGGONA[selectedNakshatra]?.rashiNameKn} ರಾಶಿ) • {ALL_27_NAKSHATRAS_BAGGONA[selectedNakshatra]?.padasKn} • ಆರಾಧ್ಯ ದೇವತೆ: {ALL_27_NAKSHATRAS_BAGGONA[selectedNakshatra]?.deityKn}
              </span>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950 font-mono">
                {yearlyData.rashis[ALL_27_NAKSHATRAS_BAGGONA[selectedNakshatra]!.rashiIndex]?.badgeKn}
              </span>
            </div>
          )}
        </div>

        {/* View Mode Switcher & Top Action Buttons */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 p-1 bg-amber-100/60 rounded-xl border border-amber-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === "all"
                  ? "bg-indigo-950 text-white shadow-md"
                  : "text-indigo-950 hover:bg-amber-200/50"
              }`}
            >
              📖 ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ಪಂಚಾಂಗ ದರ್ಶನ (All 12 Rashis)
            </button>
            <button
              onClick={() => setActiveTab("single")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === "single"
                  ? "bg-indigo-950 text-white shadow-md"
                  : "text-indigo-950 hover:bg-amber-200/50"
              }`}
            >
              🔍 ಏಕ ರಾಶಿ ವಿಸ್ತೃತ ದರ್ಶನ (Single Rashi Deep Dive)
            </button>
          </div>

          {/* Action Buttons: Native Print & PDF Download */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBrowserPrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all active:scale-95"
              title="A4 ಪೂರ್ಣ ಪುಸ್ತಕ ಮುದ್ರಣ (Print A4 Booklet)"
            >
              <span>🖨️</span>
              <span>ಪುಟ ಮುದ್ರಣ (Print A4)</span>
            </button>
            <button
              onClick={handleDownloadCompleteBookPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              title="೧೨ ರಾಶಿಗಳ ಸಮಗ್ರ ಪುಸ್ತಕ PDF ಡೌನ್‌ಲೋಡ್"
            >
              <span>{isGeneratingPdf ? "⏳" : "📥"}</span>
              <span>
                {isGeneratingPdf
                  ? "ಪುಸ್ತಕ ಮುದ್ರಣವಾಗುತ್ತಿದೆ..."
                  : `೧೨ ರಾಶಿಗಳ ಪುಸ್ತಕ PDF (${yearlyData.samvatsaraKn})`}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* ── TAB 1: ALL 12 RASHIS (BAGGONA PANCHANGA 104-PAGE BOOK LAYOUT) ── */}
      {activeTab === "all" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-amber-900 text-amber-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm font-serif">
            <span>
              ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ಪಂಚಾಂಗ ಫಲಂ (ಮೇಷದಿಂದ ಮೀನದವರೆಗೆ)
            </span>
            <span className="hidden sm:inline text-amber-200 text-xs">
              ಆದಾಯ, ವ್ಯಯ, ರಾಜಪೂಜ್ಯ, ಅವಮಾನ ಗಣಿತ
            </span>
          </div>

          {/* 12-Rashi Responsive Grid (2 columns like classical Panchanga spreads) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yearlyData.rashis.map((rashi, idx) => {
              const isNakshatraMatched = selectedNakshatra !== null && ALL_27_NAKSHATRAS_BAGGONA[selectedNakshatra]?.rashiIndex === idx;

              return (
                <div
                  key={idx}
                  className={`border-2 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between font-serif relative overflow-hidden ${
                    isNakshatraMatched
                      ? "border-amber-600 ring-2 ring-amber-400 bg-amber-50/20"
                      : "border-amber-900/20"
                  }`}
                >
                  <div>
                    {/* Rashi Header with Symbol, Title & Kannada Numerals Badge */}
                    <div className="flex items-center justify-between border-b-2 border-amber-900 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-amber-800">{RASHI_SYMBOLS[idx]}</span>
                        <div>
                          <h3 className="font-black text-base text-indigo-950">
                            {rashi.titleKn}
                          </h3>
                          <div className="text-[10px] font-bold text-slate-500">
                            ನಕ್ಷತ್ರ ಪಾದಗಳು: {rashi.nakshatraPadasKn}
                          </div>
                        </div>
                      </div>
                      {isNakshatraMatched && (
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          ✨ ನಿಮ್ಮ ನಕ್ಷತ್ರ
                        </span>
                      )}
                    </div>

                    {/* Aaya-Vyaya Classical Badge */}
                    <div className="bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 mb-2.5 flex items-center justify-between text-xs font-mono font-bold text-amber-950">
                      <span>{rashi.badgeKn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                          rashi.aaya > rashi.vyaya
                            ? "bg-emerald-100 text-emerald-800"
                            : rashi.aaya < rashi.vyaya
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {rashi.aaya > rashi.vyaya ? "ಲಾಭದಾಯಕ" : rashi.aaya < rashi.vyaya ? "ಮಿತವ್ಯಯ" : "ಸಮತೋಲನ"}
                      </span>
                    </div>

                    {/* Spiritual & Lucky Factors Row */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px] bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2.5">
                      <div><strong className="text-amber-900">ದೇವತೆ:</strong> {rashi.deityKn}</div>
                      <div><strong className="text-amber-900">ರತ್ನ:</strong> {rashi.gemstoneKn}</div>
                      <div><strong className="text-amber-900">ಅದೃಷ್ಟ ಸಂಖ್ಯೆ:</strong> {rashi.luckyNumber}</div>
                      <div><strong className="text-amber-900">ಬಣ್ಣ:</strong> {rashi.luckyColorKn}</div>
                    </div>

                    {/* Transit Badges (Guru Bala & Shani Phase) */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rashi.hasGuruBala
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        {rashi.hasGuruBala
                          ? `✨ ಗುರು ಬಲವಿದೆ (${rashi.guruHouse}ನೇ ಭಾವ)`
                          : `ಗುರು ಸಂಚಾರ (${rashi.guruHouse}ನೇ ಭಾವ)`}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rashi.shaniPhase === "subha"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : rashi.shaniPhase === "ashtama" || rashi.shaniPhase === "sade_sati"
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-slate-50 text-slate-700 border-slate-300"
                        }`}
                      >
                        {rashi.shaniPhaseLabelKn}
                      </span>
                    </div>

                    {/* Authentic Baggona Literary Paragraphs */}
                    <p className="text-[12.5px] leading-relaxed text-slate-800 text-justify mb-2">
                      {rashi.bookParagraph1Kn}
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-slate-800 text-justify">
                      {rashi.bookParagraph2Kn}
                    </p>
                  </div>

                  {/* Shanti-Parihara & Deep Dive Action */}
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="bg-amber-50/80 p-2 rounded-lg border border-amber-200 text-xs font-bold text-amber-950 mb-2">
                      <span className="text-amber-800 font-black">ಶಾಂತಿ-ಪರಿಹಾರ: </span>
                      {rashi.shantiPariharaKn}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedRashi(idx);
                          setActiveTab("single");
                        }}
                        className="text-xs font-black text-indigo-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
                      >
                        <span>ವಿಸ್ತೃತ ದರ್ಶನ & ಶ್ರವಣ (Audio & Deep Dive)</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: SINGLE RASHI DEEP DIVE WITH AUDIO NARRATION ── */}
      {activeTab === "single" && (
        <div className="space-y-6">
          {/* Single Rashi Selector Bar */}
          <Card className="p-4 bg-white border border-amber-200 shadow-sm rounded-xl">
            <label className="block text-xs font-black text-indigo-900/70 uppercase tracking-wider mb-2">
              ರಾಶಿ ಆಯ್ಕೆಮಾಡಿ (Select Rashi)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {RASHIS.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedRashi(idx)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center border transition-all ${
                    selectedRashi === idx
                      ? "bg-indigo-950 text-white border-indigo-950 shadow-md scale-102"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50"
                  }`}
                >
                  <span className="text-sm">{RASHI_SYMBOLS[idx]}</span>
                  <span>{r.sanskrit}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Action Bar for Single Rashi */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/80 border border-amber-200 p-3 rounded-xl">
            <div className="font-serif">
              <span className="text-xs font-bold text-amber-800 block">ಆಯ್ಕೆ ಮಾಡಿದ ರಾಶಿ</span>
              <span className="text-lg font-black text-indigo-950">
                {currentRashiPayload?.titleKn}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePlayAudio}
                className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-black rounded-lg shadow-sm transition-all ${
                  isSpeaking ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-900 hover:bg-indigo-950"
                }`}
              >
                <span>{isSpeaking ? "⏹️" : "🔊"}</span>
                <span>{isSpeaking ? "ಶ್ರವಣ ನಿಲ್ಲಿಸಿ (Stop Audio)" : "ಶ್ರೀರಾಮ ಪಂಡಿತ್ ವಾಣಿಯಲ್ಲಿ ಶ್ರವಣ (Play Audio)"}</span>
              </button>
              <button
                onClick={handleDownloadSinglePdf}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-lg shadow-sm transition-all"
              >
                <span>📥</span>
                <span>PDF ಡೌನ್‌ಲೋಡ್</span>
              </button>
            </div>
          </div>

          {/* Printable Report Section for Single Rashi */}
          <div
            ref={singleContentRef}
            className="space-y-6 bg-[#fffdf9] p-6 sm:p-8 rounded-2xl border-2 border-amber-900/20 shadow-sm font-serif"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-amber-900/30">
              <div className="text-xs font-bold text-amber-800">
                ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನಃ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1">
                ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • {currentRashiPayload?.titleKn} ಫಲಂ
              </h2>
              <div className="text-xs text-slate-600 mt-1">
                ಶಕ ವರ್ಷ {yearlyData.shakaYear} • ಕ್ರಿ.ಶ {yearlyData.gregorianYears} • ನಕ್ಷತ್ರ ಪಾದಗಳು:{" "}
                {currentRashiPayload?.nakshatraPadasKn}
              </div>

              {/* Aaya-Vyaya & Rajapujya-Avamana Banner */}
              <div className="inline-block mt-3 bg-amber-100 border-2 border-amber-800 px-4 py-1.5 rounded-xl text-sm font-mono font-black text-amber-950 shadow-sm">
                {currentRashiPayload?.badgeKn}
              </div>
            </div>

            {/* Spiritual & Lucky Attributes Card */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
                ಆಧ್ಯಾತ್ಮಿಕ ಹಾಗೂ ದೈವಿಕ ಅಂಶಗಳು (Divine & Lucky Elements)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="font-bold text-slate-500">ಆರಾಧ್ಯ ದೇವತೆ:</span> <span className="font-black text-slate-900 block">{currentRashiPayload?.deityKn}</span></div>
                <div><span className="font-bold text-slate-500">ಶುಭ ರತ್ನ:</span> <span className="font-black text-slate-900 block">{currentRashiPayload?.gemstoneKn}</span></div>
                <div><span className="font-bold text-slate-500">ಅದೃಷ್ಟ ಸಂಖ್ಯೆ:</span> <span className="font-black text-slate-900 block">{currentRashiPayload?.luckyNumber}</span></div>
                <div><span className="font-bold text-slate-500">ಅದೃಷ್ಟ ಬಣ್ಣ:</span> <span className="font-black text-slate-900 block">{currentRashiPayload?.luckyColorKn}</span></div>
                <div><span className="font-bold text-slate-500">ಶುಭ ದಿಕ್ಕು:</span> <span className="font-black text-slate-900 block">{currentRashiPayload?.luckyDirectionKn}</span></div>
                <div><span className="font-bold text-slate-500">ಸಿದ್ಧ ಮಂತ್ರ:</span> <span className="font-black text-amber-900 block">{currentRashiPayload?.siddhaMantraKn}</span></div>
              </div>
            </div>

            {/* Aaya vs Vyaya Visual Balance Meter */}
            <div className="bg-white p-4 rounded-xl border border-amber-200">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>ಆದಾಯ (Income): {currentRashiPayload?.aayaKn} ({currentRashiPayload?.aaya})</span>
                <span>ವ್ಯಯ (Expense): {currentRashiPayload?.vyayaKn} ({currentRashiPayload?.vyaya})</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div
                  className="bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold"
                  style={{
                    width: `${
                      ((currentRashiPayload?.aaya || 1) /
                        ((currentRashiPayload?.aaya || 1) + (currentRashiPayload?.vyaya || 1))) *
                      100
                    }%`
                  }}
                >
                  ಆದಾಯ
                </div>
                <div
                  className="bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold"
                  style={{
                    width: `${
                      ((currentRashiPayload?.vyaya || 1) /
                        ((currentRashiPayload?.aaya || 1) + (currentRashiPayload?.vyaya || 1))) *
                      100
                    }%`
                  }}
                >
                  ವ್ಯಯ
                </div>
              </div>
            </div>

            {/* 4 Domain Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction?.paragraphs.map((paraSection, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-amber-500/20 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 text-lg">
                      {domainIcons[i] || "🌟"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-wide">
                      {domainTitles[i]}
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 text-justify">
                    {i === 0 && <p>{currentRashiPayload?.bookParagraph1Kn}</p>}
                    {i === 1 && (
                      <p>
                        ಆದಾಯ {currentRashiPayload?.aayaKn} ಹಾಗೂ ವ್ಯಯ {currentRashiPayload?.vyayaKn}. ರಾಜಪೂಜ್ಯ {currentRashiPayload?.rajapujyaKn} ಮತ್ತು ಅವಮಾನ {currentRashiPayload?.avamanaKn}. ಕೃಷಿಕರಿಗೆ ಅಡಿಕೆ, ಭತ್ತ, ತೆಂಗು ಬೆಳೆಗಳಲ್ಲಿ ಸಮೃದ್ಧ ಇಳುವರಿ. ವ್ಯಾಪಾರಸ್ಥರಿಗೆ ಹೊಸ ಮಾರುಕಟ್ಟೆ ವಿಸ್ತರಣೆ.
                      </p>
                    )}
                    {i === 2 && <p>{currentRashiPayload?.bookParagraph2Kn}</p>}
                    {i === 3 && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold text-amber-950">
                        {currentRashiPayload?.shantiPariharaKn}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-slate-500 italic pt-3 border-t border-slate-200">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿರ್ವಿಜ್ಞಾನ ಮಂಡಳಿ • ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ • ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು
            </div>
          </div>
        </div>
      )}

      {/* ── OFF-SCREEN PRINTABLE CONTAINER FOR 12-RASHI COMPLETE BOOK PDF ── */}
      {/* Strictly complies with baggona-pdf-layout-guard: .pdf-page vertical blocks, left: 0, top: 0 */}
      <div
        id="baggona-complete-12-rashi-pdf-book"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "900px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          height: 0,
          backgroundColor: "#FFFDF7",
          color: "#000000",
          fontFamily: "serif"
        }}
      >
        {bookPagePairs.map((pair, pageIdx) => (
          <div
            key={pageIdx}
            className="pdf-page"
            style={{
              width: "900px",
              minHeight: "1272px",
              padding: "24px 28px",
              boxSizing: "border-box",
              backgroundColor: "#FFFDF7",
              border: "4px double #78350f",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              {/* Classical Top Kshetra Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #78350f", paddingBottom: "8px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#92400e" }}>॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನಃ ॥</div>
                <div style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "1px", color: "#451a03" }}>
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ ॥
                </div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350f", marginTop: "3px" }}>
                  ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {yearlyData.shakaYear} (ಕ್ರಿ.ಶ {yearlyData.gregorianYears}) • {pair.title} • ಪುಟ {pair.pageNum}
                </div>
              </div>

              {/* 2 Rashis Dual Column Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {pair.rashis.map((r, rIdx) => (
                  <div key={rIdx} style={{ border: "1.5px solid #78350f", padding: "12px", backgroundColor: "#ffffff", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #78350f", paddingBottom: "5px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "bold", color: "#451a03" }}>{r.titleKn}</span>
                      <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: "bold", background: "#fef3c7", padding: "2px 6px", border: "1px solid #d97706", borderRadius: "4px" }}>
                        {r.badgeKn}
                      </span>
                    </div>

                    <div style={{ fontSize: "9px", fontWeight: "bold", color: "#b45309", marginBottom: "6px", background: "#fffbeb", padding: "3px 6px", borderRadius: "4px", border: "1px solid #fde68a" }}>
                      ✨ ನಕ್ಷತ್ರ ಪಾದಗಳು: {r.nakshatraPadasKn}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "8.5px", background: "#f8fafc", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "4px", marginBottom: "8px" }}>
                      <div><strong>ಆರಾಧ್ಯ ದೇವತೆ:</strong> {r.deityKn}</div>
                      <div><strong>ಶುಭ ರತ್ನ:</strong> {r.gemstoneKn}</div>
                      <div><strong>ಅದೃಷ್ಟ ಸಂಖ್ಯೆ:</strong> {r.luckyNumber}</div>
                      <div><strong>ಅದೃಷ್ಟ ಬಣ್ಣ:</strong> {r.luckyColorKn}</div>
                    </div>

                    <p style={{ fontSize: "10px", lineHeight: "1.45", textAlign: "justify", margin: "0 0 6px 0", color: "#1e293b" }}>
                      {r.bookParagraph1Kn}
                    </p>
                    <p style={{ fontSize: "10px", lineHeight: "1.45", textAlign: "justify", margin: "0 0 8px 0", color: "#1e293b" }}>
                      {r.bookParagraph2Kn}
                    </p>

                    <div style={{ borderTop: "1.5px solid #78350f", paddingTop: "5px", fontSize: "9px", fontWeight: "bold", background: "#fffbeb", padding: "5px 8px", border: "1px solid #fde68a", borderRadius: "4px", color: "#92400e" }}>
                      🕉️ ಗೋಕರ್ಣ ಶಾಂತಿ-ಪರಿಹಾರ: {r.shantiPariharaKn}
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Benediction on Final Page */}
              {pair.pageNum === 6 && (
                <div style={{ border: "2px solid #78350f", padding: "10px 14px", backgroundColor: "#fffbeb", textAlign: "center", borderRadius: "8px", marginTop: "14px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350f", marginBottom: "4px" }}>
                    ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಆಶೀರ್ವಚನ ॥
                  </div>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.5", textAlign: "justify", margin: 0, color: "#451a03" }}>
                    ದ್ವಾದಶ ರಾಶಿಗಳ ಭಕ್ತಾದಿಗಳು ತಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಗೆ ಅನುಗುಣವಾಗಿ ಪ್ರತಿನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ, ಶ್ರೀ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನವನ್ನು ಕೈಗೊಳ್ಳುವುದರಿಂದ ಸಕಲ ಗ್ರಹದೋಷಗಳು ಶಮನವಾಗಿ ಸುಖ-ಶಾಂತಿ-ಸಮೃದ್ಧಿ ನೆಲೆಸುತ್ತದೆ. ಧರ್ಮೋ ರಕ್ಷತಿ ರಕ್ಷಿತಃ.
                  </p>
                  <div style={{ fontSize: "9px", fontWeight: "bold", marginTop: "4px", textAlign: "right", color: "#92400e" }}>
                    — ಶ್ರೀರಾಮ ಪಂಡಿತ್, ಪ್ರಧಾನ ಜ್ಯೋತಿರ್ವಿಜ್ಞಾನಿಗಳು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ
                  </div>
                </div>
              )}
            </div>

            {/* Classical Bottom Page Footer */}
            <div style={{ borderTop: "1.5px solid #78350f", paddingTop: "8px", textAlign: "center", fontSize: "10px", fontWeight: "bold", color: "#78350f" }}>
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {yearlyData.shakaYear} • ಪುಟ {pair.pageNum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
