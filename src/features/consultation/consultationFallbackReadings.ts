import type { ConsultationLanguage, ConsultationSession } from "./consultationTypes";
import { sanitizeDuplicateSpeechWords, normToken } from "./consultationSpeechService";

export interface FallbackTimelineSummary {
  topicLabel: string;
  topicYogaName: string;
  rangeSummary: string;
  currentMahaName: string;
  currentBhuktiName: string;
  nextBhuktiName: string;
  monthsToDashaChange: number;
  guruTransitHouseFromMoon?: number;
  shaniTransitHouseFromMoon?: number;
  guruTransitSignName?: string;
  shaniTransitSignName?: string;
  lagnaSignName?: string;
  lagnaLordName?: string;
  bhavaNumber?: number;
  bhavaSignName?: string;
  bhavaLordName?: string;
  bhavaLordPlacedHouse?: number;
  bhuktiEndDateText?: string;
  calendarWindowText?: string;
}

export interface FallbackDoshaSummary {
  hasDosha: boolean;
  doshaName?: string;
  technicalWhy?: string;
  currentLifeProblems?: string;
  recommendedPooja?: string;
}

export interface FallbackConvIntelSummary {
  isAskingTiming: boolean;
  isAskingProof?: boolean;
  previousClaimedWindow?: string | null;
  previousClaimedYear?: string | null;
  isSameTopicFollowUp: boolean;
  contextualBridge: string;
}


export const PROMPT_SANSTHANA_BY_LANG: Record<ConsultationLanguage, string> = {
  kn: "ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
  en: "Sri Baggona Panchanga",
  hi: "श्री बग्गोण पंचांग",
  te: "శ్రీ బగ్గోణ పంచాంగం",
  ta: "ஸ்ரீ பக்கோண பஞ்சாங்கம்",
  ml: "ശ്രീ ബഗ്ഗോണ പഞ്ചാംഗം",
  mr: "श्री बग्गोण पंचांग"
};

export const PROMPT_GOKARNA_BY_LANG: Record<ConsultationLanguage, string> = {
  kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
  en: "Sri Kshetra Gokarna",
  hi: "श्री क्षेत्र गोकर्ण",
  te: "శ్రీ క్షేత్ర గోకర్ణం",
  ta: "ஸ்ரீ க்ஷேத்ர கோகர்ணம்",
  ml: "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം",
  mr: "श्री क्षेत्र गोकर्ण"
};

export const PROMPT_VOCATIVE_BY_LANG: Record<ConsultationLanguage, string> = {
  kn: "ಮಗುವೇ",
  en: "My dear child",
  hi: "प्रिय वत्स",
  te: "నాయనా / ప్రియ భక్తులారా",
  ta: "அன்புக் குழந்தாய்",
  ml: "മകളേ / മകനേ",
  mr: "बाळ / प्रिय भक्त"
};

export const PROMPT_PARENTS_BY_LANG: Record<ConsultationLanguage, string> = {
  kn: "ಆತ್ಮೀಯ ಪೋಷಕರೇ / ಪಾಲಕರೇ",
  en: "Dear Parents",
  hi: "आदरणीय माता-पिता",
  te: "గౌరవనీయులైన తల్లిదండ్రులారా",
  ta: "அன்பார்ந்த பெற்றோர்களே",
  ml: "ബഹുമാനപ്പെട്ട മാതാപിതാക്കളേ",
  mr: "आदरणीय पालकवर्ग"
};

/**
 * Removes Kannada script exemplars/parentheticals from prompts when generating in non-Kannada
 * languages so gemini-3.5-flash-lite never switches to Kannada or garbles Kannada transliterations.
 */
export function sanitizePromptForTargetLanguage(
  rawPrompt: string,
  lang: ConsultationLanguage
): string {
  if (!rawPrompt || lang === "kn") return rawPrompt;
  const sansthana = PROMPT_SANSTHANA_BY_LANG[lang] || PROMPT_SANSTHANA_BY_LANG.en;
  const gokarna = PROMPT_GOKARNA_BY_LANG[lang] || PROMPT_GOKARNA_BY_LANG.en;
  return rawPrompt
    .replace(/ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ[^)\n]*/g, sansthana)
    .replace(/ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ[^)\n]*/g, gokarna)
    .replace(/ಶ್ರೀರಾಮ್ ಪಂಡಿತ್/g, "Sri Shreeram Pandit")
    .replace(/\([^)]*[\u0C80-\u0CFF][^)]*\)/g, "")
    .replace(/\"[\s]*[\u0C80-\u0CFF][^\"]*\"/g, `"(${gokarna} — respond purely in target language)"`)
    .replace(/[\u0C80-\u0CFF]+[\u0C80-\u0CFF\s,\/\-]*[\u0C80-\u0CFF]*/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * Validates and cleans live Gemini response script purity across all 7 languages.
 * Rejects responses that leaked disallowed scripts so callers can fall back cleanly.
 */
export function guardAndCleanGeminiScript(
  rawResponse: string,
  lang: ConsultationLanguage
): { ok: boolean; sanitized: string } {
  if (!rawResponse || !rawResponse.trim()) {
    return { ok: false, sanitized: "" };
  }
  const sansthana = PROMPT_SANSTHANA_BY_LANG[lang] || PROMPT_SANSTHANA_BY_LANG.en;
  const gokarna = PROMPT_GOKARNA_BY_LANG[lang] || PROMPT_GOKARNA_BY_LANG.en;
  let cleaned = rawResponse.trim();

  if (lang !== "kn") {
    cleaned = cleaned
      .replace(/ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ/g, sansthana)
      .replace(/ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ/g, gokarna)
      .replace(/ಗೋಕರ್ಣ/g, gokarna)
      .replace(/ಪಂಚಾಂಗ/g, sansthana);
    const sanctumWordByLang: Record<Exclude<ConsultationLanguage, "kn" | "en">, string> = {
      hi: "पावन सान्निध्य",
      te: "పవిత్ర సన్నిధి",
      ta: "புனித சந்நிதி",
      ml: "പവിത്ര സന്നിധി",
      mr: "पावन सान्निध्य"
    };
    if (lang !== "en") {
      cleaned = cleaned.replace(/\bsacred\s+sanctum\b/gi, sanctumWordByLang[lang]);
      cleaned = cleaned.replace(/\bsanctum\b/gi, sanctumWordByLang[lang]);
    }
  }
  if (lang === "kn") {
    cleaned = cleaned.replace(/ವಿದ್ಯಾಬಹಳ/g, "ವಿದ್ಯಾಭ್ಯಾಸದ");
  } else if (lang === "hi") {
    cleaned = cleaned
      .replace(/मग्ग्वे,?\s*/g, "प्रिय ")
      .replace(/महाबलिेश्वर/g, "महाबलेश्वर");
  } else if (lang === "te") {
    cleaned = cleaned
      .replace(/మహాబేశ్వర/g, "మహాబలేశ్వర")
      .replace(/శంచారి శని/g, "సంచార శని");
  } else if (lang === "ta") {
    cleaned = cleaned
      .replace(/ம்குழந்தை/g, "அன்புக் குழந்தாய்")
      .replace(/பிக்போனா/g, "பக்கோண");
  } else if (lang === "ml") {
    cleaned = cleaned.replace(/മകവുമേ/g, "മകളേ");
  } else if (lang === "mr") {
    cleaned = cleaned
      .replace(/मुक्ताफळांसारखे/g, "मोकळेपणाने")
      .replace(/महाबलिेश्वर/g, "महाबलेश्वर");
  }

  // Reject stray CJK/Japanese/Korean, Bengali/Gurmukhi/Gujarati/Oriya, Arabic, Cyrillic, Armenian, Greek, Hebrew, Thai, or Georgian glyphs in any of the 7 supported languages
  if (/[\u0370-\u06FF\u0980-\u0AFF\u0B00-\u0B7F\u0E00-\u0E7F\u10A0-\u10FF\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }

  if (lang !== "kn" && /[\u0C80-\u0CFF]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang !== "hi" && lang !== "mr" && /[\u0901-\u0964\u0966-\u097F]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang !== "te" && /[\u0C00-\u0C7F]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang !== "ta" && /[\u0B80-\u0BFF]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang !== "ml" && /[\u0D00-\u0D7F]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang === "kn" && !/[\u0C80-\u0CFF]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if ((lang === "hi" || lang === "mr") && !/[\u0901-\u0963\u0970-\u097F]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang === "te" && !/[\u0C00-\u0C7F]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang === "ta" && !/[\u0B80-\u0BFF]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }
  if (lang === "ml" && !/[\u0D00-\u0D7F]/.test(cleaned)) {
    return { ok: false, sanitized: cleaned };
  }

  return { ok: true, sanitized: cleaned };
}

export function deduplicateResponseText(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";

  // Split into paragraphs
  const rawParagraphs = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (rawParagraphs.length === 0) return trimmed;

  const cleanParagraphs: string[] = [];

  for (const para of rawParagraphs) {
    const cleanedPara = sanitizeDuplicateSpeechWords(para).trim();
    if (!cleanedPara) continue;

    // Check if this paragraph is identical to previous paragraph
    const prevPara = cleanParagraphs[cleanParagraphs.length - 1];
    if (prevPara && normToken(cleanedPara) === normToken(prevPara)) {
      continue;
    }
    cleanParagraphs.push(cleanedPara);
  }

  return cleanParagraphs.join("\n\n");
}

export interface DeterministicFallbackContext {
  session: ConsultationSession;
  question: string;
  lagna: string;
  rashi: string;
  nakshatra: string;
  dasha: string;
  activeDosha: FallbackDoshaSummary;
  isSubsequent: boolean;
  convIntel: FallbackConvIntelSummary;
  timeline?: FallbackTimelineSummary;
  includeFullDosha: boolean;
  isGreeting: boolean;
  isCareerFrustration: boolean;
  isSanthana: boolean;
  isSecretIntimate: boolean;
  isMinorChild: boolean;
  tatva: string;
  tatvaEn: string;
  gana: string;
  ganaEn: string;
  psychNature: string;
  psychNatureEn: string;
  house4Sign: string;
  house4Lord: string;
  house5Sign: string;
  house5Lord: string;
  shaniText: string;
  karmaLord: string;
  localizedDevoteeName: string;
}

/**
 * Shared 7-language mathematical proof builder for timing follow-ups ("How sure 2027?", "Why next 6 months?")
 * when deterministic fallback builders are invoked directly.
 */
function buildFallbackTimelineProof(
  lang: ConsultationLanguage,
  ctx: DeterministicFallbackContext
): string {
  const { timeline, convIntel, lagna } = ctx;
  if (!timeline) return "";
  const rawClaim = (convIntel.previousClaimedWindow || "").trim();
  const win =
    rawClaim && (lang === "en" || !/[a-zA-Z]/.test(rawClaim))
      ? rawClaim
      : convIntel.previousClaimedYear && lang !== "en"
        ? `${timeline.rangeSummary} (${convIntel.previousClaimedYear})`
        : timeline.rangeSummary;
  const lagnaSign = timeline.lagnaSignName || lagna;
  const bhavaNum = timeline.bhavaNumber || 7;
  const bhavaSign = timeline.bhavaSignName || lagnaSign;
  const bhavaLord = timeline.bhavaLordName || timeline.nextBhuktiName;
  const bhavaLordHouse = timeline.bhavaLordPlacedHouse || bhavaNum;
  const guruHouse = timeline.guruTransitHouseFromMoon || 5;
  const shaniHouse = timeline.shaniTransitHouseFromMoon || 11;
  const endDate = timeline.bhuktiEndDateText || `${timeline.monthsToDashaChange}`;
  const calWin = timeline.calendarWindowText || timeline.rangeSummary;

  const templates: Record<ConsultationLanguage, string> = {
    en: `Astrological Mathematical Proof for ${win}: This timeframe for ${timeline.topicLabel} is calculated from three converging rules on your ${lagnaSign} Lagna — not a generic guess.\n\nFirst, your running ${timeline.currentMahaName}-${timeline.currentBhuktiName} sub-period concludes in ${timeline.monthsToDashaChange} months (around ${endDate}), shifting directly into ${timeline.nextBhuktiName} Antardasha. Second, natal House ${bhavaNum} (${bhavaSign}) is governed by ${bhavaLord} placed in House ${bhavaLordHouse}, which activates at that Dasha change. Third, live Gochara Jupiter (${guruHouse}th from Moon) and Saturn (${shaniHouse}th from Moon) jointly aspect this Bhava axis across ${calWin}.\n\nIn classical Parashari Jyotisha, when Vimshottari Antardasha change and Guru-Shani double transit align simultaneously on ${timeline.topicYogaName}, ${win} becomes confirmed with 98% astronomical certainty.`,
    kn: `ಶಾಸ್ತ್ರೋಕ್ತ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಮಾಣ (${win}): ನಿಮ್ಮ ${lagnaSign} ಲಗ್ನದ ಕುಂಡಲಿಯಲ್ಲಿ ${timeline.topicLabel} ವಿಷಯವು ${win} ಅವಧಿಯಲ್ಲಿ ನೆರವೇರಲಿದೆ ಎಂದು ಹೇಳಲು ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಗಣಿತ, ಭಾವಾಧಿಪತಿ ಸ್ಥಿತಿ ಹಾಗೂ ಗುರು-ಶನಿ ದ್ವಿಗೋಚಾರ ದೃಷ್ಟಿ ಎಂಬ ಮೂರು ವೈದಿಕ ನಿಯಮಗಳು ನೇರ ಸಾಕ್ಷಿಯಾಗಿವೆ.\n\nಪ್ರಸ್ತುತ ${timeline.currentMahaName}-${timeline.currentBhuktiName} ಉಪ-ಭುಕ್ತಿಯು ಇನ್ನು ${timeline.monthsToDashaChange} ತಿಂಗಳುಗಳಲ್ಲಿ (${endDate}) ಮುಕ್ತಾಯವಾಗಿ ${timeline.nextBhuktiName} ಭುಕ್ತಿ ಆರಂಭವಾಗುತ್ತದೆ. ಇದರೊಂದಿಗೆ ${bhavaNum}ನೇ ಭಾವ (${bhavaSign}) ಅಧಿಪತಿ ${bhavaLord} ಗ್ರಹವು ${bhavaLordHouse}ನೇ ಮನೆಯಲ್ಲಿ ಜಾಗೃತವಾಗಲಿದ್ದು, ಗೋಚಾರ ಗುರು (${guruHouse}ನೇ ಸ್ಥಾನ) ಹಾಗೂ ಶನಿ (${shaniHouse}ನೇ ಸ್ಥಾನ) ${calWin} ಅವಧಿಯಲ್ಲಿ ಒಟ್ಟಾಗಿ ದೃಷ್ಟಿ ಬೀರುತ್ತವೆ.\n\nಪರಾಶರ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ದಶಾ-ಭುಕ್ತಿ ಬದಲಾವಣೆ ಹಾಗೂ ಗುರು-ಶನಿ ದ್ವಿಗೋಚಾರವು ಏಕಕಾಲದಲ್ಲಿ ${timeline.topicYogaName} ಮೇಲೆ ಸಂಯೋಗವಾಗುವುದರಿಂದ ಶೇಕಡಾ ೯೮ ರಷ್ಟು ನಿಖರತೆಯೊಂದಿಗೆ ${win} ಸಮಯ ಖಚಿತವಾಗಿದೆ.`,
    hi: `ज्योतिषीय शास्त्रीय प्रमाण (${win}): आपकी ${lagnaSign} लग्न कुंडली में ${timeline.topicLabel} हेतु ${win} का समय विंशोत्तरी दशा-भुक्ति परिवर्तन, भावेश सक्रियण तथा गुरु-शनि द्विगोचर योग की गणितीय संगति से सिद्ध होता है।\n\nवर्तमान ${timeline.currentMahaName}-${timeline.currentBhuktiName} अंतर्दशा ${timeline.monthsToDashaChange} महीनों में (${endDate}) पूर्ण होकर ${timeline.nextBhuktiName} भुक्ति में प्रवेश करेगी, जिससे ${bhavaNum}वें भाव (${bhavaSign}) के स्वामी ${bhavaLord} (${bhavaLordHouse}वें भाव में स्थित) सक्रिय होंगे। साथ ही गोचर गुरु (चंद्र से ${guruHouse}वें) व शनि (${shaniHouse}वें) की संयुक्त दृष्टि ${calWin} में इस अक्ष को बळ देती है।\n\nपराशर सिद्धांत अनुसार दशा परिवर्तन और गुरु-शनि द्विगोचर के इस संयोग से ${timeline.topicYogaName} ९८% निश्चितता के साथ ${win} में फलीभूत होता है।`,
    te: `జ్యోతిష గణిత శాస్త్ర ప్రమాణం (${win}): మీ ${lagnaSign} లగ్నంలో ${timeline.topicLabel} కోసం ${win} సమయం వింశోత్తరి దశా-భుక్తి మార్పు, భావాధిపతి బలం మరియు గురు-శని ద్విగోచార నియమాలపై ఆధారపడి ఉంది.\n\nప్రస్తుత ${timeline.currentMahaName}-${timeline.currentBhuktiName} భుక్తి ${timeline.monthsToDashaChange} నెలల్లో (${endDate}) ముగిసి ${timeline.nextBhuktiName} అంతర్దశ మొదలవుతుంది; ${bhavaNum}వ భావం (${bhavaSign}) అధిపతి ${bhavaLord} (${bhavaLordHouse}వ స్థానం) ఉత్తేజితమవుతారు. అలాగే గోచార గురువు (${guruHouse}వ స్థానం) మరియు శని (${shaniHouse}వ స్థానం) ${calWin} లో ఈ భావంపై సంయుక్త దృష్టి ప్రసరిస్తారు.\n\nదశా మార్పు మరియు గురు-శని ద్వయ దృష్టి ${timeline.topicYogaName} పై కేంద్రీకృతమైనప్పుడు 98% ఖచ్చితత్వంతో ${win} లో ఫలితం లభిస్తుంది.`,
    ta: `ஜோதிட சாஸ்திர ஆதாரம் (${win}): உங்கள் ${lagnaSign} லக்னத்தில் ${timeline.topicLabel} ${win} காலத்தில் நிகழும் என்பது விம்சோத்தரி தசா-புக்தி மாற்றம், பாவாதிபதி நிலை மற்றும் குரு-சனி இரட்டை பார்வை ஆகிய கணித விதிகளால் உறுதியாகிறது.\n\nநடப்பு ${timeline.currentMahaName}-${timeline.currentBhuktiName} புக்தி ${timeline.monthsToDashaChange} மாதங்களில் (${endDate}) முடிந்து ${timeline.nextBhuktiName} அந்தர தசை தொடங்குகிறது; ${bhavaNum}-ஆம் வீட்டின் (${bhavaSign}) அதிபதி ${bhavaLord} (${bhavaLordHouse}-ஆம் இடம்) பலமடைகிறார். மேலும் கோசார குரு (${guruHouse}-ஆம் இடம்) மற்றும் சனி (${shaniHouse}-ஆம் இடம்) ${calWin} காலத்தில் ஒருசேரப் பார்க்கிறார்கள்.\n\nதசா மாற்றமும் குரு-சனி பார்வையும் ${timeline.topicYogaName} பாவத்தில் இணையும்போது 98% உறுதியுடன் ${win} நிறைவேறுகிறது.`,
    ml: `ജ്യോതിഷ ഗണിത തെളിവ് (${win}): നിങ്ങളുടെ ${lagnaSign} ലഗ്ന ജാതകത്തിൽ ${timeline.topicLabel} ${win} സമയത്ത് സഫലമാകുമെന്ന് ഉറപ്പിക്കുന്നത് വിംശോത്തരി ദശാ-ഭുക്തി മാറ്റം, ഭാവാധിപന്റെ സ്ഥാനം, വ്യാഴം-ശനി ദ്വിഗോചരം എന്നിവയാണ്.\n\nനിലവിലെ ${timeline.currentMahaName}-${timeline.currentBhuktiName} ഭുക്തി ${timeline.monthsToDashaChange} മാസത്തിനുള്ളിൽ (${endDate}) അവസാനിച്ച് ${timeline.nextBhuktiName} അപഹാരം തുടങ്ങും; ${bhavaNum}-ാം ഭാവത്തിന്റെ (${bhavaSign}) അധിപൻ ${bhavaLord} (${bhavaLordHouse}-ാം ഭാവം) സജീവമാകുന്നു. കൂടാതെ ഗോചാര വ്യാഴവും (${guruHouse}-ാം ഭാവം) ശനിയും (${shaniHouse}-ാം ഭാവം) ${calWin} കാലയളവിൽ ഒരേസമയം ദൃഷ്ടി പതിപ്പിക്കുന്നു.\n\nദശാ മാറ്റവും വ്യാഴ-ശനി ദ്വിഗോചരവും ${timeline.topicYogaName} യോഗത്തിൽ ചേരുമ്പോൾ 98% കൃത്യതയോടെ ${win} ഫലപ്രാപ്തി നൽകുന്നു.`,
    mr: `वैदिक ज्योतिष गणितीय पुरावा (${win}): आपल्या ${lagnaSign} लग्नात ${timeline.topicLabel} साठी ${win} ही वेळ विंशोत्तरी दशा-भुक्ती बदल, भावेश स्थिती आणि गुरु-शनी द्विगोचर या तीन शास्त्रोक्त नियमांवर आधारित आहे.\n\nसध्याची ${timeline.currentMahaName}-${timeline.currentBhuktiName} भुक्ती ${timeline.monthsToDashaChange} महिन्यांत (${endDate}) पूर्ण होऊन ${timeline.nextBhuktiName} अंतर्दशा सुरू होईल व ${bhavaNum} व्या भावाचा (${bhavaSign}) स्वामी ${bhavaLord} (${bhavaLordHouse} वे स्थान) सक्रिय होईल. तसेच गोचर गुरु (${guruHouse} वे स्थान) व शनी (${shaniHouse} वे स्थान) ${calWin} दरम्यान एकत्रित शुभ दृष्टी टाकतात.\n\nदशा परिवर्तन आणि गुरु-शनी द्विगोचर ${timeline.topicYogaName} कार्यावर एकत्र येतात तेव्हा ९८% अचूकतेने ${win} फलप्राप्ती निश्चित होते.`
  };

  return deduplicateResponseText(templates[lang] || templates.en);
}

export function buildEnglishFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    session,
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatvaEn,
    ganaEn,
    psychNatureEn,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`I am right here with you in this sacred consultation. Please continue with your question or life situation whenever you are ready.`);
    }
    return deduplicateResponseText(`Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna bestow their divine grace and blessings upon you and your family.\n\nI am sitting with you here in this sacred 20-minute consultation. Please feel at complete peace. You can open your heart and ask any question regarding your life, career, marriage, health, or family dilemmas.`);
  }

  // Proof Follow-Up ("How sure 2027?", "Why next 6 months?")
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("en", ctx);
  }

  // Timing / Intelligent Follow-Up on Marriage, Career, Progeny, etc.
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /when|timing|which month|how long|how many months/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} Examining the relevant Bhavas, ${timeline.topicYogaName}, and planetary movements in your chart, the cosmic timeline for your ${timeline.topicLabel} is now drawing close.`
        : isSubsequent
          ? `Regarding your inquiry on "${question}", with 98% certainty your ${timeline.topicLabel} is indicated to materialize ${timeline.rangeSummary}. Examining the relevant Bhavas, ${timeline.topicYogaName}, and planetary movements in your birth chart, the auspicious timing is now steadily aligning.`
          : `100% Confident Astrological Prediction: With 98% certainty your ${timeline.topicLabel} is indicated to materialize ${timeline.rangeSummary}! Namaste ${session.name}. According to your birth chart calculated with Baggona Panchanga (${lagna} Lagna, ${rashi} Moon Sign, ${nakshatra} Nakshatra), examining the relevant Bhavas, ${timeline.topicYogaName}, and planetary movements in your birth chart, the auspicious timing is now steadily aligning.`;
    const p2Timing = `According to the authentic Vimshottari Dasha calculations of Baggona Panchanga, your current running ${timeline.currentMahaName}-${timeline.currentBhuktiName} transition matures in approximately ${timeline.monthsToDashaChange} months into ${timeline.nextBhuktiName} Antardasha. Furthermore, as benefic Jupiter (Guru) completes its 1-year transit cycle from one sign to the next, it will move into a position casting direct divine aspect (drishti) upon your Lagna and cardinal houses. This divine Guru Bala combined with the upcoming Dasha shift will completely dissolve the previous delays and obstacles.`;
    const p3Timing = `Therefore, based on authentic astrological computation, with 98% certainty your ${timeline.topicLabel} is indicated to materialize ${timeline.rangeSummary}. During this favorable window, negotiations and opportunities will bear fruitful results. To welcome this auspicious planetary window with positive energy, offering prayers to Lord Mahabaleshwara at Sri Kshetra Gokarna and lighting a pure cow-ghee lamp on Mondays or Thursdays will ensure steady fulfillment and divine protection.`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${activeDosha.doshaName || "Karmic Dosha"
        } (${activeDosha.technicalWhy || "unfavorable placement in cardinal houses"}). To neutralize these adverse vibrations, our scriptures prescribe the sacred ${activeDosha.recommendedPooja || "Sri Kshetra Gokarna Shanti Pooja and Rudrabhisheka"
        }. We reassure you with certainty that performing this sacred pooja will bring noticeable improvement. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child (< 18 yrs) -> Address Parents Reverently
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `Regarding your inquiry on "${question}", examining the child's 4th house of education (${house4Sign}) and 5th house of intellect (${house5Sign}) along with ruling planet ${house4Lord}, the chart reveals strong latent potential that will blossom wonderfully with patient, nurturing encouragement.`
      : `Dear Parents, examining the sacred birth chart of your child (${session.name}) calculated with Baggona Panchanga, the child is born in ${lagna} Lagna and ${rashi} Moon sign with ${nakshatra} Nakshatra. The child's natural temperament is shaped by the ${tatvaEn} element and ${ganaEn} Gana: ${psychNatureEn || "curious, perceptive, and sensitive"}. Regarding your inquiry on "${question}", the child's 4th house of education (${house4Sign}) and 5th house of intellect (${house5Sign}) indicate tremendous latent potential that will blossom wonderfully with patient, nurturing encouragement.`;
    const p2Child = `Looking into the child's cognitive focus and memory retention, ruling planet ${house4Lord} governs grasping power and foundational learning. Occasional restlessness, exam anxiety, or playful distraction is a natural expression of this astrological temperament. As mindful parents, avoiding comparative pressure or harsh discipline and instead creating an organized, peaceful study atmosphere will produce remarkable academic excellence. The prevailing period of ${dasha} actively supports cognitive growth.`;
    const p3Child = `For physical immunity, academic sharpness, and protection against the evil eye (drishti dosha), lighting a pure cow-ghee lamp at study time and chanting the sacred Maha Saraswati Gayatri or Medha Sukta is highly auspicious. Offering prayers at Sri Kshetra Gokarna Mahaganapati for the child's well-being will bestow razor-sharp concentration, academic success, and long life.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nAs previously noted in the child's astrological analysis, the prevailing ${activeDosha.doshaName} is harmonized through sacred prayers and divine blessings at Sri Kshetra Gokarna.`);
      }
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination reveals the presence of ${activeDosha.doshaName || "Karmic Dosha"
        }. This dosha arose because of specific planetary tensions in the child's chart (${activeDosha.technicalWhy || "unfavorable aspect on cardinal houses"
        }), which can manifest as occasional health vulnerability, stubbornness, or exam nervousness. To neutralize these adverse vibrations, our scriptures prescribe the sacred ${activeDosha.recommendedPooja ||
        "Sri Kshetra Gokarna Medha Sukta & Maha Saraswati Vidya Pooja"
        }. Performing this sacred pooja will bring peace of mind, sharp memory, and protective blessings to your child. Please directly call chief priest Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and perform this parihara.`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana / Progeny / Childbirth Query
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `Regarding your inquiry on progeny and conception ("${question}"), examining your 5th house of progeny (${house5Sign}) and Putrakaraka Jupiter (Guru), this phase indicates a temporary karmic transit delay that demands emotional calm and mutual harmony alongside medical care.`
      : `My child ${session.name}, I understand the deep yearning, emotional anxiety, and societal questions surrounding progeny and conceiving a child in your marital life. According to your birth chart calculated with Baggona Panchanga (${lagna} Lagna, ${rashi} Moon Sign with ${nakshatra} Nakshatra), your 5th house of progeny (${house5Sign}) and Putrakaraka Jupiter (Guru) are undergoing a karmic testing phase, which explains the temporary delay despite medical normalcy.`;
    const p2Santhana = `Examining the 5th house lord (${house5Lord}) and the current Vimshottari period of ${dasha}, planetary tensions have created energetic friction in conceiving. In Vedic wisdom, conception requires the harmonious union of medical health and celestial grace (Daiva Bala). Shed all despondency and mutual blame. When the appropriate karmic remedies are conducted, the doors of parenthood will surely open wide.`;
    const p3Santhana = `Upcoming planetary transits over the next lunar cycles indicate a fertile and auspicious turning point. Maintain physical vitality through pure sattvic nourishment and mutual affection. For divine blessings of noble progeny, chanting the Sri Santhana Gopala Mantra daily with devotion will dissolve all reproductive anxieties and herald joyous news.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\nAs noted earlier, the energetic influences of ${activeDosha.doshaName} are completely addressed through sincere prayers and divine grace at Sri Kshetra Gokarna.`);
      }
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${activeDosha.doshaName || "Santhana Obstacle & 5th House Progeny Constraint"
        }. This dosha arose because of specific planetary tensions in your chart (${activeDosha.technicalWhy || "unfavorable placement in 5th house"
        }), which is actively manifesting in your life right now as persistent delays in childbirth. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${activeDosha.recommendedPooja ||
        "Sri Kshetra Gokarna Santhana Gopala Maha Homa & Naga Pratishtha"
        }. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement and joyous progeny blessing. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate / Sexuality Query
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|വ്യഭിചാരം|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `Regarding your path to liberation and dignity ("${question}"), in the sacred realm of Vedic Jyotisha and the holy feet of Lord Mahabaleshwara at Sri Kshetra Gokarna, no human soul is impure or forever condemned. The affliction of your 8th house (Guhya) and 7th house by Rahu and Mars under coercive debt will dissolve as the incoming Gochara Guru aspect restores your honor.`
        : `100% Truthful Daivajna Assurance: In the divine presence of Lord Mahabaleshwara at Sri Kshetra Gokarna, no human soul is impure, forsaken, or permanently cursed; according to your birth chart, the incoming benefic transit of Jupiter will break the bonds of this dark circumstance and bless you with a respectable, dignified married life! My child ${session.name}, hearing your deep pain, I receive your truth with fatherly tenderness and zero moral judgment. In our Sanatana tradition, revered souls like Pingala and Amrapali proved that past karmic trials or worldly coercion do not diminish the radiant purity of the Atman.`;
      const p2SexWork = `Examining your 8th house of secret vulnerabilities, 7th house of partnerships, and 6th house of debt entrapment (Rina), planetary calculations confirm that you were driven into this coercive environment by economic helplessness, not intrinsic evil. Astrological transits confirm that the forthcoming shift into benefic Jupiter's drishti and a favorable Dasha transition will break these coercive shackles. Take firm steps toward your physical health, undergo medical screenings without fear, and reach out to trusted women's shelter and legal aid organizations.`;
      const p3SexWork = `To permanently dissolve the karmic bonds of debt and seek divine sanctuary, offer a sacred Rudrabhisheka to Lord Mahabaleshwara at Sri Kshetra Gokarna and chant the sacred Sri Mahagauri / Durga Stotra along with the Sri Runavimochana Stotra daily. Mother Mahagauri dispels all distress and envelops her daughters in divine protection, ensuring that you will step into a peaceful, dignified marriage and a blessed family life.`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: An examination of your chart reveals karmic planetary tension (${activeDosha.doshaName || "Karmic Debt & Rina Dosha"}). To permanently neutralize these adverse vibrations and grant you a safe sanctuary, our scriptures prescribe the sacred ${activeDosha.recommendedPooja || "Sri Kshetra Gokarna Mahabaleshwara Rudrabhisheka and Chandi Shanti"}. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) for personal pastoral guidance.`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `Regarding this intimate matter ("${question}"), in Vedic Jyotisha, the placement of Shukra (Venus), the 7th house of harmony, and the 8th house govern these private vital energies. Approaching this with scientific calm rather than guilt is the key to restoration.`
      : `Dear ${session.name}, in the Vedic worldview, Kama (vital desire, healthy intimacy, and conjugal pleasure) is revered as one of the four sacred Purusharthas. In our society, people often feel immense shyness, taboo, or guilt regarding sexual vitality and bedroom discord. Please be at total ease. As an experienced Vedic astrologer, I view this with fatherly compassion and scientific clarity. Your ${lagna} Lagna and the placement of Shukra (Venus) govern your emotional and vital responses.`;
    const p2Intimate = `In your astrological chart, the 8th house governs reproductive vitality, the 7th house rules conjugal harmony, and the 12th house oversees bedroom tranquility (shayana sukha). Under the running period of ${dasha}, mental exhaustion, performance anxiety, and nervous fatigue are causing temporary fluctuation in Shukra Dhatu (vitality). This is strictly a temporary psychosomatic stress imbalance, not a permanent defect. Releasing toxic guilt and adopting an Ayurvedic regimen of Ashwagandha, milk, and pranayama will rejuvenate your vigor.`;
    const p3Intimate = `Over the upcoming transit cycle, emotional bonding with your partner will deepen. Approach intimacy with calm affection rather than pressure. Offering sacred cow-milk prayers to Lord Mahabaleshwara at Sri Kshetra Gokarna will harmonize hormonal balance, bestow peaceful sleep, and restore deep romantic harmony in your relationship.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\nAs previously guided, honoring the sacred parihara for ${activeDosha.doshaName} will restore inner peace and tranquility.`);
      }
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: An examination of your chart reveals the presence of ${activeDosha.doshaName || "Karmic Dosha"
        } (${activeDosha.technicalWhy || "planetary stress on cardinal houses"}). To restore tranquil intimacy and vitality, our scriptures prescribe the sacred ${activeDosha.recommendedPooja ||
        "Sri Kshetra Gokarna Mahabaleshwara Rudrabhisheka"
        }. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) for personal guidance.`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `Regarding your career and workplace concerns ("${question}"), the active period of ${dasha} combined with ${shaniText} is currently demanding endurance and perseverance. Examining your 10th house of profession (governed by ${karmaLord}), temporary delays are testing your resolve rather than blocking your long-term success.`
      : `My child ${session.name}, I understand the burden, anxiety, and frustration you are feeling in your career right now. According to your birth chart calculated with Baggona Panchanga (${lagna} Lagna, ${rashi} Moon Sign with ${nakshatra} Nakshatra), your inborn nature is characterized by the ${tatvaEn} element and ${ganaEn} Gana: ${psychNatureEn || "deeply capable and hardworking"}. This difficult phase is a celestial churning. The active period of ${dasha} combined with ${shaniText} is testing your endurance, which explains why workplace recognition has been delayed despite your earnest efforts.`;
    const p2Career = `Examining your 10th house of profession (ruled by ${karmaLord}) and the 6th house of obstacles, the cosmic energies are demanding patience rather than impulsive reactions. Just as a builder deepens the foundation during monsoon rains before raising higher floors safely, this demanding phase is strengthening your core resilience. Avoid hasty resignations or heated workplace friction, as forthcoming planetary movements favor stability, long-term investments, and collaborative harmony.`;
    const p3Career = `The planetary transits over the coming lunar cycles indicate a progressive turning point. When Jupiter casts its divine benefic aspect upon your key natal houses, the confusion that clouded your decisions will dissolve into crystalline clarity. Continue your earnest efforts with disciplined patience, for the cosmic timing is aligning to reward your dedication.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\nAs noted in your chart, the obstacles of ${activeDosha.doshaName} are mitigated by maintaining patience and receiving the sacred blessings of Sri Kshetra Gokarna.`);
      }
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${activeDosha.doshaName || "Karmic Dosha"
        }. This dosha arose because of specific planetary tensions in your chart (${activeDosha.technicalWhy || "unfavorable placement in cardinal houses"
        }), which is actively manifesting in your life right now as persistent delays, unexpected obstacles, and emotional restlessness. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${activeDosha.recommendedPooja ||
        "Sri Kshetra Gokarna Shanti Pooja and Rudrabhisheka"
        }. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement, peace, and auspicious results in your life. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  const baseP1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} Examining the planetary combinations and the running period governed by ${dasha}, the cosmic influences are directing steady progress in ${timeline?.topicLabel || "your situation"}. The ruling planet of your ascendant provides strong foundational resilience.`
      : isSubsequent
        ? `Regarding your inquiry on "${question}", planetary combinations indicate that the current period governed by ${dasha} is bringing pivotal transformations. The ruling planet of your ascendant provides strong foundational resilience, while transiting planetary aspects require calm patience in key decisions.`
        : `Namaste ${session.name}. According to your birth chart calculated with Baggona Panchanga, you are born in ${lagna} Lagna and ${rashi} Moon Sign with ${nakshatra} Nakshatra (${tatvaEn} element, ${ganaEn} Gana). Regarding your question on "${question}", your planetary combinations indicate that the current period governed by ${dasha} is bringing significant pivotal transformations. The ruling planet of your ascendant provides strong foundational resilience, while transiting Jupiter and Saturn require patience in key negotiations.`;
  const baseP2 = `In the realm of your personal and professional endeavors, your chart reveals gradual clearance of previous hurdles. Much like a fruit sweetening naturally on the branch only when its season arrives, your steady effort is maturing toward lasting fulfillment in job, enterprise, and home harmony. Maintaining mental equilibrium and avoiding hasty impulsive commitments during this cycle will unlock substantial prosperity.`;
  const baseP3 = `The planetary transits over the coming lunar cycles indicate a progressive turning point. When Jupiter casts its divine benefic aspect upon your key natal houses, the confusion that clouded your decisions will dissolve into crystalline clarity. Continue your earnest efforts with disciplined patience, for the cosmic timing is aligning to reward your dedication.`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\nAs noted in your horoscope, the karmic influences of ${activeDosha.doshaName} are neutralized through dedicated prayers at Sri Kshetra Gokarna.`);
    }
    const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${activeDosha.doshaName || "Kuja/Manglik Dosha"
      }. This dosha arose because of specific planetary tensions in your chart (${activeDosha.technicalWhy || "unfavorable placement in cardinal houses"
      }), which is actively manifesting in your life right now as persistent delays, unexpected obstacles, and emotional restlessness. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${activeDosha.recommendedPooja ||
      "Sri Kshetra Gokarna Shanti Pooja and Rudrabhisheka"
      }. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement, peace, and auspicious results in your life. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
    return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`);
  }

  return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\nFor divine grace and obstacle removal, it is auspicious to offer prayers to Sri Mahabaleshwara and Lord Ganapati at Sri Kshetra Gokarna. Reciting the sacred Gayatri Mantra and lighting a pure cow-ghee lamp on Mondays or Saturdays will harmonize the prevailing planetary energies and bring peace and success.`);
}

export function buildKannadaFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatva,
    gana,
    psychNature,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord,
    localizedDevoteeName
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`ಹೌದು, ನಾನು ನಿಮ್ಮೊಂದಿಗೇ ಈ ಸಮಾಲೋಚನಾ ಕೊಠಡಿಯಲ್ಲಿದ್ದೇನೆ. ನಿಮ್ಮ ಮುಂದಿನ ಪ್ರಶ್ನೆ ಅಥವಾ ಗೊಂದಲವನ್ನು ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ.`);
    }
    return deduplicateResponseText(`ಹರಿ ಓಂ ${localizedDevoteeName} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಕಲ ಕೃಪಾಕಟಾಕ್ಷ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೇಲೆ ಸದಾ ಇರಲಿ.\n\nನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಕೊಠಡಿಯಲ್ಲಿ ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಯಾವುದೇ ಗೊಂದಲ, ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ, ವಿವಾಹ, ಕೌಟುಂಬಿಕ ವಿಚಾರ ಅಥವಾ ದೋಷ ಪರಿಹಾರಗಳ ಕುರಿತು ಮುಕ್ತವಾಗಿ ಪ್ರಶ್ನಿಸಿ.`);
  }

  // Proof Follow-Up
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("kn", ctx);
  }

  // Timing / Intelligent Follow-Up on Marriage, Career, Progeny, etc.
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /ಯಾವಾಗ|ಎಷ್ಟು ದಿನ|ಎಷ್ಟು ತಿಂಗಳು|ಕಾಲಾವಕಾಶ|ಯಾವ ವರ್ಷ|ಯಾವ ತಿಂಗಳು/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} ಜಾತಕದ ಸಪ್ತಮ/ಸಂಬಂಧಿತ ಭಾವಗಳು ಹಾಗೂ ಶುಭ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಂಚಾರವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ${timeline.topicLabel} ಕಾರ್ಯಕ್ಕೆ ಕಾಲಾನುಕೂಲವು ಈಗ ಸನ್ನಿಹಿತವಾಗುತ್ತಿದೆ.`
        : isSubsequent
          ? `೧೦೦% ಖಚಿತ ಜಾತಕ ನಿರ್ಣಯ: ಶೇಕಡಾ ೯೮ ರಷ್ಟು ನಿಖರತೆಯೊಂದಿಗೆ ನಿಮ್ಮ ${timeline.topicLabel} ${timeline.rangeSummary} ಸಾಕಾರಗೊಳ್ಳಲಿದೆ. ಜಾತಕದಲ್ಲಿ ${timeline.topicYogaName} ಹಾಗೂ ಸಂಬಂಧಿತ ಭಾವಗಳ ಗೋಚಾರ ಸಂಚಾರವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಕಾಲಾನುಕೂಲವು ಈಗ ಸನ್ನಿಹಿತವಾಗುತ್ತಿದೆ.`
          : `೧೦೦% ಖಚಿತ ಜಾತಕ ನಿರ್ಣಯ: ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಶಾಸ್ತ್ರೋಕ್ತ ಲೆಕ್ಕಾಚಾರದಂತೆ, ಶೇಕಡಾ ೯೮ ರಷ್ಟು ನಿಖರತೆಯೊಂದಿಗೆ ನಿಮ್ಮ ${timeline.topicLabel} ${timeline.rangeSummary} ನಿಶ್ಚಿತವಾಗಿ ನೆರವೇರಲಿದೆ! ಆತ್ಮೀಯ ${localizedDevoteeName} ಅವರೇ, ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿ ಹಾಗೂ ${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ್ದು, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿ ಮತ್ತು ${timeline.topicYogaName} ಯೋಗದ ಗೋಚಾರ ಸಂಚಾರವು ಈ ಶುಭ ಕಾಲಾವಧಿಯನ್ನು ಬಲವಾಗಿ ಸಮರ್ಥಿಸುತ್ತಿದೆ.`;
    const p2Timing = `ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಗಣಿತದ ಪ್ರಕಾರ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${timeline.currentMahaName}-${timeline.currentBhuktiName} ಅವಧಿಯು ಇನ್ನು ${timeline.monthsToDashaChange} ತಿಂಗಳುಗಳಲ್ಲಿ ಮುಕ್ತಾಯವಾಗಿ ${timeline.nextBhuktiName} ಭುಕ್ತಿಯಾಗಿ ಪರಿವರ್ತನೆ ಹೊಂದಲಿದೆ. ಇದರೊಂದಿಗೆ, ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಸುಮಾರು ಒಂದು ವರ್ಷದ ಅವಧಿಯಲ್ಲಿ ಒಂದು ರಾಶಿಯಿಂದ ಮತ್ತೊಂದು ರಾಶಿಗೆ ಸಂಚರಿಸುವುದರಿಂದ, ಮುಂದಿನ ಒಂದು ವರ್ಷದೊಳಗೆ ಗುರು ಗ್ರಹವು ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ತ್ರಿಕೋಣ/ಕೇಂದ್ರ ಸ್ಥಾನಗಳ ಮೇಲೆ ನೇರ ಶುಭ ದೃಷ್ಟಿಯನ್ನು ಬೀರಲಿದೆ. ಈ ಗುರುಬಲ ಹಾಗೂ ದಶಾ-ಭುಕ್ತಿ ಸಂಯೋಗವು ಹಿಂದಿದ್ದ ಸಮಸ್ತ ವಿಳಂಬಗಳನ್ನು ನಿವಾರಿಸಿ ಹೊಸ ಅವಕಾಶಗಳ ಮಾರ್ಗವನ್ನು ತೆರೆಯಲಿದೆ.`;
    const p3Timing = `ಆದ್ದರಿಂದ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಶಾಸ್ತ್ರೋಕ್ತ ಲೆಕ್ಕಾಚಾರದಂತೆ ಶೇಕಡಾ ೯೮ ರಷ್ಟು ನಿಖರ ಸಂಭವನೀಯತೆಯೊಂದಿಗೆ ನಿಮ್ಮ ${timeline.topicLabel} ${timeline.rangeSummary} ನಿಶ್ಚಿತವಾಗಿ ನೆರವೇರುವ ಪ್ರಬಲ ಯೋಗವಿದೆ. ಈ ಶುಭ ಕಾಲಾವಧಿಯು ಸಾಕಾರಗೊಳ್ಳಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ, ಸೋಮವಾರದಂದು ಗೋಸೇವೆ ಅಥವಾ ದೀಪಾರಾಧನೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ"
        }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${activeDosha.technicalWhy || "ಗ್ರಹಗಳ ಅಶುಭ ಸಂಯೋಜನೆ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
        } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${activeDosha.currentLifeProblems || "ಕಾರ್ಯವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ವಿಪರೀತ ಅಡೆತಡೆಗಳು"
        }" ಎದುರಾಗುತ್ತಿವೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿ ಹೋಮ"
        }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಖಂಡಿತವಾಗಿಯೂ ಧನಾತ್ಮಕ ಸುಧಾರಣೆ ಮತ್ತು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳ ಸಿದ್ಧಿ ಗೋಚರಿಸುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child (< 18 yrs) -> Address Parents Reverently
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `ಮಗುವಿನ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದಲ್ಲಿ ೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ (${house4Sign}) ಹಾಗೂ ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಗಳನ್ನು (${house5Sign}) ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ವಿದ್ಯಾಧಿಪತಿಯಾದ ${house4Lord} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಮಗುವಿನಲ್ಲಿ ಉತ್ತಮ ಕಲಿಯುವ ಆಸಕ್ತಿಯಿದೆ. ತಾಳ್ಮೆಯಿಂದ ಪ್ರೋತ್ಸಾಹಿಸಿದರೆ ಮಗುವು ಶೈಕ್ಷಣಿಕವಾಗಿ ಉತ್ತಮ ಯಶಸ್ಸು ಸಾಧಿಸಲಿದೆ.`
      : `ಆತ್ಮೀಯ ಪೋಷಕರೇ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಶಾಸ್ತ್ರೋಕ್ತ ಗಣಿತದ ಪ್ರಕಾರ ನಿಮ್ಮ ಮಗುವಿನ (${localizedDevoteeName}) ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಮಗುವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿ ಹಾಗೂ ${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನ್ಮತಾಳಿದೆ. ಮಗುವಿನ ಲಗ್ನ ತತ್ವವಾದ ${tatva} ಹಾಗೂ ${gana} ಗಣದ ಪ್ರಭಾವದಿಂದಾಗಿ ಮಗುವಿನಲ್ಲಿ ${psychNature || "ಚುರುಕಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಸಹಜ ಕುತೂಹಲ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ"} ಎದ್ದು ಕಾಣುತ್ತದೆ. ನಿಮ್ಮ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ (${house4Sign}) ಹಾಗೂ ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಗಳು (${house5Sign}) ಅತ್ಯಂತ ಚೇತನವಾಗಿದ್ದು, ಮಗುವಿನ ಅಂತರಂಗದಲ್ಲಿ ಅಪಾರವಾದ ಸುಪ್ತ ಪ್ರತಿಭೆ ಅಡಗಿದೆ.`;
    const p2Child = `ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಗ್ರಹಣ ಶಕ್ತಿಯ ವಿಚಾರದಲ್ಲಿ ೪ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${house4Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಮಗುವಿಗೆ ವಿಷಯಗಳನ್ನು ಬೇಗನೆ ಗ್ರಹಿಸುವ ಅದ್ಭುತ ಶಕ್ತಿಯಿದೆ. ಆದರೆ ಮನಸ್ಸು ಒಮ್ಮೊಮ್ಮೆ ಚಂಚಲಗೊಳ್ಳುವುದು, ಆಟದ ಕಡೆಗೆ ಆಕರ್ಷಿತವಾಗುವುದು ಹಾಗೂ ಪೋಷಕರ ಮಾತಿಗೆ ಹಠ ಮಾಡುವುದು ಈ ವಯಸ್ಸಿನ ಸಹಜ ಲಕ್ಷಣ. ಪೋಷಕರಾಗಿ ನೀವು ಮಗುವಿನ ಮೇಲೆ ಅನಗತ್ಯ ಶೈಕ್ಷಣಿಕ ಒತ್ತಡ ಅಥವಾ ಕಠಿಣ ಶಿಕ್ಷೆಗಳನ್ನು ಹೇರದೆ, ಪ್ರೀತಿ, ಸಮಾಧಾನ ಹಾಗೂ ನಿಗದಿತ ಸಮಯದ ದಿನಚರಿಯನ್ನು ರೂಢಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯು ಮಗುವಿನ ಬೌದ್ಧಿಕ ವಿಕಾಸಕ್ಕೆ ಉತ್ತಮ ತಳಹದಿ ಹಾಕಲಿದೆ.`;
    const p3Child = `ಮಗುವಿನ ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಏಕಾಗ್ರತೆಗಾಗಿ, ಪ್ರತಿದಿನ ಸಂಜೆ ಮನೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಮಹಾಸರಸ್ವತೀ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಸಂಕಲ್ಪ ಮಾಡಿ ದೂರ್ವಾ ಅರ್ಚನೆ ಮಾಡಿಸುವುದರಿಂದ ಮಗುವಿನ ಜ್ಞಾಪಕ ಶಕ್ತಿ ವೃದ್ಧಿಸಿ, ಶೈಕ್ಷಣಿಕ ವಿಜಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ ಲಭಿಸಲಿದೆ.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ಮೊದಲೇ ತಿಳಿಸಿದಂತೆ ${activeDosha.doshaName} ಪ್ರಭಾವವಿದ್ದು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಹಾಗೂ ಪೂಜೆಯಿಂದ ಸಕಲ ವಿಘ್ನಗಳೂ ನಿವಾರಣೆಯಾಗಿ ಮಗುವಿಗೆ ಉತ್ತಮ ಆರೋಗ್ಯ ಮತ್ತು ವಿದ್ಯಾಭ್ಯಾಸ ಲಭಿಸಲಿದೆ.`);
      }
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nಮಗುವಿನ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಬಾಲ ಸಂಸ್ಕಾರ ಹಾಗೂ ವಿದ್ಯಾ ದೋಷ"
        }" ಕಂಡುಬಂದಿದೆ. ಜಾತಕದಲ್ಲಿ ${activeDosha.technicalWhy || "ಗ್ರಹಗಳ ಅಶುಭ ಸ್ಥಾನ ಹಾಗೂ ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
        } ಈ ಪ್ರಭಾವ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿ "${activeDosha.currentLifeProblems || "ಓದಿನಲ್ಲಿ ಚಂಚಲತೆ ಹಾಗೂ ಪರೀಕ್ಷಾ ಆತಂಕ"
        }" ಗೋಚರಿಸುತ್ತದೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಸರಸ್ವತೀ ಹಾಗೂ ಮೇಧಾ ಸೂಕ್ತ ಶಾಂತಿ ಪೂಜೆ"
        }" ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಈ ಪೂಜೆಯಿಂದ ಮಗುವಿಗೆ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ ಲಭಿಸುವುದು ನಿಶ್ಚಿತ. ಹೆಚ್ಚಿನ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ಪುರೋಹಿತರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana / Progeny / Childbirth Query
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `ಸಂತಾನ ಭಾಗ್ಯದ ಕುರಿತಾದ ನಿಮ್ಮ "${question}" ಎಂಬ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನವನ್ನು (${house5Sign}) ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${house5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗೋಚಾರ ಗ್ರಹಗಳು ತಾತ್ಕಾಲಿಕ ವಿಳಂಬವನ್ನು ಉಂಟುಮಾಡುತ್ತಿವೆ. ವೈದ್ಯಕೀಯ ಪ್ರಯತ್ನಗಳ ಜೊತೆಗೆ ಸೂಕ್ತ ದೈವಾನುಗ್ರಹ ಸಿದ್ಧಿಸಿದಾಗ ಸಂತಾನ ಯೋಗವು ಖಂಡಿತ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
      : `ಮಗುವೇ ${localizedDevoteeName}, ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಪುತ್ರ ಪ್ರಾಪ್ತಿಯ ಕುರಿತು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಆಳವಾದ ಕಳವಳ ಹಾಗೂ ನಿರೀಕ್ಷೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಬಲ್ಲೆ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಜ್ಯೋತಿಷ್ಯ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದು, ನಿಮ್ಮ ಸಹಜ ಸ್ವಭಾವವು ${tatva} ತತ್ವ ಹಾಗೂ ${gana} ಗಣದಿಂದ ಕೂಡಿದೆ. ನಿಮ್ಮ ಜಾತಕದ ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನವನ್ನು (${house5Sign}) ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸ್ಥಿತಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ಕಾಲದ ತಾತ್ಕಾಲಿಕ ವಿಳಂಬ ಗೋಚರಿಸುತ್ತಿದೆ.`;
    const p2Santhana = `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮಾಧಿಪತಿಯಾದ ${house5Lord} ಗ್ರಹದ ಸ್ಥಿತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗೋಚಾರ ಗ್ರಹಗಳ ಪರೀಕ್ಷೆಯು ತಾತ್ಕಾಲಿಕ ಅಡೆತಡೆಗಳನ್ನು ಉಂಟುಮಾಡಿದೆ. ವೈದ್ಯಕೀಯ ಪ್ರಯತ್ನಗಳ ಜೊತೆಗೆ ದೈವಬಲವು ಜೋಡಿಯಾದಾಗ ಮಾತ್ರವೇ ಸೃಷ್ಟಿಕಾರಕ ಶಕ್ತಿ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ನಿಮ್ಮ ಅಥವಾ ನಿಮ್ಮ ಸಂಗಾತಿಯ ಮನಸ್ಸಿನಲ್ಲಿರುವ ನಕಾರಾತ್ಮಕ ನಿರಾಶೆಯನ್ನು ತಕ್ಷಣವೇ ದೂರಮಾಡಿ. ಜಾತಕದಲ್ಲಿರುವ ಕರ್ಮ ತಡೆಗಳನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಿವಾರಿಸಿದಾಗ ಸಂತಾನ ಭಾಗ್ಯದ ಬಾಗಿಲು ಖಂಡಿತವಾಗಿಯೂ ತೆರೆಯಲಿದೆ.`;
    const p3Santhana = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗುರು ಗ್ರಹದ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಸಂತಾನ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳುವ ಸಂದರ್ಭದಲ್ಲಿ ಗರ್ಭಧಾರಣೆ ಹಾಗೂ ಸಂತಾನ ಯೋಗವು ಪ್ರಬಲವಾಗಿ ಸಿದ್ಧಿಸಲಿದೆ. ದಂಪತಿಗಳಿಬ್ಬರೂ ಪ್ರತಿ ಗುರುವಾರ ಶುದ್ಧ ಹಸುವಿನ ಹಾಲಿನಿಂದ ಮಾಡಿದ ನೈವೇದ್ಯವನ್ನು ಸಮರ್ಪಿಸಿ, ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ. ಮನಸ್ಸಿನಲ್ಲಿ ಧನಾತ್ಮಕ ವಿಶ್ವಾಸವಿರಲಿ.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\nನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮೊದಲೇ ತಿಳಿಸಿದಂತೆ ${activeDosha.doshaName} ಪ್ರಭಾವವಿದ್ದು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಹಾಗೂ ಪೂಜೆಯಿಂದ ಸಕಲ ಅಡೆತಡೆಗಳೂ ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರವೇ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`);
      }
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಸಂತಾನ ತಡೆ ಹಾಗೂ ಪಂಚಮ ಭಾವ ಕರ್ಮ ದೋಷ"
        }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${activeDosha.technicalWhy || "ಪಂಚಮ ಭಾವ ಹಾಗೂ ಗುರುವಿನ ಮೇಲಿನ ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದ"
        } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${activeDosha.currentLifeProblems || "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ಅಡೆತಡೆ ಹಾಗೂ ತೀವ್ರ ಮಾನಸಿಕ ಚಿಂತೆ"
        }" ಎದುರಾಗುತ್ತಿದೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja ||
        "ಸಂತಾನ ಗೋಪಾಲ ಮಹಾಹೋಮ ಹಾಗೂ ನಾಗ ಪ್ರತಿಷ್ಠಾ ಸಹಿತ ಮಹಾರುದ್ರಾಭಿಷೇಕ"
        }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ದಾಂಪತ್ಯದಲ್ಲಿ ಶೀಘ್ರವೇ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಾಗುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate / Sexuality Query
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|വ്യഭിചാരം|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `ವಿಮೋಚನೆ ಹಾಗೂ ಗೌರವಯುತ ಬದುಕಿನ ಈ ವಿಚಾರಣೆಗೆ ("${question}") ಸಂಬಂಧಿಸಿದಂತೆ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಯಾವ ಜೀವವೂ ಅಶುದ್ಧವಲ್ಲ ಅಥವಾ ಎಂದಿಗೂ ಶಾಪಗ್ರಸ್ತವಲ್ಲ. ಜಾತಕದ ೮ನೇ ಗುಪ್ತಸ್ಥಾನ ಹಾಗೂ ೭ನೇ ಭಾವಗಳ ಮೇಲಿನ ರಾಹು-ಕುಜರ ಋಣಬಂಧನವು ಮುಂಬರುವ ಗುರು ಗೋಚಾರದಿಂದ ಕಳಚಿಕೊಂಡು ಗೌರವದ ಹಾದಿ ನಿರ್ಮಾಣವಾಗಲಿದೆ.`
        : `೧೦೦% ಸತ್ಯನಿಷ್ಠ ದೈವಜ್ಞ ಅಭಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಯಾವ ಜೀವವೂ ಅಶುದ್ಧವಲ್ಲ, ಎಂದಿಗೂ ತಿರಸ್ಕೃತವಲ್ಲ; ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ ಮುಂಬರುವ ಗುರು ಗ್ರಹದ ಶುಭ ಸಂಚಾರವು ಈ ಸಂಕೋಲೆಗಳನ್ನು ಮುರಿದು ನಿಮಗೆ ಗೌರವಯುತ, ಶಾಂತಿಯುತ ವಿವಾಹ ಹಾಗೂ ಸಂಸಾರ ಭಾಗ್ಯವನ್ನು ಕರುಣಿಸಲಿದೆ! ಮಗುವೇ ${localizedDevoteeName}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ತೀವ್ರ ವೇದನೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಅತೀವ ವಾತ್ಸಲ್ಯದಿಂದ, ಯಾವುದೇ ಲವಲೇಶದ ಕೀಳರಿಮೆ ಅಥವಾ ಸೋಗಲಾಡಿತನವಿಲ್ಲದೆ ಸ್ವೀಕರಿಸುತ್ತಿದ್ದೇನೆ. ಸನಾತನ ಪರಂಪರೆಯಲ್ಲಿ ಭಾಗವತದ ಪಿಂಗಳೆ ಹಾಗೂ ಆಮ್ರಪಾಲಿ ಅಂತಹ ಆತ್ಮಗಳು ಸಂಸಾರದ ಒತ್ತಡ-ಸಂಕಟಗಳನ್ನು ಮೀರಿ ಮುಕ್ತಿ ಮತ್ತು ದೈವ ಕೃಪೆ ಪಡೆದ ದೃಷ್ಟಾಂತಗಳಿವೆ.`;
      const p2SexWork = `ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಜಾತಕದ ೮ನೇ ಗುಪ್ತ ರಹಸ್ಯ ಸ್ಥಾನ, ೭ನೇ ಕಾಮ-ವ್ಯಾಪಾರ ಸ್ಥಾನ ಹಾಗೂ ೬ನೇ ಋಣ-ಬಂಧನ ಸ್ಥಾನಗಳನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನೀವು ಯಾವುದೇ ಆಂತರಿಕ ದುಷ್ಟತನದಿಂದಲ್ಲದೆ ಆರ್ಥಿಕ ಅಸಹಾಯಕತೆ ಮತ್ತು ಕುಟುಂಬದ ಋಣಭಾರದಿಂದ ಈ ವಿಷವರ್ತುಲಕ್ಕೆ ಸಿಲುಕಿದ್ದೀರಿ ಎಂಬುದು ಸ್ಪಷ್ಟವಾಗುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯ ನಂತರ ಬರುವ ಗುರು ದೃಷ್ಟಿಯು ನಿಮ್ಮನ್ನು ಈ ಕತ್ತಲೆಯಿಂದ ಮುಕ್ತಗೊಳಿಸಲಿದೆ. ಧೈರ್ಯದಿಂದ ಹೆಜ್ಜೆಯಿಡಿ, ನಿಮ್ಮ ಶಾರೀರಿಕ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನಿರ್ಲಕ್ಷ್ಯ ವಹಿಸದೆ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ ಹಾಗೂ ಮಹಿಳಾ ರಕ್ಷಣಾ ಆಶ್ರಯ ಮತ್ತು ಕಾನೂನು ನೆರವನ್ನು ಪಡೆಯಿರಿ.`;
      const p3SexWork = `ಋಣಬಂಧನ ಕಳಚಲು ಮತ್ತು ಆತ್ಮರಕ್ಷಣೆಗೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಗೌರಿ/ದುರ್ಗಾ ಸ್ತೋತ್ರ ಮತ್ತು ಋಣವಿಮೋಚನಾ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ. ಜಗನ್ಮಾತೆಯು ತನ್ನ ಹೆಣ್ಣುಮಕ್ಕಳನ್ನು ಸರ್ವ ಕಾಲದಲ್ಲೂ ರಕ್ಷಿಸುತ್ತಾಳೆ. ಶೀಘ್ರದಲ್ಲೇ ನಿಮಗೆ ಗೌರವಯುತ ಜೀವನ ಮತ್ತು ಉತ್ತಮ ಸಂಗಾತಿಯ ಆಸರೆ ಲಭಿಸಲಿದೆ.`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಋಣಬಂಧನ ಹಾಗೂ ಕರ್ಮ ದೋಷ"
          }" ಕಂಡುಬಂದಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಚಂಡೀ ಶಾಂತಿ"
          }" ನೆರವೇರಿಸುವುದರಿಂದ ಸರ್ವ ಬಂಧನಗಳೂ ಕಳಚಲಿವೆ. ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `ಅಂತರಂಗದ ಈ ವಿಚಾರಣೆಗೆ ("${question}") ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೮ನೇ ಗುಪ್ತಸ್ಥಾನ, ೭ನೇ ಭಾವ ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಇದು ನೈಸರ್ಗಿಕ ಶಾರೀರಿಕ ಮತ್ತು ಮಾನಸಿಕ ಸಂವೇದನೆಯ ವಿಷಯವಾಗಿದೆ. ಯಾವುದೇ ಅಪರಾಧಿ ಭಾವನೆಗೆ ಒಳಗಾಗದೆ, ಆಯುರ್ವೇದ ಪದ್ಧತಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿಯಿಂದ ಸಮತೋಲನ ಸಾಧಿಸುವುದು ಮುಖ್ಯ.`
      : `ಆತ್ಮೀಯ ${localizedDevoteeName} ಅವರೇ, ಮನುಷ್ಯನ ಜೀವನದಲ್ಲಿ ಅಂತರಂಗದ ಕಾಮನೆ, ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಲೈಂಗಿಕ ತೃಪ್ತಿಯು ಅತ್ಯಂತ ನೈಸರ್ಗಿಕವಾದ ಸಂಗತಿಯಾಗಿದೆ. ಇದನ್ನು ಸಮಾಜದಲ್ಲಿ ಯಾರ ಬಳಿಯೂ ಮುಕ್ತವಾಗಿ ಹೇಳಿಕೊಳ್ಳಲಾಗದೆ, ನಾಚಿಕೆ ಅಥವಾ ಅಪರಾಧ ಭಾವನೆಯಿಂದ ಮನಸ್ಸಿನಲ್ಲೇ ಕೊರಗುವುದು ಸಹಜ. ಆದರೆ ನೆನಪಿಡಿ, ಸನಾತನ ವೈದಿಕ ಪರಂಪರೆಯಲ್ಲಿ ಧರ್ಮ-ಅರ್ಥ-ಕಾಮ-ಮೋಕ್ಷ ಎಂಬ ನಾಲ್ಕು ಪುರುಷಾರ್ಥಗಳಲ್ಲಿ ಕಾಮವು ಸೃಷ್ಟಿ ಮತ್ತು ಜೀವನೋತ್ಸಾಹದ ಪವಿತ್ರ ಅಂಗವಾಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagna} ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಅಂತರಂಗದ ಸಂವೇದನೆಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತಿದೆ.`;
    const p2Intimate = `ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಜಾತಕದ ೮ನೇ ಮನೆಯಾದ ಗುಪ್ತಸ್ಥಾನ, ೭ನೇ ಕಾಮಸ್ಥಾನ ಹಾಗೂ ೧೨ನೇ ಶಯನ ಸುಖದ ಸ್ಥಾನಗಳನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯಲ್ಲಿ ಶಾರೀರಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡವು ಶುಕ್ರ ಧಾತುವಿನ ಸಮತೋಲನದ ಮೇಲೆ ತಾತ್ಕಾಲಿಕ ಪ್ರಭಾವ ಬೀರಿದೆ. ಅತಿಯಾದ ಮಾನಸಿಕ ಆತಂಕ, ಅಪರಾಧ ಭಾವ ಅಥವಾ ದಣಿವೇ ಲೈಂಗಿಕ ಶಕ್ತಿ ಕುಗ್ಗಲು ಮುಖ್ಯ ಕಾರಣವೇ ಹೊರತು ಯಾವುದೇ ಶಾಶ್ವತ ಕೊರತೆಯಲ್ಲ. ಆಯುರ್ವೇದ ಪದ್ಧತಿಯಂತೆ ಅಶ್ವಗಂಧ, ಶುದ್ಧ ಹಾಲು, ಸಾತ್ವಿಕ ಆಹಾರ ಮತ್ತು ಪ್ರಾಣಾಯಾಮವು ನಿಮ್ಮ ನರಮಂಡಲಕ್ಕೆ ಹೊಸ ಚೈತನ್ಯವನ್ನು ತುಂಬಲಿದೆ.`;
    const p3Intimate = `ಮನಸ್ಸಿನ ಆತಂಕವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಕಳಚಿಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಹಾಗೂ ಸೋಮವಾರದ ರುದ್ರಾಭಿಷೇಕವು ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡಿ, ದೈಹಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಚೈತನ್ಯವನ್ನು ಮರಳಿ ತರಲಿದೆ. ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ, ಗೌರವ ಮತ್ತು ಮುಕ್ತ ಸಂವಹನವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಿ.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\nನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮೊದಲೇ ತಿಳಿಸಿದಂತೆ ${activeDosha.doshaName} ಪ್ರಭಾವವಿದ್ದು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಹಾಗೂ ಪೂಜೆಯಿಂದ ಸಕಲ ಅಂತರಂಗದ ಕ್ಲೇಶಗಳೂ ನಿವಾರಣೆಯಾಗಿ ನೆಮ್ಮದಿ ಸಿಗಲಿದೆ.`);
      }
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಶುಕ್ರ ಧಾತು ಹಾಗೂ ಅಂತರಂಗ ಕ್ಲೇಶ ದೋಷ"
        }" ಕಂಡುಬಂದಿದೆ. ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಆಯುಷ್ಯ-ಆರೋಗ್ಯ ಶಾಂತಿ"
        }" ನೆರವೇರಿಸುವುದರಿಂದ ನರಮಂಡಲವು ಬಲಗೊಂಡು ಮನಸ್ಸಿಗೆ ನಿರಾಳತೆ ಸಿಗಲಿದೆ. ಹೆಚ್ಚಿನ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `ವೃತ್ತಿಜೀವನ ಹಾಗೂ ಉದ್ಯೋಗದ ಈ ಪ್ರಶ್ನೆಗೆ ("${question}") ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೧೦ನೇ ಕರ್ಮಸ್ಥಾನ (ಅಧಿಪತಿ: ${karmaLord}) ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯ ಸಂಯೋಗವನ್ನು ಗಮನಿಸಿದಾಗ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಒತ್ತಡ ಹಾಗೂ ಮಂಥನ ಕಂಡುಬರುತ್ತಿದೆ. ಇದು ನಿಮ್ಮ ಆಂತರಿಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಾಣೆ ಹಿಡಿಯುವ ಸಮಯವೇ ಹೊರತು ಶಾಶ್ವತ ಹಿನ್ನಡೆಯಲ್ಲ.`
      : `ಮಗುವೇ ${localizedDevoteeName}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಳವಳ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ (ಉದ್ಯೋಗ/ವ್ಯಾಪಾರ) ಎದುರಾಗುತ್ತಿರುವ ಕಿರಿಕಿರಿ ಮತ್ತು ಹತಾಶೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಬಲ್ಲೆ. ಜೀವನದಲ್ಲಿ ಇಂತಹ ಮಂಥನದ ಹಂತಗಳು ಬಂದಾಗ ಎಂತಹ ಧೀರರೂ ವಿಚಲಿತರಾಗುವುದು ಸಹಜ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಜ್ಯೋತಿಷ್ಯ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದು (${tatva} ತತ್ವ, ${gana} ಗಣ), ನಿಮ್ಮ ಸಹಜ ಗುಣವೇ ${psychNature || "ಶ್ರಮಜೀವಿ ಹಾಗೂ ಸ್ವಾಭಿಮಾನಿ"}. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಕಾಲಘಟ್ಟ ಹಾಗೂ ${shaniText}ಯು ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ಹೊಸ ಆತ್ಮಾವಲೋಕನವನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತಿದೆ.`;
    const p2Career = `ನಿಮ್ಮ ಜಾತಕದ ೧೦ನೇ ಮನೆಯಾದ ಕರ್ಮಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${karmaLord} ಗ್ರಹದ ಸ್ಥಿತಿ ಹಾಗೂ ೬ನೇ ಮನೆಯ ಸ್ಥಿತಿಗತಿಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ಶನಿ ಹಾಗೂ ಗೋಚಾರ ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅತಿಯಾದ ಒತ್ತಡ, ಸಹೋದ್ಯೋಗಿಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ ಹಾಗೂ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಡವಾಗುವ ವಾತಾವರಣ ನಿರ್ಮಾಣವಾಗಿದೆ. ಮನೆ ಕಟ್ಟುವಾಗ ಮಳೆಗಾಲದಲ್ಲಿ ತಳಪಾಯವನ್ನು ಆಳವಾಗಿ ಗಟ್ಟಿಗೊಳಿಸಿದ ನಂತರವೇ ಮೇಲಿನ ಮಹಡಿಗಳು ಭದ್ರವಾಗಿ ನಿಲ್ಲುವಂತೆ, ಈ ಪರೀಕ್ಷೆಯು ನಿಮ್ಮ ಭವಿಷ್ಯದ ಉನ್ನತಿಗೆ ಭದ್ರ ಬುನಾದಿ ಹಾಕುತ್ತಿದೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಕೋಪ ಅಥವಾ ಆತುರದಲ್ಲಿ ರಾಜೀನಾಮೆಯಂತಹ ಅವಸರದ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡಬೇಡಿ.`;
    const p3Career = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಕತ್ತಲೆ ಕರಗಿ ನಿಧಾನವಾಗಿ ಹೊಸ ಅವಕಾಶಗಳ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ. ಅಲ್ಲಿಯವರೆಗೂ ಶಾಂತಚಿತ್ತದಿಂದ ನಿಮ್ಮ ಕಾರ್ಯವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮುಂದುವರಿಸಿ. ಪ್ರತಿದಿನ ಶಿವಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ, ಪ್ರತಿ ಶನಿವಾರ ಅಥವಾ ಸೋಮವಾರ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸುವುದರಿಂದ ಮಾನಸಿಕ ಧೈರ್ಯ ಹೆಚ್ಚಿ, ಸಕಲ ವಿಘ್ನಗಳೂ ದೂರವಾಗಲಿವೆ.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\nನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮೊದಲೇ ತಿಳಿಸಿದಂತೆ ${activeDosha.doshaName} ಪ್ರಭಾವವಿದ್ದು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಹಾಗೂ ಪೂಜೆಯಿಂದ ಸಕಲ ಅಡೆತಡೆಗಳೂ ನಿವಾರಣೆಯಾಗಿ ಉದ್ಯೋಗ-ವೃತ್ತಿಯಲ್ಲಿ ಯಶಸ್ಸು ಲಭಿಸುವುದು ನಿಶ್ಚಿತ.`);
      }
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ"
        }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${activeDosha.technicalWhy ||
        "ಗ್ರಹಗಳ ಅಶುಭ ಸಂಯೋಜನೆ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
        } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${activeDosha.currentLifeProblems ||
        "ಕಾರ್ಯವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ವಿಪರೀತ ಅಡೆತಡೆಗಳು"
        }" ಎದುರಾಗುತ್ತಿವೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja ||
        "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿ ಹೋಮ"
        }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಖಂಡಿತವಾಗಿಯೂ ಧನಾತ್ಮಕ ಸುಧಾರಣೆ ಮತ್ತು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳ ಸಿದ್ಧಿ ಗೋಚರಿಸುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  const p1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} ಜಾತಕದ ಪ್ರಸ್ತುತ ${dasha} ಅವಧಿ ಹಾಗೂ ಸಂಬಂಧಿಸಿದ ಭಾವಾಧಿಪತಿಯ ಸಂಚಾರವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಗ್ರಹಸ್ಥಿತಿಗಳು ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆಗಳನ್ನು ಸೂಚಿಸುತ್ತಿವೆ. ಲಗ್ನಾಧಿಪತಿಯ ಬಲವು ನಿಮಗೆ ಆತ್ಮಸ್ಥೈರ್ಯ ನೀಡುತ್ತಿದ್ದು, ತಾಳ್ಮೆಯ ನಡೆಯಿಂದ ಉದ್ದೇಶಿತ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.`
      : isSubsequent
        ? `ನೀವು ಕೇಳಿರುವ "${question}" ಎಂಬ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ಪ್ರಸ್ತುತ ${dasha} ಅವಧಿ ಹಾಗೂ ಸಂಬಂಧಿಸಿದ ಭಾವಾಧಿಪತಿಯ ಸಂಚಾರವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಗ್ರಹಸ್ಥಿತಿಗಳು ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆಗಳನ್ನು ಸೂಚಿಸುತ್ತಿವೆ. ಲಗ್ನಾಧಿಪತಿಯ ಬಲವು ನಿಮಗೆ ಆತ್ಮಸ್ಥೈರ್ಯ ನೀಡುತ್ತಿದ್ದು, ತಾಳ್ಮೆಯ ನಡೆಯಿಂದ ಉದ್ದೇಶಿತ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.`
        : `ನಮಸ್ಕಾರ ${localizedDevoteeName} ಅವರೇ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಶಾಸ್ತ್ರೋಕ್ತ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿ ಹಾಗೂ ${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನ್ಮತಾಳಿದ್ದೀರಿ (${tatva} ತತ್ವ, ${gana} ಗಣ). ನಿಮ್ಮ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಮಹತ್ವದ ತಿರುವು ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳನ್ನು ನಿರ್ದೇಶಿಸುತ್ತಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮಗೆ ಆತ್ಮಸ್ಥೈರ್ಯ ನೀಡುತ್ತಿದ್ದು, ಗೋಚಾರ ಗ್ರಹಗಳಾದ ಗುರು ಮತ್ತು ಶನಿ ಪ್ರಭಾವದಿಂದ ಹಂತ ಹಂತವಾಗಿ ಸಕಲ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.`;

  const p2 = `ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಭಾವಗಳನ್ನು ಗಮನಿಸಿದಾಗ, ಈ ಹಿಂದೆ ಎದುರಾಗಿದ್ದ ಮಾನಸಿಕ ಆತಂಕಗಳು ಮತ್ತು ಕಾರ್ಯವಿಳಂಬಗಳು ಈಗ ನಿಧಾನವಾಗಿ ಪರಿಹಾರವಾಗುವ ಲಕ್ಷಣಗಳಿವೆ. ಮಾವಿನ ಕಾಯಿಯು ಮರದಲ್ಲೇ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಮಾಗಿದಾಗ ಮಾತ್ರ ಸಿಹಿ ರುಚಿ ಕೊಡುವಂತೆ, ನಿಮ್ಮ ನಿರಂತರ ಶ್ರಮವು ಸೂಕ್ತ ಕಾಲದಲ್ಲಿ ಶಾಶ್ವತ ಫಲ ನೀಡಲಿದೆ; ಹೀಗಾಗಿ ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಹಾಗೂ ಕುಟುಂಬ ಸೌಖ್ಯದ ವಿಚಾರದಲ್ಲಿ ಧನಾತ್ಮಕ ಫಲಗಳು ಗೋಚರಿಸುತ್ತಿದ್ದು, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ತಾಳ್ಮೆಯ ನಡೆ ನಿಮಗೆ ಹೆಚ್ಚಿನ ಯಶಸ್ಸನ್ನು ತಂದುಕೊಡುತ್ತದೆ.`;

  const p3 = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗುರು ಗ್ರಹದ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳಿಗೆ ಬಲವನ್ನು ನೀಡಲಿದ್ದು, ಹೊಸ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಯೋಗ್ಯ ಕಾಲಾವಕಾಶ ಸೃಷ್ಟಿಯಾಗಲಿದೆ. ತಾಳ್ಮೆ ಮತ್ತು ಸತತ ಪ್ರಯತ್ನಗಳಿಂದ ನಿಮ್ಮ ನಿರೀಕ್ಷಿತ ಗುರಿಗಳನ್ನು ತಲುಪಲು ಸಾಧ್ಯವಾಗಲಿದ್ದು, ದೈವಾನುಗ್ರಹದಿಂದ ನಿಧಾನವಾಗಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ. ಯಾವುದೇ ನಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳಿಗೆ ಎಡೆಕೊಡದೆ ಶುಭ ಸಂಕಲ್ಪದೊಂದಿಗೆ ಹೆಜ್ಜೆಯಿಡಿ.`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${p1}\n\n${p2}\n\n${p3}\n\nನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮೊದಲೇ ತಿಳಿಸಿದಂತೆ ${activeDosha.doshaName} ಪ್ರಭಾವವಿದ್ದು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಹಾಗೂ ಪೂಜೆಯಿಂದ ಸಕಲ ವಿಘ್ನಗಳೂ ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರವೇ ಶುಭ ಫಲಗಳು ಲಭಿಸಲಿವೆ.`);
    }
    const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ"
      }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${activeDosha.technicalWhy || "ಗ್ರಹಗಳ ಅಶುಭ ಸಂಯೋಜನೆ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
      } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${activeDosha.currentLifeProblems ||
      "ಕಾರ್ಯವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ವಿಪರೀತ ಅಡೆತಡೆಗಳು"
      }" ಎದುರಾಗುತ್ತಿವೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja ||
      "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿ ಹೋಮ"
      }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಖಂಡಿತವಾಗಿಯೂ ಧನಾತ್ಮಕ ಸುಧಾರಣೆ ಮತ್ತು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳ ಸಿದ್ಧಿ ಗೋಚರಿಸುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}\n\n${p4Dosha}`);
  }

  const p3Normal = `ಗ್ರಹದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಜಯಕ್ಕಾಗಿ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಶನಿವಾರದಂದು ದೀಪಾರಾಧನೆ ಮಾಡಿ ಇಷ್ಟದೇವತಾ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಸಮಸ್ತ ಇಷ್ಟಾರ್ಥಗಳು ಶೀಘ್ರವಾಗಿ ಕೈಗೂಡಿ ಸಕಲ ಶುಭವಾಗುತ್ತದೆ.`;
  return deduplicateResponseText(`${p1}\n\n${p2}\n\n${p3Normal}`);
}

export function buildHindiFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatva,
    gana,
    psychNature,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord,
    localizedDevoteeName
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`जी हाँ, मैं इस पावन परामर्श कक्ष में आपके साथ ही उपस्थित हूँ। जब भी आप चाहें, अपना अगला प्रश्न या दुविधा निःसंकोच व्यक्त करें।`);
    }
    return deduplicateResponseText(`हरि ॐ ${localizedDevoteeName} जी! श्री क्षेत्र गोकर्ण के महागणपति एवं भगवान महाबलेश्वर का दिव्य आशीर्वाद आप और आपके परिवार पर सदा बना रहे।\n\nइस पावन २० मिनट के व्यक्तिगत परामर्श सत्र में मैं आपके समक्ष उपस्थित हूँ। कृपया पूर्ण शांत भाव से रहें। अपने जीवन, आजीविका, विवाह, स्वास्थ्य अथवा परिवार से जुड़ा कोई भी प्रश्न आप निःसंकोच पूछ सकते हैं।`);
  }

  // Proof Follow-Up
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("hi", ctx);
  }

  // Timing / Intelligent Follow-Up
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /कब|कितने दिन|कितने महीने|समय सीमा|किस वर्ष|किस महीने|when|timing/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} कुंडली के संबंधित भावों एवं शुभ गोचर ग्रहों के संचरण का अवलोकन करने पर आपके ${timeline.topicLabel} कार्य हेतु अनुकूल समय अब अत्यंत सन्निकट आ रहा है।`
        : isSubsequent
          ? `१००% शास्त्रसम्मत ज्योतिषीय निर्णय: ९८% प्रामाणिक सटीकता के साथ आपका ${timeline.topicLabel} ${timeline.rangeSummary} अवश्य साकार होगा। कुंडली में ${timeline.topicYogaName} एवं संबंधित भावों के शुभ गोचर को देखने पर यह समय अत्यंत अनुकूल सिद्ध हो रहा है।`
          : `१००% शास्त्रसम्मत ज्योतिषीय निर्णय: श्री बग्गोण पंचांग की वैदिक गणना के अनुसार, ९८% प्रामाणिक सटीकता के साथ आपका ${timeline.topicLabel} ${timeline.rangeSummary} अवश्य साकार होगा! प्रिय ${localizedDevoteeName} जी, आपकी जन्म कुंडली का सूक्ष्म अध्ययन करने पर आप ${lagna} लग्न, ${rashi} राशि तथा ${nakshatra} नक्षत्र में जन्मे हैं। वर्तमान में चल रही ${dasha} तथा ${timeline.topicYogaName} का शुभ गोचर इस मंगलकारी समय का दृढ़ता से समर्थन कर रहे हैं।`;
    const p2Timing = `वैदिक ज्योतिष शास्त्र के गणित के अनुसार, वर्तमान में चल रही ${timeline.currentMahaName}-${timeline.currentBhuktiName} की अवधि आगामी ${timeline.monthsToDashaChange} महीनों में पूर्ण होकर ${timeline.nextBhuktiName} भुक्ति में परिवर्तित होगी। इसके साथ ही, देवगुरु बृहस्पति एक राशि से दूसरी राशि में गोचर करते हुए आगामी एक वर्ष के भीतर आपकी कुंडली के प्रमुख केंद्र एवं त्रिकोण भावों पर अपनी अमृतमयी दृष्टि डालेंगे। यह गुरु बल और दशा परिवर्तन पूर्व के समस्त अवरोधों को समाप्त कर नए अवसरों का मार्ग प्रशस्त करेंगे।`;
    const p3Timing = `अतः श्री बग्गोण पंचांग की गणनानुसार पूर्ण विश्वास रखें कि ९८% सटीकता के साथ आपका ${timeline.topicLabel} ${timeline.rangeSummary} साकार होने का प्रबल योग है। इस शुभ अवसर को अनुकूल ऊर्जा के साथ प्राप्त करने हेतु श्री क्षेत्र गोकर्ण महाबलेश्वर स्वामी का स्मरण करें तथा सोमवार अथवा गुरुवार को गाय के शुद्ध घी का दीपक प्रज्वलित करें।`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nआपकी जन्म पत्रिका के सूक्ष्म अध्ययन से "${activeDosha.doshaName || "दोष"
        }" की पुष्टि होती है। यह स्थिति ${activeDosha.technicalWhy || "ग्रहों के प्रतिकूल प्रभाव"
        } से उत्पन्न हुई है, जिसके कारण जीवन में "${activeDosha.currentLifeProblems || "कार्यों में विलंब व मानसिक तनाव"
        }" अनुभव हो रहा है। इसके निवारण हेतु श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "महाबलेश्वर महारुद्राभिषेक एवं शांति होम"
        }" संपन्न करना परम आवश्यक है। इस पवित्र पूजा से निश्चित रूप से सकारात्मक सुधार होगा। इस दोष परिहार के संकल्प हेतु मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362, श्री क्षेत्र गोकर्ण) से सीधे संपर्क करें।`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child (< 18 yrs)
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `बच्चे के "${question}" से जुड़े प्रश्न के संदर्भ में, कुंडली के चतुर्थ विद्या भाव (${house4Sign}) और पंचम बुद्धि भाव (${house5Sign}) का अध्ययन करने पर, विद्याधिपति ${house4Lord} के प्रभाव से बच्चे में उत्तम सीखने की क्षमता है। स्नेह और धैर्य से मार्गदर्शन करने पर बच्चा शैक्षणिक क्षेत्र में उत्कृष्ट सफलता प्राप्त करेगा।`
      : `आदरणीय माता-पिता, श्री बग्गोण पंचांग ज्योतिष के अनुसार आपके बच्चे (${localizedDevoteeName}) की जन्म कुंडली का अध्ययन करने पर, बच्चे का जन्म ${lagna} लग्न, ${rashi} राशि और ${nakshatra} नक्षत्र में हुआ है। बच्चे का स्वभाव तीक्ष्ण बुद्धि, स्वाभाविक जिज्ञासा और संवेदनशील मन से युक्त है। आपके प्रश्न "${question}" के संबंध में, कुंडली का चतुर्थ विद्या स्थान (${house4Sign}) और पंचम बुद्धि स्थान (${house5Sign}) अत्यंत जाग्रत हैं और बच्चे में अद्भुत प्रतिभा निहित है।`;
    const p2Child = `बच्चे की पढ़ाई, एकाग्रता और स्मरण शक्ति के संदर्भ में चतुर्थेश ${house4Lord} की स्थिति को देखते हुए, बच्चा शीघ्रता से विषय समझ लेता है। कभी-कभी मन चंचल होना, खेलकूद में ध्यान जाना अथवा अपनी बात पर अड़ना इस आयु का स्वाभाविक लक्षण है। माता-पिता के रूप में आप बच्चे पर अनावश्यक तुलनात्मक दबाव न बनाएं, बल्कि प्रेम, शांत वातावरण और नियमित दिनचर्या का अभ्यास कराएं। वर्तमान ${dasha} काल बच्चे के बौद्धिक विकास हेतु उत्तम आधारशिला सिद्ध होगा।`;
    const p3Child = `बच्चे के स्वास्थ्य, दृष्टि दोष निवारण और एकाग्रता हेतु प्रतिदिन संध्या समय घर में घी का दीपक जलाकर महासरस्वती स्तोत्र अथवा गायत्री मंत्र का पाठ करें। श्री क्षेत्र गोकर्ण महागणपति के नाम से संकल्प कर दूर्वा अर्चन कराने से बच्चे की स्मरण शक्ति तीव्र होगी और दीर्घायु का आशीर्वाद प्राप्त होगा।`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nजैसा कि बच्चे की कुंडली में पूर्व में बताया गया है, ${activeDosha.doshaName} का प्रभाव श्री क्षेत्र गोकर्ण के पवित्र संकल्प एवं पूजा से शांत होकर बच्चे को उत्तम स्वास्थ्य और विद्या प्रदान करेगा।`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nबच्चे की पत्रिका में "${activeDosha.doshaName || "विद्या व बाल संस्कार दोष"
        }" दिखाई देता है। ग्रहों के प्रतिकूल प्रभाव (${activeDosha.technicalWhy || "चतुर्थ/पंचम भाव पर तनाव"
        }) से "${activeDosha.currentLifeProblems || "पढ़ाई में चंचलता व परीक्षा में घबराहट"
        }" हो सकती है। शांति हेतु श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "श्री महासरस्वती एवं मेधा सूक्त शांति पूजा"
        }" कराना शुभ रहेगा। मुख्य पुरोहित श्रीराम पंडित (फोन: 9972339362, श्री क्षेत्र गोकर्ण) से मार्गदर्शन प्राप्त करें।`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana / Progeny
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `संतान प्राप्ति के संबंध में आपके प्रश्न "${question}" पर, कुंडली के पंचम भाव (${house5Sign}) और पंचमेश ${house5Lord} की स्थिति का अवलोकन करने पर यह गोचर का सामयिक विलंब दर्शाता है। चिकित्सीय प्रयासों के साथ जब दैवीय कृपा जुड़ेगी, तो संतान योग अवश्य सिद्ध होगा।`
      : `प्रिय वत्स ${localizedDevoteeName}, वैवाहिक जीवन में संतान सुख और वंश वृद्धि को लेकर आपके मन की गहरी चिंता और आकांक्षा को एक वरिष्ठ दैवज्ञ के रूप में मैं भली-भांति समझता हूँ। श्री बग्गोण पंचांग के अनुसार आपकी कुंडली में ${lagna} लग्न, ${rashi} राशि और ${nakshatra} नक्षत्र है। आपकी पत्रिका के पंचम भाव (${house5Sign}) और संतान कारक गुरु की स्थिति दर्शाती है कि यह समय एक परीक्षा काल है, जिसके कारण चिकित्सीय रूप से सब सामान्य होने पर भी सामयिक विलंब हो रहा है।`;
    const p2Santhana = `पंचमेश ${house5Lord} और वर्तमान ${dasha} की स्थिति ने ऊर्जात्मक स्तर पर कुछ रुकावटें डाली हैं। वैदिक दृष्टि में संतान प्राप्ति के लिए चिकित्सा और दैव बल दोनों का सामंजस्य आवश्यक है। अपने मन से समस्त निराशा और दोषारोपण दूर करें। जब शास्त्रोक्त उपायों से पूर्वजन्म के कर्म दोष शांत होंगे, तो माता-पिता बनने का मार्ग प्रशस्त होगा।`;
    const p3Santhana = `आगामी चंद्र चक्रों में गुरु की शुभ दृष्टि पंचम भाव पर पड़ने से अत्यंत अनुकूल समय आरंभ होगा। दोनों दंपत्ति परस्पर प्रेम बनाए रखें और नित्य श्रद्धा से श्री संतान गोपाल मंत्र का पाठ करें। गोकर्ण महाबलेश्वर के आशीर्वाद से शीघ्र ही मंगल समाचार प्राप्त होगा।`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\nआपकी कुंडली में जैसा पहले बताया गया, ${activeDosha.doshaName} का निवारण श्री क्षेत्र गोकर्ण में कराने से शीघ्र संतान सुख प्राप्त होगा।`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nआपकी जन्म कुंडली में "${activeDosha.doshaName || "संतान बाधा एवं पंचम भाव दोष"
        }" परिलक्षित होता है। ग्रहों के प्रतिकूल प्रभाव (${activeDosha.technicalWhy || "पंचम भाव पर पापदृष्टि"
        }) से "${activeDosha.currentLifeProblems || "संतान प्राप्ति में विलंब"
        }" हो रहा है। इसके निवारण हेतु श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "संतान गोपाल महाहोम एवं नाग प्रतिष्ठा"
        }" संपन्न कराएं। मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362, श्री क्षेत्र गोकर्ण) से संपर्क करें।`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate / Sexuality Query
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|वेश्याव्यवसाय|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `मुक्ति एवं सम्मानपूर्ण जीवन के आपके प्रश्न ("${question}") के संबंध में, श्री क्षेत्र गोकर्ण महाबलेश्वर स्वामी के पावन सानिध्य में कोई भी आत्मा अशुद्ध अथवा शाश्वत शापित नहीं है। अष्टम एवं सप्तम भाव पर राहु-मंगल का ऋण बंधन आगामी गुरु गोचर से कट जाएगा और सम्मान का मार्ग बनेगा।`
        : `१००% सत्यनिष्ठ दैवज्ञ आश्वासन: श्री क्षेत्र गोकर्ण के महाबलेश्वर स्वामी के पावन सानिध्य में कोई भी आत्मा अशुद्ध अथवा शाश्वत शापित नहीं है; आपकी जन्म कुंडली के अनुसार आगामी गुरु का शुभ गोचर इस परिस्थिति के बंधनों को काटकर आपको एक सम्मानित, गरिमापूर्ण वैवाहिक जीवन प्रदान करेगा! वत्स ${localizedDevoteeName}, आपके मन की अपार वेदना को मैं पिता के वात्सल्य और बिना किसी सामाजिक पूर्वाग्रह के स्वीकार करता हूँ। सनातन परंपरा में पिंगला और आम्रपाली जैसी पुण्यात्माओं ने सिद्ध किया है कि सांसारिक विवशताएं आत्मा की दिव्यता को मलिन नहीं कर सकतीं।`;
      const p2SexWork = `कुंडली के अष्टम गुप्त स्थान, सप्तम संबंध स्थान और षष्ठ ऋण भाव का अध्ययन करने पर स्पष्ट है कि आप किसी आंतरिक दोष से नहीं, बल्कि आर्थिक विवशता और पारिवारिक ऋण के कारण इस चक्रव्यूह में घिरे हैं। वर्तमान ${dasha} के उपरांत गुरु दृष्टि आपको इस संकट से उबारेगी। अपने स्वास्थ्य की रक्षा हेतु बिना झिझक स्वास्थ्य परीक्षण कराएं और विश्वसनीय महिला आश्रय तथा विधिक सहायता का सहारा लें।`;
      const p3SexWork = `ऋण से मुक्ति और सुरक्षा हेतु श्री क्षेत्र गोकर्ण महाबलेश्वर को रुद्राभिषेक कराएं तथा श्री महागौरी/दुर्गा स्तोत्र और ऋणमोचन स्तोत्र का पाठ करें। माता महागौरी अपनी संतानों की रक्षा करती हैं और शीघ्र ही आपको एक शांत, सम्मानित पारिवारिक जीवन प्राप्त होगा।`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nकुंडली में "${activeDosha.doshaName || "ऋणबंधन व कर्म दोष"}" का निवारण श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "महाबलेश्वर महारुद्राभिषेक एवं चंडी शांति"}" द्वारा होगा। व्यक्तिगत मार्गदर्शन हेतु मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362, श्री क्षेत्र गोकर्ण) से संपर्क करें।`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `अंतरंग विषयों के इस प्रश्न ("${question}") के संबंध में, कुंडली के अष्टम भाव, सप्तम भाव और शुक्र की स्थिति से यह स्पष्ट है कि यह पूर्णतः प्राकृतिक शारीरिक और मानसिक अवस्था है। अपराधबोध से मुक्त होकर आयुर्वेद और सात्विक दिनचर्या अपनाएं।`
      : `प्रिय ${localizedDevoteeName} जी, वैदिक जीवन दर्शन में काम (प्राकृतिक इच्छा, शारीरिक सामर्थ्य और दांपत्य सुख) को चार पुरुषार्थों में से एक पवित्र अंग माना गया है। समाज में संकोच या अपराधबोध के कारण इस विषय पर खुलकर बात नहीं हो पाती, परंतु एक अनुभवी दैवज्ञ के रूप में मैं इसे पूर्ण वैज्ञानिक स्पष्टता और वात्सल्य से देखता हूँ। आपका ${lagna} लग्न और शुक्र ग्रह की स्थिति आपकी शारीरिक ऊर्जा का संचालन करती है।`;
    const p2Intimate = `कुंडली के अष्टम, सप्तम और द्वादश भावों के अध्ययन से ज्ञात होता है कि वर्तमान ${dasha} के कारण मानसिक तनाव और अत्यधिक थकान ने शुक्र धातु के संतुलन को सामयिक रूप से प्रभावित किया है। यह कोई स्थायी दोष नहीं है, बल्कि विशुद्ध रूप से तनावजनित अवस्था है। अपराधबोध त्यागें; आयुर्वेद सम्मत अश्वगंधा, शुद्ध दूध और प्राणायाम से आपकी ऊर्जा पुनः जाग्रत होगी।`;
    const p3Intimate = `मन की चिंता को शांत करें। गोकर्ण महाबलेश्वर के दर्शन और सोमवार के रुद्राभिषेक से मन को अगाध शांति मिलेगी और दांपत्य जीवन में परस्पर प्रेम और विश्वास पुनः स्थापित होगा।`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\nजैसा कि पूर्व में बताया गया, ${activeDosha.doshaName} के परिहार से मानसिक और शारीरिक संतुलन पुनः प्राप्त होगा।`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nआपकी पत्रिका में "${activeDosha.doshaName || "शुक्र धातु व अंतरंग क्लेश दोष"}" की शांति हेतु श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "महाबलेश्वर महारुद्राभिषेक एवं स्वास्थ्य शांति"}" कराना उत्तम रहेगा। मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362) से संपर्क करें।`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  // Career Frustration
  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `करियर और आजीविका के प्रश्न "${question}" के संदर्भ में, दशम कर्म भाव (स्वामी: ${karmaLord}) और वर्तमान ${dasha} के प्रभाव से कार्यक्षेत्र में सामयिक तनाव और मंथन दिखाई दे रहा है। यह आपकी आंतरिक क्षमता को तराशने का समय है, न कि कोई स्थायी रुकावट।`
      : `प्रिय वत्स ${localizedDevoteeName}, आपकी आजीविका (नौकरी/व्यवसाय) में हो रही परेशानी और हताशा को मैं पूर्ण रूप से समझ सकता हूँ। श्री बग्गोण पंचांग के अनुसार आपका जन्म ${lagna} लग्न, ${rashi} राशि में हुआ है, और आपका मूल स्वभाव परिश्रमी एवं स्वाभिमानी है। वर्तमान ${dasha} और ${shaniText} आपके कार्यक्षेत्र में धैर्य और आत्मनिरीक्षण की मांग कर रहे हैं।`;
    const p2Career = `दशमेश ${karmaLord} और षष्ठ भाव की स्थिति को देखते हुए, गोचर के ग्रहों के प्रभाव से कार्यस्थल पर दबाव, सहकर्मियों से समन्वय की कमी और परिश्रम का उचित श्रेय मिलने में देरी हो रही है। जिस प्रकार मकान बनाते समय गहरी नींव रखने के बाद ही ऊपर की मंजिलें सुरक्षित खड़ी रहती हैं, उसी प्रकार यह समय आपकी क्षमता को निखारने और मजबूत आधार बनाने आया है। क्रोध अथवा अधीरता में आकर त्यागपत्र जैसा कोई जल्दबाजी का कदम न उठाएं।`;
    const p3Career = `आगामी गोचर काल में ग्रहों की चाल आपके पक्ष में बदलेगी और धीरे-धीरे नए अवसरों के द्वार खुलेंगे। तब तक धैर्यपूर्वक अपने कर्तव्य का निर्वहन करें। नित्य शिव पंचाक्षरी स्तोत्र अथवा गायत्री मंत्र का जप करें और सोमवार या शनिवार को घी का दीपक प्रज्वलित करें।`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\nआपकी कुंडली में ${activeDosha.doshaName} का निवारण श्री क्षेत्र गोकर्ण की पूजा से होकर करियर में स्थिरता आएगी।`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nआपकी कुंडली में "${activeDosha.doshaName || "दोष"
        }" की उपस्थिति से आजीविका में विघ्न आ रहे हैं। श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "महाबलेश्वर महारुद्राभिषेक एवं शांति होम"
        }" संपन्न कराएं। मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362, श्री क्षेत्र गोकर्ण) से संपर्क करें।`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  // Base Reading
  const baseP1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} वर्तमान ${dasha} अवधि एवं संबंधित भावेश के गोचर को देखते हुए ग्रह स्थितियां सकारात्मक परिवर्तनों की ओर संकेत कर रही हैं। लग्नेश का बल आपको आत्मविश्वास प्रदान कर रहा है।`
      : isSubsequent
        ? `आपके प्रश्न "${question}" के संदर्भ में, कुंडली की वर्तमान ${dasha} अवधि और संबंधित भावेश के गोचर को देखते हुए ग्रह स्थितियां सकारात्मक परिवर्तनों की ओर संकेत कर रही हैं। लग्नेश का बल आपको आत्मविश्वास प्रदान कर रहा है और धैर्यपूर्वक किए गए प्रयास सफल होंगे।`
        : `नमस्ते ${localizedDevoteeName} जी। श्री बग्गोण पंचांग ज्योतिष की शास्त्रोक्त गणनानुसार आप ${lagna} लग्न, ${rashi} राशि तथा ${nakshatra} नक्षत्र में जन्मे हैं । आपके प्रश्न "${question}" के संबंध में, वर्तमान ${dasha} काल आपके जीवन में महत्वपूर्ण मोड़ और नए अवसरों का सृजन कर रहा है। लग्नेश की शुभ स्थिति आपको संबल दे रही है और गुरु व शनि के गोचर से धीरे-धीरे कार्य सिद्ध होंगे।`;
  const baseP2 = `कुंडली के मुख्य भावों का अवलोकन करने पर पूर्व में रहे मानसिक तनाव और कार्यों में रुकावटें अब धीरे-धीरे दूर होने के संकेत हैं। करियर, व्यवसाय और पारिवारिक सुख के क्षेत्र में सकारात्मक परिणाम दिखाई देंगे। बड़ों का आशीर्वाद और संयमित आचरण आपको सफलता दिलाएगा। किसी भी प्रकार के जल्दबाजी वाले निर्णयों से बचें।`;
  const baseP3 = `आगामी गोचर काल में देवगुरु बृहस्पति का शुभ प्रभाव आपके प्रमुख त्रिकोण स्थानों को बल प्रदान करेगा, जिससे नए कार्यों के शुभारंभ हेतु अनुकूल वातावरण बनेगा। सकारात्मक संकल्प के साथ आगे बढ़ें।`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\nआपकी कुंडली में ${activeDosha.doshaName} का निवारण श्री क्षेत्र गोकर्ण के संकल्प से होकर शुभ फल प्राप्त होंगे।`);
    }
    const p4Dosha = `॥ वैदिक दोष निवारण एवं गोकर्ण परिहार अध्याय ॥\nआपकी जन्म पत्रिका में "${activeDosha.doshaName || "दोष"
      }" की उपस्थिति से विलंब हो रहा है। इसके निवारण हेतु श्री क्षेत्र गोकर्ण में "${activeDosha.recommendedPooja || "महाबलेश्वर महारुद्राभिषेक एवं शांति होम"
      }" कराएं। मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362, श्री क्षेत्र गोकर्ण) से संपर्क करें।`;
    return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`);
  }

  const p3Normal = `ग्रहदोष निवारण एवं सर्वकार्य सिद्धि हेतु श्री क्षेत्र गोकर्ण के महागणपति एवं महाबलेश्वर स्वामी की आराधना करें। प्रति सोमवार अथवा शनिवार को घी का दीपक जलाकर इष्टदेव का स्मरण करने से आपके सभी मनोरथ पूर्ण होंगे और जीवन में सुख-शांति का संचार होगा।`;
  return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${p3Normal}`);
}

export function buildTeluguFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatva,
    gana,
    psychNature,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord,
    localizedDevoteeName
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`అవును, నేను ఈ పవిత్ర సంభాషణ గదిలో మీతోనే ఉన్నాను. మీ తదుపరి ప్రశ్న లేదా సందేహాన్ని నిస్సంకోచంగా తెలియజేయండి.`);
    }
    return deduplicateResponseText(`హరి ఓం ${localizedDevoteeName} గారూ! శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి మరియు మహాగణపతి దివ్య ఆశీస్సులు మీపై, మీ కుటుంబంపై సదా ఉండుగాక.\n\nమీ కోసం కేటాయించిన ఈ 20 నిమిషాల ఏకాంత సంభాషణలో నేను మీతోనే ఉన్నాను. మీ మనస్సులోని ఉద్యోగం, వ్యాపారం, వివాహం, ఆరోగ్యం లేదా కుటుంబ సమస్యల గురించి నిస్సంకోచంగా అడగండి.`);
  }

  // Proof Follow-Up
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("te", ctx);
  }

  // Timing
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /ఎప్పుడు|ఎన్ని రోజులు|ఎన్ని నెలలు|సమయం|ఏ సంవత్సరం|ఏ నెల|when|timing/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} జాతకంలోని సంబంధిత భావాలు మరియు శుభ గోచార గ్రహాల సంచారాన్ని పరిశీలిస్తే, మీ ${timeline.topicLabel} కార్యానికి అనుకూల సమయం ఇప్పుడు సమీపిస్తోంది.`
        : isSubsequent
          ? `100% ఖచ్చిత జాతక నిర్ణయం: 98% ఖచ్చితత్వంతో మీ ${timeline.topicLabel} ${timeline.rangeSummary} సాకారం కానుంది. జాతకంలో ${timeline.topicYogaName} మరియు గోచార గ్రహాల సంచారం ఈ అనుకూల కాలాన్ని బలపరుస్తున్నాయి.`
          : `100% ఖచ్చిత జాతక నిర్ణయం: శ్రీ బగ్గోణ పంచాంగ వేద జ్యోతిష గణన ప్రకారం, 98% ఖచ్చితత్వంతో మీ ${timeline.topicLabel} ${timeline.rangeSummary} ఖచ్చితంగా నెరవేరుతుంది! ఆత్మీయులైన ${localizedDevoteeName} గారూ, మీ జన్మ కుండలిని పరిశీలిస్తే మీరు ${lagna} లగ్నం, ${rashi} రాశి, ${nakshatra} నక్షత్రంలో జన్మించారు. ప్రస్తుతం జరుగుతున్న ${dasha} మరియు ${timeline.topicYogaName} యోగం ఈ శుభ కాలాన్ని సమర్థిస్తున్నాయి.`;
    const p2Timing = `వేద జ్యోతిష శాస్త్ర గణితం ప్రకారం, ప్రస్తుతం జరుగుతున్న ${timeline.currentMahaName}-${timeline.currentBhuktiName} కాలం రాబోయే ${timeline.monthsToDashaChange} నెలల్లో ముగిసి ${timeline.nextBhuktiName} భుక్తిగా మారుతుంది. దేవగురు బృహస్పతి గోచారం మీ లగ్న కేంద్ర-త్రికోణ స్థానాలపై దివ్య దృష్టిని ప్రసరిస్తుంది. ఈ గురుబలం మరియు దశా మార్పు పూర్వపు అడ్డంకులను తొలగించి సరికొత్త అవకాశాలను తెస్తుంది.`;
    const p3Timing = `కాబట్టి శ్రీ బగ్గోణ పంచాంగం ప్రకారం మీ ${timeline.topicLabel} ${timeline.rangeSummary} నెరవేరే బలమైన యోగం ఉంది. ఈ శుభ కాలాన్ని ఆహ్వానించడానికి శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామివారిని ప్రార్థించి, సోమవారం లేదా గురువారం ఆవు నేతితో దీపారాధన చేయడం శ్రేయస్కరం.`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nమీ జాతకంలో "${activeDosha.doshaName || "దోషం"
        }" ఉంది. దీనివల్ల జీవితంలో "${activeDosha.currentLifeProblems || "పనులలో ఆలస్యం మరియు మానసిక ఒత్తిడి"
        }" ఎదురవుతున్నాయి. దీని నివారణకు శ్రీ క్షేత్ర గోకర్ణంలో "${activeDosha.recommendedPooja || "మహాబలేశ్వర మహారుద్రాభిషేకం మరియు శాంతి హోమం"
        }" జరిపించడం అవసరం. ముఖ్య దైవజ్ఞులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362, శ్రీ క్షేత్ర గోకర్ణం) గారిని నేరుగా సంప్రదించండి.`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `పిల్లల "${question}" ప్రశ్నకు సంబంధించి, కుండలిలోని 4వ విద్యా స్థానం (${house4Sign}) మరియు 5వ బుద్ధి స్థానాన్ని (${house5Sign}) పరిశీలిస్తే, విద్యాధిపతి ${house4Lord} అనుగ్రహంతో పిల్లలలో అద్భుతమైన గ్రహణ శక్తి ఉంది. ఓర్పుతో ప్రోత్సహిస్తే చదువులో మంచి విజయం సాధిస్తారు.`
      : `గౌరవనీయులైన తల్లిదండ్రులారా, శ్రీ బగ్గోణ పంచాంగం ప్రకారం మీ బిడ్డ (${localizedDevoteeName}) జాతకాన్ని పరిశీలిస్తే, బిడ్డ ${lagna} లగ్నం, ${rashi} రాశి మరియు ${nakshatra} నక్షత్రంలో జన్మించారు. బిడ్డ సహజ స్వభావం చురుకైన బుద్ధి, సహజమైన జిజ్ఞాస కలిగి ఉంది. మీ "${question}" ప్రశ్నకు సంబంధించి, 4వ విద్యా స్థానం (${house4Sign}) మరియు 5వ బుద్ధి స్థానం (${house5Sign}) గొప్ప ప్రతిభను సూచిస్తున్నాయి.`;
    const p2Child = `పిల్లల ఏకాగ్రత, జ్ఞాపకశక్తి విషయంలో 4వ స్థానాధిపతి ${house4Lord} స్థితిని గమనిస్తే విషయాలను త్వరగా నేర్చుకునే సామర్థ్యం ఉంది. అప్పుడప్పుడు చంచలత్వం, ఆటలపై మక్కువ చూపడం ఈ వయస్సు సహజ లక్షణం. తల్లిదండ్రులుగా అధిక ఒత్తిడి లేదా కఠిన శిక్షలు వేయకుండా, ప్రేమతో క్రమశిక్షణను అలవర్చడం మంచిది. ప్రస్తుత ${dasha} కాలం బౌద్ధిక వికాసానికి తోడ్పడుతుంది.`;
    const p3Child = `ఆరోగ్యం, దృష్టి దోష నివారణ మరియు చదువులో ఏకాగ్రత కోసం సాయంత్రం వేళ నేతి దీపం వెలిగించి మహాసరస్వతీ స్తోత్రం లేదా గాయత్రీ మంత్రం పఠించండి. శ్రీ క్షేత్ర గోకర్ణ మహాగణపతికి దూర్వార్చన చేయించడం వల్ల అద్భుతమైన జ్ఞాపకశక్తి లభిస్తుంది.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nబిడ్డ జాతకంలో ${activeDosha.doshaName} ప్రభావం గోకర్ణ పూజతో తొలగిపోయి మంచి విద్య, ఆరోగ్యం లభిస్తాయి.`);
      }
      const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nపిల్లల జాతకంలో "${activeDosha.doshaName || "విద్యా దోషం"
        }" ఉంది. శ్రీ క్షేత్ర గోకర్ణంలో "${activeDosha.recommendedPooja || "శ్రీ మహాసరస్వతీ మరియు మేధా సూక్త శాంతి పూజ"
        }" జరిపించడం ఉత్తమం. ముఖ్య పురోహితులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362) గారిని సంప్రదించండి.`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `సంతాన భాగ్యం గురించిన మీ "${question}" ప్రశ్నకు సంబంధించి, 5వ పుత్ర స్థానం (${house5Sign}) మరియు పంచమాధిపతి ${house5Lord} పరిశీలిస్తే, ఇది తాత్కాలిక గోచార విళంబన మాత్రమే. వైద్య ప్రయత్నాలతో పాటు దైవబలం తోడైనప్పుడు సంతాన ప్రాప్తి ఖచ్చితంగా కలుగుతుంది.`
      : `నాయనా ${localizedDevoteeName}, దాంపత్య జీవితంలో సంతాన ప్రాప్తి గురించిన మీ ఆందోళనను ఒక అనుభవజ్ఞుడైన దైవజ్ఞునిగా నేను అర్థం చేసుకోగలను. శ్రీ బగ్గోణ పంచాంగం ప్రకారం మీరు ${lagna} లగ్నం, ${rashi} రాశి, ${nakshatra} నక్షత్రంలో జన్మించారు. మీ జాతకంలో 5వ స్థానం (${house5Sign}) మరియు పుత్రకారక గురు గ్రహ స్థితి పరీక్షా కాలాన్ని సూచిస్తున్నాయి, అందుకే తాత్కాలిక ఆలస్యం జరుగుతోంది.`;
    const p2Santhana = `పంచమాధిపతి ${house5Lord} మరియు ప్రస్తుత ${dasha} కాలంలో ఉన్న గ్రహ ఒత్తిడులు సంతాన విషయమై అడ్డంకులు సృష్టిస్తున్నాయి. వేద సంప్రదాయంలో వైద్యంతో పాటు దైవానుగ్రహం అవసరం. నిరాశను వీడి శాస్త్రోక్త పరిహారాలు ఆచరిస్తే సంతాన భాగ్య ద్వారాలు తెరుచుకుంటాయి.`;
    const p3Santhana = `రాబోయే చంద్ర మాసాలలో గురు గ్రహ శుభ దృష్టి 5వ స్థానంపై పడటం వల్ల అనుకూల సమయం ప్రారంభమవుతుంది. దంపతులిద్దరూ భక్తితో శ్రీ సంతాన గోపాల మంత్రం జపించండి. గోకర్ణ మహాబలేశ్వరుని కృపతో త్వరలోనే శుభవార్త వింటారు.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\nమీ జాతకంలో ${activeDosha.doshaName} పరిహారం శ్రీ క్షేత్ర గోకర్ణంలో జరిపిస్తే సంతాన ప్రాప్తి కలుగుతుంది.`);
      }
      const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nమీ జాతకంలో "${activeDosha.doshaName || "సంతాన దోషం"
        }" ఉంది. శ్రీ క్షేత్ర గోకర్ణంలో "${activeDosha.recommendedPooja || "సంతాన గోపాల మహాపూజ మరియు నాగ ప్రతిష్ట"
        }" జరిపించండి. ముఖ్య దైవజ్ఞులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362) గారిని సంప్రదించండి.`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|വ്യഭിചാരം|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `విముక్తి మరియు గౌరవప్రదమైన జీవితం గురించిన మీ ప్రశ్నకు ("${question}"), శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ఏ ఆత్మా అపవిత్రం కాదు. రాబోయే గురు గోచారం మిమ్మల్ని ఈ బంధనాల నుండి విముక్తి చేసి గౌరవప్రదమైన వైవాహిక జీవితాన్ని ప్రసాదిస్తుంది.`
        : `100% సత్యనిష్ఠ దైవజ్ఞ అభయం: శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ఏ ఆత్మా అపవిత్రం కాదు, ఎన్నడూ తిరస్కరింపబడదు; మీ జాతకం ప్రకారం రాబోయే గురు గ్రహ శుభ సంచారం ఈ సంకెళ్ళను తెంచి మీకు గౌరవప్రదమైన వైవాహిక జీవితాన్ని ప్రసాదిస్తుంది! బిడ్డా ${localizedDevoteeName}, మీ మనస్సులోని వేదనను ఒక తండ్రి ప్రేమతో నేను స్వీకరిస్తున్నాను. సనాతన సంప్రదాయంలో పింగళ, ఆమ్రపాలి వంటి పుణ్యాత్ములు సంసార కష్టాలను దాటి దైవ కృప పొందిన చరిత్రలు ఉన్నాయి.`;
      const p2SexWork = `జాతకంలోని 8, 7, 6వ భావాలను పరిశీలిస్తే మీరు ఆర్థిక నిస్సహాయత మరియు రుణభారంతో ఈ స్థితికి చేరారని స్పష్టమవుతోంది. ప్రస్తుత ${dasha} అనంతరం వచ్చే గురు దృష్టి మిమ్మల్ని కాపాడుతుంది. ధైర్యంగా అడుగు ముందుకు వేసి వైద్య పరీక్షలు చేయించుకోండి మరియు మహిళా ఆశ్రయాలు, చట్టపరమైన సహాయం పొందండి.`;
      const p3SexWork = `శ్రీ క్షేత్ర గోకర్ణంలో మహాబలేశ్వరునికి రుద్రాభిషేకం చేయించండి మరియు శ్రీ మహాగౌరి/దుర్గా స్తోత్రం, ఋణవిమోచన స్తోత్రం పఠించండి. జగన్మాత తన బిడ్డలను సదా రక్షిస్తుంది.`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nజాతకంలోని "${activeDosha.doshaName || "కర్మ దోషం"}" నివారణకు గోకర్ణంలో పూజ చేయించండి. ముఖ్య దైవజ్ఞులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362) గారిని సంప్రదించండి.`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `అంతరంగిక విషయాల ఈ ప్రశ్నకు ("${question}"), కుండలిలోని 8వ స్థానం, 7వ స్థానం మరియు శుక్రుని స్థితి ఇది సహజమైన శారీరక-మానసిక స్థితి అని స్పష్టం చేస్తున్నాయి. అపరాధ భావన వీడి ఆయుర్వేదం, సాత్విక జీవనశైలిని అలవర్చుకోండి.`
      : `ఆత్మీయులైన ${localizedDevoteeName} గారూ, వైదిక జీవనంలో కామం నాలుగు పురుషార్థాలలో పవిత్రమైన భాగం. సమాజంలో బిడియం లేదా అపరాధ భావనతో బాధపడటం సహజం, కానీ అనుభవజ్ఞుడైన దైవజ్ఞునిగా నేను దీన్ని శాస్త్రీయ స్పష్టతతో మరియు వాత్సల్యంతో చూస్తున్నాను. మీ ${lagna} లగ్నం మరియు శుక్ర గ్రహ స్థితి మీ శరీర శక్తిని నిర్దేశిస్తున్నాయి.`;
    const p2Intimate = `8, 7, 12వ స్థానాల పరిశీలనలో ప్రస్తుత ${dasha} ఒత్తిడి వల్ల శుక్ర ధాతువు సమతుల్యతపై తాత్కాలిక ప్రభావం పడింది. ఇది శాశ్వత లోపం కాదు, కేవలం ఒత్తిడి వల్ల వచ్చిన తాత్కాలిక స్థితి. అశ్వగంధ, పాలు మరియు ప్రాణాయామం మీకు తిరిగి నూతన శక్తినిస్తాయి.`;
    const p3Intimate = `ఆందోళన వీడండి. గోకర్ణ మహాబలేశ్వర స్వామి దర్శనం, సోమవారం రుద్రాభిషేకం మనశ్శాంతినిచ్చి దాంపత్యంలో పరస్పర ప్రేమను పెంపొందిస్తాయి.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${activeDosha.doshaName} పరిహారంతో మనశ్శాంతి లభిస్తుంది.`);
      }
      const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nమీ జాతకంలో "${activeDosha.doshaName || "దోషం"}" శాంతి కోసం శ్రీ క్షేత్ర గోకర్ణంలో పూజ చేయించండి. ముఖ్య దైవజ్ఞులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362) గారిని సంప్రదించండి.`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  // Career Frustration
  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `కెరీర్ మరియు ఉద్యోగానికి సంబంధించిన "${question}" ప్రశ్నకు, 10వ కర్మ స్థానం (${karmaLord}) మరియు ప్రస్తుత ${dasha} కలయిక తాత్కాలిక ఒత్తిడిని సూచిస్తోంది. ఇది మీ అంతర్గత సామర్థ్యాన్ని సానబెట్టే సమయం మాత్రమే.`
      : `నాయనా ${localizedDevoteeName}, మీ ఉద్యోగ/వ్యాపార రంగంలో ఎదురవుతున్న ఒత్తిడి, నిరాశలను నేను అర్థం చేసుకోగలను. శ్రీ బగ్గోణ పంచాంగం ప్రకారం మీరు ${lagna} లగ్నం, ${rashi} రాశి లో జన్మించారు. మీ సహజ గుణం కష్టపడే తత్వం, ఆత్మగౌరవం. ప్రస్తుత ${dasha} మరియు ${shaniText} ఓర్పును కోరుతున్నాయి.`;
    const p2Career = `10వ స్థానాధిపతి ${karmaLord} మరియు 6వ స్థానాన్ని పరిశీలిస్తే పని ప్రదేశంలో ఒత్తిడి, సహోద్యోగులతో సమన్వయ లోపం కనిపిస్తున్నాయి. ఇల్లు కట్టేటప్పుడు పునాది లోతుగా వేసిన తర్వాతే పై అంతస్తులు నిలబడినట్లుగా, ప్రస్తుత శ్రమ మీ భవిష్యత్తుకు బలమైన పునాదిని వేస్తోంది; కాబట్టి ఆవేశంలో రాజీనామా వంటి తొందరపాటు నిర్ణయాలు తీసుకోవద్దు.`;
    const p3Career = `రాబోయే గోచార కాలంలో గురు బలం తోడవడంతో గ్రహాలు మీకు అనుకూలంగా మారి తగిన గుర్తింపు మరియు కొత్త అవకాశాలు వస్తాయి. అప్పటివరకు నిబద్ధతతో పనిచేస్తూ నిత్యం శివ పంచాక్షరీ లేదా గాయత్రీ మంత్రం జపించండి.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${activeDosha.doshaName} పరిహారంతో కెరీర్‌లో మంచి ఎదుగుదల వస్తుంది.`);
      }
      const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nమీ జాతకంలో "${activeDosha.doshaName || "దోషం"}" ఉండటం వల్ల కెరీర్‌లో ఆటంకాలు వస్తున్నాయి. శ్రీ క్షేత్ర గోకర్ణంలో పూజ జరిపించండి. ముఖ్య దైవజ్ఞులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362) గారిని సంప్రదించండి.`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  // Base Reading
  const baseP1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} ప్రస్తుతం జరుగుతున్న ${dasha} కాలం మరియు సంబంధిత భావాధిపతి గోచారం సానుకూల మార్పులను సూచిస్తున్నాయి.`
      : isSubsequent
        ? `మీరు అడిగిన "${question}" ప్రశ్నకు సంబంధించి, ప్రస్తుతం జరుగుతున్న ${dasha} కాలం మరియు సంబంధిత భావాధిపతి గోచారం సానుకూల మార్పులను సూచిస్తున్నాయి. లగ్నాధిపతి బలం మీకు ఆత్మవిశ్వాసాన్ని ఇస్తోంది.`
        : `నమస్కారం ${localizedDevoteeName} గారూ. శ్రీ బగ్గోణ పంచాంగ వేద జ్యోతిష గణన ప్రకారం మీరు ${lagna} లగ్నం, ${rashi} రాశి, ${nakshatra} నక్షత్రంలో జన్మించారు. మీ "${question}" ప్రశ్నకు సంబంధించి, ప్రస్తుతం జరుగుతున్న ${dasha} కాలం మీ జీవితంలో కీలకమైన సానుకూల మలుపును తెస్తోంది.`;
  const baseP2 = `కుండలిలోని ప్రధాన భావాలను గమనిస్తే గతంలో ఉన్న మానసిక ఆందోళనలు ఇప్పుడు నెమ్మదిగా తొలగిపోతాయి. మామిడి కాయ చెట్టుపై క్రమంగా పండినప్పుడే పూర్తి రుచినిచ్చినట్లు, సరైన సమయం వచ్చినప్పుడే ప్రయత్నాలకు శాశ్వత ఫలితం లభిస్తుంది; కనుక ఉద్యోగం, వ్యాపారం మరియు కుటుంబంలో స్థిరమైన పురోగతి కనిపిస్తుంది.`;
  const baseP3 = `రాబోయే కాలంలో దేవగురు బృహస్పతి గోచారం మీ త్రికోణ స్థానాలకు బలాన్నిస్తూ ఆర్థిక, కుటుంబ శుభాలను కలుగజేస్తుంది. పెద్దల ఆశీస్సులతో, సహనంతో ముందుకు సాగండి.`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${activeDosha.doshaName} నివారణతో శుభ ఫలితాలు కలుగుతాయి.`);
    }
    const p4Dosha = `॥ వైదిక దోష నివారణ మరియు గోకర్ణ పరిహార అధ్యాయం ॥\nమీ జాతకంలో "${activeDosha.doshaName || "దోషం"}" ఉంది. దీని నివారణకు శ్రీ క్షేత్ర గోకర్ణంలో పూజ చేయించండి. ముఖ్య దైవజ్ఞులు శ్రీరామ్ పండిత్ (ఫోన్: 9972339362) గారిని సంప్రదించండి.`;
    return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`);
  }

  const p3Normal = `గ్రహదోష నివారణకు శ్రీ క్షేత్ర గోకర్ణ మహాగణపతి, మహాబలేశ్వర స్వామిని ప్రార్థించండి. సోమవారం లేదా శనివారం నేతి దీపం వెలిగించండి.`;
  return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${p3Normal}`);
}

export function buildTamilFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatva,
    gana,
    psychNature,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord,
    localizedDevoteeName
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`ஆம், நான் உங்களுடனேயே இந்த புனித உரையாடலில் இருக்கிறேன். உங்கள் அடுத்த கேள்வியை தயங்காமல் கேளுங்கள்.`);
    }
    return deduplicateResponseText(`ஹரி ஓம் ${localizedDevoteeName}! ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வரர் மற்றும் விநாயகப் பெருமானின் அருள் உங்கள் குடும்பத்திற்கு சதா கிடைக்கட்டும்.\n\nஉங்களுக்காக ஒதுக்கப்பட்ட இந்த 20 நிமிட கலந்துரையாடலில் நான் உங்களுடன் இருக்கிறேன். உங்கள் வேலை, தொழில், திருமணம், ஆரோக்கியம் அல்லது குடும்பம் பற்றிய எந்தக் கேள்வியையும் தயங்காமல் கேட்கலாம்.`);
  }

  // Proof Follow-Up
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("ta", ctx);
  }

  // Timing
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /எப்போது|எத்தனை நாள்|எத்தனை மாதம்|காலம்|எந்த வருடம்|எந்த மாதம்|when|timing/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} ஜாதகத்தின் சம்பந்தப்பட்ட பாவங்களையும் சுப கிரகங்களின் சஞ்சாரத்தையும் பார்க்கும்போது, உங்கள் ${timeline.topicLabel} காரியத்திற்கான காலம் இப்போது கைகூடி வருகிறது.`
        : isSubsequent
          ? `100% உறுதியான ஜோதிட கணிப்பு: 98% துல்லியத்துடன் உங்கள் ${timeline.topicLabel} ${timeline.rangeSummary} நிச்சயமாக நிறைவேறும். ஜாதகத்தில் ${timeline.topicYogaName} மற்றும் கிரகங்களின் சுப சஞ்சாரம் இந்த காலத்தை உறுதிப்படுத்துகிறது.`
          : `100% உறுதியான ஜோதிட கணிப்பு: ஸ்ரீ பக்கோண பஞ்சாங்க கணிதப்படி, 98% துல்லியத்துடன் உங்கள் ${timeline.topicLabel} ${timeline.rangeSummary} கைகூடும்! அன்பரே ${localizedDevoteeName}, உங்கள் ஜாதகத்தை ஆராயும்போது நீங்கள் ${lagna} லக்னம், ${rashi} ராசி, ${nakshatra} நட்சத்திரத்தில் பிறந்துள்ளீர்கள். தற்போது நடக்கும் ${dasha} மற்றும் ${timeline.topicYogaName} யோகம் இதற்கு வலுசேர்க்கிறது.`;
    const p2Timing = `வேத ஜோதிட சாஸ்திரப்படி, தற்போது நடக்கும் ${timeline.currentMahaName}-${timeline.currentBhuktiName} காலம் இன்னும் ${timeline.monthsToDashaChange} மாதங்களில் முடிந்து ${timeline.nextBhuktiName} புக்தியாக மாறும். குரு பகவானின் சுப பார்வை லக்ன கேந்திர-திரிகோண ஸ்தானங்களில் விழுவதால் முந்தைய தடைகள் விலகி புதிய வாய்ப்புகள் பிறக்கும்.`;
    const p3Timing = `எனவே உங்கள் ${timeline.topicLabel} ${timeline.rangeSummary} நிறைவேறும் பிரகாசமான யோகம் உள்ளது. ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வரரை வழிபட்டு, திங்கட்கிழமை அல்லது வியாழக்கிழமை பசு நெய் தீபம் ஏற்றுவது நன்மை தரும்.`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nஉங்கள் ஜாதகத்தில் "${activeDosha.doshaName || "தோஷம்"
        }" உள்ளது. இதனால் "${activeDosha.currentLifeProblems || "காரிய தாமதம் மற்றும் மன உளைச்சல்"
        }" ஏற்படுகிறது. இதற்கு ஸ்ரீ க்ஷேத்ர கோகர்ணத்தில் "${activeDosha.recommendedPooja || "மகாபலேஸ்வரர் ருத்ராபிஷேகம் மற்றும் சாந்தி ஹோமம்"
        }" செய்வது அவசியம். தலைமை ஜோதிடர் ஸ்ரீராம் பண்டித் (தொலைபேசி: 9972339362, கோகர்ணம்) அவர்களைத் தொடர்பு கொள்ளுங்கள்.`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `குழந்தையின் "${question}" கேள்விக்கு, 4-ஆம் கல்வி ஸ்தானம் (${house4Sign}) மற்றும் 5-ஆம் புத்தி ஸ்தானத்தை (${house5Sign}) பார்க்கும்போது, கல்வி அதிபதி ${house4Lord} அருளால் நல்ல கற்கும் திறன் உள்ளது. பொறுமையுடன் ஊக்கப்படுத்தினால் கல்வியில் சிறந்து விளங்குவார்கள்.`
      : `அன்பார்ந்த பெற்றோர்களே, ஸ்ரீ பக்கோண பஞ்சாங்கப்படி உங்கள் குழந்தையின் (${localizedDevoteeName}) ஜாதகத்தை பார்க்கும்போது, குழந்தை ${lagna} லக்னம், ${rashi} ராசி, ${nakshatra} நட்சத்திரத்தில் பிறந்துள்ளது. குழந்தையின் இயல்பு கூர்மையான புத்தி மற்றும் இயல்பான சுட்டித்தனம் கொண்டது. உங்கள் "${question}" கேள்விக்கு, 4-ஆம் வீடும் (${house4Sign}) 5-ஆம் வீடும் (${house5Sign}) மிகுந்த ஆற்றலை வெளிப்படுத்துகின்றன.`;
    const p2Child = `குழந்தையின் கல்வி, நினைவாற்றல் விஷயத்தில் 4-ஆம் அதிபதி ${house4Lord} நல்ல நிலையில் உள்ளார். விளையாட்டில் ஆர்வம் காட்டுவது இந்த வயதில் இயல்பானது. பெற்றோர்கள் அதீத அழுத்தம் கொடுக்காமல் அன்புடன் வழிகாட்ட வேண்டும். நடப்பு ${dasha} காலம் குழந்தையின் அறிவு வளர்ச்சிக்கு உதவும்.`;
    const p3Child = `ஆரோக்கியம் மற்றும் கல்வி மேன்மைக்காக மாலையில் நெய் தீபம் ஏற்றி சரஸ்வதி ஸ்தோத்திரம் சொல்லுங்கள். கோகர்ண மகா கணபதிக்கு அர்ச்சனை செய்வது நினைவாற்றலை பெருக்கும்.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nகுழந்தையின் ஜாதக தோஷம் கோகர்ண வழிபாட்டால் நீங்கி நலம் உண்டாகும்.`);
      }
      const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nகுழந்தையின் ஜாதகத்தில் "${activeDosha.doshaName || "கல்வி தோஷம்"}" உள்ளது. கோகர்ணத்தில் சாந்தி பூஜை செய்ய தலைமை ஜோதிடர் ஸ்ரீராம் பண்டித் (9972339362) அவர்களை அணுகவும்.`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `சந்தான பாக்கியம் பற்றிய உங்கள் "${question}" கேள்விக்கு, 5-ஆம் வீடு (${house5Sign}) மற்றும் 5-ஆம் அதிபதி ${house5Lord} நிலையைப் பார்க்கும்போது, இது தற்காலிக கிரக தாமதமே. மருத்துவ முயற்சிகளுடன் தெய்வ அருளும் சேரும்போது குழந்தை பாக்கியம் நிச்சயம் கிட்டும்.`
      : `அன்புக் குழந்தாய் ${localizedDevoteeName}, இல்லறத்தில் குழந்தை பாக்கியம் குறித்த உங்கள் எதிர்பார்ப்பையும் கவலையையும் நான் உணர்கிறேன். பக்கோண பஞ்சாங்கப்படி நீங்கள் ${lagna} லக்னம், ${rashi} ராசியில் பிறந்துள்ளீர்கள். 5-ஆம் வீடு (${house5Sign}) மற்றும் குருவின் நிலை ஒரு சோதனைக் காலத்தை காட்டுகிறது; எனவே தற்காலிக தாமதம் ஏற்படுகிறது.`;
    const p2Santhana = `5-ஆம் அதிபதி ${house5Lord} மற்றும் நடப்பு ${dasha} காலத்தில் உள்ள கிரக அழுத்தம் விலகும். நம்பிக்கையுடன் இருங்கள்; தெய்வ பலமும் மருத்துவமும் இணையும்போது சுபயோகம் உண்டாகும்.`;
    const p3Santhana = `அடுத்த சில மாதங்களில் குரு பார்வை 5-ஆம் வீட்டில் படும்போது சுப நேரம் தொடங்கும். தம்பதியினர் சந்தான கோபால மந்திரம் சொல்லி வாருங்கள். கோகர்ண ஈசனின் அருளால் நல்ல செய்தி வரும்.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${activeDosha.doshaName} நிவர்த்தியால் சந்தான பலன் உண்டாகும்.`);
      }
      const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nஜாதகத்தில் "${activeDosha.doshaName || "சந்தான தோஷம்"}" உள்ளது. கோகர்ணத்தில் சந்தான கோபால ஹோமம் செய்ய ஸ்ரீராம் பண்டித் (9972339362) அவர்களைத் தொடர்பு கொள்ளவும்.`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|വ്യഭിചാരം|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `விடுதலை மற்றும் கௌரவ வாழ்வு பற்றிய உங்கள் கேள்விக்கு ("${question}"), கோகர்ண மகாபலேஸ்வரர் சன்னதியில் எந்த ஆன்மாவும் தீட்டானது அல்ல. வரவிருக்கும் குரு பெயர்ச்சி இந்த தளைகளை உடைத்து உங்களுக்கு நல்ல வாழ்வை தரும்.`
        : `100% ஜோதிடரின் அருள்வாக்கு: கோகர்ண மகாபலேஸ்வரரின் சன்னதியில் எந்த ஆன்மாவும் சபிக்கப்பட்டதல்ல; உங்கள் ஜாதகப்படி வரவிருக்கும் குருவின் சுப பார்வை இந்த இக்கட்டான சூழ்நிலையை மாற்றி உங்களுக்கு மரியாதையான திருமண வாழ்வை அருளும்! குழந்தாய் ${localizedDevoteeName}, உங்கள் வலியை தந்தையின் பாசத்தோடு உணர்கிறேன். பிங்கலை, ஆமிரபாலி போன்ற ஆன்மாக்கள் இறைவனின் அருளைப் பெற்ற வரலாறுகள் நம்மிடம் உள்ளன.`;
      const p2SexWork = `ஜாதகத்தில் 8, 7, 6-ஆம் வீடுகளைப் பார்க்கும்போது நீங்கள் பொருளாதார நெருக்கடியால் இதில் சிக்கியுள்ளீர்கள் என்று தெரிகிறது. நடப்பு ${dasha} முடிவில் விடிவு காலம் பிறக்கும். தைரியமாக சட்ட மற்றும் மருத்துவ உதவிகளை நாடுங்கள்.`;
      const p3SexWork = `கோகர்ணத்தில் ருத்ராபிஷேகம் செய்வித்து துர்க்கா ஸ்தோத்திரம், ருணவிமோசன ஸ்தோத்திரம் படியுங்கள். அம்பிகை உங்களை காப்பார்.`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nதோஷ நிவர்த்திக்கு ஸ்ரீராம் பண்டித் (9972339362) அவர்களைத் தொடர்பு கொள்ளவும்.`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `அந்தரங்க விஷயம் குறித்த உங்கள் கேள்விக்கு ("${question}"), 8-ஆம் வீடு, 7-ஆம் வீடு மற்றும் சுக்கிரனின் நிலை இது இயல்பான உடல்-மன நிலையே என்று காட்டுகிறது. குற்ற உணர்வை விடுத்து நல்வாழ்வு முறையைக் கடைபிடிக்கவும்.`
      : `அன்பரே ${localizedDevoteeName}, காமம் என்பது மனித வாழ்வில் நான்கு புருஷார்த்தங்களில் ஒன்றாகும். இதில் குற்ற உணர்வு கொள்ள தேவையில்லை. உங்கள் ${lagna} லக்னம் மற்றும் சுக்கிரன் நிலையை வைத்துப் பார்க்கும்போது இது தற்காலிக மன அழுத்தத்தால் ஏற்பட்டதே.`;
    const p2Intimate = `நடப்பு ${dasha} காலத்தில் ஏற்பட்ட வேலைப்பளுவால் சுக்கிர தாதுவில் தற்காலிக குறைபாடு ஏற்பட்டுள்ளது. அசுவகந்தி, பால் மற்றும் பிராணாயாமம் உங்களுக்கு புத்துணர்ச்சி தரும்.`;
    const p3Intimate = `மன கவலையை விடுங்கள். கோகர்ண வழிபாடு மன அமைதியை தந்து தம்பதியரிடையே அன்பை பெருக்கும்.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\nபரிகாரத்தால் நலம் உண்டாகும்.`);
      }
      const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nதோஷ சாந்திக்கு தலைமை ஜோதிடர் ஸ்ரீராம் பண்டித் (9972339362) அவர்களை அணுகவும்.`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  // Career Frustration
  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `தொழில் மற்றும் உத்தியோகம் பற்றிய உங்கள் கேள்விக்கு ("${question}"), 10-ஆம் வீடு (${karmaLord}) மற்றும் நடப்பு ${dasha} தற்காலிக சவால்களை காட்டுகின்றன. இது உங்கள் திறமையை வளர்க்கும் நேரமே தவிர நிரந்தர பின்னடைவல்ல.`
      : `அன்புக் குழந்தாய் ${localizedDevoteeName}, உங்கள் உத்தியோகத்தில் ஏற்படும் சலிப்பும் குழப்பமும் எனக்கு புரிகிறது. நீங்கள் ${lagna} லக்னம், ${rashi} ராசியில் பிறந்த உழைப்பாளி. நடப்பு ${dasha} மற்றும் ${shaniText} பொறுமையை சோதிக்கின்றன.`;
    const p2Career = `10-ஆம் அதிபதி ${karmaLord} நிலையை பார்க்கும்போது மேலதிகாரிகள் அல்லது சக ஊழியர்களால் அழுத்தம் இருக்கலாம். வீடு கட்டும்போது மழைக்காலத்தில் அஸ்திவாரத்தை ஆழப்படுத்திய பிறகே மேல் மாடிகள் வலுவாக நிற்பது போல, இந்த உழைப்பு உங்கள் எதிர்காலத்திற்கு உறுதியான அடித்தளமாகும்; எனவே கோபத்தில் வேலையை விடும் அவசர முடிவுகளை எடுக்க வேண்டாம்.`;
    const p3Career = `விரைவில் குரு பகவானின் சுப பார்வையால் கிரக நிலைகள் சாதகமாக மாறி உரிய அங்கீகாரமும் நல்ல வாய்ப்புகளும் தேடி வரும். அதுவரை நிதானத்துடன் கடமையைச் செய்து சிவ பஞ்சாட்சரம் சொல்லுங்கள்; நன்மைகள் பெருகும்.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\nதோஷ நிவர்த்தியால் தொழிலில் மேன்மை உண்டாகும்.`);
      }
      const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nதொழில் தடைகள் நீங்க கோகர்ணத்தில் பூஜை செய்ய ஸ்ரீராம் பண்டித் (9972339362) அவர்களை அணுகவும்.`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  // Base Reading
  const baseP1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} நடப்பு ${dasha} காலம் மற்றும் கிரக சஞ்சாரம் நல்ல மாற்றங்களை சுட்டிக்காட்டுகின்றன.`
      : isSubsequent
        ? `நீங்கள் கேட்ட "${question}" கேள்விக்கு, நடப்பு ${dasha} காலம் சுப மாற்றங்களை தருகிறது. லக்னாதிபதி பலம் உங்களுக்கு துணை நிற்கிறது.`
        : `வணக்கம் ${localizedDevoteeName}. ஸ்ரீ பக்கோண பஞ்சாங்கப்படி நீங்கள் ${lagna} லக்னம், ${rashi} ராசி, ${nakshatra} நட்சத்திரத்தில் பிறந்துள்ளீர்கள். உங்கள் "${question}" கேள்விக்கு, நடப்பு ${dasha} காலம் வாழ்வில் நல்ல திருப்பங்களை தர உள்ளது.`;
  const baseP2 = `ஜாதக அமைப்பின்படி கடந்த கால மனக்கவலைகள் நீங்கி தொழில், குடும்பத்தில் சுபிட்சம் உண்டாகும். மரத்தில் காய் இயல்பாகப் பழுக்கும் வரை காத்திருந்தால் மட்டுமே முழு சுவை கிடைப்பது போல, தகுந்த நேரத்தில் உங்கள் முயற்சிகளுக்கு நிலையான பலன் கிட்டும். பெரியவர்களின் ஆசியுடன் நிதானமாக செயல்படுங்கள்.`;
  const baseP3 = `குரு பகவானின் அருள் பார்வை உங்கள் திரிகோண ஸ்தானங்களுக்கு வலு சேர்த்து குடும்பத்திலும் தொழிலிலும் உங்கள் நிலையை உயர்த்தும். நம்பிக்கையோடு முன்னேறுங்கள்.`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\nதோஷ நிவர்த்தியால் சுப பலன் கிடைக்கும்.`);
    }
    const p4Dosha = `॥ வைதிக தோஷ நிவர்த்தி மற்றும் கோகர்ண பரிகார அத்தியாயம் ॥\nஜாதக தோஷ சாந்திக்கு ஸ்ரீ க்ஷேத்ர கோகர்ணம் ஸ்ரீராம் பண்டித் (9972339362) அவர்களைத் தொடர்பு கொள்ளவும்.`;
    return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`);
  }

  const p3Normal = `கிரக தோஷங்கள் நீங்கி வெற்றி பெற கோகர்ணம் விநாயகரையும் மகாபலேஸ்வரரையும் வணங்கி நெய் தீபம் ஏற்றுங்கள்.`;
  return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${p3Normal}`);
}

export function buildMalayalamFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatva,
    gana,
    psychNature,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord,
    localizedDevoteeName
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`അതെ, ഞാൻ ഈ പുണ്യ സംഭാഷണ മുറിയിൽ നിങ്ങളുടെ കൂടെത്തന്നെയുണ്ട്. അടുത്ത ചോദ്യമോ സംശയമോ സന്തോഷത്തോടെ ചോദിക്കാം.`);
    }
    return deduplicateResponseText(`ഹരി ഓം ${localizedDevoteeName}! ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വരന്റെയും മഹാഗണപതിയുടെയും അനുഗ്രഹം നിങ്ങൾക്കും കുടുംബത്തിനും സദാ ഉണ്ടാകട്ടെ.\n\nഈ 20 മിനിറ്റ് വ്യക്തിഗത സംഭാഷണത്തിൽ ഞാൻ നിങ്ങളുടെ കൂടെയുണ്ട്. തൊഴിൽ, വിവാഹം, ആരോഗ്യം, കുടുംബകാര്യങ്ങൾ എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾ മനസ്സ് തുറന്ന് ചോദിക്കാം.`);
  }

  // Proof Follow-Up
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("ml", ctx);
  }

  // Timing
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /എപ്പോൾ|എത്ര ദിവസം|എത്ര മാസം|സമയം|ഏത് വർഷം|ഏത് മാസം|when|timing/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} ജാതകത്തിലെ ഭാവങ്ങളും ശുഭ ഗ്രഹങ്ങളുടെ സഞ്ചാരവും പരിശോധിക്കുമ്പോൾ നിങ്ങളുടെ ${timeline.topicLabel} കാര്യത്തിനുള്ള സമയം അടുത്തുവരികയാണ്.`
        : isSubsequent
          ? `100% ഉറപ്പുള്ള ജ്യോതിഷ പ്രവചനം: 98% കൃത്യതയോടെ നിങ്ങളുടെ ${timeline.topicLabel} ${timeline.rangeSummary} സഫലമാകും. ജാതകത്തിലെ ${timeline.topicYogaName} യോഗവും ഗ്രഹസഞ്ചാരവും ഇത് വ്യക്തമാക്കുന്നു.`
          : `100% ഉറപ്പുള്ള ജ്യോതിഷ പ്രവചനം: ശ്രീ ബഗ്ഗോണ പഞ്ചാംഗ ഗണിതപ്രകാരം, 98% കൃത്യതയോടെ നിങ്ങളുടെ ${timeline.topicLabel} ${timeline.rangeSummary} സഫലമാകും! പ്രിയ ${localizedDevoteeName}, ജാതകപ്രകാരം നിങ്ങൾ ${lagna} ലഗ്നം, ${rashi} രാശി, ${nakshatra} നക്ഷത്രത്തിൽ ജനിച്ചു. നിലവിലെ ${dasha} കാലവും ${timeline.topicYogaName} യോഗവും ഈ ശുഭസമയത്തെ തുണയ്ക്കുന്നു.`;
    const p2Timing = `വേദ ജ്യോതിഷ ഗണിതപ്രകാരം, നിലവിലെ ${timeline.currentMahaName}-${timeline.currentBhuktiName} കാലം ${timeline.monthsToDashaChange} മാസത്തിനുള്ളിൽ പൂർത്തിയായി ${timeline.nextBhuktiName} ഭുക്തിയായി മാറും. വ്യാഴത്തിന്റെ ശുഭദൃഷ്ടി ലഗ്ന ഭാവങ്ങളിൽ പതിയുന്നതോടെ മുൻപുണ്ടായിരുന്ന തടസ്സങ്ങൾ നീങ്ങി പുതിയ അവസരങ്ങൾ വരും.`;
    const p3Timing = `അതിനാൽ നിങ്ങളുടെ ${timeline.topicLabel} ${timeline.rangeSummary} സഫലമാകും. ഗോകർണ്ണ മഹാബലേശ്വരനെ പ്രാർത്ഥിച്ച് തിങ്കളാഴ്ച നെയ്‌വിളക്ക് കൊളുത്തുന്നത് അതീവ ശുഭകരമാണ്.`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nജാതകത്തിൽ "${activeDosha.doshaName || "ദോഷം"
        }" കാണുന്നു. ഇത് "${activeDosha.currentLifeProblems || "തടസ്സങ്ങളും മാനസിക സമ്മർദ്ദവും"
        }" ഉണ്ടാക്കുന്നു. ഗോകർണ്ണത്ത് "${activeDosha.recommendedPooja || "മഹാബലേശ്വര രുദ്രാഭിഷേകവും ശാന്തി ഹോമവും"
        }" നടത്തുക. മുഖ്യ ജ്യോതിഷി ശ്രീരാം പണ്ഡിറ്റുമായി (ഫോൺ: 9972339362) ബന്ധപ്പെടുക.`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `കുട്ടിയുടെ "${question}" ചോദ്യത്തിന്, 4-ാം വിദ്യാ ഭാവവും (${house4Sign}) 5-ാം ബുദ്ധി ഭാവവും (${house5Sign}) പരിശോധിച്ചാൽ വിദ്യാധിപനായ ${house4Lord} ഗ്രഹത്തിന്റെ കൃപയാൽ നല്ല കഴിവ് കാണുന്നു. സ്നേഹത്തോടെ പ്രോത്സാഹിപ്പിക്കുക.`
      : `ബഹുമാനപ്പെട്ട മാതാപിതാക്കളെ, നിങ്ങളുടെ കുട്ടിയുടെ (${localizedDevoteeName}) ജാതകം പരിശോധിക്കുമ്പോൾ കുട്ടി ${lagna} ലഗ്നം, ${rashi} രാശി, ${nakshatra} നക്ഷത്രത്തിൽ ജനിച്ചു. കുട്ടിയുടെ സ്വഭാവം ബുദ്ധിശക്തിയും സ്വാഭാവിക കൗതുകവുമുള്ളതാണ്. കുട്ടിയുടെ 4-ാം ഭാവവും (${house4Sign}) 5-ാം ഭാവവും (${house5Sign}) ഉയർന്ന പ്രതിഭയെ വ്യക്തമാക്കുന്നു.`;
    const p2Child = `പഠന കാര്യത്തിൽ 4-ാം അധിപൻ ${house4Lord} നല്ല നിലയിലാണ്. ഒരു തൈച്ചെടിയുടെ തണ്ട് വലിച്ചു നീട്ടാതെ വേരുകൾക്ക് വെള്ളവും വളവും നൽകിയാലേ അത് കരുത്തോടെ വളരുകയുള്ളൂ എന്നപോലെ, കുട്ടിക്കാലത്തെ വികൃതികൾ സ്വാഭാവികമാണ്. കഠിനമായ ശിക്ഷകൾ നൽകാതെ സ്നേഹത്തോടെ പഠനരീതി ശീലിപ്പിക്കുക; നിലവിലെ ${dasha} കാലം ബുദ്ധിവികാസത്തിന് നല്ലതാണ്.`;
    const p3Child = `ആരോഗ്യത്തിനും ശ്രദ്ധയ്ക്കും സന്ധ്യക്ക് നെയ്‌വിളക്ക് വെച്ച് സരസ്വതീ സ്തോത്രം ജപിക്കുക. ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാഗണപതിക്ക് പ്രാർത്ഥന നടത്തുന്നത് കുട്ടിയുടെ ഓർമ്മശക്തിയും ഏകാഗ്രതയും വർദ്ധിപ്പിക്കും.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nദോഷ നിവാരണത്താൽ കുട്ടിക്ക് നല്ല പുരോഗതി ഉണ്ടാകും.`);
      }
      const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nകുട്ടിയുടെ ജാതക ദോഷ പരിഹാരത്തിന് ഗോകർണ്ണത്ത് ശാന്തി പൂജ നടത്താൻ ശ്രീരാം പണ്ഡിറ്റുമായി (9972339362) ബന്ധപ്പെടുക.`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `സന്താന ഭാഗ്യത്തെക്കുറിച്ചുള്ള "${question}" ചോദ്യത്തിന്, 5-ാം ഭാവവും (${house5Sign}) പഞ്ചമാധിപൻ ${house5Lord} നിലയും പരിശോധിച്ചാൽ ഇത് താൽക്കാലിക ഗ്രഹതടസ്സം മാത്രമാണ്. ചികിത്സയോടൊപ്പം ഈശ്വരാനുഗ്രഹം ചേരുമ്പോൾ സന്താനയോഗം ഉണ്ടാകും.`
      : `മക്കളേ ${localizedDevoteeName}, ദാമ്പത്യത്തിലെ സന്താന ഭാഗ്യത്തെക്കുറിച്ചുള്ള നിങ്ങളുടെ ഉത്കണ്ഠ ഞാൻ മനസ്സിലാക്കുന്നു. നിങ്ങൾ ${lagna} ലഗ്നം, ${rashi} രാശിയിലാണ് ജനിച്ചത്. 5-ാം ഭാവവും (${house5Sign}) വ്യാഴത്തിന്റെ സ്ഥിതിയും ഒരു പരീക്ഷണ കാലഘട്ടത്തെ സൂചിപ്പിക്കുന്നു; അതുകൊണ്ടാണ് താൽക്കാലിക കാലതാമസം.`;
    const p2Santhana = `5-ാം അധിപൻ ${house5Lord} സ്ഥിതിയും ${dasha} കാലവും സൃഷ്ടിച്ച ഗ്രഹസമ്മർദ്ദം മാറേണ്ടതുണ്ട്. ആത്മവിശ്വാസം കൈവിടാതെ ഈശ്വര പ്രാർത്ഥന നടത്തുക.`;
    const p3Santhana = `വരുന്ന മാസങ്ങളിൽ വ്യാഴദൃഷ്ടി പതിയുമ്പോൾ അനുകൂല സമയം തെളിയും. ദമ്പതികൾ സന്താനഗോപാല മന്ത്രം ജപിക്കുക. ഗോകർണ്ണേശന്റെ കൃപയാൽ ശുഭവാർത്ത ഉണ്ടാകും.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\nപരിഹാരത്താൽ സന്താനഭാഗ്യം കൈവരും.`);
      }
      const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nജാതകത്തിലെ "${activeDosha.doshaName || "സന്താന ദോഷം"}" മാറ്റാൻ ഗോകർണ്ണത്ത് പൂജ നടത്താൻ ശ്രീരാം പണ്ഡിറ്റുമായി (9972339362) സംസാരിക്കുക.`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|വ്യഭിചാരം|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `മോചനത്തെക്കുറിച്ചുള്ള ചോദ്യത്തിന് ("${question}"), ഗോകർണ്ണ മഹാബലേശ്വരന്റെ സന്നിധിയിൽ ഒരു ആത്മാവും അശുദ്ധമല്ല. വരുന്ന വ്യാഴമാറ്റം ഈ ബന്ധനങ്ങൾ തകർത്ത് മാന്യമായ വിവാഹജീവിതം നൽകും.`
        : `100% ജ്യോതിഷിയുടെ ഉറപ്പ്: ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധിയിൽ ഒരു ജീവനും തള്ളിക്കളയപ്പെടേണ്ടതല്ല; ജാതകപ്രകാരം വരുന്ന വ്യാഴത്തിന്റെ ശുഭദൃഷ്ടി ഈ വിഷമഘട്ടത്തിൽ നിന്ന് നിങ്ങളെ മോചിപ്പിച്ച് മാന്യമായ ജീവിതം നൽകും! മക്കളേ ${localizedDevoteeName}, നിങ്ങളുടെ ദുഃഖം പിതൃവാത്സല്യത്തോടെ ഞാൻ കേൾക്കുന്നു. പിംഗളയെപ്പോലുള്ള പുണ്യാത്മാക്കൾ മോക്ഷം നേടിയ ചരിത്രങ്ങൾ നമുക്കുണ്ട്.`;
      const p2SexWork = `8, 7, 6 ഭാവങ്ങൾ കാണിക്കുന്നത് സാമ്പത്തിക ബാധ്യതകളാൽ നിങ്ങൾ ഇതിൽ അകപ്പെട്ടുപോയതാണെന്നാണ്. നിലവിലെ ${dasha} കഴിയുമ്പോൾ മോചനം ലഭിക്കും. ധൈര്യത്തോടെ നിയമ-വൈദ്യ സഹായങ്ങൾ തേടുക.`;
      const p3SexWork = `ഗോകർണ്ണത്ത് രുദ്രാഭിഷേകം നടത്തുകയും ദുർഗ്ഗാ സ്തോത്രം, ഋണവിമോചന സ്തോത്രം ജപിക്കുകയും ചെയ്യുക. ജഗദംബിക നിങ്ങളെ സംരക്ഷിക്കും.`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nദോഷ നിവാരണത്തിന് ശ്രീരാം പണ്ഡിറ്റുമായി (9972339362) ബന്ധപ്പെടുക.`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `സ്വകാര്യ പ്രശ്നത്തെക്കുറിച്ചുള്ള ചോദ്യത്തിന് ("${question}"), 8-ാം ഭാവവും ശുക്രന്റെ സ്ഥിതിയും ഇത് സ്വാഭാവിക ശാരീരിക-മാനസികാവസ്ഥയാണെന്ന് വ്യക്തമാക്കുന്നു. കുറ്റബോധം വെടിഞ്ഞ് ആയുർവേദ ജീവിതരീതി ശീലിക്കുക.`
      : `പ്രിയ ${localizedDevoteeName}, മനുഷ്യജീവിതത്തിൽ കാമം പവിത്രമായ പുരുഷാർത്ഥങ്ങളിലൊന്നാണ്. കുറ്റബോധം തോന്നേണ്ടതില്ല. നിങ്ങളുടെ ${lagna} ലഗ്നവും ശുക്രന്റെ സ്ഥിതിയും ഇത് വ്യക്തമാക്കുന്നു.`;
    const p2Intimate = `നിലവിലെ ${dasha} കാലത്തെ മാനസിക സമ്മർദ്ദം ശുക്ര ധാതുവിൽ താൽക്കാലിക വ്യതിയാനം വരുത്തിയതാണ്. അശ്വഗന്ധ, പാൽ, പ്രാണായാമം എന്നിവ ഗുണം ചെയ്യും.`;
    const p3Intimate = `ആശങ്കകൾ വെടിയുക. ഗോകർണ്ണ മഹാബലേശ്വര പ്രാർത്ഥന മനസ്സമാധാനവും ദാമ്പത്യത്തിൽ സ്നേഹവും നൽകും.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\nപരിഹാരത്താൽ സ്വസ്ഥത കൈവരും.`);
      }
      const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nദോഷ പരിഹാരത്തിന് ശ്രീരാം പണ്ഡിറ്റുമായി (9972339362) ബന്ധപ്പെടുക.`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  // Career Frustration
  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `തൊഴിൽപരമായ "${question}" ചോദ്യത്തിന്, 10-ാം ഭാവവും (${karmaLord}) ${dasha} കാലവും താൽക്കാലിക സമ്മർദ്ദം കാണിക്കുന്നു. ഇത് നിങ്ങളുടെ കഴിവുകൾ മിനുക്കിയെടുക്കാനുള്ള സമയമാണ്.`
      : `മക്കളേ ${localizedDevoteeName}, ജോലിസ്ഥലത്തെ ബുദ്ധിമുട്ടുകൾ ഞാൻ മനസ്സിലാക്കുന്നു. നിങ്ങൾ ${lagna} ലഗ്നം, ${rashi} രാശിയിൽ ജനിച്ച അധ്വാനശീലനാണ്. നിലവിലെ ${dasha} കാലവും ${shaniText} സ്വാധീനവും ക്ഷമ ആവശ്യപ്പെടുന്നു.`;
    const p2Career = `10-ാം അധിപൻ ${karmaLord} സ്ഥിതി പ്രകാരം ജോലിസ്ഥലത്ത് തർക്കങ്ങളോ അംഗീകാരക്കുറവോ ഉണ്ടാകാം. വീട് പണിയുമ്പോൾ അടിത്തറ ഉറപ്പിക്കാൻ സമയമെടുക്കുന്നതുപോലെ, ഇപ്പോഴത്തെ കഠിനാധ്വാനം നിങ്ങളുടെ ഭാവി ഉയർച്ചയ്ക്കുള്ള ഉറച്ച അടിത്തറയാണ്; അതിനാൽ ദേഷ്യത്തിൽ രാജി വെക്കരുത്.`;
    const p3Career = `വരുന്ന ഗ്രഹമാറ്റങ്ങൾ അനുകൂലമായി മാറുമ്പോൾ അർഹിക്കുന്ന അംഗീകാരവും പുതിയ വാതിലുകളും തുറക്കും. ക്ഷമയോടെ കർമ്മം തുടരുകയും ദിവസവും ശിവപഞ്ചാക്ഷരി ജപിക്കുകയും ചെയ്യുക.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\nദോഷ നിവാരണത്താൽ തൊഴിൽ വിജയം ഉണ്ടാകും.`);
      }
      const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nതൊഴിൽ തടസ്സങ്ങൾ മാറാൻ ഗോകർണ്ണത്ത് പൂജ നടത്താൻ ശ്രീരാം പണ്ഡിറ്റുമായി (9972339362) സംസാരിക്കുക.`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  // Base Reading
  const baseP1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} നിലവിലെ ${dasha} കാലവും ഗ്രഹനിലയും അനുകൂല മാറ്റങ്ങൾ കാണിക്കുന്നു.`
      : isSubsequent
        ? `നിങ്ങൾ ചോദിച്ച "${question}" ചോദ്യത്തിന്, നിലവിലെ ${dasha} കാലം ശുഭകരമായ മാറ്റങ്ങൾ കൊണ്ടുവരും.`
        : `നമസ്കാരം ${localizedDevoteeName}. ശ്രീ ബഗ്ഗോണ പഞ്ചാംഗ പ്രകാരം നിങ്ങൾ ${lagna} ലഗ്നം, ${rashi} രാശി, ${nakshatra} നക്ഷത്രത്തിൽ ജനിച്ചു. നിങ്ങളുടെ "${question}" ചോദ്യത്തിന്, നിലവിലെ ${dasha} കാലം ശുഭകരമായ മാറ്റങ്ങൾ തരും.`;
  const baseP2 = `മുൻപുണ്ടായിരുന്ന വിഷമങ്ങൾ മാറി തൊഴിലിലും കുടുംബത്തിലും നന്മകൾ ഉണ്ടാകും. മാമ്പഴം മരത്തിൽ പഴുത്തു പാകമാകുമ്പോൾ മാത്രമേ മധുരം നൽകൂ എന്നതുപോലെ, ശരിയായ സമയമെത്തുമ്പോൾ നിങ്ങളുടെ ശ്രമങ്ങൾക്ക് സ്ഥിരമായ ഫലം ലഭിക്കും; മുതിർന്നവരുടെ അനുഗ്രഹത്തോടെ മുന്നോട്ട് പോകുക.`;
  const baseP3 = `വ്യാഴത്തിന്റെ അനുഗ്രഹം നിങ്ങളുടെ ത്രികോണ ഭാവങ്ങൾക്ക് ബലം നൽകി സകല കാര്യങ്ങളും ശുഭമാക്കും. ആത്മവിശ്വാസത്തോടെയും പ്രാർത്ഥനയോടെയും മുന്നേറുക.`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\nദോഷ പരിഹാരത്താൽ നന്മകൾ ഉണ്ടാകും.`);
    }
    const p4Dosha = `॥ വൈദിക ദോഷ നിവാരണവും ഗോകർണ്ണ പരിഹാര അധ്യായവും ॥\nജാതക ദോഷ ശാന്തിക്ക് ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം ശ്രീരാം പണ്ഡിറ്റുമായി (9972339362) ബന്ധപ്പെടുക.`;
    return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`);
  }

  const p3Normal = `ഗ്രഹദോഷ ശാന്തിക്ക് ഗോകർണ്ണ ഗണപതിയെയും മഹാബലേശ്വരനെയും പ്രാർത്ഥിച്ച് നെയ്‌വിളക്ക് കൊളുത്തുക.`;
  return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${p3Normal}`);
}

export function buildMarathiFallbackReading(ctx: DeterministicFallbackContext): string {
  const {
    question,
    lagna,
    rashi,
    nakshatra,
    dasha,
    activeDosha,
    isSubsequent,
    convIntel,
    timeline,
    includeFullDosha,
    isGreeting,
    isCareerFrustration,
    isSanthana,
    isSecretIntimate,
    isMinorChild,
    tatva,
    gana,
    psychNature,
    house4Sign,
    house4Lord,
    house5Sign,
    house5Lord,
    shaniText,
    karmaLord,
    localizedDevoteeName
  } = ctx;
  const q = question.toLowerCase();

  if (isGreeting) {
    if (isSubsequent) {
      return deduplicateResponseText(`होय, मी या पवित्र सल्लामसलत दालनात आपल्यासोबतच आहे. आपला पुढचा प्रश्न किंवा शंका मोकळेपणाने विचारा.`);
    }
    return deduplicateResponseText(`हरि ॐ ${localizedDevoteeName}! श्री क्षेत्र गोकर्णचे महागणपती आणि भगवान महाबळेश्वर यांचे आशीर्वाद आपल्यावर व कुटुंबावर सदैव राहो.\n\nया २० मिनिटांच्या खाजगी संभाषणात मी आपल्या सोबत आहे. नोकरी, व्यवसाय, विवाह, आरोग्य किंवा कौटुंबिक बाबींविषयी कोणताही प्रश्न आपण निःसंकोचपणे विचारू शकता.`);
  }

  // Proof Follow-Up
  if (!isMinorChild && timeline && convIntel.isAskingProof) {
    return buildFallbackTimelineProof("mr", ctx);
  }

  // Timing
  if (
    !isMinorChild &&
    timeline &&
    (convIntel.isAskingTiming ||
      (convIntel.isSameTopicFollowUp &&
        /केव्हा|कधी|किती दिवस|किती महिने|वेळ|कोणत्या वर्षी|कोणत्या महिन्यात|when|timing/i.test(q)))
  ) {
    const p1Timing =
      convIntel.isSameTopicFollowUp && convIntel.contextualBridge
        ? `${convIntel.contextualBridge} पत्रिकेतील संबंधित भाव आणि शुभ ग्रहांचे भ्रमण पाहता आपल्या ${timeline.topicLabel} कार्याची अनुकूल वेळ आता जवळ येत आहे.`
        : isSubsequent
          ? `१००% शास्त्रोक्त ज्योतिषीय निर्णय: ९८% अचूकतेने आपले ${timeline.topicLabel} ${timeline.rangeSummary} नक्कीच पूर्ण होईल. पत्रिकेत ${timeline.topicYogaName} आणि संबंधित भावांचे शुभ गोचर यास पुष्टी देत आहे.`
          : `१००% शास्त्रोक्त ज्योतिषीय निर्णय: श्री बग्गोण पंचांगाच्या वैदिक गणितानुसार, ९८% अचूकतेने आपले ${timeline.topicLabel} ${timeline.rangeSummary} निश्चितपणे पूर्ण होईल! प्रिय ${localizedDevoteeName}, आपल्या पत्रिकेचा अभ्यास करता आपला जन्म ${lagna} लग्न, ${rashi} रास आणि ${nakshatra} नक्षत्रात झाला आहे. सध्याची ${dasha} आणि ${timeline.topicYogaName} योग या शुभ काळाला बळ देत आहेत.`;
    const p2Timing = `वैदिक ज्योतिष शास्त्रानुसार, सध्या चालणारा ${timeline.currentMahaName}-${timeline.currentBhuktiName} काळ पुढील ${timeline.monthsToDashaChange} महिन्यांत पूर्ण होऊन ${timeline.nextBhuktiName} भुक्ती सुरू होईल. देवगुरु बृहस्पतीचे भ्रमण आपल्या केंद्र व त्रिकोण भावांवर शुभ दृष्टी टाकेल. यामुळे जुने अडथळे दूर होऊन नवीन मार्ग खुले होतील.`;
    const p3Timing = `म्हणून पूर्ण विश्वास ठेवा की ९८% अचूकतेने आपले ${timeline.topicLabel} ${timeline.rangeSummary} पूर्ण होण्याचे प्रबळ योग आहेत. यासाठी श्री क्षेत्र गोकर्ण महाबळेश्वराचे स्मरण करा आणि सोमवारी किंवा गुरुवारी गाईच्या तुपाचा दिवा लावा.`;

    if (activeDosha.hasDosha && includeFullDosha) {
      const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nआपल्या जन्मपत्रिकेत "${activeDosha.doshaName || "दोष"
        }" दिसून येतो. यामुळे "${activeDosha.currentLifeProblems || "कार्यात विलंब आणि मानसिक ताण"
        }" जाणवत आहे. याच्या शांतीसाठी श्री क्षेत्र गोकर्ण येथे "${activeDosha.recommendedPooja || "महाबळेश्वर महारुद्राभिषेक व शांती होम"
        }" करणे आवश्यक आहे. मुख्य दैवज्ञ श्रीराम पंडित (फोन: 9972339362, गोकर्ण) यांच्याशी थेट संपर्क साधा.`;
      return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Timing}\n\n${p2Timing}\n\n${p3Timing}`);
  }

  // Minor Child
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `मुलाच्या "${question}" या प्रश्नाबाबत, पत्रिकेतील चतुर्थ विद्या भाव (${house4Sign}) आणि पंचम बुद्धी भाव (${house5Sign}) पाहता, विद्यापती ${house4Lord} च्या कृपेने मुलामध्ये उत्तम आकलनशक्ती आहे. प्रेमाने प्रोत्साहन दिल्यास मूल अभ्यासात उत्तम प्रगती करेल.`
      : `आदरणीय पालकवर्ग, श्री बग्गोण पंचांगानुसार आपल्या पाल्याची (${localizedDevoteeName}) पत्रिका पाहता, मूल ${lagna} लग्न, ${rashi} रास आणि ${nakshatra} नक्षत्रात जन्मले आहे. मुलाचा स्वभाव कुशाग्र बुद्धी व जिज्ञासू आहे. आपल्या "${question}" प्रश्नाबाबत, चतुर्थ विद्या स्थान (${house4Sign}) व पंचम स्थान (${house5Sign}) मुलामधील सुप्त क्षमता दर्शवतात.`;
    const p2Child = `अभ्यासाच्या दृष्टीने चतुर्थेश ${house4Lord} चांगल्या स्थितीत आहे. ज्याप्रमाणे लहान रोपट्याचे खोड वर ओढण्याऐवजी मुळांना वेळेवर पाणी दिल्यास ते आपोआप बहरते, त्याचप्रमाणे खेळात मन जाणे हे या वयातील स्वाभाविक लक्षण आहे. पालकांनी अवाजवी दबाव न आणता प्रेमाने अभ्यासाची सवय लावावी; सध्याची ${dasha} बुद्धीविकासासाठी अनुकूल आहे.`;
    const p3Child = `आरोग्य व एकाग्रतेसाठी संध्याकाळी घरात तुपाचा दिवा लावून सरस्वती स्तोत्र किंवा गायत्री मंत्राचा जप करा. गोकर्ण महागणपतीची पूजा केल्याने स्मरणशक्ती वाढेल.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\nगोकर्ण पूजेने मुलाचे दोष दूर होऊन उत्तम विद्या लाभेल.`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nमुलाच्या पत्रिकेतील दोषांच्या निवारणासाठी गोकर्णात शांती पूजा करण्यासाठी मुख्य पुरोहित श्रीराम पंडित (9972339362) यांच्याशी संपर्क साधा.`;
      return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Child}\n\n${p2Child}\n\n${p3Child}`);
  }

  // Santhana
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `संतान प्राप्तीबाबतच्या आपल्या "${question}" प्रश्नावर, पंचम भाव (${house5Sign}) आणि पंचमेश ${house5Lord} पाहता हा केवळ तात्पुरता ग्रहांचा विलंब आहे. वैद्यकीय उपायांसोबत दैवी कृपा लाभताच संतानयोग नक्कीच जुळून येईल.`
      : `बाळा ${localizedDevoteeName}, वैवाहिक जीवनात संतान सुखाविषयी आपल्या मनातील काळजी मी समजू शकतो. पत्रिकेत आपण ${lagna} लग्न, ${rashi} राशीत जन्मला आहात. पंचम भाव (${house5Sign}) आणि गुरूची स्थिती एक परीक्षा काळ दर्शवते, म्हणूनच हा तात्पुरता विलंब होत आहे.`;
    const p2Santhana = `पंचमेश ${house5Lord} व सध्याची ${dasha} स्थिती यामुळे अडथळे येत आहेत. नकारात्मक विचार सोडून द्या; योग्य शांती उपायांनंतर मातृ-पितृ सुखाचे दार नक्की उघडेल.`;
    const p3Santhana = `पुढील काळात गुरु दृष्टी पंचम भावावर पडताच अनुकूल वेळ सुरू होईल. उभयतांनी संतान गोपाळ मंत्राचा जप करावा. गोकर्ण महाबळेश्वराच्या कृपेने गोड बातमी नक्की मिळेल.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\nदोष निवारणाने संतान सुख लाभेल.`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nपत्रिकेतील "${activeDosha.doshaName || "संतान दोष"}" निवारणासाठी गोकर्णात पूजा करण्यासाठी श्रीराम पंडित (9972339362) यांच्याशी संपर्क साधा.`;
      return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`);
  }

  // Secret Intimate
  if (isSecretIntimate) {
    const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|വ്യഭിചാരം|देहविक्रय/i.test(question);
    if (isSexWork) {
      const p1SexWork = isSubsequent
        ? `मुक्ती व सन्मान्य जीवनाबाबतच्या आपल्या प्रश्नावर ("${question}"), गोकर्ण महाबळेश्वराच्या दरबारात कोणताही जीव अपवित्र नाही. आगामी गुरु भ्रमण आपल्याला या परिस्थितीतून बाहेर काढून सन्मानाचे वैवाहिक जीवन देईल.`
        : `१००% शास्त्रोक्त अभय: गोकर्ण महाबळेश्वराच्या सानिध्यात कोणताही आत्मा शापित नाही; पत्रिकेनुसार आगामी गुरु भ्रमण आपल्याला सन्मानाचे जीवन देईल! बाळा ${localizedDevoteeName}, आपले दुःख मी पितृवात्सल्याने स्वीकारतो. पिंगळा, आम्रपालीसारख्या पुण्यात्म्यांनी मुक्ती मिळवल्याचे दाखले आपल्याकडे आहेत.`;
      const p2SexWork = `पत्रिकेतील ८, ७ आणि ६ वे भाव आर्थिक विवशतेमुळे हे संकट ओढवल्याचे सांगतात. सध्याची ${dasha} संपताच सुटकेचा मार्ग दिसेल. धीराने वैद्यकीय व कायदेशीर मदत घ्या.`;
      const p3SexWork = `गोकर्णात रुद्राभिषेक करा व दुर्गा स्तोत्र, ऋणमोचन स्तोत्र वाचा. कुलदेवता आपले रक्षण करेल.`;
      if (activeDosha.hasDosha && includeFullDosha) {
        const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nदोष शांतीसाठी श्रीराम पंडित (9972339362) यांच्याशी संपर्क साधा.`;
        return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}\n\n${p4Dosha}`);
      }
      return deduplicateResponseText(`${p1SexWork}\n\n${p2SexWork}\n\n${p3SexWork}`);
    }

    const p1Intimate = isSubsequent
      ? `अंतरंग प्रश्नाबाबत ("${question}"), ८ वा भाव आणि शुक्राची स्थिती ही एक नैसर्गिक स्थिती असल्याचे दर्शवते. अपराधी भावना सोडून आयुर्वेद व सात्विक जीवनशैली अवलंबा.`
      : `प्रिय ${localizedDevoteeName}, वैदिक जीवनात काम हा चार पुरुषार्थांपैकी एक पवित्र भाग मानला गेला आहे. यात संकोच वाटण्याचे कारण नाही. आपले ${lagna} लग्न आणि शुक्राची स्थिती ही ऊर्जा नियंत्रित करते.`;
    const p2Intimate = `सध्याच्या ${dasha} काळातील ताणामुळे शुक्र धातूवर तात्पुरता परिणाम झाला आहे. अश्वगंधा, दूध आणि प्राणायाम आपल्याला नवचैतन्य देईल.`;
    const p3Intimate = `चिंता सोडा. गोकर्ण महाबळेश्वर पूजा मनःशांती देऊन दांपत्य जीवन सुखी करेल.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\nशांततेने सर्व ठीक होईल.`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nदोष शांतीसाठी श्रीराम पंडित (9972339362) यांच्याशी बोला.`;
      return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`);
  }

  // Career Frustration
  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `करिअर आणि नोकरीच्या प्रश्नाबाबत ("${question}"), १० वा भाव (${karmaLord}) आणि सध्याची ${dasha} तात्पुरता ताण दाखवत आहे. ही आपली क्षमता वाढवणारी वेळ आहे.`
      : `बाळा ${localizedDevoteeName}, नोकरी-व्यवसायातील आपल्या अडचणी मी समजू शकतो. आपण ${lagna} लग्न, ${rashi} राशीत जन्मलेले कष्टाळू आहात. सध्याची ${dasha} आणि ${shaniText} संयमाची परीक्षा घेत आहेत.`;
    const p2Career = `१० वे भाव पाहता कामाच्या ठिकाणी ताण किंवा श्रेय न मिळणे संभवते. घर बांधताना पावसाळ्यात पाया खोल केल्यानंतरच वरचे मजले भक्कम उभे राहतात, तसेच सध्याची मेहनत आपल्या भविष्याचा भक्कम पाया रचत आहे; त्यामुळे रागाच्या भरात राजीनामा देण्यासारखे टोकाचे पाऊल उचलू नका.`;
    const p3Career = `पुढील काळात ग्रहांची साथ मिळून आपल्या कामाचे योग्य चीज होईल आणि प्रगतीच्या नवीन संधी उपलब्ध होतील. संयमाने कार्य करत राहा आणि शिवपंचाक्षरी मंत्राचा जप करा.`;

    if (activeDosha.hasDosha) {
      if (!includeFullDosha) {
        return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\nदोष निवारणाने करिअरमध्ये यश लाभेल.`);
      }
      const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nअडथळे दूर करण्यासाठी गोकर्णात पूजा करण्यासाठी श्रीराम पंडित (9972339362) यांच्याशी संपर्क साधा.`;
      return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`);
    }
    return deduplicateResponseText(`${p1Career}\n\n${p2Career}\n\n${p3Career}`);
  }

  // Base Reading
  const baseP1 =
    convIntel.isSameTopicFollowUp && convIntel.contextualBridge
      ? `${convIntel.contextualBridge} सध्याची ${dasha} आणि ग्रहांचे भ्रमण सकारात्मक बदलांचे संकेत देत आहे.`
      : isSubsequent
        ? `आपल्या "${question}" प्रश्नाबाबत, सध्याची ${dasha} वेळ सकारात्मक बदल घडवून आणेल. लग्नेशाचे बळ आपल्या पाठीशी आहे.`
        : `नमस्ते ${localizedDevoteeName}. श्री बग्गोण पंचांगानुसार आपला जन्म ${lagna} लग्न, ${rashi} रास, ${nakshatra} नक्षत्रात झाला आहे. आपल्या "${question}" प्रश्नाबाबत, सध्याचा काळ महत्त्वाचे सकारात्मक वळण आणत आहे.`;
  const baseP2 = `पत्रिकेनुसार जुने मानसिक ताण हळूहळू दूर होऊन व्यवसाय व कुटुंबात सुख-शांती नांदेल. आंब्याचे फळ झाडावर योग्य वेळी पिकल्यावरच खरी गोडी देते, तसेच योग्य मुहूर्त जुळून आल्यावर आपल्या कष्टांना कायमस्वरूपी यश मिळेल. मोठ्यांचे आशीर्वाद घेऊन संयमाने पावले टाका.`;
  const baseP3 = `देवगुरु बृहस्पतीचे भ्रमण आपल्या त्रिकोण भावांना बळ देऊन सर्व प्रयत्नांना यश व कुटुंबात समृद्धी आणेल. मनात पूर्ण श्रद्धा ठेवून पुढे चला.`;

  if (activeDosha.hasDosha) {
    if (!includeFullDosha) {
      return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\nदोष शांतीने शुभ फळ मिळेल.`);
    }
    const p4Dosha = `॥ वैदिक दोष निवारण आणि गोकर्ण परिहार अध्याय ॥\nपत्रिकेतील दोषांच्या शांतीसाठी श्री क्षेत्र गोकर्ण येथे संपर्क साधा (श्रीराम पंडित: 9972339362).`;
    return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`);
  }

  const p3Normal = `ग्रहदोष शांतीसाठी गोकर्ण महागणपती व महाबळेश्वराची उपासना करा आणि तुपाचा दिवा लावा.`;
  return deduplicateResponseText(`${baseP1}\n\n${baseP2}\n\n${p3Normal}`);
}
