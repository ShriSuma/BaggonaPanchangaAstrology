import { describe, it, expect } from "vitest";
import {
  analyzeKundali,
  buildDynamicPrescriptions,
  buildDynamicAshirvada,
  buildTodayGuidance,
  ensureNamePresence,
  PRESCRIPTIONS_BY_GRAHA
} from "../features/premiumPdf/dynamicBhavishyaEngine";
import { cleanDegreesFromText } from "../features/premiumPdf/yogaDoshaGocharaEnricher";

describe("Premium PDF V1 Audit Plan Improvements Test Suite", () => {
  const mockChart = analyzeKundali({
    lagnaRashiIndex: 8, // Sagittarius (Guru presided)
    moonRashiIndex: 3,  // Cancer (Moon presided)
    moonNakshatraIndex: 7, // Pushya
    birthDate: "1990-05-15",
    birthTime: "08:30",
    natalPlanets: [],
    transits: [],
    mahaLord: "Jupiter",
    bhuktiLord: "Saturn",
    gender: "Male",
    ageYears: 34,
    lang: "kn",
    name: "ರಾಘವೇಂದ್ರ ರಾವ್",
    maritalStatus: "married",
    hasChildren: "has_children"
  });

  it("1. Verifies uparatna (substitute gemstones) across all 7 presiding grahas and 5 languages", () => {
    const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const langs = ["kn", "hi", "te", "ta", "en"];

    for (const graha of grahas) {
      const rx = PRESCRIPTIONS_BY_GRAHA[graha];
      expect(rx).toBeDefined();
      expect(rx.uparatna).toBeDefined();

      for (const l of langs) {
        const uparatnaText = rx.uparatna[l];
        expect(uparatnaText).toBeDefined();
        expect(uparatnaText.length).toBeGreaterThan(5);
      }
    }

    const prescriptions = buildDynamicPrescriptions(mockChart);
    expect(prescriptions.uparatna).toBeDefined();
    expect(prescriptions.uparatna).toContain("ಪರ್ಯಾಯ");
  });

  it("2. Verifies dynamic Ashirvada blessing generation with devotee name, dasha, and Atma Linga", () => {
    const langs = ["kn", "hi", "te", "ta", "en"];
    const name = "ರಾಘವೇಂದ್ರ ರಾವ್";

    for (const l of langs) {
      const ashirvada = buildDynamicAshirvada(name, l, "ಮಹಾಬಲೇಶ್ವರ", "ಗುರು");
      expect(ashirvada).toContain(name);
      expect(ashirvada.length).toBeGreaterThan(100);
      // Verify no degree symbol
      expect(ashirvada).not.toContain("°");
    }
  });

  it("3. Verifies ensureNamePresence weaves devotee name naturally", () => {
    const textWithoutNameKn = "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ.";
    const wovenKn = ensureNamePresence(textWithoutNameKn, "ಶ್ರೀರಾಮ್", "kn");
    expect(wovenKn).toContain("ಶ್ರೀರಾಮ್");
    expect(wovenKn).toContain("ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ.");

    // Should not duplicate if name is already present
    const wovenTwice = ensureNamePresence(wovenKn, "ಶ್ರೀರಾಮ್", "kn");
    expect(wovenTwice).toBe(wovenKn);
  });

  it("4. Verifies buildTodayGuidance generates actionable daily alignment", () => {
    const targetDate = new Date("2026-10-28T10:00:00Z"); // Wednesday (Budhavara)
    const guidanceKn = buildTodayGuidance(mockChart, "kn", targetDate);

    expect(guidanceKn.title).toContain("ದೈನಂದಿನ ಮಾರ್ಗದರ್ಶನ");
    expect(guidanceKn.weekdayStr).toBe("ಬುಧವಾರ");
    expect(guidanceKn.recommendedColor).toBeDefined();
    expect(guidanceKn.recommendedDirection).toBeDefined();
    expect(guidanceKn.mantra).toContain("ಓಂ");
    expect(guidanceKn.guidanceText.length).toBeGreaterThan(30);

    const guidanceEn = buildTodayGuidance(mockChart, "en", targetDate);
    expect(guidanceEn.weekdayStr).toBe("Wednesday");
  });

  it("5. Strict No-Degree Rule: Verifies cleanDegreesFromText eliminates all degree notations", () => {
    const sampleWithDegrees = [
      "Saturn at 15.4° in Pisces creates Raja Yoga",
      "Mars in 8th house at 23° 45' aspecting Lagna",
      "ಮಾಂದಿ ೧೪.೫° ರಾಶಿಯಲ್ಲಿದ್ದು ೪ನೇ ಭಾವ",
      "गुरु 12.3° पर स्थित होकर राजयोग बनाता है",
      "ಶನಿ 29°30' (ದೀಪ್ತಾಂಶ: 29°)"
    ];

    for (const text of sampleWithDegrees) {
      const cleaned = cleanDegreesFromText(text);
      expect(cleaned).not.toContain("°");
      expect(cleaned).not.toContain("ದೀಪ್ತಾಂಶ");
    }
  });
});
