import type { SupportedLanguage } from "../../stores/appStore";

export type AyurMode = "janma" | "mrityu";

export type LongevityClass = "balarishta" | "alpayu" | "madhyayu" | "deerghayu" | "divyayu";

export type LokaRealm = "moksha" | "deva" | "pitru" | "bhuvar" | "martya";

export type GandantaType = "none" | "tithi" | "nakshatra" | "lagna" | "sarpa_gandanta";

export interface AyurSanjeeviniInput {
  mode: AyurMode;
  personName: string;
  dob: string; // YYYY-MM-DD
  tob?: string; // HH:mm
  pob: string;
  gotra?: string;
  rashi?: string;
  nakshatra?: string;
  customConcern?: string;
  lang: SupportedLanguage;
}

export interface MarakaBadhakaDetail {
  marakaHouses: string[];
  marakaPlanets: string[];
  badhakaHouse: number;
  badhadhipati: string;
  chhidraDashaAlert: string;
  severityScore: number; // 0 - 100
  mitigationSummary: string;
}

export interface GandantaAnalysis {
  hasGandanta: boolean;
  type: GandantaType;
  description: string;
  remedyRequired: string;
}

export interface LongevityAnalysis {
  category: LongevityClass;
  estimatedAgeSpan: string;
  vitalityScore: number; // 0 - 100
  ayushkarakaStrength: string; // Shani bala
  threePairsMethod: {
    lagnaAndEighth: string;
    moonAndSaturn: string;
    lagnaAndHoraLagna: string;
  };
  keyProtectiveYogas: string[];
}

export interface KarmaVipakaItem {
  ailmentOrChallenge: string;
  karmicCause: string;
  afflictedPlanet: string;
  shastraReference: string;
  recommendedDaana: string;
  prescribedMantra: string;
}

export interface MokshaGatiAnalysis {
  soulRealm: LokaRealm;
  realmName: string;
  twelfthHouseInfluence: string;
  karakamsaKetuBala: string;
  karmicDebtRemaining: string;
  pathwayToMoksha: string;
}

export interface SanjeeviniRakshaShield {
  mrityunjayaMantra: string;
  recommendedJapaCount: number;
  rudrakshaRecommendation: string;
  gemstoneOrMetalShield: string;
  ayushyaSuktaHomaDetails: string;
  dailySankalpaMantra: string;
}

export interface PitruRinaAndAncestral {
  pitruRinaLevel: "low" | "medium" | "high" | "severe";
  tripindiRequired: boolean;
  narayanaBaliRecommended: boolean;
  ancestralBlessingStatus: string;
  remedies: string[];
}

export interface GokarnaKshetraSankalpa {
  priestName: string;
  priestPhone: string;
  templeAddress: string;
  recommendedSevas: {
    title: string;
    description: string;
    idealTithi: string;
    significance: string;
  }[];
}

export interface AyurSanjeeviniResult {
  input: AyurSanjeeviniInput;
  calculatedAt: string;
  mode: AyurMode;
  personName: string;
  dobFormatted: string;
  tobFormatted: string;
  pob: string;
  gotra: string;
  rashi: string;
  nakshatra: string;
  lagnaRashi: string;
  gandanta: GandantaAnalysis;
  longevity: LongevityAnalysis;
  marakaBadhaka: MarakaBadhakaDetail;
  karmaVipaka: KarmaVipakaItem[];
  mokshaGati: MokshaGatiAnalysis;
  sanjeeviniShield: SanjeeviniRakshaShield;
  pitruKarma: PitruRinaAndAncestral;
  gokarnaSankalpa: GokarnaKshetraSankalpa;
  aiDivineNarrative?: string;
}
