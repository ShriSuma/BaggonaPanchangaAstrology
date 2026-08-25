import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  executeFaceReading,
  askFaceReadingFollowUp,
  type FaceReadingResult
} from "../features/facereading/faceReadingEngine";
import { validateFaceImage } from "../features/facereading/faceValidator";
import { FaceFeaturesTab } from "../components/facereading/FaceFeaturesTab";
import { FaceChronologyTab } from "../components/facereading/FaceChronologyTab";
import { FaceMolesTab } from "../components/facereading/FaceMolesTab";
import { FaceReadingPdfTemplate } from "../components/facereading/FaceReadingPdfTemplate";
import { FaceScannerLoader } from "../components/facereading/FaceScannerLoader";
import { sanitizeAIText } from "../utils/textFormatter";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  timestamp: string;
  result?: FaceReadingResult;
};

type ActiveTab = "reading" | "features" | "chronology" | "moles";

export default function FaceReadingPage(): JSX.Element {
  const selectedLang = useAppStore((state) => state.language) || "kn";
  const isKn = selectedLang === "kn";
  const geminiApiKey = useAppStore((state) => state.geminiApiKey) || "";

  const session = useKundliViewerStore((state) => state.session);

  // Devotee Name
  const [devoteeName, setDevoteeName] = useState<string>(() => {
    return session?.input?.name || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee");
  });

  // State for Face Image & Validation
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean | null; message: string }>({
    isValid: null,
    message: ""
  });

  // Processing & Chat
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("reading");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeResult, setActiveResult] = useState<FaceReadingResult | null>(null);
  const [followUpInput, setFollowUpInput] = useState<string>("");
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Refs for upload
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle Photo File Upload / Capture
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);

      // Perform Real-Time Face Validation
      setIsValidating(true);
      setValidationResult({ isValid: null, message: isKn ? "ಮುಖದ ಚಿತ್ರ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Validating face frame..." });

      try {
        const res = await validateFaceImage(dataUrl, geminiApiKey, selectedLang);
        setValidationResult({
          isValid: res.isValid,
          message: isKn ? res.messageKn : res.messageEn
        });
      } catch (err) {
        console.error("Validation error:", err);
        setValidationResult({
          isValid: true,
          message: isKn ? "ಮುಖದ ಚಿತ್ರ ಸ್ವೀಕೃತವಾಗಿದೆ." : "Face image accepted."
        });
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute Face Reading
  const handleExecuteReading = async () => {
    if (!imageDataUrl) return;

    setIsProcessing(true);
    try {
      const result = await executeFaceReading(
        imageDataUrl,
        devoteeName,
        selectedLang,
        geminiApiKey
      );

      setActiveResult(result);
      const priestMsg: ChatMessage = {
        id: "priest-" + Date.now(),
        sender: "priest",
        text: result.aiPrediction,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result
      };

      setMessages((prev) => [...prev, priestMsg]);
      setActiveTab("reading");
    } catch (err) {
      console.error("Face reading error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Follow-up question
  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || !activeResult || isAnswering) return;

    const userText = followUpInput.trim();
    setFollowUpInput("");

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAnswering(true);

    try {
      const answer = await askFaceReadingFollowUp(
        activeResult,
        userText,
        selectedLang,
        geminiApiKey
      );

      const priestMsg: ChatMessage = {
        id: "priest-ans-" + Date.now(),
        sender: "priest",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, priestMsg]);
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setIsAnswering(false);
    }
  };

  // Download A4 Printable PDF Report
  const handleDownloadPdf = async () => {
    if (!activeResult || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const container = document.getElementById("face-reading-pdf-container");
      if (!container) throw new Error("PDF container not found");

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFDF7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const safeName = (devoteeName || "Devotee").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Baggona_Face_Reading_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Top Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow">👤</span>
            <div>
              <div className="text-[11px] font-extrabold tracking-widest text-amber-800 uppercase">
                ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ॥
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-amber-950">
                {isKn ? "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ" : "Vedic Face Reading (Physiognomy)"}
              </h1>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium mt-0.5">
                {isKn
                  ? "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು, ಕುಬೇರ ನಾಸಿಕ ಧನಯೋಗ, ಆಜ್ಞಾ ಚಕ್ರ ತೇಜಸ್ಸು ಹಾಗೂ ೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರದ ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಫಲ."
                  : "Authentic Vedic Physiognomy: 7 Facial Features, Nose Bridge Wealth Vault, Ajna Chakra Tejas & 100-Year Life Chronology."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(e.target.value)}
              placeholder={isKn ? "ಭಕ್ತರ ಹೆಸರು" : "Devotee Name"}
              className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-950 focus:border-amber-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>
      </Card>

      {/* 4 Interactive Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-amber-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("reading")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "reading"
              ? "bg-amber-800 text-amber-50 shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          <span>👤</span>
          <span>{isKn ? "ಮುಖ ಸ್ಕ್ಯಾನರ್ & ಫಲ" : "Face Scanner & Reading"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "features"
              ? "bg-amber-800 text-amber-50 shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          <span>👁️</span>
          <span>{isKn ? "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು" : "7 Facial Features"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chronology")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "chronology"
              ? "bg-amber-800 text-amber-50 shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          <span>⏳</span>
          <span>{isKn ? "೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ" : "100-Year Age Map"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("moles")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "moles"
              ? "bg-amber-800 text-amber-50 shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          <span>🪔</span>
          <span>{isKn ? "ಮಚ್ಚೆ ಶಾಸ್ತ್ರ & ಪರಿಹಾರ" : "Moles & Remedies"}</span>
        </button>
      </div>

      {/* TAB 1: Face Scanner & Reading */}
      {activeTab === "reading" && (
        <div className="space-y-6">
          {/* Capture / Upload & Sequential Validation Card */}
          <Card className="border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>📸</span>
                <span>{isKn ? "ಮುಖದ ಛಾಯಾಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಅಥವಾ ಕ್ಯಾಮೆರಾ" : "Upload or Capture Front Face Photo"}</span>
              </span>
              {validationResult.isValid === true && (
                <span className="text-xs bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-sm">
                  ✅ ೧೦೦% ಸಫಲ (Verified)
                </span>
              )}
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ನಿಮ್ಮ ಮುಖದ ಮುಂಭಾಗದ ಚಿತ್ರವನ್ನು ತೆಗೆಯಿರಿ. ಹಣೆ, ಕಣ್ಣುಗಳು, ಮೂಗು ಹಾಗೂ ಗಡ್ಡ ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುವಂತೆ ಹಿಡಿಯಿರಿ."
                : "Capture or upload a clear, front-facing portrait photo in bright natural light with all facial features visible."}
            </p>

            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            {/* Upload / Camera Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 min-w-[140px] rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 py-2.5 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📸</span>
                <span>{isKn ? "ಕ್ಯಾಮೆರಾದಿಂದ ತೆಗೆಯಿರಿ" : "Take Photo (Camera)"}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-w-[140px] rounded-xl bg-white border border-amber-300 hover:bg-amber-50 py-2.5 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📁</span>
                <span>{isKn ? "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" : "Upload Face Photo"}</span>
              </button>
            </div>

            {/* Validation Message Badge */}
            {isValidating && (
              <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 text-xs text-amber-950 font-bold flex items-center gap-2 animate-pulse">
                <span>⌛</span>
                <span>{isKn ? "ಮುಖದ ಚಿತ್ರದ ಗುಣಮಟ್ಟ & ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Validating facial clarity and features..."}</span>
              </div>
            )}

            {!isValidating && validationResult.message && (
              <div
                className={`rounded-xl p-3 text-xs font-bold border flex items-center gap-2 ${
                  validationResult.isValid === true
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                <span>{validationResult.isValid === true ? "✅" : "⚠️"}</span>
                <span>{validationResult.message}</span>
              </div>
            )}

            {/* Image Preview */}
            {imageDataUrl && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 max-w-sm mx-auto shadow-md">
                <img
                  src={imageDataUrl}
                  alt="Devotee Face"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageDataUrl(null);
                    setValidationResult({ isValid: null, message: "" });
                  }}
                  className="absolute top-2 right-2 bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-rose-700"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Generate Reading Button (Unlocked only when Valid) */}
            {imageDataUrl && validationResult.isValid === true && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteReading}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-3.5 text-sm font-extrabold text-amber-50 shadow-lg hover:from-amber-800 hover:to-amber-950 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
                >
                  <span>🔮</span>
                  <span>{isKn ? "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ಫಲ ಪಡೆಯಿರಿ (Generate Face Reading)" : "Generate Vedic Face Reading"}</span>
                </button>
              </div>
            )}
          </Card>

          {/* Full-Screen Animated Golden Face Scanner Overlay */}
          {isProcessing && <FaceScannerLoader isKn={isKn} />}

          {/* Reading Results & Chat View */}
          {messages.length > 0 && (
            <Card className="border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>💬</span>
                  <span>{isKn ? "ಗೋಕರ್ಣ ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ಸಂವಾದ" : "Gokarna Face Reading Guidance & Chat"}</span>
                </h3>
                {activeResult && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                      ತೇಜಸ್ಸು: {activeResult.overallTejasScore}% · ವಯಸ್ಸು: ~{activeResult.estimatedAge} ವರ್ಷಗಳು
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleDownloadPdf}
                      className="rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <span>📥</span>
                      <span>{isGeneratingPdf ? "..." : (isKn ? "PDF ಡೌನ್‌ಲೋಡ್" : "Download PDF")}</span>
                    </button>
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
                      {msg.result ? (
                        <div className="space-y-4">
                          {/* Verdict Banner */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-extrabold text-amber-950">
                                {msg.result.verdictTitle[selectedLang] || msg.result.verdictTitle.kn}
                              </div>
                              <div className="text-xs text-amber-800 font-semibold mt-0.5">
                                ಪಂಚಭೂತ ತತ್ತ್ವ: <span className="font-bold text-amber-950">{msg.result.facialConstitution.primaryElement[selectedLang] || msg.result.facialConstitution.primaryElement.kn}</span> · ದೋಷ: <span className="font-bold text-amber-950">{msg.result.facialConstitution.ayurvedicDosha[selectedLang] || msg.result.facialConstitution.ayurvedicDosha.kn}</span>
                              </div>
                            </div>

                            <div className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                              ತೇಜಸ್ಸು: {msg.result.overallTejasScore}%
                            </div>
                          </div>

                          {/* 7 Facial Features Summary Matrix */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              👁️ {isKn ? "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಣೆ (7 Facial Contours):" : "7 Facial Contours:"}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {msg.result.features.map((f, i) => (
                                <div key={i} className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                  <div className="font-bold text-amber-900">{f.name[selectedLang] || f.name.kn} ({f.planetaryRuler[selectedLang] || f.planetaryRuler.kn}):</div>
                                  <div className="text-amber-950">{f.vedicIndication[selectedLang] || f.vedicIndication.kn}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed AI Prediction */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              📜 {isKn ? "ಪೂರ್ಣ ಮುಖ ಸಾಮುದ್ರಿಕ ಭವಿಷ್ಯ (Vedic Guidance):" : "Vedic Guidance & Prediction:"}
                            </div>
                            <div className="text-xs text-amber-950 leading-relaxed font-medium">
                              {sanitizeAIText(msg.text)}
                            </div>
                          </div>

                          {/* Sacred Remedy */}
                          <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 shadow-sm space-y-1">
                            <div className="text-xs font-bold text-amber-950">
                              🪔 {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy):" : "Sacred Gokarna Mahabaleshwara Remedy:"}
                            </div>
                            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                              {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                            </p>
                          </div>
                        </div>
                      ) : (
                        sanitizeAIText(msg.text)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Follow-up question input */}
              <div className="flex gap-2 pt-2 border-t border-amber-200">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendFollowUp()}
                  placeholder={isKn ? "ಮುಖ ಲಕ್ಷಣಗಳ ಕುರಿತು ಪೂರಕ ಪ್ರಶ್ನೆ ಕೇಳಿ..." : "Ask a follow-up question regarding face reading..."}
                  className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-medium text-amber-950 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isAnswering || !followUpInput.trim()}
                  onClick={handleSendFollowUp}
                  className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white hover:bg-amber-900 disabled:opacity-50 shadow"
                >
                  {isAnswering ? "..." : (isKn ? "ಕೇಳಿ" : "Ask")}
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: 7 Facial Features */}
      {activeTab === "features" && (
        <FaceFeaturesTab features={activeResult?.features} lang={selectedLang} />
      )}

      {/* TAB 3: 100-Year Age Chronology Map */}
      {activeTab === "chronology" && (
        <FaceChronologyTab
          milestones={activeResult?.ageMilestones}
          lang={selectedLang}
          estimatedAge={activeResult?.estimatedAge}
        />
      )}

      {/* TAB 4: Moles & Remedies */}
      {activeTab === "moles" && (
        <FaceMolesTab moles={activeResult?.moles} lang={selectedLang} />
      )}

      {/* Hidden Container for PDF Export */}
      {activeResult && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <FaceReadingPdfTemplate
            result={activeResult}
            personName={devoteeName}
            lang={selectedLang}
            messages={messages}
          />
        </div>
      )}
    </div>
  );
}
