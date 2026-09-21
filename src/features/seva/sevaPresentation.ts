/**
 * Turns a computed RhythmDay into the words and colours the screen and the
 * printed sheets share. Kept apart from the engine so the numbers stay pure
 * and the wording stays in one place for all five languages.
 */

import type { RhythmDay } from "../../core/DailyRhythmEngine";
import type { TithiGroup } from "../../core/TaraBalaEngine";
import type { KundliOutput } from "../../core/AstroTypes";
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

/** Full tithi label, e.g. "Shukla Paksha Panchami" or simply "Purnima", based on the dominant majority Tithi for the whole day. */
export const tithiLabel = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  if (day.isPurnima) return pick(PURNIMA_L5, lang);
  if (day.isAmavasya) return pick(AMAVASYA_L5, lang);
  const tithiInPaksha = day.majorityTithiInPaksha ?? day.tithiInPaksha ?? 1;
  const tithiIdx = Math.max(0, tithiInPaksha - 1);
  const name = pick(TITHI_L5[tithiIdx] ?? TITHI_L5[0], lang);
  const pakshaKey = day.majorityPaksha ?? day.paksha ?? "shukla";
  const pakshaPhrase = PAKSHA_L5[pakshaKey] || PAKSHA_L5["shukla"];
  return `${pick(pakshaPhrase, lang)} ${name}`;
};

/** Tithi name only without Paksha, e.g. "Panchami", "Purnima", "Amavasya". */
export const tithiOnlyLabel = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  if (day.isPurnima) return pick(PURNIMA_L5, lang);
  if (day.isAmavasya) return pick(AMAVASYA_L5, lang);
  const tithiInPaksha = day.majorityTithiInPaksha ?? day.tithiInPaksha ?? 1;
  const tithiIdx = Math.max(0, tithiInPaksha - 1);
  return pick(TITHI_L5[tithiIdx] ?? TITHI_L5[0], lang);
};

/** Paksha name only, e.g. "Shukla Paksha" or "Krishna Paksha". */
export const pakshaLabel = (day?: RhythmDay | null, lang: string = "en"): string => {
  if (!day) return "";
  const pakshaKey = day.majorityPaksha ?? day.paksha ?? "shukla";
  const pakshaPhrase = PAKSHA_L5[pakshaKey] || PAKSHA_L5["shukla"];
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

export function getDailyActionableGuidance(
  day: RhythmDay,
  lang: string = "en",
  birthKundli?: KundliOutput
): DailyFocusPoint[] {
  const code = (lang || "en").slice(0, 2);
  const isKn = code === "kn";
  const isHi = code === "hi";
  const isTe = code === "te";
  const isTa = code === "ta";

  const taraNum = (day.tara?.tara as number) || 1;
  const chandraHouse = (day.chandra?.house as number) || 1;
  const moonRashiIdx = day.moonRashiIndex ?? 0;
  const safeDayLord = typeof day.weekday === "number"
    ? Math.abs(day.weekday) % 7
    : (() => {
        const dl = String(day.dayLord || "sun").toLowerCase();
        const map: Record<string, number> = {
          sun: 0, sunday: 0, ravi: 0, surya: 0,
          mon: 1, monday: 1, soma: 1, chandra: 1, moon: 1,
          tue: 2, tuesday: 2, mangala: 2, kuja: 2, mars: 2,
          wed: 3, wednesday: 3, budha: 3, mercury: 3,
          thu: 4, thursday: 4, guru: 4, vrhaspati: 4, jupiter: 4,
          fri: 5, friday: 5, shukra: 5, venus: 5,
          sat: 6, saturday: 6, shani: 6, saturn: 6
        };
        return map[dl] ?? 0;
      })();

  const score = day.energyScore ?? 75;
  const isCaution = day.isChandrashtama || day.isAmavasya || taraNum === 3 || taraNum === 5 || taraNum === 7 || score < 50;

  // Derive native's ascendant and moon rashi for authentic Bhava linkages
  const ascRashiIdx = birthKundli?.lagnaRashi?.index ?? (birthKundli?.ascendant !== undefined ? Math.floor(((birthKundli.ascendant % 360) + 360) % 360 / 30) : undefined);
  const natalMoonRashiIdx = birthKundli?.moonSign?.index ?? (day as any).janmaRashiIndex ?? ((day.moonRashiIndex - (chandraHouse - 1) + 12) % 12);

  // 4th house (Vahana Bhava) from Lagna (or Moon if Lagna unknown)
  const vahanaHouseRashiIdx = ascRashiIdx !== undefined ? (ascRashiIdx + 3) % 12 : (natalMoonRashiIdx + 3) % 12;
  const vahanaRashiName = rashiName(vahanaHouseRashiIdx, lang);
  const vahanaBhavaLabel = ascRashiIdx !== undefined
    ? (isKn ? `೪ನೇ ವಾಹನ ಭಾವ (${vahanaRashiName})` : isHi ? `चतुर्थ वाहन भाव (${vahanaRashiName})` : isTe ? `4వ వాహన భావం (${vahanaRashiName})` : isTa ? `4ஆம் வாகன பாவம் (${vahanaRashiName})` : `4th Vahana Bhava (${vahanaRashiName})`)
    : (isKn ? `ಚಂದ್ರನಿಂದ ೪ನೇ ವಾಹನ ಭಾವ (${vahanaRashiName})` : isHi ? `चंद्र से चतुर्थ वाहन भाव (${vahanaRashiName})` : isTe ? `చంద్రుని నుండి 4వ వాహన భావం (${vahanaRashiName})` : isTa ? `சந்திரனிலிருந்து 4ஆம் வாகன பாவம் (${vahanaRashiName})` : `4th House from Moon (${vahanaRashiName})`);

  // 2nd house (Dhana Bhava) & 11th house (Labha Bhava) from Lagna (or Moon if Lagna unknown)
  const dhanaHouseRashiIdx = ascRashiIdx !== undefined ? (ascRashiIdx + 1) % 12 : (natalMoonRashiIdx + 1) % 12;
  const labhaHouseRashiIdx = ascRashiIdx !== undefined ? (ascRashiIdx + 10) % 12 : (natalMoonRashiIdx + 10) % 12;
  const dhanaRashiName = rashiName(dhanaHouseRashiIdx, lang);
  const labhaRashiName = rashiName(labhaHouseRashiIdx, lang);
  const dhanaLabhaLabel = ascRashiIdx !== undefined
    ? (isKn ? `೨ನೇ ಧನ ಭಾವ (${dhanaRashiName}) & ೧೧ನೇ ಲಾಭ ಭಾವ (${labhaRashiName})` : isHi ? `द्वितीय धन भाव (${dhanaRashiName}) व 11वें लाभ भाव (${labhaRashiName})` : isTe ? `2వ ధన భావం (${dhanaRashiName}) & 11వ లాభ భావం (${labhaRashiName})` : isTa ? `2ஆம் தன பாவம் (${dhanaRashiName}) & 11ஆம் லாப பாவம் (${labhaRashiName})` : `2nd Dhana (${dhanaRashiName}) & 11th Labha (${labhaRashiName})`)
    : (isKn ? `ಚಂದ್ರನಿಂದ ೨ನೇ ಧನ ಭಾವ (${dhanaRashiName}) & ೧೧ನೇ ಲಾಭ ಭಾವ (${labhaRashiName})` : isHi ? `चंद्र से 2रे धन भाव (${dhanaRashiName}) व 11वें लाभ भाव (${labhaRashiName})` : isTe ? `చంద్రుని నుండి 2వ ధన భావం (${dhanaRashiName}) & 11వ లాభ భావం (${labhaRashiName})` : isTa ? `சந்திரனிலிருந்து 2ஆம் தன பாவம் (${dhanaRashiName}) & 11ஆம் லாப பாவம் (${labhaRashiName})` : `2nd & 11th Bhavas from Moon (${dhanaRashiName}/${labhaRashiName})`);

  const points: DailyFocusPoint[] = [];

  // 1. Vehicle & Asset Guidance (Synthesized from 4th House Vahana Bhava & 9 Taras)
  const p1Cat = isKn ? "ವಾಹನ, ಆಸ್ತಿ & ಪ್ರಯಾಣ" : isHi ? "वाहन, संपत्ति व यात्रा" : isTe ? "వాహన & ఆస్తి మార్గదర్శకత్వం" : isTa ? "வாகனம், சொத்து & பயணம்" : "Vehicle, Asset & Travel";
  let p1Text = "";
  let p1Type: "positive" | "warning" | "neutral" = "neutral";

  if (taraNum === 2) {
    p1Type = "positive";
    p1Text = isKn ? `ಸಂಪತ್ ತಾರಾ ಬಲ ಹಾಗೂ ${vahanaBhavaLabel} ಅನುಗ್ರಹದಿಂದ ನೂತನ ವಾಹನ ಖರೀದಿ, ಬಂಗಾರ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ದಿನ.`
      : isHi ? `सम्पत् तारा प्रभाव एवं ${vahanaBhavaLabel} के शुभ योग से नए वाहन क्रय, स्वर्ण व अचल संपत्ति निवेश के लिए अत्यंत उत्तम दिन।`
      : isTe ? `సంపత్ తారా బలం మరియు ${vahanaBhavaLabel} అనుగ్రహంతో నూతన వాహన కొనుగోలు, ఆస్తి పెట్టుబడులకు అత్యంత శుభప్రదమైన రోజు.`
      : isTa ? `சம்பத் தாரா பலம் மற்றும் ${vahanaBhavaLabel} யோகத்தால் புதிய வாகனம் வாங்குதல், சொத்து முதலீடுகளுக்கு மிகவும் உகந்த நாள்.`
      : `Sampat Tara synergized with your ${vahanaBhavaLabel} infuses immense prosperity for vehicle delivery, gold purchases, and property assets.`;
  } else if (taraNum === 6) {
    p1Type = "positive";
    p1Text = isKn ? `ಸಾಧಕ ತಾರಾ ಪ್ರಭಾವ ಮತ್ತು ${vahanaBhavaLabel} ಬಲದಿಂದ ಯಂತ್ರೋಪಕರಣ ಖರೀದಿ, ವ್ಯಾಪಾರ ವಾಹನ ಪರವಾನಗಿ ಹಾಗೂ ಪ್ರಯಾಣದಲ್ಲಿ ಜಯ.`
      : isHi ? `साधक तारा प्रभाव एवं ${vahanaBhavaLabel} के बल से वाणिज्यिक वाहन, मशीनरी क्रय व यात्रा में पूर्ण सफलता मिलेगी।`
      : isTe ? `సాధక తారా ప్రభావం మరియు ${vahanaBhavaLabel} బలంతో యంత్రాలు, వాణిజ్య వాహనాల కొనుగోలు మరియు ప్రయాణాలలో విజయం.`
      : isTa ? `சாதக தாரா பலம் மற்றும் ${vahanaBhavaLabel} பலத்தால் வாகன பயணம் மற்றும் சுப காரியங்களில் வெற்றி உண்டாகும்.`
      : `Sadhaka Tara activating ${vahanaBhavaLabel} ensures victory in machinery, vehicle permits, and progressive journeys.`;
  } else if (taraNum === 4 || taraNum === 9) {
    p1Type = "positive";
    p1Text = isKn ? `ಕ್ಷೇಮ/ಪರಮ ಮಿತ್ರ ತಾರಾ ಹಾಗೂ ${vahanaBhavaLabel} ಪ್ರಭಾವದಿಂದ ಕುಟುಂಬದೊಂದಿಗೆ ವಾಹನ ಪ್ರಯಾಣ ಹಾಗೂ ಗೃಹಾಲಂಕಾರಕ್ಕೆ ಅನುಕೂಲಕರ.`
      : isHi ? `क्षेम/परम मित्र तारा एवं ${vahanaBhavaLabel} प्रभाव से पारिवारिक यात्रा व गृह सज्जा हेतु समय अनुकूल है।`
      : isTe ? `క్షేమ/పరమ మిత్ర తారా మరియు ${vahanaBhavaLabel} బలంతో కుటుంబ సమేత ప్రయాణాలు, గృహ పనులకు అనుకూల సమయం.`
      : isTa ? `க்ஷேம/பரம மித்ர தாரா மற்றும் ${vahanaBhavaLabel} அருளால் குடும்ப வாகன பயணம் மற்றும் வீட்டு வேலைகளுக்கு ஏற்ற நாள்.`
      : `Kshema / Parama Mitra Tara supporting ${vahanaBhavaLabel} brings safety and delight for family travels and home asset improvements.`;
  } else if (taraNum === 3 || isCaution) {
    p1Type = "warning";
    p1Text = isKn ? `ವಿಪತ್/ಎಚ್ಚರಿಕೆ ದಿನ: ${vahanaBhavaLabel}ದಲ್ಲಿ ಸಂಯಮವಿರಲಿ; ದೂರದ ರಾತ್ರಿ ಪ್ರಯಾಣ ಹಾಗೂ ಹೊಸ ಆಸ್ತಿ ಒಪ್ಪಂದಗಳನ್ನು ಮುಂದೂಡುವುದು ಕ್ಷೇಮ.`
      : isHi ? `सतर्कता दिन: ${vahanaBhavaLabel} में संयम रखें; लंबी रात्रि यात्रा व नए संपत्ति समझौतों को आज टालना ही श्रेयस्कर रहेगा।`
      : isTe ? `జాగ్రత్త సమయం: ${vahanaBhavaLabel}ను దృష్టిలో ఉంచుకుని రాత్రి వేళ సుదూర ప్రయాణాలు, నూతన ఆస్తి ఒప్పందాలను వాయిదా వేయండి.`
      : isTa ? `கவனமான நாள்: ${vahanaBhavaLabel} அமைப்பில் கவனம் தேவை; இரவு நேர நீண்ட பயணங்களையும் புதிய சொத்து ஒப்பந்தங்களையும் தள்ளிவைக்கவும்.`
      : `Caution transit affecting ${vahanaBhavaLabel}: Avoid impulsive vehicle delivery or night highway drives; verify vehicle safety checks.`;
  } else {
    p1Type = "neutral";
    p1Text = isKn ? `${vahanaBhavaLabel} ದಿನಚರಿಗೆ ಶುಭ. ಮಧ್ಯಾಹ್ನದ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಸಾಮಾನ್ಯ ವಾಹನ ಸಂಚಾರ ಬೆಳೆಸಿ.`
      : isHi ? `${vahanaBhavaLabel} सामान्य है। शुभ वेला में नियोजित यात्रा एवं वाहन उपयोग करें।`
      : isTe ? `${vahanaBhavaLabel} సాధారణంగా ఉంది. శుభ సమయంలో సాధారణ వాహన ప్రయాణాన్ని ప్రారంభించండి.`
      : isTa ? `${vahanaBhavaLabel} சீராக உள்ளது. சுப நேரத்தில் வழக்கமான வாகன பயணத்தை மேற்கொள்ளவும்.`
      : `Moderate rhythm for ${vahanaBhavaLabel}; plan routine commutes and regular vehicle maintenance during auspicious hours.`;
  }

  points.push({ icon: "🚗", category: p1Cat, text: p1Text, type: p1Type });

  // 2. Financial Growth & Career Guidance (Synthesized from 2nd Dhana & 11th Labha Bhavas and Transit Moon)
  const p2Cat = isKn ? "ಧನ ಅಭಿವೃದ್ಧಿ & ವೃತ್ತಿ" : isHi ? "धन वृद्धि एवं करियर" : isTe ? "ధన లాభం & ఉద్యోగం" : isTa ? "தன லாபம் & தொழில்" : "Financial Growth & Career";
  let p2Text = "";
  let p2Type: "positive" | "warning" | "neutral" = "neutral";

  if (chandraHouse === 11 || chandraHouse === 2) {
    p2Type = "positive";
    p2Text = isKn ? `${dhanaLabhaLabel} ಮತ್ತು ${chandraHouse}ನೇ ಭಾವದ ಚಂದ್ರಬಲದಿಂದ ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ, ಧನ ಲಾಭ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆಗೆ ಅತ್ಯುತ್ತಮ.`
      : isHi ? `${dhanaLabhaLabel} तथा ${chandraHouse}वें भाव में चंद्र संचरण से रुका हुआ धन प्राप्त होगा तथा व्यापार विस्तार के नए मार्ग खुलेंगे।`
      : isTe ? `${dhanaLabhaLabel} మరియు ${chandraHouse}వ భావ చంద్రబలంతో పాత బాకీలు వసూలవుతాయి, నూతన ఆదాయ మార్గాలు తెరుచుకుంటాయి.`
      : isTa ? `${dhanaLabhaLabel} மற்றும் ${chandraHouse}ஆம் இட சந்திரனால் பழைய பாக்கிகள் வசூலாகும், தொழில் மற்றும் வியாபாரத்தில் தன லாபம் பெருகும்.`
      : `Activating your ${dhanaLabhaLabel}, transit Moon in house ${chandraHouse} opens lucrative income streams, debt recoveries, and business expansion.`;
  } else if (chandraHouse === 10 || chandraHouse === 9 || chandraHouse === 1) {
    p2Type = "positive";
    p2Text = isKn ? `ಕರ್ಮ/ಭಾಗ್ಯ ಸ್ಥಾನದ ಚಂದ್ರಬಲ ಹಾಗೂ ${dhanaLabhaLabel} ಬೆಂಬಲದಿಂದ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಮುಖ ನಿರ್ಧಾರ, ಉನ್ನತಾಧಿಕಾರಿಗಳ ಮೆಚ್ಚುಗೆ ಲಭಿಸಲಿದೆ.`
      : isHi ? `कर्म/भाग्य भाव के चंद्र बल एवं ${dhanaLabhaLabel} के सहयोग से कार्यक्षेत्र में महत्वपूर्ण निर्णय, अधिकारियों की प्रशंसा व नए दायित्व मिलने का प्रबल योग है।`
      : isTe ? `కర్మ/భాగ్య స్థాన చంద్రబలం మరియు ${dhanaLabhaLabel} సహకారంతో ఉద్యోగంలో ముఖ్యమైన నిర్ణయాలు, ఉన్నతాధికారుల ప్రశంసలు మరియు బాధ్యతలు లభిస్తాయి.`
      : isTa ? `தொழில்/பாக்ய ஸ்தான சந்திர பலம் மற்றும் ${dhanaLabhaLabel} ஆதரவால் பணியில் முக்கிய முடிவுகள், அதிகாரிகளின் பாராட்டு மற்றும் புதிய பொறுப்புகள் கிடைக்கும்.`
      : `Auspicious career alignment synergizing with ${dhanaLabhaLabel} boosts executive reputation, leadership initiatives, and strategic milestones.`;
  } else if (chandraHouse === 6 || chandraHouse === 3) {
    p2Type = "positive";
    p2Text = isKn ? `ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ, ವಿರೋಧಿಗಳ ಶಮನ ಹಾಗೂ ${dhanaLabhaLabel} ಬಲದಿಂದ ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಶ್ರೇಷ್ಠ ಆರ್ಥಿಕ ಪ್ರತಿಫಲ.`
      : isHi ? `प्रतियोगिता में विजय, विरोधियों का शमन एवं ${dhanaLabhaLabel} के प्रभाव से परिश्रम का पूर्ण आर्थिक लाभ प्राप्त होगा।`
      : isTe ? `పోటీలలో విజయం, విరోధులపై పైచేయి మరియు ${dhanaLabhaLabel} బలంతో శ్రమకు తగిన ఆర్థిక ప్రతిఫలం లభిస్తుంది.`
      : isTa ? `போட்டிகளில் வெற்றி, எதிர்ப்புகள் விலகுதல் மற்றும் ${dhanaLabhaLabel} பலத்தால் உழைப்புக்கேற்ற சிறந்த தன லாபம் கிடைக்கும்.`
      : `Overcoming hurdles with ${dhanaLabhaLabel} strength rewarded with tangible financial gains and client negotiations.`;
  } else if (chandraHouse === 8 || chandraHouse === 12) {
    p2Type = "warning";
    p2Text = isKn ? `${chandraHouse}ನೇ ಭಾವ ಸಂಚಾರ: ${dhanaLabhaLabel} ರಕ್ಷಣೆಗಾಗಿ ಆರ್ಥಿಕ ವಹಿವಾಟಿನಲ್ಲಿ ಮಿತವ್ಯಯ ಪಾಲಿಸಿ; ಅಪರಿಚಿತರಿಗೆ ಸಾಲ ನೀಡುವುದು ಬೇಡ.`
      : isHi ? `${chandraHouse}वें भाव संचरण: ${dhanaLabhaLabel} की सुरक्षा हेतु आर्थिक लेन-देन में सतर्कता बरतें; किसी को उधार न दें और जोखिम भरे निवेश से बचें।`
      : isTe ? `${chandraHouse}వ స్థాన సంచారం: ${dhanaLabhaLabel} రక్షణ కోసం ఆర్థిక లావాదేవీలలో జాగ్రత్త వహించండి; అపరిచితులకు అప్పు ఇవ్వడం, రిస్క్ పెట్టుబడులు వద్దు.`
      : isTa ? `${chandraHouse}ஆம் இட சஞ்சாரம்: ${dhanaLabhaLabel} நலனுக்காக பண பரிவர்த்தனைகளில் கவனம் தேவை; கடன் கொடுப்பதையும் அதிக ஆபத்துள்ள முதலீடுகளையும் தவிர்க்கவும்.`
      : `House ${chandraHouse} transit: Safeguard your ${dhanaLabhaLabel} by exercising budget discipline; audit commitments and avoid speculative gambles.`;
  } else {
    p2Type = "neutral";
    p2Text = isKn ? `${dhanaLabhaLabel} ಸ್ಥಿರ ಪ್ರಗತಿ. ನಿಯಮಿತ ಕರ್ತವ್ಯಗಳನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ನಿರ್ವಹಿಸಿ ಆರ್ಥಿಕ ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳಿ.`
      : isHi ? `${dhanaLabhaLabel} में सामान्य स्थिरता। नियमित कार्यों को निष्ठापूर्वक पूरा करें और आर्थिक संतुलन बनाए रखें।`
      : isTe ? `${dhanaLabhaLabel} సాధారణ పురోగతి. నిత్య విధులను శ్రద్ధతో నిర్వర్తించి ఆర్థిక స్థిరత్వం కాపాడుకోండి.`
      : isTa ? `${dhanaLabhaLabel} சீரான வளர்ச்சி. வழக்கமான பணிகளை நேர்த்தியாக செய்து நிதி நிலையை சீராக வைக்கவும்.`
      : `Steady vocational flow for ${dhanaLabhaLabel}; maintain prudent financial stewardship and complete pending deliverables.`;
  }

  points.push({ icon: "💰", category: p2Cat, text: p2Text, type: p2Type });

  // 3. Mental State & Family Vitality Guidance (Synthesized from Moon Signs & Elements)
  const p3Cat = isKn ? "ಮನಃಸ್ಥಿತಿ & ಕುಟುಂಬ ಶಾಂತಿ" : isHi ? "मनोस्थिति व पारिवारिक सौहार्द" : isTe ? "మానసిక ప్రశాంతత & కుటుంబం" : "Mindset & Domestic Harmony";
  let p3Text = "";
  let p3Type: "positive" | "warning" | "neutral" = "neutral";

  const isWaterOrEarth = [1, 3, 5, 7, 9, 11].includes(moonRashiIdx);
  if (!isCaution && (taraNum === 4 || taraNum === 8 || taraNum === 2 || taraNum === 9)) {
    p3Type = "positive";
    p3Text = isKn ? (isWaterOrEarth
      ? "ಮನಸ್ಸಿನಲ್ಲಿ ಪ್ರಶಾಂತತೆ, ಕುಟುಂಬದಲ್ಲಿ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಹಿರಿಯರ ಪ್ರೀತಿಯಿಂದ ಸುಖಕರ ವಾತಾವರಣ."
      : "ಚಿತ್ತ ಏಕಾಗ್ರತೆ, ಉತ್ಸಾಹಭರಿತ ಮಾತುಕತೆ ಹಾಗೂ ಆಪ್ತರೊಂದಿಗೆ ಸಂತೋಷದ ಕ್ಷಣಗಳು.")
      : isHi ? "मन शांत एवं प्रफुल्लित रहेगा; परिवार में सुख-शांति तथा आत्मीय जनों का भरपूर स्नेह मिलेगा।"
      : isTe ? "మనస్సు ప్రశాంతంగా, ఉల్లాసంగా ఉంటుంది; కుటుంబంలో సంతోషం, ఆత్మీయుల ప్రేమానురాగాలు లభిస్తాయి."
      : isTa ? "மனதில் அமைதியும் தெளிவும் நிலவும்; குடும்பத்தில் மகிழ்ச்சியும் அன்பான உறவுகளும் பெருகும்."
      : "Elevated mental composure (Chitta Ekagrata) brings joyful domestic harmony and warm supportive bonds.";
  } else if (isCaution) {
    p3Type = "warning";
    p3Text = isKn ? "ಭಾವನಾತ್ಮಕ ಆವೇಶಕ್ಕೆ ಒಳಗಾಗದೆ ಶಾಂತವಾಗಿರಿ; ಧ್ಯಾನ ಹಾಗೂ ಶಿವನಾಮ ಸ್ಮರಣೆಯಿಂದ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಪಡೆಯಿರಿ."
      : isHi ? "भावनात्मक आवेग से बचें; शांत मन से ध्यान व ॐ नमः शिवाय के जप से आंतरिक शांति प्राप्त करें।"
      : isTe ? "భావోద్వేగాలకు లోనుకాకుండా ప్రశాంతంగా ఉండండి; ధ్యానం, శివనామ స్మరణ ద్వారా మనఃశాంతి పొందండి."
      : isTa ? "உணர்ச்சிவசப்படாமல் அமைதியாக இருங்கள்; தியானம் மற்றும் சிவ நாம ஜபத்தால் மன அமைதி பெறுக."
      : "Mind may feel sensitive to stress; practice deep breathwork, calm reflection, and sacred chanting.";
  } else {
    p3Type = "neutral";
    p3Text = isKn ? "ದಿನನಿತ್ಯದ ಕರ್ತವ್ಯಗಳಲ್ಲಿ ಸಮಚಿತ್ತತೆ ಕಾಯ್ದುಕೊಳ್ಳಿ; ಸಂಜೆ ಕುಟುಂಬದೊಂದಿಗೆ ಸಮಯ ಕಳೆಯುವುದು ಹಿತಕರ."
      : isHi ? "दैनिक कार्यों में समरसता बनाए रखें; संध्या समय परिवार के साथ समय बिताना सुखद रहेगा।"
      : isTe ? "దినచర్యలో సమతుల్యత పాటించండి; సాయంత్రం కుటుంబంతో గడపడం ఎంతో ఆనందాన్నిస్తుంది."
      : isTa ? "அன்றாட பணிகளில் சமநிலை காக்கவும்; மாலை வேளையில் குடும்பத்துடன் நேரம் செலவிடுவது நல்லது."
      : "Maintain balanced daily rhythm; spend peaceful quality time with loved ones this evening.";
  }

  points.push({ icon: "🧠", category: p3Cat, text: p3Text, type: p3Type });

  // 4. Spiritual Grace & Daily Gokarna Deity Remedy
  const DEITY_NAMES: Record<number, { kn: string; hi: string; te: string; ta: string; en: string; mantra: string }> = {
    0: { kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ", hi: "भगवान सूर्यनारायण", te: "శ్రీ సూర్యనారాయణ స్వామి", ta: "ஸ்ரீ சூரியபகவான்", en: "Lord Surya Narayana", mantra: "ॐ ಸೂರ್ಯಾಯ ನಮಃ (Om Suryaya Namah)" },
    1: { kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಚಂದ್ರ ಸ್ವಾಮಿ", hi: "भगवान महाबलेश्वर एवं चंद्र देव", te: "శ్రీ మహాబలేశ్వర & చంద్ర స్వామి", ta: "ஸ்ரீ மகாபலேஸ்வரர் & சந்திரன்", en: "Lord Mahabaleshwara & Chandra", mantra: "ॐ ನಮಃ ಶಿವಾಯ (Om Namah Shivaya)" },
    2: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ & ಮಂಗಳ ಸ್ವಾಮಿ", hi: "भगवान सुब्रमण्य एवं मंगल देव", te: "శ్రీ సుబ్రహ్మణ్య & మంగళ స్వామి", ta: "ஸ்ரீ சுப்ரமணியர் & செவ்வாய்", en: "Lord Subramanya & Mangala", mantra: "ॐ ಶರವಣಭವಾಯ ನಮಃ (Om Saravanabhavaya Namah)" },
    3: { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಬುಧ ಸ್ವಾಮಿ", hi: "भगवान महाविष्णु एवं बुध देव", te: "శ్రీ మహావిష్ణు & బుధ స్వామి", ta: "ஸ்ரீ மகாவிஷ்ணு & புதன்", en: "Lord Mahavishnu & Budha", mantra: "ॐ ನಮೋ ನಾರಾಯಣಾಯ (Om Namo Narayanaya)" },
    4: { kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ & ಬೃಹಸ್ಪತಿ ಸ್ವಾಮಿ", hi: "भगवान गुरु राघवेंद्र एवं बृहस्पति", te: "శ్రీ గురు రాఘవేంద్ర & బృహస్పతి", ta: "ஸ்ரீ குரு ராகவேந்திரர் & குரு", en: "Lord Guru Raghavendra & Brihaspati", mantra: "ॐ ಗುರವೇ ನಮಃ (Om Gurave Namah)" },
    5: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ & ಶುಕ್ರಾಚಾರ್ಯ ಸ್ವಾಮಿ", hi: "माता महालक्ष्मी एवं शुक्र देव", te: "శ్రీ మహాలక్ష్మి & శుక్రుడు", ta: "ஸ்ரீ மகாலக்ஷ்மி & சுக்கிரன்", en: "Goddess Mahalakshmi & Shukra", mantra: "ॐ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ (Om Shreem Mahalakshmyai Namah)" },
    6: { kn: "ಶ್ರೀ ಹನುಮಂತ & ಶನೈಶ್ಚರ ಸ್ವಾಮಿ", hi: "भगवान हनुमान एवं शनि देव", te: "శ్రీ హనుమాన్ & శని దేవుడు", ta: "ஸ்ரீ அனுமன் & சனீஸ்வரர்", en: "Lord Hanuman & Shanieshwara", mantra: "ॐ ಹನುಮತೇ ನಮಃ (Om Hanumate Namah)" }
  };

  const dInfo = DEITY_NAMES[safeDayLord] || DEITY_NAMES[0];
  const dName = isKn ? dInfo.kn : isHi ? dInfo.hi : isTe ? dInfo.te : isTa ? dInfo.ta : dInfo.en;

  const p4Cat = isKn ? "ದೈವಿಕ ಸಂಕಲ್ಪ & ಪೂಜೆ" : isHi ? "दैवीय संकल्प एवं पूजा" : isTe ? "దైవిక సంకల్పం & పూజ" : isTa ? "தெய்வீக சங்கல்பம் & பூஜை" : "Spiritual Harmony";
  const p4Text = isKn ? `ಇಂದು ${dName} ಅವರ ಪ್ರಾರ್ಥನೆಯೊಂದಿಗೆ ದಿನಾರಂಭಿಸಿ. ಜಪ ಮಂತ್ರ: "${dInfo.mantra}". ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಅನುಗ್ರಹ ನಿಮ್ಮ ಮೇಲಿದೆ.`
    : isHi ? `आज ${dName} के स्मरण से दिन प्रारंभ करें। जप मंत्र: "${dInfo.mantra}"। गोकर्ण महाबलेश्वर की असीम कृपा आप पर है।`
    : isTe ? `నేడు ${dName} ఆరాధనతో దినచర్య ప్రారంభించండి. జప మంత్రం: "${dInfo.mantra}". గోకర్ణ మహాబలేశ్వరుని అనుగ్రహం మీకు లభిస్తుంది.`
    : isTa ? `இன்று ${dName} வழிபாட்டுடன் நாளைத் தொடங்குங்கள். ஜெப மந்திரம்: "${dInfo.mantra}". கோகர்ண மகாபலேஸ்வரர் அருள் உண்டு.`
    : `Begin your day invoking blessings of ${dName}. Sacred Chanting: "${dInfo.mantra}". Gokarna Mahabaleshwara blessings protect you.`;

  points.push({ icon: "🪔", category: p4Cat, text: p4Text, type: "positive" });

  return points;
}
