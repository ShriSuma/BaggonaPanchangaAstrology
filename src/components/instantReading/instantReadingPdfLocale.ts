/**
 * 6-Language Localization Engine for Baggona Panchanga Instant Reading A4 PDF
 *
 * Supported Languages:
 * - kn: Kannada (ಕನ್ನಡ)
 * - en: English
 * - hi: Hindi (हिन्दी)
 * - te: Telugu (తెలుగు)
 * - ta: Tamil (தமிழ்)
 * - ml: Malayalam (മലയാളം)
 *
 * Strictly adheres to authentic Vedic terminology and zero English token leakage in Indic scripts.
 */

import type { PanchangaSynthesisOutput } from "../../core/PanchangaAngaSynthesisEngine";
import { sanitizeAstrologyKannadaText } from "../../utils/kannadaAstrologyTerms";
import { getBaggonaNakshatra, getBaggonaVara, BAGGONA_NAKSHATRAS_MASTER, BAGGONA_VARAS_MASTER } from "../../services/nakshatraDbService";

export type SupportedPdfLang = "kn" | "en" | "hi" | "te" | "ta" | "ml";

export interface LangOption {
  code: SupportedPdfLang;
  label: string;
  nativeScript: string;
  flagEmoji: string;
}

export const PDF_LANGUAGES: LangOption[] = [
  { code: "kn", label: "Kannada", nativeScript: "ಕನ್ನಡ", flagEmoji: "🟡" },
  { code: "en", label: "English", nativeScript: "English", flagEmoji: "🌐" },
  { code: "hi", label: "Hindi", nativeScript: "हिन्दी", flagEmoji: "🇮🇳" },
  { code: "te", label: "Telugu", nativeScript: "తెలుగు", flagEmoji: "🕉️" },
  { code: "ta", label: "Tamil", nativeScript: "தமிழ்", flagEmoji: "🪔" },
  { code: "ml", label: "Malayalam", nativeScript: "മലയാളം", flagEmoji: "🌴" }
];

export type L6 = Record<SupportedPdfLang, string>;

export const pickL6 = (dict: L6 | Record<string, string>, lang: string): string => {
  const code = (lang || "kn").split("-")[0] as SupportedPdfLang;
  return dict[code] || dict.kn || dict.en || "";
};

/* ------------------------------------------------------------------ *
 * UI & Header Dictionaries (6 Languages)
 * ------------------------------------------------------------------ */

export const PDF_DICT: Record<string, L6> = {
  brandBanner: {
    kn: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥",
    en: "॥ BAGGONA PANCHANGA ॥",
    hi: "॥ बग्गोण पंचांग ॥",
    te: "॥ బగ్గోణ పంచాంగం ॥",
    ta: "॥ பக்ககோண பஞ்சாங்கம் ॥",
    ml: "॥ ബഗ്ഗോണ പഞ്ചാംഗം ॥"
  },
  brandSubtitle: {
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ದೈವಜ್ಞ ಮುಖ್ಯಾಂಶ ಹಾಗೂ ತ್ವರಿತ ಜಾತಕ ಸಾರಾಂಶ",
    en: "Sri Gokarna Mahabaleshwara Kshetra · Astrological Executive Summary & Life Guidance",
    hi: "श्री गोकर्ण महाबलेश्वर सन्निधान · मुख्य ज्योतिषीय सार एवं त्वरित जीवन मार्गदर्शन",
    te: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · ముఖ్య జ్యోతిష్య సారాంశం & జీవిత మార్గదర్శి",
    ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · முதன்மை ஜோதிட சுருக்கம் & உடனடி பலன்",
    ml: "ശ്രീ ഗോകർണ മഹാബലേഷ്വര സന്നിധാനം · മുഖ്യ ജ്യോതിഷ സംഗ്രഹം & ജീവിത മാർഗ്ഗദർശനം"
  },
  sealBadge: {
    kn: "ಅಧಿಕೃತ ಮುದ್ರೆ · 100% ಶಾಸ್ತ್ರೋಕ್ತ ಸಿದ್ಧಾಂತ",
    en: "Official Seal · 100% Astronomical Fidelity",
    hi: "आधिकारिक मुद्रा · १००% शास्त्रीय सिद्धांत",
    te: "అధికారిక ముద్ర · 100% శాస్త్రోక్త సిద్ధాంతం",
    ta: "அதிகாரப்பூர்வ முத்திரை · 100% சாஸ்திரோக்த முறை",
    ml: "ഔദ്യോഗിക മുദ്ര · 100% ശാസ്ത്രീയ സിദ്ധാന്തം"
  },
  page1Title: {
    kn: "ದೈವಜ್ಞ ತ್ವರಿತ ದರ್ಶನ & ಪಂಚಾಂಗ ಫಲಿತ ವರದಿ",
    en: "Executive Vedic Consultation & Panchanga Reading",
    hi: "मुख्य वैदिक परामर्श एवं पंचांग फलित रिपोर्ट",
    te: "ముఖ్య వైదిక సంప్రదింపులు & పంచాంగ ఫలిత నివేదిక",
    ta: "முதன்மை வேத ஜோதிட ஆலோசனை & பஞ்சாங்க அறிக்கை",
    ml: "മുഖ്യ വൈദിക കൂടിയാലോചന & പഞ്ചാംഗ ഫല റിപ്പോർട്ട്"
  },
  devoteeDetails: {
    kn: "ಜಾತಕರ ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ಸಂಕಲ್ಪ ವಿವರಗಳು",
    en: "Devotee Profile & Janana Kundali Sacred Sankalpa",
    hi: "जातक जन्म कुंडली एवं संकल्प विवरण",
    te: "జాతకుని జన్మ కుండలి & సంకల్ప వివరాలు",
    ta: "ஜாதகர் ஜனன ஜாதகம் & சங்கல்ப விவரங்கள்",
    ml: "ജാതകന്റെ ജന്മ കുണ്ഡലി & സങ്കല്പ വിവരങ്ങൾ"
  },
  labelName: { kn: "ಹೆಸರು", en: "Name", hi: "नाम", te: "పేరు", ta: "பெயர்", ml: "പേര്" },
  labelAge: { kn: "ವಯಸ್ಸು", en: "Age", hi: "आयु", te: "వయస్సు", ta: "வயது", ml: "പ്രായം" },
  labelGender: { kn: "ಲಿಂಗ", en: "Gender", hi: "लिंग", te: "లింగం", ta: "பாலினம்", ml: "ലിംഗം" },
  labelDob: { kn: "ಜನನ ದಿನಾಂಕ", en: "Date of Birth", hi: "जन्म तिथि", te: "పుట్టిన తేదీ", ta: "பிறந்த தேதி", ml: "ജനന തീയതി" },
  labelTob: { kn: "ಜನನ ಸಮಯ", en: "Time of Birth", hi: "जन्म समय", te: "పుట్టిన సమయం", ta: "பிறந்த நேரம்", ml: "ജനന സമയം" },
  labelPlace: { kn: "ಜನನ ಸ್ಥಳ", en: "Place of Birth", hi: "जन्म स्थान", te: "పుట్టిన స్థలం", ta: "பிறந்த இடம்", ml: "ജനന സ്ഥലം" },
  labelCoordinates: { kn: "ಅಕ್ಷಾಂಶ / ರೇಖಾಂಶ", en: "Coordinates (Lat/Lon)", hi: "अक्षांश / देशांतर", te: "అక్షాంశం / రేఖాంశం", ta: "அட்சரேகை / தீர்க்கரேகை", ml: "അക്ഷാംശം / രേഖാംശം" },
  labelLagna: { kn: "ಲಗ್ನ (ಉದಯ)", en: "Ascendant (Lagna)", hi: "लग्न", te: "లగ్నం", ta: "லக்னம்", ml: "ലഗ്നം" },
  labelLagnaLord: { kn: "ಲಗ್ನಾಧಿಪತಿ", en: "Lagna Lord", hi: "लग्नेश", te: "లగ్నాధిపతి", ta: "லக்னாதிபதி", ml: "ലഗ്നാധിപൻ" },
  labelRashi: { kn: "ಜನ್ಮ ರಾಶಿ (ಚಂದ್ರ)", en: "Moon Sign (Rashi)", hi: "जन्म राशि (चन्द्र)", te: "జన్మ రాశి (చంద్రుడు)", ta: "சந்திர ராசி", ml: "ജന്മ രാശി (ചന്ദ്രൻ)" },
  labelRashiLord: { kn: "ರಾಶ್ಯಾಧಿಪತಿ", en: "Rashi Lord", hi: "राशीश", te: "రాశ్యాధిపతి", ta: "ராசியாதிபதி", ml: "രാശ്യാധിപൻ" },
  labelNakshatra: { kn: "ಜನ್ಮ ನಕ್ಷತ್ರ", en: "Nakshatra", hi: "जन्म नक्षत्र", te: "జన్మ నక్షత్రం", ta: "நட்சத்திரம்", ml: "നക്ഷത്രം" },
  labelNakshatraLord: { kn: "ನಕ್ಷತ್ರಾಧಿಪತಿ", en: "Nakshatra Lord", hi: "नक्षत्रेश", te: "నక్షత్రాధిపతి", ta: "நட்சத்திராதிபதி", ml: "നക്ഷത്രാധിപൻ" },
  labelPada: { kn: "ಪಾದ", en: "Pada", hi: "चरण (पाद)", te: "పాదం", ta: "பாதம்", ml: "പാദം" },

  // Dasha-Bhukti & Gochara Live Section
  secDashaGocharaTitle: {
    kn: "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ",
    en: "Active Dasha-Bhukti & Live Planetary Transits (Gochara)",
    hi: "वर्तमान महादशा-भुक्ति एवं गोचर ग्रह स्थिति",
    te: "ప్రస్తుత మహాదశ-భుక్తి & గోచార గ్రహ సంచారం",
    ta: "தற்போதைய மகாதசா-புக்தி & கோச்சார கிரக நிலை",
    ml: "നിലവിലെ മഹാദശാ-ഭുക്തി & ഗോചാര ഗ്രഹ സ്ഥിതി"
  },
  labelActiveDasha: { kn: "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ", en: "Running Dasha-Bhukti", hi: "वर्तमान दशा-भुक्ति", te: "ప్రస్తుత దశా-భుక్తి", ta: "தற்போதைய தசா-புக்தி", ml: "നിലവിലെ ദശാ-ഭുക്തി" },
  labelLiveGochara: { kn: "ಗೋಚಾರ ಗ್ರಹ ಪ್ರಭಾವ", en: "Live Transit Influence", hi: "गोचर ग्रह प्रभाव", te: "గోచార గ్రహ ప్రభావం", ta: "கோச்சார கிரக தாக்கம்", ml: "ഗോചാര ഗ്രഹ സ്വാധീനം" },
  labelGuruTransit: { kn: "ಗುರು ಗೋಚಾರ", en: "Jupiter (Guru) Transit", hi: "गुरु गोचर", te: "గురు గోచారం", ta: "குரு கோச்சாரம்", ml: "ഗുരു ഗോചാരം" },
  labelShaniTransit: { kn: "ಶನಿ ಗೋಚಾರ (ಸಾಡೇಸಾತಿ)", en: "Saturn (Shani) Transit", hi: "शनि गोचर (साढ़ेसाती)", te: "శని గోచారం (సాడేసాతి)", ta: "சனி கோச்சாரம் (ஏழரை சனி)", ml: "ശനി ഗോചാരം (ഏഴരശ്ശനി)" },
  labelNextBhukti: { kn: "ಮುಂದಿನ ಭುಕ್ತಿ", en: "Next Bhukti", hi: "अगली भुक्ति", te: "తరువాతి భుక్తి", ta: "அடுத்த புக்தி", ml: "അടുത്ത ഭുക്തി" },
  labelTimeline: { kn: "ಅವಧಿ / ಕಾಲಾವಧಿ", en: "Duration / Timeline", hi: "समयावधि", te: "కాలవ్యవధి", ta: "கால அளவு", ml: "കാലയളവ്" },
  labelDegree: { kn: "ಲಗ್ನಾಂಶ", en: "Lagna Degree", hi: "लग्नांश", te: "లగ్నాంశం", ta: "லக்ன பாகை", ml: "ലഗ്നാംശം" },
  labelDashaRemaining: { kn: "ಉಳಿದ ಅವಧಿ", en: "Remaining Duration", hi: "शेष समयावधि", te: "మిగిలిన కాలం", ta: "மீதமுள்ள காலம்", ml: "ബാക്കി കാലയളവ്" },
  labelGocharaGuruSummary: { kn: "ಗುರು ಗೋಚಾರ ಸ್ಥಿತಿ", en: "Jupiter Transit Status", hi: "गुरु गोचर स्थिति", te: "గురు గోచార స్థితి", ta: "குரு கோச்சார நிலை", ml: "ഗുരു ഗോചാര സ്ഥിതി" },
  labelGocharaShaniSummary: { kn: "ಶನಿ ಗೋಚಾರ ಸ್ಥಿತಿ", en: "Saturn Transit Status", hi: "शनि गोचर स्थिति", te: "శని గోచార స్థితి", ta: "சனி கோச்சார நிலை", ml: "ശനി ഗോചാര സ്ഥിതി" },
  labelHouseFromMoon: { kn: "ನೇ ಮನೆ (ಚಂದ್ರನಿಂದ)", en: "th House from Moon", hi: "वां भाव (चन्द्र से)", te: "వ స్థానం (చంద్రుని నుండి)", ta: "-ஆம் இடம் (சந்திரனில் இருந்து)", ml: "-ാം ഭാവം (ചന്ദ്രനിൽ നിന്ന്)" },
  labelDeity: { kn: "ಅಧಿದೇವತೆ", en: "Deity", hi: "अधिदेवता", te: "అధిదేవత", ta: "அதிதேவதை", ml: "അധിദേവത" },
  labelLord: { kn: "ಅಧಿಪತಿ", en: "Ruling Lord", hi: "स्वामी ग्रह", te: "అధిపతి", ta: "அதிபதி", ml: "அധിപன்" },
  labelElement: { kn: "ತತ್ತ್ವ", en: "Tatva / Element", hi: "तत्व", te: "తత్త్వం", ta: "தத்துவம்", ml: "തത്വം" },
  labelAuspicious: { kn: "ಶುಭ ಯೋಗ", en: "Auspicious", hi: "शुभ योग", te: "శుభ యోగం", ta: "சுப யோகம்", ml: "ശുഭ യോഗം" },
  labelCaution: { kn: "ಶಾಂತಿ ಯೋಗ", en: "Caution / Shanti", hi: "शांति योग", te: "శాంతి యోగం", ta: "சாந்தி யோகம்", ml: "శాంతి యోగం" },
  labelChara: { kn: "ಚರ ಕರಣ", en: "Movable (Chara)", hi: "चर करण", te: "చర కరణం", ta: "சர கரணம்", ml: "ചര കരണം" },
  labelSthira: { kn: "ಸ್ಥಿರ ಕರಣ", en: "Fixed (Sthira)", hi: "स्थिर करण", te: "స్థిర కరణం", ta: "ஸ்திர கரணம்", ml: "സ്ഥിര കരണം" },

  // Panchanga 5-Angas
  secPanchangaTitle: {
    kn: "೧. ಪಂಚಾಂಗ ಪಂಚ ಅಂಗಗಳ ಶಾಸ್ತ್ರೋಕ್ತ ವಿಶ್ಲೇಷಣೆ",
    en: "1. Panchanga 5-Angas Astronomical Analysis",
    hi: "१. पंचांग के पंच अंगों का शास्त्रीय विश्लेषण",
    te: "1. పంచాంగ పంచాంగాల శాస్త్రోక్త విశ్లేషణ",
    ta: "1. பஞ்சாங்க 5-அங்கங்களின் சாஸ்திரோக்த பகுப்பாய்வு",
    ml: "൧. പഞ്ചാംഗ പഞ്ച അംഗങ്ങളുടെ ശാസ്ത്രീയ വിശകലനം"
  },
  labelVara: { kn: "ವಾರ (ಅಗ್ನಿ ತತ್ತ್ವ)", en: "Vara (Weekday / Fire)", hi: "वार (अग्नि तत्व)", te: "వారం (అగ్ని తత్త్వం)", ta: "வாரம் (அக்னி தத்துவம்)", ml: "വാരം (അഗ്നി തത്വം)" },
  labelTithi: { kn: "ತಿಥಿ (ಜಲ ತತ್ತ್ವ)", en: "Tithi (Lunar Day / Water)", hi: "तिथि (जल तत्व)", te: "తిథి (జల తత్త్వం)", ta: "திதி (ஜல தத்துவம்)", ml: "തിഥി (ജല തത്വം)" },
  labelYoga: { kn: "ಯೋಗ (ವಾಯು ತತ್ತ್ವ)", en: "Yoga (Air Element)", hi: "योग (वायु तत्व)", te: "యోగం (వాయు తత్త్వం)", ta: "யோகம் (வாயு தத்துவம்)", ml: "യോഗം (വായു തത്വം)" },
  labelKarana: { kn: "ಕರಣ (ಪೃಥ್ವಿ ತತ್ತ್ವ)", en: "Karana (Earth Element)", hi: "करण (पृथ्वी तत्व)", te: "కరణం (పృథ్వీ తత్త్వం)", ta: "கரணம் (பிருத்வி தத்துவம்)", ml: "കരണം (പൃഥ്വി തത്വം)" },

  // Executive Astrological Narration
  secNarrationTitle: {
    kn: "೨. ದೈವಜ್ಞ ಮುಖ್ಯಾಂಶ & ಸಮಗ್ರ ಜಾತಕ ಸಾರಾಂಶ",
    en: "2. Executive Astrological Synthesis & Reading",
    hi: "२. मुख्य ज्योतिषीय सार एवं समग्र मार्गदर्शन",
    te: "2. ముఖ్య జ్యోతిష్య సారాంశం & సంపూర్ణ ఫలితాలు",
    ta: "2. முதன்மை ஜோதிட சாரம் & முழுமையான பலன்",
    ml: "൨. മുഖ്യ ജ്യോതിഷ സംഗ്രഹം & സമഗ്ര ഫലങ്ങൾ"
  },

  // Page 1 Footer
  page1Footer: {
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ಪುಟ ೧ / ೨ (ಮುಂದುವರಿದಿದೆ...)",
    en: "Baggona Panchanga · Page 1 of 2 (Continued...)",
    hi: "बग्गोण पंचांग · पृष्ठ १ / २ (आगे जारी...)",
    te: "బగ్గోణ పంచాంగం · పేజీ 1 / 2 (కొనసాగింపు...)",
    ta: "பக்ககோண பஞ்சாங்கம் · பக்கம் 1 / 2 (தொடர்கிறது...)",
    ml: "ബഗ്ഗോണ പഞ്ചാംഗം · പേജ് ൧ / ൨ (തുടരുന്നു...)"
  },

  // Page 2 Sections
  secLifeRealityTitle: {
    kn: "೩. ಹಾಲಿ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಆಂತರಿಕ ಮನಸ್ಥಿತಿ",
    en: "3. Acute Life Reality & Psychological Weather",
    hi: "३. वर्तमान वास्तविक जीवन स्थिति एवं आंतरिक मनोस्थिति",
    te: "3. ప్రస్తుత వాస్తవ జీవన స్థితి & అంతరంగ ఆలోచనలు",
    ta: "3. தற்போதைய நிஜ வாழ்க்கை நிலை & மனோநிலை",
    ml: "൩. നിലവിലെ ജീവിത യാഥാർത്ഥ്യം & ആന്തരിക മനഃസ്ഥിതി"
  },
  labelExternalReality: {
    kn: "ಬಾಹ್ಯ ವಾಸ್ತವ ಸಂಗತಿಗಳು",
    en: "External Life Circumstances",
    hi: "बाह्य वास्तविक परिस्थितियां",
    te: "బాహ్య వాస్తవ పరిస్థితులు",
    ta: "வெளிப்புற வாழ்க்கை சூழல்",
    ml: "ബാഹ്യ ജീവിത സാഹചര്യങ്ങൾ"
  },
  labelInternalMindset: {
    kn: "ಆಂತರಿಕ ಮನಸ್ಥಿತಿ & ಆತಂಕಗಳು",
    en: "Internal Mindset & Subtle Anxieties",
    hi: "आंतरिक मनोदशा एवं चिंताएं",
    te: "ఆంతరిక ఆలోచనలు & ఆందోళనలు",
    ta: "உள் மனநிலை & நுட்பமான கவலைகள்",
    ml: "ആന്തരിക മനഃസ്ഥിതി & ഉത്കണ്ഠകൾ"
  },
  labelPlanetaryCulprit: {
    kn: "ಕಾರಕ ಗ್ರಹ & ದೋಷ ಪ್ರಭಾವ",
    en: "Planetary Root Cause & Transit Influence",
    hi: "कारक ग्रह एवं गोचर प्रभाव",
    te: "కారక గ్రహం & గోచార ప్రభావం",
    ta: "காரக கிரகம் & கோச்சார தாக்கம்",
    ml: "കാരക ഗ്രഹം & ഗോചാര സ്വാധീനം"
  },
  labelReliefTimeline: {
    kn: "ಪರಿಹಾರ ಹಾಗೂ ಶುಭ ಪರಿವರ್ತನಾ ಕಾಲಾವಧಿ",
    en: "Relief Timeline & Breakthrough Phase",
    hi: "राहत एवं शुभ परिवर्तन समयावधि",
    te: "ఉపశమనం & శుభ పరివర్తన కాలం",
    ta: "நிவாரணம் & சுப மாற்ற காலம்",
    ml: "ആശ്വാസവും ശുഭ പരിവർത്തന കാലയളവും"
  },

  // Career Destiny
  secCareerTitle: {
    kn: "೪. ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ ವೃತ್ತಿ ರಂಗಗಳು & ಕರ್ಮ ಯೋಗಗಳು",
    en: "4. Career Destiny & Prime Flourishing Domains",
    hi: "४. सर्वश्रेष्ठ सफलता प्रदायक कार्यक्षेत्र एवं कर्म योग",
    te: "4. అత్యున్నత విజయం సాధించే వృత్తి రంగాలు & కర్మ యోగాలు",
    ta: "4. சிறந்து விளங்கும் தொழில் துறைகள் & கர்ம யோகங்கள்",
    ml: "൪. മികച്ച വിജയം നൽകുന്ന കർമ്മ മേഖലകളും ഉന്നത യോഗങ്ങളും"
  },
  labelTopFields: {
    kn: "ಮುಖ್ಯ ಯಶಸ್ವಿ ಕ್ಷೇತ್ರಗಳು",
    en: "Top Destined Career Fields",
    hi: "शीर्ष उपयुक्त क्षेत्र",
    te: "ప్రధాన విజయవంతమైన రంగాలు",
    ta: "முதன்மை வெற்றித் துறைகள்",
    ml: "പ്രധാന വിജയകരമായ മേഖലകൾ"
  },
  labelCareerYogas: {
    kn: "ಕರ್ಮ ಸ್ಥಾನದ ಶುಭ ಯೋಗಗಳು",
    en: "Auspicious Career Yogas",
    hi: "कर्म भाव के शुभ योग",
    te: "కర్మ స్థాన శుభ యోగాలు",
    ta: "கர்ம ஸ்தான சுப யோகங்கள்",
    ml: "കർമ്മ സ്ഥാനത്തെ ശുഭ യോഗങ്ങൾ"
  },
  labelLeadership: {
    kn: "ನಾಯಕತ್ವ ಹಾಗೂ ಪ್ರತಿಭಾ ಶಕ್ತಿ",
    en: "Leadership & Intellectual Aptitudes",
    hi: "नेतृत्व क्षमता एवं बौद्धिक प्रतिभा",
    te: "నాయకత్వ సామర్థ్యం & మేధస్సు",
    ta: "தலைமைத்துவ திறன் & அறிவுத்திறன்",
    ml: "നേതൃത്വ ശേഷിയും ബൗദ്ധിക പ്രതിഭയും"
  },

  // Marriage & Family
  secMarriageTitle: {
    kn: "೫. ದಾಂಪತ್ಯ & ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ ಸ್ಥಿತಿ",
    en: "5. Marriage & Family Harmony Assessment",
    hi: "५. दांपत्य एवं पारिवारिक सामंजस्य विश्लेषण",
    te: "5. దాంపత్య & కుటుంబ సామరస్య స్థితి",
    ta: "5. தாம்பத்தியம் & குடும்ப நல்லிணக்க நிலை",
    ml: "൫. ദാമ്പത്യം & കുടുംബ ജീവിത വിശകലനം"
  },
  labelSpouseNature: {
    kn: "ಜೀವನ ಸಂಗಾತಿಯ ಸ್ವಭಾವ",
    en: "Nature of Spouse",
    hi: "जीवनसाथी का स्वभाव",
    te: "జీవిత భాగస్వామి స్వభావం",
    ta: "வாழ்க்கைத் துணையின் குணம்",
    ml: "ജീവിതപങ്കാളിയുടെ സ്വഭാവം"
  },
  labelMaritalHarmony: {
    kn: "ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ & ಕುಟುಂಬ ಸುಖ",
    en: "Marital Peace & Domestic Stability",
    hi: "दांपत्य शांति एवं गृह सुख",
    te: "దాంపత్య శాంతి & గృహ సౌఖ్యం",
    ta: "தாம்பத்திய அமைதி & குடும்ப மகிழ்ச்சி",
    ml: "ദാമ്പത്യ സമാധാനവും കുടുംബ സുഖവും"
  },

  // Remedial Directives
  secRemediesTitle: {
    kn: "೬. ದೈವಿಕ ಪರಿಹಾರಗಳು & ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪೂಜಾ ಸಂಕಲ್ಪ",
    en: "6. Sacred Gokarna Remedies & Remedial Directives",
    hi: "६. पावन गोकर्ण उपाय एवं पूजा संकल्प",
    te: "6. పవిత్ర గోకర్ణ పరిహారాలు & పూజా సంకల్పం",
    ta: "6. புனித கோகர்ண பரிகாரங்கள் & பூஜை சங்கல்பம்",
    ml: "൬. പവിത്ര ഗോകർണ പരിഹാരങ്ങളും പൂജാ സങ്കല്പവും"
  },
  labelRudraksha: {
    kn: "ಧಾರಣೆಗೆ ಸೂಕ್ತ ರುದ್ರಾಕ್ಷಿ",
    en: "Sacred Rudraksha Prescription",
    hi: "धारण हेतु रुद्राक्ष",
    te: "ధారణకు అనువైన రుద్రాక్ష",
    ta: "அணிய வேண்டிய ருத்ராட்சம்",
    ml: "ധരിക്കേണ്ട രുദ്രാക്ഷം"
  },
  labelGemstone: {
    kn: "ಶುಭ ರತ್ನ ಹಾಗೂ ಧಾರಣಾ ಬೆರಳು",
    en: "Auspicious Gemstone & Finger",
    hi: "शुभ रत्न एवं धारण अंगुली",
    te: "శుభ రత్నం & ధారణ వేలు",
    ta: "சுப ரத்தினம் & அணியும் விரல்",
    ml: "ശുഭ രത്നവും ധരിക്കേണ്ട വിരലും"
  },
  labelDailyRitual: {
    kn: "ದೈನಂದಿನ ಪ್ರಾತಃಕಾಲದ ದೈವಿಕ ಕರ್ಮ",
    en: "Daily Morning Vedic Ritual",
    hi: "दैनिक प्रातःकालीन देव आराधना",
    te: "దైనందిన ప్రాతఃకాల ఆరాధన",
    ta: "தினசரி காலை வேத வழிபாடு",
    ml: "നിത്യേനയുള്ള പ്രഭാത ആരാധന"
  },
  labelTemplePooja: {
    kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಸಂಕಲ್ಪ",
    en: "Gokarna Mahabaleshwara Pooja Seva",
    hi: "गोकर्ण महाबलेश्वर क्षेत्र संकल्प",
    te: "గోకర్ణ మహాబలేశ్వర క్షేత్ర సంకల్పం",
    ta: "கோகர்ண மகாபலேஸ்வரர் சங்கல்பம்",
    ml: "ഗോകർണ മഹാബലേശ്വര ക്ഷേത്ര സങ്കല്പം"
  },

  // Priest & Stamp
  priestBlessingTitle: {
    kn: "ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮುದ್ರೆ",
    en: "Chief Priest Blessing & Gokarna Kshetra Seal",
    hi: "प्रधान अर्चक का आशीर्वचन एवं गोकर्ण क्षेत्र मुद्रा",
    te: "ప్రధాన అర్చకుల ఆశీర్వచనం & గోకర్ణ క్షేత్ర ముద్ర",
    ta: "முதன்மை அர்ச்சகர் ஆசி & கோகர்ண க்ஷேத்திர முத்திரை",
    ml: "മുഖ്യ അർച്ചകരുടെ അനുഗ്രഹവും ഗോകർണ്ണ മുദ്രയും"
  },
  priestName: {
    kn: "ವೇ| ಮೂ| ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
    en: "Veda Murthy Shreeram Pandit",
    hi: "वेद मूर्ति श्रीराम पंडित (Shreeram Pandit)",
    te: "వేద మూర్తి శ్రీరామ్ పండిత్ (Shreeram Pandit)",
    ta: "வேத மூர்த்தி ஸ்ரீராம் பண்டிட் (Shreeram Pandit)",
    ml: "വേദമൂർത്തി ശ്രീറാം പണ്ഡിറ്റ് (Shreeram Pandit)"
  },
  priestRole: {
    kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು · ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ",
    en: "Chief Priest · Sri Gokarna Mahabaleshwara Kshetra · Baggona Panchanga Astrology",
    hi: "प्रधान अर्चक · श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष कार्यालय",
    te: "ప్రధాన అర్చకులు · శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్య కార్యాలయం",
    ta: "முதன்மை அர்ச்சகர் · ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்ககோண பஞ்சாங்க அலுவலகம்",
    ml: "മുഖ്യ അർച്ചകൻ · ശ്രീ ഗോകർണ മഹാബലേഷ്വര സന്നിധാനം · ബഗ്ഗോണ പഞ്ചാംഗ ജ്യോതിഷ കാര്യാലയം"
  },
  shantiMantra: {
    kn: "॥ ॐ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ · ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ॥",
    en: "॥ Om Shantih Shantih Shantih · Sarve Bhavantu Sukhinah Sarve Santu Niramayah ॥",
    hi: "॥ ॐ शान्तिः शान्तिः शान्तिः · सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥",
    te: "॥ ఓం శాంతిః శాంతిః శాంతిః · సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః ॥",
    ta: "॥ ஓம் சாந்தி சாந்தி சாந்தி · சர்வே பவந்து சுகின: சர்வே சந்து நிராமயா: ॥",
    ml: "॥ ഓം ശാന്തിഃ ശാന്തിഃ ശാന്തിഃ · സർവ്വേ ഭവന്തു സുഖിനഃ സർവ്വേ സന്തു നിരാമയാഃ ॥"
  },
  page2Footer: {
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ಪುಟ ೨ / ೨ (ಸಂಪೂರ್ಣ)",
    en: "Sri Gokarna Mahabaleshwara Kshetra · Baggona Panchanga · Page 2 of 2 (Complete)",
    hi: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · पृष्ठ २ / २ (पूर्ण)",
    te: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2 / 2 (సంపూర్ణం)",
    ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்ககோண பஞ்சாங்கம் · பக்கம் 2 / 2 (முழுமை)",
    ml: "ശ്രീ ഗോകർണ മഹാബലേഷ്വര സന്നിധാനം · ബഗ്ഗോണ പഞ്ചാംഗം · പേജ് ൨ / ൨ (സമ്പൂർണ്ണം)"
  }
};

/* ------------------------------------------------------------------ *
 * Astrological Vocabulary Lookups (12 Rashis across 6 languages)
 * ------------------------------------------------------------------ */

export const RASHIS_L6: Record<number, L6> = {
  0: { kn: "ಮೇಷ", en: "Aries (Mesha)", hi: "मेष", te: "మేషం", ta: "மேஷம்", ml: "മേടം" },
  1: { kn: "ವೃಷಭ", en: "Taurus (Vrishabha)", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்", ml: "ഇടവം" },
  2: { kn: "ಮಿಥುನ", en: "Gemini (Mithuna)", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்", ml: "മിഥുനം" },
  3: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer (Karka)", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்", ml: "കർക്കടകം" },
  4: { kn: "ಸಿಂಹ", en: "Leo (Simha)", hi: "सिंह", te: "సింహం", ta: "சிம்மம்", ml: "ചിങ്ങം" },
  5: { kn: "ಕನ್ಯಾ", en: "Virgo (Kanya)", hi: "कन्या", te: "కన్య", ta: "கன்னி", ml: "കന്നി" },
  6: { kn: "ತುಲಾ", en: "Libra (Tula)", hi: "तुला", te: "తులా", ta: "துலாம்", ml: "തുലാം" },
  7: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio (Vrischika)", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்", ml: "വൃശ്ചികം" },
  8: { kn: "ಧನುಸ್ಸು", en: "Sagittarius (Dhanus)", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு", ml: "ധനു" },
  9: { kn: "ಮಕರ", en: "Capricorn (Makara)", hi: "मकर", te: "మకరం", ta: "மகரம்", ml: "മകരം" },
  10: { kn: "ಕುಂಭ", en: "Aquarius (Kumbha)", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்", ml: "കുംഭം" },
  11: { kn: "ಮೀನ", en: "Pisces (Meena)", hi: "मीन", te: "మీనం", ta: "மீனம்", ml: "മീനം" }
};

export const getRashiName = (rashiIndexOrName: number | string | undefined | null, lang: string): string => {
  if (rashiIndexOrName === undefined || rashiIndexOrName === null) return "";
  let idx = 0;
  if (typeof rashiIndexOrName === "number") {
    idx = ((rashiIndexOrName % 12) + 12) % 12;
  } else {
    const s = String(rashiIndexOrName).toLowerCase();
    if (s.includes("ari") || s.includes("mesh") || s.includes("ಮೇಷ") || s.includes("മേടം")) idx = 0;
    else if (s.includes("tau") || s.includes("vrish") || s.includes("ವೃಷಭ") || s.includes("ഇടവം")) idx = 1;
    else if (s.includes("gem") || s.includes("mith") || s.includes("ಮಿಥುನ") || s.includes("മിഥുനം")) idx = 2;
    else if (s.includes("can") || s.includes("kark") || s.includes("ಕರ್ಕ") || s.includes("കർക്കടകം")) idx = 3;
    else if (s.includes("leo") || s.includes("simh") || s.includes("ಸಿಂಹ") || s.includes("ചിങ്ങം")) idx = 4;
    else if (s.includes("vir") || s.includes("kany") || s.includes("ಕನ್ಯಾ") || s.includes("കന്നി")) idx = 5;
    else if (s.includes("lib") || s.includes("tul") || s.includes("ತುಲಾ") || s.includes("തുലാം")) idx = 6;
    else if (s.includes("sco") || s.includes("vrisc") || s.includes("ವೃಶ್ಚಿಕ") || s.includes("വൃശ്ചികം")) idx = 7;
    else if (s.includes("sag") || s.includes("dhan") || s.includes("ಧನು") || s.includes("ധനു")) idx = 8;
    else if (s.includes("cap") || s.includes("mak") || s.includes("ಮಕರ") || s.includes("മകരം")) idx = 9;
    else if (s.includes("aqu") || s.includes("kumb") || s.includes("ಕುಂಭ") || s.includes("കുംഭം")) idx = 10;
    else if (s.includes("pis") || s.includes("meen") || s.includes("ಮೀನ") || s.includes("മീനം")) idx = 11;
  }
  return pickL6(RASHIS_L6[idx], lang);
};

/* ------------------------------------------------------------------ *
 * 27 Nakshatras across 6 languages
 * ------------------------------------------------------------------ */

export const NAKSHATRAS_L6: Record<number, L6> = BAGGONA_NAKSHATRAS_MASTER.reduce(
  (acc, n) => {
    acc[n.index] = {
      kn: n.nameKn,
      en: n.nameEn,
      hi: n.nameHi,
      te: n.nameTe,
      ta: n.nameTa,
      ml: n.nameMl
    };
    return acc;
  },
  {} as Record<number, L6>
);

export const getNakshatraName = (nameOrIndex: number | string | undefined | null, lang: string): string => {
  if (nameOrIndex === undefined || nameOrIndex === null) return "";
  const fromMaster = getBaggonaNakshatra(nameOrIndex, lang as any);
  if (fromMaster) return fromMaster;

  let idx = 0;
  if (typeof nameOrIndex === "number") {
    idx = ((nameOrIndex % 27) + 27) % 27;
  } else {
    const s = String(nameOrIndex).toLowerCase();
    const keys = Object.values(NAKSHATRAS_L6);
    const found = keys.findIndex((n) => s.includes(n.en.toLowerCase()) || s.includes(n.kn.toLowerCase()));
    idx = found >= 0 ? found : 0;
  }
  return pickL6(NAKSHATRAS_L6[idx], lang);
};

/* ------------------------------------------------------------------ *
 * Weekdays (7 Varas) across 6 languages
 * Somavara, Mangalavara, Budhavara, Guruvara, Shukravara, Shanivara, Ravivara
 * ------------------------------------------------------------------ */

export const VARAS_L6: Record<string, L6> = {
  ...BAGGONA_VARAS_MASTER.reduce((acc, v) => {
    const l6: L6 = {
      kn: v.nameKn,
      en: v.nameEn,
      hi: v.nameHi,
      te: v.nameTe,
      ta: v.nameTa,
      ml: v.nameMl
    };
    acc[v.canonicalEn] = l6;
    if (v.canonicalEn === "Somavara") acc["Monday"] = l6;
    if (v.canonicalEn === "Mangalavara") acc["Tuesday"] = l6;
    if (v.canonicalEn === "Budhavara") acc["Wednesday"] = l6;
    if (v.canonicalEn === "Guruvara") acc["Thursday"] = l6;
    if (v.canonicalEn === "Shukravara") acc["Friday"] = l6;
    if (v.canonicalEn === "Shanivara") acc["Saturday"] = l6;
    if (v.canonicalEn === "Ravivara") {
      acc["Sunday"] = l6;
      acc["Bhanuvara"] = l6;
    }
    return acc;
  }, {} as Record<string, L6>)
};

export const getVaraName = (varaNameKnOrEn: string, lang: string): string => {
  if (!varaNameKnOrEn) return "";
  const fromMaster = getBaggonaVara(varaNameKnOrEn, lang as any);
  if (fromMaster) return fromMaster;

  const v = (varaNameKnOrEn || "").toLowerCase();
  for (const [key, dict] of Object.entries(VARAS_L6)) {
    if (v.includes(key.toLowerCase()) || v.includes(dict.kn.toLowerCase())) {
      return pickL6(dict, lang);
    }
  }
  return varaNameKnOrEn;
};

/* ------------------------------------------------------------------ *
 * 9 Grahas across 6 languages
 * ------------------------------------------------------------------ */

export const PLANETS_L6: Record<string, L6> = {
  Sun: { kn: "ರವಿ", en: "Sun (Ravi)", hi: "सूर्य (रवि)", te: "రవి", ta: "சூரியன் (ரவி)", ml: "സൂര്യൻ (രവി)" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்", ml: "ചന്ദ്രൻ" },
  Mars: { kn: "ಕುಜ", en: "Mars (Kuja)", hi: "मंगल (कुज)", te: "కుజుడు", ta: "செவ்வாய் (குஜன்)", ml: "ചൊവ്വ (കുജൻ)" },
  Mercury: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்", ml: "ബുധൻ" },
  Jupiter: { kn: "ಗುರು", en: "Jupiter (Guru)", hi: "गुरु (बृहस्पति)", te: "గురువు", ta: "குரு", ml: "വ്യാഴം (ഗുരു)" },
  Venus: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்", ml: "ശുക്രൻ" },
  Saturn: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनि", te: "శని", ta: "சனி", ml: "ശനി" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு", ml: "രാഹു" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது", ml: "കേതു" }
};

export const getPlanetName = (planetName: string, lang: string): string => {
  const p = (planetName || "").trim().toLowerCase();
  for (const [key, dict] of Object.entries(PLANETS_L6)) {
    if (p === key.toLowerCase() || p.includes(dict.kn) || p.includes(dict.en.toLowerCase())) {
      return pickL6(dict, lang);
    }
  }
  return planetName;
};

export const getSignLordName = (rashiIndexOrName: number | string, lang: string): string => {
  let idx = 0;
  if (typeof rashiIndexOrName === "number") {
    idx = ((rashiIndexOrName % 12) + 12) % 12;
  } else {
    const s = String(rashiIndexOrName).toLowerCase();
    if (s.includes("ari") || s.includes("mesh") || s.includes("ಮೇಷ")) idx = 0;
    else if (s.includes("tau") || s.includes("vrish") || s.includes("ವೃಷಭ")) idx = 1;
    else if (s.includes("gem") || s.includes("mith") || s.includes("ಮಿಥುನ")) idx = 2;
    else if (s.includes("can") || s.includes("kark") || s.includes("ಕರ್ಕ")) idx = 3;
    else if (s.includes("leo") || s.includes("simh") || s.includes("ಸಿಂಹ")) idx = 4;
    else if (s.includes("vir") || s.includes("kany") || s.includes("ಕನ್ಯಾ")) idx = 5;
    else if (s.includes("lib") || s.includes("tul") || s.includes("ತುಲಾ")) idx = 6;
    else if (s.includes("sco") || s.includes("vrisc") || s.includes("ವೃಶ್ಚಿಕ")) idx = 7;
    else if (s.includes("sag") || s.includes("dhan") || s.includes("ಧನು")) idx = 8;
    else if (s.includes("cap") || s.includes("mak") || s.includes("ಮಕರ")) idx = 9;
    else if (s.includes("aqu") || s.includes("kumb") || s.includes("ಕುಂಭ")) idx = 10;
    else if (s.includes("pis") || s.includes("meen") || s.includes("ಮೀನ")) idx = 11;
  }
  const lordPlanets = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  return getPlanetName(lordPlanets[idx], lang);
};

export const getNakshatraLordName = (nakIndexOrName: number | string, lang: string): string => {
  let idx = 0;
  if (typeof nakIndexOrName === "number") {
    idx = ((nakIndexOrName % 27) + 27) % 27;
  } else {
    const s = String(nakIndexOrName).toLowerCase();
    const keys = Object.values(NAKSHATRAS_L6);
    const found = keys.findIndex((n) => s.includes(n.en.toLowerCase()) || s.includes(n.kn.toLowerCase()));
    idx = found >= 0 ? found : 0;
  }
  const vimshottariOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  return getPlanetName(vimshottariOrder[idx % 9], lang);
};

export function isNarrationScriptMatchingLang(text: string, lang: SupportedPdfLang): boolean {
  if (!text || text.trim().length === 0) return false;
  switch (lang) {
    case "kn":
      return /[\u0C80-\u0CFF]/.test(text);
    case "hi":
      return /[\u0900-\u097F]/.test(text);
    case "te":
      return /[\u0C00-\u0C7F]/.test(text);
    case "ta":
      return /[\u0B80-\u0BFF]/.test(text);
    case "ml":
      return /[\u0D00-\u0D7F]/.test(text);
    case "en":
    default:
      return /^[A-Za-z0-9\s.,!?:;'"()—–\-]+$/.test(text.slice(0, 50)) || (!/[\u0C80-\u0D7F\u0900-\u097F]/.test(text));
  }
}

/* ------------------------------------------------------------------ *
 * Gender and Geographic Coordinates Localization
 * ------------------------------------------------------------------ */

export const GENDERS_L6: Record<string, L6> = {
  male: { kn: "ಪುರುಷ", en: "Male", hi: "पुरुष", te: "పురుషుడు", ta: "ஆண்", ml: "പുരുഷൻ" },
  female: { kn: "ಸ್ತ್ರೀ (ಮಹಿಳೆ)", en: "Female", hi: "स्त्री (महिला)", te: "స్త్రీ", ta: "பெண்", ml: "സ്ത്രീ" },
  other: { kn: "ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ", en: "Not Specified", hi: "अनिर्दिष्ट", te: "పేర్కొనబడలేదు", ta: "குறிப்பிடப்படவில்லை", ml: "വ്യക്തമാക്കിയിട്ടില്ല" }
};

export const getGenderName = (gender: string | undefined | null, lang: string): string => {
  const g = (gender || "").toLowerCase();
  if (g.includes("fem") || g.includes("ಮಹಿ") || g.includes("ಸ್ತ್ರೀ") || g.includes("महिला") || g.includes("స్త్రీ") || g.includes("பெண்") || g.includes("സ്ത്രീ")) {
    return pickL6(GENDERS_L6.female, lang);
  }
  if (g.includes("mal") || g.includes("ಪುರು") || g.includes("पुरुष") || g.includes("పురుష") || g.includes("ஆண்") || g.includes("പുരുഷൻ")) {
    return pickL6(GENDERS_L6.male, lang);
  }
  return pickL6(GENDERS_L6.other, lang);
};

export const formatCoordinates = (lat?: number, lon?: number): string => {
  if (lat == null || lon == null || (lat === 0 && lon === 0)) return "14.54° N, 74.31° E";
  const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lonStr}`;
};

export const formatDegree = (degree?: number): string => {
  if (degree == null || isNaN(degree)) return "";
  const d = ((degree % 30) + 30) % 30;
  const deg = Math.floor(d);
  const min = Math.round((d - deg) * 60);
  return `${deg}° ${min.toString().padStart(2, "0")}'`;
};

export const getGocharaGuruDescription = (
  guruHouseFromMoon: number,
  isGuruAnukula: boolean,
  lang: string
): string => {
  if (isGuruAnukula) {
    const dict: L6 = {
      kn: `ಗೋಚಾರ ಗುರುವು ಜನ್ಮ ರಾಶಿಯಿಂದ ${guruHouseFromMoon}ನೇ ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಭಾಗ್ಯೋದಯ, ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆರ್ಥಿಕ ವೃದ್ಧಿಗೆ ಪೂರಕವಾಗಿದ್ದಾನೆ.`,
      en: `Transiting Jupiter is in auspicious House ${guruHouseFromMoon} from your Moon, conferring divine protection, fortune, and prosperity.`,
      hi: `गोचर गुरु जन्म राशि से ${guruHouseFromMoon}वें शुभ भाव में स्थित होकर भाग्योदय, सुरक्षा एवं धन वृद्धि प्रदान कर रहे हैं।`,
      te: `గోచార గురుడు జన్మ రాశి నుండి ${guruHouseFromMoon}వ శుభ స్థానంలో ఉండి భాగ్యోదయం, దైవ రక్షణ మరియు ధన వృద్ధిని అనుగ్రహిస్తున్నారు.`,
      ta: `கோச்சார குரு சந்திர ராசிக்கு ${guruHouseFromMoon}-ஆம் சுப ஸ்தானத்தில் அமர்ந்து பாக்கியோதயம், தெய்வீக பாதுகாப்பு மற்றும் பொருளாதார வளர்ச்சியை அளிக்கிறார்.`,
      ml: `ഗോചാര വ്യാഴം ജന്മ രാശിയിൽ നിന്ന് ${guruHouseFromMoon}-ാം ശുഭ ഭാവത്തിൽ സ്ഥിതി ചെയ്ത് ഭാഗ്യോദയവും ദൈവീക സംരക്ഷണവും നൽകുന്നു.`
    };
    return pickL6(dict, lang);
  }
  const dict: L6 = {
    kn: `ಗೋಚಾರ ಗುರುವು ಜನ್ಮ ರಾಶಿಯಿಂದ ${guruHouseFromMoon}ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ, ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ನೀಡಲಿದ್ದಾನೆ.`,
    en: `Transiting Jupiter is in House ${guruHouseFromMoon} from Moon, requiring patience, discipline, and spiritual focus.`,
    hi: `गोचर गुरु जन्म राशि से ${guruHouseFromMoon}वें भाव में होकर धैर्य, अनुशासन एवं आध्यात्मिक ध्यान की अपेक्षा रखते हैं।`,
    te: `గోచార గురుడు జన్మ రాశి నుండి ${guruHouseFromMoon}వ స్థానంలో ఉండి ఓర్పు, క్రమశిక్షణ మరియు ఆధ్యాత్మిక సాధనను సూచిస్తున్నారు.`,
    ta: `கோச்சார குரு சந்திர ராசிக்கு ${guruHouseFromMoon}-ஆம் வீட்டில் அமர்ந்து பொறுமை, ஒழுக்கம் மற்றும் ஆன்மீக ஈடுபாட்டை வலியுறுத்துகிறார்.`,
    ml: `ഗോചാര വ്യാഴം ജന്മ രാശിയിൽ നിന്ന് ${guruHouseFromMoon}-ാം ഭാവത്തിൽ സ്ഥിതി ചെയ്ത് ക്ഷമയും ആത്മീയ ചിന്തയും ആവശ്യപ്പെടുന്നു.`
  };
  return pickL6(dict, lang);
};

export const getGocharaShaniDescription = (
  shaniHouseFromMoon: number,
  isSadeSati: boolean,
  isAshtamaShani: boolean,
  isKantakaShani: boolean,
  lang: string
): string => {
  if (isSadeSati) {
    const dict: L6 = {
      kn: `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ ${shaniHouseFromMoon}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಸಾಡೇ ಸಾತಿ ಪ್ರಭಾವವಿದೆ. ಇದು ಪರಿಶ್ರಮ ಮತ್ತು ಕರ್ಮ ಶುದ್ಧಿಯ ಕಾಲವಾಗಿದೆ.`,
      en: `Saturn is transiting House ${shaniHouseFromMoon} from Moon (Sade Sati phase), demanding disciplined karma and perseverance.`,
      hi: `शनि जन्म राशि से ${shaniHouseFromMoon}वें भाव में गोचर कर रहे हैं (साढ़ेसाती प्रभाव), जो कर्म शुद्धि एवं धैर्य का समय है।`,
      te: `శని జన్మ రాశి నుండి ${shaniHouseFromMoon}వ స్థానంలో సంచరిస్తూ సాడేసాతి ప్రభావం చూపుతున్నారు; ఇది కర్మ శుద్ధి మరియు సహన సమయం.`,
      ta: `சனி சந்திர ராசிக்கு ${shaniHouseFromMoon}-ஆம் வீட்டில் கோச்சாரம் செய்கிறார் (ஏழரை சனி), இது கர்ம தூய்மை மற்றும் பொறுமைக்கான காலம்.`,
      ml: `ശനി ജന്മ രാശിയിൽ നിന്ന് ${shaniHouseFromMoon}-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നു (ഏഴരശ്ശനി കാലഘട്ടം), ഇത് കർമ്മ ശുദ്ധീകരണത്തിന്റെ സമയമാണ്.`
    };
    return pickL6(dict, lang);
  }
  if (isAshtamaShani) {
    const dict: L6 = {
      kn: `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ 8ನೇ ಸ್ಥಾನದಲ್ಲಿ (ಅಷ್ಟಮ ಶನಿ) ಸಂಚರಿಸುತ್ತಿದ್ದು, ಆರೋಗ್ಯ ಮತ್ತು ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕತೆ ಅಗತ್ಯ.`,
      en: `Saturn is transiting House 8 from Moon (Ashtama Shani), requiring protective remedies and health vigilance.`,
      hi: `शनि जन्म राशि से ८वें भाव में (अष्टम शनि) हैं, स्वास्थ्य व यात्रा में सावधानी एवं शांति उपाय आवश्यक हैं।`,
      te: `శని 8వ స్థానంలో (అష్టమ శని) సంచరిస్తున్నారు, ఆరోగ్యం మరియు ప్రయాణాలలో జాగ్రత్త అవసరం.`,
      ta: `சனி 8-ஆம் இடத்தில் (அஷ்டம சனி) சஞ்சரிக்கிறார், ஆரோக்கியம் மற்றும் பயணங்களில் கூடுதல் கவனம் தேவை.`,
      ml: `ശനി 8-ാം ഭാവത്തിൽ (അഷ്ടമ ശനി) സഞ്ചരിക്കുന്നു, ആരോഗ്യത്തിലും യാത്രകളിലും ജാഗ്രത ആവശ്യമാണ്.`
    };
    return pickL6(dict, lang);
  }
  if (isKantakaShani) {
    const dict: L6 = {
      kn: `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ 4ನೇ ಮನೆಯಲ್ಲಿ (ಕಂಟಕ ಶನಿ) ಸ್ಥಿತನಾಗಿದ್ದು, ಕೌಟುಂಬಿಕ ಹಾಗೂ ಗೃಹ ವಿಚಾರಗಳಲ್ಲಿ ಸಂಯಮದ ಅಗತ್ಯವಿದೆ.`,
      en: `Saturn is transiting House 4 from Moon (Kantaka Shani), calling for domestic patience and mindfulness.`,
      hi: `शनि जन्म राशि से चतुर्थ भाव में (कंटक शनि) हैं, पारिवारिक मामलों में धैर्य एवं शांति बनाए रखें।`,
      te: `శని 4వ స్థానంలో (కంటక శని) ఉన్నారు, కుటుంబ విషయాలలో ఓర్పు మరియు సంయమనం అవసరం.`,
      ta: `சனி 4-ஆம் இடத்தில் (கண்டக சனி) அமர்ந்துள்ளார், குடும்ப விவகாரங்களில் நிதானம் அவசியம்.`,
      ml: `ശനി 4-ാം ഭാവത്തിൽ (കണ്ടക ശനി) സ്ഥിതി ചെയ്യുന്നു, കുടുംബ കാര്യങ്ങളിൽ ക്ഷമയും സംയമനവും വേണം.`
    };
    return pickL6(dict, lang);
  }
  if ([3, 6, 11].includes(shaniHouseFromMoon)) {
    const dict: L6 = {
      kn: `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ ${shaniHouseFromMoon}ನೇ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಶತ್ರು ಜಯ, ಕಾರ್ಯಸಿದ್ಧಿ ಮತ್ತು ದೃಢ ಸಂಕಲ್ಪಕ್ಕೆ ಅಪಾರ ಬಲ ನೀಡುತ್ತಿದ್ದಾನೆ.`,
      en: `Saturn is transiting House ${shaniHouseFromMoon} from Moon (Upachaya strength), granting victory over challenges and enduring success.`,
      hi: `शनि जन्म राशि से ${shaniHouseFromMoon}वें उपचय भाव में स्थित होकर शत्रुओं पर विजय, कार्यसिद्धि एवं दृढ़ संकल्प शक्ति दे रहे हैं।`,
      te: `శని ${shaniHouseFromMoon}వ ఉపచయ స్థానంలో ఉండి శత్రు విజయం, కార్యసిద్ధి మరియు దృఢ సంకల్పాన్ని ప్రసాదిస్తున్నారు.`,
      ta: `சனி ${shaniHouseFromMoon}-ஆம் உபசய ஸ்தானத்தில் அமர்ந்து எதிரிகள் வெற்றி, காரிய சித்தி மற்றும் மன உறுதியை அருளுகிறார்.`,
      ml: `ശനി ${shaniHouseFromMoon}-ാം ഉപചയ ഭാവത്തിൽ സ്ഥിതി ചെയ്ത് ശത്രു ജയവും കാര്യസിദ്ധിയും ദൃഢനിശ്ചയവും നൽകുന്നു.`
    };
    return pickL6(dict, lang);
  }
  const dict: L6 = {
    kn: `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ ${shaniHouseFromMoon}ನೇ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಮತ್ತು ಸತ್ಯವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ.`,
    en: `Saturn is transiting House ${shaniHouseFromMoon} from Moon, strengthening responsibility and ethical resolve.`,
    hi: `शनि जन्म राशि से ${shaniHouseFromMoon}वें भाव में गोचर कर रहे हैं, जो कर्तव्यनिष्ठा एवं नैतिक निष्ठा को सुदृढ़ कर रहे हैं।`,
    te: `శని ${shaniHouseFromMoon}వ స్థానంలో సంచరిస్తూ కర్తవ్య నిష్ఠను మరియు క్రమశిక్షణను బలపరుస్తున్నారు.`,
    ta: `சனி ${shaniHouseFromMoon}-ஆம் இடத்தில் சஞ்சரித்து கடமை உணர்வையும் நேர்மையையும் பலப்படுத்துகிறார்.`,
    ml: `ശനി ${shaniHouseFromMoon}-ാം ഭാവത്തിൽ സഞ്ചരിച്ച് കർമ്മ നിഷ്ഠയെയും ധാർമ്മികതയെയും ശക്തിപ്പെടുത്തുന്നു.`
  };
  return pickL6(dict, lang);
};

/* ------------------------------------------------------------------ *
 * Deterministic Multi-Language Executive Astrological Narration
 * ------------------------------------------------------------------ */

export interface DevoteeIdentity {
  name: string;
  age: number;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lagnaName: string;
  rashiName: string;
  nakshatraName: string;
  pada: number;
  latitude?: number;
  longitude?: number;
  lagnaDegreeFormatted?: string;
  runningDashaSummary?: string;
  runningGocharaSummary?: string;
}

/**
 * Generates an authoritative, 4-paragraph Vedic executive reading in any of the 6 languages.
 * 100% astronomically grounded, zero raw markdown asterisks, culturally reverent and tailored.
 */
export function generateLocalizedExecutiveNarration(
  data: PanchangaSynthesisOutput,
  devotee: DevoteeIdentity,
  lang: SupportedPdfLang
): string[] {
  const cls = data.currentDiagnosis.currentLifeSituation;
  const prof = data.currentDiagnosis.accurateProfession;
  const dasha = devotee.runningDashaSummary || data.currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.trim() || "ದಶಾ ಚಕ್ರ";
  const gochara = devotee.runningGocharaSummary || data.currentDiagnosis.prasthuthaSthiti.runningGocharaSummary || "ಗೋಚಾರ ಪರಿವರ್ತನೆ";
  const timeline = cls?.reliefTimelineKn || "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ";
  const gem = data.prescriptions.gemstoneRing.primaryGemstoneKn;
  const rudra = data.prescriptions.rudraksha.nameKn;

  // 1. Kannada (Original authoritative pure voice)
  if (lang === "kn") {
    return [
      sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${devotee.name}, ನಾನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದೆ. ನೀವು ${devotee.lagnaName} ಲಗ್ನ ಹಾಗೂ ${devotee.rashiName} ರಾಶಿಯ ${devotee.nakshatraName} ನಕ್ಷತ್ರ ಪಾದ ${devotee.pada} ರಲ್ಲಿ ಜನಿಸಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ${cls?.headlineKn || "ಒತ್ತಡದ ಪರಿವರ್ತನೆ"} ಪ್ರಧಾನವಾಗಿದ್ದು, ಬಾಹ್ಯವಾಗಿ ${cls?.externalLifeRealityKn || "ಜೀವನದ ಪ್ರಮುಖ ಜವಾಬ್ದಾರಿಗಳು"} ಎದುರಾಗಿವೆ. ಇದರೊಂದಿಗೆ ಆಂತರಿಕವಾಗಿ ${cls?.internalMindsetKn || "ಮನಸ್ಸಿನಲ್ಲಿ ಆತಂಕದ ನೆರಳು"} ಕಾಡುತ್ತಿದೆ. ಇದಕ್ಕೆ ಕಾರಣ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪ್ರಸ್ತುತ ${dasha} ಹಾಗೂ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಂಚಾರ (${gochara}) ಆಗಿದೆ.`),
      sanitizeAstrologyKannadaText(`ನಿಮ್ಮ ಜಾತಕದ ಕರ್ಮ ಸ್ಥಾನ (10ನೇ ಭಾವ) ಹಾಗೂ ಅಮಾತ್ಯಕಾರಕ ಗ್ರಹದ ಬಲವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನೀವು ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ ಪ್ರಮುಖ ರಂಗ: ${prof?.titleKn || "ವೃತ್ತಿಪರ ನಾಯಕತ್ವ ರಂಗ"}. ವಿಶೇಷವಾಗಿ ${prof?.topSuitableFields ? prof.topSuitableFields.slice(0, 3).map((f: any) => f.fieldNameKn).join(", ") : "ಆಡಳಿತ ಹಾಗೂ ವಾಣಿಜ್ಯ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ"} ನೀವು ಗರಿಷ್ಠ ಯಶಸ್ಸು ಮತ್ತು ಮನ್ನಣೆಯನ್ನು ಗಳಿಸುವ ಮಹೋನ್ನತ ಯೋಗವನ್ನು ಹೊಂದಿದ್ದೀರಿ. ನಿಮ್ಮ ನಾಯಕತ್ವ ಹಾಗೂ ಬುದ್ಧಿಮತ್ತೆಯು ಈ ಕರ್ಮ ಯೋಗಗಳನ್ನು ಸಾರ್ಥಕಗೊಳಿಸುತ್ತದೆ.`),
      sanitizeAstrologyKannadaText(`ಆದರೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಕಾಡುತ್ತಿರುವ ಈ ಆತಂಕ ಶಾಶ್ವತವಲ್ಲ. ಗೋಚಾರ ಗ್ರಹಗಳ ಪರಿವರ್ತನೆಯಿಂದಾಗಿ ${timeline} ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಮಹತ್ತರವಾದ ಧನಾತ್ಮಕ ತಿರುವು (Turning Point) ಆರಂಭವಾಗಲಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ 4ನೇ ಮತ್ತು 5ನೇ ಭಾವಗಳಿಗೆ ದೈವಿಕ ಬಲ ಲಭಿಸುತ್ತಿದ್ದು, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯು ಪುನಃ ಪ್ರತಿಷ್ಠಾಪನೆಗೊಳ್ಳಲಿದೆ.`),
      sanitizeAstrologyKannadaText(`ಈ ಶುಭ ಕಾಲವನ್ನು ಶೀಘ್ರವಾಗಿ ಆಕರ್ಷಿಸಲು ಪವಿತ್ರ ${rudra} ಧಾರಣೆ ಹಾಗೂ ${gem} ರತ್ನವನ್ನು ಧರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಇದರೊಂದಿಗೆ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಾನದಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂರ್ವಕ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ ದೈವಾನುಗ್ರಹ ಪಡೆಯಿರಿ. ಶ್ರೀ ಪರಮೇಶ್ವರನ ದಿವ್ಯ ಕೃಪೆಯಿಂದ ಸಕಲ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ಸರ್ವತೋಮುಖ ಯಶಸ್ಸು ಲಭಿಸಲಿ.`)
    ];
  }

  // 2. English
  if (lang === "en") {
    const lagnaEn = getRashiName(devotee.lagnaName, "en");
    const rashiEn = getRashiName(devotee.rashiName, "en");
    const nakEn = getNakshatraName(devotee.nakshatraName, "en");
    const profEn = prof?.titleEn || "Leadership & Strategic Management";
    const topFieldsEn = prof?.topSuitableFields ? prof.topSuitableFields.slice(0, 3).map((f: any) => f.fieldNameEn).join(", ") : "Administration, Corporate Strategy & Technology";
    const timelineEn = cls?.reliefTimelineEn || "within the upcoming 3 to 6 months";
    const dashaEn = data.currentDiagnosis.dashaTiming?.timelineEn || dasha;

    return [
      `Namaskaram ${devotee.name}, upon a profound Vedic examination of your birth chart, born under ${lagnaEn} Ascendant and ${rashiEn} Moon sign in ${nakEn} Nakshatra (Pada ${devotee.pada}), your current life reveals pivotal transformation. Externally, you are navigating substantial responsibilities and real-world duties (${cls?.externalLifeRealityEn || "complex professional and family challenges"}), while internally experiencing subtle psychological pressure (${cls?.internalMindsetEn || "mental restlessness and introspection"}). This stems directly from your active planetary Dasha cycle (${dashaEn}) and transit dynamics.`,
      `Astrologically analyzing your 10th House of Karma and Amatyakaraka disposition, your prime destined vocation where you are created to excel is ${profEn}. You possess remarkable innate aptitude for ${topFieldsEn}. Supported by classical career yogas and intellectual acuity, your natural leadership and analytical discernment will ensure sustained recognition and material elevation.`,
      `This transitional pressure is temporary. The planetary movements indicate a profound positive turning point unfolding ${timelineEn}. As the transit forces align with your 4th and 5th house auspicious benefic aspects, mental tranquility, clarity of focus, and financial resilience will be restored.`,
      `To accelerate this auspicious breakthrough, the sacred ${data.prescriptions.rudraksha.nameEn || "Rudraksha"} along with the prescribed ${data.prescriptions.gemstoneRing.primaryGemstoneEn || "Gemstone Ring"} is strongly advised. Commencing sacred prayers dedicated to Lord Mahabaleshwara at Sri Gokarna Kshetra will dismantle all planetary impediments, bestowing long-term prosperity, health, and peace.`
    ];
  }

  // 3. Hindi (हिन्दी)
  if (lang === "hi") {
    const lagnaHi = getRashiName(devotee.lagnaName, "hi");
    const rashiHi = getRashiName(devotee.rashiName, "hi");
    const nakHi = getNakshatraName(devotee.nakshatraName, "hi");

    return [
      `सादर नमस्कार ${devotee.name}, आपकी जन्म कुंडली के सूक्ष्म वैदिक विश्लेषण के अनुसार, आपका जन्म ${lagnaHi} लग्न तथा ${rashiHi} राशि के ${nakHi} नक्षत्र (चरण ${devotee.pada}) में हुआ है। वर्तमान समय में आप जीवन के एक अत्यंत महत्वपूर्ण पड़ाव से गुजर रहे हैं, जहाँ बाह्य रूप से महत्वपूर्ण उत्तरदायित्व एवं चुनौतियाँ सामने हैं, तथा आंतरिक रूप से मानसिक बेचैनी व भविष्य की चिंता का प्रभाव देखा जा रहा है। यह स्थिति आपकी वर्तमान महादशा और गोचर ग्रहों के प्रभाव से निर्मित हुई है।`,
      `आपकी कुंडली के कर्म भाव (दशम भाव) तथा अमात्यकारक ग्रह की स्थिति दर्शाती है कि आपकी वास्तविक सफलता का प्रमुख क्षेत्र नेतृत्व, प्रबंधन एवं बौद्धिक कार्यप्रणाली है। विशेष रूप से प्रशासनिक, वित्तीय तथा रणनीतिक क्षेत्रों में आप सर्वोच्च उन्नति व प्रतिष्ठा प्राप्त करने के प्रबल राजयोग रखते हैं। आपकी स्वाभाविक बुद्धिमत्ता इन योगों को पूर्ण रूप से फलित करेगी।`,
      `यह वर्तमान संघर्ष स्थायी नहीं है। ग्रहों के अनुकूल परिवर्तन के प्रभाव से आगामी ३ से ६ महीनों के भीतर आपके जीवन में एक स्पष्ट एवं सकारात्मक मोड़ (Turning Point) प्रारंभ होगा। कुंडली के चतुर्थ व पंचम भाव में शुभ ऊर्जा के संचार से मानसिक शांति एवं आर्थिक समृद्धि पुनः स्थापित होगी।`,
      `इस शुभ फल की शीघ्र प्राप्ति हेतु निर्धारित पवित्र रुद्राक्ष तथा शुभ रत्न की अंगूठी धारण करना अत्यंत कल्याणकारी रहेगा। इसके साथ ही श्री गोकर्ण महाबलेश्वर महादेव के पावन सन्निधान में विशेष पूजन व संकल्प करवाएं। भगवान शिव की कृपा से आपके सभी विघ्न दूर होकर आपको सर्वतोमुखी सफलता प्राप्त हो।`
    ];
  }

  // 4. Telugu (తెలుగు)
  if (lang === "te") {
    const lagnaTe = getRashiName(devotee.lagnaName, "te");
    const rashiTe = getRashiName(devotee.rashiName, "te");
    const nakTe = getNakshatraName(devotee.nakshatraName, "te");

    return [
      `నమస్కారం ${devotee.name} గారు, మీ జన్మ కుండలిని నిశితంగా పరిశీలించినప్పుడు, మీరు ${lagnaTe} లగ్నం మరియు ${rashiTe} రాశిలోని ${nakTe} నక్షత్రం (పాదం ${devotee.pada}) లో జన్మించారు. ప్రస్తుతం మీ జీవితంలో బాహ్యంగా ముఖ్యమైన బాధ్యతలు మరియు సవాళ్లు ఎదురవుతుండగా, అంతరంగంలో మానసిక ఆందోళన మరియు భవిష్యత్తు గురించిన ఆలోచనలు కొనసాగుతున్నాయి. ఇది ప్రస్తుత గ్రహ దశాకాలం మరియు గోచార గ్రహ స్థితుల ప్రభావం వల్ల ఏర్పడింది.`,
      `మీ కుండలిలోని దశమ భావం (కర్మ స్థానం) మరియు అమాత్యకారక గ్రహ బలాన్ని బట్టి, మీరు అత్యున్నత స్థాయికి ఎదిగే ప్రధాన రంగం: నాయకత్వం, పరిపాలన మరియు వ్యూహాత్మక వ్యాపార రంగాలు. ప్రత్యేకించి మేధోపరమైన విశ్లేషణ, ఆర్థిక మరియు సాంకేతిక రంగాలలో మీరు విశేష కీర్తి ప్రతిష్టలు మరియు విజయాన్ని సాధించే అద్భుతమైన యోగాలు ఉన్నాయి.`,
      `ఈ తాత్కాలిక సమస్యలు శాశ్వతం కావు. గ్రహాల అనుకూల గోచారం వల్ల రాబోయే 3 నుండి 6 నెలల్లో మీ జీవితంలో స్పష్టమైన శుభ పరివర్తన మరియు ఊరట లభిస్తుంది. 4వ మరియు 5వ స్థానాల అనుగ్రహంతో మనశ్శాంతి మరియు ఆర్థిక స్థిరత్వం పునఃస్థాపితమవుతాయి.`,
      `ఈ శుభ కాలాన్ని మరింత వేగవంతం చేసుకోవడానికి నిర్దేశిత పవిత్ర రుద్రాక్ష మరియు శుభ రత్న ధారణ శ్రేయస్కరం. అలాగే శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో సంకల్ప పూర్వక పూజలు జరిపించి దివ్యానుగ్రహం పొందండి. పరమేశ్వరుని కృపతో సమస్త ఆటంకాలు తొలగి సంపూర్ణ విజయం కలగాలని ఆశీర్వదిస్తున్నాము.`
    ];
  }

  // 5. Tamil (தமிழ்)
  if (lang === "ta") {
    const lagnaTa = getRashiName(devotee.lagnaName, "ta");
    const rashiTa = getRashiName(devotee.rashiName, "ta");
    const nakTa = getNakshatraName(devotee.nakshatraName, "ta");

    return [
      `வணக்கம் ${devotee.name}, தங்களின் ஜாதகத்தை வேத முறைப்படி ஆழமாக ஆராய்ந்ததில், தாங்கள் ${lagnaTa} லக்னம் மற்றும் ${rashiTa} ராசியில் ${nakTa} நட்சத்திரம் (பாதம் ${devotee.pada}) இல் பிறந்துள்ளீர்கள். தற்போது உங்கள் வாழ்க்கையில் வெளிப்புறத்தில் முக்கியமான பொறுப்புகளும், மனதிற்குள் நுட்பமான அழுத்தங்களும் நிலவி வருகின்றன. இது தற்போது நடைபெறும் தசா-புக்தி மற்றும் கோச்சார கிரகங்களின் தாக்கத்தால் ஏற்பட்டுள்ளது.`,
      `தங்களின் 10-ஆம் வீடான கர்ம ஸ்தானம் மற்றும் அமாத்யகாரக கிரகத்தின் நிலையை பார்க்கும்போது, தாங்கள் நிர்வாகம், தலைமைத்துவம் மற்றும் அறிவுசார்ந்த துறைகளில் மகத்தான வெற்றி பெறும் உன்னத யோகத்தைப் பெற்றுள்ளீர்கள். குறிப்பாக தொழில் மற்றும் வணிகத் துறைகளில் தாங்கள் பெரும் நன்மதிப்பையும் வெற்றியையும் பெறுவீர்கள்.`,
      `இந்த தற்காலிக சிரமங்கள் விரைவில் விலகும். கிரகங்களின் சுப மாற்றத்தினால் அடுத்து வரும் 3 முதல் 6 மாதங்களில் தங்களின் வாழ்வில் ஒரு முக்கிய திருப்புமுனை (Turning Point) உருவாகும். மன அமைதியும், குடும்ப நல்வாழ்வும், பொருளாதார ஸ்திரத்தன்மையும் மீண்டும் பரிபூரணமாக ஏற்படும்.`,
      `இந்த நற்பலன்களை விரைவாகப் பெற உரிய ருத்ராட்சம் மற்றும் ராசிக் கல் அணிவது சிறந்தது. மேலும் ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானத்தில் சங்கல்ப பூஜை செய்து சிவனருள் பெறவும். எல்லாம் வல்ல ஈசனின் திருவருளால் அனைத்து தடைகளும் நீங்கி சகல சௌபாக்கியங்களும் பெருகட்டும்.`
    ];
  }

  // 6. Malayalam (മലയാളം)
  const lagnaMl = getRashiName(devotee.lagnaName, "ml");
  const rashiMl = getRashiName(devotee.rashiName, "ml");
  const nakMl = getNakshatraName(devotee.nakshatraName, "ml");

  return [
    `നമസ്കാരം ${devotee.name}, താങ്കളുടെ ജന്മകുണ്ഡലി സൂക്ഷ്മമായി പരിശോധിച്ചതിൽ, ${lagnaMl} ലഗ്നത്തിലും ${rashiMl} രാശിയിലെ ${nakMl} നക്ഷത്രത്തിലും (പാദം ${devotee.pada}) ജനിച്ച താങ്കൾ ഇപ്പോൾ നിർണ്ണായകമായ ഒരു ജീവിത ഘട്ടത്തിലൂടെയാണ് കടന്നുപോകുന്നത്. ബാഹ്യമായി പ്രധാന ഉത്തരവാദിത്തങ്ങളും വെല്ലുവിളികളും നേരിടുമ്പോൾ, ആന്തരികമായി മനസ്സിന് അസ്വസ്ഥതയും ഉത്കണ്ഠയും അനുഭവപ്പെടുന്നു. ഇത് നിലവിലെ ഗ്രഹദശാ ചക്രത്തിന്റെയും ഗോചാര ഫലങ്ങളുടെയും സ്വാധീനത്താലാണ്.`,
    `താങ്കളുടെ കർമ്മ ഭാവവും (10-ാം ഭാവം) അമാത്യകാരക ഗ്രഹബലവും വ്യക്തമാക്കുന്നത്, താങ്കൾക്ക് ഏറ്റവും ഉചിതമായ മേഖല നേതൃത്വവും ഭരണനിർവ്വഹണവുമാണ്. ബൗദ്ധികമായ തന്ത്രങ്ങൾ, വാണിജ്യം, ധനകാര്യം എന്നിവയിൽ വലിയ വിജയവും അംഗീകാരവും നേടാനുള്ള അപൂർവ്വ കർമ്മയോഗങ്ങൾ താങ്കളുടെ കുണ്ഡലിയിലുണ്ട്.`,
    `ഈ പ്രതിസന്ധി ശാശ്വതമല്ല. ഗ്രഹങ്ങളുടെ അനുകൂല മാറ്റങ്ങൾ വഴി അടുത്ത 3 മുതൽ 6 മാസങ്ങൾക്കുള്ളിൽ താങ്കളുടെ ജീവിതത്തിൽ സുവർണ്ണമായ ഒരു വഴിത്തിരിവ് (Turning Point) ആരംഭിക്കും. മനഃസമാധാനവും സാമ്പത്തിക ഭദ്രതയും വീണ്ടും കൈവരിക്കാൻ സാധിക്കും.`,
    `ഈ ശുഭകാലത്തെ കൂടുതൽ പ്രയോജനപ്പെടുത്തുന്നതിനായി നിർദ്ദേശിച്ച പവിത്ര രുദ്രാക്ഷവും രത്നവും ധരിക്കുന്നത് ഉത്തമമാണ്. കൂടാതെ ശ്രീ ഗോകർണ മഹാബലേശ്വര സന്നിധാനത്തിൽ വിശേഷാൽ സങ്കൽപ്പ പൂജകൾ നടത്തി ദർശനം നേടുക. സർവ്വേശ്വരനായ ശ്രീ മഹാദേവന്റെ ദിവ്യാനുഗ്രഹത്താൽ സർവ്വ തടസ്സങ്ങളും നീങ്ങി സമഗ്ര വിജയം കൈവരട്ടെ.`
  ];
}
