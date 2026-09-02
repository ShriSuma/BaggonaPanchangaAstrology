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

const PDF_HEADERS_5LANG: Record<string, { title1: string; sub1: string; title2: string; sub2: string; devoteeTitle: string }> = {
  kn: {
    title1: "॥ ಬಗ್ಗೋಣ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ ವರದಿ (ಭಾಗ ೧) ॥",
    sub1: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗಣನ ಪದ್ಧತಿ",
    title2: "॥ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ವೈದಿಕ ಶಾಂತಿ, ಹೋಮ & ದಶಾ ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ (ಭಾಗ ೨) ॥",
    sub2: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯ ದಿವ್ಯ ಅನುಗ್ರಹ ಸಿದ್ಧಿ",
    devoteeTitle: "👤 ಜಾತಕರ ಕುಂಡಲಿ ವಿವರಗಳು"
  },
  en: {
    title1: "Baggona Hyper-Personalized Life Guidance Report (Part 1)",
    sub1: "Vedic Astrology & Planetary Guidance from Gokarna Kshetra",
    title2: "Gokarna Vedic Blessings, Dasha Bhukti & Puja Guide (Part 2)",
    sub2: "Divine Grace from Sri Gokarna Mahabaleshwara Atmalinga Kshetra",
    devoteeTitle: "👤 Devotee Natal Parameters"
  },
  hi: {
    title1: "॥ बग्गोण परिपूर्ण जीवन मार्गदर्शन रिपोर्ट (भाग १) ॥",
    sub1: "श्री गोकर्ण क्षेत्र की सिद्ध वैदिक ज्योतिष गणना पद्धति",
    title2: "॥ गोकर्ण क्षेत्र वैदिक शांति, होम एवं दशा गोचर विश्लेषण (भाग २) ॥",
    sub2: "श्री महाबलेश्वर स्वामी आत्मलिंग सन्निधि की दिव्य अनुग्रह सिद्धि",
    devoteeTitle: "👤 जातक कुंडली विवरण"
  },
  te: {
    title1: "॥ బగ్గోణ పరిపూర్ణ జీవన మార్గదర్శక నివేదిక (భాగం 1) ॥",
    sub1: "శ్రీ గోకర్ణ క్షేత్ర సిద్ధ వైదిక జ్యోతిష్య గణన పద్ధతి",
    title2: "॥ గోకర్ణ క్షేత్ర వైదిక శాంతి, హోమం & దశా గోచార విశ్లేషణ (భాగం 2) ॥",
    sub2: "శ్రీ మహాబలేశ్వర స్వామి ఆత్మలింగ సన్నిధి దివ్య అనుగ్రహ సిద్ధి",
    devoteeTitle: "👤 జాతకుని కుండలి వివరాలు"
  },
  ta: {
    title1: "॥ பக்கோண முழுமையான வாழ்க்கை வழிகாட்டுதல் அறிக்கை (பகுதி 1) ॥",
    sub1: "ஸ்ரீ கோகர்ண க்ஷேத்திரத்தின் சித்த வேத ஜோதிட கணிப்பு முறை",
    title2: "॥ கோகர்ண க்ஷேத்திர வேத சாந்தி, ஹோமம் & தசா கோசார விளக்கம் (பகுதி 2) ॥",
    sub2: "ஸ்ரீ மஹாபலேஸ்வரர் ஆத்மலிங்க சந்நிதியின் திவ்ய அருள் சித்தி",
    devoteeTitle: "👤 ஜாதகரின் பிறப்பு விவரங்கள்"
  }
};

export const LifeGuidancePdfTemplate: React.FC<LifeGuidancePdfTemplateProps> = ({
  result,
  activeTab = "career",
  lang = "kn",
  priest
}) => {
  const code = (lang || "kn").slice(0, 2);
  const pdfHeader = PDF_HEADERS_5LANG[code] || PDF_HEADERS_5LANG.kn;

  const priestName = (priest?.name as Record<string, string>)?.[code] || priest?.name?.kn || "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const priestTitle = (priest?.title as Record<string, string>)?.[code] || priest?.title?.kn || "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು";
  const priestPhone = "+91 99723 39362"; // Standard certified contact
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
    .map((p) => p.trim())
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
        fontFamily: "'Noto Serif Kannada', 'Tiro Devanagari Hindi', 'Tiro Telugu', 'Tiro Tamil', 'Noto Serif', serif, sans-serif",
        color: "#261605"
      }}
    >
      {/* ================= PAGE 1: DEEP PREDICTION NARRATIVE ================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          padding: "18px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1087px",
            border: "3px double #B45309",
            outline: "1px solid #F59E0B",
            outlineOffset: "-6px",
            borderRadius: "16px",
            padding: "16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 50%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#FDE68A", letterSpacing: "1px" }}>
              ॥ 🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ 🕉️ ॥
            </div>
            <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 2px 0", letterSpacing: "0.5px" }}>
              {pdfHeader.title1}
            </h1>
            <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 600 }}>
              {pdfHeader.sub1}
            </div>
          </div>

          {/* Devotee Info Card */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "3px", letterSpacing: "0.5px" }}>
              {pdfHeader.devoteeTitle}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350F", marginBottom: "5px" }}>
              {result.personName} ({result.gender})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.2fr 1.2fr 1.2fr", gap: "6px", fontSize: "11px", color: "#92400E" }}>
              <div><strong>DOB:</strong> {result.dob}</div>
              <div><strong>TOB:</strong> {result.tob}</div>
              <div><strong>{code === "kn" ? "ಲಗ್ನ:" : "Lagna:"}</strong> <span style={{ fontWeight: 800 }}>{lagnaStr}</span></div>
              <div><strong>{code === "kn" ? "ರಾಶಿ:" : "Rashi:"}</strong> <span style={{ fontWeight: 800 }}>{rashiStr}</span></div>
              <div><strong>{code === "kn" ? "ದಶಾ:" : "Dasha:"}</strong> <span style={{ fontWeight: 800 }}>{dashaStr.split(" ")[0]}</span></div>
            </div>
          </div>

          {/* Active Section Title Header */}
          <div style={{ background: "linear-gradient(90deg, #78350F 0%, #92400E 100%)", borderLeft: "5px solid #F59E0B", borderRadius: "8px", padding: "8px 14px", color: "#FDE68A", fontSize: "13.5px", fontWeight: 800 }}>
            {sectionTitle}
          </div>

          {/* Main Narrative Paragraphs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {paragraphs.slice(0, 4).map((para, idx) => (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  borderLeft: "4px solid #D97706",
                  borderTop: "1px solid #FEF3C7",
                  borderRight: "1px solid #FEF3C7",
                  borderBottom: "1px solid #FEF3C7",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "11px",
                  color: "#261605",
                  lineHeight: "1.6",
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
              <div style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "8px 12px", fontSize: "11px", color: "#78350F" }}>
                <strong>🌟 {code === "kn" ? "ಪ್ರಮುಖ ವಯೋಮಾನ ಮೈಲಿಗಲ್ಲುಗಳು:" : "Key Age Milestones:"}</strong>{" "}
                <span style={{ fontWeight: 800 }}>
                  {sectionData.keyAges.join(", ")} {code === "kn" ? "ವರ್ಷಗಳು" : "Years"}
                </span>
              </div>
              <div style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "8px 12px", fontSize: "11px", color: "#78350F" }}>
                <strong>🧭 {code === "kn" ? "ಅನುಕೂಲಕರ ದಿಕ್ಪಾಲಕ ದಿಕ್ಕುಗಳು:" : "Favorable Directions:"}</strong>{" "}
                <span style={{ fontWeight: 800 }}>{sectionData.favorableDirections[code] || sectionData.favorableDirections.kn}</span>
              </div>
            </div>
          )}

          {/* Page 1 Archaka Footer */}
          <div
            style={{
              background: "linear-gradient(180deg, #451A03 0%, #260E02 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "12px",
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              {sealSymbol} {sealText}
            </div>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
              ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
            </div>
            <div style={{ fontSize: "11px", color: "#FCD34D", fontWeight: 700, marginTop: "2px" }}>
              📞 {code === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: DASHA BHUKTI, GOCHARA & GOKARNA SEVA GUIDE ================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          padding: "18px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1087px",
            border: "3px double #B45309",
            outline: "1px solid #F59E0B",
            outlineOffset: "-6px",
            borderRadius: "16px",
            padding: "16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 50%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Page 2 Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              ॥ 🚩 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಸಿದ್ಧ ಪೂಜಾ, ದಶಾ ಫಲ & ಅರ್ಚಕಾಶೀರ್ವಚನ (ಭಾಗ ೨) 🚩 ॥
            </div>
            <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 2px 0" }}>
              {pdfHeader.title2}
            </h1>
            <div style={{ fontSize: "11.5px", color: "#FCD34D", fontWeight: 600 }}>
              {pdfHeader.sub2}
            </div>
          </div>

          {/* Block 1: Dasha Bhukti & Planetary Transit Analysis */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "11px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🔮</span>
              <span>{code === "kn" ? "೧. ಪ್ರಸ್ತುತ ದಶಾ ಭುಕ್ತಿ ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರ ಫಲ ವಿಶ್ಲೇಷಣೆ:" : "1. Current Dasha Bhukti & Planetary Transit Analysis:"}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#261605", lineHeight: "1.6" }}>
              {code === "kn"
                ? `ನಿಮ್ಮ ಜನನ ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ${dashaStr} ಚಲಿಸುತ್ತಿದ್ದು, ${lagnaStr}, ${rashiStr} ಹಾಗೂ ${nakshatraStr} ನಕ್ಷತ್ರ ಜಾತಕದ ಮೇಲಿರುವ ಗುರು, ಶನಿ ಹಾಗೂ ರಾಹು ಗ್ರಹಗಳ ಗೋಚಾರ ಬಲವು ಶ್ರೇಷ್ಠ ಫಲಗಳನ್ನು ನೀಡಲಿದೆ. ದಶಮಾಧಿಪತಿ ಹಾಗೂ ಶುಭ ಗ್ರಹಗಳ ದಿವ್ಯ ಬಲದಿಂದ ಧನ ಯೋಗ, ಉದ್ಯೋಗ ವೃದ್ಧಿ ಹಾಗೂ ಕುಟುಂಬ ಕ್ಷೇಮ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
                : `Under your current ${dashaStr} and transit over ${lagnaStr}, ${rashiStr} (${nakshatraStr}), planetary positions show balanced strength for professional progress, financial expansion, and family well-being.`}
            </div>
          </div>

          {/* Block 2: Planetary Positions Summary Box */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "9px 14px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#B45309", marginBottom: "5px" }}>
              📊 {code === "kn" ? "ಜನನ ಕುಂಡಲಿ ನವಗ್ರಹ ಸನ್ನಿವೇಶ ಸಾರಾಂಶ:" : "Natal Planetary Positions Summary:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", fontSize: "11px", color: "#78350F" }}>
              <div style={{ background: "#FEF3C7", padding: "5px 8px", borderRadius: "6px" }}>
                <strong>{code === "kn" ? "ಲಗ್ನ ಭಾವ:" : "Lagna:"}</strong> {lagnaStr}
              </div>
              <div style={{ background: "#FEF3C7", padding: "5px 8px", borderRadius: "6px" }}>
                <strong>{code === "kn" ? "ಜನನ ರಾಶಿ:" : "Rashi:"}</strong> {rashiStr}
              </div>
              <div style={{ background: "#FEF3C7", padding: "5px 8px", borderRadius: "6px" }}>
                <strong>{code === "kn" ? "ಜನನ ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> {nakshatraStr}
              </div>
              <div style={{ background: "#FEF3C7", padding: "5px 8px", borderRadius: "6px" }}>
                <strong>{code === "kn" ? "ಮಹಾದಶಾ:" : "Dasha:"}</strong> {dashaStr.split(" ")[0]}
              </div>
            </div>
          </div>

          {/* Block 3: Archakashirvachan */}
          <div style={{ background: "#FFFFFF", border: "2px solid #F59E0B", borderRadius: "12px", padding: "11px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🚩</span>
              <span>{code === "kn" ? "೨. ಶ್ರೀ ಗೋಕರ್ಣ ವೈದಿಕ ಅರ್ಚಕಾಶೀರ್ವಚನ (Vedic Blessing):" : "2. Gokarna Vedic Archaka Blessing:"}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#261605", lineHeight: "1.6", fontWeight: 500 }}>
              {code === "kn"
                ? `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಹಾಗೂ ಶ್ರೀ ತಾಮ್ರಗೌರೀ ಅಂಬಾಜಿಯವರ ಸನ್ನಿಧಿಯಿಂದ ಜಾತಕರಾದ ${result.personName} (${lagnaStr}, ${rashiStr}, ${nakshatraStr}) ಅವರ ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು ಶಮನವಾಗಿ, ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಉದ್ಯೋಗ ವೃದ್ಧಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಕೃಪಾಕಟಾಕ್ಷ ಸದಾ ಲಭಿಸಲೆಂದು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವೇದ ವೈದಿಕರಿಂದ ಹಾರ್ದಿಕ ಆಶೀರ್ವಚನ ಪ್ರಾರ್ಥನೆಗಳು.`
                : `May Sri Gokarna Mahabaleshwara Swami and Goddess Tamragauri bestow divine grace, health, longevity, and prosperity upon ${result.personName} (${lagnaStr}, ${rashiStr}). May all planetary afflictions in your chart be dissolved.`}
            </div>
          </div>

          {/* Block 4: Daily Home Remedies (Japa/Mantra) */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "12px", padding: "11px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🌸</span>
              <span>{code === "kn" ? "೩. ಜಾತಕಾನುಸಾರ ಗೃಹ ಸಿದ್ಧ ಪೂಜಾ ಪರಿಹಾರಗಳು (Daily Home Remedies):" : "3. Personalized Daily Home Remedies:"}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#92400E", lineHeight: "1.55", fontWeight: 600 }}>
              {sectionData
                ? (sectionData.recommendedRemedies[code] || sectionData.recommendedRemedies.kn)
                : (code === "kn"
                    ? "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಧನ್ವಂತರಿ ಸ್ತೋತ್ರ ಪಠಣ, ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಚಾಕ್ಷರಿ ಜಪ ಶ್ರೇಷ್ಠ."
                    : "Daily Dhanvantari and Gayatri Mantra recitation with Shiva Panchakshari Japa recommended.")}
            </div>
          </div>

          {/* Block 5: Gokarna Kshetra Special Puja / Homa (WHY, WHAT, HOW) */}
          {(() => {
            const pujaDetail = sectionData?.gokarnaPujaDetail;
            const pujaName =
              pujaDetail?.pujaName?.[code] ||
              pujaDetail?.pujaName?.kn ||
              (code === "kn" ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ವಿಶೇಷ ವೈದಿಕ ಶಾಂತಿ & ಮಹಾ ರುದ್ರ ಹವನ" : "Gokarna Special Vedic Shanti & Rudra Homa");
            const whyText =
              pujaDetail?.whyRequired?.[code] ||
              pujaDetail?.whyRequired?.kn ||
              (code === "kn"
                ? "ಜಾತಕದ ಪಿತೃ ದೋಷ, ಕಾಲಸರ್ಪ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಕುಜ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸೇವೆ ಅತ್ಯಗತ್ಯ."
                : "Required for natal Pitru, Kalasarpa, Nagapratishtha, Kuja & Maandi Dosha removal.");
            const whatText =
              pujaDetail?.whatSignificance?.[code] ||
              pujaDetail?.whatSignificance?.kn ||
              (code === "kn"
                ? "ಗೋಕರ್ಣವು ಸಿದ್ಧ ಮುಕ್ತಿ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿನ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸುವ ಹೋಮ ಕೃತ್ಯದಿಂದ ಶಾಪಗಳು ವಿಮೋಚನೆಯಾಗಲಿವೆ."
                : "Gokarna Atmalinga Sthala holds divine Vedic power for ancestral liberation and karma dissolution.");
            const howText =
              pujaDetail?.howTransforms?.[code] ||
              pujaDetail?.howTransforms?.kn ||
              (code === "kn"
                ? "ಸಕಲ ಪ್ರತಿಬಂಧಕಗಳು ದೂರವಾಗಿ ಉದ್ಯೋಗ ಪ್ರಗತಿ, ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ."
                : "Dissolves life hurdles, granting career promotion, marital joy, progeny bliss, and prosperity.");

            return (
              <div style={{ background: "#FFFBEB", border: "2px solid #D97706", borderRadius: "12px", padding: "11px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
                  🪔 ೪. {pujaName}
                </div>
                <div style={{ fontSize: "10.5px", color: "#78350F", lineHeight: "1.5" }}>
                  <div style={{ marginBottom: "2px" }}>
                    <strong style={{ color: "#92400E" }}>{code === "kn" ? "• ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ (ಯಾಕೆ ಬೇಕು / WHY Required?):" : "• Kundli Analysis (WHY Required?):"}</strong>{" "}
                    {whyText}
                  </div>
                  <div style={{ marginBottom: "2px" }}>
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

          {/* Page 2 Dedicated Archaka Verification Footer */}
          <div
            style={{
              background: "linear-gradient(180deg, #451A03 0%, #260E02 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "12px",
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.5px" }}>
              {sealSymbol} {sealText}
            </div>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
              ವೇ|| ಮೂ|| {priestName} ({priestTitle}) · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧ ಸೇವಾ ಕರ್ತರು
            </div>
            <div style={{ fontSize: "11px", color: "#FCD34D", fontWeight: 700, marginTop: "2px" }}>
              📞 {code === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಪೂಜಾ ಸಂಪರ್ಕ:" : "Direct Phone / WhatsApp:"} {priestPhone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
