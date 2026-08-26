import type { KaalaDiksuchiLang } from "./kaaladiksuchiTypes";

export type L5Dict = Record<KaalaDiksuchiLang, string>;

export function pickL5(dict: Partial<Record<KaalaDiksuchiLang, string>> | undefined, lang: string): string {
  if (!dict) return "";
  const code = (lang || "kn").slice(0, 2) as KaalaDiksuchiLang;
  return dict[code] || dict["kn"] || dict["en"] || "";
}

export const T_KAALA_DIKSUCHI = {
  navTitle: {
    kn: "🧭 ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ (No-TOB Astrology)",
    en: "🧭 Divya Kaala Diksuchi (No-TOB Astrology)",
    hi: "🧭 दिव्य काल दिक्सूची (बिना जन्म समय फल)",
    te: "🧭 దివ్య కాల దిక్సూచి (జన్మ సమయం లేని జ్యోతిష్యం)",
    ta: "🧭 திவ்ய கால திக்சூசி (பிறந்த நேரம் தேவையில்லை)"
  },
  heroTitle: {
    kn: "ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ & ಆಧುನಿಕ ಜೀವನ ಮಾರ್ಗದರ್ಶನ",
    en: "Divya Kaala Diksuchi: Cosmic Life Navigator",
    hi: "दिव्य काल दिक्सूची एवं आधुनिक जीवन मार्गदर्शन",
    te: "దివ్య కాల దిక్సూచి & ఆధునిక జీవన మార్గదర్శనం",
    ta: "திவ்ய கால திக்சூசி & நவீன வாழ்க்கை வழிகாட்டி"
  },
  heroSubtitle: {
    kn: "ಜನ್ಮ ಸಮಯವಿಲ್ಲದೆ ನಿಖರ ಗ್ರಹ, ಸಾಮುದ್ರಿಕ ಲಕ್ಷಣ, ಸಂಖ್ಯಾ ಹಾಗೂ ವರ್ತಮಾನ ಜಗತ್ತಿನ ಮುನ್ನಡೆ ರಹಸ್ಯಗಳ ಅನಾವರಣ",
    en: "100% Accurate Astrological, Samudrika & Modern World Blueprint without requiring exact Time of Birth",
    hi: "सटीक जन्म समय के बिना प्रामाणिक ग्रह, सामुद्रिक लक्षण एवं आधुनिक युग में उन्नति का दिव्य नक्शा",
    te: "ఖచ్చితమైన జన్మ సమయం లేకుండా ప్రామాణిక గ్రహ, సాముద్రిక లక్షణ మరియు వర్తమాన ప్రపంచ జీవన ప్రణాళిక",
    ta: "பிறந்த நேரம் இன்றி துல்லியமான கிரக, சாமுத்ரிகா மற்றும் நவீன உலக வாழ்க்கை வழிகாட்டி"
  },
  tabCosmicMatrix: {
    kn: "🌌 ದಿವ್ಯ ಗ್ರಹ ಮಂಡಲ & ಜನ್ಮ ಚಕ್ರ",
    en: "🌌 Cosmic Matrix & Chart",
    hi: "🌌 दिव्य ग्रह मंडल एवं जन्म चक्र",
    te: "🌌 దివ్య గ్రహ మండలం & చక్రం",
    ta: "🌌 திவ்ய கிரக மண்டலம் & ஜாதகம்"
  },
  tabModernWorld: {
    kn: "🌐 ವರ್ತಮಾನ ಜಗತ್ತು & ಜೀವನ ದಿಕ್ಸೂಚಿ",
    en: "🌐 Modern World & Human Evolution",
    hi: "🌐 वर्तमान विश्व एवं जीवन दिक्सूची",
    te: "🌐 వర్తమాన ప్రపంచం & జీవన దిక్సూచి",
    ta: "🌐 நவீன உலகம் & மனித பரிணாமம்"
  },
  tabSamudrika: {
    kn: "✋ ಸಾಮುದ್ರಿಕ & ಅಂಗ ಲಕ್ಷಣ",
    en: "✋ Samudrika & Body Signs",
    hi: "✋ सामुद्रिक एवं अंग लक्षण",
    te: "✋ సాముద్రిక & శరీర లక్షణాలు",
    ta: "✋ சாமுத்ரிகா & அங்க லட்சணம்"
  },
  tabPrashna: {
    kn: "🔮 ದಿವ್ಯ ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ & AI ಒರಾಕಲ್",
    en: "🔮 Instant Prashna & AI Oracle",
    hi: "🔮 दिव्य प्रश्न शास्त्र एवं AI ओरेकल",
    te: "🔮 దివ్య ప్రశ్న శాస్త్రం & AI ఒరాకిల్",
    ta: "🔮 உடனடி பிரஷ்னம் & AI வழிகாட்டி"
  },
  tabRemedies: {
    kn: "🪔 ದೈನಂದಿನ ಸಂಜೀವಿನಿ & ಗೋಕರ್ಣ ಆಶೀರ್ವಾದ",
    en: "🪔 Daily Sanjeevini & Remedies",
    hi: "🪔 दैनिक संजीवनी एवं गोकर्ण आशीर्वाद",
    te: "🪔 దైనందిన సంజీవిని & గోకర్ణ ఆశీస్సులు",
    ta: "🪔 தினசரி சஞ்சீவினி & பரிகாரங்கள்"
  },
  formName: {
    kn: "ಪೂರ್ಣ ಹೆಸರು / Full Name",
    en: "Full Name",
    hi: "पूरा नाम",
    te: "పూర్తి పేరు",
    ta: "முழுப் பெயர்"
  },
  formDob: {
    kn: "ಜನ್ಮ ದಿನಾಂಕ (ಸಮಯ ಅಗತ್ಯವಿಲ್ಲ)",
    en: "Date of Birth (Time NOT required)",
    hi: "जन्म तिथि (समय की आवश्यकता नहीं)",
    te: "పుట్టిన తేదీ (సమయం అవసరం లేదు)",
    ta: "பிறந்த தேதி (நேரம் தேவையில்லை)"
  },
  formPlace: {
    kn: "ನಗರ / ಪಿನ್‌ಕೋಡ್ (ಉದಾ: 581326)",
    en: "City / Pincode (e.g. 581326)",
    hi: "शहर / पिनकोड (उदा: 581326)",
    te: "నగరం / పిన్‌కోడ్ (ఉదా: 581326)",
    ta: "நகரம் / பின்கோடு (எ.கா: 581326)"
  },
  formForehead: {
    kn: "ಹಣೆ ರಚನೆ (Forehead Archetype)",
    en: "Forehead Archetype",
    hi: "ललाट का आकार",
    te: "నుదురు ఆకారం",
    ta: "நெற்றி அமைப்பு"
  },
  formEyes: {
    kn: "ಕಣ್ಣಿನ ದೃಷ್ಟಿ ತೇಜಸ್ಸು (Eye Radiance)",
    en: "Eye Radiance & Gaze",
    hi: "नेत्रों का तेज",
    te: "కళ్ల తేజస్సు",
    ta: "கண் பார்வை தேஜஸ்"
  },
  formHandElement: {
    kn: "ಹಸ್ತದ ಪ್ರಕೃತಿ ತತ್ವ (Hand Element)",
    en: "Hand Elemental Nature",
    hi: "हस्त प्रकृति तत्व",
    te: "చేతి తత్వం",
    ta: "கை பூத தத்துவம்"
  },
  formFocusDomain: {
    kn: "ಪ್ರಮುಖ ಜೀವನ ಉದ್ದೇಶ / ಆಸಕ್ತಿ ಕ್ಷೇತ್ರ",
    en: "Primary Focus Area",
    hi: "प्रमुख जीवन क्षेत्र",
    te: "ప్రధాన జీవిత రంగం",
    ta: "முதன்மை வாழ்க்கை நோக்கம்"
  },
  formCustomQuestion: {
    kn: "ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ ಅಥವಾ ಗೊಂದಲ (ಐಚ್ಛಿಕ)",
    en: "Your Specific Question or Dilemma (Optional)",
    hi: "आपका विशिष्ट प्रश्न या दुविधा (वैकल्पिक)",
    te: "మీ నిర్దిష్ట ప్రశ్న లేదా సమస్య (ఐచ్ఛికం)",
    ta: "உங்கள் குறிப்பிட்ட கேள்வி (விருப்பத்தேர்வு)"
  },
  submitBtn: {
    kn: "☸ ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ಅನಾವರಣಗೊಳಿಸಿ",
    en: "☸ Reveal Cosmic Blueprint",
    hi: "☸ दिव्य काल दिक्सूची उद्घाटित करें",
    te: "☸ దివ్య కాల దిక్సూచి ఆవిష్కరించండి",
    ta: "☸ திவ்ய கால வரைபடத்தைக் காண்க"
  },
  downloadPdfBtn: {
    kn: "📥 3-ಪುಟಗಳ ದಿವ್ಯ ಪತ್ರಿಕೆ ಡೌನ್‌ಲೋಡ್ (PDF)",
    en: "📥 Download 3-Page Cosmic Report (PDF)",
    hi: "📥 3-पृष्ठ दिव्य पत्रिका डाउनलोड (PDF)",
    te: "📥 3-పేజీల దివ్య పత్రిక డౌన్‌లోడ్ (PDF)",
    ta: "📥 3-பக்க திவ்ய அறிக்கை பதிவிறக்கம் (PDF)"
  }
};
