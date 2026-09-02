import React from "react";
import type { KundliOutput } from "../../core/AstroTypes";
import { PublicKundliProfile, GRAHA_NAMES_5L } from "../../features/publicKundli/publicKundliEngine";
import { RASHI_L5 } from "../../features/seva/sevaLocale";
import { patrikaNavamshaFromDegree, formatChartHouseNumber } from "../../core/localeNumbers";
import { JyotishyaSaramshaTable } from "./JyotishyaSaramshaTable";

export interface DwadashaBhavaKundliChartProps {
  kundli: KundliOutput;
  profile: PublicKundliProfile;
  personName: string;
  birthDate: string;
  birthTime: string;
  gothra?: string;
  lang?: string;
}

// Convert western digits to Kannada digits
function toKnNum(num: number | string): string {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return String(num).replace(/[0-9]/g, (d) => knDigits[parseInt(d, 10)]);
}

/**
 * Authentic 8-Page Premium Dwadasha Bhava Kundali Chart (ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ)
 * Exact replica of the royal golden South Indian chart from RoyalBooklet8PageTemplate.tsx
 */
export const DwadashaBhavaKundliChart: React.FC<DwadashaBhavaKundliChartProps> = ({
  kundli,
  profile,
  personName,
  birthDate,
  birthTime,
  gothra,
  lang = "kn"
}) => {
  const isKn = lang === "kn";
  const code = (["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn") as any;

  // Lagna Rashi Index (0 = Mesha, 11 = Meena)
  const lagnaIdx = kundli.lagnaRashi?.index !== undefined ? kundli.lagnaRashi.index : 3;
  const lagnaRashiName = (RASHI_L5[lagnaIdx] as any)?.[code] || (RASHI_L5[lagnaIdx] as any)?.kn || "ಕರ್ಕಾಟಕ";
  const moonRashiName = isKn ? profile.moonSanskrit : profile.moonSign;
  const moonNakName = isKn ? profile.moonSanskrit : profile.moonNakshatra;

  // Group planets by sign index (0 to 11) with authentic Amshaka (D-9 Navamsha)
  const planetsByRashi: Record<number, Array<{ name: string; amshaka: string; isRetro?: boolean }>> = {};
  for (let i = 0; i < 12; i++) planetsByRashi[i] = [];

  // Populate standard 9 planets with authentic amshaka
  if (kundli && kundli.planets) {
    for (const p of kundli.planets) {
      const rIdx = p.rashi ? p.rashi.index : 0;
      const planetName = p.name;
      const shortName = (GRAHA_NAMES_5L[planetName] as any)?.[code] || (GRAHA_NAMES_5L[planetName] as any)?.kn || planetName;
      const amshakaNum = patrikaNavamshaFromDegree(p.degree);
      const amshakaDisplay = formatChartHouseNumber(amshakaNum, lang);

      planetsByRashi[rIdx].push({
        name: shortName,
        amshaka: amshakaDisplay,
        isRetro: p.isRetrograde
      });
    }
  }

  // Populate Maandi (Gulika) with authentic amshaka
  if (kundli && kundli.maandi) {
    const maandiRIdx = kundli.maandi.rashi ? kundli.maandi.rashi.index : 0;
    const maandiLabel = isKn ? "ಮಾಂದಿ" : "Maandi";
    const amshakaNum = patrikaNavamshaFromDegree(kundli.maandi.degree);
    planetsByRashi[maandiRIdx].push({
      name: maandiLabel,
      amshaka: formatChartHouseNumber(amshakaNum, lang),
      isRetro: false
    });
  } else if (profile.maandiRashi) {
    const RASHI_ORDER_EN = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    const maandiRashiIdx = RASHI_ORDER_EN.indexOf(profile.maandiRashi);
    if (maandiRashiIdx >= 0) {
      const maandiLabel = isKn ? "ಮಾಂದಿ" : "Maandi";
      const maandiDegNum = typeof (kundli as any)?.maandi?.degree === "number"
        ? (kundli as any).maandi.degree
        : (maandiRashiIdx * 30 + 14);
      const amshakaNum = patrikaNavamshaFromDegree(maandiDegNum);
      planetsByRashi[maandiRashiIdx].push({
        name: maandiLabel,
        amshaka: formatChartHouseNumber(amshakaNum, lang),
        isRetro: false
      });
    }
  }

  // Rashi Cell Renderer
  const renderCell = (rIdx: number) => {
    const rName = (RASHI_L5[rIdx] as any)?.[code] || (RASHI_L5[rIdx] as any)?.kn || "";
    const isLagnaCell = rIdx === lagnaIdx;
    const planetsHere = planetsByRashi[rIdx] || [];

    return (
      <div
        key={rIdx}
        className={`border border-amber-600/70 p-1.5 flex flex-col justify-start transition-all overflow-hidden relative ${
          isLagnaCell ? "bg-amber-100/60" : "bg-[#FFFDF7]"
        }`}
        style={{ minHeight: "85px" }}
      >
        {/* Rashi Header */}
        <div className="text-[#78350F] font-extrabold text-[11px] md:text-xs border-b border-amber-200 pb-0.5 mb-1 flex items-center justify-between">
          <span>{rName}</span>
          <span className="text-[9px] text-amber-600/70 font-mono">
            {isKn ? toKnNum(rIdx + 1) : rIdx + 1}
          </span>
        </div>

        {/* Lagna Indicator with authentic Amshaka */}
        {isLagnaCell && (
          <div className="text-[#B91C1C] font-black text-[11px] md:text-xs mb-0.5 flex items-center gap-1.5">
            <span>🚩 {isKn ? "ಲಗ್ನ" : "Lagna"}</span>
            <span className="font-extrabold text-[#B91C1C]">
              {formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang)}
            </span>
          </div>
        )}

        {/* Occupant Planets with authentic Amshaka placed right next to planet name (e.g. ಶುಕ್ರ ೧, ಕೇತು ೨) */}
        <div className="space-y-0.5">
          {planetsHere.map((pl, idx) => (
            <div
              key={idx}
              className="text-[#1E3A8A] font-bold text-[10px] md:text-[11px] leading-tight flex items-center gap-1.5"
            >
              <span>
                {pl.name} {pl.isRetro && <span className="text-rose-600 font-bold text-[9px]">({isKn ? "ವಕ್ರ" : "Retro"})</span>}
              </span>
              <span className="text-[11px] md:text-xs font-extrabold text-[#1E3A8A]">{pl.amshaka}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* 1. Jyotishya Saramsha (Vedic Panchanga Calculations with Ghati-Pala) */}
      <JyotishyaSaramshaTable
        kundli={kundli}
        profile={profile}
        lang={lang}
      />

      {/* 2. Title Banner for Dwadasha Bhava Chart */}
      <div className="text-center space-y-0.5">
        <h3 className="text-base md:text-lg font-black text-amber-300 tracking-wide flex items-center justify-center gap-2">
          <span>🌌</span>
          <span>{isKn ? "ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ (Dwadasha Bhava Chart)" : "Dwadasha Bhava Kundali"}</span>
        </h3>
        <p className="text-[11px] text-amber-200/80">
          {isKn
            ? "ಶ್ರೀ ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಪಂಚಾಂಗ ಆಧಾರಿತ ಶುದ್ಧ ಲಹರಿ ಜಾತಕ ಚಕ್ರ"
            : "Authentic Vedic South Indian Natal Chart based on Sri Gokarna Siddhanta"}
        </p>
      </div>

      {/* 3. Royal Gold 4x4 Grid Diagram */}
      <div
        className="w-full aspect-square max-w-[480px] mx-auto border-2 border-[#D97706] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-4 grid-rows-4 bg-[#FFFDF7]"
        style={{
          boxShadow: "0 10px 30px -5px rgba(217, 119, 6, 0.25), 0 0 0 1px rgba(217, 119, 6, 0.4)"
        }}
      >
        {/* Row 1 (Top): Meena (11), Mesha (0), Vrishabha (1), Mithuna (2) */}
        {renderCell(11)}
        {renderCell(0)}
        {renderCell(1)}
        {renderCell(2)}

        {/* Row 2: Kumbha (10), Center Box, Karka (3) */}
        {renderCell(10)}

        {/* Center Box spanning 2 cols and 2 rows */}
        <div className="col-span-2 row-span-2 border-2 border-[#78350F] bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FEF3C7] flex flex-col items-center justify-center p-2 text-center space-y-0.5 shadow-inner relative overflow-hidden">
          <div className="text-[8.5px] md:text-[9.5px] font-bold text-amber-800 tracking-widest uppercase">
            {isKn ? "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ॥" : "॥ Sri Kshetra Gokarna ॥"}
          </div>
          <div className="text-xs md:text-sm font-black text-[#78350F]">
            {isKn ? "ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ" : "Dwadasha Bhava Chart"}
          </div>

          {/* User Name */}
          <div className="text-xs md:text-sm font-extrabold text-amber-950 border-t border-b border-amber-400/60 py-0.5 px-2 max-w-full truncate">
            {personName}
          </div>

          {/* Gothra if provided */}
          {gothra && (
            <div className="text-[9px] md:text-[10px] font-bold text-amber-900">
              {isKn ? `ಗೋತ್ರ: ${gothra}` : `Gothra: ${gothra}`}
            </div>
          )}

          {/* Date & Time */}
          <div className="text-[8.5px] md:text-[9.5px] text-amber-800 font-mono">
            📅 {birthDate} · ⏰ {birthTime}
          </div>

          {/* Rashi & Nakshatra */}
          <div className="text-[9px] md:text-[10px] font-extrabold text-[#1E3A8A] leading-tight">
            <span>🌙 {moonRashiName}</span>
            <span className="mx-1">·</span>
            <span>⭐ {moonNakName} ({isKn ? `ಪಾದ ${toKnNum(profile.moonPada)}` : `P${profile.moonPada}`})</span>
          </div>

          {/* Lagna with authentic Amshaka */}
          <div className="text-[10px] md:text-[11px] font-black text-[#B91C1C]">
            {isKn
              ? `🚩 ಲಗ್ನ: ${lagnaRashiName} ${formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang)}`
              : `🚩 Lagna: ${lagnaRashiName} ${patrikaNavamshaFromDegree(kundli.ascendant)}`}
          </div>

          {/* Sacred Blessing */}
          <div className="text-[8px] md:text-[8.5px] text-amber-700/90 font-serif">
            {isKn ? "ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಿದ್ಧ ರಕ್ಷೆ" : "Protected by Sri Mahabaleshwara"}
          </div>
        </div>

        {renderCell(3)}

        {/* Row 3: Makara (9), Simha (4) */}
        {renderCell(9)}
        {renderCell(4)}

        {/* Row 4 (Bottom): Dhanu (8), Vrishchika (7), Tula (6), Kanya (5) */}
        {renderCell(8)}
        {renderCell(7)}
        {renderCell(6)}
        {renderCell(5)}
      </div>
    </div>
  );
};
