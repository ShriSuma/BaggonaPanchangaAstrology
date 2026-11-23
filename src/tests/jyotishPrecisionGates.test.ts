import { describe, it, expect } from "vitest";
import {
  getFunctionalNature,
  hasGocharaVedha,
  checkNeechaBhanga,
  getDegreeVulnerability,
  getDashaTransitionStatus,
  evaluateThreeGatePrediction,
  generatePastEventVerification,
  LAGNA_FUNCTIONAL_MATRIX,
  type PlanetPosition,
  type RashiIndex
} from "../engine/jyotishPrecisionGates";

describe("100% Jyotish Precision Gates Engine", () => {
  describe("1. 12-Lagna Functional Nature Matrix", () => {
    it("never classifies Saturn as generic malefic for Taurus or Libra Lagna", () => {
      // Taurus Lagna (1)
      expect(getFunctionalNature(1, "Saturn")).toBe("YOGAKARAKA");
      expect(LAGNA_FUNCTIONAL_MATRIX[1].Saturn).toBe("YOGAKARAKA");

      // Libra Lagna (6)
      expect(getFunctionalNature(6, "Saturn")).toBe("YOGAKARAKA");
      expect(LAGNA_FUNCTIONAL_MATRIX[6].Saturn).toBe("YOGAKARAKA");
    });

    it("accurately classifies Mars as Yogakaraka for Cancer and Leo Lagna", () => {
      // Cancer Lagna (3)
      expect(getFunctionalNature(3, "Mars")).toBe("YOGAKARAKA");
      // Leo Lagna (4)
      expect(getFunctionalNature(4, "Mars")).toBe("YOGAKARAKA");
    });

    it("accurately classifies functional benefics and marakas for Aries and Pisces", () => {
      // Aries (0): Jupiter is 9th/12th lord (Benefic), Venus is 2nd/7th lord (Maraka)
      expect(getFunctionalNature(0, "Jupiter")).toBe("BENEFIC");
      expect(getFunctionalNature(0, "Venus")).toBe("MARAKA");

      // Pisces (11): Jupiter & Moon are benefics, Venus & Saturn are malefics
      expect(getFunctionalNature(11, "Jupiter")).toBe("BENEFIC");
      expect(getFunctionalNature(11, "Moon")).toBe("BENEFIC");
      expect(getFunctionalNature(11, "Venus")).toBe("MALEFIC");
    });

    it("safely handles Rahu and Ketu as Neutral dispositor-dependent grahas", () => {
      expect(getFunctionalNature(0, "Rahu")).toBe("NEUTRAL");
      expect(getFunctionalNature(1, "Ketu")).toBe("NEUTRAL");
    });
  });

  describe("2. Classical Gochara Vedha (Obstruction) Engine", () => {
    it("respects Father-Son (Sun-Saturn) exception: Sun in 3rd is NOT obstructed by Saturn in 9th", () => {
      const result = hasGocharaVedha("Sun", 3, { Saturn: 9, Mars: 4 });
      expect(result.isObstructed).toBe(false);
    });

    it("respects Father-Son (Saturn-Sun) exception: Saturn in 3rd is NOT obstructed by Sun in 12th", () => {
      const result = hasGocharaVedha("Saturn", 3, { Sun: 12 });
      expect(result.isObstructed).toBe(false);
    });

    it("respects Moon-Mercury exception: Moon in 3rd is NOT obstructed by Mercury in 9th", () => {
      const result = hasGocharaVedha("Moon", 3, { Mercury: 9 });
      expect(result.isObstructed).toBe(false);
    });

    it("accurately flags obstruction when non-exempt planet occupies the Vedha house", () => {
      // Mars in 3rd house from Moon has Vedha in 12th house.
      // Jupiter in 12th house causes Vedha to Mars.
      const obstructed = hasGocharaVedha("Mars", 3, { Jupiter: 12 });
      expect(obstructed.isObstructed).toBe(true);
      expect(obstructed.obstructedBy).toBe("Jupiter");

      // Jupiter in 2nd house has Vedha in 12th house. Mars in 12th causes Vedha.
      const jupObstructed = hasGocharaVedha("Jupiter", 2, { Mars: 12 });
      expect(jupObstructed.isObstructed).toBe(true);
      expect(jupObstructed.obstructedBy).toBe("Mars");
    });

    it("returns false when no planet occupies the Vedha house", () => {
      const clean = hasGocharaVedha("Jupiter", 2, { Mars: 5, Venus: 7 });
      expect(clean.isObstructed).toBe(false);
    });
  });

  describe("3. Neecha Bhanga Raja Yoga (Debilitation Cancellation) Gate", () => {
    const createMockPos = (planet: any, rashi: RashiIndex, isRetro: boolean = false): PlanetPosition => ({
      planet,
      longitude: rashi * 30 + 15,
      rashi,
      degreeInSign: 15,
      rashiHouse: 1,
      bhavaHouse: 1,
      nakshatraLord: "Sun",
      isRetrograde: isRetro,
      isCombust: false
    });

    it("cancels debilitation when sign dispositor is in Kendra from Lagna", () => {
      // Sun debilitated in Libra (6)
      // Dispositor Venus in Capricorn (9) -> Kendra (4th) from Libra Lagna (6)
      const sunPos = createMockPos("Sun", 6);
      const venusPos = createMockPos("Venus", 9); // Kendra from Lagna 6 (diff = 3 signs)
      const allPlanets: any = { Sun: sunPos, Venus: venusPos, Saturn: createMockPos("Saturn", 2) };

      const nb = checkNeechaBhanga(sunPos, allPlanets, 6, 0);
      expect(nb.isDebilitated).toBe(true);
      expect(nb.hasNeechaBhanga).toBe(true);
      expect(nb.reason).toContain("Dispositor");
    });

    it("cancels debilitation when exaltation lord of the debilitation sign is in Kendra", () => {
      // Jupiter debilitated in Capricorn (9)
      // Mars (exaltation lord of Capricorn) is in Aries (0) -> Kendra (10th) from Cancer Lagna (3)
      const jupPos = createMockPos("Jupiter", 9);
      const saturnPos = createMockPos("Saturn", 2); // Dispositor not in Kendra
      const marsPos = createMockPos("Mars", 0); // Exaltation lord in Kendra from Lagna 3 (0 - 3 = 9 mod 12 -> 4th house Kendra!)
      const allPlanets: any = { Jupiter: jupPos, Saturn: saturnPos, Mars: marsPos };

      const nb = checkNeechaBhanga(jupPos, allPlanets, 3, 3);
      expect(nb.isDebilitated).toBe(true);
      expect(nb.hasNeechaBhanga).toBe(true);
      expect(nb.reason).toContain("Exaltation lord");
    });

    it("cancels debilitation when the debilitated planet is Retrograde (high Chesta Bala)", () => {
      // Saturn debilitated in Aries (0), but Retrograde
      // Put Mars in Taurus (1) and Sun in Leo (4) so neither dispositor nor exaltation lord is in Kendra from Lagna (8)
      const saturnPos = createMockPos("Saturn", 0, true);
      const allPlanets: any = { Saturn: saturnPos, Mars: createMockPos("Mars", 1), Sun: createMockPos("Sun", 4) };

      const nb = checkNeechaBhanga(saturnPos, allPlanets, 8, 8);
      expect(nb.isDebilitated).toBe(true);
      expect(nb.hasNeechaBhanga).toBe(true);
      expect(nb.reason).toContain("Retrograde");
    });

    it("identifies uncancelled debilitation when zero Kendra/Retrograde conditions are met", () => {
      // Mercury debilitated in Pisces (11)
      // Dispositor Jupiter in 2nd house (not Kendra), Exaltation lord Venus in 8th house (not Kendra)
      const mercPos = createMockPos("Mercury", 11, false);
      const jupPos = createMockPos("Jupiter", 1);
      const venusPos = createMockPos("Venus", 7);
      const allPlanets: any = { Mercury: mercPos, Jupiter: jupPos, Venus: venusPos };

      const nb = checkNeechaBhanga(mercPos, allPlanets, 0, 0);
      expect(nb.isDebilitated).toBe(true);
      expect(nb.hasNeechaBhanga).toBe(false);
    });
  });

  describe("4. Degree Vulnerability Gate (Gandanta & Rashi Sandhi)", () => {
    it("flags Water-Fire junction as HIGH_KARMIC_KNOT Gandanta", () => {
      // Pisces end (11) at 28.5 degrees
      const revatiEnd = getDegreeVulnerability(11, 28.5);
      expect(revatiEnd.isGandanta).toBe(true);
      expect(revatiEnd.severity).toBe("HIGH_KARMIC_KNOT");

      // Aries beginning (0) at 1.5 degrees
      const ashwiniStart = getDegreeVulnerability(0, 1.5);
      expect(ashwiniStart.isGandanta).toBe(true);
      expect(ashwiniStart.severity).toBe("HIGH_KARMIC_KNOT");

      // Scorpio end (7) at 29.8 degrees (Jyeshtha Gandanta)
      const jyeshthaEnd = getDegreeVulnerability(7, 29.8);
      expect(jyeshthaEnd.isGandanta).toBe(true);
      expect(jyeshthaEnd.severity).toBe("HIGH_KARMIC_KNOT");
    });

    it("flags 0-1 and 29-30 deg in non-Gandanta signs as MODERATE Rashi Sandhi", () => {
      // Taurus (1) at 0.5 degrees
      const taurusSandhi = getDegreeVulnerability(1, 0.5);
      expect(taurusSandhi.isGandanta).toBe(false);
      expect(taurusSandhi.isRashiSandhi).toBe(true);
      expect(taurusSandhi.severity).toBe("MODERATE");

      // Gemini (2) at 29.4 degrees
      const geminiSandhi = getDegreeVulnerability(2, 29.4);
      expect(geminiSandhi.isGandanta).toBe(false);
      expect(geminiSandhi.isRashiSandhi).toBe(true);
      expect(geminiSandhi.severity).toBe("MODERATE");
    });

    it("returns NONE for planets comfortably placed in mid-sign degrees", () => {
      const midDegree = getDegreeVulnerability(4, 15.0); // Leo 15 deg
      expect(midDegree.isGandanta).toBe(false);
      expect(midDegree.isRashiSandhi).toBe(false);
      expect(midDegree.severity).toBe("NONE");
    });
  });

  describe("5. Dasha Transition Status Detector", () => {
    it("detects Dasha Chidra during the final 10% of a Mahadasha", () => {
      const start = new Date(2010, 0, 1);
      const end = new Date(2026, 0, 1); // 16 years (Jupiter MD)
      const target = new Date(2025, 6, 1); // ~6 months before end (< 10% remaining)

      const status = getDashaTransitionStatus(start, end, target);
      expect(status.isDashaChidra).toBe(true);
      expect(status.alertLevel).toBe("HIGH_TRANSITION");
    });

    it("returns NORMAL for mid-Mahadasha periods", () => {
      const start = new Date(2015, 0, 1);
      const end = new Date(2035, 0, 1);
      const target = new Date(2025, 0, 1); // Mid-point

      const status = getDashaTransitionStatus(start, end, target);
      expect(status.isDashaChidra).toBe(false);
      expect(status.isDashaSandhi).toBe(false);
      expect(status.alertLevel).toBe("NORMAL");
    });
  });

  describe("6. 3-Gate Event Validator (Zero-Hallucination)", () => {
    it("approves HIGH_CERTAINTY when all 3 gates pass", () => {
      const res = evaluateThreeGatePrediction({
        natalPromiseScore: 80, // Gate 1: Pass
        isDashaOrNakshatraActive: true, // Gate 2: Pass
        isDoubleTransitActive: true, // Gate 3: Pass
        transitPlanetBAV: 5,
        isVedhaObstructed: false
      });

      expect(res.confidence).toBe("HIGH_CERTAINTY");
      expect(res.gatesPassed).toBe(3);
      expect(res.summaryTag).toBe("SOVEREIGN_FRUITION");
    });

    it("demotes to MODERATE_EFFORT when 2 gates pass with natal promise", () => {
      const res = evaluateThreeGatePrediction({
        natalPromiseScore: 75, // Gate 1: Pass
        isDashaOrNakshatraActive: true, // Gate 2: Pass
        isDoubleTransitActive: true,
        transitPlanetBAV: 3, // BAV < 4 fails Gate 3
        isVedhaObstructed: false
      });

      expect(res.confidence).toBe("MODERATE_EFFORT");
      expect(res.gatesPassed).toBe(2);
      expect(res.summaryTag).toBe("DELAYED_OR_EFFORT_REQUIRED");
    });

    it("suppresses prediction when natal promise or multiple gates fail", () => {
      const res = evaluateThreeGatePrediction({
        natalPromiseScore: 40, // Gate 1: Fail
        isDashaOrNakshatraActive: false,
        isDoubleTransitActive: true,
        transitPlanetBAV: 5,
        isVedhaObstructed: false
      });

      expect(res.confidence).toBe("SUPPRESS");
      expect(res.gatesPassed).toBe(1);
      expect(res.summaryTag).toBe("DO_NOT_PREDICT");
    });
  });

  describe("7. Past-Event Verification Generator (Sales Hook)", () => {
    it("maps Maandi 10th house to career/deal cancellation at 99% mark", () => {
      const hooks = generatePastEventVerification({
        pastAntardashaLord: "Saturn",
        pastAntardashaHouse: 10,
        pastPeriodLabel: "2023 – 2024",
        maandiHouse: 10,
        wasSadeSatiOrAshtamaShani: false
      });

      expect(hooks).toHaveLength(1);
      expect(hooks[0].headlineKey).toBe("CAREER_OR_DEAL_CANCELLED_AT_99_PERCENT");
      expect(hooks[0].mathematicalProof).toContain("Maandi in House 10");
    });

    it("adds heavy mental load hook when Sade Sati or Ashtama Shani was active", () => {
      const hooks = generatePastEventVerification({
        pastAntardashaLord: "Rahu",
        pastAntardashaHouse: 8,
        pastPeriodLabel: "2023 – 2024",
        maandiHouse: 2,
        wasSadeSatiOrAshtamaShani: true
      });

      expect(hooks).toHaveLength(2);
      expect(hooks[0].headlineKey).toBe("STALLED_SAVINGS_OR_FAMILY_FRICTION");
      expect(hooks[1].headlineKey).toBe("HEAVY_MENTAL_LOAD_AND_UNRECOGNIZED_EFFORT");
    });
  });
});
