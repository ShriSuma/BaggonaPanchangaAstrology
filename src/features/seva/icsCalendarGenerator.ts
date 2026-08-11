/**
 * Generates RFC 5545 standard iCalendar (.ics) files and Google Calendar links
 * for 6-month daily Panchanga recommendations, mantras, and personalized priest blessings.
 */

import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  BAND_LABEL_L5,
  GRAHA_MANTRA_SANSKRIT,
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

export type CalendarGeneratorOptions = {
  days: RhythmDay[];
  lang: string;
  panditName: string;
  notificationTime: string; // "08:00", "06:00", etc.
  personName?: string;
};

/**
 * Builds a full RFC 5545 .ics payload string containing all 180 days of guidance.
 */
export function generateSevaICalendarString(options: CalendarGeneratorOptions): string {
  const { days, lang, panditName, notificationTime, personName } = options;
  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Astrology//NONSGML Seva Calendar v1.0//EN",
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

    const summaryStr = `[Baggona] ${formatLongDate(day, lang)} - ${tithiLabel(day, lang)} (${pick(BAND_LABEL_L5[day.band], lang)})`;

    const greetingLine = panditName.trim()
      ? `${pick(T.namaskaraHeader, lang)} ${panditName.trim()},`
      : "Namaskara from Baggona Gokarna Kshetra,";

    const whyList = dayExplanation(day, lang)
      .map((line) => `• ${line}`)
      .join("\n");

    const descriptionParts: string[] = [
      greetingLine,
      "----------------------------------------",
      `● ${pick(T.whatToDo, lang)}:`,
      bandGuide(day, lang),
      "",
      `● ${pick(T.labelNakshatra, lang)}: ${nakshatraName(day.moonNakshatraIndex, lang)}`,
      `● ${pick(T.labelMoonSign, lang)}: ${rashiName(day.moonRashiIndex, lang)}`,
      `● ${pick(T.labelVara, lang)}: ${grahaName(day.dayLord, lang)}`,
      day.bhuktiLord ? `● ${pick(T.labelDasha, lang)}: ${grahaName(day.bhuktiLord, lang)}` : "",
      "",
      `● ${pick(T.luckyNumber, lang)}: ${day.luckyNumbers.join(" · ")}`,
      `● ${pick(T.luckyColour, lang)}: ${colourName(day, lang)}`,
      `● ${pick(T.luckyDirection, lang)}: ${directionName(day, lang)}`,
      "",
      `● ${pick(T.whyThisDay, lang)}:`,
      whyList,
      "",
      `● ${pick(T.dailyMantra, lang)}:`,
      GRAHA_MANTRA_SANSKRIT[day.dayLord],
      `(${pick(T.chantCount, lang)})`
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

/**
 * Generates a Google Calendar Web Intent URL for a specific day.
 */
export function generateGoogleCalendarUrl(options: {
  day: RhythmDay;
  lang: string;
  panditName: string;
  notificationTime: string;
}): string {
  const { day, lang, panditName, notificationTime } = options;
  const [hours, minutes] = (notificationTime || "08:00").split(":");
  const hh = hours?.padStart(2, "0") || "08";
  const mm = minutes?.padStart(2, "0") || "00";
  const ymdCompact = formatYmdCompact(day.ymd);

  const dtStart = `${ymdCompact}T${hh}${mm}00`;
  const endMinutes = (parseInt(mm, 10) + 30) % 60;
  const endHours = parseInt(hh, 10) + Math.floor((parseInt(mm, 10) + 30) / 60);
  const dtEnd = `${ymdCompact}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;

  const summary = `[Baggona] ${formatLongDate(day, lang)} - ${tithiLabel(day, lang)}`;
  
  const greetingLine = panditName.trim()
    ? `${pick(T.namaskaraHeader, lang)} ${panditName.trim()},`
    : "Namaskara from Baggona Gokarna Kshetra,";

  const details = [
    greetingLine,
    "----------------------------------------",
    `${pick(T.whatToDo, lang)}: ${bandGuide(day, lang)}`,
    `${pick(T.labelNakshatra, lang)}: ${nakshatraName(day.moonNakshatraIndex, lang)}`,
    `${pick(T.labelMoonSign, lang)}: ${rashiName(day.moonRashiIndex, lang)}`,
    `${pick(T.labelVara, lang)}: ${grahaName(day.dayLord, lang)}`,
    `${pick(T.luckyNumber, lang)}: ${day.luckyNumbers.join(" · ")} | ${colourName(day, lang)} | ${directionName(day, lang)}`,
    `Mantra: ${GRAHA_MANTRA_SANSKRIT[day.dayLord]}`
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
