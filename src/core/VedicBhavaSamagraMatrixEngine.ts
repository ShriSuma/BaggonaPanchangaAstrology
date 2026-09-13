/**
 * VedicBhavaSamagraMatrixEngine.ts
 * 
 * Comprehensive 6-Fold Multi-Perspective House Evaluation Engine (ಭಾವ ಸಮಗ್ರ ಷಡ್ವಿಧ ಪಂಚಾಂಗ ಮೌಲ್ಯಮಾಪನ ಎಂಜಿನ್)
 * 
 * Implements classical Parashari Jyotisha Bhavat Bhavam & 6-fold multi-perspective evaluation:
 * 1. Janma Lagna Perspective (ಲಗ್ನ ದೃಷ್ಟಿಕೋನ): House H sign, lord, house placement, dignity, occupancy, and Drishtis.
 * 2. Bhavat Bhavam / Derived Ascendant (ಭಾವತ್ ಭಾವಂ ಹಾಗೂ ಪರಿವರ್ತಿತ ಲಗ್ನ): Treating House H as Lagna and evaluating 12 derived houses & classical H-from-H counterparts.
 * 3. Gochara Transits (ಗೋಚಾರ ದೃಷ್ಟಿ ಹಾಗೂ ಪ್ರಭಾವ): Real-time transit positions & aspects of Jupiter, Saturn, Rahu, Ketu, Mars on House H and its lord.
 * 4. Dasha - Bhukti Relationship (ದಶಾ-ಭುಕ್ತಿ ಸಕ್ರಿಯತೆ): Current Mahadasha & Antardasha lords' placement, aspects, and position relative to House H as Lagna.
 * 5. Amshaka / Navamsha D9 (ಅಂಶಕ ದೃಷ್ಟಿಕೋನ & ನವಾಂಶ ಬಲ): House lord's D9 sign, Vargottama, D9 dignity, Navamshapati dispositor, and D9 occupancy.
 * 6. Nakshatra & Dispositor Strength (ನಕ್ಷತ್ರ ಹಾಗೂ ನಕ್ಷತ್ರಾಧಿಪತಿ ಬಲ): House lord's Nakshatra ruler, Tara Bala, and classical Neecha Rashi + Uchha Nakshatra/Dispositor reversal.
 */

import { PlanetName, type KundliOutput, type PlanetPosition } from "./AstroTypes";
import { normalizeDegree, degreeToNakshatra } from "./AstroMath";
import { navamsaSignIndex } from "./Navamsa";
import { signLord, naturalRelation, rashiIndexInHouse } from "./KundliInsightsEngine";
import { EXALTATION_SIGNS, DEBILITATION_SIGNS } from "./BaggonaPredictionEngine";
import { nakshatraLordForIndex } from "./kpSubLordEngine";
import { calculateTaraBala } from "./TaraBalaEngine";
import { siderealLongitudes } from "./EphemerisEngine";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";

// ─── Pure Kannada Translation Tables (Zero English Leakage) ───────────────────

export const KN_PLANET_NAMES: Record<PlanetName, string> = {
  [PlanetName.Sun]: "ರವಿ",
  [PlanetName.Moon]: "ಚಂದ್ರ",
  [PlanetName.Mars]: "ಮಂಗಳ",
  [PlanetName.Mercury]: "ಬುಧ",
  [PlanetName.Jupiter]: "ಗುರು",
  [PlanetName.Venus]: "ಶುಕ್ರ",
  [PlanetName.Saturn]: "ಶನಿ",
  [PlanetName.Rahu]: "ರಾಹು",
  [PlanetName.Ketu]: "ಕೇತು"
};

export const EN_PLANET_NAMES: Record<PlanetName, string> = {
  [PlanetName.Sun]: "Sun",
  [PlanetName.Moon]: "Moon",
  [PlanetName.Mars]: "Mars",
  [PlanetName.Mercury]: "Mercury",
  [PlanetName.Jupiter]: "Jupiter",
  [PlanetName.Venus]: "Venus",
  [PlanetName.Saturn]: "Saturn",
  [PlanetName.Rahu]: "Rahu",
  [PlanetName.Ketu]: "Ketu"
};

export const KN_RASHI_NAMES = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ",
  "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

export const EN_RASHI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const toKnNum = (num: number | string): string =>
  String(num).replace(/\d/g, (d) => "೦೧೨೩೪೫೬೭೮೯"[+d] || d);

// ─── House Significations & Names ───────────────────────────────────────────

export interface BhavaSignification {
  house: number;
  nameKn: string;
  nameEn: string;
  significationKn: string;
  significationEn: string;
  bhavatBhavamCounterpart: number; // e.g. 10th from 10th is 7
  bhavatBhavamPrincipleKn: string;
  bhavatBhavamPrincipleEn: string;
}

export const BHAVA_METADATA: Record<number, BhavaSignification> = {
  1: {
    house: 1,
    nameKn: "ತನು ಭಾವ (ಲಗ್ನ)",
    nameEn: "Tanu Bhava (1st House - Self)",
    significationKn: "ಶಾರೀರಿಕ ಆರೋಗ್ಯ, ತೇಜಸ್ಸು, ಆತ್ಮವಿಶ್ವಾಸ, ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಜೀವ ಶಕ್ತಿ",
    significationEn: "Physical vitality, appearance, self-confidence, identity, and life force",
    bhavatBhavamCounterpart: 1,
    bhavatBhavamPrincipleKn: "೧ನೇ ಮನೆಯೇ ಸ್ವತಂತ್ರ ಕೇಂದ್ರ ಹಾಗೂ ಜಾತಕದ ಸಮಸ್ತ ಯೋಗಗಳ ಪ್ರಾಣಬಿಂದು.",
    bhavatBhavamPrincipleEn: "1st house is the foundational anchor of vitality and all chart yogas."
  },
  2: {
    house: 2,
    nameKn: "ಧನ ಭಾವ",
    nameEn: "Dhana Bhava (2nd House - Wealth & Speech)",
    significationKn: "ಸಂಚಿತ ಸಂಪತ್ತು, ಕೌಟುಂಬಿಕ ಸುಖ, ವಾಕ್ ಶುದ್ಧಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಆಹಾರ ಸಂಸ್ಕೃತಿ",
    significationEn: "Accumulated wealth, family harmony, speech, fiscal stability, and sustenance",
    bhavatBhavamCounterpart: 3,
    bhavatBhavamPrincipleKn: "೨ನೇ ಮನೆಯಿಂದ ೨ನೇ ಮನೆಯಾದ ೩ನೇ ಮನೆಯು ಸಂಪತ್ತಿನ ರಕ್ಷಣೆ ಮತ್ತು ಸಾಹಸ ಬಲವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "3rd house is 2nd from 2nd, representing the courage that protects and generates wealth."
  },
  3: {
    house: 3,
    nameKn: "ಸಹಜ / ಭ್ರಾತೃ ಭಾವ",
    nameEn: "Sahaja Bhava (3rd House - Courage & Siblings)",
    significationKn: "ಧೈರ್ಯ, ಪರಾಕ್ರಮ, ಕಿರಿಯ ಒಡಹುಟ್ಟಿದವರು, ಸಂವಹನ ಕಲೆ ಮತ್ತು ಸ್ವಪ್ರಯತ್ನ",
    significationEn: "Courage, initiative, younger siblings, communications, and self-made efforts",
    bhavatBhavamCounterpart: 5,
    bhavatBhavamPrincipleKn: "೩ನೇ ಮನೆಯಿಂದ ೩ನೇ ಮನೆಯಾದ ೫ನೇ ಮನೆಯು ಸಾಹಸವನ್ನು ಜಾಣ್ಮೆಯುಳ್ಳ ಬುದ್ಧಿಮತ್ತೆಯಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "5th house is 3rd from 3rd, channeling raw courage into strategic intellect."
  },
  4: {
    house: 4,
    nameKn: "ಸುಖ / ಮಾತೃ ಭಾವ",
    nameEn: "Sukha Bhava (4th House - Happiness & Home)",
    significationKn: "ಆಂತರಿಕ ನೆಮ್ಮದಿ, ತಾಯಿಯ ಮಮತೆ, ಗೃಹ ಆಸ್ತಿ, ವಾಹನ ಸೌಖ್ಯ ಮತ್ತು ಮನಶಾಂತಿ",
    significationEn: "Inner emotional peace, maternal affection, real estate, vehicles, and heart contentment",
    bhavatBhavamCounterpart: 7,
    bhavatBhavamPrincipleKn: "೪ನೇ ಮನೆಯಿಂದ ೪ನೇ ಮನೆಯಾದ ೭ನೇ ಮನೆಯು ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಯನ್ನು ಸಾರ್ವಜನಿಕ ಸಂಬಂಧಗಳಲ್ಲಿ ಪ್ರತಿಫಲಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "7th house is 4th from 4th, projecting domestic happiness into social harmony."
  },
  5: {
    house: 5,
    nameKn: "ಪುತ್ರ / ಪೂರ್ವಪುಣ್ಯ ಭಾವ",
    nameEn: "Putra / Punya Bhava (5th House - Intelligence & Progeny)",
    significationKn: "ಬುದ್ಧಿಶಕ್ತಿ, ಸಂತಾನ ಭಾಗ್ಯ, ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ ಸಂಚಯ, ಮಂತ್ರ ಸಿದ್ಧಿ ಮತ್ತು ಸೃಜನಶೀಲತೆ",
    significationEn: "Intellect, progeny, past-life merits, creative genius, and mantra fruition",
    bhavatBhavamCounterpart: 9,
    bhavatBhavamPrincipleKn: "೫ನೇ ಮನೆಯಿಂದ ೫ನೇ ಮನೆಯಾದ ೯ನೇ ಮನೆಯು ಪೂರ್ವ ಪುಣ್ಯವನ್ನು ಧರ್ಮ ಮತ್ತು ದೈವ ಕೃಪೆಯಾಗಿ ವಿಸ್ತರಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "9th house is 5th from 5th, expanding creative intelligence into divine fortune."
  },
  6: {
    house: 6,
    nameKn: "ಶತ್ರು / ರೋಗ ಭಾವ",
    nameEn: "Shatru / Roga Bhava (6th House - Obstacles & Service)",
    significationKn: "ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ, ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ, ಋಣ ಮುಕ್ತಿ, ಸೇವಾ ವೃತ್ತಿ ಮತ್ತು ಶತ್ರು ದಮನ",
    significationEn: "Competitive victory, immunity, debt clearance, service, and overcoming adversaries",
    bhavatBhavamCounterpart: 11,
    bhavatBhavamPrincipleKn: "೬ನೇ ಮನೆಯಿಂದ ೬ನೇ ಮನೆಯಾದ ೧೧ನೇ ಮನೆಯು ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಶತ್ರು ಜಯವನ್ನು ಶಾಶ್ವತ ಲಾಭವಾಗಿ ಬದಲಾಯಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "11th house is 6th from 6th, turning daily toil into permanent material rewards."
  },
  7: {
    house: 7,
    nameKn: "ಕಳತ್ರ ಭಾವ",
    nameEn: "Kalatra Bhava (7th House - Partnerships & Marriage)",
    significationKn: "ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಬಾಳಸಂಗಾತಿ, ಸಾರ್ವಜನಿಕ ಒಪ್ಪಂದಗಳು, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ಮತ್ತು ವಿದೇಶ ವ್ಯವಹಾರ",
    significationEn: "Marital harmony, spouse, public contracts, business alliances, and diplomacy",
    bhavatBhavamCounterpart: 1,
    bhavatBhavamPrincipleKn: "೭ನೇ ಮನೆಯಿಂದ ೭ನೇ ಮನೆಯಾದ ಲಗ್ನವು ಸಂಗಾತಿಯು ಜಾತಕನ ವ್ಯಕ್ತಿತ್ವದ ನೇರ ಕನ್ನಡಿ ಎಂಬುದನ್ನು ಸಾರುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "1st house is 7th from 7th, teaching that the partner directly mirrors the self."
  },
  8: {
    house: 8,
    nameKn: "ಆಯುರ್ / ರಂಧ್ರ ಭಾವ",
    nameEn: "Ayur / Randhra Bhava (8th House - Longevity & Transformation)",
    significationKn: "ಆಯಸ್ಸು, ನಿಗೂಢ ಜ್ಞಾನ, ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ಆಂತರಿಕ ಪರಿವರ್ತನೆ ಮತ್ತು ಸಂಕಷ್ಟ ಸಹಿಷ್ಣುತೆ",
    significationEn: "Longevity, occult knowledge, unearned assets, sudden transformations, and resilience",
    bhavatBhavamCounterpart: 3,
    bhavatBhavamPrincipleKn: "೮ನೇ ಮನೆಯಿಂದ ೮ನೇ ಮನೆಯಾದ ೩ನೇ ಮನೆಯು ಜೀವಾಳದ ಚೈತನ್ಯ ಮತ್ತು ಸಂಕಟಗಳನ್ನು ಎದುರಿಸುವ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "3rd house is 8th from 8th (Ayushya of Ayushya), commanding primal longevity."
  },
  9: {
    house: 9,
    nameKn: "ಭಾಗ್ಯ / ಧರ್ಮ ಭಾವ",
    nameEn: "Bhagya / Dharma Bhava (9th House - Fortune & Grace)",
    significationKn: "ಭಾಗ್ಯೋದಯ, ತಂದೆಯ ಅನುಗ್ರಹ, ತೀರ್ಥಯಾತ್ರೆ, ದೇವತಾ ಕೃಪೆ, ಉನ್ನತ ವಿದ್ಯೆ ಮತ್ತು ಸತ್ಕರ್ಮ",
    significationEn: "Fortune, father's blessing, pilgrimages, divine grace, higher wisdom, and dharma",
    bhavatBhavamCounterpart: 5,
    bhavatBhavamPrincipleKn: "೯ನೇ ಮನೆಯಿಂದ ೯ನೇ ಮನೆಯಾದ ೫ನೇ ಮನೆಯು ಧರ್ಮ ಮತ್ತು ಜ್ಞಾನದ ನಿರಂತರ ಹರಿವನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "5th house is 9th from 9th, maintaining the continuous stream of divine fortune."
  },
  10: {
    house: 10,
    nameKn: "ಕರ್ಮ ಭಾವ",
    nameEn: "Karma Bhava (10th House - Career & Public Standing)",
    significationKn: "ಉದ್ಯೋಗ, ವೃತ್ತಿ ಸಾಧನೆ, ಅಧಿಕಾರ, ಸಾರ್ವಜನಿಕ ಯಶಸ್ಸು, ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ನಾಯಕತ್ವ",
    significationEn: "Career, profession, executive authority, public honors, fame, and leadership",
    bhavatBhavamCounterpart: 7,
    bhavatBhavamPrincipleKn: "೧೦ನೇ ಮನೆಯಿಂದ ೧೦ನೇ ಮನೆಯಾದ ೭ನೇ ಮನೆಯು ವೃತ್ತಿಪರ ನಾಯಕತ್ವಕ್ಕೆ ಅಗತ್ಯವಾದ ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ ಒದಗಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "7th house is 10th from 10th, providing the commercial alliances crucial for career zenith."
  },
  11: {
    house: 11,
    nameKn: "ಲಾಭ ಭಾವ",
    nameEn: "Labha Bhava (11th House - Gains & Aspirations)",
    significationKn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ಆರ್ಥಿಕ ಲಾಭ, ಹಿರಿಯ ಒಡಹುಟ್ಟಿದವರು, ಸಾಮಾಜಿಕ ನೆಟ್‌ವರ್ಕ್ ಮತ್ತು ಗೌರವ",
    significationEn: "Fulfillment of desires, recurring revenues, elder siblings, influential circles, and rewards",
    bhavatBhavamCounterpart: 9,
    bhavatBhavamPrincipleKn: "೧೧ನೇ ಮನೆಯಿಂದ ೧೧ನೇ ಮನೆಯಾದ ೯ನೇ ಮನೆಯು ಭಾಗ್ಯದ ಶಕ್ತಿಯು ಅಪಾರ ಲಾಭವಾಗಿ ಪರಿಣಮಿಸುವುದನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "9th house is 11th from 11th, demonstrating that divine destiny expands into material wealth."
  },
  12: {
    house: 12,
    nameKn: "ವ್ಯಯ / ಮೋಕ್ಷ ಭಾವ",
    nameEn: "Vyaya / Moksha Bhava (12th House - Liberation & Foreign Travels)",
    significationKn: "ಮೋಕ್ಷ, ತ್ಯಾಗ, ವಿದೇಶ ವಾಸ, ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ, ಧ್ಯಾನ ಮತ್ತು ಕರ್ಮ ವಿಮೋಚನೆ",
    significationEn: "Moksha, expenditures, foreign settlement, spiritual transcendence, meditation, and detachment",
    bhavatBhavamCounterpart: 11,
    bhavatBhavamPrincipleKn: "೧೨ನೇ ಮನೆಯಿಂದ ೧೨ನೇ ಮನೆಯಾದ ೧೧ನೇ ಮನೆಯು ವ್ಯಯದ ವ್ಯಯವಾಗಿ ಅಂತಿಮ ಲಾಭ ಮತ್ತು ತ್ಯಾಗದ ಶಾಂತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    bhavatBhavamPrincipleEn: "11th house is 12th from 12th (loss of loss), converting spiritual renunciation into soul fulfillment."
  }
};

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface BhavaEvaluationInput {
  kundli: KundliOutput;
  targetHouse: number; // 1 to 12
  evaluationDate?: Date; // Defaults to current date for Gochara & Dasha
  transitPositions?: Partial<Record<PlanetName, { degree: number; rashiIndex: number }>>;
  currentAgeYears?: number;
}

export type DignityType = "exalted" | "debilitated" | "moolatrikona" | "own" | "friend" | "neutral" | "enemy";

export interface BhavaEvaluationResult {
  houseNumber: number; // 1 to 12
  signIndex: number;
  signNameKn: string;
  signNameEn: string;
  houseLord: PlanetName;
  houseLordKn: string;
  houseLordEn: string;
  houseLordDignity: DignityType;
  houseLordDignityKn: string;
  houseLordDignityEn: string;
  occupants: Array<{ name: PlanetName; nameKn: string; nameEn: string; isBenefic: boolean }>;
  aspects: Array<{ name: PlanetName; nameKn: string; nameEn: string; aspectType: string }>;

  // Six-Pillar Individual Scores (0 to 100)
  lagnaPerspectiveScore: number;
  bhavatBhavamScore: number;
  gocharaTransitScore: number;
  dashaBhuktiScore: number;
  navamshaScore: number;
  nakshatraScore: number;

  // Composite Weighted Score (0 to 100)
  netCompositeScore: number;
  strengthGradeKn: string;
  strengthGradeEn: string;

  // Deep Detailed Breakdown
  lagnaPerspectiveSummaryKn: string;
  lagnaPerspectiveSummaryEn: string;
  bhavatBhavamSummaryKn: string;
  bhavatBhavamSummaryEn: string;
  gocharaSummaryKn: string;
  gocharaSummaryEn: string;
  dashaSummaryKn: string;
  dashaSummaryEn: string;
  navamshaSummaryKn: string;
  navamshaSummaryEn: string;
  nakshatraSummaryKn: string;
  nakshatraSummaryEn: string;

  // Comprehensive Synthesis
  synthesisKn: string;
  synthesisEn: string;
}

export interface SamagraKundliMatrixResult {
  houses: BhavaEvaluationResult[];
  overallStrongestHouse: number;
  overallChallengingHouse: number;
  lifePathSynthesisKn: string;
  lifePathSynthesisEn: string;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Evaluates whether a planet is naturally benefic */
export const isNaturalBenefic = (planet: PlanetName): boolean => {
  return [PlanetName.Jupiter, PlanetName.Venus, PlanetName.Mercury, PlanetName.Moon].includes(planet);
};

/** Determines the dignity of a planet in a given rashi */
export const getPlanetRashiDignity = (planet: PlanetName, rashiIdx: number, degreeInSign = 15): DignityType => {
  if (EXALTATION_SIGNS[planet] === rashiIdx) return "exalted";
  if (DEBILITATION_SIGNS[planet] === rashiIdx) return "debilitated";

  const lord = signLord(rashiIdx);
  if (lord === planet) {
    // Check for Moolatrikona zones
    if (planet === PlanetName.Sun && rashiIdx === 4 && degreeInSign <= 20) return "moolatrikona";
    if (planet === PlanetName.Moon && rashiIdx === 1 && degreeInSign > 3) return "moolatrikona";
    if (planet === PlanetName.Mars && rashiIdx === 0 && degreeInSign <= 12) return "moolatrikona";
    if (planet === PlanetName.Mercury && rashiIdx === 5 && degreeInSign > 15 && degreeInSign <= 20) return "moolatrikona";
    if (planet === PlanetName.Jupiter && rashiIdx === 8 && degreeInSign <= 10) return "moolatrikona";
    if (planet === PlanetName.Venus && rashiIdx === 6 && degreeInSign <= 15) return "moolatrikona";
    if (planet === PlanetName.Saturn && rashiIdx === 10 && degreeInSign <= 20) return "moolatrikona";
    return "own";
  }

  const rel = naturalRelation(planet, lord);
  if (rel === "mitra") return "friend";
  if (rel === "shatru") return "enemy";
  return "neutral";
};

export const DIGNITY_LABELS_KN: Record<DignityType, string> = {
  exalted: "ಉಚ್ಚ ಕ್ಷೇತ್ರ (ಪರಮ ಬಲ)",
  debilitated: "ನೀಚ ಕ್ಷೇತ್ರ (ಅವನತಿ)",
  moolatrikona: "ಮೂಲತ್ರಿಕೋಣ (ಅತ್ಯುನ್ನತ ಶಕ್ತಿ)",
  own: "ಸ್ವಕ್ಷೇತ್ರ (ಸ್ಥಿರ ಬಲ)",
  friend: "ಮಿತ್ರ ಕ್ಷೇತ್ರ (ಶುಭ)",
  neutral: "ಸಮ ಕ್ಷೇತ್ರ (ಮಧ್ಯಮ)",
  enemy: "ಶತ್ರು ಕ್ಷೇತ್ರ (ಪ್ರತಿಕೂಲ)"
};

export const DIGNITY_LABELS_EN: Record<DignityType, string> = {
  exalted: "Exalted (Paramount Strength)",
  debilitated: "Debilitated (Compromised)",
  moolatrikona: "Moolatrikona (Supreme Vigour)",
  own: "Own Sign (Stable Strength)",
  friend: "Friendly Sign (Auspicious)",
  neutral: "Neutral Sign (Balanced)",
  enemy: "Enemy Sign (Challenging)"
};

/** Returns all planets aspecting a given sign index */
export const getAspectingPlanetsOnSign = (
  targetSignIdx: number,
  planets: PlanetPosition[]
): Array<{ planet: PlanetPosition; aspectType: string }> => {
  const result: Array<{ planet: PlanetPosition; aspectType: string }> = [];

  for (const p of planets) {
    const pSign = p.rashi.index;
    const diff = (targetSignIdx - pSign + 12) % 12; // 0 = conjunction, 6 = 7th house aspect

    // 7th House Aspect (Universal Parashari Drishti: offset 6)
    if (diff === 6) {
      result.push({ planet: p, aspectType: "7th Aspect (ಸಪ್ತಮ ಪೂರ್ಣ ದೃಷ್ಟಿ)" });
      continue;
    }

    // Mars Special Aspects: 4th (diff = 3), 8th (diff = 7)
    if (p.name === PlanetName.Mars) {
      if (diff === 3) result.push({ planet: p, aspectType: "Mars 4th Special Aspect (ಕುಜ ಚತುರ್ಥ ದೃಷ್ಟಿ)" });
      if (diff === 7) result.push({ planet: p, aspectType: "Mars 8th Special Aspect (ಕುಜ ಅಷ್ಟಮ ದೃಷ್ಟಿ)" });
    }

    // Jupiter Special Aspects: 5th (diff = 4), 9th (diff = 8)
    if (p.name === PlanetName.Jupiter) {
      if (diff === 4) result.push({ planet: p, aspectType: "Jupiter 5th Divine Aspect (ಗುರು ಪಂಚಮ ದೃಷ್ಟಿ)" });
      if (diff === 8) result.push({ planet: p, aspectType: "Jupiter 9th Divine Aspect (ಗುರು ನವಮ ದೃಷ್ಟಿ)" });
    }

    // Saturn Special Aspects: 3rd (diff = 2), 10th (diff = 9)
    if (p.name === PlanetName.Saturn) {
      if (diff === 2) result.push({ planet: p, aspectType: "Saturn 3rd Karmic Aspect (ಶನಿ ತೃತೀಯ ದೃಷ್ಟಿ)" });
      if (diff === 9) result.push({ planet: p, aspectType: "Saturn 10th Karmic Aspect (ಶನಿ ದಶಮ ದೃಷ್ಟಿ)" });
    }

    // Rahu / Ketu Trinal Aspects: 5th (diff = 4), 9th (diff = 8)
    if (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) {
      if (diff === 4) result.push({ planet: p, aspectType: `${p.name} 5th Shadow Aspect (ಛಾಯಾ ಪಂಚಮ ದೃಷ್ಟಿ)` });
      if (diff === 8) result.push({ planet: p, aspectType: `${p.name} 9th Shadow Aspect (ಛಾಯಾ ನವಮ ದೃಷ್ಟಿ)` });
    }
  }

  return result;
};

// ─── Main Evaluation Function for a Single House ────────────────────────────

export const evaluateBhavaSamagraMatrix = (input: BhavaEvaluationInput): BhavaEvaluationResult => {
  const { kundli, targetHouse } = input;
  const hMeta = BHAVA_METADATA[targetHouse] || BHAVA_METADATA[1]!;
  const lagnaRashiIdx = kundli.lagnaRashi?.index ?? 0;
  const houseSignIdx = rashiIndexInHouse(lagnaRashiIdx, targetHouse);
  const houseLordName = signLord(houseSignIdx);
  const houseLordPlanet = kundli.planets.find((p) => p.name === houseLordName);

  const signKn = KN_RASHI_NAMES[houseSignIdx]!;
  const signEn = EN_RASHI_NAMES[houseSignIdx]!;
  const lordKn = KN_PLANET_NAMES[houseLordName];
  const lordEn = EN_PLANET_NAMES[houseLordName];

  // ──────────────────────────────────────────────────────────────────────────
  // PILLAR 1: JANMA LAGNA PERSPECTIVE (ಲಗ್ನ ದೃಷ್ಟಿಕೋನ)
  // ──────────────────────────────────────────────────────────────────────────
  let lagnaScore = 55;
  const lagnaNotesKn: string[] = [];
  const lagnaNotesEn: string[] = [];

  // Lord's house relative to Lagna
  const lordHouse = houseLordPlanet ? houseLordPlanet.house : 1;
  const lordDegInSign = houseLordPlanet ? (normalizeDegree(houseLordPlanet.degree) % 30) : 15;
  const lordDignity = houseLordPlanet
    ? getPlanetRashiDignity(houseLordName, houseLordPlanet.rashi.index, lordDegInSign)
    : "neutral";

  // Dignity adjustment
  if (lordDignity === "exalted") {
    lagnaScore += 25;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಉಚ್ಚ ಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು ಪರಮ ಶಕ್ತಿಶಾಲಿಯಾಗಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} is exalted, imparting supreme strength.`);
  } else if (lordDignity === "moolatrikona") {
    lagnaScore += 20;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಮೂಲತ್ರಿಕೋಣ ಬಲ ಹೊಂದಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} possesses robust Moolatrikona dignity.`);
  } else if (lordDignity === "own") {
    lagnaScore += 18;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು ಸ್ಥಿರತೆ ನೀಡಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} is placed in own sign, providing steadfast stability.`);
  } else if (lordDignity === "friend") {
    lagnaScore += 10;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಮಿತ್ರ ರಾಶಿಯಲ್ಲಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} resides in a friendly sign.`);
  } else if (lordDignity === "enemy") {
    lagnaScore -= 10;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಶತ್ರು ಕ್ಷೇತ್ರದಲ್ಲಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} is posited in an enemy sign.`);
  } else if (lordDignity === "debilitated") {
    lagnaScore -= 22;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ನೀಚ ಕ್ಷೇತ್ರದಲ್ಲಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} is debilitated in natal Rashi.`);
  }

  // Lord's placement in Kendra, Trikona, or Dusthana
  if ([1, 4, 7, 10].includes(lordHouse)) {
    lagnaScore += 15;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ (${toKnNum(lordHouse)}ನೇ ಮನೆ) ನೆಲೆಸಿದ್ದು ಕಾರ್ಯ ಸಿದ್ಧಿ ನೀಡುತ್ತಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} sits in a foundational Kendra (${lordHouse}th house), ensuring manifest success.`);
  } else if ([5, 9].includes(lordHouse)) {
    lagnaScore += 15;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ತ್ರಿಕೋಣ ಸ್ಥಾನದಲ್ಲಿ (${toKnNum(lordHouse)}ನೇ ಮನೆ) ಸ್ಥಿತರಾಗಿದ್ದು ದೈವಾನುಗ್ರಹ ತಂದಿದ್ದಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} graces a powerful Trikona (${lordHouse}th house), infusing auspicious fortune.`);
  } else if ([6, 8, 12].includes(lordHouse)) {
    lagnaScore -= 15;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ದುಃಸ್ಥಾನದಲ್ಲಿ (${toKnNum(lordHouse)}ನೇ ಮನೆ) ನೆಲೆಸಿರುವುದರಿಂದ ಶ್ರಮ ಮತ್ತು ತಾಳ್ಮೆ ಅತ್ಯಗತ್ಯ.`);
    lagnaNotesEn.push(`House lord ${lordEn} is placed in a Dusthana (${lordHouse}th house), necessitating patience and remedies.`);
  } else if ([3, 11].includes(lordHouse)) {
    lagnaScore += 10;
    lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ (${toKnNum(lordHouse)}ನೇ ಮನೆ) ಇದ್ದು ಕಾಲಕ್ರಮೇಣ ಅಪಾರ ಪ್ರಗತಿ ನೀಡುತ್ತಾರೆ.`);
    lagnaNotesEn.push(`House lord ${lordEn} occupies an Upachaya (${lordHouse}th house), yielding increasing progress over time.`);
  }

  // House occupants
  const occupants = kundli.planets
    .filter((p) => p.house === targetHouse)
    .map((p) => ({
      name: p.name,
      nameKn: KN_PLANET_NAMES[p.name],
      nameEn: EN_PLANET_NAMES[p.name],
      isBenefic: isNaturalBenefic(p.name)
    }));

  for (const occ of occupants) {
    if (occ.isBenefic) {
      lagnaScore += 8;
      lagnaNotesKn.push(`ಶುಭ ಗ್ರಹ ${occ.nameKn} ${toKnNum(targetHouse)}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಶುಭತ್ವ ಹೆಚ್ಚಿಸಿದ್ದಾರೆ.`);
      lagnaNotesEn.push(`Natural benefic ${occ.nameEn} occupies the ${targetHouse}th house, enhancing auspiciousness.`);
    } else {
      lagnaScore -= 6;
      lagnaNotesKn.push(`ಕ್ರೂರ ಗ್ರಹ ${occ.nameKn} ${toKnNum(targetHouse)}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಪರೀಕ್ಷೆಗಳನ್ನು ಒಡ್ಡುತ್ತಾರೆ.`);
      lagnaNotesEn.push(`Malefic planet ${occ.nameEn} sits in the ${targetHouse}th house, presenting karmic tests.`);
    }
  }

  // Aspects on House Sign
  const rawAspects = getAspectingPlanetsOnSign(houseSignIdx, kundli.planets);
  const aspects = rawAspects.map((a) => ({
    name: a.planet.name,
    nameKn: KN_PLANET_NAMES[a.planet.name],
    nameEn: EN_PLANET_NAMES[a.planet.name],
    aspectType: a.aspectType
  }));

  for (const asp of rawAspects) {
    if (asp.planet.name === houseLordName) {
      lagnaScore += 18;
      lagnaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ತನ್ನ ಸ್ವಂತ ಮನೆಯ ಮೇಲೆ ದೃಷ್ಟಿ ನೆಟ್ಟಿದ್ದು (ಸ್ವಕ್ಷೇತ್ರ ದೃಷ್ಟಿ), ಮನೆಯನ್ನು ಪೂರ್ಣವಾಗಿ ರಕ್ಷಿಸುತ್ತಾರೆ.`);
      lagnaNotesEn.push(`Lord ${lordEn} casts drishti upon its own house, providing exceptional royal fortification.`);
    } else if (asp.planet.name === PlanetName.Jupiter) {
      lagnaScore += 12;
      lagnaNotesKn.push(`ಗುರು ಗ್ರಹದ ಪವಿತ್ರ ಅಮೃತ ದೃಷ್ಟಿಯು ಈ ಮನೆಗೆ ರಕ್ಷಣೆ ಮತ್ತು ಶುಭ ಫಲಗಳನ್ನು ಕರುಣಿಸಿದೆ.`);
      lagnaNotesEn.push(`Jupiter's divine protective aspect graces this house with spiritual auspiciousness.`);
    } else if (asp.planet.name === PlanetName.Venus) {
      lagnaScore += 8;
      lagnaNotesKn.push(`ಶುಕ್ರ ಗ್ರಹದ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಈ ಭಾವಕ್ಕೆ ಸುಖ ಮತ್ತು ಆಕರ್ಷಣೆ ತಂದಿದೆ.`);
      lagnaNotesEn.push(`Venus's graceful drishti bestows harmony and material abundance.`);
    } else if ([PlanetName.Saturn, PlanetName.Mars, PlanetName.Rahu].includes(asp.planet.name)) {
      lagnaScore -= 6;
      lagnaNotesKn.push(`${KN_PLANET_NAMES[asp.planet.name]} ಗ್ರಹದ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿಯು ಈ ಭಾವಕ್ಕೆ ಸವಾಲುಗಳನ್ನು ತಂದೊಡ್ಡಿದೆ.`);
      lagnaNotesEn.push(`${EN_PLANET_NAMES[asp.planet.name]}'s sharp aspect demands vigilance and steadfastness.`);
    }
  }

  lagnaScore = Math.min(100, Math.max(15, lagnaScore));

  // ──────────────────────────────────────────────────────────────────────────
  // PILLAR 2: BHAVAT BHAVAM & DERIVED ASCENDANT (ಭಾವತ್ ಭಾವಂ ಹಾಗೂ ಪರಿವರ್ತಿತ ಲಗ್ನ)
  // ──────────────────────────────────────────────────────────────────────────
  let bhavatScore = 55;
  const bhavatNotesKn: string[] = [];
  const bhavatNotesEn: string[] = [];

  const derived2ndSign = (houseSignIdx + 1) % 12;
  const derived4thSign = (houseSignIdx + 3) % 12;
  const derived6thSign = (houseSignIdx + 5) % 12;
  const derived8thSign = (houseSignIdx + 7) % 12;
  const derived10thSign = (houseSignIdx + 9) % 12;
  const derived12thSign = (houseSignIdx + 11) % 12;

  const derived2ndOccupants = kundli.planets.filter((p) => p.rashi.index === derived2ndSign);
  const derived4thOccupants = kundli.planets.filter((p) => p.rashi.index === derived4thSign);
  const derived6thOccupants = kundli.planets.filter((p) => p.rashi.index === derived6thSign);
  const derived8thOccupants = kundli.planets.filter((p) => p.rashi.index === derived8thSign);
  const derived10thOccupants = kundli.planets.filter((p) => p.rashi.index === derived10thSign);
  const derived12thOccupants = kundli.planets.filter((p) => p.rashi.index === derived12thSign);

  // Derived 2nd (Sustenance of house)
  if (derived2ndOccupants.some((p) => isNaturalBenefic(p.name))) {
    bhavatScore += 8;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೨ನೇ ಪೋಷಕ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ ಗ್ರಹವಿದ್ದು, ಇದರ ಫಲಗಳಿಗೆ ನಿರಂತರ ಬೆಂಬಲ ನೀಡುತ್ತದೆ.`);
    bhavatNotesEn.push(`Natural benefics grace the derived 2nd house of sustenance, nurturing this house's affairs.`);
  }

  // Derived 4th (Inner stability of house)
  if (derived4thOccupants.some((p) => isNaturalBenefic(p.name))) {
    bhavatScore += 8;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೪ನೇ ಸುಖ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ ಬಲವಿದ್ದು, ಸ್ಥಿರ ಶಾಂತಿ ಮತ್ತು ತೃಪ್ತಿ ಖಾತರಿಯಾಗಿದೆ.`);
    bhavatNotesEn.push(`Benefic presence in the derived 4th house secures deep-seated emotional foundation and ease.`);
  }

  // Derived 6th (Obstacles to house)
  if (derived6thOccupants.some((p) => [PlanetName.Mars, PlanetName.Saturn, PlanetName.Rahu].includes(p.name))) {
    bhavatScore += 7;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೬ನೇ ಸ್ಪರ್ಧಾ ಸ್ಥಾನದಲ್ಲಿ ಶನಿ/ಕುಜರ ಬಲವಿದ್ದು, ಸ್ಪರ್ಧೆ ಮತ್ತು ಅಡೆತಡೆಗಳನ್ನು ಸದೆಬಡಿಯುವ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.`);
    bhavatNotesEn.push(`Malefics in the derived 6th Upachaya vanquish competitors and resolve structural debts.`);
  } else if (derived6thOccupants.some((p) => isNaturalBenefic(p.name))) {
    bhavatScore -= 4;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೬ನೇ ಸ್ಥಾನದಲ್ಲಿ ಸೌಮ್ಯ ಗ್ರಹಗಳಿದ್ದು, ಶತ್ರುಗಳೊಂದಿಗೆ ಸೌಮ್ಯ ಸಂಧಾನದ ಅಗತ್ಯವಿದೆ.`);
    bhavatNotesEn.push(`Gentle planets in the derived 6th require diplomatic mediation during disputes.`);
  }

  // Derived 8th (Vulnerabilities/Disruption to house)
  if (derived8thOccupants.some((p) => [PlanetName.Rahu, PlanetName.Ketu, PlanetName.Saturn].includes(p.name))) {
    bhavatScore -= 8;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೮ನೇ ರಂಧ್ರ ಸ್ಥಾನದಲ್ಲಿ ನೆರಳು/ಕ್ರೂರ ಗ್ರಹಗಳಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳಿಗೆ ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು.`);
    bhavatNotesEn.push(`Nodal or malefic presence in the derived 8th house cautions against unforeseen shifts.`);
  }

  // Derived 10th (Apex achievement of house)
  if (derived10thOccupants.some((p) => isNaturalBenefic(p.name) || p.name === PlanetName.Sun)) {
    bhavatScore += 10;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ/ರವಿ ಪ್ರಭಾವವಿದ್ದು, ಇದರ ಕಾರಕತ್ವಗಳಲ್ಲಿ ಉನ್ನತ ಸಾರ್ವಜನಿಕ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.`);
    bhavatNotesEn.push(`Benefic or solar brilliance in the derived 10th house propels public acclaim in this domain.`);
  }

  // Derived 12th (Leakage/Expenditure of house)
  if (derived12thOccupants.some((p) => [PlanetName.Mars, PlanetName.Rahu].includes(p.name))) {
    bhavatScore -= 6;
    bhavatNotesKn.push(`ಈ ಮನೆಯಿಂದ ೧೨ನೇ ವ್ಯಯ ಸ್ಥಾನದಲ್ಲಿ ತೀಕ್ಷ್ಣ ಗ್ರಹಗಳಿದ್ದು, ಅನಗತ್ಯ ಖರ್ಚು ಅಥವಾ ಶಕ್ತಿ ವ್ಯರ್ಥವಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಬೇಕು.`);
    bhavatNotesEn.push(`Malefic presence in the derived 12th points to potential dissipation of energy if unguided.`);
  }

  // Classical Bhavat Bhavam Counterpart check (e.g. 10th from 10th is 7th)
  const counterpartHouse = hMeta.bhavatBhavamCounterpart;
  const counterpartSign = rashiIndexInHouse(lagnaRashiIdx, counterpartHouse);
  const counterpartLord = signLord(counterpartSign);
  const counterpartLordPlanet = kundli.planets.find((p) => p.name === counterpartLord);
  const counterpartDignity = counterpartLordPlanet
    ? getPlanetRashiDignity(counterpartLord, counterpartLordPlanet.rashi.index)
    : "neutral";

  if (["exalted", "own", "moolatrikona", "friend"].includes(counterpartDignity)) {
    bhavatScore += 10;
    bhavatNotesKn.push(`ಶಾಸ್ತ್ರೀಯ ಭಾವತ್ ಭಾವಂ ತತ್ವದಂತೆ, ${toKnNum(targetHouse)}ನೇ ಮನೆಗೆ ಸಮಾನಾಂತರ ಪೂರಕವಾದ ${toKnNum(counterpartHouse)}ನೇ ಮನೆಯ ಅಧಿಪತಿ (${KN_PLANET_NAMES[counterpartLord]}) ಬಲವಾಗಿದ್ದಾರೆ.`);
    bhavatNotesEn.push(`Under Bhavat Bhavam doctrine, the counterpart ${counterpartHouse}th house lord (${EN_PLANET_NAMES[counterpartLord]}) is dignified, reinforcing this house's fruit.`);
  } else if (counterpartDignity === "debilitated") {
    bhavatScore -= 8;
    bhavatNotesKn.push(`ಭಾವತ್ ಭಾವಂ ಪೂರಕವಾದ ${toKnNum(counterpartHouse)}ನೇ ಮನೆಯ ಅಧಿಪತಿ ದುರ್ಬಲರಾಗಿರುವುದರಿಂದ ಪೂರ್ಣ ಫಲಕ್ಕೆ ಹೆಚ್ಚಿನ ಪ್ರಯತ್ನ ಬೇಕು.`);
    bhavatNotesEn.push(`Counterpart ${counterpartHouse}th house lord is debilitated, calling for reinforced discipline.`);
  }

  bhavatScore = Math.min(100, Math.max(15, bhavatScore));

  // ──────────────────────────────────────────────────────────────────────────
  // PILLAR 3: GOCHARA / REAL-TIME TRANSITS (ಗೋಚಾರ ದೃಷ್ಟಿ ಹಾಗೂ ಪ್ರಭಾವ)
  // ──────────────────────────────────────────────────────────────────────────
  let gocharaScore = 55;
  const gocharaNotesKn: string[] = [];
  const gocharaNotesEn: string[] = [];

  const evalDate = input.evaluationDate || new Date();
  let transitLongs: ReturnType<typeof siderealLongitudes>;
  try {
    transitLongs = siderealLongitudes(evalDate, "lahiri", "mean");
  } catch {
    transitLongs = {
      jdUt: 0,
      ayanamsa: 24,
      sun: 0,
      moon: 0,
      mars: 60,
      mercury: 30,
      jupiter: 45, // Taurus
      venus: 90,
      saturn: 340, // Aquarius/Pisces
      rahu: 350,   // Pisces
      ketu: 170    // Virgo
    };
  }

  const getTransitRashi = (deg: number): number => Math.floor(normalizeDegree(deg) / 30);

  const tJupiterRashi = input.transitPositions?.Jupiter?.rashiIndex ?? getTransitRashi(transitLongs.jupiter);
  const tSaturnRashi = input.transitPositions?.Saturn?.rashiIndex ?? getTransitRashi(transitLongs.saturn);
  const tRahuRashi = input.transitPositions?.Rahu?.rashiIndex ?? getTransitRashi(transitLongs.rahu);
  const tKetuRashi = input.transitPositions?.Ketu?.rashiIndex ?? getTransitRashi(transitLongs.ketu);
  const tMarsRashi = input.transitPositions?.Mars?.rashiIndex ?? getTransitRashi(transitLongs.mars);

  // Transit Jupiter relative to houseSignIdx
  const jupDiff = (houseSignIdx - tJupiterRashi + 12) % 12;
  if (jupDiff === 0) {
    gocharaScore += 25;
    gocharaNotesKn.push(`ಗೋಚಾರ ಗುರುವು ನೇರವಾಗಿ ${toKnNum(targetHouse)}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ದೈವಾನುಗ್ರಹ ಮತ್ತು ವಿಸ್ತಾರವಾದ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸುತ್ತಿದ್ದಾರೆ.`);
    gocharaNotesEn.push(`Transiting Jupiter moves directly through the ${targetHouse}th house, showering divine protection and growth.`);
  } else if ([4, 6, 8].includes(jupDiff)) {
    gocharaScore += 20;
    gocharaNotesKn.push(`ಗೋಚಾರ ಗುರುವಿನ ಪರಮ ಮಂಗಳಕರ ದೃಷ್ಟಿಯು (೫, ೭, ೯ನೇ ದೃಷ್ಟಿ) ಈ ಮನೆಯ ಮೇಲಿದ್ದು, ಸಂಕಷ್ಟಗಳನ್ನು ಪರಿಹರಿಸುತ್ತದೆ.`);
    gocharaNotesEn.push(`Transiting Jupiter casts its auspicious 5th/7th/9th drishti on this house, dissolving friction.`);
  }

  // Transit Saturn relative to houseSignIdx
  const satDiff = (houseSignIdx - tSaturnRashi + 12) % 12;
  if (satDiff === 0) {
    gocharaScore -= 15;
    gocharaNotesKn.push(`ಗೋಚಾರ ಶನಿಯು ಪ್ರಸ್ತುತ ಈ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಶಿಸ್ತು, ಕರ್ಮ ಪರಿಶ್ರಮ ಮತ್ತು ಸಂಯಮವನ್ನು ಬೇಡುತ್ತಿದ್ದಾರೆ.`);
    gocharaNotesEn.push(`Transiting Saturn occupies this house, enforcing patient labour, karmic restructuring, and discipline.`);
  } else if ([2, 6, 9].includes(satDiff)) {
    gocharaScore -= 10;
    gocharaNotesKn.push(`ಗೋಚಾರ ಶನಿಯ ದೃಷ್ಟಿಯು (೩, ೭, ೧೦ನೇ ದೃಷ್ಟಿ) ಈ ಭಾವದ ಮೇಲಿದ್ದು, ವಿಳಂಬ ಹಾಗೂ ಎಚ್ಚರಿಕೆಯ ನಡವಳಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`);
    gocharaNotesEn.push(`Transiting Saturn's aspect (3rd/7th/10th) falls on this house, urging caution against hasty decisions.`);
  }

  // Transit Rahu / Ketu axis
  if (tRahuRashi === houseSignIdx || tKetuRashi === houseSignIdx) {
    gocharaScore -= 8;
    gocharaNotesKn.push(`ರಾಹು-ಕೇತುಗಳ ಛಾಯಾ ಸಂಚಾರವು ಈ ಮನೆಯ ಅಕ್ಷದಲ್ಲಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ಬದಲಾವಣೆ ಮತ್ತು ನವೀನ ಆಲೋಚನೆಗಳಿಗೆ ಪ್ರೇರೇಪಿಸುತ್ತದೆ.`);
    gocharaNotesEn.push(`Rahu-Ketu nodal axis activates this house, triggering sudden transformative breakthroughs.`);
  }

  // Transit Mars
  const marsDiff = (houseSignIdx - tMarsRashi + 12) % 12;
  if (marsDiff === 0 || [3, 6, 7].includes(marsDiff)) {
    gocharaScore += 5;
    gocharaNotesKn.push(`ಕುಜ ಗ್ರಹದ ಗೋಚಾರ ಪ್ರಭಾವವು ಈ ಭಾವದಲ್ಲಿ ತೀವ್ರ ಉತ್ಸಾಹ, ವೇಗ ಹಾಗೂ ಸಾಹಸ ಪ್ರವೃತ್ತಿಯನ್ನು ಬಡಿದೆಬ್ಬಿಸಿದೆ.`);
    gocharaNotesEn.push(`Mars transit/aspect injects acute drive, initiative, and assertive velocity into this house.`);
  }

  // Transit over natal house lord
  if (houseLordPlanet) {
    const lordRashi = houseLordPlanet.rashi.index;
    if (tJupiterRashi === lordRashi) {
      gocharaScore += 12;
      gocharaNotesKn.push(`ಗೋಚಾರ ಗುರುವು ಜನ್ಮ ಭಾವಾಧಿಪತಿ ${lordKn}ನ ಮೇಲೆ ಸಂಚರಿಸಿ ಶುಭ ಫಲಗಳನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಿದ್ದಾರೆ.`);
      gocharaNotesEn.push(`Transit Jupiter conjoins natal house lord ${lordEn}, multiplying favorable prospects.`);
    }
    if (tSaturnRashi === lordRashi) {
      gocharaScore -= 8;
      gocharaNotesKn.push(`ಗೋಚಾರ ಶನಿಯು ಜನ್ಮ ಭಾವಾಧಿಪತಿಯ ಮೇಲೆ ಸಂಚರಿಸುತ್ತಿರುವುದರಿಂದ ನಿಧಾನಗತಿಯ ಪ್ರಗತಿ ಕಂಡುಬರುತ್ತದೆ.`);
      gocharaNotesEn.push(`Transit Saturn conjoins natal house lord ${lordEn}, requiring deliberate endurance.`);
    }
  }

  gocharaScore = Math.min(100, Math.max(15, gocharaScore));

  // ──────────────────────────────────────────────────────────────────────────
  // PILLAR 4: DASHA - BHUKTI RELATIONSHIP (ದಶಾ-ಭುಕ್ತಿ ಸಕ್ರಿಯತೆ)
  // ──────────────────────────────────────────────────────────────────────────
  let dashaScore = 55;
  const dashaNotesKn: string[] = [];
  const dashaNotesEn: string[] = [];

  let currentAge = input.currentAgeYears;
  if (currentAge === undefined) {
    const birthYear = parseInt(kundli.birthSunTimes?.sunrise?.slice(0, 4) || "1990", 10);
    const currYear = evalDate.getFullYear();
    currentAge = Math.max(0, currYear - birthYear);
  }

  const bhuktiInfo = findBhuktiAtAge(kundli, currentAge);
  const mahaLord = bhuktiInfo?.maha.planet ?? PlanetName.Jupiter;
  const antarLord = bhuktiInfo?.bhukti ?? PlanetName.Saturn;

  const mahaKn = KN_PLANET_NAMES[mahaLord];
  const mahaEn = EN_PLANET_NAMES[mahaLord];
  const antarKn = KN_PLANET_NAMES[antarLord];
  const antarEn = EN_PLANET_NAMES[antarLord];

  // Check direct lordship
  if (mahaLord === houseLordName) {
    dashaScore += 22;
    dashaNotesKn.push(`ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಮಹಾದಶಾಧಿಪತಿ ${mahaKn} ಈ ಮನೆಯ ಅಧಿಪತಿಯಾಗಿದ್ದು, ಜೀವನದಲ್ಲಿ ಈ ಭಾವದ ವಿಷಯಗಳು ಪ್ರಧಾನವಾಗಿ ಫಲಿಸುತ್ತವೆ.`);
    dashaNotesEn.push(`Current Mahadasha lord ${mahaEn} rules this house, placing this house's themes at center stage.`);
  }
  if (antarLord === houseLordName) {
    dashaScore += 18;
    dashaNotesKn.push(`ಅಂತರ್ದಶಾಧಿಪತಿ ${antarKn} ಈ ಭಾವಾಧಿಪತಿಯಾಗಿದ್ದು, ಪ್ರಸ್ತುತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ನೇರ ಫಲ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`);
    dashaNotesEn.push(`Antardasha lord ${antarEn} governs this house, delivering direct and immediate developments.`);
  }

  // Check occupancy in house
  if (kundli.planets.some((p) => p.name === mahaLord && p.house === targetHouse)) {
    dashaScore += 15;
    dashaNotesKn.push(`ಮಹಾದಶಾಧಿಪತಿ ${mahaKn} ನೇರವಾಗಿ ಈ ${toKnNum(targetHouse)}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಸಕ್ರಿಯ ಫಲ ನೀಡುತ್ತಿದ್ದಾರೆ.`);
    dashaNotesEn.push(`Mahadasha lord ${mahaEn} is physically stationed in this ${targetHouse}th house, intensely activating it.`);
  }
  if (kundli.planets.some((p) => p.name === antarLord && p.house === targetHouse)) {
    dashaScore += 12;
    dashaNotesKn.push(`ಅಂತರ್ದಶಾಧಿಪತಿ ${antarKn} ಈ ${toKnNum(targetHouse)}ನೇ ಮನೆಯಲ್ಲಿ ನೆಲೆಸಿದ್ದಾರೆ.`);
    dashaNotesEn.push(`Antardasha lord ${antarEn} sits within this ${targetHouse}th house.`);
  }

  // Check position of Dasha lords relative to targetHouse as Lagna
  const mahaPlanet = kundli.planets.find((p) => p.name === mahaLord);
  const antarPlanet = kundli.planets.find((p) => p.name === antarLord);

  if (mahaPlanet) {
    const derivedMahaHouse = ((mahaPlanet.rashi.index - houseSignIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10, 5, 9, 11].includes(derivedMahaHouse)) {
      dashaScore += 10;
      dashaNotesKn.push(`ಈ ಮನೆಯಿಂದ ಲೆಕ್ಕಿಸಿದಾಗ ಮಹಾದಶಾಧಿಪತಿ ${mahaKn} ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದಾರೆ (${toKnNum(derivedMahaHouse)}ನೇ ಮನೆ).`);
      dashaNotesEn.push(`Measured from this house, Mahadasha lord ${mahaEn} occupies an auspicious station (${derivedMahaHouse}th house).`);
    } else if ([6, 8, 12].includes(derivedMahaHouse)) {
      dashaScore -= 8;
      dashaNotesKn.push(`ಈ ಮನೆಯಿಂದ ಲೆಕ್ಕಿಸಿದಾಗ ಮಹಾದಶಾಧಿಪತಿ ಷಡಾಷ್ಟಕ/ದುಃಸ್ಥಾನದಲ್ಲಿದ್ದು (${toKnNum(derivedMahaHouse)}ನೇ ಮನೆ), ತಾಳ್ಮೆಯ ಅಗತ್ಯವಿದೆ.`);
      dashaNotesEn.push(`Measured from this house, Mahadasha lord occupies a Dusthana (${derivedMahaHouse}th house), urging steady patience.`);
    }
  }

  if (antarPlanet) {
    const derivedAntarHouse = ((antarPlanet.rashi.index - houseSignIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10, 5, 9, 11].includes(derivedAntarHouse)) {
      dashaScore += 8;
      dashaNotesKn.push(`ಅಂತರ್ದಶಾಧಿಪತಿ ${antarKn} ಈ ಮನೆಯಿಂದ ಕೇಂದ್ರ/ತ್ರಿಕೋಣದಲ್ಲಿ ಸ್ಥಿತರಾಗಿದ್ದಾರೆ.`);
      dashaNotesEn.push(`Antardasha lord ${antarEn} occupies an auspicious Kendra/Trikona relative to this house.`);
    } else if ([6, 8, 12].includes(derivedAntarHouse)) {
      dashaScore -= 6;
      dashaNotesKn.push(`ಅಂತರ್ದಶಾಧಿಪತಿಯು ಈ ಮನೆಯಿಂದ ಪ್ರತಿಕೂಲ ಸ್ಥಾನದಲ್ಲಿದ್ದು (${toKnNum(derivedAntarHouse)}ನೇ ಮನೆ), ಜಾಗರೂಕತೆ ಇರಲಿ.`);
      dashaNotesEn.push(`Antardasha lord occupies an uncomfortable house (${derivedAntarHouse}th house) from this cusp.`);
    }
  }

  dashaScore = Math.min(100, Math.max(15, dashaScore));

  // ──────────────────────────────────────────────────────────────────────────
  // PILLAR 5: AMSHAKA / NAVAMSHA D9 VERIFICATION (ಅಂಶಕ ದೃಷ್ಟಿಕೋನ & ನವಾಂಶ ಬಲ)
  // ──────────────────────────────────────────────────────────────────────────
  let navamshaScore = 55;
  const navamshaNotesKn: string[] = [];
  const navamshaNotesEn: string[] = [];

  if (houseLordPlanet) {
    const d1Rashi = houseLordPlanet.rashi.index;
    const d9Rashi = navamsaSignIndex(houseLordPlanet.degree);
    const d9SignKn = KN_RASHI_NAMES[d9Rashi]!;
    const d9SignEn = EN_RASHI_NAMES[d9Rashi]!;

    const d9Lord = signLord(d9Rashi);
    const d9LordKn = KN_PLANET_NAMES[d9Lord];
    const d9LordEn = EN_PLANET_NAMES[d9Lord];

    // Vargottama check
    const isVargottama = d1Rashi === d9Rashi;
    if (isVargottama) {
      navamshaScore += 25;
      navamshaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ರಾಶಿ ಮತ್ತು ನವಾಂಶ ಎರಡರಲ್ಲೂ ಒಂದೇ ರಾಶಿಯಲ್ಲಿದ್ದು (ವರ್ಗೋತ್ತಮ), ದೈವಿಕ ಸ್ಥಿರತೆ ಪಡೆದಿದ್ದಾರೆ.`);
      navamshaNotesEn.push(`House lord ${lordEn} is Vargottama (same sign in D1 & D9), endowing immense resilience and purity of results.`);
    }

    // Navamsha dignity
    const d9Dignity = getPlanetRashiDignity(houseLordName, d9Rashi);
    if (d9Dignity === "exalted") {
      navamshaScore += 20;
      navamshaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ನವಾಂಶದಲ್ಲಿ (${d9SignKn}) ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಆಂತರಿಕವಾಗಿ ಅತ್ಯಂತ ಬಲಶಾಲಿಯಾಗಿದ್ದಾರೆ.`);
      navamshaNotesEn.push(`House lord ${lordEn} is exalted in Navamsha (${d9SignEn}), possessing supreme internal vitality.`);
    } else if (d9Dignity === "own") {
      navamshaScore += 15;
      navamshaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ನವಾಂಶದಲ್ಲಿ ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದಾರೆ (${d9SignKn}).`);
      navamshaNotesEn.push(`House lord ${lordEn} attains own-sign dignity in Navamsha (${d9SignEn}).`);
    } else if (d9Dignity === "debilitated") {
      navamshaScore -= 18;
      navamshaNotesKn.push(`ಭಾವಾಧಿಪತಿ ${lordKn} ನವಾಂಶದಲ್ಲಿ ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದಾರೆ (${d9SignKn}).`);
      navamshaNotesEn.push(`House lord ${lordEn} is debilitated in Navamsha (${d9SignEn}), indicating internal depletion.`);
    }

    // Classical Sublimation Rule: Neecha in D1 but Exalted/Swakshetra in D9
    if (lordDignity === "debilitated" && ["exalted", "own"].includes(d9Dignity)) {
      navamshaScore += 25;
      navamshaNotesKn.push(`ಶಾಸ್ತ್ರ ರಹಸ್ಯ: ರಾಶಿಯಲ್ಲಿ ನೀಚವಾಗಿದ್ದರೂ ನವಾಂಶದಲ್ಲಿ ಉಚ್ಚ/ಸ್ವಕ್ಷೇತ್ರ ಪಡೆದಿರುವುದರಿಂದ, ಆರಂಭಿಕ ಸಂಕಷ್ಟಗಳ ನಂತರ ಅದ್ಭುತ ನೀಚಭಂಗ ಯೋಗ ಸಿದ್ಧಿಸುತ್ತದೆ!`);
      navamshaNotesEn.push(`Classical Sublimation Secret: Though debilitated in D1, exaltation/own sign in D9 triggers powerful Neechabhanga elevation after initial hurdles!`);
    }

    // Navamsha Dispositor (Navamshapati)
    const dispositorPlanet = kundli.planets.find((p) => p.name === d9Lord);
    const dispositorDignity = dispositorPlanet
      ? getPlanetRashiDignity(d9Lord, dispositorPlanet.rashi.index)
      : "neutral";

    if (["exalted", "own", "moolatrikona"].includes(dispositorDignity)) {
      navamshaScore += 10;
      navamshaNotesKn.push(`ನವಾಂಶಪತಿ ${d9LordKn} ಜಾತಕದಲ್ಲಿ ಪ್ರಬಲರಾಗಿದ್ದು, ಸುಪ್ತ ಶಕ್ತಿಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಾರೆ.`);
      navamshaNotesEn.push(`Navamsha dispositor ${d9LordEn} is powerfully positioned, awakening latent potential.`);
    }
  } else {
    navamshaNotesKn.push(`ನವಾಂಶ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ಮಧ್ಯಮ ಸಮತೋಲನವಿದೆ.`);
    navamshaNotesEn.push(`Navamsha verification reflects balanced baseline strength.`);
  }

  navamshaScore = Math.min(100, Math.max(15, navamshaScore));

  // ──────────────────────────────────────────────────────────────────────────
  // PILLAR 6: NAKSHATRA & DISPOSITOR STRENGTH MATRIX (ನಕ್ಷತ್ರ ಹಾಗೂ ನಕ್ಷತ್ರಾಧಿಪತಿ ಬಲ)
  // ──────────────────────────────────────────────────────────────────────────
  let nakshatraScore = 55;
  const nakshatraNotesKn: string[] = [];
  const nakshatraNotesEn: string[] = [];

  if (houseLordPlanet) {
    const star = degreeToNakshatra(houseLordPlanet.degree);
    const starLord = nakshatraLordForIndex(star.index);
    const starLordKn = KN_PLANET_NAMES[starLord];
    const starLordEn = EN_PLANET_NAMES[starLord];

    const starLordPlanet = kundli.planets.find((p) => p.name === starLord);
    const starLordDignity = starLordPlanet
      ? getPlanetRashiDignity(starLord, starLordPlanet.rashi.index)
      : "neutral";
    const starLordHouse = starLordPlanet ? starLordPlanet.house : 1;

    // Tara Bala relative to native's Janma Nakshatra (Moon's star)
    const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
    const janmaNakIdx = moonPlanet ? degreeToNakshatra(moonPlanet.degree).index : 0;
    const tb = calculateTaraBala(janmaNakIdx, star.index);

    if (tb.isFavourable) {
      nakshatraScore += 15;
      nakshatraNotesKn.push(`ಭಾವಾಧಿಪತಿಯ ನಕ್ಷತ್ರವು (${star.sanskrit}) ಜನ್ಮ ತಾರೆಯಿಂದ ಶುಭ ತಾರಾಬಲ ಹೊಂದಿದೆ (${toKnNum(tb.tara)}ನೇ ತಾರೆ - ಸಂಪತ್/ಸಾಧಕ/ಮಿತ್ರ).`);
      nakshatraNotesEn.push(`House lord's nakshatra (${star.english}) enjoys auspicious Tara Bala (${tb.tara}th Tara - gainful and supportive).`);
    } else if (tb.isDifficult) {
      nakshatraScore -= 10;
      nakshatraNotesKn.push(`ಭಾವಾಧಿಪತಿಯ ನಕ್ಷತ್ರವು ಪ್ರತಿಕೂಲ ತಾರೆಯಲ್ಲಿದ್ದು (${toKnNum(tb.tara)}ನೇ ತಾರೆ - ವಿಪತ್/ಪ್ರತ್ಯರಿ/ವಧ), ಶಾಂತಿ ಪೂಜೆ ಉಪಯುಕ್ತ.`);
      nakshatraNotesEn.push(`House lord's star falls in a challenging Tara (${tb.tara}th Tara), warranting japa and propitiation.`);
    }

    // Nakshatra Lord Dignity & Placement
    if (["exalted", "own", "moolatrikona"].includes(starLordDignity)) {
      nakshatraScore += 18;
      nakshatraNotesKn.push(`ನಕ್ಷತ್ರಾಧಿಪತಿ ${starLordKn} ಅತ್ಯಂತ ಬಲಶಾಲಿಯಾಗಿದ್ದು, ನಕ್ಷತ್ರ ಮಟ್ಟದಲ್ಲಿ ಅದ್ಭುತ ಚೈತನ್ಯ ತುಂಬಿದ್ದಾರೆ.`);
      nakshatraNotesEn.push(`Nakshatra ruler ${starLordEn} is exalted/in own sign, transmitting stellar brilliance to this house.`);
    } else if (starLordDignity === "debilitated") {
      nakshatraScore -= 12;
      nakshatraNotesKn.push(`ನಕ್ಷತ್ರಾಧಿಪತಿ ${starLordKn} ನೀಚವಾಗಿದ್ದು ನಕ್ಷತ್ರದ ಸೂಕ್ಷ್ಮ ಬಲ ಕುಂದಿದೆ.`);
      nakshatraNotesEn.push(`Nakshatra ruler ${starLordEn} is debilitated, reducing subtle stellar propulsion.`);
    }

    if ([1, 4, 7, 10, 5, 9, 11].includes(starLordHouse)) {
      nakshatraScore += 10;
      nakshatraNotesKn.push(`ನಕ್ಷತ್ರಾಧಿಪತಿ ${starLordKn} ಶುಭ ಕೇಂದ್ರ/ತ್ರಿಕೋಣದಲ್ಲಿದ್ದಾರೆ (${toKnNum(starLordHouse)}ನೇ ಮನೆ).`);
      nakshatraNotesEn.push(`Nakshatra lord ${starLordEn} occupies a fortunate Kendra/Trikona (${starLordHouse}th house).`);
    }

    // 🌟 THE CLASSICAL PARASHARA / NADI REVERSAL PRINCIPLE (User's Voice Mandate):
    // "ಈಗ ಕೆಲವೊಂದು ಸತಿ ನಕ್ಷತ್ರಗಳು ಉಚ್ಚ ಇದ್ದು ಗ್ರಹಗಳು ನೀಚ ಇದ್ರೂನು ಒಳ್ಳೆ ಫಲ ಕೊಡುತ್ತೆ ಎಷ್ಟೋ ಉದಾಹರಣೆಗಳು ಇವೆ ಅಂತದ್ದು"
    if (lordDignity === "debilitated" && (["exalted", "own", "moolatrikona"].includes(starLordDignity) || [1, 4, 5, 9, 10].includes(starLordHouse))) {
      nakshatraScore += 25;
      nakshatraNotesKn.push(`ಮಹೋನ್ನತ ಜ್ಯೋತಿಷ್ಯ ಸೂತ್ರ: ಗ್ರಹವು ರಾಶಿಯಲ್ಲಿ ನೀಚವಾಗಿದ್ದರೂ, ಅದರ ನಕ್ಷತ್ರಾಧಿಪತಿ ${starLordKn} ಉಚ್ಚ/ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಅನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು ಮತ್ತು ದಿಗ್ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ!`);
      nakshatraNotesEn.push(`Supreme Parashari Exception: Although house lord is debilitated in Rashi, its star ruler ${starLordEn} is exalted or in a Kendra/Trikona, overturning debility into unexpected victory!`);
    }
  } else {
    nakshatraNotesKn.push(`ನಕ್ಷತ್ರ ಬಲವು ಸಾಧಾರಣವಾಗಿದೆ.`);
    nakshatraNotesEn.push(`Nakshatra alignment provides steady baseline strength.`);
  }

  nakshatraScore = Math.min(100, Math.max(15, nakshatraScore));

  // ──────────────────────────────────────────────────────────────────────────
  // COMPOSITE SCORING & SYNTHESIS
  // ──────────────────────────────────────────────────────────────────────────
  // Formula: 20% Lagna + 20% Bhavat Bhavam + 15% Gochara + 15% Dasha + 15% Navamsha + 15% Nakshatra
  const netCompositeScore = Math.round(
    0.20 * lagnaScore +
    0.20 * bhavatScore +
    0.15 * gocharaScore +
    0.15 * dashaScore +
    0.15 * navamshaScore +
    0.15 * nakshatraScore
  );

  let strengthGradeKn = "";
  let strengthGradeEn = "";

  if (netCompositeScore >= 85) {
    strengthGradeKn = "ಉತ್ಕೃಷ್ಟ ಶುಭ ಫಲ (ಪರಮ ಬಲ)";
    strengthGradeEn = "Utkrishta (Paramount Auspiciousness)";
  } else if (netCompositeScore >= 70) {
    strengthGradeKn = "ಪ್ರಬಲ ಅನುಕೂಲ (ಉನ್ನತ ಪ್ರಗತಿ)";
    strengthGradeEn = "Prabala (Strong & Highly Progressive)";
  } else if (netCompositeScore >= 50) {
    strengthGradeKn = "ಮಧ್ಯಮ ಫಲ (ಸಮತೋಲಿತ ಪರಿಶ್ರಮ)";
    strengthGradeEn = "Madhyama (Balanced with Steady Effort)";
  } else {
    strengthGradeKn = "ಕ್ಲಿಷ್ಟ ಸ್ಥಿತಿ (ಶಾಂತಿ & ಜಪ ಸಾಧನೆ ಅಗತ್ಯ)";
    strengthGradeEn = "Klishta (Challenging - Remedial Upasana Needed)";
  }

  const lagnaSummaryKn = lagnaNotesKn.join(" ") || "ಲಗ್ನದಿಂದ ಈ ಮನೆ ಸಾಮಾನ್ಯ ಸ್ಥಿತಿಯಲ್ಲಿದೆ.";
  const lagnaSummaryEn = lagnaNotesEn.join(" ") || "Normal baseline from Janma Lagna.";
  const bhavatSummaryKn = bhavatNotesKn.join(" ") || "ಭಾವತ್ ಭಾವಂ ಪ್ರಕಾರ ಸಮತೋಲಿತ ಫಲವಿದೆ.";
  const bhavatSummaryEn = bhavatNotesEn.join(" ") || "Balanced derived Bhavat Bhavam framework.";
  const gocharaSummaryKn = gocharaNotesKn.join(" ") || "ಗೋಚಾರದಲ್ಲಿ ಸಾಧಾರಣ ಸಂಚಾರವಿದೆ.";
  const gocharaSummaryEn = gocharaNotesEn.join(" ") || "Standard transit backdrop.";
  const dashaSummaryKn = dashaNotesKn.join(" ") || "ದಶಾ-ಭುಕ್ತಿಯಲ್ಲಿ ಸ್ಥಿರ ಪ್ರಭಾವವಿದೆ.";
  const dashaSummaryEn = dashaNotesEn.join(" ") || "Stable Dasha-Bhukti activation.";
  const navamshaSummaryKn = navamshaNotesKn.join(" ") || "ನವಾಂಶದಲ್ಲಿ ಸಾಧಾರಣ ಶಕ್ತಿಯಿದೆ.";
  const navamshaSummaryEn = navamshaNotesEn.join(" ") || "Standard Navamsha support.";
  const nakshatraSummaryKn = nakshatraNotesKn.join(" ") || "ನಕ್ಷತ್ರಾಧಿಪತಿಯ ಸಾಮಾನ್ಯ ಬಲವಿದೆ.";
  const nakshatraSummaryEn = nakshatraNotesEn.join(" ") || "Normal nakshatra support.";

  const synthesisKn = `ಈ ${toKnNum(targetHouse)}ನೇ ${hMeta.nameKn}ವಿನ ಒಟ್ಟು ಸಂಯೋಜಿತ ಬಲವು ${toKnNum(netCompositeScore)}/೧೦೦ (${strengthGradeKn}) ಆಗಿದೆ. ${hMeta.significationKn} ಕುರಿತಂತೆ, ಲಗ್ನ ದೃಷ್ಟಿಕೋನ (${toKnNum(lagnaScore)}), ಭಾವತ್ ಭಾವಂ (${toKnNum(bhavatScore)}), ಗೋಚಾರ ಪರಿಸರ (${toKnNum(gocharaScore)}), ದಶಾ-ಭುಕ್ತಿ ಸಕ್ರಿಯತೆ (${toKnNum(dashaScore)}), ನವಾಂಶ ಬಲ (${toKnNum(navamshaScore)}) ಹಾಗೂ ನಕ್ಷತ್ರಾಧಿಪತಿಯ ಪ್ರಭಾವ (${toKnNum(nakshatraScore)}) - ಈ ೬ ಆಯಾಮಗಳ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆಯಿಂದ ಫಲಗಳು ಸಾಕಾರಗೊಳ್ಳುತ್ತವೆ.`;
  const synthesisEn = `The composite strength of the ${targetHouse}th house (${hMeta.nameEn}) is ${netCompositeScore}/100 (${strengthGradeEn}). Regarding ${hMeta.significationEn.toLowerCase()}, the synthesized matrix balances Janma Lagna (${lagnaScore}), Bhavat Bhavam (${bhavatScore}), Gochara transits (${gocharaScore}), Dasha-Bhukti (${dashaScore}), Navamsha D9 (${navamshaScore}), and Nakshatra dispositor strength (${nakshatraScore}).`;

  return {
    houseNumber: targetHouse,
    signIndex: houseSignIdx,
    signNameKn: signKn,
    signNameEn: signEn,
    houseLord: houseLordName,
    houseLordKn: lordKn,
    houseLordEn: lordEn,
    houseLordDignity: lordDignity,
    houseLordDignityKn: DIGNITY_LABELS_KN[lordDignity],
    houseLordDignityEn: DIGNITY_LABELS_EN[lordDignity],
    occupants,
    aspects,
    lagnaPerspectiveScore: lagnaScore,
    bhavatBhavamScore: bhavatScore,
    gocharaTransitScore: gocharaScore,
    dashaBhuktiScore: dashaScore,
    navamshaScore,
    nakshatraScore,
    netCompositeScore,
    strengthGradeKn,
    strengthGradeEn,
    lagnaPerspectiveSummaryKn: lagnaSummaryKn,
    lagnaPerspectiveSummaryEn: lagnaSummaryEn,
    bhavatBhavamSummaryKn: bhavatSummaryKn,
    bhavatBhavamSummaryEn: bhavatSummaryEn,
    gocharaSummaryKn: gocharaSummaryKn,
    gocharaSummaryEn: gocharaSummaryEn,
    dashaSummaryKn: dashaSummaryKn,
    dashaSummaryEn: dashaSummaryEn,
    navamshaSummaryKn: navamshaSummaryKn,
    navamshaSummaryEn: navamshaSummaryEn,
    nakshatraSummaryKn: nakshatraSummaryKn,
    nakshatraSummaryEn: nakshatraSummaryEn,
    synthesisKn,
    synthesisEn
  };
};

// ─── Batch Evaluation for All 12 Houses ─────────────────────────────────────

export const evaluateAll12Bhavas = (
  kundli: KundliOutput,
  evaluationDate?: Date
): SamagraKundliMatrixResult => {
  const houses: BhavaEvaluationResult[] = [];
  for (let h = 1; h <= 12; h++) {
    houses.push(evaluateBhavaSamagraMatrix({ kundli, targetHouse: h, evaluationDate }));
  }

  let strongest = houses[0]!;
  let challenging = houses[0]!;

  for (const h of houses) {
    if (h.netCompositeScore > strongest.netCompositeScore) strongest = h;
    if (h.netCompositeScore < challenging.netCompositeScore) challenging = h;
  }

  const lifePathKn = `ಜಾತಕದ ೧೨ ಮನೆಗಳ ಷಡ್ವಿಧ ಪಂಚಾಂಗ ಮೌಲ್ಯಮಾಪನದಲ್ಲಿ, ಅತ್ಯಂತ ಪ್ರಬಲವಾದ ಮನೆಯು ${toKnNum(strongest.houseNumber)}ನೇ ಮನೆ (${BHAVA_METADATA[strongest.houseNumber]?.nameKn}, ಅಂಕ: ${toKnNum(strongest.netCompositeScore)}/೧೦೦) ಆಗಿದ್ದು, ಇದು ನಿಮ್ಮ ಜೀವನದ ಮುಖ್ಯ ಯಶಸ್ಸಿನ ಹೆಬ್ಬಾಗಿಲಾಗಿದೆ. ಹಾಗೆಯೇ, ${toKnNum(challenging.houseNumber)}ನೇ ಮನೆಯು (${BHAVA_METADATA[challenging.houseNumber]?.nameKn}, ಅಂಕ: ${toKnNum(challenging.netCompositeScore)}/೧೦೦) ಪರಿಶ್ರಮ ಮತ್ತು ಶಾಂತಿ ಉಪಾಸನೆಯನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತದೆ.`;
  const lifePathEn = `In the 6-fold evaluation of all 12 Bhavas, the paramount house of strength is the ${strongest.houseNumber}th house (${BHAVA_METADATA[strongest.houseNumber]?.nameEn}, score: ${strongest.netCompositeScore}/100), serving as your greatest life anchor. Conversely, the ${challenging.houseNumber}th house (${BHAVA_METADATA[challenging.houseNumber]?.nameEn}, score: ${challenging.netCompositeScore}/100) calls for focused discipline and remedial dedication.`;

  return {
    houses,
    overallStrongestHouse: strongest.houseNumber,
    overallChallengingHouse: challenging.houseNumber,
    lifePathSynthesisKn: lifePathKn,
    lifePathSynthesisEn: lifePathEn
  };
};
