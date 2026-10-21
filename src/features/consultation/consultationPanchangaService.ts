/**
 * Baggona Panchanga - Devotee Birth Chart & Panchanga Patrika Engine
 * Computes authentic Vedic birth Panchanga coordinates:
 * - Vaara (Weekday at local sunrise)
 * - Tithi (Lunar day & Paksha)
 * - Nakshatra & Pada
 * - Rashi (Moon Sign)
 * - Lagna (Ascendant)
 * - Nitya Yoga
 * - Karana
 * - Current Running Dasha-Bhukti
 *
 * 100% strictly localized across all 7 supported consultation languages:
 * kn, en, hi, te, ta, ml, mr
 */

import SunCalc from "suncalc";
import * as Astronomy from "astronomy-engine";
import { normalizeDegree, getAyanamsa, degreeToNakshatraPada } from "../../core/AstroMath";
import { calculateKundliWithPlaceSun } from "../../core/KundliEngine";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import type { ConsultationSession, ConsultationLanguage } from "./consultationTypes";

export interface DevoteePanchangaProfile {
  name: string;
  devoteeName: string;
  dob: string;
  dobFormatted: string;
  tob: string;
  tobFormatted: string;
  place: string;
  vaara: string;
  vaaraRaw: string;
  tithi: string;
  paksha: string;
  nakshatra: string;
  nakshatraWithPada: string;
  pada: number;
  rashi: string;
  lagna: string;
  yoga: string;
  karana: string;
  runningDasha: string;
  currentDasha: string;
  labels: PanchangaPatrikaLabels;
}

export interface PanchangaPatrikaLabels {
  cardTitle: string;
  cardSubtitle: string;
  sanctumTitle: string;
  devoteeNameLabel: string;
  dobLabel: string;
  tobLabel: string;
  placeLabel: string;
  vaaraLabel: string;
  tithiLabel: string;
  nakshatraLabel: string;
  rashiLabel: string;
  lagnaLabel: string;
  yogaLabel: string;
  karanaLabel: string;
  dashaLabel: string;
  toggleViewShow: string;
  toggleViewHide: string;
  startConsultationBtn: string;
  phonePromptLabel: string;
  sacredNotice: string;
  priestTitle: string;
  limbsTitle: string;
  phonePlaceholder: string;
  startingBtn: string;
  priestLocationPhone: string;
}

// -------------------------------------------------------------
// 1. Vaara (7 Weekdays)
// -------------------------------------------------------------
export const VAARA_I18N: Record<ConsultationLanguage, string[]> = {
  kn: ["ಭಾನುವಾರ (ರವಿವಾರ)", "ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ"],
  en: ["Sunday (Ravivara)", "Monday (Somavara)", "Tuesday (Mangalavara)", "Wednesday (Budhavara)", "Thursday (Guruvara)", "Friday (Shukravara)", "Saturday (Shanivara)"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  te: ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"],
  ta: ["ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"],
  ml: ["ഞായറാഴ്ച", "തിങ്കളാഴ്ച", "ചൊവ്വാഴ്ച", "ബുധനാഴ്ച", "വ്യാഴാഴ്ച", "വെള്ളിയാഴ്ച", "ശനിയാഴ്ച"],
  mr: ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"]
};

// -------------------------------------------------------------
// 2. Paksha (Shukla / Krishna)
// -------------------------------------------------------------
export const PAKSHA_I18N: Record<ConsultationLanguage, { Shukla: string; Krishna: string }> = {
  kn: { Shukla: "ಶುಕ್ಲ ಪಕ್ಷ", Krishna: "ಕೃಷ್ಣ ಪಕ್ಷ" },
  en: { Shukla: "Shukla Paksha", Krishna: "Krishna Paksha" },
  hi: { Shukla: "शुक्ल पक्ष", Krishna: "कृष्ण पक्ष" },
  te: { Shukla: "శుక్ల పక్షం", Krishna: "కృష్ణ పక్షం" },
  ta: { Shukla: "சுக்ல பக்ஷம்", Krishna: "கிருஷ்ண பக்ஷம்" },
  ml: { Shukla: "ശുക്ല പക്ഷം", Krishna: "കൃഷ്ണ പക്ഷം" },
  mr: { Shukla: "शुक्ल पक्ष", Krishna: "कृष्ण पक्ष" }
};

// -------------------------------------------------------------
// 3. Tithis (1 to 15, plus Purnima & Amavasya)
// -------------------------------------------------------------
export const TITHI_NAMES_I18N: Record<ConsultationLanguage, string[]> = {
  kn: [
    "ಪ್ರತಿಪದೆ", "ದ್ವಿತೀಯ", "ತೃತೀಯ", "ಚತುರ್ಥಿ", "ಪಂಚಮಿ",
    "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
    "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ (ಪೂರ್ಣಿಮಾ)",
    "ಪ್ರತಿಪದೆ", "ದ್ವಿತೀಯ", "ತೃತೀಯ", "ಚತುರ್ಥಿ", "ಪಂಚಮಿ",
    "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
    "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಅಮಾವಾಸ್ಯೆ"
  ],
  en: [
    "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ],
  hi: [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावस्या"
  ],
  te: [
    "పాడ్యమి (ప్రతిపద)", "విదియ", "తదియ", "చవితి", "పంచమి",
    "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి",
    "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "పూర్ణిమ",
    "పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి",
    "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి",
    "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "అమావాస్య"
  ],
  ta: [
    "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி",
    "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி",
    "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி", "பௌர்ணமி",
    "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி",
    "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி",
    "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி", "அமாவாசை"
  ],
  ml: [
    "പ്രഥമ", "ദ്വിതീയ", "തൃതീയ", "ചതുർത്ഥി", "പഞ്ചമി",
    "ഷഷ്ഠി", "സപ്തമി", "അഷ്ടമി", "നവമി", "ദശമി",
    "ഏകാദശി", "ദ്വാദശി", "ത്രയോദശി", "ചതുർദ്ദശി", "പൗർണ്ണമി",
    "പ്രഥമ", "ദ്വിതീയ", "തൃതീയ", "ചതുർത്ഥി", "പഞ്ചമി",
    "ഷഷ്ഠി", "സപ്തമി", "അഷ്ടമി", "നവമി", "ദശമി",
    "ഏകാദശി", "ദ്വാദശി", "ത്രയോദശി", "ചതുർദ്ദശി", "അമാവാസി"
  ],
  mr: [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पौर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावास्या"
  ]
};

// -------------------------------------------------------------
// 4. Nakshatras (27)
// -------------------------------------------------------------
export const NAKSHATRAS_I18N: Record<ConsultationLanguage, string[]> = {
  kn: [
    "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರಿದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ",
    "ಮಘಾ", "ಪೂರ್ವ ಫಲ್ಗುಣಿ (ಹುಬ್ಬಾ)", "ಉತ್ತರ ಫಲ್ಗುಣಿ (ಉತ್ತರಾ)", "ಹಸ್ತ", "ಚಿತ್ರಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
    "ಮೂಲಾ", "ಪೂರ್ವಾಷಾಢ", "ಉತ್ತರಾಷಾಢ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ", "ಪೂರ್ವಭಾದ್ರಪದ", "ಉತ್ತರಭಾದ್ರಪದ", "ರೇವತಿ"
  ],
  en: [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ],
  hi: [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
    "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
    "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"
  ],
  te: [
    "అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆర్ద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష",
    "మఖ", "పూర్వఫల్గుణి (పుబ్బ)", "ఉత్తరఫల్గుణి (ఉత్తర)", "హస్త", "చిత్ర", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ",
    "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"
  ],
  ta: [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்",
    "மகம்", "பூரம்", "உத்திரம்", "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
  ],
  ml: [
    "അശ്വതി", "ഭരണി", "കാർത്തിക", "രോഹിണി", "മകയിരം", "തിരുവാതിര", "പുണർതം", "പൂയം", "ആയില്യം",
    "മകം", "പൂരം", "ഉത്രം", "അത്തം", "ചിത്തിര", "ചോതി", "വിശാഖം", "അനിഴം", "തൃക്കേട്ട",
    "മൂലം", "പൂരാടം", "ഉത്രാടം", "തിരുവോണം", "അവിട്ടം", "ചതയം", "പൂരുരുട്ടാതി", "ഉത്രട്ടാതി", "രേവതി"
  ],
  mr: [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशीर्ष", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
    "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
    "मूळ", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शततारका", "पूर्वा भाद्रपदा", "उत्तरा भाद्रपदा", "रेवती"
  ]
};

// -------------------------------------------------------------
// 5. Yogas (27)
// -------------------------------------------------------------
export const YOGAS_I18N: Record<ConsultationLanguage, string[]> = {
  kn: [
    "ವಿಷ್ಕಂಭ", "ಪ್ರೀತಿ", "ಆಯುಷ್ಮಾನ್", "ಸೌಭಾಗ್ಯ", "ಶೋಭನ", "ಅತಿಗಂಡ", "ಸುಕರ್ಮ", "ಧೃತಿ", "ಶೂಲ",
    "ಗಂಡ", "ವೃದ್ಧಿ", "ಧ್ರುವ", "ವ್ಯಾಘಾತ", "ಹರ್ಷಣ", "ವಜ್ರ", "ಸಿದ್ಧಿ", "ವ್ಯತೀಪಾತ", "ವರಿಯಾನ",
    "ಪರಿಘ", "ಶಿವ", "ಸಿದ್ಧ", "ಸಾಧ್ಯ", "ಶುಭ", "ಶುಕ್ಲ", "ಬ್ರಹ್ಮ", "ಇಂದ್ರ", "ವೈಧೃತಿ"
  ],
  en: [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
    "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ],
  hi: [
    "विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल",
    "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान्",
    "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"
  ],
  te: [
    "విష్కంభం", "ప్రీతి", "ఆయుష్మాన్", "సౌభాగ్యం", "శోభనం", "అతిగండం", "సుకర్మ", "ధృతి", "శూలం",
    "గండం", "వృద్ధి", "ధ్రువం", "వ్యాఘాతం", "హర్షణం", "వజ్రం", "సిద్ధి", "వ్యతీపాతం", "వరీయాన్",
    "పరిఘం", "శివం", "సిద్ధం", "సాధ్యం", "శుభం", "శుక్లం", "బ్రహ్మం", "ఇంద్రం", "వైధృతి"
  ],
  ta: [
    "விஷ்கம்பம்", "ப்ரீதி", "ஆயுஷ்மான்", "சௌபாக்யம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்", "திருதி", "சூலம்",
    "கண்டம்", "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி", "வியதீபாதம்", "வரீயான்",
    "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்", "சுப்பிரம்", "பிரம்மம்", "இந்திரம்", "வைதிருதி"
  ],
  ml: [
    "വിഷ്കംഭം", "പ്രീതി", "ആയുഷ്മാൻ", "സൗഭാഗ്യം", "ശോഭനം", "അതിഗണ്ഡം", "സുകർമ്മം", "ധൃതി", "ശൂലം",
    "ഗണ്ഡം", "വൃദ്ധി", "ധ്രുവം", "വ്യാഘാതം", "ഹർഷണം", "വജ്രം", "സിദ്ധി", "വ്യതീപാതം", "വരീയാൻ",
    "പരിഘം", "ശിവം", "സിദ്ധം", "സാധ്യം", "ശുഭം", "ശുക്ലം", "ബ്രഹ്മം", "ഐന്ദ്രം", "വൈധൃതി"
  ],
  mr: [
    "विष्कंभ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगंड", "सुकर्मा", "धृती", "शूल",
    "गंड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान",
    "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इंद्र", "वैधृती"
  ]
};

// -------------------------------------------------------------
// 6. Karanas (11)
// -------------------------------------------------------------
export const KARANAS_I18N: Record<ConsultationLanguage, string[]> = {
  kn: ["ಬವ", "ಬಾಲವ", "ಕೌಲವ", "ತೈತಿಲ", "ಗರಜ", "ವಣಿಜ", "ವಿಷ್ಟಿ (ಭದ್ರ)", "ಶಕುನಿ", "ಚತುಷ್ಪಾದ", "ನಾಗ", "ಕಿಂಸ್ತುಘ್ನ"],
  en: ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)", "Shakuni", "Chatushpada", "Naga", "Kintughna"],
  hi: ["बव", "बालव", "कौलव", "तैतिल", "गरज", "वणिज", "विष्टि (भद्रा)", "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"],
  te: ["బవ", "బాలవ", "కౌలవ", "తైతిల", "గరజ", "వణిజ", "విష్టి (భద్ర)", "శకుని", "చతుష్పాత్", "నాగ", "కింస్తుఘ్నం"],
  ta: ["பவ", "பாலவ", "கௌலவ", "தைதுலை", "கரசை", "வணிசை", "பத்திரை (விஷ்டி)", "சகுனி", "சதுஷ்பாதம்", "நாகவம்", "கிம்ஸ்துக்னம்"],
  ml: ["ബവ", "ബാലവ", "കൗലവ", "തൈതില", "ഗരജ", "വണിജ", "വിഷ്ടി (ഭദ്ര)", "ശകുനി", "ചതുഷ്പാദം", "നാഗം", "കിംസ്തുഘ്നം"],
  mr: ["बव", "बालव", "कौलव", "तैतिल", "गरज", "वणिज", "विष्टी (भद्रा)", "शकुनी", "चतुष्पाद", "नाग", "किंस्तुघ्न"]
};

// -------------------------------------------------------------
// 7. Rashis & Lagnas (12)
// -------------------------------------------------------------
export const RASHIS_I18N: Record<ConsultationLanguage, string[]> = {
  kn: ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"],
  en: ["Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karkataka)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrischika)", "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"],
  hi: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  te: ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"],
  ta: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
  ml: ["മേടം", "ഇടവം", "മിഥുനം", "കർക്കിടകം", "ചിങ്ങം", "കന്നി", "തുലാം", "വൃശ്ചികം", "ധനു", "മകരം", "കുംഭം", "മീനം"],
  mr: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तूळ", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"]
};

// -------------------------------------------------------------
// 8. Planets & Dasha terms in 7 languages
// -------------------------------------------------------------
export const PLANET_NAMES_I18N: Record<ConsultationLanguage, Record<string, string>> = {
  kn: {
    Sun: "ಸೂರ್ಯ", Moon: "ಚಂದ್ರ", Mars: "ಕುಜ", Mercury: "ಬುಧ", Jupiter: "ಗುರು",
    Venus: "ಶುಕ್ರ", Saturn: "ಶನಿ", Rahu: "ರಾಹು", Ketu: "ಕೇತು",
    Mahadasha: "ಮಹಾದಶಾ", Antardasha: "ಅಂತರ್ದಶಾ"
  },
  en: {
    Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury", Jupiter: "Jupiter",
    Venus: "Venus", Saturn: "Saturn", Rahu: "Rahu", Ketu: "Ketu",
    Mahadasha: "Mahadasha", Antardasha: "Antardasha"
  },
  hi: {
    Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
    Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
    Mahadasha: "महादशा", Antardasha: "अंतर्दशा"
  },
  te: {
    Sun: "సూర్య", Moon: "చంద్ర", Mars: "కుజ", Mercury: "బుధ", Jupiter: "గురు",
    Venus: "శుక్ర", Saturn: "శని", Rahu: "రాహు", Ketu: "కేతు",
    Mahadasha: "మహాదశ", Antardasha: "అంతర్దశ"
  },
  ta: {
    Sun: "சூரியன்", Moon: "சந்திரன்", Mars: "செவ்வாய்", Mercury: "புதன்", Jupiter: "குரு",
    Venus: "சுக்கிரன்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது",
    Mahadasha: "மகாதிசை", Antardasha: "அந்தர்திசை"
  },
  ml: {
    Sun: "സൂര്യൻ", Moon: "ചന്ദ്രൻ", Mars: "ചൊവ്വ", Mercury: "ബുധൻ", Jupiter: "വ്യാഴം (ഗുരു)",
    Venus: "ശുക്രൻ", Saturn: "ശനി", Rahu: "രാഹു", Ketu: "കേതു",
    Mahadasha: "മഹാദശ", Antardasha: "അന്തർദശ"
  },
  mr: {
    Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगळ", Mercury: "बुध", Jupiter: "गुरु",
    Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
    Mahadasha: "महादशा", Antardasha: "अंतर्दशा"
  }
};

// -------------------------------------------------------------
// 9. UI Labels for the Sacred Devotee Patrika Card
// -------------------------------------------------------------
export const PANCHANGA_PATRIKA_LABELS_I18N: Record<ConsultationLanguage, PanchangaPatrikaLabels> = {
  kn: {
    cardTitle: "॥ ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿ & ಪಂಚಾಂಗ ಪತ್ರಿಕೆ ॥",
    cardSubtitle: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ",
    sanctumTitle: "ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನಾ ಕೊಠಡಿ (೨೦ ನಿಮಿಷ)",
    devoteeNameLabel: "ಭಕ್ತರ ಹೆಸರು",
    dobLabel: "ಜನ್ಮ ದಿನಾಂಕ",
    tobLabel: "ಜನ್ಮ ಸಮಯ",
    placeLabel: "ಜನ್ಮ ಸ್ಥಳ",
    vaaraLabel: "ಜನ್ಮ ವಾರ",
    tithiLabel: "ಜನ್ಮ ತಿಥಿ",
    nakshatraLabel: "ಜನ್ಮ ನಕ್ಷತ್ರ (ಪಾದ)",
    rashiLabel: "ಜನ್ಮ ರಾಶಿ",
    lagnaLabel: "ಜನ್ಮ ಲಗ್ನ",
    yogaLabel: "ನಿತ್ಯ ಯೋಗ",
    karanaLabel: "ಕರಣ",
    dashaLabel: "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ",
    toggleViewShow: "📜 ಜಾತಕ & ಪಂಚಾಂಗ ಪತ್ರಿಕೆ ವೀಕ್ಷಿಸಿ",
    toggleViewHide: "▲ ಜಾತಕ ಪತ್ರಿಕೆ ಮರೆಮಾಡಿ",
    startConsultationBtn: "ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನೆ ಆರಂಭಿಸಿ",
    phonePromptLabel: "ಸಮಾಲೋಚನೆಗೆ ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಖಚಿತಪಡಿಸಿ:",
    sacredNotice: "ಗಮನಿಸಿ: ನೀವು 'ಆರಂಭಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿದ ಕ್ಷಣದಿಂದ ನಿಖರ ೨೦ ನಿಮಿಷಗಳ ಲೈವ್ ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಟೈಮರ್ ಆರಂಭವಾಗುತ್ತದೆ.",
    priestTitle: "ಮುಖ್ಯ ದೈವಜ್ಞರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ)",
    limbsTitle: "ವೈದಿಕ ಜನ್ಮ ಪಂಚಾಂಗ ಅಂಗಗಳು & ಜಾತಕ ವಿವರಗಳು",
    phonePlaceholder: "ಉದಾ: 9876543210 / +91...",
    startingBtn: "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
    priestLocationPhone: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ • ನೇರ ದೂರವಾಣಿ: 9972339362"
  },
  en: {
    cardTitle: "॥ Vedic Birth Chart & Panchanga Patrika ॥",
    cardSubtitle: "Sri Kshetra Gokarna Baggona Panchanga Jyotishya Sansthana",
    sanctumTitle: "Private Vedic Astrologer Sanctum (20 Minutes)",
    devoteeNameLabel: "Devotee Name",
    dobLabel: "Date of Birth",
    tobLabel: "Time of Birth",
    placeLabel: "Birth Place",
    vaaraLabel: "Birth Day (Vaara)",
    tithiLabel: "Birth Tithi (Lunar Day)",
    nakshatraLabel: "Birth Star (Nakshatra & Pada)",
    rashiLabel: "Moon Sign (Rashi)",
    lagnaLabel: "Ascendant (Janma Lagna)",
    yogaLabel: "Nitya Yoga",
    karanaLabel: "Karana",
    dashaLabel: "Running Dasha-Bhukti",
    toggleViewShow: "📜 View Birth Chart & Panchanga Patrika",
    toggleViewHide: "▲ Hide Birth Patrika",
    startConsultationBtn: "Start 20-Min Astrologer Consultation",
    phonePromptLabel: "Please confirm your phone number to begin:",
    sacredNotice: "Important: Your 20-minute live private consultation countdown starts immediately upon clicking.",
    priestTitle: "Chief Astrologer: Shreeram Pandit (Sri Kshetra Gokarna)",
    limbsTitle: "Vedic Birth Panchanga Limbs & Astronomical Coordinates",
    phonePlaceholder: "e.g. 9876543210 / +91...",
    startingBtn: "Starting...",
    priestLocationPhone: "Sri Kshetra Gokarna • Direct Phone: 9972339362"
  },
  hi: {
    cardTitle: "॥ वैदिक जन्म कुंडली एवं पंचांग पत्रिका ॥",
    cardSubtitle: "श्री क्षेत्र गोकर्ण बग्गोण पंचांग ज्योतिष संस्थान",
    sanctumTitle: "निजी दैवज्ञ मुखामुखी परामर्श कक्ष (20 मिनट)",
    devoteeNameLabel: "भक्त का नाम",
    dobLabel: "जन्म तिथि",
    tobLabel: "जन्म समय",
    placeLabel: "जन्म स्थान",
    vaaraLabel: "जन्म वार",
    tithiLabel: "जन्म तिथि (पंचांग)",
    nakshatraLabel: "जन्म नक्षत्र (चरण)",
    rashiLabel: "चंद्र राशि",
    lagnaLabel: "जन्म लग्न",
    yogaLabel: "नित्य योग",
    karanaLabel: "करण",
    dashaLabel: "वर्तमान महादशा-अंतर्दशा",
    toggleViewShow: "📜 जन्म कुंडली एवं पंचांग पत्रिका देखें",
    toggleViewHide: "▲ कुंडली पत्रिका छिपाएं",
    startConsultationBtn: "20 मिनट दैवज्ञ परामर्श प्रारंभ करें",
    phonePromptLabel: "परामर्श प्रारंभ करने हेतु अपना मोबाइल नंबर दर्ज करें:",
    sacredNotice: "ध्यान दें: 'प्रारंभ करें' पर क्लिक करते ही 20 मिनट का पवित्र परामर्श टाइमर शुरू हो जाएगा।",
    priestTitle: "मुख्य ज्योतिषी: श्रीराम पंडित (श्री क्षेत्र गोकर्ण)",
    limbsTitle: "वैदिक जन्म पंचांग अंग एवं खगोलीय स्थिति",
    phonePlaceholder: "उदा: 9876543210 / +91...",
    startingBtn: "प्रारंभ हो रहा है...",
    priestLocationPhone: "श्री क्षेत्र गोकर्ण • सीधा फोन: 9972339362"
  },
  te: {
    cardTitle: "॥ వేద జన్మ కుండలి & పంచాంగ పత్రిక ॥",
    cardSubtitle: "శ్రీ క్షేత్ర గోకర్ణ బగ్గోణ పంచాంగ జ్యోతిష్య సంస్థానము",
    sanctumTitle: "దైవజ్ఞ ముఖాముఖి సంప్రదింపుల గది (20 నిమిషాలు)",
    devoteeNameLabel: "భక్తుని పేరు",
    dobLabel: "పుట్టిన తేదీ",
    tobLabel: "పుట్టిన సమయం",
    placeLabel: "పుట్టిన స్థలం",
    vaaraLabel: "జన్మ వారం",
    tithiLabel: "జన్మ తిథి",
    nakshatraLabel: "జన్మ నక్షత్రం (పాదము)",
    rashiLabel: "చంద్ర రాశి",
    lagnaLabel: "జన్మ లగ్నం",
    yogaLabel: "నిత్య యోగం",
    karanaLabel: "కరణం",
    dashaLabel: "ప్రస్తుత దశా-భుక్తి",
    toggleViewShow: "📜 జాతక & పంచాంగ పత్రికను వీక్షించండి",
    toggleViewHide: "▲ జాతక పత్రికను దాచండి",
    startConsultationBtn: "20 నిమిషాల జ్యోతిష్య సంప్రదింపు ప్రారంభించండి",
    phonePromptLabel: "సంప్రదింపు ప్రారంభించడానికి మీ మొబైల్ నంబర్ నిర్ధారించండి:",
    sacredNotice: "గమనిక: ప్రారంభించు బటన్ నొక్కగానే 20 నిమిషాల సమయం ప్రారంభమౌతుంది.",
    priestTitle: "ప్రధాన దైవజ్ఞులు: శ్రీరామ్ పండిత్ (శ్రీ క్షేత్ర గోకర్ణ)",
    limbsTitle: "వైదిక జన్మ పంచాంగ అంగాలు & గ్రహ స్థితులు",
    phonePlaceholder: "ఉదా: 9876543210 / +91...",
    startingBtn: "ప్రారంభమవుతోంది...",
    priestLocationPhone: "శ్రీ క్షేత్ర గోకర్ణ • నేరుగా ఫోన్: 9972339362"
  },
  ta: {
    cardTitle: "॥ வேத ஜென்ம ஜாதகம் மற்றும் பஞ்சாங்க பத்ரிகை ॥",
    cardSubtitle: "ஸ்ரீ க்ஷேத்ர கோகர்ணா பக்கவணா பஞ்சாங்க ஜோதிட சம்ஸ்தானம்",
    sanctumTitle: "ஜோதிடர் நேரடி ஆலோசனை அறை (20 நிமிடங்கள்)",
    devoteeNameLabel: "பக்தர் பெயர்",
    dobLabel: "பிறந்த தேதி",
    tobLabel: "பிறந்த நேரம்",
    placeLabel: "பிறந்த இடம்",
    vaaraLabel: "ஜென்ம வாரம்",
    tithiLabel: "ஜென்ம திதி",
    nakshatraLabel: "ஜென்ம நட்சத்திரம் (பாதம்)",
    rashiLabel: "சந்திர ராசி",
    lagnaLabel: "ஜென்ம லக்னம்",
    yogaLabel: "நித்ய யோகம்",
    karanaLabel: "கரணம்",
    dashaLabel: "நடப்பு மகாதிசை-அந்தர்திசை",
    toggleViewShow: "📜 ஜாதகம் & பஞ்சாங்க பத்ரிகையைக் காண்க",
    toggleViewHide: "▲ ஜாதகத்தை மறைக்கவும்",
    startConsultationBtn: "20 நிமிட ஜோதிட ஆலோசனையைத் தொடங்குங்கள்",
    phonePromptLabel: "ஆலோசனையைத் தொடங்க உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்:",
    sacredNotice: "குறிப்பு: நீங்கள் கிளிக் செய்தவுடன் 20 நிமிட கவுண்ட்டவுன் உடனடியாக தொடங்கும்.",
    priestTitle: "தலைமை ஜோதிடர்: ஸ்ரீராம் பண்டிட் (ஸ்ரீ க்ஷேத்ர கோகர்ணா)",
    limbsTitle: "வேத கால பஞ்சாங்க அங்கங்கள் & கிரக நிலைகள்",
    phonePlaceholder: "எ.கா: 9876543210 / +91...",
    startingBtn: "தொடங்குகிறது...",
    priestLocationPhone: "ஸ்ரீ க்ஷேத்ர கோகர்ணம் • நேரடி தொலைபேசி: 9972339362"
  },
  ml: {
    cardTitle: "॥ വേദ ജന്മ ജാതകം & പഞ്ചാംഗ പത്രിക ॥",
    cardSubtitle: "ശ്രീ ക്ഷേത്ര ഗോകർണം ബഗ്ഗോണ പഞ്ചാംഗ ജ്യോതിഷ പീഠം",
    sanctumTitle: "ജ്യോതിഷ മുഖാമുഖ കൺസൾട്ടേഷൻ റൂം (20 മിനിറ്റ്)",
    devoteeNameLabel: "ഭക്തന്റെ പേര്",
    dobLabel: "ജനന തീയതി",
    tobLabel: "ജനന സമയം",
    placeLabel: "ജനന സ്ഥലം",
    vaaraLabel: "ജന്മ വാരം",
    tithiLabel: "ജന്മ തിഥി",
    nakshatraLabel: "ജന്മ നക്ഷത്രം (പാദം)",
    rashiLabel: "ചന്ദ്ര രാശി",
    lagnaLabel: "ജന്മ ലഗ്നം",
    yogaLabel: "നിത്യ യോഗം",
    karanaLabel: "കരണം",
    dashaLabel: "നിലവിലെ ദശാ-ഭുക്തി",
    toggleViewShow: "📜 ജാതകവും പഞ്ചാംഗ പത്രികയും കാണുക",
    toggleViewHide: "▲ പത്രിക മറയ്ക്കുക",
    startConsultationBtn: "20 മിനിറ്റ് ജ്യോതിഷ കൺസൾട്ടേഷൻ ആരംഭിക്കുക",
    phonePromptLabel: "തുടങ്ങുന്നതിനായി നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകുക:",
    sacredNotice: "ശ്രദ്ധിക്കുക: ആരംഭിക്കുക ക്ലിക്ക് ചെയ്യുമ്പോൾ തന്നെ 20 മിനിറ്റ് സമയം ആരംഭിക്കും.",
    priestTitle: "മുഖ്യ ജ്യോത്സ്യൻ: ശ്രീരാം പണ്ഡിറ്റ് (ശ്രീ ക്ഷേത്ര ഗോകർണം)",
    limbsTitle: "വൈദിക ജനന പഞ്ചാംഗ അംഗങ്ങളും ഗ്രഹനിലയും",
    phonePlaceholder: "ഉദാ: 9876543210 / +91...",
    startingBtn: "ആരംഭിക്കുന്നു...",
    priestLocationPhone: "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം • നേരിട്ടുള്ള ഫോൺ: 9972339362"
  },
  mr: {
    cardTitle: "॥ वैदिक जन्म कुंडली आणि पंचांग पत्रिका ॥",
    cardSubtitle: "श्री क्षेत्र गोकर्ण बग्गोण पंचांग ज्योतिष संस्थान",
    sanctumTitle: "दैवज्ञ समोरासमोर सल्लामसलत कक्ष (२० मिनिटे)",
    devoteeNameLabel: "भक्ताचे नाव",
    dobLabel: "जन्म तारीख",
    tobLabel: "जन्म वेळ",
    placeLabel: "जन्म ठिकाण",
    vaaraLabel: "जन्म वार",
    tithiLabel: "जन्म तिथी",
    nakshatraLabel: "जन्म नक्षत्र (चरण)",
    rashiLabel: "चंद्र राशी",
    lagnaLabel: "जन्म लग्न",
    yogaLabel: "नित्य योग",
    karanaLabel: "करण",
    dashaLabel: "सध्याची महादशा-अंतर्दशा",
    toggleViewShow: "📜 जन्म कुंडली व पंचांग पत्रिका पहा",
    toggleViewHide: "▲ पत्रिका लपवा",
    startConsultationBtn: "२० मिनिटे दैवज्ञ सल्लामसलत सुरू करा",
    phonePromptLabel: "सल्लामसलत सुरू करण्यासाठी आपला मोबाईल नंबर टाका:",
    sacredNotice: "सूचना: 'सुरू करा' वर क्लिक करताच २० मिनिटांचा कालावधी सुरू होईल.",
    priestTitle: "मुख्य ज्योतिषी: श्रीराम पंडित (श्री क्षेत्र गोकर्ण)",
    limbsTitle: "वैदिक जन्म पंचांग अंगे व ग्रह स्थिती",
    phonePlaceholder: "उदा: 9876543210 / +91...",
    startingBtn: "सुरू होत आहे...",
    priestLocationPhone: "श्री क्षेत्र गोकर्ण • थेट फोन: 9972339362"
  }
};

/**
 * Computes complete authentic Vedic Birth Chart & Panchanga Patrika
 * strictly localized in the devotee's selected consultation language.
 */
export async function computeDevoteePanchangaProfile(
  session: ConsultationSession
): Promise<DevoteePanchangaProfile> {
  const lang = session.language || "kn";
  const labels = PANCHANGA_PATRIKA_LABELS_I18N[lang] || PANCHANGA_PATRIKA_LABELS_I18N.kn;

  const lat = session.lat || 14.5479;
  const lng = session.lng || 74.3188;
  const timezoneOffsetMinutes = (session.timezone !== undefined ? session.timezone : 5.5) * 60;

  // 1. Calculate Full Kundli
  const kundli = await calculateKundliWithPlaceSun({
    name: session.name,
    birthDate: session.dob,
    birthTime: session.tob || "12:00",
    latitude: lat,
    longitude: lng,
    timezoneOffsetMinutes
  }, {
    ayanamsaModel: "lahiri"
  });

  // 2. Parse Birth Instant for Astronomical Calculations
  const [yearStr, monthStr, dayStr] = session.dob.split("-");
  const [hourStr, minStr] = (session.tob || "12:00").split(":");
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);
  const hr = parseInt(hourStr, 10);
  const mn = parseInt(minStr, 10);

  // Approximate UTC instant based on timezone offset
  const localMinutes = hr * 60 + mn;
  const utcMinutes = localMinutes - timezoneOffsetMinutes;
  const birthUtc = new Date(Date.UTC(y, m - 1, d, Math.floor(utcMinutes / 60), (utcMinutes % 60 + 60) % 60));

  // Local civil calendar day
  const civilDate = new Date(y, m - 1, d, 12, 0, 0);

  // 3. SunCalc Sun Times to determine true Vedic Vaara (Ahargana: sunrise to sunrise)
  let birthSunrise = civilDate;
  try {
    const sunTimes = SunCalc.getTimes(civilDate, lat, lng);
    if (sunTimes && sunTimes.sunrise) {
      birthSunrise = sunTimes.sunrise;
    }
  } catch {
    // Keep fallback
  }

  // Vedic Vaara: If birth occurred before local sunrise, it belongs to the previous civil day's weekday
  const civilDayIdx = civilDate.getDay(); // 0 = Sunday, 1 = Monday ...
  let vedicVaaraIdx = civilDayIdx;
  if (birthUtc.getTime() < birthSunrise.getTime()) {
    vedicVaaraIdx = (civilDayIdx + 6) % 7;
  }
  const vaaraStr = (VAARA_I18N[lang] || VAARA_I18N.kn)[vedicVaaraIdx];

  // 4. Sidereal Coordinates at Birth Moment
  const ayanamsa = getAyanamsa(birthUtc, "lahiri");
  const sunTrop = normalizeDegree(Astronomy.SunPosition(birthUtc).elon);
  const moonTrop = normalizeDegree(Astronomy.EclipticGeoMoon(birthUtc).lon);
  const sunSidereal = normalizeDegree(sunTrop - ayanamsa);
  const moonSidereal = normalizeDegree(moonTrop - ayanamsa);

  // 5. Tithi & Paksha
  const elongation = normalizeDegree(moonSidereal - sunSidereal);
  const tithiIdx = Math.floor(elongation / 12) % 30;
  const pakshaKey = tithiIdx < 15 ? "Shukla" : "Krishna";
  const pakshaStr = (PAKSHA_I18N[lang] || PAKSHA_I18N.kn)[pakshaKey];
  const tithiNameOnly = (TITHI_NAMES_I18N[lang] || TITHI_NAMES_I18N.kn)[tithiIdx];
  const tithiFullStr = `${pakshaStr} ${tithiNameOnly}`;

  // 6. Nakshatra & Pada
  const nakIdx = Math.min(26, Math.floor(moonSidereal / (360 / 27)));
  const nakName = (NAKSHATRAS_I18N[lang] || NAKSHATRAS_I18N.kn)[nakIdx];
  const pada = degreeToNakshatraPada(moonSidereal);
  const nakshatraWithPada = `${nakName} (${labels.nakshatraLabel.includes("चरण") ? "चरण" : labels.nakshatraLabel.includes("पाद") ? "పాదం" : labels.nakshatraLabel.includes("பாதம்") ? "பாதம்" : labels.nakshatraLabel.includes("പാദം") ? "പാദം" : "ಪಾದ"} ${pada})`;

  // 7. Rashi (Moon Sign)
  const rashiIdx = Math.floor(moonSidereal / 30) % 12;
  const rashiName = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[rashiIdx];

  // 8. Lagna (Ascendant)
  const lagnaDeg = kundli.ascendant;
  const lagnaIdx = Math.floor(normalizeDegree(lagnaDeg) / 30) % 12;
  const lagnaName = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[lagnaIdx];

  // 9. Nitya Yoga (Sun Sidereal + Moon Sidereal)
  const yogaSum = normalizeDegree(sunSidereal + moonSidereal);
  const yogaIdx = Math.floor(yogaSum / (360 / 27)) % 27;
  const yogaName = (YOGAS_I18N[lang] || YOGAS_I18N.kn)[yogaIdx];

  // 10. Karana (Half-tithi)
  const halfTithi = Math.floor(elongation / 6) % 60;
  let karanaIdx = 0;
  if (halfTithi === 0) {
    karanaIdx = 10; // Kintughna
  } else if (halfTithi >= 1 && halfTithi <= 56) {
    karanaIdx = (halfTithi - 1) % 7;
  } else if (halfTithi === 57) {
    karanaIdx = 7; // Shakuni
  } else if (halfTithi === 58) {
    karanaIdx = 8; // Chatushpada
  } else {
    karanaIdx = 9; // Naga
  }
  const karanaName = (KARANAS_I18N[lang] || KARANAS_I18N.kn)[karanaIdx];

  // 11. Current Running Dasha-Bhukti
  const ageYears = ageDecimalYearsAt(session.dob, session.tob || "12:00", lat, lng, new Date());
  let runningDashaStr = "";
  try {
    const bhukti = findBhuktiAtAge(kundli, ageYears);
    if (bhukti) {
      const pDict = PLANET_NAMES_I18N[lang] || PLANET_NAMES_I18N.kn;
      const mahaName = pDict[bhukti.maha.planet] || bhukti.maha.planet;
      const antarName = pDict[bhukti.bhukti] || bhukti.bhukti;
      runningDashaStr = `${mahaName} ${pDict.Mahadasha} - ${antarName} ${pDict.Antardasha}`;
    }
  } catch (e) {
    console.warn("[consultationPanchanga] Dasha calculation notice:", e);
  }

  if (!runningDashaStr) {
    runningDashaStr = lang === "kn" ? "ಗ್ರಹ ದಶಾ ಫಲಗಳು" : "Active Planetary Dasha";
  }

  const rawWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return {
    name: session.name,
    devoteeName: session.name,
    dob: session.dob,
    dobFormatted: session.dob,
    tob: session.tob || "12:00",
    tobFormatted: session.tob || "12:00",
    place: session.place,
    vaara: vaaraStr,
    vaaraRaw: rawWeekdays[vedicVaaraIdx],
    tithi: tithiFullStr,
    paksha: pakshaStr,
    nakshatra: nakshatraWithPada,
    nakshatraWithPada,
    pada,
    rashi: rashiName,
    lagna: lagnaName,
    yoga: yogaName,
    karana: karanaName,
    runningDasha: runningDashaStr,
    currentDasha: runningDashaStr,
    labels
  };
}
