import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";

export type LifeGuidanceTabKey = "career" | "relationship" | "health" | "children";

export type LifeGuidanceInput = {
  personName: string;
  dob: string; // YYYY-MM-DD
  tob?: string; // HH:mm
  lat?: number;
  lon?: number;
  gender?: string;
  lang?: string;
};

export type LifeGuidanceTabResult = {
  title: Record<string, string>;
  narrativeText: string;
  keyAges: number[];
  favorableDirections: Record<string, string>;
  recommendedRemedies: Record<string, string>;
};

export type LifeGuidanceResult = {
  personName: string;
  dob: string;
  tob: string;
  gender: string;
  rashi: Record<string, string>;
  nakshatra: Record<string, string>;
  lagna: Record<string, string>;
  dasha: Record<string, string>;
  career: LifeGuidanceTabResult;
  relationship: LifeGuidanceTabResult;
  health: LifeGuidanceTabResult;
  children: LifeGuidanceTabResult;
  generatedAt: string;
};

/** Generate deep AI Life Guidance narrative using Gemini 3.5 Flash Lite */
export async function executeLifeGuidanceCalculation(
  input: LifeGuidanceInput,
  apiKey?: string
): Promise<LifeGuidanceResult> {
  const { personName, dob, tob = "12:00", lat = 14.5479, lon = 74.3188, gender = "Not specified", lang = "kn" } = input;
  const langCode = (lang || "kn").slice(0, 2);

  // Compute astrological parameters
  const baggona = calculateTraditionalBaggona(dob, tob, lat, lon, "lahiri");

  const rashiStr = baggona?.masaKn || "ವೃಷಭ ರಾಶಿ";
  const nakshatraStr = baggona?.moonNakshatraKn || "ಅನುರಾಧಾ";
  const lagnaStr = baggona?.sunNakshatraKn || "ಮಿಥುನ ಲಗ್ನ";
  const dashaStr = baggona?.dashaLord ? `${baggona.dashaLord} ಮಹಾದಶಾ (${baggona.dashaYears || 5} ವರ್ಷ)` : "ಶುಕ್ರ ಮಹಾದಶಾ";

  const rashiObj = { kn: rashiStr, en: baggona?.masa || "Taurus Rashi" };
  const nakshatraObj = { kn: nakshatraStr, en: baggona?.moonNakshatra || "Anuradha" };
  const lagnaObj = { kn: lagnaStr, en: baggona?.sunNakshatra || "Gemini Lagna" };
  const dashaObj = { kn: dashaStr, en: dashaStr };

  // Fallback Narratives
  const fallbackCareer = langCode === "kn"
    ? `ನಿಮ್ಮ ಜನನ ಕುಂಡಲಿಯ ೧೦ನೇ ಭಾವದ ಶುಭ ದೃಷ್ಟಿಯಿಂದಾಗಿ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹತ್ವದ ಉನ್ನತಿ ಯೋಗವಿದೆ. ವಿಶೇಷವಾಗಿ ೨೮ ಹಾಗೂ ೩೬ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಉದ್ಯೋಗ ಬದಲಾವಣೆ, ಬಡ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಧನ ಪ್ರತಿಷ್ಠೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.\n\nಪ್ರಸ್ತುತ ಚಲಿಸುತ್ತಿರುವ ${dashaStr} ಸಮಯದಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ಬಲದಿಂದ ಸ್ವಂತ ವ್ಯಾಪಾರ ಅಥವಾ ಆಡಳಿತಾತ್ಮಕ ಹುದ್ದೆಗಳಲ್ಲಿ ಜಯ ಸಿಗಲಿದೆ. ಗುರುವಾರ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕಡಲೆಬೇಳೆ ಅರ್ಪಿಸಿ.`
    : `According to your 10th house planetary alignment, strong career advancement and financial recognition are highlighted around ages 28 and 36. Strategic leadership roles will yield prosperity.`;

  const fallbackRelationship = langCode === "kn"
    ? `೭ನೇ ಮನೆ ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಅನುಕೂಲಕರ ಸ್ಥಾನದಿಂದಾಗಿ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪ್ರೇಮ ಹಾಗೂ ಸಾಮರಸ್ಯ ನೆಲೆಸಲಿದೆ. ಸಂಗಾತಿಯು ಸುಸಂಸ್ಕೃತ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ಕುಟುಂಬದವರಾಗಿರುತ್ತಾರೆ.\n\nಕುಟುಂಬದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಸುಖ ಹಾಗೂ ಸಮೃದ್ಧಿಗಾಗಿ ಮಂಗಳವಾರ ಹಾಗೂ ಶುಕ್ರವಾರ ದುರ್ಗಾದೇವಿ ಹಾಗೂ ಲಲಿತಾ ಸಹಸ್ರನಾಮ ಪಠಣೆ ಶ್ರೇಷ್ಠ.`
    : `Your 7th house and Venus placement promise deep marital harmony, mutual respect, and emotional warmth. Shared spiritual goals will elevate domestic happiness.`;

  const fallbackHealth = langCode === "kn"
    ? `೬ನೇ ಮನೆ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಸನ್ನಿವೇಶದ ಪ್ರಕಾರ ನಿಮ್ಮ ಆಯುಷ್ಯ ಹಾಗೂ ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಉತ್ತಮವಾಗಿದೆ. ೪೨ ಹಾಗೂ ೫೪ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಜಠರ ಹಾಗೂ ರಕ್ತದೊತ್ತಡದ ಬಗ್ಗೆ ಜಾಗ್ರತೆ ವಹಿಸುವುದು ಒಳಿತು.\n\nನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಧನ್ವಂತರಿ ಮಂತ್ರ ಹಾಗೂ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಶಾರೀರಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ನೀಡುತ್ತದೆ.`
    : `Overall physical vitality and longevity remain robust. Maintain balanced diet and mindfulness around ages 42 and 54. Daily Dhanvantari mantra recommended for vibrant health.`;

  const fallbackChildren = langCode === "kn"
    ? `೫ನೇ ಮನೆ ಹಾಗೂ ಗುರು ಗ್ರಹದ ಪುತ್ರ ಕಾರಕ ಬಲದಿಂದಾಗಿ ಉತ್ತಮ ಸಂತಾನ ಯೋಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ನಿಮ್ಮ ಮಕ್ಕಳು ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಸಾಧನೆ ಮಾಡಿ ವಂಶಕ್ಕೆ ಕೀರ್ತಿ ತರುತ್ತಾರೆ.\n\nಸಂತಾನ ವೃದ್ಧಿ ಹಾಗೂ ಶ್ರೇಯಸ್ಸಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ ಹಾಗೂ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪ ಮಾಡಿ.`
    : `The 5th house and Jupiter alignment signify auspicious progeny prospects. Children will achieve academic excellence and bring honour to the family lineage.`;

  let careerText = fallbackCareer;
  let relText = fallbackRelationship;
  let healthText = fallbackHealth;
  let childText = fallbackChildren;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      const prompt = `
You are Sri Shreeram Pandit, Master Vedic Astrologer from Gokarna Mahabaleshwara Kshetra.
Provide 4 highly detailed, 3-paragraph authentic astrological predictions for ${personName} (DOB: ${dob}, TOB: ${tob}, Gender: ${gender}):
- Birth Chart: Rashi (${rashiStr}), Nakshatra (${nakshatraStr}), Lagna (${lagnaStr}), Dasha (${dashaStr}).

Generate 4 sections formatted with JSON markers:
[CAREER_SECTION]
3-paragraph detailed career path, business timing, wealth eras & specific age milestones.
[RELATIONSHIP_SECTION]
3-paragraph detailed marriage timing, spouse personality, compatibility & domestic harmony.
[HEALTH_SECTION]
3-paragraph detailed health forecast, vitality, immune strength & preventive Vedic remedies.
[CHILDREN_SECTION]
3-paragraph detailed progeny timing, children prospects & lineage prosperity.

Rules:
- Write in requested language: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT mix English letters in Kannada script. Write pure native script.
`;

      const res = await model.generateContent(prompt);
      const text = (await res.response).text();

      if (text.includes("[CAREER_SECTION]")) {
        const parts = text.split(/\[(?:CAREER|RELATIONSHIP|HEALTH|CHILDREN)_SECTION\]/);
        if (parts.length >= 5) {
          careerText = parts[1].trim() || fallbackCareer;
          relText = parts[2].trim() || fallbackRelationship;
          healthText = parts[3].trim() || fallbackHealth;
          childText = parts[4].trim() || fallbackChildren;
        }
      }
    } catch (err) {
      console.error("Gemini Life Guidance Error:", err);
    }
  }

  return {
    personName,
    dob,
    tob,
    gender,
    rashi: rashiObj,
    nakshatra: nakshatraObj,
    lagna: lagnaObj,
    dasha: dashaObj,
    career: {
      title: { kn: "💼 ವೃತ್ತಿ ಮಾರ್ಗ ಹಾಗೂ ಧನ ಯೋಗ", en: "Career Path & Destiny Forecast" },
      narrativeText: careerText,
      keyAges: [24, 28, 36, 44, 52],
      favorableDirections: { kn: "ಉತ್ತರ ಹಾಗೂ ಪೂರ್ವ ದಿಕ್ಕು (North & East)", en: "North & East" },
      recommendedRemedies: { kn: "ಗುರುವಾರ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಕಡಲೆಬೇಳೆ ದಾನ.", en: "Rudrabhishekam on Thursdays & Gram donation." }
    },
    relationship: {
      title: { kn: "💞 ದಾಂಪತ್ಯ ಅನುಕೂಲತೆ ಹಾಗೂ ಕುಟುಂಬ ಸುಖ", en: "Detailed Relationship & Compatibility" },
      narrativeText: relText,
      keyAges: [25, 29, 34, 42],
      favorableDirections: { kn: "ಆಗ್ನೇಯ ಹಾಗೂ ಆಗ್ನೇಯ ದಿಕ್ಪಾಲಕರು (South-East)", en: "South-East" },
      recommendedRemedies: { kn: "ಶುಕ್ರವಾರ ದುರ್ಗಾದೇವಿಗೆ ಸೌಭಾಗ್ಯ ಲಲಿತಾ ಅರ್ಚನೆ ಹಾಗೂ ಕುಂಕುಮಾರ್ಚನೆ.", en: "Lalitha Archana & Kumkumarchana on Fridays." }
    },
    health: {
      title: { kn: "🏥 ಆರೋಗ್ಯ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಶಾರೀರಿಕ ಬಲ", en: "Health & Wellness Longevity Forecast" },
      narrativeText: healthText,
      keyAges: [32, 42, 54, 66],
      favorableDirections: { kn: "ಈಶಾನ ದಿಕ್ಕು (North-East)", en: "North-East" },
      recommendedRemedies: { kn: "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯನಮಸ್ಕಾರ ಹಾಗೂ ಧನ್ವಂತರಿ ಮಂತ್ರ ಜಪ.", en: "Surya Namaskar & Dhanvantari Mantra daily." }
    },
    children: {
      title: { kn: "👶 ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ವಂಶ ಶ್ರೇಯಸ್ಸು", en: "Children & Lineage Forecast" },
      narrativeText: childText,
      keyAges: [27, 31, 38],
      favorableDirections: { kn: "ಪೂರ್ವ ಹಾಗೂ ದಕ್ಷಿಣ-ಪೂರ್ವ (East & South-East)", en: "East & South-East" },
      recommendedRemedies: { kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಸಂತಾನ ಗೋಪಾಲ ಹೋಮ.", en: "Subramanya Naga Pratishtha & Santana Gopala Homa." }
    },
    generatedAt: new Date().toLocaleString()
  };
}
