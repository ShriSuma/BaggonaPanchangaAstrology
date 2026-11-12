/**
 * 6-Language Native Vocabulary for Baggona 5-Year Master Destiny Forecast
 * Supports: Kannada (kn), English (en), Hindi (hi), Tamil (ta), Telugu (te), and Marathi (mr).
 *
 * Every string is hand-authored per language to ensure 100% pure native script
 * without machine translation artifacts or English leakage.
 */

export type SixLang = "kn" | "en" | "hi" | "ta" | "te" | "mr";
export type L6 = Record<SixLang, string>;

export const SIX_LANGS: SixLang[] = ["kn", "en", "hi", "ta", "te", "mr"];

export const isSixLang = (val: string): val is SixLang => {
  const base = (val || "kn").split("-")[0].toLowerCase();
  return SIX_LANGS.includes(base as SixLang);
};

export const pick6 = (phrase?: L6 | null, lang?: string): string => {
  if (!phrase) return "";
  const base = (lang || "kn").split("-")[0].toLowerCase() as SixLang;
  if (SIX_LANGS.includes(base) && phrase[base]) {
    return phrase[base];
  }
  return phrase.kn || phrase.en || "";
};

export const LANGUAGE_DISPLAY_NAMES_6L: Record<SixLang, { native: string; english: string; combined: string }> = {
  kn: { native: "ಕನ್ನಡ", english: "Kannada", combined: "ಕನ್ನಡ (Kannada)" },
  en: { native: "English", english: "English", combined: "English" },
  hi: { native: "हिन्दी", english: "Hindi", combined: "हिन्दी (Hindi)" },
  ta: { native: "தமிழ்", english: "Tamil", combined: "தமிழ் (Tamil)" },
  te: { native: "తెలుగు", english: "Telugu", combined: "తెలుగు (Telugu)" },
  mr: { native: "मराठी", english: "Marathi", combined: "मराठी (Marathi)" }
};

/* ------------------------------------------------------------------ *
 * Digits & Numerals Formatting for all 6 languages
 * ------------------------------------------------------------------ */
export const toKnDigits = (n: number | string): string => {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return String(n).replace(/\d/g, d => knDigits[+d] || d);
};

export const toDevanagariDigits = (n: number | string): string => {
  const devDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(n).replace(/\d/g, d => devDigits[+d] || d);
};

export const toTeDigits = (n: number | string): string => {
  const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
  return String(n).replace(/\d/g, d => teDigits[+d] || d);
};

export const toTaDigits = (n: number | string): string => {
  const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  return String(n).replace(/\d/g, d => taDigits[+d] || d);
};

export const formatNumber6L = (n: number | string, lang: string): string => {
  const base = (lang || "kn").split("-")[0].toLowerCase() as SixLang;
  switch (base) {
    case "kn": return toKnDigits(n);
    case "hi":
    case "mr": return toDevanagariDigits(n);
    case "te": return toTeDigits(n);
    case "ta": return toTaDigits(n);
    case "en":
    default: return String(n);
  }
};

/* ------------------------------------------------------------------ *
 * Rashis in 6 Languages (12 signs)
 * ------------------------------------------------------------------ */
export const RASHI_6L: L6[] = [
  { kn: "ಮೇಷ", en: "Mesha (Aries)", hi: "मेष", ta: "மேஷம்", te: "మేషం", mr: "मेष" },
  { kn: "ವೃಷಭ", en: "Vrishabha (Taurus)", hi: "वृषभ", ta: "ரிஷபம்", te: "వృషభం", mr: "वृषभ" },
  { kn: "ಮಿಥುನ", en: "Mithuna (Gemini)", hi: "मिथुन", ta: "மிதுனம்", te: "మిథునం", mr: "मिथुन" },
  { kn: "ಕರ್ಕಾಟಕ", en: "Karka (Cancer)", hi: "कर्क", ta: "கடகம்", te: "కర్కాటకం", mr: "कर्क" },
  { kn: "ಸಿಂಹ", en: "Simha (Leo)", hi: "सिंह", ta: "சிம்மம்", te: "సింహం", mr: "सिंह" },
  { kn: "ಕನ್ಯಾ", en: "Kanya (Virgo)", hi: "कन्या", ta: "கன்னி", te: "కన్య", mr: "कन्या" },
  { kn: "ತುಲಾ", en: "Tula (Libra)", hi: "तुला", ta: "துலாம்", te: "తులా", mr: "तूळ" },
  { kn: "ವೃಶ್ಚಿಕ", en: "Vrischika (Scorpio)", hi: "वृश्चिक", ta: "விருச்சிகம்", te: "వృశ్చికం", mr: "वृश्चिक" },
  { kn: "ಧನುಸ್ಸು", en: "Dhanu (Sagittarius)", hi: "धनु", ta: "தனுசு", te: "ధనుస్సు", mr: "धनु" },
  { kn: "ಮಕರ", en: "Makara (Capricorn)", hi: "मकर", ta: "மகரம்", te: "మకరం", mr: "मकर" },
  { kn: "ಕುಂಭ", en: "Kumbha (Aquarius)", hi: "कुंभ", ta: "கும்பம்", te: "కుంభం", mr: "कुंभ" },
  { kn: "ಮೀನ", en: "Meena (Pisces)", hi: "मीन", ta: "மீனம்", te: "మీనం", mr: "मीन" }
];

/* ------------------------------------------------------------------ *
 * Grahas (Planets) in 6 Languages
 * ------------------------------------------------------------------ */
export const GRAHA_6L: Record<string, L6> = {
  Sun: { kn: "ಸೂರ್ಯ", en: "Sun", hi: "सूर्य", ta: "சூரியன்", te: "సూర్యుడు", mr: "सूर्य" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon", hi: "चंद्र", ta: "சந்திரன்", te: "చంద్రుడు", mr: "चंद्र" },
  Mars: { kn: "ಮಂಗಳ", en: "Mars", hi: "मंगल", ta: "செவ்வாய்", te: "కుజుడు", mr: "मंगळ" },
  Mercury: { kn: "ಬುಧ", en: "Mercury", hi: "बुध", ta: "புதன்", te: "బుధుడు", mr: "बुध" },
  Jupiter: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", en: "Jupiter", hi: "गुरु (बृहस्पति)", ta: "குரு (வியாழன்)", te: "గురుడు (బృహస్పతి)", mr: "गुरू (बृहस्पति)" },
  Venus: { kn: "ಶುಕ್ರ", en: "Venus", hi: "शुक्र", ta: "சுக்கிரன்", te: "శుక్రుడు", mr: "शुक्र" },
  Saturn: { kn: "ಶನಿ", en: "Saturn", hi: "शनि", ta: "சனி பகவான்", te: "శని దేవుడు", mr: "शनी देव" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", ta: "ராகு", te: "రాహువు", mr: "राहू" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", ta: "கேது", te: "కేతువు", mr: "केतू" }
};

/* ------------------------------------------------------------------ *
 * Nakshatras in 6 Languages (27 stars)
 * ------------------------------------------------------------------ */
export const NAKSHATRA_6L: L6[] = [
  { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", hi: "अश्विनी", ta: "அஸ்வினி", te: "అశ్విని", mr: "अश्विनी" },
  { kn: "ಭರಣಿ", en: "Bharani", hi: "भरणी", ta: "பரணி", te: "భరణి", mr: "भरणी" },
  { kn: "ಕೃತ್ತಿಕಾ", en: "Krittika", hi: "कृत्तिका", ta: "கிருத்திகை", te: "కృత్తిక", mr: "कृत्तिका" },
  { kn: "ರೋಹಿಣಿ", en: "Rohini", hi: "रोहिणी", ta: "ரோகிணி", te: "రోహిణి", mr: "रोहिणी" },
  { kn: "ಮೃಗಶಿರ", en: "Mrigashira", hi: "मृगशिरा", ta: "மிருகசீரிடம்", te: "మృగశిర", mr: "मृगशीर्ष" },
  { kn: "ಆರ್ದ್ರಾ", en: "Ardra", hi: "आर्द्रा", ta: "திருவாதிரை", te: "ఆరుద్ర", mr: "आर्द्रा" },
  { kn: "ಪುನರ್ವಸು", en: "Punarvasu", hi: "पुनर्वसु", ta: "புனர்பூசம்", te: "పునర్వసు", mr: "पुनर्वसू" },
  { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पुष्य", ta: "பூசம்", te: "పుష్యమి", mr: "पुष्य" },
  { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", hi: "आश्लेषा", ta: "ஆயில்யம்", te: "ఆశ్లేష", mr: "आश्लेषा" },
  { kn: "ಮಘಾ", en: "Magha", hi: "मघा", ta: "மகம்", te: "మఘ", mr: "मघा" },
  { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ (ಪುಬ್ಬಾ)", en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", ta: "பூரம்", te: "పూర్వ ఫల్గుణి", mr: "पूर्वा फाल्गुनी" },
  { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ (ಉತ್ತರಾ)", en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", ta: "உத்திரம்", te: "ఉత్తర ఫల్గుణి", mr: "उत्तरा फाल्गुनी" },
  { kn: "ಹಸ್ತಾ", en: "Hasta", hi: "हस्त", ta: "ஹஸ்தம்", te: "హస్త", mr: "हस्त" },
  { kn: "ಚಿತ್ತಾ", en: "Chitra", hi: "चित्रा", ta: "சித்திரை", te: "చిత్త", mr: "चित्रा" },
  { kn: "ಸ್ವಾತಿ", en: "Swati", hi: "स्वाति", ta: "சுவாதி", te: "స్వాతి", mr: "स्वाती" },
  { kn: "ವಿಶಾಖಾ", en: "Vishakha", hi: "विशाखा", ta: "விசாகம்", te: "విశాఖ", mr: "विशाखा" },
  { kn: "ಅನೂರಾಧಾ", en: "Anuradha", hi: "अनुराधा", ta: "அனுஷம்", te: "అనూరాధ", mr: "अनुराधा" },
  { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", hi: "ज्येष्ठा", ta: "கேட்டை", te: "జ్యేష్ఠ", mr: "ज्येष्ठा" },
  { kn: "ಮೂಲಾ", en: "Mula", hi: "मूल", ta: "மூலம்", te: "మూల", mr: "मूळ" },
  { kn: "ಪೂರ್ವಾಷಾಢಾ", en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", ta: "பூராடம்", te: "పూర్వాషాఢ", mr: "पूर्वाषाढा" },
  { kn: "ಉತ್ತರಾಷಾಢಾ", en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", ta: "உத்திராடம்", te: "ఉత్తరాషాఢ", mr: "उत्तराषाढा" },
  { kn: "ಶ್ರವಣ", en: "Shravana", hi: "श्रवण", ta: "திருவோணம்", te: "శ్రవణం", mr: "श्रवण" },
  { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", hi: "धनिष्ठा", ta: "அவிட்டம்", te: "ధనిష్ఠ", mr: "धनिष्ठा" },
  { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", hi: "शतभिषा", ta: "சதயம்", te: "శతభిషం", mr: "शततारका" },
  { kn: "ಪೂರ್ವಾಭಾದ್ರಾ", en: "Purva Bhadrapada", hi: "पूर्वाभाद्रपद", ta: "பூரட்டாதி", te: "పూర్వాభాద్ర", mr: "पूर्वाभाद्रपदा" },
  { kn: "ಉತ್ತರಾಭಾದ್ರಾ", en: "Uttara Bhadrapada", hi: "उत्तराभाद्रपद", ta: "உத்திரட்டாதி", te: "ఉత్తరాభాద్ర", mr: "उत्तराभाद्रपदा" },
  { kn: "ರೇವತಿ", en: "Revati", hi: "रेवती", ta: "ரேவதி", te: "రేవతి", mr: "रेवती" }
];

/* ------------------------------------------------------------------ *
 * Weekdays (Vara) in 6 Languages
 * ------------------------------------------------------------------ */
export const WEEKDAY_6L: L6[] = [
  { kn: "ಭಾನುವಾರ (ಆದಿತ್ಯವಾರ)", en: "Sunday", hi: "रविवार", ta: "ஞாயிறு", te: "ఆదివారం", mr: "रविवार" },
  { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", ta: "திங்கள்", te: "సోమవారం", mr: "सोमवार" },
  { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", ta: "செவ்வாய்", te: "మంగళవారం", mr: "मंगळवार" },
  { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", ta: "புதன்", te: "బుధవారం", mr: "बुधवार" },
  { kn: "ಗುರುವಾರ (ಬೃಹಸ್ಪತಿವಾರ)", en: "Thursday", hi: "गुरुवार", ta: "வியாழன்", te: "గురువారం", mr: "गुरुवार" },
  { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", ta: "வெள்ளி", te: "శుక్రవారం", mr: "शुक्रवार" },
  { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", ta: "சனி", te: "శనివారం", mr: "शनिवार" }
];

/* ------------------------------------------------------------------ *
 * UI & Report Headings in 6 Languages
 * ------------------------------------------------------------------ */
export const FIVE_YEAR_TEXT_6L: Record<string, L6> = {
  headerBadge: {
    kn: "✨ ಅಧಿಕೃತ ಪಂಚವರ್ಷ ಮಹಾ ಭವಿಷ್ಯ ದರ್ಶನ • 2026 - 2031",
    en: "✨ Official 5-Year Master Destiny Blueprint • 2026 - 2031",
    hi: "✨ आधिकारिक पंचवर्षीय महा भविष्य दर्शन • २०२६ - २०३१",
    ta: "✨ அதிகாரப்பூர்வ 5 ஆண்டுகள் மகா ஜோதிட பலன்கள் • 2026 - 2031",
    te: "✨ అధికారిక పంచవర్ష మహా భవిష్యదర్శనం • 2026 - 2031",
    mr: "✨ अधिकृत ५ वर्षांचे महा भविष्य दर्शन • २०२६ - २०३१"
  },
  docTitle: {
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಮಹಾ ಭವಿಷ್ಯ",
    en: "Baggona Panchanga • Next 5 Years Master Destiny Roadmap",
    hi: "बग्गोण पंचांग • आगामी ५ वर्षों का महा भविष्यफल",
    ta: "பக்கோண பஞ்சாங்கம் • அடுத்த 5 ஆண்டுகள் மகா எதிர்கால வரைபடம்",
    te: "బగ్గోణ పంచాంగం • తదుపరి 5 సంవత్సరాల మహా భవిష్యత్తు",
    mr: "बग्गोण पंचांग • पुढील ५ वर्षांचे महा भविष्य"
  },
  docSubtitle: {
    kn: "ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ, ಗ್ರಹ ಗೋಚಾರ ಹಾಗೂ ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾದ ವಿಸ್ತೃತ ಪಂಚವರ್ಷ ಮಾರ್ಗಸೂಚಿ",
    en: "Comprehensive 5-Year Roadmap Grounded in Natal Kundli, Dasha-Bhukti, Transits & Age Psychology",
    hi: "जन्म कुंडली, दशा-भुक्ति, ग्रह गोचर एवं आयु-मनोविज्ञान पर आधारित विस्तृत ५-वर्षीय मार्गदर्शन",
    ta: "பிறப்பு ஜாதகம், தசா-புக்தி, கிரக கோச்சாரம் மற்றும் வயதுக்கேற்ற விரிவான 5 ஆண்டு வழிகாட்டி",
    te: "జన్మ కుండలి, దశా-భుక్తి, గ్రహ గోచారం మరియు వయస్సుకు తగిన సమగ్ర 5 సంవత్సరాల మార్గదర్శకం",
    mr: "जन्म कुंडली, दशा-भुक्ती, ग्रह गोचर व वयोमानानुसार सखोल ५ वर्षांचे अचूक मार्गदर्शन"
  },
  buttonTitle: {
    kn: "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಭವಿಷ್ಯ (₹೨೫೦)",
    en: "Next 5 Years Details (₹250)",
    hi: "अगले ५ वर्षों का भविष्य (₹२५०)",
    ta: "அடுத்த 5 ஆண்டுகள் பலன்கள் (₹250)",
    te: "తదుపరి 5 సంవత్సరాల భవిష్యత్తు (₹250)",
    mr: "पुढील ५ वर्षांचे भविष्य (₹२५०)"
  },
  buttonSubtitle: {
    kn: "ವರ್ಷವಾರು ಖಚಿತ ಘಟನೆಗಳು • ದಶಾ-ಗೋಚಾರ • ದಿವ್ಯ ಸ್ತೋತ್ರ",
    en: "Year-by-Year Forecast • Transits • Sacred Stotras",
    hi: "वर्षवार निश्चित घटनाएं • दशा-गोचर • दिव्य स्तोत्र",
    ta: "ஆண்டுவாரியான பலன்கள் • கோச்சாரம் • திவ்ய ஸ்தோத்திரம்",
    te: "సంవత్సరాల వారీ ఫలితాలు • గోచారం • దివ్య స్తోత్రాలు",
    mr: "वर्षनिहाय निश्चित घडामोडी • दशा-गोचर • दिव्य स्तोत्रे"
  },
  psychologyPitch: {
    kn: "ನಿಮ್ಮ ಜೀವನ ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ಎತ್ತ ಸಾಗಲಿದೆ? ಯಾವ ವರ್ಷದಲ್ಲಿ ಮಹಾ ತಿರುವು ಬರುತ್ತದೆ? ಹಣ, ವೃತ್ತಿ, ಸಂಸಾರ, ಆರೋಗ್ಯದಲ್ಲಿ ಯಾವ ಸುವರ್ಣ ಕಾಲ ಆರಂಭವಾಗಲಿದೆ? ಎಲ್ಲವನ್ನೂ ನಿಖರವಾಗಿ ತಿಳಿಯಿರಿ.",
    en: "Where will your destiny lead over the next 5 years? Which year brings your defining breakthrough? Discover your golden periods for career, wealth, family, and health with classical Vedic precision.",
    hi: "अगले ५ वर्षों में आपका जीवन किस दिशा में जाएगा? किस वर्ष आएगा सबसे बड़ा मोड़? करियर, धन, परिवार एवं स्वास्थ्य में कब शुरू होगा स्वर्णिम काल? जानें प्रामाणिक वैदिक गणना से।",
    ta: "அடுத்த 5 ஆண்டுகளில் உங்கள் வாழ்க்கை எந்த திசையில் செல்லும்? எந்த ஆண்டு மாபெரும் திருப்புமுனையைத் தரும்? தொழில், செல்வம், குடும்பம் மற்றும் ஆரோக்கியத்தின் பொற்காலம் எப்போது?",
    te: "రాబోయే 5 సంవత్సరాలలో మీ జీవితం ఎటువైపు సాగనుంది? ఏ సంవత్సరంలో పెద్ద మలుపు రాబోతోంది? వృత్తి, ధనం, కుటుంబం మరియు ఆరోగ్యంలో స్వర్ణయుగం ఎప్పుడు?",
    mr: "पुढील ५ वर्षांत तुमचे आयुष्य कोणत्या वळणावर जाईल? कोणत्या वर्षी सर्वात मोठा टर्निंग पॉईंट येईल? नोकरी, व्यवसाय, संपत्ती, कुटुंब व आरोग्यात सुवर्णकाळ कधी सुरू होईल? जाणून घ्या अचूक वेदिक गणिताने."
  },
  priceTag: {
    kn: "₹೨೫೦ • ಪೂರ್ಣ ೫ ವರ್ಷಗಳ ಮುದ್ರಣ ವರದಿ",
    en: "₹250 • Complete 5-Year Printable Blueprint",
    hi: "₹२५० • संपूर्ण ५-वर्षीय प्रिंट रिपोर्ट",
    ta: "₹250 • முழுமையான 5 ஆண்டு அச்சு அறிக்கை",
    te: "₹250 • సంపూర్ణ 5 సంవత్సరాల ప్రింట్ నివేదిక",
    mr: "₹२५० • संपूर्ण ५ वर्षांचा प्रिंट रिपोर्ट"
  },
  devoteeProfileTitle: {
    kn: "ಜಾತಕರ ವಿವರ ಹಾಗೂ ಜನನ ಕಾಲದ ೬-ಅಂಗ ಪಂಚಾಂಗ ದರ್ಶನ",
    en: "Devotee Profile & Sacred 6-Anga Natal Panchanga",
    hi: "जातक विवरण एवं जन्मकालीन ६-अंग पंचांग दर्शन",
    ta: "ஜாதகர் விவரம் மற்றும் 6-அங்க பிறப்பு பஞ்சாங்க விவரம்",
    te: "జాతకుని వివరాలు & జనన కాల 6-అంగ పంచాంగం",
    mr: "जातक तपशील व जन्मकालीन ६-अंग पंचांग दर्शन"
  },
  fiveYearMacroTitle: {
    kn: "ಪಂಚವರ್ಷ ಮಹಾ ದಿಶಾ-ದರ್ಶನ (2026 - 2031 ಚೈತನ್ಯ ಸೂಚ್ಯಂಕ)",
    en: "5-Year Macro Destiny Trajectory (2026 - 2031 Vitality Index)",
    hi: "पंचवर्षीय महा दिशा-दर्शन (२०२६ - २०३१ ऊर्जा सूचकांक)",
    ta: "5 ஆண்டு மகா திசை வரைபடம் (2026 - 2031 ஆற்றல் குறியீடு)",
    te: "5 సంవత్సరాల మహా దిశా-దర్శనం (2026 - 2031 చైతన్య సూచిక)",
    mr: "५ वर्षांचे महा दिशा-दर्शन (२०२६ - २०३१ ऊर्जा निर्देशांक)"
  },
  yearByYearHeader: {
    kn: "ಅಧ್ಯಾಯ ೧: ವರ್ಷವಾರು ಖಚಿತ ಘಟನೆಗಳು ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರ (ವರ್ಷ ೧ ರಿಂದ ೫)",
    en: "Chapter 1: Chronological Year-by-Year Roadmap & Transits (Years 1 to 5)",
    hi: "अध्याय १: वर्षवार निश्चित घटनाएं एवं ग्रह गोचर (वर्ष १ से ५)",
    ta: "அத்தியாயம் 1: ஆண்டுவாரியான துல்லிய நிகழ்வுகள் & கோச்சாரம் (ஆண்டு 1 முதல் 5)",
    te: "అధ్యాయం 1: సంవత్సరాల వారీ ఖచ్చితమైన సంఘటనలు & గ్రహ గోచారం (1 నుండి 5)",
    mr: "अध्याय १: वर्षनिहाय निश्चित घडामोडी व ग्रह गोचर (वर्ष १ ते ५)"
  },
  lifeChaptersHeader: {
    kn: "ಅಧ್ಯಾಯ ೨: ವಯೋಮಾನಕ್ಕೆ ಅನುಗುಣವಾದ ಜೀವಮಾನ ಪಂಚ-ಆಯಾಮಗಳ ವಿಸ್ತೃತ ವಿಶ್ಲೇಷಣೆ",
    en: "Chapter 2: Age-Adaptive 5-Year Life Dimensions Deep Dive",
    hi: "अध्याय २: आयु-अनुकूल जीवन के प्रमुख आयामों का विस्तृत विश्लेषण",
    ta: "அத்தியாயம் 2: வயதுக்கேற்ற வாழ்க்கை பரிமாணங்களின் ஆழமான பகுப்பாய்வு",
    te: "అధ్యాయం 2: వయోపరిమితికి తగిన జీవన కోణాల సమగ్ర విశ్లేషణ",
    mr: "अध्याय २: वयोमानानुसार जीवनाच्या प्रमुख पैलूंचे सखोल विश्लेषण"
  },
  stotraHeader: {
    kn: "ಅಧ್ಯಾಯ ೩: ಮುಂದಿನ ೫ ವರ್ಷಗಳ ರಕ್ಷಣೆಗಾಗಿ ಸಿದ್ಧ ದಿವ್ಯ ಸ್ತೋತ್ರ ಹಾಗೂ ಪಾರಾಯಣ ವಿಧಿ",
    en: "Chapter 3: Prescribed Classical Stotra & Sacred Chanting Protocol (5-Year Shield)",
    hi: "अध्याय ३: आगामी ५ वर्षों के रक्षार्थ सिद्ध दिव्य स्तोत्र एवं पाठ विधि",
    ta: "அத்தியாயம் 3: அடுத்த 5 ஆண்டுகளுக்கான சாஸ்திர ஸ்தோத்திரம் & பாராயண முறை",
    te: "అధ్యాయం 3: రాబోయే 5 సంవత్సరాల రక్షణార్థం నిర్దేశిత దివ్య స్తోత్రం & పారాయణ విధానం",
    mr: "अध्याय ३: पुढील ५ वर्षांच्या रक्षणासाठी सिद्ध दिव्य स्तोत्र व पठण विधी"
  },
  remediesHeader: {
    kn: "ಅಧ್ಯಾಯ ೪: ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ದೈವಿಕ ಪರಿಹಾರ, ರತ್ನ & ರುದ್ರಾಕ್ಷಿ ಮಾರ್ಗದರ್ಶನ",
    en: "Chapter 4: Sri Gokarna Kshetra Daivika Parihara, Gemstone & Rudraksha Guidance",
    hi: "अध्याय ४: श्री गोकर्ण क्षेत्र दैविक परिहार, रत्न एवं रुद्राक्ष मार्गदर्शन",
    ta: "அத்தியாயம் 4: ஸ்ரீ கோகர்ண க்ஷேத்திர பரிகாரம், ரத்தினம் & ருத்ராட்ச வழிகாட்டுதல்",
    te: "అధ్యాయం 4: శ్రీ గోకర్ణ క్షేత్ర దైవిక పరిహారం, రత్న & రుద్రాక్ష మార్గదర్శకం",
    mr: "अध्याय ४: श्री गोकर्ण क्षेत्र दैविक परिहार, रत्न व रुद्राक्ष मार्गदर्शन"
  },
  blessingHeader: {
    kn: "ಜ್ಯೋತಿಷಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ದಿವ್ಯ ಆಶೀರ್ವಾದ ಹಾಗೂ ಮುದ್ರೆ",
    en: "Divine Blessing & Sacred Seal of Astrologer Shreeram Pandit",
    hi: "ज्योतिषी श्रीराम पंडित का दिव्य आशीर्वाद एवं पावन मुद्रा",
    ta: "ஜோதிடர் ஸ்ரீராம் பண்டிட்டின் ஆசிகள் மற்றும் முத்திரை",
    te: "జ్యోతిష పండితులు శ్రీరామ్ పండిట్ గారి దివ్య ఆశీస్సులు & ముద్ర",
    mr: "ज्योतिषी श्रीराम पंडित यांचा पावन आशीर्वाद व अधिकृत मुद्रा"
  },
  turningPointLabel: {
    kn: "ವರ್ಷದ ಪ್ರಮುಖ ತಿರುವು (Turning Point):",
    en: "Defining Turning Point of the Year:",
    hi: "वर्ष का मुख्य मोड़ (Turning Point):",
    ta: "ஆண்டின் முக்கிய திருப்புமுனை:",
    te: "సంవత్సరపు ప్రధాన మలుపు (Turning Point):",
    mr: "वर्षाचे मुख्य वळण (Turning Point):"
  },
  goldenWindowLabel: {
    kn: "ಸುವರ್ಣಾವಕಾಶದ ಕಾಲ (Golden Period):",
    en: "Golden Opportunity Window:",
    hi: "स्वर्णिम अवसर काल (Golden Period):",
    ta: "பொற்கால வாய்ப்புக் காலம்:",
    te: "స్వర్ణావకాశ సమయం (Golden Period):",
    mr: "सुवर्णसंधीचा काळ (Golden Period):"
  },
  cautionLabel: {
    kn: "ಎಚ್ಚರಿಕೆ ಹಾಗೂ ಶಮನ ಪರಿಹಾರ (Caution & Remedy):",
    en: "Cautionary Guidance & Pacification:",
    hi: "सावधानी एवं शमन उपाय (Caution & Remedy):",
    ta: "எச்சரிக்கை மற்றும் பரிகாரம்:",
    te: "హెచ్చరిక మరియు శాంతి పరిహారం:",
    mr: "सावधगिरी व शमन उपाय (Caution & Remedy):"
  },
  whatToExpectLabel: {
    kn: "ಖಚಿತವಾಗಿ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಫಲಗಳು:",
    en: "What You Can Definitely Expect:",
    hi: "निश्चित रूप से अपेक्षित परिणाम:",
    ta: "நிச்சயமாக எதிர்பார்க்கக்கூடிய பலன்கள்:",
    te: "ఖచ్చితంగా ఆశించదగిన ఫలితాలు:",
    mr: "निश्चितपणे अपेक्षित असणारे परिणाम:"
  },
  chantingStepsLabel: {
    kn: "ಪಾರಾಯಣ ನಿಯಮಗಳು:",
    en: "Chanting Protocol & Guidelines:",
    hi: "पाठ विधि एवं नियम:",
    ta: "பாராயண விதிகள்:",
    te: "పారాయణ నియమాలు:",
    mr: "पठण पद्धती व नियम:"
  },
  ishtaDevataLabel: {
    kn: "ಇಷ್ಟ ದೇವತೆ:",
    en: "Ishta Devata:",
    hi: "इष्ट देवता:",
    ta: "இஷ்ட தெய்வம்:",
    te: "ఇష్ట దైవం:",
    mr: "इष्ट देवता:"
  },
  luckyGemLabel: {
    kn: "ಧಾರಣೆಗೆ ಸೂಕ್ತ ರತ್ನ:",
    en: "Prescribed Gemstone:",
    hi: "धारण योग्य रत्न:",
    ta: "அணிய வேண்டிய ரத்தினம்:",
    te: "ధరించదగిన రత్నం:",
    mr: "धारण योग्य रत्न:"
  },
  rudrakshaLabel: {
    kn: "ಅನುಕೂಲಕರ ರುದ್ರಾಕ್ಷಿ:",
    en: "Auspicious Rudraksha:",
    hi: "शुभ रुद्राक्ष:",
    ta: "பொருத்தமான ருத்ராட்சம்:",
    te: "శుభకర రుద్రాక్ష:",
    mr: "शुभ रुद्राक्ष:"
  },
  luckyColorLabel: {
    kn: "ಅದೃಷ್ಟ ಬಣ್ಣ:",
    en: "Lucky Color:",
    hi: "शुभ रंग:",
    ta: "அதிர்ஷ்ட நிறம்:",
    te: "శుభ రంగు:",
    mr: "शुभ रंग:"
  },
  luckyNumberLabel: {
    kn: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ:",
    en: "Lucky Numbers:",
    hi: "शुभ अंक:",
    ta: "அதிர்ஷ்ட எண்கள்:",
    te: "శుభ సంఖ్యలు:",
    mr: "शुभ अंक:"
  },
  luckyDirectionLabel: {
    kn: "ಅದೃಷ್ಟ ದಿಕ್ಕು:",
    en: "Lucky Direction:",
    hi: "शुभ दिशा:",
    ta: "அதிர்ஷ்ட திசை:",
    te: "శుభ దిశ:",
    mr: "शुभ दिशा:"
  },
  padaLabel: {
    kn: "ಪಾದ",
    en: "Pada",
    hi: "चरण",
    ta: "பாதம்",
    te: "పాదం",
    mr: "चरण"
  },
  pivotalTurningPointCardTitle: {
    kn: "🌟 ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಅತ್ಯಂತ ಮಹತ್ವದ ಮಹಾ ತಿರುವು (Pivotal Turning Point)",
    en: "🌟 Defining Turning Point of the 5-Year Horizon (2026 - 2031)",
    hi: "🌟 आगामी ५ वर्षों का सबसे निर्णायक महा मोड़ (Pivotal Turning Point)",
    ta: "🌟 அடுத்த 5 ஆண்டுகளில் மிக முக்கியமான மாபெரும் திருப்புமுனை",
    te: "🌟 రాబోయే 5 సంవత్సరాలలో అత్యంత కీలకమైన మహా మలుపు",
    mr: "🌟 पुढील ५ वर्षांतील सर्वात महत्त्वाचे मोठे वळण (Pivotal Turning Point)"
  },
  milestoneMatrixTitle: {
    kn: "೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಭವಿಷ್ಯ ಮೈಲಿಗಲ್ಲುಗಳ ಕೋಷ್ಟಕ (2026 - 2031)",
    en: "5-Year Master Future Milestones Matrix (2026 - 2031)",
    hi: "५-वर्षीय स्वर्णिम भविष्य मील के पत्थर तालिका (२०२६ - २०३१)",
    ta: "5 ஆண்டுகள் பொற்கால எதிர்கால மைல்கற்கள் அட்டவணை (2026 - 2031)",
    te: "5 సంవత్సరాల స్వర్ణ భవిష్యత్ మైలురాళ్ల పట్టిక (2026 - 2031)",
    mr: "५ वर्षांचे सुवर्ण भविष्य टप्पे व मैलाचे दगड कोष्टक (२०२६ - २०३१)"
  },
  milestoneMatrixSubtitle: {
    kn: "ಮಹಾ ತಿರುವು, ಧನ ಸಮೃದ್ಧಿ, ಗೃಹ ಯೋಗ, ವೃತ್ತಿ ಉನ್ನತಿ ಹಾಗೂ ರಕ್ಷಾ ಕವಚ ಕಾಲಾವಧಿಗಳ ಖಚಿತ ಪಟ್ಟಿ",
    en: "Definitive Timeline of Pivotal Life Turning Points, Wealth Peaks, Property Acquisition, Career Summits & Protective Shields",
    hi: "जीवन के सबसे बड़े मोड़, धन लाभ, गृह निर्माण, कार्योन्नति एवं सुरक्षा काल की निश्चित समयरेखा",
    ta: "மாபெரும் திருப்புமுனை, தன யோகம், வீடு வாங்குதல், தொழில் உயர்வு & பாதுகாப்பு காலத்தின் பட்டியல்",
    te: "జీవిత ప్రధాన మలుపు, ధన లాభం, గృహ యోగం, ఉద్యోగోన్నతి మరియు రక్షా సమయాల స్పష్టమైన జాబితా",
    mr: "जीवनातील मोठे वळण, धनलाभ, गृह खरेदी, पदोन्नती व संरक्षण काळाची अचूक रूपरेषा"
  },
  quarterlyForecastHeader: {
    kn: "ಋತುಮಾನವಾರು ೪ ತ್ರೈಮಾಸಿಕ ಭವಿಷ್ಯ ದರ್ಶನ:",
    en: "Quarterly Seasonal Astrological Horizons:",
    hi: "ऋतुवार ४ त्रैमासिक भविष्य दर्शन:",
    ta: "பருவகால காலாண்டு ஜோதிட பலன்கள்:",
    te: "త్రైమాసిక ఋతువుల వారీ భవిష్యత్ దర్శనం:",
    mr: "ऋतूनिहाय ४ त्रैमासिक भविष्य दर्शन:"
  },
  colDimension: {
    kn: "ಜೀವನ ಆಯಾಮ",
    en: "Life Dimension",
    hi: "जीवन आयाम",
    ta: "வாழ்க்கைப் பரிமாணம்",
    te: "జీవన కోణం",
    mr: "जीवनाचा पैलू"
  },
  colWindow: {
    kn: "ಖಚಿತ ಸುವರ್ಣ ಕಾಲಾವಧಿ",
    en: "Golden Timing Window",
    hi: "निश्चित स्वर्णिम काल",
    ta: "துல்லியமான பொற்காலம்",
    te: "ఖచ్చితమైన స్వర్ణ సమయం",
    mr: "निश्चित सुवर्ण कालावधी"
  },
  colCatalyst: {
    kn: "ಗ್ರಹ ಯೋಗ & ಪ್ರಭಾವ",
    en: "Planetary Catalyst",
    hi: "ग्रह योग एवं प्रभाव",
    ta: "கிரக யோகம் & தாக்கம்",
    te: "గ్రహ యోగం & ప్రభావం",
    mr: "ग्रह योग व प्रभाव"
  },
  colProbability: {
    kn: "ಫಲ ಸಾಧ್ಯತೆ",
    en: "Probability",
    hi: "संभावना",
    ta: "சாத்தியக்கூறு",
    te: "సంభావ్యత",
    mr: "शक्यता"
  },
  colAdvice: {
    kn: "ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ",
    en: "Sacred Guidance",
    hi: "दैविक मार्गदर्शन",
    ta: "தெய்வீக வழிகாட்டுதல்",
    te: "దైవిక మార్గదర్శకం",
    mr: "दैवी मार्गदर्शन"
  },
  tithiLabel: {
    kn: "ಜನ್ಮ ತಿಥಿ:",
    en: "Birth Tithi:",
    hi: "जन्म तिथि:",
    ta: "ஜென்ம திதி:",
    te: "జన్మ తిథి:",
    mr: "जन्म तिथी:"
  },
  pakshaLabel: {
    kn: "ಪಕ್ಷ:",
    en: "Paksha:",
    hi: "पक्ष:",
    ta: "பக்ஷம்:",
    te: "పక్షం:",
    mr: "पक्ष:"
  },
  yogaLabel: {
    kn: "ಜನ್ಮ ಯೋಗ:",
    en: "Birth Yoga:",
    hi: "जन्म योग:",
    ta: "ஜென்ம யோகம்:",
    te: "జన్మ యోగం:",
    mr: "जन्म योग:"
  },
  karanaLabel: {
    kn: "ಜನ್ಮ ಕರಣ:",
    en: "Birth Karana:",
    hi: "जन्म करण:",
    ta: "ஜென்ம கரணம்:",
    te: "జన్మ కరణం:",
    mr: "जन्म करण:"
  },
  janmaHoraLabel: {
    kn: "ಜನ್ಮ ಹೋರೆ:",
    en: "Janana Hora:",
    hi: "जन्म होरा:",
    ta: "ஜென்ம ஹோரை:",
    te: "జన్మ హోర:",
    mr: "जन्म होरा:"
  },
  maandiLabel: {
    kn: "ಮಾಂದಿ ಸ್ಥಾನ:",
    en: "Maandi Sign:",
    hi: "मांदी स्थान:",
    ta: "மாந்தி ஸ்தானம்:",
    te: "మాంది స్థానం:",
    mr: "मांदी स्थान:"
  },
  munthaBadge: {
    kn: "ತಾಜಿಕ ಮುಂಥಾ ಸ್ಥಾನ",
    en: "Tajika Muntha Focus",
    hi: "ताजिक मुंथा प्रभाव",
    ta: "தாஜிக முன்தா ஸ்தானம்",
    te: "తాజిక ముంథా ప్రభావం",
    mr: "ताजिक मुंथा प्रभाव"
  },
  doubleTransitBadge: {
    kn: "ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ಗೋಚಾರ ವೇಧ",
    en: "Double Transit Catalyst (Saturn & Jupiter)",
    hi: "गुरु-शनि द्विग्रह गोचर वेध",
    ta: "குரு-சனி இருகிரக கோச்சார வேதை",
    te: "గురు-శని ద్విగ్రహ గోచార వేధ",
    mr: "गुरू-शनि द्विग्रह गोचर वेध"
  },
  muhurtaSectionTitle: {
    kn: "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಪ್ರಮುಖ ಶುಭ ನಿರ್ಧಾರ ಮುಹೂರ್ತ ಕೋಷ್ಟಕ",
    en: "5-Year Key Auspicious Decisions & Timing Horizons",
    hi: "आगामी ५ वर्षों के प्रमुख शुभ निर्णयों हेतु मुहूर्त तालिका",
    ta: "அடுத்த 5 ஆண்டுகளின் முக்கிய சுப முடிவுகளுக்கான முகூர்த்த அட்டவணை",
    te: "రాబోయే 5 సంవత్సరాల ముఖ్యమైన శుభ నిర్ణయాల ముహూర్త పట్టిక",
    mr: "पुढील ५ वर्षांतील महत्त्वाच्या शुभ निर्णयांचे मुहूर्त कोष्टक"
  },
  financialRoadmapTitle: {
    kn: "೫ ವರ್ಷಗಳ ಆರ್ಥಿಕ ವೃದ್ಧಿ ಹಾಗೂ ಹೂಡಿಕೆ ಮಾರ್ಗಸೂಚಿ",
    en: "5-Year Financial Elevation & Asset Acquisition Roadmap",
    hi: "५-वर्षीय आर्थिक उन्नति एवं निवेश खाका",
    ta: "5 ஆண்டு கால நிதி வளர்ச்சி மற்றும் முதலீட்டு வழிகாட்டி",
    te: "5 సంవత్సరాల ఆర్థిక వృద్ధి & పెట్టుబడి ప్రణాళిక",
    mr: "५ वर्षांची आर्थिक प्रगती व गुंतवणूक दिशा"
  },
  healthShieldTitle: {
    kn: "ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷಾ ಕವಚ",
    en: "Vitality Preservation & Longevity Shield",
    hi: "आरोग्य संरक्षण एवं दीर्घायु रक्षा कवच",
    ta: "ஆரோக்கிய பாதுகாப்பு & தீர்க்காயுள் கவசம்",
    te: "ఆరోగ్య రక్షణ & దీర్ఘాయుష్షు రక్షా కవచం",
    mr: "आरोग्य संरक्षण व दीर्घायुष्य सुरक्षा कवच"
  },
  punyakshetraTitle: {
    kn: "ಪುಣ್ಯಕ್ಷೇತ್ರ ದರ್ಶನ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನಾ ಕಾಲ",
    en: "Sacred Pilgrimage & Spiritual Awakening Windows",
    hi: "तीर्थयात्रा एवं आध्यात्मिक साधना हेतु स्वर्णिम काल",
    ta: "புண்ணிய தல தரிசனம், தீர்த்த யாத்திரை & ஆன்மீக சாதனை காலம்",
    te: "పుణ్యక్షేత్ర దర్శనం, తీర్థయాత్రలు & ఆధ్యాత్మిక సాధనా సమయం",
    mr: "तीर्थक्षेत्र दर्शन, तीर्थाटन व आध्यात्मिक प्रगती काळ"
  },
  familyInterlockTitle: {
    kn: "« ಕುಟುಂಬ ರಕ್ಷಾ ಪಂಚವರ್ಷ ಬಂಧ » - ಕೌಟುಂಬಿಕ ಭಾಗ್ಯೋದಯ ಸಂಯೋಗ",
    en: "« Family Destiny Interlocking » - 5-Year Family Fortune Synchronizer",
    hi: "« पारिवारिक पंचवर्षीय भाग्य योजना » - पारिवारिक भाग्योदय संगम",
    ta: "« குடும்ப ரக்ஷா ஐந்தாண்டு பந்தம் » - குடும்ப பாக்கியோதய இணைப்பு",
    te: "« కుటుంబ రక్షా 5 సంవత్సరాల బంధం » - కుటుంబ భాగ్యోదయ కలయిక",
    mr: "« कौटुंबिक ५ वर्षे भाग्य योजना » - कौटुंबिक भाग्योदय संगम"
  },
  familyOfferBadge: {
    kn: "ವಿಶೇಷ ಕುಟುಂಬ ರಿಯಾಯಿತಿ: ೨ ಜಾತಕಗಳಿಗೆ ೪,೦೦೦ ಕಾಯಿನ್‌ಗಳು (೧,೦೦೦ ಕಾಯಿನ್ ಉಳಿತಾಯ)",
    en: "Special Family Bundle: 2 Predictions for 4,000 Coins (Save 1,000 Coins)",
    hi: "विशेष पारिवारिक छूट: २ कुंडलियों हेतु ४,००० कॉइन्स (१,००० कॉइन्स की बचत)",
    ta: "சிறப்பு குடும்ப சலுகை: 2 ஜாதகங்களுக்கு 4,000 நாணயங்கள் (1,000 நாணயங்கள் சேமிப்பு)",
    te: "ప్రత్యేక కుటుంబ ఆఫర్: 2 జాతకాలకు 4,000 కాయిన్లు (1,000 కాయిన్ల ఆదా)",
    mr: "विशेष कौटुंबिक सवलत: २ पत्रिकांसाठी ४,००० नाणी (१,००० नाण्यांची बचत)"
  }
};

export const getPadaWord = (langOrPada: any, maybeLang?: string): string => {
  const lang = typeof langOrPada === "string" ? langOrPada : (typeof maybeLang === "string" ? maybeLang : "kn");
  const base = (lang || "kn").split("-")[0].toLowerCase();
  switch (base) {
    case "kn": return "ಪಾದ";
    case "mr":
    case "hi": return "चरण";
    case "te": return "పాదం";
    case "ta": return "பாதம்";
    case "en":
    default: return "Pada";
  }
};

