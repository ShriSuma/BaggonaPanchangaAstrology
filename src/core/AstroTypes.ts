/** Sidereal zero-point model: Lahiri linear Chitrapaksha vs. Drik (True Spica at 180°). */
export type AyanamsaModel = "lahiri" | "drik_ganita" | "vakya";

/** Rāhu/Ketu: mean node (most handwritten patrikās) vs. true (oscillating) node. */
export type NodeType = "mean" | "true";

export enum PlanetName {
  Sun = "Sun",
  Moon = "Moon",
  Mars = "Mars",
  Mercury = "Mercury",
  Jupiter = "Jupiter",
  Venus = "Venus",
  Saturn = "Saturn",
  Rahu = "Rahu",
  Ketu = "Ketu"
}

export type Rashi = {
  index: number;
  sanskrit: string;
  english: string;
};

export type Nakshatra = {
  index: number;
  sanskrit: string;
  english: string;
  deity: string;
};

export type KundliInput = {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  name: string;
  gender?: "Male" | "Female" | "Other";
  maritalStatus?: "married" | "unmarried" | "divorced" | "separated" | string;
  gothra?: string;
  primaryConcern?: string;
  pincode?: string;
  timezoneIana?: string;
  timezoneOffsetMinutes?: number;
};

export type PlanetPosition = {
  name: PlanetName;
  degree: number;
  rashi: Rashi;
  nakshatra: Nakshatra;
  house: number;
  isRetrograde?: boolean;
  isDebilitated?: boolean;
  isExalted?: boolean;
};

export type KundliOutput = {
  ascendant: number;
  planets: PlanetPosition[];
  houses: number[];
  moonSign: Rashi;
  sunSign: Rashi;
  lagnaRashi: Rashi;
  moonPada: 1 | 2 | 3 | 4;
  /** Optional: common starting-sound suggestions (many traditions; not prescriptive). */
  nameSyllableHint?: string;
  maandi?: {
    degree: number;
    rashi: Rashi;
    windowLabel: string;
  };
  /** Sunrise/sunset at birth place on birth civil day (used for Maandi, patrikā, panchānga). */
  birthSunTimes?: {
    sunrise: string;
    sunset: string;
    source: "api" | "suncalc";
    /** ISO UTC for ghaṭī/vighaṭī and weekday rules. */
    sunriseUtc?: string;
    sunsetUtc?: string;
  };
};

import type { DetailedTithiInfo } from "./VedicCalculations";

export type PanchangOutput = {
  tithi: string;
  tithiKn?: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: "Shukla" | "Krishna";
  sunrise: string;
  sunset: string;
  moonrise: string;
  tithiEndTime?: string;
  tithiStartTime?: string;
  tithiNext?: string;
  tithiNextKn?: string;
  tithiNextStartTime?: string;
  tithiNextEndTime?: string;
  majorityTithi?: string;
  majorityTithiKn?: string;
  detailedTithi?: DetailedTithiInfo;
};

export type RahuKaalOutput = {
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type PredictionOutput = {
  title: string;
  summary: string;
  career: string;
  finance: string;
  health: string;
  relationships: string;
  lucky: {
    color: string;
    number: number;
    direction: string;
  };
  rating: number;
  /** Optional Vimshottari context (localized). */
  dashaLine?: string;
  /** Optional transit / timing note (localized). */
  timingLine?: string;
  /** Longer synthesized reading (transits + dasha + tone), localized. */
  integratedReading?: string;
};

export type KundaliPrediction = {
  lagnaAnalysis: {
    benefics: string[];
    malefics: string[];
    description: string;
  };
  yogasAndDoshas: {
    yogas: string[];
    doshas: string[];
  };
  careerSaturn: string;
  saturnConjunctions: string[];
  saturnAspects: string[];
  vipareetaShani: string | null;
  healthVichara: string[];
  gocharaAlerts: string[];
};

export const RASHIS: Rashi[] = [
  { index: 0, sanskrit: "Mesha", english: "Aries" },
  { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
  { index: 2, sanskrit: "Mithuna", english: "Gemini" },
  { index: 3, sanskrit: "Karka", english: "Cancer" },
  { index: 4, sanskrit: "Simha", english: "Leo" },
  { index: 5, sanskrit: "Kanya", english: "Virgo" },
  { index: 6, sanskrit: "Tula", english: "Libra" },
  { index: 7, sanskrit: "Vrischika", english: "Scorpio" },
  { index: 8, sanskrit: "Dhanu", english: "Sagittarius" },
  { index: 9, sanskrit: "Makara", english: "Capricorn" },
  { index: 10, sanskrit: "Kumbha", english: "Aquarius" },
  { index: 11, sanskrit: "Meena", english: "Pisces" }
];

export const NAKSHATRAS: Nakshatra[] = [
  { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini Kumaras" },
  { index: 1, sanskrit: "Bharani", english: "Bharani", deity: "Yama" },
  { index: 2, sanskrit: "Krittika", english: "Krittika", deity: "Agni" },
  { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
  { index: 4, sanskrit: "Mrigashira", english: "Mrigashira", deity: "Soma" },
  { index: 5, sanskrit: "Aardra", english: "Aardra", deity: "Rudra" },
  { index: 6, sanskrit: "Punarvasu", english: "Punarvasu", deity: "Aditi" },
  { index: 7, sanskrit: "Tishya", english: "Tishya", deity: "Brihaspati" },
  { index: 8, sanskrit: "Aashlesha", english: "Aashlesha", deity: "Nagas" },
  { index: 9, sanskrit: "Maghe", english: "Maghe", deity: "Pitrs" },
  { index: 10, sanskrit: "Hubbe", english: "Hubbe", deity: "Bhaga" },
  { index: 11, sanskrit: "Uttara", english: "Uttara", deity: "Aryaman" },
  { index: 12, sanskrit: "Hasta", english: "Hasta", deity: "Savitar" },
  { index: 13, sanskrit: "Chitra", english: "Chitra", deity: "Tvashtar" },
  { index: 14, sanskrit: "Swati", english: "Swati", deity: "Vayu" },
  { index: 15, sanskrit: "Vishakha", english: "Vishakha", deity: "Indra-Agni" },
  { index: 16, sanskrit: "Anuradha", english: "Anuradha", deity: "Mitra" },
  { index: 17, sanskrit: "Jyeshta", english: "Jyeshta", deity: "Indra" },
  { index: 18, sanskrit: "Moola", english: "Moola", deity: "Nirriti" },
  { index: 19, sanskrit: "Poorvashada", english: "Poorvashada", deity: "Apas" },
  { index: 20, sanskrit: "Uttrashada", english: "Uttrashada", deity: "Vishvadevas" },
  { index: 21, sanskrit: "Shravana", english: "Shravana", deity: "Vishnu" },
  { index: 22, sanskrit: "Dhanishta", english: "Dhanishta", deity: "Vasus" },
  { index: 23, sanskrit: "Shatavisha", english: "Shatavisha", deity: "Varuna" },
  { index: 24, sanskrit: "Poorvabhadra", english: "Poorvabhadra", deity: "Aja Ekapada" },
  { index: 25, sanskrit: "Uttrabhadra", english: "Uttrabhadra", deity: "Ahirbudhnya" },
  { index: 26, sanskrit: "Revati", english: "Revati", deity: "Pushan" }
];

