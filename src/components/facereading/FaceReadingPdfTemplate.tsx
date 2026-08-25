import React from "react";
import type { FaceReadingResult } from "../../features/facereading/faceReadingEngine";
import { sanitizeAIText } from "../../utils/textFormatter";

export type FaceReadingPdfTemplateProps = {
  result: FaceReadingResult;
  personName?: string;
  lang?: string;
  messages?: Array<{ sender: string; text: string; timestamp?: string }>;
};

export const FaceReadingPdfTemplate: React.FC<FaceReadingPdfTemplateProps> = ({
  result,
  personName = "ಶ್ರೀಯುತ ಭಕ್ತರು",
  lang = "kn",
  messages = []
}) => {
  const code = (lang || "kn").slice(0, 2);

  const titles: Record<string, { top: string; main: string; sub: string }> = {
    kn: {
      top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
      main: "॥ ಬಗ್ಗೋಣ ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ದೈವಿಕ ವರದಿ ॥",
      sub: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಮುಖ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಪದ್ಧತಿ & ಸಪ್ತ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಣೆ (ಬೃಹತ್ ಸಂಹಿತಾ ಪರಂಪರೆ)"
    },
    en: {
      top: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
      main: "Baggona Vedic Face Reading (Physiognomy) Report",
      sub: "Authentic Vedic Muka Samudrika Shastra & 7-Feature Analysis from Gokarna Kshetra (Brihat Samhita)"
    },
    hi: {
      top: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
      main: "॥ बग्गोण मुख सामुद्रिक शास्त्र दैवीय रिपोर्ट ॥",
      sub: "श्री गोकर्ण क्षेत्र का प्रामाणिक मुख लक्षण एवं सामुद्रिक शास्त्र"
    },
    te: {
      top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
      main: "॥ బగ్గోణ ముఖ సాಮುద్రిక శాస్త్ర దైవిక నివేదిక ॥",
      sub: "శ్రీ గోకర్ణ క్షేత్ర ప్రాచీన ముఖ సాముద్రిక శాస్త్రం & సప్త లక్షణ విశ్లేషణ"
    },
    ta: {
      top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்ன ॥",
      main: "॥ பக்கோண முக சாமூத்ரிகா சாஸ்திர திவ்ய அறிக்கை ॥",
      sub: "ஶ்ரீ கோகர்ண க்ஷேத்திரத்தின் பாரம்பரிய முக லட்சண முறை"
    }
  };

  const header = titles[code] || titles.en;
  const devoteeDisplayName = personName || result.devoteeName || "ಶ್ರೀಯುತ ಭಕ್ತರು";
  const cleanPrediction = sanitizeAIText(result.aiPrediction);

  return (
    <div
      id="face-reading-pdf-container"
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

        {/* Info Grid (Devotee & Face Thumbnail) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "12px", marginBottom: "14px" }}>
          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              👤 {code === "kn" ? "ಭಕ್ತರ ವಿವರಗಳು" : "Devotee Details"}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {devoteeDisplayName}
            </div>
            <div style={{ fontSize: "12px", color: "#92400E", lineHeight: "1.5" }}>
              <div><strong>{code === "kn" ? "ಅಂದಾಜು ಮುಖ ವಯಸ್ಸು:" : "Estimated Face Age:"}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>~{result.estimatedAge} {code === "kn" ? "ವರ್ಷಗಳು" : "Years"}</span></div>
              <div><strong>{code === "kn" ? "ಮಹಾಪುರುಷ ಯೋಗ:" : "Mahapurusha Archetype:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>{result.facialConstitution.mahapurushaArchetype[code] || result.facialConstitution.mahapurushaArchetype.kn}</span></div>
              <div><strong>{code === "kn" ? "ತೇಜಸ್ಸು & ಕಾಂತಿ ಬಲ:" : "Tejas Radiance Score:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>{result.overallTejasScore}%</span></div>
            </div>
          </div>

          {/* Face Image Thumbnail */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
            {result.imageDataUrl ? (
              <img
                src={result.imageDataUrl}
                alt="Face Photo"
                style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "6px", border: "1px solid #F59E0B" }}
              />
            ) : (
              <div style={{ height: "110px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#92400E" }}>
                Face Photo
              </div>
            )}
          </div>
        </div>

        {/* 7 Facial Features Grid in PDF */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
            👁️ {code === "kn" ? "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು & ನವಗ್ರಹ ಅಧಿಪತ್ಯ (Brihat Samhita):" : "7 Facial Features & Graha Governance (Brihat Samhita):"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "#78350F" }}>
            {result.features.slice(0, 4).map((f, i) => (
              <div key={i} style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong>{f.name[code] || f.name.kn} ({f.planetaryRuler[code] || f.planetaryRuler.kn}):</strong>
                <div>{f.vedicIndication[code] || f.vedicIndication.kn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 100-Year Age Milestones in PDF */}
        <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "14px", fontSize: "11px" }}>
          <div style={{ fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
            ⏳ {code === "kn" ? "೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ ನಕ್ಷೆ (Facial Age Timeline):" : "100-Year Facial Chronology Milestones:"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", color: "#92400E" }}>
            {result.ageMilestones.map((m, idx) => (
              <div key={idx} style={{ background: "#FFFFFF", padding: "4px 8px", borderRadius: "4px", border: "1px solid #FDE68A" }}>
                <strong>{m.agePhase} ({m.ageWindow}):</strong> {m.prediction[code] || m.prediction.kn}
              </div>
            ))}
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
            📜 {code === "kn" ? "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ಪೂರ್ಣ ಫಲ ಹಾಗೂ ಭವಿಷ್ಯ ವರದಿ:" : "Face Reading Guidance & Predictions:"}
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

          {/* Sacred Temple Remedy in PDF */}
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
            {code === "kn" ? '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಮುಖ ಸಾಮುದ್ರಿಕ ಪ್ರಕಾಶ · ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಃ"' : '"Om Gokarna Mahabaleshwara Sacred Face Reading Blessing · Victory & Peace"'}
          </div>
          <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            {code === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)" : "Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra (Phone: +91 99723 39362)"}
          </div>
        </div>
      </div>
    </div>
  );
};
