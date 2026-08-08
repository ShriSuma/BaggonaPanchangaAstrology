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
    en: "Current Transits",
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
  footer: {
    en: "Prepared with care by Baggona Panchanga, Gokarna",
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ, ಗೋಕರ್ಣ — ಶ್ರದ್ಧೆಯಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ",
    te: "బగ్గోణ పంచాంగం, గోకర్ణ — శ్రద్ధతో సిద్ధం చేయబడినది",
    ta: "பக்கோண பஞ்சாங்கம், கோகர்ணம் — சிரத்தையுடன் தயாரிக்கப்பட்டது",
    hi: "बग्गोण पंचांग, गोकर्ण — श्रद्धापूर्वक तैयार किया गया"
  },

  /* Introduction block */
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
 *
 * Kept as a per-language sentence template rather than glued-together
 * fragments, because word order differs across these five languages.
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
