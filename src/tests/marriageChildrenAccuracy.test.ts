import { describe, it, expect } from 'vitest';
import { buildPersonalizedMarriageText, buildPersonalizedChildrenText } from '../components/RamanBhavishya/BhavishyaView';
import { cleanEnglishFromRegionalText } from '../features/premiumPdf/premiumPdfLocale';

function assertMarriageChildrenCriteria(text: string, expectedParams: string[]) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
  if (paragraphs.length < 3) {
    throw new Error(`Criteria missing: Marriage/Children predictions must contain at least 3 Kundali-accurate paragraphs. Found ${paragraphs.length} paragraphs.`);
  }
  for (const param of expectedParams) {
    if (!text.toLowerCase().includes(param.toLowerCase())) {
      throw new Error(`Criteria missing: Expected parameter "${param}" not found in Kundali-accurate prediction text.`);
    }
  }
  return true;
}

describe('Marriage & Children Dynamic Kundali Accuracy Tests', () => {
  it('buildPersonalizedMarriageText generates 3 Kundali-accurate paragraphs for unmarried status without hardcoding', () => {
    const text = buildPersonalizedMarriageText('kn', 'ಕರ್ಕ (Karka)', 'ತುಲಾ (Tula)', 'unmarried', 3, 'ಶುಕ್ರ (Venus)', 'ರಾಹು (Rahu)');
    expect(text).toBeTypeOf('string');
    
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(paragraphs.length).toBe(3);

    assertMarriageChildrenCriteria(text, ['ಕರ್ಕ (Karka)', 'ತುಲಾ (Tula)', 'ಶುಕ್ರ (Venus)', 'ರಾಹು (Rahu)', 'ಶನಿ']);
  });

  it('buildPersonalizedMarriageText generates 3 Kundali-accurate paragraphs for married status in English', () => {
    const text = buildPersonalizedMarriageText('en', 'Dhanus', 'Kanya', 'married', 8, 'Jupiter', 'Mercury');
    expect(text).toBeTypeOf('string');

    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(paragraphs.length).toBe(3);

    assertMarriageChildrenCriteria(text, ['Dhanus', 'Kanya', 'Mercury (Budha)']);
  });

  it('buildPersonalizedChildrenText generates 3 Kundali-accurate paragraphs for no_children status', () => {
    const text = buildPersonalizedChildrenText('kn', 'no_children', 3, 'ಬೃಹಸ್ಪತಿ (Jupiter)', 'ಚಂದ್ರ (Moon)');
    expect(text).toBeTypeOf('string');

    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(paragraphs.length).toBe(3);

    assertMarriageChildrenCriteria(text, ['ಬೃಹಸ್ಪತಿ (Jupiter)', 'ಚಂದ್ರ (Moon)', 'ಕುಜ (ಮಂಗಳ)']);
  });

  it('buildPersonalizedChildrenText generates 3 Kundali-accurate paragraphs for has_children status in English', () => {
    const text = buildPersonalizedChildrenText('en', 'has_children', 2, 'Sun', 'Mars');
    expect(text).toBeTypeOf('string');

    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(paragraphs.length).toBe(3);

    assertMarriageChildrenCriteria(text, ['Venus (Shukra)']);
  });

  it('cleanEnglishFromRegionalText replaces stray English leak words with pure Kannada script', () => {
    const rawLeak = "ನಿಮ್ಮಲ್ಲಿ ವಿಪರೀತ ಧೈರ್ಯ, ಮೂanaditude ಹಾಗೂ ಸ್ವಾವಲಂಬನೆಯನ್ನು ತಂದಿದ್ದರೂ ಸಹ...";
    const cleaned = cleanEnglishFromRegionalText(rawLeak, 'kn');
    expect(cleaned).not.toContain("ಮೂanaditude");
    expect(cleaned).toContain("ಮನಸ್ಥಿತಿ");
  });

  it('fails with explicit error message if paragraph count or criteria are missing', () => {
    expect(() => {
      assertMarriageChildrenCriteria("Single short paragraph text", ["Karka"]);
    }).toThrow("Criteria missing: Marriage/Children predictions must contain at least 3 Kundali-accurate paragraphs");
  });
});
