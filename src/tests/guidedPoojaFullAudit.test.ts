import { describe, it, expect } from "vitest";
import {
  GUIDED_POOJA_KEYS,
  GUIDED_POOJAS,
  getStepSpokenAudio,
  type GuidedPoojaStep
} from "../features/pooja/guidedPoojaData";
import {
  GUIDED_VRATA_KEYS,
  GUIDED_VRATAS
} from "../features/pooja/guidedVrataData";
import {
  SANKALPA_PURPOSES,
  buildSanskritSankalpaMantra,
  buildLocalizedSankalpaText
} from "../features/pooja/guidedSankalpaService";
import type { SevaLang } from "../features/seva/sevaLocale";

const SUPPORTED_LANGS: SevaLang[] = ["kn", "en", "te", "ta", "hi"];

// Helper regex to verify Devanagari script: Unicode range \u0900-\u097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

describe("Baggona Panchanga Comprehensive Pooja & Vrata Vedic Audit", () => {
  describe("AUDIT 1: All 5 Guided Poojas (Karnataka Smartha Gokarna Tradition)", () => {
    it("validates that all 5 poojas and their steps have pure Sanskrit Devanagari mantras and zero missing languages", () => {
      let totalPoojaSteps = 0;

      for (const poojaKey of GUIDED_POOJA_KEYS) {
        const pooja = GUIDED_POOJAS[poojaKey];
        expect(pooja, `Pooja ${poojaKey} must exist`).toBeDefined();
        expect(pooja.titleKn, `Pooja ${poojaKey} must have titleKn`).toBeTruthy();
        expect(pooja.subtitleKn, `Pooja ${poojaKey} must have subtitleKn`).toBeTruthy();
        expect(pooja.steps.length, `Pooja ${poojaKey} must have at least 4 steps`).toBeGreaterThanOrEqual(4);

        for (const step of pooja.steps) {
          totalPoojaSteps++;
          const stepLabel = `${poojaKey} Step ${step.step} (${step.titleKn})`;

          // 1. Mandatory Pure Sanskrit Mantra in Devanagari script
          expect(step.mantraSanskrit, `${stepLabel}: mantraSanskrit must exist`).toBeTruthy();
          expect(
            DEVANAGARI_REGEX.test(step.mantraSanskrit),
            `${stepLabel}: mantraSanskrit MUST contain Devanagari characters: "${step.mantraSanskrit.slice(0, 30)}..."`
          ).toBe(true);

          if (step.mantraSanskritPart2) {
            expect(
              DEVANAGARI_REGEX.test(step.mantraSanskritPart2),
              `${stepLabel}: mantraSanskritPart2 MUST contain Devanagari characters`
            ).toBe(true);
          }

          // 2. Multi-language on-screen reading mantras
          for (const lang of SUPPORTED_LANGS) {
            expect(
              step.mantraL5[lang],
              `${stepLabel}: mantraL5 missing for language ${lang}`
            ).toBeTruthy();
          }

          // 3. Spoken Audio Narrative Audit:
          // Must contain priest instructions in selected language + sacred mantra strictly in Sanskrit Devanagari
          for (const lang of SUPPORTED_LANGS) {
            const audioScript = getStepSpokenAudio(step, lang);
            expect(
              audioScript,
              `${stepLabel}: getStepSpokenAudio failed for lang ${lang}`
            ).toBeTruthy();

            // Mantra segment must be in Sanskrit Devanagari inside the audio script!
            expect(
              DEVANAGARI_REGEX.test(audioScript),
              `${stepLabel}: audio script for lang ${lang} MUST contain Sanskrit Devanagari mantra`
            ).toBe(true);

            // Instructions must be present
            const instr = step.audioInstructionL5?.[lang] || step.audioInstructionL5?.kn;
            expect(instr?.intro, `${stepLabel}: intro instruction missing for ${lang}`).toBeTruthy();
          }

          // 4. Physical action cues (👉)
          expect(step.actionCueKn, `${stepLabel}: actionCueKn must exist`).toBeTruthy();
          expect(step.actionCueEn, `${stepLabel}: actionCueEn must exist`).toBeTruthy();

          // 5. Background priest notes
          expect(step.hiddenPriestInstructionKn, `${stepLabel}: hiddenPriestInstructionKn must exist`).toBeTruthy();
        }
      }

      expect(totalPoojaSteps).toBe(29);
    });
  });

  describe("AUDIT 2: All 6 Sacred Vratas (ಪುಣ್ಯ ವ್ರತ ಮಹಾವಿಧಿ & ಫಲಶ್ರುತಿ)", () => {
    it("validates that all 6 Vratas have authentic Karnataka prayoga, phala, samagri, and Sanskrit mantras", () => {
      let totalVrataSteps = 0;

      for (const vrataKey of GUIDED_VRATA_KEYS) {
        const vrata = GUIDED_VRATAS[vrataKey];
        expect(vrata, `Vrata ${vrataKey} must exist`).toBeDefined();
        expect(vrata.titleKn, `Vrata ${vrataKey} must have Kannada title`).toBeTruthy();
        expect(vrata.subtitleKn, `Vrata ${vrataKey} must have Kannada subtitle`).toBeTruthy();
        expect(vrata.purposeKn, `Vrata ${vrataKey} must have Kannada purpose (ಉದ್ದೇಶ)`).toBeTruthy();
        expect(vrata.purposeEn, `Vrata ${vrataKey} must have English purpose`).toBeTruthy();
        expect(vrata.benefitsKn, `Vrata ${vrataKey} must have Kannada benefits (ಫಲಶ್ರುತಿ)`).toBeTruthy();
        expect(vrata.idealForKn, `Vrata ${vrataKey} must have target devotees (ಯಾರಿಗೆ ಸೂಕ್ತ)`).toBeTruthy();
        expect(vrata.timingKn, `Vrata ${vrataKey} must have auspicious timing (ಮುಹೂರ್ತ)`).toBeTruthy();

        // Samagri Checklist Audit
        expect(vrata.samagriList.length, `Vrata ${vrataKey} must have samagri items`).toBeGreaterThanOrEqual(5);
        for (const item of vrata.samagriList) {
          expect(item.id).toBeTruthy();
          expect(item.itemKn).toBeTruthy();
          expect(item.itemEn).toBeTruthy();
          expect(item.quantityKn).toBeTruthy();
          expect(["mandatory", "recommended", "optional"]).toContain(item.importance);
        }

        // Vrata Prayoga Steps Audit
        for (const step of vrata.steps) {
          totalVrataSteps++;
          const stepLabel = `${vrataKey} Step ${step.step} (${step.titleKn})`;

          // 1. Sanskrit Mantra in Devanagari
          expect(step.mantraSanskrit, `${stepLabel}: mantraSanskrit must exist`).toBeTruthy();
          expect(
            DEVANAGARI_REGEX.test(step.mantraSanskrit),
            `${stepLabel}: mantraSanskrit MUST contain Devanagari characters: "${step.mantraSanskrit.slice(0, 30)}..."`
          ).toBe(true);

          // 2. Reading script in 5 languages
          for (const lang of SUPPORTED_LANGS) {
            expect(step.mantraL5[lang], `${stepLabel}: mantraL5 missing for ${lang}`).toBeTruthy();
          }

          // 3. Audio generation: instructions in chosen lang + mantra in pure Sanskrit
          for (const lang of SUPPORTED_LANGS) {
            const audioScript = getStepSpokenAudio(step, lang);
            expect(DEVANAGARI_REGEX.test(audioScript), `${stepLabel}: audio script MUST contain Sanskrit`).toBe(true);
            const instr = step.audioInstructionL5?.[lang] || step.audioInstructionL5?.kn;
            expect(instr?.intro, `${stepLabel}: intro missing for ${lang}`).toBeTruthy();
          }

          // 4. Physical action cue & priest notes
          expect(step.actionCueKn, `${stepLabel}: actionCueKn must exist`).toBeTruthy();
          expect(step.hiddenPriestInstructionKn, `${stepLabel}: priest notes must exist`).toBeTruthy();
        }
      }

      expect(totalVrataSteps).toBeGreaterThanOrEqual(25);
    });
  });

  describe("AUDIT 3: Special Marriage Delay & 32-Year-Old Devotee Vrata Audit", () => {
    it("confirms Sri Kalyana Mangalagauri Vrata specifically addresses 32-year unmarried seeker with Swayamvara Parvati Japa", () => {
      const kalyana = GUIDED_VRATAS.kalyana_mangalagauri_vrata;
      expect(kalyana.titleKn).toContain("ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ");
      expect(kalyana.titleKn).toContain("ಸ್ವಯಂವರ ಪಾರ್ವತೀ");
      expect(kalyana.purposeKn).toContain("೩೨+ ವರ್ಷ");
      expect(kalyana.idealForKn).toContain("೩೨ ವರ್ಷ");
      expect(kalyana.benefitsKn).toContain("ಮನಮೆಚ್ಚಿದ ಗುಣವಂತ ಬಾಳಸಂಗಾತಿ");

      // Verify Swayamvara Parvati Mantra step
      const japaStep = kalyana.steps.find((s) => s.titleKn.includes("ಸ್ವಯಂವರ ಪಾರ್ವತೀ"));
      expect(japaStep).toBeDefined();
      expect(japaStep?.japaTarget).toBe(108);
      expect(japaStep?.mantraSanskrit).toContain("ॐ ह्रीं योगिनि योगिनि योगेश्वरि");
      expect(japaStep?.mantraSanskrit).toContain("मनोवाञ्छित वर/वधू प्राप्यर्थं");
      expect(japaStep?.mantraSanskrit).toContain("श्री स्वयंवरा पार्वत्यै नमः");

      // Verify 16-knot consecrated Dora thread step
      const doraStep = kalyana.steps.find((s) => s.titleKn.includes("ರಕ್ಷಾಸೂತ್ರ"));
      expect(doraStep).toBeDefined();
      expect(doraStep?.mantraSanskrit).toContain("दोरग्रन्थिषु संपूज्याः");
      expect(doraStep?.mantraSanskrit).toContain("इदं कङ्कणं शुभ्रं मङ्गलं पापनाशनम्");
    });
  });

  describe("AUDIT 4: Vedic Sankalpa Engine (ದೇಶ-ಕಾಲ ಸಂಕಲ್ಪ & ಜೀವಿತ ಗುರಿಗಳು)", () => {
    it("confirms all 8 life goals produce pure Sanskrit Devanagari Sankalpas with Smartha desha-kala preamble", () => {
      const allGoals = Object.keys(SANKALPA_PURPOSES) as (keyof typeof SANKALPA_PURPOSES)[];
      expect(allGoals).toHaveLength(8);

      for (const goalKey of allGoals) {
        const option = SANKALPA_PURPOSES[goalKey];
        expect(option.labelKn).toBeTruthy();
        expect(option.labelEn).toBeTruthy();
        expect(option.sanskritPhala).toBeTruthy();
        expect(DEVANAGARI_REGEX.test(option.sanskritPhala)).toBe(true);

        const sanskritMantra = buildSanskritSankalpaMantra({
          devoteeName: "ಶಿವಾನಂದ",
          gotra: "ವಿಶ್ವಾಮಿತ್ರ",
          purposeKey: goalKey,
          customGoal: goalKey === "custom" ? "ನೂತನ ವ್ಯಾಪಾರ ಆರಂಭ" : undefined
        });

        // Desha-Kala preamble check
        expect(sanskritMantra).toContain("ॐ अस्य श्री मन्महाविष्णोराज्ञया");
        expect(sanskritMantra).toContain("श्वेतवराहकल्पे वैवस्वतमन्वन्तरे");
        expect(sanskritMantra).toContain("भरतवर्षे भरतखण्डे");
        expect(sanskritMantra).toContain("गोत्रोत्पन्नस्य");
        expect(sanskritMantra).toContain("धर्मार्थ-काम-मोक्ष चतुर्विध पुरुषार्थ");
        expect(sanskritMantra).toContain("श्री परमेश्वर प्रीत्यर्थं");

        // Localized text check in Kannada and English
        const knText = buildLocalizedSankalpaText({
          devoteeName: "ಶಿವಾನಂದ",
          gotra: "ವಿಶ್ವಾಮಿತ್ರ",
          purposeKey: goalKey
        }, "kn");
        expect(knText.title).toContain("ಸಂಕಲ್ಪ");
        expect(knText.summary).toContain("ಶಿವಾನಂದ");

        const enText = buildLocalizedSankalpaText({
          devoteeName: "Shivananda",
          gotra: "Vishwamitra",
          purposeKey: goalKey
        }, "en");
        expect(enText.title).toContain("Sankalpa");
        expect(enText.summary).toContain("Shivananda");
      }
    });
  });
});
