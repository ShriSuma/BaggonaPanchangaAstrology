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
        display: "flex",
        flexDirection: "column",
        gap: "0",
        width: "794px",
        background: "#FFFFFF",
        color: "#451A03",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
    >
      {/* PAGE 1: Deceased Details, 1-12 Day Antyesti Roadmap & Dosha Shanti */}
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

          {/* Deceased Summary Card */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "4px" }}>
              👤 {result.personName}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "10.5px", color: "#92400E" }}>
              <div><strong>{code === "kn" ? "ಮರಣ ದಿನಾಂಕ:" : "Demise Date:"}</strong> <span style={{ fontWeight: 800, color: "#991B1B" }}>{result.demiseDate}</span></div>
              {result.demiseTime && <div><strong>{code === "kn" ? "ಮರಣ ಸಮಯ:" : "Demise Time:"}</strong> {result.demiseTime}</div>}
              <div><strong>{code === "kn" ? "ಸ್ಥಳ:" : "Location:"}</strong> {result.location}</div>
              <div><strong>{code === "kn" ? "ಮರಣ ತಿಥಿ:" : "Demise Tithi:"}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.demiseTithi[code] || result.demiseTithi.kn}</span></div>
              <div><strong>{code === "kn" ? "ಮರಣ ನಕ್ಷತ್ರ:" : "Demise Nakshatra:"}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.demiseNakshatra[code] || result.demiseNakshatra.kn}</span></div>
              <div><strong>{code === "kn" ? "ಪಕ್ಷ:" : "Paksha:"}</strong> <span style={{ fontWeight: 800, color: "#78350F" }}>{result.demisePaksha[code] || result.demisePaksha.kn}</span></div>
            </div>
          </div>

          {/* 1-12 Days Antyesti Roadmap Compact Grid */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "8px", flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              🕯️ {code === "kn" ? "೧ ರಿಂದ ೧೨ ದಿನಗಳ ಆಶೌಚ & ನಿತ್ಯ ಸಂಸ್ಕಾರ ವಿಧಿ (Antyesti Roadmap):" : "1-12 Days Antyesti & Purification Roadmap:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {result.antyestiRoadmap.slice(0, 10).map((day) => (
                <div key={day.dayNumber} style={{ background: "#FFFDF7", border: "1px solid #FCD34D", borderRadius: "6px", padding: "4px 6px", fontSize: "9.5px" }}>
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    D{day.dayNumber}: {day.dayTitle[code] || day.dayTitle.kn}
                  </div>
                  <div style={{ color: "#451A03", marginTop: "1px" }}>
                    {day.rituals[code] || day.rituals.kn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dosha & Shanti Poojas */}
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 10px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
              🔱 {code === "kn" ? "ಮರಣ ದೋಷ & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಶಾಂತಿ ಪೂಜೆಗಳು:" : "Demise Dosha & Gokarna Shanti Remedies:"}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
              {sanitizeAIText(result.doshaAnalysis.doshaSummary[code] || result.doshaAnalysis.doshaSummary.kn)}
            </div>
          </div>

          {/* Footer Page 1 */}
          <div style={{ textAlign: "center", fontSize: "9px", color: "#92400E", marginTop: "6px" }}>
            ಪುಟ ೧ / ೨ · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ · ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)
          </div>
        </div>
      </div>

      {/* PAGE 2: Monthly Masika Schedule, Asthi Visarjana & Garuda Purana */}
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
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>
              📅 {code === "kn" ? `ಮಾಸಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ ದಿನಾಂಕಗಳ ಕೋಷ್ಟಕ (${result.yearsCount} ವರ್ಷಗಳು)` : `Monthly Masika Schedule (${result.yearsCount} Years)`}
            </div>
          </div>

          {/* Masika Schedule Grid */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "8px", marginBottom: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
              {result.masikaSchedule.slice(0, 24).map((item) => (
                <div
                  key={item.monthIndex}
                  style={{
                    background: item.isVarshikaShraddha ? "#FEF3C7" : "#FFFDF7",
                    border: item.isVarshikaShraddha ? "1.5px solid #D97706" : "1px solid #FCD34D",
                    borderRadius: "5px",
                    padding: "4px 6px",
                    fontSize: "9px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: item.isVarshikaShraddha ? "#92400E" : "#78350F" }}>
                    {item.masikaName[code] || item.masikaName.kn}
                  </div>
                  <div style={{ color: "#065F46", fontWeight: 800, fontSize: "9.5px" }}>
                    📆 {item.formattedDateStr[code] || item.formattedDateStr.kn}
                  </div>
                  <div style={{ fontSize: "8.5px", color: "#92400E" }}>
                    ({item.dayOfWeek[code] || item.dayOfWeek.kn})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asthi Visarjana Guide Card */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
              🌊 {code === "kn" ? "ಅಸ್ಥಿ ವಿಸರ್ಜನೆ & ಪವಿತ್ರ ತೀರ್ಥ ಕ್ಷೇತ್ರಗಳು:" : "Asthi Visarjana & Sacred Tirthas:"}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
              {result.asthiGuide.optimalTiming[code] || result.asthiGuide.optimalTiming.kn}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#78350F", marginTop: "3px" }}>
              {result.asthiGuide.mantra}
            </div>
          </div>

          {/* Garuda Purana Wisdom */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "8px 10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
              📜 {code === "kn" ? "ಗರುಡ ಪುರಾಣ ಸಾರ & ಪಿತೃ ಮೋಕ್ಷ ತತ್ವ:" : "Garuda Purana Wisdom on Soul's Liberation:"}
            </div>
            <div style={{ fontSize: "9.5px", color: "#451A03", lineHeight: "1.4" }}>
              {result.garudaWisdom.mokshaPhilosophy[code] || result.garudaWisdom.mokshaPhilosophy.kn}
            </div>
          </div>

          {/* Footer Card with Priest Shreeram Pandit Contact */}
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
              ನಾರಾಯಣಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ, ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಹಾಗೂ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆಗಳಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
