/**
 * Baggona Panchanga - Senior Priest Presenter & Intelligent Sensing Engine
 * (ಹಿರಿಯ ಪುರೋಹಿತ ಪ್ರೆಸೆಂಟರ್ ಹಾಗೂ ಪ್ರಶ್ನಾವಳಿ ಗ್ರಹಣ ಎಂಜಿನ್)
 *
 * Frontline Intelligent Layer for the 20-Minute Devotee Consultation:
 * 1. Senses Devotee Identity: Age, life-stage (youth/mid-career/senior), birth location, and emotional tone.
 * 2. Categorizes Devotee Questions intelligently into:
 *    - ASTROLOGICAL_DEEP: Core Kundli, Lagna, Rashi, Bhavas, Vimshottari Dasha, Gochara, Dosha & Gokarna Parihara
 *    - DAILY_TRIP_TRAVEL: Immediate travel, trips tomorrow, journey precautions, travel muhurtha & Kuladevata prayer
 *    - INTERPERSONAL_CONFLICT: Fights, quarrels, arguments with relatives/friends, anger management & Vedic Shanti
 *    - DOMESTIC_OMEN_VASTU: Old vessel/pots found, mysterious corner findings, house omens, vastu corners & purification
 *    - CELEBRITY_FANTASY: Desires to marry Aishwarya Rai, heroines, actresses, unattainable dreams
 *    - PROVOCATIVE_TABOO: Inappropriate, adult star / pornstar, vulgar testing or provocative questions
 *    - LIFE_OVERVIEW_EXISTENTIAL: "What is happening in my life right now?", feeling lost, general life direction
 *    - CONVERSATIONAL_GREETING: Greetings, "how are you Swamiji", seeking blessings
 * 3. 50+ Year Revered Gokarna Priest Persona:
 *    - Always polite, cultured, fatherly, dignified, deeply compassionate, never harsh or angry.
 *    - Gently grounds fantasy with practical truth (e.g. celebrities already married, encourage hard work & character).
 *    - Defuses conflict with peace and Dharma.
 *    - Purifies domestic fears with sacred Vedic rituals rather than blind superstition.
 * 4. Deterministic Multi-Language Fallbacks across all 7 languages (kn, en, hi, te, ta, ml, mr).
 */

import { type ConsultationSession, type ConsultationLanguage } from "./consultationTypes";
import {
  computeDevoteeKundli,
  detectRelevantQuestionDosha,
  generateConsultationAnswer,
  CONSULTATION_LANG_NAMES,
  type ConsultationReadingResult
} from "./consultationAIEngine";
import { askGemini, type AskGeminiChatTurn } from "../../core/GeminiEngine";
import { calculateComprehensiveDoshas } from "../../core/ComprehensiveDoshaEngine";

export type ConsultationQuestionCategory =
  | "ASTROLOGICAL_DEEP"
  | "DAILY_TRIP_TRAVEL"
  | "INTERPERSONAL_CONFLICT"
  | "DOMESTIC_OMEN_VASTU"
  | "CELEBRITY_FANTASY"
  | "SECRET_INTIMATE_TABOO"
  | "SILLY_TROLLING_MOCKERY"
  | "PROVOCATIVE_TABOO"
  | "LIFE_OVERVIEW_EXISTENTIAL"
  | "CONVERSATIONAL_GREETING";

export interface SensedDevoteeContext {
  ageYears: number;
  lifeStage: "YOUTH" | "MID_CAREER" | "SENIOR";
  place: string;
  category: ConsultationQuestionCategory;
  categoryLabel: string;
  detectedTopicSnippet?: string;
  priestPersonaTone: "compassionate_grounding" | "divine_oracle" | "gentle_wisdom" | "peaceful_counsel";
}

/**
 * Intelligent frontline classifier that senses devotee age, life stage, and question nature.
 */
export function senseAndCategorizeQuestion(
  userQuestion: string,
  session: ConsultationSession
): SensedDevoteeContext {
  const q = userQuestion.toLowerCase().trim();

  // 1. Calculate Native's Age from DOB
  let ageYears = 30; // fallback default
  try {
    const [y, m, d] = session.dob.split("-").map(Number);
    const birthDate = new Date(y, (m || 1) - 1, d || 1);
    const now = new Date();
    const diffMs = now.getTime() - birthDate.getTime();
    ageYears = Math.max(1, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
  } catch {
    ageYears = 30;
  }

  const lifeStage: "YOUTH" | "MID_CAREER" | "SENIOR" =
    ageYears < 28 ? "YOUTH" : ageYears <= 48 ? "MID_CAREER" : "SENIOR";

  // 2. Category Detection via Linguistic Rules (Kannada, English, Hindi, Transliteration)

  // 1. Silly, Childish Trolling, Cartoon/Superhero, Aliens, Jokes, or Nonsense Gibberish
  const isSillyTrolling =
    // Fictional characters & superheroes
    /ಬ್ಯಾಟ್‌ಮ್ಯಾನ್|batman|ಸ್ಪೈಡರ್‌ಮ್ಯಾನ್|spiderman|spider-man|ಸೂಪರ್‌ಮ್ಯಾನ್|superman|ಶ್ರೆಕ್|shrek|ಡೊನಾಲ್ಡ್ ಡಕ್|donald duck|ಮಿಕ್ಕಿ ಮೌಸ್|mickey mouse|ಅಯರ್ನ್ ಮ್ಯಾನ್|iron man|ironman|ಹಲ್ಕ್|hulk|ಟಾಮ್ ಅಂಡ್ ಜೆರ್ರಿ|tom and jerry|ಅವೆಂಜರ್ಸ್|avengers|alien|ಏಲಿಯನ್|ಯುಎಫ್‌ಓ|ufo|ಮಂಗಳ ಗ್ರಹದಲ್ಲಿ ನೀರು|ಮಂಗಳ ಗ್ರಹದಲ್ಲಿ ಪಿಜ್ಜಾ|ಪಿಜ್ಜಾ|pizza|ಬರ್ಗರ್|burger|ಐಸ್‌ಕ್ರೀಮ್|ice cream/i.test(q) ||
    // Jokes, comedy, laughter, comedy tests
    /funny joke|tell.*joke|jokes|chutkula|चुटकुला|ಮಜವಾದ ಜೋಕ್|ತಮಾಷೆ ಜೋಕ್|ಕಾಮಿಡಿ ಜೋಕ್|comedy|funny story|joke haha|lol|rofl|lmao|ಹಾಡು ಹೇಳು|ಡ್ಯಾನ್ಸ್ ಮಾಡು|make me laugh|who is better messi or ronaldo|can my dog talk|am i a robot|are you an ai|are you real|what is 2\+2|what color is an orange/i.test(q) ||
    /tell me a joke|sing a song|sing me a song|say a joke|tell a joke|comedy ಹೇಳಿ|ಜೋಕ್ ಹೇಳಿ|ತಮಾಷೆ|ಕಾಮಿಡಿ/i.test(q) ||
    // Repetitive character spam (e.g. "aaaaaaa", "zzzzzzzz")
    /(.)\1{5,}/.test(q) ||
    // Keyboard smash gibberish (e.g. "asdfghjklqwerty zxcvbnm")
    /asdfghjkl|qwerty|zxcvbnm/i.test(q) ||
    // Pure keyboard smash gibberish without spaces or vowels
    (/^[bcdfghjklmnpqrstvwxyz]{6,}$/i.test(q) || /^[asdfghjklqwertyuiopzxcvbnm]{10,}$/i.test(q));

  if (isSillyTrolling) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "SILLY_TROLLING_MOCKERY",
      categoryLabel: "ಅರ್ಥಹೀನ / ಹಾಸ್ಯಾಸ್ಪದ ಪ್ರಶ್ನೆ (Frivolous / Silly Mockery Query)",
      detectedTopicSnippet: "Silly / Trolling / Mockery Query",
      priestPersonaTone: "gentle_wisdom"
    };
  }

  // 2. Secret, Intimate, Taboo, Extramarital, or "Dirty" Questions (Vedic Kama / 7th, 8th & 12th Bhava)
  const isSecretIntimateTaboo =
    // Secret affair, extramarital, cheating, forbidden attraction (Kannada, Hindi, English)
    /ಅಕ್ರಮ ಸಂಬಂಧ|ಬೇರೊಬ್ಬರ ಮೇಲೆ ಆಕರ್ಷಣೆ|ರಹಸ್ಯ ಪ್ರೇಮ|ಬೇರೆ ಹೆಂಗಸು|ಬೇರೆ ಗಂಡಸು|ಪರಸ್ತ್ರೀ|ಪರಪುರುಷ|ಪರಸ್ತ್ರೀಯ|ಅನೈತಿಕ ಸಂಬಂಧ|extra[ -]?marital|affair|cheating|secret relationship|hidden relationship|secret love|forbidden love|infidelity|adultery|secret partner|hidden love|attracted to married|crush on married|secret lover|ರಹಸ್ಯ ಗೆಳೆಯ|ರಹಸ್ಯ ಗೆಳತಿ|ಗುಪ್ತ ಸಂಬಂಧ|गुप्त संबंध|अवैध संबंध|वासना|कामुक|कामुकता|परस्त्री|दूसरे से संबंध|गुप्त प्रेम|व्यभिचार|गुप्त आकर्षण|गुप्त इಷ್ಟಾರ್ಥ|ರಹಸ್ಯ ಆಕರ್ಷಣೆ|ಗುಪ್ತ ಆಕರ್ಷಣೆ/i.test(q) ||
    // Intimate sexual queries, vitality, masturbation, libido, bedroom desires ("dirty questions")
    /ಸೆಕ್ಸ್|sex|ಕಾಮ|ಕಾಮನೆ|ಲೈಂಗಿಕ|ದೈಹಿಕ ಸುಖ|ವ್ಯಾಮೋಹ|ರಹಸ್ಯ ಕಾಮ|ಗುಪ್ತ ವಿಚಾರ|ಶಿಶ್ನ|ಯೋನಿ|ವೀರ್ಯ|ಸ್ಖಲನ|ಶೀಘ್ರಸ್ಖಲನ|ಹಸ್ತಮೈಥುನ|ಅಶ್ಲೀಲ|ಬೂತು|ಬೆತ್ತಲೆ|dirty question|intimacy|sexual|libido|erection|premature ejaculation|masturbation|bed pleasure|bedroom secret|physical desire|lust|private organ|intimate problem|sexual weakness|sexual power|intercourse|संभोग|हस्तमैथुन|यौन/i.test(q) ||
    // Secret guilt, hidden desires, fear of scandal
    /ರಹಸ್ಯವಾಗಿ ಇಷ್ಟಪಡುತ್ತೇನೆ|ಯಾರಿಗೂ ಹೇಳೋಕೆ ಆಗ್ತಿಲ್ಲ|ಯಾರಿಗೂ ಹೇಳಲಾಗದ ರಹಸ್ಯ|ಮನಸ್ಸಿನಲ್ಲಿ ಕೆಟ್ಟ ಆಲೋಚನೆ|ಕೆಟ್ಟ ಕಾಮನೆ|can't tell anyone|private secret|dirty secret|guilty desire|taboo desire|secret crush/i.test(q);

  if (isSecretIntimateTaboo) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "SECRET_INTIMATE_TABOO",
      categoryLabel: "ರಹಸ್ಯ ಹಾಗೂ ಅಂತರಂಗ ಕಾಮ ಭಾವ ವಿಚಾರ (Secret, Intimate & Relationship Counsel)",
      detectedTopicSnippet: "Secret / Intimate / Kama Query",
      priestPersonaTone: "compassionate_grounding"
    };
  }

  // A. Celebrity Fantasy (Aishwarya Rai, heroines, actresses, models)
  const isCelebrityFantasy =
    /ಐಶ್ವರ್ಯ|aishwarya|aiswarya|ಹೀರೋಯಿನ್|heroine|ನಟಿ|actress|ಸೆಲೆಬ್ರಿಟಿ|celebrity|ದೀಪಿಕಾ|deepika|ಕತ್ರಿನಾ|katrina|ಸಮಂತಾ|samantha|ರಶ್ಮಿಕಾ|rashmika|ಪೂಜಾ|pooja hegde|ತಾರೆ|ಸಿನಿಮಾ ನಟಿ/i.test(
      q
    ) && /ಮದುವೆ|marry|wedding|ಲವ್|love|ಪ್ರೀತಿಸ|ಆಗಬಹುದಾ|possible/i.test(q);

  if (isCelebrityFantasy) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "CELEBRITY_FANTASY",
      categoryLabel: "ಸೆಲೆಬ್ರಿಟಿ ವಿವಾಹ / ಕಲ್ಪನಾ ವಿಚಾರ (Celebrity Fantasy)",
      detectedTopicSnippet: "Celebrity Marriage Fantasy",
      priestPersonaTone: "compassionate_grounding"
    };
  }

  // B. Provocative / Taboo / Adult Star / Vulgar Testing
  const isProvocativeTaboo =
    /porn|pornstar|ಪಾಪ್|ಕಾಮ|ಬೂತು|adult star|ಸೆಕ್ಸ್|sex|blue film|ಅಶ್ಲೀಲ|vulgar|ಬೆತ್ತಲೆ|nude/i.test(
      q
    );

  if (isProvocativeTaboo) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "PROVOCATIVE_TABOO",
      categoryLabel: "ಇಂದ್ರಿಯ ನಿಗ್ರಹ / ಪಾವಿತ್ರ್ಯ ಮಾರ್ಗದರ್ಶನ (Spiritual Purity & Discipline)",
      detectedTopicSnippet: "Taboo or Provocative Query",
      priestPersonaTone: "gentle_wisdom"
    };
  }

  // C. Domestic Omens & Vastu (Old vessel found, corner findings, strange domestic occurrences)
  const isDomesticOmen =
    /ಪಾತ್ರೆ|ಪಾತ್ರೆ ಸಿಕ್ಕಿದೆ|ಹಳೆ ಪಾತ್ರೆ|vessel|pot|ತಾಮ್ರದ ಪಾತ್ರೆ|ಹಿತ್ತಾಳೆ ಪಾತ್ರೆ|old vessel|utensil|ಮೂಲೆ|ಮೂಲೆಯಲ್ಲಿ|ಈ ಮೂಲೇಲಿ|ಆ ಮೂಲೇಲಿ|corner|ಖುಣಿ/i.test(
      q
    ) ||
    (/ಮನೆಯಲ್ಲಿ.*ಸಿಕ್ಕಿದೆ|found.*(house|room|corner|vessel|pot)|ವಾಸ್ತು|vastu|ಶಕುನ|ನಿಮಿತ್ತ|omen/i.test(
      q
    ) && !/ಜಾತಕ|ಕುಂಡಲಿ|ದೋಷ/i.test(q));

  if (isDomesticOmen) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "DOMESTIC_OMEN_VASTU",
      categoryLabel: "ಮನೆ ವಾಸ್ತು ಹಾಗೂ ನಿಮಿತ್ತ ವಿಚಾರ (Domestic Omens & Vastu Guidance)",
      detectedTopicSnippet: "House Finding / Vastu / Omen",
      priestPersonaTone: "peaceful_counsel"
    };
  }

  // D. Daily Trip & Travel (Going on a trip tomorrow, journey, travel muhurtha)
  const isDailyTrip =
    /ಟ್ರಿಪ್|trip|ಪ್ರವಾಸ|travel|ನಾಳೆ.*ಹೋಗ್ಬೇಕು|ನಾಳೆ.*ಹೋಗ|ಹೋಗಬಹುದಾ|journey|tour|ನಾಳೆ ಟ್ರಿಪ್|ಪ್ರಯಾಣ|ಹೊರಡ|vehicle/i.test(
      q
    );

  if (isDailyTrip) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "DAILY_TRIP_TRAVEL",
      categoryLabel: "ಪ್ರವಾಸ ಹಾಗೂ ಮುಹೂರ್ತ ಮಾರ್ಗದರ್ಶನ (Travel & Journey Muhurtha)",
      detectedTopicSnippet: "Travel / Trip Planning",
      priestPersonaTone: "peaceful_counsel"
    };
  }

  // E. Interpersonal Conflict & Anger (Fights, quarrels, dispute with someone)
  const isConflict =
    /ಫೈಟ್|fight|ಜಗಳ|quarrel|ಹೊಡೆದಾಟ|ದ್ವೇಷ|ಕೋಪ|ನನಗೂ ಅವನಿಗೂ|ಅವನಿಗೆ ಏನು ಮಾಡ್ಲಿ|ಅವಳಿಗೆ ಏನು ಮಾಡ್ಲಿ|enemy|conflict|argument|dispute|ಶತ್ರು|ಮನಸ್ತಾಪ/i.test(
      q
    );

  if (isConflict) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "INTERPERSONAL_CONFLICT",
      categoryLabel: "ವಿವಾದ ಪರಿಹಾರ ಹಾಗೂ ಶಾಂತಿ ಮಾರ್ಗದರ್ಶನ (Conflict Resolution & Peace)",
      detectedTopicSnippet: "Interpersonal Conflict / Fight",
      priestPersonaTone: "peaceful_counsel"
    };
  }

  // F. Conversational Greeting & Blessings
  const isGreeting =
    /^(ನಮಸ್ಕಾರ|ಹಲೋ|ಹೇಗಿದ್ದೀರಿ|ಗುರೂಜಿ|ಸ್ವಾಮಿ|hello|hi|namaste|how are you|pranam|namaskara)/i.test(
      q
    ) && q.split(" ").length <= 8;

  if (isGreeting) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "CONVERSATIONAL_GREETING",
      categoryLabel: "ಆಶೀರ್ವಾದ ಹಾಗೂ ಕ್ಷೇಮ ವಿಚಾರಣೆ (Priestly Blessing & Greeting)",
      detectedTopicSnippet: "Greeting / Blessing",
      priestPersonaTone: "divine_oracle"
    };
  }

  // G. Life Overview & Existential Query ("What is happening in my life now?")
  const isLifeOverview =
    /ಏನು ನಡೀತಿದೆ|ಏನು ನಡೆಯುತ್ತಿದೆ|ನನ್ನ ಜೀವನದಲ್ಲಿ|ಜೀವನದಲ್ಲಿ ಏನು|what is happening in my life|how is my life|ನನ್ನ ಬದುಕು|ದಾರಿ ಕಾಣ್ತಿಲ್ಲ|lost in life|ಏನು ಮಾಡ್ಲಿ ಈಗ|ಏನ್ ಮಾಡ್ಲಿ/i.test(
      q
    );

  if (isLifeOverview) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "LIFE_OVERVIEW_EXISTENTIAL",
      categoryLabel: "ಸಮಗ್ರ ಜೀವನ ಸ್ಥಿತಿ ಹಾಗೂ ದಶಾ ಅವಲೋಕನ (Comprehensive Life & Dasha Overview)",
      detectedTopicSnippet: "Life Overview Query",
      priestPersonaTone: "divine_oracle"
    };
  }

  // Default: Deep Astrological Kundli Inquiry
  return {
    ageYears,
    lifeStage,
    place: session.place,
    category: "ASTROLOGICAL_DEEP",
    categoryLabel: "ವೈದಿಕ ಜಾತಕ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ (Deep Astrological Analysis)",
    detectedTopicSnippet: "Astrological Reading",
    priestPersonaTone: "divine_oracle"
  };
}

/**
 * Main Frontline Presenter Entry Point:
 * Senses the devotee, categorizes the question, routes appropriately,
 * invokes Gemini with the dignified 50+ year priest persona, and guarantees
 * a respectful, compassionate, and wise reply across all question types.
 */
export async function presentConsultationReply(params: {
  session: ConsultationSession;
  userQuestion: string;
  conversationHistory?: AskGeminiChatTurn[];
  apiKey?: string;
}): Promise<ConsultationReadingResult & { sensedContext: SensedDevoteeContext }> {
  const { session, userQuestion, conversationHistory, apiKey } = params;

  // Step 1: Frontline Sensing & Categorization
  const sensed = senseAndCategorizeQuestion(userQuestion, session);
  console.log(
    `[consultationPresenterEngine] Devotee "${session.name}" (Age: ${sensed.ageYears}, ${sensed.lifeStage}) -> Category: ${sensed.category}`
  );

  // If question is pure deep astrological, delegate directly to the deep chart math engine
  if (sensed.category === "ASTROLOGICAL_DEEP") {
    const reading = await generateConsultationAnswer({
      session,
      userQuestion,
      conversationHistory,
      apiKey
    });
    return { ...reading, sensedContext: sensed };
  }

  // Step 2: For non-pure-astrological inquiries, compute astrological baseline for grounding
  let lagnaName = "ಮೇಷ";
  let moonRashi = "ವೃಷಭ";
  let nakshatra = "ರೋಹಿಣಿ";
  let pada = 1;
  let currentDashaText = "ಶುಭ ದಶಾ ಕಾಲ";
  let ageYears = sensed.ageYears;

  try {
    const astro = await computeDevoteeKundli(session);
    lagnaName = astro.lagnaName;
    moonRashi = astro.moonRashi;
    nakshatra = astro.nakshatra;
    pada = astro.pada;
    currentDashaText = astro.currentDashaText;
    ageYears = astro.ageYears;
  } catch (e) {
    console.warn("[consultationPresenterEngine] Baseline astro notice:", e);
  }

  const targetLang = CONSULTATION_LANG_NAMES[session.language] || "Kannada";

  // Step 3: Construct the Senior Priest Presenter Prompt
  const presenterPrompt = buildPresenterPrompt({
    session,
    userQuestion,
    sensed,
    lagnaName,
    moonRashi,
    nakshatra,
    pada,
    currentDashaText,
    targetLang
  });

  let responseText = "";

  if (!apiKey || !apiKey.trim()) {
    responseText = generateSpecializedFallbackReply({
      session,
      userQuestion,
      sensed,
      lagnaName,
      moonRashi,
      nakshatra,
      currentDashaText
    });
  } else {
    try {
      responseText = await askGemini(
        userQuestion,
        presenterPrompt,
        apiKey,
        session.language,
        {
          raw: true,
          temperature: 0.35,
          retries: 3,
          retryDelay: 2000,
          conversationHistory
        }
      );
    } catch (err) {
      console.warn("[consultationPresenterEngine] Gemini call failed, engaging specialized deterministic fallback:", err);
      responseText = generateSpecializedFallbackReply({
        session,
        userQuestion,
        sensed,
        lagnaName,
        moonRashi,
        nakshatra,
        currentDashaText
      });
    }
  }

  // Clean formatting artifacts
  const cleaned = responseText
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/[#_]/g, "")
    .trim();

  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return {
    fullText: cleaned,
    paragraphs: paragraphs.length > 0 ? paragraphs : [cleaned],
    hasDosha: false,
    sensedContext: sensed,
    astrologicalHighlights: {
      lagna: lagnaName,
      moonSign: moonRashi,
      nakshatra: `${nakshatra} (ಪಾದ ${pada})`,
      currentDasha: currentDashaText,
      keyInfluences: [
        `${lagnaName} ಲಗ್ನ & ${moonRashi} ರಾಶಿ`,
        `ಪ್ರಸ್ತುತ: ${currentDashaText}`,
        `ಮಾರ್ಗದರ್ಶನ: ${sensed.categoryLabel}`
      ]
    }
  };
}

/**
 * Builds the customized prompt for the 50+ year revered priest persona based on sensed category.
 */
function buildPresenterPrompt(params: {
  session: ConsultationSession;
  userQuestion: string;
  sensed: SensedDevoteeContext;
  lagnaName: string;
  moonRashi: string;
  nakshatra: string;
  pada: number;
  currentDashaText: string;
  targetLang: string;
}): string {
  const {
    session,
    userQuestion,
    sensed,
    lagnaName,
    moonRashi,
    nakshatra,
    pada,
    currentDashaText,
    targetLang
  } = params;

  let categorySpecificInstructions = "";

  switch (sensed.category) {
    case "SECRET_INTIMATE_TABOO":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR SECRET, INTIMATE, TABOO, EXTRAMARITAL, OR "DIRTY" QUESTIONS:
The devotee is opening their heart about an intensely private, confidential, sexual, extramarital, or taboo question:
- Devotee Age: ${sensed.ageYears} years old (${sensed.lifeStage}).
- Janma Lagna: ${lagnaName}, Moon Sign: ${moonRashi}, Current Running Dasha: ${currentDashaText}.
- PRIEST PROTOCOL:
  1. Address them with fatherly warmth, non-judgmental dignity, and saintly compassion (ಮಗುವೇ / ಪ್ರಿಯ ಸೋದರನೇ).
  2. Speak with absolute discretion and understanding: In Vedic Jyotisha, Kama (ಕಾಮ - desire) is recognized as one of the four sacred Purusharthas (Dharma, Artha, Kama, Moksha). Human physical desire and attraction are natural cosmic energies governed by planetary transits, not unforgivable sins.
  3. Ground the explanation in the native's chart:
     - Venus (ಶುಕ್ರ - Shukra) governs love, sexual desire, and shukra dhatu (vitality).
     - Rahu (ರಾಹು) creates intense Maya (illusion), obsessive cravings, taboo attractions, and clandestine impulses.
     - Kuja / Mars (ಕುಜ) fuels blood-heat, passion, and restlessness.
     - 7th House (ಸಪ್ತಮ ಭಾವ / ಕಳತ್ರ ಸ್ಥಾನ) represents lawful marriage and reciprocal affection.
     - 8th House (ಅಷ್ಟಮ / ಗುಪ್ತ ಭಾವ) rules confidential secrets, private organs, hidden affairs, and vulnerability to scandal/humiliation (ಕೀರ್ತಿಭಂಗ).
     - 12th House (ದ್ವಾದಶ ಭಾವ) rules bed pleasures (ಶಯನ ಸುಖ), subconscious guilt, and secret indulgences.
  4. Provide clear Dharmic and practical counsel:
     - If it involves an extramarital or forbidden affair: Gently remind the native that while Rahu's illusion gives momentary excitement, its 8th-house karmic retribution inevitably brings scandal, loss of honor, and destroys domestic peace. Advise taking a firm, dignified step back to protect their family integrity.
     - If it involves physical vitality, sexual anxiety, or masturbation guilt: Reassure them that vitality is naturally restored through a pure sattvic diet, Pranayama, and healthy lifestyle habits. Self-hatred and mental guilt harm the body and mind far more than the act itself.
  5. Prescribe Gokarna Pariharas:
     - Gokarna Sri Mahabaleshwara Rudrabhisheka (ರುದ್ರಾಭಿಷೇಕ) to cool internal heat and bring mental tranquility.
     - Rahu-Shukra Shanti or Navagraha Prarthana.
     - Daily chanting of Shiva Panchakshari ("ಓಂ ನಮಃ ಶಿವಾಯ") or Gayatri Mantra to fortify mental discipline and inner peace.`;
      break;

    case "SILLY_TROLLING_MOCKERY":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR SILLY, CHILDISH TROLLING, CARTOON/SUPERHERO, OR MOCKERY QUESTIONS:
The devotee or visitor has submitted a frivolous, absurd, comedic, or mocking question (e.g. asking about Batman, aliens eating pizza, tell a joke, sing a song, or random gibberish):
- PRIEST PROTOCOL:
  1. STRICTLY REFUSE TO ANSWER OR ENTERTAIN THE SILLY INQUIRY.
  2. Absolutely DO NOT talk about fictional superheroes, cartoons, alien food, jokes, or mockery.
  3. Respond with solemn, resolute, dignified priestly authority and fatherly composure.
  4. Remind the devotee that this sacred 20-minute Gokarna consultation room is consecrated strictly for authentic Vedic horoscope analysis, genuine life dilemmas, and spiritual counsel.
  5. Calmly advise them not to squander this precious time and invite them to ask sincere questions about their real life, family, career, health, or spiritual path.`;
      break;

    case "CELEBRITY_FANTASY":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR CELEBRITY / HEROINE MARRIAGE FANTASY:
The devotee is asking if they can marry a celebrity / actress (e.g. Aishwarya Rai or similar):
- Devotee Age: ${sensed.ageYears} years old (${sensed.lifeStage}).
- PRIEST PROTOCOL:
  1. Address them with fatherly warmth, dignity, and calm maturity (ಮಗುವೇ / ಪ್ರಿಯ ಸೋದರನೇ).
  2. Speak the honest reality gently: If they mention Aishwarya Rai or famous actresses, kindly remind them that the person is already happily married and leading her own established family life with her husband and children.
  3. Never mock, scold, or ridicule the devotee.
  4. Inspire them with real-world Vedic wisdom: Look at the accomplished, hard-working, and respectable individuals who marry such remarkable people. If the devotee desires a high-stature life partner, they must first build exceptional personal character, work diligently, earn an honorable livelihood and wealth, and cultivate genuine maturity.
  5. Connect to their chart: Advise them to channel their youthful energy away from distant screen fantasies toward their real-world 7th House (ಸಪ್ತಮ ಭಾವ) and Venus (ಶುಕ್ರ). Assure them that by putting in sincere effort, they will attract an equally virtuous, loving, and noble life partner suited for their real life.`;
      break;

    case "PROVOCATIVE_TABOO":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR PROVOCATIVE / TABOO / ADULT STAR / VULGAR QUESTIONS:
The devotee has asked an inappropriate, vulgar, or taboo question (e.g. regarding pornstars or provocative tests):
- PRIEST PROTOCOL:
  1. Maintain unshakable saintly serenity and dignified fatherly purity.
  2. Strictly DO NOT show anger, disgust, or use vulgar/harsh language.
  3. With compassionate paternal authority, remind them of the sacred sanctum of Sri Kshetra Gokarna and the dignity of human birth.
  4. Explain gently that chasing temporary lustful illusions and digital distractions weakens mental clarity, self-esteem, and Dharma.
  5. Encourage them to practice self-discipline (ಇಂದ್ರಿಯ ನಿಗ್ರಹ), respect their parents and future family, and channel their thoughts into noble education and spiritual peace. Recommend reciting the sacred Shiva Panchakshari or Gayatri mantra to steady the mind.`;
      break;

    case "DOMESTIC_OMEN_VASTU":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR DOMESTIC OMENS & VASTU (OLD VESSEL / CORNER FINDING):
The devotee is curious or concerned about finding an old vessel/pot or strange item in a corner of their house:
- PRIEST PROTOCOL:
  1. Remove all superstitious fear and blind panic.
  2. In Vedic Vastu & Nimitta Shastra, metallic vessels (especially copper or brass) carry elemental grounding energies. Corners of the home (especially North-East / Ishanya and South-West / Nairutya) represent vital spatial energy nodes.
  3. Practical & Sacred Vedic Guidance:
     - Advise cleaning the vessel respectfully.
     - Wash that corner of the house with water mixed with rock salt, a drop of Gomutra or sacred Ganga-jala to clear any stagnant energies.
     - Light a pure cow-ghee lamp in that direction and pray to the Kuladevata (ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ).
     - Sprinkle Tulasi teertha and recite Sri Vishnu Sahasranama or Om Namo Narayanaya.
     - Assure them that divine light in the house removes all negativity and brings auspicious peace.`;
      break;

    case "DAILY_TRIP_TRAVEL":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR DAILY TRIP & TRAVEL (GOING ON A TRIP TOMORROW):
The devotee is planning an immediate trip or journey tomorrow and asking what to do:
- PRIEST PROTOCOL:
  1. Offer a warm fatherly blessing for safety, peace, and joyous travel.
  2. Practical Astrological Guidance:
     - Advise checking tomorrow's Rahu Kala (ರಾಹು ಕಾಲ) and avoiding starting the journey during that specific inauspicious window.
     - Before embarking or starting the vehicle, advise offering a mental prayer or coconut to Lord Mahaganapati and Kuladevata for obstacle-free travel (ನಿರ್ವಿಘ್ನ ಪ್ರಯಾಣ).
     - Step out of the house with the right foot (ಶುಭ ಪಾದ).
     - Advise driving with patience, avoiding haste or road anger, and maintaining calm focus.`;
      break;

    case "INTERPERSONAL_CONFLICT":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR INTERPERSONAL CONFLICT & FIGHTS (QUARREL WITH SOMEONE):
The devotee has had a heated fight or argument with someone and asks what they should do:
- PRIEST PROTOCOL:
  1. Soothe their agitated heart with deep Vedic wisdom on anger and patience.
  2. Explain that sudden heated clashes are often triggered by transient malefic influences of Mars (Kuja - anger) or Mercury (Budha - sharp words).
  3. Fatherly Counsel: "ಕ್ರೋಧವು ಮನುಷ್ಯನ ವಿವೇಕವನ್ನು ನಾಶಮಾಡುತ್ತದೆ (Anger destroys intellect)."
  4. Advise them NOT to react impulsively or escalate the conflict while tempers are blazing. Give it 24 to 48 hours for emotions to cool down.
  5. Advise choosing the high road of Dharma, calmness (ಶಾಂತಿ), and if there was a misunderstanding, addressing it later with dignified firmness and composure.`;
      break;

    case "LIFE_OVERVIEW_EXISTENTIAL":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR GENERAL LIFE OVERVIEW ("WHAT IS HAPPENING IN MY LIFE NOW?"):
The devotee asks broadly about what is currently happening in their life:
- PRIEST PROTOCOL:
  1. Provide a holistic, compassionate Vedic synthesis connecting their Janma Lagna (${lagnaName}), Moon Sign (${moonRashi}), and running Dasha-Bhukti (${currentDashaText}).
  2. Explain that life flows in celestial cycles: periods of hard work and churning (ಮಂಥನ) are necessary precursors to clarity and fruition (ಅಮೃತ).
  3. Offer clear reassurance and practical guidance on staying patient, maintaining daily sadhana, and trusting divine timing.`;
      break;

    case "CONVERSATIONAL_GREETING":
    default:
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR GREETING & GENERAL BLESSING:
- Offer the radiant blessings of Lord Mahabaleshwara and Lord Ganapati of Gokarna.
- Ask about their well-being and warmly invite them to share whatever life question, doubt, or dilemma they have brought today.`;
      break;
  }

  return `You are the revered Senior Head Astrologer & Chief Priest of Sri Baggona Panchanga Jyotishya Sansthana, Sri Kshetra Gokarna (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮುಖ್ಯ ದೈವಜ್ಞರು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ), endowed with over 50 years of tapasya, Vedic wisdom, and pastoral spiritual guidance.
The devotee is sitting right across from you face-to-face in the sacred sanctum of Gokarna for a private 20-minute spiritual conversation.

DEVOTEE PROFILE & SENSED CONTEXT:
- Name: ${session.name}
- Age: ${sensed.ageYears} years (${sensed.lifeStage})
- Native Place: ${session.place}
- Janma Lagna: ${lagnaName} Lagna
- Janma Rashi (Moon Sign): ${moonRashi}
- Janma Nakshatra: ${nakshatra} (Pada ${pada})
- Current Running Dasha-Bhukti: ${currentDashaText}
- Sensed Question Category: ${sensed.categoryLabel}

DEVOTEE WORDS / QUESTION:
"${userQuestion}"

${categorySpecificInstructions}

SACRED BEHAVIORAL PROTOCOL (THE 50+ YEAR EXPERIENCED GOKARNA MASTER PRIEST - "DAIVA VACHANA"):
1. PERSONA & TONE:
   - Deeply fatherly, compassionate, dignified, wise, and comforting.
   - Absolutely NEVER harsh, never sarcastic, never dismissive, never robotic ("I am an AI").
   - Respond as an authentic, living priest sitting directly with this devotee in Gokarna.
2. SACRED INSTITUTION:
   - Anchor your guidance in the traditions of Sri Baggona Panchanga (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ) and Sri Kshetra Gokarna (ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ).
3. LANGUAGE REQUIREMENT:
   - You MUST respond 100% EXCLUSIVELY in the ${targetLang} language using its native script.
   - Absolutely NO Latin transliteration or mixed English words in Indian languages.
4. TEXT-TO-SPEECH DELIVERY:
   - Do NOT use markdown symbols like * or # as this text will be read aloud by the priest neural voice engine. Provide clean, flowing spoken paragraphs.
5. ONGOING CONVERSATION FLOW (NO REPEATED GREETINGS):
   - The opening welcome and introduction ("ನಮಸ್ಕಾರ... ನಾನು ಶ್ರೀರಾಮ್ ಪಂಡಿತ್...") have ALREADY been delivered at the start of this 20-minute consultation.
   - Therefore, do NOT repeat greetings like "ನಮಸ್ಕಾರ...", "Hello", "Welcome", or re-introduce yourself.
   - Directly, respectfully, and compassionately answer this specific question as an ongoing, continuous face-to-face dialogue.`;
}

/**
 * Specialized deterministic fallback replies for each category in all 7 languages.
 * Guarantees high-quality, authentic responses even without an active Gemini API key.
 */
function generateSpecializedFallbackReply(params: {
  session: ConsultationSession;
  userQuestion: string;
  sensed: SensedDevoteeContext;
  lagnaName: string;
  moonRashi: string;
  nakshatra: string;
  currentDashaText: string;
}): string {
  const { session, sensed, lagnaName, moonRashi, currentDashaText } = params;
  const isEn = session.language === "en";

  switch (sensed.category) {
    case "SECRET_INTIMATE_TABOO":
      switch (session.language) {
        case "en":
          return `Namaste ${session.name}. Speaking as a senior Vedic priest in the sacred sanctum of Sri Kshetra Gokarna, I receive your intimate, secret question with utmost confidentiality, fatherly compassion, and profound Vedic understanding.\n\nIn Vedic Jyotisha, human desire (Kama) and intimate physical energies are acknowledged as natural celestial currents rather than something to be judged with shame. In your horoscope, Venus (Shukra) governs love, sexual vitality, and physical attraction, while Rahu creates intense fascination, secret attachments, and taboo illusions. The interplay of your 7th House (partnerships), 8th House (confidential secrets and vitality), and 12th House (bedroom pleasures and guilt) governs these deep private stirrings.\n\nDo not torment your mind with self-hatred, but let wisdom (Viveka) guide your conduct. Remember that clandestine or forbidden affairs may feel thrilling initially, but their karmic repercussion invariably brings mental unrest and loss of honor. If your question relates to physical vitality or intimacy anxieties, know that Shukra dhatu is naturally restored through a sattvic diet, Pranayama, and healthy lifestyle habits.\n\nTo balance these planetary currents and regain serene clarity, offering a Rudrabhisheka to Lord Mahabaleshwara at Sri Kshetra Gokarna and chanting the sacred Shiva Panchakshari ('Om Namah Shivaya') or Gayatri Mantra daily will bring tranquility and divine grace.`;
        case "hi":
          return `नमस्कार ${session.name} जी। श्री क्षेत्र गोकर्ण के पवित्र सान्निध्य में एक वरिष्ठ दैवज्ञ के रूप में, मैं आपके इस अत्यंत गुप्त और अंतरंग प्रश्न को पूर्ण गोपनीयता और वात्सल्य के साथ स्वीकार करता हूँ।\n\nवैदिक ज्योतिष शास्त्र में काम (Kama) और शारीरिक आकर्षण को पाप मानकर नकारा नहीं गया है, बल्कि इसके ग्रहीय कारणों का गहन विश्लेषण किया गया है। कुंडली में शुक्र (Venus) प्रेम, सौंदर्य और शारीरिक वीर्य/ऊर्जा का कारक है, जबकि राहु (Rahu) तीव्र आकर्षण, गुप्त संबंध और कामुक भ्रम उत्पन्न करता है। आपकी कुंडली के सप्तम (कलत्र), अष्टम (गुप्त स्थान) और द्वादश (शयन सुख) भावों के प्रभाव से मन में ऐसे गुप्त विचार और भावनाएं जागृत होती हैं।\n\nअत्यधिक अपराधबोध में न डूबें, किंतु धर्म की मर्यादा कभी न भूलें। अनैतिक या गुप्त संबंध क्षणिक सुख देते हैं, परंतु अंत में अष्टम भाव के प्रभाव से अपयश और अशांति लाते हैं। यदि शारीरिक दुर्बलता या यौन चिंता का विषय है, तो सात्विक आहार और प्राणायाम से शुक्र धातु को पुष्ट करें।\n\nगोकर्ण के महाबलेश्वर स्वामी को रुद्राभिषेक कराने तथा नित्य 'ॐ नमः शिवाय' या गायत्री मंत्र का जप करने से मानसिक काम-वेग शांत होता है और अंतर्मन को शांति प्राप्त होती है।`;
        case "te":
          return `నమస్కారం ${session.name} గారూ. శ్రీ క్షేత్ర గోకర్ణ పవిత్ర సన్నిధిలో ఒక అనుభవజ్ఞుడైన పురోహితుడిగా, మీ అంతరంగిక రహస్య ప్రశ్నను అత్యంత గోప్యంగా మరియు వాత్సల్యంతో స్వీకరిస్తున్నాను.\n\nవైదిక జ్యోతిష శాస్త్రంలో సహజమైన కోరికలు (కామము) మరియు శారీరక ఆకర్షణలను కేవలం తప్పుగా చూడకుండా, వాటికి కారణమైన గ్రహ స్థితులను విశ్లేషించారు. జాతకంలో శుక్రుడు (Venus) ప్రేమ, ఆకర్షణ మరియు వీర్య శక్తికి కారకుడు కాగా, రాహువు (Rahu) రహస్య ఆకర్షణలు మరియు భ్రమలను కలుగజేస్తాడు. మీ సప్తమ, అష్టమ మరియు ద్వాదశ (శయన సుఖ) భావాల కలయిక వల్ల ఇటువంటి రహస్య ఆలోచనలు ఏర్పడతాయి.\n\nఅపరాధ భావంతో కృంగిపోకండి, కానీ ధర్మ మార్గాన్ని దాటకండి. రహస్య సంబంధాలు ప్రారంభంలో ఆనందాన్ని ఇచ్చినా, చివరకు అపకీర్తికి దారితీస్తాయి. శారీరక లోపాలు లేదా లైంగిక ఆందోళనలు ఉంటే, సాత్విక ఆహారం మరియు ప్రాణాయామం ద్వారా శుక్ర ధాతువును పటిష్టం చేసుకోండి.\n\nగోకర్ణ మహాబలేశ్వర స్వామికి రుద్రాభిషేకం చేయడం మరియు నిత్యం 'ఓం నమః శివాయ' జపించడం వల్ల మానసిక కామోద్రేకాలు శమించి సకల శాంతి కలుగుతుంది.`;
        case "ta":
          return `வணக்கம் ${session.name} அவர்களே. ஸ்ரீ க்ஷேத்ர கோகர்ணத்தின் புனித சந்நிதானத்தில் ஒரு மூத்த ஜோதிடராக, உங்கள் அந்தரங்க இரகசியக் கேள்வியை மிகுந்த கனிவோடும் இரகசியத்தோடும் அணுகுகிறேன்.\n\nவேத ஜோதிடத்தில் மனித இயல்பான ஆசைகளும் (காமம்) உடலின் ஈர்ப்புகளும் கிரக நிலைகளின் வழியே விளக்கப்படுகின்றன. ஜாதகத்தில் சுக்கிரன் (Venus) காதல், அழகு மற்றும் உடல் சக்திக்கு அதிபதியாகவும், ராகு (Rahu) அதீத மோகம் மற்றும் இரகசிய ஈர்ப்புகளுக்குக் காரணமாகவும் அமைகிறார்கள். உங்கள் 7ஆம் (களத்திரம்), 8ஆம் (மறைவு ஸ்தானம்), மற்றும் 12ஆம் (சயன சுகம்) பாவங்களின் சேர்க்கையால் இதுபோன்ற உணர்வுகள் எழுகின்றன.\n\nகுற்ற உணர்ச்சியால் துவளாதீர்கள், ஆனால் தர்ம நெறியைக் கைவிடாதீர்கள். இரகசிய அல்லது முறையற்ற உறவுகள் இறுதியில் அவப்பெயரையும் நிம்மதியின்மையையும் தரும். உடல் நலக் குறைபாடுகள் இருந்தால், சாத்விக உணவு மற்றும் யோகப் பயிற்சிகள் மூலம் சுக்கிர பலத்தைப் பெறுங்கள்.\n\nகோகர்ண மகாபலேஸ்வர சுவாமிக்கு ருத்ராபிஷேகம் செய்து, தினமும் 'ஓம் நம சிவாய' அல்லது காயத்ரி மந்திரத்தை ஜபிப்பது மனதை அமைதிப்படுத்தி நல்வாழ்வை அருளும்.`;
        case "ml":
          return `നമസ്കാരം ${session.name}. ശ്രീ ക്ഷേത്ര ഗോകർണ്ണത്തിന്റെ പുണ്യസന്നിധിയിൽ വെച്ച് ഒരു മുതിർന്ന ജ്യോത്സ്യനായി നിങ്ങളുടെ ഈ രഹസ്യ ചോദ്യത്തെ അതീവ രഹസ്യമായും വാത്സല്യത്തോടും സ്വീകരിക്കുന്നു.\n\nവേദ ജ്യോതിഷത്തിൽ മനുഷ്യസഹജമായ കാമത്തെയും ആകർഷണങ്ങളെയും ഗ്രഹനിലകളുടെ പശ്ചാത്തലത്തിൽ വിശദീകരിക്കുന്നുണ്ട്. ശുക്രൻ പ്രണയത്തിന്റെയും ലൈംഗിക ഊർജ്ജത്തിന്റെയും കാരകനാണ്; രാഹുവാകട്ടെ കടുത്ത മോഹങ്ങളും അവിഹിതമായ ആകർഷണങ്ങളും സൃഷ്ടിക്കുന്നു. ഏഴാം, എട്ടാം, പന്ത്രണ്ടാം (ശയന സുഖം) ഭാവങ്ങളുടെ സ്വാധീനമാണ് ഇത്തരം ചിന്തകൾക്ക് പിന്നിൽ.\n\nകുറ്റബോധത്താൽ തളരരുത്, എന്നാൽ ധർമ്മം കൈവിടാതിരിക്കുക. രഹസ്യ ബന്ധങ്ങൾ ഒടുവിൽ മനഃസമാധാനക്കേടിലേക്കും അപമാനത്തിലേക്കും വഴിതുറക്കും. ശാരീരിക ബലഹീനതകൾ ഉണ്ടെങ്കിൽ സാത്വിക ഭക്ഷണവും യോഗയും വഴി ശുക്രധാതുവിനെ ശുദ്ധീകരിക്കുക.\n\nഗോകർണ്ണ മഹാബലേശ്വര സ്വാമിക്ക് രുദ്രാഭിഷേകം നടത്തുകയും നിത്യവും 'ഓം നമഃ ശിവായ' ജപിക്കുകയും ചെയ്യുന്നത് മനസ്സിനെ ശുദ്ധീകരിക്കുകയും ശാന്തി നൽകുകയും ചെയ്യും.`;
        case "mr":
          return `नमस्कार ${session.name} जी. श्री क्षेत्र गोकर्णच्या पवित्र सान्निध्यात एक ज्येष्ठ दैवज्ञ म्हणून मी तुमच्या या अतिशय गुप्त व वैयक्तिक प्रश्नाचा पूर्ण गोपनीयतेने व वात्सल्याने स्वीकार करतो.\n\nवैदिक ज्योतिषात माणसाच्या नैसर्गिक कामवासनांना पाप न मानता त्यांच्या ग्रहांच्या प्रभावाचा सखोल विचार केला आहे. पत्रिकेत शुक्र (Venus) हा प्रेम, शारीरिक ऊर्जा व कामशक्तीचा कारक आहे, तर राहू (Rahu) अनावर आकर्षण, गुप्त संबंध व कामुक भ्रम निर्माण करतो. तुमच्या पत्रिकेतील सप्तम (कलत्र), अष्टम (गुप्त स्थान) व द्वादश (शयन सुख) भावांमुळे अशा प्रकारच्या गुप्त भावना जागृत होतात.\n\nअति अपराधीपणाची भावना मनात ठेवू नका, परंतु धर्माची मर्यादा कधीही ओलांडू नका. अनैतिक संबंध क्षणिक आकर्षण देतात, परंतु नंतर अष्टम भावाच्या प्रभावामुळे अपयश व मानसिक अशांती येते. शारीरिक चिंता असल्यास सात्त्विक आहार व प्राणायामाने शुक्र बलवान करा.\n\nगोकर्णच्या महाबळेश्वर महादेवाला रुद्राभिषेक केल्याने आणि नित्य 'ॐ नमः शिवाय' जप केल्याने मानसिक चंचलता शमून शांतता प्राप्त होते.`;
        case "kn":
        default:
          return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ, ನಿಮ್ಮ ಅಂತರಂಗದ ಈ ರಹಸ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಅತ್ಯಂತ ಗೌಪ್ಯವಾಗಿ ಹಾಗೂ ವಾತ್ಸಲ್ಯಪೂರ್ಣವಾಗಿ ಸ್ವೀಕರಿಸುತ್ತೇನೆ.\n\nವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಮಾನವ ಸಹಜವಾದ ಕಾಮನೆ (Kama) ಹಾಗೂ ದೈಹಿಕ ಆಕರ್ಷಣೆಗಳನ್ನು ಪಾಪವೆಂದು ನಿರಾಕರಿಸದೆ, ಅವುಗಳ ಗ್ರಹಸ್ಥಿತಿಯ ಮೂಲವನ್ನು ಸವಿಸ್ತಾರವಾಗಿ ವಿವರಿಸಲಾಗಿದೆ. ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ (Venus) ಗ್ರಹವು ಪ್ರೇಮ, ಸೌಂದರ್ಯ ಹಾಗೂ ಲೈಂಗಿಕ ಶಕ್ತಿಯ (ಶುಕ್ರ ಧಾತು) ಕಾರಕನಾಗಿದ್ದು, ರಾಹು (Rahu) ಗ್ರಹವು ತೀವ್ರವಾದ ಭ್ರಮೆ, ರಹಸ್ಯ ಆಕರ್ಷಣೆ ಹಾಗೂ ಅತಿಯಾದ ವ್ಯಾಮೋಹವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಾನೆ. ನಿಮ್ಮ ಜಾತಕದ ಸಪ್ತಮ (ಕಳತ್ರ), ಅಷ್ಟಮ (ಗುಪ್ತ ಸ್ಥಾನ) ಹಾಗೂ ದ್ವಾದಶ (ಶಯನ ಸುಖ) ಭಾವಗಳ ಸಂಯೋಗದಿಂದ ಇಂತಹ ತೀವ್ರ ರಹಸ್ಯ ಭಾವನೆಗಳು ಅಥವಾ ಗೊಂದಲಗಳು ಉಂಟಾಗುತ್ತವೆ.\n\nಇಂತಹ ವಿಷಯಗಳಲ್ಲಿ ಅತಿಯಾದ ಅಪರಾಧಿ ಭಾವನೆಯಿಂದ ಕುಗ್ಗಬೇಡಿ; ಆದರೆ ಧರ್ಮದ ಗೆರೆಯನ್ನು ಎಂದಿಗೂ ದಾಟಬೇಡಿ. ರಹಸ್ಯ ಅಥವಾ ಅನೈತಿಕ ಸಂಬಂಧಗಳು ಆರಂಭದಲ್ಲಿ ಆಕರ್ಷಕವಾಗಿ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಅಷ್ಟಮ ಭಾವದ ಪ್ರಭಾವದಿಂದ ಕೀರ್ತಿಭಂಗ ಹಾಗೂ ಮಾನಸಿಕ ಅಶಾಂತಿಗೆ ಕಾರಣವಾಗುತ್ತವೆ. ದೈಹಿಕ ದೌರ್ಬಲ್ಯ ಅಥವಾ ಲೈಂಗಿಕ ಚಿಂತೆಗಳಿದ್ದರೆ, ಸಾತ್ವಿಕ ಆಹಾರ, ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಆಯುರ್ವೇದ ಪದ್ಧತಿಯಿಂದ ಶುಕ್ರ ಧಾತುವನ್ನು ಬಲಪಡಿಸಿಕೊಳ್ಳಿ.\n\nಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಹಾಗೂ ಪ್ರತಿದಿನ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸುವುದರಿಂದ ಮನಸ್ಸಿನ ಕಾಮಾಗ್ನಿಯು ಶಮನವಾಗಿ, ಸಕಲ ಶುಭ ಹಾಗೂ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.`;
      }

    case "SILLY_TROLLING_MOCKERY":
      switch (session.language) {
        case "en":
          return `Dear devotee, this sacred 20-minute consultation room of Sri Kshetra Gokarna is consecrated exclusively for authentic Vedic horoscope analysis, genuine life dilemmas, and spiritual counsel.\n\nFrivolous, fictional, comedic, or mocking inquiries have no place in Vedic Shastra and will not be entertained.\n\nPlease do not squander this precious consultation time; kindly ask sincere questions regarding your real life, family, career, health, or spiritual welfare.`;
        case "hi":
          return `प्रिय भक्त, श्री क्षेत्र गोकर्ण का यह पवित्र 20 मिनट का परामर्श समय आपके वास्तविक जीवन की समस्याओं, कुंडली, भविष्य और आध्यात्मिक मार्गदर्शन के लिए समर्पित है।\n\nकाल्पनिक पात्रों, हास्यास्पद, व्यंग्यात्मक या अर्थहीन प्रश्नों के लिए वैदिक शास्त्र में कोई स्थान नहीं है और न ही इनका उत्तर दिया जाएगा।\n\nकृपया इस अमूल्य समय को व्यर्थ न करें और अपने वास्तविक जीवन, परिवार, आजीविका, स्वास्थ्य अथवा आध्यात्मिक कल्याण से संबंधित गंभीर एवं सार्थक प्रश्न पूछें।`;
        case "te":
          return `ప్రియ భక్తుడా, శ్రీ క్షేత్ర గోకర్ణ యొక్క ఈ పవిత్ర 20 నిమిషాల సంభాషణ సమయం మీ వాస్తవ జీవిత సమస్యలు, జాతకం, భవిష్యత్తు మరియు ఆధ్యాత్మిక మార్గదర్శనం కోసం కేటాయించబడింది.\n\nకాల్పనిక పాత్రలు, పరిహాసాలు లేదా అర్థం లేని ప్రశ్నలకు వైదిక శాస్త్రంలో ఎటువంటి తావు లేదు, వీటికి సమాధానం ఇవ్వబడదు.\n\nదయచేసి ఈ విలువైన సమయాన్ని వృధా చేయకుండా, మీ జీవితం, కుటుంబం, ఆరోగ్యం లేదా ఉద్యోగానికి సంబంధించిన వాస్తవిక ప్రశ్నలను అడగండి.`;
        case "ta":
          return `அன்பான பக்தரே, ஸ்ரீ க்ஷேத்ர கோகர்ணத்தின் இந்த 20 நிமிட கலந்தாய்வு நேரம் உங்கள் உண்மையான வாழ்க்கைச் சிக்கல்கள், ஜாதகம் மற்றும் ஆன்மீக வழிகாட்டலுக்கு மட்டுமே உரியது.\n\nகற்பனைக் கதைகள், நகைச்சுவை அல்லது அர்த்தமற்ற கேலி கேள்விகளுக்கு வேத சாஸ்திரத்தில் எந்த இடமும் இல்லை, இவற்றுக்கு விடை அளிக்கப்படாது.\n\nதயவுசெய்து இந்த விலைமதிப்பற்ற நேரத்தை வீணடிக்காமல், உங்கள் வாழ்க்கை, குடும்பம், தொழில் அல்லது ஆரோக்கியம் சார்ந்த பயனுள்ள கேள்விகளைக் கேளுங்கள்.`;
        case "ml":
          return `പ്രിയ ഭക്തരേ, ശ്രീ ക്ഷേത്ര ഗോകർണ്ണത്തിലെ ഈ 20 മിനിറ്റ് പുണ്യ സമാലോചനാ സമയം നിങ്ങളുടെ ജീവിത പ്രശ്നങ്ങൾ, ജാതകം, ഭാവി എന്നിവയ്ക്കുള്ള ആധികാരിക മാർഗ്ഗദർശനത്തിനായുള്ളതാണ്.\n\nഅർത്ഥശൂന്യമായ ചോദ്യങ്ങൾക്കോ സാങ്കൽപ്പിക കഥാപാത്രങ്ങൾക്കോ പരിഹാസങ്ങൾക്കോ വേദശാസ്ത്രത്തിൽ മറുപടിയില്ല.\n\nദയവായി ഈ വിലപ്പെട്ട സമയം പാഴാക്കാതെ നിങ്ങളുടെ കുടുംബം, കരിയർ, ആരോഗ്യം എന്നിവയെക്കുറിച്ചുള്ള ആത്മാർത്ഥമായ ചോദ്യങ്ങൾ ചോദിക്കുക.`;
        case "mr":
          return `प्रिय भक्ता, श्री क्षेत्र गोकर्णचा हा पवित्र 20 मिनिटांचा सल्ला मसलतीचा वेळ तुमच्या जीवनातील वास्तव समस्या, कुंडली व अध्यात्मिक मार्गदर्शनासाठी राखीव आहे.\n\nकाल्पनिक पात्रांवर आधारित, उपहासात्मक किंवा निरर्थक प्रश्नांना वैदिक शास्त्रात कोणतेही स्थान नाही व त्यांचे उत्तर दिले जाणार नाही.\n\nकृपया हा मौल्यवान वेळ वाया न घालवता आपले कुटुंब, नोकरी, आरोग्य किंवा जीवनातील महत्त्वाच्या विषयांवर प्रामाणिकपणे प्रश्न विचारा.`;
        case "kn":
        default:
          return `ಭಕ್ತರೇ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಈ ಪವಿತ್ರ ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನಾ ಕೊಠಡಿಯು ಭಕ್ತರ ನೈಜ ಜೀವನದ ಸಮಸ್ಯೆಗಳು, ಜಾತಕ, ಭವಿಷ್ಯ ಹಾಗೂ ಧಾರ್ಮಿಕ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ ಮುಡಿಪಾಗಿದೆ.\n\nಇಂತಹ ಕಟ್ಟುಕತೆ, ಚಲನಚಿತ್ರದ ಪಾತ್ರಗಳು, ಹಾಸ್ಯಾಸ್ಪದ ಅಥವಾ ಅರ್ಥಹೀನ ಪ್ರಶ್ನೆಗಳಿಗೆ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಯಾವುದೇ ಉತ್ತರವಿಲ್ಲ ಹಾಗೂ ಇವುಗಳಿಗೆ ಉತ್ತರ ನೀಡುವುದಿಲ್ಲ.\n\nದಯವಿಟ್ಟು ಈ ಅಮೂಲ್ಯವಾದ ಕಾಲಾವಕಾಶವನ್ನು ವ್ಯರ್ಥಮಾಡದೆ, ನಿಮ್ಮ ಜೀವನ, ಕುಟುಂಬ, ಆರೋಗ್ಯ, ವೃತ್ತಿ ಅಥವಾ ಆಧ್ಯಾತ್ಮಿಕ ಶ್ರೇಯಸ್ಸಿನ ಕುರಿತು ಸದ್ಭಾವನೆಯಿಂದ ಹಾಗೂ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.`;
      }

    case "CELEBRITY_FANTASY":
      if (isEn) {
        return `Namaste ${session.name}. Listening to your question with fatherly affection, let me guide you with gentle truth and Vedic wisdom.\n\nFirst, recognize the reality of this world: the celebrity or actress you speak of is already happily married, with her own established family and life journey. Spending your precious mental energy and youthful years pursuing unattainable daydreams will only bring disillusionment.\n\nLook closely at the accomplished, hardworking individuals who achieve great heights in life. If you wish to attract a high-stature and noble partner, you must first build exceptional character, work diligently, earn an honorable livelihood, and establish respect in society. Your birth chart (${lagnaName} Lagna) shows strong inner resilience. Channel your energy away from screen illusions into your real-world career and self-growth, and by divine grace, you will be blessed with a loving and virtuous life partner suited for your real life.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನಿಮ್ಮ ಮಾತನ್ನು ಕೇಳಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ, ವಾತ್ಸಲ್ಯದಿಂದ ನಿಮಗೆ ವಾಸ್ತವಿಕ ಮತ್ತು ಧರ್ಮದ ಮಾರ್ಗದರ್ಶನವನ್ನು ನೀಡುತ್ತೇನೆ.\n\nಮೊದಲನೆಯದಾಗಿ ಲೋಕದ ವಾಸ್ತವವನ್ನು ಗ್ರಹಿಸಿ: ನೀವು ಪ್ರಸ್ತಾಪಿಸಿದ ನಟಿ ಅಥವಾ ಸೆಲೆಬ್ರಿಟಿಯು ಈಗಾಗಲೇ ವಿವಾಹಿತರಾಗಿದ್ದು, ತಮ್ಮದೇ ಆದ ಕುಟುಂಬ, ಪತಿ ಮತ್ತು ಮಕ್ಕಳೊಂದಿಗೆ ಗೌರವಯುತ ಜೀವನ ನಡೆಸುತ್ತಿದ್ದಾರೆ. ಕೇವಲ ಕಲ್ಪನಾ ಲೋಕದಲ್ಲಿ ಸಮಯ ಮತ್ತು ಯೌವನವನ್ನು ಕಳೆಯುವುದರಿಂದ ಮಾನಸಿಕ ಗೊಂದಲಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆಯೇ ಹೊರತು ಯಾವುದೇ ಸಾರ್ಥಕತೆ ದೊರೆಯುವುದಿಲ್ಲ.\n\nಅಂತಹ ಉನ್ನತ ಸ್ಥಾನದಲ್ಲಿರುವ ವ್ಯಕ್ತಿಗಳನ್ನು ವಿವಾಹವಾದ ಸಾಧಕರನ್ನು ಗಮನಿಸಿ. ಅವರು ಸತತ ಪರಿಶ್ರಮ, ಉನ್ನತ ಸಾಧನೆ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಗೌರವಯುತ ಸ್ಥಾನವನ್ನು ಗಳಿಸಿರುತ್ತಾರೆ. ನೀವೂ ಸಹ ನಿಮ್ಮ ${lagnaName} ಲಗ್ನದ ಬಲವನ್ನು ಸದ್ವಿನಿಯೋಗಪಡಿಸಿಕೊಂಡು, ಕಲ್ಪನೆಗಳಿಂದ ಹೊರಬಂದು ನಿಮ್ಮ ವೃತ್ತಿ ಮತ್ತು ಜೀವನದಲ್ಲಿ ಶ್ರಮಿಸಿ, ಉತ್ತಮ ಆದಾಯ ಹಾಗೂ ಸಂಸ್ಕಾರವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ. ಆಗ ನಿಮ್ಮ ಜಾತಕದ ಸಪ್ತಮ ಭಾವದ ಅನುಗ್ರಹದಿಂದ, ನಿಮ್ಮ ಬದುಕಿಗೆ ಸರಿಹೊಂದುವಂತಹ ಸದ್ಗುಣ ಸಂಪನ್ನೆಯಾದ ಬಾಳಸಂಗಾತಿಯು ಖಂಡಿತವಾಗಿಯೂ ದೊರೆಯಲಿದ್ದಾರೆ.`;

    case "PROVOCATIVE_TABOO":
      if (isEn) {
        return `Hari Om ${session.name}. As a senior priest speaking to you in this sacred sanctum of Sri Kshetra Gokarna, I receive your words with calm compassion and spiritual concern.\n\nHuman birth is a sacred gift endowed with intellect and divine purpose. Chasing transient lustful illusions, adult distractions, and degrading desires pollutes the mind, drains vital vitality, and weakens your self-esteem and future destiny.\n\nTrue happiness, self-respect, and lasting peace come from purity of thought, noble conduct, and building an honorable life worthy of your family's pride. Practice self-discipline and step away from unhealthy digital habits. Reciting the sacred Gayatri Mantra or chanting Om Namah Shivaya daily will purify the mind and awaken divine clarity.`;
      }
      return `ಹರಿ ಓಂ ${session.name} ಅವರೇ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ, ನಿಮ್ಮ ಮಾತನ್ನು ಶಾಂತ ಚಿತ್ತದಿಂದ ಆಲಿಸಿ ನಿಮಗೆ ಸನ್ಮಾರ್ಗದ ವಿವೇಕವನ್ನು ಹೇಳುತ್ತೇನೆ.\n\nಮಾನವ ಜನ್ಮವು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದದ್ದು. ಅಸ್ಥಿರವಾದ ಕಾಮನೆಗಳು, ಅಶ್ಲೀಲ ಕಲ್ಪನೆಗಳು ಹಾಗೂ ಕೆಟ್ಟ ವ್ಯಾಮೋಹಗಳ ಬೆನ್ನತ್ತಿ ಹೋಗುವುದರಿಂದ ಮನಸ್ಸು ಕಲುಷಿತಗೊಂಡು, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ಭವಿಷ್ಯದ ಶ್ರೇಯಸ್ಸು ಕುಂಠಿತವಾಗುತ್ತದೆ.\n\nನಿಜವಾದ ಸುಖ ಮತ್ತು ಶಾಂತಿಯು ಇಂದ್ರಿಯ ನಿಗ್ರಹ, ಸದ್ಗುಣ ಹಾಗೂ ಗೌರವಯುತ ಜೀವನದಲ್ಲಿದೆ. ಕ್ಷಣಿಕ ಭ್ರಮೆಗಳಿಂದ ದೂರವಾಗಿ, ನಿಮ್ಮ ತಂದೆ-ತಾಯಿಯರಿಗೆ ಹಾಗೂ ಸಮಾಜಕ್ಕೆ ಕೀರ್ತಿ ತರುವಂತಹ ಸತ್ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿಕೊಳ್ಳಿ. ಪ್ರತಿದಿನ ಓಂ ನಮಃ ಶಿವಾಯ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಪಠಿಸುವುದರಿಂದ ಮನಸ್ಸಿನ ಚಂಚಲತೆ ಶಮನವಾಗಿ, ಸಕಲ ಸನ್ಮಂಗಳ ಉಂಟಾಗುತ್ತದೆ.`;

    case "DOMESTIC_OMEN_VASTU":
      if (isEn) {
        return `Namaste ${session.name}. You need not harbor any fear, anxiety, or superstitious panic regarding finding an old vessel or item in the corner of your home.\n\nAccording to Vedic Vastu and Nimitta Shastra, corners of a house—particularly the North-East (Ishanya) and South-West (Nairutya)—are vital energy intersections. Metallic vessels, especially copper or brass, naturally ground electromagnetic and elemental vibrations.\n\nTo ensure positive energy and peace: clean the vessel respectfully with water and lemon. Wash the corner with water mixed with rock salt or sacred Ganga-jala to dispel any stagnant energies. Light a pure cow-ghee lamp in that direction, sprinkle Tulasi water, and offer prayers to your Kuladevata. This will invite Goddess Mahalakshmi's grace and maintain harmony in your household.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಅಥವಾ ಮೂಲೆಯಲ್ಲಿ ಹಳೆಯ ಪಾತ್ರೆ ಸಿಕ್ಕಿದ ವಿಚಾರದಲ್ಲಿ ಯಾವುದೇ ರೀತಿಯ ಅಂಜಿಕೆ, ಭಯ ಅಥವಾ ಮೂಢನಂಬಿಕೆಗಳಿಗೆ ಒಳಗಾಗುವ ಅಗತ್ಯವಿಲ್ಲ.\n\nವೈದಿಕ ವಾಸ್ತು ಮತ್ತು ನಿಮಿತ್ತ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಮನೆಯ ಮೂಲೆಗಳು (ವಿಶೇಷವಾಗಿ ಈಶಾನ್ಯ ಹಾಗೂ ನೈಋತ್ಯ ದಿಕ್ಕುಗಳು) ಪಂಚಭೂತಗಳ ಶಕ್ತಿಯ ಸಂಗಮ ಸ್ಥಾನಗಳಾಗಿವೆ. ತಾಮ್ರ ಅಥವಾ ಹಿತ್ತಾಳೆಯಂತಹ ಪ್ರಾಚೀನ ಲೋಹದ ಪಾತ್ರೆಗಳು ನೈಸರ್ಗಿಕವಾಗಿ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಳ್ಳುವ ಗುಣವನ್ನು ಹೊಂದಿರುತ್ತವೆ.\n\nಇದರ ಪರಿಹಾರ ಮತ್ತು ಶುದ್ಧತೆಗಾಗಿ: ಆ ಪಾತ್ರೆಯನ್ನು ಶುದ್ಧ ನೀರಿನಿಂದ ತೊಳೆದು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಆ ಮೂಲೆಯನ್ನು ಕಲ್ಲುಪ್ಪು ಬೆರೆಸಿದ ನೀರಿನಿಂದ ಅಥವಾ ಗಂಗಾಜಲದಿಂದ ಪ್ರೋಕ್ಷಿಸಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಆ ಜಾಗದಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪವನ್ನು ಹಚ್ಚಿ, ತುಳಸಿ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಇದರಿಂದ ಮನೆಯಲ್ಲಿ ಸಕಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ನಿವಾರಣೆಯಾಗಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ.`;

    case "DAILY_TRIP_TRAVEL":
      if (isEn) {
        return `Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna bless your upcoming journey with safety, joy, and divine protection.\n\nRegarding your travel plans tomorrow, our Vedic Panchanga recommends observing the daily Rahu Kala and avoiding starting the journey during that specific timeframe. Stepping out of your home with your right foot after a calm mental prayer ensures auspiciousness.\n\nBefore starting the vehicle or embarking on the road, break a coconut or offer sincere prayers to Lord Ganapati and your Kuladevata. Drive with disciplined patience, avoid impulsive rush, and your journey will be joyful and fruitful.`;
      }
      return `ಹರಿ ಓಂ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ನಾಳಿನ ಪ್ರವಾಸವು ಅತ್ಯಂತ ಸುಖಕರವೂ, ಕ್ಷೇಮಕರವೂ ಆಗಿರಲಿ ಎಂದು ಆಶೀರ್ವದಿಸುತ್ತೇನೆ.\n\nಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಾಳೆ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸುವ ಮುನ್ನ ಆ ದಿನದ ರಾಹು ಕಾಲವನ್ನು ಗಮನಿಸಿ, ರಾಹು ಕಾಲದ ಅವಧಿಯಲ್ಲಿ ಹೊಸ ಪ್ರಯಾಣವನ್ನು ಆರಂಭಿಸಬೇಡಿ. ಮನೆಯಿಂದ ಹೊರಡುವಾಗ ಶುಭ ಸಂಕಲ್ಪದೊಂದಿಗೆ ಬಲಗಾಲಿಟ್ಟು ಹೊರಡಿ.\n\nವಾಹನ ಚಲಾಯಿಸುವ ಮುನ್ನ ಅಥವಾ ಪ್ರಯಾಣದ ಆರಂಭದಲ್ಲಿ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಹಾಗೂ ಕುಲದೇವತೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಸ್ಮರಿಸಿ. ರಸ್ತೆಯಲ್ಲಿ ಯಾವುದೇ ಅತಿ ಆತುರ ಅಥವಾ ಆಕ್ರೋಶಕ್ಕೆ ಒಳಗಾಗದೆ ತಾಳ್ಮೆಯಿಂದ ಸಂಚರಿಸಿ; ದೈವಾನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಪ್ರವಾಸವು ಸಕಲ ಯಶಸ್ಸು ಮತ್ತು ಸಂತೋಷವನ್ನು ತರಲಿದೆ.`;

    case "INTERPERSONAL_CONFLICT":
      if (isEn) {
        return `Namaste ${session.name}. I understand your heart is disturbed due to this conflict. Let me offer you soothing Vedic counsel and astrological wisdom.\n\nIn astrology, sudden clashes and heated arguments are often triggered by the planetary transit of Mars (Kuja - anger) or Mercury (Budha - impulsive words). Anger is like a fire that scorches the container holding it before it reaches anyone else.\n\nDo not react impulsively or seek retaliation while emotions are raw. Allow a cooling-off period of 24 to 48 hours for the heated planetary energies to subside. Speak with dignified composure and patience when minds have cleared. Walking the noble path of Dharma and self-restraint will protect your peace and earn you lasting respect.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಜಗಳ ಅಥವಾ ಮನಸ್ತಾಪದಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಅಶಾಂತವಾಗಿರುವುದು ಸಹಜ. ಒಬ್ಬ ಹಿರಿಯ ಪುರೋಹಿತನಾಗಿ, ನಿಮ್ಮ ಶಾಂತಿಗಾಗಿ ಶಾಸ್ತ್ರದ ವಿವೇಕವನ್ನು ತಿಳಿಸುತ್ತೇನೆ.\n\nಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಕ್ಷಣಿಕ ಕೋಪ ಮತ್ತು ಜಗಳಗಳು ಜಾತಕದಲ್ಲಿ ಕುಜ (ಆಕ್ರೋಶ) ಮತ್ತು ಬುಧ (ತೀಕ್ಷ್ಣ ಮಾತು) ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುತ್ತವೆ. "ಕ್ರೋಧವು ಮನುಷ್ಯನ ವಿವೇಕವನ್ನು ನಾಶಮಾಡುತ್ತದೆ." ಕೋಪದಲ್ಲಿ ಆಡಿದ ಮಾತುಗಳು ಜೀವನಪರ್ಯಂತ ನೋವನ್ನುಂಟುಮಾಡಬಲ್ಲವು.\n\nಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಯಾವುದೇ ಆತುರದ ಪ್ರತೀಕಾರ ಅಥವಾ ವಾಗ್ವಾದಕ್ಕೆ ಹೋಗಬೇಡಿ. ಕನಿಷ್ಠ ೨೪ ರಿಂದ ೪೮ ಗಂಟೆಗಳ ಕಾಲ ಮೌನ ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ವಹಿಸಿ, ಪರಿಸ್ಥಿತಿ ಶಾಂತವಾಗಲು ಸಮಯ ಕೊಡಿ. ಮನಸ್ಸು ತಿಳಿಯಾದ ನಂತರ ಗೌರವಯುತವಾಗಿ, ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ಮಾತನಾಡಿ ಬಗೆಹರಿಸಿಕೊಳ್ಳಿ. ಶಾಂತಿಯೇ ನಿಮ್ಮ ದೊಡ್ಡ ಶಕ್ತಿ.`;

    case "LIFE_OVERVIEW_EXISTENTIAL":
      if (isEn) {
        return `Namaste ${session.name}. According to your birth chart calculated with Baggona Panchanga, you are guided by ${lagnaName} Lagna and ${moonRashi} Moon Sign, currently experiencing ${currentDashaText}.\n\nLife moves in celestial cycles of learning, perseverance, and triumph. If you are experiencing uncertainty right now, understand that this phase is meant to refine your inner strength and prepare you for a brighter chapter ahead.\n\nMaintain unwavering faith and discipline in your daily endeavors. Reciting the sacred Gayatri Mantra and offering humble prayers to Lord Mahabaleshwara will dissolve the prevailing clouds of confusion and reveal the right path forward.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagnaName} ಲಗ್ನ ಹಾಗೂ ${moonRashi} ರಾಶಿಯಲ್ಲಿ ಜನ್ಮತಾಳಿದ್ದು, ಪ್ರಸ್ತುತ ${currentDashaText} ಅವಧಿಯು ಚಾಲ್ತಿಯಲ್ಲಿದೆ.\n\nಜೀವನದಲ್ಲಿ ಪ್ರತಿಯೊಂದು ಕಾಲಘಟ್ಟವೂ ತನ್ನದೇ ಆದ ಮಂಥನ ಮತ್ತು ಅನುಭವಗಳನ್ನು ನೀಡುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಘಟನೆಗಳು ನಿಮ್ಮ ಧೈರ್ಯ ಮತ್ತು ಸಂಯಮವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದು, ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಶುಭ ಫಲಗಳಿಗೆ ದಾರಿಯಾಗಲಿವೆ.\n\nದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಧರ್ಮ, ಸತತ ಪ್ರಯತ್ನ ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಮತ್ತು ದೀಪಾರಾಧನೆಯಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸಕಲ ಗೊಂದಲಗಳು ನಿವಾರಣೆಯಾಗಿ, ಸಕಲ ಶುಭವಾಗಲಿದೆ.`;

    case "CONVERSATIONAL_GREETING":
    default:
      if (isEn) {
        return `Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna shower their divine grace and blessings upon you and your family.\n\nI am seated here with you in this sacred 20-minute consultation. Please feel at complete peace. You may open your heart and ask any question regarding your life, travel, family, career, or spiritual path.`;
      }
      return `ಹರಿ ಓಂ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಕಲ ಕೃಪಾಕಟಾಕ್ಷ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೇಲೆ ಸದಾ ಇರಲಿ.\n\nನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಕೊಠಡಿಯಲ್ಲಿ ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಯಾವುದೇ ಪ್ರಶ್ನೆ, ದೈನಂದಿನ ಗೊಂದಲ, ಪ್ರವಾಸ, ಕುಟುಂಬ ಅಥವಾ ಜಾತಕ ವಿಚಾರಗಳ ಕುರಿತು ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ.`;
  }
}
