import { describe, it, expect } from 'vitest';
import { buildPersonalizedMarriageText, buildPersonalizedChildrenText, robustParseGeminiJSON } from '../components/RamanBhavishya/BhavishyaView';
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

  describe('robustParseGeminiJSON Tests', () => {
    it('parses valid markdown codeblock JSON', () => {
      const raw = '```json\n{"bhavishya": {"marriage": "Good", "children": "Blessed"}}\n```';
      const parsed = robustParseGeminiJSON(raw);
      expect(parsed?.bhavishya?.marriage).toBe("Good");
      expect(parsed?.bhavishya?.children).toBe("Blessed");
    });

    it('parses JSON with unescaped raw newlines inside string literals', () => {
      const raw = '{\n  "darkSecret": [\n    {\n      "impact": "Paragraph 1 line 1\nParagraph 1 line 2"\n    }\n  ]\n}';
      const parsed = robustParseGeminiJSON(raw);
      expect(parsed?.darkSecret?.[0]?.impact).toContain("Paragraph 1 line 1");
      expect(parsed?.darkSecret?.[0]?.impact).toContain("Paragraph 1 line 2");
    });

    it('returns empty object gracefully for invalid text', () => {
      expect(robustParseGeminiJSON("")).toEqual({});
      expect(robustParseGeminiJSON("Sorry, I cannot fulfill this request.")).toEqual({});
    });
  });

  describe('Child Age (< 8 years) Adult Theme Suppression', () => {
    it('suppresses marriage and children predictions for children under 8', () => {
      const ageYears = 5.2;
      let mockPredictions = [
        { category: "health", translatedCategory: "ಆರೋಗ್ಯ", text: "Healthy child" },
        { category: "education", translatedCategory: "ವಿದ್ಯಾಭ್ಯಾಸ", text: "Bright studies" },
        { category: "marriage", translatedCategory: "ವಿವಾಹ ಜೀವನ", text: "Adult marriage info" },
        { category: "children", translatedCategory: "ಸಂತಾನ ಭಾಗ್ಯ", text: "Adult children info" }
      ];

      if (ageYears < 8) {
        mockPredictions = mockPredictions.filter(p => {
          const cat = `${p.translatedCategory || ''} ${p.category || ''}`.toLowerCase();
          const isAdult = cat.includes("marriage") || cat.includes("ಮದುವೆ") || cat.includes("ವಿವಾಹ") || cat.includes("विवाह") || cat.includes("వివాಹ") || cat.includes("திருமணம்") ||
                          cat.includes("children") || cat.includes("ಸಂತಾನ") || cat.includes("ಮಕ್ಕಳು") || cat.includes("संतान") || cat.includes("సంతాన") || cat.includes("குழந்தை");
          return !isAdult;
        });
      }

      expect(mockPredictions.length).toBe(2);
      expect(mockPredictions.some(p => p.category === "marriage")).toBe(false);
      expect(mockPredictions.some(p => p.category === "children")).toBe(false);
      expect(mockPredictions.some(p => p.category === "health")).toBe(true);
      expect(mockPredictions.some(p => p.category === "education")).toBe(true);
    });

    it('preserves marriage and children predictions for clients >= 8 years', () => {
      const ageYears = 28.5;
      let mockPredictions = [
        { category: "health", translatedCategory: "ಆರೋಗ್ಯ", text: "Healthy native" },
        { category: "marriage", translatedCategory: "ವಿವಾಹ ಜೀವನ", text: "Dynamic marriage prediction" },
        { category: "children", translatedCategory: "ಸಂತಾನ ಭಾಗ್ಯ", text: "Dynamic children prediction" }
      ];

      if (ageYears < 8) {
        mockPredictions = mockPredictions.filter(p => {
          const cat = `${p.translatedCategory || ''} ${p.category || ''}`.toLowerCase();
          const isAdult = cat.includes("marriage") || cat.includes("ಮದುವೆ") || cat.includes("ವಿವಾಹ") || cat.includes("विवाह") || cat.includes("వివాಹ") || cat.includes("திருமணம்") ||
                          cat.includes("children") || cat.includes("ಸಂತಾನ") || cat.includes("ಮಕ್ಕಳು") || cat.includes("संतान") || cat.includes("సంతಾನ") || cat.includes("குழந்தை");
          return !isAdult;
        });
      }

      expect(mockPredictions.length).toBe(3);
      expect(mockPredictions.some(p => p.category === "marriage")).toBe(true);
      expect(mockPredictions.some(p => p.category === "children")).toBe(true);
    });
  });
});
