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
import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";
import { sanitizeAIText } from "../utils/textFormatter";
import { SankhyaNumerologyLoader } from "../components/sankhyashastra/SankhyaNumerologyLoader";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  result?: SankhyaShastraResult;
  timestamp: string;
};

type TabType = "prashna" | "name" | "item" | "mulank";

export default function SankhyaShastraPage(): JSX.Element {
  const appLanguage = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const session = useKundliViewerStore((s) => s.session);

  // Language selector state (defaults to appLanguage or kn)
  const [selectedLang, setSelectedLang] = useState<string>(appLanguage || "kn");
  const isKn = selectedLang === "kn";

  const devoteeName = session?.input?.name || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee");

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("prashna");

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
  // TAB 2: LUCKY NAME NUMEROLOGY STATES
  // ----------------------------------------------------------------------
  const [nameInput, setNameInput] = useState<string>(session?.input?.name || "Shreeram Pandit");
  const [nameTargetNumber, setNameTargetNumber] = useState<number>(5);

  // ----------------------------------------------------------------------
  // TAB 3: PHONE / VEHICLE / HOUSE CALCULATOR STATES
  // ----------------------------------------------------------------------
  const [itemType, setItemType] = useState<"phone" | "vehicle" | "house">("phone");
  const [itemNumberInput, setItemNumberInput] = useState<string>("9972339362");

  // ----------------------------------------------------------------------
  // TAB 4: MULANK & BHAGYANK STATES
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
      recognition.lang =
        selectedLang === "kn"
          ? "kn-IN"
          : selectedLang === "hi"
          ? "hi-IN"
          : selectedLang === "te"
          ? "te-IN"
          : selectedLang === "ta"
          ? "ta-IN"
          : "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestionInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Voice input error:", err);
      setIsListening(false);
    }
  };

  // Submit Prashna Query
  const handleSubmitPrashna = async (e: React.FormEvent) => {
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

  // Computations for Tab 2: Name Numerology
  const chaldean = calculateChaldeanNameNumber(nameInput);
  const pythagorean = calculatePythagoreanNameNumber(nameInput);
  const nameRulerGuidance = NUMEROLOGY_GUIDANCE_MAP[chaldean.single] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const nameSuggestions = generateLuckyNameSuggestions(nameInput, [nameTargetNumber]);

  // Computations for Tab 3: Item Numerology
  const itemResult: ItemNumerologyResult = calculateItemNumerology(itemNumberInput);

  // Computations for Tab 4: Mulank & Bhagyank
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
                ? "ದೈವಿಕ ಸಂಖ್ಯಾ ಪ್ರಶ್ನೋತ್ತರ, ಅದೃಷ್ಟ ಹೆಸರು ಗಣಿತ (Lucky Name), ಫೋನ್/ವಾಹನ ಸಂಖ್ಯೆ ಪರೀಕ್ಷೆ ಹಾಗೂ ಮೂಲಾಂಕ/ಭಾಗ್ಯಾಂಕ ಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ."
                : "Vedic Numerology Prashna Oracle, Lucky Name Generator, Phone/Vehicle Calculator, and Mulank & Bhagyank Guidance."}
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

      {/* 4 Interactive Navigation Tabs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-300/80 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("prashna")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "prashna"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>🔮</span>
          <span>{isKn ? "ಸಂಖ್ಯಾ ಪ್ರಶ್ನೆ (Prashna Oracle)" : "Prashna Oracle"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("name")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "name"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>🔤</span>
          <span>{isKn ? "ಅದೃಷ್ಟ ಹೆಸರು (Lucky Name)" : "Lucky Name"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("item")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "item"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>📱</span>
          <span>{isKn ? "ಫೋನ್ / ವಾಹನ / ಮನೆ" : "Phone/Vehicle/House"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mulank")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "mulank"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>📅</span>
          <span>{isKn ? "ಮೂಲಾಂಕ & ಭಾಗ್ಯಾಂಕ" : "Mulank & Bhagyank"}</span>
        </button>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: PRASHNA ORACLE PANEL                                            */}
      {/* ====================================================================== */}
      {activeTab === "prashna" && (
        <>
          <Card className="border border-amber-300/80 bg-white p-5 shadow-sm">
            <form onSubmit={handleSubmitPrashna} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-950">
                    ❓ {isKn ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ (Ask Your Question)" : "Ask Your Prashna Question"}
                  </label>

                  {/* Mic / Speech Input Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    <span>🎙️</span>
                    <span>{isListening ? (isKn ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : (isKn ? "ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ (Voice Input)" : "Voice Mic")}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder={
                    isKn
                      ? "ಉದಾ: ನನಗೆ ಈ ತಿಂಗಳು ಹೊಸ ಮನೆ ಆಸ್ತಿ ಖರೀದಿ ಶುಭವೇ? ಅಥವಾ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಸಿಗುತ್ತದೆಯೇ?"
                      : "e.g. Will I get promotion in job next month? Or is it auspicious to buy property now?"
                  }
                  className="w-full rounded-xl border border-amber-300 bg-amber-50/40 p-3 text-sm font-semibold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                    🔢 {isKn ? "ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೋಚಿದ ಸಂಖ್ಯೆಯನ್ನು ನೀಡಿ (Enter Number e.g. 1 - 108)" : "Enter Random Chosen Number (e.g. 1 - 108)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={userNumberInput}
                    onChange={(e) => setUserNumberInput(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-3 text-sm font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>🔮</span>
                    <span>{isProcessing ? (isKn ? "⌛ ಸಂಖ್ಯಾ ಗಣಿತ ಪ್ರಶ್ನೆ ಪರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing Prashna...") : (isKn ? "ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆ ಪರಿಶೀಲಿಸಿ" : "Analyze Prashna Question")}</span>
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {/* Full-Screen Centered Animated Numerology Modal Overlay */}
          {isProcessing && <SankhyaNumerologyLoader isKn={isKn} />}

          {/* AI Generative Chatbox Timeline & Priest Reading View */}
          {messages.length > 0 && (
            <Card className="border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>💬</span>
                  <span>{isKn ? "ಗೋಕರ್ಣ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಸಂವಾದ ಹಾಗೂ ಪರಿಹಾರ" : "Gokarna Sankhya Shastra Guidance & Chat"}</span>
                </h3>
                {activeResult && (
                  <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                    {activeResult.prashnaLagnaName[selectedLang] || activeResult.prashnaLagnaName.en} (ಮನೆ {activeResult.prashnaLagnaHouse}) · ಸಂಖ್ಯೆ: {activeResult.userNumber}
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 mb-1 px-1">
                      <span>{msg.sender === "user" ? `👤 ${devoteeName}` : "🕉️ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Gokarna Priest)"}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[90%] shadow-sm ${
                        msg.sender === "user"
                          ? "bg-amber-800 text-amber-50 rounded-br-none"
                          : "bg-amber-50/90 border border-amber-300 text-amber-950 rounded-bl-none font-medium whitespace-pre-wrap"
                      }`}
                    >
                      {msg.result && (
                        <div className="mb-3 rounded-xl border border-amber-300 bg-amber-100/80 p-2.5 text-xs text-amber-950 font-bold flex flex-wrap gap-3">
                          <div>🔢 {isKn ? "ಆಯ್ಕೆ ಸಂಖ್ಯೆ:" : "Number:"} {msg.result.userNumber}</div>
                          <div>🌱 {isKn ? "ಮೂಲ ಸಂಖ್ಯೆ (Root):" : "Root:"} {msg.result.rootNumber} ({msg.result.rootRulerName[selectedLang] || msg.result.rootRulerName.en})</div>
                          <div>🏛️ {isKn ? "ಪ್ರಶ್ನಾ ಲಗ್ನ:" : "Lagna:"} {msg.result.prashnaLagnaName[selectedLang] || msg.result.prashnaLagnaName.en}</div>
                          <div>⚡ {isKn ? "ಪ್ರಶ್ನಾ ಬಲ:" : "Score:"} {msg.result.prashnaBalaScore}%</div>
                        </div>
                      )}

                      {sanitizeAIText(msg.text)}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Follow-up Question Input Bar */}
              <form onSubmit={handleSendFollowUp} className="flex gap-2 pt-2 border-t border-amber-200">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder={isKn ? "ಇನ್ನಷ್ಟು ವಿವರಣೆ ಅಥವಾ ಪ್ರಶ್ನೆ ಕೇಳಿ..." : "Ask follow-up clarification on this reading..."}
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

              {activeResult && (
                <div className="flex justify-end pt-3 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
                  >
                    <span>📄</span>
                    <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪ್ರಶ್ನಾ ಫಲ ಹಾಗೂ ಪ್ರಶ್ನೋತ್ತರ PDF ಡೌನ್‌ಲೋಡ್" : "Download Prashna Report & Q&A PDF")}</span>
                  </button>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: LUCKY NAME NUMEROLOGY PANEL                                     */}
      {/* ====================================================================== */}
      {activeTab === "name" && (
        <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
          <div className="border-b border-amber-200 pb-3">
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>🔤</span>
              <span>{isKn ? "ನಾಮ ಸಂಖ್ಯೆ & ಅದೃಷ್ಟ ಹೆಸರು ವಿಶ್ಲೇಷಕ (Lucky Name Numerology)" : "Name Numerology & Lucky Name Generator"}</span>
            </h3>
            <p className="text-xs text-amber-900/80 mt-1">
              {isKn
                ? "ಪ್ರಾಚೀನ ಚಾಲ್ಡಿಯನ್ ಹಾಗೂ ಪೈಥಾಗೋರಿಯನ್ ಪದ್ಧತಿಯ ಪ್ರಕಾರ ನಿಮ್ಮ ಹೆಸರು ಅಥವಾ ವ್ಯವಹಾರದ ಹೆಸರಿನ ಸಂಖ್ಯಾ ಬಲ ಲೆಕ್ಕಹಾಕಿ, ಅದೃಷ್ಟ ಹೆಸರು ಬದಲಾವಣೆ ಪಡೆಯಿರಿ."
                : "Calculate Chaldean & Pythagorean name numbers and generate auspicious spelling adjustments for success."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                👤 {isKn ? "ಹೆಸರು ನಮೂದಿಸಿ (Enter Full Name or Business Name):" : "Full Name or Business Name:"}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Shreeram Pandit"
                className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                🎯 {isKn ? "ಗುರಿ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ ಆಯ್ಕೆ (Target Lucky Number):" : "Target Lucky Planet Number:"}
              </label>
              <select
                value={nameTargetNumber}
                onChange={(e) => setNameTargetNumber(Number(e.target.value))}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
              >
                <option value={5}>೫ (5) - ಬುಧ (Mercury - Business, Intelligence & Fame)</option>
                <option value={6}>೬ (6) - ಶುಕ್ರ (Venus - Wealth, Luxury & Harmony)</option>
                <option value={1}>೧ (1) - ಸೂರ್ಯ (Sun - Leadership, Power & Dignity)</option>
                <option value={3}>೩ (3) - ಗುರು (Jupiter - Wisdom, Knowledge & Respect)</option>
              </select>
            </div>
          </div>

          {/* Name Calculation Display Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Chaldean Card */}
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
                <span className="font-bold text-xs text-amber-950">🕉️ {isKn ? "ಚಾಲ್ಡಿಯನ್ ಪದ್ಧತಿ (Chaldean Method)" : "Chaldean Method"}</span>
                <span className="text-xs font-extrabold bg-amber-700 text-white px-2.5 py-0.5 rounded-full">Primary Vedic</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-xs text-amber-900 font-bold">{isKn ? "ಒಟ್ಟು ಮೊತ್ತ:" : "Compound Total:"} <span className="text-amber-950 font-extrabold text-base">{chaldean.compound}</span></div>
                <div className="text-xs text-amber-900 font-bold">{isKn ? "ಮೂಲ ಸಂಖ್ಯೆ:" : "Single Root:"} <span className="text-amber-900 font-black text-xl">{chaldean.single}</span></div>
              </div>
              <div className="text-xs text-amber-950 font-semibold border-t border-amber-200/80 pt-2 flex items-center justify-between">
                <span>🪐 {isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"} <strong className="text-amber-900">{isKn ? nameRulerGuidance.rulerKn : nameRulerGuidance.rulerEn}</strong></span>
                <span>🪔 {isKn ? "ದೇವತೆ:" : "Deity:"} <strong>{isKn ? nameRulerGuidance.deityKn : nameRulerGuidance.deityEn}</strong></span>
              </div>
            </div>

            {/* Pythagorean Card */}
            <div className="rounded-2xl border border-amber-300 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="font-bold text-xs text-amber-950">📐 {isKn ? "ಪೈಥಾಗೋರಿಯನ್ ಪದ್ಧತಿ (Pythagorean Method)" : "Pythagorean Method"}</span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Western</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-xs text-amber-900 font-bold">{isKn ? "ಒಟ್ಟು ಮೊತ್ತ:" : "Compound Total:"} <span className="text-amber-950 font-extrabold text-base">{pythagorean.compound}</span></div>
                <div className="text-xs text-amber-900 font-bold">{isKn ? "ಮೂಲ ಸಂಖ್ಯೆ:" : "Single Root:"} <span className="text-amber-900 font-black text-xl">{pythagorean.single}</span></div>
              </div>
              <div className="text-xs text-amber-950 font-semibold border-t border-amber-200 pt-2">
                <span>✨ {isKn ? "ವ್ಯಕ್ತಿತ್ವ ಸ್ಪಂದನ:" : "Vibration:"} {isKn ? nameRulerGuidance.traitsKn : nameRulerGuidance.traitsEn}</span>
              </div>
            </div>
          </div>

          {/* Lucky Spelling Suggestions List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2 border-b border-amber-200 pb-2">
              <span>🌟</span>
              <span>{isKn ? "ಅದೃಷ್ಟ ಹೆಸರು ಬದಲಾವಣೆ ಸಲಹೆಗಳು (Auspicious Name Spelling Variations)" : "Auspicious Name Spelling Suggestions"}</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {nameSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 flex items-center justify-between transition ${
                    sug.isHarmonious
                      ? "border-emerald-400 bg-emerald-50/70 shadow-sm"
                      : "border-amber-200 bg-amber-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✨</span>
                    <div>
                      <div className="text-sm font-bold text-amber-950 capitalize">{sug.suggestedName}</div>
                      <div className="text-[11px] text-amber-900/80 font-medium">
                        {isKn ? `ಬದಲಾವಣೆ: ${sug.addedLetter} · ಒಟ್ಟು ಸಂಖ್ಯಾ ಬಲ: ${sug.chaldeanNumber}` : `Modification: ${sug.addedLetter} · Compound: ${sug.chaldeanNumber}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-900">{isKn ? sug.rulerKn : sug.rulerEn}</div>
                    {sug.isHarmonious && (
                      <span className="inline-block text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full mt-0.5">
                        {isKn ? "🟢 ೧೦೦% ಅತ್ಯುತ್ತಮ" : "🟢 100% Lucky"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: PHONE / VEHICLE / HOUSE CALCULATOR PANEL                       */}
      {/* ====================================================================== */}
      {activeTab === "item" && (
        <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
          <div className="border-b border-amber-200 pb-3">
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>📱</span>
              <span>{isKn ? "ಅದೃಷ್ಟ ಫೋನ್, ವಾಹನ ಹಾಗೂ ಮನೆ ಸಂಖ್ಯೆ ಪರಿಶೀಲಕ" : "Lucky Phone, Vehicle & House Number Calculator"}</span>
            </h3>
            <p className="text-xs text-amber-900/80 mt-1">
              {isKn
                ? "ನಿಮ್ಮ ಮೊಬೈಲ್ ಫೋನ್ ಸಂಖ್ಯೆ, ವಾಹನ ಸಂಖ್ಯೆ ಅಥವಾ ಮನೆ ಸಂಖ್ಯೆಯ ಸಂಖ್ಯಾ ಬಲ ಪರಿಶೀಲಿಸಿ, ಅದೃಷ್ಟ ವೃದ್ಧಿಸುವ ಪರಿಹಾರ ಪಡೆಯಿರಿ."
                : "Check numerology compatibility for your phone number, vehicle plate, or house number."}
            </p>
          </div>

          {/* Item Type Toggle Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setItemType("phone"); setItemNumberInput("9972339362"); }}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                itemType === "phone"
                  ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                  : "border-amber-200 bg-amber-50/50 text-amber-900"
              }`}
            >
              <span>📱</span>
              <span>{isKn ? "ಫೋನ್ ಸಂಖ್ಯೆ (Phone)" : "Phone Number"}</span>
            </button>

            <button
              type="button"
              onClick={() => { setItemType("vehicle"); setItemNumberInput("KA01AB1234"); }}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                itemType === "vehicle"
                  ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                  : "border-amber-200 bg-amber-50/50 text-amber-900"
              }`}
            >
              <span>🚗</span>
              <span>{isKn ? "ವಾಹನ ನಂಬರ್ (Vehicle)" : "Vehicle Plate"}</span>
            </button>

            <button
              type="button"
              onClick={() => { setItemType("house"); setItemNumberInput("304"); }}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                itemType === "house"
                  ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                  : "border-amber-200 bg-amber-50/50 text-amber-900"
              }`}
            >
              <span>🏠</span>
              <span>{isKn ? "ಮನೆ / ಫ್ಲಾಟ್ (House)" : "House / Flat"}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
              🔢 {isKn ? `${itemType === "phone" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : itemType === "vehicle" ? "ವಾಹನ ಸಂಖ್ಯೆ" : "ಮನೆ/ಫ್ಲಾಟ್ ಸಂಖ್ಯೆ"} ನಮೂದಿಸಿ:` : `Enter ${itemType.toUpperCase()} Number:`}
            </label>
            <input
              type="text"
              value={itemNumberInput}
              onChange={(e) => setItemNumberInput(e.target.value)}
              placeholder="e.g. 9972339362"
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
            />
          </div>

          {/* Item Numerology Result Output Card */}
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div>
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">{isKn ? "ಅಂಕಿಗಳ ಒಟ್ಟು ಸರಣಿ (Clean Digits):" : "Digits Sequence:"}</div>
                <div className="text-lg font-black text-amber-950 tracking-widest">{itemResult.cleanDigits || "0"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-amber-900 font-bold">{isKn ? "ಒಟ್ಟು ಮೊತ್ತ (Sum):" : "Total Sum:"} <span className="text-base font-extrabold">{itemResult.totalSum}</span></div>
                <div className="text-xs text-amber-900 font-bold">{isKn ? "ಮೂಲ ಸಂಖ್ಯೆ (Root):" : "Root Digit:"} <span className="text-xl font-black text-amber-900">{itemResult.singleDigit}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-white p-3 border border-amber-200">
                <span className="font-bold text-amber-900">🪐 {isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"}</span>{" "}
                <span className="font-extrabold text-amber-950">{itemResult.rulerKn}</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-amber-200">
                <span className="font-bold text-amber-900">🪔 {isKn ? "ಅಧಿಷ್ಠಾನ ದೇವತೆ:" : "Ruling Deity:"}</span>{" "}
                <span className="font-extrabold text-amber-950">{itemResult.deityKn}</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-white p-4 space-y-2">
              <div className="font-bold text-xs text-amber-950">{isKn ? itemResult.verdictKn : itemResult.verdictEn}</div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {isKn ? itemResult.recommendationKn : itemResult.recommendationEn}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* TAB 4: MULANK & BHAGYANK COMPLETE GUIDANCE PANEL                      */}
      {/* ====================================================================== */}
      {activeTab === "mulank" && (
        <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
          <div className="border-b border-amber-200 pb-3">
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>📅</span>
              <span>{isKn ? "ಮೂಲಾಂಕ & ಭಾಗ್ಯಾಂಕ ಸಂಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ" : "Mulank & Bhagyank Complete Life Guidance"}</span>
            </h3>
            <p className="text-xs text-amber-900/80 mt-1">
              {isKn
                ? "ನಿಮ್ಮ ಹುಟ್ಟಿದ ದಿನಾಂಕದ ಮೂಲಕ ಮೂಲಾಂಕ (Birth Number) ಹಾಗೂ ಭಾಗ್ಯಾಂಕ (Destiny Number) ಗಣಿಸಿ ಅದೃಷ್ಟ ಬಣ್ಣ, ರತ್ನ ಹಾಗೂ ದಿನಾಂಕ ಪಡೆಯಿರಿ."
                : "Calculate your Mulank (Birth Date Number) & Bhagyank (Destiny Number) for lucky colors, gems, and dates."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
              📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ (Select Birth Date):" : "Select Birth Date:"}
            </label>
            <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
          </div>

          {/* Badges for Mulank & Bhagyank */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mulank Badge Card */}
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
                <span className="font-bold text-xs text-amber-950">🌱 {isKn ? "ಮೂಲಾಂಕ (Mulank - Birth Day Number)" : "Mulank (Birth Day Number)"}</span>
                <span className="text-2xl font-black text-amber-950">{mulank}</span>
              </div>
              <div className="text-xs text-amber-900 font-semibold space-y-1">
                <div>🪐 <strong>{isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruler:"}</strong> {isKn ? mulankGuidance.rulerKn : mulankGuidance.rulerEn}</div>
                <div>🪔 <strong>{isKn ? "ಅಧಿಷ್ಠಾನ ದೇವತೆ:" : "Deity:"}</strong> {isKn ? mulankGuidance.deityKn : mulankGuidance.deityEn}</div>
                <div>🔥 <strong>{isKn ? "ತತ್ತ್ವ:" : "Element:"}</strong> {isKn ? mulankGuidance.elementKn : mulankGuidance.elementEn}</div>
              </div>
            </div>

            {/* Bhagyank Badge Card */}
            <div className="rounded-2xl border-2 border-orange-400 bg-gradient-to-br from-orange-100 via-amber-50 to-amber-100 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-orange-300/80 pb-2">
                <span className="font-bold text-xs text-amber-950">🌟 {isKn ? "ಭಾಗ್ಯಾಂಕ (Bhagyank - Destiny Number)" : "Bhagyank (Destiny Number)"}</span>
                <span className="text-2xl font-black text-amber-950">{bhagyank}</span>
              </div>
              <div className="text-xs text-amber-900 font-semibold space-y-1">
                <div>🪐 <strong>{isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruler:"}</strong> {isKn ? bhagyankGuidance.rulerKn : bhagyankGuidance.rulerEn}</div>
                <div>🪔 <strong>{isKn ? "ಅಧಿಷ್ಠಾನ ದೇವತೆ:" : "Deity:"}</strong> {isKn ? bhagyankGuidance.deityKn : bhagyankGuidance.deityEn}</div>
                <div>🔥 <strong>{isKn ? "ತತ್ತ್ವ:" : "Element:"}</strong> {isKn ? bhagyankGuidance.elementKn : bhagyankGuidance.elementEn}</div>
              </div>
            </div>
          </div>

          {/* Complete Life Guidance Matrix Grid */}
          <div className="rounded-2xl border border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <h4 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
              <span>📜</span>
              <span>{isKn ? `ಮೂಲಾಂಕ ${mulank} ನ ಸಮಗ್ರ ದೈವಿಕ ಸಂಖ್ಯಾ ಮಾರ್ಗದರ್ಶನ` : `Mulank ${mulank} Complete Life Guidance Matrix`}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 space-y-1">
                <div className="font-bold text-amber-900">📅 {isKn ? "ಅದೃಷ್ಟ ದಿನಾಂಕಗಳು (Lucky Dates):" : "Lucky Dates:"}</div>
                <div className="font-extrabold text-amber-950 text-sm">{isKn ? mulankGuidance.luckyDatesKn : mulankGuidance.luckyDatesEn}</div>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 space-y-1">
                <div className="font-bold text-amber-900">🎨 {isKn ? "ಅದೃಷ್ಟ ಬಣ್ಣಗಳು (Lucky Colors):" : "Lucky Colors:"}</div>
                <div className="font-extrabold text-amber-950 text-sm">{isKn ? mulankGuidance.luckyColorsKn : mulankGuidance.luckyColorsEn}</div>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 space-y-1">
                <div className="font-bold text-amber-900">💎 {isKn ? "ಅದೃಷ್ಟ ರತ್ನ (Lucky Gemstone):" : "Lucky Gemstone:"}</div>
                <div className="font-extrabold text-amber-950 text-sm">{isKn ? mulankGuidance.luckyGemsKn : mulankGuidance.luckyGemsEn}</div>
              </div>

              <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-900">🤝 {isKn ? "ಹೊಂದಾಣಿಕೆಯಾಗುವ ಸ್ನೇಹಿತ ಸಂಖ್ಯೆಗಳು (Friendly Numbers):" : "Friendly Numbers:"}</div>
                <div className="font-extrabold text-emerald-950 text-sm">{mulankGuidance.friendlyNumbers.join(", ")}</div>
              </div>
            </div>

            <div className="rounded-xl bg-rose-50/70 p-3 border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-rose-900">⚠️ {isKn ? "ವರ್ಜ್ಯ / ಶತ್ರು ಸಂಖ್ಯೆಗಳು (Numbers to Avoid):" : "Numbers to Avoid:"}</div>
              <div className="font-extrabold text-rose-950 text-sm">{mulankGuidance.enemyNumbers.length > 0 ? mulankGuidance.enemyNumbers.join(", ") : (isKn ? "ಯಾವುದೇ ಶತ್ರು ಸಂಖ್ಯೆ ಇಲ್ಲ (Universal Harmony)" : "None (Universal Harmony)")}</div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-1">
              <div className="font-bold text-xs text-amber-950">✨ {isKn ? "ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಜೀವನ ಧರ್ಮ:" : "Personality & Life Purpose:"}</div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {isKn ? mulankGuidance.traitsKn : mulankGuidance.traitsEn}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering */}
      {activeResult && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <SankhyaShastraPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />
        </div>
      )}
    </div>
  );
}
