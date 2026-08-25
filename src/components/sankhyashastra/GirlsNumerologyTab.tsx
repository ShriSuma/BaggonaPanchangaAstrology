import React, { useState } from "react";
import Card from "../ui/Card";
import {
  getGirlsNumerologyProfile,
  calculatePostMarriageNameImpact,
  type GirlsNumerologyProfile,
  type PostMarriageNameImpact
} from "../../features/sankhyashastra/sankhyaNumerologyUtils";

type Props = {
  lang: string;
  defaultName?: string;
  defaultDob?: string;
};

export const GirlsNumerologyTab: React.FC<Props> = ({
  lang,
  defaultName = "Lakshmi Hegde",
  defaultDob = "1996-09-24"
}) => {
  const isKn = lang === "kn";

  const [name, setName] = useState<string>(defaultName);
  const [dob, setDob] = useState<string>(defaultDob);

  // Post marriage name change inputs
  const [maidenName, setMaidenName] = useState<string>(defaultName);
  const [marriedName, setMarriedName] = useState<string>("Lakshmi Sharma");

  const [profile, setProfile] = useState<GirlsNumerologyProfile>(() =>
    getGirlsNumerologyProfile(name, dob)
  );

  const [nameImpact, setNameImpact] = useState<PostMarriageNameImpact>(() =>
    calculatePostMarriageNameImpact(maidenName, marriedName, profile.mulank)
  );

  const handleRecalculateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(getGirlsNumerologyProfile(name, dob));
  };

  const handleRecalculateNameImpact = (e: React.FormEvent) => {
    e.preventDefault();
    setNameImpact(calculatePostMarriageNameImpact(maidenName, marriedName, profile.mulank));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-pink-300/80 bg-gradient-to-r from-pink-500/10 via-rose-100/60 to-purple-500/10 p-5 shadow-sm">
        <div>
          <h2 className="font-serif text-lg font-bold text-pink-950 flex items-center gap-2">
            <span>👧</span>
            <span>
              {isKn
                ? "ಮಹಿಳಾ ಸಂಖ್ಯಾ ಸೌಭಾಗ್ಯ, ವಿವಾಹ ನಾಮ ಪರಿಷ್ಕರಣೆ & ಸಮೃದ್ಧಿ (Girls' Special Numerology Grace Matrix)"
                : "Girls' Special Numerology Grace, Marriage Name Impact & Prosperity Matrix"}
            </span>
          </h2>
          <p className="mt-1 text-xs text-pink-900/80">
            {isKn
              ? "ಸೌಭಾಗ್ಯ ಶಕ್ತಿ, ವಿವಾಹದ ನಂತರ ಹೆಸರು ಬದಲಾವಣೆ ವಿಶ್ಲೇಷಣೆ, ಗೃಹ ಶಾಂತಿ ಸೂಚ್ಯಂಕ ಹಾಗೂ ಮಹಿಳಾ ಸ್ವಾವಲಂಬನೆಗೆ ದೈವಿಕ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ."
              : "Saubhagya aura vibrations, post-marriage surname change impact calculator, domestic bliss & entrepreneurial empowerment."}
          </p>
        </div>
      </div>

      {/* Input Parameters */}
      <Card className="border border-pink-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleRecalculateProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-950 mb-1">
              👤 {isKn ? "ಪೂರ್ಣ ಹೆಸರು (Full Name)" : "Full Name (English)"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lakshmi Hegde"
              className="w-full rounded-xl border border-pink-300 bg-pink-50/30 px-3.5 py-2 text-sm font-bold text-pink-950 shadow-inner focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-950 mb-1">
              📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth)" : "Birth Date"}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-pink-300 bg-pink-50/30 px-3.5 py-2 text-xs font-bold text-pink-950 shadow-inner focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 via-pink-700 to-purple-800 py-2.5 text-xs font-bold text-white shadow hover:from-pink-700 hover:to-purple-900 transition flex items-center justify-center gap-1.5"
            >
              <span>🌸</span>
              <span>{isKn ? "ಸೌಭಾಗ್ಯ ದರ್ಶನ" : "Generate Profile"}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Saubhagya & Grace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Core Numbers & Saubhagya Aura */}
        <Card className="border border-pink-200 bg-gradient-to-br from-pink-50/60 to-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-pink-950 border-b border-pink-200 pb-2 flex items-center gap-2">
            <span>✨</span>
            <span>{isKn ? "ಮೂಲಾಂಕ & ದೈವಿಕ ಸೌಭಾಗ್ಯ ಶಕ್ತಿ" : "Root & Saubhagya Grace"}</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-pink-100/70 border border-pink-200 p-3">
              <div className="text-[10px] font-bold text-pink-800 uppercase">ಮೂಲಾಂಕ (Root)</div>
              <div className="text-2xl font-black text-pink-950 mt-1">{profile.mulank}</div>
              <div className="text-[10px] text-pink-700 font-semibold">{profile.rulerKn}</div>
            </div>

            <div className="rounded-xl bg-pink-100/70 border border-pink-200 p-3">
              <div className="text-[10px] font-bold text-pink-800 uppercase">ಭಾಗ್ಯಾಂಕ (Destiny)</div>
              <div className="text-2xl font-black text-pink-950 mt-1">{profile.bhagyank}</div>
              <div className="text-[10px] text-pink-700 font-semibold">Life Path</div>
            </div>

            <div className="rounded-xl bg-pink-100/70 border border-pink-200 p-3">
              <div className="text-[10px] font-bold text-pink-800 uppercase">ನಾಮಾಂಕ (Chaldean)</div>
              <div className="text-2xl font-black text-pink-950 mt-1">{profile.nameChaldean}</div>
              <div className="text-[10px] text-pink-700 font-semibold">ಏಕಾಂಕ {profile.nameSingle}</div>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-pink-200">
            {isKn ? profile.saubhagyaVirtuesKn : profile.saubhagyaVirtuesEn}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-pink-50 p-2.5 border border-pink-200">
              <span className="font-bold text-pink-900 block mb-0.5">🎨 ಶುಭ ವರ್ಣಗಳು (Aura):</span>
              <span className="text-slate-800 font-semibold">{isKn ? profile.auraColorsKn : profile.auraColorsEn}</span>
            </div>
            <div className="rounded-xl bg-pink-50 p-2.5 border border-pink-200">
              <span className="font-bold text-pink-900 block mb-0.5">💎 ಸೌಭಾಗ್ಯ ರತ್ನ (Gemstone):</span>
              <span className="text-slate-800 font-semibold">{isKn ? profile.gemstoneAuraKn : profile.gemstoneAuraEn}</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Domestic Bliss & Women's Empowerment */}
        <Card className="border border-pink-200 bg-gradient-to-br from-purple-50/60 to-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-purple-950 border-b border-purple-200 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🏠</span>
              <span>{isKn ? "ಗೃಹ ಶಾಂತಿ & ಮಹಿಳಾ ಸಬಲೀಕರಣ" : "Domestic Harmony & Career Empowerment"}</span>
            </span>
            <span className="text-xs bg-purple-100 text-purple-900 font-black px-2.5 py-0.5 rounded-full border border-purple-300">
              Harmony: {profile.domesticHarmonyScore}%
            </span>
          </h3>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-purple-200">
            {isKn ? profile.domesticHarmonyKn : profile.domesticHarmonyEn}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-bold text-purple-950">
              🌟 {isKn ? "ಸ್ವಾವಲಂಬನೆ & ವೃತ್ತಿ ಪ್ರಗತಿಗೆ ಸೂಕ್ತ ಕ್ಷೇತ್ರಗಳು:" : "Best Avenues for Growth & Independence:"}
            </div>
            <div className="space-y-1.5">
              {(isKn ? profile.empowermentAvenuesKn : profile.empowermentAvenuesEn).map((av, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-purple-50/70 border border-purple-200/80 p-2 text-xs font-bold text-purple-950"
                >
                  <span className="text-purple-700">✓</span>
                  <span>{av}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-300 p-3 space-y-1">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>🪔</span>
              <span>{isKn ? "ದೈವಿಕ ಮಹಾಲಕ್ಷ್ಮಿ ಮಂತ್ರ (Goddess Grace Mantra):" : "Daily Goddess Mantra:"}</span>
            </div>
            <p className="text-xs font-serif font-bold text-amber-900">
              {isKn ? profile.goddessMantraKn : profile.goddessMantraEn}
            </p>
          </div>
        </Card>
      </div>

      {/* Post-Marriage Name Change Impact Analyzer */}
      <Card className="border-2 border-pink-300 bg-gradient-to-br from-white via-pink-50/40 to-rose-50/50 p-6 shadow-md space-y-5">
        <div className="border-b border-pink-200 pb-3">
          <h3 className="font-serif text-base font-bold text-pink-950 flex items-center gap-2">
            <span>💍</span>
            <span>
              {isKn
                ? "ವಿವಾಹದ ನಂತರ ಹೆಸರು / ಸರ್‌ನೇಮ್ ಬದಲಾವಣೆ ವಿಶ್ಲೇಷಣೆ (Post-Marriage Name Impact)"
                : "Post-Marriage Surname Change Impact Analyzer"}
            </span>
          </h3>
          <p className="text-xs text-pink-900/80 mt-1">
            {isKn
              ? "ಮದುವೆಗೆ ಮುಂಚಿನ ಹೆಸರು (Maiden Name) ಹಾಗೂ ಮದುವೆಯ ನಂತರದ ಹೆಸರಿನ (Married Name) ಸಂಖ್ಯಾ ಕಂಪನಗಳನ್ನು ಹೋಲಿಸಿ ನೂತನ ಹೆಸರಿನ ಭಾಗ್ಯೋದಯ ತಿಳಿಯಿರಿ."
              : "Compare maiden name vibration with married surname vibration to ensure maximum marital harmony and fortune."}
          </p>
        </div>

        <form onSubmit={handleRecalculateNameImpact} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-950 mb-1">
              👰 {isKn ? "ಮದುವೆಗೆ ಮುಂಚಿನ ಹೆಸರು (Maiden Name)" : "Maiden Name"}
            </label>
            <input
              type="text"
              value={maidenName}
              onChange={(e) => setMaidenName(e.target.value)}
              placeholder="e.g. Lakshmi Hegde"
              className="w-full rounded-xl border border-pink-300 bg-white px-3.5 py-2 text-sm font-bold text-pink-950 shadow-inner focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-950 mb-1">
              💍 {isKn ? "ಮದುವೆಯ ನಂತರದ ಹೆಸರು (Married Name)" : "Married Name (with Husband's Surname)"}
            </label>
            <input
              type="text"
              value={marriedName}
              onChange={(e) => setMarriedName(e.target.value)}
              placeholder="e.g. Lakshmi Sharma"
              className="w-full rounded-xl border border-pink-300 bg-white px-3.5 py-2 text-sm font-bold text-pink-950 shadow-inner focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-rose-700 py-2.5 text-xs font-bold text-white shadow hover:from-pink-700 hover:to-rose-800 transition flex items-center justify-center gap-1.5"
            >
              <span>🔍</span>
              <span>{isKn ? "ಸ್ಪಂದನ ಪರೀಕ್ಷಿಸಿ" : "Analyze Name Shift"}</span>
            </button>
          </div>
        </form>

        {/* Impact Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">👰 ಮದುವೆಗೆ ಮುಂಚಿನ ಹೆಸರು</div>
            <div className="text-base font-bold text-slate-900">{nameImpact.maidenName}</div>
            <div className="text-xs font-semibold text-slate-700">
              ಶಾಲ್ಡಿಯನ್ ಒಟ್ಟು: <span className="font-bold text-slate-950">{nameImpact.maidenChaldean}</span> (ಏಕಾಂಕ: {nameImpact.maidenSingle} - {nameImpact.maidenRulerKn})
            </div>
          </div>

          <div className="rounded-xl border border-pink-300 bg-pink-100/50 p-4 space-y-1 shadow-sm">
            <div className="text-[10px] font-bold text-pink-800 uppercase">💍 ಮದುವೆಯ ನಂತರದ ಹೊಸ ಹೆಸರು</div>
            <div className="text-base font-bold text-pink-950">{nameImpact.marriedName}</div>
            <div className="text-xs font-semibold text-pink-900">
              ಶಾಲ್ಡಿಯನ್ ಒಟ್ಟು: <span className="font-bold text-pink-950">{nameImpact.marriedChaldean}</span> (ಏಕಾಂಕ: {nameImpact.marriedSingle} - {nameImpact.marriedRulerKn})
            </div>
          </div>
        </div>

        {/* Verdict & Actionable Advice */}
        <div className="rounded-2xl border border-pink-200 bg-white p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-pink-950">
              {isKn ? nameImpact.impactKn : nameImpact.impactEn}
            </div>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                nameImpact.impactCategory === "highly_empowering"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : nameImpact.impactCategory === "caution"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-blue-100 text-blue-900 border border-blue-300"
              }`}
            >
              Score: {nameImpact.impactScore}%
            </span>
          </div>

          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {isKn ? nameImpact.adviceKn : nameImpact.adviceEn}
          </p>
        </div>
      </Card>
    </div>
  );
};
