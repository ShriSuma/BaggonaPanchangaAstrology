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

    // ── ASSERTION 7: SOVEREIGN DASHA-GOCHARA SYNTHESIS & COMPASS ──────────
    const dgcA = payloadA.premiumData.dashaGocharaCompass;
    const dgcB = payloadB.premiumData.dashaGocharaCompass;
    const dgcC = payloadC.premiumData.dashaGocharaCompass;

    expect(dgcA).toBeDefined();
    expect(dgcB).toBeDefined();
    expect(dgcC).toBeDefined();

    // Badges must be populated
    expect(dgcA?.shaniBadge.status).toBeDefined();
    expect(dgcA?.guruBadge.status).toBeDefined();
    expect(dgcA?.dashaBadge.eraText).toBeDefined();
    expect(dgcA?.pariharaBadge.sankalpaText).toBeDefined();

    // 4 Golden Pillars must have deep, substantial text
    expect(dgcA?.pillars.career.text.length).toBeGreaterThan(40);
    expect(dgcA?.pillars.wealth.text.length).toBeGreaterThan(40);
    expect(dgcA?.pillars.family.text.length).toBeGreaterThan(40);
    expect(dgcA?.pillars.shield.text.length).toBeGreaterThan(40);

    // 3 In-Depth Analytical Paragraphs must be substantial
    expect(dgcA?.paragraph1.length).toBeGreaterThan(100);
    expect(dgcA?.paragraph2.length).toBeGreaterThan(100);
    expect(dgcA?.paragraph3.length).toBeGreaterThan(100);

    // Content must be 100% dynamically distinct between charts
    expect(dgcA?.paragraph1).not.toBe(dgcB?.paragraph1);
    expect(dgcB?.paragraph1).not.toBe(dgcC?.paragraph1);
    expect(dgcA?.pillars.career.text).not.toBe(dgcB?.pillars.career.text);
  }, 60000);

  it("verifies 100% pure script localization for Dasha-Gochara Compass across all 5 languages", async () => {
    const devotee = calculateKundli({
      name: "ವಿದ್ಯಾಧರ ಭಟ್",
      birthDate: "1988-11-12",
      birthTime: "10:20",
      latitude: 14.5479,
      longitude: 74.3187
    });

    const session: any = {
      result: devotee,
      birthDateYmd: "1988-11-12",
      birthTimeHm: "10:20",
      input: {
        name: "ವಿದ್ಯಾಧರ ಭಟ್",
        birthDate: "1988-11-12",
        birthTime: "10:20",
        latitude: 14.5479,
        longitude: 74.3187,
        gender: "Male"
      }
    };

    const languages = [
      { code: "kn", scriptRegex: /[\u0C80-\u0CFF]/, name: "Kannada" },
      { code: "hi", scriptRegex: /[\u0900-\u097F]/, name: "Hindi" },
      { code: "te", scriptRegex: /[\u0C00-\u0C7F]/, name: "Telugu" },
      { code: "ta", scriptRegex: /[\u0B80-\u0BFF]/, name: "Tamil" },
      { code: "en", scriptRegex: /[a-zA-Z]/, name: "English" }
    ];

    for (const langObj of languages) {
      const payload = await prepareBhavishyaV1Data(session, langObj.code, "");
      const compass = payload.premiumData.dashaGocharaCompass;

      expect(compass).toBeDefined();
      expect(compass?.title).toBeDefined();
      expect(compass?.shaniBadge.status).toBeDefined();
      expect(compass?.guruBadge.status).toBeDefined();
      expect(compass?.pillars.career.text).toBeDefined();
      expect(compass?.paragraph1.length).toBeGreaterThan(80);

      // Verify correct script presence
      expect(langObj.scriptRegex.test(compass!.title)).toBe(true);
      expect(langObj.scriptRegex.test(compass!.paragraph1)).toBe(true);
      expect(langObj.scriptRegex.test(compass!.paragraph2)).toBe(true);
      expect(langObj.scriptRegex.test(compass!.paragraph3)).toBe(true);

      // For regional Indic scripts, verify ZERO English token leakage in paragraphs
      if (langObj.code !== "en") {
        expect(/[a-zA-Z]{4,}/.test(compass!.paragraph1)).toBe(false);
        expect(/[a-zA-Z]{4,}/.test(compass!.paragraph2)).toBe(false);
        expect(/[a-zA-Z]{4,}/.test(compass!.paragraph3)).toBe(false);
      }
    }
  }, 60000);
});
