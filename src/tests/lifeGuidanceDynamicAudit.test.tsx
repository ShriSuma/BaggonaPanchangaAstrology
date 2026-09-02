import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import {
  executeLifeGuidanceCalculation,
  askCustomLifeQuestion,
  deriveAstrologicalMilestoneAges,
  getDynamicGokarnaPuja
} from "../features/lifeguidance/lifeGuidanceEngine";
import {
  T_LIFE_GUIDANCE,
  getLifeGuidanceText
} from "../features/lifeguidance/lifeGuidanceLocale";
import { LifeGuidancePdfTemplate } from "../components/lifeguidance/LifeGuidancePdfTemplate";
import {
  resolvePlaceFromPincode,
  resolvePlaceOrPincode,
  getCoordinates,
  fetchVillagesByPincode
} from "../services/locationApi";
import { getPriestProfile } from "../features/seva/sevaPriestDirectory";

describe("Personal Life Guidance (ವೈಯಕ್ತಿಕ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ) Dynamic & Offline Audit", () => {
  it("verifies 5-language locale dictionary completeness across kn, en, hi, te, ta", () => {
    const langs = ["kn", "en", "hi", "te", "ta"] as const;
    const requiredKeys = [
      "pageTitle",
      "pageSubtitle",
      "sanctuaryPill",
      "formHeader",
      "nameLabel",
      "dobLabel",
      "tobLabel",
      "genderLabel",
      "calculateBtn",
      "calculatingBtn",
      "tabCareer",
      "tabRelationship",
      "tabHealth",
      "tabChildren",
      "tabCustom",
      "priestSanctuaryHeader",
      "priestConsultDesc",
      "selectPriestLabel",
      "keyAgesLabel",
      "favorableDirectionsLabel",
      "whyRequiredLabel",
      "whatSignificanceLabel",
      "howTransformsLabel"
    ];

    for (const key of requiredKeys) {
      for (const lang of langs) {
        const val = getLifeGuidanceText(key, lang);
        expect(val).toBeDefined();
        expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it("calculates authentic Lagna and 4 domain life guidance from birth data", async () => {
    const result = await executeLifeGuidanceCalculation({
      personName: "Nagaraja Bhat",
      dob: "1994-08-15",
      tob: "08:30",
      gender: "Male",
      lang: "kn"
    });

    expect(result).toBeDefined();
    expect(result.personName).toBe("Nagaraja Bhat");
    expect(result.lagna.kn).toBeDefined();
    expect(result.rashi.kn).toBeDefined();
    expect(result.nakshatra.kn).toBeDefined();
    expect(result.dasha.kn).toBeDefined();

    // Verify 4 domains
    expect(result.career.title.kn).toBeDefined();
    expect(result.career.narrativeText.length).toBeGreaterThan(50);
    expect(result.career.keyAges.length).toBeGreaterThan(0);
    expect(result.career.gokarnaPujaDetail.pujaName.kn).toBeDefined();

    expect(result.relationship.title.kn).toBeDefined();
    expect(result.relationship.narrativeText.length).toBeGreaterThan(50);
    expect(result.relationship.keyAges.length).toBeGreaterThan(0);
    expect(result.relationship.gokarnaPujaDetail.pujaName.kn).toBeDefined();

    expect(result.health.title.kn).toBeDefined();
    expect(result.health.narrativeText.length).toBeGreaterThan(50);

    expect(result.children.title.kn).toBeDefined();
    expect(result.children.narrativeText.length).toBeGreaterThan(50);
  });

  it("generates authentic milestone ages based on planetary dasha and transits", () => {
    const ages = deriveAstrologicalMilestoneAges(28, "career");
    expect(ages.length).toBeGreaterThanOrEqual(3);
    ages.forEach((age) => {
      expect(age).toBeGreaterThan(0);
      expect(age).toBeLessThan(100);
    });
  });

  it("provides dynamic 5-language Gokarna Seva recommendations", () => {
    const pujaKn = getDynamicGokarnaPuja("Mesha", "Ashwini", "Jupiter", "career");
    expect(pujaKn.pujaName.kn).toBeDefined();
    expect(pujaKn.whyRequired.kn).toBeDefined();

    const pujaHi = getDynamicGokarnaPuja("Vrishabha", "Rohini", "Venus", "relationship");
    expect(pujaHi.pujaName.hi).toBeDefined();
    expect(pujaHi.whyRequired.hi).toBeDefined();
  });

  it("answers custom life questions with authentic fallback when offline/no-api", async () => {
    const result = await executeLifeGuidanceCalculation({
      personName: "Devotee",
      dob: "1990-05-20",
      tob: "14:15",
      gender: "Female",
      lang: "kn"
    });

    const answer = await askCustomLifeQuestion(
      result,
      "ನನಗೆ ಉದ್ಯೋಗದಲ್ಲಿ ಪ್ರಮೋಷನ್ ಯಾವಾಗ ಸಿಗಲಿದೆ?",
      "kn"
    );
    expect(answer).toBeDefined();
    expect(answer.length).toBeGreaterThan(30);
    expect(answer).toContain("ಗೋಕರ್ಣ");
  });

  it("renders 5-language LifeGuidancePdfTemplate cleanly without errors", async () => {
    const result = await executeLifeGuidanceCalculation({
      personName: "Devotee",
      dob: "1992-11-04",
      tob: "06:45",
      gender: "Male",
      lang: "kn"
    });

    const priest = getPriestProfile("shreeram-pandit");

    const { container } = render(
      <LifeGuidancePdfTemplate
        result={result}
        activeTab="career"
        lang="kn"
        priest={priest}
      />
    );

    const pdfContainer = container.querySelector("#life-guidance-pdf-container");
    expect(pdfContainer).not.toBeNull();
    expect(pdfContainer?.textContent).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(pdfContainer?.textContent).toContain("99723 39362");
  });

  describe("Offline Location & Pincode Resilience", () => {
    const originalNavigatorOnLine = navigator.onLine;

    afterEach(() => {
      Object.defineProperty(navigator, "onLine", {
        value: originalNavigatorOnLine,
        configurable: true
      });
    });

    it("resolves bundled pincode instantly without network", async () => {
      const gokarna = await resolvePlaceFromPincode("581326");
      expect(gokarna).not.toBeNull();
      expect(gokarna?.lat).toBeCloseTo(14.5479, 2);
      expect(gokarna?.lng).toBeCloseTo(74.3188, 2);
    });

    it("falls back to Gokarna (581326) coordinates when offline and pincode is not in bundled data", async () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true
      });

      const res = await resolvePlaceFromPincode("999999");
      expect(res).not.toBeNull();
      expect(res?.lat).toBeDefined();
      expect(res?.lng).toBeDefined();
      expect(res?.lat).toBeGreaterThan(0);
      expect(res?.lng).toBeGreaterThan(0);

      const placeOrPin = await resolvePlaceOrPincode("UnknownPlaceOffline");
      expect(placeOrPin).toBeDefined();
      expect(placeOrPin.lat).toBeCloseTo(14.5479, 2);
      expect(placeOrPin.lng).toBeCloseTo(74.3188, 2);

      const coords = await getCoordinates("SomeRandomPlace");
      expect(coords.lat).toBeCloseTo(14.5479, 2);
      expect(coords.lng).toBeCloseTo(74.3188, 2);
    });
  });
});
