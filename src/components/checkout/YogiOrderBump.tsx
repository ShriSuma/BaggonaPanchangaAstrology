import React, { useMemo } from "react";
import {
  auditNameAndMobileWithYogi,
  type NameAndMobileYogiAudit
} from "../../engine/secretAccuracyEngine";
import {
  ORDER_BUMP_LOCALE
} from "../../engine/secretAccuracyLocale";
import { type SixLang } from "../../features/fiveYearPrediction/fiveYearLocale";
import { type Planet } from "../../engine/jyotishPrecisionGates";

export interface YogiOrderBumpProps {
  selectedLang?: string;
  devoteeName: string;
  phoneNumber: string;
  yogiPlanet?: Planet;
  avayogiPlanet?: Planet;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  className?: string;
}

export const YogiOrderBump: React.FC<YogiOrderBumpProps> = ({
  selectedLang = "kn",
  devoteeName,
  phoneNumber,
  yogiPlanet = "Jupiter",
  avayogiPlanet = "Saturn",
  isChecked,
  onToggle,
  className = ""
}) => {
  const langKey = (["kn", "mr", "hi", "te", "ta", "en"].includes(selectedLang)
    ? selectedLang
    : "kn") as SixLang;

  const dict = ORDER_BUMP_LOCALE[langKey] || ORDER_BUMP_LOCALE.kn;

  // Compute live Chaldean & Yogi audit
  const auditResult: NameAndMobileYogiAudit = useMemo(() => {
    return auditNameAndMobileWithYogi(devoteeName, phoneNumber, yogiPlanet, avayogiPlanet);
  }, [devoteeName, phoneNumber, yogiPlanet, avayogiPlanet]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-md ${
        isChecked
          ? "border-amber-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 ring-2 ring-amber-400/50"
          : "border-amber-200 bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/30 hover:border-amber-300"
      } p-4 sm:p-5 ${className}`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          {dict.headline}
        </span>
        <span className="text-xs sm:text-sm font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
          {dict.priceTag}
        </span>
      </div>

      {/* Checkbox & Callout */}
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer transition-transform group-hover:scale-105"
        />
        <div className="flex-1">
          <p className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-amber-900 transition-colors">
            {dict.checkboxLabel}
          </p>

          {/* 3 Pitch Bullets */}
          <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold shrink-0">✓</span>
              <span>{dict.pitchBullet1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold shrink-0">✓</span>
              <span>{dict.pitchBullet2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold shrink-0">✓</span>
              <span>{dict.pitchBullet3}</span>
            </li>
          </ul>
        </div>
      </label>

      {/* Live Preview Panel when Checked */}
      {isChecked && (
        <div className="mt-4 pt-4 border-t border-amber-200/80 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-amber-200 shadow-inner space-y-2.5">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center justify-between">
              <span>⚡ {langKey === "kn" ? "ಲೈವ್ ಕಂಪನ ವಿಶ್ಲೇಷಣೆ ಮುನ್ನೋಟ" : "Live Vibration Audit Preview"}</span>
              <span className="text-[11px] text-gray-500 font-normal">
                {langKey === "kn" ? `ಯೋಗಿ: ${yogiPlanet} | ಅವಯೋಗಿ: ${avayogiPlanet}` : `Yogi: ${yogiPlanet} | Avayogi: ${avayogiPlanet}`}
              </span>
            </div>

            {/* Name Vibration Row */}
            <div className="flex items-center justify-between bg-amber-50/60 p-2.5 rounded-lg text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-gray-800">
                  {langKey === "kn" ? "ಹೆಸರಿನ ಸಂಖ್ಯಾ ಕಂಪನ:" : "Name Vibration:"}
                </span>{" "}
                <span className="font-bold text-amber-900">{auditResult.nameCompoundNumber}</span> →{" "}
                <span className="font-extrabold text-amber-700">[{auditResult.nameSingleDigit}]</span> (
                {auditResult.nameRulingPlanet})
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  auditResult.nameHarmonyStatus === "PERFECT_YOGI_HARMONY"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : auditResult.nameHarmonyStatus === "AVAYOGI_FRICTION_CLASH"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {auditResult.nameHarmonyStatus === "PERFECT_YOGI_HARMONY"
                  ? langKey === "kn" ? "ಯೋಗಿ ಸಾಮರಸ್ಯ" : "Yogi Harmony"
                  : auditResult.nameHarmonyStatus === "AVAYOGI_FRICTION_CLASH"
                  ? langKey === "kn" ? "ಅವಯೋಗಿ ಅಡ್ಡಿ" : "Avayogi Clash"
                  : langKey === "kn" ? "ಸ್ಥಿರ ಹೊಂದಾಣಿಕೆ" : "Compatible"}
              </span>
            </div>

            {/* Mobile Vibration Row */}
            <div className="flex items-center justify-between bg-amber-50/60 p-2.5 rounded-lg text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-gray-800">
                  {langKey === "kn" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯಾ ಮೊತ್ತ:" : "Mobile Total:"}
                </span>{" "}
                <span className="font-bold text-amber-900">{auditResult.mobileSum}</span> →{" "}
                <span className="font-extrabold text-amber-700">[{auditResult.mobileSingleDigit}]</span> (
                {auditResult.mobileRulingPlanet})
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  auditResult.mobileHarmonyStatus === "PERFECT_YOGI_HARMONY"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : auditResult.mobileHarmonyStatus === "AVAYOGI_FRICTION_CLASH"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {auditResult.mobileHarmonyStatus === "PERFECT_YOGI_HARMONY"
                  ? langKey === "kn" ? "ಯೋಗಿ ಸಾಮರಸ್ಯ" : "Yogi Harmony"
                  : auditResult.mobileHarmonyStatus === "AVAYOGI_FRICTION_CLASH"
                  ? langKey === "kn" ? "ಅವಯೋಗಿ ಅಡ್ಡಿ" : "Avayogi Clash"
                  : langKey === "kn" ? "ಸ್ಥಿರ ಹೊಂದಾಣಿಕೆ" : "Compatible"}
              </span>
            </div>

            {/* Recommendation preview */}
            <p className="text-[11px] sm:text-xs text-amber-900/90 italic bg-amber-100/50 p-2 rounded">
              {langKey === "kn" ? auditResult.nameRecommendationKn : auditResult.nameRecommendationEn}
            </p>
          </div>
        </div>
      )}

      {/* Guarantee Footnote */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 border-t border-amber-100 pt-2">
        <span className="flex items-center gap-1 text-amber-800/80 font-medium">
          <span>🏛️</span>
          <span>{dict.guaranteeText}</span>
        </span>
        <span className="text-[10px] text-gray-400">
          {langKey === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅನುಮೋದಿತ" : "Shreeram Pandit Certified"}
        </span>
      </div>
    </div>
  );
};
