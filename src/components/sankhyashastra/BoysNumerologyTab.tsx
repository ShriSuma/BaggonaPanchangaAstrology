import React, { useState } from "react";
import Card from "../ui/Card";
import {
  getBoysNumerologyProfile,
  type BoysNumerologyProfile
} from "../../features/sankhyashastra/sankhyaNumerologyUtils";

type Props = {
  lang: string;
  defaultName?: string;
  defaultDob?: string;
};

export const BoysNumerologyTab: React.FC<Props> = ({
  lang,
  defaultName = "Srikanth Sharma",
  defaultDob = "1994-06-15"
}) => {
  const isKn = lang === "kn";

  const [name, setName] = useState<string>(defaultName);
  const [dob, setDob] = useState<string>(defaultDob);

  const [profile, setProfile] = useState<BoysNumerologyProfile>(() =>
    getBoysNumerologyProfile(name, dob)
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(getBoysNumerologyProfile(name, dob));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-300/80 bg-gradient-to-r from-blue-500/10 via-sky-100/60 to-indigo-500/10 p-5 shadow-sm">
        <div>
          <h2 className="font-serif text-lg font-bold text-blue-950 flex items-center gap-2">
            <span>👦</span>
            <span>
              {isKn
                ? "ಪುರುಷ ಸಂಖ್ಯಾ ಭಾಗ್ಯ, ವೃತ್ತಿ & ಅಧಿಕಾರ ಯೋಗ (Boys' Special Numerology Power Matrix)"
                : "Boys' Special Numerology Power, Wealth & Career Matrix"}
            </span>
          </h2>
          <p className="mt-1 text-xs text-blue-900/80">
            {isKn
              ? "ವೃತ್ತಿ & ವ್ಯಾಪಾರ ಸಿದ್ಧಿ, ಸರ್ವೋಚ್ಚ ಆದಾಯದ ವಯೋಮಾನ, ಅಧಿಕಾರಯುತ ವಾಹನ ಸಂಖ್ಯೆಗಳು ಹಾಗೂ ನಾಯಕತ್ವದ ದೈವಿಕ ಸಂಖ್ಯಾ ಮಾರ್ಗದರ್ಶನ."
              : "High-earning career sectors, peak financial wealth ages, power vehicle numbers & executive leadership guidance."}
          </p>
        </div>
      </div>

      {/* Input Parameters */}
      <Card className="border border-blue-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-950 mb-1">
              👤 {isKn ? "ಪೂರ್ಣ ಹೆಸರು (Full Name)" : "Full Name (English)"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Srikanth Sharma"
              className="w-full rounded-xl border border-blue-300 bg-blue-50/30 px-3.5 py-2 text-sm font-bold text-blue-950 shadow-inner focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-950 mb-1">
              📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth)" : "Birth Date"}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-blue-300 bg-blue-50/30 px-3.5 py-2 text-xs font-bold text-blue-950 shadow-inner focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 py-2.5 text-xs font-bold text-white shadow hover:from-blue-800 hover:to-indigo-950 transition flex items-center justify-center gap-1.5"
            >
              <span>⚡</span>
              <span>{isKn ? "ಭಾಗ್ಯೋದಯ ಗಣಿಸಿ" : "Generate Profile"}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Power Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Core Numbers & Planetary Authority */}
        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-blue-950 border-b border-blue-200 pb-2 flex items-center gap-2">
            <span>👑</span>
            <span>{isKn ? "ಮೂಲಾಂಕ & ನಾಯಕತ್ವ ಪ್ರಭುತ್ವ" : "Root & Destiny Rulers"}</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-blue-100/70 border border-blue-200 p-3">
              <div className="text-[10px] font-bold text-blue-800 uppercase">ಮೂಲಾಂಕ (Root)</div>
              <div className="text-2xl font-black text-blue-950 mt-1">{profile.mulank}</div>
              <div className="text-[10px] text-blue-700 font-semibold">{profile.rulerKn}</div>
            </div>

            <div className="rounded-xl bg-blue-100/70 border border-blue-200 p-3">
              <div className="text-[10px] font-bold text-blue-800 uppercase">ಭಾಗ್ಯಾಂಕ (Destiny)</div>
              <div className="text-2xl font-black text-blue-950 mt-1">{profile.bhagyank}</div>
              <div className="text-[10px] text-blue-700 font-semibold">Life Path</div>
            </div>

            <div className="rounded-xl bg-blue-100/70 border border-blue-200 p-3">
              <div className="text-[10px] font-bold text-blue-800 uppercase">ನಾಮಾಂಕ (Chaldean)</div>
              <div className="text-2xl font-black text-blue-950 mt-1">{profile.nameChaldean}</div>
              <div className="text-[10px] text-blue-700 font-semibold">ಏಕಾಂಕ {profile.nameSingle}</div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-blue-200 p-3 text-xs text-blue-950 space-y-1">
            <div className="font-bold text-blue-900">
              💼 {isKn ? "ಶುಭ ಕಾರ್ಪೊರೇಟ್ ಬಿರುದುಗಳು (Corporate Titles):" : "Lucky Executive Titles:"}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(isKn ? profile.luckyCorporateTitlesKn : profile.luckyCorporateTitlesEn).map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-900"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Card 2: Peak Financial Wealth Ages & Cycle */}
        <Card className="border border-blue-200 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-blue-950 border-b border-blue-200 pb-2 flex items-center gap-2">
            <span>📈</span>
            <span>{isKn ? "ಧನ ಯೋಗ & ಸರ್ವೋಚ್ಚ ಭಾಗ್ಯೋದಯ ವಯೋಮಾನ" : "Peak Financial Success Ages"}</span>
          </h3>

          <div className="rounded-xl bg-white border border-indigo-200 p-3.5 space-y-1.5">
            <div className="text-xs font-bold text-indigo-950">
              🏆 {isKn ? "ಬದುಕಿನಲ್ಲಿ ಗರಿಷ್ಠ ಆದಾಯ & ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯ ವಯಸ್ಸು:" : "Peak Earning & Empire Building Ages:"}
            </div>
            <div className="text-xs font-extrabold text-indigo-800 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
              {isKn ? profile.peakSuccessAgesKn : profile.peakSuccessAgesEn}
            </div>
          </div>

          <div className="rounded-xl bg-white border border-indigo-200 p-3.5 space-y-1">
            <div className="text-xs font-bold text-indigo-950">
              💰 {isKn ? "ಮಾಸಿಕ ಆರ್ಥಿಕ ಹೂಡಿಕೆ ಕಾಲಚಕ್ರ:" : "Monthly Wealth Timing:"}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {isKn ? profile.financialCycleKn : profile.financialCycleEn}
            </p>
          </div>
        </Card>

        {/* Card 3: Top Career & High-Profit Industries */}
        <Card className="border border-blue-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="font-serif text-sm font-bold text-blue-950 border-b border-blue-200 pb-2 flex items-center gap-2">
            <span>🚀</span>
            <span>{isKn ? "ಸರ್ವೋತ್ತಮ ವೃತ್ತಿ & ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರಗಳು" : "Best Career & Business Domains"}</span>
          </h3>

          <div className="space-y-2">
            {(isKn ? profile.careerDomainsKn : profile.careerDomainsEn).map((domain, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl bg-blue-50/70 border border-blue-200/80 p-2.5 text-xs font-bold text-blue-950"
              >
                <span className="text-blue-700">★</span>
                <span>{domain}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card 4: Authority Vehicles & Power Mantra */}
        <Card className="border border-blue-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-blue-950 border-b border-blue-200 pb-2 flex items-center gap-2">
            <span>🚗</span>
            <span>{isKn ? "ವಾಹನ ಸಂಖ್ಯೆ & ಮಂತ್ರ ರಕ್ಷೆ" : "Power Vehicle Numbers & Mantra"}</span>
          </h3>

          <div className="space-y-2">
            <div className="text-xs font-bold text-blue-900">
              {isKn ? "ಖರೀದಿಗೆ ಅತ್ಯಂತ ಶುಭ ವಾಹನ ಸಂಖ್ಯೆಗಳು (ಏಕಾಂಕ):" : "Lucky Vehicle Single Digits:"}
            </div>
            <div className="flex gap-2">
              {profile.luckyVehicleNumbers.map((num) => (
                <span
                  key={num}
                  className="rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-sm px-3.5 py-1.5 shadow-sm"
                >
                  {num}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {isKn
                ? "ನಿಮ್ಮ ಕಾರ್ ಅಥವಾ ಬೈಕ್ ನಂಬರ್ ಪ್ಲೇಟ್‌ನ ಒಟ್ಟು ಮೊತ್ತ ಈ ಸಂಖ್ಯೆಗಳಿಗೆ ಸಮನಾಗಿದ್ದರೆ ಅಪಘಾತ ಭಯ ನಿವಾರಣೆಯಾಗಿ ಪ್ರವಾಸ ಸಫಲವಾಗುತ್ತದೆ."
                : "A vehicle whose number plate digits sum up to these numbers ensures safety, road authority, and travel success."}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-3.5 space-y-1">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>🪔</span>
              <span>{isKn ? "ದೈನಂದಿನ ಅಧಿಕಾರ ಮಂತ್ರ (Power Mantra):" : "Daily Success Mantra:"}</span>
            </div>
            <p className="text-xs font-serif font-bold text-amber-900">
              {isKn ? profile.powerMantraKn : profile.powerMantraEn}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
