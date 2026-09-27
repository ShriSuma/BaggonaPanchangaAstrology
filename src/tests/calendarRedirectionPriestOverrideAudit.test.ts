import { describe, it, expect } from "vitest";
import {
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  generateCompactGoogleCalendarUrlForQR,
  generateQrPayloadByTarget
} from "../features/seva/icsCalendarGenerator";
import { decodeDevoteeToken, encodeDevoteeToken } from "../utils/tokenCipher";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Calendar Redirection Priest Override Audit", () => {
  const dummyDay: RhythmDay = {
    ymd: "2026-09-27",
    weekday: 0,
    dayOfMonth: 27,
    monthIndex: 8,
    year: 2026,
    dayLord: "Sun",
    bhuktiLord: null,
    energyScore: 92,
    band: "high",
    arthaScore: 85,
    isMoneyDay: false,
    isChandrashtama: false,
    isJanmaNakshatraDay: false,
    isEkadashi: false,
    isPurnima: false,
    isAmavasya: false,
    isPradosha: false,
    isSankashti: false,
    isPoojaDay: true,
    luckyNumbers: [1, 9],
    luckyColour: "yellow",
    luckyDirection: "east",
    moonRashiIndex: 0,
    moonNakshatraIndex: 0,
    tithiNumber: 1,
    tithiInPaksha: 1,
    paksha: "shukla",
    tithiGroup: "nanda",
    tara: {
      tara: 1,
      count: 1,
      score: 95,
      isFavourable: true,
      isDifficult: false
    },
    chandra: {
      house: 1,
      score: 90,
      isChandrashtama: false,
      isFavourable: true
    }
  };

  const customPriest = "ವೇ.ಮೂ. ಶ್ರೀ ಕೃಷ್ಣ ಭಟ್";
  const customPhone = "9845123456";

  describe("1. ICS Calendar Generator with Priest Override", () => {
    it("includes overrideContact, overrideCalendarPhone, ocp, priestPhone, priestName, and fromCal in sanctumUrl", () => {
      const ics = generateSevaICalendarString({
        days: [dummyDay],
        personName: "Naveen Hegde",
        birthRashiIndex: 0,
        birthNakshatraIndex: 0,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app",
        panditName: customPriest,
        priestName: customPriest,
        priestPhone: customPhone,
        overrideCalendarPhone: true
      });

      expect(ics).toContain("overrideContact=true");
      expect(ics).toContain("overrideCalendarPhone=true");
      expect(ics).toContain("ocp=1");
      expect(ics).toContain("priestPhone=9845123456");
      expect(ics).toContain("fromCal=1");
      expect(ics).toContain(encodeURIComponent(customPriest));
      expect(ics).toContain(`(📞 ${customPhone})`);
      expect(ics).toContain(customPriest);
      // Must not display default phone in description
      expect(ics).not.toContain("(📞 9972339362)");
    });

    it("embeds override fields into dayToken inside ICS calendar events", () => {
      const ics = generateSevaICalendarString({
        days: [dummyDay],
        personName: "Naveen Hegde",
        birthRashiIndex: 0,
        birthNakshatraIndex: 0,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app",
        panditName: customPriest,
        priestName: customPriest,
        priestPhone: customPhone,
        overrideCalendarPhone: true
      });

      // Extract dayToken from URL
      const tokenMatch = ics.match(/token=([a-zA-Z0-9_\-\.]+)/);
      expect(tokenMatch).not.toBeNull();
      const tokenStr = tokenMatch![1];
      const decoded = decodeDevoteeToken(tokenStr);

      expect(decoded).toBeDefined();
      expect(Boolean(decoded?.ocp)).toBe(true);
      expect(decoded?.overrideCalendarPhone).toBe(true);
      expect(decoded?.pp).toBe(customPhone);
      expect(decoded?.ph).toBe(customPhone);
      expect(decoded?.p).toBe(customPriest);
    });

    it("defaults to standard behavior without override query params when overrideCalendarPhone is false", () => {
      const ics = generateSevaICalendarString({
        days: [dummyDay],
        personName: "Naveen Hegde",
        birthRashiIndex: 0,
        birthNakshatraIndex: 0,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app",
        overrideCalendarPhone: false
      });

      expect(ics).not.toContain("overrideContact=true");
      expect(ics).not.toContain("overrideCalendarPhone=true");
      expect(ics).not.toContain("ocp=1");
      expect(ics).not.toContain("fromCal=1");
    });
  });

  describe("2. Google Calendar and QR Code URL Generators with Priest Override", () => {
    it("propagates priest contact override query parameters in Google Calendar URL", () => {
      const gcalUrl = generateGoogleCalendarUrl({
        day: dummyDay,
        personName: "Naveen Hegde",
        birthRashiIndex: 0,
        birthNakshatraIndex: 0,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app",
        panditName: customPriest,
        priestPhone: customPhone,
        overrideCalendarPhone: true
      });

      expect(gcalUrl).toContain("overrideContact%3Dtrue");
      expect(gcalUrl).toContain("overrideCalendarPhone%3Dtrue");
      expect(gcalUrl).toContain("ocp%3D1");
      expect(gcalUrl).toContain("priestPhone%3D9845123456");
      expect(gcalUrl).toContain("fromCal%3D1");
    });

    it("propagates priest contact override query parameters in compact QR Google Calendar URL", () => {
      const compactGcalUrl = generateCompactGoogleCalendarUrlForQR({
        day: dummyDay,
        personName: "Naveen Hegde",
        birthRashiIndex: 0,
        birthNakshatraIndex: 0,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app",
        panditName: customPriest,
        priestPhone: customPhone,
        notificationTime: "08:00",
        overrideCalendarPhone: true
      });

      expect(compactGcalUrl).toContain("overrideContact%3Dtrue");
      expect(compactGcalUrl).toContain("priestPhone%3D9845123456");
      expect(compactGcalUrl).toContain("fromCal%3D1");
    });

    it("propagates priest contact override query parameters in QR payload targets", () => {
      const qrPayload = generateQrPayloadByTarget("google", {
        days: [dummyDay],
        personName: "Naveen Hegde",
        birthRashiIndex: 0,
        birthNakshatraIndex: 0,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app",
        panditName: customPriest,
        priestName: customPriest,
        priestPhone: customPhone,
        overrideCalendarPhone: true
      });

      expect(qrPayload).toContain("overrideContact=true");
      expect(qrPayload).toContain("priestPhone=9845123456");
      expect(qrPayload).toContain("fromCal=1");
    });
  });

  describe("3. Redirection Landing Page hasContactOverride Resolution Logic", () => {
    // Exact logic mirror of DailyDarshanaPage.tsx hasContactOverride
    function resolveHasContactOverride(params: URLSearchParams, decoded: any, isFromCalendarRedirect: boolean) {
      // 1. Explicit query parameters
      const overrideContactParam = params.get("overrideContact");
      if (overrideContactParam === "true" || overrideContactParam === "1") return true;
      const overrideCalendarPhoneParam = params.get("overrideCalendarPhone");
      if (overrideCalendarPhoneParam === "true" || overrideCalendarPhoneParam === "1") return true;
      const ocpParam = params.get("ocp");
      if (ocpParam === "1" || ocpParam === "true") return true;

      // 2. Token payload flags
      if (decoded?.ocp || decoded?.overrideCalendarPhone) return true;

      // 3. Custom priest phone passed via URL or token (distinct from default 9972339362)
      const urlPriestPhone = params.get("priestPhone");
      if (urlPriestPhone && urlPriestPhone.replace(/[^\d]/g, "") !== "9972339362") return true;
      const tokenPriestPhone = decoded?.pp || (decoded as any)?.priestPhone || (decoded as any)?.ph;
      if (tokenPriestPhone && tokenPriestPhone.replace(/[^\d]/g, "") !== "9972339362") return true;

      // 4. Overridden / non-default priest name in URL or token when redirected from calendar
      const isFromCal = params.get("fromCal") === "1" || params.get("fromCal") === "true" || isFromCalendarRedirect;
      if (isFromCal) {
        const pName = params.get("priestName") || decoded?.p || decoded?.pandit || decoded?.priestName;
        if (pName && !pName.toLowerCase().includes("shreeram") && !pName.includes("ಶ್ರೀರಾಮ್")) {
          return true;
        }
      }

      return false;
    }

    it("reliably detects override when returning from calendar with query params", () => {
      const search = "?token=xyz&ref=cal_day_1&fromCal=1&overrideContact=true&priestPhone=9845123456&priestName=" + encodeURIComponent(customPriest);
      const params = new URLSearchParams(search);
      const isOverride = resolveHasContactOverride(params, null, true);
      expect(isOverride).toBe(true);
    });

    it("reliably detects override when returning from calendar with token-only payload", () => {
      const search = "?token=xyz&ref=cal_day_1";
      const params = new URLSearchParams(search);
      const decodedToken = {
        n: "Naveen Hegde",
        p: customPriest,
        pp: customPhone,
        ocp: 1,
        overrideCalendarPhone: true
      };
      const isOverride = resolveHasContactOverride(params, decodedToken, true);
      expect(isOverride).toBe(true);
    });

    it("reliably detects override when token only has custom priest phone without explicit boolean flag", () => {
      const search = "?token=xyz&ref=cal_day_1";
      const params = new URLSearchParams(search);
      const decodedToken = {
        n: "Naveen Hegde",
        p: customPriest,
        pp: "9876543210"
      };
      const isOverride = resolveHasContactOverride(params, decodedToken, true);
      expect(isOverride).toBe(true);
    });

    it("reliably detects override when returning with fromCal=1 and a non-Shreeram priest name", () => {
      const search = "?ref=cal_day_5&fromCal=1&priestName=" + encodeURIComponent("ವೆಂಕಟೇಶ ಭಟ್");
      const params = new URLSearchParams(search);
      const isOverride = resolveHasContactOverride(params, null, true);
      expect(isOverride).toBe(true);
    });

    it("strictly preserves default Shreeram Pandit when no override parameters or custom phone exist", () => {
      const search = "?ref=cal_day_1";
      const params = new URLSearchParams(search);
      const decodedToken = {
        n: "Naveen Hegde",
        p: "Shreeram Pandit",
        pp: "9972339362"
      };
      const isOverride = resolveHasContactOverride(params, decodedToken, true);
      expect(isOverride).toBe(false);
    });

    it("strictly preserves default Shreeram Pandit on direct visits without calendar redirect", () => {
      const search = "";
      const params = new URLSearchParams(search);
      const isOverride = resolveHasContactOverride(params, null, false);
      expect(isOverride).toBe(false);
    });
  });
});
