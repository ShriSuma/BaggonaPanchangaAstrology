import React from "react";
import type { KundliRemedyDiagnosis, SupportedLanguage } from "../../features/remedies/kundliRemedyEngine";

export type KundliRemedyPdfTemplateProps = {
  diagnosis: KundliRemedyDiagnosis;
  lang?: string;
};

// UI Localization Dictionary for PDF
const PDF_I18N: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ & ಮನಃಶಾಂತಿ ವರದಿ",
    dhyanaShloka: "॥ ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ । ಚಂದ್ರಶೇಖರಂ ಪ್ರಣಮಾಮಿ ಸರ್ವ ಶಾಂತಿ ಪ್ರದಾಯಕಮ್ ॥",
    devotee: "ಜಾತಕರು:",
    gotraSuffix: "ಗೋತ್ರ",
    lagna: "ಲಗ್ನ:",
    rashi: "ರಾಶಿ:",
    nakshatra: "ನಕ್ಷತ್ರ:",
    sec1Title: "೧. ಕುಂಡಲಿ ಗ್ರಹದೋಷ ವಿಶ್ಲೇಷಣೆ & ಮುಖ್ಯ ಸವಾಲು",
    krodhaLabel: "ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ",
    manasLabel: "ಮನೋ ಶಾಂತಿ",
    vitalityLabel: "ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ",
    patienceLabel: "ತಾಳ್ಮೆ / ಧೃತಿ",
    sec2Title: "೨. ತಕ್ಷಣ ಕೋಪ & ಆವೇಶ ಶಮನಗೊಳಿಸುವ ೪-ಹಂತದ ತತ್ತ್ವ",
    emergencyMantraTitle: "ಆಪತ್ಕಾಲೀನ ಮನಃಶಾಂತಿ ಬೀಜ ಮಂತ್ರ (ಮನಸ್ಸಿನಲ್ಲೇ ೧೧ ಬಾರಿ ಜಪಿಸಿ):",
    sec3Title: "೩. ದೈನಂದಿನ ಪ್ರಾತಃಕಾಲ & ಸಂಧ್ಯಾಕಾಲದ ಶಾಂತಿ ನಿಯಮಾವಳಿ",
    morningTab: "🌅 ಮುಂಜಾನೆ (06:00 - 07:30)",
    afternoonTab: "🥗 ಮಧ್ಯಾಹ್ನ & ಆಹಾರ",
    eveningTab: "🪔 ಮುಸ್ಸಂಜೆ & ರಾತ್ರಿ",
    page1Footer: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೧ (ಮುಂದುವರಿದಿದೆ...)",
    sec4Title: "೪. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹಫಲ ಪರಿಹಾರ",
    currentDasha: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ & ಭುಕ್ತಿ:",
    activeKarmicFlow: "ದಶಾ ಪ್ರಭಾವ:",
    remedialStep: "ಪರಿಹಾರ ಕ್ರಮ:",
    sec5Title: "೫. ಜನ್ಮ ಕುಂಡಲಿಗೆ ನಿಗದಿತ ದೈನಂದಿನ ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರ",
    stotraRules: "ಪಠಣ ನಿಯಮ:",
    stotraTiming: "ಸಮಯ:",
    stotraDirection: "ದಿಕ್ಕು:",
    stotraCount: "ಆವರ್ತನೆ:",
    stotraBenefits: "ಫಲಶೃತಿ:",
    sec6Title: "೬. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪವಿತ್ರ ಪರಿಹಾರಗಳು",
    prescribedSeva: "ವಿಶೇಷ ಸೇವೆ:",
    rudraksha: "ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ:",
    gemstone: "ರತ್ನ / ಲೋಹ:",
    daana: "ದಾನ & ಗೋಸೇವೆ:",
    sec7Title: "೭. ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    templeSealLabel: "ಅಧಿಕೃತ ಮುದ್ರೆ",
    priestContact: "ದೂರವಾಣಿ:",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨ (ಸಂಪೂರ್ಣ)"
  },
  en: {
    templeBanner: "॥ SRI GOKARNA MAHABALESHWARA TEMPLE · BAGGONA PANCHANGA ASTROLOGY ॥",
    mainTitle: "Personalized Kundali Astrological Remedy & Pacification Report",
    dhyanaShloka: "॥ Shantakaram Bhujagashayanam Padmanabham Suresham | Chandrashekharam Pranamami Sarva Shanti Pradayakam ॥",
    devotee: "Devotee:",
    gotraSuffix: "Gotra",
    lagna: "Lagna:",
    rashi: "Rashi:",
    nakshatra: "Nakshatra:",
    sec1Title: "1. Kundali Root Cause & Primary Struggle Diagnosis",
    krodhaLabel: "Pitta / Anger Surge",
    manasLabel: "Mental Stability",
    vitalityLabel: "Vitality / Prana Force",
    patienceLabel: "Patience Index",
    sec2Title: "2. 4-Step Instant Anger & Temper Pacification Protocol",
    emergencyMantraTitle: "Emergency Mind Pacification Mantra (Chant 11 times in mind):",
    sec3Title: "3. Daily Morning & Evening Pacification Routine",
    morningTab: "🌅 Morning (06:00 - 07:30)",
    afternoonTab: "🥗 Afternoon & Diet",
    eveningTab: "🪔 Twilight & Night",
    page1Footer: "Baggona Panchanga Astrology · Page 1 of 2 (Continued...)",
    sec4Title: "4. Active Dasha-Bhukti & Gochara (Transit) Shanti",
    currentDasha: "Active Dasha-Bhukti:",
    activeKarmicFlow: "Karmic Effect:",
    remedialStep: "Remedial Action:",
    sec5Title: "5. Designated Daily Classical Vedic Stotra",
    stotraRules: "Recitation Rules:",
    stotraTiming: "Best Time:",
    stotraDirection: "Direction:",
    stotraCount: "Count:",
    stotraBenefits: "Spiritual Benefits:",
    sec6Title: "6. Sacred Sri Gokarna Mahabaleshwara Temple Remedies",
    prescribedSeva: "Prescribed Seva:",
    rudraksha: "Rudraksha:",
    gemstone: "Gemstone / Metal:",
    daana: "Daana & Goseva:",
    sec7Title: "7. Chief Priest Vedic Blessing & Official Temple Seal",
    templeSealLabel: "Official Temple Seal",
    priestContact: "Contact:",
    page2Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 2 of 2 (Complete)"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित वैदिक ज्योतिषीय उपाय एवं मनःशांति रिपोर्ट",
    dhyanaShloka: "॥ शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं । चन्द्रशेखरं प्रणमामि सर्व शान्ति प्रदायकम् ॥",
    devotee: "जातक:",
    gotraSuffix: "गोत्र",
    lagna: "लग्न:",
    rashi: "राशि:",
    nakshatra: "नक्षत्र:",
    sec1Title: "१. कुंडली ग्रहदोष विश्लेषण एवं मुख्य चुनौती",
    krodhaLabel: "क्रोध / पित्त स्तर",
    manasLabel: "मानसिक शांति",
    vitalityLabel: "आत्मबल / प्राणशक्ति",
    patienceLabel: "धैर्य सूचकांक",
    sec2Title: "२. तत्काल क्रोध एवं आवेग शमन हेतु ४-चरणीय विधि",
    emergencyMantraTitle: "आपत्कालीन मनःशांति बीज मंत्र (मन ही मन ११ बार जपें):",
    sec3Title: "३. दैनिक प्रातःकालीन एवं संध्याकालीन शांति नियमावली",
    morningTab: "🌅 प्रातःकाल (06:00 - 07:30)",
    afternoonTab: "🥗 दोपहर एवं आहार",
    eveningTab: "🪔 सायंकाल एवं शयन",
    page1Footer: "बग्गोण पंचांग ज्योतिष · पृष्ठ १ (आगे जारी...)",
    sec4Title: "४. वर्तमान दशा-भुक्ति एवं गोचर ग्रहफल शांति",
    currentDasha: "वर्तमान महादशा एवं भुक्ति:",
    activeKarmicFlow: "दशा प्रभाव:",
    remedialStep: "उपाय क्रम:",
    sec5Title: "५. कुंडली अनुसार निर्धारित दैनिक शास्त्रीय स्तोत्र",
    stotraRules: "पठन नियम:",
    stotraTiming: "समय:",
    stotraDirection: "दिशा:",
    stotraCount: "आवृत्ति:",
    stotraBenefits: "फलश्रुति:",
    sec6Title: "६. श्री गोकर्ण महाबलेश्वर सन्निधि के पावन उपाय",
    prescribedSeva: "विशेष सेवा:",
    rudraksha: "रुद्राक्ष धारण:",
    gemstone: "रत्न / धातु:",
    daana: "दान एवं गौसेवा:",
    sec7Title: "७. प्रधान अर्चक का आशीर्वचन एवं गोकर्ण मुद्रा",
    templeSealLabel: "आधिकारिक मुद्रा",
    priestContact: "संपर्क:",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २ (संपूर्ण)"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి ఆధారిత దైవిక జ్యోతిష్య పరిహార & మనశ్శాంతి నివేదిక",
    dhyanaShloka: "॥ శాంతాకారం భుజగశయనం పద్మనాభం సురేశం । చంద్రశేఖరం ప్రణమామి సర్వ శాంతి ప్రదాయకమ్ ॥",
    devotee: "జాతకుడు:",
    gotraSuffix: "గోత్రం",
    lagna: "లగ్నం:",
    rashi: "రాశి:",
    nakshatra: "నక్షత్రం:",
    sec1Title: "1. కుండలి గ్రహదోష విశ్లేషణ & ప్రధాన సవాలు",
    krodhaLabel: "క్రోధం / పిత్తం",
    manasLabel: "మనశ్శాంతి",
    vitalityLabel: "ఆత్మబలం",
    patienceLabel: "ఓపిక",
    sec2Title: "2. తక్షణ కోపం & ఆవేశ నివారణ 4-దశల విధానం",
    emergencyMantraTitle: "ఆపత్కాలీన మనశ్శాంతి బీజ మంత్రం (మనస్సులో 11 సార్లు జపించండి):",
    sec3Title: "3. దైనందిన ప్రాతఃకాల & సంధ్యా సమయ నియమావళి",
    morningTab: "🌅 ఉదయం (06:00 - 07:30)",
    afternoonTab: "🥗 మధ్యాహ్నం & ఆహారం",
    eveningTab: "🪔 సాయంత్రం & రాత్రి",
    page1Footer: "బగ్గోణ పంచాంగ జ్యోతిష్యం · పేజీ 1 (కొనసాగింపు...)",
    sec4Title: "4. ప్రస్తుత దశా-భుక్తి & గోచార గ్రహ పరిహారాలు",
    currentDasha: "ప్రస్తుత మహాదశ & భుక్తి:",
    activeKarmicFlow: "దశా ప్రభావం:",
    remedialStep: "పరిహార మార్గం:",
    sec5Title: "5. జన్మ కుండలికి నిర్దేశించిన నిత్య స్తోత్రం",
    stotraRules: "పఠన నియమం:",
    stotraTiming: "సమయం:",
    stotraDirection: "దిశ:",
    stotraCount: "సంఖ్య:",
    stotraBenefits: "ఫలితం:",
    sec6Title: "6. శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్ర పవిత్ర పరిహారాలు",
    prescribedSeva: "విశేష సేవ:",
    rudraksha: "రుద్రాక్ష ధారణ:",
    gemstone: "రత్నం / లోహం:",
    daana: "దానం & గోసేవ:",
    sec7Title: "7. ప్రధాన అర్చకుల ఆశీర్వచనం & గోకర్ణ ముద్ర",
    templeSealLabel: "అధికారిక ముద్ర",
    priestContact: "ఫోన్:",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2 (సంపూర్ణం)"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜாதக அடிப்படையிலான தெய்வீக பரிகாரம் & மன அமைதி அறிக்கை",
    dhyanaShloka: "॥ சாந்தாகாரம் புஜகசயனம் பத்மநாபம் ஸுரேசம் । சந்த்ரசேகரம் ப்ரணமாமி ஸர்வ சாந்தி ப்ரதாயகம் ॥",
    devotee: "ஜாதகர்:",
    gotraSuffix: "கோத்திரம்",
    lagna: "லக்னம்:",
    rashi: "ராசி:",
    nakshatra: "நட்சத்திரம்:",
    sec1Title: "1. ஜாதக கிரக தோஷ பகுப்பாய்வு & முக்கிய சவால்",
    krodhaLabel: "கோபம் / பித்தம்",
    manasLabel: "மன அமைதி",
    vitalityLabel: "ஆத்ம பலம்",
    patienceLabel: "பொறுமை",
    sec2Title: "2. உடனடி கோபத்தை தணிக்கும் 4-படிமுறை விதிகள்",
    emergencyMantraTitle: "அவசர மன அமைதி பீஜ மந்திரம் (மனதில் 11 முறை ஜபிக்கவும்):",
    sec3Title: "3. தினசரி காலை மற்றும் மாலை வழிபாட்டு முறைகள்",
    morningTab: "🌅 காலை (06:00 - 07:30)",
    afternoonTab: "🥗 மதியம் & உணவு",
    eveningTab: "🪔 மாலை & இரவு",
    page1Footer: "பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 1 (தொடர்கிறது...)",
    sec4Title: "4. நடப்பு திசை-புக்தி & கோசார கிரக பரிகாரங்கள்",
    currentDasha: "நடப்பு மகாதிசை & புக்தி:",
    activeKarmicFlow: "திசை பலன்:",
    remedialStep: "பரிகாரம்:",
    sec5Title: "5. ஜாதகத்திற்குரிய தினசரி ஸ்தோத்திரம்",
    stotraRules: "வழிபாட்டு விதி:",
    stotraTiming: "நேரம்:",
    stotraDirection: "திசை:",
    stotraCount: "எண்ணிக்கை:",
    stotraBenefits: "பலன்கள்:",
    sec6Title: "6. ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலய வழிபாடுகள்",
    prescribedSeva: "சிறப்பு பூஜை:",
    rudraksha: "ருத்ராட்சம்:",
    gemstone: "ரத்தினம் / உலோகம்:",
    daana: "தானம் & கோபூஜை:",
    sec7Title: "7. தலைமை அர்ச்சகரின் ஆசி & ஆலய முத்திரை",
    templeSealLabel: "அங்கீகரிக்கப்பட்ட முத்திரை",
    priestContact: "தொலைபேசி:",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 2 (முழுமை)"
  }
};

export const KundliRemedyPdfTemplate: React.FC<KundliRemedyPdfTemplateProps> = ({
  diagnosis,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2) as SupportedLanguage;
  const isKn = code === "kn";
  const i18n = PDF_I18N[code] || PDF_I18N.kn;

  const {
    devoteeName,
    birthDate,
    birthTime,
    gotra,
    lagnaName,
    rashiName,
    nakshatraName,
    primaryStruggle,
    afflictionFactors,
    psychologicalProfile,
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing
  } = diagnosis;

  const stotra = personalizedStotras[0] || personalizedStotras[1];

  const getShlokaByLang = (st: typeof stotra) => {
    if (!st) return "";
    if (code === "te") return st.shlokaTelugu;
    if (code === "ta") return st.shlokaTamil;
    if (code === "hi") return st.shlokaHindi;
    if (code === "en") return st.shlokaSanskrit;
    return st.shlokaKannada;
  };

  const getBeejaMantraByLang = (bm: typeof instantCalmingProtocol.emergencyBeejaMantra) => {
    if (code === "te") return bm.telugu;
    if (code === "ta") return bm.tamil;
    if (code === "hi") return bm.hindi;
    if (code === "en") return bm.sanskrit;
    return bm.kannada;
  };

  // Robust Indic font stack with zero-broken vattaksharas
  const fontFamily = isKn
    ? "'Noto Serif Kannada', 'Tiro Kannada', 'Kaveri', 'Segoe UI', serif, sans-serif"
    : code === "te"
    ? "'Noto Serif Telugu', 'Tiro Telugu', serif, sans-serif"
    : code === "ta"
    ? "'Noto Serif Tamil', 'Tiro Tamil', serif, sans-serif"
    : code === "hi"
    ? "'Noto Serif Devanagari', 'Tiro Devanagari Hindi', serif, sans-serif"
    : "'Cinzel', 'Noto Serif', 'Georgia', serif, sans-serif";

  return (
    <div
      id="kundli-remedy-pdf-container"
      style={{
        width: "794px",
        display: "flex",
        flexDirection: "column",
        background: "#FFFDF7",
        fontFamily,
        color: "#261605",
        WebkitFontSmoothing: "antialiased"
      }}
    >
      {/* ====================================================================== */}
      {/* PAGE 1: ASTROLOGICAL DIAGNOSIS & ANGER/STRESS PACIFICATION PROTOCOL    */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
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
              borderRadius: "10px",
              padding: "10px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "17.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "3px", lineHeight: 1.35 }}>
              {i18n.mainTitle}
            </div>
            <div style={{ fontSize: "11px", color: "#FEF08A", marginTop: "2px", fontStyle: "italic", lineHeight: 1.4 }}>
              {i18n.dhyanaShloka}
            </div>
          </div>

          {/* Devotee Info Matrix */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "9px 14px",
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
              gap: "8px",
              fontSize: "12px",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>👤 {i18n.devotee}</span>{" "}
              <span style={{ color: "#451A03", fontWeight: 900 }}>{devoteeName}</span>
              {gotra && <span style={{ color: "#92400E", fontSize: "11px", display: "block" }}>({gotra} {i18n.gotraSuffix})</span>}
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🏛️ {i18n.lagna}</span>{" "}
              <span style={{ color: "#065F46", fontWeight: 900 }}>{lagnaName[code] || lagnaName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🌙 {i18n.rashi}</span>{" "}
              <span style={{ color: "#92400E", fontWeight: 900 }}>{rashiName[code] || rashiName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>⭐ {i18n.nakshatra}</span>{" "}
              <span style={{ color: "#1E3A8A", fontWeight: 900 }}>{nakshatraName[code] || nakshatraName.kn}</span>
            </div>
          </div>

          {/* Section 1: Astrological Diagnosis & Struggle Identification */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "7px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🔍 {i18n.sec1Title}</span>
              <span
                style={{
                  background: primaryStruggle.intensity === "High" ? "#FEE2E2" : "#FEF3C7",
                  color: primaryStruggle.intensity === "High" ? "#991B1B" : "#92400E",
                  border: `1px solid ${primaryStruggle.intensity === "High" ? "#F87171" : "#FBBF24"}`,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 800
                }}
              >
                {primaryStruggle.intensityLabel[code] || primaryStruggle.intensityLabel.kn}
              </span>
            </div>

            <div style={{ fontSize: "12px", color: "#451A03", lineHeight: 1.55, fontWeight: 700 }}>
              <span style={{ color: "#991B1B" }}>• {primaryStruggle.title[code] || primaryStruggle.title.kn}:</span>{" "}
              <span style={{ color: "#27272A", fontWeight: 500 }}>{primaryStruggle.description[code] || primaryStruggle.description.kn}</span>
            </div>

            {/* Affliction Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
              {afflictionFactors.slice(0, 2).map((af, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    borderRadius: "6px",
                    padding: "7px 10px",
                    fontSize: "11.5px",
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E" }}>🔥 {af.title[code] || af.title.kn}</div>
                  <div style={{ color: "#451A03", marginTop: "2px" }}>{af.reason[code] || af.reason.kn}</div>
                </div>
              ))}
            </div>

            {/* Psychological & Temperament Meters */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginTop: "8px",
                paddingTop: "6px",
                borderTop: "1px dashed #E5E7EB",
                textAlign: "center"
              }}
            >
              <div style={{ background: "#FEF2F2", padding: "6px 4px", borderRadius: "6px", border: "1px solid #FECACA" }}>
                <div style={{ color: "#991B1B", fontWeight: 800, fontSize: "11px" }}>{i18n.krodhaLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#B91C1C", marginTop: "1px" }}>{psychologicalProfile.krodhaLevel}%</div>
              </div>
              <div style={{ background: "#F0FDF4", padding: "6px 4px", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <div style={{ color: "#166534", fontWeight: 800, fontSize: "11px" }}>{i18n.manasLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#15803D", marginTop: "1px" }}>{psychologicalProfile.manasStability}%</div>
              </div>
              <div style={{ background: "#EFF6FF", padding: "6px 4px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <div style={{ color: "#1E40AF", fontWeight: 800, fontSize: "11px" }}>{i18n.vitalityLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#1D4ED8", marginTop: "1px" }}>{psychologicalProfile.vitalityScore}%</div>
              </div>
              <div style={{ background: "#FAF5FF", padding: "6px 4px", borderRadius: "6px", border: "1px solid #E9D5FF" }}>
                <div style={{ color: "#6B21A8", fontWeight: 800, fontSize: "11px" }}>{i18n.patienceLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#7E22CE", marginTop: "1px" }}>{psychologicalProfile.patienceIndex}%</div>
              </div>
            </div>
          </div>

          {/* Section 2: 4-Step Instant Anger Calming Protocol */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "6px"
              }}
            >
              ⚡ {i18n.sec2Title}
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", marginBottom: "7px", fontWeight: 700, lineHeight: 1.45 }}>
              {instantCalmingProtocol.subtitle[code] || instantCalmingProtocol.subtitle.kn}
            </div>

            {/* 4-Step Action Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {instantCalmingProtocol.steps.map(step => (
                <div
                  key={step.stepNumber}
                  style={{
                    background: "#FEFCE8",
                    border: "1px solid #FDE047",
                    borderRadius: "6px",
                    padding: "7px 10px",
                    fontSize: "11.5px",
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#92400E" }}>
                    <span>{step.icon} {step.name[code] || step.name.kn}</span>
                    <span style={{ fontSize: "10.5px", background: "#FEF08A", padding: "1px 6px", borderRadius: "8px", color: "#854D0E" }}>
                      {typeof step.duration === "object" ? step.duration[code] || step.duration.kn : step.duration}
                    </span>
                  </div>
                  <div style={{ color: "#451A03", marginTop: "3px", fontWeight: 700 }}>
                    {step.action[code] || step.action.kn}
                  </div>
                  <div style={{ color: "#713F12", marginTop: "2px", fontSize: "11px", lineHeight: 1.45 }}>
                    {step.detail[code] || step.detail.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Beeja Japa Box */}
            <div
              style={{
                marginTop: "8px",
                background: "linear-gradient(135deg, #451A03 0%, #78350F 100%)",
                borderRadius: "7px",
                padding: "8px 12px",
                color: "#FFFFFF",
                border: "1.5px solid #F59E0B",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 800, marginBottom: "2px" }}>
                🕉️ {i18n.emergencyMantraTitle}
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "normal", lineHeight: 1.6 }}>
                {getBeejaMantraByLang(instantCalmingProtocol.emergencyBeejaMantra)}
              </div>
              <div style={{ fontSize: "11px", color: "#FEF08A", marginTop: "2px", lineHeight: 1.45 }}>
                {instantCalmingProtocol.emergencyBeejaMantra.meaning[code] || instantCalmingProtocol.emergencyBeejaMantra.meaning.kn}
              </div>
            </div>
          </div>

          {/* Section 3: Daily Morning & Evening Pacification Routine */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "7px"
              }}
            >
              🗓️ {i18n.sec3Title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {/* Morning */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "6px", padding: "7px 9px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#92400E", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px", marginBottom: "4px" }}>
                  {i18n.morningTab}
                </div>
                {dailyPacificationRoutine.morning.map((m, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "5px" }}>
                    <span style={{ fontWeight: 800, color: "#451A03" }}>{m.icon} {m.title[code] || m.title.kn}:</span>{" "}
                    <span style={{ color: "#78350F" }}>{m.desc[code] || m.desc.kn}</span>
                  </div>
                ))}
              </div>

              {/* Afternoon / Diet */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "7px 9px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#166534", borderBottom: "1px dashed #86EFAC", paddingBottom: "3px", marginBottom: "4px" }}>
                  {i18n.afternoonTab}
                </div>
                {dailyPacificationRoutine.afternoonLifestyle.map((a, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "5px" }}>
                    <span style={{ fontWeight: 800, color: "#14532D" }}>{a.icon} {a.title[code] || a.title.kn}:</span>{" "}
                    <span style={{ color: "#166534" }}>{a.desc[code] || a.desc.kn}</span>
                  </div>
                ))}
              </div>

              {/* Evening / Night */}
              <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: "6px", padding: "7px 9px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#6B21A8", borderBottom: "1px dashed #D8B4FE", paddingBottom: "3px", marginBottom: "4px" }}>
                  {i18n.eveningTab}
                </div>
                {dailyPacificationRoutine.evening.map((e, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "5px" }}>
                    <span style={{ fontWeight: 800, color: "#581C87" }}>{e.icon} {e.title[code] || e.title.kn}:</span>{" "}
                    <span style={{ color: "#6B21A8" }}>{e.desc[code] || e.desc.kn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px solid #D97706",
              paddingTop: "6px"
            }}
          >
            {i18n.page1Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: DASHA/GOCHARA SHANTI, STOTRAS, GOKARNA SEVAS & PRIEST SEAL     */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
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
              borderRadius: "10px",
              padding: "9px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "17.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.35 }}>
              {i18n.mainTitle}
            </div>
          </div>

          {/* Section 4: Dasha-Bhukti & Gochara Transits */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "7px"
              }}
            >
              🪐 {i18n.sec4Title}
            </div>

            {/* Dasha Card */}
            <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", lineHeight: 1.55 }}>
              <div style={{ fontWeight: 800, color: "#92400E" }}>
                <span>⏳ {i18n.currentDasha} </span>
                <span style={{ color: "#B45309", fontWeight: 900 }}>
                  {dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.kn} ಮಹಾದಶೆ — {dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.kn} ಭುಕ್ತಿ
                </span>
              </div>
              <div style={{ color: "#451A03", marginTop: "3px" }}>
                <span style={{ fontWeight: 800 }}>• {i18n.activeKarmicFlow} </span>
                {dashaBhuktiAnalysis.periodEffect[code] || dashaBhuktiAnalysis.periodEffect.kn}
              </div>
              <div style={{ color: "#065F46", marginTop: "3px", fontWeight: 700 }}>
                <span style={{ fontWeight: 800 }}>• {i18n.remedialStep} </span>
                {dashaBhuktiAnalysis.remedialAction[code] || dashaBhuktiAnalysis.remedialAction.kn}
              </div>
            </div>

            {/* Gochara Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
              {gocharaTransitAnalysis.transitHighlights.map((gh, idx) => (
                <div
                  key={idx}
                  style={{
                    background: gh.effect === "Challenging" ? "#FEF2F2" : "#F0FDF4",
                    border: `1px solid ${gh.effect === "Challenging" ? "#FECACA" : "#BBF7D0"}`,
                    borderRadius: "6px",
                    padding: "7px 10px",
                    fontSize: "11.5px",
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ fontWeight: 800, color: gh.effect === "Challenging" ? "#991B1B" : "#166534" }}>
                    {gh.effect === "Challenging" ? "⚠️" : "✨"} {gh.title[code] || gh.title.kn}
                  </div>
                  <div style={{ color: "#451A03", marginTop: "2px" }}>
                    {gh.description[code] || gh.description.kn}
                  </div>
                  <div style={{ color: gh.effect === "Challenging" ? "#B91C1C" : "#15803D", marginTop: "2px", fontWeight: 700 }}>
                    {gh.remedy[code] || gh.remedy.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Sade Sati Status Alert */}
            <div
              style={{
                marginTop: "8px",
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "12px",
                color: "#92400E",
                fontWeight: 800,
                lineHeight: 1.5
              }}
            >
              {gocharaTransitAnalysis.sadeSatiStatus[code] || gocharaTransitAnalysis.sadeSatiStatus.kn}
            </div>
          </div>

          {/* Section 5: Personalized Daily Classical Stotra */}
          {stotra && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #D97706",
                borderRadius: "9px",
                padding: "10px 14px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 900,
                  color: "#78350F",
                  borderBottom: "1.5px solid #FDE68A",
                  paddingBottom: "5px",
                  marginBottom: "7px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>📜 {i18n.sec5Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", fontWeight: 800, background: "#FEF08A", padding: "2px 8px", borderRadius: "10px" }}>
                  {stotra.dedicatedTo[code] || stotra.dedicatedTo.kn}
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", marginBottom: "5px" }}>
                ✨ {stotra.title[code] || stotra.title.kn}
              </div>

              {/* Shloka Box with pristine vattaksharas */}
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FCD34D",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#451A03",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                  letterSpacing: "normal"
                }}
              >
                {getShlokaByLang(stotra)}
              </div>

              <div style={{ fontSize: "11.5px", color: "#78350F", marginTop: "6px", lineHeight: 1.55 }}>
                <span style={{ fontWeight: 800, color: "#92400E" }}>• ಅರ್ಥ:</span> {stotra.meaning[code] || stotra.meaning.kn}
              </div>

              {/* Stotra Metadata Rules */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.3fr",
                  gap: "6px",
                  marginTop: "6px",
                  paddingTop: "5px",
                  borderTop: "1px dashed #FDE68A",
                  fontSize: "11px"
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>⏰ {i18n.stotraTiming}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.bestTimeToRecite[code] || stotra.bestTimeToRecite.kn}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>🧭 {i18n.stotraDirection}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.facingDirection[code] || stotra.facingDirection.kn}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>📿 {i18n.stotraCount}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.recitationCount[code] || stotra.recitationCount.kn}</span>
                </div>
              </div>

              <div style={{ fontSize: "11.5px", color: "#065F46", marginTop: "4px", fontWeight: 700, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 800 }}>🌿 {i18n.stotraBenefits} </span>
                {stotra.spiritualBenefits[code] || stotra.spiritualBenefits.kn}
              </div>
            </div>
          )}

          {/* Section 6: Sacred Gokarna Mahabaleshwara Remedies */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "7px"
              }}
            >
              🪔 {i18n.sec6Title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {/* Prescribed Seva */}
              <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "7px 10px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🔱 {i18n.prescribedSeva}</div>
                <div style={{ color: "#451A03", fontWeight: 800, marginTop: "2px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.name[code] || gokarnaTempleRemedies.prescribedSeva.name.kn}
                </div>
                <div style={{ color: "#78350F", fontSize: "11px", marginTop: "2px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.temple[code] || gokarnaTempleRemedies.prescribedSeva.temple.kn}
                </div>
                <div style={{ color: "#065F46", fontSize: "11px", marginTop: "2px", fontWeight: 700 }}>
                  📅 {gokarnaTempleRemedies.prescribedSeva.idealDay[code] || gokarnaTempleRemedies.prescribedSeva.idealDay.kn}
                </div>
              </div>

              {/* Rudraksha, Gemstone, Daana */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "6px", padding: "7px 10px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>📿 {i18n.rudraksha}</span>{" "}
                  <span style={{ color: "#451A03", fontWeight: 700 }}>
                    {gokarnaTempleRemedies.rudrakshaRecommendation.mukhi[code] || gokarnaTempleRemedies.rudrakshaRecommendation.mukhi.kn}
                  </span>
                </div>
                <div style={{ marginTop: "3px" }}>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>💎 {i18n.gemstone}</span>{" "}
                  <span style={{ color: "#451A03" }}>
                    {gokarnaTempleRemedies.gemstoneRecommendation.stone[code] || gokarnaTempleRemedies.gemstoneRecommendation.stone.kn} ({gokarnaTempleRemedies.gemstoneRecommendation.metal[code] || gokarnaTempleRemedies.gemstoneRecommendation.metal.kn})
                  </span>
                </div>
                <div style={{ marginTop: "3px" }}>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>🌾 {i18n.daana}</span>{" "}
                  <span style={{ color: "#451A03" }}>
                    {gokarnaTempleRemedies.donationDaana.item[code] || gokarnaTempleRemedies.donationDaana.item.kn} — {gokarnaTempleRemedies.donationDaana.beneficiary[code] || gokarnaTempleRemedies.donationDaana.beneficiary.kn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Chief Priest Shreeram Pandit Blessing & Seal */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              display: "grid",
              gridTemplateColumns: "1fr 85px",
              gap: "12px",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
                🙏 {chiefPriestBlessing.priestName[code] || chiefPriestBlessing.priestName.kn}
              </div>
              <div style={{ fontSize: "11px", color: "#92400E", fontWeight: 700 }}>
                {chiefPriestBlessing.priestTitle[code] || chiefPriestBlessing.priestTitle.kn} · {i18n.priestContact} {chiefPriestBlessing.phone}
              </div>
              <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: 800, marginTop: "4px", lineHeight: 1.5 }}>
                {chiefPriestBlessing.sanskritAshirvada}
              </div>
              <div style={{ fontSize: "11.5px", color: "#451A03", marginTop: "3px", lineHeight: 1.5, fontStyle: "italic" }}>
                {chiefPriestBlessing.ashirvadaMeaning[code] || chiefPriestBlessing.ashirvadaMeaning.kn}
              </div>
            </div>

            {/* Official Temple Seal Graphic */}
            <div
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                border: "2px double #B45309",
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "4px",
                boxSizing: "border-box",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ fontSize: "16px" }}>🪔</div>
              <div style={{ fontSize: "7.5px", fontWeight: 900, color: "#78350F", lineHeight: 1.2, marginTop: "1px" }}>
                ॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥
              </div>
              <div style={{ fontSize: "6.5px", color: "#92400E", fontWeight: 800 }}>
                {i18n.templeSealLabel}
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px solid #D97706",
              paddingTop: "6px"
            }}
          >
            {i18n.page2Footer}
          </div>
        </div>
      </div>
    </div>
  );
};
