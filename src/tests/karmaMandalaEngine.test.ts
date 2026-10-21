import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import {
  calculateKarmaMandalaSynthesis,
  calculateUpcomingGokarnaMuhurthas
} from "../features/karmaSanjeevini/karmaCalculations";
import { KARMA_MANDALA_5L } from "../features/karmaSanjeevini/karmaMandalaLocale";

describe("Divine Karma Sanjeevini & Gokarna Remedial Mandala Engine", () => {
  // Test Case 1: Devotee chart with Pisces Moon (Meena Rashi)
  // When Transit Saturn is in Aquarius (Kumbha), Pisces Moon is in Sade Sati 1st Phase (Rising / 12th House)
  const piscesMoonInput: KundliInput = {
    name: "ಪ್ರಮೋದ್ ಕೊಡಗಿ",
    birthDate: "1988-11-24",
    birthTime: "07:30",
    latitude: 14.5479,
    longitude: 74.3188
  };

  const chart = calculateKundli(piscesMoonInput, { ayanamsaModel: "lahiri" });

  it("calculates deterministic Parashari synthesis with all 5 cosmic pillars", () => {
    const fixedDate = new Date("2024-06-15T12:00:00Z");
    const synthesis = calculateKarmaMandalaSynthesis(chart, {
      evalDate: fixedDate,
      devoteeName: "ಪ್ರಮೋದ್ ಕೊಡಗಿ",
      isUnlocked: true
    });

    expect(synthesis).toBeDefined();
    expect(synthesis.devoteeName).toBe("ಪ್ರಮೋದ್ ಕೊಡಗಿ");
    expect(synthesis.nodes).toHaveLength(5);

    const pillarIds = synthesis.nodes.map((n) => n.id);
    expect(pillarIds).toContain("sade_sati");
    expect(pillarIds).toContain("rahu_ketu");
    expect(pillarIds).toContain("kuja_manglik");
    expect(pillarIds).toContain("guru_chandal_dhana");
    expect(pillarIds).toContain("ayur_bala");

    // Friction score must be between 0 and 100
    expect(synthesis.overallFrictionScore).toBeGreaterThanOrEqual(0);
    expect(synthesis.overallFrictionScore).toBeLessThanOrEqual(100);

    // Harmony score must be between 0 and 100
    expect(synthesis.overallHarmonyScore).toBeGreaterThanOrEqual(0);
    expect(synthesis.overallHarmonyScore).toBeLessThanOrEqual(100);
  });

  it("identifies highest crisis node and provides valid classical authority", () => {
    const fixedDate = new Date("2024-06-15T12:00:00Z");
    const synthesis = calculateKarmaMandalaSynthesis(chart, { evalDate: fixedDate });

    const highest = synthesis.highestCrisisNode;
    expect(highest).toBeDefined();
    expect(highest.frictionScore).toBeGreaterThanOrEqual(15);
    expect(highest.classicalAuthority.kn).toBeDefined();
    expect(highest.classicalAuthority.kn.length).toBeGreaterThan(5);

    // Immediate action must be clearly specified
    expect(highest.immediateAction.kn).toBeDefined();
    expect(highest.immediateAction.kn.length).toBeGreaterThan(10);
  });

  it("strictly maps every pillar to authentic Sri Kshetra Gokarna Sevas with Priest Shreeram Pandit", () => {
    const synthesis = calculateKarmaMandalaSynthesis(chart);

    for (const node of synthesis.nodes) {
      const seva = node.gokarnaSeva;
      expect(seva).toBeDefined();
      expect(seva.priestName).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(seva.priestPhone).toBe("9972339362");
      expect(seva.costInRupees).toBeGreaterThan(500);
      expect(seva.costInCoins).toBeGreaterThan(500);
      expect(seva.benefits.kn.length).toBeGreaterThanOrEqual(3);
      expect(seva.prasadaDetails.kn).toBeDefined();
    }
  });

  it("provides authentic Sanskrit and Kannada Bīja Mantras with count 108", () => {
    const synthesis = calculateKarmaMandalaSynthesis(chart);

    for (const node of synthesis.nodes) {
      const mantra = node.bijaMantra;
      expect(mantra.count).toBe(108);
      expect(mantra.sanskrit).toContain("ॐ");
      expect(mantra.kannada).toContain("ಓಂ");
      expect(mantra.meaning.kn.length).toBeGreaterThan(15);
      expect(mantra.transliteration.en).toBeDefined();
    }
  });

  it("dynamically computes 4 upcoming astronomical Gokarna muhurthas with positive time remaining", () => {
    const fixedDate = new Date("2024-06-15T12:00:00Z");
    const muhurthas = calculateUpcomingGokarnaMuhurthas(fixedDate, 0, "lahiri");

    expect(muhurthas.length).toBeGreaterThanOrEqual(3);

    for (const m of muhurthas) {
      expect(m.id).toBeDefined();
      expect(m.title.kn).toBeDefined();
      expect(m.tithiVara.kn).toBeDefined();
      expect(m.urgencyHoursRemaining).toBeGreaterThan(0);
      expect(m.remedialPowerMultiplier.kn).toBeDefined();
      expect(m.guideline.kn.length).toBeGreaterThan(10);
    }
  });

  it("verifies pure 5-language localization without undefined fields", () => {
    const languages = ["kn", "hi", "te", "ta", "en"] as const;

    for (const lang of languages) {
      expect(KARMA_MANDALA_5L.header.pageTitle[lang]).toBeDefined();
      expect(KARMA_MANDALA_5L.header.pageSubtitle[lang]).toBeDefined();
      expect(KARMA_MANDALA_5L.radar.toggleLiveFriction[lang]).toBeDefined();
      expect(KARMA_MANDALA_5L.radar.togglePostRelief[lang]).toBeDefined();
      expect(KARMA_MANDALA_5L.japa.title[lang]).toBeDefined();
      expect(KARMA_MANDALA_5L.wallet.unlockButton[lang]).toBeDefined();
      expect(KARMA_MANDALA_5L.sevaBooking.priestContactLine[lang]).toContain("9972339362");
    }
  });
});
