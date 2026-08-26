/**
 * Generates RFC 5545 standard iCalendar (.ics) files and Google Calendar links
 * for 90-day daily Panchanga recommendations, mantras, and personalized priest blessings.
 * 
 * Includes 15-year Google Calendar visual design standards & Royal Vedic Framing:
 * - Color-coded day classification (Green = High Energy, Yellow = Balanced, Red = Caution)
 * - Energy level progress bar ([▓▓▓▓▓▓▓▓░░] 85%)
 * - Daily Rahu Kaala, Gulika Kaala, and Yamaganda timings
 * - Single-letter vibe focus tag (⚡ A, ⚖️ B, 🧘 S)
 * - Royal Double-Box ASCII Gold framing (╔═══ 🕉️ ═══╗)
 * - Gokarna Chief Priest Benediction & Daily Deity Mantra
 * - 1-Click interactive Sanctum Darshana Web Link
 * - Platform selector (Android Google Calendar vs Apple iOS iCal)
 */

import type { RhythmDay } from "../../core/DailyRhythmEngine";
import { computeLocalFallback90DayPanchanga, type DayPanchangaAiItem } from "./panchanga90DayAiEngine";
import { detectSpecialVrata } from "./specialVrataAlertEngine";
import { sunTimesSyncForBirth } from "../../core/birthSunTimes";
import { getUniversalBirthDetails } from "../../utils/universalDevoteeKundli";
import {
  BAND_LABEL_L5,
  COLOUR_L5,
  DIRECTION_L5,
  T,
  pick,
  type ColourKey,
  type DirectionKey,
  type GrahaKey,
  type SevaLang
} from "./sevaLocale";
import {
  bandGuide,
  colourName,
  dayExplanation,
  directionName,
  formatLongDate,
  getDailyActionableGuidance,
  getLocalizedPanditName,
  grahaName,
  nakshatraName,
  pakshaLabel,
  rashiName,
  tithiLabel,
  tithiOnlyLabel
} from "./sevaPresentation";
import {
  buildDeterministicPriestBenediction,
  getDevoteeSalutation
} from "./sevaPriestNarrativeEngine";
import { encodeDevoteeToken } from "../../utils/tokenCipher";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { normalizeDegree } from "../../core/AstroMath";

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Formats date into YYYYMMDD string. */
function formatYmdCompact(ymd: string): string {
  return ymd.replace(/-/g, "");
}

/** Map day lord name/number to 0..6 (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat) */
export function getDayLordIndex(dayLord: number | string): number {
  if (typeof dayLord === "number") return Math.abs(dayLord) % 7;
  const map: Record<string, number> = {
    sun: 0, sunday: 0, ravi: 0, surya: 0, mars: 2,
    mon: 1, monday: 1, soma: 1, chandra: 1,
    tue: 2, tuesday: 2, mangala: 2, kuja: 2,
    wed: 3, wednesday: 3, budha: 3,
    thu: 4, thursday: 4, guru: 4, vrhaspati: 4, jupiter: 4,
    fri: 5, friday: 5, shukra: 5, venus: 5,
    sat: 6, saturday: 6, shani: 6, saturn: 6
  };
  const key = String(dayLord).toLowerCase().trim();
  return map[key] ?? 0;
}

const DEITY_MANTRAS: Record<number, {
  deityL5: Record<SevaLang, string>;
  deity: string;
  mantra: string;
  colorKn: string;
  colorEn: string;
  numbers: string;
}> = {
  0: {
    deityL5: {
      kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ",
      hi: "भगवान सूर्यनारायण",
      te: "శ్రీ సూర్యనారాయణ స్వామి",
      ta: "ஸ்ரீ சூரியநாராயண சுவாமி",
      en: "Lord Surya Narayana"
    },
    deity: "Lord Surya Narayana",
    mantra: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ (Om Hram Hreem Hroum Sah Suryaya Namah)",
    colorKn: "ಕೆಂಪು / ಕೇಸರಿ (Ruby Red & Saffron)",
    colorEn: "Ruby Red & Saffron",
    numbers: "1 · 4 · 7"
  },
  1: {
    deityL5: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಚಂದ್ರ ಸ್ವಾಮಿ",
      hi: "भगवान महाबलेश्वर एवं चंद्र देव",
      te: "శ్రీ మహాబలేశ్వర & చంద్ర స్వామి",
      ta: "ஸ்ரீ மகாதேவர் & சந்திர பெருமான்",
      en: "Lord Mahabaleshwara & Chandra"
    },
    deity: "Lord Mahabaleshwara & Chandra",
    mantra: "ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ (Om Shram Shreem Shroum Sah Chandramase Namah)",
    colorKn: "ಶುಭ್ರ ಬಿಳಿ / ಮುತ್ತಿನ ಬಣ್ಣ (Pure White)",
    colorEn: "Pure White & Pearl",
    numbers: "2 · 7 · 9"
  },
  2: {
    deityL5: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ & ಮಂಗಳ ಸ್ವಾಮಿ",
      hi: "भगवान सुब्रमण्य एवं मंगल देव",
      te: "శ్రీ సుబ్రహ్మణ్య & మంగళ స్వామి",
      ta: "ஸ்ரீ சுப்ரமணியர் & செவ்வாய் பகவான்",
      en: "Lord Subramanya & Mangala"
    },
    deity: "Lord Subramanya & Mangala",
    mantra: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ (Om Kram Kreem Kroum Sah Bhaumaya Namah)",
    colorKn: "ಹವಳದ ಕೆಂಪು (Coral Red)",
    colorEn: "Coral Red",
    numbers: "9 · 3 · 6"
  },
  3: {
    deityL5: {
      kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಬುಧ ಸ್ವಾಮಿ",
      hi: "भगवान महाविष्णु एवं बुध देव",
      te: "శ్రీ మహావిష్ణు & బుధ స్వామి",
      ta: "ஸ்ரீ மகாவிஷ்ணு & புதன் பகவான்",
      en: "Lord Mahavishnu & Budha"
    },
    deity: "Lord Mahavishnu & Budha",
    mantra: "ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ (Om Bram Breem Broum Sah Budhaya Namah)",
    colorKn: "ಹಸಿರು (Emerald Green)",
    colorEn: "Emerald Green",
    numbers: "5 · 1 · 8"
  },
  4: {
    deityL5: {
      kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ & ಬೃಹಸ್ಪತಿ ಸ್ವಾಮಿ",
      hi: "भगवान गुरु राघवेंद्र एवं बृहस्पति",
      te: "శ్రీ గురు రాఘవేంద్ర & బృహస్పతి",
      ta: "ஸ்ரீ குரு ராகவேந்திரர் & பிருஹஸ்பதி",
      en: "Lord Guru Raghavendra & Brihaspati"
    },
    deity: "Lord Guru Raghavendra & Brihaspati",
    mantra: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ (Om Gram Greem Groum Sah Gurave Namah)",
    colorKn: "ಹಳದಿ / ಚಿನ್ನದ ಬಣ್ಣ (Golden Yellow)",
    colorEn: "Golden Yellow",
    numbers: "3 · 7 · 9"
  },
  5: {
    deityL5: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ & ಶುಕ್ರಾಚಾರ್ಯ ಸ್ವಾಮಿ",
      hi: "माता महालक्ष्मी एवं शुक्र देव",
      te: "శ్రీ మహాలక్ష్మి & శుక్రాచార్య",
      ta: "ஸ்ரீ மகாலக்ஷ்மி & சுக்கிர பகவான்",
      en: "Goddess Mahalakshmi & Shukra"
    },
    deity: "Goddess Mahalakshmi & Shukra",
    mantra: "ॐ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ (Om Dram Dreem Droum Sah Shukraya Namah)",
    colorKn: "ಗುಲಾಬಿ / ರೇಷ್ಮೆ ಶ್ವೇತ (Rose Pink)",
    colorEn: "Rose Pink & Silk White",
    numbers: "6 · 5 · 8"
  },
  6: {
    deityL5: {
      kn: "ಶ್ರೀ ಹನುಮಂತ & ಶನೈಶ್ಚರ ಸ್ವಾಮಿ",
      hi: "भगवान हनुमान एवं शनैश्चर देव",
      te: "శ్రీ హనుమాన్ & శనైశ్చరుడు",
      ta: "ஸ்ரீ அனுமன் & சனீஸ்வர பகவான்",
      en: "Lord Hanuman & Shanieshwara"
    },
    deity: "Lord Hanuman & Shanieshwara",
    mantra: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ (Om Pram Preem Proum Sah Shanaishcharaya Namah)",
    colorKn: "ಕಡು ನೀಲಿ (Royal Navy Blue)",
    colorEn: "Royal Navy Blue",
    numbers: "8 · 4 · 6"
  }
};

const TARA_NAMES_MAP: Record<number, Record<string, string>> = {
  1: { kn: "ಜನ್ಮ ತಾರಾ (ಆರೋಗ್ಯ ಗಮನಿಸಿ)", en: "Janma Tara (Care for Health)", hi: "जन्म तारा (स्वास्थ्य ध्यान रखें)", te: "జన్మ తార (ఆరోగ్యం శ్రద్ధ)", ta: "ஜன்ம தாரை (ஆரோக்கியம் கவனி)" },
  2: { kn: "ಸಂಪತ್ ತಾರಾ (ಧನ ಲಾಭ & ಯಶಸ್ಸು)", en: "Sampat Tara (Wealth & Success)", hi: "सम्पत तारा (धन लाभ और सफलता)", te: "సంపత్ తార (ధన ప్రాప్తి & విజయం)", ta: "சம்பத் தாரை (செல்வம் & வெற்றி)" },
  3: { kn: "ವಿಪತ್ ತಾರಾ (ವಿಶ್ರಾಂತಿ ಪಡೆದು ಸಾಧಾರಣ ಕೆಲಸ ಮಾಡಿ)", en: "Vipat Tara (Take rest & handle routine tasks)", hi: "विपत तारा (विश्राम लें व सामान्य कार्य करें)", te: "విపత్ తార (విశ్రాంతి తీసుకుని సాధారణ పనులు చేయండి)", ta: "விபத் தாரை (ஓய்வு எடுத்து சாதாரண பணி செய்க)" },
  4: { kn: "ಕ್ಷೇಮ ತಾರಾ (ಸುಖ & ರಕ್ಷಣೆ)", en: "Kshema Tara (Safety & Well-being)", hi: "क्षेम तारा (सुख व सुरक्षा)", te: "క్షేమ తార (క్షేమం & రక్షణ)", ta: "க்ஷேம தாரை (பாதுகாப்பு & நலம்)" },
  5: { kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ (ಶ್ರಮದಿಂದ ಕಾರ್ಯ)", en: "Pratyak Tara (Obstacle Clearance)", hi: "प्रत्यक तारा (परिश्रम से कार्य)", te: "ప్రత్యక్ తార (శ్రమతో కార్యం)", ta: "பிரத்யக் தாரை (முயற்சி தேவை)" },
  6: { kn: "ಸಾಧಕ ತಾರಾ (ಕಾರ್ಯಸಿದ್ಧಿ & ಜಯ)", en: "Sadhaka Tara (Success in Endeavors)", hi: "साधक तारा (कार्यसिद्धि व विजय)", te: "సాధక తార (కార్యసిద్ధి & విజయం)", ta: "சாதக தாரை (காரிய சித்தி)" },
  7: { kn: "ವಧ ತಾರಾ (ದಿನನಿತ್ಯದ ಸಾಮಾನ್ಯ ಕಾರ್ಯಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ)", en: "Vadha Tara (Focus on daily routine & light tasks)", hi: "वध तारा (दिनचर्या के सामान्य कार्यों को प्राथमिकता दें)", te: "వధ తార (సాధారణ రోజువారీ పనులకు ప్రాధాన్యత ఇవ్వండి)", ta: "வத தாரை (அன்றாட சாதாரண பணிக்கு முன்னுரிமை தருக)" },
  8: { kn: "ಮಿತ್ರ ತಾರಾ (ಸ್ನೇಹ & ಸಹಕಾರ)", en: "Mitra Tara (Friendly & Cooperative)", hi: "मित्र तारा (मित्रता व सहयोग)", te: "మిత్ర తార (స్నేహం & సహకారం)", ta: "மித்ர தாரை (நட்பு & ஒத்துழைப்பு)" },
  9: { kn: "ಪರಮ ಮಿತ್ರ ತಾರಾ (ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ)", en: "Parama Mitra Tara (Supreme Blessing)", hi: "परम मित्र तारा (परम सिद्धि व कृपा)", te: "పరమ మిత్ర తార (అత్యున్నత సిద్ధి)", ta: "பரம மித்ர தாரை (பரம சித்தி)" }
};

export function getCalendarLabels(lang: string) {
  const code = (lang || "en").slice(0, 2);

  if (code === "kn") {
    return {
      panchangaTitle: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
      kshetraTitle: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
      priestLabel: "ಮುಖ್ಯ ಅರ್ಚಕರು",
      devoteeLabel: "ಭಕ್ತರ ಹೆಸರು",
      locationLabel: "ಸ್ಥಳ",
      statusLabel: "ದಿನದ ಸ್ಥಿತಿ",
      futureTitle: "🔮 ಭವಿಷ್ಯದ ಪ್ರಮುಖ 4 ಮಾರ್ಗದರ್ಶನಗಳು:",
      vehicleLabel: "ವಾಹನ & ಆಸ್ತಿ",
      financeLabel: "ಧನ & ವ್ಯಾಪಾರ",
      mindLabel: "ಮನಃಸ್ಥಿತಿ & ಶಾಂತಿ",
      spiritualLabel: "ದೈವಿಕ ಕೃಪೆ",
      taraLabel: "ತಾರಾಬಲ",
      chandraLabel: "ಚಂದ್ರಬಲ",
      sunriseLabel: "ಸೂರ್ಯೋದಯ",
      sunsetLabel: "ಸೂರ್ಯಾಸ್ತ",
      luckyNumberLabel: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ",
      luckyColorLabel: "ಅದೃಷ್ಟ ಬಣ್ಣ",
      luckyDirectionLabel: "ಅದೃಷ್ಟ ದಿಕ್ಕು",
      kaalaHeading: "ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು",
      visitLabel: "🌐 ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ, ಜಾತಕ ಹಾಗೂ ಲೈವ್ ದರ್ಶನಕ್ಕಾಗಿ ಇಲ್ಲಿ ಭೇಟಿ ನೀಡಿ:",
      defaultDevotee: "ಭಕ್ತರು",
      tithiLabel: "ಪಕ್ಷ ಮತ್ತು ತಿಥಿ",
      tithiKeyLabel: "ತಿಥಿ",
      pakshaKeyLabel: "ಪಕ್ಷ",
      rashiLabel: "ರಾಶಿ",
      nakshatraLabel: "ನಕ್ಷತ್ರ",
      sunTimingsLabel: "ಸೂರ್ಯೋದಯ - ಸೂರ್ಯಾಸ್ತ",
      rahuLabel: "ರಾಹು ಕಾಲ",
      gulikaLabel: "ಗುಳಿಕ ಕಾಲ",
      yamagandaLabel: "ಯಮಗಂಡ ಕಾಲ",
      deityLabel: "ದಿನದ ದೇವತಾ ಆರಾಧನೆ",
      mantraLabel: "ದಿನದ ಮಂತ್ರ"
    };
  }

  if (code === "hi") {
    return {
      panchangaTitle: "बग्गोण पंचांग",
      kshetraTitle: "गोकर्ण क्षेत्र",
      priestLabel: "मुख्य अर्चक",
      devoteeLabel: "भक्त का नाम",
      locationLabel: "स्थान",
      statusLabel: "दिवस स्थिति",
      futureTitle: "🔮 भविष्य के मुख्य 4 मार्गदर्शन:",
      vehicleLabel: "वाहन व संपत्ति",
      financeLabel: "धन व व्यापार",
      mindLabel: "मनोस्थिति व शांति",
      spiritualLabel: "आध्यात्मिक कृपा",
      taraLabel: "ताराबल",
      chandraLabel: "चंद्रबल",
      sunriseLabel: "सूर्योदय",
      sunsetLabel: "सूर्यास्त",
      luckyNumberLabel: "लकी अंक",
      luckyColorLabel: "लकी रंग",
      luckyDirectionLabel: "लकी दिशा",
      kaalaHeading: "आज के काल समय",
      visitLabel: "🌐 संपूर्ण पंचांग, कुंडली व लाइव दर्शन हेतु यहाँ क्लिक करें:",
      defaultDevotee: "भक्त",
      tithiLabel: "पक्ष एवं तिथि",
      tithiKeyLabel: "तिथि",
      pakshaKeyLabel: "पक्ष",
      rashiLabel: "राशि",
      nakshatraLabel: "नक्षत्र",
      sunTimingsLabel: "सूर्योदय - सूर्यास्त",
      rahuLabel: "राहु काल",
      gulikaLabel: "गुलिक काल",
      yamagandaLabel: "यमगंड काल",
      deityLabel: "दैनिक देवता आराधना",
      mantraLabel: "दैनिक मंत्र"
    };
  }

  if (code === "te") {
    return {
      panchangaTitle: "బగ్గోణ పంచాంగం",
      kshetraTitle: "గోకర్ణ క్షేత్రం",
      priestLabel: "ముఖ్య అర్చకులు",
      devoteeLabel: "భక్తుని పేరు",
      locationLabel: "స్థలం",
      statusLabel: "రోజు స్థితి",
      futureTitle: "🔮 భవిష్యత్తు ముఖ్య 4 మార్గదర్శకాలు:",
      vehicleLabel: "వాహనం & ఆస్తి",
      financeLabel: "ధనం & వ్యాపారం",
      mindLabel: "మానసిక ప్రశాంతత",
      spiritualLabel: "దైవిక అనుగ్రహం",
      taraLabel: "తారాబలం",
      chandraLabel: "చంద్రబలం",
      sunriseLabel: "సూర్యోదయం",
      sunsetLabel: "సూర్యాస్తమయం",
      luckyNumberLabel: "లక్కీ సంఖ్య",
      luckyColorLabel: "లక్కీ రంగు",
      luckyDirectionLabel: "లక్కీ దిక్కు",
      kaalaHeading: "నేటి కాల సమయాలు",
      visitLabel: "🌐 సంపూర్ణ పంచాంగం, జాతకం & లైవ్ దర్శనం కొరకు ఇక్కడ క్లిక్ చేయండి:",
      defaultDevotee: "భక్తులు",
      tithiLabel: "పక్షం & తిథి",
      tithiKeyLabel: "తిథి",
      pakshaKeyLabel: "పక్షం",
      rashiLabel: "రాశి",
      nakshatraLabel: "నక్షత్రం",
      sunTimingsLabel: "సూర్యోదయం - సూర్యాస్తమయం",
      rahuLabel: "రాహు కాలం",
      gulikaLabel: "గుళిక కాలం",
      yamagandaLabel: "యమగండ కాలం",
      deityLabel: "దిన దైవ ఆరాధన",
      mantraLabel: "దిన ಮಂತ್ರಂ"
    };
  }

  if (code === "ta") {
    return {
      panchangaTitle: "பக்கோண பஞ்சாங்கம்",
      kshetraTitle: "கோகர்ண க்ஷேத்திரம்",
      priestLabel: "முதன்மை அர்ச்சகர்",
      devoteeLabel: "பக்தர் பெயர்",
      locationLabel: "இடம்",
      statusLabel: "நாள் நிலை",
      futureTitle: "🔮 எதிர்கால முக்கிய 4 வழிகாட்டுதல்கள்:",
      vehicleLabel: "வாகனம் & சொத்து",
      financeLabel: "தனம் & வியாபாரம்",
      mindLabel: "மன அமைதி & நலம்",
      spiritualLabel: "ஆன்மீக அருள்",
      taraLabel: "தாராபலம்",
      chandraLabel: "சந்திரபலம்",
      sunriseLabel: "சூரியோதயம்",
      sunsetLabel: "சூரிய அஸ்தமனம்",
      luckyNumberLabel: "அதிர்ஷ்ட எண்",
      luckyColorLabel: "அதிர்ஷ்ட நிறம்",
      luckyDirectionLabel: "அதிர்ஷ்ட திசை",
      kaalaHeading: "இன்றைய கால நேரங்கள்",
      visitLabel: "🌐 முழுமையான பஞ்சாங்கம், ஜாதகம் & லைவ் தரிசனத்திற்கு இங்கே கிளிக் செய்க:",
      defaultDevotee: "பக்தர்",
      tithiLabel: "பக்ஷம் & திதி",
      tithiKeyLabel: "திதி",
      pakshaKeyLabel: "பக்ஷம்",
      rashiLabel: "ராசி",
      nakshatraLabel: "நக்ஷத்திரம்",
      sunTimingsLabel: "சூரியோதயம் - அஸ்தமனம்",
      rahuLabel: "ராகு காலம்",
      gulikaLabel: "குளிகை காலம்",
      yamagandaLabel: "யமகண்ட காலம்",
      deityLabel: "தினசரி தெய்வ வழிபாடு",
      mantraLabel: "தினசரி மந்திரம்"
    };
  }

  // English fallback
  return {
    panchangaTitle: "Baggona Panchanga",
    kshetraTitle: "Gokarna Kshetra",
    priestLabel: "Chief Priest",
    devoteeLabel: "Devotee Name",
    locationLabel: "Location",
    statusLabel: "Day Status",
    futureTitle: "🔮 Key Future Actionable Focus Points:",
    vehicleLabel: "Vehicle & Asset",
    financeLabel: "Finance & Business",
    mindLabel: "Mind & Peace",
    spiritualLabel: "Spiritual Harmony",
    taraLabel: "Tara Bala",
    chandraLabel: "Chandra Bala",
    sunriseLabel: "Sunrise",
    sunsetLabel: "Sunset",
    luckyNumberLabel: "Lucky Numbers",
    luckyColorLabel: "Lucky Color",
    luckyDirectionLabel: "Lucky Direction",
    kaalaHeading: "Daily Kaala Timings",
    visitLabel: "🌐 Click here for Full Panchanga, Kundali & Live Darshana:",
    defaultDevotee: "Devotee",
    tithiLabel: "Paksha & Tithi",
    tithiKeyLabel: "Tithi",
    pakshaKeyLabel: "Paksha",
    rashiLabel: "Rashi (Moon Sign)",
    nakshatraLabel: "Nakshatra",
    sunTimingsLabel: "Sunrise & Sunset",
    rahuLabel: "Rahu Kaala",
    gulikaLabel: "Gulika Kaala",
    yamagandaLabel: "Yamaganda Kaala",
    deityLabel: "Daily Deity Worship",
    mantraLabel: "Daily Mantra"
  };
}

export function getTaraBalaInfo(taraNum: number, lang: string): string {
  const code = (lang || "en").slice(0, 2);
  const data = TARA_NAMES_MAP[taraNum] || TARA_NAMES_MAP[2]!;
  return data[code] || data.kn || data.en;
}

export function getChandraBalaInfo(house: number, isChandrashtama: boolean, lang: string): string {
  const code = (lang || "en").slice(0, 2);
  if (isChandrashtama) {
    if (code === "kn") return "8ನೇ ಮನೆ - 🔴 ಚಂದ್ರಾಷ್ಟಮ (ವಿಶ್ರಾಂತಿ & ದೈವ ಪ್ರಾರ್ಥನೆಗೆ ಸೂಕ್ತ)";
    if (code === "hi") return "8वां भाव - 🔴 चंद्राष्टम (विश्राम व देव प्रार्थना हेतु उत्तम)";
    if (code === "te") return "8వ ఇల్లు - 🔴 చంద్రాష్టమం (విశ్రాంతి & దైవ ప్రార్థనకు అనుకూలం)";
    if (code === "ta") return "8ஆம் இடம் - 🔴 சந்திராஷ்டமம் (ஓய்வு & இறை பிரார்த்தனைக்கு நல்லது)";
    return "8th House - 🔴 CHANDRASHTAMA (Ideal for rest & prayer)";
  }
  if (house === 11) {
    if (code === "kn") return "11ನೇ ಮನೆ - 🟢 ಲಾಭ ಸ್ಥಾನ (ಅತ್ಯುತ್ತಮ ಧನ ಲಾಭ)";
    if (code === "hi") return "11वां भाव - 🟢 लाभ स्थान (उत्तम धन लाभ)";
    if (code === "te") return "11వ ఇల్లు - 🟢 లాభ స్థానం (అత్యుత్తమ ధన ప్రాప్తి)";
    if (code === "ta") return "11ஆம் இடம் - 🟢 லாப ஸ்தானம் (தன லாபம்)";
    return "11th House - 🟢 LABHA STHANA (High Gains)";
  }
  if (house === 9 || house === 10 || house === 3 || house === 6) {
    if (code === "kn") return `${house}ನೇ ಮನೆ - 🟢 ಶುಭ ಚಂದ್ರಬಲ`;
    if (code === "hi") return `${house}वां भाव - 🟢 शुभ चंद्रबल`;
    if (code === "te") return `${house}వ ఇల్లు - 🟢 శుభ చంద్రబలం`;
    if (code === "ta") return `${house}ஆம் இடம் - 🟢 சுப சந்திரபலம்`;
    return `${house}th House - 🟢 Auspicious Chandra Bala`;
  }
  if (code === "kn") return `${house}ನೇ ಮನೆ - 🟡 ಸಾಮಾನ್ಯ ಚಂದ್ರಬಲ`;
  if (code === "hi") return `${house}वां भाव - 🟡 सामान्य चंद्रबल`;
  if (code === "te") return `${house}వ ಇల్లు - 🟡 సాధారణ చంద్రబలం`;
  if (code === "ta") return `${house}ஆம் இடம் - 🟡 சாதாரண சந்திரபலம்`;
  return `${house}th House - 🟡 Moderate Chandra Bala`;
}

/** Rahu Kaala, Gulika Kaala, and Yamaganda exact timings by location and day lord octant */
export function getDailyKaalaTimings(
  dayLord: number | string,
  lang: string,
  dateStr?: string,
  lat?: number,
  lng?: number,
  pincode?: string
) {
  const code = (lang || "en").slice(0, 2);

  // Derive exact weekday index (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat) directly from dateStr in UTC
  let idx = getDayLordIndex(dayLord);
  if (dateStr) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
      if (!isNaN(utcDate.getTime())) {
        idx = utcDate.getUTCDay();
      }
    }
  }

  let sunriseStr = "06:00 AM";
  let sunsetStr = "06:30 PM";
  let rahuStr = "";
  let gulikaStr = "";
  let yamaStr = "";

  if (dateStr && typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    try {
      const parts = dateStr.split("-").map(Number);
      const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
      const sun = sunTimesSyncForBirth(dateObj, lat, lng, pincode || "");

      const formatTime = (d: Date) => {
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const h12 = hours % 12 || 12;
        return `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
      };

      sunriseStr = formatTime(sun.sunrise);
      sunsetStr = formatTime(sun.sunset);

      const sunriseMs = sun.sunrise.getTime();
      const sunsetMs = sun.sunset.getTime();
      const daySpanMs = Math.max(sunsetMs - sunriseMs, 3600000);
      const octantMs = daySpanMs / 8;

      const rahuOctantMap = [8, 2, 7, 5, 6, 4, 3];
      const gulikaOctantMap = [7, 6, 5, 4, 3, 2, 1];
      const yamaOctantMap = [5, 4, 3, 2, 1, 7, 6];

      const getWindowStr = (octantPeriod: number) => {
        const start = new Date(sunriseMs + (octantPeriod - 1) * octantMs);
        const end = new Date(sunriseMs + octantPeriod * octantMs);
        return `${formatTime(start)} – ${formatTime(end)}`;
      };

      rahuStr = getWindowStr(rahuOctantMap[idx] ?? 8);
      gulikaStr = getWindowStr(gulikaOctantMap[idx] ?? 7);
      yamaStr = getWindowStr(yamaOctantMap[idx] ?? 5);
    } catch {
      /* fallback to standard Kolkata offsets */
    }
  }

  if (!rahuStr) {
    const timings = [
      { rahu: "04:30 PM – 06:00 PM", gulika: "03:00 PM – 04:30 PM", yama: "12:00 PM – 01:30 PM" },
      { rahu: "07:30 AM – 09:00 AM", gulika: "01:30 PM – 03:00 PM", yama: "10:30 AM – 12:00 PM" },
      { rahu: "03:00 PM – 04:30 PM", gulika: "12:00 PM – 01:30 PM", yama: "09:00 AM – 10:30 AM" },
      { rahu: "12:00 PM – 01:30 PM", gulika: "10:30 AM – 12:00 PM", yama: "07:30 AM – 09:00 AM" },
      { rahu: "01:30 PM – 03:00 PM", gulika: "09:00 AM – 10:30 AM", yama: "06:00 AM – 07:30 AM" },
      { rahu: "10:30 AM – 12:00 PM", gulika: "07:30 AM – 09:00 AM", yama: "03:00 PM – 04:30 PM" },
      { rahu: "09:00 AM – 10:30 AM", gulika: "06:00 AM – 07:30 AM", yama: "01:30 PM – 03:00 PM" }
    ];
    const t = timings[idx] || timings[0];
    rahuStr = t.rahu;
    gulikaStr = t.gulika;
    yamaStr = t.yama;
  }

  const rahuSuffix = code === "kn" ? "(ಸಾಮಾನ್ಯ ಕೆಲಸ ಮಾಡಿ)"
                   : code === "hi" ? "(सामान्य कार्य करें)"
                   : code === "te" ? "(సాధారణ పనులు చేయండి)"
                   : code === "ta" ? "(சாதாரண பணி செய்க)"
                   : "(Focus on Routine Work)";
  const gulikaSuffix = code === "kn" ? "(ಶುಭ ಕಾರ್ಯಕ್ಕೆ ಉತ್ತಮ)"
                     : code === "hi" ? "(शुभ कार्य हेतु उत्तम)"
                     : code === "te" ? "(శుభ కార్యాలకు అనుకూలం)"
                     : code === "ta" ? "(சுப காரியத்திற்கு நல்லது)"
                     : "(Favorable for Action)";
  const yamaSuffix = code === "kn" ? "(ಪ್ರಾರ್ಥನೆಗೆ ಸೂಕ್ತ)"
                   : code === "hi" ? "(प्रार्थना व ध्यान हेतु श्रेष्ठ)"
                   : code === "te" ? "(ప్రార్థనకు శ్రేష్ఠం)"
                   : code === "ta" ? "(பிரார்த்தனைக்கு உகந்தது)"
                   : "(Good for Prayer)";

  return {
    sunrise: sunriseStr,
    sunset: sunsetStr,
    rahu: `${rahuStr} ${rahuSuffix}`,
    gulika: `${gulikaStr} ${gulikaSuffix}`,
    yamaganda: `${yamaStr} ${yamaSuffix}`
  };
}

/**
 * Single deterministic calculation engine shared between .ics calendar generation and DailyDarshanaPage web PWA.
 * Guarantees that energy score, vibe badge, Tara Bala, and Chandra Bala are 100% identical on both screens and calendar events.
 */
export function calculateDeterministicRhythmDay(
  targetDateStr: string,
  birthNakIdx: number,
  birthRashiIdx: number,
  startDateStr?: string
): RhythmDay {
  const parts = targetDateStr.split("-").map(Number);
  const year = parts[0] || 2026;
  const monthIndex = (parts[1] || 1) - 1;
  const dayOfMonth = parts[2] || 1;

  // Exact UTC noon anchor to guarantee ZERO timezone date shifts or weekday mismatches
  const noonUtc = new Date(Date.UTC(year, monthIndex, dayOfMonth, 12, 0, 0));
  const ymd = targetDateStr.trim().slice(0, 10);
  const weekday = noonUtc.getUTCDay();

  // Drik Ganita Ephemeris longitudes at 06:00 IST (00:30 UTC) for accurate daily Panchanga
  const targetUtc = new Date(Date.UTC(year, monthIndex, dayOfMonth, 0, 30));
  const longs = siderealLongitudes(targetUtc, "lahiri");
  const moonLong = longs.moon;
  const sunLong = longs.sun;

  // Transit Nakshatra & Rashi from Moon sidereal longitude
  const transitNak = Math.floor(moonLong / (360 / 27)) % 27;
  const transitRashi = Math.floor(moonLong / 30) % 12;

  // Elongation: Moon - Sun
  const elongation = normalizeDegree(moonLong - sunLong);
  const tithiNumber = Math.floor(elongation / 12) + 1; // 1 to 30
  const paksha: "shukla" | "krishna" = tithiNumber <= 15 ? "shukla" : "krishna";
  const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15; // 1 to 15

  const isAmavasya = tithiNumber === 30;
  const isPurnima = tithiNumber === 15;
  const isEkadashi = tithiInPaksha === 11;
  const isPradosha = tithiInPaksha === 13;
  const isSankashti = paksha === "krishna" && tithiInPaksha === 4;

  const taraVal = (((transitNak - birthNakIdx + 27) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  const isTaraFav = [2, 4, 6, 8, 9].includes(taraVal);
  const isDifficultTara = [3, 5, 7].includes(taraVal);

  const houseOffset = ((transitRashi - birthRashiIdx + 12) % 12) + 1;
  const isChandraFav = [1, 3, 6, 7, 10, 11].includes(houseOffset);
  const isChandrashtamaDay = houseOffset === 8;

  const baseScore = (isTaraFav ? 45 : isDifficultTara ? 15 : 25) + (isChandraFav ? 40 : 15) + (isChandrashtamaDay ? -25 : 5);
  const scoreVal = Math.max(15, Math.min(98, baseScore));
  const bandType: "high" | "steady" | "rest" = (isChandrashtamaDay || isDifficultTara || scoreVal < 50) ? "rest" : (isTaraFav && isChandraFav && scoreVal >= 75) ? "high" : "steady";

  const dayLordsMap: Record<number, GrahaKey> = {
    0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury", 4: "Jupiter", 5: "Venus", 6: "Saturn"
  };
  const dayLord = dayLordsMap[weekday] || "Sun";

  // Dynamic 90-day calculation for Lucky Parameters based on Day Lord, Transit Nakshatra & Birth Nakshatra/Rashi
  const seedNum = (((transitNak + birthNakIdx + weekday) % 9) + 1);
  const n1 = seedNum;
  const n2 = ((seedNum + 2) % 9) || 9;
  const n3 = ((seedNum + 5) % 9) || 9;
  const luckyNumbers = Array.from(new Set([n1, n2, n3]));

  const colorKeys: ColourKey[] = ["white", "red", "green", "yellow", "orange", "pink", "darkblue"];
  const luckyColour = colorKeys[(weekday + (isTaraFav ? 1 : 0) + (isChandraFav ? 2 : 0)) % 7] || "yellow";

  const dirKeys: DirectionKey[] = ["east", "northeast", "north", "northwest", "west", "southwest", "south", "southeast"];
  const luckyDirection = dirKeys[(weekday + transitNak + birthRashiIdx) % 8] || "east";

  return {
    ymd,
    weekday,
    dayOfMonth,
    monthIndex,
    year,
    moonNakshatraIndex: transitNak,
    moonRashiIndex: transitRashi,
    tithiNumber,
    tithiInPaksha,
    paksha,
    tithiGroup: "nanda",
    isAmavasya,
    isPurnima,
    dayLord,
    bhuktiLord: "guru",
    tara: {
      tara: taraVal,
      count: taraVal,
      isFavourable: isTaraFav,
      isDifficult: !isTaraFav,
      score: isTaraFav ? 85 : 35
    } as any,
    chandra: {
      house: houseOffset,
      isChandrashtama: isChandrashtamaDay,
      isFavourable: isChandraFav,
      score: isChandraFav ? 85 : 40
    } as any,
    band: bandType,
    energyScore: scoreVal,
    arthaScore: Math.round(scoreVal * 0.9),
    isChandrashtama: isChandrashtamaDay,
    isMoneyDay: isTaraFav && isChandraFav,
    isJanmaNakshatraDay: transitNak === birthNakIdx,
    isEkadashi,
    isPradosha,
    isSankashti,
    isPoojaDay: isChandrashtamaDay || isTaraFav || weekday === 2 || weekday === 5,
    luckyNumbers,
    luckyColour,
    luckyDirection
  } as unknown as RhythmDay;
}

/** Action suitability level, day color classification, progress bar & single-letter vibe tag */
export function getEnergyMeterAndVibe(day: RhythmDay, lang: string) {
  const code = (lang || "en").slice(0, 2);
  const band = String(day.band || "").toLowerCase();
  const score = day.energyScore ?? (band === "high" ? 85 : (band === "steady" || band === "medium" || band === "moderate") ? 65 : 35);
  // STRICT RULE: Caution (Red 🔴) is ONLY triggered if score < 50 OR Chandrashtama OR Amavasya.
  // 65% energy score is ALWAYS Yellow 🟡 (Balanced Routine Day), NEVER Red 🔴!
  const isCaution =
    day.isChandrashtama ||
    day.isAmavasya ||
    band === "rest" ||
    score < 50;

  if (isCaution) {
    const badgeText = code === "kn" ? "🔴 ಇಂದು ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಸಾಧಾರಣ ಕರ್ತವ್ಯದ ದಿನ (ಸಾಮಾನ್ಯ ಕೆಲಸ ನಿರ್ವಹಿಸಿ)"
                    : code === "hi" ? "🔴 आज विश्राम एवं सामान्य कार्यों का दिन (साधारण कार्य करें)"
                    : code === "te" ? "🔴 నేడు విశ్రాంతి & సాధారణ పనుల దినం (సాధారణ పనులు చేయండి)"
                    : code === "ta" ? "🔴 இன்று ஓய்வு & சாதாரண பணிகளுக்கான நாள் (வழக்கமான பணி செய்க)"
                    : "🔴 REST & ROUTINE DAY (Focus on normal routine tasks & rest)";
    const vibeTag = code === "kn" ? "ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಸಾಧಾರಣ ಕರ್ತವ್ಯದ ದಿನ"
                  : code === "hi" ? "विश्राम एवं सामान्य दिनचर्या का दिन"
                  : code === "te" ? "విశ్రాంతి & సాధారణ దినచర్య దినం"
                  : code === "ta" ? "ஓய்வு & சாதாரண பணி நாள்"
                  : "Restful Focus & Routine Tasks Day";
    return {
      badgeEmoji: "🔴",
      badgeText,
      meter: `[▓▓▓░░░░░░░] ${score}%`,
      vibeTag,
      googleColorId: "11",
      icalColor: "crimson"
    };
  }

  if (band === "high" || score >= 70) {
    const badgeText = code === "kn" ? "🟢 ಶುಭ ಕಾರ್ಯ, ನೂತನ ವಾಹನ ಹಾಗೂ ಧನ ಅಭಿವೃದ್ಧಿಗೆ ಪ್ರಶಸ್ತ"
                    : code === "hi" ? "🟢 नए कार्य, वाहन क्रय एवं धन वृद्धि हेतु शुभ"
                    : code === "te" ? "🟢 నూతన కార్యం, వాహన కొనుగోలు & ధన లాభానికి శుభప్రదం"
                    : code === "ta" ? "🟢 புதிய காரியம், வாகனம் & தன லாபத்திற்கு உகந்தது"
                    : "🟢 AUSPICIOUS FOR NEW WORK, VEHICLES & PURCHASES";
    const vibeTag = code === "kn" ? "ಉನ್ನತ ಶಕ್ತಿ ಹಾಗೂ ನವಾರಂಭ ಪ್ರಶಸ್ತ ದಿನ"
                  : code === "hi" ? "उच्च ऊर्जा एवं नए कार्य हेतु शुभ दिन"
                  : code === "te" ? "అత్యుత్తమ శక్తి & నూతన కార్యాల రోజు"
                  : code === "ta" ? "உயர் ஆற்றல் & புதிய தொடக்க நாள்"
                  : "High Energy & Auspicious Growth Day";
    return {
      badgeEmoji: "🟢",
      badgeText,
      meter: `[▓▓▓▓▓▓▓▓░░] ${score}%`,
      vibeTag,
      googleColorId: "10",
      icalColor: "green"
    };
  }

  const badgeText = code === "kn" ? "🟡 ನಿತ್ಯ ಕರ್ಮ ಹಾಗೂ ಸಾಮಾನ್ಯ ಕಾರ್ಯಕ್ಕೆ ಸೂಕ್ತ"
                   : code === "hi" ? "🟡 दैनिक कार्य एवं सामान्य गतिविधियों हेतु उपयुक्त"
                  : code === "te" ? "🟡 దైనిక కార్యం & సాధారణ పనులకు అనుకూలం"
                  : code === "ta" ? "🟡 அன்றாட வேலைகள் & சாதாரண பணிக்கு ஏற்றது"
                  : "🟡 SUITABLE FOR ROUTINE WORK & PLANNED TASKS";
  const vibeTag = code === "kn" ? "ಸಮತೋಲಿತ ಕರ್ತವ್ಯ ನಿರ್ವಹಣೆಯ ದಿನ"
                : code === "hi" ? "संतुलित दिनचर्या एवं कार्य दिवस"
                : code === "te" ? "సమతుల్య దినచర్య రోజు"
                : code === "ta" ? "சமநிலை & வழக்கமான பணி நாள்"
                : "Balanced Routine & Steady Work Day";
  return {
    badgeEmoji: "🟡",
    badgeText,
    meter: `[▓▓▓▓▓░░░░░] ${score}%`,
    vibeTag,
    googleColorId: "5",
    icalColor: "gold"
  };
}

export interface CalendarGeneratorOptions {
  days: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime?: string;
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  birthNakshatraIndex?: number;
  birthRashiIndex?: number;
  dob?: string;
  tob?: string;
  aiPanchangaMap?: Record<string, DayPanchangaAiItem>;
}

export function getSafeProductionOrigin(webAppBaseUrl?: string): string {
  if (webAppBaseUrl && webAppBaseUrl.trim().length > 0 && webAppBaseUrl.startsWith("http")) {
    // If explicitly provided a localhost URL, fallback to production domain for mobile QR scannability
    if (webAppBaseUrl.includes("localhost") || webAppBaseUrl.includes("127.0.0.1")) {
      return "https://baggona-panchanga-astrology.vercel.app";
    }
    return webAppBaseUrl.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "https://baggona-panchanga-astrology.vercel.app";
    }
    return window.location.origin;
  }
  return "https://baggona-panchanga-astrology.vercel.app";
}

export function formatPanditGreeting(panditName: string, lang: string): string {
  const code = (lang || "en").slice(0, 2);
  const localized = getLocalizedPanditName(panditName, lang) || panditName;
  if (!panditName || panditName.trim().length === 0) {
    if (code === "kn") return "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಿಂದ ನಮಸ್ಕಾರಗಳು,";
    if (code === "hi") return "गोकर्ण महाबलेश्वर क्षेत्र से सादर प्रणाम,";
    if (code === "te") return "గోకర్ణ మహాబలేశ్వర క్షేత్రం నుండి నమస్కారాలు,";
    if (code === "ta") return "கோகர்ண மகாபலேஸ்வரர் ஆலயத்தின் அன்பான வணக்கங்கள்,";
    return "With warm greetings from Gokarna Kshetra,";
  }

  if (code === "kn") return `${localized} ಅವರಿಂದ ನಮಸ್ಕಾರಗಳು,`;
  if (code === "hi") return `${localized} जी की ओर से सादर प्रणाम,`;
  if (code === "te") return `${localized} గారి నుండి నమస్కారాలు,`;
  if (code === "ta") return `${localized} அவர்களின் அன்பு வணக்கங்கள்,`;
  return `With warm greetings from ${localized},`;
}

export interface CalendarPayloadValidationResult {
  isValid: boolean;
  missingDayCount: number;
  reason?: string;
}

/**
 * Mandatory 90-Day Calendar Zero-Blank Validation Guard.
 * Inspects all 90 days of calendar payload to ensure 0 empty or error fields.
 */
export function validate90DayCalendarPayload(options: CalendarGeneratorOptions): CalendarPayloadValidationResult {
  const { days, aiPanchangaMap } = options;

  if (!days || days.length === 0) {
    return {
      isValid: false,
      missingDayCount: 90,
      reason: "Days payload array is empty"
    };
  }

  let emptyCount = 0;
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (!day || !day.ymd) {
      emptyCount++;
      continue;
    }

    const aiEntry = aiPanchangaMap ? aiPanchangaMap[day.ymd] : undefined;
    const paksha = aiEntry?.paksha || (day as any).pakshaStr || (day as any).paksha;
    const tithi = aiEntry?.tithi || (day as any).tithiFullStr || (day as any).tithi;
    const nakshatra = aiEntry?.nakshatra || (day as any).nakName || (day as any).nakshatra;
    const suryodaya = aiEntry?.suryodaya || (day as any).sunrise;
    const suryasta = aiEntry?.suryasta || (day as any).sunset;

    if (
      !paksha || String(paksha).trim().length === 0 ||
      !tithi || String(tithi).trim().length === 0 ||
      !nakshatra || String(nakshatra).trim().length === 0 ||
      !suryodaya || String(suryodaya).trim().length === 0 ||
      !suryasta || String(suryasta).trim().length === 0
    ) {
      emptyCount++;
    }
  }

  if (emptyCount > 0) {
    return {
      isValid: false,
      missingDayCount: emptyCount,
      reason: `${emptyCount} of ${days.length} days contain empty or missing Panchanga attributes`
    };
  }

  return { isValid: true, missingDayCount: 0 };
}

export function generateSevaICalendarString(options: CalendarGeneratorOptions): string {
  // Execute mandatory 90-Day Zero-Blank Validation Guard
  const validation = validate90DayCalendarPayload(options);
  if (!validation.isValid) {
    console.warn("⚠️ 90-Day Calendar Zero-Blank Guard auto-healing missing fields:", validation.reason);
    const startDateStr = options.days && options.days.length > 0 ? options.days[0].ymd : new Date().toISOString().slice(0, 10);
    const fallbackMap = computeLocalFallback90DayPanchanga(
      options.pincode || "581326",
      options.locationName || "Gokarna",
      startDateStr,
      options.lang || "kn",
      options.lat || 14.54,
      options.lng || 74.31
    );
    options.aiPanchangaMap = { ...fallbackMap, ...options.aiPanchangaMap };
  }

  const {
    days,
    lang,
    panditName,
    notificationTime = "08:00",
    personName,
    webAppBaseUrl,
    pincode = "581326",
    lat = 14.54,
    lng = 74.31,
    locationName = "Gokarna",
    birthNakshatraIndex,
    birthRashiIndex,
    dob,
    tob,
    aiPanchangaMap
  } = options;

  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";
  const labels = getCalendarLabels(lang);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Astrology//NONSGML Seva Calendar v2.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(personName ? `${labels.panchangaTitle} - ${personName}` : labels.panchangaTitle)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE"
  ];

  const nowIso = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const origin = getSafeProductionOrigin(webAppBaseUrl);

  const startDateStr = days[0]?.ymd || new Date().toISOString().slice(0, 10);
  const birthNakIdx = birthNakshatraIndex ?? (days[0] as any)?.janmaNakshatraIndex ?? days[0]?.moonNakshatraIndex ?? 12;
  const birthRashiIdx = birthRashiIndex ?? (days[0] as any)?.janmaRashiIndex ?? days[0]?.moonRashiIndex ?? 5;
  const localizedPandit = getLocalizedPanditName(panditName, lang);
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : labels.defaultDevotee;

  const resolvedBirth = getUniversalBirthDetails({
    dob,
    tob,
    name: devoteeDisplayName,
    nakshatraIndex: birthNakIdx,
    rashiIndex: birthRashiIdx
  });
  const resolvedDob = resolvedBirth.dob;
  const resolvedTob = resolvedBirth.tob;

  const baseToken = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: birthNakIdx,
    r: birthRashiIdx,
    p: localizedPandit,
    d: startDateStr,
    l: lang,
    tm: notificationTime,
    pc: pincode,
    lt: lat,
    lg: lng,
    loc: locationName,
    dob: resolvedDob,
    tob: resolvedTob
  });
  const sanitizedDevoteeToken = baseToken.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  days.forEach((day, idx) => {
    const ymdCompact = formatYmdCompact(day.ymd);
    const dayUid = `baggona-day-${ymdCompact}-${sanitizedDevoteeToken}@baggona.app`;
    const dtStart = `${ymdCompact}T${hh}${mm}00`;
    
    const endMinutes = (parseInt(mm, 10) + 30) % 60;
    const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
    const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

    const vibe = getEnergyMeterAndVibe(day, lang);

    const dayToken = encodeDevoteeToken({
      n: devoteeDisplayName,
      nk: birthNakIdx,
      r: birthRashiIdx,
      p: localizedPandit,
      d: day.ymd,
      l: lang,
      tm: notificationTime,
      pc: pincode,
      lt: lat,
      lg: lng,
      loc: locationName,
      dob: resolvedDob,
      tob: resolvedTob
    });
    const sanctumUrl = `${origin}/daily?token=${dayToken}`;

    const aiItem = aiPanchangaMap?.[day.ymd];
    const pakshaStr = aiItem?.paksha || pakshaLabel(day, lang);
    const tithiOnlyStr = aiItem?.tithi || tithiOnlyLabel(day, lang);
    const tithiFullStr = aiItem ? `${aiItem.paksha ? aiItem.paksha + " - " : ""}${aiItem.tithi}` : tithiLabel(day, lang);
    const nakName = aiItem?.nakshatra || nakshatraName(day.moonNakshatraIndex, lang as SevaLang);

    // Detect Special Vrata (Amavasya, Ekadashi, Sankashti, Purnima, Festivals)
    const vrata = detectSpecialVrata(day.ymd, lang);
    const summaryPrefix = vrata.isSpecial
      ? (vrata.category === "FESTIVAL" ? "🚩 " : "🕉️ ")
      : "";
    const summaryStr = `${summaryPrefix}${vibe.badgeEmoji} ${pakshaStr} - ${tithiOnlyStr} - ${localizedPandit} - ${labels.panchangaTitle}`;

    const kaalaRaw = getDailyKaalaTimings(day.dayLord, lang, day.ymd, lat, lng, pincode);
    const kaala = {
      sunrise: aiItem?.suryodaya || kaalaRaw.sunrise,
      sunset: aiItem?.suryasta || kaalaRaw.sunset,
      rahu: aiItem?.rahuKaala || kaalaRaw.rahu,
      gulika: aiItem?.gulikaKaala || kaalaRaw.gulika,
      yamaganda: aiItem?.yamagandaKaala || kaalaRaw.yamaganda
    };
    const deity = DEITY_MANTRAS[getDayLordIndex(day.dayLord)] || DEITY_MANTRAS[1];
    const taraBalaStr = getTaraBalaInfo((day.tara?.tara as number) || 2, lang);
    const chandraBalaStr = getChandraBalaInfo((day.chandra?.house as number) || 11, Boolean(day.isChandrashtama), lang);
    const localizedColor = pick(COLOUR_L5[day.luckyColour as ColourKey], lang) || day.luckyColour || "Yellow";
    const localizedDirection = pick(DIRECTION_L5[day.luckyDirection as DirectionKey], lang) || day.luckyDirection || "East";
    const luckyNumsStr = Array.isArray(day.luckyNumbers) ? day.luckyNumbers.join(" · ") : "1 · 5 · 9";

    const rashiStr = rashiName(day.moonRashiIndex, lang);

    const descriptionParts: string[] = [
      `🕉️ ${labels.panchangaTitle} - ${labels.kshetraTitle}`,
      "----------------------------------------",
      `👤 ${labels.devoteeLabel}: ${devoteeDisplayName}`,
      `🙏 ${labels.priestLabel}: ${localizedPandit}`,
      `📅 ${labels.tithiLabel}: ${tithiFullStr}`,
      `🌙 ${labels.rashiLabel}: ${rashiStr}`,
      `⭐ ${labels.nakshatraLabel}: ${nakName}`
    ];

    if (vrata.isSpecial) {
      const fastingLabel = lang === "kn" ? "ಉಪವಾಸ ನಿಯಮ" : lang === "hi" ? "उपवास नियम" : lang === "te" ? "ఉపవాస నిబంధనలు" : lang === "ta" ? "விரத விதிமுறை" : "Fasting Advice";
      const specialMantraLabel = lang === "kn" ? "ವಿಶೇಷ ಮಂತ್ರ" : lang === "hi" ? "विशेष मंत्र" : lang === "te" ? "ప్రత్యేక మంత్రం" : lang === "ta" ? "சிறப்பு மந்திரம்" : "Special Mantra";

      descriptionParts.push("----------------------------------------");
      descriptionParts.push(`🔔 ${vrata.vrataName}`);
      descriptionParts.push(`📜 ${vrata.sameDayNotice}`);
      descriptionParts.push(`🍽️ ${fastingLabel}: ${vrata.fastingAdvice}`);
      descriptionParts.push(`🕉️ ${specialMantraLabel}: ${vrata.mantra}`);
    }

    const detailsLabel = lang === "kn" ? "ವಿವರಗಳು" : lang === "hi" ? "विवरण" : lang === "te" ? "వివరాలు" : lang === "ta" ? "விவரங்கள்" : "Details";
    const closingBlessing = lang === "kn" ? "✨ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು ✨" : lang === "hi" ? "✨ श्री महाबलेश्वर प्रसाद सिद्धिरस्तु ✨" : lang === "te" ? "✨ శ్రీ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు ✨" : lang === "ta" ? "✨ ஸ்ரீ மகாபலேஸ்வரர் பிரசாத சித்திரஸ்து ✨" : "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨";
    const openSanctumLabel = lang === "kn" ? "ಲೈವ್ ದರ್ಶನ ನೋಡಿ" : lang === "hi" ? "लाइव दर्शन देखें" : lang === "te" ? "లైవ్ దర్శనం చూడండి" : lang === "ta" ? "நேரலை தரிசனம் பார்க்க" : "Open Live Darshana";

    descriptionParts.push(
      "----------------------------------------",
      `🌅 ${labels.sunriseLabel}: ${kaala.sunrise}`,
      `🌇 ${labels.sunsetLabel}: ${kaala.sunset}`,
      `⚡ ${labels.statusLabel}: ${vibe.badgeText} (${day.energyScore || 85}%)`,
      `✨ ${labels.statusLabel} (${detailsLabel}): ${vibe.vibeTag}`,
      `🎯 ${labels.taraLabel}: ${taraBalaStr}`,
      `🌙 ${labels.chandraLabel}: ${chandraBalaStr}`,
      `🔢 ${labels.luckyNumberLabel}: ${luckyNumsStr}`,
      `🎨 ${labels.luckyColorLabel}: ${localizedColor}`,
      `🧭 ${labels.luckyDirectionLabel}: ${localizedDirection}`,
      `🔴 ${labels.rahuLabel}: ${kaala.rahu}`,
      `🟡 ${labels.gulikaLabel}: ${kaala.gulika}`,
      `⏳ ${labels.yamagandaLabel}: ${kaala.yamaganda}`,
      `🛕 ${labels.deityLabel}: ${pick(deity.deityL5, lang)}`,
      `📜 ${labels.mantraLabel}: ${deity.mantra}`,
      "----------------------------------------",
      `🌐 ${labels.visitLabel}`,
      `👉 ${sanctumUrl}`,
      "----------------------------------------",
      closingBlessing
    );

    const descriptionStr = descriptionParts.join("\n");
    const htmlDescriptionStr = `<html><body style="font-family:sans-serif; background-color:#1c0a00; color:#fff8e7; padding:12px;"><div style="background-color:#501b11; border:2px solid #f59e0b; border-radius:12px; padding:16px; margin-bottom:16px;"><h2 style="color:#fde68a; margin:0 0 12px 0; font-size:16px; text-align:center;">🕉️ ${labels.panchangaTitle} - ${labels.kshetraTitle}</h2><table style="width:100%; border-collapse:collapse; font-size:13px;"><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b; width:45%;">👤 ${labels.devoteeLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${devoteeDisplayName}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🙏 ${labels.priestLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${localizedPandit}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">📅 ${labels.tithiLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${tithiFullStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🌙 ${labels.rashiLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${rashiStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">⭐ ${labels.nakshatraLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${nakName}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🌅 ${labels.sunriseLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${kaala.sunrise}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🌇 ${labels.sunsetLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${kaala.sunset}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">⚡ ${labels.statusLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${vibe.badgeText} (${day.energyScore || 85}%)</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">✨ ${detailsLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${vibe.vibeTag}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🎯 ${labels.taraLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${taraBalaStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🌙 ${labels.chandraLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${chandraBalaStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🔢 ${labels.luckyNumberLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${luckyNumsStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🎨 ${labels.luckyColorLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${localizedColor}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🧭 ${labels.luckyDirectionLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${localizedDirection}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🔴 ${labels.rahuLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${kaala.rahu}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🟡 ${labels.gulikaLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${kaala.gulika}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">⏳ ${labels.yamagandaLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${kaala.yamaganda}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🛕 ${labels.deityLabel}:</td><td style="padding:6px 4px; color:#fff8e7;">${pick(deity.deityL5, lang)}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">📜 ${labels.mantraLabel}:</td><td style="padding:6px 4px; color:#fff8e7;"><span style="font-size:11px; color:#fde68a;">${deity.mantra}</span></td></tr><tr><td style="padding:6px 4px; font-weight:bold; color:#f59e0b;">🌐 Live Sanctum:</td><td style="padding:6px 4px; color:#fff8e7;"><a href="${sanctumUrl}" style="color:#6ee7b7; font-weight:bold;">${openSanctumLabel}</a></td></tr></table></div><div style="text-align:center; margin-top:12px;"><p style="color:#fde68a; font-weight:bold; margin-bottom:8px;">${labels.visitLabel}</p><a href="${sanctumUrl}" style="display:inline-block; background:#d97706; color:#ffffff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:bold;">👉 ${openSanctumLabel}</a></div><br/><p style="text-align:center; color:#f59e0b; font-size:12px;">${closingBlessing}</p></body></html>`;

    const masterSeriesUid = `baggona-series-${sanitizedDevoteeToken}@baggona.app`;
    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${dayUid}`,
      `RELATED-TO;RELTYPE=PARENT:${masterSeriesUid}`,
      `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
      `SEQUENCE:${idx}`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `SUMMARY:${escapeIcsText(summaryStr)}`,
      `DESCRIPTION:${escapeIcsText(descriptionStr)}`,
      `X-ALT-DESC;FMTTYPE=text/html:${escapeIcsText(htmlDescriptionStr)}`,
      `ATTACH;FMTTYPE=image/jpeg:${origin}/calendar_event_flair.jpg`,
      `IMAGE;VALUE=URI:${origin}/calendar_event_flair.jpg`,
      `X-MICROSOFT-IMAGE;VALUE=URI:${origin}/calendar_event_flair.jpg`,
      `X-GOOGLE-CALENDAR-EVENT-FLAIR:${origin}/calendar_event_flair.jpg`,
      `URL:${sanctumUrl}`,
      `COLOR:${vibe.icalColor}`,
      `X-GOOGLE-CALENDAR-COLOR:${vibe.googleColorId}`,
      "CATEGORIES:Temple,Puja,Pooja,Astrology,Worship,Daily Ritual,Gokarna Kshetra,Baggona Panchanga",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:AUDIO",
      "ATTACH;VALUE=URI:PresetSound#Bells",
      `DESCRIPTION:${escapeIcsText(summaryStr)}`,
      "TRIGGER:-PT0M",
      "REPEAT:1",
      "DURATION:PT5M",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(summaryStr)}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(summaryStr)} (Morning Reminder)`,
      "TRIGGER:-PT15M",
      "END:VALARM",
      "END:VEVENT"
    ];

    lines.push(...eventLines);

    // If day is a Special Vrata (Amavasya, Ekadashi, Sankashti, Purnima, Festival),
    // add 1-Day Prior Previous Evening Eve Alert Event at 20:00 (8:00 PM IST)
    if (vrata.isSpecial) {
      const prevDate = new Date(new Date(day.ymd).getTime() - 86400000);
      const prevYmd = prevDate.toISOString().slice(0, 10);
      const prevYmdCompact = formatYmdCompact(prevYmd);
      const eveUid = `baggona-eve-${prevYmdCompact}-${sanitizedDevoteeToken}@baggona.app`;
      const eveDtStart = `${prevYmdCompact}T200000`; // 8:00 PM previous evening
      const eveDtEnd = `${prevYmdCompact}T203000`;   // 8:30 PM IST

      const eveLines: string[] = [
        "BEGIN:VEVENT",
        `UID:${eveUid}`,
        `RELATED-TO;RELTYPE=PARENT:baggona-series-${sanitizedDevoteeToken}@baggona.app`,
        `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
        `DTSTAMP:${nowIso}`,
        `DTSTART;TZID=Asia/Kolkata:${eveDtStart}`,
        `DTEND;TZID=Asia/Kolkata:${eveDtEnd}`,
        `SUMMARY:${escapeIcsText(vrata.eveAlertTitle)}`,
        `DESCRIPTION:${escapeIcsText(`${vrata.eveAlertSummary}\n\nFasting Advice: ${vrata.fastingAdvice}\nSpecial Mantra: ${vrata.mantra}`)}`,
        `ATTACH;FMTTYPE=image/jpeg:${origin}/calendar_event_flair.jpg`,
        `URL:${sanctumUrl}`,
        "COLOR:#d97706",
        "X-GOOGLE-CALENDAR-COLOR:6",
        "CATEGORIES:Vrata,Special Day,Eve Alert,Baggona Panchanga",
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcsText(vrata.eveAlertTitle)}`,
        "TRIGGER:-PT15M",
        "END:VALARM",
        "END:VEVENT"
      ];
      lines.push(...eveLines);
    }
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Generates a Google Calendar Web Intent URL for Android / Web with Royal Framing and Encrypted Live Sanctum Link.
 * NOTE: Creates a single-day preview event (no RRULE) with a link to the full 90-day ICS import.
 * Previously used RRULE:FREQ=DAILY;COUNT=90 which duplicated Day 1 content for all 90 days.
 */
export function generateGoogleCalendarUrl(options: {
  day?: RhythmDay;
  days?: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime: string;
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  dob?: string;
  tob?: string;
  aiPanchangaMap?: Record<string, DayPanchangaAiItem>;
}): string {
  const {
    day: singleDay,
    days,
    lang,
    panditName,
    notificationTime,
    personName,
    webAppBaseUrl,
    pincode = "581326",
    lat = 14.54,
    lng = 74.31,
    locationName = "Gokarna",
    dob,
    tob,
    aiPanchangaMap
  } = options;
  const day = (singleDay || (days && days.length > 0 ? days[0] : null) || {
    ymd: new Date().toISOString().slice(0, 10),
    dayLord: "Sun",
    moonRashiIndex: 0,
    moonNakshatraIndex: 0,
    paksha: "Shukla",
    tithiNumber: 1,
    band: "high",
    isChandrashtama: false,
    isAmavasya: false,
    isPurnima: false,
    isSankranti: false,
    luckyNumbers: [1, 5, 9]
  }) as RhythmDay;
  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";
  const ymdCompact = formatYmdCompact(day.ymd);

  const dtStart = `${ymdCompact}T${hh}${mm}00`;
  const endMinutes = (parseInt(mm, 10) + 30) % 60;
  const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
  const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

  const vibe = getEnergyMeterAndVibe(day, lang);
  const kaalaRaw = getDailyKaalaTimings(day.dayLord, lang, day.ymd, lat, lng, pincode);
  const aiItem = aiPanchangaMap?.[day.ymd];
  const kaala = {
    sunrise: aiItem?.suryodaya || kaalaRaw.sunrise,
    sunset: aiItem?.suryasta || kaalaRaw.sunset,
    rahu: aiItem?.rahuKaala || kaalaRaw.rahu,
    gulika: aiItem?.gulikaKaala || kaalaRaw.gulika,
    yamaganda: aiItem?.yamagandaKaala || kaalaRaw.yamaganda
  };
  const dayIdx = getDayLordIndex(day.dayLord);
  const deity = DEITY_MANTRAS[dayIdx] || DEITY_MANTRAS[0];

  const isKn = lang.startsWith("kn");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");

  const localizedPandit = getLocalizedPanditName(panditName, lang);
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : (isKn ? "ಭಕ್ತರು" : "Devotee");

  const startDateStr = (days && days.length > 0 ? days[0].ymd : day.ymd) || new Date().toISOString().slice(0, 10);
  const birthNakIdx = (days && days.length > 0 ? days[0].moonNakshatraIndex : day.moonNakshatraIndex) ?? 0;
  const birthRashiIdx = (days && days.length > 0 ? days[0].moonRashiIndex : day.moonRashiIndex) ?? 0;

  const devoteeToken = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: birthNakIdx,
    r: birthRashiIdx,
    p: localizedPandit,
    d: startDateStr,
    l: lang,
    tm: notificationTime,
    pl: "android",
    t: "google",
    pc: pincode,
    lt: lat,
    lg: lng,
    loc: locationName,
    dob: options.dob,
    tob: options.tob
  });
  const origin = getSafeProductionOrigin(webAppBaseUrl);
  const sanctumUrl = `${origin}/daily?token=${devoteeToken}`;

  const panchangaTitle = isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ" : isHi ? "बग्गोण पंचांग" : isTe ? "బగ్గోణ పంచాಂಗం" : isTa ? "பக்கோண பஞ்சாங்கம்" : "Baggona Panchanga";
  const kshetraTitle = isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ" : isHi ? "गोकर्ण क्षेत्र" : isTe ? "గోకర్ణ క్షేత్రం" : isTa ? "கோகர்ண க்ஷேத்திரம்" : "Gokarna Kshetra";
  const priestLabel = isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರು" : isHi ? "मुख्य अर्चक" : isTe ? "ముఖ్య అర్చకులు" : isTa ? "முதன்மை அர்ச்சகர்" : "Chief Priest";
  const devoteeLabel = isKn ? "ಭಕ್ತರ ಹೆಸರು" : isHi ? "भक्त का नाम" : isTe ? "భక్తుని పేరు" : isTa ? "பக்தர் பெயர்" : "Devotee";

  const summary = `${vibe.badgeEmoji} ${pakshaLabel(day, lang)} - ${tithiOnlyLabel(day, lang)} - ${localizedPandit} - ${panchangaTitle}`;

  const taraNum = day.tara?.tara || 2;
  const taraInfo = getTaraBalaInfo(taraNum, lang);
  const chandraInfo = getChandraBalaInfo(day.chandra?.house || 11, day.isChandrashtama, lang);

  const guidancePoints = getDailyActionableGuidance(day, lang);
  const vehicleText = guidancePoints.find(p => p.icon === "🚗")?.text || "";
  const financeText = guidancePoints.find(p => p.icon === "💰")?.text || "";
  const mindText = guidancePoints.find(p => p.icon === "🧠")?.text || "";
  const spiritualText = guidancePoints.find(p => p.icon === "🪔")?.text || "";

  const futureTitle = isKn ? "🔮 ಭವಿಷ್ಯದ ಪ್ರಮುಖ 4 ಮಾರ್ಗದರ್ಶನಗಳು:" : isHi ? "🔮 भविष्य का मुख्य 4 मार्गदर्शन:" : isTe ? "🔮 భవిష్యత్తు ముఖ్య 4 మార్గదర్శకాలు:" : isTa ? "🔮 எதிர்கால முக்கிய 4 வழிகாட்டுதல்கள்:" : "🔮 Key Future Actionable Focus Points:";

  const labels = getCalendarLabels(lang);
  const localizedColor = pick(COLOUR_L5[day.luckyColour as ColourKey], lang) || day.luckyColour || "Yellow";
  const localizedDirection = pick(DIRECTION_L5[day.luckyDirection as DirectionKey], lang) || day.luckyDirection || "East";
  const luckyNumsStr = Array.isArray(day.luckyNumbers) ? day.luckyNumbers.join(" · ") : "1 · 5 · 9";
  const nakName = nakshatraName(day.moonNakshatraIndex, lang as SevaLang);
  const rashiStr = rashiName(day.moonRashiIndex, lang);

  const details = [
    `🕉️ ${labels.panchangaTitle} - ${labels.kshetraTitle}`,
    "----------------------------------------",
    `👤 ${labels.devoteeLabel}: ${devoteeDisplayName}`,
    `🙏 ${labels.priestLabel}: ${localizedPandit}`,
    `📅 ${labels.tithiLabel}: ${tithiLabel(day, lang)}`,
    `🌙 ${labels.rashiLabel}: ${rashiStr}`,
    `⭐ ${labels.nakshatraLabel}: ${nakName}`,
    `🌅 ${labels.sunriseLabel}: ${kaala.sunrise}`,
    `🌇 ${labels.sunsetLabel}: ${kaala.sunset}`,
    `⚡ ${labels.statusLabel}: ${vibe.badgeText} (${day.energyScore || 85}%)`,
    `✨ ${labels.statusLabel} Details: ${vibe.vibeTag}`,
    `🎯 ${labels.taraLabel}: ${taraInfo}`,
    `🌙 ${labels.chandraLabel}: ${chandraInfo}`,
    `🔢 ${labels.luckyNumberLabel}: ${luckyNumsStr}`,
    `🎨 ${labels.luckyColorLabel}: ${localizedColor}`,
    `🧭 ${labels.luckyDirectionLabel}: ${localizedDirection}`,
    `🚫 ${labels.rahuLabel}: ${kaala.rahu}`,
    `⏳ ${labels.gulikaLabel}: ${kaala.gulika}`,
    `⌛ ${labels.yamagandaLabel}: ${kaala.yamaganda}`,
    `🛕 ${labels.deityLabel}: ${deity.deity}`,
    `📜 ${labels.mantraLabel}: ${deity.mantra}`,
    "----------------------------------------",
    `🌐 ${labels.visitLabel}`,
    `👉 ${sanctumUrl}`,
    "----------------------------------------",
    `📥 Import Full 90-Day Calendar: ${origin}/daily?token=${devoteeToken}&action=ics90`,
    "----------------------------------------",
    "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨"
  ].join("\n");

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${dtStart}/${dtEnd}`,
    details: details,
    ctz: "Asia/Kolkata"
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates a COMPACT Google Calendar URL specifically designed for QR codes.
 * Standard QR codes have a max capacity of ~2,953 bytes (version 40, EC level L).
 * The full Google Calendar URL with Unicode emojis, Kannada text, and mantras
 * far exceeds this limit when URL-encoded, making QR codes unscannable.
 * 
 * This compact version:
 * - Strips all emoji characters
 * - Uses ASCII-only short text 
 * - Includes only essential calendar info (title, dates, single day)
 * - Adds a short Web Sanctum link for full details + 90-day ICS import link
 * - Total URL length stays under 600 characters
 * - No RRULE (which would duplicate Day 1 content for all 90 days)
 */
export function generateCompactGoogleCalendarUrlForQR(options: {
  day?: RhythmDay;
  days?: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime: string;
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  dob?: string;
  tob?: string;
}): string {
  const {
    day: singleDay,
    days,
    lang,
    panditName,
    notificationTime,
    personName,
    webAppBaseUrl,
    pincode = "581326",
    lat = 14.54,
    lng = 74.31,
    locationName = "Gokarna",
    dob,
    tob
  } = options;
  const day = (singleDay || (days && days.length > 0 ? days[0] : null) || {
    ymd: new Date().toISOString().slice(0, 10),
    dayLord: "Sun",
    moonRashiIndex: 0,
    moonNakshatraIndex: 0,
    paksha: "Shukla",
    tithiNumber: 1,
    band: "high",
    isChandrashtama: false,
    isAmavasya: false,
    isPurnima: false,
    isSankranti: false,
    luckyNumbers: [1, 5, 9]
  }) as RhythmDay;
  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";
  const ymdCompact = formatYmdCompact(day.ymd);

  const dtStart = `${ymdCompact}T${hh}${mm}00`;
  const endMinutes = (parseInt(mm, 10) + 30) % 60;
  const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
  const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

  const origin = getSafeProductionOrigin(webAppBaseUrl);
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : "Devotee";
  const safePandit = panditName || "Archaka";

  const devoteeToken = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: day.moonNakshatraIndex,
    r: day.moonRashiIndex,
    p: safePandit,
    d: day.ymd,
    l: lang,
    tm: notificationTime,
    pl: "android",
    t: "google",
    dob,
    tob
  });
  const sanctumUrl = `${origin}/daily?token=${devoteeToken}`;

  // Compact ASCII-only summary for QR (no emojis, no Unicode)
  const summary = `Baggona Panchanga - 90 Day Seva Calendar`;

  // Short ASCII details that stay within QR capacity
  const details = [
    `Baggona Panchanga Astrology (Gokarna Kshetra)`,
    `Priest: ${safePandit}`,
    `Devotee: ${devoteeDisplayName}`,
    `90-Day Daily Guidance with Tithi, Nakshatra, Mantras`,
    ``,
    `Full Details: ${sanctumUrl}`,
    `Import 90-Day Calendar: ${origin}/daily?token=${devoteeToken}&action=ics90`
  ].join("\n");

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${dtStart}/${dtEnd}`,
    details: details,
    ctz: "Asia/Kolkata"
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates an Apple iOS / macOS compatible calendar payload.
 * Provides a direct webcal / data URI for native iOS Calendar importing.
 */
export function generateAppleCalendarPayload(options: CalendarGeneratorOptions): string {
  const ics = generateSevaICalendarString(options);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export type QrCalendarTarget = "google" | "webcal" | "sanctum";

/**
 * Generates dynamic payload for QR codes based on selected target:
 * 1. google: 1-Click Google Calendar Intent URL
 * 2. webcal: Apple / Outlook Live WebCal Sync / ics link
 * 3. sanctum: Baggona Daily Darshana Sanctum PWA Deep link
 */
export function generateQrPayloadByTarget(
  target: QrCalendarTarget,
  options: CalendarGeneratorOptions & { platform?: "android" | "apple" }
): string {
  const {
    days,
    lang,
    panditName,
    personName,
    webAppBaseUrl,
    platform,
    pincode = "581326",
    lat = 14.54,
    lng = 74.31,
    locationName = "Gokarna",
    dob,
    tob
  } = options;
  const firstDay = days && days.length > 0 ? days[0] : null;
  const safePandit = panditName || "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್";
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee");

  const origin = getSafeProductionOrigin(webAppBaseUrl);

  const token = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: firstDay?.moonNakshatraIndex,
    r: firstDay?.moonRashiIndex,
    p: safePandit,
    d: firstDay?.ymd || new Date().toISOString().slice(0, 10),
    l: lang,
    pl: platform || "android",
    t: target,
    pc: pincode,
    lt: lat,
    lg: lng,
    loc: locationName,
    dob,
    tob
  });

  if (target === "google" || target === "webcal") {
    // Instant 90-day native calendar import engine
    // Triggers direct .ics calendar import on devotee's phone without waiting 24h for Google crawler
    return `${origin}/daily?token=${token}&action=ics90`;
  }

  // target === "sanctum"
  return `${origin}/daily?token=${token}`;
}

export function generatePlatformSpecificQrPayload(
  platform: "android" | "apple",
  options: CalendarGeneratorOptions
): string {
  if (platform === "android") {
    return generateQrPayloadByTarget("google", { ...options, platform });
  }
  return generateQrPayloadByTarget("sanctum", { ...options, platform });
}

/** Legacy & Standard backward compatibility wrapper */
export function generateNative90DayQrCalendarPayload(options: {
  days: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime: string;
  personName?: string;
  platform?: "android" | "apple";
  target?: QrCalendarTarget;
}): string {
  if (options.target) {
    return generateQrPayloadByTarget(options.target, options);
  }
  return generatePlatformSpecificQrPayload(options.platform || "android", options);
}


/**
 * Triggers client-side browser file download for .ics calendar.
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
