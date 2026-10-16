import React from "react";
import type { PackageLang } from "./packageDownloadLocale";

export interface PackageQuestionItem {
  id: string;
  topicId: string;
  topicLabel: string;
  smartHeader?: string;
  questionText: string;
  answer?: {
    paragraph1: string; // House & Natal Chart Analysis
    paragraph2: string; // Dasha & Planetary Transits
    paragraph3: string; // Specific Prediction & Timing Window
    paragraph4: string; // Vedic Remedies & Divine Prayer
  };
}

interface Props {
  id: string;
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  rashiName: string;
  nakshatraName: string;
  questions: PackageQuestionItem[];
  lang: PackageLang;
}

const UI_TITLES: Record<PackageLang, Record<string, string>> = {
  kn: {
    banner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    title: "ಬಗ್ಗೋಣ ದಿವ್ಯ ಭವಿಷ್ಯ - ಪ್ರಶ್ನೋತ್ತರ ಹಾಗೂ ಶಮನ ಪರಿಹಾರ ವರದಿ",
    subtitle: "ಜಾತಕ ಆಧಾರಿತ ಭಾವ ವಿಶ್ಲೇಷಣೆ, ದಶಾ-ಗೋಚಾರ ಪ್ರಭಾವ, ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ ಹಾಗೂ ದೈವಿಕ ಪರಿಹಾರಗಳ ಲಿಖಿತ ಪತ್ರ",
    questionLabel: "ಜಾತಕರ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ:",
    p1Heading: "೧. ಭಾವ ಹಾಗೂ ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ (Natal Chart Analysis)",
    p2Heading: "೨. ದಶಾಕಾಲ ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರ ಫಲ (Dasha & Transits)",
    p3Heading: "೩. ನಿಖರ ಭವಿಷ್ಯಫಲ ಹಾಗೂ ಸಮಯ ಸಿದ್ಧಿ (Timing & Prediction)",
    p4Heading: "೪. ವೈದಿಕ ಶಮನ ಪರಿಹಾರ, ಮಂತ್ರ & ಪ್ರಾರ್ಥನೆ (Divine Remedies)",
    footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ"
  },
  en: {
    banner: "॥ Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga Astrology ॥",
    title: "Baggona Divya Bhavishya - Astrological Q&A & Remedy Dossier",
    subtitle: "Comprehensive astrological answers covering house analysis, dasha transits, timing, and Vedic remedies.",
    questionLabel: "Devotee's Inquired Question:",
    p1Heading: "1. House Significations & Natal Planetary Placements",
    p2Heading: "2. Dasha Timeline & Planetary Transits Influence",
    p3Heading: "3. Prediction & Precise Timing Window",
    p4Heading: "4. Vedic Remedies, Mantras & Sacred Prayers",
    footer: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga Astrology"
  },
  hi: {
    banner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    title: "बग्गोण दिव्य भविष्य - प्रश्नोत्तर एवं समाधान रिपोर्ट",
    subtitle: "कुंडली भाव विश्लेषण, दशा-गोचर प्रभाव, सटीक समय सिद्धि एवं वैदिक समाधान का प्रामाणिक पत्र",
    questionLabel: "जातक का विशिष्ट प्रश्न:",
    p1Heading: "१. भाव एवं जन्म ग्रहों की स्थिति विश्लेषण",
    p2Heading: "२. दशा काल एवं ग्रह गोचर फल",
    p3Heading: "३. सटीक भविष्यफल एवं समय सिद्धि",
    p4Heading: "४. वैदिक समाधान, मंत्र एवं प्रार्थना",
    footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष"
  },
  te: {
    banner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    title: "బగ్గోణ దివ్య భవిష్యత్తు - ప్రశ్నోత్తర మరియు శమన పరిహార నివేదిక",
    subtitle: "జాతక భావ విశ్లేషణ, దశా-గోచార ప్రభావం, సమయ ప్రాప్తి మరియు పరిహారాల అధికారిక పత్రం",
    questionLabel: "జాతకుల నిర్దిష్ట ప్రశ్న:",
    p1Heading: "1. భావ మరియు జన్మ గ్రహాల స్థితి విశ్లేషణ",
    p2Heading: "2. దశాకాలం మరియు గ్రహ గోచార ఫలం",
    p3Heading: "3. ఖచ్చిత భవిష్యత్తు మరియు సమయ సిద్ధత",
    p4Heading: "4. వైదిక శమన పరిహారం, మంత్రం & ప్రార్థన",
    footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం"
  },
  ta: {
    banner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்க ஜோதிடம் ॥",
    title: "பக்கோண திவ்ய பவிஷ்யா - கேள்வி பதில் மற்றும் பரிகார அறிக்கை",
    subtitle: "ஜாதக பாவக ஆய்வு, தசா-கோச்சார தாக்கம், கால நேரம் மற்றும் பரிகாரங்களின் எழுத்துப்பூர்வ அறிக்கை",
    questionLabel: "ஜாதகரின் பிரத்யேக கேள்வி:",
    p1Heading: "1. பாவம் மற்றும் பிறப்பு கிரகங்களின் நிலை பகுப்பாய்வு",
    p2Heading: "2. தசா காலம் மற்றும் கிரக கோச்சார பலன்",
    p3Heading: "3. துல்லியமான எதிர்கால பலன் மற்றும் கால நேரம்",
    p4Heading: "4. வைதிக சாந்தி பரிகாரம், மந்திரம் & பிரார்த்தனை",
    footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம்"
  }
};

export const DivyaBhavishyaQnaPdfTemplate: React.FC<Props> = ({
  id,
  devoteeName,
  birthDate,
  birthTime,
  rashiName,
  nakshatraName,
  questions,
  lang
}) => {
  const dict = UI_TITLES[lang] || UI_TITLES.kn;

  return (
    <div id={id} className="pdf-container" style={{ width: 900, backgroundColor: "#FFFDF7", color: "#1E293B", fontFamily: "'Noto Sans Kannada', 'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      {questions.map((q, qIndex) => {
        const headerTitle = q.smartHeader || q.topicLabel;
        const ans = q.answer || {
          paragraph1: "ಜಾತಕರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿನ ಭಾವ ಹಾಗೂ ಕಾರಕ ಗ್ರಹಗಳ ಸ್ಥಾನವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.",
          paragraph2: "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ ಹಾಗೂ ಅಂತರ್ದಶೆಯು ಈ ಪ್ರಶ್ನೆಗೆ ಪೂರಕ ಫಲಗಳನ್ನು ನೀಡಲಿದೆ.",
          paragraph3: "ಮುಂದಿನ ೩ ರಿಂದ ೬ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ಶುಭ ಫಲಗಳು ಗೋಚರವಾಗಲಿವೆ.",
          paragraph4: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ಆಚರಿಸಿ."
        };

        return (
          <div key={q.id || qIndex} className="pdf-page" style={{ width: 900, minHeight: 1250, padding: "32px 36px", boxSizing: "border-box", borderBottom: qIndex < questions.length - 1 ? "2px dashed #E2E8F0" : "none" }}>
            {/* Header */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #D4AF37", paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", letterSpacing: 1.5, textTransform: "uppercase" }}>
                {dict.banner}
              </div>
              <h1 style={{ fontSize: 19, fontWeight: 800, color: "#78350F", margin: "6px 0 4px" }}>
                {dict.title}
              </h1>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                {dict.subtitle}
              </div>
            </div>

            {/* Devotee Info */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 10, backgroundColor: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D", marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜಾತಕರು:</span>{" "}
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1E293B" }}>{devoteeName || "Devotee"}</span>
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜನನ ದಿನಾಂಕ:</span>{" "}
                <span style={{ fontSize: 11, fontWeight: 600 }}>{birthDate}</span>
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಚಂದ್ರ ರಾಶಿ:</span>{" "}
                <span style={{ fontSize: 11, fontWeight: 700 }}>{rashiName}</span>
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜನ್ಮ ನಕ್ಷತ್ರ:</span>{" "}
                <span style={{ fontSize: 11, fontWeight: 700 }}>{nakshatraName}</span>
              </div>
            </div>

            {/* Question Card Banner */}
            <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 14, backgroundColor: "#FFFBEB", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#78350F" }}>
                  {headerTitle}
                </span>
                <span style={{ backgroundColor: "#F59E0B", color: "#FFFFFF", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                  ಪ್ರಶ್ನೆ #{qIndex + 1}
                </span>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "#64748B", marginBottom: 4 }}>
                {dict.questionLabel}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", fontStyle: "italic", backgroundColor: "#FFFFFF", padding: "8px 12px", borderRadius: 6, border: "1px solid #FDE68A" }}>
                "{q.questionText}"
              </div>
            </div>

            {/* 4 Detailed Paragraphs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {/* P1: Bhava Analysis */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 12, backgroundColor: "#FFFFFF" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 6 }}>
                  {dict.p1Heading}
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.65, color: "#334155", margin: 0 }}>
                  {ans.paragraph1}
                </p>
              </div>

              {/* P2: Dasha & Transits */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 12, backgroundColor: "#FFFFFF" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#78350F", marginBottom: 6 }}>
                  {dict.p2Heading}
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.65, color: "#334155", margin: 0 }}>
                  {ans.paragraph2}
                </p>
              </div>

              {/* P3: Timing & Prediction */}
              <div style={{ border: "1px solid #FCD34D", borderRadius: 8, padding: 12, backgroundColor: "#FFFDF0" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#B45309", marginBottom: 6 }}>
                  {dict.p3Heading}
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.65, color: "#451A03", margin: 0, fontWeight: 500 }}>
                  {ans.paragraph3}
                </p>
              </div>

              {/* P4: Vedic Remedies */}
              <div style={{ border: "1px solid #BBF7D0", borderRadius: 8, padding: 12, backgroundColor: "#F0FDF4" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#166534", marginBottom: 6 }}>
                  {dict.p4Heading}
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.65, color: "#14532D", margin: 0 }}>
                  {ans.paragraph4}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
              {dict.footer} · ({qIndex + 1}/{questions.length})
            </div>
          </div>
        );
      })}
    </div>
  );
};
