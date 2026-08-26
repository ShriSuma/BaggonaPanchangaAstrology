export type HindinaJanmaLang = "kn" | "en" | "hi" | "te" | "ta";

export type BirthMarkLocation =
  | "head_face"
  | "neck_chest"
  | "back_spine"
  | "hands_arms"
  | "legs_feet"
  | "abdomen_waist"
  | "none";

export type InexplicableAffinity =
  | "ancient_temples"
  | "forest_hermitage"
  | "royal_warfare"
  | "ocean_travel"
  | "sacred_music"
  | "occult_mysticism";

export type InexplicablePhobia =
  | "water_drowning"
  | "fire_burns"
  | "heights_fall"
  | "enclosed_darkness"
  | "sharp_weapons"
  | "isolation_abandonment"
  | "none";

export type HindinaJanmaInput = {
  personName: string;
  dob: string; // YYYY-MM-DD
  tob?: string; // HH:mm (Optional)
  gender: "Male" | "Female" | "Other";
  birthPlace?: string;
  birthMarkLocation?: BirthMarkLocation;
  inexplicableAffinity?: InexplicableAffinity;
  inexplicablePhobia?: InexplicablePhobia;
  customQuestion?: string;
  lang: HindinaJanmaLang;
};

export type PastLifePersona = {
  eraAndTimeline: Record<string, string>;
  geographicalRealm: Record<string, string>;
  genderInPastLife: Record<string, string>;
  socialStatusAndVocation: Record<string, string>;
  dominantGraha: string;
  personalitySummary: Record<string, string>;
};

export type SanchitaKarmaAnalysis = {
  sanchitaPunyaPercentage: number;
  sanchitaPaapaPercentage: number;
  dominantKarmicDebt: Record<string, string>;
  pastLifeUnfinishedDesire: Record<string, string>;
  karmicCurseOrBlessing: Record<string, string>;
};

export type InnateBoonsAndTalents = {
  inheritedTalents: Record<string, string[]>;
  intuitiveInstincts: Record<string, string>;
  sacredDeityAffinity: Record<string, string>;
  dejaVuTriggers: Record<string, string[]>;
};

export type PhobiaAndBirthmarkCorrelation = {
  birthmarkSignificance: Record<string, string>;
  phobiaKarmicOrigin: Record<string, string>;
  pastLifeTransitionType: Record<string, string>;
};

export type RahuKetuMokshaAxis = {
  ketuPastLifeMastery: Record<string, string>;
  rahuCurrentLifeMission: Record<string, string>;
  d60SoulEvolutionStage: Record<string, string>;
  soulMaturityLevel: Record<string, string>;
};

export type KarmicRemediesAndGokarnaShanti = {
  sacredAtmaShantiMantra: string;
  recommendedTilaAndDanaItems: Record<string, string[]>;
  sacredGokarnaRemedy: Record<string, string>;
  priestName: string;
  priestPhone: string;
};

export type HindinaJanmaResult = {
  input: HindinaJanmaInput;
  sunSign: string;
  moonNakshatra: string;
  pastLifePersona: PastLifePersona;
  karmaAnalysis: SanchitaKarmaAnalysis;
  innateBoons: InnateBoonsAndTalents;
  phobiaCorrelation: PhobiaAndBirthmarkCorrelation;
  mokshaAxis: RahuKetuMokshaAxis;
  remedies: KarmicRemediesAndGokarnaShanti;
  aiNarrative?: string;
  generatedAt: string;
};
