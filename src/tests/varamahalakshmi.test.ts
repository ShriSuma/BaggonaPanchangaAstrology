import { describe, it, expect } from "vitest";
import {
  calculateVaramahalakshmiMuhurthas,
  getGuardianAshtaLakshmi,
  analyzeChartForVaramahalakshmi
} from "../features/varamahalakshmi/varamahalakshmiEngine";
import {
  DORA_GRANTHI_KNOTS,
  VARAMAHALAKSHMI_SEVA_PACKAGES,
  pickL5
} from "../features/varamahalakshmi/varamahalakshmiLocale";

describe("Varamahalakshmi Engine & Festivals Test Suite", () => {
  it("calculates Sthira Lagna Muhurthas for festival day", () => {
    const res = calculateVaramahalakshmiMuhurthas("2026-08-21", 14.53, 74.31, "lahiri");
    expect(res.muhurthas.length).toBeGreaterThanOrEqual(3);
    expect(res.bestWindow).toBeDefined();
    expect(res.bestWindow.isSthira).toBe(true);
    expect(res.sunriseStr).toBeTruthy();
    expect(res.sunsetStr).toBeTruthy();
  });

  it("maps all 27 nakshatras to Ashta Lakshmi forms without falling back incorrectly", () => {
    for (let i = 0; i < 27; i++) {
      const form = getGuardianAshtaLakshmi(i);
      expect(form).toBeDefined();
      expect(form.id).toBeTruthy();
      expect(form.nameL5.kn).toBeTruthy();
      expect(form.nameL5.en).toBeTruthy();
      expect(form.recommendedSareeColorL5.kn).toBeTruthy();
      expect(form.recommendedFlowerL5.kn).toBeTruthy();
      expect(form.specialNaivedyaL5.kn).toBeTruthy();
      expect(form.stotraL5.kn).toBeTruthy();
    }
  });

  it("generates personalized Sankalpa in 5 languages", () => {
    const analysis = analyzeChartForVaramahalakshmi(null, "ಸುಮಾ (Suma)", "ಕಶ್ಯಪ (Kashyapa)");
    expect(analysis.personName).toBe("ಸುಮಾ (Suma)");
    expect(analysis.gotra).toBe("ಕಶ್ಯಪ (Kashyapa)");
    expect(analysis.ashtaLakshmi).toBeDefined();

    const knSankalpa = pickL5(analysis.sankalpaTextL5, "kn");
    expect(knSankalpa).toContain("ಸುಮಾ (Suma)");
    expect(knSankalpa).toContain("ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ ಪೂಜಾಂ");

    const teSankalpa = pickL5(analysis.sankalpaTextL5, "te");
    expect(teSankalpa).toContain("వరమహాలక్ష్మీ వ్రత పూజాం");

    const taSankalpa = pickL5(analysis.sankalpaTextL5, "ta");
    expect(taSankalpa).toContain("வரமகாலட்சுமி விரத பூஜாம்");

    const hiSankalpa = pickL5(analysis.sankalpaTextL5, "hi");
    expect(hiSankalpa).toContain("वरमहालक्ष्मी व्रत पूजनं");

    const enSankalpa = pickL5(analysis.sankalpaTextL5, "en");
    expect(enSankalpa).toContain("Varamahalakshmi Vratha");
  });

  it("contains 9 complete Doragranthi knots with mantras and deity names", () => {
    expect(DORA_GRANTHI_KNOTS).toHaveLength(9);
    DORA_GRANTHI_KNOTS.forEach((k, idx) => {
      expect(k.knotNumber).toBe(idx + 1);
      expect(k.mantra).toBeTruthy();
      expect(k.goddessNameL5.kn).toBeTruthy();
      expect(k.significanceL5.kn).toBeTruthy();
    });
  });

  it("verifies Varamahalakshmi Seva packages registry", () => {
    expect(VARAMAHALAKSHMI_SEVA_PACKAGES.length).toBeGreaterThanOrEqual(3);
    VARAMAHALAKSHMI_SEVA_PACKAGES.forEach((pkg) => {
      expect(pkg.id).toBeTruthy();
      expect(pkg.priceInr).toBeGreaterThan(0);
      expect(pkg.titleL5.kn).toBeTruthy();
      expect(pkg.itemsL5.length).toBeGreaterThan(0);
    });
  });
});
