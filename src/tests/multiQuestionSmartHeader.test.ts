import { describe, it, expect } from "vitest";
import { generateSmartQuestionHeader } from "../components/RamanBhavishya/BhavishyaView";

describe("Multi-Question Text Box Precedence & Smart Header Tests", () => {
  const languages = ["kn", "hi", "te", "ta", "en"] as const;

  it("generates 100% localized Smart Headers for custom house/property questions", () => {
    const qText = "When will I buy a house or flat in Bengaluru?";
    expect(generateSmartQuestionHeader(qText, "kn")).toContain("ಗೃಹ");
    expect(generateSmartQuestionHeader(qText, "hi")).toContain("गृह");
    expect(generateSmartQuestionHeader(qText, "te")).toContain("గృహ");
    expect(generateSmartQuestionHeader(qText, "ta")).toContain("வீடு");
    expect(generateSmartQuestionHeader(qText, "en")).toContain("House");
  });

  it("generates 100% localized Smart Headers for custom job/career promotion questions", () => {
    const qText = "ನನಗೆ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಯಾವಾಗ ಸಿಗಲಿದೆ?";
    expect(generateSmartQuestionHeader(qText, "kn")).toContain("ಉದ್ಯೋಗ");
    expect(generateSmartQuestionHeader(qText, "hi")).toContain("करियर");
    expect(generateSmartQuestionHeader(qText, "en")).toContain("Career");
  });

  it("generates 100% localized Smart Headers for custom marriage timing questions", () => {
    const qText = "What is my marriage timing window and spouse nature?";
    expect(generateSmartQuestionHeader(qText, "kn")).toContain("ವಿವಾಹ");
    expect(generateSmartQuestionHeader(qText, "hi")).toContain("विवाह");
    expect(generateSmartQuestionHeader(qText, "te")).toContain("వివాహ");
    expect(generateSmartQuestionHeader(qText, "ta")).toContain("திருமண");
  });

  it("generates localized fallback Smart Header for arbitrary custom questions", () => {
    const qText = "Will I clear my government competitive exams next year?";
    languages.forEach((l) => {
      const header = generateSmartQuestionHeader(qText, l);
      expect(header).toBeTruthy();
      expect(header.length).toBeGreaterThan(5);
    });
  });
});
