import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { prepareBhavishyaV1Data } from "../features/premiumPdf/bhavishyaV1Service";

describe("Bhavishya V1 Dynamic Completeness & Zero-Hardcoding Differential Test", () => {
  it("verifies 100% dynamic computation and strict divergence across 3 distinct devotee charts", async () => {
    // 1. Devotee A: Aries Lagna, Youth (< 23), Unmarried, Male
    const devoteeA = calculateKundli({
      name: "ಆದಿತ್ಯ ಶರ್ಮಾ",
      birthDate: "2004-04-18",
      birthTime: "06:15",
      latitude: 12.9716, // Bengaluru
      longitude: 77.5946
    });

    const sessionA: any = {
      result: devoteeA,
      birthDateYmd: "2004-04-18",
      birthTimeHm: "06:15",
      input: {
        name: "ಆದಿತ್ಯ ಶರ್ಮಾ",
        birthDate: "2004-04-18",
        birthTime: "06:15",
        latitude: 12.9716,
        longitude: 77.5946,
        gender: "Male"
      }
    };

    // 2. Devotee B: Taurus Lagna, Adult (34), Married with Children, Female
    const devoteeB = calculateKundli({
      name: "ಲಕ್ಷ್ಮೀ ಪ್ರಸನ್ನ",
      birthDate: "1990-09-22",
      birthTime: "22:45",
      latitude: 14.5479, // Gokarna
      longitude: 74.3187
    });

    const sessionB: any = {
      result: devoteeB,
      birthDateYmd: "1990-09-22",
      birthTimeHm: "22:45",
      input: {
        name: "ಲಕ್ಷ್ಮೀ ಪ್ರಸನ್ನ",
        birthDate: "1990-09-22",
        birthTime: "22:45",
        latitude: 14.5479,
        longitude: 74.3187,
        gender: "Female"
      }
    };

    // 3. Devotee C: Leo Lagna, Senior (65+), Married, Male
    const devoteeC = calculateKundli({
      name: "ನರಸಿಂಹ ಭಟ್",
      birthDate: "1958-08-15",
      birthTime: "07:30",
      latitude: 15.3647, // Hubballi
      longitude: 75.1240
    });

    const sessionC: any = {
      result: devoteeC,
      birthDateYmd: "1958-08-15",
      birthTimeHm: "07:30",
      input: {
        name: "ನರಸಿಂಹ ಭಟ್",
        birthDate: "1958-08-15",
        birthTime: "07:30",
        latitude: 15.3647,
        longitude: 75.1240,
        gender: "Male"
      }
    };

    const payloadA = await prepareBhavishyaV1Data(sessionA, "kn", "", { maritalStatus: "unmarried", childrenStatus: "no_children" });
    const payloadB = await prepareBhavishyaV1Data(sessionB, "kn", "", { maritalStatus: "married", childrenStatus: "has_children" });
    const payloadC = await prepareBhavishyaV1Data(sessionC, "kn", "", { maritalStatus: "married", childrenStatus: "has_children" });

    // ── ASSERTION 1: USER DETAILS (Header & Metadata Grid) ────────────────
    // Lagna Values must be dynamically distinct
    expect(payloadA.translations.lagnaValue).toBeDefined();
    expect(payloadB.translations.lagnaValue).toBeDefined();
    expect(payloadC.translations.lagnaValue).toBeDefined();
    expect(payloadA.translations.lagnaValue).not.toBe(payloadB.translations.lagnaValue);
    expect(payloadB.translations.lagnaValue).not.toBe(payloadC.translations.lagnaValue);

    // Lagna Lords must be dynamically distinct
    expect(payloadA.translations.lagnaLordValue).toBeDefined();
    expect(payloadB.translations.lagnaLordValue).toBeDefined();
    expect(payloadC.translations.lagnaLordValue).toBeDefined();
    expect(payloadA.translations.lagnaLordValue).not.toBe(payloadB.translations.lagnaLordValue);

    // Moon Rashi & Lords
    expect(payloadA.translations.moonValue).toBeDefined();
    expect(payloadB.translations.moonValue).toBeDefined();
    expect(payloadC.translations.moonValue).toBeDefined();
    expect(payloadA.translations.moonLordValue).toBeDefined();
    expect(payloadB.translations.moonLordValue).toBeDefined();
    expect(payloadC.translations.moonLordValue).toBeDefined();

    // Nakshatra & Pada
    expect(payloadA.translations.nakshatraValue).toBeDefined();
    expect(payloadA.translations.padaValue).toBeDefined();
    expect(payloadB.translations.nakshatraValue).toBeDefined();
    expect(payloadB.translations.padaValue).toBeDefined();

    // Tithi & Weekday
    expect(payloadA.translations.tithiValue).toBeDefined();
    expect(payloadA.translations.tithiValue?.length).toBeGreaterThan(0);
    expect(payloadA.translations.weekdayValue).toBeDefined();
    expect(payloadA.translations.weekdayValue?.length).toBeGreaterThan(0);

    // ── ASSERTION 2: SOUL MIRROR ──────────────────────────────────────────
    const smA = payloadA.premiumData.soulMirror!;
    const smB = payloadB.premiumData.soulMirror!;
    const smC = payloadC.premiumData.soulMirror!;

    expect(smA).toBeDefined();
    expect(smB).toBeDefined();
    expect(smC).toBeDefined();

    // Shield Grahas must be computed dynamically
    expect(smA.elemental.shieldGrahaName).toBeDefined();
    expect(smB.elemental.shieldGrahaName).toBeDefined();
    expect(smC.elemental.shieldGrahaName).toBeDefined();
    expect(smA.elemental.shieldGrahaWhy.length).toBeGreaterThan(20);
    expect(smB.elemental.shieldGrahaWhy.length).toBeGreaterThan(20);

    // Moon Vitality Traits must be computed dynamically (no generic static text)
    expect(smA.elemental.moonVitalityTrait).toBeDefined();
    expect(smB.elemental.moonVitalityTrait).toBeDefined();
    expect(smA.elemental.moonVitalityTrait.length).toBeGreaterThan(20);

    // Truths must dynamically mention Lagna Lord, 9th Lord, or Dasha
    expect(smA.truth2Text).toContain(payloadA.translations.lagnaLordValue);
    expect(smB.truth2Text).toContain(payloadB.translations.lagnaLordValue);
    expect(smC.truth2Text).toContain(payloadC.translations.lagnaLordValue);

    expect(smA.truth3Text).toContain(payloadA.translations.dashaPlanetValue);
    expect(smB.truth3Text).toContain(payloadB.translations.dashaPlanetValue);
    expect(smC.truth3Text).toContain(payloadC.translations.dashaPlanetValue);

    // ── ASSERTION 3: VEDIC PRESCRIPTIONS ──────────────────────────────────
    const rxA = payloadA.premiumData.prescriptions!;
    const rxB = payloadB.premiumData.prescriptions!;
    const rxC = payloadC.premiumData.prescriptions!;

    expect(rxA).toBeDefined();
    expect(rxB).toBeDefined();
    expect(rxC).toBeDefined();

    // Gemstones must be completely different for different Lagnas
    expect(rxA.gemstone).not.toBe(rxB.gemstone);
    expect(rxB.gemstone).not.toBe(rxC.gemstone);
    expect(rxA.gemstone).not.toBe(rxC.gemstone);

    // Rudrakshas must be completely different
    expect(rxA.rudraksha).not.toBe(rxB.rudraksha);
    expect(rxB.rudraksha).not.toBe(rxC.rudraksha);

    // Ishta Devatas must be authentic to their lagna/chart
    expect(rxA.ishtaDevata).not.toBe(rxB.ishtaDevata);

    // Lucky Colors & Numbers
    expect(rxA.luckyColors).not.toBe(rxB.luckyColors);
    expect(rxA.luckyDays).not.toBe(rxB.luckyDays);
    expect(rxA.luckyNumbers).not.toBe(rxB.luckyNumbers);

    // ── ASSERTION 4: CURRENT PHASE (Age-Tailored & Transit-Informed) ───────
    const cpA = payloadA.premiumData.currentPhase![0].impact;
    const cpB = payloadB.premiumData.currentPhase![0].impact;
    const cpC = payloadC.premiumData.currentPhase![0].impact;

    // Youth profile A should focus on education / career foundation
    expect(cpA).toContain("ವಿದ್ಯಾಭ್ಯಾಸ");
    // Adult profile B should focus on professional & family responsibilities
    expect(cpB).toContain("ಪ್ರೌಢ ಜೀವನದಲ್ಲಿ");
    // Senior profile C should focus on health, spiritual tranquility, grandchildren
    expect(cpC).toContain("ಹಿರಿಯ ವಯೋಮಾನದಲ್ಲಿ");

    // All should dynamically reference live transits and Mahadasha
    expect(cpA).toContain(payloadA.translations.dashaPlanetValue);
    expect(cpB).toContain(payloadB.translations.dashaPlanetValue);
    expect(cpC).toContain(payloadC.translations.dashaPlanetValue);

    // ── ASSERTION 5: ANNUAL FORECAST ──────────────────────────────────────
    const afA = payloadA.premiumData.annualForecast![0].impact;
    const afB = payloadB.premiumData.annualForecast![0].impact;
    expect(afA).toContain("【ಮುಂದಿನ ೧ ವರ್ಷದ ದೈವಿಕ ಸಂಕಲ್ಪ & ವಿಜಯ ಸಾಧನೆ】");
    expect(afA).toContain(payloadA.translations.lagnaValue);
    expect(afA).toContain(payloadA.translations.dashaPlanetValue);
    expect(afB).toContain(payloadB.translations.lagnaValue);
    expect(afB).toContain(payloadB.translations.dashaPlanetValue);

    // ── ASSERTION 6: GOCHARA ──────────────────────────────────────────────
    const gA = payloadA.premiumData.gochara!;
    expect(gA.length).toBeGreaterThanOrEqual(3);
    const saturnCard = gA.find(item => item.name.includes("ಶನಿ"));
    expect(saturnCard).toBeDefined();
    expect(saturnCard?.impact.length).toBeGreaterThan(50);
  }, 60000);
});
