import React, { useState } from "react";
import Card from "../ui/Card";
import type { PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import { sanitizeAIText } from "../../utils/textFormatter";
import SouthIndianChart from "../kundli/SouthIndianChart";
import { PalmTimelineDiagram } from "./PalmTimelineDiagram";

export type PalmReadingResultViewProps = {
  result: PalmReadingResult;
  devoteeName: string;
  gotra?: string;
  lang: string;
  onDownloadPdf: () => void;
  onDownloadPalmImage: () => void;
  onDownloadChartImage: () => void;
  isGeneratingPdf?: boolean;
  messages: Array<{ id: string; sender: "user" | "priest"; text: string; timestamp: string }>;
  onSendFollowUp: (query: string) => void;
  isProcessingFollowUp?: boolean;
};

export const PalmReadingResultView: React.FC<PalmReadingResultViewProps> = ({
  result,
  devoteeName,
  gotra,
  lang,
  onDownloadPdf,
  onDownloadPalmImage,
  onDownloadChartImage,
  isGeneratingPdf = false,
  messages,
  onSendFollowUp,
  isProcessingFollowUp = false
}) => {
  const isKn = lang === "kn";
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isKn
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ (Voice Input) ಅನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಬರೆದು ಟೈಪ್ ಮಾಡಿ."
          : "Voice input is not supported in this browser. Please type your question."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        lang === "kn"
          ? "kn-IN"
          : lang === "hi"
          ? "hi-IN"
          : lang === "te"
          ? "te-IN"
          : lang === "ta"
          ? "ta-IN"
          : "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setFollowUpQuery(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || isProcessingFollowUp) return;
    onSendFollowUp(followUpQuery.trim());
    setFollowUpQuery("");
  };

  const ms = result.lifeStageMilestones;
  const cleanPrediction = sanitizeAIText(result.aiPrediction);

  return (
    <div className="space-y-6">
      {/* 🌟 Top Divine Revelation Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-900 via-amber-950 to-slate-950 p-5 sm:p-6 text-amber-50 shadow-2xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
              <span>॥ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸಿದ್ಧ ಸಾಮುದ್ರಿಕ ದರ್ಶನ ॥</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-amber-100 flex items-center gap-2">
              <span>✋</span>
              <span>{result.verdictTitle[lang] || result.verdictTitle.kn}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-amber-200/90 font-semibold">
              <span>👤 {devoteeName}</span>
              {gotra && <span>· 🪔 {gotra}</span>}
              <span>· {result.handSideLabel[lang] || result.handSideLabel.en}</span>
              <span>· 🌾 {result.chironomyHandType.element[lang] || result.chironomyHandType.element.kn}</span>
              <span>· 👁️ {result.thumbAnalysis.yavaSign[lang] || result.thumbAnalysis.yavaSign.kn}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-b from-amber-600/30 to-amber-900/60 px-4 py-2 text-center shadow-inner">
              <div className="text-[10px] uppercase font-bold text-amber-300">ಸಾಮುದ್ರಿಕ ಬಲ</div>
              <div className="text-xl font-black text-amber-100">{result.overallScore}%</div>
            </div>

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-4 py-3 text-xs sm:text-sm font-extrabold text-amber-950 shadow-lg hover:from-amber-400 hover:to-orange-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>📄</span>
              <span>{isGeneratingPdf ? (isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating...") : (isKn ? "೨-ಪುಟದ PDF ವರದಿ" : "Download 2-Page PDF")}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Row on Mobile */}
        <div className="mt-4 pt-3 border-t border-amber-500/30 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownloadPalmImage}
            className="rounded-xl border border-amber-400/40 bg-amber-900/40 hover:bg-amber-800/60 px-3 py-1.5 text-xs font-bold text-amber-200 transition flex items-center gap-1.5"
          >
            <span>🖼️</span>
            <span>{isKn ? "ಹಸ್ತ ಫೋಟೋ ಸೇವ್" : "Save Photo"}</span>
          </button>
          <button
            type="button"
            onClick={onDownloadChartImage}
            className="rounded-xl border border-amber-400/40 bg-amber-900/40 hover:bg-amber-800/60 px-3 py-1.5 text-xs font-bold text-amber-200 transition flex items-center gap-1.5"
          >
            <span>📈</span>
            <span>{isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್" : "Save Chart"}</span>
          </button>
        </div>
      </div>

      {/* 📜 Visual Life Event Timeline Diagram */}
      <PalmTimelineDiagram
        personName={devoteeName}
        lang={lang}
        handSide={result.handSide}
      />

      {/* 🔮 Natal Janma Kundali Sync (If Generated) */}
      {result.kundliData && (
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-100/80 via-white to-orange-100/70 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2">
            <h3 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>🔮</span>
              <span>{isKn ? "ಜನನ ಕುಂಡಲಿ ಹಾಗೂ ಸಾಮುದ್ರಿಕ ರೇಖಾ ಸಮನ್ವಯ (Janma Kundali Sync)" : "Janma Kundali & Palmistry Synchronization"}</span>
            </h3>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
              Baggona Vedic Core
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-xl bg-white p-2.5 border border-amber-200 shadow-2xs">
              <span className="text-amber-800 font-bold block text-[11px]">🏛️ {isKn ? "ಲಗ್ನ (ಅಂಶ):" : "Lagna:"}</span>
              <span className="text-emerald-900 font-extrabold text-sm">{result.kundliData.lagna}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-amber-200 shadow-2xs">
              <span className="text-amber-800 font-bold block text-[11px]">🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"}</span>
              <span className="text-amber-950 font-extrabold text-sm">{result.kundliData.rashi}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-amber-200 shadow-2xs">
              <span className="text-amber-800 font-bold block text-[11px]">⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</span>
              <span className="text-amber-950 font-extrabold text-sm">{result.kundliData.nakshatra}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-amber-200 shadow-2xs">
              <span className="text-amber-800 font-bold block text-[11px]">🔥 {isKn ? "ಮಾಂದಿ:" : "Maandi:"}</span>
              <span className="text-rose-900 font-extrabold text-sm">{result.kundliData.maandi}</span>
            </div>
          </div>

          {result.kundliData.kundliOutput && (
            <div className="pt-2 flex justify-center">
              <SouthIndianChart
                kundli={result.kundliData.kundliOutput}
                personName={devoteeName}
                gothra={gotra}
              />
            </div>
          )}
        </Card>
      )}

      {/* 🖐️ SECTION 1: 5 MAJOR PALM LINES MICRO-INSPECTION */}
      <Card className="border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-amber-200 pb-2.5">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
              ॥ ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ ಪದ್ಧತಿ ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2 mt-0.5">
              <span>🖐️</span>
              <span>{isKn ? "೧. ಪಂಚ ಪ್ರಧಾನ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (5 Major Palm Lines Micro-Topology)" : "1. 5 Major Palm Lines Micro-Topology"}</span>
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
            100% Accurate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Life Line */}
          <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-1">
              <span className="font-bold text-amber-950 text-sm">
                🌟 {result.lifeLine.lineName[lang] || result.lifeLine.lineName.kn}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {result.lifeLine.status[lang] || result.lifeLine.status.kn}
              </span>
            </div>
            <p className="text-xs text-amber-900 font-semibold leading-relaxed pt-1">
              {result.lifeLine.indication[lang] || result.lifeLine.indication.kn}
            </p>
          </div>

          {/* Head Line */}
          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/30 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-sky-200 pb-1">
              <span className="font-bold text-sky-950 text-sm">
                💡 {result.headLine.lineName[lang] || result.headLine.lineName.kn}
              </span>
              <span className="text-[11px] font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                {result.headLine.status[lang] || result.headLine.status.kn}
              </span>
            </div>
            <p className="text-xs text-sky-950 font-semibold leading-relaxed pt-1">
              {result.headLine.indication[lang] || result.headLine.indication.kn}
            </p>
          </div>

          {/* Heart Line */}
          <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-rose-200 pb-1">
              <span className="font-bold text-rose-950 text-sm">
                ❤️ {result.heartLine.lineName[lang] || result.heartLine.lineName.kn}
              </span>
              <span className="text-[11px] font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                {result.heartLine.status[lang] || result.heartLine.status.kn}
              </span>
            </div>
            <p className="text-xs text-rose-950 font-semibold leading-relaxed pt-1">
              {result.heartLine.indication[lang] || result.heartLine.indication.kn}
            </p>
          </div>

          {/* Fate Line */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
              <span className="font-bold text-emerald-950 text-sm">
                ⚡ {result.fateLine.lineName[lang] || result.fateLine.lineName.kn}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {result.fateLine.status[lang] || result.fateLine.status.kn}
              </span>
            </div>
            <p className="text-xs text-emerald-950 font-semibold leading-relaxed pt-1">
              {result.fateLine.indication[lang] || result.fateLine.indication.kn}
            </p>
          </div>

          {/* Sun Line */}
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 p-4 space-y-1.5 shadow-2xs md:col-span-2">
            <div className="flex items-center justify-between border-b border-amber-200 pb-1">
              <span className="font-bold text-amber-950 text-sm">
                ☀️ {result.sunLine.lineName[lang] || result.sunLine.lineName.kn}
              </span>
              <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                {result.sunLine.status[lang] || result.sunLine.status.kn}
              </span>
            </div>
            <p className="text-xs text-amber-950 font-semibold leading-relaxed pt-1">
              {result.sunLine.indication[lang] || result.sunLine.indication.kn}
            </p>
          </div>
        </div>
      </Card>

      {/* 🪐 SECTION 2: PLANETARY MOUNTS & SACRED MARKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mounts */}
        <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>🪐</span>
              <span>{isKn ? "೨. ಸಪ್ತ ಗ್ರಹ ಪರ್ವತ ಬಲ (Planetary Mounts)" : "2. Planetary Mounts"}</span>
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
              7 Mounts
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {result.mounts.map((m, idx) => (
              <div key={idx} className="rounded-xl bg-amber-50/60 p-2.5 border border-amber-200/70 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span>{m.mountName[lang] || m.mountName.kn}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-extrabold">
                    {m.strength[lang] || m.strength.kn}
                  </span>
                </div>
                <div className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                  {m.indication[lang] || m.indication.kn}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sacred Marks */}
        <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>🌟</span>
              <span>{isKn ? "೩. ಅಪರೂಪದ ಶುಭ ಚಿಹ್ನೆಗಳು & ಯೋಗ (Sacred Marks)" : "3. Sacred Marks & Yogas"}</span>
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
              Shubha Chihnas
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {result.specialMarks.map((sm, idx) => (
              <div key={idx} className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 p-2.5 border border-amber-200/70 space-y-0.5">
                <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <span>{sm.mark[lang] || sm.mark.kn}</span>
                </div>
                <div className="text-[11px] text-amber-900 font-medium leading-relaxed">
                  {sm.meaning[lang] || sm.meaning.kn}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ⏳ SECTION 3: 4 AGE-STRATIFIED LIFE MILESTONES */}
      {ms && (
        <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-300 pb-2.5">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
                {isKn ? "ವಯೋಮಾನ ಆಧಾರಿತ ಜೀವನ ಹಂತಗಳು" : "Chronological Life Stage Milestones"}
              </div>
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2 mt-0.5">
                <span>⏳</span>
                <span>
                  {isKn
                    ? `೪. ಹಸ್ತ ರೇಖಾ ವಯಸ್ಸು: ಸುಮಾರು ${ms.estimatedAge} ವರ್ಷಗಳು`
                    : `4. Palm Chronological Age: ~${ms.estimatedAge} Years`}
                </span>
              </h3>
            </div>
            <div className="rounded-full bg-amber-200/80 border border-amber-400 px-3.5 py-1 text-xs font-bold text-amber-950">
              {isKn ? ms.currentPhaseKn : ms.currentPhaseEn}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Education */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-3.5 space-y-1.5">
              <div className="font-bold text-sky-950 flex items-center justify-between border-b border-sky-200 pb-1">
                <span>🎓 {isKn ? "ವಿದ್ಯಾಭ್ಯಾಸ & ಜ್ಞಾನಾರ್ಜನೆ:" : "Education & Intellect:"}</span>
                <span className="text-[10px] bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-bold">Buddhi Rekha</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                <strong>{isKn ? "ಅಧ್ಯಯನ ಕ್ಷೇತ್ರ:" : "Recommended Field:"}</strong> {isKn ? ms.education.recommendedFieldsKn : ms.education.recommendedFieldsEn}
              </p>
              <p className="text-sky-900 text-[11px]">{isKn ? ms.education.intellectTraitKn : ms.education.intellectTraitEn}</p>
            </div>

            {/* Marriage */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-3.5 space-y-1.5">
              <div className="font-bold text-rose-950 flex items-center justify-between border-b border-rose-200 pb-1">
                <span>💍 {isKn ? "ವಿವಾಹ & ದಾಂಪತ್ಯ ಯೋಗ:" : "Marriage & Union Window:"}</span>
                <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold">Vivaha Rekha</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                <strong>{isKn ? "ವಿವಾಹ ವಯಸ್ಸು:" : "Marriage Age Window:"}</strong> <span className="font-extrabold text-rose-950">{isKn ? ms.marriage.timingAgeWindowKn : ms.marriage.timingAgeWindowEn}</span>
              </p>
              <p className="text-rose-900 text-[11px]">{isKn ? ms.marriage.spouseTraitKn : ms.marriage.spouseTraitEn}</p>
            </div>

            {/* Children */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-1.5">
              <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-1">
                <span>👶 {isKn ? "ಸಂತಾನ & ಕೌಟುಂಬಿಕ ಭಾಗ್ಯ:" : "Children & Progeny Blessing:"}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">Santana Yoga</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {isKn ? ms.children.prospectsKn : ms.children.prospectsEn}
              </p>
              <p className="text-emerald-900 text-[11px]">{isKn ? ms.children.familyBlessingKn : ms.children.familyBlessingEn}</p>
            </div>

            {/* Wealth Peak */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-3.5 space-y-1.5">
              <div className="font-bold text-amber-950 flex items-center justify-between border-b border-amber-200 pb-1">
                <span>💰 {isKn ? "ಧನಾರ್ಜನೆ & ಆಸ್ತಿ ಶಿಖರ:" : "Peak Wealth & Real Estate:"}</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Bhagya Rekha</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                <strong>{isKn ? "ಸರ್ವೋಚ್ಚ ಧನ ವಯಸ್ಸು:" : "Peak Ages:"}</strong> <span className="font-extrabold text-amber-950">{isKn ? ms.careerWealth.peakWealthAgeKn : ms.careerWealth.peakWealthAgeEn}</span>
              </p>
              <p className="text-amber-900 text-[11px]">{isKn ? ms.careerWealth.trajectoryKn : ms.careerWealth.trajectoryEn}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 📜 SECTION 4: COMPREHENSIVE HASTAREKHA PREDICTION NARRATIVE */}
      <Card className="border-2 border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>📜</span>
            <span>{isKn ? "೫. ಸಮಗ್ರ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಭವಿಷ್ಯ ವಾಣಿ" : "5. Comprehensive Hastarekha Shastra Revelation"}</span>
          </h3>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-300">
            Brihat Samhita
          </span>
        </div>

        <div className="rounded-2xl bg-amber-50/60 p-4 sm:p-5 border border-amber-200/80 text-sm sm:text-base leading-relaxed text-amber-950 whitespace-pre-wrap font-medium shadow-inner">
          {cleanPrediction}
        </div>
      </Card>

      {/* 🪔 SECTION 5: SACRED GOKARNA MAHABALESHWARA REMEDY */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
          <span className="text-lg">🪔</span>
          <span>{isKn ? "೬. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ & ಮಂತ್ರ (Sacred Remedy)" : "6. Sacred Gokarna Mahabaleshwara Remedy & Mantra"}</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed pt-1">
          {result.remedyRecommendation[lang] || result.remedyRecommendation.kn}
        </p>
      </Card>

      {/* 💬 SECTION 6: INTERACTIVE FOLLOW-UP WITH CHIEF PRIEST */}
      <Card className="border border-amber-300 bg-white p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
          <h3 className="font-serif text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
            <span>💬</span>
            <span>{isKn ? "ಗುರುಜಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೊಂದಿಗೆ ಪೂರಕ ಸಂವಾದ (Ask Follow-up)" : "Ask Clarification to Chief Priest"}</span>
          </h3>
          <span className="text-xs text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
            Gokarna Mahabaleshwara
          </span>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-[10px] font-bold text-amber-800 mb-0.5 px-1">
                {m.sender === "user" ? `👤 ${devoteeName}` : "🕉️ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Chief Priest)"} · {m.timestamp}
              </div>
              <div
                className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed max-w-[90%] shadow-sm ${
                  m.sender === "user"
                    ? "bg-amber-800 text-amber-50 rounded-br-none"
                    : "bg-amber-50 border border-amber-300 text-amber-950 rounded-bl-none font-medium"
                }`}
              >
                {sanitizeAIText(m.text)}
              </div>
            </div>
          ))}
        </div>

        {/* Follow-up Question Input Form */}
        <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2 pt-2 border-t border-amber-200">
          <input
            type="text"
            value={followUpQuery}
            onChange={(e) => setFollowUpQuery(e.target.value)}
            placeholder={isKn ? "ಹಸ್ತ ರೇಖೆಯ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ವಿವರಣೆ ಕೇಳಿ (ಅಥವಾ ಮೈಕ್ ಬಳಸಿ)..." : "Ask follow-up clarification on your palm reading..."}
            className="flex-1 rounded-xl border border-amber-300 bg-amber-50/30 px-3.5 py-2.5 text-xs font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Ask by voice"}
            className={`p-2.5 rounded-xl border transition shadow-sm flex items-center justify-center cursor-pointer ${
              isListening
                ? "bg-red-500 border-red-600 text-white animate-pulse"
                : "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200"
            }`}
          >
            <span className="text-sm">🎙️</span>
          </button>
          <button
            type="submit"
            disabled={isProcessingFollowUp || !followUpQuery.trim()}
            className="rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 px-4 py-2.5 text-xs font-bold text-amber-50 shadow disabled:opacity-50 cursor-pointer"
          >
            {isProcessingFollowUp ? (isKn ? "⌛..." : "...") : (isKn ? "ಕೇಳಿ" : "Ask")}
          </button>
        </form>
      </Card>
    </div>
  );
};
