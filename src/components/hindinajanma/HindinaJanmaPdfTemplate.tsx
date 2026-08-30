import React from "react";
import type { HindinaJanmaResult } from "../../features/hindinajanma/hindinaJanmaTypes";
import { pickL5, pickL5Array } from "../../features/hindinajanma/hindinaJanmaLocale";
import { sanitizeAIText } from "../../utils/textFormatter";

export type HindinaJanmaPdfTemplateProps = {
  result: HindinaJanmaResult;
};

export const HindinaJanmaPdfTemplate: React.FC<HindinaJanmaPdfTemplateProps> = ({
  result
}) => {
  const lang = result.input.lang || "kn";
  const isKn = lang === "kn";

  const headerTitle = isKn
    ? "॥ ಬಗ್ಗೋಣ ಹಿಂದಿನ ಜನ್ಮ ರಹಸ್ಯ & ಪೂರ್ವ ಜನ್ಮ ಕರ್ಮ ದರ್ಪಣ ॥"
    : "Baggona Past Life Karma & Reincarnation Mirror";
  const headerSub = isKn
    ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಶಾಸ್ತ್ರೋಕ್ತ ಷಷ್ಟ್ಯಂಶ (D-60) & ಕರ್ಮ ಸಿದ್ಧಾಂತ ವರದಿ"
    : "Authentic Vedic Parashara D-60 Shashtiamsha & Karmic Evolution Report";

  return (
    <div
      id="hindina-janma-pdf-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        width: "794px",
        background: "#FFFFFF",
        color: "#451A03",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
    >
      {/* PAGE 1: Identity, Vocation, Sanchita Karma & Innate Boons */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "#FFFDF7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderBottom: "1px dashed #CBD5E1"
        }}
      >
        <div
          style={{
            border: "3px solid #D97706",
            borderRadius: "12px",
            padding: "16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "8px", marginBottom: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥
            </div>
            <h1 style={{ fontSize: "17px", fontWeight: 900, color: "#78350F", margin: "4px 0 2px 0" }}>
              {headerTitle}
            </h1>
            <div style={{ fontSize: "10px", color: "#B45309", fontWeight: 600 }}>
              {headerSub}
            </div>
          </div>

          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "4px" }}>
              👤 {result.input.personName} ({result.input.gender})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "10.5px", color: "#92400E" }}>
              <div><strong>{isKn ? "ಜನ್ಮ ದಿನಾಂಕ:" : "DOB:"}</strong> <span style={{ fontWeight: 800, color: "#991B1B" }}>{result.input.dob}</span></div>
              {result.input.tob && <div><strong>{isKn ? "ಸಮಯ:" : "Time:"}</strong> {result.input.tob}</div>}
              <div><strong>{isKn ? "ರವಿ ರಾಶಿ:" : "Sun Sign:"}</strong> {result.sunSign}</div>
              <div><strong>{isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.moonNakshatra}</span></div>
              <div><strong>{isKn ? "ಆತ್ಮದ ಹಂತ:" : "Soul Stage:"}</strong> <span style={{ fontWeight: 800, color: "#78350F" }}>{pickL5(result.mokshaAxis.soulMaturityLevel, lang)}</span></div>
              <div><strong>{isKn ? "ಪುಣ್ಯ ಪ್ರಮಾಣ:" : "Punya Ratio:"}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.karmaAnalysis.sanchitaPunyaPercentage}%</span></div>
            </div>
          </div>

          {/* Past Life Identity & Era */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "3px", marginBottom: "4px" }}>
              👑 {isKn ? "ಹಿಂದಿನ ಜನ್ಮದ ಗುರುತು, ಯುಗ & ವೃತ್ತಿ (Past Life Persona):" : "Past Life Identity, Era & Archetype:"}
            </div>
            <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.4" }}>
              <div><strong>{isKn ? "ಕಾಲಮಾನ & ಯುಗ:" : "Era & Timeline:"}</strong> {pickL5(result.pastLifePersona.eraAndTimeline, lang)}</div>
              <div><strong>{isKn ? "ಭೌಗೋಳಿಕ ಪ್ರದೇಶ:" : "Realm:"}</strong> {pickL5(result.pastLifePersona.geographicalRealm, lang)}</div>
              <div><strong>{isKn ? "ವೃತ್ತಿ & ಸಾಮಾಜಿಕ ಸ್ಥಾನಮಾನ:" : "Vocation & Status:"}</strong> <span style={{ fontWeight: 800, color: "#92400E" }}>{pickL5(result.pastLifePersona.socialStatusAndVocation, lang)}</span></div>
              <div style={{ marginTop: "3px", fontStyle: "italic", color: "#78350F" }}>
                "{pickL5(result.pastLifePersona.personalitySummary, lang)}"
              </div>
            </div>
          </div>

          {/* Sanchita Karma & Unfinished Debts */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "3px", marginBottom: "4px" }}>
              ⚖️ {isKn ? "ಸಂಚಿತ ಕರ್ಮ & ಋಣಾನುಬಂಧ ವಿಶ್ಲೇಷಣೆ:" : "Sanchita Karma & Karmic Debts:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "10px", color: "#92400E" }}>
              <div>
                <strong>{isKn ? "ಪ್ರಮುಖ ಋಣ:" : "Dominant Debt:"}</strong>
                <div style={{ color: "#78350F", fontWeight: 700 }}>{pickL5(result.karmaAnalysis.dominantKarmicDebt, lang)}</div>
              </div>
              <div>
                <strong>{isKn ? "ಪೂರ್ವ ವರ / ಆಶೀರ್ವಾದ:" : "Karmic Blessing:"}</strong>
                <div style={{ color: "#065F46", fontWeight: 700 }}>{pickL5(result.karmaAnalysis.karmicCurseOrBlessing, lang)}</div>
              </div>
            </div>
          </div>

          {/* Innate Boons & Talents */}
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 10px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
              🌟 {isKn ? "ಪೂರ್ವ ಜನ್ಮದಿಂದ ತಂದಿರುವ ಸುಪ್ತ ಪ್ರತಿಭೆಗಳು (Innate Boons):" : "Inherited Soul Talents & Boons:"}
            </div>
            <div style={{ fontSize: "9.5px", color: "#451A03", lineHeight: "1.35" }}>
              {pickL5Array(result.innateBoons.inheritedTalents, lang).slice(0, 3).map((t, idx) => (
                <div key={idx}>• {t}</div>
              ))}
            </div>
          </div>

          {/* Footer Page 1 */}
          <div style={{ textAlign: "center", fontSize: "9px", color: "#92400E", marginTop: "6px" }}>
            ಪುಟ ೧ / ೨ · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ · ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)
          </div>
        </div>
      </div>

      {/* PAGE 2: Phobias, Rahu-Ketu Soul Mission, Remedies & AI Narrative */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "#FFFDF7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div
          style={{
            border: "3px solid #D97706",
            borderRadius: "12px",
            padding: "16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Top Title */}
          <div style={{ textAlign: "center", borderBottom: "1.5px solid #F59E0B", paddingBottom: "6px", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
              🔄 {isKn ? "ರಾಹು-ಕೇತು ಮೋಕ್ಷ ಅಕ್ಷ, ಕರ್ಮ ಮುಕ್ತಿ & ದೈವಿಕ ಸಂದೇಶ" : "Rahu-Ketu Soul Mission & Divine Remedies"}
            </div>
          </div>

          {/* Rahu-Ketu Axis */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#78350F", marginBottom: "3px" }}>
              🔄 {isKn ? "ಆತ್ಮದ ವಿಕಾಸ ಪಥ (Rahu-Ketu Karmic Axis):" : "Soul's Evolutionary Trajectory:"}
            </div>
            <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.4" }}>
              <div><strong>{isKn ? "ಕೇತು (ಸಿದ್ಧಿ):" : "Ketu (Past Mastery):"}</strong> {pickL5(result.mokshaAxis.ketuPastLifeMastery, lang)}</div>
              <div><strong>{isKn ? "ರಾಹು (ಗುರಿ):" : "Rahu (Life Purpose):"}</strong> {pickL5(result.mokshaAxis.rahuCurrentLifeMission, lang)}</div>
            </div>
          </div>

          {/* Phobia & Birthmark Correlation */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#78350F", marginBottom: "3px" }}>
              🐍 {isKn ? "ಭಯಗಳು, ಮಚ್ಚೆಗಳು & ದೇಹತ್ಯಾಗದ ರಹಸ್ಯ:" : "Birthmark & Transition Resonance:"}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{isKn ? "ಮಚ್ಚೆಯ ಸಂಕೇತ:" : "Birthmark:"}</strong> {pickL5(result.phobiaCorrelation.birthmarkSignificance, lang)}</div>
              <div><strong>{isKn ? "ಭಯದ ಮೂಲ:" : "Phobia Origin:"}</strong> {pickL5(result.phobiaCorrelation.phobiaKarmicOrigin, lang)}</div>
            </div>
          </div>

          {/* AI Narrative or Vedic Wisdom Summary */}
          {result.aiNarrative && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "8px", flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 900, color: "#78350F", marginBottom: "3px" }}>
                ✨ {isKn ? "ಗೋಕರ್ಣ ವೇದಜ್ಞರ ದೈವಿಕ ಸಂದೇಶ (Vedic AI Revelation):" : "Sacred Vedic Insight:"}
              </div>
              <div style={{ fontSize: "9.5px", color: "#451A03", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>
                {sanitizeAIText(result.aiNarrative).slice(0, 750)}...
              </div>
            </div>
          )}

          {/* Karmic Remedies */}
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
              🪔 {isKn ? "ಪೂರ್ವಜನ್ಮ ಕರ್ಮ ಮುಕ್ತಿ ಪರಿಹಾರಗಳು:" : "Sacred Karmic Remedies:"}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.35" }}>
              {pickL5(result.remedies.sacredGokarnaRemedy, lang)}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#78350F", marginTop: "3px" }}>
              {result.remedies.sacredAtmaShantiMantra}
            </div>
          </div>

          {/* Footer Contact */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "8px 12px",
              textAlign: "center",
              color: "#FEF3C7"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800 }}>
              🕉️ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು — ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮೊಬೈಲ್: +91 99723 39362
            </div>
            <div style={{ fontSize: "9px", color: "#FDE68A", marginTop: "2px" }}>
              ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ, ಸಂಚಿತ ಕರ್ಮ ಶಾಂತಿ ಹಾಗೂ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆಗಳಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
