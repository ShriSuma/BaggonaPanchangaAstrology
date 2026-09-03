import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import { executeMaranottaraCalculation, generateMaranottaraAIConsolation, MaranottaraResult, MasikaDurationYears } from "../features/maranottara/maranottaraEngine";
import { T_MARANOTTARA, MaranottaraLang } from "../features/maranottara/maranottaraLocale";
import { downloadMaranottaraIcsFile } from "../features/maranottara/maranottaraIcsGenerator";
import { useAppStore } from "../stores/appStore";
import { MaranottaraPdfTemplate } from "../components/maranottara/MaranottaraPdfTemplate";
import { sanitizeAIText } from "../utils/textFormatter";
import AudioPlayerButton from "../components/ui/AudioPlayerButton";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { VedicTimePickerModal } from "../components/VedicTimePickerModal";

export const MaranottaraPage: React.FC = () => {
  const activeKey = useAppStore((state) => state.geminiApiKey);
  const globalLang = useAppStore((state) => state.language) as MaranottaraLang;
  const [selectedLang, setSelectedLang] = useState<MaranottaraLang>(
    ["kn", "en", "hi", "te", "ta"].includes(globalLang) ? globalLang : "kn"
  );

  const [personName, setPersonName] = useState<string>("");
  const [demiseDate, setDemiseDate] = useState<string>("");
  const [demiseTime, setDemiseTime] = useState<string>("");
  const [location, setLocation] = useState<string>("Gokarna, Karnataka");
  const [yearsCount, setYearsCount] = useState<MasikaDurationYears>(1);
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<MaranottaraResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "schedule" | "antyesti" | "dosha" | "asthi" | "garuda" | "mahalaya" | "gokarna" | "consolation"
  >("schedule");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeMicField, setActiveMicField] = useState<"name" | "place" | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const t = (key: string): string => {
    return T_MARANOTTARA[key]?.[selectedLang] || T_MARANOTTARA[key]?.kn || "";
  };

  // Web Speech API Voice Recognition
  const handleMicToggle = (field: "name" | "place") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t("speechNotSupported"));
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
        else if (field === "place") setLocation(transcript);
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

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demiseDate) return;

    setIsProcessing(true);

    setTimeout(async () => {
      const defaultName =
        selectedLang === "kn"
          ? "ಶ್ರೀಯುತ ಮೃತ ಆತ್ಮ"
          : selectedLang === "hi"
          ? "दिवंगत आत्मा"
          : selectedLang === "te"
          ? "దివంగత ఆత్మ"
          : selectedLang === "ta"
          ? "மறைந்த ஆன்மா"
          : "Deceased Soul";

      const calcResult = executeMaranottaraCalculation({
        personName: personName.trim() || defaultName,
        demiseDate,
        demiseTime: demiseTime || undefined,
        location: location.trim() || "Gokarna, Karnataka",
        yearsCount,
        lang: selectedLang
      });

      // Generate AI Spiritual Consolation narrative via Gemini 3.5 Flash Lite
      const aiText = await generateMaranottaraAIConsolation(calcResult, selectedLang, activeKey);
      calcResult.aiConsolationText = aiText;

      setResult(calcResult);
      setFilterYear("all");
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 600);
  };

  const handleDownloadPdf = async () => {
    if (!result || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const container = document.getElementById("maranottara-pdf-container");
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

      const cleanName = (result.personName || "Soul").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_");
      pdf.save(`Baggona_Maranottara_Report_${cleanName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(t("pdfError"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!result) return;
    downloadMaranottaraIcsFile(result, selectedLang);
  };

  // Filter Masika items based on selected year (if applicable)
  const displayedMasikaSchedule =
    result?.masikaSchedule.filter((item) => {
      if (filterYear === "all") return true;
      const yr = Math.ceil(item.monthIndex / 12);
      return yr === filterYear;
    }) || [];

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Luxury Golden Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 p-5 sm:p-8 text-white shadow-2xl border-2 border-amber-500/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-amber-500/30 text-amber-200 border border-amber-400/50">
              {t("sanctumTitle")}
            </span>
            {/* 5-Language Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-amber-500/40 overflow-x-auto max-w-full">
              {(["kn", "en", "hi", "te", "ta"] as MaranottaraLang[]).map((l) => (
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

          <h1 className="text-xl sm:text-3xl font-black text-amber-200 tracking-tight leading-snug">
            {t("heroTitle")}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-amber-100 max-w-3xl leading-relaxed font-medium">
            {t("heroSubtitle")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-amber-300 font-bold">
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">{t("pill1Antyesti")}</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">{t("pill2Masika")}</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">{t("pill3Panchaka")}</span>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-2xl rounded-3xl">
        <h3 className="font-extrabold text-sm sm:text-base text-amber-950 dark:text-amber-300 mb-4 flex items-center gap-2 border-b-2 border-amber-100 dark:border-slate-800 pb-3">
          <span>🕯️</span>
          <span>{t("formCardTitle")}</span>
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Deceased Person Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {t("formName")}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("name")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "name"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={t("dictateName")}
                >
                  <span>{activeMicField === "name" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "name" ? t("listening") : t("mic")}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Date of Demise */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {t("formDobDeath")}
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-extrabold">
                  {t("istTimeBadge")}
                </span>
              </div>
              <input
                type="date"
                required
                value={demiseDate}
                onChange={(e) => setDemiseDate(e.target.value)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Time of Demise (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {t("formTimeDeath")}
                </label>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                  {t("optionalTime")}
                </span>
              </div>
              <VedicTimePickerModal
                value={demiseTime || "12:00"}
                onChange={(val) => setDemiseTime(val)}
                label=""
                theme="gold"
                id="maranottara_demise_time"
              />
              <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block mt-1">
                {t("timeHelper")}
              </span>
            </div>

            {/* Location / Pin Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {t("formPlace")}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("place")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "place"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={t("dictatePlace")}
                >
                  <span>{activeMicField === "place" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "place" ? t("listening") : t("mic")}</span>
                </button>
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("placePlaceholder")}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Duration Years Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {t("formYears")}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as MasikaDurationYears[]).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYearsCount(y)}
                    className={`py-2.5 text-xs font-black rounded-2xl border-2 transition ${
                      yearsCount === y
                        ? "bg-amber-600 text-white border-amber-600 shadow-md scale-105"
                        : "bg-amber-50/80 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-slate-700 hover:bg-amber-100"
                    }`}
                  >
                    {y} {t("yearUnit")} ({y * 12}{t("monthUnit")})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-3">
            <button
              type="submit"
              disabled={isProcessing || !demiseDate}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl disabled:opacity-50 transition transform active:scale-95 border border-amber-400/40 cursor-pointer"
            >
              {isProcessing ? t("calculatingBtn") : t("submitBtn")}
            </button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          {/* Quick Header Summary Pill */}
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 sm:p-5 rounded-3xl border-2 border-amber-500/50 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-2xl">
                🪔
              </div>
              <div>
                <h3 className="font-black text-amber-200 text-base sm:text-lg">{result.personName}</h3>
                <p className="text-xs text-amber-100 font-bold">
                  {result.demiseDate} {result.demiseTime ? `(${result.demiseTime})` : ""} · {result.demiseTithi[selectedLang] || result.demiseTithi.kn} · {result.demiseNakshatra[selectedLang] || result.demiseNakshatra.kn}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {result.aiConsolationText && (
                <AudioPlayerButton
                  text={result.aiConsolationText}
                  lang={selectedLang === "kn" ? "kn-IN" : selectedLang === "hi" ? "hi-IN" : selectedLang === "te" ? "te-IN" : selectedLang === "ta" ? "ta-IN" : "en-US"}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
                />
              )}
              {/* Priest .ICS Calendar Download Button */}
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/40"
                title={t("downloadIcsBtn")}
              >
                <span>📅</span>
                <span>{t("downloadIcsBtn")}</span>
              </button>
              {/* PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isGeneratingPdf ? t("generatingPdfBtn") : t("downloadPdfBtn")}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar with touch scroll */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-amber-200/60 dark:border-slate-700">
            {[
              { id: "schedule", label: t("tabSchedule") },
              { id: "antyesti", label: t("tabAntyesti12Days") },
              { id: "dosha", label: t("tabDoshaShanti") },
              { id: "asthi", label: t("tabAsthiVisarjana") },
              { id: "garuda", label: t("tabGarudaPurana") },
              { id: "mahalaya", label: t("tabMahalayaTarpana") },
              { id: "gokarna", label: t("tabGokarnaSevas") },
              { id: "consolation", label: t("tabAiConsolation") }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-lg font-black"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Masika Schedule Grid */}
          {activeTab === "schedule" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-amber-950 dark:text-amber-300 flex items-center gap-2">
                    <span>📅</span>
                    <span>{t("scheduleHeading")} ({result.yearsCount} {t("yearUnit")})</span>
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-medium mt-0.5">
                    {result.demiseTithi[selectedLang] || result.demiseTithi.kn} · {result.demisePaksha[selectedLang] || result.demisePaksha.kn}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadIcs}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📅</span>
                    <span>{t("downloadIcsBtn")}</span>
                  </button>
                </div>
              </div>

              {/* Multi-Year Sub-Filter if yearsCount > 1 */}
              {result.yearsCount > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setFilterYear("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      filterYear === "all"
                        ? "bg-amber-600 text-white font-extrabold shadow"
                        : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-slate-700"
                    }`}
                  >
                    {t("allYears")} ({result.masikaSchedule.length}M)
                  </button>
                  {Array.from({ length: result.yearsCount }, (_, i) => i + 1).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setFilterYear(yr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                        filterYear === yr
                          ? "bg-amber-600 text-white font-extrabold shadow"
                          : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-slate-700"
                      }`}
                    >
                      {t("yearLabel")} {yr} (M{(yr - 1) * 12 + 1} - M{yr * 12})
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedMasikaSchedule.map((item) => (
                  <div
                    key={item.monthIndex}
                    className={`rounded-2xl p-4 border-2 transition ${
                      item.isVarshikaShraddha
                        ? "bg-amber-100/90 dark:bg-amber-950/70 border-amber-500 dark:border-amber-500 shadow-md ring-2 ring-amber-400/30"
                        : item.isSpecialMilestone
                        ? "bg-amber-50/70 dark:bg-slate-800/80 border-amber-300 dark:border-slate-700 shadow-sm"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-300 mb-1 border-b border-amber-200/60 dark:border-slate-700 pb-1.5">
                      <span>{item.masikaName[selectedLang] || item.masikaName.kn}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">M{item.monthIndex}</span>
                    </div>

                    <div className="text-sm font-black text-amber-900 dark:text-amber-200 my-1.5 flex items-center gap-1.5">
                      <span>📆</span>
                      <span>{item.formattedDateStr[selectedLang] || item.formattedDateStr.kn}</span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">({item.dayOfWeek[selectedLang] || item.dayOfWeek.kn})</span>
                    </div>

                    {item.aparahnaWindow && (
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 my-1">
                        ⏳ {selectedLang === "kn" ? "ಅಪರಾಹ್ನ ಕಾಲ:" : "Aparahna Window:"} {item.aparahnaWindow}
                      </div>
                    )}

                    <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold space-y-0.5 mt-2">
                      <div>
                        <strong>{selectedLang === "kn" ? "ತಿಥಿ:" : selectedLang === "hi" ? "तिथि:" : selectedLang === "te" ? "తిథి:" : selectedLang === "ta" ? "திதி:" : "Tithi:"}</strong>{" "}
                        {item.tithiName[selectedLang] || item.tithiName.kn}
                      </div>
                      <div>
                        <strong>{selectedLang === "kn" ? "ಪಕ್ಷ:" : selectedLang === "hi" ? "पक्ष:" : selectedLang === "te" ? "పక్షం:" : selectedLang === "ta" ? "பக்ஷம்:" : "Paksha:"}</strong>{" "}
                        {item.paksha[selectedLang] || item.paksha.kn}
                      </div>
                      <div className="text-[11px] text-amber-950 dark:text-amber-200 italic mt-2 bg-amber-50 dark:bg-slate-900 p-2 rounded-xl border border-amber-200 dark:border-slate-700">
                        {item.ritualNotes[selectedLang] || item.ritualNotes.kn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 2: 1-12 Days Antyesti Roadmap */}
          {activeTab === "antyesti" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {selectedLang === "kn" ? "ಶಾಸ್ತ್ರೋಕ್ತ ೧ ರಿಂದ ೧೨ ದಿನಗಳ ಸಂಸ್ಕಾರ ಕೈಪಿಡಿ" : "Vedic 1-12 Days Samskara Manual"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🕯️ {selectedLang === "kn" ? "೧ ರಿಂದ ೧೩ ದಿನಗಳ ಆಶೌಚ, ಪಿಂಡ ಪ್ರದಾನ & ಸಪಿಂಡೀಕರಣ ಮಹಾ ವಿಧಿ" : "1-13 Days Antyesti, Pinda Pradana & Sapindikarana Rites"}
                </h3>
              </div>

              <div className="space-y-4">
                {result.antyestiRoadmap.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-4 sm:p-5 rounded-2xl border-2 border-amber-200 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800/70 shadow-sm space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-slate-700 pb-2">
                      <h4 className="text-sm font-black text-amber-950 dark:text-amber-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 flex items-center justify-center text-xs font-black">
                          {day.dayNumber}
                        </span>
                        <span>{day.dayTitle[selectedLang] || day.dayTitle.kn}</span>
                      </h4>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-300">
                        {day.dateStr}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                      <strong>{selectedLang === "kn" ? "ನೆರವೇರಿಸಬೇಕಾದ ವಿಧಿ:" : "Ritual Procedure:"}</strong> {day.rituals[selectedLang] || day.rituals.kn}
                    </div>
                    <div className="text-xs text-amber-900 dark:text-amber-300 font-semibold">
                      <strong>{selectedLang === "kn" ? "ಆಧ್ಯಾತ್ಮಿಕ ಮಹತ್ವ:" : "Spiritual Significance:"}</strong> {day.significance[selectedLang] || day.significance.kn}
                    </div>
                    <div className="text-xs bg-amber-100/70 dark:bg-slate-900 p-2.5 rounded-xl border border-amber-300 dark:border-slate-700 text-amber-950 dark:text-amber-200 font-bold">
                      🎁 <strong>{selectedLang === "kn" ? "ಮುಖ್ಯ ದ್ರವ್ಯಗಳು / ದಾನ:" : "Offerings & Charity:"}</strong> {day.keyOfferings[selectedLang] || day.keyOfferings.kn}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: Demise Dosha & Panchaka Shanti */}
          {activeTab === "dosha" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {selectedLang === "kn" ? "ಮರಣ ಸಮಯ, ನಕ್ಷತ್ರ & ತಿಥಿ ವಿಶ್ಲೇಷಣೆ" : "Demise Timing, Nakshatra & Tithi Astrological Analysis"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🔱 {selectedLang === "kn" ? "ಪಂಚಕ / ತ್ರಿಪಾದ ಮರಣ ದೋಷ & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಶಾಂತಿ ವಿಧಿ" : "Panchaka / Tripada Demise Dosha & Gokarna Shanti Remedies"}
                </h3>
              </div>

              <div className="p-4 bg-amber-100/80 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100 leading-relaxed">
                {sanitizeAIText(result.doshaAnalysis.doshaSummary[selectedLang] || result.doshaAnalysis.doshaSummary.kn)}
              </div>

              {result.doshaAnalysis.putthaliVidhanaRequired && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 text-xs font-bold text-rose-900 dark:text-rose-200">
                  ⚠️ <strong>{selectedLang === "kn" ? "ಪುತ್ತಳಿ ವಿಧಾನ ಎಚ್ಚರಿಕೆ:" : "Putthali Vidhana Required:"}</strong>{" "}
                  {selectedLang === "kn"
                    ? `ಪಂಚಕ ನಕ್ಷತ್ರದಲ್ಲಿ ಮರಣ ಸಂಭವಿಸಿರುವುದರಿಂದ ಶವದೊಂದಿಗೆ ${result.doshaAnalysis.putthaliCount || 4} ದರ್ಭೆಯ ಬೊಂಬೆಗಳನ್ನು (ಪುತ್ತಳಿ) ಇಟ್ಟು ಮಂತ್ರಪೂರ್ವಕ ಸಂಸ್ಕಾರ ಮಾಡುವುದು ಕುಲ ಕ್ಷೇಮಕ್ಕೆ ಅತ್ಯಗತ್ಯ.`
                    : `Panchaka demise requires ${result.doshaAnalysis.putthaliCount || 4} Darbha Putthalis along with cremation rites to ward off ancestral affliction.`}
                </div>
              )}

              <div className="space-y-3">
                {result.doshaAnalysis.recommendedPoojas.map((pooja, idx) => (
                  <div key={idx} className="rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-2">
                    <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300 flex items-center gap-2">
                      <span>🪔</span>
                      <span>{pooja.title[selectedLang] || pooja.title.kn}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {pooja.description[selectedLang] || pooja.description.kn}
                    </p>
                    <div className="text-xs text-amber-950 dark:text-amber-200 bg-amber-50 dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700 font-bold">
                      <strong>{selectedLang === "kn" ? "ಶ್ರೇಷ್ಠ ದಾನ ಪದಾರ್ಥಗಳು:" : "Recommended Charity (Dana):"}</strong> {pooja.danaItems[selectedLang] || pooja.danaItems.kn}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: Asthi Visarjana Guide */}
          {activeTab === "asthi" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {selectedLang === "kn" ? "ಪವಿತ್ರ ನದಿ & ಸಮುದ್ರ ಸಂಗಮ ಮಾರ್ಗದರ್ಶನ" : "Sacred River & Ocean Confluence Pilgrimage"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🌊 {selectedLang === "kn" ? "ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ವಿಧಿ, ಶುಭ ದಿನಗಳು & ತೀರ್ಥ ಕ್ಷೇತ್ರಗಳು" : "Asthi Visarjana Ritual, Auspicious Days & Sacred Tirthas"}
                </h3>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                <strong>{selectedLang === "kn" ? "ಶುಭ ಕಾಲಾವಧಿ:" : "Optimal Timing:"}</strong> {result.asthiGuide.optimalTiming[selectedLang] || result.asthiGuide.optimalTiming.kn}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.asthiGuide.sacredTirthas.map((tirtha, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border-2 border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm space-y-1.5">
                    <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                      📍 {tirtha.name[selectedLang] || tirtha.name.kn}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                      {tirtha.location[selectedLang] || tirtha.location.kn}
                    </p>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {tirtha.spiritualSignificance[selectedLang] || tirtha.spiritualSignificance.kn}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-100/70 dark:bg-slate-800 rounded-2xl border border-amber-300 space-y-2">
                <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200">
                  📜 {selectedLang === "kn" ? "ಅಸ್ಥಿ ವಿಸರ್ಜನಾ ಮಹಾ ಮಂತ್ರ:" : "Sacred Immersion Mantra:"}
                </h4>
                <p className="font-serif font-black text-sm text-amber-900 dark:text-amber-300">
                  {result.asthiGuide.mantra}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 5: Garuda Purana Wisdom */}
          {activeTab === "garuda" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {selectedLang === "kn" ? "ಶಾಶ್ವತ ವೇದಜ್ಞ ತತ್ವ & ಜೀವ ಗತಿ" : "Vedic Philosophy & The Soul's Transmigration"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  📜 {selectedLang === "kn" ? "ಗರುಡ ಪುರಾಣ ಸಾರ: ಆತ್ಮದ ೧-ವರ್ಷದ ಪಯಣ & ಪಿಂಡದ ಮಹತ್ವ" : "Garuda Purana Wisdom: 1-Year Journey & The Power of Pinda Dana"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300">
                  <h4 className="font-bold text-xs text-amber-950 dark:text-amber-300 mb-1">
                    🌌 {selectedLang === "kn" ? "ಮರಣದ ನಂತರ ಆತ್ಮದ ಪಯಣ:" : "Soul's Post-Mortem Journey:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {result.garudaWisdom.soulJourneySummary[selectedLang] || result.garudaWisdom.soulJourneySummary.kn}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300">
                  <h4 className="font-bold text-xs text-amber-950 dark:text-amber-300 mb-1">
                    🌾 {selectedLang === "kn" ? "ದಿನನಿತ್ಯದ ಪಿಂಡದ ರಹಸ್ಯ:" : "Mystery of Daily Pinda Dana:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {result.garudaWisdom.pindaDanaMeaning[selectedLang] || result.garudaWisdom.pindaDanaMeaning.kn}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300">
                  <h4 className="font-bold text-xs text-amber-950 dark:text-amber-300 mb-1">
                    🐄 {selectedLang === "kn" ? "ವೈತರಣಿ ನದಿ & ಗೋದಾನ:" : "Vaitarani River & Godana:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {result.garudaWisdom.vaitaraniGodanaImportance[selectedLang] || result.garudaWisdom.vaitaraniGodanaImportance.kn}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300">
                  <h4 className="font-bold text-xs text-amber-950 dark:text-amber-300 mb-1">
                    🕉️ {selectedLang === "kn" ? "ಮೋಕ್ಷ ತತ್ವ & ಪಿತೃ ಆಶೀರ್ವಾದ:" : "Moksha & Ancestral Blessings:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {result.garudaWisdom.mokshaPhilosophy[selectedLang] || result.garudaWisdom.mokshaPhilosophy.kn}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 6: Mahalaya & Tarpana Rules */}
          {activeTab === "mahalaya" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {selectedLang === "kn" ? "ವಾರ್ಷಿಕ ಪಿತೃ ಪಕ್ಷ & ಅಮಾವಾಸ್ಯೆ ನಿಯಮಗಳು" : "Annual Pitru Paksha & Amavasya Protocols"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🪔 {selectedLang === "kn" ? "ಮಹಾಲಯ ಪಕ್ಷ & ಅಮಾವಾಸ್ಯೆ ಪಿತೃ ತರ್ಪಣ ವಿಧಿ" : "Mahalaya Paksha & Amavasya Pitru Tarpana"}
                </h3>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                <strong>{selectedLang === "kn" ? "ಮಹಾಲಯ ಪಕ್ಷದ ಮಹತ್ವ:" : "Mahalaya Paksha Significance:"}</strong> {result.mahalayaRules.mahalayaOverview[selectedLang] || result.mahalayaRules.mahalayaOverview.kn}
              </div>

              <div className="p-4 bg-amber-100/60 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                <strong>{selectedLang === "kn" ? "ಅಮಾವಾಸ್ಯೆ ತರ್ಪಣ ವಿಧಾನ:" : "Amavasya Tarpana Procedure:"}</strong> {result.mahalayaRules.amavasyaTarpanaProcedure[selectedLang] || result.mahalayaRules.amavasyaTarpanaProcedure.kn}
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 space-y-2">
                <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-300">
                  🎁 {selectedLang === "kn" ? "ಪಿತೃ ತರ್ಪಣಕ್ಕೆ ಅತ್ಯಗತ್ಯವಾದ ದಾನ ಪದಾರ್ಥಗಳು:" : "Essential Charity Items for Ancestors:"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  {(result.mahalayaRules.essentialDanaItems[selectedLang] || result.mahalayaRules.essentialDanaItems.kn || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-amber-50 dark:bg-slate-900 p-2 rounded-xl border border-amber-200 dark:border-slate-700">
                      <span>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 7: Gokarna Kshetra Sacred Sevas */}
          {activeTab === "gokarna" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {selectedLang === "kn" ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿ" : "Sri Kshetra Gokarna Mahabaleshwara Sacred Sanctum"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🏛️ {selectedLang === "kn" ? "ಗೋಕರ್ಣ ನಾರಾಯಣಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಮೋಕ್ಷ ಪೂಜೆಗಳು" : "Gokarna Narayanabali, Tripindi Shraddha & Moksha Sevas"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                    🪔 {selectedLang === "kn" ? "ನಾರಾಯಣಬಲಿ ಮಹಾ ಪೂಜೆ" : "Narayanabali Maha Pooja"}
                  </h4>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {result.gokarnaSevas.narayanabaliOverview[selectedLang] || result.gokarnaSevas.narayanabaliOverview.kn}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                    🔱 {selectedLang === "kn" ? "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ" : "Tripindi Shraddha"}
                  </h4>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {result.gokarnaSevas.tripindiShraddhaOverview[selectedLang] || result.gokarnaSevas.tripindiShraddhaOverview.kn}
                  </p>
                </div>
              </div>

              {/* Priest Card with Direct Call */}
              <div className="p-5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-amber-950 dark:text-amber-200 text-sm sm:text-base">
                    🕉️ {result.gokarnaSevas.priestName}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                    {selectedLang === "kn"
                      ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರಾದ್ಧ, ನಾರಾಯಣಬಲಿ & ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆಗಳಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ"
                      : "Direct Vedic consultation for Narayanabali, Tripindi Shraddha, Asthi Visarjana & Gotra Sankalpa at Gokarna."}
                  </p>
                </div>
                <a
                  href={`tel:+91${result.gokarnaSevas.priestPhone}`}
                  className="px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>📞 {result.gokarnaSevas.priestPhone}</span>
                </a>
              </div>
            </Card>
          )}

          {/* TAB 8: AI Consolation & Shanti Mantras */}
          {activeTab === "consolation" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    {selectedLang === "kn" ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ದೈವಿಕ ಸದ್ಗತಿ ಸಂದೇಶ" : "Divine Solace & Shanti Message from Gokarna Kshetra"}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                    ✨ {selectedLang === "kn" ? "ದೈವಿಕ ಸಾಂತ್ವನ ಸಂದೇಶ & ಶಾಂತಿ ಮಂತ್ರಗಳು" : "Divine Consolation & Vedic Shanti Mantras"}
                  </h3>
                </div>
                {result.aiConsolationText && (
                  <AudioPlayerButton
                    text={result.aiConsolationText}
                    lang={selectedLang === "kn" ? "kn-IN" : selectedLang === "hi" ? "hi-IN" : selectedLang === "te" ? "te-IN" : selectedLang === "ta" ? "ta-IN" : "en-US"}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
                  />
                )}
              </div>

              {result.aiConsolationText && (
                <div className="p-5 bg-gradient-to-br from-amber-950/70 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-xl text-white">
                  <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed whitespace-pre-wrap">
                    {sanitizeAIText(result.aiConsolationText)}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering (Fixed & Visible to layout engine at -15000px) */}
      {result && (
        <div
          id="maranottara-pdf-wrapper"
          style={{
            position: "fixed",
            top: "-15000px",
            left: "-15000px",
            width: "794px",
            zIndex: -9999,
            pointerEvents: "none"
          }}
        >
          <MaranottaraPdfTemplate result={result} lang={selectedLang} />
        </div>
      )}
    </div>
  );
};
