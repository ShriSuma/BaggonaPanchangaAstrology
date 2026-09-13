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
    maandiKarmicImpactKn: string; // 3RD PLACE: MAANDI KARMIC NODE IMPACT
    karmaFinancialRealityKn: string;
    immediateTurningPointKn: string;
    siddhaPariharaRemedyKn: string;
    technicalAspectsCueKn: string;
    openingIceBreakerEn?: string;
    hiddenSubconsciousWorryEn?: string;
    maandiKarmicImpactEn?: string;
    karmaFinancialRealityEn?: string;
    immediateTurningPointEn?: string;
    siddhaPariharaRemedyEn?: string;
  };
  technicalAspects: TechnicalKundliAspects;
  tenLifeAspectBullets: MasterLifeBulletPoint[];
}

export interface MasterLifeBulletPoint {
  id: number;
  category: "personality" | "education" | "social" | "mind" | "career" | "wealth" | "marriage" | "health" | "dasha_gochara" | "remedy";
  titleKn: string;
  titleEn: string;
  titleHi?: string;
  titleTe?: string;
  titleTa?: string;
  badgeKn: string;
  badgeEn: string;
  badgeHi?: string;
  badgeTe?: string;
  badgeTa?: string;
  icon: string;
  readingKn: string;
  readingEn: string;
  readingHi?: string;
  readingTe?: string;
  readingTa?: string;
  astrologicalBasisKn: string;
  astrologicalBasisEn: string;
  doshaSpecifics?: {
    hasDosha: boolean;
    doshaNameKn: string;
    doshaNameEn: string;
    rootCauseHouseKn: string;
    rootCauseHouseEn: string;
    afflictedPlanetKn: string;
    afflictedPlanetEn: string;
    mantraKn: string;
    mantraEn: string;
    pujaKn: string;
    pujaEn: string;
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

import { generateYajnaHawanaPlan, type YajnaHawanaEngineOutput } from "./YajnaHawanaEngine";

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
  tenLifeAspectBullets: MasterLifeBulletPoint[];
  instantQAList: InstantQAQuestion[];
  multiParagraphExecutiveReading: string[];
  yajnaHawanaPlan: YajnaHawanaEngineOutput;
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

export function calculateDevoteeAge(birthDate: string): number {
  const bDate = new Date(birthDate);
  if (isNaN(bDate.getTime())) return 28;
  const now = new Date();
  let age = now.getFullYear() - bDate.getFullYear();
  const m = now.getMonth() - bDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
    age--;
  }
  return Math.max(1, age);
}

export const generate10MasterLifeBulletPoints = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; gender?: string; devoteeName?: string },
  prescriptions: AstrologicalPrescriptions,
  age: number,
  maha: PlanetName,
  bhukti: PlanetName,
  tradPanchanga?: any
): MasterLifeBulletPoint[] => {
  const lagnaIdx = kundli.lagnaRashi.index;
  const lagnaLord = signLord(lagnaIdx);
  const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);
  const lagnaEn = kundli.lagnaRashi.english;
  const lagnaLordKn = toKannadaPlanet(lagnaLord);

  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const sun = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const mercury = kundli.planets.find((p) => p.name === PlanetName.Mercury);
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find((p) => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find((p) => p.name === PlanetName.Ketu);

  const moonSignKn = toKannadaRashi(kundli.moonSign.english);
  const moonSignEn = kundli.moonSign.english;
  const moonNakKn = toKannadaNakshatra(moon?.nakshatra.english);
  const moonNakEn = moon?.nakshatra.english || "Ashwini";
  const moonHouse = moon?.house ?? 1;

  const RASHI_NAMES_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const RASHI_NAMES_KN = ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"];

  const d9Lagna = computeSubDivisionalAmsha(kundli.ascendant);
  const d9LagnaKn = RASHI_NAMES_KN[d9Lagna.d9NavamsaSign] || lagnaKn;
  const d9LagnaEn = RASHI_NAMES_EN[d9Lagna.d9NavamsaSign] || lagnaEn;
  const d9Moon = moon ? computeSubDivisionalAmsha(moon.degree) : null;
  const d9MoonKn = d9Moon ? (RASHI_NAMES_KN[d9Moon.d9NavamsaSign] || moonSignKn) : moonSignKn;

  const secondLord = signLord((lagnaIdx + 1) % 12);
  const thirdLord = signLord((lagnaIdx + 2) % 12);
  const fourthLord = signLord((lagnaIdx + 3) % 12);
  const fifthLord = signLord((lagnaIdx + 4) % 12);
  const sixthLord = signLord((lagnaIdx + 5) % 12);
  const seventhLord = signLord((lagnaIdx + 6) % 12);
  const eighthLord = signLord((lagnaIdx + 7) % 12);
  const ninthLord = signLord((lagnaIdx + 8) % 12);
  const tenthLord = signLord((lagnaIdx + 9) % 12);
  const eleventhLord = signLord((lagnaIdx + 10) % 12);
  const twelfthLord = signLord((lagnaIdx + 11) % 12);

  const secondLordKn = toKannadaPlanet(secondLord);
  const fourthLordKn = toKannadaPlanet(fourthLord);
  const fifthLordKn = toKannadaPlanet(fifthLord);
  const sixthLordKn = toKannadaPlanet(sixthLord);
  const seventhLordKn = toKannadaPlanet(seventhLord);
  const tenthLordKn = toKannadaPlanet(tenthLord);
  const eleventhLordKn = toKannadaPlanet(eleventhLord);

  const h4PlanetsKn = kundli.planets.filter((p) => p.house === 4).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fourthLordKn} ಅಧಿಪತ್ಯ`;
  const h5PlanetsKn = kundli.planets.filter((p) => p.house === 5).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fifthLordKn} ಅಧಿಪತ್ಯ`;
  const h7PlanetsKn = kundli.planets.filter((p) => p.house === 7).map((p) => toKannadaPlanet(p.name)).join(", ") || `${seventhLordKn} ಅಧಿಪತ್ಯ`;
  const h10PlanetsKn = kundli.planets.filter((p) => p.house === 10).map((p) => toKannadaPlanet(p.name)).join(", ") || `${tenthLordKn} ಅಧಿಪತ್ಯ`;

  const marsHouse = mars?.house ?? 1;
  const isKujaDosha = [1, 2, 4, 7, 8, 12].includes(marsHouse);

  const saturnHouse = saturn?.house ?? 1;
  const isSaturnIn7th = saturnHouse === 7;
  const isSaturnAspecting7th = [1, 5, 10].includes(saturnHouse);
  const hasShaniDelay = isSaturnIn7th || isSaturnAspecting7th;

  const rahuHouse = rahu?.house ?? 1;
  const ketuHouse = ketu?.house ?? 7;
  const hasSarpaDosha7th = rahuHouse === 7 || ketuHouse === 7;
  const hasSarpaDosha5th = rahuHouse === 5 || ketuHouse === 5;

  const h5Planets = kundli.planets.filter((p) => p.house === 5);
  const fifthLordPlanet = kundli.planets.find((p) => p.name === fifthLord);
  const is5thAfflicted = [PlanetName.Saturn, PlanetName.Rahu, PlanetName.Ketu, PlanetName.Mars].some((m) => h5Planets.some((p) => p.name === m)) || (fifthLordPlanet && [6, 8, 12].includes(fifthLordPlanet.house));

  const isMoonTrika = [6, 8, 12].includes(moonHouse);
  const isVishaYoga = saturn && moon && saturn.house === moon.house;
  const isGrahanaYoga = rahu && moon && (rahu.house === moon.house || Math.abs(rahu.house - moon.house) === 6);

  const isFemale = (context.gender || "").toLowerCase().startsWith("f");
  const pronounTitleKn = isFemale ? "ಅವರ" : "ಅವರ";
  const gemName = prescriptions?.gemstoneRing?.primaryGemstoneKn || "ಮಾಣಿಕ್ಯ";
  const gemEn = prescriptions?.gemstoneRing?.primaryGemstoneEn || "Ruby";
  const gemCarat = prescriptions?.gemstoneRing?.caratWeight || "4.25 - 5.50 ಕ್ಯಾರಟ್";
  const gemMetal = prescriptions?.gemstoneRing?.metalKn || "ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ";
  const gemFinger = prescriptions?.gemstoneRing?.fingerKn || "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)";
  const rudraName = prescriptions?.rudraksha?.nameKn || "ರುದ್ರಾಕ್ಷಿ";
  const rudraEn = prescriptions?.rudraksha?.nameEn || "Rudraksha";

  // 1. Personality, Ego & Temperament
  const p1ReadingKn = age < 23
    ? `ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನ ಮತ್ತು ${toKannadaPlanet(lagnaLord)} ಗ್ರಹಬಲದ ಪ್ರಕಾರ, ನೀವು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣ ಸ್ವಾಭಿಮಾನಿ, ಸ್ವತಂತ್ರ ಪ್ರವೃತ್ತಿಯ ಹಾಗೂ ಯಾರಿಗೂ ಮಣಿಯದ ಗಟ್ಟಿ ವ್ಯಕ್ತಿತ್ವ ಹೊಂದಿದ್ದೀರಿ. ಯಾರಾದರೂ ಒತ್ತಾಯಪೂರ್ವಕವಾಗಿ ಆಜ್ಞೆ ಮಾಡಿದರೆ ಅಥವಾ ಅತಿಯಾಗಿ ನಿರ್ಬಂಧಿಸಿದರೆ ನೀವು ಎಂದಿಗೂ ಸಹಿಸುವುದಿಲ್ಲ; ಬದಲಿಗೆ ಪ್ರೀತಿ ಮತ್ತು ಸಮರ್ಥನೆಯಿಂದ ವಿವರಿಸಿದರೆ ಮಾತ್ರ ಒಪ್ಪುತ್ತೀರಿ. ಬಾಲ್ಯದಿಂದಲೇ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಸಮವಯಸ್ಕರಿಗಿಂತ ಪ್ರಬುದ್ಧವಾಗಿದ್ದು, ನಿಮ್ಮದೇ ಆದ ನೀತಿ-ನಿಯಮಗಳನ್ನು ಗೌರವಿಸುತ್ತೀರಿ.`
    : age <= 45
    ? `ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನ ಹಾಗೂ ನವಾಂಶ ${d9LagnaKn} ಸ್ಥಿತಿಯ ಪ್ರಕಾರ, ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದಲ್ಲಿ ಅಪ್ರತಿಮ ಆತ್ಮಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವದ ಗುಣ ಎದ್ದು ಕಾಣುತ್ತದೆ. ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಾಗಲಿ ಅಥವಾ ಸಮಾಜದಲ್ಲಾಗಲಿ ಯಾರ ಮುಂದೆಯೂ ಅನಗತ್ಯವಾಗಿ ಕೈಚಾಚುವವರಲ್ಲ. ತತ್ವ ಮತ್ತು ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಧಕ್ಕೆ ಬಂದರೆ ಎಷ್ಟು ದೊಡ್ಡ ಲಾಭವಿದ್ದರೂ ತಕ್ಷಣ ತಿರಸ್ಕರಿಸುವ ಛಲಗಾರಿಕೆ ನಿಮ್ಮ ರಕ್ತದಲ್ಲೇ ಇದೆ. ನಿಮ್ಮ ನೇರ ನಿಷ್ಠುರ ಮಾತು ಕೆಲವರಿಗೆ ಕಠೋರವೆನಿಸಿದರೂ, ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕತೆ ಎಂದಿಗೂ ಪ್ರಶ್ನಾತೀತ.`
    : `ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಪ್ರಭಾವದಿಂದ ನೀವು ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ, ಅಪಾರ ಜೀವನಾನುಭವದ ಹಾಗೂ ತತ್ವನಿಷ್ಠ ವ್ಯಕ್ತಿಯಾಗಿದ್ದೀರಿ. ಅನ್ಯಾಯ ಮತ್ತು ಮುಖಸ್ತುತಿಯನ್ನು ಕಂಡರೆ ನಿಮಗೆ ಸಹಜ ಅಸಹನೆ. ನಿಮ್ಮ ಸ್ವಾವಲಂಬನೆ ಮತ್ತು ಆಂತರಿಕ ಸ್ಥೈರ್ಯವು ಕಠಿಣ ಸಂದರ್ಭಗಳಲ್ಲೂ ನಿಮ್ಮನ್ನು ಅಚಲವಾಗಿ ಕಾಪಾಡಿದೆ.`;

  const p1ReadingEn = age < 23
    ? `With your ${lagnaEn} Ascendant and ${lagnaLord} strength, you possess an unyielding sense of self-respect and fiery intellectual independence. You never bow to forced coercion or arbitrary commands; you respond only to genuine reason and respect. Your thoughts are mature beyond your age, guarding your personal space fiercely.`
    : `With your ${lagnaEn} Ascendant and Navamsha in ${d9LagnaEn}, you have innate executive dignity and moral conviction. You despise subservience and sycophancy. While your unvarnished honesty may occasionally cause social friction, your integrity and self-reliance remain unshakeable.`;

  // 2. Education & Intellectual Focus
  const p2ReadingKn = age < 23
    ? `ನಿಮ್ಮ 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿ ${fifthLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, ${h5PlanetsKn} ಗ್ರಹ ಸ್ಥಿತಿ ಇದೆ. ನಿಮ್ಮ ಆಸಕ್ತಿಯುಳ್ಳ ವಿಷಯಗಳಲ್ಲಿ (ಗಣಿತ, ತಂತ್ರಜ್ಞಾನ, ವಿಜ್ಞಾನ, ಕಲೆ ಅಥವಾ ಕ್ರೀಡೆ) ನೀವು ಅತ್ಯಂತ ಚುರುಕು ಮತ್ತು ತೀಕ್ಷ್ಣ ಗ್ರಹಿಕೆ ಹೊಂದಿದ್ದೀರಿ. ಆದರೆ ಯಾರಾದರೂ ನಿಮ್ಮ ಮೇಲೆ ನಿರಾಸಕ್ತಿಯ ವಿಷಯಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಹೇರಿದಾಗ, ಅಧ್ಯಯನದಲ್ಲಿ ತಲೆನೋವು, ಏಕಾಗ್ರತೆ ಕೊರತೆ ಅಥವಾ ದಿನ ಮುಂದೂಡುವ ಪ್ರವೃತ್ತಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ. ನಿಮಗೆ ಸೈದ್ಧಾಂತಿಕ ಬಾಯಿಪಾಠಕ್ಕಿಂತ ಪ್ರಾಕ್ಟಿಕಲ್ ಮತ್ತು ತಾರ್ಕಿಕ ಕಲಿಕೆ ಶ್ರೇಷ್ಠ.`
    : age <= 40
    ? `ನಿಮ್ಮ ಜಾತಕದ 5ನೇ ಭಾವ ಹಾಗೂ ಬುಧ-ಗುರು ಗ್ರಹಗಳ ಸಂಯೋಗವು ಪ್ರಾಯೋಗಿಕ ತಂತ್ರಜ್ಞಾನ, ಹಣಕಾಸು ವಿಶ್ಲೇಷಣೆ ಅಥವಾ ಕಾರ್ಯತಂತ್ರದ ನೈಪುಣ್ಯತೆಯನ್ನು ನೀಡಿದೆ. ಹೊಸ ವಿಷಯಗಳನ್ನು ಶೀಘ್ರವಾಗಿ ಗ್ರಹಿಸುವ ಶಕ್ತಿಯಿದ್ದು, ಸವಾಲಿನ ಸಮಸ್ಯೆಗಳಿಗೆ ಸರಳ ಪರಿಹಾರಗಳನ್ನು ಹುಡುಕುವ ಸೃಜನಶೀಲ ಬುದ್ಧಿಮತ್ತೆ ನಿಮ್ಮ ವೃತ್ತಿ ಬೆಳವಣಿಗೆಗೆ ಪ್ರಮುಖ ಶಕ್ತಿಯಾಗಿದೆ.`
    : `ನಿಮ್ಮ 5ನೇ ಮನೆಯ ಬಲವು ಆಳವಾದ ಜೀವನ ತತ್ವಜ್ಞಾನ, ದೂರದೃಷ್ಟಿ ಮತ್ತು ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ ಸಾಮರ್ಥ್ಯವನ್ನು ತಂದುಕೊಟ್ಟಿದೆ. ಇತರರು ನಿಮ್ಮ ಸಲಹೆಯನ್ನು ಗೌರವಿಸುತ್ತಾರೆ.`;

  const p2ReadingEn = age < 23
    ? `Governed by 5th lord ${fifthLord} with ${h5PlanetsKn} influence, your mind is razor-sharp in disciplines of natural curiosity (logic, technology, or creative mastery). However, when forced into rote memorization or coerced study routines, restlessness and procrastination set in. You excel through hands-on practical application rather than forced theory.`
    : `Your 5th house dynamics combined with Mercury-Jupiter intellect grant strategic acumen, quick problem-solving, and continuous professional mastery.`;

  // 3. Social & Family Dynamics
  const p3ReadingKn = age < 23
    ? `ನಿಮ್ಮ 3ನೇ ಮತ್ತು 11ನೇ ಭಾವಗಳ ಗ್ರಹ ಪ್ರಭಾವದಿಂದ, ನೀವು ಮನೆಯ ನಾಲ್ಕು ಗೋಡೆಗಳ ಮಧ್ಯೆ ಕುಳಿತುಕೊಳ್ಳುವುದಕ್ಕಿಂತ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಹೊರಾಂಗಣದಲ್ಲಿ ಬೆರೆಯಲು ಹೆಚ್ಚು ಇಷ್ಟಪಡುತ್ತೀರಿ. ಸಮಾನ ಮನಸ್ಕ ಗೆಳೆಯರ ಜೊತೆ ಕಾಲ ಕಳೆಯುವುದು ನಿಮಗೆ ಅಪಾರ ಉತ್ಸಾಹ ನೀಡುತ್ತದೆ. ಮನೆಯಲ್ಲಿ ಪೋಷಕರು ನಿಮ್ಮ ದಿನಚರಿ ಅಥವಾ ಗೆಳೆತನದ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿದಾಗ ತಕ್ಷಣ ಸಿಟ್ಟು ಅಥವಾ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಮೂಡುವುದು ಸಹಜ; ಆದರೆ ನೀವು ನಂಬಿದ ಸ್ನೇಹಿತರಿಗೆ ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ದ್ರೋಹ ಬಗೆಯುವುದಿಲ್ಲ.`
    : `ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವಲಯದಲ್ಲಿ ನೀವು ಎಲ್ಲರೊಂದಿಗೂ ಬೆರೆಯುವ ಬದಲು ಕೆಲವೇ ಆಪ್ತ ಹಾಗೂ ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಕ್ತಿಗಳನ್ನು ಮಾತ್ರ ಹತ್ತಿರ ಸೇರಿಸುತ್ತೀರಿ. ಕುಟುಂಬದ ಸದಸ್ಯರಿಗೆ ಸದಾ ರಕ್ಷಾ ಕವಚವಾಗಿ ನಿಲ್ಲುವ ನೀವು, ನಿಮ್ಮ ಮನೆಯ ಆಂತರಿಕ ಸ್ವಾತಂತ್ರ್ಯದಲ್ಲಿ ಹೊರಗಿನವರ ಹಸ್ತಕ್ಷೇಪವನ್ನು ಎಂದಿಗೂ ಸಹಿಸುವುದಿಲ್ಲ.`;

  const p3ReadingEn = age < 23
    ? `Influenced by your 3rd and 11th houses, you naturally gravitate towards peer circles and outdoor activities rather than remaining confined at home. When family members question your schedule, friction or defensive reactions may arise, yet your loyalty to trusted peers is absolute.`
    : `You maintain a selective, trusted social circle rather than superficial networking. Fiercely protective of household autonomy, you never tolerate third-party interference in personal family matters.`;

  // 4. Inner Mind & Emotional Temperament
  const p4ReadingKn = isMoonTrika
    ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನು ${moonHouse}ನೇ ತ್ರಿಕ ಸ್ಥಾನದಲ್ಲಿ (${moonSignKn} ರಾಶಿಯಲ್ಲಿ) ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ, ನಿಮ್ಮ ಅಂತರಂಗವು ಅತ್ಯಂತ ಭಾವನಾತ್ಮಕ ಹಾಗೂ ಸೂಕ್ಷ್ಮವಾಗಿದೆ. ಹೊರಗೆ ಗಂಭೀರವಾಗಿ ಮತ್ತು ಧೈರ್ಯಶಾಲಿಯಾಗಿ ಕಂಡರೂ, ಒಳಗೆ ಯಾರಾದರೂ ಆಡಿದ ಅನ್ಯಾಯದ ಮಾತುಗಳು ನಿಮ್ಮನ್ನು ದೀರ್ಘಕಾಲ ಕಾಡುತ್ತವೆ. ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಮುಕ್ತವಾಗಿ ಹೇಳಿಕೊಳ್ಳದೆ ಒಳಗೆ ಅದುಮಿಟ್ಟುಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಮಾನಸಿಕ ಶಾಂತಿಯನ್ನು ಬಾಧಿಸುತ್ತದೆ. ಶಿವಾರಾಧನೆಯು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ದೈವಿಕ ಸ್ಥಿರತೆ ನೀಡುತ್ತದೆ.`
    : isVishaYoga || isGrahanaYoga
    ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನ ಮೇಲೆ ${isVishaYoga ? "ಶನಿಯ (ವಿಷ ಯೋಗ)" : "ರಾಹುವಿನ (ಗ್ರಹಣ ಯೋಗ)"} ಸೂಕ್ಷ್ಮ ಛಾಯಾ ಪ್ರಭಾವ ಇರುವುದರಿಂದ, ಜವಾಬ್ದಾರಿಗಳ ಹೊರೆ ಅಥವಾ ಅತಿಯಾದ ಆಲೋಚನೆಗಳು (Overthinking) ಆಗಾಗ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಅಶಾಂತಿಗೊಳಿಸುತ್ತವೆ. ನಿಸ್ವಾರ್ಥ ತ್ಯಾಗಕ್ಕೆ ಇತರರಿಂದ ಕೃತಜ್ಞತೆ ಸಿಗದಿದ್ದಾಗ ಮನಸ್ಸು ಕೊರಗುತ್ತದೆ. ನಿತ್ಯ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪವು ನಿಮ್ಮ ಆಲೋಚನೆಗಳಿಗೆ ಶಾಂತಿ ತರುತ್ತದೆ.`
    : `ನಿಮ್ಮ ಮನಃಕಾರಕ ಚಂದ್ರನು ${moonSignKn} ರಾಶಿಯ ${moonNakKn} ನಕ್ಷತ್ರದಲ್ಲಿ ಸ್ಥಿರವಾಗಿದ್ದಾನೆ. ಕಷ್ಟದ ಸಮಯದಲ್ಲೂ ಸಂಯಮ ಕಳೆದುಕೊಳ್ಳದೆ ವಿವೇಚನೆಯಿಂದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಪ್ರಬುದ್ಧತೆ ನಿಮ್ಮಲ್ಲಿದೆ. ಏಕಾಂತದಲ್ಲಿ ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಮರುಪರಿಶೀಲಿಸಿ ಹೊಸ ಚೈತನ್ಯ ಪಡೆಯುವ ಅದ್ಭುತ ಸಾಮರ್ಥ್ಯ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿದೆ.`;

  const p4ReadingEn = isMoonTrika || isVishaYoga || isGrahanaYoga
    ? `With the Moon positioned in House ${moonHouse} (${moonSignEn}) under ${isVishaYoga ? "Saturnine" : isGrahanaYoga ? "Rahu shadow" : "Trika"} influence, you process emotions deeply and introspectively. You rarely voice grievances, internalizing emotional burdens. Regular contemplative practices and sacred Shiva worship grant profound mental clarity and emotional resilience.`
    : `Your Moon in ${moonSignEn} (${moonNakEn}) gives an inherently steady, dignified emotional core capable of maintaining composure under duress.`;

  // 5. Career, Karma & Leadership
  const p5ReadingKn = `ನಿಮ್ಮ 10ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಅಧಿಪತಿ ${tenthLordKn} ಗ್ರಹವಾಗಿದ್ದು, ${h10PlanetsKn} ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ. ನೀವು ಯಾವುದೇ ಉದ್ಯೋಗ ಅಥವಾ ವ್ಯಾಪಾರದಲ್ಲಿದ್ದರೂ ಸ್ವತಂತ್ರ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಅಧಿಕಾರವಿರಬೇಕು; ಯಾರಾದರೂ ನಿರಂತರವಾಗಿ ನಿರ್ದೇಶಿಸುವುದು ಅಥವಾ ಕಟ್ಟುಪಾಡು ವಿಧಿಸುವುದನ್ನು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನ ಸಹಿಸುವುದಿಲ್ಲ. ನಿಮ್ಮ ನಿಷ್ಠೆ ಮತ್ತು ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಆರಂಭದಲ್ಲಿ ಸ್ವಲ್ಪ ವಿಳಂಬವಾದರೂ, ನಿಮ್ಮ ನೈಜ ಸಾಮರ್ಥ್ಯವು ನಿಮ್ಮನ್ನು ಉನ್ನತ ನಾಯಕತ್ವದ ಸ್ಥಾನಕ್ಕೆ ಕೊಂಡೊಯ್ಯುತ್ತದೆ.`;

  const p5ReadingEn = `Governed by 10th lord ${tenthLord} with ${h10PlanetsKn} influence, you thrive where you command operational freedom. You despise micromanagement. Though recognition may occasionally be delayed, your unwavering consistency guarantees eventual leadership and distinction.`;

  // 6. Wealth & Finances
  const p6ReadingKn = `ನಿಮ್ಮ 2ನೇ ಧನ ಸ್ಥಾನದ ಅಧಿಪತಿ ${secondLordKn} ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಅಧಿಪತಿ ${eleventhLordKn} ಆಗಿದ್ದಾರೆ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಧನಾಗಮನದ ಶಕ್ತಿ ದೃಢವಾಗಿದೆ; ಆದಾಗ್ಯೂ ಕೈಗೆ ಬಂದ ಹಣವು ಅನಿರೀಕ್ಷಿತ ಕೌಟುಂಬಿಕ ಅಗತ್ಯಗಳು, ವಾಹನ ಅಥವಾ ಆಪ್ತರ ಸಹಾಯಕ್ಕಾಗಿ ನೀರಿನಂತೆ ಖರ್ಚಾಗುವ (ಧನ ಸೋರಿಕೆ) ಪ್ರವೃತ್ತಿ ಇದೆ. ನಗದನ್ನು ಹಾಗೆಯೇ ಇಟ್ಟುಕೊಳ್ಳುವ ಬದಲು ಸ್ಥಿರ ಆಸ್ತಿ, ಬಂಗಾರ ಅಥವಾ ದೀರ್ಘಕಾಲಿಕ ಹೂಡಿಕೆಯಲ್ಲಿ ಪರಿವರ್ತಿಸುವುದರಿಂದ ನಿಮ್ಮ ಧನಕೋಶವು ಸದಾ ತುಂಬಿರುತ್ತದೆ.`;

  const p6ReadingEn = `With 2nd lord ${secondLord} and 11th lord ${eleventhLord}, your earning capability is strong, but capital tends to disperse into unexpected expenditures or generous support for others. Channeling liquidity into tangible real estate or gold safeguards long-term prosperity.`;

  // 7. Marriage, Relationship & Children (Dosha Specifics)
  let doshaTitleKn = "ಸಾಮರಸ್ಯದ ದಾಂಪತ್ಯ ಯೋಗ";
  let doshaTitleEn = "Marital Harmony & Lineage Synergy";
  let doshaDescKn = `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ${seventhLordKn} ಗ್ರಹದ ಶುಭ ಸ್ಥಿತಿಯಿದೆ. ಜೀವನ ಸಂಗಾತಿಯು ಸಂಸ್ಕಾರಯುತ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ವ್ಯಕ್ತಿಯಾಗಿರುತ್ತಾರೆ.`;
  let doshaDescEn = `Benefic 7th house influences support an alliance with a dignified, cultured life partner.`;
  let specificDosha: MasterLifeBulletPoint["doshaSpecifics"] = {
    hasDosha: false,
    doshaNameKn: "ಯಾವುದೇ ಗಂಭೀರ ಕಳತ್ರ ದೋಷವಿಲ್ಲ",
    doshaNameEn: "No Severe Kalatra Dosha",
    rootCauseHouseKn: "7ನೇ ಭಾವವು ಶುಭ ದೃಷ್ಟಿಯಲ್ಲಿದೆ",
    rootCauseHouseEn: "7th house is well-aspected",
    afflictedPlanetKn: "ಶುಭ ಗ್ರಹ ಬಲ",
    afflictedPlanetEn: "Benefic Planetary Strength",
    mantraKn: "ಓಂ ನಮೋ ನಾರಾಯಣಾಯ",
    mantraEn: "Om Namo Narayanaya",
    pujaKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಿಲ್ವಾರ್ಚನೆ",
    pujaEn: "Bilvarchana at Gokarna Mahabaleshwara Kshetra"
  };

  if (isKujaDosha) {
    doshaTitleKn = "ಕುಜ ದೋಷ & ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ಪರಿಹಾರ";
    doshaTitleEn = "Kuja (Manglik) Dosha & Alliance Resolution";
    doshaDescKn = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕುಜ ಗ್ರಹವು ${marsHouse}ನೇ ಭಾವದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ ಕುಜ (ಮಂಗಳ) ದೋಷ ಉಂಟಾಗಿದೆ. ಇದು ವಿವಾಹ ಮಾತುಕತೆಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ, ಸಂಗಾತಿಯೊಂದಿಗೆ ಅಹಂಕಾರದ ಸಣ್ಣಪುಟ್ಟ ಘರ್ಷಣೆಗಳು ಅಥವಾ ಹೊಂದಾಣಿಕೆಯ ಪರೀಕ್ಷೆಯನ್ನು ತರಬಹುದು. ಶಾಸ್ತ್ರೋಕ್ತ ಕುಜ ಶಾಂತಿಯು ದಾಂಪತ್ಯದಲ್ಲಿ ಅಖಂಡ ಸುಖ ನೀಡುತ್ತದೆ.`;
    doshaDescEn = `Mars is posited in House ${marsHouse}, forming Kuja Dosha. This indicates tests of patience in alliance finalization or ego friction if unaddressed. Authentic propitiation completely neutralizes this influence.`;
    specificDosha = {
      hasDosha: true,
      doshaNameKn: `ಕುಜ ದೋಷ (${marsHouse}ನೇ ಮನೆ)`,
      doshaNameEn: `Kuja Dosha (House ${marsHouse})`,
      rootCauseHouseKn: `${marsHouse}ನೇ ಭಾವದಲ್ಲಿ ಕುಜ ಸ್ಥಿತಿ`,
      rootCauseHouseEn: `Mars situated in House ${marsHouse}`,
      afflictedPlanetKn: "ಕುಜ (ಮಂಗಳ)",
      afflictedPlanetEn: "Mars (Kuja)",
      mantraKn: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ",
      mantraEn: "Om Kraam Kreem Kroum Sah Bhaumaya Namah",
      pujaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಕುಜ ಶಾಂತಿ ಪೂಜೆ",
      pujaEn: "Subrahmanya Kuja Shanti Puja at Gokarna Kshetra"
    };
  } else if (hasShaniDelay) {
    doshaTitleKn = "ಶನಿ ದೃಷ್ಟಿ & ಕಲ್ಯಾಣ ಕಾಲಾವಧಿ";
    doshaTitleEn = "Saturnine Aspect & Marriage Alliance Timing";
    doshaDescKn = `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿ ಗ್ರಹದ ${isSaturnIn7th ? "ಸ್ಥಿತಿ" : "ದೃಷ್ಟಿ"} ಇರುವುದರಿಂದ ವಿವಾಹ ಯೋಗದಲ್ಲಿ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆ ಉಂಟಾಗುತ್ತಿದೆ. ಶನಿಯು ಪಕ್ವ ವಯಸ್ಸಿನಲ್ಲಿ ಅತ್ಯಂತ ಸ್ಥಿರ, ಗಂಭೀರ ಹಾಗೂ ನಂಬಿಕಸ್ಥ ಸಂಗಾತಿಯನ್ನು ಕರುಣಿಸಲಿದ್ದಾನೆ.`;
    doshaDescEn = `Saturn's ${isSaturnIn7th ? "presence" : "aspect"} on the 7th house delays alliance finalization until maturity, ensuring a deeply enduring and responsible union.`;
    specificDosha = {
      hasDosha: true,
      doshaNameKn: "ಶನಿ ದೃಷ್ಟಿ ವಿಳಂಬ ಯೋಗ",
      doshaNameEn: "Saturnine Delay Influence",
      rootCauseHouseKn: "7ನೇ ಭಾವದ ಮೇಲೆ ಶನಿ ಗ್ರಹದ ಪ್ರಭಾವ",
      rootCauseHouseEn: "Saturn aspecting/occupying 7th house",
      afflictedPlanetKn: "ಶನಿ",
      afflictedPlanetEn: "Saturn",
      mantraKn: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ",
      mantraEn: "Om Praam Preem Proum Sah Shanaishcharaya Namah",
      pujaKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ತೈಲಾಭಿಷೇಕ ಮತ್ತು ರುದ್ರಾಭಿಷೇಕ",
      pujaEn: "Tailabhisheka & Rudrabhisheka at Gokarna Mahabaleshwara"
    };
  } else if (hasSarpaDosha7th || hasSarpaDosha5th) {
    doshaTitleKn = "ಸರ್ಪ / ನಾಗ ದೋಷ & ಕಲ್ಯಾಣ-ಸಂತಾನ ಶಮನ";
    doshaTitleEn = "Naga / Sarpa Dosha & Progeny Harmony";
    doshaDescKn = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ರಾಹು/ಕೇತುಗಳು ${hasSarpaDosha7th ? "7ನೇ (ವಿವಾಹ)" : "5ನೇ (ಸಂತಾನ)"} ಭಾವದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದರಿಂದ ಸರ್ಪ ದೋಷದ ಪ್ರಭಾವವಿದೆ. ಇದು ಮಾತುಕತೆಯ ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಸಂಬಂಧ ತಪ್ಪಿಹೋಗುವುದು ಅಥವಾ ಸಂತಾನ ವಿಚಾರದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ವಿಳಂಬವನ್ನು ಉಂಟುಮಾಡಬಹುದು. ಗೋಕರ್ಣ ಸರ್ಪಶಾಂತಿಯಿಂದ ಈ ವಿಘ್ನ ಪರಿಹಾರವಾಗುತ್ತದೆ.`;
    doshaDescEn = `Rahu/Ketu occupying House ${hasSarpaDosha7th ? 7 : 5} forms Sarpa Dosha, creating obstacles at closing stages of alliances or progeny delays. Dedicated Gokarna Naga Shanti dissolves this knot completely.`;
    specificDosha = {
      hasDosha: true,
      doshaNameKn: `ಸರ್ಪ ದೋಷ (${hasSarpaDosha7th ? "7ನೇ ಕಳತ್ರ" : "5ನೇ ಸಂತಾನ"} ಭಾವ)`,
      doshaNameEn: `Sarpa Dosha (House ${hasSarpaDosha7th ? 7 : 5})`,
      rootCauseHouseKn: `${hasSarpaDosha7th ? "7ನೇ" : "5ನೇ"} ಮನೆಯಲ್ಲಿ ರಾಹು/ಕೇತು ಸ್ಥಿತಿ`,
      rootCauseHouseEn: `Rahu/Ketu situated in House ${hasSarpaDosha7th ? 7 : 5}`,
      afflictedPlanetKn: "ರಾಹು-ಕೇತು",
      afflictedPlanetEn: "Rahu-Ketu",
      mantraKn: "ಓಂ ನಮಃ ಶಿವಾಯ & ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ",
      mantraEn: "Om Namah Shivaya & Om Bhraam Bhreem Bhroum Sah Rahave Namah",
      pujaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಾಗಬಲಿ / ಸರ್ಪ ಸಂಸ್ಕಾರ ಸೇವೆ",
      pujaEn: "Nagabali & Sarpa Samskara Seva at Gokarna Kshetra"
    };
  } else if (is5thAfflicted) {
    doshaTitleKn = "ಸಂತಾನ ಪ್ರತಿಬಂಧಕ & ಪುತ್ರಕಾರಕ ಪರಿಹಾರ";
    doshaTitleEn = "Progeny Harmonization & Putrakaraka Remedy";
    doshaDescKn = `5ನೇ ಭಾವದಲ್ಲಿ ${h5PlanetsKn} ಇರುವ ಕಾರಣ ಅಥವಾ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸಂಚಾರದಿಂದ ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ವಿಳಂಬ ಕಾಣಿಸುತ್ತಿದೆ. ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪ ಮತ್ತು ಗೋಕರ್ಣ ಸೇವೆಗಳಿಂದ ಶೀಘ್ರ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
    doshaDescEn = `Affliction to the 5th house or Putrakaraka Jupiter introduces temporary delay in childbirth. Chanting the Santana Gopala Mantra delivers divine fruition.`;
    specificDosha = {
      hasDosha: true,
      doshaNameKn: "ಸಂತಾನ ಪ್ರತಿಬಂಧಕ ಯೋಗ",
      doshaNameEn: "Progeny Delay Influence",
      rootCauseHouseKn: "5ನೇ ಭಾವದ ಮೇಲೆ ಪಾಪಗ್ರಹ ಪ್ರಭಾವ",
      rootCauseHouseEn: "5th House / Putrakaraka Affliction",
      afflictedPlanetKn: fifthLordKn,
      afflictedPlanetEn: fifthLord,
      mantraKn: "ಓಂ ಕ್ಲೀಂ ದೇವಕೀಸುತ ಗೋವಿಂದ ವಾಸುದೇವ ಜಗತ್ಪತೇ ದೇಹಿ ಮೇ ತನಯಂ ಕೃಷ್ಣ ತ್ವಾಮಹಂ ಶರಣಂ ಗತಃ",
      mantraEn: "Om Kleem Devakisuta Govinda Vasudeva Jagatpate Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah",
      pujaKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂತಾನ ಗೋಪಾಲ ಸೇವೆ",
      pujaEn: "Santana Gopala Seva at Gokarna Mahabaleshwara"
    };
  }

  // 8. Health & Physical Vitality
  const p8ReadingKn = `ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಮತ್ತು 6ನೇ ರೋಗ ಸ್ಥಾನದ ${sixthLordKn} ಗ್ರಹಬಲದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಮೂಲ ಪ್ರಕೃತಿಯು ಪಿತ್ತ ಮತ್ತು ವಾತ ತತ್ವಗಳ ಮಿಶ್ರಣವಾಗಿದೆ. ತಲೆಬಿಸಿ, ಜೀರ್ಣಾಂಗ ಅಗ್ನಿಮಾಂದ್ಯತೆ, ಆಮ್ಲಪಿತ್ತ ಅಥವಾ ನಿಶ್ಯಕ್ತಿ ಆಗಾಗ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ದಿನನಿತ್ಯ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯುವುದು, ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಸಾತ್ವಿಕ ಊಟ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ದೇಹಬಲವು ಸದಾ ಉಲ್ಲಾಸಭರಿತವಾಗಿರುತ್ತದೆ.`;

  const p8ReadingEn = `Governed by Lagna lord ${lagnaLord} and 6th lord ${sixthLord}, your constitutional balance is predominantly Pitta-Vata. Maintaining disciplined digestive fire (Jatharagni), morning hydration, and walking ensures radiant vitality.`;

  // 9. Active Dasha-Bhukti & Gochara
  const p9ReadingKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(maha)} ಮಹಾದಶೆಯ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯ ಕಾಲಾವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ಮಹತ್ವದ ಪರಿವರ್ತನಾ ಹಂತವಾಗಿದೆ. ಗೋಚಾರ ಗುರುವು ಭಾಗ್ಯ ಮತ್ತು ರಕ್ಷಣೆಯನ್ನು ನೀಡುತ್ತಿದ್ದರೆ, ಶನಿಯು ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ. ಈ ಗ್ರಹ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಹಳೆಯ ಸಂಕೋಲೆಗಳನ್ನು ಕಳಚಿ ಹೊಸ ಶಕ್ತಿಯನ್ನು ತುಂಬುವ ಪವಿತ್ರ ಸಂಧಿಕಾಲವಾಗಿದೆ.`;

  const p9ReadingEn = `The ongoing ${maha} Mahadasha with ${bhukti} Antardasha represents a pivotal transformative threshold. With transiting Jupiter offering divine guidance while Saturn demands steadfast discipline, this phase clears karmic backlogs to usher in newfound strength.`;

  // 10. Turning Point Timeline & Authentic Vedic Remedies
  const p10ReadingKn = `ನಿಮ್ಮ ಜಾತಕ ಗಣಿತದ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 3 to 6 Months) ಬೃಹತ್ ಸಕಾರಾತ್ಮಕ ಗ್ರಹಗತಿಯ ತಿರುವು ನಿಖರವಾಗಿ ಘಟಿಸಲಿದೆ. ಈ ಶುಭ ಕಾಲದ ಸಿದ್ಧಿಗಾಗಿ, ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನಾಧಿಪತಿಯ ${gemName} (${gemCarat}) ರತ್ನವನ್ನು ${gemMetal}ದಲ್ಲಿ ಮಾಡಿಸಿ ${gemFinger}ದಲ್ಲಿ ಧರಿಸಿ. ಇದರೊಂದಿಗೆ ${rudraName} ಧಾರಣೆ ಮಾಡಿ ಹಾಗೂ ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಮ್ಮ ನಕ್ಷತ್ರದ ಹೆಸರಿನಲ್ಲಿ ದೋಷ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ. ಈ ದೈವಿಕ ಜಪ ಮತ್ತು ಪೂಜೆಯು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ಪರಮ ಶಾಂತಿ ಹಾಗೂ ಪ್ರಗತಿಯನ್ನು ತರಲಿದೆ.`;

  const p10ReadingEn = `Mathematical calculations project a major positive astrological turning point over the Next 3 to 6 Months. To accelerate this breakthrough, wear an energized ${gemEn} (${gemCarat}) in ${prescriptions?.gemstoneRing?.metalEn || "Gold"} on the ${prescriptions?.gemstoneRing?.fingerEn || "Ring finger"} and adorn ${rudraEn}. Performing a sacred Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara dissolves obstacles and brings deep serenity and progress.`;

  return [
    {
      id: 1,
      category: "personality",
      titleKn: "ವ್ಯಕ್ತಿತ್ವ, ಆತ್ಮಗೌರವ ಮತ್ತು ಸ್ವಾಭಿಮಾನ",
      titleEn: "Personality, Dignity & Unyielding Ego",
      titleHi: "व्यक्तित्व, आत्मसम्मान और स्वभाव",
      titleTe: "వ్యక్తిత్వం, ఆత్మగౌరవం మరియు స్వభావం",
      titleTa: "ஆளுமை, சுயமரியாதை மற்றும் குணம்",
      badgeKn: `${lagnaKn} ಲಗ್ನ • ನವಾಂಶ ${d9LagnaKn}`,
      badgeEn: `${lagnaEn} Lagna • D9 ${d9LagnaEn}`,
      badgeHi: `${lagnaEn} लग्न`,
      badgeTe: `${lagnaEn} లగ్నం`,
      badgeTa: `${lagnaEn} லக்னம்`,
      icon: "👑",
      readingKn: p1ReadingKn,
      readingEn: p1ReadingEn,
      readingHi: p1ReadingEn,
      readingTe: p1ReadingEn,
      readingTa: p1ReadingEn,
      astrologicalBasisKn: `${lagnaKn} ಲಗ್ನದ ಅಧಿಪತಿ ${lagnaLordKn} ಮತ್ತು ನವಾಂಶ (${d9LagnaKn}) ಗ್ರಹ ಸ್ಥಿತಿ.`,
      astrologicalBasisEn: `Ascendant lord ${lagnaLord} and Navamsha (${d9LagnaEn}) planetary disposition.`
    },
    {
      id: 2,
      category: "education",
      titleKn: "ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಗ್ರಹಿಕೆ ಶೈಲಿ",
      titleEn: "Intellect, Learning Style & Focus",
      titleHi: "शिक्षा, बुद्धिमत्ता और अध्ययन",
      titleTe: "విద్య, మేధస్సు మరియు గ్రహణ శక్తి",
      titleTa: "கல்வி, புத்திசாலித்தனம் மற்றும் கற்றல்",
      badgeKn: `5ನೇ ಭಾವ • ${h5PlanetsKn}`,
      badgeEn: `5th House • ${fifthLord}`,
      badgeHi: "पंचम भाव",
      badgeTe: "5వ స్థానం",
      badgeTa: "5ஆம் இடம்",
      icon: "📚",
      readingKn: p2ReadingKn,
      readingEn: p2ReadingEn,
      readingHi: p2ReadingEn,
      readingTe: p2ReadingEn,
      readingTa: p2ReadingEn,
      astrologicalBasisKn: `5ನೇ ಭಾವ (ಬುದ್ಧಿ/ವಿದ್ಯಾ ಸ್ಥಾನ) ${fifthLordKn} ಅಧಿಪತ್ಯ ಮತ್ತು ಬುಧ-ಗುರು ಕಾರಕತ್ವ.`,
      astrologicalBasisEn: `5th house of intellect ruled by ${fifthLord} with Mercury-Jupiter significations.`
    },
    {
      id: 3,
      category: "social",
      titleKn: "ಸಾಮಾಜಿಕ ಒಡನಾಟ ಮತ್ತು ಕುಟುಂಬ ಸಂಬಂಧಗಳು",
      titleEn: "Social Circle & Family Dynamics",
      titleHi: "सामाजिक दायरा और पारिवारिक संबंध",
      titleTe: "సామాజిక వర్గం మరియు కుటుంబ సంబంధాలు",
      titleTa: "சமூக வட்டம் மற்றும் குடும்ப உறவுகள்",
      badgeKn: "3ನೇ & 11ನೇ ಭಾವ",
      badgeEn: "3rd & 11th Houses",
      badgeHi: "तृतीय एवं एकादश भाव",
      badgeTe: "3వ & 11వ స్థానాలు",
      badgeTa: "3 & 11ஆம் இடங்கள்",
      icon: "🤝",
      readingKn: p3ReadingKn,
      readingEn: p3ReadingEn,
      readingHi: p3ReadingEn,
      readingTe: p3ReadingEn,
      readingTa: p3ReadingEn,
      astrologicalBasisKn: `3ನೇ ಸಹೋದರ/ಮಿತ್ರ ಸ್ಥಾನ ಹಾಗೂ 11ನೇ ಲಾಭ/ಸಾಮಾಜಿಕ ವಲಯದ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      astrologicalBasisEn: `3rd house of peers and 11th house of social alliances disposition.`
    },
    {
      id: 4,
      category: "mind",
      titleKn: "ಅಂತರಂಗದ ಮನಸ್ಸು ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸ್ಥಿತಿ",
      titleEn: "Subconscious Mind & Inner Peace",
      titleHi: "आंतरिक मन और मानसिक शांति",
      titleTe: "అంతరంగ మనస్సు మరియు మానసిక శాంతి",
      titleTa: "உள்ளுணர்வு மற்றும் மன அமைதி",
      badgeKn: `${moonSignKn} ರಾಶಿ • ${moonNakKn}`,
      badgeEn: `${moonSignEn} Moon • ${moonNakEn}`,
      badgeHi: `${moonSignEn} राशि`,
      badgeTe: `${moonSignEn} రాశి`,
      badgeTa: `${moonSignEn} ராசி`,
      icon: "🧠",
      readingKn: p4ReadingKn,
      readingEn: p4ReadingEn,
      readingHi: p4ReadingEn,
      readingTe: p4ReadingEn,
      readingTa: p4ReadingEn,
      astrologicalBasisKn: `ಮನಃಕಾರಕ ಚಂದ್ರನ ${moonHouse}ನೇ ಸ್ಥಾನ, ${moonNakKn} ನಕ್ಷತ್ರ ಮತ್ತು 4ನೇ ಸುಖ ಭಾವ.`,
      astrologicalBasisEn: `Moon in House ${moonHouse} (${moonNakEn}) and 4th house of mental serenity.`
    },
    {
      id: 5,
      category: "career",
      titleKn: "ಕರ್ಮ, ವೃತ್ತಿ ಮತ್ತು ನಾಯಕತ್ವ ಶೈಲಿ",
      titleEn: "Career, Karma & Leadership Mastery",
      titleHi: "कर्म, करियर और नेतृत्व शैली",
      titleTe: "కర్మ, వృత్తి మరియు నాయకత్వ శైలి",
      titleTa: "தொழில், கர்மம் மற்றும் தலைமைத்துவம்",
      badgeKn: `10ನೇ ಭಾವ • ${tenthLordKn}`,
      badgeEn: `10th House • ${tenthLord}`,
      badgeHi: "दशम भाव",
      badgeTe: "10వ స్థానం",
      badgeTa: "10ஆம் இடம்",
      icon: "💼",
      readingKn: p5ReadingKn,
      readingEn: p5ReadingEn,
      readingHi: p5ReadingEn,
      readingTe: p5ReadingEn,
      readingTa: p5ReadingEn,
      astrologicalBasisKn: `10ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಅಧಿಪತಿ ${tenthLordKn} ಹಾಗೂ ರವಿ-ಶನಿ ಗ್ರಹಗಳ ಬಲ.`,
      astrologicalBasisEn: `10th house of profession ruled by ${tenthLord} and Sun-Saturn disposition.`
    },
    {
      id: 6,
      category: "wealth",
      titleKn: "ಧನ, ಆರ್ಥಿಕತೆ ಮತ್ತು ಉಳಿತಾಯ ಪ್ರವೃತ್ತಿ",
      titleEn: "Wealth, Finances & Capital Inflow",
      titleHi: "धन, वित्त और संचय प्रवृत्ति",
      titleTe: "ధనం, ఆర్థిక స్థితి మరియు పొదుపు",
      titleTa: "செல்வம், நிதி மற்றும் சேமிப்பு",
      badgeKn: `2ನೇ ಧನ & 11ನೇ ಲಾಭ`,
      badgeEn: `2nd & 11th Houses`,
      badgeHi: "धन एवं लाभ भाव",
      badgeTe: "2వ & 11వ స్థానాలు",
      badgeTa: "2 & 11ஆம் இடங்கள்",
      icon: "💰",
      readingKn: p6ReadingKn,
      readingEn: p6ReadingEn,
      readingHi: p6ReadingEn,
      readingTe: p6ReadingEn,
      readingTa: p6ReadingEn,
      astrologicalBasisKn: `2ನೇ ಧನಕೋಶದ ಅಧಿಪತಿ ${secondLordKn} ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ${eleventhLordKn} ಸ್ಥಿತಿ.`,
      astrologicalBasisEn: `2nd house of treasury (${secondLord}) and 11th house of gains (${eleventhLord}).`
    },
    {
      id: 7,
      category: "marriage",
      titleKn: doshaTitleKn,
      titleEn: doshaTitleEn,
      titleHi: "विवाह, दांपत्य और संतान योग",
      titleTe: "వివాహం, దాంపత్యం మరియు సంతాన యోగం",
      titleTa: "திருமணம் மற்றும் குழந்தை பேறு",
      badgeKn: `7ನೇ ಕಳತ್ರ • ${seventhLordKn}`,
      badgeEn: `7th House • ${seventhLord}`,
      badgeHi: "सप्तम भाव",
      badgeTe: "7వ స్థానం",
      badgeTa: "7ஆம் இடம்",
      icon: "💍",
      readingKn: doshaDescKn,
      readingEn: doshaDescEn,
      readingHi: doshaDescEn,
      readingTe: doshaDescEn,
      readingTa: doshaDescEn,
      astrologicalBasisKn: `7ನೇ ಭಾವ (ಕಳತ್ರ ಸ್ಥಾನ ${seventhLordKn}) ಮತ್ತು 5ನೇ ಭಾವ (ಸಂತಾನ ಸ್ಥಾನ ${fifthLordKn}).`,
      astrologicalBasisEn: `7th house of marriage (${seventhLord}) and 5th house of progeny (${fifthLord}).`,
      doshaSpecifics: specificDosha
    },
    {
      id: 8,
      category: "health",
      titleKn: "ಆರೋಗ್ಯ, ಶಾರೀರಿಕ ಬಲ ಮತ್ತು ದಿನಚರಿ",
      titleEn: "Health, Vitality & Daily Wellness",
      titleHi: "स्वास्थ्य, शारीरिक बल और दिनचर्या",
      titleTe: "ఆరోగ్యం, శారీరక బలం మరియు దినచర్య",
      titleTa: "ஆரோக்கியம் மற்றும் உடல் பலம்",
      badgeKn: `ಲಗ್ನ & 6ನೇ ಭಾವ`,
      badgeEn: `Lagna & 6th House`,
      badgeHi: "लग्न एवं षष्ठ भाव",
      badgeTe: "లగ్నం & 6వ స్థానం",
      badgeTa: "லக்னம் & 6ஆம் இடம்",
      icon: "🌿",
      readingKn: p8ReadingKn,
      readingEn: p8ReadingEn,
      readingHi: p8ReadingEn,
      readingTe: p8ReadingEn,
      readingTa: p8ReadingEn,
      astrologicalBasisKn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಮತ್ತು 6ನೇ ರೋಗ ಸ್ಥಾನದ ಅಧಿಪತಿ ${sixthLordKn} ಬಲ.`,
      astrologicalBasisEn: `Ascendant lord ${lagnaLord} and 6th lord ${sixthLord} vital constitution.`
    },
    {
      id: 9,
      category: "dasha_gochara",
      titleKn: "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಮತ್ತು ಗೋಚಾರ ವಾಸ್ತವ",
      titleEn: "Current Dasha-Bhukti & Planetary Transits",
      titleHi: "वर्तमान दशा-भुक्ति और गोचर प्रभाव",
      titleTe: "ప్రస్తుత దశా-భుక్తి మరియు గోచారం",
      titleTa: "தற்போதைய தசா-புக்தி மற்றும் கோச்சாரம்",
      badgeKn: `${toKannadaPlanet(maha)} ದಶಾ • ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿ`,
      badgeEn: `${maha} Maha • ${bhukti} Bhukti`,
      badgeHi: `${maha} महादशा`,
      badgeTe: `${maha} మహార్దశ`,
      badgeTa: `${maha} மகாதசை`,
      icon: "🪐",
      readingKn: p9ReadingKn,
      readingEn: p9ReadingEn,
      readingHi: p9ReadingEn,
      readingTe: p9ReadingEn,
      readingTa: p9ReadingEn,
      astrologicalBasisKn: `ಮಹಾದಶಾ: ${toKannadaPlanet(maha)} | ಭುಕ್ತಿ: ${toKannadaPlanet(bhukti)} | ಗುರು-ಶನಿ ಗೋಚಾರ.`,
      astrologicalBasisEn: `Running Mahadasha: ${maha} | Antardasha: ${bhukti} | Jupiter-Saturn Gochara.`
    },
    {
      id: 10,
      category: "remedy",
      titleKn: "ಮುಖ್ಯ ತಿರುವು ಕಾಲಾವಧಿ, ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಗೋಕರ್ಣ ಪೂಜೆ",
      titleEn: "Turning Point Timeline & Authentic Vedic Remedies",
      titleHi: "परिवर्तन काल, रत्न, रुद्राक्ष और गोकर्ण पूजा",
      titleTe: "మలుపు కాలం, రత్నం, రుద్రాక్ష & గోకర్ణ పూజ",
      titleTa: "திருப்பம் தரும் காலம், ரத்தினம், ருத்ராட்சம் & பூஜை",
      badgeKn: `ಮುಂದಿನ 3-6 ತಿಂಗಳುಗಳು • ಗೋಕರ್ಣ ಸೇವೆ`,
      badgeEn: `Next 3 to 6 Months • Gokarna Seva`,
      badgeHi: "आगामी 3 से 6 माह",
      badgeTe: "వచ్చే 3 నుండి 6 నెలలు",
      badgeTa: "அடுத்த 3-6 மாதங்கள்",
      icon: "🪔",
      readingKn: p10ReadingKn,
      readingEn: p10ReadingEn,
      readingHi: p10ReadingEn,
      readingTe: p10ReadingEn,
      readingTa: p10ReadingEn,
      astrologicalBasisKn: `ಪಂಚಾಂಗ ಪಂಚ ಅಂಗಗಳ ಸಮನ್ವಯ, ${gemName} ರತ್ನ, ${rudraName} ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ.`,
      astrologicalBasisEn: `Panchanga 5-Angas synthesis, energized ${gemEn}, ${rudraEn}, and Sri Gokarna Mahabaleshwara blessings.`
    }
  ];
};

export const generateCurrentLifeDiagnosis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; gender?: string; devoteeName?: string },
  prescriptions?: AstrologicalPrescriptions
): CurrentLifeDiagnosis => {
  const ageDecimal = ageDecimalYearsAt(context.birthDate, context.birthTime, context.latitude, context.longitude, new Date());
  const devoteeAge = calculateDevoteeAge(context.birthDate);
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
    mentalDiagnosis = `ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನು ${moon.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ (ತ್ರಿಕ ಸ್ಥಾನ), ಮನಸ್ಸಿನಲ್ಲಿ ಸುಮ್ಮನೆ ಅಂಜಿಕೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಏರಿಳಿತಗಳು ಆಗಾಗ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು.`;
  } else if (moon && rahu && (moon.house === rahu.house || Math.abs(moon.house - rahu.house) === 6)) {
    mentalIssue = true;
    mentalSeverity = "High";
    mentalDiagnosis = "ಚಂದ್ರ-ರಾಹು ಸಂಯೋಗ/ದೃಷ್ಟಿಯ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಅತಿಯಾದ ಕಲ್ಪನೆಗಳು ಹಾಗೂ ಅಶಾಂತಿ ಉಂಟಾಗುತ್ತಿದೆ.";
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

  if (devoteeAge >= 24 && devoteeAge <= 58 && tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) {
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

  // 5. Astrologer Talking Points (Authentic, Zero Crisis Assumptions)
  const lagnaName = kundli.lagnaRashi.sanskrit;
  const lagnaEng = kundli.lagnaRashi.english;
  const moonRashiName = kundli.moonSign.sanskrit;
  const moonNakName = moon?.nakshatra.english ?? "Ashwini";

  const openingP1 = `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪ್ರವೇಶಿಸಿದ ತಕ್ಷಣ ನಿಮ್ಮ ${lagnaName} ಲಗ್ನ ಹಾಗೂ ${moonRashiName} ರಾಶಿಯ ${moonNakName} ನಕ್ಷತ್ರದ ಗ್ರಹ ಸಂಯೋಜನೆಯು ಎದ್ದು ಕಾಣುತ್ತದೆ. ನಿಮ್ಮ ಮೂಲ ಪ್ರಕೃತಿ ಅತ್ಯಂತ ಸ್ವಾಭಿಮಾನಿ, ನೇರ ನಿಷ್ಠುರ ಹಾಗೂ ಯಾರ ಮುಂದೆಯೂ ಅನಗತ್ಯವಾಗಿ ತಲೆಬಾಗದ ಪ್ರಾಮಾಣಿಕ ಗುಣವನ್ನು ಹೊಂದಿದೆ. ನೀವು ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ಸಾಮರ್ಥ್ಯದ ಮೇಲೆ ಮಾತ್ರ ಬಲವಾದ ನಂಬಿಕೆ ಇಟ್ಟವರು; ಯಾರಾದರೂ ಒತ್ತಾಯಪೂರ್ವಕವಾಗಿ ಆಜ್ಞೆ ಮಾಡಿದರೆ ನೀವು ಎಂದಿಗೂ ಸಹಿಸುವುದಿಲ್ಲ.`;
  const openingP2 = `ನಿಮ್ಮ ಈ ನೇರ ನಡವಳಿಕೆ ಮತ್ತು ಸ್ವಾಭಿಮಾನವೇ ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮನ್ನು ವಿಶಿಷ್ಟವಾಗಿ ಗುರುತಿಸುವಂತೆ ಮಾಡಿದೆ. ಪ್ರಸ್ತುತ ನೀವು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಕಾಲಘಟ್ಟದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿರುವ ನೈಜ ಗ್ರಹಬಲವನ್ನು ಸದುಪಯೋಗಪಡಿಸಿಕೊಂಡು, ಮುಂಬರುವ ಶುಭ ಕಾಲಕ್ಕೆ ಸಿದ್ಧರಾಗಲು ನೀವು ಇಂದು ಬಂದಿದ್ದೀರಿ.`;
  const openingIceBreakerKn = `${openingP1}\n\n${openingP2}`;

  const hiddenP1 = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮನಃಕಾರಕ ಚಂದ್ರನ ಸ್ಥಾನ (${moon?.house ?? 1}ನೇ ಭಾವ) ಹಾಗೂ 4ನೇ ಮನೆಯ (${fourthHouseDetail}) ಗ್ರಹ ಪ್ರಭಾವವನ್ನು ನೋಡಿದರೆ, ನೀವು ಹೊರಗೆ ಅತ್ಯಂತ ಧೈರ್ಯಶಾಲಿ ಮತ್ತು ಸ್ಥಿರ ಮನಸ್ಸಿನವರಂತೆ ಕಂಡರೂ, ಒಳಗೆ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಅತ್ಯಂತ ಆಳವಾಗಿರುತ್ತವೆ. ಎಲ್ಲರನ್ನೂ ಜೊತೆಯಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆಯಬೇಕೆಂಬ ನಿಮ್ಮ ಹಂಬಲಕ್ಕೆ ಇತರರಿಂದ ನಿರೀಕ್ಷಿತ ಸ್ಪಂದನೆ ಸಿಗದಿದ್ದಾಗ ಮನಸ್ಸಿನಲ್ಲಿ ಸಣ್ಣ ಬೇಸರ ಉಂಟಾಗುತ್ತದೆ.`;
  const hiddenP2 = mentalIssue
    ? `ಆದರೆ ನಿಮ್ಮೊಳಗಿನ ಈ ಭಾವನಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆಯನ್ನು ನೀವು ಹೊರಗೆ ವ್ಯಕ್ತಪಡಿಸದೆ ಮೌನವಾಗಿ ನುಂಗಿಕೊಳ್ಳುತ್ತೀರಿ. ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಮತ್ತು ನಿಯಮಿತ ಧ್ಯಾನವು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಅಖಂಡ ಶಾಂತಿ ಹಾಗೂ ಚೈತನ್ಯವನ್ನು ನೀಡಲಿದೆ.`
    : `ನಿಮ್ಮ ಮನಸ್ಸು ಪ್ರಬುದ್ಧವಾಗಿದ್ದು, ಕಷ್ಟದ ಸನ್ನಿವೇಶಗಳಲ್ಲೂ ತಾಳ್ಮೆಯಿಂದ ಹೊಸ ದಾರಿ ಕಂಡುಕೊಳ್ಳುವ ಸಹಜ ದೃಢತೆ ನಿಮ್ಮಲ್ಲಿದೆ.`;
  const hiddenSubconsciousWorryKn = `${hiddenP1}\n\n${hiddenP2}`;

  // Maandi Impact
  const mHouse = kundli.maandi ? (((kundli.maandi.rashi.index - kundli.lagnaRashi.index + 12) % 12) + 1) : 1;
  const mRashiKn = kundli.maandi ? toKannadaRashi(kundli.maandi.rashi.english) : lagnaName;
  const isUpachaya = [3, 6, 10, 11].includes(mHouse);

  const maandiP1 = isUpachaya
    ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅದೃಶ್ಯ ಛಾಯಾಗ್ರಹವಾದ ಮಾಂದಿಯು ${mHouse}ನೇ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ (${mRashiKn} ರಾಶಿಯಲ್ಲಿ) ಸ್ಥಿತನಾಗಿದ್ದಾನೆ. ಶಾಸ್ತ್ರದ ದೃಢ ನಿಯಮದ ಪ್ರಕಾರ, ಉಪಚಯದಲ್ಲಿರುವ ಮಾಂದಿಯು ಅಪಾರ ಶತ್ರು ಸಂಹಾರಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತಾನೆ ಮತ್ತು ಯಾವುದೇ ಕಠಿಣ ಪರಿಸ್ಥಿತಿ ಬಂದರೂ ನಿಮ್ಮನ್ನು ಮಣಿಯಲು ಬಿಡುವುದಿಲ್ಲ.`
    : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮಾಂದಿಯು ${mHouse}ನೇ ಭಾವದಲ್ಲಿ (${mRashiKn} ರಾಶಿಯಲ್ಲಿ) ಸ್ಥಿತನಾಗಿದ್ದಾನೆ. ಇದು ನಿಮ್ಮ ದೈನಂದಿನ ಕೆಲಸಗಳಲ್ಲಿ ಆರಂಭಿಕ ವಿಳಂಬ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಧನವ್ಯಯವನ್ನು ತರಬಹುದು. ಆದರೆ ದೈವಬಲದಿಂದ ಈ ಅಡೆತಡೆಗಳು ಸುಲಭವಾಗಿ ಪರಿಹಾರವಾಗಲಿವೆ.`;
  const maandiP2 = `ಮಾಂದಿ ಛಾಯಾ ಗ್ರಹದ ಶಾಂತಿಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ. ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ 'ಓಂ ಮಂದಪುತ್ರಾಯ ವಿದ್ಮಹೇ ಮೃತ್ಯುರೂಪಾಯ ಧೀಮಹಿ ತನ್ನೋ ಮಾಂದಿಃ ಪ್ರಚೋದಯಾತ್' ಮಂತ್ರವನ್ನು 11 ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ಛಾಯಾ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`;
  const maandiKarmicImpactKn = sanitizeAstrologyKannadaText(`${maandiP1}\n\n${maandiP2}`);

  const maandiKarmicImpactEn = `In your horoscope, subtle shadow planet Maandi is posited in House ${mHouse} (${kundli.maandi?.rashi.english || lagnaEng}). ${isUpachaya ? "Being in an Upachaya house, Maandi functions as an invincible shield against adversaries and grants massive breakthrough after initial tests." : "It indicates a karmic pressure point requiring energy balance and ancestral propitiation."}\n\nPerforming Maandi-Shani Shanti Sankalpa at sacred Gokarna Mahabaleshwara Kshetra provides complete protection.`;

  // Karma & Career
  const karmaP1 = `ಕರ್ಮ ಸ್ಥಾನವಾದ 10ನೇ ಮನೆ ಹಾಗೂ ಧನ ಸ್ಥಾನವಾದ 2ನೇ ಮತ್ತು 11ನೇ ಮನೆಗಳ ಗ್ರಹಬಲದ ಪ್ರಕಾರ, ನಿಮ್ಮ ವೃತ್ತಿ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೀವು ಶೇಕಡಾ 100 ರಷ್ಟು ಪರಿಶ್ರಮ ಹಾಕುತ್ತಿದ್ದೀರಿ. ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮುಂಬರುವ ಕಾಲದಲ್ಲಿ ಉನ್ನತ ಗೌರವ ಹಾಗೂ ಸ್ಥಿರತೆ ಸಿಗುವ ಯೋಗವಿದೆ.`;
  const karmaP2 = `ಕೈಗೆ ಬಂದ ಆದಾಯವು ಸದ್ವಿನಿಯೋಗವಾಗುವಂತೆ ಸ್ಥಿರ ಆಸ್ತಿಯಲ್ಲಿ ತೊಡಗಿಸುವುದು ಉತ್ತಮ. ನಿಮ್ಮ ಕರ್ಮ ಸ್ಥಾನದ ಅಧಿಪತಿಯು ನಿಮ್ಮನ್ನು ವೃತ್ತಿಪರವಾಗಿ ಹದಗೊಳಿಸುತ್ತಿದ್ದಾನೆ; ಈ ಅನುಭವಗಳು ನಿಮ್ಮ ಮಹತ್ತರ ಜಯಕ್ಕೆ ಅಡಿಪಾಯವಾಗಲಿವೆ.`;
  const karmaFinancialRealityKn = `${karmaP1}\n\n${karmaP2}`;

  // Turning Point Timeline
  const turningP1 = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(maha)} ಮಹಾದಶೆಯ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿ ಮತ್ತು ಮುಂಬರುವ ಗೋಚಾರ ಗ್ರಹಗಳ ಚಲನೆಯ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 3 to 6 Months) ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪ್ರಮುಖ ಸಕಾರಾತ್ಮಕ ತಿರುವು ನಿಖರವಾಗಿ ಘಟಿಸಲಿದೆ.`;
  const turningP2 = `ಗೋಚಾರ ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರ ಹಾಗೂ ಧನ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳಲಾರಂಭಿಸಿದ ತಕ್ಷಣ ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಪ್ರತಿಫಲ ಮತ್ತು ನೂತನ ಅವಕಾಶಗಳು ಒದಗಿಬರಲಿವೆ.`;
  const immediateTurningPointKn = `${turningP1}\n\n${turningP2}`;

  // Siddha Remedies
  const gemNameVal = prescriptions?.gemstoneRing?.primaryGemstoneKn || "ಮಾಣಿಕ್ಯ";
  const gemCaratVal = prescriptions?.gemstoneRing?.caratWeight || "4.25 - 5.50 ಕ್ಯಾರಟ್";
  const gemMetalVal = prescriptions?.gemstoneRing?.metalKn || "ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ";
  const gemFingerVal = prescriptions?.gemstoneRing?.fingerKn || "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)";
  const rudraNameVal = prescriptions?.rudraksha?.nameKn || "ರುದ್ರಾಕ್ಷಿ";

  const remedyP1 = `ನಿಮ್ಮ ${lagnaName} ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ, ${gemNameVal} ರತ್ನವನ್ನು (${gemCaratVal}) ${gemMetalVal}ದಲ್ಲಿ ಮಾಡಿಸಿ ${gemFingerVal}ದಲ್ಲಿ ಶುಭ ದಿನದಂದು ಧರಿಸಬೇಕು. ಇದರೊಂದಿಗೆ ${rudraNameVal} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅಂತರಂಗದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ನಿವಾರಣೆಯಾಗಿ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಸಿದ್ಧವಾಗುತ್ತದೆ.`;
  const remedyP2 = `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಿಲ್ವಾರ್ಚನೆ ಸಮರ್ಪಿಸಿ. ಈ ಉಪಾಸನೆಯು ನಿಮ್ಮ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಂಪೂರ್ಣ ಯಶಸ್ಸು ತರಲಿದೆ.`;
  const siddhaPariharaRemedyKn = `${remedyP1}\n\n${remedyP2}`;
  const technicalAspectsCueKn = `ಜಾತಕದ 4ನೇ ಮನೆ, 10ನೇ ಮನೆ ಮತ್ತು ಪ್ರಸ್ತುತ ${toKannadaPlanet(maha)}-${toKannadaPlanet(bhukti)} ದಶೆಯ ಫಲಿತಾಂಶ.`;

  // English counterparts
  const openingIceBreakerEn = `Looking deeply into your chart, your ${lagnaEng} Ascendant and Moon in ${kundli.moonSign.english} with ${moonNakName} Nakshatra creates a fiercely independent, highly principled, and self-respecting character. You rely on your own diligence and never bow to forced coercion. You have come today to understand your genuine planetary strengths and prepare for your upcoming astrological breakthrough.`;
  const hiddenSubconsciousWorryEn = `Your 4th house and Moon indicate deep introspective awareness. While courageous on the surface, you process experiences with thoughtful contemplation. Spiritual grounding provides you with enduring inner peace.`;
  const karmaFinancialRealityEn = `Governed by your 10th house of profession and 2nd/11th houses of wealth, your sustained dedication is building the foundation for enduring career stability and financial growth.`;
  const immediateTurningPointEn = `Calculating the running ${maha} Mahadasha and ${bhukti} Antardasha with transits, a major positive turning point will unfold over the Next 3 to 6 Months.`;
  const siddhaPariharaRemedyEn = `To energize your Lagna Lord, wear an energized ${prescriptions?.gemstoneRing?.primaryGemstoneEn || "Ruby"} (${gemCaratVal}) and adorn sacred ${prescriptions?.rudraksha?.nameEn || "Rudraksha"}. Offer prayers at holy Gokarna Mahabaleshwara Kshetra for lasting grace.`;

  const tenLifeAspectBullets = generate10MasterLifeBulletPoints(
    kundli,
    context,
    prescriptions || ({} as any),
    devoteeAge,
    maha,
    bhukti
  );

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
      runningDashaSummary: `ಪ್ರಸ್ತುತ ಮಹಾದಶಾ: ${toKannadaPlanet(maha)} | ಪ್ರಸ್ತುತ ಭುಕ್ತಿ: ${toKannadaPlanet(bhukti)}. ಈ ಕಾಲಾವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ.`,
      runningGocharaSummary: `ಗೋಚಾರ ಗುರುವು ಜ್ಞಾನ ಮತ್ತು ರಕ್ಷಣೆಯನ್ನು ನೀಡುತ್ತಿದ್ದರೆ, ಶನಿಯು ತಾಳ್ಮೆ ಮತ್ತು ಕಠಿಣ ಪರಿಶ್ರಮವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ.`,
      activeTithiSthiti: `ಪಂಚಾಂಗ ತತ್ವಗಳ ಸಮತೋಲನಕ್ಕಾಗಿ ದೇವತಾ ಪ್ರಾರ್ಥನೆ ಅಗತ್ಯ.`,
      immediateRemedies
    },
    astrologerTalkingPoints: {
      openingIceBreakerKn,
      hiddenSubconsciousWorryKn,
      maandiKarmicImpactKn,
      karmaFinancialRealityKn,
      immediateTurningPointKn,
      siddhaPariharaRemedyKn,
      technicalAspectsCueKn,
      openingIceBreakerEn,
      hiddenSubconsciousWorryEn,
      maandiKarmicImpactEn,
      karmaFinancialRealityEn,
      immediateTurningPointEn,
      siddhaPariharaRemedyEn
    },
    technicalAspects,
    tenLifeAspectBullets
  };
};

/* ==========================================================================
   6. INSTANT ONE-TAP QUESTIONS & ANSWERS GENERATOR (CRISP BULLET POINTS)
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

  const lagnaIdx = kundli.lagnaRashi.index;
  const tenthLord = signLord((lagnaIdx + 9) % 12);
  const tenthLordKn = toKannadaPlanet(tenthLord);
  const seventhLord = signLord((lagnaIdx + 6) % 12);
  const seventhLordKn = toKannadaPlanet(seventhLord);
  const fifthLord = signLord((lagnaIdx + 4) % 12);
  const fifthLordKn = toKannadaPlanet(fifthLord);
  const secondLord = signLord((lagnaIdx + 1) % 12);
  const secondLordKn = toKannadaPlanet(secondLord);
  const eleventhLord = signLord((lagnaIdx + 10) % 12);
  const eleventhLordKn = toKannadaPlanet(eleventhLord);
  const sixthLord = signLord((lagnaIdx + 5) % 12);
  const sixthLordKn = toKannadaPlanet(sixthLord);
  const fourthLord = signLord((lagnaIdx + 3) % 12);
  const fourthLordKn = toKannadaPlanet(fourthLord);

  const h4PlanetsKn = kundli.planets.filter((p) => p.house === 4).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fourthLordKn} ಅಧಿಪತ್ಯ`;
  const h5PlanetsKn = kundli.planets.filter((p) => p.house === 5).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fifthLordKn} ಅಧಿಪತ್ಯ`;
  const h7PlanetsKn = kundli.planets.filter((p) => p.house === 7).map((p) => toKannadaPlanet(p.name)).join(", ") || `${seventhLordKn} ಅಧಿಪತ್ಯ`;
  const h10PlanetsKn = kundli.planets.filter((p) => p.house === 10).map((p) => toKannadaPlanet(p.name)).join(", ") || `${tenthLordKn} ಅಧಿಪತ್ಯ`;

  const dashaMaha = diagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.replace("ಪ್ರಸ್ತುತ ಮಹಾದಶಾ:", "").trim() || "ದಶಾ ಕಾಲ";
  const dashaMahaKn = toKannadaPlanet(dashaMaha);

  const gemName = prescriptions?.gemstoneRing?.primaryGemstoneKn || "ಮಾಣಿಕ್ಯ";
  const gemCarat = prescriptions?.gemstoneRing?.caratWeight || "4.25 - 5.50 ಕ್ಯಾರಟ್";
  const gemMetal = prescriptions?.gemstoneRing?.metalKn || "ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ";
  const gemFinger = prescriptions?.gemstoneRing?.fingerKn || "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)";
  const rudraName = prescriptions?.rudraksha?.nameKn || "ರುದ್ರಾಕ್ಷಿ";

  // Check specific planetary conditions for dynamic Q&A
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find((p) => p.name === PlanetName.Ketu);

  const marsHouse = mars?.house ?? 1;
  const isKujaDosha = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  const hasShani7th = saturn && (saturn.house === 7 || [1, 5, 10].includes(saturn.house));
  const hasSarpa7th = (rahu && rahu.house === 7) || (ketu && ketu.house === 7);
  const hasSarpa5th = (rahu && rahu.house === 5) || (ketu && ketu.house === 5);

  return [
    // 1. CAREER PROGRESS
    {
      id: "q_career_1",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವೃತ್ತಿ",
      questionKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಯಾವಾಗ ಪ್ರಗತಿ ಅಥವಾ ಹೊಸ ಅವಕಾಶ ಸಿಗುತ್ತದೆ?",
      questionEn: "When will I get career progress or a new job opportunity?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${tenthLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, ಪ್ರಸ್ತುತ ${dashaMahaKn} ಮಹಾದಶಾ ಸಂಚಾರ ನಡೆಯುತ್ತಿದೆ. 10ನೇ ಮನೆಯಲ್ಲಿ ${h10PlanetsKn} ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಗೋಚಾರ ಶನಿ-ರಾಹುಗಳ ಸೂಕ್ಷ್ಮ ದೃಷ್ಟಿಯಿಂದಾಗಿ ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗುವುದು ತಾತ್ಕಾಲಿಕವಾಗಿ ವಿಳಂಬವಾಗುತ್ತಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 3 to 5 Months) ಗೋಚಾರ ಗುರುವಿನ ಪೂರ್ಣ ದೃಷ್ಟಿ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳಲಿದ್ದು, ನೂತನ ಉದ್ಯೋಗಾವಕಾಶ ಅಥವಾ ಬಡ್ತಿಯ ಶುಭ ಯೋಗ ಕೂಡಿಬರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ರವಿ ಗಾಯತ್ರಿ ಮಂತ್ರ 11 ಬಾರಿ ಪಠಿಸಿ. ${gemName} (${gemCarat}) ರತ್ನ ಧರಿಸಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ.`),
      astrologicalBasisKn: `10ನೇ ಮನೆ (ಕರ್ಮ ಸ್ಥಾನ ${tenthLordKn}) ಮತ್ತು ಗುರು-ಶನಿ ಗೋಚಾರ ಫಲ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ರವಿ ಗಾಯತ್ರಿ ಪಠಿಸಿ ಮತ್ತು ${gemName} ಧರಿಸಿ.`
    },

    // 2. BUSINESS GROWTH
    {
      id: "q_career_2",
      category: "career",
      categoryLabelKn: "💼 ವ್ಯಾಪಾರ & ವಾಣಿಜ್ಯ",
      questionKn: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ವೃದ್ಧಿ ಮತ್ತು ನಷ್ಟದಿಂದ ಮುಕ್ತಿ ಯಾವಾಗ?",
      questionEn: "When will business turn profitable and overcome loss?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 2ನೇ ಧನಕೋಶ ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${eleventhLordKn} ಗ್ರಹದ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ವ್ಯಾಪಾರದಲ್ಲಿ ಇತ್ತೀಚೆಗೆ ಬಂದ ಅನಿರೀಕ್ಷಿತ ಧನವ್ಯಯ ಅಥವಾ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹಳೆಯ ಬಾಕಿ ಹಣ ನಿಲ್ಲದಿರುವುದು ಬಂಡವಾಳದ ಸರಾಗ ಹರಿವಿಗೆ ಅಡ್ಡಿಯಾಗಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 4 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 4 to 6 Months) ಹೊಸ ಗ್ರಾಹಕರ ಸಂಪರ್ಕ ಮತ್ತು ಹಳೆಯ ಬಾಕಿ ಹಣದ ವಸೂಲಿ ಆರಂಭವಾಗಿ ವ್ಯಾಪಾರ ಲಾಭದಾಯಕ ಹಳಿಗೆ ಮರಳಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ 'ಓಂ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ' ಮಂತ್ರ ಪಠಿಸಿ. ಗೋಕರ್ಣದಲ್ಲಿ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟರಮಣ ಪೂಜಾ ಸಂಕಲ್ಪ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `2ನೇ (ಧನ ಕೋಶ) ಮತ್ತು 11ನೇ (ಲಾಭ ಸ್ಥಾನ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ ಮತ್ತು ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಮಾಡಿ.`
    },

    // 3. WORKPLACE POLITICS
    {
      id: "q_career_3",
      category: "career",
      categoryLabelKn: "💼 ಕಚೇರಿ ರಾಜಕೀಯ",
      questionKn: "ಕಚೇರಿಯಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳಿಂದ ಕಿರುಕುಳ ಹಾಗೂ ಗೌರವದ ಕೊರತೆ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to overcome workplace politics and lack of recognition?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 6ನೇ ಶತ್ರು/ಸ್ಪರ್ಧಾ ಸ್ಥಾನದಲ್ಲಿ ${sixthLordKn} ಅಧಿಪತ್ಯವಿದೆ ಹಾಗೂ ಲಗ್ನದ ನೇರ ನಿಷ್ಠುರ ಗುಣವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ನಿಷ್ಠೆಯನ್ನು ಕೆಲವರು ತಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ಬಳಸಿಕೊಳ್ಳುತ್ತಿದ್ದು, ನೀವು ಮಾಡಿದ ಕೆಲಸದ ಕೀರ್ತಿಯನ್ನು ಇತರರು ಪಡೆಯುವ ಸನ್ನಿವೇಶ ಸೃಷ್ಟಿಯಾಗಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 2 to 4 Months) ಸತ್ಯಾಂಶವು ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಗೆ ಮನವರಿಕೆಯಾಗಿ ನಿಮ್ಮ ಸ್ಥಾನಮಾನ ಮರುಸ್ಥಾಪನೆಯಾಗಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕ ಪಠಿಸಿ. ಕಂಠದಲ್ಲಿ ${rudraName} ಧಾರಣೆ ಮಾಡಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಶತ್ರು ಸಂಹಾರ ತ್ರಿಶೂಲ ಪೂಜೆ ನೆರವೇರಿಸಿ.`),
      astrologicalBasisKn: `6ನೇ (ಶತ್ರು ಜಯ) ಮತ್ತು 10ನೇ ಮನೆಯ ಮೇಲಿನ ಗ್ರಹ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ಪ್ರತಿ ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕ ಪಠಿಸಿ ಮತ್ತು ${rudraName} ಧರಿಸಿ.`
    },

    // 4. MARRIAGE ALLIANCE TIMING (EXPLICIT DOSHA REASON)
    {
      id: "q_marriage_1",
      category: "marriage",
      categoryLabelKn: "💍 ವಿವಾಹ ಭಾಗ್ಯ",
      questionKn: "ವಿವಾಹ ಯೋಗ (ಕಂಕಣ ಭಾಗ್ಯ) ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ? ವಿಳಂಬಕ್ಕೆ ಕಾರಣವೇನು?",
      questionEn: "When will marriage alliance finalize? What is the exact reason for delay?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನದ ಅಧಿಪತಿ ${seventhLordKn} ಆಗಿದ್ದು, 7ನೇ ಮನೆಯಲ್ಲಿ ${h7PlanetsKn} ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ನೈಜ ಕಾರಣ: ${
  isKujaDosha
    ? `ಜಾತಕದಲ್ಲಿ ಕುಜನು ${marsHouse}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ 'ಕುಜ ದೋಷ' ಉಂಟಾಗಿದೆ. ಇದರಿಂದಾಗಿ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಮಾತುಕತೆ ನಿಲ್ಲುವುದು ಅಥವಾ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ ಎದುರಾಗುತ್ತಿದೆ.`
    : hasShani7th
    ? `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿಯ ಪ್ರಭಾವವಿರುವುದರಿಂದ 'ಶನಿ ದೃಷ್ಟಿ ವಿಳಂಬ ಯೋಗ' ಉಂಟಾಗಿದೆ. ಶನಿಯು ಪಕ್ವ ವಯಸ್ಸಿನಲ್ಲಿ ಸುಭದ್ರ ಸಂಬಂಧವನ್ನು ಕರುಣಿಸಲಿದ್ದಾನೆ.`
    : hasSarpa7th
    ? `7ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು/ಕೇತುಗಳಿರುವುದರಿಂದ 'ಸರ್ಪ ದೋಷ' ಉಂಟಾಗಿದೆ; ಇದು ವಿವಾಹ ಪ್ರಸ್ತಾಪಗಳು ಅರ್ಧಕ್ಕೆ ನಿಲ್ಲಲು ಕಾರಣವಾಗಿದೆ.`
    : `7ನೇ ಅಧಿಪತಿ ${seventhLordKn} ಗ್ರಹದ ಗೋಚಾರ ಸಂಚಾರದಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಬಲಹೀನತೆಯಿದೆ.`
}
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 4 ರಿಂದ 7 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 4 to 7 Months) ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಯೋಗ್ಯ, ಸಂಸ್ಕಾರಯುತ ಕುಟುಂಬದಿಂದ ವಿವಾಹ ಪ್ರಸ್ತಾಪ ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ${
  isKujaDosha
    ? "ದಿನನಿತ್ಯ ಕುಜ ಗಾಯತ್ರಿ ಜಪಿಸಿ ('ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ'). ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಕುಜ ಶಾಂತಿ ಪೂಜೆ ನೆರವೇರಿಸಿ."
    : "ದಿನನಿತ್ಯ 'ಓಂ ಕಾತ್ಯಾಯನಿ ಮಹಾಮಾಯೇ ಮಹಾಯೋಗಿನ್ಯಧೀಶ್ವರಿ' ಅಥವಾ 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಜಪಿಸಿ. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ."
}`),
      astrologicalBasisKn: `7ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ ${seventhLordKn}) ಮತ್ತು ಗುರು-ಕುಜ ಗೋಚಾರ ಬಲ.`,
      immediateRemedyKn: `ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣ ಸೇವೆ ಮಾಡಿಸಿ.`
    },

    // 5. MARITAL HARMONY
    {
      id: "q_marriage_2",
      category: "marriage",
      categoryLabelKn: "💍 ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ",
      questionKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಸಾಮರಸ್ಯ ಹೇಗೆ ಸಿಗುತ್ತದೆ?",
      questionEn: "How to resolve marital tension and restore domestic peace?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಮತ್ತು 4ನೇ ಸುಖ ಸ್ಥಾನದ ಮೇಲೆ ${seventhLordKn} ಹಾಗೂ ${fourthLordKn} ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಇತ್ತೀಚೆಗೆ ನಡೆದ ಸಣ್ಣ ಮಾತುಕತೆ ಅಥವಾ ಅಹಂಕಾರದ ಘರ್ಷಣೆಯು ದಾಂಪತ್ಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ಅಂತರ ತಂದಿದೆ. ಪರಸ್ಪರ ಪ್ರೀತಿ ಇದ್ದರೂ ಮುಕ್ತ ಸಂವಹನದ ಕೊರತೆ ಕಾಣಿಸುತ್ತಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 2 ರಿಂದ 4 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 2 to 4 Months) ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರದಿಂದ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಮರಳಿ ಬಂದು ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಮಂಗಳವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ. ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`),
      astrologicalBasisKn: `7ನೇ ಮನೆ ಮತ್ತು 4ನೇ ಮನೆಯ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },

    // 6. PROGENY DELAY (EXPLICIT DOSHA REASON)
    {
      id: "q_children_1",
      category: "children",
      categoryLabelKn: "👶 ಸಂತಾನ ಭಾಗ್ಯ",
      questionKn: "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ವಿಳಂಬವಾಗುತ್ತಿರುವುದು ಏಕೆ? ಯಾವ ದೋಷ ಮತ್ತು ಪರಿಹಾರವೇನು?",
      questionEn: "Why delay in childbirth? Which dosha is responsible and what is the Vedic remedy?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 5ನೇ ಸಂತಾನ/ಪುತ್ರ ಸ್ಥಾನದಲ್ಲಿ ${fifthLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, 5ನೇ ಮನೆಯಲ್ಲಿ ${h5PlanetsKn} ಪ್ರಭಾವವಿದೆ. ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸಂಚಾರವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ನೈಜ ಕಾರಣ: ${
  hasSarpa5th
    ? "5ನೇ ಭಾವದಲ್ಲಿ ರಾಹು/ಕೇತುಗಳ ಸಂಚಾರದಿಂದ 'ಪುತ್ರ ಸ್ಥಾನ ಸರ್ಪ ದೋಷ' ಉಂಟಾಗಿದೆ. ಇದು ವೈದ್ಯಕೀಯ ವರದಿ ಸರಿಯಿದ್ದರೂ ಗರ್ಭಧಾರಣೆಯಲ್ಲಿ ವಿಳಂಬಕ್ಕೆ ಕಾರಣವಾಗಿದೆ."
    : isKujaDosha
    ? `ಕುಜ ಗ್ರಹದ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿಯಿಂದಾಗಿ ಗರ್ಭಕೋಶದಲ್ಲಿ ಉಷ್ಣಾಧಿಕ್ಯ ಅಥವಾ ಪಿತ್ತ ದೋಷ ಉಂಟಾಗಿ ಸಂತಾನ ವಿಳಂಬವಾಗುತ್ತಿದೆ.`
    : `5ನೇ ಮನೆಯ ಅಧಿಪತಿ ${fifthLordKn} ಮತ್ತು ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಮೇಲೆ ಸೂಕ್ಷ್ಮ ಗ್ರಹಣ ದೋಷದ ಪ್ರಭಾವವಿದೆ.`
}
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 6 ರಿಂದ 9 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 6 to 9 Months) ಗೋಚಾರ ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಸಂತಾನ ಭಾಗ್ಯದ ಶುಭ ಸುದ್ದಿ ಮನೆತುಂಬುವ ಪ್ರಬಲ ಯೋಗವಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪಿಸಿ: 'ಓಂ ಕ್ಲೀಂ ದೇವಕೀಸುತ ಗೋವಿಂದ ವಾಸುದೇವ ಜಗತ್ಪತೇ ದೇಹಿ ಮೇ ತನಯಂ ಕೃಷ್ಣ ತ್ವಾಮಹಂ ಶರಣಂ ಗತಃ'. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಾಗಬಲಿ / ಸುಬ್ರಹ್ಮಣ್ಯ ಶಾಂತಿ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `5ನೇ ಮನೆ (ಪುತ್ರ ಸ್ಥಾನ ${fifthLordKn}) ಮತ್ತು ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸ್ಥಿತಿ.`,
      immediateRemedyKn: `ದಿನನಿತ್ಯ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಸೇವೆ ಮಾಡಿಸಿ.`
    },

    // 7. MENTAL PEACE & EMOTIONAL BALANCE
    {
      id: "q_mind_1",
      category: "mind",
      categoryLabelKn: "🧠 ಮಾನಸಿಕ ನೆಮ್ಮದಿ",
      questionKn: "ಮನಸ್ಸಿಗೆ ಆತಂಕ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಒತ್ತಡ ನಿವಾರಣೆಗೆ ದೈವಿಕ ಪರಿಹಾರವೇನು?",
      questionEn: "What is the divine astrological remedy for mental anxiety and emotional strain?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮನಃಕಾರಕ ಚಂದ್ರನು ${moonHouse}ನೇ ಮನೆಯಲ್ಲಿ (${moonRashiKn} ರಾಶಿ, ${moonNakKn} ನಕ್ಷತ್ರ) ಸ್ಥಿತನಾಗಿದ್ದಾನೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಚಂದ್ರನ ಮೇಲಿನ ಗ್ರಹ ಪ್ರಭಾವದಿಂದಾಗಿ ನೀವು ಹೊರಗೆ ಧೈರ್ಯವಾಗಿ ಕಂಡರೂ ಒಳಗೆ ಎಲ್ಲವನ್ನೂ ಅತಿಯಾಗಿ ಆಲೋಚಿಸುವ (Overthinking) ಮತ್ತು ಭಾವನೆಗಳನ್ನು ಅದುಮಿಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಇದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 2 ರಿಂದ 3 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 2 to 3 Months) ಚಂದ್ರನ ಗೋಚಾರ ಬಲ ಸುಧಾರಿಸಲಿದ್ದು ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ ಮರಳಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಪ್ರತಿದಿನ ರಾತ್ರಿ 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ. ಕಂಠದಲ್ಲಿ ${rudraName} ಧರಿಸಿ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ.`),
      astrologicalBasisKn: `ಚಂದ್ರನ ${moonHouse}ನೇ ಸ್ಥಾನ ಮತ್ತು 4ನೇ ಭಾವದ ${fourthLordKn} ಪ್ರಭಾವ.`,
      immediateRemedyKn: `${rudraName} ಧರಿಸಿ ಮತ್ತು ರಾತ್ರಿ 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.`
    },

    // 8. EVIL EYE & PROTECTION
    {
      id: "q_mind_2",
      category: "mind",
      categoryLabelKn: "🧠 ದೃಷ್ಟಿ ದೋಷ & ರಕ್ಷಣೆ",
      questionKn: "ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಮತ್ತು ಶತ್ರು ಭೀತಿ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to neutralize evil eye, negative energy, and obstacles?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ ತೇಜಸ್ಸು ಹಾಗೂ 8ನೇ ಗೂಢ ಸ್ಥಾನದ ಮೇಲೆ ಛಾಯಾಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ನಿಮ್ಮ ಪ್ರಗತಿ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವವನ್ನು ನೋಡಿ ಕೆಲವರಿಗೆ ಉಂಟಾಗುವ ಅಸೂಯೆ ಮತ್ತು ನರದೃಷ್ಟಿಯಿಂದಾಗಿ ಹೊಸ ಕೆಲಸಗಳಲ್ಲಿ ಆರಂಭಿಕ ಅಡೆತಡೆಗಳು ಎದುರಾಗುತ್ತಿವೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ರಿಂದ 2 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 1 to 2 Months) ರಕ್ಷಾ ಕವಚದ ಪ್ರಭಾವದಿಂದ ಸಕಲ ದೃಷ್ಟಿ ದೋಷಗಳು ಭಸ್ಮವಾಗಲಿವೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಮಂಗಳವಾರ-ಶುಕ್ರವಾರ ಮುಖ್ಯದ್ವಾರಕ್ಕೆ ಕಲ್ಲುಪ್ಪು-ನಿಂಬೆಹಣ್ಣಿನ ದೃಷ್ಟಿ ತೆಗೆಯಿರಿ. ಶ್ರೀ ಸುದರ್ಶನ ಕವಚ ಅಥವಾ ನರಸಿಂಹ ಮಂತ್ರ ಜಪಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ರಕ್ಷಾ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`),
      astrologicalBasisKn: `ಲಗ್ನ ಮತ್ತು 8ನೇ ಮನೆಯ ಮೇಲಿನ ಛಾಯಾಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ ಮತ್ತು ಸುದರ್ಶನ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ.`
    },

    // 9. WEALTH & DEBT RELIEF
    {
      id: "q_wealth_1",
      category: "wealth",
      categoryLabelKn: "💰 ಆರ್ಥಿಕತೆ & ಸಾಲ ಮುಕ್ತಿ",
      questionKn: "ಸಾಲದ ಬಾಧೆಯಿಂದ ಮುಕ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಯಾವಾಗ?",
      questionEn: "When will debt pressure ease and finances stabilize?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 6ನೇ ಋಣ ಸ್ಥಾನದಲ್ಲಿ ${sixthLordKn} ಮತ್ತು 2ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${secondLordKn} ಗ್ರಹ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಕೈಗೆ ಬಂದ ಹಣ ನಿಲ್ಲದೆ ಅನಿರೀಕ್ಷಿತ ತುರ್ತು ವೆಚ್ಚಗಳಿಗೆ ಸೋರಿಹೋಗುತ್ತಿರುವುದು ಸಾಲದ ಹೊರೆಯನ್ನು ಹೆಚ್ಚಿಸಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 4 ರಿಂದ 7 ತಿಂಗಳುಗಳಲ್ಲಿ (Next 4 to 7 Months) ಹೊಸ ಆದಾಯದ ಮಾರ್ಗ ತೆರೆದುಕೊಂಡು ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ ಇಳಿಯಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ${gemName} ಧರಿಸಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `6ನೇ (ಋಣ) ಮತ್ತು 11ನೇ (ಲಾಭ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಸೇವೆ ಮಾಡಿಸಿ.`
    }
  ];
};

export const generatePanchangaAngaSynthesis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; lang?: string; devoteeName?: string; gender?: string }
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
  const p1 = sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನ ಹಾಗೂ ${moonRashiKn} ರಾಶಿಯ ${moonNakKn} ನಕ್ಷತ್ರದ ಗ್ರಹ ಸಂಯೋಗವನ್ನು ನೋಡಿದರೆ, ${currentDiagnosis.technicalAspects.fourthHouseDetail}. ನಿಮ್ಮ ಮೂಲ ಪ್ರಕೃತಿ ಅತ್ಯಂತ ಸ್ವಾಭಿಮಾನಿ ಮತ್ತು ಸ್ವತಂತ್ರ ವಿಚಾರಶೀಲತೆಯನ್ನು ಹೊಂದಿದೆ.`);
  
  const p2 = sanitizeAstrologyKannadaText(`ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಮುಖ್ಯ ಗಮನ: ${currentDiagnosis.primaryLifeChallenge.description}. ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮುನ್ನಡೆಯಲು ಗ್ರಹ ಸ್ಥಿತಿಗಳು ಹದಗೊಳ್ಳುತ್ತಿವೆ. ${currentDiagnosis.technicalAspects.tenthHouseDetail} ಮತ್ತು ${currentDiagnosis.technicalAspects.seventhHouseDetail}. ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}`);

  const p3 = sanitizeAstrologyKannadaText(`ನೀವು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಧೃತಿಗೆಡಬೇಕಾಗಿಲ್ಲ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಇನ್ನು ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ನೂತನ ಅವಕಾಶಗಳು ಗೋಚರಿಸಲಿವೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವಯುತ ಯಶಸ್ಸು ಖಚಿತವಾಗಿ ಲಭಿಸಲಿದೆ.`);

  const p4 = sanitizeAstrologyKannadaText(`ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಮಾಡಿಸಿ ${prescriptions.gemstoneRing.fingerKn}ಕ್ಕೆ ${prescriptions.gemstoneRing.activationDay} ದಿನ ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಇದರೊಂದಿಗೆ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಹಾಗೂ ${currentDiagnosis.prasthuthaSthiti.immediateRemedies.join(" ")}. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿಸುವ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`);

  const yajnaHawanaPlan = generateYajnaHawanaPlan(kundli, {
    runningDashaMaha: currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.trim(),
    runningDashaBhukti: currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[1]?.trim(),
    primaryChallenge: currentDiagnosis.primaryLifeChallenge.area,
    devoteeName: context.devoteeName
  });

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
    tenLifeAspectBullets: currentDiagnosis.tenLifeAspectBullets,
    instantQAList,
    multiParagraphExecutiveReading: [p1, p2, p3, p4],
    yajnaHawanaPlan
  };
};
