import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  executeSankhyaShastraPrashna,
  askSankhyaShastraFollowUp,
  type SankhyaShastraResult
} from "../features/sankhyashastra/sankhyaShastraEngine";
import { SankhyaShastraPdfTemplate } from "../components/sankhyashastra/SankhyaShastraPdfTemplate";
import { SankhyaNumerologyLoader } from "../components/sankhyashastra/SankhyaNumerologyLoader";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  result?: SankhyaShastraResult;
  timestamp: string;
};

export default function SankhyaShastraPage(): JSX.Element {
  const appLanguage = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const session = useKundliViewerStore((s) => s.session);

  // Language selector state (defaults to appLanguage or kn)
  const [selectedLang, setSelectedLang] = useState<string>(appLanguage || "kn");
  const isKn = selectedLang === "kn";

  const devoteeName = session?.input?.name || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee");

  // Inputs
  const [questionInput, setQuestionInput] = useState<string>("");
  const [userNumberInput, setUserNumberInput] = useState<number | string>(108);
  const [followUpInput, setFollowUpInput] = useState<string>("");

  // States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<SankhyaShastraResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech Recognition (Voice Input Mic)
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

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header Card */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              🔢 {isKn ? "ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ (Sankhya Shastra - Numerology Prashna Engine)" : "Sankhya Shastra - Vedic Numerology Prashna Engine"}
            </h1>
            <p className="mt-1 text-xs text-amber-900/80">
              {isKn
                ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ ಅಥವಾ ಜಾತಕ ವಿವರಗಳಿಲ್ಲದೆಯೂ ನಿಮ್ಮ ಯಾವುದೇ ಪ್ರಶ್ನೆಗೆ ಗೋಕರ್ಣ ಸಂಖ್ಯಾ ಗಣಿತದ ಮೂಲಕ ನಿಖರ ಉತ್ತರ ಪಡೆಯಿರಿ."
                : "No birth details needed! Ask any question, choose a number, and receive instant Vedic Numerology Prashna answers."}
            </p>
          </div>

          {activeResult && (
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
          🌐 {isKn ? "ಸಂವಾದ & PDF ಭಾಷೆ (Select Chat & PDF Language)" : "Select Chat & PDF Language"}
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

      {/* Prashna Input Form Panel */}
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

      
      {/* Animated Numerology Loader during processing */}
      {isProcessing && (
        <div className="my-6 flex justify-center">
          <SankhyaNumerologyLoader isKn={isKn} />
        </div>
      )}

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

                  {msg.text}
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
        </Card>
      )}

      {/* Hidden Container for PDF Rendering */}
      {activeResult && (
        <div className="hidden">
          <SankhyaShastraPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} />
        </div>
      )}
    </div>
  );
}
