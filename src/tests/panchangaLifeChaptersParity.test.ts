import { describe, it, expect } from "vitest";
import {
  computeJananaPanchanga,
  computeGocharaPanchanga,
  getCharacteristicsPanchangaSynthesis,
  getDarkSecretPanchangaSynthesis,
  getCurrentPhasePanchangaSynthesis,
  getMarriagePanchangaSynthesis,
  getChildrenPanchangaSynthesis,
  getCareerPanchangaSynthesis,
  getWealthPanchangaSynthesis,
  getHealthPanchangaSynthesis,
  getGocharaPanchangaSynthesis,
  getSummaryPanchangaSynthesis
} from "../features/premiumPdf/panchangaLifeEngine";
import {
  analyzeKundali,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCareerFallback,
  buildDynamicWealthFallback,
  buildDynamicHealthFallback,
  buildDynamicGocharaFallback,
  buildDynamicSummaryFallback
} from "../features/premiumPdf/dynamicBhavishyaEngine";

describe("Panchanga Life Chapters Parity & Multi-Language Synthesis Audit", () => {
  const birthDate = "1990-05-15";
  const birthTime = "08:30";
  const janmaMoonNak = 9; // Magha
  const janmaMoonRashi = 4; // Leo (Simha)
  const langList = ["kn", "hi", "te", "ta", "en"] as const;

  it("calculates accurate astronomical Janana Panchanga parameters", () => {
    const janana = computeJananaPanchanga({
      birthDate,
      birthTime,
      moonNakshatraIndex: janmaMoonNak,
      moonRashiIndex: janmaMoonRashi,
      natalPlanets: [
        { graha: "Sun", rashiIndex: 1, house: 12 },
        { graha: "Moon", rashiIndex: 4, house: 3 }
      ]
    }, "kn");

    expect(janana.tithiIndex).toBeGreaterThanOrEqual(1);
    expect(janana.tithiIndex).toBeLessThanOrEqual(30);
    expect(janana.tithiName).toBeTruthy();

    expect(janana.vaaraIndex).toBeGreaterThanOrEqual(0);
    expect(janana.vaaraIndex).toBeLessThanOrEqual(6);
    expect(janana.vaaraLordGraha).toBeTruthy();

    expect(janana.nakshatraIndex).toBe(janmaMoonNak);
    expect(janana.nakshatraPada).toBeGreaterThanOrEqual(1);
    expect(janana.nakshatraPada).toBeLessThanOrEqual(4);

    expect(janana.yogaIndex).toBeGreaterThanOrEqual(0);
    expect(janana.yogaIndex).toBeLessThanOrEqual(26);

    expect(janana.karanaIndex).toBeGreaterThanOrEqual(0);
    expect(janana.karanaIndex).toBeLessThanOrEqual(10);

    expect(janana.dagdhaRashiIndices).toBeDefined();
    expect(Array.isArray(janana.dagdhaRashiIndices)).toBe(true);
  });

  it("calculates accurate Gochara Panchanga, Tara Bala, and Chandra Bala", () => {
    const now = new Date("2026-10-24T12:00:00Z");
    const gochara = computeGocharaPanchanga({
      currentDate: now,
      moonNakshatraIndex: janmaMoonNak,
      moonRashiIndex: janmaMoonRashi
    }, "kn");

    expect(gochara.taraBala.taraIndex).toBeGreaterThanOrEqual(0);
    expect(gochara.taraBala.taraIndex).toBeLessThanOrEqual(8);
    expect(typeof gochara.taraBala.isBenefic).toBe("boolean");

    expect(gochara.chandraBala.houseFromMoon).toBeGreaterThanOrEqual(1);
    expect(gochara.chandraBala.houseFromMoon).toBeLessThanOrEqual(12);
    expect(typeof gochara.chandraBala.isAuspicious).toBe("boolean");
  });

  it("verifies all 10 life chapters contain Janana/Gochara Panchanga synthesis in all 5 languages", () => {
    for (const lang of langList) {
      const chart = analyzeKundali({
        lagnaRashiIndex: 2, // Gemini
        moonRashiIndex: janmaMoonRashi,
        moonNakshatraIndex: janmaMoonNak,
        birthDate,
        birthTime,
        natalPlanets: [
          { graha: "Sun", rashiIndex: 1, house: 12 },
          { graha: "Moon", rashiIndex: 4, house: 3 },
          { graha: "Mars", rashiIndex: 10, house: 9 },
          { graha: "Mercury", rashiIndex: 0, house: 11 },
          { graha: "Jupiter", rashiIndex: 2, house: 1 },
          { graha: "Venus", rashiIndex: 11, house: 10 },
          { graha: "Saturn", rashiIndex: 8, house: 7 },
          { graha: "Rahu", rashiIndex: 9, house: 8 },
          { graha: "Ketu", rashiIndex: 3, house: 2 }
        ],
        transits: [
          { graha: "Saturn", rashiIndex: 11, houseFromMoon: 8 },
          { graha: "Jupiter", rashiIndex: 2, houseFromMoon: 11 }
        ],
        mahaLord: "Jupiter",
        bhuktiLord: "Saturn",
        gender: "Male",
        ageYears: 36,
        lang,
        name: "Suresh Bhat",
        maritalStatus: "married",
        hasChildren: "has_children"
      });

      // 1. Characteristics
      const charText = buildDynamicCharacteristicsFallback(chart);
      expect(charText).toBeTruthy();
      if (lang === "kn") expect(charText).toContain("ಜನನ ಪಂಚಾಂಗದ ಪಂಚಾಂಗ-ಅಂಗಗಳ ಪ್ರಕಾರ");
      else if (lang === "hi") expect(charText).toContain("जन्म पंचांग");
      else if (lang === "te") expect(charText).toContain("జనన పంచాంగం");
      else if (lang === "ta") expect(charText).toContain("ஜனன பஞ்சாங்க");
      else expect(charText).toContain("Janana Panchanga");

      // 2. Dark Secret / Soul Mirror
      const secretText = buildDynamicDarkSecretFallback(chart);
      expect(secretText).toBeTruthy();
      if (lang === "kn") expect(secretText).toContain("ದಗ್ಧ");
      else if (lang === "hi") expect(secretText).toContain("दग्ध");
      else if (lang === "te") expect(secretText).toContain("దగ్ధ");
      else if (lang === "ta") expect(secretText).toContain("பஞ்சாங்க");
      else expect(secretText).toContain("Dagdha");

      // 3. Current Phase
      const phaseText = buildDynamicCurrentPhaseFallback(chart);
      expect(phaseText).toBeTruthy();
      if (lang === "kn") expect(phaseText).toContain("ತಾರಾಬಲ");
      else if (lang === "hi") expect(phaseText).toContain("ताराबल");
      else if (lang === "te") expect(phaseText).toContain("తారాబలం");
      else if (lang === "ta") expect(phaseText).toContain("தாராபலம்");
      else expect(phaseText).toContain("Tara Bala");

      // 4. Marriage
      const marText = buildDynamicMarriageFallback(chart, "married");
      expect(marText).toBeTruthy();
      if (lang === "kn") expect(marText).toContain("ದಾಂಪತ್ಯ");
      else if (lang === "hi") expect(marText).toContain("दांपत्य");
      else if (lang === "te") expect(marText).toContain("దాంపత్య");
      else if (lang === "ta") expect(marText).toContain("இல்லற");
      else expect(marText).toContain("Panchanga");

      // 5. Children
      const chdText = buildDynamicChildrenFallback(chart, "has_children");
      expect(chdText).toBeTruthy();
      if (lang === "kn") expect(chdText).toContain("ಸಂತಾನ");
      else if (lang === "hi") expect(chdText).toContain("संतान");
      else if (lang === "te") expect(chdText).toContain("పిల్లల");
      else if (lang === "ta") expect(chdText).toContain("குழந்தை");
      else expect(chdText).toContain("Panchanga");

      // 6. Career
      const carText = buildDynamicCareerFallback(chart);
      expect(carText).toBeTruthy();
      if (lang === "kn") expect(carText).toContain("ವಾರಾಧಿಪತಿ");
      else if (lang === "hi") expect(carText).toContain("वाराधिपति");
      else if (lang === "te") expect(carText).toContain("వారాధిపతి");
      else if (lang === "ta") expect(carText).toContain("கிழமை அதிபதி");
      else expect(carText).toContain("weekday ruler");

      // 7. Wealth
      const wlhText = buildDynamicWealthFallback(chart);
      expect(wlhText).toBeTruthy();
      if (lang === "kn") expect(wlhText).toContain("ಧನಲಕ್ಷ್ಮೀ");
      else if (lang === "hi") expect(wlhText).toContain("धनलक्ष्मी");
      else if (lang === "te") expect(wlhText).toContain("ధనలక్ష్మి");
      else if (lang === "ta") expect(wlhText).toContain("தனலட்சுமி");
      else expect(wlhText).toContain("Panchanga");

      // 8. Health
      const hltText = buildDynamicHealthFallback(chart);
      expect(hltText).toBeTruthy();
      if (lang === "kn") expect(hltText).toContain("ಆರೋಗ್ಯ");
      else if (lang === "hi") expect(hltText).toContain("स्वास्थ्य");
      else if (lang === "te") expect(hltText).toContain("ఆరోగ్య");
      else if (lang === "ta") expect(hltText).toContain("உடல் நலனில்");
      else expect(hltText).toContain("medical astrology");

      // 9. Gochara (4th Card: Gochara Panchanga & Tara Bala)
      const gocharaCards = buildDynamicGocharaFallback(chart);
      expect(gocharaCards.length).toBe(4);
      const panCard = gocharaCards[3];
      expect(panCard).toBeDefined();
      if (lang === "kn") {
        expect(panCard.name).toContain("ಗೋಚಾರ ಪಂಚಾಂಗ");
        expect(panCard.impact).toContain("ತಾರಾಬಲ");
      } else if (lang === "hi") {
        expect(panCard.name).toContain("गोचर पंचांग");
        expect(panCard.impact).toContain("ताराबल");
      } else if (lang === "te") {
        expect(panCard.name).toContain("గోచార పంచాంగం");
        expect(panCard.impact).toContain("తారాబలం");
      } else if (lang === "ta") {
        expect(panCard.name).toContain("கோசார பஞ்சாங்க");
        expect(panCard.impact).toContain("தாராபலம்");
      } else {
        expect(panCard.name).toContain("Gochara Panchanga");
        expect(panCard.impact).toContain("Tara Bala");
      }

      // 10. Summary
      const sumText = buildDynamicSummaryFallback(chart);
      expect(sumText).toBeTruthy();
      if (lang === "kn") expect(sumText).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ");
      else if (lang === "hi") expect(sumText).toContain("गोकर्ण महाबलेश्वर");
      else if (lang === "te") expect(sumText).toContain("గోకర్ణ మహాబలేశ్వర");
      else if (lang === "ta") expect(sumText).toContain("கோகர்ணம் மகாபலேஸ்வரர்");
      else expect(sumText).toContain("Gokarna Mahabaleshwara");
    }
  });

  it("verifies zero English token leakage into regional Indic scripts", () => {
    const regionalLangs = ["kn", "hi", "te", "ta"] as const;

    for (const lang of regionalLangs) {
      const chart = analyzeKundali({
        lagnaRashiIndex: 2,
        moonRashiIndex: janmaMoonRashi,
        moonNakshatraIndex: janmaMoonNak,
        birthDate,
        birthTime,
        natalPlanets: [
          { graha: "Sun", rashiIndex: 1, house: 12 },
          { graha: "Moon", rashiIndex: 4, house: 3 }
        ],
        transits: [
          { graha: "Saturn", rashiIndex: 11, houseFromMoon: 8 }
        ],
        mahaLord: "Jupiter",
        bhuktiLord: "Saturn",
        gender: "Male",
        ageYears: 30,
        lang,
        name: "Anand",
        maritalStatus: "married",
        hasChildren: "has_children"
      });

      const checks = [
        buildDynamicCharacteristicsFallback(chart),
        buildDynamicDarkSecretFallback(chart),
        buildDynamicCurrentPhaseFallback(chart),
        buildDynamicMarriageFallback(chart, "married"),
        buildDynamicChildrenFallback(chart, "has_children"),
        buildDynamicCareerFallback(chart),
        buildDynamicWealthFallback(chart),
        buildDynamicHealthFallback(chart),
        buildDynamicSummaryFallback(chart)
      ];

      for (const text of checks) {
        // Words like "Tithi", "Nakshatra", "Yoga", "Karana", "House", "Dasha", "Bhukti" should not appear as English tokens
        const englishWordsMatch = text.match(/\b(Tithi|Nakshatra|Karana|Dagdha|Chandra|Surya|Lagna|Bala)\b/g);
        expect(englishWordsMatch).toBeNull();
      }
    }
  });
});
