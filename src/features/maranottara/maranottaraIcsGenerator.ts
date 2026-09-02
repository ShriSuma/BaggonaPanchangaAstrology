import type { MaranottaraResult, MasikaScheduleItem } from "./maranottaraEngine";
import type { MaranottaraLang } from "./maranottaraLocale";

/** Helper to escape special characters per RFC 5545 */
function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Convert YYYY-MM-DD string to compact YYYYMMDD */
function formatYmdCompact(ymd: string): string {
  return ymd.replace(/-/g, "");
}

/**
 * Generate RFC 5545 compliant .ICS iCalendar content for Priest & Devotee mobile synchronization.
 * Contains:
 * - 13 Days of Antyesti rites
 * - 12 to 60 Monthly Masika Shraddhas scheduled during exact Aparahna Kaala
 * - Annual Varshika Shraddhas
 * - 24-hour advance ritual reminder alarms
 * - Certified Priest contact: Sri Shreeram Pandit (+91 99723 39362)
 */
export function generateMaranottaraICalendar(
  result: MaranottaraResult,
  lang: MaranottaraLang = "kn"
): string {
  const code = (lang || "kn").slice(0, 2) as MaranottaraLang;

  const calName =
    code === "kn"
      ? `ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಶ್ರಾದ್ಧ & ಪಿತೃ ಸಂಸ್ಕಾರ (${result.personName})`
      : code === "hi"
      ? `बग्गोण पंचांग — श्राद्ध एवं पितृ संस्कार (${result.personName})`
      : code === "te"
      ? `బగ్గోణ పంచాంగం — శ్రాద్ధ & పితృ సంస్కారం (${result.personName})`
      : code === "ta"
      ? `பக்கோண பஞ்சாங்கம் — சிரார்த்த & பித்ரு சம்ஸ்காரம் (${result.personName})`
      : `Baggona Panchanga — Shraddha & Pitru Samskara (${result.personName})`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Astrology//NONSGML Pitru Samskara v3.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(calName)}`,
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

  // 1. Add 13 Days Antyesti Roadmap as Full-Day Events
  result.antyestiRoadmap.forEach((day) => {
    // Parse approximate gregorian day offset from demise date
    const [y, m, d] = result.demiseDate.split("-").map(Number);
    const eventDate = new Date(Date.UTC(y, m - 1, d + (day.dayNumber - 1)));
    const ymd = eventDate.toISOString().split("T")[0];
    const nextDate = new Date(Date.UTC(y, m - 1, d + day.dayNumber));
    const nextYmd = nextDate.toISOString().split("T")[0];

    const dtStart = formatYmdCompact(ymd);
    const dtEnd = formatYmdCompact(nextYmd);

    const title = day.dayTitle[code] || day.dayTitle.kn;
    const ritual = day.rituals[code] || day.rituals.kn;
    const significance = day.significance[code] || day.significance.kn;
    const offerings = day.keyOfferings[code] || day.keyOfferings.kn;

    const descLines: string[] = [
      "╔═══════════════════════════════════════════════════════════════╗",
      "           ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಅಂತ್ಯೇಷ್ಟಿ ನಿತ್ಯ ಸಂಸ್ಕಾರ ॥        ",
      "╚═══════════════════════════════════════════════════════════════╝",
      "",
      `👤 ಮೃತರ ಹೆಸರು: ${result.personName}`,
      `📅 ದಿನ: ${title}`,
      "",
      `🕉️ ನಿತ್ಯ ವಿಧಿ: ${ritual}`,
      `📜 ತಾತ್ಪರ್ಯ: ${significance}`,
      `🪔 ಸಮರ್ಪಣೆ: ${offerings}`,
      "",
      "---------------------------------------------------------------",
      "🏛️ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ",
      "🕉️ ಮುಖ್ಯ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 99723 39362)",
      "ನಾರಾಯಣಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಸಮಾಲೋಚನೆ"
    ];

    lines.push(
      "BEGIN:VEVENT",
      `UID:antyesti-d${day.dayNumber}-${result.demiseDate}-${Math.abs(result.personName.length)}@baggonapanchanga.web.app`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${escapeIcs(`[ಅಂತ್ಯೇಷ್ಟಿ D${day.dayNumber}] ${title} — ${result.personName}`)}`,
      `DESCRIPTION:${escapeIcs(descLines.join("\n"))}`,
      "LOCATION:Gokarna Kshetra / Home",
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(`ನಾಳೆ ${title} - ಪೂರ್ವಸಿದ್ಧತೆ ನೆನಪೋಲೆ`)}`,
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  // 2. Add 12 to 60 Monthly Masika Shraddhas scheduled during exact Aparahna Kaala
  result.masikaSchedule.forEach((item: MasikaScheduleItem) => {
    const compactDate = formatYmdCompact(item.gregorianDate);
    const uid = `masika-m${item.monthIndex}-${item.gregorianDate}-${Math.abs(result.personName.length)}@baggonapanchanga.web.app`;

    // Aparahna default 13:30 to 15:45 IST
    const dtStart = `${compactDate}T133000`;
    const dtEnd = `${compactDate}T154500`;

    const masikaTitle = item.masikaName[code] || item.masikaName.kn;
    const tithiLabel = item.tithiName[code] || item.tithiName.kn;
    const pakshaLabel = item.paksha[code] || item.paksha.kn;
    const weekdayLabel = item.dayOfWeek[code] || item.dayOfWeek.kn;
    const dateFormatted = item.formattedDateStr[code] || item.formattedDateStr.kn;
    const notes = item.ritualNotes[code] || item.ritualNotes.kn;
    const aparahnaTiming = item.aparahnaWindow || "01:30 PM - 03:45 PM IST";

    const summaryPrefix = item.isVarshikaShraddha ? "🌟 [ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ]" : "॥ ಬಗ್ಗೋಣ ॥";
    const summary = `${summaryPrefix} ${masikaTitle} — ${result.personName} (${tithiLabel})`;

    const descLines: string[] = [
      "╔═══════════════════════════════════════════════════════════════╗",
      item.isVarshikaShraddha
        ? "           ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ವಾರ್ಷಿಕ ಮಹಾ ಶ್ರಾದ್ಧ ॥            "
        : "           ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಮಾಸಿಕ ಶ್ರಾದ್ಧ ನಿರ್ಣಯ ॥           ",
      "╚═══════════════════════════════════════════════════════════════╝",
      "",
      `👤 ಮೃತರ ಹೆಸರು: ${result.personName}`,
      `📅 ಶ್ರಾದ್ಧ ದಿನಾಂಕ: ${dateFormatted} (${weekdayLabel})`,
      `⏳ ಅಪರಾಹ್ನ ಕಾಲ (ಶ್ರಾದ್ಧ ಕಾಲ): ${aparahnaTiming}`,
      `📜 ತಿಥಿ & ಪಕ್ಷ: ${tithiLabel} (${pakshaLabel})`,
      `🌙 ಮಾಸಿಕ ಅನುಕ್ರಮ: ${masikaTitle}`,
      "",
      `🪔 ವಿಧಿ & ಆಚರಣೆ: ${notes}`,
      "",
      "---------------------------------------------------------------",
      "🏛️ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ",
      "🕉️ ಮುಖ್ಯ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      "📞 ಮೊಬೈಲ್: +91 99723 39362",
      "🌐 ವೆಬ್‌ಸೈಟ್: https://baggonapanchanga.web.app/maranottara"
    ];

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
      `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
      `SUMMARY:${escapeIcs(summary)}`,
      `DESCRIPTION:${escapeIcs(descLines.join("\n"))}`,
      `LOCATION:${escapeIcs(result.location || "Gokarna Kshetra / Home")}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      // 24h Prior Alarm
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(`ನಾಳೆ ${masikaTitle} — ಪೂರ್ವಸಿದ್ಧತೆ (ಎಳ್ಳು, ದರ್ಭೆ, ಅನ್ನಪಿಂದ, ತುಪ್ಪ)`)}`,
      "TRIGGER:-P1D",
      "END:VALARM",
      // 2h Prior Alarm on day of Shraddha
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(`ಇಂದು ${masikaTitle} — ಅಪರಾಹ್ನ ಶ್ರಾದ್ಧ ಸಮಯ: ${aparahnaTiming}`)}`,
      "TRIGGER:-PT2H",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Trigger browser download of .ics calendar file */
export function downloadMaranottaraIcsFile(
  result: MaranottaraResult,
  lang: MaranottaraLang = "kn"
): void {
  const icsString = generateMaranottaraICalendar(result, lang);
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const cleanName = result.personName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `Baggona_Shraddha_Masika_${cleanName || "Calendar"}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
