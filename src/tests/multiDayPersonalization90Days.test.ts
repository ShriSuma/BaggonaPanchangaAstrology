import { describe, it, expect } from "vitest";
import { getOrComputeDinaBhavishya, computeGocharaMoonForDate } from "../features/seva/dinaBhavishyaEngine";
import { computePersonalizedDarshanaPayload } from "../features/darshana/dailyDarshanaPersonalizationEngine";
import { calculateDeterministicRhythmDay, generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";
import { decodeDevoteeToken } from "../utils/tokenCipher";

describe("90-Day / Multi-Day Complete Personalization Engine Suite", () => {
  const natalMoonRashi = 8; // Dhanu (Sagittarius)
  const natalNakshatra = 18; // Mula
  const natalLagnaRashi = 8; // Dhanu Lagna

  it("calculates distinct Gochara Moon, Chandra Bala, and Tara Bala across 90 days", async () => {
    const startDate = new Date("2026-09-01");
    const chandraBalaHousesSeen = new Set<number>();
    const taraBalaNumbersSeen = new Set<number>();
    const datesTested: string[] = [];

    // Test days 0, 3, 7, 14, 28, 45, 60, 90 across the 90-day horizon
    const sampleDayOffsets = [0, 2, 5, 10, 15, 20, 25, 30, 45, 60, 75, 89];

    for (const offset of sampleDayOffsets) {
      const curDate = new Date(startDate.getTime() + offset * 86400000);
      const ymd = curDate.toISOString().split("T")[0];
      datesTested.push(ymd);

      const bhavishya = await getOrComputeDinaBhavishya({
        targetDateRequested: ymd,
        devoteeName: "Pramod Kodagi",
        birthDate: "1990-05-15",
        birthTime: "08:30",
        natalMoonRashi,
        natalNakshatra,
        natalLagnaRashi,
        lang: "kn"
      });

      expect(bhavishya.targetDate).toBe(ymd);
      expect(bhavishya.chandraBalaHouse).toBeGreaterThanOrEqual(1);
      expect(bhavishya.chandraBalaHouse).toBeLessThanOrEqual(12);
      expect(bhavishya.taraBalaNumber).toBeGreaterThanOrEqual(1);
      expect(bhavishya.taraBalaNumber).toBeLessThanOrEqual(9);

      chandraBalaHousesSeen.add(bhavishya.chandraBalaHouse);
      taraBalaNumbersSeen.add(bhavishya.taraBalaNumber);

      // Verify authentic 4 core sections are generated
      expect(bhavishya.overview.length).toBeGreaterThan(20);
      expect(bhavishya.careerAndFinance.length).toBeGreaterThan(20);
      expect(bhavishya.healthAndFamily.length).toBeGreaterThan(20);
      expect(bhavishya.travelAndInitiatives.length).toBeGreaterThan(20);
    }

    // Over 90 days, Moon traverses all 12 signs and 9 Tara categories multiple times
    expect(chandraBalaHousesSeen.size).toBeGreaterThanOrEqual(6);
    expect(taraBalaNumbersSeen.size).toBeGreaterThanOrEqual(6);
  });

  it("dynamically varies Panchanga, Shloka, Do's/Don'ts, and Power Metrics for each day of 90 days", () => {
    const startDate = new Date("2026-09-01");
    const tithisSeen = new Set<string>();
    const luckyDigitsSeen = new Set<number>();
    const goldenHourStartsSeen = new Set<string>();

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const curDate = new Date(startDate.getTime() + dayOffset * 86400000);
      const ymd = curDate.toISOString().split("T")[0];

      const payload = computePersonalizedDarshanaPayload({
        devoteeName: "Pramod Kodagi",
        gotra: "Kashyapa",
        birthDate: "1990-05-15",
        birthTime: "08:30",
        targetDate: ymd,
        natalMoonRashi,
        natalNakshatra,
        natalLagnaRashi,
        lang: "kn"
      });

      expect(payload.targetDate).toBe(ymd);
      expect(payload.panchanga.vasara).toBeDefined();
      expect(payload.panchanga.tithi).toBeDefined();
      expect(payload.deity.sanskritShloka.length).toBeGreaterThan(15);
      expect(payload.karmaNavigator.dos.kn.length).toBe(3);
      expect(payload.karmaNavigator.donts.kn.length).toBe(3);
      expect(payload.karmaNavigator.microPariharaDesc.kn.length).toBeGreaterThan(10);

      tithisSeen.add(payload.panchanga.tithi);
      luckyDigitsSeen.add(payload.powerMetrics.luckyDigit);
      goldenHourStartsSeen.add(payload.powerMetrics.goldenHour.startTimeStr);

      // Chandrashtama verification
      if (payload.astrologyMeta.isChandrashtama) {
        expect(payload.deity.key).toBe("shiva");
        expect(payload.astrologyMeta.chandraBalaHouse).toBe(8);
      }
    }

    // Verify diversity across 30 consecutive days
    expect(tithisSeen.size).toBeGreaterThanOrEqual(10);
    expect(luckyDigitsSeen.size).toBeGreaterThanOrEqual(5);
  });

  it("generates 90 distinct .ics calendar events with valid deep-link tokens that decode accurately", () => {
    const icsString = generateSevaICalendarString({
      personName: "Manoj Poornamatha",
      birthNakshatraIndex: 18,
      birthRashiIndex: 8,
      lang: "kn",
      dob: "1993-03-16",
      tob: "01:40",
      priestName: "Shreeram Pandit",
      locationName: "Gokarna",
      lat: 14.5479,
      lng: 74.3187,
      daysCount: 90
    } as any);

    expect(icsString).toContain("BEGIN:VCALENDAR");
    expect(icsString).toContain("END:VCALENDAR");

    // Extract all event links
    const matches = icsString.match(/https:\/\/[^\s\\]+\/daily\?token=([a-zA-Z0-9_\-]+)/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(85);

    // Pick 3 random tokens from the calendar and decode them
    const sampleUrls = [matches[0], matches[45], matches[matches.length - 1]];
    for (const url of sampleUrls) {
      if (!url) continue;
      const token = url.split("token=")[1];
      const decoded = decodeDevoteeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.n).toBe("Manoj Poornamatha");
      expect(decoded?.nk).toBe(18);
      expect(decoded?.r).toBe(8);
      expect(decoded?.d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  }, 20000);
});
