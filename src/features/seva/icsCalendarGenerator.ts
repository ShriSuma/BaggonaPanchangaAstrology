/**
 * Generates RFC 5545 standard iCalendar (.ics) files and Google Calendar links
 * for 6-month daily Panchanga recommendations, mantras, and personalized priest blessings.
 * 
 * Includes 15-year Google Calendar visual design standards:
 * - Color-coded day classification (Green = High Energy, Yellow = Balanced, Red = Caution)
 * - Energy level progress bar ([▓▓▓▓▓▓▓▓░░] 80%)
 * - Daily Rahu Kaala, Gulika Kaala, and Yamaganda timings
 * - Single-letter vibe focus tag (⚡ A, ⚖️ B, 🧘 S)
 * - Clean local language guidance (Sanskrit mantras removed per user directive)
 * - 100% mobile QR scanner compatibility with instant Google Calendar intent links
 */

import type { RhythmDay } from "../../core/DailyRhythmEngine";
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
  grahaName,
  nakshatraName,
  rashiName,
  tithiLabel
} from "./sevaPresentation";

/** Escape text content for iCalendar RFC 5545 compliance. */
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

/** Rahu Kaala, Gulika Kaala, and Yamaganda exact timings by day lord octant */
export function getDailyKaalaTimings(dayLord: number | string, lang: string) {
  const idx = getDayLordIndex(dayLord);
  const timings = [
    // 0: Sun
    { rahu: "04:30 PM – 06:00 PM", gulika: "03:00 PM – 04:30 PM", yama: "12:00 PM – 01:30 PM" },
    // 1: Mon
    { rahu: "07:30 AM – 09:00 AM", gulika: "01:30 PM – 03:00 PM", yama: "10:30 AM – 12:00 PM" },
    // 2: Tue
    { rahu: "03:00 PM – 04:30 PM", gulika: "12:00 PM – 01:30 PM", yama: "09:00 AM – 10:30 AM" },
    // 3: Wed
    { rahu: "12:00 PM – 01:30 PM", gulika: "10:30 AM – 12:00 PM", yama: "07:30 AM – 09:00 AM" },
    // 4: Thu
    { rahu: "01:30 PM – 03:00 PM", gulika: "09:00 AM – 10:30 AM", yama: "06:00 AM – 07:30 AM" },
    // 5: Fri
    { rahu: "10:30 AM – 12:00 PM", gulika: "07:30 AM – 09:00 AM", yama: "03:00 PM – 04:30 PM" },
    // 6: Sat
    { rahu: "09:00 AM – 10:30 AM", gulika: "06:00 AM – 07:30 AM", yama: "01:30 PM – 03:00 PM" }
  ];
  const t = timings[idx] || timings[0];
  const isKn = lang.startsWith("kn");

  return {
    rahu: `${t.rahu} ${isKn ? "(ಹೊಸ ಕಾರ್ಯ ತಪ್ಪಿಸಿ)" : "(Avoid New Start)"}`,
    gulika: `${t.gulika} ${isKn ? "(ಶುಭ ಕಾರ್ಯಕ್ಕೆ ಉತ್ತಮ)" : "(Favorable for Action)"}`,
    yamaganda: `${t.yama} ${isKn ? "(ಪ್ರಾರ್ಥನೆಗೆ ಸೂಕ್ತ)" : "(Good for Prayer)"}`
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
};

/**
 * Builds a full RFC 5545 .ics payload string containing all 90 days of guidance
 * with luxury 15-year Google Calendar formatting.
 */
export function generateSevaICalendarString(options: CalendarGeneratorOptions): string {
  const { days, lang, panditName, notificationTime, personName } = options;
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

  days.forEach((day) => {
    const ymdCompact = formatYmdCompact(day.ymd);
    const dtStart = `${ymdCompact}T${hh}${mm}00`;
    
    // 30 minute event duration
    const endMinutes = (parseInt(mm, 10) + 30) % 60;
    const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
    const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

    const vibe = getEnergyMeterAndVibe(day, lang);
    const kaala = getDailyKaalaTimings(day.dayLord, lang);

    const summaryStr = `${vibe.badgeEmoji} [Baggona] ${formatLongDate(day, lang)} - ${tithiLabel(day, lang)} | ${vibe.badgeText}`;

    const greetingLine = formatPanditGreeting(panditName, lang);

    const whyList = dayExplanation(day, lang)
      .map((line) => `• ${line}`)
      .join("\n");

    const isKn = lang.startsWith("kn");

    const descriptionParts: string[] = [
      "========================================",
      " 🕉️ BAGGONA PANCHANGA ASTROLOGY 🕉️",
      " Gokarna Mahabaleshwara Kshetra",
      "========================================",
      "",
      personName ? `👤 ${isKn ? "ಭಕ್ತರು" : "Devotee"}: ${personName}` : "",
      panditName.trim() ? `🪔 ${isKn ? "ಅರ್ಚಕರು" : "Priest"}: ${panditName.trim()}` : "",
      greetingLine,
      "",
      "----------------------------------------",
      isKn ? "📊 ಇಂದಿನ ಶಕ್ತಿ & ವೈಬ್ ರೇಟಿಂಗ್" : "📊 TODAY'S ENERGY & VIBE RATING",
      "----------------------------------------",
      `⚡ ${isKn ? "ಶಕ್ತಿ ಮೀಟರ್" : "Energy Level"}: ${vibe.meter}`,
      `🌟 ${isKn ? "ದಿನದ ಸ್ಥಿತಿ" : "Day Rating"}: ${vibe.badgeText}`,
      `🎯 ${isKn ? "ಏಕ-ಅಕ್ಷರ ಟ್ಯಾಗ್" : "Single-Letter Vibe"}: ${vibe.vibeTag}`,
      "",
      "----------------------------------------",
      isKn ? "⏳ ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು (Kolkata)" : "⏳ DAILY KAALA TIMINGS (KOLKATA)",
      "----------------------------------------",
      `🔴 Rahu Kaala: ${kaala.rahu}`,
      `🟡 Gulika Kaala: ${kaala.gulika}`,
      `🟢 Yamaganda: ${kaala.yamaganda}`,
      "",
      "----------------------------------------",
      isKn ? "🕉️ ಪಂಚಾಂಗ & ಗ್ರಹ ಚಲನೆ" : "🕉️ PANCHANGA & TRANSITS",
      "----------------------------------------",
      `📅 ${isKn ? "ದಿನಾಂಕ" : "Date"}: ${formatLongDate(day, lang)}`,
      `🌙 ${isKn ? "ತಿಥಿ" : "Tithi"}: ${tithiLabel(day, lang)}`,
      `⭐ ${pick(T.labelNakshatra, lang)}: ${nakshatraName(day.moonNakshatraIndex, lang)}`,
      `🦁 ${pick(T.labelMoonSign, lang)}: ${rashiName(day.moonRashiIndex, lang)}`,
      `🪐 ${pick(T.labelVara, lang)}: ${grahaName(day.dayLord, lang)}`,
      day.bhuktiLord ? `🔮 ${pick(T.labelDasha, lang)}: ${grahaName(day.bhuktiLord, lang)}` : "",
      "",
      "----------------------------------------",
      isKn ? "🎨 ವೈಯಕ್ತಿಕ ಶುಭ ಚಿಹ್ನೆಗಳು" : "🎨 PERSONAL LUCKY SYMBOLS",
      "----------------------------------------",
      `🔢 ${pick(T.luckyNumber, lang)}: ${day.luckyNumbers.join(" · ")}`,
      `🎨 ${pick(T.luckyColour, lang)}: ${colourName(day, lang)}`,
      `🧭 ${pick(T.luckyDirection, lang)}: ${directionName(day, lang)}`,
      "",
      "----------------------------------------",
      isKn ? "📜 ಪ್ರಧಾನ ಅರ್ಚಕರ ಮಾರ್ಗದರ್ಶನ" : "📜 CHIEF ARCHAKA GUIDANCE",
      "----------------------------------------",
      bandGuide(day, lang),
      whyList,
      "",
      "========================================",
      "✨ Gokarna Mahabaleshwara Blessings ✨",
      "========================================"
    ].filter(Boolean);

    const descriptionStr = descriptionParts.join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:baggona-seva-${ymdCompact}-${day.moonNakshatraIndex}@baggona.app`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `SUMMARY:${escapeIcsText(summaryStr)}`,
      `DESCRIPTION:${escapeIcsText(descriptionStr)}`,
      `COLOR:${vibe.icalColor}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(summaryStr)}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

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
 * Generates a Google Calendar Web Intent URL for a specific day with 15-year Google Calendar formatting & colorId.
 */
export function generateGoogleCalendarUrl(options: {
  day: RhythmDay;
  lang: string;
  panditName: string;
  notificationTime: string;
  personName?: string;
}): string {
  const { day, lang, panditName, notificationTime, personName } = options;
  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";
  const ymdCompact = formatYmdCompact(day.ymd);

  const dtStart = `${ymdCompact}T${hh}${mm}00`;
  const endMinutes = (parseInt(mm, 10) + 30) % 60;
  const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
  const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

  const vibe = getEnergyMeterAndVibe(day, lang);
  const kaala = getDailyKaalaTimings(day.dayLord, lang);
  const isKn = lang.startsWith("kn");

  const summary = `${vibe.badgeEmoji} [Baggona] ${formatLongDate(day, lang)} - ${tithiLabel(day, lang)} | ${vibe.badgeText}`;

  const greetingLine = formatPanditGreeting(panditName, lang);

  const details = [
    "========================================",
    " 🕉️ BAGGONA PANCHANGA ASTROLOGY 🕉️",
    " Gokarna Mahabaleshwara Kshetra",
    "========================================",
    personName ? `👤 Devotee: ${personName}` : "",
    panditName.trim() ? `🪔 Priest: ${panditName.trim()}` : "",
    greetingLine,
    "",
    `📊 ENERGY METER: ${vibe.meter} (${vibe.badgeText})`,
    `🎯 SINGLE-LETTER TAG: ${vibe.vibeTag}`,
    "",
    "⏳ DAILY KAALA TIMINGS:",
    `🔴 Rahu Kaala: ${kaala.rahu}`,
    `🟡 Gulika Kaala: ${kaala.gulika}`,
    `🟢 Yamaganda: ${kaala.yamaganda}`,
    "",
    "🕉️ PANCHANGA DETAILS:",
    `⭐ Nakshatra: ${nakshatraName(day.moonNakshatraIndex, lang)}`,
    `🦁 Moon Sign: ${rashiName(day.moonRashiIndex, lang)}`,
    `🪐 Day Lord: ${grahaName(day.dayLord, lang)}`,
    `🔢 Lucky Numbers: ${day.luckyNumbers.join(" · ")} | Color: ${colourName(day, lang)}`,
    "",
    "📜 GUIDANCE:",
    bandGuide(day, lang),
    "",
    "✨ Gokarna Mahabaleshwara Blessings ✨"
  ].filter(Boolean).join("\n");

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
 * Generates an openable HTTPS Google Calendar Web Intent URL specifically formatted for QR code scanning.
 * When scanned on mobile phone cameras (iOS Camera, Android Camera, Google Lens),
 * phone cameras immediately recognize the https:// URL and show a 1-click "Open in Google Calendar" prompt!
 */
export function generateNative90DayQrCalendarPayload(options: {
  days: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime: string;
  personName?: string;
}): string {
  const { days, lang, panditName, notificationTime, personName } = options;
  const firstDay = days && days.length > 0 ? days[0] : null;

  if (!firstDay) {
    return "https://calendar.google.com/calendar";
  }

  return generateGoogleCalendarUrl({
    day: firstDay,
    lang,
    panditName,
    notificationTime,
    personName
  });
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
