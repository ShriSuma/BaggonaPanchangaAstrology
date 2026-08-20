import React from "react";
import { calculateKundli } from "../../../core/KundliEngine";
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
          PAGE 3: EXACT MATCH TO PDF (45) PAGE 3 (DASHA-BHUKTI CARDS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px" }}>
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
              ಅಧ್ಯಾಯ ೨: ೨೦-ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ನಕ್ಷೆ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಮುಂಬರುವ ೨೦ ವರ್ಷಗಳ ಪ್ರಮುಖ ದಶಾ-ಅಂತರ್ದಶಾ ಅವಧಿಗಳು, ನಿಖರ ದಿನಾಂಕ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು
            </div>
          </div>

          {/* 5 Dasha-Bhukti Cards matching PDF (45) Page 3 Exactly with Centered Dates & Generous Spacing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {/* Card 1: Budha Antardasha (Clean White Card) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "9px 13px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📌 ಗುರು ಮಹಾದಶಾ • ಬುಧ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 700
                }}>✨ ವಿದ್ಯಾ & ಬುದ್ಧಿ ಸಿದ್ಧಿ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginBottom: "7px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                🗓️ ಅವಧಿ: ೨೦೧೫-೦೫-೨೧ ರಿಂದ ೨೦೧೬-೦೯-೧೪ | (ವಯಸ್ಸು: ೨೨ - ೨೩ ವರ್ಷ)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಉನ್ನತ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ, ಹೊಸ ಉದ್ಯೋಗ ಅವಕಾಶಗಳು, ಕಾಂಟ್ರಾಕ್ಟ್‌ಪೂರ್ಣ ಹಾಗೂ ಸಂಸ್ಥೆಯಲ್ಲಿ ಸನ್ಮಾನ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ವ್ಯಾಪಾರದಲ್ಲಿ ಶೇಕಡ ೨೦%+ ಲಾಭ ವೃದ್ಧಿ, ನೂತನ ಹೂಡಿಕೆ ಹಾಗೂ ಶೇರುಗಳಲ್ಲಿ ಧನ ಸಮೃದ್ಧಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಸಂತಾನದ ವಿದ್ಯಾ ಯಶಸ್ಸು, ಬಂಧುಗಳೊಡನೆ ಸೌಹಾರ್ದಯುತ ಭೋಜನ ಹಾಗೂ ಸಂತೋಷ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಾಗೂ ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 2: Ketu Antardasha (Clean White Card) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "9px 13px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📌 ಗುರು ಮಹಾದಶಾ • ಕೇತು ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#5B21B6",
                  background: "#F5F3FF",
                  border: "1px solid #8B5CF6",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 700
                }}>🕉️ ಅಧ್ಯಾತ್ಮ & ಜ್ಞಾನ ತಪಸ್ಸು</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginBottom: "7px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                🗓️ ಅವಧಿ: ೨೦೧೬-೦೯-೧೪ ರಿಂದ ೨೦೧೭-೦೮-೨೪ | (ವಯಸ್ಸು: ೨೩ - ೨೪ ವರ್ಷ)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ನಿಗೂಢ ಸಂಶೋಧನೆ, ತಾಳ್ಮೆಯ ಕರ್ತವ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಕೌಶಲ್ಯ ವೃದ್ಧಿ. ಧಾವಂತದ ನಿರ್ಧಾರ ಬೇಡ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ಮಿತ ವ್ಯಯ, ಧರ್ಮ ಕಾರ್ಯಗಳಿಗೆ ವಿನಿಯೋಗ ಹಾಗೂ ಸ್ಥಿರ ಹೂಡಿಕೆ ಸಂರಕ್ಷಣೆ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಗೋಕರ್ಣ ಮುಂತಾದ ಪವಿತ್ರ ಕ್ಷೇತ್ರ ದರ್ಶನ, ಧ್ಯಾನ ಹಾಗೂ ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶ್ರೀ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಿಸಿ ಹಾಗೂ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಪೂಜೆ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 3: Shukra Antardasha (HIGHLIGHTED WARM GOLDEN CARD) */}
            <div style={{
              background: "#FFFBEB",
              border: "2px solid #F59E0B",
              borderRadius: "8px",
              padding: "9px 13px",
              boxShadow: "0 3px 8px rgba(245, 158, 11, 0.12)"
            }}>
              <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#78350F", marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌟 ಗುರು ಮಹಾದಶಾ • ಶುಕ್ರ ಅಂತರ್ದಶಾ (ರಾಜಯೋಗ ಕಾಲ)</span>
                <span style={{
                  fontSize: "11px",
                  color: "#78350F",
                  background: "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)",
                  border: "1px solid #D97706",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 800
                }}>👑 ಅತ್ಯುನ್ನತ ರಾಜಯೋಗ ಫಲ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginBottom: "7px",
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                padding: "4px 10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                🗓️ ಅವಧಿ: ೨೦೧೭-೦೮-೨೪ ರಿಂದ ೨೦೨೧-೦೪-೨೪ | (ವಯಸ್ಸು: ೨೪ - ೨೮ ವರ್ಷ)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ರಾಜಕೀಯ/ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯುನ್ನತ ನಾಯಕತ್ವ, ಬಡ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಸನ್ಮಾನ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ, ರಾಯಲ್ ವಾಹನ ಖರೀದಿ, ಸ್ವರ್ಣಾಭರಣ ಹಾಗೂ ಭೂ ಲಾಭ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಗೃಹದಲ್ಲಿ ವಿವಾಹ ಮಂಗಲ ಕಾರ್ಯಗಳು, ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಅಖಂಡ ಆನಂದ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ ಹಾಗೂ ತುಪ್ಪದ ದೀಪಾರಾಧನೆ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 4: Surya Antardasha (Clean White Card) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "9px 13px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📌 ಗುರು ಮಹಾದಶಾ • ಸೂರ್ಯ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#047857",
                  background: "#ECFDF5",
                  border: "1px solid #10B981",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 700
                }}>⛳ ಅಧಿಕಾರ & ಸರ್ಕಾರಿ ಜಯ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginBottom: "7px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                🗓️ ಅವಧಿ: ೨೦೨೧-೦೪-೨೪ ರಿಂದ ೨೦೨೨-೦೧-೧೦ | (ವಯಸ್ಸು: ೨೮ - ೨೯ ವರ್ಷ)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಸರ್ಕಾರಿ ಕೃಪೆ, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳ ಸಂಪೂರ್ಣ ಬೆಂಬಲ ಹಾಗೂ ಶತ್ರುಗಳ ಮೇಲೆ ಜಯ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ಪೂರ್ವಾಜಿತ ಆಸ್ತಿಯಿಂದ ಧನ ಹರಿವು ಹಾಗೂ ಸರ್ಕಾರಿ ಬಾಕಿ ವಸೂಲಾತಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಪಿತೃವರ್ಗದ ಆಶೀರ್ವಾದ, ವಂಶದ ಕೀರ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ತೇಜಸ್ಸು.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯಕ್ಕೆ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ತಾಮ್ರ ಪಾತ್ರೆಯಲ್ಲಿ ಅರ್ಘ್ಯ ನೀಡಿ.</div>
              </div>
            </div>

            {/* Card 5: Shani Antardasha (Clean White Card) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "9px 13px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📌 ಶನಿ ಮಹಾದಶಾ • ಶನಿ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 700
                }}>⚖️ ಸ್ಥಿರ ಧರ್ಮ ಕರ್ತವ್ಯ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginBottom: "7px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                🗓️ ಅವಧಿ: ೨೦೩೮-೦೧-೧೫ ರಿಂದ ೨೦೪೧-೦೧-೧೮ | (ವಯಸ್ಸು: ೪೫ - ೪೮ ವರ್ಷ)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಶ್ರಮಜೀವಿಗಳಿಗೆ ಅತ್ಯುನ್ನತ ಫಲ. ಕಠಿಣ ಕರ್ತವ್ಯದಿಂದ ಶಕ್ತಿಯುತ ಹಾಗೂ ಸ್ಥಿರ ವೃತ್ತಿ ಅಡಿಪಾಯ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ ಆಸ್ತಿ ಭದ್ರತೆ, ಕೈಗಾರಿಕಾ ಯಶಸ್ಸು ಹಾಗೂ ಶೇಖರಿತ ನಿಧಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಹಿರಿಯರ ಸೇವೆ, ಶಾಂತಿಯುತ ಗೃಹ ಜೀವನ ಹಾಗೂ ಜವಾಬ್ದಾರಿಯುತ ಕುಟುಂಬ ನಡೆ.</div>
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
          PAGE 5: EXACT MATCH TO PDF (45) PAGE 5
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
              ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು, ದೋಷಗಳು ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ರಾಜಯೋಗಗಳು, ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ ಹಾಗೂ ಗೋಚಾರ ಫಲಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>

          {/* Content Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Card 1 */}
            <div style={{ background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>✨ ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ</span>
                <span style={{ fontSize: "10.5px", color: "#92400E", background: "#FDE68A", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginBottom: "6px" }}>
                {displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಚಂದ್ರರ ಪರಸ್ಪರ ಶುಭ ದೃಷ್ಟಿಯಿಂದ 'ಗಜಕೇಸರಿ ರಾಜಯೋಗ' ಅತ್ಯಂತ ಸಕ್ರಿಯವಾಗಿದೆ. ಈ ದಿವ್ಯ ಯೋಗದ ಶುಭ ಪ್ರಭಾವದಿಂದ ಸಮಾಜದಲ್ಲಿ ಅಚಲ ಕೀರ್ತಿ, ಕಷ್ಟಗಳನ್ನು ಜಯಿಸುವ ಆಂತರಿಕ ಧೈರ್ಯ ಹಾಗೂ ಸ್ಥಿರ ಧನ ಸಂಪತ್ತು ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಎಂತಹ ಕಠಿಣ ಸವಾಲುಗಳು ಎದುರಾದರೂ ನಿಮ್ಮ ಬೌದ್ಧಿಕ ದಕ್ಷತೆಯಿಂದ ಉನ್ನತ ಸ್ಥಾನ ಗಳಿಸುವಿರಿ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", borderTop: "1px solid #FDE68A", paddingTop: "4px" }}>
                ಸೂರ್ಯ ಹಾಗೂ ಬುಧರ ಸಂಯೋಜನೆಯಿಂದ 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ಸಿದ್ಧಿಸಿದ್ದು, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಕೌಶಲ್ಯ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಯಶಸ್ಸನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ. ಧನ ಹಾಗೂ ಲಾಭ ಭಾವಗಳ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಭೂಮಿ ಹೂಡಿಕೆ ಹಾಗೂ ಉದ್ಯೋಗ ಬಡ್ತಿಯಲ್ಲಿ ನಿರಂತರ ಧನ ಹರಿವು ಉಂಟಾಗಲಿದೆ. ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಭಾವಗಳ ಬಲದಿಂದ ದೈವಿಕ ಕೃಪೆ ಸದಾ ನಿಮ್ಮ ಜೊತೆಗಿರುತ್ತದೆ.
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>⚠️ ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ</span>
                <span style={{ fontSize: "10.5px", color: "#9F1239", background: "#FFE4E6", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ಶಾಂತಿ & ಪೂಜಾ ವಿಧಿ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#881337", textAlign: "justify", marginBottom: "6px" }}>
                ಕುಂಡಲಿಯಲ್ಲಿ ಶನಿ ಗ್ರಹ ಅಥವಾ ಮಾಂದಿಯ ಮಂದ ದೃಷ್ಟಿಯಿಂದ ಕೆಲಸ ಕಾರ್ಯಗಳಲ್ಲಿ ಮಧ್ಯಂತರ ವಿಳಂಬ, ಅನಗತ್ಯ ಮನೋವ್ಯಥೆ ಅಥವಾ ನಿದ್ರಾಹೀನತೆ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ. ಪರಿಹಾರಕ್ಕಾಗಿ ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದರ್ಶನ ಪಡೆದು, ಎಳ್ಳಿನ ಎಣ್ಣೆಯ ದೀಪಾರಾಧನೆ ಮಾಡುವುದು ಹಾಗೂ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸುವುದು ಅತ್ಯಂತ ಫಲಪ್ರದವಾಗಿದೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#881337", textAlign: "justify", borderTop: "1px solid #FECDD3", paddingTop: "4px" }}>
                ರಾಹು-ಕೇತು ಗ್ರಹಗಳ ಅಕ್ಷೀಯ ಸ್ಥಿತಿಯಿಂದ ಧನ ವ್ಯಯ ಅಥವಾ ಆಪ್ತರೊಂದಿಗೆ ಅನಗತ್ಯ ತಪ್ಪು ತಿಳುವಳಿಕೆ ಉಂಟಾಗದಂತೆ ಎಚ್ಚರ ಅಗತ್ಯ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಪೂಜೆ ಹಾಗೂ ನಾಗಬಲಿ ಸಂಕಲ್ಪ ಸೇವೆಯನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಸಕಲ ಗ್ರಹ ದೋಷಗಳು ಸಂಪೂರ್ಣ ಶಮನಗೊಂಡು ಕುಟುಂಬಕ್ಕೆ ಅಭಯ ರಕ್ಷೆ ಲಭಿಸಲಿದೆ.
              </div>
            </div>

            {/* Card 3 */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>🍃 ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ</span>
                <span style={{ fontSize: "10.5px", color: "#92400E", background: "#FEF3C7", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ಗೋಚಾರ ಫಲ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginBottom: "6px" }}>
                ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ ಶನಿ ಗ್ರಹದ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಸಂಚಾರವು ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯಂತ ಶಿಸ್ತು, ತಾಳ್ಮೆ ಹಾಗೂ ನಿರಂತರ ನಿಷ್ಠೆಯನ್ನು ಬಯಸುತ್ತದೆ. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಹೆಜ್ಜೆ ಇಡುವುದರಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ಹಾಗೂ ನೂತನ ಅಧಿಕಾರ ಯೋಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", borderTop: "1px solid #FDE68A", paddingTop: "4px" }}>
                ಬೃಹಸ್ಪತಿ ಗ್ರಹದ ಅನುಕೂಲಕರ ಸಪ್ತಮ/ನವಮ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಅಪಾರ ಧನ ಲಾಭ, ಸಂತಾನ ಶ್ರೇಯಸ್ಸು ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಶುಭ ಮಂಗಳ ಕಾರ್ಯಗಳನ್ನು ತರಲಿದೆ. ಪ್ರಸ್ತುತ ಸಮಯವು ಪವಿತ್ರ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ ಹಾಗೂ ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಶುಭ ದಿನಗಳಲ್ಲಿ ಪೂಜೆ ನೆರವೇರಿಸುವುದರಿಂದ ಅಖಂಡ ಧರ್ಮ ಸಿದ್ಧಿಯಾಗಲಿದೆ.
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
          PAGE 6: EXACT MATCH TO PDF (45) PAGE 6
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
              ಅಧ್ಯಾಯ ೫: ದಾಂಪತ್ಯ, ಸಂತಾನ, ಧನ ಯೋಗ ಹಾಗೂ ಮುಂಬರುವ ೩ ತಿಂಗಳ ರೋಡ್‌ಮ್ಯಾಪ್
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಕುಟುಂಬ ವೃದ್ಧಿ, ಐಶ್ವರ್ಯ ಯೋಗ ಹಾಗೂ ಮುಂಬರುವ ೯೦ ದಿನಗಳ ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಪಷ್ಟ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ
            </div>
          </div>

          {/* Content Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ background: "#F5F3FF", border: "1.5px solid #8B5CF6", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#5B21B6", marginBottom: "4px" }}>
                💒 ವಿವಾಹ & ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ (Marriage & Domestic Harmony):
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#4C1D95", textAlign: "justify" }}>
                ಸಪ್ತಮ ಭಾವೇಶ ಹಾಗೂ ಶುಕ್ರನ ಶುಭ ಯೋಗದಿಂದ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ, ಆತ್ಮೀಕ ಹೊಂದಾಣಿಕೆ ಹಾಗೂ ಗೃಹ ಸೌಹಾರ್ದತೆ ನೆಲೆಸಲಿದೆ. ಜೀವನ ಸಂಗತಿಯಿಂದ ಅಚಾನಕ್ ಸಹಕಾರ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸದಾ ಶಾಂತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.
              </div>
            </div>

            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#065F46", marginBottom: "4px" }}>
                👶 ಸಂತಾನ ಭಾಗ್ಯ & ವಿದ್ಯಾ ಯಶಸ್ಸು (Progeny Potential & Education):
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#064E3B", textAlign: "justify" }}>
                ಪಂಚಮ ಭಾವೇಶ ಹಾಗೂ ಗುರು ಬೃಹಸ್ಪತಿಯ ಉಚ್ಚ ಅನುಗ್ರಹದಿಂದ ತೇಜಸ್ವಿ ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ಸಂತಾನದ ಬೆಳವಣಿಗೆಯಿಂದ ಕುಟುಂಬಕ್ಕೆ ಕೀರ್ತಿ ಹಾಗೂ ಸಂತೋಷ ಹೆಚ್ಚಾಗಲಿದೆ.
              </div>
            </div>

            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#047857", marginBottom: "4px" }}>
                💰 ಧನ & ಸ್ಥಿರಾಸ್ತಿ ಸೌಭಾಗ್ಯ (Wealth, Real Estate & Assets):
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#064E3B", textAlign: "justify" }}>
                ದ್ವಿತೀಯ ಹಾಗೂ ಏಕಾದಶ ಭಾವೇಶರ ಬಲದಿಂದ ಗೃಹ ನಿರ್ಮಾಣ, ನೂತನ ವಾಹನ ಖರೀದಿ ಹಾಗೂ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಅಪಾರ ಧನ ಲಾಭ ಎದುರಾಗಲಿದೆ. ಕುಟುಂಬದ ಆರ್ಥಿಕ ಸ್ಥಿತಿ ಅತ್ಯಂತ ಭದ್ರವಾಗಲಿದೆ.
              </div>
            </div>

            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
                🗓️ ಮುಂಬರುವ ೩ ತಿಂಗಳ ಸ್ಪಷ್ಟ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್ (Next 90 Days Roadmap):
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div style={{ background: "#FEF3C7", padding: "6px 8px", borderRadius: "6px" }}>
                  <strong style={{ color: "#78350F" }}>🚩 ೧ ನೇ ತಿಂಗಳು:</strong><br/>ನೂತನ ಯೋಜನೆಗಳಿಗೆ ಚಾಲನೆ, ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಹಾಗೂ ಧನ ಹರಿವಿನಲ್ಲಿ ಹೆಚ್ಚಿನ ವೃದ್ಧಿ.
                </div>
                <div style={{ background: "#FEF3C7", padding: "6px 8px", borderRadius: "6px" }}>
                  <strong style={{ color: "#78350F" }}>🚀 ೨ ನೇ ತಿಂಗಳು:</strong><br/>ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಯಶಸ್ವಿ ನಿರ್ಧಾರ, ಪ್ರಯಾಣ ಹಾಗೂ ಕುಟುಂಬ ಸೌಹಾರ್ದತೆ.
                </div>
                <div style={{ background: "#FEF3C7", padding: "6px 8px", borderRadius: "6px" }}>
                  <strong style={{ color: "#78350F" }}>🕉️ ೩ ನೇ ತಿಂಗಳು:</strong><br/>ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ದರ್ಶನ, ಧಾರ್ಮಿಕ ಪೂಜೆ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಅಪಾರ ಸೌಭಾಗ್ಯ.
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
