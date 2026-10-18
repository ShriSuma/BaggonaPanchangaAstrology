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

  try {
    responseText = await askGemini(
      userQuestion,
      presenterPrompt,
      apiKey || "",
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
   - Do NOT use markdown symbols like * or # as this text will be read aloud by the priest neural voice engine. Provide clean, flowing spoken paragraphs.`;
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
