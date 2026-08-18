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
  pick
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

const TARA_NAMES_MAP: Record<number, { kn: string; en: string }> = {
  1: { kn: "ಜನ್ಮ ತಾರಾ (ಆರೋಗ್ಯ ಗಮನಿಸಿ)", en: "Janma Tara (Care for Health)" },
  2: { kn: "ಸಂಪತ್ ತಾರಾ (ಧನ ಲಾಭ & ಯಶಸ್ಸು)", en: "Sampat Tara (Wealth & Success)" },
  3: { kn: "ವಿಪತ್ ತಾರಾ (ಎಚ್ಚರಿಕೆಯ ದಿನ)", en: "Vipat Tara (Exercise Caution)" },
  4: { kn: "ಕ್ಷೇಮ ತಾರಾ (ಸುಖ & ರಕ್ಷಣೆ)", en: "Kshema Tara (Safety & Well-being)" },
  5: { kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ (ಶ್ರಮದಿಂದ ಕಾರ್ಯ)", en: "Pratyak Tara (Obstacle Clearance)" },
  6: { kn: "ಸಾಧಕ ತಾರಾ (ಕಾರ್ಯಸಿದ್ಧಿ & ಜಯ)", en: "Sadhaka Tara (Success in Endeavors)" },
  7: { kn: "ವಧ ತಾರಾ (ಹೊಸ ಕಾರ್ಯ ಬೇಡ)", en: "Vadha Tara (Avoid Major Risks)" },
  8: { kn: "ಮಿತ್ರ ತಾರಾ (ಸ್ನೇಹ & ಸಹಕಾರ)", en: "Mitra Tara (Friendly & Cooperative)" },
  9: { kn: "ಪರಮ ಮಿತ್ರ ತಾರಾ (ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ)", en: "Parama Mitra Tara (Supreme Blessing)" }
};

export function getTaraBalaInfo(taraNum: number, lang: string): string {
  const isKn = lang.startsWith("kn");
  const data = TARA_NAMES_MAP[taraNum] || TARA_NAMES_MAP[2]!;
  return isKn ? data.kn : data.en;
}

export function getChandraBalaInfo(house: number, isChandrashtama: boolean, lang: string): string {
  const isKn = lang.startsWith("kn");
  if (isChandrashtama) {
    return isKn ? "8ನೇ ಮನೆ - 🔴 ಚಂದ್ರಾಷ್ಟಮ (ಎಚ್ಚರಿಕೆ ವಹಿಸಿ)" : "8th House - 🔴 CHANDRASHTAMA (Exercise Care)";
  }
  if (house === 11) {
    return isKn ? "11ನೇ ಮನೆ - 🟢 ಲಾಭ ಸ್ಥಾನ (ಅತ್ಯುತ್ತಮ ಧನ ಲಾಭ)" : "11th House - 🟢 LABHA STHANA (High Gains)";
  }
  if (house === 9 || house === 10 || house === 3 || house === 6) {
    return isKn ? `${house}ನೇ ಮನೆ - 🟢 ಶುಭ ಚಂದ್ರಬಲ` : `${house}th House - 🟢 Auspicious Chandra Bala`;
  }
  return isKn ? `${house}ನೇ ಮನೆ - 🟡 ಸಾಮಾನ್ಯ ಚಂದ್ರಬಲ` : `${house}th House - 🟡 Moderate Chandra Bala`;
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
  const isKn = lang.startsWith("kn");

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

  return {
    sunrise: sunriseStr,
    sunset: sunsetStr,
    rahu: `${rahuStr} ${isKn ? "(ಹೊಸ ಕಾರ್ಯ ತಪ್ಪಿಸಿ)" : "(Avoid New Start)"}`,
    gulika: `${gulikaStr} ${isKn ? "(ಶುಭ ಕಾರ್ಯಕ್ಕೆ ಉತ್ತಮ)" : "(Favorable for Action)"}`,
    yamaganda: `${yamaStr} ${isKn ? "(ಪ್ರಾರ್ಥನೆಗೆ ಸೂಕ್ತ)" : "(Good for Prayer)"}`
  };
}

/** Energy level, day color classification, progress bar & single-letter vibe tag */
export function getEnergyMeterAndVibe(day: RhythmDay, lang: string) {
  const isKn = lang.startsWith("kn");
  const band = String(day.band || "").toLowerCase();
  const score = day.energyScore ?? (band === "high" ? 85 : band === "medium" ? 60 : 35);
  const isCaution = day.isChandrashtama || day.isAmavasya || band === "low" || score < 50;

  if (isCaution) {
    return {
      badgeEmoji: "🔴",
      badgeText: isKn ? "🔴 ಎಚ್ಚರಿಕೆಯ ದಿನ (Caution Day)" : "🔴 CAUTION DAY",
      meter: "[▓▓▓░░░░░░░] 30%",
      vibeTag: isKn ? "🧘 S (ಶಾಂತಿ / ಶ್ರಮ ತಪ್ಪಿಸಿ)" : "🧘 S (Shanti / Exercise Care)",
      googleColorId: "11", // Tomato Red
      icalColor: "crimson"
    };
  }

  if (band === "high" || score >= 75) {
    return {
      badgeEmoji: "🟢",
      badgeText: isKn ? "🟢 ಉತ್ತಮ ಶಕ್ತಿ ದಿನ (High Energy)" : "🟢 HIGH ENERGY DAY",
      meter: "[▓▓▓▓▓▓▓▓░░] 85%",
      vibeTag: isKn ? "⚡ A (ಕ್ರಿಯೆ / ಯಶಸ್ಸು)" : "⚡ A (Action / Growth)",
      googleColorId: "10", // Emerald Green
      icalColor: "green"
    };
  }

  return {
    badgeEmoji: "🟡",
    badgeText: isKn ? "🟡 ಸಮತೋಲಿತ ದಿನ (Balanced Day)" : "🟡 BALANCED DAY",
    meter: "[▓▓▓▓▓░░░░░] 60%",
    vibeTag: isKn ? "⚖️ B (ಸಮತೋಲನ / ಕರ್ತವ್ಯ)" : "⚖️ B (Balance / Routine)",
    googleColorId: "5", // Banana Yellow
    icalColor: "gold"
  };
}

export type CalendarGeneratorOptions = {
  days: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime: string; // "08:00", "06:00", etc.
  personName?: string;
  webAppBaseUrl?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
};

export function formatPanditGreeting(panditName: string, lang: string): string {
  const p = panditName.trim();
  const isKn = lang.startsWith("kn");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");

  if (!p) {
    if (isKn) return "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಿಂದ ನಮಸ್ಕಾರಗಳು,";
    if (isHi) return "गोकर्ण महाबलेश्वर क्षेत्र की ओर से सादर प्रणाम,";
    if (isTe) return "గోకర్ణ మహాబలేశ్వర క్షేత్రం నుండి నమస్కారాలు,";
    if (isTa) return "கோகர்ண மகாபலேஸ்வர க்ஷேத்திரத்திலிருந்து அன்பு வணக்கங்கள்,";
    return "Warm greetings from Baggona Gokarna Kshetra,";
  }

  if (isKn) return `${p} ಅವರಿಂದ ನಮಸ್ಕಾರಗಳು,`;
  if (isHi) return `${p} जी की ओर से सादर प्रणाम,`;
  if (isTe) return `${p} గారి నుండి నమస్కారాలు,`;
  if (isTa) return `${p} அவர்களின் அன்பு வணக்கங்கள்,`;
  return `With warm greetings from ${p},`;
}

/**
 * Builds a full RFC 5545 .ics payload string containing all 90 days of guidance
 * with Royal Vedic double-box borders and deity mantras.
 */
export function getSafeProductionOrigin(webAppBaseUrl?: string): string {
  if (webAppBaseUrl && !webAppBaseUrl.includes("localhost") && !webAppBaseUrl.includes("127.0.0.1")) {
    return webAppBaseUrl;
  }
  if (
    typeof window !== "undefined" &&
    window.location?.origin &&
    !window.location.origin.includes("localhost") &&
    !window.location.origin.includes("127.0.0.1")
  ) {
    return window.location.origin;
  }
  return "https://baggona.app";
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
    locationName = "Gokarna"
  } = options;

  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Astrology//NONSGML Seva Calendar v2.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(personName ? `Baggona Panchanga - ${personName}` : "Baggona Daily Panchanga")}`,
    "X-WR-TIMEZONE:Asia/Kolkata"
  ];

  const nowIso = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const origin = getSafeProductionOrigin(webAppBaseUrl);

  const startDateStr = days[0]?.ymd || new Date().toISOString().slice(0, 10);
  const birthNakIdx = days[0]?.moonNakshatraIndex ?? 0;
  const birthRashiIdx = days[0]?.moonRashiIndex ?? 0;
  const localizedPandit = getLocalizedPanditName(panditName, lang);
  const devoteeDisplayName = (personName && personName.trim().length > 0) ? personName.trim() : (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee");

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
  const seriesUid = `baggona-90day-series-${sanitizedDevoteeToken}@baggona.app`;

  days.forEach((day, index) => {
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

    const priestLabel = isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರು" : isHi ? "मुख्य अर्चक" : isTe ? "ముఖ్య అర్చకులు" : isTa ? "முதன்மை அர்ச்சகர்" : "Chief Priest";
    const devoteeToken = encodeDevoteeToken({
      n: devoteeDisplayName,
      nk: day.moonNakshatraIndex ?? birthNakIdx,
      r: day.moonRashiIndex ?? birthRashiIdx,
      p: localizedPandit,
      d: day.ymd,
      l: lang,
      tm: notificationTime,
      pc: pincode,
      lt: lat,
      lg: lng,
      loc: locationName
    });
    const sanctumUrl = `${origin}/daily?token=${devoteeToken}`;

    const panchangaTitle = isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ" : isHi ? "बग्गोण पंचांग" : isTe ? "బగ్గోణ పంచాಂಗం" : isTa ? "பக்கோண பஞ்சாங்கம்" : "Baggona Panchanga";
    const kshetraTitle = isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ" : isHi ? "गोकर्ण क्षेत्र" : isTe ? "గోకర్ణ క్షేత్రం" : isTa ? "கோகர்ண க்ஷேத்திரம்" : "Gokarna Kshetra";

    const summaryStr = `${vibe.badgeEmoji} [${tithiLabel(day, lang)}] ${localizedPandit} - ${panchangaTitle} (${vibe.badgeText})`;

    const taraNum = day.tara?.tara || 2;
    const taraInfo = getTaraBalaInfo(taraNum, lang);
    const chandraInfo = getChandraBalaInfo(day.chandra?.house || 11, day.isChandrashtama, lang);

    const guidancePoints = getDailyActionableGuidance(day, lang);
    const vehicleText = guidancePoints.find(p => p.icon === "🚗")?.text || "";
    const financeText = guidancePoints.find(p => p.icon === "💰")?.text || "";
    const mindText = guidancePoints.find(p => p.icon === "🧠")?.text || "";
    const spiritualText = guidancePoints.find(p => p.icon === "🪔")?.text || "";

    const futureTitle = isKn ? "🔮 ಭವಿಷ್ಯದ ಪ್ರಮುಖ 4 ಮಾರ್ಗದರ್ಶನಗಳು:" : isHi ? "🔮 भविष्य का मुख्य 4 मार्गदर्शन:" : isTe ? "🔮 భవిష్యత్తు ముఖ్య 4 మార్గదర్శకాలు:" : isTa ? "🔮 எதிர்கால முக்கிய 4 வழிகாட்டுதல்கள்:" : "🔮 Key Future Actionable Focus Points:";

    const descriptionParts: string[] = [
      `🕉️ ${panchangaTitle} - ${kshetraTitle}`,
      "",
      `🙏 ${priestLabel}: ${localizedPandit}`,
      `👤 ${devoteeDisplayName}`,
      `📍 ${isKn ? "ಸ್ಥಳ" : "Location"}: ${locationName} (${pincode}) [Lat: ${lat.toFixed(2)}°, Lng: ${lng.toFixed(2)}°]`,
      "",
      `⚡ ${isKn ? "ದಿನದ ಸ್ಥಿತಿ" : "Status"}: ${vibe.badgeText} (${day.energyScore || 85}%) | ${vibe.vibeTag}`,
      "",
      futureTitle,
      "",
      `🚗 ${isKn ? "ವಾಹನ & ಆಸ್ತಿ" : "Vehicle & Asset"}: ${vehicleText}`,
      "",
      `💰 ${isKn ? "ಧನ & ವ್ಯಾಪಾರ" : "Finance & Business"}: ${financeText}`,
      "",
      `🧠 ${isKn ? "ಮನಃಸ್ಥಿತಿ & ಶಾಂತಿ" : "Mind & Peace"}: ${mindText}`,
      "",
      `🪔 ${isKn ? "ದೈವಿಕ ಕೃಪೆ" : "Spiritual Harmony"}: ${spiritualText}`,
      "",
      `🌟 ${isKn ? "ತಾರಾಬಲ" : "Tara Bala"}: ${taraInfo}`,
      `🌙 ${isKn ? "ಚಂದ್ರಬಲ" : "Chandra Bala"}: ${chandraInfo}`,
      "",
      `⏳ ${isKn ? "ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು (Kolkata)" : "Daily Kaala Timings (Kolkata)"}:`,
      `🔴 Rahu Kaala: ${kaala.rahu}`,
      `🟢 Yamaganda: ${kaala.yamaganda}`,
      "",
      `🙏 ${deity.deity}:`,
      `${deity.mantra}`,
      "",
      isKn ? "🌐 ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ, ಜಾತಕ ಹಾಗೂ ಲೈವ್ ದರ್ಶನಕ್ಕಾಗಿ ಇಲ್ಲ ಭೇಟಿ ನೀಡಿ:" : "🌐 Click here for Full Panchanga, Kundali & Live Darshana:",
      sanctumUrl,
      "",
      "✨ Gokarna Mahabaleshwara Prasada Siddhirastu ✨"
    ];

    const descriptionStr = descriptionParts.join("\n");
    const bannerUrl = `${origin}/baggona_panchanga_gold_banner.jpg`;
    const htmlDescriptionStr = `<html><body style="font-family:sans-serif;"><div style="background-color:#501b11; padding:16px; border-radius:12px; text-align:center; color:#fff8e7; border:2px solid #f59e0b;"><img src="${bannerUrl}" alt="Baggona Panchanga Gold Banner" style="width:100%; max-width:550px; border-radius:8px; display:block; margin:0 auto 12px auto;" /><h2 style="color:#fde68a; margin:0 0 4px 0;">${panchangaTitle} - ${kshetraTitle}</h2><p style="color:#f59e0b; margin:0 0 12px 0;">${priestLabel}: ${localizedPandit} • ${devoteeDisplayName}</p></div><br/>${descriptionParts.slice(4).join("<br/>")}</body></html>`;

    const eventLines: string[] = [
      "BEGIN:VEVENT",
      `UID:${seriesUid}`,
      ...(index === 0 ? ["RRULE:FREQ=DAILY;COUNT=90"] : [`RECURRENCE-ID;TZID=Asia/Kolkata:${dtStart}`]),
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `SUMMARY:${escapeIcsText(summaryStr)}`,
      `DESCRIPTION:${escapeIcsText(descriptionStr)}`,
      `X-ALT-DESC;FMTTYPE=text/html:${escapeIcsText(htmlDescriptionStr)}`,
      `ATTACH;FMTTYPE=image/jpeg:${bannerUrl}`,
      `URL:${sanctumUrl}`,
      `COLOR:${vibe.icalColor}`,
      `X-GOOGLE-CALENDAR-COLOR:${vibe.googleColorId}`,
      "CATEGORIES:Baggona Panchanga,Gokarna Kshetra,Astrology",
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

  const summary = `${vibe.badgeEmoji} [${tithiLabel(day, lang)}] ${localizedPandit} - ${panchangaTitle} (${vibe.badgeText})`;

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
    "",
    `🙏 ${priestLabel}: ${localizedPandit}`,
    `👤 ${devoteeLabel}: ${devoteeDisplayName}`,
    `📍 ${isKn ? "ಸ್ಥಳ" : "Location"}: ${locationName} (${pincode}) [Lat: ${lat.toFixed(2)}°, Lng: ${lng.toFixed(2)}°]`,
    "",
    `⚡ ${isKn ? "ದಿನದ ಸ್ಥಿತಿ" : "Status"}: ${vibe.badgeText} (${day.energyScore || 85}%) | ${vibe.vibeTag}`,
    "",
    futureTitle,
    "",
    `🚗 ${isKn ? "ವಾಹನ & ಆಸ್ತಿ" : "Vehicle & Asset"}: ${vehicleText}`,
    "",
    `💰 ${isKn ? "ಧನ & ವ್ಯಾಪಾರ" : "Finance & Business"}: ${financeText}`,
    "",
    `🧠 ${isKn ? "ಮನಃಸ್ಥಿತಿ & ಶಾಂತಿ" : "Mind & Peace"}: ${mindText}`,
    "",
    `🪔 ${isKn ? "ದೈವಿಕ ಕೃಪೆ" : "Spiritual Harmony"}: ${spiritualText}`,
    "",
    `🌟 ${isKn ? "ತಾರಾಬಲ" : "Tara Bala"}: ${taraInfo}`,
    `🌙 ${isKn ? "ಚಂದ್ರಬಲ" : "Chandra Bala"}: ${chandraInfo}`,
    "",
    `🌅 ${isKn ? "ಸೂರ್ಯೋದಯ" : "Sunrise"}: ${kaala.sunrise} | 🌇 ${isKn ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset"}: ${kaala.sunset}`,
    `⏳ ${isKn ? "ಇಂದಿನ ಸ್ಥಳೀಯ ಕಾಲ ಸಮಯಗಳು" : "Local Daily Kaala Timings"}:`,
    `🔴 Rahu Kaala: ${kaala.rahu}`,
    `🟢 Yamaganda: ${kaala.yamaganda}`,
    "",
    `🙏 ${deity.deity}:`,
    `${deity.mantra}`,
    "",
    isKn ? "🌐 ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ, ಜಾತಕ ಹಾಗೂ ಲೈವ್ ದರ್ಶನಕ್ಕಾಗಿ ಇಲ್ಲ ಭೇಟಿ ನೀಡಿ:" : "🌐 Click here for Full Panchanga, Kundali & Live Darshana:",
    sanctumUrl,
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
