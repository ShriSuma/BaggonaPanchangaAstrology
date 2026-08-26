import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import { executeKaalaDiksuchiCalculation } from "../features/kaaladiksuchi/kaaladiksuchiEngine";
import { KaalaDiksuchiPdfTemplate } from "../components/kaaladiksuchi/KaalaDiksuchiPdfTemplate";
import { T_KAALA_DIKSUCHI, pickL5 } from "../features/kaaladiksuchi/kaaladiksuchiLocale";
import type {
  KaalaDiksuchiInput,
  KaalaDiksuchiResult,
  KaalaDiksuchiLang,
  SamudrikaForehead,
  SamudrikaEyes,
  SamudrikaElement,
  LifeDomainFocus
} from "../features/kaaladiksuchi/kaaladiksuchiTypes";
import { PREDEFINED_PRIESTS, getPriestProfile } from "../features/seva/sevaPriestDirectory";
import { useAppStore } from "../stores/appStore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const DivyaKaalaDiksuchiPage: React.FC = () => {
  const activeKey = useAppStore((state) => state.geminiApiKey);
  const globalLang = useAppStore((state) => state.language) as KaalaDiksuchiLang;
  const [selectedLang, setSelectedLang] = useState<KaalaDiksuchiLang>(
    ["kn", "en", "hi", "te", "ta"].includes(globalLang) ? globalLang : "kn"
  );

  const [personName, setPersonName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [pincode, setPincode] = useState<string>("581326");
  const [placeLabel, setPlaceLabel] = useState<string>("Gokarna");
  const [foreheadShape, setForeheadShape] = useState<SamudrikaForehead>("broad");
  const [eyeRadiance, setEyeRadiance] = useState<SamudrikaEyes>("calm");
  const [handElement, setHandElement] = useState<SamudrikaElement>("earth");
  const [primaryFocus, setPrimaryFocus] = useState<LifeDomainFocus>("career");
  const [customQuestion, setCustomQuestion] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<KaalaDiksuchiResult | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "modern" | "samudrika" | "prashna" | "remedies">("modern");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram-pandit");

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;

    setIsProcessing(true);
    const input: KaalaDiksuchiInput = {
      personName: personName.trim() || (selectedLang === "kn" ? "ಶ್ರೀಯುತ ಜಾತಕರು" : "Devotee"),
      dob,
      gender,
      pincode,
      placeLabel,
      foreheadShape,
      eyeRadiance,
      handElement,
      primaryFocus,
      customQuestion: customQuestion.trim() || undefined,
      lang: selectedLang
    };

    try {
      const calcResult = await executeKaalaDiksuchiCalculation(input, activeKey);
      setResult(calcResult);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const container = document.getElementById("kaala-diksuchi-pdf-container");
      if (!container) throw new Error("PDF container missing");

      // Temporarily reveal container for high-res render
      container.style.display = "block";
      container.style.position = "fixed";
      container.style.top = "-10000px";
      container.style.left = "-10000px";

      const pages = container.querySelectorAll(".pdf-page-a4");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFDF7"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      container.style.display = "none";
      const cleanName = (result.input.personName || "Devotee").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Baggona_Divya_Kaala_Diksuchi_${cleanName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
      const container = document.getElementById("kaala-diksuchi-pdf-container");
      if (container) container.style.display = "none";
    }
  };

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
      {/* Luxury Golden Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 p-6 sm:p-8 text-white shadow-2xl border-2 border-amber-500/40 mb-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
              🧭 NO-TIME-OF-BIRTH VEDIC BLUEPRINT
            </span>
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-amber-500/30">
              {(["kn", "en", "hi", "te", "ta"] as KaalaDiksuchiLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSelectedLang(l)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedLang === l
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
                      : "text-amber-200/70 hover:text-white"
                  }`}
                >
                  {l === "kn" ? "ಕನ್ನಡ" : l === "hi" ? "हिंदी" : l === "te" ? "తెలుగు" : l === "ta" ? "தமிழ்" : "English"}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 tracking-tight">
            {pickL5(T_KAALA_DIKSUCHI.heroTitle, selectedLang)}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-100/80 max-w-3xl leading-relaxed">
            {pickL5(T_KAALA_DIKSUCHI.heroSubtitle, selectedLang)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-amber-300/80">
            <span>✓ ಜನ್ಮ ಸಮಯ (Time of Birth) ಅಗತ್ಯವಿಲ್ಲ</span>
            <span>✓ ಸೂರ್ಯ ಲಗ್ನ & ಸಾಮುದ್ರಿಕ ತತ್ವ ಗಣನೆ</span>
            <span>✓ ವರ್ತಮಾನ ಜಗತ್ತಿನ ಹೊಂದಾಣಿಕೆ & ಪ್ರಗತಿ ರಹಸ್ಯ</span>
          </div>
        </div>
      </div>

      {/* Input Form Wizard Card */}
      <Card className="p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-200 dark:border-amber-900/40 shadow-xl rounded-2xl mb-8">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
                {pickL5(T_KAALA_DIKSUCHI.formName, selectedLang)} *
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="ಉದಾ: ಪ್ರಮೋದ್ ಕೊಡಗಿ"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
                {pickL5(T_KAALA_DIKSUCHI.formDob, selectedLang)} *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* City / Pincode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
                {pickL5(T_KAALA_DIKSUCHI.formPlace, selectedLang)}
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="581326 (Gokarna)"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Samudrika & Body Archetype Section */}
          <div className="pt-4 border-t border-amber-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-4">
              ✋ ಸಾಮುದ್ರಿಕ ಪ್ರಕೃತಿ ಲಕ್ಷಣಗಳು (Samudrika Archetype)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Forehead */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {pickL5(T_KAALA_DIKSUCHI.formForehead, selectedLang)}
                </label>
                <select
                  value={foreheadShape}
                  onChange={(e) => setForeheadShape(e.target.value as SamudrikaForehead)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  <option value="broad">ಅಗಲ & ಪ್ರಕಾಶಮಾನ (Broad / High - Jupiter/Guru)</option>
                  <option value="angular">ಸ್ಪಷ್ಟ & ತೀಕ್ಷ್ಣ (Angular / Defined - Mars/Kuja)</option>
                  <option value="curved">ದುಂಡಾದ & ಮೃದು (Curved / Gentle - Venus/Moon)</option>
                  <option value="compact">ನೇರ & ಮಧ್ಯಮ (Straight / Compact - Mercury/Budha)</option>
                </select>
              </div>

              {/* Eyes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {pickL5(T_KAALA_DIKSUCHI.formEyes, selectedLang)}
                </label>
                <select
                  value={eyeRadiance}
                  onChange={(e) => setEyeRadiance(e.target.value as SamudrikaEyes)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  <option value="calm">ಶಾಂತ & ಆಳವಾದ ದೃಷ್ಟಿ (Calm & Deep - Wisdom/Guru)</option>
                  <option value="sharp">ತೀಕ್ಷ್ಣ & ಹೊಳೆಯುವ ನೋಟ (Sharp & Intense - Sun/Mars)</option>
                  <option value="gentle">ಮೃದು & ವಾತ್ಸಲ್ಯಪೂರ್ಣ (Gentle & Kind - Moon/Venus)</option>
                  <option value="analytical">ಚುರುಕು & ವಿಶ್ಲೇಷಣಾತ್ಮಕ (Quick & Alert - Mercury)</option>
                </select>
              </div>

              {/* Hand Element */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {pickL5(T_KAALA_DIKSUCHI.formHandElement, selectedLang)}
                </label>
                <select
                  value={handElement}
                  onChange={(e) => setHandElement(e.target.value as SamudrikaElement)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  <option value="earth">ಪೃಥ್ವಿ (Earth - ಚೌಕಾಕಾರದ ಅಂಗೈ, ಸ್ಥಿರತೆ)</option>
                  <option value="fire">ಅಗ್ನಿ (Fire - ದೀರ್ಘ ಅಂಗೈ, ಸಾಹಸ & ಚೈತನ್ಯ)</option>
                  <option value="air">ವಾಯು (Air - ಉದ್ದನೆಯ ಬೆರಳುಗಳು, ಬುದ್ಧಿಮತ್ತೆ)</option>
                  <option value="water">ಜಲ (Water - ಮೃದು ಹಸ್ತ, ಕಲೆ & ಕಲ್ಪನೆ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Life Focus Domain & Specific Question */}
          <div className="pt-4 border-t border-amber-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
                {pickL5(T_KAALA_DIKSUCHI.formFocusDomain, selectedLang)}
              </label>
              <select
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value as LifeDomainFocus)}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="career">💼 ವೃತ್ತಿ, ವ್ಯಾಪಾರ & ಆರ್ಥಿಕ ಮುನ್ನಡೆ (Career & Wealth)</option>
                <option value="modern_adaptation">🌐 ಆಧುನಿಕ ಜಗತ್ತಿನ ಹೊಂದಾಣಿಕೆ & ಬೆಳವಣಿಗೆ (Modern World Navigation)</option>
                <option value="relationships">💞 ಕುಟುಂಬ, ವಿವಾಹ & ಸಂಬಂಧಗಳು (Family & Relationships)</option>
                <option value="health">🧘 ಆರೋಗ್ಯ, ಶಕ್ತಿ & ಆಂತರಿಕ ಶಾಂತಿ (Health & Vitality)</option>
                <option value="spiritual">🕉️ ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗ & ಆತ್ಮಸಾಕ್ಷಾತ್ಕಾರ (Spiritual Growth)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
                {pickL5(T_KAALA_DIKSUCHI.formCustomQuestion, selectedLang)}
              </label>
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="ಉದಾ: ಹೊಸ ಉದ್ಯಮ ಆರಂಭಿಸಲು ಅಥವಾ ಉದ್ಯೋಗ ಬದಲಾಯಿಸಲು ಈ ಕಾಲ ಸೂಕ್ತವೇ?"
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 border border-amber-400/40 disabled:opacity-50"
            >
              {isProcessing ? "ಗಣನೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..." : pickL5(T_KAALA_DIKSUCHI.submitBtn, selectedLang)}
            </button>
          </div>
        </form>
      </Card>

      {/* Results Dashboard Section */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          {/* Quick Summary Pill Bar */}
          <div className="bg-gradient-to-r from-amber-900/40 to-amber-950/60 p-4 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕉️</span>
              <div>
                <h3 className="font-bold text-amber-200 text-base">{result.input.personName}</h3>
                <p className="text-xs text-amber-300/80">
                  {result.suryaRashi} (ಸೂರ್ಯ ರಾಶಿ) · {result.birthDayOfWeek} · ಮೂಲಾಂಕ: {result.rulingNumber}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{isGeneratingPdf ? "PDF ರಚನೆಯಾಗುತ್ತಿದೆ..." : pickL5(T_KAALA_DIKSUCHI.downloadPdfBtn, selectedLang)}</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-amber-200/50 dark:border-slate-700">
            {[
              { id: "modern", label: pickL5(T_KAALA_DIKSUCHI.tabModernWorld, selectedLang) },
              { id: "matrix", label: pickL5(T_KAALA_DIKSUCHI.tabCosmicMatrix, selectedLang) },
              { id: "samudrika", label: pickL5(T_KAALA_DIKSUCHI.tabSamudrika, selectedLang) },
              { id: "prashna", label: pickL5(T_KAALA_DIKSUCHI.tabPrashna, selectedLang) },
              { id: "remedies", label: pickL5(T_KAALA_DIKSUCHI.tabRemedies, selectedLang) }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:text-amber-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: Modern World Navigator */}
          {activeTab === "modern" && (
            <div className="space-y-6">
              {/* Resonance Quotient Card */}
              <Card className="p-6 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 dark:border-slate-700 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      ಆಧುನಿಕ ಜಗತ್ತಿನ ಹೊಂದಾಣಿಕೆ ಸಾಮರ್ಥ್ಯ (Resonance Quotient)
                    </span>
                    <h2 className="text-lg font-extrabold text-amber-950 dark:text-amber-200 mt-1">
                      ಇಂದಿನ ಓಡುವ ಜಗತ್ತಿನಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ & ಸಾಮರ್ಥ್ಯ
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-amber-400/10 px-4 py-2 rounded-2xl border border-amber-500/30">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {result.modernWorld.userResonanceScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 leading-tight">
                      ಆಧುನಿಕ ಹೊಂದಾಣಿಕೆ ಸೂಚ್ಯಂಕ
                    </span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                  {result.modernWorld.userStandingInModernEra}
                </p>
              </Card>

              {/* Global Trend Macro View */}
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <span>🌐</span> ಪ್ರಸ್ತುತ ಜಾಗತಿಕ ಪ್ರವೃತ್ತಿ & ಕಾಲಮಾನ (Current Global Climate)
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.modernWorld.currentGlobalTrend}
                </p>
              </Card>

              {/* Vulnerabilities & Opportunities 2-Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                    <span>⚠️</span> ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಆಧುನಿಕ ದೌರ್ಬಲ್ಯಗಳು
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-rose-950 dark:text-rose-200">
                    {result.modernWorld.keyVulnerabilities.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <span>🚀</span> ಮುನ್ನಡೆಯಲು ಮುಕ್ತವಾಗಿರುವ ಬೆಳವಣಿಗೆಯ ಮಹಾದ್ವಾರಗಳು
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                    {result.modernWorld.growthOpportunities.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Career & Wellness Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <span>💼</span> ವೃತ್ತಿ & ತಂತ್ರಜ್ಞಾನ ನಾಯಕತ್ವ (Career & Tech Synergy)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.modernWorld.careerAndTechStrategy}
                  </p>
                </Card>

                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <span>🧘</span> ಡಿಜಿಟಲ್ ಸ್ವಾಸ್ಥ್ಯ & ಮಾನಸಿಕ ಶಾಂತಿ (Digital Wellness)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.modernWorld.digitalAndMentalWellness}
                  </p>
                </Card>
              </div>

              {/* Actionable Micro-Habits */}
              <Card className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
                  <span>⚡</span> ಇಂದಿನಿಂದಲೇ ಅಳವಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ದೈನಂದಿನ ಶಿಸ್ತು & ನಿಯಮಗಳು
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                  {result.modernWorld.actionableHabitsForToday.map((habit, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-amber-200/40">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>{habit}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Narrative if available */}
              {result.aiNarrative && (
                <Card className="p-6 bg-gradient-to-br from-amber-950/30 to-amber-900/40 border border-amber-500/40 rounded-2xl shadow-xl">
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>✨</span> ಗೋಕರ್ಣ ವೇದಜ್ಞರ AI ದಿವ್ಯ ಸಂದೇಶ & ಜೀವನ ರಹಸ್ಯ
                  </h3>
                  <p className="text-sm text-amber-100/90 leading-relaxed whitespace-pre-line">
                    {result.aiNarrative}
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* TAB CONTENT: Cosmic Matrix & Graha Placements */}
          {activeTab === "matrix" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-2xl">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-4">
                🌌 ಸೌರ ಬಿಂಬ ಗ್ರಹ ಮಂಡಲ (Solar Epoch Planetary Alignment)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-amber-100/60 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-slate-700">
                      <th className="p-3">ಗ್ರಹ</th>
                      <th className="p-3">ರಾಶಿ</th>
                      <th className="p-3">ಅಂಶ</th>
                      <th className="p-3">ಸ್ಥಾನ ಬಲ</th>
                      <th className="p-3">ಕಾರಕತ್ವ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.planets.map((p, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-amber-50/30">
                        <td className="p-3 font-bold">{p.name}</td>
                        <td className="p-3">{p.rashi}</td>
                        <td className="p-3">{p.degree.toFixed(2)}°</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.dignity === "Exalted" ? "bg-emerald-100 text-emerald-800" :
                            p.dignity === "Own Sign" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {p.dignity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{p.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB CONTENT: Samudrika & Body Signs */}
          {activeTab === "samudrika" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-1">
                  ✋ ಸಾಮುದ್ರಿಕ ಅಂಗ ಲಕ್ಷಣ ಪ್ರಕೃತಿ
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ದೇಹ, ಕಣ್ಣು, ಹಣೆ ಹಾಗೂ ಹಸ್ತದ ಲಕ್ಷಣಗಳಿಂದ ನಿರ್ಧಾರಿತ ಪ್ರಕೃತಿ ತತ್ವ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200/50">
                  <span className="text-xs text-slate-500">ಪ್ರಧಾನ ಗ್ರಹ:</span>
                  <div className="text-base font-bold text-amber-900 dark:text-amber-200 mt-1">{result.samudrika.dominantPlanet}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200/50">
                  <span className="text-xs text-slate-500">ವ್ಯಕ್ತಿತ್ವ ತತ್ವ:</span>
                  <div className="text-base font-bold text-amber-900 dark:text-amber-200 mt-1">{result.samudrika.personalityArchetype}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200/50">
                  <span className="text-xs text-slate-500">ಅಂತರ್ಗತ ಶಕ್ತಿ:</span>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-200 mt-1">{result.samudrika.hiddenSuperpower}</div>
                </div>
              </div>

              {/* Elemental Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200">
                  <div className="text-rose-600 font-bold text-xs">🔥 ಅಗ್ನಿ ತತ್ವ (Fire)</div>
                  <div className="text-2xl font-black text-rose-700 mt-1">{result.samudrika.elementalComposition.fire}%</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200">
                  <div className="text-amber-600 font-bold text-xs">⛰️ ಪೃಥ್ವಿ ತತ್ವ (Earth)</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{result.samudrika.elementalComposition.earth}%</div>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200">
                  <div className="text-emerald-600 font-bold text-xs">💨 ವಾಯು ತತ್ವ (Air)</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{result.samudrika.elementalComposition.air}%</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200">
                  <div className="text-blue-600 font-bold text-xs">🌊 ಜಲ ತತ್ವ (Water)</div>
                  <div className="text-2xl font-black text-blue-700 mt-1">{result.samudrika.elementalComposition.water}%</div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB CONTENT: Instant Prashna Oracle */}
          {activeTab === "prashna" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
                  🔮 ತತ್ಕ್ಷಣದ ಬ್ರಹ್ಮಾಂಡ ಪ್ರಶ್ನ ಫಲ (Horary Oracle)
                </h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                  {result.prashnaOracle.prashnaLagna} Lagna
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {result.prashnaOracle.directAnswer}
              </p>
              <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300">
                ⏳ ನಿರೀಕ್ಷಿತ ಕಾಲಾವಧಿ: {result.prashnaOracle.timelineEstimate}
              </div>
            </Card>
          )}

          {/* TAB CONTENT: Daily Remedies */}
          {activeTab === "remedies" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-2xl space-y-6">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
                🪔 ದೈನಂದಿನ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಸೂತ್ರಗಳು & ಗೋಕರ್ಣ ಆಶೀರ್ವಾದ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3 bg-amber-50/60 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">ದೈನಂದಿನ ಸ್ತೋತ್ರ:</span>
                  <div className="font-bold text-amber-900 dark:text-amber-200 mt-1">{result.remedies.dailyStotra}</div>
                </div>
                <div className="p-3 bg-amber-50/60 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">ಶುಭ ದಿನಗಳು:</span>
                  <div className="font-bold text-amber-900 dark:text-amber-200 mt-1">{result.remedies.luckyDays.join(", ")}</div>
                </div>
                <div className="p-3 bg-amber-50/60 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">ಶುಭ ವರ್ಣಗಳು:</span>
                  <div className="font-bold text-amber-900 dark:text-amber-200 mt-1">{result.remedies.luckyColors.join(", ")}</div>
                </div>
                <div className="p-3 bg-amber-50/60 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">ಶುಭ ಸಂಖ್ಯೆಗಳು:</span>
                  <div className="font-bold text-amber-900 dark:text-amber-200 mt-1">{result.remedies.luckyNumbers.join(", ")}</div>
                </div>
                <div className="sm:col-span-2 p-3 bg-amber-50/60 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">ರತ್ನ / ರುದ್ರಾಕ್ಷಿ ಶಿಫಾರಸು:</span>
                  <div className="font-bold text-amber-900 dark:text-amber-200 mt-1">{result.remedies.gemstoneRecommendation}</div>
                </div>
                <div className="sm:col-span-2 p-3 bg-amber-50/60 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪರಿಹಾರ:</span>
                  <div className="font-bold text-amber-900 dark:text-amber-200 mt-1">{result.remedies.sacredGokarnaRemedy}</div>
                </div>
              </div>

              {/* Priest Card */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                    🕉️ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು — ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    ನಿಮ್ಮ ಜೀವನದ ಸಂಕೀರ್ಣ ಗೊಂದಲಗಳಿಗೆ ನೇರ ಮುಹೂರ್ತ & ಸಂಕಲ್ಪ ಸಮಾಲೋಚನೆ
                  </p>
                </div>
                <a
                  href="tel:+919972339362"
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>📞 99723 39362 ಗೆ ಕರೆ ಮಾಡಿ</span>
                </a>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Hidden Offscreen Container for PDF Capture */}
      {result && (
        <div style={{ display: "none" }}>
          <KaalaDiksuchiPdfTemplate
            result={result}
            lang={selectedLang}
            priest={getPriestProfile(selectedPriestId)}
          />
        </div>
      )}
    </div>
  );
};
