import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { PlanetName, type KundliOutput, type Rashi, type Nakshatra } from "./AstroTypes";
import { normalizeDegree } from "./AstroMath";
import { signLord } from "./KundliInsightsEngine";
import { calculateKpSubLord } from "./kpSubLordEngine";
import { computeSubDivisionalAmsha } from "./subDivisions";
import { calculateHoroscopeRashmi } from "./rashmiChinthaEngine";
import { findBhuktiAtAge, generateBhuktiTimeline, type BhuktiSpan } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";
import { calculateKundli } from "./KundliEngine";

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

export interface DynamicDashaTiming {
  remainingMonths: number;
  currentBhuktiEndAge: number;
  currentMaha: PlanetName;
  currentBhukti: PlanetName;
  nextMaha?: PlanetName;
  nextBhukti?: PlanetName;
  timelineKn: string;
  timelineEn: string;
  badgeTimelineKn: string;
  badgeTimelineEn: string;
}

export interface LiveGocharaAnalysis {
  guruHouseFromMoon: number;
  shaniHouseFromMoon: number;
  rahuHouseFromMoon: number;
  ketuHouseFromMoon: number;
  guruStatusKn: string;
  guruStatusEn: string;
  shaniStatusKn: string;
  shaniStatusEn: string;
  summaryKn: string;
  summaryEn: string;
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
  goodBadAnalysis: GoodBadTraitAnalysis;
  dashaTiming?: DynamicDashaTiming;
  liveGochara?: LiveGocharaAnalysis;
}

export interface TraitBulletPoint {
  id: number;
  type: "good" | "bad";
  titleKn: string;
  titleEn: string;
  icon: string;
  badgeKn: string;
  badgeEn: string;
  bulletKn: string;
  bulletEn: string;
  astrologicalBasisKn: string;
  astrologicalBasisEn: string;
  remedyKn?: string;
  remedyEn?: string;
  secrecyHabitKn?: string;
  secrecyHabitEn?: string;
}

export interface GoodBadTraitAnalysis {
  goodTraits: TraitBulletPoint[];
  badTraits: TraitBulletPoint[];
  secrecyHabitKn?: string;
  secrecyHabitEn?: string;
  gokarnaPrayashchittaKn?: string;
  gokarnaPrayashchittaEn?: string;
}

export interface MasterLifeBulletPoint {
  id: number;
  category: "personality" | "education" | "social" | "mind" | "career" | "wealth" | "marriage" | "health" | "dasha_gochara" | "remedy" | "shadow";
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
  goodBadAnalysis: GoodBadTraitAnalysis;
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
    [PlanetName.Sun]: { mukhi: 1, nameKn: "1 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "1 Mukhi Rudraksha", deity: "Lord Shiva (Surya Tatva)" },
    [PlanetName.Moon]: { mukhi: 2, nameKn: "2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "2 Mukhi Rudraksha", deity: "Ardhanarishvara (Chandra Tatva)" },
    [PlanetName.Mars]: { mukhi: 3, nameKn: "3 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "3 Mukhi Rudraksha", deity: "Lord Agni (Mangala Tatva)" },
    [PlanetName.Mercury]: { mukhi: 4, nameKn: "4 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "4 Mukhi Rudraksha", deity: "Lord Brahma (Budha Tatva)" },
    [PlanetName.Jupiter]: { mukhi: 5, nameKn: "5 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "5 Mukhi Rudraksha", deity: "Lord Kalagni Rudra (Guru Tatva)" },
    [PlanetName.Venus]: { mukhi: 6, nameKn: "6 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "6 Mukhi Rudraksha", deity: "Lord Kartikeya (Shukra Tatva)" },
    [PlanetName.Saturn]: { mukhi: 7, nameKn: "7 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "7 Mukhi Rudraksha", deity: "Goddess Mahalakshmi (Shani Tatva)" },
    [PlanetName.Rahu]: { mukhi: 8, nameKn: "8 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "8 Mukhi Rudraksha", deity: "Lord Ganesha (Rahu Tatva)" },
    [PlanetName.Ketu]: { mukhi: 9, nameKn: "9 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "9 Mukhi Rudraksha", deity: "Goddess Durga (Ketu Tatva)" }
  };

  const selectedRudraksha = rudrakshaMap[lagnaLord] || rudrakshaMap[PlanetName.Jupiter];

  // Dynamic Rudraksha Wearing Day and Method
  const rudrakshaWearingMap: Record<PlanetName, string> = {
    [PlanetName.Sun]: "ಭಾನುವಾರ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ ಹಸಿ ಹಾಲಿನಲ್ಲಿ ಮತ್ತು ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' 108 ಬಾರಿ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Moon]: "ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ (ಶುಕ್ಲಪಕ್ಷ) ಹಸಿ ಹಾಲಿನಲ್ಲಿ ಮತ್ತು ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' 108 ಬಾರಿ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Mars]: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ ಕುಜ ಹೋರೆಯಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ ಕುಜ ಗಾಯತ್ರಿ ಮತ್ತು 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Mercury]: "ಬುಧವಾರ ಪ್ರಾತಃಕಾಲ ಬುಧ ಹೋರೆಯಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ ಬುಧ ಮಂತ್ರ ಮತ್ತು 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Jupiter]: "ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ ಗುರು ಹೋರೆಯಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ ಗುರು ಗಾಯತ್ರಿ ಮತ್ತು 'ಓಂ ನಮಃ ಶಿವಾಯ' 108 ಬಾರಿ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Venus]: "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ ಶುಕ್ರ ಹೋರೆಯಲ್ಲಿ ಹಾಲಿನಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Saturn]: "ಶನಿವಾರ ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಜೆ ಶನಿ ಹೋರೆಯಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Rahu]: "ಶನಿವಾರ ಸಂಜೆ ರಾಹುಕಾಲ ಕಳೆದು ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' 108 ಬಾರಿ ಜಪಿಸಿ ಧರಿಸಬೇಕು.",
    [PlanetName.Ketu]: "ಗುರುವಾರ ಅಥವಾ ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ ಗಣೇಶ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಧರಿಸಬೇಕು."
  };

  // Dynamic Carat calculation based on Ascendant degree
  const ascDegree = kundli.ascendant ?? 15;
  const minCarat = Number((4.0 + (ascDegree % 8) * 0.25).toFixed(2));
  const maxCarat = Number((minCarat + 1.25).toFixed(2));
  const dynamicCaratKn = `${minCarat} ರಿಂದ ${maxCarat} ಕ್ಯಾರಟ್`;

  // 2. Gemstone Ring Selection (ಉಂಗುರ / ರತ್ನ - English Digits)
  const gemstoneMap: Record<PlanetName, {
    kn: string; en: string; sanskrit: string; metalKn: string; metalEn: string; fingerKn: string; fingerEn: string;
  }> = {
    [PlanetName.Sun]: { kn: "ಮಾಣಿಕ್ಯ", en: "Ruby", sanskrit: "Manikya", metalKn: "ಅಪ್ಪಟ ಚಿನ್ನ ಅಥವಾ ಶುದ್ಧ ತಾಮ್ರ", metalEn: "Gold or Copper", fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)", fingerEn: "Ring Finger of Right Hand" },
    [PlanetName.Moon]: { kn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು", en: "Natural Pearl", sanskrit: "Mukta", metalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ", metalEn: "Pure Silver", fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)", fingerEn: "Little Finger of Right Hand" },
    [PlanetName.Mars]: { kn: "ಹವಳ", en: "Red Coral", sanskrit: "Pravala", metalKn: "ಶುದ್ಧ ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ", metalEn: "Copper or Gold", fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)", fingerEn: "Ring Finger of Right Hand" },
    [PlanetName.Mercury]: { kn: "ಪಚ್ಚೆ", en: "Emerald", sanskrit: "Marakata", metalKn: "ಚಿನ್ನ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Gold or Panchadhatu", fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)", fingerEn: "Little Finger of Right Hand" },
    [PlanetName.Jupiter]: { kn: "ಪುಷ್ಪರಾಗ", en: "Yellow Sapphire", sanskrit: "Pushparaga", metalKn: "ಅಪ್ಪಟ ಶುದ್ಧ ಚಿನ್ನ", metalEn: "Pure Gold", fingerKn: "ತೋರುಬೆರಳು (ತರ್ಜನಿ)", fingerEn: "Index Finger of Right Hand" },
    [PlanetName.Venus]: { kn: "ವಜ್ರ ಅಥವಾ ಶ್ವೇತ ಜಿರ್ಕಾನ್", en: "Diamond or White Zircon", sanskrit: "Vajra / Heera", metalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ಪ್ಲಾಟಿನಂ", metalEn: "Silver or Platinum", fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಉಂಗುರದ ಬೆರಳು", fingerEn: "Middle or Ring Finger" },
    [PlanetName.Saturn]: { kn: "ಇಂದ್ರನೀಲಂ (ನೀಲಂ)", en: "Blue Sapphire (Neelam)", sanskrit: "Neelam", metalKn: "ಪಂಚಧಾತು ಅಥವಾ ಬೆಳ್ಳಿ", metalEn: "Panchadhatu or Silver", fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)", fingerEn: "Middle Finger of Right Hand" },
    [PlanetName.Rahu]: { kn: "ಗೋಮೇಧಿಕ", en: "Hessonite (Gomed)", sanskrit: "Gomedhika", metalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Silver or Panchadhatu", fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)", fingerEn: "Middle Finger of Right Hand" },
    [PlanetName.Ketu]: { kn: "ವೈಢೂರ್ಯ", en: "Cat's Eye (Vaidurya)", sanskrit: "Vaidurya", metalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಧಾತು", metalEn: "Silver or Panchadhatu", fingerKn: "ಉಂಗುರದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು", fingerEn: "Ring or Little Finger" }
  };

  const selectedGem = gemstoneMap[lagnaLord] || gemstoneMap[PlanetName.Jupiter];

  // Dynamic Activation Day per Lagna Lord
  const activationDayMap: Record<PlanetName, string> = {
    [PlanetName.Sun]: "ಭಾನುವಾರ ಪ್ರಾತಃಕಾಲ (ಸೂರ್ಯೋದಯ ಕಾಲದಲ್ಲಿ)",
    [PlanetName.Moon]: "ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ (ಶುಕ್ಲಪಕ್ಷದಲ್ಲಿ)",
    [PlanetName.Mars]: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ (ಕುಜ ಹೋರೆಯಲ್ಲಿ)",
    [PlanetName.Mercury]: "ಬುಧವಾರ ಪ್ರಾತಃಕಾಲ (ಬುಧ ಹೋರೆಯಲ್ಲಿ)",
    [PlanetName.Jupiter]: "ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ (ಗುರು ಹೋರೆಯಲ್ಲಿ)",
    [PlanetName.Venus]: "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ (ಶುಕ್ರ ಹೋರೆಯಲ್ಲಿ)",
    [PlanetName.Saturn]: "ಶನಿವಾರ ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಜೆ (ಶನಿ ಹೋರೆಯಲ್ಲಿ)",
    [PlanetName.Rahu]: "ಶನಿವಾರ ಸಂಜೆ (ರಾಹುಕಾಲ ಕಳೆದು)",
    [PlanetName.Ketu]: "ಗುರುವಾರ ಅಥವಾ ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ"
  };
  const dynamicActivationDay = activationDayMap[lagnaLord] || "ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ (ಗುರು ಹೋರೆಯಲ್ಲಿ)";

  // Dynamic Shanti Pooja based on Lagna Lord & Affliction
  let shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ & ಮೃತ್ಯುಂಜಯ ಸಂಪುಟ ನವಗ್ರಹ ಶಾಂತಿ";
  let shantiEn = "Gokarna Maha Ganapati & Mrityunjaya Navagraha Shanti";
  let shantiPurpose = "ಲಗ್ನ ಬಲವರ್ಧನೆ, ದಶಾ ಸಂಧಿಯ ಅಡೆತಡೆಗಳ ನಿವಾರಣೆ ಮತ್ತು ಆಯುರ್-ಆರೋಗ್ಯ ವೃದ್ಧಿ.";

  if (lagnaLord === PlanetName.Mars) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಕುಜ ಶಾಂತಿ ಪೂಜೆ & ಬಿಲ್ವಾರ್ಚನೆ";
    shantiEn = "Subrahmanya Kuja Shanti & Bilvarchana at Gokarna Kshetra";
    shantiPurpose = "ಕುಜ ಬಲವರ್ಧನೆ, ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ರಕ್ತದೊತ್ತಡ/ಅಗ್ನಿ ದೋಷ ಶಮನ.";
  } else if (lagnaLord === PlanetName.Saturn) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಶನಿ ಶಾಂತಿ, ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ & ತೈಲಾಭಿಷೇಕ";
    shantiEn = "Shani Shanti & Maha Mrityunjaya Japa at Gokarna Kshetra";
    shantiPurpose = "ಶನಿ ಪೀಡಾ ನಿವಾರಣೆ, ಆಯುಷ್ಯ ವೃದ್ಧಿ ಮತ್ತು ಕರ್ಮ ಸಿದ್ಧಿ.";
  } else if (lagnaLord === PlanetName.Moon) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಚಂದ್ರ ಶಾಂತಿ, ಕ್ಷೀರಾಭಿಷೇಕ & ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ";
    shantiEn = "Chandra Shanti, Ksheerabhisheka & Rudrabhisheka at Gokarna";
    shantiPurpose = "ಮಾನಸಿಕ ಶಾಂತಿ, ಭಾವನಾತ್ಮಕ ಸ್ಥೈರ್ಯ ಮತ್ತು ಮಾತೃ ಸುಖ ವೃದ್ಧಿ.";
  } else if (lagnaLord === PlanetName.Mercury) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ & ಬುಧ ಶಾಂತಿ ಸೇವೆ";
    shantiEn = "Maha Ganapati Homa & Budha Shanti Seva at Gokarna";
    shantiPurpose = "ಬುದ್ಧಿ ಸ್ಥೈರ್ಯ, ವ್ಯಾಪಾರ-ವಿದ್ಯಾಭ್ಯಾಸ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ವಾಕ್ ಸಿದ್ಧಿ.";
  } else if (lagnaLord === PlanetName.Venus) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಶ್ರೀ ಸೂಕ್ತ ಹವನ & ಲಕ್ಷ್ಮೀ-ಪಾರ್ವತಿ ಪೂಜೆ";
    shantiEn = "Shree Sukta Hawana & Lakshmi-Parvati Pooja at Gokarna";
    shantiPurpose = "ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ, ದಾಂಪತ್ಯ ಸುಖ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ.";
  } else if (lagnaLord === PlanetName.Sun) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಸಂಕಲ್ಪ & ಮಹಾ ರುದ್ರಾಭಿಷೇಕ";
    shantiEn = "Surya Sankalpa & Maha Rudrabhisheka at Gokarna Kshetra";
    shantiPurpose = "ಆತ್ಮಬಲ ವೃದ್ಧಿ, ಪಿತೃ ಕೃಪೆ, ತೇಜಸ್ಸು ಮತ್ತು ಆರೋಗ್ಯ ಭಾಗ್ಯ.";
  }

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
      astrologicalReason: `ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯಾದ ${toKannadaPlanet(lagnaLord)} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರದ ತರಂಗಾಂತರವನ್ನು ಶುದ್ಧೀಕರಿಸಲು, ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ವೃದ್ಧಿಸಲು ಈ ${selectedRudraksha.mukhi} ಮುಖಿ ರುದ್ರಾಕ್ಷಿಯು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
      wearingMethod: rudrakshaWearingMap[lagnaLord] || rudrakshaWearingMap[PlanetName.Jupiter],
      panchangaSynergy: `ಜನ್ಮ ನಕ್ಷತ್ರಾಧಿಪತಿ (${nakLord}) ಮತ್ತು ಕರಣ ತತ್ವದ (${kRule.tatva}) ಜೊತೆಗೆ ಅದ್ಭುತ ಸಮನ್ವಯ ಸಾಧಿಸುತ್ತದೆ.`
    },
    gemstoneRing: {
      primaryGemstoneKn: selectedGem.kn,
      primaryGemstoneEn: selectedGem.en,
      sanskritName: selectedGem.sanskrit,
      caratWeight: dynamicCaratKn,
      metalKn: selectedGem.metalKn,
      metalEn: selectedGem.metalEn,
      fingerKn: selectedGem.fingerKn,
      fingerEn: selectedGem.fingerEn,
      astrologicalReason: `ಲಗ್ನ ಬಲವನ್ನು ಸ್ಥಿರಗೊಳಿಸಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಮತ್ತು ದಶಾ ಸಂಧಿಕಾಲದ ಅಡೆತಡೆಗಳಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಲು ಈ ${selectedGem.kn} (${dynamicCaratKn}) ಭಾಗ್ಯ ರತ್ನ ಉಂಗುರವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`,
      activationDay: dynamicActivationDay,
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
      nameKn: shantiKn,
      nameEn: shantiEn,
      purpose: shantiPurpose
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

export const calculateDynamicDashaTiming = (
  kundli: KundliOutput,
  ageDecimal: number
): DynamicDashaTiming => {
  const bhuktiTimeline = generateBhuktiTimeline(kundli);
  const currentSpanIdx = bhuktiTimeline.findIndex(
    (s) => ageDecimal >= s.startAge - 1e-6 && ageDecimal < s.endAge - 1e-6
  );
  const currentSpan = currentSpanIdx >= 0 ? bhuktiTimeline[currentSpanIdx] : bhuktiTimeline[0]!;
  const nextSpan = currentSpanIdx >= 0 && currentSpanIdx + 1 < bhuktiTimeline.length ? bhuktiTimeline[currentSpanIdx + 1] : undefined;

  const currentMaha = currentSpan.maha;
  const currentBhukti = currentSpan.bhukti;
  const nextMaha = nextSpan?.maha;
  const nextBhukti = nextSpan?.bhukti;

  const remainingYears = Math.max(0.08, currentSpan.endAge - ageDecimal);
  const remainingMonths = Math.max(1, Math.round(remainingYears * 12));

  const timelineKn = `ಮುಂದಿನ ${remainingMonths} ತಿಂಗಳುಗಳಲ್ಲಿ`;
  const timelineEn = `over the Next ${remainingMonths} Month${remainingMonths > 1 ? "s" : ""}`;
  const badgeTimelineKn = `ಮುಂದಿನ ${remainingMonths} ತಿಂಗಳುಗಳು`;
  const badgeTimelineEn = `Next ${remainingMonths} Month${remainingMonths > 1 ? "s" : ""}`;

  return {
    remainingMonths,
    currentBhuktiEndAge: currentSpan.endAge,
    currentMaha,
    currentBhukti,
    nextMaha,
    nextBhukti,
    timelineKn,
    timelineEn,
    badgeTimelineKn,
    badgeTimelineEn
  };
};

export const calculateLiveGochara = (
  kundli: KundliOutput,
  context: { latitude: number; longitude: number }
): LiveGocharaAnalysis => {
  const today = new Date();
  const todayYmd = today.toISOString().slice(0, 10);
  const todayHours = String(today.getHours()).padStart(2, "0");
  const todayMins = String(today.getMinutes()).padStart(2, "0");

  const transitKundli = calculateKundli({
    name: "Gochara Transit",
    birthDate: todayYmd,
    birthTime: `${todayHours}:${todayMins}`,
    latitude: context.latitude,
    longitude: context.longitude
  });

  const nativeMoonRashiIdx = kundli.moonSign.index;

  const transitJupiter = transitKundli.planets.find((p) => p.name === PlanetName.Jupiter);
  const transitSaturn = transitKundli.planets.find((p) => p.name === PlanetName.Saturn);
  const transitRahu = transitKundli.planets.find((p) => p.name === PlanetName.Rahu);
  const transitKetu = transitKundli.planets.find((p) => p.name === PlanetName.Ketu);

  const jupiterTransitSignIdx = transitJupiter ? transitJupiter.rashi.index : 1;
  const saturnTransitSignIdx = transitSaturn ? transitSaturn.rashi.index : 10;
  const rahuTransitSignIdx = transitRahu ? transitRahu.rashi.index : 11;
  const ketuTransitSignIdx = transitKetu ? transitKetu.rashi.index : 5;

  const guruHouseFromMoon = ((jupiterTransitSignIdx - nativeMoonRashiIdx + 12) % 12) + 1;
  const shaniHouseFromMoon = ((saturnTransitSignIdx - nativeMoonRashiIdx + 12) % 12) + 1;
  const rahuHouseFromMoon = ((rahuTransitSignIdx - nativeMoonRashiIdx + 12) % 12) + 1;
  const ketuHouseFromMoon = ((ketuTransitSignIdx - nativeMoonRashiIdx + 12) % 12) + 1;

  // Interpret Jupiter Gochara (Houses 2, 5, 7, 9, 11 are Auspicious / Shubha)
  const isGuruShubha = [2, 5, 7, 9, 11].includes(guruHouseFromMoon);
  const guruStatusKn = isGuruShubha
    ? `ಗೋಚಾರ ಗುರುವು ಜನ್ಮ ರಾಶಿಯಿಂದ ${guruHouseFromMoon}ನೇ ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಭಾಗ್ಯೋದಯ, ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆರ್ಥಿಕ ವೃದ್ಧಿಗೆ ಪೂರಕವಾಗಿದ್ದಾನೆ.`
    : `ಗೋಚಾರ ಗುರುವು ಜನ್ಮ ರಾಶಿಯಿಂದ ${guruHouseFromMoon}ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ, ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಶುಭ ಫಲ ನೀಡಲಿದ್ದಾನೆ.`;
  const guruStatusEn = isGuruShubha
    ? `Transiting Jupiter is posited in auspicious House ${guruHouseFromMoon} from your Moon, conferring divine protection, fortune, and prosperity.`
    : `Transiting Jupiter is in House ${guruHouseFromMoon} from your Moon, requiring patience and spiritual focus for desired fruition.`;

  // Interpret Saturn Gochara (12, 1, 2 = Sade Sati; 8 = Ashtama; 4 = Kantaka; 3, 6, 11 = Upachaya)
  let shaniStatusKn = "";
  let shaniStatusEn = "";
  if ([12, 1, 2].includes(shaniHouseFromMoon)) {
    const phase = shaniHouseFromMoon === 12 ? "ಆದಿ ಹಂತ" : shaniHouseFromMoon === 1 ? "ಜನ್ಮ/ಮಧ್ಯ ಹಂತ" : "ಅಂತ್ಯ ಹಂತ";
    shaniStatusKn = `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ ${shaniHouseFromMoon}ನೇ ಮನೆಯಲ್ಲಿ ಚಲಿಸುತ್ತಿದ್ದು, ಸಾಡೇ ಸಾತಿ (ಏಳೂವರೆ ಶನಿ - ${phase}) ಪ್ರಭಾವವಿದೆ. ಇದು ಪರಿಶ್ರಮ ಮತ್ತು ಕರ್ಮ ಶುದ್ಧಿಯ ಕಾಲವಾಗಿದೆ.`;
    shaniStatusEn = `Saturn is transiting House ${shaniHouseFromMoon} from your Moon (Sade Sati phase), demanding disciplined karma and patience.`;
  } else if (shaniHouseFromMoon === 8) {
    shaniStatusKn = `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ 8ನೇ ಸ್ಥಾನದಲ್ಲಿ (ಅಷ್ಟಮ ಶನಿ) ಸಂಚರಿಸುತ್ತಿದ್ದು, ಆರೋಗ್ಯ ಮತ್ತು ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕತೆ ಹಾಗೂ ಶಾಂತಿ ಪೂಜೆ ಅಗತ್ಯ.`;
    shaniStatusEn = `Saturn is transiting House 8 from Moon (Ashtama Shani), requiring protective remedies and health vigilance.`;
  } else if (shaniHouseFromMoon === 4) {
    shaniStatusKn = `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ 4ನೇ ಮನೆಯಲ್ಲಿ (ಅರ್ಧಾಷ್ಟಮ / ಕಂಟಕ ಶನಿ) ಸ್ಥಿತನಾಗಿದ್ದು, ಕೌಟುಂಬಿಕ ಹಾಗೂ ಗೃಹ ವಿಚಾರಗಳಲ್ಲಿ ಸಂಯಮದ ಅಗತ್ಯವಿದೆ.`;
    shaniStatusEn = `Saturn is transiting House 4 from Moon (Kantaka Shani), calling for domestic patience and mindfulness.`;
  } else if ([3, 6, 11].includes(shaniHouseFromMoon)) {
    shaniStatusKn = `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ ${shaniHouseFromMoon}ನೇ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಶತ್ರು ಜಯ, ಕಾರ್ಯಸಿದ್ಧಿ ಮತ್ತು ದೃಢ ಸಂಕಲ್ಪಕ್ಕೆ ಅಪಾರ ಬಲ ನೀಡುತ್ತಿದ್ದಾನೆ.`;
    shaniStatusEn = `Saturn is transiting House ${shaniHouseFromMoon} from Moon (Upachaya strength), granting victory over challenges and enduring success.`;
  } else {
    shaniStatusKn = `ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ ${shaniHouseFromMoon}ನೇ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಮತ್ತು ಸತ್ಯವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ.`;
    shaniStatusEn = `Saturn is transiting House ${shaniHouseFromMoon} from Moon, strengthening responsibility and ethical resolve.`;
  }

  const summaryKn = `${guruStatusKn} ${shaniStatusKn}`;
  const summaryEn = `${guruStatusEn} ${shaniStatusEn}`;

  return {
    guruHouseFromMoon,
    shaniHouseFromMoon,
    rahuHouseFromMoon,
    ketuHouseFromMoon,
    guruStatusKn,
    guruStatusEn,
    shaniStatusKn,
    shaniStatusEn,
    summaryKn,
    summaryEn
  };
};

export const generate10MasterLifeBulletPoints = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; gender?: string; devoteeName?: string },
  prescriptions: AstrologicalPrescriptions,
  age: number,
  maha: PlanetName,
  bhukti: PlanetName,
  dashaTiming?: DynamicDashaTiming,
  liveGochara?: LiveGocharaAnalysis
): MasterLifeBulletPoint[] => {
  const ageDecimal = ageDecimalYearsAt(context.birthDate, context.birthTime, context.latitude, context.longitude, new Date());
  const dt = dashaTiming || calculateDynamicDashaTiming(kundli, ageDecimal);
  const lg = liveGochara || calculateLiveGochara(kundli, context);

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

  // 3. Social & Family Dynamics (Dynamic 3rd & 11th House Integration)
  const h3Planets = kundli.planets.filter((p) => p.house === 3);
  const h11Planets = kundli.planets.filter((p) => p.house === 11);
  const h3PlanetsKn = h3Planets.map((p) => toKannadaPlanet(p.name)).join(", ") || `${toKannadaPlanet(thirdLord)} ಅಧಿಪತ್ಯ`;
  const h11PlanetsKn = h11Planets.map((p) => toKannadaPlanet(p.name)).join(", ") || `${toKannadaPlanet(eleventhLord)} ಅಧಿಪತ್ಯ`;

  const p3ReadingKn = age < 23
    ? `ನಿಮ್ಮ 3ನೇ ಸಹೋದರ/ಮಿತ್ರ ಸ್ಥಾನದಲ್ಲಿ ${h3PlanetsKn} ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${h11PlanetsKn} ಪ್ರಭಾವವಿದೆ. ನೀವು ಮನೆಯಲ್ಲಿ ಕೇವಲ ಸೀಮಿತವಾಗಿ ಕುಳಿತುಕೊಳ್ಳುವುದಕ್ಕಿಂತ ಸಮಾನ ಮನಸ್ಕ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಬೆರೆಯಲು ಹೆಚ್ಚು ಇಷ್ಟಪಡುತ್ತೀರಿ. ಮನೆಯಲ್ಲಿ ಹಿರಿಯರು ನಿಮ್ಮ ಗೆಳೆತನ ಅಥವಾ ದಿನಚರಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿದಾಗ ಸಣ್ಣ ಸಿಟ್ಟು ಅಥವಾ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಮೂಡುವುದು ಸಹಜ; ಆದರೆ ನಂಬಿದ ಸ್ನೇಹಿತರಿಗೆ ಎಂದಿಗೂ ದ್ರೋಹ ಮಾಡದ ಅಪಾರ ನಿಷ್ಠೆ ನಿಮ್ಮಲ್ಲಿದೆ.`
    : `ನಿಮ್ಮ 3ನೇ ಭಾವದ (${h3PlanetsKn}) ಧೈರ್ಯ ಮತ್ತು 11ನೇ ಭಾವದ (${h11PlanetsKn}) ಸಾಮಾಜಿಕ ಬಲದಿಂದ, ನೀವು ಎಲ್ಲರೊಂದಿಗೂ ಬೆರೆಯುವ ಬದಲು ಕೆಲವೇ ಆಪ್ತ ಹಾಗೂ ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಕ್ತಿಗಳನ್ನು ಮಾತ್ರ ಹತ್ತಿರ ಸೇರಿಸುತ್ತೀರಿ. ಕುಟುಂಬದ ಗೌರವಕ್ಕೆ ಸದಾ ರಕ್ಷಾ ಕವಚವಾಗಿ ನಿಲ್ಲುವ ನೀವು, ನಿಮ್ಮ ಮನೆಯ ಆಂತರಿಕ ಸ್ವಾತಂತ್ರ್ಯದಲ್ಲಿ ಹೊರಗಿನವರ ಹಸ್ತಕ್ಷೇಪವನ್ನು ಎಂದಿಗೂ ಸಹಿಸುವುದಿಲ್ಲ.`;

  const p3ReadingEn = age < 23
    ? `Influenced by 3rd house (${h3Planets.map(p => p.name).join(", ") || thirdLord}) and 11th house (${h11Planets.map(p => p.name).join(", ") || eleventhLord}), you naturally gravitate towards peer circles and active pursuits rather than remaining confined indoors. While family inquiries may cause quick defensive reactions, your loyalty to genuine peers is absolute.`
    : `Governed by 3rd and 11th houses (${thirdLord}/${eleventhLord}), you maintain a selective, deeply trusted inner circle. Fiercely protective of household autonomy, you never tolerate external intrusion into personal affairs.`;

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

  // 6. Wealth & Finances (Dynamic Dhana Yoga vs Leakage Check)
  const secondLordPlanet = kundli.planets.find((p) => p.name === secondLord);
  const eleventhLordPlanet = kundli.planets.find((p) => p.name === eleventhLord);
  const isDhanaAuspicious = (secondLordPlanet && [1, 2, 4, 5, 7, 9, 10, 11].includes(secondLordPlanet.house)) ||
                            (eleventhLordPlanet && [1, 2, 4, 5, 7, 9, 10, 11].includes(eleventhLordPlanet.house));
  const hasWealthLeakage = (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house)) ||
                           (eleventhLordPlanet && [6, 8, 12].includes(eleventhLordPlanet.house)) ||
                           (rahu && [2, 12].includes(rahu.house));

  const p6ReadingKn = isDhanaAuspicious && !hasWealthLeakage
    ? `ನಿಮ್ಮ 2ನೇ ಧನ ಸ್ಥಾನದ ಅಧಿಪತಿ ${secondLordKn} ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಅಧಿಪತಿ ${eleventhLordKn} ಶುಭ ಕೇಂದ್ರ/ತ್ರಿಕೋಣ ಬಲದಲ್ಲಿದ್ದಾರೆ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ನಿರಂತರ ಧನಾರ್ಜನೆ ಹಾಗೂ ಆಸ್ತಿ ನಿರ್ಮಾಣದ ಪ್ರಬಲ ಧನ ಯೋಗವಿದೆ. ನಿಮ್ಮ ದೃಢ ಪರಿಶ್ರಮ ಮತ್ತು ಆರ್ಥಿಕ ಶಿಸ್ತಿನಿಂದಾಗಿ ದೀರ್ಘಕಾಲಿಕ ಹೂಡಿಕೆಗಳು, ಸ್ಥಿರ ಆಸ್ತಿ ಮತ್ತು ಬಂಗಾರದ ರೂಪದಲ್ಲಿ ಸಂಪತ್ತು ಸಮೃದ್ಧವಾಗಿ ವೃದ್ಧಿಯಾಗಲಿದೆ.`
    : `ನಿಮ್ಮ 2ನೇ ಧನ ಸ್ಥಾನದ ಅಧಿಪತಿ ${secondLordKn} ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಅಧಿಪತಿ ${eleventhLordKn} ಆಗಿದ್ದಾರೆ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಧನಾಗಮನದ ಶಕ್ತಿ ದೃಢವಾಗಿದೆ; ಆದಾಗ್ಯೂ ಕೈಗೆ ಬಂದ ಹಣವು ಅನಿರೀಕ್ಷಿತ ಕೌಟುಂಬಿಕ ಅಗತ್ಯಗಳು, ವಾಹನ ಅಥವಾ ಆಪ್ತರ ಸಹಾಯಕ್ಕಾಗಿ ಖರ್ಚಾಗುವ (ಧನ ಸೋರಿಕೆ) ಪ್ರವೃತ್ತಿ ಇದೆ. ನಗದನ್ನು ಹಾಗೆಯೇ ಇಟ್ಟುಕೊಳ್ಳುವ ಬದಲು ಸ್ಥಿರ ಆಸ್ತಿ, ಬಂಗಾರ ಅಥವಾ ದೀರ್ಘಕಾಲಿಕ ಉಳಿತಾಯದಲ್ಲಿ ಪರಿವರ್ತಿಸುವುದರಿಂದ ನಿಮ್ಮ ಧನಕೋಶವು ಸದಾ ತುಂಬಿರುತ್ತದೆ.`;

  const p6ReadingEn = isDhanaAuspicious && !hasWealthLeakage
    ? `With 2nd lord ${secondLord} and 11th lord ${eleventhLord} situated in favorable Kendra/Trikona houses, your horoscope forms a potent Dhana Yoga ensuring continuous capital accretion and steady asset building through long-term real estate or precious investments.`
    : `With 2nd lord ${secondLord} and 11th lord ${eleventhLord}, your earning capability is strong, but capital tends to disperse into unexpected family obligations. Converting liquid savings into tangible real estate or gold safeguards long-term security.`;

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

  // 8. Health & Physical Vitality (Dynamic Tatva Constitution)
  const tatvaIndex = lagnaIdx % 4; // 0: Agni, 1: Prithvi, 2: Vayu, 3: Jala
  const tatvaDetails = [
    {
      tatvaKn: "ಅಗ್ನಿ ತತ್ವ (ಪಿತ್ತ ಪ್ರಧಾನ)",
      tatvaEn: "Agni / Fire (Pitta Predominant)",
      healthAdviceKn: "ದೇಹದಲ್ಲಿ ಉಷ್ಣಾಧಿಕ್ಯ, ತಲೆಬಿಸಿ, ಆಮ್ಲಪಿತ್ತ ಅಥವಾ ರಕ್ತದೊತ್ತಡದ ಏರಿಳಿತಗಳು ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ನಿತ್ಯ ಶೀತಲೀ ಪ್ರಾಣಾಯಾಮ, ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯುವುದು ಹಾಗೂ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರದಿಂದ ಆರೋಗ್ಯ ಸದೃಢವಾಗಿರುತ್ತದೆ.",
      healthAdviceEn: "Predominance of fiery Pitta element indicates occasional acidity, heat intolerance, or stress headaches. Morning hydration and cooling breathwork ensure vitality."
    },
    {
      tatvaKn: "ಪೃಥ್ವಿ ತತ್ವ (ಕಫ-ವಾತ ಮಿಶ್ರಣ)",
      tatvaEn: "Prithvi / Earth (Kapha-Vata Balance)",
      healthAdviceKn: "ದೇಹವು ಸ್ವಾಭಾವಿಕವಾಗಿ ಗಟ್ಟಿಮುಟ್ಟಾಗಿದ್ದರೂ, ಮೈಭಾರ, ಕೀಲುಗಳಲ್ಲಿ ಜಡತ್ವ ಅಥವಾ ಜೀರ್ಣಾಂಗ ಅಗ್ನಿಮಾಂದ್ಯತೆ ಆಗಾಗ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ನಿತ್ಯ ಲಘು ನಡಿಗೆ, ಸಾತ್ವಿಕ ಬಿಸಿ ಆಹಾರ ಹಾಗೂ ಸಕಾಲಿಕ ದಿನಚರಿ ಅತ್ಯಂತ ಹಿತಕರ.",
      healthAdviceEn: "Earthy constitution confers solid stamina though sluggish digestion or joint stiffness requires active physical exercise and light, warm meals."
    },
    {
      tatvaKn: "ವಾಯು ತತ್ವ (ವಾತ ಪ್ರಧಾನ)",
      tatvaEn: "Vayu / Air (Vata Predominant)",
      healthAdviceKn: "ಅತಿಯಾದ ಆಲೋಚನೆ, ನರಗಳ ಆಯಾಸ, ವಾಯು ಬಾಧೆ (Gas/Bloating) ಅಥವಾ ಅನಿಶ್ಚಿತ ನಿದ್ರೆ ಉಂಟಾಗಬಹುದು. ಎಣ್ಣೆ ಮಸಾಜ್ (ಅಭ್ಯಂಗ), ನಿಯಮಿತ ಸಮಯಕ್ಕೆ ಊಟ ಮತ್ತು ಧ್ಯಾನದಿಂದ ನರಮಂಡಲವು ಶಾಂತವಾಗುತ್ತದೆ.",
      healthAdviceEn: "Airy Vata constitution predisposes to restless mental energy, nervous strain, or irregular sleep. Warm oil massages and regular grounding routines restore balance."
    },
    {
      tatvaKn: "ಜಲ ತತ್ವ (ಜಲ-ಕಫ ಪ್ರಧಾನ)",
      tatvaEn: "Jala / Water (Kapha-Pitta Dominance)",
      healthAdviceKn: "ಭಾವನಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆ, ಶೀತ, ಕಫ ಅಥವಾ ನೀರಿನಂಶದ ವ್ಯತ್ಯಾಸಗಳು ಶರೀರವನ್ನು ಬಾಧಿಸಬಹುದು. ಸೂರ್ಯ ಪ್ರಕಾಶದಲ್ಲಿ ವ್ಯಾಯಾಮ, ಜೇನುತುಪ್ಪದೊಂದಿಗೆ ಬೆಚ್ಚಗಿನ ನೀರು ಸೇವನೆ ನಿಮ್ಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      healthAdviceEn: "Watery constitution brings emotional sensitivity and fluid retention tendencies. Sun exposure, warm herbal infusions, and brisk exercise boost immunity."
    }
  ][tatvaIndex]!;

  const p8ReadingKn = `ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಮತ್ತು 6ನೇ ರೋಗ ಸ್ಥಾನದ ${sixthLordKn} ಗ್ರಹಬಲದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಮೂಲ ಪ್ರಕೃತಿಯು ${tatvaDetails.tatvaKn} ಆಗಿದೆ. ${tatvaDetails.healthAdviceKn}`;
  const p8ReadingEn = `Governed by Lagna lord ${lagnaLord} and 6th lord ${sixthLord}, your constitutional balance is predominantly ${tatvaDetails.tatvaEn}. ${tatvaDetails.healthAdviceEn}`;

  // 9. Active Dasha-Bhukti & Gochara (100% Live & Dynamic)
  const p9ReadingKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(maha)} ಮಹಾದಶೆಯ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯ ಕಾಲಾವಧಿಯು (${dt.timelineKn} ಮುಕ್ತಾಯ) ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ಪರಿವರ್ತನಾ ಸಂಧಿಕಾಲವಾಗಿದೆ. ${lg.summaryKn} ಈ ಗ್ರಹ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಹಳೆಯ ಸಂಕೋಲೆಗಳನ್ನು ಕಳಚಿ ನೂತನ ಶಕ್ತಿಯನ್ನು ತುಂಬುವ ಪವಿತ್ರ ಸಂಧಿಕಾಲವಾಗಿದೆ.`;

  const p9ReadingEn = `The ongoing ${maha} Mahadasha with ${bhukti} Antardasha (${dt.timelineEn}) represents a pivotal transformative threshold. ${lg.summaryEn} This planetary alignment clears karmic backlogs to usher in renewed clarity.`;

  // 10. Turning Point Timeline & Authentic Vedic Remedies (100% Dynamic)
  const nextBhuktiNoticeKn = dt.nextBhukti
    ? `ಪ್ರಸ್ತುತ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯು ಮುಕ್ತಾಯವಾಗಿ ಮುಂಬರುವ ${toKannadaPlanet(dt.nextBhukti)} ಭುಕ್ತಿಯ ನೂತನ ಶಕ್ತಿಯು ಆರಂಭವಾಗಲಿದೆ.`
    : `ಪ್ರಸ್ತುತ ದಶಾ ಸಂಧಿಕಾಲವು ಮುಕ್ತಾಯವಾಗಿ ನೂತನ ಗ್ರಹಬಲ ಆರಂಭವಾಗಲಿದೆ.`;
  const nextBhuktiNoticeEn = dt.nextBhukti
    ? `As the current ${bhukti} Antardasha concludes, the incoming ${dt.nextBhukti} Antardasha will unleash fresh breakthrough energy.`
    : `As the transition culminates, incoming planetary forces will activate fresh opportunities.`;

  const p10ReadingKn = `ನಿಮ್ಮ ಜಾತಕ ಗಣಿತದ ಪ್ರಕಾರ, ${dt.timelineKn} (${dt.timelineEn}) ಬೃಹತ್ ಸಕಾರಾತ್ಮಕ ಗ್ರಹಗತಿಯ ತಿರುವು ನಿಖರವಾಗಿ ಘಟಿಸಲಿದೆ. ${nextBhuktiNoticeKn} ಈ ಶುಭ ಕಾಲದ ಸಿದ್ಧಿಗಾಗಿ, ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನಾಧಿಪತಿಯ ${gemName} (${gemCarat}) ರತ್ನವನ್ನು ${gemMetal}ದಲ್ಲಿ ಮಾಡಿಸಿ ${gemFinger}ದಲ್ಲಿ ${prescriptions?.gemstoneRing?.activationDay || "ಶುಭ ದಿನ"} ಧರಿಸಿ. ಇದರೊಂದಿಗೆ ${rudraName} ಧಾರಣೆ ಮಾಡಿ ಹಾಗೂ ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಮ್ಮ ನಕ್ಷತ್ರದ ಹೆಸರಿನಲ್ಲಿ ${prescriptions?.shantiPooja?.nameKn || "ದೋಷ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಪೂಜೆ"} ಸಲ್ಲಿಸಿ. ಈ ದೈವಿಕ ಜಪ ಮತ್ತು ಪೂಜೆಯು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ಪರಮ ಶಾಂತಿ ಹಾಗೂ ಪ್ರಗತಿಯನ್ನು ತರಲಿದೆ.`;

  const p10ReadingEn = `Mathematical calculations project a major positive astrological turning point ${dt.timelineEn}. ${nextBhuktiNoticeEn} To accelerate this breakthrough, wear an energized ${gemEn} (${gemCarat}) in ${prescriptions?.gemstoneRing?.metalEn || "Gold"} on the ${prescriptions?.gemstoneRing?.fingerEn || "Ring finger"} and adorn ${rudraEn}. Performing ${prescriptions?.shantiPooja?.nameEn || "Sankalpa Pooja"} at Sri Kshetra Gokarna Mahabaleshwara dissolves obstacles and brings deep serenity and progress.`;

  // 11. Secret Life, Hidden Desires, Addictions & Shadow Tendencies
  const isOpenLagna = [0, 2, 4, 8].includes(lagnaIdx);
  const isSecretLagna = [3, 7, 11].includes(lagnaIdx) || (rahu && [8, 12].includes(rahu.house)) || (saturn && [8, 12].includes(saturn.house));
  const venusH = venus?.house ?? 1;
  const hasSensualAffliction = [7, 8, 12].includes(venusH) || (rahu && [7, 8, 12].includes(rahu.house)) || (mars && venus && Math.abs(mars.house - venus.house) <= 1);
  const hasAddictionRisk = (rahu && [2, 8, 12].includes(rahu.house)) || (saturn && [2, 8].includes(saturn.house));
  const hasIllegalRisk = (rahu && [8, 11].includes(rahu.house)) || (mars && mars.house === 8);
  const hasDarkThoughtLoops = (moon && [6, 8, 12].includes(moon.house)) || (moon && rahu && Math.abs(moon.house - rahu.house) === 0) || (moon && saturn && Math.abs(moon.house - saturn.house) === 0);

  const secrecyHabitTextKn = isOpenLagna && !isSecretLagna
    ? "ವರ್ತನೆಯ ಸ್ವಭಾವ: ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ — ಯಾವುದೇ ತಪ್ಪು ಹೆಜ್ಜೆ, ದುಶ್ಚಟ ಅಥವಾ ರಹಸ್ಯಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಮುಚ್ಚಿಡಲಾರದೆ, ಆಪ್ತ ಸ್ನೇಹಿತರ ಬಳಿ ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳುವ ಸ್ವಭಾವವಿದೆ."
    : "ವರ್ತನೆಯ ಸ್ವಭಾವ: ಅತ್ಯಂತ ಗೌಪ್ಯ — ಸಮಾಜದಲ್ಲಿ ಸಭ್ಯ ಮತ್ತು ಶಾಂತ ಮುಖವಾಡ ಧರಿಸಿ, ಒಳಗಿನ ಕಾಮನೆಗಳು, ದುಶ್ಚಟ ಅಥವಾ ತಪ್ಪುಗಳನ್ನು ಹೆಂಡತಿ ಮತ್ತು ಪರಮ ಆಪ್ತರಿಗೂ ಕಿಂಚಿತ್ತೂ ಸುಳಿವು ನೀಡದೆ ಮುಚ್ಚಿಡುವ ಚಾಣಾಕ್ಷತೆ ಇದೆ.";

  const secrecyHabitTextEn = isOpenLagna && !isSecretLagna
    ? "Behavioral Pattern: Open & Expressive — Cannot keep secrets long; shares mistakes, vices, or relations openly with friends."
    : "Behavioral Pattern: Deep Concealment — Keeps sensual attractions, vices, and shadow thoughts strictly hidden from spouse and friends.";

  const p11ReadingKn = `ನಿಮ್ಮ ಕುಂಡಲಿಯ 8ನೇ (ಗುಪ್ತ/ರಹಸ್ಯ), 12ನೇ (ಶಯನ ಸುಖ/ವ್ಯಸನ) ಹಾಗೂ 7ನೇ ಕಾಮ ಸ್ಥಾನದ ಸೂಕ್ಷ್ಮ ಗ್ರಹಸ್ಥಿತಿಯನ್ನು ನೋಡಿದಾಗ: ${
    hasSensualAffliction 
      ? "ಶುಕ್ರ-ರಾಹುಗಳ ಸಂಚಾರದಿಂದಾಗಿ ಹೊರಗಿನ ವ್ಯಕ್ತಿಗಳ ಕಡೆಗೆ ಲೈಂಗಿಕ ಆಕರ್ಷಣೆ, ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ಸಂಬಂಧಗಳ ವ್ಯಾಮೋಹ ಅಥವಾ ಅತಿಯಾದ ಕಾಮ ಪ್ರಚೋದನೆಗಳ ಆಂತರಿಕ ಸೆಳೆತ ಉಂಟಾಗಬಹುದು. " 
      : "ದಾಂಪತ್ಯದಲ್ಲಿ ಗೌರವ ಕಾಪಾಡಿಕೊಳ್ಳುವ ಇಚ್ಛೆ ಇದ್ದರೂ ಲೈಂಗಿಕ ಅಸಮಾಧಾನ ಮೂಡಿದಾಗ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ತೀವ್ರ ಹಂಬಲ ಮೂಡುತ್ತದೆ. "
  }${
    hasAddictionRisk
      ? "2ನೇ ಮುಖ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು-ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಮಾನಸಿಕ ಒತ್ತಡದ ಸಮಯದಲ್ಲಿ ಮದ್ಯಪಾನ, ಧೂಮಪಾನ, ಮಾದಕ ವಸ್ತುಗಳು ಅಥವಾ ದುಶ್ಚಟಗಳಿಗೆ ಸುಲಭವಾಗಿ ಜಾರುವ ಪ್ರವೃತ್ತಿ ಕಾಣಿಸುತ್ತದೆ. "
      : "ಸ್ನೇಹಿತರ ಸಹವಾಸ ಅಥವಾ ಒತ್ತಡದಿಂದ ದುಂದುವೆಚ್ಚ ಮತ್ತು ಕ್ಷಣಿಕ ಸುಖದ ದುಶ್ಚಟಗಳ ಸೆಳೆತ ಉಂಟಾಗಬಹುದು. "
  }${
    hasIllegalRisk
      ? "8ನೇ ಭಾವದ ನೆರಳು ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದ ಸುಲಭವಾಗಿ ಹಣ ಗಳಿಸುವ ಅಕ್ರಮ, ಕಳ್ಳಸಾಗಾಣಿಕೆ ಅಥವಾ ರಿಸ್ಕ್ ವ್ಯವಹಾರಗಳ ದುಸ್ಸಾಹಸಕ್ಕೆ ಮನಸ್ಸು ಹಾತೊರೆಯಬಹುದು; ಇದರಿಂದ ದೂರವಿರುವುದು ಲೇಸು. "
      : ""
  }${
    hasDarkThoughtLoops
      ? "ಮನಃಕಾರಕ ಚಂದ್ರನ ಮೇಲಿನ ರಾಹು-ಶನಿ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಕತ್ತಲೆಯ ನಕಾರಾತ್ಮಕ ಆಲೋಚನೆಗಳು, ಅನುಮಾನ ಹಾಗೂ ಸೇಡಿನ ಚಿಂತನೆಗಳು ಸುಳಿಯಬಹುದು. "
      : ""
  }${secrecyHabitTextKn} ಈ ನೆರಳು ದೋಷಗಳ ಶಮನಕ್ಕಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯಗತ್ಯ.`;

  const p11ReadingEn = `Planetary scrutiny of the 8th (secrets), 12th (bed pleasures/substances), and 7th (sensual desires) houses reveals: ${
    hasSensualAffliction
      ? "Venus-Rahu tensions generate vulnerability to external sensual attractions, clandestine affairs, or intense erotic impulses. "
      : "Sensual impulses are kept bounded by social reputation though romantic restlessness surfaces during marital friction. "
  }${
    hasAddictionRisk
      ? "2nd house affliction induces escapism through alcohol, smoking, or intoxicating substances under emotional duress. "
      : "Social peer pressure occasionally tempts impulsive indulgences. "
  }${
    hasIllegalRisk
      ? "The 8th house shadow triggers dangerous curiosity toward high-risk, speculative, or illicit shortcut wealth. "
      : ""
  }${
    hasDarkThoughtLoops
      ? "Lunar afflictions generate cyclical brooding, suspicion, and dark thoughts. "
      : ""
  }${secrecyHabitTextEn} Remedial Atma Linga Prayashchitta Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara cleanses these shadow karmas.`;

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
      badgeKn: `${lagnaKn} ಲಗ್ನ • ${tatvaDetails.tatvaKn}`,
      badgeEn: `${lagnaEn} Lagna • ${tatvaDetails.tatvaEn}`,
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
      badgeKn: `${dt.badgeTimelineKn} • ಗೋಕರ್ಣ ಸೇವೆ`,
      badgeEn: `${dt.badgeTimelineEn} • Gokarna Seva`,
      badgeHi: dt.badgeTimelineEn,
      badgeTe: dt.badgeTimelineEn,
      badgeTa: dt.badgeTimelineEn,
      icon: "🪔",
      readingKn: p10ReadingKn,
      readingEn: p10ReadingEn,
      readingHi: p10ReadingEn,
      readingTe: p10ReadingEn,
      readingTa: p10ReadingEn,
      astrologicalBasisKn: `ಪಂಚಾಂಗ ಪಂಚ ಅಂಗಗಳ ಸಮನ್ವಯ, ${gemName} ರತ್ನ, ${rudraName} ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ.`,
      astrologicalBasisEn: `Panchanga 5-Angas synthesis, energized ${gemEn}, ${rudraEn}, and Sri Gokarna Mahabaleshwara blessings.`
    },
    {
      id: 11,
      category: "shadow",
      titleKn: "ರಹಸ್ಯ ನಡವಳಿಕೆ, ಅಂತರ್ಗತ ಕಾಮನೆಗಳು & ನೆರಳು ಪ್ರವೃತ್ತಿಗಳು",
      titleEn: "Secret Life, Hidden Desires, Addictions & Shadow Tendencies",
      titleHi: "गुप्त जीवन, गुप्त कामनाएं और व्यसन",
      titleTe: "రహస్య జీవితం, అంతర్గత కోరికలు & వ్యసనాలు",
      titleTa: "ரகசிய வாழ்க்கை மற்றும் மறைக்கப்பட்ட ஆசைகள்",
      badgeKn: "8ನೇ & 12ನೇ ರಹಸ್ಯ ಭಾವ • ನೆರಳು ಗ್ರಹಗಳು",
      badgeEn: "8th & 12th Houses • Shadow Grahas",
      badgeHi: "अष्टम एवं द्वादश भाव",
      badgeTe: "8వ & 12వ స్థానాలు",
      badgeTa: "8 & 12ஆம் இடங்கள்",
      icon: "🔒",
      readingKn: p11ReadingKn,
      readingEn: p11ReadingEn,
      readingHi: p11ReadingEn,
      readingTe: p11ReadingEn,
      readingTa: p11ReadingEn,
      astrologicalBasisKn: "8ನೇ (ಗುಪ್ತ/ರಹಸ್ಯ), 12ನೇ (ಶಯನ ಸುಖ/ವ್ಯಸನ), 7ನೇ ಭಾವ (ಕಾಮನೆ) ಹಾಗೂ ರಾಹು-ಶುಕ್ರ-ಶನಿ ಗ್ರಹಸ್ಥಿತಿ.",
      astrologicalBasisEn: "8th (secrets), 12th (bed pleasures/substances), 7th (sensual desires), and Rahu-Venus-Saturn transit tension.",
      doshaSpecifics: {
        hasDosha: true,
        doshaNameKn: "ಅಂತರ್ಗತ ನೆರಳು & ರಹಸ್ಯ ದೋಷ",
        doshaNameEn: "Shadow Impulses & Secret Vulnerabilities",
        rootCauseHouseKn: "8ನೇ & 12ನೇ ಭಾವದಲ್ಲಿ ನೆರಳು ಗ್ರಹಗಳ ಪ್ರಭಾವ",
        rootCauseHouseEn: "8th & 12th House Afflictions by Malefics",
        afflictedPlanetKn: "ರಾಹು-ಶುಕ್ರ-ಶನಿ",
        afflictedPlanetEn: "Rahu-Venus-Saturn",
        mantraKn: "ಓಂ ನಮಃ ಶಿವಾಯ (ದಿನನಿತ್ಯ 108 ಬಾರಿ) & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ",
        mantraEn: "Om Namah Shivaya (Daily 108 Times) & Maha Mrityunjaya Mantra",
        pujaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ & ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ",
        pujaEn: "Atma Linga Sparsha & Prayashchitta Sankalpa Seva at Gokarna Mahabaleshwara"
      }
    }
  ];
};

export const generateGoodAndBadTraits = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; gender?: string; devoteeName?: string },
  maha: PlanetName,
  bhukti: PlanetName,
  prescriptions: AstrologicalPrescriptions,
  devoteeAge: number
): GoodBadTraitAnalysis => {
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
  const seventhLordKn = toKannadaPlanet(seventhLord);
  const eighthLordKn = toKannadaPlanet(eighthLord);
  const eleventhLordKn = toKannadaPlanet(eleventhLord);

  const secondLordPlanet = kundli.planets.find((p) => p.name === secondLord);
  const seventhLordPlanet = kundli.planets.find((p) => p.name === seventhLord);
  const eighthLordPlanet = kundli.planets.find((p) => p.name === eighthLord);

  // Exact Vedic house distance helper (1 to 12)
  const houseDist = (fromH: number, toH: number) => ((toH - fromH + 12) % 12) + 1;

  // Age determination: Child (< 14) vs Adult (>= 14)
  const isChild = devoteeAge < 14;
  const isMale = (context.gender || "Male").toLowerCase() === "male";

  // Secrecy determination: Fiery/Open signs [0, 2, 4, 8] vs Watery/Secret signs [3, 7, 11] or 8th/12th
  const isOpenSign = [0, 2, 4, 8].includes(lagnaIdx);
  const isSecretSign = [3, 7, 11].includes(lagnaIdx) || (rahu && [8, 12].includes(rahu.house)) || (saturn && [8, 12].includes(saturn.house));

  const secrecyKn = isOpenSign && !isSecretSign
    ? "🗣️ ವರ್ತನೆ: ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ — ಯಾವುದೇ ತಪ್ಪು ಹೆಜ್ಜೆ, ದುಶ್ಚಟ ಅಥವಾ ರಹಸ್ಯಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಹೆಚ್ಚು ಕಾಲ ಅದುಮಿಟ್ಟುಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗದೆ, ಆಪ್ತ ಸ್ನೇಹಿತರ ಬಳಿ ಮುಕ್ತವಾಗಿ ಹೇಳಿಕೊಳ್ಳುವ ಸ್ವಭಾವ."
    : "🔒 ವರ್ತನೆ: ಸಂಪೂರ್ಣ ಗೌಪ್ಯ ಪ್ರವೃತ್ತಿ — ಸಮಾಜದಲ್ಲಿ ಸಭ್ಯ ಮತ್ತು ಶಾಂತ ಮುಖವಾಡ ಧರಿಸಿ, ಒಳಗಿನ ಕಾಮನೆಗಳು, ದುಶ್ಚಟ ಅಥವಾ ತಪ್ಪು ಹೆಜ್ಜೆಗಳನ್ನು ಹೆಂಡತಿ, ಪೋಷಕರು ಮತ್ತು ಆಪ್ತ ಸ್ನೇಹಿತರಿಗೂ ಕಿಂಚಿತ್ತೂ ತಿಳಿಯದಂತೆ ಅತ್ಯಂತ ಗುಪ್ತವಾಗಿ ಮುಚ್ಚಿಡುವ ಚಾಣಾಕ್ಷತೆ.";

  const secrecyEn = isOpenSign && !isSecretSign
    ? "Open & Expressive Habit: Cannot hold vices or secrets inside; confesses or shares openly with close friends."
    : "Deep Concealment Habit: Maintains a pristine social mask while keeping shadow indulgences, affairs, or vices strictly concealed from spouse and closest friends.";

  // =========================================================================
  // CHILD PROFILE (< 14 Years): Focus on Balarishta, Crying, Tantrums & Schooling
  // =========================================================================
  if (isChild) {
    const childGoodTraits: TraitBulletPoint[] = [
      {
        id: 1,
        type: "good",
        titleKn: "ದೈವಿಕ ತೇಜಸ್ಸು & ಆಕರ್ಷಕ ಮುಖಲಕ್ಷಣ: ಎಲ್ಲರನ್ನೂ ಸೆಳೆಯುವ ಮುದ್ದಾದ ಕಂದ",
        titleEn: "Divine Radiance & Inherent Charm",
        icon: "🌟",
        badgeKn: `ಲಗ್ನ: ${lagnaKn} • ${lagnaLordKn}`,
        badgeEn: `Lagna: ${lagnaEn} • ${lagnaLord}`,
        bulletKn: `ಮಗುವಿನ ${lagnaKn} ಲಗ್ನದ ತೇಜಸ್ಸಿನಿಂದಾಗಿ ಮುಖದಲ್ಲಿ ಸಹಜ ದೈವಿಕ ಆಕರ್ಷಣೆ ಇದೆ. ಕುಟುಂಬದ ಹಿರಿಯರು ಮತ್ತು ಬಂಧುಗಳನ್ನು ತನ್ನತ್ತ ಸೆಳೆಯುವ ಮುಗ್ಧತೆ ಹಾಗೂ ಅಕ್ಕರೆಯ ಸದ್ಗುಣ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `Endowed with the natural brilliance of ${lagnaEn} Ascendant, the child possesses an endearing charm that effortlessly attracts affection from family and elders.`,
        astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಗ್ರಹಬಲ.`,
        astrologicalBasisEn: `Ascendant lord ${lagnaLord} strength in 1st house.`
      },
      {
        id: 2,
        type: "good",
        titleKn: "ಚುರುಕಾದ ಗ್ರಹಿಕೆ & ಜಾಣ್ಮೆ: ಹೊಸ ವಿಷಯಗಳನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಕಲಿಯುವ ಬುದ್ಧಿ",
        titleEn: "Quick Cognitive Grasp & Inherent Intelligence",
        icon: "🧠",
        badgeKn: `5ನೇ ಬುದ್ಧಿ ಭಾವ • ${fifthLordKn}`,
        badgeEn: `5th Intellect • ${fifthLord}`,
        bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ${fifthLordKn} ಬಲವಿರುವುದರಿಂದ ಮಗು ಹೊಸ ಶಬ್ದಗಳು, ಆಟಗಳು ಮತ್ತು ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳನ್ನು ಅತ್ಯಂತ ವೇಗವಾಗಿ ಗ್ರಹಿಸುತ್ತದೆ. ಪ್ರಾಯೋಗಿಕ ಜಾಣ್ಮೆ ಈ ಮಗುವಿನ ವಿಶೇಷ ಗುಣ.`,
        bulletEn: `Governed by 5th lord ${fifthLord}, the child demonstrates sharp observational memory and learns daily activities and words with remarkable speed.`,
        astrologicalBasisKn: `5ನೇ ಭಾವ (ಬುದ್ಧಿ/ವಿದ್ಯಾ ಸ್ಥಾನ) ಹಾಗೂ ಬುಧ-ಗುರು ಕಾರಕತ್ವ.`,
        astrologicalBasisEn: `5th house of intellect ruled by ${fifthLord}.`
      },
      {
        id: 3,
        type: "good",
        titleKn: "ಪೋಷಕರ ಮೇಲಿನ ವಾತ್ಸಲ್ಯ & ಅಕ್ಕರೆ: ತಾಯಿ-ತಂದೆಯ ಪ್ರೀತಿಯ ಅವಿನಾಭಾವ ಬಂಧ",
        titleEn: "Deep Affection for Parents & Emotional Sensitivity",
        icon: "❤️",
        badgeKn: `4ನೇ ಮಾತೃ ಸ್ಥಾನ • ${fourthLordKn}`,
        badgeEn: `4th House • ${fourthLord}`,
        bulletKn: `4ನೇ ಮಾತೃ ಸ್ಥಾನ ಹಾಗೂ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದಾಗಿ, ಮಗು ತಾಯಿಯ ಸಾಮೀಪ್ಯ ಮತ್ತು ಪ್ರೀತಿಯನ್ನು ಅತ್ಯಂತ ಆಳವಾಗಿ ಬಯಸುತ್ತದೆ. ವಾತ್ಸಲ್ಯದ ಸ್ಪರ್ಶದಿಂದ ಮಗು ತ್ವರಿತವಾಗಿ ಶಾಂತವಾಗುತ್ತದೆ.`,
        bulletEn: `Strong 4th house connection establishes a tender emotional bond with parents, especially responding with warmth to a mother's soothing care.`,
        astrologicalBasisKn: `4ನೇ ಮಾತೃ ಸ್ಥಾನ (${fourthLordKn}) ಮತ್ತು ಚಂದ್ರನ ಸ್ಥಿತಿ.`,
        astrologicalBasisEn: `4th house of maternal security ruled by ${fourthLord}.`
      },
      {
        id: 4,
        type: "good",
        titleKn: "ಕಲಾತ್ಮಕ ಆಸಕ್ತಿ & ಸೃಜನಶೀಲ ಕಲ್ಪನೆ: ಆಟಿಕೆಗಳು ಮತ್ತು ಚಿತ್ರಗಳಲ್ಲಿ ನವೀನತೆ",
        titleEn: "Creative Imagination & Playful Curiosity",
        icon: "🎨",
        badgeKn: `3ನೇ ಸಾಹಸ & ಕಲಾ ಭಾವ`,
        badgeEn: `3rd House of Creativity`,
        bulletKn: `ಮಗು ಕೇವಲ ಸಿದ್ಧ ಆಟಿಕೆಗಳಲ್ಲದೆ, ತನ್ನದೇ ಆದ ಕಲ್ಪನೆಯಲ್ಲಿ ಬಣ್ಣಗಳು, ಆಟಿಕೆಗಳು ಹಾಗೂ ಕಥೆಗಳನ್ನು ಜೋಡಿಸುವ ಸೃಜನಶೀಲ ಆಸಕ್ತಿಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`,
        bulletEn: `Expresses imaginative flair during play, exploring shapes, colors, and creative toys with distinctive individual curiosity.`,
        astrologicalBasisKn: `3ನೇ ಭಾವ ಮತ್ತು ಶುಕ್ರ-ಬುಧ ಗ್ರಹಗಳ ಕಲಾತ್ಮಕ ಪ್ರಭಾವ.`,
        astrologicalBasisEn: `3rd house of creative initiative.`
      },
      {
        id: 5,
        type: "good",
        titleKn: "ಕುಲದೇವರ ಕೃಪೆ & ಪೂರ್ವಪುಣ್ಯ ರಕ್ಷೆ: ಆರೋಗ್ಯ ಕಾಪಾಡುವ ದೈವಿಕ ಶಕ್ತಿ",
        titleEn: "Ancestral Karmic Shield & Divine Protection",
        icon: "🪔",
        badgeKn: `9ನೇ ಭಾಗ್ಯ ಸ್ಥಾನ • ದೈವ ರಕ್ಷೆ`,
        badgeEn: `9th Fortune • Divine Shield`,
        bulletKn: `ಪೂರ್ವಪುಣ್ಯದ 9ನೇ ಭಾವದ ಬಲದಿಂದಾಗಿ ಮಗುವಿನ ಮೇಲೆ ಕುಲದೇವರ ಶ್ರೀರಕ್ಷೆ ಇದೆ. ಸಣ್ಣಪುಟ್ಟ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಎದುರಾದರೂ ದೈವಿಕ ರಕ್ಷಾಕವಚವು ಮಗುವನ್ನು ಸದಾ ಕಾಪಾಡುತ್ತದೆ.`,
        bulletEn: `9th house of dharma ensures auspicious ancestral protection, shielding the child's health during vulnerable developmental phases.`,
        astrologicalBasisKn: `9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಗುರು ಕಾರಕತ್ವ.`,
        astrologicalBasisEn: `9th house of dharma and protective trine.`
      }
    ];

    // Child Behavioral & Dosha Analysis
    const moonH = moon?.house ?? 1;
    const hasCryingTantrums = (moon && [6, 8, 12].includes(moon.house)) || (mars && [1, 4, 7, 8].includes(mars.house)) || (rahu && [1, 5, 8].includes(rahu.house));
    const hasEvilEyeDrishti = (rahu && [1, 4, 7, 10].includes(rahu.house)) || (ketu && [1, 7].includes(ketu.house)) || (moon && rahu && Math.abs(moon.house - rahu.house) <= 1);
    const hasAggressionFights = (mars && [1, 3, 6, 8].includes(mars.house)) || (mars && sun && Math.abs(mars.house - sun.house) === 0);
    const hasFoodRefusalColic = [saturn, rahu, mars, ketu].some(p => p && p.house === 2) || (saturn && [3, 7, 10].includes(houseDist(saturn.house, 2))) || (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house));
    const hasSchoolingRestless = (mercury && [6, 8, 12].includes(mercury.house)) || (rahu && mercury && Math.abs(rahu.house - mercury.house) === 0);

    const childBadTraits: TraitBulletPoint[] = [
      {
        id: 1,
        type: "bad",
        titleKn: hasCryingTantrums
          ? "ಬಾಲ ಹಠ, ದಿನವಿಡೀ ಕಿರಿಕಿರಿ & ಅಳು: ಮುಂಜಾನೆಯಿಂದ ಸಂಜೆಯವರೆಗೆ ಸತತ ರೋದನ"
          : "ಸೌಮ್ಯ ಮನೋಭಾವ & ಸಮಾಧಾನದ ನಡವಳಿಕೆ: ಶಾಂತ ಚಿತ್ತದ ಕಂದ",
        titleEn: hasCryingTantrums
          ? "Stubborn Tantrums, Restless Irritation & Persistent Crying"
          : "Gentle Demeanor & Calm Temperament",
        icon: hasCryingTantrums ? "👶" : "🕊️",
        badgeKn: hasCryingTantrums ? "ಚಂದ್ರ-ಕುಜ ದೃಷ್ಟಿ • ಬಾಲಾರಿಷ್ಟ ಪಿತ್ತ" : "ಶುಭ ಚಂದ್ರ • ಸೌಮ್ಯ ತತ್ವ",
        badgeEn: hasCryingTantrums ? "Moon-Mars Tension • Pitta Irritation" : "Benefic Moon • Calm Mind",
        bulletKn: hasCryingTantrums
          ? `ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ಚಂದ್ರನ ಮೇಲೆ ಕುಜ ಅಥವಾ ರಾಹುವಿನ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಶರೀರದಲ್ಲಿ ಪಿತ್ತಾಧಿಕ್ಯ ಹಾಗೂ ನರಗಳ ಅಶಾಂತಿ ಉಂಟಾಗಿ ಮಗು ಸಣ್ಣ ವಿಷಯಕ್ಕೂ ತೀವ್ರ ಹಠ, ದಿನವಿಡೀ ಕಿರಿಕಿರಿ ಮತ್ತು ಮುಂಜಾನೆಯಿಂದ ಸಂಜೆಯವರೆಗೆ ಸತತವಾಗಿ ಅಳುವ (ರೋದನ) ಪ್ರವೃತ್ತಿ ಕಾಣಿಸುತ್ತದೆ. ಎಷ್ಟು ಸಮಾಧಾನಪಡಿಸಿದರೂ ಸಮಾಧಾನವಾಗದೆ ರಂಪಾಟ ಮಾಡುವುದು ಜಾತಕದ ಈ ಗ್ರಹ ಸ್ಥಿತಿಯ ನೇರ ಪರಿಣಾಮವಾಗಿದೆ.`
          : `ಮಗುವಿನ ಚಂದ್ರ ಬಲವು ಸೌಮ್ಯವಾಗಿದ್ದು, ಅನಗತ್ಯ ಹಠ ಅಥವಾ ಸತತ ಅಳುವ ದುಷ್ಪ್ರಭಾವಗಳಿಲ್ಲ. ಪ್ರೀತಿಯಿಂದ ಹೇಳಿದರೆ ಸುಲಭವಾಗಿ ಕೇಳುವ ಶಾಂತ ಸ್ವಭಾವ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: hasCryingTantrums
          ? "Planetary affliction between Moon and Mars/Rahu generates visceral irritability, chronic restlessness, and prolonged daytime crying spells that resist ordinary comforting."
          : "Benefic lunar disposition grants emotional calm and cooperative responsiveness to parental guidance.",
        astrologicalBasisKn: `ಮನಃಕಾರಕ ಚಂದ್ರನ ಸ್ಥಿತಿ ಹಾಗೂ ಕುಜ-ರಾಹು ದೃಷ್ಟಿ.`,
        astrologicalBasisEn: `Natal Moon aspected by Mars or Rahu.`
      },
      {
        id: 2,
        type: "bad",
        titleKn: hasEvilEyeDrishti
          ? "ದೃಷ್ಟಿ ದೋಷ & ಬಾಲಗ್ರಹ ಪೀಡೆ: ಸಂಜೆ ವೇಳೆಯ ಅಳು & ಬೆಚ್ಚಿಬೀಳುವಿಕೆ"
          : "ದೈವಿಕ ಆವರಣ & ದೃಷ್ಟಿ ದೋಷ ಮುಕ್ತ ಸ್ಥಿತಿ",
        titleEn: hasEvilEyeDrishti
          ? "Evil Eye Sensitivity, Twilight Crying & Night Startles"
          : "Protective Aura & Freedom from Balarishta Eye",
        icon: hasEvilEyeDrishti ? "👁️" : "🛡️",
        badgeKn: hasEvilEyeDrishti ? "ಕೇಂದ್ರ ರಾಹು-ಕೇತು • ದೃಷ್ಟಿ ದೋಷ" : "ಶುಭ ಕೇಂದ್ರ • ರಕ್ಷಾ ಕವಚ",
        badgeEn: hasEvilEyeDrishti ? "Nodal Kendra • Evil Eye" : "Benefic Kendra • Shielded",
        bulletKn: hasEvilEyeDrishti
          ? `ಮಗುವಿನ ಸುಕುಮಾರ ನಕ್ಷತ್ರಕ್ಕೆ ಇತರರ ತೀಕ್ಷ್ಣ ಕೆಟ್ಟ ದೃಷ್ಟಿ (ದೃಷ್ಟಿ ದೋಷ) ಅತ್ಯಂತ ಸುಲಭವಾಗಿ ತಗಲುತ್ತದೆ. ವಿಶೇಷವಾಗಿ ಸೂರ್ಯ ಮುಳುಗುವ ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ ಮಗು ಜೋರಾಗಿ ಅಳುವುದು, ಗಾಢ ನಿದ್ರೆಯಲ್ಲಿ ಇದ್ದಕ್ಕಿದ್ದಂತೆ ಬೆಚ್ಚಿಬೀಳುವುದು ಹಾಗೂ ಕಾರಣವಿಲ್ಲದೆ ಹೆದರುವ ಬಾಲಗ್ರಹ ಪೀಡೆಯ ಪ್ರಭಾವವಿದೆ. ಇದಕ್ಕೆ ನಿಯಮಿತವಾಗಿ ಉಪ್ಪು-ಸಾಸಿವೆ ದೃಷ್ಟಿ ನಿವಾಳಿಸುವುದು ಅಗತ್ಯ.`
          : `ಮಗುವಿನ ಸುತ್ತ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವಿದ್ದು, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಅಥವಾ ಕೆಟ್ಟ ದೃಷ್ಟಿಯ ಬಾಧೆಗಳು ಅಷ್ಟಾಗಿ ಬಾಧಿಸುವುದಿಲ್ಲ.`,
        bulletEn: hasEvilEyeDrishti
          ? "The child's delicate aura is highly susceptible to external evil eye (Drishti Dosha), manifesting as sudden unexplained crying at twilight or startled wakefulness during sleep."
          : "Protected auric field repels environmental psychic sensitivities and night terrors.",
        astrologicalBasisKn: `ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹು/ಕೇತುಗಳ ಸ್ಥಿತಿ.`,
        astrologicalBasisEn: `Nodal axis across angular houses from Lagna.`
      },
      {
        id: 3,
        type: "bad",
        titleKn: hasAggressionFights
          ? "ಜಗಳಗಂಟ ಪ್ರವೃತ್ತಿ & ಹೊಡೆದಾಟ: ವಸ್ತುಗಳನ್ನು ಎಸೆಯುವ ಉಗ್ರ ಚಟುವಟಿಕೆ"
          : "ಸಹವರ್ತಿ ಪ್ರೀತಿ & ಹೊಂದಾಣಿಕೆಯ ಆಟೋಟ",
        titleEn: hasAggressionFights
          ? "Aggressive Fighting, Sibling Friction & Object-Throwing"
          : "Harmonious Play & Sibling Affection",
        icon: hasAggressionFights ? "⚡" : "🧸",
        badgeKn: hasAggressionFights ? "3ನೇ ಭಾವ ಕುಜ • ಉಗ್ರ ಕೋಪ" : "ಸೌಮ್ಯ 3ನೇ ಭಾವ • ಸ್ನೇಹ ಶೀಲ",
        badgeEn: hasAggressionFights ? "3rd House Mars • Hyper Aggression" : "Benefic 3rd • Gentle Play",
        bulletKn: hasAggressionFights
          ? `3ನೇ ಸಹೋದರ ಸ್ಥಾನ ಹಾಗೂ ಲಗ್ನದ ಮೇಲೆ ಕುಜನ ಉಗ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ಮಗು ಇತರ ಮಕ್ಕಳೊಂದಿಗೆ ಅಥವಾ ಒಡಹುಟ್ಟಿದವರೊಂದಿಗೆ ನಿತ್ಯ ಜಗಳ, ಹೊಡೆದಾಟ, ಕಚ್ಚುವುದು ಅಥವಾ ಕೋಪ ಬಂದಾಗ ಕೈಗೆ ಸಿಕ್ಕ ಆಟಿಕೆಗಳು/ವಸ್ತುಗಳನ್ನು ನೆಲಕ್ಕೆ ಎಸೆಯುವ ಆಕ್ರಮಣಕಾರಿ ನಡವಳಿಕೆ ತೋರುತ್ತದೆ.`
          : `ಮಗು ಇತರ ಮಕ್ಕಳೊಂದಿಗೆ ಸುಲಭವಾಗಿ ಬೆರೆತು ಆಟವಾಡುವ ಸೌಮ್ಯ ಮನೋಭಾವವನ್ನು ಹೊಂದಿದೆ.`,
        bulletEn: hasAggressionFights
          ? "Fiery Mars influence on the 3rd house triggers aggressive tendencies like hitting, biting, toy-throwing, and persistent squabbles with siblings or playmates."
          : "Harmonious peer interactions without destructive aggression.",
        astrologicalBasisKn: `3ನೇ ಮನೆ (ಸಹೋದರ/ಸಾಹಸ) ಹಾಗೂ ಕುಜನ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ.`,
        astrologicalBasisEn: `3rd house and Mars martial placement.`
      },
      {
        id: 4,
        type: "bad",
        titleKn: hasFoodRefusalColic
          ? "ಆಹಾರ ನಕಾರ & ಜೀರ್ಣಾಂಗ ಕಿರಿಕಿರಿ: ಊಟದ ಸಮಯದಲ್ಲಿ ಅಳು & ಹಠ"
          : "ಉತ್ತಮ ಹಸಿವು, ಸಾತ್ವಿಕ ಆಹಾರ ಸ್ವೀಕಾರ & ಆರೋಗ್ಯಕರ ಜೀರ್ಣಶಕ್ತಿ",
        titleEn: hasFoodRefusalColic
          ? "Food Refusal, Colic Distress & Mealtime Crying"
          : "Healthy Appetite & Wholesome Digestion",
        icon: hasFoodRefusalColic ? "🥣" : "🍎",
        badgeKn: hasFoodRefusalColic ? "2ನೇ ಮುಖ ಸ್ಥಾನ • ಶನಿ-ರಾಹು ಪೀಡೆ" : "ಶುಭ 2ನೇ ಭಾವ • ಉತ್ತಮ ಪೋಷಣೆ",
        badgeEn: hasFoodRefusalColic ? "2nd Intake Affliction • Colic Gas" : "Clean 2nd House • Good Digestion",
        bulletKn: hasFoodRefusalColic
          ? `2ನೇ ಭೋಜನ/ಆಹಾರ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿ ಅಥವಾ ರಾಹುವಿನ ಅಶುಭ ದೃಷ್ಟಿಯಿರುವುದರಿಂದ, ಮಗುವಿನ ಹೊಟ್ಟೆಯಲ್ಲಿ ಗ್ಯಾಸ್, ಅಜೀರ್ಣ ಅಥವಾ ಆಮ್ಲೀಯ ಕಿರಿಕಿರಿ (Colic Pain) ಉಂಟಾಗುತ್ತದೆ. ಇದರಿಂದಾಗಿ ಊಟದ ತಟ್ಟೆ ಕಂಡರೆ ಮೊಂಡುತನ ಮಾಡುವುದು, ಆಹಾರವನ್ನು ಬಾಯಲ್ಲಿಟ್ಟುಕೊಂಡು ನುಂಗದೆ ಸತಾಯಿಸುವುದು ಅಥವಾ ಅಳುವ ಸ್ವಭಾವ ಜಾತಕದಲ್ಲಿ ಸ್ಪಷ್ಟವಿದೆ.`
          : `ಮಗುವಿನ ಆಹಾರ ಸ್ವೀಕಾರ ಮತ್ತು ಜೀರ್ಣಶಕ್ತಿ ಉತ್ತಮವಾಗಿದ್ದು, ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಊಟ ಮಾಡುವ ಆರೋಗ್ಯಕರ ಶಿಸ್ತಿದೆ.`,
        bulletEn: hasFoodRefusalColic
          ? "Affliction to 2nd house of food intake causes abdominal colic or taste sensitivities, prompting stubborn mealtime food refusal, gagging, or mealtime crying."
          : "Wholesome appetite and steady digestive assimilation.",
        astrologicalBasisKn: `2ನೇ ಭೋಜನ ಭಾವ (${secondLordKn}) ಹಾಗೂ ಪಾಪಗ್ರಹ ದೃಷ್ಟಿ.`,
        astrologicalBasisEn: `2nd house of dietary intake affliction.`
      },
      {
        id: 5,
        type: "bad",
        titleKn: hasSchoolingRestless
          ? "ವಿದ್ಯಾಭ್ಯಾಸದ ಚಂಚಲತೆ & ಮೊಂಡುತನ: ಓದಿನಲ್ಲಿ ಏಕಾಗ್ರತೆ ಕೊರತೆ"
          : "ಸ್ಥಿರ ಏಕಾಗ್ರತೆ & ಶ್ರದ್ಧೆಯ ಕಲಿಕೆ: ಓದಿನಲ್ಲಿ ಅಚ್ಚುಕಟ್ಟು",
        titleEn: hasSchoolingRestless
          ? "Schooling Restlessness, Distractibility & Hyperactivity"
          : "Steady Focus & Diligent Learning Habits",
        icon: hasSchoolingRestless ? "📚" : "🎓",
        badgeKn: hasSchoolingRestless ? "ಬುಧ ಚಂಚಲತೆ • ರಾಹು ಪ್ರಭಾವ" : "ಶುಭ ಬುಧ • ದೃಢ ಏಕಾಗ್ರತೆ",
        badgeEn: hasSchoolingRestless ? "Afflicted Mercury • Distracted" : "Strong Mercury • Studious",
        bulletKn: hasSchoolingRestless
          ? `ವಿದ್ಯಾಕಾರಕ ಬುಧನ ಮೇಲೆ ರಾಹುವಿನ ಚಂಚಲ ದೋಷವಿರುವುದರಿಂದ, ಮಗುವಿಗೆ ಒಂದೇ ಕಡೆ ಕುಳಿತು ಓದಲು ತಾಳ್ಮೆ ಇರುವುದಿಲ್ಲ. ಪುಸ್ತಕ ತೆರೆದ ತಕ್ಷಣ ಆಟದ ಕಡೆಗೆ ಗಮನ ಹರಿಯುವುದು, ಅತಿಯಾದ ಚಡಪಡಿಕೆ (Hyperactivity) ಹಾಗೂ ಹೋಂವರ್ಕ್ ಮಾಡಲು ಮೊಂಡುತನ ತೋರುವುದು ಕಾಣಿಸುತ್ತದೆ.`
          : `ಮಗುವಿನ ಗ್ರಹಿಕೆ ಶಕ್ತಿ ಸ್ಥಿರವಾಗಿದ್ದು, ಓದು-ಬರಹದಲ್ಲಿ ಉತ್ತಮ ಶ್ರದ್ಧೆ ಮತ್ತು ಏಕಾಗ್ರತೆಯನ್ನು ಕಾಯ್ದುಕೊಳ್ಳುತ್ತದೆ.`,
        bulletEn: hasSchoolingRestless
          ? "Mercury afflicted by nodal unrest creates cognitive restlessness, short attention spans, and avoidance of structured study or homework."
          : "Disciplined study concentration and intellectual patience.",
        astrologicalBasisKn: `ವಿದ್ಯಾಕಾರಕ ಬುಧ ಹಾಗೂ 5ನೇ ಭಾವದ ಗ್ರಹಸ್ಥಿತಿ.`,
        astrologicalBasisEn: `Mercury and 5th house of learning.`
      },
      {
        id: 6,
        type: "bad",
        titleKn: "ಮಗುವಿನ ಸಂವಹನ ಸ್ವಭಾವ: ಬಾಹ್ಯ ಕಿರುಚಾಟ vs ಒಳಮುಖ ಮುನಿಸು",
        titleEn: "Child's Behavioral Expression: Vocal Screaming vs Silent Sulking",
        icon: "🗣️",
        badgeKn: `3ನೇ ಸಂವಹನ • ${secrecyKn.includes("ಕುಲ್ಲಂ") ? "ಬಾಹ್ಯ ಕಿರುಚಾಟ" : "ಒಳಮುಖ ಮೌನ"}`,
        badgeEn: `3rd Expression Habit`,
        bulletKn: secrecyKn.includes("ಕುಲ್ಲಂ")
          ? "🗣️ ಸಂವಹನ ಸ್ವಭಾವ: ಬಾಹ್ಯ ಕಿರುಚಾಟ — ಕೋಪ ಅಥವಾ ಹಠ ಬಂದಾಗ ಮನೆಯೆಲ್ಲ ಕೇಳಿಸುವಂತೆ ಅಳುವುದು, ಕಿರುಚುವುದು ಮತ್ತು ಎಲ್ಲರ ಗಮನ ಸೆಳೆಯುವ ಬಹಿರಂಗ ಅಭಿವ್ಯಕ್ತಿ."
          : "🔒 ಸಂವಹನ ಸ್ವಭಾವ: ಒಳಮುಖ ಮುನಿಸು — ಸಿಟ್ಟು ಬಂದಾಗ ಮಾತನಾಡದೆ ಮೂಲೆಯಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳುವುದು, ಊಟ ಬಿಡುವುದು ಹಾಗೂ ಅಂತರಂಗದಲ್ಲೇ ಮುನಿಸು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಸ್ವಭಾವ.",
        bulletEn: secrecyEn,
        astrologicalBasisKn: `3ನೇ ಭಾವ ಮತ್ತು ಲಗ್ನದ ತತ್ವ.`,
        astrologicalBasisEn: `3rd house expressive mode.`
      },
      {
        id: 7,
        type: "bad",
        titleKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಬಾಲಾರಿಷ್ಟ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಕವಚ",
        titleEn: "Authentic Balarishta Shanti & Sri Kshetra Gokarna Protection",
        icon: "🕉️",
        badgeKn: "ಗೋಕರ್ಣ ಬಾಲಗ್ರಹ ಶಾಂತಿ • ರಕ್ಷಾ ಸೂತ್ರ",
        badgeEn: "Gokarna Balagraha Shanti • Divine Shield",
        bulletKn: `ಮಗುವಿನ ಈ ಅತಿಯಾದ ಅಳು, ಕಿರಿಕಿರಿ, ದೃಷ್ಟಿ ಬಾಧೆ ಹಾಗೂ ಬಾಲಾರಿಷ್ಟ ದೋಷಗಳ ನಿವಾರಣೆಗಾಗಿ, ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ಸೇವೆ ಮತ್ತು ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ರಕ್ಷಾ ಭಸ್ಮ ಧಾರಣೆ ಮಾಡಿಸುವುದು ಕಡ್ಡಾಯ. ಇದರಿಂದ ಮಗುವಿನ ಆರೋಗ್ಯ, ಮನಶ್ಶಾಂತಿ ಹಾಗೂ ಸುಖನಿದ್ರೆ ಸಿದ್ಧಿಸುತ್ತದೆ.`,
        bulletEn: `To dissolve childhood afflictions, colic crying, and evil eye sensitivities, performing Balagraha Shanti and Mahamrityunjaya Sankalpa Seva at holy Gokarna Mahabaleshwara bestows peaceful sleep and robust health.`,
        astrologicalBasisKn: `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಮಹಿಮೆ & ಬಾಲಾರಿಷ್ಟ ವಿಧಿ.`,
        astrologicalBasisEn: `Gokarna Kotiteertha Balagraha Shanti rites.`
      }
    ];

    return {
      goodTraits: childGoodTraits,
      badTraits: childBadTraits,
      secrecyHabitKn: secrecyKn,
      secrecyHabitEn: secrecyEn,
      gokarnaPrayashchittaKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ರಕ್ಷಾ ಸಂಕಲ್ಪ ಮತ್ತು ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಭಸ್ಮ ಧಾರಣೆಯಿಂದ ಮಗುವಿನ ಅಳು, ಕಿರಿಕಿರಿ ಹಾಗೂ ದೃಷ್ಟಿ ದೋಷ ಸಂಪೂರ್ಣ ಶಾಂತವಾಗಲಿದೆ.`,
      gokarnaPrayashchittaEn: `Perform Balagraha Shanti and Mahamrityunjaya Sankalpa Pooja at Sri Kshetra Gokarna Kotiteertha to pacify child colic, crying, and evil eye afflictions.`
    };
  }

  // =========================================================================
  // ADULT PROFILE (>= 14 Years): 100% Classical Vedic Criteria
  // =========================================================================

  // 1. ANGER & EGO EVALUATION
  const marsHouse = mars?.house ?? 1;
  let angerScore = 0;
  if ([1, 7, 8].includes(marsHouse)) angerScore += 2.0;
  if (sun && [1, 8].includes(sun.house)) angerScore += 1.5;
  if (mars && sun && Math.abs(mars.house - sun.house) === 0) angerScore += 2.0;
  if (mars && [4, 7, 8].includes(houseDist(mars.house, 1))) angerScore += 1.5;
  const hasAnger = angerScore >= 2.0;

  // 2. SENSUAL ATTRACTIONS, GENDER AFFINITY & EXTERNAL AFFAIRS EVALUATION
  const venusH = venus?.house ?? 1;
  const venusSign = venus?.rashi.index ?? 0;
  const neuterSigns = [2, 5, 10]; // Gemini, Virgo, Aquarius (Mercury & Saturn signs)

  // Unconventional / Same-Gender Affinity (ಪುರುಷರತ್ತ ಆಕರ್ಷಣೆ - Male attracted to Men, or Female to Women)
  // Governed by Mercury (neuter) + Saturn (neuter) conjunct Venus in 7th/8th or neuter signs
  const hasSameGenderAffinity = (
    (venus && mercury && Math.abs(venus.house - mercury.house) === 0 && (saturn?.house === 7 || saturn?.house === 8 || rahu?.house === 7 || ketu?.house === 7)) ||
    (venus && [7, 8].includes(venusH) && mercury && [7, 8].includes(mercury.house) && neuterSigns.includes(venusSign)) ||
    (ketu && [7, 8].includes(ketu.house) && mercury && [7, 8].includes(mercury.house) && venus && [saturn, ketu].some(p => p && Math.abs(p.house - venus.house) === 0))
  );

  let sensualScore = 0;
  if (venus && mars && Math.abs(venus.house - mars.house) <= 1) sensualScore += 2.0; // Shukra-Mangala passionate fire
  if (venus && rahu && Math.abs(venus.house - rahu.house) <= 1) sensualScore += 2.0; // Shukra-Rahu boundary-breaking desire
  if ([7, 8, 12].includes(venusH)) sensualScore += 1.5;
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) sensualScore += 1.5;
  if ([rahu, ketu, mars, saturn].some(p => p && p.house === 7)) sensualScore += 1.5;
  if ([rahu, ketu, mars, saturn].some(p => p && p.house === 12)) sensualScore += 1.5;
  if (mars && [4, 7, 8].includes(houseDist(mars.house, 7))) sensualScore += 1.5;
  if (rahu && [5, 7, 9].includes(houseDist(rahu.house, 7))) sensualScore += 1.5;
  if (saturn && [3, 7, 10].includes(houseDist(saturn.house, 7))) sensualScore += 1.0;
  if ([2, 5, 8, 11].includes(lagnaIdx) && sensualScore >= 1.5) sensualScore += 1.0; // Dual sign vulnerability
  const hasSensual = sensualScore >= 2.0;

  // 3. ALCOHOL & SUBSTANCE ADDICTION EVALUATION (100% Comprehensive Classical Check)
  let addictionScore = 0;
  // House 2 (Mouth / Oral intake) occupants
  if ([saturn, rahu, mars, ketu].some(p => p && p.house === 2)) addictionScore += 2.0;
  // Saturn aspect on 2nd house (3rd, 7th, 10th - including Saturn in 8th casting 7th aspect!)
  if (saturn && [3, 7, 10].includes(houseDist(saturn.house, 2))) addictionScore += 2.0;
  // Mars aspect on 2nd house (4th, 7th, 8th)
  if (mars && [4, 7, 8].includes(houseDist(mars.house, 2))) addictionScore += 1.5;
  // Rahu aspect on 2nd house (5th, 7th, 9th)
  if (rahu && [5, 7, 9].includes(houseDist(rahu.house, 2))) addictionScore += 1.5;
  // 2nd Lord in Dusthana or conjunct malefics
  if (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house)) addictionScore += 1.5;
  if (secondLordPlanet && [saturn, rahu, mars].some(m => m && m.name !== secondLord && m.house === secondLordPlanet.house)) addictionScore += 1.5;
  // 8th house (intoxicants / poisons / secret habits)
  if ([saturn, rahu, mars].some(p => p && p.house === 8)) addictionScore += 1.5;
  // 12th house (escapism / substance loss)
  if ([saturn, rahu, mars].some(p => p && p.house === 12)) addictionScore += 1.5;
  // Moon afflicted in water signs (Cancer, Scorpio, Pisces) or dusthanas
  const moonInWaterOrDusthana = moon && ([6, 8, 12].includes(moon.house) || [3, 7, 11].includes(kundli.moonSign.index));
  if (moonInWaterOrDusthana && ((rahu && Math.abs(moon.house - rahu.house) === 0) || (saturn && [3, 7, 10].includes(houseDist(saturn.house, moon.house))))) {
    addictionScore += 1.5;
  }

  const isDailyDrinking = addictionScore >= 2.5;
  const isSocialDrinking = addictionScore >= 1.0 && addictionScore < 2.5;
  const hasAddiction = addictionScore >= 1.0;

  // 4. UNETHICAL WORK, SMUGGLING & SHORTCUT WEALTH EVALUATION
  let illegalScore = 0;
  if (rahu && rahu.house === 8) illegalScore += 2.5; // Classic smuggling & contraband signature
  if (rahu && [10, 11].includes(rahu.house)) illegalScore += 2.0; // Shadow trade / commission games
  if (mars && mars.house === 8) illegalScore += 2.0; // Aggressive illegal adventures
  if (saturn && saturn.house === 8) illegalScore += 1.5; // Unearned secret money
  if (mercury && [8, 10, 12].includes(mercury.house) && (rahu && Math.abs(mercury.house - rahu.house) === 0)) illegalScore += 2.0; // Cyber/tax/forgery
  if (eighthLordPlanet && [2, 11].includes(eighthLordPlanet.house)) illegalScore += 1.5;
  if (rahu && [5, 7, 9].includes(houseDist(rahu.house, 8))) illegalScore += 1.0;
  const hasIllegal = illegalScore >= 2.0;

  // 5. DARK THOUGHT LOOPS & DEPRESSION EVALUATION
  let darkScore = 0;
  if (moon && [6, 8, 12].includes(moon.house)) darkScore += 2.0;
  if (moon && rahu && Math.abs(moon.house - rahu.house) === 0) darkScore += 2.0;
  if (moon && saturn && Math.abs(moon.house - saturn.house) === 0) darkScore += 2.0;
  if (saturn && [3, 7, 10].includes(houseDist(saturn.house, moon?.house ?? 1))) darkScore += 1.5;
  if (rahu && [5, 7, 9].includes(houseDist(rahu.house, moon?.house ?? 1))) darkScore += 1.5;
  const hasDarkLoops = darkScore >= 2.0;

  // ADULT GOOD TRAITS (Crisp Single-Point Attracting Headings)
  const adultGoodTraits: TraitBulletPoint[] = [
    {
      id: 1,
      type: "good",
      titleKn: "ಅಪ್ರತಿಮ ಸ್ವಾಭಿಮಾನ & ಸತ್ಯದ ನಡೆ: ಯಾರ ಮುಂದೆಯೂ ತಲೆಬಾಗದ ಛಲ",
      titleEn: "Dignified Self-Respect & Inherent Leadership: Unyielding Honor",
      icon: "👑",
      badgeKn: `ಲಗ್ನ: ${lagnaKn} • ${lagnaLordKn}`,
      badgeEn: `Lagna: ${lagnaEn} • ${lagnaLord}`,
      bulletKn: `ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ ಬಲದಿಂದಾಗಿ ನೀವು ಎಂದಿಗೂ ಯಾರ ಮುಂದೆಯೂ ಅನಗತ್ಯವಾಗಿ ಕೈಚಾಚುವವರಲ್ಲ ಅಥವಾ ತಲೆಬಾಗುವವರಲ್ಲ. ತತ್ವ ಮತ್ತು ಆತ್ಮಗೌರವಕ್ಕೆ ಧಕ್ಕೆ ಬಂದರೆ ಎಷ್ಟು ದೊಡ್ಡ ಲಾಭವಿದ್ದರೂ ತಕ್ಷಣ ತಿರಸ್ಕರಿಸುವ ಅಚಲ ಛಲಗಾರಿಕೆ ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ಮುಖಸ್ತುತಿಯನ್ನು ಮಾಡದೆ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಮುನ್ನಡೆಯುತ್ತೀರಿ.`,
      bulletEn: `With your ${lagnaEn} Ascendant governed by ${lagnaLord}, you hold an unshakeable sense of honor and executive dignity. You never tolerate sycophancy or arbitrary coercion, valuing principle over expedience.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಗ್ರಹಬಲ.`,
      astrologicalBasisEn: `Ascendant lord ${lagnaLord} strength in 1st house.`
    },
    {
      id: 2,
      type: "good",
      titleKn: "ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ & ವಾಸ್ತವಿಕ ವಿವೇಕ: ಪ್ರಾಯೋಗಿಕ ಸಮಸ್ಯೆಗಳ ತ್ವರಿತ ಪರಿಹಾರ",
      titleEn: "Sharp Practical Logic & Intellect: Rapid Problem Solving",
      icon: "🧠",
      badgeKn: `5ನೇ ಬುದ್ಧಿ ಭಾವ • ${fifthLordKn}`,
      badgeEn: `5th Intellect • ${fifthLord}`,
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ${fifthLordKn} ಅಧಿಪತ್ಯವಿರುವುದರಿಂದ ಸೈದ್ಧಾಂತಿಕ ಬಾಯಿಪಾಠಕ್ಕಿಂತ ವಾಸ್ತವಿಕ, ಪ್ರಾಯೋಗಿಕ ಮತ್ತು ತಾರ್ಕಿಕ ವಿಷಯಗಳಲ್ಲಿ ನಿಮ್ಮ ಬುದ್ಧಿ ತೀಕ್ಷ್ಣವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ಜಟಿಲ ಸವಾಲುಗಳಿಗೆ ತ್ವರಿತವಾಗಿ ಸರಳ ಪರಿಹಾರಗಳನ್ನು ಹುಡುಕುವ ಸೃಜನಶೀಲ ಕೌಶಲ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Governed by 5th lord ${fifthLord}, your intellect is sharp in practical logic and strategic problem-solving. You master skills by hands-on execution rather than rote memorization.`,
      astrologicalBasisKn: `5ನೇ ಭಾವ (ಬುದ್ಧಿ/ಪೂರ್ವಪುಣ್ಯ) ಹಾಗೂ ಬುಧ-ಗುರು ಕಾರಕತ್ವ.`,
      astrologicalBasisEn: `5th house of intellect and Mercury-Jupiter disposition.`
    },
    {
      id: 3,
      type: "good",
      titleKn: "ಸಾಮಾಜಿಕ ಒಡನಾಟ & ಕುಟುಂಬ ನಿಷ್ಠೆ: ಆಪ್ತರ ರಕ್ಷಣೆಗೆ ನಿಲ್ಲುವ ಧರ್ಮಬಲ",
      titleEn: "Social Circle & Family Loyalty: Steadfast Protective Shield",
      icon: "🛡️",
      badgeKn: `4ನೇ ಸುಖ ಭಾವ • ${fourthLordKn}`,
      badgeEn: `4th House of Home • ${fourthLord}`,
      bulletKn: `ಹೊರಗಡೆ ನೀವು ಎಷ್ಟೇ ಗಟ್ಟಿಯಾಗಿ ಅಥವಾ ನಿಷ್ಠುರವಾಗಿ ಕಂಡರೂ, ನಿಮ್ಮ ಕುಟುಂಬ ಮತ್ತು ಆಪ್ತರ ವಿಷಯದಲ್ಲಿ ಅಪಾರ ವಾತ್ಸಲ್ಯ ಹೊಂದಿದ್ದೀರಿ. ನಿಮ್ಮವರ ಮೇಲೆ ಯಾವುದೇ ಆಪತ್ತು ಬರದಂತೆ ರಕ್ಷಿಸಲು ನಿಮ್ಮ ಸ್ವಂತ ಆಸೆಗಳನ್ನು ತ್ಯಾಗ ಮಾಡಲು ಸಿದ್ಧರಿರುತ್ತೀರಿ.`,
      bulletEn: `While maintaining a stoic exterior, your dedication to protecting family honor and providing for loved ones is absolute and protective.`,
      astrologicalBasisKn: `4ನೇ ಮನೆ (ಮಾತೃ/ಸುಖ ಸ್ಥಾನ ${fourthLordKn}) ಮತ್ತು ಚಂದ್ರನ ಪ್ರಭಾವ.`,
      astrologicalBasisEn: `4th house of home (${fourthLord}) and Moon placement.`
    },
    {
      id: 4,
      type: "good",
      titleKn: "ಆರ್ಥಿಕ ಪುಟಿದೇಳುವಿಕೆ & ಧನ ಯೋಗ: ಶೂನ್ಯದಿಂದ ಸಾಮ್ರಾಜ್ಯ ಕಟ್ಟುವ ಶಕ್ತಿ",
      titleEn: "Financial Resilience & Wealth Inflow: Rebuilding from Zero",
      icon: "💰",
      badgeKn: `2ನೇ ಧನ & 11ನೇ ಲಾಭ • ${secondLordKn}`,
      badgeEn: `2nd & 11th Houses • ${secondLord}`,
      bulletKn: `ಜೀವನದಲ್ಲಿ ಆರ್ಥಿಕವಾಗಿ ಎಷ್ಟೇ ಏರಿಳಿತಗಳು ಬಂದರೂ, ಶೂನ್ಯದಿಂದ ಪುನಃ ಸಂಪತ್ತು ಮತ್ತು ವ್ಯವಹಾರವನ್ನು ಕಟ್ಟಿ ನಿಲ್ಲಿಸುವ ಅದ್ಭುತ ಚೇತರಿಕೆಯ ಶಕ್ತಿ (Resilience) ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಧನ ಸಂಪತ್ತು ಹರಿದುಬರುತ್ತದೆ.`,
      bulletEn: `Governed by 2nd lord ${secondLord} and 11th lord ${eleventhLord}, your financial resilience allows you to rebuild wealth and stability even after major downturns.`,
      astrologicalBasisKn: `2ನೇ ಧನಕೋಶದ ${secondLordKn} ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಗ್ರಹಯೋಗ.`,
      astrologicalBasisEn: `2nd house of treasury and 11th house of enterprise.`
    },
    {
      id: 5,
      type: "good",
      titleKn: "ಪೂರ್ವಪುಣ್ಯ ರಕ್ಷಣೆ & ದೈವಬಲ: ಅಪಾಯಗಳಿಂದ ಪಾರುಮಾಡುವ ಅದೃಶ್ಯ ಶ್ರೀರಕ್ಷೆ",
      titleEn: "Divine Ancestral Shield & Fortune: Invisible Protection",
      icon: "🪔",
      badgeKn: `9ನೇ ಭಾಗ್ಯ ಭಾವ • ಗುರು ಕೃಪೆ`,
      badgeEn: `9th Fortune • Jupiter Grace`,
      bulletKn: `ನಿಮ್ಮ ಪೂರ್ವಪುಣ್ಯ ಮತ್ತು ಕುಲದೇವರ ಕೃಪೆಯು ಅತ್ಯಂತ ಕಠಿಣ ಸಂದರ್ಭಗಳಲ್ಲೂ ನಿಮ್ಮನ್ನು ಅದೃಶ್ಯ ರಕ್ಷಾಕವಚದಂತೆ ಕಾಪಾಡಿದೆ. ಕಷ್ಟಗಳು ಬಂದರೂ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಸೂಕ್ತ ದಾರಿ ಗೋಚರಿಸಿ ಪಾರಾಗುವ ದೈವಬಲ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ.`,
      bulletEn: `The 9th house of fortune ensures divine providence and ancestral protection shield you at critical junctures, turning impending crises into safe passage.`,
      astrologicalBasisKn: `9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಗುರು-ಸೂರ್ಯ ದೈವಿಕ ತತ್ವ.`,
      astrologicalBasisEn: `9th house of dharma and Jupiter's protective trine.`
    }
  ];

  // ADULT BAD TRAITS (100% Dynamic, Single-Point Attracting Headings)
  const adultBadTraits: TraitBulletPoint[] = [
    {
      id: 1,
      type: "bad",
      titleKn: hasAnger
        ? "ಹಠಮಾರಿತನ & ಹಠಾತ್ ಕೋಪದ ಜ್ವಾಲೆ: ಸಿಟ್ಟಿನಲ್ಲಿ ಸಂಬಂಧ ಕಡಿದುಕೊಳ್ಳುವ ಅಪಾಯ"
        : "ಸಂಯಮದ ವಿವೇಚನೆ & ಶಾಂತ ನಡೆ: ಸಮಚಿತ್ತದ ಧೀಮಂತ ನಡವಳಿಕೆ",
      titleEn: hasAnger
        ? "Stubborn Pride & Explosive Anger: Threat to Trusted Alliances"
        : "Measured Patience & Composure: Balanced Emotional Fortitude",
      icon: hasAnger ? "🔥" : "🕊️",
      badgeKn: hasAnger ? `ಕುಜ/ರವಿ ಪ್ರಭಾವ • ಪಿತ್ತ ತತ್ವ` : `ಸೌಮ್ಯ ಗ್ರಹ ದೃಷ್ಟಿ • ಶಾಂತ ಮನೋಭಾವ`,
      badgeEn: hasAnger ? `Mars/Sun Influence • Pitta Fire` : `Benefic Aspect • Composed Mind`,
      bulletKn: hasAnger
        ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕುಜ-ರವಿಗಳ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವದಿಂದಾಗಿ ಒಮ್ಮೆ ಒಂದು ನಿರ್ಧಾರ ಕೈಗೊಂಡರೆ ಇತರರು ಎಷ್ಟು ಬುದ್ಧಿವಾದ ಹೇಳಿದರೂ ಕೇಳದ ಹಠಮಾರಿ ಸ್ವಭಾವವಿದೆ. ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಸಣ್ಣ ಧಕ್ಕೆ ಬಂದರೂ ಹಠಾತ್ ಸಿಟ್ಟು ಭುಗಿಲೆದ್ದು ಕಟು ಮಾತುಗಳನ್ನಾಡಿ ಹತ್ತಿರದವರನ್ನು ದೂರ ಮಾಡಿಕೊಳ್ಳುವ ಅಪಾಯವಿದೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕುಜ-ರವಿಗಳ ಉಗ್ರ ದೋಷವಿಲ್ಲದಿರುವುದರಿಂದ, ನೀವು ಸಹಜವಾಗಿ ಸಂಯಮ ಮತ್ತು ಶಾಂತ ಸ್ವಭಾವವನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಅನಗತ್ಯ ಕೋಪಕ್ಕೆ ಆಸ್ಪದ ನೀಡದೆ ತಾಳ್ಮೆಯಿಂದ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುವ ವಿವೇಕ ನಿಮ್ಮಲ್ಲಿದೆ; ಆದರೂ ನಿಮ್ಮ ಮೃದು ಸ್ವಭಾವವನ್ನು ಇತರರು ದುರುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳದಂತೆ ಎಚ್ಚರವಿರಲಿ.`,
      bulletEn: hasAnger
        ? `Intense Mars-Sun influence triggers stubborn refusal to heed advice once resolved, along with sudden fiery outbursts that can alienate trusted allies.`
        : `Benefic alignment shields your chart from destructive anger, endowing you with measured patience and emotional composure; stay vigilant only to ensure others do not exploit your gentle nature.`,
      astrologicalBasisKn: hasAnger ? `ಕುಜ-ರವಿಗಳ ಸ್ಥಿತಿ ಹಾಗೂ ಪಿತ್ತ ಪ್ರಕೋಪ.` : `ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಹಾಗೂ ಶಾಂತ ತತ್ವ.`,
      astrologicalBasisEn: hasAnger ? `Mars-Sun fire aspect and Pitta constitution.` : `Benefic aspect moderating aggressive impulse.`
    },
    {
      id: 2,
      type: "bad",
      titleKn: hasSameGenderAffinity
        ? "ಕಾಮನೆ & ಆಕರ್ಷಣೆಯ ನೈಜತೆ: ಪುರುಷರತ್ತ ವಿಶಿಷ್ಟ ಆಕರ್ಷಣೆ & ಅಂತರಂಗದ ಸೆಳೆತ"
        : hasSensual
        ? (isMale
          ? "ಬಾಹ್ಯ ಆಕರ್ಷಣೆ & ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ: ರಹಸ್ಯ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧದ ಸೆಳೆತ"
          : "ಬಾಹ್ಯ ಆಕರ್ಷಣೆ & ಪರಪುರುಷ ವ್ಯಾಮೋಹ: ರಹಸ್ಯ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧದ ಸೆಳೆತ")
        : "ನೈತಿಕ ಚಾರಿತ್ರ್ಯ & ದಾಂಪತ್ಯ ನಿಷ್ಠೆ: ಸದಾಚಾರದ ರಕ್ಷಾ ಕವಚ",
      titleEn: hasSameGenderAffinity
        ? "Sexual Attraction & Core Desire: Same-Gender / Unconventional Affinity"
        : hasSensual
        ? (isMale
          ? "Sensual Craving & External Affairs with Women: Marital Vulnerabilities"
          : "Sensual Craving & External Affairs with Men: Marital Vulnerabilities")
        : "Moral Rectitude, Sensory Restraint & Marital Loyalty",
      icon: hasSameGenderAffinity ? "🌈" : (hasSensual ? "👩‍❤️‍👨" : "💎"),
      badgeKn: hasSameGenderAffinity
        ? "7ನೇ/8ನೇ ಬುಧ-ಶನಿ • ವಿಶಿಷ್ಟ ಕಾಮನೆ"
        : (hasSensual ? "7ನೇ/12ನೇ ಶುಕ್ರ-ರಾಹು • ಬಾಹ್ಯ ಸೆಳೆತ" : "ಶುಭ ಕಳತ್ರ • ಸದಾಚಾರ ರಕ್ಷಣೆ"),
      badgeEn: hasSameGenderAffinity
        ? "Mercury-Saturn 7th/8th • Unconventional"
        : (hasSensual ? "Venus-Rahu Axis • External Desire" : "Auspicious 7th • Ethical Shield"),
      bulletKn: hasSameGenderAffinity
        ? `ನಿಮ್ಮ ಜಾತಕದ 7ನೇ (ಕಾಮ) ಮತ್ತು 8ನೇ (ರಹಸ್ಯ) ಸ್ಥಾನಗಳ ಮೇಲೆ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ವಿಶೇಷ ತತ್ವವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಅಂತರಂಗದ ಲೈಂಗಿಕ ಆಕರ್ಷಣೆ ಮತ್ತು ಕಾಮನೆಯು ${isMale ? "ಪುರುಷರ ಕಡೆಗೆ (Same-Gender Affinity)" : "ಮಹಿಳೆಯರ ಕಡೆಗೆ"} ವಿಶಿಷ್ಟವಾಗಿ ಸೆಳೆಯುವ ಪ್ರಬಲ ಲಕ್ಷಣಗಳಿವೆ. ಸಮಾಜದ ಸಾಂಪ್ರದಾಯಿಕ ನಿರೀಕ್ಷೆಗಳ ನಡುವೆ ಈ ಆಕರ್ಷಣೆಯನ್ನು ಅತ್ಯಂತ ಗುಪ್ತವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಇದೆ.`
        : (hasSensual
          ? (isMale
            ? `7ನೇ ಕಳತ್ರ ಮತ್ತು 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ ಅಥವಾ ರಾಹುವಿನ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯ ಜೀವನದ ಆಚೆಗೆ ಹೊರಗಿನ ಸ್ತ್ರೀಯರ ಕಡೆಗೆ (ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ) ತೀವ್ರ ಕಾಮ ಪ್ರಚೋದನೆ, ರಹಸ್ಯ ಫೋನ್/ಚಾಟ್ ಮಾತುಕತೆ ಹಾಗೂ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಅಪಾಯದ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ. ಇದು ಕೌಟುಂಬಿಕ ಗೌರವವನ್ನು ಧ್ವಂಸ ಮಾಡುವ ಅಪಾಯ ತಂದೊಡ್ಡಬಹುದು.`
            : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 7ನೇ ಕಳತ್ರ ಮತ್ತು 8ನೇ ರಹಸ್ಯ ಭಾವಗಳ ಮೇಲೆ ಕುಜ-ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಸಮಾಧಾನ ಮೂಡಿದಾಗ ಹೊರಗಿನ ಪುರುಷರತ್ತ (ಪರಪುರುಷ ವ್ಯಾಮೋಹ) ಭಾವನಾತ್ಮಕ ಮತ್ತು ರಹಸ್ಯ ಪ್ರೇಮ ಸೆಳೆತ ಉಂಟಾಗುವ ಅಪಾಯವಿದೆ.`)
          : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ-ರಾಹುಗಳ ಅಶುಭ ಯೋಗವಿಲ್ಲದಿರುವುದರಿಂದ, ನೈತಿಕ ಶಿಸ್ತು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಕೌಟುಂಬಿಕ ನಿಷ್ಠೆ ನಿಮ್ಮ ಬಲವಾದ ಗುಣಗಳಾಗಿವೆ. ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳಿಗೆ ಸುಲಭವಾಗಿ ಮಾರುಹೋಗದೆ, ಸಂಸ್ಕಾರಯುತ ದಾಂಪತ್ಯ ಜೀವನಕ್ಕೆ ಬದ್ಧರಾಗಿರುವ ಸದ್ಗುಣ ನಿಮ್ಮಲ್ಲಿದೆ.`),
      bulletEn: hasSameGenderAffinity
        ? `Vedic configurations in the 7th and 8th houses influenced by Mercury and Saturn reveal an authentic internal attraction toward ${isMale ? "men (same-gender orientation)" : "women"}, maintained with extreme personal privacy.`
        : (hasSensual
          ? (isMale
            ? "Venus-Rahu influence on the 7th/12th axis creates intense sensory urges, illicit attractions toward women outside marriage, and secret affairs that threaten family honor."
            : "Mars-Rahu tension on the 7th/8th axis generates vulnerability to external romantic attractions and extramarital liaisons with men.")
          : "Benefic planetary alignment shields your marital house, conferring strong moral rectitude, self-control, and faithful commitment to family values."),
      astrologicalBasisKn: hasSameGenderAffinity
        ? "7ನೇ/8ನೇ ಭಾವಗಳಲ್ಲಿ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ತತ್ವ."
        : (hasSensual ? "7ನೇ (ಕಳತ್ರ) ಮತ್ತು 12ನೇ (ಶಯನ/ರಹಸ್ಯ ಭೋಗ) ಮನೆಗಳ ಶುಕ್ರ-ರಾಹು-ಕುಜ ಯೋಗ." : "7ನೇ ಮತ್ತು 12ನೇ ಮನೆಗಳ ಮೇಲೆ ಶುಭ ಗ್ರಹ ರಕ್ಷಣೆ."),
      astrologicalBasisEn: hasSameGenderAffinity
        ? "Mercury-Saturn neuter influence in kama/secret houses."
        : (hasSensual ? "Venus-Rahu axis across 7th and 12th houses of pleasure and secret desires." : "Auspicious aspect protecting marital boundaries.")
    },
    {
      id: 3,
      type: "bad",
      titleKn: isDailyDrinking
        ? "ಮದ್ಯಪಾನ & ದುಶ್ಚಟಗಳ ನೈಜ ಸ್ಥಿತಿ: ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ & ತೀವ್ರ ವ್ಯಸನದ ಸೆಳೆತ"
        : (isSocialDrinking
          ? "ಮದ್ಯಪಾನ & ದುಶ್ಚಟಗಳ ನೈಜ ಸ್ಥಿತಿ: ಪಾರ್ಟಿ & ಸಹವಾಸದ ಮದ್ಯಪಾನದ ಅಪಾಯ"
          : "ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿ & ಆಹಾರ ಸಂಸ್ಕಾರ: ದುಶ್ಚಟ ಮುಕ್ತ ಶರೀರ ರಕ್ಷಣೆ"),
      titleEn: isDailyDrinking
        ? "Addictions & Drinking Reality: Daily Alcohol Habit & Intense Substance Urge"
        : (isSocialDrinking
          ? "Addiction Tendency: Social & Peer-Induced Drinking Vulnerability"
          : "Sattvic Lifestyle & Clean Habits: Freedom from Addictions"),
      icon: hasAddiction ? "🍷" : "🌿",
      badgeKn: isDailyDrinking
        ? "2ನೇ ಮುಖ & 8ನೇ ಛಾಯಾ • ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ"
        : (isSocialDrinking ? "2ನೇ ಭಾವ ರಾಹು/ಶನಿ • ಪಾರ್ಟಿ ಮದ್ಯಪಾನ" : "2ನೇ ಶುಭ ಸ್ಥಾನ • ಸಾತ್ವಿಕ ಶಿಸ್ತು"),
      badgeEn: isDailyDrinking
        ? "2nd Face & 8th Secret • Daily Alcohol"
        : (isSocialDrinking ? "2nd House Aspect • Social Drinking" : "Pure 2nd House • Sattvic Habits"),
      bulletKn: isDailyDrinking
        ? `ನಿಮ್ಮ 2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನ ಹಾಗೂ 8ನೇ ರಹಸ್ಯ ವ್ಯಸನ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶನಿ ಮತ್ತು ರಾಹುವಿನ ನೇರ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ (Daily Drinking), ಧೂಮಪಾನ ಅಥವಾ ಅಮಲು ಪದಾರ್ಥಗಳ ವ್ಯಸನದ ಪ್ರಬಲ ಸೆಳೆತ ಜಾತಕದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸುತ್ತದೆ. ಸಂಜೆಯ ವೇಳೆಯಲ್ಲಿ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡದಲ್ಲಿ ಈ ಚಟ ನಿಯಂತ್ರಣ ತಪ್ಪಿ, ಯಕೃತ್ತು (Liver), ಜೀರ್ಣಾಂಗ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿಯನ್ನು ಕ್ಷೀಣಿಸಬಹುದು. ಇದಕ್ಕೆ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಸಂಕಲ್ಪ ಮುಕ್ತಿ ಅತ್ಯಗತ್ಯ.`
        : (isSocialDrinking
          ? `2ನೇ ವಾಕ್/ಆಹಾರ ಸ್ಥಾನಕ್ಕೆ ಶನಿ-ರಾಹುಗಳ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಸ್ನೇಹಿತರ ಸಹವಾಸ ಅಥವಾ ಪಾರ್ಟಿಗಳ ಸಮಯದಲ್ಲಿ ಮದ್ಯಪಾನ, ಧೂಮಪಾನದಂತಹ ದುಶ್ಚಟಗಳ ಸೆಳೆತ ಉಂಟಾಗುತ್ತದೆ. ಆರಂಭದಲ್ಲಿ ಮನರಂಜನೆಯಾಗಿದ್ದದ್ದು ಕ್ರಮೇಣ ಅಭ್ಯಾಸವಾಗಿ ಬದಲಾಗದಂತೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು.`
          : `ನಿಮ್ಮ 2ನೇ ಆಹಾರ ಸ್ಥಾನವು ಶುಭ ಗ್ರಹಗಳ ನಿಯಂತ್ರಣದಲ್ಲಿದ್ದು, ದುಶ್ಚಟಗಳಿಂದ ದೂರವಿರುವ ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ. ಮದ್ಯಪಾನ, ಧೂಮಪಾನ ಅಥವಾ ವ್ಯಸನಗಳ ಜಾಲಕ್ಕೆ ಬೀಳದೆ ಶರೀರ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಇಚ್ಛಾಶಕ್ತಿ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ.`),
      bulletEn: isDailyDrinking
        ? "Affliction across the 2nd house of oral intake and 8th house of secret vices manifests as a regular or daily alcohol habit, demanding conscious detox and spiritual intervention before liver health is compromised."
        : (isSocialDrinking
          ? "Planetary aspects on the 2nd house create periodic vulnerability to social drinking, smoking, or intoxicating indulgences under peer influence."
          : "A clean 2nd house of intake grants natural resistance to toxic substances, supporting clean dietary habits and wholesome physical well-being."),
      astrologicalBasisKn: hasAddiction ? `2ನೇ (ಆಹಾರ/ಮುಖ) ಮತ್ತು 8ನೇ (ರಹಸ್ಯ ವ್ಯಸನ) ಭಾವದ ರಾಹು-ಶನಿ-ಕುಜ ಪ್ರಭಾವ.` : `2ನೇ ಮನೆಗೆ ಶುಭ ದೃಷ್ಟಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಗ್ರಹ ಪ್ರಭಾವ.`,
      astrologicalBasisEn: hasAddiction ? `Affliction to 2nd house of intake and 8th hidden house by malefics.` : `Clean 2nd house and absence of malefics from intake house.`
    },
    {
      id: 4,
      type: "bad",
      titleKn: hasIllegal
        ? "ಅಡ್ಡದಾರಿ ಹಣ & ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್): ಅಕ್ರಮ ಲಾಭ & ರಿಸ್ಕ್ ವ್ಯವಹಾರದ ಸೆಳೆತ"
        : "ನ್ಯಾಯನಿಷ್ಠ ಸಂಪಾದನೆ & ಸತ್ಯ ಮಾರ್ಗ: ಪರಿಶ್ರಮದ ಧರ್ಮ ಸಂಪತ್ತು",
      titleEn: hasIllegal
        ? "Unethical Shortcuts & Smuggling: Illicit Money & High-Risk Trade"
        : "Righteous Livelihood & Integrity: Hard-Earned Ethical Wealth",
      icon: hasIllegal ? "⚖️" : "🏛️",
      badgeKn: hasIllegal ? "8ನೇ & 11ನೇ ಭಾವ • ಅಕ್ರಮ ರಿಸ್ಕ್ ಯೋಗ" : "ಧರ್ಮ-ಕರ್ಮ ಯೋಗ • ಸತ್ಯ ಸಂಪಾದನೆ",
      badgeEn: hasIllegal ? "8th & 11th Houses • Illicit Wealth Risk" : "Dharma-Karma Axis • Clean Wealth",
      bulletKn: hasIllegal
        ? `ಜಾತಕದಲ್ಲಿ 8ನೇ ರಹಸ್ಯ ಸ್ಥಾನ ಅಥವಾ 11ನೇ ಲಾಭ ಭಾವದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹುವಿನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಶ್ರಮವಿಲ್ಲದೆ ತ್ವರಿತವಾಗಿ ಕೋಟಿಗಟ್ಟಲೆ ಹಣ ಗಳಿಸುವ ಅಡ್ಡದಾರಿ, ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್), ಬೆಟ್ಟಿಂಗ್, ಹವಾಲಾ ಅಥವಾ ಅಕ್ರಮ ವ್ಯವಹಾರಗಳ ದುಸ್ಸಾಹಸಕ್ಕೆ ಮನಸ್ಸು ಹಾತೊರೆಯುವ ಪ್ರವೃತ್ತಿ ಇದೆ. ಇದರಿಂದ ಆರಂಭದಲ್ಲಿ ಭಾರಿ ಲಾಭ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಪೊಲೀಸ್ ಕೇಸ್, ಕಾನೂನು ಸಂಕೋಲೆ, ಜೈಲು ಭಯ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾನಹಾನಿಯ ಅಪಾಯ ತಂದೊಡ್ಡಬಹುದು; ಪ್ರಾಮಾಣಿಕ ದುಡಿಮೆಯೇ ಶಾಶ್ವತ ರಕ್ಷೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಧರ್ಮ ಮತ್ತು ಕರ್ಮ ಸ್ಥಾನಗಳು ಶುದ್ಧವಾಗಿದ್ದು, ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ಸತ್ಯ ಮಾರ್ಗದ ಸಂಪಾದನೆಯಲ್ಲೇ ನೀವು ನೆಮ್ಮದಿ ಕಾಣುತ್ತೀರಿ. ಅಡ್ಡದಾರಿ, ಬೆಟ್ಟಿಂಗ್, ಅಕ್ರಮ ಆಮಿಷಗಳು ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಗೆ ಮರುಳಾಗದೆ ಕಾನೂನುಬದ್ಧವಾಗಿ ಬೆಳೆಯುವ ಪ್ರಾಮಾಣಿಕತೆ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ದೊಡ್ಡ ಶಕ್ತಿ.`,
      bulletEn: hasIllegal
        ? "Rahu's presence or aspect on the 8th and 11th houses sparks reckless ambition toward illegal shortcut wealth, smuggling, speculative betting, or shadow trading, carrying severe legal liability and public disgrace."
        : "An unblemished dharma-karma axis grounds your pursuit of prosperity in honest labor and strict ethical compliance, rejecting unlawful shortcut temptations.",
      astrologicalBasisKn: hasIllegal ? `8ನೇ ಅಕ್ರಮ ಲಾಭ ಮತ್ತು 11ನೇ ದುರಾಸೆಯ ಸ್ಥಾನದಲ್ಲಿ ರಾಹುವಿನ ಪ್ರಭಾವ.` : `ಧರ್ಮ-ಕರ್ಮ ಸ್ಥಾನಗಳ ಸಾತ್ವಿಕ ಬಲ.`,
      astrologicalBasisEn: hasIllegal ? `8th house unearned wealth and Rahu temptation.` : `Pure 9th and 10th houses ensuring ethical earnings.`
    },
    {
      id: 5,
      type: "bad",
      titleKn: hasDarkLoops
        ? "ನಕಾರಾತ್ಮಕ ಯೋಚನೆಗಳು & ಖಿನ್ನತೆ: ಮನಸ್ಸನ್ನು ಕಾಡುವ ಕತ್ತಲೆಯ ಆಲೋಚನೆಗಳು"
        : "ಮಾನಸಿಕ ಸ್ಥೈರ್ಯ & ಧನಾತ್ಮಕ ಚಿಂತನೆ: ಆಶಾವಾದದ ಮನೋಬಲ",
      titleEn: hasDarkLoops
        ? "Negative Thought Loops & Depressive Anxiety: Brooding Solitude"
        : "Mental Fortitude & Constructive Optimism: Inner Resilience",
      icon: hasDarkLoops ? "🌑" : "☀️",
      badgeKn: hasDarkLoops ? "ಚಂದ್ರ-ರಾಹು/ಶನಿ ಪ್ರಭಾವ • ವಿಷ ಯೋಗ" : "ಶುಭ ಚಂದ್ರ ಬಲ • ಧನಾತ್ಮಕ ಚಿತ್ತ",
      badgeEn: hasDarkLoops ? "Moon-Rahu/Saturn • Mental Shadow" : "Benefic Moon Strength • Resilient Mind",
      bulletKn: hasDarkLoops
        ? `ಚಂದ್ರನ ಮೇಲೆ ಶನಿ ಅಥವಾ ರಾಹುವಿನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಮನಸ್ಸು ಅತ್ಯಂತ ಬೇಗನೆ ನಕಾರಾತ್ಮಕ ಯೋಚನೆಗಳ ಸುಳಿಯಲ್ಲಿ ಸಿಲುಕುತ್ತದೆ. 'ನನ್ನ ಜೀವನ ವ್ಯರ್ಥ', 'ನನ್ನನ್ನು ಯಾರೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದಿಲ್ಲ' ಎಂಬ ಕೀಳರಿಮೆ, ಒಂಟಿತನದ ಭಯ ಹಾಗೂ ತೀವ್ರ ಖಿನ್ನತೆ (Depression) ನಿಮ್ಮನ್ನು ಕಾಡಬಹುದು. ಇಂತಹ ಸಂದರ್ಭಗಳಲ್ಲಿ ಧ್ಯಾನ ಮತ್ತು ದೈವ ಪ್ರಾರ್ಥನೆ ಅತ್ಯಗತ್ಯ.`
        : `ನಿಮ್ಮ ಚಂದ್ರ ಬಲವು ಸ್ಥಿರವಾಗಿದ್ದು, ಎಂತಹ ಕಠಿಣ ಸನ್ನಿವೇಶದಲ್ಲೂ ಧೃತಿಗೆಡದೆ ಸಕಾರಾತ್ಮಕವಾಗಿ ಮುನ್ನಡೆಯುವ ಮನೋಸ್ಥೈರ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ. ಸುಖ-ದುಃಖಗಳನ್ನು ಸಮಚಿತ್ತದಿಂದ ಸ್ವೀಕರಿಸಿ, ಆಶಾವಾದದೊಂದಿಗೆ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುವ ಗುಣ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಸದೃಢವಾಗಿಟ್ಟಿದೆ.`,
      bulletEn: hasDarkLoops
        ? "Affliction to the Moon (Saturn/Rahu association) produces recurring cycles of depressive overthinking, chronic self-doubt, and fear of abandonment."
        : "Stable lunar alignment endows you with emotional resilience, steady equanimity during hardship, and constructive optimism that shields against mental despondency.",
      astrologicalBasisKn: hasDarkLoops ? `ಮನಃಕಾರಕ ಚಂದ್ರನ ಮೇಲಿನ ರಾಹು/ಶನಿಯ ಪ್ರಭಾವ ಹಾಗೂ ದುಃಸ್ಥಾನ ಸ್ಥಿತಿ.` : `ಸ್ಥಿರ ಚಂದ್ರ ಬಲ ಹಾಗೂ ಸಕಾರಾತ್ಮಕ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      astrologicalBasisEn: hasDarkLoops ? `Afflicted natal Moon position in Dusthana or with nodal shadow.` : `Unafflicted Moon conferring emotional stability.`
    },
    {
      id: 6,
      type: "bad",
      titleKn: "ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ: ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ vs ಸಂಪೂರ್ಣ ಮುಚ್ಚಿಡುವ ಗೌಪ್ಯತೆ",
      titleEn: "Secret Life Expression: Open Confession vs Strict Concealment",
      icon: "🎭",
      badgeKn: `3ನೇ & 8ನೇ ಭಾವ • ${isSecretSign ? "ಸಂಪೂರ್ಣ ಗೌಪ್ಯತೆ" : "ಕುಲ್ಲಂ ಕುಲ್ಲಾ"}`,
      badgeEn: `3rd & 8th Houses • Secrecy Dynamic`,
      bulletKn: secrecyKn,
      bulletEn: secrecyEn,
      astrologicalBasisKn: `3ನೇ ಭಾವ (ಬಹಿರಂಗ ಅಭಿವ್ಯಕ್ತಿ) ಮತ್ತು 8ನೇ ಭಾವ (ಅತ್ಯಂತ ಗುಪ್ತ ಮುಚ್ಚಿಡುವಿಕೆ).`,
      astrologicalBasisEn: `3rd house of expression vs 8th house of absolute concealment.`,
      secrecyHabitKn: secrecyKn,
      secrecyHabitEn: secrecyEn
    },
    {
      id: 7,
      type: "bad",
      titleKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರಾಯಶ್ಚಿತ್ತ & ಗೋಕರ್ಣ ಮುಕ್ತಿ: ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ & ದೋಷ ಪರಿಹಾರ",
      titleEn: "Authentic Vedic Prayashchitta & Sri Kshetra Gokarna Shanti",
      icon: "🕉️",
      badgeKn: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ • ಪ್ರಾಯಶ್ಚಿತ್ತ",
      badgeEn: "Gokarna Atma Linga • Purification",
      bulletKn: `ಜಾತಕದಲ್ಲಿ ಕಂಡ ಈ ನೆರಳು ಪ್ರವೃತ್ತಿಗಳನ್ನು ಮತ್ತು ಪಾಪಕರ್ಮಗಳ ತೀವ್ರತೆಯನ್ನು ಕರಗಿಸಲು, ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಮಹಾಸಂಕಲ್ಪ ಪೂಜೆ, ರಾಹು-ಕೇತು ಶಾಂತಿ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯಗತ್ಯ. ಇದು ನಿಮ್ಮ ಅಂತರಂಗದ ಕಲ್ಮಶಗಳನ್ನು ಭಸ್ಮ ಮಾಡಿ, ಮನಸ್ಸಿಗೆ ಪರಿಶುದ್ಧ ನೆಮ್ಮದಿ ಮತ್ತು ದೈವಿಕ ಶ್ರೀರಕ್ಷೆಯನ್ನು ಕರುಣಿಸಲಿದೆ.`,
      bulletEn: `To dissolve these shadow karmic impulses, performing Atma Linga Sparsha, Prayashchitta Sankalpa Pooja, and Rahu-Ketu Shanti at Sri Kshetra Gokarna Mahabaleshwara cleanses psychic toxins and restores moral fortitude.`,
      astrologicalBasisKn: `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಮಹಿಮೆ ಹಾಗೂ ಪ್ರಾಯಶ್ಚಿತ್ತ ವಿಧಿ.`,
      astrologicalBasisEn: `Gokarna Mahabaleshwara sacred Atma Linga purification rite.`
    }
  ];

  return {
    goodTraits: adultGoodTraits,
    badTraits: adultBadTraits,
    secrecyHabitKn: secrecyKn,
    secrecyHabitEn: secrecyEn,
    gokarnaPrayashchittaKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ರಾಹು-ಕೇತು ಶಾಂತಿ ಸೇವೆ ಸಮರ್ಪಿಸುವುದರಿಂದ ಈ ಸಕಲ ನೆರಳು ಕರ್ಮಗಳು ಮತ್ತು ತಪ್ಪು ಪ್ರವೃತ್ತಿಗಳು ಭಸ್ಮವಾಗಿ ಆತ್ಮಶುದ್ಧಿ ದೊರೆಯಲಿದೆ.`,
    gokarnaPrayashchittaEn: `Perform Prayashchitta Sankalpa Pooja, Atma Linga Sparsha, and Rahu-Ketu Shanti at holy Gokarna Mahabaleshwara Kshetra to burn away shadow karma and cleanse unconscious tendencies.`
  };
};

export const generateCurrentLifeDiagnosis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; gender?: string; devoteeName?: string },
  prescriptions?: AstrologicalPrescriptions
): CurrentLifeDiagnosis => {
  const ageDecimal = ageDecimalYearsAt(context.birthDate, context.birthTime, context.latitude, context.longitude, new Date());
  const devoteeAge = calculateDevoteeAge(context.birthDate);
  const dashaTiming = calculateDynamicDashaTiming(kundli, ageDecimal);
  const liveGochara = calculateLiveGochara(kundli, context);
  const maha = dashaTiming.currentMaha;
  const bhukti = dashaTiming.currentBhukti;

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

  // Turning Point Timeline (100% Dynamic from running Dasha-Bhukti remaining duration & live transits)
  const turningP1 = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(maha)} ಮಹಾದಶೆಯ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿ ಮತ್ತು ಮುಂಬರುವ ಗೋಚಾರ ಗ್ರಹಗಳ ಚಲನೆಯ ಪ್ರಕಾರ, ಇನ್ನು ${dashaTiming.timelineKn} (${dashaTiming.badgeTimelineEn}) ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪ್ರಮುಖ ಸಕಾರಾತ್ಮಕ ತಿರುವು ನಿಖರವಾಗಿ ಘಟಿಸಲಿದೆ.`;
  const turningP2 = `${liveGochara.summaryKn} ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಪ್ರತಿಫಲ ಮತ್ತು ನೂತನ ಅವಕಾಶಗಳು ಒದಗಿಬರಲಿವೆ.`;
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
  const immediateTurningPointEn = `Calculating the running ${maha} Mahadasha and ${bhukti} Antardasha with transits, a major positive turning point will unfold ${dashaTiming.timelineEn}. ${liveGochara.summaryEn}`;
  const siddhaPariharaRemedyEn = `To energize your Lagna Lord, wear an energized ${prescriptions?.gemstoneRing?.primaryGemstoneEn || "Ruby"} (${gemCaratVal}) and adorn sacred ${prescriptions?.rudraksha?.nameEn || "Rudraksha"}. Offer prayers at holy Gokarna Mahabaleshwara Kshetra for lasting grace.`;

  const tenLifeAspectBullets = generate10MasterLifeBulletPoints(
    kundli,
    context,
    prescriptions || ({} as any),
    devoteeAge,
    maha,
    bhukti,
    dashaTiming,
    liveGochara
  );

  const goodBadAnalysis = generateGoodAndBadTraits(
    kundli,
    context,
    maha,
    bhukti,
    prescriptions || ({} as any),
    devoteeAge
  );

  return {
    dashaTiming,
    liveGochara,
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
      runningDashaSummary: `ಪ್ರಸ್ತುತ ಮಹಾದಶಾ: ${toKannadaPlanet(maha)} | ಪ್ರಸ್ತುತ ಭುಕ್ತಿ: ${toKannadaPlanet(bhukti)} (${dashaTiming.timelineKn} ಪೂರ್ಣ). ಈ ಕಾಲಾವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ.`,
      runningGocharaSummary: liveGochara.summaryKn,
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
    tenLifeAspectBullets,
    goodBadAnalysis
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

  const dashaTiming = diagnosis.dashaTiming || calculateDynamicDashaTiming(kundli, 30);
  const remM = dashaTiming.remainingMonths;

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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ಗೋಚಾರ ಗುರುವಿನ ಪೂರ್ಣ ದೃಷ್ಟಿ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳಲಿದ್ದು, ನೂತನ ಉದ್ಯೋಗಾವಕಾಶ ಅಥವಾ ಬಡ್ತಿಯ ಶುಭ ಯೋಗ ಕೂಡಿಬರಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, remM)} Month${Math.max(2, remM) > 1 ? "s" : ""}) ಹೊಸ ಗ್ರಾಹಕರ ಸಂಪರ್ಕ ಮತ್ತು ಹಳೆಯ ಬಾಕಿ ಹಣದ ವಸೂಲಿ ಆರಂಭವಾಗಿ ವ್ಯಾಪಾರ ಲಾಭದಾಯಕ ಹಳಿಗೆ ಮರಳಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(4, Math.round(remM * 0.75)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(4, Math.round(remM * 0.75)))} Month${Math.max(1, Math.min(4, Math.round(remM * 0.75))) > 1 ? "s" : ""}) ಸತ್ಯಾಂಶವು ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಗೆ ಮನವರಿಕೆಯಾಗಿ ನಿಮ್ಮ ಸ್ಥಾನಮಾನ ಮರುಸ್ಥಾಪನೆಯಾಗಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(3, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(3, remM)} Month${Math.max(3, remM) > 1 ? "s" : ""}) ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಯೋಗ್ಯ, ಸಂಸ್ಕಾರಯುತ ಕುಟುಂಬದಿಂದ ವಿವಾಹ ಪ್ರಸ್ತಾಪ ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, Math.min(5, remM))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, Math.min(5, remM))} Month${Math.max(2, Math.min(5, remM)) > 1 ? "s" : ""}) ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರದಿಂದ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಮರಳಿ ಬಂದು ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(4, remM + 2)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(4, remM + 2)} Month${Math.max(4, remM + 2) > 1 ? "s" : ""}) ಗೋಚಾರ ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಸಂತಾನ ಭಾಗ್ಯದ ಶುಭ ಸುದ್ದಿ ಮನೆತುಂಬುವ ಪ್ರಬಲ ಯೋಗವಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(3, Math.round(remM / 2)))} Month${Math.max(1, Math.min(3, Math.round(remM / 2))) > 1 ? "s" : ""}) ಚಂದ್ರನ ಗೋಚಾರ ಬಲ ಸುಧಾರಿಸಲಿದ್ದು ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ ಮರಳಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ (Next 1 Month) ರಕ್ಷಾ ಕವಚದ ಪ್ರಭಾವದಿಂದ ಸಕಲ ದೃಷ್ಟಿ ದೋಷಗಳು ಭಸ್ಮವಾಗಲಿವೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ಹೊಸ ಆದಾಯದ ಮಾರ್ಗ ತೆರೆದುಕೊಂಡು ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ ಇಳಿಯಲಿದೆ.
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

  const dashaTimeText = currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ";
  const p3 = sanitizeAstrologyKannadaText(`ನೀವು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಧೃತಿಗೆಡಬೇಕಾಗಿಲ್ಲ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಇನ್ನು ${dashaTimeText} ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ನೂತನ ಅವಕಾಶಗಳು ಗೋಚರಿಸಲಿವೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವಯುತ ಯಶಸ್ಸು ಖಚಿತವಾಗಿ ಲಭಿಸಲಿದೆ.`);

  const p4 = sanitizeAstrologyKannadaText(`ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಮಾಡಿಸಿ ${prescriptions.gemstoneRing.fingerKn}ಕ್ಕೆ ${prescriptions.gemstoneRing.activationDay} ದಿನ ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಇದರೊಂದಿಗೆ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಹಾಗೂ ${currentDiagnosis.prasthuthaSthiti.immediateRemedies.join(" ")}. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿಸುವ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`);

  const yajnaHawanaPlan = generateYajnaHawanaPlan(kundli, {
    runningDashaMaha: currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.trim(),
    runningDashaBhukti: currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[1]?.trim(),
    primaryChallenge: currentDiagnosis.primaryLifeChallenge.area,
    devoteeName: context.devoteeName,
    dynamicTimelineKn: currentDiagnosis.dashaTiming?.timelineKn
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
    goodBadAnalysis: currentDiagnosis.goodBadAnalysis,
    instantQAList,
    multiParagraphExecutiveReading: [p1, p2, p3, p4],
    yajnaHawanaPlan
  };
};

/**
 * Generates an authoritative, 100% authentic classical Vedic Pandit consultation response.
 * Completely deterministic fallback ensuring clients and priests receive deep, instant answers
 * to any question regarding:
 * 1. Child crying all day, tantrums, kiri-kiri, fighting, refusing food (Balarishta, Moon in 6/8/12, Pitta colic, Balagraha, Drishti).
 * 2. Alcohol & drinking habit / substance addictions (Saturn aspecting 2nd from 8th, Rahu in 2nd/8th, daily habit vs social drinking).
 * 3. External affairs / sensual cravings / interested in women vs men vs same-gender attraction (Venus-Mars, Venus-Rahu, Mercury-Saturn in 7th/8th).
 * 4. Unethical work, smuggling (ಕಳ್ಳಸಾಗಣೆ), betting, black money, illicit gains (Rahu in 8th/10th/11th).
 * 5. Financial turning points, career, marriage, health, and general life path.
 */
export const generateVedicConsultationAnswer = (
  kundli: KundliOutput,
  currentDiagnosis: CurrentLifeDiagnosis,
  prescriptions: AstrologicalPrescriptions,
  question: string,
  devoteeName?: string,
  isKn: boolean = true,
  devoteeAge?: number,
  gender?: string
): string => {
  const devoteeNameFormatted = devoteeName?.trim() || (isKn ? "ಭಕ್ತರೇ" : "Devotee");
  const age = devoteeAge !== undefined ? devoteeAge : 30;
  const isChild = age < 14;
  const isMale = (gender || "").toLowerCase() === "female" ? false : true;
  const qLower = question.toLowerCase();

  const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);
  const lagnaEn = kundli.lagnaRashi.english;
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const moonRashiEn = kundli.moonSign.english;
  const moonNakKn = toKannadaNakshatra(kundli.planets.find(p => p.name === PlanetName.Moon)?.nakshatra.english);

  const houseDist = (fromH: number, toH: number): number => ((toH - fromH + 12) % 12) + 1;

  const sun = kundli.planets.find(p => p.name === PlanetName.Sun);
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const mercury = kundli.planets.find(p => p.name === PlanetName.Mercury);
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);

  // Question Intent Categorization
  const isChildQuery = /ಅಳು|ಕಿರಿಕಿರಿ|ಜಗಳ|ಹಠ|ಊಟ|ನಿದ್ರೆ|ಮಗು|ಬಾಲ|cry|crying|tantrum|fight|quarrel|stubborn|food|eat|colic|balarishta|child|baby/.test(qLower);
  const isAddictionQuery = /ಮದ್ಯ|ಕುಡಿ|ವ್ಯಸನ|ದುಶ್ಚಟ|ಡ್ರಿಂಕ್|ಆಲ್ಕೋಹಾಲ್|ಸಿಗರೇಟು|ಧೂಮಪಾನ|drink|drinking|alcohol|addiction|liquor|smoke|substance/.test(qLower);
  const isIllegalQuery = /ಕಳ್ಳಸಾಗಣೆ|ಸ್ಮಗ್ಲಿಂಗ್|ಅಕ್ರಮ|ಅಡ್ಡದಾರಿ|ಬೆಟ್ಟಿಂಗ್|ಹವಾಲಾ|ಕಪ್ಪು ಹಣ|ಜೈಲು|ಕಾನೂನು|smuggle|smuggling|illegal|unethical|black money|betting|gambling|shortcut|police|court/.test(qLower);
  const isAffairQuery = /ಅಫೇರ್|ಪರಸ್ತ್ರೀ|ಪರಪುರುಷ|ದಾಂಪತ್ಯೇತರ|ಕಾಮನೆ|ಲೈಂಗಿಕ ಆಕರ್ಷಣೆ|ಗುಪ್ತ ಪ್ರೇಮ|ವ್ಯಾಮೋಹ|ಕಾಮ|affair|extramarital|secret romance|sensual craving/.test(qLower);
  const isFinanceCareerQuery = /ಹಣ|ಆರ್ಥಿಕ|ದುಡ್ಡು|ಸಂಪತ್ತು|ಸಾಲ|ಉದ್ಯೋಗ|ಕೆಲಸ|ವ್ಯಾಪಾರ|ತಿರುವು|ಅಭಿವೃದ್ಧಿ|ಪ್ರಮೋಷನ್|money|wealth|finance|debt|job|career|business|turning point|promotion/.test(qLower);
  const isMarriageQuery = /ವಿವಾಹ|ಮದುವೆ|ಕಳತ್ರ|ವರ|ವಧು|marriage|wedding|spouse|partner|match/.test(qLower);

  // Deep Astrological Metrics
  // Alcohol / Addiction
  let addictionScore = 0;
  if ([saturn, rahu, mars, ketu].some(p => p && p.house === 2)) addictionScore += 2.0;
  if (saturn && [3, 7, 10].includes(houseDist(saturn.house, 2))) addictionScore += 2.0;
  if (mars && [4, 7, 8].includes(houseDist(mars.house, 2))) addictionScore += 1.5;
  if (rahu && [5, 7, 9].includes(houseDist(rahu.house, 2))) addictionScore += 1.5;
  if ([saturn, rahu, mars].some(p => p && p.house === 8)) addictionScore += 1.5;
  if ([saturn, rahu, mars].some(p => p && p.house === 12)) addictionScore += 1.5;
  const isDailyDrinking = addictionScore >= 2.5;
  const isSocialDrinking = addictionScore >= 1.0 && addictionScore < 2.5;

  // Sensual & Affairs
  const neuterSigns = [2, 5, 10]; // Gemini, Virgo, Aquarius
  const venusSign = venus?.rashi.index ?? 0;
  const hasSameGenderAffinity = (
    (venus && mercury && Math.abs(venus.house - mercury.house) === 0 && (saturn?.house === 7 || saturn?.house === 8 || rahu?.house === 7 || ketu?.house === 7)) ||
    (venus && [7, 8].includes(venus?.house ?? 1) && mercury && [7, 8].includes(mercury.house) && neuterSigns.includes(venusSign))
  );
  let sensualScore = 0;
  if (venus && mars && Math.abs(venus.house - mars.house) <= 1) sensualScore += 2.0;
  if (venus && rahu && Math.abs(venus.house - rahu.house) <= 1) sensualScore += 2.0;
  if ([7, 8, 12].includes(venus?.house ?? 1)) sensualScore += 1.5;
  if ([rahu, ketu, mars, saturn].some(p => p && p.house === 7)) sensualScore += 1.5;
  if ([rahu, ketu, mars, saturn].some(p => p && p.house === 12)) sensualScore += 1.5;
  const hasSensual = sensualScore >= 2.0;

  // Unethical & Smuggling
  let illegalScore = 0;
  if (rahu && rahu.house === 8) illegalScore += 2.5;
  if (rahu && [10, 11].includes(rahu.house)) illegalScore += 2.0;
  if (mars && mars.house === 8) illegalScore += 2.0;
  if (saturn && saturn.house === 8) illegalScore += 1.5;
  if (mercury && [8, 10, 12].includes(mercury.house) && (rahu && Math.abs(mercury.house - rahu.house) === 0)) illegalScore += 2.0;
  const hasIllegal = illegalScore >= 2.0;

  // Child Balarishta & Colic
  const isBalarishta = moon && [6, 8, 12].includes(moon.house);
  const hasPittaColic = mars && [1, 2, 5, 8].includes(mars.house);
  const hasDrishtiDosha = (
    (rahu && [1, 5, 7, 9].includes(houseDist(rahu.house, moon?.house ?? 1))) ||
    (ketu && [1, 5, 7, 9].includes(houseDist(ketu.house, moon?.house ?? 1))) ||
    (saturn && [3, 7, 10].includes(houseDist(saturn.house, moon?.house ?? 1)))
  );

  const dashaTimeText = currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ 4 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ";
  const dashaTimeTextEn = currentDiagnosis.dashaTiming?.timelineEn || "in the upcoming 4 to 6 months";

  // 1. CHILD BEHAVIOR & CRYING CONSULTATION
  if (isChild || isChildQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕವನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ಲಗ್ನ ${lagnaKn}, ಚಂದ್ರ ರಾಶಿ ${moonRashiKn} (${moonNakKn} ನಕ್ಷತ್ರ). ${isBalarishta ? "ಚಂದ್ರನು 6/8/12ನೇ ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದು ಬಾಲಾರಿಷ್ಟ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಬಾಲಗ್ರಹ ಪ್ರಭಾವವನ್ನು ಉಂಟುಮಾಡುತ್ತಿದ್ದಾನೆ." : "ಚಂದ್ರನ ಮೇಲೆ ನೆರಳು ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ."} ${hasPittaColic ? "ಕುಜ ಗ್ರಹದ ಉಗ್ರ ಪಿತ್ತ ತತ್ವವು 2ನೇ ಮುಖ/ಆಹಾರ ಹಾಗೂ 5ನೇ ಜಠರ ಸ್ಥಾನದ ಮೇಲೆ ಒತ್ತಡ ತರುತ್ತಿದೆ." : "ಲಗ್ನದ ಮೇಲೆ ತೀಕ್ಷ್ಣ ಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇದೆ."}

• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ನೈಜ ಕಾರಣ: ಮಗು ಬೆಳಿಗ್ಗೆಯಿಂದ ಸಂಜೆವರೆಗೆ ನಿರಂತರವಾಗಿ ಅಳುವುದು, ಸಣ್ಣ ವಿಷಯಕ್ಕೂ ಕಿರಿಕಿರಿ ಮಾಡುವುದು, ಇತರ ಮಕ್ಕಳೊಂದಿಗೆ ಜಗಳವಾಡುವುದು ಹಾಗೂ ಸಾಮಾನುಗಳನ್ನು ಎಸೆಯುವುದು ಕೇವಲ ಹಠಮಾರಿತನವಲ್ಲ. ಇದು ಶಾಸ್ತ್ರದಲ್ಲಿ ಹೇಳಲಾದ 'ಬಾಲಗ್ರಹ ಪೀಡೆ' ಹಾಗೂ ಜಠರದಲ್ಲಿ ಉಂಟಾಗುವ ತೀವ್ರ ಪಿತ್ತ ಶೂಲೆ (Pitta Colic / Gastric Spasm). ಮಗುವಿಗೆ ತನ್ನ ಹೊಟ್ಟೆಯ ಅಸಹನೀಯ ಉರಿ ಮತ್ತು ನೋವನ್ನು ಹೇಳಲು ತಿಳಿಯದೆ, ನಿರಂತರ ಅಳು, ಕಿರಿಕಿರಿ ಮತ್ತು ಕೈಗೆ ಸಿಕ್ಕ ಸಾಮಾನುಗಳನ್ನು ಎಸೆಯುವ ಆಕ್ರೋಶದ ರೂಪದಲ್ಲಿ ಹೊರಹಾಕುತ್ತದೆ. ಅಲ್ಲದೆ, ${hasDrishtiDosha ? "ಸಾರ್ವಜನಿಕರ ದೃಷ್ಟಿ ದೋಷದಿಂದ (Evil Eye) ರಾತ್ರಿ ನಿದ್ದೆಯಲ್ಲಿ ಹಠಾತ್ ಬೆದರಿ ಎಚ್ಚರಗೊಂಡು ಅಳುವ ಲಕ್ಷಣಗಳಿವೆ." : "ಸಂಜೆ ವೇಳೆಯಲ್ಲಿ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಸ್ಪರ್ಶದಿಂದ ಕಿರಿಕಿರಿ ಹೆಚ್ಚಾಗುತ್ತದೆ."}

• ⏳ ನಿಖರ ಪರಿಹಾರ ಕಾಲಾವಧಿ: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯ ಲೆಕ್ಕಾಚಾರದಂತೆ, ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳಲ್ಲಿ ಗ್ರಹಗಳ ಗೋಚಾರ ಶಾಂತವಾಗುತ್ತಿದ್ದಂತೆ ಮಗುವಿನ ಈ ಅಳು ಮತ್ತು ಕಿರಿಕಿರಿ ಗಣನೀಯವಾಗಿ ಉಪಶಮನಗೊಳ್ಳಲಿದೆ.

• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪರಿಹಾರ: ಮಗುವಿನ ಈ ದೋಷ ಶಮನಕ್ಕಾಗಿ, ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯ ರಕ್ಷಾ ಭಸ್ಮವನ್ನು ಮಗುವಿನ ಹಣೆಗೆ ನಿತ್ಯ ಧಾರಣೆ ಮಾಡಿಸಿ. ಮನೆಯಲ್ಲಿ ಪ್ರತಿದಿನ ಸಂಜೆ 7 ಗಂಟೆಗೆ ಸ್ವಲ್ಪ ಕಲ್ಲುಪ್ಪು ಹಾಗೂ ಸಾಸಿವೆಯಿಂದ ಮಗುವಿಗೆ ದೃಷ್ಟಿ ತೆಗೆದು ಬೆಂಕಿಗೆ ಹಾಕಿ. ಇದರಿಂದ ಮಗು ಸುಖವಾಗಿ ನಿದ್ರಿಸಿ ಹರ್ಷಚಿತ್ತದಿಂದ ನಲಿಯಲಿದೆ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have examined the child's birth chart with rigorous Vedic scrutiny.

• 🎯 Planetary Alignment: Ascendant ${lagnaEn}, Moon Sign ${moonRashiEn}. ${isBalarishta ? "The Moon occupies the 6th/8th/12th Dusthana, triggering classic Balarishta sensitivities and Balagraha influences." : "The Moon is under nodal tension."} ${hasPittaColic ? "Mars casts intense Pitta fire onto the 2nd house of intake and 5th house of digestion." : ""}

• ⚠️ Astrological Root Cause: The child's persistent crying from morning to evening, frequent tantrums, fighting with peers, and throwing toys is not mere behavioral disobedience. It is caused by Balagraha sensitivity combined with severe abdominal Pitta colic (gastrointestinal spasms). Because the child cannot verbally articulate internal stomach burns, it erupts as inconsolable screams and aggressive irritability. Furthermore, ${hasDrishtiDosha ? "ocular vulnerability (evil eye / Drishti dosha) causes abrupt frights and startles during sleep." : "twilight transitions agitate sensory comfort."}

• ⏳ Accurate Relief Timeline: Under the ongoing ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, planetary gochara will soften over the next 3 to 6 months, bringing noticeable calmness and peaceful sleep.

• 🪔 Prescribed Mantra & Gokarna Shanti: Perform Balagraha Shanti and Mahamrityunjaya Sankalpa Seva at holy Sri Kshetra Gokarna Kotiteertha. Apply sacred Gokarna Mahabaleshwara Raksha Bhasma daily on the child's forehead. At home, rotate rock salt and mustard seeds around the child at 7:00 PM daily to dispel lingering evil eye afflictions.`
      );
    }
  }

  // 2. ALCOHOL & ADDICTIONS CONSULTATION
  if (isAddictionQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಮದ್ಯಪಾನ ಹಾಗೂ ವ್ಯಸನಗಳ ನೈಜ ಸ್ಥಿತಿಯ ದೃಷ್ಟಿಯಿಂದ ನಿಖರವಾಗಿ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನ ${saturn?.house === 8 ? "8ನೇ ಮನೆಯಲ್ಲಿರುವ ಶನಿಯ 7ನೇ ನೇರ ದೃಷ್ಟಿಗೆ ಒಳಗಾಗಿದೆ — ಇದು ಶಾಸ್ತ್ರದಲ್ಲಿ ನಿತ್ಯ ಮದ್ಯಪಾನದ ಪ್ರಬಲ ಸಂಕೇತ." : ([saturn, rahu, mars, ketu].some(p => p && p.house === 2) ? "2ನೇ ಮನೆಯಲ್ಲೇ ಪಾಪಗ್ರಹಗಳು ಸ್ಥಿತವಾಗಿದ್ದು ಮುಖದ ಸೇವನೆಯನ್ನು ಕೆಡಿಸುತ್ತಿವೆ." : "ಮತ್ತು 8ನೇ ರಹಸ್ಯ ಸ್ಥಾನಗಳ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ನೆರಳು ಪ್ರಭಾವವಿದೆ.")}

• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ನೈಜ ಕಾರಣ: ${isDailyDrinking ? "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಇದು ಸಾಂದರ್ಭಿಕವಲ್ಲ; ಬದಲಿಗೆ ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ (Daily Alcohol Habit) ಹಾಗೂ ಅಮಲು ಪದಾರ್ಥಗಳ ತೀವ್ರ ವ್ಯಸನದ ರೂಪದಲ್ಲಿದೆ. ಸಂಜೆಯಾಗುತ್ತಿದ್ದಂತೆ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡ ಎದುರಾದಾಗ ಮದ್ಯದ ಸೆಳೆತ ನಿಯಂತ್ರಣ ಮೀರುತ್ತದೆ. ಇದರಿಂದ ಯಕೃತ್ತು (Liver), ನರಮಂಡಲ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಕ್ಷೀಣಿಸುವ ತೀವ್ರ ಅಪಾಯವಿದೆ. ಇದಕ್ಕೆ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಕಲ್ಪ ಮುಕ್ತಿ ಅನಿವಾರ್ಯ." : (isSocialDrinking ? "ಇದು ಸ್ನೇಹಿತರ ಸಹವಾಸ, ಪಾರ್ಟಿ ಹಾಗೂ ಮನರಂಜನೆಯ ನೆಪದಲ್ಲಿ ಆರಂಭವಾಗಿ ಕ್ರಮೇಣ ಚಟವಾಗಿ ಬದಲಾಗುವ ಸಾಮಾಜಿಕ ಮದ್ಯಪಾನದ (Social Drinking) ಅಪಾಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಆತ್ಮನಿಯಂತ್ರಣ ತಪ್ಪದಂತೆ ತಕ್ಷಣ ಎಚ್ಚೆತ್ತುಕೊಳ್ಳಬೇಕು." : "ನಿಮ್ಮ 2ನೇ ಸ್ಥಾನವು ಸಾತ್ವಿಕವಾಗಿದ್ದು, ಮನಸ್ಸನ್ನು ದೃಢವಾಗಿಟ್ಟುಕೊಂಡರೆ ಯಾವುದೇ ದುಶ್ಚಟಗಳಿಗೆ ಬಲಿಯಾಗದೆ ಸಂಪೂರ್ಣ ಆರೋಗ್ಯಕರವಾಗಿ ಮುನ್ನಡೆಯುವ ಆತ್ಮಬಲ ನಿಮ್ಮಲ್ಲಿದೆ.")}

• ⏳ ನಿಖರ ಮುಕ್ತಿ ಕಾಲಾವಧಿ: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ, ${dashaTimeText} ದೈವಿಕ ಸಂಕಲ್ಪ ಕೈಗೊಂಡರೆ ಈ ವ್ಯಸನದ ಸೆಳೆತದಿಂದ ಸಂಪೂರ್ಣ ಶಾಶ್ವತ ಮುಕ್ತಿ ಹೊಂದಲು ಸಾಧ್ಯ.

• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪ್ರಾಯಶ್ಚಿತ್ತ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಮಹಾಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ರಾಹು-ಕೇತು ಶಾಂತಿ ಸೇವೆ ಸಲ್ಲಿಸಿ. ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಪಂಚಾಕ್ಷರಿ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಜಪಿಸಿ ಪವಿತ್ರ ತೀರ್ಥ ಸೇವಿಸುವುದರಿಂದ ಮದ್ಯದ ಅಮಲು ಸೆಳೆತ ಕ್ರಮೇಣ ನಾಶವಾಗಲಿದೆ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart specifically regarding alcohol and substance tendencies.

• 🎯 Planetary Alignment: The 2nd house of oral intake ${saturn?.house === 8 ? "receives the direct 7th aspect from Saturn in the 8th house — the quintessential classical signature of daily alcohol consumption." : ([saturn, rahu, mars, ketu].some(p => p && p.house === 2) ? "is directly occupied by malefics, corrupting dietary restraint." : "is under nodal and dusthana afflictions.")}

• ⚠️ Astrological Root Cause: ${isDailyDrinking ? "This indicates an authentic, daily drinking habit and deep-seated substance craving. Under evening solitude or stressful triggers, sensory control deteriorates, posing a severe threat to liver vitality and familial peace." : (isSocialDrinking ? "Planetary aspects indicate episodic peer-driven and party drinking vulnerability, where casual indulgence risks sliding into habitual dependency." : "Your 2nd house exhibits sattvic resilience, granting natural immunity against toxic addictions when mental resolve is maintained.")}

• ⏳ Accurate Relief Timeline: Under the current ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, committing to detox ${dashaTimeTextEn} will permanently dissolve the substance grip.

• 🪔 Prescribed Mantra & Gokarna Shanti: Perform Atma Linga Sparsha, Prayashchitta Sankalpa Pooja, and Rahu-Ketu Shanti at Sri Kshetra Gokarna Mahabaleshwara. Chant the Shiva Panchakshari Mantra 108 times at dawn to purify oral impulses.`
      );
    }
  }

  // 3. EXTERNAL AFFAIRS, GENDER ATTRACTIONS & SENSUAL REALITY
  if (isAffairQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಕಾಮನೆ, ಆಕರ್ಷಣೆ ಹಾಗೂ ದಾಂಪತ್ಯ ರಹಸ್ಯಗಳ ವಿಷಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮವಾಗಿ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ (ಕಾಮ), 8ನೇ ರಹಸ್ಯ ಹಾಗೂ 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ, ರಾಹು, ಬುಧ ಮತ್ತು ಶನಿ ಗ್ರಹಗಳ ಸಂಯೋಗ ಹಾಗೂ ದೃಷ್ಟಿ ಪ್ರಭಾವವಿದೆ.

• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ನೈಜ ಕಾರಣ: ${hasSameGenderAffinity ? `ನಿಮ್ಮ ಜಾತಕದ 7ನೇ ಮತ್ತು 8ನೇ ಭಾವಗಳಲ್ಲಿ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರರ ವಿಶಿಷ್ಟ ತತ್ವ ಇರುವುದರಿಂದ, ನಿಮ್ಮ ಅಂತರಂಗದ ಲೈಂಗಿಕ ಆಕರ್ಷಣೆ ಮತ್ತು ಕಾಮನೆಯು ${isMale ? "ಪುರುಷರತ್ತ (Same-Gender Attraction)" : "ಮಹಿಳೆಯರತ್ತ"} ಸೆಳೆಯುವ ಪ್ರಬಲ ಲಕ್ಷಣಗಳಿವೆ. ಸಮಾಜದ ಸಾಂಪ್ರದಾಯಿಕ ನಿರೀಕ್ಷೆಗಳಿಗೆ ಹೆದರಿ ಈ ಆಕರ್ಷಣೆಯನ್ನು ಅಂತರಂಗದಲ್ಲೇ ಅತ್ಯಂತ ಗೌಪ್ಯವಾಗಿ ಮುಚ್ಚಿಡುವ ಪ್ರವೃತ್ತಿ ಇದೆ.` : (hasSensual ? (isMale ? "7ನೇ ಕಳತ್ರ ಮತ್ತು 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ-ರಾಹುವಿನ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯದ ಆಚೆಗೆ ಹೊರಗಿನ ಸ್ತ್ರೀಯರತ್ತ (ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ), ರಹಸ್ಯ ಫೋನ್ ಕರೆಗಳು ಹಾಗೂ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ತೀವ್ರ ಅಪಾಯದ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ. ಇದು ನಿಮ್ಮ ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವಕ್ಕೆ ನೇರ ಕುತ್ತು ತರಬಹುದು." : "7ನೇ ಮತ್ತು 8ನೇ ಭಾವಗಳಲ್ಲಿ ಕುಜ-ರಾಹುವಿನ ಸೆಳೆತದಿಂದಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅತೃಪ್ತಿ ಉಂಟಾದಾಗ ಹೊರಗಿನ ಪರಪುರುಷರತ್ತ ಭಾವನಾತ್ಮಕ ಹಾಗೂ ರಹಸ್ಯ ಪ್ರೇಮ ಸೆಳೆತ ಉಂಟಾಗುವ ಅಪಾಯವಿದೆ.") : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಕೌಟುಂಬಿಕ ಸದಾಚಾರದ ಬಲವಾದ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ. ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳಿಗೆ ಜಾರದ ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ.")}

• ⏳ ಎಚ್ಚರಿಕೆಯ ಕಾಲಾವಧಿ: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಸಮಯದಲ್ಲಿ ನೈತಿಕ ಶಿಸ್ತು ಹಾಗೂ ರಹಸ್ಯ ಸಂವಹನಗಳಿಂದ ದೂರವಿರುವುದು ಅತ್ಯಗತ್ಯ; ಇಲ್ಲದಿದ್ದರೆ ಗುಪ್ತ ಸಂಬಂಧಗಳು ಸಾರ್ವಜನಿಕವಾಗಿ ಬಯಲಾಗಿ ತೀವ್ರ ಮಾನಹಾನಿ ಉಂಟಾಗುವ ಗ್ರಹಗತಿಯಿದೆ.

• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪರಿಹಾರ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ಶುಕ್ರ-ರಾಹು ಶಾಂತಿ ಮಾಡಿಸಿ. ${prescriptions.rudraksha.nameKn} ಧಾರಣೆಯಿಂದ ಮನಸ್ಸಿನ ಕಾಮ ಪ್ರಚೋದನೆ ಶಾಂತವಾಗಿ ದಾಂಪತ್ಯ ನಿಷ್ಠೆ ರಕ್ಷಿಸಲ್ಪಡುತ್ತದೆ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding sensual desires and relationship boundaries.

• 🎯 Planetary Alignment: The 7th house of partnership, 8th house of secret liaisons, and 12th house of pleasure reflect configurations involving Venus, Rahu, Mars, Mercury, and Saturn.

• ⚠️ Astrological Root Cause: ${hasSameGenderAffinity ? `Vedic yogas involving Mercury and Saturn across kama and secret houses indicate internal sexual affinity toward ${isMale ? "men (same-gender orientation)" : "women"}, maintained with strict confidentiality.` : (hasSensual ? (isMale ? "Venus-Rahu proximity on the 7th/12th axis creates intense vulnerability toward women outside marriage (extramarital liaisons and secret conversations), posing a direct threat to marital honor." : "Mars-Rahu tension on the 7th/8th axis generates vulnerability toward outside men during relationship disputes.") : "A protected 7th house shields you with moral rectitude, sensual discipline, and faithful commitment to marital sanctity.")}

• ⏳ Critical Caution Timeline: During the ongoing ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, exercise strict boundaries to prevent confidential indiscretions from exploding into public embarrassment.

• 🪔 Prescribed Mantra & Gokarna Shanti: Perform Uma-Maheshwara Pooja and Venus-Rahu Shanti at Sri Kshetra Gokarna. Wearing the prescribed ${prescriptions.rudraksha.nameEn} calms sensual agitation and anchors ethical integrity.`
      );
    }
  }

  // 4. UNETHICAL WORK, SMUGGLING & SHORTCUT WEALTH
  if (isIllegalQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಧನಾರ್ಜನೆ, ಅಕ್ರಮ ವ್ಯವಹಾರ ಹಾಗೂ ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್) ರಿಸ್ಕ್ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ಜಾತಕದ 8ನೇ ರಹಸ್ಯ/ಅಕ್ರಮ ಸ್ಥಾನ ಅಥವಾ 11ನೇ ಲಾಭ ಭಾವದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹುವಿನ ಪ್ರಬಲ ಪ್ರಭಾವವಿದೆ.

• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ನೈಜ ಕಾರಣ: ${hasIllegal ? "ಜಾತಕದಲ್ಲಿ ಶ್ರಮವಿಲ್ಲದೆ ತ್ವರಿತವಾಗಿ ಕೋಟಿಗಟ್ಟಲೆ ಹಣ ಗಳಿಸುವ ಅಡ್ಡದಾರಿ, ಕಳ್ಳಸಾಗಣೆ (Smuggling), ಬೆಟ್ಟಿಂಗ್, ಹವಾಲಾ ಅಥವಾ ಅಕ್ರಮ ಕಪ್ಪು ಹಣದ ವ್ಯವಹಾರಗಳತ್ತ ಮನಸ್ಸು ತೀವ್ರವಾಗಿ ಆಕರ್ಷಿತವಾಗುವ ದುಸ್ಸಾಹಸ ಯೋಗವಿದೆ. ಆರಂಭದಲ್ಲಿ ದೊಡ್ಡ ಪ್ರಮಾಣದ ಅಕ್ರಮ ಲಾಭ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಪೊಲೀಸ್ ಕೇಸ್, ಕಸ್ಟಮ್ಸ್/ಐಟಿ ದಾಳಿ, ಕೋರ್ಟ್ ಸಂಕೋಲೆ, ಜೈಲು ಭಯ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾನಹಾನಿಯ ಅಪಾಯ ತಂದೊಡ್ಡಲಿದೆ. ಅಡ್ಡದಾರಿ ಹಣ ಎಂದಿಗೂ ನೆಮ್ಮದಿ ಕೊಡುವುದಿಲ್ಲ." : "ನಿಮ್ಮ ಧರ್ಮ-ಕರ್ಮ ಸ್ಥಾನಗಳು ಶುದ್ಧವಾಗಿದ್ದು, ಅಕ್ರಮ ವ್ಯವಹಾರ ಅಥವಾ ಕಳ್ಳಸಾಗಣೆಯ ದುಸ್ಸಾಹಸಕ್ಕೆ ಕೈಹಾಕದೆ ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ದುಡಿಮೆಯಲ್ಲಿ ಬೆಳೆಯುವ ಸದ್ಬುದ್ಧಿ ನಿಮ್ಮಲ್ಲಿದೆ. ಯಾವುದೇ ಶಾರ್ಟ್‌ಕಟ್ ಆಮಿಷಗಳಿಗೆ ಮರುಳಾಗಬೇಡಿ."}

• ⏳ ನಿರ್ಣಾಯಕ ಎಚ್ಚರಿಕೆಯ ಅವಧಿ: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ ಕಾನೂನುಬಾಹಿರ ಕೃತ್ಯಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ; ಇಲ್ಲದಿದ್ದರೆ ಅನಿರೀಕ್ಷಿತ ಕಾನೂನಿನ ಬಲೆಗೆ ಸಿಲುಕುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು.

• 🪔 ಗೋಕರ್ಣ ಪ್ರಾಯಶ್ಚಿತ್ತ & ರಕ್ಷೆ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ರಾಹು-ಕಾಲಸರ್ಪ ಶಾಂತಿ, ಸುಬ್ರಹ್ಮಣ್ಯ ಆಶ್ಲೇಷ ಬಲಿ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಅಕ್ರಮ ಸಂಪಾದನೆಯ ದುರಾಸೆಯನ್ನು ತ್ಯಜಿಸಿ ಸನ್ಮಾರ್ಗದ ಪ್ರಾಮಾಣಿಕ ವ್ಯಾಪಾರದಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have examined your birth chart regarding unearned wealth, smuggling, and high-risk shortcuts.

• 🎯 Planetary Alignment: Rahu heavily influences the 8th house of illicit wealth and the 11th house of rapid speculation.

• ⚠️ Astrological Root Cause: ${hasIllegal ? "Rahu in the 8th/11th axis instigates a reckless appetite for quick-money schemes, smuggling, contraband trade, hawala, or grey-market betting. While initial cash surges may appear tempting, the eventual outcome triggers police arrests, customs raids, criminal litigation, and public disgrace. Illicit money never brings lasting peace." : "Your dharma and karma houses remain uncorrupted, anchoring your prosperity in legitimate labor and ethical commerce. Continue resisting unlawful shortcuts."}

• ⏳ Critical Caution Timeline: Under the running ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, maintain strict regulatory compliance to avoid severe legal penalties.

• 🪔 Prescribed Mantra & Gokarna Shanti: Perform Rahu-Kala Sarpa Shanti and Subrahmanya Ashlesha Bali at Sri Kshetra Gokarna Kotiteertha. Channel your entrepreneurial fire into fully transparent, licensed enterprises.`
      );
    }
  }

  // 5. FINANCE, CAREER & TURNING POINT
  if (isFinanceCareerQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಆರ್ಥಿಕ ಪ್ರಗತಿ, ಉದ್ಯೋಗ ಹಾಗೂ ಧನ ಯೋಗದ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${currentDiagnosis.technicalAspects.tenthHouseDetail}) ಹಾಗೂ 2ನೇ ಧನಕೋಶದ ಮೇಲೆ ಗ್ರಹಗಳ ಸಮ್ಮಿಶ್ರ ಪ್ರಭಾವವಿದೆ.

• ⚠️ ನೈಜ ಸವಾಲು & ಕಾರಣ: ${currentDiagnosis.primaryLifeChallenge.description}. ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}.

• ⏳ ನಿಖರ ತಿರುವು ಕಾಲಾವಧಿ: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ದಶಾ ಕಾಲದಲ್ಲಿ, ಇನ್ನು ${dashaTimeText} ನಿಮ್ಮ ಜೀವನದ ದೊಡ್ಡ ಆರ್ಥಿಕ ತಿರುವು ಗೋಚರಿಸಲಿದ್ದು, ನೂತನ ಆದಾಯ ಮಾರ್ಗಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ.

• 🪔 ಅಭಿವೃದ್ಧಿ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆ: ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಧಾರಣೆ ಮಾಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗಣಪತಿ ಹವನ ಸಮರ್ಪಿಸುವುದರಿಂದ ಸಕಲ ಆರ್ಥಿಕ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗಲಿವೆ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding career trajectory and financial momentum.

• 🎯 Planetary Alignment: 10th house of career (${currentDiagnosis.technicalAspects.tenthHouseDetail}) and 2nd house of wealth dictate your professional elevation.

• ⚠️ Astrological Root Cause: ${currentDiagnosis.primaryLifeChallenge.description}. ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}.

• ⏳ Accurate Turning Point Timeline: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, a decisive breakthrough unfolds ${dashaTimeTextEn}, opening stable revenue channels.

• 🪔 Prescribed Gemstone & Gokarna Seva: Wear ${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight}) set in ${prescriptions.gemstoneRing.metalEn}. Sponsor Rudrabhisheka and Ganapati Homa at Sri Kshetra Gokarna Mahabaleshwara.`
      );
    }
  }

  // 6. MARRIAGE & PARTNERSHIP
  if (isMarriageQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ವಿವಾಹ ಯೋಗ ಮತ್ತು ದಾಂಪತ್ಯ ಬಾಂಧವ್ಯದ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${currentDiagnosis.technicalAspects.seventhHouseDetail}) ಹಾಗೂ ಕಳತ್ರಕಾರಕ ಶುಕ್ರ/ಗುರುಗಳ ಸ್ಥಿತಿ ವಿವಾಹ ಕಾಲವನ್ನು ನಿರ್ಧರಿಸುತ್ತಿದೆ.

• ⚠️ ನೈಜ ಸವಾಲು & ಕಾರಣ: ${currentDiagnosis.technicalAspects.seventhHouseDetail}. ಮಾಂಗಲ್ಯ ಅಥವಾ ಶನಿ-ಕುಜರ ದೃಷ್ಟಿ ಪ್ರಭಾವದಿಂದ ವಿವಾಹದಲ್ಲಿ ಅಡೆತಡೆ ಅಥವಾ ದಾಂಪತ್ಯದಲ್ಲಿ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಉಂಟಾಗುತ್ತಿದೆ.

• ⏳ ನಿಖರ ವಿವಾಹ/ಶಾಂತಿ ಕಾಲಾವಧಿ: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಕಾಲದಲ್ಲಿ, ಇನ್ನು ${dashaTimeText} ಶುಭ ಮುಹೂರ್ತ ಹಾಗೂ ವಿವಾಹ ಮಾತುಕತೆಗಳಲ್ಲಿ ಸಫಲತೆ ದೊರೆಯಲಿದೆ.

• 🪔 ದಾಂಪತ್ಯ ಶಾಂತಿ & ಗೋಕರ್ಣ ಸೇವೆ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ನೆರವೇರಿಸಿ. ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding marriage timing and matrimonial harmony.

• 🎯 Planetary Alignment: 7th house of marriage (${currentDiagnosis.technicalAspects.seventhHouseDetail}) and Kalatrakaraka govern relationship dynamics.

• ⚠️ Astrological Root Cause: ${currentDiagnosis.technicalAspects.seventhHouseDetail}. Saturn-Mars aspects or Kuja Dosha factors require pacification to remove marriage delays.

• ⏳ Accurate Matrimonial Timeline: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, favorable matrimonial progress materializes ${dashaTimeTextEn}.

• 🪔 Prescribed Remedies & Gokarna Seva: Sponsor Uma-Maheshwara Pooja and Navagraha Shanti at Sri Kshetra Gokarna Mahabaleshwara, and wear ${prescriptions.rudraksha.nameEn}.`
      );
    }
  }

  // 7. GENERAL / FALLBACK INQUIRY
  if (isKn) {
    return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಕೂಲಂಕಷವಾಗಿ ನೋಡಿದೆ.

• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನ ಹಾಗೂ ${moonRashiKn} ರಾಶಿಯ (${moonNakKn} ನಕ್ಷತ್ರ) ಜಾತಕದಲ್ಲಿ, ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ದಶಾ ಕಾಲ ನಡೆಯುತ್ತಿದೆ.

• ⚠️ ಶಾಸ್ತ್ರೋಕ್ತ ವಿಶ್ಲೇಷಣೆ: ${currentDiagnosis.primaryLifeChallenge.description}. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿರುವ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಮತ್ತು ಗೋಚಾರ ಬಲವು ನಿಮ್ಮ ತಾಳ್ಮೆ ಹಾಗೂ ಕರ್ಮ ಬಲವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದೆ.

• ⏳ ನಿಖರ ಪರಿಹಾರ ಕಾಲಾವಧಿ: ಇನ್ನು ${dashaTimeText} ಗ್ರಹಗಳ ಗೋಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಕಠಿಣ ಪರಿಸ್ಥಿತಿಗಳು ತಿಳಿಯಾಗಲಿವೆ.

• 🪔 ಸಿದ್ಧ ಪರಿಹಾರ: ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನ ಹಾಗೂ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಮಾಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪ್ರಾಯಶ್ಚಿತ್ತ ಹಾಗೂ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`
    );
  } else {
    return (
`Namaskara ${devoteeNameFormatted}, I have carefully analyzed your chart in relation to your inquiry.

• 🎯 Planetary Alignment: Born in ${lagnaEn} Ascendant and ${moonRashiEn} Moon Sign, you are currently operating under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}.

• ⚠️ Astrological Analysis: ${currentDiagnosis.primaryLifeChallenge.description}. Transits are testing your resilience and karmic equilibrium.

• ⏳ Accurate Timeline: Within ${dashaTimeTextEn}, planetary transits turn favorably, resolving lingering obstacles.

• 🪔 Prescribed Remedies: Wear ${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight}) and ${prescriptions.rudraksha.nameEn}. Sponsor a dedicated Sankalpa Pooja at holy Sri Kshetra Gokarna Mahabaleshwara to dissolve pending afflictions.`
    );
  }
};

