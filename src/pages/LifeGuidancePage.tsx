import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import { executeLifeGuidanceCalculation, askCustomLifeQuestion, LifeGuidanceResult, LifeGuidanceTabKey } from "../features/lifeguidance/lifeGuidanceEngine";
import { LifeGuidancePdfTemplate } from "../components/lifeguidance/LifeGuidancePdfTemplate";
import { PREDEFINED_PRIESTS, getPriestProfile } from "../features/seva/sevaPriestDirectory";
import { sanitizeAIText } from "../utils/textFormatter";
import { useAppStore } from "../stores/appStore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type LifeGuidancePageProps = {
  initialInput?: {
    personName?: string;
    dob?: string;
    tob?: string;
    gender?: string;
  };
};

export const LifeGuidancePage: React.FC<LifeGuidancePageProps> = ({ initialInput }) => {
  const activeKey = useAppStore((state) => state.geminiApiKey);

  const [selectedLang, setSelectedLang] = useState<string>("kn");
  const isKn = selectedLang === "kn";

  const [personName, setPersonName] = useState<string>(initialInput?.personName || "");
  const [dob, setDob] = useState<string>(initialInput?.dob || "");
  const [tob, setTob] = useState<string>(initialInput?.tob || "12:00");
  const [gender, setGender] = useState<string>(initialInput?.gender || "Male");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<LifeGuidanceResult | null>(null);

  // Auto-calculate if initialInput with DOB is provided
  React.useEffect(() => {
    if (initialInput?.dob && !result && !isProcessing) {
      setIsProcessing(true);
      executeLifeGuidanceCalculation({
        personName: initialInput.personName || "Devotee",
        dob: initialInput.dob,
        tob: initialInput.tob || "12:00",
        gender: initialInput.gender || "Male",
        lang: selectedLang
      }, activeKey).then((res) => {
        setResult(res);
        setIsProcessing(false);
      });
    }
  }, [initialInput]);
  const [activeTab, setActiveTab] = useState<LifeGuidanceTabKey | "custom">("career");
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram-pandit");
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAskingCustom, setIsAskingCustom] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;

    setIsProcessing(true);

    setTimeout(async () => {
      const calcResult = await executeLifeGuidanceCalculation({
        personName: personName.trim() || (isKn ? "ಶ್ರೀಯುತ ಜಾತಕರು" : "Devotee"),
        dob,
        tob: tob || "12:00",
        gender,
        lang: selectedLang
      }, activeKey);

      setResult(calcResult);
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1200);
  };


  // Web Speech API Microphone Toggle with Auto-Clear Logic
  const handleMicToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isKn ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ." : "Speech recognition is not supported in your browser. Please type your question.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // Auto-clear existing question input before recording fresh speech
    setCustomQuestion("");
    setIsListening(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang === "kn" ? "kn-IN" : selectedLang === "hi" ? "hi-IN" : selectedLang === "te" ? "te-IN" : selectedLang === "ta" ? "ta-IN" : "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Mic start error:", err);
      setIsListening(false);
    }
  };

  // Submit custom question for 4-5 paragraph AI answer
  const handleAskCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !customQuestion.trim()) return;

    setIsAskingCustom(true);
    try {
      const ans = await askCustomLifeQuestion(result, customQuestion.trim(), selectedLang, activeKey);
      const updatedResult = {
        ...result,
        customQnA: {
          question: customQuestion.trim(),
          answer: ans
        }
      };
      setResult(updatedResult);
    } catch (err) {
      console.error("Custom QnA error:", err);
    } finally {
      setIsAskingCustom(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);

    try {
      const element = document.getElementById("life-guidance-pdf-container");
      if (!element) throw new Error("PDF container not found");

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#FFFDF7" });
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Baggona_Life_Guidance_${result.personName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(isKn ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ." : "Failed to generate PDF report.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 pb-16 pt-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Hero Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-6 text-white shadow-xl text-center relative overflow-hidden">
        <div className="inline-block rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 mb-2">
          ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಸಿದ್ಧ ಜಾತಕ ರಕ್ಷಾ ॥
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-amber-200 tracking-wide drop-shadow mb-2">
          {isKn ? "🔮 ವೈಯಕ್ತಿಕ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ" : "Hyper-Personalized Life Guidance & Predictions"}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
          {isKn
            ? "ವೃತ್ತಿ ಧನ ಯೋಗ, ದಾಂಪತ್ಯ ಅನುಕೂಲತೆ, ಶಾರೀರಿಕ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯದ ಪೂರ್ಣ ೪-ಹಂತದ ಸಿದ್ಧ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ."
            : "Detailed 4-tab prediction forecast for Career, Relationship, Health, and Children prospects."}
        </p>

        {/* Language Picker */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            { code: "kn", label: "ಕನ್ನಡ" },
            { code: "en", label: "English" },
            { code: "hi", label: "ಹಿन्दी" },
            { code: "te", label: "తెలుగు" },
            { code: "ta", label: "தமிழ்" }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setSelectedLang(item.code)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                selectedLang === item.code ? "bg-amber-400 text-amber-950 border-amber-300 shadow-md scale-105" : "bg-amber-900/70 text-amber-200 border-amber-700 hover:bg-amber-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Input Form Card */}
      <Card className="border border-amber-300 bg-white p-5 shadow-md">
        <h3 className="font-serif text-base font-bold text-amber-950 mb-4 flex items-center gap-2 border-b border-amber-200 pb-2">
          <span>📜</span>
          <span>{isKn ? "ಜಾತಕರ ಜನನ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ" : "Enter Birth Details for Life Guidance"}</span>
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಜಾತಕರ ಹೆಸರು (Full Name):" : "Full Name:"}
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={isKn ? "ಉದಾ: ಶ್ರೀರಾಮ ಶರ್ಮಾ" : "e.g. Sri Ramakrishna"}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಜನನ ದಿನಾಂಕ (Date of Birth): *" : "Date of Birth: *"}
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಜನನ ಸಮಯ (Time of Birth):" : "Time of Birth:"}
              </label>
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಲಿಂಗ (Gender):" : "Gender:"}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              >
                <option value="Male">{isKn ? "ಪುರುಷ (Male)" : "Male"}</option>
                <option value="Female">{isKn ? "ಮಹಿಳೆ (Female)" : "Female"}</option>
                <option value="Other">{isKn ? "ಇತರೆ (Other)" : "Other"}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !dob}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 text-sm font-bold shadow-md hover:from-amber-800 hover:to-amber-950 disabled:opacity-50 transition"
          >
            {isProcessing ? (isKn ? "⌛ ಪೂರ್ಣ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ..." : "Analyzing Life Guidance...") : (isKn ? "🔮 ಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ" : "Calculate Life Guidance")}
          </button>
        </form>
      </Card>

      {/* 100% Full Viewport Loader Overlay */}
      {isProcessing && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh", zIndex: 99999 }}
          className="fixed inset-0 w-screen h-screen bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/95 via-amber-900/95 to-amber-950/95 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-sm w-full">
            <div className="text-5xl text-amber-300 mb-4 animate-spin" style={{ animationDuration: "10s" }}>🔮</div>
            <h4 className="font-serif text-base font-bold text-amber-200 mb-2 animate-pulse">
              {isKn ? "ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing Hyper-Personalized Life Guidance..."}
            </h4>
            <p className="text-xs text-amber-300/90 max-w-xs font-semibold">
              {isKn ? "ವೃತ್ತಿ, ದಾಂಪತ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತಾನ ಭಾವಗಳ ನಿಖರ ದಶಾ-ಗೋಚಾರ ಲೆಕ್ಕಾಚಾರ..." : "Calculating 10th, 7th, 6th & 5th house Planetary Alignments..."}
            </p>
          </div>
        </div>
      )}

      {/* Results View with 4 Tabs & Priest Contact Card */}
      {result && (
        <div ref={resultsRef} className="space-y-6 animate-fade-in">
          {/* Priest Selection Dropdown & Dynamic Priest Contact Card */}
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-5 text-amber-50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest">
                  ॥ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಅಧಿಕೃತ ಅರ್ಚಕರು ॥
                </div>
                <div className="font-serif text-base font-bold text-amber-100 flex items-center gap-2 justify-center sm:justify-start">
                  <span>{getPriestProfile(selectedPriestId).sealSymbol || "🔱"}</span>
                  <span>{(getPriestProfile(selectedPriestId).name as Record<string, string>)[selectedLang] || getPriestProfile(selectedPriestId).name.kn} ({(getPriestProfile(selectedPriestId).title as Record<string, string>)[selectedLang] || getPriestProfile(selectedPriestId).title.kn})</span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {isKn
                    ? "ನಿಮ್ಮ ಜಾತಕದ ಪಿತೃ ದೋಷ (ತ್ರಿಪಿಂಡೀ/ನಾರಾಯಣ ಬಲಿ), ಕಾಲಸರ್ಪ, ಸರ್ಪ ಶಾಪ, ಕುಜ ದೋಷ ಹಾಗೂ ಮಾಂದಿ ಶಾಂತ್ಯುಕ್ತ ಸೇವೆಗಳಿಗೆ ಮುಂಗಡವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
                    : "For Pitru Dosha, Narayana Bali, Kalasarpa Shanti, Nagapratishtha & Kuja Shanti, contact Priest directly."}
                </p>
              </div>

              <a
                href={`tel:${getPriestProfile(selectedPriestId).phone || "+919972339362"}`}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-xs font-extrabold text-amber-950 shadow-lg hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-2 shrink-0"
              >
                <span>📞</span>
                <span>{getPriestProfile(selectedPriestId).phone || "+91 99723 39362 / +91 94801 64555"}</span>
              </a>
            </div>

            {/* Priest Dropdown Selector */}
            <div className="pt-2 border-t border-amber-800/80">
              <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🪔</span>
                <span>{isKn ? "PDF ವರದಿ ಹಾಗೂ ಸಂಪರ್ಕಕ್ಕೆ ಪುರೋಹಿತರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (Select Priest):" : "Select Priest for PDF Report & Puja Booking:"}</span>
              </label>
              <select
                value={selectedPriestId}
                onChange={(e) => setSelectedPriestId(e.target.value)}
                className="w-full rounded-xl border border-amber-400/80 bg-amber-950/90 px-3.5 py-2 text-xs font-bold text-amber-100 shadow-inner focus:border-amber-300 focus:outline-none"
              >
                {PREDEFINED_PRIESTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.name as Record<string, string>)[selectedLang] || p.name.kn} — {(p.title as Record<string, string>)[selectedLang] || p.title.kn} ({p.phone || "+91 99723 39362"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="border border-amber-300 bg-white p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "career", icon: "💼", label: isKn ? "ವೃತ್ತಿ & ಧನ" : "Career" },
                { key: "relationship", icon: "💞", label: isKn ? "ದಾಂಪತ್ಯ & ಕುಟುಂಬ" : "Relationship" },
                { key: "health", icon: "🏥", label: isKn ? "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ" : "Health" },
                { key: "children", icon: "👶", label: isKn ? "ಸಂತಾನ ಭಾಗ್ಯ" : "Children" },
                { key: "custom", icon: "🎙️", label: isKn ? "ಸ್ವಂತ ಪ್ರಶ್ನೆ (Q&A)" : "Custom Question" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as LifeGuidanceTabKey)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                    activeTab === tab.key ? "bg-amber-800 text-white border-amber-900 shadow" : "bg-amber-50 text-amber-950 border-amber-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
            >
              <span>📄</span>
              <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪೂರ್ಣ ೪-ಹಂತದ ಜೀವನ PDF ಡೌನ್‌ಲೋಡ್" : "Download Life Guidance PDF")}</span>
            </button>
          </Card>

          {/* Active Tab Content Card */}
                    {/* TAB 5: Custom Question & Voice Clarification UI */}
          {activeTab === "custom" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-3">
                <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>{isKn ? "ಸ್ವಂತ ಪ್ರಶ್ನೆ ಹಾಗೂ ಧ್ವನಿ ವಿವರಣೆ ಸೌಲಭ್ಯ" : "Ask Custom Astrological Question (Voice/Type)"}</span>
                </h3>
              </div>

              <form onSubmit={handleAskCustomQuestion} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={isKn ? "ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ..." : "Type your custom question or click mic button to speak..."}
                    className="w-full rounded-2xl border-2 border-amber-300 bg-white p-4 pr-12 text-xs font-semibold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                  />
                  {/* Microphone Toggle Button with Auto-Clear */}
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    title={isKn ? "ಧ್ವನಿ ಮೈಕ್ ಬಟನ್ (ಹಳೆಯ ಇನ್‌ಪುಟ್ ತೆರವುಗೊಳಿಸಿ ಧ್ವನಿ ರೆಕಾರ್ಡ್)" : "Voice Mic (Auto-clears text & records speech)"}
                    className={`absolute right-3 top-3 p-2 rounded-xl text-lg transition ${
                      isListening ? "bg-rose-600 text-white animate-pulse shadow-lg" : "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                    }`}
                  >
                    🎙️
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAskingCustom || !customQuestion.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 text-xs font-bold shadow-md hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
                >
                  {isAskingCustom ? (isKn ? "⌛ ೪-೫ ಪ್ಯಾರಾಗ್ರಾಫ್ ಜ್ಯೋತಿಷ್ಯ ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Analyzing Question...") : (isKn ? "🔮 ಉತ್ತರ ಪಡೆಯಿರಿ (Get 4-5 Para Guidance)" : "Get Astrological Guidance")}
                </button>
              </form>

              {/* Custom Q&A Answer Card */}
              {result.customQnA && (
                <div className="rounded-2xl border-2 border-amber-400 bg-white p-5 space-y-3 shadow-md">
                  <div className="text-xs font-extrabold text-amber-950 border-b border-amber-200 pb-2">
                    ❓ {isKn ? "ಪ್ರಶ್ನೆ:" : "Question:"} {result.customQnA.question}
                  </div>
                  <div className="space-y-3">
                    {sanitizeAIText(result.customQnA.answer)
                      .split(/\n\s*\n/)
                      .map((para, pIdx) => {
                        const cleanPara = para.trim();
                        if (!cleanPara) return null;
                        return (
                          <div
                            key={pIdx}
                            className="rounded-xl border-l-4 border-amber-500 bg-amber-50/50 p-3.5 text-xs text-amber-950 leading-relaxed font-medium shadow-sm"
                          >
                            {cleanPara}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Standard 4 Active Tabs Content Card */}
          {activeTab !== "custom" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">
            <div className="border-b border-amber-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
                <span>{activeTab === "career" ? "💼" : activeTab === "relationship" ? "💞" : activeTab === "health" ? "🏥" : "👶"}</span>
                <span>{result[activeTab].title[selectedLang] || result[activeTab].title.kn}</span>
              </h3>
            </div>

            <div className="space-y-4">
              {sanitizeAIText(result[activeTab].narrativeText)
                .split(/\n\s*\n/)
                .map((para, pIdx) => {
                  const cleanPara = para.trim();
                  if (!cleanPara) return null;
                  return (
                    <div
                      key={pIdx}
                      className="rounded-2xl border-l-4 border-amber-500 bg-white p-4 text-xs sm:text-sm text-amber-950 leading-relaxed font-medium shadow-sm space-y-1"
                    >
                      <p>{cleanPara}</p>
                    </div>
                  );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 font-semibold text-amber-950">
                <strong>{isKn ? "🌟 ಪ್ರಮುಖ ವಯೋಮಾನ ಮೈಲಿಗಲ್ಲುಗಳು (Key Ages):" : "Key Age Milestones:"}</strong>{" "}
                {result[activeTab].keyAges.join(", ")} {isKn ? "ವರ್ಷಗಳು" : "Years"}
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 font-semibold text-amber-950">
                <strong>{isKn ? "🧭 ಅನುಕೂಲಕರ ದಿಕ್ಪಾಲಕ ದಿಕ್ಕುಗಳು:" : "Favorable Directions:"}</strong>{" "}
                {result[activeTab].favorableDirections[selectedLang] || result[activeTab].favorableDirections.kn}
              </div>
            </div>

            <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-amber-100 to-orange-100 p-4 text-xs space-y-1">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <span>🪔</span>
                <span>{isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಶಾಂತಿ & ಪರಿಹಾರ:" : "Recommended Gokarna Vedic Remedy:"}</span>
              </div>
              <div className="text-amber-900 font-semibold leading-relaxed">
                {result[activeTab].recommendedRemedies[selectedLang] || result[activeTab].recommendedRemedies.kn}
              </div>
            </div>
          </Card>
          )}
        </div>
      )}

      {/* Offscreen Container for PDF */}
      {result && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <LifeGuidancePdfTemplate result={result} lang={selectedLang} priest={getPriestProfile(selectedPriestId)} />
        </div>
      )}
    </div>
  );
};
