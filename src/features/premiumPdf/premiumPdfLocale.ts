/**
 * Hand-authored five-language vocabulary for the Premium PDF.
 *
 * Every string here is written once per language by hand. Nothing on this page
 * goes through a machine translator at runtime, which is what stops a Kannada
 * book from picking up stray English words or oddly translated proper nouns.
 *
 * Graha, rashi, nakshatra and month names are reused from the Seva locale so
 * the whole product speaks with one vocabulary.
 */

import {
  type L5,
  type SevaLang,
  type GrahaKey,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  MONTH_L5
} from "../seva/sevaLocale";

export type { L5, SevaLang, GrahaKey };
export { pick, GRAHA_L5, RASHI_L5, NAKSHATRA_L5, MONTH_L5 };

/* ------------------------------------------------------------------ *
 * Section titles and labels
 * ------------------------------------------------------------------ */

export const PDF_T: Record<string, L5> = {
  title: {
    en: "Baggona Panchanga",
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
    te: "బగ్గోణ పంచాంగం",
    ta: "பக்கோண பஞ்சாங்கம்",
    hi: "बग्गोण पंचांग"
  },
  subtitle: {
    en: "Detailed Astrology Reading",
    kn: "ವಿಸ್ತೃತ ಜ್ಯೋತಿಷ್ಯ ಫಲ",
    te: "వివరమైన జ్యోతిష్య ఫలితం",
    ta: "விரிவான ஜோதிட பலன்",
    hi: "विस्तृत ज्योतिष फल"
  },

  nameLabel: { en: "Name", kn: "ಹೆಸರು", te: "పేరు", ta: "பெயர்", hi: "नाम" },
  dobLabel: {
    en: "Birth Details",
    kn: "ಜನ್ಮ ವಿವರ",
    te: "జన్మ వివరాలు",
    ta: "பிறப்பு விவரம்",
    hi: "जन्म विवरण"
  },
  lagnaLabel: {
    en: "Birth Lagna",
    kn: "ಜನ್ಮ ಲಗ್ನ",
    te: "జన్మ లగ్నం",
    ta: "ஜென்ம லக்னம்",
    hi: "जन्म लग्न"
  },
  moonLabel: {
    en: "Moon Sign",
    kn: "ಚಂದ್ರ ರಾಶಿ",
    te: "చంద్ర రాశి",
    ta: "சந்திர ராசி",
    hi: "चंद्र राशि"
  },
  nakshatraLabel: {
    en: "Nakshatra",
    kn: "ನಕ್ಷತ್ರ",
    te: "నక్షత్రం",
    ta: "நட்சத்திரம்",
    hi: "नक्षत्र"
  },
  eraLabel: {
    en: "Current Period",
    kn: "ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲ",
    te: "ప్రస్తుత దశా కాలం",
    ta: "தற்போதைய தசைக் காலம்",
    hi: "वर्तमान दशा काल"
  },
  dashaLabel: {
    en: "Mahadasha",
    kn: "ಮಹಾದಶೆ",
    te: "మహాదశ",
    ta: "மகாதசை",
    hi: "महादशा"
  },
  bhuktiLabel: { en: "Bhukti", kn: "ಭುಕ್ತಿ", te: "భుక్తి", ta: "புக்தி", hi: "भुक्ति" },

  characteristicsTitle: {
    en: "Characteristics of the Person",
    kn: "ವ್ಯಕ್ತಿತ್ವದ ಗುಣಲಕ್ಷಣಗಳು",
    te: "వ్యక్తిత్వ లక్షణాలు",
    ta: "ஆளுமைப் பண்புகள்",
    hi: "व्यक्तित्व के लक्षण"
  },
  darkSecretTitle: {
    en: "The Hidden Truth",
    kn: "ನಿಗೂಢ ರಹಸ್ಯ",
    te: "నిగూఢ రహస్యం",
    ta: "மறைபொருள் ரகசியம்",
    hi: "निगूढ़ रहस्य"
  },
  currentPhaseTitle: {
    en: "Current Mindset & Life Phase (Present Period)",
    kn: "ಪ್ರಸ್ತುತ ಮನಸ್ಥಿತಿ ಮತ್ತು ಜೀವನ (ವರ್ತಮಾನ ಕಾಲ)",
    te: "ప్రస్తుత మనస్థితి మరియు జీవితం (వర్తమాన కాలం)",
    ta: "தற்போதைய மனநிலை மற்றும் வாழ்க்கை கட்டம் (தற்போதைய காலம்)",
    hi: "वर्तमान मनस्थिति एवं जीवन काल (वर्तमान काल)"
  },
  currentPhaseGuidanceTitle: {
    en: "Present Planetary Influence & Divine Guidance",
    kn: "ಪ್ರಸ್ತುತ ಗ್ರಹ ಬಲ ಹಾಗೂ ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ",
    te: "ప్రస్తుత గ్రహ బలం మరియు దైవిక మార్గదర్శకత్వం",
    ta: "தற்போதைய கிரக பலன் மற்றும் தெய்வீக வழிகாட்டுதல்",
    hi: "वर्तमान ग्रह बल एवं दैवीय मार्गदर्शन"
  },
  yogasTitle: {
    en: "Special Planetary Combinations",
    kn: "ವಿಶೇಷ ಗ್ರಹ ಯೋಗಗಳು",
    te: "విశేష గ్రహ యోగాలు",
    ta: "விசேட கிரக யோகங்கள்",
    hi: "विशेष ग्रह योग"
  },
  doshasTitle: {
    en: "Karmic Challenges",
    kn: "ಕರ್ಮ ದೋಷಗಳು",
    te: "కర్మ దోషాలు",
    ta: "கர்ம தோஷங்கள்",
    hi: "कर्म दोष"
  },
  remedyTitle: {
    en: "Remedy",
    kn: "ಪರಿಹಾರ",
    te: "పరిహారం",
    ta: "பரிகாரம்",
    hi: "परिहार"
  },
  timelineTitle: {
    en: "The Next Six Months",
    kn: "ಮುಂದಿನ ಆರು ತಿಂಗಳ ಫಲ",
    te: "రాబోయే ఆరు నెలల ఫలితం",
    ta: "அடுத்த ஆறு மாத பலன்",
    hi: "आगामी छह माह का फल"
  },
  gocharaTitle: {
    en: "Current Planetary Transits",
    kn: "ಪ್ರಸ್ತುತ ಗೋಚಾರ ಫಲ",
    te: "ప్రస్తుత గోచార ఫలితం",
    ta: "தற்போதைய கோசார பலன்",
    hi: "वर्तमान गोचर फल"
  },
  summaryTitle: {
    en: "The Astrologer's Summary",
    kn: "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ",
    te: "జ్యోతిష్కుని సారాంశం",
    ta: "ஜோதிடரின் சுருக்கம்",
    hi: "ज्योतिषी का सारांश"
  },
  ashirvadaTitle: {
    en: "Blessing",
    kn: "ಆಶೀರ್ವಾದ",
    te: "ఆశీర్వాదం",
    ta: "ஆசீர்வாதம்",
    hi: "आशीर्वाद"
  },
  introTitle: {
    en: "A Word Before We Begin",
    kn: "ಆರಂಭಕ್ಕೂ ಮೊದಲು ಒಂದು ಮಾತು",
    te: "ప్రారంభానికి ముందు ఒక మాట",
    ta: "தொடங்கும் முன் ஒரு வார்த்தை",
    hi: "आरम्भ से पहले एक बात"
  },
  namaskara: {
    en: "Namaskara",
    kn: "ನಮಸ್ಕಾರ",
    te: "నమస్కారం",
    ta: "வணக்கம்",
    hi: "नमस्कार"
  },
  introPrepared: {
    en: "This reading has been prepared for you alone, from your own birth chart.",
    kn: "ಈ ಫಲವನ್ನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮಗಾಗಿಯೇ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.",
    te: "ఈ ఫలితాన్ని మీ జన్మ కుండలి ఆధారంగా మీ కోసమే సిద్ధం చేయడమైనది.",
    ta: "இந்தப் பலன் உங்கள் ஜாதகத்தின் அடிப்படையில் உங்களுக்காகவே தயாரிக்கப்பட்டுள்ளது.",
    hi: "यह फल आपकी जन्म कुंडली के आधार पर केवल आपके लिए तैयार किया गया है।"
  },
  introBegin: {
    en: "Below, your complete reading begins.",
    kn: "ಇನ್ನು ಕೆಳಗೆ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಫಲ ಆರಂಭವಾಗುತ್ತದೆ.",
    te: "ఇక క్రింద మీ సంపూర్ణ ఫలితం ప్రారంభమవుతుంది.",
    ta: "இனி கீழே உங்கள் முழுமையான பலன் தொடங்குகிறது.",
    hi: "अब नीचे आपका सम्पूर्ण फल आरम्भ होता है।"
  }
};

export const tp = (key: keyof typeof PDF_T | string, lang: string): string => {
  const phrase = PDF_T[key as string];
  return phrase ? pick(phrase, lang) : String(key);
};

/* ------------------------------------------------------------------ *
 * The running-period sentence
 * ------------------------------------------------------------------ */

const RUNNING_SENTENCE: L5 = {
  en: "At this moment you are passing through the Mahadasha of {maha}, and within it the Bhukti of {bhukti}.",
  kn: "ಈ ಸಮಯದಲ್ಲಿ ನೀವು {maha} ಮಹಾದಶೆಯಲ್ಲಿ, ಅದರೊಳಗೆ {bhukti} ಭುಕ್ತಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿದ್ದೀರಿ.",
  te: "ప్రస్తుతం మీరు {maha} మహాదశలో, దాని లోపల {bhukti} భుక్తిలో నడుస్తున్నారు.",
  ta: "இந்த நேரத்தில் நீங்கள் {maha} மகாதசையிலும், அதற்குள் {bhukti} புக்தியிலும் நடந்து கொண்டிருக்கிறீர்கள்.",
  hi: "इस समय आप {maha} महादशा में और उसके भीतर {bhukti} भुक्ति में चल रहे हैं।"
};

export const runningPeriodSentence = (
  lang: string,
  mahaLord: GrahaKey,
  bhuktiLord: GrahaKey
): string =>
  pick(RUNNING_SENTENCE, lang)
    .replace("{maha}", pick(GRAHA_L5[mahaLord], lang))
    .replace("{bhukti}", pick(GRAHA_L5[bhuktiLord], lang));

/** "Namaskara Ramesh," — the comma placement differs by script. */
export const greetingLine = (lang: string, name: string): string => {
  const hello = tp("namaskara", lang);
  const trimmed = (name || "").trim();
  if (!trimmed) return `${hello},`;
  return lang === "hi" ? `${hello} ${trimmed} जी,` : `${hello} ${trimmed},`;
};

/* ------------------------------------------------------------------ *
 * Comprehensive Chart Introduction Sentence (5-Language Templated)
 * ------------------------------------------------------------------ */

export interface ChartIntroDetails {
  name: string;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  birthWeekday: string;
  birthDateFormatted: string;
  birthTime: string;
  mahaLord?: string;
  bhuktiLord?: string;
}

const COMPREHENSIVE_INTRO_TEMPLATE: L5 = {
  en: "I have carefully analyzed your Janma Kundali. You were born under {lagna} Lagna, {moonSign} Rashi, and {nakshatra} Nakshatra on a {birthWeekday} ({birthDateFormatted} at {birthTime}). Currently, you are passing through {maha} Mahadasha and {bhukti} Bhukti. Based on these precise cosmic alignments, your detailed birth chart analysis is presented below.",
  kn: "ನಾನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಅತ್ಯಂತ ಶ್ರದ್ಧೆಯಿಂದ ಪರಿಶೀಲಿಸಿದ್ದೇನೆ. ನೀವು {birthWeekday} ({birthDateFormatted} ಸಮಯ {birthTime}) ದಿನದಂದು {lagna} ಲಗ್ನ, {moonSign} ರಾಶಿ ಮತ್ತು {nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ನೀವು {maha} ಮಹಾದಶೆಯಲ್ಲಿ {bhukti} ಭುಕ್ತಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿದ್ದೀರಿ. ಈ ಗ್ರಹ ಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಜಾತಕದ ವಿಸ್ತೃತ ಫಲಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.",
  te: "నేను మీ జన్మ కుండలిని అత్యంత శ్రద్ధతో పరిశీలించాను. మీరు {birthWeekday} ({birthDateFormatted} సమయం {birthTime}) రోజున {lagna} లగ్నం, {moonSign} రాశి మరియు {nakshatra} నక్షత్రంలో జన్మించారు. ప్రస్తుతం మీరు {maha} మహాదశలో {bhukti} భుక్తిలో నడుస్తున్నారు. ఈ గ్రహ స్థితుల ఆధారంగా మీ జాతక ఫలితాలు క్రింద వివరించబడ్డాయి.",
  ta: "நான் உங்கள் ஜென்ம ஜாதகத்தை மிகவும் கவனமாக ஆராய்ந்துள்ளேன். நீங்கள் {birthWeekday} ({birthDateFormatted} நேரம் {birthTime}) அன்று {lagna} லக்னம், {moonSign} ராசி மற்றும் {nakshatra} நட்சத்திரத்தில் அவதரித்துள்ளீர்கள். தற்போது நீங்கள் {maha} மகாதசையில் {bhukti} புக்தியில் நடந்து கொண்டிருக்கிறீர்கள். இதன் அடிப்படையில் உங்கள் விரிவான ஜாதக பலன்கள் கீழே வழங்கப்பட்டுள்ளன.",
  hi: "मैंने आपकी जन्म कुंडली का अत्यंत सूक्ष्मता से विश्लेषण किया है। आपका जन्म {birthWeekday} ({birthDateFormatted} समय {birthTime}) को {lagna} लग्न, {moonSign} राशि एवं {nakshatra} नक्षत्र में हुआ था। वर्तमान में आप {maha} महादशा एवं {bhukti} भुक्ति के प्रभाव में हैं। इन ग्रहों के आधार पर आपका विस्तृत फल नीचे प्रस्तुत है।"
};

export const buildComprehensiveIntro = (lang: string, details: ChartIntroDetails): string => {
  return pick(COMPREHENSIVE_INTRO_TEMPLATE, lang)
    .replace("{lagna}", details.lagna || "")
    .replace("{moonSign}", details.moonSign || "")
    .replace("{nakshatra}", details.nakshatra || "")
    .replace("{birthWeekday}", details.birthWeekday || "")
    .replace("{birthDateFormatted}", details.birthDateFormatted || "")
    .replace("{birthTime}", details.birthTime || "")
    .replace("{maha}", details.mahaLord || "")
    .replace("{bhukti}", details.bhuktiLord || "");
};

/**
 * Ensures that Jayashree Pandit self-introduction strings never leak into PDF outputs.
 */
export function stripJayashreeIntro(text: string): string {
  if (!text) return "";
  return text
    .replace(/ನಮಸ್ಕಾರ[\s\S]*?ಧಾರೆ ಎರೆದಿದ್ದೇನೆ[।\.]?/gi, "")
    .replace(/ನಾನು ಜಯಶ್ರೀ ಪಂಡಿತ್[\s\S]*?ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇನೆ[।\.]?/gi, "")
    .replace(/ಕಳೆದ ೬೦ ವರ್ಷಗಳಿಂದ[\s\S]*?ಆರಂಭಿಸೋಣ[।\.]?/gi, "")
    .replace(/Namaskara[\s\S]*?horoscope[.\!]?/gi, "")
    .replace(/I am Jayashree Pandit[\s\S]*?horoscope[.\!]?/gi, "")
    .replace(/With over 60 years of profound experience[\s\S]*?birth chart[.\!]?/gi, "")
    .replace(/Jayashree Pandit/gi, "")
    .replace(/ಜಯಶ್ರೀ ಪಂಡಿತ್/gi, "")
    .replace(/^\s*\n+/gm, "\n")
    .trim();
}

/* ------------------------------------------------------------------ *
 * Birth line — built from the month table instead of a translator,
 * so "25 March 1990, 10:30" never comes back as a mangled phrase.
 * ------------------------------------------------------------------ */

export const formatBirthLine = (
  lang: string,
  birthDateIso: string,
  birthTime: string
): string => {
  const parts = (birthDateIso || "").split("-");
  if (parts.length !== 3) return `${birthDateIso}, ${birthTime}`;

  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  if (!Number.isFinite(year) || !Number.isFinite(day) || monthIndex < 0 || monthIndex > 11) {
    return `${birthDateIso}, ${birthTime}`;
  }

  return `${day} ${pick(MONTH_L5[monthIndex], lang)} ${year}, ${birthTime}`;
};

/* ------------------------------------------------------------------ *
 * Language profiles used to build the AI prompts
 * ------------------------------------------------------------------ */

type LangProfile = {
  englishName: string;
  nativeName: string;
  scriptName: string;
  /** Words the model habitually leaves in English or transliterates. */
  bannedExamples: string;
};

const LANG_PROFILE: Record<SevaLang, LangProfile> = {
  en: {
    englishName: "English",
    nativeName: "English",
    scriptName: "Latin",
    bannedExamples: ""
  },
  kn: {
    englishName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    scriptName: "Kannada",
    bannedExamples: "ಕರಿಯರ್, ಬ್ಯಾಲೆನ್ಸ್, ಎನರ್ಜಿ, ಪಾಸಿಟಿವ್, ಫೋಕಸ್, ಇಂಪ್ಯಾಕ್ಟ್, ರಿಲೇಶನ್‌ಶಿಪ್"
  },
  te: {
    englishName: "Telugu",
    nativeName: "తెలుగు",
    scriptName: "Telugu",
    bannedExamples: "కెరీర్, బ్యాలెన్స్, ఎనర్జీ, పాజిటివ్, ఫోకస్, ఇంపాక్ట్, రిలేషన్‌షిప్"
  },
  ta: {
    englishName: "Tamil",
    nativeName: "தமிழ்",
    scriptName: "Tamil",
    bannedExamples: "கரியர், பேலன்ஸ், எனர்ஜி, பாசிட்டிவ், ஃபோகஸ், இம்பாக்ட், ரிலேஷன்ஷிப்"
  },
  hi: {
    englishName: "Hindi",
    nativeName: "हिन्दी",
    scriptName: "Devanagari",
    bannedExamples: "करियर, बैलेंस, एनर्जी, पॉजिटिव, फोकस, इम्पैक्ट, रिलेशनशिप"
  }
};

export const languageProfile = (lang: string): LangProfile =>
  LANG_PROFILE[(lang || "en").split("-")[0] as SevaLang] ?? LANG_PROFILE.en;

/**
 * The language rule block prepended to every premium prompt.
 *
 * This is deliberately the first thing the model reads and is phrased as a
 * hard contract, because the failure we keep seeing is not a wrong language
 * but a correct language sprinkled with English nouns.
 */
export const languageContract = (lang: string): string => {
  const p = languageProfile(lang);

  if (p.englishName === "English") {
    return [
      "LANGUAGE RULE",
      "Write everything in plain, warm English. Short sentences. No Sanskrit or Kannada words",
      "except the traditional astrological terms that have no English equivalent.",
      "Keep the JSON keys exactly as given."
    ].join("\n");
  }

  return [
    "LANGUAGE RULE — THIS OUTRANKS EVERY OTHER INSTRUCTION",
    `Write every single word in ${p.nativeName} (${p.englishName}), in ${p.scriptName} script only.`,
    "",
    `1. No English words anywhere, including inside JSON string values, headings and names.`,
    `2. No Latin letters at all in the values.`,
    `3. Do not spell English words in ${p.scriptName} letters. These are forbidden: ${p.bannedExamples}.`,
    `   Use real ${p.nativeName} vocabulary that an elder at home would actually say.`,
    `4. Translate the names of yogas, doshas and transits into ${p.nativeName} as well.`,
    `   Traditional Sanskrit terms already common in ${p.nativeName} are fine.`,
    `5. Keep the JSON keys exactly as written in this prompt. Only the values change language.`,
    `6. Ordinary digits (1, 2, 3) and years are fine.`,
    "",
    `Write the way a village astrologer speaks to a family sitting in front of him:`,
    `simple, warm, direct ${p.nativeName}. Not a textbook, not a translation.`
  ].join("\n");
};

/* ------------------------------------------------------------------ *
 * Repetition control
 * ------------------------------------------------------------------ */

const CHAPTER_MAP: Record<string, string> = {
  characteristics: "the person's nature and character",
  darkSecret: "the one hidden karmic truth of the chart",
  yogas: "the auspicious planetary combinations",
  doshas: "the karmic afflictions and their remedies",
  gochara: "the transits running right now",
  timeline: "a month-by-month outlook for the next six months",
  summary: "a short closing summary"
};

/**
 * Each chapter is generated by a separate model call, so without this block
 * the model has no idea the other chapters exist and re-uses the same opening
 * lines and the same three metaphors in all seven of them.
 */
export const noRepeatContract = (sectionKey: string, runId: string): string => {
  const mine = CHAPTER_MAP[sectionKey] ?? sectionKey;
  const others = Object.entries(CHAPTER_MAP)
    .filter(([key]) => key !== sectionKey)
    .map(([, label]) => label)
    .join("; ");

  return [
    "SCOPE AND REPETITION RULE",
    `This book has seven chapters, each written separately. You are writing ONLY the chapter on ${mine}.`,
    `Other chapters already cover: ${others}.`,
    "Do not summarise, preview or restate those chapters. Stay strictly inside your own chapter.",
    "",
    "Do not open with a generic line about planets shaping destiny, about the cosmos, or about",
    "the stars guiding a path. Begin immediately with something true of THIS chart.",
    "No two paragraphs may begin with the same word. Vary sentence length.",
    "",
    `Reading reference: ${runId}. If this person prints the book again, the wording must come out`,
    "differently while the astrological facts stay identical. Change the phrasing, never the facts."
  ].join("\n");
};

/** Short random id so repeated downloads are visibly different documents. */
export const newRunId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function cleanEnglishFromRegionalText(text: string, lang: string): string {
  if (!text || lang === "en") return text;
  let cleaned = text;
  if (lang.startsWith("kn")) {
    cleaned = cleaned
      .replace(/ಮೂanaditude/gi, "ಮನಸ್ಥಿತಿ")
      .replace(/\b(attitude|manattitude|moanattitude|mindset)\b/gi, "ಮನಸ್ಥಿತಿ")
      .replace(/\b(career)\b/gi, "ಉದ್ಯೋಗ")
      .replace(/\b(health)\b/gi, "ಆರೋಗ್ಯ")
      .replace(/\b(wealth|finance)\b/gi, "ಸಂಪತ್ತು")
      .replace(/\b(marriage)\b/gi, "ವಿವಾಹ")
      .replace(/\b(children|progeny)\b/gi, "ಸಂತಾನ");

    cleaned = cleaned.replace(/[a-zA-Z]+/g, "");
    cleaned = cleaned.replace(/  +/g, " ");
  } else if (lang.startsWith("hi")) {
    cleaned = cleaned
      .replace(/\b(attitude|mindset)\b/gi, "मनोवृत्ति")
      .replace(/\b(career)\b/gi, "करियर")
      .replace(/\b(health)\b/gi, "स्वास्थ्य")
      .replace(/\b(wealth|finance)\b/gi, "धन");
  }
  return cleaned;
}
