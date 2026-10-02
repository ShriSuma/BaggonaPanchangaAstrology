import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { KundliOutput } from "../../core/AstroTypes";
import {
  generateSpecialConsultationReport,
  generateSpecialConsultationAiNarration,
  answerCustomDivineQuestion,
  type SpecialConsultationFullReport,
  type SpecialConsultationLang
} from "../../core/SpecialConsultationEngine";
import { SpecialConsultationPdfTemplate } from "./SpecialConsultationPdfTemplate";
import { useAppStore } from "../../stores/appStore";

export interface SpecialDivineConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kundli: KundliOutput;
  formInput: {
    name: string;
    birthDate: string;
    birthTime?: string;
    maritalStatus?: string;
    gender?: string;
  };
  initialLang?: string;
  priestName?: string;
  priestPhone?: string;
}

type TabKey = "varshaphala" | "marriage" | "wealth" | "gemstone" | "health" | "qna";

export const SpecialDivineConsultationModal: React.FC<SpecialDivineConsultationModalProps> = ({
  isOpen,
  onClose,
  kundli,
  formInput,
  initialLang = "kn",
  priestName = "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  priestPhone = "9972339362"
}) => {
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const [lang, setLang] = useState<SpecialConsultationLang>(
    ["kn", "en", "hi", "te", "ta"].includes(initialLang) ? (initialLang as SpecialConsultationLang) : "kn"
  );

  const [activeTab, setActiveTab] = useState<TabKey>("varshaphala");

  // Selection of modules for PDF generation
  const [selectedModules, setSelectedModules] = useState({
    varshaphala: true,
    marriage: true,
    wealth: true,
    gemstone: true,
    health: true,
    qna: true
  });

  // Custom Q&A State
  const [customQuestionText, setCustomQuestionText] = useState("");
  const [customAnswer, setCustomAnswer] = useState<{ question: string; answer: string } | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

  // AI Narration State
  const [aiReport, setAiReport] = useState<SpecialConsultationFullReport | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAttemptInfo, setAiAttemptInfo] = useState<{ attempt: number; max: number } | null>(null);
  const [hasAttemptedAiAuto, setHasAttemptedAiAuto] = useState(false);
  const [showDignityDetails, setShowDignityDetails] = useState(false);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStageText, setPdfStageText] = useState("");

  const offscreenContainerRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and reset scroll position on open or tab change
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (scrollBodyRef.current) {
        scrollBodyRef.current.scrollTop = 0;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, activeTab]);

  // Generate base classical astrological consultation data (100% dynamic Parashari fallback)
  const baseReport: SpecialConsultationFullReport = useMemo(() => {
    return generateSpecialConsultationReport(kundli, {
      devoteeName: formInput.name || "ಭಕ್ತಾದಿಗಳು",
      birthDate: formInput.birthDate,
      birthTime: formInput.birthTime,
      maritalStatus: formInput.maritalStatus,
      gender: formInput.gender
    });
  }, [kundli, formInput]);

  // Combined active report (merging AI synthesis if generated)
  const report: SpecialConsultationFullReport = useMemo(() => {
    const rep = aiReport ? { ...aiReport } : { ...baseReport };
    if (customAnswer) {
      rep.customQnA = customAnswer;
    }
    return rep;
  }, [baseReport, aiReport, customAnswer]);

  const handleGenerateAiNarration = async () => {
    setIsGeneratingAi(true);
    try {
      const enriched = await generateSpecialConsultationAiNarration(
        baseReport,
        lang,
        geminiApiKey,
        (attempt, max) => {
          setAiAttemptInfo({ attempt, max });
        }
      );
      setAiReport(enriched);
    } catch (err) {
      console.error("AI Narration error:", err);
    } finally {
      setIsGeneratingAi(false);
      setAiAttemptInfo(null);
    }
  };

  // Auto-attempt AI if geminiApiKey is available when opening modal
  useEffect(() => {
    if (isOpen && geminiApiKey && !hasAttemptedAiAuto && !aiReport) {
      setHasAttemptedAiAuto(true);
      void handleGenerateAiNarration();
    }
  }, [isOpen, geminiApiKey, hasAttemptedAiAuto, aiReport]);

  if (!isOpen) return null;

  const isKn = lang === "kn";
  const isMinor = Boolean(report.marriageDossier.isMinor);
  const isMarried = Boolean(report.marriageDossier.isMarried);
  const devoteeAge = report.marriageDossier.age ?? 30;

  const handleAskQuestion = async (questionToAsk?: string) => {
    const q = (questionToAsk || customQuestionText).trim();
    if (!q) return;

    setIsAskingQuestion(true);
    try {
      const res = await answerCustomDivineQuestion(report, q, lang, geminiApiKey);
      const combined = `${res.answer}\n\n${isKn ? "ಪರಿಹಾರ:" : "Remedy:"} ${res.remedy}`;
      setCustomAnswer({
        question: q,
        answer: combined
      });
      setCustomQuestionText("");
    } catch (err) {
      console.error("Error asking question:", err);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleDownloadA4Pdf = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress(15);
    setPdfStageText(isKn ? "ಅಧಿಕೃತ A4 ಪುಟಗಳ ವಿನ್ಯಾಸ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Formatting High-Res A4 Printable Pages...");

    let wrapper: HTMLDivElement | null = null;

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 400));

      const container = offscreenContainerRef.current;
      if (!container) throw new Error("Offscreen PDF container not found");

      // Follow guarded PDF generator pattern: clone into an isolated wrapper on document.body
      wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "0px";
      wrapper.style.top = "0px";
      wrapper.style.width = "900px";
      wrapper.style.zIndex = "999999";
      wrapper.style.backgroundColor = "#FFFDF7";
      wrapper.style.pointerEvents = "none";
      wrapper.style.opacity = "1";
      wrapper.style.visibility = "visible";
      wrapper.style.overflow = "visible";

      const clone = container.cloneNode(true) as HTMLElement;
      clone.style.position = "static";
      clone.style.left = "auto";
      clone.style.top = "auto";
      clone.style.opacity = "1";
      clone.style.visibility = "visible";
      clone.style.display = "block";
      clone.style.pointerEvents = "none";
      clone.style.width = "900px";

      // Ensure all pdf-page elements are strictly block and 900px
      const allCloneElements = clone.querySelectorAll("*") as NodeListOf<HTMLElement>;
      for (const el of allCloneElements) {
        if (el.classList.contains("pdf-page")) {
          el.style.display = "block";
          el.style.width = "900px";
          el.style.height = "1273px";
          el.style.minHeight = "1273px";
          el.style.maxHeight = "1273px";
          el.style.overflow = "hidden";
        }
      }

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await new Promise((r) => setTimeout(r, 300));

      const pages = wrapper.querySelectorAll(".pdf-page") as NodeListOf<HTMLElement>;
      if (!pages || pages.length === 0) {
        throw new Error("No PDF pages available for export");
      }

      setPdfProgress(35);
      setPdfStageText(isKn ? "ಪ್ರತಿ ಪುಟದ ದೃಶ್ಯ ಸಾಂದ್ರತೆ ಸಂಗ್ರಹಣೆ..." : "Rendering High-Density Vector Canvas...");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];
        setPdfProgress(35 + Math.floor(((i + 1) / pages.length) * 55));
        setPdfStageText(
          isKn
            ? `ಪುಟ ${i + 1} / ${pages.length} ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ...`
            : `Rendering Page ${i + 1} of ${pages.length}...`
        );

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFDF7",
          logging: false,
          windowWidth: 900
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      setPdfProgress(95);
      setPdfStageText(isKn ? "ಪಿಡಿಎಫ್ ಕಡತ ಸಿದ್ಧಗೊಂಡಿದೆ, ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "Saving official A4 PDF document...");

      const safeName = (formInput.name || "Devotee").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `Baggona_Special_Divine_Consultation_${lang}_${safeName}.pdf`;
      pdf.save(fileName);

      setPdfProgress(100);
      setPdfStageText(isKn ? "ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!" : "PDF downloaded successfully!");
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgress(0);
      }, 1500);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert(isKn ? `ಪಿಡಿಎಫ್ ಮುದ್ರಣದಲ್ಲಿ ತೊಂದರೆ: ${err.message}` : `PDF generation failed: ${err.message}`);
      setIsGeneratingPdf(false);
    } finally {
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/70 backdrop-blur-sm overflow-hidden">
      {/* Modal Dialog Card in Cream & Gold luxury theme */}
      <div className="relative w-full max-w-4xl my-auto max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFDF7] border-2 border-amber-400 shadow-[0_12px_45px_rgba(180,83,9,0.22)] text-stone-900 overflow-hidden font-sans">
        
        {/* Header - Luxury Cream & Gold */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b-2 border-amber-300 bg-gradient-to-r from-amber-100/90 via-[#FFFDF7] to-amber-100/90">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl filter drop-shadow">✨</span>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-amber-950 leading-tight">
                {isKn
                  ? "॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಸಮಾಲೋಚನೆ & ವರದಿ ಸಂಹಿತೆ ॥"
                  : "Baggona Special Divine Consultation & Reports"}
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/80 font-medium">
                {isKn
                  ? "೧೨-ತಿಂಗಳ ಭವಿಷ್ಯ • ವಿವಾಹ • ವೃತ್ತಿ • ರತ್ನ • ಆಯುರ್ವೇದ • ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ"
                  : "12-Month Forecast • Marriage • Wealth • Gemstones • Health • Custom Q&A"}
              </p>
            </div>
          </div>

          {/* Language Switcher & Close */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex rounded-xl bg-white/80 p-1 border-2 border-amber-300 text-xs font-bold shadow-xs">
              {(["kn", "en", "hi", "te", "ta"] as SpecialConsultationLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    lang === l
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-xs"
                      : "text-amber-950 hover:bg-amber-100"
                  }`}
                >
                  {l === "kn" ? "ಕನ್ನಡ" : l === "en" ? "EN" : l === "hi" ? "हिन्दी" : l === "te" ? "తెలుగు" : "தமிழ்"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 border-2 border-amber-300 hover:border-rose-400 text-stone-700 hover:text-rose-700 flex items-center justify-center font-bold text-sm transition-all shadow-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Devotee Info Badge */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
            <span>👤</span>
            <span>{report.devoteeName}</span>
            <span className="text-amber-800 font-semibold">({report.birthDate} • {isKn ? `${devoteeAge} ವರ್ಷ` : `${devoteeAge} yrs`})</span>
          </div>
          <div className="flex items-center gap-3 text-amber-900 font-semibold">
            <span><strong>{isKn ? "ಲಗ್ನ:" : "Lagna:"}</strong> {isKn ? report.lagnaNameKn : report.lagnaNameEn}</span>
            <span><strong>{isKn ? "ರಾಶಿ:" : "Rashi:"}</strong> {isKn ? report.rashiNameKn : report.rashiNameEn}</span>
            <span><strong>{isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> {isKn ? report.nakshatraNameKn : report.nakshatraNameEn}</span>
            <span><strong>{isKn ? "ದಶಾ:" : "Dasha:"}</strong> {isKn ? report.currentDashaKn : report.currentDashaEn}</span>
          </div>
        </div>

        {/* Panchanga & Dignity Strip */}
        <div className="px-4 py-2 bg-[#FFFDF7] border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-amber-950">
          <div className="flex flex-wrap items-center gap-2 font-medium">
            <span>📜 <strong>{isKn ? "ಪಂಚಾಂಗ:" : "Panchanga:"}</strong> {isKn ? report.panchanga.samvatsaraKn : report.panchanga.samvatsaraEn}, {isKn ? report.panchanga.masaKn : report.panchanga.masaEn}, {isKn ? report.panchanga.pakshaKn : report.panchanga.pakshaEn}</span>
            <span>• <strong>{isKn ? "ತಿಥಿ:" : "Tithi:"}</strong> {isKn ? report.panchanga.tithiKn : report.panchanga.tithiEn}</span>
            <span>• <strong>{isKn ? "ವಾರ:" : "Vara:"}</strong> {isKn ? report.panchanga.weekdayKn : report.panchanga.weekdayEn}</span>
            <span>• <strong>{isKn ? "ಯೋಗ:" : "Yoga:"}</strong> {isKn ? report.panchanga.yogaKn : report.panchanga.yogaEn}</span>
            <span>• <strong>{isKn ? "ಕರಣ:" : "Karana:"}</strong> {isKn ? report.panchanga.karanaKn : report.panchanga.karanaEn}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDignityDetails(!showDignityDetails)}
            className="px-2.5 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 text-amber-950 font-bold flex items-center gap-1 transition-all shadow-2xs"
          >
            <span>🪐 {isKn ? "ಗ್ರಹ ಬಲ & ಉಚ್ಚ-ನೀಚ ಸ್ಥಿತಿ" : "Planetary Dignities"}</span>
            <span>{showDignityDetails ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Collapsible Planetary Dignity Assessment Table */}
        {showDignityDetails && (
          <div className="p-3.5 bg-amber-50/50 border-b border-amber-200 animate-fadeIn">
            <div className="text-xs font-bold text-amber-950 mb-2 flex items-center justify-between">
              <span>🪐 {isKn ? "ನವಗ್ರಹಗಳ ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ಥಾನ, ಉಚ್ಚ-ನೀಚ & ಬಲ ವಿವರಣೆ" : "Nine Planets Classical Dignity Assessment"}</span>
              <span className="text-[11px] text-amber-800">{isKn ? "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ ನಿಯಮಗಳು" : "Parashari Principles"}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              {Object.values(report.planetaryDignities).map((d, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl border-2 ${
                    d.dignity === "exalted"
                      ? "bg-amber-50 border-amber-400 text-amber-950"
                      : d.dignity === "debilitated"
                      ? "bg-rose-50 border-rose-300 text-rose-900"
                      : d.dignity === "own"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                      : "bg-white border-amber-200 text-stone-800"
                  }`}
                >
                  <div className="font-extrabold flex items-center justify-between">
                    <span>{isKn ? d.nameKn : d.nameEn}</span>
                    <span className="text-[10px] font-mono text-amber-900">{d.degree.toFixed(1)}°</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-900">{isKn ? d.rashiKn : d.rashiEn} ({d.house}H)</div>
                  <div className="text-[11px] font-bold mt-0.5">
                    {isKn ? d.dignityLabelKn : d.dignityLabelEn}
                    {d.isCombust && <span className="text-rose-600 ml-1">({isKn ? "ಅಸ್ತ" : "Combust"})</span>}
                    {d.isRetrograde && <span className="text-purple-700 ml-1">({isKn ? "ವಕ್ರ" : "Retro"})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Status / Fallback Notice Banner */}
        <div className="px-4 pt-3 pb-1">
          {report.aiNarration.isAiGenerated ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <div className="font-extrabold text-emerald-900">
                    {isKn ? report.aiNarration.statusNoticeKn : report.aiNarration.statusNoticeEn}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    {isKn
                      ? "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ದೈವಿಕ ನಿರೂಪಣೆಯನ್ನು ಜೆಮಿನಿ 3.5 ಫ್ಲ್ಯಾಶ್-ಲೈಟ್ ಎಂಜಿನ್ ಮೂಲಕ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಗೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ."
                      : "High-precision AI narrative synthesis generated strictly from your natal chart coordinates."}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiNarration}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-all active:scale-95"
              >
                {isGeneratingAi ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isKn ? `ರಚನೆಯಾಗುತ್ತಿದೆ (${aiAttemptInfo?.attempt || 1}/${aiAttemptInfo?.max || 3})...` : `Generating (${aiAttemptInfo?.attempt || 1}/${aiAttemptInfo?.max || 3})...`}
                  </span>
                ) : (
                  <span>🔄 {isKn ? "ಮರು ರಚಿಸಿ" : "Regenerate AI"}</span>
                )}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚠️</span>
                <div>
                  <div className="font-extrabold text-amber-950">
                    {isKn ? report.aiNarration.statusNoticeKn : report.aiNarration.statusNoticeEn}
                  </div>
                  <div className="text-[11px] text-amber-900 font-medium">
                    {isKn
                      ? "ಗಮನಿಸಿ: AI ಸಂಪರ್ಕವಿಲ್ಲದಿದ್ದರೂ, ಎಲ್ಲಾ ಫಲಗಳು ನಿಮ್ಮ ಜನನ ಲಗ್ನ, ನಕ್ಷತ್ರ, ಪಂಚಾಂಗ ಹಾಗೂ ಗ್ರಹಗಳ ಉಚ್ಚ-ನೀಚ ಬಲದ ಗಣಿತದ ಮೇಲೆ ೧೦೦% ನೈಜವಾಗಿವೆ."
                      : "All astrological predictions remain 100% active and mathematically calculated using classical Parashari rules."}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiNarration}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs whitespace-nowrap shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60"
              >
                {isGeneratingAi ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    {isKn ? `AI ರಚನೆಯಾಗುತ್ತಿದೆ (${aiAttemptInfo?.attempt || 1}/${aiAttemptInfo?.max || 3})...` : `Synthesizing AI (${aiAttemptInfo?.attempt || 1}/${aiAttemptInfo?.max || 3})...`}
                  </span>
                ) : (
                  <span>✨ {isKn ? "ದೈವಿಕ AI ನಿರೂಪಣೆ ಸಕ್ರಿಯಗೊಳಿಸಿ" : "Generate Divine AI Narration"}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs - Distinct Buttons */}
        <div className="flex overflow-x-auto gap-1.5 p-2 bg-amber-100/70 border-b-2 border-amber-200 scrollbar-none text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("varshaphala")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "varshaphala"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>🌟</span>
            <span>{isKn ? "೧೨-ತಿಂಗಳ ಭವಿಷ್ಯ" : "12-Month Forecast"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("marriage")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "marriage"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>{isMinor ? "👶" : "💍"}</span>
            <span>
              {isMinor
                ? (isKn ? "ಬಾಲ ಸಂಸ್ಕಾರ & ವಿದ್ಯಾ ಯೋಗ" : "Child Education & Grace")
                : isMarried
                ? (isKn ? "ದಾಂಪತ್ಯ ಸುಖ & ಸಂಸಾರ" : "Marital Bliss & Family")
                : (isKn ? "ವಿವಾಹ ಯೋಗ" : "Marriage Destiny")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wealth")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "wealth"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>💰</span>
            <span>{isKn ? "ಧನ-ವೃತ್ತಿ & ಸಾಲ" : "Wealth & Career"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gemstone")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "gemstone"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>💎</span>
            <span>{isKn ? "ರತ್ನ & ರುದ್ರಾಕ್ಷಿ" : "Gemstones"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("health")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "health"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>🌿</span>
            <span>{isKn ? "ಆಯುರ್ವೇದ" : "Ayur Health"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qna")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "qna"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "text-amber-950 hover:bg-amber-200/70"
            }`}
          >
            <span>🔮</span>
            <span>{isKn ? "ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ Q&A" : "Special Q&A"}</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable with ref for instant top reset) */}
        <div ref={scrollBodyRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FFFDF7]">
          {/* TAB 1: 12-MONTH FORECAST */}
          {activeTab === "varshaphala" && (
            <div className="space-y-4">
              {/* AI Narrative Synthesis if active */}
              {report.aiNarration.varshaphalaNarrative && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    <span>✨</span>
                    <span>{isKn ? "ಪಂಡಿತರ AI ದೈವಿಕ ನಿರೂಪಣೆ (Gemini 3.5 Flash-Lite)" : "Priest AI Divine Synthesis (Gemini 3.5 Flash-Lite)"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                    {report.aiNarration.varshaphalaNarrative}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-950 flex items-center gap-2">
                    <span>🌟</span>
                    <span>{isKn ? "೧೨-ತಿಂಗಳ ಮಾಸಿಕ ಭವಿಷ್ಯ ಪಥ" : "12-Month Predictive Timeline"}</span>
                  </h3>
                  <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 font-bold">
                    {report.twelveMonthForecast.yearRangeStr}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed mb-4">
                  {isKn ? report.twelveMonthForecast.yearlyThemeKn : report.twelveMonthForecast.yearlyThemeEn} •{" "}
                  <strong>{isKn ? "ವರ್ಷಪತಿ ಗ್ರಹ: " : "Year Ruler: "}</strong>
                  {isKn ? report.twelveMonthForecast.varshapathiPlanetKn : report.twelveMonthForecast.varshapathiPlanetEn} •{" "}
                  <strong>{isKn ? "ಸಾಡೇಸಾತಿ ಸ್ಥಿತಿ: " : "Sade Sati: "}</strong>
                  {isKn ? report.twelveMonthForecast.sadeSatiStatusKn : report.twelveMonthForecast.sadeSatiStatusEn}
                </p>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.twelveMonthForecast.months.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        m.financialRating === "high"
                          ? "bg-emerald-50/60 border-emerald-400"
                          : m.financialRating === "cautious"
                          ? "bg-rose-50/60 border-rose-300"
                          : "bg-amber-50/50 border-amber-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-extrabold text-sm text-amber-950">
                          {idx + 1}. {isKn ? m.monthNameKn : m.monthNameEn}{" "}
                          <span className="text-xs font-semibold text-amber-800">
                            ({isKn ? m.solarMasaKn : m.solarMasaEn})
                          </span>
                        </div>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            m.financialRating === "high"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : m.financialRating === "cautious"
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {isKn ? m.financialRatingKn : m.financialRatingEn}
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 leading-relaxed mb-2 font-medium">
                        {isKn ? m.careerOutlookKn : m.careerOutlookEn}
                      </p>
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-950 pt-1.5 border-t border-amber-200 font-semibold">
                        <span>
                          <strong>{isKn ? "ಶುಭ ದಿನಗಳು:" : "Auspicious:"}</strong> {m.auspiciousDates}
                        </span>
                        <span>
                          <strong>{isKn ? "ಪರಿಹಾರ:" : "Remedy:"}</strong> {isKn ? m.monthlyRemedyKn : m.monthlyRemedyEn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARRIAGE & RELATIONSHIP DESTINY / CHILD PROTECTION / MARITAL BLISS */}
          {activeTab === "marriage" && (
            <div className="space-y-4">
              {/* AI Narrative Synthesis if active */}
              {report.aiNarration.marriageNarrative && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    <span>✨</span>
                    <span>
                      {isMinor
                        ? (isKn ? "ಪಂಡಿತರ AI ವಿದ್ಯಾಭ್ಯಾಸ & ಬಾಲ ಸಂಸ್ಕಾರ ನಿರೂಪಣೆ" : "Priest AI Childhood & Education Synthesis")
                        : isMarried
                        ? (isKn ? "ಪಂಡಿತರ AI ದಾಂಪತ್ಯ ಸುಖ & ಸಾಮರಸ್ಯ ನಿರೂಪಣೆ" : "Priest AI Marital Harmony Synthesis")
                        : (isKn ? "ಪಂಡಿತರ AI ದೈವಿಕ ವಿವಾಹ ನಿರೂಪಣೆ" : "Priest AI Marriage Synthesis")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                    {report.aiNarration.marriageNarrative}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/80 shadow-xs">
                <h3 className="text-base sm:text-lg font-extrabold text-amber-950 mb-1 flex items-center gap-2">
                  <span>{isMinor ? "👶" : "💍"}</span>
                  <span>{isKn ? report.marriageDossier.verdictTitleKn : report.marriageDossier.verdictTitleEn}</span>
                </h3>
                <p className="text-sm text-amber-950 font-bold mb-3">
                  {isMinor
                    ? (isKn ? "ಪ್ರಸ್ತುತ ಹಂತ & ಭವಿಷ್ಯದ ಕಾಲ:" : "Current Life Phase & Timing:")
                    : isMarried
                    ? (isKn ? "ದಾಂಪತ್ಯ ಸ್ಥಿತಿ:" : "Marital Status:")
                    : (isKn ? "ಪ್ರಶಸ್ತ ವಿವಾಹ ಕಾಲ:" : "Matrimonial Timing Window:")}{" "}
                  <span className="text-amber-800 font-extrabold">
                    {isKn ? report.marriageDossier.marriageWindowKn : report.marriageDossier.marriageWindowEn}
                  </span>
                </p>

                {/* Subcard (Minor Guidance / Married Harmony / Unmarried Spouse Profile) */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-2 mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <span>{isMinor ? "👶" : isMarried ? "🏡" : "👰"}</span>
                    <span>
                      {isMinor
                        ? (isKn ? "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಆಯುರಾರೋಗ್ಯ & ಸಂಸ್ಕಾರ ಮಾರ್ಗದರ್ಶನ" : "Childhood Education, Health & Moral Guidance")
                        : isMarried
                        ? (isKn ? "ಸಂಸಾರ ಸಾಮರಸ್ಯ, ಪರಸ್ಪರ ಪ್ರೇಮ & ಕೌಟುಂಬಿಕ ಒಗ್ಗಟ್ಟು" : "Family Harmony, Spousal Alignment & Domestic Peace")
                        : (isKn ? "ಭಾವಿ ಸಂಗಾತಿಯ ಗುಣಲಕ್ಷಣ & ಆಗಮನ ದಿಕ್ಕು" : "Spouse Temperament & Direction")}
                    </span>
                  </h4>
                  <div className="text-xs text-stone-800 space-y-1.5 leading-relaxed font-medium">
                    {isMinor ? (
                      <>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ:" : "Holistic Guidance:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}
                        </div>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ವಿದ್ಯಾಭ್ಯಾಸ ಕ್ಷೇತ್ರ:" : "Academic Sphere:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}
                        </div>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ಭವಿಷ್ಯದ ಸೂಚನೆ:" : "Future Indication:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}
                        </div>
                      </>
                    ) : isMarried ? (
                      <>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ದಾಂಪತ್ಯ ಗುಣ:" : "Marital Dynamics:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}
                        </div>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ವೃತ್ತಿ & ಆರ್ಥಿಕತೆ:" : "Vocation & Stability:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}
                        </div>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆ:" : "Family Alignment:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ಆಗಮನ ದಿಕ್ಕು:" : "Direction of Origin:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}
                        </div>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ವ್ಯಕ್ತಿತ್ವ:" : "Temperament:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}
                        </div>
                        <div>
                          <strong className="text-amber-950">{isKn ? "ವೃತ್ತಿ ಕ್ಷೇತ್ರ:" : "Likely Vocation:"}</strong>{" "}
                          {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-xs text-stone-800 mb-2 font-medium">
                  <strong className="text-amber-950">{isKn ? "ಕುಜ ಗ್ರಹ ಸ್ಥಿತಿ:" : "Mars & Kuja Analysis:"}</strong>{" "}
                  {isKn ? report.marriageDossier.kujaDoshaStatusKn : report.marriageDossier.kujaDoshaStatusEn}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 font-medium">
                  <strong className="text-amber-900 font-bold">{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Sacred Remedy:"}</strong>{" "}
                  {isKn ? report.marriageDossier.sacredRemedyKn : report.marriageDossier.sacredRemedyEn}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEALTH, CAREER & DEBT */}
          {activeTab === "wealth" && (
            <div className="space-y-4">
              {/* AI Narrative Synthesis if active */}
              {report.aiNarration.wealthNarrative && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    <span>✨</span>
                    <span>{isKn ? "ಪಂಡಿತರ AI ದೈವಿಕ ಧನ-ವೃತ್ತಿ ನಿರೂಪಣೆ (Gemini 3.5 Flash-Lite)" : "Priest AI Wealth Synthesis (Gemini 3.5 Flash-Lite)"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                    {report.aiNarration.wealthNarrative}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-950 flex items-center gap-2">
                    <span>💰</span>
                    <span>{isKn ? "ಧನ-ವೃತ್ತಿ ಯೋಗ & ಋಣಮುಕ್ತಿ ನೀಲನಕ್ಷೆ" : "Wealth & Debt Blueprint"}</span>
                  </h3>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300 font-bold">
                    {isKn ? "ಇಂದು ಲಗ್ನ ಸೂಚ್ಯಂಕ:" : "Indu Lagna:"} {report.wealthCareer.induLagnaProsperityScore}/100
                  </span>
                </div>

                <div className="text-sm font-bold text-amber-950 mb-2">
                  💼 {isKn ? report.wealthCareer.vocationTypeKn : report.wealthCareer.vocationTypeEn}
                </div>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed mb-3 font-medium">
                  {isKn ? report.wealthCareer.prosperityVerdictKn : report.wealthCareer.prosperityVerdictEn}
                </p>

                {/* Active Yogas */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 mb-3">
                  <div className="text-xs font-bold text-amber-950 mb-1.5">
                    ✨ {isKn ? "ಸಕ್ರಿಯ ಧನ-ಯೋಗಗಳು:" : "Active Wealth Yogas:"}
                  </div>
                  <ul className="text-xs text-stone-800 space-y-1 list-disc list-inside font-medium">
                    {(isKn ? report.wealthCareer.primaryWealthYogasKn : report.wealthCareer.primaryWealthYogasEn).map((y, i) => (
                      <li key={i}>{y}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-stone-800 mb-2 font-medium">
                  <strong className="text-amber-950">{isKn ? "ಋಣಮುಕ್ತಿ ಕಾಲಮಿತಿ (Debt Clearance):" : "Debt Clearance Timeline:"}</strong>{" "}
                  {isKn ? report.wealthCareer.debtClearanceTimelineKn : report.wealthCareer.debtClearanceTimelineEn}
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-medium">
                  <strong className="text-emerald-900 font-bold">{isKn ? "ಧನ-ವೃದ್ಧಿ ಪರಿಹಾರ:" : "Wealth Seva:"}</strong>{" "}
                  {isKn ? report.wealthCareer.wealthRemedyKn : report.wealthCareer.wealthRemedyEn}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEMSTONE & RUDRAKSHA */}
          {activeTab === "gemstone" && (
            <div className="space-y-4">
              {/* AI Narrative Synthesis if active */}
              {report.aiNarration.gemstoneNarrative && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    <span>✨</span>
                    <span>{isKn ? "ಪಂಡಿತರ AI ರತ್ನ & ರುದ್ರಾಕ್ಷಿ ಶಾಸ್ತ್ರೋಕ್ತ ವಿವೇಚನೆ" : "Priest AI Gemstone & Rudraksha Synthesis"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                    {report.aiNarration.gemstoneNarrative}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/80 shadow-xs">
                <h3 className="text-base sm:text-lg font-extrabold text-amber-950 mb-3 flex items-center gap-2">
                  <span>💎</span>
                  <span>{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಯಂತ್ರ ನಿರ್ದೇಶನ" : "Gemstones & Sacred Rudraksha"}</span>
                </h3>

                {/* 2 Gems */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Life Gem */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border-2 border-amber-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">⭐ {isKn ? report.gemstoneRudraksha.lifeGem.gemTypeKn : report.gemstoneRudraksha.lifeGem.gemTypeEn}</span>
                      <span className="text-[11px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-bold border border-amber-300">
                        {isKn ? report.gemstoneRudraksha.lifeGem.planetaryDignityKn : report.gemstoneRudraksha.lifeGem.planetaryDignityEn}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-amber-950 my-1">
                      {isKn ? report.gemstoneRudraksha.lifeGem.nameKn : report.gemstoneRudraksha.lifeGem.nameEn}
                    </div>
                    <div className="text-xs text-stone-800 space-y-1 font-medium">
                      <div><strong>{isKn ? "ತೂಕ:" : "Weight:"}</strong> {report.gemstoneRudraksha.lifeGem.recommendedWeight}</div>
                      <div><strong>{isKn ? "ಲೋಹ:" : "Metal:"}</strong> {isKn ? report.gemstoneRudraksha.lifeGem.suitableMetalKn : report.gemstoneRudraksha.lifeGem.suitableMetalEn}</div>
                      <div><strong>{isKn ? "ಬೆರಳು:" : "Finger:"}</strong> {isKn ? report.gemstoneRudraksha.lifeGem.wearingFingerKn : report.gemstoneRudraksha.lifeGem.wearingFingerEn}</div>
                      <div><strong>{isKn ? "ಶುಭ ದಿನ:" : "Auspicious Day:"}</strong> {isKn ? report.gemstoneRudraksha.lifeGem.auspiciousDayKn : report.gemstoneRudraksha.lifeGem.auspiciousDayEn}</div>
                      <div><strong>{isKn ? "ತಾರಾ ಬಲ:" : "Tara Bala:"}</strong> {isKn ? report.gemstoneRudraksha.lifeGem.consecrationTaraKn : report.gemstoneRudraksha.lifeGem.consecrationTaraEn}</div>
                      <div className="text-amber-900 font-mono text-[11px] mt-1 font-bold">{isKn ? report.gemstoneRudraksha.lifeGem.mantraKn : report.gemstoneRudraksha.lifeGem.mantraEn}</div>
                    </div>
                  </div>

                  {/* Fortune Gem */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border-2 border-amber-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">✨ {isKn ? report.gemstoneRudraksha.fortuneGem.gemTypeKn : report.gemstoneRudraksha.fortuneGem.gemTypeEn}</span>
                      <span className="text-[11px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-bold border border-amber-300">
                        {isKn ? report.gemstoneRudraksha.fortuneGem.planetaryDignityKn : report.gemstoneRudraksha.fortuneGem.planetaryDignityEn}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-amber-950 my-1">
                      {isKn ? report.gemstoneRudraksha.fortuneGem.nameKn : report.gemstoneRudraksha.fortuneGem.nameEn}
                    </div>
                    <div className="text-xs text-stone-800 space-y-1 font-medium">
                      <div><strong>{isKn ? "ತೂಕ:" : "Weight:"}</strong> {report.gemstoneRudraksha.fortuneGem.recommendedWeight}</div>
                      <div><strong>{isKn ? "ಲೋಹ:" : "Metal:"}</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.suitableMetalKn : report.gemstoneRudraksha.fortuneGem.suitableMetalEn}</div>
                      <div><strong>{isKn ? "ಬೆರಳು:" : "Finger:"}</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.wearingFingerKn : report.gemstoneRudraksha.fortuneGem.wearingFingerEn}</div>
                      <div><strong>{isKn ? "ಶುಭ ದಿನ:" : "Auspicious Day:"}</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.auspiciousDayKn : report.gemstoneRudraksha.fortuneGem.auspiciousDayEn}</div>
                      <div><strong>{isKn ? "ತಾರಾ ಬಲ:" : "Tara Bala:"}</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.consecrationTaraKn : report.gemstoneRudraksha.fortuneGem.consecrationTaraEn}</div>
                      <div className="text-amber-900 font-mono text-[11px] mt-1 font-bold">{isKn ? report.gemstoneRudraksha.fortuneGem.mantraKn : report.gemstoneRudraksha.fortuneGem.mantraEn}</div>
                    </div>
                  </div>
                </div>

                {/* Prohibited Warning */}
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 mb-3 font-medium">
                  <strong className="font-bold">⚠️ {isKn ? "ವರ್ಜ್ಯ ರತ್ನ ಎಚ್ಚರಿಕೆ:" : "Prohibited Gemstone Warning:"}</strong>{" "}
                  {isKn ? report.gemstoneRudraksha.prohibitedGems.gemNamesKn : report.gemstoneRudraksha.prohibitedGems.gemNamesEn} -{" "}
                  {isKn ? report.gemstoneRudraksha.prohibitedGems.reasonKn : report.gemstoneRudraksha.prohibitedGems.reasonEn}
                </div>

                {/* Rudraksha & Yantra */}
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-2 font-medium">
                  <div>
                    <strong className="text-purple-950 font-bold">📿 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ರುದ್ರಾಕ್ಷಿ:" : "Sacred Rudraksha:"}</strong>{" "}
                    {isKn ? report.gemstoneRudraksha.prescribedRudraksha.mukhiKn : report.gemstoneRudraksha.prescribedRudraksha.mukhiEn} (
                    {isKn ? report.gemstoneRudraksha.prescribedRudraksha.deityKn : report.gemstoneRudraksha.prescribedRudraksha.deityEn})
                    <div className="text-[11px] text-purple-900 mt-1">
                      {isKn ? report.gemstoneRudraksha.prescribedRudraksha.panchangaReasonKn : report.gemstoneRudraksha.prescribedRudraksha.panchangaReasonEn}
                    </div>
                  </div>
                  <div>
                    <strong className="text-purple-950 font-bold">🕉️ {isKn ? "ಪ್ರತಿಷ್ಠಾಪಿಸಬೇಕಾದ ಯಂತ್ರ:" : "Consecrated Yantra:"}</strong>{" "}
                    {isKn ? report.gemstoneRudraksha.prescribedYantra.nameKn : report.gemstoneRudraksha.prescribedYantra.nameEn}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AYUR SANJEEVINI HEALTH */}
          {activeTab === "health" && (
            <div className="space-y-4">
              {/* AI Narrative Synthesis if active */}
              {report.aiNarration.healthNarrative && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    <span>✨</span>
                    <span>{isKn ? "ಪಂಡಿತರ AI ಆಯುರ್ ಸಂಜೀವಿನಿ ವಿವೇಚನೆ" : "Priest AI Ayur Sanjeevini Synthesis"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                    {report.aiNarration.healthNarrative}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-950 flex items-center gap-2">
                    <span>🌿</span>
                    <span>{isKn ? "ಆಯುರ್ ಸಂಜೀವಿನಿ ವೈದಿಕ ಪ್ರೊಫೈಲ್" : "Ayur Sanjeevini Health Profile"}</span>
                  </h3>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full font-bold border border-emerald-300">
                    {isKn ? report.ayurHealth.prakritiConstitutionKn : report.ayurHealth.prakritiConstitutionEn}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 mb-3">
                  <div className="text-xs font-bold text-amber-950 mb-1">
                    🏥 {isKn ? "ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಂಗಗಳು:" : "Vulnerable Physiological Zones:"}
                  </div>
                  <ul className="text-xs text-stone-800 space-y-1 list-disc list-inside font-medium">
                    {(isKn ? report.ayurHealth.vulnerableOrgansKn : report.ayurHealth.vulnerableOrgansEn).map((org, i) => (
                      <li key={i}>{org}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3 font-medium">
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                    <strong className="text-amber-950 font-bold">🥗 {isKn ? "ಆಹಾರ ಪಥ್ಯ:" : "Dietary Advice:"}</strong>{" "}
                    {isKn ? report.ayurHealth.seasonalDietAdviceKn : report.ayurHealth.seasonalDietAdviceEn}
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                    <strong className="text-amber-950 font-bold">🧘 {isKn ? "ದಿನಚರ್ಯೆ:" : "Daily Routine:"}</strong>{" "}
                    {isKn ? report.ayurHealth.dailyLifestyleHabitKn : report.ayurHealth.dailyLifestyleHabitEn}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-medium">
                  <strong className="text-emerald-900 font-bold">{isKn ? "ಧನ್ವಂತರಿ ಮಂತ್ರ & ರಸಾಯನ:" : "Healing Mantra & Rasayana:"}</strong>{" "}
                  {isKn ? report.ayurHealth.healingMantraKn : report.ayurHealth.healingMantraEn} • {isKn ? report.ayurHealth.ayurvedicRasayanaKn : report.ayurHealth.ayurvedicRasayanaEn}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SPECIAL ASTROLOGICAL Q&A */}
          {activeTab === "qna" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border-2 border-amber-300/80 shadow-xs">
                <h3 className="text-base sm:text-lg font-extrabold text-amber-950 mb-2 flex items-center gap-2">
                  <span>🔮</span>
                  <span>{isKn ? "ವಿಶೇಷ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಸಮಾಲೋಚನೆ" : "Personal Astrological Q&A"}</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 mb-4 font-medium">
                  {isKn
                    ? "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜೀವನದ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಕೇಳಬಹುದು. ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ಶಾಸ್ತ್ರ ಪದ್ಧತಿಯಂತೆ ತ್ವರಿತ ದೈವಿಕ ಉತ್ತರ ಲಭ್ಯ."
                    : "Ask any personalized question regarding career, health, property, or matrimony for classical Jyotisha guidance."}
                </p>

                {/* Preset Fast Questions */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-bold text-amber-950">
                    ⚡ {isKn ? "ಜನಪ್ರಿಯ ಪ್ರಶ್ನೆಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):" : "Frequently Asked Questions (Click to Ask):"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.presetQnAList.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskQuestion(isKn ? item.questionKn : item.questionEn)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs text-amber-950 font-semibold text-left transition-all active:scale-95"
                      >
                        {isKn ? item.questionKn : item.questionEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Question Input */}
                <div className="space-y-2 mb-4">
                  <textarea
                    rows={2}
                    value={customQuestionText}
                    onChange={(e) => setCustomQuestionText(e.target.value)}
                    placeholder={
                      isKn
                        ? "ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ (ಉದಾ: ನನ್ನ ಮಗಳ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ನೌಕರಿ ಯೋಗ ಹೇಗಿದೆ?)..."
                        : "Type your personal life question here..."
                    }
                    className="w-full rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 p-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    type="button"
                    disabled={isAskingQuestion || !customQuestionText.trim()}
                    onClick={() => handleAskQuestion()}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      isAskingQuestion || !customQuestionText.trim()
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                        : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 active:scale-95"
                    }`}
                  >
                    {isAskingQuestion ? (
                      <>
                        <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                        <span>{isKn ? "ಪಂಡಿತರು ಜಾತಕ ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ..." : "Analyzing Natal Coordinates..."}</span>
                      </>
                    ) : (
                      <>
                        <span>🔮</span>
                        <span>{isKn ? "ಪಂಡಿತರಲ್ಲಿ ನೇರ ಉತ್ತರ ಪಡೆಯಿರಿ" : "Ask Astrologer for Verdict"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Display Current Answer */}
                {customAnswer && (
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 animate-fadeIn">
                    <div className="text-xs font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
                      <span>❓</span>
                      <span>&ldquo;{customAnswer.question}&rdquo;</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-medium">
                      {customAnswer.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer & A4 PDF Download Bar - Luxury Cream & Gold */}
        <div className="p-4 bg-gradient-to-r from-amber-100/90 via-[#FFFDF7] to-amber-100/90 border-t-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Module Selection Checkboxes */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-amber-950 font-semibold">
            <span className="font-extrabold text-amber-950">{isKn ? "ಮುದ್ರಣ ಪುಟಗಳು:" : "Include Pages:"}</span>
            <label className="flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                checked={selectedModules.varshaphala}
                onChange={(e) => setSelectedModules((s) => ({ ...s, varshaphala: e.target.checked }))}
                className="accent-amber-600 rounded"
              />
              <span>{isKn ? "೧೨-ತಿಂಗಳು" : "12-Month"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                checked={selectedModules.marriage}
                onChange={(e) => setSelectedModules((s) => ({ ...s, marriage: e.target.checked }))}
                className="accent-amber-600 rounded"
              />
              <span>{isMinor ? (isKn ? "ಬಾಲ ಸಂಸ್ಕಾರ" : "Child Grace") : isKn ? "ವಿವಾಹ" : "Marriage"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                checked={selectedModules.wealth}
                onChange={(e) => setSelectedModules((s) => ({ ...s, wealth: e.target.checked }))}
                className="accent-amber-600 rounded"
              />
              <span>{isKn ? "ಧನ-ವೃತ್ತಿ" : "Wealth"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                checked={selectedModules.gemstone}
                onChange={(e) => setSelectedModules((s) => ({ ...s, gemstone: e.target.checked }))}
                className="accent-amber-600 rounded"
              />
              <span>{isKn ? "ರತ್ನ" : "Gems"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer bg-white/70 px-2 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                checked={selectedModules.qna}
                onChange={(e) => setSelectedModules((s) => ({ ...s, qna: e.target.checked }))}
                className="accent-amber-600 rounded"
              />
              <span>{isKn ? "ಪ್ರಶ್ನೋತ್ತರ" : "Q&A"}</span>
            </label>
          </div>

          {/* Download Button */}
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadA4Pdf}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 border-2 border-amber-400 shadow-md ${
              isGeneratingPdf
                ? "bg-amber-100 text-amber-900 opacity-80 cursor-wait"
                : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/30 active:scale-95"
            }`}
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>{pdfStageText || `${pdfProgress}%`}</span>
              </>
            ) : (
              <>
                <span>🖨️</span>
                <span>
                  {isKn
                    ? "ಅಧಿಕೃತ A4 ಪಿಡಿಎಫ್ ಮುದ್ರಣ / ಡೌನ್‌ಲೋಡ್"
                    : "Download Printable A4 PDF Report"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Off-screen Container for High-Density html2canvas Rendering */}
      <div
        ref={offscreenContainerRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 900,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          height: 0
        }}
      >
        <SpecialConsultationPdfTemplate
          report={report}
          lang={lang}
          selectedModules={selectedModules}
          priestName={priestName}
          priestPhone={priestPhone}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
