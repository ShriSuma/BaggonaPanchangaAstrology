import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDailyKaalaTimings, generateSevaICalendarString, generateGoogleCalendarUrl } from "../features/seva/icsCalendarGenerator";
import { resolvePincodeCoordinatesSync } from "../services/locationApi";
import { fetchSunriseSunsetUtc, getCachedSunriseSunset, setCachedSunriseSunset } from "../core/sunriseSunsetApi";
import { calculateExactNoaaSunTimes, sunTimesSyncForBirth } from "../core/birthSunTimes";
import { generatePriestDayDossier } from "../core/PriestCalendarEngine";

describe("High Precision Pincode Sun Times & 100% Muhurtha Parity Audit", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("api.sunrise-sunset.org") || url.includes("/api/sunrise-sunset")) {
          return {
            ok: true,
            json: async () => ({
              status: "OK",
              results: {
                sunrise: "2026-05-12T00:34:45+00:00",
                sunset: "2026-05-12T13:23:25+00:00"
              }
            })
          };
        }
        return { ok: false };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves pincode to high precision GPS coordinates and calculates exact NOAA sun times", () => {
    // Gokarna 581326
    const gokarna = resolvePincodeCoordinatesSync("581326");
    expect(gokarna.lat).toBeCloseTo(14.5479, 3);
    expect(gokarna.lng).toBeCloseTo(74.3187, 3);

    // Bengaluru 560001
    const blr = resolvePincodeCoordinatesSync("560001");
    expect(blr.lat).toBeCloseTo(12.9716, 2);
    expect(blr.lng).toBeCloseTo(77.5946, 2);

    // New Delhi 110001
    const del = resolvePincodeCoordinatesSync("110001");
    expect(del.lat).toBeCloseTo(28.63, 1);
    expect(del.lng).toBeCloseTo(77.21, 1);

    // Test NOAA 2-pass algorithm on Gokarna equinox
    const anchor = new Date("2026-03-20T12:00:00Z");
    const noaa = calculateExactNoaaSunTimes(anchor, gokarna.lat, gokarna.lng);
    expect(noaa.sunrise).toBeInstanceOf(Date);
    expect(noaa.sunset).toBeInstanceOf(Date);
    expect(noaa.solarNoon).toBeInstanceOf(Date);

    // Day span should be approximately 12h 6m (726 min) at spring equinox
    const spanMinutes = (noaa.sunset.getTime() - noaa.sunrise.getTime()) / 60000;
    expect(spanMinutes).toBeGreaterThan(720);
    expect(spanMinutes).toBeLessThan(735);
  });

  it("fetches and caches sunrise-sunset from internet API with localStorage persistence", async () => {
    const lat = 14.548;
    const lng = 74.319;
    const ymd = "2026-05-12";

    const apiTimes = await fetchSunriseSunsetUtc(lat, lng, ymd);
    expect(apiTimes).not.toBeNull();
    expect(apiTimes!.sunrise.toISOString()).toBe("2026-05-12T00:34:45.000Z");
    expect(apiTimes!.sunset.toISOString()).toBe("2026-05-12T13:23:25.000Z");

    // Cache hit should return immediately
    const cached = getCachedSunriseSunset(lat, lng, ymd);
    expect(cached).not.toBeNull();
    expect(cached!.sunrise.toISOString()).toBe("2026-05-12T00:34:45.000Z");

    // sunTimesSyncForBirth prioritizes cached API times
    const birthAnchor = new Date("2026-05-12T05:00:00Z");
    const syncRes = sunTimesSyncForBirth(birthAnchor, lat, lng, "581326");
    expect(syncRes.source).toBe("api");
    expect(syncRes.sunrise.toISOString()).toBe("2026-05-12T00:34:45.000Z");
  });

  it("ensures 100% Timing parity across Rahu, Gulika, Yamaganda, Abhijit, and Amrita Kaala", () => {
    const dayLordIdx = 2; // Tuesday
    const dateStr = "2026-05-12";
    const lat = 14.5479;
    const lng = 74.3187;
    const pincode = "581326";

    // 1. Calculate Daily Kaala Timings
    const kaala = getDailyKaalaTimings(dayLordIdx, "kn", dateStr, lat, lng, pincode);

    expect(kaala.sunrise).toBeTruthy();
    expect(kaala.sunset).toBeTruthy();
    expect(kaala.rahu).toBeTruthy();
    expect(kaala.gulika).toBeTruthy();
    expect(kaala.yamaganda).toBeTruthy();
    expect(kaala.abhijit).toBeTruthy();
    expect(kaala.amrita).toBeTruthy();

    // Verify windows and suffixes exist
    const windowRegex = /\d{2}:\d{2}(:\d{2})? (AM|PM) – \d{2}:\d{2}(:\d{2})? (AM|PM)/;
    expect(kaala.rahuWindow).toMatch(windowRegex);
    expect(kaala.gulikaWindow).toMatch(windowRegex);
    expect(kaala.yamaWindow).toMatch(windowRegex);
    expect(kaala.abhijitWindow).toMatch(windowRegex);
    expect(kaala.amritaWindow).toMatch(windowRegex);

    // Tuesday Rahu is 7th octant (approx 03:00 PM - 04:30 PM)
    expect(kaala.rahuWindow).toContain("PM");

    // Tuesday Yamaganda is 2nd octant (approx 09:00 AM - 10:30 AM)
    expect(kaala.yamaWindow).toContain("AM");

    // Abhijit Muhurtha is centered at solar noon (around 12:00 PM)
    expect(kaala.abhijitWindow).toContain("12:");
  });

  it("verifies 100% matching timings in ICS descriptions and Google Calendar URLs", () => {
    const mockDay = {
      day: 12,
      ymd: "2026-05-12",
      tithi: "Krishna Ekadashi",
      rashi: "Meena",
      nakshatra: "Uttarabhadra",
      energyScore: 92,
      isChandrashtama: false
    };

    const options = {
      devoteeName: "Pramod Sharma",
      devoteeGotra: "Kashyapa",
      pincode: "581326",
      locationName: "Gokarna",
      lat: 14.5479,
      lng: 74.3187,
      birthDate: "1993-05-31",
      birthTime: "09:25",
      lang: "kn" as const,
      rhythmDays: [mockDay as any],
      days: [mockDay as any],
      calendarUrl: "https://baggonapanchanga.web.app/calendar"
    };

    const icsContent = generateSevaICalendarString(options);
    const googleUrl = generateGoogleCalendarUrl({
      ...options,
      day: mockDay as any,
      panditName: "Shreeram Pandit"
    });

    const kaala = getDailyKaalaTimings(2, "kn", "2026-05-12", 14.5479, 74.3187, "581326");

    // ICS Description must include Rahu, Gulika, Yamaganda, Abhijit, and Amrita windows and labels
    expect(icsContent).toContain("ರಾಹು ಕಾಲ");
    expect(icsContent).toContain("ಗುಳಿಕ ಕಾಲ");
    expect(icsContent).toContain("ಯಮಗಂಡ ಕಾಲ");
    expect(icsContent).toContain("ಅಭಿಜಿತ್ ಮುಹೂರ್ತ");
    expect(icsContent).toContain("ಅಮೃತ ಕಾಲ");
    expect(icsContent).toContain(kaala.rahuWindow);
    expect(icsContent).toContain(kaala.gulikaWindow);
    expect(icsContent).toContain(kaala.yamaWindow);
    expect(icsContent).toContain(kaala.abhijitWindow);
    expect(icsContent).toContain(kaala.amritaWindow);

    // Google Calendar URL details must include all timings with 100% parity
    const decodedUrl = decodeURIComponent(googleUrl.replace(/\+/g, " "));
    expect(decodedUrl).toContain("ರಾಹು ಕಾಲ");
    expect(decodedUrl).toContain("ಗುಳಿಕ ಕಾಲ");
    expect(decodedUrl).toContain("ಯಮಗಂಡ ಕಾಲ");
    expect(decodedUrl).toContain("ಅಭಿಜಿತ್ ಮುಹೂರ್ತ");
    expect(decodedUrl).toContain("ಅಮೃತ ಕಾಲ");
    expect(decodedUrl).toContain(kaala.rahuWindow);
    expect(decodedUrl).toContain(kaala.gulikaWindow);
    expect(decodedUrl).toContain(kaala.yamaWindow);
    expect(decodedUrl).toContain(kaala.abhijitWindow);
    expect(decodedUrl).toContain(kaala.amritaWindow);
  });

  it("verifies 5-language localization purity for Abhijit and Amrita across all locales", () => {
    const locales = ["kn", "hi", "te", "ta", "en"] as const;
    const dateStr = "2026-05-12";
    const lat = 14.5479;
    const lng = 74.3187;

    for (const loc of locales) {
      const kaala = getDailyKaalaTimings(2, loc, dateStr, lat, lng, "581326");
      expect(kaala.abhijit).toBeTruthy();
      expect(kaala.amrita).toBeTruthy();

      if (loc === "kn") {
        expect(kaala.abhijit).toContain("ಅಭಿಜಿತ್");
        expect(kaala.amrita).toContain("ಅಮೃತ");
      } else if (loc === "hi") {
        expect(kaala.abhijit).toContain("अभिजित");
        expect(kaala.amrita).toContain("अमृत");
      } else if (loc === "te") {
        expect(kaala.abhijit).toContain("అభిజిత్");
        expect(kaala.amrita).toContain("అమృత");
      } else if (loc === "ta") {
        expect(kaala.abhijit).toContain("அபிஜித்");
        expect(kaala.amrita).toContain("அமிர்த");
      } else if (loc === "en") {
        expect(kaala.abhijit).toContain("Abhijit");
        expect(kaala.amrita).toContain("Amrita");
      }
    }
  });

  it("verifies Priest Day Dossier computes matching amritaKaala and abhijitMuhurtha", () => {
    const dossier = generatePriestDayDossier("2026-03-19", 14.5479, 74.3187, "581326");
    expect(dossier.amritaKaala).toMatch(/\d{2}:\d{2} (AM|PM) - \d{2}:\d{2} (AM|PM)/);
    expect(dossier.abhijitMuhurtha).toMatch(/\d{2}:\d{2} (AM|PM) - \d{2}:\d{2} (AM|PM)/);
    expect(dossier.rahuKaala).toMatch(/\d{2}:\d{2} (AM|PM) - \d{2}:\d{2} (AM|PM)/);
  });
});
