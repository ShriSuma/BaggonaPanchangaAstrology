import React, { useState, useMemo } from "react";
import Card from "../ui/Card";
import {
  buildCompleteVedicNumerologyProfile,
  type CompleteVedicNumerologyProfile,
  type VedicYogaDef,
  NAVAGRAHA_META
} from "../../features/sankhyashastra/vedicNumerologyEngine";
import { askGemini } from "../../core/GeminiEngine";

interface VedicGridDashaTabProps {
  selectedLang?: string;
  apiKey?: string;
  initialDevoteeName?: string;
  initialBirthDate?: string; // YYYY-MM-DD
}

export const VedicGridDashaTab: React.FC<VedicGridDashaTabProps> = ({
  selectedLang = "kn",
  apiKey = "",
  initialDevoteeName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  initialBirthDate = "1994-08-14"
}) => {
  const isKn = selectedLang === "kn";

  const [devoteeName, setDevoteeName] = useState<string>(initialDevoteeName);
  const [birthDateStr, setBirthDateStr] = useState<string>(initialBirthDate);
  const [targetDateStr, setTargetDateStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [userQuery, setUserQuery] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
  const [selectedYogaFilter, setSelectedYogaFilter] = useState<"all" | "positive" | "challenging">("all");

  // Parse Birth Date into Day, Month, Year
  const { day, month, year } = useMemo(() => {
    try {
      const parts = (birthDateStr || "1994-08-14").split("-");
      const y = parseInt(parts[0], 10) || 1994;
      const m = parseInt(parts[1], 10) || 8;
      const d = parseInt(parts[2], 10) || 14;
      return { day: d, month: m, year: y };
    } catch {
      return { day: 14, month: 8, year: 1994 };
    }
  }, [birthDateStr]);

  const targetDate = useMemo(() => {
    try {
      return targetDateStr ? new Date(targetDateStr) : new Date();
    } catch {
      return new Date();
    }
  }, [targetDateStr]);

  // Compute 100% Mathematical Vedic Numerology Profile
  const profile: CompleteVedicNumerologyProfile = useMemo(() => {
    return buildCompleteVedicNumerologyProfile(
      devoteeName || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee"),
      day,
      month,
      year,
      targetDate
    );
  }, [devoteeName, day, month, year, targetDate, isKn]);

  // Filtered Yogas
  const displayedYogas = useMemo(() => {
    const all = profile.yogasResult.activeYogas;
    if (selectedYogaFilter === "positive") return all.filter((y) => y.isPositive);
    if (selectedYogaFilter === "challenging") return all.filter((y) => !y.isPositive);
    return all;
  }, [profile.yogasResult.activeYogas, selectedYogaFilter]);

  // Generate AI Comprehensive Narrative using Gemini
  const handleGenerateAiNarrative = async () => {
    setIsAiGenerating(true);
    setAiAnalysisText(null);

    const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
    const prompt = `ನೀವು ಪ್ರಾಚೀನ ವೈದಿಕ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (ಸಾಂಖ್ಯ ಶಾಸ್ತ್ರ / ಅಂಕ ಜ್ಯೋತಿಷ್ಯ) ಮಹಾನ್ ತಜ್ಞರು.
ಭಕ್ತರ ವಿವರ:
- ಹೆಸರು: ${profile.devoteeName}
- ಜನ್ಮ ದಿನಾಂಕ: ${profile.birthDay}-${profile.birthMonth}-${profile.birthYear}
- ಮೂಲಾಂಕ (Psychic): ${profile.moolankInfo.moolank} (${profile.moolankInfo.rulingGraha.name.kn})
- ಭಾಗ್ಯಾಂಕ (Destiny): ${profile.bhagyankInfo.bhagyank} (${profile.bhagyankInfo.rulingGraha.name.kn})
- ನಾಮಾಂಕ (Chaldean): ${profile.nameInfo.namank} (${profile.nameInfo.rulingGraha.name.kn}) | Soul Urge: ${profile.nameInfo.soulUrge} | Personality: ${profile.nameInfo.personality}
- ವೇದಿಕ ಗ್ರಿಡ್ ಸಕ್ರಿಯ ಯೋಗಗಳು: ${profile.yogasResult.activeYogas.map((y) => y.name.kn).join(", ")}
- ಪ್ರಸ್ತುತ ಮಹಾದಶೆ: ${profile.nestedDasha.activeMahadasha.grahaMeta.name.kn} (${profile.nestedDasha.activeMahadasha.grahaNumber})
- ಪ್ರಸ್ತುತ ಅಂತರ್ದಶೆ: ${profile.nestedDasha.activeAntardasha.grahaMeta.name.kn} (${profile.nestedDasha.activeAntardasha.grahaNumber})
- ದಶಾ ಸಾಂದ್ರತೆಯ ಸ್ಥಿತಿ: ${profile.nestedDasha.multiplicityStatus.explanationKn}
- ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ: "${userQuery || "ಜೀವನದಲ್ಲಿ ವೃತ್ತಿ, ಆರ್ಥಿಕ ಪ್ರಗತಿ ಹಾಗೂ ಶಾಂತಿ"}"

ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನ ೫ ವಿಷಯಾಧಾರಿತ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳಲ್ಲಿ ಅತ್ಯಂತ ಆಳವಾದ, ನಿಖರವಾದ ಹಾಗೂ ಶಾಸ್ತ್ರೀಯ ಭವಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ ನೀಡಿ (ನಮಸ್ಕಾರ ಅಥವಾ ಪೀಠಿಕೆ ಇಲ್ಲದೆ ನೇರವಾಗಿ ಆರಂಭಿಸಿ):
೧. ಮೂಲಾಂಕ & ಭಾಗ್ಯಾಂಕ ಆಂತರಿಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ವೃತ್ತಿ ದಿಕ್ಕು
೨. ೩x೩ ವೇದಿಕ ಗ್ರಿಡ್ (ವಿಚಾರ, ಇಚ್ಛಾಶಕ್ತಿ, ಕಾಯಕ ತಲಗಳು) ಹಾಗೂ ಸಕ್ರಿಯ ಯೋಗಗಳ ಫಲ
೩. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಮಹಾದಶೆ & ಅಂತರ್ದಶೆ ಸಮಯ ಕಾಲಾವಧಿಯ ನಿಖರ ಫಲ
೪. ದಶಾ ಸಾಂದ್ರತೆಯ ಎಚ್ಚರಿಕೆ ಹಾಗೂ ಅನುಪಸ್ಥಿತ ಸಂಖ್ಯೆಗಳ ದೈನಂದಿನ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ
೫. ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ಮಹಾಬಲೇಶ್ವರ & ಗಣಪತಿ ಆಶೀರ್ವಾದ ಹಾಗೂ ಅಭಯ ಸಂದೇಶ

ಶುದ್ಧ ${selectedLang === "kn" ? "ಕನ್ನಡ" : selectedLang === "hi" ? "ಹಿಂದಿ" : selectedLang === "te" ? "ತೆಲುಗು" : selectedLang === "ta" ? "ತಮಿಳು" : "English"} ಭಾಷೆಯಲ್ಲಿ ಬರೆಯಿರಿ.`;

    try {
      const res = await askGemini(
        `Vedic Numerology Analysis for ${profile.devoteeName}`,
        prompt,
        activeKey,
        selectedLang,
        { raw: true, temperature: 0.2 }
      );
      setAiAnalysisText(res || "");
    } catch (err) {
      console.warn("AI Narrative fallback:", err);
      setAiAnalysisText(
        isKn
          ? `ಶ್ರೀ ${profile.devoteeName} ಅವರ ಮೂಲಾಂಕ ${profile.moolankInfo.moolank} (${profile.moolankInfo.rulingGraha.name.kn}) ಹಾಗೂ ಭಾಗ್ಯಾಂಕ ${profile.bhagyankInfo.bhagyank} (${profile.bhagyankInfo.rulingGraha.name.kn}) ಅತ್ಯಂತ ಪ್ರಬಲವಾದ ಗ್ರಹ ಯೋಗವನ್ನು ರೂಪಿಸುತ್ತವೆ. ಪ್ರಸ್ತುತ ${profile.nestedDasha.activeMahadasha.grahaMeta.name.kn} ಮಹಾದಶೆ ನಡೆಯುತ್ತಿದ್ದು, ${profile.nestedDasha.multiplicityStatus.explanationKn}`
          : `For ${profile.devoteeName}, Moolank ${profile.moolankInfo.moolank} (${profile.moolankInfo.rulingGraha.sanskritName}) and Bhagyank ${profile.bhagyankInfo.bhagyank} (${profile.bhagyankInfo.rulingGraha.sanskritName}) configure strong strategic capability. Currently running ${profile.nestedDasha.activeMahadasha.grahaMeta.sanskritName} Mahadasha.`
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 3x3 Grid Plane layout cells
  const gridRows = [
    { titleKn: "೧. ವಿಚಾರ / ಚಿಂತನ ತಲ (Thought Plane 3-1-9)", titleEn: "1. Thought Plane (3-1-9)", numbers: [3, 1, 9] },
    { titleKn: "೨. ಇಚ್ಛಾಶಕ್ತಿ & ವ್ಯಾಪಾರ ತಲ (Will / Business Plane 6-7-5)", titleEn: "2. Will / Business Plane (6-7-5)", numbers: [6, 7, 5] },
    { titleKn: "೩. ಕ್ರಿಯಾ / ಕಾಯಕ ತಲ (Action / Labor Plane 2-8-4)", titleEn: "3. Action Plane (2-8-4)", numbers: [2, 8, 4] }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Devotee Input Card */}
      <Card className="border border-amber-300/90 bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-orange-500/10 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-amber-200/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔢</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-950">
                {isKn ? "ವೈದಿಕ ಸಂಖ್ಯಾ ಜಾತಕ & ೩x೩ ಗ್ರಿಡ್ ವಿಶ್ಲೇಷಣೆ" : "Vedic Numerology Grid & Dasha Bhavishya"}
              </h2>
              <p className="text-xs text-amber-900/80">
                {isKn
                  ? "ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ, ನಾಮಾಂಕ, ೩೭ ಯೋಗಗಳು, ಮಹಾದಶೆ-ಅಂತರ್ದಶೆ & ಸಾಂದ್ರತಾ ಪರಿಹಾರಗಳು."
                  : "Moolank, Bhagyank, Namank, 37 Yogas Matrix, Nested Dashas & Missing Remedies."}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-amber-400 bg-amber-200/80 px-3 py-1 text-xs font-bold text-amber-950">
            {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ೧೦೦% ಗಣಿತ" : "100% Deterministic Vedic Math"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              👤 {isKn ? "ಭಕ್ತರ ಹೆಸರು (Devotee Name)" : "Devotee Name"}
            </label>
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
              placeholder={isKn ? "ಹೆಸರು ನಮೂದಿಸಿ..." : "Enter name..."}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              📅 {isKn ? "ಜನ್ಮ ದಿನಾಂಕ (Date of Birth)" : "Date of Birth"}
            </label>
            <input
              type="date"
              value={birthDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              ⏱️ {isKn ? "ದಶಾ ಭವಿಷ್ಯ ಗುರಿ ದಿನಾಂಕ (Target Date)" : "Target Prediction Date"}
            </label>
            <input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-bold text-amber-950 mb-1">
            ❓ {isKn ? "ವಿಶೇಷ ಪ್ರಶ್ನೆ / ವಿಚಾರಣೆ (ಐಚ್ಛಿಕ - Optional Life Question)" : "Optional Question"}
          </label>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
            placeholder={isKn ? "ಉದಾ: ಉದ್ಯೋಗ ಬಡ್ತಿ, ವ್ಯಾಪಾರ ಆರಂಭ, ವಿವಾಹ ಯೋಗ, ಆಸ್ತಿ ಖರೀದಿ..." : "e.g. Career promotion, new business, marriage timing..."}
          />
        </div>
      </Card>

      {/* 2. Core Variables Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Moolank Card */}
        <div className="rounded-2xl border border-amber-300/80 bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900/80">
              {isKn ? "ಮೂಲಾಂಕ (Psychic Number)" : "Moolank (Psychic)"}
            </span>
            <span className="text-xl font-black text-amber-700 bg-amber-100 rounded-full h-8 w-8 flex items-center justify-center">
              {profile.moolankInfo.moolank}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-amber-950">
            {profile.moolankInfo.rulingGraha.name[selectedLang] || profile.moolankInfo.rulingGraha.name.kn}
          </div>
          <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
            {profile.moolankInfo.rulingGraha.archetype[selectedLang] || profile.moolankInfo.rulingGraha.archetype.kn}
          </p>
          <div className="mt-2 text-[10px] text-amber-800 font-semibold">
            {isKn ? "ವಯಸ್ಸು ೩೫ ರವರೆಗಿನ ಆಂತರಿಕ ಮನಃಸ್ಥಿತಿ" : "Internal mindset until age 35"}
          </div>
        </div>

        {/* Bhagyank Card */}
        <div className="rounded-2xl border border-orange-300/80 bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-900/80">
              {isKn ? "ಭಾಗ್ಯಾಂಕ (Destiny Number)" : "Bhagyank (Destiny)"}
            </span>
            <span className="text-xl font-black text-orange-700 bg-orange-100 rounded-full h-8 w-8 flex items-center justify-center">
              {profile.bhagyankInfo.bhagyank}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-orange-950">
            {profile.bhagyankInfo.rulingGraha.name[selectedLang] || profile.bhagyankInfo.rulingGraha.name.kn}
          </div>
          <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
            {profile.bhagyankInfo.rulingGraha.archetype[selectedLang] || profile.bhagyankInfo.rulingGraha.archetype.kn}
          </p>
          <div className="mt-2 text-[10px] text-orange-800 font-semibold">
            {isKn ? "ವಯಸ್ಸು ೩೫ ರ ನಂತರದ ಕರ್ಮ ಹಾಗೂ ಜೀವಿತ ಪಥ" : "Post-35 career trajectory & destiny"}
          </div>
        </div>

        {/* Namank Card */}
        <div className="rounded-2xl border border-emerald-300/80 bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/80">
              {isKn ? "ನಾಮಾಂಕ (Chaldean Namank)" : "Chaldean Namank"}
            </span>
            <span className="text-xl font-black text-emerald-700 bg-emerald-100 rounded-full h-8 w-8 flex items-center justify-center">
              {profile.nameInfo.namank}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-950">
            {profile.nameInfo.rulingGraha.name[selectedLang] || profile.nameInfo.rulingGraha.name.kn}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            {isKn
              ? `ಚಾಲ್ಡಿಯನ್ ಮೊತ್ತ: ${profile.nameInfo.namankCompound} ➔ ಏಕಾಂಕ ${profile.nameInfo.namank}`
              : `Chaldean Compound: ${profile.nameInfo.namankCompound} ➔ Root ${profile.nameInfo.namank}`}
          </div>
          <div className="mt-2 text-[10px] text-emerald-800 font-semibold">
            {isKn ? "ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿ & ವಾಣಿಜ್ಯ ತರಂಗ" : "Public resonance & commercial power"}
          </div>
        </div>

        {/* Soul Urge & Personality Card */}
        <div className="rounded-2xl border border-indigo-300/80 bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900/80">
              {isKn ? "ಆತ್ಮೇಚ್ಛೆ & ವ್ಯಕ್ತಿತ್ವ (SU / Pn)" : "Soul Urge & Personality"}
            </span>
            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 rounded-lg px-2 py-1">
              SU: {profile.nameInfo.soulUrge} | Pn: {profile.nameInfo.personality}
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-950 font-semibold">
            {isKn
              ? `ಸ್ವರಗಳ ಮೊತ್ತ (Soul Urge): ${profile.nameInfo.soulUrge} | ವ್ಯಂಜನಗಳ ಮೊತ್ತ: ${profile.nameInfo.personality}`
              : `Vowels (Soul Urge): ${profile.nameInfo.soulUrge} | Consonants: ${profile.nameInfo.personality}`}
          </div>
          {profile.nameInfo.masterNumbers.length > 0 && (
            <div className="mt-1.5 inline-block rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-900">
              ⭐ {isKn ? "ಮಾಸ್ಟರ್ ಸಂಖ್ಯೆಗಳು" : "Master Numbers"}: {profile.nameInfo.masterNumbers.join(", ")}
            </div>
          )}
          {profile.nameInfo.karmicDebts.length > 0 && (
            <div className="mt-1 inline-block rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900">
              ⚖️ {isKn ? "ಕರ್ಮಿಕ ಋಣ ಸೂಚಕ" : "Karmic Debt"}: {profile.nameInfo.karmicDebts.join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* 3. 3x3 Navagraha Vedic Grid Visualizer */}
      <Card className="border border-amber-300/90 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3 mb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              📐 {isKn ? "೩x೩ ನವಗ್ರಹ ವೇದಿಕ ಗ್ರಿಡ್ (Vedic Grid Matrix Architecture)" : "3x3 Navagraha Vedic Grid Matrix"}
            </h3>
            <p className="text-xs text-amber-900/80">
              {isKn
                ? "ಶತಮಾನ ಅಂಕಿಗಳ ಹೊರಗಿಡುವಿಕೆ ನಿಯಮ (Century Excluded), ಸಂಯುಕ್ತ ಮೂಲಾಂಕ & ಭಾಗ್ಯಾಂಕ ಪ್ರವೇಶದೊಂದಿಗೆ."
                : "Century digits excluded (YY only), Compound Moolank & Bhagyank entered into fixed Navagraha coordinates."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {isKn ? "ಏಕ (ಸಮತೋಲಿತ)" : "Single (Balanced)"}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              {isKn ? "ದ್ವಿ (ಪ್ರಬಲ)" : "Double (Amplified)"}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              {isKn ? "ತ್ರಿ+ (ಅತಿ-ಸಾಂದ್ರತೆ)" : "Triple+ (Overload)"}
            </span>
          </div>
        </div>

        {/* 3x3 Matrix Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {gridRows.map((row, rIdx) => (
            <div key={rIdx} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5 flex flex-col justify-between">
              <div className="text-xs font-bold text-amber-900 mb-3 flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                <span>{isKn ? row.titleKn : row.titleEn}</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {row.numbers.map((num) => {
                  const cell = profile.gridMatrix.cells[num];
                  const hasCount = cell.count > 0;
                  const isDouble = cell.count === 2;
                  const isTriplePlus = cell.count >= 3;

                  let borderBg = "border-slate-200 bg-slate-50/60 text-slate-400 opacity-60";
                  if (cell.count === 1) {
                    borderBg = "border-emerald-300 bg-gradient-to-b from-emerald-50 to-white text-emerald-950 shadow-sm";
                  } else if (isDouble) {
                    borderBg = "border-amber-400 bg-gradient-to-b from-amber-100 to-amber-50 text-amber-950 shadow-md ring-2 ring-amber-300/70";
                  } else if (isTriplePlus) {
                    borderBg = "border-rose-400 bg-gradient-to-b from-rose-100 to-rose-50 text-rose-950 shadow-md ring-2 ring-rose-300/70";
                  }

                  return (
                    <div
                      key={num}
                      className={`relative rounded-xl border p-3 flex flex-col items-center justify-center transition hover:scale-[1.02] ${borderBg}`}
                    >
                      {/* Count Badge */}
                      <div className="absolute top-1.5 right-1.5">
                        {hasCount ? (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                              isDouble
                                ? "bg-amber-500 text-white"
                                : isTriplePlus
                                ? "bg-rose-500 text-white"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            ×{cell.count}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-200 px-1 py-0.2 text-[9px] font-bold text-slate-500">
                            0
                          </span>
                        )}
                      </div>

                      <div className="text-2xl font-black mb-0.5">{num}</div>
                      <div className="text-[11px] font-bold text-center leading-tight">
                        {cell.grahaMeta.sanskritName}
                      </div>
                      <div className="text-[9px] text-center text-slate-500 mt-0.5">
                        {cell.grahaMeta.name[selectedLang] || cell.grahaMeta.name.kn}
                      </div>

                      <div className="mt-1 text-[9px] font-semibold text-center">
                        {hasCount ? (
                          <span className={isDouble ? "text-amber-800" : isTriplePlus ? "text-rose-800 font-bold" : "text-emerald-700"}>
                            {cell.density === "single_balanced"
                              ? (isKn ? "ಏಕ ಸಂಖ್ಯೆ" : "Single")
                              : cell.density === "double_amplified"
                              ? (isKn ? "ದ್ವಿ ಪ್ರಬಲ" : "Double")
                              : (isKn ? "ತ್ರಿ+ ಒತ್ತಡ" : "Triple+")}
                          </span>
                        ) : (
                          <span className="text-slate-400">{isKn ? "ಅನುಪಸ್ಥಿತ" : "Missing"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900/80 flex justify-between">
                <span>{isKn ? "ಸಕ್ರಿಯ ಗ್ರಹಗಳು" : "Active Digits"}:</span>
                <span className="font-bold">
                  {row.numbers.filter((n) => profile.gridMatrix.cells[n].count > 0).length} / 3
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Complete 37 Yogas Parser Section */}
      <Card className="border border-amber-300/90 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3 mb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              ✨ {isKn ? "ಸಕ್ರಿಯ ಸಂಖ್ಯಾ ಯೋಗಗಳು (Active Vedic Yogas)" : "Active Vedic Yogas Analysis"}
            </h3>
            <p className="text-xs text-amber-900/80">
              {isKn
                ? `ಒಟ್ಟು ೩೭ ಯೋಗಗಳ ಪೈಕಿ ನಿಮ್ಮ ವೇದಿಕ ಗ್ರಿಡ್‌ನಲ್ಲಿ ${profile.yogasResult.activeYogas.length} ಯೋಗಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.`
                : `${profile.yogasResult.activeYogas.length} of 37 classical Yogas parsed active in your birth grid.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedYogaFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedYogaFilter === "all"
                  ? "bg-amber-800 text-white shadow-sm"
                  : "bg-amber-100/60 text-amber-900 hover:bg-amber-200/60"
              }`}
            >
              {isKn ? "ಎಲ್ಲಾ ಯೋಗಗಳು" : "All"} ({profile.yogasResult.activeYogas.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedYogaFilter("positive")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedYogaFilter === "positive"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-emerald-100/60 text-emerald-900 hover:bg-emerald-200/60"
              }`}
            >
              🟢 {isKn ? "ಶುಭ ಯೋಗಗಳು" : "Auspicious"} ({profile.yogasResult.positiveYogasCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedYogaFilter("challenging")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedYogaFilter === "challenging"
                  ? "bg-rose-700 text-white shadow-sm"
                  : "bg-rose-100/60 text-rose-900 hover:bg-rose-200/60"
              }`}
            >
              🟠 {isKn ? "ಎಚ್ಚರಿಕೆಯ ಯೋಗಗಳು" : "Cautionary"} ({profile.yogasResult.challengingYogasCount})
            </button>
          </div>
        </div>

        {displayedYogas.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            {isKn ? "ಯಾವುದೇ ಯೋಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ." : "No Yogas found in this filter."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedYogas.map((yoga) => (
              <div
                key={yoga.id}
                className={`rounded-2xl border p-4 transition hover:shadow-md ${
                  yoga.isPositive
                    ? "border-emerald-200/90 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/20"
                    : "border-amber-200/90 bg-gradient-to-r from-amber-50/40 via-white to-orange-50/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-black ${
                        yoga.isPositive ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                      }`}
                    >
                      {yoga.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {yoga.name[selectedLang] || yoga.name.kn}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                    {yoga.combination.join(" - ")}
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {yoga.manifestation[selectedLang] || yoga.manifestation.kn}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span>
                    {isKn ? "ವರ್ಗೀಕರಣ" : "Category"}:{" "}
                    <strong>
                      {yoga.planeOrType === "plane"
                        ? (isKn ? "ಪೂರ್ಣ ತಲ ಯೋಗ" : "Full Plane Yoga")
                        : yoga.planeOrType === "strategic_triad"
                        ? (isKn ? "ಕಾರ್ಯತಂತ್ರ ತ್ರಿಕೋಣ ಯೋಗ" : "Strategic Triad")
                        : (isKn ? "ದ್ವಿ-ಗ್ರಹ ಸಂಯೋಗ" : "Dual Vibration")}
                    </strong>
                  </span>
                  <span className={yoga.isPositive ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {yoga.isPositive ? (isKn ? "✓ ಶುಭ ಸಿದ್ಧಿ" : "✓ Auspicious") : (isKn ? "⚠️ ಪರಿಹಾರ ಸಹಿತ ಜಯ" : "⚠️ Requires Discipline")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5. Nested Dasha Temporal Timeline & Multiplicity Alert */}
      <Card className="border border-amber-300/90 bg-white p-5 shadow-sm">
        <div className="border-b border-amber-200 pb-3 mb-4">
          <h3 className="font-serif text-base font-bold text-amber-950">
            ⏳ {isKn ? "ನೆಸ್ಟೆಡ್ ದಶಾ ಕಾಲಚಕ್ರ (Nested Temporal Dasha Timeline)" : "Nested Dasha Predictive Engine"}
          </h3>
          <p className="text-xs text-amber-900/80">
            {isKn
              ? `೪೫-ವರ್ಷಗಳ ಮಹಾದಶೆ (MD), ವಾರ್ಷಿಕ ಅಂತರ್ದಶೆ (AD), ಪ್ರತ್ಯಂತರ್ದಶೆ (PD - ೮ ದಿನಗಳ ಸೂತ್ರ), ದಿನದರ್ಶನ (${profile.nestedDasha.targetDate.toISOString().split("T")[0]}).`
              : `Mahadasha (MD), Annual Antardasha (AD), Pratyantardasha (PD - Rule of 8), Daily Dasha (DD) and Hourly Dasha (HD).`}
          </p>
        </div>

        {/* Multiplicity Alert Banner */}
        <div
          className={`rounded-2xl border p-4 mb-4 ${
            profile.nestedDasha.multiplicityStatus.isOverload
              ? "border-rose-300 bg-rose-50/80 text-rose-950"
              : profile.nestedDasha.multiplicityStatus.isSmoothPhase
              ? "border-emerald-300 bg-emerald-50/80 text-emerald-950"
              : "border-amber-300 bg-amber-50/80 text-amber-950"
          }`}
        >
          <div className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
            <span>
              {profile.nestedDasha.multiplicityStatus.isOverload
                ? "⚠️"
                : profile.nestedDasha.multiplicityStatus.isSmoothPhase
                ? "🟢"
                : "🟡"}
            </span>
            <span>
              {isKn ? "ದಶಾ ಗ್ರಹ ತರಂಗ ವಿಶ್ಲೇಷಣೆ" : "Dasha Frequency & Multiplicity Diagnosis"}
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            {isKn
              ? profile.nestedDasha.multiplicityStatus.explanationKn
              : profile.nestedDasha.multiplicityStatus.explanationEn}
          </p>
        </div>

        {/* 4 Dasha Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {isKn ? "ಮಹಾದಶೆ (Mahadasha)" : "Mahadasha (MD)"}
            </div>
            <div className="mt-1 text-lg font-black text-amber-950">
              {profile.nestedDasha.activeMahadasha.grahaMeta.name[selectedLang] || profile.nestedDasha.activeMahadasha.grahaMeta.name.kn} ({profile.nestedDasha.activeMahadasha.grahaNumber})
            </div>
            <div className="mt-1 text-[11px] text-slate-600">
              {isKn
                ? `ವಯಸ್ಸು: ${profile.nestedDasha.activeMahadasha.startAge} ರಿಂದ ${profile.nestedDasha.activeMahadasha.endAge} ರವರೆಗೆ (${profile.nestedDasha.activeMahadasha.durationYears} ವರ್ಷ)`
                : `Ages ${profile.nestedDasha.activeMahadasha.startAge} - ${profile.nestedDasha.activeMahadasha.endAge} (${profile.nestedDasha.activeMahadasha.durationYears} yrs)`}
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
              {isKn ? "ವಾರ್ಷಿಕ ಅಂತರ್ದಶೆ (Antardasha)" : "Antardasha (AD)"}
            </div>
            <div className="mt-1 text-lg font-black text-orange-950">
              {profile.nestedDasha.activeAntardasha.grahaMeta.name[selectedLang] || profile.nestedDasha.activeAntardasha.grahaMeta.name.kn} ({profile.nestedDasha.activeAntardasha.grahaNumber})
            </div>
            <div className="mt-1 text-[10px] text-slate-600 font-mono">
              {profile.nestedDasha.activeAntardasha.formulaDetails}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
              {isKn ? "ಪ್ರತ್ಯಂತರ್ದಶೆ (Rule of 8)" : "Pratyantardasha (PD)"}
            </div>
            <div className="mt-1 text-lg font-black text-indigo-950">
              {profile.nestedDasha.activePratyantardasha.grahaMeta.name[selectedLang] || profile.nestedDasha.activePratyantardasha.grahaMeta.name.kn} ({profile.nestedDasha.activePratyantardasha.grahaNumber})
            </div>
            <div className="mt-1 text-[11px] text-slate-600">
              {isKn
                ? `ಅವಧಿ: ${profile.nestedDasha.activePratyantardasha.subPeriodDays} ದಿನಗಳು (೩೬೦-ದಿನ ಸೂತ್ರ)`
                : `Duration: ${profile.nestedDasha.activePratyantardasha.subPeriodDays} days (Rule of 8)`}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              {isKn ? "ದೈನಂದಿನ & ಗಂಟೆಯ ದಶೆ (DD / HD)" : "Daily & Hourly Dasha"}
            </div>
            <div className="mt-1 text-base font-black text-emerald-950">
              DD: {profile.nestedDasha.activeDailyDasha.grahaNumber} ({profile.nestedDasha.activeDailyDasha.grahaMeta.sanskritName})
            </div>
            <div className="mt-1 text-[11px] text-slate-600">
              HD: {profile.nestedDasha.activeHourlyDasha.grahaNumber} ({profile.nestedDasha.activeHourlyDasha.grahaMeta.sanskritName})
            </div>
          </div>
        </div>

        {/* Mahadasha Timeline Progress Bar */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-bold text-slate-800 mb-2">
            {isKn ? "೧೦೦-ವರ್ಷಗಳ ನಿರಂತರ ಮಹಾದಶಾ ಕಾಲಾವಧಿ ಸೂಚಿ:" : "100-Year Sequential Mahadasha Timeline:"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.nestedDasha.mahadashaTimeline.map((span, idx) => {
              const isActive =
                profile.nestedDasha.currentAge >= span.startAge &&
                profile.nestedDasha.currentAge < span.endAge;
              return (
                <div
                  key={idx}
                  className={`rounded-lg border px-2.5 py-1.5 text-center transition ${
                    isActive
                      ? "border-amber-500 bg-amber-600 text-white shadow-md font-bold scale-105"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold">
                    {span.grahaMeta.sanskritName} ({span.grahaNumber})
                  </div>
                  <div className="text-[9px] opacity-90">
                    {span.startAge} - {span.endAge} {isKn ? "ವಯಸ್ಸು" : "yrs"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 6. Missing Numbers & Remediation Matrix */}
      {profile.missingRemedies.length > 0 && (
        <Card className="border border-rose-300/80 bg-white p-5 shadow-sm">
          <div className="border-b border-rose-200 pb-3 mb-4">
            <h3 className="font-serif text-base font-bold text-rose-950">
              🪔 {isKn ? "ಅನುಪಸ್ಥಿತ ಗ್ರಹ ಸಂಖ್ಯೆಗಳ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರಗಳು (Missing Numbers Remediation)" : "Missing Numbers Remediation Matrix"}
            </h3>
            <p className="text-xs text-rose-900/80">
              {isKn
                ? "ನಿಮ್ಮ ವೇದಿಕ ಗ್ರಿಡ್‌ನಲ್ಲಿ ಇಲ್ಲದ ಸಂಖ್ಯೆಗಳನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ಈ ಕೆಳಗಿನ ದೈನಂದಿನ ಅಭ್ಯಾಸಗಳನ್ನು ಪಾಲಿಸಿ."
                : "Practical lifestyle adjustments, sacred items, and Vedic mantras to balance missing planetary grid energies."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.missingRemedies.map((rem) => (
              <div key={rem.number} className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    {rem.number}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-rose-950">
                      {rem.planet.name[selectedLang] || rem.planet.name.kn} ({rem.planet.sanskritName})
                    </h4>
                    <span className="text-[10px] text-rose-800">
                      {rem.planet.element[selectedLang] || rem.planet.element.kn} | {rem.planet.direction[selectedLang] || rem.planet.direction.kn}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>
                    <strong>{isKn ? "ದೈನಂದಿನ ಪರಿಹಾರ" : "Daily Action"}:</strong>{" "}
                    {rem.remedyActions[selectedLang] || rem.remedyActions.kn}
                  </p>
                  <p>
                    <strong>{isKn ? "ಜೀವನಶೈಲಿ ಹೊಂದಾಣಿಕೆ" : "Lifestyle"}:</strong>{" "}
                    {rem.lifestyleAdjustment[selectedLang] || rem.lifestyleAdjustment.kn}
                  </p>
                  <p>
                    <strong>{isKn ? "ಪವಿತ್ರ ವಸ್ತು/ಚಿಹ್ನೆ" : "Sacred Item"}:</strong>{" "}
                    {rem.sacredSymbolOrItem[selectedLang] || rem.sacredSymbolOrItem.kn}
                  </p>
                  <div className="rounded bg-rose-100/70 p-2 font-mono text-[11px] text-rose-900 font-semibold mt-2">
                    🕉️ {rem.mantra}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. AI Predictive Synthesis Button & Output */}
      <Card className="border border-amber-400 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              🔮 {isKn ? "ವೇದಿಕ ಸಂಖ್ಯಾ ಜಾತಕ ಸಂಪೂರ್ಣ ವಿವರಣಾತ್ಮಕ ಭವಿಷ್ಯ" : "Generate Deep AI Vedic Numerology Prediction"}
            </h3>
            <p className="text-xs text-amber-900/80">
              {isKn
                ? "ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ, ೩x೩ ಗ್ರಿಡ್, ಯೋಗಗಳು ಹಾಗೂ ದಶಾ ಚಕ್ರವನ್ನು ಸಂಯೋಜಿಸಿ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ."
                : "Synthesize all mathematical parameters into a comprehensive 5-paragraph Vedic prediction."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiNarrative}
            disabled={isAiGenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
          >
            <span>{isAiGenerating ? "⌛" : "✨"}</span>
            <span>
              {isAiGenerating
                ? (isKn ? "ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating Prediction...")
                : (isKn ? "ಸಂಪೂರ್ಣ ಭವಿಷ್ಯ ಫಲ ಪಡೆಯಿರಿ" : "Generate Full Reading")}
            </span>
          </button>
        </div>

        {aiAnalysisText && (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-white p-5 shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {aiAnalysisText}
          </div>
        )}
      </Card>
    </div>
  );
};
