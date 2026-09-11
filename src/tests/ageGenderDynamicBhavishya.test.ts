import { describe, it, expect } from 'vitest';
import {
  analyzeKundali,
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCareerFallback,
  buildDynamicWealthFallback,
  buildDynamicHealthFallback
} from '../features/premiumPdf/dynamicBhavishyaEngine';
import {
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText,
  buildPersonalizedCareerText,
  buildPersonalizedWealthText,
  buildPersonalizedHealthText
} from '../components/RamanBhavishya/BhavishyaView';
import type { NatalPlacement, TransitPlacement } from '../features/premiumPdf/premiumPrompts';

describe('Age & Gender Dynamic Bhavishya Precision Tests', () => {
  // Common planetary setup: Vrishabha Lagna, Kanya Moon
  const samplePlanets: NatalPlacement[] = [
    { graha: "Venus", rashiIndex: 1, house: 1, exalted: false }, // Lagna Lord Venus in 1st
    { graha: "Mercury", rashiIndex: 5, house: 5, exalted: true }, // 5th Lord Mercury in 5th
    { graha: "Mars", rashiIndex: 7, house: 7, exalted: false }, // 7th Lord Mars in 7th
    { graha: "Saturn", rashiIndex: 10, house: 10, exalted: false }, // 10th Lord Saturn in 10th
    { graha: "Jupiter", rashiIndex: 8, house: 8, exalted: false }, // Jupiter in 8th
    { graha: "Sun", rashiIndex: 2, house: 2 },
    { graha: "Moon", rashiIndex: 5, house: 5 },
    { graha: "Rahu", rashiIndex: 0, house: 12 },
    { graha: "Ketu", rashiIndex: 6, house: 6 }
  ];

  const sampleTransits: TransitPlacement[] = [
    { graha: "Saturn", rashiIndex: 10, houseFromMoon: 6 },
    { graha: "Jupiter", rashiIndex: 1, houseFromMoon: 9 }, // Guru Bala!
    { graha: "Rahu", rashiIndex: 11, houseFromMoon: 7 },
    { graha: "Ketu", rashiIndex: 5, houseFromMoon: 1 }
  ];

  /* ========================================================================= */
  /* 1. Senior Citizens (Age 60+)                                             */
  /* ========================================================================= */
  describe('Senior Citizen (Age 65) Astrological Precision', () => {
    it('generates companionship, grandchildren, and mentorship instead of wedding proposals for Senior Male', () => {
      const seniorMale = analyzeKundali({
        lagnaRashiIndex: 1, // Taurus
        moonRashiIndex: 5, // Virgo
        natalPlanets: samplePlanets,
        transits: sampleTransits,
        gender: "Male",
        ageYears: 65,
        lang: "en"
      });

      const marriage = buildDynamicMarriageFallback(seniorMale, "married");
      const children = buildDynamicChildrenFallback(seniorMale, "has_children");
      const career = buildDynamicCareerFallback(seniorMale);
      const wealth = buildDynamicWealthFallback(seniorMale);
      const health = buildDynamicHealthFallback(seniorMale);

      // 1. Marriage/Companionship: Must focus on companionship, Dharma Sahacharini, serenity
      expect(marriage).toContain("spiritual companionship");
      expect(marriage).toContain("Dharma Sahacharini");
      expect(marriage).toContain("lifelong matrimonial harmony");
      // MUST NOT suggest wedding proposals or finding a spouse
      expect(marriage.toLowerCase()).not.toContain("wedding proposal");
      expect(marriage.toLowerCase()).not.toContain("matrimonial alliance");
      expect(marriage.toLowerCase()).not.toContain("finding a life partner");

      // 2. Children/Legacy: Must focus on grandchildren and family lineage
      expect(children).toContain("grandchildren");
      expect(children).toContain("family lineage");
      expect(children).toContain("Poutra-Poutri");
      expect(children.toLowerCase()).not.toContain("conception");

      // 3. Career: Mentorship, consulting, honorary guidance
      expect(career).toContain("mentorship");
      expect(career).toContain("advisory");
      expect(career).toContain("elder statesman");

      // 4. Wealth: Preservation, estate harmony, philanthropy
      expect(wealth).toContain("preservation");
      expect(wealth).toContain("ancestral resources");

      // 5. Health: Geriatric wellness, longevity, joint mobility
      expect(health).toContain("longevity");
      expect(health).toContain("joint mobility");
      expect(health).toContain("Maha Mrityunjaya");
    });

    it('generates Dharma Sahachara and Mangalya Sthana for Senior Female in Kannada', () => {
      const seniorFemale = analyzeKundali({
        lagnaRashiIndex: 1,
        moonRashiIndex: 5,
        natalPlanets: samplePlanets,
        transits: sampleTransits,
        gender: "Female",
        ageYears: 68,
        lang: "kn"
      });

      const marriage = buildDynamicMarriageFallback(seniorFemale, "married");
      const children = buildDynamicChildrenFallback(seniorFemale, "has_children");

      expect(marriage).toContain("ಧರ್ಮ ಸಹಚಾರ್ಯ");
      expect(marriage).toContain("ಧರ್ಮ ಸಹಚರ");
      expect(marriage).toContain("ಮಾಂಗಲ್ಯ ಭಾಗ್ಯ");
      expect(marriage).not.toContain("ಮದುವೆ ಪ್ರಸ್ತಾಪ");

      expect(children).toContain("ಮೊಮ್ಮಕ್ಕಳ");
      expect(children).toContain("ವಂಶಾಭಿವೃದ್ಧಿ");
    });

    it('generates senior readings with pure Telugu and Tamil localized vocabulary', () => {
      const seniorTe = analyzeKundali({
        lagnaRashiIndex: 1,
        moonRashiIndex: 5,
        natalPlanets: samplePlanets,
        transits: sampleTransits,
        gender: "Male",
        ageYears: 62,
        lang: "te"
      });

      const marriageTe = buildDynamicMarriageFallback(seniorTe, "married");
      expect(marriageTe).toContain("దాంపత్య సౌఖ్యం");
      expect(marriageTe).toContain("ధర్మ సహచరి");

      const seniorTa = analyzeKundali({
        lagnaRashiIndex: 1,
        moonRashiIndex: 5,
        natalPlanets: samplePlanets,
        transits: sampleTransits,
        gender: "Female",
        ageYears: 63,
        lang: "ta"
      });

      const marriageTa = buildDynamicMarriageFallback(seniorTa, "married");
      expect(marriageTa).toContain("தம்பதியர் நல்வாழ்வு");
      expect(marriageTa).toContain("மாங்கல்ய பலம்");
    });
  });

  /* ========================================================================= */
  /* 2. Youth / Students (Age 12–21)                                          */
  /* ========================================================================= */
  describe('Youth / Student (< 22 Years) Astrological Precision', () => {
    it('generates study discipline, character, and competitive exam focus for 17-year-old student', () => {
      const student = analyzeKundali({
        lagnaRashiIndex: 1, // Taurus
        moonRashiIndex: 5, // Virgo
        natalPlanets: samplePlanets,
        transits: sampleTransits,
        gender: "Male",
        ageYears: 17,
        lang: "en"
      });

      const marriage = buildDynamicMarriageFallback(student, "unmarried");
      const children = buildDynamicChildrenFallback(student, "no_children");
      const career = buildDynamicCareerFallback(student);
      const wealth = buildDynamicWealthFallback(student);
      const health = buildDynamicHealthFallback(student);

      // 1. Marriage slot -> Character & Emotional Poise: NO marriage proposals!
      expect(marriage).toContain("character formation");
      expect(marriage).toContain("academic discipline");
      expect(marriage).toContain("emotional maturity");
      expect(marriage.toLowerCase()).not.toContain("wedding proposal");
      expect(marriage.toLowerCase()).not.toContain("spouse arrival");

      // 2. Children slot -> Higher Education & Intellect
      expect(children).toContain("higher education");
      expect(children).toContain("intellectual acumen");
      expect(children).toContain("competitive examinations");
      expect(children.toLowerCase()).not.toContain("progeny");
      expect(children.toLowerCase()).not.toContain("conception");

      // 3. Career slot -> Vocational foundations & university admissions
      expect(career).toContain("academic excellence");
      expect(career).toContain("competitive exams");

      // 4. Wealth slot -> Prudent budgeting & financial literacy
      expect(wealth).toContain("budgeting");
      expect(wealth).toContain("family resources");

      // 5. Health slot -> Youth vitality & screen-time balance
      expect(health).toContain("screen strain");
      expect(health).toContain("Surya Namaskars");
    });

    it('generates pure Kannada student text without English leaks', () => {
      const studentKn = analyzeKundali({
        lagnaRashiIndex: 1,
        moonRashiIndex: 5,
        natalPlanets: samplePlanets,
        transits: sampleTransits,
        gender: "Female",
        ageYears: 19,
        lang: "kn"
      });

      const studyText = buildDynamicChildrenFallback(studentKn, "no_children");
      const charText = buildDynamicMarriageFallback(studentKn, "unmarried");

      expect(studyText).toContain("ಉನ್ನತ ಶಿಕ್ಷಣ");
      expect(studyText).toContain("ಬುದ್ಧಿಶಕ್ತಿ");
      expect(charText).toContain("ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ");
      expect(charText).not.toContain("ಮದುವೆ ಪ್ರಸ್ತಾಪ");
    });
  });

  /* ========================================================================= */
  /* 3. Adult Precision & Paragraph Invariant Verification                     */
  /* ========================================================================= */
  describe('Adult (Age 28) 3-Paragraph Exact Contract', () => {
    it('produces exactly 3 paragraphs for adult unmarried male with direction and Kuja status', () => {
      const text = buildPersonalizedMarriageText(
        "en",
        "Vrishabha",
        "Kanya",
        "unmarried",
        1,
        "Venus",
        "Mercury",
        "Male",
        {
          planets: samplePlanets.map(p => ({
            name: p.graha,
            house: p.house,
            rashiIndex: p.rashiIndex,
            isExalted: p.exalted
          })),
          transits: sampleTransits,
          moonRashiIndex: 5,
          ageYears: 28,
          gender: "Male"
        }
      );

      const paras = text.split(/\n\n+/).filter(p => p.trim().length > 30);
      expect(paras.length).toBe(3);
      expect(text).toContain("Vrischika"); // 7th house for Taurus is Scorpio
      expect(text).toContain("Kuja"); // Lord of Scorpio is Mars/Kuja
    });

    it('produces exactly 3 paragraphs for adult married female with Mangalya Sthana', () => {
      const text = buildPersonalizedMarriageText(
        "en",
        "Vrishabha",
        "Kanya",
        "married",
        1,
        "Venus",
        "Mercury",
        "Female",
        {
          planets: samplePlanets.map(p => ({
            name: p.graha,
            house: p.house,
            rashiIndex: p.rashiIndex,
            isExalted: p.exalted
          })),
          transits: sampleTransits,
          moonRashiIndex: 5,
          ageYears: 32,
          gender: "Female"
        }
      );

      const paras = text.split(/\n\n+/).filter(p => p.trim().length > 30);
      expect(paras.length).toBe(3);
      expect(text).toContain("Mangalya Sthana");
      expect(text).toContain("Jeevakaraka Jupiter");
    });
  });
});
