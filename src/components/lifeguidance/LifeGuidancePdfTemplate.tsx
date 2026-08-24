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
  const isKn = code === "kn";
  const priestName = (priest?.name as Record<string, string>)?.[code] || priest?.name?.kn || "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const priestTitle = (priest?.title as Record<string, string>)?.[code] || priest?.title?.kn || "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು";
  const priestPhone = "+91 99723 39362"; // Strictly single contact number
  const sealText = (priest?.sealText as Record<string, string>)?.[code] || priest?.sealText?.kn || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಅಧಿಕೃತ ಮುದ್ರೆ";
  const sealSymbol = priest?.sealSymbol || "🕉️";

  // Active section data selection
  const isCustomTab = activeTab === "custom";
  const sectionData = !isCustomTab && result[activeTab] ? result[activeTab] : null;

  const sectionTitle = isCustomTab
    ? (isKn ? "🎙️ ಸ್ವಂತ ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆ & ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ" : "Custom Personal Astrological Guidance")
    : (sectionData?.title[code] || sectionData?.title.kn || "");

  const narrativeText = isCustomTab
    ? (result.customQnA?.answer || "")
    : (sectionData?.narrativeText || "");

  const paragraphs = sanitizeAIText(narrativeText)
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const rashiStr = result.rashi[code] || result.rashi.kn;
  const nakshatraStr = result.nakshatra[code] || result.nakshatra.kn;
  const lagnaStr = result.lagna[code] || result.lagna.kn;
  const dashaStr = result.dasha[code] || result.dasha.kn;

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
      {/* ================= PAGE 1: DEEP PREDICTION NARRATIVE ================= */}
      <div
        style={{
          width: "794px",
          height: "1123px",
          padding: "20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1083px",
            border: "3.5px double #B45309",
            borderRadius: "16px",
            padding: "18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 60%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #78350F 0%, #451A03 50%, #78350F 100%)",
              borderRadius: "12px",
              padding: "10px 14px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#FDE68A", letterSpacing: "1px" }}>
              ॥ 🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ 🕉️ ॥
            </div>
            <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 2px 0", letterSpacing: "0.5px" }}>
              {isKn ? "॥ ಬಗ್ಗೋಣ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ವರದಿ (ಭಾಗ ೧) ॥" : "Baggona Hyper-Personalized Life Guidance Report (Part 1)"}
            </h1>
            <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 600 }}>
              {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗಣನ ಪದ್ಧತಿ" : "Vedic Astrology & Planetary Guidance from Gokarna Kshetra"}
            </div>
          </div>

          {/* Devotee Info Card */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>
              👤 {isKn ? "ಜಾತಕರ ಕುಂಡಲಿ ವಿವರಗಳು" : "Devotee Natal Parameters"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
              {result.personName} ({result.gender})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", fontSize: "11.5px", color: "#92400E" }}>
              <div><strong>DOB:</strong> {result.dob}</div>
              <div><strong>TOB:</strong> {result.tob}</div>
              <div><strong>{isKn ? "ರಾಶಿ:" : "Rashi:"}</strong> <span style={{ fontWeight: 800 }}>{rashiStr}</span></div>
              <div><strong>{isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> <span style={{ fontWeight: 800 }}>{nakshatraStr}</span></div>
            </div>
          </div>

          {/* Active Section Title Header */}
          <div style={{ background: "linear-gradient(90deg, #78350F 0%, #92400E 100%)", borderLeft: "5px solid #F59E0B", borderRadius: "8px", padding: "9px 14px", color: "#FDE68A", fontSize: "14.5px", fontWeight: 800 }}>
            {sectionTitle}
          </div>

          {/* Main Narrative Paragraphs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {paragraphs.map((para, idx) => (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  borderLeft: "4px solid #D97706",
                  borderTop: "1px solid #FEF3C7",
                  borderRight: "1px solid #FEF3C7",
                  borderBottom: "1px solid #FEF3C7",
                  borderRadius: "10px",
                  padding: "11px 15px",
                  fontSize: "11.5px",
                  color: "#451A03",
                  lineHeight: "1.65",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}
              >
                <p style={{ margin: 0 }}>{para}</p>
              </div>
            ))}
          </div>

          {/* Key Ages & Favorable Directions */}
          {sectionData && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "8px 12px", fontSize: "11px", color: "#78350F" }}>
                <strong>🌟 {isKn ? "ಪ್ರಮುಖ ವಯೋಮಾನ ಮೈಲಿಗಲ್ಲುಗಳು:" : "Key Age Milestones:"}</strong>{" "}
                <span style={{ fontWeight: 800 }}>{sectionData.keyAges.join(", ")} {isKn ? "ವರ್ಷಗಳು" : "Years"}</span>
              </div>
              <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "8px 12px", fontSize: "11px", color: "#78350F" }}>
                <strong>🧭 {isKn ? "ಅನುಕೂಲಕರ ದಿಕ್ಪಾಲಕ ದಿಕ್ಕುಗಳು:" : "Favorable Directions:"}</strong>{" "}
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
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              {sealSymbol} {sealText}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
              ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
            </div>
            <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 700, marginTop: "2px" }}>
              📞 {isKn ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: DASHA BHUKTI, GOCHARA & GOKARNA SEVA GUIDE ================= */}
      <div
        style={{
          width: "794px",
          height: "1123px",
          padding: "20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1083px",
            border: "3.5px double #B45309",
            borderRadius: "16px",
            padding: "18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 60%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Page 2 Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #78350F 0%, #451A03 50%, #78350F 100%)",
              borderRadius: "12px",
              padding: "10px 14px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              ॥ 🚩 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಸಿದ್ಧ ಪೂಜಾ, ದಶಾ ಫಲ & ಅರ್ಚಕಾಶೀರ್ವಚನ (ಭಾಗ ೨) 🚩 ॥
            </div>
            <h1 style={{ fontSize: "18.5px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 2px 0" }}>
              {isKn ? "॥ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ವೈದಿಕ ಶಾಂತಿ, ಹೋಮ & ದಶಾ ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ ॥" : "Gokarna Vedic Blessings, Dasha Bhukti & Puja Guide"}
            </h1>
            <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 600 }}>
              {isKn ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯ ದಿವ್ಯ ಅನುಗ್ರಹ ಸಿದ್ಧಿ" : "Divine Grace from Sri Gokarna Mahabaleshwara Atmalinga Kshetra"}
            </div>
          </div>

          {/* Block 1: Dasha Bhukti & Gochara Transit Analysis */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🔮</span>
              <span>{isKn ? "೧. ಪ್ರಸ್ತುತ ದಶಾ ಭುಕ್ತಿ ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರ ಫಲ ವಿಶ್ಲೇಷಣೆ:" : "1. Current Dasha Bhukti & Planetary Transit Analysis:"}</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#451A03", lineHeight: "1.65" }}>
              {isKn
                ? `ನಿಮ್ಮ ಜನನ ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ${dashaStr} ಚಲಿಸುತ್ತಿದ್ದು, ${rashiStr} ಹಾಗೂ ${nakshatraStr} ನಕ್ಷತ್ರ ಜಾತಕದ ಮೇಲಿರುವ ಶನಿ, ಗುರು ಹಾಗೂ ರಾಹು ಗ್ರಹಗಳ ಗೋಚಾರ ಬಲವು ಮಧ್ಯಮ ಫಲಗಳನ್ನು ನೀಡಲಿದೆ. ದಶಮಾಧಿಪತಿ ಹಾಗೂ ಶುಭ ಗ್ರಹಗಳ ದಿವ್ಯ ಬಲದಿಂದ ಧನ ಯೋಗ ಹಾಗೂ ಕುಟುಂಬ ಕ್ಷೇಮ ಲಭಿಸಲಿದೆ.`
                : `Under your current ${dashaStr} and transit over ${rashiStr} (${nakshatraStr}), planetary positions show balanced strength for career growth and family well-being.`}
            </div>
          </div>

          {/* Block 2: Planetary Positions Summary Box */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "10px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#B45309", marginBottom: "6px" }}>
              📊 {isKn ? "ಜನನ ಕುಂಡಲಿ ಗ್ರಹ ಸನ್ನಿವೇಶ ಸಾರಾಂಶ:" : "Natal Planetary Positions Summary:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "11px", color: "#78350F" }}>
              <div style={{ background: "#FEF3C7", padding: "6px 8px", borderRadius: "6px" }}>
                <strong>{isKn ? "ಜನನ ರಾಶಿ:" : "Janma Rashi:"}</strong> {rashiStr}
              </div>
              <div style={{ background: "#FEF3C7", padding: "6px 8px", borderRadius: "6px" }}>
                <strong>{isKn ? "ಜನನ ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> {nakshatraStr}
              </div>
              <div style={{ background: "#FEF3C7", padding: "6px 8px", borderRadius: "6px" }}>
                <strong>{isKn ? "ಲಗ್ನ ಭಾವ:" : "Lagna:"}</strong> {lagnaStr}
              </div>
            </div>
          </div>

          {/* Block 3: Archakashirvachan */}
          <div style={{ background: "#FFFFFF", border: "2px solid #F59E0B", borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🚩</span>
              <span>{isKn ? "೨. ಶ್ರೀ ಗೋಕರ್ಣ ವೈದಿಕ ಅರ್ಚಕಾಶೀರ್ವಚನ (Vedic Blessing):" : "2. Gokarna Vedic Archaka Blessing:"}</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#451A03", lineHeight: "1.65", fontWeight: 500 }}>
              {isKn
                ? `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಹಾಗೂ ಶ್ರೀ ತಾಮ್ರಗೌರೀ ಅಂಬಾಜಿಯವರ ಸನ್ನಿಧಿಯಿಂದ ಜಾತಕರಾದ ${result.personName} (${rashiStr}, ${nakshatraStr}) ಅವರ ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು ಶಮನವಾಗಿ, ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಉದ್ಯೋಗ ವೃದ್ಧಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಕೃಪಾಕಟಾಕ್ಷ ಸದಾ ಲಭಿಸಲೆಂದು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವೇದ ವೈದಿಕರಿಂದ ಹಾರ್ದಿಕ ಆಶೀರ್ವಚನ ಪ್ರಾರ್ಥನೆಗಳು.`
                : `May Sri Gokarna Mahabaleshwara Swami and Goddess Tamragauri bestow divine grace, health, longevity, and prosperity upon ${result.personName}. May all planetary afflictions in your chart be dissolved.`}
            </div>
          </div>

          {/* Block 4: Daily Home Remedies (Japa/Mantra) */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🌸</span>
              <span>{isKn ? "೩. ಜಾತಕಾನುಸಾರ ಗೃಹ ಸಿದ್ಧ ಪೂಜಾ ಪರಿಹಾರಗಳು (Daily Home Remedies):" : "3. Personalized Daily Home Remedies:"}</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.6", fontWeight: 600 }}>
              {sectionData
                ? (sectionData.recommendedRemedies[code] || sectionData.recommendedRemedies.kn)
                : (isKn ? "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಧನ್ವಂತರಿ ಸ್ತೋತ್ರ ಪಠಣ, ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಚಾಕ್ಷರಿ ಜಪ ಶ್ರೇಷ್ಠ." : "Daily Dhanvantari and Gayatri Mantra recitation with Shiva Panchakshari Japa recommended.")}
            </div>
          </div>

          {/* Block 5: Gokarna Kshetra Special Puja / Homa (WHY, WHAT, HOW) */}
          {(() => {
            const pujaDetail = sectionData?.gokarnaPujaDetail;
            const pujaName = pujaDetail?.pujaName?.[code] || pujaDetail?.pujaName?.kn || (isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ವಿಶೇಷ ವೈದಿಕ ಶಾಂತಿ & ಮಹಾ ರುದ್ರ ಹವನ" : "Gokarna Special Vedic Shanti & Rudra Homa");
            const whyText = pujaDetail?.whyRequired?.[code] || pujaDetail?.whyRequired?.kn || (isKn ? "ಜಾತಕದ ಪಿತೃ ದೋಷ, ಕಾಲಸರ್ಪ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಕುಜ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸೇವೆ ಅತ್ಯಗತ್ಯ." : "Required for natal Pitru, Kalasarpa, Nagapratishtha, Kuja & Maandi Dosha removal.");
            const whatText = pujaDetail?.whatSignificance?.[code] || pujaDetail?.whatSignificance?.kn || (isKn ? "ಗೋಕರ್ಣವು ಸಿದ್ಧ ಮುಕ್ತಿ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿನ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸುವ ಹೋಮ ಕೃತ್ಯದಿಂದ ಶಾಪಗಳು ವಿಮೋಚನೆಯಾಗಲಿವೆ." : "Gokarna Atmalinga Sthala holds divine Vedic power for ancestral liberation and karma dissolution.");
            const howText = pujaDetail?.howTransforms?.[code] || pujaDetail?.howTransforms?.kn || (isKn ? "ಸಕಲ ಪ್ರತಿಬಂಧಕಗಳು ದೂರವಾಗಿ ಉದ್ಯೋಗ ಪ್ರಗತಿ, ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ." : "Dissolves life hurdles, granting career promotion, marital joy, progeny bliss, and prosperity.");

            return (
              <div style={{ background: "#FFFBEB", border: "2.5px solid #D97706", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
                  🪔 ೪. {pujaName}
                </div>
                <div style={{ fontSize: "11px", color: "#78350F", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "4px" }}>
                    <strong style={{ color: "#92400E" }}>{isKn ? "• ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ (ಯಾಕೆ ಬೇಕು / WHY Required?):" : "• Kundli Analysis (WHY Required?):"}</strong>{" "}
                    {whyText}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong style={{ color: "#92400E" }}>{isKn ? "• ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ವೈಶಿಷ್ಟ್ಯ (ಮಹತ್ತ್ವವೇನು / WHAT Significance?):" : "• Kshetra Significance (WHAT Significance?):"}</strong>{" "}
                    {whatText}
                  </div>
                  <div>
                    <strong style={{ color: "#92400E" }}>{isKn ? "• ಪೂಜಾನಂತರ ದಕ್ಕುವ ಸಿದ್ಧಿ (ಪರಿಣಾಮವೇನು / HOW it Transforms?):" : "• Life Transformation (HOW it Transforms?):"}</strong>{" "}
                    {howText}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Page 2 Dedicated Archaka Verification Footer */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "12px",
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              {sealSymbol} {sealText}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
              ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
            </div>
            <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 700, marginTop: "2px" }}>
              📞 {isKn ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
