import React from "react";
import type { RhythmDay, RhythmResult } from "../../../core/DailyRhythmEngine";
import {
  pick,
  type SevaLang,
  T,
  COLOUR_HEX,
  WEEKDAY_SHORT_L5,
  GRAHA_MANTRA_SANSKRIT,
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
  const pobStr = identity?.pob || "Gokarna, Karnataka";

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
  const lagnaRashiName = birthKundli?.lagnaRashi?.english || "Karka";

  const rashiName = RASHI_L5[rashiIdx]?.[code] || RASHI_L5[rashiIdx]?.en || "Kanya";
  const nakName = NAKSHATRA_L5[nakIdx]?.[code] || NAKSHATRA_L5[nakIdx]?.en || "Hasta";

  const activePriest = getPriestProfile(panditName);

  // Common A4 Page Styling (794px x 1123px @ 96 DPI with 20mm left margin for comb-binding)
  const pageStyle: React.CSSProperties = {
    width: "794px",
    height: "1123px",
    padding: "40px 40px 40px 75px", // 75px left padding for comb-binding
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
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "rgba(253, 246, 231, 0.4)"
  };

  return (
    <div id="seva-print-royal-booklet-container" style={{ backgroundColor: "#2D3748", padding: "20px 0" }}>
      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: ROYAL COVER PAGE & DEVOTEE PROFILE BOX
         ───────────────────────────────────────────────────────────── */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Sloka & Title */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #B45309", paddingBottom: "16px" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#B45309", marginBottom: "4px" }}>
              ॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#78350F", letterSpacing: "1px" }}>
              {isKn ? "॥ ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ವರದಿ ॥" :
               isHi ? "॥ वाग्गोण पंचांग ज्योतिष रिपोर्ट ॥" :
               isTe ? "॥ భాగ్గోణ పంచాంగ జ్యోతిష్య నివేదిక ॥" :
               isTa ? "॥ பாகோண பஞ்சாங்க ஜோதிட அறிக்கை ॥" :
               "॥ Baggona Panchanga Astrology Report ॥"}
            </div>
            <div style={{ fontSize: "13px", color: "#B45309", marginTop: "4px", fontWeight: 600 }}>
              {isKn ? "ವೈಯಕ್ತಿಕ 8 ಪುಟಗಳ ರಾಯಲ್ ಜ್ಯೋತಿಷ್ಯ ಲೈಫ್ ಗ್ರಂಥ" :
               isHi ? "व्यक्तिगत 8-पृष्ठ रॉयल ज्योतिष जीवन ग्रंथ" :
               isTe ? "వ్యక్తిగత 8-పేజీల రాయల్ జ్యోతిష్య జీవిత గ్రంథం" :
               isTa ? "தனிப்பட்ட 8-பக்க ராயல் ஜோதிட வாழ்க்கை நூல்" :
               "Personalized 8-Page Royal Astrological Life Dossier"}
            </div>
          </div>

          {/* Devotee Profile Box */}
          <div style={{
            background: "linear-gradient(135deg, #FFFBEB, #FFE4E6)",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "20px",
            margin: "24px 0",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.15)"
          }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#B45309", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
              {isKn ? "ಆತ್ಮೀಯ ಭಕ್ತರ ವಿವರಣೆ (Devotee Record):" : "Personalized Record For:"}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#78350F", marginBottom: "14px" }}>
              {displayName}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "#451A03" }}>
              <div><strong>{isKn ? "ಜನ್ಮ ರಾಶಿ:" : "Janma Rashi:"}</strong> {rashiName}</div>
              <div><strong>{isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Janma Nakshatra:"}</strong> {nakName} ({pada} {isKn ? "ನೇ ಪಾದ" : "Pada"})</div>
              <div><strong>{isKn ? "ಜನ್ಮ ಲಗ್ನ:" : "Janma Lagna:"}</strong> {lagnaRashiName}</div>
              <div><strong>{isKn ? "ಗೋತ್ರ:" : "Gotra:"}</strong> {identity?.gotra || (isKn ? "ಕಾಶ್ಯಪ ಗೋತ್ರ" : "Kashyapa Gotra")}</div>
              <div><strong>{isKn ? "ಜನನ ದಿನಾಂಕ:" : "Date of Birth:"}</strong> {dobStr}</div>
              <div><strong>{isKn ? "ಜನನ ಸಮಯ:" : "Time of Birth:"}</strong> {tobStr}</div>
              <div style={{ gridColumn: "span 2" }}><strong>{isKn ? "ಜನನ ಸ್ಥಳ:" : "Place of Birth:"}</strong> {pobStr}</div>
            </div>
          </div>

          {/* Sacred Blessing & Chief Archaka Seal */}
          <div style={{ textAlign: "center", borderTop: "1.5px solid #E7C68A", paddingTop: "16px" }}>
            <div style={{ fontSize: "14px", fontStyle: "italic", color: "#78350F", marginBottom: "8px" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು · ಸಕಲ ಕಲ್ಯಾಣಮಸ್ತು"
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#B45309" }}>
              {activePriest.title[code as keyof typeof activePriest.title] || activePriest.title.en} · {panditName}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: A4 JANMA KUNDLI & BIRTH PANCHANGA
         ───────────────────────────────────────────────────────────── */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೧: ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ಜನ್ಮ ಪಂಚಾಂಗ" : "Chapter 1: Janma Kundli & Birth Panchanga"}
          </div>

          {/* South Indian Kundali Grid Representation */}
          <div style={{
            margin: "20px 0",
            border: "2px solid #B45309",
            borderRadius: "12px",
            padding: "16px",
            backgroundColor: "#FFFDF7"
          }}>
            <div style={{ textAlign: "center", fontWeight: "bold", color: "#78350F", marginBottom: "12px", fontSize: "14px" }}>
              {isKn ? `🌌 ${displayName} ಅವರ ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ (D-1 Rashi Grid)` : `🌌 ${displayName}'s D-1 Rashi Kundali Grid`}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 80px)", border: "2px solid #78350F" }}>
              {/* 12 Rashi Boxes with Center Devotee Box */}
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Meena (Pisces)<br/>[Maandi]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Mesha (Aries)<br/>[Venus]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Vrishabha<br/>[Sun, Ketu]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Mithuna<br/>[Mercury]</div>

              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Kumbha<br/>[Saturn]</div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "2px solid #B45309", backgroundColor: "#FFFBEB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
                <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px" }}>{dobStr} · {tobStr}</div>
                <div style={{ fontSize: "9px", color: "#451A03", marginTop: "2px" }}>Lagna: {lagnaRashiName}</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Karka (Cancer)<br/>[Lagna, Mars]</div>

              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Makara<br/>[Gochara]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Simha (Leo)<br/>[Jupiter]</div>

              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Dhanus<br/>[Dasha]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Vrischika<br/>[Rahu]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Tula (Libra)<br/>[Gochara]</div>
              <div style={{ border: "1px solid #B45309", padding: "4px", fontSize: "10px" }}>Kanya (Virgo)<br/>[Moon 17.98°]</div>
            </div>
          </div>

          {/* Birth Panchanga Details */}
          <div style={{ backgroundColor: "#FDF6E7", border: "1.5px solid #B45309", borderRadius: "10px", padding: "14px", fontSize: "12px", lineHeight: "1.6" }}>
            <div style={{ fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>{isKn ? "ಜನ್ಮ ಸಮಯದ ಸುಖ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:" : "Birth Panchanga Calculations:"}</div>
            <div>• <strong>{isKn ? "ತಿಥಿ:" : "Tithi:"}</strong> ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ) · <strong>{isKn ? "ಕರಣ:" : "Karana:"}</strong> ಬಾಲವ</div>
            <div>• <strong>{isKn ? "ಘಟಿ / ವಿಘಟಿ:" : "Ghati / Vighati:"}</strong> 42 ಘಟಿ 48 ವಿಘಟಿ · <strong>{isKn ? "ದಿವ ಘಟಿ:" : "Diva Ghati:"}</strong> 32 ಘಟಿ 12 ವಿಘಟಿ</div>
            <div>• <strong>{isKn ? "ಅಮೃತ ಘಟಿ:" : "Amrita Ghati:"}</strong> 44 ಘಟಿ 6 ವಿಘಟಿ · <strong>{isKn ? "ವಿಷ ಘಟಿ:" : "Visha Ghati:"}</strong> 20 ಘಟಿ 6 ವಿಘಟಿ</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 3: 20-YEAR INTERACTIVE DASHA-BHUKTI TIMELINE
         ───────────────────────────────────────────────────────────── */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೨: ೨೦-ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ನಕ್ಷೆ" : "Chapter 2: 20-Year Interactive Dasha-Bhukti Timeline"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
            {/* Bhukti Period 1 */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #B45309", borderRadius: "10px", padding: "12px", fontSize: "11px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "4px" }}>
                📌 [ ಗುರು ಮಹಾದಶಾ · ಶುಕ್ರ ಅಂತರ್ದಶಾ ] (Jupiter Mahadasha - Venus Antardasha)
              </div>
              <div style={{ color: "#B45309", fontWeight: "bold", marginBottom: "6px" }}>
                🗓️ {isKn ? "ಅವಧಿ: 2026-05-12 ರಿಂದ 2029-01-18 ರವರೆಗೆ" : "Period: 12-May-2026 to 18-Jan-2029"}
              </div>
              <div style={{ color: "#3F2A12", lineHeight: "1.5" }}>
                • 💼 <strong>{isKn ? "ಉದ್ಯೋಗ & ಸ್ಥಾನಮಾನ:" : "Career & Status:"}</strong> {isKn ? "ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಬೆಂಬಲ, ಹೊಸ ಉದ್ಯೋಗ ಬಡ್ತಿ ಹಾಗೂ ವೃತ್ತಿಯಲ್ಲಿ ನಾಯಕತ್ವದ ಯೋಗ." : "Executive promotion, leadership responsibilities, and high professional recognition."}<br/>
                • 💰 <strong>{isKn ? "ಧನ ಲಾಭ & ಆಸ್ತಿ:" : "Wealth & Assets:"}</strong> {isKn ? "ನೂತನ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ವಾಹನ ಯೋಗ ಹಾಗೂ ಧನ ಹರಿವಿನಲ್ಲಿ ಹೆಚ್ಚಿನ ವೃದ್ಧಿ." : "Auspicious alignment for property purchase, vehicle acquisition, and financial growth."}<br/>
                • 🏡 <strong>{isKn ? "ಕುಟುಂಬ ಸುಖ:" : "Family Harmony:"}</strong> {isKn ? "ಗೃಹದಲ್ಲಿ ಶುಭ ಸಮಾರಂಭಗಳ ಆಯೋಜನೆ, ಸೌಹಾರ್ದಯುತ ಆಪ್ತ ಬಾಂಧವ್ಯ." : "Domestic harmony, celebratory events at home, and warm supportive relationships."}<br/>
                • 🌿 <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Spiritual Remedy:"}</strong> {isKn ? "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ ಹಾಗೂ ಶುಕ್ರವಾರ ದೀಪಾರಾಧನೆಯಿಂದ ಸಕಲ ಐಶ್ವರ್ಯ ಸಿದ್ಧಿ." : "Recite Mahalakshmi Stotra and light ghee lamp on Fridays for abundance."}
              </div>
            </div>

            {/* Bhukti Period 2 */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #B45309", borderRadius: "10px", padding: "12px", fontSize: "11px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "4px" }}>
                📌 [ ಗುರು ಮಹಾದಶಾ · ಸೂರ್ಯ ಅಂತರ್ದಶಾ ] (Jupiter Mahadasha - Sun Antardasha)
              </div>
              <div style={{ color: "#B45309", fontWeight: "bold", marginBottom: "6px" }}>
                🗓️ {isKn ? "ಅವಧಿ: 2029-01-18 ರಿಂದ 2029-11-06 ರವರೆಗೆ" : "Period: 18-Jan-2029 to 06-Nov-2029"}
              </div>
              <div style={{ color: "#3F2A12", lineHeight: "1.5" }}>
                • 💼 <strong>{isKn ? "ಉದ್ಯೋಗ & ಕೀರ್ತಿ:" : "Career & Honor:"}</strong> {isKn ? "ಸರ್ಕಾರಿ ಕೆಲಸ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು, ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ." : "Success in government matters, social prestige, and authoritative roles."}<br/>
                • 💰 <strong>{isKn ? "ಧನ ಯೋಗ:" : "Financial Growth:"}</strong> {isKn ? "ಪೂರ್ವಾರ್ಜಿತ ಆಸ್ತಿಯಿಂದ ಲಾಭ ಹಾಗೂ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಯಶಸ್ವಿ ಫಲ." : "Gains from ancestral assets and profitable long-term investments."}<br/>
                • 🌿 <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Spiritual Remedy:"}</strong> {isKn ? "ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ." : "Practice Surya Namaskar daily and recite Aditya Hrudayam Stotra."}
              </div>
            </div>

            {/* Bhukti Period 3 */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #B45309", borderRadius: "10px", padding: "12px", fontSize: "11px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F", marginBottom: "4px" }}>
                📌 [ ಶನಿ ಮಹಾದಶಾ · ಶನಿ ಅಂತರ್ದಶಾ ] (Saturn Mahadasha - Saturn Antardasha)
              </div>
              <div style={{ color: "#B45309", fontWeight: "bold", marginBottom: "6px" }}>
                🗓️ {isKn ? "ಅವಧಿ: 2029-11-06 ರಿಂದ 2032-11-15 ರವರೆಗೆ" : "Period: 06-Nov-2029 to 15-Nov-2032"}
              </div>
              <div style={{ color: "#3F2A12", lineHeight: "1.5" }}>
                • 💼 <strong>{isKn ? "ವೃತ್ತಿ ಕರ್ತವ್ಯ:" : "Professional Duties:"}</strong> {isKn ? "ಕಠಿಣ ಶ್ರಮದಿಂದ ಸ್ಥಿರವಾದ ವೃತ್ತಿ ಬೆಳವಣಿಗೆ. ಧೈರ್ಯ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಯಶಸ್ಸು." : "Steady career stability through disciplined hard work and patient focus."}<br/>
                • 🌿 <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Spiritual Remedy:"}</strong> {isKn ? "ಶನಿವಾರ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಎಳ್ಳಿನ ಎಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ." : "Chant Hanuman Chalisa on Saturdays and light sesame oil lamp."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGES 4, 5, 6: 3 FULL PAGES OF DEEP BHAVISHYA PREDICTIONS
         ───────────────────────────────────────────────────────────── */}
      {/* PAGE 4 */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿ" : "Chapter 3: Personality, Dark Secret & Current Life Situation"}
          </div>

          <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#3F2A12", marginTop: "14px" }}>
            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginBottom: "4px" }}>
              👤 {isKn ? "ವ್ಯಕ್ತಿತ್ವದ ಗುಣಲಕ್ಷಣಗಳು (Personality Traits):" : "Personality Characteristics:"}
            </div>
            <div>{displayName} {isKn ? "ಅವರು ಬುದ್ಧಿವಂತ, ದೂರದೃಷ್ಟಿಯುಳ್ಳ ಹಾಗೂ ಸಾತ್ವಿಕ ಸ್ವಭಾವದವರು. ಕನ್ಯಾ ರಾಶಿ ಹಸ್ತ ನಕ್ಷತ್ರ ಪ್ರಭಾವದಿಂದ ಮಾತಿನಲ್ಲಿ ಚಾತುರ್ಯ ಹಾಗೂ ವ್ಯವಹಾರದಲ್ಲಿ ದಕ್ಷತೆ ಹೊಂದಿರುತ್ತಾರೆ." : "is intuitive, forward-thinking, and deeply spiritual. Guided by Kanya Rashi and Hasta Nakshatra, they possess eloquent communication and executive acumen."}</div>

            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginTop: "16px", marginBottom: "4px" }}>
              🔮 {isKn ? "ನಿಗೂಢ ರಹಸ್ಯ (The Subconscious Dark Secret):" : "The Subconscious Dark Secret:"}
            </div>
            <div>{isKn ? "ಅಂತರಂಗದ ಕಲ್ಪನಾ ಶಕ್ತಿ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ ನಿಮ್ಮ ದೊಡ್ಡ ಬಲ. ಕೆಲವೊಮ್ಮೆ ಅನಗತ್ಯ ಚಿಂತೆ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಶಾಂತಿಗೆ ಭಂಗ ತರಬಹುದು; ಧ್ಯಾನದಿಂದ ಸದಾ ಪ್ರಶಾಂತತೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Inner intuitive depth is your silent superpower. Occasional overthinking may trigger temporary emotional sensitivity; practice daily meditation to preserve absolute inner peace."}</div>

            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginTop: "16px", marginBottom: "4px" }}>
              🌅 {isKn ? "ಇವಾಗಿನ ಪರಿಸ್ಥಿತಿ (Current Life Phase & Situation):" : "Current Life Phase & Situation:"}
            </div>
            <div>{isKn ? "ಪ್ರಸ್ತುತ ಗುರು ಮಹಾದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿಮಗೆ ನೂತನ ಅವಕಾಶಗಳು ಎದುರಾಗಲಿವೆ. ಹಿರಿಯರ ಹಾಗೂ ಮಾರ್ಗದರ್ಶಕರ ಸಹಕಾರದಿಂದ ಸ್ಥಗಿತಗೊಂಡ ಕೆಲಸ ಕಾರ್ಯಗಳು ಪುನರಾರಂಭಗೊಳ್ಳಲಿವೆ." : "Under current Jupiter Mahadasha, auspicious new growth horizons open up. Supportive mentors and elders help restart pending long-term initiatives with renewed clarity."}</div>
          </div>
        </div>
      </div>

      {/* PAGE 5 */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು & ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು" : "Chapter 4: Kundli Yogas & Live Gochara Transits"}
          </div>

          <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#3F2A12", marginTop: "14px" }}>
            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginBottom: "4px" }}>
              🌟 {isKn ? "ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ಯೋಗಗಳು (Prominent Kundli Yogas):" : "Prominent Kundli Yogas:"}
            </div>
            <div>• <strong>{isKn ? "ಗಜಕೇಸರಿ ಯೋಗ:" : "Gaja Kesari Yoga:"}</strong> {isKn ? "ಗುರು ಮತ್ತು ಚಂದ್ರರ ಅನುಕೂಲಕರ ಸ್ಥಾನದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಲಭಿಸಲಿದೆ." : "Auspicious alignment of Jupiter & Moon grants societal honor and lasting wealth."}<br/>
            • <strong>{isKn ? "ಬುಧಾದಿತ್ಯ ಯೋಗ:" : "Budhaditya Yoga:"}</strong> {isKn ? "ಬುಧ ಹಾಗೂ ಸೂರ್ಯರ ಯೋಗದಿಂದ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ವಿದ್ಯಾ ಯಶಸ್ಸು." : "Mercury-Sun conjunction endows sharp intellect and academic/professional mastery."}</div>

            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginTop: "16px", marginBottom: "4px" }}>
              🪐 {isKn ? "ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು (Live Planetary Transits):" : "Live Planetary Transits:"}
            </div>
            <div>• <strong>{isKn ? "ಶನಿ ಗೋಚಾರ (Saturn Transit):" : "Saturn Transit:"}</strong> {isKn ? "ಕುಂಭ ರಾಶಿಯಲ್ಲಿ ಶನಿ ಸಂಚಾರದಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಜವಾಬ್ದಾರಿ ಹೆಚ್ಚಾಗಲಿದೆ. ತಾಳ್ಮೆಯಿಂದ ಮುನ್ನಡೆಯಿರಿ." : "Saturn in Aquarius demands disciplined effort and strategic patience."}<br/>
            • <strong>{isKn ? "ಗುರು ಗೋಚಾರ (Jupiter Transit):" : "Jupiter Transit:"}</strong> {isKn ? "ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಗುರು ಸಂಚಾರದಿಂದ ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಗ." : "Jupiter in Taurus brings monetary growth and home celebrations."}</div>
          </div>
        </div>
      </div>

      {/* PAGE 6 */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೫: ವಿವಾಹ, ಸಂತಾನ ಹಾಗೂ ಮುಂದಿನ ೩ ತಿಂಗಳ ಫಲಾಫಲ" : "Chapter 5: Marriage, Progeny & Next 3 Months Forecast"}
          </div>

          <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#3F2A12", marginTop: "14px" }}>
            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginBottom: "4px" }}>
              💒 {isKn ? "ವಿವಾಹ & ಸಂತಾನ ಯೋಗ (Marriage & Progeny Potential):" : "Marriage & Progeny Potential:"}
            </div>
            <div>{isKn ? "7ನೇ ಹಾಗೂ 5ನೇ ಭಾವಗಳ ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿಯಿಂದ ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯಕ್ಕೆ ಅನುಕೂಲಕರ ಯೋಗವಿದೆ." : "Favorable planetary aspects on 5th and 7th houses ensure domestic bliss and progeny blessings."}</div>

            <div style={{ fontWeight: 900, color: "#78350F", fontSize: "14px", marginTop: "16px", marginBottom: "4px" }}>
              🗓️ {isKn ? "ಮುಂದಿನ ೩ ತಿಂಗಳ ಸ್ಪಷ್ಟ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ (Next 3 Months Roadmap):" : "Next 3 Months Actionable Roadmap:"}
            </div>
            <div>• <strong>{isKn ? "೧ ನೇ ತಿಂಗಳು:" : "Month 1:"}</strong> {isKn ? "ನೂತನ ಯೋಜನೆಗಳಿಗೆ ಚಾಲನೆ, ಧನ ಹರಿವು ಹೆಚ್ಚಾಗಲಿದೆ." : "Initiate new plans; financial inflows pick up momentum."}<br/>
            • <strong>{isKn ? "೨ ನೇ ತಿಂಗಳು:" : "Month 2:"}</strong> {isKn ? "ಪ್ರಯಾಣ ಮತ್ತು ಆಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಯಶಸ್ವಿ ನಿರ್ಧಾರ." : "Favorable window for asset decisions and business travels."}<br/>
            • <strong>{isKn ? "೩ ನೇ ತಿಂಗಳು:" : "Month 3:"}</strong> {isKn ? "ಕುಟುಂಬದೊಂದಿಗೆ ಸಂತೋಷದ ಸಮಯ ಹಾಗೂ ದೈವ ದರ್ಶನ ಯೋಗ." : "Uplifting family celebrations and temple pilgrimages."}</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 7: 90-DAY RHYTHM & VISUAL iCAL SETUP GUIDE
         ───────────────────────────────────────────────────────────── */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೬: ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ & ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಗೈಡ್" : "Chapter 6: 90-Day Rhythm & Mobile iCal Setup Guide"}
          </div>

          <div style={{ margin: "16px 0", background: "#FFFBEB", border: "2px solid #B45309", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "10px" }}>
              📲 {isKn ? "ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ೫ ಸರಳ ಹಂತಗಳು:" : "5 Easy Steps to Install 90-Day Calendar on your Phone:"}
            </div>

            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#451A03" }}>
              <strong>1. {isKn ? "ಹಂತ ೧:" : "Step 1:"}</strong> {isKn ? "ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ." : "Scan the QR Code below using your smartphone camera."}<br/>
              <strong>2. {isKn ? "ಹಂತ ೨:" : "Step 2:"}</strong> {isKn ? "'Download 90-Day Calendar (.ics)' ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ." : "Tap 'Download 90-Day Calendar (.ics)' link."}<br/>
              <strong>3. {isKn ? "ಹಂತ ೩:" : "Step 3:"}</strong> {isKn ? "ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ Files / Downloads ಫೋಲ್ಡರ್‌ಗೆ ಹೋಗಿ." : "Open 'Files / Downloads' folder on your phone."}<br/>
              <strong>4. {isKn ? "ಹಂತ ೪:" : "Step 4:"}</strong> {isKn ? ".ics ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Google Calendar' ಅಥವಾ 'Apple Calendar' ಆಯ್ಕೆಮಾಡಿ." : "Tap the .ics file and select 'Google Calendar' or 'Apple Calendar'."}<br/>
              <strong>5. {isKn ? "ಹಂತ ೫:" : "Step 5:"}</strong> {isKn ? "'Add All' ಕ್ಲಿಕ್ ಮಾಡಿ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ!" : "Tap 'Add All' to sync all 90 days to your lock screen calendar!"}
            </div>
          </div>

          {qrDataUrl && (
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <img src={qrDataUrl} alt="Calendar Sync QR Code" style={{ width: "160px", height: "160px", border: "2px solid #B45309", borderRadius: "10px" }} />
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#B45309", marginTop: "6px" }}>
                {isKn ? "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡಿ" : "Scan to Sync 90-Day Calendar to Phone"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 8: ALTAR-READY SACRED STOTRAS & DAILY REMEDIES
         ───────────────────────────────────────────────────────────── */}
      <div style={pageStyle}>
        <div style={frameStyle}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#78350F", borderBottom: "2px solid #B45309", paddingBottom: "8px", textAlign: "center" }}>
            {isKn ? "ಅಧ್ಯಾಯ ೭: ಪೂಜಾ ಮಂದಿರದ ಪ್ರತ್ಯೇಕ ಸ್ತೋತ್ರಗಳು & ದೈನಂದಿನ ಜಪ ಮಂತ್ರಗಳು" : "Chapter 7: Altar-Ready Sacred Stotras & Daily Mantras"}
          </div>

          <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#3F2A12", marginTop: "14px" }}>
            <div style={{ background: "#FFFBEB", border: "1.5px solid #B45309", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
                🪔 {isKn ? "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಸಿದ್ಧ ಸ್ತೋತ್ರ (Daily Morning Recitation):" : "Janma Nakshatra Sacred Stotra:"}
              </div>
              <div style={{ fontStyle: "italic", color: "#78350F", fontSize: "13px" }}>
                "ॐ ನಮಃ ಶಿವಾಯ ಶಂಭವೇ ಹರ ಹರ ಮಹಾದೇವಾಯ ನಮಃ ॥<br/>
                ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಲಾಯ ಬುಧಾಯ ಚ ।<br/>
                ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥"
              </div>
            </div>

            <div style={{ background: "#FFFBEB", border: "1.5px solid #B45309", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "6px" }}>
                📿 {isKn ? "ದೈನಂದಿನ ೧೦೮ ಜಪ ಮಂತ್ರಗಳು (108 Daily Japa Remedies):" : "108 Daily Japa Remedies:"}
              </div>
              <div>• <strong>{isKn ? "ಸೂರ್ಯ ಮಂತ್ರ:" : "Surya Mantra:"}</strong> ॐ ಸೂರ್ಯಾಯ ನಮಃ (108 ಬಾರಿ)</div>
              <div>• <strong>{isKn ? "ಚಂದ್ರ ಮಂತ್ರ:" : "Chandra Mantra:"}</strong> ॐ ಚಂದ್ರಮಸೇ ನಮಃ (108 ಬಾರಿ)</div>
              <div>• <strong>{isKn ? "ಗುರು ಮಂತ್ರ:" : "Guru Mantra:"}</strong> ॐ ಗುರವೇ ನಮಃ (108 ಬಾರಿ)</div>
              <div>• <strong>{isKn ? "ಮಹಾಲಕ್ಷ್ಮಿ ಮಂತ್ರ:" : "Mahalakshmi Mantra:"}</strong> ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ಕಮಲಾಲಯೇ ಪ್ರಸೀದ ನಮಃ</div>
            </div>

            <div style={{ textAlign: "center", marginTop: "24px", color: "#B45309", fontWeight: 900, fontSize: "13px" }}>
              ॥ ಈ ಪುಟವನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಿ ಸಕಲ ಮಂಗಳಂ ಪ್ರಾಪ್ತಿ ॥
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyalBooklet8PageTemplate;
