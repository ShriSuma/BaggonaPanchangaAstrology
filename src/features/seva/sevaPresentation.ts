/**
 * Turns a computed RhythmDay into the words and colours the screen and the
 * printed sheets share. Kept apart from the engine so the numbers stay pure
 * and the wording stays in one place for all five languages.
 */

import type { RhythmDay } from "../../core/DailyRhythmEngine";
import type { TithiGroup } from "../../core/TaraBalaEngine";
import { getPriestProfile } from "./sevaPriestDirectory";
import {
  AMAVASYA_L5,
  BAND_GUIDE_L5,
  COLOUR_L5,
  DIRECTION_L5,
  GRAHA_L5,
  MONTH_L5,
  NAKSHATRA_L5,
  PAKSHA_L5,
  PURNIMA_L5,
  RASHI_L5,
  TARA_L5,
  TITHI_L5,
  WEEKDAY_L5,
  pick,
  type EnergyBand,
  type L5
} from "./sevaLocale";

/* ------------------------------------------------------------------ *
 * Colour system — one palette shared by the screen and the print sheets
 * ------------------------------------------------------------------ */

export type BandStyle = {
  /** Tailwind classes for a calendar cell. */
  cell: string;
  /** Tailwind classes for a small label chip. */
  chip: string;
  /** Solid hex used on the printed calendar, chosen to stay readable on paper. */
  printBg: string;
  printBorder: string;
  printText: string;
};

export const BAND_STYLE: Record<EnergyBand, BandStyle> = {
  high: {
    cell: "bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100",
    chip: "bg-emerald-100 text-emerald-900 border border-emerald-300",
    printBg: "#ECFDF5",
    printBorder: "#6EE7B7",
    printText: "#064E3B"
  },
  steady: {
    cell: "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100",
    chip: "bg-amber-100 text-amber-900 border border-amber-300",
    printBg: "#FFFBEB",
    printBorder: "#FCD34D",
    printText: "#78350F"
  },
  rest: {
    cell: "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200",
    chip: "bg-slate-200 text-slate-700 border border-slate-300",
    printBg: "#F1F5F9",
    printBorder: "#CBD5E1",
    printText: "#334155"
  }
};

/** Glyphs kept to plain Unicode so html2canvas renders them the same on paper. */
export const MARK = {
  money: "◆",
  pooja: "✦",
  janmaStar: "★",
  chandrashtama: "◑"
} as const;

/* ------------------------------------------------------------------ *
 * Dates and panchanga labels
 * ------------------------------------------------------------------ */

/** "12 August 2026" written in the active script. */
export const formatLongDate = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  const monthPhrase = MONTH_L5[day.monthIndex] || MONTH_L5[0];
  return `${day.dayOfMonth} ${pick(monthPhrase, lang)} ${day.year}`;
};

export const formatMonthTitle = (monthIndex: number, year: number, lang: string = "en"): string => {
  const monthPhrase = MONTH_L5[monthIndex] || MONTH_L5[0];
  return `${pick(monthPhrase, lang)} ${year}`;
};

export const weekdayName = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day || day.weekday === undefined) return "";
  const phrase = WEEKDAY_L5[day.weekday] || WEEKDAY_L5[0];
  return pick(phrase, lang);
};

/** Formats the Priest (Pandit) Name in the active language script. */
export function getLocalizedPanditName(rawPanditName?: string | null, lang: string = "en"): string {
  const p = (rawPanditName || "").trim();
  const profile = getPriestProfile(p);
  const l = (lang.startsWith("kn") ? "kn" : lang.startsWith("hi") ? "hi" : lang.startsWith("te") ? "te" : lang.startsWith("ta") ? "ta" : "en") as keyof typeof profile.name;
  return profile.name[l] || profile.name.en;
}

/** Full tithi label, e.g. "Shukla Paksha Panchami" or simply "Purnima". */
export const tithiLabel = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  if (day.isPurnima) return pick(PURNIMA_L5, lang);
  if (day.isAmavasya) return pick(AMAVASYA_L5, lang);
  const tithiIdx = Math.max(0, (day.tithiInPaksha || 1) - 1);
  const name = pick(TITHI_L5[tithiIdx] ?? TITHI_L5[0], lang);
  const pakshaPhrase = PAKSHA_L5[day.paksha || "shukla"] || PAKSHA_L5["shukla"];
  return `${pick(pakshaPhrase, lang)} ${name}`;
};

/** Tithi name only without Paksha, e.g. "Panchami", "Purnima", "Amavasya". */
export const tithiOnlyLabel = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  if (day.isPurnima) return pick(PURNIMA_L5, lang);
  if (day.isAmavasya) return pick(AMAVASYA_L5, lang);
  const tithiIdx = Math.max(0, (day.tithiInPaksha || 1) - 1);
  return pick(TITHI_L5[tithiIdx] ?? TITHI_L5[0], lang);
};

/** Paksha name only, e.g. "Shukla Paksha" or "Krishna Paksha". */
export const pakshaLabel = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  const pakshaPhrase = PAKSHA_L5[day.paksha || "shukla"] || PAKSHA_L5["shukla"];
  return pick(pakshaPhrase, lang);
};


export const nakshatraName = (index: number = 0, lang: string = "en"): string => {
  const safeIdx = Math.max(0, Math.min(index || 0, NAKSHATRA_L5.length - 1));
  return pick(NAKSHATRA_L5[safeIdx], lang);
};

export const rashiName = (index: number = 0, lang: string = "en"): string => {
  const safeIdx = Math.max(0, Math.min(index || 0, RASHI_L5.length - 1));
  return pick(RASHI_L5[safeIdx], lang);
};

export const grahaName = (key: keyof typeof GRAHA_L5, lang: string = "en"): string => {
  const phrase = GRAHA_L5[key];
  return pick(phrase, lang);
};

export const colourName = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day || !day.luckyColour || !COLOUR_L5[day.luckyColour]) return "";
  return pick(COLOUR_L5[day.luckyColour], lang);
};

export const directionName = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day || !day.luckyDirection || !DIRECTION_L5[day.luckyDirection]) return "";
  return pick(DIRECTION_L5[day.luckyDirection], lang);
};

export const bandGuide = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day || !day.band || !BAND_GUIDE_L5[day.band]) return "";
  return pick(BAND_GUIDE_L5[day.band], lang);
};

/* ------------------------------------------------------------------ *
 * Explanations — why a day scored the way it did
 * ------------------------------------------------------------------ */

const withNumber = (phrase: L5, lang: string, n: number): string =>
  pick(phrase, lang).replace("{n}", String(n));

const TARA_LINE: L5 = {
  en: "Tara Bala — {name}. {meaning}",
  kn: "ತಾರಾ ಬಲ — {name}. {meaning}",
  te: "తారా బలం — {name}. {meaning}",
  ta: "தாரா பலம் — {name}. {meaning}",
  hi: "तारा बल — {name}। {meaning}"
};

const CHANDRA_LINE: L5 = {
  en: "The Moon moves through house {n} counted from your birth sign.",
  kn: "ಚಂದ್ರ ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ {n}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಾನೆ.",
  te: "చంద్రుడు మీ జన్మ రాశి నుండి {n}వ ఇంట్లో సంచరిస్తాడు.",
  ta: "சந்திரன் உங்கள் ஜன்ம ராசியிலிருந்து {n}ஆம் வீட்டில் சஞ்சரிக்கிறார்.",
  hi: "चंद्रमा आपकी जन्म राशि से {n}वें भाव में भ्रमण करते हैं।"
};

const CHANDRA_GOOD: L5 = {
  en: "This is a supportive position and it lifts the whole day.",
  kn: "ಇದು ಸಹಾಯಕ ಸ್ಥಾನ, ಇಡೀ ದಿನವನ್ನು ಉತ್ತಮಗೊಳಿಸುತ್ತದೆ.",
  te: "ఇది సహాయక స్థానం, రోజు మొత్తాన్ని మెరుగుపరుస్తుంది.",
  ta: "இது ஆதரவான இடம், நாள் முழுவதையும் மேம்படுத்தும்.",
  hi: "यह सहायक स्थिति है और पूरे दिन को उठाती है।"
};

const CHANDRA_MIXED: L5 = {
  en: "This is a middling position, neither strong nor weak.",
  kn: "ಇದು ಮಧ್ಯಮ ಸ್ಥಾನ, ಬಲವೂ ಅಲ್ಲ ದುರ್ಬಲವೂ ಅಲ್ಲ.",
  te: "ఇది మధ్యస్థ స్థానం, బలమూ కాదు బలహీనమూ కాదు.",
  ta: "இது நடுத்தர இடம், வலிமையும் அல்ல பலவீனமும் அல்ல.",
  hi: "यह मध्यम स्थिति है, न मजबूत न कमजोर।"
};

const CHANDRA_WEAK: L5 = {
  en: "This position drains energy, so keep the day light.",
  kn: "ಈ ಸ್ಥಾನ ಶಕ್ತಿಯನ್ನು ಕುಗ್ಗಿಸುತ್ತದೆ, ಆದ್ದರಿಂದ ದಿನವನ್ನು ಹಗುರವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳಿ.",
  te: "ఈ స్థానం శక్తిని తగ్గిస్తుంది, కాబట్టి రోజును తేలికగా ఉంచుకోండి.",
  ta: "இந்த இடம் ஆற்றலைக் குறைக்கும், எனவே நாளை இலகுவாக வைத்திருங்கள்.",
  hi: "यह स्थिति ऊर्जा घटाती है, इसलिए दिन हल्का रखें।"
};

const TITHI_GROUP_LINE: Record<TithiGroup, L5> = {
  nanda: {
    en: "A Nanda tithi — good for celebration and meeting people.",
    kn: "ನಂದಾ ತಿಥಿ — ಸಂಭ್ರಮ ಮತ್ತು ಜನರನ್ನು ಭೇಟಿಯಾಗಲು ಒಳ್ಳೆಯದು.",
    te: "నంద తిథి — వేడుకలకు, వ్యక్తులను కలవడానికి మంచిది.",
    ta: "நந்தா திதி — கொண்டாட்டத்திற்கும் மக்களைச் சந்திப்பதற்கும் நல்லது.",
    hi: "नंदा तिथि — उत्सव और लोगों से मिलने के लिए अच्छी।"
  },
  bhadra: {
    en: "A Bhadra tithi — good for work, study and treatment.",
    kn: "ಭದ್ರಾ ತಿಥಿ — ಕೆಲಸ, ಅಧ್ಯಯನ ಮತ್ತು ಚಿಕಿತ್ಸೆಗೆ ಒಳ್ಳೆಯದು.",
    te: "భద్ర తిథి — పని, చదువు, చికిత్సకు మంచిది.",
    ta: "பத்ரா திதி — வேலை, படிப்பு, சிகிச்சைக்கு நல்லது.",
    hi: "भद्रा तिथि — काम, पढ़ाई और इलाज के लिए अच्छी।"
  },
  jaya: {
    en: "A Jaya tithi — good for competition and settling disputes.",
    kn: "ಜಯಾ ತಿಥಿ — ಸ್ಪರ್ಧೆ ಮತ್ತು ವಿವಾದ ಇತ್ಯರ್ಥಕ್ಕೆ ಒಳ್ಳೆಯದು.",
    te: "జయ తిథి — పోటీకి, వివాద పరిష్కారానికి మంచిది.",
    ta: "ஜயா திதி — போட்டிக்கும் தகராறு தீர்ப்பதற்கும் நல்லது.",
    hi: "जया तिथि — प्रतियोगिता और विवाद सुलझाने के लिए अच्छी।"
  },
  rikta: {
    en: "A Rikta tithi — old texts advise against starting anything new.",
    kn: "ರಿಕ್ತಾ ತಿಥಿ — ಹೊಸದನ್ನು ಆರಂಭಿಸಬೇಡಿ ಎಂದು ಶಾಸ್ತ್ರ ಹೇಳುತ್ತದೆ.",
    te: "రిక్త తిథి — కొత్తది ప్రారంభించవద్దని శాస్త్రం చెబుతుంది.",
    ta: "ரிக்தா திதி — புதியதைத் தொடங்க வேண்டாம் என்று சாஸ்திரம் கூறுகிறது.",
    hi: "रिक्ता तिथि — शास्त्र नया काम शुरू करने से मना करते हैं।"
  },
  purna: {
    en: "A Purna tithi — good for completing and handing over work.",
    kn: "ಪೂರ್ಣಾ ತಿಥಿ — ಕೆಲಸ ಮುಗಿಸಲು ಮತ್ತು ಹಸ್ತಾಂತರಿಸಲು ಒಳ್ಳೆಯದು.",
    te: "పూర్ణ తిథి — పని పూర్తి చేయడానికి, అప్పగించడానికి మంచిది.",
    ta: "பூர்ணா திதி — வேலையை முடிக்கவும் ஒப்படைக்கவும் நல்லது.",
    hi: "पूर्णा तिथि — काम पूरा करने और सौंपने के लिए अच्छी।"
  }
};

const VARA_LINE: L5 = {
  en: "{day} belongs to {graha}, and the Moon in your chart works well with this graha.",
  kn: "{day} {graha}ನ ದಿನ, ನಿಮ್ಮ ಜಾತಕದ ಚಂದ್ರ ಈ ಗ್ರಹದೊಂದಿಗೆ ಚೆನ್ನಾಗಿ ಹೊಂದುತ್ತಾನೆ.",
  te: "{day} {graha} దినం, మీ జాతకంలోని చంద్రుడు ఈ గ్రహంతో బాగా కలుస్తాడు.",
  ta: "{day} {graha} நாள், உங்கள் ஜாதகத்தின் சந்திரன் இக்கிரகத்துடன் நன்கு பொருந்துகிறார்.",
  hi: "{day} {graha} का दिन है, और आपकी कुंडली का चंद्रमा इस ग्रह से अच्छा तालमेल रखता है।"
};

const VARA_LINE_PLAIN: L5 = {
  en: "{day} belongs to {graha}.",
  kn: "{day} {graha}ನ ದಿನ.",
  te: "{day} {graha} దినం.",
  ta: "{day} {graha} நாள்.",
  hi: "{day} {graha} का दिन है।"
};

const JANMA_STAR_LINE: L5 = {
  en: "The Moon returns to your own birth star today. Light a lamp and offer something at the temple.",
  kn: "ಇಂದು ಚಂದ್ರ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ಮರಳುತ್ತಾನೆ. ದೀಪ ಹಚ್ಚಿ, ದೇವಸ್ಥಾನದಲ್ಲಿ ಏನಾದರೂ ಸಮರ್ಪಿಸಿ.",
  te: "ఈ రోజు చంద్రుడు మీ జన్మ నక్షత్రానికి తిరిగి వస్తాడు. దీపం వెలిగించి, ఆలయంలో ఏదైనా సమర్పించండి.",
  ta: "இன்று சந்திரன் உங்கள் ஜன்ம நட்சத்திரத்திற்குத் திரும்புகிறார். விளக்கேற்றி, கோயிலில் ஏதேனும் சமர்ப்பியுங்கள்.",
  hi: "आज चंद्रमा आपके जन्म नक्षत्र पर लौटते हैं। दीपक जलाएँ और मंदिर में कुछ अर्पित करें।"
};

const CHANDRASHTAMA_LINE: L5 = {
  en: "The Moon stands in the eighth from your birth sign. Travel less, speak less, and rest more.",
  kn: "ಚಂದ್ರ ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ ಎಂಟನೆಯ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ಪ್ರಯಾಣ ಕಡಿಮೆ, ಮಾತು ಕಡಿಮೆ, ವಿಶ್ರಾಂತಿ ಹೆಚ್ಚು.",
  te: "చంద్రుడు మీ జన్మ రాశి నుండి ఎనిమిదవ ఇంట్లో ఉన్నాడు. ప్రయాణం తక్కువ, మాట తక్కువ, విశ్రాంతి ఎక్కువ.",
  ta: "சந்திரன் உங்கள் ஜன்ம ராசியிலிருந்து எட்டாம் வீட்டில் உள்ளார். பயணம் குறைவு, பேச்சு குறைவு, ஓய்வு அதிகம்.",
  hi: "चंद्रमा आपकी जन्म राशि से आठवें भाव में हैं। यात्रा कम, बात कम और विश्राम अधिक करें।"
};

const MONEY_LINE: L5 = {
  en: "Wealth houses are open today. Suitable for savings, purchases and clearing dues.",
  kn: "ಇಂದು ಸಂಪತ್ತಿನ ಮನೆಗಳು ತೆರೆದಿವೆ. ಉಳಿತಾಯ, ಖರೀದಿ ಮತ್ತು ಬಾಕಿ ತೀರಿಸಲು ಸೂಕ್ತ.",
  te: "ఈ రోజు సంపద స్థానాలు అనుకూలంగా ఉన్నాయి. పొదుపు, కొనుగోళ్లు, బాకీలు తీర్చడానికి తగినది.",
  ta: "இன்று செல்வ வீடுகள் திறந்துள்ளன. சேமிப்பு, கொள்முதல், பாக்கி தீர்ப்பதற்கு ஏற்றது.",
  hi: "आज धन के भाव अनुकूल हैं। बचत, खरीदारी और बकाया चुकाने के लिए उपयुक्त।"
};

const VRATA_LINE: Record<string, L5> = {
  ekadashi: {
    en: "Ekadashi — a light meal and extra prayer suit this day.",
    kn: "ಏಕಾದಶಿ — ಹಗುರ ಆಹಾರ ಮತ್ತು ಹೆಚ್ಚಿನ ಪ್ರಾರ್ಥನೆ ಈ ದಿನಕ್ಕೆ ಸೂಕ್ತ.",
    te: "ఏకాదశి — తేలికపాటి ఆహారం, అదనపు ప్రార్థన ఈ రోజుకు తగినవి.",
    ta: "ஏகாதசி — இலகுவான உணவும் கூடுதல் பிரார்த்தனையும் இந்நாளுக்கு ஏற்றவை.",
    hi: "एकादशी — हल्का भोजन और अधिक प्रार्थना इस दिन के अनुकूल है।"
  },
  purnima: {
    en: "Purnima — a full moon day, good for charity and family gathering.",
    kn: "ಹುಣ್ಣಿಮೆ — ದಾನ ಮತ್ತು ಕುಟುಂಬ ಸೇರುವಿಕೆಗೆ ಒಳ್ಳೆಯ ದಿನ.",
    te: "పౌర్ణమి — దానానికి, కుటుంబం కలవడానికి మంచి రోజు.",
    ta: "பௌர்ணமி — தானத்திற்கும் குடும்பம் ஒன்றுகூடுவதற்கும் நல்ல நாள்.",
    hi: "पूर्णिमा — दान और परिवार के मिलन के लिए अच्छा दिन।"
  },
  amavasya: {
    en: "Amavasya — remember the ancestors and offer water in their name.",
    kn: "ಅಮಾವಾಸ್ಯೆ — ಪಿತೃಗಳನ್ನು ಸ್ಮರಿಸಿ, ಅವರ ಹೆಸರಿನಲ್ಲಿ ಜಲ ಸಮರ್ಪಿಸಿ.",
    te: "అమావాస్య — పితరులను స్మరించి, వారి పేరిట జలం సమర్పించండి.",
    ta: "அமாவாசை — முன்னோர்களை நினைவுகூர்ந்து, அவர்கள் பெயரில் நீர் சமர்ப்பியுங்கள்.",
    hi: "अमावस्या — पितरों का स्मरण करें और उनके नाम से जल अर्पित करें।"
  },
  pradosha: {
    en: "Pradosha — the evening hour is best for a lamp before Shiva.",
    kn: "ಪ್ರದೋಷ — ಸಂಜೆಯ ಹೊತ್ತು ಶಿವನ ಮುಂದೆ ದೀಪ ಹಚ್ಚಲು ಉತ್ತಮ.",
    te: "ప్రదోషం — సాయంత్ర వేళ శివుని ముందు దీపం వెలిగించడానికి ఉత్తమం.",
    ta: "பிரதோஷம் — மாலை நேரம் சிவனுக்கு விளக்கேற்ற உகந்தது.",
    hi: "प्रदोष — संध्या का समय शिव के समक्ष दीप जलाने के लिए उत्तम है।"
  },
  sankashti: {
    en: "Sankashti Chaturthi — a good day to pray to Ganapati for a stuck matter.",
    kn: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿ — ನಿಂತು ಹೋದ ಕೆಲಸಕ್ಕಾಗಿ ಗಣಪತಿಯನ್ನು ಪ್ರಾರ್ಥಿಸಲು ಒಳ್ಳೆಯ ದಿನ.",
    te: "సంకష్ట చతుర్థి — ఆగిపోయిన పని కోసం గణపతిని ప్రార్థించడానికి మంచి రోజు.",
    ta: "சங்கடஹர சதுர்த்தி — நின்றுபோன வேலைக்காக கணபதியை வேண்ட நல்ல நாள்.",
    hi: "संकष्टी चतुर्थी — रुके हुए काम के लिए गणपति से प्रार्थना करने का अच्छा दिन।"
  }
};

/** The four to six lines that explain a single day to the reader. */
export const dayExplanation = (day: RhythmDay, lang: string): string[] => {
  const lines: string[] = [];

  if (day.tara?.tara) {
    const tara = TARA_L5[day.tara.tara - 1] ?? TARA_L5[0]!;
    lines.push(
      pick(TARA_LINE, lang)
        .replace("{name}", pick(tara.name, lang))
        .replace("{meaning}", pick(tara.meaning, lang))
    );
  }

  if (day.chandra) {
    const chandraQuality = day.chandra.isChandrashtama
      ? CHANDRASHTAMA_LINE
      : day.chandra.isFavourable
        ? CHANDRA_GOOD
        : day.chandra.score >= 50
          ? CHANDRA_MIXED
          : CHANDRA_WEAK;

    lines.push(
      `${withNumber(CHANDRA_LINE, lang, day.chandra.house)} ${pick(chandraQuality, lang)}`
    );
  }

  if (day.tithiGroup && TITHI_GROUP_LINE[day.tithiGroup]) {
    lines.push(pick(TITHI_GROUP_LINE[day.tithiGroup], lang));
  }

  const varaTemplate = day.energyScore >= 60 ? VARA_LINE : VARA_LINE_PLAIN;
  lines.push(
    pick(varaTemplate, lang)
      .replace("{day}", pick(WEEKDAY_L5[day.weekday]!, lang))
      .replace("{graha}", pick(GRAHA_L5[day.dayLord], lang))
  );

  if (day.isJanmaNakshatraDay) lines.push(pick(JANMA_STAR_LINE, lang));
  if (day.isMoneyDay) lines.push(pick(MONEY_LINE, lang));

  if (day.isEkadashi) lines.push(pick(VRATA_LINE.ekadashi!, lang));
  if (day.isPurnima) lines.push(pick(VRATA_LINE.purnima!, lang));
  if (day.isAmavasya) lines.push(pick(VRATA_LINE.amavasya!, lang));
  if (day.isPradosha) lines.push(pick(VRATA_LINE.pradosha!, lang));
  if (day.isSankashti) lines.push(pick(VRATA_LINE.sankashti!, lang));

  return lines;
};

/** Today's calendar day in the same local reckoning the engine used. */
export const todayYmd = (utcOffsetMinutes = 330): string => {
  const shifted = new Date(Date.now() + utcOffsetMinutes * 60000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export type DailyFocusPoint = {
  icon: string;
  category: string;
  text: string;
  type: "positive" | "warning" | "neutral";
};

export function getDailyActionableGuidance(day: RhythmDay, lang: string = "en"): DailyFocusPoint[] {
  const isKn = lang.startsWith("kn");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");

  const points: DailyFocusPoint[] = [];

  // 1. Vehicle & Asset Purchase Point
  if (day.isMoneyDay || (day.tara?.isFavourable && day.chandra?.isFavourable)) {
    points.push({
      icon: "🚗",
      category: isKn ? "ವಾಹನ ಹಾಗೂ ಆಸ್ತಿ ಖರೀದಿ" : isHi ? "वाहन एवं संपत्ति क्रय" : isTe ? "వాహన & ఆస్తి కొనుగోలు" : isTa ? "வாகனம் & சொத்து வாங்குதல்" : "Vehicle & Asset Purchase",
      text: isKn ? "ಇಂದು ನೂತನ ವಾಹನ ಖರೀದಿ, ಹಣಕಾಸು ಒಪ್ಪಂದಗಳು ಹಾಗೂ ಹೂಡಿಕೆಗೆ ಅತ್ಯಂತ ಶುಭಕರವಾಗಿದೆ." : isHi ? "आज नए वाहन की खरीदारी, वित्तीय सौदों एवं निवेश के लिए अत्यंत शुभ दिन है।" : isTe ? "ఈ రోజు కొత్త వాహనం కొనుగోలు, ఆర్థిక ఒప్పందాలకు చాలా శుభప్రదం." : isTa ? "இன்று புதிய வாகனம் வாங்குவதற்கும் நிதி ஒப்பந்தங்களுக்கும் மிகவும் உகந்த நாள்." : "Highly auspicious today for new vehicle purchase, financial investments, and business deals.",
      type: "positive"
    });
  } else if (day.isChandrashtama || day.band === "rest") {
    points.push({
      icon: "🚗",
      category: isKn ? "ವಾಹನ ಹಾಗೂ ಆಸ್ತಿ ಖರೀದಿ" : isHi ? "वाहन एवं संपत्ति क्रय" : isTe ? "వాహన & ఆస్తి కొనుగోలు" : isTa ? "வாகனம் & சொத்து வாங்குதல்" : "Vehicle & Asset Purchase",
      text: isKn ? "ಇಂದು ದೊಡ್ಡ ಮಟ್ಟದ ವಾಹನ ನೋಂದಣಿ ಅಥವಾ ಆಸ್ತಿ ಒಪ್ಪಂದಗಳನ್ನು ಮುಂದೂಡುವುದು ಸೂಕ್ತ." : isHi ? "आज बड़ी वाहन डिलीवरी या संपत्ति समझौतों को स्थगित करना उचित रहेगा।" : isTe ? "ఈ రోజు భారీ వాహన డెలివరీ లేదా ఆస్తి ఒప్పందాలను వాయిదా వేయడం మంచిది." : isTa ? "இன்று புதிய வாகனம் எடுப்பது அல்லது சொத்து ஒப்பந்தங்களை ஒத்திவைப்பது நல்லது." : "Exercise caution today; defer major vehicle registration or large asset agreements.",
      type: "warning"
    });
  } else {
    points.push({
      icon: "🚗",
      category: isKn ? "ವಾಹನ ಹಾಗೂ ಆಸ್ತಿ ಖರೀದಿ" : isHi ? "वाहन एवं संपत्ति क्रय" : isTe ? "వాహన & ఆస్తి కొనుగోలు" : isTa ? "வாகனம் & சொத்து வாங்குதல்" : "Vehicle & Asset Purchase",
      text: isKn ? "ಸಾಮಾನ್ಯ ವಾಹನ ಸಂಚಾರಕ್ಕೆ ಶುಭ. ಮಧ್ಯಾಹ್ನದ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಪ್ರಯಾಣ ಬೆಳೆಸಿ." : isHi ? "सामान्य वाहन उपयोग के लिए शुभ। दोपहर के शुभ मुहूर्त में यात्रा करें।" : isTe ? "సాధారణ వాహన ప్రయాణానికి మంచిది. మధ్యాహ్న శుభ ముహూర్తంలో ప్రయాణించండి." : isTa ? "சாதாரண வாகன பயணத்திற்கு நல்லது. மதிய சுப முகூர்த்தத்தில் பயணம் செய்யவும்." : "Moderate day for vehicle use and travel. Plan key tasks during auspicious hours.",
      type: "neutral"
    });
  }

  // 2. Financial Growth / Money Point
  if (day.arthaScore >= 80 || day.isMoneyDay) {
    points.push({
      icon: "💰",
      category: isKn ? "ಧನ ಅಭಿವೃದ್ಧಿ & ವ್ಯಾಪಾರ" : isHi ? "धन वृद्धि एवं व्यापार" : isTe ? "ధన లాభం & వ్యాపారం" : isTa ? "தன லாபம் & வியாபாரம்" : "Financial Growth & Business",
      text: isKn ? "ಲಕ್ಷ್ಮಿ ಕೃಪೆಯಿದ್ದು, ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ ಹಾಗೂ ಹೊಸ ಆದಾಯ ಮೂಲಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ." : isHi ? "लक्ष्मी कृपा से बकाया धन की वसूली तथा आय के नए स्रोत खुलने की संभावना है।" : isTe ? "లక్ష్మీ కటాక్షంతో పాత బాకీల వసూలు మరియు నూతన ఆదాయ మార్గాలు సుగమమవుతాయి." : isTa ? "லஷ்மி கடாட்சத்தால் பழைய பாக்கிகள் வசூலாகும், புதிய வருமான வழிகள் திறக்கும்." : "Strong financial influx indicated; auspicious for recovering dues and launching ventures.",
      type: "positive"
    });
  } else {
    points.push({
      icon: "💰",
      category: isKn ? "ಧನ ಅಭಿವೃದ್ಧಿ & ವ್ಯಾಪಾರ" : isHi ? "धन वृद्धि एवं व्यापार" : isTe ? "ధన లాభం & వ్యాపారం" : isTa ? "தன லாபம் & வியாபாரம்" : "Financial Growth & Business",
      text: isKn ? "ಅನಗತ್ಯ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ಸಾಲ ನೀಡುವ ಮುನ್ನ ಎಚ್ಚರ ವಹಿಸಿ." : isHi ? "अनावश्यक खर्चों पर नियंत्रण रखें, लेन-देन में सतर्कता बरतें।" : isTe ? "అవసరం లేని ఖర్చులను అదుపులో ఉంచుకోండి, అప్పు ఇచ్చేటప్పుడు జాగ్రత్త వహించండి." : isTa ? "தேவையற்ற செலவுகளைக் கட்டுப்படுத்துங்கள், கடன் கொடுப்பதை தவிர்க்கவும்." : "Maintain balanced expenditure; double-check financial terms before committing.",
      type: "neutral"
    });
  }

  // 3. Mental State / Manas Point
  if (day.chandra?.isFavourable && !day.isChandrashtama) {
    points.push({
      icon: "🧠",
      category: isKn ? "ಮನಃಸ್ಥಿತಿ & ಏಕಾಗ್ರತೆ (ಮನಸ್ಸು)" : isHi ? "मानसिक स्थिति एवं शांति (मन)" : isTe ? "మానసిక స్థితి & ప్రశాంతత (మనస్సు)" : isTa ? "மன நிலை & அமைதி (மனம்)" : "Mind State & Peace (Manas)",
      text: isKn ? "ಚಂದ್ರಬಲ ಉತ್ತಮವಾಗಿದ್ದು, ಚಿತ್ತ ಏಕಾಗ್ರತೆ ಹಾಗೂ ಪ್ರಸನ್ನತೆಯಿಂದ ಕೆಲಸ ಕಾರ್ಯಗಳು ಪೂರ್ಣಗೊಳ್ಳಲಿವೆ." : isHi ? "चंद्रबल उत्तम रहने से मन शांत, एकाग्र और प्रफुल्लित रहेगा।" : isTe ? "చంద్రబలం బాగుండటంతో మనస్సు ప్రశాంతంగా, ఏకాగ్రతతో ఉంటుంది." : isTa ? "சந்திரபலம் சிறப்பாக இருப்பதால் மனம் அமைதியாகவும் தெளிவுடனும் இருக்கும்." : "Moon energy is strong (Chitta Ekagrata); clear decision-making and mental peace guaranteed.",
      type: "positive"
    });
  } else {
    points.push({
      icon: "🧠",
      category: isKn ? "ಮನಃಸ್ಥಿತಿ & ಏಕಾಗ್ರತೆ (ಮನಸ್ಸು)" : isHi ? "मानसिक स्थिति एवं शांति (मन)" : isTe ? "మానసిక స్థితి & ప్రశాంతత (మనస్సు)" : isTa ? "மன நிலை & அமைதி (மனம்)" : "Mind State & Peace (Manas)",
      text: isKn ? "ಚಂದ್ರಾಷ್ಟಮ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಸಣ್ಣ ಚಾಂಚಲ್ಯವಿರಬಹುದು, ಧ್ಯಾನ ಹಾಗೂ ಶಿವನಾಮ ಜಪ ಮಾಡಿ." : isHi ? "चंचलता से बचने के लिए ओम नमः शिवाय का जाप एवं ध्यान करें।" : isTe ? "మనస్సు చంచలంగా ఉండే అవకాశం ఉంది, శివ నామ స్మరణ చేయండి." : isTa ? "மனதில் சிறு சஞ்சலம் வரலாம், தியானம் மற்றும் சிவ நாம ஜபம் செய்யவும்." : "Mind may feel slightly restless (Chandrashtama sensitivity); practice calm meditation & mantra chanting.",
      type: "warning"
    });
  }

  // 4. Spiritual & Daily Harmony Point
  points.push({
    icon: "🪔",
    category: isKn ? "ದೈವಿಕ ಸಂಕಲ್ಪ & ಪೂಜೆ" : isHi ? "दैवीय संकल्प एवं पूजा" : isTe ? "దైవిక సంకల్పం & పూజ" : isTa ? "தெய்வீக சங்கல்பம் & பூஜை" : "Spiritual Harmony",
    text: isKn ? "ಇಂದಿನ ದೇವತಾ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಕಾರ್ಯಾರಂಭ ಮಾಡಿ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ನಿಮ್ಮ ಮೇಲಿದೆ." : isHi ? "इष्ट देव का स्मरण करके कार्य प्रारंभ करें। गोकर्ण महाबलेश्वर की असीम कृपा आप पर है।" : isTe ? "ఇష్ట దైవ ప్రార్థనతో దినచర్య ప్రారంభించండి. గోకర్ణ మహాబలేశ్వర అనుగ్రహం ఉంటుంది." : isTa ? "இஷ்ட தெய்வ வழிபாட்டுடன் நாளைத் தொடங்குங்கள். கோகர்ண மகாபலேஸ்வரர் அருள் உண்டு." : "Begin your day with the sacred deity mantra. Gokarna Mahabaleshwara blessings stay with you.",
    type: "positive"
  });

  return points;
}
