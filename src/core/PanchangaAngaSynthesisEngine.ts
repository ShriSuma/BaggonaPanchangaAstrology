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
  };
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
   4. PRESCRIPTION GENERATION LOGIC (5-ANGAS UNIFIED)
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

  // 1. Rudraksha Selection based on Lagna Lord, Nakshatra & Karana Tatva
  const rudrakshaMap: Record<PlanetName, { mukhi: number; nameKn: string; nameEn: string; deity: string }> = {
    [PlanetName.Sun]: { mukhi: 1, nameKn: "೧ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "1 Mukhi Rudraksha", deity: "Lord Shiva (Surya Tatva)" },
    [PlanetName.Moon]: { mukhi: 2, nameKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "2 Mukhi Rudraksha", deity: "Ardhanarishvara (Chandra Tatva)" },
    [PlanetName.Mars]: { mukhi: 3, nameKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "3 Mukhi Rudraksha", deity: "Lord Agni (Mangala Tatva)" },
    [PlanetName.Mercury]: { mukhi: 4, nameKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "4 Mukhi Rudraksha", deity: "Lord Brahma (Budha Tatva)" },
    [PlanetName.Jupiter]: { mukhi: 5, nameKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "5 Mukhi Rudraksha", deity: "Lord Kalagni Rudra (Guru Tatva)" },
    [PlanetName.Venus]: { mukhi: 6, nameKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "6 Mukhi Rudraksha", deity: "Lord Kartikeya (Shukra Tatva)" },
    [PlanetName.Saturn]: { mukhi: 7, nameKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "7 Mukhi Rudraksha", deity: "Goddess Mahalakshmi (Shani Tatva)" },
    [PlanetName.Rahu]: { mukhi: 8, nameKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "8 Mukhi Rudraksha", deity: "Lord Ganesha (Rahu Tatva)" },
    [PlanetName.Ketu]: { mukhi: 9, nameKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "9 Mukhi Rudraksha", deity: "Goddess Durga (Ketu Tatva)" }
  };

  const selectedRudraksha = rudrakshaMap[lagnaLord] || rudrakshaMap[PlanetName.Jupiter];

  // 2. Gemstone Ring Selection (ಉಂಗುರ / ರತ್ನ)
  const gemstoneMap: Record<PlanetName, {
    kn: string; en: string; sanskrit: string; carat: string; metalKn: string; metalEn: string; fingerKn: string; fingerEn: string;
  }> = {
    [PlanetName.Sun]: { kn: "ಮಾಣಿಕ್ಯ (ರೂಬಿ)", en: "Ruby", sanskrit: "Manikya", carat: "3.5 - 5.25 Carats", metalKn: "ಚಿನ್ನ (Gold) ಅಥವಾ ತಾಮ್ರ", metalEn: "Gold or Copper", fingerKn: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", fingerEn: "Ring Finger of Right Hand" },
    [PlanetName.Moon]: { kn: "ಮುತ್ತು (ಪರ್ಲ್)", en: "Natural Pearl", sanskrit: "Mukta", carat: "4.25 - 6.5 Carats", metalKn: "ಬೆಳ್ಳಿ (Silver)", metalEn: "Pure Silver", fingerKn: "ಕಿರುಬೆರಳು (Little Finger)", fingerEn: "Little Finger of Right Hand" },
    [PlanetName.Mars]: { kn: "ಹವಳ (ರೆಡ್ ಕೋರಲ್)", en: "Red Coral", sanskrit: "Pravala", carat: "5.25 - 7.5 Carats", metalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ", metalEn: "Copper or Gold", fingerKn: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", fingerEn: "Ring Finger of Right Hand" },
    [PlanetName.Mercury]: { kn: "ಪಚ್ಚೆ (ಎಮರಾಲ್ಡ್)", en: "Emerald (Patsche)", sanskrit: "Marakata", carat: "3.25 - 5.0 Carats", metalKn: "ಚಿನ್ನ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Gold or Panchadhatu", fingerKn: "ಕಿರುಬೆರಳು (Little Finger)", fingerEn: "Little Finger of Right Hand" },
    [PlanetName.Jupiter]: { kn: "ಪುಷ್ಪರಾಗ (ಎಲ್ಲೋ ಸಫೈರ್)", en: "Yellow Sapphire", sanskrit: "Pushparaga", carat: "4.25 - 6.0 Carats", metalKn: "ಅಪ್ಪಟ ಚಿನ್ನ (Pure Gold)", metalEn: "Pure Gold", fingerKn: "ತೋರುಬೆರಳು (Index Finger)", fingerEn: "Index Finger of Right Hand" },
    [PlanetName.Venus]: { kn: "ವಜ್ರ (ಡೈಮಂಡ್) ಅಥವಾ ವೈಟ್ ಜಿರ್ಕಾನ್", en: "Diamond or White Zircon", sanskrit: "Vajra / Heera", carat: "0.75 - 1.5 Carats", metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಪ್ಲಾಟಿನಂ", metalEn: "Silver or Platinum", fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಉಂಗುರದ ಬೆರಳು", fingerEn: "Middle or Ring Finger" },
    [PlanetName.Saturn]: { kn: "ನೀಲಂ (ಬ್ಲೂ ಸಫೈರ್)", en: "Blue Sapphire (Neelam)", sanskrit: "Neelam", carat: "4.5 - 6.25 Carats", metalKn: "ಪಂಚಧಾತು ಅಥವಾ ಬೆಳ್ಳಿ", metalEn: "Panchadhatu or Silver", fingerKn: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", fingerEn: "Middle Finger of Right Hand" },
    [PlanetName.Rahu]: { kn: "ಗೋಮೇಧಿಕ (ಹೆಸೊನೈಟ್)", en: "Hessonite (Gomed)", sanskrit: "Gomedhika", carat: "4.25 - 6.0 Carats", metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Silver or Panchadhatu", fingerKn: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", fingerEn: "Middle Finger of Right Hand" },
    [PlanetName.Ketu]: { kn: "ವೈಢೂರ್ಯ (ಕ್ಯಾಟ್ಸ್ ಐ)", en: "Cat's Eye (Vaidurya)", sanskrit: "Vaidurya", carat: "3.5 - 5.5 Carats", metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Silver or Panchadhatu", fingerKn: "ಉಂಗುರದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು", fingerEn: "Ring or Little Finger" }
  };

  const selectedGem = gemstoneMap[lagnaLord] || gemstoneMap[PlanetName.Jupiter];

  // 3. Lucky Attributes
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
      astrologicalReason: `ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯಾದ ${lagnaLord} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರದ ತರಂಗಾಂತರವನ್ನು ಶುದ್ಧೀಕರಿಸಲು, ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ವೃದ್ಧಿಸಲು ಈ ರುದ್ರಾಕ್ಷಿಯು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
      wearingMethod: "ಸೋಮವಾರ ಅಥವಾ ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ ಹಸಿ ಹಾಲಿನಲ್ಲಿ ಮತ್ತು ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ೧೦೮ ಬಾರಿ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
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
      astrologicalReason: `ಲಗ್ನ ಬಲವನ್ನು ಸ್ಥಿರಗೊಳಿಸಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಮತ್ತು ದಶಾ ಸಂಧಿಕಾಲದ ಅಡೆತಡೆಗಳಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಲು ಈ ಭಾಗ್ಯ ರತ್ನ ಉಂಗುರವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`,
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
   5. REAL-TIME LIFE DIAGNOSIS & TALKING POINTS
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
  const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
  const rahu = kundli.planets.find((p) => p.name === PlanetName.Rahu);

  // 1. Mental State Issue Diagnosis
  let mentalIssue = false;
  let mentalSeverity: CurrentLifeDiagnosis["mentalStateIssue"]["severity"] = "Calm";
  let mentalDiagnosis = "ನಿಮ್ಮ ಮನಸ್ಸು ಪ್ರಸ್ತುತ ಸಮತೋಲನದಲ್ಲಿದೆ; ಆದರೂ ಸೂಕ್ಷ್ಮ ವಿಷಯಗಳಿಗೆ ಹೆಚ್ಚು ಆಲೋಚಿಸುವುದನ್ನು ಕಡಿಮೆ ಮಾಡಿಕೊಳ್ಳಿ.";

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

  // 2. Primary Life Challenge Assessment
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
    rootCause = `೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${tenthLord} ಗ್ರಹವು ${tenthLordPlanet.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದು.`;
  } else if (seventhLordPlanet && [6, 8].includes(seventhLordPlanet.house)) {
    challengeArea = "Personal / Marriage";
    challengeDesc = "ದಾಂಪತ್ಯದಲ್ಲಿ ಅಥವಾ ಕುಟುಂಬದಲ್ಲಿ ಅನಗತ್ಯ ಮಾತುಕತೆಗಳಿಂದ ವೈಮನಸ್ಸು, ಸಂಗಾತಿಯ ಹಠಮಾರಿತನ ಅಥವಾ ವಿವಾಹ ನಿಶ್ಚಯದಲ್ಲಿ ಅಡೆತಡೆ.";
    rootCause = `೭ನೇ ಮನೆಯ ಅಧಿಪತಿ ${seventhLord} ಗ್ರಹದ ಸ್ಥಾನ ಬಲದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ದೋಷ.`;
  } else if (kundli.maandi && [1, 7, 8].includes(kundli.maandi.rashi.index - kundli.lagnaRashi.index + 1)) {
    challengeArea = "Financial / Debts";
    challengeDesc = "ಆದಾಯಕ್ಕಿಂತ ಖರ್ಚು ಹೆಚ್ಚು, ಕೈಗೆ ಬಂದ ಹಣ ನಿಲ್ಲದಿರುವುದು ಅಥವಾ ಸಾಲ ತೀರಿಸುವ ಒತ್ತಡ.";
    rootCause = "ಮಾಂದಿಯ ಸೂಕ್ಷ್ಮ ಸಂಚಾರ ಮತ್ತು ಹಣದ ಸೋರಿಕೆ ನೋಡ್ ಸಕ್ರಿಯವಾಗಿರುವುದು.";
  }

  // 3. Immediate Remedies
  const immediateRemedies = [
    `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ: ಸೂರ್ಯ ಗಾಯತ್ರಿ ಅಥವಾ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ.`,
    `ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ: ನೈಋತ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ.`,
    `ದೈವಿಕ ಸಂಕಲ್ಪ: ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ.`
  ];

  // 4. Secret Astrologer Verbal Prompts (Talking Points for the Pandit)
  const openingIceBreakerKn = `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ನೋಡಿದರೆ ನಿಮ್ಮ ಮೂಲ ಗುಣ ತುಂಬಾ ನೇರ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ. ಆದರೆ ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಒಪ್ಪುವಂತೆ ಕೆಲಸಗಳು ಆಗುತ್ತಿಲ್ಲ, ಹೌದಲ್ಲವೇ?`;
  const hiddenSubconsciousWorryKn = mentalIssue 
    ? `ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಹೊರಗೆ ಹೇಳಿಕೊಳ್ಳಲಾಗದ ಆತಂಕವೊಂದು ಸದಾ ಕಾಡುತ್ತಿದೆ; ರಾತ್ರಿ ನಿದ್ರೆಯಲ್ಲೂ ಅದೇ ಯೋಚನೆಗಳು ಬರುತ್ತಿವೆ.` 
    : `ನೀವು ಕುಟುಂಬದ ಬಗ್ಗೆ ಸದಾ ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ, ಎಲ್ಲರನ್ನೂ ಜೊತೆಯಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆಯಬೇಕೆಂಬ ಹಂಬಲ ನಿಮಗಿದೆ.`;
  const immediateTurningPointKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆಯಲ್ಲಿ ಇನ್ನು ಮುಂದಿನ ೪ ರಿಂದ ೬ ತಿಂಗಳುಗಳಲ್ಲಿ ಪರಿಸ್ಥಿತಿ ನಿಮ್ಮ ಪರವಾಗಿ ಬದಲಾಗಲಿದೆ; ಧೈರ್ಯ ಕಳೆದುಕೊಳ್ಳಬೇಡಿ.`;

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
      immediateTurningPointKn
    }
  };
};

/* ==========================================================================
   6. INSTANT ONE-TAP QUESTIONS & ANSWERS GENERATOR
   ========================================================================== */

export const generateInstantQAList = (
  kundli: KundliOutput,
  diagnosis: CurrentLifeDiagnosis,
  prescriptions: AstrologicalPrescriptions
): InstantQAQuestion[] => {
  const lagna = kundli.lagnaRashi.english;
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNak = moon?.nakshatra.english ?? "Ashwini";

  return [
    // 1. CAREER
    {
      id: "q_career_1",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ",
      questionKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಯಾವಾಗ ಪ್ರಗತಿ ಅಥವಾ ಹೊಸ ಅವಕಾಶ ಸಿಗುತ್ತದೆ?",
      questionEn: "When will I get career progress or a new job opportunity?",
      panditScriptKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ಪ್ರಸ್ತುತ ಸಂಚಾರ ಮತ್ತು ದಶಾ ಸ್ಥಿತಿಯನ್ನು ನೋಡಿದರೆ, ಮುಂದಿನ ೩ ರಿಂದ ೫ ತಿಂಗಳಲ್ಲಿ ಹೊಸ ಅವಕಾಶ ಅಥವಾ ಸ್ಥಾನ ಬದಲಾವಣೆ ನಿಶ್ಚಿತ. ಅಲ್ಲಿಯವರೆಗೆ ಕಚೇರಿಯಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ.`,
      astrologicalBasisKn: `೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ದಶಾ ಪ್ರಭಾವ ಮತ್ತು ಗುರು-ಶನಿ ಗೋಚಾರ ಫಲ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ ಮತ್ತು ${prescriptions.gemstoneRing.primaryGemstoneKn} ಧರಿಸಿ.`
    },
    {
      id: "q_career_2",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ",
      questionKn: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ವೃದ್ಧಿ ಮತ್ತು ನಷ್ಟದಿಂದ ಮುಕ್ತಿ ಯಾವಾಗ?",
      questionEn: "When will business turn profitable and overcome loss?",
      panditScriptKn: `ವ್ಯಾಪಾರದಲ್ಲಿ ಈಗ ನಿಧಾನಗತಿ ಇದ್ದರೂ, ನಿಮ್ಮ ಲಗ್ನ ಬಲ ಉತ್ತಮವಾಗಿದೆ. ಹಣಕಾಸಿನ ಹರಿವು ಮುಂದಿನ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ಸುಧಾರಿಸುತ್ತದೆ. ಹೊಸ ಪಾಲುದಾರಿಕೆ ಅಥವಾ ದೊಡ್ಡ ಸಾಲ ಮಾಡುವ ಮುನ್ನ ಎಚ್ಚರ ವಹಿಸಿ.`,
      astrologicalBasisKn: `೨ನೇ (ಧನ) ಮತ್ತು ೧೧ನೇ (ಲಾಭ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ ಮತ್ತು ಶನಿವಾರ ಸಂಜೆ ಕಾಗೆಗಳಿಗೆ ಅನ್ನ ಹಾಕಿ.`
    },

    // 2. MARRIAGE & FAMILY
    {
      id: "q_marriage_1",
      category: "marriage",
      categoryLabelKn: "💍 ಕೌಟುಂಬಿಕ & ವಿವಾಹ",
      questionKn: "ವಿವಾಹ ಯೋಗ (ಕಂಕಣ ಭಾಗ್ಯ) ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?",
      questionEn: "When will marriage / marriage alliance finalize?",
      panditScriptKn: `ನಿಮ್ಮ ೭ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ಗೋಚಾರ ಸ್ಥಿತಿ ಶೀಘ್ರದಲ್ಲೇ ಶುಭ ಸ್ಥಾನಕ್ಕೆ ಬರಲಿದೆ. ಮುಂದಿನ ೬ ರಿಂದ ೮ ತಿಂಗಳಲ್ಲಿ ಯೋಗ್ಯ ಸಂಬಂಧ ಕೂಡಿಬರುವ ಪ್ರಬಲ ಸಂಭವವಿದೆ. ಉತ್ತರ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕಿನ ಸಂಬಂಧಗಳು ಶ್ರೇಷ್ಠ.`,
      astrologicalBasisKn: `೭ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ) ಮತ್ತು ಗುರು ಬಲದ ಸಕ್ರಿಯತೆ.`,
      immediateRemedyKn: `ಗುರುವಾರಗಳಂದು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಥವಾ ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿಗಳಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ.`
    },
    {
      id: "q_marriage_2",
      category: "marriage",
      categoryLabelKn: "💍 ಕೌಟುಂಬಿಕ & ವಿವಾಹ",
      questionKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಸಾಮರಸ್ಯ ಹೇಗೆ ಸಿಗುತ್ತದೆ?",
      questionEn: "How to resolve marital tension and restore domestic peace?",
      panditScriptKn: `ದಾಂಪತ್ಯದಲ್ಲಿನ ತೊಂದರೆಗೆ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಹಸ್ತಕ್ಷೇಪ ಅಥವಾ ಅನಗತ್ಯ ಸಂಶಯಗಳೇ ಮೂಲ ಕಾರಣ. ಶುಕ್ರ ಮತ್ತು ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದಾಗಿ ಇನ್ನೊಬ್ಬರ ಭಾವನೆಗಳಿಗೆ ಗೌರವ ನೀಡಿ, ಮನೆಯಲ್ಲಿ ಮಂಗಳವಾರ-ಶುಕ್ರವಾರ ಧೂಪ ಹಾಕಿ.`,
      astrologicalBasisKn: `೭ನೇ ಮನೆ ಮತ್ತು ಶುಕ್ರನ ಕಾರಕತ್ವದ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },

    // 3. MIND & HEALTH
    {
      id: "q_mind_1",
      category: "mind",
      categoryLabelKn: "🧠 ಮಾನಸಿಕ ನೆಮ್ಮದಿ & ಆರೋಗ್ಯ",
      questionKn: "ಮನಸ್ಸಿಗೆ ಸದಾ ಆತಂಕ, ಭಯ ಮತ್ತು ನಿದ್ರಾಹೀನತೆ ಕಾಡುತ್ತಿದೆ, ಕಾರಣವೇನು?",
      questionEn: "Why constant anxiety, fear, and insomnia?",
      panditScriptKn: `ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನ ಸೂಕ್ಷ್ಮ ಸ್ಥಿತಿಯಿಂದಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸು ಅತಿಯಾಗಿ ಆಲೋಚಿಸುತ್ತದೆ. ಇಲ್ಲದಿರುವುದನ್ನು ಕಲ್ಪಿಸಿಕೊಂಡು ಭಯಪಡುವ ಅಗತ್ಯವಿಲ್ಲ. ದೈವಾನುಗ್ರಹ ನಿಮ್ಮ ಮೇಲಿದೆ; ಈ ಅಶಾಂತಿ ತಾತ್ಕಾಲಿಕ.`,
      astrologicalBasisKn: `ಚಂದ್ರ ಗ್ರಹದ ಸ್ಥಾನ ಮತ್ತು ಪಂಚಾಂಗ ಜಲ ತತ್ವದ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `${prescriptions.rudraksha.nameKn} ಧರಿಸಿ ಮತ್ತು ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ೧೧ ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.`
    },

    // 4. WEALTH & DEBT
    {
      id: "q_wealth_1",
      category: "wealth",
      categoryLabelKn: "💰 ಆರ್ಥಿಕತೆ & ಸಾಲ ಮುಕ್ತಿ",
      questionKn: "ಸಾಲದ ಬಾಧೆಯಿಂದ ಮುಕ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಯಾವಾಗ?",
      questionEn: "When will debt pressure ease and finances stabilize?",
      panditScriptKn: `ಆರ್ಥಿಕವಾಗಿ ಕಳೆದ ಕೆಲವು ಕಾಲದಿಂದ ಖರ್ಚುಗಳು ಮಿತಿಮೀರಿದ್ದವು. ಆದರೆ ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ ಬಾಕಿ ಹಣ ವಸೂಲಿಯಾಗಲಿದ್ದು, ಸಾಲದ ಹೊರೆ ಗಣನೀಯವಾಗಿ ತಗ್ಗಲಿದೆ. ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ ಯೋಗವಿದೆ.`,
      astrologicalBasisKn: `೬ನೇ (ಋಣ) ಮತ್ತು ೨ನೇ (ಕೋಶ) ಮನೆಗಳ ದಶಾ-ಅಂತರ್ದಶಾ ಪರಿವರ್ತನೆ.`,
      immediateRemedyKn: `ಪ್ರತಿ ಮಂಗಳವಾರ ಋಣವಿಮೋಚಕ ಅಂಗಾರಕ ಸ್ತೋತ್ರ ಪಠಿಸಿ.`
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
  const instantQAList = generateInstantQAList(kundli, diagnosisAdaptor(currentDiagnosis), prescriptions);

  // Build Multi-Paragraph Astrologer Reading
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNak = moon?.nakshatra.english ?? "Ashwini";
  const lagna = kundli.lagnaRashi.english;

  const p1 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕ ಮತ್ತು ಪಂಚಾಂಗದ ಪಂಚಾಂಗಗಳ (ವಾರ: ${varaInfo.kn}, ತಿಥಿ: ${tradPanchanga.tithiKn || tradPanchanga.tithi}, ನಕ್ಷತ್ರ: ${moonNak}, ಯೋಗ: ${yogaRule.sanskrit}, ಕರಣ: ${karanaRule.nameKn}) ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆಯ ಪ್ರಕಾರ, ನಿಮ್ಮ ಮೂಲ ಪ್ರಕೃತಿ ಮತ್ತು ಆಂತರಿಕ ಶಕ್ತಿಯು ಉನ್ನತ ಮಟ್ಟದಲ್ಲಿದೆ. ನಿಮ್ಮ ಲಗ್ನವು ${lagna} ಆಗಿದ್ದು, ಲಗ್ನಾಧಿಪತಿಯು ನಿಮ್ಮ ಜೀವನದ ಮೂಲ ಆಧಾರ ಸ್ತಂಭವಾಗಿದ್ದಾರೆ.`;
  
  const p2 = `ಪ್ರಸ್ತುತ ಮಾನಸಿಕ ಸ್ಥಿತಿ ಮತ್ತು ಜೀವನದ ಸವಾಲು (Current Mental & Life Situation): ${currentDiagnosis.mentalStateIssue.diagnosis} ಇದಲ್ಲದೆ, ಪ್ರಸ್ತುತ ನೀವು ${currentDiagnosis.primaryLifeChallenge.area} ಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಮುಖ ಬದಲಾವಣೆ ಅಥವಾ ಸವಾಲನ್ನು ಎದುರಿಸುತ್ತಿದ್ದೀರಿ. (${currentDiagnosis.primaryLifeChallenge.description}). ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}`;

  const p3 = `ಜ್ಯೋತಿಷ್ಯ ರತ್ನ & ರುದ್ರಾಕ್ಷಿ ಶಿಫಾರಸು (Prescriptions & Remedies): ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಹಾಗೂ ಲಗ್ನ ಬಲವನ್ನು ವೃದ್ಧಿಸಲು ${prescriptions.rudraksha.nameKn} ಧರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಉಂಗುರದ ರೂಪದಲ್ಲಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ಅನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಮಾಡಿಸಿ ${prescriptions.gemstoneRing.fingerKn}ಕ್ಕೆ ${prescriptions.gemstoneRing.activationDay} ಧರಿಸುವುದರಿಂದ ಗ್ರಹ ದೋಷಗಳು ಶಮನಗೊಂಡು ಅಭಿವೃದ್ಧಿ ಕಾಣಲಿದೆ. ನಿಮ್ಮ ಅದೃಷ್ಟ ವಾಹನ ಬಣ್ಣಗಳು: ${prescriptions.luckyAttributes.carColors.join(", ")}.`;

  const p4 = `ತಕ್ಷಣದ ದೈವಿಕ ಪರಿಹಾರ: ${currentDiagnosis.prasthuthaSthiti.immediateRemedies.join(" ")}`;

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

function diagnosisAdaptor(diag: CurrentLifeDiagnosis): CurrentLifeDiagnosis {
  return diag;
}
