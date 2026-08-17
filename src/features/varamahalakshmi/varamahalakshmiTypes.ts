import type { SupportedLanguage } from "../../stores/appStore";

export type L5 = {
  kn: string;
  te: string;
  ta: string;
  hi: string;
  en: string;
};

export interface SthiraLagnaMuhurtha {
  lagnaName: string;
  lagnaNameL5: L5;
  rashiIndex: number;
  startTime: string;
  endTime: string;
  isSthira: boolean;
  isAbhijit?: boolean;
  isPradosha?: boolean;
  bestFor: L5;
  auspiciousScore: number; // 1 to 10
}

export type AshtaLakshmiForm =
  | "AdiLakshmi"
  | "DhanyaLakshmi"
  | "DhairyaLakshmi"
  | "GajaLakshmi"
  | "SantanaLakshmi"
  | "VijayaLakshmi"
  | "VidyaLakshmi"
  | "DhanaLakshmi";

export interface AshtaLakshmiProfile {
  id: AshtaLakshmiForm;
  nameL5: L5;
  icon: string;
  descriptionL5: L5;
  blessingL5: L5;
  specialNaivedyaL5: L5;
  recommendedSareeColorL5: L5;
  recommendedFlowerL5: L5;
  stotraL5: L5;
  nakshatraIndices: number[]; // Nakshatras linked to this form
}

export interface DoraGranthiKnot {
  knotNumber: number;
  goddessName: string;
  goddessNameL5: L5;
  mantra: string;
  significanceL5: L5;
}

export interface PersonalizedVaramahalakshmiAnalysis {
  personName: string;
  gotra: string;
  nakshatraIndex: number;
  nakshatraName: string;
  rashiIndex: number;
  rashiName: string;
  ashtaLakshmi: AshtaLakshmiProfile;
  venusStrengthScore: number;
  venusPlacementSummaryL5: L5;
  dhanaHouseSummaryL5: L5;
  soubhagyaGuidanceL5: L5;
  sankalpaTextL5: L5;
  luckyColor: string;
  luckyColorL5: L5;
  luckyFlower: string;
  luckyFlowerL5: L5;
  luckyNaivedya: string;
  luckyNaivedyaL5: L5;
}

export interface VaramahalakshmiSevaPackage {
  id: string;
  titleL5: L5;
  subtitleL5: L5;
  priceInr: number;
  itemsL5: L5[];
  icon: string;
  popular?: boolean;
}

export interface BaginaCardData {
  senderName: string;
  senderGotra: string;
  recipientName: string;
  relationshipL5: L5;
  customMessage?: string;
  language: SupportedLanguage;
}
