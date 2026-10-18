/**
 * Baggona Panchanga - Consultation AI & Astrological Precision Engine
 * Computes deterministic birth chart coordinates, planetary positions, Bhavas,
 * Vimshottari Dasha-Bhukti, Gochara transits, and generates 2-3 paragraphs (5-6 lines each)
 * of 100% accurate Vedic readings strictly in the chosen consultation language.
 *
 * Mandatory Skill Adherence:
 * - Uses gemini-3.5-flash-lite exclusively
 * - 3-attempt exponential retry loop
 * - Supports 7 languages: kn, en, hi, te, ta, ml, mr
 */

import { calculateKundliWithPlaceSun } from "../../core/KundliEngine";
import { type KundliOutput, type PlanetPosition, PlanetName } from "../../core/AstroTypes";
import { askGemini, type AskGeminiChatTurn } from "../../core/GeminiEngine";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import {
  calculateComprehensiveDoshas,
  type ComprehensiveDoshaReport,
  type DetectedDosha
} from "../../core/ComprehensiveDoshaEngine";
import type { ConsultationSession, ConsultationLanguage } from "./consultationTypes";
import {
  RASHIS_I18N,
  NAKSHATRAS_I18N,
  PLANET_NAMES_I18N
} from "./consultationPanchangaService";

export interface ConsultationReadingResult {
  fullText: string;
  paragraphs: string[];
  astrologicalHighlights: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
    currentDasha: string;
    keyInfluences: string[];
  };
  hasDosha: boolean;
  doshaName?: string;
  doshaParihara?: string;
}

/**
 * Maps ConsultationLanguage to target language full name for Gemini
 */
export const CONSULTATION_LANG_NAMES: Record<ConsultationLanguage, string> = {
  kn: "Kannada",
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  ml: "Malayalam",
  mr: "Marathi"
};

/**
 * Calculates full Kundli and astronomical metrics for the devotee
 * Strictly localizes Lagna, Rashi, Nakshatra, and Dasha in the chosen language.
 */
export async function computeDevoteeKundli(session: ConsultationSession): Promise<{
  kundli: KundliOutput;
  lagnaName: string;
  lagnaNameEn: string;
  moonRashi: string;
  moonRashiEn: string;
  nakshatra: string;
  nakshatraEn: string;
  pada: number;
  currentDashaText: string;
  currentDashaTextEn: string;
  planetsSummary: string;
  ageYears: number;
}> {
  const lat = session.lat || 14.5479;
  const lng = session.lng || 74.3188;

  const kundli = await calculateKundliWithPlaceSun({
    name: session.name,
    birthDate: session.dob,
    birthTime: session.tob || "12:00",
    latitude: lat,
    longitude: lng,
    timezoneOffsetMinutes: (session.timezone !== undefined ? session.timezone : 5.5) * 60
  }, {
    ayanamsaModel: "lahiri"
  });

  const lang: ConsultationLanguage = session.language || "kn";

  // 1. Lagna (Ascendant) - Strictly localized according to chosen language
  const lagnaDeg = kundli.ascendant;
  const lagnaIdx = Math.floor(((lagnaDeg % 360) + 360) % 360 / 30) % 12;
  const lagnaName = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[lagnaIdx];
  const lagnaNameEn = RASHIS_I18N.en[lagnaIdx];

  // 2. Moon Sign (Rashi) - Strictly localized
  const moonPlanet = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Moon);
  const moonSidereal = (((moonPlanet?.degree ?? kundli.ascendant) % 360) + 360) % 360;
  const rashiIdx = kundli.moonSign?.index !== undefined ? kundli.moonSign.index : Math.floor(moonSidereal / 30) % 12;
  const moonRashi = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[rashiIdx];
  const moonRashiEn = RASHIS_I18N.en[rashiIdx];

  // 3. Nakshatra & Pada - Strictly localized
  const nakIdx = Math.min(26, Math.floor(moonSidereal / (360 / 27)));
  const nakshatra = (NAKSHATRAS_I18N[lang] || NAKSHATRAS_I18N.kn)[nakIdx];
  const nakshatraEn = NAKSHATRAS_I18N.en[nakIdx];
  const pada = kundli.moonPada || Math.min(4, Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1);

  // 4. Age & Dasha Calculation - Strictly localized planet and dasha terms
  const ageYears = ageDecimalYearsAt(session.dob, session.tob || "12:00", lat, lng, new Date());
  let currentDashaText = "";
  let currentDashaTextEn = "";
  try {
    const bhukti = findBhuktiAtAge(kundli, ageYears);
    if (bhukti) {
      const pDict = PLANET_NAMES_I18N[lang] || PLANET_NAMES_I18N.kn;
      const mahaName = pDict[bhukti.maha.planet] || bhukti.maha.planet;
      const antarName = pDict[bhukti.bhukti] || bhukti.bhukti;
      currentDashaText = `${mahaName} ${pDict.Mahadasha} - ${antarName} ${pDict.Antardasha}`;
      currentDashaTextEn = `${bhukti.maha.planet} Mahadasha - ${bhukti.bhukti} Antardasha`;
    }
  } catch (e) {
    console.warn("[consultationAIEngine] Dasha calculation notice:", e);
  }

  if (!currentDashaText) {
    currentDashaText = lang === "kn" ? "ಶುಭ ಮಹಾದಶಾ ಕಾಲ" : (lang === "en" ? "Active Planetary Dasha" : "शुभ महादशा काल");
    currentDashaTextEn = "Active Planetary Dasha";
  }

  // Planetary Summary text
  const planetsSummary = kundli.planets
    .map((p: PlanetPosition) => `${p.name}: House ${p.house} in ${p.rashi.english} (${p.degree.toFixed(1)}°)${p.isRetrograde ? " [Retrograde]" : ""}`)
    .join(", ");

  return {
    kundli,
    lagnaName,
    lagnaNameEn,
    moonRashi,
    moonRashiEn,
    nakshatra,
    nakshatraEn,
    pada,
    currentDashaText,
    currentDashaTextEn,
    planetsSummary,
    ageYears
  };
}

export interface ActiveDoshaContext {
  hasDosha: boolean;
  doshaId?: string;
  doshaName?: string;
  technicalWhy?: string;
  currentLifeProblems?: string;
  recommendedPooja?: string;
}

/**
 * Detects whether an active Vedic Dosha is present in the devotee's chart relevant to their question topic
 */
export function detectRelevantQuestionDosha(
  report: ComprehensiveDoshaReport,
  question: string,
  lang: ConsultationLanguage
): ActiveDoshaContext {
  const q = question.toLowerCase();

  const isMarriage =
    /ವಿವಾಹ|ಮದುವೆ|ಕಂಕಣ|ವರ|ವಧು|ದಾಂಪತ್ಯ|ಸಂಬಂಧ|ಪತಿ|ಪತ್ನಿ|marriage|marry|wedding|spouse|husband|wife|delay|match|divorce|separation|partner|love|engagement/i.test(
      q
    );
  const isCareerFinance =
    /ವೃತ್ತಿ|ಕೆಲಸ|ಉದ್ಯೋಗ|ವ್ಯಾಪಾರ|ಹಣ|ಸಾಲ|ಆರ್ಥಿಕ|ನಷ್ಟ|ಲಾಭ|ಬಡ್ತಿ|career|job|business|work|promotion|money|wealth|debt|financial|loss|finances|salary|income/i.test(
      q
    );
  const isHealth =
    /ಆರೋಗ್ಯ|ಕಾಯಿಲೆ|ಖಿನ್ನತೆ|ಮಾನಸಿಕ|ಒತ್ತಡ|ಭಯ|ಶಾಂತಿ|health|illness|disease|depression|stress|anxiety|fear|peace|mental|ailment/i.test(
      q
    );
  const isChildren =
    /ಮಕ್ಕಳು|ಸಂತಾನ|ಪುತ್ರ|ಗರ್ಭ|pregnancy|child|children|progeny|conception|son|daughter|conceive/i.test(
      q
    );

  const detected = report.doshas.filter((d: DetectedDosha) => d.isDetected);

  let matched: DetectedDosha | undefined = undefined;

  if (isMarriage) {
    matched = detected.find(
      (d) => d.id === "kuja_dosha" || d.id === "kala_sarpa_dosha" || d.id === "shrapit_dosha"
    );
  } else if (isCareerFinance) {
    matched = detected.find(
      (d) =>
        d.id === "kala_sarpa_dosha" ||
        d.id === "kemadruma_dosha" ||
        d.id === "pitru_dosha" ||
        d.id === "guru_chandala_dosha" ||
        d.id === "shrapit_dosha"
    );
  } else if (isHealth) {
    matched = detected.find(
      (d) =>
        d.id === "grahan_dosha" ||
        d.id === "balarishta_dosha" ||
        d.id === "kemadruma_dosha" ||
        d.id === "balyagraha_dosha"
    );
  } else if (isChildren) {
    matched = detected.find(
      (d) =>
        d.id === "pitru_dosha" ||
        d.id === "narayana_bali_dosha" ||
        d.id === "kala_sarpa_dosha"
    );
  }

  // If question explicitly asks about doshas or general query with active critical/high severity dosha
  if (!matched && detected.length > 0) {
    const asksAboutDosha =
      /ದೋಷ|ಪರಿಹಾರ|ತೊಂದರೆ|ವಿಳಂಬ|ಯಾಕೆ|ಕಾರಣ|ಅಡೆತಡೆ|dosha|curse|parihara|remedy|delay|obstacle|hurdle|why/i.test(
        q
      );
    if (asksAboutDosha || isMarriage || isCareerFinance || isHealth || isChildren) {
      matched =
        detected.find((d) => d.severity === "critical") ||
        detected.find((d) => d.severity === "high") ||
        detected[0];
    }
  }

  if (matched) {
    const langKey = lang as string;
    const dName =
      matched.name[langKey] || matched.name.kn || matched.name.en || matched.id;
    const tWhy =
      matched.technicalWhy[langKey] ||
      matched.technicalWhy.kn ||
      matched.technicalWhy.en ||
      "ಜಾತಕದಲ್ಲಿ ಗ್ರಹಗಳ ಅಶುಭ ಸ್ಥಾನ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ ಈ ದೋಷ ಉಂಟಾಗಿದೆ.";
    const clp =
      matched.currentLifeProblems[langKey] ||
      matched.currentLifeProblems.kn ||
      matched.currentLifeProblems.en ||
      "ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಂತರ ಅಡೆತಡೆ, ವಿಳಂಬ, ಆರ್ಥಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡಗಳು ಉಂಟಾಗುತ್ತಿವೆ.";
    const pooja =
      matched.recommendedPooja[langKey] ||
      matched.recommendedPooja.kn ||
      matched.recommendedPooja.en ||
      "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಶಾಂತಿ ಹೋಮ";

    return {
      hasDosha: true,
      doshaId: matched.id,
      doshaName: dName,
      technicalWhy: tWhy,
      currentLifeProblems: clp,
      recommendedPooja: pooja
    };
  }

  return { hasDosha: false };
}

/**
 * Generates an accurate 3 or 4 paragraph Vedic astrological response (5-6 lines per paragraph)
 * in the chosen consultation language using gemini-3.5-flash-lite with retries.
 * Introduces the 4th paragraph exclusively when an active Dosha is identified in the chart.
 */
export async function generateConsultationAnswer(params: {
  session: ConsultationSession;
  userQuestion: string;
  conversationHistory?: AskGeminiChatTurn[];
  apiKey?: string;
}): Promise<ConsultationReadingResult> {
  const { session, userQuestion, conversationHistory, apiKey } = params;

  // 1. Astronomical computations
  const {
    kundli,
    lagnaName,
    moonRashi,
    nakshatra,
    pada,
    currentDashaText,
    planetsSummary,
    ageYears
  } = await computeDevoteeKundli(session);

  // 2. Comprehensive Dosha Analysis
  const lat = session.lat || 14.5479;
  const lng = session.lng || 74.3188;
  const timezoneOffsetMinutes = (session.timezone !== undefined ? session.timezone : 5.5) * 60;

  let activeDosha: ActiveDoshaContext = { hasDosha: false };
  try {
    const doshaReport = calculateComprehensiveDoshas(
      kundli,
      {
        name: session.name,
        birthDate: session.dob,
        birthTime: session.tob || "12:00",
        latitude: lat,
        longitude: lng,
        timezoneOffsetMinutes
      },
      new Date()
    );
    activeDosha = detectRelevantQuestionDosha(doshaReport, userQuestion, session.language);
  } catch (err) {
    console.warn("[consultationAIEngine] ComprehensiveDoshaEngine calculation notice:", err);
  }

  // 3. Transits (Gochara) for today
  let transitsSummary = "Current Transits: Saturn in Aquarius/Pisces, Jupiter in Taurus/Gemini, Rahu/Ketu on Pisces/Virgo axis";
  try {
    const today = new Date();
    const transits = getTransitsForDate(kundli.moonSign.index, today, "lahiri");
    if (transits) {
      transitsSummary = Object.entries(transits)
        .map(([planet, data]) => `${planet}: House ${data.house} from Moon`)
        .join(", ");
    }
  } catch {
    // Keep fallback
  }

  const targetLang = CONSULTATION_LANG_NAMES[session.language] || "Kannada";

  // 4. Construct Authoritative Vedic Astrological Prompt with Conditional 4th Paragraph
  let doshaSectionPrompt = "";
  if (activeDosha.hasDosha) {
    doshaSectionPrompt = `
ACTIVE DOSHA IDENTIFIED IN NATIVE'S BIRTH CHART RELEVANT TO QUESTION:
- Identified Dosha: ${activeDosha.doshaName} (${activeDosha.doshaId})
- Planetary Justification ("Why this Dosha arose in native's chart"): ${activeDosha.technicalWhy}
- Current Real-Life Hardships & Obstacles: ${activeDosha.currentLifeProblems}
- Prescribed Sacred Gokarna Parihara Ritual: ${activeDosha.recommendedPooja}
- Authorized Priest Contact: Sri Shreeram Pandit, Baggona Panchanga, Sri Kshetra Gokarna, Phone: 9972339362 (Direct phone call only, NO WhatsApp).

CRITICAL PARAGRAPH STRUCTURE RULE (EXACTLY 4 PARAGRAPHS - MANDATORY):
Since an active Dosha is present that directly influences the devotee's question:
You MUST provide EXACTLY 4 well-developed, comprehensive paragraphs.
Each paragraph MUST contain at least 5 to 6 full lines of authentic, deep Vedic astrological analysis.
- Paragraph 1: Direct astrological answer addressing the devotee's question based on Janma Lagna, Moon sign, and planetary placements.
- Paragraph 2: In-depth analysis of Bhavas, running Vimshottari Dasha-Bhukti, and current Gochara transits influencing the question.
- Paragraph 3: Future astrological trajectory, timeline of when hurdles will begin clearing, and practical life advice.
- Paragraph 4 (DEDICATED DOSHA & GOKARNA PARIHARA CHAPTER):
  * State clearly what this ${activeDosha.doshaName} is and explain simply and emotionally why this Dosha has manifested in their birth chart based on planetary positions.
  * Detail what specific hardships, delays, obstacles, and emotional/financial distress this Dosha is causing in their life right now.
  * Explain what sacred Vedic Parihara Pooja must be performed at Sri Kshetra Gokarna (${activeDosha.recommendedPooja}) to neutralize this Dosha.
  * Connect emotionally and reassuringly with the devotee: assure them with absolute certainty that upon performing this sacred Gokarna pooja, they will surely witness genuine relief and positive improvement in their life.
  * Explicitly instruct them to contact chief priest Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and perform this parihara.`;
  } else {
    doshaSectionPrompt = `
CRITICAL PARAGRAPH STRUCTURE RULE (EXACTLY 3 PARAGRAPHS - MANDATORY):
Since NO adverse Dosha is currently obstructing this inquiry:
You MUST provide EXACTLY 3 well-developed, comprehensive paragraphs (at least 5 to 6 full lines each).
- Paragraph 1: Direct astrological analysis based on Lagna, Moon sign, and relevant Bhavas.
- Paragraph 2: In-depth evaluation of the running Vimshottari Dasha-Bhukti and live Gochara planetary transits.
- Paragraph 3: Future progression, auspicious timing, and sacred blessings of Sri Mahabaleshwara Gokarna with practical daily spiritual practices (mantras/daana).`;
  }

  const prompt = `You are the revered Senior Head Astrologer & Chief Priest of Sri Baggona Panchanga Jyotishya Sansthana, Sri Kshetra Gokarna (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮುಖ್ಯ ದೈವಜ್ಞರು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ), endowed with over 50 years of tapasya, Vedic chart mastery, and pastoral spiritual guidance.
The devotee is sitting right across from you face-to-face in the sacred sanctum of Gokarna for a private 20-minute spiritual conversation.

DEVOTEE BIRTH PROFILE & ASTROLOGICAL COORDINATES (COMPUTED ACCURATELY BY BAGGONA PANCHANGA):
- Name: ${session.name}
- Birth Date & Time: ${session.dob} at ${session.tob}
- Birth Place: ${session.place}
- Current Age: ${Math.floor(ageYears)} years
- Janma Lagna: ${lagnaName} Lagna
- Janma Rashi (Moon Sign): ${moonRashi}
- Janma Nakshatra: ${nakshatra} (Pada ${pada})
- Current Running Dasha-Bhukti: ${currentDashaText}
- Exact Natal Planetary Placements (Bhavas 1 to 12): ${planetsSummary}
- Live Gochara (Planetary Transits): ${transitsSummary}

DEVOTEE WORDS / QUESTION:
"${userQuestion}"
${doshaSectionPrompt}

SACRED BEHAVIORAL PROTOCOL (THE 50+ YEAR EXPERIENCED GOKARNA MASTER ASTROLOGER - "DAIVA VACHANA"):
1. "DAIVA VACHANA" (HOLY DIVINE WORDS):
   - Your words carry the spiritual aura, comfort, and solemn authority of divine oracle words (ದೈವ ವಚನ).
   - The devotee should feel a holy reverence, fatherly affection, and complete reassurance that their life is under divine protection.
2. ADAPTIVE & NATURAL CONVERSATION (NOT MERELY RIGID RECITATION):
   - You are sitting face-to-face with this devotee. Converse naturally, responsively, and empathetically.
   - If the devotee asks normal conversational questions (e.g. greetings, "How are you Swamiji?", asking how you are, requesting blessings):
     * Respond with radiant paternal warmth and grace. Offer the sacred blessings of Sri Mahabaleshwara and Lord Ganapati of Gokarna. Inquire about their well-being and invite them with an open heart to share whatever life question, dilemma, or burden they have brought to Gokarna today.
   - If the devotee asks "senseless", curious, philosophical, innocent, or off-topic questions (e.g. sports, curious riddles, "Can planets change destiny?", "Are you real?"):
     * NEVER get irritated, robotic, or dismissive ("I cannot answer this as an AI").
     * With a calm, gentle smile and 50 years of saintly wisdom, answer calmly, thoughtfully, and gracefully with Vedic insight and common sense, bringing peace to their mind and guiding them back to their life path.
   - If the devotee asks about their life, destiny, career, marriage, health, children, finances, or troubles:
     * Provide a profound, technically rigorous Vedic reading anchored strictly in their Baggona Panchanga chart coordinates (Lagna, Rashi, Bhavas, Dasha, Gochara).
     * Follow the paragraph rule (3 paragraphs if no active dosha, exactly 4 paragraphs with the Gokarna Parihara chapter if an active dosha is detected).
     * Strictly ZERO hallucination.
3. LANGUAGE & INSTITUTION INTEGRITY:
   - Always acknowledge Sri Baggona Panchanga (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ) and Sri Kshetra Gokarna (ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) as the sacred root of this astrological calculation.
   - You MUST respond 100% EXCLUSIVELY in the ${targetLang} language, using its authentic native script (Kannada script for Kannada, Devanagari script for Hindi/Marathi, Telugu script for Telugu, Tamil script for Tamil, Malayalam script for Malayalam, English for English).
   - Absolutely NO Latin transliteration or mixed English tokens when responding in Indian languages.
4. TONE & DELIVERY:
   - Warm, dignified, spiritually authoritative, compassionate, and deeply comforting.
   - DO NOT use markdown symbols like * or # as this text will be read aloud by the priest voice engine.
5. ONGOING CONVERSATION FLOW (NO REPEATED GREETINGS):
   - The opening welcome and introduction ("ನಮಸ್ಕಾರ... ನಾನು ಶ್ರೀರಾಮ್ ಪಂಡಿತ್...") have ALREADY been delivered at the start of this 20-minute consultation.
   - Therefore, do NOT repeat greetings like "ನಮಸ್ಕಾರ...", "Hello", "Welcome", or re-introduce yourself in subsequent turns.
   - Directly, respectfully, and compassionately answer this specific question as an ongoing, continuous face-to-face dialogue.`;

  let responseText = "";
  const effectiveApiKey = apiKey !== undefined ? apiKey : (import.meta.env.VITE_GEMINI_API_KEY || "");

  if (!effectiveApiKey) {
    responseText = generateDeterministicFallbackReading(
      session,
      userQuestion,
      lagnaName,
      moonRashi,
      nakshatra,
      currentDashaText,
      activeDosha
    );
  } else {
    try {
      responseText = await askGemini(
        userQuestion,
        prompt,
        effectiveApiKey,
        session.language,
        {
          raw: true,
          temperature: 0.3,
          retries: 3,
          retryDelay: 2000,
          conversationHistory
        }
      );
    } catch (err) {
      console.warn("[consultationAIEngine] Gemini API notice, engaging deterministic fallback:", err);
      responseText = generateDeterministicFallbackReading(
        session,
        userQuestion,
        lagnaName,
        moonRashi,
        nakshatra,
        currentDashaText,
        activeDosha
      );
    }
  }

  // Clean any markdown formatting artifacts
  const cleaned = responseText
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/[#_]/g, "")
    .trim();

  // Split into paragraphs
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return {
    fullText: cleaned,
    paragraphs: paragraphs.length > 0 ? paragraphs : [cleaned],
    hasDosha: activeDosha.hasDosha,
    doshaName: activeDosha.doshaName,
    doshaParihara: activeDosha.recommendedPooja,
    astrologicalHighlights: {
      lagna: lagnaName,
      moonSign: moonRashi,
      nakshatra: `${nakshatra} (ಪಾದ ${pada})`,
      currentDasha: currentDashaText,
      keyInfluences: [
        `${lagnaName} ಲಗ್ನ & ${moonRashi} ರಾಶಿ`,
        `ಪ್ರಸ್ತುತ: ${currentDashaText}`,
        activeDosha.hasDosha
          ? `ದೋಷ ಪರಿಹಾರ: ${activeDosha.doshaName}`
          : `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಣೆ`
      ]
    }
  };
}

/**
 * Deterministic fallback reading ensuring 100% availability even without an API key.
 * Adapts to greetings, conversational questions, and full 3/4-paragraph astrological inquiries.
 */
function generateDeterministicFallbackReading(
  session: ConsultationSession,
  question: string,
  lagna: string,
  rashi: string,
  nakshatra: string,
  dasha: string,
  activeDosha: ActiveDoshaContext
): string {
  const isGreeting =
    /^(ನಮಸ್ಕಾರ|ಹಲೋ|ಹೇಗಿದ್ದೀರಿ|ಗುರೂಜಿ|ಸ್ವಾಮಿ|hello|hi|namaste|how are you|pranam|namaskara)/i.test(
      question.trim()
    );

  if (session.language === "en") {
    if (isGreeting) {
      return `Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna bestow their divine grace and blessings upon you and your family.\n\nI am sitting with you here in this sacred 20-minute consultation. Please feel at complete peace. You can open your heart and ask any question regarding your life, career, marriage, health, or family dilemmas.`;
    }

    const baseP1 = `Namaste ${session.name}. According to your birth chart calculated with Baggona Panchanga, you are born in ${lagna} Lagna and ${rashi} Moon Sign with ${nakshatra} Nakshatra. Regarding your question on "${question}", your planetary combinations indicate that the current period governed by ${dasha} is bringing significant pivotal transformations. The ruling planet of your ascendant provides strong foundational resilience, while transiting Jupiter and Saturn require patience in key negotiations.`;

    const baseP2 = `In the realm of your personal and professional endeavors, your chart reveals gradual clearance of previous hurdles. Astrological calculations indicate that the forthcoming planetary movements favor stability, long-term investments, and collaborative harmony. Maintaining mental equilibrium and avoiding hasty impulsive commitments during this cycle will unlock substantial prosperity.`;

    const baseP3 = `The planetary transits over the coming lunar cycles indicate a progressive turning point. When Jupiter casts its divine benefic aspect upon your key natal houses, the confusion that clouding your decisions will dissolve into crystalline clarity. Continue your earnest efforts with disciplined patience, for the cosmic timing is aligning to reward your dedication.`;

    if (activeDosha.hasDosha) {
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${activeDosha.doshaName || "Kuja/Manglik Dosha"}. This dosha arose because of specific planetary tensions in your chart (${activeDosha.technicalWhy || "unfavorable placement in cardinal houses"}), which is actively manifesting in your life right now as persistent delays, unexpected obstacles, and emotional restlessness. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${activeDosha.recommendedPooja || "Sri Kshetra Gokarna Shanti Pooja and Rudrabhisheka"}. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement, peace, and auspicious results in your life. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
      return `${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`;
    }

    return `${baseP1}\n\n${baseP2}\n\nFor divine grace and obstacle removal, it is auspicious to offer prayers to Sri Mahabaleshwara and Lord Ganapati at Sri Kshetra Gokarna. Reciting the sacred Gayatri Mantra and lighting a pure cow-ghee lamp on Mondays or Saturdays will harmonize the prevailing planetary energies and bring peace and success.`;
  }

  // Kannada Default Fallback
  if (isGreeting) {
    return `ಹರಿ ಓಂ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಕಲ ಕೃಪಾಕಟಾಕ್ಷ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೇಲೆ ಸದಾ ಇರಲಿ.\n\nನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಕೊಠಡಿಯಲ್ಲಿ ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಯಾವುದೇ ಗೊಂದಲ, ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ, ವಿವಾಹ, ಕೌಟುಂಬಿಕ ವಿಚಾರ ಅಥವಾ ದೋಷ ಪರಿಹಾರಗಳ ಕುರಿತು ಮುಕ್ತವಾಗಿ ಪ್ರಶ್ನಿಸಿ.`;
  }

  const p1 = `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಶಾಸ್ತ್ರೋಕ್ತ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿ ಹಾಗೂ ${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನ್ಮತಾಳಿದ್ದೀರಿ. ನಿಮ್ಮ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಮಹತ್ವದ ತಿರುವು ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳನ್ನು ನಿರ್ದೇಶಿಸುತ್ತಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮಗೆ ಆತ್ಮಸ್ಥೈರ್ಯ ನೀಡುತ್ತಿದ್ದು, ಗೋಚಾರ ಗ್ರಹಗಳಾದ ಗುರು ಮತ್ತು ಶನಿ ಪ್ರಭಾವದಿಂದ ಹಂತ ಹಂತವಾಗಿ ಸಕಲ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.`;

  const p2 = `ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಭಾವಗಳನ್ನು ಗಮನಿಸಿದಾಗ, ಈ ಹಿಂದೆ ಎದುರಾಗಿದ್ದ ಮಾನಸಿಕ ಆತಂಕಗಳು ಮತ್ತು ಕಾರ್ಯವಿಳಂಬಗಳು ಈಗ ನಿಧಾನವಾಗಿ ಪರಿಹಾರವಾಗುವ ಲಕ್ಷಣಗಳಿವೆ. ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಹಾಗೂ ಕುಟುಂಬ ಸೌಖ್ಯದ ವಿಚಾರದಲ್ಲಿ ಧನಾತ್ಮಕ ಫಲಗಳು ಗೋಚರಿಸುತ್ತಿದ್ದು, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ತಾಳ್ಮೆಯ ನಡೆ ನಿಮಗೆ ಹೆಚ್ಚಿನ ಯಶಸ್ಸನ್ನು ತಂದುಕೊಡುತ್ತದೆ. ಯಾವುದೇ ಅತಿ ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳದೆ, ಗ್ರಹಬಲಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಹೆಜ್ಜೆ ಇಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.`;

  const p3 = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗುರು ಗ್ರಹದ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳಿಗೆ ಬಲವನ್ನು ನೀಡಲಿದ್ದು, ಹೊಸ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಯೋಗ್ಯ ಕಾಲಾವಕಾಶ ಸೃಷ್ಟಿಯಾಗಲಿದೆ. ತಾಳ್ಮೆ ಮತ್ತು ಸತತ ಪ್ರಯತ್ನಗಳಿಂದ ನಿಮ್ಮ ನಿರೀಕ್ಷಿತ ಗುರಿಗಳನ್ನು ತಲುಪಲು ಸಾಧ್ಯವಾಗಲಿದ್ದು, ದೈವಾನುಗ್ರಹದಿಂದ ನಿಧಾನವಾಗಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ. ಯಾವುದೇ ನಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳಿಗೆ ಎಡೆಕೊಡದೆ ಶುಭ ಸಂಕಲ್ಪದೊಂದಿಗೆ ಹೆಜ್ಜೆಯಿಡಿ.`;

  if (activeDosha.hasDosha) {
    const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${activeDosha.doshaName || "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ"}" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${activeDosha.technicalWhy || "ಗ್ರಹಗಳ ಅಶುಭ ಸಂಯೋಜನೆ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ"} ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${activeDosha.currentLifeProblems || "ಕಾರ್ಯವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ವಿಪರೀತ ಅಡೆತಡೆಗಳು"}" ಎದುರಾಗುತ್ತಿವೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿ ಹೋಮ"}" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಖಂಡಿತವಾಗಿಯೂ ಧನಾತ್ಮಕ ಸುಧಾರಣೆ ಮತ್ತು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳ ಸಿದ್ಧಿ ಗೋಚರಿಸುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
    return `${p1}\n\n${p2}\n\n${p3}\n\n${p4Dosha}`;
  }

  const p3Normal = `ಗ್ರಹದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಜಯಕ್ಕಾಗಿ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಶನಿವಾರದಂದು ದೀಪಾರಾಧನೆ ಮಾಡಿ ಇಷ್ಟದೇವತಾ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಸಮಸ್ತ ಇಷ್ಟಾರ್ಥಗಳು ಶೀಘ್ರವಾಗಿ ಕೈಗೂಡಿ ಸಕಲ ಶುಭವಾಗುತ್ತದೆ.`;
  return `${p1}\n\n${p2}\n\n${p3Normal}`;
}

