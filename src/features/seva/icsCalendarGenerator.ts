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
import { sunTimesSyncForBirth } from "../../core/birthSunTimes";
import {
  BAND_LABEL_L5,
  T,
  pick,
  type GrahaKey
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
  rashiName,
  tithiLabel
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

const DEITY_MANTRAS: Record<number, { deity: string; mantra: string; colorKn: string; colorEn: string; numbers: string }> = {
  0: {
    deity: "Lord Surya Narayana",
    mantra: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ (Om Hram Hreem Hroum Sah Suryaya Namah)",
    colorKn: "ಕೆಂಪು / ಕೇಸರಿ (Ruby Red & Saffron)",
    colorEn: "Ruby Red & Saffron",
    numbers: "1 · 4 · 7"
  },
  1: {
    deity: "Lord Mahabaleshwara & Chandra",
    mantra: "ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ (Om Shram Shreem Shroum Sah Chandramase Namah)",
    colorKn: "ಶುಭ್ರ ಬಿಳಿ / ಮುತ್ತಿನ ಬಣ್ಣ (Pure White)",
    colorEn: "Pure White & Pearl",
    numbers: "2 · 7 · 9"
  },
  2: {
    deity: "Lord Subramanya & Mangala",
    mantra: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ (Om Kram Kreem Kroum Sah Bhaumaya Namah)",
    colorKn: "ಹವಳದ ಕೆಂಪು (Coral Red)",
    colorEn: "Coral Red",
    numbers: "9 · 3 · 6"
  },
  3: {
    deity: "Lord Mahavishnu & Budha",
    mantra: "ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ (Om Bram Breem Broum Sah Budhaya Namah)",
    colorKn: "ಹಸಿರು (Emerald Green)",
    colorEn: "Emerald Green",
    numbers: "5 · 1 · 8"
  },
  4: {
    deity: "Lord Guru Raghavendra & Brihaspati",
    mantra: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ (Om Gram Greem Groum Sah Gurave Namah)",
    colorKn: "ಹಳದಿ / ಚಿನ್ನದ ಬಣ್ಣ (Golden Yellow)",
    colorEn: "Golden Yellow",
    numbers: "3 · 7 · 9"
  },
  5: {
    deity: "Goddess Mahalakshmi & Shukra",
    mantra: "ॐ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ (Om Dram Dreem Droum Sah Shukraya Namah)",
    colorKn: "ಗುಲಾಬಿ / ರೇಷ್ಮೆ ಶ್ವೇತ (Rose Pink)",
    colorEn: "Rose Pink & Silk White",
    numbers: "6 · 5 · 8"
  },
  6: {
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
  3: { kn: "ವಿಪತ್ ತಾರಾ (ಎಚ್ಚರಿಕೆಯ ದಿನ)", en: "Vipat Tara (Exercise Caution)", hi: "विपत तारा (सावधानी रखें)", te: "विपत तारा (జాగ్రత్త సమయం)", ta: "விபத் தாரை (எச்சரிக்கை தேவை)" },
  4: { kn: "ಕ್ಷೇಮ ತಾರಾ (ಸುಖ & ರಕ್ಷಣೆ)", en: "Kshema Tara (Safety & Well-being)", hi: "क्षेम तारा (सुख व सुरक्षा)", te: "క్షేమ తార (క్షేమం & రక్షణ)", ta: "க்ஷேம தாரை (பாதுகாப்பு & நலம்)" },
  5: { kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ (ಶ್ರಮದಿಂದ ಕಾರ್ಯ)", en: "Pratyak Tara (Obstacle Clearance)", hi: "प्रत्यक तारा (परिश्रम से कार्य)", te: "ప్రత్యక్ తార (శ్రమతో కార్యం)", ta: "பிரத்யக் தாரை (முயற்சி தேவை)" },
  6: { kn: "ಸಾಧಕ ತಾರಾ (ಕಾರ್ಯಸಿದ್ಧಿ & ಜಯ)", en: "Sadhaka Tara (Success in Endeavors)", hi: "साधक तारा (कार्यसिद्धि व विजय)", te: "సాధక తార (కార్యసిద్ధి & విజయం)", ta: "சாதக தாரை (காரிய சித்தி)" },
  7: { kn: "ವಧ ತಾರಾ (ಹೊಸ ಕಾರ್ಯ ಬೇಡ)", en: "Vadha Tara (Avoid Major Risks)", hi: "वध तारा (जोखिम से बचें)", te: "వధ తార (ప్రమాదం నివారించండి)", ta: "வத தாரை (முக்கிய காரியம் தவிர்க)" },
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
      kaalaHeading: "ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು",
      visitLabel: "🌐 ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ, ಜಾತಕ ಹಾಗೂ ಲೈವ್ ದರ್ಶನಕ್ಕಾಗಿ ಇಲ್ಲಿ ಭೇಟಿ ನೀಡಿ:",
      defaultDevotee: "ಭಕ್ತರು"
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
      kaalaHeading: "आज के काल समय",
      visitLabel: "🌐 संपूर्ण पंचांग, कुंडली व लाइव दर्शन हेतु यहाँ क्लिक करें:",
      defaultDevotee: "भक्त"
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
      kaalaHeading: "నేటి కాల సమయాలు",
      visitLabel: "🌐 సంపూర్ణ పంచాంగం, జాతకం & లైవ్ దర్శనం కొరకు ఇక్కడ క్లిక్ చేయండి:",
      defaultDevotee: "భక్తులు"
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
      kaalaHeading: "இன்றைய கால நேரங்கள்",
      visitLabel: "🌐 முழுமையான பஞ்சாங்கம், ஜாதகம் & லைவ் தரிசனத்திற்கு இங்கே கிளிக் செய்க:",
      defaultDevotee: "பக்தர்"
    };
  }

  // English fallback
  return {
    panchangaTitle: "Baggona Panchanga",
    kshetraTitle: "Gokarna Kshetra",
    priestLabel: "Chief Priest",
    devoteeLabel: "Devotee Name",
    locationLabel: "Location",
    statusLabel: "Status",
    futureTitle: "🔮 Key Future Actionable Focus Points:",
    vehicleLabel: "Vehicle & Asset",
    financeLabel: "Finance & Business",
    mindLabel: "Mind & Peace",
    spiritualLabel: "Spiritual Harmony",
    taraLabel: "Tara Bala",
    chandraLabel: "Chandra Bala",
    sunriseLabel: "Sunrise",
    sunsetLabel: "Sunset",
    kaalaHeading: "Daily Kaala Timings",
    visitLabel: "🌐 Click here for Full Panchanga, Kundali & Live Darshana:",
    defaultDevotee: "Devotee"
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
    if (code === "kn") return "8ನೇ ಮನೆ - 🔴 ಚಂದ್ರಾಷ್ಟಮ (ಎಚ್ಚರಿಕೆ ವಹಿಸಿ)";
    if (code === "hi") return "8वां भाव - 🔴 चंद्राष्टम (सावधानी रखें)";
    if (code === "te") return "8వ ఇల్లు - 🔴 చంద్రాష్టమం (జాగ్రత్త)";
    if (code === "ta") return "8ஆம் இடம் - 🔴 சந்திராஷ்டமம் (கவனம்)";
    return "8th House - 🔴 CHANDRASHTAMA (Exercise Care)";
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
  const idx = getDayLordIndex(dayLord);
  const code = (lang || "en").slice(0, 2);

  let sunriseStr = "06:00 AM";
  let sunsetStr = "06:30 PM";
  let rahuStr = "";
  let gulikaStr = "";
  let yamaStr = "";

  if (dateStr && typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    try {
      const dateObj = new Date(`${dateStr}T12:00:00Z`);
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

      rahuStr = getWindowStr(rahuOctantMap[idx] || 8);
      gulikaStr = getWindowStr(gulikaOctantMap[idx] || 7);
      yamaStr = getWindowStr(yamaOctantMap[idx] || 5);
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

  const rahuSuffix = code === "kn" ? "(ಹೊಸ ಕಾರ್ಯ ತಪ್ಪಿಸಿ)"
                   : code === "hi" ? "(नया कार्य टालें)"
                   : code === "te" ? "(కొత్త పనులు వద్దు)"
                   : code === "ta" ? "(புதிய காரியம் தவிர்க்க)"
                   : "(Avoid New Start)";
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
  const targetDate = new Date(targetDateStr);
  const validD = isNaN(targetDate.getTime()) ? new Date() : targetDate;

  const ymd = validD.toISOString().slice(0, 10);
  const dayOfMonth = validD.getDate();
  const monthIndex = validD.getMonth();
  const year = validD.getFullYear();
  const weekday = validD.getDay();

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

  const baseScore = (isTaraFav ? 45 : 20) + (isChandraFav ? 40 : 15) + (isChandrashtamaDay ? -25 : 5);
  const scoreVal = Math.max(15, Math.min(98, baseScore));
  const bandType: "high" | "steady" | "rest" = (isChandrashtamaDay || isDifficultTara || scoreVal < 50) ? "rest" : (isTaraFav && isChandraFav && scoreVal >= 75) ? "high" : "steady";

  const dayLordsMap: Record<number, GrahaKey> = {
    0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury", 4: "Jupiter", 5: "Venus", 6: "Saturn"
  };
  const dayLord = dayLordsMap[weekday] || "Sun";

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
    luckyNumbers: [3, 7, 9],
    luckyColour: isTaraFav ? "gold" : "maroon",
    luckyDirection: "east"
  } as unknown as RhythmDay;
}

/** Action suitability level, day color classification, progress bar & single-letter vibe tag */
export function getEnergyMeterAndVibe(day: RhythmDay, lang: string) {
  const code = (lang || "en").slice(0, 2);
  const band = String(day.band || "").toLowerCase();
  const score = day.energyScore ?? (band === "high" ? 85 : band === "medium" ? 60 : 35);
  const isCaution =
    day.isChandrashtama ||
    day.isAmavasya ||
    Boolean(day.tara?.isDifficult) ||
    [3, 5, 7].includes((day.tara?.tara as number) || 0) ||
    band === "rest" ||
    band === "low" ||
    score < 50;

  if (isCaution) {
    const badgeText = code === "kn" ? "🔴 ಮುನ್ನೆಚ್ಚರಿಕೆಯ ನಡೆ ಹಾಗೂ ಜಾಗರೂಕತೆಯ ದಿನ"
                    : code === "hi" ? "🔴 सतर्कता एवं सावधानी का दिन"
                    : code === "te" ? "🔴 హెచ్చరిక & జాగ్రత్తల దినం"
                    : code === "ta" ? "🔴 கவனம் & முன்னெச்சரிக்கை நாள்"
                    : "🔴 DAY OF MINDFUL CAUTION & CARE";
    const vibeTag = code === "kn" ? "🧘 S (ಹೆಚ್ಚಿನ ಜಾಗರೂಕತೆ / ಸಮಚಿತ್ತ)"
                  : code === "hi" ? "🧘 S (विशेष सावधानी / संयम)"
                  : code === "te" ? "🧘 S (జాగ్రత్త / సమన్వయం)"
                  : code === "ta" ? "🧘 S (கவனம் / அமைதி)"
                  : "🧘 S (Mindful Caution / Care)";
    return {
      badgeEmoji: "🔴",
      badgeText,
      meter: "[▓▓▓░░░░░░░] 30%",
      vibeTag,
      googleColorId: "11",
      icalColor: "crimson"
    };
  }

  if (band === "high" || score >= 75) {
    const badgeText = code === "kn" ? "🟢 ಶುಭ ಕಾರ್ಯ, ನೂತನ ವಾಹನ ಹಾಗೂ ಧನ ಅಭಿವೃದ್ಧಿಗೆ ಪ್ರಶಸ್ತ"
                    : code === "hi" ? "🟢 नए कार्य, वाहन क्रय एवं धन वृद्धि हेतु शुभ"
                    : code === "te" ? "🟢 నూతన కార్యం, వాహన కొనుగోలు & ధన లాభానికి శుభప్రదం"
                    : code === "ta" ? "🟢 புதிய காரியம், வாகனம் & தன லாபத்திற்கு உகந்தது"
                    : "🟢 AUSPICIOUS FOR NEW WORK, VEHICLES & PURCHASES";
    const vibeTag = code === "kn" ? "⚡ A (ನವಾರಂಭ / ವಾಹನ ಯೋಗ)"
                  : code === "hi" ? "⚡ A (नया कार्य / वाहन योग)"
                  : code === "te" ? "⚡ A (నూతన కార్యం / వాహనం)"
                  : code === "ta" ? "⚡ A (புதிய தொடக்கம் / வாகனம்)"
                  : "⚡ A (New Venture / Vehicle / Growth)";
    return {
      badgeEmoji: "🟢",
      badgeText,
      meter: "[▓▓▓▓▓▓▓▓░░] 85%",
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
  const vibeTag = code === "kn" ? "⚖️ B (ಸಮತೋಲನ / ಕರ್ತವ್ಯ)"
                : code === "hi" ? "⚖️ B (संतुलन / कर्तव्य)"
                : code === "te" ? "⚖️ B (సమతుల್ಯత / విధి)"
                : code === "ta" ? "⚖️ B (சமநிலை / கடமை)"
                : "⚖️ B (Routine Work / Safe Transit)";
  return {
    badgeEmoji: "🟡",
    badgeText,
    meter: "[▓▓▓▓▓░░░░░] 60%",
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
}

export function getSafeProductionOrigin(webAppBaseUrl?: string): string {
  if (webAppBaseUrl && webAppBaseUrl.trim().length > 0 && webAppBaseUrl.startsWith("http")) {
    return webAppBaseUrl.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin;
  }
  return "https://baggona-astrology.web.app";
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

export function generateSevaICalendarString(options: CalendarGeneratorOptions): string {
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
    birthRashiIndex
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
    loc: locationName
  });
  const sanitizedDevoteeToken = baseToken.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  days.forEach((day) => {
    const ymdCompact = formatYmdCompact(day.ymd);
    const dayUid = `baggona-day-${ymdCompact}-${sanitizedDevoteeToken}@baggona.app`;
    const dtStart = `${ymdCompact}T${hh}${mm}00`;
    
    const endMinutes = (parseInt(mm, 10) + 30) % 60;
    const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
    const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

    const vibe = getEnergyMeterAndVibe(day, lang);
    const sanctumUrl = `${origin}/daily?token=${baseToken}`;

    const summaryStr = `🛕 Temple Puja & Astrology | ${vibe.badgeEmoji} [${tithiLabel(day, lang)}] ${localizedPandit} - ${labels.panchangaTitle} (${vibe.badgeText})`;

    const descriptionParts: string[] = [
      `🕉️ ${labels.panchangaTitle} - ${labels.kshetraTitle}`,
      `👤 ${labels.devoteeLabel}: ${devoteeDisplayName}`,
      `🙏 ${labels.priestLabel}: ${localizedPandit}`,
      `⚡ ${labels.statusLabel}: ${vibe.badgeText} (${day.energyScore || 85}%) | ${vibe.vibeTag}`,
      "",
      `${labels.visitLabel}`,
      `👉 ${sanctumUrl}`,
      "",
      "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨"
    ];

    const descriptionStr = descriptionParts.join("\n");
    const htmlDescriptionStr = `<html><body style="font-family:sans-serif;"><div style="background-color:#501b11; padding:16px; border-radius:12px; text-align:center; color:#fff8e7; border:2px solid #f59e0b;"><h2 style="color:#fde68a; margin:0 0 4px 0;">${labels.panchangaTitle} - ${labels.kshetraTitle}</h2><p style="color:#f59e0b; margin:0 0 12px 0;">${labels.priestLabel}: ${localizedPandit} • ${devoteeDisplayName}</p></div><br/>${descriptionParts.slice(3).join("<br/>")}</body></html>`;

    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${dayUid}`,
      `RELATED-TO;RELTYPE=PARENT:baggona-series-${sanitizedDevoteeToken}@baggona.app`,
      `X-BAGBONA-SERIES-ID:${sanitizedDevoteeToken}`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `SUMMARY:${escapeIcsText(summaryStr)}`,
      `DESCRIPTION:${escapeIcsText(descriptionStr)}`,
      `X-ALT-DESC;FMTTYPE=text/html:${escapeIcsText(htmlDescriptionStr)}`,
      `ATTACH;FMTTYPE=image/jpeg:${origin}/baggona_panchanga_gold_banner.jpg`,
      `IMAGE;VALUE=URI:${origin}/baggona_panchanga_gold_banner.jpg`,
      `URL:${sanctumUrl}`,
      `COLOR:${vibe.icalColor}`,
      `X-GOOGLE-CALENDAR-COLOR:${vibe.googleColorId}`,
      "CATEGORIES:Temple,Puja,Pooja,Astrology,Worship,Daily Ritual,Gokarna Kshetra,Baggona Panchanga",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(summaryStr)}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT"
    ];

    lines.push(...eventLines);
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Generates a Google Calendar Web Intent URL for Android / Web with Royal Framing and Encrypted Live Sanctum Link.
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
    locationName = "Gokarna"
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
  const kaala = getDailyKaalaTimings(day.dayLord, lang, day.ymd, lat, lng, pincode);
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
    loc: locationName
  });
  const origin = getSafeProductionOrigin(webAppBaseUrl);
  const sanctumUrl = `${origin}/daily?token=${devoteeToken}`;

  const panchangaTitle = isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ" : isHi ? "बग्गोण पंचांग" : isTe ? "బగ్గోణ పంచాಂಗం" : isTa ? "பக்கோண பஞ்சாங்கம்" : "Baggona Panchanga";
  const kshetraTitle = isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ" : isHi ? "गोकर्ण क्षेत्र" : isTe ? "గోకర్ణ క్షేత్రం" : isTa ? "கோகர்ண க்ஷேத்திரம்" : "Gokarna Kshetra";
  const priestLabel = isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರು" : isHi ? "मुख्य अर्चक" : isTe ? "ముఖ్య అర్చకులు" : isTa ? "முதன்மை அர்ச்சகர்" : "Chief Priest";
  const devoteeLabel = isKn ? "ಭಕ್ತರ ಹೆಸರು" : isHi ? "भक्त का नाम" : isTe ? "భక్తుని పేరు" : isTa ? "பக்தர் பெயர்" : "Devotee";

  const summary = `🛕 Temple Puja & Astrology | ${vibe.badgeEmoji} [${tithiLabel(day, lang)}] ${localizedPandit} - ${panchangaTitle} (${vibe.badgeText})`;

  const taraNum = day.tara?.tara || 2;
  const taraInfo = getTaraBalaInfo(taraNum, lang);
  const chandraInfo = getChandraBalaInfo(day.chandra?.house || 11, day.isChandrashtama, lang);

  const guidancePoints = getDailyActionableGuidance(day, lang);
  const vehicleText = guidancePoints.find(p => p.icon === "🚗")?.text || "";
  const financeText = guidancePoints.find(p => p.icon === "💰")?.text || "";
  const mindText = guidancePoints.find(p => p.icon === "🧠")?.text || "";
  const spiritualText = guidancePoints.find(p => p.icon === "🪔")?.text || "";

  const futureTitle = isKn ? "🔮 ಭವಿಷ್ಯದ ಪ್ರಮುಖ 4 ಮಾರ್ಗದರ್ಶನಗಳು:" : isHi ? "🔮 भविष्य का मुख्य 4 मार्गदर्शन:" : isTe ? "🔮 భవిష్యత్తు ముఖ్య 4 మార్గదర్శకాలు:" : isTa ? "🔮 எதிர்கால முக்கிய 4 வழிகாட்டுதல்கள்:" : "🔮 Key Future Actionable Focus Points:";

  const details = [
    `🕉️ ${panchangaTitle} - ${kshetraTitle}`,
    `👤 ${devoteeLabel}: ${devoteeDisplayName}`,
    `🙏 ${priestLabel}: ${localizedPandit}`,
    `⚡ ${isKn ? "ದಿನದ ಸ್ಥಿತಿ" : "Status"}: ${vibe.badgeText} (${day.energyScore || 85}%) | ${vibe.vibeTag}`,
    "",
    isKn ? "🌐 ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ, ಜಾತಕ ಹಾಗೂ ಲೈವ್ ದರ್ಶನಕ್ಕಾಗಿ ಇಲ್ಲ ಭೇಟಿ ನೀಡಿ:" : "🌐 Click here for Full Panchanga, Kundali & Live Darshana:",
    `👉 ${sanctumUrl}`,
    "",
    "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨"
  ].join("\n");

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${dtStart}/${dtEnd}`,
    details: details,
    recur: "RRULE:FREQ=DAILY;COUNT=90",
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
 * - Includes only essential calendar info (title, dates, recurrence)
 * - Adds a short Web Sanctum link for full details
 * - Total URL length stays under 600 characters
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
    locationName = "Gokarna"
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
    t: "google"
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
    `Full Details: ${sanctumUrl}`
  ].join("\n");

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${dtStart}/${dtEnd}`,
    details: details,
    recur: "RRULE:FREQ=DAILY;COUNT=90",
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
    locationName = "Gokarna"
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
    loc: locationName
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
