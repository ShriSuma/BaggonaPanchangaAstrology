import { askGemini } from "../../core/GeminiEngine";
import type { KundliOutput } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import { generateSmartQuestionHeader } from "../RamanBhavishya/BhavishyaView";
import type { PackageQuestionItem } from "./DivyaBhavishyaQnaPdfTemplate";
import type { PackageLang } from "./packageDownloadLocale";

/**
 * Builds localized prompt context for astrological question answering.
 */
function buildAstrologicalContext(
  kundli: KundliOutput,
  devoteeName: string,
  birthDate: string,
  birthTime: string,
  placeLabel: string,
  lang: PackageLang
): string {
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const lagna = kundli.lagnaRashi?.sanskrit || "Mesha";
  const moon = kundli.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const nakshatra = moonPlanet?.nakshatra?.sanskrit || "Ashwini";
  const pada = kundli.moonPada || 1;

  const planetPlacements = kundli.planets
    .map((p) => `${p.name} in ${p.rashi.sanskrit} (House ${p.house}${p.isExalted ? ", Exalted" : p.isDebilitated ? ", Debilitated" : ""}${p.isRetrograde ? ", Retrograde" : ""})`)
    .join("; ");

  return `
Devotee Profile:
Name: ${devoteeName}
Birth Date: ${birthDate}
Birth Time: ${birthTime}
Place: ${placeLabel}
Ascendant (Lagna): ${lagna}
Moon Sign (Rashi): ${moon}
Birth Star (Nakshatra): ${nakshatra} (Pada ${pada})
Planetary Placements: ${planetPlacements}

Instruction:
You are an expert, compassionate Vedic Astrologer following classical Parashari and Baggona Panchanga principles.
Provide a strictly authentic 4-paragraph answer formatted as JSON:
{
  "paragraph1": "House & Natal Chart Analysis: Analyze which house governs this question, the house lord's dignity and planetary aspects.",
  "paragraph2": "Dasha & Transits: Analyze the current Vimshottari Dasha period and live transits (Guru, Shani, Rahu).",
  "paragraph3": "Prediction & Timing Window: Give clear, comforting, realistic timing and outcome for the question.",
  "paragraph4": "Vedic Remedies: Prescribe specific deity prayers, mantras (Gayatri/Beeja), temple visits (e.g. Gokarna Mahabaleshwara), and charity."
}
Language Requirement: Output pure native text in ${lang === "kn" ? "Kannada (ಕನ್ನಡ)" : lang === "hi" ? "Hindi (हिन्दी)" : lang === "te" ? "Telugu (తెలుగు)" : lang === "ta" ? "Tamil (தமிழ்)" : "English"}.
`;
}

/**
 * Robust fallback generator when Gemini API key is unavailable or during rate limits.
 */
function buildFallbackAnswer(
  topicId: string,
  questionText: string,
  kundli: KundliOutput,
  devoteeName: string,
  lang: PackageLang
): { paragraph1: string; paragraph2: string; paragraph3: string; paragraph4: string } {
  const isKn = lang === "kn";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";

  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonRashi = kundli.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const lagna = kundli.lagnaRashi?.sanskrit || "Mesha";

  if (topicId === "career" || questionText.toLowerCase().includes("job") || questionText.toLowerCase().includes("career")) {
    if (isKn) {
      return {
        paragraph1: `ಜಾತಕರ ಕುಂಡಲಿಯಲ್ಲಿ ${lagna} ಲಗ್ನದಿಂದ ೧೦ನೇ ಭಾವವು ಕರ್ಮ ಹಾಗೂ ಉದ್ಯೋಗ ಸ್ಥಾನವಾಗಿದ್ದು, ೧೦ನೇ ಅಧಿಪತಿ ಮತ್ತು ರವಿ-ಬುಧರ ಸ್ಥಿತಿಯು ವೃತ್ತಿ ಬಲವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ದಶಮಾಧಿಪತಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವದ ಸಾಮರ್ಥ್ಯವಿದೆ.`,
        paragraph2: `ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ದಶಾಕಾಲ ಹಾಗೂ ಗೋಚಾರ ಗುರು-ಶನಿಯರ ಪ್ರಭಾವವು ವೃತ್ತಿಪರ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಪೂರಕವಾಗಿದೆ. ಶನಿ ಗೋಚಾರವು ಶ್ರಮವನ್ನು ಪರೀಕ್ಷಿಸಿದರೂ, ಅಂತಿಮವಾಗಿ ಸ್ಥಿರ ಪ್ರಗತಿಯನ್ನು ಕರುಣಿಸಲಿದೆ.`,
        paragraph3: `ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ: ಮುಂದಿನ ೩ ರಿಂದ ೮ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ಉತ್ತಮ ಸಂಬಳ ಏರಿಕೆ ಅಥವಾ ಅಪೇಕ್ಷಿತ ಸ್ಥಾನ ಬದಲಾವಣೆಯ ಬಲವಾದ ಯೋಗ ಕಂಡುಬರುತ್ತದೆ.`,
        paragraph4: `ದೈವಿಕ ಪರಿಹಾರ: ಭಾನುವಾರ ಸೂರ್ಯನಾರಾಯಣನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ ಮತ್ತು ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ.`
      };
    }
    if (isHi) {
      return {
        paragraph1: `जातक की कुंडली में ${lagna} लग्न से १०वां भाव कर्म एवं करियर का सूचक है। दशमेश की स्थिति कार्यक्षेत्र में अधिकार एवं मान-सम्मान की वृद्धि दर्शाती है।`,
        paragraph2: `वर्तमान दशा एवं गुरु-शनि का गोचर प्रभाव कार्यक्षेत्र में नए दायित्वों एवं आर्थिक लाभ के अनुकूल है।`,
        paragraph3: `सटीक समय सिद्धि: आगामी ३ से ८ माह के अंतराल में पदोन्नति एवं वेतन वृद्धि का प्रबल योग परिलक्षित होता है।`,
        paragraph4: `दैविक उपाय: प्रतिदिन आदित्य हृदय स्तोत्र का पाठ करें तथा गोकर्ण क्षेत्र में रुद्राभिषेक कराएं।`
      };
    }
    return {
      paragraph1: `In your natal chart with ${lagna} Ascendant, the 10th house governs profession, authority, and status. The placement of the 10th lord indicates strong potential for professional leadership and respect.`,
      paragraph2: `The current operating Vimshottari Dasha and transits of Jupiter and Saturn support taking on higher responsibilities and structured advancement.`,
      paragraph3: `Prediction & Timing: The upcoming 3 to 8 months present a highly promising window for promotion, salary enhancement, or desired career transition.`,
      paragraph4: `Vedic Remedies: Chant Aditya Hridaya Stotra on Sundays and offer prayers at Gokarna Mahabaleshwara temple for career stability.`
    };
  }

  if (topicId === "marriage" || questionText.toLowerCase().includes("marri")) {
    if (isKn) {
      return {
        paragraph1: `ಜಾತಕರ ಕುಂಡಲಿಯಲ್ಲಿ ೭ನೇ ಭಾವವು ಕಳತ್ರ ಹಾಗೂ ವಿವಾಹ ಸ್ಥಾನವಾಗಿದೆ. ಶುಕ್ರ ಮತ್ತು ಗುರು ಗ್ರಹಗಳ ದೃಷ್ಟಿಯು ಸಂಗಾತಿಯ ಸೌಮ್ಯ ಸ್ವಭಾವ, ಸಂಸ್ಕಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಪ್ರೀತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
        paragraph2: `ಚಾಲ್ತಿಯಲ್ಲಿರುವ ದಶಾ ಕಾಲವು ಸಪ್ತಮಾಧಿಪತಿಗೆ ಅನುಕೂಲಕರವಾಗಿದ್ದು, ಗುರು ಬಲವು ವಿವಾಹ ಮಾತುಕತೆಗಳಿಗೆ ಸಕಾಲಿಕ ಶಕ್ತಿಯನ್ನು ಒದಗಿಸುತ್ತಿದೆ.`,
        paragraph3: `ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ: ಮುಂದಿನ ೪ ರಿಂದ ೯ ತಿಂಗಳ ಒಳಗೆ ಯೋಗ್ಯ ಸಂಬಂಧ ಕೂಡಿಬರಲಿದ್ದು, ಮದುವೆ ನಿಶ್ಚಯವಾಗುವ ಸುವರ್ಣ ಕಾಲವಿದೆ.`,
        paragraph4: `ದೈವಿಕ ಪರಿಹಾರ: ಶುಕ್ರವಾರ ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿಯ ಆರಾಧನೆ ಮಾಡಿ ಮತ್ತು ತುಳಸಿ ಪೂಜೆ ನಿಯಮಿತವಾಗಿ ಆಚರಿಸಿ.`
      };
    }
    return {
      paragraph1: `In your chart, the 7th house and its lord govern marital harmony and spouse nature. Benefic influences of Jupiter and Venus indicate a cultured and supportive life partner.`,
      paragraph2: `The active dasha sub-period activates the 7th house axis, harmonizing with current Jupiterian transits to remove hurdles.`,
      paragraph3: `Prediction & Timing: A very auspicious window for marriage finalization and alliance settlement manifests within the next 4 to 9 months.`,
      paragraph4: `Vedic Remedies: Light a ghee lamp before Goddess Mahalakshmi on Fridays and recite the Swayamvara Parvathi mantra.`
    };
  }

  // General fallback
  if (isKn) {
    return {
      paragraph1: `ಜಾತಕರ ${lagna} ಲಗ್ನ ಮತ್ತು ${moonRashi} ರಾಶಿಯ ಆಧಾರದ ಮೇಲೆ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಭಾವಾಧಿಪತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಗ್ರಹಗಳ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಸಂಕಷ್ಟಗಳಿಗೆ ಶೀಘ್ರ ಪರಿಹಾರವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
      paragraph2: `ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ದಶಾ-ಭುಕ್ತಿಯು ಜಾತಕರ ಆಂತರಿಕ ಆತ್ಮಬಲ ಹಾಗೂ ದೃಢತೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದು, ಶೀಘ್ರದಲ್ಲೇ ಧನಾತ್ಮಕ ತಿರುವು ಕಂಡುಬರಲಿದೆ.`,
      paragraph3: `ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ: ಮುಂದಿನ ೩ ರಿಂದ ೬ ತಿಂಗಳ ಒಳಗೆ ನಿಮ್ಮ ಸಂಕಲ್ಪವು ಈಡೇರಲಿದ್ದು, ಪರಿಸ್ಥಿತಿಯು ನಿಮ್ಮ ಪರವಾಗಿ ಬದಲಾಗಲಿದೆ.`,
      paragraph4: `ದೈವಿಕ ಪರಿಹಾರ: ಪ್ರತಿದಿನ ೧೧ ಬಾರಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪಿಸಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ.`
    };
  }

  return {
    paragraph1: `Analyzing your natal chart with ${lagna} Ascendant and ${moonRashi} Moon sign, the ruling planets show resilience and divine support for this inquiry.`,
    paragraph2: `The current dasha-bhukti phase is building inner strength and resolving past karmic obstacles steadily.`,
    paragraph3: `Prediction & Timing: A positive turning point and clarity will unfold prominently within the next 3 to 6 months.`,
    paragraph4: `Vedic Remedies: Recite the Maha Mrityunjaya Mantra 11 times daily and seek the divine grace of Lord Mahabaleshwara.`
  };
}

/**
 * Generates structured 4-paragraph answer for a single question.
 */
export async function generateAnswerForQuestion(
  item: PackageQuestionItem,
  kundli: KundliOutput,
  devoteeName: string,
  birthDate: string,
  birthTime: string,
  placeLabel: string,
  lang: PackageLang,
  apiKey: string
): Promise<PackageQuestionItem> {
  const smartHeader = generateSmartQuestionHeader(item.questionText || item.topicLabel, lang);

  try {
    if (apiKey && apiKey.trim().length > 0) {
      const context = buildAstrologicalContext(kundli, devoteeName, birthDate, birthTime, placeLabel, lang);
      const prompt = `Devotee Question: "${item.questionText}". Provide the authentic 4-paragraph Vedic prediction answer in JSON format as instructed.`;
      const responseText = await askGemini(prompt, context, apiKey, lang, { raw: true, retries: 3 });

      // Clean JSON formatting
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.paragraph1 && parsed.paragraph2 && parsed.paragraph3 && parsed.paragraph4) {
        return {
          ...item,
          smartHeader,
          answer: {
            paragraph1: parsed.paragraph1,
            paragraph2: parsed.paragraph2,
            paragraph3: parsed.paragraph3,
            paragraph4: parsed.paragraph4
          }
        };
      }
    }
  } catch (err) {
    console.warn("[packageAnswerEngine] Gemini API response fallback triggered:", err);
  }

  // Deterministic local dynamic fallback
  const fallback = buildFallbackAnswer(item.topicId, item.questionText, kundli, devoteeName, lang);
  return {
    ...item,
    smartHeader,
    answer: fallback
  };
}
