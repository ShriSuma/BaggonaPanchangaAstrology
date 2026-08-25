import { describe, it, expect } from "vitest";
import {
  VEDIC_YOGAS,
  VEDIC_DOSHAS
} from "../components/games/YogaDoshaParampadaGame";

describe("Vedic Yoga & Dosha Parampada Board Game Engine", () => {
  it("contains 9 authentic Vedic Yogas acting as ladders ascending to higher tiles", () => {
    const yogaKeys = Object.keys(VEDIC_YOGAS).map(Number);
    expect(yogaKeys.length).toBe(9);

    yogaKeys.forEach((fromTile) => {
      const yoga = VEDIC_YOGAS[fromTile];
      expect(yoga.from).toBe(fromTile);
      expect(yoga.to).toBeGreaterThan(yoga.from); // Must ascend
      expect(yoga.to).toBeLessThanOrEqual(100); // Cannot exceed Moksha tile
      expect(yoga.nameKn).toBeDefined();
      expect(yoga.nameEn).toBeDefined();
      expect(yoga.meaningKn.length).toBeGreaterThan(10);
      expect(yoga.meaningEn.length).toBeGreaterThan(10);
      expect(yoga.gurujiVerdictKn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    });
  });

  it("contains 7 classical Vedic Doshas acting as snakes descending to lower tiles", () => {
    const doshaKeys = Object.keys(VEDIC_DOSHAS).map(Number);
    expect(doshaKeys.length).toBe(7);

    doshaKeys.forEach((fromTile) => {
      const dosha = VEDIC_DOSHAS[fromTile];
      expect(dosha.from).toBe(fromTile);
      expect(dosha.to).toBeLessThan(dosha.from); // Must descend
      expect(dosha.to).toBeGreaterThanOrEqual(1); // Cannot go below tile 1
      expect(dosha.nameKn).toBeDefined();
      expect(dosha.nameEn).toBeDefined();
      expect(dosha.meaningKn.length).toBeGreaterThan(10);
      expect(dosha.meaningEn.length).toBeGreaterThan(10);
      expect(dosha.gurujiVerdictKn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    });
  });

  it("ensures no circular loops exist between Yogas and Doshas", () => {
    // Ensure that no ladder lands on a snake's mouth, and no snake lands on a ladder's foot
    Object.values(VEDIC_YOGAS).forEach((yoga) => {
      expect(VEDIC_DOSHAS[yoga.to]).toBeUndefined(); // Ladder cannot end at a snake
    });

    Object.values(VEDIC_DOSHAS).forEach((dosha) => {
      expect(VEDIC_YOGAS[dosha.to]).toBeUndefined(); // Snake cannot drop directly into a ladder
    });
  });

  it("verifies prominent Yogas like Gaja Kesari, Budhaditya, Malavya, and Moksha", () => {
    expect(VEDIC_YOGAS[4].nameKn).toContain("ಗಜಕೇಸರಿ");
    expect(VEDIC_YOGAS[9].nameKn).toContain("ಬುಧಾದಿತ್ಯ");
    expect(VEDIC_YOGAS[17].nameKn).toContain("ಮಾಲವ್ಯ");
    expect(VEDIC_YOGAS[80].nameKn).toContain("ಗೋಕರ್ಣ");
    expect(VEDIC_YOGAS[80].to).toBe(99);
  });

  it("verifies prominent Doshas like Kuja, Kala Sarpa, Grahana, and Shani Sade Sati", () => {
    expect(VEDIC_DOSHAS[32].nameKn).toContain("ಕುಜ");
    expect(VEDIC_DOSHAS[48].nameKn).toContain("ಕಾಳಸರ್ಪ");
    expect(VEDIC_DOSHAS[62].nameKn).toContain("ಗ್ರಹಣ");
    expect(VEDIC_DOSHAS[88].nameKn).toContain("ಶನಿ ಸಾಡೇ ಸಾತಿ");
  });
});
