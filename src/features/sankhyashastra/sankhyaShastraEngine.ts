import { siderealLongitudes } from "../../core/EphemerisEngine";
import { askGemini } from "../../core/GeminiEngine";

export type SankhyaShastraResult = {
  rawQuestion: string;
  formattedQuestion: string;
  userNumber: number;
  prashnaLagnaIndex: number; // 0..11 (0=Mesha, 11=Meena)
  prashnaLagnaName: Record<string, string>;
  prashnaLagnaHouse: number; // 1..12
  rootNumber: number; // 1..9
  rootRuler: Record<string, string>;
  transitPlanets: Array<{
    planet: string;
    rashiIndex: number;
    houseFromLagna: number;
  }>;
  aiPrediction: string;
  generatedAt: string;
};

const RASHI_NAMES_L5: Record<number, Record<string, string>> = {
  0: { kn: "ಮೇಷ", en: "Mesha (Aries)", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  1: { kn: "ವೃಷಭ", en: "Vrishabha (Taurus)", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  2: { kn: "ಮಿಥುನ", en: "Mithuna (Gemini)", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  3: { kn: "ಕರ್ಕಾಟಕ", en: "Karkataka (Cancer)", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  4: { kn: "ಸಿಂಹ", en: "Simha (Leo)", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  5: { kn: "ಕನ್ಯಾ", en: "Kanya (Virgo)", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  6: { kn: "ತುಲಾ", en: "Tula (Libra)", hi: "तुला", te: "తులా", ta: "துலாம்" },
  7: { kn: "ವೃಶ್ಚಿಕ", en: "Vrischika (Scorpio)", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  8: { kn: "ಧನಸ್ಸು", en: "Dhanus (Sagittarius)", hi: "धनु", te: "ధనస్సు", ta: "தனுசு" },
  9: { kn: "ಮಕರ", en: "Makara (Capricorn)", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  10: { kn: "ಕುಂಭ", en: "Kumbha (Aquarius)", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்" },
  11: { kn: "ಮೀನ", en: "Meena (Pisces)", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

const ROOT_RULERS_L5: Record<number, Record<string, string>> = {
  1: { kn: "ಸೂರ್ಯ (ಸೂರ್ಯ ದೇವ - ಶಕ್ತಿ & ನೇತೃತ್ವ)", en: "Sun (Surya - Leadership & Vitality)", hi: "सूर्य (आत्मबल एवं नेतृत्व)", te: "సూర్యుడు (నాయకత్వం & శక్తి)", ta: "சூரியன் (ஆளுமை & ஆற்றல்)" },
  2: { kn: "ಚಂದ್ರ (ಚಂದ್ರ ದೇವ - ಮನಸ್ಸು & ಭಾವನೆ)", en: "Moon (Chandra - Mind & Emotions)", hi: "चंद्र (मन एवं भावनाएं)", te: "చంద్రుడు (మనస్సు & భావోద్వేగాలు)", ta: "சந்திரன் (மனம் & உணர்வு)" },
  3: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ - ಜ್ಞಾನ & ಧರ್ಮ)", en: "Jupiter (Guru - Wisdom & Prosperity)", hi: "गुरु (ज्ञान एवं धर्म)", te: "గురుడు (జ్ఞానం & ఐశ్వర్యం)", ta: "குரு (ஞானம் & வளர்ச்சி)" },
  4: { kn: "ರಾಹು (ರಾಹು ದೇವ - ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆ)", en: "Rahu (Unconventional Opportunities)", hi: "राहु (आकस्मिक अवसर)", te: "రాహువు (ఆకస్మిక మార్పులు)", ta: "ராகு (திடீர் திருப்பம்)" },
  5: { kn: "ಬುಧ (ಬುಧ ದೇವ - ಬುದ್ಧಿ & ವ್ಯಾಪಾರ)", en: "Mercury (Budha - Intellect & Business)", hi: "बुध (बुद्धि एवं व्यापार)", te: "బుధుడు (బుద్ధి & వ్యాపారం)", ta: "புதன் (அறிவு & வணிகம்)" },
  6: { kn: "ಶುಕ್ರ (ಶುಕ್ರಾಚಾರ್ಯ - ಸೌಂದರ್ಯ & ಸಮೃದ್ಧಿ)", en: "Venus (Shukra - Luxury & Harmony)", hi: "शुक्र (समृद्धि एवं सुख)", te: "శుక్రుడు (సంపద & ఆనందం)", ta: "சுக்கிரன் (செல்வம் & மகிழ்ச்சி)" },
  7: { kn: "ಕೇತು (ಕೇತು ದೇವ - ಆಧ್ಯಾತ್ಮ & ಒಳನೋಟ)", en: "Ketu (Spiritual Insight & Intuition)", hi: "केतु (आध्यात्मिक अंतर्दृष्टि)", te: "కేతువు (ఆధ్యాత్మిక దృష్టి)", ta: "கேது (ஞானப் பார்வை)" },
  8: { kn: "ಶನಿ (ಶನೈಶ್ಚರ - ಶ್ರಮ & ತಾಳ್ಮೆ)", en: "Saturn (Shani - Discipline & Perseverance)", hi: "शनि (धैर्य एवं कर्म)", te: "శని (క్రమశిక్షణ & శ్రమ)", ta: "சனி (பொறுமை & உழைப்பு)" },
  9: { kn: "ಮಂಗಳ (ಕುಜ ದೇವ - ಧೈರ್ಯ & ಪರಾಕ್ರಮ)", en: "Mars (Mangala - Courage & Action)", hi: "मंगल (साहस एवं पराक्रम)", te: "కుజుడు (ధైర్యం & పరాక్రమం)", ta: "செவ்வாய் (துணிவு & வீரம்)" }
};

/** Calculate digital root of a positive integer (1..9) */
export function calculateDigitalRoot(n: number): number {
  const absN = Math.abs(Math.floor(n));
  if (absN === 0) return 9;
  const rem = absN % 9;
  return rem === 0 ? 9 : rem;
}

/** Compute Prashna Lagna House (1..12) from user number N */
export function calculatePrashnaLagnaHouse(n: number): number {
  const absN = Math.abs(Math.floor(n));
  if (absN === 0) return 12;
  const rem = absN % 12;
  return rem === 0 ? 12 : rem;
}

/** Step 1: Clean and format raw unstructured question using Gemini */
export async function formatRawQuestionWithAi(
  rawQuestion: string,
  lang: string,
  apiKey: string
): Promise<string> {
  const trimmed = rawQuestion.trim();
  if (!trimmed) return "ಸಾಮಾನ್ಯ ಧನ, ಆಸ್ತಿ ಹಾಗೂ ಕಾರ್ಯಸಿದ್ಧಿ ಪ್ರಶ್ನೆ";

  const prompt = `
You are an expert Vedic Prashna & Sankhya Shastra assistant.
The user provided a raw, potentially unstructured or spoken question: "${trimmed}".
Please rewrite and structure this question into a single clear, dignified, and grammatically precise astrological query.
Respond ONLY with the formatted question text, strictly in the requested language (${lang}). Do not add any conversational meta-text or preambles.
`;

  try {
    const formatted = await askGemini(trimmed, prompt, apiKey, lang, { raw: true });
    return formatted.trim().replace(/^["']|["']$/g, "") || trimmed;
  } catch {
    return trimmed;
  }
}

/** Step 2: Main Sankhya Shastra Engine calculation and AI prediction */
export async function executeSankhyaShastraPrashna(
  rawQuestion: string,
  userNumber: number,
  lang: string,
  apiKey: string
): Promise<SankhyaShastraResult> {
  const langCode = (lang || "kn").slice(0, 2);

  // 1. Format raw question
  const formattedQuestion = await formatRawQuestionWithAi(rawQuestion, langCode, apiKey);

  // 2. Compute Prashna Lagna House (1..12) and Rashi (0..11)
  const houseNum = calculatePrashnaLagnaHouse(userNumber);
  const lagnaIndex = (houseNum - 1) % 12;
  const prashnaLagnaName = RASHI_NAMES_L5[lagnaIndex] || RASHI_NAMES_L5[0]!;

  // 3. Digital Root Number & Ruling Planet
  const rootNum = calculateDigitalRoot(userNumber);
  const rootRuler = ROOT_RULERS_L5[rootNum] || ROOT_RULERS_L5[1]!;

  // 4. Live Ephemeris Transit Positions
  const now = new Date();
  const longs = siderealLongitudes(now, "lahiri");
  const planetKeys: Array<{ key: keyof typeof longs; name: string }> = [
    { key: "sun", name: "Surya (Sun)" },
    { key: "moon", name: "Chandra (Moon)" },
    { key: "mars", name: "Mangala (Mars)" },
    { key: "mercury", name: "Budha (Mercury)" },
    { key: "jupiter", name: "Guru (Jupiter)" },
    { key: "venus", name: "Shukra (Venus)" },
    { key: "saturn", name: "Shani (Saturn)" },
    { key: "rahu", name: "Rahu" },
    { key: "ketu", name: "Ketu" }
  ];

  const transitPlanets = planetKeys.map((p) => {
    const deg = longs[p.key] ?? 0;
    const rIndex = Math.floor(deg / 30) % 12;
    const houseFromLagna = ((rIndex - lagnaIndex + 12) % 12) + 1;
    return {
      planet: p.name,
      rashiIndex: rIndex,
      houseFromLagna
    };
  });

  // 5. Construct Astrological Context for Gemini
  const contextData = `
==================================================
🕉️ BAGGONA SANKHYA SHASTRA PRASHNA CONTEXT
==================================================
1. User Chosen Number: ${userNumber}
2. Digital Root Number: ${rootNum} (Ruler: ${rootRuler.en})
3. Prashna Lagna House: ${houseNum} (${prashnaLagnaName.en})
4. Formatted Prashna Query: "${formattedQuestion}"
5. Current Planetary Gochara Transits (Relative to Prashna Lagna):
${transitPlanets.map((tp) => `   - ${tp.planet} is in House ${tp.houseFromLagna} (${RASHI_NAMES_L5[tp.rashiIndex]?.en})`).join("\n")}
==================================================
`;

  const questionPrompt = `
You are Sri Shreeram Pandit, Chief Astrologer and Sankhya Shastra Master from Gokarna Mahabaleshwara Kshetra.
Perform an authentic Vedic Sankhya Shastra & Prashna reading based on the user's question, chosen number, and current planetary transit positions.

Rules for response:
- Structure your answer clearly with the following sections:
  1. 🔮 **ಪ್ರಶ್ನಾ ಲಗ್ನ ಹಾಗೂ ಸಂಖ್ಯಾ ಶಕ್ತಿ ವಿಶ್ಲೇಷಣೆ (Prashna Lagna & Number Power Analysis)**
  2. 🪐 **ಗೋಚಾರ ಗ್ರಹ ಬಲ & ಕಾರಕತ್ವ (Planetary Transits & House Indications)**
  3. 🎯 **ನಿಖರ ಭವಿಷ್ಯ & ಉತ್ತರ (Direct Clear Answer to the Question)**
  4. ⏰ **ಸಮಯ ಸೂಚನೆ & ಜಯ ಸಾಧನೆಯ ಮಾರ್ಗ (Timing & Actionable Guidance)**
  5. 🪔 **ವಿಶೇಷ ದೈವಿಕ ಪರಿಹಾರ & ಮಂತ್ರ (Sacred Gokarna Remedy & Daily Mantra)**
- Be empathetic, highly accurate, actionable, and encouraging.
- Write in a natural, elegant tone suitable for a Temple Priest to read aloud directly to the devotee sitting in front of them.
- Respond EXCLUSIVELY in the requested language script: ${langCode}.
`;

  const aiPrediction = await askGemini(formattedQuestion, contextData + "\n" + questionPrompt, apiKey, langCode, {
    temperature: 0.7
  });

  return {
    rawQuestion,
    formattedQuestion,
    userNumber,
    prashnaLagnaIndex: lagnaIndex,
    prashnaLagnaName,
    prashnaLagnaHouse: houseNum,
    rootNumber: rootNum,
    rootRuler,
    transitPlanets,
    aiPrediction,
    generatedAt: now.toLocaleString()
  };
}

/** Execute follow-up question in existing Sankhya Shastra chat thread */
export async function askSankhyaShastraFollowUp(
  previousResult: SankhyaShastraResult,
  followUpQuestion: string,
  lang: string,
  apiKey: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);

  const contextData = `
==================================================
BAGGONA SANKHYA SHASTRA FOLLOW-UP CONTEXT
==================================================
Original Number: ${previousResult.userNumber} (Root ${previousResult.rootNumber}, Lagna: ${previousResult.prashnaLagnaName.en})
Original Question: "${previousResult.formattedQuestion}"
Previous Prediction Summary: ${previousResult.aiPrediction.slice(0, 400)}...
==================================================
`;

  const prompt = `
You are Sri Shreeram Pandit from Gokarna Mahabaleshwara Kshetra.
The devotee is asking a follow-up question on their previous Sankhya Shastra reading: "${followUpQuestion}".
Provide a concise, direct, wise, and encouraging answer strictly using the requested language (${langCode}).
`;

  return askGemini(followUpQuestion, contextData + "\n" + prompt, apiKey, langCode, {
    temperature: 0.7
  });
}
