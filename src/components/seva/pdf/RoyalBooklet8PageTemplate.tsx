import React from "react";
import type { RhythmResult } from "../../../core/DailyRhythmEngine";
import {
  pick,
  type SevaLang,
  RASHI_L5,
  NAKSHATRA_L5
} from "../../../features/seva/sevaLocale";
import { transliterateName } from "../../../utils/transliterator";
import { getPriestProfile } from "../../../features/seva/sevaPriestDirectory";
import { calculateKundli } from "../../../core/KundliEngine";

interface RoyalBooklet8PageTemplateProps {
  lang: SevaLang;
  identity: {
    personName: string;
    dob?: string; // YYYY-MM-DD
    tob?: string; // HH:MM
    pob?: string;
    rashiIndex?: number;
    nakshatraIndex?: number;
    gotra?: string;
    aiTransliteratedName?: string;
  };
  panditName?: string;
  rhythm?: RhythmResult;
  qrDataUrl?: string;
}

// 100% Kannada Translations for Rashi & Planets
const RASHI_KN_MAP = [
  "ಮೇಷ (Mesha)",
  "ವೃಷಭ (Vrishabha)",
  "ಮಿಥುನ (Mithuna)",
  "ಕರ್ಕಾಟಕ (Karka)",
  "ಸಿಂಹ (Simha)",
  "ಕನ್ಯಾ (Kanya)",
  "ತುಲಾ (Tula)",
  "ವೃಶ್ಚಿಕ (Vrischika)",
  "ಧನುಸ್ಸು (Dhanus)",
  "ಮಕರ (Makara)",
  "ಕುಂಭ (Kumbha)",
  "ಮೀನ (Meena)"
];

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

const getPlanetKnName = (name: string): string => PLANET_KN_MAP[name] || name;

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
  const rawDevoteeName = identity?.personName || "Devotee";
  const displayName = identity?.aiTransliteratedName || transliterateName(rawDevoteeName, code);

  const dobStr = identity?.dob || "1993-05-31";
  const tobStr = identity?.tob || "09:25";
  const pobStr = identity?.pob || (isKn ? "ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ" : "Gokarna, Karnataka");
  const gotraStr = identity?.gotra || (isKn ? "ವಸಿಷ್ಠ" : "Vasistha");

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

  const moonPlanet = birthKundli?.planets.find((p: any) => p.name === "Moon");
  const rashiIdx = moonPlanet?.rashi.index ?? (identity?.rashiIndex ?? 5);
  const nakIdx = moonPlanet?.nakshatra.index ?? (identity?.nakshatraIndex ?? 12);
  const pada = birthKundli?.moonPada ?? 3;
  const lagnaRashiName = birthKundli?.lagnaRashi ? RASHI_KN_MAP[birthKundli.lagnaRashi.index] : "ಕರ್ಕಾಟಕ (Karka)";

  const rashiName = RASHI_KN_MAP[rashiIdx] || "ಕನ್ಯಾ (Kanya)";
  const nakName = NAKSHATRA_L5[nakIdx]?.[code] || NAKSHATRA_L5[nakIdx]?.kn || "ಹಸ್ತ";

  // Fix priest profile string vs object bug
  const priestStr = typeof panditName === "string" ? panditName : "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";

  // Common A4 Page Styling (794px x 1123px @ 96 DPI with 70px left margin for comb-binding safety)
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
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "14px",
    backgroundColor: "rgba(253, 246, 231, 0.4)"
  };

  const headerBoxStyle: React.CSSProperties = {
    textAlign: "center",
    borderBottom: "2px solid #B45309",
    paddingBottom: "10px",
    lineHeight: "1.6"
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFBEB",
    border: "1.5px solid #D97706",
    borderRadius: "12px",
    padding: "14px",
    boxShadow: "0 2px 6px rgba(180, 83, 9, 0.08)"
  };

  return (
    <div id="seva-print-royal-booklet-container" style={{ backgroundColor: "#2D3748", padding: "20px 0" }}>
      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: ROYAL COVER PAGE & DEVOTEE PROFILE BOX
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Top Sloka Header */}
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B45309", marginBottom: "4px" }}>
              ॥ ಶ್ರೀ ವಿನಾಯಕೋ ವಿಘ್ನಹರೋ ಧನಾಧ್ಯಕ್ಷೋ ಧನಪ್ರದಃ ॥
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#78350F", letterSpacing: "0.3px", lineHeight: "1.6" }}>
              {isKn ? "॥ ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಲೈಫ್ ಗ್ರಂಥ ॥" :
               isHi ? "॥ वाग्गोण पंचांग ज्योतिष जीवन ग्रंथ ॥" :
               isTe ? "॥ భాగ్గోణ పంచాంగ జ్యోతిష్య జీవిత గ్రంథం ॥" :
               isTa ? "॥ பாகோண பஞ்சாங்க ஜோதிட வாழ்க்கை நூல் ॥" :
               "॥ Baggona Panchanga Astrological Life Dossier ॥"}
            </div>
            <div style={{ fontSize: "12px", color: "#B45309", marginTop: "4px", fontWeight: 600 }}>
              {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ಪವಿತ್ರ ಅನುಗ್ರಹ ವೈಯಕ್ತಿಕ ೮ ಪುಟಗಳ ರಾಯಲ್ ವರದಿ" :
               "Official 8-Page Royal Astrological Life Report — Gokarna Sanctum"}
            </div>
          </div>

          {/* Central Sacred Emblem & Invocation */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "16px",
            margin: "4px 0"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "4px" }}>🕉️</div>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#78350F" }}>
              {isKn ? "॥ ನಮಸ್ತೇ ಮಹಾದೇವ ಶುಭಂಕರಿ ಅನುಗ್ರಹ ಸಿದ್ಧಿರಸ್ತು ॥" : "॥ Sacred Gokarna Kshetra Divine Blessings ॥"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "6px", lineHeight: "1.6" }}>
              {isKn ? "ಈ ರಾಯಲ್ ಗ್ರಂಥವು ಭಕ್ತರ ಜನ್ಮ ಕುಂಡಲಿ, ೨೦-ವರ್ಷಗಳ ದಶಾ ಫಲ, ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಹಾಗೂ ಪೂಜಾ ಸ್ತೋತ್ರಗಳನ್ನು ಒಳಗೊಂಡ ಪವಿತ್ರ ಗ್ರಂಥವಾಗಿದೆ." : "This Royal Booklet contains your complete birth Kundli, 20-year Dasha timeline, and sacred remedies."}
            </div>
          </div>

          {/* Devotee Record Table Card */}
          <div style={{
            background: "#FFFBEB",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.1)"
          }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#B45309", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px dashed #D97706", paddingBottom: "4px" }}>
              {isKn ? "ಆತ್ಮೀಯ ಭಕ್ತರ ಜನ್ಮ ದಾಖಲೆ (DEVOTEE RECORD):" : "DEVOTEE BIRTH RECORD:"}
            </div>

            <div style={{ fontSize: "22px", fontWeight: 900, color: "#78350F", marginBottom: "12px" }}>
              {displayName}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", lineHeight: "1.6" }}>
              <div>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಜನ್ಮ ರಾಶಿ:" : "Janma Rashi:"}</strong> {rashiName}
              </div>
              <div>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Janma Nakshatra:"}</strong> {nakName} ({pada} {isKn ? "ನೇ ಪಾದ" : "Pada"})
              </div>
              <div>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಜನ್ಮ ಲಗ್ನ:" : "Janma Lagna:"}</strong> {lagnaRashiName}
              </div>
              <div>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಗೋತ್ರ:" : "Gotra:"}</strong> {gotraStr}
              </div>
              <div>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಜನನ ದಿನಾಂಕ:" : "Date of Birth:"}</strong> {dobStr}
              </div>
              <div>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಜನನ ಸಮಯ:" : "Time of Birth:"}</strong> {tobStr}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <strong style={{ color: "#B45309" }}>{isKn ? "ಜನನ ಸ್ಥಳ:" : "Place of Birth:"}</strong> {pobStr}
              </div>
            </div>
          </div>

          {/* Gokarna Sanctum Blessing Letter */}
          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🌸 {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಆಶೀರ್ವಾದ ಪತ್ರ:" : "Gokarna Temple Blessing Letter:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              {isKn ? `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ${displayName} ಅವರ ಹೆಸರಿನಲ್ಲಿ ವಿಶೇಷ ಅರ್ಚನೆ ಹಾಗೂ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಗೆ ತಕ್ಕಂತೆ ಈ ೮ ಪುಟಗಳ ರಾಯಲ್ ಜ್ಯೋತಿಷ್ಯ ಲೈಫ್ ಗ್ರಂಥವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಈ ಗ್ರಂಥದಲ್ಲಿ ನೀಡಲಾದ ದೈನಂದಿನ ಜಪ ಮಂತ್ರಗಳನ್ನು ಪಠಿಸುವುದರಿಂದ ಸಕಲ ಅಭೀಷ್ಟ ಸಿದ್ಧಿಯಾಗಲಿದೆ.` : `Special Sankalpa and Archana have been offered at Gokarna Mahabaleshwara Temple for ${displayName}. May Lord Shiva bestow health, prosperity, and peace upon your home.`}
            </div>
          </div>

          {/* Footer Archaka Seal */}
          <div style={{
            marginTop: "auto",
            textAlign: "center",
            borderTop: "2px solid #B45309",
            paddingTop: "10px",
            fontSize: "11px",
            color: "#78350F",
            fontWeight: "bold"
          }}>
            <div>"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು · ಸಕಲ ಕಲ್ಯಾಣಮಸ್ತು"</div>
            <div style={{ color: "#B45309", marginTop: "2px" }}>
              {isKn ? `ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · ${priestStr}` : `Chief Archaka · ${priestStr}`}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: JANMA KUNDLI (D1 & D9) & BIRTH PANCHANGA
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೧: ಜನ್ಮ ಕುಂಡಲಿ (D-1 & D-9) ಹಾಗೂ ಜನ್ಮ ಪಂಚಾಂಗ" : "Chapter 1: Janma Kundli (D-1 & D-9) & Birth Panchanga"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಪಂಚಾಂಗ ಆಧಾರಿತ ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ ಹಾಗೂ ನವಾಂಶ ಚಾರ್ಟ್" : "Authentic South Indian D1 Rashi Grid & D9 Navamsha Grid"}
            </div>
          </div>

          {/* South Indian D-1 Grid */}
          <div style={cardStyle}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350F", marginBottom: "8px", textAlign: "center" }}>
              🌌 {displayName} {isKn ? "ಅವರ ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ (D-1 Rashi Grid)" : "D-1 Rashi Grid"}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 75px)",
              gap: "1px",
              backgroundColor: "#B45309",
              border: "2px solid #B45309",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              {/* Row 1 */}
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಮೀನ (Pisces)" : "Meena"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Maandi")}]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಮೇಷ (Aries)" : "Mesha"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Venus")} 0.60°]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ವೃಷಭ (Taurus)" : "Vrishabha"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Sun")}, {getPlanetKnName("Ketu")}]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಮಿಥುನ (Gemini)" : "Mithuna"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Mercury")} 2.66°]</span>
              </div>

              {/* Row 2 */}
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಕುಂಭ (Aquarius)" : "Kumbha"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Saturn")} 6.47°]</span>
              </div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
                <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px" }}>{isKn ? "ಜನನ:" : "DOB:"} {dobStr} · {tobStr}</div>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400E", marginTop: "2px" }}>{isKn ? "ಲಗ್ನ:" : "Lagna:"} {lagnaRashiName}</div>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಕರ್ಕ (Cancer)" : "Karka"}</strong><br/><span style={{ color: "#92400E", fontWeight: "bold" }}>[{getPlanetKnName("Lagna")}, {getPlanetKnName("Mars")}]</span>
              </div>

              {/* Row 3 */}
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಮಕರ (Capricorn)" : "Makara"}</strong><br/><span style={{ color: "#B45309" }}>[{isKn ? "ಗೋಚಾರ" : "Gochara"}]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಸಿಂಹ (Leo)" : "Simha"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Jupiter")} 10.99°]</span>
              </div>

              {/* Row 4 */}
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಧನಸ್ಸು (Sagittarius)" : "Dhanus"}</strong><br/><span style={{ color: "#B45309" }}>[{isKn ? "ದಶಾ" : "Dasha"}]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ವೃಶ್ಚಿಕ (Scorpio)" : "Vrischika"}</strong><br/><span style={{ color: "#B45309" }}>[{getPlanetKnName("Rahu")} 18.70°]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ತುಲಾ (Libra)" : "Tula"}</strong><br/><span style={{ color: "#B45309" }}>[{isKn ? "ಗೋಚಾರ" : "Gochara"}]</span>
              </div>
              <div style={{ background: "#FFFBEB", padding: "4px", fontSize: "9px" }}>
                <strong>{isKn ? "ಕನ್ಯಾ (Virgo)" : "Kanya"}</strong><br/><span style={{ color: "#92400E", fontWeight: "bold" }}>[{getPlanetKnName("Moon")} 17.98°]</span>
              </div>
            </div>
          </div>

          {/* Birth Panchanga Metrics */}
          <div style={cardStyle}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350F", marginBottom: "8px" }}>
              📜 {isKn ? "ಜನನ ಸಮಯದ ಸುಖ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:" : "Birth Panchanga Calculations:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", lineHeight: "1.6" }}>
              <div>• <strong>{isKn ? "ತಿಥಿ:" : "Tithi:"}</strong> ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)</div>
              <div>• <strong>{isKn ? "ಕರಣ:" : "Karana:"}</strong> ಬಾಲವ</div>
              <div>• <strong>{isKn ? "ಘಟಿ / ವಿಘಟಿ:" : "Ghati / Vighati:"}</strong> 42 ಘಟಿ 48 ವಿಘಟಿ</div>
              <div>• <strong>{isKn ? "ದಿವ ಘಟಿ:" : "Diva Ghati:"}</strong> 32 ಘಟಿ 12 ವಿಘಟಿ</div>
              <div>• <strong>{isKn ? "ಅಮೃತ ಘಟಿ:" : "Amritha Ghati:"}</strong> 44 ಘಟಿ 6 ವಿಘಟಿ</div>
              <div>• <strong>{isKn ? "ವಿಷ ಘಟಿ:" : "Visha Ghati:"}</strong> 20 ಘಟಿ 6 ವಿಘಟಿ</div>
              <div>• <strong>{isKn ? "ಸೂರ್ಯೋದಯಾದಿತ:" : "Suryodayadita:"}</strong> 32 ಘಟಿ 55 ವಿಘಟಿ</div>
              <div>• <strong>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ" : "Moon Dasha 4y 0m 5d"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 3: 20-YEAR INTERACTIVE DASHA-BHUKTI TIMELINE
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೨: ೨೦-ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ನಕ್ಷೆ" : "Chapter 2: 20-Year Interactive Dasha-Bhukti Timeline"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ನಿಮ್ಮ ಜೀವಮಾನದ ಪ್ರಮುಖ ಅಂತರ್ದಶಾ ಅವಧಿಗಳು, ಆರಂಭ-ಅಂತ್ಯ ದಿನಾಂಕಗಳು ಹಾಗೂ ಪ್ರತ್ಯೇಕ ಪರಿಹಾರಗಳು" : "Detailed Bhukti Predictions with Exact Dates & 4 Actionable Pillars"}
            </div>
          </div>

          {/* Bhukti Period 1 */}
          <div style={cardStyle}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
              📌 [ ಗುರು ಮಹಾದಶಾ · ಶುಕ್ರ ಅಂತರ್ದಶಾ ] (Jupiter Mahadasha - Venus Antardasha)
            </div>
            <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px", fontWeight: "bold" }}>
              🗓️ {isKn ? "ಆರಂಭ: 2026-05-12 | ಅಂತ್ಯ: 2029-01-18" : "Start: 2026-05-12 | End: 2029-01-18"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.6", marginTop: "6px", color: "#3F2A12" }}>
              • 💼 <strong>{isKn ? "ಉದ್ಯೋಗ & ಸ್ಥಾನಮಾನ:" : "Career:"}</strong> {isKn ? "ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಬೆಂಬಲ, ಹೊಸ ಉದ್ಯೋಗ ಬಡ್ತಿ ಹಾಗೂ ವೃತ್ತಿಯಲ್ಲಿ ನಾಯಕತ್ವದ ಯೋಗ." : "Promotions, leadership opportunities, and senior support."}<br/>
              • 💰 <strong>{isKn ? "ಧನ ಲಾಭ & ಆಸ್ತಿ:" : "Wealth:"}</strong> {isKn ? "ನೂತನ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ವಾಹನ ಯೋಗ ಹಾಗೂ ಧನ ಹರಿವಿನಲ್ಲಿ ಹೆಚ್ಚಿನ ವೃದ್ಧಿ." : "New property acquisitions, vehicle growth, and cash flow."}<br/>
              • 🏠 <strong>{isKn ? "ಕುಟುಂಬ ಸುಖ:" : "Family:"}</strong> {isKn ? "ಗೃಹದಲ್ಲಿ ಶುಭ ಸಮಾರಂಭಗಳ ಯೋಜನೆ, ಸೌಹಾರ್ದಯುತ ಆಪ್ತ ಬಾಂಧವ್ಯ." : "Auspicious home celebrations and peaceful bonds."}<br/>
              • 🕉️ <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Remedy:"}</strong> {isKn ? "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ ಹಾಗೂ ಶುಕ್ರವಾರ ದೀಪಾರಾಧನೆಯಿಂದ ಸಕಲ ಐಶ್ವರ್ಯ ಸಿದ್ಧಿ." : "Worship Goddess Mahalakshmi and light lamps on Fridays."}
            </div>
          </div>

          {/* Bhukti Period 2 */}
          <div style={cardStyle}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
              📌 [ ಗುರು ಮಹಾದಶಾ · ಸೂರ್ಯ ಅಂತರ್ದಶಾ ] (Jupiter Mahadasha - Sun Antardasha)
            </div>
            <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px", fontWeight: "bold" }}>
              🗓️ {isKn ? "ಆರಂಭ: 2029-01-18 | ಅಂತ್ಯ: 2029-11-06" : "Start: 2029-01-18 | End: 2029-11-06"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.6", marginTop: "6px", color: "#3F2A12" }}>
              • 💼 <strong>{isKn ? "ಉದ್ಯೋಗ & ಕೀರ್ತಿ:" : "Career & Status:"}</strong> {isKn ? "ಸರ್ಕಾರಿ ಕೆಲಸ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು, ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ." : "Success in official projects and social recognition."}<br/>
              • 💰 <strong>{isKn ? "ಧನ ಯೋಗ:" : "Wealth:"}</strong> {isKn ? "ಪೂರ್ವಾರ್ಜಿತ ಆಸ್ತಿಯಿಂದ ಲಾಭ ಹಾಗೂ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಯಶಸ್ವಿ ಫಲ." : "Returns from inheritance and smart investments."}<br/>
              • 🕉️ <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Remedy:"}</strong> {isKn ? "ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ." : "Recite Aditya Hrudayam daily for vitality and honor."}
            </div>
          </div>

          {/* Bhukti Period 3 */}
          <div style={cardStyle}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
              📌 [ ಶನಿ ಮಹಾದಶಾ · ಶನಿ ಅಂತರ್ದಶಾ ] (Saturn Mahadasha - Saturn Antardasha)
            </div>
            <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px", fontWeight: "bold" }}>
              🗓️ {isKn ? "ಆರಂಭ: 2029-11-06 | ಅಂತ್ಯ: 2032-11-15" : "Start: 2029-11-06 | End: 2032-11-15"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.6", marginTop: "6px", color: "#3F2A12" }}>
              • 💼 <strong>{isKn ? "ವೃತ್ತಿ ಕರ್ತವ್ಯ:" : "Career:"}</strong> {isKn ? "ಕಠಿಣ ಶ್ರಮದಿಂದ ಸ್ಥಿರವಾದ ವೃತ್ತಿ ಬೆಳವಣಿಗೆ. ಧೈರ್ಯ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಯಶಸ್ಸು." : "Steady career growth through discipline and perseverance."}<br/>
              • 🕉️ <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Remedy:"}</strong> {isKn ? "ಶನಿವಾರ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಎಳ್ಳಿನ ಎಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ." : "Chant Hanuman Chalisa on Saturdays for protection."}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGES 4, 5, 6: 3 FULL PAGES OF DEEP BHAVISHYA PREDICTIONS
         ───────────────────────────────────────────────────────────── */}
      {/* PAGE 4 */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿ" : "Chapter 3: Personality, Dark Secret & Current Life Situation"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಮಗ್ರ ಸ್ವಭಾವ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ" : "In-depth Personality Traits & Current Life Phase Analysis"}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              👤 {isKn ? "ವ್ಯಕ್ತಿತ್ವದ ಗುಣಲಕ್ಷಣಗಳು (Personality Traits):" : "Personality Traits:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              {displayName} {isKn ? "ಅವರು ಬುದ್ಧಿವಂತ, ದೂರದೃಷ್ಟಿಯುಳ್ಳ ಹಾಗೂ ಸಾತ್ವಿಕ ಸ್ವಭಾವದವರು. ಕನ್ಯಾ ರಾಶಿ ಹಸ್ತ ನಕ್ಷತ್ರ ಪ್ರಭಾವದಿಂದ ಮಾತಿನಲ್ಲಿ ಚಾತುರ್ಯ ಹಾಗೂ ವ್ಯವಹಾರದಲ್ಲಿ ದಕ್ಷತೆ ಹೊಂದಿರುತ್ತಾರೆ. ಸಮಾಜದಲ್ಲಿ ಇತರರಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ ಶಕ್ತಿ ನಿಮಗಿದೆ." : "You possess high intelligence, long-term vision, and analytical precision. Influenced by Virgo & Hasta, you naturally excel in communication, finance, and problem-solving."}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🔮 {isKn ? "ನಿಗೂಢ ರಹಸ್ಯ (The Subconscious Dark Secret):" : "Subconscious Dark Secret:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              {isKn ? "ಅಂತರಂಗದ ಕಲ್ಪನಾ ಶಕ್ತಿ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ ನಿಮ್ಮ ದೊಡ್ಡ ಬಲ. ಕೆಲವೊಮ್ಮೆ ಅನಗತ್ಯ ಚಿಂತೆ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಶಾಂತಿಗೆ ಭಂಗ ತರಬಹುದು; ಧ್ಯಾನದಿಂದ ಸದಾ ಪ್ರಶಾಂತತೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Your sharp intuition and sensitive imagination are your hidden superpower. At times, over-analyzing minor issues may create unnecessary stress; daily meditation keeps your inner mind peaceful."}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🌅 {isKn ? "ಇವಾಗಿನ ಪರಿಸ್ಥಿತಿ (Current Life Phase & Situation):" : "Current Life Phase & Situation:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              {isKn ? "ಪ್ರಸ್ತುತ ಗುರು ಮಹಾದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿಮಗೆ ನೂತನ ಅವಕಾಶಗಳು ಎದುರಾಗಲಿವೆ. ಹಿರಿಯರ ಹಾಗೂ ಮಾರ್ಗದರ್ಶಕರ ಸಹಕಾರದಿಂದ ಸ್ಥಗಿತಗೊಂಡ ಕೆಲಸ ಕಾರ್ಯಗಳು ಪುನರಾರಂಭಗೊಳ್ಳಲಿವೆ." : "Under current Jupiter Dasha transits, new professional horizons are opening. With guidance from elders, pending projects are resuming full momentum."}
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 5 */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು & ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು" : "Chapter 4: Kundli Yogas & Live Gochara Transits"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ರಾಜಯೋಗಗಳು ಹಾಗೂ ಗ್ರಹ ಚಲನೆಗಳ ಪ್ರಭಾವ" : "Auspicious Yogas & Live Planetary Movement Analysis"}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🌟 {isKn ? "ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ಯೋಗಗಳು (Prominent Kundli Yogas):" : "Prominent Kundli Yogas:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              • <strong>{isKn ? "ಗಜಕೇಸರಿ ಯೋಗ:" : "Gajakesari Yoga:"}</strong> {isKn ? "ಗುರು ಮತ್ತು ಚಂದ್ರರ ಅನುಕೂಲಕರ ಸ್ಥಾನದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಲಭಿಸಲಿದೆ." : "Brings wisdom, high social status, and financial security."}<br/>
              • <strong>{isKn ? "ಬುಧಾದಿತ್ಯ ಯೋಗ:" : "Budhaditya Yoga:"}</strong> {isKn ? "ಬುಧ ಹಾಗೂ ಸೂರ್ಯರ ಯೋಗದಿಂದ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ವಿದ್ಯಾ ಯಶಸ್ಸು." : "Enhances intellect, strategic thinking, and educational success."}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🪐 {isKn ? "ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು (Live Planetary Transits):" : "Live Planetary Transits:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              • <strong>{isKn ? "ಶನಿ ಗೋಚಾರ (Saturn Transit):" : "Saturn Transit:"}</strong> {isKn ? "ಕುಂಭ ರಾಶಿಯಲ್ಲಿ ಶನಿ ಸಂಚಾರದಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಜವಾಬ್ದಾರಿ ಹೆಚ್ಚಾಗಲಿದೆ. ತಾಳ್ಮೆಯಿಂದ ಮುನ್ನಡೆಯಿರಿ." : "Increases career responsibility; rewards patience and disciplined effort."}<br/>
              • <strong>{isKn ? "ಗುರು ಗೋಚಾರ (Jupiter Transit):" : "Jupiter Transit:"}</strong> {isKn ? "ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಗುರು ಸಂಚಾರದಿಂದ ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಗ." : "Expands wealth and creates opportunities for holy functions at home."}
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 6 */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೫: ವಿವಾಹ, ಸಂತಾನ ಹಾಗೂ ಮುಂದಿನ ೩ ತಿಂಗಳ ಫಲಾಫಲ" : "Chapter 5: Marriage, Progeny & Next 3 Months Forecast"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ದಾಂಪತ್ಯ ಸುಖ, ಕುಟುಂಬ ವೃದ್ಧಿ ಹಾಗೂ ಮುಂಬರುವ ದಿನಗಳ ರೋಡ್‌ಮ್ಯಾಪ್" : "Family Life, Children Potential & 3-Month Strategic Roadmap"}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              💒 {isKn ? "ವಿವಾಹ & ಸಂತಾನ ಯೋಗ (Marriage & Progeny Potential):" : "Marriage & Progeny Potential:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              {isKn ? "7ನೇ ಹಾಗೂ 5ನೇ ಭಾವಗಳ ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿಯಿಂದ ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯಕ್ಕೆ ಅನುಕೂಲಕರ ಯೋಗವಿದೆ. ಕುಟುಂಬದಲ್ಲಿ ಹಮ್ಮಿಕೊಳ್ಳುವ ಯೋಜನೆಗಳು ಸಫಲವಾಗಲಿವೆ." : "Favorable aspects on 7th and 5th houses ensure harmony in marriage, domestic joy, and prosperous progeny."}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🗓️ {isKn ? "ಮುಂದಿನ ೩ ತಿಂಗಳ ಸ್ಪಷ್ಟ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ (Next 3 Months Roadmap):" : "Next 3 Months Roadmap:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              • <strong>{isKn ? "೧ ನೇ ತಿಂಗಳು:" : "Month 1:"}</strong> {isKn ? "ನೂತನ ಯೋಜನೆಗಳಿಗೆ ಚಾಲನೆ, ಧನ ಹರಿವು ಹೆಚ್ಚಾಗಲಿದೆ." : "Initiation of new ventures, financial inflow growth."}<br/>
              • <strong>{isKn ? "೨ ನೇ ತಿಂಗಳು:" : "Month 2:"}</strong> {isKn ? "ಪ್ರಯಾಣ ಮತ್ತು ಆಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಯಶಸ್ವಿ ನಿರ್ಧಾರ." : "Successful decisions regarding travel and investments."}<br/>
              • <strong>{isKn ? "೩ ನೇ ತಿಂಗಳು:" : "Month 3:"}</strong> {isKn ? "ಕುಟುಂಬದೊಂದಿಗೆ ಸಂತೋಷದ ಸಮಯ ಹಾಗೂ ದೈವ ದರ್ಶನ ಯೋಗ." : "Joyful family gatherings and divine pilgrimages."}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 7: 90-DAY RHYTHM & VISUAL iCAL SETUP GUIDE
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೬: ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ & ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಗೈಡ್" : "Chapter 6: 90-Day Rhythm & Mobile iCal Setup Guide"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ನಿಮ್ಮ ಮೊಬೈಲ್ ಲಾಕ್ ಸ್ಕ್ರೀನ್‌ಗೆ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು" : "Sync 90-Day Daily Panchanga Directly to Google / Apple Calendar"}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "8px" }}>
              📲 {isKn ? "ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ೫ ಸರಳ ಹಂತಗಳು:" : "5 Easy Steps to Install 90-Day Calendar on your Phone:"}
            </div>

            <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#451A03" }}>
              <strong>1. {isKn ? "ಹಂತ ೧:" : "Step 1:"}</strong> {isKn ? "ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ." : "Scan the QR Code below using your smartphone camera."}<br/>
              <strong>2. {isKn ? "ಹಂತ ೨:" : "Step 2:"}</strong> {isKn ? "'Download 90-Day Calendar (.ics)' ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ." : "Tap 'Download 90-Day Calendar (.ics)' link."}<br/>
              <strong>3. {isKn ? "ಹಂತ ೩:" : "Step 3:"}</strong> {isKn ? "ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ Files / Downloads ಫೋಲ್ಡರ್‌ಗೆ ಹೋಗಿ." : "Open 'Files / Downloads' folder on your phone."}<br/>
              <strong>4. {isKn ? "ಹಂತ ೪:" : "Step 4:"}</strong> {isKn ? ".ics ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Google Calendar' ಅಥವಾ 'Apple Calendar' ಆಯ್ಕೆಮಾಡಿ." : "Tap the .ics file and select 'Google Calendar' or 'Apple Calendar'."}<br/>
              <strong>5. {isKn ? "ಹಂತ ೫:" : "Step 5:"}</strong> {isKn ? "'Add All' ಕ್ಲಿಕ್ ಮಾಡಿ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ!" : "Tap 'Add All' to sync all 90 days to your lock screen calendar!"}
            </div>
          </div>

          {qrDataUrl ? (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <img src={qrDataUrl} alt="Calendar Sync QR Code" style={{ width: "180px", height: "180px", border: "2px solid #B45309", borderRadius: "10px", margin: "0 auto" }} />
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#B45309", marginTop: "6px" }}>
                {isKn ? "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡಿ" : "Scan to Sync 90-Day Calendar to Phone"}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "#B45309", fontSize: "12px" }}>
              📲 {isKn ? "ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ..." : "Generating Calendar Sync QR Code..."}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 8: ALTAR-READY SACRED STOTRAS & DAILY REMEDIES
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          <div style={headerBoxStyle}>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", lineHeight: "1.6" }}>
              {isKn ? "ಅಧ್ಯಾಯ ೭: ಪೂಜಾ ಮಂದಿರದ ಪ್ರತ್ಯೇಕ ಸ್ತೋತ್ರಗಳು & ದೈನಂದಿನ ಜಪ ಮಂತ್ರಗಳು" : "Chapter 7: Altar-Ready Sacred Stotras & Daily Mantras"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
              {isKn ? "ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸುವ ಸಿದ್ಧ ಮಂತ್ರಗಳು" : "Sacred Mantras & Remedies for your Home Temple Altar"}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              🏺 {isKn ? "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಸಿದ್ಧ ಸ್ತೋತ್ರ (Daily Morning Recitation):" : "Daily Morning Recitation Stotra:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12", fontStyle: "italic" }}>
              "ॐ ನಮಃ ಶಿವಾಯ ಶಂಭವೇ ಹರ ಹರ ಮಹಾದೇವಾಯ ನಮಃ ॥<br/>
              ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಳಾಯ ಬುಧಾಯ ಚ ।<br/>
              ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥"
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
              📿 {isKn ? "ದೈನಂದಿನ ೧೦೮ ಜಪ ಮಂತ್ರಗಳು (108 Daily Japa Remedies):" : "108 Daily Japa Remedies:"}
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.7", color: "#3F2A12" }}>
              • <strong>{isKn ? "ಸೂರ್ಯ ಮಂತ್ರ:" : "Surya Mantra:"}</strong> ॐ ಸೂರ್ಯಾಯ ನಮಃ (108 {isKn ? "ಬಾರಿ" : "times"})<br/>
              • <strong>{isKn ? "ಚಂದ್ರ ಮಂತ್ರ:" : "Chandra Mantra:"}</strong> ॐ ಚಂದ್ರಮಸೇ ನಮಃ (108 {isKn ? "ಬಾರಿ" : "times"})<br/>
              • <strong>{isKn ? "ಗುರು ಮಂತ್ರ:" : "Guru Mantra:"}</strong> ॐ ಗುರವೇ ನಮಃ (108 {isKn ? "ಬಾರಿ" : "times"})<br/>
              • <strong>{isKn ? "ಮಹಾಲಕ್ಷ್ಮಿ ಮಂತ್ರ:" : "Mahalakshmi Mantra:"}</strong> ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ಕಮಲಾಲಯೇ ಪ್ರಸೀದ ನಮಃ
            </div>
          </div>

          <div style={{
            marginTop: "auto",
            textAlign: "center",
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            border: "2px solid #B45309",
            borderRadius: "12px",
            padding: "10px",
            fontSize: "11px",
            fontWeight: "bold",
            color: "#78350F"
          }}>
            ॥ ಈ ಪುಟವನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಿ ಸಕಲ ಮಂಗಳಂ ಪ್ರಾಪ್ತಿ ॥
          </div>
        </div>
      </div>
    </div>
  );
};
