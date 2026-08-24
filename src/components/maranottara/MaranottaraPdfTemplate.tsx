import React from "react";
import type { MaranottaraResult } from "../../features/maranottara/maranottaraEngine";
import { sanitizeAIText } from "../../utils/textFormatter";

export type MaranottaraPdfTemplateProps = {
  result: MaranottaraResult;
  lang?: string;
};

export const MaranottaraPdfTemplate: React.FC<MaranottaraPdfTemplateProps> = ({
  result,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  const headerTitle = code === "kn" ? "॥ ಬಗ್ಗೋಣ ಮರಣೋತ್ತರ ಹಾಗೂ ಶ್ರಾದ್ಧ ಮಾಸಿಕ ದೈವಿಕ ವರದಿ ॥" : "Baggona Maranottara & Shraddha Masika Report";
  const headerSub = code === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಧರ್ಮಶಾಸ್ತ್ರೋಕ್ತ ಸಿದ್ಧ ಶ್ರಾದ್ಧ ತಿಥಿ ಗಣನ ಪದ್ಧತಿ" : "Authentic Vedic Shraddha Tithi & Demise Dosha Calculation from Gokarna Kshetra";

  return (
    <div
      id="maranottara-pdf-container"
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
        {/* Top Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
            ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {headerTitle}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {headerSub}
          </div>
        </div>

        {/* Deceased Info Card */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
            👤 {code === "kn" ? "ಮೃತರ ವಿವರಗಳು & ಮರಣ ತಿಥಿ ಸನ್ನಿವೇಶ" : "Deceased Person & Demise Tithi Details"}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
            {result.personName}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "11.5px", color: "#92400E" }}>
            <div><strong>{code === "kn" ? "ಮರಣ ದಿನಾಂಕ:" : "Demise Date:"}</strong> <span style={{ fontWeight: 800, color: "#991B1B" }}>{result.demiseDate}</span></div>
            {result.demiseTime && <div><strong>{code === "kn" ? "ಮರಣ ಸಮಯ:" : "Demise Time:"}</strong> {result.demiseTime}</div>}
            <div><strong>{code === "kn" ? "ಸ್ಥಳ / ಪಿನ್ ಕೋಡ್:" : "Location:"}</strong> {result.location}</div>
            <div><strong>{code === "kn" ? "ಮರಣ ತಿಥಿ:" : "Demise Tithi:"}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.demiseTithi[code] || result.demiseTithi.kn}</span></div>
            <div><strong>{code === "kn" ? "ಮರಣ ನಕ್ಷತ್ರ:" : "Demise Nakshatra:"}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.demiseNakshatra[code] || result.demiseNakshatra.kn}</span></div>
            <div><strong>{code === "kn" ? "ಲೆಕ್ಕಾಚಾರ ಅವಧಿ:" : "Duration:"}</strong> <span style={{ fontWeight: 800, color: "#78350F" }}>{result.yearsCount} {code === "kn" ? "ವರ್ಷ (ವರ್ಷಗಳು)" : "Year(s)"}</span></div>
          </div>
        </div>

        {/* AI Spiritual Consolation Card */}
        {result.aiConsolationText && (
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              🕉️ {code === "kn" ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಧರ್ಮಜ್ಞ ದೈವಿಕ ಸದ್ಗತಿ ಸಂದೇಶ & ಮಂತ್ರ:" : "Gokarna Spiritual Consolation & Guidance:"}
            </div>
            <div style={{ fontSize: "11px", color: "#78350F", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
              {sanitizeAIText(result.aiConsolationText)}
            </div>
          </div>
        )}

        {/* Masika Schedule Table Card */}
        <div style={{ background: "#FFFFFF", border: "2px solid #F59E0B", borderRadius: "10px", padding: "14px", marginBottom: "14px", flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", borderBottom: "1.5px solid #FEF3C7", paddingBottom: "6px", marginBottom: "10px" }}>
            📅 {code === "kn" ? "ಮಾಸಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ ದಿನಾಂಕಗಳ ಪಟ್ಟಿ (Masika & Shraddha Dates):" : "Monthly Masika & Shraddha Schedule Table:"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
            {result.masikaSchedule.map((item) => (
              <div
                key={item.monthIndex}
                style={{
                  background: item.isVarshikaShraddha ? "#FEF3C7" : "#FFFDF7",
                  border: item.isVarshikaShraddha ? "1.5px solid #D97706" : "1px solid #FCD34D",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "11px"
                }}
              >
                <div style={{ fontWeight: 800, color: item.isVarshikaShraddha ? "#92400E" : "#78350F", marginBottom: "2px" }}>
                  {item.masikaName[code] || item.masikaName.kn}
                </div>
                <div style={{ color: "#065F46", fontWeight: 800 }}>
                  📆 {item.formattedDateStr[code] || item.formattedDateStr.kn} ({item.dayOfWeek[code] || item.dayOfWeek.kn})
                </div>
                <div style={{ fontSize: "10px", color: "#92400E", marginTop: "2px" }}>
                  <strong>{code === "kn" ? "ತಿಥಿ:" : "Tithi:"}</strong> {item.tithiName[code] || item.tithiName.kn} · {item.paksha[code] || item.paksha.kn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dosha & Shanti Poojas Card */}
        {result.doshaAnalysis && (
          <div style={{ background: "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              🔱 {code === "kn" ? "ಮರಣ ಸಮಯ ದೋಷ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಶಾಂತಿ ಪೂಜೆ ನಿವಾರಣೆ:" : "Demise Time Dosha & Gokarna Shanti Remedies:"}
            </div>
            <div style={{ fontSize: "11px", color: "#92400E", lineHeight: "1.5" }}>
              <div><strong>{code === "kn" ? "ದೋಷ ಸೂಚನೆ:" : "Dosha Status:"}</strong> {sanitizeAIText(result.doshaAnalysis.doshaSummary[code] || result.doshaAnalysis.doshaSummary.kn)}</div>
              {result.doshaAnalysis.recommendedPoojas.map((pooja, idx) => (
                <div key={idx} style={{ marginTop: "4px", background: "#FFFFFF", padding: "6px 8px", borderRadius: "6px", border: "1px solid #F59E0B" }}>
                  <strong style={{ color: "#78350F" }}>{pooja.title[code] || pooja.title.kn}:</strong> {pooja.description[code] || pooja.description.kn}
                  <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px" }}>
                    <strong>{code === "kn" ? "ದಾನ ಪದಾರ್ಥಗಳು:" : "Recommended Dana:"}</strong> {pooja.danaItems[code] || pooja.danaItems.kn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಪಿತೃ ತರ್ಪಣ ರಕ್ಷಾ · ಸಕಲ ಪಿತ್ರಾರಿಷ್ಟ ಶಮನಂ"
          </div>
          <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)
          </div>
        </div>
      </div>
    </div>
  );
};
