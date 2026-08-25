import React, { useState } from "react";
import Card from "../ui/Card";
import {
  calculateLoveMarriageMatch,
  type LoveMarriageMatchResult
} from "../../features/sankhyashastra/sankhyaNumerologyUtils";

type Props = {
  lang: string;
  defaultBoyName?: string;
  defaultGirlName?: string;
};

export const LoveMarriageMatchTab: React.FC<Props> = ({
  lang,
  defaultBoyName = "",
  defaultGirlName = ""
}) => {
  const isKn = lang === "kn";

  const [boyName, setBoyName] = useState<string>(defaultBoyName || "Srikanth");
  const [boyDob, setBoyDob] = useState<string>("1994-06-15");

  const [girlName, setGirlName] = useState<string>(defaultGirlName || "Lakshmi");
  const [girlDob, setGirlDob] = useState<string>("1996-09-24");

  const [matchResult, setMatchResult] = useState<LoveMarriageMatchResult>(() =>
    calculateLoveMarriageMatch(boyName, boyDob, girlName, girlDob)
  );

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateLoveMarriageMatch(boyName, boyDob, girlName, girlDob);
    setMatchResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-rose-300/80 bg-gradient-to-r from-rose-500/10 via-pink-100/60 to-amber-500/10 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-rose-950 flex items-center gap-2">
              <span>💑</span>
              <span>
                {isKn
                  ? "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿವಾಹ & ಪ್ರೇಮ ಮೈತ್ರಿ (Love & Marriage Numerology Matchmaker)"
                  : "Love & Marriage Numerology Matchmaker"}
              </span>
            </h2>
            <p className="mt-1 text-xs text-rose-900/80">
              {isKn
                ? "ವರ ಮತ್ತು ಕನ್ಯೆಯ ಹೆಸರು ಹಾಗೂ ಹುಟ್ಟಿದ ದಿನಾಂಕದ ಆಧಾರದ ಮೇಲೆ ಪಂಚ-ಆಯಾಮಗಳ ನಿಖರ ಮೈತ್ರಿ, ವಿವಾಹ ಶುಭ ದಿನಾಂಕಗಳು ಹಾಗೂ ದೈವಿಕ ಪರಿಹಾರ."
                : "5-Dimensional Vedic compatibility, auspicious wedding dates & Gokarna remedies based on Boy & Girl Names and DOB."}
            </p>
          </div>
        </div>
      </div>

      {/* Input Parameters Card */}
      <Card className="border border-rose-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleRecalculate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Boy's Details */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <h3 className="font-serif text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>👦</span>
                <span>{isKn ? "ವರನ ವಿವರ (Boy's Information)" : "Boy's Details"}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  {isKn ? "ವರನ ಹೆಸರು (Boy's Full Name)" : "Boy's Name (English)"}
                </label>
                <input
                  type="text"
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  placeholder="e.g. Srikanth Sharma"
                  className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-sm font-bold text-blue-950 shadow-inner focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth)" : "Birth Date"}
                </label>
                <input
                  type="date"
                  value={boyDob}
                  onChange={(e) => setBoyDob(e.target.value)}
                  className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs font-bold text-blue-950 shadow-inner focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Girl's Details */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 space-y-3">
              <h3 className="font-serif text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>👧</span>
                <span>{isKn ? "ಕನ್ಯೆಯ ವಿವರ (Girl's Information)" : "Girl's Details"}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  {isKn ? "ಕನ್ಯೆಯ ಹೆಸರು (Girl's Full Name)" : "Girl's Name (English)"}
                </label>
                <input
                  type="text"
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  placeholder="e.g. Lakshmi Hegde"
                  className="w-full rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-sm font-bold text-rose-950 shadow-inner focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth)" : "Birth Date"}
                </label>
                <input
                  type="date"
                  value={girlDob}
                  onChange={(e) => setGirlDob(e.target.value)}
                  className="w-full rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-950 shadow-inner focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-2/3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700 py-3 text-xs font-bold text-white shadow-md hover:from-rose-700 hover:to-pink-800 transition flex items-center justify-center gap-2"
            >
              <span>💑</span>
              <span>{isKn ? "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಮೈತ್ರಿ ಗಣಿಸಿ (Check Compatibility)" : "Calculate Compatibility Score"}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Match Result Score Banner */}
      <Card className="border-2 border-rose-300 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/60 p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-rose-200 pb-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
              {isKn ? "ದಾಂಪತ್ಯ ಮೈತ್ರಿ ಫಲಿತಾಂಶ (Overall Result)" : "Overall Match Compatibility"}
            </div>
            <div className="font-serif text-lg font-bold text-rose-950 mt-1">
              {isKn ? matchResult.gradeKn : matchResult.gradeEn}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-rose-800">{matchResult.overallScore}%</span>
              <span className="text-[10px] font-bold text-rose-600">
                {matchResult.overallScore >= 80 ? "HIGH HARMONY" : "MODERATE"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-rose-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-rose-200">
          <div
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-emerald-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${matchResult.overallScore}%` }}
          />
        </div>

        {/* Summary Description */}
        <div className="rounded-xl bg-rose-100/50 border border-rose-200/80 p-3.5 text-xs text-rose-950 font-medium leading-relaxed">
          {isKn ? matchResult.summaryKn : matchResult.summaryEn}
        </div>

        {/* Side-by-side Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
            <div className="text-[10px] font-bold text-blue-800 uppercase">👦 ವರನ ಮೂಲಾಂಕ</div>
            <div className="text-xl font-black text-blue-950 mt-0.5">{matchResult.boyMulank}</div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-semibold">ಭಾಗ್ಯಾಂಕ: {matchResult.boyBhagyank}</div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
            <div className="text-[10px] font-bold text-blue-800 uppercase">👦 ವರನ ನಾಮಾಂಕ</div>
            <div className="text-xl font-black text-blue-950 mt-0.5">{matchResult.boyNameChaldean}</div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-semibold">ಏಕಾಂಕ: {matchResult.boyNameSingle}</div>
          </div>

          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <div className="text-[10px] font-bold text-rose-800 uppercase">👧 ಕನ್ಯೆಯ ಮೂಲಾಂಕ</div>
            <div className="text-xl font-black text-rose-950 mt-0.5">{matchResult.girlMulank}</div>
            <div className="text-[10px] text-rose-700 mt-0.5 font-semibold">ಭಾಗ್ಯಾಂಕ: {matchResult.girlBhagyank}</div>
          </div>

          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <div className="text-[10px] font-bold text-rose-800 uppercase">👧 ಕನ್ಯೆಯ ನಾಮಾಂಕ</div>
            <div className="text-xl font-black text-rose-950 mt-0.5">{matchResult.girlNameChaldean}</div>
            <div className="text-[10px] text-rose-700 mt-0.5 font-semibold">ಏಕಾಂಕ: {matchResult.girlNameSingle}</div>
          </div>
        </div>

        {/* 5-Dimensional Breakdown Cards */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-rose-950">
            📊 {isKn ? "ಪಂಚ-ಆಯಾಮಗಳ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ (5 Dimensions Breakdown)" : "5 Dimensions Breakdown"}
          </h4>

          <div className="space-y-2.5">
            {matchResult.dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-rose-200/80 bg-white p-3.5 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-950">
                    {isKn ? dim.titleKn : dim.titleEn}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      dim.status === "excellent"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : dim.status === "good"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {dim.score} / {dim.maxScore} pts
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 flex gap-4 font-semibold">
                  <span>👦 {dim.boyValue}</span>
                  <span>👧 {dim.girlValue}</span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {isKn ? dim.descriptionKn : dim.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Auspicious Wedding Dates */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <span>📅</span>
            <span>{isKn ? "ವಿವಾಹಕ್ಕೆ ಶುಭ ದಿನಾಂಕಗಳು (Auspicious Wedding Dates)" : "Auspicious Wedding Dates"}</span>
          </div>
          <p className="text-xs text-amber-900 font-bold leading-relaxed">
            {isKn ? matchResult.auspiciousWeddingDatesKn : matchResult.auspiciousWeddingDatesEn}
          </p>
        </div>

        {/* Sacred Gokarna Remedy */}
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <span>🪔</span>
            <span>{isKn ? "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ ಪರಿಹಾರ (Sacred Remedy)" : "Sacred Vedic Remedy"}</span>
          </div>
          <p className="text-xs text-emerald-900 font-medium leading-relaxed">
            {isKn ? matchResult.sacredRemedyKn : matchResult.sacredRemedyEn}
          </p>
        </div>
      </Card>
    </div>
  );
};
