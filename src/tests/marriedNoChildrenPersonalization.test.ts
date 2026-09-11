import { describe, it, expect } from 'vitest';
import {
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText,
  DynamicChartContext
} from '../components/RamanBhavishya/BhavishyaView';
import {
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicSummaryFallback,
  analyzeKundali
} from '../features/premiumPdf/dynamicBhavishyaEngine';
import { cleanEnglishFromRegionalText } from '../features/premiumPdf/premiumPdfLocale';
import type { NatalPlacement } from '../features/premiumPdf/premiumPrompts';

describe('Married + No Children (Seeking Progeny) Personalization Tests', () => {
  const mockPlanets: NatalPlacement[] = [
    { graha: "Sun", rashiIndex: 4, house: 5 },
    { graha: "Moon", rashiIndex: 3, house: 4 },
    { graha: "Mars", rashiIndex: 0, house: 1 },
    { graha: "Mercury", rashiIndex: 5, house: 6 },
    { graha: "Jupiter", rashiIndex: 8, house: 9 },
    { graha: "Venus", rashiIndex: 6, house: 7 },
    { graha: "Saturn", rashiIndex: 10, house: 11 },
    { graha: "Rahu", rashiIndex: 1, house: 2 },
    { graha: "Ketu", rashiIndex: 7, house: 8 }
  ];

  const ctxKn: DynamicChartContext = {
    name: "ರಾಘವೇಂದ್ರ",
    maritalStatus: "married",
    hasChildren: "no_children",
    planets: mockPlanets.map(p => ({
      name: p.graha,
      house: p.house,
      rashiIndex: p.rashiIndex
    })),
    moonRashiIndex: 3,
    ageYears: 32,
    gender: "Male"
  };

  const ctxEn: DynamicChartContext = {
    name: "Raghavendra",
    maritalStatus: "married",
    hasChildren: "no_children",
    planets: mockPlanets.map(p => ({
      name: p.graha,
      house: p.house,
      rashiIndex: p.rashiIndex
    })),
    moonRashiIndex: 3,
    ageYears: 32,
    gender: "Male"
  };

  it('Marriage section for married + no_children addresses devotee by name and omits child-rearing', () => {
    const textKn = buildPersonalizedMarriageText('kn', 'ಮೇಷ (Mesha)', 'ಕರ್ಕ (Karka)', 'married', 0, 'ಗುರು (Guru)', 'ಶುಕ್ರ (Shukra)', 'Male', ctxKn);
    expect(textKn).toContain("ರಾಘವೇಂದ್ರ ಅವರೇ");
    expect(textKn.toLowerCase()).not.toContain("ಮಕ್ಕಳ");
    expect(textKn.toLowerCase()).not.toContain("children");
    expect(textKn).toContain("ಸಂಗಾತಿ");

    const textEn = buildPersonalizedMarriageText('en', 'Mesha', 'Karka', 'married', 0, 'Jupiter', 'Venus', 'Male', ctxEn);
    expect(textEn).toContain("Dear Raghavendra");
    expect(textEn.toLowerCase()).not.toContain("upbringing");
    expect(textEn.toLowerCase()).not.toContain("schooling");
    expect(textEn.toLowerCase()).not.toContain("raising children");
    expect(textEn).toContain("emotional anchor");
  });

  it('Children section for no_children generates 3 expansive paragraphs addressing devotee with remedies', () => {
    const textKn = buildPersonalizedChildrenText('kn', 'no_children', 0, 'ಗುರು', 'ಶುಕ್ರ', ctxKn);
    const parasKn = textKn.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(parasKn.length).toBe(3);
    expect(textKn).toContain("ರಾಘವೇಂದ್ರ ಅವರೇ");
    expect(textKn).toContain("ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ");
    expect(textKn).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ");

    const cleanedKn = cleanEnglishFromRegionalText(textKn, 'kn');
    // Ensure no stray Latin letters in Kannada text
    const latinInKn = cleanedKn.match(/[A-Za-z]/g);
    expect(latinInKn).toBeNull();

    const textEn = buildPersonalizedChildrenText('en', 'no_children', 0, 'Jupiter', 'Venus', ctxEn);
    const parasEn = textEn.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(parasEn.length).toBe(3);
    expect(textEn).toContain("Dear Raghavendra");
    expect(textEn).toContain("Santana Yoga");
    expect(textEn).toContain("Santana Gopala Mantra");
    expect(textEn).toContain("Gau-seva");
  });

  it('buildDynamicCurrentPhaseFallback reflects adult marriage + no_children living reality', () => {
    const chart = analyzeKundali({
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: mockPlanets,
      gender: "Male",
      ageYears: 32,
      lang: "kn"
    });
    chart.name = "ರಾಘವೇಂದ್ರ";
    chart.maritalStatus = "married";
    chart.hasChildren = "no_children";

    const textKn = buildDynamicCurrentPhaseFallback(chart);
    expect(textKn).toContain("ರಾಘವೇಂದ್ರ ಅವರೇ");
    expect(textKn).toContain("ವಂಶಾಭಿವೃದ್ಧಿಯ ಸತ್ಸಂಕಲ್ಪವನ್ನು ಸಾಕಾರಗೊಳಿಸುವ");
    // Should not assume existing grandchildren
    expect(textKn).not.toContain("ಮೊಮ್ಮಕ್ಕಳ");

    chart.lang = "en";
    chart.name = "Raghavendra";
    const textEn = buildDynamicCurrentPhaseFallback(chart);
    expect(textEn).toContain("Dear Raghavendra");
    expect(textEn).toContain("shared prayers for family expansion");
  });

  it('buildDynamicSummaryFallback sets family expansion as a core priority for married + no_children', () => {
    const chart = analyzeKundali({
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: mockPlanets,
      gender: "Male",
      ageYears: 32,
      lang: "kn"
    });
    chart.name = "ರಾಘವೇಂದ್ರ";
    chart.maritalStatus = "married";
    chart.hasChildren = "no_children";

    const textKn = buildDynamicSummaryFallback(chart);
    expect(textKn).toContain("ರಾಘವೇಂದ್ರ ಅವರೇ");
    expect(textKn).toContain("ಸಂತಾನ ಪ್ರಾಪ್ತಿಗಾಗಿ");

    chart.lang = "en";
    chart.name = "Raghavendra";
    const textEn = buildDynamicSummaryFallback(chart);
    expect(textEn).toContain("Dear Raghavendra");
    expect(textEn).toContain("shared aspirations for progeny");
  });
});
