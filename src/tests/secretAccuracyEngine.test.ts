import { describe, it, expect } from "vitest";
import {
  calculateSecretAccuracyProfile,
  checkBhriguBinduTransitTrigger,
  isPushkaraNavamsha,
  getVimshottariLordByNakshatra,
  evaluatePitruAndKarmaDosha,
  generateNext30DaysPowerCalendar,
  computeVyaparaRadarMetrics,
  auditNameAndMobileWithYogi,
  VIMSHOTTARI_CYCLE,
  RASHI_DISPOSITORS,
  PLANETARY_YOGI_ATTRIBUTES
} from "../engine/secretAccuracyEngine";
import {
  YOGI_AVAYOGI_LOCALE,
  BHRIGU_BINDU_LOCALE,
  PUSHKARA_LOCALE,
  ORDER_BUMP_LOCALE
} from "../engine/secretAccuracyLocale";
import { type PlanetPosition, type Planet } from "../engine/jyotishPrecisionGates";

describe("Baggona Secret Accuracy Engines (South Indian Precision)", () => {
  // Test Chart: Sun = 30° (Taurus 0°), Moon = 120° (Leo 0°), Rahu = 200° (Libra 20°)
  const mockSunLon = 30;
  const mockMoonLon = 120;
  const mockRahuLon = 200;

  const mockPlanets: PlanetPosition[] = [
    { planet: "Sun", longitude: 30, rashi: 1, degreeInSign: 0, rashiHouse: 1 },
    { planet: "Moon", longitude: 120, rashi: 4, degreeInSign: 0, rashiHouse: 4 },
    { planet: "Mars", longitude: 21, rashi: 0, degreeInSign: 21, rashiHouse: 12 }, // Fire sign 21° -> Pushkara!
    { planet: "Mercury", longitude: 40, rashi: 1, degreeInSign: 10, rashiHouse: 1 },
    { planet: "Jupiter", longitude: 98, rashi: 3, degreeInSign: 8, rashiHouse: 3 }, // Water sign 8° -> Pushkara!
    { planet: "Venus", longitude: 55, rashi: 1, degreeInSign: 25, rashiHouse: 1 },
    { planet: "Saturn", longitude: 280, rashi: 9, degreeInSign: 10, rashiHouse: 9 }, // Earth sign 10° -> Pushkara!
    { planet: "Rahu", longitude: 200, rashi: 6, degreeInSign: 20, rashiHouse: 6 },
    { planet: "Ketu", longitude: 20, rashi: 0, degreeInSign: 20, rashiHouse: 12 }
  ];

  describe("1. Yogi & Avayogi Planet Engine (Seshadri Iyer System)", () => {
    it("should calculate exact Yogi Point and Nakshatra Lord", () => {
      // YogiPoint = (30 + 120 + 93.333333) % 360 = 243.333333°
      // 243.333333° is in Sagittarius (Rashi 8: 240° to 270°)
      // Nakshatra Index = Math.floor(243.333333 / 13.333333) = 18 (Mula)
      // Mula nakshatra lord is Ketu
      const profile = calculateSecretAccuracyProfile(mockSunLon, mockMoonLon, mockRahuLon, mockPlanets);

      expect(profile.yogiPoint).toBeCloseTo(243.333333, 4);
      expect(profile.yogiRashi).toBe(8); // Sagittarius
      expect(profile.yogiNakshatraIndex).toBe(18); // Mula
      expect(profile.yogiPlanet).toBe("Ketu");
      expect(profile.duplicateYogiPlanet).toBe("Jupiter"); // Dispositor of Sagittarius is Jupiter
    });

    it("should calculate exact Avayogi Point and Nakshatra Lord", () => {
      // AvayogiPoint = (243.333333 + 186.666667) % 360 = 70.0°
      // 70° is in Gemini (Rashi 2: 60° to 90°)
      // Nakshatra Index = Math.floor(70 / 13.333333) = 5 (Mrigashirsha 2nd half / Ardra)
      // Nakshatra 5 lord is Rahu (Ardra)
      const profile = calculateSecretAccuracyProfile(mockSunLon, mockMoonLon, mockRahuLon, mockPlanets);

      expect(profile.avayogiPoint).toBeCloseTo(70.0, 4);
      expect(profile.avayogiRashi).toBe(2); // Gemini
      expect(profile.avayogiNakshatraIndex).toBe(5);
      expect(profile.avayogiPlanet).toBe("Rahu");
    });

    it("should map Yogi attributes accurately", () => {
      const profile = calculateSecretAccuracyProfile(mockSunLon, mockMoonLon, mockRahuLon, mockPlanets);
      expect(profile.yogiAttributes.gemstoneKn).toBe("ವೈಡೂರ್ಯ");
      expect(profile.yogiAttributes.wealthDayEn).toBe("Tuesday");
      expect(profile.yogiAttributes.directionEn).toBe("Centre / Upward");
    });

    it("should verify Vimshottari 9-planet cycle order", () => {
      expect(VIMSHOTTARI_CYCLE).toEqual([
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
      ]);
      expect(getVimshottariLordByNakshatra(0)).toBe("Ketu");     // Ashwini
      expect(getVimshottariLordByNakshatra(1)).toBe("Venus");    // Bharani
      expect(getVimshottariLordByNakshatra(2)).toBe("Sun");      // Krittika
      expect(getVimshottariLordByNakshatra(3)).toBe("Moon");     // Rohini
      expect(getVimshottariLordByNakshatra(4)).toBe("Mars");     // Mrigashirsha
      expect(getVimshottariLordByNakshatra(5)).toBe("Rahu");     // Ardra
      expect(getVimshottariLordByNakshatra(6)).toBe("Jupiter");  // Punarvasu
      expect(getVimshottariLordByNakshatra(7)).toBe("Saturn");   // Pushya
      expect(getVimshottariLordByNakshatra(8)).toBe("Mercury");  // Ashlesha
      expect(getVimshottariLordByNakshatra(9)).toBe("Ketu");     // Magha (Cycle repeats)
    });
  });

  describe("2. The Bhrigu Bindu (Destiny Trigger Point)", () => {
    it("should calculate shortest arc midpoint between Rahu and Moon", () => {
      // Moon = 120°, Rahu = 200°
      // Shortest arc diff = (120 - 200 + 360) % 360 = 280°
      // Bhrigu Bindu = (200 + 280 / 2) % 360 = (200 + 140) % 360 = 340° (Pisces 10°)
      const profile = calculateSecretAccuracyProfile(mockSunLon, mockMoonLon, mockRahuLon, mockPlanets);

      expect(profile.bhriguBindu).toBeCloseTo(340.0, 4);
      expect(profile.bhriguBinduRashi).toBe(11); // Pisces
      expect(profile.bhriguBinduDegree).toBeCloseTo(10.0, 4);
      expect(profile.bhriguBinduOpposite).toBeCloseTo(160.0, 4); // Virgo 10°
      expect(profile.bhriguBinduOppositeRashi).toBe(5); // Virgo
    });

    it("should detect Jupiter conjunction trigger within ±3° as AUSPICIOUS_BREAKTHROUGH", () => {
      const bhriguBindu = 340.0;
      const transits: PlanetPosition[] = [
        { planet: "Jupiter", longitude: 341.5, rashi: 11, degreeInSign: 11.5, rashiHouse: 11 }
      ];
      const triggers = checkBhriguBinduTransitTrigger(bhriguBindu, transits);

      expect(triggers.length).toBe(1);
      expect(triggers[0].planet).toBe("Jupiter");
      expect(triggers[0].aspect).toBe("CONJUNCTION_1ST");
      expect(triggers[0].eventNature).toBe("AUSPICIOUS_BREAKTHROUGH");
      expect(triggers[0].orbDegrees).toBeCloseTo(1.5, 4);
    });

    it("should detect Saturn 7th opposition trigger within ±3° as KARMIC_TRANSFORMATION", () => {
      const bhriguBindu = 340.0; // Opposite is 160°
      const transits: PlanetPosition[] = [
        { planet: "Saturn", longitude: 158.5, rashi: 5, degreeInSign: 8.5, rashiHouse: 5 }
      ];
      const triggers = checkBhriguBinduTransitTrigger(bhriguBindu, transits);

      expect(triggers.length).toBe(1);
      expect(triggers[0].planet).toBe("Saturn");
      expect(triggers[0].aspect).toBe("OPPOSITION_7TH");
      expect(triggers[0].eventNature).toBe("KARMIC_TRANSFORMATION");
      expect(triggers[0].orbDegrees).toBeCloseTo(1.5, 4);
    });

    it("should ignore transits outside ±3° orb", () => {
      const bhriguBindu = 340.0;
      const transits: PlanetPosition[] = [
        { planet: "Jupiter", longitude: 345.0, rashi: 11, degreeInSign: 15.0, rashiHouse: 11 } // 5° orb
      ];
      const triggers = checkBhriguBinduTransitTrigger(bhriguBindu, transits);
      expect(triggers.length).toBe(0);
    });
  });

  describe("3. Pushkara Navamsha & Invincible Planet Detection", () => {
    it("should recognize Pushkara Navamsha across all 4 elements", () => {
      // Fire sign (Aries = 0): 21° -> inside 20°00'–23°20'
      expect(isPushkaraNavamsha(0, 21.0)).toBe(true);
      // Fire sign (Leo = 4): 28° -> inside 26°40'–30°00'
      expect(isPushkaraNavamsha(4, 28.0)).toBe(true);
      // Fire sign outside: 15° -> false
      expect(isPushkaraNavamsha(0, 15.0)).toBe(false);

      // Earth sign (Taurus = 1): 8° -> inside 6°40'–10°00'
      expect(isPushkaraNavamsha(1, 8.0)).toBe(true);
      // Earth sign (Virgo = 5): 15° -> inside 13°20'–16°40'
      expect(isPushkaraNavamsha(5, 15.0)).toBe(true);

      // Air sign (Gemini = 2): 18° -> inside 16°40'–20°00'
      expect(isPushkaraNavamsha(2, 18.0)).toBe(true);
      // Air sign (Libra = 6): 25° -> inside 23°20'–26°40'
      expect(isPushkaraNavamsha(6, 25.0)).toBe(true);

      // Water sign (Cancer = 3): 2° -> inside 0°00'–3°20'
      expect(isPushkaraNavamsha(3, 2.0)).toBe(true);
      // Water sign (Pisces = 11): 8° -> inside 6°40'–10°00'
      expect(isPushkaraNavamsha(11, 8.0)).toBe(true);
    });

    it("should populate pushkaraBlessedPlanets in profile", () => {
      const profile = calculateSecretAccuracyProfile(mockSunLon, mockMoonLon, mockRahuLon, mockPlanets);
      const blessedNames = profile.pushkaraBlessedPlanets.map(p => p.planet);

      expect(blessedNames).toContain("Mars");
      expect(blessedNames).toContain("Jupiter");
      expect(blessedNames).toContain("Saturn");
    });
  });

  describe("4. High-Margin Revenue Products Engines", () => {
    it("Product A: should evaluate Pitru and Karma Dosha with Gokarna Seva recommendations", () => {
      const audit = evaluatePitruAndKarmaDosha(mockPlanets, 1);

      expect(audit).toHaveProperty("hasPitruDosha");
      expect(audit).toHaveProperty("hasMaandi99Knot");
      expect(audit).toHaveProperty("recommendedGokarnaSeva");
      expect(audit.recommendedGokarnaSeva.priestName).toContain("Shreeram Pandit");
      expect(audit.recommendedGokarnaSeva.priestPhone).toBe("+91 99723 39362");
    });

    it("Product B: should generate 30-day power calendar with green/yellow/red days and Bhrigu triggers", () => {
      const baseDate = new Date("2026-08-01");
      const calendar = generateNext30DaysPowerCalendar(baseDate, "Jupiter", "Saturn", 11, 4, 10, "kn");

      expect(calendar.length).toBe(30);
      expect(calendar[0]).toHaveProperty("dateYmd");
      expect(calendar[0]).toHaveProperty("status");
      expect(["GREEN_POWER", "YELLOW_NEUTRAL", "RED_CAUTION"]).toContain(calendar[0].status);
      expect(calendar.some(d => d.isBhriguBinduTriggerDay)).toBe(true);
    });

    it("Product C: should compute Vyapara & Wealth Radar metrics", () => {
      const radar = computeVyaparaRadarMetrics("Jupiter", "Saturn", "kn");

      expect(radar.yogiWealthDayKn).toBe("ಗುರುವಾರ");
      expect(radar.avayogiCautionDayKn).toBe("ಶನಿವಾರ");
      expect(radar.bestVyaparaDirectionKn).toBe("ಈಶಾನ್ಯ");
    });

    it("Product D: should calculate Chaldean vibration and compare against Yogi vs Avayogi", () => {
      // Test with clean personal name and mobile number
      const audit = auditNameAndMobileWithYogi("SHREERAM", "9972339362", "Jupiter", "Saturn");

      expect(audit.nameCompoundNumber).toBeGreaterThan(0);
      expect(audit.nameSingleDigit).toBeGreaterThanOrEqual(1);
      expect(audit.nameSingleDigit).toBeLessThanOrEqual(9);
      expect(["PERFECT_YOGI_HARMONY", "NEUTRAL_COMPATIBLE", "AVAYOGI_FRICTION_CLASH"]).toContain(audit.nameHarmonyStatus);
      expect(audit.mobileSum).toBeGreaterThan(0);
      expect(audit.mobileSingleDigit).toBeGreaterThanOrEqual(1);
      expect(audit.mobileSingleDigit).toBeLessThanOrEqual(9);
    });
  });

  describe("5. Pure Indic Localization (0% English Token Leakage)", () => {
    it("should guarantee zero Latin characters in Kannada dictionaries", () => {
      const latinRegex = /[a-zA-Z]/;

      // Yogi Avayogi Kannada dictionary
      expect(latinRegex.test(YOGI_AVAYOGI_LOCALE.kn.yogiBadge)).toBe(false);
      expect(latinRegex.test(YOGI_AVAYOGI_LOCALE.kn.avayogiBadge)).toBe(false);
      expect(latinRegex.test(YOGI_AVAYOGI_LOCALE.kn.wealthDayLabel)).toBe(false);

      // Bhrigu Bindu Kannada dictionary
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.kn.title)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.kn.description)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.kn.breakthroughNotice)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.kn.karmicTestNotice)).toBe(false);

      // Pushkara Kannada dictionary
      expect(latinRegex.test(PUSHKARA_LOCALE.kn.title)).toBe(false);
      expect(latinRegex.test(PUSHKARA_LOCALE.kn.tagline)).toBe(false);
      expect(latinRegex.test(PUSHKARA_LOCALE.kn.explanation)).toBe(false);

      // Order Bump Kannada dictionary
      expect(latinRegex.test(ORDER_BUMP_LOCALE.kn.pitchBullet1)).toBe(false);
      expect(latinRegex.test(ORDER_BUMP_LOCALE.kn.pitchBullet2)).toBe(false);
      expect(latinRegex.test(ORDER_BUMP_LOCALE.kn.pitchBullet3)).toBe(false);
      expect(latinRegex.test(ORDER_BUMP_LOCALE.kn.guaranteeText)).toBe(false);
    });

    it("should guarantee zero Latin characters in Hindi dictionaries", () => {
      const latinRegex = /[a-zA-Z]/;

      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.hi.title)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.hi.description)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.hi.breakthroughNotice)).toBe(false);
      expect(latinRegex.test(ORDER_BUMP_LOCALE.hi.pitchBullet1)).toBe(false);
      expect(latinRegex.test(ORDER_BUMP_LOCALE.hi.guaranteeText)).toBe(false);
    });

    it("should guarantee zero Latin characters in Telugu and Tamil dictionaries", () => {
      const latinRegex = /[a-zA-Z]/;

      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.te.title)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.te.breakthroughNotice)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.ta.title)).toBe(false);
      expect(latinRegex.test(BHRIGU_BINDU_LOCALE.ta.breakthroughNotice)).toBe(false);
    });
  });
});
