import { describe, expect, it } from "vitest";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import {
  generateGoogleCalendarUrl,
  generateSevaICalendarString
} from "../features/seva/icsCalendarGenerator";

const mockDays: RhythmDay[] = [
  {
    ymd: "2026-08-11",
    year: 2026,
    monthIndex: 7, // August (0-indexed)
    dayOfMonth: 11,
    weekday: 2, // Tuesday
    tithiNumber: 29,
    tithiInPaksha: 14,
    paksha: "krishna",
    tithiGroup: "nanda",
    isAmavasya: false,
    isPurnima: false,
    moonRashiIndex: 3, // Karka
    moonNakshatraIndex: 6, // Punarvasu
    tara: {
      tara: 2,
      count: 2,
      isFavourable: true,
      isDifficult: false,
      score: 90
    },
    chandra: {
      house: 11,
      isChandrashtama: false,
      isFavourable: true,
      score: 85
    },
    dayLord: "Mars",
    bhuktiLord: "Saturn",
    band: "high",
    energyScore: 88,
    arthaScore: 80,
    isChandrashtama: false,
    isMoneyDay: true,
    isJanmaNakshatraDay: false,
    isEkadashi: false,
    isPradosha: false,
    isSankashti: false,
    isPoojaDay: false,
    luckyNumbers: [5, 9],
    luckyColour: "red",
    luckyDirection: "south"
  }
];

describe("icsCalendarGenerator", () => {
  it("generates a valid RFC 5545 iCalendar payload with custom Pandit name & 8:00 AM notification", () => {
    const ics = generateSevaICalendarString({
      days: mockDays,
      lang: "kn",
      panditName: "Chaitanya Pandit",
      notificationTime: "08:00",
      personName: "Pramod Kodagi"
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("X-WR-CALNAME:Baggona Panchanga - Pramod Kodagi");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;TZID=Asia/Kolkata:20260811T080000");
    expect(ics).toContain("DTEND;TZID=Asia/Kolkata:20260811T083000");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT0M");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("handles custom notification time (e.g. 06:00 AM) and priest greeting", () => {
    const ics = generateSevaICalendarString({
      days: mockDays,
      lang: "en",
      panditName: "Acharya Shastri",
      notificationTime: "06:00"
    });

    expect(ics).toContain("DTSTART;TZID=Asia/Kolkata:20260811T060000");
    expect(ics).toContain("Acharya Shastri");
  });

  it("generates a valid Google Calendar Web link", () => {
    const url = generateGoogleCalendarUrl({
      day: mockDays[0]!,
      lang: "kn",
      panditName: "Chaitanya Pandit",
      notificationTime: "08:00"
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(url).toContain("ctz=Asia%2FKolkata");
    expect(url).toContain("dates=20260811T080000%2F20260811T083000");
  });
});
