import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import AudioPlayerButton from "../components/ui/AudioPlayerButton";
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
import { getPriestProfile } from "../features/seva/sevaPriestDirectory";
import { useAppStore } from "../stores/appStore";
import { useWalletStore } from "../features/wallet/walletStore";
import { SERVICE_COIN_COSTS } from "../features/wallet/walletTypes";
import { usePricingConfigStore } from "../features/wallet/pricingConfigStore";
import { CoinDeductionModal } from "../components/wallet/CoinDeductionModal";
import { FallingCoinsRefillModal } from "../components/wallet/FallingCoinsRefillModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const DivyaKaalaDiksuchiPage: React.FC = () => {
  const activeKey = useAppStore((state) => state.geminiApiKey);
  const globalLang = useAppStore((state) => state.language) as KaalaDiksuchiLang;
  const [selectedLang, setSelectedLang] = useState<KaalaDiksuchiLang>(
    ["kn", "en", "hi", "te", "ta"].includes(globalLang) ? globalLang : "kn"
  );
  const isKn = selectedLang === "kn";

  const wallet = useWalletStore((s) => s.wallet);
  const deductForService = useWalletStore((s) => s.deductForService);
  const coinBalance = wallet?.coinBalance ?? 0;
  const diksuchiCost = usePricingConfigStore((s) => s.getCoins("KAALA_DIKSUCHI_QUESTION", 200));

  const [pendingDeduction, setPendingDeduction] = useState<{
    isOpen: boolean;
    costCoins: number;
    devoteeName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isRefillOpen, setIsRefillOpen] = useState(false);

  const [personName, setPersonName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [pincode, setPincode] = useState<string>("581326");
  const [placeLabel, setPlaceLabel] = useState<string>("Gokarna");
  const [showAdvancedTraits, setShowAdvancedTraits] = useState<boolean>(false);
  const [foreheadShape, setForeheadShape] = useState<SamudrikaForehead>("broad");
  const [eyeRadiance, setEyeRadiance] = useState<SamudrikaEyes>("calm");
  const [handElement, setHandElement] = useState<SamudrikaElement>("earth");
  const [primaryFocus, setPrimaryFocus] = useState<LifeDomainFocus>("career");
  const [customQuestion, setCustomQuestion] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeMicField, setActiveMicField] = useState<"name" | "place" | "question" | null>(null);
  const [result, setResult] = useState<KaalaDiksuchiResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "compass" | "modern" | "transit" | "karmic" | "decades" | "sankhya" | "matrix" | "samudrika" | "remedies"
  >("compass");
  const selectedPriestId = "shreeram-pandit";

  const resultsRef = useRef<HTMLDivElement>(null);

  // Web Speech API Voice Recognition
  const handleMicToggle = (field: "name" | "place" | "question") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        selectedLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ."
          : "Speech recognition is not supported in your browser. Please type your text."
      );
      return;
    }

    if (activeMicField === field) {
      setActiveMicField(null);
      return;
    }

    setActiveMicField(field);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
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

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (field === "name") setPersonName(transcript);
        else if (field === "place") setPincode(transcript);
        else if (field === "question") setCustomQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setActiveMicField(null);
      };

      recognition.onend = () => {
        setActiveMicField(null);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setActiveMicField(null);
    }
  };

  const executeCalculation = async () => {
    setIsProcessing(true);
    const input: KaalaDiksuchiInput = {
      personName: personName.trim() || "Devotee",
      dob,
      gender,
      pincode: pincode.trim() || "581326",
      placeLabel: placeLabel.trim() || "Gokarna",
      foreheadShape: showAdvancedTraits ? foreheadShape : undefined,
      eyeRadiance: showAdvancedTraits ? eyeRadiance : undefined,
      handElement: showAdvancedTraits ? handElement : undefined,
      primaryFocus,
      customQuestion: customQuestion.trim() || undefined,
      lang: selectedLang
    };

    try {
      const calcResult = await executeKaalaDiksuchiCalculation(input, activeKey);
      setResult(calcResult);
      setActiveTab("compass");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;
    const cost = diksuchiCost;

    setPendingDeduction({
      isOpen: true,
      costCoins: cost,
      devoteeName: personName.trim() || "Devotee",
      onConfirm: async () => {
        const deductRes = await deductForService(cost, "ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ಭವಿಷ್ಯ ದರ್ಶನ", personName.trim() || "Devotee");
        if (!deductRes.success) {
          setIsRefillOpen(true);
          return;
        }
        await executeCalculation();
      }
    });
  };

  const handleDownloadPdf = async () => {
    if (!result || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const container = document.getElementById("kaala-diksuchi-pdf-container");
      if (!container) throw new Error("PDF container missing");

      const pages = container.querySelectorAll(".pdf-page-a4");
      if (!pages || pages.length === 0) throw new Error("No PDF pages found");

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

      const cleanName = (result.input.personName || "Devotee").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Baggona_Divya_Kaala_Diksuchi_${cleanName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(selectedLang === "kn" ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ." : "Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const audioLang =
    selectedLang === "kn"
      ? "kn-IN"
      : selectedLang === "hi"
      ? "hi-IN"
      : selectedLang === "te"
      ? "te-IN"
      : selectedLang === "ta"
      ? "ta-IN"
      : "en-IN";

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
      {/* Luxury Golden Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 p-5 sm:p-8 text-white shadow-2xl border-2 border-amber-500/50 mb-6 sm:mb-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-amber-500/30 text-amber-200 border border-amber-400/50">
              🧭 100% ACCURATE · DIKSUCHI TIME & DIRECTION COMPASS
            </span>
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-amber-500/40 overflow-x-auto max-w-full">
              {(["kn", "en", "hi", "te", "ta"] as KaalaDiksuchiLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSelectedLang(l)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    selectedLang === l
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md font-extrabold"
                      : "text-amber-200 hover:text-white font-medium"
                  }`}
                >
                  {l === "kn" ? "ಕನ್ನಡ" : l === "hi" ? "हिंदी" : l === "te" ? "తెలుగు" : l === "ta" ? "தமிழ்" : "English"}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-amber-200 tracking-tight leading-snug">
            {pickL5(T_KAALA_DIKSUCHI.heroTitle, selectedLang)}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-amber-100 max-w-3xl leading-relaxed font-medium">
            {pickL5(T_KAALA_DIKSUCHI.heroSubtitle, selectedLang)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-amber-300 font-bold">
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ಸಮುದ್ರಿಕ ಲಕ್ಷಣ ಶಾಸ್ತ್ರ</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ನಿಖರ ಕಾಲಾವಧಿ ಗಣನೆ</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಪರಿಹಾರ</span>
          </div>
        </div>
      </div>

      {/* Input Form Wizard Card */}
      <Card className="p-5 sm:p-8 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 shadow-2xl rounded-3xl mb-8">
        {/* Priest Coin Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl mb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧭</span>
            <div>
              <span className="text-xs font-black text-amber-950 dark:text-amber-200 block">
                ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ವಿಶ್ಲೇಷಣೆ (Divya Kaala Diksuchi)
              </span>
              <span className="text-[11px] text-amber-800 dark:text-amber-400 font-bold">
                ದರ: 🪙 {diksuchiCost} ನಾಣ್ಯಗಳು ({diksuchiCost} Coins / ₹{Math.round(diksuchiCost / 10)}) ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className={`text-xs font-mono font-black px-3 py-1 rounded-xl border-2 ${
              coinBalance < diksuchiCost
                ? "bg-red-100 text-red-900 border-red-400 animate-pulse"
                : "bg-amber-100 text-amber-950 border-amber-400"
            }`}>
              {coinBalance < diksuchiCost ? `⚠️ ${coinBalance} 🪙 (ಕೊರತೆ)` : `${coinBalance} 🪙`}
            </span>
            <button
              type="button"
              onClick={() => setIsRefillOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm border border-amber-400"
            >
              + ರೀಫಿಲ್
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {pickL5(T_KAALA_DIKSUCHI.formName, selectedLang)} *
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("name")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "name"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={selectedLang === "kn" ? "ಧ್ವನಿ ಮೂಲಕ ಹೆಸರನ್ನು ಹೇಳಿ" : "Dictate name via mic"}
                >
                  <span>{activeMicField === "name" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "name" ? (selectedLang === "kn" ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : (selectedLang === "kn" ? "ಧ್ವನಿ (Mic)" : "Mic")}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="ಉದಾ: ಪ್ರಮೋದ್ ಕೊಡಗಿ"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {pickL5(T_KAALA_DIKSUCHI.formDob, selectedLang)} *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* City / Pincode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {pickL5(T_KAALA_DIKSUCHI.formPlace, selectedLang)}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("place")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "place"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={selectedLang === "kn" ? "ಧ್ವನಿ ಮೂಲಕ ಸ್ಥಳ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ಹೇಳಿ" : "Dictate place or pincode"}
                >
                  <span>{activeMicField === "place" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "place" ? (selectedLang === "kn" ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : (selectedLang === "kn" ? "ಧ್ವನಿ (Mic)" : "Mic")}</span>
                </button>
              </div>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="581326 (Gokarna)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Optional Advanced Samudrika Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedTraits(!showAdvancedTraits)}
              className="text-xs font-extrabold text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-200 flex items-center gap-1.5 focus:outline-none"
            >
              <span>{showAdvancedTraits ? "▼" : "▶"}</span>
              <span>{pickL5(T_KAALA_DIKSUCHI.optionalSamudrikaToggle, selectedLang)}</span>
            </button>

            {showAdvancedTraits && (
              <div className="mt-4 p-4 bg-amber-50/60 dark:bg-slate-800/80 rounded-2xl border-2 border-amber-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {pickL5(T_KAALA_DIKSUCHI.formForehead, selectedLang)}
                  </label>
                  <select
                    value={foreheadShape}
                    onChange={(e) => setForeheadShape(e.target.value as SamudrikaForehead)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="broad">ಅಗಲ & ಪ್ರಕಾಶಮಾನ (Broad - Jupiter/Guru)</option>
                    <option value="angular">ಸ್ಪಷ್ಟ & ತೀಕ್ಷ್ಣ (Angular - Mars/Kuja)</option>
                    <option value="curved">ದುಂಡಾದ & ಮೃದು (Curved - Venus/Moon)</option>
                    <option value="compact">ನೇರ & ಮಧ್ಯಮ (Straight - Mercury/Budha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {pickL5(T_KAALA_DIKSUCHI.formEyes, selectedLang)}
                  </label>
                  <select
                    value={eyeRadiance}
                    onChange={(e) => setEyeRadiance(e.target.value as SamudrikaEyes)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="calm">ಶಾಂತ & ಆಳವಾದ ನೋಟ (Calm/Deep - Guru)</option>
                    <option value="sharp">ತೀಕ್ಷ್ಣ & ಹೊಳೆಯುವ ನೋಟ (Sharp - Sun/Mars)</option>
                    <option value="gentle">ಮೃದು & ವಾತ್ಸಲ್ಯಪೂರ್ಣ (Gentle - Moon/Venus)</option>
                    <option value="analytical">ಚುರುಕು & ವಿಶ್ಲೇಷಣಾತ್ಮಕ (Quick - Mercury)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {pickL5(T_KAALA_DIKSUCHI.formHandElement, selectedLang)}
                  </label>
                  <select
                    value={handElement}
                    onChange={(e) => setHandElement(e.target.value as SamudrikaElement)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="earth">ಪೃಥ್ವಿ (Earth - ಚೌಕಾಕಾರ ಅಂಗೈ, ಸ್ಥಿರತೆ)</option>
                    <option value="fire">ಅಗ್ನಿ (Fire - ದೀರ್ಘ ಅಂಗೈ, ಚೈತನ್ಯ)</option>
                    <option value="air">ವಾಯು (Air - ಉದ್ದ ಬೆರಳುಗಳು, ಬುದ್ಧಿ)</option>
                    <option value="water">ಜಲ (Water - ಮೃದು ಹಸ್ತ, ಕಲೆ)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Life Focus Domain & Specific Question */}
          <div className="pt-3 border-t border-amber-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {pickL5(T_KAALA_DIKSUCHI.formFocusDomain, selectedLang)}
              </label>
              <select
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value as LifeDomainFocus)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="career">💼 ವೃತ್ತಿ, ವ್ಯಾಪಾರ & ಆರ್ಥಿಕ ಮುನ್ನಡೆ (Career & Wealth)</option>
                <option value="modern_adaptation">🌐 ಆಧುನಿಕ ಜೀವನ ನಾಯಕತ್ವ & ಪ್ರಗತಿ (Modern Life Mastery)</option>
                <option value="relationships">💞 ಕುಟುಂಬ, ವಿವಾಹ & ಸಂಬಂಧಗಳು (Family & Relationships)</option>
                <option value="health">🧘 ಆರೋಗ್ಯ, ಶಕ್ತಿ & ಆಂತರಿಕ ಶಾಂತಿ (Health & Vitality)</option>
                <option value="spiritual">🕉️ ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗ & ಆತ್ಮಸಾಕ್ಷಾತ್ಕಾರ (Spiritual Growth)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {pickL5(T_KAALA_DIKSUCHI.formCustomQuestion, selectedLang)}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("question")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "question"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={selectedLang === "kn" ? "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Dictate question via mic"}
                >
                  <span>{activeMicField === "question" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "question" ? (selectedLang === "kn" ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : (selectedLang === "kn" ? "ಧ್ವನಿ (Mic)" : "Mic")}</span>
                </button>
              </div>
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="ಉದಾ: ಹೊಸ ಉದ್ಯಮ ಆರಂಭಿಸಲು ಶುಭ ಕಾಲ ಯಾವುದು?"
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-95 border border-amber-400/40 disabled:opacity-50"
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
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 sm:p-5 rounded-3xl border-2 border-amber-500/50 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-2xl">
                🕉️
              </div>
              <div>
                <h3 className="font-extrabold text-amber-200 text-base sm:text-lg">{result.input.personName}</h3>
                <p className="text-xs text-amber-100 font-bold">
                  {result.suryaRashi} (ರವಿ ರಾಶಿ) · {result.birthDayOfWeek} · ಮೂಲಾಂಕ: {result.rulingNumber} · ಭಾಗ್ಯಾಂಕ: {result.destinyNumber}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{isGeneratingPdf ? "PDF ರಚನೆಯಾಗುತ್ತಿದೆ..." : pickL5(T_KAALA_DIKSUCHI.downloadPdfBtn, selectedLang)}</span>
            </button>
          </div>

          {/* Navigation Tabs Bar with touch scroll */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-amber-200/60 dark:border-slate-700">
            {[
              { id: "compass", label: pickL5(T_KAALA_DIKSUCHI.tabDiksuchiCompass, selectedLang) },
              { id: "modern", label: pickL5(T_KAALA_DIKSUCHI.tabModernWorld, selectedLang) },
              { id: "transit", label: pickL5(T_KAALA_DIKSUCHI.tabLiveTransit, selectedLang) },
              { id: "karmic", label: pickL5(T_KAALA_DIKSUCHI.tabKarmicMission, selectedLang) },
              { id: "decades", label: pickL5(T_KAALA_DIKSUCHI.tabDecades, selectedLang) },
              { id: "sankhya", label: pickL5(T_KAALA_DIKSUCHI.tabSankhya, selectedLang) },
              { id: "matrix", label: pickL5(T_KAALA_DIKSUCHI.tabCosmicMatrix, selectedLang) },
              { id: "samudrika", label: pickL5(T_KAALA_DIKSUCHI.tabSamudrika, selectedLang) },
              { id: "remedies", label: pickL5(T_KAALA_DIKSUCHI.tabRemedies, selectedLang) }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-lg font-black"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: DIKSUCHI COMPASS & TIMING MATRIX */}
          {activeTab === "compass" && (
            <div className="space-y-5">
              {/* Compass Matrix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Career Direction */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💼</span>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        ವೃತ್ತಿ & ಕಾರ್ಯ ದಿಕ್ಸೂಚಿ
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        {result.diksuchi.careerDirection.directionName}
                      </h3>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-1 mb-3">
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಅಧಿದೇವತೆ:</span> {result.diksuchi.careerDirection.deity}</div>
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಅಧಿಪತಿ ಗ್ರಹ:</span> {result.diksuchi.careerDirection.rulingPlanet}</div>
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಶ್ರೇಷ್ಠ ಕ್ಷೇತ್ರ:</span> {result.diksuchi.careerDirection.suitabilityDomain}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {result.diksuchi.careerDirection.practicalAdvice}
                  </p>
                </Card>

                {/* Wealth Direction */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        ಧನಾಗಮನ & ಸಂಪತ್ತು ದಿಕ್ಸೂಚಿ
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        {result.diksuchi.wealthDirection.directionName}
                      </h3>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-1 mb-3">
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಅಧಿದೇವತೆ:</span> {result.diksuchi.wealthDirection.deity}</div>
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಅಧಿಪತಿ ಗ್ರಹ:</span> {result.diksuchi.wealthDirection.rulingPlanet}</div>
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಶ್ರೇಷ್ಠ ಕ್ಷೇತ್ರ:</span> {result.diksuchi.wealthDirection.suitabilityDomain}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {result.diksuchi.wealthDirection.practicalAdvice}
                  </p>
                </Card>

                {/* Health & Meditation Direction */}
                <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        ಆರೋಗ್ಯ & ಪ್ರಾಣಶಕ್ತಿ ದಿಕ್ಸೂಚಿ
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                        {result.diksuchi.healthMeditationDirection.directionName}
                      </h3>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-1 mb-3">
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಅಧಿದೇವತೆ:</span> {result.diksuchi.healthMeditationDirection.deity}</div>
                    <div><span className="text-amber-800 dark:text-amber-300 font-bold">ಅಧಿಪತಿ ಗ್ರಹ:</span> {result.diksuchi.healthMeditationDirection.rulingPlanet}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {result.diksuchi.healthMeditationDirection.practicalAdvice}
                  </p>
                </Card>

                {/* Daily Disha Shoola */}
                <div className="p-5 sm:p-6 bg-rose-50 dark:bg-slate-900 border-2 border-rose-400 dark:border-rose-500/60 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                        ಇಂದಿನ ದಿನದ ದಿಕ್ಶೂಲ (ವರ್ಜ್ಯ ದಿಕ್ಕು)
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100">
                        {result.diksuchi.dailyDishaShoola.afflictedDirection}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-semibold mb-2">
                    {result.diksuchi.dailyDishaShoola.reason}
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-rose-300 dark:border-rose-900/50 text-xs font-bold text-rose-950 dark:text-rose-100">
                    🛡️ <span className="text-rose-700 dark:text-rose-400">ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ:</span> {result.diksuchi.dailyDishaShoola.classicalRemedy}
                  </div>
                </div>
              </div>

              {/* Kaala Timings Card */}
              <Card className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-4 flex items-center gap-2">
                  <span>⏳</span> ಇಂದಿನ ಕಾಲ ಮುಹೂರ್ತ ವಿನ್ಯಾಸ & ಕಾರ್ಯ ಸಮಯ
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-bold block text-[11px]">ಅಭಿಜಿತ್ ಮುಹೂರ್ತ:</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block">{result.diksuchi.timingRhythm.abhijitMuhurtha}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-bold block text-[11px]">ರಾಹು ಕಾಲ (ವರ್ಜ್ಯ):</span>
                    <span className="font-extrabold text-rose-700 dark:text-rose-400 text-sm mt-0.5 block">{result.diksuchi.timingRhythm.rahuKaal}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-bold block text-[11px]">ಗುಳಿಕ ಕಾಲ:</span>
                    <span className="font-extrabold text-amber-800 dark:text-amber-300 text-sm mt-0.5 block">{result.diksuchi.timingRhythm.gulikaKaal}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-bold block text-[11px]">ಯಮಗಂಡ ಕಾಲ:</span>
                    <span className="font-extrabold text-amber-800 dark:text-amber-300 text-sm mt-0.5 block">{result.diksuchi.timingRhythm.yamaganda}</span>
                  </div>
                  <div className="sm:col-span-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-bold block text-[11px]">ದಿನದ ಅತ್ಯುನ್ನತ ಶುಭ ಕಾರ್ಯ ಕಾಲ (Peak Prana):</span>
                    <span className="font-black text-amber-900 dark:text-amber-200 text-sm mt-0.5 block">{result.diksuchi.timingRhythm.peakPranaWindow}</span>
                  </div>
                </div>
              </Card>

              {/* Priest Audio & Divine Life Message */}
              {result.aiNarrative && (
                <Card className="p-6 bg-gradient-to-br from-amber-950/80 to-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl text-white">
                  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/30">
                    <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <span>🕉️</span> ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ಸಂದೇಶ
                    </h3>
                    <AudioPlayerButton
                      text={result.aiNarrative}
                      lang={audioLang}
                      voiceType="jayashree"
                      className="bg-amber-400 hover:bg-amber-300 text-amber-950 p-2 rounded-xl shadow-lg"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100 leading-relaxed whitespace-pre-line font-medium">
                    {result.aiNarrative}
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: Modern Life Navigator */}
          {activeTab === "modern" && (
            <div className="space-y-5">
              <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-100 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      ಆಧುನಿಕ ಜೀವನ ಹೊಂದಾಣಿಕೆ ಸಾಮರ್ಥ್ಯ (Resonance Quotient)
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                      ಇಂದಿನ ಸ್ಪರ್ಧಾತ್ಮಕ ಕಾಲದಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ & ಕಾರ್ಯತಂತ್ರ
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-500/20 dark:bg-amber-400/20 px-4 py-2 rounded-2xl border border-amber-500/40">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300">
                      {result.modernWorld.userResonanceScore}%
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-amber-950 dark:text-amber-200 leading-tight">
                      ಹೊಂದಾಣಿಕೆ ಸೂಚ್ಯಂಕ
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                  {result.modernWorld.userStandingInModernEra}
                </p>
              </Card>

              {/* Global Trend */}
              <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <span>🌐</span> ಪ್ರಸ್ತುತ ಜಾಗತಿಕ ಪ್ರವೃತ್ತಿ & ಕಾಲಮಾನ
                </h3>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                  {result.modernWorld.currentGlobalTrend}
                </p>
              </Card>

              {/* 2-Grid Vulnerabilities & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-5 sm:p-6 bg-rose-50 dark:bg-slate-900 border-2 border-rose-400 dark:border-rose-500/60 rounded-3xl shadow-md">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-3 flex items-center gap-2">
                    <span>⚠️</span> ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ದೌರ್ಬಲ್ಯಗಳು
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-semibold">
                    {result.modernWorld.keyVulnerabilities.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 sm:p-6 bg-emerald-50 dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-500/60 rounded-3xl shadow-md">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <span>🚀</span> ಮುನ್ನಡೆಯಲು ಮುಕ್ತವಾಗಿರುವ ಬೆಳವಣಿಗೆಯ ಮಹಾದ್ವಾರಗಳು
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-semibold">
                    {result.modernWorld.growthOpportunities.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Career & Wellness Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-800 rounded-3xl shadow-md">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <span>💼</span> ವೃತ್ತಿ & ನಾಯಕತ್ವ ಮಾರ್ಗಸೂಚಿ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                    {result.modernWorld.careerAndTechStrategy}
                  </p>
                </Card>

                <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-slate-800 rounded-3xl shadow-md">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <span>🧘</span> ಸ್ವಾಸ್ಥ್ಯ & ಮಾನಸಿಕ ಶಾಂತಿ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                    {result.modernWorld.digitalAndMentalWellness}
                  </p>
                </Card>
              </div>

              {/* Actionable Micro-Habits */}
              <Card className="p-5 sm:p-6 bg-amber-50/60 dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-md">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-4 flex items-center gap-2">
                  <span>⚡</span> ಇಂದಿನಿಂದಲೇ ಅಳವಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ದೈನಂದಿನ ಶಿಸ್ತು & ನಿಯಮಗಳು
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {result.modernWorld.actionableHabitsForToday.map((habit, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-amber-200 dark:border-slate-700 text-slate-950 dark:text-slate-100 font-semibold shadow-sm">
                      <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                      <span>{habit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: Live Daily Transit Energy */}
          {activeTab === "transit" && (
            <div className="space-y-5">
              <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-100 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      ಇಂದಿನ ಲೈವ್ ಗೋಚಾರ ಶಕ್ತಿ (Real-Time Planetary Pulse)
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                      ದೈನಂದಿನ ಪ್ರಾಣಶಕ್ತಿ & ಗೋಚಾರ ತರಂಗ
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-500/20 dark:bg-amber-400/20 px-4 py-2 rounded-2xl border border-amber-500/40">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300">
                      {result.liveTransit.pranaScore}%
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-amber-950 dark:text-amber-200 leading-tight">
                      ಪ್ರಾಣಶಕ್ತಿ ಸೂಚ್ಯಂಕ
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium mb-4">
                  {result.liveTransit.currentTransitSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">ತಾರಾ ಬಲ ಸ್ಥಿತಿ:</span>
                    <span className="text-sm font-extrabold text-slate-950 dark:text-white">{result.liveTransit.taraBalaLabel}</span>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">ಚಂದ್ರ ಬಲ ಸ್ಥಿತಿ:</span>
                    <span className="text-sm font-extrabold text-slate-950 dark:text-white">{result.liveTransit.chandraBalaLabel}</span>
                  </div>
                </div>
              </Card>

              {/* Favorable vs Caution Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-5 sm:p-6 bg-emerald-50 dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-500/60 rounded-3xl shadow-md">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <span>✨</span> ಇಂದು ಕೈಗೊಳ್ಳಲು ಅತ್ಯಂತ ಶುಭಕರವಾದ ಕಾರ್ಯಗಳು
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-semibold">
                    {result.liveTransit.favorableActivities.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 sm:p-6 bg-rose-50 dark:bg-slate-900 border-2 border-rose-400 dark:border-rose-500/60 rounded-3xl shadow-md">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-3 flex items-center gap-2">
                    <span>⚠️</span> ಇಂದು ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ / ವರ್ಜ್ಯ ಅಂಶಗಳು
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-semibold">
                    {result.liveTransit.cautionActivities.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Karmic Soul Mission */}
          {activeTab === "karmic" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl space-y-6">
              <div className="border-b-2 border-amber-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ರಾಹು-ಕೇತು ಕರ್ಮ ಅಕ್ಷ & ಆತ್ಮ ಸಂಕಲ್ಪ
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  {result.karmicMission.rahuKetuAxis}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <h3 className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase mb-1">
                    🌟 ಈ ಜನ್ಮದ ಆತ್ಮ ಸಂಕಲ್ಪ (Soul Purpose):
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                    {result.karmicMission.soulPurpose}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <h3 className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase mb-1">
                    💎 ಪೂರ್ವಜನ್ಮದ ವರದಾನ (Past Life Gifts):
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                    {result.karmicMission.pastLifeGifts}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-slate-800/80 rounded-2xl border border-rose-300 dark:border-rose-900/50">
                <h3 className="text-xs font-extrabold text-rose-800 dark:text-rose-400 uppercase mb-1">
                  ⚖️ ಕರ್ಮ ಪಾಠ & ಸರಿಪಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ಋಣ (Karmic Lesson):
                </h3>
                <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-semibold leading-relaxed">
                  {result.karmicMission.karmicLesson}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-slate-800/80 rounded-2xl border border-emerald-300 dark:border-emerald-900/50">
                <h3 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                  🪔 ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಕರ್ಮ ಮುಕ್ತಿ ಪರಿಹಾರ:
                </h3>
                <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed">
                  {result.karmicMission.ancestralClearingRemedy}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 5: 10-Year Epoch Milestones */}
          {activeTab === "decades" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-base font-black text-amber-950 dark:text-amber-300 mb-2">
                🎯 ೧೦-ವರ್ಷಗಳ ದಶಾ ಕಾಲಚಕ್ರ ಹಂತಗಳು
              </h3>
              <div className="space-y-3">
                {result.decadeMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-amber-50/60 dark:bg-slate-800 rounded-2xl border-2 border-amber-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-lg text-xs font-black">
                          {m.ageRange}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          ({m.years})
                        </span>
                      </div>
                      <h4 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm mt-1">
                        {m.rulingPhase}
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 font-medium">
                        {m.theme}
                      </p>
                    </div>
                    <div className="text-right sm:min-w-[120px]">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-300">
                        {m.vitalityScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">ದೈವಬಲ ಸೂಚ್ಯಂಕ</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 6: Numerology & Deep Sankhya */}
          {activeTab === "sankhya" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-base font-black text-amber-950 dark:text-amber-300">
                🔢 ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ & ನಾಮ ತರಂಗ ರಹಸ್ಯ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ಮೂಲಾಂಕ (Ruling)</span>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-1">{result.sankhya.mulank}</div>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mt-1 block">{result.sankhya.mulankLord}</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ಭಾಗ್ಯಾಂಕ (Destiny)</span>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-1">{result.sankhya.bhagyank}</div>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mt-1 block">{result.sankhya.bhagyankLord}</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ನಾಮಾಂಕ (Name)</span>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-1">{result.sankhya.namank}</div>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mt-1 block">ನಾಮ ತರಂಗ</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ಆತ್ಮ ಕಂಪನ (Soul Urge)</span>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-1">{result.sankhya.soulUrge}</div>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mt-1 block">ಆಂತರಿಕ ಇಚ್ಛೆ</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                  💰 ಸಂಪತ್ತು ಆಕರ್ಷಿಸುವ ಸಂಖ್ಯಾ ರಹಸ್ಯ:
                </h4>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                  {result.sankhya.wealthAttractionSecret}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                  🤝 ಅತ್ಯಂತ ಶುಭ & ಪೂರಕ ಸಂಖ್ಯೆಗಳು:
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {result.sankhya.harmoniousNumbers.map((n) => (
                    <span key={n} className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-sm">
                      ಸಂಖ್ಯೆ {n}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 7: Cosmic Matrix & Chart */}
          {activeTab === "matrix" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-base font-black text-amber-950 dark:text-amber-300">
                🌌 ದಿವ್ಯ ಗ್ರಹ ಮಂಡಲ ಸ್ಥಿತಿ (ಮಧ್ಯಾಹ್ನ ಸೌರ ಬಿಂಬ ಗಣನೆ)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border-b-2 border-amber-300 dark:border-slate-700">
                      <th className="p-3 font-black">ಗ್ರಹ</th>
                      <th className="p-3 font-black">ರಾಶಿ</th>
                      <th className="p-3 font-black">ಅಂಶ</th>
                      <th className="p-3 font-black">ಸ್ಥಾನ ಬಲ</th>
                      <th className="p-3 font-black">ಕಾರಕತ್ವ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.planets.map((p, i) => (
                      <tr key={i} className="border-b border-amber-100 dark:border-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-800/80">
                        <td className="p-3 font-extrabold text-amber-950 dark:text-amber-300">{p.name}</td>
                        <td className="p-3 font-bold text-slate-950 dark:text-white">{p.rashi}</td>
                        <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{p.degree.toFixed(2)}°</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                            p.dignity === "Exalted" ? "bg-emerald-100 text-emerald-900 border border-emerald-400" :
                            p.dignity === "Own Sign" ? "bg-amber-100 text-amber-900 border border-amber-400" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                          }`}>
                            {p.dignity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{p.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 8: Samudrika & Body Signs */}
          {activeTab === "samudrika" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-black text-amber-950 dark:text-amber-300 mb-1">
                  ✋ ಸಾಮುದ್ರಿಕ ಅಂಗ ಲಕ್ಷಣ ಪ್ರಕೃತಿ
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  ದೇಹ, ಕಣ್ಣು, ಹಣೆ ಹಾಗೂ ಹಸ್ತದ ಲಕ್ಷಣಗಳಿಂದ ನಿರ್ಧಾರಿತ ಪ್ರಕೃತಿ ತತ್ವ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ಪ್ರಧಾನ ಗ್ರಹ:</span>
                  <div className="text-base font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.samudrika.dominantPlanet}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ವ್ಯಕ್ತಿತ್ವ ತತ್ವ:</span>
                  <div className="text-base font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.samudrika.personalityArchetype}</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ಅಂತರ್ಗತ ಶಕ್ತಿ:</span>
                  <div className="text-sm font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.samudrika.hiddenSuperpower}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-rose-50 dark:bg-slate-900 rounded-2xl border-2 border-rose-400 dark:border-rose-500/60 shadow-sm">
                  <div className="text-rose-800 dark:text-rose-300 font-extrabold text-xs">🔥 ಅಗ್ನಿ ತತ್ವ</div>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{result.samudrika.elementalComposition.fire}%</div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-500/60 shadow-sm">
                  <div className="text-amber-800 dark:text-amber-300 font-extrabold text-xs">⛰️ ಪೃಥ್ವಿ ತತ್ವ</div>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{result.samudrika.elementalComposition.earth}%</div>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-slate-900 rounded-2xl border-2 border-emerald-400 dark:border-emerald-500/60 shadow-sm">
                  <div className="text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">💨 ವಾಯು ತತ್ವ</div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{result.samudrika.elementalComposition.air}%</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-2xl border-2 border-blue-400 dark:border-blue-500/60 shadow-sm">
                  <div className="text-blue-800 dark:text-blue-300 font-extrabold text-xs">🌊 ಜಲ ತತ್ವ</div>
                  <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{result.samudrika.elementalComposition.water}%</div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 9: Remedies & Gokarna Sanjeevini */}
          {activeTab === "remedies" && (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/40 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-base font-black text-amber-950 dark:text-amber-300">
                🪔 ದೈನಂದಿನ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಸೂತ್ರಗಳು & ಗೋಕರ್ಣ ಆಶೀರ್ವಾದ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">ದೈನಂದಿನ ಸ್ತೋತ್ರ:</span>
                  <div className="font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.remedies.dailyStotra}</div>
                </div>
                <div className="p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">ಶುಭ ದಿನಗಳು:</span>
                  <div className="font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.remedies.luckyDays.join(", ")}</div>
                </div>
                <div className="p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">ಶುಭ ವರ್ಣಗಳು:</span>
                  <div className="font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.remedies.luckyColors.join(", ")}</div>
                </div>
                <div className="p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">ಶುಭ ಸಂಖ್ಯೆಗಳು:</span>
                  <div className="font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.remedies.luckyNumbers.join(", ")}</div>
                </div>
                <div className="sm:col-span-2 p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">ರತ್ನ / ರುದ್ರಾಕ್ಷಿ ಶಿಫಾರಸು:</span>
                  <div className="font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.remedies.gemstoneRecommendation}</div>
                </div>
                <div className="sm:col-span-2 p-3.5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪರಿಹಾರ:</span>
                  <div className="font-extrabold text-amber-950 dark:text-amber-200 mt-1">{result.remedies.sacredGokarnaRemedy}</div>
                </div>
              </div>

              {/* Priest Card */}
              <div className="p-5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-amber-950 dark:text-amber-200 text-sm sm:text-base">
                    🕉️ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು — ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                    ನಿಮ್ಮ ಜೀವನದ ಸಂಕೀರ್ಣ ಗೊಂದಲಗಳಿಗೆ ನೇರ ಮುಹೂರ್ತ & ಸಂಕಲ್ಪ ಸಮಾಲೋಚನೆ
                  </p>
                </div>
                <a
                  href="tel:+919972339362"
                  className="px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>📞 99723 39362 ಗೆ ಕರೆ ಮಾಡಿ</span>
                </a>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering (Fixed & Visible to layout engine at -15000px) */}
      {result && (
        <div
          id="kaala-diksuchi-pdf-wrapper"
          style={{
            position: "fixed",
            top: "-15000px",
            left: "-15000px",
            width: "794px",
            zIndex: -9999,
            pointerEvents: "none"
          }}
        >
          <KaalaDiksuchiPdfTemplate
            result={result}
            lang={selectedLang}
            priest={getPriestProfile(selectedPriestId)}
          />
        </div>
      )}

      {/* Falling Coins Refill Modal with Dropping Animation */}
      <FallingCoinsRefillModal
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        requiredCoins={diksuchiCost}
      />

      {/* Pre-Action Coin Deduction Confirmation Modal */}
      {pendingDeduction && (
        <CoinDeductionModal
          isOpen={pendingDeduction.isOpen}
          serviceTitle="ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ಭವಿಷ್ಯ ದರ್ಶನ (Kaala Diksuchi Oracle)"
          serviceTitleKannada="ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ"
          costCoins={pendingDeduction.costCoins}
          devoteeName={pendingDeduction.devoteeName}
          description="ದಿನದ ಶುಭ ಕಾಲ, ದಿಶಾರಕ್ಷೆ ಮತ್ತು ಕರ್ಮ ದಿಕ್ಸೂಚಿ ವಿಶ್ಲೇಷಣೆ"
          onClose={() => setPendingDeduction(null)}
          onConfirm={pendingDeduction.onConfirm}
          onOpenRefill={() => {
            setPendingDeduction(null);
            setIsRefillOpen(true);
          }}
        />
      )}

      {/* Animated Loading Overlay during GenAI computation */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999
          }}
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden m-0"
        >
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/95 via-amber-900/95 to-slate-950/95 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-sm w-full">
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 animate-ping opacity-75"></div>
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-300 animate-spin" style={{ animationDuration: "10s" }}></div>
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-3xl shadow-inner border border-amber-200 animate-pulse">
                🧭
              </div>
            </div>
            <h4 className="font-serif text-base font-bold text-amber-200 tracking-wide mb-2 animate-pulse">
              {isKn ? "✨ ಕಾಲ ದಿಕ್ಸೂಚಿ ಗಣಿತ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "✨ Computing Kaala Diksuchi Timing..."}
            </h4>
            <p className="text-xs text-amber-300/90 max-w-xs font-semibold leading-relaxed">
              {isKn
                ? "ದಿನದ ಸೂಕ್ಷ್ಮ ಶುಭ ಮುಹೂರ್ತ, ಋಣಾತ್ಮಕ ಕಾಲ ದೋಷ ಹಾಗೂ ದಿಶಾರಕ್ಷೆಯ ಲೆಕ್ಕಾಚಾರ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..."
                : "Calculating Precise Auspicious Hours, Directional Force & Transit Windows..."}
            </p>
            <div className="flex gap-2 mt-5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
