import React, { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { KundliOutput } from "../../core/AstroTypes";
import {
  generateSpecialConsultationReport,
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

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStageText, setPdfStageText] = useState("");

  const offscreenContainerRef = useRef<HTMLDivElement>(null);

  // Generate full astrological consultation data
  const report: SpecialConsultationFullReport = useMemo(() => {
    const rep = generateSpecialConsultationReport(kundli, {
      devoteeName: formInput.name || "ಭಕ್ತಾದಿಗಳು",
      birthDate: formInput.birthDate,
      birthTime: formInput.birthTime,
      maritalStatus: formInput.maritalStatus,
      gender: formInput.gender
    });
    if (customAnswer) {
      rep.customQnA = customAnswer;
    }
    return rep;
  }, [kundli, formInput, customAnswer]);

  if (!isOpen) return null;

  const isKn = lang === "kn";

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

    try {
      await new Promise((r) => setTimeout(r, 600));

      const container = offscreenContainerRef.current;
      if (!container) throw new Error("Offscreen PDF container not found");

      const pages = container.querySelectorAll(".pdf-page") as NodeListOf<HTMLElement>;
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
        setPdfProgress(35 + Math.floor(((i + 1) / pages.length) * 50));
        setPdfStageText(
          isKn
            ? `ಪುಟ ${i + 1} / ${pages.length} ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ...`
            : `Rendering Page ${i + 1} of ${pages.length}...`
        );

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFDF9",
          logging: false,
          windowWidth: 900
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.88);
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-slate-950 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">✨</span>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-amber-300 leading-tight">
                {isKn
                  ? "॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಸಮಾಲೋಚನೆ & ವರದಿ ಸಂಹಿತೆ ॥"
                  : "Baggona Special Divine Consultation & Reports"}
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80">
                {isKn
                  ? "೧೨-ತಿಂಗಳ ಭವಿಷ್ಯ • ವಿವಾಹ • ವೃತ್ತಿ • ರತ್ನ • ಆಯುರ್ವೇದ • ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ"
                  : "12-Month Forecast • Marriage • Wealth • Gemstones • Health • Custom Q&A"}
              </p>
            </div>
          </div>

          {/* Language Switcher & Close */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex rounded-lg bg-slate-900 p-1 border border-amber-600/40 text-xs font-bold">
              {(["kn", "en", "hi", "te", "ta"] as SpecialConsultationLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded transition-all ${
                    lang === l ? "bg-amber-500 text-slate-950 shadow" : "text-amber-200 hover:text-white"
                  }`}
                >
                  {l === "kn" ? "ಕನ್ನಡ" : l === "en" ? "EN" : l === "hi" ? "हिन्दी" : l === "te" ? "తెలుగు" : "தமிழ்"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-900/80 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Devotee Info Badge */}
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <span>👤</span>
            <span>{report.devoteeName}</span>
            <span className="text-amber-200/70">({report.birthDate})</span>
          </div>
          <div className="flex items-center gap-3 text-amber-200/90 font-medium">
            <span><strong>{isKn ? "ಲಗ್ನ:" : "Lagna:"}</strong> {isKn ? report.lagnaNameKn : report.lagnaNameEn}</span>
            <span><strong>{isKn ? "ರಾಶಿ:" : "Rashi:"}</strong> {isKn ? report.rashiNameKn : report.rashiNameEn}</span>
            <span><strong>{isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> {isKn ? report.nakshatraNameKn : report.nakshatraNameEn}</span>
            <span><strong>{isKn ? "ದಶಾ:" : "Dasha:"}</strong> {isKn ? report.currentDashaKn : report.currentDashaEn}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1.5 p-2 bg-slate-900/90 border-b border-slate-800 scrollbar-none text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("varshaphala")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "varshaphala"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-amber-300 hover:bg-slate-800"
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
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-amber-300 hover:bg-slate-800"
            }`}
          >
            <span>💍</span>
            <span>{isKn ? "ವಿವಾಹ ಯೋಗ" : "Marriage Destiny"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wealth")}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "wealth"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-amber-300 hover:bg-slate-800"
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
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-amber-300 hover:bg-slate-800"
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
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-amber-300 hover:bg-slate-800"
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
                ? "bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 shadow-md shadow-purple-500/30"
                : "text-purple-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🔮</span>
            <span>{isKn ? "ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ Q&A" : "Special Q&A"}</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: 12-MONTH FORECAST */}
          {activeTab === "varshaphala" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-300 flex items-center gap-2">
                    <span>🌟</span>
                    <span>{isKn ? "೧೨-ತಿಂಗಳ ಮಾಸಿಕ ಭವಿಷ್ಯ ಪಥ" : "12-Month Predictive Timeline"}</span>
                  </h3>
                  <span className="text-xs bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {report.twelveMonthForecast.yearRangeStr}
                  </span>
                </div>
                <p className="text-sm text-amber-100/90 leading-relaxed">
                  {isKn ? report.twelveMonthForecast.yearlyThemeKn : report.twelveMonthForecast.yearlyThemeEn}
                </p>
                <div className="mt-2 text-xs text-amber-300/80">
                  {isKn ? "ವರ್ಷಪತಿ ಗ್ರಹ: " : "Year Ruler: "}
                  <strong>{isKn ? report.twelveMonthForecast.varshapathiPlanetKn : report.twelveMonthForecast.varshapathiPlanetEn}</strong>
                </div>
              </div>

              {/* Months Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.twelveMonthForecast.months.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      m.financialRating === "high"
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : m.financialRating === "cautious"
                        ? "bg-rose-950/20 border-rose-500/40"
                        : "bg-slate-900/60 border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-sm text-amber-200">
                        {idx + 1}. {isKn ? m.monthNameKn : m.monthNameEn}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          m.financialRating === "high"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : m.financialRating === "cautious"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {isKn ? m.financialRatingKn : m.financialRatingEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {isKn ? m.careerOutlookKn : m.careerOutlookEn}
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-200/80 pt-1 border-t border-slate-800">
                      <span><strong>{isKn ? "ಶುಭ ದಿನಗಳು:" : "Auspicious:"}</strong> {m.auspiciousDates}</span>
                      <span><strong>{isKn ? "ಶಾಂತಿ:" : "Remedy:"}</strong> {isKn ? m.monthlyRemedyKn : m.monthlyRemedyEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MARRIAGE & RELATIONSHIP DESTINY */}
          {activeTab === "marriage" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                <h3 className="text-base sm:text-lg font-extrabold text-amber-300 mb-1 flex items-center gap-2">
                  <span>💍</span>
                  <span>{isKn ? report.marriageDossier.verdictTitleKn : report.marriageDossier.verdictTitleEn}</span>
                </h3>
                <p className="text-sm text-amber-100 font-semibold mb-3">
                  {isKn ? "ಪ್ರಶಸ್ತ ವಿವಾಹ ಕಾಲ:" : "Matrimonial Timing Window:"}{" "}
                  <span className="text-amber-300">
                    {isKn ? report.marriageDossier.marriageWindowKn : report.marriageDossier.marriageWindowEn}
                  </span>
                </p>

                {/* Spouse Profile Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-600/30 space-y-2 mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <span>👰</span>
                    <span>{isKn ? "ಭಾವಿ ಸಂಗಾತಿಯ ಗುಣಲಕ್ಷಣ & ಆಗಮನ ದಿಕ್ಕು" : "Spouse Temperament & Direction"}</span>
                  </h4>
                  <div className="text-xs text-slate-200 space-y-1.5 leading-relaxed">
                    <div>
                      <strong>{isKn ? "ಆಗಮನ ದಿಕ್ಕು:" : "Direction of Origin:"}</strong>{" "}
                      {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}
                    </div>
                    <div>
                      <strong>{isKn ? "ವ್ಯಕ್ತಿತ್ವ:" : "Temperament:"}</strong>{" "}
                      {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}
                    </div>
                    <div>
                      <strong>{isKn ? "ವೃತ್ತಿ ಕ್ಷೇತ್ರ:" : "Likely Vocation:"}</strong>{" "}
                      {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 mb-2">
                  <strong>{isKn ? "ಕುಜ ಗ್ರಹ ಸ್ಥಿತಿ:" : "Mars & Kuja Analysis:"}</strong>{" "}
                  {isKn ? report.marriageDossier.kujaDoshaAnalysisKn : report.marriageDossier.kujaDoshaAnalysisEn}
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Sacred Remedy:"}</strong>{" "}
                  {isKn ? report.marriageDossier.sacredRemedyKn : report.marriageDossier.sacredRemedyEn}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEALTH, CAREER & DEBT */}
          {activeTab === "wealth" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-300 flex items-center gap-2">
                    <span>💰</span>
                    <span>{isKn ? "ಧನ-ವೃತ್ತಿ ಯೋಗ & ಋಣಮುಕ್ತಿ ನೀಲನಕ್ಷೆ" : "Wealth & Debt Blueprint"}</span>
                  </h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                    {isKn ? "ಇಂದು ಲಗ್ನ ಸೂಚ್ಯಂಕ:" : "Indu Lagna:"} {report.wealthCareer.induLagnaProsperityScore}/100
                  </span>
                </div>

                <div className="text-sm font-bold text-amber-300 mb-2">
                  💼 {isKn ? report.wealthCareer.vocationTypeKn : report.wealthCareer.vocationTypeEn}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
                  {isKn ? report.wealthCareer.prosperityVerdictKn : report.wealthCareer.prosperityVerdictEn}
                </p>

                {/* Active Yogas */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-600/30 mb-3">
                  <div className="text-xs font-bold text-emerald-300 mb-1">
                    ✨ {isKn ? "ಸಕ್ರಿಯ ಧನ-ಯೋಗಗಳು:" : "Active Wealth Yogas:"}
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {(isKn ? report.wealthCareer.primaryWealthYogasKn : report.wealthCareer.primaryWealthYogasEn).map((y, i) => (
                      <li key={i}>{y}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-slate-200 mb-2">
                  <strong>{isKn ? "ಋಣಮುಕ್ತಿ ಕಾಲಮಿತಿ (Debt Clearance):" : "Debt Clearance Timeline:"}</strong>{" "}
                  {isKn ? report.wealthCareer.debtClearanceTimelineKn : report.wealthCareer.debtClearanceTimelineEn}
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                  <strong>{isKn ? "ಧನ-ವೃದ್ಧಿ ಪರಿಹಾರ:" : "Wealth Seva:"}</strong>{" "}
                  {isKn ? report.wealthCareer.wealthRemedyKn : report.wealthCareer.wealthRemedyEn}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEMSTONE & RUDRAKSHA */}
          {activeTab === "gemstone" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                <h3 className="text-base sm:text-lg font-extrabold text-amber-300 mb-3 flex items-center gap-2">
                  <span>💎</span>
                  <span>{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಯಂತ್ರ ನಿರ್ದೇಶನ" : "Gemstones & Sacred Rudraksha"}</span>
                </h3>

                {/* 2 Gems */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Life Gem */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40">
                    <div className="text-xs font-bold text-amber-400">
                      ⭐ {isKn ? report.gemstoneRudraksha.lifeGem.gemTypeKn : report.gemstoneRudraksha.lifeGem.gemTypeEn}
                    </div>
                    <div className="text-base font-extrabold text-white my-1">
                      {isKn ? report.gemstoneRudraksha.lifeGem.nameKn : report.gemstoneRudraksha.lifeGem.nameEn}
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div><strong>{isKn ? "ತೂಕ:" : "Weight:"}</strong> {report.gemstoneRudraksha.lifeGem.recommendedWeight}</div>
                      <div><strong>{isKn ? "ಲೋಹ:" : "Metal:"}</strong> {isKn ? report.gemstoneRudraksha.lifeGem.suitableMetalKn : report.gemstoneRudraksha.lifeGem.suitableMetalEn}</div>
                      <div><strong>{isKn ? "ಬೆರಳು:" : "Finger:"}</strong> {isKn ? report.gemstoneRudraksha.lifeGem.wearingFingerKn : report.gemstoneRudraksha.lifeGem.wearingFingerEn}</div>
                      <div className="text-amber-200/90 font-mono text-[11px] mt-1">{isKn ? report.gemstoneRudraksha.lifeGem.mantraKn : report.gemstoneRudraksha.lifeGem.mantraEn}</div>
                    </div>
                  </div>

                  {/* Fortune Gem */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40">
                    <div className="text-xs font-bold text-amber-400">
                      ✨ {isKn ? report.gemstoneRudraksha.fortuneGem.gemTypeKn : report.gemstoneRudraksha.fortuneGem.gemTypeEn}
                    </div>
                    <div className="text-base font-extrabold text-white my-1">
                      {isKn ? report.gemstoneRudraksha.fortuneGem.nameKn : report.gemstoneRudraksha.fortuneGem.nameEn}
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div><strong>{isKn ? "ತೂಕ:" : "Weight:"}</strong> {report.gemstoneRudraksha.fortuneGem.recommendedWeight}</div>
                      <div><strong>{isKn ? "ಲೋಹ:" : "Metal:"}</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.suitableMetalKn : report.gemstoneRudraksha.fortuneGem.suitableMetalEn}</div>
                      <div><strong>{isKn ? "ಬೆರಳು:" : "Finger:"}</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.wearingFingerKn : report.gemstoneRudraksha.fortuneGem.wearingFingerEn}</div>
                      <div className="text-amber-200/90 font-mono text-[11px] mt-1">{isKn ? report.gemstoneRudraksha.fortuneGem.mantraKn : report.gemstoneRudraksha.fortuneGem.mantraEn}</div>
                    </div>
                  </div>
                </div>

                {/* Prohibited Warning */}
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 mb-3">
                  <strong>⚠️ {isKn ? "ವರ್ಜ್ಯ ರತ್ನ ಎಚ್ಚರಿಕೆ:" : "Prohibited Gemstone Warning:"}</strong>{" "}
                  {isKn ? report.gemstoneRudraksha.prohibitedGems.gemNamesKn : report.gemstoneRudraksha.prohibitedGems.gemNamesEn} -{" "}
                  {isKn ? report.gemstoneRudraksha.prohibitedGems.reasonKn : report.gemstoneRudraksha.prohibitedGems.reasonEn}
                </div>

                {/* Rudraksha & Yantra */}
                <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/40 text-xs space-y-1.5">
                  <div>
                    <strong className="text-purple-300">📿 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ರುದ್ರಾಕ್ಷಿ:" : "Sacred Rudraksha:"}</strong>{" "}
                    {isKn ? report.gemstoneRudraksha.prescribedRudraksha.mukhiKn : report.gemstoneRudraksha.prescribedRudraksha.mukhiEn} (
                    {isKn ? report.gemstoneRudraksha.prescribedRudraksha.deityKn : report.gemstoneRudraksha.prescribedRudraksha.deityEn})
                  </div>
                  <div>
                    <strong className="text-purple-300">🕉️ {isKn ? "ಪ್ರತಿಷ್ಠಾಪಿಸಬೇಕಾದ ಯಂತ್ರ:" : "Consecrated Yantra:"}</strong>{" "}
                    {isKn ? report.gemstoneRudraksha.prescribedYantra.nameKn : report.gemstoneRudraksha.prescribedYantra.nameEn}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AYUR SANJEEVINI HEALTH */}
          {activeTab === "health" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-300 flex items-center gap-2">
                    <span>🌿</span>
                    <span>{isKn ? "ಆಯುರ್ ಸಂಜೀವಿನಿ ವೈದಿಕ ಪ್ರೊಫೈಲ್" : "Ayur Sanjeevini Health Profile"}</span>
                  </h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
                    {isKn ? report.ayurHealth.prakritiConstitutionKn : report.ayurHealth.prakritiConstitutionEn}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-600/30 mb-3">
                  <div className="text-xs font-bold text-emerald-300 mb-1">
                    🏥 {isKn ? "ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಂಗಗಳು:" : "Vulnerable Physiological Zones:"}
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {(isKn ? report.ayurHealth.vulnerableOrgansKn : report.ayurHealth.vulnerableOrgansEn).map((org, i) => (
                      <li key={i}>{org}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                    <strong className="text-amber-300">🥗 {isKn ? "ಆಹಾರ ಪಥ್ಯ:" : "Dietary Advice:"}</strong>{" "}
                    {isKn ? report.ayurHealth.seasonalDietAdviceKn : report.ayurHealth.seasonalDietAdviceEn}
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                    <strong className="text-amber-300">🧘 {isKn ? "ದಿನಚರ್ಯೆ:" : "Daily Routine:"}</strong>{" "}
                    {isKn ? report.ayurHealth.dailyLifestyleHabitKn : report.ayurHealth.dailyLifestyleHabitEn}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                  <strong>{isKn ? "ಧನ್ವಂತರಿ ಮಂತ್ರ:" : "Healing Mantra:"}</strong>{" "}
                  {isKn ? report.ayurHealth.healingMantraKn : report.ayurHealth.healingMantraEn}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SPECIAL ASTROLOGICAL Q&A */}
          {activeTab === "qna" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40">
                <h3 className="text-base sm:text-lg font-extrabold text-purple-300 mb-2 flex items-center gap-2">
                  <span>🔮</span>
                  <span>{isKn ? "ವಿಶೇಷ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಸಮಾಲೋಚನೆ" : "Personal Astrological Q&A"}</span>
                </h3>
                <p className="text-xs text-purple-200/90 leading-relaxed mb-4">
                  {isKn
                    ? "ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಜ್ವಲಂತ ಪ್ರಶ್ನೆಯನ್ನು ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ. ಪಂಡಿತರು ನಿಮ್ಮ ಜಾತಕದ ಆಧಾರದಲ್ಲಿ ನೇರ ಉತ್ತರ ಹಾಗೂ ಶಾಂತಿ ನೀಡಲಿದ್ದಾರೆ."
                    : "Select a question below or type your personal query for a direct Parashari assessment."}
                </p>

                {/* Popular Question Chips */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-amber-300 mb-2">
                    ⚡ {isKn ? "ಜನಪ್ರಿಯ ಪ್ರಶ್ನೆಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):" : "Frequently Asked Questions (Click to Ask):"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.presetQnAList.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskQuestion(isKn ? item.questionKn : item.questionEn)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500/40 hover:border-amber-400 hover:bg-purple-950/60 text-xs text-purple-200 text-left transition-all"
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
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    disabled={isAskingQuestion || !customQuestionText.trim()}
                    onClick={() => handleAskQuestion()}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      isAskingQuestion || !customQuestionText.trim()
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white shadow-lg shadow-purple-600/30"
                    }`}
                  >
                    {isAskingQuestion ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/60 animate-fadeIn">
                    <div className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <span>❓</span>
                      <span>&ldquo;{customAnswer.question}&rdquo;</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed">
                      {customAnswer.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer & A4 PDF Download Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Module Selection Checkboxes */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="font-bold text-amber-300">{isKn ? "ಮುದ್ರಣ ಪುಟಗಳು:" : "Include Pages:"}</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModules.varshaphala}
                onChange={(e) => setSelectedModules((s) => ({ ...s, varshaphala: e.target.checked }))}
                className="rounded text-amber-500"
              />
              <span>{isKn ? "೧೨-ತಿಂಗಳು" : "12-Month"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModules.marriage}
                onChange={(e) => setSelectedModules((s) => ({ ...s, marriage: e.target.checked }))}
                className="rounded text-amber-500"
              />
              <span>{isKn ? "ವಿವಾಹ" : "Marriage"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModules.wealth}
                onChange={(e) => setSelectedModules((s) => ({ ...s, wealth: e.target.checked }))}
                className="rounded text-amber-500"
              />
              <span>{isKn ? "ಧನ-ವೃತ್ತಿ" : "Wealth"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModules.gemstone}
                onChange={(e) => setSelectedModules((s) => ({ ...s, gemstone: e.target.checked }))}
                className="rounded text-amber-500"
              />
              <span>{isKn ? "ರತ್ನ" : "Gems"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModules.qna}
                onChange={(e) => setSelectedModules((s) => ({ ...s, qna: e.target.checked }))}
                className="rounded text-amber-500"
              />
              <span>{isKn ? "ಪ್ರಶ್ನೋತ್ತರ" : "Q&A"}</span>
            </label>
          </div>

          {/* Download Button */}
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadA4Pdf}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 border-2 border-amber-400 shadow-xl ${
              isGeneratingPdf
                ? "bg-amber-950 text-amber-300 opacity-80 cursor-wait"
                : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 hover:shadow-amber-500/40 active:scale-95"
            }`}
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
};
