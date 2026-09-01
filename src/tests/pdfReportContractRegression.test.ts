import { describe, it, expect } from 'vitest';
import { buildPersonalizedMarriageText, buildPersonalizedChildrenText } from '../components/RamanBhavishya/BhavishyaView';
import { cleanEnglishFromRegionalText } from '../features/premiumPdf/premiumPdfLocale';
import { buildPremiumPrompts } from '../features/premiumPdf/premiumPrompts';
import fs from 'fs';
import path from 'path';

describe('PDF Report Contract & Regression Test Suite', () => {

  describe('1. Marriage & Relationships 3-Paragraph Strict Rule', () => {
    it('enforces EXACTLY 3 detailed paragraphs for UNMARRIED status in Kannada & English', () => {
      const textKn = buildPersonalizedMarriageText('kn', 'ಕರ್ಕ (Karka)', 'ತುಲಾ (Tula)', 'unmarried', 3, 'ಶುಕ್ರ (Venus)', 'ರಾಹು (Rahu)');
      const textEn = buildPersonalizedMarriageText('en', 'Cancer', 'Libra', 'unmarried', 3, 'Venus', 'Rahu');

      for (const text of [textKn, textEn]) {
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
        expect(paragraphs.length).toBe(3);
      }

      // Check key Marriage details
      expect(textKn.toLowerCase()).toContain('7ನೇ ಮನೆ');
      expect(textKn.toLowerCase()).toContain('ಸುಬ್ರಹ್ಮಣ್ಯ');
      expect(textEn.toLowerCase()).toContain('7th house');
      expect(textEn.toLowerCase()).toContain('gauri');
    });

    it('enforces EXACTLY 3 detailed paragraphs for MARRIED status across Kannada, Hindi, Telugu, Tamil, English', () => {
      const langs = ['kn', 'hi', 'te', 'ta', 'en'];

      for (const lang of langs) {
        const text = buildPersonalizedMarriageText(lang, 'ಮೇಷ (Mesha)', 'ವೃಷಭ (Vrishabha)', 'married', 0, 'ಗುರು (Jupiter)', 'ಬುಧ (Mercury)');
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);

        if (paragraphs.length !== 3) {
          throw new Error(`Report Contract Failure: Marriage section for status "married" in language "${lang}" must contain exactly 3 paragraphs. Found ${paragraphs.length}.`);
        }

        expect(paragraphs.length).toBe(3);
      }
    });

    it('validates that Paragraph 2 of Married status specifically highlights mutual understanding and how partners have understood each other', () => {
      const textKn = buildPersonalizedMarriageText('kn', 'ಧನುಸ್ (Dhanus)', 'ಮಿಥುನ (Mithuna)', 'married', 8, 'ಗುರು', 'ಶುಕ್ರ');
      const paragraphsKn = textKn.split(/\n\n+/).filter(p => p.trim().length > 30);

      // Paragraph 2 must contain mutual understanding / ತ್ತಿಳುವಳಿಕೆ / ತಿಳುವಳಿಕೆ
      const p2 = paragraphsKn[1].toLowerCase();
      expect(p2.includes('ತಿಳುವಳಿಕೆ') || p2.includes('ಗೌರವ') || p2.includes('ಸಾಮರಸ್ಯ')).toBe(true);

      const textEn = buildPersonalizedMarriageText('en', 'Dhanus', 'Mithuna', 'married', 8, 'Jupiter', 'Venus');
      const paragraphsEn = textEn.split(/\n\n+/).filter(p => p.trim().length > 30);
      const p2En = paragraphsEn[1].toLowerCase();
      expect(p2En.includes('understanding') || p2En.includes('respect') || p2En.includes('relationship')).toBe(true);
    });
  });

  describe('2. Children & Progeny 3-Paragraph Strict Rule', () => {
    it('enforces EXACTLY 3 detailed paragraphs for NO CHILDREN status across all languages', () => {
      const langs = ['kn', 'hi', 'te', 'ta', 'en'];

      for (const lang of langs) {
        const text = buildPersonalizedChildrenText(lang, 'no_children', 3, 'ಬೃಹಸ್ಪತಿ', 'ಚಂದ್ರ');
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);

        if (paragraphs.length !== 3) {
          throw new Error(`Report Contract Failure: Children section for status "no_children" in language "${lang}" must contain exactly 3 paragraphs. Found ${paragraphs.length}.`);
        }

        expect(paragraphs.length).toBe(3);
      }
    });

    it('enforces EXACTLY 3 detailed paragraphs for HAS CHILDREN status across all languages', () => {
      const langs = ['kn', 'hi', 'te', 'ta', 'en'];

      for (const lang of langs) {
        const text = buildPersonalizedChildrenText(lang, 'has_children', 5, 'ಶುಕ್ರ', 'ಶನಿ');
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);

        if (paragraphs.length !== 3) {
          throw new Error(`Report Contract Failure: Children section for status "has_children" in language "${lang}" must contain exactly 3 paragraphs. Found ${paragraphs.length}.`);
        }

        expect(paragraphs.length).toBe(3);
      }
    });
  });

  describe('3. Pure Script & Regional Language Integrity', () => {
    it('cleans stray English words from Kannada, Hindi, Telugu, Tamil text', () => {
      const strayKn = "ನಿಮ್ಮಲ್ಲಿ ವಿಪರೀತ ಧೈರ್ಯ, ಮೂanaditude, attitude ಹಾಗೂ career ಬ್ಯಾಲೆನ್ಸ್ ಬಂದರೂ ಸಹ...";
      const cleanedKn = cleanEnglishFromRegionalText(strayKn, 'kn');

      expect(cleanedKn).not.toContain('ಮೂanaditude');
      expect(cleanedKn).not.toContain('attitude');
      expect(cleanedKn).not.toContain('career');
      expect(cleanedKn).toContain('ಮನಸ್ಥಿತಿ');
      expect(cleanedKn).toContain('ಉದ್ಯೋಗ');

      const strayHi = "आपका attitude और career बहुत ही शुभ रहेगा...";
      const cleanedHi = cleanEnglishFromRegionalText(strayHi, 'hi');
      expect(cleanedHi).not.toContain('attitude');
      expect(cleanedHi).toContain('मनोवृत्ति');
    });
  });

  describe('4. AI Prompt Contract Strict Alignment', () => {
    it('verifies premiumPrompts instructs Gemini for EXACTLY 3 paragraphs for Marriage in prompt & JSON schema', () => {
      const prompts = buildPremiumPrompts({
        personName: "Test User",
        gender: "Male",
        birthDate: "1993-05-31",
        birthTime: "09:25",
        birthPlace: "Gokarna",
        latitude: 14.54,
        longitude: 74.31,
        timezone: 5.5,
        targetLanguage: "kn",
        ayanamsha: "Lahiri",
        maritalStatus: "unmarried",
        childrenStatus: "no_children",
        roadmap: [],
        natalPlanets: [],
        transits: [],
        findings: [],
        engineYogas: [],
        engineDoshas: [],
        chartData: {
          lagnaSign: "Karka",
          moonSign: "Tula",
          sunSign: "Vrishabha",
          nakshatra: "Chitra",
          nakshatraPada: 1,
          dashaLord: "Venus",
          bhuktiLord: "Rahu"
        }
      } as any);

      const marriagePrompt = prompts.bhavishya;

      expect(marriagePrompt).toContain("Write EXACTLY THREE detailed paragraphs for UNMARRIED status");
      expect(marriagePrompt).toContain('"marriage":"three paragraphs"');

      // Test married prompt
      const marriedPrompts = buildPremiumPrompts({
        personName: "Test User",
        gender: "Male",
        birthDate: "1993-05-31",
        birthTime: "09:25",
        birthPlace: "Gokarna",
        latitude: 14.54,
        longitude: 74.31,
        timezone: 5.5,
        targetLanguage: "kn",
        ayanamsha: "Lahiri",
        maritalStatus: "married",
        childrenStatus: "has_children",
        roadmap: [],
        natalPlanets: [],
        transits: [],
        findings: [],
        engineYogas: [],
        engineDoshas: [],
        chartData: {
          lagnaSign: "Karka",
          moonSign: "Tula",
          sunSign: "Vrishabha",
          nakshatra: "Chitra",
          nakshatraPada: 1,
          dashaLord: "Venus",
          bhuktiLord: "Rahu"
        }
      } as any);

      expect(marriedPrompts.bhavishya).toContain("Write EXACTLY THREE detailed paragraphs for MARRIED status");
      expect(marriedPrompts.bhavishya).toContain("Write EXACTLY TWO detailed paragraphs for HAS CHILDREN status");

      // Test general / default prompt
      const generalPrompts = buildPremiumPrompts({
        personName: "Test User",
        gender: "Male",
        birthDate: "1993-05-31",
        birthTime: "09:25",
        birthPlace: "Gokarna",
        latitude: 14.54,
        longitude: 74.31,
        timezone: 5.5,
        targetLanguage: "kn",
        ayanamsha: "Lahiri",
        maritalStatus: "general",
        childrenStatus: "general",
        roadmap: [],
        natalPlanets: [],
        transits: [],
        findings: [],
        engineYogas: [],
        engineDoshas: [],
        chartData: {
          lagnaSign: "Karka",
          moonSign: "Tula",
          sunSign: "Vrishabha",
          nakshatra: "Chitra",
          nakshatraPada: 1,
          dashaLord: "Venus",
          bhuktiLord: "Rahu"
        }
      } as any);

      expect(generalPrompts.bhavishya).toContain("Write EXACTLY THREE detailed paragraphs for GENERAL status");
      expect(generalPrompts.bhavishya).toContain("Write EXACTLY TWO detailed paragraphs for GENERAL status");
    });
  });

  describe('5. Production Security Guard (Pramod Test Button)', () => {
    it('verifies KundliPage.tsx wraps the test details button with import.meta.env.DEV guard', () => {
      const kundliPagePath = path.resolve(__dirname, '../pages/KundliPage.tsx');
      const fileContent = fs.readFileSync(kundliPagePath, 'utf-8');

      expect(fileContent).toContain('import.meta.env.DEV');
      
      // Ensure fillTestKundali is inside the import.meta.env.DEV block
      const devBlockIdx = fileContent.indexOf('import.meta.env.DEV');
      const testButtonIdx = fileContent.indexOf('Fill Test Details (Pramod Kodgi)');

      expect(devBlockIdx).toBeGreaterThan(0);
      expect(testButtonIdx).toBeGreaterThan(devBlockIdx);
    });
  });

});
