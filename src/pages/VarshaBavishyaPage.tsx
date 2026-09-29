import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RASHIS, type Rashi } from "../core/AstroTypes";
import { calculateVarshaBavishya, type VarshaPrediction } from "../core/VarshaBavishyaEngine";
import {
  getBaggonaVarshaBhavishyaForYear,
  toKannadaDigits,
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
  const [prediction, setPrediction] = useState<VarshaPrediction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const domainIcons = ["✨", "💼", "🩺", "🕉️"];
  const domainTitles = [
    t("varsha.section_overview", "Cosmic Overview (ಗ್ರಹ ಸಂಚಾರ & ಆದಾಯ)"),
    t("varsha.section_career", "Career & Finance (ವೃತ್ತಿ & ಆರ್ಥಿಕತೆ)"),
    t("varsha.section_health", "Health & Relationships (ಆರೋಗ್ಯ & ಕೌಟುಂಬಿಕ)"),
    t("varsha.section_remedies", "Spiritual Remedies (ಶಾಂತಿ-ಪರಿಹಾರ)")
  ];

  const currentRashiPayload = yearlyData.rashis[selectedRashi];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 py-4">
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

        {/* View Mode Switcher */}
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

          {/* 1-Click Book Download Action */}
          <button
            onClick={handleDownloadCompleteBookPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{isGeneratingPdf ? "⏳" : "📥"}</span>
            <span>
              {isGeneratingPdf
                ? "ಪುಸ್ತಕ ಮುದ್ರಣವಾಗುತ್ತಿದೆ..."
                : `ಸಮಗ್ರ ೧೨ ರಾಶಿಗಳ ಪುಸ್ತಕ PDF (${yearlyData.samvatsaraKn})`}
            </span>
          </button>
        </div>
      </Card>

      {/* ── TAB 1: ALL 12 RASHIS (BAGGONA PANCHANGA 104-PAGE BOOK LAYOUT) ── */}
      {activeTab === "all" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-amber-900 text-amber-50 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm font-serif">
            <span>
              ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರದ ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ಪಂಚಾಂಗ ಫಲಂ (ಮೇಷದಿಂದ ಮೀನದವರೆಗೆ)
            </span>
            <span className="hidden sm:inline text-amber-200 text-xs">
              ಆದಾಯ, ವ್ಯಯ, ರಾಜಪೂಜ್ಯ, ಅವಮಾನ ಗಣಿತ
            </span>
          </div>

          {/* 12-Rashi Responsive Grid (2 columns like classical Panchanga spreads) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yearlyData.rashis.map((rashi, idx) => (
              <div
                key={idx}
                className="border-2 border-amber-900/20 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between font-serif relative overflow-hidden"
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
            ))}
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
      {/* Strictly complies with baggona-pdf-layout-guard: .pdf-page vertical blocks */}
      <div
        id="baggona-complete-12-rashi-pdf-book"
        style={{
          position: "fixed",
          left: "-15000px",
          top: "0px",
          width: "794px",
          zIndex: -9999,
          backgroundColor: "#FFFDF7",
          color: "#000000",
          fontFamily: "serif"
        }}
      >
        {/* PAGE 1: COVER & RASHIS 1 TO 4 (Mesha, Vrishabha, Mithuna, Karkataka) */}
        <div
          className="pdf-page"
          style={{
            width: "794px",
            minHeight: "1120px",
            padding: "24px",
            boxSizing: "border-box",
            backgroundColor: "#FFFDF7",
            border: "4px double #000000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ textAlign: "center", borderBottom: "2px solid #000000", paddingBottom: "8px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನಃ ॥</div>
              <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "1px" }}>॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ವರ್ಷಭವಿಷ್ಯ ॥</div>
              <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>
                ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {yearlyData.shakaYear} (ಕ್ರಿ.ಶ {yearlyData.gregorianYears}) • ಭಾಗ ೧
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {yearlyData.rashis.slice(0, 4).map((r, i) => (
                <div key={i} style={{ border: "1px solid #000000", padding: "10px", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #000000", paddingBottom: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>{r.titleKn}</span>
                    <span style={{ fontSize: "9.5px", fontFamily: "monospace", fontWeight: "bold", background: "#f1f5f9", padding: "1px 4px", border: "1px solid #000" }}>
                      {r.badgeKn}
                    </span>
                  </div>
                  <div style={{ fontSize: "8.5px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    ನಕ್ಷತ್ರ ಪಾದಗಳು: {r.nakshatraPadasKn}
                  </div>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.4", textAlign: "justify", margin: "0 0 4px 0" }}>
                    {r.bookParagraph1Kn}
                  </p>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.4", textAlign: "justify", margin: "0 0 6px 0" }}>
                    {r.bookParagraph2Kn}
                  </p>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "4px", fontSize: "8.5px", fontWeight: "bold", background: "#f8fafc", padding: "3px" }}>
                    ಶಾಂತಿ-ಪರಿಹಾರ: {r.shantiPariharaKn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #000", paddingTop: "6px", textAlign: "center", fontSize: "9px", fontWeight: "bold" }}>
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • ಪುಟ ೧
          </div>
        </div>

        {/* PAGE 2: RASHIS 5 TO 8 (Simha, Kanya, Tula, Vrischika) */}
        <div
          className="pdf-page"
          style={{
            width: "794px",
            minHeight: "1120px",
            padding: "24px",
            boxSizing: "border-box",
            backgroundColor: "#FFFDF7",
            border: "4px double #000000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ textAlign: "center", borderBottom: "2px solid #000000", paddingBottom: "8px", marginBottom: "12px" }}>
              <div style={{ fontSize: "16px", fontWeight: "900" }}>
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರದ ವರ್ಷಭವಿಷ್ಯ ॥
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                ದ್ವಾದಶ ರಾಶಿ ಫಲಂ (ಸಿಂಹ, ಕನ್ಯಾ, ತುಲಾ, ವೃಶ್ಚಿಕ ರಾಶಿಗಳು) • ಭಾಗ ೨
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {yearlyData.rashis.slice(4, 8).map((r, i) => (
                <div key={i} style={{ border: "1px solid #000000", padding: "10px", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #000000", paddingBottom: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>{r.titleKn}</span>
                    <span style={{ fontSize: "9.5px", fontFamily: "monospace", fontWeight: "bold", background: "#f1f5f9", padding: "1px 4px", border: "1px solid #000" }}>
                      {r.badgeKn}
                    </span>
                  </div>
                  <div style={{ fontSize: "8.5px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    ನಕ್ಷತ್ರ ಪಾದಗಳು: {r.nakshatraPadasKn}
                  </div>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.4", textAlign: "justify", margin: "0 0 4px 0" }}>
                    {r.bookParagraph1Kn}
                  </p>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.4", textAlign: "justify", margin: "0 0 6px 0" }}>
                    {r.bookParagraph2Kn}
                  </p>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "4px", fontSize: "8.5px", fontWeight: "bold", background: "#f8fafc", padding: "3px" }}>
                    ಶಾಂತಿ-ಪರಿಹಾರ: {r.shantiPariharaKn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #000", paddingTop: "6px", textAlign: "center", fontSize: "9px", fontWeight: "bold" }}>
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • ಪುಟ ೨
          </div>
        </div>

        {/* PAGE 3: RASHIS 9 TO 12 (Dhanu, Makara, Kumbha, Meena) & BLESSINGS */}
        <div
          className="pdf-page"
          style={{
            width: "794px",
            minHeight: "1120px",
            padding: "24px",
            boxSizing: "border-box",
            backgroundColor: "#FFFDF7",
            border: "4px double #000000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ textAlign: "center", borderBottom: "2px solid #000000", paddingBottom: "8px", marginBottom: "12px" }}>
              <div style={{ fontSize: "16px", fontWeight: "900" }}>
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರದ ವರ್ಷಭವಿಷ್ಯ ॥
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                ದ್ವಾದಶ ರಾಶಿ ಫಲಂ (ಧನು, ಮಕರ, ಕುಂಭ, ಮೀನ ರಾಶಿಗಳು) • ಭಾಗ ೩
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {yearlyData.rashis.slice(8, 12).map((r, i) => (
                <div key={i} style={{ border: "1px solid #000000", padding: "10px", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #000000", paddingBottom: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>{r.titleKn}</span>
                    <span style={{ fontSize: "9.5px", fontFamily: "monospace", fontWeight: "bold", background: "#f1f5f9", padding: "1px 4px", border: "1px solid #000" }}>
                      {r.badgeKn}
                    </span>
                  </div>
                  <div style={{ fontSize: "8.5px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    ನಕ್ಷತ್ರ ಪಾದಗಳು: {r.nakshatraPadasKn}
                  </div>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.4", textAlign: "justify", margin: "0 0 4px 0" }}>
                    {r.bookParagraph1Kn}
                  </p>
                  <p style={{ fontSize: "9.5px", lineHeight: "1.4", textAlign: "justify", margin: "0 0 6px 0" }}>
                    {r.bookParagraph2Kn}
                  </p>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "4px", fontSize: "8.5px", fontWeight: "bold", background: "#f8fafc", padding: "3px" }}>
                    ಶಾಂತಿ-ಪರಿಹಾರ: {r.shantiPariharaKn}
                  </div>
                </div>
              ))}
            </div>

            {/* Holy Benediction from Gokarna Kshetra */}
            <div style={{ border: "2px solid #000000", padding: "12px", backgroundColor: "#f8fafc", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>
                ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಆಶೀರ್ವಚನ ॥
              </div>
              <p style={{ fontSize: "10px", lineHeight: "1.6", textAlign: "justify", margin: 0 }}>
                ದ್ವಾದಶ ರಾಶಿಗಳ ಭಕ್ತಾದಿಗಳು ತಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಗೆ ಅನುಗುಣವಾಗಿ ಪ್ರತಿನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ, ಶ್ರೀ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನವನ್ನು ಕೈಗೊಳ್ಳುವುದರಿಂದ ಸಕಲ ಗ್ರಹದೋಷಗಳು ಶಮನವಾಗಿ ಸುಖ-ಶಾಂತಿ-ಸಮೃದ್ಧಿ ನೆಲೆಸುತ್ತದೆ. ಧರ್ಮೋ ರಕ್ಷತಿ ರಕ್ಷಿತಃ.
              </p>
              <div style={{ fontSize: "9.5px", fontWeight: "bold", marginTop: "6px", textAlign: "right" }}>
                — ಶ್ರೀರಾಮ ಪಂಡಿತ್, ಪ್ರಧಾನ ಜ್ಯೋತಿರ್ವಿಜ್ಞಾನಿಗಳು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #000", paddingTop: "6px", textAlign: "center", fontSize: "9px", fontWeight: "bold" }}>
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ {yearlyData.samvatsaraKn} ಸಂವತ್ಸರ • ಪುಟ ೩
          </div>
        </div>
      </div>
    </div>
  );
}
