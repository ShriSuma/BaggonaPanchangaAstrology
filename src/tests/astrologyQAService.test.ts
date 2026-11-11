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

    if (title.includes("Hiranya") || title.includes("ಹಿರಣ್ಯ") || title.includes("Punarvasu") || title.includes("ಪುನರ್ವಸು")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಅವಕಹಡಾ ಚಕ್ರದ ಪ್ರಕಾರ 'ಹಿ' (Hi) ಅಕ್ಷರದಿಂದ ಪ್ರಾರಂಭವಾಗುವ ಹೆಸರು 'ಹಿರಣ್ಯಾಕ್ಷ' (Hiranyaksha) ಪುನರ್ವಸು ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದಕ್ಕೆ ಸೇರುತ್ತದೆ. ಇದರ ರಾಶಿ ಕರ್ಕಾಟಕ (ಅಧಿಪತಿ ಚಂದ್ರ), ನಕ್ಷತ್ರ ಅಧಿಪತಿ ಗುರು, ದೇವತೆ ಅದಿತಿ ದೇವಿ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಪುನರ್ವಸು ೪ನೇ ಪಾದವು ಅತ್ಯಂತ ಮಂಗಳಕರವಾದ ಜನ್ಮ ಪಾದವಾಗಿದೆ. ಗುರು ಮತ್ತು ಚಂದ್ರರ ಸಮನ್ವಯದಿಂದ ಜ್ಞಾನ ಮತ್ತು ಧರ್ಮ ಲಾಭವಾಗುತ್ತದೆ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಶ್ರೀರಾಮ ತಾರಕ ಮಂತ್ರ ಮತ್ತು ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ.
೨. ಗುರುವಾರ ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ ಅಥವಾ ಹಳದಿ ಹೂವುಗಳ ಸಮರ್ಪಣೆ.
೩. ಗೋ-ಸೇವೆ ಮತ್ತು ಬ್ರಾಹ್ಮಣ ಭೋಜನ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಪುನರ್ವಸು ೪ನೇ ಪಾದದ ಜಾತಕರಿಗೆ ಅದಿತಿ ದೇವಿಯ ಸಂಪೂರ್ಣ ಕೃಪೆ ಇರುತ್ತದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    }

    if (title.includes("Panchanga") || title.includes("ಪಂಚಾಂಗ")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಸಂವತ್ಸರ, ಮಾಸ, ಪಕ್ಷ, ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣಗಳ ದೈವಿಕ ವಿವರಣೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಅಭಿಜಿತ್ ಮುಹೂರ್ತ ಮತ್ತು ಶುಭ ಹೋರಾ ಸಮಯಗಳು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ದಿನವು ಮಂಗಳಕರವಾಗಿರಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    }

    if (title.includes("Shraddha") || title.includes("ಶ್ರಾದ್ಧ") || title.includes("Marana") || title.includes("ಮರಣ")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಧರ್ಮಸಿಂಧು ಮತ್ತು ನಿರ್ಣಯಸಿಂಧು ಪ್ರಕಾರ ಮರಣ ದಿನಾಂಕ ೨೦೨೩-೦೪-೧೨ ರಂದು ಚೈತ್ರ ಮಾಸ ಕೃಷ್ಣ ಪಕ್ಷ ಸಪ್ತಮಿ ತಿಥಿ ಮೂಲಾ ನಕ್ಷತ್ರವಾಗಿತ್ತು.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
೨೦೨೬ನೇ ಸಾಲಿನ ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧವು ಚೈತ್ರ ಮಾಸ ಕೃಷ್ಣ ಪಕ್ಷ ಸಪ್ತಮಿಯಂದು ಅಪರಾಹ್ನ ಕಾಲ ೧:೩೦ ರಿಂದ ೩:೪೫ ರೊಳಗೆ ನಡೆಯಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಪಿತೃ ತರ್ಪಣ ಮತ್ತು ತಿಲಾಂಜಲಿ.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ತಿಲ ಹೋಮ ಮತ್ತು ನಾರಾಯಣ ಬಲಿ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಪಿತೃಗಳಿಗೆ ಸದ್ಗತಿಯಾಗಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    }

    if (title.includes("surrender") || title.includes("hotel") || title.includes("ಒಪ್ಪಿಸ")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಹೊಟೇಲ್ ಒಪ್ಪಿಸುವಿಕೆ ಹಾಗೂ ಋಣ ಮುಕ್ತಿಗೆ ಮುಹೂರ್ತ ಚಿಂತಾಮಣಿ ಪ್ರಕಾರ ಮಂಗಳವಾರದ ಭೌಮೇ ಋಣವಿಮೋಚನಾ ಯೋಗ ಶ್ರೇಷ್ಠ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಮಂಗಳವಾರ ಮತ್ತು ಗುರುವಾರದ ಶುಭ ದಿನಗಳಲ್ಲಿ ಅಭಿಜಿತ್ ಮುಹೂರ್ತ ೧೧:೪೫ - ೧೨:೩೫ ರ ಸಮಯದಲ್ಲಿ ಒಪ್ಪಿಸಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಋಣಮೋಚಕ ಮಂಗಳ ಸ್ತೋತ್ರ ಪಠಣ.
೨. ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕೆ ಅರ್ಚನೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಹಳೆಯ ಹೊಣೆಗಾರಿಕೆಗಳಿಂದ ಮುಕ್ತಿ ದೊರೆಯಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    }

    if (title.includes("festival") || title.includes("Ganesh") || title.includes("ಗಣೇಶ") || title.includes("ಹಬ್ಬ")) {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ (ಗಣೇಶ ಚತುರ್ಥಿ) ಭಾದ್ರಪದ ಮಾಸದ ಶುಕ್ಲ ಪಕ್ಷದ ಚತುರ್ಥಿ ತಿಥಿಯಂದು ಆಚರಿಸಲಾಗುತ್ತದೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಪೂಜಾ ಮುಹೂರ್ತವು ಮಧ್ಯಾಹ್ನ ೧೧:೧೫ ರಿಂದ ೦೧:೩೫ ರವರೆಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾಗಿದೆ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಮೋದಕ ನೈವೇದ್ಯ ಮತ್ತು ಗರಿಕೆ ಅರ್ಚನೆ.
೨. ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ ಜಪ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಸರ್ವ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಲಿ.
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

  it("accurately resolves devotee name 'Hiranya Aksha' to Punarvasu Nakshatra 4th Pada Cancer via Avakahada Chakra", async () => {
    const result = await askBaggonaAstrology({
      question: "Hiranya Aksha whose name it is, which nakshatra and pada does it belong to?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("name_nakshatra_lookup");
    expect(result.nameLookupData).toBeDefined();
    expect(result.nameLookupData?.nakshatraName).toBe("Punarvasu");
    expect(result.nameLookupData?.nakshatraNameKn).toBe("ಪುನರ್ವಸು");
    expect(result.nameLookupData?.pada).toBe(4);
    expect(result.nameLookupData?.rashiNameKn).toContain("ಕರ್ಕಾಟಕ");
    expect(result.nameLookupData?.syllableKn).toBe("ಹಿ");
    // Ensure it NEVER hallucinates Mula Nakshatra or Gandanta Dosha
    expect(result.sections[0].content).not.toContain("ಮೂಲಾ ನಕ್ಷತ್ರ");
    expect(result.sections[0].content).toContain("ಪುನರ್ವಸು");
  });

  it("accurately handles Kannada name lookup query 'ಹಿರಣ್ಯಾಕ್ಷ ನಕ್ಷತ್ರ ಮತ್ತು ಪಾದ ಯಾವುದು?'", async () => {
    const result = await askBaggonaAstrology({
      question: "ಹಿರಣ್ಯಾಕ್ಷ ನಕ್ಷತ್ರ ಮತ್ತು ಪಾದ ಯಾವುದು?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("name_nakshatra_lookup");
    expect(result.nameLookupData).toBeDefined();
    expect(result.nameLookupData?.pada).toBe(4);
    expect(result.nameLookupData?.nakshatraNameKn).toBe("ಪುನರ್ವಸು");
  });

  it("identifies today's Baggona Panchanga intent and includes 6 Angas", async () => {
    const result = await askBaggonaAstrology({
      question: "ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮತ್ತು ಹೋರಾ ಸಮಯ ತಿಳಿಸಿ",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("panchanga_today");
    expect(result.sections.length).toBe(4);
  });

  it("calculates Marana demise Tithi and determines Pratyabdika Shraddha date in target year", async () => {
    const result = await askBaggonaAstrology({
      question: "Person died on 2023-04-12, when will Pratyabdika Shraddha come in 2026? What was the Tithi and Nakshatra?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("marana_shraddha");
    expect(result.maranaShraddhaData).toBeDefined();
    expect(result.maranaShraddhaData?.demiseDate).toBe("2023-04-12");
    expect(result.maranaShraddhaData?.demiseMasaKn).toContain("ಚೈತ್ರ");
    expect(result.maranaShraddhaData?.demisePakshaKn).toContain("ಕೃಷ್ಣ");
    expect(result.maranaShraddhaData?.demiseTithiKn).toContain("ಸಪ್ತಮಿ");
    expect(result.maranaShraddhaData?.targetYear).toBe(2026);
    expect(result.maranaShraddhaData?.pratyabdikaFormattedKn).toBeDefined();
    expect(result.maranaShraddhaData?.aparahnaKala).toContain("ಅಪರಾಹ್ನ");
    expect(result.maranaShraddhaData?.gokarnaSevas.length).toBeGreaterThan(0);
    expect(result.sections.length).toBe(4);
  });

  it("calculates Muhurtha for surrendering hotel and business closure with Rina Vimochana principles", async () => {
    const result = await askBaggonaAstrology({
      question: "We are surrendering our hotel and closing commercial lease, what is the best Muhurtha according to Baggona Panchanga?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("surrender_closure_muhurtha");
    expect(result.surrenderMuhurthaData).toBeDefined();
    expect(result.surrenderMuhurthaData?.recommendedDays.length).toBeGreaterThan(0);
    expect(result.surrenderMuhurthaData?.inauspiciousAvoidDays.some(d => d.includes("ಶನಿವಾರ"))).toBe(true);
    expect(result.surrenderMuhurthaData?.rinaMuktiMantra).toBeDefined();
    expect(result.sections.length).toBe(4);
  });

  it("retrieves festival details and puja Muhurtha for Ganesha Chaturthi", async () => {
    const result = await askBaggonaAstrology({
      question: "When is Varasiddhi Vinayaka Vrata (Ganesha Chaturthi) in 2026 according to Baggona Panchanga?",
      language: "kn"
    });

    expect(result).toBeDefined();
    expect(result.detectedIntent).toBe("festival_vrata_details");
    expect(result.festivalData).toBeDefined();
    expect(result.festivalData?.festivalNameKn).toContain("ವಿನಾಯಕ");
    expect(result.festivalData?.pujaWindowKn).toBeDefined();
    expect(result.sections.length).toBe(4);
  });
});

