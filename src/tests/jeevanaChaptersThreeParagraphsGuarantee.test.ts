import { describe, it, expect } from "vitest";
import {
  analyzeKundali,
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCareerFallback,
  buildDynamicWealthFallback,
  buildDynamicHealthFallback,
  buildDynamicChildEducationFallback,
  buildDynamicChildActivitiesFallback,
  buildDynamicChildFoundationFallback,
  buildDynamicChildFamilyFallback,
  buildDynamicChildPediatricHealthFallback,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  type KundaliAnalysisInput
} from "../features/premiumPdf/dynamicBhavishyaEngine";
import {
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText
} from "../components/RamanBhavishya/BhavishyaView";

describe("Jeevana Chapters Minimum 3 Paragraphs & Personalization Verification Suite", () => {
  const baseKundali: KundaliAnalysisInput = {
    lagnaRashiIndex: 0,
    moonRashiIndex: 3,
    natalPlanets: [
      { graha: "Sun", rashiIndex: 11, house: 12 },
      { graha: "Moon", rashiIndex: 3, house: 4 },
      { graha: "Mars", rashiIndex: 9, house: 10 },
      { graha: "Mercury", rashiIndex: 11, house: 12 },
      { graha: "Jupiter", rashiIndex: 11, house: 12 },
      { graha: "Venus", rashiIndex: 1, house: 2 },
      { graha: "Saturn", rashiIndex: 10, house: 11 },
      { graha: "Rahu", rashiIndex: 7, house: 8 },
      { graha: "Ketu", rashiIndex: 1, house: 2 }
    ],
    transits: [],
    mahaLord: "Jupiter",
    bhuktiLord: "Saturn",
    ageYears: 32,
    maritalStatus: "married",
    gender: "Male",
    lang: "kn"
  };

  const languages = ["kn", "hi", "te", "ta", "en"] as const;

  it("strictly enforces minimum 3 substantial paragraphs for core adult chapters across all 5 languages", () => {
    for (const lang of languages) {
      const parsed = analyzeKundali({ ...baseKundali, lang });

      // Marriage (all 3 marital statuses)
      for (const st of ["married", "unmarried", "general"] as const) {
        const marriage = buildDynamicMarriageFallback(parsed, st);
        const marriageParas = marriage.split("\n\n").filter(p => p.trim().length > 0);
        expect(marriageParas.length).toBeGreaterThanOrEqual(3);
        marriageParas.forEach(p => expect(p.length).toBeGreaterThan(100));
      }

      // Children (all 3 children statuses)
      for (const cs of ["has_children", "no_children", "general"] as const) {
        const children = buildDynamicChildrenFallback(parsed, cs);
        const childrenParas = children.split("\n\n").filter(p => p.trim().length > 0);
        expect(childrenParas.length).toBeGreaterThanOrEqual(3);
        childrenParas.forEach(p => expect(p.length).toBeGreaterThan(100));
      }

      // Career
      const career = buildDynamicCareerFallback(parsed);
      expect(career.split("\n\n").length).toBeGreaterThanOrEqual(3);

      // Wealth
      const wealth = buildDynamicWealthFallback(parsed);
      expect(wealth.split("\n\n").length).toBeGreaterThanOrEqual(3);

      // Health
      const health = buildDynamicHealthFallback(parsed);
      expect(health.split("\n\n").length).toBeGreaterThanOrEqual(3);

      // Characteristics & Dark Secret
      const char = buildDynamicCharacteristicsFallback(parsed);
      expect(char.split("\n\n").length).toBeGreaterThanOrEqual(3);

      const secret = buildDynamicDarkSecretFallback(parsed);
      expect(secret.split("\n\n").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("strictly enforces minimum 3 substantial paragraphs for all 5 child chapters across all 5 languages", () => {
    for (const lang of languages) {
      const childParsed = analyzeKundali({ ...baseKundali, ageYears: 8, lang });

      const edu = buildDynamicChildEducationFallback(childParsed);
      expect(edu.split("\n\n").length).toBeGreaterThanOrEqual(3);

      const act = buildDynamicChildActivitiesFallback(childParsed);
      expect(act.split("\n\n").length).toBeGreaterThanOrEqual(3);

      const found = buildDynamicChildFoundationFallback(childParsed);
      expect(found.split("\n\n").length).toBeGreaterThanOrEqual(3);

      const fam = buildDynamicChildFamilyFallback(childParsed);
      expect(fam.split("\n\n").length).toBeGreaterThanOrEqual(3);

      const ped = buildDynamicChildPediatricHealthFallback(childParsed);
      expect(ped.split("\n\n").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("strictly generates minimum 3 paragraphs for buildPersonalizedMarriageText for married, unmarried, and general status", () => {
    const maritalStatuses = ["married", "unmarried", "general"] as const;
    for (const lang of languages) {
      for (const status of maritalStatuses) {
        const text = buildPersonalizedMarriageText(lang, "ಮೇಷ", "ಕರ್ಕಾಟಕ", status, 0, "ಗುರು", "ಶುಕ್ರ", "Male");
        const paras = text.split("\n\n").filter(p => p.trim().length > 0);
        expect(paras.length).toBeGreaterThanOrEqual(3);
        paras.forEach((para) => {
          expect(para.length).toBeGreaterThan(100);
        });
      }
    }
  });

  it("strictly generates minimum 3 paragraphs for buildPersonalizedChildrenText for has_children, no_children, and general status", () => {
    const childrenStatuses = ["has_children", "no_children", "general"] as const;
    for (const lang of languages) {
      for (const status of childrenStatuses) {
        const text = buildPersonalizedChildrenText(lang, status, 0, "ಗುರು", "ಶುಕ್ರ");
        const paras = text.split("\n\n").filter(p => p.trim().length > 0);
        expect(paras.length).toBeGreaterThanOrEqual(3);
        paras.forEach((para) => {
          expect(para.length).toBeGreaterThan(100);
        });
      }
    }
  });
});
