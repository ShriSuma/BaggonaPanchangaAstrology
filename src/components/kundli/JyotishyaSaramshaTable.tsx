import React from "react";
import type { KundliOutput } from "../../core/AstroTypes";
import type { PublicKundliProfile } from "../../features/publicKundli/publicKundliEngine";
import { GRAHA_NAMES_5L } from "../../features/publicKundli/publicKundliEngine";
import { RASHI_L5 } from "../../features/seva/sevaLocale";
import { patrikaNavamshaFromDegree, formatChartHouseNumber } from "../../core/localeNumbers";

export interface JyotishyaSaramshaTableProps {
  kundli: KundliOutput;
  profile: PublicKundliProfile;
  lang?: string;
}

// Convert western digits to Kannada digits
function toKnNum(num: number | string | undefined): string {
  if (num === undefined || num === null) return "—";
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return String(num).replace(/[0-9]/g, (d) => knDigits[parseInt(d, 10)]);
}

/**
 * JyotishyaSaramshaTable - Authentic Vedic Panchanga Calculations & Ghati-Pala Summary
 * Displays 24 key-value astrological parameters styled in exact harmony with the Dwadasha Bhava chart:
 * Royal parchment background (#FFFDF7), gold frame border, crisp cell divider lines, and rich Kannada typography.
 */
export const JyotishyaSaramshaTable: React.FC<JyotishyaSaramshaTableProps> = ({
  kundli,
  profile,
  lang = "kn"
}) => {
  const isKn = lang === "kn";
  const trad = profile.traditionalPanchanga;
  const panch = profile.panchangaAttributes;

  const lagnaIdx = kundli.lagnaRashi?.index !== undefined ? kundli.lagnaRashi.index : 3;
  const lagnaName = isKn
    ? ((RASHI_L5[lagnaIdx] as any)?.kn || profile.lagnaSanskrit || "ಕರ್ಕಾಟಕ")
    : ((RASHI_L5[lagnaIdx] as any)?.[lang] || profile.lagnaSign || "Cancer");
  const lagnaAmshaka = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang);

  const fmtGhati = (ghatiObj?: { ghati: number; vighati: number }) => {
    if (!ghatiObj) return "—";
    const g = isKn ? toKnNum(ghatiObj.ghati) : ghatiObj.ghati;
    const v = isKn ? toKnNum(ghatiObj.vighati) : ghatiObj.vighati;
    return `${g} ಘಟಿ ${v} ವಿ`;
  };

  const dashaBalText = () => {
    if (profile.dashaBalanceAtBirth) {
      const b = profile.dashaBalanceAtBirth;
      const lordName = isKn ? (GRAHA_NAMES_5L[b.lord]?.kn || b.lord) : b.lord;
      const y = isKn ? toKnNum(b.years) : b.years;
      const m = isKn ? toKnNum(b.months) : b.months;
      const d = isKn ? toKnNum(b.days) : b.days;
      return `${lordName} ${isKn ? "ಮಹಾದಶಾ" : "Dasha"} ${y}${isKn ? "ವ" : "y"} ${m}${isKn ? "ತಿ" : "m"} ${d}${isKn ? "ದಿ" : "d"}`;
    }
    if (trad?.dashaLord) {
      return `${trad.dashaLord} Dasha`;
    }
    return "—";
  };

  // 24 Key-Value Items
  const items: Array<{ label: string; value: string; icon?: string }> = [
    {
      label: isKn ? "ಶಕ ವರ್ಷ" : "Shaka Varsha",
      value: isKn ? toKnNum(trad?.shakaYear || 1946) : String(trad?.shakaYear || 1946),
      icon: "⏳"
    },
    {
      label: isKn ? "ಸಂವತ್ಸರ" : "Samvatsara",
      value: isKn ? (trad?.samvatsaraKn || panch.samvatsaraKn) : (trad?.samvatsara || panch.samvatsara),
      icon: "📅"
    },
    {
      label: isKn ? "ಆಯನ" : "Ayana",
      value: isKn ? panch.ayanaKn : panch.ayana,
      icon: "☀️"
    },
    {
      label: isKn ? "ಋತು" : "Ritu",
      value: isKn ? panch.rituKn : panch.ritu,
      icon: "🌿"
    },
    {
      label: isKn ? "ಮಾಸ" : "Masa",
      value: isKn ? (trad?.masaKn || panch.masaKn) : (trad?.masa || panch.masa),
      icon: "🌸"
    },
    {
      label: isKn ? "ಪಕ್ಷ" : "Paksha",
      value: isKn ? (trad?.pakshaKn || panch.pakshaKn) : (trad?.paksha || panch.paksha),
      icon: "🌓"
    },
    {
      label: isKn ? "ತಿಥಿ & ಘಟಿ" : "Tithi & Ghati",
      value: `${isKn ? (trad?.tithiKn || panch.tithiKn) : (trad?.tithi || panch.tithi)} ${
        trad?.tithiGhati !== undefined
          ? `(${isKn ? toKnNum(trad.tithiGhati) : trad.tithiGhati} ಘಟಿ ${isKn ? toKnNum(trad.tithiVighati) : trad.tithiVighati} ವಿ)`
          : ""
      }`,
      icon: "🌙"
    },
    {
      label: isKn ? "ವಾರ" : "Weekday",
      value: isKn ? (trad?.weekdayKn || panch.weekdayKn) : (trad?.weekday || panch.weekday),
      icon: "🌅"
    },
    {
      label: isKn ? "ಸೂರ್ಯ ನಕ್ಷತ್ರ" : "Sun Nakshatra",
      value: `${isKn ? (trad?.sunNakshatraKn || panch.sunNakshatra) : (trad?.sunNakshatra || panch.sunNakshatra)} ${
        trad?.sunNakshatraGhati !== undefined
          ? `(${isKn ? toKnNum(trad.sunNakshatraGhati) : trad.sunNakshatraGhati} ಘಟಿ ${isKn ? toKnNum(trad.sunNakshatraVighati) : trad.sunNakshatraVighati} ವಿ)`
          : ""
      }`,
      icon: "☀️"
    },
    {
      label: isKn ? "ಚಂದ್ರ ನಕ್ಷತ್ರ" : "Moon Nakshatra",
      value: `${isKn ? (trad?.moonNakshatraKn || profile.moonSanskrit) : profile.moonNakshatra} ${
        trad?.moonNakshatraGhati !== undefined
          ? `(${isKn ? toKnNum(trad.moonNakshatraGhati) : trad.moonNakshatraGhati} ಘಟಿ ${isKn ? toKnNum(trad.moonNakshatraVighati) : trad.moonNakshatraVighati} ವಿ)`
          : ""
      }`,
      icon: "⭐"
    },
    {
      label: isKn ? "ಯೋಗ" : "Yoga",
      value: `${isKn ? (trad?.yogaKn || panch.yogaKn) : (trad?.yoga || panch.yoga)} ${
        trad?.yogaGhati !== undefined
          ? `(${isKn ? toKnNum(trad.yogaGhati) : trad.yogaGhati} ಘಟಿ ${isKn ? toKnNum(trad.yogaVighati) : trad.yogaVighati} ವಿ)`
          : ""
      }`,
      icon: "☍"
    },
    {
      label: isKn ? "ಕರಣ" : "Karana",
      value: `${isKn ? (trad?.karanaKn || panch.karanaKn) : (trad?.karana || panch.karana)} ${
        trad?.karanaGhati !== undefined
          ? `(${isKn ? toKnNum(trad.karanaGhati) : trad.karanaGhati} ಘಟಿ ${isKn ? toKnNum(trad.karanaVighati) : trad.karanaVighati} ವಿ)`
          : ""
      }`,
      icon: "☸"
    },
    {
      label: isKn ? "ಸೂರ್ಯೋದಯಾದ್ಯಾತ ಘಟಿ" : "Suryodhayadgata Ghati",
      value: fmtGhati(trad?.suryodhayadgata),
      icon: "🌅"
    },
    {
      label: isKn ? "ದಿವಾ ಘಟಿ" : "Diva Ghati",
      value: fmtGhati(trad?.divaGhati),
      icon: "☀️"
    },
    {
      label: isKn ? "ಅಮೃತ ಘಟಿ" : "Amrita Ghati",
      value: fmtGhati(trad?.amrithaGhati),
      icon: "💎"
    },
    {
      label: isKn ? "ವಿಷ ಘಟಿ" : "Visha Ghati",
      value: fmtGhati(trad?.vishaGhati),
      icon: "⚠️"
    },
    {
      label: isKn ? "ಪರಮ ಘಟಿ" : "Parama Ghati",
      value: fmtGhati(trad?.paramaGhati) !== "—" ? fmtGhati(trad?.paramaGhati) : (isKn ? "೬೦ ಘಟಿ ೦೦ ವಿ" : "60 Ghati 00 Vi"),
      icon: "📈"
    },
    {
      label: isKn ? "ಐಷ್ಯ ಘಟಿ" : "Aishya Ghati",
      value: fmtGhati(trad?.ashayaGhati),
      icon: "📉"
    },
    {
      label: isKn ? "ಗತ ಘಟಿ" : "Gata Ghati",
      value: fmtGhati(trad?.ghatadina),
      icon: "⏱️"
    },
    {
      label: isKn ? "ದಶಾ ಶೇಷ (ಜನನ ಕಾಲ)" : "Birth Dasha Balance",
      value: dashaBalText(),
      icon: "⏳"
    },
    {
      label: isKn ? "ಸೂರ್ಯೋದಯ" : "Sunrise",
      value: isKn ? toKnNum(panch.sunrise) : panch.sunrise,
      icon: "🌅"
    },
    {
      label: isKn ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset",
      value: isKn ? toKnNum(panch.sunset) : panch.sunset,
      icon: "🌇"
    },
    {
      label: isKn ? "ಸಂಕ್ರಾಂತಿ ಗತದಿನ" : "Sankranti Gata Dina",
      value: trad?.sankrantiSignKn
        ? `${trad.sankrantiSignKn} ${isKn ? toKnNum(trad.sankrantiGataDina) : trad.sankrantiGataDina}`
        : "—",
      icon: "☀️"
    },
    {
      label: isKn ? "ಜನ್ಮ ಲಗ್ನ" : "Natal Lagna",
      value: `${lagnaName} (${isKn ? "ಅಂಶ" : "Amsha"} ${lagnaAmshaka})`,
      icon: "🚩"
    }
  ];

  return (
    <div
      className="jk-jyotishya-saramsha-table w-full max-w-xl mx-auto rounded-2xl border-2 border-[#D97706] bg-[#FFFDF7] overflow-hidden shadow-2xl space-y-0 mb-6"
      style={{
        fontFamily: "'Noto Serif Kannada', 'Noto Sans Kannada', serif",
        boxShadow: "0 10px 30px -5px rgba(217, 119, 6, 0.25), 0 0 0 1px rgba(217, 119, 6, 0.4)"
      }}
    >
      {/* Royal Header Ribbon */}
      <div className="bg-gradient-to-r from-[#FEF3C7] via-[#FFFBEB] to-[#FEF3C7] border-b-2 border-[#D97706] p-3 text-center space-y-0.5">
        <div className="text-[10px] font-bold text-amber-800 tracking-widest uppercase">
          {isKn ? "॥ ಶ್ರೀ ಭಾಸ್ಕರಾಯ ನಮಃ ॥" : "॥ Sri Bhaskaraya Namah ॥"}
        </div>
        <h3 className="text-sm md:text-base font-black text-[#78350F] flex items-center justify-center gap-1.5">
          <span>📜</span>
          <span>{isKn ? "ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಸಾರಾಂಶ (ಘಟಿ-ಪಲ ವಿವರ)" : "Panchanga Jyotishya Saramsha (Ghati-Pala)"}</span>
        </h3>
        <p className="text-[10px] text-amber-800/90 font-serif">
          {isKn
            ? "ಶ್ರೀ ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಸಿದ್ಧಾಂತ ಆಧಾರಿತ ನಿಖರ ಪಂಚಾಂಗ ಮೌಲ್ಯಗಳು"
            : "Authentic Vedic Panchanga calculations based on Sri Gokarna Siddhanta"}
        </p>
      </div>

      {/* 24-Cell Structured Grid with Lines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FFFDF7]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border-b border-r border-amber-600/40 p-2 flex flex-col justify-between hover:bg-amber-50/50 transition-colors"
            style={{ minHeight: "66px" }}
          >
            <div className="flex items-center gap-1 text-[#78350F] font-bold text-[10px] md:text-[11px] leading-tight">
              {item.icon && <span className="text-[10px]">{item.icon}</span>}
              <span className="truncate">{item.label}:</span>
            </div>
            <div className="text-[#1E3A8A] font-extrabold text-[11px] md:text-xs mt-1 leading-snug break-words">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
