import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { PlanetName, type KundliOutput, type Rashi, type Nakshatra } from "./AstroTypes";
import { normalizeDegree } from "./AstroMath";
import { signLord } from "./KundliInsightsEngine";
import { calculateKpSubLord } from "./kpSubLordEngine";
import { computeSubDivisionalAmsha } from "./subDivisions";
import { calculateHoroscopeRashmi } from "./rashmiChinthaEngine";
import { findBhuktiAtAge, generateBhuktiTimeline, type BhuktiSpan } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { calculateKundli } from "./KundliEngine";
import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";
import {
  diagnoseCurrentLifeSituation,
  determineAccurateProfession,
  type CurrentLifeSituationDiagnosis,
  type AccurateProfessionProfile
} from "./CurrentLifeAndCareerDiagnosticEngine";

/** Calculate distance between houses (1-indexed, 1 to 12) */
export const houseDist = (fromH: number, toH: number): number => ((toH - fromH + 12) % 12) + 1;

/** Cleans markdown and normalizes astrology text */
const cleanAstrologyText = (t: string | undefined | null): string => sanitizeAstrologyKannadaText(t || "");

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
    area: "Personal / Marriage" | "Career / Workplace" | "Progeny / Children" | "Financial / Debts" | "Health / Vitality" | "Health / Physical" | "General Transition" | "Career & Financial Elevation" | "Academic & Growth Focus" | "Education & Career Foundation" | "Spiritual Peace & Family Harmony";
    description: string;
    planetaryRootCause: string;
    areaKn?: string;
    descriptionEn?: string;
    planetaryRootCauseEn?: string;
    solutionKn?: string;
    solutionEn?: string;
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
  isTeetotaler?: boolean;
  hasMaritalFidelity?: boolean;
  negativeShades?: NegativeShadeAssessment;
  currentLifeSituation?: CurrentLifeSituationDiagnosis;
  accurateProfession?: AccurateProfessionProfile;
}

export interface NegativeShadeDimension {
  id: number;
  score: number; // 0 to 20
  hasRisk: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  titleKn: string;
  titleEn: string;
  badgeKn: string;
  badgeEn: string;
  analysisKn: string;
  analysisEn: string;
  astrologicalBasisKn: string;
  astrologicalBasisEn: string;
}

export interface NegativeShadeAssessment {
  overallScore: number; // 0 to 100
  category: "purity" | "mild_flaws" | "moderate_caution" | "severe_conflict" | "critical_danger";
  categoryTitleKn: string;
  categoryTitleEn: string;
  categoryDescriptionKn: string;
  categoryDescriptionEn: string;
  isChildShielded: boolean;
  isJupiterProtected: boolean;
  hasBeneficKendraShield: boolean;
  
  // 5 Core Classical Dimensions
  sensualMarital: NegativeShadeDimension;
  financialIntegrity: NegativeShadeDimension;
  violenceAggression: NegativeShadeDimension;
  legalBandhana: NegativeShadeDimension;
  conductDownwardPath: NegativeShadeDimension;
  
  // Real-time Planetary Triggers
  activeDashaTriggerKn: string;
  activeDashaTriggerEn: string;
  activeGocharaTriggerKn: string;
  activeGocharaTriggerEn: string;
  
  // Panchanga 5-Anga Influence
  panchangaInfluenceKn: string;
  panchangaInfluenceEn: string;
  
  // Gokarna Kshetra Shastric Remedy
  protectionRemedyKn: string;
  protectionRemedyEn: string;
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
  isSpeculationLoss?: boolean;
  speculationWarningKn?: string;
  speculationWarningEn?: string;
  isTeetotaler?: boolean;
  hasMaritalFidelity?: boolean;
  dietSummaryKn?: string;
  dietSummaryEn?: string;
  fidelitySummaryKn?: string;
  fidelitySummaryEn?: string;
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
    sunrise?: string;
    sunset?: string;
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
  } else if (lagnaLord === PlanetName.Jupiter) {
    shantiKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಗುರು ಶಾಂತಿ, ಬೃಹಸ್ಪತಿ ಯಾಗ & ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ";
    shantiEn = "Guru Shanti, Brihaspati Yajna & Medha Dakshinamurthy Pooja at Gokarna";
    shantiPurpose = "ಗುರು ಬಲವರ್ಧನೆ, ಜ್ಞಾನ ಸಿದ್ಧಿ, ದೈವಾನುಗ್ರಹ ಮತ್ತು ಗೌರವಯುತ ಯಶಸ್ಸು.";
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

/**
 * Dynamic scale text for financial loss and debt liabilities.
 * Calculates dynamic loss and debt scale text based on the native's 2nd, 5th, 8th, and 11th houses.
 * Eliminates all hardcoded monetary estimates (e.g. "40-50 lakhs") with authentic horoscope-derived reality.
 */
export function getDynamicLossScaleText(kundli: KundliOutput): {
  lossKn: string;
  lossEn: string;
  basisKn: string;
  basisEn: string;
} {
  const lagnaIdx = kundli.lagnaRashi.index;
  const secondLord = signLord((lagnaIdx + 1) % 12);
  const fifthLord = signLord((lagnaIdx + 4) % 12);
  const eighthLord = signLord((lagnaIdx + 7) % 12);
  const eleventhLord = signLord((lagnaIdx + 10) % 12);

  const secondLordKn = toKannadaPlanet(secondLord);
  const fifthLordKn = toKannadaPlanet(fifthLord);
  const eighthLordKn = toKannadaPlanet(eighthLord);
  const eleventhLordKn = toKannadaPlanet(eleventhLord);

  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);

  const isEighthAfflicted = saturn?.house === 8 || mars?.house === 8 || rahu?.house === 8;
  const isSecondAfflicted = saturn?.house === 2 || mars?.house === 2 || rahu?.house === 2;
  const isEleventhAfflicted = saturn?.house === 11 || rahu?.house === 11;

  if (isEighthAfflicted && isSecondAfflicted) {
    return {
      lossKn: `2ನೇ ಧನಭಾವ ಮತ್ತು 8ನೇ ರಂಧ್ರಭಾವದ ತೀವ್ರ ಗ್ರಹ ಸಂಘರ್ಷದಿಂದಾಗಿ ಜೀವನದ ಬಹುಪಾಲು ಉಳಿತಾಯ, ಸ್ಥಿರ ಠೇವಣಿ ಹಾಗೂ ಆಸ್ತಿಯನ್ನೇ ಕರಗಿಸಿ ಬೃಹತ್ ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕುವ`,
      lossEn: `catastrophic erosion of accumulated life savings, fixed assets, and liquid capital driven by severe 2nd and 8th house afflictions`,
      basisKn: `2ನೇ ಧನಾಧಿಪತಿ ${secondLordKn} ಹಾಗೂ 8ನೇ ಅಷ್ಟಮ ಸ್ಥಾನದಲ್ಲಿ ಪಾಪಗ್ರಹಗಳ ಸಂಯೋಗ`,
      basisEn: `Affliction of 2nd lord ${secondLord} and malefic concentration in 8th house`
    };
  } else if (isEleventhAfflicted || rahu?.house === 5) {
    return {
      lossKn: `5ನೇ ರಾಹುವಿನ ಅತಿಯಾದ ಆಸೆ ಹಾಗೂ 11ನೇ ಲಾಭಸ್ಥಾನದ ಕುಸಿತದಿಂದಾಗಿ ವರ್ಷಗಳ ಕಾಲ ದುಡಿದು ಕೂಡಿಟ್ಟ ಸಮಗ್ರ ಬಂಡವಾಳ ಮತ್ತು ಹೂಡಿಕೆಯನ್ನು ಸಂಪೂರ್ಣ ಕಳೆದುಕೊಳ್ಳುವ`,
      lossEn: `devastating capital wipeout depleting multi-year savings and borrowed speculative margins driven by the 5th-11th axis affliction`,
      basisKn: `5ನೇ ಪಂಚಮದಲ್ಲಿ ರಾಹು ಹಾಗೂ 11ನೇ ಲಾಭಾಧಿಪತಿ ${eleventhLordKn}ನ ದುರ್ಬಲತೆ`,
      basisEn: `5th house Rahu speculation illusion combined with weakened 11th lord ${eleventhLord}`
    };
  } else {
    return {
      lossKn: `ಬುದ್ಧಿಸ್ಥಾನದ ಪಂಚಮಾಧಿಪತಿ ${fifthLordKn} ಹಾಗೂ ಧನಸ್ಥಾನದ ಅಸ್ಥಿರತೆಯಿಂದಾಗಿ ಗಳಿಸಿದ ಆದಾಯಕ್ಕಿಂತ ಹತ್ತು ಪಟ್ಟು ಹೆಚ್ಚಿನ ಸಾಲದ ಹೊರೆಯನ್ನು ಮೈಮೇಲೆ ಎಳೆದುಕೊಳ್ಳುವ`,
      lossEn: `severe financial regression where debt obligations heavily outstrip earning capacity due to afflicted 5th and 2nd house lords`,
      basisKn: `ಪಂಚಮಾಧಿಪತಿ ${fifthLordKn} ಮತ್ತು ಧನಾಧಿಪತಿ ${secondLordKn}ನ ಅಸಮತೋಲನ`,
      basisEn: `Instability of 5th lord ${fifthLord} and 2nd lord ${secondLord}`
    };
  }
}

export interface ShadripuAnalysis {
  dominantRipu: "kama" | "krodha" | "lobha" | "moha" | "mada" | "matsarya";
  ripuNameKn: string;
  ripuNameEn: string;
  detailKn: string;
  detailEn: string;
  planetaryCauseKn: string;
  planetaryCauseEn: string;
  hasKama: boolean;
  hasKrodha: boolean;
  hasLobha: boolean;
  hasMoha: boolean;
  hasMada: boolean;
  hasMatsarya: boolean;
}

/**
 * Detects native's primary Shadripu vulnerabilities (Kama, Krodha, Lobha, Moha, Mada, Matsarya)
 * through classical Jyotisha planetary placement analysis.
 */
export function detectNativeShadripuAfflictions(kundli: KundliOutput): ShadripuAnalysis {
  const sun = kundli.planets.find(p => p.name === PlanetName.Sun);
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);

  // 1. Kama (Passion / Sensual desire / Unbridled longing)
  let kamaScore = 0;
  if (venus && mars && Math.abs(venus.house - mars.house) <= 1) kamaScore += 3.0;
  if (venus && rahu && Math.abs(venus.house - rahu.house) <= 1) kamaScore += 2.5;
  if (venus && [7, 8, 12].includes(venus.house)) kamaScore += 2.0;
  if (mars && [7, 8, 12].includes(mars.house)) kamaScore += 1.5;

  // 2. Krodha (Anger / Rage / Impatience)
  let krodhaScore = 0;
  if (mars && [1, 2, 7, 8].includes(mars.house)) krodhaScore += 3.0;
  if (mars && sun && Math.abs(mars.house - sun.house) <= 1) krodhaScore += 2.5;
  if (mars && ketu && Math.abs(mars.house - ketu.house) <= 1) krodhaScore += 2.5;
  if (saturn && mars && Math.abs(saturn.house - mars.house) <= 2) krodhaScore += 2.0;

  // 3. Lobha (Greed / Speculation / Obsessive Accumulation)
  let lobhaScore = 0;
  if (rahu && [2, 5, 11].includes(rahu.house)) lobhaScore += 3.5;
  if (saturn && [2, 11].includes(saturn.house)) lobhaScore += 2.0;
  if (rahu && jupiter && Math.abs(rahu.house - jupiter.house) === 0) lobhaScore += 2.0;

  // 4. Moha (Delusion / Attachment / Emotional Fog / Overthinking)
  let mohaScore = 0;
  if (moon && [6, 8, 12].includes(moon.house)) mohaScore += 3.0;
  if (moon && rahu && Math.abs(moon.house - rahu.house) === 0) mohaScore += 3.0;
  if (moon && saturn && Math.abs(moon.house - saturn.house) === 0) mohaScore += 2.5;
  if (ketu && [4, 8, 12].includes(ketu.house)) mohaScore += 1.5;

  // 5. Mada (Pride / Arrogance / Egotism)
  let madaScore = 0;
  if (sun && sun.house === 1) madaScore += 3.0;
  if (sun && sun.house === 10) madaScore += 2.5;
  if (sun && rahu && Math.abs(sun.house - rahu.house) === 0) madaScore += 2.5;
  if (mars && mars.house === 10) madaScore += 2.0;

  // 6. Matsarya (Envy / Jealousy / Paranoia of Others' Growth)
  let matsaryaScore = 0;
  if (saturn && saturn.house === 6) matsaryaScore += 3.0;
  if (rahu && saturn && Math.abs(rahu.house - saturn.house) === 0) matsaryaScore += 3.0;
  if (rahu && [6, 8].includes(rahu.house)) matsaryaScore += 2.0;
  if (ketu && ketu.house === 6) matsaryaScore += 1.5;

  const scores = [
    { ripu: "krodha" as const, score: krodhaScore, nameKn: "ಕ್ರೋಧ (ಆವೇಶ & ಸಿಟ್ಟು)", nameEn: "Krodha (Anger & Impatience)" },
    { ripu: "lobha" as const, score: lobhaScore, nameKn: "ಲೋಭ (ದುರಾಸೆ & ಸ್ಪೆಕ್ಯುಲೇಶನ್)", nameEn: "Lobha (Greed & Speculation)" },
    { ripu: "kama" as const, score: kamaScore, nameKn: "ಕಾಮ (ಅತಿಯಾದ ಆಸೆ & ಬಾಹ್ಯ ಸೆಳೆತ)", nameEn: "Kama (Desire & Sensory Clinging)" },
    { ripu: "moha" as const, score: mohaScore, nameKn: "ಮೋಹ (ಭ್ರಮೆ & ಅತಿಯಾದ ಆಲೋಚನೆ)", nameEn: "Moha (Attachment & Overthinking)" },
    { ripu: "mada" as const, score: madaScore, nameKn: "ಮದ (ಸ್ವಾಭಿಮಾನ & ಅಹಂಕಾರ)", nameEn: "Mada (Ego & Authority Clashes)" },
    { ripu: "matsarya" as const, score: matsaryaScore, nameKn: "ಮತ್ಸರ್ಯ (ಅಸೂಯೆ & ಶತ್ರು ಬಾಧೆ)", nameEn: "Matsarya (Envy & Competitive Paranoia)" }
  ];

  scores.sort((a, b) => b.score - a.score);
  const dominant = scores[0]!;

  return {
    dominantRipu: dominant.ripu,
    ripuNameKn: dominant.nameKn,
    ripuNameEn: dominant.nameEn,
    detailKn: dominant.ripu === "krodha"
      ? "ಕುಜನ ಅಗ್ನಿ ತತ್ವವು ಆವೇಶ, ಹಠಾತ್ ಕೋಪ ಹಾಗೂ ಸಹನೆ ಕಳೆದುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿಯನ್ನು ತಂದು ಸಂಬಂಧಗಳನ್ನು ಅಸ್ಥಿರಗೊಳಿಸುತ್ತದೆ."
      : dominant.ripu === "lobha"
      ? "ರಾಹುವಿನ ತ್ವರಿತ ಧನಾರ್ಜನೆಯ ಆಮಿಷವು ಷೇರು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್ ದುರಾಸೆಗೆ ದೂಡಿ ಬಂಡವಾಳ ಕಳೆದುಕೊಳ್ಳುವ ಅಪಾಯ ತರುತ್ತದೆ."
      : dominant.ripu === "kama"
      ? "ಶುಕ್ರ-ಕುಜ/ರಾಹು ಸಂಯೋಗವು ಇಂದ್ರಿಯ ಸುಖದ ಹಪಹಪಿ ಹಾಗೂ ದಾಂಪತ್ಯದ ಹೊರಗಿನ ಬಾಹ್ಯ ಸೆಳೆತಗಳ ದುರ್ಬಲತೆಯನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ."
      : dominant.ripu === "moha"
      ? "ಚಂದ್ರನ ಪೀಡಿತ ಸ್ಥಿತಿಯು ಹಳೆಯ ಘಟನೆಗಳ ವ್ಯಾಮೋಹ, ಅತಿಯಾದ ಯೋಚನೆ (Overthinking) ಹಾಗೂ ಭ್ರಮಾತ್ಮಕ ಆತಂಕವನ್ನುಂಟುಮಾಡುತ್ತದೆ."
      : dominant.ripu === "mada"
      ? "ರವಿಯ ಪ್ರಭಾವವು ಅತಿಯಾದ ಸ್ವಾಭಿಮಾನ, ಅಹಂಕಾರದ ಘರ್ಷಣೆ ಹಾಗೂ ಇತರರ ಮಾತಿಗೆ ಕಿವಿಗೊಡದ ಮೊಂಡುತನಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ."
      : "6ನೇ ಭಾವದ ಶನಿ-ರಾಹು ಸ್ಥಿತಿಯು ಇತರರ ಏಳಿಗೆ ನೋಡಿ ಅಂತರಂಗದಲ್ಲಿ ತಳಮಳ ಅಥವಾ ಶತ್ರು-ದೃಷ್ಟಿ ಭಯವನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.",
    detailEn: dominant.ripu === "krodha"
      ? "Martian fire sparks sudden anger and loss of composure, straining family and business bonds."
      : dominant.ripu === "lobha"
      ? "Rahu's illusion of instant wealth tempts speculative risks, endangering core financial solvency."
      : dominant.ripu === "kama"
      ? "Venusian agitation triggers sensual restlessness and emotional vulnerabilities outside marriage."
      : dominant.ripu === "moha"
      ? "Afflicted lunar alignment creates deep emotional attachments, overthinking, and anxiety."
      : dominant.ripu === "mada"
      ? "Solar ego dominance provokes conflicts with authority and unyielding stubbornness."
      : "Saturnian 6th house tension fosters competitive anxiety and vulnerability to evil eye.",
    planetaryCauseKn: dominant.ripu === "krodha"
      ? "ಕುಜ-ರವಿಯ ತೀಕ್ಷ್ಣ ಅಗ್ನಿ ತತ್ವ"
      : dominant.ripu === "lobha"
      ? "ರಾಹುವಿನ 5/11ನೇ ಭಾವದ ಸಂಚಾರ"
      : dominant.ripu === "kama"
      ? "ಶುಕ್ರ-ಕುಜ/ರಾಹುವಿನ ಕಾಮ ತತ್ವ"
      : dominant.ripu === "moha"
      ? "ಚಂದ್ರನ ಗ್ರಹಣ ಅಥವಾ ವಿಷ ಯೋಗ"
      : dominant.ripu === "mada"
      ? "ಲಗ್ನ ಅಥವಾ 10ನೇ ಮನೆಯ ರವಿ ಪ್ರಭಾವ"
      : "6ನೇ ಶತ್ರು ಭಾವದಲ್ಲಿ ಶನಿ-ರಾಹು ಸ್ಥಿತಿ",
    planetaryCauseEn: dominant.ripu === "krodha"
      ? "Martian fire tension"
      : dominant.ripu === "lobha"
      ? "Rahu on 5th/11th house axis"
      : dominant.ripu === "kama"
      ? "Venus-Mars/Rahu sensual conjunction"
      : dominant.ripu === "moha"
      ? "Moon affliction (Grahana/Visha)"
      : dominant.ripu === "mada"
      ? "Sun in 1st/10th ego axis"
      : "Saturn/Rahu 6th house tension",
    hasKama: kamaScore >= 2.0,
    hasKrodha: krodhaScore >= 2.0,
    hasLobha: lobhaScore >= 2.0,
    hasMoha: mohaScore >= 2.0,
    hasMada: madaScore >= 2.0,
    hasMatsarya: matsaryaScore >= 2.0
  };
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

export interface NativeDietAssessment {
  isTeetotaler: boolean;
  isDailyDrinking: boolean;
  isSocialDrinking: boolean;
  hasAddictionRisk: boolean;
  hasAddiction: boolean;
  hasZardaTobaccoHabit?: boolean;
  addictionScore: number;
  dietSummaryKn: string;
  dietSummaryEn: string;
  rootCauseKn: string;
  rootCauseEn: string;
}

export const detectNativeDietAndAddiction = (kundli: KundliOutput): NativeDietAssessment => {
  const lagnaIdx = kundli.lagnaRashi.index;
  const secondLord = signLord((lagnaIdx + 1) % 12);
  const secondLordPlanet = kundli.planets.find(p => p.name === secondLord);
  
  const houseDist = (fromH: number, toH: number) => ((toH - fromH + 12) % 12) + 1;
  
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const mercury = kundli.planets.find(p => p.name === PlanetName.Mercury);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);
  
  // Jupiter's aspects (1st = in house, 5th, 7th, 9th)
  const jupiterAspects2nd = jupiter ? [1, 5, 7, 9].includes(houseDist(jupiter.house, 2)) : false;
  const jupiterAspects2ndLord = (jupiter && secondLordPlanet) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, secondLordPlanet.house)) : false;
  const beneficsIn2nd = [jupiter, venus, mercury].some(p => p && p.house === 2);
  const is2ndLordWellPlaced = secondLordPlanet ? [1, 2, 4, 5, 7, 9, 10, 11].includes(secondLordPlanet.house) : true;
  
  // Malefic influences on 2nd house of oral intake
  const maleficsIn2nd = [saturn, rahu, mars, ketu].filter(p => p && p.house === 2);
  const saturnAspects2nd = saturn ? [3, 7, 10].includes(houseDist(saturn.house, 2)) : false;
  const marsAspects2nd = mars ? [4, 7, 8].includes(houseDist(mars.house, 2)) : false;
  const rahuAspects2nd = rahu ? [5, 7, 9].includes(houseDist(rahu.house, 2)) : false;
  const maleficsIn8th = [saturn, rahu, mars].filter(p => p && p.house === 8);
  const maleficsIn12th = [saturn, rahu, mars].filter(p => p && p.house === 12);
  const secondLordInDusthana = secondLordPlanet ? [6, 8, 12].includes(secondLordPlanet.house) : false;
  
  // Calculate malefic pressure score
  let maleficPressure = 0;
  if (maleficsIn2nd.length > 0) maleficPressure += 3.0;
  if (saturnAspects2nd) maleficPressure += 1.5;
  if (marsAspects2nd) maleficPressure += 1.0;
  if (rahuAspects2nd) maleficPressure += 1.0;
  if (maleficsIn8th.length > 0) maleficPressure += 1.0;
  if (maleficsIn12th.length > 0) maleficPressure += 1.0;
  if (secondLordInDusthana) maleficPressure += 1.5;
  
  // Benefic mitigation / cancellation
  let beneficProtection = 0;
  if (jupiterAspects2nd) beneficProtection += 3.0;
  if (jupiterAspects2ndLord) beneficProtection += 2.5;
  if (beneficsIn2nd) beneficProtection += 2.5;
  if (is2ndLordWellPlaced) beneficProtection += 1.5;
  
  const isSaturn8thAspecting2nd = Boolean(saturn && saturn.house === 8 && [3, 7, 10].includes(houseDist(saturn.house, 2)));
  const isMars8thAspecting2nd = Boolean(mars && mars.house === 8 && [4, 7, 8].includes(houseDist(mars.house, 2)));
  const hasZardaTobaccoHabit = Boolean(isMars8thAspecting2nd || (marsAspects2nd && maleficsIn8th.length > 0));
  const hasDirectAlcoholAffliction = isSaturn8thAspecting2nd || maleficsIn2nd.length > 0 || (secondLordInDusthana && maleficsIn8th.length > 0);

  const netAddictionScore = Math.max(0, maleficPressure - beneficProtection);
  
  // Parashara & Saravali principle: Guru Drishti protects intake, BUT Saturn in 8th house directly aspecting 2nd house
  // causes secret alcohol intake (Madyapana) and evening escapism under mental distress.
  // Mars in 8th house directly aspecting 2nd house of oral intake creates craving for chewing zarda, tobacco, gutkha, and pungent betel intake.
  const isTeetotaler = !hasDirectAlcoholAffliction && !hasZardaTobaccoHabit && (netAddictionScore < 1.5 || (jupiterAspects2nd && !marsAspects2nd) || (jupiterAspects2ndLord && !marsAspects2nd));
  const isDailyDrinking = !isTeetotaler && !hasZardaTobaccoHabit && (netAddictionScore >= 3.0 || hasDirectAlcoholAffliction);
  const isSocialDrinking = !isTeetotaler && !hasZardaTobaccoHabit && !isDailyDrinking && netAddictionScore >= 1.5;
  const hasAddictionRisk = !isTeetotaler && (isDailyDrinking || isSocialDrinking || hasDirectAlcoholAffliction || hasZardaTobaccoHabit);
  
  let dietSummaryKn = "";
  let dietSummaryEn = "";
  let rootCauseKn = "";
  let rootCauseEn = "";
  
  if (hasZardaTobaccoHabit) {
    dietSummaryKn = "ಜರ್ದಾ, ತಂಬಾಕು & ಗುಟ್ಕಾ ವ್ಯಸನ (Zarda & Chewing Tobacco Addiction): 8ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ಅಂಗಾರಕನು (ಕುಜ) 2ನೇ ಮುಖ ಮತ್ತು ಭೋಜನ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ 7ನೇ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವುದರಿಂದ, ಜರ್ದಾ (Zarda), ತಂಬಾಕು, ಗುಟ್ಕಾ ಅಥವಾ ಖಾರ-ಉತ್ತೇಜಕ ತಾಂಬೂಲ ನಿರಂತರವಾಗಿ ಅಗಿಯುವ ತೀವ್ರ ಚಟ ಜಾತಕದಲ್ಲಿದೆ. ಮದ್ಯಪಾನ ಮುಕ್ತವಾಗಿದ್ದರೂ ಬಾಯಿಯ ತಂಬಾಕು ಚಟ ಶರೀರಕ್ಕೆ ಅಂಟಿಕೊಂಡಿರುತ್ತದೆ.";
    dietSummaryEn = "Zarda & Chewing Tobacco Dependency: Mars in the 8th house casting direct 7th aspect on the 2nd house of oral intake generates a strong craving for chewing tobacco, zarda, and betel stimulants.";
    rootCauseKn = "8ನೇ ಮನೆಯಲ್ಲಿರುವ ಅಂಗಾರಕನು 2ನೇ ಮುಖ-ಭೋಜನ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ 7ನೇ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವುದು.";
    rootCauseEn = "8th house Mars casting direct 7th aspect onto the 2nd house of oral intake.";
  } else if (isTeetotaler) {
    dietSummaryKn = "ಸಾತ್ವಿಕ ಆಹಾರಿ (Teetotaler) & ಮದ್ಯಪಾನ-ಧೂಮಪಾನ ಮುಕ್ತ ಶರೀರ ರಕ್ಷಣೆ. ಶರೀರ ಪಾವಿತ್ರ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಉನ್ನತ ಆತ್ಮಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.";
    dietSummaryEn = "Sattvik lifestyle & confirmed teetotaler (strictly free from alcohol, smoking, and intoxicating substances). Endowed with natural purity of intake.";
    rootCauseKn = jupiterAspects2nd || jupiterAspects2ndLord 
      ? "2ನೇ ಭೋಜನ ಸ್ಥಾನ ಅಥವಾ ಧನಾಧಿಪತಿಯ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಸಾತ್ವಿಕ ದೃಷ್ಟಿಯ ಶ್ರೀರಕ್ಷೆ." 
      : "2ನೇ ಮುಖ ಸ್ಥಾನ ಹಾಗೂ ಲಗ್ನವು ಶುಭ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದು ದುಶ್ಚಟಗಳ ಸೋಂಕಿಲ್ಲದಿರುವುದು.";
    rootCauseEn = jupiterAspects2nd || jupiterAspects2ndLord 
      ? "Jupiter's divine protective aspect purifying the 2nd house of oral intake and dietary restraint." 
      : "Clean 2nd house shielded from malefic addictions.";
  } else if (isDailyDrinking) {
    dietSummaryKn = isSaturn8thAspecting2nd
      ? "ಮದ್ಯಪಾನ & ಸಂಜೆಯ ಮದ್ಯ ಸೇವನೆಯ ದೌರ್ಬಲ್ಯ (Alcohol Intake Under Stress): 8ನೇ ರಹಸ್ಯ ಸ್ಥಾನದಲ್ಲಿರುವ ಶನಿಯು 2ನೇ ಭೋಜನ-ಮುಖ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ 7ನೇ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವುದರಿಂದ ಮತ್ತು ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜನಿರುವುದರಿಂದ, ದಿನದ ಕೆಲಸ ಮುಗಿದ ನಂತರ, ಸಂಜೆಯ ಸಮಯದಲ್ಲಿ ಅಥವಾ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ಬೇಸರ/ಒತ್ತಡವಾದಾಗ ಮದ್ಯಪಾನ (Alcohol intake) ಮಾಡುವ ಸ್ಪಷ್ಟ ದೌರ್ಬಲ್ಯ ಜಾತಕದಲ್ಲಿದೆ. ಹೊರಗೆ ಧಾರ್ಮಿಕವಾಗಿ ಕಂಡರೂ, ಏಕಾಂತದಲ್ಲಿ ನಶೆಯ ಪದಾರ್ಥಗಳು ಅಥವಾ ಮದ್ಯಕ್ಕೆ ಶರಣಾಗುವ ಪ್ರವೃತ್ತಿ ಇರುತ್ತದೆ. ಇದು ಆರೋಗ್ಯ ಮತ್ತು ಸಂಸಾರಿಕ ನೆಮ್ಮದಿಯನ್ನು ಹಾಳುಮಾಡಲಿದ್ದು, ಕಟ್ಟುನಿಟ್ಟಿನ ಸ್ವಯಂ-ನಿಯಂತ್ರಣ ಅಗತ್ಯ."
      : "2ನೇ ಮುಖ ಹಾಗೂ 8ನೇ ರಹಸ್ಯ ಸ್ಥಾನಗಳ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ ಸಂಜೆಯ ಸಮಯದಲ್ಲಿ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡದಲ್ಲಿ ಮದ್ಯಪಾನ ಅಥವಾ ವ್ಯಸನಗಳ ಕಡೆಗೆ ಜಾರುವ ಅಪಾಯವಿದೆ.";
    dietSummaryEn = isSaturn8thAspecting2nd
      ? "Alcohol Vulnerability & Evening Drinking Under Stress: Saturn positioned in the 8th house casting its direct 7th aspect onto the 2nd house of oral intake, intensified by debilitated Mars in Lagna, creates a clear propensity toward alcohol consumption (Madyapana), particularly in the evenings or under emotional and marital frustration. Despite outward religious duties, this private habit strains physical vitality and domestic harmony."
      : "Vulnerability to recurring evening alcohol or substance intake under severe emotional distress or fatigue.";
    rootCauseKn = isSaturn8thAspecting2nd
      ? "8ನೇ ರಹಸ್ಯ ಭಾವದ ಶನಿಯು 2ನೇ ಮುಖ-ಭೋಜನ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವುದು ಹಾಗೂ ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜ."
      : "2ನೇ ಆಹಾರ ಸ್ಥಾನ ಮತ್ತು 8ನೇ ರಹಸ್ಯ ಭಾವದಲ್ಲಿ ಶನಿ-ರಾಹುಗಳ ಅಶುಭ ಪ್ರಭಾವ.";
    rootCauseEn = isSaturn8thAspecting2nd
      ? "Direct 7th aspect of 8th house Saturn onto the 2nd house of oral intake with debilitated Mars in Lagna."
      : "2nd house of intake afflicted by Saturn-Rahu malefic axis without benefic cancellation.";
  } else {
    dietSummaryKn = "ಸಾಮಾಜಿಕ ಸಹವಾಸ ಅಥವಾ ಪಾರ್ಟಿಗಳ ಸಮಯದಲ್ಲಿ ಪಾನೀಯ ಅಥವಾ ತಂಪು ಪದಾರ್ಥಗಳ ಕ್ಷಣಿಕ ಚಪಲ ಕಾಡಬಹುದು; ಸ್ನೇಹಿತರ ಒತ್ತಾಯಕ್ಕೆ ಮಣಿಯದಂತೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ಅಗತ್ಯ.";
    dietSummaryEn = "Occasional vulnerability to social drinking under peer pressure during celebrations; requires conscious dietary boundaries.";
    rootCauseKn = "2ನೇ ಸ್ಥಾನಕ್ಕೆ ಪಾಪಗ್ರಹಗಳ ಗೋಚಾರ ಅಥವಾ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಪ್ರಭಾವ.";
    rootCauseEn = "Mild malefic aspect on 2nd house of intake.";
  }
  
  return {
    isTeetotaler,
    isDailyDrinking,
    isSocialDrinking,
    hasAddictionRisk,
    hasAddiction: hasAddictionRisk,
    hasZardaTobaccoHabit,
    addictionScore: netAddictionScore,
    dietSummaryKn,
    dietSummaryEn,
    rootCauseKn,
    rootCauseEn
  };
};

export interface NativeSensualAssessment {
  hasMaritalFidelity: boolean;
  hasSensualChanchalya?: boolean;
  hasStrongAffairRisk: boolean;
  hasSameGenderAffinity: boolean;
  hasMaritalDistanceColdness: boolean;
  fidelitySummaryKn: string;
  fidelitySummaryEn: string;
  rootCauseKn: string;
  rootCauseEn: string;
}

export const detectNativeSensualAndFidelity = (kundli: KundliOutput): NativeSensualAssessment => {
  const lagnaIdx = kundli.lagnaRashi.index;
  const seventhLord = signLord((lagnaIdx + 6) % 12);
  const seventhLordPlanet = kundli.planets.find(p => p.name === seventhLord);
  
  const houseDist = (fromH: number, toH: number) => ((toH - fromH + 12) % 12) + 1;
  
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const mercury = kundli.planets.find(p => p.name === PlanetName.Mercury);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);
  
  const venusH = venus?.house ?? 1;
  const venusSign = venus?.rashi.index ?? 0;
  const neuterSigns = [2, 5, 10]; // Gemini, Virgo, Aquarius
  
  const hasSameGenderAffinity = Boolean(
    (venus && mercury && Math.abs(venus.house - mercury.house) === 0 && (saturn?.house === 7 || saturn?.house === 8 || rahu?.house === 7 || ketu?.house === 7)) ||
    (venus && [7, 8].includes(venusH) && mercury && [7, 8].includes(mercury.house) && neuterSigns.includes(venusSign)) ||
    (ketu && [7, 8].includes(ketu.house) && mercury && [7, 8].includes(mercury.house) && venus && [saturn, ketu].some(p => p && Math.abs(p.house - venus.house) === 0))
  );
  
  // Jupiter aspects (1st, 5th, 7th, 9th)
  const jupiterAspects7th = jupiter ? [1, 5, 7, 9].includes(houseDist(jupiter.house, 7)) : false;
  const jupiterAspectsVenus = (jupiter && venus) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, venus.house)) : false;
  const jupiterAspects7thLord = (jupiter && seventhLordPlanet) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, seventhLordPlanet.house)) : false;
  
  // Severe affair affliction in classical Jyotisha: Venus conjunct Rahu tightly in 7, 8, 12 with NO Jupiter aspect
  const venusRahuAffair = Boolean(
    venus && rahu && Math.abs(venus.house - rahu.house) === 0 && [7, 8, 12].includes(venusH)
  );
  const marsVenusAffair = Boolean(
    venus && mars && Math.abs(venus.house - mars.house) === 0 && [7, 8, 12].includes(venusH)
  );
  
  // Sensual wanderlust / roving eye (Kama Chanchalya / seeing other women with roving eye):
  // 1. Rahu in 5th house of desires/Chitta
  // 2. 5th lord debilitated in Lagna (Mars in Cancer)
  // 3. 7th lord placed in 8th house (dissatisfaction at home)
  // 4. Saturn aspecting Venus in a Mars sign (Aries/Scorpio)
  const isSaturnAspectingVenusInMarsSign = Boolean(
    saturn && venus && [3, 7, 10].includes(houseDist(saturn.house, venus.house)) && [0, 7].includes(venus.rashi.index)
  );
  const hasSensualChanchalya = Boolean(
    (rahu && rahu.house === 5 && mars && (mars.isDebilitated || mars.rashi.index === 3)) ||
    (rahu && rahu.house === 5 && seventhLordPlanet && seventhLordPlanet.house === 8) ||
    isSaturnAspectingVenusInMarsSign
  );

  // Benefic shield
  const hasGuruProtection = jupiterAspects7th || jupiterAspectsVenus || jupiterAspects7thLord;
  
  // Parashara & Classical combination for Extramarital Romance & Spa / Bed Pleasures:
  // 1. Ketu in 7th house (marital coldness/distance with spouse)
  // 2. Mars in 8th house (Ashtama Kuja - intense libido/physical frustration)
  // 3. 12th lord Venus in 5th house of romance/liaisons (e.g. Scorpio Lagna with exalted Venus in Pisces 5th)
  // 4. Rahu in Lagna or 5th (unconventional sensual desires)
  const is12thLordVenusIn5th = (lagnaIdx === 7 && venus?.house === 5);
  const hasKetuIn7thAndMarsIn8th = Boolean(ketu?.house === 7 && mars?.house === 8);
  const hasExtramaritalAndSpaAffliction = Boolean(
    (is12thLordVenusIn5th && hasKetuIn7thAndMarsIn8th) ||
    (venus?.house === 5 && ketu?.house === 7 && mars?.house === 8)
  );

  const hasStrongAffairRisk = hasExtramaritalAndSpaAffliction || (!hasGuruProtection && (venusRahuAffair || marsVenusAffair));
  const hasMaritalFidelity = !hasStrongAffairRisk && !hasSensualChanchalya;
  const hasMaritalDistanceColdness = Boolean((saturn && saturn.house === 7) || (ketu && ketu.house === 7) || (seventhLordPlanet && seventhLordPlanet.house === 8));
  
  let fidelitySummaryKn = "";
  let fidelitySummaryEn = "";
  let rootCauseKn = "";
  let rootCauseEn = "";
  
  if (hasExtramaritalAndSpaAffliction) {
    fidelitySummaryKn = "ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ, ಕಾಮ ಚಾಂಚಲ್ಯ & ಮಸಾಜ್/ಸ್ಪಾ ಸುಖದ ದೌರ್ಬಲ್ಯ (Extramarital Affair, Kama Chanchalya & Spa Indulgence): 7ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು (ಹೆಂಡತಿಯೊಂದಿಗೆ ವೈರಾಗ್ಯ/ಶೀತಲ ಅಂತರ), 8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ (ಕಾಮೋದ್ವೇಗ) ಹಾಗೂ 12ನೇ ವ್ಯಯಾಧಿಪತಿ ಶುಕ್ರನು 5ನೇ ಪ್ರೇಮ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ಉಚ್ಚನಾಗಿರುವುದರಿಂದ, ಸಂಸಾರದ ಹೊರಗೆ ಮತ್ತೊಬ್ಬ ಸ್ತ್ರೀಯೊಂದಿಗೆ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ (Extramarital affair) ಹಾಗೂ ಮಸಾಜ್/ಸ್ಪಾ (Massage/Spa) ಶಾರೀರಿಕ ಸುಖಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಸ್ಪಷ್ಟ ಯೋಗವಿದೆ. ಹೆಂಡತಿಯೊಂದಿಗೆ ಶೀತಲ ಅಂತರವಿದ್ದು, ಬಾಹ್ಯ ಪ್ರೇಮ ಹಾಗೂ ಶಾರೀರಿಕ ಸುಖಾಸಕ್ತಿಗಳು ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟನ್ನು ತಂದೊಡ್ಡುತ್ತವೆ.";
    fidelitySummaryEn = "Extramarital Affair, Sensual Restlessness & Massage/Spa Indulgence: Ketu in the 7th house (emotional distance from lawful spouse), Ashtama Kuja in the 8th house (restless sexual energy), and 12th lord Venus exalted in the 5th house of romance/liaisons create a clear predisposition towards an extramarital affair and external physical pleasures (including massage spas and secret romantic connections). A lack of warmth at home directs sensual energy outside marriage.";
    rootCauseKn = "7ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು, 8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ ಹಾಗೂ 12ನೇ ಅಧಿಪತಿ ಶುಕ್ರನು 5ನೇ ಭಾವದಲ್ಲಿ ಸ್ಥಿತಿ.";
    rootCauseEn = "Ketu in 7th house, Mars in 8th house, and 12th lord Venus exalted in 5th house.";
  } else if (hasMaritalFidelity) {
    fidelitySummaryKn = "ದಾಂಪತ್ಯ ನಿಷ್ಠೆ & ನೈತಿಕ ಸತ್ಚಾರಿತ್ರ್ಯ: 7ನೇ ಕಳತ್ರ ಹಾಗೂ ಕಾಮ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಸದಾಚಾರ ನಿಮ್ಮ ಮೂಲ ಗುಣವಾಗಿದೆ. ಬಾಹ್ಯ ಕ್ಷಣಿಕ ಆಕರ್ಷಣೆಗಳಿಗೆ ಅಥವಾ ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ವ್ಯಾಮೋಹಕ್ಕೆ ಬಲಿಯಾಗದೆ, ಪವಿತ್ರ ಕೌಟುಂಬಿಕ ಧರ್ಮವನ್ನು ಕಾಪಾಡುವ ಧೀಮಂತ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ.";
    fidelitySummaryEn = "Steadfast marital fidelity, moral rectitude, and sensory self-control. You uphold sacred family ethics and remain devoted to your spouse without succumbing to external affairs or illicit desires.";
    rootCauseKn = hasGuruProtection 
      ? "7ನೇ ಕಳತ್ರ ಅಥವಾ ಕಾಮಕಾರಕ ಶುಕ್ರನ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಸಾತ್ವಿಕ ದೃಷ್ಟಿಯ ರಕ್ಷಣೆ." 
      : "7ನೇ ಮತ್ತು 12ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹ ಸ್ಥಿತಿ ಹಾಗೂ ಶುಕ್ರನ ಸೌಮ್ಯತೆ.";
    rootCauseEn = hasGuruProtection 
      ? "Jupiter's auspicious aspect protecting 7th house and Venus, bestowing high moral conscience." 
      : "Clean 7th and 12th houses preserving marital devotion.";
  } else if (hasSensualChanchalya) {
    fidelitySummaryKn = "ಕಾಮ ಚಾಂಚಲ್ಯ & ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆಯ ಎಚ್ಚರಿಕೆ (Sensual Restlessness & Roving Eye): 5ನೇ ಬುದ್ಧಿ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು, ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜ ಹಾಗೂ 8ನೇ ಮನೆಯಿಂದ ಶುಕ್ರನ ಮೇಲಿರುವ ಶನಿಯ ದೃಷ್ಟಿಯ ಕಾರಣದಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ತೀವ್ರ ಕಾಮ ಚಾಂಚಲ್ಯ, ಪರಸ್ತ್ರೀಯರನ್ನು ಚಂಚಲ ದೃಷ್ಟಿಯಿಂದ ನೋಡುವ (roving eye/sensual curiosity) ಪ್ರವೃತ್ತಿ ಹಾಗೂ ಇಂದ್ರಿಯ ನಿಗ್ರಹದ ಕೊರತೆ ಎದ್ದು ಕಾಣುತ್ತದೆ. ಹೊರಗೆ ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಅಥವಾ ಗೌರವಯುತ ಸ್ಥಾನದಲ್ಲಿದ್ದರೂ, ಆಂತರಿಕವಾಗಿ ಕಾಮ ವಾಸನೆಗಳು ಹಾಗೂ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳು ಸಂಸಾರದಲ್ಲಿ ಹೆಂಡತಿಯೊಂದಿಗೆ ಅಶಾಂತಿ, ಅನುಮಾನ ಹಾಗೂ ಅಂತರವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿವೆ. ಇಂದ್ರಿಯ ಸಂಯಮ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅನಿವಾರ್ಯ.";
    fidelitySummaryEn = "Sensual Restlessness, Roving Eye & Moral Self-Control Warning: Rahu in the 5th house of desires/intellect, debilitated Mars in Lagna, and Saturn aspecting Venus in Aries generate strong sensual restlessness, a roving eye towards other women, and weakened sensory self-control. While maintaining an upright or religious outer persona, these private impulses fuel friction, suspicion, and distance with spouse at home.";
    rootCauseKn = "5ನೇ ಬುದ್ಧಿ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು, ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜ ಹಾಗೂ ಶುಕ್ರನ ಮೇಲೆ ಶನಿಯ ದೃಷ್ಟಿ ಪ್ರಭಾವ.";
    rootCauseEn = "Rahu in 5th house of desires with debilitated Mars and Saturn aspecting Venus.";
  } else {
    fidelitySummaryKn = "ಶುಕ್ರ-ರಾಹುಗಳ ತೀವ್ರ ಸಂಚಾರದಿಂದಾಗಿ ಬಾಹ್ಯ ಕ್ಷಣಿಕ ಆಕರ್ಷಣೆಗಳು ಅಥವಾ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರದಂತೆ ಆತ್ಮಸಂಯಮ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಕ್ಷೇಮ.";
    fidelitySummaryEn = "Venus-Rahu tension creates vulnerability to external sensual attractions; conscious commitment to marital boundary is advised.";
    rootCauseKn = "7ನೇ/12ನೇ ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ಶುಕ್ರ-ರಾಹು-ಕುಜ ಯೋಗದ ನೆರಳು ಪ್ರಭಾವ.";
    rootCauseEn = "Venus-Rahu conjunction in relationship/kama houses.";
  }
  
  return {
    hasMaritalFidelity,
    hasSensualChanchalya,
    hasStrongAffairRisk,
    hasSameGenderAffinity,
    hasMaritalDistanceColdness,
    fidelitySummaryKn,
    fidelitySummaryEn,
    rootCauseKn,
    rootCauseEn
  };
};

/**
 * Classical Jyotisha Diagnostic Engine for Negative Character Shades & Criminal Propensity
 * Derived strictly from:
 * 1. Dr. B.V. Raman: "300 Important Combinations" (Chora Yoga #189, Bandhana Yoga #196, Asura & Pisaacha Yogas)
 * 2. Brihat Parashara Hora Shastra (Kama, Stree Jataka & Artha chapters)
 * 3. Saravali (Ch. 30: Chora Yogas & Illicit Wealth)
 * 4. Phaladeepika (Ch. 6 & Ch. 14: Bandhana and Malefic Yogas)
 *
 * Implements 100% Anti-False-Positive Shield:
 * - Jupiter's aspect on Lagna, Lagna Lord, Moon, or 2nd house cancels criminal/theft/predatory propensities.
 * - Benefics in Kendras (1, 4, 7, 10) protect moral conscience (Dharma Viveka).
 * - Minor children (< 14) are 100% shielded with child innocence.
 */
export const evaluateNativeNegativeShadesAndCriminality = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; gender?: string; devoteeAge?: number; devoteeName?: string },
  dashaTiming?: DynamicDashaTiming,
  liveGochara?: LiveGocharaAnalysis
): NegativeShadeAssessment => {
  const devoteeAge = context.devoteeAge ?? calculateDevoteeAge(context.birthDate);
  const isChild = devoteeAge < 14;
  const isMale = (context.gender || "Male").toLowerCase() === "male";
  
  // Extract traditional 5-Anga Panchanga safely
  let tradPanchanga: any = null;
  try {
    if (context.birthDate && context.birthTime) {
      tradPanchanga = calculateTraditionalBaggona(context.birthDate, context.birthTime, context.latitude || 14.54, context.longitude || 74.31);
    }
  } catch (_e) {
    tradPanchanga = null;
  }
  
  const lagnaIdx = kundli.lagnaRashi.index;
  const lagnaLord = signLord(lagnaIdx);
  const lagnaLordPlanet = kundli.planets.find(p => p.name === lagnaLord);
  
  const secondLord = signLord((lagnaIdx + 1) % 12);
  const secondLordPlanet = kundli.planets.find(p => p.name === secondLord);
  const sixthLord = signLord((lagnaIdx + 5) % 12);
  const sixthLordPlanet = kundli.planets.find(p => p.name === sixthLord);
  const seventhLord = signLord((lagnaIdx + 6) % 12);
  const seventhLordPlanet = kundli.planets.find(p => p.name === seventhLord);
  const eighthLord = signLord((lagnaIdx + 7) % 12);
  const eighthLordPlanet = kundli.planets.find(p => p.name === eighthLord);
  const ninthLord = signLord((lagnaIdx + 8) % 12);
  const ninthLordPlanet = kundli.planets.find(p => p.name === ninthLord);
  const eleventhLord = signLord((lagnaIdx + 10) % 12);
  const eleventhLordPlanet = kundli.planets.find(p => p.name === eleventhLord);
  const twelfthLord = signLord((lagnaIdx + 11) % 12);
  const twelfthLordPlanet = kundli.planets.find(p => p.name === twelfthLord);

  const sun = kundli.planets.find(p => p.name === PlanetName.Sun);
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const mercury = kundli.planets.find(p => p.name === PlanetName.Mercury);
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);

  // -------------------------------------------------------------
  // 1. JUPITER & BENEFIC PROTECTIVE SHIELDS (ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಅಮೃತ ರಕ್ಷೆ)
  // -------------------------------------------------------------
  const jupiterAspectsLagna = jupiter ? [1, 5, 7, 9].includes(houseDist(jupiter.house, 1)) : false;
  const jupiterAspectsLagnaLord = (jupiter && lagnaLordPlanet) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, lagnaLordPlanet.house)) : false;
  const jupiterAspectsMoon = (jupiter && moon) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, moon.house)) : false;
  const jupiterAspects2nd = jupiter ? [1, 5, 7, 9].includes(houseDist(jupiter.house, 2)) : false;
  const jupiterAspects2ndLord = (jupiter && secondLordPlanet) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, secondLordPlanet.house)) : false;
  const jupiterAspects7th = jupiter ? [1, 5, 7, 9].includes(houseDist(jupiter.house, 7)) : false;
  const jupiterAspects7thLord = (jupiter && seventhLordPlanet) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, seventhLordPlanet.house)) : false;
  const jupiterAspectsVenus = (jupiter && venus) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, venus.house)) : false;
  const jupiterAspectsMercury = (jupiter && mercury) ? [1, 5, 7, 9].includes(houseDist(jupiter.house, mercury.house)) : false;
  const jupiterAspects9th = jupiter ? [1, 5, 7, 9].includes(houseDist(jupiter.house, 9)) : false;

  const isJupiterProtected = Boolean(
    jupiterAspectsLagna ||
    jupiterAspectsLagnaLord ||
    jupiterAspectsMoon ||
    jupiterAspects2nd ||
    jupiterAspects2ndLord
  );

  const hasBeneficKendraShield = [jupiter, venus].some(p => p && [1, 4, 7, 10, 5, 9].includes(p.house));

  // -------------------------------------------------------------
  // 2. DIMENSION 1: SENSUAL & MARITAL RECTITUDE (ವೈವಾಹಿಕ ನಿಷ್ಠೆ vs ಜಾರತ್ವ & ಕಾಮ ವಿಕೃತಿ)
  // -------------------------------------------------------------
  let dim1Score = 0;
  let dim1Risk = false;
  let dim1TitleKn = "";
  let dim1TitleEn = "";
  let dim1BadgeKn = "";
  let dim1BadgeEn = "";
  let dim1AnalysisKn = "";
  let dim1AnalysisEn = "";
  let dim1BasisKn = "";
  let dim1BasisEn = "";

  const venusH = venus?.house ?? 1;
  const isVenusRahuAfflicted = Boolean(venus && rahu && Math.abs(venus.house - rahu.house) === 0 && [7, 8, 12].includes(venusH));
  const isVenusMarsAfflicted = Boolean(venus && mars && Math.abs(venus.house - mars.house) === 0 && [7, 8, 12].includes(venusH));
  const is7thLordAfflicted = Boolean(seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house) && (rahu?.house === 7 || ketu?.house === 7));
  const isExtremePredatoryAffliction = Boolean(
    venus && mars && rahu && Math.abs(venus.house - rahu.house) === 0 && Math.abs(venus.house - mars.house) === 0 && [7, 8].includes(venusH) &&
    moon && [6, 8, 12].includes(moon.house) && !jupiterAspectsVenus && !jupiterAspects7th
  );

  const isSaturnAspectingVenusInMarsSign = Boolean(
    saturn && venus && [3, 7, 10].includes(houseDist(saturn.house, venus.house)) && [0, 7].includes(venus.rashi.index)
  );
  const hasSensualChanchalya = Boolean(
    (rahu && rahu.house === 5 && mars && (mars.isDebilitated || mars.rashi.index === 3)) ||
    (rahu && rahu.house === 5 && seventhLordPlanet && seventhLordPlanet.house === 8) ||
    isSaturnAspectingVenusInMarsSign
  );

  const is12thLordVenusIn5th = (lagnaIdx === 7 && venus?.house === 5);
  const hasKetuIn7thAndMarsIn8th = Boolean(ketu?.house === 7 && mars?.house === 8);
  const hasExtramaritalAndSpaAffliction = Boolean(
    (is12thLordVenusIn5th && hasKetuIn7thAndMarsIn8th) ||
    (venus?.house === 5 && ketu?.house === 7 && mars?.house === 8)
  );

  if (isChild) {
    dim1Score = 0;
    dim1Risk = false;
    dim1TitleKn = "ಬಾಲ್ಯ ಪಾವಿತ್ರ್ಯ & ಅಂತರಂಗದ ಮುಗ್ಧತೆ";
    dim1TitleEn = "Child Innocence & Emotional Sanctity";
    dim1BadgeKn = "ಬಾಲ್ಯ ಮುಗ್ಧತೆ • ದೋಷರಹಿತ";
    dim1BadgeEn = "Child Innocence • Shielded";
    dim1AnalysisKn = "ಮಗುವಿನ ಅಂತರಂಗವು ಅತ್ಯಂತ ಪವಿತ್ರ, ನಿರ್ಮಲ ಹಾಗೂ ಮುಗ್ಧವಾಗಿದೆ. ಯಾವುದೇ ವಯಸ್ಕರ ಲೈಂಗಿಕ ಅಥವಾ ನೈತಿಕ ದೋಷಗಳು ಅನ್ವಯಿಸುವುದಿಲ್ಲ.";
    dim1AnalysisEn = "Child's consciousness is pure, tender, and shielded from adult sensual vulnerabilities.";
    dim1BasisKn = "14 ವರ್ಷಕ್ಕಿಂತ ಕೆಳಗಿನ ಬಾಲ ಜಾತಕ.";
    dim1BasisEn = "Child chart under 14 years.";
  } else if (hasExtramaritalAndSpaAffliction) {
    dim1Score = 14;
    dim1Risk = true;
    dim1TitleKn = isMale 
      ? "ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ, ಕಾಮ ಚಾಂಚಲ್ಯ & ಮಸಾಜ್/ಸ್ಪಾ ಸುಖದ ದೌರ್ಬಲ್ಯ (Extramarital Affair & Spa Indulgence)" 
      : "ದಾಂಪತ್ಯೇತರ ಸೆಳೆತ & ಬಾಹ್ಯ ಸುಖಾಸಕ್ತಿಯ ಎಚ್ಚರಿಕೆ";
    dim1TitleEn = isMale ? "Extramarital Affair, Kama Chanchalya & Spa Indulgence" : "Extramarital Attraction & Sensual Vulnerability";
    dim1BadgeKn = "ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ • ಮಸಾಜ್ ಸ್ಪಾ ಸುಖಾಸಕ್ತಿ";
    dim1BadgeEn = "Extramarital Affair • Spa Indulgence";
    dim1AnalysisKn = isMale
      ? "7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕೇತು (ಹೆಂಡತಿಯೊಂದಿಗೆ ವೈರಾಗ್ಯ/ಶೀತಲ ಅಂತರ), 8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ (ಕಾಮೋದ್ವೇಗ) ಹಾಗೂ 12ನೇ ವ್ಯಯಾಧಿಪತಿ ಶುಕ್ರನು 5ನೇ ಪ್ರೇಮ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ಉಚ್ಚನಾಗಿರುವುದರಿಂದ, ಸಂಸಾರದ ಹೊರಗೆ ಮತ್ತೊಬ್ಬ ಸ್ತ್ರೀಯೊಂದಿಗೆ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ (Extramarital affair) ಹೊಂದುವ ಹಾಗೂ ಮಸಾಜ್/ಸ್ಪಾ (Massage/Spa) ಶಾರೀರಿಕ ಸುಖಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ತೀವ್ರ ದೌರ್ಬಲ್ಯ ಜಾತಕದಲ್ಲಿದೆ. ಹೆಂಡತಿಯೊಂದಿಗೆ ಅನ್ಯೋನ್ಯತೆಯ ಕೊರತೆಯು ಈ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗೆ ಮೂಲ ಕಾರಣವಾಗಿದ್ದು, ದಾಂಪತ್ಯದಲ್ಲಿ ಇದು ತೀವ್ರ ಕಹಿ ಮತ್ತು ಬಿಕ್ಕಟ್ಟನ್ನು ತಂದಿಡುತ್ತದೆ."
      : "7ನೇ ಮತ್ತು 5ನೇ ಸ್ಥಾನಗಳ ಗ್ರಹ ಸ್ಥಿತಿಯಿಂದಾಗಿ ದಾಂಪತ್ಯದ ಹೊರಗೆ ಭಾವನಾತ್ಮಕ ಸಾಂತ್ವನ ಮತ್ತು ಶಾರೀರಿಕ ಆಕರ್ಷಣೆಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಎಚ್ಚರಿಕೆಯಿದೆ.";
    dim1AnalysisEn = "Ketu in 7th house (marital detachment from lawful spouse), Ashtama Kuja in 8th house (restless sexual energy), and 12th lord Venus exalted in 5th house create a clear vulnerability towards an extramarital affair and body pleasures (including massage spas and secret liaisons).";
    dim1BasisKn = "7ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು, 8ನೇ ಮನೆಯಲ್ಲಿ ಕುಜ ಹಾಗೂ 5ನೇ ಮನೆಯಲ್ಲಿ 12ನೇ ಅಧಿಪತಿ ಶುಕ್ರನ ಸ್ಥಿತಿ.";
    dim1BasisEn = "Ketu in 7th, Mars in 8th, and 12th lord Venus in 5th house.";
  } else if (hasSensualChanchalya) {
    dim1Score = 12;
    dim1Risk = true;
    dim1TitleKn = isMale 
      ? "ಕಾಮ ಚಾಂಚಲ್ಯ & ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆಯ ಎಚ್ಚರಿಕೆ (Sensual Restlessness & Roving Eye)" 
      : "ಕಾಮ ಚಾಂಚಲ್ಯ & ಭಾವನಾತ್ಮಕ ಗಡಿಗಳ ಎಚ್ಚರಿಕೆ";
    dim1TitleEn = isMale ? "Sensual Restlessness, Roving Eye & Self-Control Warning" : "Sensual Restlessness & Emotional Boundaries Warning";
    dim1BadgeKn = "ಕಾಮ ಚಾಂಚಲ್ಯ • ಪರಸ್ತ್ರೀ ಸೆಳೆತ";
    dim1BadgeEn = "Sensual Wanderlust • Caution";
    dim1AnalysisKn = isMale
      ? "5ನೇ ಬುದ್ಧಿ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು, ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜ ಹಾಗೂ 8ನೇ ಮನೆಯಿಂದ ಶುಕ್ರನ ಮೇಲಿರುವ ಶನಿಯ ದೃಷ್ಟಿಯ ಕಾರಣದಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ತೀವ್ರ ಕಾಮ ಚಾಂಚಲ್ಯ, ಪರಸ್ತ್ರೀಯರ ಕಡೆಗೆ ಚಂಚಲ ದೃಷ್ಟಿ (roving eye/sensual curiosity) ಹಾಗೂ ಇಂದ್ರಿಯ ನಿಗ್ರಹದ ಕೊರತೆ ಎದ್ದು ಕಾಣುತ್ತದೆ. ಹೊರಗೆ ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಅಥವಾ ಗೌರವಯುತ ಸ್ಥಾನದಲ್ಲಿದ್ದರೂ, ಆಂತರಿಕವಾಗಿ ಕಾಮ ವಾಸನೆಗಳು ಹಾಗೂ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳು ಸಂಸಾರದಲ್ಲಿ ಹೆಂಡತಿಯೊಂದಿಗೆ ಅಶಾಂತಿ, ಅನುಮಾನ ಹಾಗೂ ಅಂತರವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿವೆ. ಇಂದ್ರಿಯ ಸಂಯಮ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅನಿವಾರ್ಯ."
      : "5ನೇ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು ಹಾಗೂ ಗ್ರಹಗಳ ಚಂಚಲತೆಯಿಂದಾಗಿ ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಗಡಿಗಳನ್ನು ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಅಗತ್ಯವಾಗಿದೆ.";
    dim1AnalysisEn = "Rahu in the 5th house of desires, debilitated Mars in Lagna, and Saturn aspecting Venus create strong sensual wanderlust, a roving eye towards external women, and weakened sensory self-restraint. While maintaining an upright outer persona, these private impulses fuel friction, suspicion, and distance with spouse at home.";
    dim1BasisKn = "5ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು, ನೀಚ ಕುಜ ಹಾಗೂ ಶುಕ್ರನ ಮೇಲೆ ಶನಿಯ ದೃಷ್ಟಿ ಪ್ರಭಾವ.";
    dim1BasisEn = "Rahu in 5th house of desires with debilitated Mars and Saturn-Venus aspect.";
  } else if (isJupiterProtected || jupiterAspects7th || jupiterAspects7thLord || jupiterAspectsVenus) {
    dim1Score = 0;
    dim1Risk = false;
    dim1TitleKn = isMale 
      ? "ಪವಿತ್ರ ದಾಂಪತ್ಯ ನಿಷ್ಠೆ & ಏಕಪತ್ನಿ ವ್ರತ (High Marital Fidelity)" 
      : "ಪವಿತ್ರ ದಾಂಪತ್ಯ ನಿಷ್ಠೆ & ಏಕಪತಿ ವ್ರತ (High Marital Fidelity)";
    dim1TitleEn = isMale ? "Steadfast Marital Fidelity (Single Wife Vow)" : "Steadfast Marital Fidelity (Devoted Wife Vow)";
    dim1BadgeKn = isMale ? "ಏಕಪತ್ನಿ ವ್ರತ • ಸದಾಚಾರ" : "ಏಕಪತಿ ನಿಷ್ಠೆ • ಗೃಹಲಕ್ಷ್ಮಿ";
    dim1BadgeEn = "Marital Fidelity • Pure 7th";
    dim1AnalysisKn = isMale
      ? "7ನೇ ಕಳತ್ರ ಹಾಗೂ ಕಾಮ ಸ್ಥಾನವು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಸದಾಚಾರ ನಿಮ್ಮ ಮೂಲ ಸ್ವಭಾವವಾಗಿದೆ. ಯಾವುದೇ ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ, ಅನೈತಿಕ ಆಕರ್ಷಣೆ ಅಥವಾ ರಹಸ್ಯ ಕಾಮ ಚಪಲಗಳಿಗೆ ಬಲಿಯಾಗದೆ, ಪವಿತ್ರ ದಾಂಪತ್ಯ ನಿಷ್ಠೆ (ಏಕಪತ್ನಿ ವ್ರತ) ಪಾಲಿಸುವ ಧೀಮಂತ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ."
      : "7ನೇ ಕಳತ್ರ ಹಾಗೂ ಕಾಮ ಸ್ಥಾನವು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಸದಾಚಾರ ನಿಮ್ಮ ಮೂಲ ಸ್ವಭಾವವಾಗಿದೆ. ಯಾವುದೇ ಪರಪುರುಷ ವ್ಯಾಮೋಹ, ಅನೈತಿಕ ಆಕರ್ಷಣೆ ಅಥವಾ ರಹಸ್ಯ ಸಂಬಂಧಗಳಿಗೆ ಬಲಿಯಾಗದೆ, ಪವಿತ್ರ ದಾಂಪತ್ಯ ನಿಷ್ಠೆ (ಏಕಪತಿ ನಿಷ್ಠೆ / ಪತಿವ್ರತಾ ಧರ್ಮ) ಪಾಲಿಸುವ ಧೀಮಂತ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ.";
    dim1AnalysisEn = isMale
      ? "7th house of marriage and Venus are blessed by Jupiter's divine shield. Endowed with sensory self-restraint and moral conscience, you observe steadfast marital fidelity free of external affairs."
      : "7th house of marriage and Venus are shielded by Jupiter's grace. Endowed with natural modesty and marital loyalty, you uphold sacred family boundaries free of external entanglements.";
    dim1BasisKn = "7ನೇ ಮನೆ ಮತ್ತು ಶುಕ್ರನಿಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯ ರಕ್ಷಣೆ.";
    dim1BasisEn = "Jupiterian benefic aspect shielding the 7th house and Venus.";
  } else {
    // Afflicted
    if (isExtremePredatoryAffliction) {
      dim1Score = 18;
      dim1Risk = true;
      dim1TitleKn = "ತೀವ್ರ ಕಾಮ ವಿಕಾರ & ನೈತಿಕ ಗಡಿಗಳ ಉಲ್ಲಂಘನೆಯ ಅಪಾಯ (Extreme Sensual Transgression)";
      dim1TitleEn = "Extreme Sensual Transgression & Boundary Breach Vulnerability";
      dim1BadgeKn = "ಶುಕ್ರ-ರಾಹು-ಕುಜ • ಕಾಮ ವಿಕಾರ";
      dim1BadgeEn = "Venus-Mars-Rahu Affliction";
      dim1AnalysisKn = "7ನೇ/8ನೇ ಸ್ಥಾನದಲ್ಲಿ ಶುಕ್ರ, ಕುಜ ಮತ್ತು ರಾಹುಗಳ ತೀವ್ರ ಸಂಯೋಗವಿದ್ದು, ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯ ಕೊರತೆಯಿರುವುದರಿಂದ, ಕಾಮ ವಿಕೃತಿ, ಅನಿಯಂತ್ರಿತ ಇಂದ್ರಿಯ ಚಪಲ ಹಾಗೂ ಎದುರಿನವರ ಸಮ್ಮತಿ-ಗೌರವವನ್ನು ಕಡೆಗಣಿಸುವ ನೈತಿಕ ಪತನದ ತೀವ್ರ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ. ಇದು ಸಾಮಾಜಿಕ ಗೌರವ ಮತ್ತು ಕುಟುಂಬವನ್ನು ಧ್ವಂಸ ಮಾಡುವ ಅಪಾಯ ತಂದೊಡ್ಡಬಹುದು.";
      dim1AnalysisEn = "Triple conjunction of Venus, Mars, and Rahu across marital/hidden houses without benefic mitigation generates predatory impulses and boundary violations requiring severe restraint.";
      dim1BasisKn = "7ನೇ/8ನೇ ಭಾವದಲ್ಲಿ ಶುಕ್ರ-ಕುಜ-ರಾಹುಗಳ ತೀವ್ರ ಗ್ರಹ ಸಂಯೋಗ.";
      dim1BasisEn = "Venus-Mars-Rahu affliction in 7th/8th house.";
    } else if (isVenusRahuAfflicted || isVenusMarsAfflicted || is7thLordAfflicted) {
      dim1Score = 14;
      dim1Risk = true;
      dim1TitleKn = isMale
        ? "ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ & ರಹಸ್ಯ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧದ ಸೆಳೆತ (Extramarital Temptation)"
        : "ಪರಪುರುಷ ವ್ಯಾಮೋಹ & ಬಾಹ್ಯ ಭಾವನಾತ್ಮಕ ಸಾಂತ್ವನದ ಸೆಳೆತ (External Romance Vulnerability)";
      dim1TitleEn = isMale ? "Extramarital Temptation & Secret Affair Risk" : "External Romantic Vulnerability";
      dim1BadgeKn = "ಶುಕ್ರ-ರಾಹು • ದಾಂಪತ್ಯೇತರ ಸೆಳೆತ";
      dim1BadgeEn = "Venus-Rahu Affair Vulnerability";
      dim1AnalysisKn = isMale
        ? "7ನೇ ಕಳತ್ರ ಮತ್ತು 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ ಅಥವಾ ರಾಹುವಿನ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯ ಜೀವನದ ಆಚೆಗೆ ಹೊರಗಿನ ಸ್ತ್ರೀಯರ ಕಡೆಗೆ (ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ) ರಹಸ್ಯ ಚಾಟ್ ಮಾತುಕತೆ ಹಾಗೂ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಎಚ್ಚರಿಕೆ ಜಾತಕದಲ್ಲಿದೆ."
        : "7ನೇ ಕಳತ್ರ ಹಾಗೂ 12ನೇ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ-ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಪತಿಯಿಂದ ನಿರೀಕ್ಷಿತ ಪ್ರೀತಿ ಸಿಗದಿದ್ದಾಗ ಹೊರಗಿನ ಇತರ ಪುರುಷರ ಕಡೆಗೆ ಭಾವನಾತ್ಮಕ ಸಾಂತ್ವನ ಹಾಗೂ ರಹಸ್ಯ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಎಚ್ಚರಿಕೆಯಿದೆ.";
      dim1AnalysisEn = "Venus-Rahu tension creates vulnerability to external romantic validation and secret liaisons when emotional intimacy feels absent at home.";
      dim1BasisKn = "7ನೇ/12ನೇ ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ಶುಕ್ರ-ರಾಹು ನೆರಳು ಪ್ರಭಾವ.";
      dim1BasisEn = "Venus-Rahu affliction across 7th/12th axis.";
    } else {
      dim1Score = 4;
      dim1Risk = false;
      dim1TitleKn = "ದಾಂಪತ್ಯದಲ್ಲಿ ಸೌಮ್ಯ ಭಾವನಾತ್ಮಕ ಅಂತರ (Mild Marital Sensitivity)";
      dim1TitleEn = "Mild Marital Communication Gap";
      dim1BadgeKn = "ಸೌಮ್ಯ ಸಂವಹನ ಅಂತರ";
      dim1BadgeEn = "Mild Communication Gap";
      dim1AnalysisKn = "ದಾಂಪತ್ಯದಲ್ಲಿ ಯಾವುದೇ ಅನೈತಿಕ ಅಥವಾ ದಾಂಪತ್ಯೇತರ ಅಪಾಯಗಳಿಲ್ಲ; ಕೇವಲ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ಉಂಟಾಗುವ ಸೌಮ್ಯ ಭಾವನಾತ್ಮಕ ಅಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ.";
      dim1AnalysisEn = "Free of extramarital risks; occasional communication gaps arise solely from work fatigue.";
      dim1BasisKn = "7ನೇ ಮನೆಯ ಸಾಮಾನ್ಯ ಗ್ರಹ ಸ್ಥಿತಿ.";
      dim1BasisEn = "Stable 7th house with mild work stress.";
    }
  }

  // -------------------------------------------------------------
  // 3. DIMENSION 2: FINANCIAL INTEGRITY VS THEFT / FRAUD / EMBEZZLEMENT (ಆರ್ಥಿಕ ಪ್ರಾಮಾಣಿಕತೆ vs ಚೋರ ಯೋಗ & ವಂಚನೆ)
  // -------------------------------------------------------------
  let dim2Score = 0;
  let dim2Risk = false;
  let dim2TitleKn = "";
  let dim2TitleEn = "";
  let dim2BadgeKn = "";
  let dim2BadgeEn = "";
  let dim2AnalysisKn = "";
  let dim2AnalysisEn = "";
  let dim2BasisKn = "";
  let dim2BasisEn = "";

  // Classical B.V. Raman Chora Yoga & Saravali Ch. 30
  const isMercuryAfflicted = Boolean(mercury && [6, 8, 12].includes(mercury.house) && (rahu?.house === mercury.house || mars?.house === mercury.house));
  const is2ndLordDusthanaWithRahu = Boolean(secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house) && (rahu?.house === secondLordPlanet.house || rahu?.house === 2));
  const isSaravaliIllicitWealth = Boolean(eleventhLordPlanet && eleventhLordPlanet.house === 8 && eighthLordPlanet && eighthLordPlanet.house === 11);
  const isMaandiInMoneyHousesWithMalefic = Boolean(
    kundli.maandi && [2, 11].includes(houseDist(lagnaIdx + 1, kundli.maandi.rashi.index + 1)) &&
    [saturn, rahu, mars].some(m => m && [2, 11].includes(m.house))
  );

  if (isChild) {
    dim2Score = 0;
    dim2Risk = false;
    dim2TitleKn = "ನಿಷ್ಕಲ್ಮಶ ಮುಗ್ಧತೆ & ಸ್ವಾರ್ಥರಹಿತ ಮನಸ್ಸು";
    dim2TitleEn = "Pure Innocence & Selfless Heart";
    dim2BadgeKn = "ಮುಗ್ಧ ಮನಸ್ಸು • ಚೋರಮುಕ್ತ";
    dim2BadgeEn = "Innocent • Defect Free";
    dim2AnalysisKn = "ಮಗುವಿನ ಮನಸ್ಸು ನಿರ್ಮಲವಾಗಿದ್ದು, ಯಾವುದೇ ಆರ್ಥಿಕ ಅಥವಾ ಸ್ವಾರ್ಥ ದುರಾಸೆಯಿಲ್ಲ.";
    dim2AnalysisEn = "Child's mind is untouched by financial greed or deceptive motives.";
    dim2BasisKn = "ಬಾಲ್ಯ ಪಾವಿತ್ರ್ಯ.";
    dim2BasisEn = "Child innocence.";
  } else if (jupiterAspects2nd || jupiterAspects2ndLord || jupiterAspectsMercury || isJupiterProtected) {
    dim2Score = 0;
    dim2Risk = false;
    dim2TitleKn = "ಧರ್ಮನಿಷ್ಠ ಆರ್ಥಿಕ ಪ್ರಾಮಾಣಿಕತೆ & ಕಳಂಕ ರಹಿತ ದ್ರವ್ಯಾರ್ಜನೆ (High Financial Integrity)";
    dim2TitleEn = "Impeccable Financial Honesty & Clean Wealth (Zero Theft/Fraud Risk)";
    dim2BadgeKn = "ನ್ಯಾಯ ಸಂಪತ್ತು • ಚೋರ ದೋಷ ಮುಕ್ತ";
    dim2BadgeEn = "Righteous Wealth • Zero Fraud";
    dim2AnalysisKn = "2ನೇ ಧನ ಸ್ಥಾನ ಮತ್ತು ಬುದ್ಧಿಕಾರಕ ಬುಧನ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಶುಭ ಗ್ರಹಗಳ ಪರಿಪೂರ್ಣ ರಕ್ಷಣೆ ಇದೆ. ನಿಮ್ಮಲ್ಲಿ ಪರರ ಹಣದ ದುರಾಸೆ, ವಂಚನೆ, ಕಳ್ಳತನ ಅಥವಾ ಭ್ರಷ್ಟಾಚಾರದ ಲವಲೇಶವೂ ಇಲ್ಲ. ಕಷ್ಟಪಟ್ಟು ನ್ಯಾಯಯುತವಾಗಿ ಸಂಪಾದಿಸುವ ಹಾಗೂ ಅಗತ್ಯವಿದ್ದಾಗ ದಾನ ಧರ್ಮ ಮಾಡುವ ಪ್ರಾಮಾಣಿಕ ವ್ಯಕ್ತಿತ್ವ ನಿಮ್ಮದು. ಚೋರ ಯೋಗ ಅಥವಾ ಆರ್ಥಿಕ ವಂಚನೆಯ ಕಳಂಕ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಸಂಪೂರ್ಣ ಶೂನ್ಯವಾಗಿದೆ.";
    dim2AnalysisEn = "The 2nd house of wealth and Mercury are shielded by Jupiter and benefic auspices. Endowed with impeccable honesty, you strictly reject illicit wealth, theft, or embezzlement. Chora Yoga is completely absent.";
    dim2BasisKn = "2ನೇ ಧನ ಸ್ಥಾನ ಮತ್ತು ಬುಧನಿಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯ ರಕ್ಷಣೆ.";
    dim2BasisEn = "Jupiter's protective aspect purifying the 2nd house of wealth and Mercury.";
  } else {
    // Afflicted
    if (isMercuryAfflicted || is2ndLordDusthanaWithRahu) {
      dim2Score = (isMercuryAfflicted && is2ndLordDusthanaWithRahu) ? 17 : 14;
      dim2Risk = true;
      dim2TitleKn = "ಚೋರ ಯೋಗ, ವಂಚನೆ & ಆರ್ಥಿಕ ದುರ್ವರ್ತನೆಯ ಅಪಾಯ (Chora Yoga & Financial Fraud Risk)";
      dim2TitleEn = "Chora Yoga & Financial Embezzlement Risk";
      dim2BadgeKn = "ಚೋರ ಯೋಗ • ಆರ್ಥಿಕ ಮೋಸ";
      dim2BadgeEn = "Chora Yoga • Fraud Risk";
      dim2AnalysisKn = "ಶಾಸ್ತ್ರೋಕ್ತ ಚೋರ ಯೋಗ (B.V. Raman Chora Yoga): ಬುದ್ಧಿಕಾರಕ ಬುಧ ಮತ್ತು 2ನೇ ಧನಾಧಿಪತಿಯು ರಾಹು-ಕುಜರೊಂದಿಗೆ ತ್ರಿಕ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ, ಹಣಕಾಸಿನ ಮುಗ್ಗಟ್ಟು ಅಥವಾ ಸಾಲದ ಒತ್ತಡದಲ್ಲಿ ಕಳ್ಳತನ, ನಂಬಿಕೆದ್ರೋಹ, ಖೊಟ್ಟಿ ಲೆಕ್ಕಪತ್ರ ಅಥವಾ ವಂಚನೆಯ ಮೂಲಕ ಹಣ ಲಪಟಾಯಿಸುವ ಅಪಾಯದ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ.";
      dim2AnalysisEn = "Classical Chora Yoga: Affliction to Mercury and 2nd lord by Rahu-Mars in dusthanas indicates vulnerability to financial embezzlement, breach of fiduciary trust, or deceptive shortcuts under financial panic.";
      dim2BasisKn = "ಬುಧ ಮತ್ತು 2ನೇ ಧನಾಧಿಪತಿಯ ಮೇಲೆ ರಾಹು-ಕುಜರ ಚೋರ ಯೋಗ.";
      dim2BasisEn = "Chora Yoga: Mercury and 2nd lord afflicted by Rahu/Mars in dusthana.";
    } else if (isSaravaliIllicitWealth || isMaandiInMoneyHousesWithMalefic) {
      dim2Score = 12;
      dim2Risk = true;
      dim2TitleKn = "ಅನೈತಿಕ ಹಣಕಾಸಿನ ಆಮಿಷ & ಕಮಿಷನ್ ದಂಧೆಯ ಎಚ್ಚರಿಕೆ (Illicit Financial Temptation)";
      dim2TitleEn = "Illicit Wealth & Commission Shortcut Vulnerability";
      dim2BadgeKn = "ಅಕ್ರಮ ಧನಾರ್ಜನೆ ಎಚ್ಚರಿಕೆ";
      dim2BadgeEn = "Illicit Gain Warning";
      dim2AnalysisKn = "ಸಾರಾವಳಿ ಗ್ರಂಥದ ಪ್ರಕಾರ 11ನೇ ಮತ್ತು 8ನೇ ಮನೆಗಳ ಅಶುಭ ಗ್ರಹ ಸಂಬಂಧದಿಂದಾಗಿ, ಸುಲಭವಾಗಿ ಹಣ ಮಾಡುವ ಅಕ್ರಮ ದಂಧೆಗಳು ಅಥವಾ ತೆರಿಗೆ/ಲೆಕ್ಕ ತಪ್ಪಿಸುವ ಆಮಿಷಗಳು ಕಾಡಬಹುದು; ಪ್ರಾಮಾಣಿಕತೆಯಿಂದ ಮಾತ್ರ ಗೌರವ ಉಳಿಯುತ್ತದೆ.";
      dim2AnalysisEn = "Saravali principle: 11th and 8th house nexus brings temptation for illicit earnings or grey-market shortcuts that threaten legal trouble.";
      dim2BasisKn = "11ನೇ ಮತ್ತು 8ನೇ ಅಧಿಪತಿಗಳ ಅಶುಭ ವಿನಿಮಯ.";
      dim2BasisEn = "11th-8th lord affliction triggering illicit wealth attraction.";
    } else {
      dim2Score = 3;
      dim2Risk = false;
      dim2TitleKn = "ಸಾಮಾನ್ಯ ಆರ್ಥಿಕ ಜಾಗ್ರತೆ (Normal Financial Caution)";
      dim2TitleEn = "Normal Financial Caution";
      dim2BadgeKn = "ಆರ್ಥಿಕ ಭದ್ರತೆ";
      dim2BadgeEn = "Financial Stability";
      dim2AnalysisKn = "ಆರ್ಥಿಕ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಯಾವುದೇ ಚೋರ ಅಥವಾ ವಂಚನೆಯ ದೋಷಗಳಿಲ್ಲ; ಹಣದ ಹೂಡಿಕೆಯಲ್ಲಿ ಸಾಧಾರಣ ಜಾಗ್ರತೆ ವಹಿಸಿದರೆ ಸಾಕು.";
      dim2AnalysisEn = "Zero theft or fraud tendencies; ordinary commercial prudence is sufficient.";
      dim2BasisKn = "2ನೇ ಮನೆಯ ಸಾಮಾನ್ಯ ಶುಭ ಸ್ಥಿತಿ.";
      dim2BasisEn = "Stable 2nd house of income.";
    }
  }

  // -------------------------------------------------------------
  // 4. DIMENSION 3: PEACEFULNESS VS CRUELTY / VIOLENCE / MURDEROUS RAGE (ಶಾಂತಿ & ಅಹಿಂಸೆ vs ಹತ್ಯಾ ಯೋಗ & ಕ್ರೌರ್ಯ)
  // -------------------------------------------------------------
  let dim3Score = 0;
  let dim3Risk = false;
  let dim3TitleKn = "";
  let dim3TitleEn = "";
  let dim3BadgeKn = "";
  let dim3BadgeEn = "";
  let dim3AnalysisKn = "";
  let dim3AnalysisEn = "";
  let dim3BasisKn = "";
  let dim3BasisEn = "";

  // Classical BPHS Ch. 45 & B.V. Raman Asura / Angaraka Yoga
  const isMarsRahuAngaraka = Boolean(mars && rahu && Math.abs(mars.house - rahu.house) === 0 && [1, 8, 10].includes(mars.house));
  const isSunMarsSaturnAfflicted = Boolean(sun && mars && [8, 12].includes(mars.house) && saturn && [3, 7, 10].includes(houseDist(saturn.house, mars.house)));
  const isColdCrueltyMoon = Boolean(moon && [mars, ketu].some(m => m && Math.abs(m.house - moon.house) === 0) && moon.house === 8 && saturn && [3, 7, 10].includes(houseDist(saturn.house, 8)));

  if (isChild) {
    dim3Score = 0;
    dim3Risk = false;
    dim3TitleKn = "ಕೋಮಲ ಹೃದಯ & ದಯಾಪರತೆ";
    dim3TitleEn = "Gentle Heart & Tender Nature";
    dim3BadgeKn = "ಕೋಮಲ ಹೃದಯ • ಅಹಿಂಸೆ";
    dim3BadgeEn = "Tender • Non-violent";
    dim3AnalysisKn = "ಮಗುವಿನ ಮನಸ್ಸು ಅತ್ಯಂತ ಮೃದುವಾಗಿದ್ದು, ಯಾವುದೇ ಕ್ರೌರ್ಯ ಅಥವಾ ಹಿಂಸಾ ಪ್ರವೃತ್ತಿಯಿಲ್ಲ.";
    dim3AnalysisEn = "Child possesses a tender, gentle heart free from violence.";
    dim3BasisKn = "ಬಾಲ್ಯ ಮುಗ್ಧತೆ.";
    dim3BasisEn = "Child innocence.";
  } else if (jupiterAspectsLagna || jupiterAspectsLagnaLord || jupiterAspectsMoon || isJupiterProtected) {
    dim3Score = 0;
    dim3Risk = false;
    dim3TitleKn = "ಅಹಿಂಸಾ ಧರ್ಮ, ಶಾಂತಿ ಪ್ರವೃತ್ತಿ & ಸೌಜನ್ಯ (Noble Non-Violence & Compassion)";
    dim3TitleEn = "Noble Non-Violence, Compassion & Peace (Zero Cruelty/Assault Risk)";
    dim3BadgeKn = "ಅಹಿಂಸಾ ಧರ್ಮ • ಶಾಂತ ಸ್ವಭಾವ";
    dim3BadgeEn = "Ahimsa Dharma • Peaceful Mind";
    dim3AnalysisKn = "ಲಗ್ನ, ಲಗ್ನಾಧಿಪತಿ ಮತ್ತು ಮನಃಕಾರಕ ಚಂದ್ರನ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಸಾತ್ವಿಕ ದೃಷ್ಟಿಯಿದೆ. ನಿಮ್ಮ ಹೃದಯದಲ್ಲಿ ಸಹಜ ಕರುಣೆ, ಸೌಜನ್ಯ ಮತ್ತು ಅಹಿಂಸಾ ಧರ್ಮ ನೆಲೆಸಿದೆ. ಎಂತಹ ಸಿಟ್ಟಿನ ಅಥವಾ ಪ್ರಚೋದನೆಯ ಸಂದರ್ಭದಲ್ಲೂ ಜೀವಹಿಂಸೆ, ಹಲ್ಲೆ, ಮಾರಣಾಂತಿಕ ಕ್ರೌರ್ಯ ಅಥವಾ ದೈಹಿಕ ದೌರ್ಜನ್ಯಕ್ಕೆ ಕೈಹಾಕದ ಪ್ರಬುದ್ಧ ಸಂಯಮ ನಿಮ್ಮಲ್ಲಿದೆ. ಹತ್ಯಾ ಯೋಗ ಅಥವಾ ಹಿಂಸಾ ಪ್ರವೃತ್ತಿಯು ಸಂಪೂರ್ಣ ಶೂನ್ಯವಾಗಿದೆ.";
    dim3AnalysisEn = "Lagna and the Moon receive Jupiter's divine protective drishti. Grounded in compassion and Ahimsa (non-violence), you naturally refrain from physical cruelty, assault, or lethal aggression. Hatya/Asura Yoga is completely absent.";
    dim3BasisKn = "ಲಗ್ನ ಮತ್ತು ಚಂದ್ರನಿಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಸಾತ್ವಿಕ ದೃಷ್ಟಿಯ ಶ್ರೀರಕ್ಷೆ.";
    dim3BasisEn = "Jupiter's compassionate aspect on Lagna and Moon guaranteeing peaceful temperament.";
  } else {
    // Afflicted
    if (isSunMarsSaturnAfflicted || (isMarsRahuAngaraka && !jupiterAspectsLagna)) {
      dim3Score = 18;
      dim3Risk = true;
      dim3TitleKn = "ಕ್ರೂರ ಯೋಗ, ಉಗ್ರ ಹಿಂಸಾ ಪ್ರವೃತ್ತಿ & ಹತ್ಯಾ ವಿಕೋಪದ ಅಪಾಯ (Asura Yoga & Destructive Rage)";
      dim3TitleEn = "Asura Yoga: Destructive Aggression & Violent Assault Risk";
      dim3BadgeKn = "ಅಂಗಾರಕ ಯೋಗ • ಉಗ್ರ ಕ್ರೌರ್ಯ";
      dim3BadgeEn = "Angaraka Yoga • Violent Rage";
      dim3AnalysisKn = "ಪರಾಶರ ಶಾಸ್ತ್ರದ ಅಂಗಾರಕ-ಅಸುರ ಯೋಗ (Angaraka & Asura Yoga): ಲಗ್ನ ಅಥವಾ ಅಷ್ಟಮದಲ್ಲಿ ಕುಜ-ರಾಹುವಿನ ತೀವ್ರ ಅಗ್ನಿ ಪ್ರಭಾವವಿದ್ದು, ಗುರುವಿನ ಶಾಂತ ದೃಷ್ಟಿ ಇಲ್ಲದಿರುವುದರಿಂದ, ವಿಪರೀತ ಕೋಪದಲ್ಲಿ ವಿವೇಕ ಕಳೆದುಕೊಂಡು ದೈಹಿಕ ಹಲ್ಲೆ, ಮಾರಣಾಂತಿಕ ಕ್ರೌರ್ಯ, ಆಯುಧ ಪ್ರಯೋಗ ಅಥವಾ ಹಿಂಸಾತ್ಮಕ ದಾಳಿಗೆ ಕೈಹಾಕುವ ವಿನಾಶಕಾರಿ ನೆರಳು ಜಾತಕದಲ್ಲಿದೆ.";
      dim3AnalysisEn = "Classical Asura & Angaraka Yoga: Mars-Rahu conjunction in Lagna/8th without Jupiterian restraint indicates dangerous boiling rage, violent physical assault, and destructive wrath when provoked.";
      dim3BasisKn = "ಲಗ್ನ/ಅಷ್ಟಮದಲ್ಲಿ ಕುಜ-ರಾಹುಗಳ ಉಗ್ರ ಅಂಗಾರಕ ಯೋಗ.";
      dim3BasisEn = "Mars-Rahu Angaraka Yoga in Lagna/8th generating explosive violence.";
    } else if (isColdCrueltyMoon) {
      dim3Score = 14;
      dim3Risk = true;
      dim3TitleKn = "ಭಾವಶೂನ್ಯ ಕ್ರೌರ್ಯ & ಆಂತರಿಕ ಸೇಡಿನ ಪ್ರವೃತ್ತಿ (Cold Vindictiveness & Cruelty)";
      dim3TitleEn = "Cold Vindictiveness & Lack of Empathy";
      dim3BadgeKn = "ಮನಸ್ತಾಪ • ಸೇಡಿನ ಗುಣ";
      dim3BadgeEn = "Cold Revenge Warning";
      dim3AnalysisKn = "ಅಷ್ಟಮ ಚಂದ್ರನ ಮೇಲೆ ಶನಿ-ಕೇತುಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ತೀವ್ರ ಸೇಡು, ಸಹಾನುಭೂತಿಯ ಕೊರತೆ ಹಾಗೂ ಎದುರಾಳಿಗಳನ್ನು ನಿರ್ದಯವಾಗಿ ತುಳಿಯುವ ತಂಪು ಕ್ರೌರ್ಯ ಕಾಡಬಹುದು; ನಿತ್ಯ ಶಿವೋಪಾಸನೆ ಅಗತ್ಯ.";
      dim3AnalysisEn = "Affliction of the Moon in the 8th house generates vindictive detachment and cold cruelty requiring spiritual purification.";
      dim3BasisKn = "ಅಷ್ಟಮದಲ್ಲಿ ಚಂದ್ರ-ಕೇತು-ಶನಿಗಳ ಕ್ರೂರ ದೋಷ.";
      dim3BasisEn = "Afflicted Moon in 8th house triggering emotional numbness.";
    } else {
      dim3Score = 4;
      dim3Risk = false;
      dim3TitleKn = "ಕ್ಷಣಿಕ ಆವೇಶದ ಸಿಟ್ಟು (Temporary Situational Anger)";
      dim3TitleEn = "Temporary Situational Anger";
      dim3BadgeKn = "ಸಾಮಾನ್ಯ ಸಿಟ್ಟು";
      dim3BadgeEn = "Normal Irritability";
      dim3AnalysisKn = "ಕೇವಲ ಕ್ಷಣಿಕ ಸಿಟ್ಟು ಅಥವಾ ಮಾತಿನ ಚಕಮಕಿ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ; ಯಾವುದೇ ದೈಹಿಕ ಹಿಂಸೆ ಅಥವಾ ಕ್ರೌರ್ಯದ ಲಕ್ಷಣಗಳಿಲ್ಲ.";
      dim3AnalysisEn = "Normal transient irritability under pressure; strictly free from violent or criminal impulses.";
      dim3BasisKn = "ಕುಜನ ಸಾಮಾನ್ಯ ಸಂಚಾರ.";
      dim3BasisEn = "Ordinary Mars placement.";
    }
  }

  // -------------------------------------------------------------
  // 5. DIMENSION 4: LEGAL RESPECT VS CRIMINALITY & IMPRISONMENT (ಕಾನೂನು ಗೌರವ vs ಅಪರಾಧ & ಬಂಧನ ಯೋಗ)
  // -------------------------------------------------------------
  let dim4Score = 0;
  let dim4Risk = false;
  let dim4TitleKn = "";
  let dim4TitleEn = "";
  let dim4BadgeKn = "";
  let dim4BadgeEn = "";
  let dim4AnalysisKn = "";
  let dim4AnalysisEn = "";
  let dim4BasisKn = "";
  let dim4BasisEn = "";

  // Classical B.V. Raman Combination #196 Bandhana Yoga & Phaladeepika Ch. 6
  const isRamanBandhanaYoga = Boolean(
    saturn && rahu &&
    ([2, 12, 5, 9].includes(saturn.house) && [2, 12, 5, 9].includes(rahu.house))
  );
  const is6th12thCustodyAffliction = Boolean(
    sixthLordPlanet && sixthLordPlanet.house === 12 && (rahu?.house === 12 || saturn?.house === 12)
  );
  const isLagnaLord6thLordAfflicted = Boolean(
    lagnaLordPlanet && sixthLordPlanet && Math.abs(lagnaLordPlanet.house - sixthLordPlanet.house) === 0 && [saturn, rahu].some(p => p && p.house === lagnaLordPlanet.house)
  );

  if (isChild) {
    dim4Score = 0;
    dim4Risk = false;
    dim4TitleKn = "ಪೂರ್ಣ ಸ್ವಾತಂತ್ರ್ಯ & ಪೋಷಕರ ರಕ್ಷಣೆ";
    dim4TitleEn = "Total Freedom & Parental Shield";
    dim4BadgeKn = "ಪೋಷಕರ ರಕ್ಷಣೆ • ಮುಕ್ತ";
    dim4BadgeEn = "Parental Shield";
    dim4AnalysisKn = "ಮಗುವು ಪೋಷಕರ ಪ್ರೀತಿಯ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು ಯಾವುದೇ ಕಾನೂನು ಅಥವಾ ಬಂಧನ ದೋಷಗಳಿಲ್ಲ.";
    dim4AnalysisEn = "Child enjoys complete innocence under loving parental protection.";
    dim4BasisKn = "ಬಾಲ್ಯ ಜಾತಕ.";
    dim4BasisEn = "Child horoscope.";
  } else if (isJupiterProtected || (sun && [10, 11].includes(sun.house))) {
    dim4Score = 0;
    dim4Risk = false;
    dim4TitleKn = "ಕಾನೂನು ಗೌರವ, ಸಮಾಜ ಮರ್ಯಾದೆ & ಬಂಧನ ಮುಕ್ತ ಸೌಭಾಗ್ಯ (Law-Abiding & Civic Honor)";
    dim4TitleEn = "Law-Abiding Citizen & High Civic Honor (Zero Imprisonment/Bandhana Risk)";
    dim4BadgeKn = "ಕಾನೂನು ಗೌರವ • ಬಂಧನ ಮುಕ್ತ";
    dim4BadgeEn = "Civic Honor • Free of Custody";
    dim4AnalysisKn = "9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಮತ್ತು ರಾಜಕಾರಕ ಸೂರ್ಯನ ಬಲವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ. ನೀವು ಸಮಾಜದ ನಿಯಮಗಳನ್ನು ಗೌರವಿಸುವ, ಕಾನೂನಿನ ಚೌಕಟ್ಟಿನಲ್ಲಿ ಬದುಕುವ ಆದರ್ಶ ಪ್ರಜೆಯಾಗಿದ್ದೀರಿ. ಯಾವುದೇ ಪೊಲೀಸ್ ಕೇಸು, ಕೋರ್ಟು ಶಿಕ್ಷೆ, ಕಳಂಕ ಅಥವಾ ಕಾರಾಗೃಹ ವಾಸದ (ಬಂಧನ ಯೋಗ) ಲವಲೇಶವೂ ನಿಮ್ಮ ಜಾತಕಕ್ಕಿಲ್ಲ. ನಿಮ್ಮ ನಾಗರಿಕ ಸ್ವಾತಂತ್ರ್ಯ ಮತ್ತು ಗೌರವವನ್ನು ಸದಾ ಕಾಪಾಡುವ ದೈವಿಕ ರಕ್ಷಣೆ ನಿಮ್ಮ ಬೆನ್ನಿಗಿದೆ.";
    dim4AnalysisEn = "The 9th house of Dharma and the Sun protect your civic honor. You are an upright, law-abiding citizen. Bandhana Yoga (imprisonment, police custody, or criminal record) is completely non-existent.";
    dim4BasisKn = "9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಮತ್ತು ಸೂರ್ಯನ ಶುಭ ಬಲದಿಂದಾಗಿ ಬಂಧನ ಯೋಗ ನಾಶ.";
    dim4BasisEn = "Sun and 9th house of dharma protecting civil liberty and civic standing.";
  } else {
    // Afflicted
    if (isRamanBandhanaYoga || is6th12thCustodyAffliction || isLagnaLord6thLordAfflicted) {
      dim4Score = 16;
      dim4Risk = true;
      dim4TitleKn = "ಶಾಸ್ತ್ರೋಕ್ತ ಬಂಧನ ಯೋಗ & ಕಾನೂನು ಸಂಘರ್ಷದ ಎಚ್ಚರಿಕೆ (B.V. Raman Bandhana Yoga)";
      dim4TitleEn = "Bandhana Yoga: Legal Confinement & Police Custody Risk";
      dim4BadgeKn = "ಬಂಧನ ಯೋಗ • ಕೋರ್ಟ್/ಪೊಲೀಸ್";
      dim4BadgeEn = "Bandhana Yoga • Confinement";
      dim4AnalysisKn = "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ 300 ಪ್ರಮುಖ ಯೋಗಗಳ 'ಬಂಧನ ಯೋಗ' (Bandhana Yoga #196): 2, 12, 5 ಮತ್ತು 9ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಶನಿ-ರಾಹುಗಳ ಸಂಚಾರ ಅಥವಾ 6 ಮತ್ತು 12ನೇ ಅಧಿಪತಿಗಳ ಅಶುಭ ಸಂಯೋಗದಿಂದಾಗಿ, ಕಾನೂನುಬಾಹಿರ ಕೃತ್ಯಗಳಲ್ಲಿ ಸಿಲುಕಿ ಪೊಲೀಸ್ ತನಿಖೆ, ಕೋರ್ಟು ವ್ಯಾಜ್ಯ, ದಂಡ ಅಥವಾ ಕಾರಾಗೃಹ ವಾಸದ (ಬಂಧನ) ಅಪಾಯದ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ. ಸರ್ಕಾರದ ನಿಯಮಗಳನ್ನು ಚಾಚೂ ತಪ್ಪದೆ ಪಾಲಿಸಬೇಕು.";
      dim4AnalysisEn = "Dr. B.V. Raman's Bandhana Yoga (#196): Saturn and Rahu afflicting the 2nd/12th axis or 6th-12th lords in confinement houses indicates vulnerability to state penalties, litigation, or imprisonment if engaged in unlawful activity.";
      dim4BasisKn = "2ನೇ, 12ನೇ, 6ನೇ ಭಾವಗಳಲ್ಲಿ ಶನಿ-ರಾಹುಗಳ ಬಂಧನ ಯೋಗ.";
      dim4BasisEn = "B.V. Raman Bandhana Yoga across 2nd/12th and 6th houses.";
    } else {
      dim4Score = 4;
      dim4Risk = false;
      dim4TitleKn = "ಸಾಮಾನ್ಯ ದಾಖಲೆ ಜಾಗ್ರತೆ (Standard Contractual Prudence)";
      dim4TitleEn = "Standard Contractual Prudence";
      dim4BadgeKn = "ದಾಖಲೆ ಎಚ್ಚರಿಕೆ";
      dim4BadgeEn = "Legal Caution";
      dim4AnalysisKn = "ಕಾನೂನು ಅಥವಾ ಸರ್ಕಾರದ ವಿಷಯಗಳಲ್ಲಿ ಯಾವುದೇ ಕ್ರಿಮಿನಲ್ ಅಥವಾ ಬಂಧನ ದೋಷಗಳಿಲ್ಲ; ಕೇವಲ ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ ಮಾಡುವಾಗ ಸರಿಯಾಗಿ ಪರಿಶೀಲಿಸಿದರೆ ಸಾಕು.";
      dim4AnalysisEn = "Free from criminal or imprisonment afflictions; standard scrutiny in paperwork is sufficient.";
      dim4BasisKn = "6ನೇ ಮನೆಯ ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ.";
      dim4BasisEn = "Ordinary 6th house status.";
    }
  }

  // -------------------------------------------------------------
  // 6. DIMENSION 5: MORAL COMPASS & SATSANGA VS DOWNWARD SPIRAL (ಸತ್ಸಂಗ & ಸನ್ಮಾರ್ಗ vs ಕುಸಂಗ & ದುರ್ಮಾರ್ಗ)
  // -------------------------------------------------------------
  let dim5Score = 0;
  let dim5Risk = false;
  let dim5TitleKn = "";
  let dim5TitleEn = "";
  let dim5BadgeKn = "";
  let dim5BadgeEn = "";
  let dim5AnalysisKn = "";
  let dim5AnalysisEn = "";
  let dim5BasisKn = "";
  let dim5BasisEn = "";

  const is9thHouseAfflicted = Boolean(rahu && rahu.house === 9 && !jupiterAspects9th);
  const isMoonRahuDusthana = Boolean(moon && rahu && Math.abs(moon.house - rahu.house) === 0 && [6, 8].includes(moon.house));

  if (isChild) {
    dim5Score = 0;
    dim5Risk = false;
    dim5TitleKn = "ಸಂಸ್ಕಾರವಂತ ಮುಗ್ಧ ಬಾಲ ನಡತೆ";
    dim5TitleEn = "Noble Child Upbringing";
    dim5BadgeKn = "ಉತ್ತಮ ಸಂಸ್ಕಾರ";
    dim5BadgeEn = "Pure Upbringing";
    dim5AnalysisKn = "ಮಗುವು ಉತ್ತಮ ಸಂಸ್ಕಾರ ಮತ್ತು ಒಳ್ಳೆಯ ಹವ್ಯಾಸಗಳೊಂದಿಗೆ ಬೆಳೆಯುವ ಶುಭ ಯೋಗವಿದೆ.";
    dim5AnalysisEn = "Child is blessed with noble values and tender innocence.";
    dim5BasisKn = "ಬಾಲ್ಯ ಸೌಭಾಗ್ಯ.";
    dim5BasisEn = "Child fortune.";
  } else if (isJupiterProtected || (ninthLordPlanet && [1, 4, 5, 9, 10].includes(ninthLordPlanet.house))) {
    dim5Score = 0;
    dim5Risk = false;
    dim5TitleKn = "ಸತ್ಸಂಗ ಸಂಸ್ಕಾರ & ಸನ್ಮಾರ್ಗ ಪ್ರವೃತ್ತಿ (Righteous Path & Noble Association)";
    dim5TitleEn = "Noble Association & Righteous Path (Zero Downward Drift)";
    dim5BadgeKn = "ಸನ್ಮಾರ್ಗ • ಸತ್ಸಂಗ";
    dim5BadgeEn = "Satsanga • Pure Path";
    dim5AnalysisKn = "9ನೇ ಭಾಗ್ಯ ಸ್ಥಾನ ಮತ್ತು ಕುಲದೇವರ ಅನುಗ್ರಹದಿಂದಾಗಿ ನಿಮ್ಮಲ್ಲಿ ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಸಾಗುವ ದೃಢ ಮನಸ್ಸಿದೆ. ಕೆಟ್ಟ ಸ್ನೇಹಿತರ ಸಹವಾಸಕ್ಕೆ (ಕುಸಂಗ), ದುರಾಭ್ಯಾಸಗಳಿಗೆ ಅಥವಾ ದುರ್ಮಾರ್ಗಕ್ಕೆ ಬಲಿಯಾಗದೆ, ಕುಟುಂಬದ ಕೀರ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುವ ಹಾಗೂ ಹಿರಿಯರಿಗೆ ಗೌರವ ತರುವ ಸನ್ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಯುವ ಸಂಸ್ಕಾರ ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ.";
    dim5AnalysisEn = "Grounded in dharma and ancestral blessings, you walk an upright life path. Immune to toxic peer pressure or downward spirals, you uphold family honor and wholesome company.";
    dim5BasisKn = "9ನೇ ಭಾಗ್ಯ ಸ್ಥಾನ ಹಾಗೂ ಗುರುವಿನ ಸಾತ್ವಿಕ ಮಾರ್ಗದರ್ಶನ.";
    dim5BasisEn = "9th house of fortune and Jupiter's guidance ensuring noble association.";
  } else {
    // Afflicted
    if (is9thHouseAfflicted || isMoonRahuDusthana) {
      dim5Score = 14;
      dim5Risk = true;
      dim5TitleKn = "ಕುಸಂಗ, ದುರ್ಮಾರ್ಗ & ಹಾದಿ ತಪ್ಪಿಸುವ ಸ್ನೇಹಿತರ ಎಚ್ಚರಿಕೆ (Bad Company & Downward Spiral Warning)";
      dim5TitleEn = "Bad Company & Misdirection Warning";
      dim5BadgeKn = "ಕುಸಂಗ ಎಚ್ಚರಿಕೆ • ದುರ್ಮಾರ್ಗ";
      dim5BadgeEn = "Negative Peer Vulnerability";
      dim5AnalysisKn = "9ನೇ ಧರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹುವಿನ ಸಂಚಾರ ಅಥವಾ 6/8ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರ-ರಾಹು ಸಂಯೋಗದಿಂದಾಗಿ, ಹಾದಿ ತಪ್ಪಿಸುವ ನಕಲಿ ಸ್ನೇಹಿತರು, ದುರಾಭ್ಯಾಸಗಳುಳ್ಳ ವ್ಯಕ್ತಿಗಳ ಸಹವಾಸ ಅಥವಾ ಆಮಿಷಗಳ ಜಾಲಕ್ಕೆ ಸಿಲುಕಿ ಜೀವನದ ಗುರಿ ತಪ್ಪುವ ಗಂಭೀರ ಅಪಾಯವಿದೆ. ತಕ್ಷಣವೇ ಸತ್ಸಂಗವನ್ನು ಆಶ್ರಯಿಸುವುದು ಅಗತ್ಯ.";
      dim5AnalysisEn = "9th house affliction by Rahu and Moon-Rahu tension creates vulnerability to toxic associates, shady mentors, or peer-led downward spirals.";
      dim5BasisKn = "9ನೇ ಧರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹುವಿನ ನೆರಳು.";
      dim5BasisEn = "Rahu affliction in 9th house of dharma.";
    } else {
      dim5Score = 3;
      dim5Risk = false;
      dim5TitleKn = "ಸಾಮಾನ್ಯ ಸ್ನೇಹ ಜಾಗ್ರತೆ (General Peer Discretion)";
      dim5TitleEn = "General Peer Discretion";
      dim5BadgeKn = "ಸ್ನೇಹ ವಿವೇಚನೆ";
      dim5BadgeEn = "Peer Discretion";
      dim5AnalysisKn = "ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ದುರ್ಮಾರ್ಗದ ದೋಷಗಳಿಲ್ಲ; ಕೇವಲ ಹೊಸ ಪರಿಚಯಸ್ಥರೊಂದಿಗೆ ಗಡಿಗಳನ್ನು ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಕ್ಷೇಮ.";
      dim5AnalysisEn = "Free from downward paths; standard discretion in friendships is sufficient.";
      dim5BasisKn = "9ನೇ ಮನೆಯ ಸಮತೋಲನ.";
      dim5BasisEn = "Balanced 9th house.";
    }
  }

  // -------------------------------------------------------------
  // 7. SEVERITY ASSIGNMENT & OVERALL SCORE CALCULATION
  // -------------------------------------------------------------
  const getSeverity = (s: number): "none" | "mild" | "moderate" | "severe" => {
    if (s <= 3) return "none";
    if (s <= 8) return "mild";
    if (s <= 14) return "moderate";
    return "severe";
  };

  const sensualMarital: NegativeShadeDimension = {
    id: 1,
    score: dim1Score,
    hasRisk: dim1Risk,
    severity: getSeverity(dim1Score),
    titleKn: dim1TitleKn,
    titleEn: dim1TitleEn,
    badgeKn: dim1BadgeKn,
    badgeEn: dim1BadgeEn,
    analysisKn: dim1AnalysisKn,
    analysisEn: dim1AnalysisEn,
    astrologicalBasisKn: dim1BasisKn,
    astrologicalBasisEn: dim1BasisEn
  };

  const financialIntegrity: NegativeShadeDimension = {
    id: 2,
    score: dim2Score,
    hasRisk: dim2Risk,
    severity: getSeverity(dim2Score),
    titleKn: dim2TitleKn,
    titleEn: dim2TitleEn,
    badgeKn: dim2BadgeKn,
    badgeEn: dim2BadgeEn,
    analysisKn: dim2AnalysisKn,
    analysisEn: dim2AnalysisEn,
    astrologicalBasisKn: dim2BasisKn,
    astrologicalBasisEn: dim2BasisEn
  };

  const violenceAggression: NegativeShadeDimension = {
    id: 3,
    score: dim3Score,
    hasRisk: dim3Risk,
    severity: getSeverity(dim3Score),
    titleKn: dim3TitleKn,
    titleEn: dim3TitleEn,
    badgeKn: dim3BadgeKn,
    badgeEn: dim3BadgeEn,
    analysisKn: dim3AnalysisKn,
    analysisEn: dim3AnalysisEn,
    astrologicalBasisKn: dim3BasisKn,
    astrologicalBasisEn: dim3BasisEn
  };

  const legalBandhana: NegativeShadeDimension = {
    id: 4,
    score: dim4Score,
    hasRisk: dim4Risk,
    severity: getSeverity(dim4Score),
    titleKn: dim4TitleKn,
    titleEn: dim4TitleEn,
    badgeKn: dim4BadgeKn,
    badgeEn: dim4BadgeEn,
    analysisKn: dim4AnalysisKn,
    analysisEn: dim4AnalysisEn,
    astrologicalBasisKn: dim4BasisKn,
    astrologicalBasisEn: dim4BasisEn
  };

  const conductDownwardPath: NegativeShadeDimension = {
    id: 5,
    score: dim5Score,
    hasRisk: dim5Risk,
    severity: getSeverity(dim5Score),
    titleKn: dim5TitleKn,
    titleEn: dim5TitleEn,
    badgeKn: dim5BadgeKn,
    badgeEn: dim5BadgeEn,
    analysisKn: dim5AnalysisKn,
    analysisEn: dim5AnalysisEn,
    astrologicalBasisKn: dim5BasisKn,
    astrologicalBasisEn: dim5BasisEn
  };

  let overallScore = 0;
  if (isChild) {
    overallScore = 0;
  } else {
    const rawTotal = dim1Score + dim2Score + dim3Score + dim4Score + dim5Score;
    if (isJupiterProtected || hasBeneficKendraShield) {
      // Benefic cap ensuring clean charts never falsely accused!
      overallScore = Math.min(15, Math.round(rawTotal * 0.2));
    } else {
      overallScore = Math.min(100, rawTotal);
    }
  }

  let category: NegativeShadeAssessment["category"] = "purity";
  let categoryTitleKn = "";
  let categoryTitleEn = "";
  let categoryDescriptionKn = "";
  let categoryDescriptionEn = "";

  if (overallScore <= 15) {
    category = "purity";
    categoryTitleKn = "ಪರಿಶುದ್ಧ ಸತ್ಚಾರಿತ್ರ್ಯ & ಅಪರಾಧ-ಕಳಂಕ ಮುಕ್ತ ಶ್ರೀರಕ್ಷೆ";
    categoryTitleEn = "Impeccable Moral Integrity & Certified Defect-Free";
    categoryDescriptionKn = isChild
      ? "ಮಗುವಿನ ಜಾತಕವು ದೈವಿಕ ಮುಗ್ಧತೆಯಿಂದ ಕೂಡಿದ್ದು, ಯಾವುದೇ ವಯಸ್ಕರ ಅಪರಾಧ, ಚೋರ, ಹಿಂಸಾ ಅಥವಾ ನೈತಿಕ ದೋಷಗಳಿಲ್ಲ."
      : "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ಅಪರಾಧ, ಕಳ್ಳತನ (ಚೋರ ಯೋಗ), ವಂಚನೆ, ಹಲ್ಲೆ/ಕ್ರೌರ್ಯ, ಅತ್ಯಾಚಾರ ಅಥವಾ ದಾಂಪತ್ಯೇತರ ನೆರಳುಗಳಿಲ್ಲ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಸಾತ್ವಿಕ ದೃಷ್ಟಿ ಹಾಗೂ ಕೇಂದ್ರ ಶುಭಗ್ರಹಗಳ ರಕ್ಷಣೆಯಿಂದ ಪರಿಶುದ್ಧ ನಡತೆ, ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಸದಾಚಾರವುಳ್ಳ ಧೀಮಂತ ವ್ಯಕ್ತಿತ್ವ.";
    categoryDescriptionEn = isChild
      ? "Child chart endowed with divine innocence and tender purity. Absolutely free from adult criminal, theft, violent, or moral blemishes."
      : "Certified 100% free from criminal, theft, violent, predatory, or extramarital propensities. Protected by Jupiterian drishti and benefic auspices ensuring spotless integrity.";
  } else if (overallScore <= 35) {
    category = "mild_flaws";
    categoryTitleKn = "ಸೌಮ್ಯ ಮಾನವೀಯ ಕೊರತೆಗಳು & ಒತ್ತಡದ ಎಚ್ಚರಿಕೆ";
    categoryTitleEn = "Mild Human Flaws & Situational Stress";
    categoryDescriptionKn = "ಯಾವುದೇ ಕ್ರಿಮಿನಲ್ ಅಥವಾ ವಿನಾಶಕಾರಿ ಅಪರಾಧ ದೋಷಗಳಿಲ್ಲ. ಕೇವಲ ಕೆಲಸದ ಆಯಾಸ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡದ ಸಮಯದಲ್ಲಿ ಉಂಟಾಗುವ ಸೌಮ್ಯ ಸಿಟ್ಟು, ಹಠ ಅಥವಾ ಸಂವಹನ ಕೊರತೆ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ.";
    categoryDescriptionEn = "Free from serious criminal or legal afflictions; minor behavioral vulnerabilities manifest purely under acute fatigue or stress.";
  } else if (overallScore <= 60) {
    category = "moderate_caution";
    categoryTitleKn = "ಮಧ್ಯಮ ನೆರಳು / ದುಸ್ಸಂಗ & ಒತ್ತಡದ ಎಚ್ಚರಿಕೆ";
    categoryTitleEn = "Moderate Shadow Tendencies & Peer Influence Warning";
    categoryDescriptionKn = "ಕೆಟ್ಟ ಸ್ನೇಹಿತರ ಸಹವಾಸ, ಆರ್ಥಿಕ ಸಾಲದ ಒತ್ತಡ ಅಥವಾ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳ ಸಂದರ್ಭದಲ್ಲಿ ನೈತಿಕ ಮೌಲ್ಯಗಳನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಲು ಎಚ್ಚರಿಕೆ ಅಗತ್ಯವಿರುವ ಹಂತ.";
    categoryDescriptionEn = "Planetary tension indicates vulnerability to external peer pressure, bad company, or financial stress requiring conscious boundaries.";
  } else if (overallScore <= 80) {
    category = "severe_conflict";
    categoryTitleKn = "ತೀವ್ರ ನೈತಿಕ & ಕಾನೂನು ಸಂಘರ್ಷದ ಎಚ್ಚರಿಕೆ";
    categoryTitleEn = "Significant Moral & Legal Conflict Vulnerability";
    categoryDescriptionKn = "ಶಾಸ್ತ್ರೋಕ್ತ ಗ್ರಹ ಯೋಗಗಳು ನಂಬಿಕೆದ್ರೋಹ, ಚೋರ ಯೋಗ, ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ ಅಥವಾ ಕಾನೂನು ಸಂಘರ್ಷಗಳ ಅಪಾಯವನ್ನು ಎಚ್ಚರಿಸುತ್ತಿವೆ; ತಕ್ಷಣವೇ ಸದಾಚಾರ ಮತ್ತು ಪ್ರಾಯಶ್ಚಿತ್ತ ಅಗತ್ಯ.";
    categoryDescriptionEn = "Pronounced planetary afflictions indicate vulnerability to deception, breach of trust, or legal disputes during afflicted transit periods.";
  } else {
    category = "critical_danger";
    categoryTitleKn = "ಅಪರಾಧ & ವಿನಾಶಕಾರಿ ನೆರಳು (ಅತ್ಯುಗ್ರ ಎಚ್ಚರಿಕೆ)";
    categoryTitleEn = "Severe Malefic Affliction & Criminal Vulnerability";
    categoryDescriptionKn = "ಅಸುರ ಯೋಗ, ಅಂಗಾರಕ ದೋಷ ಹಾಗೂ ಬಂಧನ ಯೋಗಗಳ ತೀವ್ರ ಪ್ರಭಾವವಿದ್ದು, ಹಿಂಸೆ, ಚೋರ ಅಥವಾ ಕಾನೂನು ಶಿಕ್ಷೆಯ ತೀವ್ರ ಅಪಾಯವಿದೆ; ತುರ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಶಾಂತಿ ಸೇವೆ ಅತ್ಯಗತ್ಯ.";
    categoryDescriptionEn = "Severe unmitigated malefic yogas (Asura, Angaraka, Bandhana) indicating dangerous aggressive or criminal vulnerability requiring urgent remedial intervention.";
  }

  // -------------------------------------------------------------
  // 8. RUNNING DASHA & GOCHARA DYNAMIC TRIGGERS
  // -------------------------------------------------------------
  const dashaMaha = dashaTiming?.currentMaha || PlanetName.Jupiter;
  const dashaBhukti = dashaTiming?.currentBhukti || PlanetName.Moon;
  const isMaleficDasha = [PlanetName.Rahu, PlanetName.Saturn, PlanetName.Mars, sixthLord, eighthLord, twelfthLord].includes(dashaMaha);

  let activeDashaTriggerKn = "";
  let activeDashaTriggerEn = "";

  if (overallScore <= 15) {
    activeDashaTriggerKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(dashaMaha)} ಮಹಾದಶೆಯ ${toKannadaPlanet(dashaBhukti)} ಭುಕ್ತಿಯು ನಿಮ್ಮ ವಿವೇಕ, ಸತ್ಯದ ನಡೆ ಹಾಗೂ ಸದಾಚಾರವನ್ನು ಜಾಗೃತವಾಗಿರಿಸಿದ್ದು, ಯಾವುದೇ ನಕಾರಾತ್ಮಕ ನೆರಳುಗಳು ತಲೆದೋರದಂತೆ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಒದಗಿಸಿದೆ.`;
    activeDashaTriggerEn = `The ongoing ${dashaMaha} Mahadasha with ${dashaBhukti} Antardasha reinforces your moral compass and provides an auric shield preventing negative impulses.`;
  } else if (isMaleficDasha) {
    activeDashaTriggerKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(dashaMaha)} ಮಹಾದಶೆಯ ${toKannadaPlanet(dashaBhukti)} ಭುಕ್ತಿಯ ಕಾಲಾವಧಿಯು ನೈತಿಕ ಮತ್ತು ಇಂದ್ರಿಯ ಶಿಸ್ತನ್ನು ಪರೀಕ್ಷಿಸುವ ಸೂಕ್ಷ್ಮ ಸಂಧಿಕಾಲವಾಗಿದೆ. ಆವೇಶದ ನಿರ್ಧಾರಗಳು ಅಥವಾ ಕುಸಂಗಕ್ಕೆ ಬಲಿಯಾಗದಂತೆ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.`;
    activeDashaTriggerEn = `The ongoing ${dashaMaha} Mahadasha and ${dashaBhukti} Antardasha represents a karmic testing phase requiring conscious self-restraint and vigilance against bad influences.`;
  } else {
    activeDashaTriggerKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಶುಭ ಗ್ರಹ ದಶೆಯು ನಿಮ್ಮಲ್ಲಿ ಸಂಯಮ ಮತ್ತು ಸತ್ಚಿಂತನೆಯನ್ನು ಕಾಪಾಡುತ್ತಿದ್ದು, ನೆರಳು ದೋಷಗಳು ಶಮನಗೊಳ್ಳಲು ಸಹಕಾರಿಯಾಗಿದೆ.`;
    activeDashaTriggerEn = `The ongoing benefic Dasha stabilizes inner temperament and prevents shadow vulnerabilities from taking root.`;
  }

  const activeGocharaTriggerKn = liveGochara
    ? `ಗೋಚಾರದಲ್ಲಿ ಶನಿಯ ${liveGochara.shaniStatusKn} ಹಾಗೂ ಗುರುವಿನ ${liveGochara.guruStatusKn} ಪ್ರಭಾವವು ನಿಮ್ಮ ಕರ್ಮ ಸಂಸ್ಕಾರಗಳನ್ನು ಶುದ್ಧೀಕರಿಸುವ ಕಾಲಾವಧಿಯಾಗಿದೆ.`
    : `ಗೋಚಾರದ ಗ್ರಹ ಸ್ಥಿತಿಯು ಸದಾಚಾರದ ರಕ್ಷಣೆಗೆ ಪೂರಕವಾಗಿದೆ.`;
  const activeGocharaTriggerEn = liveGochara
    ? `Live Gochara transits of Saturn (${liveGochara.shaniStatusEn}) and Jupiter (${liveGochara.guruStatusEn}) demand inner discipline.`
    : `Current planetary transits support personal boundaries.`;

  // -------------------------------------------------------------
  // 9. PANCHANGA INFLUENCE & REMEDY
  // -------------------------------------------------------------
  const moonPlanet = kundli.planets.find(p => p.name === PlanetName.Moon);
  const moonNakKn = toKannadaNakshatra(moonPlanet?.nakshatra.english);
  const nakNameKn = tradPanchanga?.moonNakshatraKn || moonNakKn || "ಅಶ್ವಿನಿ";
  const nakNameEn = tradPanchanga?.moonNakshatra || moonPlanet?.nakshatra.english || "Ashwini";
  const yogaNameKn = tradPanchanga?.yogaKn || tradPanchanga?.yoga || "ಸಿದ್ಧ";
  const yogaNameEn = tradPanchanga?.yoga || "Siddha";
  const karanaNameKn = tradPanchanga?.karanaKn || tradPanchanga?.karana || "ಬವ";
  const karanaNameEn = tradPanchanga?.karana || "Bava";

  const panchangaInfluenceKn = `ನಿಮ್ಮ ಜನ್ಮ ಪಂಚಾಂಗದ ನಕ್ಷತ್ರ ${nakNameKn}, ಯೋಗ ${yogaNameKn} ಹಾಗೂ ಕರಣ ${karanaNameKn}ಗಳ ಸಂಯೋಗವು ಆಂತರಿಕ ಶಕ್ತಿಯನ್ನು ಧರ್ಮದ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಸುವ ದೈವಿಕ ಸಂಸ್ಕಾರವನ್ನು ನೀಡಿದೆ.`;
  const panchangaInfluenceEn = `Birth Panchanga elements (Nakshatra: ${nakNameEn}, Yoga: ${yogaNameEn}, Karana: ${karanaNameEn}) influence your foundational karmic imprint.`;

  const protectionRemedyKn = overallScore <= 15
    ? "ಈ ಸಾತ್ವಿಕ ಸದಾಚಾರ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆ ಸದಾ ಮುಂದುವರಿಯಲು ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಹಾಗೂ ನವಗ್ರಹ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸುವುದು ಶ್ರೇಯಸ್ಕರ."
    : "ಅಂತರಂಗದ ನೆರಳು ದೋಷಗಳ ಶಮನಕ್ಕಾಗಿ ಹಾಗೂ ಆಪತ್ತುಗಳಿಂದ ಮುಕ್ತಿ ಪಡೆಯಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ, ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಗಣಪತಿ ಪೂಜೆ ಹಾಗೂ ರಾಹು-ಶನಿ ಶಾಂತಿ ಹವನ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.";
  const protectionRemedyEn = overallScore <= 15
    ? "To sustain this pure aura and divine shield, sponsor gratitude Sankalpa Pooja and Atma Linga Sparsha at holy Sri Kshetra Gokarna Mahabaleshwara."
    : "To dissolve shadow karma and negative planetary influences, perform authentic Prayashchitta Sankalpa Pooja, Atma Linga Sparsha, and Navagraha Shanti Homa at Gokarna Kshetra.";

  return {
    overallScore,
    category,
    categoryTitleKn,
    categoryTitleEn,
    categoryDescriptionKn,
    categoryDescriptionEn,
    isChildShielded: isChild,
    isJupiterProtected,
    hasBeneficKendraShield,
    sensualMarital,
    financialIntegrity,
    violenceAggression,
    legalBandhana,
    conductDownwardPath,
    activeDashaTriggerKn,
    activeDashaTriggerEn,
    activeGocharaTriggerKn,
    activeGocharaTriggerEn,
    panchangaInfluenceKn,
    panchangaInfluenceEn,
    protectionRemedyKn,
    protectionRemedyEn
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

  // 11. Secret Life, Inner Character, Dietary Sanctity & Moral Rectitude (100% Dynamic, Age & Gender Aware)
  const isChild = age < 14;
  const isMale = (context.gender || "Male").toLowerCase() === "male";
  const spouseKn = isMale ? "ಪತ್ನಿ/ಕುಟುಂಬ" : "ಪತಿ/ಕುಟುಂಬ";
  const spouseEn = isMale ? "spouse/family" : "spouse/family";

  const dietAssessment = detectNativeDietAndAddiction(kundli);
  const sensualAssessment = detectNativeSensualAndFidelity(kundli);

  const isOpenLagna = [0, 2, 4, 8].includes(lagnaIdx);
  const isSecretLagna = [3, 7, 11].includes(lagnaIdx) || (rahu && [8, 12].includes(rahu.house)) || (saturn && [8, 12].includes(saturn.house));
  const hasDarkThoughtLoops = (moon && [6, 8, 12].includes(moon.house)) || (moon && rahu && Math.abs(moon.house - rahu.house) === 0) || (moon && saturn && Math.abs(moon.house - saturn.house) === 0);

  const secrecyHabitTextKn = isOpenLagna && !isSecretLagna
    ? `ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ — ಯಾವುದೇ ತಪ್ಪು ಹೆಜ್ಜೆ, ರಹಸ್ಯಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಮುಚ್ಚಿಡಲಾರದೆ, ${spouseKn} ಅಥವಾ ಆಪ್ತ ಸ್ನೇಹಿತರ ಬಳಿ ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳುವ ನೇರ ಸ್ವಭಾವ.`
    : isSecretLagna
    ? `ಆಳವಾದ ಸಂಯಮ — ವೈಯಕ್ತಿಕ ನೋವು, ಸಂಕಟ ಅಥವಾ ಅಂತರಂಗದ ಭಾವನೆಗಳನ್ನು ಅನಗತ್ಯವಾಗಿ ಸಾರ್ವಜನಿಕವಾಗಿ ಹಂಚಿಕೊಳ್ಳದೆ, ಕುಟುಂಬದ ನೆಮ್ಮದಿಯ ಹಿತದೃಷ್ಟಿಯಿಂದ ಅಂತರಂಗದಲ್ಲೇ ನಿಭಾಯಿಸುವ ಗೌಪ್ಯತೆ.`
    : `ಪ್ರಾಯೋಗಿಕ ಗಾಂಭೀರ್ಯ — ಸಮಾಜದಲ್ಲಿ ಸಭ್ಯ ಮತ್ತು ಶಾಂತ ಶಿಸ್ತು ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತಾ, ಆಪ್ತರೊಂದಿಗೆ ಮಾತ್ರ ಅವಶ್ಯಕ ವಿಚಾರಗಳನ್ನು ಗೌಪ್ಯವಾಗಿಡುವ ಸಮತೋಲನ.`;

  const secrecyHabitTextEn = isOpenLagna && !isSecretLagna
    ? `Open & Candid — Expresses thoughts transparently without keeping covert secrets from ${spouseEn} or close peers.`
    : isSecretLagna
    ? `Deep Emotional Reserve — Holds private feelings, vulnerabilities, and pain with dignified introspection away from public drama.`
    : `Pragmatic Boundary — Balances social discretion and family boundaries with quiet composure.`;

  let p11ReadingKn = "";
  let p11ReadingEn = "";
  let card11TitleKn = "";
  let card11TitleEn = "";
  let card11BadgeKn = "";
  let card11BadgeEn = "";
  let card11Icon = "💎";
  let card11BasisKn = "";
  let card11BasisEn = "";
  let card11Dosha: MasterLifeBulletPoint["doshaSpecifics"];

  if (isChild) {
    card11TitleKn = "ಮಗುವಿನ ಅಂತರಂಗದ ಮುಗ್ಧತೆ, ನಿದ್ರಾ ಸುಖ & ದೈವಿಕ ರಕ್ಷಾ ಕವಚ";
    card11TitleEn = "Child's Inner Innocence, Restful Sleep & Divine Protective Shield";
    card11BadgeKn = "12ನೇ ಶಯನ ಸುಖ • ದೈವಿಕ ರಕ್ಷೆ";
    card11BadgeEn = "12th Restful Sleep • Divine Shield";
    card11Icon = "🛡️";
    p11ReadingKn = `ಮಗುವಿನ ಜಾತಕದ 12ನೇ (ನಿದ್ರಾ ಸುಖ) ಹಾಗೂ 8ನೇ ರಕ್ಷಾ ಸ್ಥಾನಗಳ ಸೂಕ್ಷ್ಮ ಗ್ರಹಸ್ಥಿತಿಯ ಪ್ರಕಾರ: ಮಗುವಿನ ಅಂತರಂಗವು ಅತ್ಯಂತ ಮುಗ್ಧ, ಪವಿತ್ರ ಹಾಗೂ ಕಪಟವಿಲ್ಲದ ಪ್ರಕೃತಿಯನ್ನು ಹೊಂದಿದೆ. ಯಾವುದೇ ದುಷ್ಟ ಶಕ್ತಿಗಳು ಅಥವಾ ಬಾಲಾರಿಷ್ಟ ಬಾಧೆಗಳಿಲ್ಲದೆ, ದೈವಿಕ ರಕ್ಷಾ ಕವಚವು ಮಗುವಿನ ನಿದ್ರೆ ಹಾಗೂ ಆರೋಗ್ಯವನ್ನು ಸದಾ ಕಾಪಾಡುತ್ತದೆ. ಪೋಷಕರ ವಾತ್ಸಲ್ಯದ ಮಡಿಲಲ್ಲಿ ಮಗು ಸುಖಕರವಾಗಿ ಬೆಳೆಯುವ ಸುಯೋಗವಿದೆ.`;
    p11ReadingEn = `Planetary scrutiny of the 12th (restful sleep) and 8th (protection) houses reveals an innocent, pure auric core. Free from balarishta affliction, a divine protective shield guards the child's sleep and vitality under tender parental care.`;
    card11BasisKn = "12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನ ಹಾಗೂ ಪೂರ್ವಪುಣ್ಯದ ಶುಭ ರಕ್ಷಾ ಕವಚ.";
    card11BasisEn = "12th house of restful sleep and auspicious protective grace.";
    card11Dosha = {
      hasDosha: false,
      doshaNameKn: "ದೈವಿಕ ರಕ್ಷಾ ಕವಚ & ಬಾಲ ಶಾಂತಿ",
      doshaNameEn: "Divine Protective Shield & Child Serenity",
      rootCauseHouseKn: "12ನೇ ಶಯನ ಸುಖ & 4ನೇ ಮಾತೃ ರಕ್ಷೆ",
      rootCauseHouseEn: "12th Restful Sleep & 4th Nurturing",
      afflictedPlanetKn: "ಶುಭ ಗ್ರಹ ಆಶೀರ್ವಾದ",
      afflictedPlanetEn: "Benefic Planetary Auspices",
      mantraKn: "ದಿನನಿತ್ಯ ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ & ಗಾಯತ್ರಿ ಮಂತ್ರ",
      mantraEn: "Daily Maha Mrityunjaya Japa & Gayatri Mantra",
      pujaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ರಕ್ಷಾ ಸಂಕಲ್ಪ ಪೂಜೆ",
      pujaEn: "Balagraha Raksha Sankalpa Pooja at Sri Kshetra Gokarna"
    };
  } else {
    // Adult
    const isCleanCharacter = dietAssessment.isTeetotaler && sensualAssessment.hasMaritalFidelity;
    card11TitleKn = isCleanCharacter
      ? "ಅಂತರಂಗದ ನೈಜ ಸ್ವಭಾವ, ಆಹಾರ ಸಂಸ್ಕಾರ & ನೈತಿಕ ಚಾರಿತ್ರ್ಯ"
      : "ಅಂತರಂಗದ ನೈಜ ಸ್ವಭಾವ, ಆಹಾರ ಸಂಸ್ಕಾರ & ಆಂತರಿಕ ಸಂಯಮ";
    card11TitleEn = isCleanCharacter
      ? "Inner Character, Dietary Sanctity & Moral Rectitude"
      : "Inner Character, Dietary Discipline & Restraint";
    card11BadgeKn = isCleanCharacter
      ? "ಸಾತ್ವಿಕ ಆಹಾರಿ • ದಾಂಪತ್ಯ ನಿಷ್ಠೆ"
      : "8ನೇ & 12ನೇ ಭಾವ • ಅಂತರಂಗ ಸಂಸ್ಕಾರ";
    card11BadgeEn = isCleanCharacter
      ? "Sattvik Lifestyle • Marital Fidelity"
      : "8th & 12th Houses • Inner Discipline";
    card11Icon = isCleanCharacter ? "💎" : "🔒";

    p11ReadingKn = `ನಿಮ್ಮ ಜಾತಕದ 8ನೇ (ಅಂತರಂಗ), 12ನೇ (ಶಯನ/ಆಹಾರ ಶಿಸ್ತು) ಹಾಗೂ 7ನೇ ಕಾಮ ಸ್ಥಾನಗಳ ಸೂಕ್ಷ್ಮ ಗ್ರಹಸ್ಥಿತಿಯನ್ನು ನೋಡಿದಾಗ: ${
      dietAssessment.isTeetotaler
        ? "• ಆಹಾರ & ಶರೀರ ಪಾವಿತ್ರ್ಯ: ನಿಮ್ಮ 2ನೇ ಮುಖ/ಆಹಾರ ಸ್ಥಾನವು ಗುರು ದೃಷ್ಟಿಯಲ್ಲಿದ್ದು, ನೀವು ಸಾತ್ವಿಕ ಆಹಾರಿ (Teetotaler) ಹಾಗೂ ಮದ್ಯಪಾನ, ಧೂಮಪಾನ ಅಥವಾ ಯಾವುದೇ ಮಾದಕ ವಸ್ತುಗಳ ವ್ಯಸನದಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತರಾಗಿದ್ದೀರಿ. ಶರೀರ ಪಾವಿತ್ರ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಉನ್ನತ ಆತ್ಮಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ. "
        : "• ಆಹಾರ & ಶರೀರ ಎಚ್ಚರಿಕೆ: 2ನೇ ಮುಖ ಸ್ಥಾನದ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಮಾನಸಿಕ ಒತ್ತಡದ ಸಮಯದಲ್ಲಿ ತಂಪು ಪಾನೀಯ ಅಥವಾ ವ್ಯಸನಗಳ ಕಡೆಗೆ ಜಾರದಂತೆ ಸಂಯಮ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಅಗತ್ಯ. "
    }${
      sensualAssessment.hasMaritalFidelity
        ? "• ದಾಂಪತ್ಯ ನಿಷ್ಠೆ & ಸತ್ಚಾರಿತ್ರ್ಯ: 7ನೇ ಕಳತ್ರ ಹಾಗೂ ಕಾಮ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಸದಾಚಾರ ನಿಮ್ಮ ಮೂಲ ಗುಣವಾಗಿದೆ. ಬಾಹ್ಯ ಕ್ಷಣಿಕ ಆಕರ್ಷಣೆಗಳಿಗೆ ಅಥವಾ ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ವ್ಯಾಮೋಹಕ್ಕೆ ಬಲಿಯಾಗದೆ, ಪವಿತ್ರ ಕೌಟುಂಬಿಕ ಧರ್ಮ ಹಾಗೂ ದಾಂಪತ್ಯ ನಿಷ್ಠೆಯನ್ನು ಕಾಪಾಡುವ ಧೀಮಂತ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ. "
        : "• ಭಾವನಾತ್ಮಕ ಎಚ್ಚರಿಕೆ: ಶುಕ್ರ-ರಾಹುಗಳ ಸಂಚಾರದ ಸಮಯದಲ್ಲಿ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳು ಕೌಟುಂಬಿಕ ಶಾಂತಿಯನ್ನು ಕೆಡಿಸದಂತೆ ಆತ್ಮಸಂಯಮ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಕ್ಷೇಮ. "
    }${
      hasDarkThoughtLoops
        ? "• ಮನಸ್ಸಿನ ಚಿಂತನೆ: ಮನಃಕಾರಕ ಚಂದ್ರನ ಮೇಲಿನ ರಾಹು-ಶನಿ ಪ್ರಭಾವದಿಂದ ಅತಿಯಾದ ಯೋಚನೆಗಳು ಸುಳಿಯಬಹುದು; ನಿತ್ಯ ಧ್ಯಾನ ಶಾಂತಿ ತರಲಿದೆ. "
        : ""
    }• ವರ್ತನೆಯ ಸ್ವಭಾವ: ${secrecyHabitTextKn}${
      isCleanCharacter
        ? " ಈ ಸಾತ್ವಿಕ ಸದಾಚಾರವನ್ನು ಇನ್ನಷ್ಟು ಬಲಪಡಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಶ್ರೇಯಸ್ಕರ."
        : " ಈ ನೆರಳು ದೋಷಗಳ ಶಮನಕ್ಕಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯಗತ್ಯ."
    }`;

    p11ReadingEn = `Planetary scrutiny of the 8th (inner self), 12th (sleep & sensory intake), and 7th (marital bonds) reveals: ${
      dietAssessment.isTeetotaler
        ? "• Dietary Sanctity: Auspicious 2nd house alignment confirms you are a teetotaler, naturally free from alcohol, smoking, or intoxicating dependencies with high bodily purity. "
        : "• Dietary Mindfulness: 2nd house malefic aspects advise conscious boundaries against stress-induced intake. "
    }${
      sensualAssessment.hasMaritalFidelity
        ? "• Marital Fidelity: The 7th house and Venus are shielded by benefic graces, upholding high moral rectitude, sensory restraint, and faithful marital devotion without external affairs. "
        : "• Relationship Restraint: Venus-Rahu transits advise conscious fidelity and emotional self-control. "
    }• Behavioral Expression: ${secrecyHabitTextEn}${
      isCleanCharacter
        ? " Offering gratitude prayers at sacred Sri Kshetra Gokarna Mahabaleshwara amplifies this auspicious character."
        : " Remedial Atma Linga Prayashchitta Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara cleanses shadow tendencies."
    }`;

    card11BasisKn = isCleanCharacter
      ? `${dietAssessment.rootCauseKn} ${sensualAssessment.rootCauseKn} ${lagnaKn} ಲಗ್ನದ ನೈಜ ಸತ್ಚಾರಿತ್ರ್ಯ.`
      : "8ನೇ (ಅಂತರಂಗ), 12ನೇ (ಶಯನ/ಆಹಾರ ಶಿಸ್ತು), 7ನೇ ಭಾವ ಹಾಗೂ ಗ್ರಹ ಸಂಚಾರ.";
    card11BasisEn = isCleanCharacter
      ? `${dietAssessment.rootCauseEn} ${sensualAssessment.rootCauseEn} Ascendant intrinsic moral conduct.`
      : "8th (secrets), 12th (intake/sleep), 7th (relationships), and planetary transits.";

    card11Dosha = isCleanCharacter
      ? {
          hasDosha: false,
          doshaNameKn: "ಸದಾಚಾರ & ಸಾತ್ವಿಕ ರಕ್ಷಾ ಕವಚ",
          doshaNameEn: "Moral Integrity & Sattvik Shield",
          rootCauseHouseKn: "ಗುರು ಕೃಪೆ & ಶುಭ ಗ್ರಹ ರಕ್ಷಣೆ",
          rootCauseHouseEn: "Jupiter Grace & Benefic Alignment",
          afflictedPlanetKn: "ಶುಭ ಗ್ರಹ ಬಲ",
          afflictedPlanetEn: "Benefic Planetary Strength",
          mantraKn: "ದಿನನಿತ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ & ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ (108 ಬಾರಿ)",
          mantraEn: "Daily Gayatri Mantra & Maha Mrityunjaya Japa (108 times)",
          pujaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ಪೂಜೆ",
          pujaEn: "Gratitude Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara"
        }
      : {
          hasDosha: true,
          doshaNameKn: "ಅಂತರ್ಗತ ನೆರಳು & ಗ್ರಹ ದೋಷ",
          doshaNameEn: "Shadow Impulses & Planetary Tension",
          rootCauseHouseKn: "2ನೇ/8ನೇ ಭಾವದಲ್ಲಿ ಗ್ರಹ ಪ್ರಭಾವ",
          rootCauseHouseEn: "2nd/8th House Afflictions by Malefics",
          afflictedPlanetKn: "ರಾಹು-ಶನಿ",
          afflictedPlanetEn: "Rahu-Saturn",
          mantraKn: "ಓಂ ನಮಃ ಶಿವಾಯ (ದಿನನಿತ್ಯ 108 ಬಾರಿ) & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ",
          mantraEn: "Om Namah Shivaya (Daily 108 Times) & Maha Mrityunjaya Mantra",
          pujaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ & ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ",
          pujaEn: "Atma Linga Sparsha & Prayashchitta Sankalpa Seva at Gokarna Mahabaleshwara"
        };
  }

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
      titleKn: card11TitleKn,
      titleEn: card11TitleEn,
      titleHi: card11TitleEn,
      titleTe: card11TitleEn,
      titleTa: card11TitleEn,
      badgeKn: card11BadgeKn,
      badgeEn: card11BadgeEn,
      badgeHi: card11BadgeEn,
      badgeTe: card11BadgeEn,
      badgeTa: card11BadgeEn,
      icon: card11Icon,
      readingKn: p11ReadingKn,
      readingEn: p11ReadingEn,
      readingHi: p11ReadingEn,
      readingTe: p11ReadingEn,
      readingTa: p11ReadingEn,
      astrologicalBasisKn: card11BasisKn,
      astrologicalBasisEn: card11BasisEn,
      doshaSpecifics: card11Dosha
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
  const fifthLordPlanet = kundli.planets.find((p) => p.name === fifthLord);

  // Exact Vedic house distance helper (1 to 12)
  const houseDist = (fromH: number, toH: number) => ((toH - fromH + 12) % 12) + 1;

  // Age determination: Child (< 14) vs Adult (>= 14)
  const isChild = devoteeAge < 14;
  const isMale = (context.gender || "Male").toLowerCase() === "male";

  // Dynamic Secrecy Determination:
  // Fire signs [0, 4, 8]: Aries, Leo, Sagittarius -> Open, candid, spontaneous
  // Earth signs [1, 5, 9]: Taurus, Virgo, Capricorn -> Quiet, pragmatic discretion, self-contained
  // Air signs [2, 6, 10]: Gemini, Libra, Aquarius -> Intellectual deflection, communicative masking
  // Water signs [3, 7, 11]: Cancer, Scorpio, Pisces -> Deep emotional vaults, absolute private concealment
  const spouseKn = isMale ? "ಪತ್ನಿ/ಹೆಂಡತಿ" : "ಪತಿ/ಗಂಡ";
  const spouseEn = isMale ? "wife" : "husband";

  let secrecyKn = "";
  let secrecyEn = "";
  let secrecyBadgeKn = "";
  let secrecyBadgeEn = "";
  let secrecyTitleKn = "";
  let secrecyTitleEn = "";
  // Special Parashari rule for Brazen Candor & Unapologetic Disclosure ("ಕುಲ್ಲಂ ಕುಲ್ಲಾ" / Kullam-Kulla):
  // When Rahu is in Lagna (sheds conventional shame/inhibition) with Jupiter in 11th (candid, boastful/jovial openness with friends & circle)
  // or Mars in Gemini (talkative sign) in 8th aspecting 2nd house of speech:
  const isKullamKullaBrazen = Boolean(
    (rahu && rahu.house === 1 && jupiter && jupiter.house === 11) ||
    (rahu && rahu.house === 1 && mars && mars.house === 8)
  );

  if (isKullamKullaBrazen) {
    secrecyTitleKn = "ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ: ನಿರ್ಭಯ ಮುಕ್ತತೆ & ಕುಲ್ಲಂ ಕುಲ್ಲಾ ನೇರ ನುಡಿ";
    secrecyTitleEn = "Secret Life Expression: Brazen Openness & Unfiltered Candor (Kullam-Kulla)";
    secrecyBadgeKn = "ಲಗ್ನ ರಾಹು • 11ನೇ ಗುರು • ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಮುಕ್ತತೆ";
    secrecyBadgeEn = "Lagna Rahu • 11th Jupiter • Brazenly Open";
    secrecyKn = `🗣️ ವರ್ತನೆ: ನಿರ್ಭಯ ಮುಕ್ತತೆ & ಕುಲ್ಲಂ ಕುಲ್ಲಾ ನೇರ ನುಡಿ — ಲಗ್ನದಲ್ಲಿರುವ ರಾಹುವು ಸಮಾಜದ ಮುಜುಗರ-ನಾಚಿಕೆಯನ್ನು ಕಳಚುವುದರಿಂದ ಮತ್ತು 11ನೇ ಮಿತ್ರ ಸ್ಥಾನದಲ್ಲಿರುವ ಗುರುವು ಆಪ್ತ ವಲಯದಲ್ಲಿ ಸಲುಗೆ ತರುವುದರಿಂದ, ತಮ್ಮ ತಪ್ಪುಗಳು, ಕಾಮನೆಗಳು, ದಾಂಪತ್ಯೇತರ ವಿಷಯಗಳು ಅಥವಾ ದುಶ್ಚಟಗಳನ್ನು ಆಪ್ತ ಸ್ನೇಹಿತರ ಬಳಿ ಕಿಂಚಿತ್ತೂ ಮುಚ್ಚಿಡದೆ 'ಕುಲ್ಲಂ ಕುಲ್ಲಾ' ಆಗಿ ಎಲ್ಲರಿಗೂ ನೇರವಾಗಿ ಹೇಳಿಕೊಳ್ಳುವ ಮುಕ್ತ ಸ್ವಭಾವ.`;
    secrecyEn = `Brazen Openness & Unfiltered Candor (Kullam-Kulla): Rahu in Lagna strips away social inhibition and shame, while Jupiter in the 11th house of friends fosters jovial transparency within peer circles. The native speaks brazenly and candidly about their personal adventures, indulgences, and shadow habits without attempting to wear a secretive mask.`;
  } else if ([0, 4, 8].includes(lagnaIdx) && !(rahu && [8, 12].includes(rahu.house)) && !(saturn && [8, 12].includes(saturn.house))) {
    secrecyTitleKn = "ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ: ಮುಕ್ತ ನೇರ ನುಡಿ & ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ";
    secrecyTitleEn = "Secret Life Expression: Direct Candor & Open Confession";
    secrecyBadgeKn = "ಅಗ್ನಿ ತತ್ವ • ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ";
    secrecyBadgeEn = "Fiery Expression • Open & Candid";
    secrecyKn = `🗣️ ವರ್ತನೆ: ಮುಕ್ತ & ನೇರ ನುಡಿಯ ಕುಲ್ಲಂ ಕುಲ್ಲಾ ಪ್ರವೃತ್ತಿ — ಯಾವುದೇ ತಪ್ಪು ಹೆಜ್ಜೆ, ದುಶ್ಚಟ ಅಥವಾ ರಹಸ್ಯಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಹೆಚ್ಚು ಕಾಲ ಅದುಮಿಟ್ಟುಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗದೆ, ${spouseKn} ಅಥವಾ ಆಪ್ತರ ಬಳಿ ಮುಕ್ತವಾಗಿ ಹೇಳಿಕೊಳ್ಳುವ ನೇರ ಸ್ವಭಾವ.`;
    secrecyEn = `Open & Candid Habit: Incapable of holding shadow secrets inside for long; expresses or confesses transparently to ${spouseEn} and trusted allies.`;
  } else if ([1, 5, 9].includes(lagnaIdx) && !(rahu && [8, 12].includes(rahu.house))) {
    secrecyTitleKn = "ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ: ಪ್ರಾಯೋಗಿಕ ಮೌನ & ಶಿಸ್ತುಬದ್ಧ ಗೌಪ್ಯತೆ";
    secrecyTitleEn = "Secret Life Expression: Pragmatic Discretion & Composed Boundary";
    secrecyBadgeKn = "ಪೃಥ್ವಿ ತತ್ವ • ಪ್ರಾಯೋಗಿಕ ಶಿಸ್ತುಬದ್ಧ ಗೌಪ್ಯತೆ";
    secrecyBadgeEn = "Earthy Discretion • Pragmatic Boundary";
    secrecyKn = `🔒 ವರ್ತನೆ: ಪ್ರಾಯೋಗಿಕ ಮೌನ & ಶಿಸ್ತುಬದ್ಧ ಗೌಪ್ಯತೆ — ವೈಯಕ್ತಿಕ ದುರ್ಬಲತೆ, ಆರ್ಥಿಕ ತಾಪತ್ರಯ ಅಥವಾ ತಪ್ಪು ಹೆಜ್ಜೆಗಳನ್ನು ಸಮಾಜದಲ್ಲಿ ಆಡಂಬರವಿಲ್ಲದೆ ನಿಯಂತ್ರಿಸಿ, ${spouseKn} ಹಾಗೂ ಆಪ್ತರಿಗೂ ಅನಗತ್ಯವಾಗಿ ಬಹಿರಂಗಪಡಿಸದೆ ಅಂತರಂಗದಲ್ಲೇ ಇಟ್ಟುಕೊಳ್ಳುವ ಸಂಯಮ.`;
    secrecyEn = `Pragmatic Discretion: Maintains quiet self-control; keeps personal strains, vulnerabilities, and private matters guarded within, avoiding overt drama.`;
  } else if ([2, 6, 10].includes(lagnaIdx) && !(rahu && [8, 12].includes(rahu.house))) {
    secrecyTitleKn = "ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ: ಬೌದ್ಧಿಕ ಚಾಣಾಕ್ಷತೆ & ನಯವಾದ ಮರೆಮಾಚುವಿಕೆ";
    secrecyTitleEn = "Secret Life Expression: Diplomatic Deflection & Intellectual Mask";
    secrecyBadgeKn = "ವಾಯು ತತ್ವ • ಬೌದ್ಧಿಕ ಚಾಣಾಕ್ಷ ಗೌಪ್ಯತೆ";
    secrecyBadgeEn = "Airy Diplomacy • Strategic Masking";
    secrecyKn = `🎭 ವರ್ತನೆ: ಬೌದ್ಧಿಕ ಚತುರತೆ & ನಯವಾದ ಮರೆಮಾಚುವಿಕೆ — ಮಾತಿನಲ್ಲೇ ಇತರರ ಗಮನವನ್ನು ಬೇರೆಡೆ ಸೆಳೆದು, ತಮ್ಮ ರಹಸ್ಯ ಆಸೆಗಳು, ತಪ್ಪು ಹೆಜ್ಜೆಗಳು ಅಥವಾ ದುಶ್ಚಟಗಳನ್ನು ${spouseKn} ಹಾಗೂ ಕುಟುಂಬಕ್ಕೆ ಕಿಂಚಿತ್ತೂ ಸಂಶಯ ಬಾರದಂತೆ ಅತ್ಯಂತ ಜಾಣ್ಮೆಯಿಂದ ನಿಭಾಯಿಸುವ ಚಾಣಾಕ್ಷತೆ.`;
    secrecyEn = `Diplomatic Deflection: Uses communicative charm and wit to keep personal indulgences and shadow habits deftly masked from suspicion.`;
  } else {
    secrecyTitleKn = "ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ: ಸಂಪೂರ್ಣ ಭಾವನಾತ್ಮಕ ಗೌಪ್ಯತೆ & ರಹಸ್ಯ ಮುಖವಾಡ";
    secrecyTitleEn = "Secret Life Expression: Deep Emotional Vault & Strict Mask";
    secrecyBadgeKn = "ಜಲ ತತ್ವ / 8ನೇ-12ನೇ ನೆರಳು • ಸಂಪೂರ್ಣ ಗೌಪ್ಯತೆ";
    secrecyBadgeEn = "Water Sign / 8th-12th Shadow • Deep Concealment";
    secrecyKn = `🌊 ವರ್ತನೆ: ಸಂಪೂರ್ಣ ಭಾವನಾತ್ಮಕ ಗೌಪ್ಯತೆ & ರಹಸ್ಯ ಮುಖವಾಡ — ಸಮಾಜದಲ್ಲಿ ಸಭ್ಯ ಹಾಗೂ ಶಾಂತ ಮುಖವಾಡ ಧರಿಸಿ, ಒಳಗಿನ ಕಾಮನೆಗಳು, ನೋವು ಅಥವಾ ರಹಸ್ಯಗಳನ್ನು ${spouseKn}, ಪೋಷಕರು ಮತ್ತು ಆಪ್ತ ಸ್ನೇಹಿತರಿಗೂ ಕಿಂಚಿತ್ತೂ ತಿಳಿಯದಂತೆ ಅತ್ಯಂತ ಆಳವಾಗಿ ಮುಚ್ಚಿಡುವ ಪ್ರವೃತ್ತಿ.`;
    secrecyEn = `Deep Emotional Vault: Wears a serene social mask while keeping intense inner feelings, secret desires, or vices buried in deep psychological vaults away from ${spouseEn} and family.`;
  }

  // =========================================================================
  // CHILD PROFILE (< 14 Years): 100% Dynamic by Child Lagna & Age
  // =========================================================================
  if (isChild) {
    const childLagnaProfiles = [
      {
        icon: "⚡",
        titleKn: "ಸಾಹಸಿ ಆಟೋಟ & ಚುರುಕುತನ: ಅಂಜದೆ ಮುನ್ನುಗ್ಗುವ ಮುದ್ದಾದ ಕಂದ",
        titleEn: "Spirited Playfulness & Boldness: Fearless Active Child",
        bulletKn: `ಮಗುವಿನ ಮೇಷ ಲಗ್ನದ ಅಗ್ನಿ ತತ್ವದ ಬಲದಿಂದಾಗಿ, ಮಗು ಅತ್ಯಂತ ಚುರುಕು, ಸಾಹಸಿ ಹಾಗೂ ಆಟೋಟಗಳಲ್ಲಿ ಅಂಜದೆ ಮುನ್ನುಗ್ಗುವ ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`,
        bulletEn: `Endowed with Aries ascendant energy, the child displays active vitality, playful bravery, and natural exploratory leadership.`
      },
      {
        icon: "🌱",
        titleKn: "ಶಾಂತ ಮುಖಭಾವ, ಮುದ್ದಾದ ನಗು & ಅಕ್ಕರೆ: ಎಲ್ಲರನ್ನೂ ತಣಿಸುವ ಸುಕುಮಾರ ಕಂದ",
        titleEn: "Serene Smile & Affectionate Demeanor: Sweet Gentle Child",
        bulletKn: `ಮಗುವಿನ ವೃಷಭ ಲಗ್ನದ ಪೃಥ್ವಿ ತತ್ವದಿಂದಾಗಿ, ಮುಖದಲ್ಲಿ ಸದಾ ಮುಗ್ಧ ಪ್ರಶಾಂತತೆ, ಅಕ್ಕರೆ ಹಾಗೂ ಮುದ್ದಾದ ನಗು ತುಂಬಿರುತ್ತದೆ. ಕುಟುಂಬದ ಎಲ್ಲರ ಪ್ರೀತಿಯನ್ನು ಸೆಳೆಯುವ ಸೌಮ್ಯ ಸ್ವಭಾವ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `Governed by Taurus, the child radiates calm gentleness, endearing smiles, and affectionate bonding with family elders.`
      },
      {
        icon: "💡",
        titleKn: "ಕುತೂಹಲದ ಮಾತುಗಾರಿಕೆ & ಚುರುಕು ಕಣ್ಣುಗಳು: ಕ್ಷಣಕ್ಷಣಕ್ಕೂ ಪ್ರಶ್ನೆ ಕೇಳುವ ಜಾಣ ಮಗು",
        titleEn: "Curious Questions & Quick Observational Eyes: Inquisitive Mind",
        bulletKn: `ಮಗುವಿನ ಮಿಥುನ ಲಗ್ನದ ಬುಧ ಬಲದಿಂದಾಗಿ, ಸುತ್ತಲಿನ ಜಗತ್ತನ್ನು ನೋಡುವ ಕಣ್ಣುಗಳಲ್ಲಿ ಅಪಾರ ಕುತೂಹಲವಿದೆ. ಹೊಸ ಶಬ್ದಗಳನ್ನು ವೇಗವಾಗಿ ಕಲಿಯುವ ಹಾಗೂ ಆಟಿಕೆಯ ಜೊತೆ ಸಂವಹನ ನಡೆಸುವ ಜಾಣ್ಮೆ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `With Gemini ascendant, the child possesses curious observation, lively babbling, and rapid imitation of words and actions.`
      },
      {
        icon: "❤️",
        titleKn: "ತಾಯಿಯ ಮಡಿಲ ಪ್ರೀತಿ, ಮುಗ್ಧ ವಾತ್ಸಲ್ಯ & ಮೃದು ಹೃದಯ: ಆಪ್ತರನ್ನು ಅಪ್ಪಿಕೊಳ್ಳುವ ಅಕ್ಕರೆ",
        titleEn: "Deep Affection for Parents & Tender Empathy: Sweet Loving Child",
        bulletKn: `ಮಗುವಿನ ಕರ್ಕಾಟಕ ಲಗ್ನದ ಜಲ ತತ್ವದಿಂದಾಗಿ, ಮಗುವಿನ ಹೃದಯ ಅತ್ಯಂತ ಕೋಮಲ. ತಾಯಿಯ ಸಾಮೀಪ್ಯ ಮತ್ತು ಪ್ರೀತಿಯನ್ನು ಆಳವಾಗಿ ಬಯಸುತ್ತಾ, ಕುಟುಂಬದವರನ್ನು ಪ್ರೀತಿಯಿಂದ ಅಪ್ಪಿಕೊಳ್ಳುವ ಮುಗ್ಧತೆ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `With Cancer ascendant, the child has a deeply tender heart, blooming under maternal care and offering pure unconditional affection.`
      },
      {
        icon: "🌟",
        titleKn: "ದೈವಿಕ ತೇಜಸ್ಸು, ಆಕರ್ಷಕ ಮುಖಲಕ್ಷಣ & ರಾಜಕಳೆ: ಎಲ್ಲರನ್ನೂ ಸೆಳೆಯುವ ಮುದ್ದಾದ ಕಂದ",
        titleEn: "Divine Radiance, Endearing Charm & Majestic Spark",
        bulletKn: `ಮಗುವಿನ ಸಿಂಹ ಲಗ್ನದ ಸೂರ್ಯ ತೇಜಸ್ಸಿನಿಂದಾಗಿ ಮುಖದಲ್ಲಿ ಸಹಜ ದೈವಿಕ ಆಕರ್ಷಣೆ ಇದೆ. ಕುಟುಂಬದ ಹಿರಿಯರು ಮತ್ತು ಬಂಧುಗಳನ್ನು ತನ್ನತ್ತ ಸೆಳೆಯುವ ಮುಗ್ಧತೆ ಹಾಗೂ ರಾಜಗಾಂಭೀರ್ಯದ ಕಳೆ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `Endowed with the natural brilliance of Leo Ascendant, the child possesses an endearing charm that effortlessly attracts affection from family and elders.`
      },
      {
        icon: "🔍",
        titleKn: "ಅಚ್ಚುಕಟ್ಟಾದ ಆಟಿಕೆಗಳ ಜೋಡಣೆ & ಸೂಕ್ಷ್ಮ ಗ್ರಹಿಕೆ: ವ್ಯವಸ್ಥಿತ ಜಾಣ್ಮೆಯ ಕಂದ",
        titleEn: "Careful Toy Arrangement & Sharp Observation: Methodical Learner",
        bulletKn: `ಮಗುವಿನ ಕನ್ಯಾ ಲಗ್ನದ ಪ್ರಭಾವದಿಂದಾಗಿ, ಮಗು ಆಟಿಕೆಗಳನ್ನು ತನ್ನದೇ ಆದ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುವ, ವಿವರಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸುವ ಆಶ್ಚರ್ಯಕರ ಗ್ರಹಿಕೆ ಮತ್ತು ಶಿಸ್ತನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`,
        bulletEn: `With Virgo ascendant, the child shows remarkable attentiveness to shapes, patterns, and careful organization during play.`
      },
      {
        icon: "🌸",
        titleKn: "ಸೌಮ್ಯ ನಗು, ಸಿಹಿ ಮಾತು & ಸ್ನೇಹಿತರ ಜೊತೆ ಹೊಂದಾಣಿಕೆ: ಎಲ್ಲರ ಪ್ರೀತಿಪಾತ್ರ ಮಗು",
        titleEn: "Sweet Demeanor & Friendly Harmony: Delightful Playmate",
        bulletKn: `ಮಗುವಿನ ತುಲಾ ಲಗ್ನದ ಸೌಮ್ಯತೆಯಿಂದಾಗಿ, ಎಲ್ಲರೊಂದಿಗೂ ನಗುನಗುತ್ತಾ ಬೆರೆಯುವ, ಆಟಿಕೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮಧುರ ಪ್ರವೃತ್ತಿ ಇದೆ. ಯಾವುದೇ ಜಗಳವಿಲ್ಲದೆ ಶಾಂತವಾಗಿ ಆಟವಾಡುವ ಸದ್ಗುಣ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `Governed by Libra, the child is naturally sweet-tempered, cooperative, and loves harmonious sharing of toys and smiles.`
      },
      {
        icon: "🦅",
        titleKn: "ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ, ಆಳವಾದ ಮುಗ್ಧತೆ & ಅಚಲ ಹಠ: ಅಸಾಧಾರಣ ಗ್ರಹಿಕೆಯ ಕಂದ",
        titleEn: "Piercing Intuitive Eyes & Determined Will: Deep Sensitive Child",
        bulletKn: `ಮಗುವಿನ ವೃಶ್ಚಿಕ ಲಗ್ನದ ಗಂಭೀರ ತತ್ವದಿಂದಾಗಿ, ಮಗುವಿನ ಕಣ್ಣುಗಳು ಅಸಾಧಾರಣ ತೀಕ್ಷ್ಣತೆ ಹೊಂದಿವೆ. ಹೊಸಬರನ್ನು ಮೊದಲು ದೂರದಿಂದಲೇ ಪರೀಕ್ಷಿಸಿ, ನಂಬಿಕೆ ಬಂದ ನಂತರವಷ್ಟೇ ಮುದ್ದು ಮಾಡುವ ವಿಶೇಷ ಗುಣ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `With Scorpio ascendant, the child has intensely observant eyes, taking time to assess strangers before offering trust and deep affection.`
      },
      {
        icon: "🏹",
        titleKn: "ಉಲ್ಲಾಸಭರಿತ ನಗು & ಮುಗ್ಧ ಉತ್ಸಾಹ: ಮನೆಯೆಲ್ಲ ಸಂತಸ ತುಂಬುವ ಪುಟ್ಟ ಕಂದ",
        titleEn: "Joyful Laughter & Buoyant Energy: Sunshine of the Household",
        bulletKn: `ಮಗುವಿನ ಧನು ಲಗ್ನದ ಗುರು ಕೃಪೆಯಿಂದಾಗಿ, ಮನೆಯಲ್ಲಿ ಸದಾ ನಗು, ಸಂತೋಷ ಮತ್ತು ಲವಲವಿಕೆ ತುಂಬಿರುತ್ತದೆ. ಹೊಸ ಆಟಿಕೆಗಳು ಹಾಗೂ ತೆರೆದ ಪರಿಸರದಲ್ಲಿ ಉತ್ಸಾಹದಿಂದ ಕಲಿಯುವ ಕಂದ.`,
        bulletEn: `Ruled by Jupiter in Sagittarius, the child is cheerful, energetic, and a source of radiant joy throughout the household.`
      },
      {
        icon: "⏳",
        titleKn: "ಶಾಂತ ಚಿತ್ತ, ತಾಳ್ಮೆಯ ನಡವಳಿಕೆ & ಹಿರಿಯರ ಮಾತು ಕೇಳುವಿಕೆ: ಪ್ರಬುದ್ಧ ಮುದ್ದಾದ ಮಗು",
        titleEn: "Patient Temperament & Attentive Listening: Mature Well-Behaved Child",
        bulletKn: `ಮಗುವಿನ ಮಕರ ಲಗ್ನದ ಶಿಸ್ತಿನಿಂದಾಗಿ, ಮಗು ಅತಿಯಾಗಿ ರಂಪಾಟ ಮಾಡದೆ ಸಮಾಧಾನದಿಂದ ಆಟವಾಡುವ ಹಾಗೂ ಹಿರಿಯರ ಮಾತಿಗೆ ಕಿವಿಗೊಡುವ ಪ್ರಬುದ್ಧ ನಡವಳಿಕೆಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`,
        bulletEn: `With Capricorn ascendant, the child is patient, steady, and displays admirable composure and cooperative discipline.`
      },
      {
        icon: "🌐",
        titleKn: "ಸ್ವತಂತ್ರ ಆಲೋಚನೆ, ಹೊಸ ಆಟಿಕೆಗಳ ಅನ್ವೇಷಣೆ & ಸ್ನೇಹಶೀಲತೆ: ವಿಶಿಷ್ಟ ಕಲ್ಪನೆಯ ಕಂದ",
        titleEn: "Inventive Play & Unique Curiosity: Independent Little Thinker",
        bulletKn: `ಮಗುವಿನ ಕುಂಭ ಲಗ್ನದ ಪ್ರಭಾವದಿಂದಾಗಿ, ಮಗು ಸಿದ್ಧ ಆಟಿಕೆಗಳಿಗಿಂತ ಸ್ವತಃ ಹೊಸ ರೀತಿಯಲ್ಲಿ ಆಟವಾಡಲು ಇಷ್ಟಪಡುತ್ತದೆ. ಇತರ ಮಕ್ಕಳ ಜೊತೆ ಬೇಧ-ಭಾವವಿಲ್ಲದೆ ಸುಲಭವಾಗಿ ಸ್ನೇಹ ಬೆಳೆಸುವ ಗುಣ ಮಗುವಿನಲ್ಲಿದೆ.`,
        bulletEn: `Governed by Aquarius, the child exhibits creative independence in play and makes friends with effortless warmth.`
      },
      {
        icon: "🪷",
        titleKn: "ದೈವಿಕ ಮುಗ್ಧತೆ, ಕರುಣೆಯ ಕಣ್ಣುಗಳು & ಮೃದು ಸ್ಪರ್ಶ: ದೇವರ ಪ್ರಸಾದದಂತಿರುವ ಕಂದ",
        titleEn: "Pure Angelic Innocence & Gentle Sensitivity: Divine Blessing",
        bulletKn: `ಮಗುವಿನ ಮೀನ ಲಗ್ನದ ಸಾತ್ವಿಕತೆಯಿಂದಾಗಿ, ಮಗುವಿನಲ್ಲಿ ದೈವಿಕ ಮುಗ್ಧತೆ ಮತ್ತು ಅತಿಯಾದ ಮೃದುತ್ವವಿದೆ. ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳು ಹಾಗೂ ಸಂಗೀತವನ್ನು ಕೇಳಿದರೆ ಮುಖದಲ್ಲಿ ವಿಶೇಷ ಆನಂದ ಮೂಡುತ್ತದೆ.`,
        bulletEn: `With Pisces ascendant, the child radiates serene angelic sweetness, deeply responsive to soothing music, nature, and loving touch.`
      }
    ];

    const childLagnaP = childLagnaProfiles[lagnaIdx] || childLagnaProfiles[0];

    const childGoodTraits: TraitBulletPoint[] = [
      {
        id: 1,
        type: "good",
        titleKn: childLagnaP.titleKn,
        titleEn: childLagnaP.titleEn,
        icon: childLagnaP.icon,
        badgeKn: `ಲಗ್ನ: ${lagnaKn} • ${lagnaLordKn}`,
        badgeEn: `Lagna: ${lagnaEn} • ${lagnaLord}`,
        bulletKn: childLagnaP.bulletKn,
        bulletEn: childLagnaP.bulletEn,
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
      gokarnaPrayashchittaEn: `Perform Balagraha Shanti and Mahamrityunjaya Sankalpa Pooja at Sri Kshetra Gokarna Kotiteertha to pacify child colic, crying, and evil eye afflictions.`,
      isTeetotaler: true,
      hasMaritalFidelity: true
    };
  }

  // =========================================================================
  // ADULT PROFILE (>= 14 Years): 100% Dynamic, Chart-Specific & Gender-Aware
  // =========================================================================

  // 12 DISTINCT LAGNA GOOD PROFILES (Trait 1)
  const lagnaGoodProfiles = [
    {
      icon: "⚡",
      badgeKn: `ಮೇಷ ಲಗ್ನ • ಕುಜ ಬಲ`,
      badgeEn: `Aries Ascendant • Mars`,
      titleKn: "ಸಾಹಸ ಪ್ರವೃತ್ತಿ & ಅಪ್ರತಿಮ ನಾಯಕತ್ವ: ಸವಾಲುಗಳಿಗೆ ಎದೆಯೊಡ್ಡಿ ಮುನ್ನುಗ್ಗುವ ಛಲ",
      titleEn: "Dynamic Leadership & Bold Initiative: Fearless Pioneering Drive",
      bulletKn: `ನಿಮ್ಮ ಮೇಷ ಲಗ್ನದ ಅಧಿಪತಿ ಕುಜನ ಅಗ್ನಿ ತತ್ವದ ಬಲದಿಂದಾಗಿ, ನೀವು ಎಂತಹ ಕಠಿಣ ಸವಾಲುಗಳು ಎದುರಾದರೂ ಅಂಜದೆ ನೇರವಾಗಿ ಮುನ್ನುಗ್ಗುವ ಅದಮ್ಯ ಸಾಹಸಿಗರು. ಯಾರ ಮುಂದೆಯೂ ಅನಗತ್ಯವಾಗಿ ತಲೆಬಾಗದೆ, ಸ್ವಂತ ಪರಿಶ್ರಮ ಹಾಗೂ ನಾಯಕತ್ವದಿಂದ ಹೊಸ ಹಾದಿಯನ್ನು ಸೃಷ್ಟಿಸುವ ಅಪ್ರತಿಮ ಛಲಗಾರಿಕೆ ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ಮುಖಸ್ತುತಿಯನ್ನು ಮಾಡದೆ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಮುನ್ನಡೆಯುತ್ತೀರಿ.`,
      bulletEn: `With your Aries Ascendant ruled by Mars, you possess an unstoppable pioneering drive and fearless executive courage. You never yield to coercion, preferring to forge your own path with dynamic independence.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಮೇಷ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಕುಜನ ಅಗ್ನಿ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Aries ruled by martial fiery energy.`
    },
    {
      icon: "🌱",
      badgeKn: `ವೃಷಭ ಲಗ್ನ • ಶುಕ್ರ ಬಲ`,
      badgeEn: `Taurus Ascendant • Venus`,
      titleKn: "ಅಚಲ ಸ್ಥಿರತೆ, ತಾಳ್ಮೆ & ಕಲಾಭಿರುಚಿ: ಬಿರುಗಾಳಿಯಲ್ಲೂ ಅಲುಗಾಡದ ಸಹನೆ",
      titleEn: "Steadfast Stability, Patience & Aesthetic Grace: Grounded Resilience",
      bulletKn: `ನಿಮ್ಮ ವೃಷಭ ಲಗ್ನದ ಅಧಿಪತಿ ಶುಕ್ರನ ಪೃಥ್ವಿ ತತ್ವದಿಂದಾಗಿ, ನೀವು ಅಪಾರ ತಾಳ್ಮೆ, ಶಾಂತತೆ ಹಾಗೂ ಸ್ಥಿರತೆಯ ಪ್ರತಿರೂಪ. ಕಷ್ಟಗಳು ಬಂದಾಗ ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳದೆ, ಯೋಚಿಸಿ ಗಟ್ಟಿಯಾದ ಅಡಿಪಾಯ ಕಟ್ಟುವ ಸಂಯಮ ನಿಮ್ಮಲ್ಲಿದೆ. ಸುಂದರ ಪರಿಸರ, ಕಲೆ, ಕುಟುಂಬ ಸುಖ ಹಾಗೂ ಪ್ರಾಮಾಣಿಕ ಸಂಬಂಧಗಳಿಗೆ ನಿಮ್ಮ ಮೊದಲ ಆದ್ಯತೆ.`,
      bulletEn: `Governed by Venus in earthy Taurus, your core strength lies in unshakeable patience, aesthetic refinement, and practical endurance. You build lasting foundations without reckless impulses.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ವೃಷಭ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನ ಸ್ಥಿರ ಪೃಥ್ವಿ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Taurus ruled by steadfast Venusian earth.`
    },
    {
      icon: "💡",
      badgeKn: `ಮಿಥುನ ಲಗ್ನ • ಬುಧ ಬಲ`,
      badgeEn: `Gemini Ascendant • Mercury`,
      titleKn: "ಚತುರ ವಾಕ್ಚಾತುರ್ಯ, ಬುದ್ಧಿಮತ್ತೆ & ಬಹುಮುಖ ಪ್ರತಿಭೆ: ಯಾವುದೇ ಸನ್ನಿವೇಶಕ್ಕೂ ಒಗ್ಗಿಕೊಳ್ಳುವ ಜಾಣ್ಮೆ",
      titleEn: "Brilliant Articulation, Wit & Versatility: Quick-Witted Adaptability",
      bulletKn: `ನಿಮ್ಮ ಮಿಥುನ ಲಗ್ನದ ಅಧಿಪತಿ ಬುಧನ ವಾಯು ತತ್ವದ ಪ್ರಭಾವದಿಂದಾಗಿ, ನಿಮ್ಮ ಮಾತುಗಾರಿಕೆ ಮತ್ತು ಗ್ರಹಿಕೆ ಶಕ್ತಿ ಅತ್ಯಂತ ಚುರುಕು. ಜಟಿಲ ಸಮಸ್ಯೆಗಳನ್ನೂ ಹಸನ್ಮುಖಿಯಾಗಿ, ಮಾತಿನ ಚಾತುರ್ಯದಿಂದ ಬಗೆಹರಿಸುವ ಕೌಶಲ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ. ಹೊಸ ವಿಷಯಗಳನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಕಲಿಯುವ ಬಹುಮುಖ ಪ್ರತಿಭೆ ಹಾಗೂ ಹೊಂದಾಣಿಕೆಯ ಗುಣ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ದೊಡ್ಡ ಆಸ್ತಿ.`,
      bulletEn: `With Gemini Ascendant governed by Mercury, your quick wit, brilliant conversational diplomacy, and intellectual versatility allow you to adapt effortlessly to diverse challenges.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಮಿಥುನ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಬುಧನ ವಾಯು ತತ್ವ.`,
      astrologicalBasisEn: `1st house Gemini ruled by communicative Mercury.`
    },
    {
      icon: "🌊",
      badgeKn: `ಕರ್ಕಾಟಕ ಲಗ್ನ • ಚಂದ್ರ ಬಲ`,
      badgeEn: `Cancer Ascendant • Moon`,
      titleKn: "ಮಾತೃ ವಾತ್ಸಲ್ಯ, ಆಳವಾದ ಅಂತಃಕರಣ & ಅಚಲ ನಿಷ್ಠೆ: ಆಪ್ತರನ್ನು ಕಾಯುವ ಪ್ರೇಮ ಕವಚ",
      titleEn: "Deep Empathy, Intuitive Nurturing & Devoted Loyalty: Protective Care",
      bulletKn: `ನಿಮ್ಮ ಕರ್ಕಾಟಕ ಲಗ್ನದ ಅಧಿಪತಿ ಚಂದ್ರನ ಜಲ ತತ್ವದ ಬಲದಿಂದಾಗಿ, ನಿಮ್ಮಲ್ಲಿ ಅಪಾರ ಅಂತಃಕರಣ, ಕರುಣೆ ಹಾಗೂ ಪೋಷಣೆಯ ಸಹಜ ಶಕ್ತಿ ಇದೆ. ನಿಮ್ಮನ್ನು ನಂಬಿದವರನ್ನು ಮತ್ತು ಕುಟುಂಬವನ್ನು ರಕ್ಷಿಸಲು ನೀವು ಎಂತಹ ತ್ಯಾಗಕ್ಕೂ ಸಿದ್ಧ. ಇತರರ ಮನಸ್ಸಿನ ನೋವನ್ನು ಸುಲಭವಾಗಿ ಗ್ರಹಿಸುವ ಅತೀಂದ್ರಿಯ ಭಾವನಾತ್ಮಕ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Governed by the Moon in watery Cancer, you radiate maternal warmth, deep emotional loyalty, and intuitive insight. You serve as an unwavering emotional shield for those you love.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಕರ್ಕಾಟಕ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಚಂದ್ರನ ಜಲ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Cancer governed by the nurturing Moon.`
    },
    {
      icon: "👑",
      badgeKn: `ಸಿಂಹ ಲಗ್ನ • ಸೂರ್ಯ ಬಲ`,
      badgeEn: `Leo Ascendant • Sun`,
      titleKn: "ರಾಜಗಾಂಭೀರ್ಯ, ಉದಾರ ಹೃದಯ & ಅಪ್ರತಿಮ ಸ್ವಾಭಿಮಾನ: ಯಾರ ಮುಂದೆಯೂ ತಲೆಬಾಗದ ಛಲ",
      titleEn: "Majestic Nobility, Magnanimous Heart & Royal Self-Respect: Unyielding Dignity",
      bulletKn: `ನಿಮ್ಮ ಸಿಂಹ ಲಗ್ನದ ಅಧಿಪತಿ ಸೂರ್ಯನ ತೇಜಸ್ಸಿನಿಂದಾಗಿ, ನಿಮ್ಮ ನಡೆ-ನುಡಿಯಲ್ಲಿ ಸಹಜ ರಾಜಗಾಂಭೀರ್ಯ ಮತ್ತು ಅಪ್ರತಿಮ ಸ್ವಾಭಿಮಾನವಿದೆ. ಯಾರ ಮುಂದೆಯೂ ಮುಖಸ್ತುತಿ ಮಾಡದೆ, ಸತ್ಯ ಮತ್ತು ಧರ್ಮದ ಪರವಾಗಿ ಮುನ್ನಡೆಯುವ ನೇರ ನಡೆ ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ. ಆಶ್ರಯ ಬೇಡಿ ಬಂದವರನ್ನು ಉದಾರ ಮನಸ್ಸಿನಿಂದ ರಕ್ಷಿಸುವ ನಾಯಕತ್ವ ನಿಮ್ಮದು.`,
      bulletEn: `Endowed with Leo Ascendant ruled by the Sun, you exude sovereign dignity, absolute self-respect, and radiant magnanimity. You never bow to sycophancy, leading with majestic honor.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಸಿಂಹ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಸೂರ್ಯನ ತೇಜೋಗುಣ.`,
      astrologicalBasisEn: `1st house Leo ruled by the radiant Sun.`
    },
    {
      icon: "🔍",
      badgeKn: `ಕನ್ಯಾ ಲಗ್ನ • ಬುಧ ಬಲ`,
      badgeEn: `Virgo Ascendant • Mercury`,
      titleKn: "ನಿಖರ ವಿಶ್ಲೇಷಣೆ, ಸುವ್ಯವಸ್ಥೆ & ಕರ್ತವ್ಯ ನಿಷ್ಠೆ: ಪರಿಪೂರ್ಣತೆಯತ್ತ ಅವಿರತ ಶ್ರಮ",
      titleEn: "Analytical Precision, Methodical Order & Flawless Duty: Perfectionist Work Ethic",
      bulletKn: `ನಿಮ್ಮ ಕನ್ಯಾ ಲಗ್ನದ ಅಧಿಪತಿ ಬುಧನ ಪೃಥ್ವಿ ತತ್ವದಿಂದಾಗಿ, ನೀವು ಯಾವುದೇ ಕೆಲಸದಲ್ಲೂ ತಪ್ಪುಗಳಿಗೆ ಆಸ್ಪದ ನೀಡದ ನಿಖರತೆ ಮತ್ತು ಶಿಸ್ತನ್ನು ಕಾಪಾಡುತ್ತೀರಿ. ವ್ಯವಸ್ಥಿತ ಯೋಜನೆ, ಪ್ರಾಯೋಗಿಕ ಚಿಂತನೆ ಹಾಗೂ ಇತರರಿಗೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ನೆರವಾಗುವ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ನಿಮ್ಮನ್ನು ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತರನ್ನಾಗಿ ಮಾಡುತ್ತದೆ.`,
      bulletEn: `With Virgo Ascendant governed by Mercury, your analytical eye, meticulous discipline, and dedication to practical service ensure flawless execution and high reliability in every duty.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಕನ್ಯಾ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಬುಧನ ವಿಶ್ಲೇಷಣಾ ಶಕ್ತಿ.`,
      astrologicalBasisEn: `1st house Virgo ruled by analytical Mercury.`
    },
    {
      icon: "⚖️",
      badgeKn: `ತುಲಾ ಲಗ್ನ • ಶುಕ್ರ ಬಲ`,
      badgeEn: `Libra Ascendant • Venus`,
      titleKn: "ನ್ಯಾಯಪ್ರಿಯತೆ, ಸಾಮರಸ್ಯ & ಸೌಹಾರ್ದ ಸಮನ್ವಯ: ಸಕಲರನ್ನೂ ಗೌರವದಿಂದ ನಡೆಸಿಕೊಳ್ಳುವ ವಿವೇಕ",
      titleEn: "Equitable Justice, Harmonious Balance & Diplomatic Grace: Uniting Hearts",
      bulletKn: `ನಿಮ್ಮ ತುಲಾ ಲಗ್ನದ ಅಧಿಪತಿ ಶುಕ್ರನ ವಾಯು ತತ್ವದ ಸಮತೋಲನದಿಂದಾಗಿ, ನೀವು ಅತ್ಯಂತ ನ್ಯಾಯಪ್ರಿಯರು ಮತ್ತು ಸೌಹಾರ್ದಯುತ ವ್ಯಕ್ತಿತ್ವದವರು. ಎಷ್ಟೇ ಕಠಿಣ ವಾದ-ವಿವಾದಗಳಿದ್ದರೂ ಶಾಂತವಾಗಿ ಎಲ್ಲರನ್ನೂ ಜೊತೆಗೂಡಿಸಿ, ಒಮ್ಮತದ ನಿರ್ಧಾರಕ್ಕೆ ತರುವ ಅದ್ಭುತ ಸಮನ್ವಯ ಕಲೆ ಮತ್ತು ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Governed by Venus in harmonious Libra, your supreme virtue is an innate sense of fairness, diplomatic tact, and aesthetic poise, harmonizing discord into shared consensus.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ತುಲಾ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನ ನ್ಯಾಯ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Libra ruled by fair and diplomatic Venus.`
    },
    {
      icon: "🦅",
      badgeKn: `ವೃಶ್ಚಿಕ ಲಗ್ನ • ಕುಜ-ಕೇತು ಬಲ`,
      badgeEn: `Scorpio Ascendant • Mars-Ketu`,
      titleKn: "ಅಚಲ ಸಂಕಲ್ಪ, ರಹಸ್ಯ ಭೇದಿಸುವ ದೃಷ್ಟಿ & ತೀವ್ರ ನಿಷ್ಠೆ: ಬಿರುಗಾಳಿಯಲ್ಲೂ ಮಣಿಯದ ಆತ್ಮಬಲ",
      titleEn: "Unyielding Willpower, Penetrating Intuition & Fierce Devotion: Formidable Inner Power",
      bulletKn: `ನಿಮ್ಮ ವೃಶ್ಚಿಕ ಲಗ್ನದ ಅಧಿಪತಿ ಕುಜ ಮತ್ತು ಕೇತುಗಳ ಗಂಭೀರ ಜಲ ತತ್ವದಿಂದಾಗಿ, ನಿಮ್ಮಲ್ಲಿ ಅಪಾರ ಆಂತರಿಕ ಸಂಕಲ್ಪ ಮತ್ತು ಛಲವಿದೆ. ಸತ್ಯವನ್ನು ಮರೆಮಾಚಿದರೂ ಕಣ್ಣಿನಲ್ಲೇ ಪತ್ತೆಹಚ್ಚುವ ತೀಕ್ಷ್ಣ ಗ್ರಹಿಕೆ ನಿಮ್ಮಲ್ಲಿದೆ. ನಂಬಿದವರಿಗೆ ಜೀವವನ್ನೇ ಕೊಡುವ ನಿಷ್ಠೆ ಹಾಗೂ ಸೋತರೂ ಮತ್ತೆ ಪುಟಿದೆದ್ದು ಗೆಲ್ಲುವ ಅದ್ಭುತ ಚೇತರಿಕೆಯ ಶಕ್ತಿ ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ.`,
      bulletEn: `Ruled by Mars and Ketu in Scorpio, your personality holds immense transformative power, unwavering loyalty, and piercing psychic intuition that sees through surface deceptions.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ವೃಶ್ಚಿಕ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಕುಜ-ಕೇತುಗಳ ಗಂಭೀರ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Scorpio ruled by transformative Mars and Ketu.`
    },
    {
      icon: "🏹",
      badgeKn: `ಧನು ಲಗ್ನ • ಗುರು ಬಲ`,
      badgeEn: `Sagittarius Ascendant • Jupiter`,
      titleKn: "ಧರ್ಮ ನಿಷ್ಠೆ, ದೂರದರ್ಶಿತ್ವ & ಜ್ಞಾನದಾಹ: ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಸುವ ಗುರುಬಲ",
      titleEn: "Righteous Ideals, Philosophical Vision & Thirst for Truth: Wise Optimism",
      bulletKn: `ನಿಮ್ಮ ಧನು ಲಗ್ನದ ಅಧಿಪತಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅಗ್ನಿ ತತ್ವದ ಬಲದಿಂದಾಗಿ, ನೀವು ಉನ್ನತ ಮೌಲ್ಯಗಳು ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯ ಪ್ರತಿಪಾದಕರು. ಜೀವನವನ್ನು ವಿಶಾಲ ದೃಷ್ಟಿಕೋನದಿಂದ ನೋಡುವ ಆಶಾವಾದ ಹಾಗೂ ಇತರರಿಗೆ ದಾರಿದೀಪವಾಗುವ ಮಾರ್ಗದರ್ಶನ ಸಾಮರ್ಥ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ. ಯಾವುದೇ ಆಮಿಷಕ್ಕೂ ಮಣಿಯದೆ ಸದಾ ಧರ್ಮದ ಪರವಾಗಿ ನಿಲ್ಲುತ್ತೀರಿ.`,
      bulletEn: `With Sagittarius Ascendant ruled by Jupiter, your soul thrives on philosophical truth, expansive optimism, and righteous ideals. You inspire others as a beacon of vision and integrity.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಧನು ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಗುರುವಿನ ಧರ್ಮ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Sagittarius ruled by benevolent Jupiter.`
    },
    {
      icon: "🏔️",
      badgeKn: `ಮಕರ ಲಗ್ನ • ಶನಿ ಬಲ`,
      badgeEn: `Capricorn Ascendant • Saturn`,
      titleKn: "ಕಠಿಣ ಪರಿಶ್ರಮ, ಕರ್ಮ ಬದ್ಧತೆ & ಶಿಸ್ತು: ಶೂನ್ಯದಿಂದ ಶಿಖರ ಮುಟ್ಟುವ ಅದ್ಭುತ ಸಹನೆ",
      titleEn: "Tireless Endurance, Karmic Discipline & Pragmatic Mastery: Reaching the Summit",
      bulletKn: `ನಿಮ್ಮ ಮಕರ ಲಗ್ನದ ಅಧಿಪತಿ ಕರ್ಮಕಾರಕ ಶನಿಯ ಪೃಥ್ವಿ ತತ್ವದ ಪ್ರಭಾವದಿಂದಾಗಿ, ನೀವು ಅಪ್ರತಿಮ ಪರಿಶ್ರಮಿ ಮತ್ತು ಶಿಸ್ತುಬದ್ಧ ವ್ಯಕ್ತಿ. ಆಡಂಬರದ ಮಾತುಗಳಿಗಿಂತ ಶಾಂತವಾಗಿ ದುಡಿದು ಫಲಿತಾಂಶ ತೋರಿಸುವುದರಲ್ಲಿ ನಂಬಿಕೆ ಇಟ್ಟಿದ್ದೀರಿ. ಎಷ್ಟೇ ಕಠಿಣ ಸಂದರ್ಭಗಳಲ್ಲೂ ಎದೆಗುಂದದೆ, ಶೂನ್ಯದಿಂದ ಯಶಸ್ಸಿನ ಶಿಖರವನ್ನು ಏರುವ ತಾಳ್ಮೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Governed by Saturn in disciplined Capricorn, your signature strength is quiet, relentless perseverance. You master obstacles through pragmatic patience and construct enduring success from zero.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಮಕರ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಶನಿಯ ಕರ್ಮ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Capricorn ruled by disciplined Saturn.`
    },
    {
      icon: "🌐",
      badgeKn: `ಕುಂಭ ಲಗ್ನ • ಶನಿ-ರಾಹು ಬಲ`,
      badgeEn: `Aquarius Ascendant • Saturn-Rahu`,
      titleKn: "ಮಾನವೀಯತೆ, ನವೀನ ವೈಚಾರಿಕತೆ & ನಿಸ್ವಾರ್ಥತೆ: ಸಮಾಜದ ಹಿತ ಕಾಪಾಡುವ ಉನ್ನತ ಚಿಂತನೆ",
      titleEn: "Humanitarian Vision, Progressive Intellect & Selfless Independence",
      bulletKn: `ನಿಮ್ಮ ಕುಂಭ ಲಗ್ನದ ಅಧಿಪತಿ ಶನಿ ಮತ್ತು ರಾಹುವಿನ ವಾಯು ತತ್ವದ ಬಲದಿಂದಾಗಿ, ನೀವು ಸಾಂಪ್ರದಾಯಿಕ ಸಂಕೋಲೆಗಳನ್ನು ಮೀರಿ ಯೋಚಿಸುವ ನವೀನ ಸಮಾಜ ಸುಧಾರಕ ಮನೋಭಾವದವರು. ಸ್ವಾರ್ಥಕ್ಕಿಂತ ಸಮಾಜದ ಮತ್ತು ಎಲ್ಲರ ಒಳಿತಿಗಾಗಿ ಶ್ರಮಿಸುವ ವಿಶಾಲ ಹೃದಯ ನಿಮ್ಮದು. ನಿಮ್ಮ ಸ್ವತಂತ್ರ ವೈಚಾರಿಕ ಚಿಂತನೆ ಇತರರಿಗೆ ಸದಾ ಪ್ರೇರಣೆ.`,
      bulletEn: `Ruled by Saturn and Rahu in Aquarius, you possess a progressive intellect, egalitarian compassion, and visionary humanitarian outlook that transcends narrow boundaries.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಕುಂಭ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಶನಿ-ರಾಹುಗಳ ವಾಯು ತತ್ವ.`,
      astrologicalBasisEn: `1st house Aquarius ruled by innovative Saturn and Rahu.`
    },
    {
      icon: "✨",
      badgeKn: `ಮೀನ ಲಗ್ನ • ಗುರು ಬಲ`,
      badgeEn: `Pisces Ascendant • Jupiter`,
      titleKn: "ಅಪಾರ ಕರುಣೆ, ಆಧ್ಯಾತ್ಮಿಕ ತ್ಯಾಗ & ದೈವಿಕ ಅಂತಃಪ್ರಜ್ಞೆ: ಜಗತ್ತನ್ನೇ ಪ್ರೀತಿಸುವ ಪವಿತ್ರ ಮನಸ್ಸು",
      titleEn: "Boundless Compassion, Spiritual Intuition & Divine Surrender: Pure Radiance",
      bulletKn: `ನಿಮ್ಮ ಮೀನ ಲಗ್ನದ ಅಧಿಪತಿ ಗುರುವಿನ ಸಾತ್ವಿಕ ಜಲ ತತ್ವದಿಂದಾಗಿ, ನಿಮ್ಮ ಅಂತರಂಗವು ಅಪಾರ ದೈವಭಕ್ತಿ, ಕರುಣೆ ಮತ್ತು ತ್ಯಾಗ ಮನೋಭಾವದಿಂದ ಕೂಡಿದೆ. ಸಂಕಷ್ಟದಲ್ಲಿರುವವರನ್ನು ಕಂಡರೆ ತಕ್ಷಣ ಕರಗುವ ಮೃದು ಹೃದಯ ನಿಮ್ಮದು. ಐಹಿಕ ಸ್ವಾರ್ಥಕ್ಕಿಂತ ಆಧ್ಯಾತ್ಮಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ದೈವ ಕೃಪೆಯನ್ನು ನಂಬಿ ಮುನ್ನಡೆಯುವ ಸದ್ಗುಣ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Pisces Ascendant governed by Jupiter, your essence radiates mystic compassion, selflessness, and profound spiritual intuition. You move through life guided by faith and empathy.`,
      astrologicalBasisKn: `1ನೇ ಲಗ್ನ ಭಾವ ಮೀನ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ಗುರುವಿನ ಮೋಕ್ಷ ತತ್ವ.`,
      astrologicalBasisEn: `1st house Pisces ruled by spiritual Jupiter.`
    }
  ];

  const chosenLagnaP = lagnaGoodProfiles[lagnaIdx] || lagnaGoodProfiles[0];

  // 12 DISTINCT MOON SIGN GOOD PROFILES (Trait 2)
  const moonSignGoodProfiles = [
    {
      icon: "🔥",
      badgeKn: "ಮೇಷ ಚಂದ್ರ • ಕ್ಷಿಪ್ರ ಸಾಹಸ",
      badgeEn: "Aries Moon • Swift Courage",
      titleKn: "ತ್ವರಿತ ಸ್ಪಂದನೆ & ಉತ್ಸಾಹಭರಿತ ಧೈರ್ಯ: ಯಾವುದೇ ಆತಂಕಕ್ಕೂ ಹೆದರದ ಮನೋಸ್ಥೈರ್ಯ",
      titleEn: "Swift Response & Spirited Courage: Fearless Emotional Fortitude",
      bulletKn: `ನಿಮ್ಮ ಚಂದ್ರನು ಮೇಷ ರಾಶಿಯಲ್ಲಿರುವುದರಿಂದ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಶಕ್ತಿಯು ಸದಾ ಚೈತನ್ಯದಾಯಕ ಮತ್ತು ಧೈರ್ಯಶಾಲಿ. ಯಾವುದೇ ಅನಿಶ್ಚಿತತೆ ಅಥವಾ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ತಬ್ಬಿಬ್ಬಾಗದೆ, ತಕ್ಷಣ ಸ್ಪಂದಿಸಿ ಕಾರ್ಯಪ್ರವೃತ್ತರಾಗುವ ಅದ್ಭುತ ಮನೋಬಲ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Moon in Aries, your emotional nature is buoyant, daring, and swiftly decisive. You meet sudden adversities with immediate courage and proactive resolve.`,
      astrologicalBasisKn: `ಚಂದ್ರ ರಾಶಿ ಮೇಷ (ಕುಜ ಕ್ಷೇತ್ರ) ಹಾಗೂ ಅಗ್ನಿ ತತ್ವದ ಚೈತನ್ಯ.`,
      astrologicalBasisEn: `Moon in martial Aries conferring fearless emotional agility.`
    },
    {
      icon: "💎",
      badgeKn: "ಉಚ್ಚ ವೃಷಭ ಚಂದ್ರ • ಅಚಲ ಶಾಂತಿ",
      badgeEn: "Exalted Taurus Moon • Unshakeable Calm",
      titleKn: "ಅಚಲ ಮಾನಸಿಕ ಸ್ಥೈರ್ಯ & ಶಾಂತ ಚಿತ್ತ: ಭಾವನಾತ್ಮಕ ಬಿರುಗಾಳಿಯಲ್ಲೂ ಅಲುಗಾಡದ ಸಮಚಿತ್ತ",
      titleEn: "Unshakeable Mental Fortitude & Calm Composure: Serene Emotional Anchor",
      bulletKn: `ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನು ಪರಮೋಚ್ಚ (Exalted) ಬಲ ಹೊಂದಿರುವುದರಿಂದ, ನಿಮ್ಮ ಮನಸ್ಸು ಅಸಾಧಾರಣ ಶಾಂತತೆ, ಸ್ಥೈರ್ಯ ಮತ್ತು ಸಹನೆಯ ಆಗರ. ಇತರರು ಗಾಬರಿಯಾಗುವ ಪರಿಸ್ಥಿತಿಯಲ್ಲೂ ನಿಮ್ಮ ಸಮಚಿತ್ತವನ್ನು ಕಳೆದುಕೊಳ್ಳದೆ, ಪರಿಸ್ಥಿತಿಯನ್ನು ಸಮಾಧಾನವಾಗಿ ನಿಭಾಯಿಸುವ ಅಪರೂಪದ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With an exalted Moon in Taurus, your emotional foundation is grounded in supreme calmness, patience, and unwavering composure even amidst turbulent crises.`,
      astrologicalBasisKn: `ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಉಚ್ಚ ಚಂದ್ರ ಬಲ ಹಾಗೂ ಶುಕ್ರನ ಸೌಮ್ಯ ತತ್ವ.`,
      astrologicalBasisEn: `Exalted Moon in Taurus bestowing deep emotional stability.`
    },
    {
      icon: "🧠",
      badgeKn: "ಮಿಥುನ ಚಂದ್ರ • ಬೌದ್ಧಿಕ ಚುರುಕು",
      badgeEn: "Gemini Moon • Quick Intellect",
      titleKn: "ಬೌದ್ಧಿಕ ಚುರುಕು, ನವೀನ ಜಿಜ್ಞಾಸೆ & ಹಾಸ್ಯ ಪ್ರಜ್ಞೆ: ಮನಸ್ಸನ್ನು ಸದಾ ಲವಲವಿಕೆಯಲ್ಲಿಡುವ ಕಲೆ",
      titleEn: "Intellectual Curiosity, Quick Wit & Playful Charm: Vivacious Mind",
      bulletKn: `ನಿಮ್ಮ ಚಂದ್ರನು ಮಿಥುನ ರಾಶಿಯಲ್ಲಿರುವುದರಿಂದ, ನಿಮ್ಮ ಮನಸ್ಸು ಹೊಸ ವಿಷಯಗಳನ್ನು ತಿಳಿಯಲು ಸದಾ ಹಾತೊರೆಯುತ್ತದೆ. ಎಂತಹ ಉದ್ವಿಗ್ನ ಸಂದರ್ಭಗಳಲ್ಲೂ ಹಾಸ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ಸಮಯಪ್ರಜ್ಞೆಯಿಂದ ವಾತಾವರಣವನ್ನು ಹಗುರಗೊಳಿಸುವ ಕಲೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Moon in Gemini, your mental spirit is inquisitive, communicative, and lively, effortlessly lightening tense situations with witty perspective.`,
      astrologicalBasisKn: `ಮಿಥುನ ರಾಶಿಯ ಬುಧ-ಚಂದ್ರ ಸಂಪರ್ಕ ಹಾಗೂ ವಾಯು ತತ್ವ.`,
      astrologicalBasisEn: `Moon in Gemini governed by intellectual Mercury.`
    },
    {
      icon: "❤️",
      badgeKn: "ಸ್ವಕ್ಷೇತ್ರ ಕರ್ಕ ಚಂದ್ರ • ಅಂತಃಸ್ಫುರಣೆ",
      badgeEn: "Swakshetra Cancer Moon • Deep Intuition",
      titleKn: "ಅಪಾರ ಮಾತೃ ವಾತ್ಸಲ್ಯ, ಅಂತಃಸ್ಫುರಣೆ & ನಿಷ್ಠೆ: ಹೃದಯದ ಆಳದಿಂದ ಪ್ರೀತಿಸುವ ಗುಣ",
      titleEn: "Profound Empathy, Intuitive Sensing & Devotion: Unconditional Warmth",
      bulletKn: `ಕರ್ಕಾಟಕ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನು ಸ್ವಕ್ಷೇತ್ರ ಬಲ ಹೊಂದಿರುವುದರಿಂದ, ನಿಮ್ಮ ಅಂತಃಪ್ರಜ್ಞೆ (Intuition) ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ. ಇತರರು ಹೇಳದ ನೋವನ್ನೂ ಅವರ ಕಣ್ಣಿನಲ್ಲೇ ಗ್ರಹಿಸಿ, ಸಾಂತ್ವನ ನೀಡುವ ಅಪಾರ ಕರುಣೆ ಮತ್ತು ಆಪ್ತರನ್ನು ಕಾಯುವ ರಕ್ಷಣಾ ಪ್ರವೃತ್ತಿ ನಿಮ್ಮ ಹೃದಯದಲ್ಲಿದೆ.`,
      bulletEn: `With Moon in its own sign Cancer, your intuitive radar is profound. You sense emotional undercurrents instantly and nurture loved ones with unconditional protective warmth.`,
      astrologicalBasisKn: `ಕರ್ಕಾಟಕ ರಾಶಿಯಲ್ಲಿ ಸ್ವಕ್ಷೇತ್ರ ಚಂದ್ರ ಬಲ ಹಾಗೂ ಪರಿಶುದ್ಧ ಜಲ ತತ್ವ.`,
      astrologicalBasisEn: `Swakshetra Moon in Cancer conferring deep psychological intuition.`
    },
    {
      icon: "🦁",
      badgeKn: "ಸಿಂಹ ಚಂದ್ರ • ಹೃದಯ ವೈಶಾಲ್ಯ",
      badgeEn: "Leo Moon • Magnanimous Heart",
      titleKn: "ಹೃದಯ ವೈಶಾಲ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ & ಉದಾರತೆ: ಎಲ್ಲರನ್ನೂ ಪ್ರೀತಿಸಿ ಹರಸುವ ರಾಜಮನಸ್ಸು",
      titleEn: "Warm Magnanimity, Radiant Confidence & Generosity: Sovereign Heart",
      bulletKn: `ಸಿಂಹ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಅತ್ಯಂತ ದೊಡ್ಡದು. ಇತರರ ತಪ್ಪುಗಳನ್ನು ಕ್ಷಮಿಸಿ ಉದಾರವಾಗಿ ಸಹಾಯ ಮಾಡುವ ಗುಣ, ನಾಯಕತ್ವದ ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ಪ್ರೀತಿಪಾತ್ರರಿಗೆ ಸದಾ ನೆರಳಾಗಿ ನಿಲ್ಲುವ ರಾಜಗಾಂಭೀರ್ಯದ ಮನೋಭಾವ ನಿಮ್ಮದು.`,
      bulletEn: `With Moon in radiant Leo, your heart is noble, confident, and forgiving. You uplift others with generous patronage and provide a warm shelter for your circle.`,
      astrologicalBasisKn: `ಸಿಂಹ ರಾಶಿಯ ಸೂರ್ಯ-ಚಂದ್ರ ತೇಜೋಗುಣ.`,
      astrologicalBasisEn: `Moon in Leo governed by the radiant Sun.`
    },
    {
      icon: "📋",
      badgeKn: "ಕನ್ಯಾ ಚಂದ್ರ • ವಿವೇಕ & ಶಿಸ್ತು",
      badgeEn: "Virgo Moon • Discernment & Order",
      titleKn: "ವ್ಯವಸ್ಥಿತ ಯೋಜನೆ, ವಿವೇಚನೆ & ಪ್ರಾಯೋಗಿಕ ಜಾಣ್ಮೆ: ಭಾವನೆಗಳಿಗಿಂತ ಕರ್ತವ್ಯಕ್ಕೆ ಪ್ರಾಶಸ್ತ್ಯ",
      titleEn: "Methodical Planning, Prudent Discernment & Duty: Practical Composure",
      bulletKn: `ಕನ್ಯಾ ರಾಶಿಯ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದಾಗಿ, ನೀವು ಭಾವನಾತ್ಮಕ ಆವೇಶಕ್ಕೆ ಒಳಗಾಗದೆ, ಪ್ರತಿಯೊಂದು ವಿಷಯದಲ್ಲೂ ಸಾಧಕ-ಬಾಧಕಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮುನ್ನಡೆಯುತ್ತೀರಿ. ವ್ಯವಸ್ಥಿತ ಯೋಜನೆ ಹಾಗೂ ಕರ್ತವ್ಯ ನಿಷ್ಠೆಯಿಂದ ಮನಸ್ಸನ್ನು ಸಮತೋಲನದಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳುತ್ತೀರಿ.`,
      bulletEn: `Governed by Moon in analytical Virgo, you navigate emotions with practical discernment and order, prioritizing constructive duty over sentimental turbulence.`,
      astrologicalBasisKn: `ಕನ್ಯಾ ರಾಶಿಯ ಬುಧ-ಚಂದ್ರ ಪ್ರಾಯೋಗಿಕ ತತ್ವ.`,
      astrologicalBasisEn: `Moon in Virgo grounded in earthy analytical intellect.`
    },
    {
      icon: "🕊️",
      badgeKn: "ತುಲಾ ಚಂದ್ರ • ಸಾಮರಸ್ಯ ಸಮಚಿತ್ತ",
      badgeEn: "Libra Moon • Harmonious Composure",
      titleKn: "ಸಾಮರಸ್ಯ ಪ್ರಿಯತೆ, ಸಮಚಿತ್ತ & ಮಧುರ ಸಂವಹನ: ಮನಸ್ಸನ್ನು ಸದಾ ತಣ್ಣಗಿಡುವ ಸೌಹಾರ್ದತೆ",
      titleEn: "Harmonious Temperament, Poise & Sweet Demeanor: Peaceful Balance",
      bulletKn: `ತುಲಾ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಸದಾ ಶಾಂತಿ ಮತ್ತು ಸೌಹಾರ್ದತೆಯನ್ನು ಬಯಸುತ್ತದೆ. ಯಾರೊಂದಿಗೂ ಅನಗತ್ಯ ಕಹಿ ಬೆಳೆಸಿಕೊಳ್ಳದೆ, ಮಧುರ ಮಾತುಗಳಿಂದ ವಿವಾದಗಳನ್ನು ಬಗೆಹರಿಸಿ ಎಲ್ಲರನ್ನೂ ಒಟ್ಟಿಗೆ ಕೊಂಡೊಯ್ಯುವ ಸಮಚಿತ್ತ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Moon in balanced Libra, you possess a naturally soothing temperament, seeking harmony in relationships and dissolving tension with graceful tact.`,
      astrologicalBasisKn: `ತುಲಾ ರಾಶಿಯ ಶುಕ್ರ-ಚಂದ್ರ ಸೌಮ್ಯ ಸಮನ್ವಯ.`,
      astrologicalBasisEn: `Moon in Libra ruled by peacemaking Venus.`
    },
    {
      icon: "🛡️",
      badgeKn: "ವೃಶ್ಚಿಕ ಚಂದ್ರ • ಅದಮ್ಯ ಚೇತರಿಕೆ",
      badgeEn: "Scorpio Moon • Resilient Will",
      titleKn: "ಅಂತರಂಗದ ಆಳ, ಅಂತಃಪ್ರಜ್ಞೆಯ ಗ್ರಹಿಕೆ & ಅದಮ್ಯ ಚೇತರಿಕೆ: ನೋವಿನಲ್ಲೂ ಅಲುಗಾಡದ ಸಂಕಲ್ಪ",
      titleEn: "Emotional Depth, Psychological Insight & Resilience: Unshakeable Will",
      bulletKn: `ವೃಶ್ಚಿಕ ರಾಶಿಯ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಶಕ್ತಿಯು ಅಸಾಧಾರಣ ಆಳವನ್ನು ಹೊಂದಿದೆ. ಜೀವನದ ಎಂತಹ ಕಠಿಣ ನೋವುಗಳನ್ನೂ ಅಂತರಂಗದಲ್ಲೇ ಜೀರ್ಣಿಸಿಕೊಂಡು, ಮೌನವಾಗಿಯೇ ಪುಟಿದೆದ್ದು ಗೆಲ್ಲುವ ಅಪ್ರತಿಮ ಚೇತರಿಕೆಯ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Moon in Scorpio, your emotional reserves run extraordinarily deep. You possess fierce psychological resilience, transforming pain into unstoppable personal power.`,
      astrologicalBasisKn: `ವೃಶ್ಚಿಕ ರಾಶಿಯ ಕುಜ-ಕೇತು ಜಲ ತತ್ವ ಹಾಗೂ ಚಂದ್ರನ ಆಂತರಿಕ ಶಕ್ತಿ.`,
      astrologicalBasisEn: `Moon in Scorpio conferring profound transformative inner strength.`
    },
    {
      icon: "☀️",
      badgeKn: "ಧನು ಚಂದ್ರ • ಆಶಾವಾದ & ಶ್ರದ್ಧೆ",
      badgeEn: "Sagittarius Moon • Faith & Optimism",
      titleKn: "ಆಶಾವಾದ, ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆ & ಉನ್ನತ ಮೌಲ್ಯಗಳು: ಕತ್ತಲಲ್ಲೂ ಬೆಳಕು ಕಾಣುವ ಮನೋಬಲ",
      titleEn: "Spiritual Faith, High Ideals & Visionary Cheer: Uplifting Optimism",
      bulletKn: `ಧನು ರಾಶಿಯ ಚಂದ್ರನ ಬಲದಿಂದಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಸಹಜ ಆಶಾವಾದ ಮತ್ತು ದೈವಶ್ರದ್ಧೆ ಮನೆಮಾಡಿದೆ. ಎಷ್ಟೇ ಕತ್ತಲೆಯ ಸಂದರ್ಭ ಬಂದರೂ ಒಳ್ಳೆಯ ದಿನಗಳು ಬರುತ್ತವೆ ಎಂಬ ಅಚಲ ವಿಶ್ವಾಸದಿಂದ ಇತರರಲ್ಲೂ ಉತ್ಸಾಹ ತುಂಬುವ ದಿವ್ಯ ಗುಣ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Moon in Jupiter's sign Sagittarius, you carry an infectious spiritual optimism. Your faith transforms despair into expansive hope and moral clarity.`,
      astrologicalBasisKn: `ಧನು ರಾಶಿಯ ಗುರು-ಚಂದ್ರ ಸಾತ್ವಿಕ ಧರ್ಮ ತತ್ವ.`,
      astrologicalBasisEn: `Moon in Sagittarius ruled by benevolent Jupiter.`
    },
    {
      icon: "⏳",
      badgeKn: "ಮಕರ ಚಂದ್ರ • ಪ್ರಬುದ್ಧ ಸಂಯಮ",
      badgeEn: "Capricorn Moon • Stoic Maturity",
      titleKn: "ಸಂಯಮದ ಹೊಣೆಗಾರಿಕೆ, ತಾಳ್ಮೆ & ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ: ಜವಾಬ್ದಾರಿಯನ್ನು ನಗುನಗುತ್ತಾ ಹೊರಬಲ್ಲ ಶಕ್ತಿ",
      titleEn: "Pragmatic Responsibility, Stoic Patience & Duty: Dependable Rock",
      bulletKn: `ಮಕರ ರಾಶಿಯ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಅಕಾಲಿಕ ಪ್ರಬುದ್ಧತೆ ಮತ್ತು ಸಂಯಮವನ್ನು ಹೊಂದಿದೆ. ಸುಖ-ದುಃಖಗಳಿಗೆ ವಿಚಲಿತರಾಗದೆ, ಕುಟುಂಬದ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಗಟ್ಟಿಯಾಗಿ ಹೊತ್ತು ಮುನ್ನಡೆಸುವ ನಂಬಿಕಾರ್ಹ ವ್ಯಕ್ತಿತ್ವ ನಿಮ್ಮದು.`,
      bulletEn: `Governed by Moon in Saturnian Capricorn, you hold remarkable stoic endurance, carrying responsibilities with patient dignity without seeking pity.`,
      astrologicalBasisKn: `ಮಕರ ರಾಶಿಯ ಶನಿ-ಚಂದ್ರ ಕರ್ಮ ತತ್ವ.`,
      astrologicalBasisEn: `Moon in Capricorn conferring seasoned emotional maturity.`
    },
    {
      icon: "🌌",
      badgeKn: "ಕುಂಭ ಚಂದ್ರ • ವಿಶಾಲ ದೃಷ್ಟಿ",
      badgeEn: "Aquarius Moon • Universal Vision",
      titleKn: "ವಿಶಾಲ ದೃಷ್ಟಿಕೋನ, ಸಾಮುದಾಯಿಕ ಹಿತಾಸಕ್ತಿ & ಹೊಸ ಆಲೋಚನೆಗಳು: ನಿಸ್ವಾರ್ಥ ಮನೋಭಾವ",
      titleEn: "Universal Benevolence, Broadminded Intellect & Altruism: Clear Equanimity",
      bulletKn: `ಕುಂಭ ರಾಶಿಯ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಭಾವನೆಗಳು ಸಂಕುಚಿತವಾಗಿರದೆ, ಸಮಸ್ತ ಮಾನವಕುಲದ ಹಿತವನ್ನು ಬಯಸುವ ವಿಶಾಲತೆಯನ್ನು ಹೊಂದಿವೆ. ಸ್ವಾರ್ಥ ರಹಿತವಾಗಿ ಯೋಚಿಸುವ ಹಾಗೂ ಇತರರಿಗೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ನೆರವಾಗುವ ನಿರ್ಮಲ ಮನಸ್ಸು ನಿಮ್ಮದು.`,
      bulletEn: `With Moon in Aquarius, your emotional focus is objective, generous, and humanitarian, viewing challenges with panoramic clarity and goodwill for all.`,
      astrologicalBasisKn: `ಕುಂಭ ರಾಶಿಯ ಶನಿ-ರಾಹು ವಾಯು ತತ್ವ ಹಾಗೂ ಚಂದ್ರನ ವಿಶಾಲತೆ.`,
      astrologicalBasisEn: `Moon in Aquarius conferring objective, altruistic broadmindedness.`
    },
    {
      icon: "🪷",
      badgeKn: "ಮೀನ ಚಂದ್ರ • ದೈವಿಕ ಕರುಣೆ",
      badgeEn: "Pisces Moon • Divine Compassion",
      titleKn: "ಆಧ್ಯಾತ್ಮಿಕ ಅಂತಃಸ್ಫುರಣೆ, ಕಲ್ಪನಾ ಶಕ್ತಿ & ದೈವಿಕ ಕರುಣೆ: ದೈವ ಸಂಕಲ್ಪಕ್ಕೆ ಶರಣಾಗುವ ಭಕ್ತಿ",
      titleEn: "Mystic Compassion, Intuitive Grace & Surrender: Pure Devotion",
      bulletKn: `ಮೀನ ರಾಶಿಯ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಹೃದಯವು ಅಪಾರ ಕರುಣೆ, ಕಾವ್ಯಮಯ ಕಲ್ಪನೆ ಮತ್ತು ದೈವಿಕ ಭಕ್ತಿಯ ಸಾಗರ. ಇತರರ ನೋವನ್ನು ತನ್ನದೇ ನೋವೆಂದು ಭಾವಿಸಿ ಸ್ಪಂದಿಸುವ ನಿಮ್ಮ ಪವಿತ್ರ ಗುಣವು ನಿಮಗೆ ದೈವ ಕೃಪೆಯನ್ನು ಸದಾ ತಂದುಕೊಡುತ್ತದೆ.`,
      bulletEn: `With Moon in Jupiter's watery sign Pisces, your essence is steeped in mystic empathy, artistic sensitivity, and soulful surrender to divine grace.`,
      astrologicalBasisKn: `ಮೀನ ರಾಶಿಯ ಗುರು-ಚಂದ್ರ ಮೋಕ್ಷ ತತ್ವ.`,
      astrologicalBasisEn: `Moon in Pisces bestowing boundless spiritual compassion.`
    }
  ];

  const moonSignIdx = kundli.moonSign.index;
  const chosenMoonP = moonSignGoodProfiles[moonSignIdx] || moonSignGoodProfiles[0];

  // 5TH LORD INTELLECT PROFILES (Trait 3)
  const fifthLordProfiles: Record<PlanetName, {
    icon: string;
    badgeKn: string;
    badgeEn: string;
    titleKn: string;
    titleEn: string;
    bulletKn: string;
    bulletEn: string;
    astrologicalBasisKn: string;
    astrologicalBasisEn: string;
  }> = {
    [PlanetName.Mercury]: {
      icon: "🧠",
      badgeKn: `5ನೇ ಬುಧ • ${fifthLordKn}`,
      badgeEn: `5th Mercury • ${fifthLord}`,
      titleKn: "ತಾರ್ಕಿಕ ವಿಶ್ಲೇಷಣೆ, ಗಣಿತ-ವಾಣಿಜ್ಯ ಜಾಣ್ಮೆ & ಚತುರ ಸಂವಹನ: ಪ್ರಾಯೋಗಿಕ ಸಮಸ್ಯೆಗಳ ತ್ವರಿತ ಪರಿಹಾರ",
      titleEn: "Analytical Logic, Commercial Acumen & Articulation: Quick Solutions",
      bulletKn: `5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿ ಬುಧನ ಆಧಿಪತ್ಯವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಮೆದುಳು ಲೆಕ್ಕಾಚಾರ, ತರ್ಕ ಮತ್ತು ವಾಣಿಜ್ಯ ವಿಷಯಗಳಲ್ಲಿ ಮಿಂಚಿನಂತೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ಜಟಿಲ ಸವಾಲುಗಳನ್ನು ಸರಳ ಹಂತಗಳಾಗಿ ವಿಂಗಡಿಸಿ, ಪ್ರಾಯೋಗಿಕವಾಗಿ ಬಗೆಹರಿಸುವ ಚಾಣಾಕ್ಷತೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Governed by 5th lord Mercury, your intellect is finely tuned for practical logic, commerce, and problem-solving, turning complex issues into clear steps.`,
      astrologicalBasisKn: `5ನೇ ಬುದ್ಧಿ ಭಾವ ಬುಧನ ತರ್ಕ ಶಕ್ತಿ.`,
      astrologicalBasisEn: `5th house ruled by analytical Mercury.`
    },
    [PlanetName.Jupiter]: {
      icon: "📚",
      badgeKn: `5ನೇ ಗುರು • ${fifthLordKn}`,
      badgeEn: `5th Jupiter • ${fifthLord}`,
      titleKn: "ಉನ್ನತ ವಿವೇಕ, ಧರ್ಮಶಾಸ್ತ್ರ ಗ್ರಹಿಕೆ & ಮಾರ್ಗದರ್ಶನ ಕೌಶಲ್ಯ: ಇತರರಿಗೆ ದಾರಿದೀಪವಾಗುವ ಬುದ್ಧಿ",
      titleEn: "Profound Wisdom, Philosophical Grasp & Mentorship: Guiding Intellect",
      bulletKn: `5ನೇ ಪೂರ್ವಪುಣ್ಯ ಭಾವದಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಆಧಿಪತ್ಯವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಗಂಭೀರ, ಮೌಲ್ಯಾಧಾರಿತ ಮತ್ತು ದೂರದೃಷ್ಟಿಯುಳ್ಳವು. ಇತರರಿಗೆ ಸೂಕ್ತ ಸಲಹೆ ನೀಡಿ ಸನ್ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಸುವ ಸಹಜ ಗುರುತ್ವದ ಕೌಶಲ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With 5th house ruled by Jupiter, your intellect operates with ethical depth, broad perspective, and natural advisory wisdom that inspires others.`,
      astrologicalBasisKn: `5ನೇ ಪೂರ್ವಪುಣ್ಯ ಭಾವ ಗುರುವಿನ ಸಾತ್ವಿಕ ವಿವೇಕ.`,
      astrologicalBasisEn: `5th house ruled by wise Jupiter.`
    },
    [PlanetName.Venus]: {
      icon: "🎨",
      badgeKn: `5ನೇ ಶುಕ್ರ • ${fifthLordKn}`,
      badgeEn: `5th Venus • ${fifthLord}`,
      titleKn: "ಕಲಾತ್ಮಕ ಸೃಜನಶೀಲತೆ, ಕಲ್ಪನಾ ಶಕ್ತಿ & ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ: ನವೀನ ಆವಿಷ್ಕಾರಗಳ ಸೃಷ್ಟಿ",
      titleEn: "Artistic Creativity, Aesthetic Vision & Design Acuity: Innovative Flair",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ಕಲಾಕಾರಕ ಶುಕ್ರನ ಆಧಿಪತ್ಯವಿರುವುದರಿಂದ, ನೀವು ಯಾವುದೇ ಕೆಲಸದಲ್ಲೂ ಸೌಂದರ್ಯ, ನಾವೀನ್ಯತೆ ಹಾಗೂ ಆಕರ್ಷಕ ವಿನ್ಯಾಸವನ್ನು ತರಬಲ್ಲ ಸೃಜನಶೀಲ ಬುದ್ಧಿಶಕ್ತಿಯನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಕಲೆ, ಸಾಹಿತ್ಯ ಅಥವಾ ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಭೆ ಹೊಳೆಯುತ್ತದೆ.`,
      bulletEn: `With 5th house governed by Venus, your intellect excels in creative imagination, aesthetic design, and harmonious innovation, producing refined solutions.`,
      astrologicalBasisKn: `5ನೇ ಬುದ್ಧಿ ಭಾವ ಶುಕ್ರನ ಕಲಾತ್ಮಕ ತತ್ವ.`,
      astrologicalBasisEn: `5th house ruled by aesthetic Venus.`
    },
    [PlanetName.Mars]: {
      icon: "⚙️",
      badgeKn: `5ನೇ ಕುಜ • ${fifthLordKn}`,
      badgeEn: `5th Mars • ${fifthLord}`,
      titleKn: "ತಾಂತ್ರಿಕ ಕುಶಲತೆ, ತ್ವರಿತ ನಿರ್ಧಾರ & ರಕ್ಷಣಾತ್ಮಕ ಕಾರ್ಯತಂತ್ರ: ಬಿಕ್ಕಟ್ಟಿನ ಸಮಯದ ಚಾಣಾಕ್ಷತೆ",
      titleEn: "Technical Mastery, Decisive Execution & Crisis Strategy: Tactical Brilliance",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ಕುಜನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಯಂತ್ರೋಪಕರಣ, ತಂತ್ರಜ್ಞಾನ ಅಥವಾ ತುರ್ತು ಸನ್ನಿವೇಶಗಳಲ್ಲಿ ನಿಮ್ಮ ಬುದ್ಧಿ ಅಸಾಧಾರಣ ವೇಗದಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ಬಿಕ್ಕಟ್ಟು ಎದುರಾದಾಗ ಹಿಂಜರಿಯದೆ ತಕ್ಷಣ ಸರಿಯಾದ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವ ಧೈರ್ಯಶಾಲಿ ಬುದ್ಧಿ ನಿಮ್ಮದು.`,
      bulletEn: `Governed by 5th lord Mars, your mind thrives under crisis pressure, executing decisive tactical responses and commanding technical or strategic challenges.`,
      astrologicalBasisKn: `5ನೇ ಭಾವ ಕುಜನ ತಾಂತ್ರಿಕ ಹಾಗೂ ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಶಕ್ತಿ.`,
      astrologicalBasisEn: `5th house ruled by strategic Mars.`
    },
    [PlanetName.Sun]: {
      icon: "☀️",
      badgeKn: `5ನೇ ಸೂರ್ಯ • ${fifthLordKn}`,
      badgeEn: `5th Sun • ${fifthLord}`,
      titleKn: "ಆಡಳಿತಾತ್ಮಕ ದೂರದರ್ಶಿತ್ವ, ನಾಯಕತ್ವದ ನಿರ್ಧಾರ & ತೇಜಸ್ವಿ ಗ್ರಹಿಕೆ: ಅಧಿಕಾರಯುತ ವಿವೇಕ",
      titleEn: "Executive Vision, Authoritative Leadership & Clear Decision-Making",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ಸೂರ್ಯನ ಆಧಿಪತ್ಯವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಬುದ್ಧಿಯಲ್ಲಿ ಅಧಿಕಾರ, ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಸಂಸ್ಥೆಯನ್ನು ಮುನ್ನಡೆಸುವ ನಾಯಕತ್ವದ ದೃಷ್ಟಿಕೋನವಿದೆ. ಗೊಂದಲಗಳಿಗೆ ಕಿವಿಗೊಡದೆ ಸತ್ಯಾಸತ್ಯತೆಗಳನ್ನು ಗ್ರಹಿಸಿ ದೃಢ ತೀರ್ಪು ನೀಡುವ ಸಾಮರ್ಥ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Sun governing the 5th house, your intellect carries innate executive clarity and command, cutting through ambiguity with authoritative conviction.`,
      astrologicalBasisKn: `5ನೇ ಬುದ್ಧಿ ಭಾವ ಸೂರ್ಯನ ತೇಜೋಗುಣ.`,
      astrologicalBasisEn: `5th house ruled by the radiant Sun.`
    },
    [PlanetName.Saturn]: {
      icon: "🔍",
      badgeKn: `5ನೇ ಶನಿ • ${fifthLordKn}`,
      badgeEn: `5th Saturn • ${fifthLord}`,
      titleKn: "ಆಳವಾದ ಸಂಶೋಧನಾ ಶಕ್ತಿ, ಅಪಾರ ತಾಳ್ಮೆ & ದೀರ್ಘಕಾಲೀನ ಕಾರ್ಯತಂತ್ರ: ಹಂತ-ಹಂತವಾಗಿ ಗುರಿ ಮುಟ್ಟುವ ಶಿಸ್ತು",
      titleEn: "Deep Investigative Focus, Patient Strategy & Enduring Discipline",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ಶನಿಯ ಆಧಿಪತ್ಯವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಬುದ್ಧಿ ಆಳವಾದ ಅಧ್ಯಯನ, ಸಂಶೋಧನೆ ಮತ್ತು ದೀರ್ಘಾವಧಿಯ ಯೋಜನೆಗಳಲ್ಲಿ ಅಪಾರ ಸಾಮರ್ಥ್ಯ ತೋರುತ್ತದೆ. ಮೇಲ್ನೋಟದ ತೀರ್ಮಾನಗಳಿಗೆ ಹೋಗದೆ, ಆಳಕ್ಕೆ ಇಳಿದು ಶಾಶ್ವತ ಪರಿಹಾರ ಕಂಡುಹಿಡಿಯುವ ಶಿಸ್ತು ನಿಮ್ಮದು.`,
      bulletEn: `Governed by Saturn in the 5th house, your mind possesses relentless depth, patient investigative stamina, and structured foresight that masters long-term goals.`,
      astrologicalBasisKn: `5ನೇ ಭಾವ ಶನಿಯ ಆಳವಾದ ಸಂಶೋಧನಾ ತತ್ವ.`,
      astrologicalBasisEn: `5th house ruled by methodical Saturn.`
    },
    [PlanetName.Moon]: {
      icon: "🌊",
      badgeKn: `5ನೇ ಚಂದ್ರ • ${fifthLordKn}`,
      badgeEn: `5th Moon • ${fifthLord}`,
      titleKn: "ಅಂತಃಪ್ರಜ್ಞಾಶಕ್ತಿ, ಮಾನಸಿಕ ಗ್ರಹಿಕೆ & ಭಾವನಾತ್ಮಕ ಜಾಣ್ಮೆ: ಜನರ ಮನಸ್ಸನ್ನು ತಕ್ಷಣ ಓದುವ ಕೌಶಲ್ಯ",
      titleEn: "Intuitive Grasp, Emotional Intelligence & People Reading: Psychological Acuity",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ಚಂದ್ರನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಬುದ್ಧಿಯು ಜನರ ನಾಡಿಮಿಡಿತವನ್ನು ಅರಿಯುವಲ್ಲಿ ಅಪ್ರತಿಮ. ಇತರರ ಭಾವನೆಗಳು, ಅಗತ್ಯಗಳು ಹಾಗೂ ಮುಚ್ಚಿಟ್ಟ ಉದ್ದೇಶಗಳನ್ನು ಕಣ್ಣಿನಲ್ಲೇ ಗ್ರಹಿಸಿ ಸೂಕ್ತವಾಗಿ ವ್ಯವಹರಿಸುವ ಮನೋವೈಜ್ಞಾನಿಕ ಜಾಣ್ಮೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `With Moon governing the 5th house, your intellect possesses profound psychological intelligence, reading people's unspoken feelings and motives with natural empathy.`,
      astrologicalBasisKn: `5ನೇ ಬುದ್ಧಿ ಭಾವ ಚಂದ್ರನ ಅಂತಃಪ್ರಜ್ಞಾ ಶಕ್ತಿ.`,
      astrologicalBasisEn: `5th house ruled by intuitive Moon.`
    },
    [PlanetName.Rahu]: {
      icon: "💡",
      badgeKn: `5ನೇ ರಾಹು • ನವೀನ ತತ್ವ`,
      badgeEn: `5th Rahu • Out-of-Box Thinking`,
      titleKn: "ಸಾಂಪ್ರದಾಯಿಕತೆಯನ್ನು ಮೀರಿದ ನವೀನ ಚಿಂತನೆ & ಆವಿಷ್ಕಾರ: ಹೊಸ ಅವಕಾಶಗಳ ಗ್ರಹಿಕೆ",
      titleEn: "Out-of-the-Box Innovation & Unconventional Genius: Modern Solutions",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ನವೀನ ಗ್ರಹದ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಬುದ್ಧಿ ಸಾಂಪ್ರದಾಯಿಕ ಚೌಕಟ್ಟನ್ನು ಮೀರಿ ವಿಶಿಷ್ಟವಾಗಿ ಯೋಚಿಸುತ್ತದೆ. ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ಹೊಸ ಮಾರ್ಗಗಳನ್ನು ಕಂಡುಕೊಳ್ಳುವ ಸೃಜನಶೀಲ ಪ್ರತಿಭೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Unconventional intellect with out-of-the-box innovative acuity and forward-looking adaptability.`,
      astrologicalBasisKn: `5ನೇ ಭಾವದ ನವೀನ ಚಿಂತನಾ ತತ್ವ.`,
      astrologicalBasisEn: `5th house unconventional intellect.`
    },
    [PlanetName.Ketu]: {
      icon: "🪔",
      badgeKn: `5ನೇ ಕೇತು • ಅತೀಂದ್ರಿಯ ಒಳನೋಟ`,
      badgeEn: `5th Ketu • Mystic Intuition`,
      titleKn: "ಅತೀಂದ್ರಿಯ ಗ್ರಹಿಕೆ, ಸೂಕ್ಷ್ಮ ಸಂಶೋಧನೆ & ಆಧ್ಯಾತ್ಮಿಕ ಒಳನೋಟ: ಗೂಢ ವಿಷಯಗಳ ರಹಸ್ಯ ಭೇದನೆ",
      titleEn: "Mystic Intuition, Esoteric Insight & Abstract Analysis: Deep Subtlety",
      bulletKn: `5ನೇ ಭಾವದಲ್ಲಿ ಕೇತುವಿನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಸಾಮಾನ್ಯರಿಗೆ ಅರ್ಥವಾಗದ ಗೂಢ ವಿಷಯಗಳು, ಆಧ್ಯಾತ್ಮಿಕ ತತ್ವಗಳು ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸತ್ಯಗಳನ್ನು ಸುಲಭವಾಗಿ ಗ್ರಹಿಸುವ ಅತೀಂದ್ರಿಯ ಒಳನೋಟ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: `Esoteric and abstract intellectual depth capable of penetrating subtle truths and spiritual mysteries.`,
      astrologicalBasisKn: `5ನೇ ಭಾವದ ಸೂಕ್ಷ್ಮ ಜ್ಞಾನ ತತ್ವ.`,
      astrologicalBasisEn: `5th house subtle intuitive perception.`
    }
  };

  const chosenFifthP = fifthLordProfiles[fifthLord] || fifthLordProfiles[PlanetName.Mercury];

  // 2ND & 11TH HOUSE WEALTH ELEMENT PROFILES (Trait 4)
  const secondLordSign = (lagnaIdx + 1) % 12;
  const eleventhLordSign = (lagnaIdx + 10) % 12;
  const isEarthWealth = [1, 5, 9].includes(secondLordSign) || [1, 5, 9].includes(eleventhLordSign);
  const isFireWealth = [0, 4, 8].includes(secondLordSign) || [0, 4, 8].includes(eleventhLordSign);
  const isAirWealth = [2, 6, 10].includes(secondLordSign) || [2, 6, 10].includes(eleventhLordSign);

  let trait4: TraitBulletPoint;
  if (isEarthWealth) {
    trait4 = {
      id: 4,
      type: "good",
      titleKn: "ಸ್ಥಿರಾಸ್ತಿ, ವ್ಯಾಪಾರ ಶಿಸ್ತು & ವ್ಯವಸ್ಥಿತ ಸಂಪತ್ತು: ಭದ್ರವಾದ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ ಕಟ್ಟುವ ಕಲೆ",
      titleEn: "Tangible Assets, Commercial Prudence & Steady Wealth: Enduring Security",
      icon: "🏛️",
      badgeKn: `2ನೇ ಧನ & 11ನೇ ಲಾಭ • ಪೃಥ್ವಿ ತತ್ವ (${secondLordKn})`,
      badgeEn: `2nd & 11th Houses • Earth Wealth (${secondLord})`,
      bulletKn: `ನಿಮ್ಮ ಧನಕೋಶದ 2ನೇ ಭಾವ ಮತ್ತು ಲಾಭದ 11ನೇ ಸ್ಥಾನಗಳಲ್ಲಿ ಪೃಥ್ವಿ ತತ್ವದ ಬಲವಿರುವುದರಿಂದ, ನೀವು ಕ್ಷಣಿಕ ಆಕರ್ಷಣೆಗಿಂತ ಸ್ಥಿರವಾದ ಆಸ್ತಿ (ಭೂಮಿ, ಮನೆ, ಬಂಗಾರ, ಠೇವಣಿ) ನಿರ್ಮಿಸುವುದರಲ್ಲಿ ಜಾಣರು. ವ್ಯವಸ್ಥಿತ ಹಣಕಾಸು ಶಿಸ್ತಿನಿಂದ ಹಂತ-ಹಂತವಾಗಿ ದೃಢವಾದ ಸಂಪತ್ತನ್ನು ನಿರ್ಮಿಸುತ್ತೀರಿ.`,
      bulletEn: `Governed by earthy stability in the 2nd and 11th houses, your wealth style focuses on tangible assets, prudent investment, and building lasting financial security.`,
      astrologicalBasisKn: `2ನೇ ಧನ ಸ್ಥಾನ (${secondLordKn}) ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಪೃಥ್ವಿ ತತ್ವ.`,
      astrologicalBasisEn: `2nd and 11th houses grounded in enduring wealth creation.`
    };
  } else if (isFireWealth) {
    trait4 = {
      id: 4,
      type: "good",
      titleKn: "ಸ್ವತಂತ್ರ ಉದ್ಯಮ, ನಾಯಕತ್ವದ ಆದಾಯ & ಆರ್ಥಿಕ ಪುಟಿದೇಳುವಿಕೆ: ಶೂನ್ಯದಿಂದಲೂ ಸಾಮ್ರಾಜ್ಯ ಕಟ್ಟುವ ಶಕ್ತಿ",
      titleEn: "Bold Enterprise, Leadership Earnings & Financial Resilience: Rebuilding Wealth",
      icon: "💰",
      badgeKn: `2ನೇ ಧನ & 11ನೇ ಲಾಭ • ಅಗ್ನಿ ತತ್ವ (${secondLordKn})`,
      badgeEn: `2nd & 11th Houses • Fiery Enterprise (${secondLord})`,
      bulletKn: `ನಿಮ್ಮ ಧನ ಮತ್ತು ಲಾಭ ಸ್ಥಾನಗಳಲ್ಲಿ ಅಗ್ನಿ ತತ್ವದ ನಾಯಕತ್ವವಿರುವುದರಿಂದ, ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ಸ್ವತಂತ್ರ ವ್ಯಾಪಾರ-ವ್ಯವಹಾರದಿಂದ ಭಾರಿ ಸಂಪಾದನೆ ಮಾಡುವ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ. ಆರ್ಥಿಕವಾಗಿ ಎಷ್ಟೇ ಏರಿಳಿತಗಳು ಬಂದರೂ, ಶೂನ್ಯದಿಂದ ಪುನಃ ಸಾಮ್ರಾಜ್ಯ ಕಟ್ಟಿ ನಿಲ್ಲಿಸುವ ಅದ್ಭುತ ಚೇತರಿಕೆ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ.`,
      bulletEn: `Governed by fiery initiative across 2nd and 11th houses, your income thrives through independent enterprise and bold vision, capable of rebuilding fortune from any setback.`,
      astrologicalBasisKn: `2ನೇ ಧನಕೋಶದ ${secondLordKn} ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಸಾಹಸ ಬಲ.`,
      astrologicalBasisEn: `2nd and 11th houses aligned with dynamic enterprise.`
    };
  } else if (isAirWealth) {
    trait4 = {
      id: 4,
      type: "good",
      titleKn: "ತಂತ್ರಜ್ಞಾನ, ಸಲಹಾ ವಾಣಿಜ್ಯ & ಬೌದ್ಧಿಕ ಸಂಪಾದನೆ: ವಿಸ್ತಾರವಾದ ಸಂಪರ್ಕ ಜಾಲದ ಮೂಲಕ ಧನಯೋಗ",
      titleEn: "Intellectual Enterprise, Consulting & Commercial Networks: Dynamic Inflow",
      icon: "🌐",
      badgeKn: `2ನೇ ಧನ & 11ನೇ ಲಾಭ • ವಾಯು ತತ್ವ (${secondLordKn})`,
      badgeEn: `2nd & 11th Houses • Networked Wealth (${secondLord})`,
      bulletKn: `ನಿಮ್ಮ ಧನ ಮತ್ತು ಲಾಭ ಭಾವಗಳಲ್ಲಿ ವಾಯು ತತ್ವದ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಸಂಪಾದನೆಯು ಕೇವಲ ಶಾರೀರಿಕ ಶ್ರಮಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ಬುದ್ಧಿಮತ್ತೆ, ತಂತ್ರಜ್ಞಾನ, ಸಂವಹನ, ಸಲಹಾ ವೃತ್ತಿ ಅಥವಾ ವಿಸ್ತಾರವಾದ ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ ಜಾಲದ ಮೂಲಕ ಸಮೃದ್ಧವಾಗಿ ಹರಿದುಬರುತ್ತದೆ.`,
      bulletEn: `Governed by airy intellect and communication networks in the 2nd and 11th houses, your prosperity flows through consultancy, technology, and widespread professional alliances.`,
      astrologicalBasisKn: `2ನೇ ಧನ ಸ್ಥಾನ (${secondLordKn}) ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ವಾಯು ತತ್ವ.`,
      astrologicalBasisEn: `2nd and 11th houses empowered by intellectual commerce.`
    };
  } else {
    trait4 = {
      id: 4,
      type: "good",
      titleKn: "ಸೃಜನಶೀಲ ಮಾಧ್ಯಮ, ವಿದೇಶಿ ವಿನಿಮಯ & ದೈವಬಲದ ಸಂಪತ್ತು: ನಿರಂತರ ಹರಿದುಬರುವ ಧನಲಕ್ಷ್ಮಿ ಕೃಪೆ",
      titleEn: "Creative Enterprise, Distant Commerce & Grace-Driven Wealth: Fluid Inflow",
      icon: "🌊",
      badgeKn: `2ನೇ ಧನ & 11ನೇ ಲಾಭ • ಜಲ ತತ್ವ (${secondLordKn})`,
      badgeEn: `2nd & 11th Houses • Fluid Wealth (${secondLord})`,
      bulletKn: `ನಿಮ್ಮ ಧನ ಮತ್ತು ಲಾಭ ಸ್ಥಾನಗಳಲ್ಲಿ ಜಲ ತತ್ವದ ಬಲವಿರುವುದರಿಂದ, ದೂರದ ಊರುಗಳು, ವಿದೇಶಿ ವಿನಿಮಯ, ಆತಿಥ್ಯ, ಸೇವಾ ಕ್ಷೇತ್ರ ಅಥವಾ ಸೃಜನಶೀಲ ಕೌಶಲ್ಯಗಳ ಮೂಲಕ ಧನ ಸಂಪತ್ತು ಹರಿದುಬರುತ್ತದೆ. ದೈವಾನುಗ್ರಹದಿಂದ ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲೂ ಆರ್ಥಿಕ ದಾರಿಗಳು ತಾವಾಗಿಯೇ ತೆರೆದುಕೊಳ್ಳುತ್ತವೆ.`,
      bulletEn: `Governed by fluid water signs in the 2nd and 11th houses, wealth flows through distant connections, creative services, and divine grace that opens doors during crises.`,
      astrologicalBasisKn: `2ನೇ ಧನ ಸ್ಥಾನ (${secondLordKn}) ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದ ಜಲ ತತ್ವ.`,
      astrologicalBasisEn: `2nd and 11th houses supported by fluid prosperity.`
    };
  }

  // 9TH HOUSE DHARMA & GENDER-TAILORED PROFILE (Trait 5)
  let trait5: TraitBulletPoint;
  if (!isMale) {
    trait5 = {
      id: 5,
      type: "good",
      titleKn: "ಸ್ತ್ರೀ ಸಹಜ ಧೀಮಂತಿಕೆ, ಗೃಹಲಕ್ಷ್ಮಿ ಸೌಭಾಗ್ಯ & ಸಾತ್ವಿಕ ಸತ್ಚಾರಿತ್ರ್ಯ: ಕುಟುಂಬಕ್ಕೆ ದೈವಿಕ ಆಸರೆ",
      titleEn: "Womanly Grace, Domestic Auspiciousness & Moral Fortitude: Sacred Pillar",
      icon: "🪔",
      badgeKn: "ಗೃಹಲಕ್ಷ್ಮಿ ಸೌಭಾಗ್ಯ • 9ನೇ ಧರ್ಮ",
      badgeEn: "Gruhalakshmi Grace • 9th Dharma",
      bulletKn: `ಮಹಿಳೆಯಾಗಿ ನಿಮ್ಮಲ್ಲಿರುವ ಸಹಜ ಗೃಹಲಕ್ಷ್ಮಿ ಕಳೆ, ಪಾವಿತ್ರ್ಯ ಮತ್ತು ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರವು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ದೊಡ್ಡ ರಕ್ಷಾ ಕವಚ. ಎಂತಹ ಕಷ್ಟದ ಸನ್ನಿವೇಶದಲ್ಲೂ ಧೃತಿಗೆಡದೆ, ತಾಳ್ಮೆಯಿಂದ ಮನೆಯ ನೆಮ್ಮದಿಯನ್ನು ಕಾಪಾಡುವ ಅದ್ಭುತ ಸಹನೆ ನಿಮ್ಮಲ್ಲಿದೆ. ನಿಮ್ಮ ಸತ್ಯ ನಡೆ ಮತ್ತು ಕುಲದೇವರ ಮೇಲಿನ ಅಚಲ ಭಕ್ತಿಯು ನಿಮ್ಮನ್ನು ಸಕಲ ಆಪತ್ತುಗಳಿಂದ ಕಾಪಾಡುತ್ತದೆ.`,
      bulletEn: `As an auspicious pillar of domestic grace, your moral integrity and spiritual patience create a sacred sanctuary for your family. Divine Mother's blessings shield you from adversity.`,
      astrologicalBasisKn: `9ನೇ ಧರ್ಮ-ಭಾಗ್ಯ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರ-ಗುರುಗಳ ಸಾತ್ವಿಕ ಸ್ತ್ರೀ ಕಾರಕತ್ವ.`,
      astrologicalBasisEn: `9th house of dharma and Jupiter-Venus benefic feminine auspices.`
    };
  } else {
    trait5 = {
      id: 5,
      type: "good",
      titleKn: "ಕುಟುಂಬ ರಕ್ಷಣಾ ಧರ್ಮ, ನಂಬಿಕಾರ್ಹತೆ & ಪೂರ್ವಪುಣ್ಯ ಶ್ರೀರಕ್ಷೆ: ಆಪ್ತರ ಬದುಕಿಗೆ ಗಟ್ಟಿ ಆಸರೆ",
      titleEn: "Protective Duty, Trustworthiness & Ancestral Shield: Rock of Support",
      icon: "🛡️",
      badgeKn: "ಕುಟುಂಬ ರಕ್ಷಣಾ ಧರ್ಮ • 9ನೇ ಭಾಗ್ಯ",
      badgeEn: "Protective Dharma • 9th Fortune",
      bulletKn: `ಕುಟುಂಬದ ಹಿತ ಮತ್ತು ಆಪ್ತರ ರಕ್ಷಣೆಗೆ ಬೆನ್ನೆಲುಬಾಗಿ ನಿಲ್ಲುವ ಧರ್ಮ ಪ್ರಜ್ಞೆ ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ಮಾತಿಗೆ ತಪ್ಪದ ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ನಂಬಿಕಾರ್ಹತೆಯಿಂದ ಗೌರವ ಸಂಪಾದಿಸುತ್ತೀರಿ. ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಮತ್ತು ಕುಲದೇವರ ಕೃಪೆಯು ಅತ್ಯಂತ ಇಕ್ಕಟ್ಟಿನ ಕ್ಷಣಗಳಲ್ಲೂ ಅದೃಶ್ಯ ರಕ್ಷಾಕವಚದಂತೆ ನಿಮ್ಮನ್ನು ಅಪಾಯಗಳಿಂದ ಪಾರುಮಾಡುತ್ತದೆ.`,
      bulletEn: `Embodying the protective masculine archetype, you serve as a dependable rock of security for your family. Honoring your word and ancestral traditions ensures divine protection at critical turns.`,
      astrologicalBasisKn: `9ನೇ ಧರ್ಮ-ಭಾಗ್ಯ ಸ್ಥಾನ ಹಾಗೂ ಸೂರ್ಯ-ಗುರು ದೈವಿಕ ರಕ್ಷಾ ಕವಚ.`,
      astrologicalBasisEn: `9th house of fortune and Jupiter-Sun ancestral protection.`
    };
  }

  const adultGoodTraits: TraitBulletPoint[] = [
    {
      id: 1,
      type: "good",
      titleKn: chosenLagnaP.titleKn,
      titleEn: chosenLagnaP.titleEn,
      icon: chosenLagnaP.icon,
      badgeKn: chosenLagnaP.badgeKn,
      badgeEn: chosenLagnaP.badgeEn,
      bulletKn: chosenLagnaP.bulletKn,
      bulletEn: chosenLagnaP.bulletEn,
      astrologicalBasisKn: chosenLagnaP.astrologicalBasisKn,
      astrologicalBasisEn: chosenLagnaP.astrologicalBasisEn
    },
    {
      id: 2,
      type: "good",
      titleKn: chosenMoonP.titleKn,
      titleEn: chosenMoonP.titleEn,
      icon: chosenMoonP.icon,
      badgeKn: chosenMoonP.badgeKn,
      badgeEn: chosenMoonP.badgeEn,
      bulletKn: chosenMoonP.bulletKn,
      bulletEn: chosenMoonP.bulletEn,
      astrologicalBasisKn: chosenMoonP.astrologicalBasisKn,
      astrologicalBasisEn: chosenMoonP.astrologicalBasisEn
    },
    {
      id: 3,
      type: "good",
      titleKn: chosenFifthP.titleKn,
      titleEn: chosenFifthP.titleEn,
      icon: chosenFifthP.icon,
      badgeKn: chosenFifthP.badgeKn,
      badgeEn: chosenFifthP.badgeEn,
      bulletKn: chosenFifthP.bulletKn,
      bulletEn: chosenFifthP.bulletEn,
      astrologicalBasisKn: chosenFifthP.astrologicalBasisKn,
      astrologicalBasisEn: chosenFifthP.astrologicalBasisEn
    },
    trait4,
    trait5
  ];

  // =========================================================================
  // ADULT BAD TRAITS & SHADOW TENDENCIES (7 traits, 100% Dynamic & Calibrated)
  // =========================================================================

  // 1. ANGER, EGO & STUBBORNNESS EVALUATION
  const marsHouse = mars?.house ?? 1;
  const isFierySign = [0, 4, 8].includes(lagnaIdx);
  const isEarthySign = [1, 5, 9].includes(lagnaIdx);
  const isAirySign = [2, 6, 10].includes(lagnaIdx);
  const isWaterySign = [3, 7, 11].includes(lagnaIdx);

  const hasDirectMarsAffliction = [1, 7, 8].includes(marsHouse) || (mars && sun && Math.abs(mars.house - sun.house) === 0);
  const hasSaturnAffliction = saturn && [1, 7, 8].includes(saturn.house);

  let badTrait1: TraitBulletPoint;
  if (marsHouse === 8) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಅಷ್ಟಮ ಕುಜ ದೋಷ & ಆಂತರಿಕ ಉದ್ವೇಗ: ಹಠಾತ್ ಆವೇಶದಲ್ಲಿ ಸಂಬಂಧಗಳಿಗೆ ಧಕ್ಕೆ",
      titleEn: "8th House Mars & Volatile Reactivity: Sudden Inner Agitation",
      icon: "⚡",
      badgeKn: "ಅಷ್ಟಮ ಕುಜ • ಆಂತರಿಕ ಉದ್ವೇಗ",
      badgeEn: "8th Mars • Volatile Reactivity",
      bulletKn: isMale
        ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 8ನೇ ಅಷ್ಟಮ ಸ್ಥಾನದಲ್ಲಿ ಕುಜನ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಮನಸ್ಸಿನಲ್ಲಿ ಹಠಾತ್ ಆಂತರಿಕ ಉದ್ವೇಗ ಹಾಗೂ ಅಸಹನೆ ಮೂಡುತ್ತದೆ. ಒಮ್ಮೆ ಸಿಟ್ಟು ಬಂದರೆ ಕಟು ಮಾತುಗಳನ್ನಾಡಿ ಹತ್ತಿರದವರನ್ನು ನೋಯಿಸುವ ಮತ್ತು ನಂತರ ಪಶ್ಚಾತ್ತಾಪ ಪಡುವ ಪ್ರವೃತ್ತಿ ಇದೆ; ನಿತ್ಯ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ನರಸಿಂಹ ಸ್ಮರಣೆ ನಿಮಗೆ ಶಾಂತಿ ತರಲಿದೆ.`
        : `8ನೇ ಅಷ್ಟಮ ಸ್ಥಾನದ ಕುಜನ ಪ್ರಭಾವದಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ಅಸಹನೆ ಮತ್ತು ಹಠಾತ್ ಆವೇಶ ಭುಗಿಲೇಳುತ್ತದೆ. ಕುಟುಂಬದಲ್ಲಿ ನಿಮ್ಮ ಮಾತಿಗೆ ಸ್ಪಂದನೆ ಸಿಗದಿದ್ದಾಗ ತೀವ್ರ ಅಸಮಾಧಾನ ಮತ್ತು ಮುನಿಸು ಉಂಟಾಗುತ್ತದೆ; ಶಾಂತ ಸಂಯಮ ಮತ್ತು ದುರ್ಗಾ ಪೂಜೆಯೇ ನಿಮಗೆ ಶ್ರೇಷ್ಠ ರಕ್ಷೆ.`,
      bulletEn: "Mars residing in the 8th house creates sudden inner volatility and acute impatience, occasionally provoking sharp reactions during periods of high stress.",
      astrologicalBasisKn: "8ನೇ ಅಷ್ಟಮ ಭಾವದಲ್ಲಿ ಕುಜನ ಸ್ಥಿತಿ (ಕುಜ ದೋಷ).",
      astrologicalBasisEn: "Mars located in the 8th house of emotional turbulence."
    };
  } else if (marsHouse === 7) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಸಪ್ತಮ ಕುಜ ದೋಷ & ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಹಠ: ದಾಂಪತ್ಯದಲ್ಲಿ ಅಹಂಕಾರದ ಘರ್ಷಣೆ",
      titleEn: "7th House Mars & Partnership Friction: Unyielding Stance",
      icon: "⚔️",
      badgeKn: "ಸಪ್ತಮ ಕುಜ • ದಾಂಪತ್ಯ ಹಠ",
      badgeEn: "7th Mars • Partnership Friction",
      bulletKn: isMale
        ? `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕುಜನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ದಾಂಪತ್ಯ ವಿಷಯಗಳಲ್ಲಿ ಅನಗತ್ಯ ಹಠ ಹಾಗೂ ತನ್ನದೇ ಮಾತೇ ನಡೆಯಬೇಕೆಂಬ ಪಟ್ಟು ಹಿಡಿಯುವ ಪ್ರವೃತ್ತಿ ಇದೆ. ಪರಸ್ಪರ ಗೌರವದಿಂದ ನಡೆದುಕೊಂಡರೆ ಸಾಮರಸ್ಯ ನೆಲೆಸುತ್ತದೆ.`
        : `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕುಜನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಸಂಬಂಧಗಳಲ್ಲಿ ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಅಹಂಕಾರದ ಘರ್ಷಣೆ ಅಥವಾ ಹಠದ ನಡವಳಿಕೆ ಮೂಡುವ ಅಪಾಯವಿದೆ; ಹೊಂದಾಣಿಕೆಯ ಮನೋಭಾವವೇ ನಿಮಗೆ ಬಲ.`,
      bulletEn: "Mars in the 7th house triggers sharp reactive friction and dominance struggles in close partnerships, requiring conscious flexibility.",
      astrologicalBasisKn: "7ನೇ ಕಳತ್ರ ಭಾವದಲ್ಲಿ ಕುಜನ ಪ್ರಭಾವ.",
      astrologicalBasisEn: "7th house Mars placement in relationship axis."
    };
  } else if (marsHouse === 1 || (mars && sun && Math.abs(mars.house - sun.house) === 0)) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಲಗ್ನ ಕುಜ-ರವಿ ದೋಷ & ಉಗ್ರ ಸಿಟ್ಟು: ಯಾರಿಗೂ ಮಣಿಯದ ಅಪ್ರತಿಮ ಹಠ",
      titleEn: "Lagna Mars-Sun Fire & Dominant Ego: Fiery Volatility",
      icon: "🔥",
      badgeKn: "ಲಗ್ನ ಕುಜ-ರವಿ • ತೀಕ್ಷ್ಣ ಕೋಪ",
      badgeEn: "Lagna Mars-Sun • Fierce Anger",
      bulletKn: isMale
        ? `ಲಗ್ನದ ಮೇಲೆ ಕುಜ-ರವಿಗಳ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವದಿಂದಾಗಿ ಒಮ್ಮೆ ಒಂದು ನಿರ್ಧಾರ ಕೈಗೊಂಡರೆ ಇತರರು ಎಷ್ಟು ಬುದ್ಧಿವಾದ ಹೇಳಿದರೂ ಕೇಳದ ಹಠಮಾರಿ ಸ್ವಭಾವವಿದೆ. ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಸಣ್ಣ ಧಕ್ಕೆ ಬಂದರೂ ಹಠಾತ್ ಸಿಟ್ಟು ಭುಗಿಲೆದ್ದು ಕಟು ಮಾತುಗಳನ್ನಾಡಿ ಹತ್ತಿರದವರನ್ನು ದೂರ ಮಾಡಿಕೊಳ್ಳುವ ಅಪಾಯವಿದೆ.`
        : `ಲಗ್ನದ ಮೇಲೆ ಕುಜ-ರವಿಗಳ ತೇಜಸ್ಸಿನಿಂದಾಗಿ, ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಸಣ್ಣ ಧಕ್ಕೆ ಬಂದರೂ ಹಠಾತ್ ಆವೇಶ ಭುಗಿಲೇಳುತ್ತದೆ. ಸಿಟ್ಟಿನಲ್ಲಿ ಕಟು ಮಾತುಗಳನ್ನಾಡಿ ನಂತರ ಪಶ್ಚಾತ್ತಾಪ ಪಡುವ ಸ್ವಭಾವವಿದೆ; ಶಾಂತ ಸಂಯಮವೇ ನಿಮಗೆ ಶ್ರೇಷ್ಠ ರಕ್ಷೆ.`,
      bulletEn: "Intense Mars-Sun fiery influence on the ascendant triggers stubborn refusal to compromise once resolved, accompanied by abrupt fiery outbursts.",
      astrologicalBasisKn: "ಲಗ್ನದಲ್ಲಿ ಕುಜ-ರವಿಗಳ ಅಗ್ನಿ ತತ್ವ ಹಾಗೂ ಪಿತ್ತ ಪ್ರಕೋಪ.",
      astrologicalBasisEn: "Martial/Solar fire aspect influencing the ascendant directly."
    };
  } else if (isFierySign) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಅಗ್ನಿ ತತ್ವದ ಹಠಮಾರಿತನ & ಹಠಾತ್ ಕೋಪದ ಜ್ವಾಲೆ: ಸಿಟ್ಟಿನಲ್ಲಿ ಸಂಬಂಧ ಕಡಿದುಕೊಳ್ಳುವ ಅಪಾಯ",
      titleEn: "Fiery Ascendant Temper & Impulsive Anger: Risk to Trusted Alliances",
      icon: "🔥",
      badgeKn: "ಅಗ್ನಿ ತತ್ವ • ಪಿತ್ತ ಪ್ರಕೋಪ",
      badgeEn: "Fiery Ascendant • Pitta Flare",
      bulletKn: isMale
        ? `ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನದ ಅಗ್ನಿ ತತ್ವದಿಂದಾಗಿ, ಸಿಟ್ಟು ಬಂದಾಗ ಕ್ಷಿಪ್ರವಾಗಿ ಭುಗಿಲೆದ್ದು ನೇರ ನಿಷ್ಠುರ ಮಾತುಗಳನ್ನಾಡುವ ಪ್ರವೃತ್ತಿ ಇದೆ. ತಕ್ಷಣವೇ ತಣ್ಣಗಾದರೂ, ಸಿಟ್ಟಿನಲ್ಲಿ ಆಡಿದ ಮಾತುಗಳು ಆಪ್ತರ ಮನಸ್ಸಿಗೆ ತಾಗದಂತೆ ಎಚ್ಚರವಿರಲಿ.`
        : `ಲಗ್ನದ ಅಗ್ನಿ ತತ್ವದ ಪ್ರಭಾವದಿಂದಾಗಿ, ಅನ್ಯಾಯ ಅಥವಾ ಉಪೇಕ್ಷೆಯನ್ನು ಸಹಿಸದೆ ಹಠಾತ್ ಆವೇಶ ತೋರುವ ಸ್ವಭಾವವಿದೆ; ತಾಳ್ಮೆಯ ಮಾತುಗಳು ನಿಮ್ಮ ಕುಟುಂಬದ ಗೌರವವನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.`,
      bulletEn: "Fiery ascendant energy creates sudden surges of anger over perceived injustice or disrespect, though tempers cool just as swiftly.",
      astrologicalBasisKn: "ಲಗ್ನದ ಅಗ್ನಿ ತತ್ವದ ನೇರ ಪ್ರಭಾವ.",
      astrologicalBasisEn: "Fiery ascendant element triggering sudden temper flare-ups."
    };
  } else if (hasSaturnAffliction || isEarthySign) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಮೌನ ಹಠಮಾರಿತನ & ಗಂಭೀರ ಅಸಹನೆ: ಸಮಾಧಾನವಾಗದ ಒಳಗಿನ ಮುನಿಸು",
      titleEn: "Silent Stubbornness & Stoic Resentment: Prolonged Grudges",
      icon: "🗿",
      badgeKn: "ಶನಿ/ಪೃಥ್ವಿ ತತ್ವ • ಮೌನ ಪ್ರತಿರೋಧ",
      badgeEn: "Saturn/Earth Element • Stoic Resistance",
      bulletKn: `ಪೃಥ್ವಿ ತತ್ವ ಮತ್ತು ಶನಿಯ ಪ್ರಭಾವದಿಂದಾಗಿ, ನೀವು ಬಹಿರಂಗವಾಗಿ ಕಿರುಚಾಡಿ ಜಗಳ ಮಾಡುವುದಿಲ್ಲ; ಆದರೆ ತೀವ್ರ ಮೌನ, ಮುನಿಸು ಹಾಗೂ ಹಠದ ಮೂಲಕ ಅಸಮಾಧಾನ ಹೊರಹಾಕುತ್ತೀರಿ. ಒಮ್ಮೆ ಯಾರ ಮೇಲಾದರೂ ಮನಸ್ಸು ಮುರಿದರೆ ಸುಲಭವಾಗಿ ಕ್ಷಮಿಸದೆ ತಿಂಗಳುಗಟ್ಟಲೆ ಅಂತರ ಕಾಯ್ದುಕೊಳ್ಳುವ ಗಂಭೀರ ಹಠಮಾರಿತನ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: "Earthy Saturnian disposition leads to unyielding passive resistance, holding onto quiet grudges and withdrawing communication rather than expressing explosive anger.",
      astrologicalBasisKn: "ಶನಿಯ ದೃಷ್ಟಿ ಹಾಗೂ ಪೃಥ್ವಿ ತತ್ವದ ಸ್ಥಿರ ಹಠ.",
      astrologicalBasisEn: "Saturnian cold aspect conferring unyielding stubborn resistance."
    };
  } else if (isAirySign || (mercury && rahu && Math.abs(mercury.house - rahu.house) === 0)) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ತೀಕ್ಷ್ಣ ವಾದ-ವಿವಾದ & ವ್ಯಂಗ್ಯದ ಮಾತುಗಳು: ಮಾತಿನಲ್ಲೇ ಮನಸ್ಸಿಗೆ ಘಾಸಿ ಮಾಡುವ ಅಪಾಯ",
      titleEn: "Sharp Sarcasm & Relentless Argumentation: Verbal Discord",
      icon: "⚡",
      badgeKn: "ಬುಧ-ರಾಹು ವಾಯು ತತ್ವ • ವಾಕ್ ತೀಕ್ಷ್ಣತೆ",
      badgeEn: "Mercury-Rahu Air Element • Incisive Tongue",
      bulletKn: `ಬುಧ-ರಾಹುವಿನ ವಾಯು ತತ್ವದ ಪ್ರಭಾವದಿಂದಾಗಿ, ಕೋಪ ಬಂದಾಗ ಶಾರೀರಿಕ ಆಕ್ರೋಶಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ತೀಕ್ಷ್ಣ ವ್ಯಂಗ್ಯದ ಮಾತುಗಳಿಂದ ಎದುರಾಳಿಯ ಮರ್ಮಕ್ಕೆ ತಿವಿಯುವ ಪ್ರವೃತ್ತಿ ಇದೆ. ತಾರ್ಕಿಕವಾಗಿ ವಾದ ಗೆಲ್ಲುವ ಭರದಲ್ಲಿ ಆಪ್ತರ ಭಾವನೆಗಳಿಗೆ ಘಾಸಿ ಮಾಡದಂತೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು.`,
      bulletEn: "Airy intellectual friction channels anger through cutting verbal sarcasm and unyielding debate, risking emotional hurt to family and colleagues.",
      astrologicalBasisKn: "ಬುಧ-ರಾಹುಗಳ ವಾಯು ತತ್ವ ಹಾಗೂ ವಾಕ್ ಸ್ಥಾನದ ತೀಕ್ಷ್ಣತೆ.",
      astrologicalBasisEn: "Mercurial airy argumentation amplifying verbal friction."
    };
  } else if (isWaterySign || (moon && mars && Math.abs(moon.house - mars.house) === 0)) {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಒಳಮುಖ ಮುನಿಸು & ಭಾವನಾತ್ಮಕ ನಿಷ್ಠುರತೆ: ಸಣ್ಣ ವಿಷಯಕ್ಕೂ ಮನಸ್ಸು ಮುರಿಯುವಿಕೆ",
      titleEn: "Emotional Sulking & Sensitive Withdrawal: Hurtful Rumination",
      icon: "🌧️",
      badgeKn: "ಜಲ ತತ್ವ • ಭಾವನಾತ್ಮಕ ಮುನಿಸು",
      badgeEn: "Water Element • Emotional Sulking",
      bulletKn: `ಜಲ ತತ್ವದ ಸಂವೇದನೆಯಿಂದಾಗಿ, ಯಾರಾದರೂ ಸಣ್ಣ ಕಹಿ ಮಾತುಗಳನ್ನಾಡಿದರೂ ಮನಸ್ಸಿಗೆ ಆಳವಾಗಿ ತಗುಲಿ ಊಟ ಬಿಡುವುದು, ಒಂಟಿಯಾಗಿ ಕೊರಗುವುದು ಅಥವಾ ಭಾವನಾತ್ಮಕವಾಗಿ ಕಠಿಣರಾಗುವ ಪ್ರವೃತ್ತಿ ಕಾಣಿಸುತ್ತದೆ. ನೋವನ್ನು ಮುಕ್ತವಾಗಿ ವ್ಯಕ್ತಪಡಿಸಿ ಹಗುರವಾಗುವುದು ಅಗತ್ಯ.`,
      bulletEn: "Water sign sensitivity creates recurring cycles of silent sulking, brooding in isolation, and nursing emotional hurt over perceived slights.",
      astrologicalBasisKn: "ಜಲ ತತ್ವದ ಚಂದ್ರ-ಕುಜರ ಭಾವನಾತ್ಮಕ ಸಂವೇದನೆ.",
      astrologicalBasisEn: "Water element Moon-Mars sensitivity causing emotional brooding."
    };
  } else {
    badTrait1 = {
      id: 1,
      type: "bad",
      titleKn: "ಸಂಯಮದ ವಿವೇಚನೆ & ಶಾಂತ ನಡೆ: ಸಮಚಿತ್ತದ ಧೀಮಂತ ನಡವಳಿಕೆ",
      titleEn: "Measured Patience & Composure: Balanced Emotional Fortitude",
      icon: "🕊️",
      badgeKn: "ಸೌಮ್ಯ ಗ್ರಹ ದೃಷ್ಟಿ • ಶಾಂತ ಮನೋಭಾವ",
      badgeEn: "Benefic Aspect • Composed Mind",
      bulletKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕುಜ-ರವಿಗಳ ಉಗ್ರ ದೋಷವಿಲ್ಲದಿರುವುದರಿಂದ, ನೀವು ಸಹಜವಾಗಿ ಸಂಯಮ ಮತ್ತು ಶಾಂತ ಸ್ವಭಾವವನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಅನಗತ್ಯ ಕೋಪಕ್ಕೆ ಆಸ್ಪದ ನೀಡದೆ ತಾಳ್ಮೆಯಿಂದ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುವ ವಿವೇಕ ನಿಮ್ಮಲ್ಲಿದೆ; ಆದರೂ ನಿಮ್ಮ ಮೃದು ಸ್ವಭಾವವನ್ನು ಇತರರು ದುರುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳದಂತೆ ಎಚ್ಚರವಿರಲಿ.`,
      bulletEn: "Benefic alignment shields your chart from destructive anger, endowing you with measured patience and emotional composure; stay vigilant only to ensure others do not exploit your gentle nature.",
      astrologicalBasisKn: "ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಹಾಗೂ ಶಾಂತ ತತ್ವ.",
      astrologicalBasisEn: "Benefic aspect moderating aggressive impulse."
    };
  }

  // 2. SENSUAL DESIRES, GENDER AFFINITY & MARITAL DYNAMICS (Strictly Calibrated)
  const diet = detectNativeDietAndAddiction(kundli);
  const sensual = detectNativeSensualAndFidelity(kundli);

  const venusH = venus?.house ?? 1;
  const venusSign = venus?.rashi.index ?? 0;
  const neuterSigns = [2, 5, 10]; // Gemini, Virgo, Aquarius

  const hasSameGenderAffinity = (
    (venus && mercury && Math.abs(venus.house - mercury.house) === 0 && (saturn?.house === 7 || saturn?.house === 8 || rahu?.house === 7 || ketu?.house === 7)) ||
    (venus && [7, 8].includes(venusH) && mercury && [7, 8].includes(mercury.house) && neuterSigns.includes(venusSign)) ||
    (ketu && [7, 8].includes(ketu.house) && mercury && [7, 8].includes(mercury.house) && venus && [saturn, ketu].some(p => p && Math.abs(p.house - venus.house) === 0))
  );

  let badTrait2: TraitBulletPoint;
  if (hasSameGenderAffinity) {
    badTrait2 = {
      id: 2,
      type: "bad",
      titleKn: `ಕಾಮನೆ & ಆಕರ್ಷಣೆಯ ನೈಜತೆ: ${isMale ? "ಪುರುಷರತ್ತ" : "ಮಹಿಳೆಯರತ್ತ"} ವಿಶಿಷ್ಟ ಆಕರ್ಷಣೆ & ಅಂತರಂಗದ ಸೆಳೆತ`,
      titleEn: `Sexual Attraction & Core Desire: ${isMale ? "Same-Gender Male" : "Same-Gender Female"} Affinity`,
      icon: "🌈",
      badgeKn: "7ನೇ/8ನೇ ಬುಧ-ಶನಿ • ವಿಶಿಷ್ಟ ಕಾಮನೆ",
      badgeEn: "Mercury-Saturn 7th/8th • Unconventional",
      bulletKn: `ನಿಮ್ಮ ಜಾತಕದ 7ನೇ (ಕಾಮ) ಮತ್ತು 8ನೇ (ರಹಸ್ಯ) ಸ್ಥಾನಗಳ ಮೇಲೆ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ವಿಶೇಷ ತತ್ವವಿರುವುದರಿಂದ, ನಿಮ್ಮ ಅಂತರಂಗದ ಲೈಂಗಿಕ ಆಕರ್ಷಣೆ ಮತ್ತು ಕಾಮನೆಯು ${isMale ? "ಪುರುಷರ ಕಡೆಗೆ (Same-Gender Affinity)" : "ಮಹಿಳೆಯರ ಕಡೆಗೆ"} ವಿಶಿಷ್ಟವಾಗಿ ಸೆಳೆಯುವ ಪ್ರಬಲ ಲಕ್ಷಣಗಳಿವೆ. ಸಮಾಜದ ಸಾಂಪ್ರದಾಯಿಕ ನಿರೀಕ್ಷೆಗಳ ನಡುವೆ ಈ ಆಕರ್ಷಣೆಯನ್ನು ಅತ್ಯಂತ ಗುಪ್ತವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಇದೆ.`,
      bulletEn: `Vedic configurations in the 7th and 8th houses influenced by Mercury and Saturn reveal an authentic internal attraction toward ${isMale ? "men (same-gender orientation)" : "women"}, maintained with extreme personal privacy.`,
      astrologicalBasisKn: "7ನೇ/8ನೇ ಭಾವಗಳಲ್ಲಿ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ತತ್ವ.",
      astrologicalBasisEn: "Mercury-Saturn neuter influence in kama/secret houses."
    };
  } else if (sensual.hasStrongAffairRisk) {
    if (isMale) {
      const is12thLordVenusIn5th = (lagnaIdx === 7 && venus?.house === 5);
      const hasKetuIn7thAndMarsIn8th = Boolean(ketu?.house === 7 && mars?.house === 8);
      const hasExtramaritalAndSpaAffliction = Boolean(
        (is12thLordVenusIn5th && hasKetuIn7thAndMarsIn8th) ||
        (venus?.house === 5 && ketu?.house === 7 && mars?.house === 8)
      );

      badTrait2 = {
        id: 2,
        type: "bad",
        titleKn: hasExtramaritalAndSpaAffliction
          ? "ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ & ಮಸಾಜ್/ಸ್ಪಾ ಸುಖಾಸಕ್ತಿ: ಪರಸ್ತ್ರೀ ಸೆಳೆತ & ಸಂಸಾರದಲ್ಲಿ ಅಶಾಂತಿ"
          : "ಬಾಹ್ಯ ಆಕರ್ಷಣೆ & ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ: ರಹಸ್ಯ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧದ ಸೆಳೆತ",
        titleEn: hasExtramaritalAndSpaAffliction
          ? "Extramarital Affair & Massage Spa Indulgence: Sensual Distraction & Marital Discord"
          : "Sensual Craving & External Affairs with Women: Marital Vulnerabilities",
        icon: "👩‍❤️‍👨",
        badgeKn: hasExtramaritalAndSpaAffliction ? "7ನೇ ಕೇತು • 8ನೇ ಕುಜ • ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ & ಸ್ಪಾ" : "7ನೇ/12ನೇ ಶುಕ್ರ-ರಾಹು • ಬಾಹ್ಯ ಸೆಳೆತ",
        badgeEn: hasExtramaritalAndSpaAffliction ? "7th Ketu • 8th Mars • Extramarital & Spa" : "Venus-Rahu Axis • External Desire",
        bulletKn: hasExtramaritalAndSpaAffliction
          ? `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕೇತು (ದಾಂಪತ್ಯದಲ್ಲಿ ಶೀತಲ ಅಂತರ), 8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ (ಅಧಿಕ ಕಾಮೋದ್ವೇಗ) ಹಾಗೂ 12ನೇ ವ್ಯಯಾಧಿಪತಿ ಶುಕ್ರನು 5ನೇ ಪ್ರೇಮ ಸ್ಥಾನದಲ್ಲಿ ಉಚ್ಚನಾಗಿರುವುದರಿಂದ, ದಾಂಪತ್ಯ ಜೀವನದ ಆಚೆಗೆ ಹೊರಗಿನ ಮತ್ತೊಬ್ಬ ಸ್ತ್ರೀಯೊಂದಿಗೆ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ (Extramarital affair) ಹಾಗೂ ಮಸಾಜ್ ಪಾರ್ಲರ್ / ಸ್ಪಾ (Massage Spa) ಶಾರೀರಿಕ ಸುಖಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ತೀವ್ರ ದೌರ್ಬಲ್ಯ ಜಾತಕದಲ್ಲಿದೆ. ಹೆಂಡತಿಯೊಂದಿಗೆ ಪ್ರೀತಿಯ ಕೊರತೆಯಿಂದಾಗಿ ಹೊರಗಿನ ಸುಖಾಸಕ್ತಿಗಳಿಗೆ ಮಾರುಹೋಗಿ, ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಹಾಗೂ ಬಿಕ್ಕಟ್ಟು ಸೃಷ್ಟಿಯಾಗುವ ಸ್ಪಷ್ಟ ಯೋಗವಿದೆ.`
          : `7ನೇ ಕಳತ್ರ ಮತ್ತು 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ ಅಥವಾ ರಾಹುವಿನ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯ ಜೀವನದ ಆಚೆಗೆ ಹೊರಗಿನ ಸ್ತ್ರೀಯರ ಕಡೆಗೆ (ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ) ತೀವ್ರ ಕಾಮ ಪ್ರಚೋದನೆ, ರಹಸ್ಯ ಫೋನ್/ಚಾಟ್ ಮಾತುಕತೆ ಹಾಗೂ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಅಪಾಯದ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ. ಇದು ಕೌಟುಂಬಿಕ ಗೌರವವನ್ನು ಧ್ವಂಸ ಮಾಡುವ ಅಪಾಯ ತಂದೊಡ್ಡಬಹುದು.`,
        bulletEn: hasExtramaritalAndSpaAffliction
          ? "Ketu in the 7th house (emotional distance from wife), Ashtama Kuja in the 8th house (intense libido), and 12th lord Venus exalted in 5th house create a strong propensity toward an extramarital affair and body massage spa indulgences."
          : "Venus-Rahu influence on the 7th/12th axis creates intense sensory urges, illicit attractions toward women outside marriage, and secret affairs that threaten family honor.",
        astrologicalBasisKn: hasExtramaritalAndSpaAffliction
          ? "7ನೇ ಕೇತು, 8ನೇ ಕುಜ ಹಾಗೂ 5ನೇ ಮನೆಯಲ್ಲಿ 12ನೇ ಅಧಿಪತಿ ಶುಕ್ರನ ಸ್ಥಿತಿ."
          : "7ನೇ ಮತ್ತು 12ನೇ ಮನೆಗಳ ಶುಕ್ರ-ರಾಹು-ಕುಜ ಯೋಗ.",
        astrologicalBasisEn: hasExtramaritalAndSpaAffliction
          ? "Ketu in 7th, Mars in 8th, and 12th lord Venus in 5th house."
          : "Venus-Rahu axis across 7th and 12th houses of pleasure and secret desires."
      };
    } else {
      badTrait2 = {
        id: 2,
        type: "bad",
        titleKn: "ಭಾವನಾತ್ಮಕ ಅತೃಪ್ತಿ & ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಸೆಳೆತ: ದಾಂಪತ್ಯದಲ್ಲಿ ಅಂತರ & ರಹಸ್ಯ ಪ್ರೇಮದ ಅಪಾಯ",
        titleEn: "Emotional Loneliness & Romantic Craving: Vulnerability to Outside Men",
        icon: "👩‍❤️‍👨",
        badgeKn: "7ನೇ/8ನೇ ಶುಕ್ರ-ರಾಹು • ಭಾವನಾತ್ಮಕ ಸೆಳೆತ",
        badgeEn: "Venus-Rahu 7th/8th • Romantic Craving",
        bulletKn: `7ನೇ ಕಳತ್ರ ಹಾಗೂ 12ನೇ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ-ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಪತಿಯಿಂದ ನಿರೀಕ್ಷಿತ ಪ್ರೀತಿ ಅಥವಾ ಮೆಚ್ಚುಗೆ ಸಿಗದಿದ್ದಾಗ ಹೊರಗಿನ ಇತರ ಪುರುಷರ ಕಡೆಗೆ (ಪರಪುರುಷ ವ್ಯಾಮೋಹ) ಭಾವನಾತ್ಮಕ ಸಾಂತ್ವನ, ರಹಸ್ಯ ಚಾಟ್ ಮಾತುಕತೆ ಹಾಗೂ ಪ್ರೇಮ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಅಪಾಯವಿದೆ. ಇದು ಕೌಟುಂಬಿಕ ಶಾಂತಿಯನ್ನು ಕೆಡಿಸದಂತೆ ಎಚ್ಚರವಹಿಸಬೇಕು.`,
        bulletEn: "Venus-Rahu tension on marital axis generates vulnerability to external romantic validation, secret conversations, or attachments when emotional intimacy feels absent at home.",
        astrologicalBasisKn: "7ನೇ ಕಳತ್ರ ಹಾಗೂ 12ನೇ ಶಯನ ಸ್ಥಾನದಲ್ಲಿ ಶುಕ್ರ-ರಾಹು ದೋಷ.",
        astrologicalBasisEn: "Venus-Rahu affliction triggering external romantic craving."
      };
    }
  } else if (sensual.hasSensualChanchalya || !sensual.hasMaritalFidelity) {
    if (isMale) {
      badTrait2 = {
        id: 2,
        type: "bad",
        titleKn: "ಕಾಮ ಚಾಂಚಲ್ಯ & ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆ: ಚಂಚಲ ದೃಷ್ಟಿ & ಸಂಸಾರದಲ್ಲಿ ಅಶಾಂತಿ",
        titleEn: "Sensual Restlessness & Roving Eye: Wandering Desires & Marital Discord",
        icon: "👀",
        badgeKn: "5ನೇ ರಾಹು • ನೀಚ ಕುಜ • ಕಾಮ ಚಾಂಚಲ್ಯ",
        badgeEn: "5th Rahu • Afflicted Mars • Sensual Chanchalya",
        bulletKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 5ನೇ ಬುದ್ಧಿ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹುವಿದ್ದು, ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜ ಹಾಗೂ 8ನೇ ಮನೆಯಿಂದ ಶುಕ್ರನ ಮೇಲಿರುವ ಶನಿಯ ದೃಷ್ಟಿಯ ಕಾರಣದಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ತೀವ್ರ ಕಾಮ ಚಾಂಚಲ್ಯ, ಪರಸ್ತ್ರೀಯರನ್ನು ಚಂಚಲ ದೃಷ್ಟಿಯಿಂದ ನೋಡುವ (roving eye/sensual curiosity) ಪ್ರವೃತ್ತಿ ಹಾಗೂ ಇಂದ್ರಿಯ ನಿಗ್ರಹದ ಕೊರತೆ ಎದ್ದು ಕಾಣುತ್ತದೆ. ಹೊರಗೆ ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಅಥವಾ ಗೌರವಯುತ ಸ್ಥಾನದಲ್ಲಿದ್ದರೂ, ಆಂತರಿಕವಾಗಿ ಕಾಮ ವಾಸನೆಗಳು ಹಾಗೂ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳು ಸಂಸಾರದಲ್ಲಿ ಹೆಂಡತಿಯೊಂದಿಗೆ ಅಶಾಂತಿ, ಸಂಶಯ ಹಾಗೂ ಕಲಹವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿವೆ. ಇಂದ್ರಿಯ ಸಂಯಮ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಸಾಂಸಾರಿಕ ನಿಷ್ಠೆ ಉಳಿಸಿಕೊಳ್ಳುವುದು ಅನಿವಾರ್ಯ.`,
        bulletEn: "Rahu in the 5th house of desires, debilitated Mars, and Saturn aspecting Venus in Aries create strong sensual restlessness, a roving eye towards other women, and weakened sensory self-control. While maintaining an upright or religious outer persona, these private impulses fuel friction, suspicion, and daily discord with spouse at home. Conscious sensory restraint is essential.",
        astrologicalBasisKn: "5ನೇ ಬುದ್ಧಿ-ಕಾಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು, ಲಗ್ನದಲ್ಲಿ ನೀಚ ಕುಜ ಹಾಗೂ ಶುಕ್ರನ ಮೇಲೆ ಶನಿಯ ದೃಷ್ಟಿ ಪ್ರಭಾವ.",
        astrologicalBasisEn: "Rahu in 5th house of desires with debilitated Mars and Saturn aspecting Venus."
      };
    } else {
      badTrait2 = {
        id: 2,
        type: "bad",
        titleKn: "ಕಾಮ ಚಾಂಚಲ್ಯ & ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಸೆಳೆತ: ದಾಂಪತ್ಯದಲ್ಲಿ ಅಶಾಂತಿ",
        titleEn: "Sensual Restlessness & Distraction: Emotional Turbulence",
        icon: "👀",
        badgeKn: "5ನೇ ರಾಹು • ಕಾಮ ಚಾಂಚಲ್ಯ",
        badgeEn: "5th Rahu • Restless Desires",
        bulletKn: `5ನೇ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು ಹಾಗೂ ಕಾಮ ಸ್ಥಾನಗಳ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಮನಸ್ಸಿನಲ್ಲಿ ಚಾಂಚಲ್ಯ, ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳತ್ತ ಸೆಳೆತ ಹಾಗೂ ದಾಂಪತ್ಯದಲ್ಲಿ ಅತೃಪ್ತಿಯ ಭಾವನೆಗಳು ಮೂಡಬಹುದು. ಇಂದ್ರಿಯ ಸಂಯಮ ಮತ್ತು ಕುಟುಂಬದ ನಿಷ್ಠೆ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅಗತ್ಯ.`,
        bulletEn: "Affliction across the 5th and relationship houses induces mental restlessness and vulnerability to external romantic distractions, straining marital peace.",
        astrologicalBasisKn: "5ನೇ ಭಾವದ ರಾಹು ಮತ್ತು ಕಾಮ ಸ್ಥಾನಗಳ ಪಾಪ ಪ್ರಭಾವ.",
        astrologicalBasisEn: "Rahu in 5th house of desire affecting sensory control."
      };
    }
  } else if (sensual.hasMaritalDistanceColdness) {
    if (isMale) {
      badTrait2 = {
        id: 2,
        type: "bad",
        titleKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಭಾವನಾತ್ಮಕ ನೀರಸತೆ & ಸಂವಹನ ಕೊರತೆ: ಪತ್ನಿಯೊಂದಿಗೆ ಅಂತರದ ಅಪಾಯ",
        titleEn: "Marital Distance & Emotional Dryness: Communication Gap with Wife",
        icon: "❄️",
        badgeKn: "7ನೇ ಶನಿ/ಕೇತು • ನೀರಸತೆ",
        badgeEn: "7th Saturn/Ketu • Emotional Dryness",
        bulletKn: `7ನೇ ಕಳತ್ರ ಭಾವದಲ್ಲಿ ಶನಿ ಅಥವಾ ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಉತ್ಸಾಹದ ಕೊರತೆ, ಅತಿಯಾದ ಕೆಲಸದ ಒತ್ತಡ ಹಾಗೂ ಪತ್ನಿಯೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಪ್ರೀತಿ ಹಂಚಿಕೊಳ್ಳಲು ಬಾರದಿರುವ ನೀರಸತೆ ಕಾಣಿಸುತ್ತದೆ. ಇದರಿಂದಾಗಿ ಮನೆಯಲ್ಲಿ ಸಂವಹನ ಕೊರತೆ ಮತ್ತು ಅಂತರ ಹೆಚ್ಚಾಗುವ ಅಪಾಯವಿದೆ.`,
        bulletEn: "Saturn or Ketu in the 7th house creates emotional reserve, workaholic detachment, and lack of romantic warmth toward spouse, causing an emotional gulf.",
        astrologicalBasisKn: "7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಶನಿ-ಕೇತುಗಳ ಪ್ರಭಾವ.",
        astrologicalBasisEn: "Saturn or Ketu in the 7th house causing marital reserve."
      };
    } else {
      badTrait2 = {
        id: 2,
        type: "bad",
        titleKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಏಕಾಂಗಿತನ & ಪತಿಯಿಂದ ಅಸಡ್ಡೆ: ಪ್ರೀತಿ-ವಾತ್ಸಲ್ಯದ ತೀವ್ರ ಕೊರಗು",
        titleEn: "Marital Isolation & Emotional Neglect: Craving Affection & Support",
        icon: "❄️",
        badgeKn: "7ನೇ ಶನಿ/ಕೇತು • ಏಕಾಂಗಿತನ",
        badgeEn: "7th Saturn/Ketu • Marital Loneliness",
        bulletKn: `7ನೇ ಕಳತ್ರ ಭಾವದಲ್ಲಿ ಶನಿ ಅಥವಾ ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪತಿಯಿಂದ ನಿರೀಕ್ಷಿತ ಅಕ್ಕರೆ, ಪ್ರಶಂಸೆ ಸಿಗದೆ ಒಳಗೊಳಗೇ ಒಂಟಿತನ ಅನುಭವಿಸುವ ಸ್ಥಿತಿ ಉಂಟಾಗಬಹುದು. ಮನಸ್ಸಿನ ನೋವನ್ನು ಹೊರಹಾಕದೆ ಕಣ್ಣೀರು ಹಾಕುವ ಪ್ರವೃತ್ತಿ ಕಾಣಿಸುತ್ತದೆ.`,
        bulletEn: "Saturn or Ketu in the 7th house subjects the native to emotional isolation and unexpressed longing for appreciation and warmth within marriage.",
        astrologicalBasisKn: "7ನೇ ಭಾವದಲ್ಲಿ ಶನಿ-ಕೇತುಗಳ ನೀರಸ ದೋಷ.",
        astrologicalBasisEn: "Saturn-Ketu in 7th house causing emotional isolation."
      };
    }
  } else {
    badTrait2 = {
      id: 2,
      type: "bad",
      titleKn: "ನೈತಿಕ ಚಾರಿತ್ರ್ಯ & ದಾಂಪತ್ಯ ನಿಷ್ಠೆ: ಸದಾಚಾರದ ರಕ್ಷಾ ಕವಚ",
      titleEn: "Moral Rectitude, Sensory Restraint & Marital Loyalty",
      icon: "💎",
      badgeKn: "ಶುಭ ಕಳತ್ರ • ಸದಾಚಾರ ರಕ್ಷಣೆ",
      badgeEn: "Auspicious 7th • Ethical Shield",
      bulletKn: isMale
        ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರನಿಗೆ ಶುಭ ಗ್ರಹಗಳ ರಕ್ಷಣೆಯಿರುವುದರಿಂದ, ನೈತಿಕ ಶಿಸ್ತು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಏಕಪತ್ನೀ ವ್ರತಸ್ಥ ನಿಷ್ಠೆ ನಿಮ್ಮ ಶ್ರೇಷ್ಠ ಗುಣವಾಗಿದೆ. ಬಾಹ್ಯ ಪ್ರಲೋಭನೆಗಳಿಗೆ ಸುಲಭವಾಗಿ ಮಾರುಹೋಗದೆ, ಸಂಸ್ಕಾರಯುತ ದಾಂಪತ್ಯ ಜೀವನಕ್ಕೆ ಬದ್ಧರಾಗಿರುವ ಸದ್ಗುಣ ನಿಮ್ಮಲ್ಲಿದೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರನಿಗೆ ಶುಭ ಗ್ರಹಗಳ ರಕ್ಷಣೆಯಿರುವುದರಿಂದ, ನೈತಿಕ ಶಿಸ್ತು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಪತಿವ್ರತಾ ನಿಷ್ಠೆ (ಏಕಪತಿ ನಿಷ್ಠೆ) ನಿಮ್ಮ ಶ್ರೇಷ್ಠ ಗುಣವಾಗಿದೆ. ಕುಟುಂಬ ಗೌರವ ಮತ್ತು ಸಂಸ್ಕಾರಯುತ ದಾಂಪತ್ಯ ಜೀವನವನ್ನು ಕಾಪಾಡಿಕೊಂಡು ಪತಿಗೆ ನಿಷ್ಠೆಯಿಂದ ಮುನ್ನಡೆಯುವ ಸಚ್ಚಾರಿತ್ರ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: "Benefic planetary alignment shields your marital house, conferring strong moral rectitude, sensory restraint, and faithful devotion to marriage.",
      astrologicalBasisKn: "7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರನಿಗೆ ಗುರು-ಶುಭ ಗ್ರಹಗಳ ರಕ್ಷಣೆ.",
      astrologicalBasisEn: "Auspicious Jupiter/benefic aspect protecting marital boundaries."
    };
  }

  // 3. ADDICTION & INTAKE EVALUATION (Strict Teetotaler & Jyotisha Rules)
  let badTrait3: TraitBulletPoint;
  if (diet.hasZardaTobaccoHabit && isMale) {
    badTrait3 = {
      id: 3,
      type: "bad",
      titleKn: "ಜರ್ದಾ, ತಂಬಾಕು & ಗುಟ್ಕಾ ವ್ಯಸನ: 2ನೇ ಭೋಜನ-ಮುಖ ಸ್ಥಾನದ ಮೇಲೆ ಕುಜ ದೃಷ್ಟಿಯ ಚಟ",
      titleEn: "Zarda, Chewing Tobacco & Stimulant Addiction: 2nd House Mars Affliction",
      icon: "🍂",
      badgeKn: "8ನೇ ಕುಜ • 2ನೇ ಮುಖ ದೃಷ್ಟಿ • ಜರ್ದಾ ತಂಬಾಕು",
      badgeEn: "8th Mars • 2nd House Aspect • Chewing Tobacco",
      bulletKn: `8ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ಅಂಗಾರಕನು (ಕುಜ) 2ನೇ ಮುಖ ಮತ್ತು ಭೋಜನ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ 7ನೇ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವುದರಿಂದ, ಜರ್ದಾ (Zarda), ತಂಬಾಕು (Chewing Tobacco), ಗುಟ್ಕಾ ಅಥವಾ ಖಾರ-ಉತ್ತೇಜಕ ತಾಂಬೂಲ ನಿರಂತರವಾಗಿ ಅಗಿಯುವ ತೀವ್ರ ಚಟ ಜಾತಕದಲ್ಲಿದೆ. ಹೊರನೋಟಕ್ಕೆ ಮದ್ಯಪಾನ ಮಾಡದಿದ್ದರೂ, ಬಾಯಿಯ ಚಪಲ, ಹಲ್ಲು-ಒಸಡುಗಳ ತೊಂದರೆ ಹಾಗೂ ಜರ್ದಾ-ತಂಬಾಕಿನ ದೈನಂದಿನ ದಾಸ್ಯವು ಶರೀರದ ಮೇಲೆ ಪ್ರತಿಕೂಲ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ. ಈ ತಂಬಾಕು ವ್ಯಸನದಿಂದ ಮುಕ್ತಿ ಪಡೆಯಲು ದೃಢ ಸಂಕಲ್ಪ ಅಗತ್ಯ.`,
      bulletEn: "Mars stationed in the 8th house casting its fiery direct 7th aspect onto the 2nd house of oral intake creates a relentless craving for chewing zarda, tobacco, gutkha, or spiced betel nut. While abstaining from alcohol, this daily oral stimulant dependency damages dental vitality and demands conscious de-addiction.",
      astrologicalBasisKn: "8ನೇ ಮನೆಯಲ್ಲಿರುವ ಕುಜನು 2ನೇ ಮುಖ-ಆಹಾರ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ 7ನೇ ದೃಷ್ಟಿ ಬೀರುವುದು.",
      astrologicalBasisEn: "Fiery Mars in 8th house casting 7th direct aspect on 2nd house of oral intake."
    };
  } else if (diet.isTeetotaler) {
    badTrait3 = {
      id: 3,
      type: "bad",
      titleKn: "ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿ & ಆಹಾರ ಸಂಸ್ಕಾರ: ದುಶ್ಚಟ ಮುಕ್ತ ಶರೀರ ರಕ್ಷಣೆ (Teetotaler)",
      titleEn: "Sattvic Lifestyle, Pure Dietary Sanctity & Teetotaler Demeanor",
      icon: "🌿",
      badgeKn: "ಸಾತ್ವಿಕ ಆಹಾರಿ (Teetotaler)",
      badgeEn: "Pure 2nd House • Sattvic & Teetotaler",
      bulletKn: isMale
        ? `ನಿಮ್ಮ 2ನೇ ಮುಖ/ಆಹಾರ ಸ್ಥಾನಕ್ಕೆ ಅಥವಾ ದ್ವಿತೀಯಾಧಿಪತಿಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ದೈವಿಕ ದೃಷ್ಟಿಯಿರುವುದರಿಂದ, ನೀವು ನೈಸರ್ಗಿಕವಾಗಿ ಸಾತ್ವಿಕ ಆಹಾರ ಪ್ರಿಯರು (Teetotaler). ಮದ್ಯಪಾನ, ಧೂಮಪಾನ ಅಥವಾ ಯಾವುದೇ ಮಾದಕ ದ್ರವ್ಯಗಳ ದುಶ್ಚಟವಿಲ್ಲದೆ, ಶರೀರವನ್ನು ದೇವಸ್ಥಾನದಂತೆ ಪರಿಶುದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳುವ ಸಾತ್ವಿಕ ಆಹಾರ ಸಂಸ್ಕಾರ ಹಾಗೂ ದುಶ್ಚಟ ಮುಕ್ತ ಶರೀರ ರಕ್ಷಣೆಯ ಆತ್ಮಶಿಸ್ತು ನಿಮ್ಮ ರಕ್ತದಲ್ಲಿದೆ.`
        : `ನಿಮ್ಮ 2ನೇ ಮುಖ/ಆಹಾರ ಸ್ಥಾನಕ್ಕೆ ಅಥವಾ ದ್ವಿತೀಯಾಧಿಪತಿಗೆ ಗುರುವಿನ ಪವಿತ್ರ ದೃಷ್ಟಿಯಿರುವುದರಿಂದ, ನೀವು ಶುದ್ಧ ಸಾತ್ವಿಕ ಆಹಾರ ಪ್ರಿಯರು. ಯಾವುದೇ ದುಶ್ಚಟಗಳಿಗೆ ಆಸ್ಪದ ನೀಡದೆ, ಮಧುರ ಸಂಭಾಷಣೆ ಮತ್ತು ಪರಿಶುದ್ಧ ಸಾತ್ವಿಕ ಆಹಾರ ಸಂಸ್ಕಾರದಿಂದ ಶರೀರ ಹಾಗೂ ಕುಟುಂಬದ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡುವ ಶ್ರೇಷ್ಠ ಗುಣ ನಿಮ್ಮಲ್ಲಿದೆ.`,
      bulletEn: "Divine Jupiter aspect on the 2nd house of intake and its lord bestows natural aversion to toxic substances, making the native a disciplined teetotaler with clean dietary habits.",
      astrologicalBasisKn: "2ನೇ ಆಹಾರ ಸ್ಥಾನ/ದ್ವಿತೀಯಾಧಿಪತಿಗೆ ಗುರುವಿನ ದೃಷ್ಟಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಗ್ರಹ ಪ್ರಭಾವ.",
      astrologicalBasisEn: "Guru aspect on 2nd lord or 2nd house protecting dietary purity."
    };
  } else if (isMale) {
    if (diet.isDailyDrinking) {
      badTrait3 = {
        id: 3,
        type: "bad",
        titleKn: "ಮದ್ಯಪಾನ & ದುಶ್ಚಟಗಳ ನೈಜ ಸ್ಥಿತಿ: ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ & ತೀವ್ರ ವ್ಯಸನದ ಸೆಳೆತ",
        titleEn: "Addictions & Drinking Reality: Daily Alcohol Habit & Intense Substance Urge",
        icon: "🍷",
        badgeKn: "2ನೇ ಮುಖ & 8ನೇ ಛಾಯಾ • ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ",
        badgeEn: "2nd Face & 8th Secret • Daily Alcohol",
        bulletKn: `ನಿಮ್ಮ 2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನ ಹಾಗೂ 8ನೇ ರಹಸ್ಯ ವ್ಯಸನ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶನಿ ಮತ್ತು ರಾಹುವಿನ ನೇರ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ದಿನನಿತ್ಯದ ಮದ್ಯಪಾನ (Daily Drinking), ಧೂಮಪಾನ ಅಥವಾ ಅಮಲು ಪದಾರ್ಥಗಳ ವ್ಯಸನದ ಪ್ರಬಲ ಸೆಳೆತ ಜಾತಕದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸುತ್ತದೆ. ಸಂಜೆಯ ವೇಳೆಯಲ್ಲಿ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡದಲ್ಲಿ ಈ ಚಟ ನಿಯಂತ್ರಣ ತಪ್ಪಿ, ಯಕೃತ್ತು (Liver), ಜೀರ್ಣಾಂಗ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿಯನ್ನು ಕ್ಷೀಣಿಸಬಹುದು. ಇದಕ್ಕೆ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಸಂಕಲ್ಪ ಮುಕ್ತಿ ಅತ್ಯಗತ್ಯ.`,
        bulletEn: "Affliction across the 2nd house of oral intake and 8th house of secret vices manifests as a regular or daily alcohol habit, demanding conscious detox and spiritual intervention before liver health is compromised.",
        astrologicalBasisKn: "2ನೇ (ಆಹಾರ/ಮುಖ) ಮತ್ತು 8ನೇ (ರಹಸ್ಯ ವ್ಯಸನ) ಭಾವದ ರಾಹು-ಶನಿ-ಕುಜ ಪ್ರಭಾವ.",
        astrologicalBasisEn: "Affliction to 2nd house of intake and 8th hidden house by malefics."
      };
    } else if (diet.isSocialDrinking) {
      badTrait3 = {
        id: 3,
        type: "bad",
        titleKn: "ಮದ್ಯಪಾನ & ದುಶ್ಚಟಗಳ ನೈಜ ಸ್ಥಿತಿ: ಪಾರ್ಟಿ & ಸಹವಾಸದ ಮದ್ಯಪಾನದ ಅಪಾಯ",
        titleEn: "Addiction Tendency: Social & Peer-Induced Drinking Vulnerability",
        icon: "🍺",
        badgeKn: "2ನೇ ಭಾವ ರಾಹು/ಶನಿ • ಪಾರ್ಟಿ ಮದ್ಯಪಾನ",
        badgeEn: "2nd House Aspect • Social Drinking",
        bulletKn: `2ನೇ ವಾಕ್/ಆಹಾರ ಸ್ಥಾನಕ್ಕೆ ಶನಿ-ರಾಹುಗಳ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಸ್ನೇಹಿತರ ಸಹವಾಸ ಅಥವಾ ಪಾರ್ಟಿಗಳ ಸಮಯದಲ್ಲಿ ಮದ್ಯಪಾನ, ಧೂಮಪಾನದಂತಹ ದುಶ್ಚಟಗಳ ಸೆಳೆತ ಉಂಟಾಗುತ್ತದೆ. ಆರಂಭದಲ್ಲಿ ಮನರಂಜನೆಯಾಗಿದ್ದದ್ದು ಕ್ರಮೇಣ ಅಭ್ಯಾಸವಾಗಿ ಬದಲಾಗದಂತೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು.`,
        bulletEn: "Planetary aspects on the 2nd house create periodic vulnerability to social drinking, smoking, or intoxicating indulgences under peer influence.",
        astrologicalBasisKn: "2ನೇ ವಾಕ್/ಆಹಾರ ಸ್ಥಾನಕ್ಕೆ ಶನಿ-ರಾಹುಗಳ ದೃಷ್ಟಿ.",
        astrologicalBasisEn: "Malefic aspect on 2nd house of oral consumption."
      };
    } else {
      badTrait3 = {
        id: 3,
        type: "bad",
        titleKn: "ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿ & ಆಹಾರ ಸಂಸ್ಕಾರ: ದುಶ್ಚಟ ಮುಕ್ತ ಶರೀರ ರಕ್ಷಣೆ",
        titleEn: "Sattvic Lifestyle & Clean Habits: Freedom from Addictions",
        icon: "🌿",
        badgeKn: "2ನೇ ಶುಭ ಸ್ಥಾನ • ಸಾತ್ವಿಕ ಶಿಸ್ತು",
        badgeEn: "Pure 2nd House • Sattvic Habits",
        bulletKn: `ನಿಮ್ಮ 2ನೇ ಆಹಾರ ಸ್ಥಾನವು ಶುಭ ಗ್ರಹಗಳ ನಿಯಂತ್ರಣದಲ್ಲಿದ್ದು, ದುಶ್ಚಟಗಳಿಂದ ದೂರವಿರುವ ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ. ಮದ್ಯಪಾನ, ಧೂಮಪಾನ ಅಥವಾ ವ್ಯಸನಗಳ ಜಾಲಕ್ಕೆ ಬೀಳದೆ ಶರೀರ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಇಚ್ಛಾಶಕ್ತಿ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ.`,
        bulletEn: "A clean 2nd house of intake grants natural resistance to toxic substances, supporting clean dietary habits and wholesome physical well-being.",
        astrologicalBasisKn: "2ನೇ ಮನೆಗೆ ಶುಭ ದೃಷ್ಟಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಗ್ರಹ ಪ್ರಭಾವ.",
        astrologicalBasisEn: "Clean 2nd house and absence of malefics from intake house."
      };
    }
  } else {
    // Female
    if (diet.hasAddiction) {
      badTrait3 = {
        id: 3,
        type: "bad",
        titleKn: "ಒತ್ತಡದ ಆಹಾರ ಚಪಲ, ಸಿಹಿ ವ್ಯಸನ & ವಾಕ್ ದೋಷ: ಕೋಪದಲ್ಲಿ ಕಟು ಮಾತುಗಳ ಆಡುವಿಕೆ",
        titleEn: "Stress Eating, Sugar Craving & Incisive Speech: Emotional Intake Vulnerability",
        icon: "🧁",
        badgeKn: "2ನೇ ಭೋಜನ & ವಾಕ್ • ಒತ್ತಡದ ಆಹಾರ",
        badgeEn: "2nd House Intake • Emotional Eating",
        bulletKn: `2ನೇ ಭೋಜನ ಹಾಗೂ ವಾಕ್ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿ-ರಾಹು ಅಥವಾ ಕುಜನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಮಾನಸಿಕ ಒತ್ತಡ ಅಥವಾ ಆತಂಕವಾದಾಗ ಸಿಹಿ ಪದಾರ್ಥಗಳು, ಜಂಕ್ ಫುಡ್ ಅಥವಾ ಅತಿಯಾದ ಆಹಾರ ಸೇವನೆಯ ಚಪಲ ಕಾಡಬಹುದು. ಜೊತೆಗೆ ಕೋಪ ಬಂದಾಗ ನಾಲಿಗೆಯ ಮೇಲೆ ನಿಯಂತ್ರಣ ತಪ್ಪಿ ಕಟು ಮಾತುಗಳನ್ನಾಡಿ ಆಪ್ತರ ಮನಸ್ಸನ್ನು ನೋಯಿಸುವ ವಾಕ್ ದೋಷದ ಸುಳಿವು ಜಾತಕದಲ್ಲಿದೆ.`,
        bulletEn: "Planetary tension in the 2nd house of intake and speech manifests as stress eating, sugar cravings, and sharp outbursts during moments of emotional exhaustion.",
        astrologicalBasisKn: "2ನೇ ಭೋಜನ ಹಾಗೂ ವಾಕ್ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿ-ರಾಹು ಪ್ರಭಾವ.",
        astrologicalBasisEn: "2nd house affliction affecting dietary intake and verbal restraint."
      };
    } else {
      badTrait3 = {
        id: 3,
        type: "bad",
        titleKn: "ಸಾತ್ವಿಕ ಆಹಾರ ಪದ್ಧತಿ & ಮಧುರ ಸಂಭಾಷಣೆ: ಸಂಸ್ಕಾರಯುತ ಜೀವನಶೈಲಿ",
        titleEn: "Wholesome Dietary Habits & Sweet Speech: Dignified Demeanor",
        icon: "🌿",
        badgeKn: "2ನೇ ಶುಭ ಸ್ಥಾನ • ಮಧುರ ವಾಕ್",
        badgeEn: "Benefic 2nd House • Sweet Speech",
        bulletKn: `ನಿಮ್ಮ 2ನೇ ವಾಕ್ ಮತ್ತು ಆಹಾರ ಸ್ಥಾನವು ಶುಭ ಗ್ರಹಗಳ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಸಾತ್ವಿಕ ಆಹಾರ ಶಿಸ್ತು ಹಾಗೂ ಇತರರಿಗೆ ನೋವಾಗದಂತೆ ಮಧುರವಾಗಿ ಮಾತನಾಡುವ ಸಂಸ್ಕಾರಯುತ ವ್ಯಕ್ತಿತ್ವ ನಿಮ್ಮಲ್ಲಿದೆ. ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿ ನಿಮ್ಮ ದೊಡ್ಡ ಶಕ್ತಿ.`,
        bulletEn: "An unblemished 2nd house bestows disciplined nutritional habits, gentle sweet speech, and wholesome domestic balance.",
        astrologicalBasisKn: "2ನೇ ಮನೆಗೆ ಶುಭ ದೃಷ್ಟಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಗ್ರಹ ಪ್ರಭಾವ.",
        astrologicalBasisEn: "Auspicious 2nd house supporting wholesome speech and intake."
      };
    }
  }

  // 4. SPECULATION, WEALTH LOSS & TRAPS EVALUATION
  let speculationScore = 0;
  if (rahu && rahu.house === 5) speculationScore += 3.5;
  if (fifthLordPlanet) {
    const isFifthLordNeecha = (fifthLordPlanet.name === PlanetName.Mars && fifthLordPlanet.rashi.index === 3) ||
      (fifthLordPlanet.name === PlanetName.Sun && fifthLordPlanet.rashi.index === 6) ||
      (fifthLordPlanet.name === PlanetName.Moon && fifthLordPlanet.rashi.index === 7) ||
      (fifthLordPlanet.name === PlanetName.Jupiter && fifthLordPlanet.rashi.index === 9) ||
      (fifthLordPlanet.name === PlanetName.Venus && fifthLordPlanet.rashi.index === 5) ||
      (fifthLordPlanet.name === PlanetName.Saturn && fifthLordPlanet.rashi.index === 0) ||
      (fifthLordPlanet.name === PlanetName.Mercury && fifthLordPlanet.rashi.index === 11);
    if (isFifthLordNeecha) speculationScore += 2.5;
    if ([6, 8, 12].includes(fifthLordPlanet.house)) speculationScore += 2.0;
  }
  if (saturn && saturn.house === 8) speculationScore += 2.0;
  if (mars && mars.house === 8) speculationScore += 1.5;
  if (ketu && ketu.house === 11) speculationScore += 1.5;

  const isSpeculationLoss = speculationScore >= 2.5;
  const lossInfo = getDynamicLossScaleText(kundli);

  let illegalScore = 0;
  if (rahu && rahu.house === 8) illegalScore += 2.5;
  if (rahu && [10, 11].includes(rahu.house)) illegalScore += 2.0;
  if (mars && mars.house === 8 && rahu && rahu.house === 8) illegalScore += 2.0;
  if (saturn && saturn.house === 8 && rahu && rahu.house === 8) illegalScore += 1.5;
  if (mercury && [8, 10, 12].includes(mercury.house) && (rahu && Math.abs(mercury.house - rahu.house) === 0)) illegalScore += 2.0;
  if (eighthLordPlanet && [2, 11].includes(eighthLordPlanet.house) && rahu && [2, 8, 11].includes(rahu.house)) illegalScore += 1.5;

  const hasDharmaKarmaProtection = Boolean(
    ((sun?.house === 5 && moon?.house === 5) || (jupiter && [1, 5, 9, 11].includes(jupiter.house)))
  );
  if (hasDharmaKarmaProtection) illegalScore = 0;

  const hasIllegal = illegalScore >= 2.0 && !isSpeculationLoss && isMale;

  const hasFinancialTrap = (rahu && [2, 11].includes(rahu.house)) || (mercury && [6, 8, 12].includes(mercury.house)) || (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house));

  let badTrait4: TraitBulletPoint;
  if (isSpeculationLoss) {
    badTrait4 = {
      id: 4,
      type: "bad",
      titleKn: "ಷೇರು ಮಾರುಕಟ್ಟೆ, ಬೆಟ್ಟಿಂಗ್ & ಹಠಾತ್ ಧನ ನಷ್ಟ: ಸ್ಪೆಕ್ಯುಲೇಶನ್ ದುರಾಸೆ & ಲಕ್ಷಾಂತರ ರೂಪಾಯಿ ನಷ್ಟದ ಬಲೆ",
      titleEn: "Stock Market Speculation & Trading Ruin: Gambler's Trap & Heavy Financial Losses",
      icon: "📉",
      badgeKn: "5ನೇ ರಾಹು • ನೀಚ ಪಂಚಮ • ಅಷ್ಟಮ ಶನಿ",
      badgeEn: "5th Rahu • Afflicted 5th Lord • 8th Malefic",
      bulletKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 5ನೇ ಸ್ಪೆಕ್ಯುಲೇಶನ್/ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹುವಿದ್ದು, ಪಂಚಮಾಧಿಪತಿ ${fifthLordKn} ನೀಚ/ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ ಹಾಗೂ 8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಶನಿ/ಕುಜ ಪ್ರಭಾವವಿದೆ. ವೇದ ಜ್ಯೋತಿಷ್ಯದ ಪ್ರಕಾರ ಇದು ಷೇರು ಮಾರುಕಟ್ಟೆ (Share Market), ಇಂಟ್ರಾಡೇ/F&O ಆಪ್ಷನ್ಸ್ ಟ್ರೇಡಿಂಗ್, ಬೆಟ್ಟಿಂಗ್ ಅಥವಾ ತ್ವರಿತ ಹಣದ ಆಮಿಷಗಳಿಗೆ ಬೀಳುವ ತೀವ್ರ ಗೀಳನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ. ದಿನನಿತ್ಯ ಷೇರು ವಹಿವಾಟು ನಡೆಸುವ ವ್ಯಸನ ಹತ್ತಿ, ಆರಂಭದಲ್ಲಿ ಸಣ್ಣ ಲಾಭ ಕಂಡರೂ ಅಂತಿಮವಾಗಿ ${lossInfo.lossKn} ಸ್ಪಷ್ಟ ಯೋಗ ಜಾತಕದಲ್ಲಿದೆ. ಕಳೆದುಕೊಂಡ ಹಣವನ್ನು ಮತ್ತೆ ಷೇರಿನಲ್ಲೇ ವಾಪಸ್ ಪಡೆಯಬೇಕೆಂಬ ಹಠದ ಭ್ರಮೆಯಲ್ಲಿ ಮತ್ತಷ್ಟು ಹಣ ಕಳೆದುಕೊಳ್ಳುವ ಅಪಾಯವಿದ್ದು, ಇಂದೇ ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಸಂಪೂರ್ಣವಾಗಿ ನಿಲ್ಲಿಸುವುದು ಜೀವ ರಕ್ಷೆ.`,
      bulletEn: `Rahu situated in the 5th house of speculation, coupled with an afflicted 5th lord and malefic tension in the 8th house, fuels an uncontrollable drive toward daily stock market trading (intraday, F&O options), betting, and high-risk shortcut wealth. The initial illusion of quick wealth leads to ${lossInfo.lossEn}—dragging the native into severe financial distress. The obsessive urge to recover lost funds through more trading is Rahu's classic trap. Immediate cessation of speculative ventures and debt-mitigation remedies are essential.`,
      astrologicalBasisKn: `5ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು (ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಗೀಳು), ನೀಚ/ಪೀಡಿತ ಪಂಚಮಾಧಿಪತಿ ${fifthLordKn} (ಬಂಡವಾಳ ನಷ್ಟ) ಹಾಗೂ 8ನೇ ಅಷ್ಟಮ ಶನಿ (ಭಾರಿ ಸಾಲ/ಹಠಾತ್ ವಿನಾಶ).`,
      astrologicalBasisEn: "5th house Rahu (speculative addiction), afflicted 5th lord (loss of capital), and 8th house Saturn (crushing sudden debts)."
    };
  } else if (hasIllegal) {
    badTrait4 = {
      id: 4,
      type: "bad",
      titleKn: "ಅಡ್ಡದಾರಿ ಹಣ & ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್): ಅಕ್ರಮ ಲಾಭ & ರಿಸ್ಕ್ ವ್ಯವಹಾರದ ಸೆಳೆತ",
      titleEn: "Unethical Shortcuts & Smuggling: Illicit Money & High-Risk Trade",
      icon: "⚖️",
      badgeKn: "8ನೇ & 11ನೇ ಭಾವ • ಅಕ್ರಮ ರಿಸ್ಕ್ ಯೋಗ",
      badgeEn: "8th & 11th Houses • Illicit Wealth Risk",
      bulletKn: `ಜಾತಕದಲ್ಲಿ 8ನೇ ರಹಸ್ಯ ಸ್ಥಾನ ಅಥವಾ 11ನೇ ಲಾಭ ಭಾವದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹುವಿನ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಶ್ರಮವಿಲ್ಲದೆ ತ್ವರಿತವಾಗಿ ಕೋಟಿಗಟ್ಟಲೆ ಹಣ ಗಳಿಸುವ ಅಡ್ಡದಾರಿ, ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್), ಬೆಟ್ಟಿಂಗ್, ಹವಾಲಾ ಅಥವಾ ಅಕ್ರಮ ವ್ಯವಹಾರಗಳ ದುಸ್ಸಾಹಸಕ್ಕೆ ಮನಸ್ಸು ಹಾತೊರೆಯುವ ಪ್ರವೃತ್ತಿ ಇದೆ. ಇದರಿಂದ ಆರಂಭದಲ್ಲಿ ಭಾರಿ ಲಾಭ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಪೊಲೀಸ್ ಕೇಸ್, ಕಾನೂನು ಸಂಕೋಲೆ, ಜೈಲು ಭಯ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾನಹಾನಿಯ ಅಪಾಯ ತಂದೊಡ್ಡಬಹುದು; ಪ್ರಾಮಾಣಿಕ ದುಡಿಮೆಯೇ ಶಾಶ್ವತ ರಕ್ಷೆ.`,
      bulletEn: "Rahu's presence or aspect on the 8th and 11th houses sparks reckless ambition toward illegal shortcut wealth, smuggling, speculative betting, or shadow trading, carrying severe legal liability and public disgrace.",
      astrologicalBasisKn: "8ನೇ ಅಕ್ರಮ ಲಾಭ ಮತ್ತು 11ನೇ ದುರಾಸೆಯ ಸ್ಥಾನದಲ್ಲಿ ರಾಹುವಿನ ಪ್ರಭಾವ.",
      astrologicalBasisEn: "8th house unearned wealth and Rahu temptation."
    };
  } else if (hasFinancialTrap) {
    badTrait4 = {
      id: 4,
      type: "bad",
      titleKn: "ಚಿಟ್‌ಫಂಡ್, ಆನ್‌ಲೈನ್ ಆಮಿಷ & ಕೈಸಾಲದ ನಷ್ಟ: ಇತರರನ್ನು ನಂಬಿ ಮೋಸಹೋಗುವ ಅಪಾಯ",
      titleEn: "Chit Funds, Online Schemes & Unsecured Loans: Financial Gullibility Risk",
      icon: "💸",
      badgeKn: "11ನೇ/2ನೇ ಭಾವ ರಾಹು-ಬುಧ • ನಂಬಿಕೆಯ ನಷ್ಟ",
      badgeEn: "11th/2nd Axis • Financial Misjudgment",
      bulletKn: `11ನೇ ಲಾಭ ಹಾಗೂ 2ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು-ಬುಧರ ಚಂಚಲತೆಯಿಂದಾಗಿ, ಹೆಚ್ಚು ಲಾಭ ಕೊಡುವ ಆನ್‌ಲೈನ್ ಸ್ಕೀಮ್‌ಗಳು, ಚಿಟ್‌ಫಂಡ್‌ಗಳು ಅಥವಾ ಆಪ್ತರಿಗೆ/ಸಂಬಂಧಿಕರಿಗೆ ಜಾಮೀನು ಇಲ್ಲದೆ ಕೈಸಾಲ ಕೊಟ್ಟು ಹಣ ವಾಪಸ್ ಬಾರದೆ ಕೈಸುಟ್ಟುಕೊಳ್ಳುವ ಅಪಾಯವಿದೆ. ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಯಾರನ್ನೂ ಕಣ್ಮುಚ್ಚಿ ನಂಬದೆ ಲಿಖಿತ ದಾಖಲೆ ಇಟ್ಟುಕೊಳ್ಳುವುದು ಅತ್ಯಗತ್ಯ.`,
      bulletEn: "Afflictions between 2nd and 11th houses induce financial misjudgment through speculative chit funds, online investment lures, or lending money to friends without collateral.",
      astrologicalBasisKn: "11ನೇ ಲಾಭ ಹಾಗೂ 2ನೇ ಧನ ಸ್ಥಾನದ ರಾಹು-ಬುಧ ಚಂಚಲತೆ.",
      astrologicalBasisEn: "Rahu-Mercury tension across wealth and enterprise houses."
    };
  } else {
    badTrait4 = {
      id: 4,
      type: "bad",
      titleKn: "ನ್ಯಾಯನಿಷ್ಠ ಸಂಪಾದನೆ & ಸತ್ಯ ಮಾರ್ಗ: ಪರಿಶ್ರಮದ ಧರ್ಮ ಸಂಪತ್ತು",
      titleEn: "Righteous Livelihood & Integrity: Hard-Earned Ethical Wealth",
      icon: "🏛️",
      badgeKn: "ಧರ್ಮ-ಕರ್ಮ ಯೋಗ • ಸತ್ಯ ಸಂಪಾದನೆ",
      badgeEn: "Dharma-Karma Axis • Clean Wealth",
      bulletKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಧರ್ಮ ಮತ್ತು ಕರ್ಮ ಸ್ಥಾನಗಳು ಶುದ್ಧವಾಗಿದ್ದು, ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ಸತ್ಯ ಮಾರ್ಗದ ಸಂಪಾದನೆಯಲ್ಲೇ ನೀವು ನೆಮ್ಮದಿ ಕಾಣುತ್ತೀರಿ. ಅಡ್ಡದಾರಿ, ಬೆಟ್ಟಿಂಗ್, ಅಕ್ರಮ ಆಮಿಷಗಳು ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಗೆ ಮರುಳಾಗದೆ ಕಾನೂನುಬದ್ಧವಾಗಿ ಬೆಳೆಯುವ ಪ್ರಾಮಾಣಿಕತೆ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ದೊಡ್ಡ ಶಕ್ತಿ.`,
      bulletEn: "An unblemished dharma-karma axis grounds your pursuit of prosperity in honest labor and strict ethical compliance, rejecting unlawful shortcut temptations.",
      astrologicalBasisKn: "ಧರ್ಮ-ಕರ್ಮ ಸ್ಥಾನಗಳ ಸಾತ್ವಿಕ ಬಲ.",
      astrologicalBasisEn: "Pure 9th and 10th houses ensuring ethical earnings."
    };
  }

  // 5. MENTAL SHADOW & THOUGHT LOOPS EVALUATION
  const hasMoonSaturnVish = moon && saturn && (Math.abs(moon.house - saturn.house) === 0 || [3, 7, 10].includes(houseDist(saturn.house, moon.house)));
  const hasMoonRahuGrahan = moon && rahu && (Math.abs(moon.house - rahu.house) === 0 || [5, 7, 9].includes(houseDist(rahu.house, moon.house)));
  const hasMoonMarsPitta = moon && mars && (Math.abs(moon.house - mars.house) === 0 || [4, 7, 8].includes(houseDist(mars.house, moon.house)));
  const hasMoonDusthana = moon && [6, 8, 12].includes(moon.house);

  let badTrait5: TraitBulletPoint;
  if (hasMoonSaturnVish) {
    badTrait5 = {
      id: 5,
      type: "bad",
      titleKn: "ವಿಷ ಯೋಗದ ನೆರಳು: ಕೀಳರಿಮೆ, ಒಂಟಿತನದ ಭೀತಿ & ಹಳೆಯ ಕಹಿ ನೆನಪುಗಳ ಕಾಟ",
      titleEn: "Vish Yoga Shadow: Melancholy, Isolation Fears & Rumination on Past Pain",
      icon: "🌑",
      badgeKn: "ಚಂದ್ರ-ಶನಿ ಸಂಪರ್ಕ • ವಿಷ ಯೋಗ",
      badgeEn: "Moon-Saturn • Vish Yoga",
      bulletKn: `ಮನಃಕಾರಕ ಚಂದ್ರನಿಗೆ ಶನಿಯ ಯುತಿ ಅಥವಾ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಹಳೆಯ ಕಹಿ ಘಟನೆಗಳನ್ನು ಪದೇಪದೇ ನೆನೆದು ಕೊರಗುವುದು, 'ನನ್ನನ್ನು ಯಾರೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದಿಲ್ಲ' ಎಂಬ ಕೀಳರಿಮೆ ಮತ್ತು ಒಂಟಿತನದ ಭೀತಿ ಮನಸ್ಸನ್ನು ಕಾಡುತ್ತದೆ. ನಿಯಮಿತ ಧ್ಯಾನ ಮತ್ತು ಶಿವಾರಾಧನೆ ಇದಕ್ಕೆ ರಾಮಬಾಣ.`,
      bulletEn: "Moon-Saturn alignment induces recurring cycles of depressive overthinking, chronic melancholy, and persistent rumination over past emotional hurts.",
      astrologicalBasisKn: "ಮನಃಕಾರಕ ಚಂದ್ರನಿಗೆ ಶನಿಯ ದೃಷ್ಟಿ/ಯುತಿ ಹಾಗೂ ವಿಷ ಯೋಗ.",
      astrologicalBasisEn: "Chandra-Shani Vish Yoga conferring chronic mental melancholy."
    };
  } else if (hasMoonRahuGrahan) {
    badTrait5 = {
      id: 5,
      type: "bad",
      titleKn: "ಗ್ರಹಣ ಯೋಗದ ಆತಂಕ: ಇಲ್ಲದ ಊಹೆಗಳು, ನಿದ್ರಾಹೀನತೆ & ಅತಿಯಾದ ಭ್ರಮೆಗಳು",
      titleEn: "Grahan Yoga Shadow: Unfounded Anxieties, Insomnia & Restless Thoughts",
      icon: "🌪️",
      badgeKn: "ಚಂದ್ರ-ರಾಹು ಸಂಪರ್ಕ • ಗ್ರಹಣ ಯೋಗ",
      badgeEn: "Moon-Rahu • Grahan Yoga",
      bulletKn: `ಚಂದ್ರ-ರಾಹುವಿನ ಗ್ರಹಣ ದೋಷದಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ಇಲ್ಲದ ಆತಂಕಗಳು, ರಾತ್ರಿಯ ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅತಿಯಾದ ಊಹೆಗಳಿಂದ ಮನಸ್ಸು ತತ್ತರಿಸುವ ಪ್ರವೃತ್ತಿ ಕಾಣಿಸುತ್ತದೆ. ವಾಸ್ತವಕ್ಕಿಂತ ಊಹೆಗಳೇ ನಿಮ್ಮನ್ನು ಹೆಚ್ಚು ಕಾಡುತ್ತವೆ.`,
      bulletEn: "Moon-Rahu nodal tension creates erratic psychic restlessness, irrational phobias, nocturnal anxiety, and insomnia.",
      astrologicalBasisKn: "ಚಂದ್ರ-ರಾಹುವಿನ ಗ್ರಹಣ ಯೋಗ ಹಾಗೂ ವಾಯು ತತ್ವದ ಚಂಚಲತೆ.",
      astrologicalBasisEn: "Chandra-Rahu Grahan Dosha causing nocturnal anxiety."
    };
  } else if (hasMoonMarsPitta) {
    badTrait5 = {
      id: 5,
      type: "bad",
      titleKn: "ಮಾನಸಿಕ ಉದ್ವೇಗ & ಚಡಪಡಿಕೆ: ತತ್ಕ್ಷಣದ ಅಸಹನೆ & ನರಗಳ ಆಶಾಂತಿ",
      titleEn: "Mental Agitation & Impatience: High-Strung Nervous Tension",
      icon: "⚡",
      badgeKn: "ಚಂದ್ರ-ಕುಜ ಸಂಪರ್ಕ • ಪಿತ್ತ ಉದ್ವೇಗ",
      badgeEn: "Moon-Mars • Emotional Agitation",
      bulletKn: `ಚಂದ್ರನ ಮೇಲೆ ಕುಜನ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿಯಿಂದಾಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ಅತಿಯಾದ ಆತುರ, ಶಾಂತಿಯ ಕೊರತೆ ಹಾಗೂ ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾಗಿ ಚಡಪಡಿಸುವ ಉದ್ವೇಗ ಕಾಣಿಸುತ್ತದೆ. ಇದರಿಂದ ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿಗೆ ಧಕ್ಕೆಯಾಗದಂತೆ ಸಂಯಮ ರೂಢಿಸಿಕೊಳ್ಳಬೇಕು.`,
      bulletEn: "Moon-Mars friction generates emotional agitation, high-strung nervousness, and restless impatience under pressure.",
      astrologicalBasisKn: "ಚಂದ್ರನ ಮೇಲೆ ಕುಜನ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ.",
      astrologicalBasisEn: "Martial aspect on the Moon causing visceral nervous agitation."
    };
  } else if (hasMoonDusthana) {
    badTrait5 = {
      id: 5,
      type: "bad",
      titleKn: "ಭಾವನಾತ್ಮಕ ಅಸ್ಥಿರತೆ & ಆಂತರಿಕ ತುಮುಲ: ಏಕಾಂತದಲ್ಲಿ ಮನಸ್ಸನ್ನು ಕಾಡುವ ಚಿಂತೆಗಳು",
      titleEn: "Emotional Instability & Dusthana Turbulence: Internal Solitude",
      icon: "🌫️",
      badgeKn: "ಚಂದ್ರ ದುಃಸ್ಥಾನ • ಭಾವನಾತ್ಮಕ ತುಮುಲ",
      badgeEn: "Moon in Dusthana • Internal Turbulence",
      bulletKn: `ಚಂದ್ರನು ದುಃಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ, ಹೊರಗಡೆ ಸಮಾಧಾನವಾಗಿ ಕಂಡರೂ ಅಂತರಂಗದಲ್ಲಿ ಸದಾ ಏನೋ ಒಂದು ಅತೃಪ್ತಿ ಅಥವಾ ಚಿಂತೆ ಕಾಡುತ್ತಿರುತ್ತದೆ. ಏಕಾಂತದಲ್ಲಿ ನಕಾರಾತ್ಮಕ ಯೋಚನೆಗಳು ಮನಸ್ಸನ್ನು ಆವರಿಸದಂತೆ ಸದಾ ಸತ್ಸಂಗ ಮತ್ತು ದೈವ ಪ್ರಾರ್ಥನೆಯಲ್ಲಿ ತೊಡಗಬೇಕು.`,
      bulletEn: "Moon placed in dusthana triggers recurrent feelings of isolation and mood swings during solitary moments.",
      astrologicalBasisKn: "ಚಂದ್ರನ ದುಃಸ್ಥಾನ ಸ್ಥಿತಿ.",
      astrologicalBasisEn: "Natal Moon placed in 6th, 8th, or 12th house."
    };
  } else {
    badTrait5 = {
      id: 5,
      type: "bad",
      titleKn: "ಮಾನಸಿಕ ಸ್ಥೈರ್ಯ & ಧನಾತ್ಮಕ ಚಿಂತನೆ: ಆಶಾವಾದದ ಮನೋಬಲ",
      titleEn: "Mental Fortitude & Constructive Optimism: Inner Resilience",
      icon: "☀️",
      badgeKn: "ಶುಭ ಚಂದ್ರ ಬಲ • ಧನಾತ್ಮಕ ಚಿತ್ತ",
      badgeEn: "Benefic Moon Strength • Resilient Mind",
      bulletKn: `ನಿಮ್ಮ ಚಂದ್ರ ಬಲವು ಸ್ಥಿರವಾಗಿದ್ದು, ಎಂತಹ ಕಠಿಣ ಸನ್ನಿವೇಶದಲ್ಲೂ ಧೃತಿಗೆಡದೆ ಸಕಾರಾತ್ಮಕವಾಗಿ ಮುನ್ನಡೆಯುವ ಮನೋಸ್ಥೈರ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ. ಸುಖ-ದುಃಖಗಳನ್ನು ಸಮಚಿತ್ತದಿಂದ ಸ್ವೀಕರಿಸಿ, ಆಶಾವಾದದೊಂದಿಗೆ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುವ ಗುಣ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಸದೃಢವಾಗಿಟ್ಟಿದೆ.`,
      bulletEn: "Stable lunar alignment endows you with emotional resilience, steady equanimity during hardship, and constructive optimism that shields against mental despondency.",
      astrologicalBasisKn: "ಸ್ಥಿರ ಚಂದ್ರ ಬಲ ಹಾಗೂ ಸಕಾರಾತ್ಮಕ ಗ್ರಹ ದೃಷ್ಟಿ.",
      astrologicalBasisEn: "Unafflicted Moon conferring emotional stability."
    };
  }

  // 6. SECRET LIFE EXPRESSION
  const badTrait6: TraitBulletPoint = {
    id: 6,
    type: "bad",
    titleKn: secrecyTitleKn,
    titleEn: secrecyTitleEn,
    icon: "🎭",
    badgeKn: secrecyBadgeKn,
    badgeEn: secrecyBadgeEn,
    bulletKn: secrecyKn,
    bulletEn: secrecyEn,
    astrologicalBasisKn: "3ನೇ ಭಾವ (ಬಹಿರಂಗ ಅಭಿವ್ಯಕ್ತಿ) ಮತ್ತು 8ನೇ ಭಾವ (ಅತ್ಯಂತ ಗುಪ್ತ ಮುಚ್ಚಿಡುವಿಕೆ).",
    astrologicalBasisEn: "3rd house of expression vs 8th house of absolute concealment.",
    secrecyHabitKn: secrecyKn,
    secrecyHabitEn: secrecyEn
  };

  // 7. PRAYASHCHITTA & GOKARNA SHANTI
  const badTrait7: TraitBulletPoint = {
    id: 7,
    type: "bad",
    titleKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರಾಯಶ್ಚಿತ್ತ & ಗೋಕರ್ಣ ಮುಕ್ತಿ: ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ & ದೋಷ ಪರಿಹಾರ",
    titleEn: "Authentic Vedic Prayashchitta & Sri Kshetra Gokarna Shanti",
    icon: "🕉️",
    badgeKn: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ • ಪ್ರಾಯಶ್ಚಿತ್ತ",
    badgeEn: "Gokarna Atma Linga • Purification",
    bulletKn: `ಜಾತಕದಲ್ಲಿ ಕಂಡ ಈ ನೆರಳು ಪ್ರವೃತ್ತಿಗಳನ್ನು ಮತ್ತು ಪಾಪಕರ್ಮಗಳ ತೀವ್ರತೆಯನ್ನು ಕರಗಿಸಲು, ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಮಹಾಸಂಕಲ್ಪ ಪೂಜೆ, ರಾಹು-ಕೇತು ಶಾಂತಿ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯಗತ್ಯ. ಇದು ನಿಮ್ಮ ಅಂತರಂಗದ ಕಲ್ಮಶಗಳನ್ನು ಭಸ್ಮ ಮಾಡಿ, ಮನಸ್ಸಿಗೆ ಪರಿಶುದ್ಧ ನೆಮ್ಮದಿ ಮತ್ತು ದೈವಿಕ ಶ್ರೀರಕ್ಷೆಯನ್ನು ಕರುಣಿಸಲಿದೆ.`,
    bulletEn: `To dissolve these shadow karmic impulses, performing Atma Linga Sparsha, Prayashchitta Sankalpa Pooja, and Rahu-Ketu Shanti at Sri Kshetra Gokarna Mahabaleshwara cleanses psychic toxins and restores moral fortitude.`,
    astrologicalBasisKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಮಹಿಮೆ ಹಾಗೂ ಪ್ರಾಯಶ್ಚಿತ್ತ ವಿಧಿ.",
    astrologicalBasisEn: "Gokarna Mahabaleshwara sacred Atma Linga purification rite."
  };

  const adultBadTraits: TraitBulletPoint[] = [
    badTrait1,
    badTrait2,
    badTrait3,
    badTrait4,
    badTrait5,
    badTrait6,
    badTrait7
  ];

  return {
    goodTraits: adultGoodTraits,
    badTraits: adultBadTraits,
    secrecyHabitKn: secrecyKn,
    secrecyHabitEn: secrecyEn,
    gokarnaPrayashchittaKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ರಾಹು-ಕೇತು ಶಾಂತಿ ಸೇವೆ ಸಮರ್ಪಿಸುವುದರಿಂದ ಈ ಸಕಲ ನೆರಳು ಕರ್ಮಗಳು ಮತ್ತು ತಪ್ಪು ಪ್ರವೃತ್ತಿಗಳು ಭಸ್ಮವಾಗಿ ಆತ್ಮಶುದ್ಧಿ ದೊರೆಯಲಿದೆ.`,
    gokarnaPrayashchittaEn: `Perform Prayashchitta Sankalpa Pooja, Atma Linga Sparsha, and Rahu-Ketu Shanti at holy Gokarna Mahabaleshwara Kshetra to burn away shadow karma and cleanse unconscious tendencies.`,
    isSpeculationLoss,
    speculationWarningKn: isSpeculationLoss ? `5ನೇ ರಾಹು & ನೀಚ ಪಂಚಮಾಧಿಪತಿಯಿಂದಾಗಿ ಷೇರು ಮಾರುಕಟ್ಟೆ / ಟ್ರೇಡಿಂಗ್‌ನಲ್ಲಿ ಭಾರಿ ಬಂಡವಾಳ ನಷ್ಟವಾಗಿದ್ದು, ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಮತ್ತೆ ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಅಥವಾ ಬೆಟ್ಟಿಂಗ್‌ಗೆ ಕೈಹಾಕಬೇಡಿ.` : undefined,
    speculationWarningEn: isSpeculationLoss ? `5th house Rahu and afflicted 5th lord trigger heavy trading losses; cease all day trading and speculative betting immediately.` : undefined,
    isTeetotaler: diet.isTeetotaler,
    hasMaritalFidelity: sensual.hasMaritalFidelity,
    dietSummaryKn: diet.dietSummaryKn,
    dietSummaryEn: diet.dietSummaryEn,
    fidelitySummaryKn: sensual.fidelitySummaryKn,
    fidelitySummaryEn: sensual.fidelitySummaryEn
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

  // 3. Primary Life Challenge Assessment (Dynamic 4-Domain Scoring for ANY Kundali)
  let challengeArea: CurrentLifeDiagnosis["primaryLifeChallenge"]["area"] = "General Transition";
  let challengeAreaKn = "ಜೀವನದ ಸ್ಥಿತ್ಯಂತರ & ನೂತನ ಆರಂಭ";
  let challengeDesc = "ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಮತ್ತು ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಅಡಿಪಾಯ ಹಾಕುವ ಹಂತ.";
  let challengeDescEn = "A life phase focused on consolidating personal stability and laying the foundation for upcoming endeavors.";
  let rootCause = `ಪ್ರಸ್ತುತ ${maha} ಮಹಾದಶಾ ಮತ್ತು ${bhukti} ಭುಕ್ತಿಯ ಸಂಚಾರ.`;
  let rootCauseEn = `Ongoing transit under ${maha} Mahadasha and ${bhukti} Bhukti.`;
  let solutionKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ಸೇವೆ ಸಮರ್ಪಿಸಿ.";
  let solutionEn = "Sponsor Navagraha Shanti and Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara.";

  const seventhLord = signLord((kundli.lagnaRashi.index + 6) % 12);
  const seventhLordPlanet = kundli.planets.find((p) => p.name === seventhLord);
  const tenthLord = signLord((kundli.lagnaRashi.index + 9) % 12);
  const tenthLordPlanet = kundli.planets.find((p) => p.name === tenthLord);
  const secondLord = signLord((kundli.lagnaRashi.index + 1) % 12);
  const secondLordPlanet = kundli.planets.find((p) => p.name === secondLord);
  const fifthLord = signLord((kundli.lagnaRashi.index + 4) % 12);
  const fifthLordPlanet = kundli.planets.find((p) => p.name === fifthLord);

  // Domain 1: Marital Affliction Score
  let marriageAfflictionScore = 0;
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) marriageAfflictionScore += 3.5;
  if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) marriageAfflictionScore += 2.5; // Kuja Dosha
  if (rahu && rahu.house === 7) marriageAfflictionScore += 2.5;
  if (saturn && (saturn.house === 7 || [1, 5, 10].includes(saturn.house))) marriageAfflictionScore += 2.0;
  if (mars && seventhLordPlanet && [4, 7, 8].includes(houseDist(mars.house, seventhLordPlanet.house))) marriageAfflictionScore += 2.0;

  // Domain 2: Debt / Speculation Financial Affliction Score
  let debtAfflictionScore = 0;
  const is5thRahu = rahu && rahu.house === 5;
  const is5thLordNeecha = fifthLordPlanet && (
    (fifthLordPlanet.name === PlanetName.Mars && fifthLordPlanet.rashi.index === 3) ||
    (fifthLordPlanet.name === PlanetName.Sun && fifthLordPlanet.rashi.index === 6) ||
    (fifthLordPlanet.name === PlanetName.Moon && fifthLordPlanet.rashi.index === 7) ||
    (fifthLordPlanet.name === PlanetName.Jupiter && fifthLordPlanet.rashi.index === 9) ||
    (fifthLordPlanet.name === PlanetName.Venus && fifthLordPlanet.rashi.index === 5) ||
    (fifthLordPlanet.name === PlanetName.Saturn && fifthLordPlanet.rashi.index === 0) ||
    (fifthLordPlanet.name === PlanetName.Mercury && fifthLordPlanet.rashi.index === 11)
  );
  if (is5thRahu && (is5thLordNeecha || (fifthLordPlanet && [6, 8, 12].includes(fifthLordPlanet.house)))) {
    debtAfflictionScore += 4.5;
  }
  if (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house)) debtAfflictionScore += 2.5;
  if (saturn && saturn.house === 8) debtAfflictionScore += 2.0;
  if (kundli.maandi && [1, 7, 8].includes(kundli.maandi.rashi.index - kundli.lagnaRashi.index + 1)) debtAfflictionScore += 2.0;

  // Domain 3: Career Affliction Score
  let careerAfflictionScore = 0;
  if (tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) careerAfflictionScore += 3.5;
  if (rahu && rahu.house === 10) careerAfflictionScore += 2.0;
  if (saturn && saturn.house === 10) careerAfflictionScore += 2.0;

  // Domain 4: Health Affliction Score
  let healthAfflictionScore = 0;
  const lagnaLord = signLord(kundli.lagnaRashi.index);
  const lagnaLordPlanet = kundli.planets.find(p => p.name === lagnaLord);
  if (lagnaLordPlanet && [6, 8, 12].includes(lagnaLordPlanet.house)) healthAfflictionScore += 3.5;
  if (moon && [6, 8, 12].includes(moon.house)) healthAfflictionScore += 2.5;

  // Determine Priority Authentically for the Native's Chart
  if (devoteeAge >= 20 && marriageAfflictionScore >= 3.0 && marriageAfflictionScore >= careerAfflictionScore) {
    challengeArea = "Personal / Marriage";
    challengeAreaKn = "ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು & ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳ ಸಂಕಷ್ಟ (Acute Marital Crisis & Misunderstandings)";
    challengeDesc = "ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರವಾದ ಮಾನಸಿಕ ಸಂಕಷ್ಟ, ಪರಸ್ಪರ ಅಸಹನೀಯ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು (Misunderstandings), ಸಣ್ಣ ಮಾತಿಗೂ ಭುಗಿಲೇಳುವ ಮನಸ್ತಾಪ, ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದೆ ಮಾತುಕತೆ ಕಡಿದುಹೋಗಿರುವುದು ಅಥವಾ ದೂರವಾಗುವಂತಹ ಕಠಿಣ ಬಿಕ್ಕಟ್ಟಿನಿಂದ ನೀವು ಪ್ರಸ್ತುತ ಬಳಲುತ್ತಿದ್ದೀರಿ.";
    challengeDescEn = "You are currently suffering from acute marital distress, severe misunderstandings, constant friction triggered by trivial matters, emotional distance, and breakdown of marital communication.";
    rootCause = `7ನೇ ಕಳತ್ರಾಧಿಪತಿ ${toKannadaPlanet(seventhLord)} ${seventhLordPlanet?.house ?? 8}ನೇ ಸಂಕಟ ಭಾವದಲ್ಲಿದ್ದು, ${mars ? `ಲಗ್ನದ ${toKannadaPlanet(mars.name)} ದೋಷದ` : "ಗ್ರಹಗಳ"} ತೀವ್ರ ದೃಷ್ಟಿ ಪ್ರಭಾವವಿದೆ.`;
    rootCauseEn = "7th house lord placed in dusthana with adverse aspects from Mars/Saturn creating persistent friction.";
    solutionKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ, ಪರಸ್ಪರ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳನ್ನು ಮರೆತು ಒಂದಾಗಲು ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಮಾಡಿ ಮತ್ತು 2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಿ.";
    solutionEn = "Sponsor Uma-Maheshwara Kalyana Sankalpa Pooja at Sri Kshetra Gokarna to dissolve misunderstandings and restore matrimonial union, and wear a 2-Mukhi Rudraksha.";
  } else if (debtAfflictionScore >= 3.5) {
    challengeArea = "Financial / Debts";
    challengeAreaKn = is5thRahu
      ? "ಷೇರು ಮಾರುಕಟ್ಟೆ ನಷ್ಟ, ಸ್ಪೆಕ್ಯುಲೇಶನ್ & ಭಾರಿ ಸಾಲದ ಬಿಕ್ಕಟ್ಟು (Stock Market Speculation & Debt Crisis)"
      : "ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟು & ಸಾಲದ ಸುಳಿ (Financial Strain & Debt Pressure)";
    challengeDesc = is5thRahu
      ? "ಷೇರು ಮಾರುಕಟ್ಟೆ, ಇಂಟ್ರಾಡೇ ಟ್ರೇಡಿಂಗ್ ಹಾಗೂ ಸ್ಪೆಕ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ಭಾರಿ ಬಂಡವಾಳ ಕಳೆದುಕೊಂಡು ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕಿರುವ ತೀವ್ರ ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟು."
      : "ಆದಾಯಕ್ಕಿಂತ ಖರ್ಚು ಹೆಚ್ಚು, ಕೈಗೆ ಬಂದ ಹಣ ನಿಲ್ಲದಿರುವುದು ಅಥವಾ ಸಾಲ ತೀರಿಸುವ ಆರ್ಥಿಕ ಒತ್ತಡ.";
    challengeDescEn = is5thRahu
      ? "Acute financial crisis from devastating capital losses in stock market intraday/options trading and speculation, leading to crushing debt trap."
      : "Severe financial stress from mounting debt obligations and unexpected expenditure outpacing income.";
    rootCause = is5thRahu
      ? "5ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು (ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಗೀಳು), ನೀಚ ಪಂಚಮಾಧಿಪತಿ ಹಾಗೂ 8ನೇ ಅಷ್ಟಮ ಶನಿ."
      : "2ನೇ ಧನ ಸ್ಥಾನದ ಅಧಿಪತಿ ದುಃಸ್ಥಾನದಲ್ಲಿರುವುದು ಹಾಗೂ ಹಣದ ಸೋರಿಕೆ ನೋಡ್ ಸಕ್ರಿಯವಾಗಿರುವುದು.";
    rootCauseEn = is5thRahu
      ? "Rahu in 5th house triggering speculative trading obsession combined with afflicted 5th lord and 8th house Saturn."
      : "2nd house lord placed in Dusthana triggering financial leakage.";
    solutionKn = "ಷೇರು ಟ್ರೇಡಿಂಗ್ ಮತ್ತು ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಅನ್ನು ಇಂದೇ ಸಂಪೂರ್ಣವಾಗಿ ನಿಲ್ಲಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ, ಕುಬೇರ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ಸಾಲ ವಿಮೋಚನೆಗಾಗಿ ಪ್ರಾಯಶ್ಚಿತ್ತ ಮಾಡಿ.";
    solutionEn = "Cease all speculative trading immediately. Perform Mahaganapati Homa and Kubera Sankalpa at Sri Kshetra Gokarna to systematically eliminate debt burden.";
  } else if (devoteeAge >= 24 && devoteeAge <= 58 && careerAfflictionScore >= 3.0) {
    challengeArea = "Career / Workplace";
    challengeAreaKn = "ಉದ್ಯೋಗದಲ್ಲಿ ಅಸ್ಥಿರತೆ & ಕಚೇರಿ ರಾಜಕೀಯ (Workplace Politics & Career Delays)";
    challengeDesc = "ಉದ್ಯೋಗದಲ್ಲಿ ನಿರೀಕ್ಷಿತ ಮನ್ನಣೆ ವಿಳಂಬ, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಅಥವಾ ಹೊಸ ಉದ್ಯೋಗದ ಹುಡುಕಾಟ.";
    challengeDescEn = "Lack of recognition at work, career stagnation, and workplace politics impeding professional growth despite sincere dedication.";
    rootCause = `10ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${toKannadaPlanet(tenthLord)} ಗ್ರಹವು ${tenthLordPlanet?.house ?? 6}ನೇ ಮನೆಯಲ್ಲಿರುವುದು.`;
    rootCauseEn = "10th lord placed in dusthana under Saturn's slow transit.";
    solutionKn = "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ರವಿ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ರತ್ನ ಧಾರಣೆ ಮಾಡಿ.";
    solutionEn = "Perform Karma Siddhi Sankalpa Pooja at Sri Kshetra Gokarna and wear the prescribed gemstone.";
  } else if (healthAfflictionScore >= 3.0) {
    challengeArea = "Health / Vitality";
    challengeAreaKn = "ದೈಹಿಕ ಬಳಲಿಕೆ & ನರಗಳ ಅಶಾಂತಿ (Physical Exhaustion & Health Vulnerability)";
    challengeDesc = "ದೈಹಿಕ ಬಳಲಿಕೆ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಕೊರತೆ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಅನಾರೋಗ್ಯದ ಕ್ಲೇಶ.";
    challengeDescEn = "Chronic physical exhaustion, low vitality, sleep disturbance, or sudden health vulnerabilities.";
    rootCause = `ಲಗ್ನಾಧಿಪತಿ ${toKannadaPlanet(lagnaLord)} ದುಃಸ್ಥಾನದಲ್ಲಿರುವುದು ಹಾಗೂ ಚಂದ್ರನ ಮೇಲಿನ ಪಾಪಗ್ರಹ ಪ್ರಭಾವ.`;
    rootCauseEn = "Lagna lord in Dusthana and Moon under malefic aspects.";
    solutionKn = "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಮತ್ತು ಆಯುಷ್ಯ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ, ಪವಿತ್ರ ರಕ್ಷಾ ಭಸ್ಮ ಧಾರಣೆ ಮಾಡಿ.";
    solutionEn = "Sponsor Mahamrityunjaya Homa at Gokarna Kotiteertha and apply sacred Raksha Bhasma daily.";
  } else {
    // Dynamic Age-Bracketed & Dasha-Gochara Driven Life Focus (Zero Generic Fallback)
    if (devoteeAge < 14) {
      challengeArea = "Academic & Growth Focus";
      challengeAreaKn = "ಬಾಲ್ಯದ ಸಮಗ್ರ ವಿಕಾಸ, ವಿದ್ಯಾಭ್ಯಾಸ & ರಕ್ಷಾ ಕವಚ";
      challengeDesc = `ಪ್ರಸ್ತುತ ಮಗುವಿಗೆ ${devoteeAge} ವರ್ಷ ಪ್ರಾಯವಿದ್ದು, ${toKannadaPlanet(maha)} ಮಹಾದಶಾ ಮತ್ತು ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯ ಪ್ರಭಾವದಲ್ಲಿ ಬೌದ್ಧಿಕ ಬೆಳವಣಿಗೆ ಹಾಗೂ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣದ ಹಂತದಲ್ಲಿದೆ. ಚಂದ್ರನಿಂದ ಗೋಚಾರ ಶನಿ ${liveGochara.shaniHouseFromMoon}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಮತ್ತು ಗುರು ${liveGochara.guruHouseFromMoon}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಸುಖನಿದ್ರೆ ಮತ್ತು ಸಾತ್ವಿಕ ನಡವಳಿಕೆಗೆ ಪೋಷಕರ ಪ್ರೀತಿಯ ಮಾರ್ಗದರ್ಶನ ಅಗತ್ಯ.`;
      challengeDescEn = `At age ${devoteeAge}, the child is progressing through primary intellectual development and schooling under ${maha} Mahadasha and ${bhukti} Bhukti, requiring nurturing guidance.`;
      rootCause = `ಮಗುವಿನ ಜನ್ಮ ಲಗ್ನಕ್ಕೆ ${toKannadaPlanet(maha)} ಮಹಾದಶಾ ಹಾಗೂ ಗೋಚಾರ ಶನಿ-ಗುರುಗಳ ಪ್ರಭಾವ.`;
      rootCauseEn = `Current ${maha} Mahadasha and Gochara transits shaping childhood learning.`;
      solutionKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ ಮತ್ತು ಮಹಾಮೃತ್ಯುಂಜಯ ರಕ್ಷಾ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.";
      solutionEn = "Sponsor Balagraha Shanti and Mahamrityunjaya Raksha Sankalpa at holy Gokarna Kotiteertha.";
    } else if (devoteeAge <= 23) {
      challengeArea = "Education & Career Foundation";
      challengeAreaKn = "ಉನ್ನತ ಶಿಕ್ಷಣ, ಕೌಶಲ್ಯ ವೃದ್ಧಿ & ವೃತ್ತಿ ಬುನಾದಿ";
      challengeDesc = `ಪ್ರಸ್ತುತ ${devoteeAge} ವರ್ಷದ ಪ್ರಾಯದಲ್ಲಿ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ, ಕೌಶಲ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ಭವಿಷ್ಯದ ವೃತ್ತಿ ಜೀವನಕ್ಕೆ ಭದ್ರ ಅಡಿಪಾಯ ಹಾಕುವ ಸುವರ್ಣ ಕಾಲಘಟ್ಟ. ಜನ್ಮ ಲಗ್ನದ ${toKannadaRashi(kundli.lagnaRashi.english)} ತತ್ವ ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(maha)} ಮಹಾದಶಾ - ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯು ನಿಮ್ಮಲ್ಲಿ ಹೊಸ ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಸ್ಪರ್ಧಾತ್ಮಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿವೆ. ಗೋಚಾರ ಗುರು ${liveGochara.guruHouseFromMoon}ನೇ ಮನೆಯ ಅನುಗ್ರಹದಿಂದ ಅಧ್ಯಯನದಲ್ಲಿ ದೃಢ ಏಕಾಗ್ರತೆ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಈ ಹಂತದ ಮುಖ್ಯ ಕಾರ್ಯ.`;
      challengeDescEn = `At age ${devoteeAge}, this prime youth phase is dedicated to higher education, competitive skill development, and career foundation under ${maha} Mahadasha and ${bhukti} Bhukti.`;
      rootCause = `ಲಗ್ನಾಧಿಪತಿಯ ಬಲ ಹಾಗೂ ${toKannadaPlanet(maha)} ಮಹಾದಶಾ ಮತ್ತು ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯ ವಿದ್ಯಾಕಾರಕ ಸಂಚಾರ.`;
      rootCauseEn = `Ascendant lord strength and academic transit under ${maha} Mahadasha and ${bhukti} Bhukti.`;
      solutionKn = "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ವಿದ್ಯಾ ಗಣಪತಿ ಸೇವೆ ನೆರವೇರಿಸಿ.";
      solutionEn = "Perform Medha Dakshinamurthy and Vidya Ganapati Sankalpa Pooja at Sri Kshetra Gokarna.";
    } else if (devoteeAge <= 58) {
      challengeArea = "Career & Financial Elevation";
      challengeAreaKn = "ವೃತ್ತಿ ವಿಕಾಸ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ & ದಶಾ-ಗೋಚಾರ ಸಮನ್ವಯ";
      challengeDesc = `ಪ್ರಸ್ತುತ ${devoteeAge} ವರ್ಷದ ಪ್ರಬುದ್ಧ ಜೀವಿತ ಘಟ್ಟದಲ್ಲಿ ನೀವು ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿ, ಕುಟುಂಬದ ಆರ್ಥಿಕ ಭದ್ರತೆ ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಹೂಡಿಕೆಗಳ ಮಹತ್ವದ ಹಂತದಲ್ಲಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${toKannadaPlanet(maha)} ಮಹಾದಶೆಯಲ್ಲಿ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯು ಕರ್ಮ-ಧನ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಹೊಸ ಸಾಧ್ಯತೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದು, ಚಂದ್ರನಿಂದ ${liveGochara.shaniHouseFromMoon}ನೇ ಮನೆಯ ಶನಿ ಮತ್ತು ${liveGochara.guruHouseFromMoon}ನೇ ಮನೆಯ ಗುರುವಿನ ಗೋಚಾರ ಸಂಚಾರವು ಯಾವುದೇ ಆತುರದ ನಿರ್ಧಾರಗಳಿಗೆ ಆಸ್ಪದ ನೀಡದೆ, ತಾಳ್ಮೆಯ ಕಾರ್ಯತಂತ್ರದಿಂದ ಮುನ್ನಡೆಯಲು ಸೂಚಿಸುತ್ತಿದೆ.`;
      challengeDescEn = `At age ${devoteeAge}, your primary focus is professional elevation, family financial consolidation, and strategic career growth under running ${maha} Mahadasha and ${bhukti} Bhukti with transit Jupiter and Saturn.`;
      rootCause = `10ನೇ ಕರ್ಮ ಸ್ಥಾನ ಹಾಗೂ 2ನೇ/11ನೇ ಧನ ಸ್ಥಾನಗಳ ಮೇಲೆ ${toKannadaPlanet(maha)} ಮಹಾದಶಾ, ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿ ಮತ್ತು ಗೋಚಾರ ಶನಿ-ಗುರುಗಳ ಪ್ರಭಾವ.`;
      rootCauseEn = `10th house of career and 2nd/11th houses of wealth energized by ${maha} Mahadasha and transiting Saturn/Jupiter.`;
      solutionKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಹಾಗೂ ಮಹಾಗಣಪತಿ ಹೋಮ ನೆರವೇರಿಸಿ.";
      solutionEn = "Perform Karma Siddhi Sankalpa Pooja and Mahaganapati Homa at holy Gokarna Mahabaleshwara Kshetra.";
    } else {
      challengeArea = "Spiritual Peace & Family Harmony";
      challengeAreaKn = "ಆಧ್ಯಾತ್ಮಿಕ ನೆಮ್ಮದಿ, ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ವಾನಪ್ರಸ್ಥ ಶಾಂತಿ";
      challengeDesc = `ಪ್ರಸ್ತುತ ${devoteeAge} ವರ್ಷದ ಪ್ರಾಯದಲ್ಲಿ ಲೌಕಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಸಮರ್ಥವಾಗಿ ಮುಗಿಸಿ, ಆಂತರಿಕ ಶಾಂತಿ, ನಿಯಮಿತ ಆರೋಗ್ಯ ಶಿಸ್ತು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆಗೆ ಆದ್ಯತೆ ನೀಡುವ ಪ್ರಶಾಂತ ಕಾಲಘಟ್ಟ. ${toKannadaPlanet(maha)} ಮಹಾದಶಾ ಹಾಗೂ ${toKannadaPlanet(bhukti)} ಭುಕ್ತಿಯ ದೈವಿಕ ಪ್ರಭಾವದಲ್ಲಿ ಪೂರ್ವಪುಣ್ಯ ಸ್ಮರಣೆ, ಸತ್ಸಂಗ ಹಾಗೂ ಪವಿತ್ರ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ದರ್ಶನವು ಮನಸ್ಸಿಗೆ ಅಖಂಡ ಧನ್ಯತೆಯನ್ನು ನೀಡಲಿದೆ.`;
      challengeDescEn = `At age ${devoteeAge}, this gracious life phase prioritizes inner spiritual tranquility, holistic vitality, and family legacy under ${maha} Mahadasha and ${bhukti} Bhukti.`;
      rootCause = `9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಮೋಕ್ಷ ಸ್ಥಾನಗಳ ಮೇಲೆ ${toKannadaPlanet(maha)} ಮಹಾದಶಾ ಹಾಗೂ ಚಂದ್ರನ ಗೋಚಾರ ಸಂಚಾರ.`;
      rootCauseEn = `9th house of dharma and moksha houses activated by ${maha} Mahadasha and planetary transits.`;
      solutionKn = "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆಯುಷ್ಯ ಶಾಂತಿ, ಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆತ್ಮಲಿಂಗ ಬಿಲ್ವಾರ್ಚನೆ ಸಮರ್ಪಿಸಿ.";
      solutionEn = "Sponsor Ayushya Shanti, Mahamrityunjaya Homa, and Atma Linga Bilvarchana at Sri Kshetra Gokarna.";
    }
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
      areaKn: challengeAreaKn,
      description: challengeDesc,
      descriptionEn: challengeDescEn,
      planetaryRootCause: rootCause,
      planetaryRootCauseEn: rootCauseEn,
      solutionKn,
      solutionEn
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
    goodBadAnalysis,
    isTeetotaler: goodBadAnalysis.isTeetotaler,
    hasMaritalFidelity: goodBadAnalysis.hasMaritalFidelity,
    negativeShades: evaluateNativeNegativeShadesAndCriminality(kundli, context, dashaTiming, liveGochara),
    currentLifeSituation: diagnoseCurrentLifeSituation(kundli, context, dashaTiming, liveGochara),
    accurateProfession: determineAccurateProfession(kundli, context)
  };
};

/* ==========================================================================
   6. INSTANT ONE-TAP QUESTIONS & ANSWERS GENERATOR (CRISP BULLET POINTS)
   ========================================================================= */

export const generateInstantQAList = (
  kundli: KundliOutput,
  diagnosis: CurrentLifeDiagnosis,
  prescriptions: AstrologicalPrescriptions,
  devoteeName?: string,
  devoteeAge: number = 30
): InstantQAQuestion[] => {
  const name = devoteeName || "ಭಕ್ತರೇ";
  const isChild = devoteeAge < 14;
  const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const moonNakKn = toKannadaNakshatra(moon?.nakshatra.english);
  const moonHouse = moon?.house ?? 1;

  const lagnaIdx = kundli.lagnaRashi.index;
  const secondLord = signLord((lagnaIdx + 1) % 12);
  const secondLordKn = toKannadaPlanet(secondLord);
  const thirdLord = signLord((lagnaIdx + 2) % 12);
  const thirdLordKn = toKannadaPlanet(thirdLord);
  const fourthLord = signLord((lagnaIdx + 3) % 12);
  const fourthLordKn = toKannadaPlanet(fourthLord);
  const fifthLord = signLord((lagnaIdx + 4) % 12);
  const fifthLordKn = toKannadaPlanet(fifthLord);
  const sixthLord = signLord((lagnaIdx + 5) % 12);
  const sixthLordKn = toKannadaPlanet(sixthLord);
  const seventhLord = signLord((lagnaIdx + 6) % 12);
  const seventhLordKn = toKannadaPlanet(seventhLord);
  const eighthLord = signLord((lagnaIdx + 7) % 12);
  const eighthLordKn = toKannadaPlanet(eighthLord);
  const ninthLord = signLord((lagnaIdx + 8) % 12);
  const ninthLordKn = toKannadaPlanet(ninthLord);
  const tenthLord = signLord((lagnaIdx + 9) % 12);
  const tenthLordKn = toKannadaPlanet(tenthLord);
  const eleventhLord = signLord((lagnaIdx + 10) % 12);
  const eleventhLordKn = toKannadaPlanet(eleventhLord);

  const h4PlanetsKn = kundli.planets.filter((p) => p.house === 4).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fourthLordKn} ಅಧಿಪತ್ಯ`;
  const h5PlanetsKn = kundli.planets.filter((p) => p.house === 5).map((p) => toKannadaPlanet(p.name)).join(", ") || `${fifthLordKn} ಅಧಿಪತ್ಯ`;
  const h7PlanetsKn = kundli.planets.filter((p) => p.house === 7).map((p) => toKannadaPlanet(p.name)).join(", ") || `${seventhLordKn} ಅಧಿಪತ್ಯ`;
  const h8PlanetsKn = kundli.planets.filter((p) => p.house === 8).map((p) => toKannadaPlanet(p.name)).join(", ") || `${eighthLordKn} ಅಧಿಪತ್ಯ`;
  const h10PlanetsKn = kundli.planets.filter((p) => p.house === 10).map((p) => toKannadaPlanet(p.name)).join(", ") || `${tenthLordKn} ಅಧಿಪತ್ಯ`;

  const dashaMaha = diagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.replace("ಪ್ರಸ್ತುತ ಮಹಾದಶಾ:", "").trim() || "ದಶಾ ಕಾಲ";
  const dashaMahaKn = toKannadaPlanet(dashaMaha);

  const dashaTiming = diagnosis.dashaTiming || calculateDynamicDashaTiming(kundli, devoteeAge);
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
  const venus = kundli.planets.find((p) => p.name === PlanetName.Venus);
  const mercury = kundli.planets.find((p) => p.name === PlanetName.Mercury);

  const marsHouse = mars?.house ?? 1;
  const isKujaDosha = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  const hasShani7th = saturn && (saturn.house === 7 || [1, 5, 10].includes(saturn.house));
  const hasSarpa7th = (rahu && rahu.house === 7) || (ketu && ketu.house === 7);
  const hasSarpa5th = (rahu && rahu.house === 5) || (ketu && ketu.house === 5);

  const neuterSigns = [2, 5, 10];
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

  const fifthLordPlanet = kundli.planets.find((p) => p.name === fifthLord);

  let specScore = 0;
  if (rahu && rahu.house === 5) specScore += 3.5;
  const isFifthLordNeecha = fifthLordPlanet && (
    (fifthLordPlanet.name === PlanetName.Mars && fifthLordPlanet.rashi.index === 3) ||
    (fifthLordPlanet.name === PlanetName.Sun && fifthLordPlanet.rashi.index === 6) ||
    (fifthLordPlanet.name === PlanetName.Moon && fifthLordPlanet.rashi.index === 7) ||
    (fifthLordPlanet.name === PlanetName.Jupiter && fifthLordPlanet.rashi.index === 9) ||
    (fifthLordPlanet.name === PlanetName.Venus && fifthLordPlanet.rashi.index === 5) ||
    (fifthLordPlanet.name === PlanetName.Saturn && fifthLordPlanet.rashi.index === 0) ||
    (fifthLordPlanet.name === PlanetName.Mercury && fifthLordPlanet.rashi.index === 11)
  );
  if (fifthLordPlanet && (isFifthLordNeecha || [6, 8, 12].includes(fifthLordPlanet.house))) specScore += 2.5;
  if (saturn && saturn.house === 8) specScore += 2.0;
  if (mars && mars.house === 8) specScore += 2.0;
  const isSpeculationLoss = specScore >= 4.0;

  const shadripus = detectNativeShadripuAfflictions(kundli);
  const lossInfo = getDynamicLossScaleText(kundli);

  const isBalarishta = moon && [6, 8, 12].includes(moon.house);
  const hasPittaColic = (mars && (mars.house === 1 || mars.house === 2 || mars.house === 5)) || isKujaDosha;

  if (isChild) {
    return [
      // 1. CHILD COLIC & CRYING
      {
        id: "q_child_1",
        category: "mind",
        categoryLabelKn: "👶 ಅಳು & ಪಿತ್ತ ಶೂಲೆ",
        questionKn: "ಮಗು ದಿನವಿಡೀ ಅಳುವುದು, ಹಠ ಮತ್ತು ಕಿರಿಕಿರಿ ಮಾಡಲು ನೈಜ ಜಾತಕ ಕಾರಣವೇನು?",
        questionEn: "Why does the child persistently cry and throw tantrums all day?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಹೌದು, ಮಗುವಿನ ಅಳು ಮತ್ತು ಕಿರಿಕಿರಿ ಸಾಮಾನ್ಯ ಹಠವಲ್ಲ; ಇದು ಜಾತಕದಲ್ಲಿರುವ ಜಠರದ ತೀವ್ರ ಪಿತ್ತ ಶೂಲೆ (Pitta Colic) ಹಾಗೂ ಬಾಲಗ್ರಹ ದೃಷ್ಟಿ ದೋಷದಿಂದ ಉಂಟಾಗುತ್ತಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ಲಗ್ನ ${lagnaKn}, ಚಂದ್ರ ರಾಶಿ ${moonRashiKn} (${moonNakKn} ನಕ್ಷತ್ರ). ${isBalarishta ? "ಚಂದ್ರನು ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದು ಬಾಲಾರಿಷ್ಟ ಯೋಗವನ್ನು ಉಂಟುಮಾಡುತ್ತಿದ್ದಾನೆ." : "ಚಂದ್ರನ ಮೇಲೆ ನೆರಳು ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ."} ${hasPittaColic ? "ಕುಜ ಗ್ರಹದ ಉಗ್ರ ಪಿತ್ತ ತತ್ವವು 2ನೇ ಮುಖ ಮತ್ತು 5ನೇ ಜಠರ ಸ್ಥಾನದ ಮೇಲೆ ಒತ್ತಡ ತರುತ್ತಿದೆ." : "ಲಗ್ನದ ಮೇಲೆ ತೀಕ್ಷ್ಣ ಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇದೆ."}
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಮಗುವಿಗೆ ಹೊಟ್ಟೆಯ ತೀವ್ರ ಪಿತ್ತದ ಉರಿ ಮತ್ತು ಅಸಹನೀಯ ಶೂಲೆ ನೋವನ್ನು ಮಾತಿನಲ್ಲಿ ಹೇಳಲು ತಿಳಿಯದೆ ಅಳು ಮತ್ತು ರೋದನದ ಮೂಲಕ ಹೊರಹಾಕುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(3, Math.round(remM / 2)))} Month${Math.max(1, Math.min(3, Math.round(remM / 2))) > 1 ? "s" : ""}) ಗ್ರಹಗಳ ಶಾಂತಿಯಿಂದ ಮಗುವಿನ ಕಿರಿಕಿರಿ ಗಣನೀಯವಾಗಿ ಉಪಶಮನಗೊಳ್ಳಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ, ರಕ್ಷಾ ಭಸ್ಮವನ್ನು ಮಗುವಿನ ಹಣೆಗೆ ನಿತ್ಯ ಧಾರಣೆ ಮಾಡಿಸಿ.`),
        astrologicalBasisKn: `ಚಂದ್ರನ ${moonHouse}ನೇ ಸ್ಥಾನ, ಕುಜ-ರಾಹು ದೃಷ್ಟಿ ಮತ್ತು ಜಠರ ಸ್ಥಾನದ ಗ್ರಹ ಸ್ಥಿತಿ.`,
        immediateRemedyKn: `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಭಸ್ಮ ಧಾರಣೆ ಮಾಡಿಸಿ ಮತ್ತು ಬಾಲಗ್ರಹ ಶಾಂತಿ ಸೇವೆ ಮಾಡಿಸಿ.`
      },

      // 2. FOOD REFUSAL & APPETITE
      {
        id: "q_child_2",
        category: "children",
        categoryLabelKn: "🥣 ಆಹಾರ & ಜೀರ್ಣಶಕ್ತಿ",
        questionKn: "ಮಗು ಸರಿಯಾಗಿ ಊಟ ಮಾಡದೆ ಹಠ ಮಾಡುವುದು ಮತ್ತು ಆಹಾರ ನಿರಾಕರಣೆಗೆ ಕಾರಣವೇನು?",
        questionEn: "Why does the child refuse food and show poor appetite?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮಗುವಿಗೆ ಹಸಿವಿನ ಕೊರತೆಯಲ್ಲ, 2ನೇ ಮುಖ ಮತ್ತು ಆಹಾರ ಸ್ಥಾನ ಹಾಗೂ 5ನೇ ಜೀರ್ಣಾಂಗದಲ್ಲಿ ಅಗ್ನಿಮಾಂದ್ಯ ಇರುವುದರಿಂದ ಆಹಾರವನ್ನು ಜಗಿಯಲು ಕಷ್ಟಪಡುತ್ತಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: 2ನೇ ಆಹಾರ ಸ್ಥಾನದಲ್ಲಿ ${secondLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, 5ನೇ ಜಠರ ಸ್ಥಾನದ ಮೇಲೆ ${fifthLordKn} ಮತ್ತು ಕುಜ ಗ್ರಹದ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಆಹಾರ ಸೇವಿಸಿದ ತಕ್ಷಣ ಹೊಟ್ಟೆಯಲ್ಲಿ ಉರಿ ಅಥವಾ ವಾಯು ಪ್ರಕೋಪ ಉಂಟಾಗುವುದರಿಂದ ಮಗು ಆಹಾರವನ್ನು ಕಂಡರೆ ಭಯಪಟ್ಟು ನಾಲಿಗೆಯಿಂದ ಹೊರದೂಡುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(3, Math.round(remM / 2)))} Month${Math.max(1, Math.min(3, Math.round(remM / 2))) > 1 ? "s" : ""}) ಜೀರ್ಣಶಕ್ತಿ ಸಮತೋಲನಗೊಂಡು ಮಗು ಸಂತೋಷದಿಂದ ಆಹಾರ ಸೇವಿಸಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಅನ್ನಪೂರ್ಣಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮಗುವಿಗೆ ತೀರ್ಥ ಪ್ರಾಶನ ಮಾಡಿಸಿ. ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೋದಕ ಸಮರ್ಪಿಸಿ ಪ್ರಾರ್ಥಿಸಿ.`),
        astrologicalBasisKn: `2ನೇ ಮನೆ (ಆಹಾರ) ಮತ್ತು 5ನೇ ಮನೆ (ಜಠರ ಅಗ್ನಿ) ಗ್ರಹ ಪ್ರಭಾವ.`,
        immediateRemedyKn: `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಅನ್ನಪೂರ್ಣಾ ಅಷ್ಟಕ ಪಠಿಸಿ ಮತ್ತು ತುಳಸಿ ತೀರ್ಥ ನೀಡಿ.`
      },

      // 3. SUNSET EVIL EYE & NIGHT STARTLES
      {
        id: "q_child_3",
        category: "mind",
        categoryLabelKn: "👁️ ಸಂಜೆ ದೃಷ್ಟಿ ದೋಷ",
        questionKn: "ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ಸಮಯದಲ್ಲಿ ಮಗು ಹೆಚ್ಚು ಕಿರಿಕಿರಿ ಮತ್ತು ರಾತ್ರಿ ನಿದ್ದೆಯಲ್ಲಿ ಬೆದರುವುದು ಏಕೆ?",
        questionEn: "Why does the child become fussy at sunset and startle in sleep?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಹೌದು, ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ಗೋಧೂಳಿ ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ ಹೊರಗಿನ ದೃಷ್ಟಿ ದೋಷ ಮತ್ತು ವಾತಾವರಣದ ಋಣಾತ್ಮಕ ಶಕ್ತಿಗಳ ಸ್ಪರ್ಶದಿಂದ ಮಗುವಿಗೆ ಭೀತಿ ಉಂಟಾಗುತ್ತಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಲಗ್ನದ ಮೇಲೆ ಛಾಯಾಗ್ರಹಗಳ ಸೂಕ್ಷ್ಮ ಪ್ರಭಾವವಿದ್ದು, ಮನಃಕಾರಕ ಚಂದ್ರನಿಗೆ ${moonNakKn} ನಕ್ಷತ್ರದ ಸೂಕ್ಷ್ಮ ಸಂವೇದನಾಶೀಲತೆಯಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಸಾರ್ವಜನಿಕರ ದೃಷ್ಟಿ ಬಾಧೆ (Evil Eye) ಹಾಗೂ ಸಂಧ್ಯಾ ಕಾಲದ ತಮೋಗುಣದ ಪರಿಣಾಮವಾಗಿ ಮಗು ರಾತ್ರಿ ಗಾಢ ನಿದ್ದೆಯಲ್ಲಿ ಬೆದರಿ ಚೀರುತ್ತಾ ಎಚ್ಚರಗೊಳ್ಳುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ (Next 1 Month) ನಿರಂತರ ದೃಷ್ಟಿ ನಿವಾರಣೆ ಹಾಗೂ ರಕ್ಷಾ ಕವಚದಿಂದ ಮಗುವಿನ ಭೀತಿ ನಿವಾರಣೆಯಾಗಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ಗೋಧೂಳಿ ಸಂಧ್ಯಾ ಸಮಯದಲ್ಲಿ ಕಲ್ಲುಪ್ಪು ಮತ್ತು ಸಾಸಿವೆಯಿಂದ ಮಗುವಿಗೆ ದೃಷ್ಟಿ ತೆಗೆಯಿರಿ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ರಕ್ಷಾ ದಾರವನ್ನು ಮಗುವಿನ ಕೈಗೆ ಕಟ್ಟಿ.`),
        astrologicalBasisKn: `8ನೇ ಗೂಢ ಭಾವ ಮತ್ತು ಚಂದ್ರನ ನಕ್ಷತ್ರದ ಮೇಲಿನ ಛಾಯಾಗ್ರಹ ಪ್ರಭಾವ.`,
        immediateRemedyKn: `ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ಸಮಯದಲ್ಲಿ ಕಲ್ಲುಪ್ಪು-ಸಾಸಿವೆ ದೃಷ್ಟಿ ತೆಗೆದು ಬೆಂಕಿಗೆ ಹಾಕಿ.`
      },

      // 4. SCHOOLING & FOCUS
      {
        id: "q_child_4",
        category: "career",
        categoryLabelKn: "📚 ವಿದ್ಯಾಭ್ಯಾಸ & ಏಕಾಗ್ರತೆ",
        questionKn: "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಗಮನ, ಶಾಲಾ ಏಕಾಗ್ರತೆ ಮತ್ತು ಚಂಚಲತೆ ನಿವಾರಣೆ ಹೇಗೆ?",
        questionEn: "How to improve child's schooling focus and overcome distraction?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮಗುವಿಗೆ ಅಪಾರ ಜಾಣ್ಮೆ ಮತ್ತು ಗ್ರಹಣ ಶಕ್ತಿಯಿದೆ; ಆದರೆ ಒಂದೆಡೆ ಸ್ಥಿರವಾಗಿ ಕೂತು ಓದುವ ಏಕಾಗ್ರತೆಯಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಚಂಚಲತೆ ಕಾಣಿಸುತ್ತಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: 4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನದಲ್ಲಿ ${fourthLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, ಬುದ್ಧಿಕಾರಕ ಬುಧ ಗ್ರಹದ ಸಂಚಾರ ಬಲವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಮನಃಕಾರಕ ಚಂದ್ರನ ಚಂಚಲ ಗುಣದಿಂದಾಗಿ ಮಗುವಿನ ಗಮನವು ಬೇಗನೆ ಬೇರೆಡೆಗೆ ಹರಿಯುತ್ತದೆ ಮತ್ತು ಓದುವುದಕ್ಕಿಂತ ಆಟದತ್ತ ಹೆಚ್ಚು ಆಕರ್ಷಿತವಾಗುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, remM)} Month${Math.max(2, remM) > 1 ? "s" : ""}) ಬುಧನ ಅನುಗ್ರಹದಿಂದ ಏಕಾಗ್ರತೆ ಹೆಚ್ಚಿ ಶಾಲಾ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಉತ್ತಮ ಸಾಧನೆ ತೋರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ದಿನನಿತ್ಯ ಹಯಗ್ರೀವ ಸ್ತೋತ್ರ ಅಥವಾ 'ಓಂ ಸರಸ್ವತ್ಯೈ ನಮಃ' ಜಪಿಸಿ. ಗೋಕರ್ಣ ವಿದ್ಯಾ ಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸರಸ್ವತಿ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ.`),
        astrologicalBasisKn: `4ನೇ ಮನೆ (ವಿದ್ಯಾ ಸ್ಥಾನ) ಮತ್ತು ಬುದ್ಧಿಕಾರಕ ಬುಧನ ಸ್ಥಿತಿ.`,
        immediateRemedyKn: `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಸರಸ್ವತಿ ಮಂತ್ರ ಪಠಿಸಿ ಮತ್ತು ಹಸಿರು ಬಟ್ಟೆಯಲ್ಲಿ ಏಲಕ್ಕಿ ಇಡಿ.`
      },

      // 5. SIBLING FIGHTS & ANGER
      {
        id: "q_child_5",
        category: "children",
        categoryLabelKn: "⚔️ ಜಗಳ & ಹಠದ ಸಿಟ್ಟು",
        questionKn: "ಮಗು ಸದಾ ಜಗಳ, ಸಾಮಾನುಗಳನ್ನು ಎಸೆಯುವುದು ಮತ್ತು ಅತಿಯಾದ ಸಿಟ್ಟು ಪ್ರದರ್ಶಿಸುವುದು ಏಕೆ?",
        questionEn: "Why is the child aggressive, fighting with siblings and showing fiery anger?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಜಾತಕದಲ್ಲಿ ಅಗ್ನಿ ತತ್ವದ ಕುಜ ಗ್ರಹದ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಮಗುವಿನಲ್ಲಿ ಹಠ, ಸಿಟ್ಟು ಮತ್ತು ವಸ್ತುಗಳನ್ನು ಎಸೆಯುವ ಆಕ್ರಮಣಕಾರಿ ಪ್ರವೃತ್ತಿ ಕಂಡುಬರುತ್ತಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಲಗ್ನ ಅಥವಾ 3ನೇ ಪರಾಕ್ರಮ ಭಾವದ ಮೇಲೆ ಕುಜ ಗ್ರಹದ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ ಬೀಳುತ್ತಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ದೇಹದಲ್ಲಿ ಪಿತ್ತ ದೋಷ ಹೆಚ್ಚಾದಾಗ ಮಗುವಿಗೆ ತನ್ನ ಆವೇಗವನ್ನು ತಡೆಯಲು ಸಾಧ್ಯವಾಗದೆ ಸಣ್ಣ ವಿಷಯಕ್ಕೂ ಕಿರುಚಾಡಿ ಜಗಳ ಮಾಡುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, remM)} Month${Math.max(2, remM) > 1 ? "s" : ""}) ಶಾಂತ ಸ್ವಭಾವ ಮರಳಿ ಬಂದು ಸಹೋದರರು ಮತ್ತು ಸ್ನೇಹಿತರೊಂದಿಗೆ ಪ್ರೀತಿಯಿಂದ ಬೆರೆಯಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಪ್ರತಿದಿನ ಸುಬ್ರಹ್ಮಣ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶಾಂತಿ ಅಭಿಷೇಕ ಸಮರ್ಪಿಸಿ.`),
        astrologicalBasisKn: `3ನೇ ಮನೆ (ಧೈರ್ಯ/ಸಹೋದರ) ಮತ್ತು ಕುಜ ಗ್ರಹದ ಅಗ್ನಿ ತತ್ವ.`,
        immediateRemedyKn: `ಮಗುವಿಗೆ ಬೆಳ್ಳಿಯ ಕಡಗ ಅಥವಾ ಸರ ಧರಿಸಿ ಮತ್ತು ತಂಪಾದ ಹಾಲು-ತುಪ್ಪ ನೀಡಿ.`
      },

      // 6. IMMUNITY & RECURRING COLD/FEVER
      {
        id: "q_child_6",
        category: "mind",
        categoryLabelKn: "🩺 ಆರೋಗ್ಯ & ರೋಗನಿರೋಧಕತೆ",
        questionKn: "ಮಗುವಿಗೆ ಪದೇ ಪದೇ ಶೀತ, ಜ್ವರ ಮತ್ತು ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಕೊರತೆ ನಿವಾರಣೆ ಹೇಗೆ?",
        questionEn: "How to strengthen child's immunity and prevent recurring seasonal illness?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಜಾತಕದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಯಿಂದ ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ (Immunity) ಬಲಗೊಂಡು ಪದೇ ಪದೇ ಬರುವ ಶೀತ-ಜ್ವರದಿಂದ ಮುಕ್ತಿ ಸಿಗಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಲಗ್ನಾಧಿಪತಿ ಮತ್ತು 6ನೇ ರೋಗ ಸ್ಥಾನದ ಅಧಿಪತಿಯ ಮೇಲೆ ಜಲ-ಕಫ ರಾಶಿಗಳ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಋತು ಬದಲಾದಾಗ ವಾತಾವರಣದ ತೇವಾಂಶ ಮತ್ತು ಶೀತ ಮಗುವಿನ ಶ್ವಾಸಕೋಶ ಹಾಗೂ ಗಂಟಲಿನಲ್ಲಿ ಕಫ ಸಂಚಯಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(3, Math.round(remM / 2)))} Month${Math.max(1, Math.min(3, Math.round(remM / 2))) > 1 ? "s" : ""}) ದೈಹಿಕ ರೋಗನಿರೋಧಕತೆ ಸುಧಾರಿಸಿ ಮಗು ಲವಲವಿಕೆಯಿಂದ ಇರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಧನ್ವಂತರಿ ಮಂತ್ರ 'ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ಧನ್ವಂತರಯೇ ನಮಃ' ಪಠಿಸಿ. ಗೋಕರ್ಣದಲ್ಲಿ ಆಯುಷ್ಯ ಹೋಮ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಜಪ ಸಂಕಲ್ಪ ಮಾಡಿಸಿ.`),
        astrologicalBasisKn: `ಲಗ್ನ (ಆರೋಗ್ಯ) ಮತ್ತು 6ನೇ ಭಾವದ (ರೋಗ ಪರಿಹಾರ) ಗ್ರಹ ಸ್ಥಿತಿ.`,
        immediateRemedyKn: `ಧನ್ವಂತರಿ ಮಂತ್ರ ಪಠಿಸಿ ತುಳಸಿ ರಸ ಮತ್ತು ಜೇನುತುಪ್ಪ ಪ್ರಾಶನ ಮಾಡಿಸಿ.`
      },

      // 7. SEPARATION ANXIETY & FEAR OF DARK
      {
        id: "q_child_7",
        category: "mind",
        categoryLabelKn: "🤱 ತಾಯಿ ಸಾಮೀಪ್ಯ & ಭಯ",
        questionKn: "ಮಗು ತಾಯಿಯನ್ನು ಬಿಟ್ಟಿರಲು ನಿರಾಕರಿಸುವುದು ಮತ್ತು ಒಂಟಿಯಾಗಿ ಮಲಗಲು ಹೆದರುವುದು ಏಕೆ?",
        questionEn: "Why does child cling to mother and fear sleeping alone in the dark?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: 4ನೇ ಮಾತೃ ಸ್ಥಾನ ಮತ್ತು ಚಂದ್ರನ ಸೂಕ್ಷ್ಮತೆಯಿಂದಾಗಿ ಮಗುವಿನಲ್ಲಿ ತಾಯಿಯ ಅಗಲಿಕೆಯ ಆತಂಕ (Separation Anxiety) ಹಾಗೂ ಕತ್ತಲೆಯ ಭಯ ಉಂಟಾಗುತ್ತಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: 4ನೇ ಮನೆಯಲ್ಲಿ ${fourthLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, ಚಂದ್ರನು ತಾಯಿಯ ಕಾರಕ ಗ್ರಹವಾಗಿದ್ದಾನೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಚಂದ್ರನ ಮೇಲಿನ ನೆರಳು ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ಮಗು ಒಂಟಿಯಾದಾಗ ಅಸುರಕ್ಷಿತ ಭಾವನೆ ಅನುಭವಿಸುತ್ತದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ (Next 1 Month) ರಕ್ಷಾ ಕವಚ ಹಾಗೂ ದೈವಿಕ ಸಂಕಲ್ಪದಿಂದ ಮಗುವಿನ ಮನಸ್ಸಿನ ಅಂಜಿಕೆ ಸಂಪೂರ್ಣವಾಗಿ ದೂರವಾಗಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ 11 ಬಾರಿ 'ಶ್ರೀ ರಾಮ ರಕ್ಷಾ ಸ್ತೋತ್ರ' ಪಠಿಸಿ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಶ್ರೀ ಚಕ್ರ ತೀರ್ಥವನ್ನು ಮಗುವಿಗೆ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿ.`),
        astrologicalBasisKn: `4ನೇ ಮನೆ (ಮಾತೃ ಸ್ಥಾನ) ಮತ್ತು ಮನಃಕಾರಕ ಚಂದ್ರನ ಸ್ಥಿತಿ.`,
        immediateRemedyKn: `ರಾತ್ರಿ ಮಲಗುವಾಗ ಶ್ರೀ ರಾಮ ಜಯ ರಾಮ ಮಂತ್ರ ಪಠಿಸಿ ಮತ್ತು ತಲೆಯ ಬಳಿ ನವಿಲುಗರಿ ಇಡಿ.`
      },

      // 8. GOKARNA BALAGRAHA SHANTI
      {
        id: "q_child_8",
        category: "mind",
        categoryLabelKn: "🪔 ಗೋಕರ್ಣ ಬಾಲಗ್ರಹ ಶಾಂತಿ",
        questionKn: "ಮಗುವಿನ ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಸಕಲ ದೋಷ ನಿವಾರಣೆಗೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಯಾವ ಸೇವೆ ಶ್ರೇಷ್ಠ?",
        questionEn: "Which Gokarna Seva is supreme for child's longevity and dosha clearance?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ನೆರವೇರಿಸುವ 'ಬಾಲಗ್ರಹ ಶಾಂತಿ' ಮತ್ತು 'ಮೃತ್ಯುಂಜಯ ಹೋಮ'ವು ಮಗುವಿನ ಸಕಲ ಗ್ರಹ ಪೀಡೆಗಳನ್ನು ಶಮನಗೊಳಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಜಾತಕದ ಲಗ್ನ ಮತ್ತು ಚಂದ್ರನ ರಕ್ಷಣೆಗಾಗಿ ಆಯುಃಕಾರಕ ಶನಿ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಈಶ್ವರನ ಅನುಗ್ರಹ ಅಗತ್ಯವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಜನನ ಕಾಲದ ಗ್ರಹ ಮೈತ್ರಿ ಕೊರತೆ ಹಾಗೂ ಬಾಲಾರಿಷ್ಟದ ಸೂಕ್ಷ್ಮ ನೆರಳು ನಿವಾರಣೆಯಾಗಲು ತೀರ್ಥ ಕ್ಷೇತ್ರದ ದೈವಿಕ ಶಕ್ತಿ ಫಲಕಾರಿಯಾಗಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ (Next 1 Month) ಗೋಕರ್ಣ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸುವುದರಿಂದ ಮಗುವಿನ ಜೀವನದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಪರಿವರ್ತನೆ ಕಾಣಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`),
        astrologicalBasisKn: `ಲಗ್ನ ಬಲವರ್ಧನೆ ಮತ್ತು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ತೀರ್ಥ ಮಹಾತ್ಮೆ.`,
        immediateRemedyKn: `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ರಕ್ಷಾ ಭಸ್ಮ ಮತ್ತು ತೀರ್ಥ ಧಾರಣೆ ಮಾಡಿಸಿ.`
      },

      // 9. SCREEN ADDICTION & TV OBSESSION
      {
        id: "q_child_9",
        category: "wealth",
        categoryLabelKn: "📱 ಮೊಬೈಲ್ & ಪರದೆಯ ಗೀಳು",
        questionKn: "ಮಗುವಿಗೆ ಮೊಬೈಲ್, ಟಿವಿ ಪರದೆಯ ಅತಿಯಾದ ಗೀಳು ಬಿಡಿಸಿ ನೈಜ ಆಟ-ಪಾಠಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಮೂಡಿಸುವುದು ಹೇಗೆ?",
        questionEn: "How to cure child's mobile screen addiction and stimulate real play?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ರಾಹು ಗ್ರಹದ ಭ್ರಮಾತ್ಮಕ ತಂತ್ರಜ್ಞಾನ ಆಕರ್ಷಣೆಯಿಂದ ಮಗು ಮೊಬೈಲ್-ಟಿವಿ ಪರದೆಗೆ ಮಾರುಹೋಗಿದೆ; ಬೌದ್ಧಿಕ ಚಟುವಟಿಕೆಗಳ ಮೂಲಕ ಇದನ್ನು ಹಂತಹಂತವಾಗಿ ಬಿಡಿಸಬಹುದು.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನ ಹಾಗೂ 2ನೇ ದೃಷ್ಟಿ/ನೇತ್ರ ಭಾವದ ಮೇಲೆ ರಾಹುವಿನ ಸೂಕ್ಷ್ಮ ನೆರಳು ಇದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಪರದೆಯ ಬೆಳಕು ಮತ್ತು ವೇಗದ ದೃಶ್ಯಗಳು ಮಗುವಿನ ಮೆದುಳಿನಲ್ಲಿ ಡೋಪಮೈನ್ ಭ್ರಮೆ ಹುಟ್ಟಿಸಿ ನೈಜ ಜಗತ್ತಿನಿಂದ ವಿಮುಖವಾಗುವಂತೆ ಮಾಡುತ್ತವೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(3, Math.round(remM / 2)))} Month${Math.max(1, Math.min(3, Math.round(remM / 2))) > 1 ? "s" : ""}) ರಾಹುವಿನ ಶಾಂತಿಯಿಂದ ಮಗು ಪರದೆಯ ಗೀಳಿನಿಂದ ಹೊರಬರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ 'ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ' ಜಪಿಸಿ. ಗೋಕರ್ಣದಲ್ಲಿ ಗಣೇಶ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ.`),
        astrologicalBasisKn: `5ನೇ (ಬುದ್ಧಿ/ಆಕರ್ಷಣೆ) ಮತ್ತು ರಾಹು ಗ್ರಹದ ಮಾಯಾ ಪ್ರಭಾವ.`,
        immediateRemedyKn: `ಸಂಜೆ ಸಮಯದಲ್ಲಿ ಮೊಬೈಲ್ ಬದಲು ಮಣ್ಣಿನ ಆಟ ಅಥವಾ ಚಿತ್ರಕಲೆಯಲ್ಲಿ ತೊಡಗಿಸಿ.`
      },

      // 10. MEMORY POWER & SPEECH CLARITY
      {
        id: "q_child_10",
        category: "career",
        categoryLabelKn: "🧠 ಜ್ಞಾಪಕಶಕ್ತಿ & ವಾಕ್ ಶುದ್ಧಿ",
        questionKn: "ಮಗುವಿನ ಬುದ್ಧಿಶಕ್ತಿ, ನೆನಪಿನ ಶಕ್ತಿ ಮತ್ತು ಸ್ಪಷ್ಟ ಮಾತು-ಉಚ್ಚಾರಣೆ ವೃದ್ಧಿಗೆ ಪರಿಹಾರವೇನು?",
        questionEn: "How to enhance child's memory retention and articulate speech clarity?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಬುಧ ಮತ್ತು ಗುರು ಗ್ರಹಗಳ ಬಲವರ್ಧನೆಯಿಂದ ಮಗುವಿನ ನೆನಪಿನ ಶಕ್ತಿ ಅಗಾಧವಾಗಿ ಹೆಚ್ಚಿ, ಸ್ಪಷ್ಟ ಮತ್ತು ಶುದ್ಧ ವಾಕ್ ಸಾಮರ್ಥ್ಯ ಸಿದ್ಧಿಸಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: 2ನೇ ವಾಕ್ ಸ್ಥಾನದಲ್ಲಿ ${secondLordKn} ಹಾಗೂ 5ನೇ ಮೇಧಾ ಸ್ಥಾನದಲ್ಲಿ ${fifthLordKn} ಶುಭ ಯೋಗವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ನಾಲಿಗೆಯಲ್ಲಿ ಸೂಕ್ಷ್ಮ ಕಫ ದೋಷ ಅಥವಾ ಆತುರದ ಮಾತುಗಾರಿಕೆಯಿಂದ ಕೆಲವು ಅಕ್ಷರಗಳ ಉಚ್ಚಾರಣೆಯಲ್ಲಿ ಸ್ವಲ್ಪ ತೊದಲು ಅಥವಾ ವಿಳಂಬ ಕಾಣಿಸಬಹುದು.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, remM)} Month${Math.max(2, remM) > 1 ? "s" : ""}) ಬುಧನ ಅನುಗ್ರಹದಿಂದ ವಾಕ್ ಶುದ್ಧಿ ಹಾಗೂ ಅದ್ಭುತ ಜ್ಞಾಪಕ ಶಕ್ತಿ ಪ್ರಕಟವಾಗಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ದಿನನಿತ್ಯ ಬ್ರಾಹ್ಮೀ ಘೃತ ಸೇವನೆ ಮಾಡಿಸಿ ಹಾಗೂ 'ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ' ಮಂತ್ರ 11 ಬಾರಿ ಪಠಿಸಿ. ಗೋಕರ್ಣದಲ್ಲಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.`),
        astrologicalBasisKn: `2ನೇ ಮನೆ (ವಾಕ್ ಸ್ಥಾನ) ಮತ್ತು 5ನೇ ಮನೆ (ಮೇಧಾ ಶಕ್ತಿ) ಗ್ರಹ ಸ್ಥಿತಿ.`,
        immediateRemedyKn: `ದಿನನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಬ್ರಾಹ್ಮೀ ಘೃತ ನೀಡಿ ಮತ್ತು ಸರಸ್ವತಿ ಮಂತ್ರ ಪಠಿಸಿ.`
      },

      // 11. PROTECTIVE AMULET & TALISMAN
      {
        id: "q_child_11",
        category: "mind",
        categoryLabelKn: "🛡️ ರಕ್ಷಾ ಕವಚ & ಪಂಚಲೋಹ",
        questionKn: "ಮಗುವಿನ ಸರ್ವತೋಮುಖ ರಕ್ಷಣೆಗೆ ಯಾವ ತಾಯಿತ, ರತ್ನ ಅಥವಾ ಬೆಳ್ಳಿ ಧಾರಣೆ ಮಾಡಿಸಬೇಕು?",
        questionEn: "Which sacred amulet, silver or talisman offers complete divine protection?",
        panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮಗುವಿನ ಜಾತಕಕ್ಕೆ ಶುದ್ಧ ಬೆಳ್ಳಿಯಲ್ಲಿ ಮಾಡಿಸಿದ ರಕ್ಷಾ ಕವಚ ಅಥವಾ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪವಿತ್ರ ರಕ್ಷಾ ಸೂತ್ರ ಧಾರಣೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ರಕ್ಷಣೆ ನೀಡಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ಮಗುವಿನ ಲಗ್ನ ${lagnaKn} ಮತ್ತು ಚಂದ್ರ ರಾಶಿ ${moonRashiKn} ರಕ್ಷಣೆಗೆ ಬೆಳ್ಳಿ (ಚಂದ್ರನ ಲೋಹ) ಅತ್ಯಂತ ಸಾತ್ವಿಕ ಫಲ ನೀಡುತ್ತದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಬಾಲ್ಯಾವಸ್ಥೆಯಲ್ಲಿ ಗ್ರಹಗಳ ತೀಕ್ಷ್ಣ ಕಿರಣಗಳಿಂದ ಮೃದುವಾದ ಶರೀರವನ್ನು ರಕ್ಷಿಸಲು ಲೋಹ ಮತ್ತು ಮಂತ್ರ ಸಂಸ್ಕಾರದ ಕವಚ ಅಗತ್ಯ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ (Next 1 Month) ರಕ್ಷಾ ಕವಚ ಧಾರಣೆಯ ನಂತರ ಮಗುವಿನ ಆರೋಗ್ಯ ಮತ್ತು ನಡವಳಿಕೆಯಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಣಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಅಭಿಷೇಕ ಮಾಡಿಸಿದ ರಕ್ಷಾ ತಾಯಿತ ಅಥವಾ ಕಪ್ಪು-ಕೆಂಪು ದಾರವನ್ನು ಮಗುವಿನ ಕುತ್ತಿಗೆ ಅಥವಾ ಬಲಗೈಗೆ ಕಟ್ಟಿ.`),
        astrologicalBasisKn: `ಲಗ್ನ ರಕ್ಷಣೆ ಮತ್ತು ಲೋಹ ತತ್ವ ಶಾಸ್ತ್ರ.`,
        immediateRemedyKn: `ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಸರದಲ್ಲಿ ಗೋಕರ್ಣ ರಕ್ಷಾ ತಾಯಿತ ಧಾರಣೆ ಮಾಡಿಸಿ.`
      }
    ];
  }

  return [
    // 1. CAREER PROGRESS
    {
      id: "q_career_1",
      category: "career",
      categoryLabelKn: "💼 ಉದ್ಯೋಗ & ವೃತ್ತಿ",
      questionKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಯಾವಾಗ ಪ್ರಗತಿ ಅಥವಾ ಹೊಸ ಅವಕಾಶ ಸಿಗುತ್ತದೆ?",
      questionEn: "When will I get career progress or a new job opportunity?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ನೂತನ ಉದ್ಯೋಗಾವಕಾಶ, ಬಡ್ತಿ ಹಾಗೂ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯ ಶುಭ ಯೋಗ ಕೂಡಿಬರಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${tenthLordKn} ಅಧಿಪತ್ಯವಿದ್ದು, ಪ್ರಸ್ತುತ ${dashaMahaKn} ಮಹಾದಶಾ ಸಂಚಾರ ನಡೆಯುತ್ತಿದೆ. 10ನೇ ಮನೆಯಲ್ಲಿ ${h10PlanetsKn} ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಗೋಚಾರ ಶನಿ-ರಾಹುಗಳ ಸೂಕ್ಷ್ಮ ದೃಷ್ಟಿಯಿಂದಾಗಿ ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗುವುದು ತಾತ್ಕಾಲಿಕವಾಗಿ ವಿಳಂಬವಾಗುತ್ತಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ಗೋಚಾರ ಗುರುವಿನ ಪೂರ್ಣ ದೃಷ್ಟಿ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳಲಿದ್ದು, ಉದ್ಯೋಗದಲ್ಲಿ ದೊಡ್ಡ ತಿರುವು ದೊರೆಯಲಿದೆ.
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

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ ನಷ್ಟದ ಹರಿವು ನಿಂತು ಹೊಸ ಗ್ರಾಹಕರಿಂದ ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ವೃದ್ಧಿಯಾಗಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 2ನೇ ಧನಕೋಶ ಮತ್ತು 11ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${eleventhLordKn} ಗ್ರಹದ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ವ್ಯಾಪಾರದಲ್ಲಿ ಇತ್ತೀಚೆಗೆ ಬಂದ ಅನಿರೀಕ್ಷಿತ ಧನವ್ಯಯ ಅಥವಾ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹಳೆಯ ಬಾಕಿ ಹಣ ನಿಲ್ಲದಿರುವುದು ಬಂಡವಾಳದ ಸರಾಗ ಹರಿವಿಗೆ ಅಡ್ಡಿಯಾಗಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, remM)} Month${Math.max(2, remM) > 1 ? "s" : ""}) ಹೊಸ ಗ್ರಾಹಕರ ಸಂಪರ್ಕ ಮತ್ತು ಹಳೆಯ ಬಾಕಿ ಹಣದ ವಸೂಲಿ ಆರಂಭವಾಗಿ ವ್ಯಾಪಾರ ಲಾಭದಾಯಕ ಹಳಿಗೆ ಮರಳಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ 'ಓಂ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ' ಮಂತ್ರ ಪಠಿಸಿ. ಗೋಕರ್ಣದಲ್ಲಿ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟರಮಣ ಪೂಜಾ ಸಂಕಲ್ಪ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `2ನೇ (ಧನ ಕೋಶ) ಮತ್ತು 11ನೇ (ಲಾಭ ಸ್ಥಾನ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ಶ್ರೀ ಯಂತ್ರ ಸ್ಥಾಪಿಸಿ ಮತ್ತು ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಮಾಡಿ.`
    },

    // 3. WORKPLACE POLITICS & JEALOUSY (MATSARYA)
    {
      id: "q_career_3",
      category: "career",
      categoryLabelKn: "💼 ಕಚೇರಿ ರಾಜಕೀಯ",
      questionKn: "ಕಚೇರಿಯಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳಿಂದ ಕಿರುಕುಳ ಹಾಗೂ ಗೌರವದ ಕೊರತೆ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to overcome workplace politics and lack of recognition?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮುಂದಿನ ${Math.max(1, Math.min(4, Math.round(remM * 0.75)))} ತಿಂಗಳಲ್ಲಿ ಕಚೇರಿ ಕಿರುಕುಳ ಮತ್ತು ರಾಜಕೀಯ ತಾನಾಗಿಯೇ ಉಪಶಮನಗೊಂಡು ನಿಮ್ಮ ಸ್ಥಾನಮಾನ ಮರುಸ್ಥಾಪನೆಯಾಗಲಿದೆ.
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

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇನ್ನು ಮುಂದಿನ ${Math.max(3, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(3, remM)} Month${Math.max(3, remM) > 1 ? "s" : ""}) ಕಂಕಣ ಭಾಗ್ಯ ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದ್ದು, ಸಂಸ್ಕಾರಯುತ ಕುಟುಂಬದಿಂದ ವಿವಾಹ ನಿಶ್ಚಯವಾಗಲಿದೆ.
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
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(3, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(3, remM)} Month${Math.max(3, remM) > 1 ? "s" : ""}) ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಯೋಗ್ಯ ವಿವಾಹ ಪ್ರಸ್ತಾಪ ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ${
  isKujaDosha
    ? "ದಿನನಿತ್ಯ ಕುಜ ಗಾಯತ್ರಿ ಜಪಿಸಿ ('ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ'). ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಕುಜ ಶಾಂತಿ ಪೂಜೆ ನೆರವೇರಿಸಿ."
    : "ದಿನನಿತ್ಯ 'ಓಂ ಕಾತ್ಯಾಯನಿ ಮಹಾಮಾಯೇ ಮಹಾಯೋಗಿನ್ಯಧೀಶ್ವರಿ' ಅಥವಾ 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಜಪಿಸಿ. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ."
}`),
      astrologicalBasisKn: `7ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ ${seventhLordKn}) ಮತ್ತು ಗುರು-ಕುಜ ಗೋಚಾರ ಬಲ.`,
      immediateRemedyKn: `ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣ ಸೇವೆ ಮಾಡಿಸಿ.`
    },

    // 5. MARITAL HARMONY (KRODHA / EGO CONFLICT RESOLUTION)
    {
      id: "q_marriage_2",
      category: "marriage",
      categoryLabelKn: "💍 ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ",
      questionKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಸಾಮರಸ್ಯ ಹೇಗೆ ಸಿಗುತ್ತದೆ?",
      questionEn: "How to resolve marital tension and restore domestic peace?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, Math.min(5, remM))} ತಿಂಗಳುಗಳಲ್ಲಿ ಪರಸ್ಪರ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ಬಗೆಹರಿದು ದಾಂಪತ್ಯದಲ್ಲಿ ಪ್ರೀತಿ ಮತ್ತು ಸಾಮರಸ್ಯ ಮರಳಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಮತ್ತು 4ನೇ ಸುಖ ಸ್ಥಾನದ ಮೇಲೆ ${seventhLordKn} ಹಾಗೂ ${fourthLordKn} ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಇತ್ತೀಚೆಗೆ ನಡೆದ ಸಣ್ಣ ಮಾತುಕತೆ ಅಥವಾ ಅಹಂಕಾರದ ಘರ್ಷಣೆಯು ದಾಂಪತ್ಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ಅಂತರ ತಂದಿದೆ. ಪರಸ್ಪರ ಪ್ರೀತಿ ಇದ್ದರೂ ಮುಕ್ತ ಸಂವಹನದ ಕೊರತೆ ಕಾಣಿಸುತ್ತಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, Math.min(5, remM))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, Math.min(5, remM))} Month${Math.max(2, Math.min(5, remM)) > 1 ? "s" : ""}) ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರದಿಂದ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಮರಳಿ ಬಂದು ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಮಂಗಳವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ. ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`),
      astrologicalBasisKn: `7ನೇ ಮನೆ ಮತ್ತು 4ನೇ ಮನೆಯ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ದಂಪತಿ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಶಿವ-ಪಾರ್ವತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.`
    },

    // 6. MARITAL FIDELITY & AFFAIRS (EXPLICIT DIRECT VERDICT - KAMA)
    {
      id: "q_marriage_3",
      category: "marriage",
      categoryLabelKn: "💍 ದಾಂಪತ್ಯ ನಿಷ್ಠೆ & ನಂಬಿಕೆ",
      questionKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ & ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಅಪಾಯ ಜಾತಕದಲ್ಲಿದೆಯೇ?",
      questionEn: "Is there any risk of extramarital attraction or trust breach in marriage?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  hasSensual || hasSameGenderAffinity
    ? "ಹೌದು! ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ-ರಾಹು/ಕುಜ ಸಂಯೋಗದಿಂದಾಗಿ ಬಾಹ್ಯ ಆಕರ್ಷಣೆ ಹಾಗೂ ಗೌಪ್ಯ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಅಪಾಯದ ಲಕ್ಷಣಗಳಿವೆ; ಎಚ್ಚರ ವಹಿಸಬೇಕು."
    : "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ, ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ವ್ಯಾಮೋಹ ಅಥವಾ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ. ನಿಮ್ಮಲ್ಲಿ ಅತ್ಯುನ್ನತ ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ನೈತಿಕ ಸದಾಚಾರದ ರಕ್ಷಣೆ ಇದೆ."
}
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ, 8ನೇ ರಹಸ್ಯ ಹಾಗೂ 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ${toKannadaPlanet(seventhLord)} ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ${
  hasSensual || hasSameGenderAffinity
    ? "ಶುಕ್ರ-ರಾಹುವಿನ ಸೂಕ್ಷ್ಮ ಸೆಳೆತದಿಂದಾಗಿ ದಾಂಪತ್ಯದ ಹೊರಗೆ ಭಾವನಾತ್ಮಕ ಆಕರ್ಷಣೆ ಉಂಟಾಗುವ ಸನ್ನಿವೇಶಗಳಿವೆ."
    : "7ನೇ ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರವು ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳಿಗೆ ಜಾರದಂತೆ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತಿದೆ."
}
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ದಾಂಪತ್ಯದಲ್ಲಿನ ಬಾಹ್ಯ ಅನುಮಾನಗಳು ಸಂಪೂರ್ಣವಾಗಿ ದೂರವಾಗಿ ಪರಸ್ಪರ ಗೌರವ ಗಟ್ಟಿಯಾಗಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಶ್ರೀ ক্ষেত্র ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಮತ್ತು 2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಿ.`),
      astrologicalBasisKn: `7ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ ${seventhLordKn}) ಮತ್ತು ಶುಕ್ರ-ರಾಹು ಸ್ಥಿತಿ.`,
      immediateRemedyKn: `ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆ ಮಾಡಿಸಿ ಮತ್ತು 2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಿ.`
    },

    // 7. PROGENY DELAY (EXPLICIT DOSHA REASON)
    {
      id: "q_children_1",
      category: "children",
      categoryLabelKn: "👶 ಸಂತಾನ ಭಾಗ್ಯ",
      questionKn: "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ವಿಳಂಬವಾಗುತ್ತಿರುವುದು ಏಕೆ? ಯಾವ ದೋಷ ಮತ್ತು ಪರಿಹಾರವೇನು?",
      questionEn: "Why delay in childbirth? Which dosha is responsible and what is the Vedic remedy?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮುಂದಿನ ${Math.max(4, remM + 2)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(4, remM + 2)} Month${Math.max(4, remM + 2) > 1 ? "s" : ""}) ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ಶುಭ ಸುದ್ದಿ ಖಚಿತವಾಗಿ ಲಭಿಸಲಿದೆ.
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

    // 8. MENTAL PEACE, EMOTIONAL BALANCE & SHADRIPU ALLEVIATION
    {
      id: "q_mind_1",
      category: "mind",
      categoryLabelKn: "🧠 ಮಾನಸಿಕ ನೆಮ್ಮದಿ",
      questionKn: "ಮನಸ್ಸಿಗೆ ಆತಂಕ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಒತ್ತಡ ನಿವಾರಣೆಗೆ ದೈವಿಕ ಪರಿಹಾರವೇನು?",
      questionEn: "What is the divine astrological remedy for mental anxiety and emotional strain?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳಲ್ಲಿ ಮಾನಸಿಕ ಒತ್ತಡ, ಅತಿಯಾದ ಯೋಚನೆ ಹಾಗೂ ಆತಂಕ ಸಂಪೂರ್ಣ ಉಪಶಮನಗೊಳ್ಳಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮನಃಕಾರಕ ಚಂದ್ರನು ${moonHouse}ನೇ ಮನೆಯಲ್ಲಿ (${moonRashiKn} ರಾಶಿ, ${moonNakKn} ನಕ್ಷತ್ರ) ಸ್ಥಿತನಾಗಿದ್ದಾನೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಜಾತಕದಲ್ಲಿ ಷಡ್ರಿಪುಗಳ ಪೈಕಿ ಮುಖ್ಯವಾಗಿ ${shadripus.ripuNameKn} ಪ್ರಭಾವ ಹೆಚ್ಚಿದ್ದು, ಚಂದ್ರನ ಮೇಲಿನ ಗ್ರಹ ಪ್ರಭಾವದಿಂದಾಗಿ ನೀವು ಹೊರಗೆ ಧೈರ್ಯವಾಗಿ ಕಂಡರೂ ಒಳಗೆ ಎಲ್ಲವನ್ನೂ ಅತಿಯಾಗಿ ಆಲೋಚಿಸುವ ಮತ್ತು ಭಾವನೆಗಳನ್ನು ಅದುಮಿಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಇದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${Math.max(1, Math.min(3, Math.round(remM / 2)))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(1, Math.min(3, Math.round(remM / 2)))} Month${Math.max(1, Math.min(3, Math.round(remM / 2))) > 1 ? "s" : ""}) ಚಂದ್ರನ ಗೋಚಾರ ಬಲ ಸುಧಾರಿಸಲಿದ್ದು ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ ಮರಳಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಪ್ರತಿದಿನ ರಾತ್ರಿ 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ. ಕಂಠದಲ್ಲಿ ${rudraName} ಧರಿಸಿ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ.`),
      astrologicalBasisKn: `ಚಂದ್ರನ ${moonHouse}ನೇ ಸ್ಥಾನ ಮತ್ತು 4ನೇ ಭಾವದ ${fourthLordKn} ಪ್ರಭಾವ.`,
      immediateRemedyKn: `${rudraName} ಧರಿಸಿ ಮತ್ತು ರಾತ್ರಿ 11 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.`
    },

    // 9. EVIL EYE & PROTECTION (MATSARYA OF ENEMIES)
    {
      id: "q_mind_2",
      category: "mind",
      categoryLabelKn: "🧠 ದೃಷ್ಟಿ ದೋಷ & ರಕ್ಷಣೆ",
      questionKn: "ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಮತ್ತು ಶತ್ರು ಭೀತಿ ನಿವಾರಣೆ ಹೇಗೆ?",
      questionEn: "How to neutralize evil eye, negative energy, and obstacles?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: 1 ತಿಂಗಳ ರಕ್ಷಾ ಕವಚ ಹಾಗೂ ದೈವಿಕ ಸಂಕಲ್ಪದಿಂದ ಸಕಲ ದೃಷ್ಟಿ ದೋಷ, ನರದೃಷ್ಟಿ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಭಸ್ಮವಾಗಲಿವೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನದ ತೇಜಸ್ಸು ಹಾಗೂ 8ನೇ ಗೂಢ ಸ್ಥಾನದ ಮೇಲೆ ಛಾಯಾಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ನಿಮ್ಮ ಪ್ರಗತಿ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವವನ್ನು ನೋಡಿ ಕೆಲವರಿಗೆ ಉಂಟಾಗುವ ಅಸೂಯೆ ಮತ್ತು ನರದೃಷ್ಟಿಯಿಂದಾಗಿ ಹೊಸ ಕೆಲಸಗಳಲ್ಲಿ ಆರಂಭಿಕ ಅಡೆತಡೆಗಳು ಎದುರಾಗುತ್ತಿವೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ 1 ತಿಂಗಳಿನಲ್ಲಿ (Next 1 Month) ರಕ್ಷಾ ಕವಚದ ಪ್ರಭಾವದಿಂದ ಸಕಲ ದೃಷ್ಟಿ ದೋಷಗಳು ಭಸ್ಮವಾಗಲಿವೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಮಂಗಳವಾರ-ಶುಕ್ರವಾರ ಮುಖ್ಯದ್ವಾರಕ್ಕೆ ಕಲ್ಲುಪ್ಪು-ನಿಂಬೆಹಣ್ಣಿನ ದೃಷ್ಟಿ ತೆಗೆಯಿರಿ. ಶ್ರೀ ಸುದರ್ಶನ ಕವಚ ಅಥವಾ ನರಸಿಂಹ ಮಂತ್ರ ಜಪಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ರಕ್ಷಾ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`),
      astrologicalBasisKn: `ಲಗ್ನ ಮತ್ತು 8ನೇ ಮನೆಯ ಮೇಲಿನ ಛಾಯಾಗ್ರಹಗಳ ಗೋಚಾರ ಪ್ರಭಾವ.`,
      immediateRemedyKn: `ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ ಮತ್ತು ಸುದರ್ಶನ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ.`
    },

    // 10. WEALTH & DEBT RELIEF (DYNAMIC LOSS SCALE)
    {
      id: "q_wealth_1",
      category: "wealth",
      categoryLabelKn: "💰 ಆರ್ಥಿಕತೆ & ಸಾಲ ಮುಕ್ತಿ",
      questionKn: "ಸಾಲದ ಬಾಧೆಯಿಂದ ಮುಕ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಯಾವಾಗ?",
      questionEn: "When will debt pressure ease and finances stabilize?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ನೂತನ ಆದಾಯದ ಮಾರ್ಗ ತೆರೆದುಕೊಂಡು ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ (${lossInfo.lossKn}) ಇಳಿಯಲಿದೆ.
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 6ನೇ ಋಣ ಸ್ಥಾನದಲ್ಲಿ ${sixthLordKn} ಮತ್ತು 2ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${secondLordKn} ಗ್ರಹ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ಕೈಗೆ ಬಂದ ಹಣ ನಿಲ್ಲದೆ ಅನಿರೀಕ್ಷಿತ ತುರ್ತು ವೆಚ್ಚಗಳಿಗೆ ಸೋರಿಹೋಗುತ್ತಿರುವುದು ಸಾಲದ ಹೊರೆಯನ್ನು ಹೆಚ್ಚಿಸಿದೆ.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ಹೊಸ ಆದಾಯದ ಮಾರ್ಗ ತೆರೆದುಕೊಂಡು ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ ಇಳಿಯಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ${gemName} ಧರಿಸಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`),
      astrologicalBasisKn: `6ನೇ (ಋಣ) ಮತ್ತು 11ನೇ (ಲಾಭ) ಮನೆಗಳ ಮೇಲಿನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ.`,
      immediateRemedyKn: `ಪ್ರತಿದಿನ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಸೇವೆ ಮಾಡಿಸಿ.`
    },

    // 11. SPECULATION & SHARE MARKET (DIRECT VERDICT & DYNAMIC LOSS SCALE)
    {
      id: "q_wealth_2",
      category: "wealth",
      categoryLabelKn: "💰 ಷೇರು & ಸ್ಪೆಕ್ಯುಲೇಶನ್",
      questionKn: "ಷೇರು ಮಾರುಕಟ್ಟೆ, ಟ್ರೇಡಿಂಗ್ ಅಥವಾ ಸ್ಪೆಕ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ಲಾಭ ಸಿಗುವುದೇ? ಅಥವಾ ನಷ್ಟದ ಅಪಾಯವಿದೆಯೇ?",
      questionEn: "Will stock market day trading or speculation bring profit or loss?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  isSpeculationLoss
    ? `ಇಲ್ಲ, ಲಾಭ ಸಾಧ್ಯವೇ ಇಲ್ಲ! ಜಾತಕದಲ್ಲಿ ಷೇರು ಮಾರುಕಟ್ಟೆ, ದಿನದ ಇಂಟ್ರಾಡೇ/ಆಪ್ಷನ್ಸ್ ಟ್ರೇಡಿಂಗ್ ಹಾಗೂ ಬೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಭಾರಿ ಬಂಡವಾಳ ನಷ್ಟ (${lossInfo.lossKn}) ಹಾಗೂ ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕುವ ಸ್ಪಷ್ಟ ದುರ್ಯೋಗವಿದೆ; ತಕ್ಷಣವೇ ನಿಲ್ಲಿಸಬೇಕು.`
    : "ದಿನನಿತ್ಯದ ಜೂಜು/ಟ್ರೇಡಿಂಗ್ ಬೇಡ; ಆದರೆ ದೀರ್ಘಕಾಲೀನ ಸುರಕ್ಷಿತ ಹೂಡಿಕೆಯಲ್ಲಿ (Mutual Funds/SIP) ಮಾತ್ರ ಹಂತ ಹಂತವಾಗಿ ಲಾಭ ಗಳಿಸುವ ಯೋಗವಿದೆ."
}
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 5ನೇ ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಸ್ಥಾನದಲ್ಲಿ ${fifthLordKn} ಹಾಗೂ 8ನೇ ಅಷ್ಟಮ ಸ್ಥಾನಗಳ ಮೇಲೆ ಗ್ರಹ ಪ್ರಭಾವವಿದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ${
  isSpeculationLoss
    ? "5ನೇ ಮನೆಯಲ್ಲಿ ರಾಹುವಿನ ಭ್ರಮೆ ಮತ್ತು ನೀಚ/ಪೀಡಿತ ಪಂಚಮಾಧಿಪತಿಯು ಬಂಡವಾಳ ವಿನಾಶ ಹಾಗೂ ಕಳೆದುಕೊಂಡ ಹಣ ವಾಪಸ್ ಪಡೆಯುವ ಹಠದ ಗೀಳನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ."
    : "ಧನ ಸ್ಥಾನವು ಸ್ಥಿರವಾಗಿದ್ದು, ಶ್ರಮದ ದುಡಿಮೆ ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಆಸ್ತಿಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದು ಸುರಕ್ಷಿತ."
}
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ಸ್ಪೆಕ್ಯುಲೇಶನ್‌ನಿಂದ ದೂರವಿದ್ದರೆ ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟು ತಿಳಿಯಾಗಿ ಹಣ ಉಳಿಯಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಹಾಗೂ ಲಕ್ಷ್ಮೀ-ಕುಬೇರ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ, ಸಾಲ ಮುಕ್ತಿಗಾಗಿ ಪ್ರಾರ್ಥಿಸಿ.`),
      astrologicalBasisKn: `5ನೇ (ಸ್ಪೆಕ್ಯುಲೇಶನ್/ಬುದ್ಧಿ) ಮತ್ತು 8ನೇ (ಹಠಾತ್ ನಷ್ಟ) ಮನೆಗಳ ಗ್ರಹ ಸ್ಥಿತಿ.`,
      immediateRemedyKn: `ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಟ್ರೇಡಿಂಗ್ ನಿಲ್ಲಿಸಿ ಮತ್ತು ಗೋಕರ್ಣದಲ್ಲಿ ಗಣಪತಿ ಹೋಮ ಮಾಡಿಸಿ.`
    },

    // 12. MORAL INTEGRITY, REPUTATION & CRIMINALITY AUDIT
    {
      id: "q_integrity_1",
      category: "mind",
      categoryLabelKn: "🧭 ಸತ್ಚಾರಿತ್ರ್ಯ & ಅಪರಾಧ ಮುಕ್ತತೆ",
      questionKn: "ನನ್ನ ಜಾತಕದಲ್ಲಿ ಸತ್ಚಾರಿತ್ರ್ಯ, ಅಪರಾಧ ಮುಕ್ತತೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ ಹೇಗಿದೆ?",
      questionEn: "How is my moral integrity, character purity, and freedom from legal/criminal blemishes?",
      panditScriptKn: sanitizeAstrologyKannadaText(`ನಮಸ್ಕಾರ ${name}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  diagnosis.negativeShades?.overallScore && diagnosis.negativeShades.overallScore > 35
    ? "ಜಾತಕದಲ್ಲಿ ಶನಿ-ರಾಹುಗಳ ಗೋಚಾರ ಅಥವಾ ದಶಾ ಪ್ರಭಾವದಿಂದಾಗಿ ಸಾರ್ವಜನಿಕ ಅಪವಾದ, ವಿವಾದ ಅಥವಾ ಕಾನೂನು ತೊಡಕುಗಳ ಬಗ್ಗೆ ಎಚ್ಚರ ವಹಿಸಬೇಕು."
    : "ನಿಮ್ಮ ಜಾತಕವು ಅತ್ಯುನ್ನತ ಸತ್ಚಾರಿತ್ರ್ಯ ಹಾಗೂ ಸದಾಚಾರದಿಂದ ಕೂಡಿದೆ! ಯಾವುದೇ ಕಳ್ಳತನ, ವಂಚನೆ, ಕ್ರಿಮಿನಲ್ ಚಟುವಟಿಕೆ ಅಥವಾ ಕಾರಾಗೃಹ ದೋಷಗಳಿಲ್ಲದೆ ದೈವಿಕ ರಕ್ಷಣೆಯಲ್ಲಿದೆ (ಸರ್ವದೋಷ ವಿನಾಶನಃ)."
}
• 🎯 ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ಲಗ್ನ, 2ನೇ ಧನ-ವಾಕ್, 9ನೇ ಧರ್ಮ ಹಾಗೂ 10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನಗಳ ಮೇಲೆ ${diagnosis.negativeShades?.isJupiterProtected ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಪೂರ್ಣ ರಕ್ಷಣಾತ್ಮಕ ದೃಷ್ಟಿ" : "ಶುಭ ಗ್ರಹಗಳ ಪ್ರಭಾವ"} ಇದೆ.
• ⚠️ ನಿರ್ದಿಷ್ಟ ದೋಷ & ಕಾರಣ: ${
  diagnosis.negativeShades?.overallScore && diagnosis.negativeShades.overallScore > 35
    ? "ಗ್ರಹಗಳ ಸಂಚಾರದಿಂದಾಗಿ ಅಪವಾದಗಳು ಬಾರದಂತೆ ಎಚ್ಚರಿಕೆಯ ನಡವಳಿಕೆ ಅಗತ್ಯ."
    : "ಜಾತಕದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ಬಲವಿರುವುದರಿಂದ ಶತ್ರುಗಳು ಅಪಪ್ರಚಾರ ಮಾಡಲು ಯತ್ನಿಸಿದರೂ ನಿಮ್ಮ ಪರಿಶುದ್ಧ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಯಾವುದೇ ಕಳಂಕ ತಟ್ಟುವುದಿಲ್ಲ."
}
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಗೌರವ, ಪ್ರತಿಷ್ಠೆ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹತೆ ಇನ್ನಷ್ಟು ಉನ್ನತ ಹಂತಕ್ಕೆ ಏರಲಿದೆ.
• 🪔 ಸಿದ್ಧ ಮಂತ್ರ & ಗೋಕರ್ಣ ಪೂಜೆ: ${diagnosis.negativeShades?.protectionRemedyKn || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರಕ್ಷಾ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ."}`),
      astrologicalBasisKn: `ಲಗ್ನ, 2ನೇ ಧನ-ವಾಕ್, 9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಮತ್ತು ಗುರು ದೃಷ್ಟಿ.`,
      immediateRemedyKn: `ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಸಾಗುತ್ತಾ ಸತ್ಯ ಮತ್ತು ನ್ಯಾಯವನ್ನು ಪಾಲಿಸಿ.`
    }
  ];
};

export const generatePanchangaAngaSynthesis = (
  kundli: KundliOutput,
  context: { birthDate: string; birthTime: string; latitude: number; longitude: number; lang?: string; devoteeName?: string; gender?: string; devoteeAge?: number }
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

  const devoteeAge = context.devoteeAge !== undefined ? context.devoteeAge : calculateDevoteeAge(context.birthDate);
  const prescriptions = generateAstrologicalPrescriptions(kundli, yogaRule, karanaRule);
  const currentDiagnosis = generateCurrentLifeDiagnosis(kundli, context, prescriptions);
  const instantQAList = generateInstantQAList(kundli, currentDiagnosis, prescriptions, context.devoteeName, devoteeAge);

  // Build Multi-Paragraph Astrologer Reading in Pure Pristine Kannada with English Digits
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakKn = toKannadaNakshatra(moon?.nakshatra.english);
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);

  const cls = currentDiagnosis.currentLifeSituation;
  const prof = currentDiagnosis.accurateProfession;

  const devoteeNameFormatted = context.devoteeName || "ಭಕ್ತರೇ";
  const p1 = sanitizeAstrologyKannadaText(
    `ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ಅತ್ಯಂತ ಪ್ರಮುಖವಾಗಿ ಎದ್ದು ಕಾಣುವ ಸಂಗತಿಯೆಂದರೆ — ${cls?.headlineKn || currentDiagnosis.primaryLifeChallenge.description}. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಕಾಲಘಟ್ಟದಲ್ಲಿ, ${cls?.detailedRealityKn || currentDiagnosis.primaryLifeChallenge.description}. ${cls?.planetaryCulpritKn || currentDiagnosis.primaryLifeChallenge.planetaryRootCause}. ಉಳಿದೆಲ್ಲ ವಿಷಯಗಳಿಗಿಂತ ಮೊದಲು ಈ ನೈಜ ಸವಾಲಿಗೆ ನಿಮಗೆ ಸ್ಪಷ್ಟ ದೈವಿಕ ಮುಕ್ತಿ ಮಾರ್ಗ ಬೇಕಾಗಿದೆ.`
  );
  
  const p2 = sanitizeAstrologyKannadaText(
    `ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${prof?.tenthHouseSignKn || "ಕರ್ಮ"} ರಾಶಿ) ಹಾಗೂ ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ (${prof?.amatyakarakaPlanetKn || "ಅಮಾತ್ಯಕಾರಕ"}) ಗ್ರಹಗಳ ಬಲವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ನಿಖರ ವೃತ್ತಿ ರಂಗವು: ${prof?.titleKn || "ವೃತ್ತಿಪರ ಕಾರ್ಯಕ್ಷೇತ್ರ"}. ನಿರ್ದಿಷ್ಟವಾಗಿ ನೀವು ${prof?.specificRoleKn || "ವೃತ್ತಿಪರರು"} ಆಗಿ ${prof?.workEnvironmentKn || "ಸಂಸ್ಥೆ"}ದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವಂತಹ ಬಲವಾದ ಗ್ರಹ ಸಂಯೋಜನೆ ಇದೆ. ${prof?.astrologicalBasisKn || currentDiagnosis.technicalAspects.tenthHouseDetail}. ${prof?.secondaryAlternativeKn ? `ಪರ್ಯಾಯವಾಗಿ ಇದರಲ್ಲಿ ${prof.secondaryAlternativeKn} ಅವಕಾಶಗಳೂ ಪೂರಕವಾಗಿವೆ.` : ""}`
  );

  const dashaTimeText = currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ";
  const p3 = sanitizeAstrologyKannadaText(
    `ನೀವು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಧೃತಿಗೆಡಬೇಕಾಗಿಲ್ಲ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ, ಇನ್ನು ${dashaTimeText} ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ${cls?.reliefTimelineKn || "ನೂತನ ಅವಕಾಶಗಳು ಗೋಚರಿಸಲಿವೆ"}. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವಯುತ ಯಶಸ್ಸು ಖಚಿತವಾಗಿ ಲಭಿಸಲಿದೆ.`
  );

  const p4 = sanitizeAstrologyKannadaText(
    `ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗಾಗಿ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಮಾಡಿಸಿ ${prescriptions.gemstoneRing.fingerKn}ಕ್ಕೆ ${prescriptions.gemstoneRing.activationDay} ದಿನ ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಇದರೊಂದಿಗೆ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಹಾಗೂ ${currentDiagnosis.prasthuthaSthiti.immediateRemedies.join(" ")}. ${cls?.gokarnaRemedyKn || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿಸುವ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ."}`
  );

  const yajnaHawanaPlan = generateYajnaHawanaPlan(kundli, {
    runningDashaMaha: currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[0]?.trim(),
    runningDashaBhukti: currentDiagnosis.prasthuthaSthiti.runningDashaSummary.split("|")[1]?.trim(),
    primaryChallenge: currentDiagnosis.primaryLifeChallenge.area,
    devoteeName: context.devoteeName,
    dynamicTimelineKn: currentDiagnosis.dashaTiming?.timelineKn,
    devoteeAge
  });

  return {
    panchanga: {
      vara: { nameKn: varaInfo.kn, nameEn: varaInfo.en, lord: varaLord, tatva: varaInfo.tatva },
      tithi: { nameKn: tradPanchanga.tithiKn || tradPanchanga.tithi, nameEn: tradPanchanga.tithi, paksha: tradPanchanga.paksha, jalTatvaQuality: "Nourishes emotional relationships and desire fulfillment" },
      nakshatra: { nameKn: tradPanchanga.moonNakshatraKn || moonNakKn, nameEn: moon?.nakshatra.english ?? "Ashwini", lord: calculateKpSubLord(moon?.degree ?? 0).nakshatraLord, deity: "Presiding Divine Guardian" },
      yoga: { nameKn: yogaRule.sanskrit, nameEn: yogaRule.english, rule: yogaRule },
      karana: { nameKn: karanaRule.nameKn, nameEn: karanaRule.nameEn, rule: karanaRule },
      sunrise: tradPanchanga.sunrise,
      sunset: tradPanchanga.sunset
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
  gender?: string,
  sunsetTime?: string
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
  const isCurrentStruggleQuery = /ಪ್ರಸ್ತುತ.*(ಕಷ್ಟ|ಸಮಸ್ಯೆ|ಸ್ಥಿತಿ|ಸವಾಲು|ವಾಸ್ತವ)|ಹಾಲಿ.*(ಕಷ್ಟ|ಸಮಸ್ಯೆ|ಸ್ಥಿತಿ|ಅನುಭವ)|ಯಾವ ಕಷ್ಟ|ಯಾವ ಸಮಸ್ಯೆ|ಈಗೇನು.*(ಆಗುತ್ತಿದೆ|ನಡೆಯುತ್ತಿದೆ)|ನನ್ನ.*(ಕಷ್ಟ|ಸಮಸ್ಯೆ|ಹಾಲಿ ಸ್ಥಿತಿ)|current.*(problem|issue|struggle|situation|going through)|what am i going through|my current life|present condition/.test(qLower);
  const isSpecificProfessionQuery = /ಯಾವ.*(ಉದ್ಯೋಗ|ಕೆಲಸ|ವೃತ್ತಿ|ಜಾಬ್)|ವೃತ್ತಿ.*(ಯಾವುದು|ಹೇಳಿ|ನಿರ್ಣಯ)|ಉದ್ಯೋಗ.*(ಯಾವುದು|ಹೇಳಿ|ನಿರ್ಣಯ)|ಕೆಲಸ.*(ಯಾವುದು|ಹೇಳಿ)|which work|what work|exact profession|my job|my profession|which career|what career am i doing|current profession/.test(qLower);
  const isPartnerBetrayalQuery = /ಪಾಲುದಾರ|ನಂಬಿಕೆದ್ರೋಹ|ವಂಚನೆ.*ಪಾಲುದಾರ|ಪಾಲುಗಾರ|business partner|partner.*(cheat|trust|betray|distrust|fraud)/.test(qLower);
  const isPropertyDisputeQuery = /ಆಸ್ತಿ|ಪಾಲು(?!ದಾರ|ಗಾರ)|ಮನೆಯ ಹಕ್ಕು|ಭಾಗ|ವಿಭಾಗ|ಭೂಮಿ.*ವಿವಾದ|property|inheritance|ancestral|partition|share in home|land dispute|house dispute/.test(qLower);
  const isChildQuery = /ಅಳು|ಕಿರಿಕಿರಿ|ಜಗಳ|ಹಠ|ಊಟ|ನಿದ್ರೆ|ಮಗು|ಬಾಲ|cry|crying|tantrum|fight|quarrel|stubborn|food|eat|colic|balarishta|child|baby/.test(qLower);
  const isAddictionQuery = /ಮದ್ಯ|ಕುಡಿ|ವ್ಯಸನ|ದುಶ್ಚಟ|ಡ್ರಿಂಕ್|ಆಲ್ಕೋಹಾಲ್|ಸಿಗರೇಟು|ಧೂಮಪಾನ|drink|drinking|alcohol|addiction|liquor|smoke|substance/.test(qLower);
  const isAffairQuery = /ಅಫೇರ್|ಪರಸ್ತ್ರೀ|ಪರಪುರುಷ|ದಾಂಪತ್ಯೇತರ|ಕಾಮನೆ|ಲೈಂಗಿಕ ಆಕರ್ಷಣೆ|ಗುಪ್ತ ಪ್ರೇಮ|ವ್ಯಾಮೋಹ|ಕಾಮ|ಬಾಹ್ಯ ಆಕರ್ಷಣೆ|affair|extramarital|secret romance|sensual craving|outside attraction/.test(qLower);
  const isSpeculationQuery = /ಷೇರು|ಟ್ರೇಡಿಂಗ್|ಆಪ್ಷನ್ಸ್|ಇಂಟ್ರಾಡೇ|ಬೆಟ್ಟಿಂಗ್|ಲಾಟರಿ|ಸ್ಪೆಕ್ಯುಲೇಶನ್|ಜೂಜು|share|stock|trading|intraday|option|f&o|betting|lottery|gamble|speculat/.test(qLower);
  const isIllegalQuery = /ಕಳ್ಳಸಾಗಣೆ|ಸ್ಮಗ್ಲಿಂಗ್|ಅಕ್ರಮ|ಅಡ್ಡದಾರಿ|ಹವಾಲಾ|ಕಪ್ಪು ಹಣ|smuggle|smuggling|illegal|unethical|black money|shortcut/.test(qLower);
  const isTheftFraudQuery = /ಕಳ್ಳತನ|ಚೋರ|ವಂಚನೆ|ಮೋಸ|ಲಪಟಾಯಿಸ|ಖೊಟ್ಟಿ|theft|thief|fraud|embezzle|cheat|steal|rob/.test(qLower);
  const isViolenceMurderQuery = /ಹತ್ಯಾ|ಕೊಲೆ|ಕ್ರೌರ್ಯ|ಹಲ್ಲೆ|ಹಿಂಸೆ|ದೌರ್ಜನ್ಯ|ಕ್ರಿಮಿನಲ್|ಅಪರಾಧ|ಅತ್ಯಾಚಾರ|ವಿಕೃತಿ|murder|kill|assault|violence|cruelty|criminal|rapist/.test(qLower);
  const isLegalBandhanaQuery = /ಜೈಲು|ಪೊಲೀಸ್|ಕೋರ್ಟು|ಕೇಸು|ಬಂಧನ|ಶಿಕ್ಷೆ|ಕಾರಾಗೃಹ|jail|prison|custody|arrest|court|police|confinement|case/.test(qLower);
  const isBadCompanyQuery = /ಕುಸಂಗ|ದುರ್ಮಾರ್ಗ|ಕೆಟ್ಟ ಸ್ನೇಹಿತ|ಹಾದಿ ತಪ್ಪ|bad company|wrong path|mislead/.test(qLower);
  const isMaritalConflictQuery = /ಸಾಮರಸ್ಯ|ಜಗಳ|ಮನಸ್ತಾಪ|ಹೊಂದಾಣಿಕೆ|ಬಿರುಕು|ವಿಚ್ಛೇದನ|ದಾಂಪತ್ಯ|ಸಂಸಾರ|dispute|conflict|friction|quarrel|divorce|harmony|marital tension|misunderstanding/.test(qLower);
  const isMarriageQuery = /ವಿವಾಹ|ಮದುವೆ|ಕಳತ್ರ|ಕಂಕಣ|ಮದುವೆಯಾಗ|marriage|wedding|spouse|partner|match|kankana|ವರ ಹೊಂದಾಣಿಕೆ|ವರನ|ವರನಿಗೆ|ವಧು|ವರಾನ್ವೇಷಣೆ/.test(qLower);
  const isDebtQuery = /ಸಾಲ|ಋಣ|ಹೊರೆ|ತೀರಿಸ|ಬಾಕಿ|debt|loan|repay|borrow/.test(qLower);
  const isFinanceCareerQuery = /ಹಣ|ಆರ್ಥಿಕ|ದುಡ್ಡು|ಸಂಪತ್ತು|ಉದ್ಯೋಗ|ಕೆಲಸ|ವ್ಯಾಪಾರ|ತಿರುವು|ಅಭಿವೃದ್ಧಿ|ಪ್ರಮೋಷನ್|money|wealth|finance|job|career|business|turning point|promotion/.test(qLower);

  const seventhLord = signLord((kundli.lagnaRashi.index + 6) % 12);
  const seventhLordPlanet = kundli.planets.find((p) => p.name === seventhLord);
  const seventhLordKn = toKannadaPlanet(seventhLord);

  const fifthLord = signLord((kundli.lagnaRashi.index + 4) % 12);
  const fifthLordPlanet = kundli.planets.find((p) => p.name === fifthLord);
  const fifthLordKn = toKannadaPlanet(fifthLord);

  const secondLord = signLord((kundli.lagnaRashi.index + 1) % 12);
  const secondLordPlanet = kundli.planets.find((p) => p.name === secondLord);
  const secondLordKn = toKannadaPlanet(secondLord);

  const tenthLord = signLord((kundli.lagnaRashi.index + 9) % 12);
  const tenthLordPlanet = kundli.planets.find((p) => p.name === tenthLord);
  const tenthLordKn = toKannadaPlanet(tenthLord);

  const fourthLord = signLord((kundli.lagnaRashi.index + 3) % 12);
  const fourthLordPlanet = kundli.planets.find((p) => p.name === fourthLord);
  const fourthLordKn = toKannadaPlanet(fourthLord);

  const sixthLord = signLord((kundli.lagnaRashi.index + 5) % 12);
  const sixthLordPlanet = kundli.planets.find((p) => p.name === sixthLord);
  const sixthLordKn = toKannadaPlanet(sixthLord);

  const lossInfo = getDynamicLossScaleText(kundli);

  // Deep Astrological Metrics
  const diet = detectNativeDietAndAddiction(kundli);
  const sensual = detectNativeSensualAndFidelity(kundli);
  const isDailyDrinking = diet.isDailyDrinking;
  const isSocialDrinking = diet.isSocialDrinking;
  const isTeetotaler = diet.isTeetotaler;

  // Sensual & Affairs
  const neuterSigns = [2, 5, 10]; // Gemini, Virgo, Aquarius
  const venusSign = venus?.rashi.index ?? 0;
  const hasSameGenderAffinity = (
    (venus && mercury && Math.abs(venus.house - mercury.house) === 0 && (saturn?.house === 7 || saturn?.house === 8 || rahu?.house === 7 || ketu?.house === 7)) ||
    (venus && [7, 8].includes(venus?.house ?? 1) && mercury && [7, 8].includes(mercury.house) && neuterSigns.includes(venusSign))
  );
  const hasSensual = sensual.hasStrongAffairRisk;
  const hasMaritalFidelity = sensual.hasMaritalFidelity;

  // Speculation Loss
  let specScore = 0;
  if (rahu && rahu.house === 5) specScore += 3.5;
  const isFifthLordNeecha = fifthLordPlanet && (
    (fifthLordPlanet.name === PlanetName.Mars && fifthLordPlanet.rashi.index === 3) ||
    (fifthLordPlanet.name === PlanetName.Sun && fifthLordPlanet.rashi.index === 6) ||
    (fifthLordPlanet.name === PlanetName.Moon && fifthLordPlanet.rashi.index === 7) ||
    (fifthLordPlanet.name === PlanetName.Jupiter && fifthLordPlanet.rashi.index === 9) ||
    (fifthLordPlanet.name === PlanetName.Venus && fifthLordPlanet.rashi.index === 5) ||
    (fifthLordPlanet.name === PlanetName.Saturn && fifthLordPlanet.rashi.index === 0) ||
    (fifthLordPlanet.name === PlanetName.Mercury && fifthLordPlanet.rashi.index === 11)
  );
  if (fifthLordPlanet && (isFifthLordNeecha || [6, 8, 12].includes(fifthLordPlanet.house))) specScore += 2.5;
  if (saturn && saturn.house === 8) specScore += 2.0;
  if (mars && mars.house === 8) specScore += 2.0;
  const isSpeculationLoss = specScore >= 4.0;

  // Unethical & Smuggling
  let illegalScore = 0;
  if (rahu && rahu.house === 8) illegalScore += 2.5;
  if (rahu && [10, 11].includes(rahu.house)) illegalScore += 2.0;
  if (mars && mars.house === 8 && rahu && rahu.house === 8) illegalScore += 2.0;
  if (saturn && saturn.house === 8 && rahu && rahu.house === 8) illegalScore += 1.5;
  if (mercury && [8, 10, 12].includes(mercury.house) && (rahu && Math.abs(mercury.house - rahu.house) === 0)) illegalScore += 2.0;
  if (sun?.house === 5 && moon?.house === 5 && jupiter && [5, 11].includes(jupiter.house)) illegalScore = 0;
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
  const remM = currentDiagnosis.dashaTiming?.remainingMonths || 5;

  const marsHouse = mars?.house ?? 1;
  const isKujaDosha = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  const hasShani7th = saturn && (saturn.house === 7 || [1, 5, 10].includes(saturn.house));
  const hasSarpa7th = (rahu && rahu.house === 7) || (ketu && ketu.house === 7);
  const isMaritalCrisis = (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) || isKujaDosha || hasShani7th || hasSarpa7th;

  // Ensure robust fallback for current life diagnostic and accurate profession
  const cls = currentDiagnosis.currentLifeSituation ?? diagnoseCurrentLifeSituation(kundli, { birthDate: "", birthTime: "", latitude: 0, longitude: 0, devoteeAge: age, gender });
  const prof = currentDiagnosis.accurateProfession ?? determineAccurateProfession(kundli, { birthDate: "", birthTime: "", latitude: 0, longitude: 0, devoteeAge: age, gender });

  // 0A. CURRENT LIFE SITUATION & ACUTE STRUGGLES (ಹಾಲಿ ಅನುಭವಿಸುತ್ತಿರುವ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಸಂಕಷ್ಟಗಳು)
  if (isCurrentStruggleQuery) {
    if (isKn) {
      const symptomsText = cls.symptomsChecklistKn.length > 0
        ? `\n\n• 📋 ಪ್ರಸ್ತುತ ನೀವು ಅನುಭವಿಸುತ್ತಿರುವ ನೈಜ ಲಕ್ಷಣಗಳು:\n${cls.symptomsChecklistKn.map((s, idx) => `  ${idx + 1}. ${s}`).join("\n")}`
        : "";
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ಹಾಗೂ ಪ್ರಸ್ತುತ ಗ್ರಹ ಗೋಚಾರವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${cls.headlineKn}

• 🎯 ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಗ್ರಹಗಳ ಕೈವಾಡ: ${cls.detailedRealityKn}

${cls.planetaryCulpritKn}${symptomsText}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${cls.reliefTimelineKn}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${cls.gokarnaRemedyKn} ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನ ಹಾಗೂ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಮಾನಸಿಕ ಧೈರ್ಯ ಹೆಚ್ಚಿ ಸಂಕಷ್ಟಗಳಿಂದ ಶೀಘ್ರ ಮುಕ್ತಿ ದೊರೆಯಲಿದೆ.`
      );
    } else {
      const symptomsText = cls.symptomsChecklistEn.length > 0
        ? `\n\n• 📋 Real-Life Symptoms Native is Currently Experiencing:\n${cls.symptomsChecklistEn.map((s, idx) => `  ${idx + 1}. ${s}`).join("\n")}`
        : "";
      return (
`Namaskara ${devoteeNameFormatted}, I have scrutinized your birth chart and current Gochara transits.

• 🔮 Direct Daivajna Verdict: ${cls.headlineEn}

• 🎯 Current Life Reality & Astrological Culprits: ${cls.detailedRealityEn}

${cls.planetaryCulpritEn}${symptomsText}

• ⏳ Accurate Timeline / Turning Point: ${cls.reliefTimelineEn}

• 🪔 Prescribed Remedies & Solution: ${cls.gokarnaRemedyEn} Wearing ${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight}) and ${prescriptions.rudraksha.nameEn} will reinforce inner resilience and accelerate relief.`
      );
    }
  }

  // 0B. BUSINESS PARTNER DISTRUST & BETRAYAL (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ) - evaluated before property dispute to avoid 'ಪಾಲು' collision
  if (isPartnerBetrayalQuery) {
    const isPartnerRisk = (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) ||
      (rahu && [7, 8].includes(rahu.house)) ||
      cls.category === "partner_distrust_betrayal";
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ, ಲೆಕ್ಕಪತ್ರ ಹಾಗೂ ನಂಬಿಕೆಯ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${isPartnerRisk
  ? "ಹೌದು! ವ್ಯಾಪಾರದಲ್ಲಿ ಪಾಲುದಾರರ ನಂಬಿಕೆದ್ರೋಹ, ಗುಪ್ತ ಲೆಕ್ಕಪತ್ರ ಮುಚ್ಚಿಡುವಿಕೆ, ಆರ್ಥಿಕ ವಂಚನೆ ಅಥವಾ ಒಪ್ಪಂದ ಮುರಿದು ಮೋಸ ಮಾಡುವ ಗಂಭೀರ ಸಂಕಷ್ಟ ಜಾತಕದಲ್ಲಿದೆ; ತಕ್ಷಣವೇ ಲೆಕ್ಕ ಪರಿಶೀಲನೆ ಅಗತ್ಯ."
  : "ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಸಂವಹನ ಕೊರತೆ ಇರಬಹುದಾದರೂ, ವ್ಯವಹಾರದಲ್ಲಿ ದೊಡ್ಡ ವಂಚನೆ ಅಥವಾ ನಂಬಿಕೆದ್ರೋಹದ ಅಪಾಯವಿಲ್ಲ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಪಾಲುದಾರಿಕೆ/ವಾಣಿಜ್ಯ ಸ್ಥಾನದಲ್ಲಿ ${seventhLordKn} ಹಾಗೂ ಬುಧ-ರಾಹುವಿನ ನೆರಳು ಪ್ರಭಾವವಿದೆ. ${
  isPartnerRisk
    ? "ಪಾಲುದಾರರು ನಿಮ್ಮ ಬೆನ್ನಹಿಂದೆ ರಹಸ್ಯ ವ್ಯವಹಾರ ನಡೆಸುವುದು, ಜಂಟಿ ಖಾತೆಯ ಹಣವನ್ನು ದುರುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳುವುದು ಅಥವಾ ಹೂಡಿಕೆಯ ಪಾಲಿನಲ್ಲಿ ಅನ್ಯಾಯ ಮಾಡುವ ಅಪಾಯವಿದೆ. ಕುರುಡು ನಂಬಿಕೆ ಬಿಟ್ಟು ಪ್ರತಿಯೊಂದು ವಹಿವಾಟನ್ನು ಕಾನೂನುಬದ್ಧ ದಾಖಲೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ."
    : "ಪಾಲುದಾರಿಕೆ ನಿಯಮಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ದಾಖಲಿಸಿಕೊಂಡು ಮುನ್ನಡೆದರೆ ವ್ಯಾಪಾರ ಸುರಕ್ಷಿತವಾಗಿರಲಿದೆ."
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ, ಇನ್ನು ${cls.reliefTimelineKn} ಪಾಲುದಾರಿಕೆ ಒಪ್ಪಂದವನ್ನು ಪುನರ್ವಿಮರ್ಶಿಸಲು ಅಥವಾ ಪ್ರತ್ಯೇಕ ಸ್ವತಂತ್ರ ವ್ಯಾಪಾರ ಆರಂಭಿಸಲು ಶುಭ ಯೋಗವಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ಬುಧ ಶಾಂತಿ ನೆರವೇರಿಸಿ. ವ್ಯಾಪಾರ ಸ್ಥಳದಲ್ಲಿ ನಿತ್ಯ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಿಸಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding business partnerships, accounts, and trust dynamics.

• 🔮 Direct Daivajna Verdict: ${isPartnerRisk
  ? "YES. Severe risk of business partner betrayal, undisclosed parallel bookkeeping, diversion of revenues, and breach of contractual trust. Immediate auditing is imperative."
  : "NO deep malicious fraud detected; minor transparency frictions can be reconciled through formalized contracts."
}

• 🎯 Astrological Root Cause & Planetary Alignment: The 7th house of partnerships (${seventhLordKn}) and Mercury (commerce) are under affliction, prompting covert maneuvers and unequal profit-sharing.

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, contractual restructuring or a transition toward independent enterprise is recommended within ${cls.reliefTimelineEn}.

• 🪔 Prescribed Remedies & Solution: Perform Mahaganapati Sankalpa Pooja and Mercury Shanti at holy Sri Kshetra Gokarna.`
      );
    }
  }

  // 0C. PROPERTY SHARE & ANCESTRAL PARTITION DISPUTE (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಹಕ್ಕು / ವಿಭಾಗ ಕಲಹ)
  if (isPropertyDisputeQuery) {
    const isMarsSaturnAfflicted = mars && saturn && (
      [4, 8, 12].includes(mars.house) || [4, 8, 12].includes(saturn.house) ||
      Math.abs(mars.house - saturn.house) === 0 ||
      (fourthLordPlanet && [6, 8, 12].includes(fourthLordPlanet.house))
    );
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಆಸ್ತಿ ಪಾಲು, ಪಿತ್ರಾರ್ಜಿತ ಭೂಮಿ ಹಾಗೂ ಮನೆಯ ವಿಭಾಗದ ವಿಷಯದಲ್ಲಿ ಕೂಲಂಕಷವಾಗಿ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${isMarsSaturnAfflicted || cls.category === "property_share_dispute"
  ? "ಹೌದು! ಜಾತಕದಲ್ಲಿ ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ ಪಾಲು, ಜಮೀನು ಅಥವಾ ಮನೆಯ ಹಕ್ಕಿನ ವಿಷಯದಲ್ಲಿ ತೀವ್ರ ವಿವಾದ, ಸಹೋದರರು/ಜ್ಞಾತಿಗಳಿಂದ ಅಡೆತಡೆ ಹಾಗೂ ಕಾನೂನು ಅಥವಾ ಪಂಚಾಯಿತಿ ಜಟಾಪಟಿಯ ಸ್ಪಷ್ಟ ಲಕ್ಷಣಗಳಿವೆ."
  : "ಆಸ್ತಿ ಪಾಲಿನಲ್ಲಿ ಆರಂಭಿಕ ಮಾತಿನ ಚಕಮಕಿ ಇದ್ದರೂ, ಮಧ್ಯಸ್ಥಿಕೆ ಅಥವಾ ಹಿರಿಯರ ಸಮ್ಮುಖದಲ್ಲಿ ನ್ಯಾಯಯುತವಾಗಿ ಪಾಲು ಇತ್ಯರ್ಥವಾಗುವ ಯೋಗವಿದೆ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ಭೂಮಿ-ಕಾರಕ ಕುಜ (${mars ? toKannadaPlanet(mars.name) : "ಕುಜ"}), 4ನೇ ಗೃಹ/ಮಾತೃ ಸ್ಥಾನಾಧಿಪತಿ ${fourthLordKn} ಮತ್ತು ಶನಿಯ ದೃಷ್ಟಿಯು ಆಸ್ತಿ ವಿಭಾಗದ ಶಾಂತಿಯನ್ನು ಕದಡುತ್ತಿದೆ. ${
  isMarsSaturnAfflicted || cls.category === "property_share_dispute"
    ? "ದಾಖಲೆಗಳಲ್ಲಿನ ಲೋಪದೋಷಗಳು, ಸಹೋದರರಲ್ಲಿನ ಜಿಪುಣತನ ಅಥವಾ ಹಕ್ಕಿನ ತಿಕ್ಕಾಟದಿಂದಾಗಿ ಆಸ್ತಿ ಮಾರಾಟ ಅಥವಾ ವಿಭಾಗಕ್ಕೆ ಕೃತಕ ಅಡೆತಡೆ ಉಂಟಾಗುತ್ತಿದೆ."
    : "ಗ್ರಹಗಳು ಶುಭ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಸೌಹಾರ್ದಯುತ ಮಾತುಕತೆಯಿಂದ ಆಸ್ತಿ ಪಾಲು ಇತ್ಯರ್ಥ ಸಾಧ್ಯ."
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ, ಇನ್ನು ${cls.reliefTimelineKn} ಆಸ್ತಿ ವಿವಾದದಲ್ಲಿ ಮಹತ್ವದ ಒಡಂಬಡಿಕೆ ಅಥವಾ ನಿರ್ಣಾಯಕ ತಿರುವು ಲಭಿಸಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಭೂ-ವರಾಹ & ಸುಬ್ರಹ್ಮಣ್ಯ ಶಾಂತಿ ಸೇವೆ ಸಲ್ಲಿಸಿ. ಮನೆಯಲ್ಲಿ ಪ್ರತಿದಿನ ಭೂಮಿ ಸೂಕ್ತ ಅಥವಾ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕಂ ಪಠಿಸಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding property division, ancestral land, and family house share.

• 🔮 Direct Daivajna Verdict: ${isMarsSaturnAfflicted || cls.category === "property_share_dispute"
  ? "YES. The horoscope indicates severe contention, sibling/kinsmen friction, and legal or mediation bottlenecks over ancestral property, home partition, or land titles."
  : "While minor initial disputes exist, ancestral property will partition amicably through elders' mediation without permanent loss."
}

• 🎯 Astrological Root Cause & Planetary Alignment: Bhoomi-karaka Mars, 4th lord of landed estates ${fourthLordKn}, and Saturnian friction afflict title settlement and family consensus.

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, decisive property breakthrough and settlement materialize within ${cls.reliefTimelineEn}.

• 🪔 Prescribed Remedies & Solution: Perform Bhu-Varaha and Subrahmanya Shanti at holy Sri Kshetra Gokarna Kotiteertha to dissolve land encumbrances.`
      );
    }
  }

  // 0D. ACCURATE SPECIFIC PROFESSION DETERMINATION (ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ ನಿರ್ಣಯ - Which work is he doing?)
  if (isSpecificProfessionQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ, ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ಹಾಗೂ ನವಾಂಶವನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮ ನಿಖರ ವೃತ್ತಿಯನ್ನು ನಿರ್ಣಯಿಸಿದ್ದೇನೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಜಾತಕರ ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ: ${prof.titleKn} (${prof.specificRoleKn}) — ${prof.confidenceScore}% ನಿಖರ ಶಾಸ್ತ್ರೀಯ ಹೊಂದಾಣಿಕೆ.

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕರ್ಮ ಸ್ಥಾನ & ಗ್ರಹ ಸಂಯೋಗ: ${prof.astrologicalBasisKn}

• 🏢 ದಿನನಿತ್ಯದ ಕಾರ್ಯಕ್ಷೇತ್ರ & ಪರಿಸರ: ${prof.workEnvironmentKn}

• 🪐 ಶಾಸ್ತ್ರೀಯ ಆಧಾರ ಸ್ತಂಭಗಳು:
  1. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ (AmK): ${prof.amatyakarakaPlanetKn} — ಜೀವನಾಧಾರ ಕೌಶಲ್ಯ ಹಾಗೂ ವೃತ್ತಿ ಕರ್ಮದ ಅಧಿಪತಿ.
  2. 10ನೇ ಕರ್ಮ ಸ್ಥಾನ: ${prof.tenthHouseSignKn} ರಾಶಿ (ಅಧಿಪತಿ ${prof.primaryPlanetKn}).
${prof.secondaryAlternativeKn ? `• 🔄 ಪರ್ಯಾಯ / ಉಪ-ವೃತ್ತಿ ಅವಕಾಶ: ${prof.secondaryAlternativeKn}.` : ""}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಕಾಲದಲ್ಲಿ, ಇನ್ನು ${dashaTimeText} ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನಮಾನ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಆರ್ಥಿಕ ಮನ್ನಣೆ ದೊರೆಯಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ವೃತ್ತಿ ಕ್ಷೇತ್ರದ ನಿರಂತರ ಯಶಸ್ಸಿಗಾಗಿ ನಿಮ್ಮ ಭಾಗ್ಯಾಧಿಪತಿಯ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಧಾರಣೆ ಮಾಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗಣಪತಿ ಹವನ ಸಮರ್ಪಿಸಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your 10th house of vocation, Jaimini Amatyakaraka, and Navamsha to pinpoint your accurate profession.

• 🔮 Direct Daivajna Verdict: Native's Accurate Profession: ${prof.titleEn} (${prof.specificRoleEn}) — [${prof.confidenceScore}% Classical Alignment].

• 🎯 Astrological Root Cause & Planetary Alignment: ${prof.astrologicalBasisEn}

• 🏢 Daily Work Environment: ${prof.workEnvironmentEn}

• 🪐 Classical Astrological Pillars:
  1. Jaimini Amatyakaraka (AmK): ${prof.amatyakarakaPlanetEn} — prime significator of vocational craft and livelihood.
  2. 10th House of Career: ${prof.tenthHouseSignEn} (governed by ${prof.primaryPlanetEn}).
${prof.secondaryAlternativeEn ? `• 🔄 Secondary / Alternative Vocation: ${prof.secondaryAlternativeEn}.` : ""}

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, major vocational acceleration and recognition unfold within ${dashaTimeTextEn}.

• 🪔 Prescribed Remedies & Solution: Wear ${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight}) set in ${prescriptions.gemstoneRing.metalEn} and sponsor Rudrabhisheka at Sri Kshetra Gokarna Mahabaleshwara.`
      );
    }
  }

  // 1. CHILD BEHAVIOR & CRYING CONSULTATION
  if ((isChildQuery || isChild) && !isAddictionQuery && !isAffairQuery && !isSpeculationQuery && !isIllegalQuery && !isMarriageQuery && !isDebtQuery && !isFinanceCareerQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕವನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಹೌದು, ಮಗುವಿನ ಅಳು, ಕಿರಿಕಿರಿ ಮತ್ತು ಹಠವು ಸಾಮಾನ್ಯ ಮೊಂಡುತನವಲ್ಲ; ಇದು ಜಾತಕದಲ್ಲಿರುವ ಜಠರದ ತೀವ್ರ ಪಿತ್ತ ಶೂಲೆ (Pitta Colic) ಹಾಗೂ ಬಾಲಗ್ರಹ ದೃಷ್ಟಿ ದೋಷದಿಂದ ಉಂಟಾಗುತ್ತಿದೆ.

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ಲಗ್ನ ${lagnaKn}, ಚಂದ್ರ ರಾಶಿ ${moonRashiKn} (${moonNakKn} ನಕ್ಷತ್ರ). ${isBalarishta ? "ಚಂದ್ರನು 6/8/12ನೇ ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದು ಬಾಲಾರಿಷ್ಟ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಬಾಲಗ್ರಹ ಪ್ರಭಾವವನ್ನು ಉಂಟುಮಾಡುತ್ತಿದ್ದಾನೆ." : "ಚಂದ್ರನ ಮೇಲೆ ನೆರಳು ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ."} ${hasPittaColic ? "ಕುಜ ಗ್ರಹದ ಉಗ್ರ ಪಿತ್ತ ತತ್ವವು 2ನೇ ಮುಖ/ಆಹಾರ ಹಾಗೂ 5ನೇ ಜಠರ ಸ್ಥಾನದ ಮೇಲೆ ಒತ್ತಡ ತರುತ್ತಿದೆ." : "ಲಗ್ನದ ಮೇಲೆ ತೀಕ್ಷ್ಣ ಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇದೆ."} ಮಗುವಿಗೆ ಹೊಟ್ಟೆಯ ಅಸಹನೀಯ ಉರಿ ಮತ್ತು ನೋವನ್ನು ಹೇಳಲು ತಿಳಿಯದೆ, ನಿರಂತರ ಅಳು ಮತ್ತು ರೋದನದ ಮೂಲಕ ಹೊರಹಾಕುತ್ತದೆ. ಅಲ್ಲದೆ, ${hasDrishtiDosha ? "ಸಾರ್ವಜನಿಕರ ದೃಷ್ಟಿ ದೋಷದಿಂದ (Evil Eye) ರಾತ್ರಿ ನಿದ್ದೆಯಲ್ಲಿ ಹಠಾತ್ ಬೆದರಿ ಎಚ್ಚರಗೊಳ್ಳುವ ಲಕ್ಷಣಗಳಿವೆ." : "ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಸ್ಪರ್ಶದಿಂದ ಕಿರಿಕಿರಿ ಹೆಚ್ಚಾಗುತ್ತದೆ."}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯ ಲೆಕ್ಕಾಚಾರದಂತೆ, ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳಲ್ಲಿ ಗ್ರಹಗಳ ಗೋಚಾರ ಶಾಂತವಾಗುತ್ತಿದ್ದಂತೆ ಮಗುವಿನ ಈ ಅಳು ಮತ್ತು ಕಿರಿಕಿರಿ ಗಣನೀಯವಾಗಿ ಉಪಶಮನಗೊಳ್ಳಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಪರಮ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯ ರಕ್ಷಾ ಭಸ್ಮವನ್ನು ಮಗುವಿನ ಹಣೆಗೆ ನಿತ್ಯ ಧಾರಣೆ ಮಾಡಿಸಿ. ಮನೆಯಲ್ಲಿ ಪ್ರತಿದಿನ ${sunsetTime ? `ಸಂಜೆ ${sunsetTime}ರ ಗೋಧೂಳಿ ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ` : "ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ಗೋಧೂಳಿ ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ"} ಸ್ವಲ್ಪ ಕಲ್ಲುಪ್ಪು ಹಾಗೂ ಸಾಸಿವೆಯಿಂದ ಮಗುವಿಗೆ ದೃಷ್ಟಿ ತೆಗೆದು ಬೆಂಕಿಗೆ ಹಾಕಿ. ಇದರಿಂದ ಮಗು ಸುಖವಾಗಿ ನಿದ್ರಿಸಿ ಹರ್ಷಚಿತ್ತದಿಂದ ನಲಿಯಲಿದೆ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have examined the child's birth chart with rigorous Vedic scrutiny.

• 🔮 Direct Daivajna Verdict: YES. The child's persistent crying, irritation, and tantrums are not mere behavioral stubbornness; they stem directly from intense abdominal Pitta colic and Balagraha ocular sensitivities.

• 🎯 Astrological Root Cause & Planetary Alignment: Ascendant ${lagnaEn}, Moon Sign ${moonRashiEn}. ${isBalarishta ? "The Moon occupies the 6th/8th/12th Dusthana, triggering classic Balarishta sensitivities and Balagraha influences." : "The Moon is under nodal tension."} ${hasPittaColic ? "Mars casts intense Pitta fire onto the 2nd house of intake and 5th house of digestion." : ""} The child cannot verbally articulate internal stomach discomfort, manifesting as inconsolable screams. Furthermore, ${hasDrishtiDosha ? "ocular vulnerability (evil eye / Drishti dosha) triggers abrupt frights during sleep." : "twilight transitions agitate sensory comfort."}

• ⏳ Accurate Timeline / Turning Point: Under the ongoing ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, planetary gochara will soften over the next 3 to 6 months, bringing noticeable calmness and peaceful sleep.

• 🪔 Prescribed Remedies & Solution: Perform Balagraha Shanti and Mahamrityunjaya Sankalpa Seva at holy Sri Kshetra Gokarna Kotiteertha. Apply sacred Gokarna Mahabaleshwara Raksha Bhasma daily on the child's forehead. At home, rotate rock salt and mustard seeds around the child at ${sunsetTime ? `sunset twilight (${sunsetTime})` : "sunset twilight (Godhuli Sandhya)"} daily to dispel lingering evil eye afflictions.`
      );
    }
  }

  // 2. ALCOHOL & ADDICTIONS CONSULTATION (Teetotaler Guaranteed)
  if (isAddictionQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಮದ್ಯಪಾನ ಹಾಗೂ ವ್ಯಸನಗಳ ನೈಜ ಸ್ಥಿತಿಯ ದೃಷ್ಟಿಯಿಂದ ನಿಖರವಾಗಿ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  isChild
    ? `ಇಲ್ಲ! ಇದು ಕೇವಲ ${devoteeAge} ವರ್ಷದ ಮುಗ್ಧ ಬಾಲಕನ ಜಾತಕವಾಗಿದ್ದು, ಮದ್ಯಪಾನ ಅಥವಾ ಯಾವುದೇ ದುಶ್ಚಟಗಳ ಲಕ್ಷಣಗಳಿಲ್ಲ. ಮಗು ನೈಸರ್ಗಿಕವಾಗಿ ಸಾತ್ವಿಕ ಆಹಾರ ಸಂಸ್ಕಾರವುಳ್ಳ ಮುಗ್ಧ ಬಾಲಕ.`
    : isTeetotaler
    ? "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮದ್ಯಪಾನ ಅಥವಾ ದುಶ್ಚಟಗಳ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ. ನೀವು ನೈಸರ್ಗಿಕವಾಗಿ ಸಾತ್ವಿಕ ಆಹಾರ ಪ್ರಿಯರು (Teetotaler) ಹಾಗೂ ಸಾತ್ವಿಕ ಆಹಾರ ಸಂಸ್ಕಾರವುಳ್ಳ ಪರಿಶುದ್ಧ ವ್ಯಕ್ತಿ."
    : isDailyDrinking
    ? "ಹೌದು! ಜಾತಕದಲ್ಲಿ ನಿತ್ಯ ಮದ್ಯಪಾನ (Daily Drinking Habit) ಹಾಗೂ ಸಂಜೆಯಾಗುತ್ತಿದ್ದಂತೆ ಅಮಲು ಪದಾರ್ಥಗಳ ಸೆಳೆತಕ್ಕೆ ಒಳಗಾಗುವ ಗಂಭೀರ ವ್ಯಸನದ ಲಕ್ಷಣಗಳಿವೆ."
    : isSocialDrinking
    ? "ಭಾಗಶಃ ಹೌದು. ಇದು ದಿನನಿತ್ಯದ ಚಟವಲ್ಲದಿದ್ದರೂ ಸ್ನೇಹಿತರ ಸಹವಾಸ ಹಾಗೂ ಪಾರ್ಟಿಗಳಲ್ಲಿ ಸಾಮಾಜಿಕ ಮದ್ಯಪಾನ (Social Drinking) ಅಭ್ಯಾಸವಾಗಿ ಬೆಳೆಯುವ ಅಪಾಯವಿದೆ."
    : "ಇಲ್ಲ! ನಿಮ್ಮ 2ನೇ ಮುಖ/ಆಹಾರ ಸ್ಥಾನ ಹಾಗೂ ಲಗ್ನವು ಸಾತ್ವಿಕವಾಗಿದ್ದು, ಜಾತಕದಲ್ಲಿ ಮದ್ಯಪಾನ ಅಥವಾ ಅಮಲು ಪದಾರ್ಥಗಳ ಯಾವುದೇ ಗಂಭೀರ ವ್ಯಸನದ ಲಕ್ಷಣಗಳಿಲ್ಲ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ${
  isTeetotaler
    ? "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 2ನೇ ಮುಖ/ಆಹಾರ ಸ್ಥಾನ ಹಾಗೂ ದ್ವಿತೀಯಾಧಿಪತಿಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ದೈವಿಕ ದೃಷ್ಟಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಗ್ರಹಗಳ ರಕ್ಷಣೆಯಿದೆ. ಇದು ನೈಸರ್ಗಿಕವಾಗಿ ಯಾವುದೇ ಮಾದಕ ವ್ಯಸನಗಳಿಂದ ದೂರವಿರುವ ಶುದ್ಧ ಸಂಸ್ಕಾರ ಹಾಗೂ ಇಂದ್ರಿಯ ನಿಗ್ರಹವನ್ನು ಕರುಣಿಸಿದೆ."
    : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನ ${saturn?.house === 8 ? "8ನೇ ಮನೆಯಲ್ಲಿರುವ ಶನಿಯ 7ನೇ ನೇರ ದೃಷ್ಟಿಗೆ ಒಳಗಾಗಿದೆ — ಇದು ಶಾಸ್ತ್ರದಲ್ಲಿ ನಿತ್ಯ ಮದ್ಯಪಾನದ ಪ್ರಬಲ ಸಂಕೇತ." : ([saturn, rahu, mars, ketu].some(p => p && p.house === 2) ? "2ನೇ ಮನೆಯಲ್ಲೇ ಪಾಪಗ್ರಹಗಳು ಸ್ಥಿತವಾಗಿದ್ದು ಮುಖದ ಸೇವನೆಯನ್ನು ಕೆಡಿಸುತ್ತಿವೆ." : "ಮತ್ತು 8ನೇ ರಹಸ್ಯ ಸ್ಥಾನಗಳ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ನೆರಳು ಪ್ರಭಾವವಿದೆ.")} ${
      isDailyDrinking
        ? "ಸಂಜೆಯಾಗುತ್ತಿದ್ದಂತೆ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡ ಎದುರಾದಾಗ ಮದ್ಯದ ಸೆಳೆತ ನಿಯಂತ್ರಣ ಮೀರುತ್ತದೆ. ಇದರಿಂದ ಯಕೃತ್ತು (Liver), ನರಮಂಡಲ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಕ್ಷೀಣಿಸುವ ಅಪಾಯವಿದೆ."
        : isSocialDrinking
        ? "ಸ್ನೇಹಿತರ ಒತ್ತಾಯ ಅಥವಾ ಮನರಂಜನೆಯ ನೆಪದಲ್ಲಿ ಆರಂಭವಾಗುವ ಪಾನೀಯ ಸೇವನೆ ಕ್ರಮೇಣ ಅಭ್ಯಾಸವಾಗದಂತೆ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ."
        : "ನಿಮ್ಮ 2ನೇ ಸ್ಥಾನವು ಸಾತ್ವಿಕವಾಗಿದ್ದು, ಆತ್ಮಬಲದಿಂದ ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ."
    }`
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${
  !isTeetotaler && (isDailyDrinking || isSocialDrinking)
    ? `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ, ${dashaTimeText} ದೈವಿಕ ಸಂಕಲ್ಪ ಕೈಗೊಂಡರೆ ಈ ವ್ಯಸನದ ಸೆಳೆತದಿಂದ ಸಂಪೂರ್ಣ ಶಾಶ್ವತ ಮುಕ್ತಿ ಹೊಂದಲು ಸಾಧ್ಯ.`
    : `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಸಾತ್ವಿಕ ಆತ್ಮಬಲ ಸದಾ ಸುರಕ್ಷಿತವಾಗಿರಲಿದೆ.`
}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${
  !isTeetotaler && (isDailyDrinking || isSocialDrinking)
    ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಮಹಾಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ರಾಹು-ಕೇತು ಶಾಂತಿ ಸೇವೆ ಸಲ್ಲಿಸಿ. ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಪಂಚಾಕ್ಷರಿ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಜಪಿಸಿ ಪವಿತ್ರ ತೀರ್ಥ ಸೇವಿಸುವುದರಿಂದ ಮದ್ಯದ ಅಮಲು ಸೆಳೆತ ಕ್ರಮೇಣ ನಾಶವಾಗಲಿದೆ."
    : "ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ಗಾಯತ್ರಿ ಜಪಿಸಿ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ ಸದಾ ಸಾತ್ವಿಕ ತೇಜಸ್ಸನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ."
}`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart specifically regarding alcohol and substance tendencies.

• 🔮 Direct Daivajna Verdict: ${
  isTeetotaler
    ? "NO! There is absolutely NO signature of alcohol, smoking, or substance addiction in your horoscope. You are a natural teetotaler with wholesome sattvic dietary sanctity."
    : isDailyDrinking
    ? "YES. The horoscope clearly indicates an authentic daily drinking habit and vulnerability to evening substance cravings."
    : isSocialDrinking
    ? "PARTIAL RISK. While not a constant daily addiction, peer-driven social drinking at gatherings carries a strong risk of developing into a recurring dependency."
    : "NO. Your 2nd house of oral intake and ascendant are sattvic; there is no astrological signature of chronic alcohol or substance addiction."
}

• 🎯 Astrological Root Cause & Planetary Alignment: ${
  isTeetotaler
    ? "The 2nd house of oral intake and its lord receive the divine protective aspect of Jupiter, bestowing innate aversion to intoxicating substances and sustaining dietary purity."
    : `The 2nd house of oral intake ${saturn?.house === 8 ? "receives the direct 7th aspect from Saturn in the 8th house — the classical signature of daily alcohol consumption." : ([saturn, rahu, mars, ketu].some(p => p && p.house === 2) ? "is directly occupied by malefics, corrupting dietary restraint." : "is under nodal and dusthana afflictions.")}`
}

• ⏳ Accurate Timeline / Turning Point: ${
  !isTeetotaler && (isDailyDrinking || isSocialDrinking)
    ? `Under the current ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, committing to detox ${dashaTimeTextEn} will permanently dissolve the substance grip.`
    : `Under the current ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, your wholesome vitality and clean habits will continue to protect you.`
}

• 🪔 Prescribed Remedies & Solution: ${
  !isTeetotaler && (isDailyDrinking || isSocialDrinking)
    ? "Perform Atma Linga Sparsha, Prayashchitta Sankalpa Pooja, and Rahu-Ketu Shanti at Sri Kshetra Gokarna Mahabaleshwara. Chant the Shiva Panchakshari Mantra 108 times at dawn to purify oral impulses."
    : "Chant the Surya Gayatri Mantra at dawn and sponsor Ksheerabhisheka at Sri Kshetra Gokarna Mahabaleshwara to sustain your spiritual radiance."
}`
      );
    }
  }

  // 3. EXTERNAL AFFAIRS, GENDER ATTRACTIONS & SENSUAL REALITY (ZERO CONTRADICTION)
  if (isAffairQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಕಾಮನೆ, ಆಕರ್ಷಣೆ ಹಾಗೂ ದಾಂಪತ್ಯ ರಹಸ್ಯಗಳ ವಿಷಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮವಾಗಿ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  hasSameGenderAffinity
    ? `ಹೌದು. ಜಾತಕದ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರರ ವಿಶಿಷ್ಟ ತತ್ವದಿಂದಾಗಿ, ಲೈಂಗಿಕ ಆಕರ್ಷಣೆಯು ${isMale ? "ಪುರುಷರತ್ತ (Same-Gender Attraction)" : "ಮಹಿಳೆಯರತ್ತ"} ಸೆಳೆಯುವ ರಹಸ್ಯ ಪ್ರವೃತ್ತಿ ಜಾತಕದಲ್ಲಿದೆ.`
    : hasSensual
    ? `ಹೌದು! ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ-ರಾಹು/ಕುಜರ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಾಂಪತ್ಯದ ಆಚೆಗೆ ಹೊರಗಿನ ${isMale ? "ಸ್ತ್ರೀಯರತ್ತ (ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹ)" : "ಪುರುಷರತ್ತ"} ಆಕರ್ಷಣೆ ಹಾಗೂ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ತೀವ್ರ ಅಪಾಯದ ಲಕ್ಷಣಗಳಿವೆ.`
    : "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ, ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ವ್ಯಾಮೋಹ ಅಥವಾ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ. ನಿಮ್ಮಲ್ಲಿ ಅತ್ಯುನ್ನತ ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ನೈತಿಕ ಸದಾಚಾರದ ರಕ್ಷಣೆ ಇದೆ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ (ಕಾಮ), 8ನೇ ರಹಸ್ಯ ಹಾಗೂ 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ${toKannadaPlanet(seventhLord)} ಮತ್ತು ಶುಕ್ರ ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ. ${
  hasSameGenderAffinity
    ? `7ನೇ ಮತ್ತು 8ನೇ ಭಾವಗಳಲ್ಲಿ ಬುಧ-ಶನಿ ಮತ್ತು ಶುಕ್ರರ ನಪುಂಸಕ/ವಿಶಿಷ್ಟ ತತ್ವ ಇರುವುದರಿಂದ, ಸಮಾಜದ ಸಾಂಪ್ರದಾಯಿಕ ನಿರೀಕ್ಷೆಗಳಿಗೆ ಹೆದರಿ ಈ ಆಕರ್ಷಣೆಯನ್ನು ಅಂತರಂಗದಲ್ಲೇ ಅತ್ಯಂತ ಗೌಪ್ಯವಾಗಿ ಮುಚ್ಚಿಡುವ ಪ್ರವೃತ್ತಿ ಇದೆ.`
    : hasSensual
    ? (isMale ? "7ನೇ ಕಳತ್ರ ಮತ್ತು 12ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ಶುಕ್ರ-ರಾಹುವಿನ ತೀವ್ರ ಪ್ರಭಾವದಿಂದಾಗಿ, ರಹಸ್ಯ ಫೋನ್ ಕರೆಗಳು ಹಾಗೂ ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧಗಳತ್ತ ಮನಸ್ಸು ಜಾರುವ ಅಪಾಯವಿದೆ. ಇದು ಕೌಟುಂಬಿಕ ಶಾಂತಿಗೆ ಕುತ್ತು ತರಬಹುದು." : "7ನೇ ಮತ್ತು 8ನೇ ಭಾವಗಳಲ್ಲಿ ಕುಜ-ರಾಹುವಿನ ಸೆಳೆತದಿಂದಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅತೃಪ್ತಿ ಉಂಟಾದಾಗ ಹೊರಗಿನ ವ್ಯಕ್ತಿಗಳತ್ತ ಭಾವನಾತ್ಮಕ ಸೆಳೆತ ಉಂಟಾಗುವ ಅಪಾಯವಿದೆ.")
    : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಮತ್ತು ಕೌಟುಂಬಿಕ ಸದಾಚಾರದ ಬಲವಾದ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ. ಬಾಹ್ಯ ಆಕರ್ಷಣೆಗಳಿಗೆ ಜಾರದ ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರ ನಿಮ್ಮಲ್ಲಿದೆ."
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${
  hasSensual || hasSameGenderAffinity
    ? `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಸಮಯದಲ್ಲಿ ನೈತಿಕ ಶಿಸ್ತು ಹಾಗೂ ರಹಸ್ಯ ಸಂವಹನಗಳಿಂದ ದೂರವಿರುವುದು ಅತ್ಯಗತ್ಯ; ಇಲ್ಲದಿದ್ದರೆ ಗುಪ್ತ ಸಂಬಂಧಗಳು ಸಾರ್ವಜನಿಕವಾಗಿ ಬಯಲಾಗಿ ತೀವ್ರ ಮಾನಹಾನಿ ಉಂಟಾಗುವ ಗ್ರಹಗತಿಯಿದೆ.`
    : `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ನೈತಿಕ ನಿಷ್ಠೆ ಅಚಲವಾಗಿದ್ದು, ಇನ್ನು ${dashaTimeText} ದಾಂಪತ್ಯದಲ್ಲಿನ ಬಾಹ್ಯ ಅನುಮಾನಗಳು ಸಂಪೂರ್ಣವಾಗಿ ದೂರವಾಗಿ ಪರಸ್ಪರ ವಿಶ್ವಾಸ ಮತ್ತು ಗೌರವ ಗಟ್ಟಿಯಾಗಲಿದೆ.`
}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${
  hasSensual || hasSameGenderAffinity
    ? `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ಶುಕ್ರ-ರಾಹು ಶಾಂತಿ ಮಾಡಿಸಿ. ${prescriptions.rudraksha.nameKn} ಧಾರಣೆಯಿಂದ ಮನಸ್ಸಿನ ಕಾಮ ಪ್ರಚೋದನೆ ಶಾಂತವಾಗಿ ದಾಂಪತ್ಯ ನಿಷ್ಠೆ ರಕ್ಷಿಸಲ್ಪಡುತ್ತದೆ.`
    : "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಪರಸ್ಪರ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ಸದಾ ನೆಲೆಸಿರಲು ಶಿವ-ಪಾರ್ವತಿಯರ ಕೃಪಾಶೀರ್ವಾದ ಪಡೆಯಿರಿ."
}`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding sensual desires and relationship boundaries.

• 🔮 Direct Daivajna Verdict: ${
  hasSameGenderAffinity
    ? `YES. Specific planetary yogas involving Mercury, Saturn, and Venus indicate internal sexual attraction toward ${isMale ? "men (same-gender orientation)" : "women"}, maintained with strict confidentiality.`
    : hasSensual
    ? `YES. Powerful Venus-Rahu/Mars alignment creates high vulnerability toward extramarital attraction and outside liaisons.`
    : "NO! There is absolutely NO risk of extramarital affairs, illicit liaisons, or outside attraction in your horoscope. Your chart possesses strong moral rectitude and marital fidelity."
}

• 🎯 Astrological Root Cause & Planetary Alignment: The 7th house of partnership, 8th house of secret liaisons, and 12th house of pleasure reflect configurations involving Venus and the 7th lord. ${
  hasSameGenderAffinity
    ? `Vedic yogas involving Mercury and Saturn across kama and secret houses indicate internal sexual affinity toward ${isMale ? "men (same-gender orientation)" : "women"}, maintained with strict confidentiality.`
    : hasSensual
    ? (isMale ? "Venus-Rahu proximity on the 7th/12th axis creates vulnerability toward women outside marriage, posing a threat to marital honor." : "Mars-Rahu tension creates vulnerability toward outside men during disputes.")
    : "A protected 7th house shields you with moral rectitude, sensual discipline, and faithful commitment to marital sanctity."
}

• ⏳ Accurate Timeline / Turning Point: ${
  hasSensual || hasSameGenderAffinity
    ? `Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, maintain strict ethical discipline and distance from secret communication to avoid public embarrassment.`
    : `Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, your moral integrity remains firm; within ${dashaTimeTextEn}, lingering marital doubts dissolve, cementing mutual trust.`
}

• 🪔 Prescribed Remedies & Solution: ${
  hasSensual || hasSameGenderAffinity
    ? `Perform Uma-Maheshwara Pooja and Venus-Rahu Shanti at Sri Kshetra Gokarna. Wearing the prescribed ${prescriptions.rudraksha.nameEn} calms sensual agitation and anchors ethical integrity.`
    : "Sponsor an auspicious Uma-Maheshwara Kalyana Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara to invoke lifelong harmony, peace, and mutual love in marriage."
}`
      );
    }
  }

  // 4. SPECULATION, SHARE MARKET TRADING & SHORTCUT LOSS
  if (isSpeculationQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಷೇರು ಮಾರುಕಟ್ಟೆ, ಟ್ರೇಡಿಂಗ್ ಹಾಗೂ ಸ್ಪೆಕ್ಯುಲೇಶನ್ ನಷ್ಟದ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  isSpeculationLoss
    ? `ಇಲ್ಲ, ಲಾಭ ಸಾಧ್ಯವೇ ಇಲ್ಲ! ಜಾತಕದಲ್ಲಿ ಷೇರು ಮಾರುಕಟ್ಟೆ, ಇಂಟ್ರಾಡೇ/ಆಪ್ಷನ್ಸ್ ಟ್ರೇಡಿಂಗ್ ಹಾಗೂ ಬೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಭಾರಿ ಬಂಡವಾಳ ನಷ್ಟ (${lossInfo.lossKn}ಕ್ಕೂ ಅಧಿಕ ನಷ್ಟ) ಹಾಗೂ ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕುವ ಸ್ಪಷ್ಟ ದುರ್ಯೋಗವಿದೆ; ತಕ್ಷಣವೇ ಟ್ರೇಡಿಂಗ್ ನಿಲ್ಲಿಸಬೇಕು.`
    : "ದಿನನಿತ್ಯದ ಜೂಜು ಅಥವಾ ಟ್ರೇಡಿಂಗ್ ಬೇಡ; ಆದರೆ ದೀರ್ಘಕಾಲೀನ ಸುರಕ್ಷಿತ ಹೂಡಿಕೆಗಳಲ್ಲಿ (Long-term SIP/Mutual Funds) ಹಂತ ಹಂತವಾಗಿ ಲಾಭ ಗಳಿಸುವ ಯೋಗವಿದೆ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: 5ನೇ ಸ್ಪೆಕ್ಯುಲೇಶನ್/ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿ ${rahu?.house === 5 ? "ನೆರಳು ಗ್ರಹ ರಾಹುವಿದ್ದು" : "ಗ್ರಹಗಳ ಸಂಚಾರವಿದ್ದು"}, ಪಂಚಮಾಧಿಪತಿ ${fifthLordKn} ${isFifthLordNeecha ? "ನೀಚ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ" : "ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ"} ಹಾಗೂ 8ನೇ ಮನೆಯಲ್ಲಿ ${saturn?.house === 8 ? "ಅಷ್ಟಮ ಶನಿ" : "ಅಷ್ಟಮ ಗ್ರಹ"} ಪ್ರಭಾವವಿದೆ. ಇದು ಷೇರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕಳೆದುಕೊಂಡ ಹಣವನ್ನು ಮತ್ತೆ ಟ್ರೇಡಿಂಗ್‌ನಲ್ಲೇ ವಾಪಸ್ ಪಡೆಯಬೇಕೆಂಬ ಹಠದ ಭ್ರಮೆಯನ್ನು ಉಂಟುಮಾಡಿ, ಸಾಲದ ಸುಳಿಯನ್ನು ವಿಸ್ತರಿಸುತ್ತದೆ.

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಕಾಲದಲ್ಲಿ ಇನ್ನು ${dashaTimeText} ಸ್ಪೆಕ್ಯುಲೇಶನ್ ಸಂಪೂರ್ಣವಾಗಿ ನಿಲ್ಲಿಸಿದರೆ ಮಾತ್ರ ಸಾಲದ ಸುಳಿಯಿಂದ ಪಾರಾಗಿ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮರಳಿ ಪಡೆಯಬಹುದು.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ & ಕುಬೇರ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ರಾಹು ಶಾಂತಿ ಮಾಡಿಸಿ. ${prescriptions.gemstoneRing.primaryGemstoneKn} ಧರಿಸಿ ಕೇವಲ ನೈಜ ಪರಿಶ್ರಮದ ವ್ಯಾಪಾರ ಅಥವಾ ಉದ್ಯೋಗದಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding stock market day trading and speculation.

• 🔮 Direct Daivajna Verdict: ${
  isSpeculationLoss
    ? `NO PROFIT! The horoscope carries a severe affliction for share market day trading, F&O options, and betting, resulting in catastrophic capital wipeout (${lossInfo.lossEn}) and crushing debt trap. Cease trading immediately.`
    : "AVOID day trading and quick speculation; however, disciplined long-term safe investments (SIP, real assets) will yield steady financial returns."
}

• 🎯 Astrological Root Cause & Planetary Alignment: 5th house of speculation is afflicted by Rahu, coupled with an afflicted 5th lord ${fifthLordKn} and 8th house Saturn tension. This fuels an obsessive urge to recover lost funds through more trading, leading to severe debt entrapment.

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, stopping speculation completely within ${dashaTimeTextEn} will arrest capital drainage and restore solvency.

• 🪔 Prescribed Remedies & Solution: Perform Mahaganapati and Kubera Sankalpa Pooja and Rahu Shanti at Sri Kshetra Gokarna. Channel your energy into legitimate business or employment.`
      );
    }
  }

  // 5. UNETHICAL WORK, SMUGGLING & SHORTCUT WEALTH
  if (isIllegalQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಧನಾರ್ಜನೆ, ಅಕ್ರಮ ವ್ಯವಹಾರ ಹಾಗೂ ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್) ರಿಸ್ಕ್ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  hasIllegal
    ? "ಹೌದು! ಜಾತಕದಲ್ಲಿ ಅಡ್ಡದಾರಿ ಹಣ, ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್), ಹವಾಲಾ ಅಥವಾ ಅಕ್ರಮ ಆಮಿಷಗಳಿಗೆ ಮನಸ್ಸು ಸೆಳೆಯುವ ತೀವ್ರ ದುಸ್ಸಾಹಸ ಯೋಗವಿದೆ; ಆದರೆ ಇದರ ಅಂತಿಮ ಫಲ ಪೊಲೀಸ್ ಕೇಸ್ ಮತ್ತು ಜೈಲು ಭಯ."
    : "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಧರ್ಮ ಮತ್ತು ಕರ್ಮ ಸ್ಥಾನಗಳು ಶುದ್ಧವಾಗಿದ್ದು, ಅಕ್ರಮ ವ್ಯವಹಾರ ಅಥವಾ ಕಳ್ಳಸಾಗಣೆಯ ಯಾವುದೇ ಕಳಂಕವಿಲ್ಲ. ಪ್ರಾಮಾಣಿಕ ದುಡಿಮೆಯೇ ನಿಮ್ಮ ಶಕ್ತಿ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ಜಾತಕದ 8ನೇ ರಹಸ್ಯ/ಅಕ್ರಮ ಸ್ಥಾನ ಅಥವಾ 11ನೇ ಲಾಭ ಭಾವದಲ್ಲಿ ನೆರಳು ಗ್ರಹ ರಾಹುವಿನ ಪ್ರಬಲ ಪ್ರಭಾವವಿದೆ. ${
  hasIllegal
    ? "ಶ್ರಮವಿಲ್ಲದೆ ತ್ವರಿತವಾಗಿ ಕೋಟಿಗಟ್ಟಲೆ ಹಣ ಗಳಿಸುವ ಅಡ್ಡದಾರಿ, ಬೆಟ್ಟಿಂಗ್ ಅಥವಾ ಅಕ್ರಮ ಕಪ್ಪು ಹಣದ ವ್ಯವಹಾರಗಳತ್ತ ಮನಸ್ಸು ಆಕರ್ಷಿತವಾಗುವ ದುಸ್ಸಾಹಸ ಯೋಗವಿದೆ. ಆರಂಭದಲ್ಲಿ ದೊಡ್ಡ ಅಕ್ರಮ ಲಾಭ ಕಂಡರೂ, ಅಂತಿಮವಾಗಿ ಪೊಲೀಸ್ ಕೇಸ್, ಕಸ್ಟಮ್ಸ್/ಐಟಿ ದಾಳಿ, ಕೋರ್ಟ್ ಸಂಕೋಲೆ ಹಾಗೂ ಮಾನಹಾನಿಯ ಅಪಾಯವಿದೆ."
    : "ನಿಮ್ಮ ಧರ್ಮ-ಕರ್ಮ ಸ್ಥಾನಗಳು ಶುದ್ಧವಾಗಿದ್ದು, ಅಕ್ರಮ ವ್ಯವಹಾರ ಅಥವಾ ಕಳ್ಳಸಾಗಣೆಯ ದುಸ್ಸಾಹಸಕ್ಕೆ ಕೈಹಾಕದೆ ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ದುಡಿಮೆಯಲ್ಲಿ ಬೆಳೆಯುವ ಸದ್ಬುದ್ಧಿ ನಿಮ್ಮಲ್ಲಿದೆ."
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ ಕಾನೂನುಬಾಹಿರ ಕೃತ್ಯಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ; ಇಲ್ಲದಿದ್ದರೆ ಅನಿರೀಕ್ಷಿತ ಕಾನೂನಿನ ಬಲೆಗೆ ಸಿಲುಕುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ರಾಹು-ಕಾಲಸರ್ಪ ಶಾಂತಿ, ಸುಬ್ರಹ್ಮಣ್ಯ ಆಶ್ಲೇಷ ಬಲಿ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಅಕ್ರಮ ಸಂಪಾದನೆಯ ದುರಾಸೆಯನ್ನು ತ್ಯಜಿಸಿ ಸನ್ಮಾರ್ಗದ ಪ್ರಾಮಾಣಿಕ ವ್ಯಾಪಾರದಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have examined your birth chart regarding unearned wealth, smuggling, and high-risk shortcuts.

• 🔮 Direct Daivajna Verdict: ${
  hasIllegal
    ? "HIGH RISK. The chart reflects strong temptation toward illicit shortcut wealth, smuggling, or grey-market deals, carrying critical risks of legal arrest and public disgrace."
    : "NO. Your dharma-karma axis is untainted; you possess strong natural resistance to illegal shortcuts and contraband ventures."
}

• 🎯 Astrological Root Cause & Planetary Alignment: Rahu heavily influences the 8th house of illicit wealth and the 11th house of rapid speculation. Unlawful shortcuts carry severe litigation and regulatory liabilities.

• ⏳ Accurate Timeline / Turning Point: Under the running ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, maintain strict regulatory compliance within ${dashaTimeTextEn} to avoid severe legal penalties.

• 🪔 Prescribed Remedies & Solution: Perform Rahu-Kalasarpa Shanti at Gokarna Kotiteertha and pursue only righteous, legally compliant ventures.`
      );
    }
  }

  // 5B. THEFT, FRAUD & EMBEZZLEMENT (Chora Yoga)
  if (isTheftFraudQuery) {
    const shades = currentDiagnosis.negativeShades ?? evaluateNativeNegativeShadesAndCriminality(kundli, { birthDate: "", birthTime: "", latitude: 0, longitude: 0, devoteeAge: age, gender });
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಆರ್ಥಿಕ ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ಚೋರ ಯೋಗದ ನೈಜ ಸ್ಥಿತಿಯ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  !shades.financialIntegrity.hasRisk
    ? "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳ್ಳತನ (ಚೋರ ಯೋಗ), ವಂಚನೆ, ಆರ್ಥಿಕ ನಂಬಿಕೆದ್ರೋಹ ಅಥವಾ ಅಕ್ರಮ ಸಂಪಾದನೆಯ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ. ನೀವು ಅತ್ಯಂತ ಪ್ರಾಮಾಣಿಕ, ನ್ಯಾಯಯುತ ದುಡಿಮೆಯನ್ನು ನಂಬುವ ಪರಿಶುದ್ಧ ವ್ಯಕ್ತಿತ್ವ."
    : "ಹೌದು, ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ! ಶಾಸ್ತ್ರೋಕ್ತ ಚೋರ ಯೋಗ ಅಥವಾ ಆರ್ಥಿಕ ವಂಚನೆಯ ದುರ್ಬುದ್ಧಿ ಕಾಡುವ ಗ್ರಹ ಸ್ಥಿತಿ ಜಾತಕದಲ್ಲಿದೆ; ಯಾವುದೇ ಅಕ್ರಮ ಆಮಿಷಗಳಿಗೆ ಬಲಿಯಾಗಬಾರದು."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ${cleanAstrologyText(shades.financialIntegrity.analysisKn)}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${cleanAstrologyText(shades.activeDashaTriggerKn)}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${cleanAstrologyText(shades.protectionRemedyKn)}`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have scrutinized your birth chart regarding financial honesty and Chora Yoga.

• 🔮 Direct Daivajna Verdict: ${
  !shades.financialIntegrity.hasRisk
    ? "NO! There is absolutely NO signature of theft, embezzlement, cheating, or financial fraud in your horoscope. You are an upright person dedicated to honest earnings."
    : "CAUTION REQUIRED. Astrological indicators show vulnerability to financial fraud or theft tendencies under acute stress; maintain strict fiduciary ethics."
}

• 🎯 Astrological Root Cause & Planetary Alignment: ${cleanAstrologyText(shades.financialIntegrity.analysisEn)}

• ⏳ Accurate Timeline / Turning Point: ${cleanAstrologyText(shades.activeDashaTriggerEn)}

• 🪔 Prescribed Remedies & Solution: ${cleanAstrologyText(shades.protectionRemedyEn)}`
      );
    }
  }

  // 5C. VIOLENCE, ASSAULT & CRUELTY (Asura / Angaraka Yoga)
  if (isViolenceMurderQuery) {
    const shades = currentDiagnosis.negativeShades ?? evaluateNativeNegativeShadesAndCriminality(kundli, { birthDate: "", birthTime: "", latitude: 0, longitude: 0, devoteeAge: age, gender });
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಶಾಂತಿ ಪ್ರವೃತ್ತಿ, ಕೋಪ ಹಾಗೂ ಕ್ರೌರ್ಯದ ನೈಜ ಸ್ಥಿತಿಯ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  !shades.violenceAggression.hasRisk
    ? "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಹತ್ಯಾ ಯೋಗ, ಕ್ರೌರ್ಯ, ಮಾರಣಾಂತಿಕ ಹಲ್ಲೆ ಅಥವಾ ಹಿಂಸಾತ್ಮಕ ಅಪರಾಧದ ಯಾವುದೇ ಲವಲೇಶವೂ ಇಲ್ಲ. ನಿಮ್ಮ ಹೃದಯದಲ್ಲಿ ಸಹಜ ಕರುಣೆ, ಸೌಜನ್ಯ ಮತ್ತು ಅಹಿಂಸಾ ಧರ್ಮ ನೆಲೆಸಿದೆ."
    : "ಹೌದು, ಉಗ್ರ ಕೋಪದ ಎಚ್ಚರಿಕೆ! ಜಾತಕದಲ್ಲಿ ಅಂಗಾರಕ-ಅಸುರ ಯೋಗದ ಪ್ರಭಾವವಿದ್ದು, ಆವೇಶದ ಕ್ಷಣದಲ್ಲಿ ಹಿಂಸೆ ಅಥವಾ ಮಾರಣಾಂತಿಕ ಹಲ್ಲೆಗೆ ಕೈಹಾಕುವ ವಿನಾಶಕಾರಿ ನೆರಳಿದೆ; ತಕ್ಷಣವೇ ಮನಸ್ಸನ್ನು ನಿಯಂತ್ರಿಸಿಕೊಳ್ಳುವುದು ಅಗತ್ಯ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ${cleanAstrologyText(shades.violenceAggression.analysisKn)}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${cleanAstrologyText(shades.activeDashaTriggerKn)}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${cleanAstrologyText(shades.protectionRemedyKn)}`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have scrutinized your birth chart regarding temperamental aggression and violence.

• 🔮 Direct Daivajna Verdict: ${
  !shades.violenceAggression.hasRisk
    ? "NO! There is absolutely NO signature of murderous violence, physical cruelty, or criminal assault in your horoscope. You are grounded in non-violence (Ahimsa) and compassion."
    : "SEVERE CAUTION! Mars-Rahu affliction indicates volcanic explosive rage and violent confrontation when provoked; emotional self-restraint is paramount."
}

• 🎯 Astrological Root Cause & Planetary Alignment: ${cleanAstrologyText(shades.violenceAggression.analysisEn)}

• ⏳ Accurate Timeline / Turning Point: ${cleanAstrologyText(shades.activeDashaTriggerEn)}

• 🪔 Prescribed Remedies & Solution: ${cleanAstrologyText(shades.protectionRemedyEn)}`
      );
    }
  }

  // 5D. LEGAL CONFINEMENT & IMPRISONMENT (Bandhana Yoga)
  if (isLegalBandhanaQuery) {
    const shades = currentDiagnosis.negativeShades ?? evaluateNativeNegativeShadesAndCriminality(kundli, { birthDate: "", birthTime: "", latitude: 0, longitude: 0, devoteeAge: age, gender });
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಕಾನೂನು ಗೌರವ ಹಾಗೂ ಬಂಧನ ಯೋಗದ (ಕಾರಾಗೃಹ ವಾಸ) ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  !shades.legalBandhana.hasRisk
    ? "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಬಂಧನ ಯೋಗ, ಪೊಲೀಸ್ ಕೇಸು ಅಥವಾ ಕಾರಾಗೃಹ ವಾಸದ ಯಾವುದೇ ಗ್ರಹ ದೋಷಗಳಿಲ್ಲ. ನೀವು ಸಮಾಜದಲ್ಲಿ ಕಾನೂನಿನ ಚೌಕಟ್ಟನ್ನು ಗೌರವಿಸುವ ಗೌರವಾನ್ವಿತ ಸತ್ಪ್ರಜೆ."
    : "ಹೌದು, ಕಾನೂನು ಎಚ್ಚರಿಕೆ! ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಜಾತಕದಲ್ಲಿ ಬಂಧನ ಯೋಗದ (Bandhana Yoga #196) ಪ್ರಭಾವವಿದ್ದು, ಕಾನೂನು ಉಲ್ಲಂಘನೆ ಮಾಡಿದರೆ ಪೊಲೀಸ್ ತನಿಖೆ ಅಥವಾ ಕಾರಾಗೃಹ ವಾಸದ ಅಪಾಯವಿದೆ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ${cleanAstrologyText(shades.legalBandhana.analysisKn)}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${cleanAstrologyText(shades.activeDashaTriggerKn)}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${cleanAstrologyText(shades.protectionRemedyKn)}`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding civic standing and legal confinement (Bandhana Yoga).

• 🔮 Direct Daivajna Verdict: ${
  !shades.legalBandhana.hasRisk
    ? "NO! There is absolutely NO signature of imprisonment, arrest, or police custody in your horoscope. You are an upright, law-abiding citizen."
    : "LEGAL CAUTION REQUIRED. Classical Bandhana Yoga signatures suggest vulnerability to state penalties, litigation, or confinement if involved in unlawful activities."
}

• 🎯 Astrological Root Cause & Planetary Alignment: ${cleanAstrologyText(shades.legalBandhana.analysisEn)}

• ⏳ Accurate Timeline / Turning Point: ${cleanAstrologyText(shades.activeDashaTriggerEn)}

• 🪔 Prescribed Remedies & Solution: ${cleanAstrologyText(shades.protectionRemedyEn)}`
      );
    }
  }

  // 5E. BAD COMPANY & DOWNWARD SPIRAL (Kusanga & Durmarga)
  if (isBadCompanyQuery) {
    const shades = currentDiagnosis.negativeShades ?? evaluateNativeNegativeShadesAndCriminality(kundli, { birthDate: "", birthTime: "", latitude: 0, longitude: 0, devoteeAge: age, gender });
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಸತ್ಸಂಗ ಹಾಗೂ ಜೀವನದ ಹಾದಿಯ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  !shades.conductDownwardPath.hasRisk
    ? "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ದುರ್ಮಾರ್ಗ ಅಥವಾ ಕುಸಂಗಕ್ಕೆ ಬಲಿಯಾಗುವ ದೋಷವಿಲ್ಲ. ನೀವು ಸತ್ಸಂಗ ಹಾಗೂ ಉತ್ತಮ ಸಂಸ್ಕಾರದಲ್ಲಿ ಮುನ್ನಡೆಯುವ ದೃಢ ಮನಸ್ಸಿನವರು."
    : "ಹೌದು, ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ! 9ನೇ ಧರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ ಹಾದಿ ತಪ್ಪಿಸುವ ನಕಲಿ ಸ್ನೇಹಿತರು ಅಥವಾ ದುರ್ಮಾರ್ಗದ ಸೆಳೆತಕ್ಕೆ ಒಳಗಾಗುವ ಅಪಾಯವಿದೆ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ${cleanAstrologyText(shades.conductDownwardPath.analysisKn)}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ${cleanAstrologyText(shades.activeDashaTriggerKn)}

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${cleanAstrologyText(shades.protectionRemedyKn)}`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding personal conduct and peer influences.

• 🔮 Direct Daivajna Verdict: ${
  !shades.conductDownwardPath.hasRisk
    ? "NO! You are shielded from downward spirals and toxic peer influence; you walk an upright, dharmic path."
    : "PEER CAUTION REQUIRED. Planetary tension in the 9th house cautions against toxic companions and illicit temptations that derail life goals."
}

• 🎯 Astrological Root Cause & Planetary Alignment: ${cleanAstrologyText(shades.conductDownwardPath.analysisEn)}

• ⏳ Accurate Timeline / Turning Point: ${cleanAstrologyText(shades.activeDashaTriggerEn)}

• 🪔 Prescribed Remedies & Solution: ${cleanAstrologyText(shades.protectionRemedyEn)}`
      );
    }
  }

  // 6. MARITAL HARMONY & DISPUTES
  if (isMaritalConflictQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ ಮತ್ತು ಮನಸ್ತಾಪಗಳ ನಿವಾರಣೆಯ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${
  isMaritalCrisis
    ? "ಹೌದು. ಪ್ರಸ್ತುತ ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರವಾದ ಮಾನಸಿಕ ಕ್ಲೇಶ, ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ, ಪರಸ್ಪರ ಅಸಹನೀಯ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು (Misunderstandings) ಹಾಗೂ ಮಾತುಕತೆ ನಿಲ್ಲುವಂತಹ ಕಠಿಣ ಬಿಕ್ಕಟ್ಟು ಎದುರಾಗಿದೆ."
    : "ಇಲ್ಲ, ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಶ್ವತ ಬಿರುಕಿನ ಅಪಾಯವಿಲ್ಲ. ಸಣ್ಣಪುಟ್ಟ ಸಾಂದರ್ಭಿಕ ಮಾತುಕತೆಯ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳಿದ್ದು ಶೀಘ್ರದಲ್ಲೇ ತಿಳಿಯಾಗಲಿವೆ."
}

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${currentDiagnosis.technicalAspects.seventhHouseDetail}) ಹಾಗೂ 4ನೇ ಸುಖ ಸ್ಥಾನಗಳ ಮೇಲೆ ${seventhLordKn} ಹಾಗೂ ${fourthLordKn} ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದೆ. ${
  isMaritalCrisis
    ? `7ನೇ ಕಳತ್ರಾಧಿಪತಿ ${seventhLordKn} ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದು, ${isKujaDosha ? "ಕುಜ ದೋಷ ಹಾಗೂ" : ""} ಶನಿ-ರಾಹು ದೃಷ್ಟಿಯಿಂದಾಗಿ ಸಣ್ಣ ಮಾತಿಗೂ ಅಹಂಕಾರದ ಘರ್ಷಣೆ ಭುಗಿಲೇಳುತ್ತಿದೆ.`
    : "ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ದೃಷ್ಟಿಯಲ್ಲಿದ್ದು, ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸಿದರೆ ಸಮಸ್ಯೆಗಳು ತಾನಾಗಿಯೇ ಪರಿಹಾರವಾಗಲಿವೆ."
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಇನ್ನು ಮುಂದಿನ ${Math.max(2, Math.min(5, remM))} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(2, Math.min(5, remM))} Month${Math.max(2, Math.min(5, remM)) > 1 ? "s" : ""}) ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರದಿಂದ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಮರಳಿ ಬಂದು ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, 2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಿ ಮತ್ತು ಮನೆಯಲ್ಲಿ ಮಂಗಳವಾರ-ಶುಕ್ರವಾರ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding marital harmony and relationship disputes.

• 🔮 Direct Daivajna Verdict: ${
  isMaritalCrisis
    ? "YES. You are currently experiencing acute marital distress, severe misunderstandings, constant friction, and communication breakdown."
    : "NO. There is no irreparable rupture in marriage; temporary frictions will resolve smoothly."
}

• 🎯 Astrological Root Cause & Planetary Alignment: 7th house of marriage (${currentDiagnosis.technicalAspects.seventhHouseDetail}) and 4th house of domestic peace are afflicted by malefic aspects, triggering ego clashes over trivial matters.

• ⏳ Accurate Timeline / Turning Point: Within ${dashaTimeTextEn}, planetary transits soften, facilitating emotional reconciliation and renewed understanding.

• 🪔 Prescribed Remedies & Solution: Sponsor Uma-Maheshwara Kalyana Sankalpa Pooja at Sri Kshetra Gokarna, and wear a 2-Mukhi Rudraksha to restore domestic tranquility.`
      );
    }
  }

  // 7. MARRIAGE TIMING & ALLIANCE
  if (isMarriageQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ವಿವಾಹ ಯೋಗ ಮತ್ತು ಕಂಕಣ ಭಾಗ್ಯದ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇನ್ನು ಮುಂದಿನ ${Math.max(3, remM)} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${Math.max(3, remM)} Month${Math.max(3, remM) > 1 ? "s" : ""}) ಕಂಕಣ ಭಾಗ್ಯ ಖಚಿತವಾಗಿ ಕೂಡಿಬರಲಿದ್ದು, ಸಂಸ್ಕಾರಯುತ ಕುಟುಂಬದಿಂದ ವಿವಾಹ ನಿಶ್ಚಯವಾಗಲಿದೆ.

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${currentDiagnosis.technicalAspects.seventhHouseDetail}) ಹಾಗೂ ಕಳತ್ರಕಾರಕ ಶುಕ್ರ/ಗುರುಗಳ ಸ್ಥಿತಿ ವಿವಾಹ ಕಾಲವನ್ನು ನಿರ್ಧರಿಸುತ್ತಿದೆ. ${
  isKujaDosha ? "ಕುಜ ದೋಷದ ಪ್ರಭಾವದಿಂದ ಮಾತುಕತೆಗಳಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಅಡೆತಡೆ ಉಂಟಾಗುತ್ತಿದೆ." : "ಗೋಚಾರ ಗುರುವಿನ ಬಲ ಕೂಡಿಬರುತ್ತಿದೆ."
}

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಕಾಲದಲ್ಲಿ, ಇನ್ನು ${dashaTimeText} ಶುಭ ಮುಹೂರ್ತ ಹಾಗೂ ವಿವಾಹ ಮಾತುಕತೆಗಳಲ್ಲಿ ಸಫಲತೆ ದೊರೆಯಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ, ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding marriage timing and matrimonial alliance.

• 🔮 Direct Daivajna Verdict: A favorable marriage alliance will finalize within the upcoming ${Math.max(3, remM)} months.

• 🎯 Astrological Root Cause & Planetary Alignment: 7th house of marriage (${currentDiagnosis.technicalAspects.seventhHouseDetail}) and Kalatrakaraka govern relationship dynamics.

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, favorable matrimonial progress materializes ${dashaTimeTextEn}.

• 🪔 Prescribed Remedies & Solution: Sponsor Kalyana Sankalpa Seva at Sri Kshetra Gokarna Mahabaleshwara.`
      );
    }
  }

  // 8. DEBT RELIEF & FINANCIAL STABILITY
  if (isDebtQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಸಾಲ ಮುಕ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇನ್ನು ಮುಂದಿನ ${remM} ತಿಂಗಳುಗಳಲ್ಲಿ (Next ${remM} Month${remM > 1 ? "s" : ""}) ನೂತನ ಆದಾಯದ ಮಾರ್ಗ ತೆರೆದುಕೊಂಡು ಸಾಲದ ಬಹುಪಾಲು ಹೊರೆ ಇಳಿಯಲಿದೆ.

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 6ನೇ ಋಣ ಸ್ಥಾನದಲ್ಲಿ ${sixthLordKn} ಮತ್ತು 2ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${secondLordKn} ಗ್ರಹ ಪ್ರಭಾವವಿದೆ. ಕೈಗೆ ಬಂದ ಹಣ ನಿಲ್ಲದೆ ಅನಿರೀಕ್ಷಿತ ತುರ್ತು ವೆಚ್ಚಗಳಿಗೆ ಸೋರಿಹೋಗುತ್ತಿರುವುದು ಸಾಲದ ಹೊರೆಯನ್ನು ಹೆಚ್ಚಿಸಿದೆ.

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ, ಇನ್ನು ${dashaTimeText} ಹೊಸ ಆದಾಯದ ಹರಿವು ಆರಂಭವಾಗಿ ಸಾಲ ತೀರಿಸಲು ದಾರಿ ಸುಲಭವಾಗಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಋಣವಿಮೋಚಕ ನರಸಿಂಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ${prescriptions.gemstoneRing.primaryGemstoneKn} ಧರಿಸಿ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding debt relief and financial stabilization.

• 🔮 Direct Daivajna Verdict: New financial relief channels will manifest within ${dashaTimeTextEn} to systematically clear outstanding debts.

• 🎯 Astrological Root Cause & Planetary Alignment: 6th house of debt (${sixthLordKn}) and 2nd house of income (${secondLordKn}) govern fiscal liquidity. Unexpected expenses have strained repayment.

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, financial momentum turns favorable within ${dashaTimeTextEn}.

• 🪔 Prescribed Remedies & Solution: Recite Rinamochana Narasimha Stotra daily and sponsor Mahaganapati Homa at Sri Kshetra Gokarna.`
      );
    }
  }

  // 9. FINANCE, CAREER & TURNING POINT
  if (isFinanceCareerQuery) {
    if (isKn) {
      return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಆರ್ಥಿಕ ಪ್ರಗತಿ, ಉದ್ಯೋಗ ಹಾಗೂ ಧನ ಯೋಗದ ದೃಷ್ಟಿಯಿಂದ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಮುಂದಿನ ${dashaTimeText} ಅವಧಿಯಲ್ಲಿ ವೃತ್ತಿ ಮತ್ತು ಆರ್ಥಿಕತೆಯಲ್ಲಿ ಮಹತ್ವದ ಶುಭ ತಿರುವು ಲಭಿಸಲಿದ್ದು, ಹೊಸ ಆದಾಯದ ಮಾರ್ಗಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ.

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${currentDiagnosis.technicalAspects.tenthHouseDetail}) ಹಾಗೂ 2ನೇ ಧನಕೋಶದ ಮೇಲೆ ಗ್ರಹಗಳ ಸಮ್ಮಿಶ್ರ ಪ್ರಭಾವವಿದೆ. ${currentDiagnosis.primaryLifeChallenge.planetaryRootCause}.

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ದಶಾ ಕಾಲದಲ್ಲಿ, ಇನ್ನು ${dashaTimeText} ನಿಮ್ಮ ಜೀವನದ ದೊಡ್ಡ ಆರ್ಥಿಕ ತಿರುವು ಗೋಚರಿಸಲಿದೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನವನ್ನು ${prescriptions.gemstoneRing.metalKn}ದಲ್ಲಿ ಧಾರಣೆ ಮಾಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗಣಪತಿ ಹವನ ಸಮರ್ಪಿಸಿ.`
      );
    } else {
      return (
`Namaskara ${devoteeNameFormatted}, I have analyzed your birth chart regarding career trajectory and financial momentum.

• 🔮 Direct Daivajna Verdict: A decisive financial and career breakthrough unfolds within ${dashaTimeTextEn}, opening stable revenue channels.

• 🎯 Astrological Root Cause & Planetary Alignment: 10th house of career (${currentDiagnosis.technicalAspects.tenthHouseDetail}) and 2nd house of wealth dictate your professional elevation.

• ⏳ Accurate Timeline / Turning Point: Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, a decisive breakthrough unfolds ${dashaTimeTextEn}.

• 🪔 Prescribed Remedies & Solution: Wear ${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight}) set in ${prescriptions.gemstoneRing.metalEn}. Sponsor Rudrabhisheka and Ganapati Homa at Sri Kshetra Gokarna Mahabaleshwara.`
      );
    }
  }

  // 10. GENERAL / FALLBACK INQUIRY
  if (isKn) {
    return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${devoteeNameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಕೂಲಂಕಷವಾಗಿ ನೋಡಿದೆ.

• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಗ್ರಹಗಳ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯು ಸವಾಲಿನದ್ದಾಗಿದ್ದರೂ ಮುಂದಿನ ${dashaTimeText} ಅವಧಿಯಲ್ಲಿ ಪರಿಸ್ಥಿತಿ ತಿಳಿಯಾಗಿ ಧನಾತ್ಮಕ ಫಲ ದೊರೆಯಲಿದೆ.

• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: ನಿಮ್ಮ ${lagnaKn} ಲಗ್ನ ಹಾಗೂ ${moonRashiKn} ರಾಶಿಯ (${moonNakKn} ನಕ್ಷತ್ರ) ಜಾತಕದಲ್ಲಿ, ಪ್ರಸ್ತುತ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ದಶಾ ಕಾಲ ನಡೆಯುತ್ತಿದೆ. ${currentDiagnosis.primaryLifeChallenge.description}.

• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: ಇನ್ನು ${dashaTimeText} ಗ್ರಹಗಳ ಗೋಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಕಠಿಣ ಪರಿಸ್ಥಿತಿಗಳು ತಿಳಿಯಾಗಲಿವೆ.

• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: ${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight}) ರತ್ನ ಹಾಗೂ ${prescriptions.rudraksha.nameKn} ಧಾರಣೆ ಮಾಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪ್ರಾಯಶ್ಚಿತ್ತ ಹಾಗೂ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಸಕಲ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`
    );
  } else {
    return (
`Namaskara ${devoteeNameFormatted}, I have carefully analyzed your chart in relation to your inquiry.

• 🔮 Direct Daivajna Verdict: Regarding your inquiry, while current planetary alignments present testing challenges, a favorable breakthrough unfolds within ${dashaTimeTextEn}.

• 🎯 Astrological Root Cause & Planetary Alignment: Born in ${lagnaEn} Ascendant and ${moonRashiEn} Moon Sign, you are operating under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}. ${currentDiagnosis.primaryLifeChallenge.description}.

• ⏳ Accurate Timeline / Turning Point: Within ${dashaTimeTextEn}, planetary transits turn favorably, resolving lingering obstacles.

• 🪔 Prescribed Remedies & Solution: Wear ${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight}) and ${prescriptions.rudraksha.nameEn}. Sponsor a dedicated Sankalpa Pooja at holy Sri Kshetra Gokarna Mahabaleshwara.`
    );
  }
};

