import React from "react";
import type { BalaVidyaResult } from "../../features/balavidya/balaVidyaEngine";

export type BalaVidyaPdfTemplateProps = {
  data: BalaVidyaResult;
  lang?: string;
};

export const BalaVidyaPdfTemplate: React.FC<BalaVidyaPdfTemplateProps> = ({
  data,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  const titles: Record<string, { top: string; main: string; sub: string }> = {
    kn: {
      top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
      main: "॥ ಬಗ್ಗೋಣ ಬಾಲ ವಿದ್ಯಾ & ಸರಸ್ವತೀ ಸಂಸ್ಕಾರ ಜಾತಕ ವರದಿ ॥",
      sub: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಮೇಧಾ ಸೂಕ್ತ ಹಾಗೂ ಬಾಲ ಜ್ಯೋತಿಷ್ಯ ಪದ್ಧತಿ (ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ ಪರಂಪರೆ)"
    },
    en: {
      top: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
      main: "Baggona Vedic Child & Student Intelligence Report",
      sub: "Authentic Vedic Student Intelligence & Samskara Guide from Gokarna Kshetra"
    },
    hi: {
      top: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
      main: "॥ बग्गोण बाल विद्या एवं सरस्वती संस्कार रिपोर्ट ॥",
      sub: "श्री गोಕರ್ण क्षेत्र का प्रामाणिक बाल ज्योतिष एवं मेधा सूक्त पद्धति"
    },
    te: {
      top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
      main: "॥ బగ్గోణ బాల విద్యా & సరస్వతీ సంస్కార నివేదిక ॥",
      sub: "శ్రీ గోకర్ణ క్షేత్ర ప్రాచీన బాల జ్యోతిష్యం & సంస్కార విధి"
    },
    ta: {
      top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்ன ॥",
      main: "॥ பக்கோண பால வித்யா & சரஸ்வதி சம்ஸ்கார அறிக்கை ॥",
      sub: "ஶ்ரீ கோகர்ண க்ஷேத்திரத்தின் பாரம்பரிய பால ஜோதிட முறை"
    }
  };

  const header = titles[code] || titles.en;

  return (
    <div
      id="bala-vidya-pdf-container"
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
        <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "10px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
            {header.top}
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "4px 0 2px 0" }}>
            {header.main}
          </h1>
          <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600 }}>
            {header.sub}
          </div>
        </div>

        {/* Child Details Card */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "#78350F" }}>
            <div>
              <div><strong>{code === "kn" ? "ಮಗುವಿನ ಹೆಸರು:" : "Child Name:"}</strong> <span style={{ fontWeight: 800, color: "#78350F", fontSize: "14px" }}>{data.childName}</span></div>
              <div><strong>{code === "kn" ? "ಜನನ ವಿವರ:" : "DOB / Time:"}</strong> {data.dob} • {data.tob}</div>
              <div><strong>{code === "kn" ? "ಲಗ್ನ & ರಾಶಿ:" : "Lagna & Moon:"}</strong> {data.lagnaNameKn} ಲಗ್ನ • {data.moonRashiKn} ರಾಶಿ</div>
            </div>
            <div>
              <div><strong>{code === "kn" ? "ಜನನ ನಕ್ಷತ್ರ:" : "Birth Star:"}</strong> {data.nakshatraNameKn} ({data.nakshatraPada}ನೇ ಪಾದ)</div>
              <div><strong>{code === "kn" ? "ನಾಮಕರಣ ಅಕ್ಷರ:" : "Naming Syllable:"}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>{data.padaInfo.syllablesKn.join(", ")}</span></div>
              <div><strong>{code === "kn" ? "ಮ್ಯಾಸ್ಕಾಟ್:" : "Mascot Avatar:"}</strong> {data.padaInfo.mascotEmoji} {data.padaInfo.animalMascotKn}</div>
            </div>
          </div>
        </div>

        {/* Learning Intelligence */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
            🧠 {code === "kn" ? "ಬಾಲ ವಿದ್ಯಾ & ಕಲಿಕಾ ಶೈಲಿ (5th House Buddhi Sthana):" : "Learning Style & Cognitive Strengths:"}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", marginBottom: "4px" }}>
            {data.learningStyle.titleKn}
          </div>
          <div style={{ fontSize: "11px", color: "#78350F", lineHeight: "1.5", marginBottom: "6px" }}>
            {data.learningStyle.descriptionKn}
          </div>
          <div style={{ fontSize: "11px", color: "#92400E" }}>
            <strong>{code === "kn" ? "ಅನುಕೂಲಕರ ಉನ್ನತ ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರಗಳು:" : "Recommended Academic Fields:"}</strong>{" "}
            {data.learningStyle.recommendedFieldsKn.join(" · ")}
          </div>
        </div>

        {/* Study Vastu & Focus Colors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px", fontSize: "11px" }}>
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px" }}>
            <strong>🧭 {code === "kn" ? "ಅಧ್ಯಯನ ವಾಸ್ತು & ದಿಕ್ಕು:" : "Study Vastu Orientation:"}</strong>
            <div style={{ marginTop: "3px", color: "#78350F" }}>{data.learningStyle.studyEnvironmentKn}</div>
          </div>
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px" }}>
            <strong>🎨 {code === "kn" ? "ಏಕಾಗ್ರತೆಯ ಶುಭ ಬಣ್ಣಗಳು & ಸಮಯ:" : "Focus Colors & Hours:"}</strong>
            <div style={{ marginTop: "3px", color: "#78350F" }}>{data.sankhya.concentrationColorKn} • {data.learningStyle.favorableHoursKn}</div>
          </div>
        </div>

        {/* Bala Rishta & Protection Shield */}
        <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "12px", marginBottom: "12px", fontSize: "11px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
            🛡️ {code === "kn" ? "ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಾ ಕವಚ & ದೈವಿಕ ಮಂತ್ರಗಳು:" : "Protection Shield & Protective Mantras:"}
          </div>
          <div style={{ color: "#78350F", marginBottom: "4px" }}>
            <strong>{code === "kn" ? "ರಕ್ಷಾ ಬಲ:" : "Immunity Score:"}</strong> {data.balaRishta.protectionScore}% ({data.balaRishta.statusKn})
          </div>
          <div style={{ color: "#92400E" }}>
            <strong>{code === "kn" ? "ದಿನನಿತ್ಯ ಪಠಿಸಬೇಕಾದ ರಕ್ಷಾ ಸ್ತೋತ್ರಗಳು:" : "Daily Mantras:"}</strong> {data.balaRishta.protectiveMantrasKn.join(" · ")}
          </div>
        </div>

        {/* Daily Bal Shloka */}
        <div style={{ background: "#FFFFFF", border: "1px solid #FCD34D", borderRadius: "8px", padding: "10px", textAlign: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
            🎵 {data.mascotAndStory.shlokaSanskrit}
          </div>
          <div style={{ fontSize: "10.5px", color: "#92400E" }}>
            {data.mascotAndStory.shlokaMeaningKn}
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
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
            {code === "kn" ? '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಬಾಲ ವಿದ್ಯಾ ಆಶೀರ್ವಾದ · ಸಕಲ ವಿದ್ಯಾ ಪಾರಂಗತೋ ಭವತು"' : '"Om Gokarna Mahabaleshwara Child Intelligence Blessing · Victory in Learning"'}
          </div>
          <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            {code === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)" : "Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra (Phone: +91 99723 39362)"}
          </div>
        </div>
      </div>
    </div>
  );
};
