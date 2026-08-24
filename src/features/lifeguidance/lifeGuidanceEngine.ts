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
  customQnA?: { question: string; answer: string };
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

  // Comprehensive 4-5 Long Paragraph Fallback Narratives (5-6 Lines per Paragraph)
  const fallbackCareer = langCode === "kn"
    ? `ನಿಮ್ಮ ಜನನ ಕುಂಡಲಿಯ ೧೦ನೇ ಭಾವದ (ಧನ ಹಾಗೂ ಕರ್ಮ ಸ್ಥಾನ) ಗ್ರಹಗಳ ಶುಭ ದೃಷ್ಟಿಯಿಂದಾಗಿ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಹಾಗೂ ಸ್ಥಿರವಾದ ಉನ್ನತಿ ಯೋಗವಿದೆ. ದಶಮಾಧಿಪತಿಯು ಲಗ್ನ ಭಾವದೊಂದಿಗೆ ಸಾಮೀಪ್ಯ ಹೊಂದಿದ್ದು, ನಿಮ್ಮ ಕಾರ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಸ್ವಂತ ಶ್ರಮದಿಂದ ಸಮಾಜದಲ್ಲಿ ನಾಯಕತ್ವ ಹಾಗೂ ಗೌರವ ಪ್ರತಿಷ್ಠೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.\n\nನಿಮ್ಮ ಜೀವನದ ೨೪, ೨೮, ೩೬, ೪೪ ಹಾಗೂ ೫೨ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ವೃತ್ತಿಪರವಾಗಿ ಬೃಹತ್ ಯಶಸ್ಸು, ಹುದ್ದೆ ಬಡ್ತಿ ಹಾಗೂ ನೂತನ ಉದ್ಯೋಗ ಸಂಸ್ಥಾಪನೆಯ ಸುವರ್ಣ ಅವಕಾಶಗಳು ಎದುರಾಗಲಿವೆ. ವ್ಯಾಪಾರ ಹಾಗೂ ವಾಣಿಜ್ಯ ರಂಗದಲ್ಲಿ ತೊಡಗಿರುವವರಿಗೆ ಧನ ಭಾಗ್ಯ ವೃದ್ಧಿಯಾಗಲಿದ್ದು, ವಿದೇಶಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಪಾರ ಲಾಭ ಸಿಗಲಿದೆ.\n\nಪ್ರಸ್ತುತ ಚಲಿಸುತ್ತಿರುವ ${dashaStr} ಸಮಯದಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ದಿವ್ಯ ಬಲದಿಂದ ನಿಮ್ಮ ಶತ್ರುಗಳ ಕುತಂತ್ರಗಳು ನಾಶವಾಗಿ, ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಾರ್ವಜನಿಕ ರಂಗದಲ್ಲಿ ನಿರತರಾದವರಿಗೆ ಉನ್ನತ ರಾಜಕೀಯ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನಗಳು ದೊರೆಯುವ ಭಾಗ್ಯವಿದೆ.\n\nಕುಂಡಲಿಯಲ್ಲಿ ೧೦ನೇ ಮನೆಗೆ ರಾಹು-ಕೇತು ಅಥವಾ ಶನಿ-ಮಾಂದಿ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಅಕಾಲಿಕ ಕಿರಿಕಿರಿ, ಮೇಲಧಿಕಾರಿಗಳ ಅಸಮಾಧಾನ ಹಾಗೂ ಆಕಸ್ಮಿಕ ಧನ ನಷ್ಟದ ಲಕ್ಷಣಗಳು ಕಂಡುಬರುತ್ತವೆ. ಇದನ್ನು ನಿವಾರಿಸಲು ಜಾತಕದಲ್ಲಿರುವ ಮಾಂದಿ ಹಾಗೂ ಕಾಲಸರ್ಪ ದೋಷಕ್ಕೆ ಶಾಂತಿ ಪೂಜೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ.\n\nಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ, ರುದ್ರ ಹವನ ಹಾಗೂ ನವಗ್ರಹ ಧನದಾ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ ನೆರವೇರಿಸುವುದರಿಂದ ನಿಮ್ಮ ವೃತ್ತಿ ಪ್ರತಿಬಂಧಕಗಳು ಶಮನವಾಗಿ, ದಿವ್ಯ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ ಲಭಿಸಲಿದೆ.`
    : `According to your 10th house planetary placement, strong career advancement and financial recognition are highlighted around ages 24, 28, 36, 44, and 52.\n\nStrategic leadership roles in enterprise management or business ventures will yield prosperity under the current ${dashaStr} transit.\n\nYour hard work and dedication will earn you prestige and respect in society, with favorable growth opportunities in foreign or expanding markets.\n\nNatal planet afflictions may cause minor job stress or delay promotions. Gokarna Mahabaleshwara Rudrabhisheka is recommended to unlock ultimate career success.\n\nPerforming specific Gokarna Sevas like Mahamrityunjaya Homa and Navagraha Shanti will neutralize professional obstacles and attract divine prosperity.`;

  const fallbackRelationship = langCode === "kn"
    ? `ನಿಮ್ಮ ಕುಂಡಲಿಯ ೭ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ) ಹಾಗೂ ಪ್ರೇಮ ಕಾರಕ ಶುಕ್ರ ಗ್ರಹದ ಅನುಕೂಲಕರ ಸ್ಥಾನದಿಂದಾಗಿ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಗಾಢವಾದ ಪ್ರೇಮ, ಅನ್ಯೋನ್ಯತೆ ಹಾಗೂ ಸಂಸಾರಿಕ ಸಾಮರಸ್ಯ ನೆಲೆಸಲಿದೆ. ನಿಮ್ಮ ಸಂಗಾತಿಯು ಅತ್ಯಂತ ಸುಸಂಸ್ಕೃತ, ದೈವಭಕ್ತ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ಕುಟುಂಬದ ಹಿನ್ನೆಲೆಯಿಂದ ಬರುವವರಾಗಿರುತ್ತಾರೆ.\n\nಕುಟುಂಬ ಜೀವನದ ೨೫, ೨೯, ೩೪ ಹಾಗೂ ೪೨ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಕುಟುಂಬ ಸೌಖ್ಯ, ಗ್ರಹ ನಿರ್ಮಾಣ ಹಾಗೂ ದಾಂಪತ್ಯದ ಶ್ರೇಷ್ಠ ಮೈಲಿಗಲ್ಲುಗಳು ನೆರವೇರಲಿವೆ. ದಂಪತಿಗಳಿಬ್ಬರ ವೈಚಾರಿಕ ಒಗ್ಗಟ್ಟು ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಕಲ್ಯಾಣವನ್ನು ತರಲಿದ್ದು, ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ದಾಂಪತ್ಯ ಮಾದರಿಯಾಗಲಿದೆ.\n\nಸಂಗಾತಿಯ ಆಗಮನದ ನಂತರ ನಿಮ್ಮ ಧನ ಭಾಗ್ಯ ಹಾಗೂ ಅದೃಷ್ಟ ದ್ವಿಗುಣಗೊಳ್ಳಲಿದ್ದು, ನಿರಂತರ ಸನ್ಮಾನ ದೊರೆಯಲಿದೆ. ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಸಹಕಾರ ಮನೋಭಾವದಿಂದ ಕುಟುಂಬದ ಪ್ರತಿಯೊಂದು ಕಷ್ಟಗಳನ್ನು ಸುಲಭವಾಗಿ ಎದುರಿಸಿ ಜಯ ಸಾಧಿಸುವ ಸಾಮರ್ಥ್ಯ ಲಭಿಸಲಿದೆ.\n\nಜಾತಕದ ೭ನೇ ಭಾವಕ್ಕೆ ಕುಜ ಗ್ರಹದ (ಮಂಗಳ ದೋಷ) ಅಥವಾ ಸರ್ಪ ದೋಷದ ಪ್ರಭಾವವಿರುವುದರಿಂದ ದಾಂಪತ್ಯದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಮನಸ್ತಾಪಗಳು, ವೈಚಾರಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಹಾಗೂ ಸಂಬಂಧಿಕರ ನಡುವೆ ಅನಗತ್ಯ ಗೊಂದಲಗಳು ಉಂಟಾಗಬಹುದು.\n\nಈ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶ್ರೀ ನಾಗಪ್ರತಿಷ್ಠೆ, ಸರ್ಪ ಶಾಪ ವಿಮೋಚನಾ ಶಾಂತಿ ಹಾಗೂ ಉಮಾಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ದಾಂಪತ್ಯದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ದಿವ್ಯ ಸುಖ ಸಿಗಲಿದೆ.`
    : `Your 7th house and Venus placement promise deep marital harmony, mutual respect, and emotional warmth throughout your joint journey.\n\nYour spouse will bring high cultural values, spiritual grace, and supportive lineage, elevating your family's social standing.\n\nKey relationship milestones around ages 25, 29, and 34 will bring domestic joy, property acquisition, and family togetherness.\n\nPotential Kuja or Sarpa Dosha influences may trigger transient communication gaps. Spiritual remedies will restore balance.\n\nPerforming Gokarna Nagapratishtha and Uma Maheshwara Puja will dissolve marital hurdles and bless your family with enduring love.`;

  const fallbackHealth = langCode === "kn"
    ? `ನಿಮ್ಮ ಜನನ ಜಾತಕದ ೬ನೇ ಮನೆ (ಆರೋಗ್ಯ ಹಾಗೂ ಋಣ ಸ್ಥಾನ) ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ದಿವ್ಯ ಸನ್ನಿವೇಶದ ಪ್ರಕಾರ ನಿಮ್ಮ ಆಯುಷ್ಯ ಭಾವ ಹಾಗೂ ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಅತ್ಯಂತ ದೃಢವಾಗಿದೆ. ನೈಸರ್ಗಿಕವಾಗಿ ಧಾತು ಶಕ್ತಿ ಹೆಚ್ಚಿದ್ದು, ರೋಗನಿರೋಧಕ ಕವಚ ನಿಮ್ಮನ್ನು ಕಾಯಲಿದೆ.\n\nಜೀವನದ ೪೨, ೪೮, ೫೪ ಹಾಗೂ ೬೨ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಉದರ ಸಂಬಂಧಿ ತೊಂದರೆಗಳು, ಜಠರ ಅಗ್ನಿ ವಿಕಾರ ಹಾಗೂ ರಕ್ತದೊತ್ತಡದ ಬಗ್ಗೆ ಸೂಕ್ತ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಶ್ರೇಷ್ಠ. ಸರಿಯಾದ ಆಹಾರ ಪದ್ಧತಿ ಹಾಗೂ ಪ್ರಾಣಾಯಾಮ ಅಭ್ಯಾಸದಿಂದ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ಸ್ಥಿರವಾಗಿರಲಿದೆ.\n\nನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಶ್ರೀ ಧನ್ವಂತರಿ ಸೂಕ್ತ ಪಠಣ ಹಾಗೂ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಮಂತ್ರ ಜಪಿಸುವುದರಿಂದ ಮನಃಶಾಂತಿ, ಶಾರೀರಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ನಿರಂತರ ದೀರ್ಘಾಯುಷ್ಯ ಭಾಗ್ಯ ಸಿದ್ಧಿಸಲಿದೆ. ಕಾಯ ವಾಚಾ ಮನಸಾ ಶಿವ ಸ್ಮರಣೆ ದಿವ್ಯ ರಕ್ಷೆಯಾಗಲಿದೆ.\n\nಕುಂಡಲಿಯಲ್ಲಿ ೬ನೇ ಭಾವಕ್ಕೆ ಮಾಂದಿ ಅಥವಾ ಶನಿ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ಆಕಸ್ಮಿಕ ಶಾರೀರಿಕ ಆಯಾಸ, ನರಗಳ ದೌರ್ಬಲ್ಯ ಹಾಗೂ ಅಕಾರಣ ಭೀತಿ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಜಾತಕದ ಈ ಅತೃಪ್ತ ದೋಷಕ್ಕೆ ಸೂಕ್ತ ಪ್ರಾಯಶ್ಚಿತ್ತ ಶಾಂತಿ ಅತ್ಯಗತ್ಯ.\n\nಗೋಕರ್ಣ ಕಡಲತೀರದಲ್ಲಿ ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ, ಧನ್ವಂತರಿ ಹವನ ಹಾಗೂ ನವಗ್ರಹ ದೋಷ ನಿವಾರಣಾ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ನೆರವೇರಿಸುವುದರಿಂದ ನಿಮಗೂ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೂ ಸಕಲ ರೋಗ ಭಯ ಮುಕ್ತಿಯಾಗಿ ದೀರ್ಘಾಯುಷ್ಯ ಲಭಿಸಲಿದೆ.`
    : `Overall physical vitality, immune resistance, and longevity remain exceptionally robust based on your Lagna lord's position.\n\nMaintain balanced nutrition and regular yoga habits, taking extra care during ages 42, 48, and 54 regarding digestive wellness.\n\nDaily chanting of Dhanvantari Stotram and Shiva Panchakshari Mantra will sustain your mental calm and physical energy.\n\nMaandi or Saturn transits may cause occasional fatigue or insomnia. Specific Shanti pujas are recommended.\n\nConducting Gokarna Mahamrityunjaya Homa and Navagraha Shanti will remove health vulnerabilities and grant long-life blessings.`;

  const fallbackChildren = langCode === "kn"
    ? `ನಿಮ್ಮ ಕುಂಡಲಿಯ ೫ನೇ ಮನೆ (ಪುತ್ರ ಹಾಗೂ ಸಂತಾನ ಸ್ಥಾನ) ಹಾಗೂ ಗುರು ಗ್ರಹದ ದಿವ್ಯ ಅನುಗ್ರಹದಿಂದಾಗಿ ನಿಮ್ಮ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ಬೃಹತ್ ಯೋಗವಿದೆ. ನಿಮಗವತರಿಸುವ ಸಂತಾನವು ಶ್ರೇಷ್ಠ ಬುದ್ಧಿವಂತಿಕೆ, ಸಾತ್ವಿಕ ಗುಣ ಹಾಗೂ ತೇಜಸ್ಸಿನಿಂದ ಕೂಡಿರಲಿದೆ.\n\nನಿಮ್ಮ ಜೀವನದ ೨೬, ೩೦, ೩೫ ಹಾಗೂ ೪೧ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಸಂತಾನ ಪ್ರಾಪ್ತಿ, ಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣ ಯಶಸ್ಸು ಹಾಗೂ ವಿದೇಶಿ ಶೈಕ್ಷಣಿಕ ಸಾಧನೆಗಳ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳು ನೆರವೇರಲಿವೆ. ನಿಮ್ಮ ಮಕ್ಕಳು ಕುಲಕ್ಕೆ ಕೀರ್ತಿ ತರುವ ಶ್ರೇಷ್ಠ ಸಾಧಕರಾಗಲಿದ್ದಾರೆ.\n\nಮಕ್ಕಳ ಶೈಕ್ಷಣಿಕ ವಿಕಾಸಕ್ಕಾಗಿ ಮನೆಯಲ್ಲಿ ಪ್ರತಿದಿನ ಶ್ರೀ ಸರಸ್ವತಿ ಮಂತ್ರ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಕವಚ ಪಠಿಸುವುದು ಶ್ರೇಷ್ಠ. ಮಕ್ಕಳ ಪ್ರತಿಯೊಂದು ಜ್ಞಾನಾರ್ಜನೆಯ ಮೆಟ್ಟಿಲುಗಳಿಗೂ ದೇವರ ದಿವ್ಯ ಆಶೀರ್ವಾದ ಲಭಿಸಲಿದೆ.\n\nಜಾತಕದ ೫ನೇ ಮನೆಗೆ ಪಿತೃ ದೋಷ, ನಾಗ ದೋಷ ಅಥವಾ ಪ್ರೇತ ದೋಷದ ಛಾಯೆ ಇರುವುದರಿಂದ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ವಿಳಂಬ, ಗರ್ಭ ಸ್ರಾವದ ಭಯ ಅಥವಾ ಮಕ್ಕಳ ಆರೋಗ್ಯದಲ್ಲಿ ಹಠಾತ್ ಏರಿಳಿತಗಳು ಕಂಡುಬರಬಹುದು.\n\nಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಹಾಗೂ ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಕೃಷ್ಣ ಹವನ ನೆರವೇರಿಸುವುದರಿಂದ ಸಂತಾನ ಪ್ರತಿಬಂಧಕಗಳೆಲ್ಲವೂ ನಾಶವಾಗಿ, ಸಕಲ ವಂಶಾಭಿವೃದ್ಧಿ ಯೋಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
    : `Your 5th house and Jupiter (Guru) transits indicate bright progeny prospects, lineage expansion, and family joy.\n\nYour children will display high intellect, artistic talents, and academic brilliance, bringing pride to your ancestral name.\n\nKey progeny milestones around ages 26, 30, and 35 will mark educational and career achievements for your children.\n\nPotential Pitru or Nagadosha afflictions in the 5th house could cause temporary delays in progeny. Remedial rituals will clear obstacles.\n\nPerforming Gokarna Narayana Bali, Tripindi Shraddha, and Santana Gopala Homa will neutralize ancestral karmas and ensure progeny bliss.`;

  let careerText = fallbackCareer;
  let relText = fallbackRelationship;
  let healthText = fallbackHealth;
  let childText = fallbackChildren;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      const prompt = `
You are Sri Shreeram Pandit, Master Vedic Astrologer from Gokarna Mahabaleshwara Kshetra.
Provide 4 deeply thorough, authentic astrological life forecasts for ${personName} (DOB: ${dob}, TOB: ${tob}, Gender: ${gender}):
- Natal Astronomical Parameters: Rashi (${rashiStr}), Nakshatra (${nakshatraStr}), Lagna (${lagnaStr}), Dasha (${dashaStr}).

STRICT LENGTH & PARAGRAPH REQUIREMENTS:
- Provide EXACTLY 4 to 5 LONG, RICH PARAGRAPHS (5 to 6 lines per paragraph) for EACH of the 4 sections.
- EACH PARAGRAPH MUST BE AT LEAST 5 TO 6 LINES LONG of authentic, highly accurate, emotional Vedic astrological narration.
- DO NOT WRITE SHORT 1-2 LINE PARAGRAPHS. Write comprehensive, paragraph-dense guidance.

NATAL DOSHA & GOKARNA SEVA DIAGNOSTIC REQUIREMENTS:
In each section's final dedicated remedy paragraph, diagnose specific natal Doshas (Pitru Dosha / Tripindi Shraddha, Narayana Bali, Kalasarpa Shanti, Naga Pratishtha, Kuja Shanti, Maandi Shanti, Pretoddhara) and explicitly explain:
1. WHY this specific Gokarna Puja/Homa is required according to their birth chart.
2. WHAT spiritual significance it holds in Gokarna Mahabaleshwara Kshetra.
3. HOW performing this Seva will remove karma obstacles & bless their life!

Format with JSON markers:
[CAREER_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 10th house, Dasha eras, career promotion ages, business wealth & Gokarna Seva remedies.
[RELATIONSHIP_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 7th house, Venus placement, spouse characteristics, marital peace & Gokarna Seva remedies.
[HEALTH_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 6th house, physical vitality, longevity ages, health precautions & Gokarna Seva remedies.
[CHILDREN_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 5th house, Jupiter transit, progeny timing, lineage growth & Gokarna Seva remedies.

Rules:
- Write EXCLUSIVELY in script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT use Latin script letters inside Indian language text.
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

/** Ask Custom Astrological Question for Life Guidance */
export async function askCustomLifeQuestion(
  result: LifeGuidanceResult,
  question: string,
  lang: string = "kn",
  apiKey?: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);
  const fallback = langCode === "kn"
    ? `ನಿಮ್ಮ ಜಾತಕದ ಗ್ರಹ ಗತಿಗಳ ಆಧಾರದಲ್ಲಿ, ನೀವು ಕೇಳಿದ "${question}" ಪ್ರಶ್ನೆಗೆ ಅನುಕೂಲಕರ ಯೋಗವಿದೆ. ಪ್ರಸ್ತುತ ದಶಾ ಬಲದಿಂದಾಗಿ ಧೈರ್ಯ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಕೈಗೊಂಡ ನಿರ್ಧಾರಗಳು ಶ್ರೇಷ್ಠ ಯಶಸ್ಸು ನೀಡಲಿವೆ. ಧರ್ಮ ಕಾರ್ಯ ಹಾಗೂ ದೈವ ಪ್ರಾರ್ಥನೆಯಿಂದ ಸಕಲ ಶುಭ ಫಲ ಸಿದ್ಧಿಸಲಿದೆ.`
    : `Based on your planetary transits, your query "${question}" holds favorable alignment. Patience and clear strategy will yield success.`;

  if (!apiKey) return fallback;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `
You are Sri Shreeram Pandit, Master Vedic Astrologer from Gokarna Mahabaleshwara Kshetra.
The devotee ${result.personName} (Rashi: ${result.rashi[langCode] || result.rashi.kn}, Nakshatra: ${result.nakshatra[langCode] || result.nakshatra.kn}) has asked a custom personal query:
"${question}"

STRICT LENGTH & PARAGRAPH REQUIREMENTS:
- Provide EXACTLY 4 to 5 LONG, RICH PARAGRAPHS (5 to 6 lines per paragraph).
- 1st-3rd Paragraphs: Deep astronomical planetary analysis, house lords, Dasha transits & practical guidance.
- 4th-5th Paragraphs: Specific Gokarna Seva / Puja remedies (e.g. Narayana Bali, Tripindi Shraddha, Kalasarpa Shanti, Nagapratishtha, Kuja Shanti, Maandi Shanti).
- Explicitly detail WHY this puja is required for their query, WHAT spiritual significance it holds in Gokarna Mahabaleshwara Kshetra, and HOW it will transform their life!

Rules:
- Write EXCLUSIVELY in script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT mix English letters in Kannada script. Write pure native script.
`;

    const res = await model.generateContent(prompt);
    return (await res.response).text() || fallback;
  } catch (err) {
    console.error("Custom Question AI Error:", err);
    return fallback;
  }
}
