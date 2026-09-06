import { describe, it, expect } from 'vitest';
import {
  analyzeKundali,
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCareerFallback,
  buildDynamicWealthFallback,
  buildDynamicHealthFallback,
  buildDynamicChildEducationFallback,
  buildDynamicChildActivitiesFallback,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicGocharaFallback
} from '../features/premiumPdf/dynamicBhavishyaEngine';
import {
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText,
  buildPersonalizedCareerText,
  buildPersonalizedWealthText,
  buildPersonalizedHealthText
} from '../components/RamanBhavishya/BhavishyaView';
import type { NatalPlacement, TransitPlacement } from '../features/premiumPdf/premiumPrompts';

describe('Four Devotees English Report Audit & 100% Dynamic Engine Verification', () => {
  // Chart 1: Devotee 1 - Adult Male, Unmarried (Mesha Lagna, Vrishabha Moon, Rahu Mahadasha - Jupiter Bhukti)
  const chart1Planets: NatalPlacement[] = [
    { graha: "Mars", rashiIndex: 0, house: 1, exalted: false, debilitated: false }, // Mars in 1st (Mesha)
    { graha: "Moon", rashiIndex: 1, house: 2, exalted: true }, // Moon in 2nd (Taurus - exalted)
    { graha: "Mercury", rashiIndex: 2, house: 3 }, // Mercury in 3rd
    { graha: "Sun", rashiIndex: 3, house: 4 }, // Sun in 4th
    { graha: "Venus", rashiIndex: 6, house: 7 }, // Venus in 7th (Libra - Moolatrikona)
    { graha: "Jupiter", rashiIndex: 8, house: 9 }, // Jupiter in 9th (Sagittarius)
    { graha: "Saturn", rashiIndex: 9, house: 10, exalted: false }, // Saturn in 10th (Capricorn - own house)
    { graha: "Rahu", rashiIndex: 1, house: 2 },
    { graha: "Ketu", rashiIndex: 7, house: 8 },
  ];
  const transits1: TransitPlacement[] = [
    { graha: "Saturn", rashiIndex: 10, houseFromMoon: 10 },
    { graha: "Jupiter", rashiIndex: 1, houseFromMoon: 1 },
    { graha: "Rahu", rashiIndex: 11, houseFromMoon: 11 },
    { graha: "Ketu", rashiIndex: 5, houseFromMoon: 5 },
  ];

  // Chart 2: Devotee 2 - Adult Female, Married with Children (Kanya Lagna, Makara Moon, Jupiter Mahadasha - Venus Bhukti)
  const chart2Planets: NatalPlacement[] = [
    { graha: "Mercury", rashiIndex: 5, house: 1, exalted: true }, // Mercury in 1st (Virgo - exalted)
    { graha: "Venus", rashiIndex: 6, house: 2 }, // Venus in 2nd
    { graha: "Mars", rashiIndex: 7, house: 3 }, // Mars in 3rd (Scorpio - own house)
    { graha: "Jupiter", rashiIndex: 3, house: 11, exalted: true }, // Jupiter in 11th (Cancer - exalted)
    { graha: "Saturn", rashiIndex: 9, house: 5 }, // Saturn in 5th (Capricorn)
    { graha: "Moon", rashiIndex: 9, house: 5 }, // Moon in 5th (Capricorn)
    { graha: "Sun", rashiIndex: 4, house: 12 }, // Sun in 12th
    { graha: "Rahu", rashiIndex: 2, house: 10 },
    { graha: "Ketu", rashiIndex: 8, house: 4 },
  ];
  const transits2: TransitPlacement[] = [
    { graha: "Saturn", rashiIndex: 10, houseFromMoon: 2 }, // 2nd house (Sade Sati closing)
    { graha: "Jupiter", rashiIndex: 1, houseFromMoon: 5 }, // 5th house Guru Bala!
    { graha: "Rahu", rashiIndex: 11, houseFromMoon: 3 },
    { graha: "Ketu", rashiIndex: 5, houseFromMoon: 9 },
  ];

  // Chart 3: Devotee 3 - Young Child, Age 5 (Simha Lagna, Mithuna Moon, Mercury Mahadasha)
  const chart3Planets: NatalPlacement[] = [
    { graha: "Sun", rashiIndex: 4, house: 1 }, // Sun in Leo (1st)
    { graha: "Mercury", rashiIndex: 4, house: 1 }, // Budhaditya
    { graha: "Moon", rashiIndex: 2, house: 11 }, // Moon in Gemini (11th)
    { graha: "Jupiter", rashiIndex: 8, house: 5, exalted: false }, // Jupiter in 5th (Sagittarius)
    { graha: "Mars", rashiIndex: 9, house: 6, exalted: true }, // Mars exalted in 6th
    { graha: "Venus", rashiIndex: 3, house: 12 },
    { graha: "Saturn", rashiIndex: 10, house: 7 },
  ];

  // Chart 4: Devotee 4 - Senior Devotee, Age 62 (Vrischika Lagna, Meena Moon, Saturn Mahadasha)
  const chart4Planets: NatalPlacement[] = [
    { graha: "Mars", rashiIndex: 7, house: 1 }, // Mars in Scorpio (1st)
    { graha: "Jupiter", rashiIndex: 11, house: 5 }, // Jupiter in Pisces (5th)
    { graha: "Moon", rashiIndex: 11, house: 5 }, // Moon in Pisces (5th)
    { graha: "Saturn", rashiIndex: 6, house: 12, exalted: true }, // Saturn exalted in Libra (12th)
    { graha: "Venus", rashiIndex: 1, house: 7 }, // Venus in Taurus (7th)
    { graha: "Sun", rashiIndex: 8, house: 2 },
    { graha: "Mercury", rashiIndex: 8, house: 2 },
  ];

  it('generates 100% distinct, mathematically accurate chart analyses for Devotee 1 and Devotee 2', () => {
    const k1 = analyzeKundali({
      lagnaRashiIndex: 0, // Aries
      moonRashiIndex: 1, // Taurus
      natalPlanets: chart1Planets,
      transits: transits1,
      mahaLord: "Rahu",
      bhuktiLord: "Jupiter",
      gender: "Male",
      ageYears: 28,
      lang: "en"
    });

    const k2 = analyzeKundali({
      lagnaRashiIndex: 5, // Virgo
      moonRashiIndex: 9, // Capricorn
      natalPlanets: chart2Planets,
      transits: transits2,
      mahaLord: "Jupiter",
      bhuktiLord: "Venus",
      gender: "Female",
      ageYears: 34,
      lang: "en"
    });

    // Verify 7th house and 7th lords are mathematically distinct
    expect(k1.houses[7].rashiName).toBe("Tula"); // Libra for Aries ascendant
    expect(k1.houses[7].lordName).toBe("Shukra");
    expect(k1.houses[7].lordHouse).toBe(7); // Venus placed in 7th
    expect(k1.spouseDirection.en).toBe("West"); // Air sign (Libra) -> West

    expect(k2.houses[7].rashiName).toBe("Meena"); // Pisces for Virgo ascendant
    expect(k2.houses[7].lordName).toBe("Guru");
    expect(k2.houses[7].lordHouse).toBe(11); // Jupiter in 11th
    expect(k2.spouseDirection.en).toBe("North"); // Water sign (Pisces) -> North

    // Verify 5th house and lords are distinct
    expect(k1.houses[5].rashiName).toBe("Simha"); // Leo
    expect(k1.houses[5].lordName).toBe("Ravi");

    expect(k2.houses[5].rashiName).toBe("Makara"); // Capricorn
    expect(k2.houses[5].lordName).toBe("Shani");

    // Verify 10th house and lords are distinct
    expect(k1.houses[10].lordName).toBe("Shani");
    expect(k2.houses[10].lordName).toBe("Budha");

    // Verify dynamic marriage narratives are completely different and strictly personalized
    const mText1 = buildDynamicMarriageFallback(k1, "unmarried");
    const mText2 = buildDynamicMarriageFallback(k2, "married");

    expect(mText1).toContain("West direction");
    expect(mText1).toContain("Tula");
    expect(mText1).toContain("Rahu");
    expect(mText1).toContain("Guru");

    expect(mText2).toContain("Meena");
    expect(mText2).toContain("Guru");
    expect(mText2).toContain("Shukra");

    expect(mText1).not.toBe(mText2);
  });

  it('buildPersonalizedMarriageText uses dynamic context correctly and produces 3 Kundali-accurate paragraphs', () => {
    const text = buildPersonalizedMarriageText(
      "en",
      "Mesha (Aries)",
      "Vrishabha (Taurus)",
      "unmarried",
      0,
      "Rahu",
      "Jupiter",
      "Male",
      {
        planets: chart1Planets.map(p => ({
          name: p.graha,
          house: p.house,
          rashiIndex: p.rashiIndex,
          isExalted: p.exalted
        })),
        transits: transits1,
        moonRashiIndex: 1,
        ageYears: 28
      }
    );

    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
    expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    expect(text).toContain("Tula");
    expect(text).toContain("West");
  });

  it('buildPersonalizedChildrenText uses dynamic context for has_children and no_children with zero boilerplate', () => {
    const textNoChildren = buildPersonalizedChildrenText(
      "en",
      "no_children",
      0,
      "Rahu",
      "Jupiter",
      {
        planets: chart1Planets.map(p => ({
          name: p.graha,
          house: p.house,
          rashiIndex: p.rashiIndex
        })),
        transits: transits1,
        moonRashiIndex: 1,
        ageYears: 28
      }
    );

    const textHasChildren = buildPersonalizedChildrenText(
      "en",
      "has_children",
      5,
      "Jupiter",
      "Venus",
      {
        planets: chart2Planets.map(p => ({
          name: p.graha,
          house: p.house,
          rashiIndex: p.rashiIndex
        })),
        transits: transits2,
        moonRashiIndex: 9,
        ageYears: 34
      }
    );

    expect(textNoChildren).toContain("Santana Yoga");
    expect(textNoChildren).toContain("Simha");
    expect(textNoChildren).toContain("Surya");

    expect(textHasChildren).toContain("Makara");
    expect(textHasChildren).toContain("Shani");
    expect(textHasChildren).toContain("intellect");

    expect(textNoChildren).not.toBe(textHasChildren);
  });

  it('builds dynamic Career, Wealth, and Health text grounded in 10th, 2nd, 11th, and 1st/6th lords', () => {
    const career = buildPersonalizedCareerText("en", 0, "Rahu", "Jupiter", {
      planets: chart1Planets.map(p => ({ name: p.graha, house: p.house, rashiIndex: p.rashiIndex })),
      moonRashiIndex: 1
    });
    const wealth = buildPersonalizedWealthText("en", 0, "Rahu", "Jupiter", {
      planets: chart1Planets.map(p => ({ name: p.graha, house: p.house, rashiIndex: p.rashiIndex })),
      moonRashiIndex: 1
    });
    const health = buildPersonalizedHealthText("en", 0, "Rahu", "Jupiter", {
      planets: chart1Planets.map(p => ({ name: p.graha, house: p.house, rashiIndex: p.rashiIndex })),
      moonRashiIndex: 1
    });

    expect(career).toContain("10th house (Makara)");
    expect(career).toContain("Shani");
    expect(wealth).toContain("2nd house");
    expect(wealth).toContain("Shukra"); // 2nd lord for Aries is Venus/Shukra
    expect(health).toContain("Kuja"); // Lagna lord for Aries is Mars/Kuja
  });

  it('strictly handles Young Child (Devotee 3, Age 5) with zero adult marriage or progeny content', () => {
    const k3 = analyzeKundali({
      lagnaRashiIndex: 4, // Leo
      moonRashiIndex: 2, // Gemini
      natalPlanets: chart3Planets,
      ageYears: 5,
      gender: "Male",
      lang: "en"
    });

    const edText = buildDynamicChildEducationFallback(k3);
    const actText = buildDynamicChildActivitiesFallback(k3);

    // Verify education and activities are computed from 4th, 5th, and 3rd houses
    expect(edText).toContain("4th house of foundational learning (Vrischika");
    expect(edText).toContain("5th house of intellect (Dhanu");
    expect(actText).toContain("3rd house of vitality (Tula");

    // Crucial: Must NOT contain adult marriage or progeny wording
    expect(edText.toLowerCase()).not.toContain("wedding");
    expect(edText.toLowerCase()).not.toContain("spouse");
    expect(actText.toLowerCase()).not.toContain("conception");
    expect(actText.toLowerCase()).not.toContain("marital");
  });

  it('computes live Gochara transits accurately for Devotee 1 and Devotee 2', () => {
    const k1 = analyzeKundali({
      lagnaRashiIndex: 0,
      moonRashiIndex: 1,
      natalPlanets: chart1Planets,
      transits: transits1,
      lang: "en"
    });

    const k2 = analyzeKundali({
      lagnaRashiIndex: 5,
      moonRashiIndex: 9,
      natalPlanets: chart2Planets,
      transits: transits2,
      lang: "en"
    });

    const gochara1 = buildDynamicGocharaFallback(k1);
    const gochara2 = buildDynamicGocharaFallback(k2);

    expect(gochara1.length).toBeGreaterThanOrEqual(2);
    expect(gochara2.length).toBeGreaterThanOrEqual(2);

    // Devotee 2 has Jupiter in 5th from Moon -> Guru Bala active
    const guruItem2 = gochara2.find(g => g.name.includes("Jupiter"));
    expect(guruItem2?.impact).toContain("Guru Bala is active");

    // Devotee 2 has Saturn in 2nd from Moon -> Sade Sati phase
    const shaniItem2 = gochara2.find(g => g.name.includes("Saturn"));
    expect(shaniItem2?.impact).toContain("heightened karmic discipline");
  });

  it('generates completely non-identical fallback readings across all 4 devotees (100% dynamic)', () => {
    const k1 = analyzeKundali({ lagnaRashiIndex: 0, moonRashiIndex: 1, natalPlanets: chart1Planets, ageYears: 28, lang: "en" });
    const k2 = analyzeKundali({ lagnaRashiIndex: 5, moonRashiIndex: 9, natalPlanets: chart2Planets, ageYears: 34, lang: "en" });
    const k4 = analyzeKundali({ lagnaRashiIndex: 7, moonRashiIndex: 11, natalPlanets: chart4Planets, ageYears: 62, lang: "en" });

    const char1 = buildDynamicCharacteristicsFallback(k1);
    const char2 = buildDynamicCharacteristicsFallback(k2);
    const char4 = buildDynamicCharacteristicsFallback(k4);

    expect(char1).not.toBe(char2);
    expect(char2).not.toBe(char4);
    expect(char1).not.toBe(char4);

    expect(char1).toContain("Mesha");
    expect(char2).toContain("Kanya");
    expect(char4).toContain("Vrischika");

    const sec1 = buildDynamicDarkSecretFallback(k1);
    const sec2 = buildDynamicDarkSecretFallback(k2);
    const sec4 = buildDynamicDarkSecretFallback(k4);

    expect(sec1).not.toBe(sec2);
    expect(sec2).not.toBe(sec4);
    expect(sec1).toContain("Vrischika"); // 8th house for Aries is Scorpio
    expect(sec2).toContain("Mesha"); // 8th house for Virgo is Aries
    expect(sec4).toContain("Mithuna"); // 8th house for Scorpio is Gemini
  });
});
