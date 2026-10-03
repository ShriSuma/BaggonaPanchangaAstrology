import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { RASHIS } from "../../core/AstroTypes";
import {
  calculateGurukulaMasterclass,
  type GurukulaStep,
  type GurukulaMasterclassReport,
  type GurukulaQuestionAnswer
} from "../../core/kundliReadingGurukulaEngine";
import {
  CHART_LAYOUT,
  cellOrigin,
  centerRect,
  chartViewSize,
  getCellForRashiIndex,
  houseForSign
} from "./southIndianLayout";

const RASHI_NAMES_KN = [
  "ಮೇಷ",
  "ವೃಷಭ",
  "ಮಿಥುನ",
  "ಕರ್ಕಾಟಕ",
  "ಸಿಂಹ",
  "ಕನ್ಯಾ",
  "ತುಲಾ",
  "ವೃಶ್ಚಿಕ",
  "ಧನು",
  "ಮಕರ",
  "ಕುಂಭ",
  "ಮೀನ"
];

const PLANET_NAMES_KN: Record<string, string> = {
  Sun: "ಸೂರ್ಯ",
  Moon: "ಚಂದ್ರ",
  Mars: "ಕುಜ",
  Mercury: "ಬುಧ",
  Jupiter: "ಗುರು",
  Venus: "ಶುಕ್ರ",
  Saturn: "ಶನಿ",
  Rahu: "ರಾಹು",
  Ketu: "ಕೇತು",
  Uranus: "ಹರ್ಷಲ್",
  Neptune: "ನೆಪ್ಚೂನ್",
  Pluto: "ಪ್ಲುಟೊ",
  Maandi: "ಮಾಂದಿ",
  Gulika: "ಗುಳಿಕ"
};

const toKnDigits = (num: number | string) =>
  String(num).replace(/[0-9]/g, (d) => "೦೧೨೩೪೫೬೭೮೯"[Number(d)] || d);

export interface KundliGurukulaContentProps {
  kundli: KundliOutput;
  birthDate?: string;
  birthTime?: string;
  nativeName?: string;
  gender?: string;
  isStandalonePage?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

type GurukulaMainTab = "walkthrough" | "panchanga" | "qa" | "diagnostics";
type DiagnosticsSubTab = "temperament" | "doshas" | "gandantharas" | "fears" | "secrets";
type PanchangaSubTab = "angas" | "navatara" | "upagrahas" | "pushkara";

export const KundliGurukulaContent: React.FC<KundliGurukulaContentProps> = ({
  kundli,
  birthDate,
  birthTime,
  nativeName = "ಜಾತಕರು",
  gender,
  isStandalonePage = false,
  onBack,
  onClose
}) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<"kn" | "en">(
    i18n.language.startsWith("kn") ? "kn" : "en"
  );

  const [activeTab, setActiveTab] = useState<GurukulaMainTab>("walkthrough");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("career_growth");
  const [selectedQaCategory, setSelectedQaCategory] = useState<string>("all");
  const [diagnosticsSubTab, setDiagnosticsSubTab] = useState<DiagnosticsSubTab>("temperament");
  const [panchangaSubTab, setPanchangaSubTab] = useState<PanchangaSubTab>("angas");

  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const audioUttRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Synchronize language with global i18n
  useEffect(() => {
    setLang(i18n.language.startsWith("kn") ? "kn" : "en");
  }, [i18n.language]);

  // Compute Masterclass Report (11 Steps + Live Gochara + Q&A 3-Pillars + Deep Diagnostics)
  const report: GurukulaMasterclassReport = useMemo(() => {
    return calculateGurukulaMasterclass(kundli, birthDate, birthTime, nativeName, gender);
  }, [kundli, birthDate, birthTime, nativeName, gender]);

  // Set default question ID when report loads
  useEffect(() => {
    if (report.questions.length > 0 && !report.questions.some((q) => q.id === selectedQuestionId)) {
      setSelectedQuestionId(report.questions[0]!.id);
    }
  }, [report.questions, selectedQuestionId]);

  const currentStep: GurukulaStep = report.steps[activeStepIndex] || report.steps[0]!;
  const currentQuestion: GurukulaQuestionAnswer =
    report.questions.find((q) => q.id === selectedQuestionId) || report.questions[0]!;

  // Speech helper
  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingKey(null);
  };

  useEffect(() => {
    stopAudio();
  }, [activeStepIndex, selectedQuestionId, activeTab, diagnosticsSubTab, panchangaSubTab]);

  const handleToggleSpeech = (key: string, textKn: string, textEn: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(
        lang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಸೌಲಭ್ಯವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ."
          : "Speech synthesis is not supported in this browser."
      );
      return;
    }

    if (speakingKey === key) {
      stopAudio();
      return;
    }

    stopAudio();
    setSpeakingKey(key);

    const utterance = new SpeechSynthesisUtterance(lang === "kn" ? textKn : textEn);
    utterance.lang = lang === "kn" ? "kn-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setSpeakingKey(null);
    utterance.onerror = () => setSpeakingKey(null);

    audioUttRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Keyboard navigation for steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === "walkthrough") {
        if (e.key === "ArrowRight") {
          setActiveStepIndex((prev) => Math.min(prev + 1, report.steps.length - 1));
        } else if (e.key === "ArrowLeft") {
          setActiveStepIndex((prev) => Math.max(prev - 1, 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, report.steps.length]);

  const isKn = lang === "kn";
  const displayName = isKn && (nativeName === "Devotee" || !nativeName) ? "ಜಾತಕರು" : nativeName;

  // Visual Chart Setup
  const size = chartViewSize();
  const { cell: cw } = CHART_LAYOUT;
  const cr = centerRect();
  const lagnaIdx = kundli.lagnaRashi.index;

  const byRashi = new Map<number, PlanetPosition[]>();
  for (const p of kundli.planets) {
    const arr = byRashi.get(p.rashi.index) ?? [];
    arr.push(p);
    byRashi.set(p.rashi.index, arr);
  }

  const stepPillTitles = [
    { num: 1, kn: "೧. ಲಗ್ನ", en: "1. Lagna" },
    { num: 2, kn: "೨. ಚಂದ್ರ", en: "2. Moon" },
    { num: 3, kn: "೩. ಸುಖ (೪)", en: "3. Sukha (4th)" },
    { num: 4, kn: "೪. ಕಳತ್ರ (೭)", en: "4. Kalatra (7th)" },
    { num: 5, kn: "೫. ಕರ್ಮ (೧೦)", en: "5. Karma (10th)" },
    { num: 6, kn: "೬. ತ್ರಿಕೋಣ (೫, ೯)", en: "6. Trikona (5, 9)" },
    { num: 7, kn: "೭. ತ್ರಿಕ & ಮಾಂದಿ", en: "7. Dusthana/Maandi" },
    { num: 8, kn: "೮. ಬಲಾಬಲ & ಮೈತ್ರಿ", en: "8. Dignity Matrix" },
    { num: 9, kn: "೯. ಯೋಗಗಳು", en: "9. Yogas" },
    { num: 10, kn: "೧೦. ದಶಾ ಕಾಲ", en: "10. Vimshottari" },
    { num: 11, kn: "೧೧. ದೈವಜ್ಞ ಸೂತ್ರ", en: "11. Consultation" }
  ];

  // Q&A Category Filters
  const qaCategories = [
    { id: "all", kn: `🌟 ಎಲ್ಲಾ (${toKnDigits(report.questions.length)})`, en: `🌟 All (${report.questions.length})` },
    { id: "career", kn: "💼 ವೃತ್ತಿ/ಉದ್ಯೋಗ", en: "💼 Career" },
    { id: "business", kn: "🏢 ವ್ಯಾಪಾರ/ಉದ್ಯಮ", en: "🏢 Business" },
    { id: "marriage", kn: "💍 ವಿವಾಹ ಭಾಗ್ಯ", en: "💍 Marriage" },
    { id: "friction", kn: "💔 ದಾಂಪತ್ಯ ಕಲಹ", en: "💔 Marital Friction" },
    { id: "finance", kn: "💰 ಸಾಲ & ಧನಾಗಮನ", en: "💰 Debt & Wealth" },
    { id: "property", kn: "🏠 ಆಸ್ತಿ & ವಾಹನ", en: "🏠 Property & Vehicle" },
    { id: "health", kn: "🌿 ಆರೋಗ್ಯ ರಕ್ಷಣೆ", en: "🌿 Health" },
    { id: "progeny", kn: "👶 ಸಂತಾನ ಭಾಗ್ಯ", en: "👶 Progeny" }
  ];

  const filteredQuestions =
    selectedQaCategory === "all"
      ? report.questions
      : report.questions.filter((q) => q.category === selectedQaCategory);

  return (
    <div className="flex flex-col w-full bg-[#faf6ee] text-stone-900">
      
      {/* ============================================================== */}
      {/* 1. Header & Actions (Warm Cream & Golden Line Border)          */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3.5 border-b-2 border-[#d4af37]/50 bg-[#fffdfa] shadow-sm shrink-0">
        <div className="flex items-center gap-2.5 md:gap-3.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d4af37] bg-[#fbf7ee] text-amber-950 font-black text-xs hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title={isKn ? "ಕುಂಡಲಿ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Back to Kundli"}
            >
              <span>←</span>
              <span className="hidden sm:inline">{isKn ? "ಕುಂಡಲಿಗೆ ಹಿಂತಿರುಗಿ" : "Back"}</span>
            </button>
          )}

          <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-2xl border-2 border-[#d4af37] bg-gradient-to-br from-amber-100 via-[#fff8e7] to-amber-200 text-2xl shadow-sm shrink-0">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base md:text-xl font-black text-amber-950 tracking-tight">
                {isKn ? "ಕುಂಡಲಿ ವಾಚನ ಗುರು" : "Kundli Gurukula Masterclass"}
              </h2>
              <span className="inline-flex items-center rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] md:text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                {isKn ? "ದೈವಜ್ಞ ಶಿಕ್ಷಣ & ೩-ಸ್ತಂಭ ವಿಶ್ಲೇಷಣೆ" : "Priest Shastric Engine"}
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-stone-700 mt-0.5 truncate max-w-xs md:max-w-md font-medium">
              {isKn
                ? `${displayName} • ಲಗ್ನ: ${report.lagnaRashiKn} | ರಾಶಿ: ${report.moonSignKn} (${report.nakshatraKn})`
                : `${displayName} • Asc: ${report.lagnaRashiEn} | Moon: ${report.moonSignEn} (${report.nakshatraEn})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Switcher */}
          <div className="inline-flex rounded-xl bg-[#fbf7ee] border-2 border-[#d4af37]/60 p-0.5 text-xs font-bold shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setLang("kn")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                isKn
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-sm"
                  : "text-amber-950 hover:bg-amber-100/60"
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                !isKn
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-sm"
                  : "text-amber-950 hover:bg-amber-100/60"
              }`}
            >
              English
            </button>
          </div>

          {/* Optional Modal Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border-2 border-[#d4af37] bg-[#fbf7ee] text-stone-800 hover:bg-amber-200 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all text-base md:text-lg font-bold shrink-0 shadow-sm"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Main Tab Navigation Bar (Cream & Golden Line Border)       */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 px-3 md:px-6 py-2.5 border-b border-[#d4af37]/40 bg-[#fdfbf7] overflow-x-auto scrollbar-thin scrollbar-thumb-amber-400/40 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("walkthrough")}
          className={`flex items-center gap-1.5 md:gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all shrink-0 border ${
            activeTab === "walkthrough"
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-[1.02]"
              : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-amber-950 shadow-sm"
          }`}
        >
          <span>🎓</span>
          <span>{isKn ? "೧೧-ಹಂತದ ವಾಚನ" : "11-Step Masterclass"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("panchanga")}
          className={`flex items-center gap-1.5 md:gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all shrink-0 border ${
            activeTab === "panchanga"
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-[1.02]"
              : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-amber-950 shadow-sm"
          }`}
        >
          <span>🌟</span>
          <span>{isKn ? "ಪಂಚಾಂಗ & ನಕ್ಷತ್ರ ರಹಸ್ಯ" : "Panchanga & Nakshatra"}</span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-black border border-[#d4af37] text-amber-950">
            {isKn ? "೫+" : "5+"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`flex items-center gap-1.5 md:gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all shrink-0 border ${
            activeTab === "qa"
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-[1.02]"
              : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-amber-950 shadow-sm"
          }`}
        >
          <span>❓</span>
          <span>{isKn ? "ಪ್ರಶ್ನೋತ್ತರ ಗುರು (೩-ಸ್ತಂಭ)" : "Q&A 3-Pillars"}</span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-black border border-[#d4af37] text-amber-950">
            {isKn ? toKnDigits(report.questions.length) : report.questions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diagnostics")}
          className={`flex items-center gap-1.5 md:gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all shrink-0 border ${
            activeTab === "diagnostics"
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-[1.02]"
              : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-amber-950 shadow-sm"
          }`}
        >
          <span>🔱</span>
          <span>{isKn ? "ದೋಷ, ಗಂಡಾಂತರ & ರಹಸ್ಯ" : "Dosha, Gandanthara & Secrets"}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. TAB 1: 11-Step Masterclass Walkthrough                      */}
      {/* ============================================================== */}
      {activeTab === "walkthrough" && (
        <div className={`flex flex-col ${isStandalonePage ? "w-full" : "flex-1 overflow-hidden"}`}>
          {/* Stepper Roadmap Ribbon */}
          <div className="flex items-center gap-1.5 px-3 md:px-6 py-2 overflow-x-auto border-b border-[#d4af37]/30 bg-[#fdfbf6] scrollbar-thin scrollbar-thumb-amber-400/30 shrink-0">
            {stepPillTitles.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isCompleted = idx < activeStepIndex;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 shadow-md font-black border-[#b8860b] ring-1 ring-amber-400 scale-105"
                      : isCompleted
                      ? "bg-amber-100/70 text-amber-950 border-[#d4af37]/50 hover:bg-amber-200/60"
                      : "bg-[#fffdf9] text-stone-600 border-stone-200 hover:bg-amber-50 hover:text-stone-900"
                  }`}
                >
                  {isCompleted && <span className="text-[10px] text-amber-700 font-black">✓</span>}
                  <span>{isKn ? step.kn : step.en}</span>
                </button>
              );
            })}
          </div>

          {/* Split Content Layout */}
          <div className={`p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 ${isStandalonePage ? "w-full" : "flex-1 overflow-y-auto"}`}>
            
            {/* Left Column: Visual Chart Correlation */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Visual Mini South Indian Chart */}
              <div className="rounded-2xl border-2 border-[#d4af37] bg-[#fffdf8] p-3 shadow-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d4af37]/40 text-xs font-bold text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">🗺️</span>
                    <span>{isKn ? "ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ (ಸಕ್ರಿಯ ಹಂತ)" : "South Indian Chart (Active Step)"}</span>
                  </span>
                  <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-semibold border border-[#d4af37]/40">
                    {isKn ? "ಹಳದಿ: ಸಕ್ರಿಯ ಸ್ಥಾನ" : "Amber: Focus"}
                  </span>
                </div>

                <svg
                  viewBox={`0 0 ${size} ${size}`}
                  className="w-full h-auto max-h-[250px] sm:max-h-[290px] select-none"
                  style={{ background: "#fffdf8" }}
                >
                  <defs>
                    <style>{`
                      @keyframes activeGlow {
                        0%, 100% { fill: #FEF3C7; stroke: #D97706; stroke-width: 2.5; }
                        50% { fill: #FDE68A; stroke: #B45309; stroke-width: 3.5; }
                      }
                      .gurukula-highlight {
                        animation: activeGlow 2.5s ease-in-out infinite;
                      }
                    `}</style>
                  </defs>

                  {/* 12 Signs / Houses */}
                  {RASHIS.map((rashi) => {
                    const cell = getCellForRashiIndex(rashi.index);
                    const { x, y } = cellOrigin(cell);
                    const house = houseForSign(lagnaIdx, rashi.index);
                    const isFocusHouse = currentStep.focusHouses.includes(house);
                    const isFocusRashi = currentStep.focusRashis.includes(rashi.index);
                    const isTarget = isFocusHouse || isFocusRashi;
                    const isLagna = rashi.index === lagnaIdx;
                    const isMoon = rashi.index === kundli.moonSign.index;

                    let cellFill = "#ffffff";
                    let cellStroke = "#e2e8f0";
                    let cellStrokeWidth = 1;
                    let animClass = "";

                    if (isTarget) {
                      cellFill = "#FEF3C7";
                      cellStroke = "#D97706";
                      cellStrokeWidth = 2.5;
                      animClass = "gurukula-highlight";
                    } else if (isLagna) {
                      cellFill = "#FFFBEB";
                      cellStroke = "#F59E0B";
                      cellStrokeWidth = 1.5;
                    } else if (isMoon) {
                      cellFill = "#F0F9FF";
                      cellStroke = "#0284C7";
                      cellStrokeWidth = 1.5;
                    }

                    const occupants = byRashi.get(rashi.index) ?? [];

                    return (
                      <g key={rashi.index}>
                        <rect
                          x={x + 2}
                          y={y + 2}
                          width={cw - 4}
                          height={cw - 4}
                          fill={cellFill}
                          stroke={cellStroke}
                          strokeWidth={cellStrokeWidth}
                          className={animClass}
                          rx="4"
                        />
                        {/* Rashi Name in pure Kannada */}
                        <text x={x + 6} y={y + 13} fontSize="8" fill="#78350f" fontWeight="700">
                          {isKn ? RASHI_NAMES_KN[rashi.index] : rashi.english.slice(0, 3)}
                        </text>

                        {/* House Number Badge in pure Kannada */}
                        <text
                          x={x + cw - 6}
                          y={y + 13}
                          fontSize="7.5"
                          fill={isTarget ? "#b45309" : "#64748b"}
                          fontWeight={isTarget ? "900" : "600"}
                          textAnchor="end"
                        >
                          {isKn ? `ಭಾ ${toKnDigits(house)}` : `H${house}`}
                        </text>

                        {/* Occupying Planets in pure Kannada */}
                        <g transform={`translate(${x + 6}, ${y + 24})`}>
                          {isLagna && (
                            <text x={0} y={0} fontSize="7" fill="#b45309" fontWeight="800">
                              {isKn ? "[ಲಗ್ನ]" : "[ASC]"}
                            </text>
                          )}
                          {occupants.map((p, pIdx) => {
                            const isSpecial = currentStep.focusPlanets.includes(p.name);
                            return (
                              <text
                                key={p.name}
                                x={0}
                                y={(isLagna ? 10 : 0) + pIdx * 9}
                                fontSize="7.5"
                                fill={isSpecial ? "#b91c1c" : "#1e293b"}
                                fontWeight={isSpecial ? "900" : "600"}
                              >
                                {isKn ? (PLANET_NAMES_KN[p.name] || p.name) : p.name.slice(0, 3)}
                                {p.isRetrograde ? (isKn ? " (ವ)" : " (R)") : ""}
                              </text>
                            );
                          })}
                        </g>
                      </g>
                    );
                  })}

                  {/* Center Box of South Chart */}
                  <rect
                    x={cr.x + 2}
                    y={cr.y + 2}
                    width={cr.width - 4}
                    height={cr.height - 4}
                    fill="#fffdf8"
                    stroke="#d4af37"
                    strokeWidth="1.5"
                    rx="6"
                  />
                  <text
                    x={cr.x + cr.width / 2}
                    y={cr.y + cr.height / 2 - 12}
                    fontSize="10"
                    fontWeight="900"
                    fill="#78350f"
                    textAnchor="middle"
                  >
                    {displayName}
                  </text>
                  <text
                    x={cr.x + cr.width / 2}
                    y={cr.y + cr.height / 2 + 2}
                    fontSize="8"
                    fontWeight="700"
                    fill="#92400e"
                    textAnchor="middle"
                  >
                    {isKn
                      ? `ಲಗ್ನ: ${report.lagnaRashiKn} | ರಾಶಿ: ${report.moonSignKn}`
                      : `Lagna: ${report.lagnaRashiEn} | Moon: ${report.moonSignEn}`}
                  </text>
                  <text
                    x={cr.x + cr.width / 2}
                    y={cr.y + cr.height / 2 + 15}
                    fontSize="7.5"
                    fill="#b45309"
                    textAnchor="middle"
                  >
                    {isKn ? `ನಕ್ಷತ್ರ: ${report.nakshatraKn}` : `Nak: ${report.nakshatraEn}`}
                  </text>
                </svg>
              </div>

              {/* Where to Look Inspection Box */}
              <div className="rounded-2xl border-2 border-[#d4af37]/60 bg-[#fffdf9] p-4 text-xs space-y-2.5 shadow-md">
                <div className="flex items-center gap-2 text-amber-950 font-black uppercase tracking-wider text-[11px] border-b border-[#d4af37]/30 pb-1.5">
                  <span>📍</span>
                  <span>{isKn ? "ದೃಷ್ಟಿ ಕೇಂದ್ರ (ಪರಿಶೀಲನಾ ಸ್ಥಾನ)" : "Observation Focus"}</span>
                </div>
                <p className="text-stone-900 font-semibold leading-relaxed">
                  {isKn
                    ? currentStep.whereToLookKn.primaryHouseKn
                    : currentStep.whereToLookEn.primaryHouseEn}
                </p>
                <p className="text-stone-700 leading-relaxed">
                  {isKn
                    ? currentStep.whereToLookKn.rashiAndLordKn
                    : currentStep.whereToLookEn.rashiAndLordEn}
                </p>
                <div className="rounded-xl bg-amber-50 p-2.5 border border-[#d4af37]/50 text-stone-900 text-[11px] leading-relaxed shadow-inner">
                  <span className="font-bold text-amber-950">💡 {isKn ? "ಗುರು ಸೂತ್ರ:" : "Master Key:"} </span>
                  {isKn
                    ? currentStep.whereToLookKn.observationTipKn
                    : currentStep.whereToLookEn.observationTipEn}
                </div>
              </div>
            </div>

            {/* Right Column: Pedagogical & Consultation Cards */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Step Title Header Banner */}
              <div className="rounded-2xl border-2 border-[#d4af37]/60 bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 shadow-md">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                    <span>✨</span>
                    <span>{isKn ? currentStep.stageBadgeKn : currentStep.stageBadgeEn}</span>
                  </span>
                  <span className="text-xs font-black text-amber-900">
                    {isKn ? `ಹಂತ ${toKnDigits(currentStep.stepIndex)} / ೧೧` : `Step ${currentStep.stepIndex} / 11`}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black text-stone-900 mt-2">
                  {isKn ? currentStep.titleKn : currentStep.titleEn}
                </h3>
              </div>

              {/* Card 1: Technical & Shastric Mechanics */}
              <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 text-xs space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider border-b border-[#d4af37]/30 pb-1.5">
                  <span>📐</span>
                  <span>{isKn ? "ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಸೂತ್ರ & ಗ್ರಹ ಮೈತ್ರಿ" : "Classical Shastric Mechanics & Dignity"}</span>
                </div>
                
                <div className="rounded-xl bg-amber-50/80 border border-[#d4af37]/40 p-3 italic text-amber-950 text-xs font-medium">
                  "{isKn ? currentStep.technicalAnalysisKn.shastricRuleKn : currentStep.technicalAnalysisEn.shastricRuleEn}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-900">
                  <div className="rounded-lg bg-[#faf6ee] p-2.5 border border-amber-200">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">{isKn ? "ಗ್ರಹ ಬಲಾಬಲ" : "Dignity"}</span>
                    <span className="font-bold text-amber-950">
                      {isKn ? currentStep.technicalAnalysisKn.dignityKn : currentStep.technicalAnalysisEn.dignityEn}
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#faf6ee] p-2.5 border border-amber-200">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">{isKn ? "ಗ್ರಹ ಮೈತ್ರಿ ಸಂಬಂಧ" : "Planetary Relations"}</span>
                    <span className="font-bold text-amber-950">
                      {isKn ? currentStep.technicalAnalysisKn.grahaRelationsKn : currentStep.technicalAnalysisEn.grahaRelationsEn}
                    </span>
                  </div>
                </div>

                {currentStep.technicalAnalysisKn.specialConditionKn && (
                  <div className="rounded-lg bg-amber-100/60 border border-[#d4af37]/50 p-2.5 text-stone-900 text-[11px]">
                    <span className="font-bold text-amber-950">⚡ {isKn ? "ವಿಶೇಷ ಸ್ಥಿತಿ:" : "Special Note:"} </span>
                    {isKn
                      ? currentStep.technicalAnalysisKn.specialConditionKn
                      : currentStep.technicalAnalysisEn.specialConditionEn}
                  </div>
                )}

                <ul className="space-y-1.5 text-stone-700 pl-2">
                  {(isKn
                    ? currentStep.technicalAnalysisKn.bulletPointsKn
                    : currentStep.technicalAnalysisEn.bulletPointsEn
                  ).map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#b8860b] mt-0.5">•</span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2: Why this Result & Life Domain Impact */}
              <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 text-xs space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider border-b border-[#d4af37]/30 pb-1.5">
                  <span>🌿</span>
                  <span>{isKn ? "ಏಕೆ ಈ ಫಲಿತ? / ಕಾರಣ-ಪರಿಣಾಮ ತರ್ಕ" : "Why this Result & Life Domain"}</span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200">
                    <span className="font-bold text-amber-950 block text-[11px] mb-0.5">
                      {isKn ? "ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರೀಯ ತರ್ಕ:" : "Astrological Shastric Logic:"}
                    </span>
                    <p className="text-stone-800 leading-relaxed">
                      {isKn
                        ? currentStep.whyThisResultKn.astrologicalLogicKn
                        : currentStep.whyThisResultEn.astrologicalLogicEn}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200">
                    <span className="font-bold text-amber-950 block text-[11px] mb-0.5">
                      {isKn ? "ಜೀವನದ ಪ್ರಮುಖ ಕ್ಷೇತ್ರ:" : "Life Domain Impact:"}
                    </span>
                    <p className="text-stone-800 leading-relaxed">
                      {isKn
                        ? currentStep.whyThisResultKn.lifeDomainKn
                        : currentStep.whyThisResultEn.lifeDomainEn}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200">
                    <span className="font-bold text-amber-950 block text-[11px] mb-0.5">
                      {isKn ? "ಪ್ರಮುಖ ಪ್ರಭಾವ ಬೀರುವ ಅಂಶಗಳು:" : "Key Influences:"}
                    </span>
                    <ul className="space-y-1 text-stone-700 mt-1 pl-2">
                      {(isKn
                        ? currentStep.whyThisResultKn.keyInfluencesKn
                        : currentStep.whyThisResultEn.keyInfluencesEn
                      ).map((inf, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-[#b8860b]">▸</span>
                          <span>{inf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 3: Priest Consultation Delivery Script */}
              <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-b from-[#fffefc] to-[#faf6ee] p-4 text-xs space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-2">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                    <span>👑</span>
                    <span>{isKn ? "ದೈವಜ್ಞ ವಾಚನ ಶೈಲಿ (ಭಕ್ತರಿಗೆ ಹೇಳುವ ಮಾತುಗಳು)" : "Royal Astrologer Delivery Script"}</span>
                  </div>

                  {/* Listen / TTS Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const knText = `${currentStep.spokenConsultationScriptKn}. ಶಾಂತಿ ಪರಿಹಾರ: ${currentStep.practicalGuidanceKn}`;
                      const enText = `${currentStep.spokenConsultationScriptEn}. Guidance: ${currentStep.practicalGuidanceEn}`;
                      handleToggleSpeech(`step_${activeStepIndex}`, knText, enText);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      speakingKey === `step_${activeStepIndex}`
                        ? "bg-red-600 text-white border-red-500 animate-pulse shadow-md"
                        : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 border-[#b8860b] shadow-sm hover:scale-105"
                    }`}
                  >
                    <span>{speakingKey === `step_${activeStepIndex}` ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಧ್ವನಿ ಆಲಿಸಿ"}</span>
                  </button>
                </div>

                {/* Practical Words to tell Client */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-900 block">
                    💬 {isKn ? "ಭಕ್ತರಿಗೆ ಮುಖತಃ ಹೇಳಬೇಕಾದ ನಿಖರ ಮಾತುಗಳು:" : "Exact Spoken Words for Devotee:"}
                  </span>
                  <p className="text-stone-800 leading-relaxed text-xs pl-2 border-l-2 border-[#d4af37]">
                    {isKn
                      ? currentStep.spokenConsultationScriptKn
                      : currentStep.spokenConsultationScriptEn}
                  </p>
                </div>

                {/* Actionable Remedies */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-400/70 p-3 text-emerald-950 space-y-1 shadow-sm">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                    <span>🪔</span>
                    <span>{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ & ಆಚರಣೆ:" : "Prescribed Remedy & Discipline:"}</span>
                  </span>
                  <p className="text-xs leading-relaxed font-medium">
                    {isKn
                      ? currentStep.practicalGuidanceKn
                      : currentStep.practicalGuidanceEn}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t-2 border-[#d4af37]/40 bg-[#fffdfa] shrink-0">
            <button
              type="button"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
              className={`inline-flex items-center gap-2 rounded-xl px-4 md:px-5 py-2 text-xs font-bold border transition-all ${
                activeStepIndex === 0
                  ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  : "bg-[#fbf7ee] text-amber-950 border-[#d4af37] hover:bg-amber-100 hover:scale-105 active:scale-95 shadow-sm"
              }`}
            >
              <span>⬅</span>
              <span>{isKn ? "ಹಿಂದಿನ ಹಂತ" : "Previous Step"}</span>
            </button>

            <span className="text-xs font-black text-amber-950 hidden sm:inline">
              {isKn ? `ಹಂತ ${toKnDigits(activeStepIndex + 1)} / ೧೧` : `Step ${activeStepIndex + 1} / 11`}
            </span>

            <button
              type="button"
              onClick={() => {
                if (activeStepIndex < report.steps.length - 1) {
                  setActiveStepIndex((prev) => prev + 1);
                } else {
                  setActiveTab("panchanga");
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-5 md:px-6 py-2 text-xs font-black text-stone-950 shadow-md hover:scale-105 active:scale-95 transition-all border border-[#b8860b]"
            >
              <span>
                {activeStepIndex < report.steps.length - 1
                  ? isKn
                    ? "ಮುಂದಿನ ಹಂತ"
                    : "Next Step"
                  : isKn
                  ? "ಪಂಚಾಂಗ & ನಕ್ಷತ್ರ ರಹಸ್ಯ ➜"
                  : "Panchanga & Nakshatra ➜"}
              </span>
              <span>➜</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 2: Panchanga & Nakshatra Deep Dive                       */}
      {/* ============================================================== */}
      {activeTab === "panchanga" && (
        <div className={`flex flex-col ${isStandalonePage ? "w-full" : "flex-1 overflow-hidden"}`}>
          
          {/* Sub-Navigation Ribbon (Sticky) */}
          <div className="flex items-center gap-1.5 px-3 md:px-6 py-2 overflow-x-auto border-b border-[#d4af37]/30 bg-[#fdfbf6] scrollbar-thin scrollbar-thumb-amber-400/30 shrink-0">
            <button
              type="button"
              onClick={() => setPanchangaSubTab("angas")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                panchangaSubTab === "angas"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>🌟</span>
              <span>{isKn ? "ಪಂಚಾಂಗ ೫ ಅಂಗಗಳು & ನಕ್ಷತ್ರ" : "5 Angas & Nakshatra"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPanchangaSubTab("navatara")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                panchangaSubTab === "navatara"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>🧭</span>
              <span>{isKn ? "ನವತಾರಾ ಚಕ್ರ (೯ ತಾರೆಗಳು & ಗ್ರಹಗಳು)" : "Navatara Chakra Matrix"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPanchangaSubTab("upagrahas")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                panchangaSubTab === "upagrahas"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>🛰️</span>
              <span>{isKn ? "೧೦ ಉಪಗ್ರಹಗಳು & ಉಪರಿ ವೇಧ" : "10 Upagrahas & Upari Vedha"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPanchangaSubTab("pushkara")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                panchangaSubTab === "pushkara"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>🍯</span>
              <span>{isKn ? "ಪುಷ್ಕರ ನವಾಂಶ ಅಮೃತ ರಕ್ಷಣೆ" : "Pushkara Navamsha"}</span>
              {report.panchangaAngas.pushkaraPlacements.length > 0 && (
                <span className="rounded-full bg-emerald-100 border border-emerald-500 px-1.5 py-0.2 text-[9px] text-emerald-900 font-black">
                  {isKn ? toKnDigits(report.panchangaAngas.pushkaraPlacements.length) : report.panchangaAngas.pushkaraPlacements.length}
                </span>
              )}
            </button>
          </div>

          {/* Scrollable Container */}
          <div className={`p-4 md:p-6 space-y-5 ${isStandalonePage ? "w-full" : "flex-1 overflow-y-auto"}`}>
            
            {/* SUB-SECTION 1: 5 ANGAS & NAKSHATRA SPOTLIGHT */}
            {panchangaSubTab === "angas" && (
              <div className="space-y-5">
                {/* Hero Intro Banner */}
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                        ✨ {isKn ? "ಪಂಚ ಮಹಾಭೂತ ತತ್ವಗಳು" : "5 Cosmic Elements & Angas"}
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        {isKn ? "ವೇದ ಸಮ್ಮತ ಪಂಚಾಂಗ ವಿಜ್ಞಾನ" : "Classical Vedic Panchanga Engine"}
                      </span>
                    </div>
                    <h3 className="text-base md:text-xl font-black text-stone-900">
                      {isKn ? "ಜನ್ಮ ಪಂಚಾಂಗದ ೫ ಅಂಗಗಳು & ನಕ್ಷತ್ರ ರಹಸ್ಯ" : "Natal 5 Angas & Nakshatra Deep Dive"}
                    </h3>
                    <p className="text-xs text-stone-700 mt-1 max-w-2xl leading-relaxed">
                      {isKn
                        ? "ತಿಥಿ (ಜಲ ತತ್ವ - ಶ್ರೀ/ಸಂಪತ್ತು), ವಾರ (ಅಗ್ನಿ ತತ್ವ - ಆಯುಷ್ಯ/ತೇಜಸ್ಸು), ನಕ್ಷತ್ರ (ವಾಯು ತತ್ವ - ಮಾನಸಿಕ ಪ್ರವೃತ್ತಿ & ಕರ್ಮ), ಯೋಗ (ಆಕಾಶ ತತ್ವ - ಆರೋಗ್ಯ & ರೋಗನಿರೋಧಕ ಶಕ್ತಿ), ಕರಣ (ಪೃಥ್ವಿ ತತ್ವ - ಕರ್ಮ ಸಾಧನೆ)."
                        : "Tithi (Water - Wealth), Vaara (Fire - Vitality & Longevity), Nakshatra (Air - Karma & Mind), Yoga (Ether - Immunity & Health), Karana (Earth - Work & Accomplishment)."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nak = report.panchangaAngas.nakshatra;
                      const t = report.panchangaAngas.tithi;
                      const v = report.panchangaAngas.vaara;
                      const y = report.panchangaAngas.yoga;
                      const k = report.panchangaAngas.karana;
                      const speechKn = `ಜನ್ಮ ಪಂಚಾಂಗ ವಾಚನ: ತಿಥಿ ${t.nameKn}. ವಾರ ${v.weekdayKn}, ಅಧಿಪತಿ ${v.lordKn}. ಜನ್ಮ ನಕ್ಷತ್ರ ${nak.nameKn} ಪಾದ ${toKnDigits(nak.pada)}, ದೇವತೆ ${nak.devataKn}, ಗಣ ${nak.ganaKn}, ನಾಡಿ ${nak.nadiKn}. ${nak.howNakshatraHelpsKn} ನಿತ್ಯ ಯೋಗ ${y.nameKn}, ${y.natureKn}. ಕರಣ ${k.nameKn}.`;
                      const speechEn = `Natal Panchanga Reading: Tithi ${t.nameEn}. Weekday ${v.weekdayEn}, ruled by ${v.lordEn}. Birth Nakshatra ${nak.nameEn} Pada ${nak.pada}, Deity ${nak.devataEn}, Gana ${nak.ganaEn}. ${nak.howNakshatraHelpsEn} Nitya Yoga ${y.nameEn}. Karana ${k.nameEn}.`;
                      handleToggleSpeech("panchanga_overview", speechKn, speechEn);
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition-all shrink-0 ${
                      speakingKey === "panchanga_overview"
                        ? "bg-red-600 text-white border-red-500 animate-pulse shadow-md"
                        : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 border-[#b8860b] shadow-sm hover:scale-105"
                    }`}
                  >
                    <span>{speakingKey === "panchanga_overview" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಪಂಚಾಂಗ ವಾಚನ ಆಲಿಸಿ"}</span>
                  </button>
                </div>

                {/* 5 Angas Detailed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* 1. Tithi */}
                  <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>🌊</span>
                        <span>{isKn ? "೧. ತಿಥಿ (ಜಲ ತತ್ವ - ಸಂಪತ್ತು)" : "1. Tithi (Water - Wealth)"}</span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-[#d4af37]">
                        {isKn ? report.panchangaAngas.tithi.pakshaKn : report.panchangaAngas.tithi.pakshaEn}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-stone-900">
                        {isKn ? report.panchangaAngas.tithi.nameKn : report.panchangaAngas.tithi.nameEn}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {isKn ? `ತಿಥಿ ಸೂಚಕ: ${report.panchangaAngas.tithi.shriFactorKn}` : `Factor: ${report.panchangaAngas.tithi.shriFactorEn}`}
                      </p>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {isKn ? report.panchangaAngas.tithi.shriFactorKn : report.panchangaAngas.tithi.shriFactorEn}
                    </p>

                    <div className="rounded-xl bg-[#faf6ee] p-2.5 border border-amber-200 text-[11px] text-stone-800">
                      <span className="font-bold text-amber-950 block">💡 {isKn ? "ದಗ್ಧ ರಾಶಿಗಳು (ಸುಟ್ಟ ರಾಶಿಗಳು):" : "Dagdha Rashis:"}</span>
                      {report.panchangaAngas.tithi.dagdhaRashisKn.length > 0
                        ? isKn ? report.panchangaAngas.tithi.dagdhaRashisKn.join(", ") : report.panchangaAngas.tithi.dagdhaRashisEn.join(", ")
                        : isKn ? "ಯಾವುದೇ ದಗ್ಧ ರಾಶಿಗಳಿಲ್ಲ" : "None"}
                    </div>
                  </div>

                  {/* 2. Vaara */}
                  <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>🔥</span>
                        <span>{isKn ? "೨. ವಾರ (ಅಗ್ನಿ ತತ್ವ - ಆಯುಷ್ಯ)" : "2. Vaara (Fire - Longevity)"}</span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-[#d4af37]">
                        {isKn ? report.panchangaAngas.vaara.lordKn : report.panchangaAngas.vaara.lordEn}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-stone-900">
                        {isKn ? report.panchangaAngas.vaara.weekdayKn : report.panchangaAngas.vaara.weekdayEn}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {isKn ? `ವಾರಾಧಿಪತಿ: ${report.panchangaAngas.vaara.lordKn}` : `Lord: ${report.panchangaAngas.vaara.lordEn}`}
                      </p>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {isKn ? report.panchangaAngas.vaara.vitalityKn : report.panchangaAngas.vaara.vitalityEn}
                    </p>
                  </div>

                  {/* 3. Nakshatra Spotlight */}
                  <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-b from-[#fffefc] to-[#faf6ee] p-4 space-y-3 shadow-md md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>🌬️</span>
                        <span>{isKn ? "೩. ಜನ್ಮ ನಕ್ಷತ್ರ (ವಾಯು ತತ್ವ)" : "3. Nakshatra (Air - Karma)"}</span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-[#d4af37]">
                        {isKn ? `ಪಾದ ${toKnDigits(report.panchangaAngas.nakshatra.pada)}` : `Pada ${report.panchangaAngas.nakshatra.pada}`}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-amber-950">
                        {isKn ? report.panchangaAngas.nakshatra.nameKn : report.panchangaAngas.nakshatra.nameEn}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {isKn
                          ? `ದೇವತೆ: ${report.panchangaAngas.nakshatra.devataKn} | ಗಣ: ${report.panchangaAngas.nakshatra.ganaKn}`
                          : `Deity: ${report.panchangaAngas.nakshatra.devataEn} | Gana: ${report.panchangaAngas.nakshatra.ganaEn}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-amber-50 p-2 border border-amber-200">
                        <span className="text-stone-500 block text-[9px] uppercase font-bold">{isKn ? "ನಾಡಿ" : "Nadi"}</span>
                        <span className="font-bold text-amber-950">{isKn ? report.panchangaAngas.nakshatra.nadiKn : report.panchangaAngas.nakshatra.nadiEn}</span>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2 border border-amber-200">
                        <span className="text-stone-500 block text-[9px] uppercase font-bold">{isKn ? "ಯೋನಿ" : "Yoni"}</span>
                        <span className="font-bold text-amber-950">{isKn ? report.panchangaAngas.nakshatra.yoniKn : report.panchangaAngas.nakshatra.yoniEn}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed font-medium">
                      {isKn ? report.panchangaAngas.nakshatra.howNakshatraHelpsKn : report.panchangaAngas.nakshatra.howNakshatraHelpsEn}
                    </p>
                  </div>

                  {/* 4. Yoga */}
                  <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>🌌</span>
                        <span>{isKn ? "೪. ನಿತ್ಯ ಯೋಗ (ಆಕಾಶ ತತ್ವ - ಆರೋಗ್ಯ)" : "4. Yoga (Ether - Health)"}</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black border ${
                          report.panchangaAngas.yoga.isAuspicious
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-rose-100 text-rose-900 border-rose-300"
                        }`}
                      >
                        {isKn ? report.panchangaAngas.yoga.natureKn : report.panchangaAngas.yoga.natureEn}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-stone-900">
                        {isKn ? report.panchangaAngas.yoga.nameKn : report.panchangaAngas.yoga.nameEn}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {isKn ? `ಆರೋಗ್ಯ ರಕ್ಷಾ ಯೋಗ` : `Health & Immunity Matrix`}
                      </p>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {isKn ? report.panchangaAngas.yoga.healthImmunityKn : report.panchangaAngas.yoga.healthImmunityEn}
                    </p>

                    {report.panchangaAngas.yoga.remedyKn && (
                      <div className="rounded-xl bg-[#faf6ee] p-2.5 border border-amber-200 text-[11px] text-stone-800">
                        <span className="font-bold text-amber-950 block">🌿 {isKn ? "ಶಾಂತಿ ಮಾರ್ಗದರ್ಶನ:" : "Spiritual Guidance:"}</span>
                        {isKn ? report.panchangaAngas.yoga.remedyKn : report.panchangaAngas.yoga.remedyEn}
                      </div>
                    )}
                  </div>

                  {/* 5. Karana */}
                  <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>🌍</span>
                        <span>{isKn ? "೫. ಕರಣ (ಪೃಥ್ವಿ ತತ್ವ - ಕರ್ಮ)" : "5. Karana (Earth - Work)"}</span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-[#d4af37]">
                        {isKn ? report.panchangaAngas.karana.typeKn : report.panchangaAngas.karana.typeEn}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-stone-900">
                        {isKn ? report.panchangaAngas.karana.nameKn : report.panchangaAngas.karana.nameEn}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {isKn ? (report.panchangaAngas.karana.isVishtiBhadra ? "ವಿಷ್ಟಿ/ಭದ್ರಾ ಕರಣ" : "ಶುಭ ಕರಣ") : (report.panchangaAngas.karana.isVishtiBhadra ? "Vishti / Bhadra" : "Auspicious")}
                      </p>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {isKn ? report.panchangaAngas.karana.careerActionStaminaKn : report.panchangaAngas.karana.careerActionStaminaEn}
                    </p>

                    {report.panchangaAngas.karana.remedyKn && (
                      <div className="rounded-xl bg-[#faf6ee] p-2.5 border border-amber-200 text-[11px] text-stone-800">
                        <span className="font-bold text-amber-950 block">⚡ {isKn ? "ಕರ್ಮ ಸಿದ್ಧಿ ಸೂತ್ರ:" : "Success Key:"}</span>
                        {isKn ? report.panchangaAngas.karana.remedyKn : report.panchangaAngas.karana.remedyEn}
                      </div>
                    )}
                  </div>

                  {/* 6. Dagdha Rashis Callout */}
                  <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/80 p-4 space-y-3 shadow-md md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-2">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>🔥</span>
                        <span>{isKn ? "ದಗ್ಧ ರಾಶಿಗಳು (ಸುಟ್ಟ ರಾಶಿಗಳು)" : "Dagdha Rashis (Burnt Signs)"}</span>
                      </span>
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-amber-400">
                        {isKn ? "ತಿಥಿ ಶೂನ್ಯ" : "Tithi Shunya"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-amber-950">
                        {report.panchangaAngas.tithi.dagdhaRashisKn.length > 0
                          ? isKn ? report.panchangaAngas.tithi.dagdhaRashisKn.join(", ") : report.panchangaAngas.tithi.dagdhaRashisEn.join(", ")
                          : isKn ? "ಯಾವುದೇ ದಗ್ಧ ರಾಶಿಗಳಿಲ್ಲ" : "No Dagdha Rashis"}
                      </h4>
                      <p className="text-[11px] text-stone-700 leading-relaxed">
                        {isKn
                          ? "ಜನ್ಮ ತಿಥಿಯ ಪ್ರಕಾರ ಈ ರಾಶಿಗಳು ನಿರ್ವೀರ್ಯ ಅಥವಾ ಶೂನ್ಯತೆಯನ್ನು ಹೊಂದಿದ್ದು, ಇಲ್ಲಿರುವ ಗ್ರಹಗಳು ವಿಶೇಷ ಪರಿಹಾರವನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತವೆ."
                          : "According to natal tithi, these signs carry zero potency (burnt/shunya). Planets posited here require remedial pacification."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {report.panchangaAngas.tithi.planetsInDagdha.map((dr, idx) => (
                        <div key={idx} className="rounded-lg bg-[#fffdf9] p-2 border border-amber-200 text-[11px] text-stone-800">
                          <span className="font-bold text-amber-950">{isKn ? dr.planetKn : dr.planetEn} ({isKn ? dr.rashiKn : dr.rashiEn}): </span>
                          <span>{isKn ? dr.implicationKn : dr.implicationEn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-SECTION 2: NAVATARA CHAKRA MATRIX */}
            {panchangaSubTab === "navatara" && (
              <div className="space-y-5">
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                      🧭 {isKn ? "ನವತಾರಾ ಚಕ್ರ ೯ ವಿಭಾಗಗಳು" : "Navatara 9 Taras"}
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      {isKn ? `ಜನ್ಮ ನಕ್ಷತ್ರ: ${report.panchangaAngas.nakshatra.nameKn}` : `Janma Nakshatra: ${report.panchangaAngas.nakshatra.nameEn}`}
                    </span>
                  </div>
                  <h3 className="text-base md:text-xl font-black text-stone-900">
                    {isKn ? "ನವತಾರಾ ಚಕ್ರ & ಗ್ರಹಗಳ ಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ" : "Navatara Chakra & Natal Planetary Positions"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 max-w-3xl leading-relaxed">
                    {isKn
                      ? "ಜನ್ಮ ನಕ್ಷತ್ರದಿಂದ ೯ ತಾರೆಗಳನ್ನು ೩ ಪರ್ಯಾಯಗಳಲ್ಲಿ (ಪ್ರಥಮ, ದ್ವಿತೀಯ, ತೃತೀಯ ಪರ್ಯಾಯ) ಲೆಕ್ಕಹಾಕಿ ಗ್ರಹಗಳು ಯಾವ ತಾರೆಯಲ್ಲಿವೆ ಎಂದು ನೋಡಲಾಗುತ್ತದೆ. ಸಂಪತ್, ಕ್ಷೇಮ, ಸಾಧನ, ಮಿತ್ರ, ಪರಮ ಮಿತ್ರ ತಾರೆಗಳು ಶುಭ ಫಲ ಕೊಡುತ್ತವೆ; ವಿಪತ್, ಪ್ರತ್ಯಕ್, ನೈಧನ ತಾರೆಗಳು ಸಂಕಷ್ಟವನ್ನು ತರುತ್ತವೆ."
                      : "The 9 Taras calculated across 3 cycles from Janma Nakshatra. Sampat, Kshema, Sadhana, Mitra, and Parama Mitra bestow auspicious boons; Vipat, Pratyak, and Naidhana indicate afflictions requiring caution."}
                  </p>
                </div>

                {/* 9 Taras Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.panchangaAngas.navataraChakra.map((tara) => {
                    const isAuspicious = tara.quality === "benefic";
                    const allOccupants = tara.nakshatras.flatMap((n) => isKn ? n.occupyingPlanetsKn : n.occupyingPlanetsEn);

                    return (
                      <div
                        key={tara.taraIndex}
                        className={`rounded-2xl border-2 p-4 space-y-3 shadow-md flex flex-col justify-between ${
                          isAuspicious
                            ? "border-[#d4af37]/60 bg-[#fffdf9]"
                            : "border-rose-400 bg-rose-50/40"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                            <span className="text-xs font-black uppercase text-stone-900 flex items-center gap-1.5">
                              <span>{isAuspicious ? "✨" : "⚠️"}</span>
                              <span>{isKn ? tara.taraNameKn : tara.taraNameEn}</span>
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black border ${
                                isAuspicious
                                  ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                                  : "bg-rose-100 text-rose-950 border-rose-300"
                              }`}
                            >
                              {isAuspicious ? (isKn ? "ಶುಭ ತಾರೆ" : "Benefic") : (isKn ? "ಅಶುಭ ತಾರೆ" : "Caution")}
                            </span>
                          </div>

                          <p className="text-xs text-stone-700 leading-relaxed">
                            {isKn ? tara.significanceKn : tara.significanceEn}
                          </p>
                        </div>

                        {/* Planets in this Tara */}
                        <div className="rounded-xl bg-[#faf6ee] p-2.5 border border-amber-200 mt-2">
                          <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                            {isKn ? "ಈ ತಾರೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು:" : "Planets in this Tara:"}
                          </span>
                          {allOccupants.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {allOccupants.map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                                    isAuspicious
                                      ? "bg-amber-100 text-amber-950 border border-[#d4af37]"
                                      : "bg-rose-100 text-rose-950 border border-rose-300 font-black"
                                  }`}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-500 italic">
                              {isKn ? "ಯಾವುದೇ ಗ್ರಹಗಳಿಲ್ಲ" : "None"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: 10 UPAGRAHAS & UPARI VEDHA */}
            {panchangaSubTab === "upagrahas" && (
              <div className="space-y-5">
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                      🛰️ {isKn ? "೧೦ ಉಪಗ್ರಹಗಳು (ಅಪ್ರಕಾಶ + ಕಾಲಜ)" : "10 Classical Upagrahas"}
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      {isKn ? "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ" : "Brihat Parashara Hora Shastra"}
                    </span>
                  </div>
                  <h3 className="text-base md:text-xl font-black text-stone-900">
                    {isKn ? "ಅಪ್ರಕಾಶ & ಕಾಲಜ ಉಪಗ್ರಹಗಳು ಹಾಗೂ ಉಪರಿ ವೇಧ ರಕ್ಷಣೆ" : "Aprakasha & Kalaja Upagrahas & Upari Vedha Afflictions"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 max-w-3xl leading-relaxed">
                    {isKn
                      ? "ಧೂಮ, ವ್ಯತೀಪಾತ, ಪರಿವೇಷ, ಇಂದ್ರಚಾಪ, ಉಪಕೇತು (೫ ಅಪ್ರಕಾಶ ಗ್ರಹಗಳು) ಮತ್ತು ಕಾಲ, ಮೃತ್ಯು, ಅರ್ಘಪ್ರಹಾರ, ಯಮಘಂಟ, ಮಾಂದಿ/ಗುಳಿಕ (೫ ಕಾಲಜ ಗ್ರಹಗಳು). ಈ ಉಪಗ್ರಹಗಳು ಜನ್ಮ ನಕ್ಷತ್ರ ಅಥವಾ ಸೂರ್ಯ-ಚಂದ್ರರ ಮೇಲೆ ವೇಧ ಉಂಟುಮಾಡಿದರೆ ಸೂಕ್ತ ಶಾಂತಿ ಅಗತ್ಯ."
                      : "5 Aprakasha Upagrahas (Dhuma, Vyatipata, Paridhi, Indrachapa, Upaketu) and 5 Kalaja Upagrahas (Kala, Mrityu, Arghaprahara, Yamaghanta, Gulika/Maandi). Upari Vedha occurs when an Upagraha afflicts natal Moon/Sun/Ascendant."}
                  </p>
                </div>

                {/* Upagrahas Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.panchangaAngas.upagrahas.map((up) => {
                    const hasVedha = Boolean(up.afflictedFactorKn);

                    return (
                      <div
                        key={up.id}
                        className={`rounded-2xl border-2 p-4 space-y-3 shadow-md ${
                          hasVedha
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-[#d4af37]/50 bg-[#fffdf9]"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <div>
                            <h4 className="text-sm font-black text-stone-900">
                              {isKn ? up.nameKn : up.nameEn}
                            </h4>
                            <span className="text-[10px] text-stone-500">
                              {up.category === "aprakasha"
                                ? isKn ? "ಅಪ್ರಕಾಶ ಉಪಗ್ರಹ" : "Aprakasha Upagraha"
                                : isKn ? "ಕಾಲಜ ಉಪಗ್ರಹ" : "Kalaja Upagraha"}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                              hasVedha
                                ? "bg-rose-100 text-rose-950 border-rose-300 animate-pulse"
                                : "bg-amber-100 text-amber-950 border-[#d4af37]"
                            }`}
                          >
                            {hasVedha
                              ? isKn ? "⚠️ ಉಪರಿ ವೇಧ ಸಕ್ರಿಯ" : "⚠️ Upari Vedha Active"
                              : isKn ? "ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ" : "Normal"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200">
                            <span className="text-stone-500 block text-[9px] uppercase font-bold">{isKn ? "ರಾಶಿ & ಭಾವ" : "Sign & House"}</span>
                            <span className="font-bold text-amber-950">{isKn ? up.rashiKn : up.rashiEn} ({isKn ? `ಭಾವ ${toKnDigits(up.house)}` : `H${up.house}`})</span>
                          </div>
                          <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200">
                            <span className="text-stone-500 block text-[9px] uppercase font-bold">{isKn ? "ನಕ್ಷತ್ರ & ಪಾದ" : "Nakshatra"}</span>
                            <span className="font-bold text-amber-950">{isKn ? up.nakshatraKn : up.nakshatraEn} ({isKn ? `ಪಾದ ${toKnDigits(up.pada)}` : `Pada ${up.pada}`})</span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">
                          {isKn ? up.subtleImpactKn : up.subtleImpactEn}
                        </p>

                        {hasVedha && (
                          <div className="rounded-xl bg-rose-100/80 p-2.5 border border-rose-300 text-rose-950 text-xs">
                            <span className="font-bold block mb-0.5">⚠️ {isKn ? "ವೇಧ ಪ್ರಭಾವ & ಶಾಂತಿ ಪರಿಹಾರ:" : "Vedha Affliction & Remedy:"}</span>
                            {isKn ? up.afflictedFactorKn : up.afflictedFactorEn}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: PUSHKARA NAVAMSHA SPOTLIGHT */}
            {panchangaSubTab === "pushkara" && (
              <div className="space-y-5">
                <div className="rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-50/60 via-[#fffdf9] to-emerald-50/60 p-4 md:p-5 shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-950 border border-emerald-400">
                      🍯 {isKn ? "ಪುಷ್ಕರ ನವಾಂಶ & ಪುಷ್ಕರ ಭಾಗ" : "Pushkara Navamsha & Bhaga"}
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      {isKn ? "ಅಮೃತ ಸಂಜೀವಿನಿ ರಕ್ಷಣೆ" : "Divine Nectar of Fortification"}
                    </span>
                  </div>
                  <h3 className="text-base md:text-xl font-black text-stone-900">
                    {isKn ? "ಜಾತಕದ ಪುಷ್ಕರ ನವಾಂಶ ಗ್ರಹಗಳ ಅಮೃತ ರಕ್ಷಣೆ" : "Pushkara Navamsha Placements & Nectar Shield"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 max-w-3xl leading-relaxed">
                    {isKn
                      ? "ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಪುಷ್ಕರ ನವಾಂಶದಲ್ಲಿರುವ ಗ್ರಹಗಳು ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದರೂ ಸಹ ಅಸಾಧಾರಣ ಶುಭ ಫಲ, ರಕ್ಷಣೆ ಹಾಗೂ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸುತ್ತವೆ. ಇದು ಕುಂಡಲಿಯ ದೋಷಗಳನ್ನು ಪರಿಹರಿಸುವ ದೈವಿಕ ಅಮೃತ ಬಿಂದು."
                      : "In Vedic astrology, planets in Pushkara Navamsha or Pushkara Bhaga gain extraordinary strength, even if debilitated in Rashi. It acts as an immortal nectar shield protecting the native against negative yogas."}
                  </p>
                </div>

                {report.panchangaAngas.pushkaraPlacements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.panchangaAngas.pushkaraPlacements.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="rounded-2xl border-2 border-emerald-400 bg-[#fffdf9] p-4 space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <h4 className="text-base font-black text-emerald-950 flex items-center gap-2">
                            <span>🍯</span>
                            <span>{isKn ? p.planetKn : p.planetEn}</span>
                          </h4>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-950 border border-emerald-300">
                            {p.isPushkaraBhaga ? (isKn ? "ಪುಷ್ಕರ ಭಾಗ (ಅತ್ಯುನ್ನತ)" : "Pushkara Bhaga") : (isKn ? "ಪುಷ್ಕರ ನವಾಂಶ" : "Pushkara Navamsha")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200">
                            <span className="text-stone-500 block text-[9px] uppercase font-bold">{isKn ? "ರಾಶಿ" : "Sign"}</span>
                            <span className="font-bold text-stone-900">{isKn ? p.rashiKn : p.rashiEn}</span>
                          </div>
                          <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200">
                            <span className="text-stone-500 block text-[9px] uppercase font-bold">{isKn ? "ನವಾಂಶ ರಾಶಿ" : "Navamsha Sign"}</span>
                            <span className="font-bold text-stone-900">{isKn ? p.navamshaSignKn : p.navamshaSignEn}</span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-800 leading-relaxed font-medium">
                          {isKn ? p.blessingKn : p.blessingEn}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-stone-200 bg-[#fffdf9] p-6 text-center text-stone-600 text-xs">
                    {isKn
                      ? "ಈ ಜಾತಕದಲ್ಲಿ ಪ್ರಮುಖ ಗ್ರಹಗಳು ನೇರವಾಗಿ ಪುಷ್ಕರ ನವಾಂಶದಲ್ಲಿಲ್ಲದಿದ್ದರೂ, ಲಗ್ನ ಹಾಗೂ ಕೇಂದ್ರ-ತ್ರಿಕೋಣಗಳ ಶುಭ ದೃಷ್ಟಿಯು ಜಾತಕವನ್ನು ರಕ್ಷಿಸುತ್ತದೆ."
                      : "While no major planets are placed exactly in Pushkara Navamsha, the Kendra and Trikona benefic aspects protect the chart."}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Panchanga Footer */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t-2 border-[#d4af37]/40 bg-[#fffdfa] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("walkthrough")}
              className="inline-flex items-center gap-2 rounded-xl px-4 md:px-5 py-2 text-xs font-bold bg-[#fbf7ee] text-amber-950 border border-[#d4af37] hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <span>⬅</span>
              <span>{isKn ? "೧೧-ಹಂತದ ವಾಚನ" : "11-Step Masterclass"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("qa")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-5 md:px-6 py-2 text-xs font-black text-stone-950 shadow-md hover:scale-105 active:scale-95 transition-all border border-[#b8860b]"
            >
              <span>{isKn ? "ಪ್ರಶ್ನೋತ್ತರ ಗುರು ➜" : "Q&A 3-Pillars ➜"}</span>
              <span>➜</span>
            </button>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 3: Q&A 3-Pillar Synthesizer                             */}
      {/* ============================================================== */}
      {activeTab === "qa" && (
        <div className={`flex flex-col ${isStandalonePage ? "w-full" : "flex-1 overflow-hidden"}`}>
          
          {/* Live Gochara Ribbon Banner */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-2 border-b border-[#d4af37]/30 bg-[#fdfbf6] text-[11px] md:text-xs overflow-x-auto shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-amber-950 font-black">🪐 {isKn ? "ಲೈವ್ ಗೋಚಾರ ಸ್ಥಿತಿ:" : "Live Gochara Snapshot:"}</span>
              <span className="text-stone-700 font-medium">
                {isKn
                  ? `ಶನಿ: ${report.gochara.saturnRashiKn} (${toKnDigits(report.gochara.saturnHouseFromMoon)}ನೇ ಭಾವ) | ಗುರು: ${report.gochara.jupiterRashiKn} (${toKnDigits(report.gochara.jupiterHouseFromMoon)}ನೇ ಭಾವ)`
                  : `Saturn: ${report.gochara.saturnRashiEn} (H${report.gochara.saturnHouseFromMoon}) | Jupiter: ${report.gochara.jupiterRashiEn} (H${report.gochara.jupiterHouseFromMoon})`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {report.gochara.isSadeSati && (
                <span className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] text-rose-950 font-bold">
                  ⚠️ {isKn ? report.gochara.sadeSatiPhaseKn : "Sade Sati Active"}
                </span>
              )}
              {report.gochara.hasGuruBala ? (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] text-emerald-950 font-bold">
                  ✨ {isKn ? "ಗುರುಬಲ ಅನುಕೂಲ" : "Guru Bala Supportive"}
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] text-amber-950 font-bold">
                  ⚖️ {isKn ? "ಗುರುಬಲ ಮಧ್ಯಮ" : "Guru Neutral"}
                </span>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 px-3 md:px-6 py-2 overflow-x-auto border-b border-[#d4af37]/20 bg-[#fdfbf7] scrollbar-thin scrollbar-thumb-amber-400/30 shrink-0">
            {qaCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedQaCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  selectedQaCategory === cat.id
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-sm border-[#b8860b] scale-105"
                    : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
                }`}
              >
                {isKn ? cat.kn : cat.en}
              </button>
            ))}
          </div>

          {/* Question Selector Ribbon */}
          <div className="flex items-center gap-2 px-3 md:px-6 py-2 overflow-x-auto border-b border-[#d4af37]/20 bg-[#faf6ee] scrollbar-thin scrollbar-thumb-amber-400/30 shrink-0">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === selectedQuestionId;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black ring-1 ring-amber-400 shadow-md scale-105 border-[#b8860b]"
                      : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
                  }`}
                >
                  <span>{q.icon}</span>
                  <span className="truncate max-w-[200px] md:max-w-xs">{isKn ? q.questionKn : q.questionEn}</span>
                </button>
              );
            })}
          </div>

          {/* Main Question Analysis Container */}
          <div className={`p-4 md:p-6 space-y-4 ${isStandalonePage ? "w-full" : "flex-1 overflow-y-auto overscroll-contain"}`}>
            
            {/* Question Header Banner */}
            <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                  <span>{currentQuestion.icon}</span>
                  <span>{isKn ? currentQuestion.categoryKn : currentQuestion.categoryEn}</span>
                </span>
                <span className="text-xs font-bold text-amber-900">
                  {isKn ? "ದೈವಜ್ಞ ಪ್ರಶ್ನೋತ್ತರ ಪದ್ಧತಿ" : "Classical Prashna & Natal Synthesis"}
                </span>
              </div>
              <h3 className="text-base md:text-xl font-black text-stone-900 leading-snug">
                {isKn ? currentQuestion.questionKn : currentQuestion.questionEn}
              </h3>
            </div>

            {/* Box 1: Where to Look & Why It's Important */}
            <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 text-xs space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider border-b border-[#d4af37]/30 pb-1.5">
                <span>📍</span>
                <span>{isKn ? "೧. ದೃಷ್ಟಿ ಕೇಂದ್ರ & ಸ್ಥಾನದ ಮಹತ್ವ" : "1. Focus Points & Astrological Importance"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">{isKn ? "ಪ್ರಮುಖ ಭಾವಗಳು" : "Primary Houses"}</span>
                  <span className="font-bold text-amber-950 text-xs md:text-sm mt-0.5 block">
                    {isKn ? currentQuestion.whereToLookKn.primaryHousesKn : currentQuestion.whereToLookEn.primaryHousesEn}
                  </span>
                </div>
                <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">{isKn ? "ಕಾರಕ ಗ್ರಹಗಳು" : "Karaka Planets"}</span>
                  <span className="font-bold text-amber-950 text-xs md:text-sm mt-0.5 block">
                    {isKn ? currentQuestion.whereToLookKn.karakaPlanetsKn : currentQuestion.whereToLookEn.karakaPlanetsEn}
                  </span>
                </div>
                <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">{isKn ? "ಭಾವಾಧಿಪತಿಗಳು" : "House Lords"}</span>
                  <span className="font-bold text-amber-950 text-xs md:text-sm mt-0.5 block">
                    {isKn ? currentQuestion.whereToLookKn.targetHouseLordsKn : currentQuestion.whereToLookEn.targetHouseLordsEn}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50/80 border border-[#d4af37]/50 p-3 text-stone-900 leading-relaxed text-xs">
                <span className="font-bold text-amber-950 block mb-1">
                  📐 {isKn ? "ಏಕೆ ಈ ಸ್ಥಾನ ಅತ್ಯಂತ ಮಹತ್ವದ್ದು? (ಶಾಸ್ತ್ರೀಯ ತರ್ಕ):" : "Why is this place crucial? (Classical Logic):"}
                </span>
                {isKn
                  ? currentQuestion.whereToLookKn.whyThisPlaceImportantKn
                  : currentQuestion.whereToLookEn.whyThisPlaceImportantEn}
              </div>
            </div>

            {/* Box 2: The Three Pillars Grid */}
            <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 text-xs space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider border-b border-[#d4af37]/30 pb-1.5">
                <span>🏛️</span>
                <span>{isKn ? "೨. ಫಲ ನಿರ್ಣಯದ ೩ ಆಧಾರ ಸ್ತಂಭಗಳು" : "2. The 3 Foundation Pillars of Prediction"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Pillar 1: Natal Kundli */}
                <div className="rounded-xl border border-amber-300 bg-[#fbf7ee] p-3.5 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-300/50 pb-1.5 mb-2">
                      <span className="text-xs font-black text-amber-950">
                        {isKn ? currentQuestion.pillar1KundliKn.titleKn : currentQuestion.pillar1KundliEn.titleEn}
                      </span>
                      <span className="text-[10px] font-bold text-stone-600">
                        {isKn ? currentQuestion.pillar1KundliKn.scoreLabelKn : currentQuestion.pillar1KundliEn.scoreLabelEn}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs">
                      {isKn
                        ? currentQuestion.pillar1KundliKn.analysisKn
                        : currentQuestion.pillar1KundliEn.analysisEn}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#fffdf9] p-2 border border-amber-200 text-[10px] font-semibold text-amber-950 mt-2">
                    {isKn ? "ಅಡಿಪಾಯ: ಜನ್ಮ ಕುಂಡಲಿ ಸಾಮರ್ಥ್ಯ" : "Foundation: Natal Potential"}
                  </div>
                </div>

                {/* Pillar 2: Vimshottari Dasha */}
                <div className="rounded-xl border border-amber-300 bg-[#fbf7ee] p-3.5 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-300/50 pb-1.5 mb-2">
                      <span className="text-xs font-black text-amber-950">
                        {isKn ? currentQuestion.pillar2DashaKn.titleKn : currentQuestion.pillar2DashaEn.titleEn}
                      </span>
                      <span className="text-[10px] font-bold text-stone-600">
                        {isKn ? currentQuestion.pillar2DashaKn.activeTimingKn : currentQuestion.pillar2DashaEn.activeTimingEn}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs">
                      {isKn
                        ? currentQuestion.pillar2DashaKn.analysisKn
                        : currentQuestion.pillar2DashaEn.analysisEn}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#fffdf9] p-2 border border-amber-200 text-[10px] font-semibold text-amber-950 mt-2">
                    {isKn ? "ಸಮಯ ಸೂಚಿ: ದಶಾ ಪಕ್ವ ಕಾಲ" : "Timing: Fruition Window"}
                  </div>
                </div>

                {/* Pillar 3: Gochara Transit */}
                <div className="rounded-xl border border-amber-300 bg-[#fbf7ee] p-3.5 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-300/50 pb-1.5 mb-2">
                      <span className="text-xs font-black text-amber-950">
                        {isKn ? currentQuestion.pillar3GocharaKn.titleKn : currentQuestion.pillar3GocharaEn.titleEn}
                      </span>
                      <span className="text-[10px] font-bold text-stone-600">
                        {isKn ? currentQuestion.pillar3GocharaKn.transitVerdictKn : currentQuestion.pillar3GocharaEn.transitVerdictEn}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs">
                      {isKn
                        ? currentQuestion.pillar3GocharaKn.analysisKn
                        : currentQuestion.pillar3GocharaEn.analysisEn}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#fffdf9] p-2 border border-amber-200 text-[10px] font-semibold text-amber-950 mt-2">
                    {isKn ? "ಅನುಕೂಲತೆ: ಇಂದಿನ ಗೋಚಾರ" : "Catalyst: Present Gochara"}
                  </div>
                </div>

              </div>
            </div>

            {/* Box 3: Final Shastric Verdict & Actionable Guidance */}
            <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-b from-[#fffefc] to-[#faf6ee] p-4 text-xs space-y-3.5 shadow-md">
              <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-2">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                  <span>🎯</span>
                  <span>{isKn ? "೩. ದೈವಜ್ಞ ಅಂತಿಮ ತೀರ್ಮಾನ & ಕರ್ತವ್ಯ ಮಾರ್ಗದರ್ಶನ" : "3. Astrological Synthesis & Action Directive"}</span>
                </div>

                {/* Listen to Q&A Consultation */}
                <button
                  type="button"
                  onClick={() => {
                    const knText = `${currentQuestion.spokenScriptKn}. ಶಾಂತಿ ಪರಿಹಾರ: ${currentQuestion.remedyKn}`;
                    const enText = `${currentQuestion.spokenScriptEn}. Remedy: ${currentQuestion.remedyEn}`;
                    handleToggleSpeech(`qa_${currentQuestion.id}`, knText, enText);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    speakingKey === `qa_${currentQuestion.id}`
                      ? "bg-red-600 text-white border-red-500 animate-pulse shadow-md"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 border-[#b8860b] shadow-sm hover:scale-105"
                  }`}
                >
                  <span>{speakingKey === `qa_${currentQuestion.id}` ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಉತ್ತರ ಆಲಿಸಿ"}</span>
                </button>
              </div>

              {/* Shastric Verdict */}
              <div className="space-y-1">
                <span className="font-bold text-amber-950 block text-[11px]">
                  ⚖️ {isKn ? "ಶಾಸ್ತ್ರೀಯ ತೀರ್ಮಾನ & ಉತ್ತರ:" : "Synthesized Shastric Verdict:"}
                </span>
                <p className="text-stone-800 leading-relaxed text-xs pl-2 border-l-2 border-[#d4af37]">
                  {isKn
                    ? currentQuestion.synthesisKn.verdictKn
                    : currentQuestion.synthesisEn.verdictEn}
                </p>
              </div>

              {/* How to Combine the 3 Pillars */}
              <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200 text-stone-800 text-xs">
                <span className="font-bold text-amber-950 block mb-0.5">
                  🔗 {isKn ? "೩ ಸ್ತಂಭಗಳ ಸಮನ್ವಯ ಸೂತ್ರ:" : "Synthesis of 3 Pillars:"}
                </span>
                {isKn
                  ? currentQuestion.synthesisKn.howToCombineKn
                  : currentQuestion.synthesisEn.howToCombineEn}
              </div>

              {/* Timing Window */}
              <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-stone-900 leading-relaxed text-xs">
                <span className="font-bold text-amber-950 block mb-0.5">
                  ⏳ {isKn ? "ಸಂಭಾವ್ಯ ಫಲ ಕಾಲ & ಮಹತ್ವದ ಘಟ್ಟ:" : "Timing & Turning Point Window:"}
                </span>
                {isKn
                  ? currentQuestion.synthesisKn.timingWindowKn
                  : currentQuestion.synthesisEn.timingWindowEn}
              </div>

              {/* Devotee Spoken Script */}
              <div className="space-y-1">
                <span className="font-bold text-amber-950 block text-[11px]">
                  🗣️ {isKn ? "ಭಕ್ತರಿಗೆ ನುಡಿಯುವ ನಿಖರ ಮಾತುಗಳು:" : "Exact Spoken Script:"}
                </span>
                <p className="text-stone-800 leading-relaxed text-xs pl-2 border-l-2 border-[#d4af37]">
                  {isKn
                    ? currentQuestion.spokenScriptKn
                    : currentQuestion.spokenScriptEn}
                </p>
              </div>

              {/* Actionable Remedies & Rituals */}
              <div className="rounded-xl bg-emerald-50 border border-emerald-400/80 p-3 text-emerald-950 space-y-1 shadow-sm">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                  <span>🪔</span>
                  <span>{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಶಾಂತಿ & ಪರಿಹಾರಗಳು:" : "Recommended Remedies & Disciplines:"}</span>
                </span>
                <p className="text-xs leading-relaxed font-medium">
                  {isKn
                    ? currentQuestion.remedyKn
                    : currentQuestion.remedyEn}
                </p>
              </div>
            </div>

          </div>

          {/* Q&A Footer */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t-2 border-[#d4af37]/40 bg-[#fffdfa] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("panchanga")}
              className="inline-flex items-center gap-2 rounded-xl px-4 md:px-5 py-2 text-xs font-bold bg-[#fbf7ee] text-amber-950 border border-[#d4af37] hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <span>⬅</span>
              <span>{isKn ? "ಪಂಚಾಂಗ & ನಕ್ಷತ್ರ" : "Panchanga"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("diagnostics")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-5 md:px-6 py-2 text-xs font-black text-stone-950 shadow-md hover:scale-105 active:scale-95 transition-all border border-[#b8860b]"
            >
              <span>{isKn ? "ದೋಷ & ಗಂಡಾಂತರ ➜" : "Diagnostics ➜"}</span>
              <span>➜</span>
            </button>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB 4: Deep Diagnostics                                     */}
      {/* ============================================================== */}
      {activeTab === "diagnostics" && (
        <div className={`flex flex-col ${isStandalonePage ? "w-full" : "flex-1 overflow-hidden"}`}>
          
          {/* Diagnostics Sub-navigation Tabs */}
          <div className="flex items-center gap-1.5 px-3 md:px-6 py-2 overflow-x-auto border-b border-[#d4af37]/30 bg-[#fdfbf6] scrollbar-thin scrollbar-thumb-amber-400/30 shrink-0">
            <button
              type="button"
              onClick={() => setDiagnosticsSubTab("temperament")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                diagnosticsSubTab === "temperament"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>⚖️</span>
              <span>{isKn ? "ಸ್ವಭಾವ ಪರೀಕ್ಷೆ (ಕ್ರೂರಿಯೋ/ಸೌಮ್ಯನೋ?)" : "Temperament (Cruel vs Gentle)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setDiagnosticsSubTab("doshas")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                diagnosticsSubTab === "doshas"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>🛡️</span>
              <span>{isKn ? "೬ ಮಹಾ ದೋಷ ಶೋಧನೆ" : "6 Major Doshas"}</span>
            </button>

            <button
              type="button"
              onClick={() => setDiagnosticsSubTab("gandantharas")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                diagnosticsSubTab === "gandantharas"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>⚠️</span>
              <span>{isKn ? "೭ ಗಂಡಾಂತರ & ಅಪಾಯ ವಲಯಗಳು" : "7 Gandantharas & Hazard Ages"}</span>
            </button>

            <button
              type="button"
              onClick={() => setDiagnosticsSubTab("fears")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                diagnosticsSubTab === "fears"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>😨</span>
              <span>{isKn ? "ಅಂತರ್ಗತ ಮನೋಭಯಗಳು" : "Subconscious Fears"}</span>
            </button>

            <button
              type="button"
              onClick={() => setDiagnosticsSubTab("secrets")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                diagnosticsSubTab === "secrets"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black shadow-md border-[#b8860b] ring-1 ring-amber-400 scale-105"
                  : "bg-[#fffdf9] text-stone-700 border-[#d4af37]/40 hover:bg-amber-50 hover:text-stone-900"
              }`}
            >
              <span>🕵️</span>
              <span>{isKn ? "ಆಂತರಿಕ ರಹಸ್ಯಗಳು" : "Inner Secrets & Drives"}</span>
            </button>
          </div>

          {/* Diagnostics Body Container */}
          <div className={`p-4 md:p-6 space-y-4 ${isStandalonePage ? "w-full" : "flex-1 overflow-y-auto overscroll-contain"}`}>
            
            {/* SUB-SECTION 1: TEMPERAMENT */}
            {diagnosticsSubTab === "temperament" && (
              <div className="space-y-4">
                {/* Temperament Summary Header */}
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-950 border border-[#d4af37]">
                      <span>⚖️</span>
                      <span>{isKn ? "ಪರಾಶರ ಸ್ವಭಾವ ಪರೀಕ್ಷೆ" : "Parashari Disposition Analysis"}</span>
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black border ${
                        report.diagnostics.temperament.disposition === "gentle"
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                          : report.diagnostics.temperament.disposition === "cruel_assertive"
                          ? "bg-rose-100 text-rose-950 border-rose-300"
                          : "bg-amber-100 text-amber-950 border-amber-300"
                      }`}
                    >
                      {isKn ? report.diagnostics.temperament.titleKn : report.diagnostics.temperament.titleEn}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-black text-stone-900 mt-1">
                    {isKn ? "ಜಾತಕರ ಮೂಲ ಸ್ವಭಾವ ನಿರ್ಣಯ (ಕ್ರೂರಿಯೋ ಅಥವಾ ಸೌಮ್ಯನೋ?)" : "Temperament Diagnostic: Cruel vs Gentle"}
                  </h3>

                  {/* Score Bar */}
                  <div className="mt-4 pt-3 border-t border-[#d4af37]/30 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-700">
                        🌿 {isKn ? "ಸೌಮ್ಯ/ಧಾರ್ಮಿಕ ಬಲ:" : "Gentle Score:"} {isKn ? toKnDigits(report.diagnostics.temperament.gentleScore) : report.diagnostics.temperament.gentleScore}
                      </span>
                      <span className="text-rose-700">
                        ⚔️ {isKn ? "ಕ್ರೂರ/ತೀಕ್ಷ್ಣ ಬಲ:" : "Cruel/Assertive Score:"} {isKn ? toKnDigits(report.diagnostics.temperament.cruelScore) : report.diagnostics.temperament.cruelScore}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-stone-200 border border-stone-300 overflow-hidden flex">
                      <div
                        style={{
                          width: `${(report.diagnostics.temperament.gentleScore / (report.diagnostics.temperament.gentleScore + report.diagnostics.temperament.cruelScore || 1)) * 100}%`
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full"
                      />
                      <div
                        style={{
                          width: `${(report.diagnostics.temperament.cruelScore / (report.diagnostics.temperament.gentleScore + report.diagnostics.temperament.cruelScore || 1)) * 100}%`
                        }}
                        className="bg-gradient-to-r from-rose-500 to-rose-400 h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Classical Shastric Mechanics */}
                <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 text-xs space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider border-b border-[#d4af37]/30 pb-1.5">
                    <span>📐</span>
                    <span>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಸೂತ್ರ & ಜ್ಯೋತಿಷ್ಯ ತರ್ಕ" : "Classical Shastric Mechanics"}</span>
                  </div>

                  <div className="rounded-xl bg-amber-50/80 border border-[#d4af37]/40 p-3 italic text-amber-950 text-xs font-medium">
                    "{isKn ? report.diagnostics.temperament.shastricRuleKn : report.diagnostics.temperament.shastricRuleEn}"
                  </div>

                  <p className="text-stone-800 leading-relaxed text-xs">
                    {isKn
                      ? report.diagnostics.temperament.analysisKn
                      : report.diagnostics.temperament.analysisEn}
                  </p>
                </div>

                {/* Real-world Behavior & Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-2 shadow-md">
                    <span className="font-bold text-amber-950 block text-xs border-b border-[#d4af37]/30 pb-1.5">
                      👤 {isKn ? "ಗುರುತಿಸುವ ವಿಧಾನ (How to Spot):" : "How to Spot:"}
                    </span>
                    <p className="text-stone-700 leading-relaxed text-xs">
                      {isKn
                        ? report.diagnostics.temperament.howToSpotKn
                        : report.diagnostics.temperament.howToSpotEn}
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-2 shadow-md">
                    <span className="font-bold text-amber-950 block text-xs border-b border-[#d4af37]/30 pb-1.5">
                      💡 {isKn ? "ದೈವಜ್ಞ ಹಿತವಚನ & ಸಲಹೆ:" : "Priest's Temperament Counsel:"}
                    </span>
                    <p className="text-stone-700 leading-relaxed text-xs">
                      {isKn
                        ? report.diagnostics.temperament.spokenAdviceKn
                        : report.diagnostics.temperament.spokenAdviceEn}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: 6 MAJOR DOSHAS */}
            {diagnosticsSubTab === "doshas" && (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <h3 className="text-base md:text-lg font-black text-stone-900">
                    {isKn ? "೬ ಮಹಾ ಜಾತಕ ದೋಷಗಳ ಶಾಸ್ತ್ರೀಯ ಶೋಧನೆ" : "6 Major Vedic Afflictions & Dosha Diagnostics"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {isKn
                      ? "ಮಾಂಗಲ್ಯ ದೋಷ, ಕಾಳಸರ್ಪ, ಪಿತೃ, ಕೇಮದ್ರುಮ, ಗುರು ಚಂಡಾಲ, ಶನಿ-ರಾಹು ಶಾಪಿತ ದೋಷಗಳ ಪರಿಶೋಧನೆ ಹಾಗೂ ಪರಿಹಾರೋಪಾಯಗಳು."
                      : "Parashari evaluation of Manglik, Kala Sarpa, Pitru, Kemadruma, Guru Chandal, and Shani-Rahu Shrapit doshas."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.diagnostics.doshas.map((d) => (
                    <div
                      key={d.id}
                      className={`rounded-2xl border-2 p-4 space-y-3 shadow-md flex flex-col justify-between ${
                        d.isPresent
                          ? "border-rose-400 bg-rose-50/40"
                          : "border-[#d4af37]/50 bg-[#fffdf9]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <span className="text-sm font-black text-stone-900">
                            {isKn ? d.nameKn : d.nameEn}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                              d.isPresent
                                ? "bg-rose-100 text-rose-950 border-rose-300"
                                : "bg-emerald-100 text-emerald-950 border-emerald-300"
                            }`}
                          >
                            {d.isPresent
                              ? isKn ? "⚠️ ಸಕ್ರಿಯ ದೋಷ" : "⚠️ Active Affliction"
                              : isKn ? "✓ ನಿರ್ದೋಷ" : "✓ None / Free"}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">
                          {isKn ? d.specificPlacementKn : d.specificPlacementEn}
                        </p>
                      </div>

                      <div className="space-y-2 mt-2 pt-2 border-t border-stone-200">
                        <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200 text-[11px] text-stone-800">
                          <span className="font-bold text-amber-950 block">{isKn ? "ಗುರುತಿಸುವ ಸೂತ್ರ:" : "How to Spot:"}</span>
                          {isKn ? d.howToSpotKn : d.howToSpotEn}
                        </div>

                        {d.isPresent && (
                          <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-300 text-[11px] text-emerald-950">
                            <span className="font-bold block text-emerald-900">🪔 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ:" : "Prescribed Remedy:"}</span>
                            {isKn ? d.remedyKn : d.remedyEn}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: 7 GANDANTHARAS */}
            {diagnosticsSubTab === "gandantharas" && (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <h3 className="text-base md:text-lg font-black text-stone-900">
                    {isKn ? "೭ ಗಂಡಾಂತರಗಳು & ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ" : "7 Critical Gandanthara Hazards & Safe Age Limits"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {isKn
                      ? "ಜಲ, ಅಗ್ನಿ, ವಾಹನ, ಸರ್ಪ, ಪತನ, ರೋಗ, ಆಯುಷ್ಯ ಗಂಡಾಂತರಗಳ ಪರಾಶರ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ ಕಡ್ಡಾಯ ನಿಷೇಧಗಳು."
                      : "Classical evaluations of Water, Fire, Vehicular, Venomous, Fall, Disease, and Critical Longevity thresholds."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.diagnostics.gandantharas.map((g) => (
                    <div
                      key={g.id}
                      className={`rounded-2xl border-2 p-4 space-y-3 shadow-md flex flex-col justify-between ${
                        g.isDetected
                          ? "border-rose-400 bg-rose-50/40"
                          : "border-[#d4af37]/50 bg-[#fffdf9]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <span className="text-sm font-black text-stone-900">
                            {isKn ? g.nameKn : g.nameEn}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                              g.isDetected
                                ? "bg-rose-100 text-rose-950 border-rose-300"
                                : "bg-emerald-100 text-emerald-950 border-emerald-300"
                            }`}
                          >
                            {g.isDetected
                              ? isKn ? "⚠️ ಜಾಗರೂಕತೆ ಅಗತ್ಯ" : "⚠️ High Caution"
                              : isKn ? "✓ ನಿರ್ಭಯ" : "✓ Safe"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-amber-950 bg-amber-100/70 p-2 rounded-lg border border-[#d4af37]/40">
                          <span>⏳</span>
                          <span>{isKn ? "ರಕ್ಷಣಾ ವಯೋಮಿತಿ:" : "Safe Age Window:"}</span>
                          <span>{isKn ? toKnDigits(g.safeAgeYears) : g.safeAgeYears} {isKn ? "ವರ್ಷ" : "Years"}</span>
                          {g.isPastSafeAge && (
                            <span className="text-[10px] text-emerald-700 ml-auto font-black">
                              {isKn ? "(ವಯೋಮಿತಿ ದಾಟಿದೆ)" : "(Threshold Passed)"}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">
                          {isKn ? g.hazardTypeKn : g.hazardTypeEn}
                        </p>
                      </div>

                      <div className="space-y-2 mt-2 pt-2 border-t border-stone-200">
                        <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200 text-[11px] text-stone-800">
                          <span className="font-bold text-amber-950 block">{isKn ? "ಗುರುತಿಸುವ ಸೂತ್ರ:" : "How to Spot:"}</span>
                          {isKn ? g.howToSpotKn : g.howToSpotEn}
                        </div>

                        {g.isDetected && (
                          <>
                            <div className="rounded-lg bg-rose-100/70 p-2 border border-rose-300 text-[11px] text-rose-950">
                              <span className="font-bold block">🚫 {isKn ? "ಕಡ್ಡಾಯ ಮುನ್ನೆಚ್ಚರಿಕೆ:" : "Precaution:"}</span>
                              {isKn ? g.precautionKn : g.precautionEn}
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-300 text-[11px] text-emerald-950">
                              <span className="font-bold block text-emerald-900">🛡️ {isKn ? "ಶಾಂತಿ ಪರಿಹಾರ:" : "Shanti Remedy:"}</span>
                              {isKn ? g.shantiKn : g.shantiEn}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: SUBCONSCIOUS FEARS */}
            {diagnosticsSubTab === "fears" && (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <h3 className="text-base md:text-lg font-black text-stone-900">
                    {isKn ? "ಅಂತರ್ಗತ ಮನೋಭಯಗಳು & ಮಾನಸಿಕ ಆತಂಕಗಳು" : "Innate Subconscious Fears & Mental Phobias"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {isKn
                      ? "ಚಂದ್ರ, ರಾಹು, ಕೇತುಗಳ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಆಳವಾದ ಆಂತರಿಕ ಭಯಗಳ ಶೋಧನೆ ಹಾಗೂ ಮನೋಸ್ಥೈರ್ಯ ಹೆಚ್ಚಿಸುವ ಪರಿಹಾರಗಳು."
                      : "Astrological root causes of psychological fears (water, blood, snakes, darkness, heights) and fortitude remedies."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.diagnostics.fears.map((f) => (
                    <div
                      key={f.id}
                      className={`rounded-2xl border-2 p-4 space-y-3 shadow-md flex flex-col justify-between ${
                        f.isDetected
                          ? "border-amber-400 bg-amber-50/50"
                          : "border-[#d4af37]/50 bg-[#fffdf9]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <span className="text-sm font-black text-stone-900">
                            {isKn ? f.fearNameKn : f.fearNameEn}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                              f.isDetected
                                ? "bg-amber-100 text-amber-950 border-amber-300"
                                : "bg-emerald-100 text-emerald-950 border-emerald-300"
                            }`}
                          >
                            {f.isDetected
                              ? isKn ? "ಆತಂಕದ ಸಾಧ್ಯತೆ" : "Prone / Vulnerable"
                              : isKn ? "ಶಾಂತ ಮನಸ್ಸು" : "Resilient"}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">
                          {isKn ? f.manifestationKn : f.manifestationEn}
                        </p>
                      </div>

                      <div className="space-y-2 mt-2 pt-2 border-t border-stone-200">
                        <div className="rounded-lg bg-[#faf6ee] p-2 border border-amber-200 text-[11px] text-stone-800">
                          <span className="font-bold text-amber-950 block">{isKn ? "ಜ್ಯೋತಿಷ್ಯ ಮೂಲ ಕಾರಣ:" : "Astrological Origin:"}</span>
                          {isKn ? f.astrologicalOriginKn : f.astrologicalOriginEn}
                        </div>

                        {f.isDetected && (
                          <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-300 text-[11px] text-emerald-950">
                            <span className="font-bold block text-emerald-900">🌿 {isKn ? "ದೈವಜ್ಞ ಹಿತವಚನ & ಪರಿಹಾರ:" : "Counseling Tip & Remedy:"}</span>
                            {isKn ? f.counselingTipKn : f.counselingTipEn}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 5: INNER SECRETS */}
            {diagnosticsSubTab === "secrets" && (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-[#d4af37] bg-gradient-to-r from-[#fff9ea] via-[#fffdf9] to-[#fff9ea] p-4 md:p-5 shadow-md">
                  <h3 className="text-base md:text-lg font-black text-stone-900">
                    {isKn ? "ಆಂತರಿಕ ರಹಸ್ಯಗಳು & ಗೂಢ ಪ್ರವೃತ್ತಿಗಳು" : "Inner Secrets & Subconscious Karmic Drives"}
                  </h3>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {isKn
                      ? "೮ನೇ ಮತ್ತು ೧೨ನೇ ಭಾವಗಳ ಮೂಲಕ ವ್ಯಕ್ತಿಯು ಹೊರಜಗತ್ತಿಗೆ ಪ್ರಕಟಿಸದ ಆಂತರಿಕ ಆಲೋಚನೆಗಳು, ನಿಗೂಢ ಸಾಮರ್ಥ್ಯಗಳು ಹಾಗೂ ಕರ್ಮ ಪ್ರೇರಣೆಗಳ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ."
                      : "Unveiling unexpressed drives, occult talents, and hidden karmic motivations through the 8th and 12th houses."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.diagnostics.innerSecrets.map((s, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#fffdf9] p-4 space-y-3 shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                          <span className="text-sm font-black text-stone-900">
                            {isKn ? s.domainKn : s.domainEn}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-950 border border-[#d4af37]">
                            {isKn ? "೮ನೇ ಭಾವ ಸೂತ್ರ" : "8th House Key"}
                          </span>
                        </div>

                        <div className="rounded-xl bg-amber-50/80 border border-[#d4af37]/40 text-xs text-stone-900 leading-relaxed font-medium">
                          <span className="font-bold text-amber-950 block mb-1">
                            🗝️ {isKn ? "ಗೂಢ ಪ್ರವೃತ್ತಿ & ಆಂತರಿಕ ಭಾವ:" : "Hidden Trait & Drive:"}
                          </span>
                          {isKn ? s.hiddenTraitKn : s.hiddenTraitEn}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#faf6ee] p-3 border border-amber-200 text-[11px] text-stone-800 leading-relaxed mt-2">
                        <span className="font-bold text-amber-950 block mb-1">
                          📐 {isKn ? "ಜ್ಯೋತಿಷ್ಯ ತರ್ಕ & ಆಧಾರ:" : "Astrological Root:"}
                        </span>
                        {isKn ? s.astrologicalWhyKn : s.astrologicalWhyEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Diagnostics Footer */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t-2 border-[#d4af37]/40 bg-[#fffdfa] shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("qa")}
              className="inline-flex items-center gap-2 rounded-xl px-4 md:px-5 py-2 text-xs font-bold bg-[#fbf7ee] text-amber-950 border border-[#d4af37] hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <span>⬅</span>
              <span>{isKn ? "ಪ್ರಶ್ನೋತ್ತರ ಗುರು" : "Q&A Engine"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("walkthrough")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-5 md:px-6 py-2 text-xs font-black text-stone-950 shadow-md hover:scale-105 active:scale-95 transition-all border border-[#b8860b]"
            >
              <span>{isKn ? "೧೧-ಹಂತದ ವಾಚನ ➜" : "11-Step Masterclass ➜"}</span>
              <span>➜</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
