export type KaalaDiksuchiLang = "kn" | "hi" | "te" | "ta" | "en";

export type SamudrikaForehead = "broad" | "angular" | "curved" | "compact";
export type SamudrikaEyes = "sharp" | "gentle" | "analytical" | "calm";
export type SamudrikaElement = "earth" | "air" | "fire" | "water";
export type LifeDomainFocus = "career" | "finance" | "relationships" | "health" | "modern_adaptation" | "spiritual";

export interface KaalaDiksuchiInput {
  personName: string;
  dob: string; // YYYY-MM-DD (Birth Time NOT required)
  gender?: "Male" | "Female" | "Other";
  pincode?: string;
  placeLabel?: string;
  foreheadShape?: SamudrikaForehead;
  eyeRadiance?: SamudrikaEyes;
  handElement?: SamudrikaElement;
  primaryFocus?: LifeDomainFocus;
  customQuestion?: string;
  lang: KaalaDiksuchiLang;
}

export interface PlanetaryPositionSummary {
  name: string;
  rashi: string;
  degree: number;
  houseFromSun: number;
  dignity: "Exalted" | "Own Sign" | "Friendly" | "Neutral" | "Debilitated";
  significance: string;
}

export interface ModernWorldAlignment {
  currentGlobalTrend: string;
  userResonanceScore: number; // 0 - 100%
  userStandingInModernEra: string;
  keyVulnerabilities: string[];
  growthOpportunities: string[];
  careerAndTechStrategy: string;
  digitalAndMentalWellness: string;
  relationshipAndSocialGuidance: string;
  actionableHabitsForToday: string[];
}

export interface SamudrikaProfile {
  dominantPlanet: string;
  elementalComposition: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  personalityArchetype: string;
  instinctualReflex: string;
  hiddenSuperpower: string;
}

export interface PrashnaOracleResult {
  prashnaLagna: string;
  prashnaNakshatra: string;
  cosmicMomentQuality: "Shubha" | "Madhya" | "Kala-Atirikta";
  directAnswer: string;
  timelineEstimate: string;
}

export interface RemedialPrescription {
  dailyStotra: string;
  luckyColors: string[];
  luckyDays: string[];
  luckyNumbers: number[];
  gemstoneRecommendation: string;
  sacredGokarnaRemedy: string;
  priestCounselingTip: string;
}

export interface LiveDailyTransitEnergy {
  pranaScore: number; // 0-100%
  peakHourWindow: string;
  favorableActivities: string[];
  cautionActivities: string[];
  currentTransitSummary: string;
  chandraGocharaImpact: string;
}

export interface KarmicSoulMission {
  rahuKetuAxis: string;
  soulPurpose: string;
  pastLifeGifts: string;
  karmicLesson: string;
  ancestralClearingRemedy: string;
}

export interface DecadeMilestone {
  ageRange: string;
  years: string;
  rulingPhase: string;
  theme: string;
  vitalityScore: number;
  keyGuidance: string;
}

export interface SankhyaDeepAnalysis {
  mulank: number;
  mulankLord: string;
  bhagyank: number;
  bhagyankLord: string;
  namank: number;
  soulUrge: number;
  harmoniousNumbers: number[];
  wealthAttractionSecret: string;
  careerArchetype: string;
}

export interface KaalaDiksuchiResult {
  input: KaalaDiksuchiInput;
  calculatedAt: string;
  birthDayOfWeek: string;
  suryaRashi: string;
  chandraRashiEstimate: string;
  nakshatraRange: string;
  rulingNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  planets: PlanetaryPositionSummary[];
  modernWorld: ModernWorldAlignment;
  samudrika: SamudrikaProfile;
  sankhya: SankhyaDeepAnalysis;
  liveTransit: LiveDailyTransitEnergy;
  karmicMission: KarmicSoulMission;
  decadeMilestones: DecadeMilestone[];
  prashnaOracle: PrashnaOracleResult;
  remedies: RemedialPrescription;
  aiNarrative?: string;
}
