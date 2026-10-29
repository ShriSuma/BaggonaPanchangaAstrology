import { describe, it, expect } from "vitest";
import { calculateInstantPrashnaClock } from "../core/instantPrashnaEngine";
import {
  buildMaandiKarmicPoints,
  buildSubconsciousWorryPoints
} from "../core/instantReadingTalkingPointsEngine";
import { determineMarriageDestiny } from "../core/CurrentLifeAndCareerDiagnosticEngine";
import fs from "fs";
import path from "path";

describe("Instant Reading Precision & Horary Prashna Engine Audit", () => {
  describe("1. Horary Prashna Consultation Clock (instantPrashnaEngine)", () => {
    it("should calculate valid Hora, Choghadiya, and Chandra Bala for any instant consultation", () => {
      // Test consultation on Monday noon
      const testDate = new Date("2026-10-26T12:00:00+05:30"); // Monday
      const natalMoonRashiIdx = 3; // Cancer (Karka)

      const clock = calculateInstantPrashnaClock(natalMoonRashiIdx, testDate, 14.5385, 74.3188);

      expect(clock.weekdayKn).toBe("ಸೋಮವಾರ");
      expect(clock.weekdayEn).toBe("Monday");
      expect(clock.horaLordKn).toBeDefined();
      expect(clock.horaLordEn).toBeDefined();
      expect(clock.horaSignificanceKn.length).toBeGreaterThan(5);
      expect(clock.choghadiyaNameKn).toBeDefined();
      expect(clock.transitMoonRashiKn).toBeDefined();
      expect(clock.chandraHouseOffset).toBeGreaterThanOrEqual(1);
      expect(clock.chandraHouseOffset).toBeLessThanOrEqual(12);
      expect(clock.muhurthaScore).toBeGreaterThanOrEqual(0);
      expect(clock.muhurthaScore).toBeLessThanOrEqual(100);
      expect(clock.verdictKn.length).toBeGreaterThan(3);
    });

    it("should accurately detect Chandrashtama (8th house transit from natal Moon)", () => {
      const testDate = new Date("2026-10-26T12:00:00+05:30");
      const baseClock = calculateInstantPrashnaClock(0, testDate, 14.5385, 74.3188);
      const transitMoonIdx = baseClock.transitMoonRashiIdx;

      // Natal moon that makes transit moon the 8th house:
      const targetNatalMoonIdx = (transitMoonIdx - 7 + 12) % 12;

      const chandrashtamaClock = calculateInstantPrashnaClock(targetNatalMoonIdx, testDate, 14.5385, 74.3188);
      expect(chandrashtamaClock.chandraHouseOffset).toBe(8);
      expect(chandrashtamaClock.isChandrashtama).toBe(true);
      expect(chandrashtamaClock.chandraBalaStatusKn).toContain("ಚಂದ್ರಾಷ್ಟಮ");
      expect(chandrashtamaClock.chandraGuidanceKn).toContain("ಮಹತ್ವದ ನಿರ್ಧಾರಗಳನ್ನು ಮುಂದೂಡಿ");
    });

    it("should accurately detect Ardha-Chandrashtama (4th house transit)", () => {
      const testDate = new Date("2026-10-26T12:00:00+05:30");
      const baseClock = calculateInstantPrashnaClock(0, testDate, 14.5385, 74.3188);
      const transitMoonIdx = baseClock.transitMoonRashiIdx;
      const targetNatalMoonIdx = (transitMoonIdx - 3 + 12) % 12;

      const ardhaClock = calculateInstantPrashnaClock(targetNatalMoonIdx, testDate, 14.5385, 74.3188);
      expect(ardhaClock.chandraHouseOffset).toBe(4);
      expect(ardhaClock.isArdhaChandrashtama).toBe(true);
      expect(ardhaClock.chandraBalaStatusKn).toContain("ಅರ್ಧ ಚಂದ್ರಾಷ್ಟಮ");
    });
  });

  describe("2. 12-House Dynamic Maandi Karmic Points (instantReadingTalkingPointsEngine)", () => {
    it("should generate distinct and house-specific 99% task hurdles across all 12 houses", () => {
      const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const houseTextsKn = new Set<string>();

      for (const house of houses) {
        const pointsKn = buildMaandiKarmicPoints({
          maandiHouse: house,
          maandiLordKn: "ಶನಿ",
          maandiLordEn: "Saturn",
          isKn: true,
          devoteeAge: 32
        });
        const pointsEn = buildMaandiKarmicPoints({
          maandiHouse: house,
          maandiLordKn: "ಶನಿ",
          maandiLordEn: "Saturn",
          isKn: false,
          devoteeAge: 32
        });

        expect(pointsKn.length).toBeGreaterThanOrEqual(6);
        expect(pointsEn.length).toBeGreaterThanOrEqual(6);

        // Ensure each house has a distinct 99% glitch description (point index 2 / id 3)
        const textSignature = pointsKn[2].text;
        expect(houseTextsKn.has(textSignature)).toBe(false);
        houseTextsKn.add(textSignature);

        // Verify Gokarna Atma Linga Tila Homa remedy is included
        const remedyPoint = pointsKn.find(p => p.text.includes("ಗೋಕರ್ಣ") || p.text.includes("ತಿಲ ಹೋಮ") || p.text.includes("ಪರಿಹಾರ"));
        expect(remedyPoint).toBeDefined();
      }

      expect(houseTextsKn.size).toBe(12);
    });
  });

  describe("3. Subconscious Worry Moon Yogas (instantReadingTalkingPointsEngine)", () => {
    it("should dynamically detect Vish Yoga (Moon + Saturn conjunction/aspect)", () => {
      const pointsKn = buildSubconsciousWorryPoints({
        moonSignEn: "Capricorn",
        moonNakEn: "Shravana",
        moonHouse: 5,
        hasVishYoga: true,
        hasGrahanYoga: false,
        hasKetuYoga: false,
        hasMangalYoga: false,
        hasGajakesari: false,
        isDusthanaMoon: false,
        isKemadruma: false,
        age: 34,
        isFemale: false,
        isKn: true
      });

      const vishYogaPoint = pointsKn.find(p => p.text.includes("ವಿಷ ಯೋಗ") || p.text.includes("ಶನಿ-ಚಂದ್ರರ ಸಂಯೋಗ"));
      expect(vishYogaPoint).toBeDefined();
      expect(vishYogaPoint?.tone).toBe("bad");
    });

    it("should dynamically detect Grahan Yoga (Moon + Rahu)", () => {
      const pointsKn = buildSubconsciousWorryPoints({
        moonSignEn: "Scorpio",
        moonNakEn: "Anuradha",
        moonHouse: 7,
        hasVishYoga: false,
        hasGrahanYoga: true,
        hasKetuYoga: false,
        hasMangalYoga: false,
        hasGajakesari: false,
        isDusthanaMoon: false,
        isKemadruma: false,
        age: 31,
        isFemale: false,
        isKn: true
      });

      const grahanPoint = pointsKn.find(p => p.text.includes("ಗ್ರಹಣ ಯೋಗ") || p.text.includes("ರಾಹು-ಚಂದ್ರರ"));
      expect(grahanPoint).toBeDefined();
      expect(grahanPoint?.tone).toBe("bad");
    });

    it("should dynamically detect Kemadruma Yoga (isolated Moon)", () => {
      const pointsKn = buildSubconsciousWorryPoints({
        moonSignEn: "Aries",
        moonNakEn: "Ashwini",
        moonHouse: 11,
        hasVishYoga: false,
        hasGrahanYoga: false,
        hasKetuYoga: false,
        hasMangalYoga: false,
        hasGajakesari: false,
        isDusthanaMoon: false,
        isKemadruma: true,
        age: 38,
        isFemale: false,
        isKn: true
      });

      const kemadrumaPoint = pointsKn.find(p => p.text.includes("ಕೇಮದ್ರುಮ ಯೋಗ") || p.text.includes("ಏಕಾಂಗಿತನದ"));
      expect(kemadrumaPoint).toBeDefined();
    });
  });

  describe("4. Marriage Destiny Direction & Spouse Traits (CurrentLifeAndCareerDiagnosticEngine)", () => {
    it("should compute destined spouse arrival direction and characteristics", () => {
      const dummyResult: any = {
        lagnaRashi: { english: "Leo", index: 4 },
        planets: [
          { name: "Venus", house: 7, signIndex: 10, longitude: 315 },
          { name: "Jupiter", house: 1, signIndex: 4, longitude: 125 }
        ]
      };

      const destiny = determineMarriageDestiny(dummyResult, { devoteeAge: 28, maritalStatus: "unmarried" });
      expect(destiny.spouseDirectionKn).toBeDefined();
      expect(destiny.spouseDirectionEn).toBeDefined();
      expect(destiny.spouseCharacteristicsKn).toBeDefined();
      expect(destiny.spouseCharacteristicsEn).toBeDefined();
      expect(destiny.spouseDirectionKn!.length).toBeGreaterThan(3);
      expect(destiny.spouseCharacteristicsKn!.length).toBeGreaterThan(10);
    });
  });

  describe("5. Priest Seal & Contact Audit", () => {
    it("should verify certified priest contact number +91 99723 39362 and Shreeram Pandit across Instant Reading components", () => {
      const templatePath = path.resolve(__dirname, "../components/instantReading/InstantReadingPdfTemplate.tsx");
      const templateContent = fs.readFileSync(templatePath, "utf-8");

      expect(templateContent).toContain("+91 99723 39362");
      expect(templateContent).not.toContain("94486 24830");

      const localePath = path.resolve(__dirname, "../components/instantReading/instantReadingPdfLocale.ts");
      const localeContent = fs.readFileSync(localePath, "utf-8");
      expect(localeContent).toContain("Shreeram Pandit");
    });
  });
});
