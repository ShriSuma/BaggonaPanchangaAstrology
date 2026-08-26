import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAppStore } from "../stores/appStore";
import type { SupportedLanguage } from "../stores/appStore";
import Card from "../components/ui/Card";
import type {
  AyurMode,
  AyurSanjeeviniInput,
  AyurSanjeeviniResult
} from "../features/ayursanjeevini/ayurSanjeeviniTypes";
import {
  executeAyurSanjeeviniCalculation,
  generateAyurSanjeeviniAINarrative
} from "../features/ayursanjeevini/ayurSanjeeviniEngine";
import { T_AYUR_SANJEEVINI } from "../features/ayursanjeevini/ayurSanjeeviniLocale";
import { AyurSanjeeviniPdfTemplate } from "../components/ayursanjeevini/AyurSanjeeviniPdfTemplate";

export const AyurSanjeeviniPage: React.FC = () => {
  const { language, geminiApiKey } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language || "kn");

  // Form State
  const [mode, setMode] = useState<AyurMode>("janma");
  const [personName, setPersonName] = useState<string>("");
  const [dob, setDob] = useState<string>("1992-06-15");
  const [tob, setTob] = useState<string>("10:30");
  const [pob, setPob] = useState<string>("Gokarna, Karnataka");
  const [gotra, setGotra] = useState<string>("Kashyapa");
  const [customConcern, setCustomConcern] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeMicField, setActiveMicField] = useState<"name" | "place" | "concern" | null>(null);
  const [result, setResult] = useState<AyurSanjeeviniResult | null>(null);

  const [activeTab, setActiveTab] = useState<
    "longevity" | "maraka" | "shield" | "karmaVipaka" | "mokshaGati" | "pitru" | "gokarna"
  >("longevity");

  const resultsRef = useRef<HTMLDivElement>(null);

  // Web Speech API Microphone Handler
  const handleMicToggle = (field: "name" | "place" | "concern") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        selectedLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ."
          : "Your browser does not support Speech Recognition. Please type manually."
      );
      return;
    }

    if (activeMicField === field) {
      setActiveMicField(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
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

      recognition.onstart = () => {
        setActiveMicField(field);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (field === "name") {
          setPersonName((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else if (field === "place") {
          setPob((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else if (field === "concern") {
          setCustomConcern((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setActiveMicField(null);
      };

      recognition.onerror = () => {
        setActiveMicField(null);
      };

      recognition.onend = () => {
        setActiveMicField(null);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech Recognition error:", e);
      setActiveMicField(null);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const inputData: AyurSanjeeviniInput = {
      mode,
      personName: personName.trim() || (mode === "janma" ? "ಭಕ್ತ (Devotee)" : "ಪುಣ್ಯಾತ್ಮ (Departed Soul)"),
      dob,
      tob,
      pob: pob.trim() || "Gokarna, Karnataka",
      gotra: gotra.trim() || "Kashyapa",
      customConcern: customConcern.trim(),
      lang: selectedLang
    };

    const calculated = executeAyurSanjeeviniCalculation(inputData);

    // AI Divine Narrative Call
    try {
      const narrative = await generateAyurSanjeeviniAINarrative(
        calculated,
        selectedLang,
        geminiApiKey
      );
      calculated.aiDivineNarrative = narrative;
    } catch (err) {
      console.error("Error generating AI divine narrative:", err);
    }

    setResult(calculated);
    setIsProcessing(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // PDF Generation Handler
  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);

    try {
      await new Promise((r) => setTimeout(r, 400));
      const pdfContainer = document.getElementById("ayur-sanjeevini-pdf");
      if (!pdfContainer) {
        throw new Error("PDF container not found");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pages = pdfContainer.querySelectorAll<HTMLElement>(".pdf-page-a4");
      if (pages.length === 0) {
        throw new Error("No PDF pages found");
      }

      for (let i = 0; i < pages.length; i++) {
        const pageElem = pages[i];
        const canvas = await html2canvas(pageElem, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }

      const cleanName = (result.personName || "Devotee").replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`Baggona_Ayur_Sanjeevini_${cleanName}.pdf`);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isKn = selectedLang === "kn";
  const sanitizeAIText = (t?: string) => t?.replace(/\*\*/g, "").trim() || "";

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      {/* Royal Temple Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-500/50">
        <div className="relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold tracking-widest uppercase">
            <span>॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ॥</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-100 tracking-tight drop-shadow-md">
            {T_AYUR_SANJEEVINI.pageTitle[selectedLang]}
          </h1>

          <p className="text-xs sm:text-base text-amber-200/90 max-w-3xl mx-auto font-medium leading-relaxed">
            {T_AYUR_SANJEEVINI.pageSubtitle[selectedLang]}
          </p>

          {/* 5-Language Switcher */}
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {[
              { code: "kn", label: "ಕನ್ನಡ" },
              { code: "en", label: "English" },
              { code: "hi", label: "हिन्दी" },
              { code: "te", label: "తెలుగు" },
              { code: "ta", label: "தமிழ்" }
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelectedLang(l.code as SupportedLanguage)}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                  selectedLang === l.code
                    ? "bg-amber-400 text-amber-950 shadow-md scale-105"
                    : "bg-amber-950/60 text-amber-200 border border-amber-500/40 hover:bg-amber-900/80"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dual Mode Switcher: Janma vs Mrityu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode("janma")}
          className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 shadow-md ${
            mode === "janma"
              ? "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/70 dark:to-slate-900 border-amber-500 shadow-amber-500/20 ring-2 ring-amber-400"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100"
          }`}
        >
          <div className="font-black text-base sm:text-lg text-amber-950 dark:text-amber-300">
            {T_AYUR_SANJEEVINI.modeJanmaTitle[selectedLang]}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium leading-snug">
            {T_AYUR_SANJEEVINI.modeJanmaDesc[selectedLang]}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("mrityu")}
          className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 shadow-md ${
            mode === "mrityu"
              ? "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/70 dark:to-slate-900 border-amber-500 shadow-amber-500/20 ring-2 ring-amber-400"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100"
          }`}
        >
          <div className="font-black text-base sm:text-lg text-amber-950 dark:text-amber-300">
            {T_AYUR_SANJEEVINI.modeMrityuTitle[selectedLang]}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium leading-snug">
            {T_AYUR_SANJEEVINI.modeMrityuDesc[selectedLang]}
          </p>
        </button>
      </div>

      {/* Input Form Card */}
      <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-xl rounded-3xl backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-amber-200 dark:border-amber-900/50 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <span>🕉️</span>
              <span>{T_AYUR_SANJEEVINI.formHeader[selectedLang]}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Person Name with Mic */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {T_AYUR_SANJEEVINI.formName[selectedLang]}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("name")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "name"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಹೆಸರು ನಮೂದಿಸಿ" : "Dictate name via mic"}
                >
                  <span>{activeMicField === "name" ? "🔴" : "🎙️"}</span>
                  <span>
                    {activeMicField === "name"
                      ? isKn
                        ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..."
                        : "Listening..."
                      : isKn
                      ? "ಧ್ವನಿ (Mic)"
                      : "Mic"}
                  </span>
                </button>
              </div>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={mode === "janma" ? "ಉದಾ: ಶ್ರೀಧರ್ ಭಟ್" : "ಉದಾ: ದಿವಂಗತ ರಾಮಚಂದ್ರ ಶಾಸ್ತ್ರಿ"}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_AYUR_SANJEEVINI.formDob[selectedLang]}
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_AYUR_SANJEEVINI.formTob[selectedLang]}
              </label>
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Place with Mic */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {T_AYUR_SANJEEVINI.formPob[selectedLang]}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("place")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "place"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಸ್ಥಳ ನಮೂದಿಸಿ" : "Dictate place via mic"}
                >
                  <span>{activeMicField === "place" ? "🔴" : "🎙️"}</span>
                  <span>
                    {activeMicField === "place"
                      ? isKn
                        ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..."
                        : "Listening..."
                      : isKn
                      ? "ಧ್ವನಿ (Mic)"
                      : "Mic"}
                  </span>
                </button>
              </div>
              <input
                type="text"
                value={pob}
                onChange={(e) => setPob(e.target.value)}
                placeholder="581326 Gokarna"
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Gotra */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_AYUR_SANJEEVINI.formGotra[selectedLang]}
              </label>
              <input
                type="text"
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                placeholder="Kashyapa / Bharadwaja"
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Concern / Query with Mic */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {T_AYUR_SANJEEVINI.formConcern[selectedLang]}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("concern")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "concern"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Dictate concern via mic"}
                >
                  <span>{activeMicField === "concern" ? "🔴" : "🎙️"}</span>
                  <span>
                    {activeMicField === "concern"
                      ? isKn
                        ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..."
                        : "Listening..."
                      : isKn
                      ? "ಧ್ವನಿ (Mic)"
                      : "Mic"}
                  </span>
                </button>
              </div>
              <input
                type="text"
                value={customConcern}
                onChange={(e) => setCustomConcern(e.target.value)}
                placeholder="ಉದಾ: ದೀರ್ಘಕಾಲದ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ಪಿತೃ ಶಾಂತಿ"
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="text-center pt-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 border border-amber-400/40 disabled:opacity-50"
            >
              {isProcessing ? "ಗಣನೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..." : T_AYUR_SANJEEVINI.submitBtn[selectedLang]}
            </button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          {/* Action Bar with PDF Download */}
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 sm:p-5 rounded-3xl border-2 border-amber-500/50 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
                🕉️
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                  {result.personName} • {result.rashi} ({result.nakshatra})
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {T_AYUR_SANJEEVINI.longevityClasses[result.longevity.category][selectedLang]}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{isGeneratingPdf ? "⏳" : "📄"}</span>
              <span>
                {isGeneratingPdf ? "PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : T_AYUR_SANJEEVINI.downloadPdfBtn[selectedLang]}
              </span>
            </button>
          </div>

          {/* 7 Tabs Header */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-amber-100/60 dark:bg-slate-800/80 rounded-2xl border border-amber-300 dark:border-slate-700">
            {[
              { id: "longevity", label: T_AYUR_SANJEEVINI.tabs.longevity[selectedLang] },
              { id: "maraka", label: T_AYUR_SANJEEVINI.tabs.maraka[selectedLang] },
              { id: "shield", label: T_AYUR_SANJEEVINI.tabs.shield[selectedLang] },
              { id: "karmaVipaka", label: T_AYUR_SANJEEVINI.tabs.karmaVipaka[selectedLang] },
              { id: "mokshaGati", label: T_AYUR_SANJEEVINI.tabs.mokshaGati[selectedLang] },
              { id: "pitru", label: T_AYUR_SANJEEVINI.tabs.pitru[selectedLang] },
              { id: "gokarna", label: T_AYUR_SANJEEVINI.tabs.gokarna[selectedLang] }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-600 text-white shadow-md scale-100"
                    : "text-amber-950 dark:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Longevity & Vitality Matrix */}
          {activeTab === "longevity" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    ಆಯುರ್ದಾಯ ನಿರ್ಣಯ
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                    {T_AYUR_SANJEEVINI.longevityClasses[result.longevity.category][selectedLang]}
                  </h3>
                </div>
                <div className="px-5 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-900 dark:text-amber-200 text-center font-black">
                  <div className="text-xs">{isKn ? "ಪ್ರಾಣಶಕ್ತಿ ಸ್ಕೋರ್" : "Vitality Score"}</div>
                  <div className="text-xl text-amber-600 dark:text-amber-400">{result.longevity.vitalityScore} / 100</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಅಂದಾಜು ಆಯುಷ್ಯ ಶ್ರೇಣಿ</div>
                  <div className="text-sm font-black text-slate-950 dark:text-white mt-1">{result.longevity.estimatedAgeSpan}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಆಯುಷ್ಕಾರಕ ಶನಿ ಪ್ರಭಾವ</div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-white mt-1">{result.longevity.ayushkarakaStrength}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಗಂಡಾಂತ ಸ್ಥಿತಿ</div>
                  <div className={`text-sm font-black mt-1 ${result.gandanta.hasGandanta ? "text-rose-600" : "text-emerald-600"}`}>
                    {result.gandanta.description}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-amber-100/70 to-amber-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-amber-300 dark:border-slate-700 space-y-2">
                <div className="font-extrabold text-xs text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                  ಜೈಮಿನಿ ತ್ರಿ-ಜೋಡಿ ಆಯುರ್ದಾಯ ಗಣನೆ (Three Pairs Method)
                </div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                  <div>• {result.longevity.threePairsMethod.lagnaAndEighth}</div>
                  <div>• {result.longevity.threePairsMethod.moonAndSaturn}</div>
                  <div>• {result.longevity.threePairsMethod.lagnaAndHoraLagna}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: Maraka & Badhaka */}
          {activeTab === "maraka" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಮಾರಕ & ಬಾಧಕ ಪರಿಶೀಲನೆ
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                  ⚔️ ಮಾರಕ-ಬಾಧಕ ಗ್ರಹ ಶಮನ ಮಾರ್ಗ
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಮಾರಕ ಸ್ಥಾನಗಳು & ಗ್ರಹರು</div>
                  <div className="text-sm font-black text-slate-950 dark:text-white mt-1">
                    {result.marakaBadhaka.marakaHouses.join(", ")} ({result.marakaBadhaka.marakaPlanets.join(", ")})
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಬಾಧಕ ಭಾವ & ಅಧಿಪತಿ</div>
                  <div className="text-sm font-black text-slate-950 dark:text-white mt-1">
                    {result.marakaBadhaka.badhakaHouse}ನೇ ಭಾವ ({result.marakaBadhaka.badhadhipati})
                  </div>
                </div>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 rounded-2xl">
                <div className="text-xs font-black text-rose-900 dark:text-rose-300">ದಶಾ ಸಂಧಿಕಾಲ ಎಚ್ಚರಿಕೆ</div>
                <div className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 mt-1 font-medium">
                  {result.marakaBadhaka.chhidraDashaAlert}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/50 rounded-2xl">
                <div className="text-xs font-black text-emerald-900 dark:text-emerald-300">ಪರಿಹಾರ ನಿರ್ದೇಶನ</div>
                <div className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 mt-1 font-medium">
                  {result.marakaBadhaka.mitigationSummary}
                </div>
              </div>
            </Card>
          )}

          {/* Tab 3: Maha Mrityunjaya Shield */}
          {activeTab === "shield" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ದೈವಿಕ ರಕ್ಷಾ ಕವಚ
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                  🛡️ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ರಕ್ಷೆ
                </h3>
              </div>

              <div className="p-6 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white rounded-3xl border-2 border-amber-400 text-center shadow-xl">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2">
                  ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ
                </div>
                <p className="text-sm sm:text-lg font-black text-amber-100 leading-relaxed font-serif">
                  {result.sanjeeviniShield.mrityunjayaMantra}
                </p>
                <div className="mt-3 text-xs text-amber-300 font-bold">
                  ದೈನಂದಿನ ಶಿಫಾರಸು ಜಪ: {result.sanjeeviniShield.recommendedJapaCount} ಬಾರಿ
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white mt-1">
                    {result.sanjeeviniShield.rudrakshaRecommendation}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white mt-1">
                    {result.sanjeeviniShield.ayushyaSuktaHomaDetails}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 4: Karma Vipaka */}
          {activeTab === "karmaVipaka" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಕರ್ಮ ವಿಪಾಕ ಸಂಹಿತಾ ದರ್ಶನ
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                  🌌 ರೋಗ-ದೋಷಗಳ ಕರ್ಮ ಕಾರಣ & ಶಾಂತಿ ಪರಿಹಾರ
                </h3>
              </div>

              <div className="space-y-4">
                {result.karmaVipaka.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 bg-amber-50/80 dark:bg-slate-800/80 border border-amber-300 dark:border-slate-700 rounded-2xl space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-300">
                        {idx + 1}. {item.ailmentOrChallenge}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-xs font-bold">
                        {item.afflictedPlanet}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <strong>ಕರ್ಮ ಕಾರಣ:</strong> {item.karmicCause}
                    </p>
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                      <strong>ವಿಶೇಷ ದಾನ & ಮಂತ್ರ:</strong> {item.recommendedDaana} • {item.prescribedMantra}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 5: Moksha Gati */}
          {activeTab === "mokshaGati" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಸದ್ಗತಿ & ಮುಕ್ತಿ ನಿರ್ಣಯ
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                  🕊️ ಜೀವಿಯ ಪ್ರಯಾಣ & ಮೋಕ್ಷ ಲೋಕ ಪ್ರಾಪ್ತಿ
                </h3>
              </div>

              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-800 rounded-3xl text-emerald-950 dark:text-emerald-200 space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                  ಪ್ರಾಪ್ತ ಸದ್ಗತಿ ಲೋಕ
                </div>
                <div className="text-lg sm:text-2xl font-black">
                  {T_AYUR_SANJEEVINI.lokaRealms[result.mokshaGati.soulRealm][selectedLang]}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed font-medium">
                  {result.mokshaGati.twelfthHouseInfluence}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಮೋಕ್ಷ ಮಾರ್ಗ ಸಾಧನೆ</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white mt-1">
                  {result.mokshaGati.pathwayToMoksha}
                </div>
              </div>
            </Card>
          )}

          {/* Tab 6: Pitru Rina */}
          {activeTab === "pitru" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಪಿತೃ ಋಣ ವಿಮೋಚನೆ
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                  🪔 ಪಿತೃ ಶಾಂತಿ & ವಂಶಾಭಿವೃದ್ಧಿ ರಕ್ಷೆ
                </h3>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಸ್ಥಿತಿ</div>
                <div className="text-sm font-black text-slate-950 dark:text-white mt-1">
                  {result.pitruKarma.ancestralBlessingStatus}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                  ಶಾಸ್ತ್ರೋಕ್ತ ನಿತ್ಯ ತರ್ಪಣ & ಸೇವಾ ನಿಯಮಗಳು
                </div>
                {result.pitruKarma.remedies.map((rem, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    • {rem}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 7: Gokarna Sevas */}
          {activeTab === "gokarna" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl rounded-3xl space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-0.5">
                  🕉️ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸಂಜೀವಿನಿ ಸೇವಾ ಸಂಕಲ್ಪ
                </h3>
              </div>

              <div className="space-y-3">
                {result.gokarnaSankalpa.recommendedSevas.map((seva, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-slate-800 dark:to-slate-800/80 border border-amber-300 dark:border-slate-700 rounded-2xl"
                  >
                    <div className="font-black text-sm text-amber-950 dark:text-amber-300">
                      {seva.title}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                      {seva.description}
                    </p>
                    <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mt-1.5">
                      ಪ್ರಶಸ್ತ ಕಾಲ: {seva.idealTithi} • ಫಲ: {seva.significance}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-amber-950 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-xs text-amber-300 font-bold">ಪ್ರಧಾನ ಅರ್ಚಕರು</div>
                  <div className="text-base font-black">{result.gokarnaSankalpa.priestName}</div>
                  <div className="text-xs text-amber-200">{result.gokarnaSankalpa.templeAddress}</div>
                </div>
                <a
                  href={`tel:${result.gokarnaSankalpa.priestPhone}`}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>📞 {result.gokarnaSankalpa.priestPhone} ಗೆ ಕರೆ ಮಾಡಿ</span>
                </a>
              </div>
            </Card>
          )}

          {/* AI Divine Revelation Box */}
          {result.aiDivineNarrative && (
            <Card className="border-2 border-amber-400 dark:border-amber-500/50 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 p-6 shadow-2xl rounded-3xl text-white space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-widest">
                <span>✨</span>
                <span>ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಸಂಜೀವಿನಿ ಸಂದೇಶ</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed whitespace-pre-wrap">
                {sanitizeAIText(result.aiDivineNarrative)}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering (Fixed & Visible to layout engine at -15000px) */}
      {result && (
        <div
          id="ayur-sanjeevini-pdf-wrapper"
          style={{
            position: "fixed",
            top: "-15000px",
            left: "-15000px",
            width: "794px",
            zIndex: -9999,
            pointerEvents: "none"
          }}
        >
          <AyurSanjeeviniPdfTemplate result={result} lang={selectedLang} />
        </div>
      )}
    </div>
  );
};
