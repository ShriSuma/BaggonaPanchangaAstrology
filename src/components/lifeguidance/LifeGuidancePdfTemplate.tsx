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
  const priestPhone = "+91 99723 39362"; // Strictly single contact number per user mandate
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
        display: "flex",
        flexDirection: "column",
        background: "#FFFDF7",
        fontFamily: "'Noto Sans Kannada', 'Tiro Kannada', 'Kaveri', 'Segoe UI', Roboto, sans-serif",
        color: "#451A03"
      }}
    >
      {/* ================= PAGE 1 ================= */}
      <div
        style={{
          width: "794px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1075px",
            border: "3px solid #D97706",
            borderRadius: "16px",
            padding: "20px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", letterSpacing: "0.5px" }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "4px 0 2px 0" }}>
              {code === "kn" ? "॥ ಬಗ್ಗೋಣ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ವರದಿ (ಭಾಗ ೧) ॥" : "Baggona Life Guidance Report (Part 1)"}
            </h1>
            <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
              {code === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗಣನ ಪದ್ಧತಿ" : "Vedic Astrology & Planetary Guidance from Gokarna Kshetra"}
            </div>
          </div>

          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              👤 {code === "kn" ? "ಜಾತಕರ ವಿವರಗಳು" : "Devotee Details"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
              {result.personName} ({result.gender})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", fontSize: "12px", color: "#92400E" }}>
              <div><strong>DOB:</strong> {result.dob}</div>
              <div><strong>TOB:</strong> {result.tob}</div>
              <div><strong>{code === "kn" ? "ರಾಶಿ:" : "Rashi:"}</strong> <span style={{ fontWeight: 800 }}>{result.rashi[code] || result.rashi.kn}</span></div>
              <div><strong>{code === "kn" ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> <span style={{ fontWeight: 800 }}>{result.nakshatra[code] || result.nakshatra.kn}</span></div>
            </div>
          </div>

          {/* Active Section Title */}
          <div style={{ background: "linear-gradient(90deg, #78350F 0%, #92400E 100%)", borderRadius: "10px", padding: "10px 16px", color: "#FDE68A", fontSize: "15px", fontWeight: 800 }}>
            {sectionTitle}
          </div>

          {/* Paragraphs - Large, readable fonts (12px), 1.6 line height */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {paragraphs.map((para, idx) => (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  borderLeft: "4px solid #D97706",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "12px",
                  color: "#451A03",
                  lineHeight: "1.6",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}
              >
                <p style={{ margin: 0 }}>{para}</p>
              </div>
            ))}
          </div>

          {/* Key Ages & Favorable Directions */}
          {sectionData && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "10px", padding: "8px 12px", fontSize: "11.5px", color: "#78350F" }}>
                <strong>🌟 {code === "kn" ? "ಪ್ರಮುಖ ವಯೋಮಾನ ಮೈಲಿಗಲ್ಲುಗಳು:" : "Key Age Milestones:"}</strong>{" "}
                <span style={{ fontWeight: 800 }}>{sectionData.keyAges.join(", ")} {code === "kn" ? "ವರ್ಷಗಳು" : "Years"}</span>
              </div>
              <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "10px", padding: "8px 12px", fontSize: "11.5px", color: "#78350F" }}>
                <strong>🧭 {code === "kn" ? "ಅನುಕೂಲಕರ ದಿಕ್ಪಾಲಕ ದಿಕ್ಕುಗಳು:" : "Favorable Directions:"}</strong>{" "}
                <span style={{ fontWeight: 800 }}>{sectionData.favorableDirections[code] || sectionData.favorableDirections.kn}</span>
              </div>
            </div>
          )}

          {/* Page 1 Archaka Footer */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "12px",
              padding: "12px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              {sealSymbol} {sealText}
            </div>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#FFFFFF", marginTop: "3px" }}>
              ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
            </div>
            <div style={{ fontSize: "12px", color: "#FCD34D", fontWeight: 700, marginTop: "3px" }}>
              📞 {code === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div
        style={{
          width: "794px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1075px",
            border: "3px solid #D97706",
            borderRadius: "16px",
            padding: "20px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Page 2 Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", letterSpacing: "0.5px" }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಸಿದ್ಧ ಪೂಜಾ & ಅರ್ಚಕಾಶೀರ್ವಚನ (ಭಾಗ ೨) ॥
            </div>
            <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", margin: "4px 0 2px 0" }}>
              {code === "kn" ? "॥ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ವೈದಿಕ ಶಾಂತಿ, ಹೋಮ & ಆಶೀರ್ವಚನ ॥" : "Gokarna Vedic Blessings, Remedies & Puja Guide"}
            </h1>
            <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
              {code === "kn" ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯ ದಿವ್ಯ ಅನುಗ್ರಹ ಸಿದ್ಧಿ" : "Divine Grace from Sri Gokarna Mahabaleshwara Atmalinga Kshetra"}
            </div>
          </div>

          {/* Section 1: Archakashirvachan */}
          <div style={{ background: "#FFFFFF", border: "2px solid #F59E0B", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🚩</span>
              <span>{code === "kn" ? "೧. ಶ್ರೀ ಗೋಕರ್ಣ ವೈದಿಕ ಅರ್ಚಕಾಶೀರ್ವಚನ (Vedic Blessing):" : "1. Gokarna Vedic Archaka Blessing:"}</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#451A03", lineHeight: "1.7", fontWeight: 500 }}>
              {code === "kn"
                ? `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಹಾಗೂ ಶ್ರೀ ತಾಮ್ರಗೌರೀ ಅಂಬಾಜಿಯವರ ಸನ್ನಿಧಿಯಿಂದ ಜಾತಕರಾದ ${result.personName} (${result.rashi.kn} ರಾಶಿ, ${result.nakshatra.kn} ನಕ್ಷತ್ರ) ಅವರ ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು, ಆರಿಷ್ಟಗಳು ಹಾಗೂ ಕಾಯಿಕ-ಮಾನಸಿಕ ಸಂಕಟಗಳು ಶಮನವಾಗಿ, ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಉದ್ಯೋಗ ವೃದ್ಧಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಕೃಪಾಕಟಾಕ್ಷ ಸದಾ ಲಭಿಸಲೆಂದು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವೇದ ವೈದಿಕರಿಂದ ಹಾರ್ದಿಕ ಆಶೀರ್ವಚನ ಪ್ರಾರ್ಥನೆಗಳು.`
                : `May Sri Gokarna Mahabaleshwara Swami and Goddess Tamragauri bestow divine grace, health, longevity, and prosperity upon ${result.personName}. May all planetary afflictions in your natal birth chart be dissolved.`}
            </div>
          </div>

          {/* Section 2: Daily Home Remedies (Japa/Mantra) */}
          <div style={{ background: "#FFFFFF", border: "2px solid #F59E0B", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🌸</span>
              <span>{code === "kn" ? "೨. ಜಾತಕಾನುಸಾರ ಗೃಹ ಸಿದ್ಧ ಪೂಜಾ ಪರಿಹಾರಗಳು (Daily Home Remedies):" : "2. Personalized Daily Home Remedies:"}</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#92400E", lineHeight: "1.7", fontWeight: 600 }}>
              {sectionData
                ? (sectionData.recommendedRemedies[code] || sectionData.recommendedRemedies.kn)
                : (code === "kn" ? "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಧನ್ವಂತರಿ ಸ್ತೋತ್ರ ಪಠಣ, ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಚಾಕ್ಷರಿ (ಓಂ ನಮಃ ಶಿವಾಯ) ೧೦೮ ಬಾರಿ ಜಪಿಸುವುದು ಉತ್ತೋತ್ತಮ." : "Daily Dhanvantari and Gayatri Mantra recitation with Shiva Panchakshari Japa recommended.")}
            </div>
          </div>

          {/* Section 3: Gokarna Kshetra Special Puja / Homa (WHY, WHAT, HOW) */}
          {(() => {
            const pujaDetail = sectionData?.gokarnaPujaDetail;
            const pujaName = pujaDetail?.pujaName?.[code] || pujaDetail?.pujaName?.kn || (code === "kn" ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ವಿಶೇಷ ವೈದಿಕ ಶಾಂತಿ & ಮಹಾ ರುದ್ರ ಹವನ" : "Gokarna Special Vedic Shanti & Rudra Homa");
            const whyText = pujaDetail?.whyRequired?.[code] || pujaDetail?.whyRequired?.kn || (code === "kn" ? "ಜಾತಕದ ಪಿತೃ ದೋಷ, ಕಾಲಸರ್ಪ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಕುಜ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸೇವೆ ಅತ್ಯಗತ್ಯ." : "Required for natal Pitru, Kalasarpa, Nagapratishtha, Kuja & Maandi Dosha removal.");
            const whatText = pujaDetail?.whatSignificance?.[code] || pujaDetail?.whatSignificance?.kn || (code === "kn" ? "ಗೋಕರ್ಣವು ಸಿದ್ಧ ಮುಕ್ತಿ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿನ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸುವ ಹೋಮ ಕೃತ್ಯದಿಂದ ಶಾಪಗಳು ವಿಮೋಚನೆಯಾಗಲಿವೆ." : "Gokarna Atmalinga Sthala holds divine Vedic power for ancestral liberation and karma dissolution.");
            const howText = pujaDetail?.howTransforms?.[code] || pujaDetail?.howTransforms?.kn || (code === "kn" ? "ಸಕಲ ಪ್ರತಿಬಂಧಕಗಳು ದೂರವಾಗಿ ಉದ್ಯೋಗ ಪ್ರಗತಿ, ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ." : "Dissolves life hurdles, granting career promotion, marital joy, progeny bliss, and prosperity.");

            return (
              <div style={{ background: "#FFFBEB", border: "2.5px solid #D97706", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
                  🪔 {pujaName}
                </div>
                <div style={{ fontSize: "11.5px", color: "#78350F", lineHeight: "1.65" }}>
                  <div style={{ marginBottom: "5px" }}>
                    <strong style={{ color: "#92400E" }}>{code === "kn" ? "• ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ (ಯಾಕೆ ಬೇಕು / WHY Required?):" : "• Kundli Analysis (WHY Required?):"}</strong>{" "}
                    {whyText}
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <strong style={{ color: "#92400E" }}>{code === "kn" ? "• ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ವೈಶಿಷ್ಟ್ಯ (ಮಹತ್ತ್ವವೇನು / WHAT Significance?):" : "• Kshetra Significance (WHAT Significance?):"}</strong>{" "}
                    {whatText}
                  </div>
                  <div>
                    <strong style={{ color: "#92400E" }}>{code === "kn" ? "• ಪೂಜಾನಂತರ ದಕ್ಕುವ ಸಿದ್ಧಿ (ಪರಿಣಾಮವೇನು / HOW it Transforms?):" : "• Life Transformation (HOW it Transforms?):"}</strong>{" "}
                    {howText}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Page 2 Dedicated Archaka Verification & Single Contact Footer */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "12px",
              padding: "14px 18px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              {sealSymbol} {sealText}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
              ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
            </div>
            <div style={{ fontSize: "12.5px", color: "#FCD34D", fontWeight: 700, marginTop: "4px" }}>
              📞 {code === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
            </div>
            <div style={{ fontSize: "10.5px", color: "#FEF3C7", opacity: 0.95, marginTop: "4px", fontStyle: "italic" }}>
              {code === "kn" ? "ನಿಮ್ಮ ಜಾತಕದ ಪ್ರತ್ಯೇಕ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ವೈದಿಕ ಪೂಜಾ ಸಂಕಲ್ಪ ವಿವರಗಳಿಗೆ ನೇರವಾಗಿ ಅರ್ಚಕರನ್ನು ಸಂಪರ್ಕಿಸಿ." : "For specific Dosha Shanti & Puja booking, contact Priest directly at +91 99723 39362."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
