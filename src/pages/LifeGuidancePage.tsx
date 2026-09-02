import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import {
  executeLifeGuidanceCalculation,
  askCustomLifeQuestion,
  LifeGuidanceResult,
  LifeGuidanceTabKey
} from "../features/lifeguidance/lifeGuidanceEngine";
import { getLifeGuidanceText } from "../features/lifeguidance/lifeGuidanceLocale";
import { LifeGuidancePdfTemplate } from "../components/lifeguidance/LifeGuidancePdfTemplate";
import { PREDEFINED_PRIESTS, getPriestProfile } from "../features/seva/sevaPriestDirectory";
import { sanitizeAIText } from "../utils/textFormatter";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
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
  const session = useKundliViewerStore((state) => state.session);

  const [selectedLang, setSelectedLang] = useState<string>("kn");
  const t = (k: string) => getLifeGuidanceText(k, selectedLang);

  const effectiveName = initialInput?.personName || session?.input?.name || "";
  const effectiveDob = initialInput?.dob || session?.birthDateYmd || session?.input?.birthDate || "";
  const effectiveTob = initialInput?.tob || session?.birthTimeHm || session?.input?.birthTime || "12:00";
  const effectiveGender = initialInput?.gender || (session?.input as any)?.gender || "Male";

  const [personName, setPersonName] = useState<string>(effectiveName);
  const [dob, setDob] = useState<string>(effectiveDob);
  const [tob, setTob] = useState<string>(effectiveTob);
  const [gender, setGender] = useState<string>(effectiveGender);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<LifeGuidanceResult | null>(null);

  React.useEffect(() => {
    if (session) {
      if (!personName && session.input?.name) setPersonName(session.input.name);
      if (!dob && (session.birthDateYmd || session.input?.birthDate)) {
        setDob(session.birthDateYmd || session.input.birthDate);
      }
      if (session.birthTimeHm || session.input?.birthTime) {
        setTob(session.birthTimeHm || session.input.birthTime);
      }
    }
  }, [session]);

  // Auto-calculate if initialInput with DOB is provided
  React.useEffect(() => {
    if (initialInput?.dob && !result && !isProcessing) {
      setIsProcessing(true);
      executeLifeGuidanceCalculation(
        {
          personName: initialInput.personName || "Devotee",
          dob: initialInput.dob,
          tob: initialInput.tob || "12:00",
          gender: initialInput.gender || "Male",
          lang: selectedLang
        },
        activeKey
      ).then((res) => {
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
      const calcResult = await executeLifeGuidanceCalculation(
        {
          personName: personName.trim() || t("namePlaceholder"),
          dob,
          tob: tob || "12:00",
          gender,
          lang: selectedLang
        },
        activeKey
      );

      setResult(calcResult);
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 400);
  };

  // Web Speech API Microphone Toggle with Auto-Clear Logic
  const handleMicToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        selectedLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ."
          : "Speech recognition is not supported in your browser. Please type your question."
      );
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

      const canvas = await html2canvas(element, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: "#FFFDF7",
        logging: false
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.88);

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      pdf.save(`Baggona_Life_Guidance_${result.personName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(
        selectedLang === "kn"
          ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ."
          : "Failed to generate PDF report."
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 pb-16 pt-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Hero Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-6 text-white shadow-xl text-center relative overflow-hidden">
        <div className="inline-block rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 mb-2">
          {t("sanctuaryPill")}
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-amber-200 tracking-wide drop-shadow mb-2">
          {t("pageTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
          {t("pageSubtitle")}
        </p>

        {/* Language Picker */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            { code: "kn", label: "ಕನ್ನಡ" },
            { code: "en", label: "English" },
            { code: "hi", label: "हिन्दी" },
            { code: "te", label: "తెలుగు" },
            { code: "ta", label: "தமிழ்" }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setSelectedLang(item.code)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                selectedLang === item.code
                  ? "bg-amber-400 text-amber-950 border-amber-300 shadow-md scale-105"
                  : "bg-amber-900/70 text-amber-200 border-amber-700 hover:bg-amber-800"
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
          <span>{t("formHeader")}</span>
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {t("nameLabel")}
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {t("dobLabel")}
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
                {t("tobLabel")}
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
                {t("genderLabel")}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              >
                <option value="Male">{t("genderMale")}</option>
                <option value="Female">{t("genderFemale")}</option>
                <option value="Other">{t("genderOther")}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !dob}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 text-sm font-bold shadow-md hover:from-amber-800 hover:to-amber-950 disabled:opacity-50 transition"
          >
            {isProcessing ? t("calculatingBtn") : t("calculateBtn")}
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
              {t("loaderTitle")}
            </h4>
            <p className="text-xs text-amber-300/90 max-w-xs font-semibold">
              {t("loaderSubtitle")}
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
                  {t("priestSanctuaryHeader")}
                </div>
                <div className="font-serif text-base font-bold text-amber-100 flex items-center gap-2 justify-center sm:justify-start">
                  <span>{getPriestProfile(selectedPriestId).sealSymbol || "🔱"}</span>
                  <span>
                    {(getPriestProfile(selectedPriestId).name as Record<string, string>)[selectedLang] ||
                      getPriestProfile(selectedPriestId).name.kn}{" "}
                    (
                    {(getPriestProfile(selectedPriestId).title as Record<string, string>)[selectedLang] ||
                      getPriestProfile(selectedPriestId).title.kn}
                    )
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {t("priestConsultDesc")}
                </p>
              </div>

              <a
                href={`tel:${getPriestProfile(selectedPriestId).phone || "+919972339362"}`}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-xs font-extrabold text-amber-950 shadow-lg hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-2 shrink-0"
              >
                <span>📞</span>
                <span>{getPriestProfile(selectedPriestId).phone || "+91 99723 39362"}</span>
              </a>
            </div>

            {/* Priest Dropdown Selector */}
            <div className="pt-2 border-t border-amber-800/80">
              <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🪔</span>
                <span>{t("selectPriestLabel")}</span>
              </label>
              <select
                value={selectedPriestId}
                onChange={(e) => setSelectedPriestId(e.target.value)}
                className="w-full rounded-xl border border-amber-400/80 bg-amber-950/90 px-3.5 py-2 text-xs font-bold text-amber-100 shadow-inner focus:border-amber-300 focus:outline-none"
              >
                {PREDEFINED_PRIESTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.name as Record<string, string>)[selectedLang] || p.name.kn} —{" "}
                    {(p.title as Record<string, string>)[selectedLang] || p.title.kn} ({p.phone || "+91 99723 39362"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Natal Kundli Snapshot Card */}
          <Card className="border border-amber-300 bg-amber-50/60 p-4 shadow-sm">
            <div className="text-xs font-extrabold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>🌟</span>
              <span>{selectedLang === "kn" ? "ಜಾತಕರ ಜನನ ಕುಂಡಲಿ ಸಾರಾಂಶ" : "Devotee Natal Chart Snapshot"}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span className="text-amber-800 block font-semibold">{selectedLang === "kn" ? "ಲಗ್ನ:" : "Lagna:"}</span>
                <strong className="text-amber-950 font-bold">{result.lagna[selectedLang] || result.lagna.kn}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span className="text-amber-800 block font-semibold">{selectedLang === "kn" ? "ರಾಶಿ:" : "Rashi:"}</span>
                <strong className="text-amber-950 font-bold">{result.rashi[selectedLang] || result.rashi.kn}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span className="text-amber-800 block font-semibold">{selectedLang === "kn" ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</span>
                <strong className="text-amber-950 font-bold">{result.nakshatra[selectedLang] || result.nakshatra.kn}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span className="text-amber-800 block font-semibold">{selectedLang === "kn" ? "ದಶಾ:" : "Dasha:"}</span>
                <strong className="text-amber-950 font-bold">{result.dasha[selectedLang] || result.dasha.kn}</strong>
              </div>
            </div>
          </Card>

          {/* Tabs Bar & PDF Download Button */}
          <Card className="border border-amber-300 bg-white p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "career", icon: "💼", label: t("tabCareer") },
                { key: "relationship", icon: "💞", label: t("tabRelationship") },
                { key: "health", icon: "🏥", label: t("tabHealth") },
                { key: "children", icon: "👶", label: t("tabChildren") },
                { key: "custom", icon: "🎙️", label: t("tabCustom") }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as LifeGuidanceTabKey)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                    activeTab === tab.key
                      ? "bg-amber-800 text-white border-amber-900 shadow"
                      : "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
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
              <span>{isGeneratingPdf ? t("generatingPdfBtn") : t("downloadPdfBtn")}</span>
            </button>
          </Card>

          {/* TAB 5: Custom Question & Voice Clarification UI */}
          {activeTab === "custom" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-3">
                <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>{t("customTitle")}</span>
                </h3>
              </div>

              <form onSubmit={handleAskCustomQuestion} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={t("customPlaceholder")}
                    className="w-full rounded-2xl border-2 border-amber-300 bg-white p-4 pr-12 text-xs font-semibold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
                  />
                  {/* Microphone Toggle Button with Auto-Clear */}
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    title={t("micTitle")}
                    className={`absolute right-3 top-3 p-2 rounded-xl text-lg transition ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse shadow-lg"
                        : "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
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
                  {isAskingCustom ? t("askingBtn") : t("askBtn")}
                </button>
              </form>

              {/* Custom Q&A Answer Card */}
              {result.customQnA && (
                <div className="rounded-2xl border-2 border-amber-400 bg-white p-5 space-y-3 shadow-md">
                  <div className="text-xs font-extrabold text-amber-950 border-b border-amber-200 pb-2">
                    {t("questionPrefix")} {result.customQnA.question}
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
                  <span>
                    {activeTab === "career"
                      ? "💼"
                      : activeTab === "relationship"
                      ? "💞"
                      : activeTab === "health"
                      ? "🏥"
                      : "👶"}
                  </span>
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
                  <strong>{t("keyAgesLabel")}</strong>{" "}
                  {result[activeTab].keyAges.join(", ")} {t("yearsSuffix")}
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 font-semibold text-amber-950">
                  <strong>{t("favorableDirectionsLabel")}</strong>{" "}
                  {result[activeTab].favorableDirections[selectedLang] ||
                    result[activeTab].favorableDirections.kn}
                </div>
              </div>

              {(() => {
                const activeData = result[activeTab];
                const pujaDetail = activeData?.gokarnaPujaDetail;
                const code = selectedLang;
                const pujaName =
                  pujaDetail?.pujaName?.[code] ||
                  pujaDetail?.pujaName?.kn ||
                  "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ವಿಶೇಷ ವೈದಿಕ ಶಾಂತಿ & ಮಹಾ ರುದ್ರ ಹವನ";
                const whyText =
                  pujaDetail?.whyRequired?.[code] ||
                  pujaDetail?.whyRequired?.kn ||
                  "ಜಾತಕದ ಪಿತೃ ದೋಷ, ಕಾಲಸರ್ಪ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಕುಜ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸೇವೆ ಅತ್ಯಗತ್ಯ.";
                const whatText =
                  pujaDetail?.whatSignificance?.[code] ||
                  pujaDetail?.whatSignificance?.kn ||
                  "ಗೋಕರ್ಣವು ಸಿದ್ಧ ಮುಕ್ತಿ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿನ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸುವ ಹೋಮ ಕೃತ್ಯದಿಂದ ಶಾಪಗಳು ವಿಮೋಚನೆಯಾಗಲಿವೆ.";
                const howText =
                  pujaDetail?.howTransforms?.[code] ||
                  pujaDetail?.howTransforms?.kn ||
                  "ಸಕಲ ಪ್ರತಿಬಂಧಕಗಳು ದೂರವಾಗಿ ಉದ್ಯೋಗ ಪ್ರಗತಿ, ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.";

                return (
                  <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 p-5 text-xs sm:text-sm space-y-2.5 shadow-md">
                    <div className="font-extrabold text-amber-950 flex items-center gap-2 text-sm sm:text-base border-b border-amber-300 pb-2">
                      <span className="text-lg">🪔</span>
                      <span>{pujaName}</span>
                    </div>
                    <div className="space-y-2 text-amber-900 leading-relaxed font-medium">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-950 font-bold block mb-0.5">
                          {t("whyRequiredLabel")}
                        </strong>
                        {whyText}
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-950 font-bold block mb-0.5">
                          {t("whatSignificanceLabel")}
                        </strong>
                        {whatText}
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-950 font-bold block mb-0.5">
                          {t("howTransformsLabel")}
                        </strong>
                        {howText}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}
        </div>
      )}

      {/* Offscreen Container for PDF */}
      {result && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <LifeGuidancePdfTemplate
            result={result}
            activeTab={activeTab}
            lang={selectedLang}
            priest={getPriestProfile(selectedPriestId)}
          />
        </div>
      )}
    </div>
  );
};
