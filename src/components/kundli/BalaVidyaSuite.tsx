import React, { useState } from "react";
import Card from "../ui/Card";
import type { KundliOutput } from "../../core/AstroTypes";
import { calculateBalaVidya, type BalaVidyaResult } from "../../features/balavidya/balaVidyaEngine";

export type BalaVidyaSuiteProps = {
  kundli: KundliOutput;
  childName?: string;
  dob?: string;
  tob?: string;
  gender?: string;
  lang?: string;
  onOpenSevaModal?: () => void;
};

type ActiveSubTab = "learning" | "naming" | "shield" | "numerology" | "stories" | "ashirvada";

export const BalaVidyaSuite: React.FC<BalaVidyaSuiteProps> = ({
  kundli,
  childName = "ಶ್ರೀ ಬಾಲಕ/ಬಾಲಕಿ",
  dob = "2020-01-01",
  tob = "10:00",
  gender = "Male",
  lang = "kn",
  onOpenSevaModal
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";
  const [activeTab, setActiveTab] = useState<ActiveSubTab>("learning");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Compute deterministic astrological insights
  const data: BalaVidyaResult = calculateBalaVidya(kundli, childName, dob, tob, gender);

  // Play Shloka Audio via Web Speech Synthesis
  const handlePlayShlokaAudio = () => {
    if (!window.speechSynthesis) {
      alert(isKn ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಸೌಲಭ್ಯವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ." : "Audio speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(data.mascotAndStory.audioVoiceText);
    utterance.lang = "kn-IN";
    utterance.rate = 0.85; // slower, kid-friendly clear recitation
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const tabs: Array<{ id: ActiveSubTab; labelKn: string; labelEn: string; icon: string }> = [
    { id: "learning", labelKn: "೧. ಬಾಲ ವಿದ್ಯಾ ಶೈಲಿ", labelEn: "1. Learning Style", icon: "🎓" },
    { id: "naming", labelKn: "೨. ನಾಮಕರಣ & ಸಂಸ್ಕಾರ", labelEn: "2. Naming & Samskaras", icon: "🔤" },
    { id: "shield", labelKn: "೩. ಬಾಲಾರಿಷ್ಟ ರಕ್ಷೆ", labelEn: "3. Vitality Shield", icon: "🛡️" },
    { id: "numerology", labelKn: "೪. ಬಾಲ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ", labelEn: "4. Child Numerology", icon: "🌟" },
    { id: "stories", labelKn: "೫. ಬಾಲ ಶ್ಲೋಕ & ಕಥೆ", labelEn: "5. Shloka & Stories", icon: "🎨" },
    { id: "ashirvada", labelKn: "೬. ಸರಸ್ವತೀ ಆಶೀರ್ವಾದ", labelEn: "6. Seva & Ashirvada", icon: "📿" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Gold & Saffron Luxury Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-3 -bottom-4 opacity-15 text-8xl select-none pointer-events-none">
          {data.padaInfo.mascotEmoji}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 shadow-inner flex items-center justify-center text-3xl select-none">
              {data.padaInfo.mascotEmoji}
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase flex items-center gap-1.5">
                <span>॥ ಶ್ರೀ ಸರಸ್ವತೀ & ಬಾಲ ವಿದ್ಯಾ ಮಂಡಲ ॥</span>
                <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">Gokarna Kshetra</span>
              </div>
              <h2 className="font-serif text-xl font-extrabold text-amber-950 mt-0.5">
                {data.childName} — {isKn ? "ವಿದ್ಯಾ ಜಾತಕ & ಸಂಸ್ಕಾರ ಮಾರ್ಗದರ್ಶಿ" : "Vedic Student & Samskara Guide"}
              </h2>
              <div className="text-xs text-amber-900/90 font-medium flex flex-wrap gap-x-3 gap-y-1 mt-1">
                <span><strong>{isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> {data.nakshatraNameKn} ({data.nakshatraPada}ನೇ ಪಾದ)</span>
                <span>•</span>
                <span><strong>{isKn ? "ರಾಶಿ:" : "Rashi:"}</strong> {data.moonRashiKn}</span>
                <span>•</span>
                <span><strong>{isKn ? "ಮ್ಯಾಸ್ಕಾಟ್:" : "Mascot:"}</strong> {data.padaInfo.animalMascotKn}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center bg-white/90 px-4 py-2 rounded-2xl border border-amber-300 shadow-sm">
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-900 block">{isKn ? "ಸರಸ್ವತೀ ಮೇಧಾ ಬಲ" : "Saraswati Score"}</span>
              <span className="text-lg font-extrabold text-amber-950">{data.saraswatiScore}%</span>
            </div>
            <span className="text-2xl">🪔</span>
          </div>
        </div>
      </Card>

      {/* Sub-Tabs Switcher Bar with Animation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? "bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 text-amber-50 shadow-md scale-105 border border-amber-700"
                  : "bg-white border border-amber-200 text-amber-950 hover:bg-amber-50"
              }`}
            >
              <span>{t.icon}</span>
              <span>{isKn ? t.labelKn : t.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ====================================================================== */}
      {/* SUB-TAB 1: BALA VIDYA & LEARNING STYLE                                */}
      {/* ====================================================================== */}
      {activeTab === "learning" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🧠</span>
                <span>{isKn ? data.learningStyle.titleKn : data.learningStyle.titleEn}</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                5th House Buddhi Sthana
              </span>
            </div>

            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {isKn ? data.learningStyle.descriptionKn : data.learningStyle.descriptionEn}
            </p>

            {/* Recommended Fields */}
            <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-950 block">
                🎯 {isKn ? "ಮಗುವಿನ ಪ್ರತಿಭೆಗೆ ಹೊಂದುವ ಉನ್ನತ ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರಗಳು:" : "Recommended Academic & Career Fields:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {(isKn ? data.learningStyle.recommendedFieldsKn : data.learningStyle.recommendedFieldsEn).map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 shadow-2xs">
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Study Vastu & Favorable Hours Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-amber-50/50 p-3 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 block">🧭 {isKn ? "ಅಧ್ಯಯನ ವಾಸ್ತು & ಕೋಣೆ ವಾತಾವರಣ:" : "Study Vastu & Environment:"}</span>
                <p className="text-amber-900 font-medium leading-relaxed">
                  {isKn ? data.learningStyle.studyEnvironmentKn : data.learningStyle.studyEnvironmentEn}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50/50 p-3 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 block">⏳ {isKn ? "ಏಕಾಗ್ರತೆಯ ಅತ್ಯುತ್ತಮ ಶುಭ ಸಮಯ (ಹೋರೆ):" : "Peak Concentration Study Hours:"}</span>
                <p className="text-amber-900 font-medium leading-relaxed">
                  {isKn ? data.learningStyle.favorableHoursKn : data.learningStyle.favorableHoursEn}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 2: NAMAKARANA & SAMSKARA ASSISTANT                             */}
      {/* ====================================================================== */}
      {activeTab === "naming" && (
        <div className="space-y-4 animate-fade-in">
          {/* Nakshatra Pada Syllable Card */}
          <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🔤</span>
                <span>{isKn ? "ನಾಮಕರಣ ನಕ್ಷತ್ರ ಪಾದ ಅಕ್ಷರಗಳು (Nakshatra Syllables):" : "Nakshatra Pada Naming Syllables:"}</span>
              </h3>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full">
                {data.nakshatraNameKn} • Pada {data.nakshatraPada}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-amber-900">{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರಾರಂಭದ ಅಕ್ಷರ:" : "Auspicious Starting Syllable:"}</span>
              <div className="flex gap-2">
                {data.padaInfo.syllablesKn.map((s, i) => (
                  <span key={i} className="px-4 py-1.5 bg-amber-800 text-amber-50 font-extrabold text-sm rounded-xl shadow-sm border border-amber-900">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
              {isKn
                ? "ಪ್ರಾಚೀನ ಗರುಡ ಪುರಾಣದ ಪ್ರಕಾರ ಜನನ ನಕ್ಷತ್ರ ಪಾದದ ನಿರ್ದಿಷ್ಟ ಧ್ವನಿ ತರಂಗದಿಂದ ಹೆಸರನ್ನು ಇಡುವುದರಿಂದ ಮಗುವಿನ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಭಾಗ್ಯೋದಯವು ವೃದ್ಧಿಯಾಗುತ್ತದೆ."
                : "According to Garuda Purana, naming the child with the cosmic vibration of their birth star's quarter awakens health, longevity, and high destiny."}
            </p>
          </Card>

          {/* 4 Samskaras Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.samskaras.map((s, idx) => (
              <Card key={idx} className="border border-amber-300 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                  <span className="font-serif text-xs font-bold text-amber-950">
                    {isKn ? s.samskaraNameKn : s.samskaraNameEn}
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                    {isKn ? s.idealAgeWindowKn : s.idealAgeWindowEn}
                  </span>
                </div>
                <div className="text-[11px] space-y-1 text-slate-800">
                  <div>
                    <strong className="text-amber-900">{isKn ? "ಶುಭ ತಿಥಿ/ವಾರ:" : "Favorable Timing:"}</strong>{" "}
                    <span>{isKn ? s.favorableTithisKn : s.favorableTithisEn}</span>
                  </div>
                  <p className="text-amber-950/90 font-medium leading-relaxed pt-1">
                    {isKn ? s.vedicSignificanceKn : s.vedicSignificanceEn}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 3: BALA RISHTA & VITALITY SHIELD                               */}
      {/* ====================================================================== */}
      {activeTab === "shield" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🛡️</span>
                <span>{isKn ? "ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಾ ಕವಚ & ಪ್ರಾಣಶಕ್ತಿ ವಿಶ್ಲೇಷಣೆ" : "Bala Rishta Protection Shield & Vitality"}</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                ರಕ್ಷಾ ಬಲ: {data.balaRishta.protectionScore}%
              </span>
            </div>

            <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 space-y-1 text-xs">
              <span className="font-bold text-amber-950 block">
                {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ಥಿತಿ:" : "Vedic Status:"} {isKn ? data.balaRishta.statusKn : data.balaRishta.statusEn}
              </span>
              <ul className="list-disc list-inside text-amber-900 space-y-0.5 font-medium pt-1">
                {(isKn ? data.balaRishta.observationsKn : data.balaRishta.observationsEn).map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>

            {/* Protective Mantras */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-950 block">
                🪔 {isKn ? "ಪಾಲಕರು ಪ್ರತಿದಿನ ಪಠಿಸಬೇಕಾದ ದಿವ್ಯ ರಕ್ಷಾ ಸ್ತೋತ್ರಗಳು:" : "Recommended Daily Protective Mantras for Parents:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(isKn ? data.balaRishta.protectiveMantrasKn : data.balaRishta.protectiveMantrasEn).map((m, i) => (
                  <div key={i} className="rounded-xl bg-amber-100/50 p-2.5 border border-amber-300 text-xs font-bold text-amber-950 text-center">
                    ✨ {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Temple Remedy */}
            <div className="rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 p-3.5 border border-amber-300 text-xs space-y-1">
              <span className="font-bold text-amber-950 block">🔱 {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ರಕ್ಷಾ ಸೇವೆ:" : "Sacred Gokarna Protection Remedy:"}</span>
              <p className="text-amber-900 font-medium">
                {isKn ? data.balaRishta.templeRemedyKn : data.balaRishta.templeRemedyEn}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 4: BALA SANKHYA NUMEROLOGY                                     */}
      {/* ====================================================================== */}
      {activeTab === "numerology" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🌟</span>
                <span>{isKn ? "ಬಾಲ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ & ಪ್ರತಿಭಾ ಮಂಡಲ" : "Child Numerology & Power Numbers"}</span>
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                Sankhya Shastra
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 space-y-1">
                <span className="text-[10px] font-extrabold tracking-wider text-amber-800 uppercase block">
                  {isKn ? "ಮೂಲಾಂಕ (Driver / Root Number):" : "Driver / Root Number:"}
                </span>
                <span className="text-2xl font-extrabold text-amber-950 block">
                  #{data.sankhya.driverNumber}
                </span>
                <p className="text-amber-900 font-medium pt-1">
                  {isKn ? data.sankhya.coreStrengthKn : data.sankhya.coreStrengthEn}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 space-y-1">
                <span className="text-[10px] font-extrabold tracking-wider text-amber-800 uppercase block">
                  {isKn ? "ಭಾಗ್ಯಾಂಕ (Conductor / Life Path):" : "Conductor / Life Path:"}
                </span>
                <span className="text-2xl font-extrabold text-amber-950 block">
                  #{data.sankhya.conductorNumber}
                </span>
                <p className="text-amber-900 font-medium pt-1">
                  {isKn ? data.sankhya.peerDynamicsKn : data.sankhya.peerDynamicsEn}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-2xs">
                <strong className="text-amber-950 block mb-0.5">🎨 {isKn ? "ಏಕಾಗ್ರತೆಯ ಶುಭ ಬಣ್ಣಗಳು:" : "Focus Colors:"}</strong>
                <span className="text-amber-900 font-semibold">{isKn ? data.sankhya.concentrationColorKn : data.sankhya.concentrationColorEn}</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-2xs">
                <strong className="text-amber-950 block mb-0.5">🧭 {isKn ? "ಶುಭ ಅಧ್ಯಯನ ದಿಕ್ಕು:" : "Lucky Study Orientation:"}</strong>
                <span className="text-amber-900 font-semibold">{isKn ? data.sankhya.luckyStudyDirectionKn : data.sankhya.luckyStudyDirectionEn}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 5: BAL SHLOKA & MORAL STORY                                    */}
      {/* ====================================================================== */}
      {activeTab === "stories" && (
        <div className="space-y-4 animate-fade-in">
          {/* Daily Bal Shloka with Audio Player */}
          <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-amber-300 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🎵</span>
                <span>{isKn ? "ದಿನದ ಬಾಲ ಸರಸ್ವತೀ ಶ್ಲೋಕ (Bal Shloka of the Day):" : "Daily Bal Saraswati Shloka:"}</span>
              </h3>
              <button
                type="button"
                onClick={handlePlayShlokaAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition shadow-sm ${
                  isPlayingAudio
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-amber-800 text-amber-50 hover:bg-amber-900"
                }`}
              >
                <span>{isPlayingAudio ? "⏹️ ವಿರಾಮ" : "▶️ ಶ್ಲೋಕ ಆಲಿಸಿ"}</span>
              </button>
            </div>

            <div className="text-center py-2 bg-white/80 rounded-2xl border border-amber-300 shadow-inner">
              <p className="font-serif text-sm font-extrabold text-amber-950 leading-relaxed whitespace-pre-line">
                {data.mascotAndStory.shlokaSanskrit}
              </p>
            </div>

            <div className="text-xs text-amber-900 leading-relaxed font-medium bg-amber-50/80 p-3 rounded-xl border border-amber-200">
              <strong className="text-amber-950 block mb-0.5">🪔 {isKn ? "ಸರಳ ಭಾವಾರ್ಥ:" : "Kid-Friendly Meaning:"}</strong>
              {isKn ? data.mascotAndStory.shlokaMeaningKn : data.mascotAndStory.shlokaMeaningEn}
            </div>
          </Card>

          {/* Moral Story of the Week */}
          <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>📖</span>
                <span>{isKn ? data.mascotAndStory.moralStoryTitleKn : data.mascotAndStory.moralStoryTitleEn}</span>
              </h4>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                Panchatantra
              </span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium pt-1">
              {isKn ? data.mascotAndStory.moralStoryContentKn : data.mascotAndStory.moralStoryContentEn}
            </p>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 6: SEVA & STUDENT ASHIRVADA                                    */}
      {/* ====================================================================== */}
      {activeTab === "ashirvada" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-300 pb-2">
              <span className="text-2xl select-none">📿</span>
              <h3 className="font-serif text-base font-bold text-amber-950">
                {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ವಿದ್ಯಾ ಗಣಪತಿ ಸೇವೆ & ವಿದ್ಯಾರ್ಥಿ ಆಶೀರ್ವಾದ" : "Sri Gokarna Vidya Ganapathi Seva & Blessings"}
              </h3>
            </div>

            <div className="text-xs text-amber-950 leading-relaxed font-medium space-y-2">
              <p>
                {isKn
                  ? "ಮಗುವಿನಲ್ಲಿ ನಿರಂತರ ಮೇಧಾ ಶಕ್ತಿ, ನೆನಪಿನ ಸಾಮರ್ಥ್ಯ, ಪರೀಕ್ಷಾ ಯಶಸ್ಸು ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಪದವಿ ಸಿದ್ಧಿಸಲು, ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಾಲ ವಿದ್ಯಾ ಗಣಪತಿ ಸೇವೆ ಹಾಗೂ ಸರಸ್ವತೀ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯಂತ ಪುಣ್ಯಪ್ರದ."
                  : "To foster lifelong memory retention, examination focus, and scholastic triumph, offer the sacred Vidya Ganapathi and Saraswati Abhishekam at Sri Gokarna Mahabaleshwara Kshetra."}
              </p>

              <div className="rounded-2xl bg-white p-4 border border-amber-300 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-extrabold text-amber-950">
                    {isKn ? "ಶ್ರೀ ವಿದ್ಯಾ ಗಣಪತಿ ಪ್ರಸಾದ ಕಿಟ್ (Student Kit)" : "Vidya Ganapathi Student Kit"}
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-300">
                    ₹ 1,008/-
                  </span>
                </div>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  <li>{isKn ? "ಅಭಿಮಂತ್ರಿತ ಸರಸ್ವತೀ ಯಂತ್ರ ರಕ್ಷೆ (Blessed Saraswati Yantra)" : "Blessed Saraswati Yantra Locket"}</li>
                  <li>{isKn ? "ಮೇಧಾ ಸೂಕ್ತದಿಂದ ಪೂಜಿಸಲ್ಪಟ್ಟ ರಕ್ಷಾ ಸೂತ್ರ (Sacred Raksha Thread)" : "Medha Sukta Sanctified Raksha Thread"}</li>
                  <li>{isKn ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದ ಕುಂಕುಮ & ಗಂಧ ಪ್ರಸಾದ" : "Sacred Gokarna Temple Kumkuma & Sandalwood Prasada"}</li>
                </ul>

                {onOpenSevaModal && (
                  <button
                    type="button"
                    onClick={onOpenSevaModal}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-2.5 text-xs font-bold text-amber-50 shadow hover:from-amber-800 hover:to-amber-950 transition"
                  >
                    🙏 {isKn ? "ಸೇವೆ ಕಾಯ್ದಿರಿಸಿ / ಅರ್ಪಿಸಿ (Book Vidya Seva)" : "Book Sacred Vidya Seva"}
                  </button>
                )}
              </div>

              <div className="rounded-xl bg-amber-200/60 p-3 border border-amber-300 text-amber-950 text-center font-bold">
                🙏 {isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರ ಆಶೀರ್ವಾದ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 99723 39362)" : "Chief Priest: Sri Shreeram Pandit (+91 99723 39362)"}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
