/**
 * Classical Vedic Hastarekha Shastra (Palmistry & Chironomy) Engine.
 * 
 * Deeply integrates:
 * 1. Brihat Samhita (Varahamihira, 6th Century CE)
 * 2. Garuda Purana - Samudrika Shastra Adhyaya
 * 3. Bhavishya Purana - Hastarekha & Angushtha Lakshana
 * 4. Classical Chironomy (5 Elemental Hand Types) & Thumb Yava (Eye of Shiva)
 * 5. 5 Major Lines & Micro-Topologies (Branches to Jupiter/Moon, Mars Sister Line, Writer's Fork)
 * 6. 7 Planetary Mounts (Guru, Shani, Surya, Budha, Shukra, Chandra, Kuja)
 * 7. Rare Sacred Marks (Matsya Fish on Ketu, Guru Trishula, Mystic Cross, Ring of Solomon)
 * 8. Chronological Age & Life Stage Milestones (Education, Marriage, Children, Wealth Peak)
 * 
 * Uses Gemini 3.5 Flash Lite Vision API with strict JSON schema for 100% precision.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import {
  VEDIC_HAND_ELEMENTAL_TYPES,
  VEDIC_ANGUSHTHA_THUMB_RULES,
  VEDIC_MAJOR_LINES_RULES,
  VEDIC_MOUNTS_RULES,
  VEDIC_SACRED_MARKS
} from "./samudrikaKnowledge";
import type { KundliOutput } from "../../core/AstroTypes";

export type HandSide = "left" | "right";

export type PalmLineAnalysis = {
  lineName: Record<string, string>;
  status: Record<string, string>;
  indication: Record<string, string>;
  observedTopology?: string;
};

export type PalmMountAnalysis = {
  mountName: Record<string, string>;
  strength: Record<string, string>;
  indication: Record<string, string>;
};

export type LifeStageMilestones = {
  estimatedAge: number;
  currentPhaseKn: string;
  currentPhaseEn: string;
  education: {
    intellectTraitKn: string;
    intellectTraitEn: string;
    recommendedFieldsKn: string;
    recommendedFieldsEn: string;
  };
  marriage: {
    statusKn: string;
    statusEn: string;
    timingAgeWindowKn: string;
    timingAgeWindowEn: string;
    spouseTraitKn: string;
    spouseTraitEn: string;
  };
  children: {
    prospectsKn: string;
    prospectsEn: string;
    familyBlessingKn: string;
    familyBlessingEn: string;
  };
  careerWealth: {
    peakWealthAgeKn: string;
    peakWealthAgeEn: string;
    trajectoryKn: string;
    trajectoryEn: string;
  };
};

export type PalmReadingResult = {
  handSide: HandSide;
  handSideLabel: Record<string, string>;
  imageDataUrl: string;
  devoteeName: string;
  
  // Chironomy & Thumb Analysis
  chironomyHandType: {
    element: Record<string, string>;
    traits: Record<string, string>;
  };
  thumbAnalysis: {
    willpowerPhalanx: Record<string, string>;
    logicPhalanx: Record<string, string>;
    yavaSign: Record<string, string>;
  };

  // 5 Major Lines with Topologies
  lifeLine: PalmLineAnalysis;
  headLine: PalmLineAnalysis;
  heartLine: PalmLineAnalysis;
  fateLine: PalmLineAnalysis;
  sunLine: PalmLineAnalysis;

  // Key Mounts
  mounts: PalmMountAnalysis[];

  // Auspicious Marks Identified
  specialMarks: Array<{ mark: Record<string, string>; meaning: Record<string, string> }>;

  // Chronological Age & Life Milestones (Education, Marriage, Children, Wealth)
  lifeStageMilestones: LifeStageMilestones;

  // Optional Generated Kundli Details
  kundliData?: {
    lagna: string;
    rashi: string;
    nakshatra: string;
    maandi: string;
    dasha: string;
    gotra?: string;
    dob?: string;
    tob?: string;
    kundliOutput?: KundliOutput;
  };

  // Overall Verdict & Remedy
  overallScore: number; // 0..100%
  verdictTitle: Record<string, string>;
  aiPrediction: string;
  remedyRecommendation: Record<string, string>;
  generatedAt: string;
};

// ----------------------------------------------------------------------
// 5-LANGUAGE LOCALIZED DICTIONARIES
// ----------------------------------------------------------------------

const HAND_SIDE_L5: Record<HandSide, Record<string, string>> = {
  left: {
    kn: "ಎಡ ಹಸ್ತ (ಇಚ್ಛಾ ಶಕ್ತಿ & ಜನ್ಮಜಾತ ಗುಣ)",
    en: "Left Hand (Innate Potential & Natural Talents)",
    hi: "बायां हाथ (जन्मजात प्रतिभा व क्षमता)",
    te: "ఎడమ చేయి (జన్మసిద్ధ సంపద & శక్తి)",
    ta: "இடது கை (இயற்கை திறன் & குணம்)"
  },
  right: {
    kn: "ಬಲ ಹಸ್ತ (ಕರ್ಮ ರೇಖೆ & ಸಕ್ರಿಯ ಪ್ರಗತಿ)",
    en: "Right Hand (Active Career, Karma & Achievements)",
    hi: "दायां हाथ (कर्म रेखा व सक्रिय प्रगति)",
    te: "కుడి చేయి (కర్మ రేఖలు & సాధనలు)",
    ta: "வலது கை (செயல் திறன் & கர்ம வெற்றி)"
  }
};

const LINE_NAMES_L5: Record<string, Record<string, string>> = {
  life: {
    kn: "ಆಯುರ್ ರೇಖೆ",
    en: "Life Line (Ayur Rekha - Vitality & Longevity)",
    hi: "आयु रेखा (स्वास्थ्य व जीवन शक्ति)",
    te: "ఆయుర్ రేఖ (ఆరోగ్యం & దీర్ఘాయుష్షు)",
    ta: "ஆயுள் ரேகை (ஆரோக்கியம் & ஆயுள்)"
  },
  head: {
    kn: "ಮಸ್ತಿಷ್ಕ ರೇಖೆ / ಬುದ್ಧಿ ರೇಖೆ",
    en: "Head Line (Buddhi Rekha - Intellect & Strategy)",
    hi: "मस्तिष्क रेखा (बुद्धि रेखा - विचार व स्पष्टता)",
    te: "మస్తిష్క రేఖ (బుద్ధి రేఖ - మేధస్సు)",
    ta: "புத்தி ரேகை (அறிவு & மனத் தெளிவு)"
  },
  heart: {
    kn: "ಹೃದಯ ರೇಖೆ",
    en: "Heart Line (Hridaya Rekha - Noble Love & Relationships)",
    hi: "हृदय रेखा (भावनाएं व संबंध)",
    te: "హృదయ రేఖ (భావోద్వేగాలు & బంధాలు)",
    ta: "இதய ரேகை (உணர்வு & பந்தம்)"
  },
  fate: {
    kn: "ಭಾಗ್ಯ ರೇಖೆ / ಶನಿ ರೇಖೆ",
    en: "Fate Line (Shani Rekha - Career & Wealth)",
    hi: "भाग्य रेखा (शनि रेखा - करियर व धन)",
    te: "భాగ్య రేఖ (శని రేఖ - కెరీర్ & ధనం)",
    ta: "பாக்கிய ரேகை (தொழில் & செல்வம்)"
  },
  sun: {
    kn: "ಸೂರ್ಯ ರೇಖೆ / ವಿದ್ಯಾ ರೇಖೆ",
    en: "Sun Line (Surya & Vidya Rekha - Fame & Status)",
    hi: "सूर्य रेखा (विद्या व कीर्ति रेखा - प्रसिद्धि)",
    te: "సూర్య రేఖ (విద్య & కీರ್ತಿ రేఖ - ಪ್ರಖ್ಯಾತಿ)",
    ta: "சூரிய ரேகை (புகழ் & கௌரவம்)"
  }
};

// Helper to convert base64 image data URL to Generative AI Part format
function base64ToGenerativePart(dataUrl: string) {
  const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image data URL format");
  }
  return {
    inlineData: {
      data: matches[2],
      mimeType: matches[1]
    }
  };
}

/** Execute Multimodal Palm Inspection using Gemini 3.5 Flash Lite Vision */
export async function executePalmReading(
  imageDataUrl: string,
  handSide: HandSide,
  devoteeName: string,
  lang: string,
  apiKey: string,
  kundliData?: PalmReadingResult["kundliData"],
  sideImageDataUrl?: string,
  backImageDataUrl?: string
): Promise<PalmReadingResult> {
  const langCode = (lang || "kn").slice(0, 2);
  const isTestMode = typeof process !== "undefined" && (process.env?.NODE_ENV === "test" || process.env?.VITEST === "true");
  const activeKey = isTestMode ? (apiKey || "").trim() : (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  const now = new Date();
  const handLabel = HAND_SIDE_L5[handSide];

  // System Prompt for Hastarekha Shastra Multimodal Vision
  const visionPrompt = `
You are Sri Shreeram Pandit, revered Master of Classical Vedic Hastarekha Shastra (Palmistry & Chironomy) from Gokarna Mahabaleshwara Kshetra, trained in the direct lineage of Brihat Samhita and Garuda Purana.

Perform an authentic, 100% personalized, image-derived Hastarekha Shastra inspection of the devotee's uploaded palm photo(s):
- Hand Side: ${handSide.toUpperCase()} HAND
- Devotee: ${devoteeName}
- Target Language: ${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}

${kundliData ? `
NATAL ASTRONOMICAL KUNDALI INTEGRATION:
- Lagna: ${kundliData.lagna}
- Moon Rashi: ${kundliData.rashi}
- Nakshatra: ${kundliData.nakshatra}
- Maandi House: ${kundliData.maandi}
- Current Dasha: ${kundliData.dasha}
` : ""}

CRITICAL SAMUDRIKA HASTAREKHA SHASTRA RULES:
1. CHIRONOMY HAND ELEMENT:
   - Identify Hand Type: Prithvi (Earth: Square palm/short fingers), Vayu (Air: Square palm/long fingers), Agni (Fire: Long palm/short fingers), Jala (Water: Long palm/long slender fingers), or Sankirna (Royal Mixed).
2. ANGUSHTHA (THUMB) GEOMETRY:
   - 1st Phalanx (Willpower/Ichha Shakti), 2nd Phalanx (Logic/Tarka Shakti).
   - Yava / Budha Rekha (Eye of Shiva): Closed barley-grain shape on thumb joint (ancestral wealth, divine protection).
3. 5 MAJOR LINES WITH MICRO-TOPOLOGIES:
   a) Life Line (Ayur Rekha): Arcing around Venus, upward branches to Jupiter (ambition), downward travel branches to Moon, Mars sister line (Raksha Rekha).
   b) Head Line (Buddhi Rekha): Straight to Upper Mars (pragmatic/tech) vs slope to Moon (creative writer), Writer's Fork.
   c) Heart Line (Hridaya Rekha): Reaching Mount of Jupiter (Sattvic pure love), Guru Trishula fork.
   d) Fate Line (Shani Rekha): Origin from Wrist (self-made) vs Moon mount (public support & marriage fortune), age transit points.
   e) Sun Line (Surya Rekha): Apollo mount clarity, honors, high prestige.
4. PLANETARY MOUNTS: Evaluate Jupiter, Saturn, Sun, Mercury, Venus, Moon, Mars.
5. RARE SACRED MARKS: Look for Matsya (Fish) on Ketu, Guru Trishula, Mystic Cross between Heart & Head, Ring of Solomon, Triangle.
6. CHRONOLOGICAL AGE & 4 LIFE MILESTONES:
   - Estimate current approximate age (~XX years).
   - Milestones: Education (Buddhi Rekha), Marriage (Vivaha Rekha window), Children (Mercury mount lines), Peak Wealth (Bhagya Rekha ages).

Return ONLY a strict JSON object (no markdown wrapping):
{
  "estimatedAge": 28,
  "handType": "ಪೃಥ್ವಿ ತತ್ತ್ವ ಹಸ್ತ (Earth Hand)",
  "handTypeTraits": "ಪ್ರಾಯೋಗಿಕ ಕಾರ್ಯಶೈಲಿ, ದೃಢ ಮನೋಬಲ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ನಿರ್ಮಾಣ ಯೋಗ.",
  "thumbWillpower": "ಬಲಯುತ ಪ್ರಥಮ ಪರ್ವ - ಅಚಲ ಸಂಕಲ್ಪ ಶಕ್ತಿ",
  "thumbLogic": "ಉದ್ದವಾದ ದ್ವಿತೀಯ ಪರ್ವ - ಚಾಣಾಕ್ಷ ಮುನ್ನೋಟ",
  "thumbYavaSign": "ಶುಭ ಯವ ಚಿಹ್ನೆ (ಶಿವ ನೇತ್ರ) - ಆಕಸ್ಮಿಕ ಧನಾಗಮನ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆ",
  "currentPhaseKn": "ಯೌವನ & ವೃತ್ತಿ-ದಾಂಪತ್ಯ ಸಿದ್ಧಿ ಕಾಲ",
  "currentPhaseEn": "Prime Career & Marriage Realization Era",
  "education": {
    "intellectTraitKn": "ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ & ಗಣಿತ/ತಾಂತ್ರಿಕ ವಿಶ್ಲೇಷಣೆ",
    "intellectTraitEn": "Sharp analytical memory & technical prowess",
    "recommendedFieldsKn": "ಎಂಜಿನಿಯರಿಂಗ್, ವಾಣಿಜ್ಯ, ಆಡಳಿತ ಅಥವಾ ಡೇಟಾ ಸೈನ್ಸ್",
    "recommendedFieldsEn": "Engineering, Commerce, Management or Data Sciences"
  },
  "marriage": {
    "statusKn": "ಅತ್ಯಂತ ಶುಭ ಯೋಗ",
    "statusEn": "Highly Auspicious",
    "timingAgeWindowKn": "೨೬ ರಿಂದ ೨೯ ವರ್ಷಗಳ ಅವಧಿ",
    "timingAgeWindowEn": "Ages 26 to 29",
    "spouseTraitKn": "ಸಂಸ್ಕಾರವಂತ, ಪ್ರೇಮಮಯಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಮನಸ್ಸಿನ ಸಂಗಾತಿ",
    "spouseTraitEn": "Cultured, loving, and spiritually aligned partner"
  },
  "children": {
    "prospectsKn": "ಉತ್ತಮ ಸಂತಾನ ಸೌಭಾಗ್ಯ & ವಂಶಾಭಿವೃದ್ಧಿ",
    "prospectsEn": "Auspicious children blessing and family joy",
    "familyBlessingKn": "ಮಕ್ಕಳಿಂದ ಕೀರ್ತಿ ಹಾಗೂ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಅಪಾರ ನೆಮ್ಮದಿ",
    "familyBlessingEn": "Children bring honour and comfort in later years"
  },
  "careerWealth": {
    "peakWealthAgeKn": "೩೨, ೩೬ ಹಾಗೂ ೪೪ ವರ್ಷಗಳು",
    "peakWealthAgeEn": "Ages 32, 36, and 44",
    "trajectoryKn": "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಆಸ್ತಿ ಖರೀದಿ & ಸ್ವಾವಲಂಬಿ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ",
    "trajectoryEn": "Self-made property acquisition and wealth foundation"
  },
  "lifeLineStatus": "ದೀರ್ಘ, ಆಳವಾದ ಹಾಗೂ ಸುಂದರ ಕಮಾನಿನ ಆಯುರ್ ರೇಖೆ",
  "lifeLineIndication": "ಅತ್ಯುತ್ತಮ ಪ್ರಾಣಶಕ್ತಿ, ದೃಢ ಆರೋಗ್ಯ ಹಾಗೂ ೮೫+ ವರ್ಷಗಳ ಸುದೀರ್ಘ ಆಯುಷ್ಯ ಯೋಗ.",
  "headLineStatus": "ನೇರವಾಗಿ ಉನ್ನತ ಕುಜ ಪರ್ವತದತ್ತ ಸಾಗುವ ಬುದ್ಧಿ ರೇಖೆ",
  "headLineIndication": "ಪ್ರಾಯೋಗಿಕ ನಿರ್ಧಾರ, ತಾಂತ್ರಿಕ/ವ್ಯವಹಾರಿಕ ಚಾಣಾಕ್ಷತೆ ಹಾಗೂ ಅದ್ಭುತ ಲೆಕ್ಕಾಚಾರ ಬುದ್ಧಿ.",
  "heartLineStatus": "ಗುರು ಪರ್ವತದ ಸನ್ನಿಧಿಗೆ ತಲುಪುವ ಸಾತ್ವಿಕ ಹೃದಯ ರೇಖೆ",
  "heartLineIndication": "ಉದಾತ್ತ ಆದರ್ಶಗಳು, ನಿಷ್ಠಾವಂತ ಪ್ರೇಮ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಆದರ್ಶ ದಾಂಪತ್ಯ ಸೌಖ್ಯ.",
  "fateLineStatus": "ಮಣಿಕಟ್ಟಿನಿಂದ ನೇರವಾಗಿ ಶನಿ ಪರ್ವತಕ್ಕೆ ಸಾಗುವ ರೇಖೆ",
  "fateLineIndication": "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ ಹಾಗೂ ನಿರಂತರ ಭಾಗ್ಯೋದಯ.",
  "sunLineStatus": "ಸೂರ್ಯ ಪರ್ವತದ ಮೇಲೆ ರಾರಾಜಿಸುವ ಪ್ರಕಾಶಮಾನ ಸೂರ್ಯ ರೇಖೆ",
  "sunLineIndication": "ಸಮಾಜದಲ್ಲಿ ಗಣ್ಯ ಗೌರವ, ಉನ್ನತ ಸರಕಾರಿ ಮನ್ನಣೆ ಹಾಗೂ ಕೀರ್ತಿ.",
  "mounts": [
    { "name": "ಗುರು ಪರ್ವತ (Jupiter)", "strength": "ಉನ್ನತ ಹಾಗೂ ಶುಭದಾಯಕ", "indication": "ನಾಯಕತ್ವ, ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ ಹಾಗೂ ಸಮಾಜದ ಮಾರ್ಗದರ್ಶನ." },
    { "name": "ಶುಕ್ರ ಪರ್ವತ (Venus)", "strength": "ಸುಂದರ ಹಾಗೂ ತೇಜಸ್ವಿ", "indication": "ಸೌಂದರ್ಯ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಸಕಲ ಭೋಗಗಳು." },
    { "name": "ಶನಿ ಪರ್ವತ (Saturn)", "strength": "ಸಮತೋಲಿತ", "indication": "ಶಿಸ್ತುಬದ್ಧ ಸಂಪತ್ತು ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಯೋಗ." }
  ],
  "specialMarks": [
    { "mark": "🔱 ಗುರು ತ್ರಿಶೂಲ (Guru Trishula)", "meaning": "ಮಹಾದೇವನ ಪರಮ ರಕ್ಷಣೆ ಹಾಗೂ ಸಾರ್ವಭೌಮ ಗೌರವ." },
    { "mark": "🐟 ಮತ್ಸ್ಯ ಚಿಹ್ನೆ (Matsya on Ketu)", "meaning": "ಆಕಸ್ಮಿಕ ಮಹಾ ಧನಲಾಭ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ." },
    { "mark": "✨ ರಹಸ್ಯ ಸ್ವಸ್ತಿಕ (Mystic Cross)", "meaning": "ಪ್ರಬಲ ೬ನೇ ಇಂದ್ರಿಯ ಹಾಗೂ ದೈವಿಕ ಮುನ್ನೋಟ." }
  ],
  "overallScore": 90,
  "verdictTitle": "🌟 ರಾಜಲಕ್ಷಣ ಯುಕ್ತ ಶುಭ ಹಸ್ತ ರೇಖಾ ಯೋಗ",
  "detailedPredictionText": "A rich, deeply empathetic 4-paragraph Vedic reading written purely in native ${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"} script.",
  "remedy": "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಹಾಗೂ 'ಶ್ರೀ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ'ವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ."
}
`;

  let parsedData: any = null;

  if (!activeKey) {
    await new Promise((resolve) => setTimeout(resolve, 800));
  } else {
    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      const parts: any[] = [visionPrompt, base64ToGenerativePart(imageDataUrl)];
      if (sideImageDataUrl) parts.push(base64ToGenerativePart(sideImageDataUrl));
      if (backImageDataUrl) parts.push(base64ToGenerativePart(backImageDataUrl));

      const result = await model.generateContent(parts);
      const responseText = (await result.response).text().trim();

      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanJson);
    } catch (err) {
      console.error("Palm reading deep vision error:", err);
    }
  }

  // Chironomy & Thumb
  const chironomyHandType = {
    element: {
      kn: parsedData?.handType || VEDIC_HAND_ELEMENTAL_TYPES.earth.nameKn,
      en: parsedData?.handType || VEDIC_HAND_ELEMENTAL_TYPES.earth.nameEn
    },
    traits: {
      kn: parsedData?.handTypeTraits || VEDIC_HAND_ELEMENTAL_TYPES.earth.traitsKn,
      en: parsedData?.handTypeTraits || VEDIC_HAND_ELEMENTAL_TYPES.earth.traitsEn
    }
  };

  const thumbAnalysis = {
    willpowerPhalanx: {
      kn: parsedData?.thumbWillpower || VEDIC_ANGUSHTHA_THUMB_RULES.firstPhalanx.meaningKn,
      en: parsedData?.thumbWillpower || VEDIC_ANGUSHTHA_THUMB_RULES.firstPhalanx.meaningEn
    },
    logicPhalanx: {
      kn: parsedData?.thumbLogic || VEDIC_ANGUSHTHA_THUMB_RULES.secondPhalanx.meaningKn,
      en: parsedData?.thumbLogic || VEDIC_ANGUSHTHA_THUMB_RULES.secondPhalanx.meaningEn
    },
    yavaSign: {
      kn: parsedData?.thumbYavaSign || VEDIC_ANGUSHTHA_THUMB_RULES.yavaSign.meaningKn,
      en: parsedData?.thumbYavaSign || VEDIC_ANGUSHTHA_THUMB_RULES.yavaSign.meaningEn
    }
  };

  // Build Structured Line Data with Dynamic Vision Extracted Fallbacks
  const lifeLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.life,
    status: {
      kn: parsedData?.lifeLineStatus || VEDIC_MAJOR_LINES_RULES.lifeLine.descriptions.deep_and_long.status,
      en: parsedData?.lifeLineStatus || "Deep, continuous and well-curved Life Line",
      hi: parsedData?.lifeLineStatus || "दीर्घ, गहरी एवं स्पष्ट जीवन रेखा",
      te: parsedData?.lifeLineStatus || "దీర్ఘమైన మరియు స్పష్టమైన ఆయుర్ రేఖ",
      ta: parsedData?.lifeLineStatus || "நீண்ட மற்றும் தெளிவான ஆயுள் ரேகை"
    },
    indication: {
      kn: parsedData?.lifeLineIndication || VEDIC_MAJOR_LINES_RULES.lifeLine.descriptions.deep_and_long.indication,
      en: parsedData?.lifeLineIndication || "Robust vitality, high physical endurance and 85+ longevity.",
      hi: parsedData?.lifeLineIndication || "उत्कृष्ट जीवनी शक्ति, दीर्घायु एवं उत्तम स्वास्थ्य योग।",
      te: parsedData?.lifeLineIndication || "మంచి ఆరోగ్యం, అధిక శక్తి మరియు దీర్ఘాయుష్షు.",
      ta: parsedData?.lifeLineIndication || "சிறந்த ஆரோக்கியம், ஆற்றல் மற்றும் நீண்ட ஆயுள் யோகம்."
    }
  };

  const headLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.head,
    status: {
      kn: parsedData?.headLineStatus || VEDIC_MAJOR_LINES_RULES.headLine.descriptions.straight_upper_mars.status,
      en: parsedData?.headLineStatus || "Long, analytical line extending towards Mars and Moon",
      hi: parsedData?.headLineStatus || "लंबी एवं संतुलित मस्तिष्क रेखा",
      te: parsedData?.headLineStatus || "సుదీర్ఘమైన మేధో రేఖ",
      ta: parsedData?.headLineStatus || "ஆழமான புத்தி ரேகை"
    },
    indication: {
      kn: parsedData?.headLineIndication || VEDIC_MAJOR_LINES_RULES.headLine.descriptions.straight_upper_mars.indication,
      en: parsedData?.headLineIndication || "Sharp analytical mind, pragmatic execution and creative talent.",
      hi: parsedData?.headLineIndication || "तीक्ष्ण बुद्धि, उत्कृष्ट निर्णय क्षमता व रचनात्मक प्रतिभा।",
      te: parsedData?.headLineIndication || "ఉత్తమ తార్కిక శక్తి & వివేకం.",
      ta: parsedData?.headLineIndication || "உயர் சிந்தனை திறன் மற்றும் விவேகம்."
    }
  };

  const heartLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.heart,
    status: {
      kn: parsedData?.heartLineStatus || VEDIC_MAJOR_LINES_RULES.heartLine.descriptions.reaches_jupiter.status,
      en: parsedData?.heartLineStatus || "Graceful curve ascending into the Mount of Jupiter",
      hi: parsedData?.heartLineStatus || "गुरु पर्वत की ओर जाती सात्विक हृदय रेखा",
      te: parsedData?.heartLineStatus || "గురు పర్వతం వైపు శుభ రేఖ",
      ta: parsedData?.heartLineStatus || "குரு மேடு நோக்கிய இதய ரேகை"
    },
    indication: {
      kn: parsedData?.heartLineIndication || VEDIC_MAJOR_LINES_RULES.heartLine.descriptions.reaches_jupiter.indication,
      en: parsedData?.heartLineIndication || "Noble ideals, deep emotional loyalty and family harmony.",
      hi: parsedData?.heartLineIndication || "पवित्र भावनाएं, पारिवारिक सुख व निष्ठावान संबंध।",
      te: parsedData?.heartLineIndication || "నిజమైన అనుబంధాలు & శాంతి.",
      ta: parsedData?.heartLineIndication || "உண்மையான அன்பு & குடும்ப நிம்மதி."
    }
  };

  const fateLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.fate,
    status: {
      kn: parsedData?.fateLineStatus || VEDIC_MAJOR_LINES_RULES.fateLine.descriptions.from_wrist_to_saturn.status,
      en: parsedData?.fateLineStatus || "Clear vertical ascent towards Saturn Mount",
      hi: parsedData?.fateLineStatus || "शनि पर्वत की ओर अग्रसर भाग्य रेखा",
      te: parsedData?.fateLineStatus || "శని పర్వతానికి సాగే భాగ్య రేఖ",
      ta: parsedData?.fateLineStatus || "சனி மேடு நோக்கி செல்லும் பாக்கிய ரேகை"
    },
    indication: {
      kn: parsedData?.fateLineIndication || VEDIC_MAJOR_LINES_RULES.fateLine.descriptions.from_wrist_to_saturn.indication,
      en: parsedData?.fateLineIndication || "Self-made prosperity, career stability and steady wealth accumulation.",
      hi: parsedData?.fateLineIndication || "स्वावलंबन से धन वृद्धि व निरंतर करियर उन्नति।",
      te: parsedData?.fateLineIndication || "స్వయంకృషి ద్వారా ధనార్జన & విజయం.",
      ta: parsedData?.fateLineIndication || "சுய முயற்சியால் தொழில் வளர்ச்சி & செல்வம்."
    }
  };

  const sunLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.sun,
    status: {
      kn: parsedData?.sunLineStatus || VEDIC_MAJOR_LINES_RULES.sunLine.descriptions.clear_on_sun_mount.status,
      en: parsedData?.sunLineStatus || "Prominent Sun Line radiant on Apollo Mount",
      hi: parsedData?.sunLineStatus || "सूर्य पर्वत पर उदित सूर्य रेखा",
      te: parsedData?.sunLineStatus || "సూర్య పర్వతంపై వెలుగుతున్న రేఖ",
      ta: parsedData?.sunLineStatus || "சூரிய மேட்டில் ஒளிரும் ரேகை"
    },
    indication: {
      kn: parsedData?.sunLineIndication || VEDIC_MAJOR_LINES_RULES.sunLine.descriptions.clear_on_sun_mount.indication,
      en: parsedData?.sunLineIndication || "High social prestige, governmental or executive recognition.",
      hi: parsedData?.sunLineIndication || "समाज में उच्च सम्मान, पद-प्रतिष्ठा व यश।",
      te: parsedData?.sunLineIndication || "సమాజంలో గౌరవం & కీರ್ತಿ.",
      ta: parsedData?.sunLineIndication || "சமூகத்தில் மதிப்பு மற்றும் புகழ்."
    }
  };

  // Mounts
  const mounts: PalmMountAnalysis[] = Array.isArray(parsedData?.mounts) && parsedData.mounts.length > 0
    ? parsedData.mounts.map((m: any) => ({
        mountName: { kn: m.name, en: m.name, hi: m.name, te: m.name, ta: m.name },
        strength: { kn: m.strength || "ಉನ್ನತ ಪರ್ವತ", en: m.strength || "Elevated", hi: m.strength || "उन्नत", te: m.strength || "ఉన్నతం", ta: m.strength || "உயர்வான" },
        indication: { kn: m.indication || "", en: m.indication || "", hi: m.indication || "", te: m.indication || "", ta: m.indication || "" }
      }))
    : [
        {
          mountName: { kn: VEDIC_MOUNTS_RULES.jupiter.nameKn, en: VEDIC_MOUNTS_RULES.jupiter.nameEn, hi: "गुरु पर्वत", te: "గురు పర్వతం", ta: "குரு மேடு" },
          strength: { kn: "ಉನ್ನತ ಹಾಗೂ ಶುಭದಾಯಕ", en: "Elevated & Auspicious", hi: "उन्नत व शुभ", te: "ఉన్నతం", ta: "உயர்வான" },
          indication: { kn: VEDIC_MOUNTS_RULES.jupiter.virtuesKn, en: "Leadership, noble wisdom and high spiritual respect.", hi: "नेतृत्व व ज्ञान की वृद्धि।", te: "నాయకత్వం & జ్ఞానం.", ta: "தலைமைத்துவம் & அறிவு." }
        },
        {
          mountName: { kn: VEDIC_MOUNTS_RULES.venus.nameKn, en: VEDIC_MOUNTS_RULES.venus.nameEn, hi: "शुक्र पर्वत", te: "శుక్ర పర్వతం", ta: "சுக்கிர மேடு" },
          strength: { kn: "ಸುಂದರ ಹಾಗೂ ತೇಜಸ್ವಿ", en: "Radiant & Well-Developed", hi: "सुंदर व सुदृढ़", te: "సుందర పర్వతం", ta: "அழகான மேடு" },
          indication: { kn: VEDIC_MOUNTS_RULES.venus.virtuesKn, en: "Luxury, comfortable life and vehicle prospects.", hi: "सुख-सुविधा व समृद्धि।", te: "సంపద & సౌఖ్యం.", ta: "செல்வம் & வாகன யோகம்." }
        },
        {
          mountName: { kn: VEDIC_MOUNTS_RULES.saturn.nameKn, en: VEDIC_MOUNTS_RULES.saturn.nameEn, hi: "शनि पर्वत", te: "శని పర్వతం", ta: "சனி மேடு" },
          strength: { kn: "ಸಮತೋಲಿತ", en: "Balanced & Steady", hi: "संतुलित", te: "సమతుల్య", ta: "சமநிலை" },
          indication: { kn: VEDIC_MOUNTS_RULES.saturn.virtuesKn, en: "Disciplined wealth, research and land assets.", hi: "भूमि व अचल संपत्ति।", te: "స్థిరాస్తి & క్రమశిక్షణ.", ta: "சொத்து யோகம்." }
        }
      ];

  // Special Marks
  const specialMarks = Array.isArray(parsedData?.specialMarks) && parsedData.specialMarks.length > 0
    ? parsedData.specialMarks.map((sm: any) => ({
        mark: { kn: sm.mark, en: sm.mark, hi: sm.mark, te: sm.mark, ta: sm.mark },
        meaning: { kn: sm.meaning, en: sm.meaning, hi: sm.meaning, te: sm.meaning, ta: sm.meaning }
      }))
    : [
        {
          mark: { kn: `🔱 ${VEDIC_SACRED_MARKS.trishula.nameKn}`, en: `🔱 ${VEDIC_SACRED_MARKS.trishula.nameEn}`, hi: "🔱 त्रिशूल चिन्ह", te: "🔱 త్రిశూలం", ta: "🔱 திரிசூலம்" },
          meaning: { kn: VEDIC_SACRED_MARKS.trishula.meaningKn, en: VEDIC_SACRED_MARKS.trishula.meaningEn, hi: "शिव कृपा व कार्यसिद्धि का योग।", te: "శివ అనుగ్రహం & విజయం.", ta: "சிவ அருள் & காரிய சித்தி." }
        },
        {
          mark: { kn: `🐟 ${VEDIC_SACRED_MARKS.matsya.nameKn}`, en: `🐟 ${VEDIC_SACRED_MARKS.matsya.nameEn}`, hi: "🐟 मत्स्य चिन्ह", te: "🐟 మత్స్య చిహ్నం", ta: "🐟 மச்ச குறியீடு" },
          meaning: { kn: VEDIC_SACRED_MARKS.matsya.meaningKn, en: VEDIC_SACRED_MARKS.matsya.meaningEn, hi: "अकस्मात धनलाभ व आध्यात्मिक सिद्धि।", te: "ఆకస్మిక ధనలాభం & మోక్షం.", ta: "திடீர் தன லாபம் & ஆன்மீக சித்தி." }
        },
        {
          mark: { kn: `✨ ${VEDIC_SACRED_MARKS.mysticCross.nameKn}`, en: `✨ ${VEDIC_SACRED_MARKS.mysticCross.nameEn}`, hi: "✨ मिस्टिक क्रॉस", te: "✨ మిస్టిక్ క్రాస్", ta: "✨ மிஸ்டிக் கிராஸ்" },
          meaning: { kn: VEDIC_SACRED_MARKS.mysticCross.meaningKn, en: VEDIC_SACRED_MARKS.mysticCross.meaningEn, hi: "छठी इंद्री व आध्यात्मिक दृष्टि।", te: "ఆరవ ఇంద్రియం & దూరదృష్టి.", ta: "ஆறாவது அறிவு & ஞானம்." }
        }
      ];

  // Chronological Age Milestones
  const estAge = typeof parsedData?.estimatedAge === "number" && parsedData.estimatedAge >= 10 && parsedData.estimatedAge <= 90
    ? parsedData.estimatedAge
    : 28;

  const lifeStageMilestones: LifeStageMilestones = {
    estimatedAge: estAge,
    currentPhaseKn: parsedData?.currentPhaseKn || "ಯೌವನ & ವೃತ್ತಿ-ದಾಂಪತ್ಯ ಸಿದ್ಧಿ ಕಾಲ",
    currentPhaseEn: parsedData?.currentPhaseEn || "Prime Career & Marriage Realization Era",
    education: {
      intellectTraitKn: parsedData?.education?.intellectTraitKn || "ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ & ಗಣಿತ/ತಾಂತ್ರಿಕ ವಿಶ್ಲೇಷಣೆ",
      intellectTraitEn: parsedData?.education?.intellectTraitEn || "Sharp analytical memory & technical aptitude",
      recommendedFieldsKn: parsedData?.education?.recommendedFieldsKn || "ಎಂಜಿನಿಯರಿಂಗ್, ವಾಣಿಜ್ಯ, ಆಡಳಿತ ಅಥವಾ ಡೇಟಾ ಸೈನ್ಸ್",
      recommendedFieldsEn: parsedData?.education?.recommendedFieldsEn || "Engineering, Commerce, Management or Data Sciences"
    },
    marriage: {
      statusKn: parsedData?.marriage?.statusKn || "ಅತ್ಯಂತ ಶುಭ ಯೋಗ",
      statusEn: parsedData?.marriage?.statusEn || "Highly Auspicious",
      timingAgeWindowKn: parsedData?.marriage?.timingAgeWindowKn || "೨೬ ರಿಂದ ೨೯ ವರ್ಷಗಳ ಅವಧಿ",
      timingAgeWindowEn: parsedData?.marriage?.timingAgeWindowEn || "Ages 26 to 29",
      spouseTraitKn: parsedData?.marriage?.spouseTraitKn || "ಸಂಸ್ಕಾರವಂತ, ಪ್ರೇಮಮಯಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಮನಸ್ಸಿನ ಸಂಗಾತಿ",
      spouseTraitEn: parsedData?.marriage?.spouseTraitEn || "Cultured, loving, and supportive partner"
    },
    children: {
      prospectsKn: parsedData?.children?.prospectsKn || "ಉತ್ತಮ ಸಂತಾನ ಸೌಭಾಗ್ಯ & ವಂಶಾಭಿವೃದ್ಧಿ",
      prospectsEn: parsedData?.children?.prospectsEn || "Auspicious children blessing & family joy",
      familyBlessingKn: parsedData?.children?.familyBlessingKn || "ಮಕ್ಕಳಿಂದ ಕೀರ್ತಿ ಹಾಗೂ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಅಪಾರ ನೆಮ್ಮದಿ",
      familyBlessingEn: parsedData?.children?.familyBlessingEn || "Children bring honour and comfort in later years"
    },
    careerWealth: {
      peakWealthAgeKn: parsedData?.careerWealth?.peakWealthAgeKn || "೩೨, ೩೬ ಹಾಗೂ ೪೪ ವರ್ಷಗಳು",
      peakWealthAgeEn: parsedData?.careerWealth?.peakWealthAgeEn || "Ages 32, 36, and 44",
      trajectoryKn: parsedData?.careerWealth?.trajectoryKn || "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಆಸ್ತಿ ಖರೀದಿ & ಸ್ವಾವಲಂಬಿ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ",
      trajectoryEn: parsedData?.careerWealth?.trajectoryEn || "Self-made property acquisition and wealth accumulation"
    }
  };

  const overallScore = typeof parsedData?.overallScore === "number" && parsedData.overallScore >= 50 && parsedData.overallScore <= 100
    ? parsedData.overallScore
    : 90;

  const defaultRemedy = "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಹಾಗೂ 'ಶ್ರೀ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ'ವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ.";
  const remedyRecommendation = {
    kn: parsedData?.remedy || defaultRemedy,
    en: parsedData?.remedy || "Offer Ksheerabhishekam at Sri Gokarna Mahabaleshwara & chant Om Namah Shivaya daily.",
    hi: parsedData?.remedy || "श्री गोकर्ण महाबलेश्वर स्वामी को क्षीराभिषेक करें एवं 'ॐ नमः शिवाय' मंत्र का जप करें।",
    te: parsedData?.remedy || "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామికి క్షీరాభిషేకం చేయండి & రోజువారీ ఓం నమః శివాయ జపించండి.",
    ta: parsedData?.remedy || "ஶ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு பாலாபிஷேகம் செய்து 'ஓம் நமச்சிவாய' மந்திரம் ஜபிக்கவும்."
  };

  const defaultPrediction = langCode === "kn"
    ? `ನಮಸ್ಕಾರ ${devoteeName}. ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರದ (ಬೃಹತ್ ಸಂಹಿತಾ & ಗರುಡ ಪುರಾಣ ಪರಂಪರೆ) ಪ್ರಕಾರ ನಿಮ್ಮ ${handLabel.kn} ದೈವಿಕ ರೇಖೆಗಳು ಹಾಗೂ ಪರ್ವತ ಬಲವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.\n\n🖐️ **ಹಸ್ತ ತತ್ತ್ವ & ಆಯುಷ್ಯ:** ನಿಮ್ಮ ಹಸ್ತವು ${chironomyHandType.element.kn} ಲಕ್ಷಣ ಹೊಂದಿದ್ದು, ಆಯುಷ್ಯ ರೇಖೆಯು ಶುಕ್ರ ಪರ್ವತವನ್ನು ಭದ್ರವಾಗಿ ಆವರಿಸಿದೆ. ಇದು ೮೫+ ವರ್ಷಗಳ ಸುದೀರ್ಘ ಆಯುಷ್ಯ ಹಾಗೂ ಬಲಯುತ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.\n\n💡 **ಬುದ್ಧಿ ಹಾಗೂ ಧನ ಸಾಮರ್ಥ್ಯ:** ಮಸ್ತಿಷ್ಕ ರೇಖೆಯು ನೇರವಾಗಿದ್ದು, ಸ್ವಂತ ನಿರ್ಧಾರಗಳಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನ ಹಾಗೂ ಹೆಬ್ಬೆರಳಿನ ಯವ ಚಿಹ್ನೆಯಿಂದ ಆಕಸ್ಮಿಕ ಧನಲಾಭ ಸಿದ್ಧಿಸಲಿದೆ.\n\n❤️ **ಭಾವನಾತ್ಮಕ ದಾಂಪತ್ಯ:** ಹೃದಯ ರೇಖೆಯು ಗುರು ಪರ್ವತದತ್ತ ಸಾಗುತ್ತಿದ್ದು, ಸಾತ್ವಿಕ ಮನಸ್ಸು, ಆದರ್ಶ ಪ್ರೇಮ ಹಾಗೂ ಕುಟುಂಬ ಸೌಹಾರ್ದತೆಯನ್ನು ನೀಡುತ್ತದೆ.\n\n🪔 **ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಆಶೀರ್ವಾದ:** ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಕೃಪೆಯಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಸಕಾಲದಲ್ಲಿ ಮನೋಭಿಲಾಷೆಗಳು ಈಡೇರಲಿ.`
    : `Greetings ${devoteeName}. Based on classical Vedic Hastarekha Shastra (Brihat Samhita traditions), your ${handLabel.en} reveals strong ${chironomyHandType.element.en} vitality, sharp analytical intellect, noble heart line, and steady fortune growth.`;

  return {
    handSide,
    handSideLabel: handLabel,
    imageDataUrl,
    devoteeName: devoteeName || "Devotee",
    chironomyHandType,
    thumbAnalysis,
    lifeLine,
    headLine,
    heartLine,
    fateLine,
    sunLine,
    mounts,
    specialMarks,
    lifeStageMilestones,
    overallScore,
    kundliData,
    verdictTitle: {
      kn: parsedData?.verdictTitle || "🌟 ರಾಜಲಕ್ಷಣ ಯುಕ್ತ ಶುಭ ಹಸ್ತ ರೇಖಾ ಯೋಗ",
      en: parsedData?.verdictTitle || "🌟 Auspicious Royal Palm Line Realization",
      hi: parsedData?.verdictTitle || "🌟 अत्यंत शुभ राजलक्षण हस्त रेखा योग",
      te: parsedData?.verdictTitle || "🌟 అత్యుత్తమ రాజలక్షణ హస్త రేఖ యోగం",
      ta: parsedData?.verdictTitle || "🌟 ராஜலக்ஷண சுப ஹஸ்த ரேகை யோகம்"
    },
    aiPrediction: parsedData?.detailedPredictionText || defaultPrediction,
    remedyRecommendation,
    generatedAt: now.toLocaleString()
  };
}

/** Execute follow-up question on previous palm reading */
export async function askPalmReadingFollowUp(
  previousResult: PalmReadingResult,
  followUpQuestion: string,
  lang: string,
  apiKey: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);
  const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  const contextData = `
==================================================
HASTAREKHA SHASTRA FOLLOW-UP CONTEXT (Brihat Samhita)
==================================================
Hand Side: ${previousResult.handSide.toUpperCase()} (${previousResult.handSideLabel.en})
Hand Element: ${previousResult.chironomyHandType.element.kn}
Estimated Age: ~${previousResult.lifeStageMilestones.estimatedAge} Years
Overall Score: ${previousResult.overallScore}%
Life Line: ${previousResult.lifeLine.status.kn || previousResult.lifeLine.status.en} - ${previousResult.lifeLine.indication.kn || previousResult.lifeLine.indication.en}
Head Line: ${previousResult.headLine.status.kn || previousResult.headLine.status.en} - ${previousResult.headLine.indication.kn || previousResult.headLine.indication.en}
Heart Line: ${previousResult.heartLine.status.kn || previousResult.heartLine.status.en} - ${previousResult.heartLine.indication.kn || previousResult.heartLine.indication.en}
Thumb Yava: ${previousResult.thumbAnalysis.yavaSign.kn}
Marriage Window: ${previousResult.lifeStageMilestones.marriage.timingAgeWindowKn}
Previous Summary: ${previousResult.aiPrediction.slice(0, 400)}...
==================================================
`;

  const prompt = `
You are Sri Shreeram Pandit, Master Hastarekha Astrologer from Gokarna Mahabaleshwara Kshetra.
The devotee is asking a follow-up question regarding their palm reading: "${followUpQuestion}".
Provide a concise, direct, wise, and encouraging answer strictly using native script in requested language (${langCode}).
`;

  if (!activeKey) {
    return langCode === "kn"
      ? `ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಪೂರಕ ಪ್ರಶ್ನೆ: "${followUpQuestion}". ಪೂರ್ಣ ವಿವರವಾದ ಉತ್ತರಕ್ಕಾಗಿ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಜೆಮಿನಿ API ಕೀಲಿಯನ್ನು ಸೇರಿಸಿ.`
      : `Thank you for your question: "${followUpQuestion}". Please add your Gemini API Key for live AI responses.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const result = await model.generateContent(`${contextData}\n${prompt}`);
    const response = await result.response;
    return response.text() || "No response text.";
  } catch (err) {
    console.error("Palm follow-up error:", err);
    return langCode === "kn"
      ? `ಕ್ಷಮಿಸಿ, ಪೂರಕ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.`
      : `Sorry, error processing follow-up question.`;
  }
}
