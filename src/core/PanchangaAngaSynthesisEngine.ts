import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { PlanetName, type KundliOutput, type Rashi, type Nakshatra } from "./AstroTypes";
import { normalizeDegree } from "./AstroMath";
import { signLord } from "./KundliInsightsEngine";
import { calculateKpSubLord } from "./kpSubLordEngine";
import { computeSubDivisionalAmsha } from "./subDivisions";
import { calculateHoroscopeRashmi } from "./rashmiChinthaEngine";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";

/* ==========================================================================
   1. 27 SOLAR-LUNAR YOGAS TAXONOMY & ENCYCLOPEDIC RULES
   ========================================================================== */

export interface YogaRule {
  index: number;
  sanskrit: string;
  english: string;
  isAuspicious: boolean;
  deity: string;
  karmicQuality: string;
  temperament: string;
  remedy?: string;
}

export const YOGA_RULES: YogaRule[] = [
  { index: 0, sanskrit: "ವಿಷ್ಕಂಭ (Vishkambha)", english: "Vishkambha", isAuspicious: false, deity: "Yama", karmicQuality: "Obstacle overcoming, initial friction followed by victory", temperament: "Determined, competitive, resilient", remedy: "Chant Yama Gayatri or Mahamrityunjaya Mantra" },
  { index: 1, sanskrit: "ಪ್ರೀತಿ (Priti)", english: "Priti", isAuspicious: true, deity: "Vishnu", karmicQuality: "Universal affection, magnetic goodwill, diplomatic grace", temperament: "Loving, charming, generous" },
  { index: 2, sanskrit: "ಆಯುಷ್ಮಾನ್ (Ayushman)", english: "Ayushman", isAuspicious: true, deity: "Chandra (Moon)", karmicQuality: "Longevity, vibrant cellular health, respected lineage", temperament: "Tranquil, steady, dignified" },
  { index: 3, sanskrit: "ಸೌಭಾಗ್ಯ (Saubhagya)", english: "Saubhagya", isAuspicious: true, deity: "Brahma", karmicQuality: "Inherent good fortune, material abundance, marital bliss", temperament: "Optimistic, radiant, cultured" },
  { index: 4, sanskrit: "ಶೋಭನ (Shobhana)", english: "Shobhana", isAuspicious: true, deity: "Brihaspati", karmicQuality: "Splendor, aesthetic mastery, moral excellence", temperament: "Noble, articulate, scholarly" },
  { index: 5, sanskrit: "ಅತಿಗಂಡ (Atiganda)", english: "Atiganda", isAuspicious: false, deity: "Moon / Agni", karmicQuality: "Family hurdles, emotional turbulence, need for patience", temperament: "Intense, questioning, volatile", remedy: "Offer milk to Shiva Linga on Mondays" },
  { index: 6, sanskrit: "ಸುಕರ್ಮ (Sukarma)", english: "Sukarma", isAuspicious: true, deity: "Indra", karmicQuality: "Righteous deeds, noble career achievements, prosperity", temperament: "Diligent, upright, reliable" },
  { index: 7, sanskrit: "ಧೃತಿ (Dhriti)", english: "Dhriti", isAuspicious: true, deity: "Jala (Water)", karmicQuality: "Patience, immense mental endurance, steadfast focus", temperament: "Persistent, tranquil, deep" },
  { index: 8, sanskrit: "ಶೂಲ (Shoola)", english: "Shoola", isAuspicious: false, deity: "Rudra", karmicQuality: "Sharp conflicts, digestive sensitivities, ascetic inclination", temperament: "Fiery, argumentative, piercing", remedy: "Chant Shiva Panchakshari Mantra (Om Namah Shivaya)" },
  { index: 9, sanskrit: "ಗಂಡ (Ganda)", english: "Ganda", isAuspicious: false, deity: "Agni", karmicQuality: "Karmic knot, initial struggles, unexpected sudden shifts", temperament: "Restless, investigative, rebellious", remedy: "Gokarna Navagraha Shanti & Ganapati Homa" },
  { index: 10, sanskrit: "ವೃದ್ಧಿ (Vriddhi)", english: "Vriddhi", isAuspicious: true, deity: "Surya", karmicQuality: "Continuous expansion of wealth, knowledge, and prestige", temperament: "Progressive, ambitious, benevolent" },
  { index: 11, sanskrit: "ಧ್ರುವ (Dhruva)", english: "Dhruva", isAuspicious: true, deity: "Bhumi (Earth)", karmicQuality: "Rock-solid stability, unshakeable convictions, fixed assets", temperament: "Firm, grounded, principled" },
  { index: 12, sanskrit: "ವ್ಯಾಘಾತ (Vyaghata)", english: "Vyaghata", isAuspicious: false, deity: "Vayu", karmicQuality: "Sudden disruptions, aggressive drive requiring channeling", temperament: "Brave, impulsive, sharp-witted", remedy: "Recite Hanuman Chalisa daily" },
  { index: 13, sanskrit: "ಹರ್ಷಣ (Harshana)", english: "Harshana", isAuspicious: true, deity: "Bhaga", karmicQuality: "Boundless joy, celebratory gatherings, social charisma", temperament: "Cheerful, witty, inspiring" },
  { index: 14, sanskrit: "ವಜ್ರ (Vajra)", english: "Vajra", isAuspicious: false, deity: "Varuna", karmicQuality: "Adamantine will, uncompromising rigidity, sudden wealth after hardship", temperament: "Unyielding, powerful, strict", remedy: "Offer water to Surya at sunrise" },
  { index: 15, sanskrit: "ಸಿದ್ಧಿ (Siddhi)", english: "Siddhi", isAuspicious: true, deity: "Ganesha", karmicQuality: "Spontaneous accomplishment, psychic intuition, fulfillment of goals", temperament: "Gifted, spiritually aligned, adept" },
  { index: 16, sanskrit: "ವ್ಯತೀಪಾತ (Vyatipata)", english: "Vyatipata", isAuspicious: false, deity: "Rudra", karmicQuality: "Caliber for massive transformation, severe karmic purging", temperament: "Profound, solitary, philosophical", remedy: "Feed cows and donate jaggery on Sundays" },
  { index: 17, sanskrit: "ವರೀಯಾನ್ (Variyana)", english: "Variyana", isAuspicious: true, deity: "Kubera", karmicQuality: "Luxury, noble comfort, refined tastes, financial acumen", temperament: "Magnanimous, aristocratic, prosperous" },
  { index: 18, sanskrit: "ಪರಿಘ (Parigha)", english: "Parigha", isAuspicious: false, deity: "Vishvakarma", karmicQuality: "Fortified boundaries, skepticism, financial secrecy", temperament: "Protective, guarded, strategic", remedy: "Light a sesame oil lamp on Saturdays" },
  { index: 19, sanskrit: "ಶಿವ (Shiva)", english: "Shiva", isAuspicious: true, deity: "Mahadeva", karmicQuality: "Spiritual purity, peaceful consciousness, profound meditation", temperament: "Serene, detached, wise" },
  { index: 20, sanskrit: "ಸಿದ್ಧ (Siddha)", english: "Siddha", isAuspicious: true, deity: "Kartikeya", karmicQuality: "Multifaceted skills, mastery over craft, rapid success", temperament: "Agile, confident, accomplished" },
  { index: 21, sanskrit: "ಸಾಧ್ಯ (Sadhya)", english: "Sadhya", isAuspicious: true, deity: "Savitri", karmicQuality: "Disciplined execution, patience, high scholarly ethics", temperament: "Methodical, devoted, humble" },
  { index: 22, sanskrit: "ಶುಭ (Shubha)", english: "Shubha", isAuspicious: true, deity: "Lakshmi", karmicQuality: "Pristine elegance, good health, auspicious blessings", temperament: "Graceful, righteous, blessed" },
  { index: 23, sanskrit: "ಶುಕ್ಲ (Shukla)", english: "Shukla", isAuspicious: true, deity: "Parvati", karmicQuality: "Luminous clarity, pure speech, respected authority", temperament: "Truthful, radiant, honest" },
  { index: 24, sanskrit: "ಬ್ರಹ್ಮ (Brahma)", english: "Brahma", isAuspicious: true, deity: "Ashwini Kumaras", karmicQuality: "High intellect, philosophical scholarship, guru status", temperament: "Visionary, profound, ethical" },
  { index: 25, sanskrit: "ಐಂದ್ರ (Indra)", english: "Indra", isAuspicious: true, deity: "Pitrs", karmicQuality: "Administrative leadership, regal aura, organizational dominance", temperament: "Commanding, dignified, authoritative" },
  { index: 26, sanskrit: "ವೈಧೃತಿ (Vaidhriti)", english: "Vaidhriti", isAuspicious: false, deity: "Diti", karmicQuality: "Deep psychological introspection, unconventional life path", temperament: "Complex, critical, reformist", remedy: "Chant Gayatri Mantra 108 times at sandhya" }
];

/* ==========================================================================
   2. 11 KARANAS TAXONOMY & ENCYCLOPEDIC RULES
   ========================================================================== */

export interface KaranaRule {
  nameKn: string;
  nameEn: string;
  type: "Chara" | "Sthira";
  rulingDeity: string;
  tatva: "Earth" | "Water" | "Fire" | "Air" | "Ether";
  symbol: string;
  executionQuality: string;
  isVishtiBhadra: boolean;
  remedy?: string;
}

export const KARANA_RULES: Record<string, KaranaRule> = {
  Bava: { nameKn: "ಬವ", nameEn: "Bava", type: "Chara", rulingDeity: "Indra", tatva: "Earth", symbol: "Lion (ಸಿಂಹ)", executionQuality: "Dynamic leadership, fearless commercial execution, high stamina", isVishtiBhadra: false },
  Balava: { nameKn: "ಬಾಲವ", nameEn: "Balava", type: "Chara", rulingDeity: "Brahma", tatva: "Water", symbol: "Leopard (ಚಿರತೆ)", executionQuality: "Scholarly pursuits, religious pilgrimage, creative elegance", isVishtiBhadra: false },
  Kaulava: { nameKn: "ಕೌಲವ", nameEn: "Kaulava", type: "Chara", rulingDeity: "Mitra", tatva: "Fire", symbol: "Pigeon (ಪಾರಿವಾಳ)", executionQuality: "Social harmony, unconditional friendship, artistic partnership", isVishtiBhadra: false },
  Taitila: { nameKn: "ತೈತಿಲ", nameEn: "Taitila", type: "Chara", rulingDeity: "Aryaman", tatva: "Air", symbol: "Donkey / Mule (ಕತ್ತೆ)", executionQuality: "Tenacious labor, material perseverance, wealth through endurance", isVishtiBhadra: false },
  Garaja: { nameKn: "ಗರಜ", nameEn: "Garaja", type: "Chara", rulingDeity: "Prithvi (Earth)", tatva: "Earth", symbol: "Elephant (ಆನೆ)", executionQuality: "Agricultural wealth, real estate foundation, steady compound gains", isVishtiBhadra: false },
  Vanija: { nameKn: "ವಣಿಜ", nameEn: "Vanija", type: "Chara", rulingDeity: "Lakshmi", tatva: "Water", symbol: "Bullock / Ox (ಎತ್ತು)", executionQuality: "Commercial trade, international commerce, acute negotiation prowess", isVishtiBhadra: false },
  Vishti: { nameKn: "ಭದ್ರೆ (ವಿಷ್ಟಿ)", nameEn: "Vishti (Bhadra)", type: "Chara", rulingDeity: "Yama", tatva: "Fire", symbol: "Hen / Wild Dog (ಶ್ವಾನ)", executionQuality: "Combative energy, destructive of enemies, requires patience for auspicious starts", isVishtiBhadra: true, remedy: "Avoid starting new ventures during Bhadra; worship Lord Kartikeya or Lord Shiva" },
  Shakuni: { nameKn: "ಶಕುನಿ", nameEn: "Shakuni", type: "Sthira", rulingDeity: "Garuda / Kali", tatva: "Air", symbol: "Crow (ಕಾಗೆ)", executionQuality: "Deep diagnostic intellect, herbal medicine expertise, foresight of risks", isVishtiBhadra: false, remedy: "Feed crows with cooked rice mixed with black sesame seeds on Saturdays" },
  Chatushpada: { nameKn: "ಚತುಷ್ಪಾದ", nameEn: "Chatushpada", type: "Sthira", rulingDeity: "Vrishabha / Shiva", tatva: "Earth", symbol: "Four-Legged Animal / Cow", executionQuality: "Dedication to ancestral traditions, pastoral wealth, patience", isVishtiBhadra: false, remedy: "Serve cows with fresh grass on Mondays" },
  Naga: { nameKn: "ನಾಗ", nameEn: "Naga", type: "Sthira", rulingDeity: "Nagas (Serpent Gods)", tatva: "Water", symbol: "Serpent (ಸರ್ಪ)", executionQuality: "Occult mastery, hypnotic influence, profound psychological insight", isVishtiBhadra: false, remedy: "Perform Naga Pratishtha / Nagabali or Rahu-Ketu Shanti" },
  Kintughna: { nameKn: "ಕಿಂಸ್ತುಘ್ನ", nameEn: "Kintughna", type: "Sthira", rulingDeity: "Vayu / Kubera", tatva: "Ether", symbol: "Worm / Dragonfly", executionQuality: "Universal goodwill, elimination of miseries, righteous charity", isVishtiBhadra: false }
};

/* ==========================================================================
   3. PRESCRIPTION MODELS & TALKING POINTS
   ========================================================================== */

export interface AstrologicalPrescriptions {
  rudraksha: {
    mukhi: number;
    nameKn: string;
    nameEn: string;
    deity: string;
    planet: PlanetName;
    astrologicalReason: string;
    wearingMethod: string;
    panchangaSynergy: string;
  };
  gemstoneRing: {
    primaryGemstoneKn: string;
    primaryGemstoneEn: string;
    sanskritName: string;
    caratWeight: string;
    metalKn: string;
    metalEn: string;
    fingerKn: string;
    fingerEn: string;
    astrologicalReason: string;
    activationDay: string;
    panchangaSynergy: string;
  };
  luckyAttributes: {
    carColors: string[];
    clothColors: string[];
    avoidColors: string[];
    directions: string[];
    numbers: number[];
  };
  shantiPooja: {
    nameKn: string;
    nameEn: string;
    purpose: string;
  };
}

export interface TechnicalKundliAspects {
  fourthHouseDetail: string;
  fifthHouseDetail: string;
  seventhHouseDetail: string;
  ninthHouseDetail: string;
  tenthHouseDetail: string;
  trikaAfflictionsDetail: string;
}

export interface CurrentLifeDiagnosis {
  mentalStateIssue: {
    hasIssue: boolean;
    domain: "Manassu (Mental Peace)" | "Peaceful";
    severity: "High" | "Moderate" | "Calm";
    diagnosis: string;
  };
  primaryLifeChallenge: {
    area: "Personal / Marriage" | "Career / Workplace" | "Progeny / Children" | "Financial / Debts" | "Health / Vitality" | "General Transition";
    description: string;
    planetaryRootCause: string;
  };
  prasthuthaSthiti: {
    runningDashaSummary: string;
    runningGocharaSummary: string;
    activeTithiSthiti: string;
    immediateRemedies: string[];
  };
  astrologerTalkingPoints: {
    openingIceBreakerKn: string;
    hiddenSubconsciousWorryKn: string;
    karmaFinancialRealityKn: string;
    immediateTurningPointKn: string;
    siddhaPariharaRemedyKn: string;
    technicalAspectsCueKn: string;
    openingIceBreakerEn?: string;
    hiddenSubconsciousWorryEn?: string;
    karmaFinancialRealityEn?: string;
    immediateTurningPointEn?: string;
    siddhaPariharaRemedyEn?: string;
  };
  technicalAspects: TechnicalKundliAspects;
}

export interface InstantQAQuestion {
  id: string;
  category: "career" | "marriage" | "mind" | "wealth" | "children";
  categoryLabelKn: string;
  questionKn: string;
  questionEn: string;
  panditScriptKn: string;
  astrologicalBasisKn: string;
  immediateRemedyKn: string;
}

export interface PanchangaSynthesisOutput {
  panchanga: {
    vara: { nameKn: string; nameEn: string; lord: PlanetName; tatva: string };
    tithi: { nameKn: string; nameEn: string; paksha: string; jalTatvaQuality: string };
    nakshatra: { nameKn: string; nameEn: string; lord: PlanetName; deity: string };
    yoga: { nameKn: string; nameEn: string; rule: YogaRule };
    karana: { nameKn: string; nameEn: string; rule: KaranaRule };
  };
  prescriptions: AstrologicalPrescriptions;
  currentDiagnosis: CurrentLifeDiagnosis;
  instantQAList: InstantQAQuestion[];
  multiParagraphExecutiveReading: string[];
}

/* ==========================================================================
   4. PRESCRIPTION GENERATION LOGIC (5-ANGAS UNIFIED - ENGLISH DIGITS)
   ========================================================================== */

export const generateAstrologicalPrescriptions = (
  kundli: KundliOutput,
  yogaRule?: YogaRule,
  karanaRule?: KaranaRule
): AstrologicalPrescriptions => {
  const yRule = yogaRule || YOGA_RULES[0]!;
  const kRule = karanaRule || KARANA_RULES["Bava"]!;
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const lagnaLord = signLord(lagnaRashiIdx);
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const nakIndex = moon ? moon.nakshatra.index : 0;
  const nakLord = calculateKpSubLord(moon?.degree ?? 0).nakshatraLord;

  // 1. Rudraksha Selection based on Lagna Lord, Nakshatra & Karana Tatva (English Digits)
  const rudrakshaMap: Record<PlanetName, { mukhi: number; nameKn: string; nameEn: string; deity: string }> = {
    [PlanetName.Sun]: { mukhi: 1, nameKn: "1 Mukhi Rudraksha (1 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "1 Mukhi Rudraksha", deity: "Lord Shiva (Surya Tatva)" },
    [PlanetName.Moon]: { mukhi: 2, nameKn: "2 Mukhi Rudraksha (2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "2 Mukhi Rudraksha", deity: "Ardhanarishvara (Chandra Tatva)" },
    [PlanetName.Mars]: { mukhi: 3, nameKn: "3 Mukhi Rudraksha (3 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "3 Mukhi Rudraksha", deity: "Lord Agni (Mangala Tatva)" },
    [PlanetName.Mercury]: { mukhi: 4, nameKn: "4 Mukhi Rudraksha (4 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "4 Mukhi Rudraksha", deity: "Lord Brahma (Budha Tatva)" },
    [PlanetName.Jupiter]: { mukhi: 5, nameKn: "5 Mukhi Rudraksha (5 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "5 Mukhi Rudraksha", deity: "Lord Kalagni Rudra (Guru Tatva)" },
    [PlanetName.Venus]: { mukhi: 6, nameKn: "6 Mukhi Rudraksha (6 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "6 Mukhi Rudraksha", deity: "Lord Kartikeya (Shukra Tatva)" },
    [PlanetName.Saturn]: { mukhi: 7, nameKn: "7 Mukhi Rudraksha (7 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "7 Mukhi Rudraksha", deity: "Goddess Mahalakshmi (Shani Tatva)" },
    [PlanetName.Rahu]: { mukhi: 8, nameKn: "8 Mukhi Rudraksha (8 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "8 Mukhi Rudraksha", deity: "Lord Ganesha (Rahu Tatva)" },
    [PlanetName.Ketu]: { mukhi: 9, nameKn: "9 Mukhi Rudraksha (9 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ)", nameEn: "9 Mukhi Rudraksha", deity: "Goddess Durga (Ketu Tatva)" }
  };

  const selectedRudraksha = rudrakshaMap[lagnaLord] || rudrakshaMap[PlanetName.Jupiter];

  // 2. Gemstone Ring Selection (ಉಂಗುರ / ರತ್ನ - English Digits)
  const gemstoneMap: Record<PlanetName, {
    kn: string; en: string; sanskrit: string; carat: string; metalKn: string; metalEn: string; fingerKn: string; fingerEn: string;
  }> = {
    [PlanetName.Sun]: { kn: "ಮಾಣಿಕ್ಯ (Ruby)", en: "Ruby", sanskrit: "Manikya", carat: "3.5 - 5.25 Carats", metalKn: "ಚಿನ್ನ (Gold) ಅಥವಾ ತಾಮ್ರ", metalEn: "Gold or Copper", fingerKn: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", fingerEn: "Ring Finger of Right Hand" },
    [PlanetName.Moon]: { kn: "ಮುತ್ತು (Natural Pearl)", en: "Natural Pearl", sanskrit: "Mukta", carat: "4.25 - 6.5 Carats", metalKn: "ಬೆಳ್ಳಿ (Silver)", metalEn: "Pure Silver", fingerKn: "ಕಿರುಬೆರಳು (Little Finger)", fingerEn: "Little Finger of Right Hand" },
    [PlanetName.Mars]: { kn: "ಹವಳ (Red Coral)", en: "Red Coral", sanskrit: "Pravala", carat: "5.25 - 7.5 Carats", metalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ", metalEn: "Copper or Gold", fingerKn: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", fingerEn: "Ring Finger of Right Hand" },
    [PlanetName.Mercury]: { kn: "ಪಚ್ಚೆ (Emerald / Patsche)", en: "Emerald (Patsche)", sanskrit: "Marakata", carat: "3.25 - 5.0 Carats", metalKn: "ಚಿನ್ನ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Gold or Panchadhatu", fingerKn: "ಕಿರುಬೆರಳು (Little Finger)", fingerEn: "Little Finger of Right Hand" },
    [PlanetName.Jupiter]: { kn: "ಪುಷ್ಪರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire", sanskrit: "Pushparaga", carat: "4.25 - 6.0 Carats", metalKn: "ಅಪ್ಪಟ ಚಿನ್ನ (Pure Gold)", metalEn: "Pure Gold", fingerKn: "ತೋರುಬೆರಳು (Index Finger)", fingerEn: "Index Finger of Right Hand" },
    [PlanetName.Venus]: { kn: "ವಜ್ರ (Diamond) ಅಥವಾ ವೈಟ್ ಜಿರ್ಕಾನ್", en: "Diamond or White Zircon", sanskrit: "Vajra / Heera", carat: "0.75 - 1.5 Carats", metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಪ್ಲಾಟಿನಂ", metalEn: "Silver or Platinum", fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಉಂಗುರದ ಬೆರಳು", fingerEn: "Middle or Ring Finger" },
    [PlanetName.Saturn]: { kn: "ನೀಲಂ (Blue Sapphire)", en: "Blue Sapphire (Neelam)", sanskrit: "Neelam", carat: "4.5 - 6.25 Carats", metalKn: "ಪಂಚಧಾತು ಅಥವಾ ಬೆಳ್ಳಿ", metalEn: "Panchadhatu or Silver", fingerKn: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", fingerEn: "Middle Finger of Right Hand" },
    [PlanetName.Rahu]: { kn: "ಗೋಮೇಧಿಕ (Hessonite / Gomed)", en: "Hessonite (Gomed)", sanskrit: "Gomedhika", carat: "4.25 - 6.0 Carats", metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Silver or Panchadhatu", fingerKn: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", fingerEn: "Middle Finger of Right Hand" },
    [PlanetName.Ketu]: { kn: "ವೈಢೂರ್ಯ (Cat's Eye)", en: "Cat's Eye (Vaidurya)", sanskrit: "Vaidurya", carat: "3.5 - 5.5 Carats", metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Silver or Panchadhatu", fingerKn: "ಉಂಗುರದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು", fingerEn: "Ring or Little Finger" }
  };

  const selectedGem = gemstoneMap[lagnaLord] || gemstoneMap[PlanetName.Jupiter];

  // 3. Lucky Attributes (English Digits)
  const colorMap: Record<number, { car: string[]; cloth: string[]; avoid: string[]; dir: string[]; nums: number[] }> = {
    0: { car: ["Deep Red", "Bright Crimson", "Copper Metallic"], cloth: ["Red", "Saffron", "Golden Yellow"], avoid: ["Jet Black", "Dark Navy"], dir: ["East", "South"], nums: [1, 9, 3] },
    1: { car: ["Pearl White", "Silver Grey", "Pastel Sky Blue"], cloth: ["White", "Cream", "Light Pink"], avoid: ["Muddy Brown", "Charcoal"], dir: ["North", "Southeast"], nums: [6, 5, 2] },
    2: { car: ["Emerald Green", "Metallic Mint", "Ivory White"], cloth: ["Green", "Turquoise", "Cream"], avoid: ["Deep Red", "Dark Maroon"], dir: ["North", "Northeast"], nums: [5, 6, 1] },
    3: { car: ["Pearl White", "Moonlight Silver", "Soft Cream"], cloth: ["Milk White", "Silver", "Pale Yellow"], avoid: ["Black", "Dark Blue"], dir: ["East", "Northwest"], nums: [2, 7, 9] },
    4: { car: ["Imperial Gold", "Burnt Orange", "Ruby Maroon"], cloth: ["Saffron", "Golden Orange", "Red"], avoid: ["Dark Blue", "Grey"], dir: ["East", "Northeast"], nums: [1, 5, 9] },
    5: { car: ["Forest Green", "Champagne Gold", "Silver"], cloth: ["Olive Green", "Light Emerald", "White"], avoid: ["Bright Red", "Orange"], dir: ["North", "East"], nums: [5, 6, 2] },
    6: { car: ["Glacier White", "Sky Blue", "Silver Frost"], cloth: ["Royal Blue", "Diamond White", "Rose Pink"], avoid: ["Yellow", "Orange"], dir: ["West", "Northwest"], nums: [6, 7, 8] },
    7: { car: ["Dark Maroon", "Mahogany Red", "Glossy Black"], cloth: ["Crimson Red", "Dark Orange", "Ochre"], avoid: ["Light Green", "Mint"], dir: ["South", "East"], nums: [9, 1, 3] },
    8: { car: ["Bright Saffron", "Golden Yellow", "Deep Bronze"], cloth: ["Yellow", "Turmeric Gold", "Cream"], avoid: ["Black", "Dark Slate"], dir: ["Northeast", "East"], nums: [3, 1, 9] },
    9: { car: ["Midnight Blue", "Gunmetal Grey", "Deep Black"], cloth: ["Navy Blue", "Dark Violet", "Charcoal"], avoid: ["Bright Red", "Neon Pink"], dir: ["West", "South"], nums: [8, 5, 6] },
    10: { car: ["Steel Grey", "Cobalt Blue", "Dark Titanium"], cloth: ["Sky Blue", "Dark Blue", "Smoky White"], avoid: ["Bright Saffron", "Red"], dir: ["West", "North"], nums: [8, 4, 7] },
    11: { car: ["Golden Yellow", "Seafoam Green", "Pearl White"], cloth: ["Pale Yellow", "Gold", "Ivory"], avoid: ["Dark Charcoal", "Black"], dir: ["Northeast", "North"], nums: [3, 2, 9] }
  };

  const lucky = colorMap[lagnaRashiIdx] || colorMap[0];

  return {
    rudraksha: {
      mukhi: selectedRudraksha.mukhi,
      nameKn: selectedRudraksha.nameKn,
      nameEn: selectedRudraksha.nameEn,
      deity: selectedRudraksha.deity,
      planet: lagnaLord,
      astrologicalReason: `ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯಾದ ${lagnaLord} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರದ ತರಂಗಾಂತರವನ್ನು ಶುದ್ಧೀಕರಿಸಲು, ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ವೃದ್ಧಿಸಲು ಈ ${selectedRudraksha.mukhi} Mukhi ರುದ್ರಾಕ್ಷಿಯು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
      wearingMethod: "ಸೋಮವಾರ ಅಥವಾ ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ ಹಸಿ ಹಾಲಿನಲ್ಲಿ ಮತ್ತು ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' 108 ಬಾರಿ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
      panchangaSynergy: `ಜನ್ಮ ನಕ್ಷತ್ರಾಧಿಪತಿ (${nakLord}) ಮತ್ತು ಕರಣ ತತ್ವದ (${kRule.tatva}) ಜೊತೆಗೆ ಅದ್ಭುತ ಸಮನ್ವಯ ಸಾಧಿಸುತ್ತದೆ.`
    },
    gemstoneRing: {
      primaryGemstoneKn: selectedGem.kn,
      primaryGemstoneEn: selectedGem.en,
      sanskritName: selectedGem.sanskrit,
      caratWeight: selectedGem.carat,
      metalKn: selectedGem.metalKn,
      metalEn: selectedGem.metalEn,
      fingerKn: selectedGem.fingerKn,
      fingerEn: selectedGem.fingerEn,
      astrologicalReason: `ಲಗ್ನ ಬಲವನ್ನು ಸ್ಥಿರಗೊಳಿಸಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಮತ್ತು ದಶಾ ಸಂಧಿಕಾಲದ ಅಡೆತಡೆಗಳಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಲು ಈ ${selectedGem.kn} (${selectedGem.carat}) ಭಾಗ್ಯ ರತ್ನ ಉಂಗುರವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`,
      activationDay: lagnaLord === PlanetName.Jupiter ? "ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ" : lagnaLord === PlanetName.Venus ? "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ" : lagnaLord === PlanetName.Sun ? "ಭಾನುವಾರ ಪ್ರಾತಃಕಾಲ" : "ಬುಧವಾರ / ಶನಿವಾರ ಪ್ರಾತಃಕಾಲ",
      panchangaSynergy: `ಯೋಗದ ಪ್ರಭಾವವನ್ನು (${yRule.sanskrit}) ಶುಭ ಫಲಕ್ಕೆ ತಿರುಗಿಸಲು ಹಾಗೂ ಲಗ್ನ ಬಲವನ್ನು ಹೆಚ್ಚಿಸಲು ಸಹಕಾರಿಯಾಗಿದೆ.`
    },
    luckyAttributes: {
      carColors: lucky.car,
      clothColors: lucky.cloth,
      avoidColors: lucky.avoid,
      directions: lucky.dir,
      numbers: lucky.nums
    },
    shantiPooja: {
      nameKn: "ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ & ಮೃತ್ಯುಂಜಯ ಸಂಪುಟ ನವಗ್ರಹ ಶಾಂತಿ",
      nameEn: "Gokarna Maha Ganapati & Mrityunjaya Navagraha Shanti",
      purpose: "ದಶಾ ಸಂಧಿಯ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ನಿವಾರಣೆ ಮತ್ತು ಆಯುರ್-ಆರೋಗ್ಯ ವೃದ್ಧಿ."
    }
  };
};

/* ==========================================================================
   5. REAL-TIME LIFE DIAGNOSIS & DEEP TECHNICAL ASPECTS
   ========================================================================== */

export const generateCurrentLifeDiagnosis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number },
  prescriptions?: AstrologicalPrescriptions
): CurrentLifeDiagnosis => {
  const ageDecimal = ageDecimalYearsAt(context.birthDate, context.birthTime, context.latitude, context.longitude, new Date());
  const dasha = findBhuktiAtAge(kundli, ageDecimal);
  const maha = dasha?.maha.planet ?? PlanetName.Sun;
  const bhukti = dasha?.bhukti ?? PlanetName.Sun;

  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const sun = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const mercury = kundli.planets.find((p) => p.name === PlanetName.Mercury);
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find((p) => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find((p) => p.name === PlanetName.Ketu);

  // House occupants mapping
  const getHousePlanets = (h: number) => kundli.planets.filter((p) => p.house === h).map((p) => toKannadaPlanet(p.name));

  // 1. Technical House Aspects Breakdown
  const h4Planets = getHousePlanets(4);
  const h5Planets = getHousePlanets(5);
  const h7Planets = getHousePlanets(7);
  const h9Planets = getHousePlanets(9);
  const h10Planets = getHousePlanets(10);

  const fourthHouseDetail = h4Planets.length > 0 
    ? `4ನೇ ಮನೆಯಲ್ಲಿ (ಸುಖ/ಮನಸ್ಸು ಸ್ಥಾನ) ${h4Planets.join(", ")} ಗ್ರಹ ಸ್ಥಿತನಾಗಿದೆ.` 
    : `4ನೇ ಮನೆಯು ಶುಭ ಗ್ರಹಗಳ ಶುದ್ಧ ದೃಷ್ಟಿಯಲ್ಲಿದೆ.`;

  const fifthHouseDetail = h5Planets.length > 0
    ? `5ನೇ ಮನೆಯಲ್ಲಿ (ಬುದ್ಧಿ/ಪೂರ್ವಪುಣ್ಯ ಸ್ಥಾನ) ${h5Planets.join(", ")} ಇರುವುದರಿಂದ ತೀಕ್ಷ್ಣ ಗ್ರಹಿಕೆ ಇದೆ.`
    : `5ನೇ ಮನೆಯು ಗುರು/ಶುಭ ಗ್ರಹಗಳ ಕಾರಕತ್ವದಲ್ಲಿದೆ.`;

  const seventhHouseDetail = h7Planets.length > 0
    ? `7ನೇ ಮನೆಯಲ್ಲಿ (ಕಳತ್ರ/ದಾಂಪತ್ಯ ಸ್ಥಾನ) ${h7Planets.join(", ")} ಗ್ರಹದ ಪ್ರಭಾವವಿದೆ.`
    : `7ನೇ ಮನೆಯ ಮೇಲೆ ಲಗ್ನಾಧಿಪತಿಯ 7ನೇ ಪೂರ್ಣ ದೃಷ್ಟಿ ಇದೆ.`;

  const ninthHouseDetail = h9Planets.length > 0
    ? `9ನೇ ಮನೆಯಲ್ಲಿ (ಭಾಗ್ಯ ಸ್ಥಾನ) ${h9Planets.join(", ")} ಇರುವುದರಿಂದ ದೈವಬಲ ಉತ್ತಮವಾಗಿದೆ.`
    : `9ನೇ ಮನೆಯು ಧರ್ಮ ಮತ್ತು ಭಾಗ್ಯ ವೃದ್ಧಿಗೆ ಸಹಕಾರಿಯಾಗಿದೆ.`;

  const tenthHouseDetail = h10Planets.length > 0
    ? `10ನೇ ಮನೆಯಲ್ಲಿ (ಕರ್ಮ/ವೃತ್ತಿ ಸ್ಥಾನ) ${h10Planets.join(", ")} ಗ್ರಹ ಸ್ಥಿತನಾಗಿದೆ.`
    : `10ನೇ ಮನೆಯ ಅಧಿಪತಿಯು ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ತರಲಿದ್ದಾನೆ.`;

  const trikaAfflictionsDetail = moon && [6, 8, 12].includes(moon.house)
    ? `ಚಂದ್ರನು ${moon.house}ನೇ ತ್ರಿಕ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಮಾನಸಿಕ ಸೂಕ್ಷ್ಮತೆ ಹೆಚ್ಚಿದೆ.`
    : `ತ್ರಿಕ ಸ್ಥಾನಗಳ ದೋಷಗಳು ಗೌಣವಾಗಿವೆ.`;

  const technicalAspects: TechnicalKundliAspects = {
    fourthHouseDetail,
    fifthHouseDetail,
    seventhHouseDetail,
    ninthHouseDetail,
    tenthHouseDetail,
    trikaAfflictionsDetail
  };

  // 2. Mental State Issue Diagnosis
  let mentalIssue = false;
  let mentalSeverity: CurrentLifeDiagnosis["mentalStateIssue"]["severity"] = "Calm";
  let mentalDiagnosis = "ನಿಮ್ಮ ಮನಸ್ಸು ಪ್ರಸ್ತುತ ಸಮತೋಲನದಲ್ಲಿದೆ; ಆದರೂ ಸೂಕ್ಷ್ಮ ವಿಚಾರಗಳಿಗೆ ಹೆಚ್ಚು ಆಲೋಚಿಸುವುದನ್ನು (Overthinking) ಕಡಿಮೆ ಮಾಡಿಕೊಳ್ಳಿ.";

  if (moon && [6, 8, 12].includes(moon.house)) {
    mentalIssue = true;
    mentalSeverity = "High";
    mentalDiagnosis = `ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನು ${moon.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ (ತ್ರಿಕ ಸ್ಥಾನ), ಮನಸ್ಸಿನಲ್ಲಿ ಸುಮ್ಮನೆ ಅಂಜಿಕೆ, ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಏರಿಳಿತಗಳು ಆಗಾಗ ಕಾಡುತ್ತವೆ.`;
  } else if (moon && rahu && (moon.house === rahu.house || Math.abs(moon.house - rahu.house) === 6)) {
    mentalIssue = true;
    mentalSeverity = "High";
    mentalDiagnosis = "ಚಂದ್ರ-ರಾಹು ಸಂಯೋಗ/ದೃಷ್ಟಿಯ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಅತಿಯಾದ ಕಲ್ಪನೆಗಳು, ನಿರಾಶಾವಾದ ಹಾಗೂ ಅಶಾಂತಿ ಉಂಟಾಗುತ್ತಿದೆ.";
  } else if (saturn && moon && Math.abs(saturn.house - moon.house) === 0) {
    mentalIssue = true;
    mentalSeverity = "Moderate";
    mentalDiagnosis = "ಶನಿ-ಚಂದ್ರ (ವಿಷ ಯೋಗ) ಪ್ರಭಾವದಿಂದ ಹೊಣೆಗಾರಿಕೆಯ ಹೊರೆ ಹೆಚ್ಚಾಗಿ ಮನಸ್ಸಿಗೆ ವಿಶ್ರಾಂತಿ ಸಿಗುತ್ತಿಲ್ಲ.";
  }

  // 3. Primary Life Challenge Assessment
  let challengeArea: CurrentLifeDiagnosis["primaryLifeChallenge"]["area"] = "General Transition";
  let challengeDesc = "ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಮತ್ತು ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಅಡಿಪಾಯ ಹಾಕುವ ಹಂತ.";
  let rootCause = `ಪ್ರಸ್ತುತ ${maha} ಮಹಾದಶಾ ಮತ್ತು ${bhukti} ಭುಕ್ತಿಯ ಸಂಚಾರ.`;

  const seventhLord = signLord((kundli.lagnaRashi.index + 6) % 12);
  const seventhLordPlanet = kundli.planets.find((p) => p.name === seventhLord);
  const tenthLord = signLord((kundli.lagnaRashi.index + 9) % 12);
  const tenthLordPlanet = kundli.planets.find((p) => p.name === tenthLord);

  if (ageDecimal >= 24 && ageDecimal <= 58 && tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) {
    challengeArea = "Career / Workplace";
    challengeDesc = "ಉದ್ಯೋಗದಲ್ಲಿ ನಿರೀಕ್ಷಿತ ಮನ್ನಣೆ ವಿಳಂಬ, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಅಥವಾ ಹೊಸ ಉದ್ಯೋಗದ ಹುಡುಕಾಟ.";
    rootCause = `10ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${toKannadaPlanet(tenthLord)} ಗ್ರಹವು ${tenthLordPlanet.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದು.`;
  } else if (seventhLordPlanet && [6, 8].includes(seventhLordPlanet.house)) {
    challengeArea = "Personal / Marriage";
    challengeDesc = "ದಾಂಪತ್ಯದಲ್ಲಿ ಅಥವಾ ಕುಟುಂಬದಲ್ಲಿ ಅನಗತ್ಯ ಮಾತುಕತೆಗಳಿಂದ ವೈಮನಸ್ಸು, ಸಂಗಾತಿಯ ಹಠಮಾರಿತನ ಅಥವಾ ವಿವಾಹ ನಿಶ್ಚಯದಲ್ಲಿ ಅಡೆತಡೆ.";
    rootCause = `7ನೇ ಮನೆಯ ಅಧಿಪತಿ ${toKannadaPlanet(seventhLord)} ಗ್ರಹದ ಸ್ಥಾನ ಬಲದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ದೋಷ.`;
  } else if (kundli.maandi && [1, 7, 8].includes(kundli.maandi.rashi.index - kundli.lagnaRashi.index + 1)) {
    challengeArea = "Financial / Debts";
    challengeDesc = "ಆದಾಯಕ್ಕಿಂತ ಖರ್ಚು ಹೆಚ್ಚು, ಕೈಗೆ ಬಂದ ಹಣ ನಿಲ್ಲದಿರುವುದು ಅಥವಾ ಸಾಲ ತೀರಿಸುವ ಒತ್ತಡ.";
    rootCause = "ಮಾಂದಿಯ ಸೂಕ್ಷ್ಮ ಸಂಚಾರ ಮತ್ತು ಹಣದ ಸೋರಿಕೆ ನೋಡ್ ಸಕ್ರಿಯವಾಗಿರುವುದು.";
  }

  // 4. Immediate Remedies (English Digits)
  const immediateRemedies = [
    `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ: ಸೂರ್ಯ ಗಾಯತ್ರಿ ಅಥವಾ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ.`,
    `ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ: ನೈಋತ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ.`,
    `ದೈವಿಕ ಸಂಕಲ್ಪ: ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ.`
  ];

  // 5. Secret Astrologer Verbal Prompts (5 Master Dynamic Fields - 2 Paragraphs Each)
  const lagnaName = kundli.lagnaRashi.sanskrit;
  const lagnaEng = kundli.lagnaRashi.english;
  const moonRashiName = kundli.moonSign.sanskrit;
  const moonNakName = moon?.nakshatra.english ?? "Ashwini";

  // Field 1: Opening Icebreaker / The Direct Hook / "The Grill"
  const openingP1 = `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪ್ರವೇಶಿಸಿದ ತಕ್ಷಣ ನಿಮ್ಮ ${lagnaName} ಲಗ್ನ ಹಾಗೂ ${moonRashiName} ರಾಶಿಯ ${moonNakName} ನಕ್ಷತ್ರದ ಗ್ರಹ ಸಂಯೋಜನೆಯು ಎದ್ದು ಕಾಣುತ್ತದೆ. ನಿಮ್ಮ ಮೂಲ ಪ್ರಕೃತಿ ಅತ್ಯಂತ ಸ್ವಾಭಿಮಾನಿ, ನೇರ ನಿಷ್ಠುರ ಹಾಗೂ ಅನ್ಯಾಯವನ್ನು ಎಂದಿಗೂ ಸಹಿಸದ ಪ್ರಾಮಾಣಿಕ ಗುಣವನ್ನು ಹೊಂದಿದೆ. ನೀವು ಎಂದಿಗೂ ಯಾರ ಮುಂದೆಯೂ ಅನಗತ್ಯವಾಗಿ ಕೈಚಾಚುವವರಲ್ಲ; ನಿಮ್ಮ ಸ್ವಂತ ಪರಿಶ್ರಮದ ಮೇಲೆ ಮಾತ್ರ ಬಲವಾದ ನಂಬಿಕೆ ಇಟ್ಟವರು. ಆದರೆ ನಿಮ್ಮ ಈ ಅತಿಯಾದ ನೇರ ನಡವಳಿಕೆ ಮತ್ತು ಮುಚ್ಚುಮರೆಯಿಲ್ಲದ ಮಾತುಗಳೇ ಇತ್ತೀಚಿನ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಜನರಲ್ಲಿ ಕಸಿವಿಸಿ ಉಂಟುಮಾಡಿದೆ ಮತ್ತು ನೀವು ಮಾಡದ ತಪ್ಪಿಗೂ ನಿಮ್ಮ ಮೇಲೆ ಅಪವಾದ ಅಥವಾ ಆಪಾದನೆಗಳು ಬರುವಂತೆ ಮಾಡಿದೆ, ಹೌದಲ್ಲವೇ?`;

  const openingP2 = challengeArea === "Career / Workplace"
    ? `ವಿಶೇಷವಾಗಿ ಕಳೆದ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಿಂದ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಒಂದು ನಿರ್ದಿಷ್ಟ ಘಟನೆ ನಡೆದುಹೋಗಿದೆ. ನೀವು ಕಚೇರಿಯಲ್ಲಿ ನಿಸ್ವಾರ್ಥವಾಗಿ ಮತ್ತು ನಿಷ್ಠೆಯಿಂದ ಹಗಲಿರುಳು ಶ್ರಮಪಟ್ಟರೂ, ಆ ಶ್ರಮದ ಕೀರ್ತಿ ಮತ್ತು ಮನ್ನಣೆ ನಿಮ್ಮ ಕೈತಪ್ಪಿ ಬೇರೆಯವರ ಪಾಲಾಗಿದೆ. ನೀವು ನಂಬಿದ ಸಹೋದ್ಯೋಗಿಗಳು ಅಥವಾ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳು ನಿಮ್ಮ ವಿರುದ್ಧ ತೆರೆಮರೆಯಲ್ಲಿ ತಂತ್ರಗಳನ್ನು ರೂಪಿಸಿ ನಿಮ್ಮನ್ನು ಕಡೆಗಣಿಸಿರುವುದು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಬಿದ್ದ ತೀವ್ರ ಆಘಾತವಾಗಿದೆ. ನೀವು ಇಂದು ನನ್ನ ಬಳಿ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ ಬಯಸಿ ಬಂದಿರುವುದು ಕೇವಲ ಭವಿಷ್ಯ ತಿಳಿಯಲು ಅಲ್ಲ; ನಿಮ್ಮ ಆತ್ಮಗೌರವಕ್ಕೆ ಆದ ಅನ್ಯಾಯಕ್ಕೆ ನ್ಯಾಯ ಮತ್ತು ಮುಕ್ತಿ ಪಡೆಯಲು.`
    : challengeArea === "Personal / Marriage"
    ? `ವಿಶೇಷವಾಗಿ ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ನಿಮ್ಮ ಕೌಟುಂಬಿಕ ಅಥವಾ ವೈವಾಹಿಕ ಜೀವನದಲ್ಲಿ ಒಂದು ಅನಿರೀಕ್ಷಿತ ತಿರುವು ಸಂಭವಿಸಿದೆ. ನೀವು ಇತರರ ಒಳಿತಿಗಾಗಿ ಮತ್ತು ಕುಟುಂಬದ ಹಿತಕ್ಕಾಗಿ ತೆಗೆದುಕೊಂಡ ಸದುದ್ದೇಶದ ನಿರ್ಧಾರಗಳನ್ನು ಆಪ್ತರೇ ತಪ್ಪಾಗಿ ಗ್ರಹಿಸಿ, ನಿಮ್ಮ ಮೇಲೆಯೇ ದೋಷ ಹೊರಿಸುವ ವಾತಾವರಣ ಸೃಷ್ಟಿಯಾಗಿದೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನ ನೋವನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಲಾಗದೆ, ಮನೆಯಲ್ಲೇ ಏಕಾಂಗಿತನದ ಸಂಕಟವನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ. ಈ ಸಂಬಂಧಗಳ ಬಿಕ್ಕಟ್ಟಿಗೆ ಶಾಶ್ವತ ಪರಿಹಾರ ಕಂಡುಕೊಳ್ಳುವ ತುಡಿತವೇ ನಿಮ್ಮನ್ನು ಇಂದು ಇಲ್ಲಿಗೆ ಕರೆತಂದಿದೆ.`
    : challengeArea === "Financial / Debts"
    ? `ವಿಶೇಷವಾಗಿ ಕಳೆದ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ ಆರ್ಥಿಕ ವಲಯದಲ್ಲಿ ಆದ ಒಂದು ಹಿನ್ನಡೆ ನಿಮ್ಮ ದೈನಂದಿನ ಶಾಂತಿಯನ್ನು ಕೆಡಿಸಿದೆ. ನೀವು ನಂಬಿ ಕೊಟ್ಟ ಹಣ ಅಥವಾ ಬರಬೇಕಾದ ವ್ಯಾಪಾರದ ಬಾಕಿ ಹಣ ಸಮಯಕ್ಕೆ ಕೈಸೇರದೆ, ಬಂಡವಾಳ ಮತ್ತು ದೈನಂದಿನ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಪರದಾಡುವಂತಾಗಿದೆ. ಹಣದ ಸೋರಿಕೆಯು ನಿಮ್ಮ ಎಲ್ಲಾ ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ತಡೆಯೊಡ್ಡಿದೆ. ಈ ಆರ್ಥಿಕ ಸಂಕೋಲೆಯಿಂದ ಹೊರಬಂದು ಸ್ವಾವಲಂಬನೆ ಮರಳಿ ಪಡೆಯುವ ದೃಢ ಸಂಕಲ್ಪದೊಂದಿಗೆ ನೀವು ಇಂದು ಬಂದಿದ್ದೀರಿ.`
    : `ವಿಶೇಷವಾಗಿ ಕಳೆದ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಿಂದ ನಿಮ್ಮ ಜೀವನದ ದಿಕ್ಕನ್ನೇ ಬದಲಿಸುವಂತಹ ಒಂದು ಅನಿರೀಕ್ಷಿತ ಘರ್ಷಣೆ ಅಥವಾ ಮಾನಸಿಕ ತೊಳಲಾಟ ನಿಮ್ಮಲ್ಲಿ ಆರಂಭವಾಗಿದೆ. ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ತಕ್ಕ ವೇದಿಕೆ ಸಿಗದೆ, ಎಷ್ಟೇ ಪ್ರಯತ್ನಿಸಿದರೂ ಕೆಲಸಗಳು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೈತಪ್ಪಿ ಹೋಗುತ್ತಿರುವುದು ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದೆ. ಈ ಅಡೆತಡೆಗಳ ನಿಜವಾದ ಮೂಲ ಕಾರಣ ಮತ್ತು ದೈವಿಕ ಪರಿಹಾರ ತಿಳಿಯಲು ನೀವು ಇಂದು ಬಂದಿದ್ದೀರಿ.`;

  const openingIceBreakerKn = `${openingP1}\n\n${openingP2}`;

  // Field 2: Hidden Subconscious Worry & Mental State
  const hiddenP1 = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮನಃಕಾರಕ ಚಂದ್ರನ ಸ್ಥಾನ (${moon?.house ?? 1}ನೇ ಭಾವ) ಹಾಗೂ 4ನೇ ಮನೆಯ (ಸುಖ/ನೆಮ್ಮದಿ ಸ್ಥಾನ) ಗ್ರಹ ಪ್ರಭಾವವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ನೋಡಿದರೆ, ಹೊರಜಗತ್ತಿಗೆ ನೀವು ಅತ್ಯಂತ ಧೈರ್ಯಶಾಲಿ ಮತ್ತು ಸ್ಥಿರ ಮನಸ್ಸಿನವರಂತೆ ಕಂಡರೂ, ನಿಮ್ಮ ಅಂತರಂಗದಲ್ಲಿ ಸದಾ ಒಂದು ಹೇಳಿಕೊಳ್ಳಲಾಗದ ಸುಪ್ತ ಆತಂಕ ಜ್ವಾಲೆಯಂತೆ ಧಗಧಗಿಸುತ್ತಿದೆ. ಪ್ರಮುಖವಾಗಿ ರಾತ್ರಿ 2:00 AM ರಿಂದ 4:30 AM ರ ಮುಂಜಾನೆಯ ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತದ ಹೊತ್ತಿಗೆ ನಿಮಗೆ ಗಾಢ ನಿದ್ರೆ ಬಾರದೆ, ಹಳೆಯ ಕಹಿ ಘಟನೆಗಳು, ಅವಮಾನಗಳು ಹಾಗೂ ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ಯೋಚನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ನಿರಂತರವಾಗಿ ಕಾಡುತ್ತಿವೆ.`;

  const hiddenP2 = mentalIssue
    ? `'ನನ್ನ ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ತ್ಯಾಗವನ್ನು ಮನೆಯಲ್ಲಿ ಅಥವಾ ಸಮಾಜದಲ್ಲಿ ಯಾರೂ ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿಲ್ಲ; ಪ್ರತಿಯೊಬ್ಬರೂ ತಮ್ಮ ಸ್ವಾರ್ಥ ಮುಗಿದ ಮೇಲೆ ನನ್ನನ್ನು ಕಡೆಗಣಿಸುತ್ತಾರೆ' ಎಂಬ ಆಳವಾದ ಅಸಹಾಯಕತೆ ನಿಮ್ಮನ್ನು ದಿನನಿತ್ಯ ಕೊರಗುವಂತೆ ಮಾಡಿದೆ. ಈ ಭಾವನಾತ್ಮಕ ನೋವನ್ನು ನೀವು ಯಾರ ಮುಂದೆಯೂ ಬಿಚ್ಚಿಡದೆ ನಿಮ್ಮೊಳಗೇ ಹೂತುಹಾಕುತ್ತಿರುವುದು ನಿಮ್ಮ ನರಮಂಡಲ ಮತ್ತು ರಕ್ತದೊತ್ತಡದ ಮೇಲೆ ಒತ್ತಡವನ್ನುಂಟುಮಾಡುತ್ತಿದೆ. ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ದೈವಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ಭರವಸೆಯ ಅವಶ್ಯಕತೆ ಇದೆ.`
    : `ನೀವು ಸದಾ ಕುಟುಂಬದ ಹಿತ, ಮಕ್ಕಳ ಭವಿಷ್ಯ ಹಾಗೂ ಆಪ್ತರ ರಕ್ಷಣೆಯ ಬಗ್ಗೆಯೇ ಅತಿಯಾಗಿ ಆಲೋಚಿಸುತ್ತಿದ್ದೀರಿ (Overthinking). ಎಲ್ಲರನ್ನೂ ಜೊತೆಯಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆಯಬೇಕೆಂಬ ನಿಮ್ಮ ಹಂಬಲಕ್ಕೆ ಇತರರಿಂದ ನಿರೀಕ್ಷಿತ ಸಹಕಾರ ಸಿಗದಿರುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಆಂತರಿಕ ಬೇಸರವನ್ನುಂಟುಮಾಡಿದೆ. ನಿಮ್ಮೊಳಗಿನ ಈ ಆತಂಕವನ್ನು ನೀವು ಮೌನವಾಗಿ ನುಂಗಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ; ಆದರೆ ಈ ಮೌನವೇ ನಿಮ್ಮ ನೆಮ್ಮದಿಯನ್ನು ಕಸಿಯುತ್ತಿದೆ.`;

  const hiddenSubconsciousWorryKn = `${hiddenP1}\n\n${hiddenP2}`;

  // Field 3: Karma, Career & Financial Bottleneck
  const karmaP1 = `ಕರ್ಮ ಸ್ಥಾನವಾದ 10ನೇ ಮನೆ ಹಾಗೂ ಧನ ಸ್ಥಾನವಾದ 2ನೇ ಮತ್ತು 11ನೇ ಮನೆಗಳ ಗ್ರಹಬಲದ ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ನಿಮ್ಮ ವೃತ್ತಿ, ಉದ್ಯೋಗ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೀವು ಶೇಕಡಾ 100 ರಷ್ಟು ನಿಷ್ಠೆ ಮತ್ತು ಕಠಿಣ ಪರಿಶ್ರಮವನ್ನು ಹಾಕುತ್ತಿದ್ದರೂ, ಪ್ರಸ್ತುತ ಸಿಗುತ್ತಿರುವ ಪ್ರತಿಫಲ ಮಾತ್ರ ಕೇವಲ ಶೇಕಡಾ 40 ರಿಂದ 50 ರಷ್ಟು ಮಾತ್ರ. ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕ ವೇತನ, ಬಡ್ತಿ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಮನ್ನಣೆ ಸಿಗದೆ, ನಿಮ್ಮ ಜಾಗದಲ್ಲಿ ಕಡಿಮೆ ಪರಿಶ್ರಮದ ವ್ಯಕ್ತಿಗಳು ಸುಲಭವಾಗಿ ಲಾಭ ಪಡೆಯುತ್ತಿರುವುದು ನಿಮ್ಮ ಕರ್ಮದ ಅಗ್ನಿಪರೀಕ್ಷೆಯಾಗಿದೆ.`;

  const karmaP2 = `ಇದಲ್ಲದೆ, ಕೈಗೆ ಬಂದ ಆದಾಯವು ಉಳಿತಾಯವಾಗದೆ ಯಾವುದಾದರೊಂದು ಅನಿರೀಕ್ಷಿತ ಖರ್ಚು, ಆರೋಗ್ಯ ಸಮಸ್ಯೆ, ವಾಹನ ದುರಸ್ತಿ ಅಥವಾ ಕೌಟುಂಬಿಕ ತುರ್ತು ಅಗತ್ಯಗಳಿಗೆ ನೀರಿನಂತೆ ಸೋರಿಹೋಗುತ್ತಿದೆ. 'ನನ್ನ ಶ್ರಮಕ್ಕೆ ಶಾಶ್ವತ ಫಲ ಸಿಗುವ ಕಾಲ ಯಾವಾಗ ಬರಲಿದೆ?' ಎಂಬ ಪ್ರಶ್ನೆ ನಿಮ್ಮನ್ನು ಸದಾ ಕಾಡುತ್ತಿದೆ. ಆದರೆ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿರುವ ಕರ್ಮದ ಅಧಿಪತಿಯು ನಿಮ್ಮನ್ನು ವೃತ್ತಿಪರವಾಗಿ ಹದಗೊಳಿಸುತ್ತಿದ್ದಾನೆ; ಈ ಹಿನ್ನಡೆಗಳು ನಿಮ್ಮ ಮುಂದಿನ ಮಹತ್ತರ ಜಯಕ್ಕೆ ಅಡಿಪಾಯವಾಗಲಿವೆ.`;

  const karmaFinancialRealityKn = `${karmaP1}\n\n${karmaP2}`;

  // Field 4: Exact Turning Point Timeline & Gochara Shift
  const turningP1 = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆಯ ${bhukti} ಭುಕ್ತಿಯ ಅಂತ್ಯದ ಹಂತ ಹಾಗೂ ಮುಂಬರುವ ಗೋಚಾರ ಗ್ರಹಗಳ ಚಲನೆಯನ್ನು ಗಣಿತೀಯವಾಗಿ ಲೆಕ್ಕ ಹಾಕಿದರೆ, ಈ ಕಠಿಣ ಗ್ರಹಪರೀಕ್ಷೆಯ ಅವಧಿ ಶಾಶ್ವತವಲ್ಲ. ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 3 to 5 Months), ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಬೃಹತ್ ಸಕಾರಾತ್ಮಕ ಗ್ರಹಗತಿಯ ತಿರುವು (Major Astrological Turning Point) ನಿಖರವಾಗಿ ಘಟಿಸಲಿದೆ. ಗೋಚಾರ ಗುರುವಿನ ಪೂರ್ಣ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ 10ನೇ ಮತ್ತು 2ನೇ ಭಾವಗಳ ಮೇಲೆ ಬೀಳಲಾರಂಭಿಸುತ್ತದೆ.`;

  const turningP2 = `ಈ ಶುಭ ಕಾಲಾವಧಿಯು ಆರಂಭವಾಗುತ್ತಿದ್ದಂತೆ, ನಿಮ್ಮ ವಿರುದ್ಧ ಇದ್ದ ಶತ್ರು ಬಾಧೆಗಳು, ಕಚೇರಿಯ ಅಪವಾದಗಳು ಹಾಗೂ ಕೌಟುಂಬಿಕ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ತಾವಾಗಿಯೇ ಬಗೆಹರಿಯಲಿವೆ. ಹೊಸ ಉದ್ಯೋಗದ ಪ್ರಸ್ತಾಪ, ಗೌರವಯುತ ಸ್ಥಾನ ಬದಲಾವಣೆ ಅಥವಾ ವ್ಯಾಪಾರದಲ್ಲಿ ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಧನಾಗಮನವು ಪುನರಾರಂಭವಾಗಲಿದೆ. ಧೈರ್ಯಗೆಡದೆ ಮುನ್ನಡೆಯಿರಿ; ನಿಮ್ಮ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆ ಮುಗಿದು ಭಾಗ್ಯೋದಯದ ಹೊಸ ಅಧ್ಯಾಯವು ತೆರೆದುಕೊಳ್ಳುವ ದಿನಗಳು ಅತ್ಯಂತ ಸಮೀಪದಲ್ಲಿವೆ.`;

  const immediateTurningPointKn = `${turningP1}\n\n${turningP2}`;

  // Field 5: Siddha Remedies, Gemstone, Rudraksha & Temple Sankalpa
  const gemName = prescriptions?.gemstoneRing?.primaryGemstoneKn || "ಮಾಣಿಕ್ಯ";
  const gemCarat = prescriptions?.gemstoneRing?.caratWeight || "4.25 - 5.50 ಕ್ಯಾರಟ್";
  const gemMetal = prescriptions?.gemstoneRing?.metalKn || "ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ";
  const gemFinger = prescriptions?.gemstoneRing?.fingerKn || "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)";
  const rudraName = prescriptions?.rudraksha?.nameKn || "ಏಕಮುಖಿ ಅಥವಾ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ";

  const remedyP1 = `ಈ ಗ್ರಹ ದೋಷಗಳ ತಕ್ಷಣದ ಶಾಂತಿಗಾಗಿ ಮತ್ತು ನಿಮ್ಮ ${lagnaName} ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ, ನೀವು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಪ್ರಾಣಪ್ರತಿಷ್ಠಾಪನೆ ಮಾಡಿ ಶುದ್ಧೀಕರಿಸಿದ ${gemName} ರತ್ನವನ್ನು (${gemCarat}) ${gemMetal}ದಲ್ಲಿ ಮಾಡಿಸಿ ${gemFinger}ದಲ್ಲಿ ಶುಭ ದಿನದಂದು ಧರಿಸಬೇಕು. ಇದರೊಂದಿಗೆ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಯ ಅನುಗ್ರಹಕ್ಕಾಗಿ ${rudraName}ಯನ್ನು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ ಕಂಠದಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅಂತರಂಗದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ನಿವಾರಣೆಯಾಗಿ, ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವು ಸಿದ್ಧವಾಗುತ್ತದೆ.`;

  const remedyP2 = `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರವನ್ನು 11 ಬಾರಿ ಪಠಿಸಿ ಹಾಗೂ ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ ನೈಋತ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ. ದೈವಿಕ ಪರಿಹಾರವಾಗಿ, ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಹೆಸರಿನಲ್ಲಿ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ. ಈ ದೈವಿಕ ಉಪಾಸನೆಯು ನಿಮ್ಮ ಸಮಸ್ತ ಕರ್ಮ ದೋಷಗಳನ್ನು ಭಸ್ಮ ಮಾಡಿ, ನಿಮ್ಮ ಮುಂಬರುವ 3 ರಿಂದ 5 ತಿಂಗಳ ಕಾಲಾವಧಿಯಲ್ಲಿ ಸಂಪೂರ್ಣ ಯಶಸ್ಸು ತರಲಿದೆ.`;

  const siddhaPariharaRemedyKn = `${remedyP1}\n\n${remedyP2}`;
  const technicalAspectsCueKn = `ಜಾತಕದ 4ನೇ ಮನೆಯ ಮನಃಸ್ಥಿತಿ, 10ನೇ ಮನೆಯ ಕರ್ಮ ಸ್ಥಾನ ಮತ್ತು ಪ್ರಸ್ತುತ ${maha}-${bhukti} ದಶಾ ಸಂಧಿಕಾಲದ ಪ್ರಭಾವದಿಂದ ಈ ಘಟನೆಗಳು ನಡೆಯುತ್ತಿವೆ.`;

  // English counterparts for complete bilingual capability
  const openingIceBreakerEn = `Looking deeply into your chart, your ${lagnaEng} Ascendant and Moon in ${kundli.moonSign.english} with ${moonNakName} Nakshatra creates a fiercely independent, highly principled, and honest character. You never solicit favors unnecessarily, relying entirely on your own diligent efforts. However, this very straightforwardness and refusal to flatter has recently created friction among people around you, causing unfair misunderstandings or blame to be directed at you without any fault of your own.\n\nSpecifically, over the past 3 to 6 months, a triggering incident in your active environment has shaken your peace. Despite working selflessly, credit for your work was denied or diverted to others. You have come today not merely to know about the future, but to reclaim your rightful dignity and find divine justice for this unfair burden.`;

  const hiddenSubconsciousWorryEn = `Looking at Moon's sensitive placement (House ${moon?.house ?? 1}) and the 4th house of mental serenity, while you appear courageous and steady to the outside world, an unspoken inner anxiety burns quietly within you. Particularly between 2:00 AM and 4:30 AM during the pre-dawn hours, deep restorative sleep is disrupted as memories of past betrayals and worries about future uncertainty persistently occupy your mind.\n\nA feeling that 'no one at home or in society truly understands my sacrifices and honesty; everyone takes me for granted' causes you quiet sorrow. Because you suppress these emotions rather than expressing them, it is taking a toll on your inner vitality. Your mind requires immediate divine reassurance and peace.`;

  const karmaFinancialRealityEn = `According to your 10th house of profession and 2nd/11th houses of finances, even though you are investing 100% devotion and hard work into your career or business, you are currently realizing only 40% to 50% of the rightful returns. Less deserving individuals are moving forward easily while you face tests of endurance.\n\nFurthermore, incoming revenue leaks away into unexpected expenses, emergency commitments, or household obligations. The question 'when will my labor bear permanent fruit?' troubles you. However, your 10th lord is tempering your expertise; these delays are laying the foundation for your imminent breakthrough.`;

  const immediateTurningPointEn = `Calculating the ending phase of running ${maha} Mahadasha with ${bhukti} Antardasha and upcoming Gochara planetary transits, this difficult testing period is strictly temporary. Over the Next 3 to 5 Months, a major positive astrological turning point will occur as benefic Jupiterian aspects illuminate your 10th and 2nd houses.\n\nAs this window activates, workplace opposition and familial misunderstandings will dissolve naturally. New career openings, honor, or recovery of blocked funds will materialize. Maintain your inner courage; the planetary tide is turning in your favor.`;

  const siddhaPariharaRemedyEn = `To pacify these planetary afflictions and energize your ${lagnaEng} Lagna Lord, you should wear an energized ${prescriptions?.gemstoneRing?.primaryGemstoneEn || "Ruby"} gemstone (${gemCarat}) set in ${prescriptions?.gemstoneRing?.metalEn || "Gold"} on the ${prescriptions?.gemstoneRing?.fingerEn || "Ring finger"} on an auspicious weekday. Additionally, adorning an authentic ${prescriptions?.rudraksha?.nameEn || "Rudraksha"} around the neck will create an impenetrable shield against negative vibrations.\n\nChant the Surya Gayatri Mantra 11 times every morning and light a sesame oil lamp facing southwest on Saturday evenings. Perform a special Bilvarchana and Navagraha prayer at sacred Gokarna Mahabaleshwara Kshetra in your birth star name to dissolve karmic obstacles and guarantee complete success.`;

  return {
    mentalStateIssue: {
      hasIssue: mentalIssue,
      domain: mentalIssue ? "Manassu (Mental Peace)" : "Peaceful",
      severity: mentalSeverity,
      diagnosis: mentalDiagnosis
    },
    primaryLifeChallenge: {
      area: challengeArea,
      description: challengeDesc,
      planetaryRootCause: rootCause
    },
    prasthuthaSthiti: {
      runningDashaSummary: `ಪ್ರಸ್ತುತ ಮಹಾದಶಾ: ${maha} | ಪ್ರಸ್ತುತ ಭುಕ್ತಿ: ${bhukti}. ಈ ಕಾಲಾವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ.`,
      runningGocharaSummary: `ಗೋಚಾರ ಗುರುವು ಜ್ಞಾನ ಮತ್ತು ರಕ್ಷಣೆಯನ್ನು ನೀಡುತ್ತಿದ್ದರೆ, ಶನಿಯು ತಾಳ್ಮೆ ಮತ್ತು ಕಠಿಣ ಪರಿಶ್ರಮವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ.`,
      activeTithiSthiti: `ಪಂಚಾಂಗ ತತ್ವಗಳ ಸಮತೋಲನಕ್ಕಾಗಿ ದೇವತಾ ಪ್ರಾರ್ಥನೆ ಅಗತ್ಯ.`,
      immediateRemedies
    },
    astrologerTalkingPoints: {
      openingIceBreakerKn,
      hiddenSubconsciousWorryKn,
      karmaFinancialRealityKn,
      immediateTurningPointKn,
      siddhaPariharaRemedyKn,
      technicalAspectsCueKn,
      openingIceBreakerEn,
      hiddenSubconsciousWorryEn,
      karmaFinancialRealityEn,
      immediateTurningPointEn,
      siddhaPariharaRemedyEn
    },
    technicalAspects
  };
};

/* ==========================================================================
   6. INSTANT ONE-TAP QUESTIONS & ANSWERS GENERATOR (ENGLISH DIGITS)
   ========================================================================= */

export const generateInstantQAList = (
  kundli: KundliOutput,
  diagnosis: CurrentLifeDiagnosis,
  prescriptions: AstrologicalPrescriptions,
  devoteeName?: string
): InstantQAQuestion[] => {
  const name = devoteeName || "ಭಕ್ತರೇ";
  const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const moonNakKn = toKannadaNakshatra(moon?.nakshatra.english);
  const moonHouse = moon?.house ?? 1;

  // Key House Lords in pure Kannada (Ravi, Kuja, Guru, Shukra, Shani, Budha, Chandra, Rahu, Ketu)
  const tenthLord = signLord((kundli.lagnaRashi.index + 9) % 12);
  const tenthLordKn = toKannadaPlanet(tenthLord);
  const seventhLord = signLord((kundli.lagnaRashi.index + 6) % 12);
  const seventhLordKn = toKannadaPlanet(seventhLord);
  const fifthLord = signLord((kundli.lagnaRashi.index + 4) % 12);
  const fifthLordKn = toKannadaPlanet(fifthLord);
  const secondLord = signLord((kundli.lagnaRashi.index + 1) % 12);
  const secondLordKn = toKannadaPlanet(secondLord);
  const eleventhLord = signLord((kundli.lagnaRashi.index + 10) % 12);
  const eleventhLordKn = toKannadaPlanet(eleventhLord);
  const sixthLord = signLord((kundli.lagnaRashi.index + 5) % 12);
  const sixthLordKn = toKannadaPlanet(sixthLord);
  const fourthLord = signLord((kundli.lagnaRashi.index + 3) % 12);
  const fourthLordKn = toKannadaPlanet(fourthLord);

  // House occupants
  const h4PlanetsKn = kundli.planets.filter((p) => p.house === 4).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fourthLordKn} ಅಧಿಪತ್ಯ`;
  const h7PlanetsKn = kundli.planets.filter((p) => p.house === 7).map((p) => toKannadaPlanet(p.name)).join(", ") || `${seventhLordKn} ಅಧಿಪತ್ಯ`;
  const h10PlanetsKn = kundli.planets.filter((p) => p.house === 10).map((p) => toKannadaPlanet(p.name)).join(", ") || `${tenthLordKn} ಅಧಿಪತ್ಯ`;
  const h5PlanetsKn = kundli.planets.filter((p) => p.house === 5).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fifthLordKn} ಅಧಿಪತ್ಯ`;

  const dashaMaha = diagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.replace("ಪ್ರಸ್ತುತ ಮಹಾದಶಾ:", "").trim() || "ದಶಾ ಕಾಲ";
  const dashaMahaKn = toKannadaPlanet(dashaMaha);

  const gemName = prescriptions?.gemstoneRing?.primaryGemstoneKn || "ಮಾಣಿಕ್ಯ";
  const gemCarat = prescriptions?.gemstoneRing?.caratWeight || "4.25 - 5.50 ಕ್ಯಾರಟ್";
  const gemMetal = prescriptions?.gemstoneRing?.metalKn || "ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ";
  const gemFinger = prescriptions?.gemstoneRing?.fingerKn || "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)";
  const rudraName = prescriptions?.rudraksha?.nameKn || "ರುದ್ರಾಕ್ಷಿ";

  return [
    // 1. CAREER & BUSINESS
    {
      id: "q_career_1",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವೃತ್ತಿ",
      questionKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಯಾವಾಗ ಪ್ರಗತಿ ಅಥವಾ ಹೊಸ ಅವಕಾಶ ಸಿಗುತ್ತದೆ?",
      questionEn: "When will I get career progress or a new job opportunity?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ 10ನೇ ಮನೆಯಲ್ಲಿ (ಕರ್ಮ ಸ್ಥಾನ) ${tenthLordKn} ಗ್ರಹದ ಸ್ಥಿತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaMahaKn} ಮಹಾದಶೆಯ ಪ್ರಭಾವದಿಂದ ನಿಮಗೆ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ವಲ್ಪ ಇವಾಗ ತೊಂದರೆ ಹಂಗೆ ಕಾಣಿಸ್ತಾ ಇದೆ. ನೀವು ಕಚೇರಿಯಲ್ಲಿ ಹಗಲಿರುಳು ನಿಸ್ವಾರ್ಥವಾಗಿ ಮತ್ತು ಅತ್ಯಂತ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಶ್ರಮಪಟ್ಟರೂ, ಆ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗದೆ ನಿಮ್ಮ ಜಾಗದಲ್ಲಿ ಬೇರೆಯವರಿಗೆ ಸುಲಭವಾಗಿ ಆದ್ಯತೆ ಸಿಕ್ಕಿರುವುದು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ತೀವ್ರ ನೋವುಂಟುಮಾಡಿದೆ, ಹೌದಲ್ಲವೇ? 10ನೇ ಮನೆಯ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${h10PlanetsKn} ಇರುವ ಕಾರಣ ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ತಕ್ಕ ವೇದಿಕೆ ಸಿಗದೆ ತಾತ್ಕಾಲಿಕ ಅಡೆತಡೆಗಳು ಉಂಟಾಗುತ್ತಿವೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೈನಂದಿನ ಮಾನಸಿಕ ಸ್ಥಿತಿಯನ್ನು ನೋಡಿದರೆ, ನೀವು ಕಚೇರಿಗೆ ಪ್ರತಿದಿನ ಹೋದರೂ ಪೂರ್ಣ ಉತ್ಸಾಹವಿಲ್ಲದೆ ಕೇವಲ ಕರ್ತವ್ಯ ಮುಗಿಸುವಂತಾಗಿದೆ. "ನನ್ನ ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮ ಮತ್ತು ನಿಷ್ಠೆಗೆ ಈ ಸಂಸ್ಥೆಯಲ್ಲಿ ಬೆಲೆಯೇ ಇಲ್ಲವೇ?" ಎಂಬ ಅಸಹಾಯಕತೆಯ ಭಾವನೆ ನಿಮ್ಮನ್ನು ದಿನನಿತ್ಯ ಕಾಡ್ತಾನೆ ಇದೆ. ಕೆಲಸವನ್ನು ತಕ್ಷಣವೇ ಬದಲಾಯಿಸಬೇಕೆಂಬ ಬಲವಾದ ತುಡಿತ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿದ್ದರೂ, ಬೇರೆ ಕಡೆ ಹೋದರೂ ಇದೇ ರೀತಿಯ ರಾಜಕೀಯ ಅಥವಾ ವಾತಾವರಣ ಇರಲಿದೆಯೇ ಎಂಬ ಅಂಜಿಕೆ ನಿಮ್ಮ ಮಹತ್ವದ ನಿರ್ಧಾರಗಳನ್ನು ತಡೆಹಿಡಿದಿದೆ. ಈ ತರಹದ ಕೆಲವೊಂದು ಅನಿಶ್ಚಿತ ಪರಿಸ್ಥಿತಿಗಳಿಂದ ನೀವು ನಿದ್ರಾಹೀನತೆಯಾಗಿ ರಾತ್ರಿ ವೇಳೆ ಏನೋ ಯೋಚನೆ ಮಾಡ್ತಾ ನಿಮ್ಮ ಅಮೂಲ್ಯ ಕಾಲ ಕಳಿತಾ ಇದೀರಾ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${tenthLordKn} ಗ್ರಹದ ಮುಂಬರುವ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ದಶಾ ಸಂಧಿಕಾಲದ ಗಣಿತೀಯ ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಈ ಕಠಿಣ ಪರೀಕ್ಷೆಯ ಅವಧಿ ದೀರ್ಘಕಾಲ ಉಳಿಯುವುದಿಲ್ಲ. ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ ಜೀವನದಲ್ಲಿ ಹೊಸ ಅತ್ಯುತ್ತಮ ಉದ್ಯೋಗಾವಕಾಶ, ಗೌರವಯುತ ಸ್ಥಾನ ಬದಲಾವಣೆ ಅಥವಾ ಬಹುದಿನಗಳಿಂದ ನಿರೀಕ್ಷಿಸುತ್ತಿದ್ದ ಬಡ್ತಿಯ ಶುಭ ಯೋಗ ಖಚಿತವಾಗಿ ಒದಗಿಬರಲಿದೆ. ಗೋಚಾರ ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳಲಾರಂಭಿಸಿದ ತಕ್ಷಣ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆಗೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಶ್ಲಾಘನೆ ಮತ್ತು ಅರ್ಹ ಪ್ರತಿಫಲ ಸಿಗುವ ಕಾಲ ಸಮೀಪಿಸಿದೆ.

ಅಲ್ಲಿಯವರೆಗೆ ಕಚೇರಿಯಲ್ಲಿ ಯಾವುದೇ ಅನಗತ್ಯ ವಾದ-ವಿವಾದಗಳಿಗೆ ಹೋಗದೆ ನಿಮ್ಮ ಕೆಲಸದ ಕಡೆಗೆ ಮಾತ್ರ ಗಮನಹರಿಸಿ. ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ ಬಲವರ್ಧನೆಗಾಗಿ ಮತ್ತು ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕೀರ್ತಿ ಹೆಚ್ಚಿಸಲು ${gemName} (${gemCarat}) ರತ್ನವನ್ನು ${gemMetal}ದಲ್ಲಿ ಮಾಡಿಸಿ ${gemFinger}ದಲ್ಲಿ ಧರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಇದರೊಂದಿಗೆ ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ರವಿ ಗಾಯತ್ರಿ ಅಥವಾ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`),
      astrologicalBasisKn: `10ನೇ ಮನೆ (ಕರ್ಮ ಸ್ಥಾನ) ${tenthLordKn} ಗ್ರಹದ ಸ್ಥಿತಿ ಮತ್ತು ಗುರು-ಶನಿ ಗೋಚಾರ ಫಲ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ರವಿ ಗಾಯತ್ರಿ ಪಠಿಸಿ ಮತ್ತು ${gemName} ಧರಿಸಿ.`
    },
    {
      id: "q_career_2",
      category: "career",
      categoryLabelKn: "💼 ವ್ಯಾಪಾರ & ವಾಣಿಜ್ಯ",
      questionKn: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ವೃದ್ಧಿ ಮತ್ತು ನಷ್ಟದಿಂದ ಮುಕ್ತಿ ಯಾವಾಗ?",
      questionEn: "When will business turn profitable and overcome loss?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ 2ನೇ ಮನೆಯ ಧನಕೋಶ ಹಾಗೂ 11ನೇ ಮನೆಯ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${eleventhLordKn} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ವ್ಯಾಪಾರದಲ್ಲಿ ಇತ್ತೀಚೆಗೆ ಕೈಗೊಂಡ ಒಂದು ನಿರ್ಧಾರ ಅಥವಾ ನಂಬಿದ ವ್ಯಕ್ತಿಯಿಂದ ಉಂಟಾದ ಆರ್ಥಿಕ ಹೊಡೆತವು ನಿಮ್ಮ ವ್ಯವಹಾರದ ಗತಿಯನ್ನೇ ನಿಧಾನಗೊಳಿಸಿದೆ. ಬರಬೇಕಾದ ಬಾಕಿ ಹಣವು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಕೈಸೇರದೆ, ದಿನನಿತ್ಯದ ವ್ಯಾಪಾರ ನಿರ್ವಹಣೆ ಮತ್ತು ಸರಕು ಖರೀದಿಗೆ ಬಂಡವಾಳ ಹೊಂದಿಸುವುದೇ ದೊಡ್ಡ ಸಾಹಸವಾಗಿ ಪರಿಣಮಿಸಿದೆ.

ಈ ಘಟನೆಯಿಂದಾಗಿ ಈಗ ನಿಮ್ಮ ಮನಸ್ಸಲ್ಲಿ ನೆಮ್ಮದಿ ಇಲ್ಲ, ವ್ಯಾಪಾರವನ್ನು ಮುಂದುವರಿಸಬೇಕೋ ಅಥವಾ ಪರ್ಯಾಯ ವ್ಯವಹಾರವನ್ನು ನೋಡಬೇಕೋ ಎಂಬ ಗೊಂದಲ ನಿಮ್ಮನ್ನು ಸದಾ ಕಾಡ್ತಾನೆ ಇದೆ. ನೀವು ಎಷ್ಟು ಸಕಾರಾತ್ಮಕವಾಗಿ ಹೊಸ ಗ್ರಾಹಕರನ್ನು ಆಕರ್ಷಿಸಲು ಪ್ರಯತ್ನಿಸಿದರೂ, ಹಣಕಾಸಿನ ಮುಗ್ಗಟ್ಟು ನಿಮ್ಮ ಯಾವುದೇ ಹೊಸ ವಿಸ್ತರಣಾ ಯೋಜನೆಗಳನ್ನು ಕಾರ್ಯರೂಪಕ್ಕೆ ತರಲು ಬಿಡುತ್ತಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ವ್ಯಾಪಾರಕ್ಕೆ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ತೀವ್ರ ಸ್ಪರ್ಧೆ ಮತ್ತು ನಂಬಿಕೆದ್ರೋಹಗಳು ಪದೇ ಪದೇ ತೊಂದ್ರೆ ಕೊಡ್ತಾ ಇರಬಹುದು.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ ಧನ ಸ್ಥಾನದ ಮೇಲಿನ ಶುಭ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಂಚಾರದ ಪ್ರಕಾರ, ಪ್ರಸ್ತುತ ಇರುವ ಆರ್ಥಿಕ ಹಿನ್ನಡೆ ಶಾಶ್ವತವಲ್ಲ. ಇನ್ನು ಮುಂದಿನ 4 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನಿಮ್ಮ ವ್ಯವಹಾರಕ್ಕೆ ಹೊಸ ದೃಢ ಗ್ರಾಹಕರು, ನಿರಂತರ ವ್ಯಾಪಾರ ವೃದ್ಧಿ ಮತ್ತು ಹಣಕಾಸಿನ ಪುನಶ್ಚೇತನ ದೊರೆಯಲಿದೆ. ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಹಳೆಯ ಬಾಕಿ ಹಣವು ಹಂತ ಹಂತವಾಗಿ ವಸೂಲಿಯಾಗಲಿದ್ದು, ವ್ಯಾಪಾರವು ಲಾಭದ ಹಳಿಗೆ ಮರಳಲಿದೆ.

ವ್ಯಾಪಾರದ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರವನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸ್ಥಾಪಿಸಿ ಪ್ರತಿ ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ನೆರವೇರಿಸಿ. ಯಾವುದೇ ದೊಡ್ಡ ಸಾಲ ಅಥವಾ ಅಪರಿಚಿತರೊಂದಿಗೆ ಪಾಲುದಾರಿಕೆ ಮಾಡುವ ಮುನ್ನ ಜಾಗರೂಕರಾಗಿರಿ. ನಿಮ್ಮ ಧನ ವೃದ್ಧಿಗಾಗಿ ${rudraName} ಧಾರಣೆ ಮಾಡಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟರಮಣ ಪೂಜಾ ಸಂಕಲ್ಪ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `2ನೇ (ಧನ ಕೋಶ) ಮತ್ತು 11ನೇ (ಲಾಭ ಸ್ಥಾನ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ ಮತ್ತು ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಮಾಡಿ.`
    },
    {
      id: "q_career_3",
      category: "career",
      categoryLabelKn: "💼 ಕಚೇರಿ ರಾಜಕೀಯ",
      questionKn: "ಕಚೇರಿಯಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳಿಂದ ಕಿರುಕುಳ ಹಾಗೂ ಗೌರವದ ಕೊರತೆ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to overcome workplace politics and lack of recognition?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ ನೇರ, ಮುಚ್ಚುಮರೆಯಿಲ್ಲದ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ನಡವಳಿಕೆಯೇ ಕಚೇರಿಯಲ್ಲಿ ಕೆಲ ಸ್ವಾರ್ಥಿ ವ್ಯಕ್ತಿಗಳಿಗೆ ಅಸೂಯೆ ಉಂಟುಮಾಡಿದೆ. ನಿಮ್ಮ ಜಾತಕದ 6ನೇ ಮನೆಯ (ಶತ್ರು/ಸ್ಪರ್ಧಾ ಸ್ಥಾನ) ${sixthLordKn} ಪ್ರಭಾವದಿಂದ ನೀವು ಕಷ್ಟಪಟ್ಟು ಪೂರ್ಣಗೊಳಿಸಿದ ಯೋಜನೆಯ ಸಂಪೂರ್ಣ ಕೀರ್ತಿ ಮತ್ತು ಕ್ರೆಡಿಟ್ ಅನ್ನು ಬೇರೆಯವರು ತಮ್ಮದಾಗಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನವನ್ನು ತೀವ್ರವಾಗಿ ಘಾಸಿಗೊಳಿಸಿದೆ.

ಪ್ರಸ್ತುತ ನೀವು ಕಚೇರಿಯ ವಾತಾವರಣದಲ್ಲಿ ಎಲ್ಲರನ್ನೂ ನಂಬಿ ಮೋಸಹೋಗುವ ಭಯದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಒಳ್ಳೆಯತನ ಮತ್ತು ಸಹಕಾರ ಗುಣವನ್ನೇ ನಿಮ್ಮ ದೌರ್ಬಲ್ಯವೆಂದು ಭಾವಿಸಿ ಹೆಚ್ಚುವರಿ ಕೆಲಸದ ಹೊರೆಯನ್ನು ನಿಮ್ಮ ಮೇಲೆಯೇ ಹೊರಿಸುತ್ತಿದ್ದಾರೆ. ಮೇಲಧಿಕಾರಿಗಳ ಮುಂದೆ ನಿಮ್ಮ ಬಗ್ಗೆ ತಪ್ಪು ಅಭಿಪ್ರಾಯ ಮೂಡಿಸುವಂತಹ ತೆರೆಮರೆಯ ರಾಜಕೀಯ ತಂತ್ರಗಳು ನಿಮ್ಮ ನಿದ್ರೆಯನ್ನು ಕೆಡಿಸಿ ಮಾನಸಿಕವಾಗಿ ಕುಗ್ಗಿಸುತ್ತಿವೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ ಕರ್ಮ ಮತ್ತು ಕೀರ್ತಿ ಸ್ಥಾನಗಳ ಗ್ರಹಬಲದ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ ಸತ್ಯಾಂಶವು ಮೇಲಧಿಕಾರಿಗಳ ಗಮನಕ್ಕೆ ಬರಲಿದೆ. ಕುತಂತ್ರ ಹೂಡಿದ ವಿರೋಧಿಗಳೇ ತಮ್ಮ ಸ್ವಂತ ತಪ್ಪಿನಿಂದ ಹಿಂದೆ ಸರಿಯಲಿದ್ದು, ನಿಮ್ಮ ನೈಜ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಗೆ ನ್ಯಾಯ ಮರುಸ್ಥಾಪನೆಯಾಗಲಿದೆ.

ಕಚೇರಿಯಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿಚಾರಗಳನ್ನು ಮತ್ತು ಮುಂದಿನ ಯೋಜನೆಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ನಿತ್ಯವೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕ ಅಥವಾ ಕಾಲಭೈರವ ಸ್ತೋತ್ರ ಪಠಿಸುವುದರಿಂದ ಶತ್ರು ಬಾಧೆಗಳು ತಾವಾಗಿಯೇ ನಿಷ್ಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ. ಕಂಠದಲ್ಲಿ ${rudraName} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಲಭಿಸುತ್ತದೆ.`),
      astrologicalBasisKn: `6ನೇ (ಶತ್ರು ಜಯ) ಮತ್ತು 10ನೇ ಮನೆಯ ಮೇಲಿನ ಛಾಯಾಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ಪ್ರತಿ ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕ ಪಠಿಸಿ ಮತ್ತು ${rudraName} ಧರಿಸಿ.`
    },

    // 2. MARRIAGE & FAMILY
    {
      id: "q_marriage_1",
      category: "marriage",
      categoryLabelKn: "💍 ವಿವಾಹ ಭಾಗ್ಯ",
      questionKn: "ವಿವಾಹ ಯೋಗ (ಕಂಕಣ ಭಾಗ್ಯ) ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?",
      questionEn: "When will marriage / marriage alliance finalize?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ 7ನೇ ಮನೆಯಲ್ಲಿ (ಕಳತ್ರ ಸ್ಥಾನ) ${seventhLordKn} ಗ್ರಹದ ಸೂಕ್ಷ್ಮ ಸಂಚಾರದಿಂದಾಗಿ ವಿವಾಹದ ವಿಚಾರದಲ್ಲಿ ಈ ಹಿಂದೆ ಬಂದಿದ್ದ ಒಂದು ಅತ್ಯುತ್ತಮ ಸಂಬಂಧವು ಮಾತುಕತೆಯ ಕೊನೆಯ ಹಂತದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ತಪ್ಪಿಹೋದ ಘಟನೆ ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬದವರ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನಿರಾಶೆ ತಂದಿದೆ. ಜಾತಕ ಹೊಂದಾಣಿಕೆ ಅಥವಾ ಸಣ್ಣ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆಯಿಂದ ಸಂಬಂಧ ಕೈತಪ್ಪಿರುವುದು ಆತಂಕಕ್ಕೆ ದಾರಿ ಮಾಡಿದೆ.

ಈ ಘಟನೆಯ ನಂತರ ಈಗ ಬರುವ ಪ್ರತಿಯೊಂದು ಪ್ರಸ್ತಾಪದಲ್ಲೂ ಏನಾದರೊಂದು ಕೊರತೆ ಕಾಣುವುದು, ವಧು-ವರರ ಕಡೆಯಿಂದ ಸಕಾಲಕ್ಕೆ ಉತ್ತರ ಬಾರದಿರುವುದು ಅಥವಾ ಮಾತುಕತೆಗಳು ಅರ್ಧದಲ್ಲೇ ನಿಂತುಹೋಗುತ್ತಿರುವುದು ನಿಮಗೆ ತೀವ್ರ ಕಿರಿಕಿರಿ ಉಂಟುಮಾಡಿದೆ. "ನನ್ನ ಕಲ್ಯಾಣ ಯೋಗ ಯಾವಾಗ ನಿರ್ವಿಘ್ನವಾಗಿ ಕೂಡಿಬರಬಹುದು?" ಎಂಬ ಚಿಂತೆ ನಿಮ್ಮನ್ನು ಸದಾ ಕಾಡ್ತಾನೆ ಇದೆ. 7ನೇ ಮನೆಯಲ್ಲಿ ${h7PlanetsKn} ಗ್ರಹ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಸೂಕ್ತ ಕಾಲಕ್ಕಾಗಿ ಕಾಯಬೇಕಾಗಿದೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ 7ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${seventhLordKn} ಗ್ರಹದ ಶುಭ ಸಂಚಾರ ಹಾಗೂ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹ ದೃಷ್ಟಿಯ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 5 ರಿಂದ 8 ತಿಂಗಳುಗಳಲ್ಲಿ ಅತ್ಯಂತ ಯೋಗ್ಯ, ಸಂಸ್ಕಾರಯುತ ಮತ್ತು ಗೌರವಾನ್ವಿತ ಕುಟುಂಬದಿಂದ ವಿವಾಹ ಪ್ರಸ್ತಾಪವು ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದೆ. ಪೂರ್ವ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕಿನಿಂದ ಬರುವ ಸಂಬಂಧಗಳು ಅತ್ಯಂತ ಶುಭಕರವಾಗಿ ಪರಿಣಮಿಸಲಿವೆ.

ವಿವಾಹ ಪ್ರತಿಬಂಧಕ ದೋಷಗಳ ನಿವಾರಣೆಗಾಗಿ ಪ್ರತಿ ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ ಅಥವಾ ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿಗಳಿಗೆ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ. ಪ್ರತಿದಿನ "ಓಂ ಶ್ರೀಂ ಗೌರ್ಯೈ ನಮಃ" ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಜಪಿಸಿ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`),
      astrologicalBasisKn: `7ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ ${seventhLordKn}) ಮತ್ತು ಗುರು ಬಲದ ಸಕ್ರಿಯತೆ.`,
      immediateRemedyKn: `ಗುರುವಾರಗಳಂದು ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ ಮತ್ತು ಕಲ್ಯಾಣ ಸೇವೆ ಮಾಡಿಸಿ.`
    },
    {
      id: "q_marriage_2",
      category: "marriage",
      categoryLabelKn: "💍 ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ",
      questionKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಸಾಮರಸ್ಯ ಹೇಗೆ ಸಿಗುತ್ತದೆ?",
      questionEn: "How to resolve marital tension and restore domestic peace?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ನಿಮ್ಮ 7ನೇ ಮನೆಯ ಕಳತ್ರ ಸ್ಥಾನ ಹಾಗೂ 4ನೇ ಮನೆಯ ಸುಖ ಸ್ಥಾನದ ಮೇಲೆ ${seventhLordKn} ಮತ್ತು ${fourthLordKn} ಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದಾಗಿ ಇತ್ತೀಚೆಗೆ ನಡೆದ ಒಂದು ಸಣ್ಣ ಮಾತುಕತೆ ಅಥವಾ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಅನಗತ್ಯ ಹಸ್ತಕ್ಷೇಪವು ದಾಂಪತ್ಯದಲ್ಲಿ ದೊಡ್ಡ ಅಂತರವನ್ನು ಸೃಷ್ಟಿಸಿದೆ. ಒಬ್ಬರ ಮಾತನ್ನು ಇನ್ನೊಬ್ಬರು ತಪ್ಪಾಗಿ ಅರ್ಥೈಸಿಕೊಳ್ಳುವುದು ಹಾಗೂ ಅಹಂಕಾರದ ಘರ್ಷಣೆಯು ಮನೆಯ ಶಾಂತಿಯನ್ನು ಕೆಡಿಸಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಒಂದು ರೀತಿಯ ಮೌನ, ಬೇಸರ ಮತ್ತು ಅಶಾಂತಿಯ ವಾತಾವರಣ ಮನೆಮಾಡಿದೆ. ಪರಸ್ಪರ ಪ್ರೀತಿ ಮತ್ತು ಕಾಳಜಿ ಇದ್ದರೂ ಮುಕ್ತವಾಗಿ ಮನಸ್ಸು ಬಿಚ್ಚಿ ಮಾತನಾಡಲು ಹಿಂಜರಿಯುವ ಸ್ಥಿತಿ ಇದೆ. ಅತ್ಯಂತ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳೂ ದೊಡ್ಡ ವಾಗ್ವಾದವಾಗಿ ಪರಿವರ್ತನೆಯಾಗುತ್ತಿರುವುದು ನಿಮಗೆ ಪದೇ ಪದೇ ತೊಂದ್ರೆ ಕೊಡ್ತಾ ಇರಬಹುದು.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ ಕಳತ್ರ ಸ್ಥಾನದ ಮೇಲಿನ ಗೋಚಾರ ದೋಷಗಳು ಇನ್ನೆರಡು ತಿಂಗಳಲ್ಲಿ ಶಮನಗೊಳ್ಳಲಿವೆ. ಇನ್ನು ಮುಂದಿನ 2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಮರಳಿ ಬರಲಿದ್ದು, ದಾಂಪತ್ಯದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಸಾಮರಸ್ಯವು ಮರುಸ್ಥಾಪನೆಯಾಗಲಿದೆ. ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ಮನಸ್ತಾಪಗಳನ್ನು ಕರಗಿಸಲಿದೆ.

ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಹಳೆಯ ಕಹಿ ಘಟನೆಗಳನ್ನು ಪದೇ ಪದೇ ನೆನಪಿಸಿ ಜಗಳವಾಡಬೇಡಿ. ಪ್ರತಿ ಮಂಗಳವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಸಂಜೆ ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ. ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸುವುದು ಅದ್ಭುತ ಫಲ ನೀಡಲಿದೆ.`),
      astrologicalBasisKn: `7ನೇ ಮನೆ ಮತ್ತು ಶುಕ್ರ/ಕುಜ ಗ್ರಹಗಳ ಕಾರಕತ್ವದ ಮೇಲೆ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },
    {
      id: "q_marriage_3",
      category: "marriage",
      categoryLabelKn: "💍 ಸಂತಾನ ಭಾಗ್ಯ",
      questionKn: "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ವಿಳಂಬವಾಗುತ್ತಿರುವುದು ಏಕೆ ಮತ್ತು ಪರಿಹಾರವೇನು?",
      questionEn: "Why delay in childbirth and what is the remedy?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ 5ನೇ ಮನೆಯಲ್ಲಿ (ಸಂತಾನ/ಪುತ್ರ ಸ್ಥಾನ) ${fifthLordKn} ಗ್ರಹದ ಸ್ಥಿತಿ ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸಂಚಾರದಿಂದಾಗಿ ಸಂತಾನದ ನಿರೀಕ್ಷೆಯಲ್ಲಿರುವ ನಿಮಗೆ ಈ ಹಿಂದೆ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಸಕಾರಾತ್ಮಕವಾಗಿದ್ದರೂ ಫಲ ಸಿಗದಿರುವುದು ಕೌಟುಂಬಿಕವಾಗಿ ಮಾನಸಿಕ ಒತ್ತಡವನ್ನು ತಂದಿದೆ. 5ನೇ ಮನೆಯಲ್ಲಿ ${h5PlanetsKn} ಪ್ರಭಾವವಿರುವುದರಿಂದ ಸೂಕ್ಷ್ಮ ದೋಷಗಳು ಎದುರಾಗುತ್ತಿವೆ.

ಪ್ರಸ್ತುತ ಸಮಾಜ ಮತ್ತು ಸಂಬಂಧಿಕರ ಪುನರಾವರ್ತಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಎದುರಿಸಲಾಗದೆ ನೀವು ಒಳಗೆ ಕೊರಗುತ್ತಿದ್ದೀರಿ. ವೈದ್ಯಕೀಯ ಪ್ರಯತ್ನಗಳ ಜೊತೆಗೆ "ದೈವಬಲ ಯಾವಾಗ ಕೈಹಿಡಿಯುತ್ತದೆ?" ಎಂಬ ನಿರೀಕ್ಷೆಯಲ್ಲಿ ನೀವು ಕಾಲ ಕಳಿತಾ ಇದೀರಾ. ಈ ಮಾನಸಿಕ ಆತಂಕವೇ ನಿಮ್ಮ ನೈಸರ್ಗಿಕ ಆರೋಗ್ಯದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುತ್ತಿದೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ 5ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${fifthLordKn} ಗ್ರಹದ ಮುಂಬರುವ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ಗುರು ಬಲದ ಪ್ರಕಾರ, ಈ ವಿಳಂಬವು ಕೇವಲ ತಾತ್ಕಾಲಿಕ. ಇನ್ನು ಮುಂದಿನ 6 ರಿಂದ 9 ತಿಂಗಳುಗಳಲ್ಲಿ ಸಂತಾನ ಭಾಗ್ಯದ ಶುಭ ಸುದ್ದಿ ಮನೆತುಂಬುವ ಪ್ರಬಲ ಯೋಗವಿದೆ. ಗ್ರಹಗತಿಗಳು ನಿಮ್ಮ ಪರವಾಗಿ ಹೊಂದಿಕೊಳ್ಳುತ್ತಿವೆ.

ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಬಲಿ ಅಥವಾ ಸರ್ಪದೋಷ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸುವುದು ಶ್ರೇಷ್ಠ ದೈವಿಕ ಪರಿಹಾರವಾಗಿದೆ.`),
      astrologicalBasisKn: `5ನೇ ಮನೆ (ಪುತ್ರ ಸ್ಥಾನ ${fifthLordKn}) ಮತ್ತು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಗೋಚಾರ ಸಂಚಾರ.`,
      immediateRemedyKn: `ದಿನನಿತ್ಯ ಸಂತಾನ ಗೋಪಾಲ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಪ್ರತಿ ಗುರುವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಹಾಲಿನ ಅಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },

    // 3. MIND & HEALTH
    {
      id: "q_mind_1",
      category: "mind",
      categoryLabelKn: "🧠 ಮಾನಸಿಕ ನೆಮ್ಮದಿ",
      questionKn: "ಮನಸ್ಸಿಗೆ ಸದಾ ಆತಂಕ, ಭಯ ಮತ್ತು ನಿದ್ರಾಹೀನತೆ ಕಾಡುತ್ತಿದೆ, ಕಾರಣವೇನು?",
      questionEn: "Why constant anxiety, fear, and insomnia?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ 4ನೇ ಮನೆಯ ಮನಃಸ್ಥಿತಿ ಹಾಗೂ ಚಂದ್ರನ ${moonHouse}ನೇ ಮನೆಯ ಸೂಕ್ಷ್ಮ ಸ್ಥಿತಿಯಲ್ಲಿ ${h4PlanetsKn} ಗ್ರಹ ಪ್ರಭಾವ ಇರುವುದರಿಂದ ನಿಮಗೆ ಸ್ವಲ್ಪ ಇವಾಗ ತೊಂದರೆ ಹಂಗೆ ಕಾಣಿಸ್ತಾ ಇದೆ, ಮನಸ್ಸಲ್ಲಿ ನೆಮ್ಮದಿ ಇಲ್ಲ, ಅಥವಾ ಏನೋ ಒಂದು ಯೋಚನೆ, ನೋವು ನಿಮ್ಮನ್ನ ಕಾಡ್ತಾನೆ ಇರುವುದು. ಇತ್ತೀಚೆಗೆ ನಡೆದ ಒಂದು ಅನಿರೀಕ್ಷಿತ ಘಟನೆ ಅಥವಾ ನಂಬಿಕೆ ದ್ರೋಹವು ನಿಮ್ಮ ಅಂತಃಚೇತನವನ್ನು ತೀವ್ರವಾಗಿ ಕಲಕಿದೆ.

ಈ ತರದ್ದೆಲ್ಲ ಕೆಲವೊಂದು ಪರಿಸ್ಥಿತಿಗಳಿಂದ ನೀವು ನಿದ್ರಾಹೀನತೆಯಾಗಿ ರಾತ್ರಿ 2:00 ರಿಂದ ಮುಂಜಾನೆ 4:30 ರ ಹೊತ್ತಿಗೆ ಏನೋ ಯೋಚನೆ ಮಾಡ್ತಾ ನಿಮ್ಮ ಕಾಲ ಕಳಿತಾ ಇದೀರಾ. ಹೊರಗೆ ನಗುತ್ತಾ ಎಲ್ಲವೂ ಶಾಂತವಾಗಿದೆ ಎಂಬಂತೆ ಕಂಡರೂ ಎದೆಯೊಳಗೆ ಸದಾ ಒಂದು ಆತಂಕದ ಕಂಪನವಿದೆ; "ಮುಂದೆ ಏನಾಗುವುದೋ?" ಎಂಬ ಅತಿಯಾದ ಕಲ್ಪನೆಗಳು (Overthinking) ನಿಮ್ಮ ಶಕ್ತಿಯನ್ನು ಕುಂದಿಸುತ್ತಿವೆ. ಈ ತರದ್ದು ನಿಮಗೆ ಪದೇ ಪದೇ ತೊಂದ್ರೆ ಕೊಡ್ತಾ ಇರಬಹುದು.

ಆದರೆ ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaKn} ಲಗ್ನ ಬಲವು ಅತ್ಯಂತ ದೃಢವಾಗಿದೆ. ಮುಂಬರುವ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಂಚಾರದ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 2 ರಿಂದ 3 ತಿಂಗಳುಗಳಲ್ಲಿ ಈ ಆತಂಕದ ಕಾರ್ಮೋಡ ಸಂಪೂರ್ಣವಾಗಿ ಕರಗಲಿದ್ದು, ಮನಸ್ಸಿಗೆ ಅಪಾರ ಪ್ರಶಾಂತತೆ ಮತ್ತು ದೃಢತೆ ಮರಳಲಿದೆ. ಅಂಜಿಕೆಗಳು ತಾವಾಗಿಯೇ ದೂರವಾಗಲಿವೆ.

ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಮೊಬೈಲ್ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ, ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ಕಾಲು ತೊಳೆದು 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ. ನಿಮ್ಮ ಮನಃಶಾಂತಿಗಾಗಿ ಮತ್ತು ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ನಿವಾರಣೆಗಾಗಿ ${rudraName} ಧಾರಣೆ ಮಾಡಿ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ.`),
      astrologicalBasisKn: `ಚಂದ್ರ ಗ್ರಹದ ${moonHouse}ನೇ ಸ್ಥಾನ ಮತ್ತು 4ನೇ ಮನೆಯ ${fourthLordKn} ಗ್ರಹ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `${rudraName} ಧರಿಸಿ ಮತ್ತು ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.`
    },
    {
      id: "q_mind_2",
      category: "mind",
      categoryLabelKn: "🧠 ದೃಷ್ಟಿ ದೋಷ & ರಕ್ಷಣೆ",
      questionKn: "ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಮತ್ತು ಶತ್ರು ಭೀತಿ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to neutralize evil eye, negative energy, and enemy fear?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ, ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ನೋಡಿ ಆಪ್ತ ವಲಯದಲ್ಲೇ ಕೆಲವರಿಗೆ ತೀವ್ರ ಅಸೂಯೆ ಉಂಟಾಗಿದೆ. ಇತ್ತೀಚೆಗೆ ಯಾವುದೇ ಶುಭ ಕೆಲಸ ಅಥವಾ ಹೊಸ ಯೋಜನೆ ಆರಂಭಿಸಿದಾಗಲೆಲ್ಲಾ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು, ಮನೆಯಲ್ಲಿ ಪದೇ ಪದೇ ವಸ್ತುಗಳು ಹಾಳಾಗುವುದು ಅಥವಾ ಸದಸ್ಯರಲ್ಲಿ ಅನಾರೋಗ್ಯದ ವಾತಾವರಣ ಸೃಷ್ಟಿಯಾಗುತ್ತಿದೆ.

ಪ್ರಸ್ತುತ ನೀವು ಮನೆಯೊಳಗೆ ಕಾಲಿಡುತ್ತಿದ್ದಂತೆಯೇ ಒಂದು ರೀತಿಯ ಭಾರವಾದ ವಾತಾವರಣ, ನಿಶ್ಯಕ್ತಿ ಮತ್ತು ಕಾರಣವಿಲ್ಲದ ಕಿರಿಕಿರಿಯನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ. ನಿಮ್ಮ ಒಳ ಉತ್ಸಾಹವೆಲ್ಲಾ ಸೋರಿಹೋಗುತ್ತಿರುವಂತೆ ಭಾಸವಾಗ್ತಾ ಇದೆ. ಜನರ ನರದೃಷ್ಟಿ ಮತ್ತು ನಕಾರಾತ್ಮಕ ಕಂಪನಗಳು ನಿಮ್ಮ ದೈನಂದಿನ ನೆಮ್ಮದಿಯನ್ನು ಕಸಿಯುತ್ತಿವೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ ಭಾಗ್ಯ ಸ್ಥಾನವು ಶುದ್ಧವಾಗಿರುವುದರಿಂದ ಯಾವುದೇ ದುಷ್ಟ ಶಕ್ತಿಗಳು ನಿಮಗೆ ದೀರ್ಘಕಾಲಿಕ ಹಾನಿ ಮಾಡಲಾರವು. ಇನ್ನು ಮುಂದಿನ 1 ರಿಂದ 2 ತಿಂಗಳಲ್ಲಿ ರಕ್ಷಾ ಕವಚದ ಪ್ರಭಾವದಿಂದ ಸಕಲ ದೃಷ್ಟಿ ದೋಷಗಳು ಮತ್ತು ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಭಸ್ಮವಾಗಲಿವೆ.

ಪ್ರತಿ ಮಂಗಳವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಸಂಜೆ ಮನೆಯ ಮುಖ್ಯದ್ವಾರಕ್ಕೆ ಕಲ್ಲುಪ್ಪು ಮತ್ತು ನಿಂಬೆಹಣ್ಣಿನ ದೃಷ್ಟಿ ತೆಗೆದು ಹಾಕಿ. ಮನೆಯಲ್ಲಿ ಶುದ್ಧ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ, ಶ್ರೀ ಸುದರ್ಶನ ಕವಚ ಅಥವಾ ನರಸಿಂಹ ಮಂತ್ರ ಪಠಿಸಿ ಮತ್ತು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶತ್ರು ಸಂಹಾರ ತ್ರಿಶೂಲ ಪೂಜೆ ನೆರವೇರಿಸಿ.`),
      astrologicalBasisKn: `ಲಗ್ನ ಮತ್ತು 8ನೇ ಮನೆಯ ಮೇಲಿನ ರಾಹು-ಕೇತುಗಳ ಛಾಯಾ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ ಮತ್ತು ಸುದರ್ಶನ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ.`
    },

    // 4. WEALTH & DEBT
    {
      id: "q_wealth_1",
      category: "wealth",
      categoryLabelKn: "💰 ಆರ್ಥಿಕತೆ & ಸಾಲ ಮುಕ್ತಿ",
      questionKn: "ಸಾಲದ ಬಾಧೆಯಿಂದ ಮುಕ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಯಾವಾಗ?",
      questionEn: "When will debt pressure ease and finances stabilize?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ನಿಮ್ಮ 6ನೇ ಮನೆಯ (ಋಣ ಸ್ಥಾನ) ${sixthLordKn} ಹಾಗೂ 2ನೇ ಮನೆಯ ಧನಕೋಶದ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದ ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ಬಂದ ಒಂದು ಅನಿರೀಕ್ಷಿತ ತುರ್ತು ಖರ್ಚು ಅಥವಾ ಇತರರನ್ನು ನಂಬಿ ಮಾಡಿದ ಹೂಡಿಕೆಯು ನಿಮ್ಮನ್ನು ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕಿಸಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ಎಂದರೆ, ಕೈಗೆ ಬಂದ ಹಣ ಕಣ್ಣಿಗೆ ಕಾಣದಂತೆ ಯಾವುದಾದರೊಂದು ತುರ್ತು ಅಗತ್ಯಕ್ಕೆ ಸೋರಿಹೋಗುತ್ತಿದೆ. ಮಾಸಿಕ ಕಂತುಗಳು ಮತ್ತು ಸಾಲಗಾರರ ಕರೆಗಳು ನಿಮ್ಮ ಆತ್ಮಗೌರವಕ್ಕೆ ಧಕ್ಕೆ ತರುತ್ತಿವೆ. ಇದರಿಂದಾಗಿ ನೀವು ಗೌಪ್ಯವಾಗಿ ಅಪಾರ ಮಾನಸಿಕ ಯಾತನೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ; ಈ ಹಣಕಾಸಿನ ಬಿಕ್ಕಟ್ಟು ನಿಮ್ಮನ್ನು ದಿನನಿತ್ಯ ಕಾಡ್ತಾನೆ ಇದೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ 11ನೇ (ಲಾಭ) ಮತ್ತು 6ನೇ ಮನೆಗಳ ಗ್ರಹ ಚಲನೆಯ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 4 ರಿಂದ 7 ತಿಂಗಳುಗಳಲ್ಲಿ ಹೊಸ ಆದಾಯದ ಮೂಲ ತೆರೆದುಕೊಳ್ಳಲಿದ್ದು, ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ ಇಳಿಯಲಿದೆ. ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಆಸ್ತಿ ವ್ಯವಹಾರ ಅಥವಾ ಹಳೆಯ ಬಾಕಿ ಹಣ ಕೈಸೇರಲಿದ್ದು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮರಳಿ ಬರಲಿದೆ.

ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ. ಅನಗತ್ಯ ಸಾಲ ಮಾಡುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಲ್ಲಿಸಿ. ನಿಮ್ಮ ಆರ್ಥಿಕ ಅಭಿವೃದ್ಧಿಗಾಗಿ ${gemName} ಧರಿಸಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಗಣಪತಿ ಹೋಮ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `6ನೇ (ಋಣ) ಮತ್ತು 11ನೇ (ಲಾಭ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಸೇವೆ ಮಾಡಿಸಿ.`
    }
  ];
};

export const generatePanchangaAngaSynthesis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; lang?: string; devoteeName?: string }
): PanchangaSynthesisOutput => {
  const tradPanchanga = calculateTraditionalBaggona(context.birthDate, context.birthTime, context.latitude, context.longitude);
  
  // Resolve 5 Angas
  const varaIdx = new Date(context.birthDate).getDay();
  const varaLords: PlanetName[] = [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars, PlanetName.Mercury, PlanetName.Jupiter, PlanetName.Venus, PlanetName.Saturn];
  const varaNames = [
    { kn: "ಭಾನುವಾರ (ರವಿವಾರ)", en: "Sunday (Ravivara)", tatva: "Agni / Fire" },
    { kn: "ಸೋಮವಾರ", en: "Monday (Somavara)", tatva: "Jala / Water" },
    { kn: "ಮಂಗಳವಾರ", en: "Tuesday (Mangalavara)", tatva: "Agni / Fire" },
    { kn: "ಬುಧವಾರ", en: "Wednesday (Budhavara)", tatva: "Prithvi / Earth" },
    { kn: "ಗುರುವಾರ", en: "Thursday (Guruvara)", tatva: "Akasha / Ether" },
    { kn: "ಶುಕ್ರವಾರ", en: "Friday (Shukravara)", tatva: "Jala / Water" },
    { kn: "ಶನಿವಾರ", en: "Saturday (Shanivara)", tatva: "Vayu / Air" }
  ];
  const varaInfo = varaNames[varaIdx]!;
  const varaLord = varaLords[varaIdx]!;

  // Yoga resolution
  const yogaIndex = YOGA_RULES.findIndex((y) => y.english.toLowerCase() === tradPanchanga.yoga.toLowerCase()) !== -1
    ? YOGA_RULES.findIndex((y) => y.english.toLowerCase() === tradPanchanga.yoga.toLowerCase())
    : 0;
  const yogaRule = YOGA_RULES[yogaIndex]!;

  // Karana resolution
  const karanaKey = Object.keys(KARANA_RULES).find((k) => k.toLowerCase() === tradPanchanga.karana.toLowerCase()) || "Bava";
  const karanaRule = KARANA_RULES[karanaKey]!;

  const prescriptions = generateAstrologicalPrescriptions(kundli, yogaRule, karanaRule);
  const currentDiagnosis = generateCurrentLifeDiagnosis(kundli, context, prescriptions);
  const instantQAList = generateInstantQAList(kundli, currentDiagnosis, prescriptions, context.devoteeName);

  // Build Multi-Paragraph Astrologer Reading in Pure Pristine Kannada with English Digits
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakKn = toKannadaNakshatra(moon?.nakshatra.english);
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);

  const devoteeNameFormatted = context.devoteeName || "ಭಕ್ತರೇ";
  const p1 = sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನ ಹಾಗೂ ${moonRashiKn} ರಾಶಿಯ ${moonNakKn} ನಕ್ಷತ್ರದ ಗ್ರಹ ಸಂಯೋಗವನ್ನು ನೋಡಿದರೆ, ${currentDiagnosis.technicalAspects.fourthHouseDetail}. ನಿಮಗೆ ಸ್ವಲ್ಪ ಇವಾಗ ತೊಂದರೆ ಹಂಗೆ ಕಾಣಿಸ್ತಾ ಇದೆ, ಮನಸ್ಸಲ್ಲಿ ನೆಮ್ಮದಿ ಇಲ್ಲ, ಅಥವಾ ಏನೋ ಒಂದು ಯೋಚನೆ, ನೋವು ನಿಮ್ಮನ್ನ ಕಾಡ್ತಾನೆ ಇರುವುದು. ಈ ತರದ್ದೆಲ್ಲ ಕೆಲವೊಂದು ಪರಿಸ್ಥಿತಿಗಳಿಂದ ನೀವು ನಿದ್ರಾಹೀನತೆಯಾಗಿ ರಾತ್ರಿ 2:00 ರಿಂದ ಮುಂಜಾನೆ 4:30 ರ ವೇಳೆಗೆ ಏನೋ ಯೋಚನೆ ಮಾಡ್ತಾ ನಿಮ್ಮ ಕಾಲ ಕಳಿತಾ ಇದೀರಾ, ಹೌದಲ್ಲವೇ?`);
  
  const p2 = sanitizeAstrologyKannadaText(`ಈ ಪ್ರಶ್ನೆ ಮತ್ತು ಆತಂಕ ನಿಮ್ಮಲ್ಲಿ ಉದ್ಭವಿಸಲು ಮುಖ್ಯ ಕಾರಣ: ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ನಡೆದಿರುವ ಘರ್ಷಣೆ. ${currentDiagnosis.primaryLifeChallenge.description}. ನೀವು ಎಷ್ಟು ನಿಸ್ವಾರ್ಥವಾಗಿ ಮತ್ತು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಶ್ರಮಿಸಿದರೂ ಜನ ನಿಮ್ಮನ್ನು ತಪ್ಪಾಗಿ ಗ್ರಹಿಸುವುದು ಅಥವಾ ನಿಮ್ಮ ಒಳ್ಳೆಯತನವನ್ನೇ ದೌರ್ಬಲ್ಯವೆಂದು ತಿಳಿಯುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನೋವುಂಟುಮಾಡಿದೆ. ${currentDiagnosis.technicalAspects.tenthHouseDetail} ಮತ್ತು ${currentDiagnosis.technicalAspects.seventhHouseDetail}. ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}`);

  const p3 = sanitizeAstrologyKannadaText(`ಆದರೆ ನೀವು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಧೃತಿಗೆಡಬೇಕಾಗಿಲ್ಲ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಇದು ನಿಮ್ಮ ಹಿಂದಿನ ಕರ್ಮದ ಅಂತಿಮ ಶುದ್ಧೀಕರಣ ಘಟ್ಟ. ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಪ್ರಸ್ತುತ ಇರುವ ಕತ್ತಲೆ ಕರಗಿ ಹೊಸ ದಾರಿ ಗೋಚರಿಸಲಿದೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವಯುತ ಸ್ಥಾನಮಾನ ಖಚಿತವಾಗಿ ಲಭಿಸಲಿದೆ.`);

  const p4 = sanitizeAstrologyKannadaText(`ನಿಮ್ಮ ಒಳಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಮರಳಿ ತರಲು, ${lagnaKn} ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಮಾಡಿಸಿ ${prescriptions.gemstoneRing.fingerKn}ಕ್ಕೆ ${prescriptions.gemstoneRing.activationDay} ದಿನ ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಇದರೊಂದಿಗೆ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಹಾಗೂ ${currentDiagnosis.prasthuthaSthiti.immediateRemedies.join(" ")}. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿಸುವ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`);

  return {
    panchanga: {
      vara: { nameKn: varaInfo.kn, nameEn: varaInfo.en, lord: varaLord, tatva: varaInfo.tatva },
      tithi: { nameKn: tradPanchanga.tithiKn || tradPanchanga.tithi, nameEn: tradPanchanga.tithi, paksha: tradPanchanga.paksha, jalTatvaQuality: "Nourishes emotional relationships and desire fulfillment" },
      nakshatra: { nameKn: tradPanchanga.moonNakshatraKn || moonNakKn, nameEn: moon?.nakshatra.english ?? "Ashwini", lord: calculateKpSubLord(moon?.degree ?? 0).nakshatraLord, deity: "Presiding Divine Guardian" },
      yoga: { nameKn: yogaRule.sanskrit, nameEn: yogaRule.english, rule: yogaRule },
      karana: { nameKn: karanaRule.nameKn, nameEn: karanaRule.nameEn, rule: karanaRule }
    },
    prescriptions,
    currentDiagnosis,
    instantQAList,
    multiParagraphExecutiveReading: [p1, p2, p3, p4]
  };
};
