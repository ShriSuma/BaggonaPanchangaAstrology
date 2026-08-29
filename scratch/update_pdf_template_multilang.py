filepath = "src/components/sankhyashastra/SankhyaShastraPdfTemplate.tsx"

code = '''import React from "react";
import type { SankhyaShastraResult } from "../../features/sankhyashastra/sankhyaShastraEngine";

export type SankhyaShastraPdfTemplateProps = {
  result: SankhyaShastraResult;
  personName?: string;
  lang?: string;
};

export const SankhyaShastraPdfTemplate: React.FC<SankhyaShastraPdfTemplateProps> = ({
  result,
  personName,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  const titles: Record<string, { top: string; main: string; sub: string }> = {
    kn: {
      top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
      main: "॥ ಬಗ್ಗೋಣ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ದೈವಿಕ ಪ್ರಶ್ನಾ ವರದಿ ॥",
      sub: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಸಂಖ್ಯಾ ಗಣಿತ ಹಾಗೂ ಪ್ರಾಚೀನ ಪ್ರಶ್ನಾ ಪದ್ಧತಿ"
    },
    en: {
      top: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
      main: "Baggona Sankhya Shastra Prashna Report",
      sub: "Authentic Vedic Numerology & Prashna Reading from Gokarna Kshetra"
    },
    hi: {
      top: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
      main: "॥ बग्गोण अंकशास्त्र दैवीय प्रश्न रिपोर्ट ॥",
      sub: "श्री गोकर्ण क्षेत्र का प्रामाणिक अंकशास्त्र एवं प्रश्न सिद्धांत"
    },
    te: {
      top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
      main: "॥ బగ్గోణ సంఖ్యా శాస్త్ర దైవిక ప్రశ్న నివేదిక ॥",
      sub: "శ్రీ గోకర్ణ క్షేత్ర ప్రాచీన సంఖ్యా శాస్త్రం & ప్రశ్న పద్ధతి"
    },
    ta: {
      top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்ன ॥",
      main: "॥ பக்கோண எண்கணித திவ்ய பிரஸ்ன அறிக்கை ॥",
      sub: "ஶ்ரீ கோகர்ண க்ஷேத்திரத்தின் பாரம்பரிய எண்கணித பிரஸ்ன முறை"
    }
  };

  const header = titles[code] || titles.en;

  const devLabels: Record<string, { title: string; devotee: string; query: string; defaultDev: string }> = {
    kn: { title: "👤 ಭಕ್ತರ ಪ್ರಶ್ನೆ ವಿವರ", devotee: "ಭಕ್ತರು:", query: "ಪ್ರಶ್ನೆ:", defaultDev: "ಶ್ರೀಯುತ ಭಕ್ತರು" },
    en: { title: "👤 Devotee Query Details", devotee: "Devotee:", query: "Query:", defaultDev: "Devotee" },
    hi: { title: "👤 भक्त प्रश्न विवरण", devotee: "भक्त:", query: "प्रश्न:", defaultDev: "भक्त" },
    te: { title: "👤 భక్తుని ప్రశ్న వివరాలు", devotee: "భక్తులు:", query: "ప్రశ్న:", defaultDev: "భక్తులు" },
    ta: { title: "👤 பக்தர் கேள்வி விவரம்", devotee: "பக்தர்:", query: "கேள்வி:", defaultDev: "பக்தர்" }
  };

  const dLabels = devLabels[code] || devLabels.en;

  const numLabels: Record<string, { title: string; chosen: string; root: string; lagna: string; house: string }> = {
    kn: { title: "🔢 ಸಂಖ್ಯಾ ಗಣಿತ ವಿವರ", chosen: "ಆಯ್ಕೆ ಸಂಖ್ಯೆ:", root: "ಮೂಲ ಸಂಖ್ಯೆ (Root):", lagna: "ಪ್ರಶ್ನಾ ಲಗ್ನ:", house: "ಮನೆ" },
    en: { title: "🔢 Numerology Parameters", chosen: "Chosen Number:", root: "Digital Root:", lagna: "Prashna Lagna:", house: "House" },
    hi: { title: "🔢 अंकशास्त्र विवरण", chosen: "चयनित अंक:", root: "मूलांक:", lagna: "प्रश्न लग्न:", house: "भाव" },
    te: { title: "🔢 సంఖ్యా శాస్త్ర వివరాలు", chosen: "ఎంచుకున్న సంఖ్య:", root: "మూల సంఖ్య:", lagna: "ప్రశ్న లగ్నం:", house: "ఇల్లు" },
    ta: { title: "🔢 எண்கணித விவரங்கள்", chosen: "தேர்ந்தெடுத்த எண்:", root: "மூல எண்:", lagna: "பிரஸ்ன லக்னம்:", house: "இடம்" }
  };

  const nLabels = numLabels[code] || numLabels.en;

  const footerTexts: Record<string, { top: string; priest: string }> = {
    kn: {
      top: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಸಿದ್ಧ ಸಂಖ್ಯಾ ಪ್ರಕಾಶ · ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಃ"',
      priest: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)"
    },
    en: {
      top: '"Om Gokarna Mahabaleshwara Divine Sankhya Blessing · All Success & Victory"',
      priest: "Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra (Phone: +91 99723 39362)"
    },
    hi: {
      top: '"ॐ गोकर्ण महाबलेश्वर संनिधि सिद्ध अंक प्रकाश · सर्व कार्य सिद्धि:"',
      priest: "श्रीराम पंडित · मुख्य अर्चक, गोकर्ण क्षेत्र (दूरभाष: +91 99723 39362)"
    },
    te: {
      top: '"ఓం గోకర్ణ మహాబలేశ్వర సన్నిధి సిద్ధ సంఖ్యా ప్రకాశం · సర్వ కార్య సిద్ధిః"',
      priest: "శ్రీరామ్ పండిత్ · ముఖ్య అర్చకులు, గోకర్ణ క్షేత్రం (ఫోన్: +91 99723 39362)"
    },
    ta: {
      top: '"ஓம் கோகர்ண மகாபலேஸ்வரர் சன்னதி திவ்ய எண்கணித ஒளி · சர்வ காரிய சித்திஃ"',
      priest: "ஶ்ரீராம் பண்டிதர் · முதன்மை அர்ச்சகர், கோகர்ண க்ஷேத்திரம் (தொலைபேசி: +91 99723 39362)"
    }
  };

  const fTexts = footerTexts[code] || footerTexts.en;

  const lagnaName = result.prashnaLagnaName[code] || result.prashnaLagnaName.en || result.prashnaLagnaName.kn;
  const rootRulerStr = result.rootRulerName[code] || result.rootRulerName.en || result.rootRulerName.kn;
  const devoteeDisplayName = personName || dLabels.defaultDev;

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
            {header.top}
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {header.main}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {header.sub}
          </div>
        </div>

        {/* Prashna Input & Parameter Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          {/* Left Grid: Question & Devotee */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              {dLabels.title}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#78350F", marginBottom: "4px" }}>
              {dLabels.devotee} {devoteeDisplayName}
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.4" }}>
              <strong>{dLabels.query}</strong> "{result.rawQuestion}"
            </div>
          </div>

          {/* Right Grid: Number & Lagna */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              {nLabels.title}
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{nLabels.chosen}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>{result.userNumber}</span></div>
              <div><strong>{nLabels.root}</strong> {result.rootNumber} ({rootRulerStr})</div>
              <div><strong>{nLabels.lagna}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>{lagnaName} ({nLabels.house} {result.prashnaLagnaHouse})</span></div>
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
            📜 {code === "kn" ? "ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾ ಫಲ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ:" : "Sankhya Shastra Prashna Guidance & Predictions:"}
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
            {fTexts.top}
          </div>
          <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            {fTexts.priest}
          </div>
        </div>
      </div>
    </div>
  );
};
'''

with open(filepath, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated SankhyaShastraPdfTemplate.tsx for 5-language pure localization.")
