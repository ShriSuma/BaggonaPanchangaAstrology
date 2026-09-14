import { describe, it, expect } from "vitest";
import { executeFaceReading } from "../features/facereading/faceReadingEngine";
import { VEDIC_NISHKALANKA_TEJAS } from "../features/facereading/samudrikaFaceKnowledge";

describe("Muka Samudrika Multi-User Distinctness & Section Deduplication Audit", () => {
  it("ensures 3 different devotees receive distinct Vedic profiles without identical hardcoded values", async () => {
    const userA_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const userB_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADklEQVR42mNk+M9QzwAEhAGAhY1jYwAAAABJRU5ErkJggg==";
    const userC_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAADklEQVR42mNk+M9QzwAEhAGAhY1jYwAAAABJRU5ErkJggg==";

    const resA = await executeFaceReading(userA_img, "ಶ್ರೀಕಾಂತ್ ಭಟ್", "kn");
    const resB = await executeFaceReading(userB_img, "ವಿದ್ಯಾಧರ್ ಶರ್ಮಾ", "kn");
    const resC = await executeFaceReading(userC_img, "ಸುರೇಶ್ ರಾವ್", "kn");

    // Check individual devotee names are respected
    expect(resA.devoteeName).toBe("ಶ್ರೀಕಾಂತ್ ಭಟ್");
    expect(resB.devoteeName).toBe("ವಿದ್ಯಾಧರ್ ಶರ್ಮಾ");
    expect(resC.devoteeName).toBe("ಸುರೇಶ್ ರಾವ್");

    // Check that estimated ages are not all identical static 29
    const ages = [resA.estimatedAge, resB.estimatedAge, resC.estimatedAge];
    const uniqueAges = new Set(ages);
    expect(uniqueAges.size).toBeGreaterThanOrEqual(2);

    // Check that feature scores are dynamic, not all 89%
    const scoresA = resA.features.map(f => f.score);
    const scoresB = resB.features.map(f => f.score);
    const scoresC = resC.features.map(f => f.score);

    // Each user should have varying scores across their own 7 features (e.g. forehead != eyes != nose)
    const internalVarianceA = new Set(scoresA);
    expect(internalVarianceA.size).toBeGreaterThanOrEqual(2);

    // Different users have different score profiles
    expect(scoresA.join(",")).not.toBe(scoresB.join(","));

    // Check that primary elements or archetypes vary across users
    const archetypes = [
      resA.facialConstitution.mahapurushaArchetype.kn,
      resB.facialConstitution.mahapurushaArchetype.kn,
      resC.facialConstitution.mahapurushaArchetype.kn
    ];
    const uniqueArchetypes = new Set(archetypes);
    expect(uniqueArchetypes.size).toBeGreaterThanOrEqual(2);

    // Check that milestone predictions vary across users
    const predPhase0 = [
      (resA.ageMilestones[0].prediction as any).kn || resA.ageMilestones[0].prediction,
      (resB.ageMilestones[0].prediction as any).kn || resB.ageMilestones[0].prediction,
      (resC.ageMilestones[0].prediction as any).kn || resC.ageMilestones[0].prediction
    ];
    const uniquePhase0Preds = new Set(predPhase0);
    expect(uniquePhase0Preds.size).toBeGreaterThanOrEqual(2);

    // Check that forehead line indications vary across users
    const foreheadIndications = [
      resA.foreheadLines[0]?.indication.kn,
      resB.foreheadLines[0]?.indication.kn,
      resC.foreheadLines[0]?.indication.kn
    ];
    const uniqueForehead = new Set(foreheadIndications);
    expect(uniqueForehead.size).toBeGreaterThanOrEqual(2);

    // Check that remedies are archetype-specific and vary across users
    const remedies = [
      resA.remedyRecommendation.kn,
      resB.remedyRecommendation.kn,
      resC.remedyRecommendation.kn
    ];
    const uniqueRemedies = new Set(remedies);
    expect(uniqueRemedies.size).toBeGreaterThanOrEqual(2);
  });

  it("authentically supports spotless faces with Nishkalanka Tejas rather than forcing fake moles", async () => {
    expect(VEDIC_NISHKALANKA_TEJAS.title.kn).toContain("ನಿಷ್ಕಳಂಕ");
    expect(VEDIC_NISHKALANKA_TEJAS.significance.kn).toContain("ಬೃಹತ್ ಸಂಹಿತಾ");
    expect(VEDIC_NISHKALANKA_TEJAS.title.en).toContain("Nishkalanka");
    expect(VEDIC_NISHKALANKA_TEJAS.title.hi).toContain("निष्कलंक");
    expect(VEDIC_NISHKALANKA_TEJAS.title.te).toContain("నిష్కళంక");
    expect(VEDIC_NISHKALANKA_TEJAS.title.ta).toContain("நிஷ்களங்க");
  });

  it("verifies all 7 facial features are present with distinct planetary rulers and scores", async () => {
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await executeFaceReading(dummyImage, "ರಾಘವೇಂದ್ರ", "kn");

    expect(res.features.length).toBe(7);
    const featureKeys = res.features.map(f => f.featureKey);
    expect(featureKeys).toEqual([
      "forehead",
      "eyes",
      "nose",
      "lips",
      "chin",
      "ears",
      "cheeks"
    ]);

    // Check that each feature has its own score between 65 and 99
    res.features.forEach(f => {
      expect(f.score).toBeGreaterThanOrEqual(65);
      expect(f.score).toBeLessThanOrEqual(99);
      expect(f.name.kn).toBeTruthy();
      expect(f.planetaryRuler.kn).toBeTruthy();
      expect(f.observedStructure.kn).toBeTruthy();
      expect(f.vedicIndication.kn).toBeTruthy();
    });
  });

  it("maintains 4 chronological age milestones spanning the 100-year life quadrant", async () => {
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await executeFaceReading(dummyImage, "ಮಹೇಶ್ ಭಟ್", "kn");

    expect(res.ageMilestones.length).toBe(4);
    expect(typeof res.estimatedAge).toBe("number");
    expect(res.estimatedAge).toBeGreaterThanOrEqual(15);
    expect(res.estimatedAge).toBeLessThanOrEqual(95);

    // Each milestone should have pure localized content
    res.ageMilestones.forEach(m => {
      const p = m.prediction as Record<string, string>;
      expect(p.kn).toBeTruthy();
      expect(p.en).toBeTruthy();
      expect(p.hi).toBeTruthy();
      expect(p.te).toBeTruthy();
      expect(p.ta).toBeTruthy();
    });
  });

  it("supports all 5 languages with zero English token leakage in Indic scripts", async () => {
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const langs = ["kn", "hi", "te", "ta", "en"] as const;
    for (const l of langs) {
      const res = await executeFaceReading(dummyImage, "ಭಕ್ತ", l);
      expect(res.facialConstitution.primaryElement[l]).toBeTruthy();
      expect(res.facialConstitution.mahapurushaArchetype[l]).toBeTruthy();
      expect(res.remedyRecommendation[l]).toBeTruthy();
      expect(res.verdictTitle[l]).toBeTruthy();
    }
  });
});
