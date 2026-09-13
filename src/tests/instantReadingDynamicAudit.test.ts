import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";

describe("Instant Reading 100% Dynamic & Zero-Hardcoded Audit", () => {
  it("verifies 100% dynamic calculations, personalized Dasha timelines, and zero hardcoded dates", () => {
    const context = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male"
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);

    // 1. Dasha timing must be dynamically calculated
    const dashaTiming = synthesis.currentDiagnosis.dashaTiming;
    expect(dashaTiming).toBeDefined();
    expect(dashaTiming?.remainingMonths).toBeGreaterThan(0);
    expect(dashaTiming?.timelineKn).toMatch(/^ಮುಂದಿನ \d+ ತಿಂಗಳುಗಳಲ್ಲಿ$/);
    expect(dashaTiming?.badgeTimelineKn).toMatch(/^ಮುಂದಿನ \d+ ತಿಂಗಳುಗಳು$/);

    // 2. Multi-paragraph executive reading Paragraph 3 must use the dynamic timeline
    const p3 = synthesis.multiParagraphExecutiveReading[2];
    expect(p3).not.toContain("3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");
    expect(p3).toContain(dashaTiming!.timelineKn);

    // 3. Live Gochara must be computed dynamically
    const liveGochara = synthesis.currentDiagnosis.liveGochara;
    expect(liveGochara).toBeDefined();
    expect(liveGochara?.summaryKn).toContain("ಗೋಚಾರ");
    expect(liveGochara?.guruHouseFromMoon).toBeGreaterThanOrEqual(1);
    expect(liveGochara?.guruHouseFromMoon).toBeLessThanOrEqual(12);
    expect(liveGochara?.shaniHouseFromMoon).toBeGreaterThanOrEqual(1);
    expect(liveGochara?.shaniHouseFromMoon).toBeLessThanOrEqual(12);

    // 4. Astrologer talking points must be dynamic
    const talkingPoints = synthesis.currentDiagnosis.astrologerTalkingPoints;
    expect(talkingPoints.immediateTurningPointKn).toContain(dashaTiming!.timelineKn);
    expect(talkingPoints.immediateTurningPointKn).not.toContain("3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");
    expect(talkingPoints.immediateTurningPointEn).toContain(`Next ${dashaTiming!.remainingMonths} Month`);
    expect(talkingPoints.immediateTurningPointEn).not.toContain("Next 3 to 6 Months");

    // 5. 11 Master Life & Personality Revelations audit
    const bullets = synthesis.tenLifeAspectBullets;
    expect(bullets.length).toBeGreaterThanOrEqual(10);

    // Card 8: Dynamic Tatva Constitution (Karka Lagna is Jala Tatva / Water)
    const card8 = bullets.find((b) => b.id === 8);
    expect(card8).toBeDefined();
    expect(card8?.badgeKn).toContain("ಕರ್ಕಾಟಕ ಲಗ್ನ • ಜಲ ತತ್ವ");
    expect(card8?.readingKn).toContain("ಜಲ-ಕಫ");
    expect(card8?.readingKn).not.toContain("ಪಿತ್ತ-ವಾತ ತತ್ವಗಳ"); // Not hardcoded Pitta-Vata!

    // Card 9: Dynamic Gochara Card
    const card9 = bullets.find((b) => b.id === 9);
    expect(card9).toBeDefined();
    expect(card9?.badgeKn).toContain("ದಶಾ");
    expect(card9?.readingKn).toContain(liveGochara!.summaryKn);
    expect(card9?.readingKn).not.toContain("3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");

    // Card 10: Dynamic Turning Point Card
    const card10 = bullets.find((b) => b.id === 10);
    expect(card10).toBeDefined();
    expect(card10?.badgeKn).toContain(dashaTiming!.badgeTimelineKn);
    expect(card10?.readingKn).toContain(dashaTiming!.timelineKn);
    expect(card10?.readingKn).not.toContain("3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");

    // 6. Good & Bad Traits audit
    const goodBad = synthesis.goodBadAnalysis;
    expect(goodBad.goodTraits.length).toBe(5);
    expect(goodBad.badTraits.length).toBe(7);

    // Pramod has no addiction or smuggling afflictions - check constructive, non-offensive titles
    const trait3 = goodBad.badTraits.find((t) => t.id === 3);
    expect(trait3?.titleKn).toContain("ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿ");
    expect(trait3?.titleKn).not.toContain("ಮದ್ಯಪಾನ/ಧೂಮಪಾನ/ವ್ಯಸನಗಳ ಜಾಲ");

    const trait4 = goodBad.badTraits.find((t) => t.id === 4);
    expect(trait4?.titleKn).toContain("ನ್ಯಾಯನಿಷ್ಠ ಸಂಪಾದನೆ");
    expect(trait4?.titleKn).not.toContain("ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್)");

    // 7. Instant Q&A list audit (all 9 questions must have dynamic timelines matching Dasha remaining months)
    const qas = synthesis.instantQAList;
    expect(qas.length).toBe(9);

    for (const qa of qas) {
      expect(qa.panditScriptKn).not.toContain("3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).not.toContain("4 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).not.toContain("2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).not.toContain("4 ರಿಂದ 7 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).not.toContain("6 ರಿಂದ 9 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).not.toContain("2 ರಿಂದ 3 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).not.toContain("1 ರಿಂದ 2 ತಿಂಗಳುಗಳಲ್ಲಿ");
      expect(qa.panditScriptKn).toMatch(/ಮುಂದಿನ \d+ ತಿಂಗಳುಗಳಲ್ಲಿ|ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ/);
    }

    // 8. Yajna Hawana Plan audit
    const yajna = synthesis.yajnaHawanaPlan;
    expect(yajna.overallAstrologicalPrescriptionSummaryKn).not.toContain("3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");
    if (dashaTiming?.timelineKn) {
      expect(yajna.overallAstrologicalPrescriptionSummaryKn).toContain(dashaTiming.timelineKn);
    }
    for (const homa of yajna.devaHomas) {
      expect(homa.priestSecretNoteKn).not.toContain("3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ");
    }
    const navagrahaHoma = yajna.devaHomas.find(h => h.id === "deva_navagraha");
    if (navagrahaHoma && dashaTiming?.timelineKn) {
      expect(navagrahaHoma.priestSecretNoteKn).toContain(dashaTiming.timelineKn);
    }

    // 9. Zero Kannada numerals audit across entire output
    const jsonString = JSON.stringify(synthesis);
    expect(jsonString).not.toMatch(/[೦೧೨೩೪೫೬೭೮೯]/);
  });

  it("verifies different birth charts get distinctly different, dynamic calculations", () => {
    // Mesha Lagna, Simha Rashi profile
    const contextMesha = {
      birthDate: "1985-04-14",
      birthTime: "06:00",
      latitude: 13.0827,
      longitude: 80.2707,
      devoteeName: "Suresh",
      gender: "Male"
    };

    const kundliMesha = calculateKundli({
      name: contextMesha.devoteeName,
      birthDate: contextMesha.birthDate,
      birthTime: contextMesha.birthTime,
      latitude: contextMesha.latitude,
      longitude: contextMesha.longitude
    });

    const synthesisMesha = generatePanchangaAngaSynthesis(kundliMesha, contextMesha);

    // Card 8 should reflect Agni Tatva for Mesha Lagna
    const card8Mesha = synthesisMesha.tenLifeAspectBullets.find((b) => b.id === 8);
    expect(card8Mesha?.badgeKn).toContain("ಮೇಷ ಲಗ್ನ • ಅಗ್ನಿ ತತ್ವ");
    expect(card8Mesha?.readingKn).toContain("ಪಿತ್ತ ಪ್ರಧಾನ");

    // Dynamic timeline should reflect Suresh's running Dasha, not Pramod's
    expect(synthesisMesha.currentDiagnosis.dashaTiming).toBeDefined();
    expect(synthesisMesha.currentDiagnosis.dashaTiming?.timelineKn).toMatch(/^ಮುಂದಿನ \d+ ತಿಂಗಳುಗಳಲ್ಲಿ$/);
  });
});
