import React from "react";
import type { SankhyaShastraResult } from "../../features/sankhyashastra/sankhyaShastraEngine";

export type SankhyaShastraPdfTemplateProps = {
  result: SankhyaShastraResult;
  personName?: string;
  lang?: string;
};

export const SankhyaShastraPdfTemplate: React.FC<SankhyaShastraPdfTemplateProps> = ({
  result,
  personName = "ಶ್ರೀಯುತ ಭಕ್ತರು",
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);
  const isKn = code === "kn";

  const lagnaName = result.prashnaLagnaName[code] || result.prashnaLagnaName.en || result.prashnaLagnaName.kn;
  const rootRulerStr = result.rootRuler[code] || result.rootRuler.en || result.rootRuler.kn;

  return (
    <div
      id="sankhya-shastra-pdf-container"
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
      {/* Outer Gold Border */}
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
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {isKn ? "॥ ಬಗ್ಗೋಣ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ದೈವಿಕ ಪ್ರಶ್ನಾ ವರದಿ ॥" : "Baggona Sankhya Shastra Prashna Report"}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಸಂಖ್ಯಾ ಗಣಿತ ಹಾಗೂ ಪ್ರಾಚೀನ ಪ್ರಶ್ನಾ ಪದ್ಧತಿ" : "Authentic Vedic Numerology & Prashna Reading from Gokarna Kshetra"}
          </div>
        </div>

        {/* Prashna Input & Parameter Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          {/* Left Grid: Question & Devotee */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              👤 {isKn ? "ಭಕ್ತರ ಪ್ರಶ್ನೆ ವಿವರ" : "Devotee Question"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#78350F", marginBottom: "4px" }}>
              {isKn ? "ಭಕ್ತರು:" : "Devotee:"} {personName}
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.4" }}>
              <strong>{isKn ? "ಪ್ರಶ್ನೆ:" : "Query:"}</strong> "{result.formattedQuestion}"
            </div>
          </div>

          {/* Right Grid: Number & Lagna */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              🔢 {isKn ? "ಸಂಖ್ಯಾ ಗಣಿತ ವಿವರ" : "Numerology & Prashna Parameters"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{isKn ? "ಆಯ್ಕೆ ಸಂಖ್ಯೆ:" : "Chosen Number:"}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>{result.userNumber}</span></div>
              <div><strong>{isKn ? "ಮೂಲ ಸಂಖ್ಯೆ (Root):" : "Digital Root:"}</strong> {result.rootNumber} ({rootRulerStr})</div>
              <div><strong>{isKn ? "ಪ್ರಶ್ನಾ ಲಗ್ನ:" : "Prashna Lagna:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>{lagnaName} ({isKn ? `ಮನೆ ${result.prashnaLagnaHouse}` : `House ${result.prashnaLagnaHouse}`})</span></div>
            </div>
          </div>
        </div>

        {/* Prediction Content Card */}
        <div
          style={{
            flex: 1,
            background: "#FFFFFF",
            border: "2px solid #F59E0B",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "14px",
            boxShadow: "0 2px 6px rgba(180,83,9,0.06)"
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", borderBottom: "1.5px solid #FEF3C7", paddingBottom: "6px", marginBottom: "10px" }}>
            📜 {isKn ? "ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾ ಫಲ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ:" : "Sankhya Shastra Prashna Guidance:"}
          </div>
          <div
            style={{
              fontSize: "11.5px",
              color: "#78350F",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap"
            }}
          >
            {result.aiPrediction}
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
            "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಸಿದ್ಧ ಸಂಖ್ಯಾ ಪ್ರಕಾಶ · ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಃ"
          </div>
          <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)
          </div>
        </div>
      </div>
    </div>
  );
};
