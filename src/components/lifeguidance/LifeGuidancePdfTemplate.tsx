import React from "react";
import type { LifeGuidanceResult } from "../../features/lifeguidance/lifeGuidanceEngine";
import { sanitizeAIText } from "../../utils/textFormatter";

export type LifeGuidancePdfTemplateProps = {
  result: LifeGuidanceResult;
  lang?: string;
};

export const LifeGuidancePdfTemplate: React.FC<LifeGuidancePdfTemplateProps> = ({
  result,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  return (
    <div
      id="life-guidance-pdf-container"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "24px",
        boxSizing: "border-box",
        background: "#FFFDF7",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#451A03",
        position: "relative"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          border: "3px solid #D97706",
          borderRadius: "12px",
          padding: "20px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
            ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {code === "kn" ? "॥ ಬಗ್ಗೋಣ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ವರದಿ ॥" : "Baggona Hyper-Personalized Life Guidance Report"}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {code === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗಣನ ಪದ್ಧತಿ" : "Vedic Astrology & Planetary Guidance from Gokarna Kshetra"}
          </div>
        </div>

        {/* Person Info Card */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
            👤 {code === "kn" ? "ಜಾತಕರ ವಿವರಗಳು" : "Devotee Details"}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
            {result.personName} ({result.gender})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", fontSize: "11px", color: "#92400E" }}>
            <div><strong>DOB:</strong> {result.dob}</div>
            <div><strong>TOB:</strong> {result.tob}</div>
            <div><strong>{code === "kn" ? "ರಾಶಿ:" : "Rashi:"}</strong> <span style={{ fontWeight: 800 }}>{result.rashi[code] || result.rashi.kn}</span></div>
            <div><strong>{code === "kn" ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> <span style={{ fontWeight: 800 }}>{result.nakshatra[code] || result.nakshatra.kn}</span></div>
          </div>
        </div>

        {/* 4 Life Guidance Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px", flex: 1 }}>
          {/* Section 1: Career */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              {result.career.title[code] || result.career.title.kn}
            </div>
            <div style={{ fontSize: "10.5px", color: "#78350F", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>
              {sanitizeAIText(result.career.narrativeText)}
            </div>
          </div>

          {/* Section 2: Relationship */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              {result.relationship.title[code] || result.relationship.title.kn}
            </div>
            <div style={{ fontSize: "10.5px", color: "#78350F", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>
              {sanitizeAIText(result.relationship.narrativeText)}
            </div>
          </div>

          {/* Section 3: Health */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              {result.health.title[code] || result.health.title.kn}
            </div>
            <div style={{ fontSize: "10.5px", color: "#78350F", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>
              {sanitizeAIText(result.health.narrativeText)}
            </div>
          </div>

          {/* Section 4: Children */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              {result.children.title[code] || result.children.title.kn}
            </div>
            <div style={{ fontSize: "10.5px", color: "#78350F", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>
              {sanitizeAIText(result.children.narrativeText)}
            </div>
          </div>
        </div>

        {/* Section 5: Custom Q&A Answer (if present) */}
        {result.customQnA && (
          <div style={{ background: "#FFFFFF", border: "2px solid #D97706", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              🎙️ {code === "kn" ? "ಸ್ವಂತ ಪ್ರಶ್ನೆ ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ & ಪರಿಹಾರ:" : "Custom Question & Astrological Remedies:"}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              ❓ {result.customQnA.question}
            </div>
            <div style={{ fontSize: "10.5px", color: "#78350F", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
              {sanitizeAIText(result.customQnA.answer)}
            </div>
          </div>
        )}

        {/* Priest Contact & Gokarna Seva Verification Footer */}
        <div
          style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "2px solid #F59E0B",
            borderRadius: "10px",
            padding: "12px 16px",
            textAlign: "center",
            marginTop: "12px"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
            🔱 {code === "kn" ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ನೇರ ಪೂಜಾ ಸಂಪರ್ಕ:" : "Gokarna Kshetra Chief Archaka Direct Contact:"}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF", marginTop: "3px" }}>
            {code === "kn" ? "ವೇ|| ಮೂ|| ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಪ್ರಧಾನ ಅರ್ಚಕರು) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು" : "Veda Murthy Sri Shreeram Pandit (Chief Archaka) · Baggona Panchanga Author"}
          </div>
          <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 700, marginTop: "3px" }}>
            📞 {code === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} +91 99723 39362 / +91 94801 64555
          </div>
          <div style={{ fontSize: "10px", color: "#FEF3C7", opacity: 0.9, marginTop: "3px", fontStyle: "italic" }}>
            {code === "kn" ? "ನಿಮ್ಮ ಜಾತಕದ ಪಿತೃ ದೋಷ, ಕಾಲಸರ್ಪ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಸೇವೆಗಳಿಗೆ ಮುಂಗಡವಾಗಿ ಸಂಪರ್ಕಿಸಿ." : "For Pitru Dosha, Kalasarpa Shanti, Nagapratishtha & Narayana Bali, contact Chief Priest directly."}
          </div>
        </div>
      </div>
    </div>
  );
};
