import { describe, it, expect } from "vitest";
import {
  formatPanditName,
  MAHA_MRITYUNJAYA_MANTRA_L5,
  SARVA_SHANTI_MANTRA_L5,
  GRIHA_DIYA_MUHURTHA_L5,
  KULA_DEVATA_GRIHA_RAKSHA_L5,
  QR_TARGET_BADGE_DICT,
  QR_CONSECRATING_DICT,
  pick,
  T,
  type SevaLang
} from "../features/seva/sevaLocale";
import { getPriestProfile } from "../features/seva/sevaPriestDirectory";

describe("Seva Patra 5-Page Ashirvada Booklet & Home Mantras Audit", () => {
  const LANGUAGES: SevaLang[] = ["kn", "hi", "te", "ta", "en"];

  describe("1. Maha Mrityunjaya Mantra Pure 5-Language Localization", () => {
    it("should have authentic 2-line verses and meanings for all 5 languages with zero undefined", () => {
      LANGUAGES.forEach((lang) => {
        expect(MAHA_MRITYUNJAYA_MANTRA_L5.lines).toHaveLength(2);
        MAHA_MRITYUNJAYA_MANTRA_L5.lines.forEach((line) => {
          const text = pick(line, lang);
          expect(text).toBeTruthy();
          expect(text.length).toBeGreaterThan(15);
        });
        const meaning = pick(MAHA_MRITYUNJAYA_MANTRA_L5.meaning, lang);
        expect(meaning).toBeTruthy();
        expect(meaning.length).toBeGreaterThan(20);
      });
    });

    it("should contain native script characters in Indic modes and English in en mode", () => {
      // Kannada script
      expect(pick(MAHA_MRITYUNJAYA_MANTRA_L5.lines[0], "kn")).toContain("ತ್ರ್ಯಂಬಕಂ");
      // Hindi Devanagari script
      expect(pick(MAHA_MRITYUNJAYA_MANTRA_L5.lines[0], "hi")).toContain("त्र्यम्बकं");
      // Telugu script
      expect(pick(MAHA_MRITYUNJAYA_MANTRA_L5.lines[0], "te")).toContain("త్ర్యంబకం");
      // Tamil script
      expect(pick(MAHA_MRITYUNJAYA_MANTRA_L5.lines[0], "ta")).toContain("த்ரயம்பகம்");
      // English Latin transliteration
      expect(pick(MAHA_MRITYUNJAYA_MANTRA_L5.lines[0], "en")).toContain("Tryambakam");
    });
  });

  describe("2. Sarva Shanti Vedic Universal Peace Mantra", () => {
    it("should provide complete 3-line peace chant and description in all 5 languages", () => {
      LANGUAGES.forEach((lang) => {
        const title = pick(SARVA_SHANTI_MANTRA_L5.title, lang);
        expect(title).toBeTruthy();
        expect(SARVA_SHANTI_MANTRA_L5.lines).toHaveLength(3);
        SARVA_SHANTI_MANTRA_L5.lines.forEach((line) => {
          const text = pick(line, lang);
          expect(text).toBeTruthy();
        });
        const desc = pick(SARVA_SHANTI_MANTRA_L5.desc, lang);
        expect(desc).toBeTruthy();
      });
    });

    it("Hindi verse should be clean with no typos", () => {
      const line1 = pick(SARVA_SHANTI_MANTRA_L5.lines[0], "hi");
      expect(line1).toContain("शान्तिरोषधयः");
      expect(line1).not.toContain("block");
    });
  });

  describe("3. Sacred Daily Diya Muhurtha & Sanctum Advice", () => {
    it("should define authentic morning dawn and evening godhuli kaala timings in all 5 languages", () => {
      LANGUAGES.forEach((lang) => {
        const title = pick(GRIHA_DIYA_MUHURTHA_L5.title, lang);
        const mLabel = pick(GRIHA_DIYA_MUHURTHA_L5.morning.label, lang);
        const mTime = pick(GRIHA_DIYA_MUHURTHA_L5.morning.time, lang);
        const eLabel = pick(GRIHA_DIYA_MUHURTHA_L5.evening.label, lang);
        const eTime = pick(GRIHA_DIYA_MUHURTHA_L5.evening.time, lang);
        const advice = pick(GRIHA_DIYA_MUHURTHA_L5.sanctumAdvice, lang);

        expect(title).toBeTruthy();
        expect(mLabel).toBeTruthy();
        expect(mTime).toBeTruthy();
        expect(eLabel).toBeTruthy();
        expect(eTime).toBeTruthy();
        expect(advice).toBeTruthy();
      });
    });
  });

  describe("4. Kula Devata Griha Raksha Shloka", () => {
    it("should provide the authentic Swasti Prajabhyah Paripalayantam verse across all 5 languages", () => {
      LANGUAGES.forEach((lang) => {
        const title = pick(KULA_DEVATA_GRIHA_RAKSHA_L5.title, lang);
        const shloka = pick(KULA_DEVATA_GRIHA_RAKSHA_L5.shloka, lang);
        const desc = pick(KULA_DEVATA_GRIHA_RAKSHA_L5.desc, lang);

        expect(title).toBeTruthy();
        expect(shloka).toBeTruthy();
        expect(desc).toBeTruthy();
      });

      expect(pick(KULA_DEVATA_GRIHA_RAKSHA_L5.shloka, "kn")).toContain("ಸ್ವಸ್ತಿ ಪ್ರಜಾಭ್ಯಃ");
      expect(pick(KULA_DEVATA_GRIHA_RAKSHA_L5.shloka, "hi")).toContain("स्वस्ति प्रजाभ्यः");
      expect(pick(KULA_DEVATA_GRIHA_RAKSHA_L5.shloka, "te")).toContain("స్వస్తి ప్రజాభ్యః");
      expect(pick(KULA_DEVATA_GRIHA_RAKSHA_L5.shloka, "ta")).toContain("ஸ்வஸ்தி ப்ரஜாப்யஃ");
      expect(pick(KULA_DEVATA_GRIHA_RAKSHA_L5.shloka, "en")).toContain("Swasti Prajabhyah");
    });
  });

  describe("5. QR Target Badges & Consecrating Placeholders", () => {
    it("should provide pure 5-language strings for google, webcal, and sanctum targets", () => {
      const targets = ["google", "webcal", "sanctum"];
      targets.forEach((target) => {
        LANGUAGES.forEach((lang) => {
          const badge = pick(QR_TARGET_BADGE_DICT[target], lang);
          expect(badge).toBeTruthy();
          if (lang === "kn") {
            expect(badge).toMatch(/[\u0C80-\u0CFF]/);
          } else if (lang === "hi") {
            expect(badge).toMatch(/[\u0900-\u097F]/);
          } else if (lang === "te") {
            expect(badge).toMatch(/[\u0C00-\u0C7F]/);
          } else if (lang === "ta") {
            expect(badge).toMatch(/[\u0B80-\u0BFF]/);
          }
        });
      });

      LANGUAGES.forEach((lang) => {
        const text = pick(QR_CONSECRATING_DICT, lang);
        expect(text).toBeTruthy();
      });
    });
  });

  describe("6. Priest Formatting & Backward Compatibility", () => {
    it("should default to canonical 'Shreeram Pandit' when undefined or empty across all 5 languages", () => {
      expect(formatPanditName(undefined, "kn")).toBe("ಶ್ರೀರಾಮ ಪಂಡಿತ್");
      expect(formatPanditName("", "kn")).toBe("ಶ್ರೀರಾಮ ಪಂಡಿತ್");
      expect(formatPanditName(undefined, "hi")).toBe("श्रीराम पंडित");
      expect(formatPanditName(undefined, "te")).toBe("శ్రీరామ్ పండిట్");
      expect(formatPanditName(undefined, "ta")).toBe("ஸ்ரீராம் பண்டிட்");
      expect(formatPanditName(undefined, "en")).toBe("Shreeram Pandit");
    });

    it("should preserve backward compatibility for legacy names like Chaitanya Pandit", () => {
      expect(formatPanditName("Chaitanya Pandit", "kn")).toBe("ಚೈತನ್ಯ ಪಂಡಿತ");
      expect(formatPanditName("Chaitanya Pandit", "hi")).toBe("चैतन्य पंडित");
      expect(formatPanditName("Chaitanya Pandit", "te")).toBe("చైతన్య పండిత్");
      expect(formatPanditName("Chaitanya Pandit", "ta")).toBe("சைதன்ய பண்டிதர்");
      expect(formatPanditName("Chaitanya Pandit", "en")).toBe("Chaitanya Pandit");
    });

    it("should properly transliterate custom priest names", () => {
      const transliteratedKn = formatPanditName("Ganesh Bhat", "kn");
      expect(transliteratedKn).toBeTruthy();
      expect(typeof transliteratedKn).toBe("string");
    });

    it("should return the canonical priest profile for default search", () => {
      const profile = getPriestProfile();
      expect(profile.id).toBe("shreeram-pandit");
      expect(profile.name.en).toBe("Shreeram Pandit");
    });
  });

  describe("7. Label Gotra & Devotee Field Consistency", () => {
    it("should have labelGotra defined in all 5 languages", () => {
      LANGUAGES.forEach((lang) => {
        const gotraLabel = pick(T.labelGotra, lang);
        expect(gotraLabel).toBeTruthy();
      });
      expect(pick(T.labelGotra, "kn")).toBe("ಗೋತ್ರ");
      expect(pick(T.labelGotra, "hi")).toBe("गोत्र");
      expect(pick(T.labelGotra, "te")).toBe("గోత్రం");
      expect(pick(T.labelGotra, "ta")).toBe("கோத்திரம்");
      expect(pick(T.labelGotra, "en")).toBe("Gotra");
    });
  });
});
