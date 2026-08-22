import React from "react";
import { calculateKundli } from "../../../core/KundliEngine";
import { generateBhuktiTimeline } from "../../../core/DashaBhuktiEngine";
import { NAKSHATRA_L5 } from "../../../features/seva/sevaLocale";
import { transliterateName } from "../../../utils/transliterator";

export interface DevoteeIdentityProps {
  personName?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  gotra?: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  aiTransliteratedName?: string;
}

export interface RoyalBooklet8PageTemplateProps {
  lang?: string;
  identity?: DevoteeIdentityProps;
  panditName?: string;
  rhythm?: any;
  qrDataUrl?: string;
}

const RASHI_KN_MAP: Record<number, string> = {
  0: "ಮೇಷ (Mesha)",
  1: "ವೃಷಭ (Vrishabha)",
  2: "ಮಿಥುನ (Mithuna)",
  3: "ಕರ್ಕಾಟಕ (Karka)",
  4: "ಸಿಂಹ (Simha)",
  5: "ಕನ್ಯಾ (Kanya)",
  6: "ತುಲಾ (Tula)",
  7: "ವೃಶ್ಚಿಕ (Vrischika)",
  8: "ಧನುಸ್ಸು (Dhanus)",
  9: "ಮಕರ (Makara)",
  10: "ಕುಂಭ (Kumbha)",
  11: "ಮೀನ (Meena)"
};

const PLANET_KN_MAP: Record<string, string> = {
  Sun: "ಸೂರ್ಯ",
  Moon: "ಚಂದ್ರ",
  Mars: "ಮಂಗಳ",
  Mercury: "ಬುಧ",
  Jupiter: "ಗುರು",
  Venus: "ಶುಕ್ರ",
  Saturn: "ಶನಿ",
  Rahu: "ರಾಹು",
  Ketu: "ಕೇತು",
  Lagna: "ಲಗ್ನ",
  Maandi: "ಮಾಂದಿ"
};

const GOTRA_KN_MAP: Record<string, string> = {
  "Vasistha": "ವಸಿಷ್ಠ",
  "Vasisthha": "ವಸಿಷ್ಠ",
  "Kashyapa": "ಕಾಶ್ಯಪ",
  "Bharadwaja": "ಭಾರದ್ವಾಜ",
  "Viswamitra": "ವಿಶ್ವಾಮಿತ್ರ",
  "Gautama": "ಗೌತಮ",
  "Jamadagni": "ಜಮದಗ್ನಿ",
  "Atri": "ಅತ್ರಿ",
  "Agastya": "ಅಗಸ್ತ್ಯ",
  "Angirasa": "ಅಂಗೀರಸ",
  "Harita": "ಹರೀತ",
  "Kaundinya": "ಕೌಂಡಿನ್ಯ",
  "Shandilya": "ಶಾಂಡಿಲ್ಯ"
};

const formatTimeWithAmPm = (timeStr: string, isKn: boolean): string => {
  if (!timeStr) return isKn ? "09:25 AM (ಪೂರ್ವಾಹ್ನ)" : "09:25 AM";
  const cleanTime = timeStr.trim();
  if (cleanTime.toUpperCase().includes("AM") || cleanTime.toUpperCase().includes("PM")) {
    return cleanTime;
  }
  const parts = cleanTime.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, "0");
  if (isNaN(hours)) return timeStr;
  
  const isPm = hours >= 12;
  const period = isPm ? "PM" : "AM";
  const knPeriod = isPm ? "ಅಪರಾಹ್ನ" : "ಪೂರ್ವಾಹ್ನ";
  
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  
  const formattedHours = hours.toString().padStart(2, "0");
  return isKn 
    ? `${formattedHours}:${minutes} ${period} (${knPeriod})`
    : `${formattedHours}:${minutes} ${period}`;
};

export const RoyalBooklet8PageTemplate: React.FC<RoyalBooklet8PageTemplateProps> = ({
  lang = "kn",
  identity,
  panditName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  rhythm,
  qrDataUrl
}) => {
  const code = lang || "en";
  const isKn = code === "kn";
  const isHi = code === "hi";
  const isTe = code === "te";
  const isTa = code === "ta";

  // Auto-transliterate Devotee Name into target script if not already transliterated
  const rawDevoteeName = identity?.personName || "Pramod Kodgi";
  const displayName = identity?.aiTransliteratedName || (rawDevoteeName === "Pramod Kodgi" || rawDevoteeName === "Devotee" ? "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ" : transliterateName(rawDevoteeName, code));

  const dobStr = identity?.dob || "1993-05-31";
  const tobStr = identity?.tob || "09:25";
  const pobStr = identity?.pob || (isKn ? "ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ" : "Gokarna, Karnataka");
  const rawGotra = identity?.gotra || "Vasistha";
  const finalGotra = isKn 
    ? (GOTRA_KN_MAP[rawGotra] || GOTRA_KN_MAP[identity?.gotra || ""] || "ವಸಿಷ್ಠ")
    : rawGotra;

  // Calculate authentic birth Kundli
  const birthKundli = React.useMemo(() => {
    try {
      return calculateKundli({
        name: rawDevoteeName,
        birthDate: dobStr,
        birthTime: tobStr,
        latitude: 14.544,
        longitude: 74.318
      });
    } catch (e) {
      return null;
    }
  }, [dobStr, tobStr, rawDevoteeName]);

  const userAge = React.useMemo(() => {
    if (!dobStr) return 33;
    const birthYear = parseInt(dobStr.split("-")[0], 10);
    return isNaN(birthYear) ? 33 : (2026 - birthYear);
  }, [dobStr]);

  const isFieryLagna = React.useMemo(() => {
    if (!birthKundli?.lagnaRashi) return false;
    const idx = birthKundli.lagnaRashi.index;
    return idx === 0 || idx === 4 || idx === 8;
  }, [birthKundli]);

  const moonPlanet = birthKundli?.planets.find((p: any) => p.name === "Moon");
  const rashiIdx = moonPlanet?.rashi.index ?? (identity?.rashiIndex ?? 5);
  const nakIdx = moonPlanet?.nakshatra.index ?? (identity?.nakshatraIndex ?? 12);
  const pada = birthKundli?.moonPada ?? 3;
  const lagnaRashiName = birthKundli?.lagnaRashi ? RASHI_KN_MAP[birthKundli.lagnaRashi.index] : "ಕರ್ಕಾಟಕ";

  const rashiName = RASHI_KN_MAP[rashiIdx] || "ಕನ್ಯಾ (Kanya)";
  const nakName = (NAKSHATRA_L5[nakIdx] as any)?.[code] || (NAKSHATRA_L5[nakIdx] as any)?.kn || "ಹಸ್ತ";

  // Priest name
  const priestStr = typeof panditName === "string" ? panditName : "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";

  // Dynamic 5 Dasha-Bhukti Cards starting from TODAY into the FUTURE
  const dynamicDashaCards = React.useMemo(() => {
    if (!birthKundli) return [];
    try {
      const dobDate = new Date(dobStr);
      if (isNaN(dobDate.getTime())) return [];
      
      const now = new Date(); // Current date in 2026
      const currentAgeYears = (now.getTime() - dobDate.getTime()) / (365.25 * 86400 * 1000);
      
      const spans = generateBhuktiTimeline(birthKundli, 120);
      let activeIdx = spans.findIndex(s => currentAgeYears >= s.startAge && currentAgeYears < s.endAge);
      if (activeIdx < 0) activeIdx = 0;
      
      const selected = spans.slice(activeIdx, activeIdx + 5);
      
      const toKnDigit = (num: number | string) => {
        const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
        return num.toString().replace(/\d/g, d => knDigits[parseInt(d, 10)]);
      };

      const formatDateKn = (dt: Date) => {
        const y = dt.getFullYear();
        const m = (dt.getMonth() + 1).toString().padStart(2, "0");
        const d = dt.getDate().toString().padStart(2, "0");
        return isKn ? `${toKnDigit(y)}-${toKnDigit(m)}-${toKnDigit(d)}` : `${y}-${m}-${d}`;
      };

      return selected.map((s, idx) => {
        const startDt = new Date(dobDate.getTime() + s.startAge * 365.25 * 86400 * 1000);
        const endDt = new Date(dobDate.getTime() + s.endAge * 365.25 * 86400 * 1000);

        const mahaKn = PLANET_KN_MAP[s.maha] || s.maha;
        const bhuktiKn = PLANET_KN_MAP[s.bhukti] || s.bhukti;

        const isRajayoga = s.bhukti === "Venus" || s.bhukti === "Jupiter" || idx === 2;

        const startAgeStr = toKnDigit(Math.floor(s.startAge));
        const endAgeStr = toKnDigit(Math.floor(s.endAge));

        let badgeText = "✨ ವಿದ್ಯಾ & ಬುದ್ಧಿ ಸಿದ್ಧಿ";
        let badgeBg = "#FEF3C7";
        let badgeBorder = "#F59E0B";
        let badgeColor = "#92400E";

        if (isRajayoga) {
          badgeText = "👑 ಅತ್ಯುನ್ನತ ರಾಜಯೋಗ ಫಲ";
          badgeBg = "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)";
          badgeBorder = "#D97706";
          badgeColor = "#78350F";
        } else if (s.bhukti === "Ketu" || s.bhukti === "Moon") {
          badgeText = "🕉️ ಅಧ್ಯಾತ್ಮ & ಜ್ಞಾನ ತಪಸ್ಸು";
          badgeBg = "#F5F3FF";
          badgeBorder = "#8B5CF6";
          badgeColor = "#5B21B6";
        } else if (s.bhukti === "Sun" || s.bhukti === "Mars") {
          badgeText = "⛳ ಅಧಿಕಾರ & ಸರ್ಕಾರಿ ಜಯ";
          badgeBg = "#ECFDF5";
          badgeBorder = "#10B981";
          badgeColor = "#047857";
        } else if (s.bhukti === "Saturn" || s.bhukti === "Rahu") {
          badgeText = "⚖️ ಸ್ಥಿರ ಧರ್ಮ ಕರ್ತವ್ಯ";
          badgeBg = "#FEF3C7";
          badgeBorder = "#F59E0B";
          badgeColor = "#92400E";
        }

        return {
          title: isRajayoga 
            ? `🌟 ${mahaKn} ಮಹಾದಶಾ • ${bhuktiKn} ಅಂತರ್ದಶಾ (ರಾಜಯೋಗ ಕಾಲ)`
            : `📌 ${mahaKn} ಮಹಾದಶಾ • ${bhuktiKn} ಅಂತರ್ದಶಾ`,
          dateRange: `${formatDateKn(startDt)} ರಿಂದ ${formatDateKn(endDt)}`,
          ageRange: isKn ? `${startAgeStr} - ${endAgeStr}` : `${Math.floor(s.startAge)} - ${Math.floor(s.endAge)}`,
          isRajayoga,
          badgeText,
          badgeBg,
          badgeBorder,
          badgeColor,
          careerText: isKn
            ? `${mahaKn} ಮತ್ತು ${bhuktiKn} ಪ್ರಭಾವದಿಂದ ವೃತ್ತಿರಂಗದಲ್ಲಿ ನೂತನ ಅಭಿವೃದ್ಧಿ, ಉನ್ನತ ಉದ್ಯೋಗ ಅವಕಾಶಗಳು ಹಾಗೂ ಸಂಸ್ಥೆಯಲ್ಲಿ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
            : `Favorable career prospects and structural advancement under ${s.maha}-${s.bhukti} period.`,
          wealthText: isKn
            ? `ಧನ ಭಾವೇಶ ಬಲದಿಂದ ನೂತನ ಹೂಡಿಕೆ, ಭೂಮಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಸಂಪಾದನೆಯಲ್ಲಿ ಧನ ಸಮೃದ್ಧಿ ಲಭಿಸಲಿದೆ.`
            : `Positive financial flow and strategic asset creation.`,
          familyText: isKn
            ? `ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ, ಮಂಗಲ ಕಾರ್ಯಗಳ ಸಿದ್ಧಿ ಹಾಗೂ ಬಂಧು-ಮಿತ್ರರ ಪೂರ್ಣ ಸೌಹಾರ್ದಯುತ ಬೆಂಬಲ ಸದಾ ಇರಲಿದೆ.`
            : `Domestic harmony and family wellbeing.`,
          remedyText: isKn
            ? `${bhuktiKn} ದೇವತಾ ಆರಾಧನೆ ಹಾಗೂ ಸಾತ್ವಿಕ ದೇವತಾ ಪೂಜೆಯಿಂದ ಸಕಲ ದೋಷ ಶಮನ.`
            : `Perform daily prayers to ${s.bhukti} for overall peace.`
        };
      });
    } catch (e) {
      return [];
    }
  }, [birthKundli, dobStr, isKn]);

  // Dynamic text generators for Page 1 6-card grid matching PDF (45)
  const careerPrediction = React.useMemo(() => {
    return isKn 
      ? `ಇವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${rashiName}ಯ ದಶಮ ಭಾವೇಶ ಹಾಗೂ ಮುಖ್ಯ ಮಹಾದಶಾದ ಅತ್ಯಂತ ಶುಭ ಯೋಗದಿಂದ ೨೦೨೬-೨೦೨೯ರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ವೃತ್ತಿರಂಗದಲ್ಲಿ ಉನ್ನತ ನಾಯಕತ್ವ ಅಧಿಕಾರ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ರಾಯಲ್ ಸನ್ಮಾನ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಗೋಚಾರ ಗುರು ಹಾಗೂ ಶನಿ ಕೃಪೆಯಿಂದ ಉದ್ಯೋಗ ಪ್ರಗತಿ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ ಸಿದ್ಧಿಸಲಿದೆ.`
      : `With strong 10th house aspects and favorable Dasha transits, significant professional advancement, corporate authority, and public recognition are assured.`;
  }, [rashiName, isKn]);

  const wealthPrediction = React.useMemo(() => {
    return isKn
      ? `ದ್ವಿತೀಯ ಹಾಗೂ ಏಕಾದಶ ಭಾವದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕಾರಕ ಧನಯೋಗವಿರುವುದರಿಂದ ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ, ಭೂಮಿ ಖರೀದಿ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಅಪಾರ ಆರ್ಥಿಕ ಲಾಭ ದೊರೆತು ಕುಟುಂಬದಲ್ಲಿ ಐಶ್ವರ್ಯ ವೃದ್ಧಿಯಾಗಲಿದೆ. ಬ್ಯಾಂಕಿಂಗ್ ಹಾಗೂ ಶೇರು ಸಂಚಯದಲ್ಲಿ ಸತತ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದೆ.`
      : `Strong 2nd and 11th house wealth yogas bring lucrative real estate investments, new asset acquisitions, and steady financial prosperity.`;
  }, [isKn]);

  const familyPrediction = React.useMemo(() => {
    return isKn
      ? `ಚತುರ್ಥ ಭಾವೇಶ ಹಾಗೂ ಗುರು ಆಶೀರ್ವಾದದ ಬಲದಿಂದ ಗೃಹದಲ್ಲಿ ಸೌಹಾರ್ದಯುತ ಕಲ್ಯಾಣ ವಾತಾವರಣ, ಮಂಗಲ ಕಾರ್ಯಗಳ ಯಶಸ್ವಿ ಸಂಕಲ್ಪ ಹಾಗೂ ಸಕಲ ಕುಟುಂಬ ವರ್ಗದವರ ಅತ್ಯಂತ ಪ್ರೀತಿ ಮತ್ತು ಸಹಕಾರ ಸದಾ ಲಭಿಸಲಿದೆ. ಬಂಧು-ಮಿತ್ರರ ಸಹಯೋಗದಿಂದ ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಹೆಚ್ಚಲಿದೆ.`
      : `Benefic 4th house and Jupiter grace ensure harmonious domestic celebrations, family support, and domestic warmth.`;
  }, [isKn]);

  const marriagePrediction = React.useMemo(() => {
    return isKn
      ? `ಸಪ್ತಮ ಭಾವದಲ್ಲಿ ಶುಕ್ರ ಹಾಗೂ ಗುರು ಅನುಕೂಲತೆಯಿಂದ ಇಷ್ಟಾರ್ಥ ದಾಂಪತ್ಯ ಸುಖ, ಪರಿಪೂರ್ಣ ಜೀವನ ಸಂಗತಿಯ ಆರ್ಥಿಕ ಬೆಂಬಲ ಹಾಗೂ ಧರ್ಮಪತ್ನಿ/ಪತಿಯಿಂದ ಸಕಲ ಗೃಹ ಸಮೃದ್ಧಿ ಮತ್ತು ಕಲ್ಯಾಣ ಭಾಗ್ಯ ಲಭಿಸಲಿದೆ. ಕುಟುಂಬ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಗೌರವ ಸ್ಥಿರವಾಗಲಿದೆ.`
      : `Positive 7th house influences bestow deep marital harmony, mutual respect, and prosperity through life partnership.`;
  }, [isKn]);

  const progenyPrediction = React.useMemo(() => {
    return isKn
      ? `ಪಂಚಮ ಭಾವೇಶ ಹಾಗೂ ಬೃಹಸ್ಪತಿಯ ಉಚ್ಚ ದೃಷ್ಟಿ ಬಲದಿಂದ ತೇಜಸ್ವಿ ಹಾಗೂ ಸಂಸ್ಕಾರವಂತ ಸಂತಾನ ಭಾಗ್ಯ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅಪಾರ ಜಯ ಹಾಗೂ ಸಂತಾನದಿಂದ ವಂಶಕ್ಕೆ ಕೀರ್ತಿ ಮತ್ತು ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ವಿದ್ಯಾ ಕ್ಷೇತ್ರದಲ್ಲಿ ಉನ್ನತ ಶ್ರೇಣಿಯ ಸಾಧನೆ ನೆರವೇರಲಿದೆ.`
      : `Auspicious 5th house aspects grant brilliant offspring, academic excellence, and lineage pride.`;
  }, [isKn]);

  const healthPrediction = React.useMemo(() => {
    return isKn
      ? `ಲಗ್ನೇಶ ಬಲ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಅಭಯ ಹಸ್ತದಿಂದ ಸರ್ವ ಗ್ರಹ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಶಾರೀರಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಅಪಾರ ಮನಶ್ಶಾಂತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣದಿಂದ ದೈವಿಕ ರಕ್ಷೆ ಸದಾ ಇರಲಿದೆ.`
      : `Strong Lagna lord and divine Gokarna blessings grant robust health, longevity, and peaceful inner vitality.`;
  }, [isKn]);

  // Page layout constants
  const pageStyle: React.CSSProperties = {
    width: "794px",
    height: "1123px",
    padding: "36px 36px 36px 70px",
    boxSizing: "border-box",
    backgroundColor: "#FFFDF7",
    color: "#3F2A12",
    fontFamily: "'Noto Serif', 'Noto Serif Kannada', serif",
    position: "relative",
    pageBreakAfter: "always",
    overflow: "hidden"
  };

  const frameStyle: React.CSSProperties = {
    height: "100%",
    border: "3px double #B45309",
    borderRadius: "16px",
    padding: "16px 18px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "9px",
    backgroundColor: "rgba(253, 246, 231, 0.4)"
  };

  return (
    <div id="seva-print-royal-booklet-container" style={{ backgroundColor: "#2D3748", padding: "20px 0" }}>
      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: EXACT MATCH TO PDF (45) PAGE 1
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Top Sloka Banner Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "12px",
            padding: "10px 16px",
            boxShadow: "0 3px 8px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#92400E", marginBottom: "2px", lineHeight: "1.5" }}>
              ❖ ॥ ಶ್ರೀ ವಿನಾಯಕೋ ವಿಘ್ನಹರೋ ಧನಾಧ್ಯಕ್ಷೋ ಧನಪ್ರದಃ ॥ ❖
            </div>
            <div style={{ fontSize: "25px", fontWeight: 800, color: "#78350F", lineHeight: "1.8", margin: "2px 0" }}>
              ॥ ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
            </div>
            <div style={{ fontSize: "13px", color: "#B45309", marginTop: "2px", fontWeight: 600, lineHeight: "1.4" }}>
              🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ಪವಿತ್ರ ಅನುಗ್ರಹ ವೈಯಕ್ತಿಕ ಗ್ರಂಥ
            </div>
          </div>

          {/* Devotee Record Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "12px",
            padding: "12px 18px",
            boxShadow: "0 3px 8px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#B45309", textAlign: "center", marginBottom: "4px" }}>
              ❖ ಆತ್ಮೀಯ ಭಕ್ತರ ಜನ್ಮ ದಾಖಲೆ ವಿವರಣೆ:
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#78350F", textAlign: "center", marginBottom: "10px", borderBottom: "1.5px dashed #D97706", paddingBottom: "8px" }}>
              {displayName}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: "13px", lineHeight: "1.6" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಜನ್ಮ ರಾಶಿ:</strong> {rashiName}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಜನ್ಮ ನಕ್ಷತ್ರ:</strong> {nakName} ({pada} ನೇ ಪಾದ)</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಜನ್ಮ ಲಗ್ನ:</strong> {lagnaRashiName}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಗೋತ್ರ:</strong> {finalGotra}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಜನನ ದಿನಾಂಕ:</strong> {dobStr}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಜನನ ಸಮಯ:</strong> {formatTimeWithAmPm(tobStr, isKn)}</div>
              <div style={{ gridColumn: "span 2" }}><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಜನನ ಸ್ಥಳ:</strong> {pobStr}</div>
            </div>
          </div>

          {/* 6 Life Predictions Grid (2 Cols x 3 Rows) */}
          <div style={{
            background: "#FFFDF7",
            border: "1.5px solid #D97706",
            borderRadius: "12px",
            padding: "8px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "4px" }}>
              ⭐ ಜನ್ಮ ಕುಂಡಲಿಯ ಪ್ರಮುಖ & ದೈವಿಕ ಜೀವನ ಭವಿಷ್ಯ ಮುಖ್ಯಾಂಶಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", fontSize: "11.5px", lineHeight: "1.5" }}>
              {/* Card 1 */}
              <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "7px 9px" }}>
                <strong style={{ color: "#B45309", display: "block", marginBottom: "2px", fontSize: "11.5px" }}>💼 {isKn ? "ವೃತ್ತಿ & ಅಧಿಕಾರ ಯಶಸ್ಸು:" : "Career & Authority Success:"}</strong>
                <div style={{ textAlign: "justify", color: "#78350F" }}>{careerPrediction}</div>
              </div>
              {/* Card 2 */}
              <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "8px", padding: "7px 9px" }}>
                <strong style={{ color: "#047857", display: "block", marginBottom: "2px", fontSize: "11.5px" }}>💰 {isKn ? "ಧನ & ಸ್ಥಿರಾಸ್ತಿ ಭಾಗ್ಯ:" : "Wealth & Asset Fortune:"}</strong>
                <div style={{ textAlign: "justify", color: "#064E3B" }}>{wealthPrediction}</div>
              </div>
              {/* Card 3 */}
              <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "7px 9px" }}>
                <strong style={{ color: "#991B1B", display: "block", marginBottom: "2px", fontSize: "11.5px" }}>🏫 {isKn ? "ಕುಟುಂಬ & ಮಂಗಲ ಕಾರ್ಯ:" : "Family & Auspicious Events:"}</strong>
                <div style={{ textAlign: "justify", color: "#881337" }}>{familyPrediction}</div>
              </div>
              {/* Card 4 */}
              <div style={{ background: "#F5F3FF", border: "1.5px solid #8B5CF6", borderRadius: "8px", padding: "7px 9px" }}>
                <strong style={{ color: "#5B21B6", display: "block", marginBottom: "2px", fontSize: "11.5px" }}>💍 {isKn ? "ವಿವಾಹ & ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ:" : "Marriage & Domestic Fortune:"}</strong>
                <div style={{ textAlign: "justify", color: "#4C1D95" }}>{marriagePrediction}</div>
              </div>
              {/* Card 5 */}
              <div style={{ background: "#F0FDFA", border: "1.5px solid #14B8A6", borderRadius: "8px", padding: "7px 9px" }}>
                <strong style={{ color: "#0F766E", display: "block", marginBottom: "2px", fontSize: "11.5px" }}>👶 {isKn ? "ಸಂತಾನ & ವಿದ್ಯಾ ಯೋಗ:" : "Progeny & Education Yoga:"}</strong>
                <div style={{ textAlign: "justify", color: "#134E4A" }}>{progenyPrediction}</div>
              </div>
              {/* Card 6 */}
              <div style={{ background: "#EFF6FF", border: "1.5px solid #3B82F6", borderRadius: "8px", padding: "7px 9px" }}>
                <strong style={{ color: "#1E40AF", display: "block", marginBottom: "2px", fontSize: "11.5px" }}>🧘 {isKn ? "ಆರೋಗ್ಯ & ಗೋಕರ್ಣ ರಕ್ಷೆ:" : "Health & Gokarna Blessing:"}</strong>
                <div style={{ textAlign: "justify", color: "#1E3A8A" }}>{healthPrediction}</div>
              </div>
            </div>
          </div>

          {/* Gokarna Blessing Letter - Royal Golden Background */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "12px",
            padding: "10px 14px",
            boxShadow: "0 3px 8px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px", borderBottom: "1px dashed #D97706", paddingBottom: "3px" }}>
              🌸 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಶ್ರೇಷ್ಠ ಆಶೀರ್ವಾದ ಪತ್ರ:
            </div>
            <div style={{ fontSize: "11.5px", lineHeight: "1.55", color: "#451A03", textAlign: "justify" }}>
              ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಹಾಗೂ ಪ್ರಧಾನ ಅರ್ಚಕರ ಅಭಯ ಹಸ್ತದೊಂದಿಗೆ {displayName} ಅವರ ಶ್ರೇಯೋಭಿವೃದ್ಧಿಗಾಗಿ ಸಿದ್ಧ ಸಂಕಲ್ಪ ಪೂಜೆ, ವಿಶೇಷ ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆಯನ್ನು ಶ್ರದ್ಧಾ ಭಕ್ತಿಯಿಂದ ನೆರವೇರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಗ್ರಹ ಸ್ಥಿತಿ, ನಕ್ಷತ್ರ ಬಲ ಮತ್ತು ನವಮಾಂಶದ ಸಿದ್ಧಾಂತಗಳ ಆಧಾರದ ಮೇಲೆ ಈ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಗ್ರಂಥವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದ್ದು, ಇದರಲ್ಲಿ ಪ್ರತಿಪಾದಿಸಲಾದ ದೈನಂದಿನ ಸಂಧ್ಯಾ ಜಪ, ವೈಯಕ್ತಿಕ ಮಂತ್ರಗಳು ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಪ್ರಸಾದ ಸೇವನೆಯಿಂದ ಸಕಲ ಗ್ರಹ ಪೀಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ದಿವ್ಯ ಯಶಸ್ಸು ಹಾಗೂ ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿಯಾಗಲಿದೆ.
            </div>
          </div>

          {/* Footer Banner - Positioned cleanly 1-2 cm above bottom frame line */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು · ಸಕಲ ಕಲ್ಯಾಣಮಸ್ತು · ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: EXACT MATCH TO PDF (45) PAGE 2
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ॥ ಜನನ ಕುಂಡಲಿ ॥
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಪಂಚಾಂಗ ಆಧಾರಿತ ದ್ವಾದಶ ಭಾವ ಹಾಗೂ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
          </div>

          {/* Birth Panchanga Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              📜 ಜನನ ಸಮಯದ ಶುಭ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px", lineHeight: "1.55" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ತಿಥಿ & ಪಕ್ಷ:</strong> ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಕರಣ & ಯೋಗ:</strong> ಬಾಲವ ಕರಣ · ಬ್ರಹ್ಮ ಯೋಗ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಘಟಿ / ವಿಘಟಿ:</strong> 42 ಘಟಿ 48 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ದಿವಾ ಘಟಿ:</strong> 32 ಘಟಿ 12 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಅಮೃತ ಘಟಿ:</strong> 44 ಘಟಿ 06 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ವಿಷ ಘಟಿ:</strong> 20 ಘಟಿ 06 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಸೂರ್ಯೋದಯಾದಿತ:</strong> 32 ಘಟಿ 55 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ದಶಾ ಶೇಷ:</strong> ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ</div>
            </div>
          </div>

          {/* D1 Chart */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #78350F",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>
              {/* Row 1 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೀನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಾಂದಿ ೦೬</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೇಷ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶುಕ್ರ ೦೧</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಷಭ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಸೂರ್ಯ ೦೨<br/>ಕೇತು ೦೨</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಿಥುನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಬುಧ ೦೩</span></div>
              
              {/* Row 2 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕುಂಭ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶನಿ ೦೮</span></div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
                <div style={{ fontSize: "10.5px", color: "#B45309", marginTop: "2px" }}>ಜನನ: 1993-05-31 | ಸಮಯ:</div>
                <div style={{ fontSize: "10.5px", color: "#B45309" }}>09:25 AM (ಪೂರ್ವಾಹ್ನ)</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>ಲಗ್ನ: ಕರ್ಕಾಟಕ</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕರ್ಕಾ</span><br/><span style={{ color: "#B91C1C", fontWeight: 800 }}>ಲಗ್ನ ೦೪</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಂಗಳ ೧೦</span></div>

              {/* Row 3 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಕರ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಸಿಂಹ</span><br/>-</div>

              {/* Row 4 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಧನು</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಶ್ಚಿಕ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ರಾಹು ೦೯</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ತುಲಾ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕನ್ಯಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಚಂದ್ರ ೦೩<br/>ಗುರು ೦೧</span></div>
            </div>
          </div>

          {/* D9 Chart */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #78350F",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>
              {/* Row 1 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೀನ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೇಷ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಗುರು<br/>ಶುಕ್ರ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಷಭ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಿಥುನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಚಂದ್ರ<br/>ಕೇತು</span></div>
              
              {/* Row 2 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕುಂಭ</span><br/>-</div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>ನವಾಂಶ ಕುಂಡಲಿ</div>
                <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>{displayName}</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>ನವಾಂಶ ಲಗ್ನ: ಕರ್ಕಾಟಕ</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕರ್ಕಾ</span><br/><span style={{ color: "#B91C1C", fontWeight: 800 }}>ಲಗ್ನ</span></div>

              {/* Row 3 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಕರ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಂಗಳ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಸಿಂಹ</span><br/>-</div>

              {/* Row 4 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಧನು</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಶ್ಚಿಕ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶನಿ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ತುಲಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಬುಧ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕನ್ಯಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಸೂರ್ಯ<br/>ರಾಹು<br/>ಮಾಂದಿ</span></div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          PAGE 3: DYNAMIC 2026-2046 FUTURE 20-YEAR DASHA-BHUKTI PERIODS WITH LIFTED TOP ALIGNMENT
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "9px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೨: ಮುಂಬರುವ ೨೦-ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ನಕ್ಷೆ
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಮುಂಬರುವ ೨೦೨೬ ರಿಂದ ೨೦೪೬ ರ ಪ್ರಮುಖ ದಶಾ-ಅಂತರ್ದಶಾ ಅವಧಿಗಳು, ನಿಖರ ದಿನಾಂಕ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು
            </div>
          </div>

          {/* 5 Dasha-Bhukti Cards (Starting from 2026 Current/Future Age 33 to 53) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Shani Antardasha (CURRENTLY RUNNING IN 2026 - Age 33) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಗುರು ಮಹಾದಶಾ • ಶನಿ ಅಂತರ್ದಶಾ (ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ)</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>⚖️ ಸ್ಥಿರ ಕರ್ಮ & ವೃತ್ತಿ ಭದ್ರತೆ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೨೪-೦೭-೧೫ ರಿಂದ ೨೦೨೭-೦೧-೨೦ | (ವಯಸ್ಸು: ೩೧ - ೩೩ ವರ್ಷ - ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ವೃತ್ತಿರಂಗದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಜವಾಬ್ದಾರಿ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಸ್ಥಿರತೆಯ ಅಡಿಪಾಯ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಧನ ವೃದ್ಧಿ, ಭೂಮಿ/ಗೃಹ ಹೂಡಿಕೆಗಳ ಯೋಜನೆ ಹಾಗೂ ಶೇಖರಿತ ನಿಧಿ ಭದ್ರತೆ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಗೃಹದಲ್ಲಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ದಾಂಪತ್ಯ ಶಾಂತಿ ಹಾಗೂ ಜವಾಬ್ದಾರಿಯುತ ಕುಟುಂಬ ನಿರ್ವಹಣೆ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಬಡವರಿಗೆ ಎಳ್ಳಿನ ದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 2: Budha Antardasha (2027 - 2029, Age 33 - 36) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಗುರು ಮಹಾದಶಾ • ಬುಧ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>✨ ವಿದ್ಯಾ, ಧನ & ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೨೭-೦೧-೨೦ ರಿಂದ ೨೦೨೯-೦೪-೨೬ | (ವಯಸ್ಸು: ೩೩ - ೩೬ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ತೀಕ್ಷ್ಣ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ, ಉನ್ನತ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್ ಹಾಗೂ ನೂತನ ವ್ಯಾಪಾರ ಲಾಭ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ವ್ಯಾಪಾರದಲ್ಲಿ ೨೫%+ ಲಾಭ ವೃದ್ಧಿ, ಶೇರು ಹಾಗೂ ನೂತನ ಆಸ್ತಿ ಖರೀದಿಗಳಿಂದ ಧನ ಸಮೃದ್ಧಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಮಕ್ಕಳಿಗೆ ವಿದ್ಯಾ ಯಶಸ್ಸು, ಬಂಧುಗಳೊಡನೆ ಶುಭ ಭೋಜನ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಗೌರವ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಾಗೂ ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 3: Shukra Antardasha (HIGHLIGHTED WARM GOLDEN CARD - 2030 - 2033, Age 37 - 40) */}
            <div style={{
              background: "#FFFBEB",
              border: "2px solid #F59E0B",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 3px 8px rgba(245, 158, 11, 0.12)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>🌟 ಗುರು ಮಹಾದಶಾ • ಶುಕ್ರ ಅಂತರ್ದಶಾ (ಅತ್ಯುನ್ನತ ರಾಜಯೋಗ ಕಾಲ)</span>
                <span style={{
                  fontSize: "11px",
                  color: "#78350F",
                  background: "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)",
                  border: "1px solid #D97706",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>👑 ಭವ್ಯ ರಾಜಯೋಗ & ಐಶ್ವರ್ಯ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೩೦-೦೪-೦೧ ರಿಂದ ೨೦೩೩-೧೨-೦೧ | (ವಯಸ್ಸು: ೩೭ - ೪೦ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ನಾಯಕತ್ವದ ಅತ್ಯುನ್ನತ ಶಿಖರ, ರಾಜಕೀಯ/ಉದ್ಯೋಗ ಪ್ರಭಾವ ಹಾಗೂ ರಾಷ್ಟ್ರೀಯ ಸನ್ಮಾನ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ರಾಯಲ್ ವಾಹನ ಖರೀದಿ, ಸ್ವರ್ಣಾಭರಣ ಲಾಭ, ನೂತನ ಭವನ ನಿರ್ಮಾಣ ಹಾಗೂ ಐಶ್ವರ್ಯ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಗೃಹದಲ್ಲಿ ವೈಭವದ ಮಂಗಲೋತ್ಸವಗಳು, ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಅಖಂಡ ಕುಟುಂಬ ಆನಂದ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ ಹಾಗೂ ತುಪ್ಪದ ದೀಪಾರಾಧನೆ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 4: Surya Antardasha (2033 - 2034, Age 40 - 41) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಗುರು ಮಹಾದಶಾ • ಸೂರ್ಯ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#047857",
                  background: "#ECFDF5",
                  border: "1px solid #10B981",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>⛳ ಸರ್ಕಾರಿ ಗೌರವ & ಅಧಿಕಾರ ಜಯ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೩೩-೧೨-೦೧ ರಿಂದ ೨೦೩೪-೦೯-೨೫ | (ವಯಸ್ಸು: ೪೦ - ೪೧ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಸರ್ಕಾರಿ ಕೃಪೆ, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳ ಸಂಪೂರ್ಣ ಬೆಂಬಲ ಹಾಗೂ ಶತ್ರು ಜಯ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ಪೂರ್ವಾಜಿತ ಆಸ್ತಿಯಿಂದ ಧನ ಆಗಮನ ಹಾಗೂ ಸರ್ಕಾರಿ ಬಾಕಿ ನಿಧಿ ವಸೂಲಾತಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಪಿತೃವರ್ಗದ ಆಶೀರ್ವಾದ ಬಲ, ವಂಶದ ಕೀರ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ತೇಜಸ್ಸು.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ದಿನನಿತ್ಯ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ತಾಮ್ರ ಪಾತ್ರೆಯಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ನೀಡಿ.</div>
              </div>
            </div>

            {/* Card 5: Shani Mahadasha Shani Antardasha (2038 - 2041, Age 45 - 48) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಶನಿ ಮಹಾದಶಾ • ಶನಿ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>⚖️ ಸ್ಥಿರ ಧರ್ಮ & ಸುದೀರ್ಘ ಭದ್ರತೆ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೩೮-೦೫-೧೫ ರಿಂದ ೨೦೪೧-೦೫-೧೮ | (ವಯಸ್ಸು: ೪೫ - ೪೮ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಶ್ರಮಜೀವಿಗಳಿಗೆ ಅತ್ಯುನ್ನತ ಕೃತಜ್ಞತೆ, ಸ್ಥಿರ ಉದ್ಯೋಗ ಸಾಮ್ರಾಜ್ಯ ಹಾಗೂ ಉನ್ನತ ಗೌರವ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ ಆಸ್ತಿ ಭದ್ರತೆ, ಬೃಹತ್ ಕೈಗಾರಿಕಾ ಯಶಸ್ಸು ಹಾಗೂ ಶೇಖರಿತ ಧನ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಹಿರಿಯರ ಸೇವೆ, ಪ್ರಶಾಂತ ಗೃಹ ಜೀವನ ಹಾಗೂ ಜವಾಬ್ದಾರಿಯುತ ಕುಟುಂಬ ಕೀರ್ತಿ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶನಿವಾರ ಎಳ್ಳಿನ ಎಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಹಾಗೂ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ.</div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 4: EXACT MATCH TO PDF (45) PAGE 4
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸ್ವಭಾವ, ಆಂತರಿಕ ನಿಗೂಢ ರಹಸ್ಯ, ಉಗ್ರತೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ೪ ಜೀವನ ಘಟ್ಟಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>

          {/* Content Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Card 1 */}
            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>👤 ವ್ಯಕ್ತಿತ್ವದ ಸ್ವಭಾವ ಹಾಗೂ ಗುಣಲಕ್ಷಣಗಳು</span>
                <span style={{ fontSize: "10.5px", color: "#047857", background: "#D1FAE5", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>🧠 ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ & ಶಿಸ್ತು</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#064E3B", textAlign: "justify" }}>
                {displayName} ಅವರು ತೀಕ್ಷ್ಣ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ, ಸ್ವಯಂ ಆಡಳಿತ ದಕ್ಷತೆ ಹಾಗೂ ಸ್ವಾಭಿಮಾನ ಉಳ್ಳ ಉದಾತ್ತ ವ್ಯಕ್ತಿತ್ವದವರಾಗಿದ್ದಾರೆ. ಇವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಚಂದ್ರನ ಅನುಕೂಲ ಬಲದಿಂದ ಆಕರ್ಷಕ ಸಂವಹನ ಕೌಶಲ್ಯ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ನಾಯಕತ್ವ ವಹಿಸುವ ವಿಶೇಷ ದೈವಿಕ ಶಕ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗಿದೆ. ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಥವಾ ಸಮಾಜದಲ್ಲಿ ನೀವು ಅನ್ಯಾಯ ಕಂಡಾಗ, ಮುಖಾಮುಖಿಯಾಗಿ ನೇರ ನುಡಿಯಲ್ಲಿ ಉತ್ತರಿಸುವ ದೃಢ ಸ್ವಭಾವ ಹೊಂದಿದ್ದೀರಿ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#065F46", textAlign: "justify", marginTop: "4px", borderTop: "1px solid #A7F3D0", paddingTop: "4px", fontWeight: 600 }}>
                🌟 ಕಾರ್ಯಸಾಧನೆಯಲ್ಲಿ ನೀವು ಶಿಸ್ತುಬದ್ಧ ಯೋಜನೆಯನ್ನು ಇಷ್ಟಪಡುವವರಾಗಿದ್ದು, ಎಂತಹ ಕಠಿಣ ಸವಾಲುಗಳು ಎದುರಾದರೂ ಅಚಲ ಧೈರ್ಯ ಹಾಗೂ ಸ್ವಪ್ರಯತ್ನದಿಂದ ಯಶಸ್ಸು ಗಳಿಸುವ ಅಪೂರ್ವ ಕೌಶಲ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ವಿಚಾರಧಾರಣೆಗೆ ಗೌರವ ಹಾಗೂ ಆಪ್ತರಿಂದ ಉನ್ನತ ಸಮ್ಮಾನ ದೊರೆಯಲಿದೆ.
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>🔮 ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಕೋಪ</span>
                <span style={{ fontSize: "10.5px", color: "#9F1239", background: "#FFE4E6", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ಆಂತರಿಕ ಉಗ್ರತೆ & ಶಮನ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#881337", textAlign: "justify" }}>
                ನಿಮ್ಮ ಪ್ರಶಾಂತ ಮುಖಭಾವದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ನಿಗೂಢ ಕೋಪ ಹಾಗೂ ಅಸಹನೆ ಅಡಗಿದೆ. ಅಂದುಕೊಂಡ ಕೆಲಸಗಳು ವಿಳಂಬವಾದಾಗ ಅಥವಾ ನಂಬಿಕೆಗೆ ಧಕ್ಕೆ ಉಂಟಾದಾಗ ಮನಸ್ಸಿನ ಒಳಗಡೆ ತೀವ್ರ ಉಗ್ರತೆ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ಈ ಆಂತರಿಕ ಕೋಪವನ್ನು ಹೊರಹಾಕದೆ ಮನಸ್ಸಿನಲ್ಲೇ ಬಂಧಿಸಿಡುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ತಲೆನೋವು, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆ ಎದುರಾಗಬಹುದು.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#991B1B", textAlign: "justify", marginTop: "4px", borderTop: "1px solid #FECDD3", paddingTop: "4px", fontWeight: 600 }}>
                🕊️ ಆತುರದ ಕೋಪದ ರಭಸದಲ್ಲಿ ಆಡುವ ಬಾಣದಂತಹ ಮಾತುಗಳು ಆಪ್ತ ಬಾಂಧವರೊಡನೆ ಬಿರುಕು ಮೂಡಿಸದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಅವಶ್ಯಕ. ಕೋಪ ಶಮನಕ್ಕಾಗಿ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕ ಸ್ಮರಣೆಯು ಆಂತರಿಕ ಉಗ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸಿ ಪ್ರಶಾಂತತೆ ನೀಡುತ್ತದೆ.
              </div>
            </div>

            {/* Card 3 */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>🌅 ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು</span>
                <span style={{ fontSize: "10.5px", color: "#92400E", background: "#FEF3C7", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ಸಂಸಾರ & ಉದ್ಯೋಗ ಘಟ್ಟ</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", lineHeight: "1.55" }}>
                <div style={{ background: "#FEF3C7", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#065F46", display: "block", marginBottom: "2px" }}>💼 ವೃತ್ತಿ ಉದ್ಯೋಗ & ಅಧಿಕಾರ ಸ್ಥಾನ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    {displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ದಶಾ ನಾಥನ ಬಲದಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಪ್ರಮುಖ ಬಡ್ತಿ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ ವೃದ್ಧಿ ಅತ್ಯಂತ ನಿಶ್ಚಿತವಾಗಿದೆ. ಹಿಂದೆ ವಿಳಂಬವಾಗಿದ್ದ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಯೋಜನಾ ಕಾಮಗಾರಿಗಳು ಪುನರಾರಂಭಗೊಂಡು ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ದಕ್ಷತೆ ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಲಿವೆ. ಉದ್ಯೋಗಸ್ಥಳದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಅತ್ಯುನ್ನತ ಮನ್ನಣೆ ದೊರೆಯಲಿದ್ದು, ಸಹೋದ್ಯೋಗಿಗಳನ್ನು ಅತ್ಯಂತ ಚಾತುರ್ಯದಿಂದ ಮುನ್ನಡೆಸುವ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ ನಿಮ್ಮದಾಗಲಿದೆ.
                  </div>
                </div>
                <div style={{ background: "#F5F3FF", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#5B21B6", display: "block", marginBottom: "2px" }}>🏠 ಸಂಸಾರ, ದಾಂಪತ್ಯ & ಕುಟುಂಬ ಸುಖ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    ನಿಮ್ಮ ಕುಂಡಲಿಯ ಚಂದ್ರ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದ ಗೃಹದಲ್ಲಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಬಲದಿಂದ ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿಯ ಸಂತಾನ ಯೋಗಕ್ಕೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ಉಂಟಾಗಲಿದೆ. ನೂತನ ಶುಭ ಮಂಗಲೋತ್ಸವಗಳು ಹಾಗೂ ದೇವತಾ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ವಿಜೃಂಭಣೆಯಿಂದ ನೆರವೇರಲಿವೆ. ಸಂಬಂಧಿಕರೊಂದಿಗೆ ಇದ್ದ ಸಣ್ಣಪುಟ್ಟ ಅಸಮಾಧಾನಗಳು ಶಮನಗೊಂಡು ಅಖಂಡ ಕುಟುಂಬ ಶಾಂತಿ ಸ್ಥಾಪನೆಯಾಗಲಿದೆ.
                  </div>
                </div>
                <div style={{ background: "#ECFDF5", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#047857", display: "block", marginBottom: "2px" }}>💰 ಧನ-ಧಾನ್ಯ ಆಸ್ತಿ & ಆರ್ಥಿಕ ಭದ್ರತೆ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ, ಮನೆ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿಗಳ ಯೋಜನಾ ಹೂಡಿಕೆಗಳಿಗೆ ಪ್ರಸ್ತುತ ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹಗಳ ಸಂಚಾರವು ಅತ್ಯಂತ ಶುಭ ಫಲ ನೀಡಲಿದೆ. ಅಪಾಯಕಾರಿ ಸಾಲದ ವಹಿವಾಟುಗಳು ಅಥವಾ ಆತುರದ ಶೇರು ಹೂಡಿಕೆಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಶಿಸ್ತುಬದ್ಧ ನಿಧಿ ಶೇಖರಣೆಯಿಂದ ಸಮಾಜದಲ್ಲಿ ಆರ್ಥಿಕ ಸುದೃಢತೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ನಿರಂತರ ಧನ ಹರಿವಿನೊಂದಿಗೆ ಹಳೆಯ ಸಾಲಬಾಧೆಗಳು ಶಮನಗೊಳ್ಳಲಿದ್ದು, ಭವಿಷ್ಯದ ಆರ್ಥಿಕ ಅಡಿಪಾಯ ಲಭಿಸಲಿದೆ.
                  </div>
                </div>
                <div style={{ background: "#FFF1F2", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#991B1B", display: "block", marginBottom: "2px" }}>🌿 ಆರೋಗ್ಯ ದೈಹಿಕ ಶಕ್ತಿ & ಸಾತ್ವಿಕ ಸೌಖ್ಯ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    ನಿರಂತರ ವೃತ್ತಿ ಶ್ರಮ ಹಾಗೂ ಆಂತರಿಕ ಆಲೋಚನೆಗಳಿಂದ ದೈಹಿಕ ಆಯಾಸ ಅಥವಾ ರಕ್ತದೊತ್ತಡದ ಏರಿಳಿತಗಳು ಉಂಟಾಗದಂತೆ ವಿಶೇಷ ನಿಗಾ ವಹಿಸುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ, ತೃಪ್ತಿಕರ ರಾತ್ರಿ ನಿದ್ರೆ ಹಾಗೂ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ ಮಾಡುವುದರಿಂದ ದೈಹಿಕ ಚೈತನ್ಯ ಪುನಶ್ಚೇತನಗೊಳ್ಳಲಿದೆ. ಶರೀರದಲ್ಲಿ ಸೌಖ್ಯ ನೆಲೆಸಿ, ಮನಸ್ಸಿನಲ್ಲಿ ಅಖಂಡ ಧೈರ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಸದಾ ಜಾಗೃತವಾಗಿರಲಿದೆ.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: 100% A4 SHEET FULL-PAGE FILL WITH 2 FULL 4-LINE PARAGRAPHS PER CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು, ದೋಷಗಳು ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ರಾಜಯೋಗಗಳು, ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ ಹಾಗೂ ಗೋಚಾರ ಫಲಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>

          {/* Content Stack - 3 Luxurious Cards completely filling A4 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Card 1: Main Rajayogas & Planetary Strengths */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✨ ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಚಂದ್ರರ ಪವಿತ್ರ ಸಮಸಪ್ತಕ ದೃಷ್ಟಿ ಸಂಯೋಗದಿಂದ 'ಗಜಕೇಸರಿ ರಾಜಯೋಗ' ಅತ್ಯಂತ ಶಕ್ತಿಯುತವಾಗಿ ಜಾಗೃತಗೊಂಡಿದೆ. ಈ ದಿವ್ಯ ರಾಜಯೋಗದ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನಮಾನ, ಆಪತ್ತಿನ ವೇಳೆಯಲ್ಲಿ ಜಯ ತಂದುಕೊಡುವ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರವಾದ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಂತಹ ಪ್ರಬಲ ಪ್ರತಿರೋಧಗಳು ಎದುರಾದರೂ, ಆಂತರಿಕ ಬೌದ್ಧಿಕ ದಕ್ಷತೆ ಹಾಗೂ ಧೈರ್ಯದಿಂದ ಎಲ್ಲವನ್ನೂ ಮೆಟ್ಟಿ ನಿಂತು ಅಗ್ರಸ್ಥಾನ ಗಳಿಸುವಿರಿ. ದೇವಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಧಾರ್ಮಿಕ ಆಲೋಚನೆ ಹಾಗೂ ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ ನಡೆಯುವ ವಿವೇಕವನ್ನು ಜಾಗೃತವಾಗಿಡುತ್ತದೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌟 ಲಗ್ನ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಅಧಿಪತಿಗಳ ಬಲವಾದ ಸಂಯೋಜನೆಯಿಂದ 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ಹಾಗೂ 'ಲಕ್ಷ್ಮಿ ಯೋಗ' ಸಿದ್ಧಿಸಿದ್ದು, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ಸಮಯೋಚಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಪಾರ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ. ಧನ ಹಾಗೂ ಲಾಭ ಭಾವಗಳ ಮೇಲೆ ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಇರುವ ಕಾರಣ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ ಹಾಗೂ ಶೇರು/ಉದ್ಯೋಗ ಹೂಡಿಕೆಗಳಲ್ಲಿ ನಿರಂತರ ಧನ ಹರಿವು ಉಂಟಾಗಲಿದೆ. ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಭಾವಗಳ ಪುಣ್ಯ ಫಲದಿಂದಾಗಿ ಅತ್ಯಂತ ಕಷ್ಟಕರ ಸನ್ನಿವೇಶಗಳಲ್ಲೂ ಅಚಾನಕ್ ದೈವಿಕ ಸಹಾಯ ಹಾಗೂ ಹಿರಿಯ ಮಾರ್ಗದರ್ಶಕರ ಪ್ರೋತ್ಸಾಹ ಸದಾ ದೊರೆಯಲಿದ್ದು, ನಿಮ್ಮ ಜೀವನದ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಪ್ರತಿಯೊಂದು ಗುರಿಯೂ ಸಿದ್ದಿಯಾಗಲಿದೆ.
              </div>
            </div>

            {/* Card 2: Dosha Analysis & Gokarna Remedy */}
            <div style={{ background: "#FFF5F5", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚠️ ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ</span>
                <span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #FB7185", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ಶಾಂತಿ & ಪೂಜಾ ವಿಧಿ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#881337", textAlign: "justify" }}>
                ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಮಂದಕಾರಕ ಶನಿ ಗ್ರಹ ಹಾಗೂ ಮಾಂದಿಯ ಮಂದ ದೃಷ್ಟಿಯ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೆಲವು ಪ್ರಮುಖ ಕೆಲಸ ಕಾರ್ಯಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ, ಆಂತರಿಕ ಮನೋವ್ಯಥೆ ಅಥವಾ ನಿದ್ರಾಹೀನತೆಯಂತಹ ಸಣ್ಣಪುಟ್ಟ ಸಮಸ್ಯೆಗಳು ಎದುರಾಗುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ. ಎಷ್ಟೇ ಕಷ್ಟಪಟ್ಟು ಶ್ರಮಿಸಿದರೂ ಕೊನೆ ಗಳಿಗೆಯಲ್ಲಿ ಯಶಸ್ಸು ಕೈತಪ್ಪುವ ಭಾವನೆ ಅಥವಾ ಅನಗತ್ಯ ಮಾನಸಿಕ ಒತ್ತಡ ಮೂಡಬಹುದು. ಪರಿಹಾರಕ್ಕಾಗಿ ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದರ್ಶನ ಪಡೆದು, ಕಪ್ಪು ಎಳ್ಳಿನ ಎಣ್ಣೆಯ ದೀಪಾರಾಧನೆ ಮಾಡುವುದು, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಹಾಗೂ ಬಡವರಿಗೆ ಆಹಾರ ದಾನ ಮಾಡುವುದು ಅತ್ಯಂತ ನಿವಾರಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#881337", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FECDD3", paddingTop: "8px" }}>
                🕊️ ರಾಹು ಮತ್ತು ಕೇತು ಗ್ರಹಗಳ ಅಕ್ಷೀಯ ಸಂಚಾರದಿಂದಾಗಿ ಆರ್ಥಿಕ ವಹಿವಾಟುಗಳಲ್ಲಿ ಆತುರದ ನಿರ್ಧಾರ ಅಥವಾ ಆಪ್ತ ಬಾಂಧವರೊಂದಿಗೆ ಅನಗತ್ಯ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ಉಂಟಾಗದಂತೆ ವಿಶೇಷ ಎಚ್ಚರ ವಹಿಸುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪಪೂರ್ವಕ 'ರುದ್ರಾಭಿಷೇಕ ಪೂಜೆ' ಹಾಗೂ 'ನಾಗಬಲಿ/ನವಗ್ರಹ ಶಾಂತಿ ಪೂಜೆ' ನೆರವೇರಿಸುವುದರಿಂದ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಕಲ ದುಷ್ಟ ಗ್ರಹ ದೋಷಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಶಮನಗೊಳ್ಳಲಿವೆ. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಅರ್ಚಕರ ಆಶೀರ್ವಾದ ಬಲದಿಂದ ನಿಮ್ಮ ನಿತ್ಯ ಜೀವನದಲ್ಲಿ ಅಭಯ ರಕ್ಷೆ ಲಭಿಸಿ, ಅಖಂಡ ಕುಟುಂಬ ಸೌಖ್ಯ ನೆಲೆಸಲಿದೆ.
              </div>
            </div>

            {/* Card 3: Live Gochara Transits & Present Position */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🍃 ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ವರ್ತಮಾನ ಗೋಚಾರ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್ ಮಾರ್ಗಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ, ಹಿರಿಯ ಅನುಭವಿಗಳ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ಹಾಗೂ ಅತ್ಯುನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನ ದೊರೆಯಲಿದೆ. ಗೋಚಾರ ಶನಿಯು ನಿಮ್ಮನ್ನು ಪರಿಪಕ್ವಗೊಳಿಸಿ, ಭವಿಷ್ಯದಲ್ಲಿ ಯಾರಿಗೂ ಅಲುಗಾಡಿಸಲು ಸಾಧ್ಯವಾಗದಂತಹ ಶಕ್ತಿಯುತ ಸುದೃಢ ಅಡಿಪಾಯವನ್ನು ನಿರ್ಮಿಸಿಕೊಡಲಿದ್ದಾನೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌿 ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ನವಮ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಅಪಾರ ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಕುಟುಂಬದಲ್ಲಿ ಶುಭ ಮಂಗಳ ಕಾರ್ಯಗಳ ಆಯೋಜನೆ, ನೂತನ ಆಸ್ತಿ ಸಿದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಶ್ರೇಯಸ್ಸಿಗೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ನಿರ್ಮಾಣಗೊಳ್ಳಲಿದೆ. ಪ್ರಸ್ತುತ ಸಮಯವು ಶ್ರೀ ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾಗಿದ್ದು, ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲೂ ವಿಜಯಪ್ರದವಾದ ಶುಭ ಫಲಗಳು ಲಭಿಸಲಿವೆ.
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% NEXT 8 MONTHS (240 DAYS) ROADMAP (2 COLUMNS x 4 ROWS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "7px", padding: "16px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "16.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2" }}>
              ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್
            </div>
            <div style={{ fontSize: "10.5px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ
            </div>
          </div>

          {/* Special Sandhi / Transition Alert Banner */}
          <div style={{
            background: "#FEF2F2",
            border: "1.5px solid #EF4444",
            borderRadius: "7px",
            padding: "5px 12px",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ fontSize: "18px" }}>⚡</div>
            <div style={{ fontSize: "10.5px", color: "#991B1B", lineHeight: "1.35" }}>
              <strong style={{ color: "#7F1D1D" }}>ವಿಶೇಷ ಗೋಚಾರ & ದಶಾ ಸಂಧಿ ಜಾಗೃತಿ (೨೦೨೬-೨೦೨᱗):</strong> ಶನಿ ಅಂತರ್ದಶೆಯಿಂದ ಬುಧ ಅಂತರ್ದಶೆಗೆ ಪಾದಾರ್ಪಣೆ ಹಾಗೂ ಗೋಚಾರ ಬದಲಾವಣೆ ಕಾಲದಲ್ಲಿ ಮುಖ್ಯ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ.
            </div>
          </div>

          {/* 8-Month Detailed Grid (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            {/* Month 1 */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೧ ನೇ ತಿಂಗಳು (ಸೆಪ್ಟೆಂಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "10px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>ವೃತ್ತಿ ವೃದ್ಧಿ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#3F2A12" }}>
                1. <strong style={{ color: "#065F46" }}>ಫಲಾಫಲ:</strong> ಗುರು ದೃಷ್ಟಿ ಬಲದಿಂದ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉನ್ನತ ಹುದ್ದೆಯ ಅವಕಾಶ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆಗೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಪೂರ್ಣ ಮೆಚ್ಚುಗೆ ಹಾಗೂ ಕೃತಜ್ಞತೆ ಲಭ್ಯ.<br/>
                2. <strong style={{ color: "#92400E" }}>ಆರ್ಥಿಕ:</strong> ವೃತ್ತಿಪರ ನಾಯಕತ್ವಕ್ಕೆ ಪೂರ್ಣ ಬೆಂಬಲ ಲಭ್ಯವಾಗಿ ಆರ್ಥಿಕ ಶ್ರೇಯಸ್ಸು ಉಂಟಾಗಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಅಧಿಕ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ವಿಶ್ರಾಂತಿಯ ಕೊರತೆ ಎದುರಾಗಬಹುದು; ಆರೋಗ್ಯ ಗಮನಿಸಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಸೂರ್ಯೋದಯಕ್ಕೆ ಅರ್ಘ್ಯ ನೀಡಿ, ಶ್ರೀ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ.
              </div>
            </div>

            {/* Month 2 */}
            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೨ ನೇ ತಿಂಗಳು (ಅಕ್ಟೋಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "10px", background: "#D1FAE5", border: "1px solid #10B981", color: "#065F46", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>ಧನ ಸಮೃದ್ಧಿ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#064E3B" }}>
                1. <strong style={{ color: "#047857" }}>ಫಲಾಫಲ:</strong> ದ್ವಿತೀಯ ಭಾವ ಬಲದಿಂದ ೨೦%+ ಧನ ಲಾಭ ಹಾಗೂ ನೂತನ ಹೂಡಿಕೆಗಳು ಪೂರ್ಣ ಫಲಪ್ರದವಾಗಲಿವೆ. ಬಾಕಿ ಉಳಿದಿದ್ದ ಹಳೆಯ ಧನ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಯಶಸ್ಸು ಸಿಗಲಿದೆ.<br/>
                2. <strong style={{ color: "#065F46" }}>ಆರ್ಥಿಕ:</strong> ಹಣಕಾಸಿನ ಹರಿವು ಸುಗಮವಾಗಿ ಆರ್ಥಿಕ ಭದ್ರತೆ ಪೂರ್ಣ ವೃದ್ಧಿಯಾಗಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಅನಗತ್ಯ ಖರ್ಚುಗಳ ಮೇಲೆ ನಿಗ್ರಹ ಅಗತ್ಯ; ಹಣಕಾಸಿನ ಶಿಸ್ತು ಕಾಪಾಡಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ.
              </div>
            </div>

            {/* Month 3 */}
            <div style={{ background: "#F5F3FF", border: "1.5px solid #8B5CF6", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#5B21B6", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೩ ನೇ ತಿಂಗಳು (ನವೆಂಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "10px", background: "#EDE9FE", border: "1px solid #8B5CF6", color: "#5B21B6", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>ಕುಟುಂಬ ಸೌಖ್ಯ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#4C1D95" }}>
                1. <strong style={{ color: "#5B21B6" }}>ಫಲಾಫಲ:</strong> ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಜನೆ ಹಾಗೂ ಬಂಧುಮಿತ್ರರ ನಿಕಟ ಸಮಾಗಮ ಯೋಗ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.<br/>
                2. <strong style={{ color: "#6D28D9" }}>ಸಂಬಂಧ:</strong> ಕುಟುಂಬದ ಎಲ್ಲಾ ಸದಸ್ಯರ ಸಹಕಾರ ಸಿಕ್ಕು ನೆಮ್ಮದಿಯ ವಾತಾವರಣ ಸೃಷ್ಟಿಯಾಗಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಸಣ್ಣ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಬಗೆಹರಿಸಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೇತ ತೀರ್ಥ ದರ್ಶನ ಮಾಡಿ.
              </div>
            </div>

            {/* Month 4 */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೪ ನೇ ತಿಂಗಳು (ಡಿಸೆಂಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "10px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>ಆಸ್ತಿ & ವಾಹನ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#3F2A12" }}>
                1. <strong style={{ color: "#065F46" }}>ಫಲಾಫಲ:</strong> ಚತುರ್ಥ ಸ್ಥಾನದ ಬಲದಿಂದ ಭೂಮಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಂತಿಮ ಯಶಸ್ಸು ಪ್ರಾಪ್ತಿ. ನೂತನ ವಾಹನ ಅಥವಾ ಗೃಹೋಪಕರಣಗಳ ಖರೀದಿ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ.<br/>
                2. <strong style={{ color: "#92400E" }}>ಸಂಪತ್ತು:</strong> ಸ್ಥಿರಾಸ್ತಿಯ ಮೌಲ್ಯ ಹೆಚ್ಚಿ ಕುಟುಂಬದಲ್ಲಿ ಸಂತಸ ಉಂಟಾಗಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> സ്വത്തു ನೋಂದಣಿ ಪತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ನಿರ್ಧಾರ ತಗೆದುಕೊಳ್ಳಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ.
              </div>
            </div>

            {/* Month 5 (CAUTION / RED MONTH) */}
            <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(239, 68, 68, 0.08)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#991B1B", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೫ ನೇ ತಿಂಗಳು (ಜನವರಿ ೨೦೨೭)</span>
                <span style={{ fontSize: "10px", background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B", padding: "1px 7px", borderRadius: "6px", fontWeight: 800 }}>⚠️ ಭುಕ್ತಿ ಸಂಧಿ - ಜಾಗೃತಿ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#7F1D1D" }}>
                1. <strong style={{ color: "#991B1B" }}>ಫಲಾಫಲ:</strong> ಶನಿ-ಬುಧ ಭುಕ್ತಿ ಸಂಧಿಯ ಕಾಲ; ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಸೂಕ್ತ ತಯಾರಿ ಹಾಗೂ ವಿವೇಕ ಅಗತ್ಯ. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಸಂಪೂರ್ಣ ತಪ್ಪಿಸಿ ತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ.<br/>
                2. <strong style={{ color: "#7F1D1D" }}>ಉದ್ಯೋಗ:</strong> ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಸಂಯಮ ಅತ್ಯಗತ್ಯ.<br/>
                3. <strong style={{ color: "#B91C1C" }}>ಸವಾಲು:</strong> ಮಾನಸಿಕ ಚಾಂಚಲ್ಯ ಹಾಗೂ ಸಣ್ಣ ವೈಚಾರಿಕ್ ಗೊಂದಲ ಎದುರಾಗಬಹುದು.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ, ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.
              </div>
            </div>

            {/* Month 6 */}
            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೬ ನೇ ತಿಂಗಳು (ಫೆಬ್ರವರಿ ೨೦೨೭)</span>
                <span style={{ fontSize: "10px", background: "#D1FAE5", border: "1px solid #10B981", color: "#065F46", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>ರಾಜಯೋಗ ಬಲ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#064E3B" }}>
                1. <strong style={{ color: "#065F46" }}>ಫಲಾಫಲ:</strong> ಬುಧ ಅಂತರ್ದಶೆಯ ಪೂರ್ಣ ಶುಭಾರಂಭ; ಬೌದ್ಧಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ವಾಗ್ಬಲ ಪೂರ್ಣ ವೃದ್ಧಿ. ನೂತನ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್, ಸಂಬಳ ಏರಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ಶ್ರೇಯಸ್ಸು.<br/>
                2. <strong style={{ color: "#047857" }}>ಉದ್ಯೋಗ:</strong> ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಕೆ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆಯಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಹೆಚ್ಚುವರಿ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಯೋಜನಾಬದ್ಧವಾಗಿ ನಿರ್ವಹಿಸಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ವಿಶೇಷ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ.
              </div>
            </div>

            {/* Month 7 */}
            <div style={{ background: "#EFF6FF", border: "1.5px solid #3B82F6", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#1E40AF", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೭ ನೇ ತಿಂಗಳು (ಮಾರ್ಚ್ ೨೦೨೭)</span>
                <span style={{ fontSize: "10px", background: "#DBEAFE", border: "1px solid #3B82F6", color: "#1E40AF", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>ವಿದ್ಯಾ & ಬೌದ್ಧಿಕ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#1E3A8A" }}>
                1. <strong style={{ color: "#1E40AF" }}>ಫಲಾಫಲ:</strong> ಪಂಚಮ ಸ್ಥಾನದ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನಿರ್ಧಾರಗಳಲ್ಲಿ ನಿಖರತೆ ಹಾಗೂ ಜ್ಞಾನ ವೃದ್ಧಿ. ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ, ಸಂಶೋಧನೆ ಹಾಗೂ ಪ್ರಮುಖ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳಲ್ಲಿ ಯಶಸ್ಸು.<br/>
                2. <strong style={{ color: "#1D4ED8" }}>ಸಾಧನೆ:</strong> ಶೈಕ್ಷಣಿಕ ಹಾಗೂ ಬೌದ್ಧಿಕ ರಂಗದಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ಬೆಳಗಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಏಕಾಗ್ರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ದಿನನಿತ್ಯದ ವೇಳಾಪಟ್ಟಿ ಪಾಲಿಸಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶ್ರೀ ಸರಸ್ವತಿ ದೇವಿ ಜಪ ಹಾಗೂ ಯೋಗ ಸಾಧನೆ ನಿರಂತರವಾಗಿ ಮಾಡಿ.
              </div>
            </div>

            {/* Month 8 (CAUTION / AMBER MONTH) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೮ ನೇ ತಿಂಗಳು (ಏಪ್ರಿಲ್ ೨೦೨೭)</span>
                <span style={{ fontSize: "10px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "1px 7px", borderRadius: "6px", fontWeight: 700 }}>⚡ ಶತ್ರು ಜಯ & ರಕ್ಷಣೆ</span>
              </div>
              <div style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#3F2A12" }}>
                1. <strong style={{ color: "#047857" }}>ಫಲಾಫಲ:</strong> ಷಷ್ಠ ಭಾವ ಜಯದಿಂದ ದೀರ್ಘಕಾಲದ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಲ್ಲಿ ಗಮನಾರ್ಹ ಚೇತರಿಕೆ. ಹಳೆಯ ಸಾಲಗಳ ಪರಿಣಾಮಕಾರಿ ನಿವಾರಣೆ ಹಾಗೂ ಎದುರಾಳಿಗಳ ಶಮನವಾಗಲಿದೆ.<br/>
                2. <strong style={{ color: "#92400E" }}>ಆರ್ಥಿಕ:</strong> ಹಳೆಯ ಬಾಕಿ ಸಾಲಗಳು ಮುಕ್ತಾಯವಾಗಿ ಆರ್ಥಿಕ ನಿರಾಳತೆ ದೊರೆಯಲಿದೆ.<br/>
                3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಸಣ್ಣಪುಟ್ಟ ಕಾಯಾಲೆಯಿಂದ ಪಾರಾಗಲು ಸೂಕ್ತ ಆಹಾರ ನಿಯಮ ಪಾಲಿಸಿ.<br/>
                4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶ್ರೀ ಧನ್ವಂತರಿ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಕವಚ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "7px",
            padding: "6px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.3" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.25" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

{/* ─────────────────────────────────────────────────────────────
          PAGE 7: EXACT MATCH TO PDF (45) PAGE 7
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೬: ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ & ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಗೈಡ್
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              ನಿಮ್ಮ ಮೊಬೈಲ್ ಲಾಕ್ ಸ್ಕ್ರೀನ್‌ಗೆ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು
            </div>
          </div>

          {/* Guide Steps */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              📲 ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ೫ ಸರಳ ಹಂತಗಳು:
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#3F2A12" }}>
              1. <strong>ಹಂತ ೧:</strong> ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.<br/>
              2. <strong>ಹಂತ ೨:</strong> 'Download 90-Day Calendar (.ics)' ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.<br/>
              3. <strong>ಹಂತ ೩:</strong> ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ Files / Downloads ಫೋಲ್ಡರ್‌ಗೆ ಹೋಗಿ.<br/>
              4. <strong>ಹಂತ ೪:</strong> .ics ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Google Calendar' ಅಥವಾ 'Apple Calendar' ಆಯ್ಕೆಮಾಡಿ.<br/>
              5. <strong>ಹಂತ ೫:</strong> 'Add All' ಕ್ಲಿಕ್ ಮಾಡಿ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ!
            </div>
          </div>

          {/* QR Code */}
          {qrDataUrl ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src={qrDataUrl} alt="Calendar Sync QR Code" style={{ width: "200px", height: "200px", border: "2px solid #B45309", borderRadius: "10px", margin: "0 auto" }} />
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#B45309", marginTop: "8px" }}>
                ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡಿ
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px", color: "#B45309", fontSize: "13px", fontWeight: 700 }}>
              📲 ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
            </div>
          )}

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೭: ಪೂಜಾ ಮಂದಿರದ ಪ್ರತ್ಯೇಕ ಸ್ತೋತ್ರಗಳು & ದೈನಂದಿನ ಜಪ ಮಂತ್ರಗಳು
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸುವ ಸಿದ್ಧ ಮಂತ್ರಗಳು
            </div>
          </div>

          {/* Content Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "10px", padding: "12px 16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
                🏺 ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಸಿದ್ಧ ಸ್ತೋತ್ರ (Daily Morning Recitation):
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#3F2A12", fontStyle: "italic" }}>
                "ॐ ನಮಃ ಶಿವಾಯ ಶಂಭವೇ ಹರ ಹರ ಮಹಾದೇವಾಯ ನಮಃ ॥<br/>
                ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಳಾಯ ಬುಧಾಯ ಚ ।<br/>
                ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥"
              </div>
            </div>

            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "10px", padding: "12px 16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
                📿 ದೈನಂದಿನ ೧೦೮ ಜಪ ಮಂತ್ರಗಳು (108 Daily Japa Remedies):
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#3F2A12" }}>
                • <strong>ಸೂರ್ಯ ಮಂತ್ರ:</strong> ॐ ಸೂರ್ಯಾಯ ನಮಃ (108 ಬಾರಿ)<br/>
                • <strong>ಚಂದ್ರ ಮಂತ್ರ:</strong> ॐ ಚಂದ್ರಮಸೇ ನಮಃ (108 ಬಾರಿ)<br/>
                • <strong>ಗುರು ಮಂತ್ರ:</strong> ॐ ಗುರವೇ ನಮಃ (108 ಬಾರಿ)<br/>
                • <strong>ಮಹಾಲಕ್ಷ್ಮಿ ಮಂತ್ರ:</strong> ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ಕಮಲಾಲಯೇ ಪ್ರಸೀದ ನಮಃ
              </div>
            </div>
          </div>

          {/* Altar Banner */}
          <div style={{
            marginTop: "auto",
            textAlign: "center",
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#FEF3C7"
          }}>
            ॥ ಈ ಪುಟವನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಿ ಸಕಲ ಮಂಗಳಂ ಪ್ರಾಪ್ತಿ ॥
          </div>
        </div>
      </div>
    </div>
  );
};
