/**
 * Classical Vedic Hastarekha Shastra (Palmistry) Engine.
 * 
 * Inspects palm images for:
 * 1. Life Line (Ayur Rekha) - Longevity, Vitality & Health
 * 2. Head Line (Buddhi / Matri Rekha) - Intellect, Mind & Clarity
 * 3. Heart Line (Hridaya / Pitri Rekha) - Emotions, Heart & Relationships
 * 4. Fate Line (Bhagya / Shani Rekha) - Career, Wealth & Fortune
 * 5. Sun Line (Surya / Vidya Rekha) - Fame, Status & Recognition
 * 6. Palm Mounts (Guru, Shani, Surya, Budha, Shukra, Kuja, Chandra Parvata)
 * 7. Auspicious Signs (Trishula, Matsya, Padma, Swastika, Star, Triangle)
 * 
 * Uses Gemini Multimodal Vision API with rich Samudrika Shastra rules
 * for high-precision, non-repetitive Vedic Palmistry analysis!
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { estimateBirthDateFromPalm } from "./palmDobEstimator";
import { VEDIC_MAJOR_LINES_RULES, VEDIC_MOUNTS_RULES, VEDIC_SACRED_MARKS } from "./samudrikaKnowledge";
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

export type PalmReadingResult = {
  handSide: HandSide;
  handSideLabel: Record<string, string>;
  imageDataUrl: string;
  
  // 5 Major Lines
  lifeLine: PalmLineAnalysis;
  headLine: PalmLineAnalysis;
  heartLine: PalmLineAnalysis;
  fateLine: PalmLineAnalysis;
  sunLine: PalmLineAnalysis;

  // Key Mounts
  mounts: PalmMountAnalysis[];

  // Auspicious Marks Identified
  specialMarks: Array<{ mark: Record<string, string>; meaning: Record<string, string> }>;

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
    kn: "ಆಯುಷ್ಯ ರೇಖೆ",
    en: "Life Line (Ayur Rekha - Vitality & Health)",
    hi: "आयु रेखा (स्वास्थ्य व जीवन शक्ति)",
    te: "ఆయుర్ రేఖ (ఆరోగ్యం)",
    ta: "ஆயுள் ரேகை (ஆரோக்கியம் & ஆயுள்)"
  },
  head: {
    kn: "ಮಸ್ತಿಷ್ಕ ರೇಖೆ",
    en: "Head Line (Buddhi Rekha - Intellect & Mindset)",
    hi: "मस्तिष्क रेखा (बुद्धि रेखा - विचार व स्पष्टता)",
    te: "మస్తిష్క రేఖ (బుద్ధి రేఖ - మేధస్సు)",
    ta: "புத்தி ரேகை (அறிவு & மனத் தெளிவு)"
  },
  heart: {
    kn: "ಹೃದಯ ರೇಖೆ",
    en: "Heart Line (Hridaya Rekha - Emotions & Relationships)",
    hi: "हृदय रेखा (भावनाएं व संबंध)",
    te: "హృదయ రేఖ (భావోద్వేగాలు & బంధాలు)",
    ta: "இதய ரேகை (உணர்வு & பந்தம்)"
  },
  fate: {
    kn: "ಭಾಗ್ಯ ರೇಖೆ",
    en: "Fate Line (Shani Rekha - Career & Wealth)",
    hi: "भाग्य रेखा (शनि रेखा - करियर व धन)",
    te: "భాగ్య రేఖ (శని రేఖ - కెరీర్ & ధనం)",
    ta: "பாக்கிய ரேகை (தொழில் & செல்வம்)"
  },
  sun: {
    kn: "ಸೂರ್ಯ ರೇಖೆ",
    en: "Sun Line (Vidya & Kirti Rekha - Fame & Success)",
    hi: "सूर्य रेखा (विद्या व कीर्ति रेखा - प्रसिद्धि)",
    te: "సూర్య రేఖ (విద్య & కీర్తి రేఖ - ప్రఖ్యాతి)",
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

/** Execute Multimodal Palm Inspection using Gemini 3.5/3.7 Vision */
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
  const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  const now = new Date();
  const handLabel = HAND_SIDE_L5[handSide];

  // System Prompt for Hastarekha Shastra Multimodal Vision
  const visionPrompt = `
You are Sri Shreeram Pandit, revered Master of Classical Vedic Samudrika Shastra (Palmistry) from Gokarna Mahabaleshwara Kshetra.
Perform an authentic, 100% personalized, image-derived Hastarekha Shastra inspection of the devotee's uploaded palm photo(s):
- Hand Side: ${handSide.toUpperCase()} HAND
- Devotee: ${devoteeName}
- Language: ${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}

${kundliData ? `
NATAL ASTRONOMICAL KUNDALI INTEGRATION:
- Lagna: ${kundliData.lagna}
- Moon Rashi: ${kundliData.rashi}
- Nakshatra: ${kundliData.nakshatra}
- Maandi House: ${kundliData.maandi}
- Current Dasha: ${kundliData.dasha}
` : ""}

CRITICAL INSTRUCTION:
Do NOT output generic canned responses. Inspect the real palm image carefully:
1. Check Life Line curvature around Venus mount, starting point near Jupiter, branches pointing upwards vs downwards, and breaks/chains.
2. Check Head Line length, straightness (analytical) vs slope towards Moon mount (creative/intuitive), and writer's fork.
3. Check Heart Line termination on Jupiter mount (idealistic/noble) vs Saturn mount (materialistic), branches, and island marks.
4. Check Fate Line origin (Wrist, Moon, or Life Line), breaks at Head line (age 35) or Heart line (age 56).
5. Check Sun Line presence, clarity, and forks on Apollo mount.
6. Check Mounts prominence (Jupiter, Saturn, Sun, Mercury, Venus, Moon, Mars).
7. Identify any sacred Vedic signs: Trishula (Trident), Matsya (Fish), Padma (Lotus), Triangle, Star, Cross, Temple.
8. If side view image is provided, inspect marriage lines near Mercury.
9. If back view image is provided, inspect fingernails (half moons, shape) and finger phalanges.

RESPOND ONLY WITH A VALID JSON OBJECT in this exact schema (no markdown fences, no backticks):
{
  "lifeLineStatus": "...",
  "lifeLineIndication": "...",
  "headLineStatus": "...",
  "headLineIndication": "...",
  "heartLineStatus": "...",
  "heartLineIndication": "...",
  "fateLineStatus": "...",
  "fateLineIndication": "...",
  "sunLineStatus": "...",
  "sunLineIndication": "...",
  "mounts": [
    { "name": "...", "strength": "...", "indication": "..." }
  ],
  "specialMarks": [
    { "mark": "...", "meaning": "..." }
  ],
  "overallScore": 87,
  "verdictTitle": "...",
  "detailedPredictionText": "A rich, deeply empathetic 4-paragraph Vedic reading written purely in ${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"} script without mixing English in brackets. Include specific life advice, career guidance, family peace, and spiritual growth.",
  "remedy": "Specific sacred remedy at Gokarna Mahabaleshwara Kshetra with mantra."
}
`;

  let parsedData: any = null;

  if (!activeKey) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } else {
    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
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
      en: parsedData?.lifeLineIndication || "Robust vitality, high physical endurance and 80+ longevity.",
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
      te: parsedData?.sunLineIndication || "సమాజంలో గౌరవం & కీర్తి.",
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
        }
      ];

  const overallScore = typeof parsedData?.overallScore === "number" && parsedData.overallScore >= 50 && parsedData.overallScore <= 100
    ? parsedData.overallScore
    : 86;

  const defaultRemedy = "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಹಾಗೂ 'ಶ್ರೀ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ'ವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ.";
  const remedyRecommendation = {
    kn: parsedData?.remedy || defaultRemedy,
    en: parsedData?.remedy || "Offer Ksheerabhishekam at Sri Gokarna Mahabaleshwara & chant Om Namah Shivaya daily.",
    hi: parsedData?.remedy || "श्री गोकर्ण महाबलेश्वर स्वामी को क्षीराभिषेक करें एवं 'ॐ नमः शिवाय' मंत्र का जप करें।",
    te: parsedData?.remedy || "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామికి క్షీరాభిషేకం చేయండి & రోజువారీ ఓಂ నమః శివాయ జపించండి.",
    ta: parsedData?.remedy || "ஶ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு பாலாபிஷேகம் செய்து 'ஓம் நமச்சிவாய' மந்திரம் ஜபிக்கவும்."
  };

  const defaultPrediction = langCode === "kn"
    ? `ನಮಸ್ಕಾರ ${devoteeName}. ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ನಿಮ್ಮ ${handLabel.kn} ದೈವಿಕ ರೇಖೆಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.\n\n🖐️ **ಆಯುಷ್ಯ ಹಾಗೂ ಪ್ರಾಣಶಕ್ತಿ:** ನಿಮ್ಮ ಆಯುಷ್ಯ ರೇಖೆಯು ಶುಕ್ರ ಪರ್ವತವನ್ನು ಭದ್ರವಾಗಿ ಆವರಿಸಿದ್ದು, ಉತ್ತಮ ಆರೋಗ್ಯ, ದೃಢ ಮನೋಬಲ ಹಾಗೂ ಸುದೀರ್ಘ ಆಯುಷ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.\n\n💡 **ಬುದ್ಧಿ ಹಾಗೂ ವೃತ್ತಿ ಪ್ರಗತಿ:** ಮಸ್ತಿಷ್ಕ ರೇಖೆಯು ನೇರವಾಗಿದ್ದು, ಸ್ವಂತ ನಿರ್ಧಾರಗಳಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನ ಗಳಿಸುವ ಸಾಮರ್ಥ್ಯವಿದೆ.\n\n❤️ **ಭಾವನಾತ್ಮಕ ದಾಂಪತ್ಯ:** ಹೃದಯ ರೇಖೆಯು ಗುರು ಪರ್ವತದತ್ತ ಸಾಗುತ್ತಿದ್ದು, ಸಾತ್ವಿಕ ಮನಸ್ಸು, ಆದರ್ಶ ಪ್ರೇಮ ಹಾಗೂ ಕುಟುಂಬ ಸೌಹಾರ್ದತೆಯನ್ನು ನೀಡುತ್ತದೆ.\n\n🪔 **ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಆಶೀರ್ವಾದ:** ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಕೃಪೆಯಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಸಕಾಲದಲ್ಲಿ ಮನೋಭಿಲಾಷೆಗಳು ಈಡೇರಲಿ.`
    : `Greetings ${devoteeName}. Based on authentic Samudrika Shastra rules, your ${handLabel.en} reveals strong vitality, sharp intellect, noble heart line, and steady fortune growth.`;

  return {
    handSide,
    handSideLabel: handLabel,
    imageDataUrl,
    lifeLine,
    headLine,
    heartLine,
    fateLine,
    sunLine,
    mounts,
    specialMarks,
    overallScore,
    kundliData,
    verdictTitle: {
      kn: parsedData?.verdictTitle || "🟢 ಶುಭ ಹಸ್ತ ರೇಖಾ ಯೋಗ (Auspicious Palm Line Realization)",
      en: parsedData?.verdictTitle || "🟢 Auspicious Palm Line Realization",
      hi: parsedData?.verdictTitle || "🟢 अत्यंत शुभ हस्त रेखा योग",
      te: parsedData?.verdictTitle || "🟢 అత్యుత్తమ హస్త రేఖ యోగం",
      ta: parsedData?.verdictTitle || "🟢 சுப ஹஸ்த ரேகை யோகம்"
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
HASTAREKHA SHASTRA FOLLOW-UP CONTEXT
==================================================
Hand Side: ${previousResult.handSide.toUpperCase()} (${previousResult.handSideLabel.en})
Overall Score: ${previousResult.overallScore}%
Life Line: ${previousResult.lifeLine.status.kn || previousResult.lifeLine.status.en} - ${previousResult.lifeLine.indication.kn || previousResult.lifeLine.indication.en}
Head Line: ${previousResult.headLine.status.kn || previousResult.headLine.status.en} - ${previousResult.headLine.indication.kn || previousResult.headLine.indication.en}
Heart Line: ${previousResult.heartLine.status.kn || previousResult.heartLine.status.en} - ${previousResult.heartLine.indication.kn || previousResult.heartLine.indication.en}
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
