import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RASHIS, type Rashi } from "../core/AstroTypes";
import { calculateVarshaBavishya, type VarshaPrediction } from "../core/VarshaBavishyaEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";

export default function VarshaBavishyaPage() {
  const { t, i18n } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRashi, setSelectedRashi] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<VarshaPrediction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop audio if component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayAudio = () => {
    if (!prediction) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const fullText = prediction.paragraphs.flat().map(p => t(p)).join(". ");
    const utterance = new SpeechSynthesisUtterance(fullText);

    utterance.lang = i18n.language === "kn" ? "kn-IN" :
      i18n.language === "hi" ? "hi-IN" :
        i18n.language === "te" ? "te-IN" :
          i18n.language === "ta" ? "ta-IN" : "en-US";

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleGenerate = () => {
    if (selectedRashi === null) return;

    setIsGenerating(true);
    setPrediction(null);

    // Simulate a brief calculation delay for UX
    setTimeout(() => {
      const calcPrediction = calculateVarshaBavishya(selectedYear, selectedRashi);
      setPrediction(calcPrediction);
      setIsGenerating(false);
    }, 800);
  };

  const handleDownloadPdf = async () => {
    if (!contentRef.current || !prediction) return;

    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.75);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Varsha_Bavishya_${prediction.year}_${prediction.rashi.english}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
    }
  };

  const domainIcons = ["✨", "💼", "🩺", "🕉️"];
  const domainTitles = [
    t("varsha.section_overview", "Cosmic Overview"),
    t("varsha.section_career", "Career & Finance"),
    t("varsha.section_health", "Health & Relationships"),
    t("varsha.section_remedies", "Spiritual Remedies")
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-amber-500/10 bg-[#fffdf9]/90 shadow-md">
        <h2 className="text-xl font-extrabold text-indigo-950 mb-2">
          {t("varsha.title", "🔮 Varsha Bavishya")}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {t("varsha.subtitle", "Discover your detailed astrological destiny for the year.")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year Selector */}
          <div>
            <label className="block text-xs font-bold text-indigo-900/60 uppercase tracking-wider mb-2">
              {t("varsha.select_year", "Select Year")}
            </label>
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedYear(y => y - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center text-xl font-extrabold text-indigo-950">
                {selectedYear}
              </div>
              <button
                onClick={() => setSelectedYear(y => y + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Rashi Selector */}
          <div>
            <label className="block text-xs font-bold text-indigo-900/60 uppercase tracking-wider mb-2">
              {t("varsha.select_rashi", "Select Your Rashi")}
            </label>
            <select
              className="w-full bg-white p-4 rounded-xl border border-slate-200 text-sm font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer appearance-none"
              value={selectedRashi !== null ? selectedRashi : ""}
              onChange={(e) => setSelectedRashi(Number(e.target.value))}
            >
              <option value="" disabled>-- {t("varsha.select_rashi", "Select Your Rashi")} --</option>
              {RASHIS.map((rashi, idx) => (
                <option key={idx} value={idx}>
                  {t(`rashi.${rashi.sanskrit}`, rashi.sanskrit)} ({rashi.english})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={selectedRashi === null || isGenerating}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-indigo-950 hover:bg-indigo-900 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          {isGenerating ? t("varsha.generating", "Consulting the stars...") : t("varsha.generate_btn", "Generate Prediction")}
        </button>
      </Card>

      {isGenerating && (
        <Card className="flex flex-col items-center justify-center py-20 bg-[#fffdf9]/50 border-amber-500/10">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-bold text-indigo-900/80 animate-pulse">
            Analyzing planetary transits for {selectedYear}...
          </p>
        </Card>
      )}

      {!isGenerating && prediction && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Action Bar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handlePlayAudio}
              className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-colors ${isSpeaking ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span> {isSpeaking ? t("varsha.stop_audio", "Stop Audio") : t("varsha.play_audio", "Play Audio")}
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <span>📥</span> {t("varsha.download_pdf", "Download PDF")}
            </button>
          </div>

          {/* Printable Report Section */}
          <div ref={contentRef} className="space-y-6 bg-[#fffdf9] p-4 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-center mb-8 pb-6 border-b border-amber-500/20">
              <h1 className="text-4xl font-black text-indigo-950 mb-2">{prediction.year}</h1>
              <h2 className="text-xl font-bold text-amber-600">
                {t(`rashi.${prediction.rashi.sanskrit}`, prediction.rashi.sanskrit)}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prediction.paragraphs.map((paraSection, i) => (
                <div key={i} className="rounded-2xl border border-amber-500/10 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-lg">
                      {domainIcons[i] || "🌟"}
                    </span>
                    <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
                      {domainTitles[i]}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {paraSection.map((p, j) => (
                      <p key={j} className="text-sm leading-relaxed text-slate-700 text-left">
                        {t(p)}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400 italic pt-4 border-t border-slate-100">
              Generated dynamically based on planetary transits.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
