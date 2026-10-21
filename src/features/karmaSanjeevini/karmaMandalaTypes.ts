import type { SupportedLanguage } from "../../stores/appStore";
import type { PlanetName } from "../../core/AstroTypes";

export type CosmicPillarId =
  | "sade_sati"
  | "rahu_ketu"
  | "kuja_manglik"
  | "guru_chandal_dhana"
  | "ayur_bala";

export type DoshaSeverity = "calm" | "moderate" | "high" | "critical";

export interface BijaMantraDetail {
  sanskrit: string;
  kannada: string;
  transliteration: Record<SupportedLanguage, string>;
  count: number;
  deity: Record<SupportedLanguage, string>;
  meaning: Record<SupportedLanguage, string>;
}

export interface GokarnaSevaRecommendation {
  id: string;
  name: Record<SupportedLanguage, string>;
  templeName: Record<SupportedLanguage, string>;
  deity: Record<SupportedLanguage, string>;
  significance: Record<SupportedLanguage, string>;
  costInRupees: number;
  costInCoins: number;
  benefits: Record<SupportedLanguage, string[]>;
  priestName: string;
  priestPhone: string;
  prasadaDetails: Record<SupportedLanguage, string>;
}

export interface MuhurthaWindow {
  id: string;
  title: Record<SupportedLanguage, string>;
  tithiVara: Record<SupportedLanguage, string>;
  startDateTime: string;
  endDateTime: string;
  urgencyHoursRemaining: number;
  remedialPowerMultiplier: Record<SupportedLanguage, string>;
  guideline: Record<SupportedLanguage, string>;
}

export interface FrictionNode {
  id: CosmicPillarId;
  title: Record<SupportedLanguage, string>;
  subtitle: Record<SupportedLanguage, string>;
  frictionScore: number; // 0 to 100 (high = heavy affliction)
  reliefScore: number;   // 0 to 100 (high = post-remedy harmony)
  severity: DoshaSeverity;
  primaryAffliction: Record<SupportedLanguage, string>;
  planetaryDrivers: string[];
  classicalAuthority: Record<SupportedLanguage, string>;
  immediateAction: Record<SupportedLanguage, string>;
  gokarnaSeva: GokarnaSevaRecommendation;
  bijaMantra: BijaMantraDetail;
  transitContext: Record<SupportedLanguage, string>;
}

export interface KarmaMandalaSynthesis {
  devoteeName: string;
  birthSummary: string;
  lagnaName: Record<SupportedLanguage, string>;
  chandraRashiName: Record<SupportedLanguage, string>;
  nakshatraName: Record<SupportedLanguage, string>;
  overallFrictionScore: number; // 0 - 100
  overallHarmonyScore: number;  // 0 - 100
  highestCrisisNode: FrictionNode;
  nodes: FrictionNode[];
  upcomingMuhurthas: MuhurthaWindow[];
  activeJapaMantra: BijaMantraDetail;
  isUnlocked: boolean;
  transitSnapshot: {
    saturnRashiIndex: number;
    jupiterRashiIndex: number;
    rahuRashiIndex: number;
    marsRashiIndex: number;
    calculatedAt: string;
  };
}

export interface JapaSadhanaState {
  currentStreakDays: number;
  todayCount: number;
  targetCount: number;
  completedCycles: number;
  lastCompletedDate: string | null;
  audioEnabled: boolean;
}
