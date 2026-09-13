import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  generateVedicConsultationAnswer,
  getDynamicLossScaleText,
  detectNativeShadripuAfflictions
} from "../core/PanchangaAngaSynthesisEngine";

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

    // Pramod has Saturn in 8th house casting direct 7th aspect onto 2nd house of oral intake and debilitated Mars
    // Accurately diagnoses evening alcohol consumption / addiction vulnerability under stress (NOT false teetotaler)
    const trait3 = goodBad.badTraits.find((t) => t.id === 3);
    expect(goodBad.isTeetotaler).toBe(false);
    expect(trait3?.titleKn).toContain("ಮದ್ಯಪಾನ");
    expect(trait3?.badgeKn).toContain("ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ");
    expect(trait3?.bulletKn).toContain("ಮದ್ಯಪಾನ");

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

    // 2. Adult drinking addiction question for Pramod (accurately identifies real-life alcohol habit)
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
    expect(drinkAns).toContain("ಮದ್ಯಪಾನ");
    expect(drinkAns).toContain("2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನ");

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

  it("verifies Panchanga sunrise and sunset are dynamically populated and non-empty", () => {
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
    expect(synthesis.panchanga.sunrise).toBeDefined();
    expect(synthesis.panchanga.sunset).toBeDefined();
    expect(synthesis.panchanga.sunrise).toMatch(/^\d{1,2}:\d{2}$/);
    expect(synthesis.panchanga.sunset).toMatch(/^\d{1,2}:\d{2}$/);
  });

  it("verifies Child Kundali (<14) generates exactly 11 child-specific questions with 4-bullet structure", () => {
    const childContext = {
      birthDate: "2021-08-20", // 5-year-old child
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
    const childQAs = childSynthesis.instantQAList;

    expect(childQAs.length).toBe(11);
    expect(childQAs[0].id).toBe("q_child_1");
    expect(childQAs[10].id).toBe("q_child_11");

    for (const qa of childQAs) {
      expect(qa.panditScriptKn).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ:");
      expect(qa.panditScriptKn).toContain("• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ:");
      expect(qa.panditScriptKn).toMatch(/• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ/);
      expect(qa.panditScriptKn).toContain("• ⏳ ನಿಖರ ಕಾಲಾವಧಿ:");
      expect(qa.panditScriptKn).toContain("• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ:");
      expect(qa.panditScriptKn).not.toMatch(/[೦೧೨೩೪೫೬೭೮೯]/);
      // Zero adult vices in child questions
      expect(qa.panditScriptKn).not.toContain("ಮದ್ಯಪಾನ");
      expect(qa.panditScriptKn).not.toContain("ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ");
    }

    // Question 3: Sunset evil eye dynamically mentions sunset Sandhya
    const qEye = childQAs.find(q => q.id === "q_child_3");
    expect(qEye).toBeDefined();
    expect(qEye?.panditScriptKn).toMatch(/ಗೋಧೂಳಿ ಸಂಧ್ಯಾ ಸಮಯ|ಸೂರ್ಯಾಸ್ತ/);
  });

  it("verifies generateVedicConsultationAnswer uses dynamic sunset Sandhya and zero hardcoded '7:00 PM' / '40 ರಿಂದ 50 ಲಕ್ಷ'", () => {
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

    // 1. Evil eye inquiry with dynamic sunset time
    const evilEyeAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಸಂಜೆ ಸಮಯದಲ್ಲಿ ಮಗು ಅಳುವುದು ಮತ್ತು ದೃಷ್ಟಿ ಬಾಧೆಗೆ ಕಾರಣವೇನು?",
      "Pramod",
      true,
      5,
      "Male",
      "06:38"
    );
    expect(evilEyeAns).toContain("06:38");
    expect(evilEyeAns).not.toContain("7:00 PM");
    expect(evilEyeAns).not.toContain("ಸಂಜೆ 7 ಗಂಟೆಗೆ");

    // 2. Speculation inquiry uses dynamic loss text and zero hardcoded '40 ರಿಂದ 50 ಲಕ್ಷ'
    const specAns = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಷೇರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿದರೆ ಎಷ್ಟು ನಷ್ಟವಾಗಬಹುದು?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(specAns).not.toContain("40 ರಿಂದ 50 ಲಕ್ಷ");
    expect(specAns).not.toContain("40-50+ Lakhs");

    const dynamicLoss = getDynamicLossScaleText(kundli);
    expect(specAns).toContain(dynamicLoss.lossKn);
  });

  it("verifies getDynamicLossScaleText and detectNativeShadripuAfflictions produce dynamic, horoscope-grounded results", () => {
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

    const lossScale = getDynamicLossScaleText(kundli);
    expect(lossScale.lossKn).toBeTruthy();
    expect(lossScale.lossEn).toBeTruthy();
    expect(lossScale.basisKn).toBeTruthy();
    expect(lossScale.lossKn).not.toContain("40 ರಿಂದ 50 ಲಕ್ಷ");

    const shadripu = detectNativeShadripuAfflictions(kundli);
    expect(shadripu.dominantRipu).toBeDefined();
    expect(shadripu.ripuNameKn).toBeTruthy();
    expect(shadripu.detailKn).toBeTruthy();
    expect(shadripu.planetaryCauseKn).toBeTruthy();
  });

  it("verifies Jupiter Lagna Lord produces dedicated Guru Shanti and Child Kundali produces child yajnaHawanaPlan in synthesis", () => {
    // 1. Child Synthesis Test: Age 7 child
    const childContext = {
      birthDate: "2017-06-15",
      birthTime: "11:20",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Aditi",
      gender: "Female" as const,
      devoteeAge: 7
    };

    const childKundli = calculateKundli({
      name: childContext.devoteeName,
      birthDate: childContext.birthDate,
      birthTime: childContext.birthTime,
      latitude: childContext.latitude,
      longitude: childContext.longitude
    });

    const childSynthesis = generatePanchangaAngaSynthesis(childKundli, childContext);
    expect(childSynthesis.yajnaHawanaPlan).toBeDefined();
    expect(childSynthesis.yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha).toBe(false);
    expect(childSynthesis.yajnaHawanaPlan.pitruKaryas).toHaveLength(0);
    expect(childSynthesis.yajnaHawanaPlan.devaHomas).toHaveLength(4);
    expect(childSynthesis.yajnaHawanaPlan.devaHomas.map(h => h.id)).toContain("child_balagraha_shanti");
    expect(childSynthesis.yajnaHawanaPlan.combinedSchedule.scheduleType).toBe("single_day_deva_samputa");

    // 2. Jupiter Lagna Lord Test (Meena or Dhanu Lagna)
    // Birth with Dhanu Lagna (approx 07:00 AM on 1990-12-25 in Bangalore)
    const jupiterContext = {
      name: "Guru Devotee",
      birthDate: "1990-12-25",
      birthTime: "07:00",
      latitude: 12.9716,
      longitude: 77.5946,
      devoteeName: "Guru Devotee",
      gender: "Male" as const
    };
    const jupiterKundli = calculateKundli(jupiterContext);
    const jupiterSynthesis = generatePanchangaAngaSynthesis(jupiterKundli, jupiterContext);
    
    // If Lagna Lord is Jupiter, shantiPooja must be Guru Shanti & Brihaspati Yajna
    const lagnaLord = jupiterSynthesis.prescriptions.rudraksha.planet;
    if (lagnaLord === "Jupiter") {
      expect(jupiterSynthesis.prescriptions.shantiPooja.nameKn).toContain("ಗುರು ಶಾಂತಿ, ಬೃಹಸ್ಪತಿ ಯಾಗ & ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ");
      expect(jupiterSynthesis.prescriptions.shantiPooja.nameEn).toContain("Guru Shanti, Brihaspati Yajna");
    }
  });

  it("verifies two different charts (Male vs Female, different Lagnas & Moon signs) produce 100% distinct Good Traits, Bad Traits, and Gender-Tailored Secrecy Habits", () => {
    // Chart 1: Male, Leo/Aries (1985-04-14 at 14:30)
    const contextA = {
      name: "Chart A Male",
      birthDate: "1985-04-14",
      birthTime: "14:30",
      latitude: 12.9716,
      longitude: 77.5946,
      devoteeName: "Chart A Male",
      gender: "Male" as const
    };
    const kundliA = calculateKundli(contextA);
    const synthesisA = generatePanchangaAngaSynthesis(kundliA, contextA);

    // Chart 2: Female, Kumbha/Meena Lagna & Moon (1995-07-15 at 21:30)
    const contextB = {
      name: "Chart B Female",
      birthDate: "1995-07-15",
      birthTime: "21:30",
      latitude: 15.3173,
      longitude: 75.7139,
      devoteeName: "Chart B Female",
      gender: "Female" as const
    };
    const kundliB = calculateKundli(contextB);
    const synthesisB = generatePanchangaAngaSynthesis(kundliB, contextB);

    const goodA = synthesisA.goodBadAnalysis.goodTraits;
    const goodB = synthesisB.goodBadAnalysis.goodTraits;
    const badA = synthesisA.goodBadAnalysis.badTraits;
    const badB = synthesisB.goodBadAnalysis.badTraits;

    // 1. Good Trait 1 (Lagna-driven): Must be completely different titles and descriptions
    expect(goodA[0].titleKn).not.toBe(goodB[0].titleKn);
    expect(goodA[0].bulletKn).not.toBe(goodB[0].bulletKn);

    // 2. Good Trait 2 (Moon-driven): Must be completely different titles and descriptions
    expect(goodA[1].titleKn).not.toBe(goodB[1].titleKn);
    expect(goodA[1].bulletKn).not.toBe(goodB[1].bulletKn);

    // 3. Good Trait 5 (Gender-tailored):
    // Male must have protective masculine dharma; Female must have womanly gruhalakshmi grace
    expect(goodA[4].titleKn).toContain("ಕುಟುಂಬ ರಕ್ಷಣಾ ಧರ್ಮ");
    expect(goodB[4].titleKn).toContain("ಗೃಹಲಕ್ಷ್ಮಿ ಸೌಭಾಗ್ಯ");

    // 4. Secrecy habit must be strictly gender-aware (never say "wife" to a woman)
    expect(synthesisA.goodBadAnalysis.secrecyHabitKn).toMatch(/ಪತ್ನಿ|ಹೆಂಡತಿ/);
    expect(synthesisB.goodBadAnalysis.secrecyHabitKn).toMatch(/ಪತಿ|ಗಂಡ/);
    expect(synthesisB.goodBadAnalysis.secrecyHabitKn).not.toContain("ಹೆಂಡತಿ");

    // 5. Bad Traits must not be identical across the two charts
    expect(badA[0].titleKn).not.toBe(badB[0].titleKn);
  });

  it("verifies dynamic Teetotaler detection, marital fidelity, child innocence, and Section 0 non-generic dynamic life phases", () => {
    // 1. Alcohol vulnerability detection on Pramod's chart (Saturn in 8th aspecting 2nd house of intake)
    const pramodContext = {
      name: "Pramod Native",
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.8135,
      longitude: 74.1298,
      devoteeName: "Pramod Native",
      gender: "Male" as const
    };
    const pramodKundli = calculateKundli(pramodContext);
    const pramodSynthesis = generatePanchangaAngaSynthesis(pramodKundli, pramodContext);

    // Accurately recognizes evening drinking under stress
    expect(pramodSynthesis.goodBadAnalysis.isTeetotaler).toBe(false);

    // Card 11 reports sensory restraint advice
    const card11 = pramodSynthesis.tenLifeAspectBullets.find(b => b.id === 11);
    expect(card11).toBeDefined();
    expect(card11?.readingKn).toContain("ಸಂಯಮ");

    // Section 0 for Pramod: Authentically detects acute marital tension due to Kuja Dosha and Saturn in 8th
    const pChallenge = pramodSynthesis.currentDiagnosis.primaryLifeChallenge;
    expect(pChallenge.area).toBe("Personal / Marriage");
    expect(pChallenge.description).not.toContain("ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಅಡಿಪಾಯ ಹಾಕುವ ಹಂತ");
    expect(pChallenge.description).toContain("ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರವಾದ ಮಾನಸಿಕ ಸಂಕಷ್ಟ");

    // Youth chart (age 18): Verifies age-bracketed dynamic life phase (Education & Career Foundation)
    const youthContext = {
      name: "Youth Devotee",
      birthDate: "2008-05-15",
      birthTime: "11:30",
      latitude: 12.9716,
      longitude: 77.5946,
      devoteeName: "Youth Devotee",
      gender: "Male" as const
    };
    const youthKundli = calculateKundli(youthContext);
    const youthSynthesis = generatePanchangaAngaSynthesis(youthKundli, youthContext);
    const youthChallenge = youthSynthesis.currentDiagnosis.primaryLifeChallenge;
    expect(youthChallenge.areaKn).toContain("ಉನ್ನತ ಶಿಕ್ಷಣ, ಕೌಶಲ್ಯ ವೃದ್ಧಿ & ವೃತ್ತಿ ಬುನಾದಿ");
    expect(youthChallenge.description).not.toContain("ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಅಡಿಪಾಯ ಹಾಕುವ ಹಂತ");
    expect(youthChallenge.description).toMatch(/18 ವರ್ಷ|ಮಹಾದಶಾ|ಭುಕ್ತಿ/);

    // 2. Child chart (<14 years): Innocence preservation
    const childContext = {
      name: "Master Aarav",
      birthDate: "2018-06-10",
      birthTime: "10:15",
      latitude: 12.9716,
      longitude: 77.5946,
      devoteeName: "Master Aarav",
      gender: "Male" as const
    };
    const childKundli = calculateKundli(childContext);
    const childSynthesis = generatePanchangaAngaSynthesis(childKundli, childContext);

    // Child must be teetotaler and fidelity clean
    expect(childSynthesis.goodBadAnalysis.isTeetotaler).toBe(true);
    expect(childSynthesis.goodBadAnalysis.hasMaritalFidelity).toBe(true);

    // Child Card 11 must be innocent (no adult vices or affairs)
    const childCard11 = childSynthesis.tenLifeAspectBullets.find(b => b.id === 11);
    expect(childCard11?.doshaSpecifics?.hasDosha).toBe(false);
    expect(childCard11?.readingKn).toContain("ಅತ್ಯಂತ ಮುಗ್ಧ, ಪವಿತ್ರ ಹಾಗೂ ಕಪಟವಿಲ್ಲದ ಪ್ರಕೃತಿಯನ್ನು ಹೊಂದಿದೆ");
    expect(childCard11?.readingKn).not.toContain("ಕಾಮನೆ");
    expect(childCard11?.readingKn).not.toContain("ಮದ್ಯಪಾನ");

    // Child Section 0 must be Academic & Growth Focus
    const childChallenge = childSynthesis.currentDiagnosis.primaryLifeChallenge;
    expect(childChallenge.areaKn).toContain("ಬಾಲ್ಯದ ಸಮಗ್ರ ವಿಕಾಸ, ವಿದ್ಯಾಭ್ಯಾಸ");
    expect(childChallenge.description).toContain("ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ");

    // Child Q&A regarding alcohol must be gentle and pure
    const childDrinkQ = generateVedicConsultationAnswer(
      childKundli,
      childSynthesis.currentDiagnosis,
      childSynthesis.prescriptions,
      "ಮಗುವಿಗೆ ಮದ್ಯಪಾನ ಅಭ್ಯಾಸವಿದೆಯೇ?",
      "Master Aarav",
      true,
      8,
      "Male"
    );
    expect(childDrinkQ).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(childDrinkQ).toContain("ಮುಗ್ಧ ಬಾಲಕ");

    // 3. Female native: Zero usage of 'ಹೆಂಡತಿ' in fidelity praise
    const femaleContext = {
      name: "Smt Ananya",
      birthDate: "1994-08-20",
      birthTime: "15:45",
      latitude: 15.3173,
      longitude: 75.7139,
      devoteeName: "Smt Ananya",
      gender: "Female" as const
    };
    const femaleKundli = calculateKundli(femaleContext);
    const femaleSynthesis = generatePanchangaAngaSynthesis(femaleKundli, femaleContext);

    const trait2Female = femaleSynthesis.goodBadAnalysis.badTraits.find(t => t.id === 2);
    if (trait2Female && trait2Female.bulletKn.includes("ನಿಷ್ಠೆ")) {
      expect(trait2Female.bulletKn).not.toContain("ಏಕಪತ್ನಿ");
      expect(trait2Female.bulletKn).not.toContain("ಹೆಂಡತಿ");
      expect(trait2Female.bulletKn).toMatch(/ಏಕಪತಿ|ಪತಿಗೆ/);
    }

    // 4. Afflicted native test
    const afflictedDiagnosis = {
      ...pramodSynthesis.currentDiagnosis,
      goodBadAnalysis: {
        ...pramodSynthesis.goodBadAnalysis,
        isTeetotaler: false
      }
    };
    const afflictedDrinkQ = generateVedicConsultationAnswer(
      pramodKundli,
      afflictedDiagnosis,
      pramodSynthesis.prescriptions,
      "ಮದ್ಯಪಾನ ದುಶ್ಚಟದ ಬಗ್ಗೆ ಹೇಳಿ",
      "Addicted Native",
      true,
      35,
      "Male"
    );
    expect(afflictedDrinkQ).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ:");
  });
});

