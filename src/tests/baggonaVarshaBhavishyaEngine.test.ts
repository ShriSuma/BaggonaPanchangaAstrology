import { describe, it, expect } from "vitest";
import {
  getBaggonaVarshaBhavishyaForYear,
  toKannadaDigits,
  toPaddedKnDigits,
  BAGGONA_NAKSHATRA_PADAS
} from "../core/BaggonaVarshaBhavishyaEngine";
import { calculateVarshaBavishya } from "../core/VarshaBavishyaEngine";

describe("BaggonaVarshaBhavishyaEngine", () => {
  it("converts numbers to Kannada digits correctly", () => {
    expect(toKannadaDigits(14)).toBe("೧೪");
    expect(toKannadaDigits(5)).toBe("೫");
    expect(toPaddedKnDigits(5)).toBe("೦೫");
    expect(toPaddedKnDigits(11)).toBe("೧೧");
  });

  it("has authentic Nakshatra Padas for all 12 Rashis", () => {
    expect(BAGGONA_NAKSHATRA_PADAS).toHaveLength(12);
    expect(BAGGONA_NAKSHATRA_PADAS[0].kn).toContain("ಅಶ್ವಿನಿ ೪");
    expect(BAGGONA_NAKSHATRA_PADAS[1].kn).toContain("ಕೃತ್ತಿಕಾ ೨,೩,೪");
    expect(BAGGONA_NAKSHATRA_PADAS[11].kn).toContain("ರೇವತಿ ೪ನೇ ಪಾದ");
  });

  describe("Sri Parabhava Samvatsara (Shaka 1948 / 2026-2027) Canonical Anchors", () => {
    const parabhava = getBaggonaVarshaBhavishyaForYear(1948, true);

    it("verifies Samvatsara metadata", () => {
      expect(parabhava.shakaYear).toBe(1948);
      expect(parabhava.gregorianYear).toBe(2026);
      expect(parabhava.samvatsaraKn).toBe("ಪರಾಭವ");
      expect(parabhava.samvatsaraEn).toBe("Parabhava");
      expect(parabhava.rashis).toHaveLength(12);
    });

    it("verifies exact canonical Aaya, Vyaya, Rajapujya, Avamana for all 12 Rashis", () => {
      const expectedMetrics = [
        // Mesha
        { aaya: 14, vyaya: 11, rajapujya: 4, avamana: 1, badge: "ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧" },
        // Vrishabha
        { aaya: 11, vyaya: 5, rajapujya: 7, avamana: 4, badge: "ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪" },
        // Mithuna
        { aaya: 5, vyaya: 11, rajapujya: 1, avamana: 4, badge: "ಆದಾಯ: ೦೫ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪" },
        // Karkataka
        { aaya: 14, vyaya: 2, rajapujya: 4, avamana: 1, badge: "ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೦೨ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧" },
        // Simha
        { aaya: 11, vyaya: 11, rajapujya: 7, avamana: 4, badge: "ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪" },
        // Kanya
        { aaya: 5, vyaya: 11, rajapujya: 1, avamana: 4, badge: "ಆದಾಯ: ೦೫ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪" },
        // Tula
        { aaya: 14, vyaya: 11, rajapujya: 4, avamana: 1, badge: "ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧" },
        // Vrishchika
        { aaya: 11, vyaya: 5, rajapujya: 7, avamana: 4, badge: "ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪" },
        // Dhanu
        { aaya: 2, vyaya: 14, rajapujya: 5, avamana: 2, badge: "ಆದಾಯ: ೦೨ • ವ್ಯಯ: ೧೪ | ರಾಜಪೂಜ್ಯ: ೫ • ಅವಮಾನ: ೨" },
        // Makara
        { aaya: 8, vyaya: 14, rajapujya: 1, avamana: 4, badge: "ಆದಾಯ: ೦೮ • ವ್ಯಯ: ೧೪ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪" },
        // Kumbha
        { aaya: 8, vyaya: 14, rajapujya: 1, avamana: 4, badge: "ಆದಾಯ: ೦೮ • ವ್ಯಯ: ೧೪ | ರಾಜಪೂಜ್ಯ: ೧ • ಅವಮಾನ: ೪" },
        // Meena
        { aaya: 11, vyaya: 5, rajapujya: 7, avamana: 4, badge: "ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ | ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪" }
      ];

      expectedMetrics.forEach((expected, idx) => {
        const rashi = parabhava.rashis[idx];
        expect(rashi.aaya).toBe(expected.aaya);
        expect(rashi.vyaya).toBe(expected.vyaya);
        expect(rashi.rajapujya).toBe(expected.rajapujya);
        expect(rashi.avamana).toBe(expected.avamana);
        expect(rashi.badgeKn).toBe(expected.badge);
        expect(rashi.bookParagraph1Kn).toBeTruthy();
        expect(rashi.bookParagraph2Kn).toBeTruthy();
        expect(rashi.shantiPariharaKn).toBeTruthy();
      });
    });

    it("verifies authentic proverbs and coastal agriculture in Parabhava text", () => {
      const mithuna = parabhava.rashis[2];
      expect(mithuna.bookParagraph1Kn).toContain("ಕಾಯಕವೇ ಕೈಲಾಸ");
      expect(mithuna.bookParagraph1Kn).toContain("ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ");

      const makara = parabhava.rashis[9];
      expect(makara.bookParagraph1Kn).toContain("ಸಾಹಸೇ ಶ್ರೀಃ ಪ್ರತಿ ವಸತಿ");

      const tula = parabhava.rashis[6];
      expect(tula.bookParagraph1Kn).toContain("ಅಡಿಕೆ");
      expect(tula.bookParagraph1Kn).toContain("ಭತ್ತ");
      expect(tula.bookParagraph1Kn).toContain("ತೆಂಗು");
    });
  });

  describe("Dynamic Past and Future Samvatsara Calculations", () => {
    it("computes Krodhi Samvatsara (Shaka 1946 / 2024)", () => {
      const krodhi = getBaggonaVarshaBhavishyaForYear(2024);
      expect(krodhi.shakaYear).toBe(1946);
      expect(krodhi.samvatsaraKn).toBe("ಕ್ರೋಧಿ");
      expect(krodhi.rashis).toHaveLength(12);
      expect(krodhi.rashis[0].aaya).toBeGreaterThan(0);
      expect(krodhi.rashis[0].vyaya).toBeGreaterThan(0);
    });

    it("computes Vishvavasu Samvatsara (Shaka 1947 / 2025)", () => {
      const vishvavasu = getBaggonaVarshaBhavishyaForYear(2025);
      expect(vishvavasu.shakaYear).toBe(1947);
      expect(vishvavasu.samvatsaraKn).toBe("ವಿಶ್ವಾವಸು");
      expect(vishvavasu.rashis).toHaveLength(12);
    });

    it("computes Plavanga Samvatsara (Shaka 1949 / 2027)", () => {
      const plavanga = getBaggonaVarshaBhavishyaForYear(2027);
      expect(plavanga.shakaYear).toBe(1949);
      expect(plavanga.samvatsaraKn).toBe("ಪ್ಲವಂಗ");
      expect(plavanga.rashis).toHaveLength(12);
      expect(plavanga.rashis[0].bookParagraph1Kn).toBeTruthy();
    });

    it("computes future years like 2030 and 2050 without errors", () => {
      const future2030 = getBaggonaVarshaBhavishyaForYear(2030);
      expect(future2030.rashis).toHaveLength(12);
      expect(future2030.samvatsaraKn).toBeTruthy();

      const future2050 = getBaggonaVarshaBhavishyaForYear(2050);
      expect(future2050.rashis).toHaveLength(12);
      expect(future2050.samvatsaraKn).toBeTruthy();
    });
  });

  describe("VarshaBavishyaEngine Integration & Backward Compatibility", () => {
    it("calculates backward-compatible VarshaPrediction enriched with Baggona data", () => {
      const pred = calculateVarshaBavishya(2026, 0); // Mesha
      expect(pred.year).toBe(2026);
      expect(pred.rashi.english).toBe("Aries");
      expect(pred.paragraphs).toHaveLength(4);
      expect(pred.baggonaPayload).toBeDefined();
      expect(pred.baggonaPayload?.aaya).toBe(14);
      expect(pred.baggonaPayload?.vyaya).toBe(11);
      expect(pred.samvatsaraKn).toBe("ಪರಾಭವ");
      expect(pred.fullYearBhavishya?.rashis).toHaveLength(12);
    });
  });
});
