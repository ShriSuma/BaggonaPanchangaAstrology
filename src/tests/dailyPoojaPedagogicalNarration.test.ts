/**
 * Daily Vedic Pooja & Sankalpa - Pedagogical Voice Narration & Audio Flow Audit
 * 
 * Verifies User Audio Mandate (2026-09-25):
 * 1. Audio starts from the beginning (Step 1):
 *    "ದೇವರಿಗೆ ಎರಡೂ ಕೈಯನ್ನು ಮುಗಿದು ನಮಸ್ಕರಿಸಿ. ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಮನಸ್ಸಿನಲ್ಲಿ ದೇವರನ್ನು ಸ್ಮರಣೆ ಮಾಡಿ."
 * 2. Recites sacred mantra clearly.
 * 3. Instructs ritual physical action (taking akshate, holding close to heart, offering to lotus feet, waving arati).
 * 4. Explains "With this what will happen" (Spiritual significance and cosmic benefits).
 * 5. Prompts devotee to click "ಮುಂದಿನ ಹಂತ" (Next Step) to proceed.
 * 6. Announces the Desha-Kaala Sankalpa with live personal devotee & Panchanga coordinates.
 * 7. Verified across all 5 languages (kn, hi, te, ta, en) so beginners of any age (2, 10, or 30 years old) can easily follow.
 */

import { describe, it, expect } from "vitest";
import { buildDailyPoojaSteps } from "../features/seva/dailySankalpaPoojaEngine";
import {
  getStepNarrationText,
  BENEFIT_INTRO,
  DEFAULT_NEXT_STEP_PROMPTS
} from "../components/darshana/DailyPoojaSankalpaModal";
import type { SevaLang } from "../features/seva/sevaLocale";

describe("Daily Vedic Pooja - Pedagogical Voice Narration Audit", () => {
  const sampleParams = {
    devoteeName: "ಶ್ರೀನಿವಾಸ",
    gotra: "ವಿಶ್ವಾಮಿತ್ರ",
    rashiName: "ಧನು",
    nakshatraName: "ಮೂಲ",
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    samvatsara: "ಪರಾಭವ",
    masa: "ಶ್ರಾವಣ",
    tithi: "ಏಕಾದಶೀ"
  };

  it("Step 1 audio narration begins with the exact user requested greeting and posture", () => {
    const steps = buildDailyPoojaSteps({ ...sampleParams, lang: "kn" });
    const step1Text = getStepNarrationText(steps[0], "kn");

    // Exact user phrasing from audio request
    expect(step1Text).toContain("ದೇವರಿಗೆ ಎರಡೂ ಕೈಯನ್ನು ಮುಗಿದು ನಮಸ್ಕರಿಸಿ");
    expect(step1Text).toContain("ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ, ಮನಸ್ಸಿನಲ್ಲಿ ದೇವರನ್ನು ಸ್ಮರಣೆ ಮಾಡಿ");
    // Deepa prajwalane
    expect(step1Text).toContain("ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ");
    // What will happen with this
    expect(step1Text).toContain(BENEFIT_INTRO.kn);
    expect(step1Text).toContain(steps[0].spiritualSignificance.kn);
    // Next step prompt
    expect(step1Text).toContain("ಮುಂದಿನ ಹಂತ");
  });

  it("Step 2 audio narration instructs devotee to pick up akshate and flowers, then invokes Guru & Ganapati", () => {
    const steps = buildDailyPoojaSteps({ ...sampleParams, lang: "kn" });
    const step2Text = getStepNarrationText(steps[1], "kn");

    expect(step2Text).toContain("ಬಲಗೈಯಲ್ಲಿ ಸ್ವಲ್ಪ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ತಾಜಾ ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ");
    expect(step2Text).toContain("ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ");
    expect(step2Text).toContain(BENEFIT_INTRO.kn);
    expect(step2Text).toContain(steps[1].spiritualSignificance.kn);
    expect(step2Text).toContain("ಮುಂದಿನ ಹಂತ");
  });

  it("Step 3 audio narration announces the beginning of Maha Sankalpa with live Panchanga details", () => {
    const steps = buildDailyPoojaSteps({ ...sampleParams, lang: "kn" });
    const step3Text = getStepNarrationText(steps[2], "kn");

    // Clear pedagogical announcement of Sankalpa
    expect(step3Text).toContain("ಈಗ ನಾವು ಇಂದಿನ ಪವಿತ್ರ ಮಹಾ ಸಂಕಲ್ಪವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತಿದ್ದೇವೆ");
    expect(step3Text).toContain("ವಿವರಗಳೊಂದಿಗೆ ಸಂಕಲ್ಪವನ್ನು ನೆರವೇರಿಸಲಾಗುವುದು");
    expect(step3Text).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(step3Text).toContain("ಪರಾಭವ");
    expect(step3Text).toContain("ವಿಶ್ವಾಮಿತ್ರ");
    expect(step3Text).toContain("ಶ್ರೀನಿವಾಸ");
    expect(step3Text).toContain(BENEFIT_INTRO.kn);
    expect(step3Text).toContain(steps[2].spiritualSignificance.kn);
    expect(step3Text).toContain("ಮುಂದಿನ ಹಂತ");
  });

  it("Step 4 audio narration instructs offering akshate to the Lotus Feet of the Deity", () => {
    const steps = buildDailyPoojaSteps({ ...sampleParams, lang: "kn" });
    const step4Text = getStepNarrationText(steps[3], "kn");

    expect(step4Text).toContain("ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ಪುಷ್ಪಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ದೇವರ ಪಾದಾರವಿಂದಗಳಿಗೆ ಸಮರ್ಪಿಸಿ");
    expect(step4Text).toContain("ಶ್ರೀ ಸಾಂಬಸದಾಶಿವಾರ್ಪಣಮಸ್ತು");
    expect(step4Text).toContain(BENEFIT_INTRO.kn);
    expect(step4Text).toContain(steps[3].spiritualSignificance.kn);
    expect(step4Text).toContain("ಮುಂದಿನ ಹಂತ");
  });

  it("Step 5 audio narration instructs waving Mangalarati, bowing in Sashtanga Namaskara, and concluding pooja", () => {
    const steps = buildDailyPoojaSteps({ ...sampleParams, lang: "kn" });
    const step5Text = getStepNarrationText(steps[4], "kn");

    expect(step5Text).toContain("ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ");
    expect(step5Text).toContain("ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ");
    expect(step5Text).toContain("ಕರ್ಪೂರಗೌರಂ");
    expect(step5Text).toContain(BENEFIT_INTRO.kn);
    expect(step5Text).toContain(steps[4].spiritualSignificance.kn);
    expect(step5Text).toContain("ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ");
  });

  it("guarantees full pedagogical structure across all 5 languages (kn, hi, te, ta, en)", () => {
    const languages: SevaLang[] = ["kn", "hi", "te", "ta", "en"];

    languages.forEach((lang) => {
      const steps = buildDailyPoojaSteps({
        devoteeName: "Devotee",
        gotra: "Kashyapa",
        rashiName: "Dhanu",
        nakshatraName: "Moola",
        lang
      });

      expect(steps.length).toBe(5);

      for (let i = 0; i < 5; i++) {
        const narration = getStepNarrationText(steps[i], lang);
        expect(narration.length).toBeGreaterThan(60);

        // Contains Benefit intro
        expect(narration).toContain(BENEFIT_INTRO[lang]);

        // Contains spiritual significance
        expect(narration).toContain(steps[i].spiritualSignificance[lang]);

        // Contains next step prompt
        const prompt = steps[i].nextStepPrompt?.[lang] || DEFAULT_NEXT_STEP_PROMPTS[lang][steps[i].step];
        expect(narration).toContain(prompt);
      }
    });
  });
});
