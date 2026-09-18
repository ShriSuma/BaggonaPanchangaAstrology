import { describe, it, expect, beforeEach } from "vitest";
import {
  BAGGONA_NAKSHATRAS_MASTER,
  BAGGONA_VARAS_MASTER,
  getBaggonaNakshatra,
  getBaggonaVara,
  getAllBaggonaNakshatras,
  getAllBaggonaVaras,
  seedNakshatrasAndVarasToDb
} from "../services/nakshatraDbService";
import { db } from "../db/indexedDb";
import { toKannadaNakshatra, toKannadaVara } from "../utils/kannadaAstrologyTerms";
import { getNakshatraName, getVaraName } from "../components/instantReading/instantReadingPdfLocale";

describe("Authentic Baggona Nakshatras & Varas Database Service Suite", () => {
  it("contains exactly 27 authentic Baggona Nakshatras with complete 6-language records", () => {
    expect(BAGGONA_NAKSHATRAS_MASTER.length).toBe(27);
    BAGGONA_NAKSHATRAS_MASTER.forEach((nak, idx) => {
      expect(nak.index).toBe(idx);
      expect(nak.canonicalEn).toBeTruthy();
      expect(nak.nameKn).toBeTruthy();
      expect(nak.nameTe).toBeTruthy();
      expect(nak.nameTa).toBeTruthy();
      expect(nak.nameHi).toBeTruthy();
      expect(nak.nameMl).toBeTruthy();
      expect(nak.aliases.length).toBeGreaterThan(0);
    });
  });

  it("contains exactly 7 Varas starting with Somavara and concluding with Ravivara", () => {
    expect(BAGGONA_VARAS_MASTER.length).toBe(7);
    const varaNamesEn = BAGGONA_VARAS_MASTER.map(v => v.canonicalEn);
    expect(varaNamesEn).toEqual([
      "Somavara",
      "Mangalavara",
      "Budhavara",
      "Guruvara",
      "Shukravara",
      "Shanivara",
      "Ravivara"
    ]);

    // Check Kannada names
    const varaNamesKn = BAGGONA_VARAS_MASTER.map(v => v.nameKn);
    expect(varaNamesKn).toEqual([
      "ಸೋಮವಾರ",
      "ಮಂಗಳವಾರ",
      "ಬುಧವಾರ",
      "ಗುರುವಾರ",
      "ಶುಕ್ರವಾರ",
      "ಶನಿವಾರ",
      "ರವಿವಾರ"
    ]);
  });

  it("validates authentic Baggona canonical nomenclature (Tishya, Maghe, Hubbe, Uttara)", () => {
    // 8th Nakshatra (index 7) -> Tishya (ತಿಷ್ಯ)
    const tishya = BAGGONA_NAKSHATRAS_MASTER[7];
    expect(tishya.canonicalEn).toBe("Tishya");
    expect(tishya.nameKn).toBe("ತಿಷ್ಯ");
    expect(tishya.nameTe).toContain("తిష్య");
    expect(tishya.nameTa).toContain("திஷ்ய");

    // 10th Nakshatra (index 9) -> Maghe (ಮಘೆ)
    const maghe = BAGGONA_NAKSHATRAS_MASTER[9];
    expect(maghe.canonicalEn).toBe("Maghe");
    expect(maghe.nameKn).toBe("ಮಘೆ");

    // 11th Nakshatra (index 10) -> Hubbe (ಹುಬ್ಬೆ)
    const hubbe = BAGGONA_NAKSHATRAS_MASTER[10];
    expect(hubbe.canonicalEn).toBe("Hubbe");
    expect(hubbe.nameKn).toBe("ಹುಬ್ಬೆ");

    // 12th Nakshatra (index 11) -> Uttara (ಉತ್ತರ)
    const uttara = BAGGONA_NAKSHATRAS_MASTER[11];
    expect(uttara.canonicalEn).toBe("Uttara");
    expect(uttara.nameKn).toBe("ಉತ್ತರ");
  });

  it("supports seamless backward compatibility lookup with legacy names", () => {
    // Pushya resolves to Tishya / ತಿಷ್ಯ
    expect(getBaggonaNakshatra("Pushya", "kn")).toBe("ತಿಷ್ಯ");
    expect(getBaggonaNakshatra("pushyami", "kn")).toBe("ತಿಷ್ಯ");
    expect(getBaggonaNakshatra("Tishya", "kn")).toBe("ತಿಷ್ಯ");

    // Purva Phalguni / Pubba resolves to Hubbe / ಹುಬ್ಬೆ
    expect(getBaggonaNakshatra("Pubba", "kn")).toBe("ಹುಬ್ಬೆ");
    expect(getBaggonaNakshatra("Purva Phalguni", "kn")).toBe("ಹುಬ್ಬೆ");
    expect(getBaggonaNakshatra("Hubbe", "kn")).toBe("ಹುಬ್ಬೆ");

    // Uttara Phalguni resolves to Uttara / ಉತ್ತರ
    expect(getBaggonaNakshatra("Uttara Phalguni", "kn")).toBe("ಉತ್ತರ");
    expect(getBaggonaNakshatra("Uttara", "kn")).toBe("ಉತ್ತರ");

    // Magha resolves to Maghe / ಮಘೆ
    expect(getBaggonaNakshatra("Magha", "kn")).toBe("ಮಘೆ");
    expect(getBaggonaNakshatra("Maghe", "kn")).toBe("ಮಘೆ");
  });

  it("provides authentic Vara lookups across Kannada, Telugu, Tamil, and English", () => {
    // Somavara
    expect(getBaggonaVara("Somavara", "kn")).toBe("ಸೋಮವಾರ");
    expect(getBaggonaVara("Somavara", "te")).toBe("సోమవారం");
    expect(getBaggonaVara("Somavara", "ta")).toContain("சோமவாரம்");

    // Mangalavara
    expect(getBaggonaVara("Mangalavara", "kn")).toBe("ಮಂಗಳವಾರ");
    expect(getBaggonaVara("Mangalavara", "te")).toBe("మంగళవారం");
    expect(getBaggonaVara("Mangalavara", "ta")).toContain("மங்களவாரம்");

    // Budhavara
    expect(getBaggonaVara("Budhavara", "kn")).toBe("ಬುಧವಾರ");
    expect(getBaggonaVara("Budhavara", "te")).toBe("బుధవారం");
    expect(getBaggonaVara("Budhavara", "ta")).toContain("புதவாரம்");

    // Guruvara
    expect(getBaggonaVara("Guruvara", "kn")).toBe("ಗುರುವಾರ");
    expect(getBaggonaVara("Guruvara", "te")).toBe("గురువారం");
    expect(getBaggonaVara("Guruvara", "ta")).toContain("குருவாரம்");

    // Shukravara
    expect(getBaggonaVara("Shukravara", "kn")).toBe("ಶುಕ್ರವಾರ");
    expect(getBaggonaVara("Shukravara", "te")).toBe("శుక్రవారం");
    expect(getBaggonaVara("Shukravara", "ta")).toContain("சுக்கிரவாரம்");

    // Shanivara
    expect(getBaggonaVara("Shanivara", "kn")).toBe("ಶನಿವಾರ");
    expect(getBaggonaVara("Shanivara", "te")).toBe("శనివారం");
    expect(getBaggonaVara("Shanivara", "ta")).toContain("சனிவாரம்");

    // Ravivara (User requested Ravivara specifically for Sunday)
    expect(getBaggonaVara("Ravivara", "kn")).toBe("ರವಿವಾರ");
    expect(getBaggonaVara("Sunday", "kn")).toBe("ರವಿವಾರ");
    expect(getBaggonaVara("Bhanuvara", "kn")).toBe("ರವಿವಾರ");
    expect(getBaggonaVara("Ravivara", "te")).toBe("రవివారం");
    expect(getBaggonaVara("Sunday", "te")).toBe("రవివారం");
    expect(getBaggonaVara("Ravivara", "ta")).toContain("ரவிவாரம்");
    expect(getBaggonaVara("Sunday", "ta")).toContain("ரவிவாரம்");
  });

  it("ensures instantReadingPdfLocale seamlessly uses master database", () => {
    expect(getNakshatraName(7, "kn")).toBe("ತಿಷ್ಯ");
    expect(getNakshatraName("Tishya", "kn")).toBe("ತಿಷ್ಯ");
    expect(getNakshatraName("Pushya", "kn")).toBe("ತಿಷ್ಯ");
    expect(getNakshatraName(10, "kn")).toBe("ಹುಬ್ಬೆ");
    expect(getNakshatraName(11, "kn")).toBe("ಉತ್ತರ");
    expect(getNakshatraName(9, "kn")).toBe("ಮಘೆ");

    expect(getVaraName("Somavara", "kn")).toBe("ಸೋಮವಾರ");
    expect(getVaraName("Monday", "kn")).toBe("ಸೋಮವಾರ");
    expect(getVaraName("Sunday", "kn")).toBe("ರವಿವಾರ");
    expect(getVaraName("Ravivara", "kn")).toBe("ರವಿವಾರ");
  });

  it("verifies toKannadaNakshatra and toKannadaVara utility methods", () => {
    expect(toKannadaNakshatra(7)).toBe("ತಿಷ್ಯ");
    expect(toKannadaNakshatra("Tishya")).toBe("ತಿಷ್ಯ");
    expect(toKannadaNakshatra("Pushya")).toBe("ತಿಷ್ಯ");
    expect(toKannadaNakshatra(9)).toBe("ಮಘೆ");
    expect(toKannadaNakshatra(10)).toBe("ಹುಬ್ಬೆ");
    expect(toKannadaNakshatra(11)).toBe("ಉತ್ತರ");

    expect(toKannadaVara(0)).toBe("ರವಿವಾರ");
    expect(toKannadaVara(1)).toBe("ಸೋಮವಾರ");
    expect(toKannadaVara("Sunday")).toBe("ರವಿವಾರ");
    expect(toKannadaVara("Somavara")).toBe("ಸೋಮವಾರ");
    expect(toKannadaVara("Ravivara")).toBe("ರವಿವಾರ");
  });
});
