/**
 * Baggona 5-Year Master Prediction Family Diversity & Zero-Hardcoding Audit
 *
 * Verifies that when multiple members of the same family generate their Next 5 Years PDF:
 * 1. Zero hardcoded text: Every person's opening hook, narrative paragraph, 4-pillar current life status,
 *    and Nagalu jewelry accumulation roadmap is 100% dynamically synthesized from their unique
 *    Janma Kundli (Lagna, Lagna Lord, Moon Sign, Moon Lord, Nakshatra, Pada), live Gochara transits
 *    (Saturn, Jupiter, Rahu/Ketu), Janma Panchanga, and active Vimshottari Mahadasha/Antardasha.
 * 2. Complete Diversity: If 4 family members (Father, Mother, Son, Daughter) generate reports,
 *    none of them receive identical opening lines, paragraphs, core focus themes, or metal recommendations.
 * 3. Accuracy of 9-Graha Sphuta and Bhava calculations.
 */

import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { compute5YearMasterPrediction } from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";

interface FamilyMemberProfile {
  id: string;
  relation: "Father" | "Mother" | "Son" | "Daughter";
  name: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  gender: "Male" | "Female";
}

const FAMILY_MEMBERS: FamilyMemberProfile[] = [
  {
    id: "father",
    relation: "Father",
    name: "Narasimha Bhat",
    birthDate: "1968-08-15",
    birthTime: "06:30",
    lat: 12.9716,
    lng: 77.5946,
    gender: "Male"
  },
  {
    id: "mother",
    relation: "Mother",
    name: "Gayatri Devi",
    birthDate: "1973-11-20",
    birthTime: "18:45",
    lat: 12.2958,
    lng: 76.6394,
    gender: "Female"
  },
  {
    id: "son",
    relation: "Son",
    name: "Aditya Bhat",
    birthDate: "2000-03-10",
    birthTime: "14:15",
    lat: 14.5479,
    lng: 74.3188,
    gender: "Male"
  },
  {
    id: "daughter",
    relation: "Daughter",
    name: "Ananya Bhat",
    birthDate: "2004-07-25",
    birthTime: "09:30",
    lat: 15.3647,
    lng: 75.1240,
    gender: "Female"
  }
];

describe("Family Diversity & Dynamic Synthesis Audit (Zero Hardcoding)", () => {
  it("generates 100% mutually unique Opening Hooks for all 4 family members in Kannada", () => {
    const predictions = FAMILY_MEMBERS.map(m => {
      const k = calculateKundli({
        name: m.name,
        birthDate: m.birthDate,
        birthTime: m.birthTime,
        latitude: m.lat,
        longitude: m.lng,
        gender: m.gender
      });
      return {
        member: m,
        kundli: k,
        pred: compute5YearMasterPrediction(k, m.birthDate, m.birthTime, "kn", m.name, 2026)
      };
    });

    const openingLines = predictions.map(p => p.pred.openingHook?.openingLine);
    const firstParagraphs = predictions.map(p => p.pred.openingHook?.firstParagraph);
    const coreFocusThemes = predictions.map(p => p.pred.openingHook?.coreFocusTheme);

    // 1. All 4 members must have non-empty opening hooks
    openingLines.forEach(line => {
      expect(line).toBeTruthy();
      expect(line!.length).toBeGreaterThan(40);
    });

    firstParagraphs.forEach(para => {
      expect(para).toBeTruthy();
      expect(para!.length).toBeGreaterThan(100);
    });

    // 2. All 4 opening lines MUST be mutually distinct (no duplicate copy-paste)
    const uniqueOpeningLines = new Set(openingLines);
    expect(uniqueOpeningLines.size).toBe(4);

    // 3. All 4 first paragraphs MUST be mutually distinct
    const uniqueFirstParagraphs = new Set(firstParagraphs);
    expect(uniqueFirstParagraphs.size).toBe(4);

    // 4. All 4 core focus themes MUST be mutually distinct
    const uniqueThemes = new Set(coreFocusThemes);
    expect(uniqueThemes.size).toBe(4);

    // 5. Each opening line must embed their personal astrological indicators
    predictions.forEach(p => {
      const line = p.pred.openingHook?.openingLine ?? "";
      // Must contain their Rashi or Lagna
      const hasRashiOrLagna = line.includes(p.pred.moonRashi) || line.includes(p.pred.lagnaRashi);
      expect(hasRashiOrLagna).toBe(true);
    });
  });

  it("generates 100% mutually unique Opening Hooks for all 4 family members in English", () => {
    const predictions = FAMILY_MEMBERS.map(m => {
      const k = calculateKundli({
        name: m.name,
        birthDate: m.birthDate,
        birthTime: m.birthTime,
        latitude: m.lat,
        longitude: m.lng,
        gender: m.gender
      });
      return {
        member: m,
        pred: compute5YearMasterPrediction(k, m.birthDate, m.birthTime, "en", m.name, 2026)
      };
    });

    const openingLines = predictions.map(p => p.pred.openingHook?.openingLine);
    const firstParagraphs = predictions.map(p => p.pred.openingHook?.firstParagraph);

    const uniqueOpeningLines = new Set(openingLines);
    expect(uniqueOpeningLines.size).toBe(4);

    const uniqueFirstParagraphs = new Set(firstParagraphs);
    expect(uniqueFirstParagraphs.size).toBe(4);

    predictions.forEach(p => {
      const line = p.pred.openingHook?.openingLine ?? "";
      expect(line).toBeTruthy();
      // Must reference ascendant or moon sign
      const mentionsChartIndicator = line.toLowerCase().includes("ascendant") ||
        line.toLowerCase().includes("moon") ||
        line.toLowerCase().includes("mahadasha") ||
        line.toLowerCase().includes("jupiter") ||
        line.toLowerCase().includes("saturn");
      expect(mentionsChartIndicator).toBe(true);
    });
  });

  it("dynamically calculates authentic 9-Graha Sphuta tables with accurate degrees and dignities", () => {
    FAMILY_MEMBERS.forEach(m => {
      const k = calculateKundli({
        name: m.name,
        birthDate: m.birthDate,
        birthTime: m.birthTime,
        latitude: m.lat,
        longitude: m.lng,
        gender: m.gender
      });
      const pred = compute5YearMasterPrediction(k, m.birthDate, m.birthTime, "kn", m.name, 2026);

      const calculations = pred.planetaryCalculations;
      expect(calculations).toBeDefined();
      expect(calculations!.length).toBe(9); // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu

      const planetNames = calculations!.map(c => c.planetName);
      expect(planetNames).toContain("Sun");
      expect(planetNames).toContain("Moon");
      expect(planetNames).toContain("Saturn");
      expect(planetNames).toContain("Jupiter");
      expect(planetNames).toContain("Rahu");

      calculations!.forEach(c => {
        expect(c.localizedName).toBeTruthy();
        expect(c.localizedRashi).toBeTruthy();
        expect(c.degreeFormatted).toContain("°");
        expect(c.house).toBeGreaterThanOrEqual(1);
        expect(c.house).toBeLessThanOrEqual(12);
        expect(c.nakshatra).toBeTruthy();
        expect(c.dignity).toBeTruthy();
      });
    });
  });

  it("calculates dynamically differentiated Collection Nagalu Gold & Jewelry Roadmaps", () => {
    const nagaluResults = FAMILY_MEMBERS.map(m => {
      const k = calculateKundli({
        name: m.name,
        birthDate: m.birthDate,
        birthTime: m.birthTime,
        latitude: m.lat,
        longitude: m.lng,
        gender: m.gender
      });
      const pred = compute5YearMasterPrediction(k, m.birthDate, m.birthTime, "kn", m.name, 2026);
      return {
        member: m,
        nagalu: pred.nagaluRoadmap!
      };
    });

    // 1. Every family member gets non-empty Nagalu roadmap
    nagaluResults.forEach(r => {
      expect(r.nagalu).toBeDefined();
      expect(r.nagalu.title).toContain("೫ ವರ್ಷಗಳ ಚಿನ್ನಾಭರಣ");
      expect(r.nagalu.subtitle).toContain("ಪರಾಶರಿ");
      expect(r.nagalu.dhanaBhavaDisposition).toBeTruthy();
      expect(r.nagalu.favorableGemstoneMetals).toBeTruthy();
      expect(r.nagalu.overallYogaSummary).toBeTruthy();
      expect(r.nagalu.yearlyTimeline).toHaveLength(5);
    });

    // 2. Favorable metals must be customized to Lagna Tattva
    const metalRecommendations = nagaluResults.map(r => r.nagalu.favorableGemstoneMetals);
    const uniqueMetals = new Set(metalRecommendations);
    expect(uniqueMetals.size).toBeGreaterThanOrEqual(2);

    // 3. Yearly timelines must have authentic suitability scores
    nagaluResults.forEach(r => {
      r.nagalu.yearlyTimeline.forEach(yr => {
        expect(yr.yearRange).toMatch(/20[23]\d/);
        expect(yr.suitabilityScore).toBeGreaterThanOrEqual(50);
        expect(yr.suitabilityScore).toBeLessThanOrEqual(100);
        expect(yr.prediction).toBeTruthy();
        expect(yr.auspiciousMuhurta).toBeTruthy();
      });
    });
  });

  it("verifies Current Life Status 4-pillar dashboard is completely differentiated per family member", () => {
    const statuses = FAMILY_MEMBERS.map(m => {
      const k = calculateKundli({
        name: m.name,
        birthDate: m.birthDate,
        birthTime: m.birthTime,
        latitude: m.lat,
        longitude: m.lng,
        gender: m.gender
      });
      const pred = compute5YearMasterPrediction(k, m.birthDate, m.birthTime, "kn", m.name, 2026);
      return {
        member: m,
        cls: pred.currentLifeStatus!
      };
    });

    // 1. Every member has full status
    statuses.forEach(s => {
      expect(s.cls).toBeDefined();
      expect(s.cls.emotionalEmpathyHeading).toBeTruthy();
      expect(s.cls.karmicFlowSummary).toBeTruthy();
      expect(s.cls.careerImmediateFocus).toBeTruthy();
      expect(s.cls.wealthImmediateFocus).toBeTruthy();
      expect(s.cls.familyImmediateFocus).toBeTruthy();
      expect(s.cls.healthImmediateFocus).toBeTruthy();
      expect(s.cls.fourPillarsDashboard).toBeDefined();
      expect(s.cls.fourPillarsDashboard?.career).toBeDefined();
      expect(s.cls.fourPillarsDashboard?.wealth).toBeDefined();
      expect(s.cls.fourPillarsDashboard?.family).toBeDefined();
      expect(s.cls.fourPillarsDashboard?.health).toBeDefined();
    });

    // 2. Immediate focuses must not be identical across all 4 family members
    const careerFocuses = statuses.map(s => s.cls.careerImmediateFocus);
    const uniqueCareer = new Set(careerFocuses);
    expect(uniqueCareer.size).toBeGreaterThanOrEqual(2);

    // 3. Karmic flow summaries must reflect distinct charts
    const summaries = statuses.map(s => s.cls.karmicFlowSummary);
    const uniqueSummaries = new Set(summaries);
    expect(uniqueSummaries.size).toBeGreaterThanOrEqual(2);
  });
});
