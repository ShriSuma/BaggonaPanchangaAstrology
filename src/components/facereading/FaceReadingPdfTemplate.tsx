import React from "react";
import type { FaceReadingResult } from "../../features/facereading/faceReadingEngine";

type Props = {
  result: FaceReadingResult;
  devoteeName?: string;
  personName?: string;
  lang?: string;
  messages?: any[];
};

const PDF_HEADERS: Record<string, { top: string; main: string; sub: string }> = {
  kn: {
    top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥",
    main: "ಪ್ರಾಚೀನ ಮುಖ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರ",
    sub: "ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ & ಗರುಡ ಪುರಾಣ ಪದ್ಧತಿ · ದೈವಿಕ ಮುಖ ಲಕ್ಷಣ ವರದಿ"
  },
  en: {
    top: "॥ SRI GOKARNA MAHABALESHWARA PRASANNA ॥",
    main: "Vedic Physiognomy & Face Reading",
    sub: "Classical Brihat Samhita & Garuda Purana Tradition · Certified Report"
  },
  hi: {
    top: "॥ श्री गोकर्ण महाबलेश्वर प्रसन्न ॥",
    main: "वैदिक मुख सामुद्रिक शास्त्र",
    sub: "वराहमिहिर बृहत्संहिता व गरुड़ पुराण परंपरा · प्रामाणिक मुख लक्षण फलादेश"
  },
  te: {
    top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర ప్రసన్న ॥",
    main: "వైదిక ముఖ సాముద్రిక శాస్త్రం",
    sub: "బృహత్ సంహిత & గరుడ పురాణ సంప్రదాయం · దివ్య ముఖ లక్షణ విశ్లేషణ"
  },
  ta: {
    top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் பிரசன்னம் ॥",
    main: "வேத முக சாமுத்ரிகா சாஸ்திரம்",
    sub: "பிருஹத் சம்ஹிதை & கருட புராணம் முறை · தெய்வீக முக லட்சண அறிக்கை"
  }
};

const DEVOTEE_DETAILS_TITLES: Record<string, string> = {
  kn: "👤 ಭಕ್ತರ ವಿವರಗಳು",
  en: "👤 Devotee Details",
  hi: "👤 जातक विवरण",
  te: "👤 భక్తుల వివరాలు",
  ta: "👤 பக்தர் விவரங்கள்"
};

const ESTIMATED_AGE_TITLES: Record<string, string> = {
  kn: "ಅಂದಾಜು ಮುಖ ವಯಸ್ಸು:",
  en: "Estimated Face Age:",
  hi: "अनुमानित मुख आयु:",
  te: "అంచనా వేసిన ముఖ వయస్సు:",
  ta: "கணிக்கப்பட்ட முக வயது:"
};

const YEARS_LABELS: Record<string, string> = {
  kn: "ವರ್ಷಗಳು",
  en: "Years",
  hi: "वर्ष",
  te: "సంవత్సరాలు",
  ta: "ஆண்டுகள்"
};

const MAHAPURUSHA_TITLES: Record<string, string> = {
  kn: "ಮಹಾಪುರುಷ ಯೋಗ:",
  en: "Mahapurusha Archetype:",
  hi: "महापुरुष योग:",
  te: "మహాపురుష యోగం:",
  ta: "மகாபுருஷ யோகம்:"
};

const TEJAS_TITLES: Record<string, string> = {
  kn: "ತೇಜಸ್ಸು & ಕಾಂತಿ ಬಲ:",
  en: "Tejas Radiance Score:",
  hi: "तेज व कांति बल:",
  te: "వర్చస్సు & కాంతి బలం:",
  ta: "தேஜஸ் & காந்தி பலம்:"
};

const FEATURES_HEADINGS: Record<string, string> = {
  kn: "👁️ ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು & ನವಗ್ರಹ ಅಧಿಪತ್ಯ (Brihat Samhita):",
  en: "👁️ 7 Facial Features & Graha Governance (Brihat Samhita):",
  hi: "👁️ सप्त मुख लक्षण एवं नवग्रह अधिपत्य (बृहत्संहिता):",
  te: "👁️ సప్త ముఖ లక్షణాలు & నవగ్రహ ఆధిపత్యం (బృహత్ సంహిత):",
  ta: "👁️ ஏழு முக லட்சணங்கள் & நவகிரக ஆதிக்கம் (பிருஹத் சம்ஹிதை):"
};

const MILESTONES_HEADINGS: Record<string, string> = {
  kn: "⏳ ೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ ನಕ್ಷೆ (Facial Age Timeline):",
  en: "⏳ 100-Year Facial Chronology Milestones:",
  hi: "⏳ 100-वर्षीय मुख कालचक्र मानचित्र (आयु फलादेश):",
  te: "⏳ 100-సంవత్సరాల ముఖ కాలచక్ర పటం (ఆయుష్షు ఫలాలు):",
  ta: "⏳ 100-ஆண்டு முக காலச்சக்கரம் (ஆயுள் பலன் காலக்கோடு):"
};

const PREDICTIONS_HEADINGS: Record<string, string> = {
  kn: "📜 ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ಪೂರ್ಣ ಫಲ ಹಾಗೂ ಭವಿಷ್ಯ ವರದಿ:",
  en: "📜 Vedic Face Reading Guidance & Comprehensive Prediction:",
  hi: "📜 मुख सामुद्रिक शास्त्र विस्तृत फलादेश व भविष्य कथन:",
  te: "📜 ముఖ సాముద్రిక శాస్త్ర సంపూర్ణ ఫలాలు & భవిష్యత్తు నివేదిక:",
  ta: "📜 முக சாமுத்ரிகா சாஸ்திர முழுமையான பலன்கள் & எதிர்கால அறிக்கை:"
};

const REMEDY_HEADINGS: Record<string, string> = {
  kn: "🪔 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ:",
  en: "🪔 Sacred Gokarna Kshetra Divine Remedy:",
  hi: "🪔 श्री गोकर्ण महाबलेश्वर दिव्य उपाय:",
  te: "🪔 శ్రీ గోకర్ణ మహాబలేశ్వర దివ్య పరిహారం:",
  ta: "🪔 ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் திவ்ய பரிகாரம்:"
};

const FOOTER_BLESSINGS: Record<string, string> = {
  kn: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಮುಖ ಸಾಮುದ್ರಿಕ ಪ್ರಕಾಶ · ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಃ"',
  en: '"Om Gokarna Mahabaleshwara Sacred Face Reading Blessing · Victory & Peace"',
  hi: '"ॐ गोकर्ण महाबलेश्वर सन्निधि का धर्मज्ञ मुख सामुद्रिक प्रकाश · सर्वकार्य सिद्धिः"',
  te: '"ఓం గోకర్ణ మహాబలేశ్వర సన్నిధి ధర్మజ్ఞ ముఖ సాముద్రిక ప్రకాశం · సర్వకార్య సిద్ధిః"',
  ta: '"ஓம் கோகர்ண மகாபலேஸ்வரர் சந்நிதி தர்மஜ்ஞ முக சாமுத்ரிகா ஒளி · சகல காரிய சித்திಃ"'
};

const PRIEST_CONTACT_LABELS: Record<string, string> = {
  kn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)",
  en: "Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra (Phone: +91 99723 39362)",
  hi: "श्रीराम पंडित · मुख्य अर्चक, गोकर्ण क्षेत्र (फोन: +91 99723 39362)",
  te: "శ్రీరామ్ పండిట్ · ప్రధాన అర్చకులు, గోకర్ణ క్షేత్రం (ఫోన్: +91 99723 39362)",
  ta: "ஸ்ரீராம் பண்டிட் · தலைமை அர்ச்சகர், கோகர்ண க்ஷேத்திரம் (தொலைபேசி: +91 99723 39362)"
};

const DEFAULT_NAMES: Record<string, string> = {
  kn: "ಭಕ್ತರು",
  en: "Devotee",
  hi: "जातक",
  te: "భక్తులు",
  ta: "பக்தர்"
};

function formatText(value: Record<string, string> | string | undefined, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.kn || value.en || "";
}

export const FaceReadingPdfTemplate: React.FC<Props> = ({
  result,
  devoteeName,
  personName,
  lang = "kn"
}) => {
  const code = lang || "kn";
  const header = PDF_HEADERS[code] || PDF_HEADERS.kn;
  const devoteeDisplayName = devoteeName || personName || result.devoteeName || DEFAULT_NAMES[code] || "Devotee";

  const cleanPrediction = result.aiPrediction
    ? result.aiPrediction
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/[*#_`]/g, "")
        .trim()
    : "";

  return (
    <div
      id="facereading-pdf-printable"
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FFFDF7",
        boxSizing: "border-box",
        padding: "16px",
        fontFamily: "'Noto Serif', 'Tiro Kannada', serif",
        color: "#451A03",
        position: "relative"
      }}
    >
      {/* Outer Gold Border */}
      <div
        style={{
          width: "100%",
          border: "3px solid #D97706",
          borderRadius: "12px",
          padding: "16px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "10px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
            {header.top}
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "4px 0 3px 0" }}>
            {header.main}
          </h1>
          <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600 }}>
            {header.sub}
          </div>
        </div>

        {/* Info Grid (Devotee & Face Thumbnail) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "10px", marginBottom: "12px" }}>
          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "4px" }}>
              {DEVOTEE_DETAILS_TITLES[code] || DEVOTEE_DETAILS_TITLES.en}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {devoteeDisplayName}
            </div>
            <div style={{ fontSize: "11px", color: "#92400E", lineHeight: "1.5" }}>
              <div>
                <strong>{ESTIMATED_AGE_TITLES[code] || ESTIMATED_AGE_TITLES.en}</strong>{" "}
                <span style={{ color: "#065F46", fontWeight: 800 }}>
                  ~{result.estimatedAge} {YEARS_LABELS[code] || YEARS_LABELS.en}
                </span>
              </div>
              <div>
                <strong>{MAHAPURUSHA_TITLES[code] || MAHAPURUSHA_TITLES.en}</strong>{" "}
                <span style={{ color: "#78350F", fontWeight: 800 }}>
                  {formatText(result.facialConstitution.mahapurushaArchetype, code)}
                </span>
              </div>
              <div>
                <strong>{TEJAS_TITLES[code] || TEJAS_TITLES.en}</strong>{" "}
                <span style={{ color: "#78350F", fontWeight: 800 }}>
                  {result.overallTejasScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Face Image Thumbnail */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "4px", textAlign: "center" }}>
            {result.imageDataUrl ? (
              <img
                src={result.imageDataUrl}
                alt="Face Photo"
                style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid #F59E0B" }}
              />
            ) : (
              <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#92400E" }}>
                Face Photo
              </div>
            )}
          </div>
        </div>

        {/* All 7 Facial Features Grid in PDF */}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "12px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
            {FEATURES_HEADINGS[code] || FEATURES_HEADINGS.en}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10px", color: "#78350F" }}>
            {(result.features || []).map((f, i) => (
              <div key={i} style={{ background: "#FFFBEB", padding: "4px 6px", borderRadius: "5px", border: "1px solid #FDE68A" }}>
                <strong>{formatText(f.name, code)} ({formatText(f.planetaryRuler, code)}):</strong>
                <div style={{ marginTop: "1px", lineHeight: "1.3" }}>{formatText(f.vedicIndication, code)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 100-Year Age Milestones in PDF */}
        <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "8px", padding: "8px 10px", marginBottom: "12px", fontSize: "10.5px" }}>
          <div style={{ fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
            {MILESTONES_HEADINGS[code] || MILESTONES_HEADINGS.en}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", color: "#92400E" }}>
            {(result.ageMilestones || []).map((m, idx) => (
              <div key={idx} style={{ background: "#FFFFFF", padding: "4px 6px", borderRadius: "4px", border: "1px solid #FDE68A" }}>
                <strong>{formatText(m.agePhase, code)} ({formatText(m.ageWindow, code)}):</strong>{" "}
                <span>{formatText(m.prediction, code)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Content Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #F59E0B",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
            boxShadow: "0 2px 6px rgba(180,83,9,0.06)"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", borderBottom: "1.5px solid #FEF3C7", paddingBottom: "4px", marginBottom: "8px" }}>
            {PREDICTIONS_HEADINGS[code] || PREDICTIONS_HEADINGS.en}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#78350F",
              lineHeight: "1.55",
              whiteSpace: "pre-wrap"
            }}
          >
            {cleanPrediction}
          </div>

          {/* Sacred Temple Remedy in PDF */}
          <div style={{ marginTop: "8px", background: "#FEF3C7", padding: "8px 10px", borderRadius: "6px", border: "1px solid #FCD34D", fontSize: "10.5px", color: "#78350F" }}>
            <strong>{REMEDY_HEADINGS[code] || REMEDY_HEADINGS.en}</strong>{" "}
            {formatText(result.remedyRecommendation, code)}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7" }}>
            {FOOTER_BLESSINGS[code] || FOOTER_BLESSINGS.en}
          </div>
          <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            {PRIEST_CONTACT_LABELS[code] || PRIEST_CONTACT_LABELS.en}
          </div>
        </div>
      </div>
    </div>
  );
};
