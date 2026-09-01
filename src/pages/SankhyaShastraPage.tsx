import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import DatePicker from "../components/DatePicker";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  executeSankhyaShastraPrashna,
  askSankhyaShastraFollowUp,
  type SankhyaShastraResult
} from "../features/sankhyashastra/sankhyaShastraEngine";
import {
  calculateChaldeanNameNumber,
  calculatePythagoreanNameNumber,
  generateLuckyNameSuggestions,
  calculateItemNumerology,
  reduceToSingleDigit,
  NUMEROLOGY_GUIDANCE_MAP,
  type ItemNumerologyResult,
  type LuckyNameSuggestion
} from "../features/sankhyashastra/sankhyaNumerologyUtils";
import {
  fetchAIEnhancedNameCorrections,
  type NameCorrectionSuggestion
} from "../features/sankhyashastra/nameCorrectionEngine";
import { LoveMarriageMatchTab } from "../components/sankhyashastra/LoveMarriageMatchTab";
import { BoysNumerologyTab } from "../components/sankhyashastra/BoysNumerologyTab";
import { GirlsNumerologyTab } from "../components/sankhyashastra/GirlsNumerologyTab";
import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";
import { sanitizeAIText } from "../utils/textFormatter";
import { SankhyaNumerologyLoader } from "../components/sankhyashastra/SankhyaNumerologyLoader";
import { VedicGridDashaTab } from "../components/sankhyashastra/VedicGridDashaTab";
import AudioPlayerButton from "../components/ui/AudioPlayerButton";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  result?: SankhyaShastraResult;
  timestamp: string;
};

type TabType = "vedic_grid" | "prashna" | "match" | "boys" | "girls" | "name" | "item" | "mulank";

export default function SankhyaShastraPage(): JSX.Element {
  const appLanguage = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const session = useKundliViewerStore((s) => s.session);

  // Language selector state (defaults to appLanguage or kn)
  const [selectedLang, setSelectedLang] = useState<string>(appLanguage || "kn");
  const isKn = selectedLang === "kn";

  const devoteeName = session?.input?.name || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee");

  // Tab State (Default to new Vedic Grid & Dasha Bhavishya)
  const [activeTab, setActiveTab] = useState<TabType>("vedic_grid");

  // ----------------------------------------------------------------------
  // TAB 1: PRASHNA ORACLE STATES
  // ----------------------------------------------------------------------
  const [questionInput, setQuestionInput] = useState<string>("");
  const [userNumberInput, setUserNumberInput] = useState<number | string>(108);
  const [followUpInput, setFollowUpInput] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<SankhyaShastraResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // ----------------------------------------------------------------------
  // TAB 5: LUCKY NAME NUMEROLOGY STATES
  // ----------------------------------------------------------------------
  const [nameInput, setNameInput] = useState<string>(session?.input?.name || "Shreeram Pandit");
  const [nameTargetNumber, setNameTargetNumber] = useState<number>(5);
  const [isAiValidatingName, setIsAiValidatingName] = useState<boolean>(false);
  const [aiNameSuggestions, setAiNameSuggestions] = useState<NameCorrectionSuggestion[] | null>(null);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  // ----------------------------------------------------------------------
  // TAB 6: PHONE / VEHICLE / HOUSE CALCULATOR STATES
  // ----------------------------------------------------------------------
  const [itemType, setItemType] = useState<"phone" | "vehicle" | "house">("phone");
  const [itemNumberInput, setItemNumberInput] = useState<string>("9972339362");

  // ----------------------------------------------------------------------
  // TAB 7: MULANK & BHAGYANK STATES
  // ----------------------------------------------------------------------
  const [birthDatePicker, setBirthDatePicker] = useState<Date | null>(() => new Date(1993, 4, 15));

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Speech Recognition (Voice Input Mic for Prashna)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isKn
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ (Voice Input) ಅನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಬರೆದು ಟೈಪ್ ಮಾಡಿ."
          : "Voice input is not supported in this browser. Please type your question."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang === "kn" ? "kn-IN" : selectedLang === "hi" ? "hi-IN" : selectedLang === "te" ? "te-IN" : selectedLang === "ta" ? "ta-IN" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setQuestionInput(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Submit Prashna
  const handleStartPrashna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) {
      alert(isKn ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ." : "Please enter your question.");
      return;
    }

    const numVal = Number(userNumberInput);
    if (isNaN(numVal) || numVal <= 0) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಸಂಖ್ಯೆಯನ್ನು (೧-೧೦೮) ನಮೂದಿಸಿ." : "Please enter a valid positive number.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await executeSankhyaShastraPrashna(
        questionInput.trim(),
        numVal,
        selectedLang,
        geminiApiKey
      );

      setActiveResult(result);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: result.rawQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const priestMsg: ChatMessage = {
        id: `priest-${Date.now()}`,
        sender: "priest",
        text: result.aiPrediction,
        result,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, userMsg, priestMsg]);
      setQuestionInput("");
    } catch (err) {
      console.error("Sankhya Shastra error:", err);
      alert(isKn ? "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ." : "Error processing Prashna. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Follow-Up Question
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !activeResult) return;

    const query = followUpInput.trim();
    setFollowUpInput("");

    const userMsg: ChatMessage = {
      id: `user-followup-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const answer = await askSankhyaShastraFollowUp(
        activeResult,
        query,
        selectedLang,
        geminiApiKey
      );

      const priestMsg: ChatMessage = {
        id: `priest-followup-${Date.now()}`,
        sender: "priest",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, priestMsg]);
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Name Tuning Handler
  const handleFetchAiNameCorrections = async () => {
    if (!nameInput.trim()) return;
    setIsAiValidatingName(true);
    try {
      const results = await fetchAIEnhancedNameCorrections(
        nameInput,
        nameTargetNumber,
        selectedLang,
        geminiApiKey
      );
      setAiNameSuggestions(results);
    } catch (err) {
      console.error("AI Name correction failed:", err);
    } finally {
      setIsAiValidatingName(false);
    }
  };

  const handleCopyName = (nameToCopy: string) => {
    navigator.clipboard.writeText(nameToCopy);
    setCopiedName(nameToCopy);
    setTimeout(() => {
      setCopiedName(null);
    }, 2000);
  };

  // Download PDF Report
  const handleDownloadPdf = async () => {
    const container = document.getElementById("sankhya-shastra-pdf-container");
    if (!container) {
      alert("PDF container not found");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFDF7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const safeName = (devoteeName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
      pdf.save(`Baggona_Sankhya_Shastra_Prashna_${safeName}_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error generating PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const languages = [
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ta", label: "தமிழ் (Tamil)" }
  ];

  // Computations for Tab 5: Name Numerology
  const chaldean = calculateChaldeanNameNumber(nameInput);
  const pythagorean = calculatePythagoreanNameNumber(nameInput);
  const nameRulerGuidance = NUMEROLOGY_GUIDANCE_MAP[chaldean.single] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const nameSuggestions = generateLuckyNameSuggestions(nameInput, [nameTargetNumber]);

  // Computations for Tab 6: Item Numerology
  const itemResult: ItemNumerologyResult = calculateItemNumerology(itemNumberInput);

  // Computations for Tab 7: Mulank & Bhagyank
  const birthDayNum = birthDatePicker ? birthDatePicker.getDate() : 15;
  const mulank = reduceToSingleDigit(birthDayNum);
  const fullYmdSum = birthDatePicker
    ? `${birthDatePicker.getFullYear()}${String(birthDatePicker.getMonth() + 1).padStart(2, "0")}${String(birthDatePicker.getDate()).padStart(2, "0")}`
        .split("")
        .reduce((acc, c) => acc + Number(c), 0)
    : 33;
  const bhagyank = reduceToSingleDigit(fullYmdSum);
  const mulankGuidance = NUMEROLOGY_GUIDANCE_MAP[mulank] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const bhagyankGuidance = NUMEROLOGY_GUIDANCE_MAP[bhagyank] || NUMEROLOGY_GUIDANCE_MAP[1]!;

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header Card */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              🔢 {isKn ? "ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ (Sankhya Shastra - Vedic Numerology Engine)" : "Sankhya Shastra - Vedic Numerology Engine"}
            </h1>
            <p className="mt-1 text-xs text-amber-900/80">
              {isKn
                ? "ದೈವಿಕ ಸಂಖ್ಯಾ ಪ್ರಶ್ನೋತ್ತರ, ವಿವಾಹ ಮೈತ್ರಿ, ಪುರುಷ & ಮಹಿಳಾ ಸಂಖ್ಯಾ ಭಾಗ್ಯ, ಅದೃಷ್ಟ ಹೆಸರು ಗಣಿತ ಹಾಗೂ ಮೂಲಾಂಕ/ಭಾಗ್ಯಾಂಕ ಜೀವನ ಮಾರ್ಗದರ್ಶನ."
                : "Vedic Numerology Prashna, Love Matchmaker, Boys & Girls Power Matrix, Lucky Name Generator & Mulank Guidance."}
            </p>
          </div>

          {activeResult && activeTab === "prashna" && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
            >
              <span>📄</span>
              <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪ್ರಶ್ನಾ ಫಲ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : "Download Prashna PDF Report")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Language Selector Radio Panel */}
      <Card className="border border-amber-300/80 bg-white p-4 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
          🌐 {isKn ? "ಸಂವಾದ & ವರದಿ ಭಾಷೆ (Select Language)" : "Select Language"}
        </label>
        <div className="flex flex-wrap gap-3">
          {languages.map((l) => (
            <label
              key={l.code}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                selectedLang === l.code
                  ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                  : "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              <input
                type="radio"
                name="sankhyaLang"
                value={l.code}
                checked={selectedLang === l.code}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="accent-amber-700"
              />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* 8 Interactive Navigation Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-300/80 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("vedic_grid")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "vedic_grid"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>📐</span>
          <span>{isKn ? "ವೇದಿಕ ಗ್ರಿಡ್" : "Vedic Grid"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("prashna")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "prashna"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>🔮</span>
          <span>{isKn ? "ಪ್ರಶ್ನಾವಳಿ" : "Prashna"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("match")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "match"
              ? "bg-gradient-to-r from-rose-600 via-rose-700 to-pink-800 text-white shadow-md"
              : "bg-white/80 text-rose-950 hover:bg-rose-100"
          }`}
        >
          <span>💑</span>
          <span>{isKn ? "ವಿವಾಹ ಮೈತ್ರಿ" : "Love Match"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("boys")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "boys"
              ? "bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md"
              : "bg-white/80 text-blue-950 hover:bg-blue-100"
          }`}
        >
          <span>👦</span>
          <span>{isKn ? "ಪುರುಷ ಭಾಗ್ಯ" : "Boys Special"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("girls")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "girls"
              ? "bg-gradient-to-r from-pink-600 via-pink-700 to-purple-800 text-white shadow-md"
              : "bg-white/80 text-pink-950 hover:bg-pink-100"
          }`}
        >
          <span>👧</span>
          <span>{isKn ? "ಮಹಿಳಾ ಸೌಭಾಗ್ಯ" : "Girls Special"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("name")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "name"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>🔤</span>
          <span>{isKn ? "ಶುಭ ನಾಮ" : "Lucky Name"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("item")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "item"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>📱</span>
          <span>{isKn ? "ವಾಹನ/ಫೋನ್" : "Assets"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mulank")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === "mulank"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>📅</span>
          <span>{isKn ? "ಮೂಲಾಂಕ" : "Mulank"}</span>
        </button>
      </div>

      {/* ====================================================================== */}
      {/* TAB 0: VEDIC GRID & DASHA BHAVISHYA                                    */}
      {/* ====================================================================== */}
      {activeTab === "vedic_grid" && (
        <VedicGridDashaTab
          selectedLang={selectedLang}
          apiKey={geminiApiKey}
          initialDevoteeName={devoteeName}
          initialBirthDate="1994-08-14"
        />
      )}

      {/* ====================================================================== */}
      {/* TAB 1: PRASHNA ORACLE                                                  */}
      {/* ====================================================================== */}
      {activeTab === "prashna" && (
        <>
          <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-4">
            <form onSubmit={handleStartPrashna} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                  ❓ {isKn ? "ನಿಮ್ಮ ಮನಸ್ಸಿನ ಪ್ರಶ್ನೆ (Your Question)" : "Your Question"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder={
                      isKn
                        ? "ಉದಾ: ನನಗೆ ಈ ವರ್ಷ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಸಿಗುವುದೇ? / ಹೊಸ ವ್ಯಾಪಾರ ಆರಂಭಿಸಬಹುದೇ?"
                        : "e.g. Will I get a job promotion this year? / Is this a good time to start business?"
                    }
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-4 py-3 pr-12 text-sm font-semibold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Voice Input (Speak)"}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-sm transition ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    <span>🎤</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                    🎲 {isKn ? "ಮನಸ್ಸಿನಲ್ಲಿ ಹೊಳೆದ ಸಂಖ್ಯೆ (Your Intuitive Number 1-108)" : "Your Intuitive Number (1-108)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={108}
                    value={userNumberInput}
                    onChange={(e) => setUserNumberInput(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isProcessing || !questionInput.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-3 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>🔮</span>
                    <span>
                      {isProcessing
                        ? isKn
                          ? "⌛ ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."
                          : "Analyzing Prashna..."
                        : isKn
                        ? "ದೈವಿಕ ಸಂಖ್ಯಾ ಪ್ರಶ್ನಾವಳಿ ಫಲ ಪಡೆಯಿರಿ"
                        : "Ask Sankhya Shastra Oracle"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {/* Animated Loader Overlay during API Processing */}
          {isProcessing && <SankhyaNumerologyLoader isKn={isKn} />}

          {/* AI Generative Chatbox Timeline & Priest Prashna Reading */}
          {messages.length > 0 && (
            <Card className="border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>💬</span>
                  <span>{isKn ? "ಗೋಕರ್ಣ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಸಂವಾದ & ಪ್ರಶ್ನಾ ಫಲ" : "Gokarna Numerology Guidance & Chat"}</span>
                </h3>
                {activeResult && (
                  <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                    ಸಂಖ್ಯಾ ಫಲ: {activeResult.userNumber} ({activeResult.rootNumber}) · {activeResult.rootRulerName[selectedLang] || activeResult.rootRulerName.kn}
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((msg) => {
                  const audioLang = selectedLang === "kn" ? "kn-IN" : selectedLang === "hi" ? "hi-IN" : selectedLang === "te" ? "te-IN" : selectedLang === "ta" ? "ta-IN" : "en-IN";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center justify-between w-full max-w-[95%] text-[11px] font-bold text-amber-800 mb-1 px-1">
                        <div className="flex items-center gap-1.5">
                          <span>{msg.sender === "user" ? `👤 ${devoteeName}` : "🕉️ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Gokarna Priest)"}</span>
                          <span>·</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        {msg.sender === "priest" && (
                          <div className="flex items-center gap-1 bg-amber-100/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                            <span className="text-[10px] font-bold">{isKn ? "ಧ್ವನಿ ಓದುಗ:" : "Audio Reader:"}</span>
                            <AudioPlayerButton text={msg.text} lang={audioLang} voiceType="jayashree" className="p-0.5" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[95%] shadow-sm ${
                          msg.sender === "user"
                            ? "bg-amber-800 text-amber-50 rounded-br-none"
                            : "bg-amber-50/90 border border-amber-300 text-amber-950 rounded-bl-none font-medium whitespace-pre-wrap"
                        }`}
                      >
                        {msg.result ? (
                          <div className="space-y-4">
                            {/* Prashna Verdict Header */}
                            <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-xs font-bold text-amber-900">
                                  {isKn ? "ಪ್ರಶ್ನಾ ಸಂಖ್ಯೆ:" : "Prashna Number:"}{" "}
                                  <span className="text-base text-amber-950 font-black">{msg.result.userNumber}</span>{" "}
                                  (ಮೂಲಾಂಕ: <span className="font-bold text-emerald-800">{msg.result.rootNumber}</span>)
                                </div>
                                <div className="text-xs text-amber-800 font-semibold mt-0.5">
                                  {isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"}{" "}
                                  <span className="font-bold text-amber-950">
                                    {msg.result.rootRulerName[selectedLang] || msg.result.rootRulerName.kn}
                                  </span>{" "}
                                  · {isKn ? "ದೇವತೆ:" : "Deity:"}{" "}
                                  <span className="font-bold text-amber-950">
                                    {msg.result.rootDeity[selectedLang] || msg.result.rootDeity.kn}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                                  {msg.result.verdictLabel[selectedLang] || msg.result.verdictLabel.kn} (ಬಲ: {msg.result.prashnaBalaScore}%)
                                </div>
                                <AudioPlayerButton text={msg.text} lang={audioLang} voiceType="jayashree" className="bg-amber-200 text-amber-950 p-1.5 border border-amber-300 shadow-xs" />
                              </div>
                            </div>

                            {/* Direction, Object State & Suspect / Location Guidance Card */}
                            {(msg.result.directionalGuidance || msg.result.objectMobilityAnalysis) && (
                              <div className="rounded-xl border-2 border-orange-300/90 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-3.5 shadow-sm space-y-2.5">
                                <div className="text-xs font-bold text-orange-950 flex items-center justify-between border-b border-orange-200 pb-1">
                                  <span className="flex items-center gap-1.5">
                                    <span>🧭</span>
                                    <span>{isKn ? "ದಿಕ್ಕು, ವಸ್ತು ಸ್ಥಿತಿ (ಚಲ/ಸ್ಥಿರ) ಹಾಗೂ ಶೋಧನಾ ಸ್ಥಳ ಮಾರ್ಗದರ್ಶನ:" : "Direction, Object Mobility & Search Location Guidance:"}</span>
                                  </span>
                                  <span className="text-[10px] bg-orange-100 text-orange-900 font-bold px-2 py-0.5 rounded-full border border-orange-300">
                                    Vedic Sthana Matrix
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {msg.result.directionalGuidance && (
                                    <div className="rounded-lg bg-white/90 p-2 border border-orange-200 shadow-xs space-y-0.5">
                                      <span className="font-bold text-orange-900 block flex items-center gap-1">
                                        <span>🧭</span>
                                        <span>{isKn ? "ಶೋಧನಾ ದಿಕ್ಕು (Search Direction):" : "Search Direction:"}</span>
                                      </span>
                                      <span className="text-amber-950 font-semibold leading-relaxed block">
                                        {msg.result.directionalGuidance[selectedLang] || msg.result.directionalGuidance.kn}
                                      </span>
                                    </div>
                                  )}

                                  {msg.result.objectMobilityAnalysis && (
                                    <div className="rounded-lg bg-white/90 p-2 border border-orange-200 shadow-xs space-y-0.5">
                                      <span className="font-bold text-orange-900 block flex items-center gap-1">
                                        <span>🔄</span>
                                        <span>{isKn ? "ವಸ್ತು ಸ್ಥಿತಿ (Mobility State):" : "Object State (Fixed/Movable):"}</span>
                                      </span>
                                      <span className="text-amber-950 font-semibold leading-relaxed block">
                                        {msg.result.objectMobilityAnalysis[selectedLang] || msg.result.objectMobilityAnalysis.kn}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {msg.result.suspectAndLocationProfile && (
                                  <div className="rounded-lg bg-white/90 p-2 border border-orange-200 shadow-xs text-xs space-y-0.5">
                                    <span className="font-bold text-orange-900 block flex items-center gap-1">
                                      <span>👥</span>
                                      <span>{isKn ? "ವ್ಯಕ್ತಿ / ಆಪ್ತರು / ಸ್ಥಳ ವಿವರಣೆ (Suspect & Location Profile):" : "Suspect & Location Profile:"}</span>
                                    </span>
                                    <span className="text-amber-950 font-semibold leading-relaxed block">
                                      {msg.result.suspectAndLocationProfile[selectedLang] || msg.result.suspectAndLocationProfile.kn}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Auspicious Alignment Matrix */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                                <span className="font-bold text-amber-900 block">{isKn ? "ಪ್ರಶ್ನಾ ಲಗ್ನ:" : "Prashna Lagna:"}</span>
                                <span className="text-amber-950 font-semibold">{msg.result.prashnaLagnaName[selectedLang] || msg.result.prashnaLagnaName.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                                <span className="font-bold text-amber-900 block">{isKn ? "ಕಾರ್ಯ ಸ್ಥಾನ:" : "Karya House:"}</span>
                                <span className="text-amber-950 font-semibold">{msg.result.primaryKaryaLabel[selectedLang] || msg.result.primaryKaryaLabel.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                                <span className="font-bold text-amber-900 block">{isKn ? "ಲಗ್ನ ಗತಿ:" : "Sign Mobility:"}</span>
                                <span className="text-amber-950 font-semibold">{msg.result.signMobilityLabel[selectedLang] || msg.result.signMobilityLabel.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/80 p-2 border border-amber-200">
                                <span className="font-bold text-amber-900 block">{isKn ? "ಫಲ ಕಾಲಾವಧಿ:" : "Time Horizon:"}</span>
                                <span className="text-amber-950 font-semibold">{msg.result.timeHorizonLabel[selectedLang] || msg.result.timeHorizonLabel.kn}</span>
                              </div>
                            </div>

                            {/* Detailed 6-Paragraph AI Prediction */}
                            <div className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm space-y-3">
                              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                  <span>📜</span>
                                  <span>{isKn ? "ದೈವಿಕ ಪ್ರಶ್ನಾ ಫಲ ಹಾಗೂ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನ (Detailed In-Depth Guidance):" : "Detailed In-Depth Vedic Numerology Guidance:"}</span>
                                </span>
                                <AudioPlayerButton text={msg.text} lang={audioLang} voiceType="jayashree" className="text-amber-900 hover:bg-amber-100 p-1" />
                              </div>
                              <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-serif space-y-2 whitespace-pre-wrap">
                                {sanitizeAIText(msg.text)}
                              </div>
                            </div>

                            {/* Sacred Remedy */}
                            <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 shadow-sm space-y-1">
                              <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                                <span>🪔</span>
                                <span>{isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy):" : "Sacred Gokarna Mahabaleshwara Remedy:"}</span>
                              </div>
                              <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                                {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                              <span className="text-xs font-bold text-amber-900">{isKn ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಉತ್ತರ:" : "Priest Guidance:"}</span>
                              <AudioPlayerButton text={msg.text} lang={audioLang} voiceType="jayashree" className="p-0.5" />
                            </div>
                            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-serif whitespace-pre-wrap">
                              {sanitizeAIText(msg.text)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Follow-up Question Input Bar */}
              <form onSubmit={handleSendFollowUp} className="flex gap-2 pt-2 border-t border-amber-200">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder={isKn ? "ಸಂಖ್ಯಾ ಫಲದ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ವಿವರಣೆ ಕೇಳಿ..." : "Ask follow-up clarification on this numerology reading..."}
                  className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !followUpInput.trim()}
                  className="rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-900 disabled:opacity-50"
                >
                  {isKn ? "ಕೇಳಿ" : "Ask"}
                </button>
              </form>
            </Card>
          )}
        </>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: LOVE & MARRIAGE NUMEROLOGY MATCHMAKER                            */}
      {/* ====================================================================== */}
      {activeTab === "match" && (
        <LoveMarriageMatchTab lang={selectedLang} defaultBoyName="Srikanth Sharma" defaultGirlName="Lakshmi Hegde" />
      )}

      {/* ====================================================================== */}
      {/* TAB 3: BOYS' SPECIAL POWER & WEALTH MATRIX                             */}
      {/* ====================================================================== */}
      {activeTab === "boys" && (
        <BoysNumerologyTab lang={selectedLang} defaultName={session?.input?.name || "Srikanth Sharma"} defaultDob="1994-06-15" />
      )}

      {/* ====================================================================== */}
      {/* TAB 4: GIRLS' SPECIAL SAUBHAGYA & NAME CHANGE MATRIX                   */}
      {/* ====================================================================== */}
      {activeTab === "girls" && (
        <GirlsNumerologyTab lang={selectedLang} defaultName="Lakshmi Hegde" defaultDob="1996-09-24" />
      )}

      {/* ====================================================================== */}
      {/* TAB 5: LUCKY NAME NUMEROLOGY & SPELLING SUGGESTIONS                    */}
      {/* ====================================================================== */}
      {activeTab === "name" && (
        <div className="space-y-6">
          <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                  🔤 {isKn ? "ನಿಮ್ಮ ಇಂಗ್ಲಿಷ್ ಹೆಸರು (Enter English Name)" : "Enter English Name"}
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setAiNameSuggestions(null);
                  }}
                  placeholder="e.g. Shreeram Pandit"
                  className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                  🎯 {isKn ? "ಗುರಿ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ (Target Lucky Number)" : "Target Lucky Number"}
                </label>
                <select
                  value={nameTargetNumber}
                  onChange={(e) => {
                    setNameTargetNumber(Number(e.target.value));
                    setAiNameSuggestions(null);
                  }}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                >
                  <option value={5}>5 - ಬುಧ (ವ್ಯಾಪಾರ, ಬುದ್ಧಿಶಕ್ತಿ & ಯಶಸ್ಸು - Highly Recommended)</option>
                  <option value={6}>6 - ಶುಕ್ರ (ಸೌಭಾಗ್ಯ, ಸಂಪತ್ತು & ಐಷಾರಾಮ)</option>
                  <option value={1}>1 - ರವಿ (ನಾಯಕತ್ವ, ಕೀರ್ತಿ & ಅಧಿಕಾರ)</option>
                  <option value={3}>3 - ಗುರು (ಜ್ಞಾನ, ಧರ್ಮ & ಆಧ್ಯಾತ್ಮಿಕತೆ)</option>
                </select>
              </div>
            </div>

            {/* Chaldean & Pythagorean Comparison Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  🏛️ ಶಾಲ್ಡಿಯನ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Chaldean Numerology)
                </div>
                <div className="text-2xl font-black text-amber-950">
                  {chaldean.compound}{" "}
                  <span className="text-xs font-bold text-amber-800">
                    (ಏಕಾಂಕ: {chaldean.single} - {nameRulerGuidance.rulerKn})
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 font-medium pt-1 leading-relaxed">
                  {nameRulerGuidance.traitsKn}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  📐 ಪೈಥಾಗೋರಿಯನ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Pythagorean)
                </div>
                <div className="text-2xl font-black text-amber-950">
                  {pythagorean.compound}{" "}
                  <span className="text-xs font-bold text-amber-800">
                    (ಏಕಾಂಕ: {pythagorean.single})
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 font-medium pt-1 leading-relaxed">
                  {isKn ? "ಪಾಶ್ಚಾತ್ಯ ಪದ್ಧತಿಯ ಪ್ರಕಾರ ಪೂರ್ಣ ಹೆಸರಿನ ಸಂಖ್ಯಾ ಶಕ್ತಿ." : "Western Pythagorean total vibration sum."}
                </p>
              </div>
            </div>

            {/* AI Vedic Name Validation Action Bar */}
            <div className="rounded-2xl border border-amber-400/80 bg-gradient-to-r from-amber-500/15 via-orange-100/70 to-amber-500/15 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-bold text-amber-950 flex items-center justify-center sm:justify-start gap-1.5">
                  <span>🤖</span>
                  <span>{isKn ? "ಜೆಮಿನಿ AI ಭಾರತೀಯ ಹೆಸರು & ಅಕ್ಷರ ಸ್ಥಳ ಪ್ರಮಾಣೀಕರಣ" : "GenAI Indian Name & Letter Placement Validation"}</span>
                </div>
                <div className="text-[11px] text-amber-900/80">
                  {isKn
                    ? "ವಿಕೃತ ಅಕ್ಷರಗಳಿಲ್ಲದೆ, ಶಾಸ್ತ್ರೋಕ್ತ ಭಾರತೀಯ ಉಚ್ಚಾರಣೆ ಹಾಗೂ ಅಕ್ಷರ ಬದಲಾವಣೆ ಸ್ಥಳದ ನಿಖರ ವಿವರ."
                    : "Validates 100% authentic Indian phonetics with exact letter change locations and zero odd spellings."}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchAiNameCorrections}
                disabled={isAiValidatingName || !nameInput.trim()}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
              >
                {isAiValidatingName ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>{isKn ? "AI ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ..." : "AI Validating Indian Names..."}</span>
                  </>
                ) : (
                  <>
                    <span>🔮</span>
                    <span>{isKn ? "AI ಮೂಲಕ ಪರಿಶೀಲಿಸಿ (AI Validate & Tune)" : "AI Validate & Generate"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Lucky Spelling Variations Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>
                    {aiNameSuggestions && aiNameSuggestions.length > 0
                      ? (isKn ? `🤖 AI ಪ್ರಮಾಣೀಕೃತ ಭಾರತೀಯ ಅದೃಷ್ಟ ಹೆಸರುಗಳು (ಗುರಿ: ${nameTargetNumber}):` : `🤖 AI Validated Indian Lucky Names for Root ${nameTargetNumber}:`)
                      : (isKn ? `✨ ಶಾಸ್ತ್ರೋಕ್ತ ಭಾರತೀಯ ಹೆಸರಿನ ಪರಿಷ್ಕರಣೆ ಸಲಹೆಗಳು (ಗುರಿ: ${nameTargetNumber}):` : `✨ Authentic Indian Spelling Variations for Root ${nameTargetNumber}:`)}
                  </span>
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {aiNameSuggestions ? "AI-Validated 100% Indian" : "Vedic Phonetic Matrix"}
                </span>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(aiNameSuggestions || nameSuggestions).map((sug: any, idx: number) => {
                  const suggestedName = sug.suggestedSpelling || sug.suggestedName;
                  const compound = sug.suggestedCompound || sug.chaldeanNumber;
                  const root = sug.suggestedRoot || sug.chaldeanRoot;
                  const exactLocationKn = sug.exactChangeLocation?.kn || sug.exactChangeKn || `${nameInput} ➔ ${suggestedName} ಅಕ್ಷರ ಪರಿಷ್ಕರಣೆ`;
                  const exactLocationEn = sug.exactChangeLocation?.en || sug.exactChangeEn || `Modified for ${nameInput} ➔ ${suggestedName}`;
                  const style = sug.phoneticStyle || "Vedic Name Tuning";
                  const qualityKn = sug.vibrationQuality?.kn || sug.rulerKn || "ಬುಧ ಲಕ್ಷ್ಮೀ ಯೋಗ";
                  const impactKn = sug.luckImpact?.kn || "ವೃತ್ತಿ ಜಯ, ಧನ ವೃದ್ಧಿ ಹಾಗೂ ತೇಜಸ್ಸು.";
                  const isHarmonious = sug.isHarmonious;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40 p-4 shadow-sm space-y-2.5 transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-emerald-950 tracking-wide font-serif">
                              {suggestedName}
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                              🕉️ {style}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-amber-900 mt-0.5">
                            🏛️ ಶಾಲ್ಡಿಯನ್ ಮೊತ್ತ: <span className="text-sm font-black text-amber-950">{compound}</span> (ಏಕಾಂಕ: {root})
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyName(suggestedName)}
                          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition flex items-center gap-1 shadow-xs"
                          title="Copy suggested spelling"
                        >
                          <span>{copiedName === suggestedName ? "✅" : "📋"}</span>
                          <span>{copiedName === suggestedName ? (isKn ? "ಕಾಪಿ ಆಗಿದೆ" : "Copied!") : (isKn ? "ಕಾಪಿ" : "Copy")}</span>
                        </button>
                      </div>

                      {/* Exact Letter Modification Location */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2 text-xs font-medium text-amber-950 space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <span>📍</span>
                          <span>{isKn ? "ಅಕ್ಷರ ಬದಲಾವಣೆ / ಸೇರ್ಪಡೆಯ ನಿಖರ ಸ್ಥಳ:" : "Exact Letter Change Location:"}</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-950">
                          {isKn ? exactLocationKn : exactLocationEn}
                        </div>
                      </div>

                      {/* Vibration & Impact */}
                      <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-emerald-100">
                        <div className="font-semibold text-emerald-900">
                          {isKn ? qualityKn : (sug.vibrationQuality?.en || sug.rulerEn || "Auspicious Vibration")}
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed">
                          {isKn ? impactKn : (sug.luckImpact?.en || "Enhances financial abundance and career success.")}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                          <span>✅</span>
                          <span>{isKn ? "೧೦೦% ಭಾರತೀಯ ಧ್ವನಿ ಪ್ರಮಾಣೀಕೃತ" : "100% Indian Phonetic Match"}</span>
                        </span>
                        {isHarmonious ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            🌟 ೧೦೦% ಶುಭ
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            ಸಮತೋಲಿತ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 6: PHONE / VEHICLE / HOUSE CALCULATOR                               */}
      {/* ====================================================================== */}
      {activeTab === "item" && (
        <div className="space-y-6">
          <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-5">
            <div className="flex flex-wrap gap-3 border-b border-amber-200 pb-3">
              <button
                type="button"
                onClick={() => {
                  setItemType("phone");
                  setItemNumberInput("9972339362");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  itemType === "phone"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                📱 {isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone Number)" : "Phone Number"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType("vehicle");
                  setItemNumberInput("KA30M1008");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  itemType === "vehicle"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                🚗 {isKn ? "ವಾಹನ ನೋಂದಣಿ ಸಂಖ್ಯೆ (Vehicle Number)" : "Vehicle Number"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType("house");
                  setItemNumberInput("405");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  itemType === "house"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                🏠 {isKn ? "ಮನೆ / ಫ್ಲಾಟ್ ಸಂಖ್ಯೆ (House / Flat No)" : "House / Flat No"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                🔢 {itemType === "phone" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ" : itemType === "vehicle" ? "ವಾಹನದ ನಂಬರ್ ಪ್ಲೇಟ್ ನಮೂದಿಸಿ" : "ಮನೆ ಅಥವಾ ಕಚೇರಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ"}
              </label>
              <input
                type="text"
                value={itemNumberInput}
                onChange={(e) => setItemNumberInput(e.target.value)}
                placeholder="e.g. 9972339362 / KA30M1008 / 405"
                className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-4 py-3 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
              />
            </div>

            {/* Calculated Result Display Card */}
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/70 p-5 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <div>
                  <div className="text-[11px] font-bold text-amber-800 uppercase">
                    ಒಟ್ಟು ಸಂಖ್ಯಾ ಮೊತ್ತ (Digits Total Sum)
                  </div>
                  <div className="text-3xl font-black text-amber-950">
                    {itemResult.totalSum}{" "}
                    <span className="text-base font-bold text-emerald-800">
                      → ಏಕಾಂಕ: {itemResult.singleDigit} ({itemResult.rulerKn})
                    </span>
                  </div>
                </div>

                <div className="text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300">
                  {isKn ? itemResult.verdictKn : itemResult.verdictEn}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white p-3 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">🪐 ಅಧಿಪತಿ ಗ್ರಹ & ದೇವತೆ:</span>
                  <span className="text-amber-950 font-semibold">{itemResult.rulerKn} · {itemResult.deityKn}</span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">💡 ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಸಲಹೆ:</span>
                  <span className="text-slate-800 font-medium">{isKn ? itemResult.recommendationKn : itemResult.recommendationEn}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 7: MULANK & BHAGYANK FULL LIFE MATRIX                              */}
      {/* ====================================================================== */}
      {activeTab === "mulank" && (
        <div className="space-y-6">
          <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-200 pb-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1">
                  📅 {isKn ? "ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ (Select Birth Date)" : "Select Birth Date"}
                </label>
                <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
              </div>

              <div className="flex gap-4">
                <div className="rounded-2xl border border-amber-400 bg-amber-50 px-4 py-2 text-center shadow-sm">
                  <div className="text-[10px] font-bold text-amber-800 uppercase">ಮೂಲಾಂಕ (Root Number)</div>
                  <div className="text-2xl font-black text-amber-950">{mulank}</div>
                  <div className="text-[10px] text-amber-800 font-semibold">{mulankGuidance.rulerKn}</div>
                </div>

                <div className="rounded-2xl border border-amber-400 bg-amber-50 px-4 py-2 text-center shadow-sm">
                  <div className="text-[10px] font-bold text-amber-800 uppercase">ಭಾಗ್ಯಾಂಕ (Destiny Number)</div>
                  <div className="text-2xl font-black text-amber-950">{bhagyank}</div>
                  <div className="text-[10px] text-amber-800 font-semibold">{bhagyankGuidance.rulerKn}</div>
                </div>
              </div>
            </div>

            {/* Deep Matrix Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-3">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-950 border-b border-amber-200 pb-1">
                  🌟 ಮೂಲಾಂಕ {mulank} ರ ಸಮಗ್ರ ಗುಣಲಕ್ಷಣ (Root Number Insights)
                </h4>
                <div className="space-y-2 text-xs">
                  <div><span className="font-bold text-amber-900">ಅಧಿಪತಿ ಗ್ರಹ:</span> {mulankGuidance.rulerKn} ({mulankGuidance.rulerEn})</div>
                  <div><span className="font-bold text-amber-900">ದೇವತೆ:</span> {mulankGuidance.deityKn}</div>
                  <div><span className="font-bold text-amber-900">ಪಂಚಭೂತ ತತ್ತ್ವ:</span> {mulankGuidance.elementKn}</div>
                  <div><span className="font-bold text-amber-900">ಶುಭ ದಿನಾಂಕಗಳು:</span> {mulankGuidance.luckyDatesKn}</div>
                  <div><span className="font-bold text-amber-900">ಶುಭ ಬಣ್ಣಗಳು:</span> {mulankGuidance.luckyColorsKn}</div>
                  <div><span className="font-bold text-amber-900">ಶುಭ ರತ್ನ:</span> {mulankGuidance.luckyGemsKn}</div>
                  <div className="text-amber-950 leading-relaxed pt-1 font-medium bg-white p-2.5 rounded-xl border border-amber-200">
                    {mulankGuidance.traitsKn}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-3">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-950 border-b border-amber-200 pb-1">
                  👑 ಭಾಗ್ಯಾಂಕ {bhagyank} ರ ಜೀವಿತಾವಧಿ ಯಶಸ್ಸು (Life Destiny Path)
                </h4>
                <div className="space-y-2 text-xs">
                  <div><span className="font-bold text-amber-900">ಜೀವನ ಮಾರ್ಗ ಅಧಿಪತಿ:</span> {bhagyankGuidance.rulerKn} ({bhagyankGuidance.rulerEn})</div>
                  <div><span className="font-bold text-amber-900">ಮೈತ್ರಿ ಸಂಖ್ಯೆಗಳು:</span> {bhagyankGuidance.friendlyNumbers.join(", ")}</div>
                  <div><span className="font-bold text-amber-900">ಶತ್ರು / ಎಚ್ಚರಿಕೆಯ ಸಂಖ್ಯೆಗಳು:</span> {bhagyankGuidance.enemyNumbers.length > 0 ? bhagyankGuidance.enemyNumbers.join(", ") : "ಯಾವುದೂ ಇಲ್ಲ"}</div>
                  <div><span className="font-bold text-amber-900">ಉನ್ನತ ಸಾಧನೆಯ ಕ್ಷೇತ್ರ:</span> {bhagyankGuidance.traitsKn}</div>
                  <div className="text-amber-950 leading-relaxed pt-1 font-medium bg-white p-2.5 rounded-xl border border-amber-200">
                    ಭಾಗ್ಯಾಂಕ {bhagyank} ಹೊಂದಿರುವವರು ಜೀವನದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಅದ್ಭುತ ಧನಲಾಭ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶಾಶ್ವತ ಕೀರ್ತಿಯನ್ನು ಪಡೆಯುತ್ತಾರೆ.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hidden Container for PDF Export of Prashna Result */}
      {activeResult && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <SankhyaShastraPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />
        </div>
      )}
    </div>
  );
}
