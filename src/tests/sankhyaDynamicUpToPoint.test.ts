import { describe, it, expect, vi } from "vitest";

// Mock Gemini API call so tests run deterministically via fallback builder
vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockRejectedValue(new Error("Test fallback to deterministic engine"))
}));

import {
  extractDetailedQuestionContext,
  executeSankhyaShastraPrashna
} from "../features/sankhyashastra/sankhyaShastraEngine";
import { generateSankhyaPrashnaReading } from "../features/priest/sankhyaShastraPriestEngine";

describe("Sankhya Shastra Up-To-The-Point Divination Engine (Priest Voice Instruction)", () => {
  const userDebtQuestionEn = "I have given 2 crores to my friend did he give me back those amount";
  const userDebtQuestionKn = "ನನ್ನ ಸ್ನೇಹಿತನಿಗೆ ೨ ಕೋಟಿ ಹಣ ಕೊಟ್ಟಿದ್ದೇನೆ, ಆತ ವಾಪಸ್ ಕೊಡುತ್ತಾನಾ?";

  it("extracts exact amount, target person, and sub-intent for money lent recovery", () => {
    const ctxEn = extractDetailedQuestionContext(userDebtQuestionEn);
    expect(ctxEn.category).toBe("wealth_finance");
    expect(ctxEn.subIntent).toBe("money_lent_recovery");
    expect(ctxEn.extractedAmount?.en).toMatch(/2 crore/i);
    expect(ctxEn.targetPerson?.en).toBe("friend");
    expect(ctxEn.targetPerson?.kn).toBe("ಸ್ನೇಹಿತ");

    const ctxKn = extractDetailedQuestionContext(userDebtQuestionKn);
    expect(ctxKn.category).toBe("wealth_finance");
    expect(ctxKn.subIntent).toBe("money_lent_recovery");
  });

  it("produces direct-verdict 4-step reading in Kannada for the user's 2-crore question without filler", async () => {
    const result = await executeSankhyaShastraPrashna(userDebtQuestionKn, 45, "kn", "");

    // 1. Must NOT contain banned filler phrases
    expect(result.aiPrediction).not.toMatch(/ನೋಡಿ ಭಕ್ತರೇ/);
    expect(result.aiPrediction).not.toMatch(/ಪ್ರತ್ಯಕ್ಷವಾಗಿ ನೋಡುತ್ತಿದ್ದೇನೆ/);
    expect(result.aiPrediction).not.toMatch(/ನಮಸ್ಕಾರ/);
    expect(result.aiPrediction).not.toMatch(/ಲಗ್ನಾಧಿಪತಿ/);
    expect(result.aiPrediction).not.toMatch(/ನಾನು ಜ್ಯೋತಿಷಿ/);

    // 2. Must follow the 4-part structure
    const paras = result.aiPrediction.split(/\n\n+/).filter((p) => p.trim().length > 0);
    expect(paras).toHaveLength(4);

    // Section 1: Direct verdict FIRST sentence
    expect(paras[0]).toContain("೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ");
    expect(paras[0]).toMatch(/(ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ|ಹೌದು|ಖಚಿತವಾಗಿ)/);

    // Section 2: Why? Planetary & situational ground reality
    expect(paras[1]).toContain("೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು?");
    expect(paras[1]).toMatch(/(ಹಣ|ಸಾಲ|ಗ್ರಹ|ಆರ್ಥಿಕ)/);

    // Section 3: When? Concrete turnaround timeline
    expect(paras[2]).toContain("೩. ನಿಖರ ಕಾಲಾವಧಿ");
    expect(paras[2]).toMatch(/(ತಿಂಗಳ|ದಿನ|ಕಾಲಾವಧಿ|ಅವಧಿ)/);

    // Section 4: Remedies & Practical next steps (peaceful meeting, written note)
    expect(paras[3]).toContain("೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು");
    expect(paras[3]).toMatch(/(ಶಾಂತಿಯುತವಾಗಿ|ಮುಖಾಮುಖಿ|ಲಿಖಿತ|ಸಮಾಲೋಚನೆ)/);
  });

  it("produces direct-verdict 4-step reading in English for the user's 2-crore question", async () => {
    const result = await executeSankhyaShastraPrashna(userDebtQuestionEn, 45, "en", "");

    // 1. Must NOT contain greetings or meta intros
    expect(result.aiPrediction).not.toMatch(/namaskara/i);
    expect(result.aiPrediction).not.toMatch(/hello devotee/i);
    expect(result.aiPrediction).not.toMatch(/looking at your chart/i);

    // 2. Must follow 4-part structure
    const paras = result.aiPrediction.split(/\n\n+/).filter((p) => p.trim().length > 0);
    expect(paras).toHaveLength(4);

    // Section 1: Direct verdict FIRST
    expect(paras[0]).toContain("1. DIRECT ASTROLOGICAL VERDICT");
    expect(paras[0]).toMatch(/(No, currently|Yes,|definitely|will be returned)/i);

    // Section 2: Causal analysis
    expect(paras[1]).toContain("2. WHY? PLANETARY ROOT CAUSE");

    // Section 3: Concrete timeline
    expect(paras[2]).toContain("3. CONCRETE TIMELINE");

    // Section 4: Practical next steps (in-person meeting, written agreement)
    const section4 = paras[3];
    expect(section4).toContain("4. SACRED REMEDIES & REAL-WORLD PRACTICAL NEXT STEPS");
    expect(section4).toMatch(/(in-person|peacefully|promissory|document|legal)/i);
  });

  it("validates priest portal engine generateSankhyaPrashnaReading produces 4 technical paragraphs with practical steps", async () => {
    const result = await generateSankhyaPrashnaReading({
      number: 81,
      question: "Can I get back my money lent to colleague?",
      devoteeName: "Suresh",
      gothra: "ಕೌಶಿಕ"
    });

    expect(result.technicalParagraphs).toHaveLength(4);
    // Paragraph 1 is direct verdict
    expect(result.technicalParagraphs[0].titleKn).toContain("೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ");
    expect(result.technicalParagraphs[0].contentKn).toMatch(/(ಸದ್ಯಕ್ಕೆ|ಹಣ|ಖಚಿತ)/);

    // Paragraph 2 is causal ground reality
    expect(result.technicalParagraphs[1].titleKn).toContain("೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು?");

    // Paragraph 3 is timeline
    expect(result.technicalParagraphs[2].titleKn).toContain("೩. ನಿಖರ ಕಾಲಾವಧಿ");

    // Paragraph 4 is remedy + practical steps
    expect(result.technicalParagraphs[3].titleKn).toContain("೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು");
    expect(result.technicalParagraphs[3].contentKn).toMatch(/(ಶಾಂತಿಯುತವಾಗಿ|ಮುಖಾಮುಖಿ|ಲಿಖಿತ|ಸಮಾಲೋಚನೆ)/);
  });
});
