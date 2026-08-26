import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAppStore } from "../stores/appStore";
import type { SupportedLanguage } from "../stores/appStore";
import Card from "../components/ui/Card";
import AudioPlayerButton from "../components/ui/AudioPlayerButton";
import type {
  AyurMode,
  AyurSanjeeviniInput,
  AyurSanjeeviniResult
} from "../features/ayursanjeevini/ayurSanjeeviniTypes";
import { T_AYUR_SANJEEVINI } from "../features/ayursanjeevini/ayurSanjeeviniLocale";
import {
  executeAyurSanjeeviniCalculation,
  generateAyurSanjeeviniAINarrative
} from "../features/ayursanjeevini/ayurSanjeeviniEngine";
import { AyurSanjeeviniPdfTemplate } from "../components/ayursanjeevini/AyurSanjeeviniPdfTemplate";

export const AyurSanjeeviniPage: React.FC = () => {
  const language = useAppStore((state) => state.language) as SupportedLanguage;

  const [mode, setMode] = useState<AyurMode>("janma");
  const [personName, setPersonName] = useState("");
  const [dob, setDob] = useState("1992-06-15");
  const [tob, setTob] = useState("07:30");
  const [pob, setPob] = useState("581326 Gokarna");
  const [gotra, setGotra] = useState("Kashyapa");
  const [customConcern, setCustomConcern] = useState("");

  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [result, setResult] = useState<AyurSanjeeviniResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeMicField, setActiveMicField] = useState<string | null>(null);

  const offscreenContainerRef = useRef<HTMLDivElement>(null);

  const t = T_AYUR_SANJEEVINI;

  // Speech to text handler
  const handleMicClick = (field: "name" | "place" | "concern") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (activeMicField === field) {
      setActiveMicField(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang =
      language === "kn"
        ? "kn-IN"
        : language === "hi"
        ? "hi-IN"
        : language === "te"
        ? "te-IN"
        : language === "ta"
        ? "ta-IN"
        : "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

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
  };

  // Compute Ayur Sanjeevini
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const input: AyurSanjeeviniInput = {
      mode,
      personName: personName.trim() || (mode === "janma" ? "ಭಕ್ತರು (Devotee)" : "ದಿವಂಗತ ಪುಣ್ಯಾತ್ಮ"),
      dob,
      tob,
      pob: pob.trim() || "Gokarna",
      gotra: gotra.trim() || "Kashyapa",
      customConcern: customConcern.trim(),
      lang: language
    };

    const calculated = executeAyurSanjeeviniCalculation(input);

    const aiNarrative = await generateAyurSanjeeviniAINarrative(
      calculated,
      language,
      (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY
    );

    calculated.aiDivineNarrative = aiNarrative;
    setResult(calculated);
    setActiveTab("tab1");
    setLoading(false);
  };

  // Download Luxury 3-Page A4 PDF
  const handleDownloadPdf = async () => {
    if (!result || !offscreenContainerRef.current) return;
    setDownloadingPdf(true);

    try {
      const element = offscreenContainerRef.current;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pages = element.querySelectorAll(".pdf-page-a4");
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#fffbeb"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      const fileName =
        mode === "janma"
          ? `Baggona_Janana_AyurSanjeevini_${result.personName.replace(/\s+/g, "_")}.pdf`
          : `Baggona_Marana_SoulMoksha_${result.personName.replace(/\s+/g, "_")}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/40">
            <span>🛡️</span> {t.pageTitle[language]}
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-amber-200">
            {t.pageTitle[language]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            {t.pageSubtitle[language]}
          </p>
        </div>

        {/* 🌟 Top Level Dual Portal Selector (Janana vs Marana) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-900/90 rounded-2xl border-2 border-amber-500/40 shadow-xl">
          {/* Janana Tab Button */}
          <button
            type="button"
            onClick={() => {
              setMode("janma");
              setResult(null);
            }}
            className={`flex flex-col items-start p-4 rounded-xl transition-all duration-200 text-left border ${
              mode === "janma"
                ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50 scale-[1.01]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-amber-200 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 font-serif font-bold text-base sm:text-lg">
              <span>🌱</span>
              <span className={mode === "janma" ? "text-amber-100" : "text-slate-200"}>
                {t.modeJananaTitle[language]}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs mt-1 opacity-90 leading-relaxed">
              {t.modeJananaDesc[language]}
            </p>
            {mode === "janma" && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/30 text-amber-200 uppercase tracking-wider">
                ✓ ೧೦೦% ಜನನ ಆಧಾರಿತ ಪೋರ್ಟಲ್ ಸಕ್ರಿಯವಾಗಿದೆ
              </span>
            )}
          </button>

          {/* Marana Tab Button */}
          <button
            type="button"
            onClick={() => {
              setMode("mrityu");
              setResult(null);
            }}
            className={`flex flex-col items-start p-4 rounded-xl transition-all duration-200 text-left border ${
              mode === "mrityu"
                ? "bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50 scale-[1.01]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-amber-200 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 font-serif font-bold text-base sm:text-lg">
              <span>🕊️</span>
              <span className={mode === "mrityu" ? "text-amber-100" : "text-slate-200"}>
                {t.modeMaranaTitle[language]}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs mt-1 opacity-90 leading-relaxed">
              {t.modeMaranaDesc[language]}
            </p>
            {mode === "mrityu" && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/30 text-amber-200 uppercase tracking-wider">
                ✓ ೧೦೦% ಮರಣ & ಸದ್ಗತಿ ಪೋರ್ಟಲ್ ಸಕ್ರಿಯವಾಗಿದೆ
              </span>
            )}
          </button>
        </div>

        {/* Input Form with Speech-to-Text */}
        <Card className="border-amber-500/40 bg-slate-900/90 shadow-xl">
          <form onSubmit={handleCalculate} className="space-y-4">
            <h2 className="text-base sm:text-lg font-serif font-bold text-amber-300 border-b border-amber-500/30 pb-2 flex items-center justify-between">
              <span>
                {mode === "janma" ? t.formHeaderJanana[language] : t.formHeaderMarana[language]}
              </span>
              <span className="text-xs font-normal text-slate-400">
                {mode === "janma" ? "🌱 ಜನನ ಪ್ರವೇಶ" : "🕊️ ನಿರ್ಯಾಣ ಪ್ರವೇಶ"}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Person Name Input with Mic */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  {mode === "janma" ? t.formNameJanana[language] : t.formNameMarana[language]} *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder={mode === "janma" ? "ಉದಾ: ಶ್ರೀಧರ್ ಭಟ್" : "ಉದಾ: ದಿವಂಗತ ರಾಮಚಂದ್ರ ಭಟ್"}
                    className="w-full rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    title="Dictate with voice"
                    onClick={() => handleMicClick("name")}
                    className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                      activeMicField === "name"
                        ? "bg-rose-600 text-white animate-pulse"
                        : "text-amber-400 hover:bg-amber-500/20"
                    }`}
                  >
                    🎙️
                  </button>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  {mode === "janma" ? t.formDobJanana[language] : t.formDobMarana[language]} *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Time of Birth / Demise */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  {mode === "janma" ? t.formTobJanana[language] : t.formTobMarana[language]}
                </label>
                <input
                  type="time"
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Place of Birth / Demise with Mic */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  {mode === "janma" ? t.formPobJanana[language] : t.formPobMarana[language]} *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={pob}
                    onChange={(e) => setPob(e.target.value)}
                    placeholder="ಉದಾ: 581326 Gokarna"
                    className="w-full rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    title="Dictate with voice"
                    onClick={() => handleMicClick("place")}
                    className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                      activeMicField === "place"
                        ? "bg-rose-600 text-white animate-pulse"
                        : "text-amber-400 hover:bg-amber-500/20"
                    }`}
                  >
                    🎙️
                  </button>
                </div>
              </div>

              {/* Gotra */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  {t.formGotra[language]}
                </label>
                <input
                  type="text"
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  placeholder="ಉದಾ: ಕಶ್ಯಪ (Kashyapa)"
                  className="w-full rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Custom Concern with Mic */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  {mode === "janma" ? t.formConcernJanana[language] : t.formConcernMarana[language]}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customConcern}
                    onChange={(e) => setCustomConcern(e.target.value)}
                    placeholder={
                      mode === "janma"
                        ? "ಆರೋಗ್ಯ, ದೀರ್ಘಾಯುಷ್ಯ ಅಥವಾ ಸಂಜೀವಿನಿ ರಕ್ಷಣೆ ಕುರಿತು..."
                        : "ಪಿತೃ ಶಾಂತಿ, ಸದ್ಗತಿ, ಶ್ರಾದ್ಧ ಅಥವಾ ವಂಶ ರಕ್ಷಣೆ ಕುರಿತು..."
                    }
                    className="w-full rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    title="Dictate with voice"
                    onClick={() => handleMicClick("concern")}
                    className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                      activeMicField === "concern"
                        ? "bg-rose-600 text-white animate-pulse"
                        : "text-amber-400 hover:bg-amber-500/20"
                    }`}
                  >
                    🎙️
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-lg">☸</span>
                    <span>ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗಣನೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...</span>
                  </>
                ) : (
                  <span>
                    {mode === "janma" ? t.submitBtnJanana[language] : t.submitBtnMarana[language]}
                  </span>
                )}
              </button>
            </div>
          </form>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Top Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                  <span>{mode === "janma" ? "🌱 ಜನನ ಆಯುರ್-ಸಂಜೀವಿನಿ ಜಾತಕ" : "🕊️ ಮರಣ ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ ಜಾತಕ"}</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-amber-100 mt-1">
                  {result.personName} (ಗೋತ್ರ: {result.gotra})
                </h3>
                <p className="text-xs text-slate-400">
                  ದಿನಾಂಕ: {result.dobFormatted} | ರಾಶಿ: {result.rashi} | ನಕ್ಷತ್ರ: {result.nakshatra}
                </p>
              </div>

              {/* Action Buttons: Audio & Download PDF */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {result.aiDivineNarrative && (
                  <AudioPlayerButton
                    text={result.aiDivineNarrative}
                    lang={language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : language === "ta" ? "ta-IN" : "en-US"}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all hover:bg-amber-400 cursor-pointer"
                  />
                )}
                <button
                  type="button"
                  disabled={downloadingPdf}
                  onClick={handleDownloadPdf}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-amber-950 font-bold text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  {downloadingPdf ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <span>
                      {mode === "janma"
                        ? t.downloadPdfBtnJanana[language]
                        : t.downloadPdfBtnMarana[language]}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* AI Divine Narrative Card */}
            {result.aiDivineNarrative && (
              <Card className="border-amber-500/40 bg-slate-900/90 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                    <span>✨</span>
                    <span>
                      {mode === "janma"
                        ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆಯುರ್-ಸಂಜೀವಿನಿ ದೈವಿಕ ಸಂದೇಶ"
                        : "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸದ್ಗತಿ & ಪಿತೃ ಮುಕ್ತಿ ದೈವಿಕ ಸಂದೇಶ"}
                    </span>
                  </div>
                  <AudioPlayerButton
                    text={result.aiDivineNarrative}
                    lang={language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : language === "ta" ? "ta-IN" : "en-US"}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  />
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-serif bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/20">
                  {result.aiDivineNarrative}
                </div>
              </Card>
            )}

            {/* 🌟 100% Mode-Specific 6 Interactive Tabs */}
            {mode === "janma" ? (
              /* JANANA 6 TABS */
              <div>
                {/* Janana Tab Navigation */}
                <div className="flex overflow-x-auto gap-2 pb-2 border-b border-amber-500/30 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab1")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab1"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.jananaTabs.longevity[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab2")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab2"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.jananaTabs.gandanta[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab3")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab3"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.jananaTabs.maraka[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab4")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab4"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.jananaTabs.shield[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab5")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab5"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.jananaTabs.karmaVipaka[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab6")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab6"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.jananaTabs.gokarna[language]}
                  </button>
                </div>

                {/* Janana Tab Content Panels */}
                <div className="mt-4">
                  {/* Tab 1: Longevity Matrix */}
                  {activeTab === "tab1" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-amber-500/40 bg-slate-900/90 p-4">
                        <h4 className="text-sm font-bold text-amber-300 mb-2">ಆಯುರ್ದಾಯ ವರ್ಗ & ಪ್ರಾಣಶಕ್ತಿ</h4>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">ಆಯುಷ್ಯ ಶ್ರೇಣಿ:</span>
                            <span className="text-sm font-bold text-amber-200">
                              {result.longevity.estimatedAgeSpan}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">ಪ್ರಾಣಶಕ್ತಿ ಸೂಚ್ಯಂಕ:</span>
                            <span className="text-lg font-black text-emerald-400">
                              {result.longevity.vitalityScore} / 100
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 pt-1">
                            ಆಯುಷ್ಕಾರಕ ಶನಿ ಬಲ: {result.longevity.ayushkarakaStrength}
                          </div>
                        </div>
                      </Card>

                      <Card className="border-amber-500/40 bg-slate-900/90 p-4">
                        <h4 className="text-sm font-bold text-amber-300 mb-2">ಜೈಮಿನಿ ತ್ರಿ-ಮಾನ ಪದ್ಧತಿ ವಿಶ್ಲೇಷಣೆ</h4>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs text-slate-200 space-y-1.5">
                          <div>• ಲಗ್ನ & ೮ನೇ ಮನೆ: {result.longevity.threePairsMethod.lagnaAndEighth}</div>
                          <div>• ಚಂದ್ರ & ಶನಿ: {result.longevity.threePairsMethod.moonAndSaturn}</div>
                          <div>• ಲಗ್ನ & ಹೋರಾ ಲಗ್ನ: {result.longevity.threePairsMethod.lagnaAndHoraLagna}</div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Tab 2: Gandanta & Balarishta */}
                  {activeTab === "tab2" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">⚖️ ಗಂಡಾಂತ & ಬಾಲಾರಿಷ್ಟ ಪರಿಶೀಲನೆ</h4>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-amber-400">ಸ್ಥಿತಿ: </span>
                          <span>{result.gandanta.description}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-400">ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ: </span>
                          <span>{result.gandanta.remedyRequired}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 3: Maraka & Badhaka */}
                  {activeTab === "tab3" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">⚔️ ಮಾರಕ & ಬಾಧಕ ಗ್ರಹ ನಿರ್ಣಯ</h4>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-amber-400">ಮಾರಕ ಗ್ರಹಗಳು: </span>
                          <span>{result.marakaBadhaka.marakaPlanets.join(", ")}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-400">ಬಾಧಕ ಸ್ಥಾನ: </span>
                          <span>{result.marakaBadhaka.badhadhipati} ({result.marakaBadhaka.badhakaHouse}ನೇ ಭಾವ)</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-400">ಛಿದ್ರ ದಶಾ ಎಚ್ಚರಿಕೆ: </span>
                          <span>{result.marakaBadhaka.chhidraDashaAlert}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-400">ಶಾಂತಿ ಮಾರ್ಗ: </span>
                          <span>{result.marakaBadhaka.mitigationSummary}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 4: Maha Mrityunjaya Shield */}
                  {activeTab === "tab4" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3 text-center">
                      <h4 className="text-sm font-bold text-amber-300">🛡️ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಕವಚ</h4>
                      <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-400/40 space-y-2">
                        <div className="text-sm font-serif font-bold text-amber-100 leading-relaxed">
                          {result.sanjeeviniShield.mrityunjayaMantra}
                        </div>
                        <div className="text-xs text-amber-300">
                          ದೈನಿಕ ಜಪ ಸಂಖ್ಯೆ: {result.sanjeeviniShield.recommendedJapaCount} ಬಾರಿ
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 text-left space-y-1">
                        <div>• ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ: {result.sanjeeviniShield.rudrakshaRecommendation}</div>
                        <div>• ಲೋಹ ಕವಚ: {result.sanjeeviniShield.gemstoneOrMetalShield}</div>
                        <div>• ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ: {result.sanjeeviniShield.ayushyaSuktaHomaDetails}</div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 5: Karma Vipaka */}
                  {activeTab === "tab5" && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">🌌 ಕರ್ಮ ವಿಪಾಕ & ದೈಹಿಕ ರೋಗ ಕಾರಣಗಳು</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {result.karmaVipaka.map((item, idx) => (
                          <Card key={idx} className="border-amber-500/30 bg-slate-900/80 p-3 space-y-1.5 text-xs">
                            <div className="font-bold text-amber-400">{item.ailmentOrChallenge}</div>
                            <div className="text-slate-300">ಕರ್ಮ ಕಾರಣ: {item.karmicCause}</div>
                            <div className="text-amber-200">ಪ್ರಶಸ್ತ ದಾನ: {item.recommendedDaana}</div>
                            <div className="text-slate-400 italic text-[11px]">{item.prescribedMantra}</div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 6: Gokarna Ayushya Sevas */}
                  {activeTab === "tab6" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-4">
                      <h4 className="text-sm font-bold text-amber-300">🕉️ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಆಯುಷ್ಯ ಸಂಕಲ್ಪ ಸೇವೆಗಳು</h4>
                      <div className="space-y-2">
                        {result.gokarnaSankalpa.recommendedSevas.map((seva, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs space-y-1">
                            <div className="font-bold text-amber-300">{idx + 1}. {seva.title}</div>
                            <div className="text-slate-300">{seva.description}</div>
                            <div className="text-slate-400">ಪ್ರಶಸ್ತ ತಿಥಿ: {seva.idealTithi} | ಫಲ: {seva.significance}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-400/40 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="font-bold text-amber-200">ಪ್ರಧಾನ ಅರ್ಚಕರು: {result.gokarnaSankalpa.priestName}</div>
                          <div className="text-slate-300">{result.gokarnaSankalpa.templeAddress}</div>
                        </div>
                        <a
                          href={`tel:${result.gokarnaSankalpa.priestPhone.replace(/\s+/g, "")}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                        >
                          📞 {result.gokarnaSankalpa.priestPhone}
                        </a>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              /* MARANA 6 TABS */
              <div>
                {/* Marana Tab Navigation */}
                <div className="flex overflow-x-auto gap-2 pb-2 border-b border-amber-500/30 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab1")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab1"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.maranaTabs.mokshaGati[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab2")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab2"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.maranaTabs.transitionDosha[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab3")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab3"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.maranaTabs.pitruRina[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab4")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab4"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.maranaTabs.tripindi[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab5")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab5"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.maranaTabs.vamshaShield[language]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab6")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === "tab6"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.maranaTabs.gokarna[language]}
                  </button>
                </div>

                {/* Marana Tab Content Panels */}
                <div className="mt-4">
                  {/* Tab 1: Moksha Gati */}
                  {activeTab === "tab1" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">🕊️ ಜೀವಾತ್ಮ ಸದ್ಗತಿ & ಮೋಕ್ಷ ಲೋಕ ನಿರ್ಣಯ</h4>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2 text-xs">
                        <div className="text-sm font-bold text-amber-200">
                          ಪ್ರಾಪ್ತ ಲೋಕ: {result.mokshaGati.realmName}
                        </div>
                        <div>• ೧೨ನೇ ವ್ಯಯ ಭಾವ: {result.mokshaGati.twelfthHouseInfluence}</div>
                        <div>• ಕಾರಕಾಂಶ ಕೇತು ಬಲ: {result.mokshaGati.karakamsaKetuBala}</div>
                        <div>• ಸಂಚಿತ ಕರ್ಮ ಶೇಷ: {result.mokshaGati.karmicDebtRemaining}</div>
                        <div>• ಮೋಕ್ಷ ಮಾರ್ಗ: {result.mokshaGati.pathwayToMoksha}</div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 2: Transition Nakshatra & Panchaka */}
                  {activeTab === "tab2" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">🌌 ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ & ಪಂಚಕ ಶಾಂತಿ</h4>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2 text-xs">
                        <div className="font-bold text-amber-400">ಪಂಚಕ ವಿಧ: {result.transitionDosha.panchakaType}</div>
                        <div>ವಿವರ: {result.transitionDosha.doshaDescription}</div>
                        <div>ಶಾಂತಿ ಪರಿಹಾರ: {result.transitionDosha.prescribedParihara}</div>
                        <div>ಕುಟುಂಬ ರಕ್ಷಾ ಅವಧಿ: {result.transitionDosha.peacePeriodRecommendation}</div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 3: Pitru Rina & 16 Shradhas */}
                  {activeTab === "tab3" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">🪔 ಪಿತೃ ಋಣ & ೧೬ ಶ್ರಾದ್ಧ ವಿಧಿಗಳು</h4>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2 text-xs text-slate-200">
                        <div>• ೧ ರಿಂದ ೧೨ ದಿನಗಳು: ನಿತ್ಯ ತರ್ಪಣ, ದಶಗಾತ್ರ ಪಿಂಡ ಪ್ರದಾನ, ಏಕಾದಶಾಹ ಹಾಗೂ ಸಪಿಂಡೀಕರಣ.</div>
                        <div>• ೧೬ ಮಾಸಿಕಗಳು: ಊನಮಾಸಿಕ, ತ್ರೈಪಾಕ್ಷಿಕ ಹಾಗೂ ಮಾಸಿಕ ಶ್ರಾದ್ಧಗಳ ಕಾಲಬದ್ಧ ಆಚರಣೆ.</div>
                        <div>• ಆಶೀರ್ವಾದ ಸ್ಥಿತಿ: {result.pitruKarma.ancestralBlessingStatus}</div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 4: Tripindi & Narayana Bali */}
                  {activeTab === "tab4" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
                      <h4 className="text-sm font-bold text-amber-300">🔱 ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ನಾರಾಯಣ ಬಲಿ ಮಾರ್ಗದರ್ಶಿ</h4>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2 text-xs">
                        <div>ಪಿತೃ ಋಣ ಮಟ್ಟ: <span className="font-bold text-amber-400">{result.pitruKarma.pitruRinaLevel.toUpperCase()}</span></div>
                        <div>ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಅಗತ್ಯತೆ: {result.pitruKarma.tripindiRequired ? "ಹೌದು - ತಕ್ಷಣ ಅಗತ್ಯವಿದೆ" : "ಸಾಮಾನ್ಯ ಶ್ರಾದ್ಧ ಸಾಕು"}</div>
                        <div>ನಾರಾಯಣ ಬಲಿ: {result.pitruKarma.narayanaBaliRecommended ? "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ" : "ಅಮಾವಾಸ್ಯೆ ತರ್ಪಣ ಸಾಕು"}</div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 5: Vamsha Shield */}
                  {activeTab === "tab5" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-3 text-center">
                      <h4 className="text-sm font-bold text-amber-300">🛡️ ವಂಶ ರಕ್ಷಾ & ಪಿತೃ ಆಶೀರ್ವಾದ ಕವಚ</h4>
                      <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-400/40 space-y-2">
                        <div className="text-sm font-serif font-bold text-amber-100 leading-relaxed">
                          {result.vamshaShield.vamshaProtectionMantra}
                        </div>
                        <div className="text-xs text-amber-300">
                          {result.vamshaShield.dailyPitruTarpanaGuideline}
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 text-left">
                        {result.vamshaShield.gayaGokarnaKashiRecommendation}
                      </div>
                    </Card>
                  )}

                  {/* Tab 6: Gokarna Pitru Mukti Sevas */}
                  {activeTab === "tab6" && (
                    <Card className="border-amber-500/40 bg-slate-900/90 p-4 space-y-4">
                      <h4 className="text-sm font-bold text-amber-300">🕉️ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ಪಿತೃ ಮುಕ್ತಿ ಸೇವೆಗಳು</h4>
                      <div className="space-y-2">
                        {result.gokarnaSankalpa.recommendedSevas.map((seva, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs space-y-1">
                            <div className="font-bold text-amber-300">{idx + 1}. {seva.title}</div>
                            <div className="text-slate-300">{seva.description}</div>
                            <div className="text-slate-400">ಪ್ರಶಸ್ತ ತಿಥಿ: {seva.idealTithi} | ಫಲ: {seva.significance}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-400/40 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="font-bold text-amber-200">ಪ್ರಧಾನ ಅರ್ಚಕರು: {result.gokarnaSankalpa.priestName}</div>
                          <div className="text-slate-300">{result.gokarnaSankalpa.templeAddress}</div>
                        </div>
                        <a
                          href={`tel:${result.gokarnaSankalpa.priestPhone.replace(/\s+/g, "")}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                        >
                          📞 {result.gokarnaSankalpa.priestPhone}
                        </a>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Offscreen A4 PDF Template Container (Hidden Offscreen) */}
        {result && (
          <div
            ref={offscreenContainerRef}
            aria-hidden="true"
            style={{
              position: "fixed",
              top: "-15000px",
              left: "-15000px",
              width: "794px",
              zIndex: -9999,
              pointerEvents: "none"
            }}
          >
            <AyurSanjeeviniPdfTemplate result={result} lang={language} />
          </div>
        )}
      </div>
    </div>
  );
};
