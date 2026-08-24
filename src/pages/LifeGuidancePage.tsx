import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import { executeLifeGuidanceCalculation, LifeGuidanceResult, LifeGuidanceTabKey } from "../features/lifeguidance/lifeGuidanceEngine";
import { LifeGuidancePdfTemplate } from "../components/lifeguidance/LifeGuidancePdfTemplate";
import { sanitizeAIText } from "../utils/textFormatter";
import { useAppStore } from "../stores/appStore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const LifeGuidancePage: React.FC = () => {
  const activeKey = useAppStore((state) => state.geminiApiKey);

  const [selectedLang, setSelectedLang] = useState<string>("kn");
  const isKn = selectedLang === "kn";

  const [personName, setPersonName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [tob, setTob] = useState<string>("12:00");
  const [gender, setGender] = useState<string>("Male");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<LifeGuidanceResult | null>(null);
  const [activeTab, setActiveTab] = useState<LifeGuidanceTabKey>("career");
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

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);

    try {
      const element = document.getElementById("life-guidance-pdf-container");
      if (!element) throw new Error("PDF container not found");

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#FFFDF7" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
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

      {/* Results View with 4 Tabs */}
      {result && (
        <div ref={resultsRef} className="space-y-6 animate-fade-in">
          <Card className="border border-amber-300 bg-white p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "career", icon: "💼", label: isKn ? "ವೃತ್ತಿ & ಧನ" : "Career" },
                { key: "relationship", icon: "💞", label: isKn ? "ದಾಂಪತ್ಯ & ಕುಟುಂಬ" : "Relationship" },
                { key: "health", icon: "🏥", label: isKn ? "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ" : "Health" },
                { key: "children", icon: "👶", label: isKn ? "ಸಂತಾನ ಭಾಗ್ಯ" : "Children" }
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
          <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-6 shadow-md space-y-4">
            <div className="border-b border-amber-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
                <span>{activeTab === "career" ? "💼" : activeTab === "relationship" ? "💞" : activeTab === "health" ? "🏥" : "👶"}</span>
                <span>{result[activeTab].title[selectedLang] || result[activeTab].title.kn}</span>
              </h3>
            </div>

            <div className="rounded-2xl border border-amber-300 bg-white p-5 text-sm text-amber-950 leading-relaxed font-medium whitespace-pre-wrap shadow-sm">
              {sanitizeAIText(result[activeTab].narrativeText)}
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
        </div>
      )}

      {/* Offscreen Container for PDF */}
      {result && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <LifeGuidancePdfTemplate result={result} lang={selectedLang} />
        </div>
      )}
    </div>
  );
};
