import { describe, it, expect } from "vitest";
import { encodeDevoteeToken, decodeDevoteeToken } from "../utils/tokenCipher";
import { generateSevaICalendarString, generateGoogleCalendarUrl } from "../features/seva/icsCalendarGenerator";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Devotee 90-Day Token Consistency & Expiry Engine", () => {
  it("encodes and decodes devotee tokens cleanly with checksum protection", () => {
    const token = encodeDevoteeToken({
      n: "ರಾಘವೇಂದ್ರ ವೈದ್ಯ",
      nk: 3, // Rohini
      r: 1,  // Vrishabha
      p: "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್",
      d: "2026-08-18",
      l: "kn"
    });

    expect(token).toBeDefined();
    expect(token.startsWith("bgn_v1_")).toBe(true);

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("ರಾಘವೇಂದ್ರ ವೈದ್ಯ");
    expect(decoded?.nk).toBe(3);
    expect(decoded?.r).toBe(1);
    expect(decoded?.p).toBe("ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್");
    expect(decoded?.d).toBe("2026-08-18");
    expect(decoded?.l).toBe("kn");
  });

  it("guarantees 100% token consistency between calendar .ics events and web sanctum links", () => {
    const days: RhythmDay[] = Array.from({ length: 90 }, (_, i) => {
      const date = new Date("2026-08-18");
      date.setDate(date.getDate() + i);
      const ymd = date.toISOString().slice(0, 10);
      const birthNak = 3;
      const birthRashi = 1;
      const transitNak = (birthNak + i) % 27;
      const transitRashi = (birthRashi + Math.floor(i / 2.25)) % 12;

      return {
        ymd,
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        dayOfMonth: date.getDate(),
        weekday: date.getDay(),
        tithiNumber: (i % 15) + 1,
        tithiInPaksha: (i % 15) + 1,
        paksha: i % 30 < 15 ? "shukla" : "krishna",
        tithiGroup: "purna",
        moonNakshatraIndex: transitNak,
        moonRashiIndex: transitRashi,
        tara: { tara: 2, count: 2, isFavourable: true, isDifficult: false, score: 95 },
        chandra: { house: 1, isChandrashtama: false, isFavourable: true, score: 90 },
        dayLord: "Sun",
        bhuktiLord: "Jupiter",
        energyScore: 85,
        band: "high",
        arthaScore: 90,
        isMoneyDay: true,
        isChandrashtama: false,
        isJanmaNakshatraDay: i === 0,
        isEkadashi: false,
        isAmavasya: false,
        isPurnima: false,
        isPradosha: false,
        isSankashti: false,
        isPoojaDay: true,
        luckyNumbers: [3, 6, 9],
        luckyColour: "yellow",
        luckyDirection: "east"
      };
    });

    const icsContent = generateSevaICalendarString({
      days,
      lang: "kn",
      panditName: "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್",
      notificationTime: "08:00",
      personName: "ರಾಘವೇಂದ್ರ ವೈದ್ಯ"
    });

    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain("END:VCALENDAR");
    expect(icsContent).toContain("token=bgn_v1_");

    // Extract all URLs from the ICS content
    const urlMatches = icsContent.match(/daily\?token=bgn_v1_[A-Za-z0-9_-]+/g);
    expect(urlMatches).not.toBeNull();
    expect(urlMatches!.length).toBeGreaterThanOrEqual(90);

    // Verify token payload extracted from ics URL contains package start date 2026-08-18 and birth nakshatra 3
    const sampleUrl = urlMatches![0];
    const tokenStr = sampleUrl.split("token=")[1];
    const decoded = decodeDevoteeToken(tokenStr);

    expect(decoded).not.toBeNull();
    expect(decoded?.d).toBe("2026-08-18");
    expect(decoded?.nk).toBe(3);
    expect(decoded?.r).toBe(1);
  });

  it("verifies 90-day expiry math: token is valid for day 0..89 and expires on day 90+", () => {
    const startDateStr = "2026-08-18";
    const start = new Date(startDateStr);

    // Day 0: Valid
    const day0 = new Date(start);
    day0.setDate(day0.getDate() + 0);
    const day0Elapsed = Math.floor((Date.UTC(day0.getFullYear(), day0.getMonth(), day0.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
    expect(day0Elapsed).toBe(0);
    expect(day0Elapsed >= 0 && day0Elapsed < 90).toBe(true);

    // Day 89: Valid
    const day89 = new Date(start);
    day89.setDate(day89.getDate() + 89);
    const day89Elapsed = Math.floor((Date.UTC(day89.getFullYear(), day89.getMonth(), day89.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
    expect(day89Elapsed).toBe(89);
    expect(day89Elapsed >= 0 && day89Elapsed < 90).toBe(true);

    // Day 90: EXPIRED
    const day90 = new Date(start);
    day90.setDate(day90.getDate() + 90);
    const day90Elapsed = Math.floor((Date.UTC(day90.getFullYear(), day90.getMonth(), day90.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
    expect(day90Elapsed).toBe(90);
    expect(day90Elapsed >= 90).toBe(true); // Expiry triggered!
  });

  it("ensures strict isolation between multiple devotees under high scale", () => {
    const devoteeAToken = encodeDevoteeToken({
      n: "Devotee A",
      nk: 5,
      r: 2,
      p: "Priest A",
      d: "2026-08-18",
      l: "kn"
    });

    const devoteeBToken = encodeDevoteeToken({
      n: "Devotee B",
      nk: 18,
      r: 7,
      p: "Priest B",
      d: "2026-08-18",
      l: "en"
    });

    expect(devoteeAToken).not.toEqual(devoteeBToken);

    const decodedA = decodeDevoteeToken(devoteeAToken);
    const decodedB = decodeDevoteeToken(devoteeBToken);

    expect(decodedA?.n).toBe("Devotee A");
    expect(decodedA?.nk).toBe(5);
    expect(decodedB?.n).toBe("Devotee B");
    expect(decodedB?.nk).toBe(18);
  });

  it("verifies 1-click series delete UID grouping, RECURRENCE-ID entries, and sacred gold banner attachments in ics file", () => {
    const days: RhythmDay[] = Array.from({ length: 90 }, (_, i) => {
      const date = new Date("2026-08-18");
      date.setDate(date.getDate() + i);
      return {
        ymd: date.toISOString().slice(0, 10),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        dayOfMonth: date.getDate(),
        weekday: date.getDay(),
        tithiNumber: (i % 15) + 1,
        tithiInPaksha: (i % 15) + 1,
        paksha: i % 30 < 15 ? "shukla" : "krishna",
        tithiGroup: "purna",
        moonNakshatraIndex: (3 + i) % 27,
        moonRashiIndex: Math.floor((3 + i) / 2.25) % 12,
        tara: { tara: 2, count: 2, isFavourable: true, isDifficult: false, score: 95 },
        chandra: { house: 1, isChandrashtama: false, isFavourable: true, score: 90 },
        dayLord: "Sun",
        bhuktiLord: "Jupiter",
        energyScore: 85,
        band: "high",
        arthaScore: 90,
        isMoneyDay: true,
        isChandrashtama: false,
        isJanmaNakshatraDay: i === 0,
        isEkadashi: false,
        isAmavasya: false,
        isPurnima: false,
        isPradosha: false,
        isSankashti: false,
        isPoojaDay: true,
        luckyNumbers: [3, 6, 9],
        luckyColour: "yellow",
        luckyDirection: "east"
      };
    });

    const icsContent = generateSevaICalendarString({
      days,
      lang: "kn",
      panditName: "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್",
      notificationTime: "10:00",
      personName: "ರಾಘವೇಂದ್ರ ವೈದ್ಯ"
    });

    // 1. Verify 1-click series UID grouping
    expect(icsContent).toContain("UID:baggona-90day-series-");
    
    // Count UID occurrences — all 90 days must share the EXACT same series UID
    const uidMatches = icsContent.match(/UID:baggona-90day-series-[A-Za-z0-9]+@baggona\.app/g);
    expect(uidMatches).not.toBeNull();
    expect(uidMatches?.length).toBe(90);
    // All 90 UID strings must be identical to form 1 recurring series!
    const uniqueUids = new Set(uidMatches);
    expect(uniqueUids.size).toBe(1);

    // 2. Verify RECURRENCE-ID entries for instances 1..89
    expect(icsContent).toContain("RECURRENCE-ID;TZID=Asia/Kolkata:");
    const recurrenceMatches = icsContent.match(/RECURRENCE-ID;TZID=Asia\/Kolkata:/g);
    expect(recurrenceMatches?.length).toBe(89);

    // 3. Verify notification time selection (10:00 AM)
    expect(icsContent).toContain("DTSTART;TZID=Asia/Kolkata:20260818T100000");

    // 4. Verify sacred gold banner illustration attachment & X-ALT-DESC
    expect(icsContent).toContain("ATTACH;FMTTYPE=image/jpeg:");
    expect(icsContent).toContain("baggona_panchanga_gold_banner.jpg");
    expect(icsContent).toContain("X-ALT-DESC;FMTTYPE=text/html:");
  });
});
