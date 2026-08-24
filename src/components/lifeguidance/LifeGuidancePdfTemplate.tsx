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

        {/* Footer */}
        <div
          style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "10px 14px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#FEF3C7" }}>
            "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ದೈವಿಕ ಜೀವನ ರಕ್ಷಾ · ಸಕಲ ದೋಷ ಶಮನಂ"
          </div>
          <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)
          </div>
        </div>
      </div>
    </div>
  );
};
