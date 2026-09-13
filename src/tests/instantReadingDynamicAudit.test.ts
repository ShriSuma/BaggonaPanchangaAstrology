import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis, generateVedicConsultationAnswer } from "../core/PanchangaAngaSynthesisEngine";

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

    // Pramod has Saturn in the 8th house casting 7th direct aspect onto 2nd house (Simha)
    // Classical Parashara rule: Saturn aspecting 2nd house of oral intake triggers daily alcohol/substance habit
    const trait3 = goodBad.badTraits.find((t) => t.id === 3);
    expect(trait3?.titleKn).toContain("ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ");
    expect(trait3?.bulletKn).toContain("ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ (Daily Drinking)");

    // Pramod has Rahu in 5th and 5th lord Mars debilitated in Lagna -> triggers dynamic speculation loss trait
    const trait4 = goodBad.badTraits.find((t) => t.id === 4);
    expect(trait4?.titleKn).toMatch(/ಷೇರು ಮಾರುಕಟ್ಟೆ|ನ್ಯಾಯನಿಷ್ಠ ಸಂಪಾದನೆ/);
    expect(trait4?.titleKn).not.toContain("ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್)");

    // 7. Instant Q&A list audit (all questions must have dynamic timelines matching Dasha remaining months and start with direct verdict)
    const qas = synthesis.instantQAList;
    expect(qas.length).toBeGreaterThanOrEqual(9);

    for (const qa of qas) {
      expect(qa.panditScriptKn).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ:");
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

  it("verifies Child Kundali (<14 years) generates age-appropriate behavioral traits (crying, tantrums, fighting) with zero adult vices", () => {
    const childContext = {
      birthDate: "2021-08-20", // ~5 years old child
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Aarav",
      gender: "Male"
    };

    const childKundli = calculateKundli({
      name: childContext.devoteeName,
      birthDate: childContext.birthDate,
      birthTime: childContext.birthTime,
      latitude: childContext.latitude,
      longitude: childContext.longitude
    });

    const childSynthesis = generatePanchangaAngaSynthesis(childKundli, childContext);
    const badTraits = childSynthesis.goodBadAnalysis.badTraits;

    // Must have exactly 7 child-tailored bad traits
    expect(badTraits.length).toBe(7);

    // Trait 1: Crying and day-long screams
    expect(badTraits[0].titleKn).toContain("ಕಿರಿಕಿರಿ & ಅಳು");
    expect(badTraits[0].bulletKn).toContain("ಪಿತ್ತಾಧಿಕ್ಯ");

    // Trait 2: Evil eye / divine shield dynamic
    expect(badTraits[1].titleKn).toMatch(/ದೃಷ್ಟಿ ಬಾಧೆ|ದೃಷ್ಟಿ ದೋಷ/);

    // Trait 3: Aggressive fighting or gentle play dynamic
    expect(badTraits[2].titleKn).toMatch(/ಜಗಳಗಂಟ ಪ್ರವೃತ್ತಿ|ಹೊಡೆದಾಟ|ಸೌಮ್ಯ ಸಹಯೋಗ/);

    // Trait 4: Refusing food or healthy appetite dynamic
    expect(badTraits[3].titleKn).toMatch(/ಆಹಾರ ನಕಾರ|ಊಟದ ನಿರಾಕರಣೆ|ಆಹಾರ ತೃಪ್ತಿ/);

    // Trait 7: Gokarna Balarishta Shanti
    expect(badTraits[6].titleKn).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಕವಚ");

    // ZERO adult vice leakage (no adult alcohol addiction, affairs, or smuggling)
    const allTextKn = JSON.stringify(badTraits);
    expect(allTextKn).not.toContain("ಮದ್ಯಪಾನ");
    expect(allTextKn).not.toContain("ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ");
    expect(allTextKn).not.toContain("ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್)");
  });

  it("verifies generateVedicConsultationAnswer provides authoritative answers for child behavior, drinking, affairs, and smuggling", () => {
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

    // 1. Child crying question
    const childAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಮಗು ಬೆಳಿಗ್ಗೆಯಿಂದ ಸಂಜೆವರೆಗೆ ಅಳುವುದು ಮತ್ತು ಕಿರಿಕಿರಿ ಏಕೆ ಮಾಡುತ್ತದೆ?",
      "Pramod",
      true,
      4, // 4 years old child
      "Male"
    );
    expect(childAns).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ:");
    expect(childAns).toContain("ಮಗುವಿನ ಜಾತಕವನ್ನು");
    expect(childAns).toContain("ಬಾಲಗ್ರಹ");
    expect(childAns).toContain("ಪಿತ್ತ ಶೂಲೆ");
    expect(childAns).toContain("ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ");
    expect(childAns).not.toMatch(/[೦೧೨೩೪೫೬೭೮೯]/);

    // 2. Adult drinking addiction question
    const drinkAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಮದ್ಯಪಾನ ಮತ್ತು ದುಶ್ಚಟಗಳ ನೈಜ ಸ್ಥಿತಿ ಹಾಗೂ ಬಿಡುವ ಪರಿಹಾರವೇನು?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(drinkAns).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಹೌದು!");
    expect(drinkAns).toContain("ಮದ್ಯಪಾನ ಹಾಗೂ ವ್ಯಸನಗಳ");
    expect(drinkAns).toContain("ನಿತ್ಯ ಮದ್ಯಪಾನ");
    expect(drinkAns).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ");

    // 3. Affairs / Sensual inquiry (Must have direct verdict 'ಇಲ್ಲ!' and ZERO contradiction)
    const affairAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ ಅಥವಾ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಅಪಾಯ ಜಾತಕದಲ್ಲಿದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(affairAns).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(affairAns).toContain("ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು");
    expect(affairAns).toContain("ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ");
    expect(affairAns).not.toContain("ಗುಪ್ತ ಸಂಬಂಧಗಳು ಸಾರ್ವಜನಿಕವಾಗಿ ಬಯಲಾಗಿ"); // Zero contradictory affair warning!

    // 4. Speculation / Stock trading loss inquiry
    const specAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಷೇರು ಮಾರುಕಟ್ಟೆ, ಇಂಟ್ರಾಡೇ ಅಥವಾ ಸ್ಪೆಕ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ನಷ್ಟವಾಗುವ ಅಪಾಯವಿದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(specAns).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ:");
    expect(specAns).toContain("ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ");

    // 5. Smuggling / unethical work inquiry
    const smuggleAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಅಕ್ರಮ ವ್ಯವಹಾರ, ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್) ಅಥವಾ ಅಡ್ಡದಾರಿ ಹಣದ ರಿಸ್ಕ್ ಇದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(smuggleAns).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ:");
    expect(smuggleAns).toContain("ಧನಾರ್ಜನೆ, ಅಕ್ರಮ ವ್ಯವಹಾರ ಹಾಗೂ ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್)");
    expect(smuggleAns).toContain("ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ");
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
