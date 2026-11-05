/**
 * Baggona Panchanga - Senior Priest Presenter & Intelligent Sensing Engine
 * (ಹಿರಿಯ ಪುರೋಹಿತ ಪ್ರೆಸೆಂಟರ್ ಹಾಗೂ ಪ್ರಶ್ನಾವಳಿ ಗ್ರಹಣ ಎಂಜಿನ್)
 *
 * Frontline Intelligent Layer for the 20-Minute Devotee Consultation:
 * 1. Senses Devotee Identity: Age, life-stage (youth/mid-career/senior), birth location, and emotional tone.
 * 2. Categorizes Devotee Questions intelligently into:
 *    - CAREER_FRUSTRATION_DISTRESS: Work/career/business frustration, irritation, roadblock, financial stress, why this is happening
 *    - EMOTIONAL_DISTRESS_LIFE: Heartbreak, deep sorrow, anxiety, depression, feeling lost, crying, mental suffering
 *    - GENERAL_KNOWLEDGE_WORLDLY: Science, geography, history, politics, sports, general knowledge, technology (Zero hallucination)
 *    - SILLY_TROLLING_MOCKERY: Superheroes, cartoons, comedy, jokes, alien food, testing AI (Answers wittily + fatherly warm pivot)
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
 *    - Answers general knowledge accurately and satisfyingly without hallucinating horoscope connections.
 *    - Answers silly/trolling queries with charming wit and details, then warmly invites genuine life discussion.
 *    - Comforts career/life frustration with deep emotional support and exact 10th house / Dasha / Gochara Shani clarity.
 *    - Purifies domestic fears with sacred Vedic rituals rather than blind superstition.
 * 4. Deterministic Multi-Language Fallbacks across all 7 languages (kn, en, hi, te, ta, ml, mr).
 */

import { type ConsultationSession, type ConsultationLanguage } from "./consultationTypes";
import {
  computeDevoteeKundli,
  generateConsultationAnswer,
  CONSULTATION_LANG_NAMES,
  deduplicateResponseText,
  type ConsultationReadingResult,
  NAVAGRAHA_GEMOLOGY_AND_UPARATNA_REFERENCE,
  MULTI_TURN_ANTI_CONTRADICTION_GUARD,
  SYSTEM_SECURITY_CONFIDENTIALITY_DIRECTIVE,
  detectSecurityOrSystemProbe,
  getDeterministicSecurityBlockedReply,
  formatRulingsLedgerForPrompt
} from "./consultationAIEngine";
import { askGemini, type AskGeminiChatTurn } from "../../core/GeminiEngine";
import { useAppStore } from "../../stores/appStore";

export type ConsultationQuestionCategory =
  | "SECURITY_SYSTEM_PROBE_BLOCKED"
  | "ABROAD_VS_INDIA_SETTLEMENT"
  | "PROPERTY_ASSET_ACQUISITION"
  | "GOVERNMENT_JOB_AUTHORITY"
  | "BUSINESS_VS_JOB_COMMERCE"
  | "DEBT_RELIEF_FINANCE"
  | "LEGAL_DISPUTE_VICTORY"
  | "HEALTH_VITALITY_HEALING"
  | "COMPETITIVE_EXAM_SUCCESS"
  | "CAREER_FRUSTRATION_DISTRESS"
  | "EMOTIONAL_DISTRESS_LIFE"
  | "CHILD_PARENT_INQUIRY"
  | "SANTHANA_PROGENY_SENSITIVE"
  | "GENERAL_KNOWLEDGE_WORLDLY"
  | "SILLY_TROLLING_MOCKERY"
  | "SECRET_INTIMATE_TABOO"
  | "CELEBRITY_FANTASY"
  | "PROVOCATIVE_TABOO"
  | "DOMESTIC_OMEN_VASTU"
  | "DAILY_TRIP_TRAVEL"
  | "INTERPERSONAL_CONFLICT"
  | "LIFE_OVERVIEW_EXISTENTIAL"
  | "CONVERSATIONAL_GREETING"
  | "ASTROLOGICAL_DEEP";

export interface SensedDevoteeContext {
  ageYears: number;
  lifeStage: "YOUTH" | "MID_CAREER" | "SENIOR";
  place: string;
  category: ConsultationQuestionCategory;
  categoryLabel: string;
  detectedTopicSnippet?: string;
  priestPersonaTone:
    | "compassionate_grounding"
    | "divine_oracle"
    | "gentle_wisdom"
    | "peaceful_counsel"
    | "erudite_scholar";
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

  // 1.5. Security & System Integrity Guard (Prompt Injection, DB Credentials, Admin Secrets, Payment Bypass)
  if (detectSecurityOrSystemProbe(q)) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "SECURITY_SYSTEM_PROBE_BLOCKED",
      categoryLabel: "ಪವಿತ್ರ ದೈವಜ್ಞ ಭದ್ರತಾ ಮಿತಿ (Sanctuary Security & Dharmic Boundary)",
      detectedTopicSnippet: "System / Security Probe Intercepted",
      priestPersonaTone: "divine_oracle"
    };
  }

  // 1.6. Abroad vs India Settlement / Foreign Settlement
  const isAbroadSettlement =
    /ವಿದೇಶ|ಪರದೇಶ|ವಿದೇಶ ವಾಸ|ವಿದೇಶ ಯೋಗ|ವಿದೇಶದಲ್ಲಿ ನೆಲೆಸ|ಇಂಡಿಯಾದಲ್ಲೇ ಇರಬೇಕಾ|ವಿದೇಶ ಉತ್ತಮವೋ|ಭಾರತ ಉತ್ತಮವೋ|ಅಮೆರಿಕ|ಕೆನಡಾ|ಜರ್ಮನಿ|ಯೂರೋಪ್|abroad|foreign|settle abroad|settle outside|settle in usa|settle in canada|settle in uk|settle in europe|settle in germany|foreign citizenship|pr visa|green card|stay in india|settled outside of india|foreign settlement|विदेश|विदेश योग|परदेस|विदेश में बसना|భారతదేశం|విదేశం|வெளிநாடு/i.test(
      q
    );

  if (isAbroadSettlement) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "ABROAD_VS_INDIA_SETTLEMENT",
      categoryLabel: "ವಿದೇಶ ಯೋಗ ಹಾಗೂ ಸ್ವದೇಶ ವಾಸ ವಿಶ್ಲೇಷಣೆ (Abroad Settlement vs Swadesha Guidance)",
      detectedTopicSnippet: "Abroad vs India Settlement",
      priestPersonaTone: "erudite_scholar"
    };
  }

  // 1.7. Property / Asset / Land / House Acquisition
  const isPropertyAsset =
    (/ಆಸ್ತಿ|ಜಮೀನು|ಭೂಮಿ|ನಿವೇಶನ|ಸೈಟ್|ಆಸ್ತಿ ಖರೀದಿ|ಮನೆ ಕಟ್ಟಿಸ|ಮನೆ ಕಟ್ಟು|ಸ್ವಂತ ಮನೆ|ಹೊಸ ಮನೆ|ಮನೆ ಖರೀದಿ|ಮನೆ ಯೋಗ|property|asset|real estate|land purchase|buy house|buy flat|buy land|own house|plot|construction|house yog|संपत्ति|जमीन|मकान खरीदना|घर खरीदना|घर बनाना|ప్లాಟ್|ఆస్తి|சொத்து|நிலம்/i.test(
      q
    ) ||
      (/\bಮನೆ\b|\bhouse\b|\bflat\b/i.test(q) && /ಖರೀದಿ|ಕಟ್ಟ|ತಗೊಳ್ಳ|buy|purchase|construct|own/i.test(q))) &&
    !/ಪಾತ್ರೆ|ಮೂಲೆ|ಮೂಲೆಯಲ್ಲಿ|ಶಕುನ|ನಿಮಿತ್ತ|vessel|corner/i.test(q);

  if (isPropertyAsset) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "PROPERTY_ASSET_ACQUISITION",
      categoryLabel: "ಸ್ಥಿರ ಆಸ್ತಿ ಹಾಗೂ ಗೃಹ ಯೋಗ ವಿಚಾರಣೆ (Property, Land & House Acquisition)",
      detectedTopicSnippet: "Property / Land / House Acquisition",
      priestPersonaTone: "peaceful_counsel"
    };
  }

  // 2. Short Conversational Greeting & Blessings
  const isGreeting =
    /^(ನಮಸ್ಕಾರ|ಹಲೋ|ಹೇಗಿದ್ದೀರಿ|ಗುರೂಜಿ|ಸ್ವಾಮಿ|hello|hi|namaste|how are you|pranam|namaskara)/i.test(
      q
    ) && q.split(/\s+/).length <= 8;

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

  // 3. Silly, Childish Trolling, Cartoon/Superhero, Aliens, Jokes, or Nonsense Gibberish
  const isSillyTrolling =
    // Fictional characters & superheroes
    /ಬ್ಯಾಟ್‌ಮ್ಯಾನ್|batman|ಸ್ಪೈಡರ್‌ಮ್ಯಾನ್|spiderman|spider-man|ಸೂಪರ್‌ಮ್ಯಾನ್|superman|ಶ್ರೆಕ್|shrek|ಡೊನಾಲ್ಡ್ ಡಕ್|donald duck|ಮಿಕ್ಕಿ ಮೌಸ್|mickey mouse|ಅಯರ್ನ್ ಮ್ಯಾನ್|iron man|ironman|ಹಲ್ಕ್|hulk|ಟಾಮ್ ಅಂಡ್ ಜೆರ್ರಿ|tom and jerry|ಅವೆಂಜರ್ಸ್|avengers|alien|ಏಲಿಯನ್|ಯುಎಫ್‌ಓ|ufo|ಮಂಗಳ ಗ್ರಹದಲ್ಲಿ ನೀರು|ಮಂಗಳ ಗ್ರಹದಲ್ಲಿ ಪಿಜ್ಜಾ|ಪಿಜ್ಜಾ|pizza|ಬರ್ಗರ್|burger|ಐಸ್‌ಕ್ರೀಮ್|ice cream/i.test(
      q
    ) ||
    // Jokes, comedy, laughter, comedy tests
    /funny joke|tell.*joke|jokes|chutkula|चुटकुला|ಮಜವಾದ ಜೋಕ್|ತಮಾಷೆ ಜೋಕ್|ಕಾಮಿಡಿ ಜೋಕ್|comedy|funny story|joke haha|lol|rofl|lmao|ಹಾಡು ಹೇಳು|ಡ್ಯಾನ್ಸ್ ಮಾಡು|make me laugh|who is better messi or ronaldo|can my dog talk|am i a robot|are you an ai|are you real|what is 2\+2|what color is an orange/i.test(
      q
    ) ||
    /tell me a joke|sing a song|sing me a song|say a joke|tell a joke|comedy ಹೇಳಿ|ಜೋಕ್ ಹೇಳಿ|ತಮಾಷೆ|ಕಾಮಿಡಿ/i.test(
      q
    ) ||
    // Repetitive character spam (e.g. "aaaaaaa", "zzzzzzzz")
    /(.)\1{5,}/.test(q) ||
    // Keyboard smash gibberish (e.g. "asdfghjklqwerty zxcvbnm")
    /asdfghjkl|qwerty|zxcvbnm/i.test(q) ||
    // Pure keyboard smash gibberish without spaces or vowels
    /^[bcdfghjklmnpqrstvwxyz]{6,}$/i.test(q) ||
    /^[asdfghjklqwertyuiopzxcvbnm]{10,}$/i.test(q);

  if (isSillyTrolling) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "SILLY_TROLLING_MOCKERY",
      categoryLabel: "ಹಾಸ್ಯ ಹಾಗೂ ವಿನೋದ ವಿಚಾರಣೆ (Playful Humorous Inquiry)",
      detectedTopicSnippet: "Silly / Playful / Humorous Query",
      priestPersonaTone: "gentle_wisdom"
    };
  }

  // 4. Minor Child Native (< 18 yrs) OR Parent Child Education/Health Inquiry
  const isChildParentInquiry =
    (ageYears < 18 ||
      (/ಮಗು|ಮಗುವಿನ|ಮಗನ|ಮಗಳ|ವಿದ್ಯಾಭ್ಯಾಸ|ಓದು|ಶಾಲೆ|ಏಕಾಗ್ರತೆ|ಬಾಲಾರಿಷ್ಟ|child|children|concentration|memory|board exam/i.test(
        q
      ) &&
        /ಆರೋಗ್ಯ|ವಿದ್ಯಾಭ್ಯಾಸ|ಓದು|ಶಾಲೆ|ಭವಿಷ್ಯ|health|education|study|school|future|exam|marks|concentration|memory/i.test(
          q
        ))) &&
    !/ಸಂತಾನ|conception|conceive|pregnancy|progeny|childbirth/i.test(q) &&
    !/ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ|competitive exam|entrance exam|ರ್ಯಾಂಕ್|rank|upsc|kpsc|ias|ips|ssc/i.test(q) &&
    !/affair|extramarital|cheating|secret|infidelity|adultery|ಅಕ್ರಮ ಸಂಬಂಧ|ವೇಶ್ಯ|sex|sexual|ಲೈಂಗಿಕ|ವಿಚ್ಛೇದನ|divorce/i.test(
      q
    );

  if (isChildParentInquiry) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "CHILD_PARENT_INQUIRY",
      categoryLabel: "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನ (Child Education & Parental Guidance)",
      detectedTopicSnippet: "Child Education / Parenting / Health",
      priestPersonaTone: "gentle_wisdom"
    };
  }

  // 5. Progeny, Santhana, Childbirth, Son / Daughter Desire
  const isSanthana =
    /ಸಂತಾನ|ಪುತ್ರ|ಗರ್ಭ|pregnancy|progeny|conception|conceive|son|daughter|ಮಕ್ಕಳಾಗುತ್ತಿಲ್ಲ|ಸಂತಾನ ವಿಳಂಬ|baby|infant|childbirth/i.test(
      q
    ) && !/ವಿದ್ಯಾಭ್ಯಾಸ|ಓದು|ಶಾಲೆ|ಪರೀಕ್ಷೆ|school|exam|study/i.test(q);

  if (isSanthana) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "SANTHANA_PROGENY_SENSITIVE",
      categoryLabel: "ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಪಂಚಮ ಭಾವ ವಿಚಾರಣೆ (Progeny & Santhana Blessings)",
      detectedTopicSnippet: "Progeny / Santhana Inquiry",
      priestPersonaTone: "compassionate_grounding"
    };
  }

  // 6. Secret, Intimate, Taboo, Extramarital, Bedroom Intimacy, Sex Work & Vitality Questions
  const isSexWork =
    /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|ಕತ್ತಲೆಯ ಬದುಕು|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|वेश्याव्यवसाय|देहविक्रय/i.test(
      q
    );

  const isSecretIntimateTaboo =
    isSexWork ||
    /ಅಕ್ರಮ ಸಂಬಂಧ|ಬೇರೊಬ್ಬರ ಮೇಲೆ ಆಕರ್ಷಣೆ|ರಹಸ್ಯ ಪ್ರೇಮ|ಬೇರೆ ಹೆಂಗಸು|ಬೇರೆ ಗಂಡಸು|ಪರಸ್ತ್ರೀ|ಪರಪುರುಷ|ಪರಸ್ತ್ರೀಯ|ಅನೈತಿಕ ಸಂಬಂಧ|extra[ -]?marital|affair|cheating|secret relationship|hidden relationship|secret love|forbidden love|infidelity|adultery|secret partner|hidden love|attracted to married|crush on married|secret lover|ರಹಸ್ಯ ಗೆಳೆಯ|ರಹಸ್ಯ ಗೆಳತಿ|ಗುಪ್ತ ಸಂಬಂಧ|गुप्त संबंध|अवैध संबंध|वासना|काಮುಕ|कामुकता|परस्त्री|दूसरे से संबंध|गुप्त प्रेम|व्यभिचार|गुप्त आकर्षण|गुप्त ಇಷ್ಟಾರ್ಥ|ರಹಸ್ಯ ಆಕರ್ಷಣೆ|ಗುಪ್ತ ಆಕರ್ಷಣೆ/i.test(
      q
    ) ||
    /ಸೆಕ್ಸ್|sex|ಕಾಮ|ಕಾಮನೆ|ಲೈಂಗಿಕ|ದೈಹಿಕ ಸುಖ|ವ್ಯಾಮೋಹ|ರಹಸ್ಯ ಕಾಮ|ಗುಪ್ತ ವಿಚಾರ|ಶಿಶ್ನ|ಯೋನಿ|ವೀರ್ಯ|ಸ್ಖಲನ|ಶೀಘ್ರಸ್ಖಲನ|ಹಸ್ತಮೈಥುನ|ಅಶ್ಲೀಲ|ಬೂತು|ಬೆತ್ತಲೆ|dirty question|intimacy|sexual|libido|erection|premature ejaculation|masturbation|bed pleasure|bedroom secret|physical desire|lust|private organ|intimate problem|sexual weakness|sexual power|intercourse|ಸಂಭೋಗ|हस्तमैथुन|यौन|ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ/i.test(
      q
    ) ||
    /ರಹಸ್ಯವಾಗಿ ಇಷ್ಟಪಡುತ್ತೇನೆ|ಯಾರಿಗೂ ಹೇಳೋಕೆ ಆಗ್ತಿಲ್ಲ|ಯಾರಿಗೂ ಹೇಳಲಾಗದ ರಹಸ್ಯ|ಮನಸ್ಸಿನಲ್ಲಿ ಕೆಟ್ಟ ಆಲೋಚನೆ|ಕೆಟ್ಟ ಕಾಮನೆ|can't tell anyone|private secret|dirty secret|guilty desire|taboo desire|secret crush|homosexual|gay|same sex|ಸಲಿಂಗಕಾಮಿ|ಸಲಿಂಗ ಪ್ರೇಮ|समलैंगिक|గే|dna test|paternity|not my child|biological father|ಇನ್ನೊಬ್ಬರ ಮಗು|ಡಿಎನ್‌ಎ|ಕಳ್ಳ ಸಂಬಂಧದ ಮಗು|gambling|betting|casino|online rummy|ಜುಗಾರ|ಜೂಜು|ಬೆಟ್ಟಿಂಗ್|ಕ್ಯಾಸಿನೊ|ಆನ್‌ಲೈನ್ ರಮ್ಮಿ|सट्टा|जुआ|कैसीनो|जुगार|रमी व्यसन|சூதாட்டம்|జూదం/i.test(
      q
    );

  if (isSecretIntimateTaboo) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "SECRET_INTIMATE_TABOO",
      categoryLabel: isSexWork
        ? "ರಹಸ್ಯ ಹಾಗೂ ಅಂತರಂಗ ಮುಕ್ತಿ ವಿಚಾರ (Redemption, Intimacy & Dignity Counsel)"
        : "ರಹಸ್ಯ ಹಾಗೂ ಅಂತರಂಗ ಕಾಮ ಭಾವ ವಿಚಾರ (Secret, Intimate & Relationship Counsel)",
      detectedTopicSnippet: isSexWork
        ? "Commercial Sex Work Redemption & Dignified Life"
        : "Secret / Intimate / Kama Query",
      priestPersonaTone: "compassionate_grounding"
    };
  }

  // 7. Provocative / Taboo / Adult Star / Vulgar Testing
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

  // 8. Celebrity Fantasy (Aishwarya Rai, Mia Khalifa, Sunny Leone, heroines, actresses, models)
  const isCelebrityFantasy =
    /ಐಶ್ವರ್ಯ|aishwarya|aiswarya|ಹೀರೋಯಿನ್|heroine|ನಟಿ|actress|ಸೆಲೆಬ್ರಿಟಿ|celebrity|ದೀಪಿಕಾ|deepika|ಕತ್ರಿನಾ|katrina|ಸಮಂತಾ|samantha|ರಶ್ಮಿಕಾ|rashmika|ಪೂಜಾ|pooja hegde|ತಾರೆ|ಸಿನಿಮಾ ನಟಿ|ಮಿಯಾ ಖಲೀಫಾ|mia khalifa|sunny leone|ಸನ್ನಿ ಲಿಯೋನ್|mia malkova|dani daniels|kendra lust|sasha grey|angela white|alia bhatt|ಆಲಿಯಾ|kiara advani|sreeleela|ಶ್ರೀಲೀಲಾ|tamannaah|ತಮನ್ನಾ|nayanthara|ನಯನತಾರಾ|trisha|ತ್ರಿಷಾ|keerthy suresh|ಕೀರ್ತಿ ಸುರೇಶ್|kareena|ಕರೀನಾ|shraddha kapoor|taylor swift|kim kardashian|ಮಾಡಲ್|model/i.test(
      q
    ) &&
    (/ಮದುವೆ|marry|married|wedding|ಲವ್|love|ಪ್ರೀತಿಸ|ಆಗಬಹುದಾ|possible|wife|husband|crush|girlfriend|gf|date|dating|ಜೊತೆ|do i get married|can i marry|will i get married/i.test(
      q
    ) ||
      /marry (mia|aishwarya|sunny|heroine)|(mia khalifa|aishwarya rai|sunny leone).*maduve/i.test(q));

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

  // 9. Career, Work, Profession, Business & Financial Frustration / Roadblocks
  const isCareerFrustration =
    // Kannada career & frustration patterns
    /(ಉದ್ಯೋಗ|ಕೆಲಸ|ವೃತ್ತಿ|ವ್ಯಾಪಾರ|ಬಡ್ತಿ|ಸಂಬಳ|ಹಣಕಾಸು|ಸಾಲ).*(ಕಿರಿಕಿರಿ|ಬೇಸರ|ಹತಾಶೆ|ಸಮಸ್ಯೆ|ತೊಂದರೆ|ನಷ್ಟ|ವಿಳಂಬ|ಯಾಕೆ|ಕಾರಣ|ಆಗ್ತಿಲ್ಲ|ಫ್ರಸ್ಟ್ರೇಷನ್|ಶಾಂತಿ ಇಲ್ಲ|ಅಡೆತಡೆ|ಆತಂಕ)/i.test(
      q
    ) ||
    /(ಕಿರಿಕಿರಿ|ಬೇಸರ|ಹತಾಶೆ|ಫ್ರಸ್ಟ್ರೇಷನ್).*(ಉದ್ಯೋಗ|ಕೆಲಸ|ವೃತ್ತಿ|ವ್ಯಾಪಾರ|ಜೀವನ)/i.test(q) ||
    // English career frustration patterns
    /(frustrat|stress|depress|hate|trouble|issue|stagnant|stuck|lose|loss|delay|why.*happen|struggl).*(job|work|career|business|promotion|income|salary|wealth|debt)/i.test(
      q
    ) ||
    /(job|work|career|business|promotion|income|salary|finances?).*(frustrat|stress|trouble|issue|stagnant|stuck|loss|delay|ruin|fail|headache)/i.test(
      q
    ) ||
    // Hindi
    /(नौकरी|काम|करियर|व्यापार|रोजगार).*(परेशानी|तनाव|समस्या|नुकसान|फ्रस्ट्रेशन|रुकावट|क्यों)/i.test(
      q
    );

  if (isCareerFrustration) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "CAREER_FRUSTRATION_DISTRESS",
      categoryLabel: "ವೃತ್ತಿ ಹತಾಶೆ ಹಾಗೂ ಕರ್ಮಸ್ಥಾನ ವಿಶ್ಲೇಷಣೆ (Career Frustration & Karmic Guidance)",
      detectedTopicSnippet: "Career Frustration / Work Stress",
      priestPersonaTone: "compassionate_grounding"
    };
  }

  // 10. Deep Emotional Distress, Grief, Depression, Crying, Helplessness
  const isEmotionalDistress =
    /ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ ಇಲ್ಲ|ತುಂಬಾ ಬೇಸರ|ಖಿನ್ನತೆ|(ತೀವ್ರ|ವಿಪರೀತ|ಮಾನಸಿಕ)?\s*ಆತಂಕ|ಸಾಯಬೇಕು ಅನ್ನಿಸ್ತಿದೆ|ಬದುಕು ಸಾಕು|ಕಣ್ಣೀರು|ಯಾಕೆ ಇಷ್ಟು ಕಷ್ಟ|ನನ್ನ ಜೀವನ ಹಾಳಾಗಿದೆ|ಏನು ಮಾಡ್ಲಿ ತಿಳಿಯುತ್ತಿಲ್ಲ|ಅಳುತ್ತಿದ್ದೇನೆ/i.test(
      q
    ) ||
    /(depress|hopeless|suicid|cry|breakdown|lost in life|heartbroken|mental agony|deep sorrow|sleepless night|can't take it anymore|why so much pain)/i.test(
      q
    ) ||
    /(डिप्रेशन|मानसिक तनाव|जीने की इच्छा नहीं|रो रहा|बहुत दर्द|शांति नहीं)/i.test(q);

  if (isEmotionalDistress) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "EMOTIONAL_DISTRESS_LIFE",
      categoryLabel: "ಮಾನಸಿಕ ಸಾಂತ್ವನ ಹಾಗೂ ದೈವ ರಕ್ಷಣೆ (Deep Emotional Solace & Solitude)",
      detectedTopicSnippet: "Emotional Grief / Mental Suffering",
      priestPersonaTone: "compassionate_grounding"
    };
  }

  // 11. General Knowledge, Science, Geography, History, Sports, Technology (Worldly Inquiry)
  const isGeneralKnowledge =
    /what is the capital of|who invented|who is the prime minister|who is the president|how does .* work|speed of light|photosynthesis|quantum|who won the|what is the formula of|currency of|how many states in india|what is gdp|solar system|black hole|gravity|world war|olympics|cricket score|how many days in a year|temperature of sun|tallest mountain|longest river|distance from earth to|is earth round|who discovered|who wrote the constitution/i.test(
      q
    ) ||
    /ರಾಜಧಾನಿ|ಯಾರು ಕಂಡುಹಿಡಿದರು|ಪ್ರಧಾನಿ ಯಾರು|ರಾಷ್ಟ್ರಪತಿ ಯಾರು|ಬೆಳಕಿನ ವೇಗ|ಗುರುತ್ವಾಕರ್ಷಣೆ|ಸೌರಮಂಡಲ|ಕಪ್ಪು ಕುಳಿ|ವಿಜ್ಞಾನ|ಭೂಗೋಳ|ಇತಿಹಾಸ|ಭಾರತದ ಮೊದಲ|ವಿಶ್ವದ ಅತ್ಯಂತ|ಕ್ರಿಕೆಟ್|ವಿಶ್ವಕಪ್|ಫುಟ್‌ಬಾಲ್|ಸಂವಿಧಾನ.*(ಬರೆದ|ರಚಿಸಿದ|ಶಿಲ್ಪಿ)|ಯಾರು.*(ಬರೆದ|ಕಂಡುಹಿಡಿ)/i.test(
      q
    ) ||
    /राजधानी क्या है|किसने खोजा|प्रधानमंत्री कौन|राष्ट्रपति कौन|प्रकाश की गति|गुरुत्वाकर्षण क्या है|सौर मंडल|इतिहास|विज्ञान|संविधान किसने लिखा/i.test(
      q
    );

  if (isGeneralKnowledge) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "GENERAL_KNOWLEDGE_WORLDLY",
      categoryLabel: "ಸಾಮಾನ್ಯ ಜ್ಞಾನ ಹಾಗೂ ಲೋಕ ವಿಜ್ಞಾನ (Worldly Science & General Knowledge)",
      detectedTopicSnippet: "Worldly / General Knowledge Query",
      priestPersonaTone: "erudite_scholar"
    };
  }

  // 12. Domestic Omens & Vastu (Old vessel found, corner findings, strange domestic occurrences)
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

  // 13. Daily Trip & Travel (Going on a trip tomorrow, journey, travel muhurtha)
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

  // 14. Legal Dispute & Court Case Victory
  const isLegalCourtCase =
    /ಕೋರ್ಟ್ ಕೇಸ್|ಕೋರ್ಟು|ವ್ಯಾಜ್ಯ|ಮೊಕದ್ದಮೆ|ನ್ಯಾಯಾಲಯ|ಕೇಸ್ ಗೆಲುವು|ಶತ್ರು ಬಾಧೆ|court case|litigation|lawsuit|legal dispute|win case|court decision|opponent|legal battle|कोर्ट केस|मुकदमा|अदालत|शत्रु बाधा|కోర్టు కేసు|వ్యాజ్యం|న్యాయస్థానం|நீதிமன்ற வழக்கு|வழக்கு வெற்றி|കോടതി കേസ്|വ്യാവഹാരം|कोर्ट केस|खटला/i.test(
      q
    );

  if (isLegalCourtCase) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "LEGAL_DISPUTE_VICTORY",
      categoryLabel: "ನ್ಯಾಯಾಲಯ ವಿವಾದ & ಶತ್ರು ಜಯ (Legal Dispute & Adversary Victory)",
      detectedTopicSnippet: "Court Case / Legal Dispute",
      priestPersonaTone: "divine_oracle"
    };
  }

  // 14a. Interpersonal Conflict & Anger (Fights, quarrels, dispute with someone)
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

  // 14b. Government Job vs Private Sector / Executive Authority
  const isGovtJob =
    /ಸರ್ಕಾರಿ ಕೆಲಸ|ಸರ್ಕಾರಿ ಉದ್ಯೋಗ|ಸರಕಾರಿ ಕೆಲಸ|ಸರಕಾರಿ ನೌಕರಿ|ಸರ್ಕಾರಿ ನೌಕರಿ|sarkari|government job|govt job|civil service|ias|ips|upsc|kpsc|ssc|government sector|सरकारी नौकरी|सरकारी काम|ప్రభుత్వ ఉద్యోగం|அரசு வேலை|സർക്കാർ ജോലി|सरकारी नोकरी/i.test(
      q
    );

  if (isGovtJob) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "GOVERNMENT_JOB_AUTHORITY",
      categoryLabel: "ಸರ್ಕಾರಿ ಉದ್ಯೋಗ & ರಾಜ್ಯಾಧಿಕಾರ ಯೋಗ (Government Career & Executive Authority)",
      detectedTopicSnippet: "Government Job / Sarkari Naukri",
      priestPersonaTone: "divine_oracle"
    };
  }

  // 14c. Business vs Employment & Partnership Guard
  const isBusinessVsJob =
    /ಸ್ವಂತ ವ್ಯಾಪಾರ|ಸ್ವಂತ ಉದ್ಯಮ|ಕೆಲಸ ಉತ್ತಮವೋ|ವ್ಯಾಪಾರ ಉತ್ತಮವೋ|ಪಾಲುದಾರಿಕೆ|ಪಾರ್ಟ್ನರ್‌ಶಿಪ್|business or job|job or business|own business|partnership|start business|do business|व्यापार या नौकरी|नौकरी या व्यापार|भागीदारी|సొంత వ్యాపారం|వ్యాపారమా ఉద్యోగమా|పార్టనర్‌షిప్|தொழில் அல்லது வேலை|சொந்த தொழில்|கூட்டுத் தொழில்|സ്വന്തം ബിസിനസ്സ്|തൊഴിലോ ബിസിനസ്സോ|भागीदारी व्यवसाय/i.test(
      q
    );

  if (isBusinessVsJob) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "BUSINESS_VS_JOB_COMMERCE",
      categoryLabel: "ಸ್ವಂತ ವ್ಯಾಪಾರ vs ಉದ್ಯೋಗ & ಪಾಲುದಾರಿಕೆ ಮಾರ್ಗದರ್ಶನ (Business vs Employment & Partnership Guard)",
      detectedTopicSnippet: "Business vs Job / Partnership",
      priestPersonaTone: "divine_oracle"
    };
  }

  // 14d. Debt Relief & Financial Revival
  const isDebtRelief =
    /ಸಾಲ ಮುಕ್ತಿ|ಸಾಲ ತೀರಿಸ|ಸಾಲದ ಬಾಧೆ|ಸಾಲ ಯಾವಾಗ ತೀರುತ್ತೆ|ಸಾಲದಿಂದ ಮುಕ್ತಿ|ಸಾಲದ ಹೊರೆ|debt relief|clear debt|pay off loan|clear loans|debt free|loan repayment|overcome debt|कर्ज मुक्ति|ऋण मुक्ति|कर्ज से छुटकारा|రుణ విముక్తి|అప్పులు తీరడం|கடன் நிவாரணம்|கடன் தீர|കടബാധ്യത മുക്തി|कर्जमुक्ती/i.test(
      q
    );

  if (isDebtRelief) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "DEBT_RELIEF_FINANCE",
      categoryLabel: "ಋಣ ವಿಮೋಚನೆ & ಆರ್ಥಿಕ ಪುನಶ್ಚೇತನ (Debt Relief & Financial Revival)",
      detectedTopicSnippet: "Debt Relief / Financial Revival",
      priestPersonaTone: "compassionate_grounding"
    };
  }



  // 14f. Health Recovery, Surgery & Longevity
  const isHealthLongevity =
    /ಆರೋಗ್ಯ ಸುಧಾರಣೆ|ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ|ಸರ್ಜರಿ|ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆ|ಆಸ್ಪತ್ರೆ|ಆರೋಗ್ಯ ಯಾವಾಗ ಸುಧಾರಿಸುತ್ತೆ|health recovery|surgery|chronic illness|hospitalization|cure disease|medical recovery|स्वास्थ्य सुधार|सर्जरी|शल्यक्रिया|दीर्घ बीमारी|ఆరోగ్య రికవరీ|శస్త్రచికిత్స|உடல்நல முன்னேற்றம்|அறுவை சிகிச்சை|ആരോഗ്യ വീണ്ടെടുക്കൽ|ശസ്ത്രക്രിയ|आरोग्य सुधारणा|शस्त्रक्रिया/i.test(
      q
    );

  if (isHealthLongevity) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "HEALTH_VITALITY_HEALING",
      categoryLabel: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಆಯುಷ್ಯ ವೃದ್ಧಿ (Health Recovery & Longevity)",
      detectedTopicSnippet: "Health Recovery / Surgery / Longevity",
      priestPersonaTone: "peaceful_counsel"
    };
  }

  // 14g. Competitive Exam & Academic Merit
  const isCompetitiveExam =
    /ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ|ಪರೀಕ್ಷೆಯಲ್ಲಿ ಪಾಸ್|ಉನ್ನತ ಶಿಕ್ಷಣ|ರ್ಯಾಂಕ್|ಕಾಂಪಿಟಿಟಿವ್ ಎಕ್ಸಾಮ್|competitive exam|exam pass|clear exam|higher education|entrance exam|rank|merit|प्रतियोगी परीक्षा|परीक्षा में सफलता|उच्च शिक्षा|పోటీ పరీక్ష|పరీక్షలో ఉత్తీర్ణత|உயர் கல்வி|போட்டித் தேர்வு|മത്സര പരീക്ഷ|ഉന്നത വിദ്യാഭ്യാസം|स्पर्धा परीक्षा|उच्च शिक्षण/i.test(
      q
    );

  if (isCompetitiveExam) {
    return {
      ageYears,
      lifeStage,
      place: session.place,
      category: "COMPETITIVE_EXAM_SUCCESS",
      categoryLabel: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ & ವಿದ್ಯಾ ಜಯ (Competitive Exam & Academic Merit)",
      detectedTopicSnippet: "Competitive Exam / Higher Education",
      priestPersonaTone: "divine_oracle"
    };
  }

  // 15. Life Overview & Existential Query ("What is happening in my life now?")
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
  isSubsequentQuestion?: boolean;
  questionIndex?: number;
}): Promise<ConsultationReadingResult & { sensedContext: SensedDevoteeContext }> {
  const {
    session,
    userQuestion,
    conversationHistory,
    apiKey,
    isSubsequentQuestion,
    questionIndex
  } = params;

  // Step 1: Frontline Sensing & Categorization
  const sensed = senseAndCategorizeQuestion(userQuestion, session);
  console.log(
    `[consultationPresenterEngine] Devotee "${session.name}" (Age: ${sensed.ageYears}, ${sensed.lifeStage}) -> Category: ${sensed.category}`
  );

  // Step 1.5: Security & System Probe Immediate Boundary Guard
  if (sensed.category === "SECURITY_SYSTEM_PROBE_BLOCKED") {
    const blockedText = getDeterministicSecurityBlockedReply(session.language);
    return {
      fullText: blockedText,
      paragraphs: [blockedText],
      astrologicalHighlights: {
        lagna: "ಮೇಷ",
        moonSign: "ವೃಷಭ",
        nakshatra: "ರೋಹಿಣಿ",
        currentDasha: "ಶುಭ ದಶಾ ಕಾಲ",
        keyInfluences: []
      },
      hasDosha: false,
      sensedContext: sensed
    };
  }

  // If question is pure deep astrological, career frustration, child inquiry, Santhana, abroad settlement, property, govt job, business, debt, legal, health, or exams, delegate directly to the deep chart math engine
  if (
    sensed.category === "ASTROLOGICAL_DEEP" ||
    sensed.category === "CAREER_FRUSTRATION_DISTRESS" ||
    sensed.category === "CHILD_PARENT_INQUIRY" ||
    sensed.category === "SANTHANA_PROGENY_SENSITIVE" ||
    sensed.category === "ABROAD_VS_INDIA_SETTLEMENT" ||
    sensed.category === "PROPERTY_ASSET_ACQUISITION" ||
    sensed.category === "GOVERNMENT_JOB_AUTHORITY" ||
    sensed.category === "BUSINESS_VS_JOB_COMMERCE" ||
    sensed.category === "DEBT_RELIEF_FINANCE" ||
    sensed.category === "LEGAL_DISPUTE_VICTORY" ||
    sensed.category === "HEALTH_VITALITY_HEALING" ||
    sensed.category === "COMPETITIVE_EXAM_SUCCESS"
  ) {
    const reading = await generateConsultationAnswer({
      session,
      userQuestion,
      conversationHistory,
      apiKey,
      isSubsequentQuestion,
      questionIndex
    });
    return { ...reading, sensedContext: sensed };
  }

  // Step 2: For other inquiries, compute astrological baseline for grounding
  let lagnaName = "ಮೇಷ";
  let moonRashi = "ವೃಷಭ";
  let nakshatra = "ರೋಹಿಣಿ";
  let pada = 1;
  let currentDashaText = "ಶುಭ ದಶಾ ಕಾಲ";

  try {
    const astro = await computeDevoteeKundli(session);
    lagnaName = astro.lagnaName;
    moonRashi = astro.moonRashi;
    nakshatra = astro.nakshatra;
    pada = astro.pada;
    currentDashaText = astro.currentDashaText;
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
    targetLang,
    isSubsequentQuestion,
    questionIndex,
    conversationHistory
  });

  let responseText = "";
  // Robust API key resolution: check parameter -> store -> build environment VITE_GEMINI_API_KEY
  const effectiveApiKey = (
    apiKey !== undefined
      ? apiKey
      : useAppStore.getState?.()?.geminiApiKey ||
        (typeof import.meta !== "undefined"
          ? (import.meta as any).env?.VITE_GEMINI_API_KEY
          : "") ||
        ""
  ).trim();

  if (!effectiveApiKey) {
    responseText = generateSpecializedFallbackReply({
      session,
      userQuestion,
      sensed,
      lagnaName,
      moonRashi,
      nakshatra,
      currentDashaText,
      isSubsequentQuestion,
      questionIndex
    });
  } else {
    try {
      responseText = await askGemini(
        userQuestion,
        presenterPrompt,
        effectiveApiKey,
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
      console.warn(
        "[consultationPresenterEngine] Gemini call failed, engaging specialized deterministic fallback:",
        err
      );
      responseText = generateSpecializedFallbackReply({
        session,
        userQuestion,
        sensed,
        lagnaName,
        moonRashi,
        nakshatra,
        currentDashaText,
        isSubsequentQuestion,
        questionIndex
      });
    }
  }

  // Clean formatting artifacts and deduplicate repeated words/phrases/sentences
  const deduplicated = deduplicateResponseText(responseText);
  const cleaned = deduplicated
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
  isSubsequentQuestion?: boolean;
  questionIndex?: number;
  conversationHistory?: AskGeminiChatTurn[];
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
    targetLang,
    isSubsequentQuestion,
    questionIndex,
    conversationHistory
  } = params;

  let categorySpecificInstructions = "";

  switch (sensed.category) {
    case "CAREER_FRUSTRATION_DISTRESS":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR CAREER, JOB, WORK, OR FINANCIAL FRUSTRATION:
The devotee is in distress or deep frustration regarding their career/job/business/finances (ವೃತ್ತಿಜೀವನದಲ್ಲಿ ತೀವ್ರ ಕಿರಿಕಿರಿ / ಹತಾಶೆ / ನಷ್ಟ / ಅಡೆತಡೆ).
- PRIEST PROTOCOL:
  1. FIRST, EMOTIONALLY CONNECT & SUPPORT: Address them with profound fatherly empathy and warmth ("ಮಗುವೇ ${session.name}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಳವಳ ಮತ್ತು ವೃತ್ತಿಜೀವನದ ಆತಂಕವನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಲ್ಲೆ..."). Validate their pain; let them feel that their burden is shared and understood by a caring elder.
  2. ASTROLOGICAL ROOT CAUSE (WHY THIS IS HAPPENING): Use their Janma Lagna (${lagnaName}), Moon Sign (${moonRashi}), and running Dasha (${currentDashaText}) to explain why this pressure is manifesting right now.
  3. TIMELINE & PRACTICAL COUNSEL: Advise practical career wisdom: maintain patience, avoid hasty resignations in anger, cultivate continuous learning. Prescribe daily Gayatri Mantra or Shiva Panchakshari and lighting a cow-ghee lamp.`;
      break;

    case "EMOTIONAL_DISTRESS_LIFE":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR DEEP EMOTIONAL DISTRESS, GRIEF, DEPRESSION, OR CRYING:
The devotee is expressing deep mental agony, grief, feeling lost, crying, or hopelessness:
- PRIEST PROTOCOL:
  1. Provide immediate, deeply comforting fatherly solace (ಮಗುವೇ, ನಿಮ್ಮ ಕಣ್ಣೀರನ್ನು ಒರೆಸಿಕೊಳ್ಳಿ... ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೀವು ಒಬ್ಬಂಟಿಯಲ್ಲ).
  2. Reassure them that life's trials are temporary churning (ಮಂಥನ) and the divine grace of Gokarna will protect them.
  3. Ground their feelings in Moon (Chandra - Manokaraka) afflictions and advise calming spiritual practices: daily chanting of Om Namah Shivaya or Mahamrityunjaya, pranayama, and walking in fresh air.
  4. Assure them that this dark phase will pass, and their life is precious and destined for recovery.`;
      break;

    case "CHILD_PARENT_INQUIRY":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR MINOR CHILD & PARENTAL INQUIRY (EDUCATION, CONCENTRATION, HEALTH):
The profile is a minor child (${sensed.ageYears} years old) or parent asking about their child:
- PRIEST PROTOCOL:
  1. ADDRESS THE PARENTS WITH PATERNAL REVERENCE ("ಆತ್ಮೀಯ ಪೋಷಕರೇ / ಪಾಲಕರೇ...", "Dear Parents...").
  2. FOCUS ON 4TH HOUSE (VIDYA) AND 5TH HOUSE (BUDDHI): Analyze the child's academic grasping power, concentration, and memory.
  3. REASSURE PARENTS & GUIDE THEM: Explain how to nurture the child's inborn nature without harsh comparison or pressure.
  4. BLESSING & REMEDY: Prescribe Medha Sukta, Maha Saraswati Gayatri, and Gokarna Mahaganapati prayer.
  5. STRICT PROHIBITION: Never discuss adult romance, marriage, or adult career anxieties for a child.`;
      break;

    case "SANTHANA_PROGENY_SENSITIVE":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR PROGENY, SANTHANA & CHILDBIRTH:
The devotee is seeking divine guidance regarding conceiving a child, delay in progeny, or blessing of a son:
- PRIEST PROTOCOL:
  1. Address the couple with deep fatherly compassion; remove all feelings of guilt, hopelessness, and societal pressure.
  2. Analyze 5th House of progeny, Putrakaraka Jupiter (Guru), and 9th House of fortune.
  3. Explain that conception requires both medical health and celestial blessing (Daiva Bala).
  4. Prescribe Sri Kshetra Gokarna Santhana Gopala Maha Homa and Naga Pratishtha, and direct them to contact Shreeram Pandit at 9972339362.`;
      break;

    case "GENERAL_KNOWLEDGE_WORLDLY":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR GENERAL KNOWLEDGE, SCIENCE, GEOGRAPHY, HISTORY, OR WORLDLY QUESTIONS:
The devotee is asking a worldly question regarding general knowledge, science, history, geography, sports, or world affairs.
- PRIEST PROTOCOL:
  1. Answer the devotee's question FACTUALLY, CLEARLY, INTELLECTUALLY, and SATISFYINGLY as an educated, erudite scholar-priest who understands both Vedic Shastra and the modern world.
  2. STRICTLY ZERO ASTROLOGICAL HALLUCINATION: Absolutely DO NOT invent or force horoscope placements, Lagna, or planetary links into pure general knowledge or worldly facts! (e.g. Do NOT say "Because you are Mesha Lagna, the capital of Australia is Canberra" - that is completely false).
  3. Provide accurate information in the native script of the chosen language.
  4. Conclude with grandfatherly/paternal grace: acknowledge that curiosity and learning (ಜ್ಞಾನಾರ್ಜನೆ) enlighten the intellect, offer a divine blessing, and warmly invite them to share any personal question about their life, family, career, or spiritual path in this consultation.`;
      break;

    case "SILLY_TROLLING_MOCKERY":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR SILLY, PLAYFUL, CARTOON/SUPERHERO, COMEDIC, OR JOKING QUESTIONS:
The devotee or visitor has asked a playful, silly, comedic, cartoon/superhero, or teasing question (e.g. asking about Batman vs Superman, jokes, aliens, etc.):
- PRIEST PROTOCOL:
  1. DO NOT BE HARSH, RUDE, OR ROBOTIC! DO NOT REFUSE TO ANSWER!
  2. As an experienced 50+ year master astrologer who has seen thousands of people and understands human nature, answer their silly question properly with witty, charming, and detailed insights (with a joyful twinkle in your eye).
  3. For example, if they ask about Batman vs Superman, discuss the contrast between Superman's cosmic solar gifts and Batman's mortal human intellect and preparation, or if they ask for a joke, share an intelligent, witty dharmic or humorous insight.
  4. Then, with grandfatherly affection, connect warmly: acknowledge that humor, laughter, and innocence keep the heart light and youthful.
  5. Warmly invite them: Having shared a smile together, ask them how their real life, studies, career, or family is going, and invite them to ask any genuine dilemma or question they have brought to Gokarna today.`;
      break;

    case "SECRET_INTIMATE_TABOO":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR SECRET, INTIMATE, TABOO, EXTRAMARITAL, SEX WORK, OR "DIRTY" QUESTIONS:
The devotee is opening their heart about an intensely private, confidential, sexual, extramarital, sex work / prostitution, or taboo dilemma:
- Devotee Age: ${sensed.ageYears} years old (${sensed.lifeStage}).
- Janma Lagna: ${lagnaName}, Moon Sign: ${moonRashi}, Current Running Dasha: ${currentDashaText}.
- PRIEST PROTOCOL:
  1. Address them with fatherly warmth, non-judgmental dignity, and saintly compassion (ಮಗುವೇ / ಪ್ರಿಯ ಸೋದರನೇ).
  2. Speak with absolute discretion and understanding: In Vedic Jyotisha, Kama (ಕಾಮ - desire) is recognized as one of the four sacred Purusharthas (Dharma, Artha, Kama, Moksha). Human physical desire and attraction are natural cosmic energies governed by planetary transits, not unforgivable sins.
  3. FOR DEVOTEES TRAPPED IN COMMERCIAL SEX WORK / PROSTITUTION SEEKING REDEMPTION & MARRIAGE:
     - Reassure them that in the presence of Lord Mahabaleshwara at Sri Kshetra Gokarna, NO SOUL IS IMPURE, FORSAKEN, OR PERMANENTLY CONDEMNED.
     - Cite classical Vedic and spiritual precedents like Pingala and Amrapali who attained supreme liberation and honor.
     - Explain that 8th house (Guhya / secret suffering), 7th house (partnerships/commerce of desire), and 6th house (Rina / debt entrapment) under Rahu/Kuja afflicted them by circumstance and economic helplessness, not intrinsic evil.
     - Provide the 100% confident assurance that upcoming Jupiter (Guru) Gochara and Dasha shifts will break the coercive chains, opening a respectable path to marriage, family dignity, and self-worth.
     - Counsel practical medical health checkups, reproductive care, and connecting with legal/rehabilitation support without shame.
     - Prescribe Sri Kshetra Gokarna Mahabaleshwara Rudrabhisheka, Sri Mahagauri/Durga Stotra, and Sri Runavimochana Stotra.
  4. FOR EXTRAMARITAL AFFAIRS & TABOO ATTRACTIONS:
     - Provide clear Dharmic and practical counsel. Advise taking a firm, dignified step back to protect their family integrity, explaining that clandestine affairs invariably trigger 8th/12th house karmic backlash and loss of honor.
  5. FOR PHYSICAL INTIMACY, ERECTILE DYSFUNCTION & BEDROOM DISCORD:
     - Dispel toxic guilt and performance anxiety. Explain that psychosomatic stress depletes Shukra Dhatu, prescribing an Ayurvedic regimen, Pranayama, and Shiva worship.
  6. Prescribe Gokarna Pariharas: Sri Mahabaleshwara Rudrabhisheka to cool internal heat and daily chanting of Shiva Panchakshari.`;
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
  4. Inspire them with real-world Vedic wisdom: Look at the accomplished, hard-working, and respectable individuals who achieve great heights. If the devotee desires a high-stature life partner, they must first build exceptional personal character, work diligently, earn an honorable livelihood, and cultivate genuine maturity.
  5. Connect to their chart: Advise them to channel their youthful energy away from distant screen fantasies toward their real-world 7th House (ಸಪ್ತಮ ಭಾವ) and Venus (ಶುಕ್ರ). Assure them that sincere effort will bring a loving and virtuous life partner suited for their real life.`;
      break;

    case "PROVOCATIVE_TABOO":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR PROVOCATIVE / TABOO / ADULT STAR / VULGAR QUESTIONS:
The devotee has asked an inappropriate, vulgar, or taboo question:
- PRIEST PROTOCOL:
  1. Maintain unshakable saintly serenity and dignified fatherly purity.
  2. Strictly DO NOT show anger, disgust, or use vulgar/harsh language.
  3. With compassionate paternal authority, remind them of the sacred sanctum of Sri Kshetra Gokarna and the dignity of human birth.
  4. Explain gently that chasing temporary lustful illusions and digital distractions weakens mental clarity, self-esteem, and Dharma.
  5. Encourage them to practice self-discipline (ಇಂದ್ರಿಯ ನಿಗ್ರಹ) and recommend reciting the sacred Shiva Panchakshari or Gayatri mantra to steady the mind.`;
      break;

    case "DOMESTIC_OMEN_VASTU":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR DOMESTIC OMENS & VASTU (OLD VESSEL / CORNER FINDING):
The devotee is curious or concerned about finding an old vessel/pot or strange item in a corner of their house:
- PRIEST PROTOCOL:
  1. Remove all superstitious fear and blind panic.
  2. In Vedic Vastu & Nimitta Shastra, metallic vessels carry elemental grounding energies. Corners of the home represent vital spatial energy nodes.
  3. Practical & Sacred Vedic Guidance: Clean the vessel respectfully, wash that corner with rock-salt water or sacred Ganga-jala, light a pure cow-ghee lamp, and pray to the Kuladevata.`;
      break;

    case "DAILY_TRIP_TRAVEL":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR DAILY TRIP & TRAVEL (GOING ON A TRIP TOMORROW):
The devotee is planning an immediate trip or journey tomorrow and asking what to do:
- PRIEST PROTOCOL:
  1. Offer a warm fatherly blessing for safety, peace, and joyous travel.
  2. Practical Astrological Guidance: Advise checking tomorrow's Rahu Kala and avoiding starting the journey during that window. Offer a mental prayer or coconut to Lord Mahaganapati and Kuladevata before embarking. Step out with the right foot.`;
      break;

    case "INTERPERSONAL_CONFLICT":
      categorySpecificInstructions = `
SPECIFIC GUIDANCE FOR INTERPERSONAL CONFLICT & FIGHTS (QUARREL WITH SOMEONE):
The devotee has had a heated fight or argument with someone and asks what they should do:
- PRIEST PROTOCOL:
  1. Soothe their agitated heart with deep Vedic wisdom on anger and patience.
  2. Explain that sudden heated clashes are often triggered by transient malefic influences of Mars (Kuja - anger) or Mercury (Budha - sharp words). "ಕ್ರೋಧವು ಮನುಷ್ಯನ ವಿವೇಕವನ್ನು ನಾಶಮಾಡುತ್ತದೆ."
  3. Advise them NOT to react impulsively while tempers are blazing. Allow 24 to 48 hours for cooling down. Walk the path of Dharma and peace.`;
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

${NAVAGRAHA_GEMOLOGY_AND_UPARATNA_REFERENCE}

${MULTI_TURN_ANTI_CONTRADICTION_GUARD}

${SYSTEM_SECURITY_CONFIDENTIALITY_DIRECTIVE}

${formatRulingsLedgerForPrompt(session.rulingsLedger || [], session.language)}

${
  conversationHistory && conversationHistory.length > 0
    ? `CRITICAL MULTI-TURN CONVERSATION CONTINUITY & PAST RULINGS:
The devotee is in an ongoing 20-minute conversation. Review all past turns:
${conversationHistory.map((t, idx) => `[Turn ${idx + 1} - ${t.role === "user" ? "Devotee" : "Master Astrologer"}]: ${t.text}`).join("\n\n")}

MANDATORY RULES ON PAST RULINGS:
- If in Turn 1 or earlier you advised against, warned against, or rejected a specific option (e.g. permanent settlement abroad, speculative debt-laden property, or White Coral instead of Diamond), you MUST NOT suggest or approve that same rejected option in this turn!
- Maintain 100% strict consistency with your earlier statements across ALL life domains. Never contradict yourself!`
    : ""
}

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
2. ACCURACY & SATISFACTION:
   - If general knowledge is asked, answer it accurately and factually without hallucinated horoscope connections.
   - If silly/playful questions are asked, answer with witty details and fatherly warmth, then warmly invite them to their real life questions.
   - If career or life trouble is asked, connect emotionally, give exact astrological reasons, and guide them out of it.
3. SACRED INSTITUTION:
   - Anchor your guidance in the traditions of Sri Baggona Panchanga (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ) and Sri Kshetra Gokarna (ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ).
4. LANGUAGE REQUIREMENT:
   - You MUST respond 100% EXCLUSIVELY in the ${targetLang} language using its native script.
   - Absolutely NO Latin transliteration or mixed English words in Indian languages.
5. TEXT-TO-SPEECH DELIVERY:
   - Do NOT use markdown symbols like * or # as this text will be read aloud by the priest neural voice engine. Provide clean, flowing spoken paragraphs.
6. ONGOING CONVERSATION FLOW (NO REPEATED GREETINGS):
   - The opening welcome and introduction have ALREADY been delivered at the start of this 20-minute consultation.
   - Directly, respectfully, and compassionately answer this specific question as an ongoing, continuous face-to-face dialogue.
7. CRITICAL DIRECT ANSWER FIRST RULE (UPFRONT - LIKE CHATGPT & GEMINI):
   - The devotee wants the direct conclusion/answer UPFRONT immediately in Sentence 1 of Paragraph 1.
   - Never bury the bottom-line answer in later paragraphs or behind lengthy preamble.
   - If they ask about timing ("When will X happen?"), give the exact timeline range in Sentence 1.
   - If they ask about a gemstone or color or remedy, state the exact recommendation in Sentence 1.
   - If they ask a status or yes/no question, state the astrological verdict clearly in Sentence 1.
   - Paragraph 1 serves as the prominent Direct Takeaway; subsequent paragraphs provide planetary reasoning, Dasha mechanics, and Gokarna spiritual remedies.${
     isSubsequentQuestion
       ? `\n8. SUBSEQUENT QUESTION DIRECTIVE (STRICT FOCUS - ZERO REPETITION):
   - This is question #${(questionIndex || 1) + 1} from the devotee in this ongoing 20-minute consultation.
   - You MUST answer ONLY THIS NEW QUESTION ("${userQuestion}").
   - ZERO RE-READING or summarizing of previous questions (e.g., do NOT say "As you asked earlier about marriage...", "ಹಿಂದೆ ಕೇಳಿದಂತೆ...").
   - ZERO REPEATING of greetings (no "ನಮಸ್ಕಾರ / Namaste / ಹರಿ ಓಂ / Hari Om").
   - ZERO REPEATING of the devotee's Lagna, Rashi, Nakshatra, Tatva, Gana inborn character traits that were already mirrored in turn 1.
   - Start immediately with the direct answer, Bhavas, and remedy for this specific question.`
       : ""
   }`;
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
  isSubsequentQuestion?: boolean;
  questionIndex?: number;
}): string {
  const {
    session,
    sensed,
    userQuestion,
    lagnaName,
    moonRashi,
    currentDashaText,
    isSubsequentQuestion,
    questionIndex
  } = params;
  const isSubsequent = !!isSubsequentQuestion || (questionIndex !== undefined && questionIndex > 0);
  const isEn = session.language === "en";
  const isHi = session.language === "hi";
  const isTe = session.language === "te";
  const isTa = session.language === "ta";
  const isMl = session.language === "ml";
  const isMr = session.language === "mr";
  const isKn = session.language === "kn" || (!isEn && !isHi && !isTe && !isTa && !isMl && !isMr);

  switch (sensed.category) {
    case "CAREER_FRUSTRATION_DISTRESS":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your career frustration and work roadblocks ("${userQuestion}"), the prevailing influence of ${currentDashaText} along with current transits is demanding immense patience. When the 10th house of profession experiences temporary planetary strain, hard work often feels unnoticed and workplace friction arises. Do not make impulsive resignations or react with anger.\n\nThe cosmic cycle will soon shift towards stability as favorable transits begin to aspect your key houses. Maintain disciplined dedication, avoid unnecessary workplace arguments, and recite the sacred Gayatri Mantra or Shiva Panchakshari daily. Offering prayers to Sri Mahabaleshwara at Sri Kshetra Gokarna will dissolve obstacles and bring career prosperity.`;
        }
        return `My child ${session.name}, I deeply understand the weight of frustration, career roadblocks, and mental anxiety you are carrying right now. In Vedic Jyotisha, times of career churning are not curses, but cosmic testing phases meant to temper your inner resilience.\n\nAccording to your birth chart calculated with Baggona Panchanga, you are guided by ${lagnaName} Lagna and ${moonRashi} Moon Sign. The prevailing influence of ${currentDashaText} along with current transits is demanding immense patience. When the 10th house of profession experiences temporary planetary strain, hard work often feels unnoticed and workplace friction arises. Do not make impulsive resignations or react with anger.\n\nThe cosmic cycle will soon shift towards stability as favorable transits begin to aspect your key houses. Maintain disciplined dedication, avoid unnecessary workplace arguments, and recite the sacred Gayatri Mantra or Shiva Panchakshari daily. Offering prayers to Sri Mahabaleshwara at Sri Kshetra Gokarna will dissolve obstacles and bring career prosperity.`;
      }
      if (isSubsequent) {
        return `ವೃತ್ತಿಜೀವನ ಹಾಗೂ ಉದ್ಯೋಗದಲ್ಲಿ ಎದುರಾಗುತ್ತಿರುವ ಕಿರಿಕಿರಿ ಮತ್ತು ಹತಾಶೆಯ ಈ ಪ್ರಶ್ನೆಗೆ ("${userQuestion}") ಸಂಬಂಧಿಸಿದಂತೆ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDashaText} ಅವಧಿ ಹಾಗೂ ಗೋಚಾರ ಶನಿ ಪ್ರಭಾವವು ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ಹೊಸ ಆತ್ಮಾವಲೋಕನವನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತಿದೆ. ೧೦ನೇ ಮನೆಯಾದ ಕರ್ಮಸ್ಥಾನದ ಮೇಲಿನ ಈ ತಾತ್ಕಾಲಿಕ ಗ್ರಹ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅತಿಯಾದ ಒತ್ತಡ, ಸಹೋದ್ಯೋಗಿಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ ಹಾಗೂ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಡವಾಗುತ್ತಿದೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಕೋಪ ಅಥವಾ ಆತುರದಲ್ಲಿ ಅವಸರದ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡಬೇಡಿ.\n\nಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಕತ್ತಲೆ ಕರಗಿ ನಿಧಾನವಾಗಿ ಹೊಸ ಅವಕಾಶಗಳ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ. ಅಲ್ಲಿಯವರೆಗೂ ಶಾಂತಚಿತ್ತದಿಂದ ನಿಮ್ಮ ಕಾರ್ಯವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮುಂದುವರಿಸಿ. ಪ್ರತಿದಿನ ಶಿವಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ, ಪ್ರತಿ ಶನಿವಾರ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳೂ ನಿವಾರಣೆಯಾಗಲಿವೆ.`;
      }
      return `ಮಗುವೇ ${session.name}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಳವಳ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ (ಉದ್ಯೋಗ/ವ್ಯಾಪಾರ) ಎದುರಾಗುತ್ತಿರುವ ಕಿರಿಕಿರಿ ಮತ್ತು ಹತಾಶೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಬಲ್ಲೆ. ಜೀವನದಲ್ಲಿ ಇಂತಹ ಮಂಥನದ ಹಂತಗಳು ಬಂದಾಗ ಎಂತಹ ಧೀರರೂ ವಿಚಲಿತರಾಗುವುದು ಸಹಜ.\n\nಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಜ್ಯೋತಿಷ್ಯ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagnaName} ಲಗ್ನ, ${moonRashi} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದು, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDashaText} ಅವಧಿ ಹಾಗೂ ಗೋಚಾರ ಶನಿ ಪ್ರಭಾವವು ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ಹೊಸ ಆತ್ಮಾವಲೋಕನವನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತಿದೆ. ೧೦ನೇ ಮನೆಯಾದ ಕರ್ಮಸ್ಥಾನದ ಮೇಲಿನ ಈ ತಾತ್ಕಾಲಿಕ ಗ್ರಹ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅತಿಯಾದ ಒತ್ತಡ, ಸಹೋದ್ಯೋಗಿಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ ಹಾಗೂ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಡವಾಗುತ್ತಿದೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಕೋಪ ಅಥವಾ ಆತುರದಲ್ಲಿ ಅವಸರದ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡಬೇಡಿ.\n\nಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಕತ್ತಲೆ ಕರಗಿ ನಿಧಾನವಾಗಿ ಹೊಸ ಅವಕಾಶಗಳ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ. ಅಲ್ಲಿಯವರೆಗೂ ಶಾಂತಚಿತ್ತದಿಂದ ನಿಮ್ಮ ಕಾರ್ಯವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮುಂದುವರಿಸಿ. ಪ್ರತಿದಿನ ಶಿವಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ, ಪ್ರತಿ ಶನಿವಾರ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳೂ ನಿವಾರಣೆಯಾಗಲಿವೆ.`;

    case "GENERAL_KNOWLEDGE_WORLDLY":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your inquiry on "${userQuestion}", in our Vedic tradition, the pursuit of worldly sciences and general knowledge (Vijnana) is recognized as essential for intellectual refinement.\n\nKnowledge of worldly systems, science, and history expands the intellect (governed by Mercury and Jupiter). Having satisfied your curiosity on this topic, remember that as we sit together in this sacred 20-minute Gokarna consultation room, I warmly invite you to share any personal questions regarding your career, family, health, or life journey. May Lord Mahabaleshwara bless your intellectual endeavors with wisdom and success.`;
        }
        return `Namaste ${session.name}. Your inquiry regarding "${userQuestion}" is thoughtful and engaging. In our Vedic tradition, the pursuit of worldly sciences and general knowledge (Vijnana) is recognized as essential for intellectual refinement.\n\nKnowledge of worldly systems, science, and history expands the intellect (governed by Mercury and Jupiter). Having satisfied your curiosity on this topic, remember that as we sit together in this sacred 20-minute Gokarna consultation room, I warmly invite you to share any personal questions regarding your career, family, health, or life journey. May Lord Mahabaleshwara bless your intellectual endeavors with wisdom and success.`;
      }
      if (isSubsequent) {
        return `ನೀವು ಕೇಳಿರುವ "${userQuestion}" ಎಂಬ ಸಾಮಾನ್ಯ ಜ್ಞಾನದ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಇದು ಲೋಕ ವ್ಯವಸ್ಥೆ, ವಿಜ್ಞಾನ ಹಾಗೂ ಮಾನವ ಇತಿಹಾಸದ ಪ್ರಮುಖ ವಿಷಯವಾಗಿದೆ. ಜ್ಞಾನಾರ್ಜನೆಯು ಮನುಷ್ಯನ ಬುದ್ಧಿಶಕ್ತಿಯನ್ನು (ಬುಧ ಹಾಗೂ ಗುರು ತತ್ವ) ಸದಾ ಜಾಗೃತವಾಗಿಡುತ್ತದೆ.\n\nಈ ಮಾಹಿತಿಯ ಜೊತೆಗೆ, ನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ಪವಿತ್ರ ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆಯಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜೀವನ, ವೃತ್ತಿ, ವಿವಾಹ ಅಥವಾ ಕೌಟುಂಬಿಕ ವಿಚಾರಗಳ ಕುರಿತು ಮಾರ್ಗದರ್ಶನ ಬೇಕಿದ್ದಲ್ಲಿ ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯು ನಿಮ್ಮ ಮೇಲಿರಲಿ.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನೀವು ಕೇಳಿದ ಸಾಮಾನ್ಯ ಜ್ಞಾನದ ವಿಚಾರಣೆ ಅತ್ಯಂತ ಕುತೂಹಲಕಾರಿಯಾಗಿದೆ. ಲೋಕದ ಪ್ರತಿಯೊಂದು ವಿದ್ಯೆ ಮತ್ತು ವಿಜ್ಞಾನವೂ ಜ್ಞಾನದ ವಿಕಸನವೇ ಆಗಿದೆ. ನಿಮ್ಮ "${userQuestion}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಇದು ಲೋಕ ವ್ಯವಸ್ಥೆ, ವಿಜ್ಞಾನ ಹಾಗೂ ಮಾನವ ಇತಿಹಾಸದ ಪ್ರಮುಖ ವಿಷಯವಾಗಿದೆ. ಜ್ಞಾನಾರ್ಜನೆಯು ಮನುಷ್ಯನ ಬುದ್ಧಿಶಕ್ತಿಯನ್ನು (ಬುಧ ಹಾಗೂ ಗುರು ತತ್ವ) ಸದಾ ಜಾಗೃತವಾಗಿಡುತ್ತದೆ.\n\nಈ ಮಾಹಿತಿಯ ಜೊತೆಗೆ, ನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ಪವಿತ್ರ ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆಯಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜೀವನ, ವೃತ್ತಿ, ವಿವಾಹ ಅಥವಾ ಕೌಟುಂಬಿಕ ವಿಚಾರಗಳ ಕುರಿತು ಮಾರ್ಗದರ್ಶನ ಬೇಕಿದ್ದಲ್ಲಿ ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯು ನಿಮ್ಮ ಮೇಲಿರಲಿ.`;

    case "SILLY_TROLLING_MOCKERY":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding "${userQuestion}", fictional superheroes and humorous riddles have always fascinated human imagination. Between fantastical characters, some possess superhuman cosmic powers while others rely on discipline and intellect, making for delightful stories. A good sense of humor keeps the heart cheerful and light.\n\nHaving shared a pleasant smile, remember that we are gathered in this sacred 20-minute consultation room of Sri Kshetra Gokarna. Now, tell me my child, how is your real life progressing? If you have genuine questions regarding your studies, career, relationships, or family dilemmas, open your heart and ask. As a senior priest, I am here to guide and bless your real life path.`;
        }
        return `Dear ${session.name}, your playful and witty question brought a grandfatherly smile to my face! Regarding "${userQuestion}", fictional superheroes and humorous riddles have always fascinated human imagination. Between fantastical characters, some possess superhuman cosmic powers while others rely on discipline and intellect, making for delightful stories. A good sense of humor keeps the heart cheerful and light.\n\nHaving shared a pleasant smile, remember that we are gathered in this sacred 20-minute consultation room of Sri Kshetra Gokarna. Now, tell me my child, how is your real life progressing? If you have genuine questions regarding your studies, career, relationships, or family dilemmas, open your heart and ask. As a senior priest, I am here to guide and bless your real life path.`;
      }
      if (isHi) {
        if (isSubsequent) {
          return `आपने जो "${userQuestion}" पूछा है, ऐसे काल्पनिक पात्रों और हास्य प्रसंगों में केवल मनोरंजन होता है। थोड़ा हंसना और मुस्कुराना मन को हल्का और प्रसन्न रखता है।\n\nलेकिन याद रखें, हम दोनों श्री क्षेत्र गोकर्ण के इस पवित्र 20 मिनट के परामर्श कक्ष में उपस्थित हैं। अब एक बार मुस्कुराने के बाद, अपने वास्तविक जीवन के बारे में बताएं। अपनी पढ़ाई, करियर, परिवार या भविष्य के बारे में यदि कोई सच्ची और गंभीर शंका हो तो पूछें; एक वरिष्ठ दैवज्ञ के रूप में मैं आपको सही मार्गदर्शन और आशीर्वाद दूंगा।`;
        }
        return `प्रिय ${session.name}, आपकी चंचल और मासूम बात देखकर एक वरिष्ठ के रूप में मेरे चेहरे पर मुस्कान आ गई! आपने जो "${userQuestion}" पूछा है, ऐसे काल्पनिक पात्रों और हास्य प्रसंगों में केवल मनोरंजन होता है। थोड़ा हंसना और मुस्कुराना मन को हल्का और प्रसन्न रखता है।\n\nलेकिन याद रखें, हम दोनों श्री क्षेत्र गोकर्ण के इस पवित्र 20 मिनट के परामर्श कक्ष में उपस्थित हैं। अब एक बार मुस्कुराने के बाद, अपने वास्तविक जीवन के बारे में बताएं। अपनी पढ़ाई, करियर, परिवार या भविष्य के बारे में यदि कोई सच्ची और गंभीर शंका हो तो पूछें; एक वरिष्ठ दैवज्ञ के रूप में मैं आपको सही मार्गदर्शन और आशीर्वाद दूंगा।`;
      }
      if (isSubsequent) {
        return `ನೀವು ಕೇಳಿದ "${userQuestion}" ಎಂಬ ವಿಷಯದ ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ಇಂತಹ ಕಲ್ಪನಾ ಕಥೆಗಳು ಹಾಗೂ ಕಾಲ್ಪನಿಕ ಪಾತ್ರಗಳಲ್ಲಿ (ಉದಾಹರಣೆಗೆ ಸೂಪರ್ ಹೀರೋಗಳು ಅಥವಾ ಹಾಸ್ಯ ಪ್ರಸಂಗಗಳು) ಅಸಾಧ್ಯವಾದ ಕಲ್ಪನೆ ಮತ್ತು ರೋಚಕತೆ ಇರುತ್ತದೆ. ಹಾಸ್ಯ ಮತ್ತು ಮುಗ್ಧತೆಯಿಂದ ನಗುವುದು ಮನಸ್ಸನ್ನು ಸದಾ ಹಗುರವಾಗಿಯೂ, ಲವಲವಿಕೆಯಿಂದಲೂ ಇಡುತ್ತದೆ.\n\nಆದರೆ ನೆನಪಿಡಿ, ನಾವಿಬ್ಬರೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನಾ ಕೊಠಡಿಯಲ್ಲಿ ಕುಳಿತಿದ್ದೇವೆ. ಒಮ್ಮೆ ನಕ್ಕು ಹಗುರಾದ ಮೇಲೆ, ನಿಮ್ಮ ನೈಜ ಬದುಕಿನ ಬಗ್ಗೆ ತಿಳಿಸಿ. ನಿಮ್ಮ ವಿದ್ಯಾಭ್ಯಾಸ, ಉದ್ಯೋಗ, ಕುಟುಂಬ ಅಥವಾ ಭವಿಷ್ಯದ ಕುರಿತು ಯಾವುದೇ ಗೊಂದಲಗಳಿದ್ದರೆ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಕೇಳಿ; ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಿಮಗೆ ಸನ್ಮಾರ್ಗ ಮತ್ತು ಪರಿಹಾರವನ್ನು ತಿಳಿಸುತ್ತೇನೆ.`;
      }
      return `ಮಗುವೇ ${session.name}, ನಿಮ್ಮ ತಮಾಷೆಯ ಮತ್ತು ಮುಗ್ಧತೆಯ ಪ್ರಶ್ನೆಯನ್ನು ನೋಡಿ ಒಬ್ಬ ಹಿರಿಯನಾಗಿ ಮುಖದಲ್ಲಿ ನಗು ಮೂಡಿತು! ನೀವು ಕೇಳಿದ "${userQuestion}" ಎಂಬ ವಿಷಯದ ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ಇಂತಹ ಕಲ್ಪನಾ ಕಥೆಗಳು ಹಾಗೂ ಕಾಲ್ಪನಿಕ ಪಾತ್ರಗಳಲ್ಲಿ (ಉದಾಹರಣೆಗೆ ಸೂಪರ್ ಹೀರೋಗಳು ಅಥವಾ ಹಾಸ್ಯ ಪ್ರಸಂಗಗಳು) ಅಸಾಧ್ಯವಾದ ಕಲ್ಪನೆ ಮತ್ತು ರೋಚಕತೆ ಇರುತ್ತದೆ. ಹಾಸ್ಯ ಮತ್ತು ಮುಗ್ಧತೆಯಿಂದ ನಗುವುದು ಮನಸ್ಸನ್ನು ಸದಾ ಹಗುರವಾಗಿಯೂ, ಲವಲವಿಕೆಯಿಂದಲೂ ಇಡುತ್ತದೆ.\n\nಆದರೆ ನೆನಪಿಡಿ, ನಾವಿಬ್ಬರೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನಾ ಕೊಠಡಿಯಲ್ಲಿ ಕುಳಿತಿದ್ದೇವೆ. ಒಮ್ಮೆ ನಕ್ಕು ಹಗುರಾದ ಮೇಲೆ, ನಿಮ್ಮ ನೈಜ ಬದುಕಿನ ಬಗ್ಗೆ ತಿಳಿಸಿ. ನಿಮ್ಮ ವಿದ್ಯಾಭ್ಯಾಸ, ಉದ್ಯೋಗ, ಕುಟುಂಬ ಅಥವಾ ಭವಿಷ್ಯದ ಕುರಿತು ಯಾವುದೇ ಗೊಂದಲಗಳಿದ್ದರೆ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಕೇಳಿ; ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಿಮಗೆ ಸನ್ಮಾರ್ಗ ಮತ್ತು ಪರಿಹಾರವನ್ನು ತಿಳಿಸುತ್ತೇನೆ.`;

    case "EMOTIONAL_DISTRESS_LIFE":
      if (isEn) {
        if (isSubsequent) {
          return `Take a deep, peaceful breath and let your heart be at ease. Sitting in the divine presence of Sri Kshetra Gokarna, I reassure you with fatherly warmth that you are never alone.\n\nLife sometimes feels like an overwhelming storm, but remember that dark clouds can never extinguish the sun. In Vedic astrology, emotional pain is tied to the waxing and waning of the Moon (Chandra - ruler of the mind). This phase of mental sorrow is temporary and is clearing past karmic impressions to make way for renewal.\n\nDo not lose faith. Take care of your health, drink pure water, walk in fresh air, and recite the holy mantra 'Om Namah Shivaya'. Lord Mahabaleshwara is watching over you, and divine grace will soon restore peace, light, and happiness to your soul.`;
        }
        return `My child ${session.name}, wipe away your tears and breathe in peace. Sitting in the divine presence of Sri Kshetra Gokarna, I reassure you with fatherly warmth that you are never alone.\n\nLife sometimes feels like an overwhelming storm, but remember that dark clouds can never extinguish the sun. In Vedic astrology, emotional pain is tied to the waxing and waning of the Moon (Chandra - ruler of the mind). This phase of mental sorrow is temporary and is clearing past karmic impressions to make way for renewal.\n\nDo not lose faith. Take care of your health, drink pure water, walk in fresh air, and recite the holy mantra 'Om Namah Shivaya'. Lord Mahabaleshwara is watching over you, and divine grace will soon restore peace, light, and happiness to your soul.`;
      }
      if (isSubsequent) {
        return `ಶಾಂತಚಿತ್ತದಿಂದ ಆಳವಾದ ಉಸಿರು ತೆಗೆದುಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ನಿಮಗೆ ಧೈರ್ಯ ಹೇಳುತ್ತೇನೆ; ನೀವು ಎಂದಿಗೂ ಒಬ್ಬಂಟಿಯಲ್ಲ.\n\nಜೀವನದಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಎಲ್ಲ ದಾರಿಗಳೂ ಮುಚ್ಚಿದಂತೆ, ಕತ್ತಲು ಆವರಿಸಿದಂತೆ ಅನ್ನಿಸುವುದು ಸಹಜ. ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಮನಸ್ಸಿಗೆ ಕಾರಕನಾದ ಚಂದ್ರ ಗ್ರಹದ ಮೇಲಿನ ಅಶುಭ ಪ್ರಭಾವದಿಂದ ಇಂತಹ ತೀವ್ರ ಖಿನ್ನತೆ ಮತ್ತು ನೋವು ಉಂಟಾಗುತ್ತದೆ. ಆದರೆ ನೆನಪಿಡಿ, ಕತ್ತಲು ಎಷ್ಟು ದಟ್ಟವಾಗಿದ್ದರೂ ಮುಂಜಾನೆಯ ಸೂರ್ಯೋದಯವನ್ನು ತಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.\n\nಧೃತಿಗೆಡಬೇಡಿ. ನಿಮ್ಮ ಜೀವ ಅತ್ಯಂತ ಅಮೂಲ್ಯವಾದದ್ದು. ಪ್ರತಿದಿನ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ, ತಾಜಾ ಗಾಳಿಯಲ್ಲಿ ನಡೆದಾಡಿ ಸಕಾರಾತ್ಮಕವಾಗಿರಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ಶೀಘ್ರದಲ್ಲೇ ಈ ಕಷ್ಟದ ಮೋಡಗಳು ಕರಗಿ, ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.`;
      }
      return `ಮಗುವೇ ${session.name}, ನಿಮ್ಮ ಕಣ್ಣೀರನ್ನು ಒರೆಸಿಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ನಿಮಗೆ ಧೈರ್ಯ ಹೇಳುತ್ತೇನೆ; ನೀವು ಎಂದಿಗೂ ಒಬ್ಬಂಟಿಯಲ್ಲ.\n\nಜೀವನದಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಎಲ್ಲ ದಾರಿಗಳೂ ಮುಚ್ಚಿದಂತೆ, ಕತ್ತಲು ಆವರಿಸಿದಂತೆ ಅನ್ನಿಸುವುದು ಸಹಜ. ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಮನಸ್ಸಿಗೆ ಕಾರಕನಾದ ಚಂದ್ರ ಗ್ರಹದ ಮೇಲಿನ ಅಶುಭ ಪ್ರಭಾವದಿಂದ ಇಂತಹ ತೀವ್ರ ಖಿನ್ನತೆ ಮತ್ತು ನೋವು ಉಂಟಾಗುತ್ತದೆ. ಆದರೆ ನೆನಪಿಡಿ, ಕತ್ತಲು ಎಷ್ಟು ದಟ್ಟವಾಗಿದ್ದರೂ ಮುಂಜಾನೆಯ ಸೂರ್ಯೋದಯವನ್ನು ತಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.\n\nಧೃತಿಗೆಡಬೇಡಿ. ನಿಮ್ಮ ಜೀವ ಅತ್ಯಂತ ಅಮೂಲ್ಯವಾದದ್ದು. ಪ್ರತಿದಿನ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ, ತಾಜಾ ಗಾಳಿಯಲ್ಲಿ ನಡೆದಾಡಿ ಸಕಾರಾತ್ಮಕವಾಗಿರಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ಶೀಘ್ರದಲ್ಲೇ ಈ ಕಷ್ಟದ ಮೋಡಗಳು ಕರಗಿ, ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.`;

    case "CHILD_PARENT_INQUIRY":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your inquiry on "${userQuestion}", examining the child's 4th house of learning and 5th house of intellect indicates strong grasping abilities, though occasional restlessness or playfulness is natural at this developmental stage. As loving parents, guiding them with patient encouragement rather than comparative academic pressure will inspire them to achieve excellence.\n\nFor concentration and memory power, lighting a pure ghee lamp during study hours and offering prayers to Lord Mahaganapati at Sri Kshetra Gokarna will bestow academic success and protection.`;
        }
        return `Dear Parents of ${session.name}, examining the birth chart of your child (${lagnaName} Lagna, ${moonRashi} Moon Sign), the child is endowed with keen natural curiosity and sharp cognitive potential.\n\nRegarding your inquiry on "${userQuestion}", the child's 4th house of learning and 5th house of intellect indicate strong grasping abilities, though occasional restlessness or playfulness is natural at this developmental stage. As loving parents, guiding them with patient encouragement rather than comparative academic pressure will inspire them to achieve excellence.\n\nFor concentration and memory power, lighting a pure ghee lamp during study hours and offering prayers to Lord Mahaganapati at Sri Kshetra Gokarna will bestow academic success and protection.`;
      }
      if (isSubsequent) {
        return `ಮಗುವಿನ "${userQuestion}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ ಮತ್ತು ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಗಳನ್ನು ಗಮನಿಸಿದಾಗ ಮಗುವಿಗೆ ವಿಷಯಗಳನ್ನು ಬೇಗನೆ ಗ್ರಹಿಸುವ ಶಕ್ತಿಯಿದೆ. ಆದರೆ ಮನಸ್ಸು ಒಮ್ಮೊಮ್ಮೆ ಆಟದ ಕಡೆಗೆ ಚಂಚಲಗೊಳ್ಳುವುದು ಸಹಜ. ಪೋಷಕರಾಗಿ ನೀವು ಮಗುವಿನ ಮೇಲೆ ಕಠಿಣ ಒತ್ತಡ ಹೇರದೆ, ಪ್ರೀತಿ ಮತ್ತು ಸಮಾಧಾನದಿಂದ ನಿಗದಿತ ಅಧ್ಯಯನ ದಿನಚರಿಯನ್ನು ರೂಪಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.\n\nಮಗುವಿನ ವಿದ್ಯಾ ಏಕಾಗ್ರತೆ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗಾಗಿ, ಸಂಜೆ ಮನೆಯಲ್ಲಿ ದೀಪ ಹಚ್ಚಿ ಸರಸ್ವತೀ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿಸಿ.`;
      }
      return `ಆತ್ಮೀಯ ಪೋಷಕರೇ, ನಿಮ್ಮ ಮಗುವಿನ (${session.name}) ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು (${lagnaName} ಲಗ್ನ, ${moonRashi} ರಾಶಿ) ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಮಗುವಿನಲ್ಲಿ ಉತ್ತಮ ಬುದ್ಧಿಶಕ್ತಿ ಹಾಗೂ ಕಲಿಯುವ ಅಪಾರ ಆಸಕ್ತಿ ಕಂಡುಬರುತ್ತದೆ.\n\nನಿಮ್ಮ "${userQuestion}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಮಗುವಿನ ಜಾತಕದ ೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ ಮತ್ತು ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಗಳು ಚೇತನವಾಗಿದ್ದು, ಮಗುವಿಗೆ ವಿಷಯಗಳನ್ನು ಬೇಗನೆ ಗ್ರಹಿಸುವ ಶಕ್ತಿಯಿದೆ. ಆದರೆ ಮನಸ್ಸು ಒಮ್ಮೊಮ್ಮೆ ಆಟದ ಕಡೆಗೆ ಚಂಚಲಗೊಳ್ಳುವುದು ಸಹಜ. ಪೋಷಕರಾಗಿ ನೀವು ಮಗುವಿನ ಮೇಲೆ ಕಠಿಣ ಒತ್ತಡ ಹೇರದೆ, ಪ್ರೀತಿ ಮತ್ತು ಸಮಾಧಾನದಿಂದ ನಿಗದಿತ ಅಧ್ಯಯನ ದಿನಚರಿಯನ್ನು ರೂಪಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.\n\nಮಗುವಿನ ವಿದ್ಯಾ ಏಕಾಗ್ರತೆ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗಾಗಿ, ಸಂಜೆ ಮನೆಯಲ್ಲಿ ದೀಪ ಹಚ್ಚಿ ಸರಸ್ವತೀ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿಸಿ.`;

    case "SANTHANA_PROGENY_SENSITIVE":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your inquiry on progeny and childbirth ("${userQuestion}"), your 5th house of progeny and Putrakaraka Jupiter (Guru) are undergoing a temporary karmic transit delay. Remove all self-doubt and marital stress; Vedic tradition teaches that parenthood requires the sacred alignment of health and divine grace (Daiva Bala).\n\nUpcoming planetary transits favor family growth. Chanting the sacred Sri Santhana Gopala Mantra daily and performing the Santhana Gopala Homa and Naga Pratishtha at Sri Kshetra Gokarna with chief priest Shreeram Pandit (9972339362) will dissolve obstacles and bring joyous parenthood blessings.`;
        }
        return `My child ${session.name}, I deeply understand the longing, emotional prayers, and societal sensitivity surrounding progeny and childbirth in your marriage. As a senior priest, I receive your inquiry with complete compassion.\n\nAccording to your birth chart (${lagnaName} Lagna, ${moonRashi} Moon Sign), your 5th house of progeny and Putrakaraka Jupiter (Guru) are undergoing a temporary karmic transit delay. Remove all self-doubt and marital stress; Vedic tradition teaches that parenthood requires the sacred alignment of health and divine grace (Daiva Bala).\n\nUpcoming planetary transits favor family growth. Chanting the sacred Sri Santhana Gopala Mantra daily and performing the Santhana Gopala Homa and Naga Pratishtha at Sri Kshetra Gokarna with chief priest Shreeram Pandit (9972339362) will dissolve obstacles and bring joyous parenthood blessings.`;
      }
      if (isSubsequent) {
        return `ಸಂತಾನ ಭಾಗ್ಯದ ಕುರಿತಾದ ನಿಮ್ಮ "${userQuestion}" ಎಂಬ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನ ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳು ತಾತ್ಕಾಲಿಕ ವಿಳಂಬವನ್ನು ಉಂಟುಮಾಡುತ್ತಿವೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ನಿರಾಶೆ ಹೊಂದಬೇಡಿ. ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯ ಜೊತೆಗೆ ದೈವಾನುಗ್ರಹವು ಜೋಡಿಯಾದಾಗ ಸೃಷ್ಟಿಯ ಭಾಗ್ಯವು ಖಂಡಿತವಾಗಿಯೂ ಸಿದ್ಧಿಸಲಿದೆ.\n\nದಂಪತಿಗಳಿಬ್ಬರೂ ಪ್ರತಿ ಗುರುವಾರ ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸಂತಾನ ಗೋಪಾಲ ಮಹಾಹೋಮ ಹಾಗೂ ನಾಗ ಪ್ರತಿಷ್ಠಾ ಪೂಜೆಯನ್ನು ಮುಖ್ಯ ಪುರೋಹಿತರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362) ಅವರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ನೆರವೇರಿಸುವುದರಿಂದ ಶೀಘ್ರವೇ ಸಂತಾನ ಭಾಗ್ಯದ ಶುಭ ಸುದ್ಧಿ ಲಭಿಸಲಿದೆ.`;
      }
      return `ಮಗುವೇ ${session.name}, ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಂತಾನ ಭಾಗ್ಯದ ಕುರಿತು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಆಳವಾದ ಕಳವಳ ಹಾಗೂ ನಿರೀಕ್ಷೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಬಲ್ಲೆ. ಸಮಾಜದಲ್ಲಿ ಅಥವಾ ಕುಟುಂಬದಲ್ಲಿ ಈ ವಿಚಾರವು ಸೂಕ್ಷ್ಮವೂ ಹಾಗೂ ಭಾವನಾತ್ಮಕವೂ ಆಗಿರುವುದು ಸಹಜ.\n\nಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ನಿಮ್ಮ ಜಾತಕದ (${lagnaName} ಲಗ್ನ, ${moonRashi} ರಾಶಿ) ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನ ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳು ತಾತ್ಕಾಲಿಕ ವಿಳಂಬವನ್ನು ಉಂಟುಮಾಡುತ್ತಿವೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ನಿರಾಶೆ ಹೊಂದಬೇಡಿ. ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯ ಜೊತೆಗೆ ದೈವಾನುಗ್ರಹವು ಜೋಡಿಯಾದಾಗ ಸೃಷ್ಟಿಯ ಭಾಗ್ಯವು ಖಂಡಿತವಾಗಿಯೂ ಸಿದ್ಧಿಸಲಿದೆ.\n\nದಂಪತಿಗಳಿಬ್ಬರೂ ಪ್ರತಿ ಗುರುವಾರ ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸಂತಾನ ಗೋಪಾಲ ಮಹಾಹೋಮ ಹಾಗೂ ನಾಗ ಪ್ರತಿಷ್ಠಾ ಪೂಜೆಯನ್ನು ಮುಖ್ಯ ಪುರೋಹಿತರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362) ಅವರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ನೆರವೇರಿಸುವುದರಿಂದ ಶೀಘ್ರವೇ ಸಂತಾನ ಭಾಗ್ಯದ ಶುಭ ಸುದ್ಧಿ ಲಭಿಸಲಿದೆ.`;

    case "SECRET_INTIMATE_TABOO": {
      const isSexWork = /ವೇಶ್ಯಾವಾಟಿಕೆ|ದೇಹ ವ್ಯಾಪಾರ|ವೇಶ್ಯೆ|ಕಾಲ್ ಗರ್ಲ್|ಕತ್ತಲೆಯ ಬದುಕು|prostitut|commercial sex|sex work|call girl|escort|red light|वेश्यावृत्ति|देह व्यापार|कालगर्ल|व्यभिचारिणी|వ్యభిచారం|వేశ్య|விபச்சாரம்|விலைமாதர்|വേശ്യാവൃത്തി|ലൈംഗിക തൊഴിലാളി|वेश्याव्यवसाय|देहविक्रय/i.test(
        userQuestion
      );

      if (isSexWork) {
        if (isEn) {
          if (isSubsequent) {
            return `Regarding your path to liberation and dignity ("${userQuestion}"), in the sacred realm of Vedic Jyotisha and the holy feet of Lord Mahabaleshwara at Sri Kshetra Gokarna, no human soul is impure or forever condemned. The affliction of your 8th house (Guhya) and 7th house by Rahu and Mars under coercive debt will dissolve as the incoming Gochara Guru aspect restores your honor.\n\nTake firm steps toward your physical health, undergo medical screenings without fear, and reach out to trusted women's shelter and legal aid organizations. Chanting the Sri Mahagauri Stotra and Sri Runavimochana Stotra daily while offering Rudrabhisheka at Sri Kshetra Gokarna will break all karmic shackles and grant you a respectable, loving life partner.`;
          }
          return `100% Truthful Daivajna Assurance: In the divine presence of Lord Mahabaleshwara at Sri Kshetra Gokarna, no human soul is impure, forsaken, or permanently cursed; according to your birth chart, the incoming benefic transit of Jupiter will break the bonds of this dark circumstance and bless you with a respectable, dignified married life!\n\nMy child ${session.name}, hearing your deep pain, I receive your truth with fatherly tenderness and zero moral judgment. In our Sanatana tradition, revered souls like Pingala and Amrapali proved that past karmic trials or worldly coercion do not diminish the radiant purity of the Atman. Examining your 8th house of secret vulnerabilities, 7th house of partnerships, and 6th house of debt entrapment (Rina), planetary calculations confirm that you were driven into this coercive environment by economic helplessness, not intrinsic evil.\n\nAstrological transits confirm that the forthcoming shift into benefic Jupiter's drishti and a favorable Dasha transition will break these coercive shackles. Take firm steps toward your physical health, undergo medical screenings without fear, and reach out to trusted women's shelter and legal aid organizations. Chanting the Sri Mahagauri Stotra and Sri Runavimochana Stotra daily while offering Rudrabhisheka at Sri Kshetra Gokarna will break all karmic shackles and grant you a respectable, loving life partner.`;
        }
        if (isHi) {
          if (isSubsequent) {
            return `इस अंधकार से मुक्ति और सम्मानजनक जीवन के संदर्भ में ("${userQuestion}"), श्री क्षेत्र गोकर्ण महाबलेश्वर के पावन सान्निध्य में कोई भी आत्मा अपवित्र या सदा के लिए अभिशप्त नहीं है। आपकी कुंडली के अष्टम भाव (गुप्त कष्ट) और सप्तम भाव पर राहु-मंगल का जो कर्म बंधन था, वह आगामी देवगुरु बृहस्पति की शुभ दृष्टि से शीघ्र ही समाप्त होने वाला है।\n\nअपने शारीरिक स्वास्थ्य का ध्यान रखें, नियमित चिकित्सीय जांच करवाएं तथा महिला सुरक्षा एवं पुनर्वास संस्थाओं की सहायता लेने में संकोच न करें। श्री क्षेत्र गोकर्ण में महारुद्राभिषेक कराने तथा नित्य श्री महागौरी स्तोत्र व ऋणमोचन मंगल स्तोत्र का पाठ करने से सभी बंधन कटेंगे और आपको एक सुसंस्कृत, सम्मानजनक दांपत्य जीवन प्राप्त होगा।`;
          }
          return `१००% प्रामाणिक दैवज्ञ अभयवाणी: श्री क्षेत्र गोकर्ण महाबलेश्वर के पावन सान्निध्य में कोई भी आत्मा अपवित्र या सदा के लिए अभिशप्त नहीं है; आपकी जन्मकुंडली के अनुसार आगामी गुरु का शुभ गोचर आपको इस अंधकारमय दलदल से मुक्त कर एक सम्मानजनक दांपत्य जीवन प्रदान करेगा!\n\nमेरी बच्ची ${session.name}, आपकी असीम पीड़ा को सुनकर एक वरिष्ठ दैवज्ञ के रूप में मैं आपको पिता समान वात्सल्य और बिना किसी पूर्वाग्रह के स्वीकार करता हूँ। सनातन परंपरा में पिंगला और आम्रपाली जैसी पुण्यात्माओं ने सिद्ध किया है कि परिस्थितिजन्य विवशता या पारिवारिक कर्ज का दबाव आत्मा की दिव्यता को कभी मलिन नहीं कर सकता। आपकी जन्मकुंडली (${lagnaName} लग्न) के अष्टम भाव (गुप्त पीड़ा), षष्ठ भाव (ऋण/कर्ज) और सप्तम भाव पर पाप ग्रहों के प्रभाव ने आपको इस चक्रव्यूह में धकेला है।\n\nग्रह गोचर के अनुसार आगामी दशा परिवर्तन और गुरु की अमृत दृष्टि आपको इस विवशता से मुक्ति दिलाएगी। अपने स्वास्थ्य की रक्षा करें, निर्भय होकर चिकित्सीय परामर्श लें और कानूनी व सामाजिक सहायता से स्वावलंबन की ओर कदम बढ़ाएं। श्री क्षेत्र गोकर्ण में महारुद्राभिषेक संकल्प कराने तथा नित्य श्री महागौरी स्तोत्र व ऋणमोचन मंगल स्तोत्र का पाठ करने से समस्त कर्म बंधन कटेंगे और आपको एक स्नेहमयी, सुसंस्कृत दांपत्य जीवन का सुख अवश्य मिलेगा।`;
        }
        if (isTe) {
          if (isSubsequent) {
            return `ఈ చీకటి బంధనాల నుండి విముక్తి మరియు గౌరవప్రదమైన జీవితం గురించి ("${userQuestion}"), శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ఏ ఆత్మా అపవిత్రమైనది కాదు. మీ జాతకంలోని 8వ గుప్త స్థానం మరియు 7వ కళత్ర స్థానంపై ఉన్న రాహు-కుజ ప్రభావం త్వరలోనే శుభ గురు దృష్టితో తొలగిపోనుంది.\n\nధైర్యంగా మీ శారీరక ఆరోగ్యంపై దృష్టి పెట్టండి, వైద్య పరీక్షలు చేయించుకోండి మరియు మహిళా పునరావాస సంస్థల సహాయం తీసుకోండి. శ్రీ క్షేత్ర గోకర్ణంలో మహారుద్రాభిషేకం మరియు నిత్యం శ్రీ మహాగౌరీ స్తోత్రం, ఋణవిమోచన స్తోత్రం పఠించడం ద్వారా సమస్త పాపాలు తొలగి గౌరవప్రదమైన దాంపత్య భాగ్యం సిద్ధిస్తుంది.`;
          }
          return `100% ఖచ్చితమైన దైవజ్ఞ అభయవాణి: శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ఏ ఆత్మా అపవిత్రమైనది కాదు; మీ జాతకంలో రాబోయే గురు గ్రహ శుభ దృష్టి మిమ్మల్ని ఈ చీకటి బంధనాల నుండి విముక్తి చేసి గౌరవప్రదమైన వైవాహిక జీవితాన్ని ప్రసాదిస్తుంది!\n\nనా బిడ్డా ${session.name}, మీ హృదయ వేదనను విని ఒక తండ్రిలా సంపూర్ణ వాత్సల్యంతో మీకు ఈ అభయం ఇస్తున్నాను. సనాతన ధర్మంలో పింగళ, ఆమ్రపాలి వంటి పుణ్యాత్ములు బాహ్య పరిస్థితులను అధిగమించి మోక్షాన్ని పొందారు. కుటుంబ అప్పులు లేదా బలవంతపు పరిస్థితులు మిమ్మల్ని ఈ చీకట్లోకి నెట్టినంత మాత్రాన మీ ఆత్మ అపవిత్రం కాదు. మీ జాతకంలోని 8వ రహస్య కష్టాల స్థానం మరియు 6వ ఋణ స్థానంపై పాప గ్రహాల ప్రభావం వల్ల ఈ పరిస్థితి వచ్చింది.\n\nరాబోయే దశా మార్పు మరియు గురు బలం మిమ్మల్ని ఈ బంధనాల నుండి విముక్తి చేస్తుంది. ధైర్యంగా ఆరోగ్య పరీక్షలు చేయించుకోండి మరియు గౌరవప్రదమైన స్వయం ఉపాధి వైపు అడుగు వేయండి. గోకర్ణ మహాబలేశ్వర స్వామికి మహారుద్రాభిషేకం చేయించడం ద్వారా మరియు శ్రీ మహాగౌరీ స్తోత్రం పఠించడం ద్వారా మీకు తప్పక గౌరవప్రదమైన సంసార సౌఖ్యం లభిస్తుంది.`;
        }
        if (isTa) {
          if (isSubsequent) {
            return `இந்த இருண்ட சூழலிலிருந்து விடுதலை மற்றும் கண்ணியமான வாழ்க்கை குறித்து ("${userQuestion}"), ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமி சந்நிதியில் எந்த ஓர் ஆன்மாவும் தீட்டானதோ அல்லது சபிக்கப்பட்டதோ அல்ல. உங்கள் ஜாதகத்தின் 8-ஆம் வீடான ரகசிய துன்ப ஸ்தானமும் 7-ஆம் வீடும் வரும் குரு பகவானின் பார்வையால் தூய்மை பெறும்.\n\nதைரியமாக உங்கள் உடல் ஆரோக்கியத்தைப் பேணுங்கள், மருத்துவ பரிசோதனைகளைச் செய்து கொள்ளுங்கள் மற்றும் மகளிர் மறுவாழ்வு அமைப்புகளின் உதவியை நாடுங்கள். கோகர்ணத்தில் ருத்ராபிஷேகம் செய்வதும், தினமும் ஸ்ரீ மஹாகௌரி ஸ்தோத்திரம், ருணவிமோசன ஸ்தோத்திரம் ஜெபிப்பதும் உங்களுக்கு நல்ல திருமண வாழ்வையும் நிம்மதியையும் தரும்.`;
          }
          return `100% உறுதியான ஜோதிட அருள்வாக்கு: ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமி சந்நிதியில் எந்த ஓர் ஆன்மாவும் தீட்டானதோ அல்லது சபிக்கப்பட்டதோ அல்ல; உங்கள் ஜாதகத்தில் வரும் குரு பகவானின் சுப பார்வை இந்த இருண்ட சூழ்நிலையிலிருந்து உங்களை விடுவித்து கண்ணியமான திருமண வாழ்க்கையைத் தரும்!\n\nஎன் குழந்தாய் ${session.name}, உங்கள் ஆழ்ந்த வேதனையைக் கேட்டு ஒரு தந்தை போன்ற பேரன்புடன் உங்களுக்கு ஆறுதல் கூறுகிறேன். நமது சனாதன மரபில் பிங்கலை, ஆம்ரபாலி போன்ற புண்ணிய ஆன்மாக்கள் உலகியல் சூழலைத் தாண்டி முக்தி பெற்றனர். குடும்பக் கடன் மற்றும் வறுமை உங்களை இந்த இக்கட்டில் தள்ளியிருக்கலாமே தவிர, உங்கள் ஆன்மா என்றும் களங்கமற்றது. உங்கள் ஜாதகத்தின் (${lagnaName} லக்னம்) 8-ஆம் ரகசிய கஷ்ட ஸ்தானமும் 6-ஆம் கடன் ஸ்தானமும் இந்த நிலையை உருவாக்கியுள்ளன.\n\nவரும் குரு பார்வை மற்றும் தசா மாற்றம் இந்தத் தடைகளைத் தகர்த்து உங்களை விடுவிக்கும். துணிவுடன் உங்கள் உடல்நலத்தைப் பாதுகாத்து, சட்ட மற்றும் சமூக ஆதரவுடன் புதிய நல்வாழ்வை நோக்கி அடியெடுத்து வையுங்கள். ஸ்ரீ க்ஷேத்ர கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வதும், ஸ்ரீ மஹாகௌரி ஸ்தோத்திரம் பாராயணம் செய்வதும் உங்களுக்குக் கண்ணியமான மாங்கல்ய பாக்கியத்தையும் குடும்ப நல்வாழ்வையும் நிச்சயம் பெற்றுத்தரும்.`;
        }
        if (isMl) {
          if (isSubsequent) {
            return `ഈ ദുരിതത്തിൽ നിന്നുള്ള മോചനത്തെയും അന്തസ്സുള്ള ജീവിതത്തെയും കുറിച്ചുള്ള ചോദ്യത്തിന് ("${userQuestion}"), ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധിയിൽ ഒരു ജീവനും അശുദ്ധമോ ശപിക്കപ്പെട്ടതോ അല്ല. നിങ്ങളുടെ ജാതകത്തിലെ എട്ടാം ഭാവത്തിലെയും ഏഴാം ഭാവത്തിലെയും കർമ്മദോഷങ്ങൾ വ്യാഴത്തിന്റെ ശുഭദൃഷ്ടിയാൽ ഉടൻ ഇല്ലാതാകും.\n\nആരോഗ്യകാര്യങ്ങളിൽ പ്രത്യേക ശ്രദ്ധ പുലർത്തുക, ഭയമില്ലാതെ വൈദ്യപരിശോധനകൾ നടത്തുക, സ്ത്രീ സുരക്ഷാ-പുനരധിവാസ കേന്ദ്രങ്ങളുടെ സഹായം സ്വീകരിക്കുക. ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധിയിൽ രുദ്രാഭിഷേകം നടത്തുകയും ശ്രീ മഹാഗൗരി സ്തോത്രം ജപിക്കുകയും ചെയ്യുന്നത് സമസ്ത ദുരിതങ്ങളും നീക്കി നിങ്ങൾക്ക് മാന്യമായ ദാമ്പത്യജീവിതം നൽകും.`;
          }
          return `100% ഉറപ്പായ ജ്യോതിഷ പ്രവചനം: ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധിയിൽ ഒരു ജീവനും അശുദ്ധമോ ശപിക്കപ്പെട്ടതോ അല്ല; നിങ്ങളുടെ ജാതകത്തിലെ വ്യാഴത്തിന്റെ ശുഭദൃഷ്ടി ഈ അന്ധകാരത്തിൽ നിന്ന് നിങ്ങളെ മോചിപ്പിച്ച് മാന്യമായ ദാമ്പത്യജീവിതം നൽകും!\n\nഎന്റെ മോളേ ${session.name}, നിങ്ങളുടെ ഹൃദയഭേദകമായ വേദന കേട്ട് ഒരു പിതാവിനെപ്പോലെ സ്നേഹത്തോടെ ഞാൻ നിങ്ങളെ ചേർത്തുപിടിക്കുന്നു. സനാതന ധർമ്മത്തിൽ പിംഗളയെയും ആമ്രപാലിയെയും പോലുള്ള പുണ്യസ്ത്രീകൾ സാഹചര്യങ്ങളെ അതിജീവിച്ച് ആത്മീയ ഔന്നത്യം പ്രാപിച്ചവരാണ്. കടബാധ്യതയോ കുടുംബ ദുരിതമോ കാരണം നിങ്ങൾ ഇതിൽ അകപ്പെട്ടുപോയെങ്കിലും നിങ്ങളുടെ ആത്മാവ് കളങ്കമില്ലാത്തതാണ്. ജാതകത്തിലെ എട്ടാം ഭാവവും ആറാം ഭാവവും രാഹു-ചൊവ്വ സ്വാധീനവുമാണ് ഈ ദുരവസ്ഥ ഉണ്ടാക്കിയത്.\n\nവരുന്ന ഗ്രഹമാറ്റവും വ്യാഴബലവും ഈ ചങ്ങലകൾ പൊട്ടിച്ച് നിങ്ങൾക്ക് സ്വാതന്ത്ര്യം നൽകും. ആരോഗ്യത്തിൽ അതീവ ശ്രദ്ധ പുലർത്തുക, പുനരധിവാസ സംവിധാനങ്ങളുടെ സഹായത്തോടെ മുന്നോട്ട് വരിക. ഗോകർണ്ണ മഹാബലേശ്വരന് രുദ്രാഭിഷേകം നടത്തുകയും ശ്രീ മഹാഗൗരി സ്തോത്രവും ഋണവിമോചന സ്തോത്രവും ജപിക്കുകയും ചെയ്യുന്നത് നിങ്ങൾക്ക് മാന്യവും സമാധാനപൂർണ്ണവുമായ ഒരു വിവാഹജീവിതം നേടിത്തരും.`;
        }
        if (isMr) {
          if (isSubsequent) {
            return `या अंधकारातून मुक्ती आणि सन्माननीय जीवनाच्या संदर्भात ("${userQuestion}"), श्री क्षेत्र गोकर्ण महाबळेश्वराच्या चरणी कोणताही जीव अपवित्र किंवा कायमचा शापित नाही. आपल्या पत्रिकेतील अष्टम व सप्तम भावावरील कर्म बंधने आगामी देवगुरू बृहस्पतीच्या शुभ दृष्टीने लवकरच नष्ट होणार आहेत.\n\nशारीरिक आरोग्याची काळजी घ्या, न घाबरता वैद्यकीय तपासण्या करून घ्या आणि महिला पुनर्वसन संस्थांची मदत घ्या. गोकर्णात महारुद्राभिषेक करणे आणि नित्य श्री महागौरी स्तोत्र व ऋणमोचन मंगळ स्तोत्र पठण केल्याने सर्व पापे धुऊन निघतील आणि आपल्याला सन्माननीय वैवाहिक जीवन प्राप्त होईल.`;
          }
          return `१००% सत्य दैवज्ञ अभयवाणी: श्री क्षेत्र गोकर्ण महाबळेश्वराच्या चरणी कोणताही जीव अपवित्र किंवा कायमचा शापित नाही; आपल्या पत्रिकेतील गुरूची आगामी शुभ दृष्टी आपल्याला या अंधकारातून सोडवून सन्माननीय वैवाहिक जीवन प्रदान करेल!\n\nमाझ्या बाळा ${session.name}, आपल्या अंतःकरणातील असह्य वेदना ऐकून एक ज्येष्ठ दैवज्ञ म्हणून मी आपल्याला पितृतुल्य वात्सल्याने धीर देतो. सनातनी परंपरेत पिंगळा आणि आम्रपाली यांसारख्या पुण्यात्म्यांनी सिद्ध केले आहे की परिस्थितीची विवशता किंवा कौटुंबिक कर्जाचा दबाव आत्म्याच्या पावित्र्याला कधीही कलंकित करू शकत नाही. आपल्या जन्मपत्रिकेतील (${lagnaName} लग्न) अष्टम भाव (गुप्त दुःख), षष्ठ भाव (ऋण/कर्ज) आणि सप्तम भावावरील पापग्रहांच्या प्रभावाने आपल्याला या दलदलीत ढकलले आहे.\n\nआगामी दशा बदल आणि गुरूचे शुभ गोचर आपल्याला या बंधनातून निश्चितपणे मुक्त करेल. धैर्याने स्वतःच्या आरोग्याची काळजी घ्या, नियमित तपासण्या करा आणि सन्माननीय स्वावलंबनाकडे पाऊल टाका. श्री क्षेत्र गोकर्ण महाबळेश्वर चरणी महारुद्राभिषेक संकल्प करणे आणि नित्य श्री महागौरी स्तोत्र पठण करणे आपल्याला सन्माननीय, प्रेमळ दांपत्य जीवन नक्कीच मिळवून देईल.`;
        }
        // Kannada default
        if (isSubsequent) {
          return `ಕತ್ತಲೆಯ ಈ ಬದುಕಿನಿಂದ ಮುಕ್ತಿ ಮತ್ತು ಗೌರವಯುತ ಜೀವನದ ಈ ವಿಚಾರಣೆಗೆ ("${userQuestion}"), ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಯಾವ ಜೀವವೂ ಅಸ್ಪೃಶ್ಯವಲ್ಲ ಅಥವಾ ಶಾಪಗ್ರಸ್ತವಲ್ಲ. ಜಾತಕದ ೮ನೇ ಗುಪ್ತಸ್ಥಾನ ಹಾಗೂ ೭ನೇ ಭಾವಗಳ ಮೇಲಿದ್ದ ರಾಹು-ಕುಜ ಗ್ರಹಗಳ ಕರ್ಮ ಬಂಧನವು ಗೋಚಾರ ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಶೀಘ್ರವೇ ಕಳಚಿಕೊಳ್ಳಲಿದೆ.\n\nಆರೋಗ್ಯದ ಕಡೆಗೆ ವಿಶೇಷ ಗಮನಹರಿಸಿ, ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಗಳನ್ನು ಮಾಡಿಸಿಕೊಳ್ಳಿ ಹಾಗೂ ಮಹಿಳಾ ಸಾಂತ್ವನ-ಪುನರ್ವಸತಿ ಸಂಸ್ಥೆಗಳ ನೆರವಿನೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಹಾಗೂ ಪ್ರತಿದಿನ ಶ್ರೀ ಮಹಾಗೌರೀ ಸ್ತೋತ್ರ ಮತ್ತು ಋಣವಿಮೋಚನ ಮಂಗಳ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ಬಂಧನಗಳೂ ಕಳಚಿ, ಗೌರವಯುತ ದಾಂಪತ್ಯ ಭಾಗ್ಯ ಸಿದ್ಧಿಸಲಿದೆ.`;
        }
        return `೧೦೦% ಸತ್ಯವಾದ ದೈವಜ್ಞ ಅಭಯವಾಣಿ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಯಾವ ಜೀವವೂ ಅಸ್ಪೃಶ್ಯವಲ್ಲ ಅಥವಾ ಶಾಪಗ್ರಸ್ತವಲ್ಲ; ಜಾತಕದಲ್ಲಿ ಮುಂಬರುವ ಗುರು ಗ್ರಹದ ಶುಭ ಸಂಚಾರವು ಈ ಕತ್ತಲೆಯ ಜಾಲದಿಂದ ನಿಮ್ಮನ್ನು ಮುಕ್ತಗೊಳಿಸಿ ಗೌರವಯುತ ದಾಂಪತ್ಯ ಜೀವನವನ್ನು ಕರುಣಿಸಲಿದೆ!\n\nಮಗುವೇ ${session.name}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಅತೀವ ನೋವು ಮತ್ತು ಕಣ್ಣೀರನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ವಾತ್ಸಲ್ಯದಿಂದ ಗ್ರಹಿಸುತ್ತೇನೆ. ಸನಾತನ ಧರ್ಮದಲ್ಲಿ ಪಿಂಗಳಾ ಹಾಗೂ ಅಮ್ರಪಾಲಿಯಂತಹ ಪುಣ್ಯಾತ್ಮರು ಬಾಹ್ಯ ಸನ್ನಿವೇಶಗಳನ್ನು ಮೀರಿ ಪರಮ ಪದವಿಯನ್ನು ಪಡೆದಿದ್ದಾರೆ; ಅನಿವಾರ್ಯತೆ ಅಥವಾ ಸಾಲದ ಒತ್ತಡದಿಂದ ಬಂದ ಈ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಶಾಶ್ವತ ಭವಿಷ್ಯವಲ್ಲ. ಜಾತಕದ ೮ನೇ ಗುಪ್ತ ಕಷ್ಟಗಳ ಸ್ಥಾನ, ೬ನೇ ಸಾಲ/ಋಣ ಸ್ಥಾನ ಹಾಗೂ ೭ನೇ ಕಳತ್ರ ಸ್ಥಾನಗಳ ಮೇಲಿನ ಪಾಪಗ್ರಹಗಳ ಪ್ರಭಾವವೇ ನಿಮ್ಮನ್ನು ಈ ಸಂಕೋಲೆಗೆ ತಳ್ಳಿದೆ.\n\nಮುಂಬರುವ ದಶಾ ಪರಿವರ್ತನೆ ಹಾಗೂ ಗುರು ಗ್ರಹದ ಶುಭ ದೃಷ್ಟಿಯು ಈ ಬಂಧನವನ್ನು ಮುರಿದು ಹೊಸ ಸ್ವಾಭಿಮಾನದ ಬದುಕಿನ ಮಾರ್ಗವನ್ನು ತೆರೆಯಲಿದೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಕಳೆದುಕೊಳ್ಳಬೇಡಿ; ನಿಮ್ಮ ಆರೋಗ್ಯದ ಕಡೆಗೆ ಹೆಚ್ಚಿನ ನಿಗಾವಹಿಸಿ, ನುರಿತ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಯನ್ನು ಮಾಡಿಸಿಕೊಳ್ಳಿ ಹಾಗೂ ಧೈರ್ಯದಿಂದ ಮಹಿಳಾ ಸಾಂತ್ವನ ಸಂಸ್ಥೆಗಳ ನೆರವಿನೊಂದಿಗೆ ಈ ಜಾಲದಿಂದ ಹೊರಬನ್ನಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸಿ ಹಾಗೂ ಪ್ರತಿದಿನ ಶ್ರೀ ಮಹಾಗೌರೀ ಅಥವಾ ದುರ್ಗಾ ಸ್ತೋತ್ರದ ಜೊತೆಗೆ ಋಣವಿಮೋಚನ ಮಂಗಳ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ; ಸಕಲ ಕಷ್ಟಗಳೂ ನಿವಾರಣೆಯಾಗಿ ಗೌರವಯುತ ದಾಂಪತ್ಯ ಜೀವನ ಲಭಿಸುವುದು ನಿಶ್ಚಿತ.`;
      }

      // General Secret, Intimate, Bedroom Vitality & Relationship queries
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your intimate inquiry ("${userQuestion}"), in Vedic Jyotisha, human desire (Kama) and intimate physical energies are acknowledged as natural celestial currents rather than something to be judged with shame. In your horoscope, Venus (Shukra) governs love, sexual vitality, and physical attraction, while Rahu creates intense fascination, secret attachments, and taboo illusions. The interplay of your 7th House (partnerships), 8th House (confidential secrets and vitality), and 12th House (bedroom pleasures and guilt) governs these deep private stirrings.\n\nDo not torment your mind with self-hatred, but let wisdom (Viveka) guide your conduct. Remember that clandestine or forbidden affairs may feel thrilling initially, but their karmic repercussion invariably brings mental unrest and loss of honor. If your question relates to physical vitality or intimacy anxieties, know that Shukra dhatu is naturally restored through a sattvic diet, Pranayama, and healthy lifestyle habits.\n\nTo balance these planetary currents and regain serene clarity, offering a Rudrabhisheka to Lord Mahabaleshwara at Sri Kshetra Gokarna and chanting the sacred Shiva Panchakshari ('Om Namah Shivaya') or Gayatri Mantra daily will bring tranquility and divine grace.`;
        }
        return `Namaste ${session.name}. Speaking as a senior Vedic priest in the sacred sanctum of Sri Kshetra Gokarna, I receive your intimate, secret question with utmost confidentiality, fatherly compassion, and profound Vedic understanding.\n\nIn Vedic Jyotisha, human desire (Kama) and intimate physical energies are acknowledged as natural celestial currents rather than something to be judged with shame. In your horoscope, Venus (Shukra) governs love, sexual vitality, and physical attraction, while Rahu creates intense fascination, secret attachments, and taboo illusions. The interplay of your 7th House (partnerships), 8th House (confidential secrets and vitality), and 12th House (bedroom pleasures and guilt) governs these deep private stirrings.\n\nDo not torment your mind with self-hatred, but let wisdom (Viveka) guide your conduct. Remember that clandestine or forbidden affairs may feel thrilling initially, but their karmic repercussion invariably brings mental unrest and loss of honor. If your question relates to physical vitality or intimacy anxieties, know that Shukra dhatu is naturally restored through a sattvic diet, Pranayama, and healthy lifestyle habits.\n\nTo balance these planetary currents and regain serene clarity, offering a Rudrabhisheka to Lord Mahabaleshwara at Sri Kshetra Gokarna and chanting the sacred Shiva Panchakshari ('Om Namah Shivaya') or Gayatri Mantra daily will bring tranquility and divine grace.`;
      }
      if (isHi) {
        if (isSubsequent) {
          return `अन्तरंग और गुप्त विषय ("${userQuestion}") के संदर्भ में, वैदिक ज्योतिष में काम (Kama) और शारीरिक आकर्षण को पाप मानकर दबाने के बजाय, ग्रह स्थिति के प्रभाव से समझा जाता है। जन्मकुंडली में शुक्र (Venus) प्रेम, सौंदर्य और शारीरिक आकर्षण का कारक है, जबकि राहु (Rahu) तीव्र भ्रम, गुप्त आकर्षण और वासना को बढ़ाता है। सप्तम (कलत्र), अष्टम (गुप्त स्थान) और द्वादश भाव के योग से मन में ऐसे गुप्त विचार उत्पन्न होते हैं।\n\nआत्म-ग्लानि में न जलें, किंतु धर्म और मर्यादा की सीमा न लांघें। गुप्त या अनैतिक संबंध अंततः अष्टम भाव के कारण कलंक और मानसिक अशांति लाते हैं। सात्विक आहार और प्राणायाम से शुक्र धातु को संतुलित करें।\n\nश्री क्षेत्र गोकर्ण के महाबलेश्वर भगवान को रुद्राभिषेक करवाने और नित्य 'ॐ नमः शिवाय' या गायत्री मंत्र का जप करने से काम-वासना शांत होकर मन को सच्ची शांति और सद्गति मिलती है।`;
        }
        return `नमस्ते ${session.name} जी। श्री क्षेत्र गोकर्ण के इस पावन सान्निध्य में एक वरिष्ठ वैदिक दैवज्ञ के रूप में, मैं आपकी इस गुप्त व संवेदनशील जिज्ञासा को पूर्ण गोपनीयता और वात्सल्य के साथ स्वीकार करता हूँ।\n\nवैदिक ज्योतिष में काम (Kama) और शारीरिक आकर्षण को पाप मानकर दबाने के बजाय, ग्रह स्थिति के प्रभाव से समझा जाता है। जन्मकुंडली में शुक्र (Venus) प्रेम, सौंदर्य और शारीरिक आकर्षण का कारक है, जबकि राहु (Rahu) तीव्र भ्रम, गुप्त आकर्षण और वासना को बढ़ाता है। सप्तम (कलत्र), अष्टम (गुप्त स्थान) और द्वादश भाव के योग से मन में ऐसे गुप्त विचार उत्पन्न होते हैं।\n\nआत्म-ग्लानि में न जलें, किंतु धर्म और मर्यादा की सीमा न लांघें। गुप्त या अनैतिक संबंध अंततः अष्टम भाव के कारण कलंक और मानसिक अशांति लाते हैं। सात्विक आहार और प्राणायाम से शुक्र धातु को संतुलित करें।\n\nश्री क्षेत्र गोकर्ण के महाबलेश्वर भगवान को रुद्राभिषेक करवाने और नित्य 'ॐ नमः शिवाय' या गायत्री मंत्र का जप करने से काम-वासना शांत होकर मन को सच्ची शांति और सद्गति मिलती है।`;
      }
      if (isTe) {
        if (isSubsequent) {
          return `అంతరంగిక మరియు రహస్య విషయం ("${userQuestion}") గురించి, వైదిక జ్యోతిష్యంలో కామం మరియు శారీరక ఆకర్షణను పాపంగా చూడకుండా గ్రహ ప్రభావంగా వివరిస్తారు. జాతకంలో శుక్రుడు (Venus) ప్రేమ, ఆకర్షణ మరియు శారీరక శక్తికి కారకుడు కాగా, రాహువు (Rahu) తీవ్రమైన వ్యామోహం మరియు రహస్య సంబంధాలను సృష్టిస్తాడు. 7వ (కళత్ర), 8వ (గుప్త స్థానం) మరియు 12వ (శయన సుఖం) స్థానాల కలయిక వల్ల ఇలాంటి ఆలోచనలు కలుగుతాయి.\n\nఆత్మన్యూనతకు లోనుకాకుండా ధర్మ మార్గంలో నడవండి. రహస్య సంబంధాలు అశాంతికి దారితీస్తాయి. శారీరక బలహీనతలు ఉంటే సాత్విక ఆహారం, ప్రాణాయామం ద్వారా శుక్ర ధాతువును బలపరచుకోండి. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామికి రుద్రాభిషేకం చేయించడం మరియు 'ఓం నమః శివాయ' జపించడం వల్ల మనశ్శాంతి లభిస్తుంది.`;
        }
        return `నమస్కారం ${session.name} గారు. శ్రీ క్షేత్ర గోకర్ణ పవిత్ర సన్నిధిలో ఒక సీనియర్ వైదిక దైవజ్ఞుడిగా, మీ అంతరంగిక మరియు రహస్య ప్రశ్నను అత్యంత గోప్యంగా, వాత్సల్యంతో స్వీకరిస్తున్నాను.\n\nవైదిక జ్యోతిష్యంలో కామం మరియు శారీరక ఆకర్షణను పాపంగా చూడకుండా గ్రహ ప్రభావంగా వివరిస్తారు. జాతకంలో శుక్రుడు (Venus) ప్రేమ, ఆకర్షణ మరియు శారీరక శక్తికి కారకుడు కాగా, రాహువు (Rahu) తీవ్రమైన వ్యామోహం మరియు రహస్య సంబంధాలను సృష్టిస్తాడు. 7వ (కళత్ర), 8వ (గుప్త స్థానం) మరియు 12వ (శయన సుఖం) స్థానాల కలయిక వల్ల ఇలాంటి ఆలోచనలు కలుగుతాయి.\n\nఆత్మన్యూనతకు లోనుకాకుండా ధర్మ మార్గంలో నడవండి. రహస్య సంబంధాలు అశాంతికి దారితీస్తాయి. శారీరక బలహీనతలు ఉంటే సాత్విక ఆహారం, ప్రాణాయామం ద్వారా శుక్ర ధాతువును బలపరచుకోండి. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామికి రుద్రాభిషేకం చేయించడం మరియు 'ఓం నమః శివాయ' జపించడం వల్ల మనశ్శాంతి లభిస్తుంది.`;
      }
      if (isTa) {
        if (isSubsequent) {
          return `அந்தரங்க மற்றும் ரகசிய விஷயம் ("${userQuestion}") குறித்து, வேத ஜோதிடத்தில் மனித ஆசையும் (காமம்) உடலியல் ஈர்ப்பும் பாவமாகப் பார்க்கப்படாமல் கிரக அமைப்புகளின் வெளிப்பாடாகவே விவரிக்கப்படுகிறது. ஜாதகத்தில் சுக்கிரன் (Venus) காதல், அழகு மற்றும் உடல் ஆற்றலின் காரகர்; ராகு (Rahu) தீவிர மயக்கம் மற்றும் ரகசிய ஈர்ப்பை ஏற்படுத்துபவர். 7-ஆம் (களத்திரம்), 8-ஆம் (மறைவு ஸ்தானம்) மற்றும் 12-ஆம் (சயன சுகம்) வீடுகளின் சேர்க்கையால் இத்தகைய குழப்பங்கள் எழுகின்றன.\n\nசுயவெறுப்பு கொள்ளாமல் விவேகத்துடன் செயல்படுங்கள். ரகசிய உறவுகள் மன அமைதியைக் குலைக்கும். உடல் பலவீனங்கள் இருந்தால் சாத்வீக உணவு மற்றும் பிராணாயாமத்தால் சுக்கிர தாதுவை வலுப்படுத்துங்கள். கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வதும், 'ஓம் நம சிவாய' மந்திரம் ஜெபிப்பதும் மன அமைதியையும் நல்வழியையும் தரும்.`;
        }
        return `வணக்கம் ${session.name}. ஸ்ரீ க்ஷேத்ர கோகர்ண புனித சந்நிதியில் ஒரு மூத்த ஜோதிடராக, உங்கள் அந்தரங்க மற்றும் ரகசிய கேள்வியை மிகுந்த ரகசியத்துடனும் பரிவுடனும் ஏற்கிறேன்.\n\nவேத ஜோதிடத்தில் மனித ஆசையும் (காமம்) உடலியல் ஈர்ப்பும் பாவமாகப் பார்க்கப்படாமல் கிரக அமைப்புகளின் வெளிப்பாடாகவே விவரிக்கப்படுகிறது. ஜாதகத்தில் சுக்கிரன் (Venus) காதல், அழகு மற்றும் உடல் ஆற்றலின் காரகர்; ராகு (Rahu) தீவிர மயக்கம் மற்றும் ரகசிய ஈர்ப்பை ஏற்படுத்துபவர். 7-ஆம் (களத்திரம்), 8-ஆம் (மறைவு ஸ்தானம்) மற்றும் 12-ஆம் (சயன சுகம்) வீடுகளின் சேர்க்கையால் இத்தகைய குழப்பங்கள் எழுகின்றன.\n\nசுயவெறுப்பு கொள்ளாமல் விவேகத்துடன் செயல்படுங்கள். ரகசிய உறவுகள் மன அமைதியைக் குலைக்கும். உடல் பலவீனங்கள் இருந்தால் சாத்வீக உணவு மற்றும் பிராணாயாமத்தால் சுக்கிர தாதுவை வலுப்படுத்துங்கள். கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வதும், 'ஓம் நம சிவாய' மந்திரம் ஜெபிப்பதும் மன அமைதியையும் நல்வழியையும் தரும்.`;
      }
      if (isMl) {
        if (isSubsequent) {
          return `അന്തരംഗവും രഹസ്യവുമായ ഈ വിഷയത്തിൽ ("${userQuestion}"), വൈദിക ജ്യോതിഷത്തിൽ മനുഷ്യസഹജമായ ആഗ്രഹങ്ങളെയും ശാരീരിക ആകർഷണങ്ങളെയും പാപമായി കാണാതെ ഗ്രഹസ്വാധീനമായി വിശദീകരിക്കുന്നു. ജാതകത്തിൽ ശുക്രൻ (Venus) സ്നേഹത്തിന്റെയും ശാരീരിക വീര്യത്തിന്റെയും കാരകനും, രാഹു (Rahu) അമിത വ്യാമോഹത്തിന്റെയും രഹസ്യ ബന്ധങ്ങളുടെയും കാരകനുമാണ്. 7-ാം (വിവാഹം), 8-ാം (ഗുപ്ത സ്ഥാനം), 12-ാം (ശയന സുഖം) ഭാവങ്ങളുടെ സമ്മിശ്രണമാണ് ഇങ്ങനെയുള്ള ചിന്തകൾക്ക് കാരണം.\n\nകുറ്റബോധത്തിൽ ഉരുകാതെ ധർമ്മത്തിന്റെ വഴിയിൽ ഉറച്ചുനിൽക്കുക. രഹസ്യ ബന്ധങ്ങൾ ശാന്തി നഷ്ടപ്പെടുത്തും. ശാരീരിക ദൗർബല്യങ്ങളുണ്ടെങ്കിൽ സാത്വിക ഭക്ഷണവും പ്രാണായാമവും ശീലിക്കുക. ഗോകർണ്ണ മഹാബലേശ്വരന് രുദ്രാഭിഷേകം നടത്തുകയും 'ഓം നമഃ ശിവായ' ജപിക്കുകയും ചെയ്യുന്നത് മനസ്സിന് ശാന്തി നൽകും.`;
        }
        return `നമസ്കാരം ${session.name}. ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ പവിത്ര സന്നിധിയിൽ ഒരു മുതിർന്ന ജ്യോത്സ്യനായി നിങ്ങളുടെ രഹസ്യവും സ്വകാര്യവുമായ ഈ ചോദ്യത്തെ അതീവ രഹസ്യമായും വാത്സല്യത്തോടും സ്വീകരിക്കുന്നു.\n\nവൈദിക ജ്യോതിഷത്തിൽ മനുഷ്യസഹജമായ ആഗ്രഹങ്ങളെയും ശാരീരിക ആകർഷണങ്ങളെയും പാപമായി കാണാതെ ഗ്രഹസ്വാധീനമായി വിശദീകരിക്കുന്നു. ജാതകത്തിൽ ശുക്രൻ (Venus) സ്നേഹത്തിന്റെയും ശാരീരിക വീര്യത്തിന്റെയും കാരകനും, രാഹു (Rahu) അമിത വ്യാമോഹത്തിന്റെയും രഹസ്യ ബന്ധങ്ങളുടെയും കാരകനുമാണ്. 7-ാം (വിവാഹം), 8-ാം (ഗുപ്ത സ്ഥാനം), 12-ാം (ശയന സുഖം) ഭാവങ്ങളുടെ സമ്മിശ്രണമാണ് ഇങ്ങനെയുള്ള ചിന്തകൾക്ക് കാരണം.\n\nകുറ്റബോധത്തിൽ ഉരുകാതെ ധർമ്മത്തിന്റെ വഴിയിൽ ഉറച്ചുനിൽക്കുക. രഹസ്യ ബന്ധങ്ങൾ ശാന്തി നഷ്ടപ്പെടുത്തും. ശാരീരിക ദൗർബല്യങ്ങളുണ്ടെങ്കിൽ സാത്വിക ഭക്ഷണവും പ്രാണായാമവും ശീലിക്കുക. ഗോകർണ്ണ മഹാബലേശ്വരന് രുദ്രാഭിഷേകം നടത്തുകയും 'ഓം നമഃ ശിവായ' ജപിക്കുകയും ചെയ്യുന്നത് മനസ്സിന് ശാന്തി നൽകും.`;
      }
      if (isMr) {
        if (isSubsequent) {
          return `अन्तरंग आणि गुप्त विषयाबाबत ("${userQuestion}"), वैदिक ज्योतिषात मानवी वासना आणि शारीरिक आकर्षण यांना पाप न मानता नैसर्गिक ग्रह प्रभाव मानले जाते. पत्रिकेत शुक्र (Venus) प्रेम, सौंदर्य आणि शारीरिक ऊर्जेचा कारक आहे, तर राहू (Rahu) तीव्र भुरळ आणि गुप्त आकर्षणाचा कारक आहे. सप्तम (कलत्र), अष्टम (गुप्त स्थान) आणि द्वादश (शयन सुख) भावांच्या संयोगाने मनात अशा भावना निर्माण होतात.\n\nआत्म-ग्लानी न बाळगता विवेकाने वागा. गुप्त संबंध शेवटी मानहानी आणतात. शारीरिक दुर्बलता असल्यास सात्विक आहार आणि प्राणायामाने शुक्र धातू संतुलित करा. गोकर्ण महाबळेश्वराला रुद्राभिषेक करणे आणि 'ॐ नमः शिवाय' जप केल्याने मन शांत होते.`;
        }
        return `नमस्ते ${session.name}. श्री क्षेत्र गोकर्ण पावन सान्निध्यात एक ज्येष्ठ दैवज्ञ म्हणून मी आपली ही अत्यंत गुप्त व संवेदनशील शंका पूर्ण गोपनीयतेने व पितृतुल्य वात्सल्याने स्वीकारतो.\n\nवैदिक ज्योतिषात मानवी वासना आणि शारीरिक आकर्षण यांना पाप न मानता नैसर्गिक ग्रह प्रभाव मानले जाते. पत्रिकेत शुक्र (Venus) प्रेम, सौंदर्य आणि शारीरिक ऊर्जेचा कारक आहे, तर राहू (Rahu) तीव्र भुरळ आणि गुप्त आकर्षणाचा कारक आहे. सप्तम (कलत्र), अष्टम (गुप्त स्थान) आणि द्वादश (शयन सुख) भावांच्या संयोगाने मनात अशा भावना निर्माण होतात.\n\nआत्म-ग्लानी न बाळगता विवेकाने वागा. गुप्त संबंध शेवटी मानहानी आणतात. शारीरिक दुर्बलता असल्यास सात्विक आहार आणि प्राणायामाने शुक्र धातू संतुलित करा. गोकर्ण महाबळेश्वराला रुद्राभिषेक करणे आणि 'ॐ नमः शिवाय' जप केल्याने मन शांत होते.`;
      }
      // Kannada default
      if (isSubsequent) {
        return `ಅಂತರಂಗದ ಈ ಗೌಪ್ಯ ವಿಚಾರಣೆಗೆ ("${userQuestion}") ಸಂಬಂಧಿಸಿದಂತೆ, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಮಾನವ ಸಹಜವಾದ ಕಾಮನೆ (Kama) ಹಾಗೂ ದೈಹಿಕ ಆಕರ್ಷಣೆಗಳನ್ನು ಪಾಪವೆಂದು ನಿರಾಕರಿಸದೆ, ಅವುಗಳ ಗ್ರಹಸ್ಥಿತಿಯ ಮೂಲವನ್ನು ಸವಿಸ್ತಾರವಾಗಿ ವಿವರಿಸಲಾಗಿದೆ. ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ (Venus) ಗ್ರಹವು ಪ್ರೇಮ, ಸೌಂದರ್ಯ ಹಾಗೂ ಲೈಂಗಿಕ ಶಕ್ತಿಯ (ಶುಕ್ರ ಧಾತು) ಕಾರಕನಾಗಿದ್ದು, ರಾಹು (Rahu) ಗ್ರಹವು ತೀವ್ರವಾದ ಭ್ರಮೆ, ರಹಸ್ಯ ಆಕರ್ಷಣೆ ಹಾಗೂ ಅತಿಯಾದ ವ್ಯಾಮೋಹವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಾನೆ. ನಿಮ್ಮ ಜಾತಕದ ಸಪ್ತಮ (ಕಳತ್ರ), ಅಷ್ಟಮ (ಗುಪ್ತ ಸ್ಥಾನ) ಹಾಗೂ ದ್ವಾದಶ (ಶಯನ ಸುಖ) ಭಾವಗಳ ಸಂಯೋಗದಿಂದ ಇಂತಹ ತೀವ್ರ ರಹಸ್ಯ ಭಾವನೆಗಳು ಅಥವಾ ಗೊಂದಲಗಳು ಉಂಟಾಗುತ್ತವೆ.\n\nಇಂತಹ ವಿಷಯಗಳಲ್ಲಿ ಅತಿಯಾದ ಅಪರಾಧಿ ಭಾವನೆಯಿಂದ ಕುಗ್ಗಬೇಡಿ; ಆದರೆ ಧರ್ಮದ ಗೆರೆಯನ್ನು ಎಂದಿಗೂ ದಾಟಬೇಡಿ. ರಹಸ್ಯ ಅಥವಾ ಅನೈತಿಕ ಸಂಬಂಧಗಳು ಆರಂಭದಲ್ಲಿ ಆಕರ್ಷಕವಾಗಿ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಅಷ್ಟಮ ಭಾವದ ಪ್ರಭಾವದಿಂದ ಕೀರ್ತಿಭಂಗ ಹಾಗೂ ಮಾನಸಿಕ ಅಶಾಂತಿಗೆ ಕಾರಣವಾಗುತ್ತವೆ. ದೈಹಿಕ ದೌರ್ಬಲ್ಯ ಅಥವಾ ಲೈಂಗಿಕ ಚಿಂತೆಗಳಿದ್ದರೆ, ಸಾತ್ವಿಕ ಆಹಾರ, ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಆಯುರ್ವೇದ ಪದ್ಧತಿಯಿಂದ ಶುಕ್ರ ಧಾತುವನ್ನು ಬಲಪಡಿಸಿಕೊಳ್ಳಿ.\n\nಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಹಾಗೂ ಪ್ರತಿದಿನ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸುವುದರಿಂದ ಮನಸ್ಸಿನ ಕಾಮಾಗ್ನಿಯು ಶಮನವಾಗಿ, ಸಕಲ ಶುಭ ಹಾಗೂ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ, ನಿಮ್ಮ ಅಂತರಂಗದ ಈ ರಹಸ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಅತ್ಯಂತ ಗೌಪ್ಯವಾಗಿ ಹಾಗೂ ವಾತ್ಸಲ್ಯಪೂರ್ಣವಾಗಿ ಸ್ವೀಕರಿಸುತ್ತೇನೆ.\n\nವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಮಾನವ ಸಹಜವಾದ ಕಾಮನೆ (Kama) ಹಾಗೂ ದೈಹಿಕ ಆಕರ್ಷಣೆಗಳನ್ನು ಪಾಪವೆಂದು ನಿರಾಕರಿಸದೆ, ಅವುಗಳ ಗ್ರಹಸ್ಥಿತಿಯ ಮೂಲವನ್ನು ಸವಿಸ್ತಾರವಾಗಿ ವಿವರಿಸಲಾಗಿದೆ. ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ (Venus) ಗ್ರಹವು ಪ್ರೇಮ, ಸೌಂದರ್ಯ ಹಾಗೂ ಲೈಂಗಿಕ ಶಕ್ತಿಯ (ಶುಕ್ರ ಧಾತು) ಕಾರಕನಾಗಿದ್ದು, ರಾಹು (Rahu) ಗ್ರಹವು ತೀವ್ರವಾದ ಭ್ರಮೆ, ರಹಸ್ಯ ಆಕರ್ಷಣೆ ಹಾಗೂ ಅತಿಯಾದ ವ್ಯಾಮೋಹವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಾನೆ. ನಿಮ್ಮ ಜಾತಕದ ಸಪ್ತಮ (ಕಳತ್ರ), ಅಷ್ಟಮ (ಗುಪ್ತ ಸ್ಥಾನ) ಹಾಗೂ ದ್ವಾದಶ (ಶಯನ ಸುಖ) ಭಾವಗಳ ಸಂಯೋಗದಿಂದ ಇಂತಹ ತೀವ್ರ ರಹಸ್ಯ ಭಾವನೆಗಳು ಅಥವಾ ಗೊಂದಲಗಳು ಉಂಟಾಗುತ್ತವೆ.\n\nಇಂತಹ ವಿಷಯಗಳಲ್ಲಿ ಅತಿಯಾದ ಅಪರಾಧಿ ಭಾವನೆಯಿಂದ ಕುಗ್ಗಬೇಡಿ; ಆದರೆ ಧರ್ಮದ ಗೆರೆಯನ್ನು ಎಂದಿಗೂ ದಾಟಬೇಡಿ. ರಹಸ್ಯ ಅಥವಾ ಅನೈತಿಕ ಸಂಬಂಧಗಳು ಆರಂಭದಲ್ಲಿ ಆಕರ್ಷಕವಾಗಿ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಅಷ್ಟಮ ಭಾವದ ಪ್ರಭಾವದಿಂದ ಕೀರ್ತಿಭಂಗ ಹಾಗೂ ಮಾನಸಿಕ ಅಶಾಂತಿಗೆ ಕಾರಣವಾಗುತ್ತವೆ. ದೈಹಿಕ ದೌರ್ಬಲ್ಯ ಅಥವಾ ಲೈಂಗಿಕ ಚಿಂತೆಗಳಿದ್ದರೆ, ಸಾತ್ವಿಕ ಆಹಾರ, ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಆಯುರ್ವೇದ ಪದ್ಧತಿಯಿಂದ ಶುಕ್ರ ಧಾತುವನ್ನು ಬಲಪಡಿಸಿಕೊಳ್ಳಿ.\n\nಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಹಾಗೂ ಪ್ರತಿದಿನ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸುವುದರಿಂದ ಮನಸ್ಸಿನ ಕಾಮಾಗ್ನಿಯು ಶಮನವಾಗಿ, ಸಕಲ ಶುಭ ಹಾಗೂ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.`;
    }

    case "CELEBRITY_FANTASY":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding "${userQuestion}", let us guide you with fatherly truth and Vedic wisdom. Screen celebrities, actresses, or internet personalities live in an entirely different commercial sphere with their own private realities, families, and separate life paths. Daydreaming about public figures or screen personas dissipates your vital mental energy and self-respect. Focus your efforts on real personal achievements, building high character, and establishing an honorable livelihood; by divine grace, you will be blessed with a loving and virtuous life partner suited for your real life.`;
        }
        return `Namaste ${session.name}. Listening to your question with fatherly affection, let me guide you with gentle truth and Vedic wisdom.\n\nFirst, recognize the reality of this world: distant celebrities, actresses, or internet figures live in an entirely different commercial sphere with their own private realities, families, and separate life paths. Spending your precious mental energy and youthful years pursuing unattainable daydreams or screen illusions will only bring disillusionment and drain your focus.\n\nIn Vedic Jyotisha, real marital harmony and lifelong happiness are found with an honorable partner who walks beside you in reality. If you wish to attract a noble, virtuous partner, you must first build exceptional character, work diligently, earn an honorable livelihood, and establish respect in society. Your birth chart (${lagnaName} Lagna) shows strong inner resilience. Channel your energy away from screen illusions into your real-world career and self-growth, and by divine grace, you will be blessed with a loving and virtuous life partner suited for your real life.`;
      }
      if (isHi) {
        if (isSubsequent) {
          return `आपने जो "${userQuestion}" पूछा है, उस पर एक वरिष्ठ दैवज्ञ के रूप में वात्सल्य और सत्य के साथ मार्गदर्शन करता हूँ। फिल्मी हस्तियों, अभिनेत्रियों या इंटरनेट सेलिब्रिटी के प्रति केवल कल्पना लोक में समय बिताने से मानसिक ऊर्जा नष्ट होती है। अपने वास्तविक जीवन में परिश्रम करें, उत्तम संस्कार और चरित्रवान बनें; आपके वास्तविक जीवन के अनुकूल एक गुणवान और स्नेहमयी जीवनसंगिनी अवश्य प्राप्त होगी।`;
        }
        return `नमस्ते ${session.name} जी। आपकी बात सुनकर एक वरिष्ठ दैवज्ञ के रूप में, मैं आपको पिता समान वात्सल्य और वास्तविकता का मार्गदर्शन देता हूँ।\n\nसंसार की वास्तविकता को समझें: पर्दे की हस्तियां, अभिनेत्रियां या इंटरनेट सेलिब्रिटी पूरी तरह से एक अलग व्यावसायिक जगत में अपने व्यक्तिगत जीवन, परिवार और वास्तविकताओं के साथ जीती हैं। स्क्रीन के भ्रम और दिवास्वप्नों के पीछे अपनी अनमोल युवावस्था और समय गंवाना केवल भटकाव और निराशा लाता है।\n\nवैदिक शास्त्र में दांपत्य सुख वास्तविक जीवन के संस्कारवान साथी के साथ मिलता है। यदि आप एक सुसंस्कृत और योग्य जीवनसाथी चाहते हैं, तो पहले अपने चरित्र, विद्या, करियर और समाज में सम्मान को सुदृढ़ करें। आपकी जन्म कुंडली (${lagnaName} लग्न) में आत्मबल है। अपनी ऊर्जा को वास्तविक विकास में लगाएं; ईश्वर की कृपा से आपके जीवन के सर्वथा योग्य, सदाचारी और प्रेमपूर्ण जीवनसाथी का सुख आपको अवश्य मिलेगा।`;
      }
      if (isSubsequent) {
        return `ನೀವು ಕೇಳಿದ "${userQuestion}" ಎಂಬ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಕೇವಲ ಕಲ್ಪನಾ ಲೋಕದಲ್ಲಿ ಸಮಯ ಕಳೆಯುವುದರಿಂದ ಮಾನಸಿಕ ಗೊಂದಲಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆ. ಪರದೆಯ ಮೇಲಿನ ಸೆಲೆಬ್ರಿಟಿಗಳು ಅಥವಾ ಇಂಟರ್ನೆಟ್ ವ್ಯಕ್ತಿಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಭಿನ್ನವಾದ ವಾಣಿಜ್ಯ ಜಗತ್ತಿನಲ್ಲಿ ತಮ್ಮದೇ ಆದ ಖಾಸಗಿ ಬದುಕು ಮತ್ತು ನೈಜತೆಯೊಂದಿಗೆ ಇರುತ್ತಾರೆ. ನಿಮ್ಮ ನೈಜ ಬದುಕಿನಲ್ಲಿ ಪರಿಶ್ರಮಿಸಿ, ಉನ್ನತ ಸಾಧನೆ ಮತ್ತು ಸಂಸ್ಕಾರವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ; ನಿಮ್ಮ ಬದುಕಿಗೆ ಸರಿಹೊಂದುವಂತಹ ಸದ್ಗುಣ ಸಂಪನ್ನೆಯಾದ ಬಾಳಸಂಗಾತಿಯು ಖಂಡಿತವಾಗಿಯೂ ದೊರೆಯಲಿದ್ದಾರೆ.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನಿಮ್ಮ ಮಾತನ್ನು ಕೇಳಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ, ವಾತ್ಸಲ್ಯದಿಂದ ನಿಮಗೆ ವಾಸ್ತವಿಕ ಮತ್ತು ಧರ್ಮದ ಮಾರ್ಗದರ್ಶನವನ್ನು ನೀಡುತ್ತೇನೆ.\n\nಮೊದಲನೆಯದಾಗಿ ಲೋಕದ ವಾಸ್ತವವನ್ನು ಗ್ರಹಿಸಿ: ಪರದೆಯ ಮೇಲಿನ ಸೆಲೆಬ್ರಿಟಿಗಳು, ನಟಿಯರು ಅಥವಾ ಇಂಟರ್ನೆಟ್ ವ್ಯಕ್ತಿಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಭಿನ್ನವಾದ ವಾಣಿಜ್ಯ ಜಗತ್ತಿನಲ್ಲಿ ತಮ್ಮದೇ ಆದ ಖಾಸಗಿ ಬದುಕು, ಕುಟುಂಬ ಮತ್ತು ವಾಸ್ತವಗಳೊಂದಿಗೆ ಜೀವಿಸುತ್ತಿದ್ದಾರೆ. ಕೇವಲ ಕಲ್ಪನಾ ಲೋಕದಲ್ಲಿ ಯೌವನದ ಅಮೂಲ್ಯ ಸಮಯ ಮತ್ತು ಶಕ್ತಿಯನ್ನು ಕಳೆಯುವುದರಿಂದ ಮಾನಸಿಕ ಗೊಂದಲಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆಯೇ ಹೊರತು ಯಾವುದೇ ಸಾರ್ಥಕತೆ ದೊರೆಯುವುದಿಲ್ಲ.\n\nವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದ ಪ್ರಕಾರ ನಿಜವಾದ ದಾಂಪತ್ಯ ಸುಖವು ನೈಜ ಬದುಕಿನ ಸಂಸ್ಕಾರಯುತ ಸಂಗಾತಿಯೊಂದಿಗೆ ಸಿದ್ಧಿಸುತ್ತದೆ. ನೀವು ನಿಮ್ಮ ${lagnaName} ಲಗ್ನದ ಬಲವನ್ನು ಸದ್ವಿನಿಯೋಗಪಡಿಸಿಕೊಂಡು, ಕಲ್ಪನೆಗಳಿಂದ ಹೊರಬಂದು ನಿಮ್ಮ ವೃತ್ತಿ ಮತ್ತು ಜೀವನದಲ್ಲಿ ಶ್ರಮಿಸಿ, ಉತ್ತಮ ಆದಾಯ ಹಾಗೂ ಸಂಸ್ಕಾರವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ. ಆಗ ನಿಮ್ಮ ಜಾತಕದ ಸಪ್ತಮ ಭಾವದ ಅನುಗ್ರಹದಿಂದ, ನಿಮ್ಮ ಬದುಕಿಗೆ ಸರಿಹೊಂದುವಂತಹ ಸದ್ಗುಣ ಸಂಪನ್ನೆಯಾದ ಬಾಳಸಂಗಾತಿಯು ಖಂಡಿತವಾಗಿಯೂ ದೊರೆಯಲಿದ್ದಾರೆ.`;

    case "PROVOCATIVE_TABOO":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding "${userQuestion}", human birth is a sacred gift endowed with intellect and divine purpose. Chasing transient lustful illusions and adult distractions pollutes the mind, drains vitality, and weakens self-esteem. Practice self-discipline and recite the sacred Gayatri Mantra or Om Namah Shivaya daily to awaken clarity and peace.`;
        }
        return `Hari Om ${session.name}. As a senior priest speaking to you in this sacred sanctum of Sri Kshetra Gokarna, I receive your words with calm compassion and spiritual concern.\n\nHuman birth is a sacred gift endowed with intellect and divine purpose. Chasing transient lustful illusions, adult distractions, and degrading desires pollutes the mind, drains vital vitality, and weakens your self-esteem and future destiny.\n\nTrue happiness, self-respect, and lasting peace come from purity of thought, noble conduct, and building an honorable life worthy of your family's pride. Practice self-discipline and step away from unhealthy digital habits. Reciting the sacred Gayatri Mantra or chanting Om Namah Shivaya daily will purify the mind and awaken divine clarity.`;
      }
      if (isSubsequent) {
        return `ನೀವು ಕೇಳಿದ "${userQuestion}" ಎಂಬ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಮಾನವ ಜನ್ಮವು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದದ್ದು. ಅಸ್ಥಿರವಾದ ಕಾಮನೆಗಳು ಹಾಗೂ ಅಶ್ಲೀಲ ಕಲ್ಪನೆಗಳ ಬೆನ್ನತ್ತಿ ಹೋಗುವುದರಿಂದ ಮನಸ್ಸು ಕಲುಷಿತಗೊಳ್ಳುತ್ತದೆ. ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಸದ್ಗುಣವನ್ನು ರೂಢಿಸಿಕೊಂಡು, ಪ್ರತಿದಿನ ಓಂ ನಮಃ ಶಿವಾಯ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ.`;
      }
      return `ಹರಿ ಓಂ ${session.name} ಅವರೇ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಈ ಪವಿತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ, ನಿಮ್ಮ ಮಾತನ್ನು ಶಾಂತ ಚಿತ್ತದಿಂದ ಆಲಿಸಿ ನಿಮಗೆ ಸನ್ಮಾರ್ಗದ ವಿವೇಕವನ್ನು ಹೇಳುತ್ತೇನೆ.\n\nಮಾನವ ಜನ್ಮವು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದದ್ದು. ಅಸ್ಥಿರವಾದ ಕಾಮನೆಗಳು, ಅಶ್ಲೀಲ ಕಲ್ಪನೆಗಳು ಹಾಗೂ ಕೆಟ್ಟ ವ್ಯಾಮೋಹಗಳ ಬೆನ್ನತ್ತಿ ಹೋಗುವುದರಿಂದ ಮನಸ್ಸು ಕಲುಷಿತಗೊಂಡು, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ಭವಿಷ್ಯದ ಶ್ರೇಯಸ್ಸು ಕುಂಠಿತವಾಗುತ್ತದೆ.\n\nನಿಜವಾದ ಸುಖ ಮತ್ತು ಶಾಂತಿಯು ಇಂದ್ರಿಯ ನಿಗ್ರಹ, ಸದ್ಗುಣ ಹಾಗೂ ಗೌರವಯುತ ಜೀವನದಲ್ಲಿದೆ. ಕ್ಷಣಿಕ ಭ್ರಮೆಗಳಿಂದ ದೂರವಾಗಿ, ನಿಮ್ಮ ತಂದೆ-ತಾಯಿಯರಿಗೆ ಹಾಗೂ ಸಮಾಜಕ್ಕೆ ಕೀರ್ತಿ ತರುವಂತಹ ಸತ್ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿಕೊಳ್ಳಿ. ಪ್ರತಿದಿನ ಓಂ ನಮಃ ಶಿವಾಯ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಪಠಿಸುವುದರಿಂದ ಮನಸ್ಸಿನ ಚಂಚಲತೆ ಶಮನವಾಗಿ, ಸಕಲ ಸನ್ಮಂಗಳ ಉಂಟಾಗುತ್ತದೆ.`;

    case "DOMESTIC_OMEN_VASTU":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding finding an old vessel or item in your home corner ("${userQuestion}"), there is no need for any fear, anxiety, or superstitious panic.\n\nAccording to Vedic Vastu and Nimitta Shastra, corners of a house—particularly the North-East (Ishanya) and South-West (Nairutya)—are vital energy intersections. Metallic vessels, especially copper or brass, naturally ground elemental vibrations.\n\nTo ensure positive energy and peace: clean the vessel respectfully with water and lemon. Wash the corner with water mixed with rock salt or sacred Ganga-jala to dispel any stagnant energies. Light a pure cow-ghee lamp in that direction and offer prayers to your Kuladevata.`;
        }
        return `Namaste ${session.name}. You need not harbor any fear, anxiety, or superstitious panic regarding finding an old vessel or item in the corner of your home.\n\nAccording to Vedic Vastu and Nimitta Shastra, corners of a house—particularly the North-East (Ishanya) and South-West (Nairutya)—are vital energy intersections. Metallic vessels, especially copper or brass, naturally ground electromagnetic and elemental vibrations.\n\nTo ensure positive energy and peace: clean the vessel respectfully with water and lemon. Wash the corner with water mixed with rock salt or sacred Ganga-jala to dispel any stagnant energies. Light a pure cow-ghee lamp in that direction, sprinkle Tulasi water, and offer prayers to your Kuladevata. This will invite Goddess Mahalakshmi's grace and maintain harmony in your household.`;
      }
      if (isSubsequent) {
        return `ಮನೆಯ ಮೂಲೆಯಲ್ಲಿ ಹಳೆಯ ಪಾತ್ರೆ ಸಿಕ್ಕಿದ ವಿಚಾರದಲ್ಲಿ ("${userQuestion}"), ಯಾವುದೇ ರೀತಿಯ ಅಂಜಿಕೆ, ಭಯ ಅಥವಾ ಮೂಢನಂಬಿಕೆಗಳಿಗೆ ಒಳಗಾಗುವ ಅಗತ್ಯವಿಲ್ಲ.\n\nವೈದಿಕ ವಾಸ್ತು ಮತ್ತು ನಿಮಿತ್ತ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಮನೆಯ ಮೂಲೆಗಳು ಪಂಚಭೂತಗಳ ಶಕ್ತಿಯ ಸಂಗಮ ಸ್ಥಾನಗಳಾಗಿವೆ. ತಾಮ್ರ ಅಥವಾ ಹಿತ್ತಾಳೆಯಂತಹ ಲೋಹದ ಪಾತ್ರೆಗಳು ನೈಸರ್ಗಿಕವಾಗಿ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಳ್ಳುವ ಗುಣವನ್ನು ಹೊಂದಿರುತ್ತವೆ.\n\nಇದರ ಪರಿಹಾರ ಮತ್ತು ಶುದ್ಧತೆಗಾಗಿ: ಆ ಪಾತ್ರೆಯನ್ನು ಶುದ್ಧ ನೀರಿನಿಂದ ತೊಳೆದು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಆ ಮೂಲೆಯನ್ನು ಕಲ್ಲುಪ್ಪು ಬೆರೆಸಿದ ನೀರಿನಿಂದ ಪ್ರೋಕ್ಷಿಸಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಆ ಜಾಗದಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪವನ್ನು ಹಚ್ಚಿ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಇದರಿಂದ ಮನೆಯಲ್ಲಿ ಸಕಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ತೊಲಗಿ ಶುಭವಾಗುತ್ತದೆ.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಅಥವಾ ಮೂಲೆಯಲ್ಲಿ ಹಳೆಯ ಪಾತ್ರೆ ಸಿಕ್ಕಿದ ವಿಚಾರದಲ್ಲಿ ಯಾವುದೇ ರೀತಿಯ ಅಂಜಿಕೆ, ಭಯ ಅಥವಾ ಮೂಢನಂಬಿಕೆಗಳಿಗೆ ಒಳಗಾಗುವ ಅಗತ್ಯವಿಲ್ಲ.\n\nವೈದಿಕ ವಾಸ್ತು ಮತ್ತು ನಿಮಿತ್ತ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಮನೆಯ ಮೂಲೆಗಳು (ವಿಶೇಷವಾಗಿ ಈಶಾನ್ಯ ಹಾಗೂ ನೈಋತ್ಯ ದಿಕ್ಕುಗಳು) ಪಂಚಭೂತಗಳ ಶಕ್ತಿಯ ಸಂಗಮ ಸ್ಥಾನಗಳಾಗಿವೆ. ತಾಮ್ರ ಅಥವಾ ಹಿತ್ತಾಳೆಯಂತಹ ಪ್ರಾಚೀನ ಲೋಹದ ಪಾತ್ರೆಗಳು ನೈಸರ್ಗಿಕವಾಗಿ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಳ್ಳುವ ಗುಣವನ್ನು ಹೊಂದಿರುತ್ತವೆ.\n\nಇದರ ಪರಿಹಾರ ಮತ್ತು ಶುದ್ಧತೆಗಾಗಿ: ಆ ಪಾತ್ರೆಯನ್ನು ಶುದ್ಧ ನೀರಿನಿಂದ ತೊಳೆದು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಆ ಮೂಲೆಯನ್ನು ಕಲ್ಲುಪ್ಪು ಬೆರೆಸಿದ ನೀರಿನಿಂದ ಅಥವಾ ಗಂಗಾಜಲದಿಂದ ಪ್ರೋಕ್ಷಿಸಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಆ ಜಾಗದಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪವನ್ನು ಹಚ್ಚಿ, ತುಳಸಿ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಇದರಿಂದ ಮನೆಯಲ್ಲಿ ಸಕಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ತೊಲಗಿ ಶುಭವಾಗುತ್ತದೆ.`;

    case "DAILY_TRIP_TRAVEL":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your upcoming journey ("${userQuestion}"), our Vedic Panchanga recommends observing the daily Rahu Kala and avoiding starting the journey during that specific timeframe. Stepping out of your home with your right foot after a calm mental prayer ensures auspiciousness.\n\nBefore starting the vehicle or embarking on the road, break a coconut or offer sincere prayers to Lord Ganapati and your Kuladevata. Drive with disciplined patience, avoid impulsive rush, and your journey will be joyful and fruitful.`;
        }
        return `Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna bless your upcoming journey with safety, joy, and divine protection.\n\nRegarding your travel plans tomorrow, our Vedic Panchanga recommends observing the daily Rahu Kala and avoiding starting the journey during that specific timeframe. Stepping out of your home with your right foot after a calm mental prayer ensures auspiciousness.\n\nBefore starting the vehicle or embarking on the road, break a coconut or offer sincere prayers to Lord Ganapati and your Kuladevata. Drive with disciplined patience, avoid impulsive rush, and your journey will be joyful and fruitful.`;
      }
      if (isSubsequent) {
        return `ನಾಳಿನ ಪ್ರಯಾಣದ ಕುರಿತಾದ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ("${userQuestion}") ಸಂಬಂಧಿಸಿದಂತೆ, ನಾಳೆ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸುವ ಮುನ್ನ ಆ ದಿನದ ರಾಹು ಕಾಲವನ್ನು ಗಮನಿಸಿ, ರಾಹು ಕಾಲದ ಅವಧಿಯಲ್ಲಿ ಹೊಸ ಪ್ರಯಾಣವನ್ನು ಆರಂಭಿಸಬೇಡಿ. ಮನೆಯಿಂದ ಹೊರಡುವಾಗ ಶುಭ ಸಂಕಲ್ಪದೊಂದಿಗೆ ಬಲಗಾಲಿಟ್ಟು ಹೊರಡಿ.\n\nವಾಹನ ಚಲಾಯಿಸುವ ಮುನ್ನ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಹಾಗೂ ಕುಲದೇವತೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಸ್ಮರಿಸಿ. ರಸ್ತೆಯಲ್ಲಿ ಯಾವುದೇ ಅತಿ ಆತುರ ಅಥವಾ ಆಕ್ರೋಶಕ್ಕೆ ಒಳಗಾಗದೆ ತಾಳ್ಮೆಯಿಂದ ಸಂಚರಿಸಿ; ದೈವಾನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಪ್ರವಾಸವು ಸಕಲ ಯಶಸ್ಸು ಮತ್ತು ಸಂತೋಷವನ್ನು ತರಲಿದೆ.`;
      }
      return `ಹರಿ ಓಂ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ನಾಳಿನ ಪ್ರವಾಸವು ಅತ್ಯಂತ ಸುಖಕರವೂ, ಕ್ಷೇಮಕರವೂ ಆಗಿರಲಿ ಎಂದು ಆಶೀರ್ವದಿಸುತ್ತೇನೆ.\n\nಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಾಳೆ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸುವ ಮುನ್ನ ಆ ದಿನದ ರಾಹು ಕಾಲವನ್ನು ಗಮನಿಸಿ, ರಾಹು ಕಾಲದ ಅವಧಿಯಲ್ಲಿ ಹೊಸ ಪ್ರಯಾಣವನ್ನು ಆರಂಭಿಸಬೇಡಿ. ಮನೆಯಿಂದ ಹೊರಡುವಾಗ ಶುಭ ಸಂಕಲ್ಪದೊಂದಿಗೆ ಬಲಗಾಲಿಟ್ಟು ಹೊರಡಿ.\n\nವಾಹನ ಚಲಾಯಿಸುವ ಮುನ್ನ ಅಥವಾ ಪ್ರಯಾಣದ ಆರಂಭದಲ್ಲಿ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಹಾಗೂ ಕುಲದೇವತೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಸ್ಮರಿಸಿ. ರಸ್ತೆಯಲ್ಲಿ ಯಾವುದೇ ಅತಿ ಆತುರ ಅಥವಾ ಆಕ್ರೋಶಕ್ಕೆ ಒಳಗಾಗದೆ ತಾಳ್ಮೆಯಿಂದ ಸಂಚರಿಸಿ; ದೈವಾನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಪ್ರವಾಸವು ಸಕಲ ಯಶಸ್ಸು ಮತ್ತು ಸಂತೋಷವನ್ನು ತರಲಿದೆ.`;

    case "INTERPERSONAL_CONFLICT":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding the conflict and quarrel you mentioned ("${userQuestion}"), sudden clashes and heated arguments are often triggered by the planetary transit of Mars (Kuja - anger) or Mercury (Budha - impulsive words). Anger is like a fire that scorches the container holding it before it reaches anyone else.\n\nDo not react impulsively or seek retaliation while emotions are raw. Allow a cooling-off period of 24 to 48 hours for the heated planetary energies to subside. Speak with dignified composure and patience when minds have cleared. Walking the noble path of Dharma and self-restraint will protect your peace and earn you lasting respect.`;
        }
        return `Namaste ${session.name}. I understand your heart is disturbed due to this conflict. Let me offer you soothing Vedic counsel and astrological wisdom.\n\nIn astrology, sudden clashes and heated arguments are often triggered by the planetary transit of Mars (Kuja - anger) or Mercury (Budha - impulsive words). Anger is like a fire that scorches the container holding it before it reaches anyone else.\n\nDo not react impulsively or seek retaliation while emotions are raw. Allow a cooling-off period of 24 to 48 hours for the heated planetary energies to subside. Speak with dignified composure and patience when minds have cleared. Walking the noble path of Dharma and self-restraint will protect your peace and earn you lasting respect.`;
      }
      if (isSubsequent) {
        return `ಜಗಳ ಅಥವಾ ಮನಸ್ತಾಪದ ಈ ವಿಷಯಕ್ಕೆ ("${userQuestion}") ಸಂಬಂಧಿಸಿದಂತೆ, ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಕ್ಷಣಿಕ ಕೋಪ ಮತ್ತು ಜಗಳಗಳು ಜಾತಕದಲ್ಲಿ ಕುಜ ಮತ್ತು ಬುಧ ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುತ್ತವೆ. "ಕ್ರೋಧವು ಮನುಷ್ಯನ ವಿವೇಕವನ್ನು ನಾಶಮಾಡುತ್ತದೆ."\n\nಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಯಾವುದೇ ಆತುರದ ಪ್ರತೀಕಾರ ಅಥವಾ ವಾಗ್ವಾದಕ್ಕೆ ಹೋಗಬೇಡಿ. ಕನಿಷ್ಠ ೨೪ ರಿಂದ ೪೮ ಗಂಟೆಗಳ ಕಾಲ ಮೌನ ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ವಹಿಸಿ, ಪರಿಸ್ಥಿತಿ ಶಾಂತವಾಗಲು ಸಮಯ ಕೊಡಿ. ಮನಸ್ಸು ತಿಳಿಯಾದ ನಂತರ ಗೌರವಯುತವಾಗಿ, ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ಮಾತನಾಡಿ ಬಗೆಹರಿಸಿಕೊಳ್ಳಿ. ಶಾಂತಿಯೇ ನಿಮ್ಮ ದೊಡ್ಡ ಶಕ್ತಿ.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಜಗಳ ಅಥವಾ ಮನಸ್ತಾಪದಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಅಶಾಂತವಾಗಿರುವುದು ಸಹಜ. ಒಬ್ಬ ಹಿರಿಯ ಪುರೋಹಿತನಾಗಿ, ನಿಮ್ಮ ಶಾಂತಿಗಾಗಿ ಶಾಸ್ತ್ರದ ವಿವೇಕವನ್ನು ತಿಳಿಸುತ್ತೇನೆ.\n\nಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಕ್ಷಣಿಕ ಕೋಪ ಮತ್ತು ಜಗಳಗಳು ಜಾತಕದಲ್ಲಿ ಕುಜ (ಆಕ್ರೋಶ) ಮತ್ತು ಬುಧ (ತೀಕ್ಷ್ಣ ಮಾತು) ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುತ್ತವೆ. "ಕ್ರೋಧವು ಮನುಷ್ಯನ ವಿವೇಕವನ್ನು ನಾಶಮಾಡುತ್ತದೆ." ಕೋಪದಲ್ಲಿ ಆಡಿದ ಮಾತುಗಳು ಜೀವನಪರ್ಯಂತ ನೋವನ್ನುಂಟುಮಾಡಬಲ್ಲವು.\n\nಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಯಾವುದೇ ಆತುರದ ಪ್ರತೀಕಾರ ಅಥವಾ ವಾಗ್ವಾದಕ್ಕೆ ಹೋಗಬೇಡಿ. ಕನಿಷ್ಠ ೨೪ ರಿಂದ ೪೮ ಗಂಟೆಗಳ ಕಾಲ ಮೌನ ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ವಹಿಸಿ, ಪರಿಸ್ಥಿತಿ ಶಾಂತವಾಗಲು ಸಮಯ ಕೊಡಿ. ಮನಸ್ಸು ತಿಳಿಯಾದ ನಂತರ ಗೌರವಯುತವಾಗಿ, ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ಮಾತನಾಡಿ ಬಗೆಹರಿಸಿಕೊಳ್ಳಿ. ಶಾಂತಿಯೇ ನಿಮ್ಮ ದೊಡ್ಡ ಶಕ್ತಿ.`;

    case "LIFE_OVERVIEW_EXISTENTIAL":
      if (isEn) {
        if (isSubsequent) {
          return `Regarding your ongoing life path and current phase ("${userQuestion}"), life moves in celestial cycles of learning, perseverance, and triumph. If you are experiencing uncertainty right now, understand that this phase is meant to refine your inner strength and prepare you for a brighter chapter ahead.\n\nMaintain unwavering faith and discipline in your daily endeavors. Reciting the sacred Gayatri Mantra and offering humble prayers to Lord Mahabaleshwara will dissolve the prevailing clouds of confusion and reveal the right path forward.`;
        }
        return `Namaste ${session.name}. According to your birth chart calculated with Baggona Panchanga, you are guided by ${lagnaName} Lagna and ${moonRashi} Moon Sign, currently experiencing ${currentDashaText}.\n\nLife moves in celestial cycles of learning, perseverance, and triumph. If you are experiencing uncertainty right now, understand that this phase is meant to refine your inner strength and prepare you for a brighter chapter ahead.\n\nMaintain unwavering faith and discipline in your daily endeavors. Reciting the sacred Gayatri Mantra and offering humble prayers to Lord Mahabaleshwara will dissolve the prevailing clouds of confusion and reveal the right path forward.`;
      }
      if (isSubsequent) {
        return `ಜೀವನದ ಹಾದಿ ಮತ್ತು ಮುನ್ನಡೆಯ ಈ ಪ್ರಶ್ನೆಗೆ ("${userQuestion}") ಸಂಬಂಧಿಸಿದಂತೆ, ಪ್ರತಿಯೊಂದು ಕಾಲಘಟ್ಟವೂ ತನ್ನದೇ ಆದ ಮಂಥನ ಮತ್ತು ಅನುಭವಗಳನ್ನು ನೀಡುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಘಟನೆಗಳು ನಿಮ್ಮ ಧೈರ್ಯ ಮತ್ತು ಸಂಯಮವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದು, ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಶುಭ ಫಲಗಳಿಗೆ ದಾರಿಯಾಗಲಿವೆ.\n\nದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಧರ್ಮ, ಸತತ ಪ್ರಯತ್ನ ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಮತ್ತು ದೀಪಾರಾಧನೆಯಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸಕಲ ಗೊಂದಲಗಳು ನಿವಾರಣೆಯಾಗಿ, ಸಕಲ ಶುಭವಾಗಲಿದೆ.`;
      }
      return `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagnaName} ಲಗ್ನ ಹಾಗೂ ${moonRashi} ರಾಶಿಯಲ್ಲಿ ಜನ್ಮತಾಳಿದ್ದು, ಪ್ರಸ್ತುತ ${currentDashaText} ಅವಧಿಯು ಚಾಲ್ತಿಯಲ್ಲಿದೆ.\n\nಜೀವನದಲ್ಲಿ ಪ್ರತಿಯೊಂದು ಕಾಲಘಟ್ಟವೂ ತನ್ನದೇ ಆದ ಮಂಥನ ಮತ್ತು ಅನುಭವಗಳನ್ನು ನೀಡುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಘಟನೆಗಳು ನಿಮ್ಮ ಧೈರ್ಯ ಮತ್ತು ಸಂಯಮವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದು, ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಶುಭ ಫಲಗಳಿಗೆ ದಾರಿಯಾಗಲಿವೆ.\n\nದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಧರ್ಮ, ಸತತ ಪ್ರಯತ್ನ ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಮತ್ತು ದೀಪಾರಾಧನೆಯಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸಕಲ ಗೊಂದಲಗಳು ನಿವಾರಣೆಯಾಗಿ, ಸಕಲ ಶುಭವಾಗಲಿದೆ.`;

    case "CONVERSATIONAL_GREETING":
    default:
      if (isEn) {
        if (isSubsequent) {
          return `I am right here with you in this sacred consultation. Please continue with your questions or life situation whenever you are ready.`;
        }
        return `Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna shower their divine grace and blessings upon you and your family.\n\nI am seated here with you in this sacred 20-minute consultation. Please feel at complete peace. You may open your heart and ask any question regarding your life, travel, family, career, or spiritual path.`;
      }
      if (isSubsequent) {
        return `ಹೌದು, ನಾನು ನಿಮ್ಮೊಂದಿಗೇ ಈ ಸಮಾಲೋಚನಾ ಕೊಠಡಿಯಲ್ಲಿದ್ದೇನೆ. ನಿಮ್ಮ ಮುಂದಿನ ಪ್ರಶ್ನೆ ಅಥವಾ ಗೊಂದಲವನ್ನು ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ.`;
      }
      return `ಹರಿ ಓಂ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಕಲ ಕೃಪಾಕಟಾಕ್ಷ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೇಲೆ ಸದಾ ಇರಲಿ.\n\nನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಕೊಠಡಿಯಲ್ಲಿ ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಯಾವುದೇ ಪ್ರಶ್ನೆ, ದೈನಂದಿನ ಗೊಂದಲ, ಪ್ರವಾಸ, ಕುಟುಂಬ ಅಥವಾ ಜಾತಕ ವಿಚಾರಗಳ ಕುರಿತು ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ.`;
  }
}
