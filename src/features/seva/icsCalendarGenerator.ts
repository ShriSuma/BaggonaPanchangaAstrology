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
import { getDetailedTithiInfo, type DetailedTithiInfo } from "../../core/VedicCalculations";
import { sunTimesSyncForBirth } from "../../core/birthSunTimes";
import { getUniversalBirthDetails } from "../../utils/universalDevoteeKundli";
import { resolvePincodeCoordinatesSync } from "../../services/locationApi";
import { getPreviousDayPreparationAlert, generatePriestDayDossier } from "../../core/PriestCalendarEngine";
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
import { encodeDevoteeToken, encodeDateOnlyDevoteeToken } from "../../utils/tokenCipher";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { normalizeDegree } from "../../core/AstroMath";

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function escapeIcsHtml(html: string): string {
  return html
    .replace(/\\/g, "\\\\")
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
      vibeTagLabel: "ದಿನದ ಪ್ರಭಾವ",
      energyMeaningLabel: "ದಿನದ ಶಕ್ತಿ ವಿವರಣೆ",
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
      tithiTimingLabel: "ತಿಥಿ ಮುಕ್ತಾಯ ಸಮಯ",
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
      vibeTagLabel: "दैनिक प्रभाव",
      energyMeaningLabel: "दैनिक ऊर्जा अर्थ",
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
      tithiTimingLabel: "तिथि समाप्ति समय",
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
      vibeTagLabel: "రోజు ప్రభావం",
      energyMeaningLabel: "శక్తి మార్గదర్శక వివరాలు",
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
      tithiTimingLabel: "తిథి ముగింపు సమయం",
      pakshaKeyLabel: "పక్షం",
      rashiLabel: "రాశి",
      nakshatraLabel: "నక్షత్రం",
      sunTimingsLabel: "సూర్యోదయం - సూర్యాస్తమయం",
      rahuLabel: "రాహు కాలం",
      gulikaLabel: "గుళిక కాలం",
      yamagandaLabel: "యమగండ కాలం",
      deityLabel: "దిన దైవ ఆరాధన",
      mantraLabel: "దిన మంత్రం"
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
      vibeTagLabel: "தினசரி தாக்கம்",
      energyMeaningLabel: "ஆற்றல் வழிகாட்டுதல் பொருள்",
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
      tithiTimingLabel: "திதி முடிவு நேரம்",
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
    vibeTagLabel: "Daily Influence",
    energyMeaningLabel: "Energy Guidance Meaning",
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
    tithiTimingLabel: "Tithi End Time",
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

  if (isChandrashtama || house === 8) {
    if (code === "kn") return "8ನೇ ಮನೆ - 🔴 ಚಂದ್ರಾಷ್ಟಮ: ದೊಡ್ಡ ಹೂಡಿಕೆ & ವಾದ-ವಿವಾದ ತಪ್ಪಿಸಿ; ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಶಿವನಾಮ ಜಪಿಸಿ.";
    if (code === "hi") return "8वां भाव - 🔴 चंद्राष्टम: बड़े आर्थिक जोखिम व विवादों से बचें; विश्राम व शिव आराधना करें।";
    if (code === "te") return "8వ ఇల్లు - 🔴 చంద్రాష్టమం: పెద్ద పెట్టుబడులు, వివాదాలు నివారించండి; ప్రశాంతంగా ఉంటూ శివారాధన చేయండి.";
    if (code === "ta") return "8ஆம் இடம் - 🔴 சந்திராஷ்டமம்: பெரிய முதலீடுகளைத் தவிர்க்கவும்; சிவநாம ஜெபம் நல்லது.";
    return "8th House - 🔴 CHANDRASHTAMA: Avoid risky stakes or arguments; focus on rest & prayer.";
  }

  switch (house) {
    case 1:
      if (code === "kn") return "1ನೇ ಮನೆ - 🟢 ತನು ಸ್ಥಾನ: ಆತ್ಮವಿಶ್ವಾಸ, ಹೊಸ ಚಿಂತನೆ & ವೈಯಕ್ತಿಕ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಪ್ರಶಸ್ತ ದಿನ.";
      if (code === "hi") return "1वां भाव - 🟢 तनु भाव: आत्मविश्वास, नई ऊर्जा एवं व्यक्तिगत कार्यों हेतु उत्तम दिन।";
      if (code === "te") return "1వ ఇల్లు - 🟢 తను స్థానం: ఆత్మవిశ్వాసం, నూతన ఉత్సాహం & వ్యక్తిగత పనులకు అనుకూలం.";
      if (code === "ta") return "1ஆம் இடம் - 🟢 தனு ஸ்தானம்: தன்னம்பிக்கை, புதிய உற்சாகம் & சுப தொடக்கத்திற்கு நன்று.";
      return "1st House - 🟢 TANU STHANA: High vitality, confidence & ideal for personal initiatives.";
    case 2:
      if (code === "kn") return "2ನೇ ಮನೆ - 🟢 ಧನ ಸ್ಥಾನ: ಧನಾಗಮನ, ಕುಟುಂಬ ಸೌಖ್ಯ, ಹೂಡಿಕೆ & ಆರ್ಥಿಕ ಮಾತುಕತೆಗೆ ಶುಭ.";
      if (code === "hi") return "2वां भाव - 🟢 धन भाव: धन आगमन, पारिवारिक सौहार्द एवं वित्तीय वार्ता हेतु शुभ।";
      if (code === "te") return "2వ ఇల్లు - 🟢 ధన స్థానం: ధన లాభం, కుటుంబ సంతోషం & ఆర్థిక ఒప్పందాలకు శుభం.";
      if (code === "ta") return "2ஆம் இடம் - 🟢 தன ஸ்தானம்: தன வரவு, குடும்ப மகிழ்ச்சி & நிதி பேச்சுவார்த்தைக்கு உகந்தது.";
      return "2nd House - 🟢 DHANA STHANA: Wealth inflow, financial negotiations & family harmony.";
    case 3:
      if (code === "kn") return "3ನೇ ಮನೆ - 🟢 ಭ್ರಾತೃ ಸ್ಥಾನ: ಧೈರ್ಯ, ಸೋದರ ಸಹಕಾರ, ಕಿರು ಪ್ರಯಾಣ & ಸಂವಹನದಲ್ಲಿ ಯಶಸ್ಸು.";
      if (code === "hi") return "3वां भाव - 🟢 भ्रातृ भाव: पराक्रम, भाई-बहनों का सहयोग, यात्रा व संवाद में सफलता।";
      if (code === "te") return "3వ ఇల్లు - 🟢 భ్రాతృ స్థానం: ధైర్యం, తోబుట్టువుల సహకారం & ప్రయాణ విజయాలు.";
      if (code === "ta") return "3ஆம் இடம் - 🟢 பிராத்ரு ஸ்தானம்: தைரியம், சகோதர ஆதரவு & பயண வெற்றி.";
      return "3rd House - 🟢 BHRATRU STHANA: Courage, communication success & short journey triumphs.";
    case 4:
      if (code === "kn") return "4ನೇ ಮನೆ - 🟡 ಮಾತೃ ಸ್ಥಾನ: ಗೃಹ ಶಾಂತಿ, ವಾಹನ ಸೌಖ್ಯ, ತಾಯಿಯ ಆಶೀರ್ವಾದ; ನಿರ್ಧಾರದಲ್ಲಿ ತಾಳ್ಮೆ ಇರಲಿ.";
      if (code === "hi") return "4वां भाव - 🟡 मातृ भाव: गृह सुख, वाहन लाभ, माता का आशीर्वाद; धैर्य बनाए रखें।";
      if (code === "te") return "4వ ఇల్లు - 🟡 మాతృ స్థానం: గృహ శాంతి, వాహన సౌఖ్యం; తొందరపాటు నిర్ణయాలు వద్దు.";
      if (code === "ta") return "4ஆம் இடம் - 🟡 மாத்ரு ஸ்தானம்: இல்ல அமைதி, வாகன சுகம்; நிதானம் தேவை.";
      return "4th House - 🟡 MATRU STHANA: Domestic peace, vehicular comfort & maternal blessings.";
    case 5:
      if (code === "kn") return "5ನೇ ಮನೆ - 🟢 ಜ್ಞಾನ/ಸಂತಾನ ಸ್ಥಾನ: ಬುದ್ಧಿ ವಿಕಾಸ, ಸೃಜನಶೀಲತೆ, ಮಕ್ಕಳಿಂದ ಶುಭ ವಾರ್ತೆ & ಸಂತೋಷ.";
      if (code === "hi") return "5वां भाव - 🟢 संतान/ज्ञान भाव: बौद्धिक विकास, रचनात्मकता एवं संतान सुख।";
      if (code === "te") return "5వ ఇల్లు - 🟢 పుత్ర/జ్ఞాన స్థానం: మేధో వికాసం, సృజనాత్మకత & శుభవార్తలు.";
      if (code === "ta") return "5ஆம் இடம் - 🟢 புத்திர/ஞான ஸ்தானம்: அறிவு வளர்ச்சி, படைப்பாற்றல் & சுப செய்தி.";
      return "5th House - 🟢 JNANA STHANA: Intellect, creative breakthroughs & family joy.";
    case 6:
      if (code === "kn") return "6ನೇ ಮನೆ - 🟢 ಶತ್ರು ಜಯ ಸ್ಥಾನ: ಸಾಲ/ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಶಮನ, ಸ್ಪರ್ಧಾ ಜಯ & ಕಾರ್ಯ ಸಿದ್ಧಿ.";
      if (code === "hi") return "6वां भाव - 🟢 शत्रु जय भाव: रोग-ऋण मुक्ति, प्रतिस्पर्धा में विजय एवं कार्य सिद्धि।";
      if (code === "te") return "6వ ఇల్లు - 🟢 శత్రు జయ స్థానం: రుణ విముక్తి, పోటీల్లో విజయం & ఆరోగ్య లాభం.";
      if (code === "ta") return "6ஆம் இடம் - 🟢 சத்ரு ஜெய ஸ்தானம்: நோய்-கடன் நிவர்த்தி, போட்டி வெற்றி & காரிய சித்தி.";
      return "6th House - 🟢 SHATRU JAYA: Overcoming obstacles, debt relief & competitive success.";
    case 7:
      if (code === "kn") return "7ನೇ ಮನೆ - 🟢 ಕಳತ್ರ ಸ್ಥಾನ: ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ, ಸಾರ್ವಜನಿಕ ಸಹಕಾರ & ದಾಂಪತ್ಯ ಪ್ರೀತಿ.";
      if (code === "hi") return "7वां भाव - 🟢 कलत्र भाव: व्यापार साझेदारी, जनसमर्थन एवं दांपत्य सुख।";
      if (code === "te") return "7వ ఇల్లు - 🟢 కళత్ర స్థానం: వ్యాపార భాగస్వామ్యం, ప్రజా మద్దతు & దాంపత్య సుఖం.";
      if (code === "ta") return "7ஆம் இடம் - 🟢 களத்திர ஸ்தானம்: தொழில் கூட்டாண்மை & தாம்பத்திய மகிழ்ச்சி.";
      return "7th House - 🟢 KALATRA STHANA: Business partnerships, public goodwill & marital bliss.";
    case 9:
      if (code === "kn") return "9ನೇ ಮನೆ - 🟢 ಭಾಗ್ಯ ಸ್ಥಾನ: ತಂದೆ/ಗುರುಗಳ ಕೃಪೆ, ಧಾರ್ಮಿಕ ಕಾರ್ಯ, ದೂರ ಪ್ರಯಾಣ & ಭಾಗ್ಯೋದಯ.";
      if (code === "hi") return "9वां भाव - 🟢 भाग्य भाव: गुरु-पिता का आशीर्वाद, धार्मिक कार्य एवं भाग्योदय।";
      if (code === "te") return "9వ ఇల్లు - 🟢 భాగ్య స్థానం: గురువుల ఆశీస్సులు, పుణ్య కార్యాలు & భాగ్యోదయం.";
      if (code === "ta") return "9ஆம் இடம் - 🟢 பாக்ய ஸ்தானம்: தந்தை-குரு ஆசி, தர்ம காரியம் & பாக்யோதயம்.";
      return "9th House - 🟢 BHAGYA STHANA: Fortune rises, father/guru blessings & spiritual travel.";
    case 10:
      if (code === "kn") return "10ನೇ ಮನೆ - 🟢 ಕರ್ಮ ಸ್ಥಾನ: ವೃತ್ತಿರಂಗದಲ್ಲಿ ಗೌರವ, ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಪ್ರಶಂಸೆ & ಅಧಿಕಾರ ಸಿದ್ಧಿ.";
      if (code === "hi") return "10वां भाव - 🟢 कर्म भाव: कार्यक्षेत्र में मान-सम्मान, पदोन्नति एवं प्रशासनिक सफलता।";
      if (code === "te") return "10వ ఇల్లు - 🟢 కర్మ స్థానం: ఉద్యోగంలో గౌరవం, అధికారుల ప్రశంస & పదోన్నతి.";
      if (code === "ta") return "10ஆம் இடம் - 🟢 கர்ம ஸ்தானம்: தொழில் மேன்மை, அதிகாரிகளின் ஆதரவு & வெற்றி.";
      return "10th House - 🟢 KARMA STHANA: Career recognition, executive authority & professional growth.";
    case 11:
      if (code === "kn") return "11ನೇ ಮನೆ - 🟢 ಲಾಭ ಸ್ಥಾನ: ಅತ್ಯುತ್ತಮ ಧನ ಲಾಭ, ಬಾಕಿ ಹಣ ವಸೂಲಾತಿ, ಮಿತ್ರರ ನೆರವು & ಕಾರ್ಯ ಜಯ.";
      if (code === "hi") return "11वां भाव - 🟢 लाभ स्थान: उत्तम धन लाभ, बकाया वसूली, मित्रों का सहयोग व विजय।";
      if (code === "te") return "11వ ఇల్లు - 🟢 లాభ స్థానం: అత్యుత్తమ ధన ప్రాప్తి, బకాయిల వసూలు & మిత్రుల సహాయం.";
      if (code === "ta") return "11ஆம் இடம் - 🟢 லாப ஸ்தானம்: சிறந்த தன லாபம், நிலுவைத் தொகை வரவு & வெற்றி.";
      return "11th House - 🟢 LABHA STHANA: Maximum financial gains, debt recovery & networking success.";
    case 12:
      if (code === "kn") return "12ನೇ ಮನೆ - 🟡 ವ್ಯಯ ಸ್ಥಾನ: ಶುಭ ವೆಚ್ಚಗಳು, ದಾನ-ಧರ್ಮ, ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ; ಖರ್ಚಿನಲ್ಲಿ ಮಿತಿ ಇರಲಿ.";
      if (code === "hi") return "12वां भाव - 🟡 व्यय भाव: मांगलिक खर्च, दान-पुण्य एवं आध्यात्मिक चिंतन; व्यय नियंत्रित रखें।";
      if (code === "te") return "12వ ఇల్లు - 🟡 వ్యయ స్థానం: శుభ ఖర్చులు, దానధర్మాలు; వ్యయాన్ని నియంత్రించండి.";
      if (code === "ta") return "12ஆம் இடம் - 🟡 விரய ஸ்தானம்: சுப செலவுகள், தான தர்மம்; செலவுகளை கட்டுப்படுத்தவும்.";
      return "12th House - 🟡 VYAYA STHANA: Auspicious expenditures, charity & introspective peace.";
    default:
      if (code === "kn") return `${house}ನೇ ಮನೆ - 🟡 ಸಾಮಾನ್ಯ ಚಂದ್ರಬಲ: ದೈನಂದಿನ ವಾಡಿಕೆಯ ಕಾರ್ಯಗಳಿಗೆ ಸೂಕ್ತ.`;
      if (code === "hi") return `${house}वां भाव - 🟡 सामान्य चंद्रबल: दैनिक सामान्य कार्यों हेतु उपयुक्त।`;
      if (code === "te") return `${house}వ ఇల్లు - 🟡 సాధారణ చంద్రబలం: సాధారణ పనులకు అనుకూలం.`;
      if (code === "ta") return `${house}ஆம் இடம் - 🟡 சாதாரண சந்திரபலம்: அன்றாட பணிகளை தொடரவும்.`;
      return `${house}th House - 🟡 Moderate Chandra Bala: Suitable for routine activities.`;
  }
}

/**
 * Returns authentic astrological interpretation for the daily energy score & vibe indicator in all 5 languages.
 */
export function getEnergyIndicatorMeaning(day: RhythmDay, lang: string): string {
  const code = (lang || "en").slice(0, 2);
  const score = day.energyScore ?? 85;
  const isCaution = score < 50 || Boolean(day.isChandrashtama) || (day.tara?.tara === 1 || day.tara?.tara === 3 || day.tara?.tara === 5 || day.tara?.tara === 7);

  if (isCaution || score < 50) {
    if (code === "kn") return "ಎಚ್ಚರಿಕೆಯ ದಿನ: ಚಂದ್ರಬಲ/ತಾರಾಬಲ ಕೊರತೆ. ದೊಡ್ಡ ಆರ್ಥಿಕ ಸಾಹಸ, ವಾದ-ವಿವಾದಗಳನ್ನು ತಪ್ಪಿಸಿ; ಶಾಂತಿ & ಪ್ರಾರ್ಥನೆ ಕಾಪಾಡಿ.";
    if (code === "hi") return "सावधानी का दिन: ग्रहों की प्रतिकूलता अथवा चंद्राष्टम। बड़े आर्थिक जोखिम या विवादों से बचें; शांति और साधना करें।";
    if (code === "te") return "జాగ్రత్త దినం: గ్రహబలం తక్కువగా ఉన్నందున పెద్ద ఆర్థిక నిర్ణయాలు మరియు వివాదాలు వాయిదా వేయండి; ప్రార్థన చేయండి.";
    if (code === "ta") return "எச்சரிக்கை நாள்: கிரக பலவீனம் அல்லது சந்திராஷ்டமம். பெரிய நிதி முடிவுகளைத் தவிர்க்கவும்; இறை வழிபாடு செய்யவும்.";
    return "Cautionary Day: Low planetary strength or Chandrashtama. Avoid high-risk financial stakes or disputes; focus on prayer & patience.";
  }

  if (score >= 75) {
    if (code === "kn") return "ಉತ್ತಮ ಶಕ್ತಿ ಕಾಲ: ನೂತನ ಕಾರ್ಯಾರಂಭ, ಹೂಡಿಕೆ, ಶುಭ ಮಾತುಕತೆ ಹಾಗೂ ಮಹತ್ವದ ನಿರ್ಧಾರಗಳಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ದಿನ.";
    if (code === "hi") return "उत्तम ऊर्जा काल: नए कार्य, निवेश, शुभ बातचीत और महत्वपूर्ण निर्णयों के लिए अत्यंत शुभ दिन।";
    if (code === "te") return "ఉత్తమ శక్తి కాలం: నూతన ప్రారంభాలు, పెట్టుబడులు, ఒప్పందాలు మరియు కీలక నిర్ణయాలకు అత్యంత అనుకూలమైన రోజు.";
    if (code === "ta") return "உயர் ஆற்றல் காலம்: புதிய தொடக்கங்கள், முதலீடுகள், ஒப்பந்தங்கள் மற்றும் முக்கிய முடிவுகளுக்கு மிகவும் உகந்த நாள்.";
    return "High Cosmic Energy: Highly auspicious for commencing new ventures, investments, signing agreements & major decisions.";
  }

  // Balanced (50-74%)
  if (code === "kn") return "ಸಮತೋಲಿತ ಕಾಲ: ದೈನಂದಿನ ವ್ಯಾಪಾರ, ನಿರಂತರ ಪರಿಶ್ರಮ, ವಾಡಿಕೆಯ ವ್ಯವಹಾರಗಳು ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಸೂಕ್ತ.";
  if (code === "hi") return "संतुलित ऊर्जा काल: दैनिक व्यवसाय, निरंतर प्रयास, सामान्य कार्य और आध्यात्मिक साधना के लिए उपयुक्त।";
  if (code === "te") return "సమతుల్య శక్తి కాలం: రోజువారీ పనులు, నిరంతర కృషి మరియు సాధారణ లావాదేవీలకు అనుకూలమైన రోజు.";
  if (code === "ta") return "சீரான ஆற்றல் காலம்: அன்றாட பணிகள், தொடர் முயற்சிகள் மற்றும் பொதுவான காரியங்களுக்கு ஏற்ற நாள்.";
  return "Balanced Energy: Ideal for routine business, persistent efforts, standard transactions & spiritual practices.";
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

  // If pincode is provided, resolve coordinates and use them if lat/lng are missing or default Gokarna
  if (pincode && /^\d{6}$/.test(pincode.trim())) {
    const cleanPin = pincode.trim();
    const pinCoords = resolvePincodeCoordinatesSync(cleanPin, lat ?? 14.5479, lng ?? 74.3187);
    if (
      lat === undefined ||
      lng === undefined ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      (cleanPin !== "581326" && Math.abs(lat - 14.54) < 0.05 && Math.abs(lng - 74.31) < 0.05)
    ) {
      lat = pinCoords.lat;
      lng = pinCoords.lng;
    }
  }

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
  let abhijitStr = "";

  if (dateStr && typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    try {
      const parts = dateStr.split("-").map(Number);
      const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
      const sun = sunTimesSyncForBirth(dateObj, lat, lng, pincode || "");

      const formatTime = (d: Date) => {
        // Enforce strict Indian Standard Time (+05:30) conversion regardless of client browser/system timezone
        const istDate = new Date(d.getTime() + 330 * 60 * 1000);
        const hours = istDate.getUTCHours();
        const minutes = istDate.getUTCMinutes();
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
      const muhurthaMs = daySpanMs / 15;

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

      // Authentic Vedic Abhijit Muhurtha (8th Muhurtha of daytime, centered at solar noon)
      const abhijitStart = new Date(sunriseMs + 7 * muhurthaMs);
      const abhijitEnd = new Date(sunriseMs + 8 * muhurthaMs);
      abhijitStr = `${formatTime(abhijitStart)} – ${formatTime(abhijitEnd)}`;
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

  if (!abhijitStr) {
    abhijitStr = "11:48 AM – 12:36 PM";
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
  const abhijitSuffix = code === "kn" ? "(ಅಭಿಜಿತ್ ಮುಹೂರ್ತ)"
                      : code === "hi" ? "(अभिजित मुहूर्त)"
                      : code === "te" ? "(అభిజిత్ ముహూర్తం)"
                      : code === "ta" ? "(அபிஜித் முகூர்த்தம்)"
                      : "(Abhijit Muhurtha)";

  return {
    sunrise: sunriseStr,
    sunset: sunsetStr,
    rahu: `${rahuStr} ${rahuSuffix}`,
    gulika: `${gulikaStr} ${gulikaSuffix}`,
    yamaganda: `${yamaStr} ${yamaSuffix}`,
    abhijit: `${abhijitStr} ${abhijitSuffix}`,
    rahuWindow: rahuStr,
    gulikaWindow: gulikaStr,
    yamaWindow: yamaStr,
    abhijitWindow: abhijitStr,
    rahuSuffix,
    gulikaSuffix,
    yamaSuffix,
    abhijitSuffix,
    pincodeUsed: pincode || "581326",
    latUsed: lat,
    lngUsed: lng,
    tzLabel: "IST"
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
  const detailedTithi = getDetailedTithiInfo(targetUtc, "lahiri", targetUtc);
  const longs = siderealLongitudes(targetUtc, "lahiri");
  const moonLong = longs.moon;

  // Transit Nakshatra & Rashi from Moon sidereal longitude
  const transitNak = Math.floor(moonLong / (360 / 27)) % 27;
  const transitRashi = Math.floor(moonLong / 30) % 12;

  // Sunrise Tithi
  const tithiNumber = detailedTithi.tithiNumber;
  const tithiInPaksha = detailedTithi.tithiInPaksha;
  const paksha: "shukla" | "krishna" = detailedTithi.paksha;

  // Majority Tithi governing the day's waking rhythm
  const majorityTithiNumber = detailedTithi.majorityTithiNumber;
  const majorityTithiInPaksha = detailedTithi.majorityTithiInPaksha;
  const majorityPaksha: "shukla" | "krishna" = detailedTithi.majorityPaksha;

  // Special Vrata determinations using majority Tithi
  const isAmavasya = majorityTithiNumber === 30;
  const isPurnima = majorityTithiNumber === 15;
  const isEkadashi = majorityTithiInPaksha === 11;
  const isPradosha = majorityTithiInPaksha === 13;
  const isSankashti = majorityPaksha === "krishna" && majorityTithiInPaksha === 4;

  const taraVal = (((transitNak - birthNakIdx + 27) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  const isTaraFav = [2, 4, 6, 8, 9].includes(taraVal);
  const isDifficultTara = [3, 5, 7].includes(taraVal);

  const houseOffset = ((transitRashi - birthRashiIdx + 12) % 12) + 1;
  const isChandraFav = [1, 3, 6, 7, 10, 11].includes(houseOffset);
  const isChandrashtamaDay = houseOffset === 8;

  // Rikta Tithi check on Majority Tithi
  const isMajorityRikta = [4, 9, 14].includes(majorityTithiInPaksha);

  let baseScore = (isTaraFav ? 45 : isDifficultTara ? 15 : 25) + (isChandraFav ? 40 : 15) + (isChandrashtamaDay ? -25 : 5);
  if (isMajorityRikta) baseScore -= 8;
  if (isPurnima || isEkadashi) baseScore += 5;

  const scoreVal = Math.max(15, Math.min(98, baseScore));
  const bandType: "high" | "steady" | "rest" = (isChandrashtamaDay || scoreVal < 50) ? "rest" : (isTaraFav && isChandraFav && scoreVal >= 70) ? "high" : "steady";

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
  const luckyColour = colorKeys[(weekday + (isTaraFav ? 1 : 0) + (isChandraFav ? 2 : 0) + (isPurnima ? 3 : 0)) % 7] || "yellow";

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
    janmaNakshatraIndex: birthNakIdx,
    janmaRashiIndex: birthRashiIdx,
    tithiNumber,
    tithiInPaksha,
    paksha,
    majorityTithiNumber,
    majorityTithiInPaksha,
    majorityPaksha,
    detailedTithi,
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
  days?: RhythmDay[];
  lang: string;
  panditName?: string;
  priestName?: string;
  priestPhone?: string;
  overrideCalendarPhone?: boolean;
  notificationTime?: string;
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  birthNakshatraIndex?: number;
  birthRashiIndex?: number;
  gotra?: string;
  daysCount?: number;
  startDateStr?: string;
  dob?: string;
  tob?: string;
  aiPanchangaMap?: Record<string, DayPanchangaAiItem>;
  includePriestCalendar?: boolean;
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
  const count = (options as any).daysCount || (options.days?.length) || 90;
  const startStr = (options as any).startDateStr || (options.days?.[0]?.ymd) || new Date().toISOString().slice(0, 10);
  const nakIdx = options.birthNakshatraIndex ?? (options.days?.[0]?.moonNakshatraIndex) ?? 12;
  const rashiIdx = options.birthRashiIndex ?? (options.days?.[0]?.moonRashiIndex) ?? 5;

  if (!options.days || options.days.length === 0) {
    const dObj = new Date(startStr);
    options.days = Array.from({ length: count }, (_, i) => {
      const cur = new Date(dObj.getTime() + i * 86400000);
      const ymd = cur.toISOString().slice(0, 10);
      return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx, startStr);
    });
  }

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

  let {
    days,
    lang,
    panditName = options.priestName || "Shreeram Pandit",
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

  if (pincode && /^\d{6}$/.test(pincode.trim())) {
    const pinCoords = resolvePincodeCoordinatesSync(pincode.trim(), lat, lng);
    if (pincode.trim() !== "581326" && Math.abs(lat - 14.54) < 0.05) {
      lat = pinCoords.lat;
      lng = pinCoords.lng;
    }
  }

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
  const localizedPandit = getLocalizedPanditName(panditName, lang);
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : labels.defaultDevotee;

  const resolvedBirth = getUniversalBirthDetails({
    dob,
    tob,
    name: devoteeDisplayName,
    nakshatraIndex: birthNakshatraIndex,
    rashiIndex: birthRashiIndex
  });
  const resolvedDob = resolvedBirth.dob;
  const resolvedTob = resolvedBirth.tob;

  const birthNakIdx = birthNakshatraIndex ?? (days[0] as any)?.janmaNakshatraIndex ?? (dob ? resolvedBirth.nakshatraIndex : undefined) ?? days[0]?.moonNakshatraIndex ?? resolvedBirth.nakshatraIndex ?? 18;
  const birthRashiIdx = birthRashiIndex ?? (days[0] as any)?.janmaRashiIndex ?? (dob ? resolvedBirth.rashiIndex : undefined) ?? days[0]?.moonRashiIndex ?? resolvedBirth.rashiIndex ?? 8;

  const isDateOnlyMode = Boolean((options as any).isDateOnly || (!resolvedTob && Boolean(resolvedDob)));
  const tokenEncoder = isDateOnlyMode ? encodeDateOnlyDevoteeToken : encodeDevoteeToken;

  const baseToken = tokenEncoder({
    n: devoteeDisplayName,
    nk: birthNakIdx,
    r: birthRashiIdx,
    p: localizedPandit,
    d: startDateStr,
    startDate: startDateStr,
    sd: startDateStr,
    days: 90,
    dy: 90,
    l: lang,
    tm: notificationTime,
    pc: pincode,
    lt: lat,
    lg: lng,
    loc: locationName,
    dob: resolvedDob,
    tob: resolvedTob,
    ph: options.overrideCalendarPhone ? options.priestPhone : undefined,
    ocp: options.overrideCalendarPhone ? 1 : undefined
  });
  const sanitizedDevoteeToken = baseToken.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  const scheduledEveAlerts = new Set<string>();
  const lastSeenVrataIndexMap = new Map<string, number>();

  // Enforce zero duplicate dates across the 90-day calendar
  const seenDaysYmd = new Set<string>();
  const uniqueDays = days.filter((rawDay) => {
    if (!rawDay.ymd) return false;
    if (seenDaysYmd.has(rawDay.ymd)) return false;
    seenDaysYmd.add(rawDay.ymd);
    return true;
  });

  // Mandatory Parity Guard: Normalize every single day in the calendar to use
  // calculateDeterministicRhythmDay so that calendar events and DailyDarshanaPage.tsx
  // match 100% identically across energy score, band, and color vibe.
  const alignedDays = uniqueDays.map((rawDay) => {
    if (rawDay.band && rawDay.energyScore && rawDay.tara && rawDay.chandra && uniqueDays.length < 5) {
      return rawDay;
    }
    const detDay = calculateDeterministicRhythmDay(rawDay.ymd, birthNakIdx, birthRashiIdx, startDateStr);
    return {
      ...rawDay,
      ...detDay,
      energyScore: detDay.energyScore,
      band: detDay.band,
      tara: detDay.tara,
      chandra: detDay.chandra,
      isChandrashtama: detDay.isChandrashtama
    };
  });

  alignedDays.forEach((day, idx) => {
    const ymdCompact = formatYmdCompact(day.ymd);
    const dayUid = `baggona-day-${ymdCompact}-${sanitizedDevoteeToken}@baggona.app`;
    const dtStart = `${ymdCompact}T${hh}${mm}00`;
    
    const endMinutes = (parseInt(mm, 10) + 30) % 60;
    const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
    const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

    const vibe = getEnergyMeterAndVibe(day, lang);

    const dayToken = tokenEncoder({
      n: devoteeDisplayName,
      nk: birthNakIdx,
      r: birthRashiIdx,
      p: localizedPandit,
      d: day.ymd,
      startDate: startDateStr,
      sd: startDateStr,
      days: days.length > 0 ? days.length : 90,
      dy: days.length > 0 ? days.length : 90,
      l: lang,
      tm: notificationTime,
      pc: pincode,
      lt: lat,
      lg: lng,
      loc: locationName,
      dob: resolvedDob,
      tob: resolvedTob,
      ph: options.overrideCalendarPhone ? options.priestPhone : undefined,
      ocp: options.overrideCalendarPhone ? 1 : undefined,
      pp: options.overrideCalendarPhone ? options.priestPhone : undefined
    });
    const contactOverrideQuery = options.overrideCalendarPhone && options.priestPhone
      ? `&overrideContact=true&priestPhone=${encodeURIComponent(options.priestPhone)}&priestName=${encodeURIComponent(localizedPandit)}`
      : "";
    const sanctumUrl = `${origin}/daily?token=${dayToken}&date=${day.ymd}&sd=${startDateStr}&lang=${lang}&tab=bhavishya${contactOverrideQuery}`;

    const aiItem = aiPanchangaMap?.[day.ymd];
    // Canonical Drik Ganita Udaya Tithi at 06:00 AM IST from day ensures 100% parity with DailyDarshanaPage web sanctum links
    const pakshaStr = pakshaLabel(day, lang);
    const tithiOnlyStr = tithiOnlyLabel(day, lang);
    const tithiFullStr = tithiLabel(day, lang);
    const nakName = nakshatraName(day.moonNakshatraIndex, lang as SevaLang);

    // Detect Special Vrata (Amavasya, Ekadashi, Sankashti, Purnima, Festivals) with strict deduplication
    const vrata = detectSpecialVrata(day.ymd, lang);
    const vrataKey = `${vrata.category}_${vrata.vrataName}`;
    const lastSeenIdx = lastSeenVrataIndexMap.get(vrataKey);
    // For FESTIVAL: strictly once across the entire calendar.
    // For regular monthly Vratas: only trigger if not triggered within the last 10 days (prevents consecutive-day duplicate triggers).
    const isNewVrataDay = vrata.isSpecial && (
      vrata.category === "FESTIVAL"
        ? lastSeenIdx === undefined
        : (lastSeenIdx === undefined || (idx - lastSeenIdx) > 10)
    );
    if (vrata.isSpecial && isNewVrataDay) {
      lastSeenVrataIndexMap.set(vrataKey, idx);
    }

    const summaryPrefix = isNewVrataDay
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

    const tithiDetailInfo = (day as any).detailedTithi as DetailedTithiInfo | undefined;
    const tithiTransitionLine = tithiDetailInfo?.transitionSummary?.[lang] || (
      tithiDetailInfo?.tithiEndTimeStr
        ? `${tithiFullStr} (till ${tithiDetailInfo.tithiEndTimeStr}), then ${tithiDetailInfo.nextTithiFullLabel?.[lang] || 'Next Tithi'}`
        : tithiFullStr
    );

    const energyMeaning = getEnergyIndicatorMeaning(day, lang);

    const isKn = lang.startsWith("kn");
    const isHi = lang.startsWith("hi");
    const isTe = lang.startsWith("te");
    const isTa = lang.startsWith("ta");

    const openSanctumPrompt = isKn
      ? "👉 ನೇರ ಲೈವ್ ದರ್ಶನ ಪಡೆಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಒತ್ತಿ (CLICK TO OPEN):"
      : isHi
      ? "👉 सीधे लाइव दर्शन के लिए नीचे दिए लिंक पर क्लिक करें (CLICK TO OPEN):"
      : isTe
      ? "👉 ప్రత్యక్ష దర్శనం కోసం క్రింది లింక్ క్లిక్ చేయండి (CLICK TO OPEN):"
      : isTa
      ? "👉 நேரடி தரிசனத்திற்கு கீழே உள்ள இணைப்பை கிளிக் செய்யவும் (CLICK TO OPEN):"
      : "👉 Click the link below to open Live Darshana:";

    const closingBlessing = isKn ? "✨ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು ✨" : isHi ? "✨ श्री महाबलेश्वर प्रसाद सिद्धिरस्तु ✨" : isTe ? "✨ శ్రీ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు ✨" : isTa ? "✨ ஸ்ரீ மகாபலேஸ்வரர் பிரசாத சித்திரஸ்து ✨" : "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨";
    const viewBhavishyaButtonLabel = isKn ? "🔮 ಇಂದಿನ ದಿನ ಭವಿಷ್ಯವನ್ನು ವೀಕ್ಷಿಸಿ" : isHi ? "🔮 आज का दिन भविष्य देखें" : isTe ? "🔮 నేటి దిన భవిష్యత్తును వీక్షించండి" : isTa ? "🔮 இன்றைய தின பலனைப் பார்க்க" : "🔮 View Today's Daily Horoscope";

    const descriptionParts: string[] = [
      `🔮 ${viewBhavishyaButtonLabel}:`,
      "",
      sanctumUrl,
      "",
      "════════════════════════════════════════",
      `🕉️ ${labels.panchangaTitle} - ${labels.kshetraTitle}`,
      `👤 ${labels.devoteeLabel}: ${devoteeDisplayName}`,
      `🙏 ${labels.priestLabel}: ${localizedPandit}`,
      "════════════════════════════════════════",
      "",
      `🌅 ${labels.sunriseLabel} / ${labels.sunsetLabel} (📍 ${locationName} - ${pincode}):`,
      `• 🌅 ${labels.sunriseLabel}: ${kaala.sunrise}`,
      `• 🌇 ${labels.sunsetLabel}: ${kaala.sunset}`,
      "",
      `⏳ ${isKn ? "ದೈನಂದಿನ ಕಾಲಗಳು (ಭಾರತೀಯ ಕಾಲಮಾನ - IST)" : isHi ? "दैनिक काल (भारतीय मानक समय - IST)" : isTe ? "దైనందిన కాలాలు (భారతీయ ప్రామాణిక సమయం - IST)" : isTa ? "தினசரி காலங்கள் (இந்திய நேரப்படி - IST)" : "Daily Kaala Timings (Indian Standard Time - IST)"}:`,
      `• 🔴 ${labels.rahuLabel} (IST): ${kaala.rahu}`,
      `• 🟡 ${labels.gulikaLabel} (IST): ${kaala.gulika}`,
      `• 🟢 ${labels.yamagandaLabel} (IST): ${kaala.yamaganda}`,
      "",
      `🕉️ ${isKn ? "ಪಂಚಾಂಗ & ಜ್ಯೋತಿಷ್ಯ ಮುಖ್ಯಾಂಶಗಳು" : isHi ? "पंचांग व ज्योतिष मुख्य बिंदु" : isTe ? "పంచాంగం & జ్యోతిష్య ముఖ్యాంశాలు" : isTa ? "பஞ்சாங்கம் & ஜோதிட அம்சங்கள்" : "Panchanga & Astrological Highlights"}:`,
      `• 📅 ${labels.tithiLabel}: ${tithiFullStr}`,
      `• 🌙 ${labels.rashiLabel}: ${rashiStr}`,
      `• ⭐ ${labels.nakshatraLabel}: ${nakName}`,
      `• 🎯 ${labels.taraLabel}: ${taraBalaStr}`,
      `• 🌙 ${labels.chandraLabel}: ${chandraBalaStr}`,
      `• ⚡ ${labels.statusLabel}: ${vibe.badgeText} (${day.energyScore || 85}%)`,
      `• ✨ ${labels.vibeTagLabel}: ${vibe.vibeTag}`,
      `• 🔢 ${labels.luckyNumberLabel}: ${luckyNumsStr}`,
      `• 🎨 ${labels.luckyColorLabel}: ${localizedColor}`,
      `• 🧭 ${labels.luckyDirectionLabel}: ${localizedDirection}`,
      "",
      `🛕 ${labels.deityLabel}: ${pick(deity.deityL5, lang) || deity.deity}`,
      `📜 ${labels.mantraLabel}: "${deity.mantra}"`
    ];

    if (options.includePriestCalendar) {
      try {
        const priestDossier = generatePriestDayDossier(day.ymd, lat, lng, pincode);
        const priestPortalUrl = `${origin}/priest-panchanga?date=${day.ymd}&pincode=${pincode}`;
        descriptionParts.push(
          "",
          "────────────────────────────────────────",
          `👑 ಪುರೋಹಿತ ಪಂಚಾಂಗ ವಿವರಗಳು (PRIEST DOSSIER)`,
          `• ಶ್ರಾದ್ಧ ತಿಥಿ: ${priestDossier.shraddhaTithi}`,
          `• ತಿಥಿ ಅಂತ್ಯ: ${priestDossier.tithiEndTime} | ನಕ್ಷತ್ರ ಅಂತ್ಯ: ${priestDossier.nakshatraEndTime}`,
          `• ದಿನಪ್ರಮಾಣ: ${priestDossier.dinapramana} (ವಿಷ: ${priestDossier.vishaGhati} | ಅಮೃತ: ${priestDossier.amritaGhati})`,
          `• ೧೨ ದಿನ ಲಗ್ನ ಅಂತ್ಯಗಳು:`,
          `  ಮೀನ: ${priestDossier.lagnaEndingTimes.meena} | ಮೇಷ: ${priestDossier.lagnaEndingTimes.mesha} | ವೃಷಭ: ${priestDossier.lagnaEndingTimes.vrishabha} | ಮಿಥುನ: ${priestDossier.lagnaEndingTimes.mithuna}`,
          `  ಕರ್ಕ: ${priestDossier.lagnaEndingTimes.karkataka} | ಸಿಂಹ: ${priestDossier.lagnaEndingTimes.simha} | ಕನ್ಯಾ: ${priestDossier.lagnaEndingTimes.kanya} | ತುಲಾ: ${priestDossier.lagnaEndingTimes.tula}`,
          `  ವೃಶ್ಚಿಕ: ${priestDossier.lagnaEndingTimes.vrischika} | ಧನು: ${priestDossier.lagnaEndingTimes.dhanu} | ಮಕರ: ${priestDossier.lagnaEndingTimes.makara} | ಕುಂಭ: ${priestDossier.lagnaEndingTimes.kumbha}`
        );
        if (priestDossier.priestDutyNotes && priestDossier.priestDutyNotes.length > 0) {
          descriptionParts.push(`• ಕರ್ಮಾನುಷ್ಠಾನ ಮುಹೂರ್ತ: ${priestDossier.priestDutyNotes[0]}`);
        }
        descriptionParts.push(`• ಲೈವ್ ಪೋರ್ಟಲ್: ${priestPortalUrl}`);
      } catch (err) {
        console.warn("[ICSCalendarGenerator] Priest dossier generation warning:", err);
      }
    }

    if (vrata.isSpecial && isNewVrataDay) {
      const fastingLabel = lang === "kn" ? "ಉಪವಾಸ ನಿಯಮ" : lang === "hi" ? "उपवास नियम" : lang === "te" ? "ఉపవాస నిబంధనలు" : lang === "ta" ? "விரத விதிமுறை" : "Fasting Advice";
      const specialMantraLabel = lang === "kn" ? "ವಿಶೇಷ ಮಂತ್ರ" : lang === "hi" ? "विशेष मंत्र" : lang === "te" ? "ప్రత్యేక మంత్రం" : lang === "ta" ? "சிறப்பு மந்திரம்" : "Special Mantra";

      descriptionParts.push(
        "",
        "────────────────────────────────────────",
        `🔔 ${vrata.vrataName}`,
        `📜 ${vrata.sameDayNotice}`,
        `🍽️ ${fastingLabel}: ${vrata.fastingAdvice}`,
        `🕉️ ${specialMantraLabel}: ${vrata.mantra}`
      );
    }

    const prevAlert = getPreviousDayPreparationAlert(day.ymd);
    if (prevAlert) {
      descriptionParts.push("", `🔔 ${prevAlert}`);
    }

    descriptionParts.push(
      "",
      "════════════════════════════════════════",
      `🔮 ${viewBhavishyaButtonLabel}:`,
      `👉 ${sanctumUrl}`,
      "════════════════════════════════════════",
      "",
      `✨ ${closingBlessing} ✨`
    );

    const descriptionStr = descriptionParts.join("\n");
    const htmlTithiVal = tithiDetailInfo?.tithiEndTimeStr 
      ? `${tithiFullStr} <span style="font-size:11px; color:#fde68a;">(${tithiDetailInfo.tithiEndTimeStr} ${lang === "kn" ? "ರವರೆಗೆ" : "till"}, ${lang === "kn" ? "ನಂತರ" : "then"}: ${tithiDetailInfo.nextTithiFullLabel?.[lang] || ''})</span>`
      : tithiFullStr;

    const htmlDescriptionStr = `<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#1c0a00;color:#fff8e7;padding:12px;margin:0;"><div style="background:linear-gradient(135deg,#451a03 0%,#1c0a00 100%);border:2px solid #d97706;border-radius:14px;padding:16px;max-width:540px;margin:0 auto;box-shadow:0 8px 24px rgba(0,0,0,0.6);"><div style="text-align:center;margin-bottom:14px;padding:12px;background:linear-gradient(135deg,rgba(217,119,6,0.25) 0%,rgba(120,53,15,0.35) 100%);border:1.5px solid #f59e0b;border-radius:10px;"><div style="color:#fde68a;font-weight:800;font-size:11px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">✨ ${labels.kshetraTitle} · ${labels.panchangaTitle}</div><a href="${sanctumUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#1c0a00;text-decoration:none;padding:11px 22px;border-radius:9px;font-weight:900;font-size:14px;box-shadow:0 4px 12px rgba(217,119,6,0.4);border:1.5px solid #fde68a;">${viewBhavishyaButtonLabel}</a></div><div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:10px 12px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11px;"><span style="font-weight:800;color:#fde68a;text-transform:uppercase;">🌅 ${labels.sunriseLabel} / ${labels.sunsetLabel}</span><span style="color:#f59e0b;font-weight:700;">📍 ${locationName} (${pincode})</span></div><table style="width:100%;border-collapse:collapse;font-size:12.5px;"><tr><td style="width:50%;padding:4px 6px;background:rgba(0,0,0,0.3);border-radius:6px;text-align:center;"><span style="color:#fcd34d;font-size:11px;">🌅 ${labels.sunriseLabel}:</span> <strong style="color:#ffffff;">${kaala.sunrise}</strong></td><td style="width:50%;padding:4px 6px;background:rgba(0,0,0,0.3);border-radius:6px;text-align:center;"><span style="color:#fcd34d;font-size:11px;">🌇 ${labels.sunsetLabel}:</span> <strong style="color:#ffffff;">${kaala.sunset}</strong></td></tr></table></div><div style="background:rgba(0,0,0,0.25);border:1px solid rgba(212,175,55,0.3);border-radius:10px;padding:10px 12px;margin-bottom:12px;"><div style="font-size:11px;font-weight:800;color:#fde68a;margin-bottom:6px;text-transform:uppercase;display:flex;justify-content:space-between;"><span>⏳ ${isKn ? "ದೈನಂದಿನ ಕಾಲಗಳು" : isHi ? "दैनिक काल" : isTe ? "దైనందిన కాలాలు" : isTa ? "தினசரி காலங்கள்" : "Daily Timings"}</span><span style="color:#10b981;font-weight:800;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:4px;padding:1px 5px;font-size:10px;">🇮🇳 IST (+05:30)</span></div><table style="width:100%;border-collapse:collapse;font-size:12px;"><tr style="border-bottom:1px solid rgba(245,158,11,0.2);"><td style="padding:4px 2px;color:#fca5a5;font-weight:700;width:38%;">🔴 ${labels.rahuLabel} (IST):</td><td style="padding:4px 2px;color:#ffffff;font-weight:700;">${kaala.rahu}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.2);"><td style="padding:4px 2px;color:#fde047;font-weight:700;">🟡 ${labels.gulikaLabel} (IST):</td><td style="padding:4px 2px;color:#ffffff;font-weight:700;">${kaala.gulika}</td></tr><tr><td style="padding:4px 2px;color:#86efac;font-weight:700;">🟢 ${labels.yamagandaLabel} (IST):</td><td style="padding:4px 2px;color:#ffffff;font-weight:700;">${kaala.yamaganda}</td></tr></table></div><div style="background:rgba(0,0,0,0.25);border:1px solid rgba(212,175,55,0.3);border-radius:10px;padding:10px 12px;margin-bottom:12px;"><div style="font-size:11px;font-weight:800;color:#fde68a;margin-bottom:6px;text-transform:uppercase;">🕉️ ${labels.panchangaTitle}</div><table style="width:100%;border-collapse:collapse;font-size:12px;"><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;width:38%;">👤 ${labels.devoteeLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${devoteeDisplayName}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">🙏 ${labels.priestLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${localizedPandit}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">📅 ${labels.tithiLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${htmlTithiVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">🌙 ${labels.rashiLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${rashiStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">⭐ ${labels.nakshatraLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${nakName}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">🎯 ${labels.taraLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${taraBalaStr}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.15);"><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">🌙 ${labels.chandraLabel}:</td><td style="padding:3px 2px;color:#fff8e7;">${chandraBalaStr}</td></tr><tr><td style="padding:3px 2px;color:#f59e0b;font-weight:700;">⚡ ${labels.statusLabel}:</td><td style="padding:3px 2px;color:#fde68a;font-weight:800;">${vibe.badgeText} (${day.energyScore || 85}%)</td></tr></table></div><div style="background:linear-gradient(135deg,rgba(120,53,15,0.3) 0%,rgba(69,26,3,0.3) 100%);border:1px solid #f59e0b;border-radius:10px;padding:8px 12px;text-align:center;margin-bottom:12px;"><div style="font-size:11px;color:#fde68a;font-weight:800;">🛕 ${labels.deityLabel}: ${pick(deity.deityL5, lang) || deity.deity}</div><div style="font-size:12px;color:#ffffff;font-family:serif;margin-top:2px;">"${deity.mantra}"</div></div><div style="text-align:center;padding:6px 0;"><a href="${sanctumUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#1c0a00;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:900;font-size:13px;box-shadow:0 4px 10px rgba(217,119,6,0.3);border:1px solid #fde68a;">${viewBhavishyaButtonLabel}</a><div style="color:#d97706;font-size:11px;margin-top:8px;font-weight:700;">${closingBlessing} · ${localizedPandit}</div></div></div></body></html>`;

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
      `X-ALT-DESC;FMTTYPE=text/html:${escapeIcsHtml(htmlDescriptionStr)}`,
      `ATTACH;FMTTYPE=image/jpeg:${origin}/calendar_event_flair.jpg`,
      `IMAGE;VALUE=URI:${origin}/calendar_event_flair.jpg`,
      `X-MICROSOFT-IMAGE;VALUE=URI:${origin}/calendar_event_flair.jpg`,
      `X-GOOGLE-CALENDAR-EVENT-FLAIR:${origin}/calendar_event_flair.jpg`,
      `URL;VALUE=URI:${sanctumUrl}`,
      `URL:${sanctumUrl}`,
      `LOCATION:${sanctumUrl}`,
      "PRIORITY:1",
      "X-MICROSOFT-CDO-IMPORTANCE:2",
      "X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC",
      `COLOR:${vibe.icalColor}`,
      `X-GOOGLE-CALENDAR-COLOR:${vibe.googleColorId}`,
      "CATEGORIES:Temple,Puja,Pooja,Astrology,Worship,Daily Ritual,Gokarna Kshetra,Baggona Panchanga",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:AUDIO",
      "ATTACH;VALUE=URI:PresetSound#Bells",
      "ATTACH;VALUE=URI:sound:bell",
      "ATTACH;VALUE=URI:PresetSound#Alarm",
      "X-APPLE-DEFAULT-ALARM:TRUE",
      "X-APPLE-LOCAL-DEFAULT-ALARM:TRUE",
      `DESCRIPTION:${escapeIcsText(`🔔 ಗಂಟಾನಾದ & ದರ್ಶನ: ${summaryStr}`)}`,
      "TRIGGER:-PT0M",
      "REPEAT:2",
      "DURATION:PT2M",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(`🔔 ದೈನಂದಿನ ದರ್ಶನ: ${summaryStr}`)}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(`🔔 ಮುಂಜಾನೆ ಪಂಚಾಂಗ ಜ್ಞಾಪನೆ: ${summaryStr}`)}`,
      "TRIGGER:-PT15M",
      "END:VALARM",
      "END:VEVENT"
    ];

    lines.push(...eventLines);

    // If day is a Special Vrata (Amavasya, Ekadashi, Sankashti, Purnima, Festival),
    // add EXACTLY ONE 1-Day Prior Previous Evening Eve Alert Event at 20:00 (8:00 PM IST)
    if (vrata.isSpecial && isNewVrataDay) {
      const prevDate = new Date(new Date(day.ymd).getTime() - 86400000);
      const prevYmd = prevDate.toISOString().slice(0, 10);
      const prevYmdCompact = formatYmdCompact(prevYmd);
      const eveKey = `${prevYmdCompact}_${vrata.category}_${vrata.vrataName}`;

      if (!scheduledEveAlerts.has(eveKey)) {
        scheduledEveAlerts.add(eveKey);
        const eveUid = `baggona-eve-${prevYmdCompact}-${vrata.category.toLowerCase()}-${sanitizedDevoteeToken}@baggona.app`;
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
        `DESCRIPTION:${escapeIcsText(`${vrata.eveAlertSummary}\n\nFasting Advice: ${vrata.fastingAdvice}\nSpecial Mantra: ${vrata.mantra}\n\n${sanctumUrl}`)}`,
        `ATTACH;FMTTYPE=image/jpeg:${origin}/calendar_event_flair.jpg`,
        `URL;VALUE=URI:${sanctumUrl}`,
        `URL:${sanctumUrl}`,
        `LOCATION:${sanctumUrl}`,
        "PRIORITY:1",
        "COLOR:#d97706",
        "X-GOOGLE-CALENDAR-COLOR:6",
        "CATEGORIES:Vrata,Special Day,Eve Alert,Baggona Panchanga",
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "ACTION:AUDIO",
        "ATTACH;VALUE=URI:PresetSound#Bells",
        "ATTACH;VALUE=URI:sound:bell",
        "X-APPLE-DEFAULT-ALARM:TRUE",
        `DESCRIPTION:${escapeIcsText(vrata.eveAlertTitle)}`,
        "TRIGGER:-PT0M",
        "END:VALARM",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcsText(vrata.eveAlertTitle)}`,
        "TRIGGER:-PT15M",
        "END:VALARM",
        "END:VEVENT"
      ];
        lines.push(...eveLines);
      }
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
  priestPhone?: string;
  overrideCalendarPhone?: boolean;
  notificationTime?: string;
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  dob?: string;
  tob?: string;
  birthNakshatraIndex?: number;
  birthRashiIndex?: number;
  aiPanchangaMap?: Record<string, DayPanchangaAiItem>;
  includePriestCalendar?: boolean;
}): string {
  const {
    day: singleDay,
    days,
    lang,
    panditName,
    notificationTime = "06:00",
    personName,
    webAppBaseUrl,
    pincode = "581326",
    lat = 14.54,
    lng = 74.31,
    locationName = "Gokarna",
    dob,
    tob,
    birthNakshatraIndex,
    birthRashiIndex,
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

  const isKn = lang.startsWith("kn");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");

  const localizedPandit = getLocalizedPanditName(panditName, lang);
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : (isKn ? "ಭಕ್ತರು" : "Devotee");

  const resolvedBirth = getUniversalBirthDetails({
    dob,
    tob,
    name: devoteeDisplayName,
    nakshatraIndex: birthNakshatraIndex,
    rashiIndex: birthRashiIndex
  });
  const birthNakIdx = birthNakshatraIndex ?? resolvedBirth.nakshatraIndex ?? (day as any)?.janmaNakshatraIndex ?? 18;
  const birthRashiIdx = birthRashiIndex ?? resolvedBirth.rashiIndex ?? (day as any)?.janmaRashiIndex ?? 8;

  // Single source of truth calculation
  const deterministicDay = calculateDeterministicRhythmDay(day.ymd, birthNakIdx, birthRashiIdx, day.ymd);
  const activeDay = {
    ...day,
    ...deterministicDay,
    energyScore: deterministicDay.energyScore,
    band: deterministicDay.band,
    tara: deterministicDay.tara,
    chandra: deterministicDay.chandra,
    isChandrashtama: deterministicDay.isChandrashtama
  };

  const vibe = getEnergyMeterAndVibe(activeDay, lang);
  const kaalaRaw = getDailyKaalaTimings(activeDay.dayLord, lang, activeDay.ymd, lat, lng, pincode);
  const aiItem = aiPanchangaMap?.[activeDay.ymd];
  const kaala = {
    sunrise: aiItem?.suryodaya || kaalaRaw.sunrise,
    sunset: aiItem?.suryasta || kaalaRaw.sunset,
    rahu: aiItem?.rahuKaala || kaalaRaw.rahu,
    gulika: aiItem?.gulikaKaala || kaalaRaw.gulika,
    yamaganda: aiItem?.yamagandaKaala || kaalaRaw.yamaganda
  };
  const dayIdx = getDayLordIndex(activeDay.dayLord);
  const deity = DEITY_MANTRAS[dayIdx] || DEITY_MANTRAS[0];

  const startDateStr = (days && days.length > 0 ? days[0].ymd : day.ymd) || new Date().toISOString().slice(0, 10);

  const devoteeToken = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: birthNakIdx,
    r: birthRashiIdx,
    p: localizedPandit,
    d: startDateStr,
    startDate: startDateStr,
    sd: startDateStr,
    days: 90,
    dy: 90,
    l: lang,
    tm: notificationTime,
    pl: "android",
    t: "google",
    pc: pincode,
    lt: lat,
    lg: lng,
    loc: locationName,
    dob: resolvedBirth.dob,
    tob: resolvedBirth.tob,
    ph: options.overrideCalendarPhone ? options.priestPhone : undefined,
    ocp: options.overrideCalendarPhone ? 1 : undefined,
    pp: options.overrideCalendarPhone ? options.priestPhone : undefined
  });
  const origin = getSafeProductionOrigin(webAppBaseUrl);
  const contactOverrideQuery = options.overrideCalendarPhone && options.priestPhone
    ? `&overrideContact=true&priestPhone=${encodeURIComponent(options.priestPhone)}&priestName=${encodeURIComponent(localizedPandit)}`
    : "";
  const sanctumUrl = `${origin}/daily?token=${devoteeToken}&date=${day.ymd}&sd=${startDateStr}&lang=${lang}&tab=bhavishya${contactOverrideQuery}`;

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

  const energyMeaning = getEnergyIndicatorMeaning(day, lang);

  const directTapLabel = isKn
    ? "👉 ನೇರ ಲೈವ್ ದರ್ಶನ ಪಡೆಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಒತ್ತಿ:"
    : isHi
    ? "👉 सीधे लाइव दर्शन के लिए नीचे दिए लिंक पर क्लिक करें:"
    : isTe
    ? "👉 ప్రత్యక్ష దర్శనం కొరకు క్రింది లింక్‌పై క్లిక్ చేయండి:"
    : isTa
    ? "👉 நேரடி தரிசனத்திற்கு கீழே உள்ள இணைப்பை கிளிக் செய்யவும்:"
    : "👉 Click the link below to enter Live Darshana:";

  const openActionText = isKn
    ? "ಲೈವ್ ದರ್ಶನ ಹಾಗೂ ಇಂದಿನ ಪಂಚಾಂಗ (Live Sanctum)"
    : isHi
    ? "लाइव दर्शन एवं दैनिक पंचांग (Live Sanctum)"
    : isTe
    ? "ప్రత్యక్ష దర్శనం & నేటి పంచాంగం (Live Sanctum)"
    : isTa
    ? "நேரலை தரிசனம் & தினசரி பஞ்சாங்கம் (Live Sanctum)"
    : "Open Live Darshana & Daily Panchanga";

  const viewBhavishyaButtonLabel = isKn
    ? "🔮 ಇಂದಿನ ದಿನ ಭವಿಷ್ಯವನ್ನು ವೀಕ್ಷಿಸಿ"
    : isHi
    ? "🔮 आज का दिन भविष्य देखें"
    : isTe
    ? "🔮 నేటి దిన భవిష్యత్తును వీక్షించండి"
    : isTa
    ? "🔮 இன்றைய தின பலனைப் பார்க்க"
    : "🔮 View Today's Daily Horoscope";

  const closingBlessing = isKn ? "✨ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು ✨" : isHi ? "✨ श्री महाबलेश्वर प्रसाद सिद्धिरस्तु ✨" : isTe ? "✨ శ్రీ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు ✨" : isTa ? "✨ ஸ்ரீ மகாபலேஸ்வரர் பிரசாத சித்திரஸ்து ✨" : "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨";

  const details = [
    `🔮 ${viewBhavishyaButtonLabel}:`,
    `👉 ${sanctumUrl}`,
    "",
    "════════════════════════════════════════",
    `🕉️ ${labels.panchangaTitle} - ${labels.kshetraTitle}`,
    `👤 ${labels.devoteeLabel}: ${devoteeDisplayName}`,
    `🙏 ${labels.priestLabel}: ${localizedPandit}`,
    "════════════════════════════════════════",
    "",
    `🌅 ${labels.sunriseLabel} / ${labels.sunsetLabel} (📍 ${locationName} - ${pincode}):`,
    `• 🌅 ${labels.sunriseLabel}: ${kaala.sunrise}`,
    `• 🌇 ${labels.sunsetLabel}: ${kaala.sunset}`,
    "",
    `⏳ ${isKn ? "ದೈನಂದಿನ ಕಾಲಗಳು (ಭಾರತೀಯ ಕಾಲಮಾನ - IST)" : isHi ? "दैनिक काल (भारतीय मानक समय - IST)" : isTe ? "దైనందిన కాలాలు (భారతీయ ప్రామాణిక సమయం - IST)" : isTa ? "தினசரி காலங்கள் (இந்திய நேரப்படி - IST)" : "Daily Kaala Timings (Indian Standard Time - IST)"}:`,
    `• 🔴 ${labels.rahuLabel} (IST): ${kaala.rahu}`,
    `• 🟡 ${labels.gulikaLabel} (IST): ${kaala.gulika}`,
    `• 🟢 ${labels.yamagandaLabel} (IST): ${kaala.yamaganda}`,
    "",
    `🕉️ ${isKn ? "ಪಂಚಾಂಗ & ಜ್ಯೋತಿಷ್ಯ ಮುಖ್ಯಾಂಶಗಳು" : isHi ? "पंचांग व ज्योतिष मुख्य बिंदु" : isTe ? "పంచాంగం & జ్యోతిష్య ముఖ్యాంశాలు" : isTa ? "பஞ்சாங்கம் & ஜோதிட அம்சங்கள்" : "Panchanga & Astrological Highlights"}:`,
    `• 📅 ${labels.tithiLabel}: ${tithiLabel(day, lang)}`,
    `• 🌙 ${labels.rashiLabel}: ${rashiStr}`,
    `• ⭐ ${labels.nakshatraLabel}: ${nakName}`,
    `• 🎯 ${labels.taraLabel}: ${taraInfo}`,
    `• 🌙 ${labels.chandraLabel}: ${chandraInfo}`,
    `• ⚡ ${labels.statusLabel}: ${vibe.badgeText} (${day.energyScore || 85}%)`,
    `• ✨ ${labels.vibeTagLabel}: ${vibe.vibeTag}`,
    `• 🔢 ${labels.luckyNumberLabel}: ${luckyNumsStr}`,
    `• 🎨 ${labels.luckyColorLabel}: ${localizedColor}`,
    `• 🧭 ${labels.luckyDirectionLabel}: ${localizedDirection}`,
    "",
    `🛕 ${labels.deityLabel}: ${pick(deity.deityL5, lang) || deity.deity}`,
    `📜 ${labels.mantraLabel}: "${deity.mantra}"`,
    "",
    "════════════════════════════════════════",
    `🔮 ${viewBhavishyaButtonLabel}:`,
    `👉 ${sanctumUrl}`,
    "",
    `📥 90-Day ICS Calendar Import:`,
    `👉 ${origin}/daily?token=${devoteeToken}&action=ics90&lang=${lang}${contactOverrideQuery}`,
    "════════════════════════════════════════",
    "",
    `✨ ${closingBlessing} ✨`
  ].join("\n");

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${dtStart}/${dtEnd}`,
    location: sanctumUrl,
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
  priestPhone?: string;
  overrideCalendarPhone?: boolean;
  notificationTime: string;
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  dob?: string;
  tob?: string;
  birthNakshatraIndex?: number;
  birthRashiIndex?: number;
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
    birthNakshatraIndex,
    birthRashiIndex
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

  const resolvedBirth = getUniversalBirthDetails({
    dob,
    tob,
    name: devoteeDisplayName,
    nakshatraIndex: birthNakshatraIndex,
    rashiIndex: birthRashiIndex
  });
  const birthNakIdx = birthNakshatraIndex ?? resolvedBirth.nakshatraIndex ?? (day as any)?.janmaNakshatraIndex ?? 18;
  const birthRashiIdx = birthRashiIndex ?? resolvedBirth.rashiIndex ?? (day as any)?.janmaRashiIndex ?? 8;

  const startDateStr = day.ymd || new Date().toISOString().slice(0, 10);

  const devoteeToken = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: birthNakIdx,
    r: birthRashiIdx,
    p: safePandit,
    d: day.ymd,
    startDate: startDateStr,
    sd: startDateStr,
    days: 90,
    dy: 90,
    l: lang,
    tm: notificationTime,
    pl: "android",
    t: "google",
    ph: options.overrideCalendarPhone ? options.priestPhone : undefined,
    ocp: options.overrideCalendarPhone ? 1 : undefined,
    pp: options.overrideCalendarPhone ? options.priestPhone : undefined
  });
  const contactOverrideQuery = options.overrideCalendarPhone && options.priestPhone
    ? `&overrideContact=true&priestPhone=${encodeURIComponent(options.priestPhone)}&priestName=${encodeURIComponent(safePandit)}`
    : "";
  const sanctumUrl = `${origin}/daily?token=${devoteeToken}&date=${day.ymd}&sd=${startDateStr}&lang=${lang}&tab=bhavishya${contactOverrideQuery}`;

  // Compact ASCII-only summary for QR (strictly under 600 chars)
  const summary = `Baggona Panchanga`;
  const details = sanctumUrl;

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
  const startDateStr = firstDay?.ymd || new Date().toISOString().slice(0, 10);
  const safePandit = panditName || "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್";
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee");

  const resolvedBirth = getUniversalBirthDetails({
    dob,
    tob,
    name: devoteeDisplayName,
    nakshatraIndex: options.birthNakshatraIndex,
    rashiIndex: options.birthRashiIndex
  });
  const birthNakIdx = options.birthNakshatraIndex ?? (firstDay as any)?.janmaNakshatraIndex ?? (dob ? resolvedBirth.nakshatraIndex : undefined) ?? firstDay?.moonNakshatraIndex ?? resolvedBirth.nakshatraIndex ?? 18;
  const birthRashiIdx = options.birthRashiIndex ?? (firstDay as any)?.janmaRashiIndex ?? (dob ? resolvedBirth.rashiIndex : undefined) ?? firstDay?.moonRashiIndex ?? resolvedBirth.rashiIndex ?? 8;

  const origin = getSafeProductionOrigin(webAppBaseUrl);

  const token = encodeDevoteeToken({
    n: devoteeDisplayName,
    nk: birthNakIdx,
    r: birthRashiIdx,
    p: safePandit,
    d: startDateStr,
    startDate: startDateStr,
    sd: startDateStr,
    days: 90,
    dy: 90,
    l: lang,
    pl: platform || "android",
    t: target,
    pc: pincode,
    lt: lat,
    lg: lng,
    loc: locationName,
    dob: resolvedBirth.dob,
    tob: resolvedBirth.tob,
    ph: options.overrideCalendarPhone ? options.priestPhone : undefined,
    ocp: options.overrideCalendarPhone ? 1 : undefined,
    pp: options.overrideCalendarPhone ? options.priestPhone : undefined
  });

  const contactOverrideQuery = options.overrideCalendarPhone && options.priestPhone
    ? `&overrideContact=true&priestPhone=${encodeURIComponent(options.priestPhone)}&priestName=${encodeURIComponent(safePandit)}`
    : "";

  if (target === "google" || target === "webcal") {
    // Instant 90-day native calendar import engine
    // Triggers direct .ics calendar import on devotee's phone without waiting 24h for Google crawler
    return `${origin}/daily?token=${token}&action=ics90&sd=${startDateStr}&lang=${lang}${contactOverrideQuery}`;
  }

  // target === "sanctum"
  return `${origin}/daily?token=${token}&sd=${startDateStr}&lang=${lang}${contactOverrideQuery}`;
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
