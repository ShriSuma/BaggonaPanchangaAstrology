import React from "react";
import type { LifeGuidanceResult, LifeGuidanceTabKey } from "../../features/lifeguidance/lifeGuidanceEngine";
import type { PriestProfile } from "../../features/seva/sevaPriestDirectory";
import { sanitizeAIText } from "../../utils/textFormatter";

export type LifeGuidancePdfTemplateProps = {
  result: LifeGuidanceResult;
  activeTab?: LifeGuidanceTabKey | "custom";
  lang?: string;
  priest?: PriestProfile;
};

export const LifeGuidancePdfTemplate: React.FC<LifeGuidancePdfTemplateProps> = ({
  result,
  activeTab = "career",
  lang = "kn",
  priest
}) => {
  const code = (lang || "kn").slice(0, 2);
  const priestName = (priest?.name as Record<string, string>)?.[code] || priest?.name?.kn || "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const priestTitle = (priest?.title as Record<string, string>)?.[code] || priest?.title?.kn || "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು";
  const priestPhone = priest?.phone || "+91 99723 39362 / +91 94801 64555";
  const sealText = (priest?.sealText as Record<string, string>)?.[code] || priest?.sealText?.kn || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಅಧಿಕೃತ ಮುದ್ರೆ";
  const sealSymbol = priest?.sealSymbol || "🕉️";

  // Active section data selection
  const isCustomTab = activeTab === "custom";
  const sectionData = !isCustomTab && result[activeTab] ? result[activeTab] : null;

  const sectionTitle = isCustomTab
    ? (code === "kn" ? "🎙️ ಸ್ವಂತ ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆ & ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ" : "Custom Personal Astrological Guidance")
    : (sectionData?.title[code] || sectionData?.title.kn || "");

  const narrativeText = isCustomTab
    ? (result.customQnA?.answer || "")
    : (sectionData?.narrativeText || "");

  const paragraphs = sanitizeAIText(narrativeText)
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div
      id="life-guidance-pdf-container"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "32px",
        boxSizing: "border-box",
        background: "#FFFDF7",
        fontFamily: "'Noto Sans Kannada', 'Tiro Kannada', 'Segoe UI', Roboto, sans-serif",
        color: "#451A03",
        position: "relative",
        fontSize: "12px",
        lineHeight: "1.65"
      }}
    >
      <div
        style={{
          width: "100%",
          border: "3px solid #D97706",
          borderRadius: "16px",
          padding: "24px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
            ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {code === "kn" ? "॥ ಬಗ್ಗೋಣ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ವರದಿ ॥" : "Baggona Hyper-Personalized Life Guidance Report"}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {code === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗಣನ ಪದ್ಧತಿ" : "Vedic Astrology & Planetary Guidance from Gokarna Kshetra"}
          </div>
        </div>

        {/* Person Info Card */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "6px" }}>
            👤 {code === "kn" ? "ಜಾತಕರ ವಿವರಗಳು" : "Devotee Details"}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
            {result.personName} ({result.gender})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", fontSize: "11.5px", color: "#92400E" }}>
            <div><strong>DOB:</strong> {result.dob}</div>
            <div><strong>TOB:</strong> {result.tob}</div>
            <div><strong>{code === "kn" ? "ರಾಶಿ:" : "Rashi:"}</strong> <span style={{ fontWeight: 800 }}>{result.rashi[code] || result.rashi.kn}</span></div>
            <div><strong>{code === "kn" ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> <span style={{ fontWeight: 800 }}>{result.nakshatra[code] || result.nakshatra.kn}</span></div>
          </div>
        </div>

        {/* Active Section Title Header */}
        <div style={{ background: "linear-gradient(90deg, #78350F 0%, #92400E 100%)", borderRadius: "10px", padding: "12px 18px", color: "#FDE68A", fontSize: "16px", fontWeight: 800 }}>
          {sectionTitle}
        </div>

        {/* Custom Question Heading (if custom tab) */}
        {isCustomTab && result.customQnA?.question && (
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "12px", fontSize: "12px", fontWeight: 800, color: "#78350F" }}>
            ❓ {code === "kn" ? "ಪ್ರಶ್ನೆ:" : "Question:"} {result.customQnA.question}
          </div>
        )}

        {/* Main Paragraphs (Rendered in clean distinct cards) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {paragraphs.map((para, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF",
                borderLeft: "4px solid #D97706",
                borderRadius: "10px",
                padding: "14px 16px",
                fontSize: "11.5px",
                color: "#451A03",
                lineHeight: "1.7",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <p style={{ margin: 0 }}>{para}</p>
            </div>
          ))}
        </div>

        {/* Key Ages & Favorable Directions (if standard tab) */}
        {sectionData && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
            <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "10px", padding: "10px 14px", fontSize: "11.5px", color: "#78350F" }}>
              <strong>🌟 {code === "kn" ? "ಪ್ರಮುಖ ವಯೋಮಾನ ಮೈಲಿಗಲ್ಲುಗಳು (Key Ages):" : "Key Age Milestones:"}</strong>{" "}
              <span style={{ fontWeight: 800 }}>{sectionData.keyAges.join(", ")} {code === "kn" ? "ವರ್ಷಗಳು" : "Years"}</span>
            </div>
            <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "10px", padding: "10px 14px", fontSize: "11.5px", color: "#78350F" }}>
              <strong>🧭 {code === "kn" ? "ಅನುಕೂಲಕರ ದಿಕ್ಪಾಲಕ ದಿಕ್ಕುಗಳು:" : "Favorable Directions:"}</strong>{" "}
              <span style={{ fontWeight: 800 }}>{sectionData.favorableDirections[code] || sectionData.favorableDirections.kn}</span>
            </div>
          </div>
        )}

        {/* SECTION 1: Daily Home Remedies (ಜಪ-ತಪ, ಮಂತ್ರ, ಧನದಾ ಸ್ತೋತ್ರ) */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "14px", marginTop: "6px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🌸</span>
            <span>{code === "kn" ? "ವಿಭಾಗ ೧: ದಿನನಿತ್ಯದ ಗೃಹ ಸಿದ್ಧ ಪೂಜಾ ಪರಿಹಾರಗಳು (ಜಪ, ತಪ & ಮಂತ್ರ):" : "Section 1: Daily Home Remedies (Mantra & Japa):"}</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.65", fontWeight: 600 }}>
            {sectionData
              ? (sectionData.recommendedRemedies[code] || sectionData.recommendedRemedies.kn)
              : (code === "kn" ? "ನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಧನ್ವಂತರಿ ಸೂಕ್ತ, ಗಾಯತ್ರೀ ಮಂತ್ರ ಹಾಗೂ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಶ್ರೇಷ್ಠ." : "Daily Dhanvantari and Gayatri Mantra recitation recommended.")}
          </div>
        </div>

        {/* SECTION 2: Gokarna Kshetra Special Puja / Homa (WHY, WHAT, HOW) */}
        <div style={{ background: "#FFFBEB", border: "2px solid #D97706", borderRadius: "10px", padding: "14px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
            🪔 {code === "kn" ? "ವಿಭಾಗ ೨: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ವಿಶೇಷ ವೈದಿಕ ಶಾಂತಿ & ಹೋಮ:" : "Section 2: Gokarna Kshetra Special Vedic Shanti & Homa:"}
          </div>
          <div style={{ fontSize: "11.5px", color: "#78350F", lineHeight: "1.65" }}>
            {code === "kn"
              ? "ಜಾತಕದ ಪಿತೃ ದೋಷ (ತ್ರಿಪಿಂಡೀ/ನಾರಾಯಣ ಬಲಿ), ಕಾಲಸರ್ಪ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಮಾಂದಿ ದೋಷಗಳಿಗೆ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸೇವೆ ನೆರವೇರಿಸುವುದರಿಂದ ಸಕಲ ಪಾಪ ಕರ್ಮಗಳು ಶಮನವಾಗಿ ಮಹಾ ಲಕ್ಷ್ಮೀ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ."
              : "Performing Narayana Bali, Tripindi Shraddha, Kalasarpa Shanti, Nagapratishtha & Kuja Shanti at Gokarna Mahabaleshwara Kshetra dissolves karmic obstructions and bestows divine grace."}
          </div>
        </div>

        {/* Dynamic Selected Priest Contact & Gokarna Seva Verification Footer */}
        <div
          style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "2px solid #F59E0B",
            borderRadius: "12px",
            padding: "14px 18px",
            textAlign: "center",
            marginTop: "6px"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
            {sealSymbol} {sealText}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
            ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
          </div>
          <div style={{ fontSize: "12px", color: "#FCD34D", fontWeight: 700, marginTop: "4px" }}>
            📞 {code === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
          </div>
          <div style={{ fontSize: "10.5px", color: "#FEF3C7", opacity: 0.9, marginTop: "4px", fontStyle: "italic" }}>
            {code === "kn" ? "ನಿಮ್ಮ ಜಾತಕದ ಪ್ರತ್ಯೇಕ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಪೂಜಾ ವಿವರಗಳಿಗೆ ನೇರವಾಗಿ ಅರ್ಚಕರನ್ನು ಮುಂಗಡವಾಗಿ ಸಂಪರ್ಕಿಸಿ." : "For specific Dosha Shanti & Puja booking, contact selected Priest directly."}
          </div>
        </div>
      </div>
    </div>
  );
};
