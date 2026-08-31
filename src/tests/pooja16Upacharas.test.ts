import { describe, it, expect } from "vitest";
import { POOJA_16_UPACHARES } from "../features/seva/poojaUpacharaEngine";
import { getPriestStepSpeechText } from "../features/seva/priestAudioNarrator";

describe("16-Upachara Comprehensive Daily Deva Pooja Engine", () => {
  const params = {
    devoteeName: "ಶಿವಪ್ರಸಾದ್",
    gotra: "ವಿಶ್ವಾಮಿತ್ರ",
    rashiName: "ಮೇಷ",
    nakshatraName: "ಅಶ್ವಿನಿ",
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    lang: "kn" as const
  };

  it("generates exactly 16 authentic Vedic Upachara steps", () => {
    const steps = POOJA_16_UPACHARES(params);
    expect(steps).toHaveLength(16);

    // Verify all steps are ordered 1 to 16
    steps.forEach((step, idx) => {
      expect(step.step).toBe(idx + 1);
      expect(step.sanskritMantra).toBeTruthy();
      expect(step.titleKn).toBeTruthy();
      expect(step.actionGuide.kn).toBeTruthy();
      expect(step.spiritualSignificance.kn).toBeTruthy();
      expect(step.icon).toBeTruthy();
    });
  });

  it("personalizes Step 5 (Maha Sankalpa) with Devotee Janma Kundali and Gotra", () => {
    const steps = POOJA_16_UPACHARES(params);
    const sankalpaStep = steps.find((s) => s.step === 5);
    expect(sankalpaStep).toBeDefined();
    expect(sankalpaStep?.sanskritMantra).toContain("ಶಿವಪ್ರಸಾದ್");
    expect(sankalpaStep?.sanskritMantra).toContain("ವಿಶ್ವಾಮಿತ್ರ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಮೇಷ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಅಶ್ವಿನಿ");
    expect(sankalpaStep?.narrationText.kn).toContain("ಶಿವಪ್ರಸಾದ್");
    expect(sankalpaStep?.narrationText.kn).toContain("ವಿಶ್ವಾಮಿತ್ರ");
  });

  it("supports all 5 language translations across every step", () => {
    const steps = POOJA_16_UPACHARES(params);
    const languages = ["kn", "hi", "te", "ta", "en"] as const;

    steps.forEach((step) => {
      languages.forEach((lang) => {
        expect(step.narrationText[lang]).toBeTruthy();
        expect(step.actionGuide[lang]).toBeTruthy();
        expect(step.spiritualSignificance[lang]).toBeTruthy();
      });
    });
  });

  it("provides correct priest speech text through getPriestStepSpeechText for all 16 steps", () => {
    for (let stepNum = 1; stepNum <= 16; stepNum++) {
      const speech = getPriestStepSpeechText({
        ...params,
        step: stepNum
      });
      expect(speech.sanskritMantra).toBeTruthy();
      expect(speech.narrationText).toBeTruthy();
    }
  });

  it("includes classical temple actions (Achamana, Deepa, Bell, Abhisheka, Arathi, Namaskara)", () => {
    const steps = POOJA_16_UPACHARES(params);
    const stepKeys = steps.map((s) => s.key);
    expect(stepKeys).toContain("achamana");
    expect(stepKeys).toContain("deepa");
    expect(stepKeys).toContain("bell");
    expect(stepKeys).toContain("ganesha");
    expect(stepKeys).toContain("sankalpa");
    expect(stepKeys).toContain("kalasha");
    expect(stepKeys).toContain("aavahana");
    expect(stepKeys).toContain("snana");
    expect(stepKeys).toContain("vastra");
    expect(stepKeys).toContain("gandha");
    expect(stepKeys).toContain("akshata");
    expect(stepKeys).toContain("dhoopa");
    expect(stepKeys).toContain("naivedya");
    expect(stepKeys).toContain("arathi");
    expect(stepKeys).toContain("namaskara");
  });
});
