import { describe, it, expect } from "vitest";
import { cleanDegreesFromText } from "../features/premiumPdf/yogaDoshaGocharaEnricher";

describe("cleanDegreesFromText - Comprehensive User Coordinate Sanitizer", () => {
  it("scrubs exact audio quote: solar and lunar Rekhamsha degree calculation text", () => {
    const raw = "ಸೂರ್ಯನ ರೇಖಾಂಶ (15° 56') ಮತ್ತು ಚಂದ್ರನ ರೇಖಾಂಶಗಳ (17° 58') ಸಂಕಲನವು ನಿಖರವಾಗಿ 3° 55' ಆಗಿದ್ದು, ಸಂಕಲನವು ನಿಖರವಾಗಿ ವ್ಯತೀಪಾತ ಯೋಗ ಉಂಟುಮಾಡುತ್ತದೆ.";
    const cleaned = cleanDegreesFromText(raw);
    expect(cleaned).not.toContain("15°");
    expect(cleaned).not.toContain("17°");
    expect(cleaned).not.toContain("3°");
    expect(cleaned).not.toContain("ರೇಖಾಂಶ");
    expect(cleaned).not.toContain("ನಿಖರವಾಗಿ");
    expect(cleaned).toContain("ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರ ಗ್ರಹಗಳ ಸಂಯೋಗದಿಂದ");
    expect(cleaned).toContain("ವ್ಯತೀಪಾತ ಯೋಗ");
  });

  it("scrubs Kannada Indic digits in Rekhamsha phrases", () => {
    const raw = "ಸೂರ್ಯನ ರೇಖಾಂಶ ೧೫ ೫೬ ಮತ್ತು ಚಂದ್ರನ ರೇಖಾಂಶ ೧೭ ೫೮ ನಿಖರವಾಗಿ ೩ ೫೫ ಆಗಿದ್ದು ವ್ಯತೀಪಾತ ಯೋಗಕ್ಕೆ ಕಾರಣವಾಗಿದೆ.";
    const cleaned = cleanDegreesFromText(raw);
    expect(cleaned).not.toContain("೧೫ ೫೬");
    expect(cleaned).not.toContain("೧೭ ೫೮");
    expect(cleaned).not.toContain("೩ ೫೫");
    expect(cleaned).not.toContain("ರೇಖಾಂಶ");
    expect(cleaned).toContain("ವ್ಯತೀಪಾತ ಯೋಗ");
  });

  it("scrubs Kuja Dosha bracketed degree coordinates like (ಕರ್ಕಾಟಕ - 23°14')", () => {
    const raw = "ಅಂಗಾರಕನಾದ ಕುಜ ಗ್ರಹವು ೪ನೇ ಮನೆಯಲ್ಲಿ (ಕರ್ಕಾಟಕ - 23°14') ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ ಕುಜ ಪ್ರಭಾವವಿದೆ.";
    const cleaned = cleanDegreesFromText(raw);
    expect(cleaned).not.toContain("23°14'");
    expect(cleaned).not.toContain("°");
    expect(cleaned).toContain("(ಕರ್ಕಾಟಕ)");
    expect(cleaned).toContain("ಕುಜ ಪ್ರಭಾವವಿದೆ");
  });

  it("scrubs English orb degrees and longitudes", () => {
    const raw = "Within a close 3.5° orb, Mars and Rahu conjunct at 15°42' in Aries at 10°00'.";
    const cleaned = cleanDegreesFromText(raw);
    expect(cleaned).not.toContain("3.5°");
    expect(cleaned).not.toContain("15°42'");
    expect(cleaned).not.toContain("10°00'");
    expect(cleaned).not.toContain("°");
    expect(cleaned).toContain("in close conjunction");
    expect(cleaned).toContain("in Aries");
  });

  it("scrubs Hindi bhogamsha coordinates", () => {
    const raw = "सूर्य एवं चंद्र के भोगांशों का योग 12° 45' है, जिससे वैधृति योग बनता है।";
    const cleaned = cleanDegreesFromText(raw);
    expect(cleaned).not.toContain("भोगांशों");
    expect(cleaned).not.toContain("12° 45'");
    expect(cleaned).not.toContain("°");
    expect(cleaned).toContain("सूर्य एवं चंद्र के योग से");
    expect(cleaned).toContain("वैधृति योग बनता है।");
  });

  it("removes 180 degree axis and 12 degree orb technical jargon", () => {
    const raw = "೧೮೦ ಡಿಗ್ರಿ ಅಕ್ಷದ ಕಾಲಸರ್ಪ ಯೋಗ ಮತ್ತು ಗುರು-ರಾಹು ೧೨ ಡಿಗ್ರಿಗಿಂತ ಹೆಚ್ಚು ಅಂತರವಿರುವುದರಿಂದ ದೋಷವಿಲ್ಲ.";
    const cleaned = cleanDegreesFromText(raw);
    expect(cleaned).not.toContain("೧೮೦ ಡಿಗ್ರಿ");
    expect(cleaned).not.toContain("೧೨ ಡಿಗ್ರಿಗಿಂತ ಹೆಚ್ಚು");
    expect(cleaned).toContain("ಅಕ್ಷದ ಕಾಲಸರ್ಪ ಯೋಗ");
    expect(cleaned).toContain("ಸಾಕಷ್ಟು ಅಂತರವಿರುವುದರಿಂದ ದೋಷವಿಲ್ಲ.");
  });

  it("leaves normal devotional sentences completely untouched", () => {
    const normal = "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗುರು ಗ್ರಹವು ಧನು ರಾಶಿಯಲ್ಲಿ ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ. ಇದು ಭಾಗ್ಯ ವೃದ್ಧಿ ಮಾಡುತ್ತದೆ.";
    const cleaned = cleanDegreesFromText(normal);
    expect(cleaned).toBe(normal);
  });
});
