/**
 * Authentic 3-to-5 Minute Daily Vedic Sankalpa & Deva Pooja Engine (ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜಾ ವಿಧಿ)
 * 
 * Rooted in the sacred Smartha & Vedic Gokarna Kshetra tradition:
 * 1. Deepa Prajwalane & Mindful Prayer (Lighting the Sanctum Lamp & Reverence to the Divine Light)
 * 2. Guru & Ganapati Invocation (Taking Sacred Akshata in Hand)
 * 3. Maha Vedic Sankalpa (Live Desha-Kaala + Devotee Janma Details + Personal Active Sankalpas)
 * 4. Sankalpa Samarpanam (Offering Sacred Akshata & Flowers to God's Lotus Feet)
 * 5. Deeparadhana (Mangalarati), Sashtanga Namaskara & Shanti Prayer
 * Perfect 3 to 5 minute Satvik morning worship flow for devotees with active priest voice recitation.
 */

import type { SevaLang } from "./sevaLocale";
import type { UserSankalpaRecord } from "../../db/indexedDb";
import { convertIndicScript, transliterateIndicToLatin, transliterateName } from "../../utils/transliterator";
import { SANKALPA_PRESETS, getPresetSanskritPhrasing } from "../sankalpa/sankalpaStore";

function localizePanchangaTerm(term: string, targetLang: SevaLang): string {
  if (!term) return "";
  if (targetLang === "kn") return term;
  if (targetLang === "en") return transliterateIndicToLatin(term);
  return convertIndicScript(term, targetLang as "hi" | "te" | "ta");
}

function getLocalizedSanskritPhrases(activeSankalpas: UserSankalpaRecord[], targetLang: SevaLang): string {
  const active = activeSankalpas.filter((s) => s.isActive);
  if (active.length === 0) {
    const defaultPhrases: Record<SevaLang, string> = {
      kn: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸರ್ವಾಭೀಷ್ಟ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "मम कुटुम्बस्य सर्वेषां आयुरारोग्य ऐश्वर्याभिवृद्धि सिद्ध्यर्थं, सर्वाभीष्ट सिद्ध्यर्थं",
      te: "మమ కుటుంబస్య సర్వేషాం ఆయురారోగ్య ఐశ్వర్యాభివృద్ధి సిద్ధ్యర్థం, సర్వాభీష్ట సిద్ధ్యర్థం",
      ta: "மம குடும்பஸ்ய சர்வேஷாம் ஆயுராரோக்ய ஐஸ்வர்யாபிவிருத்தி சித்யர்த்தம், சர்வாபீஷ்ட சித்யர்த்தம்",
      en: "mama kuṭumbasya sarveṣāṁ āyurārogya aiśvaryābhivṛddhi siddhyarthaṁ, sarvābhīṣṭa siddhyarthaṁ"
    };
    return defaultPhrases[targetLang] || defaultPhrases.kn;
  }

  return active.map((s) => {
    if (s.sanskritPhrasing && s.sanskritPhrasing.trim()) {
      const phrase = s.sanskritPhrasing.trim();
      if (targetLang === "kn") return phrase;
      if (targetLang === "en") return transliterateIndicToLatin(phrase);
      return convertIndicScript(phrase, targetLang as "hi" | "te" | "ta");
    }
    const preset = SANKALPA_PRESETS.find((p) => p.category === s.category);
    if (preset) {
      return getPresetSanskritPhrasing(preset, targetLang);
    }
    const phrase = s.title;
    if (targetLang === "kn") return phrase;
    if (targetLang === "en") return transliterateIndicToLatin(phrase);
    return convertIndicScript(phrase, targetLang as "hi" | "te" | "ta");
  }).join(", ");
}

export const BENEFIT_INTRO: Record<SevaLang, string> = {
  kn: "ಇದರಿಂದ ಆಗುವ ಶುಭ ಫಲ:",
  hi: "इससे प्राप्त होने वाला पावन फल:",
  te: "దీనివలన చేకూరే శుభ ఫలితం:",
  ta: "இதனால் ஏற்படும் நற்பலன்:",
  en: "Spiritual Benefit & Divine Impact:"
};

export const DEFAULT_NEXT_STEP_PROMPTS: Record<SevaLang, Record<number, string>> = {
  kn: {
    1: "ನೀವು ದೀಪ ಬೆಳಗಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ದೀಪ ಬೆಳಗಿದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    2: "ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ, ನೀವು ಸಿದ್ಧವಾಗುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಸಿದ್ಧವಾದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    3: "ನೀವು ಸಂಕಲ್ಪ ಧ್ಯಾನ ಮಾಡುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಹಾಗೆಯೇ ಹಿಡಿದುಕೊಳ್ಳಿ, ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    4: "ನೀವು ದೇವರ ಚರಣಗಳಿಗೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ ಪ್ರಾರ್ಥಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಸಮರ್ಪಿಸಿದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    5: "ನೀವು ಮಂಗಳಾರತಿ ಬೆಳಗಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಪೂಜೆ ಸಂಪನ್ನವಾದ ನಂತರ ದಯವಿಟ್ಟು 'ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ."
  },
  hi: {
    1: "आप जब तक दीप प्रज्वलित करते हैं, मैं प्रतीक्षा कर रहा हूँ। दीप प्रज्वलन के उपरांत अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    2: "हाथ में अक्षत एवं पुष्प धारण करें, आपके तैयार होने तक मैं प्रतीक्षा कर रहा हूँ। तैयार होने पर अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    3: "हाथ में अक्षत वैसे ही रखें, आपके संकल्प ध्यान तक मैं प्रतीक्षा कर रहा हूँ। अगले समर्पण चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    4: "आप जब तक भगवान के चरणों में अक्षत समर्पित कर प्रार्थना करते हैं, मैं प्रतीक्षा कर रहा हूँ। समर्पण के उपरांत अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    5: "आप जब तक मंगल आरती कर साष्टांग प्रणाम करते हैं, मैं प्रतीक्षा कर रहा हूँ। पूजा संपन्न होने पर कृपया 'पूजा संपन्न करें' बटन पर क्लिक करें।"
  },
  te: {
    1: "మీరు దీపం వెలిగించేవరకు నేను వేచి ఉంటాను. దీపం వెలిగించిన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    2: "చేతిలో అక్షతలు మరియు పుష్పం ఉంచుకోండి, మీరు సిద్ధమయ్యేవరకు నేను వేచి ఉంటాను. సిద్ధమైన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    3: "చేతిలోని అక్షతలను అలాగే ఉంచుకోండి, మీరు సంకల్ప ధ్యానం చేసేవరకు నేను వేచి ఉంటాను. తదుపరి సమర్పణ దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    4: "మీరు దేవుని పాదాలకు అక్షతలు సమర్పించి ప్రార్థించేవరకు నేను వేచి ఉంటాను. సమర్పించిన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    5: "మీరు మంగళ హారతి ఇచ్చి సాష్టాంగ నమస్కారం చేసేవరకు నేను వేచి ఉంటాను. పూజ పూర్తయిన తర్వాత దయచేసి 'పూజ పూర్తి చేయండి' బటన్‌ను క్లిక్ చేయండి."
  },
  ta: {
    1: "நீங்கள் விளக்கேற்றும் வரை நான் காத்திருக்கிறேன். விளக்கேற்றிய பிறகு அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    2: "கையில் அட்சதை மற்றும் மலரை ஏந்தவும், நீங்கள் தயாராகும் வரை நான் காத்திருக்கிறேன். தயாரானதும் அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    3: "கையில் உள்ள அட்சதையை அப்படியே வைத்திருக்கவும், நீங்கள் சங்கல்ப தியானம் செய்யும் வரை நான் காத்திருக்கிறேன். அடுத்த சமர்ப்பண படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    4: "நீங்கள் இறைவனின் திருவடிகளில் அட்சதை சமர்ப்பித்து பிரார்த்திக்கும் வரை நான் காத்திருக்கிறேன். சமர்ப்பித்த பிறகு அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    5: "நீங்கள் மங்கள ஆரத்தி எடுத்து சாஷ்டாங்க நமஸ்காரம் செய்யும் வரை நான் காத்திருக்கிறேன். பூஜை நிறைவடைந்ததும் தயவுசெய்து 'பூஜையை நிறைவு செய்க' பொத்தானை அழுத்தவும்."
  },
  en: {
    1: "I am waiting for you to light the sacred lamp and pray. Once lit, please click the 'Continue' button to proceed.",
    2: "Please hold the sacred Akshata and flowers in hand, I am waiting for you to prepare. Once ready, please click the 'Continue' button.",
    3: "Keep holding the sacred Akshata in hand, I am waiting as you meditate upon your Sankalpa. Please click the 'Continue' button to proceed to the offering step.",
    4: "I am waiting for you to offer the sacred Akshata at the lotus feet and pray. Once offered, please click the 'Continue' button.",
    5: "I am waiting for you to wave the sacred Mangalarati and bow down in prayer. Once completed, please click the 'Complete Pooja' button."
  }
};

export interface DailyPoojaStep {
  step: number;
  key: "deepa_achamana" | "guru_ganapati" | "maha_sankalpa" | "sankalpa_samarpana" | "deeparadhana_namaskara";
  titleKn: string;
  titleEn: string;
  titleHi: string;
  titleTe: string;
  titleTa: string;
  icon: string;
  approxSeconds: number;
  sanskritMantra: string;
  sanskritMantraL5?: Record<SevaLang, string>;
  narrationText: Record<SevaLang, string>;
  actionGuide: Record<SevaLang, string>;
  spiritualSignificance: Record<SevaLang, string>;
  nextStepPrompt?: Record<SevaLang, string>;
  priestNarrationL5?: Record<SevaLang, string>;
  visualEffect: "deepa" | "ganesha" | "sankalpa" | "akshata" | "arathi";
}

export interface BuildDailyPoojaParams {
  devoteeName: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  priestName?: string;
  lang?: SevaLang;
  samvatsara?: string;
  ayana?: string;
  ritu?: string;
  masa?: string;
  paksha?: string;
  tithi?: string;
  vasara?: string;
  nakshatra?: string;
  activeSankalpas?: UserSankalpaRecord[];
}

export function buildDailyPoojaSteps(params: BuildDailyPoojaParams): DailyPoojaStep[] {
  const {
    devoteeName = "ಭಕ್ತ",
    gotra = "ಕಾಶ್ಯಪ",
    rashiName = "ಧನು",
    nakshatraName = "ಮೂಲ",
    priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    samvatsara = "ಪರಾಭವ",
    ayana = "ದಕ್ಷಿಣಾಯನ",
    ritu = "ವರ್ಷ ಋತು",
    masa = "ಶ್ರಾವಣ ಮಾಸ",
    paksha = "ಶುಕ್ಲ ಪಕ್ಷ",
    tithi = "ಏಕಾದಶೀ",
    vasara = "ಭೃಗುವಾಸರ",
    nakshatra = "ಮೂಲಾ",
    activeSankalpas = []
  } = params;

  // Compile user's active personal sankalpa phrases for dynamic mantra insertion in each language
  const phKn = getLocalizedSanskritPhrases(activeSankalpas, "kn");
  const phHi = getLocalizedSanskritPhrases(activeSankalpas, "hi");
  const phTe = getLocalizedSanskritPhrases(activeSankalpas, "te");
  const phTa = getLocalizedSanskritPhrases(activeSankalpas, "ta");
  const phEn = getLocalizedSanskritPhrases(activeSankalpas, "en");

  // Localized placeholders per language
  const nameHi = transliterateName(devoteeName, "hi");
  const gotraHi = localizePanchangaTerm(gotra, "hi");
  const rashiHi = localizePanchangaTerm(rashiName, "hi");
  const nakshatraHi = localizePanchangaTerm(nakshatraName, "hi");
  const samvatsaraHi = localizePanchangaTerm(samvatsara, "hi");
  const ayanaHi = localizePanchangaTerm(ayana, "hi");
  const rituHi = localizePanchangaTerm(ritu, "hi");
  const masaHi = localizePanchangaTerm(masa, "hi");
  const pakshaHi = localizePanchangaTerm(paksha, "hi");
  const tithiHi = localizePanchangaTerm(tithi, "hi");
  const vasaraHi = localizePanchangaTerm(vasara, "hi");
  const nakHi = localizePanchangaTerm(nakshatra, "hi");

  const nameTe = transliterateName(devoteeName, "te");
  const gotraTe = localizePanchangaTerm(gotra, "te");
  const rashiTe = localizePanchangaTerm(rashiName, "te");
  const nakshatraTe = localizePanchangaTerm(nakshatraName, "te");
  const samvatsaraTe = localizePanchangaTerm(samvatsara, "te");
  const ayanaTe = localizePanchangaTerm(ayana, "te");
  const rituTe = localizePanchangaTerm(ritu, "te");
  const masaTe = localizePanchangaTerm(masa, "te");
  const pakshaTe = localizePanchangaTerm(paksha, "te");
  const tithiTe = localizePanchangaTerm(tithi, "te");
  const vasaraTe = localizePanchangaTerm(vasara, "te");
  const nakTe = localizePanchangaTerm(nakshatra, "te");

  const nameTa = transliterateName(devoteeName, "ta");
  const gotraTa = localizePanchangaTerm(gotra, "ta");
  const rashiTa = localizePanchangaTerm(rashiName, "ta");
  const nakshatraTa = localizePanchangaTerm(nakshatraName, "ta");
  const samvatsaraTa = localizePanchangaTerm(samvatsara, "ta");
  const ayanaTa = localizePanchangaTerm(ayana, "ta");
  const rituTa = localizePanchangaTerm(ritu, "ta");
  const masaTa = localizePanchangaTerm(masa, "ta");
  const pakshaTa = localizePanchangaTerm(paksha, "ta");
  const tithiTa = localizePanchangaTerm(tithi, "ta");
  const vasaraTa = localizePanchangaTerm(vasara, "ta");
  const nakTa = localizePanchangaTerm(nakshatra, "ta");

  const nameEn = transliterateName(devoteeName, "en");
  const gotraEn = localizePanchangaTerm(gotra, "en");
  const rashiEn = localizePanchangaTerm(rashiName, "en");
  const nakshatraEn = localizePanchangaTerm(nakshatraName, "en");
  const samvatsaraEn = localizePanchangaTerm(samvatsara, "en");
  const ayanaEn = localizePanchangaTerm(ayana, "en");
  const rituEn = localizePanchangaTerm(ritu, "en");
  const masaEn = localizePanchangaTerm(masa, "en");
  const pakshaEn = localizePanchangaTerm(paksha, "en");
  const tithiEn = localizePanchangaTerm(tithi, "en");
  const vasaraEn = localizePanchangaTerm(vasara, "en");
  const nakEn = localizePanchangaTerm(nakshatra, "en");

  const activePhrasesSanskrit = phKn;

  const activePhrasesKannada = activeSankalpas.length > 0
    ? activeSankalpas.filter((s) => s.isActive).map((s) => s.title).join(" · ")
    : "ಕುಟುಂಬದ ಸಕಲ ಆರೋಗ್ಯ, ಮನಶ್ಶಾಂತಿ ಹಾಗೂ ಸಕಲ ಸತ್ಕಾರ್ಯ ಸಿದ್ಧಿ";

  const selectedLang = params.lang || "kn";

  // Step 1 Mantras across 5 languages
  const step1MantraL5: Record<SevaLang, string> = {
    kn: `ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ ।
ದೀಪೋ ಹರತು ಮೇ ಪಾಪಂ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥
ಶುಭಂ ಕರೋತಿ ಕಲ್ಯಾಣಂ ಆರೋಗ್ಯಂ ಧನಸಂಪದಃ ।
ಶತ್ರುಬುದ್ಧಿ ವಿನಾಶಾಯ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥`,
    hi: `दीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः ।
दीपो हरतु मे पापं दीपज्योतिर्नमोऽस्तु ते ॥
शुभं करोति कल्याणं आरोग्यं धनसंपदः ।
शत्रुबुद्धि विनाशाय दीपज्योतिर्नमोऽस्तु ते ॥`,
    te: `దీపజ్యోతిః పరబ్రహ్మ దీపజ్యోతిర్జనార్దనః ।
దీపో హరతు మే పాపం దీపజ్యోతిర్నమోఽస్తు తే ॥
శుభం కరోతి కల్యాణం ఆరోగ్యం ధనసంపదః ।
శత్రుబుద్ధి వినాశాయ దీపజ్యోతిర్నమోఽస్తు తే ॥`,
    ta: `தீபஜ்யோதிஃ பரப்ரம்ஹ தீபஜ்யோதிர்ஜனார்தனஃ ।
தீபோ ஹரது மே பாபம் தீபஜ்யோதிர்நமோஸ்து தே ॥
சுபம் கரோதி கல்யாணம் ஆரோக்யம் தனஸம்பதஃ ।
சத்ருபுத்தி விநாசாய தீபஜ்யோதிர்நமோஸ்து தே ॥`,
    en: `Dīpajyotiḥ parabrahma dīpajyotirjanārdanaḥ |
Dīpo haratu me pāpaṁ dīpajyotirnamo'stu te ||
Śubhaṁ karoti kalyāṇaṁ ārogyaṁ dhanasampadaḥ |
Śatrubuddhi vināśāya dīpajyotirnamo'stu te ||`
  };

  // Step 2 Mantras across 5 languages
  const step2MantraL5: Record<SevaLang, string> = {
    kn: `ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್ ।
ಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ ॥
ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ ।
ಗುರುಸ್ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀ ಗುರವೇ ನಮಃ ॥
ಅಗಜಾನನ ಪದ್ಮಾರ್ಕಂ ಗಜಾನನಮಹರ್ನಿಶಮ್ ।
ಅನೇಕದಂತಂ ಭಕ್ತಾನಾಂ ಏಕದಂತಮುಪಾಸ್ಮಹೇ ॥`,
    hi: `शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम् ।
प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ॥
गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ।
गुरुस्साक्षात् परब्रह्म तस्मै श्री गुरवे नमः ॥
अगजानन पद्मार्कं गजाननमहर्निशम् ।
अनेकदनतं भक्तानां एकदन्तमुपास्महे ॥`,
    te: `శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజమ్ ।
ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే ॥
గురుర్బ్రహ్మా గురుర్విష్ణుః గురుర్దేవో మహేశ్వరః ।
గురుస్సాక్షాత్ పరబ్రహ్మ తస్మై శ్రీ గురవే నమః ॥
అగజానన పద్మార్కం గజాననమహర్నిశమ్ ।
అనేకదంతం భక్తానాం ఏకదంతముపాస్మహే ॥`,
    ta: `சுக்லாம்பரதரம் விஷ்ணும் சசிவர்ணம் சதுர்புஜம் ।
பிரசன்னவதனம் தியாயேத் சர்வவிக்னோபசாந்தயே ॥
குருர்பிரம்மா குருர்விஷ்ணுஃ குருர்தேவோ மஹேஸ்வரஃ ।
குருஸ்சாக்ஷாத் பரப்ரம்ஹ தஸ்மை ஸ்ரீ குரவே நமஃ ॥
அகஜானன பத்மார்க்கம் கஜானனமஹர்நிசம் ।
அனேகதந்தம் பக்தானாம் ஏகதந்தமுபாஸ்மஹே ॥`,
    en: `Śuklāmbaradharaṁ viṣṇuṁ śaśivarṇaṁ caturbhujam |
Prasannavadanaṁ dhyāyet sarvavighnopaśāntaye ||
Gururbrahmā gururviṣṇuḥ gururdevo maheśvaraḥ |
Gurussākṣāt parabrahma tasmai śrī gurave namaḥ ||
Agajānana padmārkaṁ gajānanamaharniśam |
Anekadantaṁ bhaktānāṁ ekadantamupāsmahe ||`
  };

  // Step 3 Mantras across 5 languages
  const step3MantraL5: Record<SevaLang, string> = {
    kn: `ಓಂ ಶ್ರೀಮದ್ ಭಗವತೋ ಮಹಾಪುರುಷಸ್ಯ ವಿಷ್ಣೋರಾಜ್ಞಯಾ ಪ್ರವರ್ತಮಾನಸ್ಯ ಆದ್ಯ ಬ್ರಹ್ಮಣಃ ದ್ವಿತೀಯ ಪರಾರ್ಧೇ ಶ್ವೇತವರಾಹ ಕಲ್ಪೇ ವೈವಸ್ವತ ಮನ್ವಂತರೇ ಅಷ್ಟಾವಿಂಶತಿತಮೇ ಕಲಿಯುಗೇ ಪ್ರಥಮಪಾದೇ ಜಂಬೂದ್ವೀಪೇ ಭಾರತವರ್ಷೇ ಭರತಖಂಡೇ ದಂಡಕಾರಣ್ಯೇ ಗೋದಾವರ್ಯಾಃ ದಕ್ಷಿಣೇ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ...
${samvatsara} ನಾಮ ಸಂವತ್ಸರೇ, ${ayana}, ${ritu}, ${masa}, ${paksha}, ${tithi} ತಿಥೌ, ${vasara} ವಾಸರೇ, ${nakshatra} ನಕ್ಷತ್ರೇ, ಶುಭಯೋಗ ಶುಭಕರಣ ಏವಂಗುಣ ವಿಶೇಷಣ ವಿಶಿಷ್ಟಾಯಾಂ ಶುಭಪುಣ್ಯತಿಥೌ ...
ಮಮ ಉಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ ಪ್ರೀತ್ಯರ್ಥಂ, ${gotra} ಗೋತ್ರೋತ್ಪನ್ನಸ್ಯ ${rashiName} ರಾಶೌ ${nakshatraName} ನಕ್ಷತ್ರೇ ಜಾತಸ್ಯ ${devoteeName} ಶರ್ಮಣಃ / ನಾಮ್ನ್ಯಾಃ ...
${phKn} ...
ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ, ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧೌ ಯಥಾಶಕ್ತಿ ನಿತ್ಯ ಪೂಜಾಂ ಸಂಕಲ್ಪಂ ಚ ಕರಿಷ್ಯೇ ॥`,
    hi: `ॐ श्रीमद् भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य ब्रह्मणः द्वितीयपरार्धे श्वेतवराहकल्पे वैवस्वत मन्वन्तरे अष्टाविंशतितमे कलियुगे प्रथमपादे जम्बूद्वीपे भारतवर्षे भरतखण्डे दण्डकारण्ये गोदावर्याः दक्षिणे गोकर्णक्षेत्रे ...
${samvatsaraHi} नाम संवत्सरे, ${ayanaHi}, ${rituHi}, ${masaHi}, ${pakshaHi}, ${tithiHi} तिथौ, ${vasaraHi} वासरे, ${nakHi} नक्षत्रे, शुभयोग शुभकरण एवं गुणविशेषण विशिष्टायां शुभपुण्यतिथौ ...
मम उपात्त समस्त दुरितक्षयद्वारा श्री परमेश्वर प्रीत्यर्थं, ${gotraHi} गोत्रोत्पन्नस्य ${rashiHi} राशौ ${nakshatraHi} नक्षत्रे जातस्य ${nameHi} शर्मणः / नाम्न्याः ...
${phHi} ...
श्री महाबलेश्वर स्वामी, श्री महागणपति संनिधौ यथाशक्ति नित्य पूजां संकल्पं च करिष्ये ॥`,
    te: `ఓం శ్రీమద్ భగవతో మహాపురుషస్య విష్ణోరాజ్ఞయా ప్రవర్తమానస్య ఆద్య బ్రహ్మణః ద్వితీయ పరార్ధే శ్వేతవరాహ కల్పే వైవస్వత మన్వంతరే అష్టావింశతితమే కలియుగే ప్రథమపాదే జంబూద్వీపే భారతవర్షే భరతఖండే దండకారణ్యే గోదావర్యాః దక్షిణే గోకర్ణ క్షేత్రే ...
${samvatsaraTe} నామ సంవథ్సరే, ${ayanaTe}, ${rituTe}, ${masaTe}, ${pakshaTe}, ${tithiTe} తిథౌ, ${vasaraTe} వాసరే, ${nakTe} నక్షత్రే, శుభయోగ శుభకరణ ఏవంగుణ విశేషణ విశిష్టాయాం శుభపుణ్యతిథౌ ...
మమ ఉపాత్త సమస్త దురితక్షయద్వారా శ్రీ పరమేశ్వర ప్రీత్యర్థం, ${gotraTe} గోత్రోత్పన్నస్య ${rashiTe} రాశౌ ${nakshatraTe} నక్షత్రే జాతస్య ${nameTe} శర్మణః / నామ్న్యాః ...
${phTe} ...
శ్రీ మహాబలేశ్వర స్వామి, శ్రీ మహాగణపతి సన్నిధౌ యథాశక్తి నిత్య పూజాం సంకల్పం చ కరిష్యే ॥`,
    ta: `ஓம் ஸ்ரீமத் பகவதோ மகாபுருஷஸ்ய விஷ்ணோராஜ்ஞயா பிரவர்த்தமானஸ்ய ஆத்ய பிரம்மணஃ த்விதீய பரார்தே ஸ்வேதவராஹ கல்பே வைவஸ்வத மன்வந்தரே அஷ்டாவிம்சதிதமே கலியுகே பிரதமபாதே ஜம்பூத்வீபே பாரதவர்ஷே பரதகண்டே தண்டகாரண்யே கோதாவர்யாஃ தக்ஷிணே கோகர்ண க்ஷேத்ரே ...
${samvatsaraTa} நாம சம்வத்ஸரே, ${ayanaTa}, ${rituTa}, ${masaTa}, ${pakshaTa}, ${tithiTa} திதௌ, ${vasaraTa} வாஸரே, ${nakTa} நக்ஷத்ரே, சுபயோக சுபகரண ஏவங்குண விசேஷண விசிஷ்டாயாம் சுபபுண்யதிதௌ ...
மம உபார்த்த சமஸ்த துரிதக்ஷயத்வாரா ஸ்ரீ பரமேஸ்வர ப்ரீத்யர்த்தம், ${gotraTa} கோத்ரோத்பன்னஸ்ய ${rashiTa} ராசௌ ${nakshatraTa} நக்ஷத்ரே ஜாதஸ்ய ${nameTa} சர்மணஃ ...
${phTa} ...
ஸ்ரீ மஹாபலேஸ்வர சுவாமி, ஸ்ரீ மஹாகணபதி சந்நிதௌ யதாசக்தி நித்ய பூஜாம் சங்கல்பம் ச கரிஷ்யே ॥`,
    en: `Om Śrīmad Bhagavato Mahāpuruṣasya Viṣṇorājñayā pravartamānasya ādya brahmaṇaḥ dvitīya parārdhe śvetavarāha kalpe vaivasvata manvantare aṣṭāviṁśatitame kaliyuge prathamapāde jambūdvīpe bhāratavarṣe bharatakhaṇḍe daṇḍakāraṇye godāvaryāḥ dakṣiṇe gokarṇakṣetre ...
${samvatsaraEn} nāma saṁvatsare, ${ayanaEn}, ${rituEn}, ${masaEn}, ${pakshaEn}, ${tithiEn} tithau, ${vasaraEn} vāsare, ${nakEn} nakṣatre, śubhayoga śubhakaraṇa evaṅguṇa viśeṣaṇa viśiṣṭāyāṁ śubhapuṇyatithau ...
mama upātta samasta duritakṣayadvārā śrī parameśvara prītyarthaṁ, ${gotraEn} gotrotpannasya ${rashiEn} rāśau ${nakshatraEn} nakṣatre jātasya ${nameEn} śarmaṇaḥ ...
${phEn} ...
Śrī Mahābaleśvara Svāmī, Śrī Mahāgaṇapati sannidhau yathāśakti nitya pūjāṁ saṅkalpaṁ ca kariṣye ||`
  };

  // Step 4 Mantras across 5 languages
  const step4MantraL5: Record<SevaLang, string> = {
    kn: `ಅನೇನ ಕೃತೇನ ಯಥಾಶಕ್ತಿ ನಿತ್ಯ ಪೂಜಾ ಸಂಕಲ್ಪ ಕರ್ಮಣಾ ।
ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ, ಶ್ರೀ ಮಹಾಗಣಪತಿ ದೇವತಾಃ ಸುಪ್ರೀತಾಃ ಸುಪ್ರಸನ್ನಾಃ ವರದಾಃ ಭವಂತು ॥
ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ।
ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿತ್ ದುಃಖಭಾಗ್ಭವತ್ ॥
ಶ್ರೀಕೃಷ್ಣಾರ್ಪಣಮಸ್ತು, ಶ್ರೀ ಸಾಂಬಸದಾಶಿವಾರ್ಪಣಮಸ್ತು ॥`,
    hi: `अनेन कृतेन यथाशक्ति नित्य पूजा संकल्प कर्मणा ।
श्री महाबलेश्वर स्वामी, श्री महागणपति देवताः सुप्रीताः सुप्रसन्नाः वरदाः भवन्तु ॥
सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।
सर्वे भद्राणि पश्यन्तु मा कश्चिद् दुःखभाग्भवेत् ॥
श्रीकृष्णार्पणमस्तु, श्री साम्बसदाशिवार्पणमस्तु ॥`,
    te: `అనేన కృతేన యథాశక్తి నిత్య పూజా సంకల్ప కర్మణా ।
శ్రీ మహాబలేశ్వర స్వామి, శ్రీ మహాగణపతి దేవతాః సుప్రీతాః సుప్రసన్నాః వరదాః భవంతు ॥
సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః ।
సర్వే భద్రాణి పశ్యంతు మా కశ్చిత్ దుఃఖభాగ్భవేత్ ॥
శ్రీకృష్ణార్పణమస్తు, శ్రీ సాంబసదాశివార్పణమస్తు ॥`,
    ta: `அனேன கிருதேன யதாசக்தி நித்ய பூஜா சங்கல்ப கர்மணா ।
ஸ்ரீ மஹாபலேஸ்வர சுவாமி, ஸ்ரீ மஹாகணபதி தேவதாஃ சுப்ரீதாஃ சுபிரசன்னாஃ வரதாஃ பவந்து ॥
சர்வே பவந்து சுகினஃ சர்வே சந்து நிராமயாஃ ।
சர்வே பத்ராணி பஸ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ॥
ஸ்ரீகிருஷ்ணார்ப்பணமஸ்து, ஸ்ரீ சாம்பசதாசிவார்ப்பணமஸ்து ॥`,
    en: `Anena kṛtena yathāśakti nitya pūjā saṅkalpa karmaṇā |
Śrī Mahābaleśvara Svāmī, Śrī Mahāgaṇapati devatāḥ suprītāḥ suprasannāḥ varadāḥ bhavantu ||
Sarve bhavantu sukhinaḥ sarve santu nirāmayāḥ |
Sarve bhadrāṇi paśyantu mā kaścid duḥkhabhāgbhavet ||
Śrīkṛṣṇārpaṇamastu, Śrī Sāmbasadāśivārpanamastu ||`
  };

  // Step 5 Mantras across 5 languages
  const step5MantraL5: Record<SevaLang, string> = {
    kn: `ಕರ್ಪೂರಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್ ।
ಸದಾವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀಸಹಿತಂ ನಮಾಮಿ ॥
ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತೇಃ ಸ್ವಭಾವಾತ್ ।
ಕರೋಮಿ ಯದ್ಯತ್ ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥
ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ ॥`,
    hi: `कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम् ।
सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि ॥
कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात् ।
करोमि यद्यत् सकलं परस्मै नारायणायेति समर्पयामि ॥
ॐ शान्तिः शान्तिः शान्तिः ॥`,
    te: `కర్పూరగౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారమ్ ।
సదావసంతం హృదయారవిందే భవం భవానీసహితం నమామి ॥
కాయేన వాచా మనసేంద్రియైర్వా బుద్ధ్యాత్మనా వా ప్రకృతేః స్వభావాత్ ।
కరోమి యద్యత్ సకలం పరస్మై నారాయణాయేతి సమర్పయామి ॥
ఓం శాంతిః శాంతిః శాంతిః ॥`,
    ta: `கற்பூர கௌரம் கருணாவதாரம் சம்சாரசாரம் புஜகேந்திரஹாரம் ।
சதா வஸந்தம் ஹிருதயாரவிந்தே பவம் பவானி சஹிதம் நமாமி ॥
காயேன வாசா மனஸேந்திரியைர்வா புத்யாத்மனா வா பிரக்ருதேஃ சுவபாவாத் ।
கரோமி யத்யத் சகலம் பரஸ்மை நாராயணாயேதி சமர்ப்பயாமி ॥
ஓம் சாந்திஃ சாந்திஃ சாந்திஃ ॥`,
    en: `Karpūragauraṁ karuṇāvatāraṁ saṁsārasāraṁ bhujagendrahāram |
Sadāvasantaṁ hṛdayāravinde bhavaṁ bhavānīsahitaṁ namāmi ||
Kāyena vācā manasendriyairvā buddhyātmanā vā prakṛteḥ svabhāvāt |
Karomi yadyat sakalaṁ parasmai nārāyaṇāyeti samarpayāmi ||
Om Śāntiḥ Śāntiḥ Śāntiḥ ||`
  };

  return [
    // ── STEP 1: DEEPA PRAJWALANE & MINDFUL PRAYER (~45s) ──
    {
      step: 1,
      key: "deepa_achamana",
      titleKn: "೧. ದೀಪ ಪ್ರಜ್ವಲನೆ & ಭಕ್ತಿಪೂರ್ವಕ ಪ್ರಾರ್ಥನೆ",
      titleEn: "1. Lighting Sacred Lamp & Mindful Prayer",
      titleHi: "१. दीप प्रज्वलन एवं पावन प्रार्थना",
      titleTe: "1. దీప ప్రజ్వలన & భక్తి ప్రార్థన",
      titleTa: "1. திருவிளக்கு ஏற்றுதல் & பக்தி பிரார்த்தனை",
      icon: "🪔",
      approxSeconds: 45,
      visualEffect: "deepa",
      sanskritMantra: step1MantraL5[selectedLang] || step1MantraL5.kn,
      sanskritMantraL5: step1MantraL5,
      narrationText: {
        kn: `ದೇವರಿಗೆ ಎರಡೂ ಕೈಯನ್ನು ಮುಗಿದು ನಮಸ್ಕರಿಸಿ. ದೇವರ ಮುಂದೆ ಶುದ್ಧ ಎಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ. ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಮನಸ್ಸಿನಲ್ಲಿ ದೇವರನ್ನು ಸ್ಮರಣೆ ಮಾಡಿ.`,
        hi: `भगवान के समक्ष दोनों हाथ जोड़कर प्रणाम करें। पूजा स्थल में शुद्ध घी अथवा तेल का दीप प्रज्वलित करें। अब इस पावन मंत्र को ध्यान से सुनें और मन में प्रभु का स्मरण करें।`,
        te: `దేవునికి రెండు చేతులు జోడించి నమస్కరించండి. పూజా మందిరంలో స్వచ్ఛమైన నెయ్యి లేదా నూనెతో దీపం వెలిగించండి. ఇప్పుడు చెప్పే మంత్రాన్ని శ్రద్ధగా విని, మనస్సులో భగవంతుని స్మరించుకోండి.`,
        ta: `இறைவனுக்கு இரு கைகூப்பி வணங்குங்கள். பூஜை அறையில் தூய நெய் அல்லது எண்ணெய் தீபம் ஏற்றுங்கள். இப்போது சொல்லப்படும் மந்திரத்தை கவனமாகக் கேட்டு, மனதில் இறைவனை தியானியுங்கள்.`,
        en: `Fold both hands in humble reverence before God. Light the sacred lamp with pure oil or cow's ghee at the altar. Listen attentively to the sacred mantra and meditate upon the Supreme Divine in your heart.`
      },
      actionGuide: {
        kn: "ದೇವರ ಮಂಟಪದಲ್ಲಿ ದೀಪ ಬೆಳಗಿಸಿ, ಎರಡು ಕೈಗಳನ್ನು ಮುಗಿದು ಭಕ್ತಿಯಿಂದ ನಮಸ್ಕರಿಸಿ.",
        hi: "पूजा स्थल में दीप प्रज्वलित करें, हाथ जोड़कर श्रद्धापूर्वक नमन करें।",
        te: "పూజా మందిరంలో దీపం వెలిగించి, రెండు చేతులు జోడించి భక్తితో నమస్కరించండి.",
        ta: "பூஜை அறையில் விளக்கேற்றி, இரு கைகூப்பி பக்தியுடன் வணங்கவும்.",
        en: "Light the altar lamp and fold both hands in prayer with reverence and peace."
      },
      spiritualSignificance: {
        kn: "ಅಜ್ಞಾನದ ಕತ್ತಲೆಯನ್ನು ನೀಗಿಸಿ ಜ್ಞಾನ, ಶಾಂತಿ, ಶುಭ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ಮನೆಯಲ್ಲಿ ನೆಲೆಗೊಳಿಸುವುದು.",
        hi: "अज्ञान रूपी अंधकार को दूर कर ज्ञान, शांति एवं आरोग्यता का संचार करना।",
        te: "అజ్ఞానాన్ని తొలగించి జ్ఞానం, శాంతి, ఆరోగ్యం మరియు శుభాన్ని నింపడం.",
        ta: "அறியாமை நீக்கி ஞானம், அமைதி, ஆரோக்கியம் மற்றும் சுபத்தை நிலைநிறுத்துதல்.",
        en: "Dispels darkness, invokes wisdom, peace, vitality, and fills the home with auspicious cosmic energies."
      },
      nextStepPrompt: {
        kn: "ನೀವು ದೀಪ ಬೆಳಗಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ದೀಪ ಬೆಳಗಿದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
        hi: "आप जब तक दीप प्रज्वलित करते हैं, मैं प्रतीक्षा कर रहा हूँ। दीप प्रज्वलन के उपरांत अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
        te: "మీరు దీపం వెలిగించేవరకు నేను వేచి ఉంటాను. దీపం వెలిగించిన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
        ta: "நீங்கள் விளக்கேற்றும் வரை நான் காத்திருக்கிறேன். விளக்கேற்றிய பிறகு அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
        en: "I am waiting for you to light the sacred lamp and pray. Once lit, please click the 'Continue' button to proceed."
      },
      priestNarrationL5: {
        kn: `ದೇವರ ಮಂಟಪದಲ್ಲಿ ಶುದ್ಧ ಎಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ, ಬತ್ತಿಯನ್ನು ಇಟ್ಟು ಜ್ಯೋತಿಯನ್ನು ಪ್ರಜ್ವಲಿಸಿ. ${BENEFIT_INTRO.kn} ಅಜ್ಞಾನದ ಕತ್ತಲೆಯನ್ನು ನೀಗಿಸಿ ಜ್ಞಾನ, ಶಾಂತಿ, ಶುಭ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ಮನೆಯಲ್ಲಿ ನೆಲೆಗೊಳಿಸುವುದು. ದೇವರಿಗೆ ಎರಡೂ ಕೈಯನ್ನು ಮುಗಿದು ನಮಸ್ಕರಿಸಿ. ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಮನಸ್ಸಿನಲ್ಲಿ ದೇವರನ್ನು ಸ್ಮರಣೆ ಮಾಡಿ: ${step1MantraL5.kn} । ${DEFAULT_NEXT_STEP_PROMPTS.kn[1]}`,
        hi: `पूजा स्थल में शुद्ध घी अथवा तेल का दीप प्रज्वलित करें। ${BENEFIT_INTRO.hi} अज्ञान रूपी अंधकार को दूर कर ज्ञान, शांति एवं आरोग्यता का संचार करना। भगवान के समक्ष दोनों हाथ जोड़कर प्रणाम करें। अब इस पावन मंत्र को ध्यान से सुनें और मन में प्रभु का स्मरण करें: ${step1MantraL5.hi} । ${DEFAULT_NEXT_STEP_PROMPTS.hi[1]}`,
        te: `పూజా మందిరంలో స్వచ్ఛమైన నెయ్యి లేదా నూనెతో దీపం వెలిగించండి. ${BENEFIT_INTRO.te} అజ్ఞానాన్ని తొలగించి జ్ఞానం, శాంతి, ఆరోగ్యం మరియు శుభాన్ని నింపడం. దేవునికి రెండు చేతులు జోడించి నమస్కరించండి. ఇప్పుడు చెప్పే మంత్రాన్ని శ్రద్ధగా విని, మనస్సులో భగవంతుని స్మరించుకోండి: ${step1MantraL5.te} । ${DEFAULT_NEXT_STEP_PROMPTS.te[1]}`,
        ta: `பூஜை அறையில் தூய நெய் அல்லது எண்ணெய் தீபம் ஏற்றுங்கள். ${BENEFIT_INTRO.ta} அறியாமை நீக்கி ஞானம், அமைதி, ஆரோக்கியம் மற்றும் சுபத்தை நிலைநிறுத்துதல். இறைவனுக்கு இரு கைகூப்பி வணங்குங்கள். இப்போது சொல்லப்படும் மந்திரத்தை கவனமாகக் கேட்டு, மனதில் இறைவனை தியானியுங்கள்: ${step1MantraL5.ta} । ${DEFAULT_NEXT_STEP_PROMPTS.ta[1]}`,
        en: `Light the sacred lamp with pure oil or cow's ghee at the altar. ${BENEFIT_INTRO.en} Dispels darkness, invokes wisdom, peace, vitality, and fills the home with auspicious cosmic energies. Fold both hands in humble reverence before God, listen attentively to this sacred mantra, and meditate upon the Supreme Divine in your heart: ${step1MantraL5.en} | ${DEFAULT_NEXT_STEP_PROMPTS.en[1]}`
      }
    },

    // ── STEP 2: GURU & GANAPATI SMARANE & AKSHATA IN HAND (~45s) ──
    {
      step: 2,
      key: "guru_ganapati",
      titleKn: "೨. ಗುರು-ಗಣಪತಿ ಸ್ಮರಣೆ & ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಧಾರಣೆ",
      titleEn: "2. Guru & Ganapati Invocation with Akshata",
      titleHi: "२. गुरु-गणपति स्मरण एवं हाथ में अक्षत धारण",
      titleTe: "2. గురు-గణపతి स्मरण & చేతిలో అక్షతలు ధారణ",
      titleTa: "2. குரு-கணபதி தியானம் & கையில் அட்சதை ஏந்துதல்",
      icon: "🌺",
      approxSeconds: 45,
      visualEffect: "ganesha",
      sanskritMantra: step2MantraL5[selectedLang] || step2MantraL5.kn,
      sanskritMantraL5: step2MantraL5,
      narrationText: {
        kn: `ಈಗ ಬಲಗೈಯಲ್ಲಿ ಸ್ವಲ್ಪ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ತಾಜಾ ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಎಡಗೈಯನ್ನು ಕೆಳಗೆ ಆಸರೆಯಾಗಿಟ್ಟು ಎದೆಯ ಹತ್ತಿರ ಗೌರವದಿಂದ ಹಿಡಿಯಿರಿ. ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಸರ್ವ ವಿಘ್ನನಿವಾರಕ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಮತ್ತು ಜ್ಞಾನದಾತೃ ಶ್ರೀ ಸದ್ಗುರುಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ಮರಣೆ ಮಾಡಿ.`,
        hi: `अब दाहिने हाथ में थोड़ा पावन अक्षत और पुष्प धारण करें। बाएं हाथ का सहारा देकर हृदय के समीप श्रद्धा से रखें। अब इस मंत्र को ध्यान से सुनें और विघ्नहर्ता श्री महागणपति तथा ज्ञानदाता श्री सद्गुरु का मन में स्मरण करें।`,
        te: `ఇప్పుడు కుడి చేతిలో కొద్దిగా పవిత్ర అక్షతలు మరియు పువ్వులను తీసుకోండి. ఎడమ చేతిని క్రింద ఆసరాగా ఉంచి గుండె వద్ద భక్తితో పట్టుకోండి. ఇప్పుడు చెప్పే మంత్రాన్ని విని, సర్వ విఘ్నాలను తొలగించే శ్రీ గణపతిని మరియు సద్గురువులను స్మరించుకోండి.`,
        ta: `இப்போது வலது கையில் சிறிது புனித அட்சதை மற்றும் மலர்களை எடுத்துக் கொள்ளுங்கள். இடது கையை அடியில் தாங்கி நெஞ்சருகில் பக்தியுடன் பிடியுங்கள். இப்போது ஒலிக்கும் மந்திரத்தைக் கேட்டு, விக்னம் தீர்க்கும் ஸ்ரீ மஹாகணபதி மற்றும் குருவை மனதில் தியானியுங்கள்.`,
        en: `Now take a pinch of sacred Akshata (consecrated rice) and fresh flowers into your right palm, resting gently over your left palm near your heart. Listen attentively to the mantra, meditating upon Lord Ganesha for obstacle removal and the Guru for divine wisdom.`
      },
      actionGuide: {
        kn: "ಸ್ವಲ್ಪ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಬಲ ಅಂಗೈಯಲ್ಲಿ ಇಟ್ಟುಕೊಂಡು, ಎಡಗೈಯನ್ನು ಕೆಳಗೆ ಆಸರೆಯಾಗಿಟ್ಟು ಎದೆಯ ಹತ್ತಿರ ಗೌರವದಿಂದ ಹಿಡಿಯಿರಿ.",
        hi: "थोड़ा अक्षत और फूल दाहिनी हथेली में रखकर, बाएं हाथ का सहारा देकर हृदय के समीप श्रद्धा से धारण करें।",
        te: "కొన్ని అక్షతలు మరియు పూలను కుడి అరచేతిలో ఉంచి, ఎడమ చేతిని కింద ఆసరాగా ఉంచి హృదయం వద్ద భక్తితో పట్టుకోండి.",
        ta: "சிறிது அட்சதை மற்றும் மலரை வலது உள்ளங்கையில் வைத்து, இடது கையை அடியில் தாங்கி இதயத்திற்கு அருகில் பக்தியுடன் பிடிக்கவும்.",
        en: "Hold a pinch of sacred Akshata and a flower in your right palm, resting gently over the left palm near your heart."
      },
      spiritualSignificance: {
        kn: "ಪ್ರಾರಂಭಿಸುವ ಪೂಜೆ ಹಾಗೂ ದಿನದ ಎಲ್ಲಾ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗಿ ಗುರು-ಗಣಪತಿಯ ಸಾಕ್ಷಾತ್ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿ.",
        hi: "दिन के समस्त कार्यों में विघ्न निवारण एवं गुरु-गणपति की साक्षात कृपा प्राप्ति।",
        te: "దినచర్యలో సర్వ విఘ్నాలు తొలగి గురు-గణపతుల సాక్షాత్ అనుగ్రహం లభించడం.",
        ta: "அனைத்து காரியங்களிலும் தடைகள் நீங்கி குரு-கணபதியின் அருள் பெறுதல்.",
        en: "Removes all unseen obstacles and connects consciousness to the lineage of wisdom and divine guidance."
      },
      nextStepPrompt: {
        kn: "ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ, ನೀವು ಸಿದ್ಧವಾಗುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಸಿದ್ಧವಾದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
        hi: "हाथ में अक्षत एवं पुष्प धारण करें, आपके तैयार होने तक मैं प्रतीक्षा कर रहा हूँ। तैयार होने पर अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
        te: "చేతిలో అక్షతలు మరియు పుష్పం ఉంచుకోండి, మీరు సిద్ధమయ్యేవరకు నేను వేచి ఉంటాను. సిద్ధమైన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
        ta: "கையில் அட்சதை மற்றும் மலரை ஏந்தவும், நீங்கள் தயாராகும் வரை நான் காத்திருக்கிறேன். தயாரானதும் அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
        en: "Please hold the sacred Akshata and flowers in hand, I am waiting for you to prepare. Once ready, please click the 'Continue' button."
      },
      priestNarrationL5: {
        kn: `ಬಲಗೈಯಲ್ಲಿ ಸ್ವಲ್ಪ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ತಾಜಾ ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಎಡಗೈಯನ್ನು ಕೆಳಗೆ ಆಸರೆಯಾಗಿಟ್ಟು ಎದೆಯ ಹತ್ತಿರ ಗೌರವದಿಂದ ಹಿಡಿಯಿರಿ. ${BENEFIT_INTRO.kn} ಪ್ರಾರಂಭಿಸುವ ಪೂಜೆ ಹಾಗೂ ದಿನದ ಎಲ್ಲಾ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗಿ ಗುರು-ಗಣಪತಿಯ ಸಾಕ್ಷಾತ್ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿ. ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಸರ್ವ ವಿಘ್ನನಿವಾರಕ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಮತ್ತು ಜ್ಞಾನದಾತೃ ಶ್ರೀ ಸದ್ಗುರುಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ಮರಣೆ ಮಾಡಿ: ${step2MantraL5.kn} । ${DEFAULT_NEXT_STEP_PROMPTS.kn[2]}`,
        hi: `दाहिने हाथ में थोड़ा पावन अक्षत और पुष्प धारण करें। बाएं हाथ का सहारा देकर हृदय के समीप श्रद्धा से रखें। ${BENEFIT_INTRO.hi} दिन के समस्त कार्यों में विघ्न निवारण एवं गुरु-गणपति की साक्षात कृपा प्राप्ति। अब इस मंत्र को ध्यान से सुनें और विघ्नहर्ता श्री महागणपति तथा ज्ञानदाता श्री सद्गुरु का मन में स्मरण करें: ${step2MantraL5.hi} । ${DEFAULT_NEXT_STEP_PROMPTS.hi[2]}`,
        te: `కుడి చేతిలో కొద్దిగా పవిత్ర అక్షతలు మరియు పువ్వులను తీసుకోండి. ఎడమ చేతిని క్రింద ఆసరాగా ఉంచి గుండె వద్ద భక్తితో పట్టుకోండి. ${BENEFIT_INTRO.te} దినచర్యలో సర్వ విఘ్నాలు తొలగి గురు-గణపతుల సాక్షాత్ అనుగ్రహం లభించడం. ఇప్పుడు చెప్పే మంత్రాన్ని విని, సర్వ విఘ్నాలను తొలగించే శ్రీ గణపతిని మరియు సద్గురువులను స్మరించుకోండి: ${step2MantraL5.te} । ${DEFAULT_NEXT_STEP_PROMPTS.te[2]}`,
        ta: `வலது கையில் சிறிது புனித அட்சதை மற்றும் மலர்களை எடுத்துக் கொள்ளுங்கள். இடது கையை அடியில் தாங்கி நெஞ்சருகில் பக்தியுடன் பிடியுங்கள். ${BENEFIT_INTRO.ta} அனைத்து காரியங்களிலும் தடைகள் நீங்கி குரு-கணபதியின் அருள் பெறுதல். இப்போது ஒலிக்கும் மந்திரத்தைக் கேட்டு, விக்னம் தீர்க்கும் ஸ்ரீ மஹாகணபதி மற்றும் குருவை மனதில் தியானியுங்கள்: ${step2MantraL5.ta} । ${DEFAULT_NEXT_STEP_PROMPTS.ta[2]}`,
        en: `Take a pinch of sacred Akshata and fresh flowers into your right palm, resting gently over your left palm near your heart. ${BENEFIT_INTRO.en} Removes all unseen obstacles and connects consciousness to the lineage of wisdom and divine guidance. Listen attentively to the mantra, meditating upon Lord Ganesha for obstacle removal and the Guru for divine wisdom: ${step2MantraL5.en} | ${DEFAULT_NEXT_STEP_PROMPTS.en[2]}`
      }
    },

    // ── STEP 3: VEDIC MAHA SANKALPA WITH LIVE DESHA-KAALA & USER SANKALPAS (~90s) ──
    {
      step: 3,
      key: "maha_sankalpa",
      titleKn: "೩. ಪಂಚಾಂಗ ಸಹಿತ ಮಹಾ ದೈವಿಕ ಸಂಕಲ್ಪ",
      titleEn: "3. Vedic Desha-Kaala & Devotee Maha Sankalpa",
      titleHi: "३. पंचांग युक्त महा वैदिक संकल्प",
      titleTe: "3. పంచాంగ సహిత మహా వైదిక సంకల్పం",
      titleTa: "3. பஞ்சாங்க சகித மகா வைதீக சங்கல்பம்",
      icon: "📜",
      approxSeconds: 90,
      visualEffect: "sankalpa",
      sanskritMantra: step3MantraL5[selectedLang] || step3MantraL5.kn,
      sanskritMantraL5: step3MantraL5,
      narrationText: {
        kn: `ಈಗ ನಾವು ಇಂದಿನ ಪವಿತ್ರ ಮಹಾ ಸಂಕಲ್ಪವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತಿದ್ದೇವೆ. ನಿಮ್ಮ ಗೋತ್ರ, ರಾಶಿ, ನಕ್ಷತ್ರ ಮತ್ತು ಇಂದಿನ ಪಂಚಾಂಗದ ವಿವರಗಳೊಂದಿಗೆ ಸಂಕಲ್ಪವನ್ನು ನೆರವೇರಿಸಲಾಗುವುದು. ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಹಿಡಿದುಕೊಂಡು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ವೇದ ವಿದ್ವಾಂಸರಾದ ${priestName} ಅವರ ಧ್ವನಿ ಸಮ್ಮುಖದಲ್ಲಿ: ${samvatsara} ಸಂವತ್ಸರದ, ${masa}, ${tithi} ತಿಥಿಯಂದು, ${gotra} ಗೋತ್ರದ, ${rashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರದ ಶ್ರೀ ${devoteeName} ಅವರ ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳಾದ — "${activePhrasesKannada}" — ಇವುಗಳ ಸಿದ್ಧಿಗಾಗಿ ಈಗ ಹೇಳುವ ಮಹಾ ಸಂಕಲ್ಪ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಮನಸ್ಸಿನಲ್ಲಿ ದೇವರಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿಕೊಳ್ಳಿ.`,
        hi: `अब हम आज का पावन महा संकल्प प्रारंभ कर रहे हैं। आपके गोत्र, राशि, नक्षत्र एवं आज के पंचांग के संवत्सर, मास, तिथि विवरण के साथ यह संकल्प होगा। हाथ में अक्षत श्रद्धापूर्वक रखकर, गोकर्ण क्षेत्र के मुख्य वेद पंडित ${priestName} के सान्निध्य में: ${samvatsaraHi} संवत्सर, ${masaHi}, ${tithiHi} तिथि, ${gotraHi} गोत्र, ${rashiHi} राशि, ${nakshatraHi} नक्षत्र के भक्त ${devoteeName} के मनोकामनाओं — "${activePhrasesKannada}" — की सिद्धि हेतु अब उच्चारित होने वाले संकल्प मंत्र को ध्यान से सुनें और मन में अपनी समस्त मनोकामनाओं की प्रभु से प्रार्थना करें।`,
        te: `ఇప్పుడు మనం నేటి పవిత్ర మహా సంకల్పాన్ని ప్రారంభిస్తున్నాము. మీ గోత్రం, రాశి, నక్షత్రం మరియు నేటి పంచాంగపు సంవత్సరం, మాసం, తిథి వివరాలతో ఈ సంకల్పం చేయబడుతుంది. చేతిలోని అక్షతలను భక్తితో పట్టుకొని, గోకర్ణ క్షేత్ర ప్రధాన వేద పండితులు ${priestName} గారి దివ్య సమక్షంలో: ${samvatsaraTe} సంవత్సరం, ${masaTe}, ${tithiTe} తిథి, ${gotraTe} గోత్రం, ${rashiTe} రాశి, ${nakshatraTe} నక్షత్ర భక్తులు ${devoteeName} గారి సంకల్పాలు — "${activePhrasesKannada}" — నెరవేరాలని ఇప్పుడు పఠించే సంకల్ప మంత్రాన్ని శ్రద్ధగా విని, మీ మనోభీష్టాలను దేవునికి ప్రార్థించండి.`,
        ta: `இப்போது நாம் இன்றைய புனித மகா சங்கல்பத்தை தொடங்குகிறோம். உங்கள் கோத்திரம், ராசி, நட்சத்திரம் மற்றும் இன்றைய பஞ்சாங்கத்தின் வருடம், மாதம், திதி விபரங்களுடன் இந்த சங்கல்பம் அமையும். கையில் உள்ள அட்சதையை ஏந்தி, கோகர்ண க்ஷேத்திரத்தின் முதன்மை வேத பண்டிதர் ${priestName} அவர்களின் திவ்ய முன்னிலையில்: ${samvatsaraTa} வருடம், ${masaTa}, ${tithiTa} திதி, ${gotraTa} கோத்திரம், ${rashiTa} ராசி, ${nakshatraTa} நட்சத்திர பக்தர் ${devoteeName} அவர்களின் வேண்டுதல்கள் — "${activePhrasesKannada}" — நிறைவேற இப்போது ஒலிக்கும் சங்கல்ப மந்திரத்தை கவனமாகக் கேட்டு, உங்கள் வேண்டுதல்களை இறைவனிடம் மனதார வேண்டிக் கொள்ளுங்கள்.`,
        en: `Now we are beginning today's sacred Vedic Maha Sankalpa, personalized with your Gotra, Rashi, Nakshatra, and today's Panchanga Desha-Kaala details. Holding the sacred Akshata close to your heart in the sanctum of Gokarna Kshetra guided by Priest ${priestName}: On this holy day of ${samvatsara} Samvatsara, ${masa}, ${tithi}, for devotee ${devoteeName} of ${gotra} Gotra, ${rashiName} Rashi, ${nakshatraName} Nakshatra, offering prayers for — "${activePhrasesKannada}" — listen attentively to the Vedic chant and silently present your prayers before God.`
      },
      actionGuide: {
        kn: "ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಬಿಗಿಯಾಗಿ ಹಿಡಿದುಕೊಂಡು, ಪಂಡಿತರ ಮಂತ್ರೋಚ್ಚಾರಣೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಸಂಕಲ್ಪಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ಪ್ರಾರ್ಥಿಸಿಕೊಳ್ಳಿ.",
        hi: "हाथ में अक्षत श्रद्धापूर्वक रखकर, पंडित जी के मंत्रोच्चार के साथ अपनी आंतरिक मनोकामनाओं का शांत मन से स्मरण करें।",
        te: "చేతిలోని అక్షతలను భక్తితో పట్టుకొని, పండితుల మంత్రోచ్చారణతో మీ మనోభీష్టాలను స్మరించుకోండి.",
        ta: "கையில் உள்ள அட்சதையை பக்தியுடன் பற்றி, பண்டிதரின் மந்திர உச்சாடனையுடன் உங்கள் மனதின் சங்கல்பங்களை வேண்டிக் கொள்ளுங்கள்.",
        en: "Hold the consecrated Akshata close to your heart, silently affirming your prayers as the Vedic Priest chants the Desha-Kaala Sankalpa."
      },
      spiritualSignificance: {
        kn: "ದೇಶ-ಕಾಲ ಹಾಗೂ ಭಕ್ತನ ಜನ್ಮ ನಕ್ಷತ್ರದೊಂದಿಗೆ ವಿಶ್ವ ಬ್ರಹ್ಮಾಂಡ ಚೈತನ್ಯಕ್ಕೆ ನೇರ ಸಂಕಲ್ಪ ಸ್ಪಂದನ.",
        hi: "देश-काल एवं जन्म नक्षत्र के साथ ब्रह्मांडीय चेतना से सीधा आत्मिक संपर्क।",
        te: "దేశ-కాలాలు మరియు జన్మ నక్షత్రంతో విశ్వ చైతన్యానికి సంకల్ప అనుసంధానం.",
        ta: "தேச-காலம் மற்றும் பிறந்த நட்சத்திரத்துடன் பிரபஞ்ச சக்தியோடு சங்கல்ப இணைப்பு.",
        en: "Aligns your personal soul vibration with the cosmic planetary coordinates of the universe."
      },
      nextStepPrompt: {
        kn: "ನೀವು ಸಂಕಲ್ಪ ಧ್ಯಾನ ಮಾಡುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಹಾಗೆಯೇ ಹಿಡಿದುಕೊಳ್ಳಿ, ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
        hi: "हाथ में अक्षत वैसे ही रखें, आपके संकल्प ध्यान तक मैं प्रतीक्षा कर रहा हूँ। अगले समर्पण चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
        te: "చేతిలోని అక్షతలను అలాగే ఉంచుకోండి, మీరు సంకల్ప ధ్యానం చేసేవరకు నేను వేచి ఉంటాను. తదుపరి సమర్పణ దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
        ta: "கையில் உள்ள அட்சதையை அப்படியே வைத்திருக்கவும், நீங்கள் சங்கல்ப தியானம் செய்யும் வரை நான் காத்திருக்கிறேன். அடுத்த சமர்ப்பண படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
        en: "Keep holding the sacred Akshata in hand, I am waiting as you meditate upon your Sankalpa. Please click the 'Continue' button to proceed to the offering step."
      },
      priestNarrationL5: {
        kn: `ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಬಿಗಿಯಾಗಿ ಹಿಡಿದುಕೊಳ್ಳಿ. ${BENEFIT_INTRO.kn} ದೇಶ-ಕಾಲ ಹಾಗೂ ಭಕ್ತನ ಜನ್ಮ ನಕ್ಷತ್ರದೊಂದಿಗೆ ವಿಶ್ವ ಬ್ರಹ್ಮಾಂಡ ಚೈತನ್ಯಕ್ಕೆ ನೇರ ಸಂಕಲ್ಪ ಸ್ಪಂದನ. ಈಗ ನಾವು ಇಂದಿನ ಪವಿತ್ರ ಮಹಾ ಸಂಕಲ್ಪವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತಿದ್ದೇವೆ. ನಿಮ್ಮ ಗೋತ್ರ, ರಾಶಿ, ನಕ್ಷತ್ರ ಮತ್ತು ಇಂದಿನ ಪಂಚಾಂಗದ ವಿವರಗಳೊಂದಿಗೆ ಸಂಕಲ್ಪವನ್ನು ನೆರವೇರಿಸಲಾಗುವುದು. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ವೇದ ವಿದ್ವಾಂಸರಾದ ${priestName} ಅವರ ಧ್ವನಿ ಸಮ್ಮುಖದಲ್ಲಿ: ${samvatsara} ಸಂವತ್ಸರದ, ${masa}, ${tithi} ತಿಥಿಯಂದು, ${gotra} ಗೋತ್ರದ, ${rashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರದ ಶ್ರೀ ${devoteeName} ಅವರ ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳಾದ — "${activePhrasesKannada}" — ಇವುಗಳ ಸಿದ್ಧಿಗಾಗಿ ಈಗ ಹೇಳುವ ಮಹಾ ಸಂಕಲ್ಪ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಮನಸ್ಸಿನಲ್ಲಿ ದೇವರಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿಕೊಳ್ಳಿ: ${step3MantraL5.kn} । ${DEFAULT_NEXT_STEP_PROMPTS.kn[3]}`,
        hi: `हाथ में अक्षत श्रद्धापूर्वक रखें। ${BENEFIT_INTRO.hi} देश-काल एवं जन्म नक्षत्र के साथ ब्रह्मांडीय चेतना से सीधा आत्मिक संपर्क। अब हम आज का पावन महा संकल्प प्रारंभ कर रहे हैं। आपके गोत्र, राशि, नक्षत्र एवं आज के पंचांग के संवत्सर, मास, तिथि विवरण के साथ यह संकल्प होगा। गोಕರ್ಣ क्षेत्र के मुख्य वेद पंडित ${priestName} के सान्निध्य में: ${samvatsaraHi} संवत्सर, ${masaHi}, ${tithiHi} तिथि, ${gotraHi} गोत्र, ${rashiHi} राशि, ${nakshatraHi} नक्षत्र के भक्त ${devoteeName} के मनोकामनाओं — "${activePhrasesKannada}" — की सिद्धि हेतु अब उच्चारित होने वाले संकल्प मंत्र को ध्यान से सुनें और मन में अपनी समस्त मनोकामनाओं की प्रभु से प्रार्थना करें: ${step3MantraL5.hi} । ${DEFAULT_NEXT_STEP_PROMPTS.hi[3]}`,
        te: `చేతిలోని అక్షతలను భక్తితో పట్టుకోండి. ${BENEFIT_INTRO.te} దేశ-కాలాలు మరియు జన్మ నక్షత్రంతో విశ్వ చైతన్యానికి సంకల్ప అనుసంధానం. ఇప్పుడు మనం నేటి పవిత్ర మహా సంకల్పాన్ని ప్రారంభిస్తున్నాము. మీ గోత్రం, రాశి, నక్షత్రం మరియు నేటి పంచాంగపు సంవత్సరం, మాసం, తిథి వివరాలతో ఈ సంకల్పం చేయబడుతుంది. గోకర్ణ క్షేత్ర ప్రధాన వేద పండితులు ${priestName} గారి దివ్య సమక్షంలో: ${samvatsaraTe} సంవత్సరం, ${masaTe}, ${tithiTe} తిథి, ${gotraTe} గోత్రం, ${rashiTe} రాశి, ${nakshatraTe} నక్షత్ర భక్తులు ${devoteeName} గారి సంకల్పాలు — "${activePhrasesKannada}" — నెరవేరాలని ఇప్పుడు పఠించే సంకల్ప మంత్రాన్ని శ్రద్ధగా విని, మీ మనోభీష్టాలను దేవునికి ప్రార్థించండి: ${step3MantraL5.te} । ${DEFAULT_NEXT_STEP_PROMPTS.te[3]}`,
        ta: `கையில் உள்ள அட்சதையை பக்தியுடன் பற்றிக் கொள்ளுங்கள். ${BENEFIT_INTRO.ta} தேச-காலம் மற்றும் பிறந்த நட்சத்திரத்துடன் பிரபஞ்ச சக்தியோடு சங்கல்ப இணைப்பு. இப்போது நாம் இன்றைய புனித மகா சங்கல்பத்தை தொடங்குகிறோம். உங்கள் கோத்திரம், ராசி, நட்சத்திரம் மற்றும் இன்றைய பஞ்சாங்கத்தின் வருடம், மாதம், திதி விபரங்களுடன் இந்த சங்கல்பம் அமையும். கோகர்ண க்ஷேத்திரத்தின் முதன்மை வேத பண்டிதர் ${priestName} அவர்களின் திவ்ய முன்னிலையில்: ${samvatsaraTa} வருடம், ${masaTa}, ${tithiTa} திதி, ${gotraTa} கோத்திரம், ${rashiTa} ராசி, ${nakshatraTa} நட்சத்திர பக்தர் ${devoteeName} அவர்களின் வேண்டுதல்கள் — "${activePhrasesKannada}" — நிறைவேற இப்போது ஒலிக்கும் சங்கல்ப மந்திரத்தை கவனமாகக் கேட்டு, உங்கள் வேண்டுதல்களை இறைவனிடம் மனதார வேண்டிக் கொள்ளுங்கள்: ${step3MantraL5.ta} । ${DEFAULT_NEXT_STEP_PROMPTS.ta[3]}`,
        en: `Hold the consecrated Akshata close to your heart. ${BENEFIT_INTRO.en} Aligns your personal soul vibration with the cosmic planetary coordinates of the universe. Now we are beginning today's sacred Vedic Maha Sankalpa, personalized with your Gotra, Rashi, Nakshatra, and today's Panchanga Desha-Kaala details. Holding the sacred Akshata in the sanctum of Gokarna Kshetra guided by Priest ${priestName}: On this holy day of ${samvatsara} Samvatsara, ${masa}, ${tithi}, for devotee ${devoteeName} of ${gotra} Gotra, ${rashiName} Rashi, ${nakshatraName} Nakshatra, offering prayers for — "${activePhrasesKannada}" — listen attentively to the Vedic chant and silently present your prayers before God: ${step3MantraL5.en} | ${DEFAULT_NEXT_STEP_PROMPTS.en[3]}`
      }
    },

    // ── STEP 4: SANKALPA SAMARPANAM TO GOD'S LOTUS FEET (~45s) ──
    {
      step: 4,
      key: "sankalpa_samarpana",
      titleKn: "೪. ದೇವತಾ ಪಾದಾರವಿಂದಕ್ಕೆ ಸಂಕಲ್ಪ ಸಮರ್ಪಣೆ",
      titleEn: "4. Offering Sankalpa & Akshata to God's Lotus Feet",
      titleHi: "४. प्रभु के चरण कमलों में संकल्प समर्पण",
      titleTe: "4. భగవంతుని పాదపద్మాలకు సంకల్ప సమర్పణ",
      titleTa: "4. இறைவனின் பாதாரவிந்தங்களில் சங்கல்ப சமர்ப்பணம்",
      icon: "✨",
      approxSeconds: 45,
      visualEffect: "akshata",
      sanskritMantra: step4MantraL5[selectedLang] || step4MantraL5.kn,
      sanskritMantraL5: step4MantraL5,
      narrationText: {
        kn: `ಈಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿರುವ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ಪುಷ್ಪಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ದೇವರ ಪಾದಾರವಿಂದಗಳಿಗೆ ಸಮರ್ಪಿಸಿ. "ಶ್ರೀ ಸಾಂಬಸದಾಶಿವಾರ್ಪಣಮಸ್ತು, ಶ್ರೀಕೃಷ್ಣಾರ್ಪಣಮಸ್ತು" ಎಂದು ನುಡಿದು ಮನಸ್ಸಿನ ಎಲ್ಲಾ ಚಿಂತೆ ಮತ್ತು ಭಾರಗಳನ್ನು ದೇವರಿಗೆ ಅರ್ಪಿಸಿ. ಈಗ ಹೇಳುವ ಸಮರ್ಪಣಾ ಮಂತ್ರವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಕೇಳಿ.`,
        hi: `अब अपने हाथ में रखे पावन अक्षत एवं पुष्पों को श्रद्धा से भगवान के श्रीचरणों में समर्पित करें। "श्री सांबसदाशिवार्पणमस्तु, श्रीकृष्णार्पणमस्तु" कहकर अपनी समस्त चिंताओं को प्रभु को सौंप दें। अब इस समर्पण मंत्र को श्रद्धा से सुनें।`,
        te: `ఇప్పుడు మీ చేతిలోని పవిత్ర అక్షతలు మరియు పూలను భక్తితో దేవుని పాదపద్మాలకు సమర్పించండి. "శ్రీ సాంబసదాశివార్పణమస్తు, శ్రీకృష్ణార్పణమస్తు" అని పలికి మీ మనస్సులోని భారాన్ని స్వామికి అప్పగించండి. ఇప్పుడు చెప్పే సమర్పణ మంత్రాన్ని భక్తితో వినండి.`,
        ta: `இப்போது உங்கள் கையில் உள்ள புனித அட்சதை மற்றும் மலர்களை பக்தியுடன் இறைவனின் திருப்பாதங்களில் சமர்ப்பியுங்கள். "ஸ்ரீ சாம்பசதாசிவார்ப்பணமஸ்து, ஸ்ரீகிருஷ்ணார்ப்பணமஸ்து" என்று கூறி மனக்கவலைகளை இறைவனிடம் ஒப்படையுங்கள். இப்போது ஒலிக்கும் சமர்ப்பண மந்திரத்தை கேளுங்கள்.`,
        en: `Now tenderly offer the consecrated Akshata and fresh flowers from your hands unto the Lotus Feet of the Lord. Pray 'Shri Samba Sadashivarpanamastu, Shri Krishnarpanamastu', surrendering all burdens to God, and listen with devotion to the dedication mantra.`
      },
      actionGuide: {
        kn: "ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ದೇವರ ಮಂಟಪದಲ್ಲಿರುವ ದೇವರ ಮೂರ್ತಿ ಅಥವಾ ಫೋಟೋದ ಪಾದಗಳಿಗೆ ಭಕ್ತಿಯಿಂದ ಅರ್ಪಿಸಿ.",
        hi: "हाथ के अक्षत और पुष्प को पूजा स्थल में भगवान की मूर्ति या चित्र के श्रीचरणों में श्रद्धा से अर्पित करें।",
        te: "చేతిలోని అక్షతలు మరియు పువ్వులను పూజా మందిరంలోని దేవుని పాదాల వద్ద భక్తితో సమర్పించండి.",
        ta: "கையில் உள்ள அட்சதை மற்றும் மலர்களை இறைவனின் பாதங்களில் பவ்யமாக சமர்ப்பிக்கவும்.",
        en: "Gently offer the Akshata and flower onto the Lotus Feet of the Deity at your altar with humble devotion."
      },
      spiritualSignificance: {
        kn: "ಸಂಕಲ್ಪದ ಸಂಪೂರ್ಣ ಫಲವು ದೇವರ ಚರಣಗಳಲ್ಲಿ ಅರ್ಪಿತವಾಗಿ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆಶೀರ್ವಾದ ಸಿಗುವುದು.",
        hi: "संकल्प का संपूर्ण फल प्रभु चरणों में समर्पित होकर ईश्वरीय सुरक्षा व मंगल की प्राप्ति।",
        te: "సంకల్ప ఫలం భగవత్ పాదాలకు చేరి దైవిక రక్షణ మరియు అనుగ్రహం లభించడం.",
        ta: "சங்கல்பத்தின் பூரண பலன் இறைவன் பாதங்களில் சேர்ந்து தெய்வீக அருளும் பாதுகாப்பும் அருளப்படுதல்.",
        en: "Total surrender (Samarpanam) transforms worldly desires into spiritually blessed reality."
      },
      nextStepPrompt: {
        kn: "ನೀವು ದೇವರ ಚರಣಗಳಿಗೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ ಪ್ರಾರ್ಥಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಸಮರ್ಪಿಸಿದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
        hi: "आप जब तक भगवान के चरणों में अक्षत समर्पित कर प्रार्थना करते हैं, मैं प्रतीक्षा कर रहा हूँ। समर्पण के उपरांत अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
        te: "మీరు దేవుని పాదాలకు అక్షతలు సమర్పించి ప్రార్థించేవరకు నేను వేచి ఉంటాను. సమర్పించిన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
        ta: "நீங்கள் இறைவனின் திருவடிகளில் அட்சதை சமர்ப்பித்து பிரார்த்திக்கும் வரை நான் காத்திருக்கிறேன். சமர்ப்பித்த பிறகு அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
        en: "I am waiting for you to offer the sacred Akshata at the lotus feet and pray. Once offered, please click the 'Continue' button."
      },
      priestNarrationL5: {
        kn: `ಈಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿರುವ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ಪುಷ್ಪಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ದೇವರ ಪಾದಾರವಿಂದಗಳಿಗೆ ಸಮರ್ಪಿಸಿ. ${BENEFIT_INTRO.kn} ಸಂಕಲ್ಪದ ಸಂಪೂರ್ಣ ಫಲವು ದೇವರ ಚರಣಗಳಲ್ಲಿ ಅರ್ಪಿತವಾಗಿ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆಶೀರ್ವಾದ ಸಿಗುವುದು. "ಶ್ರೀ ಸಾಂಬಸದಾಶಿವಾರ್ಪಣಮಸ್ತು, ಶ್ರೀಕೃಷ್ಣಾರ್ಪಣಮಸ್ತು" ಎಂದು ನುಡಿದು ಮನಸ್ಸಿನ ಎಲ್ಲಾ ಚಿಂತೆ ಮತ್ತು ಭಾರಗಳನ್ನು ದೇವರಿಗೆ ಅರ್ಪಿಸಿ. ಈಗ ಹೇಳುವ ಸಮರ್ಪಣಾ ಮಂತ್ರವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಕೇಳಿ: ${step4MantraL5.kn} । ${DEFAULT_NEXT_STEP_PROMPTS.kn[4]}`,
        hi: `अब अपने हाथ में रखे पावन अक्षत एवं पुष्पों को श्रद्धा से भगवान के श्रीचरणों में समर्पित करें। ${BENEFIT_INTRO.hi} संकल्प का संपूर्ण फल प्रभु चरणों में समर्पित होकर ईश्वरीय सुरक्षा व मंगल की प्राप्ति। "श्री सांबसदाशिवार्पणमस्तु, श्रीकृष्णार्पणमस्तु" कहकर अपनी समस्त चिंताओं को प्रभु को सौंप दें। अब इस समर्पण मंत्र को श्रद्धा से सुनें: ${step4MantraL5.hi} । ${DEFAULT_NEXT_STEP_PROMPTS.hi[4]}`,
        te: `ఇప్పుడు మీ చేతిలోని పవిత్ర అక్షతలు మరియు పూలను భక్తితో దేవుని పాదపద్మాలకు సమర్పించండి. ${BENEFIT_INTRO.te} సంకల్ప ఫలం భగవత్ పాదాలకు చేరి దైవిక రక్షణ మరియు అనుగ్రహం లభించడం. "శ్రీ సాంబసదాశివార్పణమస్తు, శ్రీకృష్ణార్పణమస్తు" అని పలికి మీ మనస్సులోని భారాన్ని స్వామికి అప్పగించండి. ఇప్పుడు చెప్పే సమర్పణ మంత్రాన్ని భక్తితో వినండి: ${step4MantraL5.te} । ${DEFAULT_NEXT_STEP_PROMPTS.te[4]}`,
        ta: `இப்போது உங்கள் கையில் உள்ள புனித அட்சதை மற்றும் மலர்களை பக்தியுடன் இறைவனின் திருப்பாதங்களில் சமர்ப்பியுங்கள். ${BENEFIT_INTRO.ta} சங்கல்பத்தின் பூரண பலன் இறைவன் பாதங்களில் சேர்ந்து தெய்வீக அருளும் பாதுகாப்பும் அருளப்படுதல். "ஸ்ரீ சாம்பசதாசிவார்ப்பணமஸ்து, ஸ்ரீகிருஷ்ணார்ப்பணமஸ்து" என்று கூறி மனக்கவலைகளை இறைவனிடம் ஒப்படையுங்கள். இப்போது ஒலிக்கும் சமர்ப்பண மந்திரத்தை கேளுங்கள்: ${step4MantraL5.ta} । ${DEFAULT_NEXT_STEP_PROMPTS.ta[4]}`,
        en: `Now tenderly offer the consecrated Akshata and fresh flowers from your hands unto the Lotus Feet of the Lord. ${BENEFIT_INTRO.en} Total surrender (Samarpanam) transforms worldly desires into spiritually blessed reality. Pray 'Shri Samba Sadashivarpanamastu, Shri Krishnarpanamastu', surrendering all burdens to God, and listen with devotion to the dedication mantra: ${step4MantraL5.en} | ${DEFAULT_NEXT_STEP_PROMPTS.en[4]}`
      }
    },

    // ── STEP 5: DEEPARADHANA (ARATI), SASHTANGA NAMASKARA & SHANTI (~60s) ──
    {
      step: 5,
      key: "deeparadhana_namaskara",
      titleKn: "೫. ದೀಪಾರಾಧನೆ (ಆರತಿ), ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ & ಶಾಂತಿ",
      titleEn: "5. Mangalarati, Sashtanga Namaskara & Peace",
      titleHi: "५. दीपाराधना (आरती), साष्टांग नमन एवं शांति",
      titleTe: "5. దీపారాధన (హారతి), సాష్టాంగ నమస్కారం & శాంతి",
      titleTa: "5. தீபாராதனை (ஆரத்தி), சாஷ்டாங்க நமஸ்காரம் & சாந்தி",
      icon: "🔥",
      approxSeconds: 60,
      visualEffect: "arathi",
      sanskritMantra: step5MantraL5[selectedLang] || step5MantraL5.kn,
      sanskritMantraL5: step5MantraL5,
      narrationText: {
        kn: `ಈಗ ಆರತಿ ತಟ್ಟೆಯನ್ನು ಹಿಡಿದು ದೇವರ ಮುಂದೆ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಮೂರು ಬಾರಿ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ನಂತರ ದೇವರಿಗೆ ಶ್ರದ್ಧೆಯಿಂದ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ, ಆರತಿಯ ಬೆಚ್ಚನೆಯ ಪವಿತ್ರ ಜ್ಯೋತಿಯನ್ನು ಎರಡು ಕಣ್ಣುಗಳಿಗೆ ಮುಟ್ಟಿಸಿಕೊಳ್ಳಿ. ಈಗ ಹೇಳುವ ಮಂಗಳಾರತಿ ಮತ್ತು ಶಾಂತಿ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಕೇಳಿ.`,
        hi: `अब आरती की थाली लेकर भगवान के समक्ष दक्षिणावर्त तीन बार मंगल आरती घुमाएं। इसके बाद श्रद्धापूर्वक साष्टांग प्रणाम करें और आरती की पावन ज्योति को नयनों से स्पर्श करें। अब मंगल आरती एवं शांति मंत्र को भक्तिभाव से सुनें।`,
        te: `ఇప్పుడు హారతి పళ్లెం తీసుకొని స్వామి ఎదుట ప్రదక్షిణ దిశలో మూడుసార్లు మంగళ హారతి ఇవ్వండి. అనంతరం దేవునికి సాష్టాంగ నమస్కారం చేసి, హారతి వెలుగును కళ్ళకు అద్దుకోండి. ఇప్పుడు చెప్పే మంగళ హారతి మరియు శాంతి మంత్రాన్ని భక్తితో వినండి.`,
        ta: `இப்போது ஆரத்தி தட்டை ஏந்தி இறைவன் முன் வலஞ்சுழியாக மூன்று முறை மங்கள ஆரத்தி காட்டவும். பின் சாஷ்டாங்கமாக வணங்கி, ஆரத்தியின் ஒளிக்கதிர்களை கண்களில் ஒற்றிக் கொள்ளுங்கள். இப்போது ஒலிக்கும் ஆரத்தி மற்றும் சாந்தி மந்திரத்தை கேளுங்கள்.`,
        en: `Now wave the sacred Mangalarati clockwise 3 times before the Lord. Prostrate in humble Sashtanga Namaskara, receive the warm divine blessings on both your eyes, and listen with devotion to the Mangalarati and Peace prayers.`
      },
      actionGuide: {
        kn: "ಆರತಿ ತಟ್ಟೆಯನ್ನು ಗಡಿಯಾರದ ದಿಕ್ಕಿನಲ್ಲಿ ಮೂರು ಬಾರಿ ತಿರುಗಿಸಿ, ತಲೆಬಾಗಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕರಿಸಿ, ಕೈಗಳಿಗೆ ಆರತಿಯ ಬೆಚ್ಚನೆಯ ಶಾಖವನ್ನು ಕಣ್ಣಿಗೆ ಮುಟ್ಟಿಸಿಕೊಳ್ಳಿ.",
        hi: "आरती की थाली को दक्षिणावर्त तीन बार घुमाएं, साष्टांग प्रणाम करें और आरती की पावन ज्योति को नयनों से स्पर्श करें।",
        te: "హారతి పళ్లెంను ప్రదక్షిణ దిశలో మూడుసార్లు తిప్పండి, సాష్టాంగ నమస్కారం చేసి హారతిని కళ్ళకు అద్దుకోండి.",
        ta: "ஆரத்தி தட்டை வலஞ்சுழியாக மூன்று முறை சுற்றி, சாஷ்டாங்க நமஸ்காரம் செய்து ஆரத்தியை கண்களில் ஒற்றிக் கொள்ளவும்.",
        en: "Wave the Arati tray 3 times clockwise, bow down in reverence, and gently touch the warm blessings to your eyes."
      },
      spiritualSignificance: {
        kn: "ದೈವಿಕ ತೇಜಸ್ಸಿನ ಸಂಪೂರ್ಣ ಆವಾಹನೆ ಮತ್ತು ತ್ರಿವಿಧ ಶಾಂತಿಯೊಂದಿಗೆ ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ.",
        hi: "दिव्य तेज का साक्षात्कार एवं त्रिविध शांति से असीम आत्मिक आनंद।",
        te: "దివ్య తేజస్సు ఆవాహన మరియు త్రివిధ శాంతులతో సంపూర్ణ ప్రశాంతత.",
        ta: "தெய்வீக பேரொளியின் தரிசனம் மற்றும் மன அமைதி.",
        en: "Infuses the soul with divine radiance, dissolving all stress and granting profound inner peace."
      },
      nextStepPrompt: {
        kn: "ನೀವು ಮಂಗಳಾರತಿ ಬೆಳಗಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಪೂಜೆ ಸಂಪನ್ನವಾದ ನಂತರ ದಯವಿಟ್ಟು 'ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
        hi: "आप जब तक मंगल आरती कर साष्टांग प्रणाम करते हैं, मैं प्रतीक्षा कर रहा हूँ। पूजा संपन्न होने पर कृपया 'पूजा संपन्न करें' बटन पर क्लिक करें।",
        te: "మీరు మంగళ హారతి ఇచ్చి సాష్టాంగ నమస్కారం చేసేవరకు నేను వేచి ఉంటాను. పూజ పూర్తయిన తర్వాత దయచేసి 'పూజ పూర్తి చేయండి' బటన్‌ను క్లిక్ చేయండి.",
        ta: "நீங்கள் மங்கள ஆரத்தி எடுத்து சாஷ்டாங்க நமஸ்காரம் செய்யும் வரை நான் காத்திருக்கிறேன். பூஜை நிறைவடைந்ததும் தயவுசெய்து 'பூஜையை நிறைவு செய்க' பொத்தானை அழுத்தவும்.",
        en: "I am waiting for you to wave the sacred Mangalarati and bow down in prayer. Once completed, please click the 'Complete Pooja' button."
      },
      priestNarrationL5: {
        kn: `ಈಗ ಆರತಿ ತಟ್ಟೆಯನ್ನು ಹಿಡಿದು ದೇವರ ಮುಂದೆ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಮೂರು ಬಾರಿ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ನಂತರ ದೇವರಿಗೆ ಶ್ರದ್ಧೆಯಿಂದ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ, ಆರತಿಯ ಬೆಚ್ಚನೆಯ ಪವಿತ್ರ ಜ್ಯೋತಿಯನ್ನು ಎರಡು ಕಣ್ಣುಗಳಿಗೆ ಮುಟ್ಟಿಸಿಕೊಳ್ಳಿ. ${BENEFIT_INTRO.kn} ದೈವಿಕ ತೇಜಸ್ಸಿನ ಸಂಪೂರ್ಣ ಆವಾಹನೆ ಮತ್ತು ತ್ರಿವಿಧ ಶಾಂತಿಯೊಂದಿಗೆ ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ. ಈಗ ಹೇಳುವ ಮಂಗಳಾರತಿ ಮತ್ತು ಶಾಂತಿ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಕೇಳಿ: ${step5MantraL5.kn} । ${DEFAULT_NEXT_STEP_PROMPTS.kn[5]}`,
        hi: `अब आरती की थाली लेकर भगवान के समक्ष दक्षिणावर्त तीन बार मंगल आरती घुमाएं। इसके बाद श्रद्धापूर्वक साष्टांग प्रणाम करें और आरती की पावन ज्योति को नयनों से स्पर्श करें। ${BENEFIT_INTRO.hi} दिव्य तेज का साक्षात्कार एवं त्रिविध शांति से असीम आत्मिक आनंद। अब मंगल आरती एवं शांति मंत्र को भक्तिभाव से सुनें: ${step5MantraL5.hi} । ${DEFAULT_NEXT_STEP_PROMPTS.hi[5]}`,
        te: `ఇప్పుడు హారతి పళ్లెం తీసుకొని స్వామి ఎదుట ప్రదక్షిణ దిశలో మూడుసార్లు మంగళ హారతి ఇవ్వండి. అనంతరం దేవునికి సాష్టాంగ నమస్కారం చేసి, హారతి వెలుగును కళ్ళకు అద్దుకోండి. ${BENEFIT_INTRO.te} దివ్య తేజస్సు ఆవాహన మరియు త్రివిధ శాంతులతో సంపూర్ణ ప్రశాంతత. ఇప్పుడు చెప్పే మంగళ హారతి మరియు శాంతి మంత్రాన్ని భక్తితో వినండి: ${step5MantraL5.te} । ${DEFAULT_NEXT_STEP_PROMPTS.te[5]}`,
        ta: `இப்போது ஆரத்தி தட்டை ஏந்தி இறைவன் முன் வலஞ்சுழியாக மூன்று முறை மங்கள ஆரத்தி காட்டவும். பின் சாஷ்டாங்கமாக வணங்கி, ஆரத்தியின் ஒளிக்கதிர்களை கண்களில் ஒற்றிக் கொள்ளுங்கள். ${BENEFIT_INTRO.ta} தெய்வீக பேரொளியின் தரிசனம் மற்றும் மன அமைதி. இப்போது ஒலிக்கும் ஆரத்தி மற்றும் சாந்தி மந்திரத்தை கேளுங்கள்: ${step5MantraL5.ta} । ${DEFAULT_NEXT_STEP_PROMPTS.ta[5]}`,
        en: `Now wave the sacred Mangalarati clockwise 3 times before the Lord. Prostrate in humble Sashtanga Namaskara, receive the warm divine blessings on both your eyes. ${BENEFIT_INTRO.en} Infuses the soul with divine radiance, dissolving all stress and granting profound inner peace. Listen with devotion to the Mangalarati and Peace prayers: ${step5MantraL5.en} | ${DEFAULT_NEXT_STEP_PROMPTS.en[5]}`
      }
    }
  ];
}
