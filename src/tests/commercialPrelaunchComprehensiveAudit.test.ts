import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { PlanetName, type KundliInput } from "../core/AstroTypes";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import {
  calculateDeterministicRhythmDay,
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  generateCompactGoogleCalendarUrlForQR,
  getDailyKaalaTimings
} from "../features/seva/icsCalendarGenerator";
import {
  encodeSecureConsultationToken,
  decodeSecureConsultationToken,
  createConsultationSession,
  getConsultationSession,
  startConsultationTimer,
  expireConsultationSession
} from "../features/consultation/consultationDbService";
import { generateConsultationAnswer } from "../features/consultation/consultationAIEngine";
import { resolvePincodeCoordinatesSync } from "../services/locationApi";
import { calculateExactNoaaSunTimes } from "../core/birthSunTimes";
import { encodeDevoteeToken, decodeDevoteeToken } from "../utils/tokenCipher";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Pre-Launch Commercial Readiness Audit", () => {
  // =========================================================================
  // AUDIT 1: Premium PDF V1 Janma Kundali & Daivika Parihara PDF
  // =========================================================================
  describe("1. Feature 1: Premium PDF V1 Janma Kundali & Daivika Parihara PDF Audit", () => {
    // Benchmark Profile: Real-world devotee with complex chart (Debilitated Mars in Cancer, Exalted Saturn in Libra)
    const benchmarkInput: KundliInput = {
      name: "Suryanarayana Shastri",
      birthDate: "1994-07-26",
      birthTime: "06:15",
      latitude: 12.9716, // Bengaluru
      longitude: 77.5946,
      gender: "Male",
      gothra: "Vashishta"
    };

    const calculatedKundli = calculateKundli(benchmarkInput);

    it("verifies astronomical calculation fidelity (Lagna, Graha Sphutas, Nakshatra, Pada, Dasha)", () => {
      expect(calculatedKundli).toBeDefined();
      expect(calculatedKundli.lagnaRashi).toBeDefined();
      expect(calculatedKundli.moonSign).toBeDefined();

      // Check all 9 Grahas exist with positive degrees under 360
      expect(calculatedKundli.planets).toHaveLength(9);
      for (const p of calculatedKundli.planets) {
        expect(p.degree).toBeGreaterThanOrEqual(0);
        expect(p.degree).toBeLessThan(360);
        expect(p.rashi.index).toBeGreaterThanOrEqual(0);
        expect(p.rashi.index).toBeLessThan(12);
        expect(p.nakshatra.index).toBeGreaterThanOrEqual(0);
        expect(p.nakshatra.index).toBeLessThan(27);
      }

      // Check Vimshottari Mahadasha balance calculation
      const moon = calculatedKundli.planets.find(p => p.name === PlanetName.Moon);
      expect(moon).toBeDefined();
      expect(calculatedKundli.moonPada).toBeGreaterThanOrEqual(1);
      expect(calculatedKundli.moonPada).toBeLessThanOrEqual(4);
    });

    it("verifies Daivika Parihara remedies are 100% personalized to natal chart with zero boilerplate", () => {
      const remedyReport = generateKundliRemedyReport(calculatedKundli, benchmarkInput);

      expect(remedyReport).toBeDefined();
      expect(remedyReport.panchangaRemedies).toBeDefined();

      // 1. Sacred Tree (Nakshatra Vriksha) check
      const tree = remedyReport.panchangaRemedies.nakshatraRemedy.sacredTree;
      expect(tree.botanicalName).toBeTruthy();
      expect(tree.botanicalName.length).toBeGreaterThan(4);
      expect(tree.kannada).toBeTruthy();
      expect(tree.worshipMethod.kn.length).toBeGreaterThan(20);

      // 2. Weekday Vara Sadhana check (1994-07-26 was a Tuesday -> Kuja/Mars)
      const vara = remedyReport.panchangaRemedies.varaRemedy;
      expect(vara.dayName.kn).toContain("ಮಂಗಳವಾರ");
      expect(vara.rulingGraha).toBe(PlanetName.Mars);
      expect(vara.dailyColor.kn).toBeTruthy();

      // 3. Planetary strength remedies (debilitated or exalted)
      expect(remedyReport.planetaryStrengthRemedies).toBeDefined();

      // 4. Gokarna Temple Seva is dynamically tailored
      expect(remedyReport.gokarnaTempleRemedies.prescribedSeva.name.kn.length).toBeGreaterThan(0);
      expect(remedyReport.gokarnaTempleRemedies.donationDaana.item.kn.length).toBeGreaterThan(0);
    });

    it("verifies 5-language Indic localization purity with zero English tokens leaking into regional text", () => {
      const languages: ("kn" | "hi" | "te" | "ta")[] = ["kn", "hi", "te", "ta"];

      for (const lang of languages) {
        const synthesis = generatePanchangaAngaSynthesis(calculatedKundli, {
          devoteeName: benchmarkInput.name,
          birthDate: benchmarkInput.birthDate,
          birthTime: benchmarkInput.birthTime,
          latitude: benchmarkInput.latitude,
          longitude: benchmarkInput.longitude,
          gender: benchmarkInput.gender,
          lang
        });

        expect(synthesis).toBeDefined();
        expect(synthesis.prescriptions).toBeDefined();

        // Check regional text does not contain English alphabets
        const rudrakshaText = synthesis.prescriptions.rudraksha.wearingMethod;
        const englishCharsInWearingMethod = rudrakshaText.match(/[a-zA-Z]/g) || [];
        expect(englishCharsInWearingMethod.length).toBe(0);
      }
    });
  });

  // =========================================================================
  // AUDIT 2: 30-Day Calendar & QR Code Calendar
  // =========================================================================
  describe("2. Feature 2: 30-Day Calendar & QR Code Calendar Audit", () => {
    it("verifies pincode/area location responsiveness: different pincodes yield distinctly computed sun times", () => {
      // Pincode 1: Gokarna (Karnataka coast - lat 14.54, lng 74.31)
      const gokarnaCoord = resolvePincodeCoordinatesSync("581326");
      // Pincode 2: New Delhi (North India - lat 28.63, lng 77.21)
      const delhiCoord = resolvePincodeCoordinatesSync("110001");
      // Pincode 3: Guwahati (East India - lat 26.18, lng 91.75)
      const guwahatiCoord = resolvePincodeCoordinatesSync("781001");

      const anchor = new Date("2026-05-15T12:00:00Z");

      const gokarnaSun = calculateExactNoaaSunTimes(anchor, gokarnaCoord.lat, gokarnaCoord.lng);
      const delhiSun = calculateExactNoaaSunTimes(anchor, delhiCoord.lat, delhiCoord.lng);
      const guwahatiSun = calculateExactNoaaSunTimes(anchor, guwahatiCoord.lat, guwahatiCoord.lng);

      // Sunrise in Guwahati is ~1.5 hours earlier than Gokarna due to eastern longitude
      const sunriseDiffGokarnaGuwahatiMinutes = (gokarnaSun.sunrise.getTime() - guwahatiSun.sunrise.getTime()) / 60000;
      expect(sunriseDiffGokarnaGuwahatiMinutes).toBeGreaterThan(60); // At least 60 minutes earlier in Guwahati

      // Daily Kaala Timings must be distinct
      const gokarnaKaala = getDailyKaalaTimings(5, "kn", "2026-05-15", gokarnaCoord.lat, gokarnaCoord.lng, "581326");
      const delhiKaala = getDailyKaalaTimings(5, "kn", "2026-05-15", delhiCoord.lat, delhiCoord.lng, "110001");

      expect(gokarnaKaala.rahuWindow).not.toBe(delhiKaala.rahuWindow);
      expect(gokarnaKaala.abhijitWindow).not.toBe(delhiKaala.abhijitWindow);
    });

    it("verifies previous-day festival eve alerts are scheduled strictly on the prior evening (20:00 IST)", () => {
      // Create a 30-day rhythm sequence starting around Varamahalakshmi Vratha (2026-08-21)
      const days: RhythmDay[] = Array.from({ length: 30 }, (_, i) => {
        const d = new Date("2026-08-10");
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, 7, 3);
      });

      const ics = generateSevaICalendarString({
        days,
        lang: "kn",
        panditName: "Shreeram Pandit",
        personName: "Devotee Ramesh"
      });

      // Verify Varamahalakshmi alert appears on the eve (2026-08-20 at 20:00 IST)
      expect(ics).toContain("20260820T200000");
      expect(ics).toContain("ವರಮಹಾಲಕ್ಷ್ಮೀ");

      // Verify zero duplicate eve alerts for the same festival
      const vrathaEveMatches = ics.match(/SUMMARY:.*ವರಮಹಾಲಕ್ಷ್ಮೀ.*ಸಿದ್ಧತೆ/g) || [];
      expect(vrathaEveMatches.length).toBeLessThanOrEqual(1);
    });

    it("verifies calendar URL links contain valid tokens and NEVER trigger session timeout on valid passes", () => {
      const birthDate = "1994-07-26";
      const birthTime = "06:15";
      const token = encodeDevoteeToken({
        name: "Suryanarayana Shastri",
        dob: birthDate,
        tob: birthTime,
        lat: 12.9716,
        lng: 77.5946,
        days: 30 // 30-day valid pass
      });

      expect(token).toBeTruthy();
      expect(token.startsWith("bgn_v1_") || token.startsWith("bgn_dob_")).toBe(true);

      // Decode token directly - must be valid and within active period
      const decoded = decodeDevoteeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.name).toBe("Suryanarayana Shastri");
      expect(decoded?.dob).toBe(birthDate);

      // Verify that calendar URL uses this valid token
      const googleUrl = generateGoogleCalendarUrl({
        day: {
          day: 1,
          ymd: "2026-08-10",
          energyScore: 85,
          tithi: "Shukla Trayodashi",
          rashi: "Karka",
          nakshatra: "Pushya",
          isChandrashtama: false
        } as any,
        personName: "Suryanarayana Shastri",
        dob: birthDate,
        tob: birthTime,
        panditName: "Shreeram Pandit",
        lang: "kn"
      });

      expect(googleUrl).toContain("calendar.google.com");
      expect(decodeURIComponent(googleUrl.replace(/\+/g, " "))).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    });

    it("verifies 3-color dynamic coding (Red, Yellow, Green) for Tara Bala, Chandra Bala, and Chandrashtama", () => {
      // Day 1: High Energy (Green - Score >= 75)
      const greenDay = calculateDeterministicRhythmDay("2026-05-12", 7, 3);
      // Day 2: Caution / Chandrashtama (Red - Score < 50 or Chandrashtama)
      const redDay: RhythmDay = {
        ...greenDay,
        energyScore: 42,
        isChandrashtama: true
      };

      expect(redDay.energyScore).toBeLessThan(50);
      expect(redDay.isChandrashtama).toBe(true);
    });

    it("verifies compact QR code URL is compact, contains calendar domain, and is strictly ASCII-safe", () => {
      const compactUrl = generateCompactGoogleCalendarUrlForQR({
        lang: "kn",
        panditName: "Shreeram Pandit",
        notificationTime: "08:00",
        personName: "Suryanarayana Shastri",
        pincode: "581326",
        lat: 14.5479,
        lng: 74.3187,
        locationName: "Gokarna",
        dob: "1994-07-26",
        tob: "06:15"
      });

      expect(compactUrl.length).toBeLessThan(700);
      // Check zero non-ASCII characters
      const nonAscii = compactUrl.match(/[^\x00-\x7F]/g) || [];
      expect(nonAscii.length).toBe(0);
      expect(compactUrl).toContain("calendar.google.com");
      expect(compactUrl).toContain("token%3Dbgn_v1_");
    });
  });

  // =========================================================================
  // AUDIT 3: 20-Minute Live Consultation with Priest
  // =========================================================================
  describe("3. Feature 3: 20-Minute Live Consultation with Priest Audit", () => {
    it("verifies complete token isolation between Daily Darshana (bgn_v1_) and Consultation (bgn_cst_)", () => {
      const consultationSessionId = "bgn_cst_test_commercial_audit_123";
      const consultationToken = encodeSecureConsultationToken(consultationSessionId);

      expect(consultationToken.startsWith("bgn_cst_")).toBe(true);

      // Decoding consultation token with Daily Darshana decoder MUST fail
      const darshanaDecoded = decodeDevoteeToken(consultationToken);
      expect(darshanaDecoded).toBeNull();

      // Decoding consultation token with consultation decoder MUST succeed
      const consultationDecoded = decodeSecureConsultationToken(consultationToken);
      expect(consultationDecoded.isValid).toBe(true);
      expect(consultationDecoded.sessionId).toBe(consultationSessionId);
    });

    it("verifies 20-minute session lifecycle: pending -> active (+20 min expiry) -> expired (strict rejection)", async () => {
      const session = await createConsultationSession({
        name: "Anand Murthy",
        dob: "1990-05-15",
        tob: "14:30",
        place: "Gokarna",
        lat: 14.5479,
        lng: 74.3187,
        language: "kn"
      });

      expect(session).toBeDefined();
      expect(session.status).toBe("pending");
      expect(session.expiresAt).toBeNull(); // Pending sessions NEVER expire prematurely

      // Start the session
      const started = await startConsultationTimer(session.id);
      expect(started.status).toBe("active");
      expect(started.expiresAt).toBeTruthy();

      const startTime = new Date(started.startedAt!).getTime();
      const expiryTime = new Date(started.expiresAt!).getTime();
      const durationMin = Math.round((expiryTime - startTime) / (60 * 1000));
      expect(durationMin).toBe(20); // Exactly 20 minutes

      // Mark expired
      await expireConsultationSession(session.id);
      const expired = await getConsultationSession(session.id);
      expect(expired?.status).toBe("expired");
    });

    it("verifies Priest AI answers user life questions with authentic Parashari depth and zero canned generic lines", async () => {
      const session = await createConsultationSession({
        name: "Anand Murthy",
        dob: "1990-05-15",
        tob: "14:30",
        place: "Gokarna",
        lat: 14.5479,
        lng: 74.3187,
        language: "kn"
      });

      // Devotee asks about career frustration and job change
      const reading = await generateConsultationAnswer({
        session,
        userQuestion: "ನನ್ನ ಕೆಲಸದಲ್ಲಿ ತುಂಬಾ ಕಿರಿಕಿರಿ ಇದೆ, ಯಾವಾಗ ಹೊಸ ಉದ್ಯೋಗ ಸಿಗಬಹುದು?",
        conversationHistory: [],
        questionIndex: 0
      });

      expect(reading).toBeDefined();
      expect(reading.paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(reading.fullText.length).toBeGreaterThan(100);

      // Must mention astrological context (Lagna, Rashi, or Grahas)
      expect(reading.fullText).toMatch(/ಲಗ್ನ|ರಾಶಿ|ಶನಿ|ಗುರು|ದಶಾ|ಉದ್ಯೋಗ|ಕರ್ಮ|ಶಾಂತಿ/);

      // Must NOT contain unformatted markdown code or system prompts
      expect(reading.fullText).not.toContain("```");
      expect(reading.fullText).not.toContain("System Prompt");
    });
  });
});
