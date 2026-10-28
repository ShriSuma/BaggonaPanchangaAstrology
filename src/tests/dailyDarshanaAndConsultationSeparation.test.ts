import { describe, it, expect } from "vitest";
import { encodeDevoteeToken, decodeDevoteeToken, encodeDateOnlyDevoteeToken } from "../utils/tokenCipher";
import { encodeSecureConsultationToken, decodeSecureConsultationToken } from "../features/consultation/consultationDbService";
import { checkPassExpiration, is30DayDevotee } from "../features/seva/calendarVisitService";
import { getIndianStandardDateStr } from "../core/placeTime";

describe("Daily Darshana & 20-Minute Consultation Link Isolation Guard", () => {
  // 1. Route Decision Function reflecting App.tsx
  function evaluateAppRoutes(pathname: string, search: string = "", hash: string = "") {
    const isPriestPanchangaRoute = (
      pathname.startsWith("/priest-panchanga") ||
      pathname.startsWith("/purohita")
    );

    const isConsultationGeneratorRoute = (
      pathname === "/consultation-generator" ||
      pathname.startsWith("/consultation-generator/") ||
      pathname.startsWith("/link-generator") ||
      pathname.startsWith("/consultation_generator") ||
      search.includes("portal=consultation_generator") ||
      search.includes("portal=link_generator") ||
      search.includes("page=consultation_generator") ||
      hash.includes("#/consultation-generator") ||
      hash.includes("#consultation-generator") ||
      hash.includes("#/link-generator") ||
      hash.includes("#link-generator")
    );

    const isConsultationRoute = !isConsultationGeneratorRoute && !isPriestPanchangaRoute && (
      pathname === "/consultation" ||
      pathname.startsWith("/consultation/") ||
      pathname === "/chat-session" ||
      pathname.startsWith("/chat-session/") ||
      pathname === "/astrology-chat" ||
      pathname.startsWith("/astrology-chat/") ||
      search.includes("portal=consultation") ||
      search.includes("portal=chat_session") ||
      search.includes("portal=chat") ||
      search.includes("page=consultation") ||
      search.includes("page=chat_session") ||
      search.includes("id=bgn_cst_") ||
      search.includes("token=bgn_cst_") ||
      hash.startsWith("#/consultation?") ||
      hash === "#/consultation" ||
      hash.startsWith("#/consultation/") ||
      hash === "#consultation" ||
      hash.startsWith("#consultation?") ||
      hash.startsWith("#/chat-session") ||
      hash.includes("id=bgn_cst_") ||
      hash.includes("token=bgn_cst_") ||
      hash.includes("bgn_cst_") ||
      ((search.includes("session=bgn_") || search.includes("id=bgn_")) &&
        !pathname.startsWith("/daily") &&
        !pathname.startsWith("/darshana") &&
        !search.includes("token=bgn_v1_") &&
        !search.includes("token=bgn_dob_") &&
        !search.includes("token=bgn_tk_") &&
        !search.includes("action=ics") &&
        !search.includes("fromCal=") &&
        !pathname.startsWith("/sandhya") &&
        !pathname.startsWith("/karma") &&
        !pathname.startsWith("/parihara") &&
        !pathname.startsWith("/academy") &&
        !pathname.startsWith("/quick") &&
        !pathname.startsWith("/calendar")
      )
    );

    const isSandhyavandanaRoute = !isPriestPanchangaRoute && !isConsultationRoute && !isConsultationGeneratorRoute && (
      pathname.startsWith("/sandhyavandana") ||
      search.includes("token=bgn_sv_")
    );

    const isKarmaMandalaRoute = !isPriestPanchangaRoute && !isConsultationRoute && !isConsultationGeneratorRoute && (
      pathname.startsWith("/karma-mandala") ||
      search.includes("token=bgn_karma_")
    );

    const isAcademyRoute = !isPriestPanchangaRoute && !isConsultationRoute && !isConsultationGeneratorRoute && !isSandhyavandanaRoute && !isKarmaMandalaRoute && (
      pathname.startsWith("/academy") ||
      search.includes("academyToken=")
    );

    const isDailyRoute = !isPriestPanchangaRoute && !isAcademyRoute && !isConsultationRoute && !isConsultationGeneratorRoute && !isSandhyavandanaRoute && !isKarmaMandalaRoute && (
      pathname.startsWith("/daily") ||
      pathname.startsWith("/darshana") ||
      (search.includes("token=") &&
        !search.includes("token=bgn_sv_") &&
        !search.includes("token=bgn_karma_") &&
        !search.includes("token=bgn_km_") &&
        !search.includes("token=bgn_cst_") &&
        !search.includes("token=bgn_acad_") &&
        !pathname.startsWith("/sandhya") &&
        !pathname.startsWith("/karma") &&
        !pathname.startsWith("/parihara") &&
        !pathname.startsWith("/academy") &&
        !pathname.startsWith("/consultation") &&
        !search.includes("portal=sandhya") &&
        !search.includes("portal=karma") &&
        !search.includes("portal=consultation") &&
        !search.includes("page=sandhya") &&
        !search.includes("page=karma") &&
        !search.includes("page=consultation")) ||
      search.includes("fromCal=") ||
      search.includes("action=ics")
    );

    return { isConsultationRoute, isDailyRoute };
  }

  describe("A. Strict Routing Isolation", () => {
    it("routes standard Daily Darshana calendar URL (/daily?token=bgn_v1_...) to DailyDarshana and NEVER Consultation", () => {
      const token = encodeDevoteeToken({
        n: "ಸುರೇಶ್ ಭಟ್",
        nk: 3,
        r: 1,
        d: "2026-10-28",
        startDate: "2026-10-28",
        days: 90,
        l: "kn"
      });

      const urlSearch = `?token=${token}&date=2026-10-28&sd=2026-10-28&lang=kn&tab=bhavishya`;
      const result = evaluateAppRoutes("/daily", urlSearch);

      expect(result.isConsultationRoute).toBe(false);
      expect(result.isDailyRoute).toBe(true);
    });

    it("routes root Daily Darshana URL (/?token=bgn_v1_...) to DailyDarshana and NEVER Consultation", () => {
      const token = encodeDevoteeToken({
        n: "ರಾಘವೇಂದ್ರ",
        nk: 5,
        r: 2,
        d: "2026-10-28",
        startDate: "2026-10-28",
        days: 90,
        l: "kn"
      });

      const urlSearch = `?token=${token}&action=ics`;
      const result = evaluateAppRoutes("/", urlSearch);

      expect(result.isConsultationRoute).toBe(false);
      expect(result.isDailyRoute).toBe(true);
    });

    it("routes /darshana with token to DailyDarshana and NEVER Consultation", () => {
      const token = encodeDevoteeToken({
        n: "ಮನೋಜ್",
        d: "2026-10-28",
        days: 30,
        l: "kn"
      });

      const urlSearch = `?token=${token}`;
      const result = evaluateAppRoutes("/darshana", urlSearch);

      expect(result.isConsultationRoute).toBe(false);
      expect(result.isDailyRoute).toBe(true);
    });

    it("routes Date-Only Daily Darshana URL (/daily?token=bgn_dob_...) to DailyDarshana and NEVER Consultation", () => {
      const token = encodeDateOnlyDevoteeToken({
        n: "ಅನಿತಾ ಶರ್ಮಾ",
        dob: "1995-04-12",
        d: "2026-10-28",
        days: 90,
        l: "kn"
      });

      const urlSearch = `?token=${token}&date=2026-10-28`;
      const result = evaluateAppRoutes("/daily", urlSearch);

      expect(result.isConsultationRoute).toBe(false);
      expect(result.isDailyRoute).toBe(true);
    });

    it("routes 20-minute Consultation URL (/consultation?id=bgn_cst_...&session=...) to Consultation and NEVER DailyDarshana", () => {
      const secureToken = encodeSecureConsultationToken("bgn_session_xyz789");
      const urlSearch = `?id=${encodeURIComponent(secureToken)}&session=bgn_session_xyz789`;
      const result = evaluateAppRoutes("/consultation", urlSearch);

      expect(result.isConsultationRoute).toBe(true);
      expect(result.isDailyRoute).toBe(false);
    });

    it("routes Consultation URL with token=bgn_cst_ to Consultation and NEVER DailyDarshana", () => {
      const secureToken = encodeSecureConsultationToken("bgn_sess123456");
      const urlSearch = `?token=${encodeURIComponent(secureToken)}`;
      const result = evaluateAppRoutes("/consultation", urlSearch);

      expect(result.isConsultationRoute).toBe(true);
      expect(result.isDailyRoute).toBe(false);
    });

    it("routes hash-based Consultation URL (#/consultation?id=bgn_cst_...) to Consultation and NEVER DailyDarshana", () => {
      const secureToken = encodeSecureConsultationToken("bgn_session_hash123");
      const result = evaluateAppRoutes("/", "", `#/consultation?id=${encodeURIComponent(secureToken)}`);

      expect(result.isConsultationRoute).toBe(true);
      expect(result.isDailyRoute).toBe(false);
    });
  });

  describe("B. Separate Encoded Token Formats & Decryption Safety", () => {
    it("ensures Daily Darshana token (bgn_v1_...) decodes cleanly with decodeDevoteeToken", () => {
      const originalPayload = {
        n: "ಪ್ರಮೋದ್ ಕೊಡಗಿ",
        nk: 18, // Mula
        r: 8,   // Dhanu
        d: "2026-10-28",
        startDate: "2026-10-28",
        days: 90,
        l: "kn",
        dob: "1993-03-16",
        tob: "01:40"
      };

      const token = encodeDevoteeToken(originalPayload);
      expect(token.startsWith("bgn_v1_")).toBe(true);

      const decoded = decodeDevoteeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.n).toBe("ಪ್ರಮೋದ್ ಕೊಡಗಿ");
      expect(decoded?.nk).toBe(18);
      expect(decoded?.r).toBe(8);
      expect(decoded?.dob).toBe("1993-03-16");
      expect(decoded?.tob).toBe("01:40");
      expect(decoded?.days).toBe(90);

      // Decoding with Consultation decoder MUST fail
      const consultationResult = decodeSecureConsultationToken(token);
      expect(consultationResult.isValid).toBe(false);
    });

    it("ensures 20-minute Consultation token (bgn_cst_...) decodes cleanly with decodeSecureConsultationToken", () => {
      const rawSessionId = "bgn_cs_live987654";
      const consultationToken = encodeSecureConsultationToken(rawSessionId);
      expect(consultationToken.startsWith("bgn_cst_")).toBe(true);

      const decoded = decodeSecureConsultationToken(consultationToken);
      expect(decoded.isValid).toBe(true);
      expect(decoded.sessionId).toBe(rawSessionId);

      // Decoding with Devotee token decoder MUST fail gracefully (return null)
      const devoteeResult = decodeDevoteeToken(consultationToken);
      expect(devoteeResult).toBeNull();
    });
  });

  describe("C. 90-Day and 30-Day Limit Validity Logic", () => {
    it("ensures an active devotee within 90 days has isExpired === false", () => {
      const todayStr = getIndianStandardDateStr();
      const expiration = checkPassExpiration(todayStr, 90);

      expect(expiration.isExpired).toBe(false);
      expect(expiration.daysElapsed).toBe(0);
      expect(expiration.daysRemaining).toBe(90);
    });

    it("ensures a devotee on Day 45 of 90 days has isExpired === false", () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
      const pastDateStr = getIndianStandardDateStr(pastDate);

      const expiration = checkPassExpiration(pastDateStr, 90);
      expect(expiration.isExpired).toBe(false);
      expect(expiration.daysElapsed).toBe(45);
      expect(expiration.daysRemaining).toBe(45);
    });

    it("ensures an active devotee within 30 days has isExpired === false", () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const pastDateStr = getIndianStandardDateStr(pastDate);

      const expiration = checkPassExpiration(pastDateStr, 30);
      expect(expiration.isExpired).toBe(false);
      expect(expiration.daysElapsed).toBe(10);
      expect(expiration.daysRemaining).toBe(20);
    });

    it("correctly identifies expired devotee when 90 days have elapsed", () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000);
      const pastDateStr = getIndianStandardDateStr(pastDate);

      const expiration = checkPassExpiration(pastDateStr, 90);
      expect(expiration.isExpired).toBe(true);
      expect(expiration.daysRemaining).toBe(0);
    });

    it("correctly identifies expired devotee when 30 days have elapsed", () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000);
      const pastDateStr = getIndianStandardDateStr(pastDate);

      const expiration = checkPassExpiration(pastDateStr, 30);
      expect(expiration.isExpired).toBe(true);
      expect(expiration.daysRemaining).toBe(0);
    });
  });
});

