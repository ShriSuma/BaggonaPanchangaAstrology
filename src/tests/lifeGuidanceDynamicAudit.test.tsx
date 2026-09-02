import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { T_LIFE_GUIDANCE, getLifeGuidanceText } from "../features/lifeguidance/lifeGuidanceLocale";
import {
  executeLifeGuidanceCalculation,
  askCustomLifeQuestion,
  getDynamicGokarnaPuja,
  LifeGuidanceInput
} from "../features/lifeguidance/lifeGuidanceEngine";
import { LifeGuidancePdfTemplate } from "../components/lifeguidance/LifeGuidancePdfTemplate";

describe("LifeGuidance Dynamic & Kundli Accuracy Audit (ವೈಯಕ್ತಿಕ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ)", () => {
  const gokarnaSample: LifeGuidanceInput = {
    personName: "Pramod Bhat",
    dob: "1993-05-31",
    tob: "09:25",
    lat: 14.5479,
    lon: 74.3188,
    gender: "Male",
    lang: "kn"
  };

  it("locale dictionary has complete 5-language coverage for all UI keys", () => {
    const requiredLanguages = ["kn", "en", "hi", "te", "ta"];
    const allKeys = Object.keys(T_LIFE_GUIDANCE);

    expect(allKeys.length).toBeGreaterThanOrEqual(20);

    allKeys.forEach((key) => {
      const entry = T_LIFE_GUIDANCE[key];
      requiredLanguages.forEach((lang) => {
        expect(entry[lang], `Missing '${lang}' translation for key '${key}'`).toBeDefined();
        expect(entry[lang].trim().length, `Empty '${lang}' translation for key '${key}'`).toBeGreaterThan(0);
      });
    });

    // Helper lookup verification
    expect(getLifeGuidanceText("pageTitle", "kn")).toContain("ವೈಯಕ್ತಿಕ ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ");
    expect(getLifeGuidanceText("pageTitle", "en")).toContain("Hyper-Personalized Life Guidance");
    expect(getLifeGuidanceText("pageTitle", "hi")).toContain("व्यक्तिगत परिपूर्ण जीवन मार्गदर्शन");
    expect(getLifeGuidanceText("pageTitle", "te")).toContain("వ్యక్తిగత పరిపూర్ణ జీవన మార్గదర్శనం");
    expect(getLifeGuidanceText("pageTitle", "ta")).toContain("தனிப்பட்ட முழுமையான வாழ்க்கை வழிகாட்டுதல்");
  });

  it("calculates authentic Lagna (Ascendant) accurately from calculateKundli (not Sun sign)", async () => {
    const res = await executeLifeGuidanceCalculation(gokarnaSample);

    // 1993-05-31 09:25 IST in Gokarna has Karkataka (Cancer) Lagna, Kanya (Virgo) Moon Rashi, Hasta Nakshatra
    expect(res.lagna.kn).toContain("ಕರ್ಕಾಟಕ ಲಗ್ನ");
    expect(res.lagna.en).toContain("Cancer Ascendant");
    expect(res.lagna.hi).toContain("कर्क लग्न");
    expect(res.lagna.te).toContain("కర్కాటకం లగ్నం");
    expect(res.lagna.ta).toContain("கடகம் லக்னம்");

    expect(res.rashi.kn).toContain("ಕನ್ಯಾ ರಾಶಿ");
    expect(res.rashi.en).toContain("Virgo Rashi");

    expect(res.kundliSnapshot).toBeDefined();
    expect(res.kundliSnapshot?.lagnaIndex).toBe(3); // Cancer is index 3
    expect(res.kundliSnapshot?.moonRashiIndex).toBe(5); // Virgo is index 5
    expect(res.kundliSnapshot?.tenthLord).toBe("Mars"); // 10th house from Cancer is Aries (ruled by Mars)
    expect(res.kundliSnapshot?.seventhLord).toBe("Saturn"); // 7th house from Cancer is Capricorn (ruled by Saturn)
  });

  it("generates authentic 4 life domains with astrologically derived milestone ages", async () => {
    const res = await executeLifeGuidanceCalculation(gokarnaSample);

    // 1. Career (10th House)
    expect(res.career).toBeDefined();
    expect(res.career.title.kn).toContain("ವೃತ್ತಿ ಮಾರ್ಗ ಹಾಗೂ ಧನ ಯೋಗ");
    expect(res.career.title.en).toContain("Career Path & Wealth Forecast");
    expect(res.career.keyAges.length).toBeGreaterThanOrEqual(3);
    expect(res.career.narrativeText).toContain("ದಶಮಾಧಿಪತಿ");

    // 2. Relationship (7th House)
    expect(res.relationship).toBeDefined();
    expect(res.relationship.title.kn).toContain("ದಾಂಪತ್ಯ ಅನುಕೂಲತೆ");
    expect(res.relationship.title.en).toContain("Marriage Compatibility");
    expect(res.relationship.keyAges.length).toBeGreaterThanOrEqual(3);

    // 3. Health (6th House)
    expect(res.health).toBeDefined();
    expect(res.health.title.kn).toContain("ಆರೋಗ್ಯ ದೀರ್ಘಾಯುಷ್ಯ");
    expect(res.health.title.en).toContain("Health, Longevity");
    expect(res.health.keyAges.length).toBeGreaterThanOrEqual(3);

    // 4. Children (5th House)
    expect(res.children).toBeDefined();
    expect(res.children.title.kn).toContain("ಸಂತಾನ ಭಾಗ್ಯ");
    expect(res.children.title.en).toContain("Children, Lineage");
    expect(res.children.keyAges.length).toBeGreaterThanOrEqual(3);
  });

  it("provides comprehensive 5-language Gokarna Puja details for all domains", () => {
    const categories: ("career" | "relationship" | "health" | "children" | "custom")[] = [
      "career",
      "relationship",
      "health",
      "children",
      "custom"
    ];
    const languages = ["kn", "en", "hi", "te", "ta"];

    categories.forEach((cat) => {
      const puja = getDynamicGokarnaPuja("Virgo", "Hasta", "Moon", cat);
      expect(puja.pujaName).toBeDefined();
      expect(puja.whyRequired).toBeDefined();
      expect(puja.whatSignificance).toBeDefined();
      expect(puja.howTransforms).toBeDefined();

      languages.forEach((lang) => {
        expect(puja.pujaName[lang], `Missing pujaName in ${lang} for ${cat}`).toBeDefined();
        expect(puja.whyRequired[lang], `Missing whyRequired in ${lang} for ${cat}`).toBeDefined();
        expect(puja.whatSignificance[lang], `Missing whatSignificance in ${lang} for ${cat}`).toBeDefined();
        expect(puja.howTransforms[lang], `Missing howTransforms in ${lang} for ${cat}`).toBeDefined();
      });
    });
  });

  it("handles custom astrological question in all 5 languages with fallback", async () => {
    const res = await executeLifeGuidanceCalculation(gokarnaSample);

    const ansKn = await askCustomLifeQuestion(res, "ನನ್ನ ಹೊಸ ವ್ಯಾಪಾರ ಶುಭವೇ?", "kn");
    expect(ansKn).toContain("ವ್ಯಾಪಾರ");
    expect(ansKn).toContain("ಗೋಕರ್ಣ");

    const ansEn = await askCustomLifeQuestion(res, "Will I get promotion this year?", "en");
    expect(ansEn).toContain("Gokarna");

    const ansHi = await askCustomLifeQuestion(res, "क्या मेरी पदोन्नति होगी?", "hi");
    expect(ansHi).toContain("गोकर्ण");

    const ansTe = await askCustomLifeQuestion(res, "నా ఉద్యోగంలో ప్రమోషన్ వస్తుందా?", "te");
    expect(ansTe).toContain("గోకర్ణ");

    const ansTa = await askCustomLifeQuestion(res, "எனக்கு வேலை உயர்வு கிடைக்குமா?", "ta");
    expect(ansTa).toContain("கோகர்ண");
  });

  it("renders LifeGuidancePdfTemplate with exactly 2 A4 pages in all 5 languages", async () => {
    const res = await executeLifeGuidanceCalculation(gokarnaSample);
    const languages = ["kn", "en", "hi", "te", "ta"];

    languages.forEach((lang) => {
      const { container } = render(
        <LifeGuidancePdfTemplate result={res} activeTab="career" lang={lang} />
      );

      const pages = container.querySelectorAll(".pdf-page-a4");
      expect(pages.length, `Expected 2 PDF pages for ${lang}`).toBe(2);

      // Verify contact number presence
      expect(container.textContent).toContain("+91 99723 39362");
    });
  });
});
