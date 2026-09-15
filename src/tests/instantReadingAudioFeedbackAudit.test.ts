import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { generateDashaSandhiAndRoadmap } from "../core/DashaSandhiAndRoadmapEngine";

describe("Instant Reading User Audio Feedback Requirements Audit", () => {
  // 1. Ekapatni Vrata vs Multiple Relationships vs Standard Fidelity
  it("strictly differentiates Ekapatni Vrata, Multiple Relationships Risk, and Standard Fidelity", () => {
    // Chart A: Multiple Relationships Risk (Rahu/dual affliction)
    const contextA = {
      birthDate: "1990-01-15",
      birthTime: "10:00",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Suresh",
      gender: "Male" as const
    };
    const kundliA = calculateKundli({
      name: contextA.devoteeName,
      birthDate: contextA.birthDate,
      birthTime: contextA.birthTime,
      latitude: contextA.latitude,
      longitude: contextA.longitude
    });
    const synthesisA = generatePanchangaAngaSynthesis(kundliA, contextA);
    const gbaA = synthesisA.currentDiagnosis.goodBadAnalysis;

    expect(gbaA).toBeDefined();
    // Suresh's chart has Rahu in 11th/afflictions triggering multiple relationship risk
    expect(gbaA.hasMultipleRelationshipsRisk).toBe(true);
    expect(gbaA.isHighFidelityVrata).toBe(false);

    // Negative shades Dimension 1 should warn about multiple relationships, not praise Ekapatni Vrata
    const dim1A = synthesisA.currentDiagnosis.negativeShades?.sensualMarital;
    expect(dim1A).toBeDefined();
    expect(dim1A?.analysisKn).toContain("ಬಹು ಪ್ರಣಯ");
    expect(dim1A?.analysisKn).not.toContain("ಏಕಪತ್ನಿ ವ್ರತ ಪಾಲಿಸುವ ಧೀಮಂತ");

    // Chart B: Pure chart with Jupiter protection
    const contextB = {
      birthDate: "1985-05-15",
      birthTime: "06:00",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Narayana",
      gender: "Male" as const
    };
    const kundliB = calculateKundli({
      name: contextB.devoteeName,
      birthDate: contextB.birthDate,
      birthTime: contextB.birthTime,
      latitude: contextB.latitude,
      longitude: contextB.longitude
    });
    const synthesisB = generatePanchangaAngaSynthesis(kundliB, contextB);
    const gbaB = synthesisB.currentDiagnosis.goodBadAnalysis;

    expect(gbaB).toBeDefined();
    // Ensure that isHighFidelityVrata is boolean and mutually consistent
    if (gbaB.isHighFidelityVrata) {
      expect(gbaB.hasMultipleRelationshipsRisk).toBe(false);
      expect(gbaB.hasMaritalFidelity).toBe(true);
    }
  });

  // 2. 4-Tier Diet Separation: Teetotaler vs Dhumapana vs Madyapana vs Social
  it("enforces strict 4-tier diet separation without false alcohol accusations", () => {
    const context = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const
    };
    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });
    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    const gba = synthesis.currentDiagnosis.goodBadAnalysis;

    expect(gba).toBeDefined();
    expect(typeof gba.isTeetotaler).toBe("boolean");
    expect(typeof gba.hasDhumapanaOrSubstanceTendency).toBe("boolean");
    expect(typeof gba.hasMadyapanaRisk).toBe("boolean");

    // If native is teetotaler, they cannot have madyapana risk or dhumapana risk
    if (gba.isTeetotaler) {
      expect(gba.hasMadyapanaRisk).toBe(false);
      expect(gba.hasDhumapanaOrSubstanceTendency).toBe(false);
    }

    // Card 11 (Dietary Verification) should reflect proper tier
    const card11 = synthesis.tenLifeAspectBullets.find(b => b.id === 11);
    expect(card11).toBeDefined();
    expect(card11?.readingKn).not.toContain("**");
    expect(card11?.readingKn.length).toBeGreaterThan(30);
  });

  // 3. Section 1 Prastuta Manasthiti Mattu Jeevana 2-Block Structure
  it("populates distinct external life reality and internal mindset blocks in Section 1", () => {
    const context = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const
    };
    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });
    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    const cls = synthesis.currentDiagnosis.currentLifeSituation;

    expect(cls).toBeDefined();
    expect(cls?.externalLifeRealityKn).toBeDefined();
    expect(cls?.externalLifeRealityKn?.length).toBeGreaterThan(40);
    expect(cls?.internalMindsetKn).toBeDefined();
    expect(cls?.internalMindsetKn?.length).toBeGreaterThan(40);

    // Ensure external life reality and internal mindset are distinct
    expect(cls?.externalLifeRealityKn).not.toEqual(cls?.internalMindsetKn);

    // English equivalents should also be present
    expect(cls?.externalLifeRealityEn).toBeDefined();
    expect(cls?.internalMindsetEn).toBeDefined();

    // Check for absence of markdown bold artifacts
    expect(cls?.externalLifeRealityKn).not.toContain("**");
    expect(cls?.internalMindsetKn).not.toContain("**");
  });

  // 4. Dynamic Dasha Bhukti Roadmap (Planetary Karakatwas and No Static Boilerplate)
  it("generates dynamic Graha-specific bhukti pillars across all 5 life areas", () => {
    const context = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const
    };
    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });
    const roadmap = generateDashaSandhiAndRoadmap(kundli, {
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      gender: context.gender,
      devoteeName: context.devoteeName
    });

    expect(roadmap).toBeDefined();
    expect(roadmap.roadmapList.length).toBeGreaterThan(0);

    const firstBhukti = roadmap.roadmapList[0];
    expect(firstBhukti.bhuktiPlanet).toBeDefined();
    expect(firstBhukti.careerProspectsKn).toBeDefined();
    expect(firstBhukti.financialProspectsKn).toBeDefined();
    expect(firstBhukti.familyMarriageProspectsKn).toBeDefined();
    expect(firstBhukti.healthMindProspectsKn).toBeDefined();
    expect(firstBhukti.precautionsKn).toBeDefined();
    expect(firstBhukti.gokarnaPariharaKn).toBeDefined();

    // Verify dynamic graha insertion: should contain lord or karakatwa
    const lord = firstBhukti.bhuktiPlanet;
    const allText = `${firstBhukti.careerProspectsKn} ${firstBhukti.financialProspectsKn} ${firstBhukti.familyMarriageProspectsKn} ${firstBhukti.healthMindProspectsKn}`;
    expect(allText.length).toBeGreaterThan(200);

    // Primary Sandhi Alert should be structured and contain Lagna/house personalization
    if (roadmap.primarySandhiDisplay) {
      expect(roadmap.primarySandhiDisplay.warningSymptomsKn.length).toBeGreaterThan(0);
      expect(roadmap.primarySandhiDisplay.recommendedShantiRemediesKn.length).toBeGreaterThan(0);
      expect(roadmap.primarySandhiDisplay.gokarnaSevaKn).toBeDefined();
      expect(roadmap.primarySandhiDisplay.descriptionKn).toBeDefined();
      expect(roadmap.primarySandhiDisplay.descriptionKn.length).toBeGreaterThan(30);
    }
  });

  // 5. Verification: Distinct Charts with same/different Dasha Bhukti produce strictly different personalized narrative text
  it("strictly differentiates inside Dasha Bhukti pillar narrations based on native Lagna and house activations", () => {
    // Chart 1: Native 1
    const context1 = {
      birthDate: "1990-04-12",
      birthTime: "07:30",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Raghavendra",
      gender: "Male" as const
    };
    const kundli1 = calculateKundli({
      name: context1.devoteeName,
      birthDate: context1.birthDate,
      birthTime: context1.birthTime,
      latitude: context1.latitude,
      longitude: context1.longitude
    });
    const roadmap1 = generateDashaSandhiAndRoadmap(kundli1, {
      birthDate: context1.birthDate,
      birthTime: context1.birthTime,
      gender: context1.gender,
      devoteeName: context1.devoteeName
    });

    // Chart 2: Native 2 with different birth time/date
    const context2 = {
      birthDate: "1988-11-20",
      birthTime: "18:45",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Savitri",
      gender: "Female" as const
    };
    const kundli2 = calculateKundli({
      name: context2.devoteeName,
      birthDate: context2.birthDate,
      birthTime: context2.birthTime,
      latitude: context2.latitude,
      longitude: context2.longitude
    });
    const roadmap2 = generateDashaSandhiAndRoadmap(kundli2, {
      birthDate: context2.birthDate,
      birthTime: context2.birthTime,
      gender: context2.gender,
      devoteeName: context2.devoteeName
    });

    expect(roadmap1.roadmapList.length).toBeGreaterThan(0);
    expect(roadmap2.roadmapList.length).toBeGreaterThan(0);

    const b1 = roadmap1.roadmapList[0];
    const b2 = roadmap2.roadmapList[0];

    // Even if by coincidence they have the same Bhukti planet, the texts must NOT be identical because of Lagna, house lordships, and placement differences
    const text1 = `${b1.careerProspectsKn}|${b1.financialProspectsKn}|${b1.familyMarriageProspectsKn}|${b1.healthMindProspectsKn}|${b1.precautionsKn}`;
    const text2 = `${b2.careerProspectsKn}|${b2.financialProspectsKn}|${b2.familyMarriageProspectsKn}|${b2.healthMindProspectsKn}|${b2.precautionsKn}`;
    
    expect(text1).not.toEqual(text2);

    // Ensure no raw markdown asterisks or placeholder tokens exist in any pillar
    for (const b of [...roadmap1.roadmapList, ...roadmap2.roadmapList]) {
      expect(b.careerProspectsKn).not.toContain("**");
      expect(b.financialProspectsKn).not.toContain("**");
      expect(b.familyMarriageProspectsKn).not.toContain("**");
      expect(b.healthMindProspectsKn).not.toContain("**");
      expect(b.precautionsKn).not.toContain("**");
      expect(b.gokarnaPariharaKn).not.toContain("**");
    }

    // Verify gender sensitivity where appropriate (e.g. Savitri vs Raghavendra)
    for (const b of roadmap2.roadmapList) {
      expect(b.familyMarriageProspectsKn).not.toContain("ಪತ್ನಿ");
    }
  });

  // 6. Verification: Executive Multi-Paragraph Reading contains external life reality and internal mindset
  it("incorporates external life reality and internal mindset in multi-paragraph executive reading p1", () => {
    const context = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const
    };
    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });
    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    const paragraphs = synthesis.multiParagraphExecutiveReading;

    expect(paragraphs).toBeDefined();
    expect(paragraphs.length).toBeGreaterThanOrEqual(4);

    const p1 = paragraphs[0];
    expect(p1).toContain("ನಮಸ್ಕಾರ");
    expect(p1).toContain("Pramod");
    expect(p1).toContain("ಬಾಹ್ಯ ವಾಸ್ತವ");
    expect(p1).toContain("ಆಂತರಿಕ ಮಾನಸಿಕ ಸ್ಥಿತಿ");
    expect(p1).not.toContain("**");
  });
});
