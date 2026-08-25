import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import type { KundliRemedyDiagnosis, SupportedLanguage } from "../../features/remedies/kundliRemedyEngine";

export type KundliRemedyViewProps = {
  diagnosis: KundliRemedyDiagnosis;
  lang: string;
  onDownloadPdf: (selectedLang: string) => void;
  isGeneratingPdf?: boolean;
};

export const KundliRemedyView: React.FC<KundliRemedyViewProps> = ({
  diagnosis,
  lang,
  onDownloadPdf,
  isGeneratingPdf = false
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>((lang || "kn").slice(0, 2) as SupportedLanguage);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeStotraId, setActiveStotraId] = useState<string>(diagnosis.personalizedStotras[0]?.id || "chandrashekhara_ashtakam");

  const isKn = selectedLang === "kn";

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startBreathingTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const {
    devoteeName,
    birthDate,
    birthTime,
    gotra,
    lagnaName,
    rashiName,
    nakshatraName,
    primaryStruggle,
    afflictionFactors,
    psychologicalProfile,
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing
  } = diagnosis;

  const currentStotra = personalizedStotras.find((s) => s.id === activeStotraId) || personalizedStotras[0];

  const getShlokaByLang = (st: typeof currentStotra) => {
    if (!st) return "";
    if (selectedLang === "te") return st.shlokaTelugu;
    if (selectedLang === "ta") return st.shlokaTamil;
    if (selectedLang === "hi") return st.shlokaHindi;
    if (selectedLang === "en") return st.shlokaSanskrit;
    return st.shlokaKannada;
  };

  const getBeejaMantraByLang = (bm: typeof instantCalmingProtocol.emergencyBeejaMantra) => {
    if (selectedLang === "te") return bm.telugu;
    if (selectedLang === "ta") return bm.tamil;
    if (selectedLang === "hi") return bm.hindi;
    if (selectedLang === "en") return bm.sanskrit;
    return bm.kannada;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-5 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪔</span>
              <h2 className="font-serif text-lg font-black text-amber-200 sm:text-2xl">
                {isKn
                  ? "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ & ಮನಃಶಾಂತಿ ವರದಿ"
                  : "Personalized Kundali Astrological Remedy & Pacification Guide"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-amber-100/90 font-medium">
              {isKn
                ? "ಕುಂಡಲಿಯ ಗ್ರಹದೋಷ, ತೀವ್ರ ಕೋಪ / ಆವೇಶ ಶಮನ, ನಿತ್ಯ ಸ್ತೋತ್ರ, ಗೋಚಾರ & ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಸೇವೆಗಳು."
                : "Astrological diagnosis, instant anger pacification, daily stotra hymns, Gochara transits & Gokarna temple remedies."}
            </p>

            {/* Devotee Metadata Badges */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-lg bg-amber-800/80 px-2.5 py-1 text-amber-100 border border-amber-600/60">
                👤 {devoteeName} {gotra ? `(${gotra} ಗೋತ್ರ)` : ""}
              </span>
              <span className="rounded-lg bg-emerald-950/80 px-2.5 py-1 text-emerald-200 border border-emerald-600/60">
                🏛️ {isKn ? "ಲಗ್ನ:" : "Lagna:"} {lagnaName[selectedLang] || lagnaName.kn}
              </span>
              <span className="rounded-lg bg-amber-900/80 px-2.5 py-1 text-amber-200 border border-amber-500/60">
                🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"} {rashiName[selectedLang] || rashiName.kn}
              </span>
              <span className="rounded-lg bg-indigo-950/80 px-2.5 py-1 text-indigo-200 border border-indigo-600/60">
                ⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} {nakshatraName[selectedLang] || nakshatraName.kn}
              </span>
              <span className="rounded-lg bg-rose-950/80 px-2.5 py-1 text-rose-200 border border-rose-600/60">
                ⏳ {dashaBhuktiAnalysis.mahaDashaLabel[selectedLang] || dashaBhuktiAnalysis.mahaDashaLabel.kn} ದಶೆ / {dashaBhuktiAnalysis.bhuktiLabel[selectedLang] || dashaBhuktiAnalysis.bhuktiLabel.kn} ಭುಕ್ತಿ
              </span>
            </div>
          </div>

          {/* Language Selector & PDF Download Action */}
          <div className="flex flex-col sm:items-end gap-3">
            {/* 5-Language Selector */}
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-900/80 p-1 border border-amber-600/60">
              <span className="text-[11px] font-bold text-amber-200 px-2">🌐 PDF:</span>
              {(["kn", "en", "hi", "te", "ta"] as SupportedLanguage[]).map((lCode) => (
                <button
                  key={lCode}
                  type="button"
                  onClick={() => setSelectedLang(lCode)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedLang === lCode
                      ? "bg-amber-400 text-amber-950 shadow-sm"
                      : "text-amber-200 hover:bg-amber-800"
                  }`}
                >
                  {lCode.toUpperCase()}
                </button>
              ))}
            </div>

            {/* 1-Click PDF Download Button */}
            <button
              type="button"
              onClick={() => onDownloadPdf(selectedLang)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-5 py-2.5 text-xs sm:text-sm font-black text-amber-950 shadow-lg hover:from-amber-300 hover:to-amber-400 active:scale-95 transition disabled:opacity-60 cursor-pointer"
            >
              <span>📄</span>
              <span>
                {isGeneratingPdf
                  ? isKn
                    ? "⌛ PDF ರಚಿಸಲಾಗುತ್ತಿದೆ..."
                    : "Generating 2-Page PDF..."
                  : isKn
                  ? "ದೈವಿಕ ಪರಿಹಾರ ವರದಿ PDF ಡೌನ್‌ಲೋಡ್ (A4)"
                  : "Download 2-Page Remedy PDF (A4)"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 1. INSTANT ANGER & STRESS PACIFICATION PROTOCOL (Interactive Guided)  */}
      {/* ====================================================================== */}
      <Card className="border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-300/80 pb-3 gap-2">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
              <span>⚡</span>
              <span>{instantCalmingProtocol.title[selectedLang] || instantCalmingProtocol.title.kn}</span>
            </h3>
            <p className="text-xs text-amber-900 font-semibold mt-0.5">
              {instantCalmingProtocol.subtitle[selectedLang] || instantCalmingProtocol.subtitle.kn}
            </p>
          </div>

          {/* Interactive Breathing & Calm Timer */}
          {isTimerRunning ? (
            <div className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white text-xs font-black animate-pulse shadow-md">
              <span>⏱️ {isKn ? "ಶಾಂತಿ ಸಮಯ:" : "Calming:"}</span>
              <span className="text-base">{timerSeconds}s</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startBreathingTimer(180)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500 bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 transition shadow-sm cursor-pointer"
            >
              <span>⏱️</span>
              <span>{isKn ? "೩-ನಿಮಿಷಗಳ ಶಾಂತಿ ಟೈಮರ್ ಪ್ರಾರಂಭಿಸಿ" : "Start 3-Min Calm Timer"}</span>
            </button>
          )}
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {instantCalmingProtocol.steps.map((st, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(st.stepNumber)}
              className={`rounded-xl p-3.5 border-2 transition cursor-pointer space-y-1.5 ${
                activeStep === st.stepNumber
                  ? "border-amber-600 bg-amber-100/90 shadow-md scale-[1.02]"
                  : "border-amber-200 bg-white hover:bg-amber-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{st.icon}</span>
                <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  {st.duration}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-amber-950">
                {st.name[selectedLang] || st.name.kn}
              </h4>
              <p className="text-[11px] font-bold text-amber-900 leading-snug">
                {st.action[selectedLang] || st.action.kn}
              </p>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                {st.detail[selectedLang] || st.detail.kn}
              </p>
            </div>
          ))}
        </div>

        {/* Emergency Beeja Japa Box */}
        <div className="rounded-xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 text-white shadow-inner space-y-2 border border-amber-400">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-700/60 pb-2">
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
              <span>🕉️</span>
              <span>{isKn ? "ಆಪತ್ಕಾಲೀನ ಶಾಂತಿ ಬೀಜ ಮಂತ್ರ (ಕೋಪ ಬಂದಾಗ ೧೧ ಬಾರಿ ಮನಸ್ಸಿನಲ್ಲೇ ಜಪಿಸಿ)" : "Emergency Mind Pacification Mantra (Chant 11 times silently)"}</span>
            </span>
            <span className="rounded-full bg-amber-500/20 border border-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
              {instantCalmingProtocol.emergencyBeejaMantra.japaCount}
            </span>
          </div>

          <div className="py-1 text-center font-serif text-sm sm:text-base font-black text-amber-200 tracking-wide">
            {getBeejaMantraByLang(instantCalmingProtocol.emergencyBeejaMantra)}
          </div>

          <div className="text-center text-[11px] text-amber-100/90 font-medium italic">
            "{instantCalmingProtocol.emergencyBeejaMantra.meaning[selectedLang] || instantCalmingProtocol.emergencyBeejaMantra.meaning.kn}"
          </div>
        </div>
      </Card>

      {/* ====================================================================== */}
      {/* 2. KUNDALI ROOT CAUSE DIAGNOSIS & PSYCHOLOGICAL METERS                */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Struggle & Afflictions Breakdown (Col span 2) */}
        <Card className="lg:col-span-2 border border-amber-300 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="font-serif text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
              <span>🔍</span>
              <span>{isKn ? "ಕುಂಡಲಿ ದೋಷ & ಮಾನಸಿಕ ಸಂಘರ್ಷಗಳ ಮೂಲ ಕಾರಣ" : "Kundali Affliction & Psychological Diagnosis"}</span>
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                primaryStruggle.intensity === "High"
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {primaryStruggle.intensity} Priority
            </span>
          </div>

          {/* Primary Struggle Card */}
          <div className="rounded-xl bg-amber-50/80 border border-amber-300 p-3.5 space-y-1.5">
            <div className="text-xs font-black text-rose-900 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{primaryStruggle.title[selectedLang] || primaryStruggle.title.kn}</span>
            </div>
            <p className="text-xs text-amber-950 font-medium leading-relaxed">
              {primaryStruggle.description[selectedLang] || primaryStruggle.description.kn}
            </p>
          </div>

          {/* Affliction Grahas Grid */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-amber-950">
              {isKn ? "ಪರಿಹಾರ ಅಗತ್ಯವಿರುವ ಗ್ರಹ ದೋಷಗಳು:" : "Key Afflicted Graha Placements:"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {afflictionFactors.map((af, idx) => (
                <div key={idx} className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <span>🔥</span>
                    <span>{af.title[selectedLang] || af.title.kn}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">{af.reason[selectedLang] || af.reason.kn}</p>
                  <p className="text-[10px] text-rose-800 font-semibold">{af.impact[selectedLang] || af.impact.kn}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Psychological Meters & Equilibrium (Col span 1) */}
        <Card className="border border-amber-300 bg-gradient-to-b from-white to-amber-50/40 p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
            <span>📊</span>
            <span>{isKn ? "ಮಾನಸಿಕ ತತ್ತ್ವ ಮಾಪನ" : "Temperament & Energy Meters"}</span>
          </h3>

          <div className="space-y-3.5">
            {/* Meter 1: Anger / Pitta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-900">🔥 {isKn ? "ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ" : "Pitta / Anger Surge"}</span>
                <span className="text-rose-900">{psychologicalProfile.krodhaLevel}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-rose-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.krodhaLevel}%` }}
                />
              </div>
            </div>

            {/* Meter 2: Mental Stability */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-900">🌙 {isKn ? "ಮನೋ ಶಾಂತಿ & ಧೃತಿ" : "Mental Peace & Balance"}</span>
                <span className="text-emerald-900">{psychologicalProfile.manasStability}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.manasStability}%` }}
                />
              </div>
            </div>

            {/* Meter 3: Vitality / Prana */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-900">☀️ {isKn ? "ಆತ್ಮ ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ" : "Vitality / Prana Force"}</span>
                <span className="text-amber-900">{psychologicalProfile.vitalityScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.vitalityScore}%` }}
                />
              </div>
            </div>

            {/* Meter 4: Patience Index */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-900">🧘 {isKn ? "ತಾಳ್ಮೆ & ಸಹಿಷ್ಣುತೆ" : "Patience & Resilience"}</span>
                <span className="text-indigo-900">{psychologicalProfile.patienceIndex}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.patienceIndex}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Equilibrium Tip */}
          <div className="rounded-xl bg-amber-100/70 p-3 text-[11px] text-amber-950 font-bold leading-relaxed border border-amber-300">
            💡 {isKn ? "ಸಲಹೆ: ದಿನಕ್ಕೆ ೧೦ ನಿಮಿಷ ಶಾಂತಚಿತ್ತದಿಂದ ಕುಳಿತು ಚಂದ್ರ ಧ್ಯಾನ ಮಾಡುವುದರಿಂದ ಪಿತ್ತ ಶಕ್ತಿ ಶಾಂತವಾಗಿ ತಾಳ್ಮೆ ವೃದ್ಧಿಸುತ್ತದೆ." : "Tip: 10 minutes of daily silent breathwork grounds adrenal surges and elevates patience by 40%."}
          </div>
        </Card>
      </div>

      {/* ====================================================================== */}
      {/* 3. PERSONALIZED DAILY STOTRA & JAPA SECTION                           */}
      {/* ====================================================================== */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-3 gap-2">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>📜</span>
              <span>{isKn ? "ಜಾತಕಕ್ಕೆ ವಿಶೇಷವಾಗಿ ನಿಗದಿಪಡಿಸಿದ ನಿತ್ಯ ಸ್ತೋತ್ರಗಳು (Daily Stotra Guide)" : "Personalized Daily Classical Stotras"}</span>
            </h3>
            <p className="text-xs text-amber-900 font-medium mt-0.5">
              {isKn ? "ನಿಮ್ಮ ಕುಂಡಲಿಯ ಗ್ರಹ ಪೀಡೆ ಪರಿಹರಿಸಲು ಪ್ರತಿದಿನ ಪಠಿಸಬೇಕಾದ ಶಕ್ತಿಶಾಲಿ ಸ್ತೋತ್ರಗಳು." : "Sacred classical hymns calibrated to pacify chart afflictions."}
            </p>
          </div>

          {/* Stotra Selector Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {personalizedStotras.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStotraId(st.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeStotraId === st.id
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                {st.title[selectedLang]?.split(" ")[0] || st.title.kn.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Stotra Reader */}
        {currentStotra && (
          <div className="space-y-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/40 to-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
              <div>
                <h4 className="text-sm font-extrabold text-amber-950">
                  {currentStotra.title[selectedLang] || currentStotra.title.kn}
                </h4>
                <div className="text-xs text-amber-900 font-bold">
                  {isKn ? "ದೇವತೆ:" : "Deity:"} {currentStotra.dedicatedTo[selectedLang] || currentStotra.dedicatedTo.kn}
                </div>
              </div>
              <span className="rounded-full bg-amber-800 text-amber-50 px-3 py-1 text-xs font-bold">
                {currentStotra.recitationCount}
              </span>
            </div>

            {/* Sacred Verse in Localized Script */}
            <div className="rounded-xl bg-amber-950 text-amber-200 p-4 text-center font-serif text-xs sm:text-sm font-black leading-relaxed whitespace-pre-line border border-amber-400 shadow-inner">
              {getShlokaByLang(currentStotra)}
            </div>

            {/* Translation & Benefits */}
            <div className="space-y-1.5 text-xs">
              <div className="text-amber-950 font-bold leading-relaxed">
                <span className="text-amber-800 font-extrabold">📖 {isKn ? "ಭಾವಾರ್ಥ:" : "Meaning:"}</span>{" "}
                {currentStotra.meaning[selectedLang] || currentStotra.meaning.kn}
              </div>
              <div className="text-emerald-950 font-semibold leading-relaxed">
                <span className="text-emerald-800 font-extrabold">✨ {isKn ? "ಫಲಶ್ರುತಿ:" : "Spiritual Benefits:"}</span>{" "}
                {currentStotra.spiritualBenefits[selectedLang] || currentStotra.spiritualBenefits.kn}
              </div>
              <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-bold text-amber-900">
                <span>⏰ {isKn ? "ಸಮಯ:" : "Time:"} {currentStotra.bestTimeToRecite[selectedLang] || currentStotra.bestTimeToRecite.kn}</span>
                <span>🧭 {isKn ? "ದಿಕ್ಕು:" : "Direction:"} {currentStotra.facingDirection[selectedLang] || currentStotra.facingDirection.kn}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ====================================================================== */}
      {/* 4. GOCHARA (TRANSIT) & ACTIVE DASHA-BHUKTI SHANTI                     */}
      {/* ====================================================================== */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>🪐</span>
            <span>{isKn ? "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹ ಶಾಂತಿ" : "Active Dasha-Bhukti & Gochara Transit Shanti"}</span>
          </h3>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
            {dashaBhuktiAnalysis.mahaDashaLabel[selectedLang] || dashaBhuktiAnalysis.mahaDashaLabel.kn} ದಶೆ
          </span>
        </div>

        <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 text-xs space-y-1.5">
          <div className="font-bold text-amber-900">
            ⏳ {dashaBhuktiAnalysis.mahaDashaLabel[selectedLang] || dashaBhuktiAnalysis.mahaDashaLabel.kn} ಮಹಾದಶೆ / {dashaBhuktiAnalysis.bhuktiLabel[selectedLang] || dashaBhuktiAnalysis.bhuktiLabel.kn} ಭುಕ್ತಿ
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {dashaBhuktiAnalysis.periodEffect[selectedLang] || dashaBhuktiAnalysis.periodEffect.kn}
          </p>
          <p className="text-emerald-900 font-bold">
            💡 {dashaBhuktiAnalysis.remedialAction[selectedLang] || dashaBhuktiAnalysis.remedialAction.kn}
          </p>
        </div>

        {/* Gochara Transit Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {gocharaTransitAnalysis.transitHighlights.map((th, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3.5 border text-xs space-y-1 ${
                th.effect === "Challenging"
                  ? "bg-rose-50/70 border-rose-300"
                  : "bg-emerald-50/70 border-emerald-300"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span className={th.effect === "Challenging" ? "text-rose-900" : "text-emerald-900"}>
                  {th.title[selectedLang] || th.title.kn}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border">
                  {th.effect}
                </span>
              </div>
              <p className="text-slate-700 text-[11px] leading-snug">{th.description[selectedLang] || th.description.kn}</p>
              <p className="text-amber-900 font-bold text-[11px]">
                💡 {isKn ? "ಪರಿಹಾರ:" : "Remedy:"} {th.remedy[selectedLang] || th.remedy.kn}
              </p>
            </div>
          ))}
        </div>

        {/* Sade Sati Alert */}
        <div className="rounded-xl bg-amber-100/80 border border-amber-300 p-3 text-xs text-amber-950 font-bold leading-relaxed">
          {gocharaTransitAnalysis.sadeSatiStatus[selectedLang] || gocharaTransitAnalysis.sadeSatiStatus.kn}
        </div>
      </Card>

      {/* ====================================================================== */}
      {/* 5. GOKARNA MAHABALESHWARA TEMPLE REMEDIES & ASHIRVADA                 */}
      {/* ====================================================================== */}
      <Card className="border border-amber-300 bg-gradient-to-b from-white to-amber-50/30 p-5 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
          <span>🪔</span>
          <span>{isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ದೈವಿಕ ಸೇವೆಗಳು & ಧರ್ಮೋಪಾಯ" : "Sacred Gokarna Mahabaleshwara Sevas & Remedy Items"}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Temple Seva */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>🕉️</span>
              <span>{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಸೇವೆ:" : "Prescribed Seva:"}</span>
            </div>
            <div className="font-extrabold text-amber-950">
              {gokarnaTempleRemedies.prescribedSeva.name[selectedLang] || gokarnaTempleRemedies.prescribedSeva.name.kn}
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              {gokarnaTempleRemedies.prescribedSeva.significance[selectedLang] || gokarnaTempleRemedies.prescribedSeva.significance.kn}
            </p>
            <div className="text-[10px] text-amber-800 font-bold pt-1">
              📅 {isKn ? "ಶುಭ ದಿನ:" : "Ideal Day:"} {gokarnaTempleRemedies.prescribedSeva.idealDay[selectedLang] || gokarnaTempleRemedies.prescribedSeva.idealDay.kn}
            </div>
          </div>

          {/* Rudraksha & Gemstone */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>📿</span>
              <span>{isKn ? "ರುದ್ರಾಕ್ಷಿ & ರತ್ನ ಧಾರಣೆ:" : "Rudraksha & Gemstone:"}</span>
            </div>
            <div className="font-bold text-amber-950 text-[11px]">
              • ರುದ್ರಾಕ್ಷಿ: {gokarnaTempleRemedies.rudrakshaRecommendation.mukhi}
            </div>
            <div className="font-bold text-amber-950 text-[11px]">
              • ರತ್ನ: {gokarnaTempleRemedies.gemstoneRecommendation.stone[selectedLang] || gokarnaTempleRemedies.gemstoneRecommendation.stone.kn}
            </div>
            <div className="text-[10px] text-slate-700 pt-1">
              {gokarnaTempleRemedies.rudrakshaRecommendation.benefits[selectedLang] || gokarnaTempleRemedies.rudrakshaRecommendation.benefits.kn}
            </div>
          </div>

          {/* Daana */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>🌾</span>
              <span>{isKn ? "ಶುಭ ದಾನ & ಗೋಸೇವೆ:" : "Sacred Daana & Goseva:"}</span>
            </div>
            <div className="font-bold text-amber-950 text-[11px]">
              • ದ್ರವ್ಯ: {gokarnaTempleRemedies.donationDaana.item[selectedLang] || gokarnaTempleRemedies.donationDaana.item.kn}
            </div>
            <div className="text-[10px] text-slate-700">
              • ದಿನ: {gokarnaTempleRemedies.donationDaana.day[selectedLang] || gokarnaTempleRemedies.donationDaana.day.kn}
            </div>
            <div className="text-[10px] text-emerald-800 font-bold pt-1">
              • ಸ್ವೀಕಾರಕರ್ತರು: {gokarnaTempleRemedies.donationDaana.beneficiary[selectedLang] || gokarnaTempleRemedies.donationDaana.beneficiary.kn}
            </div>
          </div>
        </div>

        {/* Chief Priest Blessing Box */}
        <div className="rounded-xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-400">
          <div className="space-y-1">
            <div className="text-xs font-black text-amber-200">
              🙏 {chiefPriestBlessing.priestName[selectedLang] || chiefPriestBlessing.priestName.kn}
            </div>
            <div className="text-[10px] text-amber-100/90">
              {chiefPriestBlessing.priestTitle[selectedLang] || chiefPriestBlessing.priestTitle.kn} · {chiefPriestBlessing.phone}
            </div>
            <p className="text-xs text-amber-100 font-serif italic pt-1 leading-relaxed">
              "{chiefPriestBlessing.ashirvadaMeaning[selectedLang] || chiefPriestBlessing.ashirvadaMeaning.kn}"
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 border-2 border-dashed border-amber-400 rounded-full w-16 h-16 bg-amber-800/40 text-[8px] font-black text-amber-200 text-center">
            <span className="text-base">🕉️</span>
            <span>GOKARNA</span>
            <span>SEAL</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
