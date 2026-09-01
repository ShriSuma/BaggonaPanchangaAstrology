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
    immediateTurningPointKn: string;
    technicalAspectsCueKn: string;
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
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number }
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
  const getHousePlanets = (h: number) => kundli.planets.filter((p) => p.house === h).map((p) => p.name);

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
    rootCause = `10ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${tenthLord} ಗ್ರಹವು ${tenthLordPlanet.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದು.`;
  } else if (seventhLordPlanet && [6, 8].includes(seventhLordPlanet.house)) {
    challengeArea = "Personal / Marriage";
    challengeDesc = "ದಾಂಪತ್ಯದಲ್ಲಿ ಅಥವಾ ಕುಟುಂಬದಲ್ಲಿ ಅನಗತ್ಯ ಮಾತುಕತೆಗಳಿಂದ ವೈಮನಸ್ಸು, ಸಂಗಾತಿಯ ಹಠಮಾರಿತನ ಅಥವಾ ವಿವಾಹ ನಿಶ್ಚಯದಲ್ಲಿ ಅಡೆತಡೆ.";
    rootCause = `7ನೇ ಮನೆಯ ಅಧಿಪತಿ ${seventhLord} ಗ್ರಹದ ಸ್ಥಾನ ಬಲದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ದೋಷ.`;
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

  // 5. Secret Astrologer Verbal Prompts (Talking Points for the Pandit)
  const openingIceBreakerKn = `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 4ನೇ ಮನೆ ಹಾಗೂ 5ನೇ ಮನೆಯ ಗ್ರಹ ಸಂಯೋಗವನ್ನು ನೋಡಿದರೆ ನಿಮ್ಮ ಮೂಲ ಗುಣ ತುಂಬಾ ನೇರ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ. ಆದರೆ ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಒಪ್ಪುವಂತೆ ಕೆಲಸಗಳು ಆಗುತ್ತಿಲ್ಲ, ಹೌದಲ್ಲವೇ?`;
  const hiddenSubconsciousWorryKn = mentalIssue 
    ? `ಚಂದ್ರನ ಸ್ಥಾನದಿಂದಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಹೊರಗೆ ಹೇಳಿಕೊಳ್ಳಲಾಗದ ಆತಂಕವೊಂದು ಸದಾ ಕಾಡುತ್ತಿದೆ; ರಾತ್ರಿ ನಿದ್ರೆಯಲ್ಲೂ ಅದೇ ಯೋಚನೆಗಳು ಬರುತ್ತಿವೆ.` 
    : `ನೀವು ಕುಟುಂಬದ ಬಗ್ಗೆ ಸದಾ ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ, ಎಲ್ಲರನ್ನೂ ಜೊತೆಯಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆಯಬೇಕೆಂಬ ಹಂಬಲ ನಿಮಗಿದೆ.`;
  const immediateTurningPointKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆಯಲ್ಲಿ ಇನ್ನು ಮುಂದಿನ 4 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ ಪರಿಸ್ಥಿತಿ ನಿಮ್ಮ ಪರವಾಗಿ ಬದಲಾಗಲಿದೆ; ಧೈರ್ಯ ಕಳೆದುಕೊಳ್ಳಬೇಡಿ.`;
  const technicalAspectsCueKn = `ಜಾತಕದ 7ನೇ ಮನೆಯ ದೃಷ್ಟಿ ಹಾಗೂ 10ನೇ ಮನೆಯ ದಶಾ ಸಂಧಿಕಾಲದ ಪ್ರಭಾವದಿಂದ ಈ ಘಟನೆಗಳು ನಡೆಯುತ್ತಿವೆ.`;

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
      immediateTurningPointKn,
      technicalAspectsCueKn
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
  prescriptions: AstrologicalPrescriptions
): InstantQAQuestion[] => {
  const lagna = kundli.lagnaRashi.english;
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNak = moon?.nakshatra.english ?? "Ashwini";

  return [
    // 1. CAREER & BUSINESS
    {
      id: "q_career_1",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ",
      questionKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಯಾವಾಗ ಪ್ರಗತಿ ಅಥವಾ ಹೊಸ ಅವಕಾಶ ಸಿಗುತ್ತದೆ?",
      questionEn: "When will I get career progress or a new job opportunity?",
      panditScriptKn: `ನೋಡಿ, ನೀವು ಈ ಪ್ರಶ್ನೆ ಕೇಳಲು ಕಾರಣ ಕೇವಲ ಕುತೂಹಲವಲ್ಲ; ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಒಂದು ಘಟನೆ ನಡೆದುಹೋಗಿದೆ. ಕಚೇರಿಯಲ್ಲಿ ನೀವು ಹಗಲಿರುಳು ನಿಸ್ವಾರ್ಥವಾಗಿ ಶ್ರಮಪಟ್ಟರೂ, ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗದೆ ನಿಮ್ಮ ಜಾಗದಲ್ಲಿ ಬೇರೆಯವರಿಗೆ ಆದ್ಯತೆ ಸಿಕ್ಕಿರುವುದು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ತೀವ್ರ ನೋವುಂಟುಮಾಡಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೈನಂದಿನ ಸ್ಥಿತಿಯನ್ನು ನೋಡಿದರೆ, ನೀವು ಕಚೇರಿಗೆ ಹೋದರೂ ಪೂರ್ಣ ಮನಸ್ಸಿಲ್ಲದೆ ಕರ್ತವ್ಯ ಮುಗಿಸುವಂತಾಗಿದೆ. "ನನ್ನ ಶ್ರಮಕ್ಕೆ ಬೆಲೆಯೇ ಇಲ್ಲವೇ?" ಎಂಬ ಅಸಹಾಯಕತೆ ಹಾಗೂ ಕೆಲಸ ಬದಲಾಯಿಸಬೇಕೆಂಬ ತುಡಿತ ನಿಮ್ಮನ್ನು ಸದಾ ಕಾಡುತ್ತಿದೆ. ಆದರೆ ಎಲ್ಲಿ ಹೋದರೂ ಇದೇ ವಾತಾವರಣ ಇರಲಿದೆಯೇ ಎಂಬ ಅಂಜಿಕೆ ನಿಮ್ಮ ನಿರ್ಧಾರವನ್ನು ತಡೆಹಿಡಿದಿದೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ದಶಾ ಸಂಧಿಕಾಲದ ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಮುಂದಿನ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 3 to 5 Months) ಹೊಸ ಅತ್ಯುತ್ತಮ ಅವಕಾಶ ಅಥವಾ ಗೌರವಯುತ ಸ್ಥಾನ ಬದಲಾವಣೆ ಖಚಿತವಾಗಿ ಒದಗಿಬರಲಿದೆ. ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕ ಪ್ರತಿಫಲ ಸಿಗುವ ಶುಭ ಕಾಲ ಸಮೀಪಿಸಿದೆ.

ಅಲ್ಲಿಯವರೆಗೆ ಕಚೇರಿಯಲ್ಲಿ ಯಾವುದೇ ಅತಿಯಾದ ವಾದ-ವಿವಾದಗಳಿಗೆ ಹೋಗಬೇಡಿ. ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ಧರಿಸಿ.`,
      astrologicalBasisKn: `10ನೇ ಮನೆ (ಕರ್ಮ ಸ್ಥಾನ) ಮತ್ತು ಲಗ್ನಾಧಿಪತಿಯ ದಶಾ ಪ್ರಭಾವ, ಗುರು-ಶನಿ ಗೋಚಾರ ಫಲ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ${prescriptions.gemstoneRing.primaryGemstoneKn} ಧರಿಸಿ.`
    },
    {
      id: "q_career_2",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ",
      questionKn: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ವೃದ್ಧಿ ಮತ್ತು ನಷ್ಟದಿಂದ ಮುಕ್ತಿ ಯಾವಾಗ?",
      questionEn: "When will business turn profitable and overcome loss?",
      panditScriptKn: `ನೋಡಿ, ವ್ಯಾಪಾರದಲ್ಲಿ ಇತ್ತೀಚೆಗೆ ಕೈಗೊಂಡ ಒಂದು ನಿರ್ಧಾರ ಅಥವಾ ನಂಬಿದ ವ್ಯಕ್ತಿಯಿಂದ ಉಂಟಾದ ಆರ್ಥಿಕ ಹೊಡೆತವು ನಿಮ್ಮ ವ್ಯವಹಾರದ ಗತಿಯನ್ನೇ ನಿಧಾನಗೊಳಿಸಿದೆ. ಬರಬೇಕಾದ ಬಾಕಿ ಹಣ ಸಮಯಕ್ಕೆ ಕೈಸೇರದೆ, ದಿನನಿತ್ಯದ ಬಂಡವಾಳ ಮತ್ತು ನಿರ್ವಹಣೆಗೆ ಪರದಾಡುವಂತಾಗಿದೆ.

ಈ ಘಟನೆಯಿಂದಾಗಿ ಈಗ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ವ್ಯಾಪಾರವನ್ನು ಮುಂದುವರಿಸಬೇಕೋ ಅಥವಾ ನಿಲ್ಲಿಸಬೇಕೋ ಎಂಬ ದ್ವಂದ್ವ ಕಾಡುತ್ತಿದೆ. ನೀವು ಎಷ್ಟು ಸಕಾರಾತ್ಮಕವಾಗಿರಲು ಪ್ರಯತ್ನಿಸಿದರೂ, ಹಣದ ಮುಗ್ಗಟ್ಟು ನಿಮ್ಮ ಹೊಸ ಯೋಜನೆಗಳನ್ನು ಕಾರ್ಯರೂಪಕ್ಕೆ ತರಲು ಬಿಡುತ್ತಿಲ್ಲ.

ನಿಮ್ಮ ಜಾತಕದ 2ನೇ (ಧನ) ಮತ್ತು 11ನೇ (ಲಾಭ) ಮನೆಗಳ ಗ್ರಹಬಲದ ಪ್ರಕಾರ, ಪ್ರಸ್ತುತ ಇರುವ ಹಿನ್ನಡೆ ಶಾಶ್ವತವಲ್ಲ. ಮುಂದಿನ 4 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 4 to 6 Months) ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕೆ ಹೊಸ ಗ್ರಾಹಕರು ಮತ್ತು ಹಣಕಾಸಿನ ಪುನಶ್ಚೇತನ ದೊರೆಯಲಿದೆ. ಬಾಕಿ ನಿಂತಿದ್ದ ಹಣ ವಸೂಲಿಯಾಗಲಿದೆ.

ಯಾವುದೇ ದೊಡ್ಡ ಸಾಲ ಅಥವಾ ಅಪರಿಚಿತರೊಂದಿಗೆ ಪಾಲುದಾರಿಕೆ ಮಾಡುವ ಮುನ್ನ ಜಾಗರೂಕರಾಗಿರಿ. ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ನೆರವೇರಿಸಿ.`,
      astrologicalBasisKn: `2ನೇ (ಧನ ಕೋಶ) ಮತ್ತು 11ನೇ (ಲಾಭ ಸ್ಥಾನ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ ಮತ್ತು ಶನಿವಾರ ಸಂಜೆ ಕಾಗೆಗಳಿಗೆ ಅನ್ನ ಹಾಕಿ.`
    },
    {
      id: "q_career_3",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ",
      questionKn: "ಕಚೇರಿಯಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳಿಂದ ಕಿರುಕುಳ ಹಾಗೂ ಗೌರವದ ಕೊರತೆ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to overcome workplace politics and lack of recognition?",
      panditScriptKn: `ನಿಮ್ಮ ನೇರ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ನಡವಳಿಕೆಯೇ ಕಚೇರಿಯಲ್ಲಿ ಕೆಲವರಿಗೆ ಅಸೂಯೆ ಉಂಟುಮಾಡಿದೆ. ನೀವು ಮಾಡಿದ ಕೆಲಸದ ಕ್ರೆಡಿಟ್ ಅನ್ನು ಬೇರೆಯವರು ಪಡೆದುಕೊಳ್ಳುವುದು ಹಾಗೂ ನಿಮ್ಮ ವಿರುದ್ಧ ತೆರೆಮರೆಯಲ್ಲಿ ನಡೆಯುವ ರಾಜಕೀಯವು ನಿಮ್ಮ ಶಾಂತಿಯನ್ನು ಕೆಡಿಸಿದೆ.

ಪ್ರಸ್ತುತ ನೀವು ಕಚೇರಿಯಲ್ಲಿ ಎಲ್ಲರನ್ನೂ ನಂಬಿ ಮೋಸಹೋಗುವ ಭಯದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಒಳ್ಳೆಯತನವನ್ನೇ ದೌರ್ಬಲ್ಯವೆಂದು ಭಾವಿಸಿ ಹೆಚ್ಚುವರಿ ಕೆಲಸದ ಹೊರೆಯನ್ನು ನಿಮ್ಮ ಮೇಲೆಯೇ ಹಾಕುತ್ತಿದ್ದಾರೆ.

ನಿಮ್ಮ ಜಾತಕದ 6ನೇ (ಶತ್ರು/ಸ್ಪರ್ಧೆ) ಮತ್ತು 10ನೇ (ಕೀರ್ತಿ) ಭಾವಗಳ ಗ್ರಹಗಳ ಚಲನೆಯ ಪ್ರಕಾರ, ಮುಂದಿನ 2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 2 to 4 Months) ಸತ್ಯಾಂಶ ಹೊರಬರಲಿದ್ದು, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಗೆ ನಿಮ್ಮ ನೈಜ ಸಾಮರ್ಥ್ಯದ ಅರಿವಾಗಲಿದೆ. ಕುತಂತ್ರ ಹೂಡಿದವರೇ ತಮ್ಮ ತಪ್ಪಿನಿಂದ ಹಿಂದೆ ಸರಿಯಲಿದ್ದಾರೆ.

ಕಚೇರಿಯಲ್ಲಿ ವೈಯಕ್ತಿಕ ವಿಚಾರಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ನಿತ್ಯವೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಅಥವಾ ಕಾಲಭೈರವ ಅಷ್ಟಕ ಪಠಿಸುವುದರಿಂದ ಶತ್ರು ಬಾಧೆ ಮತ್ತು ರಾಜಕೀಯ ತಂತ್ರಗಳು ನಿಷ್ಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ.`,
      astrologicalBasisKn: `6ನೇ (ಶತ್ರು ಜಯ) ಮತ್ತು 10ನೇ ಮನೆಯ ಮೇಲಿನ ಛಾಯಾಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ಪ್ರತಿ ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕ ಪಠಿಸಿ ಮತ್ತು ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಮಾಡಿ.`
    },

    // 2. MARRIAGE & FAMILY
    {
      id: "q_marriage_1",
      category: "marriage",
      categoryLabelKn: "💍 ಕೌಟುಂಬಿಕ & ವಿವಾಹ",
      questionKn: "ವಿವಾಹ ಯೋಗ (ಕಂಕಣ ಭಾಗ್ಯ) ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?",
      questionEn: "When will marriage / marriage alliance finalize?",
      panditScriptKn: `ನೋಡಿ, ವಿವಾಹದ ವಿಚಾರದಲ್ಲಿ ಈ ಹಿಂದೆ ಬಂದಿದ್ದ ಒಂದು ಒಳ್ಳೆಯ ಸಂಬಂಧ ಮಾತುಕತೆಯ ಅಂತಿಮ ಹಂತದಲ್ಲಿ ಮುರಿದುಬಿದ್ದ ಘಟನೆ ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬದವರ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನಿರಾಶೆ ತಂದಿದೆ. ಜಾತಕ ಹೊಂದಾಣಿಕೆ ಅಥವಾ ಸಣ್ಣ ಕಾರಣಕ್ಕೆ ಸಂಬಂಧ ತಪ್ಪಿಹೋಗಿರುವುದು ಆತಂಕಕ್ಕೆ ದಾರಿ ಮಾಡಿದೆ.

ಈ ಘಟನೆಯ ನಂತರ ಈಗ ಬರುವ ಪ್ರತಿಯೊಂದು ಪ್ರಸ್ತಾಪದಲ್ಲೂ ಏನಾದರೊಂದು ಕೊರತೆ ಕಾಣುವುದು ಅಥವಾ ಮಾತುಕತೆಗಳು ಮುಂದುವರಿಯದೆ ನಿಧಾನವಾಗುತ್ತಿರುವುದು ನಿಮಗೆ ಕಿರಿಕಿರಿ ಉಂಟುಮಾಡಿದೆ. "ನನ್ನ ಕಲ್ಯಾಣ ಯೋಗ ಯಾವಾಗ ಕೂಡಿಬರಬಹುದು?" ಎಂಬ ಪ್ರಶ್ನೆ ಸದಾ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿದೆ.

ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ 7ನೇ ಮನೆಯ (ಕಳತ್ರ ಸ್ಥಾನ) ಅಧಿಪತಿಯ ಶುಭ ಸಂಚಾರ ಹಾಗೂ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದ ಪ್ರಕಾರ, ಮುಂದಿನ 5 ರಿಂದ 8 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 5 to 8 Months) ಅತ್ಯಂತ ಯೋಗ್ಯ ಹಾಗೂ ಸಂಸ್ಕಾರಯುತ ಕುಟುಂಬದಿಂದ ವಿವಾಹ ಪ್ರಸ್ತಾಪ ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದೆ. ಪೂರ್ವ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕಿನ ಸಂಬಂಧಗಳು ಶ್ರೇಷ್ಠವಾಗಿವೆ.

ವಿವಾಹ ಪ್ರತಿಬಂಧಕ ದೋಷಗಳ ನಿವಾರಣೆಗಾಗಿ ಪ್ರತಿ ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಥವಾ ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿಗಳಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ, "ಓಂ ಶ್ರೀಂ ಗೌರ್ಯೈ ನಮಃ" ಮಂತ್ರವನ್ನು ನಿತ್ಯವೂ ಜಪಿಸಿ.`,
      astrologicalBasisKn: `7ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ) ಮತ್ತು ಗುರು ಬಲದ ಸಕ್ರಿಯತೆ.`,
      immediateRemedyKn: `ಗುರುವಾರಗಳಂದು ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ ಹಾಗೂ ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`
    },
    {
      id: "q_marriage_2",
      category: "marriage",
      categoryLabelKn: "💍 ಕೌಟುಂಬಿಕ & ವಿವಾಹ",
      questionKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಸಾಮರಸ್ಯ ಹೇಗೆ ಸಿಗುತ್ತದೆ?",
      questionEn: "How to resolve marital tension and restore domestic peace?",
      panditScriptKn: `ದಾಂಪತ್ಯದಲ್ಲಿ ಇತ್ತೀಚೆಗೆ ನಡೆದ ಒಂದು ಸಣ್ಣ ಮಾತುಕತೆ ಅಥವಾ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಅನಗತ್ಯ ಹಸ್ತಕ್ಷೇಪವು ಇಬ್ಬರ ನಡುವೆ ದೊಡ್ಡ ಅಂತರವನ್ನು ಸೃಷ್ಟಿಸಿದೆ. ಒಬ್ಬರ ಮಾತನ್ನು ಇನ್ನೊಬ್ಬರು ತಪ್ಪಾಗಿ ಅರ್ಥೈಸಿಕೊಳ್ಳುವುದು ಹಾಗೂ ಅಹಂಕಾರದ ಘರ್ಷಣೆಯು ಮನೆಯ ನೆಮ್ಮದಿಯನ್ನು ಹಾಳುಮಾಡಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಒಂದು ರೀತಿಯ ಮೌನ ಮತ್ತು ಅಶಾಂತಿಯ ವಾತಾವರಣ ಮನೆಮಾಡಿದೆ. ಪ್ರೀತಿ ಇದ್ದರೂ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಲು ಹಿಂಜರಿಯುವ ಸ್ಥಿತಿ ಇದೆ. ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳೂ ದೊಡ್ಡ ಜಗಳವಾಗಿ ಪರಿವರ್ತನೆಯಾಗುತ್ತಿರುವುದು ನಿಮ್ಮ ಆತಂಕವನ್ನು ಹೆಚ್ಚಿಸಿದೆ.

ನಿಮ್ಮ ಜಾತಕದ 7ನೇ ಮನೆ ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಮೇಲಿನ ಗೋಚಾರ ದೋಷಗಳು ಇನ್ನೆರಡು ತಿಂಗಳಲ್ಲಿ ಶಮನಗೊಳ್ಳಲಿವೆ. ಮುಂದಿನ 2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 2 to 4 Months) ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಮರಳಿ ಬರಲಿದ್ದು, ದಾಂಪತ್ಯದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ಮರುಸ್ಥಾಪನೆಯಾಗಲಿದೆ.

ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಹಳೆಯ ತಪ್ಪುಗಳನ್ನು ಪದೇ ಪದೇ ನೆನಪಿಸಿ ಜಗಳವಾಡಬೇಡಿ. ಮಂಗಳವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಸಂಜೆ ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ, ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸಿ.`,
      astrologicalBasisKn: `7ನೇ ಮನೆ ಮತ್ತು ಶುಕ್ರನ ಕಾರಕತ್ವದ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },
    {
      id: "q_marriage_3",
      category: "marriage",
      categoryLabelKn: "💍 ಕೌಟುಂಬಿಕ & ವಿವಾಹ",
      questionKn: "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ವಿಳಂಬವಾಗುತ್ತಿರುವುದು ಏಕೆ ಮತ್ತು ಪರಿಹಾರವೇನು?",
      questionEn: "Why delay in childbirth and what is the remedy?",
      panditScriptKn: `ಸಂತಾನದ ನಿರೀಕ್ಷೆಯಲ್ಲಿರುವ ನಿಮಗೆ ಈ ಹಿಂದೆ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಸಕಾರಾತ್ಮಕವಾಗಿದ್ದರೂ ಫಲ ಸಿಗದಿರುವುದು ಅಥವಾ ಸಣ್ಣಪುಟ್ಟ ಅಡೆತಡೆಗಳು ಎದುರಾಗಿರುವುದು ಕೌಟುಂಬಿಕವಾಗಿ ಮಾನಸಿಕ ಒತ್ತಡವನ್ನು ತಂದಿದೆ.

ಪ್ರಸ್ತುತ ಸಮಾಜ ಮತ್ತು ಸಂಬಂಧಿಕರ ಪ್ರಶ್ನೆಗಳನ್ನು ಎದುರಿಸಲಾಗದೆ ನೀವು ಒಳಗೆ ಕೊರಗುತ್ತಿದ್ದೀರಿ. ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಳ ಜೊತೆಗೆ ದೈವಬಲ ಯಾವಾಗ ಕೈಹಿಡಿಯುತ್ತದೆ ಎಂಬ ನಿರೀಕ್ಷೆಯಲ್ಲಿದ್ದೀರಿ.

ನಿಮ್ಮ ಜಾತಕದ 5ನೇ ಮನೆಯ (ಸಂತಾನ ಸ್ಥಾನ) ಅಧಿಪತಿ ಮತ್ತು ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಗೋಚಾರ ಸಂಚಾರದ ಪ್ರಕಾರ, ಮುಂದಿನ 6 ರಿಂದ 9 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 6 to 9 Months) ಸಂತಾನ ಭಾಗ್ಯದ ಶುಭ ಸುದ್ದಿ ಮನೆತುಂಬುವ ಪ್ರಬಲ ಯೋಗವಿದೆ. ದೋಷಗಳು ಕೇವಲ ತಾತ್ಕಾಲಿಕ.

ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಜಪಿಸಿ. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಬಲಿ/ಸರ್ಪದೋಷ ಶಾಂತಿ ಸೇವೆ ಸಮರ್ಪಿಸುವುದು ಶ್ರೇಷ್ಠ ಪರಿಹಾರ.`,
      astrologicalBasisKn: `5ನೇ ಮನೆ (ಪುತ್ರ ಸ್ಥಾನ) ಮತ್ತು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಗೋಚಾರ ಸಂಚಾರ.`,
      immediateRemedyKn: `ದಿನನಿತ್ಯ ಸಂತಾನ ಗೋಪಾಲ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಪ್ರತಿ ಗುರುವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಹಾಲಿನ ಅಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },

    // 3. MIND & HEALTH
    {
      id: "q_mind_1",
      category: "mind",
      categoryLabelKn: "🧠 ಮಾನಸಿಕ ನೆಮ್ಮದಿ & ಆರೋಗ್ಯ",
      questionKn: "ಮನಸ್ಸಿಗೆ ಸದಾ ಆತಂಕ, ಭಯ ಮತ್ತು ನಿದ್ರಾಹೀನತೆ ಕಾಡುತ್ತಿದೆ, ಕಾರಣವೇನು?",
      questionEn: "Why constant anxiety, fear, and insomnia?",
      panditScriptKn: `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ನೋಡಿದ ಕ್ಷಣವೇ ನಿಮ್ಮ ಮನಸ್ಸಿನ ತುಮುಲ ನನಗೆ ಸ್ಪಷ್ಟವಾಗುತ್ತಿದೆ. ಇತ್ತೀಚೆಗೆ ನಡೆದ ಒಂದು ಅನಿರೀಕ್ಷಿತ ಘಟನೆ ಅಥವಾ ನಂಬಿಕೆ ದ್ರೋಹವು ನಿಮ್ಮ ಅಂತಃಚೇತನವನ್ನು ತೀವ್ರವಾಗಿ ಕಲಕಿದೆ. ಹೊರಗೆ ನಗುತ್ತಾ ಕಂಡರೂ ನಿಮ್ಮ ಎದೆಯೊಳಗೆ ಸದಾ ಒಂದು ಆತಂಕದ ಕಂಪನವಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಸ್ಥಿತಿ ಎಂದರೆ, ರಾತ್ರಿ 2:00 ರಿಂದ 4:30 ರ ಸಮಯದಲ್ಲಿ ಗಾಢ ನಿದ್ರೆ ಬಾರದೆ ಎಚ್ಚರವಾಗುವುದು, ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಏನಾಗುವುದೋ ಎಂಬ ಅತಿಯಾದ ಕಲ್ಪನೆಗಳು (Overthinking) ಮತ್ತು ಏಕಾಂಗಿತನದ ಭಾವನೆ ನಿಮ್ಮನ್ನು ಹೈರಾಣಾಗಿಸಿದೆ. ಇಲ್ಲದಿರುವುದನ್ನು ಊಹಿಸಿಕೊಂಡು ಭಯಪಡುತ್ತಿದ್ದೀರಿ.

ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನ ಸೂಕ್ಷ್ಮ ಸಂಚಾರ ಹಾಗೂ ಜಲ ತತ್ವದ ಏರಿಳಿತವೇ ಇದಕ್ಕೆ ಮೂಲ ಕಾರಣ. ಆದರೆ ನಿಮ್ಮ ಲಗ್ನ ಬಲ ದೃಢವಾಗಿದೆ. ಮುಂದಿನ 2 ರಿಂದ 3 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 2 to 3 Months) ಈ ಆತಂಕದ ಕಾರ್ಮೋಡ ಸಂಪೂರ್ಣವಾಗಿ ಕರಗಲಿದ್ದು, ಮನಸ್ಸಿಗೆ ಪ್ರಶಾಂತತೆ ಮರಳಲಿದೆ.

ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಮೊಬೈಲ್ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ, ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ಕಾಲು ತೊಳೆದು 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ. ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಮಾನಸಿಕ ಧೈರ್ಯ ಇಮ್ಮಡಿಯಾಗುತ್ತದೆ.`,
      astrologicalBasisKn: `ಚಂದ್ರ ಗ್ರಹದ ತ್ರಿಕ/ಜಲ ಸ್ಥಾನ ಮತ್ತು ಪಂಚಾಂಗ ಜಲ ತತ್ವದ ಸೂಕ್ಷ್ಮ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `${prescriptions.rudraksha.nameKn} ಧರಿಸಿ ಮತ್ತು ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.`
    },
    {
      id: "q_mind_2",
      category: "mind",
      categoryLabelKn: "🧠 ಮಾನಸಿಕ ನೆಮ್ಮದಿ & ಆರೋಗ್ಯ",
      questionKn: "ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಮತ್ತು ಶತ್ರು ಭೀತಿ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to neutralize evil eye, negative energy, and enemy fear?",
      panditScriptKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿನ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ನೋಡಿ ನಿಮ್ಮ ಆಪ್ತ ವಲಯದಲ್ಲೇ ಕೆಲವರಿಗೆ ತೀವ್ರ ಅಸೂಯೆ ಉಂಟಾಗಿದೆ. ಇತ್ತೀಚೆಗೆ ಯಾವುದೇ ಶುಭ ಕಾರ್ಯ ಅಥವಾ ಹೊಸ ಕೆಲಸ ಆರಂಭಿಸಿದಾಗಲೆಲ್ಲಾ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು, ಮನೆಯಲ್ಲಿ ಕಾಯಿಲೆ ಅಥವಾ ವಸ್ತುಗಳು ಹಾಳಾಗುವ ಘಟನೆಗಳು ನಡೆದಿವೆ.

ಪ್ರಸ್ತುತ ನೀವು ಮನೆಯೊಳಗೆ ಕಾಲಿಡುತ್ತಿದ್ದಂತೆಯೇ ಒಂದು ರೀತಿಯ ಭಾರವಾದ ವಾತಾವರಣ, ನಿಶ್ಯಕ್ತಿ ಮತ್ತು ಕಿರಿಕಿರಿ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ. ನಿಮ್ಮ ಉತ್ಸಾಹವೆಲ್ಲಾ ಸೋರಿಹೋಗುತ್ತಿರುವಂತೆ ಭಾಸವಾಗುತ್ತಿದೆ.

ಇದು ನರ ದೃಷ್ಟಿ ಮತ್ತು ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಯ ತಾತ್ಕಾಲಿಕ ಪ್ರಭಾವ. ನಿಮ್ಮ ಜಾತಕದ ಭಾಗ್ಯ ಸ್ಥಾನ ಶುದ್ಧವಾಗಿರುವುದರಿಂದ ಯಾವುದೇ ದುಷ್ಟ ಶಕ್ತಿಗಳು ನಿಮಗೆ ದೀರ್ಘಕಾಲಿಕ ಹಾನಿ ಮಾಡಲಾರವು. ಮುಂದಿನ 1 ರಿಂದ 2 ತಿಂಗಳಲ್ಲಿ (Next 1 to 2 Months) ರಕ್ಷಾ ಕವಚದ ಪ್ರಭಾವದಿಂದ ಸಕಲ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಲಿವೆ.

ಮಂಗಳವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಸಂಜೆ ಮನೆಯ ಮುಖ್ಯದ್ವಾರಕ್ಕೆ ಕಲ್ಲುಪ್ಪು ಮತ್ತು ನಿಂಬೆಹಣ್ಣಿನ ದೃಷ್ಟಿ ತೆಗೆದು ಹಾಕಿ. ಶ್ರೀ ಸುದರ್ಶನ ಕವಚ ಅಥವಾ ನರಸಿಂಹ ಮಂತ್ರ ಪಠಿಸಿ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶತ್ರು ಸಂಹಾರ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`,
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
      panditScriptKn: `ನೋಡಿ, ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ಬಂದ ಒಂದು ಅನಿರೀಕ್ಷಿತ ತುರ್ತು ಖರ್ಚು ಅಥವಾ ಇತರರ ಮಾತನ್ನು ನಂಬಿ ಮಾಡಿದ ಹೂಡಿಕೆಯು ನಿಮ್ಮನ್ನು ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕಿಸಿದೆ. ಹಣದ ಹರಿವು ನಿಂತುಹೋಗಿ, ತಿಂಗಳ ಕಂತುಗಳು ಮತ್ತು ಬಡ್ಡಿ ಕಟ್ಟುವುದೇ ದೊಡ್ಡ ಸವಾಲಾಗಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ಎಂದರೆ, ಕೈಗೆ ಬಂದ ಹಣ ಕಣ್ಣಿಗೆ ಕಾಣದಂತೆ ಖರ್ಚಾಗುತ್ತಿದೆ. ಸಾಲಗಾರರ ಕರೆಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು ನಿಮ್ಮ ಆತ್ಮಗೌರವಕ್ಕೆ ಧಕ್ಕೆ ತರುತ್ತಿವೆ. ಇದರಿಂದಾಗಿ ಗೌಪ್ಯವಾಗಿ ಮಾನಸಿಕ ಯಾತನೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ.

ನಿಮ್ಮ ಜಾತಕದ 6ನೇ (ಋಣ ವಿಮೋಚನೆ) ಮತ್ತು 11ನೇ (ಆದಾಯ ವೃದ್ಧಿ) ಮನೆಗಳ ಗ್ರಹಗಳ ಚಲನೆಯ ಪ್ರಕಾರ, ಮುಂದಿನ 4 ರಿಂದ 7 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 4 to 7 Months) ಹೊಸ ಆದಾಯದ ಮೂಲ ತೆರೆದುಕೊಳ್ಳಲಿದ್ದು, ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ ಇಳಿಯಲಿದೆ. ಆಸ್ತಿ ಮಾರಾಟ ಅಥವಾ ಬರಬೇಕಾದ ಹಳೆಯ ಬಾಕಿ ಹಣ ಕೈಸೇರಲಿದೆ.

ಪ್ರತಿ ಮಂಗಳವಾರ ಋಣವಿಮೋಚಕ ಅಂಗಾರಕ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ಅನಗತ್ಯ ಆಡಂಬರದ ವೆಚ್ಚಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕಿ, ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ರತ್ನವಾದ ${prescriptions.gemstoneRing.primaryGemstoneKn} ಧರಿಸಿ.`,
      astrologicalBasisKn: `6ನೇ (ಋಣ) ಮತ್ತು 2ನೇ (ಧನ ಕೋಶ) ಮನೆಗಳ ದಶಾ-ಅಂತರ್ದಶಾ ಪರಿವರ್ತನೆ.`,
      immediateRemedyKn: `ಪ್ರತಿ ಮಂಗಳವಾರ ಋಣವಿಮೋಚಕ ಅಂಗಾರಕ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಲಕ್ಷ್ಮಿ ಸೇವೆ ಸಲ್ಲಿಸಿ.`
    },
    {
      id: "q_wealth_2",
      category: "wealth",
      categoryLabelKn: "💰 ಆರ್ಥಿಕತೆ & ಸಾಲ ಮುಕ್ತಿ",
      questionKn: "ಹೊಸ ಮನೆ ನಿರ್ಮಾಣ, ಆಸ್ತಿ ಅಥವಾ ವಾಹನ ಖರೀದಿ ಯೋಗ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?",
      questionEn: "When will real estate, house construction, or vehicle purchase manifest?",
      panditScriptKn: `ನಿಮ್ಮ ಸ್ವಂತ ಮನೆ ಅಥವಾ ಆಸ್ತಿ ಹೊಂದುವ ಕನಸು ಹಲವು ವರ್ಷಗಳಿಂದ ಇದ್ದರೂ, ಇತ್ತೀಚೆಗೆ ನಡೆದ ಹಣಕಾಸಿನ ಮುಗ್ಗಟ್ಟು ಅಥವಾ ದಾಖಲೆ ಪತ್ರಗಳ ಅಡೆತಡೆಯಿಂದಾಗಿ ಯೋಜನೆ ಅರ್ಧಕ್ಕೆ ನಿಂತಿದೆ.

ಪ್ರಸ್ತುತ ನೀವು ಬಾಡಿಗೆ ಮನೆಯಲ್ಲಿರಲು ಬೇಸರಗೊಂಡು ಅಥವಾ ಸ್ಥಳ ಬದಲಾವಣೆಯ ತುಡಿತದಲ್ಲಿದ್ದೀರಿ. "ನನ್ನ ಸ್ವಂತ ಸೂರಿನ ಕನಸು ಯಾವಾಗ ನನಸಾಗುತ್ತದೆ?" ಎಂಬ ಆಲೋಚನೆ ನಿಮ್ಮನ್ನು ಸದಾ ಕಾಡುತ್ತಿದೆ.

ನಿಮ್ಮ ಜಾತಕದ 4ನೇ ಮನೆಯ (ಭೂಮಿ, ಗೃಹ, ವಾಹನ ಸುಖ ಸ್ಥಾನ) ಅಧಿಪತಿಯ ಸಂಚಾರ ಬಲ ಪ್ರಸ್ತುತ ವೃದ್ಧಿಯಾಗುತ್ತಿದೆ. ಮುಂದಿನ 8 ರಿಂದ 12 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 8 to 12 Months) ಗೃಹ ನಿರ್ಮಾಣ, ನಿವೇಶನ ಖರೀದಿ ಅಥವಾ ವಾಹನ ಪ್ರಾಪ್ತಿಯ ಶುಭ ಯೋಗ ಅತ್ಯಂತ ಪ್ರಬಲವಾಗಿ ಸಕ್ರಿಯಗೊಳ್ಳಲಿದೆ.

ಭೂಮಿ ಕಾರಕನಾದ ಕುಜ (ಮಂಗಳ) ಗ್ರಹಕ್ಕೆ ಮಂಗಳವಾರದಂದು ಕೆಂಪು ಹೂವುಗಳಿಂದ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಮತ್ತು ಗೃಹ ಪ್ರವೇಶದ ಸಂಕಲ್ಪಕ್ಕೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ವಾಸ್ತು ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ.`,
      astrologicalBasisKn: `4ನೇ ಮನೆ (ಮಾತೃ/ಭೂಮಿ/ವಾಹನ ಸ್ಥಾನ) ಮತ್ತು ಕುಜ-ಗುರುಗಳ ಗೋಚಾರ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ದರ್ಶನ ಮಾಡಿ ಮತ್ತು ಕೆಂಪು ವಸ್ತ್ರ ದಾನ ಮಾಡಿ.`
    }
  ];
};

/* ==========================================================================
   7. MASTER 5-ANGA INTEGRATED ENGINE
   ========================================================================== */

export const generatePanchangaAngaSynthesis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; lang?: string }
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
  const currentDiagnosis = generateCurrentLifeDiagnosis(kundli, context);
  const instantQAList = generateInstantQAList(kundli, currentDiagnosis, prescriptions);

  // Build Multi-Paragraph Astrologer Reading (Clean Kannada + English Digits + In-Depth Face-to-Face Mind Reading)
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNak = moon?.nakshatra.english ?? "Ashwini";
  const lagna = kundli.lagnaRashi.english;

  const p1 = `ನಮಸ್ಕಾರ. ನೋಡಿ, ನೀವು ಇಂದು ನನ್ನ ಬಳಿ ಜಾತಕ ಹಾಗೂ ಪಂಚಾಂಗ ವಿಶ್ಲೇಷಣೆಗೆ ಬಂದಿರುವುದು ಕೇವಲ ಆಕಸ್ಮಿಕವಲ್ಲ. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagna} ಹಾಗೂ ${kundli.moonSign.english} ರಾಶಿಯ ${moonNak} ನಕ್ಷತ್ರದ ಗ್ರಹಗತಿಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದರೆ, ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಇತ್ತೀಚೆಗೆ ಒಂದು ನಿರ್ದಿಷ್ಟ ಘಟನೆ ನಡೆದುಹೋಗಿದೆ. ${currentDiagnosis.technicalAspects.fourthHouseDetail}. ಹೊರನೋಟಕ್ಕೆ ನೀವು ಎಲ್ಲವೂ ಶಾಂತವಾಗಿದೆ ಎಂಬಂತೆ ತೋರಿಸಿಕೊಂಡರೂ, ರಾತ್ರಿ 2:00 ರಿಂದ 4:30 ರ ನಸುಕಿನ ವೇಳೆಯಲ್ಲಿ ಮನಸ್ಸಿನಲ್ಲಿ ಅತಿಯಾದ ಆಲೋಚನೆಗಳು (Overthinking) ಮತ್ತು ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ಆತಂಕ ನಿಮ್ಮನ್ನು ನೆಮ್ಮದಿಯಾಗಿ ನಿದ್ರೆ ಮಾಡಲು ಬಿಡುತ್ತಿಲ್ಲ, ಹೌದಲ್ಲವೇ?`;
  
  const p2 = `ಈ ಪ್ರಶ್ನೆ ಮತ್ತು ಆತಂಕ ನಿಮ್ಮಲ್ಲಿ ಉದ್ಭವಿಸಲು ಮುಖ್ಯ ಕಾರಣ: ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ${currentDiagnosis.primaryLifeChallenge.area} ಕ್ಷೇತ್ರದಲ್ಲಿ ನಡೆದಿರುವ ಘರ್ಷಣೆ. ${currentDiagnosis.primaryLifeChallenge.description}. ನೀವು ಎಷ್ಟು ನಿಸ್ವಾರ್ಥವಾಗಿ ಮತ್ತು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಶ್ರಮಿಸಿದರೂ ಜನ ನಿಮ್ಮನ್ನು ತಪ್ಪಾಗಿ ಗ್ರಹಿಸುವುದು ಅಥವಾ ನಿಮ್ಮ ಒಳ್ಳೆಯತನವನ್ನೇ ದೌರ್ಬಲ್ಯವೆಂದು ತಿಳಿಯುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನೋವುಂಟುಮಾಡಿದೆ. ${currentDiagnosis.technicalAspects.tenthHouseDetail} ಮತ್ತು ${currentDiagnosis.technicalAspects.seventhHouseDetail}. ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}`;

  const p3 = `ಆದರೆ ನೀವು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಧೃತಿಗೆಡಬೇಕಾಗಿಲ್ಲ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಇದು ನಿಮ್ಮ ಹಿಂದಿನ ಕರ್ಮದ ಅಂತಿಮ ಶುದ್ಧೀಕರಣ ಘಟ್ಟ. ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 3 to 5 Months) ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಪ್ರಸ್ತುತ ಇರುವ ಕತ್ತಲೆ ಕರಗಿ ಹೊಸ ದಾರಿ ಗೋಚರಿಸಲಿದೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವಯುತ ಸ್ಥಾನಮಾನ ಖಚಿತವಾಗಿ ಲಭಿಸಲಿದೆ.`;

  const p4 = `ನಿಮ್ಮ ಒಳಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಮರಳಿ ತರಲು, ${lagna} ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಮಾಡಿಸಿ ${prescriptions.gemstoneRing.fingerKn}ಕ್ಕೆ ${prescriptions.gemstoneRing.activationDay} ದಿನ ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಇದರೊಂದಿಗೆ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಹಾಗೂ ${currentDiagnosis.prasthuthaSthiti.immediateRemedies.join(" ")}. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿಸುವ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`;

  return {
    panchanga: {
      vara: { nameKn: varaInfo.kn, nameEn: varaInfo.en, lord: varaLord, tatva: varaInfo.tatva },
      tithi: { nameKn: tradPanchanga.tithiKn || tradPanchanga.tithi, nameEn: tradPanchanga.tithi, paksha: tradPanchanga.paksha, jalTatvaQuality: "Nourishes emotional relationships and desire fulfillment" },
      nakshatra: { nameKn: tradPanchanga.moonNakshatraKn || moonNak, nameEn: moonNak, lord: calculateKpSubLord(moon?.degree ?? 0).nakshatraLord, deity: "Presiding Divine Guardian" },
      yoga: { nameKn: yogaRule.sanskrit, nameEn: yogaRule.english, rule: yogaRule },
      karana: { nameKn: karanaRule.nameKn, nameEn: karanaRule.nameEn, rule: karanaRule }
    },
    prescriptions,
    currentDiagnosis,
    instantQAList,
    multiParagraphExecutiveReading: [p1, p2, p3, p4]
  };
};
