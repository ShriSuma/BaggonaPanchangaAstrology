import React from "react";
import type { PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import { sanitizeAIText } from "../../utils/textFormatter";

export type PalmReadingPdfTemplateProps = {
  result: PalmReadingResult;
  personName?: string;
  lang?: string;
  messages?: Array<{ sender: string; text: string; timestamp?: string }>;
};

export const PalmReadingPdfTemplate: React.FC<PalmReadingPdfTemplateProps> = ({
  result,
  personName = "ಶ್ರೀಯುತ ಭಕ್ತರು",
  lang = "kn",
  messages = []
}) => {
  const code = (lang || "kn").slice(0, 2);

  const titles: Record<string, { top: string; main: string; sub: string }> = {
    kn: {
      top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
      main: "॥ ಬಗ್ಗೋಣ ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ದೈವಿಕ ವರದಿ ॥",
      sub: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಹಸ್ತ ರೇಖಾ ಗಣಿತ ಹಾಗೂ ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಪದ್ಧತಿ"
    },
    en: {
      top: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
      main: "Baggona Hastarekha Shastra Palmistry Report",
      sub: "Authentic Vedic Palmistry & Samudrika Shastra Reading from Gokarna Kshetra"
    },
    hi: {
      top: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
      main: "॥ बग्गोण हस्तरेखा शास्त्र दैवीय रिपोर्ट ॥",
      sub: "श्री गोकर्ण क्षेत्र का प्रामाणिक हस्तरेखा एवं सामुद्रिक शास्त्र"
    },
    te: {
      top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
      main: "॥ బగ్గోణ హస్త రేఖ శాస్త్ర దైవిక నివేదిక ॥",
      sub: "శ్రీ గోకర్ణ క్షేత్ర ప్రాచీన హస్త రేఖా శాస్త్రం & సాముద్రిక విద్య"
    },
    ta: {
      top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்ன ॥",
      main: "॥ பக்கோண ஹஸ்த ரேகை சாஸ்திர திவ்ய அறிக்கை ॥",
      sub: "ஶ்ரீ கோகர்ண க்ஷேத்திரத்தின் பாரம்பரிய சாமூத்ரிகா லக்ஷண முறை"
    }
  };

  const header = titles[code] || titles.en;

  const devLabels: Record<string, { title: string; devotee: string; hand: string; defaultDev: string }> = {
    kn: { title: "👤 ಭಕ್ತರ ವಿವರಗಳು", devotee: "ಭಕ್ತರು:", hand: "ಆಯ್ಕೆಮಾಡಿದ ಹಸ್ತ:", defaultDev: "ಶ್ರೀಯುತ ಭಕ್ತರು" },
    en: { title: "👤 Devotee Details", devotee: "Devotee:", hand: "Inspected Hand:", defaultDev: "Devotee" },
    hi: { title: "👤 भक्त विवरण", devotee: "भक्त:", hand: "परीक्षित हस्त:", defaultDev: "भक्त" },
    te: { title: "👤 భక్తుని వివరాలు", devotee: "భక్తులు:", hand: "పరిశీలించిన చేయి:", defaultDev: "భక్తులు" },
    ta: { title: "👤 பக்தர் விவரங்கள்", devotee: "பக்தர்:", hand: "ஆய்வு செய்த கை:", defaultDev: "பக்தர்" }
  };

  const dLabels = devLabels[code] || devLabels.en;
  const handSideStr = result.handSideLabel[code] || result.handSideLabel.en || result.handSideLabel.kn;
  const devoteeDisplayName = personName || dLabels.defaultDev;

  const footerTexts: Record<string, { top: string; priest: string }> = {
    kn: {
      top: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಹಸ್ತ ರೇಖಾ ಪ್ರಕಾಶ · ಸಕಲ ದೋಷ ಶಮನಂ"',
      priest: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)"
    },
    en: {
      top: '"Om Gokarna Mahabaleshwara Sacred Palmistry Blessing · All Peace & Victory"',
      priest: "Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra (Phone: +91 99723 39362)"
    },
    hi: {
      top: '"ॐ गोकर्ण महाबलेश्वर संनिधि सिद्ध हस्तरेखा प्रकाश · सर्व दोष शमनम"',
      priest: "श्रीराम पंडित · मुख्य अर्चक, गोकर्ण क्षेत्र (दूरभाष: +91 99723 39362)"
    },
    te: {
      top: '"ఓం గోకర్ణ మహాబలేశ్వర సన్నిధి సిద్ధ హస్త రేఖా ప్రకాశం · సర్వ దోష శమనం"',
      priest: "శ్రీరామ్ పండిత్ · ముఖ్య అర్చకులు, గోకర్ణ క్షేత్రం (ఫోన్: +91 99723 39362)"
    },
    ta: {
      top: '"ஓம் கோகர்ண மகாபலேஸ்வரர் சன்னதி திவ்ய ஹஸ்த ரேகை ஒளி · சர்வ தோஷ சமனம்"',
      priest: "ஶ்ரீராம் பண்டிதர் · முதன்மை அர்ச்சகர், கோகர்ண க்ஷேத்திரம் (தொலைபேசி: +91 99723 39362)"
    }
  };

  const fTexts = footerTexts[code] || footerTexts.en;

  const cleanPrediction = sanitizeAIText(result.aiPrediction);
  const ms = result.lifeStageMilestones;

  return (
    <div
      id="palm-reading-pdf-container"
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

        {/* Info Grid (Devotee & Palm Thumbnail) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "12px", marginBottom: "14px" }}>
          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              {dLabels.title}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {devoteeDisplayName}
            </div>
            <div style={{ fontSize: "12px", color: "#92400E", lineHeight: "1.5" }}>
              <div><strong>{dLabels.hand}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>{handSideStr}</span></div>
              <div><strong>{code === "kn" ? "ಹಸ್ತದ ರೇಖಾ ವಯಸ್ಸು:" : "Palm Estimated Age:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>~{ms?.estimatedAge || 28} {code === "kn" ? "ವರ್ಷಗಳು" : "Years"}</span></div>
              <div><strong>{code === "kn" ? "ವಿಶ್ಲೇಷಣೆ ಬಲ:" : "Analysis Score:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>{result.overallScore}%</span></div>
            </div>
          </div>

          {/* Palm Image Thumbnail */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
            {result.imageDataUrl ? (
              <img
                src={result.imageDataUrl}
                alt="Palm Image"
                style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "6px", border: "1px solid #F59E0B" }}
              />
            ) : (
              <div style={{ height: "110px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#92400E" }}>
                Palm Photo
              </div>
            )}
          </div>
        </div>

        {/* Life Stage Milestones (Education, Marriage, Children, Wealth) */}
        {ms && (
          <div style={{ background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
              ⏳ {code === "kn" ? "ವಯೋಮಾನ ಆಧಾರಿತ ಜೀವನ ಹಂತಗಳ ಸಾಮುದ್ರಿಕ ಫಲ (Education, Marriage & Wealth):" : "Age-Stratified Life Milestones (Education, Marriage & Wealth):"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "#78350F" }}>
              <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong>🎓 {code === "kn" ? "ವಿದ್ಯಾಭ್ಯಾಸ & ಜ್ಞಾನಾರ್ಜನೆ:" : "Education & Intellect:"}</strong>
                <div>{code === "kn" ? ms.education.recommendedFieldsKn : ms.education.recommendedFieldsEn}</div>
              </div>
              <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong>💍 {code === "kn" ? "ವಿವಾಹ ಯೋಗ ವಯಸ್ಸು:" : "Marriage Age Window:"}</strong>
                <div>{code === "kn" ? ms.marriage.timingAgeWindowKn : ms.marriage.timingAgeWindowEn} ({code === "kn" ? ms.marriage.spouseTraitKn : ms.marriage.spouseTraitEn})</div>
              </div>
              <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong>👶 {code === "kn" ? "ಸಂತಾನ & ಕೌಟುಂಬಿಕ ಭಾಗ್ಯ:" : "Children & Family Blessing:"}</strong>
                <div>{code === "kn" ? ms.children.prospectsKn : ms.children.prospectsEn}</div>
              </div>
              <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong>💰 {code === "kn" ? "ಸರ್ವೋಚ್ಚ ಧನ ಸಂಪಾದನೆಯ ವಯಸ್ಸು:" : "Peak Wealth Earning Ages:"}</strong>
                <div>{code === "kn" ? ms.careerWealth.peakWealthAgeKn : ms.careerWealth.peakWealthAgeEn}</div>
              </div>
            </div>
          </div>
        )}

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
            📜 {code === "kn" ? "ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ಪೂರ್ಣ ಫಲ ಹಾಗೂ ದೈವಿಕ ವರದಿ:" : "Hastarekha Shastra Guidance & Predictions:"}
          </div>
          <div
            style={{
              fontSize: "11.5px",
              color: "#78350F",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap"
            }}
          >
            {cleanPrediction}
          </div>

          {/* Sacred Remedy in PDF */}
          <div style={{ marginTop: "12px", background: "#FEF3C7", padding: "10px", borderRadius: "8px", border: "1px solid #FCD34D", fontSize: "11px", color: "#78350F" }}>
            <strong>🪔 {code === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ:" : "Sacred Gokarna Kshetra Remedy:"}</strong>{" "}
            {result.remedyRecommendation[code] || result.remedyRecommendation.kn}
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
