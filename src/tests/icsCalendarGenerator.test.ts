import { describe, expect, it } from "vitest";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import {
  generateGoogleCalendarUrl,
  generateNative90DayQrCalendarPayload,
  generateSevaICalendarString,
  getDailyKaalaTimings,
  getEnergyMeterAndVibe
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
  it("calculates accurate daily Kaala timings for Rahu, Gulika, and Yamaganda", () => {
    const kaalaTue = getDailyKaalaTimings("Mars", "en");
    expect(kaalaTue.rahu).toContain("03:00 PM – 04:30 PM");
    expect(kaalaTue.gulika).toContain("12:00 PM – 01:30 PM");
    expect(kaalaTue.yamaganda).toContain("09:00 AM – 10:30 AM");
  });

  it("calculates energy progress bar, color badge, and single-letter vibe tag", () => {
    const vibeHigh = getEnergyMeterAndVibe(mockDays[0]!, "en");
    expect(vibeHigh.badgeEmoji).toBe("🟢");
    expect(vibeHigh.meter).toContain("85%");
    expect(vibeHigh.vibeTag).toContain("⚡ A");
    expect(vibeHigh.googleColorId).toBe("10");

    const cautionDay: RhythmDay = {
      ...mockDays[0]!,
      band: "low",
      isChandrashtama: true,
      energyScore: 30
    };
    const vibeCaution = getEnergyMeterAndVibe(cautionDay, "en");
    expect(vibeCaution.badgeEmoji).toBe("🔴");
    expect(vibeCaution.vibeTag).toContain("🧘 S");
    expect(vibeCaution.googleColorId).toBe("11");
  });

  it("generates a luxury RFC 5545 iCalendar payload with visual meters and kaala timings", () => {
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
    expect(ics).toContain("🔴 Rahu Kaala");
    expect(ics).toContain("⚡");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("generates a valid Google Calendar Web link with colorId and RRULE recur parameter", () => {
    const url = generateGoogleCalendarUrl({
      day: mockDays[0]!,
      lang: "kn",
      panditName: "Chaitanya Pandit",
      notificationTime: "08:00",
      personName: "Pramod Kodagi"
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(url).toContain("ctz=Asia%2FKolkata");
    expect(url).toContain("dates=20260811T080000%2F20260811T083000");
    expect(url).toContain("recur=RRULE%3AFREQ%3DDAILY%3BCOUNT%3D90");
    expect(url).toContain("Rahu+Kaala");
  });

  it("generates an openable HTTPS URL payload for mobile QR camera scanning", () => {
    const payload = generateNative90DayQrCalendarPayload({
      days: mockDays,
      lang: "en",
      panditName: "Pandit Chaitanya",
      notificationTime: "08:00",
      personName: "Pramod Kodagi"
    });

    expect(payload).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(payload).toContain("RRULE%3AFREQ%3DDAILY%3BCOUNT%3D90");
  });
});
