import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import { executeMaranottaraCalculation, generateMaranottaraAIConsolation, MaranottaraResult, MasikaDurationYears } from "../features/maranottara/maranottaraEngine";
import { useAppStore } from "../stores/appStore";
import { MaranottaraPdfTemplate } from "../components/maranottara/MaranottaraPdfTemplate";
import { sanitizeAIText } from "../utils/textFormatter";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const MaranottaraPage: React.FC = () => {
  const activeKey = useAppStore((state) => state.geminiApiKey);
  const [selectedLang, setSelectedLang] = useState<string>("kn");
  const isKn = selectedLang === "kn";

  const [personName, setPersonName] = useState<string>("");
  const [demiseDate, setDemiseDate] = useState<string>("");
  const [demiseTime, setDemiseTime] = useState<string>("");
  const [location, setLocation] = useState<string>("Gokarna, Karnataka");
  const [yearsCount, setYearsCount] = useState<MasikaDurationYears>(1);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<MaranottaraResult | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "dosha">("schedule");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demiseDate) return;

    setIsProcessing(true);

    setTimeout(async () => {
      const calcResult = executeMaranottaraCalculation({
        personName: personName.trim() || (isKn ? "ಶ್ರೀಯುತ ಮೃತ ಆತ್ಮ" : "Deceased Soul"),
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
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1000);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);

    try {
      const element = document.getElementById("maranottara-pdf-container");
      if (!element) {
        throw new Error("PDF container element not found");
      }

      const canvas = await html2canvas(element, {
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

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`Baggona_Maranottara_Masika_${result.personName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(isKn ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ." : "Failed to generate PDF report. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 pb-16 pt-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Hero Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-6 text-white shadow-xl text-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl text-amber-200 pointer-events-none select-none">
          🪔
        </div>
        <div className="inline-block rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 mb-2">
          ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಧರ್ಮಜ್ಞ ಪದ್ಧತಿ ॥
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-amber-200 tracking-wide drop-shadow mb-2">
          {isKn ? "🪔 ಮರಣೋತ್ತರ ಹಾಗೂ ಶ್ರಾದ್ಧ ಮಾಸಿಕ ಗಣಕ" : "Maranottara & Shraddha Masika Calculator"}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
          {isKn
            ? "ಮರಣ ಹೊಂದಿದ ದಿನಾಂಕ ಹಾಗೂ ಸಮಯದ ಆಧಾರದಲ್ಲಿ ಪ್ರಥಮ ಮಾಸಿಕದಿಂದ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧದವರೆಗಿನ (೧ ರಿಂದ ೫ ವರ್ಷಗಳ) ನಿಖರ ಮಾಸಿಕ ತಿಥಿ ದಿನಾಂಕಗಳು ಹಾಗೂ ಮರಣ ಸಮಯ ದೋಷ ಶಮನ ಪೂಜಾ ವಿವರಗಳು."
            : "Accurate monthly Masika Tithi schedule for 1 to 5 years and Demise Time Dosha Nivarana remedies based on Gokarna Kshetra Shastra."}
        </p>

        {/* Full Language Picker */}
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
          <span>🕯️</span>
          <span>{isKn ? "ಮೃತರ ವಿವರಗಳು & ಲೆಕ್ಕಾಚಾರ ಮಾಹಿತಿ ನಮೂದಿಸಿ" : "Enter Deceased Person & Demise Details"}</span>
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deceased Person Name */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಮೃತರ ಹೆಸರು (Deceased Person Name):" : "Deceased Person Name:"}
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={isKn ? "ಉದಾ: ಶ್ರೀಯುತ ರಾಮಕೃಷ್ಣ ಭಟ್" : "e.g., Sri Ramakrishna Bhat"}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            {/* Date of Demise */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಮರಣ ಹೊಂದಿದ ದಿನಾಂಕ (Date of Demise): *" : "Date of Demise: *"}
              </label>
              <input
                type="date"
                required
                value={demiseDate}
                onChange={(e) => setDemiseDate(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            {/* Time of Demise */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಮರಣ ಹೊಂದಿದ ಸಮಯ (Time of Demise - Optional):" : "Time of Demise (Optional):"}
              </label>
              <input
                type="time"
                value={demiseTime}
                onChange={(e) => setDemiseTime(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
              <span className="text-[10px] text-amber-700 italic">
                {isKn ? "* ಸಮಯ ನೀಡಿದರೆ ಮರಣ ದೋಷ & ಪರಿಹಾರ ಗಣನೆ ಸಾಧ್ಯವಾಗುತ್ತದೆ." : "* Time helps analyze Demise Dosha & Remedies."}
              </span>
            </div>

            {/* Location / Pin Code */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಸ್ಥಳ / ಪಿನ್ ಕೋಡ್ (City / Pin Code):" : "Location / City / Pin Code:"}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isKn ? "ಉದಾ: Gokarna, 560001" : "e.g. Gokarna, 560001"}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 focus:border-amber-600 focus:outline-none"
              />
            </div>

            {/* Duration Years Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                {isKn ? "ಮಾಸಿಕ ಲೆಕ್ಕಾಚಾರದ ಅವಧಿ (Calculation Duration Years):" : "Calculation Duration Years:"}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as MasikaDurationYears[]).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYearsCount(y)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      yearsCount === y
                        ? "bg-amber-800 text-white border-amber-900 shadow"
                        : "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {y} {isKn ? "ವರ್ಷ" : "Yr"} ({y * 12} {isKn ? "ಮಾಸಿಕ" : "Mos"})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !demiseDate}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 text-sm font-bold shadow-md hover:from-amber-800 hover:to-amber-950 disabled:opacity-50 transition"
          >
            {isProcessing ? (isKn ? "⌛ ಶ್ರಾದ್ಧ ಮಾಸಿಕ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..." : "Calculating Schedule...") : (isKn ? "🪔 ಶ್ರಾದ್ಧ ಮಾಸಿಕ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ" : "Calculate Masika Schedule")}
          </button>
        </form>
      </Card>

      {/* 100% Fixed Viewport Full-Screen Loader Backdrop Blur Overlay */}
      {isProcessing && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh", zIndex: 99999 }}
          className="fixed inset-0 w-screen h-screen bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/95 via-amber-900/95 to-amber-950/95 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-sm w-full">
            <div className="text-5xl text-amber-300 mb-4 animate-bounce">🪔</div>
            <h4 className="font-serif text-base font-bold text-amber-200 mb-2 animate-pulse">
              {isKn ? "ಮರಣೋತ್ತರ ಮಾಸಿಕ ತಿಥಿ ಲೆಕ್ಕಾಚಾರ ನಡೆಯುತ್ತಿದೆ..." : "Calculating Monthly Masika Schedule..."}
            </h4>
            <p className="text-xs text-amber-300/90 max-w-xs font-semibold">
              {isKn ? "ಮರಣ ದಿನಾಂಕ, ತಿಥಿ ಹಾಗೂ ನಕ್ಷತ್ರದ ಸನ್ನಿವೇಶದಿಂದ ಪಂಚಕ ದೋಷ ಹಾಗೂ ಮಾಸಿಕ ಕೋಷ್ಟಕ ಗಣನೆ..." : "Computing lunar tithi rhythm & demise dosha remedies..."}
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div ref={resultsRef} className="space-y-6 animate-fade-in">
          {/* Header Action Bar & Tabs */}
          <Card className="border border-amber-300 bg-white p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                  activeTab === "schedule" ? "bg-amber-800 text-white border-amber-900 shadow" : "bg-amber-50 text-amber-950 border-amber-300"
                }`}
              >
                📅 {isKn ? "ಮಾಸಿಕ ಶ್ರಾದ್ಧ ವೇಳಾಪಟ್ಟಿ" : "Masika Schedule Grid"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dosha")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                  activeTab === "dosha" ? "bg-amber-800 text-white border-amber-900 shadow" : "bg-amber-50 text-amber-950 border-amber-300"
                }`}
              >
                🔱 {isKn ? "ಮರಣ ದೋಷ & ಶಾಂತಿ ಪೂಜೆ" : "Demise Dosha & Remedies"}
              </button>
            </div>

            {/* PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
            >
              <span>📄</span>
              <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಮಾಸಿಕ ವೇಳಾಪಟ್ಟಿ PDF ಡೌನ್‌ಲೋಡ್" : "Download Masika PDF Report")}</span>
            </button>
          </Card>

          {/* TAB 1: Masika Schedule Grid */}
          {activeTab === "schedule" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-4">
              {/* AI Spiritual Consolation Card */}
              {result.aiConsolationText && (
                <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-4 shadow-sm space-y-1.5">
                  <h4 className="font-bold text-xs text-amber-950 flex items-center gap-2">
                    <span>🕉️</span>
                    <span>{isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಧರ್ಮಜ್ಞ ದೈವಿಕ ಸದ್ಗತಿ ಸಂದೇಶ & ಮಂತ್ರ" : "Gokarna Spiritual Consolation & Mantra"}</span>
                  </h4>
                  <p className="text-xs text-amber-900 font-medium leading-relaxed whitespace-pre-wrap">
                    {sanitizeAIText(result.aiConsolationText)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>📅</span>
                  <span>{isKn ? `ಮೃತರ ಶ್ರಾದ್ಧ ಮಾಸಿಕ ಕೋಷ್ಟಕ (${result.yearsCount} ವರ್ಷಗಳು)` : `Monthly Masika Schedule (${result.yearsCount} Years)`}</span>
                </h3>
                <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                  {result.personName} · {result.demiseTithi[selectedLang] || result.demiseTithi.kn}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.masikaSchedule.map((item) => (
                  <div
                    key={item.monthIndex}
                    className={`rounded-2xl p-4 border transition ${
                      item.isVarshikaShraddha
                        ? "bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-amber-400 shadow-md"
                        : "bg-white border-amber-200/90 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-amber-950 mb-1 border-b border-amber-200/60 pb-1.5">
                      <span>{item.masikaName[selectedLang] || item.masikaName.kn}</span>
                      <span className="text-emerald-800">M{item.monthIndex}</span>
                    </div>

                    <div className="text-sm font-black text-amber-900 my-1 flex items-center gap-1.5">
                      <span>📆</span>
                      <span>{item.formattedDateStr[selectedLang] || item.formattedDateStr.kn}</span>
                      <span className="text-xs font-bold text-amber-700">({item.dayOfWeek[selectedLang] || item.dayOfWeek.kn})</span>
                    </div>

                    <div className="text-xs text-amber-950/90 font-medium space-y-0.5 mt-2">
                      <div><strong>{isKn ? "ತಿಥಿ:" : "Tithi:"}</strong> {item.tithiName[selectedLang] || item.tithiName.kn}</div>
                      <div><strong>{isKn ? "ಪಕ್ಷ:" : "Paksha:"}</strong> {item.paksha[selectedLang] || item.paksha.kn}</div>
                      <div className="text-[11px] text-amber-800 italic mt-1 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/60">
                        {item.ritualNotes[selectedLang] || item.ritualNotes.kn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 2: Demise Time Dosha & Nivarana Remedies */}
          {activeTab === "dosha" && (
            <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>🔱</span>
                  <span>{isKn ? "ಮರಣ ಸಮಯ ದೋಷ ಗಣನೆ & ಗೋಕರ್ಣ ಶಾಂತಿ ಪೂಜೆಗಳು" : "Demise Time Dosha & Gokarna Shanti Remedies"}</span>
                </h3>
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-4 text-xs font-semibold text-amber-950 leading-relaxed">
                {sanitizeAIText(result.doshaAnalysis.doshaSummary[selectedLang] || result.doshaAnalysis.doshaSummary.kn)}
              </div>

              <div className="space-y-3">
                {result.doshaAnalysis.recommendedPoojas.map((pooja, idx) => (
                  <div key={idx} className="rounded-2xl border border-amber-300 bg-white p-4 shadow-sm space-y-1.5">
                    <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                      <span>🪔</span>
                      <span>{pooja.title[selectedLang] || pooja.title.kn}</span>
                    </h4>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      {pooja.description[selectedLang] || pooja.description.kn}
                    </p>
                    <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60 font-semibold">
                      <strong>{isKn ? "ಶ್ರೇಷ್ಠ ದಾನ ಪದಾರ್ಥಗಳು:" : "Recommended Dana Items:"}</strong> {pooja.danaItems[selectedLang] || pooja.danaItems.kn}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering */}
      {result && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <MaranottaraPdfTemplate result={result} lang={selectedLang} />
        </div>
      )}
    </div>
  );
};
