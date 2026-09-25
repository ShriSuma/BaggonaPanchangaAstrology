import { describe, it, expect, beforeEach } from "vitest";
import { getOrComputeDinaBhavishya } from "../features/seva/dinaBhavishyaEngine";
import { useSankalpaStore } from "../features/sankalpa/sankalpaStore";
import { buildCleanDailyWhatsAppShareText } from "../features/darshana/dailyInspirationAlmanac";
import { getStepNarrationText } from "../components/darshana/DailyPoojaSankalpaModal";
import { buildDailyPoojaSteps } from "../features/seva/dailySankalpaPoojaEngine";
import type { SevaLang } from "../features/seva/sevaLocale";

describe("Daily Darshana 5-Language Switching & Reversibility Audit", () => {
  const ALL_LANGS: SevaLang[] = ["kn", "te", "ta", "hi", "en"];
  const TEST_DATE = "2026-09-25";

  beforeEach(() => {
    useSankalpaStore.setState({ sankalpas: [], isLoading: false, activeUserId: "" });
  });

  describe("1. Dina Bhavishya Engine Multi-Language Localization & Reversibility", () => {
    it("generates authentic localized astrology data across all 5 languages", async () => {
      for (const lang of ALL_LANGS) {
        const payload = await getOrComputeDinaBhavishya({
          targetDateRequested: TEST_DATE,
          devoteeName: "Suma",
          natalMoonRashi: 8, // Sagittarius (Dhanu)
          natalNakshatra: 18, // Moola
          lang,
          forceRegenerate: true
        });

        expect(payload).toBeDefined();
        expect(payload.targetDate).toBe(TEST_DATE);
        expect(payload.energyScore).toBeGreaterThanOrEqual(35);
        expect(payload.energyScore).toBeLessThanOrEqual(100);

        // Abhijit Muhurtha localization verification
        expect(payload.abhijitMuhurtha).toBeTruthy();
        if (lang === "kn") {
          expect(payload.abhijitMuhurtha).toContain("ಅಭಿಜಿತ್ ಮುಹೂರ್ತ");
        } else if (lang === "te") {
          expect(payload.abhijitMuhurtha).toContain("అభిజిత్ ముహూర్తం");
        } else if (lang === "ta") {
          expect(payload.abhijitMuhurtha).toContain("அபிஜித் முகூர்த்தம்");
        } else if (lang === "hi") {
          expect(payload.abhijitMuhurtha).toContain("अभिजित मुहूर्त");
        } else if (lang === "en") {
          expect(payload.abhijitMuhurtha).toContain("Abhijit Muhurtha");
        }

        // Chandra Bala and Tara Bala localization
        expect(payload.chandraBalaText).toBeTruthy();
        expect(payload.chandraBalaHouse).toBeGreaterThanOrEqual(1);
        expect(payload.chandraBalaHouse).toBeLessThanOrEqual(12);
        expect(payload.taraBalaText).toBeTruthy();
        expect(payload.taraBalaNumber).toBeGreaterThanOrEqual(1);
        expect(payload.taraBalaNumber).toBeLessThanOrEqual(9);

        // Priest blessing localization
        expect(payload.priestBlessing).toBeTruthy();
        if (lang === "kn") {
          expect(payload.priestBlessing).toContain("ಆಶೀರ್ವಚನ");
        } else if (lang === "te") {
          expect(payload.priestBlessing).toContain("ఆశీర్వచనం");
        } else if (lang === "ta") {
          expect(payload.priestBlessing).toContain("ஆசீர்வாதம்");
        } else if (lang === "hi") {
          expect(payload.priestBlessing).toContain("आशीर्वाद");
        } else if (lang === "en") {
          expect(payload.priestBlessing).toContain("Benediction");
        }
      }
    });

    it("verifies 100% clean reversibility: kn -> te -> ta -> hi -> kn restores identical Kannada state", async () => {
      const initialKn = await getOrComputeDinaBhavishya({
        targetDateRequested: TEST_DATE,
        devoteeName: "Shree",
        natalMoonRashi: 3,
        natalNakshatra: 7,
        lang: "kn",
        forceRegenerate: true
      });

      // Switch through all other languages
      await getOrComputeDinaBhavishya({ targetDateRequested: TEST_DATE, devoteeName: "Shree", natalMoonRashi: 3, natalNakshatra: 7, lang: "te", forceRegenerate: true });
      await getOrComputeDinaBhavishya({ targetDateRequested: TEST_DATE, devoteeName: "Shree", natalMoonRashi: 3, natalNakshatra: 7, lang: "ta", forceRegenerate: true });
      await getOrComputeDinaBhavishya({ targetDateRequested: TEST_DATE, devoteeName: "Shree", natalMoonRashi: 3, natalNakshatra: 7, lang: "hi", forceRegenerate: true });
      await getOrComputeDinaBhavishya({ targetDateRequested: TEST_DATE, devoteeName: "Shree", natalMoonRashi: 3, natalNakshatra: 7, lang: "en", forceRegenerate: true });

      // Switch back to Kannada
      const restoredKn = await getOrComputeDinaBhavishya({
        targetDateRequested: TEST_DATE,
        devoteeName: "Shree",
        natalMoonRashi: 3,
        natalNakshatra: 7,
        lang: "kn",
        forceRegenerate: true
      });

      expect(restoredKn.abhijitMuhurtha).toBe(initialKn.abhijitMuhurtha);
      expect(restoredKn.chandraBalaText).toBe(initialKn.chandraBalaText);
      expect(restoredKn.taraBalaText).toBe(initialKn.taraBalaText);
      expect(restoredKn.energyScore).toBe(initialKn.energyScore);
      expect(restoredKn.priestBlessing).toContain("ಆಶೀರ್ವಚನ");
    });
  });

  describe("2. Sankalpa Store Multi-Language Dynamic Adaptation & Reversibility", () => {
    it("dynamically adapts default seeded sankalpas to the active language upon loadSankalpas", async () => {
      const userId = "audit_user_lang_test";
      // 1. Initial Kannada load
      await useSankalpaStore.getState().loadSankalpas(userId, "Suma", "kn");
      const knSankalpas = useSankalpaStore.getState().sankalpas;
      expect(knSankalpas.length).toBeGreaterThan(0);
      const knFirst = knSankalpas[0]!;
      expect(knFirst.title).toContain("ಆರೋಗ್ಯ");
      const activeTextKn = useSankalpaStore.getState().getActiveSankalpasText("kn");
      expect(activeTextKn.displayLanguageText).toContain("ಆರೋಗ್ಯ");

      // 2. Switch to Telugu (te)
      await useSankalpaStore.getState().loadSankalpas(userId, "Suma", "te");
      const teSankalpas = useSankalpaStore.getState().sankalpas;
      const teFirst = teSankalpas[0]!;
      expect(teFirst.title).toContain("ఆరోగ్య");
      const activeTextTe = useSankalpaStore.getState().getActiveSankalpasText("te");
      expect(activeTextTe.displayLanguageText).toContain("ఆరోగ్య");
      expect(activeTextTe.displayLanguageText).not.toContain("ಆರೋಗ್ಯ");

      // 3. Switch to Tamil (ta)
      await useSankalpaStore.getState().loadSankalpas(userId, "Suma", "ta");
      const taSankalpas = useSankalpaStore.getState().sankalpas;
      const taFirst = taSankalpas[0]!;
      expect(taFirst.title).toContain("ஆரோக்கிய");
      const activeTextTa = useSankalpaStore.getState().getActiveSankalpasText("ta");
      expect(activeTextTa.displayLanguageText).toContain("ஆரோக்கிய");
      expect(activeTextTa.displayLanguageText).not.toContain("ఆరోగ్య");

      // 4. Switch to Hindi (hi)
      await useSankalpaStore.getState().loadSankalpas(userId, "Suma", "hi");
      const hiSankalpas = useSankalpaStore.getState().sankalpas;
      const hiFirst = hiSankalpas[0]!;
      expect(hiFirst.title).toContain("आरोग्य");
      const activeTextHi = useSankalpaStore.getState().getActiveSankalpasText("hi");
      expect(activeTextHi.displayLanguageText).toContain("आरोग्य");

      // 5. Switch to English (en)
      await useSankalpaStore.getState().loadSankalpas(userId, "Suma", "en");
      const enSankalpas = useSankalpaStore.getState().sankalpas;
      const enFirst = enSankalpas[0]!;
      expect(enFirst.title).toContain("Health");
      const activeTextEn = useSankalpaStore.getState().getActiveSankalpasText("en");
      expect(activeTextEn.displayLanguageText).toContain("Health");

      // 6. Reversibility: Switch back to Kannada cleanly
      await useSankalpaStore.getState().loadSankalpas(userId, "Suma", "kn");
      const restoredKnSankalpas = useSankalpaStore.getState().sankalpas;
      const restoredKnFirst = restoredKnSankalpas[0]!;
      expect(restoredKnFirst.title).toContain("ಆರೋಗ್ಯ");
      const restoredActiveTextKn = useSankalpaStore.getState().getActiveSankalpasText("kn");
      expect(restoredActiveTextKn.displayLanguageText).toContain("ಆರೋಗ್ಯ");
      expect(restoredActiveTextKn.displayLanguageText).not.toContain("Health");
    });
  });

  describe("3. WhatsApp Daily Sharing Template Localization & Zero English Leakage", () => {
    it("generates 100% pure localized WhatsApp share messages across all 5 languages without English leaks", () => {
      const shareKn = buildCleanDailyWhatsAppShareText(TEST_DATE, "kn", "ಶುಕ್ಲ ಪಂಚಮಿ", "ಅನುರಾಧ");
      const shareTe = buildCleanDailyWhatsAppShareText(TEST_DATE, "te", "శుక్ల పంచమి", "అనురాధ");
      const shareTa = buildCleanDailyWhatsAppShareText(TEST_DATE, "ta", "சுக்ல பஞ்சமி", "அனுராதா");
      const shareHi = buildCleanDailyWhatsAppShareText(TEST_DATE, "hi", "शुक्ल पंचमी", "अनुराधा");
      const shareEn = buildCleanDailyWhatsAppShareText(TEST_DATE, "en", "Shukla Panchami", "Anuradha");

      // Kannada
      expect(shareKn).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
      expect(shareKn).toContain("ದಿನಾಂಕ:");
      expect(shareKn).toContain("ಇಂದಿನ ಶುಭೋದಯ ಸಂದೇಶ:");
      expect(shareKn).not.toContain("Good Karma Deed");

      // Telugu
      expect(shareTe).toContain("బగ్గోణ పంచాంగ");
      expect(shareTe).toContain("తేదీ:");
      expect(shareTe).toContain("ఉదయ శుభ సందేశం:");
      expect(shareTe).not.toContain("Good Karma Deed");

      // Tamil
      expect(shareTa).toContain("பக்கோண பஞ்சாங்க");
      expect(shareTa).toContain("தேதி:");
      expect(shareTa).toContain("காலை சுப செய்தி:");
      expect(shareTa).not.toContain("Good Karma Deed");

      // Hindi
      expect(shareHi).toContain("बग्गोण पंचांग");
      expect(shareHi).toContain("दिनांक:");
      expect(shareHi).toContain("आज का शुभ प्रभात संदेश:");
      expect(shareHi).not.toContain("Good Karma Deed");

      // English
      expect(shareEn).toContain("Baggona Panchanga");
      expect(shareEn).toContain("Date:");
      expect(shareEn).toContain("Morning Vibe:");
      expect(shareEn).toContain("Today's Good Karma Action:");
    });
  });

  describe("4. Daily Pooja 5-Step Spoken Narration & Guidance Across All 5 Languages", () => {
    it("produces complete spoken guidance, visual cues, mantras, benefits, and next prompts for all 5 steps and all 5 languages", () => {
      const steps = buildDailyPoojaSteps({ devoteeName: "Suma" });
      for (const step of steps) {
        for (const lang of ALL_LANGS) {
          const narration = getStepNarrationText(step, lang);
          expect(narration).toBeTruthy();
          expect(narration.length).toBeGreaterThan(20);

          if (lang === "kn") {
            expect(narration).toContain(step.titleKn);
          } else if (lang === "te") {
            expect(narration).toContain(step.titleTe);
          } else if (lang === "ta") {
            expect(narration).toContain(step.titleTa);
          } else if (lang === "hi") {
            expect(narration).toContain(step.titleHi);
          } else if (lang === "en") {
            expect(narration).toContain(step.titleEn);
          }

          // Check sacred mantra inclusion
          const expectedMantra = step.sanskritMantraL5?.[lang] || step.sanskritMantra;
          if (expectedMantra) {
            expect(narration).toContain(expectedMantra);
          }
        }
      }
    });

    it("verifies reversibility of puja step narration when switching kn -> te -> ta -> hi -> kn", () => {
      const steps = buildDailyPoojaSteps({ devoteeName: "Suma" });
      const step1 = steps[0]!;
      const knInitial = getStepNarrationText(step1, "kn");
      
      const teNarration = getStepNarrationText(step1, "te");
      const taNarration = getStepNarrationText(step1, "ta");
      const hiNarration = getStepNarrationText(step1, "hi");
      const enNarration = getStepNarrationText(step1, "en");

      expect(teNarration).not.toBe(knInitial);
      expect(taNarration).not.toBe(knInitial);
      expect(hiNarration).not.toBe(knInitial);
      expect(enNarration).not.toBe(knInitial);

      // Revert to Kannada
      const knRestored = getStepNarrationText(step1, "kn");
      expect(knRestored).toBe(knInitial);
    });
  });
});
