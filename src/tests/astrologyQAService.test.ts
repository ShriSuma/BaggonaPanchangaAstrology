import { describe, it, expect, vi } from "vitest";
import { askBaggonaAstrology } from "../services/astrologyQAService";

// Mock askGemini to test both live logic and deterministic fallback
vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockImplementation(async (title, prompt, key, lang) => {
    if (title.includes("ಮೂಲಾ") || title.includes("Mula")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದವು ಧನು ರಾಶಿಯ ಗಂಡಾಂತ ಸಂಧಿಯಲ್ಲಿದ್ದು ಕೇತು ಗ್ರಹದ ಅಧಿಪತ್ಯದಲ್ಲಿದೆ. ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಇದು ಯಾವುದೇ ಶಾಶ್ವತ ಅಪಾಯವಲ್ಲ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಜನನದ ೨೭ನೇ ದಿನದಂದು ಅಥವಾ ಮುಂದಿನ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನದಂದು ಮೂಲಾ ಶಾಂತಿ ಮುಹೂರ್ತ ನಿಗದಿಪಡಿಸಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ೨೭ ಕಲಶ ಜಲ ಸ್ನಾನ ಮತ್ತು ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ.
೨. ತಂದೆಯು ಕಂಚಿನ ತುಪ್ಪದ ಪಾತ್ರೆಯಲ್ಲಿ ಮಗುವಿನ ಮುಖದ ಪ್ರತಿಬಿಂಬ ನೋಡುವುದು.
೩. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋ-ಸೇವೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶಾಂತಿ ನಂತರ ಮಗು ಅಸಾಧಾರಣ ಪ್ರತಿಭಾವಂತ ನಾಯಕನಾಗುತ್ತಾನೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    }

    if (title.includes("Revati") || title.includes("vehicle") || title.includes("ವಾಹನ")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ವಾಹನ ಖರೀದಿಗೆ ೪ನೇ ಸುಖ ಭಾವ ಮತ್ತು ಶುಕ್ರ ಬಲ ಮುಖ್ಯ. ರೇವತಿ ನಕ್ಷತ್ರ ಮತ್ತು ಮೀನ ರಾಶಿಗೆ ಶುಕ್ರವಾರ, ಗುರುವಾರ ಅತ್ಯುತ್ತಮ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಶುಕ್ರವಾರ ಮತ್ತು ಬುಧವಾರ ಬೆಳಿಗ್ಗೆ ಅಭಿಜಿತ್ ಮುಹೂರ್ತ ೧೧:೪೫ - ೧೨:೩೦ ಶುಭ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಗಣಪತಿ ಮತ್ತು ಹನುಮಂತನಿಗೆ ವಾಹನ ಪೂಜೆ.
೨. ೪ ಚಕ್ರಗಳ ಕೆಳಗೆ ನಿಂಬೆಹಣ್ಣು ಇರಿಸಿ ಚಾಲನೆ.
೩. ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ಜಪ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಈ ವಾಹನವು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸುಖ ಮತ್ತು ಸುರಕ್ಷತೆ ತರುತ್ತದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    }

    if (lang === "en") {
      return `### 1. Classical Shastra & Technical Analysis
Saturn transit through the 12th, 1st, and 2nd houses from your natal Moon sign signifies the 7.5 year cycle known as Sade Sati.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
The peak phase occurs when Saturn conjoins the natal Moon degree. Saturdays during Shukla Paksha are auspicious for remedial worship.

### 3. Sacred Remedies, Shanti Homa & Temple Sevas
1. Recite Hanuman Chalisa daily and perform Tailabhisheka on Saturdays.
2. Feed crows with sesame rice and help the needy.
3. Perform Shani Shanti at Gokarna Mahabaleshwara temple.

### 4. Astrologer's Verdict & Sacred Blessing
Saturn teaches patience, discipline, and humility. The trial is transformational.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }

    return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಸಪ್ತಮ ಭಾವ ಮತ್ತು ದಶಾ ವಿಶ್ಲೇಷಣೆ ಪ್ರಕಾರ ವಿವಾಹ ಯೋಗ ಸನ್ನಿಹಿತವಾಗಿದೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಮುಂಬರುವ ೬ ತಿಂಗಳಲ್ಲಿ ಗುರು ಗೋಚಾರ ಅನುಕೂಲಕರವಾಗಿದೆ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಕಾತ್ಯಾಯನಿ ಮಂತ್ರ ಜಪ ಮತ್ತು ಶಿವ-ಪಾರ್ವತಿ ಕಲ್ಯಾಣ ಪೂಜೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶುಭ ಫಲಗಳು ಪ್ರಾಪ್ತಿಯಾಗಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
  })
}));

describe("astrologyQAService", () => {
  it("answers Mula Nakshatra 1st Pada question with 4 structured sections in Kannada", async () => {
    const result = await askBaggonaAstrology({
      question: "ನನ್ನ ಸ್ನೇಹಿತನ ಮಗ ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದದಲ್ಲಿ ಜನಿಸಿದ್ದಾನೆ, ಇದು ಅಪಾಯವೇ? ಯಾವ ಶಾಂತಿ ಮಾಡಬೇಕು?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("nakshatra_pada_dosha");
    expect(result.sections.length).toBe(4);
    expect(result.sections[0].title).toContain("ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ");
    expect(result.sections[2].title).toContain("ದೈವಿಕ ಪರಿಹಾರ");
    expect(result.sections[2].content).toContain("ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ");
    expect(result.sections[3].content).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(result.spokenText).toBeDefined();
  });

  it("answers Revati Nakshatra Meena Rashi vehicle purchase question with timing and remedies", async () => {
    const result = await askBaggonaAstrology({
      question: "My friend Revati Nakshatra, Meena Rashi, when he can buy vehicle or what will be the good day for him in this month or next month? What is good Muhurtha based on Baggona Panchanga?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("muhurtha_timing");
    expect(result.sections.length).toBe(4);
    expect(result.sections[0].content).toContain("ವಾಹನ");
    expect(result.sections[1].content).toContain("ಮುಹೂರ್ತ");
    expect(result.sections[2].content).toContain("ವಾಹನ ಪೂಜೆ");
  });

  it("calculates authentic Lagna and 7th house when birth date and time are provided for marriage query", async () => {
    const result = await askBaggonaAstrology({
      question: "When will he get married? 7th house technical details?",
      language: "kn",
      birthDetails: {
        name: "Devotee Suresh",
        birthDate: "1994-06-15",
        birthTime: "10:30",
        place: "Kundapura",
        latitude: 13.6268,
        longitude: 74.6917
      }
    });

    expect(result).toBeDefined();
    expect(result.chartData).toBeDefined();
    expect(result.chartData?.lagna).toBeDefined();
    expect(result.chartData?.moonSign).toBeDefined();
    expect(result.chartData?.dashaText).toBeDefined();
    expect(result.chartData?.technicalHighlights.length).toBeGreaterThan(0);
    expect(result.sections.length).toBe(4);
  });

  it("supports English questions and outputs structured responses in English", async () => {
    const result = await askBaggonaAstrology({
      question: "What is Sade Sati and what are the best remedies according to Vedic astrology?",
      language: "en"
    });

    expect(result).toBeDefined();
    expect(result.sections.length).toBe(4);
    expect(result.detectedIntent).toBe("general_siddhanta");
    expect(result.sections[0].title).toContain("Classical Shastra");
    expect(result.sections[2].title).toContain("Remedies");
    expect(result.sections[3].title).toContain("Blessing");
  });
});

