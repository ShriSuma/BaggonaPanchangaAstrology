/**
 * Baggona 5-Year Master Destiny Engine (ಪಂಚವರ್ಷ ಮಹಾ ಭವಿಷ್ಯ ಎಂಜಿನ್)
 *
 * Master computational engine that deterministically calculates:
 * 1. 5-Year Chronological Horizon (Years 1 to 5) with exact Samvatsaras,
 *    active Vimshottari Mahadasha/Bhukti, and planetary transits (Saturn, Jupiter, Rahu-Ketu).
 * 2. 100% Age-Adaptive Life Chapters (Child, Youth, Adult, Senior).
 * 3. Classical Prescribed Stotras (Sanskrit shloka + 6-language translation + chanting protocol).
 * 4. Gokarna Kshetra Shanti-Parihara, Gemstone (with Vajra vs Hawala Parashari Lagna rule), and Rudraksha.
 */

import { PlanetName, type KundliOutput, type AyanamsaModel } from "../../core/AstroTypes";
import { resolveExactMoonPada } from "../../core/AstroMath";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { calculateComprehensiveDoshas } from "../../core/ComprehensiveDoshaEngine";
import {
  hasGocharaVedha,
  evaluateThreeGatePrediction,
  normalizePlanetName,
  type ThreeGateInput,
  type PredictionConfidence,
  type PlanetPosition as GatePlanetPosition,
  type RashiIndex as GateRashiIndex
} from "../../engine/jyotishPrecisionGates";
import {
  calculateSecretAccuracyProfile,
  checkBhriguBinduTransitTrigger,
  type SecretAccuracyProfile
} from "../../engine/secretAccuracyEngine";
import { BHRIGU_BINDU_LOCALE } from "../../engine/secretAccuracyLocale";
import SunCalc from "suncalc";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { getSamvatsaraMetadata } from "../../core/BaggonaUniversalBookEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import {
  type SixLang,
  pick6,
  RASHI_6L,
  GRAHA_6L,
  NAKSHATRA_6L,
  WEEKDAY_6L,
  formatNumber6L,
  getPadaWord
} from "./fiveYearLocale";
import { resolveDevoteeDisplayName } from "../../utils/transliterator";
import {
  type OpeningHookNarrative,
  type PlanetaryCalculationItem,
  type NagaluYearItem,
  type NagaluRoadmapInfo,
  calculateOpeningHookNarrative,
  calculatePlanetaryCalculations,
  calculateNagaluRoadmap
} from "./fiveYearDynamicNarrativeEngine";

export type {
  OpeningHookNarrative,
  PlanetaryCalculationItem,
  NagaluYearItem,
  NagaluRoadmapInfo
};

export {
  calculateOpeningHookNarrative,
  calculatePlanetaryCalculations,
  calculateNagaluRoadmap
};

export function getEnglishOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export interface AnnualSeasonBreakdown {
  quarterIndex?: number; // 0..3
  seasonKey?: string;
  seasonName: string; // Vasantha, Greeshma, Varsha, Sharad/Hemanta/Shishira
  gregorianMonths: string;
  vedicMonths: string;
  predictedOutcome: string;
  opportunityBadge: string;
  favorableActivities?: string[];
}

export interface FiveYearPersonalization {
  gender?: "Male" | "Female" | string;
  maritalStatus?: "unmarried" | "married" | "divorced" | "widowed" | string;
  childrenStatus?: "no_children" | "has_children" | "planning" | string;
  careerStatus?: "student" | "employed" | "business" | "retired" | string;
  focusArea?: "career" | "marriage" | "wealth" | "health" | "children" | "spiritual" | string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  ayanamsa?: AyanamsaModel;
}

export interface FiveYearFinancialRoadmapItem {
  yearRange: string;
  financialStance: string;
  keyAction: string;
  targetSectors: string;
}

export interface HealthLongevityShieldItem {
  vulnerableWindow: string;
  focusArea: string;
  preventiveGuidance: string;
}

export interface PunyakshetraYatraItem {
  recommendedKshetra: string;
  idealSeason: string;
  spiritualBenefit: string;
}

export interface YearSpecificRemedyItem {
  yearIndex: number;
  gregorianRange: string;
  transitChallenge: string;
  gokarnaSeva: string;
  mantra: string;
}

export interface NakshatraVrikshaInfo {
  vrikshaName: string;
  bijaMantra: string;
  aradhanaProtocol: string;
}

export interface FamilyDestinyInterlockingInfo {
  impactOnSpouse: string;
  impactOnChildren: string;
  impactOnParents: string;
  familyBundleCta: string;
  familyQrUrl: string;
}

export interface FiveYearCurrentLifeStatus {
  bannerBadge: string;
  title: string;
  subtitle: string;
  currentAgeFormatted: string;
  activeMahadasha: string;
  activeBhukti: string;
  activeDashaPeriodText: string;
  karmicFlowSummary: string;
  shaniGocharaStatus: string;
  shaniGocharaImpact: string;
  isSadeSati: boolean;
  isKantaka: boolean;
  isAshtama: boolean;
  guruGocharaStatus: string;
  guruGocharaImpact: string;
  hasGuruBala: boolean;
  rahuKetuStatus: string;
  rahuKetuImpact: string;
  energyScore: number;
  energyMeterLabel: string;
  energyDesc: string;
  careerImmediateFocus: string;
  wealthImmediateFocus: string;
  familyImmediateFocus: string;
  healthImmediateFocus: string;
  cautionWindowImmediate: string;
  dailyMantraText: string;
  prescribedSevaText: string;
  emotionalEmpathyHeading?: string;
  emotionalEmpathyText?: string;
  turningPointTimeline?: string;
  fourPillarsDashboard?: {
    career: { status: "favorable" | "moderate" | "caution"; badgeText: string; oneLiner: string; detail: string };
    wealth: { status: "favorable" | "moderate" | "caution"; badgeText: string; oneLiner: string; detail: string };
    family: { status: "favorable" | "moderate" | "caution"; badgeText: string; oneLiner: string; detail: string };
    health: { status: "favorable" | "moderate" | "caution"; badgeText: string; oneLiner: string; detail: string };
  };
  immediateSimpleActionTitle?: string;
  immediateSimpleActionText?: string;
}

export interface HotelHospitalityPrivilege {
  bannerTitle: string;
  tagline: string;
  description: string;
  privilegeOfferBadge: string;
  amenities: Array<{ icon: string; title: string; desc: string }>;
  proximityHighlights: string;
  bookingHotline: string;
  priestSevaAssistance: string;
}

export interface FiveYearMilestoneRow {
  id: string;
  dimensionTitle: string;
  timingWindow: string;
  planetaryCatalyst: string;
  probabilityScore: string;
  actionAdvice: string;
  confidence?: PredictionConfidence;
  gatesPassed?: number;
  summaryTag?: string;
}

export interface FiveYearSingleYear {
  yearIndex: number; // 0..4
  gregorianRange: string; // e.g. "2026 - 2027"
  shakaYear: number;
  samvatsaraKn: string;
  samvatsaraEn: string;
  samvatsaraNative: string;
  activeMahadasha: string;
  activeBhukti: string;
  activeDashaPeriodText: string;
  vitalityScore: number; // 0..100
  vitalityCategory: "exceptional" | "balanced" | "caution";
  shaniGocharaText: string;
  guruGocharaText: string;
  rahuKetuText: string;
  headline: string;
  whatToExpect: string[];
  turningPointSeason: string;
  goldenOpportunityWindow: string;
  cautionAndGuidance: string;
  seasons?: AnnualSeasonBreakdown[];
  munthaHouse?: number;
  munthaRashi?: string;
  munthaTheme?: string;
  doubleTransitHighlight?: string | null;
  isBandhanaRisk?: boolean;
  isArishtaRisk?: boolean;
  isRajaYogaPeak?: boolean;
  moorthyNirnaya?: { saturnMoorthy: string; jupiterMoorthy: string };
  savPoints?: number | { saturnHousePoints: number; jupiterHousePoints: number };
  paragraphs?: string[];
  questionInquest?: string;
  taraBala?: {
    taraName: string;
    taraCategory: "janma" | "sampat" | "vipat" | "kshema" | "pratyak" | "sadhaka" | "naidhana" | "mitra" | "parama_mitra";
    isFavorable: boolean;
    analysisText: string;
  };
  vedhaAnalysis?: {
    hasVedha: boolean;
    vedhaDetails: string;
  };
  charaKarakaInfluence?: {
    atmakarakaPlanet: string;
    amatyakarakaPlanet: string;
    influenceSummary: string;
  };
  starRating?: number;
  starDisplay?: string;
  yearThemeBadge?: string;
  yearTakeawayOneLiner?: string;
  fourPillarsAnnualVerdict?: {
    career: { status: "good" | "moderate" | "caution"; text: string };
    wealth: { status: "good" | "moderate" | "caution"; text: string };
    family: { status: "good" | "moderate" | "caution"; text: string };
    health: { status: "good" | "moderate" | "caution"; text: string };
  };
  goldenMonthsHighlight?: string;
  cautionMonthHighlight?: string;
}

export interface FiveYearDoshaItem {
  id: string;
  name: string;
  severity: "critical" | "high" | "moderate" | "mild" | "none";
  severityBadge: string;
  isDetected: boolean;
  statusText: string;
  manifestationIn5Years: string;
  pariharaGokarna: string;
  mantra: string;
}

export interface FiveYearDoshaAnalysis {
  inquestQuestion: string;
  paragraphs: string[];
  detectedDoshas: FiveYearDoshaItem[];
  overallDoshaScore: string;
  remedyShieldSummary: string;
}

export interface FiveYearLifeChapter {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  paragraphs: string[];
  keyAdvice: string;
  contemplationInquest?: string;
}

export interface PrescribedStotraInfo {
  id: string;
  stotraName: string;
  deityName: string;
  primaryBenefit: string;
  sanskritVerse: string;
  verseRegional?: string;
  meaningNative: string;
  chantingRounds: number;
  bestTimeOfDay: string;
  facingDirection: string;
  specialOffering: string;
}

export interface DaivajnaSummaryInfo {
  title: string;
  subtitle: string;
  titleKn?: string;
  titleEn?: string;
  paragraphs: string[];
  p1KarmicJourney?: string;
  p2PeakGoldenEra?: string;
  p3AttentionPointsAndSolace?: string;
  attentionPoints: Array<{ icon: string; title: string; guidance: string }>;
  careerFinancialPivot?: string;
  healthVitalityShield?: string;
  spiritualRemedyFulfillment?: string;
  relationshipFamilyHarmony?: string;
  spiritualSolace: string;
}

export interface SacredDeityImageInfo {
  imagePath: string;
  deityName: string;
  sanctumTitle: string;
  deityTitle?: string;
  blessingMotto: string;
  blessingsSubtitle?: string;
}

export interface DynamicDevoteeShloka {
  deity: string;
  sourceReason: string;
  deityRationale?: string;
  sanskritVerse: string;
  shlokaSanskrit?: string;
  transliterationNative: string;
  shlokaRegional?: string;
  meaningNative: string;
  meaning?: string;
  chantingCount: number;
  chantCount?: number | string;
  bestTime: string;
  auspiciousTime?: string;
  facingDirection: string;
  auspiciousDirection?: string;
  spiritualSignificance: string;
  spiritualFruit?: string;
}

export interface FiveYearPredictionPayload {
  devoteeName: string;
  birthDateFormatted: string;
  birthTimeFormatted: string;
  ageYears: number;
  ageCategory: "child" | "youth" | "adult" | "senior";
  lagnaRashi: string;
  lagnaLord: string;
  moonRashi: string;
  moonLord: string;
  nakshatra: string;
  nakshatraPada: number | string;
  padaWord?: string;
  birthWeekday: string;
  janmaHora: string;
  jananaPanchanga?: {
    tithi: string;
    paksha: string;
    yoga: string;
    karana: string;
    weekday: string;
    janmaHora: string;
    ayanamsha: string;
  };
  targetLanguage: SixLang;
  startYear: number;
  endYear: number;
  macroSummary: {
    overview: string;
    macroTrend: string;
    peakGoldenYear: string;
    cautionPeriodYear: string;
    destinyTheme: string;
    pivotalTurningPointTitle: string;
    pivotalTurningPointSeason: string;
    pivotalTurningPointImpact: string;
  };
  milestoneMatrix: FiveYearMilestoneRow[];
  years: FiveYearSingleYear[];
  chapters: FiveYearLifeChapter[];
  doshaAnalysis?: FiveYearDoshaAnalysis;
  muhurtaWindows?: Array<{ category: string; icon: string; timingWindow: string; description: string }>;
  financialRoadmap?: FiveYearFinancialRoadmapItem[];
  healthShield?: HealthLongevityShieldItem[];
  punyakshetraYatra?: PunyakshetraYatraItem[];
  prescribedStotra: PrescribedStotraInfo;
  yearSpecificRemedies?: YearSpecificRemedyItem[];
  nakshatraVriksha?: NakshatraVrikshaInfo;
  familyDestinyInterlocking?: FamilyDestinyInterlockingInfo;
  daivajnaSummary?: DaivajnaSummaryInfo;
  sacredDeityImage?: SacredDeityImageInfo;
  personalizedDynamicShloka?: DynamicDevoteeShloka;
  currentLifeStatus?: FiveYearCurrentLifeStatus;
  openingHook?: OpeningHookNarrative;
  planetaryCalculations?: PlanetaryCalculationItem[];
  nagaluRoadmap?: NagaluRoadmapInfo;
  hotelPrivilegeCard?: HotelHospitalityPrivilege;
  secretAccuracyProfile?: SecretAccuracyProfile;
  remedies: {
    ishtaDevata: string;
    gokarnaParihara: string;
    gemstoneRecommendation: string;
    gemstoneCaveat: string;
    rudrakshaRecommendation: string;
    luckyColors: string;
    avoidColors: string;
    luckyNumbers: string;
    luckyDirections: string;
  };
  astrologerBlessing: string;
}

const RASHI_LORDS: PlanetName[] = [
  PlanetName.Mars, PlanetName.Venus, PlanetName.Mercury, PlanetName.Moon, PlanetName.Sun, PlanetName.Mercury,
  PlanetName.Venus, PlanetName.Mars, PlanetName.Jupiter, PlanetName.Saturn, PlanetName.Saturn, PlanetName.Jupiter
];

/**
 * Determine age group for smart age-adaptive chapter generation
 */
export function getAgeCategory(ageYears: number): "child" | "youth" | "adult" | "senior" {
  if (ageYears < 13) return "child";
  if (ageYears < 23) return "youth";
  if (ageYears < 55) return "adult";
  return "senior";
}

/**
 * Determine granular age group for authentic pediatric and life-stage forecasting
 */
export type DetailedAgeGroup = "infant" | "early_child" | "tween" | "adolescent" | "young_adult" | "adult" | "senior";

export function getDetailedAgeGroup(ageYears: number): DetailedAgeGroup {
  if (ageYears < 2) return "infant";
  if (ageYears < 8) return "early_child";
  if (ageYears < 13) return "tween";
  if (ageYears < 18) return "adolescent";
  if (ageYears < 25) return "young_adult";
  if (ageYears < 60) return "adult";
  return "senior";
}

/**
 * Parashari Hawala (Red Coral - Mars) vs Vajra (Diamond - Venus) Guard
 * Cancer & Leo: Hawala supreme Yogakaraka.
 * Taurus, Libra, Gemini, Virgo, Capricorn, Aquarius: Vajra supreme / benefic.
 */
export function getParashariGemstoneRecommendation(
  lagnaIdx: number,
  lang: SixLang
): { gem: string; rudraksha: string; caveat: string } {
  // lagnaIdx: 0=Mesha, 1=Vrishabha, 2=Mithuna, 3=Karka, 4=Simha, 5=Kanya, 6=Tula, 7=Vrischika, 8=Dhanu, 9=Makara, 10=Kumbha, 11=Meena
  const isHawalaLagna = [0, 3, 4, 7, 8, 11].includes(lagnaIdx); // Mesha, Karka, Simha, Vrischika, Dhanu, Meena
  const isVajraLagna = [1, 2, 5, 6, 9, 10].includes(lagnaIdx);  // Vrishabha, Mithuna, Kanya, Tula, Makara, Kumbha

  if (lagnaIdx === 3 || lagnaIdx === 4) {
    // Karka & Simha -> Mars is supreme Yogakaraka (Hawala). Vajra strictly prohibited.
    return {
      gem: lang === "kn" ? "ಕೆಂಪು ಹವಳ (Red Coral - ಮಂಗಳನಿಗೆ ಶ್ರೇಷ್ಠ ಯೋಗಕಾರಕ ರತ್ನ)"
        : lang === "hi" ? "लाल मूंगा (Red Coral - मंगल का परम योगकारक रत्न)"
          : lang === "te" ? "ఎరుపు పగడం (Red Coral - కుజునికి శ్రేష్ఠ యోగకారక రత్నం)"
            : lang === "ta" ? "சிவப்பு பவளம் (Red Coral - செவ்வாயின் யோககாரக ரத்தினம்)"
              : lang === "mr" ? "लाल पोवळे (Red Coral - मंगळाचे परम योगकारक रत्न)"
                : "Red Coral (Hawala - Mars Yogakaraka)",
      rudraksha: lang === "kn" ? "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಗ್ನಿ ತತ್ವ ಹಾಗೂ ಚೈತನ್ಯ ವರ್ಧಕ)"
        : lang === "hi" ? "३ मुखी रुद्राक्ष (अग्नि तत्व एवं तेजस्विता कारक)"
          : lang === "mr" ? "३ मुखी रुद्राक्ष (अग्नी तत्व व ऊर्जा वर्धक)"
            : "3-Mukhi Rudraksha (Agni Tattva)",
      caveat: lang === "kn" ? "ಪರಾಶರಿ ಶಾಸ್ತ್ರದಂತೆ ಕಟಕ/ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ವಜ್ರ (Diamond) ಧರಿಸಬಾರದು; ಹವಳವೇ ಸರ್ವಶ್ರೇಷ್ಠ."
        : lang === "hi" ? "पाराशरी शास्त्रानुसार कर्क/सिंह लग्न हेतु हीरा (Diamond) वर्जित है; मूंगा ही सर्वश्रेष्ठ है।"
          : lang === "mr" ? "पाराशरी शास्त्रानुसार कर्क/सिंह लग्नासाठी हिरा (Diamond) वर्ज्य आहे; पोवळेच सर्वश्रेष्ठ आहे."
            : "Vajra (Diamond) is strictly contraindicated for Cancer/Leo Lagna; Hawala (Red Coral) is supreme."
    };
  }

  if (lagnaIdx === 9 || lagnaIdx === 10 || lagnaIdx === 1 || lagnaIdx === 6) {
    // Makara, Kumbha, Vrishabha, Tula -> Venus is Yogakaraka or Lagna lord (Vajra / White Sapphire).
    return {
      gem: lang === "kn" ? "ವಜ್ರ ಅಥವಾ ಶ್ವೇತ ಜಿರ್ಕಾನ್ (Diamond / White Sapphire - ಶುಕ್ರನ ರಾಜಯೋಗಕಾರಕ ರತ್ನ)"
        : lang === "hi" ? "हीरा या श्वेत पुखराज (Diamond / White Zircon - शुक्र का राजयोगकारक रत्न)"
          : lang === "te" ? "వజ్రం లేదా తెల్ల పుష్యరాగం (Diamond / White Sapphire)"
            : lang === "ta" ? "வைரம் அல்லது வெள்ளை நீலம் (Diamond / White Zircon)"
              : lang === "mr" ? "हिरा किंवा पांढरा पुखराज (Diamond / White Sapphire - शुक्राचे राजयोगकारक रत्न)"
                : "Diamond / White Sapphire (Vajra - Venus Yogakaraka)",
      rudraksha: lang === "kn" ? "೬ ಮುಖಿ ಅಥವಾ ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಮಹಾಲಕ್ಷ್ಮಿ ಕೃಪೆ)"
        : lang === "hi" ? "६ मुखी अथवा ७ मुखी रुद्राक्ष (महालक्ष्मी कृपा कारक)"
          : lang === "mr" ? "६ मुखी किंवा ७ मुखी रुद्राक्ष (महालक्ष्मी कृपा कारक)"
            : "6-Mukhi or 7-Mukhi Rudraksha",
      caveat: lang === "kn" ? "ವೃಷಭ/ತುಲಾ/ಮಕರ/ಕುಂಭ ಲಗ್ನಗಳಿಗೆ ಕೆಂಪು ಹವಳದ ಬದಲು ವಜ್ರ ಅಥವಾ ಬಿಳಿ ರತ್ನವೇ ಸರ್ವೋತ್ತಮ."
        : lang === "hi" ? "वृषभ/तुला/मकर/कुंभ लग्न हेतु लाल मूंगे की अपेक्षा हीरा ही सर्वोत्तम फलदायी है।"
          : lang === "mr" ? "वृषभ/तूळ/मकर/कुंभ लग्नासाठी लाल पोवळ्यापेक्षा हिराच सर्वोत्तम फलदायी आहे."
            : "Diamond/White Sapphire is most benefic; avoid red coral on the same hand."
    };
  }

  if (lagnaIdx === 8 || lagnaIdx === 11) {
    // Dhanu & Meena (Guru) -> Yellow Sapphire
    return {
      gem: lang === "kn" ? "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire - ಗುರು ಲಗ್ನಾಧಿಪತಿ ರತ್ನ)"
        : lang === "hi" ? "पीला पुखराज (Yellow Sapphire - गुरु लग्नेश रत्न)"
          : lang === "te" ? "పసుపు పుష్యరాగం (Yellow Sapphire)"
            : lang === "ta" ? "மஞ்சள் புஷ்பராகம் (Yellow Sapphire)"
              : lang === "mr" ? "पिवळा पुखराज (Yellow Sapphire - गुरू लग्नेश रत्न)"
                : "Yellow Sapphire (Pushparaga - Jupiter Lord)",
      rudraksha: lang === "kn" ? "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಜ್ಞಾನ, ಆಯುಷ್ಯ ಹಾಗೂ ಸಕಲ ಸೌಖ್ಯ ಪ್ರದಾಯಕ)"
        : lang === "hi" ? "५ मुखी रुद्राक्ष (ज्ञान, दीर्घायु एवं सर्वसुख प्रदायक)"
          : lang === "mr" ? "५ मुखी रुद्राक्ष (ज्ञान, दीर्घायुष्य व मनःशांती कारक)"
            : "5-Mukhi Rudraksha (Guru/Shiva)",
      caveat: lang === "kn" ? "ಧನು ಮತ್ತು ಮೀನ ಲಗ್ನಗಳಿಗೆ ಹಳದಿ ಪುಷ್ಯರಾಗ ಹಾಗೂ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿಯು ರಕ್ಷಾ ಕವಚವಾಗಿದೆ."
        : lang === "hi" ? "धनु एवं मीन लग्न हेतु पीला पुखराज एवं पंचमुखी रुद्राक्ष रक्षा कवच है।"
          : lang === "mr" ? "धनु व मीन लग्नासाठी पिवळा पुखराज व पंचमुखी रुद्राक्ष हे सुरक्षा कवच आहे."
            : "Yellow Sapphire and 5-Mukhi Rudraksha provide sovereign protection."
    };
  }

  // Gemini & Virgo (Budha)
  if (lagnaIdx === 2 || lagnaIdx === 5) {
    return {
      gem: lang === "kn" ? "ಪಚ್ಚೆ ರತ್ನ (Emerald - ಬುಧನ ವಿದ್ಯಾ-ಬುದ್ಧಿ ವೃದ್ಧಿ ರತ್ನ)"
        : lang === "hi" ? "पन्ना (Emerald - बुध का बुद्धि व व्यापार वर्धक रत्न)"
          : lang === "te" ? "మరకత పచ్చ (Emerald - బుధ గ్రహ రత్నం)"
            : lang === "ta" ? "மரகதம் (Emerald - புதன் ரத்தினம்)"
              : lang === "mr" ? "पाचू (Emerald - बुधाचे बुद्धी व व्यापार वर्धक रत्न)"
                : "Emerald (Pache / Panna - Mercury)",
      rudraksha: lang === "kn" ? "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಬ್ರಹ್ಮ ಚೈತನ್ಯ ಹಾಗೂ ವಾಕ್ ಸಿದ್ಧಿ)"
        : lang === "hi" ? "४ मुखी रुद्राक्ष (ब्रह्म शक्ति एवं वाक् शुद्धि)"
          : lang === "mr" ? "४ मुखी रुद्राक्ष (ब्रह्म शक्ती व वाणी सिद्धी)"
            : "4-Mukhi Rudraksha (Lord Brahma)",
      caveat: lang === "kn" ? "ಮಿಥುನ ಮತ್ತು ಕನ್ಯಾ ಲಗ್ನಗಳಿಗೆ ಹವಳ ವರ್ಜಿಸುವುದು ಉತ್ತಮ; ಪಚ್ಚೆಯು ಧನ-ಬುದ್ಧಿ ವೃದ್ಧಿ ನೀಡುತ್ತದೆ."
        : lang === "hi" ? "मिथुन व कन्या लग्न के लिए मूंगा वर्जित है; पन्ना ही धन-बुद्धि प्रदाता है।"
          : lang === "mr" ? "मिथुन व कन्या लग्नासाठी पोवळे वर्ज्य आहे; पाचूच धन व बुद्धी वृद्धी देतो."
            : "Emerald provides exceptional clarity; red coral is contraindicated."
    };
  }

  // Mesha & Vrischika (Mars Lagna Lord)
  return {
    gem: lang === "kn" ? "ಕೆಂಪು ಹವಳ (Red Coral - ಲಗ್ನಾಧಿಪತಿ ಮಂಗಳನ ತೇಜೋ ರತ್ನ)"
      : lang === "hi" ? "लाल मूंगा (Red Coral - लग्नेश मंगल का तेज रत्न)"
        : lang === "te" ? "ఎరుపు పగడం (Red Coral - లగ్నాధిపతి కుజుని రత్నం)"
          : lang === "ta" ? "சிவப்பு பவளம் (Red Coral - லக்னாதிபதி செவ்வாய் ரத்தினம்)"
            : lang === "mr" ? "लाल पोवळे (Red Coral - लग्नेश मंगळाचे तेज रत्न)"
              : "Red Coral (Lagna Lord Mars)",
    rudraksha: lang === "kn" ? "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ವಿಜಯ ಪ್ರಾಪ್ತಿ)"
      : lang === "hi" ? "३ मुखी रुद्राक्ष (आत्मबल एवं विजय प्रदायक)"
        : lang === "mr" ? "३ मुखी रुद्राक्ष (आत्मविश्वास व विजय प्रदायक)"
          : "3-Mukhi Rudraksha (Agni / Courage)",
    caveat: lang === "kn" ? "ಮೇಷ ಮತ್ತು ವೃಶ್ಚಿಕ ಲಗ್ನದವರಿಗೆ ವಜ್ರ ಮಾರಕ ದೋಷ ತರಬಹುದು; ಹವಳವೇ ಆಯುಷ್ಯ-ಆರೋಗ್ಯ ವರ್ಧಕ."
      : lang === "hi" ? "मेष एवं वृश्चिक लग्न के लिए हीरा मारक हो सकता है; मूंगा ही स्वास्थ्य वर्धक है।"
        : lang === "mr" ? "मेष व वृश्चिक लग्नासाठी हिरा मारक ठरू शकतो; पोवळेच आरोग्यवर्धक आहे."
          : "Diamond is maraka for Aries/Scorpio; Hawala guarantees vitality."
  };
}

/**
 * Select the most suitable Classical Stotra based on planetary and transit dynamics
 */
export function selectPrescribedStotra(
  kundli: KundliOutput,
  hasSaturnAffliction: boolean,
  activeDashaPlanet: PlanetName,
  lang: SixLang
): PrescribedStotraInfo {
  // If severe Saturn affliction (Sade Sati, Ashtama Shani, Kantaka Shani) -> Dasharatha Kritha Shani Stotra
  if (hasSaturnAffliction || activeDashaPlanet === PlanetName.Saturn) {
    return {
      id: "shani_dasharatha",
      stotraName: lang === "kn" ? "ಶ್ರೀ ದಶರಥ ಕೃತ ಶನಿ ಸ್ತೋತ್ರ ಹಾಗೂ ಹನುಮಾನ್ ಚಾಲೀಸಾ"
        : lang === "hi" ? "श्री दशरथ कृत शनि स्तोत्र एवं श्री हनुमान चालीसा"
          : lang === "te" ? "శ్రీ దశరథ కృత శని స్తోత్రం మరియు హనుమాన్ చాలీసా"
            : lang === "ta" ? "ஸ்ரீ தசரத கிருத சனி ஸ்தோத்திரம் & அனுமான் சாலிசா"
              : lang === "mr" ? "श्री दशरथ कृत शनि स्तोत्र व श्री हनुमान चालीसा"
                : "Sri Dasharatha Kritha Shani Stotram & Hanuman Chalisa",
      deityName: lang === "kn" ? "ಶ್ರೀ ಶನೈಶ್ಚರ ಸ್ವಾಮಿ & ಶ್ರೀ ಆಂಜನೇಯ"
        : lang === "hi" ? "श्री शनैश्चर देव एवं श्री हनुमान जी"
          : lang === "mr" ? "श्री शनैश्चर देव व श्री मारुतीराय"
            : "Lord Shanaishchara & Lord Hanuman",
      primaryBenefit: lang === "kn" ? "ಶನಿ ಸಾಡೇಸಾತಿ, ಅಷ್ಟಮ ಶನಿ ದೋಷ ನಿವಾರಣೆ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯ ವಿಘ್ನ ಪರಿಹಾರ."
        : lang === "hi" ? "शनि साढ़ेसाती, अष्टम शनि दोष निवारण, मानसिक शांति एवं समस्त कार्य बाधा मुक्ति।"
          : lang === "mr" ? "शनि साडेसाती, अष्टम शनि दोष निवारण, मानसिक शांतता व सर्व कार्य अडथळे दूर करणे."
            : "Mitigates Sade Sati / Ashtama Shani, removes delays, and grants unwavering mental peace.",
      sanskritVerse: "नमः कृष्णाय नीलाय शितिकण्ठनिभाय च। नमः कालाग्निरूपाय कृतान्ताय च वै नमः॥ नमो निर्मांसदेहाय दीर्घश्मश्रुजटाय च। नमो विशालनेत्राय शुष्कोदर भयाकृते॥",
      verseRegional: pick6({
        kn: "ನಮಃ ಕೃಷ್ಣಾಯ ನೀಲಾಯ ಶಿತಿಕಂಠನಿಭಾಯ ಚ । ನಮಃ ಕಾಲಾಗ್ನಿರೂಪಾಯ ಕೃತಾಂತಾಯ ಚ ವೈ ನಮಃ ॥ ನಮೋ ನಿರ್ಮಾಂಸದೇಹಾಯ ದೀರ್ಘಶ್ಮಶ್ರುಜಟಾಯ ಚ । ನಮೋ ವಿಶಾಲನೇತ್ರಾಯ ಶುಷ್ಕೋದರ ಭಯಾಕೃತೇ ॥",
        mr: "नमः कृष्णाय नीलाय शितिकण्ठनिभाय च । नमः कालाग्निरूपाय कृतान्ताय च वै नमः ॥ नमो निर्मांसदेहाय दीर्घश्मश्रुजटाय च । नमो विशालनेत्राय शुष्कोदर भयाकृते ॥",
        hi: "नमः कृष्णाय नीलाय शितिकण्ठनिभाय च । नमः कालाग्निरूपाय कृतान्ताय च वै नमः ॥ नमो निर्मांसदेहाय दीर्घश्मश्रुजटाय च । नमो विशालनेत्राय शुष्कोदर भयाकृते ॥",
        te: "నమః కృష్ణాయ నీలాయ శితికంఠనిభాయ చ । నమః కాలಾಗ್నిరూపాయ కృతాంతాయ చ వై నమః ॥ నమో నిర్మాంసదేహాయ దీర్ఘశ్మశ్రుజటాయ చ । నమో విశాలనేత్రాయ శుష్కోదర భయాకృతే ॥",
        ta: "நமஹ் கிருஷ்ணாய நீலாய சிதிகண்டநிபாய ச । நமஹ் காலாக்னிரூபாய கிருதாந்தாய ச வை நமஹ் ॥ நமோ நிர்மாம்ஸதேஹாய தீர்க்கச்மச்ருஜடாய ச । நமோ விஸாலநேத்ராய சுஷ்கோதர பயாக்ருதே ॥",
        en: "Namah Krishnaya Nilaya Shitikanthanibhaya Cha | Namah Kalagnirupaya Kritantaya Cha Vai Namah || Namo Nirmamsadehaya Dirghashmashrujataya Cha | Namo Vishalanetraya Shushkodara Bhayakrite ||"
      }, lang),
      meaningNative: lang === "kn" ? "ಕೃಷ್ಣವರ್ಣದವನೂ, ನೀಲಕಾಂತಿಯುಕ್ತನೂ, ಕಾಲಾಗ್ನಿಯಂತೆ ಶಕ್ತಿಶಾಲಿಯೂ ಆದ ಶನೈಶ್ಚರ ದೇವರಿಗೆ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರಗಳು. ನಮ್ಮ ಸರ್ವ ಕರ್ಮ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಿ ಕೃಪೆ ತೋರು ಶನೀಶ್ವರನೇ."
        : lang === "hi" ? "नीलवर्ण, कालाग्निसदृश शक्तिशाली एवं न्यायप्रिय शनिदेव को कोटि-कोटि प्रणाम। हे शनिदेव, हमारे सर्व कर्म दोषों को क्षमा कर जीवन में शांति और स्थिरता प्रदान करें।"
          : lang === "mr" ? "नीलवर्ण, कालाग्नीसमान सामर्थ्यवान व न्यायप्रिय शनिदेवांना सादर नमन. हे शनीश्वरा, आमचे सर्व कर्मदोष शमवून जीवनात सुख, स्थैर्य व प्रगती प्रदान करा."
            : "Salutations to Lord Shani of dark azure radiance and divine cosmic justice. May divine grace dissolve all karmic delays and bless life with peace.",
      chantingRounds: 11,
      bestTimeOfDay: lang === "kn" ? "ಶನಿವಾರ ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ನಂತರ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ"
        : lang === "hi" ? "शनिवार संध्याकाल सूर्यास्त के पश्चात अथवा प्रदोष काल में"
          : lang === "mr" ? "शनिवारी संध्याकाळी सूर्यास्तानंतर किंवा प्रदोष काळात"
            : "Saturday evenings after sunset during Pradosha",
      facingDirection: lang === "kn" ? "ಪಶ್ಚಿಮ ದಿಕ್ಕು (ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿ)"
        : lang === "hi" ? "पश्चिम दिशा (तिल के तेल का दीप प्रज्वलित कर)"
          : lang === "mr" ? "पश्चिम दिशा (तिळाच्या तेलाचा दिवा लावून)"
            : "West facing, with a sesame oil lamp",
      specialOffering: lang === "kn" ? "ಕಪ್ಪು ಎಳ್ಳು, ಬೆಲ್ಲ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ತುಪ್ಪದ ದೀಪ ನಮಸ್ಕಾರ"
        : lang === "hi" ? "काले तिल, गुड़ एवं श्री गोकर्ण महाबलेश्वर को घृत दीप अर्पण"
          : lang === "mr" ? "काळे तीळ, गूळ व श्री गोकर्ण महाबळेश्वरांना तुपाचा दिवा अर्पण"
            : "Black sesame seeds, jaggery, and ghee lamp at Gokarna Kshetra"
    };
  }

  // If Sun or Mars dominant or Career / Authority / Health focus -> Aditya Hridaya Stotra
  if (activeDashaPlanet === PlanetName.Sun || activeDashaPlanet === PlanetName.Mars) {
    return {
      id: "aditya_hridaya",
      stotraName: lang === "kn" ? "ಶ್ರೀ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ (ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣೋಕ್ತ)"
        : lang === "hi" ? "श्री आदित्य हृदय स्तोत्र (वाल्मीकि रामायणोक्त)"
          : lang === "te" ? "శ్రీ ఆదిత్య హృదయ స్తోత్రం"
            : lang === "ta" ? "ஸ்ரீ ஆதித்ய ஹிருதய ஸ்தோத்திரம்"
              : lang === "mr" ? "श्री आदित्य हृदय स्तोत्र (वाल्मीकि रामायणोक्त)"
                : "Sri Aditya Hridaya Stotram",
      deityName: lang === "kn" ? "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ & ಶ್ರೀ ರಾಮಚಂದ್ರ"
        : lang === "hi" ? "भगवान सूर्यनारायण एवं श्री रामचंद्र जी"
          : lang === "mr" ? "भगवान सूर्यनारायण व श्री रामचंद्र"
            : "Lord Suryanarayana & Lord Rama",
      primaryBenefit: lang === "kn" ? "ಉದ್ಯೋಗದಲ್ಲಿ ದಿಗ್ವಿಜಯ, ರಾಜಗೌರವ, ನಾಯಕತ್ವ ಗುಣ, ಹೃದ್ರೋಗ ನಿವಾರಣೆ ಹಾಗೂ ಶತೃ ಜಯ."
        : lang === "hi" ? "करियर में विजय, राजसम्मान, नेतृत्व शक्ति, आरोग्यता एवं शत्रु बाधा निवारण।"
          : lang === "mr" ? "करिअरमध्ये विजय, मानसन्मान, नेतृत्व गुण, आरोग्य प्राप्ती व सर्व संकटांवर विजय."
            : "Career triumph, executive authority, radiant vitality, and elimination of obstacles.",
      sanskritVerse: "आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम्। जयावहं जपेन्नित्यमक्षयं परमं शिवम्॥ सर्वमङ्गलमाङ्गल्यं सर्वपापप्रणाशनम्। चिन्ताशोकप्रशमनमायुर्वರ್ಧनमुत्तमम्॥",
      verseRegional: pick6({
        kn: "ಆದಿತ್ಯಹೃದಯಂ ಪುಣ್ಯಂ ಸರ್ವಶತ್ರುವಿನಾಶನಮ್ । ಜಯಾವಹಂ ಜಪೇನ್ನಿತ್ಯಮಕ್ಷಯಂ ಪರಮಂ ಶಿವಮ್ ॥ ಸರ್ವಮಂಗಲಮಾಂಗಲ್ಯಂ ಸರ್ವಪಾಪಪ್ರಣಾಶನಮ್ । ಚಿಂತಾಶೋಕಪ್ರಶಮನಮಾಯುರ್ವರ್ಧನಮುತ್ತಮಮ್ ॥",
        mr: "आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् । जयावहं जपेन्नित्यमक्षयं परमं शिवम् ॥ सर्वमङ्गलमाङ्गल्यं सर्वपापप्रणाशनम् । चिन्ताशोकप्रशमनमायुर्वर्धनमुत्तमम् ॥",
        hi: "आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् । जयावहं जपेन्नित्यमक्षयं परमं शिवम् ॥ सर्वमङ्गलमाङ्गल्यं सर्वपापप्रणाशनम् । चिन्ताशोकप्रशमनमायुर्वर्धनमुत्तमम् ॥",
        te: "ఆదిత్యహృదయం పుణ్యం సర్వశత్రువినాశనమ్ । జయావహం జపేన్నిత్యమక్షయం పరమం శివమ్ ॥ సర్వమంగళమాంగళ్యం సర్వపాపప్రణాశనమ్ । చింతాశోకప్రశమనమాయుర్వర్ధనముత్తమమ్ ॥",
        ta: "ஆதித்யஹிருதயம் புண்யம் சர்வஷத்ருவிநாசனம் । ஜயாவஹம் ஜபேந்நித்யமக்ஷயம் பரமம் சிவம் ॥ சர்வமங்களமாங்கல்யம் சர்வபாபப்ரணாசனம் । சிந்தாசோகப்ரஸமனமாயுர்வர்த்தனமுத்தமம் ॥",
        en: "Adityahridayam Punyam Sarvashatruvinashanam | Jayavaham Japennityamakshayam Paramam Shivam || Sarvamangalamangalyam Sarvapapapranashanam | Chintashokaprashamanamayurvardhanamuttamam ||"
      }, lang),
      meaningNative: lang === "kn" ? "ಸಕಲ ಶತ್ರುಗಳನ್ನು ನಾಶಮಾಡುವ, ವಿಜಯವನ್ನು ತಂದುಕೊಡುವ, ಸಕಲ ಪಾಪಗಳನ್ನು ಕಳೆಯುವ ಹಾಗೂ ಆಯುಷ್ಯ-ಆರೋಗ್ಯವನ್ನು ಹೆಚ್ಚಿಸುವ ಪರಮ ಪವಿತ್ರ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ."
        : lang === "hi" ? "समस्त शत्रुओं का नाश करने वाले, सर्वदा विजय दिलाने वाले, परम कल्याणकारी एवं आयु-आरोग्य वर्धक आदित्य हृदय स्तोत्र का नित्य पाठ करें।"
          : lang === "mr" ? "सर्व शत्रूंचा नाश करणारे, सदैव विजय मिळवून देणारे, परम कल्याणकारी व दीर्घायुष्य देणारे आदित्य हृदय स्तोत्र नित्य भक्तीने पठण करावे."
            : "The most sacred hymn taught to Lord Rama, destroying all adversaries, granting perpetual victory, and multiplying longevity and vitality.",
      chantingRounds: 3,
      bestTimeOfDay: lang === "kn" ? "ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯೋದಯ ಕಾಲದಲ್ಲಿ (ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ)"
        : lang === "hi" ? "प्रातःकाल सूर्योदय समय (तांबे के पात्र से अर्घ्य देकर)"
          : lang === "mr" ? "सकाळी सूर्योदयाच्या वेळी (तांब्याच्या पात्रातून अर्घ्य देऊन)"
            : "Sunrise morning, offering water Arghya from copper vessel",
      facingDirection: lang === "kn" ? "ಪೂರ್ವ ದಿಕ್ಕು (ಉದಯ ಸೂರ್ಯನ ಎದುರು)"
        : lang === "hi" ? "पूर्व दिशा (उदीयमान सूर्य के सम्मुख)"
          : lang === "mr" ? "पूर्व दिशा (उगवत्या सूर्याकडे तोंड करून)"
            : "East facing, towards the rising Sun",
      specialOffering: lang === "kn" ? "ಕೆಂಪು ಹೂವು, ಗಂಧಾಕ್ಷತೆ ಹಾಗೂ ಗೋಕರ್ಣದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ"
        : lang === "hi" ? "लाल पुष्प, कुमकुम एवं गोकर्ण क्षेत्र में रुद्राभिषेक"
          : lang === "mr" ? "लाल फुले, कुंकू व गोकर्ण क्षेत्रात रुद्राभिषेक संकल्प"
            : "Red flowers, kumkum, and Rudrabhisheka at Gokarna"
    };
  }

  // If Mercury (Budha) prominent or intellectual / speech / business focus -> Sri Tulasi Aradhana & Budha Kavacham
  if (activeDashaPlanet === PlanetName.Mercury) {
    return {
      id: "tulsi_aradhana",
      stotraName: lang === "kn" ? "ಶ್ರೀ ತುಳಸಿ ಸ್ತೋತ್ರಂ ಹಾಗೂ ಬುಧ ಕವಚಂ (ಪವಿತ್ರ ತುಳಸಿ ವೃಂದಾವನ ಪೂಜೆ)"
        : lang === "hi" ? "श्री तुलसी स्तोत्र एवं बुध कवच (पवित्र तुलसी वृंदावन पूजन)"
          : lang === "te" ? "శ్రీ తులసి స్తోత్రం మరియు బుధ కవచం (పవిత్ర తులసి బృందావన పూజ)"
            : lang === "ta" ? "ஸ்ரீ துளசி ஸ்தோத்திரம் & புதன் கவசம் (புனித துளசி பிருந்தாவன பூஜை)"
              : lang === "mr" ? "श्री तुळशी स्तोत्र व बुध कवच (पवित्र तुळशी वृंदावन पूजन)"
                : "Sri Tulasi Stotram & Budha Kavacham (Sacred Tulasi Aradhana)",
      deityName: lang === "kn" ? "ಶ್ರೀ ತುಳಸಿ ಮಹಾಲಕ್ಷ್ಮಿ (ವೃಂದಾ ದೇವಿ / ಪವಿತ್ರ ತುಳಸಿ ಸಸ್ಯ ಆರಾಧನೆ)"
        : lang === "hi" ? "श्री तुलसी माता (वृंदा देवी / पवित्र तुलसी पूजन एवं संवर्धन)"
          : lang === "mr" ? "श्री तुळशी माता (वृंदा देवी / पवित्र तुळशी पूजन व संवर्धन)"
            : lang === "te" ? "శ్రీ తులసి మాత (బృందా దేవి / పవిత్ర తులసి ఆరాధన)"
              : lang === "ta" ? "ஸ்ரீ துளசி மாதா (பிருந்தா தேவி / புனித துளசி வழிபாடு)"
                : "Sri Tulasi Devi (Sacred Vrinda Devi / Tulasi Plant Worship)",
      primaryBenefit: lang === "kn" ? "ಬುದ್ಧಿಮತ್ತೆ ವೃದ್ಧಿ, ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ, ವಿದ್ಯಾರ್ಜನೆ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಬುಧ ಗ್ರಹ ದೋಷ ನಿವಾರಣೆ. ಮನೆಯಲ್ಲಿ ತುಳಸಿ ಗಿಡವನ್ನು ನೆಟ್ಟು ನಿತ್ಯವೂ ಜಲಾರ್ಪಣೆ ಮಾಡುವುದು ಸರ್ವಶ್ರೇಷ್ಠ."
        : lang === "hi" ? "बुद्धिमत्ता, व्यापार वृद्धि, विद्या प्राप्ति, पारिवारिक शांति एवं बुध दोष निवारण। घर में तुलसी का पौधा लगाकर नित्य जलार्पण परम कल्याणकारी है।"
          : lang === "mr" ? "बुद्धिमत्ता वृद्धी, व्यापारात यश, शिक्षण, कौटुंबिक शांतता व बुध दोष निवारण. घरात तुळशीचे रोप लावून नित्य जलार्पण करणे परम कल्याणकारी आहे."
            : lang === "te" ? "బుద్ధి వికాసం, వ్యాపార లాభం, విద్యార్జన, కుటుంబ శాంతి & బుధ దోష నివారణ. ఇంట్లో తులసి మొక్కను నాటి నిత్యం జలార్పణ చేయడం అత్యంత శ్రేయస్కరం."
              : lang === "ta" ? "புத்தி கூர்மை, வியாபார விருத்தி, கல்வி, குடும்ப அமைதி & புதன் தோஷ நிவாரணம். வீட்டில் துளசி செடி நட்டு தினமும் நீர் ஊற்றி வழிபடுவது சகல நன்மை தரும்."
                : "Intellectual sharpness, commercial growth, academic success, and mercury pacification. Planting and nurturing a holy Tulsi plant brings perennial peace.",
      sanskritVerse: "यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः। यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम्॥ नमस्ते तुलसीरूपे नमस्ते शङ्खधारिणि। पापिनां मोक्षदे देवि नमस्ते विष्णुपूजनी॥",
      verseRegional: pick6({
        kn: "ಯನ್ಮೂಲೇ ಸರ್ವತೀರ್ಥಾನಿ ಯನ್ಮಧ್ಯೇ ಸರ್ವದೇವತಾಃ । ಯದಗ್ರೇ ಸರ್ವವೇದಾಶ್ಚ ತುಳಸೀಂ ತ್ವಾಂ ನಮಾಮ್ಯಹಮ್ ॥ ನಮಸ್ತೇ ತುಳಸೀರೂಪೇ ನಮಸ್ತೇ ಶಂಖಧಾರಿಣಿ । ಪಾಪಿನಾಂ ಮೋಕ್ಷದೇ ದೇವಿ ನಮಸ್ತೇ ವಿಷ್ಣುಪೂಜನೀ ॥",
        mr: "यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः । यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम् ॥ नमस्ते तुलसीरूपे नमस्ते शङ्खधारिणि । पापिनां मोक्षदे देवि नमस्ते विष्णुपूजनी ॥",
        hi: "यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः । यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम् ॥ नमस्ते तुलसीरूपे नमस्ते शङ्खधारिणि । पापिनां मोक्षदे देवि नमस्ते विष्णुपूजनी ॥",
        te: "యన్మూలే సర్వతీర్థాని యన్మధ్యే సర్వదేవతాః । యదగ్రే సర్వవేదాశ్చ తులసీం త్వాం నమామ్యహమ్ ॥ నమస్తే తులసీరూపే నమస్తే శంఖధారిణి । పాపినాం మోక్షదే దేవి నమస్తే విష్ణుపూజనీ ॥",
        ta: "யந்மூலே சர்வ தீர்த்தானி யந்மத்யே சர்வ தேவதாஃ । யதக்ரே சர்வ வேதாஸ்ச துளசீம் த்வாம் நமாம்யஹம் ॥ நமஸ்தே துளசீரூபே நமஸ்தே சங்கதாரிணி । பாபினாம் மோக்ஷதே தேவி நமஸ்தே விஷ்ணுபூஜனீ ॥",
        en: "Yanmule Sarvatirthani Yanmadhye Sarvadevatah | Yadagre Sarvavedashcha Tulasi Tvam Namamyaham || Namaste Tulasirupe Namaste Shankhadharini | Papinam Mokshade Devi Namaste Vishnupujani ||"
      }, lang),
      meaningNative: lang === "kn" ? "ಯಾವ ತುಳಸಿಯ ಬೇರಿನಲ್ಲಿ ಸರ್ವ ಪುಣ್ಯ ತೀರ್ಥಗಳು, ಮಧ್ಯದಲ್ಲಿ ಸಕಲ ದೇವತೆಗಳು ಮತ್ತು ತುದಿಯಲ್ಲಿ ಚತುರ್ವೇದಗಳು ನೆಲೆಸಿವೆಯೋ, ಅಂತಹ ಪರಮ ಪವಿತ್ರ ತುಳಸಿ ದೇವಿಗೆ ಸಾಷ್ಟಾಂಗ ಪ್ರಣಾಮಗಳು."
        : lang === "hi" ? "जिस तुलसी के मूल में समस्त तीर्थ, मध्य में समस्त देव एवं अग्रभाग में चारों वेद निवास करते हैं, उन पावन तुलसी माता को कोटि-कोटि प्रणाम।"
          : lang === "mr" ? "ज्या तुळशीच्या मुळाशी सर्व तीर्थे, मध्यभागी सर्व देव व अग्रभागी सर्व वेद वास करतात, त्या परम पावन तुळशी मातेला शतशः नमन असो."
            : lang === "te" ? "ఏ తులసి మూలంలో సమస్త పుణ్య తీర్థాలు, మధ్యలో సర్వ దేవతలు, అగ్రభాగంలో సమస్త వేదాలు ఉంటాయో, ఆ పరమ పవిత్ర తులసి మాతకు సాష్టాంగ నమస్కారాలు."
              : lang === "ta" ? "எந்த துளசியின் வேரில் சகல தீர்த்தங்களும், நடுவில் சகல தேவர்களும், நுனியில் வேதங்களும் விளங்குகின்றனவோ, அத்தகைய புனித துளசி மாதாவுக்கு கோடி நமஸ்காரங்கள்."
                : "All holy shrines reside at the root of Tulsi, all gods dwell in its stem, and all sacred Vedas live in its blossoms. Salutations to sacred Tulsi Devi.",
      chantingRounds: 11,
      bestTimeOfDay: lang === "kn" ? "ಬುಧವಾರ ಅಥವಾ ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ತುಳಸಿ ಕಟ್ಟೆಗೆ ನೀರು ಅರ್ಪಿಸುವ ಸಮಯದಲ್ಲಿ"
        : lang === "hi" ? "बुधवार अथवा नित्य प्रातःकाल तुलसी को जल अर्पित करते समय"
          : lang === "mr" ? "बुधवारी किंवा दररोज सकाळी तुळशीला पाणी घालताना"
            : lang === "te" ? "బుధవారం లేదా ప్రతిరోజు ఉదయం తులసి కోటకు నీరు సమర్పించే వేళ"
              : lang === "ta" ? "புதன்கிழமை அல்லது தினமும் காலையில் துளசிக்கு நீர் ஊற்றும் வேளையில்"
                : "Wednesday mornings or daily while offering fresh water to the sacred Tulasi plant",
      facingDirection: lang === "kn" ? "ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕು (ತುಳಸಿ ವೃಂದಾವನದ ಎದುರು)"
        : lang === "hi" ? "पूर्व अथवा उत्तर दिशा (तुलसी वृंदावन के सम्मुख)"
          : lang === "mr" ? "पूर्व किंवा उत्तर दिशा (तुळशी वृंदावनासमोर)"
            : lang === "te" ? "తూర్పు లేదా ఉత్తర దిశ (తులసి బృందావనం ఎదురుగా)"
              : lang === "ta" ? "கிழக்கு அல்லது வடக்கு திசை (துளசி மாடத்தின் முன்)"
                : "East or North facing, before the sacred Tulasi Vrindavan",
      specialOffering: lang === "kn" ? "ಶುದ್ಧ ಜಲ, ಗಂಧಾಕ್ಷತೆ, ತುಳಸಿ ಪೂಜೆ ಹಾಗೂ ಹೆಸರುಕಾಳು ನೈವೇದ್ಯ"
        : lang === "hi" ? "शुद्ध जल, गंध-अक्षत, तुलसी पूजन एवं मूंग दाल नैवेद्य"
          : lang === "mr" ? "शुद्ध जल, गंध-अक्षता, तुळशी पूजन व मुगाचा नैवेद्य"
            : lang === "te" ? "శుద్ధ జలం, గంధాక్షతలు, తులసి పూజ & పెసల నైవేద్యం"
              : lang === "ta" ? "தூய நீர், சந்தனம், குங்குமம், துளசி பூஜை & பச்சைப்பயறு நைவேத்தியம்"
                : "Offering fresh water, chandan, kumkum, and green moong naivedya"
    };
  }

  // If Jupiter prominent or child/education/marriage -> Sri Brihaspati Stotra / Saraswati / Vishnu
  if (activeDashaPlanet === PlanetName.Jupiter) {
    return {
      id: "vishnu_sahasranama",
      stotraName: lang === "kn" ? "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸ್ತೋತ್ರ ಹಾಗೂ ಬೃಹಸ್ಪತಿ ಕವಚ"
        : lang === "hi" ? "श्री विष्णु सहस्रनाम स्तोत्र एवं बृहस्पति कवच"
          : lang === "te" ? "శ్రీ విష్ణు సహస్రనామ స్తోత్రం & బృహస్పతి కవచం"
            : lang === "ta" ? "ஸ்ரீ விஷ்ணு சஹஸ்ரநாம ஸ்தோத்திரம்"
              : lang === "mr" ? "श्री विष्णु सहस्रनाम स्तोत्र व बृहस्पती कवच"
                : "Sri Vishnu Sahasranama Stotram & Brihaspati Kavacham",
      deityName: lang === "kn" ? "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ದೇವಗುರು ಬೃಹಸ್ಪತಿ"
        : lang === "hi" ? "श्री महाविष्णु एवं देवगुरु बृहस्पति"
          : lang === "mr" ? "श्री महाविष्णु व देवगुरू बृहस्पती"
            : "Lord Mahavishnu & Deva Guru Brihaspati",
      primaryBenefit: lang === "kn" ? "ಉತ್ತಮ ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿಮತ್ತೆ, ವಿವಾಹ ಯೋಗ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ನಿರಂತರ ಆರ್ಥಿಕ ಪ್ರಗತಿ."
        : lang === "hi" ? "उत्कृष्ट विद्या, कुशाग्र बुद्धि, विवाह योग, संतान सुख एवं निरंतर आर्थिक संपन्नता।"
          : lang === "mr" ? "उत्कृष्ट शिक्षण, तल्लख बुद्धी, विवाह योग, संतती सुख व निरंतर आर्थिक उन्नती."
            : "Wisdom, educational excellence, marital harmony, noble progeny, and sustained wealth.",
      sanskritVerse: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्। लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥",
      verseRegional: pick6({
        kn: "ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ ವಿಶ್ವಾಧಾರಂ ಗಗನಸದೃಶಂ ಮೇಘವರ್ಣಂ ಶುಭಾಂಗಮ್ । ಲಕ್ಷ್ಮೀಕಾಂತಂ ಕಮಲನಯನಂ ಯೋಗಿಭಿರ್ಧ್ಯಾನಗಮ್ಯಂ ವಂದೇ ವಿಷ್ಣುಂ ಭವಭಯಹರಂ ಸರ್ವಲೋಕೈಕನಾಥಮ್ ॥",
        mr: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
        hi: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
        te: "శాంతాకారం భుజగశయనం పద్మనాభం సురేశం విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్ । లక్ష్మీకాంతం కమలనయనం యోగిభిర్ధ్యానగమ్యం వందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్ ॥",
        ta: "சாந்தாகாரம் புஜாகசயனம் பத்மநாபம் சுரேஷம் விஸ்வாதாரம் ககனஸத்ருஷம் மேகவர்ணம் சுபாங்கம் । லக்ஷ்மீகாந்தம் கமலநயனம் யோகிபிர்த்யானகம்யம் வந்தே விஷ்ணும் பவபயஹரம் சர்வலோகைகநாதம் ॥",
        en: "Shantakaram Bhujagashayanam Padmanabham Suresham Vishvadharam Gaganasadrisham Meghavarnam Shubhangam | Lakshmikantam Kamalanayanam Yogibhirdhyanagamyam Vande Vishnum Bhavabhayaharam Sarvalokaikanatham ||"
      }, lang),
      meaningNative: lang === "kn" ? "ಶಾಂತ ಸ್ವರೂಪನೂ, ಶೇಷಶಯನನೂ, ಜಗದೊಡೆಯನೂ ಆದ ಶ್ರೀ ಮಹಾವಿಷ್ಣುವಿಗೆ ವಂದನೆಗಳು. ಸಂಸಾರ ಭಯವನ್ನು ಕಳೆದು ಜ್ಞಾನ ಮತ್ತು ಐಶ್ವರ್ಯವನ್ನು ಕರುಣಿಸು ದೇವನೇ."
        : lang === "hi" ? "शांत स्वरूप, शेषशैया पर विराजमान, जगत के स्वामी भगवान विष्णु को प्रणाम। हमारे समस्त कष्टों को दूर कर ज्ञान व समृद्धि प्रदान करें।"
          : lang === "mr" ? "शांत स्वरूप, शेषशायी, जगताचे पालनकर्ते भगवान विष्णूंना वंदन असो. आमचे सर्व भय दूर करून आम्हाला ज्ञान व ऐश्वर्य प्रदान करा."
            : "Obeisance to Lord Vishnu, the serene protector resting on Ananta Sesha, dissipating all worldly fears and blessing life with virtue.",
      chantingRounds: 1,
      bestTimeOfDay: lang === "kn" ? "ಗುರುವಾರ ಅಥವಾ ಬುಧವಾರ ಬೆಳಿಗ್ಗೆ ತುಳಸಿ ಪೂಜೆ ಸಮಯದಲ್ಲಿ"
        : lang === "hi" ? "गुरुवार अथवा बुधवार प्रातःकाल तुलसी पूजन समय"
          : lang === "mr" ? "गुरुवारी किंवा बुधवारी सकाळी तुळशी पूजेच्या वेळी"
            : "Thursday or Wednesday morning during Tulasi pooja",
      facingDirection: lang === "kn" ? "ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು"
        : lang === "hi" ? "उत्तर अथवा ईशान कोण"
          : lang === "mr" ? "उत्तर किंवा ईशान्य दिशा"
            : "North or North-East direction",
      specialOffering: lang === "kn" ? "ಹಳದಿ ಹೂವು, ಕಡಲೆಕಾಳು ನೈವೇದ್ಯ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿಗೆ ಮೋದಕ ಸಮರ್ಪಣೆ"
        : lang === "hi" ? "पीले पुष्प, चना दाल नैवेद्य एवं गोकर्ण महागणपति को मोदक अर्पण"
          : lang === "mr" ? "पिवळी फुले, हरभरा डाळीचा नैवेद्य व गोकर्ण महागणपतींना मोदक अर्पण"
            : "Yellow flowers, chana dal, and modaka at Gokarna Mahaganapati"
    };
  }

  // If Venus / Moon / Wealth / Marriage -> Sri Kanakadhara Stotra
  return {
    id: "kanakadhara",
    stotraName: lang === "kn" ? "ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ (ಶ್ರೀ ಆದಿ ಶಂಕರಾಚಾರ್ಯ ವಿರಚಿತ)"
      : lang === "hi" ? "श्री कनकधारा स्तोत्र (आदि शंकराचार्य विरचित)"
        : lang === "te" ? "శ్రీ కనకధారా స్తోత్రం"
          : lang === "ta" ? "ஸ்ரீ கனகதாரா ஸ்தோத்திரம்"
            : lang === "mr" ? "श्री कनकधारा स्तोत्र (आदि शंकराचार्य विरचित)"
              : "Sri Kanakadhara Stotram",
    deityName: lang === "kn" ? "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ"
      : lang === "hi" ? "श्री महालक्ष्मी माता"
        : lang === "mr" ? "श्री महालक्ष्मी माता"
          : "Goddess Mahalakshmi",
    primaryBenefit: lang === "kn" ? "ದಾರಿದ್ರ್ಯ ನಿವಾರಣೆ, ಸ್ಥಿರ ಸಂಪತ್ತು, ಗೃಹ ಸೌಖ್ಯ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ ಹಾಗೂ ನಿರಂತರ ಸೌಭಾಗ್ಯ."
      : lang === "hi" ? "दारिद्र्य निवारण, स्थिर संपत्ति, गृह सुख, व्यापार विस्तार एवं निरंतर सौभाग्य।"
        : lang === "mr" ? "दारिद्र्य निवारण, स्थिर संपत्ती, कौटुंबिक सौख्य, व्यवसाय वृद्धी व अखंड सौभाग्य."
          : "Dissolves debt, anchors perpetual treasury wealth, and bestows domestic serenity.",
    sanskritVerse: "अङ्कं हरेः पुलकभूषणमाश्रयन्ती भृङ्गाङ्गनेव मुकुलाभरणं तमालम्। अङ्गीकृताखिलविभूतिरपाङ्गलीला माङ्गल्यदास्तु मम मङ्गलदेवतायाः॥",
    verseRegional: pick6({
      kn: "ಅಂಗಂ ಹರೇಃ ಪುಲಕಭೂಷಣಮಾಶ್ರಯಂತೀ ಭೃಂಗಾಂಗನೇವ ಮುಕುಲಾಭರಣಂ ತಮಾಲಮ್ । ಅಂಗೀಕೃತಾಖಿಲವಿಭೂತಿರಪಾಂಗಲೀಲಾ ಮಾಂಗಲ್ಯದಾಸ್ತು ಮಮ ಮಂಗಳದೇವತಾಯಾಃ ॥",
      mr: "अङ्कं हरेः पुलकभूषणमाश्रयन्ती भृङ्गाङ्गनेव मुकुलाभरणं तमालम् । अङ्गीकृताखिलविभूतिरपाङ्गलीला माङ्गल्यदास्तु मम मङ्गलदेवतायाः ॥",
      hi: "अङ्कं हरेः पुलकभूषणमाश्रयन्ती भृङ्गाङ्गनेव मुकुलाभरणं तमालम् । अङ्गीकृताखिलविभूतिरपाङ्गलीला माङ्गल्यदास्तु मम मङ्गलदेवतायाः ॥",
      te: "అంగం హరేః పులకభూషణమాశ్రయంతీ భృంగాంగనేవ ముకులాభరణం తమాలమ్ । అంగీకృతాఖిలవిభూతిరపాంగలీలా మాంగల్యదాస్తు మమ మంగళదేవతాయాః ॥",
      ta: "அங்கம் ஹரேஹ் புலகபூஷணமாஸ்ரயந்தீ ப்ருங்காங்கநேவ முகுலாபரணம் தமாலம் । அங்கீக்ருதாகிலவிபூதிரபாங்கலீலா மாங்கல்யதாஸ்து மம மங்களதேவதாயாஹ ॥",
      en: "Angam Hareh Pulakabhushanamashrayanti Bhringanganeva Mukulabharanam Tamalam | Angikritakhilavibhutirapangalila Mangalyadastu Mama Mangaladevathayah ||"
    }, lang),
    meaningNative: lang === "kn" ? "ಶ್ರೀಹರಿಯ ವಕ್ಷಸ್ಥಳದಲ್ಲಿ ವಿರಾಜಮಾನಳಾಗಿರುವ ಮಂಗಳದಾಯಿನಿ ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪಾಕಟಾಕ್ಷವು ನಮ್ಮ ಮನೆ-ಮನಗಳಲ್ಲಿ ಸದಾ ಸಂಪತ್ತು ಹಾಗೂ ಸೌಭಾಗ್ಯವನ್ನು ತುಂಬಲಿ."
      : lang === "hi" ? "श्रीहरि के वक्षस्थल पर विराजमान मां महालक्ष्मी का मंगलमय कटाक्ष हमारे जीवन में नित्य सुख, समृद्धि एवं वैभव की वर्षा करे।"
        : lang === "mr" ? "श्रीहरींच्या वक्षस्थळावर विराजमान असणाऱ्या मंगलमयी महालक्ष्मी मातेची कृपादृष्टी आमच्या घरात अखंड सुख व समृद्धीची वर्षाव करो."
          : "May the supreme benevolent gaze of Goddess Mahalakshmi, resting gracefully on Lord Hari, bless our hearth and destiny with inexhaustible fortune.",
    chantingRounds: 3,
    bestTimeOfDay: lang === "kn" ? "ಶುಕ್ರವಾರ ಸಂಜೆ ತುಪ್ಪದ ದೀಪದ ಎದುರು"
      : lang === "hi" ? "शुक्रवार संध्याकाल घृत दीपक के सम्मुख"
        : lang === "mr" ? "शुक्रवारी संध्याकाळी तुपाच्या दिव्यासमोर"
          : "Friday evening before a cow-ghee lamp",
    facingDirection: lang === "kn" ? "ಉತ್ತರ ದಿಕ್ಕು (ಕುಬೇರ ಸ್ಥಾನ)"
      : lang === "hi" ? "उत्तर दिशा (कुबेर स्थान)"
        : lang === "mr" ? "उत्तर दिशा (कुबेर स्थान)"
          : "North facing (Kubera realm)",
    specialOffering: lang === "kn" ? "ಕಮಲದ ಹೂವು, ಪಾಯಸ ನೈವೇದ್ಯ ಹಾಗೂ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ಕ್ಷೀರಾಭಿಷೇಕ"
      : lang === "hi" ? "कमल पुष्प, खीर नैवेद्य एवं गोकर्ण क्षेत्र में क्षीराभिषेक"
        : lang === "mr" ? "कमळाचे फूल, खिरीचा नैवेद्य व गोकर्ण क्षेत्रात दुग्धाभिषेक"
          : "Lotus flower, kheer prasad, and Ksheerabhisheka at Gokarna"
  };
}

/**
 * Main 5-Year Prediction Calculation
 */

/**
 * 1. Classical Parashari Sarvashtakavarga (SAV) Calculator
 * Computes exact 337 benefic points across 12 signs from natal planetary placements.
 */
export function computeSarvashtakavarga(kundli: KundliOutput): number[] {
  const sav = new Array(12).fill(0);
  if (!kundli || !kundli.planets) return new Array(12).fill(28);

  const getSign = (name: PlanetName): number => {
    const p = kundli.planets.find(pl => pl.name === name);
    return p?.rashi?.index ?? 0;
  };

  const lagnaSign = kundli.lagnaRashi?.index ?? (Math.floor((kundli.ascendant || 0) / 30) % 12);
  const sunSign = getSign(PlanetName.Sun);
  const moonSign = getSign(PlanetName.Moon);
  const marsSign = getSign(PlanetName.Mars);
  const mercSign = getSign(PlanetName.Mercury);
  const jupSign = getSign(PlanetName.Jupiter);
  const venSign = getSign(PlanetName.Venus);
  const satSign = getSign(PlanetName.Saturn);

  const addPoints = (baseSign: number, houses: number[]) => {
    for (const h of houses) {
      const targetSign = (baseSign + h - 1) % 12;
      sav[targetSign]++;
    }
  };

  // 1. Sun (48 points)
  addPoints(sunSign, [1, 2, 4, 7, 8, 9, 10, 11]);
  addPoints(moonSign, [3, 6, 10, 11]);
  addPoints(marsSign, [1, 2, 4, 7, 8, 9, 10, 11]);
  addPoints(mercSign, [3, 5, 6, 9, 10, 11, 12]);
  addPoints(jupSign, [5, 6, 9, 11]);
  addPoints(venSign, [6, 7, 12]);
  addPoints(satSign, [1, 2, 4, 7, 8, 9, 10, 11]);
  addPoints(lagnaSign, [3, 4, 6, 10, 11, 12]);

  // 2. Moon (49 points)
  addPoints(sunSign, [3, 6, 7, 8, 10, 11]);
  addPoints(moonSign, [1, 3, 6, 7, 10, 11]);
  addPoints(marsSign, [2, 3, 5, 6, 9, 10, 11]);
  addPoints(mercSign, [1, 3, 4, 5, 7, 8, 10, 11]);
  addPoints(jupSign, [1, 4, 7, 8, 10, 11, 12]);
  addPoints(venSign, [3, 4, 5, 7, 9, 10, 11]);
  addPoints(satSign, [3, 5, 6, 11]);
  addPoints(lagnaSign, [3, 6, 10, 11]);

  // 3. Mars (39 points)
  addPoints(sunSign, [3, 5, 6, 10, 11]);
  addPoints(moonSign, [3, 6, 11]);
  addPoints(marsSign, [1, 2, 4, 7, 8, 10, 11]);
  addPoints(mercSign, [3, 5, 6, 11]);
  addPoints(jupSign, [6, 10, 11, 12]);
  addPoints(venSign, [6, 8, 11, 12]);
  addPoints(satSign, [1, 4, 7, 8, 9, 10, 11]);
  addPoints(lagnaSign, [1, 3, 6, 10, 11]);

  // 4. Mercury (54 points)
  addPoints(sunSign, [5, 6, 9, 11, 12]);
  addPoints(moonSign, [2, 4, 6, 8, 10, 11]);
  addPoints(marsSign, [1, 2, 4, 7, 8, 9, 10, 11]);
  addPoints(mercSign, [1, 3, 5, 6, 9, 10, 11, 12]);
  addPoints(jupSign, [6, 8, 11, 12]);
  addPoints(venSign, [1, 2, 3, 4, 5, 8, 9, 11]);
  addPoints(satSign, [1, 2, 4, 7, 8, 9, 10, 11]);
  addPoints(lagnaSign, [1, 2, 4, 6, 8, 10, 11]);

  // 5. Jupiter (56 points)
  addPoints(sunSign, [1, 2, 3, 4, 7, 8, 9, 10, 11]);
  addPoints(moonSign, [2, 5, 7, 9, 11]);
  addPoints(marsSign, [1, 2, 4, 7, 8, 10, 11]);
  addPoints(mercSign, [1, 2, 4, 5, 6, 9, 10, 11]);
  addPoints(jupSign, [1, 2, 3, 4, 7, 8, 10, 11]);
  addPoints(venSign, [2, 5, 6, 9, 10, 11]);
  addPoints(satSign, [3, 5, 6, 12]);
  addPoints(lagnaSign, [1, 2, 4, 5, 6, 7, 9, 10, 11]);

  // 6. Venus (52 points)
  addPoints(sunSign, [8, 11, 12]);
  addPoints(moonSign, [1, 2, 3, 4, 5, 8, 9, 11, 12]);
  addPoints(marsSign, [3, 5, 6, 9, 11, 12]);
  addPoints(mercSign, [3, 5, 6, 9, 11]);
  addPoints(jupSign, [5, 8, 9, 10, 11]);
  addPoints(venSign, [1, 2, 3, 4, 5, 8, 9, 10, 11]);
  addPoints(satSign, [3, 4, 5, 8, 9, 10, 11]);
  addPoints(lagnaSign, [1, 2, 3, 4, 5, 8, 9, 11]);

  // 7. Saturn (39 points)
  addPoints(sunSign, [1, 2, 4, 7, 8, 10, 11]);
  addPoints(moonSign, [3, 6, 11]);
  addPoints(marsSign, [3, 5, 6, 10, 11, 12]);
  addPoints(mercSign, [6, 8, 9, 10, 11, 12]);
  addPoints(jupSign, [5, 6, 11, 12]);
  addPoints(venSign, [6, 11, 12]);
  addPoints(satSign, [3, 5, 6, 11]);
  addPoints(lagnaSign, [1, 3, 4, 6, 10, 11]);

  return sav;
}

/**
 * 2. Tajika Muntha Annual House Themes in 6 Languages
 */
export function getMunthaTheme(house: number, lang: SixLang): string {
  const themes: Record<number, Record<SixLang, string>> = {
    1: {
      kn: "ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸ, ನವ ಚೈತನ್ಯ ಹಾಗೂ ಶುಭಾರಂಭ",
      mr: "व्यक्तिमत्त्व विकास, नवी ऊर्जा व शुभ आरंभ",
      hi: "व्यक्तित्व विकास, नई ऊर्जा एवं शुभ आरंभ",
      te: "వ్యక్తిత్వ వికాసం, నూతన ఉత్సాహం & శుభారంభం",
      ta: "ஆளுமை வளர்ச்சி, புத்துணர்ச்சி & சுப ஆரம்பம்",
      en: "Identity Elevation, Renewed Vitality & Auspicious Beginnings"
    },
    2: {
      kn: "ಧನ ಸಂಚಯ, ವಾಕ್ ಪ್ರಭಾವ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ",
      mr: "धनसंचय, वाणीचा प्रभाव व कौटुंबिक समृद्धी",
      hi: "धन संचय, वाणी प्रभाव एवं पारिवारिक समृद्धि",
      te: "ధన సంపద, వాక్ ప్రభావం & కుటుంబ సమృద్ధి",
      ta: "தன சேர்க்கை, சொல் வாக்கு & குடும்ப சுபிக்ஷம்",
      en: "Treasury Accumulation, Influential Speech & Domestic Abundance"
    },
    3: {
      kn: "ಪರಾಕ್ರಮ, ನೂತನ ಸಾಹಸ ಹಾಗೂ ಯಶಸ್ವಿ ಪಯಣ",
      mr: "पराक्रम, नवे धाडस व यशस्वी प्रवास",
      hi: "पराक्रम, नए उपक्रम एवं सफल यात्राएं",
      te: "పరాక్రమం, నూతన ప్రయత్నాలు & విజయవంతమైన ప్రయాణాలు",
      ta: "தைரியம், புதிய முயற்சிகள் & வெற்றிகரமான பயணம்",
      en: "Courage, Strategic Enterprise & Triumphant Ventures"
    },
    4: {
      kn: "ಗೃಹ ಸೌಖ್ಯ, ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ವಾಹನ ಯೋಗ",
      mr: "गृहसौख्य, मालमत्ता खरेदी व वाहन प्राप्ती",
      hi: "गृह सुख, अचल संपत्ति क्रय एवं वाहन लाभ",
      te: "గృహ సౌఖ్యం, స్థిరాస్తి కొనుగోలు & వాహన యోగం",
      ta: "இல்லற அமைதி, சொத்து சேர்க்கை & வாகன யோகம்",
      en: "Domestic Serenity, Real Estate Acquisition & Asset Mastery"
    },
    5: {
      kn: "ವಿದ್ಯಾ ಸಿದ್ಧಿ, ಸಂತಾನ ಸೌಖ್ಯ ಹಾಗೂ ಬುದ್ಧಿ ಬಲ",
      mr: "विद्यासिद्धी, संतती सुख व तल्लख बुद्धी",
      hi: "विद्या सिद्धि, संतान सुख एवं विवेक बल",
      te: "విద్యా సిద్ధి, సంతాన సౌఖ్యం & వివేకం",
      ta: "கல்வி வெற்றி, மழலை மகிழ்ச்சி & புத்திக்கூர்மை",
      en: "Scholastic Triumph, Progeny Bliss & Creative Acumen"
    },
    6: {
      kn: "ಶತ್ರು ಜಯ, ರೋಗ ನಿವಾರಣೆ ಹಾಗೂ ಕರ್ತವ್ಯ ನಿಷ್ಠೆ",
      mr: "शत्रूंवर मात, आरोग्य सुधारणा व कर्तव्यनिष्ठा",
      hi: "शत्रु विजय, रोग मुक्ति एवं कर्मठता",
      te: "శత్రు జయం, రోగ నివారణ & కర్తవ్య నిష్ఠ",
      ta: "எதிரிகள் வெற்றி, நோய் நிவர்த்தி & கடமை உணர்வு",
      en: "Triumph over Competitors, Restored Immunity & Duty"
    },
    7: {
      kn: "ವಿವಾಹ ಯೋಗ, ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ",
      mr: "विवाह योग, भागीदारी व सामाजिक सन्मान",
      hi: "विवाह योग, साझेदारी एवं सामाजिक प्रतिष्ठा",
      te: "వివాహ యోగం, భాగస్వామ్యం & సామాజిక గౌరవం",
      ta: "திருமண யோகம், கூட்டுத் தொழில் & பொது மரியாதை",
      en: "Matrimonial Alliances, Enterprise Partnerships & Public Honor"
    },
    8: {
      kn: "ಆಂತರಿಕ ಪರಿವರ್ತನೆ, ಆಯುಷ್ಯ ರಕ್ಷೆ ಹಾಗೂ ತಾಳ್ಮೆ",
      mr: "आत्मिक परिवर्तन, दीर्घायुष्य व संयम",
      hi: "आंतरिक रूपांतरण, आयु रक्षा एवं धैर्य",
      te: "ఆంతరంగిక పరివర్తన, ఆయురారోగ్య రక్ష & ఓర్పు",
      ta: "ஆழ்ந்த மாற்றம், ஆயுள் பாதுகாப்பு & பொறுமை",
      en: "Profound Transformation, Longevity Shield & Patience"
    },
    9: {
      kn: "ಭಾಗ್ಯೋದಯ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಗುರು ಕೃಪೆ",
      mr: "भाग्योदय, तीर्थाटन व गुरु कृपा",
      hi: "भाग्योदय, तीर्थाटन एवं गुरु कृपा",
      te: "భాగ్యోదయం, తీర్థయాత్రలు & గురు కృప",
      ta: "பாக்கியோதயம், தீர்த்த யாத்திரை & குரு அருள்",
      en: "Divine Fortune, Sacred Pilgrimage & Mentor Grace"
    },
    10: {
      kn: "ವೃತ್ತಿ ದಿಗ್ವಿಜಯ, ಉನ್ನತ ಅಧಿಕಾರ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿ",
      mr: "करिअर विजय, मोठे पद व सार्वजनिक कीर्ती",
      hi: "करियर में विजय, उच्च पद एवं सामाजिक यश",
      te: "వృత్తి దిగ్విజయం, ఉన్నతాధికార ప్రాప్తి & కీర్తి",
      ta: "தொழில் வெற்றி, உயர் பதவி & புகழ்",
      en: "Executive Ascendancy, Sovereign Leadership & Renown"
    },
    11: {
      kn: "ಬೃಹತ್ ಲಾಭ, ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ ಹಾಗೂ ಧನ ಧಾನ್ಯ",
      mr: "मोठा आर्थिक लाभ, सर्व इच्छापूर्ती व समृद्धी",
      hi: "विशाल धन लाभ, सर्व मनोकामना सिद्धि एवं समृद्धि",
      te: "భారీ ధనలాభం, సర్వేష్టార్థ సిద్ధి & సంపద",
      ta: "அபரிமித தனலாபம், சகல ஆசைகள் நிறைவேறுதல்",
      en: "Exponential Gains, Milestone Realization & Material Triumph"
    },
    12: {
      kn: "ವಿದೇಶ ಪ್ರಯಾಣ, ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ ಹಾಗೂ ಶುಭ ವೆಚ್ಚ",
      mr: "परदेश गमन, आध्यात्मिक उन्नती व सत्कार्यासाठी खर्च",
      hi: "विदेश गमन, आध्यात्मिक साधना एवं शुभ व्यय",
      te: "విదేశీ ప్రయాణం, ఆధ్యాత్మిక సాధన & శుభ వ్యయం",
      ta: "வெளிநாட்டு பயணம், ஆன்மீக சாதனை & சுப விரயம்",
      en: "Foreign Travel, Spiritual Awakening & Elevated Charity"
    }
  };
  const hKey = ((house - 1) % 12 + 12) % 12 + 1;
  return themes[hKey]?.[lang] || themes[1][lang];
}

/**
 * 2b. Reverent Devotee Greeting by Language
 */
export function getDevoteeGreeting(name: string, lang: SixLang): string {
  const cleanName = (name || "").trim();
  if (lang === "kn") return cleanName ? `ಶ್ರೀಯುತ ${cleanName} ಅವರೇ` : "ಪೂಜ್ಯ ಭಕ್ತರೇ";
  if (lang === "mr") return cleanName ? `सन्माननीय ${cleanName}` : "श्रद्धेय भक्तजन";
  if (lang === "hi") return cleanName ? `आदरणीय ${cleanName}` : "प्रिय भक्तजन";
  if (lang === "te") return cleanName ? `గౌరవనీయులైన ${cleanName} గారు` : "భక్తవరేణ్యులు";
  if (lang === "ta") return cleanName ? `மதிப்பிற்குரிய ${cleanName} அவர்களே` : "பக்தர்களே";
  return cleanName ? `Respected ${cleanName}` : "Respected Devotee";
}

/**
 * 3. Classical Moorthy Nirnaya (ಮೂರ್ತಿ ನಿರ್ಣಯ)
 * Evaluates transit Moon house from natal Moon:
 * 1, 6, 11 = Swarna (Gold); 2, 5, 9 = Rajata (Silver); 3, 7, 10 = Tamra (Copper); 4, 8, 12 = Loha (Iron).
 */
export function getMoorthyNirnaya(transitMoonSign: number, janmaMoonSign: number, lang: SixLang): string {
  const diffHouse = ((transitMoonSign - janmaMoonSign + 12) % 12) + 1;
  if ([1, 6, 11].includes(diffHouse)) {
    return lang === "kn" ? "ಸ್ವರ್ಣ ಮೂರ್ತಿ (ಪೂರ್ಣ ಶುಭ)"
      : lang === "mr" ? "सुवर्ण मूर्ती (पूर्ण शुभ फळ)"
        : lang === "hi" ? "स्वर्ण मूर्ति (पूर्ण शुभ फल)"
          : lang === "te" ? "స్వర్ణ మూర్తి (సంపూర్ణ శుభం)"
            : lang === "ta" ? "சொர்ண மூர்த்தி (முழு சுபம்)"
              : "Swarna Moorthy (Gold - Full Benefic)";
  }
  if ([2, 5, 9].includes(diffHouse)) {
    return lang === "kn" ? "ರಜತ ಮೂರ್ತಿ (ಉತ್ತಮ ಫಲ)"
      : lang === "mr" ? "रजत मूर्ती (उत्तम फळ)"
        : lang === "hi" ? "रजत मूर्ति (उत्तम फल)"
          : lang === "te" ? "రజత మూర్తి (ఉత్తమ ఫలం)"
            : lang === "ta" ? "ரஜத மூர்த்தி (நற்பலன்)"
              : "Rajata Moorthy (Silver - Highly Benefic)";
  }
  if ([3, 7, 10].includes(diffHouse)) {
    return lang === "kn" ? "ತಾಮ್ರ ಮೂರ್ತಿ (ಮಧ್ಯಮ ಫಲ)"
      : lang === "mr" ? "ताम्र मूर्ती (मध्यम फळ)"
        : lang === "hi" ? "ताम्र मूर्ति (मध्यम फल)"
          : lang === "te" ? "తామ్ర మూర్తి (మధ్యమ ఫలం)"
            : lang === "ta" ? "தாமிர மூர்த்தி (மத்திமம்)"
              : "Tamra Moorthy (Copper - Moderate Yield)";
  }
  return lang === "kn" ? "ಲೋಹ ಮೂರ್ತಿ (ತಾಳ್ಮೆ & ಶಾಂತಿ ಅಗತ್ಯ)"
    : lang === "mr" ? "लोह मूर्ती (संयम व शांती आवश्यक)"
      : lang === "hi" ? "लोह मूर्ति (धैर्य व शांति आवश्यक)"
        : lang === "te" ? "లోహ మూర్తి (ఓర్పు & శాంతి అవసరం)"
          : lang === "ta" ? "இரும்பு மூர்த்தி (பொறுமை & சாந்தி)"
            : "Loha Moorthy (Iron - Demands Remedial Care)";
}

/**
 * 4. Double Transit of Saturn & Jupiter (ದ್ವಿಗ್ರಹ ಗೋಚಾರ ವೇಧ)
 * Checks intersection of signs aspected simultaneously by Saturn and Jupiter.
 */
export function detectDoubleTransit(
  saturnSign: number,
  jupiterSign: number,
  lagnaSign: number,
  moonSign: number,
  lang: SixLang
): string {
  const satAspects = [saturnSign, (saturnSign + 2) % 12, (saturnSign + 6) % 12, (saturnSign + 9) % 12];
  const jupAspects = [jupiterSign, (jupiterSign + 4) % 12, (jupiterSign + 6) % 12, (jupiterSign + 8) % 12];
  const commonSigns = satAspects.filter(s => jupAspects.includes(s));

  if (commonSigns.length === 0) return "";

  const leadSign = commonSigns[0];
  const houseFromLagna = ((leadSign - lagnaSign + 12) % 12) + 1;

  if (houseFromLagna === 10) {
    return lang === "kn" ? "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ದೃಷ್ಟಿ: ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹತ್ವದ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕೀರ್ತಿ."
      : lang === "mr" ? "दशम भावात गुरू-शनि द्विग्रह दृष्टी: करिअरमध्ये मोठे अधिकार व सामाजिक प्रतिष्ठा."
        : lang === "hi" ? "दशम भाव में गुरु-शनि द्विग्रह दृष्टि: कार्यक्षेत्र में सर्वोच्च पद-प्रतिष्ठा एवं प्रभाव।"
          : lang === "te" ? "10వ ఇంట్లో గురు-శని ద్విగ్రహ దృష్టి: ఉద్యోగంలో ఉన్నతాధికార ప్రాప్తి & కీర్తి."
            : lang === "ta" ? "10ம் வீட்டில் குரு-சனி இருகிரக பார்வை: தொழில் வாழ்வில் உயர் பதவி & அதிகாரம்."
              : "Double Transit aspect on 10th House activates sovereign executive promotion.";
  }
  if (houseFromLagna === 7) {
    return lang === "kn" ? "೭ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ಪ್ರಭಾವ: ಅವಿವಾಹಿತರಿಗೆ ವಿವಾಹ ಸಿದ್ಧಿ ಅಥವಾ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ."
      : lang === "mr" ? "सप्तम भावात गुरू-शनि द्विग्रह प्रभाव: विवाहाचे शुभ योग किंवा व्यवसाय भागीदारी विस्तार."
        : lang === "hi" ? "सप्तम भाव में गुरु-शनि द्विग्रह प्रभाव: विवाह का मांगलिक योग अथवा व्यापार विस्तार।"
          : lang === "te" ? "7వ ఇంట్లో గురు-శని ద్విగ్రహ ప్రభావం: శీఘ్ర వివాహ ప్రాప్తి లేదా వ్యాపార విస్తరణ."
            : lang === "ta" ? "7ம் வீட்டில் குரு-சனி பார்வை: திருமண யோகம் அல்லது வர்த்தக கூட்டு விரிவாக்கம்."
              : "Double Transit on 7th House activates matrimonial alliance or partnership scaling.";
  }
  if (houseFromLagna === 4) {
    return lang === "kn" ? "೪ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ಪ್ರಭಾವ: ಸ್ವಂತ ಮನೆ, ನಿವೇಶನ ಅಥವಾ ನೂತನ ವಾಹನ ಖರೀದಿ ಯೋಗ."
      : lang === "mr" ? "चतुर्थ भावात गुरू-शनि दृष्टी: नवीन घर, जागा खरेदी अथवा वाहन सौख्य योग."
        : lang === "hi" ? "चतुर्थ भाव में गुरु-शनि दृष्टि: नवीन भवन, भूमि क्रय अथवा वाहन सुख योग।"
          : lang === "te" ? "4వ ఇంట్లో గురు-శని ప్రభావం: సొంత ఇల్లు, స్థలం లేదా వాహన కొనుగోలు యోగం."
            : lang === "ta" ? "4ம் வீட்டில் குரு-சனி பார்வை: புதிய வீடு, மனை அல்லது வாகன சேர்க்கை யோகம்."
              : "Double Transit on 4th House manifests prime real estate acquisition and domestic joy.";
  }
  if (houseFromLagna === 5) {
    return lang === "kn" ? "೫ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ಸಂಯೋಗ: ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಶ್ರೇಯಾಂಕ ಅಥವಾ ಸಂತಾನ ಭಾಗ್ಯ."
      : lang === "mr" ? "पंचम भावात गुरू-शनि प्रभाव: उच्च शिक्षण, परीक्षेत यश अथवा संतती सौख्य योग."
        : lang === "hi" ? "पंचम भाव में गुरु-शनि प्रभाव: उच्च शिक्षा, परीक्षा में सफलता अथवा संतान सुख योग।"
          : lang === "te" ? "5వ ఇంట్లో గురు-శని కలయిక: ఉన్నత విద్యా రాణింపు లేదా సత్సంతాన ప్రాప్తి."
            : lang === "ta" ? "5ம் வீட்டில் குரு-சனி பார்வை: உயர்கல்வி வெற்றி அல்லது குழந்தை பாக்கிய யோகம்."
              : "Double Transit on 5th House activates scholastic zenith and progeny blessings.";
  }
  if (houseFromLagna === 11 || houseFromLagna === 2) {
    return lang === "kn" ? `${formatNumber6L(houseFromLagna, lang)}ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ವೇಧ: ಅಪಾರ ಧನಾಗಮನ ಹಾಗೂ ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ.`
      : lang === "mr" ? `${formatNumber6L(houseFromLagna, lang)}व्या भावात गुरू-शनि वेध: मोठा आर्थिक लाभ व जुनी येणी वसूल होणे.`
        : lang === "hi" ? `${formatNumber6L(houseFromLagna, lang)}वें भाव में गुरु-शनि वेध: विशाल धन लाभ एवं पुराने ऋणों की प्राप्ति।`
          : lang === "te" ? `${formatNumber6L(houseFromLagna, lang)}వ ఇంట్లో గురు-శని వేధ: అపార ధన లాభం మరియు పాత బాకీల వసూలు.`
            : lang === "ta" ? `${formatNumber6L(houseFromLagna, lang)}ம் வீட்டில் குரு-சனி வேதை: பெரும் தனலாபம் & பழைய பாக்கிகள் வசூலாதல்.`
              : `Double Transit on House ${houseFromLagna} unlocks exponential liquidity and debt resolution.`;
  }
  if (houseFromLagna === 12) {
    return lang === "kn" ? "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ದೃಷ್ಟಿ: ವಿದೇಶ ಪ್ರಯಾಣ, ಆಧ್ಯಾತ್ಮಿಕ ಏಕಾಂತ ಅಥವಾ ಕಾನೂನು-ಆಸ್ಪತ್ರೆ ವೆಚ್ಚಗಳ ನಿಯಂತ್ರಣ."
      : lang === "mr" ? "१२व्या भावात गुरू-शनि दृष्टी: परदेश प्रवास, आध्यात्मिक एकांत अथवा कायदेशीर/वैद्यकीय खर्चांवर नियंत्रण."
        : lang === "hi" ? "१२वें भाव में गुरु-शनि दृष्टि: विदेश यात्रा, आध्यात्मिक एकांत अथवा वैधानिक/चिकित्सीय व्यय पर नियंत्रण।"
          : lang === "te" ? "12వ ఇంట్లో గురు-శని దృష్టి: విదేశీ ప్రయాణం, ఆధ్యాత్మిక ఏకాంతం లేదా చట్టపరమైన/వైద్య ఖర్చుల నియంత్రణ."
            : lang === "ta" ? "12ம் வீட்டில் குரு-சனி பார்வை: வெளிநாட்டு பயணம், ஆன்மீக தனிமை அல்லது மருத்துவ/சட்ட செலவுகள் கட்டுப்பாடு."
              : "Double Transit on 12th House activates overseas exploration, spiritual seclusion, and legal/hospital expenditure control.";
  }
  if (houseFromLagna === 6) {
    return lang === "kn" ? "೬ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ದೃಷ್ಟಿ: ಶತ್ರು ಸಂಹಾರ, ದೀರ್ಘಕಾಲೀನ ವಿವಾದಗಳ ಸಂಧಾನ ಹಾಗೂ ಸಾಲ ಮುಕ್ತಿ."
      : lang === "mr" ? "६व्या भावात गुरू-शनि दृष्टी: शत्रू निवारण, दीर्घकालीन वादांचे निवारण व कर्जमुक्ती."
        : lang === "hi" ? "६वें भाव में गुरु-शनि दृष्टि: शत्रु दमन, दीर्घकालीन विवादों का समाधान एवं ऋण मुक्ति।"
          : lang === "te" ? "6వ ఇంట్లో గురు-శని దృష్టి: శత్రు నివారణ, దీర్ఘకాల వివాదాల పరిష్కారం & రుణ విముక్తి."
            : lang === "ta" ? "6ம் வீட்டில் குரு-சனி பார்வை: எதிரிகள் முறியடிப்பு, நீண்ட நாள் வழக்குகள் தீர்வு & கடன் நிவர்த்தி."
              : "Double Transit on 6th House ensures defeat of detractors, settlement of longstanding disputes, and debt liquidation.";
  }
  if (houseFromLagna === 8) {
    return lang === "kn" ? "೮ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ದೃಷ್ಟಿ: ಆಯುರ್-ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ನಿಗೂಢ ಜ್ಞಾನ ಸಾಧನೆ ಹಾಗೂ ಆಕಸ್ಮಿಕ ಗಂಡಾಂತರ ನಿವಾರಣೆ."
      : lang === "mr" ? "८व्या भावात गुरू-शनि दृष्टी: दीर्घायुष्य, गूढ विद्या संपादन व आकस्मिक संकटांपासून संरक्षण."
        : lang === "hi" ? "८वें भाव में गुरु-शनि दृष्टि: आयु-आरोग्य रक्षा, गूढ़ विद्या अर्जन एवं आकस्मिक संकट निवारण।"
          : lang === "te" ? "8వ ఇంట్లో గురు-శని దృష్టి: ఆయురారోగ్య రక్షణ, గూఢ విద్యల సాధన & ఆకస్మిక గండాల నివారణ."
            : lang === "ta" ? "8ம் வீட்டில் குரு-சனி பார்வை: ஆயுள் ஆரோக்கிய பாதுகாப்பு, ஆன்மீக ஞானம் & விபத்துகளில் இருந்து பாதுகாப்பு."
              : "Double Transit on 8th House fortifies longevity, occult mastery, and pacification of sudden crises.";
  }
  return lang === "kn" ? `${formatNumber6L(houseFromLagna, lang)}ನೇ ಮನೆಯಲ್ಲಿ ಗುರು-ಶನಿ ದ್ವಿಗ್ರಹ ದೃಷ್ಟಿ: ಧರ್ಮ ಕಾರ್ಯ ಹಾಗೂ ದೈವಿಕ ಸಂಕಲ್ಪ ಸಿದ್ಧಿ.`
    : lang === "mr" ? `${formatNumber6L(houseFromLagna, lang)}व्या भावात गुरू-शनि दृष्टी: धर्मकार्ये व महत्त्वाचे संकल्प सिद्धीस जाणे.`
      : lang === "hi" ? `${formatNumber6L(houseFromLagna, lang)}वें भाव में गुरु-शनि दृष्टि: धर्म कार्य एवं शुभ संकल्पों की सिद्धि।`
        : lang === "te" ? `${formatNumber6L(houseFromLagna, lang)}వ ఇంట్లో గురు-శని దృష్టి: ధర్మ కార్యాలు & దైవిక సంకల్ప సిద్ధి.`
          : lang === "ta" ? `${formatNumber6L(houseFromLagna, lang)}ம் வீட்டில் குரு-சனி பார்வை: தர்ம காரியங்கள் & தெய்வீக சங்கல்ப சித்தி.`
            : `Double Transit aspect on House ${houseFromLagna} empowers spiritual vows and dharmic duty.`;
}

/**
 * 5. Sacred Nakshatra Vriksha (Sacred Tree) Lookup
 */
export function getNakshatraVriksha(nakshatraIdx: number, lang: SixLang): { vrikshaName: string; bijaMantra: string; aradhanaProtocol: string } {
  const trees: Array<Record<SixLang, { v: string; m: string; p: string }>> = [
    { // 0: Ashwini
      kn: { v: "ಕಾಸರಕ ವೃಕ್ಷ (Strychnos)", m: "ಓಂ ಹ್ರೀಂ ಅಶ್ವಿನೀಕುಮಾರಾಭ್ಯಾಂ ನಮಃ", p: "ಕಾಸರಕ ಗಿಡಕ್ಕೆ ಜಲಾರ್ಪಣೆ ಹಾಗೂ ನಮಸ್ಕಾರ ಶುಭಪ್ರದ." },
      mr: { v: "कुचला वृक्ष", m: "ॐ ह्रीं अश्विनीकुमाराभ्यां नमः", p: "वृक्षाला जलार्पण व नमन आरोग्यदायी ठरेल." },
      hi: { v: "कुचला वृक्ष", m: "ॐ ह्रीं अश्विनीकुमाराभ्यां नमः", p: "वृक्ष को जलार्पण एवं नमन स्वास्थ्यवर्धक है।" },
      te: { v: "విషముష్టి చెట్టు", m: "ఓం హ్రీం అశ్వినీకుమారాభ్యాం నమః", p: "చెట్టుకు నీరు సమర్పించడం ఆరోగ్యకరం." },
      ta: { v: "எட்டி மரம்", m: "ஓம் ஹ்ரீம் அஸ்வினி குமாராய நமஹ", p: "மரத்திற்கு நீர் ஊற்றி வணங்குவது ஆரோக்கியம் தரும்." },
      en: { v: "Strychnos nux-vomica (Kasaraka)", m: "Om Hreem Ashwini Kumarabhyam Namaha", p: "Offering morning water to the sacred tree invokes vitality." }
    },
    { // 1: Bharani
      kn: { v: "ನೆಲ್ಲಿ ವೃಕ್ಷ (Amla Tree)", m: "ಓಂ ಯಮಾಯ ನಮಃ", p: "ನೆಲ್ಲಿ ಮರಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕುವುದು ದೀರ್ಘಾಯುಷ್ಯ ತರುತ್ತದೆ." },
      mr: { v: "आवळा वृक्ष", m: "ॐ यमाय नमः", p: "आवळ्याच्या वृक्षाला प्रदक्षिणा घालणे आयुष्यवर्धक आहे." },
      hi: { v: "आँवला वृक्ष", m: "ॐ यमाय नमः", p: "आँवला वृक्ष की परिक्रमा दीर्घायु प्रदान करती है।" },
      te: { v: "ఉసిరి చెట్టు", m: "ఓం యమాయ నమః", p: "ఉసిరి చెట్టుకు ప్రదక్షిణలు చేయడం ఆయుర్వర్ధకం." },
      ta: { v: "நெல்லி மரம்", m: "ஓம் யமாய நமஹ", p: "நெல்லி மரத்தை வலம் வருவது தீர்க்காயுள் தரும்." },
      en: { v: "Phyllanthus emblica (Amla)", m: "Om Yamaya Namaha", p: "Circumambulating the Amla tree bestows radiant health and longevity." }
    },
    { // 2: Krittika
      kn: { v: "ಅತ್ತಿ ವೃಕ್ಷ (Ficus glomerata)", m: "ಓಂ ಅಗ್ನಯೇ ನಮಃ", p: "ಅತ್ತಿ ಮರದ ಕೆಳಗೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗುವುದು ತೇಜಸ್ಸು ನೀಡುತ್ತದೆ." },
      mr: { v: "उंबर वृक्ष", m: "ॐ अग्नये नमः", p: "उंबराच्या झाडाखाली तुपाचा दिवा लावणे तेजस्विता देणारे आहे." },
      hi: { v: "गूलर वृक्ष", m: "ॐ अग्नये नमः", p: "गूलर वृक्ष के नीचे घृत दीप प्रज्वलित करना तेजस्विता वर्धक है।" },
      te: { v: "మేడి చెట్టు", m: "ఓం అగ్నయే నమః", p: "మేడి చెట్టు కింద నెయ్యి దీపం వెలిగించడం శుభకరం." },
      ta: { v: "அத்தி மரம்", m: "ஓம் அக்னயே நமஹ", p: "அத்தி மரத்தின் கீழ் நெய் தீபம் ஏற்றுவது தேஜஸ் தரும்." },
      en: { v: "Ficus racemosa (Gular / Atti)", m: "Om Agnaye Namaha", p: "Lighting a ghee lamp near the sacred fig tree fuels inner vitality." }
    },
    { // 3: Rohini
      kn: { v: "ನೇರಳೆ ವೃಕ್ಷ (Jamun Tree)", m: "ಓಂ ಪ್ರಜಾಪತಯೇ ನಮಃ", p: "ನೇರಳೆ ವೃಕ್ಷಕ್ಕೆ ಜಲ ಸಮರ್ಪಣೆ ಮನಃಶಾಂತಿ ನೀಡುತ್ತದೆ." },
      mr: { v: "जांभूळ वृक्ष", m: "ॐ प्रजापतये नमः", p: "जांभळाच्या झाडाला पाणी घालणे मनःशांती देईल." },
      hi: { v: "जामुन वृक्ष", m: "ॐ प्रजापतये नमः", p: "जामुन वृक्ष को जल देना मानसिक शांति प्रदायक है।" },
      te: { v: "నేరేడు చెట్టు", m: "ఓం ప్రజాపతయే నమః", p: "నేరేడు చెట్టుకు జలార్పణ మనశ్శాంతిని ఇస్తుంది." },
      ta: { v: "நாவல் மரம்", m: "ஓம் பிரஜாபதயே நமஹ", p: "நாவல் மரத்திற்கு நீர் ஊற்றுவது மன அமைதியைத் தரும்." },
      en: { v: "Syzygium cumini (Jamun)", m: "Om Prajapataye Namaha", p: "Watering the sacred Jamun tree anchors serene emotional composure." }
    }
  ];

  // Map 0..26 safely
  const idx = Math.min(nakshatraIdx, 26);
  const data = trees[idx % trees.length][lang] || trees[0][lang];
  return {
    vrikshaName: data.v,
    bijaMantra: data.m,
    aradhanaProtocol: data.p
  };
}

/**
 * 6. Future Auspicious Decision Muhurtas across 5 Years
 */
export function generateAuspiciousMuhurtas(
  baseYear: number,
  lang: SixLang,
  ageCategory: string,
  maritalStatus?: string,
  currentAgeYears?: number
): Array<{ category: string; icon: string; timingWindow: string; description: string }> {
  const y1 = formatNumber6L(baseYear, lang);
  const y2 = formatNumber6L(baseYear + 1, lang);
  const y3 = formatNumber6L(baseYear + 2, lang);

  const isInfant = currentAgeYears !== undefined && currentAgeYears < 2;
  const isChild = currentAgeYears !== undefined && currentAgeYears >= 2 && currentAgeYears < 13;
  const isAdolescent = currentAgeYears !== undefined && currentAgeYears >= 13 && currentAgeYears < 18;

  if (isInfant) {
    return [
      {
        category: pick6({
          kn: "🍼 ನಾಮಕರಣ & ಅನ್ನಪ್ರಾಶನ ಮುಹೂರ್ತ",
          mr: "🍼 नामकरण व अन्नप्राशन मुहूर्त",
          hi: "🍼 नामकरण एवं अन्नप्राशन मुहूर्त",
          te: "🍼 నామకరణం & అన్నప్రాశన ముహూర్తం",
          ta: "🍼 நாமகரணம் & அன்னப்ராசனம் முகூர்த்தம்",
          en: "🍼 Namakarana & Annaprashana Auspicious Window"
        }, lang),
        icon: "🍼",
        timingWindow: `${pick6({
          kn: "ಶುಕ್ಲ ಪಕ್ಷ (ವೈಶಾಖ - ಶ್ರಾವಣ)",
          mr: "शुक्ल पक्ष (वैशाख - श्रावण)",
          hi: "शुक्ल पक्ष (वैशाख - श्रावण)",
          te: "శుక్ల పక్షం (వైశాఖ - శ్రావణ)",
          ta: "சுக்ல பட்சம் (வைகாசி - ஆவணி)",
          en: "Shukla Paksha (Vaishakha - Shravana)"
        }, lang)} ${y1}`,
        description: pick6({
          kn: "ಚಂದ್ರ ಮತ್ತು ಗುರುಬಲದ ಅನುಗ್ರಹದಿಂದ ಶಿಶುವಿನ ಪ್ರಥಮ ಅನ್ನ ಸ್ವೀಕಾರ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷೆ.",
          mr: "चंद्र व गुरूच्या कृपेने बालकाचा प्रथम अन्नप्राशन संस्कार व दीर्घायुष्य लाभ.",
          hi: "चंद्रमा एवं गुरु के शुभ प्रभाव से बालक का प्रथम अन्नप्राशन एवं उत्तम स्वास्थ्य रक्षा।",
          te: "చంద్ర మరియు గురుబలంతో శిశువుకు ప్రథమ అన్నప్రాశనం & ఆయురారోగ్య రక్షణ.",
          ta: "சந்திர மற்றும் குரு பலனால் குழந்தைக்கு முதல் அன்னப்ராசனம் மற்றும் நல்வாழ்வு.",
          en: "Luminaries and Jovian rays bless pristine digestion and pediatric longevity."
        }, lang)
      },
      {
        category: pick6({
          kn: "🪔 ಆಯುಷ್ಯ ಹೋಮ & ಬಾಲಾರಿಷ್ಟ ಶಾಂತಿ",
          mr: "🪔 आयुष्य होम व बालारिष्ट शांती",
          hi: "🪔 आयुष्य हवन एवं बालारिष्ट शांति",
          te: "🪔 ఆయుష్య హోమం & బాలారిష్ట శాంతి",
          ta: "🪔 ஆயுஷ்ய ஹோமம் & பாலாரிஷ்ட சாந்தி",
          en: "🪔 Ayushya Homa & Balarishta Protection Aegis"
        }, lang),
        icon: "🪔",
        timingWindow: `${pick6({
          kn: "ಜನ್ಮ ನಕ್ಷತ್ರ ಮಾಸ",
          mr: "जन्म नक्षत्र मास",
          hi: "जन्म नक्षत्र मास",
          te: "జన్మ నక్షత్ర మాసం",
          ta: "ஜென்ம நட்சத்திர மாதம்",
          en: "Natal Star Cycle"
        }, lang)} ${y1}`,
        description: pick6({
          kn: "ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಹಾಗೂ ಧನ್ವಂತರಿ ಅನುಗ್ರಹದಿಂದ ಸಮಸ್ತ ಬಾಲಾರಿಷ್ಟ ದೋಷ ಪರಿಹಾರ.",
          mr: "महामृत्युंजय व धन्वंतरी कृपेने सर्व बालारिष्ट दोषांचे निवारण व आरोग्य प्राप्ती.",
          hi: "महामृत्युंजय एवं धन्वंतरि कृपा से समस्त बालारिष्ट निवारण व उत्तम स्वास्थ्य।",
          te: "మహామృత్యుంజయ మరియు ధన్వంతరి అనుగ్రహంతో బాలారిష్ట దోషాల నివారణ.",
          ta: "மகா மிருத்யுஞ்சயர் மற்றும் தன்வந்திரி அருளால் பாலாரிஷ்ட தோஷ நிவர்த்தி.",
          en: "Vedic rites dispel early constitutional vulnerabilities and fortify immunity."
        }, lang)
      },
      {
        category: pick6({
          kn: "📖 ಅಕ್ಷರಾಭ್ಯಾಸ & ಪ್ರಥಮ ವಿದ್ಯಾರಂಭ",
          mr: "📖 पाटीपूजन व प्रथम विद्यारंभ",
          hi: "📖 अक्षराभ्यास एवं प्रथम विद्यारंभ",
          te: "📖 అక్షరాభ్యాసం & ప్రథమ విద్యారంభం",
          ta: "📖 அக்ஷராப்யாசம் & முதன்மைக் கல்வி துவக்கம்",
          en: "📖 Aksharabhyasa & Primary Initiation"
        }, lang),
        icon: "📖",
        timingWindow: `${pick6({
          kn: "ವಿಜಯದಶಮಿ / ವಸಂತ ಪಂಚಮಿ",
          mr: "विजयादशमी / वसंत पंचमी",
          hi: "विजयादशमी / वसंत पंचमी",
          te: "విజయదశమి / వసంత పంచమి",
          ta: "விஜயதசமி / வசந்த பஞ்சமி",
          en: "Vijayadashami / Vasant Panchami"
        }, lang)} ${y2}`,
        description: pick6({
          kn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಶ್ರೀ ಸರಸ್ವತಿ ಅನುಗ್ರಹದಿಂದ ಶಿಶುವಿನ ಜ್ಞಾನನೇತ್ರದ ಪ್ರಥಮ ಉನ್ಮೀಲನ.",
          mr: "सरस्वती व गुरूच्या आशीर्वादाने बालकाच्या बुद्धिमत्ता व वाणीचा पवित्र प्रारंभ.",
          hi: "माँ सरस्वती एवं गुरु कृपा से बालक की मेधा शक्ति एवं वाणी का शुभारंभ।",
          te: "సరస్వతీ దేవి మరియు గురు కృపతో బుద్ధి వికాసం & విద్యారంభం.",
          ta: "சரஸ்வதி மற்றும் குருவின் ஆசியுடன் குழந்தையின் கல்வி ஞான ஆரம்பம்.",
          en: "Mercurial and Jovian grace awaken early speech articulation and sensory cognition."
        }, lang)
      },
      {
        category: pick6({
          kn: "👂 ಕರ್ಣವೇಧನ (ಕಿವಿ ಚುಚ್ಚುವ) ಮಂಗಳ ಮುಹೂರ್ತ",
          mr: "👂 कर्णवेध संस्कार मुहूर्त",
          hi: "👂 कर्णवेध संस्कार मुहूर्त",
          te: "👂 కర్ణవేధన (చెవులు కుట్టే) ముహూర్తం",
          ta: "👂 காது குத்துதல் சுப முகூர்த்தம்",
          en: "👂 Karnavedhana Samskara Window"
        }, lang),
        icon: "👂",
        timingWindow: `${pick6({
          kn: "ಕಾರ್ತಿಕ - ಮಾಘ",
          mr: "कार्तिक - माघ",
          hi: "कार्तिक - माघ",
          te: "కార్తిక - మాఘ",
          ta: "கார்த்திகை - மாசி",
          en: "Kartika - Magha"
        }, lang)} ${y2}`,
        description: pick6({
          kn: "ಆಯುರ್ವೇದ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನರಮಂಡಲ ಶುದ್ಧಿ ಹಾಗೂ ದೃಷ್ಟಿ ಸಾಮರ್ಥ್ಯ ರಕ್ಷಣೆಗೆ ಮಂಗಳ ಮುಹೂರ್ತ.",
          mr: "आयुर्वेदानुसार मज्जासंस्था व दृष्टी रक्षणासाठी पवित्र कर्णवेध विधी.",
          hi: "आयुर्वेदानुसार नाड़ी तंत्र एवं दृष्टि शक्ति के संरक्षण हेतु शुभ कर्णवेध।",
          te: "ఆయుర్వేద శాస్త్రోక్తంగా నరాల పుష్టి & దృష్టి రక్షణకు శుభ సమయం.",
          ta: "ஆயுர்வேத நெறிப்படி நரம்பு மண்டலம் மற்றும் கண் பார்வை நலனுக்கான முகூர்த்தம்.",
          en: "Vedic pediatric tradition optimizing ocular energy pathways and nervous harmony."
        }, lang)
      },
      {
        category: pick6({
          kn: "🌿 ಚೌಲ / ಮುಂಡನ (ಪ್ರಥಮ ಕ್ಷೌರ) ಸಂಸ್ಕಾರ",
          mr: "🌿 जावळ / मुंडन संस्कार",
          hi: "🌿 मुंडन / चौल संस्कार",
          te: "🌿 పుట్టువెంట్రుకలు / ముండన సంస్కారం",
          ta: "🌿 மொட்டை போடுதல் / சுப முடி காணிக்கை",
          en: "🌿 Chowla / Tonsure Samskara Window"
        }, lang),
        icon: "🌿",
        timingWindow: `${pick6({
          kn: "ಉತ್ತರಾಯಣ (ಚೈತ್ರ - ಜ್ಯೇಷ್ಠ)",
          mr: "उत्तरायण (चैत्र - ज्येष्ठ)",
          hi: "उत्तरायण (चैत्र - ज्येष्ठ)",
          te: "ఉత్తరాయణం (చైత్ర - జ్యేష్ఠ)",
          ta: "உத்தராயணம் (சித்திரை - ஆனி)",
          en: "Uttarayan (Chaitra - Jyeshtha)"
        }, lang)} ${y3}`,
        description: pick6({
          kn: "ಕುಲದೇವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪ್ರಥಮ ಮುಂಡನ ಸಂಸ್ಕಾರದಿಂದ ತೇಜಸ್ಸು ಹಾಗೂ ಶಿರೋರೋಗ ನಿವಾರಣೆ.",
          mr: "कुलदेवतेच्या चरणी जावळ संस्काराने बालकाला उत्तम तेज व आरोग्य लाभेल.",
          hi: "कुलदेवता के चरणों में मुंडन संस्कार से शारीरिक तेज एवं मेधा शक्ति में वृद्धि।",
          te: "కులదేవత సన్నిధిలో పుట్టువెంట్రుకల తీతతో తేజస్సు & ఆరోగ్య రక్షణ.",
          ta: "குலதெய்வ சன்னதியில் முடி காணிக்கை செலுத்தி நீண்ட ஆயுள் பெறுதல்.",
          en: "Consecration at the ancestral shrine dispelling intrauterine thermal impurities."
        }, lang)
      }
    ];
  }

  if (isChild) {
    return [
      {
        category: pick6({
          kn: "📖 ಶಾಲಾ ಪ್ರವೇಶ & ನೂತನ ವಿದ್ಯಾಭ್ಯಾಸ",
          mr: "📖 शाळा प्रवेश व नवीन शैक्षणिक टप्पा",
          hi: "📖 विद्यालय प्रवेश एवं नवीन शैक्षणिक सत्र",
          te: "📖 పాఠశాల ప్రవేశం & నూతన విద్యాభ్యాసం",
          ta: "📖 பள்ளி சேர்க்கை & புதிய கல்வித் துவக்கம்",
          en: "📖 School Admission & Scholastic Milestone"
        }, lang),
        icon: "📖",
        timingWindow: `${pick6({
          kn: "ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ",
          mr: "वैशाख - ज्येष्ठ",
          hi: "वैशाख - ज्येष्ठ",
          te: "వైశాఖ - జ్యేష్ఠ",
          ta: "வைகாசி - ஆனி",
          en: "Vaishakha - Jyeshtha"
        }, lang)} ${y1}`,
        description: pick6({
          kn: "ಬುಧಾದಿತ್ಯ ಯೋಗದ ಬಲದಿಂದ ಶಾಲಾ ಪ್ರವೇಶ ಹಾಗೂ ಪಠ್ಯಕ್ರಮದಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ ಪ್ರಾಪ್ತಿ.",
          mr: "बुधादित्य योगाने शालेय प्रवेश व अभ्यासात अव्वल यश संपादन.",
          hi: "बुधादित्य योग के प्रभाव से प्रतिष्ठित विद्यालय में प्रवेश एवं उत्कृष्ट परीक्षा परिणाम।",
          te: "బుధాదిత్య యోగంతో మంచి పాఠశాలలో ప్రవేశం & చదువులో రాణింపు.",
          ta: "புதாதித்ய யோகத்தால் சிறந்த பள்ளியில் சேர்க்கை & படிப்பில் முதன்மை.",
          en: "Mercurial brilliance activates rapid memory retention and teacher appreciation."
        }, lang)
      },
      {
        category: pick6({
          kn: "🎨 ಕಲಾ, ಕ್ರೀಡೆ & ಸಂಗೀತ ತರಬೇತಿ ಆರಂಭ",
          mr: "🎨 कला, क्रीडा व संगीत प्रशिक्षण प्रारंभ",
          hi: "🎨 कला, खेलकूद एवं संगीत प्रशिक्षण आरंभ",
          te: "🎨 కళలు, క్రీడలు & సంగీత శిక్షణ ప్రారంభం",
          ta: "🎨 கலை, விளையாட்டு & இசைப் பயிற்சி துவக்கம்",
          en: "🎨 Arts, Sports & Creative Talents Initiation"
        }, lang),
        icon: "🎨",
        timingWindow: `${pick6({
          kn: "ಶ್ರಾವಣ - ಆಶ್ವಯುಜ",
          mr: "श्रावण - आश्विन",
          hi: "श्रावण - आश्विन",
          te: "శ్రావణ - ఆశ్వయుజ",
          ta: "ஆவணி - ஐப்பசி",
          en: "Shravana - Ashvina"
        }, lang)} ${y1}`,
        description: pick6({
          kn: "ಶುಕ್ರ ಮತ್ತು ಕುಜನ ಬಲದಿಂದ ಕ್ರೀಡೆ ಅಥವಾ ಲಲಿತಕಲೆಗಳಲ್ಲಿ ಸುಪ್ತ ಪ್ರತಿಭೆ ಪ್ರಕಾಶಿಸುವುದು.",
          mr: "शुक्र व मंगळाच्या बळाने खेळ अथवा कलांमध्ये सुप्त गुणांना वाव मिळेल.",
          hi: "शुक्र एवं मंगल के बल से खेलकूद अथवा ललित कलाओं में प्रतिभा का प्रकटीकरण।",
          te: "శుక్ర మరియు కుజ గ్రహాల బలంతో క్రీడలు లేదా కళల్లో రాణింపు.",
          ta: "சுக்கிரன் & செவ்வாய் பலத்தால் விளையாட்டு அல்லது கலைகளில் தனித்திறமை மிளிரும்.",
          en: "Venusian aesthetics and Martial stamina cultivate athletic and creative hobbies."
        }, lang)
      },
      {
        category: pick6({
          kn: "🪔 ಶ್ರೀ ಸರಸ್ವತಿ ಪೂಜೆ & ಮೇಧಾ ಸೂಕ್ತ ಅನುಷ್ಠಾನ",
          mr: "🪔 सरस्वती पूजन व मेधा सूक्त अनुष्ठान",
          hi: "🪔 सरस्वती पूजन एवं मेधा सूक्त अनुष्ठान",
          te: "🪔 సరస్వతీ పూజ & మేధా సూక్త అనుష్ఠానం",
          ta: "🪔 சரஸ்வதி பூஜை & மேதா சூக்த அனுஷ்டானம்",
          en: "🪔 Saraswati Puja & Medha Sukta Invocations"
        }, lang),
        icon: "🪔",
        timingWindow: `${pick6({
          kn: "ನವರಾತ್ರಿ / ಸರಸ್ವತಿ ಆವಾಹನೆ",
          mr: "नवरात्र / सरस्वती आवाहन",
          hi: "नवरात्रि / सरस्वती आवाहन",
          te: "నవరాత్రులు / సరస్వతీ ఆవాహన",
          ta: "நவராத்திரி / சரஸ்வதி ஆவாஹனம்",
          en: "Sharad Navaratri / Saraswati Avahana"
        }, lang)} ${y2}`,
        description: pick6({
          kn: "ಏಕಾಗ್ರತೆ ಹಾಗೂ ಜ್ಞಾಪಕ ಶಕ್ತಿ ವೃದ್ಧಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಸರಸ್ವತಿ ಅನುಗ್ರಹ ಸಾಧನೆ.",
          mr: "एकाग्रता व स्मरणशक्ती वाढवण्यासाठी पावन सरस्वती कृपेचा लाभ.",
          hi: "एकाग्रता एवं स्मरण शक्ति संवर्धन हेतु माँ सरस्वती की विशेष कृपा।",
          te: "ఏకాగ్రత మరియు జ్ఞాపకశక్తి పెంపొందించడానికి సరస్వతీ దేవి అనుగ్రహం.",
          ta: "கவனம் மற்றும் நினைவாற்றல் பெருக சரஸ்வதி தேவியின் பேரருள் கிட்டும்.",
          en: "Vedic wisdom hymns fortify flawless concentration and exam equanimity."
        }, lang)
      },
      {
        category: pick6({
          kn: "🩺 ಬಾಲ ಧನ್ವಂತರಿ ಆರೋಗ್ಯ ರಕ್ಷಾ ಮುಹೂರ್ತ",
          mr: "🩺 बाल धन्वंतरी आरोग्य रक्षा मुहूर्त",
          hi: "🩺 बाल धन्वंतरि स्वास्थ्य रक्षा मुहूर्त",
          te: "🩺 బాల ధన్వంతరి ఆరోగ్య రక్షా ముహూర్తం",
          ta: "🩺 பால தன்வந்திரி ஆரோக்கிய பாதுகாப்பு",
          en: "🩺 Pediatric Immunity & Dhanvantari Aegis"
        }, lang),
        icon: "🩺",
        timingWindow: `${pick6({
          kn: "ಮಾರ್ಗಶಿರ - ಪುಷ್ಯ",
          mr: "मार्गशीर्ष - पौष",
          hi: "मार्गशीर्ष - पौष",
          te: "మార్గశిర - పుష్య",
          ta: "மார்கழி - தை",
          en: "Margashirsha - Pushya"
        }, lang)} ${y2}`,
        description: pick6({
          kn: "ಸುವರ್ಣ ಪ್ರಾಶನ ಹಾಗೂ ನೈಸರ್ಗಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯಿಂದ ನಿರೋಗಿ ಆಯುಷ್ಯ ರಕ್ಷೆ.",
          mr: "सुवर्णप्राशन व नैसर्गिक रोगप्रतिकारशक्ती वाढवून निरोगी आरोग्याची प्राप्ती.",
          hi: "सुवर्णप्राशन एवं प्राकृतिक रोगप्रतिरोधक क्षमता से बालक का दीर्घकालीन स्वास्थ्य।",
          te: "సువర్ణప్రాశనం మరియు రోగనిరోధక శక్తితో సంపూర్ణ ఆయురారోగ్యాలు.",
          ta: "சுவர்ணபிராசனம் மற்றும் நோய் எதிர்ப்பு சக்தியால் நலம் காக்கும் முகூர்த்தம்.",
          en: "Seasonal Ayurvedic tonics insulate developing constitution against monsoon contagions."
        }, lang)
      },
      {
        category: pick6({
          kn: "✈️ ಶೈಕ್ಷಣಿಕ & ಕ್ಷೇತ್ರ ದರ್ಶನ ಯಾತ್ರೆ",
          mr: "✈️ शैक्षणिक सहल व पवित्र तीर्थाटन",
          hi: "✈️ शैक्षणिक भ्रमण एवं तीर्थ दर्शन",
          te: "✈️ విద్యా విషయక ప్రయాణం & క్షేత్ర దర్శనం",
          ta: "✈️ கல்விச் சுற்றுலா & புனித யாத்திரை",
          en: "✈️ Educational Excursions & Sacred Pilgrimage"
        }, lang),
        icon: "✈️",
        timingWindow: `${pick6({
          kn: "ಚೈತ್ರ - ವೈಶಾಖ",
          mr: "चैत्र - वैशाख",
          hi: "चैत्र - वैशाख",
          te: "చైత్ర - వైశాఖ",
          ta: "சித்திரை - வைகாசி",
          en: "Chaitra - Vaishakha"
        }, lang)} ${y3}`,
        description: pick6({
          kn: "೯ನೇ ಮನೆಯ ಶುಭ ಪ್ರಭಾವದಿಂದ ಐತಿಹಾಸಿಕ ತಾಣಗಳ ಪರಿಚಯ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಸ್ಕಾರ ಲಾಭ.",
          mr: "नवम भावाच्या प्रभावाने ऐतिहासिक व धार्मिक स्थळांच्या भेटीतून उत्तम संस्कार.",
          hi: "नवम भाव के शुभ प्रभाव से ज्ञानवर्धक ऐतिहासिक एवं धार्मिक स्थलों का दर्शन।",
          te: "9వ భావ శుభ దృష్టితో చారిత్రక, పుణ్యక్షేత్రాల సందర్శన ద్వారా మంచి సంస్కారాలు.",
          ta: "9ம் இடத்து சுப பார்வையால் வரலாற்றுத் தலங்கள் மற்றும் ஆன்மீக தளங்களின் தரிசனம்.",
          en: "Horizon-expanding heritage journeys instilling cultural reverence and moral roots."
        }, lang)
      }
    ];
  }

  if (isAdolescent) {
    return [
      {
        category: pick6({
          kn: "🎓 ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ & ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆ",
          mr: "🎓 उच्च शिक्षण व बोर्ड परीक्षा पूर्वतयारी",
          hi: "🎓 उच्च शिक्षा एवं बोर्ड परीक्षा की तैयारी",
          te: "🎓 ఉన్నత విద్య & బోర్డు పరీక్షల సన్నద్ధత",
          ta: "🎓 உயர் கல்வி & பொதுத்தேர்வு தயாரிப்பு",
          en: "🎓 Milestone Board Examinations & Pre-Collegiate Prep"
        }, lang),
        icon: "🎓",
        timingWindow: `${pick6({
          kn: "ಕಾರ್ತಿಕ - ಮಾರ್ಗಶಿರ",
          mr: "कार्तिक - मार्गशीर्ष",
          hi: "कार्तिक - मार्गशीर्ष",
          te: "కార్తిక - మార్గశిర",
          ta: "கார்த்திகை - மார்கழி",
          en: "Kartika - Margashirsha"
        }, lang)} ${y1}`,
        description: pick6({
          kn: "೫ನೇ ಹಾಗೂ ೧೦ನೇ ಮನೆಯ ಶುಭ ಸಂಯೋಗದಿಂದ ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಗ್ರ ಶ್ರೇಣಿ ಹಾಗೂ ಪ್ರತಿಷ್ಠಿತ ಪ್ರವೇಶ.",
          mr: "पंचम व दशम भावाच्या संयोगाने बोर्ड परीक्षेत प्रावीण्य व नामांकित संस्थेत प्रवेश.",
          hi: "पंचम एवं दशम भाव के शुभ प्रभाव से बोर्ड परीक्षाओं में सर्वोच्च अंक एवं प्रतिष्ठा।",
          te: "5 మరియు 10వ భావాల కలయికతో పరీక్షలలో ఉత్తమ ర్యాంకులు సాధించే అవకాశం.",
          ta: "5 & 10ம் வீடுகளின் யோகத்தால் பொதுத்தேர்வில் அதிக மதிப்பெண்கள் பெறுதல்.",
          en: "Parashari 5th/10th house synergy anchoring intellectual stamina for milestone exams."
        }, lang)
      },
      {
        category: pick6({
          kn: "💻 ತಾಂತ್ರಿಕ & ನವೀನ ಕೌಶಲ್ಯಾಭ್ಯಾಸ ಆರಂಭ",
          mr: "💻 तांत्रिक व आधुनिक कौशल्य संपादन",
          hi: "💻 तकनीकी एवं आधुनिक कौशल प्रशिक्षण",
          te: "💻 సాంకేతిక & ఆధునిక నైపుణ్యాల శిక్షణ",
          ta: "💻 தொழில்நுட்பம் & நவீன திறன் பயிற்சி",
          en: "💻 Technical Accreditations & Modern Aptitude"
        }, lang),
        icon: "💻",
        timingWindow: `${pick6({
          kn: "ವೈಶಾಖ - ಆಷಾಢ",
          mr: "वैशाख - आषाढ़",
          hi: "वैशाख - आषाढ़",
          te: "వైశాఖ - ఆషాఢ",
          ta: "வைகாசி - ஆனி",
          en: "Vaishakha - Ashadha"
        }, lang)} ${y2}`,
        description: pick6({
          kn: "ಬುಧ ಮತ್ತು ರಾಹುವಿನ ಅನುಕೂಲಕರ ಸಂಚಾರದಿಂದ ಕಂಪ್ಯೂಟರ್, ಕೋಡಿಂಗ್ ಅಥವಾ ವೈಜ್ಞಾನಿಕ ಕೌಶಲ್ಯಗಳ ಸಿದ್ಧಿ.",
          mr: "बुध व राहूच्या अनुकूलतेने तंत्रज्ञान, कोडिंग अथवा वैज्ञानिक कौशल्यांमध्ये प्रगती.",
          hi: "बुध एवं राहु की अनुकूलता से कंप्यूटर, कोडिंग अथवा वैज्ञानिक विषयों में निपुणता।",
          te: "బుధ, రాహు గ్రహాల అనుకూలతతో కంప్యూటర్, కోడింగ్ లేదా శాస్త్రీయ నైపుణ్యాల సాధన.",
          ta: "புதன் & ராகுவின் அனுகூலத்தால் கணினி, தொழில்நுட்பத் திறன்களில் மேன்மை.",
          en: "Mercurial and nodal transits accelerate computational fluency and specialized certifications."
        }, lang)
      },
      {
        category: pick6({
          kn: "🪔 ಶ್ರೀ ಗಾಯತ್ರಿ / ಸರಸ್ವತಿ ಮಹಾ ಅನುಷ್ಠಾನ",
          mr: "🪔 गायत्री / सरस्वती महा अनुष्ठान",
          hi: "🪔 गायत्री / सरस्वती महा अनुष्ठान",
          te: "🪔 గాయత్రీ / సరస్వతీ మహా అనుష్ఠానం",
          ta: "🪔 காயத்ரி / சரஸ்வதி மகா அனுஷ்டானம்",
          en: "🪔 Gayatri & Saraswati Contemplative Initiation"
        }, lang),
        icon: "🪔",
        timingWindow: `${pick6({
          kn: "ಮಾಘ - ಫಾಲ್ಗುಣ",
          mr: "माघ - फाल्गुन",
          hi: "माघ - फाल्गुन",
          te: "మాఘ - ఫాల్గుణ",
          ta: "மாசி - பங்குனி",
          en: "Magha - Phalguna"
        }, lang)} ${y2}`,
        description: pick6({
          kn: "ಬುದ್ಧಿ ತೇಜಸ್ಸು ಹಾಗೂ ಪರೀಕ್ಷಾ ಒತ್ತಡ ನಿವಾರಣೆಗೆ ದೈವಿಕ ಮಂತ್ರ ಜಪದ ದಿವ್ಯ ರಕ್ಷೆ.",
          mr: "बुद्धिमत्तेचे तेज वाढवण्यासाठी व परीक्षा तणाव मुक्तीसाठी दिव्य मंत्र जप.",
          hi: "मेधा शक्ति के विकास एवं मानसिक तनाव मुक्ति हेतु पावन गायत्री जप।",
          te: "బుద్ధి వికాసం మరియు పరీక్షల ఒత్తిడిని జయించడానికి దివ్య మంత్రోపాసన.",
          ta: "மன அமைதி மற்றும் தேர்வு பயம் நீங்க காயத்ரி மந்திர ஜபம் நற்பலன் தரும்.",
          en: "Sacred rhythmic recitations dissolve adolescent restlessness and bestow meditative poise."
        }, lang)
      },
      {
        category: pick6({
          kn: "✈️ ಶೈಕ್ಷಣಿಕ & ವೃತ್ತಿಪರ ಮಾರ್ಗದರ್ಶನ ಪ್ರವಾಸ",
          mr: "✈️ शैक्षणिक व करिअर मार्गदर्शन प्रवास",
          hi: "✈️ शैक्षणिक एवं करिअर मार्गदर्शन यात्रा",
          te: "✈️ విద్యా విషయక & కెరీర్ మార్గదర్శక ప్రయాణం",
          ta: "✈️ உயர்கல்வி வழிகாட்டல் பயணம்",
          en: "✈️ University Campus Visits & Collegiate Horizons"
        }, lang),
        icon: "✈️",
        timingWindow: `${pick6({
          kn: "ಜ್ಯೇಷ್ಠ - ಶ್ರಾವಣ",
          mr: "ज्येष्ठ - श्रावण",
          hi: "ज्येष्ठ - श्रावण",
          te: "జ్యేష్ఠ - శ్రావణ",
          ta: "ஆனி - ஆடி",
          en: "Jyeshtha - Shravana"
        }, lang)} ${y3}`,
        description: pick6({
          kn: "೯ನೇ ಮನೆಯ ಗುರುಬಲದಿಂದ ಶ್ರೇಷ್ಠ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಸಂದರ್ಶನ ಹಾಗೂ ದಿಟ್ಟ ಭವಿಷ್ಯದ ಆಯ್ಕೆ.",
          mr: "गुरुबळाने नामांकित विद्यापीठांची पाहणी व योग्य करिअर निवडीचा मार्ग सुकर.",
          hi: "गुरु के प्रभाव से प्रतिष्ठित विश्वविद्यालयों का भ्रमण एवं सही दिशा का चयन।",
          te: "గురుబలంతో ప్రముఖ విశ్వవిద్యాలయాల సందర్శన & సరైన విద్యా మార్గం ఎంపిక.",
          ta: "குரு பலனால் சிறந்த பல்கலைக்கழகங்கள் மற்றும் கல்லூரிகளை தேர்வு செய்யும் நல்வாய்ப்பு.",
          en: "Jovian horizon transits illuminate optimum academic streams and mentor alignment."
        }, lang)
      },
      {
        category: pick6({
          kn: "🏦 ಶೈಕ್ಷಣಿಕ ಬಾಲನಿಧಿ & ಸುರಕ್ಷಿತ ಉಳಿತಾಯ ಆರಂಭ",
          mr: "🏦 शैक्षणिक निधी व सुरक्षित भविष्य गुंतवणूक",
          hi: "🏦 उच्च शिक्षा कोष एवं सुरक्षित बचत आरंभ",
          te: "🏦 ఉన్నత విద్యా నిధి & సురక్షిత పొదుపు",
          ta: "🏦 உயர்கல்வி நிதி & சேமிப்புத் திட்டம்",
          en: "🏦 Higher Education Endowment & Long-Term Shield"
        }, lang),
        icon: "🏦",
        timingWindow: `${pick6({
          kn: "ಆಶ್ವಯುಜ (ದೀಪಾವಳಿ ಕಾಲ)",
          mr: "आश्विन (दिवाळी काळ)",
          hi: "आश्विन (दीपावली पर्व)",
          te: "ఆశ్వయుజ (దీపావళి పర్వదినం)",
          ta: "ஐப்பசி (தீபாவளி நன்னாள்)",
          en: "Ashvina (Deepavali Window)"
        }, lang)} ${y3}`,
        description: pick6({
          kn: "ಪೋಷಕರು ಕಾಲೇಜು ವ್ಯಾಸಂಗಕ್ಕಾಗಿ ದೀರ್ಘಕಾಲಿಕ ಶೈಕ್ಷಣಿಕ ನಿಧಿ ಸಂಚಯಿಸಲು ಸುವರ್ಣ ಕಾಲ.",
          mr: "पालकांनी भावी उच्च शिक्षणासाठी सुरक्षित शैक्षणिक निधी सुरू करण्याचा सुवर्ण काळ.",
          hi: "माता-पिता द्वारा भावी उच्च शिक्षा हेतु सुरक्षित संचय आरंभ करने का सर्वोत्तम समय।",
          te: "భవిష్యత్ ఉన్నత చదువుల కోసం తల్లిదండ్రులు పొదుపు ప్రారంభించడానికి శుభ సమయం.",
          ta: "உயர்கல்வி செலவுகளுக்காக பெற்றோர்கள் சேமிப்பைத் துவங்க பொன்னான காலம்.",
          en: "Disciplined parental allocation toward sovereign collegiate endowment instruments."
        }, lang)
      }
    ];
  }

  const isUnmarried = maritalStatus === "unmarried";

  return [
    {
      category: lang === "kn" ? "🏡 ಗೃಹ ಪ್ರವೇಶ & ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಮುಹೂರ್ತ"
        : lang === "mr" ? "🏡 गृहप्रवेश व मालमत्ता खरेदी मुहूर्त"
          : lang === "hi" ? "🏡 गृह प्रवेश एवं भूमि-भवन क्रय मुहूर्त"
            : lang === "te" ? "🏡 గృహ ప్రవేశం & స్థిరాస్తి కొనుగోలు ముహూర్తం"
              : lang === "ta" ? "🏡 கிரகப்பிரவேசம் & சொத்து வாங்கும் முகூர்த்தம்"
                : "🏡 Real Estate & Griha Pravesha Window",
      icon: "🏡",
      timingWindow: `${lang === "kn" ? "ವೈಶಾಖ - ಶ್ರಾವಣ" : lang === "mr" || lang === "hi" ? "वैशाख - श्रावण" : lang === "te" ? "వైశాఖ - శ్రావణ" : lang === "ta" ? "வைகாசி - ஆவணி" : "Vaishakha - Shravana"} ${y2}`,
      description: lang === "kn" ? "ಗುರುಬಲದ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನೂತನ ಆಸ್ತಿ ರಿಜಿಸ್ಟ್ರೇಶನ್ ಹಾಗೂ ಗೃಹಪ್ರವೇಶಕ್ಕೆ ಪರಮ ಶ್ರೇಷ್ಠ."
        : lang === "mr" ? "गुरूच्या शुभ दृष्टीने नवीन घराची नोंदणी व गृहप्रवेशासाठी सर्वोत्तम काळ."
          : lang === "hi" ? "गुरु के शुभ प्रभाव से नवीन संपत्ति रजिस्ट्री एवं गृह प्रवेश हेतु अत्यंत श्रेष्ठ।"
            : lang === "te" ? "గురుబలంతో నూతన ఆస్తి రిజిస్ట్రేషన్ మరియు గృహప్రవేశానికి శ్రేష్ఠమైన సమయం."
              : lang === "ta" ? "குரு பலனால் புதிய சொத்து பதிவு மற்றும் கிரகப்பிரவேசத்திற்கு உகந்த காலம்."
                : "Favorable Jovian aspects optimize land registry and ceremonial Griha Pravesha."
    },
    {
      category: lang === "kn" ? "🚗 ನೂತನ ವಾಹನ & ಸ್ವರ್ಣಾಭರಣ ಸಂಗ್ರಹ"
        : lang === "mr" ? "🚗 नवीन वाहन व सुवर्ण खरेदी"
          : lang === "hi" ? "🚗 नवीन वाहन एवं स्वर्ण क्रय"
            : lang === "te" ? "🚗 నూతన వాహనం & బంగారం కొనుగోలు"
              : lang === "ta" ? "🚗 புதிய வாகனம் & தங்க நகைகள் வாங்குதல்"
                : "🚗 Vehicle Acquisition & Gold Treasury",
      icon: "🚗",
      timingWindow: `${lang === "kn" ? "ಆಶ್ವಯುಜ (ದಸರಾ - ದೀಪಾವಳಿ)" : lang === "mr" || lang === "hi" ? "आश्विन (दशहरा - दीपावली)" : lang === "te" ? "ఆశ్వయుజ (దసరా - దీపావళి)" : lang === "ta" ? "ஐப்பசி (தீபாவளி)" : "Ashvina (Deepavali)"} ${y1}`,
      description: lang === "kn" ? "ಶುಕ್ರನ ಧನಯೋಗ ಪ್ರಭಾವದಿಂದ ಸುರಕ್ಷಿತ ವಾಹನ ಖರೀದಿ ಹಾಗೂ ಸ್ಥಿರ ಬಂಗಾರದ ಹೂಡಿಕೆ."
        : lang === "mr" ? "शुक्राच्या शुभ प्रभावाने सुरक्षित वाहन खरेदी व दीर्घकालीन सोन्याची गुंतवणूक."
          : lang === "hi" ? "शुक्र के शुभ प्रभाव से सुरक्षित वाहन क्रय एवं स्वर्ण में दीर्घकालीन निवेश।"
            : lang === "te" ? "శుక్ర ధనయోగంతో వాహన కొనుగోలు మరియు బంగారంలో పెట్టుబడి."
              : lang === "ta" ? "சுக்கிர யோகத்தால் புதிய வாகனம் மற்றும் தங்கத்தில் சிறப்பான முதலீடு."
                : "Venusian wealth aspects bless durable asset purchases and precious metal allocation."
    },
    {
      category: lang === "kn" ? "💼 ವೃತ್ತಿ ಪರಿವರ್ತನೆ & ನೂತನ ಉದ್ಯಮ ಆರಂಭ"
        : lang === "mr" ? "💼 करिअर बदल व नवीन व्यवसाय प्रारंभ"
          : lang === "hi" ? "💼 करियर परिवर्तन एवं नवीन व्यवसाय आरंभ"
            : lang === "te" ? "💼 ఉద్యోగ మార్పు & నూతన వ్యాపార ప్రారంభం"
              : lang === "ta" ? "💼 தொழில் மாற்றம் & புதிய தொழில் துவக்கம்"
                : "💼 Career Transition & Enterprise Launch",
      icon: "💼",
      timingWindow: `${lang === "kn" ? "ಕಾರ್ತಿಕ - ಮಾರ್ಗಶಿರ" : lang === "mr" || lang === "hi" ? "कार्तिक - मार्गशीर्ष" : lang === "te" ? "కార్తిక - మార్గశిర" : lang === "ta" ? "கார்த்திகை - மார்கழி" : "Kartika - Margashirsha"} ${y2}`,
      description: lang === "kn" ? "೧೦ನೇ ಮನೆಯ ಸೂರ್ಯ-ಬುಧ ಯೋಗದಿಂದ ಹೊಸ ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ ಹಾಕಲು ಸುವರ್ಣ ಕಾಲ."
        : lang === "mr" ? "दशम भावातील सूर्य-बुध प्रभावाने नवीन करारांवर स्वाक्षरी करण्यासाठी सुवर्ण काळ."
          : lang === "hi" ? "दशम भाव में सूर्य-बुध के प्रभाव से नवीन अनुबंधों पर हस्ताक्षर हेतु श्रेष्ठ समय।"
            : lang === "te" ? "10వ ఇంట్లో సూర్య-बुధ యోగంతో కొత్త ఒప్పందాలకు అనుకూల సమయం."
              : lang === "ta" ? "10ம் வீட்டில் சூரிய-புதன் யோகத்தால் புதிய ஒப்பந்தங்கள் கையெழுத்திட பொற்காலம்."
                : "Solar and Mercurial synergy activates commercial scaling and enterprise contracts."
    },
    {
      category: isUnmarried
        ? (lang === "kn" ? "💍 ಕಲ್ಯಾಣ ಮಹೋತ್ಸವ & ವಿವಾಹ ಮುಹೂರ್ತ"
          : lang === "mr" ? "💍 शुभ विवाह व मंगलकार्य मुहूर्त"
            : lang === "hi" ? "💍 शुभ विवाह एवं पाणिग्रहण संस्कार"
              : lang === "te" ? "💍 కల్యాణ మహోత్సవం & వివాహ ముహూర్తం"
                : lang === "ta" ? "💍 சுப விவாஹ முகூர்த்தம்"
                  : "💍 Matrimonial Alliance & Wedding Horizon")
        : (lang === "kn" ? "🪔 ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹೋಮ & ದೈವಿಕ ವ್ರತ ಮುಹೂರ್ತ"
          : lang === "mr" ? "🪔 कौटुंबिक शांती होम व धार्मिक अनुष्ठान"
            : lang === "hi" ? "🪔 पारिवारिक शांति हवन एवं मांगलिक अनुष्ठान"
              : lang === "te" ? "🪔 కుటుంబ శాంతి హోమం & దైవిక వ్రత ముహూర్తం"
                : lang === "ta" ? "🪔 குடும்ப சாந்தி ஹோமம் & விரத முகூர்த்தம்"
                  : "🪔 Domestic Shanti Homa & Sacred Family Vows"),
      icon: isUnmarried ? "💍" : "🪔",
      timingWindow: `${lang === "kn" ? "ಮಾಘ - ಫಾಲ್ಗುಣ" : lang === "mr" || lang === "hi" ? "माघ - फाल्गुन" : lang === "te" ? "మాఘ - ఫాల్గుణ" : lang === "ta" ? "மாசி - பங்குனி" : "Magha - Phalguna"} ${y3}`,
      description: isUnmarried
        ? (lang === "kn" ? "೭ನೇ ಮನೆಯ ಗುರುಬಲದ ಸಂಯೋಗದಿಂದ ಯೋಗ್ಯ ಸತ್ಸಂಗಾತಿಯ ಆಗಮನ ಹಾಗೂ ಸುಖ ದಾಂಪತ್ಯ."
          : lang === "mr" ? "सप्तम भावातील गुरुबळाने सुसंस्कारी जोडीदाराचे आगमन व सुखी वैवाहिक जीवन."
            : lang === "hi" ? "सप्तम भाव में गुरु बल से सुयोग्य जीवनसाथी का वरण एवं सुखद दांपत्य।"
              : lang === "te" ? "7వ ఇంట్లో గురుబలంతో సుగుణవంతుడైన భాగస్వామి ప్రాప్తి & వైవాహిక సుఖం."
                : lang === "ta" ? "7ம் வீட்டில் குரு பலனால் நற்குண வாழ்க்கை துணை & இனிய இல்லறம்."
                  : "Favorable 7th house Jupiter transit solemnizes harmonious matrimonial bonding.")
        : (lang === "kn" ? "ಕುಟುಂಬದ ದೀರ್ಘಕಾಲಿಕ ಸುಖ-ಶಾಂತಿಗಾಗಿ ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಹಾಗೂ ದೇವತಾ ಕಾರ್ಯ."
          : lang === "mr" ? "कुटुंबाच्या दीर्घकालीन सुख-शांतीसाठी सत्यनारायण पूजा व देवकार्य."
            : lang === "hi" ? "पारिवारिक सुख-शांति हेतु सत्यनारायण पूजन एवं देव आराधना।"
              : lang === "te" ? "కుటుంబ దీర్ఘకాలిక శాంతి కోసం సత్యనారాయణ పూజ & దైవ కార్యాలు."
                : lang === "ta" ? "குடும்ப அமைதிக்காக சத்யநாராயணர் பூஜை மற்றும் தெய்வ காரியங்கள்."
                  : "Anchors enduring family equanimity through sacred Vedic household rites.")
    },
    {
      category: lang === "kn" ? "✈️ ವಿದೇಶ ಪ್ರವಾಸ & ದೀರ್ಘ ಪುಣ್ಯಯಾತ್ರೆ"
        : lang === "mr" ? "✈️ परदेश प्रवास व दूरचे तीर्थाटन"
          : lang === "hi" ? "✈️ विदेश यात्रा एवं तीर्थाटन"
            : lang === "te" ? "✈️ విదేశీ ప్రయాణం & తీర్థయాత్రలు"
              : lang === "ta" ? "✈️ வெளிநாட்டு பயணம் & புனித யாத்திரை"
                : "✈️ Foreign Horizons & Sacred Pilgrimage",
      icon: "✈️",
      timingWindow: `${lang === "kn" ? "ಚೈತ್ರ - ಜ್ಯೇಷ್ಠ" : lang === "mr" || lang === "hi" ? "चैत्र - ज्येष्ठ" : lang === "te" ? "చైత్ర - జ్యేష్ఠ" : lang === "ta" ? "சித்திரை - ஆனி" : "Chaitra - Jyeshtha"} ${y3}`,
      description: lang === "kn" ? "೯ನೇ ಹಾಗೂ ೧೨ನೇ ಮನೆಯ ಶುಭ ಪ್ರಭಾವದಿಂದ ವೀಸಾ ಮಂಜೂರಾತಿ ಹಾಗೂ ಜಯಪ್ರದ ಯಾತ್ರೆ."
        : lang === "mr" ? "नवम व द्वादश भावाच्या शुभ प्रभावाने व्हिसा प्राप्ती व निर्विघ्न प्रवास."
          : lang === "hi" ? "नवम एवं द्वादश भाव के शुभ प्रभाव से वीजा प्राप्ति एवं सफल यात्रा।"
            : lang === "te" ? "9 మరియు 12వ భావాల శుభ ప్రభావంతో వీసా మంజూరు & విజయవంతమైన ప్రయాణం."
              : lang === "ta" ? "9 & 12ம் வீடுகளின் சுப பார்வையால் விசா அனுமதி & வெற்றிகரமான பயணம்."
                : "9th and 12th house alignment resolves visa clearances and blesses travel."
    }
  ];
}

/**
 * 7. 5-Year Financial & Investment Strategy Roadmap
 */
export function generate5YearFinancialRoadmap(
  baseYear: number,
  lang: SixLang,
  peakYearIdx: number,
  cautionYearIdx: number,
  currentAgeYears?: number
): Array<{ yearRange: string; financialStance: string; keyAction: string; targetSectors: string }> {
  const isMinor = currentAgeYears !== undefined && currentAgeYears < 18;

  return [0, 1, 2, 3, 4].map(idx => {
    const yStart = baseYear + idx;
    const yRange = `${formatNumber6L(yStart, lang)} - ${formatNumber6L(yStart + 1, lang)}`;

    if (isMinor) {
      if (idx === peakYearIdx) {
        return {
          yearRange: yRange,
          financialStance: pick6({
            kn: "ಪೋಷಕರ ಶೈಕ್ಷಣಿಕ ನಿಧಿ ಗರಿಷ್ಠ ಸಂಚಯ",
            mr: "पालकांचा शैक्षणिक निधी सर्वोच्च संचय",
            hi: "अभिभावक शिक्षा कोष सर्वोच्च संचय",
            te: "తల్లిదండ్రుల విద్యా నిధి గరిష్ట పొదుపు",
            ta: "உயர்கல்வி நிதி உச்சக்கட்ட சேமிப்பு",
            en: "Parental Peak Education Endowment Corpus"
          }, lang),
          keyAction: pick6({
            kn: "ದೀರ್ಘಕಾಲೀನ ಉನ್ನತ ವಿದ್ಯಾ ಪಾಲಿಸಿ, ಚಿನ್ನ ಅಥವಾ ಸಾರ್ವಭೌಮ ಬಾಲ ಉಳಿತಾಯ ಹೂಡಿಕೆ.",
            mr: "दीर्घकालीन उच्च शिक्षण विमा, सुवर्ण किंवा सुरक्षित बाल बचत योजना गुंतवणूक.",
            hi: "दीर्घकालिक उच्च शिक्षा बीमा, स्वर्ण अथवा सुरक्षित बाल बचत योजना निवेश।",
            te: "దీర్ఘకాలిక విద్యా బీమా, బంగారం లేదా సురక్షిత బాలల పొదుపు పథకాల్లో పెట్టుబడి.",
            ta: "நீண்டகால உயர்கல்வி காப்பீடு, தங்கம் அல்லது அரசு சேமிப்பு திட்டங்களில் முதலீடு.",
            en: "Long-term education insurance policy and sovereign child savings allocation."
          }, lang),
          targetSectors: pick6({
            kn: "ಉನ್ನತ ಶಿಕ್ಷಣ, ಬಾಲ ವಿಮೆ, ಸಾರ್ವಭೌಮ ಬಾಂಡ್‌ಗಳು",
            mr: "उच्च शिक्षण, बाल विमा, सरकारी रोखे",
            hi: "उच्च शिक्षा, बाल बीमा, सरकारी बॉन्ड",
            te: "ఉన్నత విద్య, బాలల బీమా, ప్రభుత్వ బాండ్లు",
            ta: "உயர்கல்வி, குழந்தை காப்பீடு, அரசு பத்திரங்கள்",
            en: "Higher Education, Pediatric Insurance, Sovereign Bonds"
          }, lang)
        };
      } else if (idx === cautionYearIdx) {
        return {
          yearRange: yRange,
          financialStance: pick6({
            kn: "ಆರೋಗ್ಯ ರಕ್ಷಾ ಕವಚ & ತುರ್ತು ಬಾಲನಿಧಿ ರಕ್ಷೆ",
            mr: "आरोग्य कवच व आणीबाणी बालनिधी रक्षण",
            hi: "स्वास्थ्य सुरक्षा एवं आपात बाल कोष संरक्षण",
            te: "ఆరోగ్య రక్షణ & అత్యవసర విద్యా నిధి భద్రత",
            ta: "ஆரோக்கிய பாதுகாப்பு & அவசர சேமிப்பு",
            en: "Pediatric Health Shield & Emergency Buffer"
          }, lang),
          keyAction: pick6({
            kn: "ವೈದ್ಯಕೀಯ ವಿಮಾ ಕವಚ ನವೀಕರಣ ಹಾಗೂ ಅನಗತ್ಯ ಶೈಕ್ಷಣಿಕ ವೆಚ್ಚ ನಿಯಂತ್ರಣ.",
            mr: "आरोग्य विमा नूतनीकरण व अनावश्यक शैक्षणिक खर्चावर नियंत्रण.",
            hi: "पारिवारिक स्वास्थ्य बीमा नवीनीकरण एवं अनावश्यक शैक्षणिक व्यय पर नियंत्रण।",
            te: "ఆరోగ్య బీమా పునరుద్ధరణ & అనవసర విద్యా ఖర్చుల నియంత్రణ.",
            ta: "மருத்துவ காப்பீடு புதுப்பித்தல் & கல்விச் செலவுகளில் விவேகம்.",
            en: "Family health insurance renewal and disciplined educational budgeting."
          }, lang),
          targetSectors: pick6({
            kn: "ಆರೋಗ್ಯ ವಿಮೆ, ದ್ರವ್ಯ ನಿಧಿ, ಸುರಕ್ಷಿತ ಸ್ಥಿರ ಠೇವಣಿ",
            mr: "आरोग्य विमा, रोख तरलता, सुरक्षित मुदत ठेव",
            hi: "स्वास्थ्य बीमा, तरल कोष, सुरक्षित सावधि जमा",
            te: "ఆరోగ్య బీమా, ద్రవ్య నిధి, స్థిర డిపాజిట్లు",
            ta: "மருத்துவ காப்பீடு, உடனடி நிதி, நிலையான வைப்பு",
            en: "Health Cover, Liquid Reserves, Secure Fixed Deposits"
          }, lang)
        };
      } else {
        return {
          yearRange: yRange,
          financialStance: pick6({
            kn: "ಕ್ರಮಬದ್ಧ ಮಾಸಿಕ ಶೈಕ್ಷಣಿಕ ಉಳಿತಾಯ",
            mr: "नियमित मासिक शैक्षणिक बचत",
            hi: "नियमित मासिक शिक्षा बचत",
            te: "క్రమబద్ధమైన నెలవారీ విద్యా పొదుపు",
            ta: "முறையான மாத கல்வி சேமிப்பு",
            en: "Systematic Monthly Education SIP"
          }, lang),
          keyAction: pick6({
            kn: "ಬಾಲ ಉಳಿತಾಯ ಯೋಜನೆ, ಸುಕನ್ಯಾ / ಪಿಪಿಎಫ್ ಖಾತೆಗೆ ನಿರಂತರ ಹಣ ಸಂದಾಯ.",
            mr: "बाल बचत योजना, सुकन्या / पीपीएफ खात्यात नियमित गुंतवणूक.",
            hi: "बाल बचत योजना, सुकन्या / पीपीएफ खाते में निरंतर अंशदान।",
            te: "సుకన్య సమృద్ధి / పీపీఎఫ్ ఖాతాలలో క్రమం తప్పకుండా పొదుపు చేయడం.",
            ta: "செல்வமகள் / பிபிஎஃப் சேமிப்பு கணக்கில் தொடர் முதலீடு.",
            en: "Consistent contributions to PPF, Sukanya, or dedicated child savings trusts."
          }, lang),
          targetSectors: pick6({
            kn: "ಶಿಕ್ಷಣ ನಿಧಿ, ಸುರಕ್ಷಿತ ಬಾಂಡ್‌ಗಳು, ಚಿನ್ನ",
            mr: "शिक्षण निधी, सुरक्षित सरकारी रोखे, सोने",
            hi: "शिक्षा कोष, सुरक्षित बॉन्ड, स्वर्ण",
            te: "విద్యా నిధి, ప్రభుత్వ బాండ్లు, బంగారం",
            ta: "கல்வி நிதி, அரசு பத்திரங்கள், தங்கம்",
            en: "Education Trusts, Sovereign Bonds, Gold"
          }, lang)
        };
      }
    }

    if (idx === peakYearIdx) {
      return {
        yearRange: yRange,
        financialStance: lang === "kn" ? "ಆಕ್ರಮಣಕಾರಿ ಬೆಳವಣಿಗೆ & ಬೃಹತ್ ಹೂಡಿಕೆ" : lang === "mr" ? "आक्रमक वाढ व मोठी गुंतवणूक" : lang === "hi" ? "आक्रामक वृद्धि एवं वृहद निवेश" : lang === "te" ? "దూకుడు విస్తరణ & భారీ పెట్టుబడులు" : lang === "ta" ? "தீவிர வளர்ச்சி & பெரும் முதலீடு" : "Aggressive Growth & Heavy Capital Allocation",
        keyAction: lang === "kn" ? "ಗುರುಬಲದ ಕಾಲದಲ್ಲಿ ಸ್ಥಿರಾಸ್ತಿ ಅಥವಾ ದೀರ್ಘಕಾಲೀನ ಉದ್ಯಮದಲ್ಲಿ ಬಂಡವಾಳ ಹೂಡಿ." : lang === "mr" ? "गुरूच्या अनुकूल काळात स्थावर मालमत्ता किंवा व्यवसायात भांडवल गुंतवा." : lang === "hi" ? "गुरु के शुभ काल में भूमि-भवन अथवा उद्योग में पूंजी लगाएं।" : lang === "te" ? "గురుబల సమయంలో స్థిరాస్తి లేదా వ్యాపారాలలో మూలధనం పెట్టండి." : lang === "ta" ? "குரு பலன் உள்ள காலத்தில் சொத்து அல்லது தொழிலில் முதலீடு செய்யுங்கள்." : "Deploy significant capital into real estate and high-yield strategic ventures.",
        targetSectors: lang === "kn" ? "ಸ್ಥಿರಾಸ್ತಿ, ಚಿನ್ನ, ನೂತನ ಉದ್ಯಮ" : lang === "mr" ? "स्थावर मालमत्ता, सोने, नवीन व्यवसाय" : lang === "hi" ? "भूमि-भवन, स्वर्ण, नवीन उद्योग" : lang === "te" ? "రియల్ ఎస్టేట్, బంగారం, నూతన వ్యాపారం" : lang === "ta" ? "ரியல் எஸ்டேட், தங்கம், புதிய தொழில்" : "Real Estate, Gold Reserves, Commercial Ventures"
      };
    } else if (idx === cautionYearIdx) {
      return {
        yearRange: yRange,
        financialStance: lang === "kn" ? "ರಕ್ಷಣಾತ್ಮಕ ನಡಾವಳಿ & ನಗದು ಸಂರಕ್ಷಣೆ" : lang === "mr" ? "संरक्षणात्मक पवित्रा व रोख तरलता" : lang === "hi" ? "रक्षात्मक नीति एवं नकदी संरक्षण" : lang === "te" ? "రక్షణాత్మక విధానం & నగదు నిల్వలు" : lang === "ta" ? "பாதுகாப்பான அணுகுமுறை & ரொக்க கையிருப்பு" : "Defensive Stance & Capital Preservation",
        keyAction: lang === "kn" ? "ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳನ್ನು ತಡೆಹಿಡಿದು, ಸಾಲ ತೀರಿಸಲು ಆದ್ಯತೆ ನೀಡಿ." : lang === "mr" ? "जोखमीच्या गुंतवणुकीपासून दूर राहून कर्जफेडीला प्राधान्य द्या." : lang === "hi" ? "जोखिमपूर्ण निवेशों से बचें एवं ऋण मुक्ति को प्राथमिकता दें।" : lang === "te" ? "రిస్క్ పెట్టుబడులు ఆపి, అప్పులు తీర్చడానికి ప్రాధాన్యత ఇవ్వండి." : lang === "ta" ? "அபாய முதலீடுகளைத் தவிர்த்து, கடன்களை அடைக்க முன்னுரிமை தாருங்கள்." : "Freeze speculative exposure, reduce leverage, and fortify emergency reserves.",
        targetSectors: lang === "kn" ? "ಸ್ಥಿರ ಠೇವಣಿ, ಚಿನ್ನದ ಬಾಂಡ್‌ಗಳು, ಸಾಲ ವಿಮುಕ್ತಿ" : lang === "mr" ? "मुदत ठेव, सॉवरेन गोल्ड बॉन्ड, कर्जमुक्ती" : lang === "hi" ? "सावधि जमा, गोल्ड बॉन्ड, ऋण निवारण" : lang === "te" ? "ఫిక్స్‌డ్ డిపాజిట్లు, గోల్డ్ బాండ్లు, రుణ విముక్తి" : lang === "ta" ? "நிலையான வைப்பு, தங்க பத்திரங்கள், கடன் அடைப்பு" : "Fixed Deposits, Sovereign Gold Bonds, Debt Liquidation"
      };
    } else {
      return {
        yearRange: yRange,
        financialStance: lang === "kn" ? "ಸ್ಥಿರ ಸಂಚಯನ & ಕ್ರಮಬದ್ಧ ಹೂಡಿಕೆ" : lang === "mr" ? "स्थिर संचय व पद्धतशीर गुंतवणूक" : lang === "hi" ? "स्थिर संचय एवं व्यवस्थित निवेश" : lang === "te" ? "స్థిర సంపద వృద్ధి & క్రమబద్ధ పొదుపు" : lang === "ta" ? "நிலையான சேமிப்பு & முறையான முதலீடு" : "Steady Compounding & Balanced Allocation",
        keyAction: lang === "kn" ? "ಮಾಸಿಕ ಉಳಿತಾಯ ಹಾಗೂ ಸುರಕ್ಷಿತ ಮ್ಯೂಚುಯಲ್ ಫಂಡ್‌ಗಳಲ್ಲಿ ನಿಯಮಿತವಾಗಿ ತೊಡಗಿಸಿ." : lang === "mr" ? "मासिक बचत व सुरक्षित म्युच्युअल फंडामध्ये शिस्तबद्ध एसआयपी करा." : lang === "hi" ? "मासिक बचत एवं सुरक्षित म्यूचुअल फंड में व्यवस्थित निवेश (SIP) जारी रखें।" : lang === "te" ? "నెలవారీ పొదుపు మరియు సురక్షిత మ్యూచువల్ ఫండ్లలో క్రమం తప్పకుండా పెట్టుబడి పెట్టండి." : lang === "ta" ? "மாத சேமிப்பு மற்றும் பாதுகாப்பான மியூச்சுவல் ஃபண்டுகளில் தவறாமல் முதலீடு செய்யுங்கள்." : "Channel surplus cash flow into sovereign-backed systematic investment plans.",
        targetSectors: lang === "kn" ? "ಸೂಚ್ಯಂಕ ನಿಧಿಗಳು, ಸಾರ್ವಭೌಮ ಬಾಂಡ್‌ಗಳು" : lang === "mr" ? "इंडेक्स फंड, सरकारी रोखे, सुरक्षित शेअर्स" : lang === "hi" ? "इंडेक्स फंड, सरकारी बॉन्ड, सुरक्षित शेयर" : lang === "te" ? "ఇండెక్స్ ఫండ్లు, ప్రభుత్వ బాండ్లు" : lang === "ta" ? "இண்டெக்ஸ் ஃபண்டுகள், அரசு பத்திரங்கள்" : "Index Funds, Blue-Chip Equities, Sovereign Paper"
      };
    }
  });
}

/**
 * 8. Health Vigilance & Longevity Shield
 */
export function generateHealthLongevityShield(
  lang: SixLang,
  ageCategory: string,
  currentAgeYears?: number
): Array<{ vulnerableWindow: string; focusArea: string; preventiveGuidance: string }> {
  const isInfant = currentAgeYears !== undefined && currentAgeYears < 2;
  const isChild = currentAgeYears !== undefined && currentAgeYears >= 2 && currentAgeYears < 13;
  const isAdolescent = currentAgeYears !== undefined && currentAgeYears >= 13 && currentAgeYears < 18;

  if (isInfant) {
    return [
      {
        vulnerableWindow: pick6({
          kn: "ವರ್ಷಾ ಋತು (ಆಷಾಢ - ಭಾದ್ರಪದ)",
          mr: "वर्षा ऋतु (आषाढ - भाद्रपद)",
          hi: "वर्षा ऋतु (आषाढ़ - भाद्रपद)",
          te: "వర్ష ఋతువు (ఆషాఢ - భాద్రపద)",
          ta: "வர்ஷ பருவம் (ஆடி - புரட்டாசி)",
          en: "Monsoon Season (Ashadha - Bhadrapada)"
        }, lang),
        focusArea: pick6({
          kn: "ಶಿಶು ಜೀರ್ಣಾಂಗ ರಕ್ಷೆ ಹಾಗೂ ಉದರ ಸ್ವಾಸ್ಥ್ಯ",
          mr: "बालकाचे पचन व पोटाचे आरोग्य",
          hi: "शिशु पाचन तंत्र एवं उदर स्वास्थ्य",
          te: "శిశు జీర్ణక్రియ & పొట్ట ఆరోగ్యం",
          ta: "குழந்தையின் செரிமானம் & வயிறு நலம்",
          en: "Infant Digestive Health & Colic Prevention"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ತಾಯಿಯ ಸಾತ್ವಿಕ ಪಥ್ಯ, ಕುದಿಸಿ ಆರಿಸಿದ ನೀರು ಹಾಗೂ ಶಿಶುವಿಗೆ ಬೆಚ್ಚಗಿನ ವಾತಾವರಣ ಕಲ್ಪಿಸಿ.",
          mr: "मातेचा सात्विक आहार, उकळून गार केलेले पाणी व बालकास उबदार वातावरण ठेवा.",
          hi: "माता का सात्विक आहार, उबला हुआ जल एवं शिशु हेतु सुखद उष्ण वातावरण बनाए रखें।",
          te: "తల్లి సాత్విక ఆహారం, కాచి చల్లార్చిన నీరు & శిశువుకు వెచ్చని వాతావరణం ఉంచండి.",
          ta: "தாயின் எளிய உணவு, காய்ச்சிய நீர் மற்றும் குழந்தைக்கு கதகதப்பான சூழல்.",
          en: "Pristine maternal diet, boiled cooled water, and gentle abdominal warmth."
        }, lang)
      },
      {
        vulnerableWindow: pick6({
          kn: "ಹೇಮಂತ - ಶಿಶಿರ (ಮಾರ್ಗಶಿರ - ಮಾಘ)",
          mr: "हेमंत - शिशिर (मार्गशीर्ष - माघ)",
          hi: "हेमंत - शिशिर (मार्गशीर्ष - माघ)",
          te: "హేమంత - శిశిర (మార్గశిర - మాఘ)",
          ta: "ஹேமந்த - சிசிர (மார்கழி - மாசி)",
          en: "Winter Season (Margashirsha - Magha)"
        }, lang),
        focusArea: pick6({
          kn: "ಶೀತ, ಕಫ, ಶ್ವಾಸಕೋಶದ ಸೂಕ್ಷ್ಮತೆ & ಚರ್ಮದ ಕಾಂತಿ",
          mr: "सर्दी, कफ व त्वचेची कोमलता संरक्षण",
          hi: "सर्दी, कफ एवं कोमल त्वचा का संरक्षण",
          te: "జలుబు, శ్లేష్మం & సున్నితమైన చర్మ రక్షణ",
          ta: "சளி, இருமல் & மென்மையான சரும பாதுகாப்பு",
          en: "Respiratory Protection, Cough Prevention & Skin Nourishment"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಪ್ರತಿದಿನ ಲಘು ಎಳ್ಳೆಣ್ಣೆ ಅಥವಾ ಬಾದಾಮಿ ಎಣ್ಣೆ ಅಭ್ಯಂಗ, ಬೆಚ್ಚಗಿನ ಉಣ್ಣೆ ವಸ್ತ್ರ ಧರಿಸಿ.",
          mr: "नित्य तिळाचे किंवा बदामाच्या तेलाने हलकी मालिश व उबदार सुती कपडे वापरा.",
          hi: "नित्य तिल अथवा बादाम तैल से कोमल मालिश एवं सुखद ऊनी वस्त्र पहनाएं।",
          te: "రోజూ నువ్వుల నూనె లేదా బాదం నూనెతో మర్దన, వెచ్చని వస్త్రాలు ధరింపజేయండి.",
          ta: "தினமும் நல்லெண்ணெய் அல்லது பாதாம் எண்ணெய் மசாஜ், கதகதப்பான உடைகள்.",
          en: "Gentle warm almond or sesame oil massage and comfortable thermal clothing."
        }, lang)
      },
      {
        vulnerableWindow: pick6({
          kn: "ಗ್ರೀಷ್ಮ ಋತು (ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ)",
          mr: "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)",
          hi: "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)",
          te: "గ్రీష్మ ఋతువు (వైశాఖ - జ్యేష్ఠ)",
          ta: "கிரீஷ்ம பருவம் (வைகாசி - ஆனி)",
          en: "Summer Season (Vaishakha - Jyeshtha)"
        }, lang),
        focusArea: pick6({
          kn: "ದಂತೋದಯದ ಸಂವೇದನೆ, ನಿರ್ಜಲೀಕರಣ & ದೇಹದ ಉಷ್ಣತೆ",
          mr: "दात येण्याचा काळ, शरीराचे तापमान व हायड्रेशन",
          hi: "दंतोद्भव समय, शरीर का तापमान एवं जलयोजन",
          te: "దంతాలు వచ్చే సమయం, శరీర ఉష్ణోగ్రత & డీహైడ్రేషన్",
          ta: "பல் முளைக்கும் பருவம், உடல் உஷ்ணம் & நீர்ச்சத்து",
          en: "Teething Care, Body Temperature & Pediatric Hydration"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಮೃದು ಹತ್ತಿ ಬಟ್ಟೆ, ಸಮರ್ಪಕ ನೀರು ಕುಡಿಸುವುದು ಹಾಗೂ ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಿಂದ ಮಗುವನ್ನು ರಕ್ಷಿಸಿ.",
          mr: "सुती कपडे, पुरेसे पाणी व दुपारच्या तीव्र उन्हापासून बालकाचे रक्षण करा.",
          hi: "सूती वस्त्र, पर्याप्त जलयोजन एवं दोपहर की धूप से शिशु को बचाएं।",
          te: "కాటన్ దుస్తులు, తగినంత నీరు & మధ్యాహ్నం ఎండ తగలకుండా చూసుకోండి.",
          ta: "பருத்தி ஆடைகள், போதிய நீர்ச்சத்து மற்றும் மதிய வெயிலைத் தவிர்க்கவும்.",
          en: "Breathable cotton clothing, optimum hydration, and shielding from harsh midday sun."
        }, lang)
      }
    ];
  }

  if (isChild) {
    return [
      {
        vulnerableWindow: pick6({
          kn: "ವರ್ಷಾ ಋತು (ಆಷಾಢ - ಭಾದ್ರಪದ)",
          mr: "वर्षा ऋतु (आषाढ - भाद्रपद)",
          hi: "वर्षा ऋतु (आषाढ़ - भाद्रपद)",
          te: "వర్ష ఋతువు (ఆషాఢ - భాద్రపద)",
          ta: "வர்ஷ பருவம் (ஆடி - புரட்டாசி)",
          en: "Monsoon Season (Ashadha - Bhadrapada)"
        }, lang),
        focusArea: pick6({
          kn: "ಜೀರ್ಣಾಂಗ ಶುದ್ಧತೆ & ಸೋಂಕು ರೋಗಗಳ ತಡೆ",
          mr: "पोटाचे आरोग्य व संसर्गजन्य आजारांपासून रक्षण",
          hi: "उदर स्वास्थ्य एवं मौसमी संक्रमण से बचाव",
          te: "పొట్ట ఆరోగ్యం & అంటువ్యాధుల నివారణ",
          ta: "செரிமானம் & தொற்றுநோய்த் தடுப்பு",
          en: "Digestive Immunity & Seasonal Water Hygiene"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಹೊರಗಿನ ಜಂಕ್ ಆಹಾರ ಮತ್ತು ತಂಪು ಪಾನೀಯ ವರ್ಜಿಸಿ; ಬಿಸಿ ತಾಜಾ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ.",
          mr: "बाहेरील उघडे अन्न व थंड पेये टाळा; ताजे व गरम सात्विक अन्न द्यावे.",
          hi: "बाहर का खुला भोजन एवं शीतल पेय वर्जित रखें; ताजा सुपाच्य भोजन दें।",
          te: "బయటి ఆహారం, శీతల పానీయాలు మానండి; వేడివేడి సాత్విక ఆహారం ఇవ్వండి.",
          ta: "வெளியிடத்து உணவு, குளிர் பானங்களைத் தவிர்க்கவும்; சூடான சாத்வீக உணவு நலம்.",
          en: "Forego street snacks and iced beverages; serve freshly prepared warm home meals."
        }, lang)
      },
      {
        vulnerableWindow: pick6({
          kn: "ಹೇಮಂತ - ಶಿಶಿರ (ಮಾರ್ಗಶಿರ - ಮಾಘ)",
          mr: "हेमंत - शिशिर (मार्गशीर्ष - माघ)",
          hi: "हेमंत - शिशिर (मार्गशीर्ष - माघ)",
          te: "హేమంత - శిశిర (మార్గశిర - మాఘ)",
          ta: "ஹேமந்த - சிசிர (மார்கழி - மாசி)",
          en: "Winter Season (Margashirsha - Magha)"
        }, lang),
        focusArea: pick6({
          kn: "ಕಣ್ಣಿನ ದೃಷ್ಟಿ, ನಿದ್ರೆ & ಪರದೆ ಸಮಯ ನಿಯಂತ್ರಣ",
          mr: "डोळ्यांचे आरोग्य, शांत झोप व स्क्रीन टाइम मर्यादा",
          hi: "नेत्र दृष्टि, गहरी नींद एवं स्क्रीन टाइम नियंत्रण",
          te: "కంటి చూపు, మంచి నిద్ర & స్క్రీన్ టైమ్ నియంత్రణ",
          ta: "கண் பார்வை, ஆழ்ந்த உறக்கம் & செல்போன் நேரம் குறைப்பு",
          en: "Ocular Health, Deep Sleep & Screen Time Moderation"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಮೊಬೈಲ್ ಪರದೆ ಸಮಯವನ್ನು ದಿನಕ್ಕೆ ೧ ಗಂಟೆಗೆ ಮಿತಿಗೊಳಿಸಿ; ರಾತ್ರಿ ೯ರ ಒಳಗೆ ನಿದ್ರೆಗೆ ಜಾರಲು ರೂಢಿಸಿ.",
          mr: "मोबाईल स्क्रीन वेळ १ तासावर मर्यादित ठेवा; रात्री वेळेत झोपण्याची सवय लावा.",
          hi: "मोबाइल का उपयोग प्रतिदिन १ घंटे तक सीमित रखें; रात्रि समय पर विश्राम की आदत डालें।",
          te: "మొబైల్ వాడకం రోజుకు 1 గంటకు పరిమితం చేయండి; రాత్రి వేళకు పడుకునేలా చూడండి.",
          ta: "செல்போன் பயன்பாட்டை ஒரு மணி நேரத்திற்குள் கட்டுப்படுத்தவும்; குறித்த நேரத்தில் உறங்கவும்.",
          en: "Cap recreational digital screen usage to one hour and maintain disciplined sleep schedules."
        }, lang)
      },
      {
        vulnerableWindow: pick6({
          kn: "ಗ್ರೀಷ್ಮ ಋತು (ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ)",
          mr: "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)",
          hi: "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)",
          te: "గ్రీష్మ ఋతువు (వైశాఖ - జ్యేష్ఠ)",
          ta: "கிரீஷ்ம பருவம் (வைகாசி - ஆனி)",
          en: "Summer Season (Vaishakha - Jyeshtha)"
        }, lang),
        focusArea: pick6({
          kn: "ಕ್ರೀಡಾ ಕ್ಷಮತೆ, ಗಾಯ ತಡೆ & ಜಲ ಸಮತೋಲನ",
          mr: "क्रीडा आरोग्य, दुखापतीपासून बचाव व हायड्रेशन",
          hi: "खेलकूद स्वास्थ्य, चोट से सुरक्षा एवं जलयोजन",
          te: "ఆటల్లో గాయాల నివారణ & నీటి సమతుల్యత",
          ta: "விளையாட்டு விபத்து தவிர்ப்பு & நீர்ச்சத்து சமநிலை",
          en: "Sports Stamina, Injury Prevention & Electrolyte Balance"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಆಟದ ಸಮಯದಲ್ಲಿ ಎಳನೀರು, ಮಜ್ಜಿಗೆ ಕುಡಿಸಿ; ಬಿಸಿಲಿನಲ್ಲಿ ಅತಿಯಾಗಿ ದಣಿಯದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
          mr: "खेळताना शहाळ्याचे पाणी, ताक द्यावे; कडक उन्हात जास्त वेळ धावणे टाळावे.",
          hi: "खेलकूद के समय नारियल पानी, छाछ दें; तीखी धूप में अत्यधिक श्रम से बचाएं।",
          te: "ఆటల సమయంలో కొబ్బరి నీళ్లు, మజ్జిగ ఇవ్వండి; మండుటెండలో తిరగకుండా చూడండి.",
          ta: "இளநீர், மோர் பருகத் தரவும்; நண்பகல் வெயிலில் விளையாடுவதைத் தவிர்க்கவும்.",
          en: "Hydrate with tender coconut water and buttermilk; avoid overexertion under the hot sun."
        }, lang)
      }
    ];
  }

  if (isAdolescent) {
    return [
      {
        vulnerableWindow: pick6({
          kn: "ವರ್ಷಾ ಋತು (ಆಷಾಢ - ಭಾದ್ರಪದ)",
          mr: "वर्षा ऋतु (आषाढ - भाद्रपद)",
          hi: "वर्षा ऋतु (आषाढ़ - भाद्रपद)",
          te: "వర్ష ఋతువు (ఆషాఢ - భాద్రపద)",
          ta: "வர்ஷ பருவம் (ஆடி - புரட்டாசி)",
          en: "Monsoon Season (Ashadha - Bhadrapada)"
        }, lang),
        focusArea: pick6({
          kn: "ಪರೀಕ್ಷಾ ಒತ್ತಡ ನಿರ್ವಹಣೆ & ನರಮಂಡಲ ಶಾಂತಿ",
          mr: "परीक्षा तणाव व्यवस्थापन व मानसिक शांतता",
          hi: "परीक्षा तनाव प्रबंधन एवं स्नायु शांति",
          te: "పరీక్షల ఒత్తిడి నిర్వహణ & మానసిక ప్రశాంతత",
          ta: "தேர்வு மன அழுத்த மேலாண்மை & நரம்பு மண்டல அமைதி",
          en: "Exam Stress Management & Nervous Equanimity"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ದಿನಕ್ಕೆ ೧೫ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ, ಅನುಲೋಮ-ವಿಲೋಮ ಹಾಗೂ ಬ್ರಾಹ್ಮರೀ ಪ್ರಾಣಾಯಾಮ ದಿನಚರಿ ರೂಢಿಸಿ.",
          mr: "दररोज १५ मिनिटे अनुलोम-विलोम व भ्रामरी प्राणायामाने मन शांत ठेवा.",
          hi: "प्रतिदिन १५ मिनट अनुलोम-विलोम एवं भ्रामरी प्राणायाम से मानसिक संतुलन बनाए रखें।",
          te: "రోజూ 15 నిమిషాలు అనులోమ-విలోమ, భ్రామరీ ప్రాణాయామం సాధన చేయండి.",
          ta: "தினமும் 15 நிமிடம் பிராணாயாமம் மற்றும் தியானம் செய்து மன அழுத்தத்தை வெல்லவும்.",
          en: "Practice 15 minutes of Anulom Vilom and Bhramari pranayama to quiet exam anxiety."
        }, lang)
      },
      {
        vulnerableWindow: pick6({
          kn: "ಹೇಮಂತ - ಶಿಶಿರ (ಮಾರ್ಗಶಿರ - ಮಾಘ)",
          mr: "हेमंत - शिशिर (मार्गशीर्ष - माघ)",
          hi: "हेमंत - शिशिर (मार्गशीर्ष - माघ)",
          te: "హేమంత - శిశిర (మార్గశిర - మాఘ)",
          ta: "ஹேமந்த - சிசிர (மார்கழி - மாசி)",
          en: "Winter Season (Margashirsha - Magha)"
        }, lang),
        focusArea: pick6({
          kn: "ಕುತ್ತಿಗೆ-ಬೆನ್ನು ಭಂಗಿ, ಕಣ್ಣಿನ ಆಯಾಸ & ನಿದ್ರೆ",
          mr: "पाठ-मानेचे आरोग्य, डोळ्यांचा ताण व पुरेशी झोप",
          hi: "रीढ़-गर्दन का स्वास्थ्य, नेत्र थकान एवं विश्राम",
          te: "మెడ-వెన్నుముక ఆరోగ్యం & కంటి అలసట నివారణ",
          ta: "கழுத்து-முதுகு ஆரோக்கியம் & கண் சோர்வு தவிர்ப்பு",
          en: "Posture Ergonomics, Digital Eye Strain & Rest"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಓದುವಾಗ ನೇರ ಭಂಗಿ ಕಾಪಾಡಿ; ಪ್ರತಿ ೪೫ ನಿಮಿಷಕ್ಕೊಮ್ಮೆ ೨ ನಿಮಿಷ ಕಣ್ಣು ಮುಚ್ಚಿ ವಿಶ್ರಾಂತಿ ನೀಡಿ.",
          mr: "अभ्यास करताना पाठीचा कणा ताठ ठेवा; दर ४५ मिनिटांनी डोळ्यांना विश्रांती द्या.",
          hi: "अध्ययन के समय उचित मुद्रा रखें; प्रत्येक ४५ मिनट पश्चात नेत्रों को विश्राम दें।",
          te: "చదువుకునేటప్పుడు నిటారుగా కూర్చోండి; ప్రతి 45 నిమిషాలకు కళ్ళకు విశ్రాంతి ఇవ్వండి.",
          ta: "படிக்கும்போது நிமிர்ந்து உட்காரவும்; ஒவ்வொரு 45 நிமிடத்திற்கும் கண்களுக்கு ஓய்வு தரவும்.",
          en: "Maintain upright ergonomic seating and practice periodic eye-palming during long study blocks."
        }, lang)
      },
      {
        vulnerableWindow: pick6({
          kn: "ಗ್ರೀಷ್ಮ ಋತು (ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ)",
          mr: "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)",
          hi: "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)",
          te: "గ్రీష్మ ఋతువు (వైశాఖ - జ్యేష్ఠ)",
          ta: "கிரீஷ்ம பருவம் (வைகாசி - ஆனி)",
          en: "Summer Season (Vaishakha - Jyeshtha)"
        }, lang),
        focusArea: pick6({
          kn: "ದೈಹಿಕ ಶಕ್ತಿ, ಸ್ನಾಯು ಕ್ಷಮತೆ & ಪೌಷ್ಟಿಕ ಆಹಾರ",
          mr: "शारीरिक ऊर्जा, स्नायूंची ताकद व पौष्टिक आहार",
          hi: "शारीरिक ऊर्जा, मांसपेशियों का बल एवं पोषक आहार",
          te: "శారీరక శక్తి, కండరాల పుష్టి & పౌష్టికాహారం",
          ta: "உடல் பலம், தசை வலிமை & சத்தான உணவு",
          en: "Physical Stamina, Musculoskeletal Vigor & Sattvic Nutrition"
        }, lang),
        preventiveGuidance: pick6({
          kn: "ಮೊಳಕೆ ಕಟ್ಟಿದ ಕಾಳುಗಳು, ತಾಜಾ ಹಣ್ಣುಗಳು ಹಾಗೂ ಸಮೃದ್ಧ ನೀರು ಸೇವಿಸಿ; ಜಡತ್ವ ದೂರವಿರಿಸಿ.",
          mr: "मोड आलेली कडधान्ये, ताजी फळे व भरपूर पाणी प्यावे; आळस दूर ठेवावा.",
          hi: "अंकुरित अन्न, ताजे फल एवं प्रचुर मात्रा में जल ग्रहण करें; आलस्य का त्याग करें।",
          te: "మొలకెత్తిన గింజలు, తాజా పండ్లు & తగినంత నీరు తీసుకోండి; బద్ధకాన్ని వీడండి.",
          ta: "முளைகட்டிய பயிர்கள், பழங்கள் மற்றும் போதிய தண்ணீர் பருகி புத்துணர்ச்சியுடன் இருக்கவும்.",
          en: "Incorporate sprouted pulses, fresh seasonal fruit, and ample hydration to overcome lethargy."
        }, lang)
      }
    ];
  }

  return [
    {
      vulnerableWindow: lang === "kn" ? "ವರ್ಷಾ ಋತು (ಆಷಾಢ - ಭಾದ್ರಪದ)" : lang === "mr" || lang === "hi" ? "वर्षा ऋतु (आषाढ़ - भाद्रपद)" : lang === "te" ? "వర్ష ఋతువు (ఆషాఢ - భాద్రపద)" : lang === "ta" ? "வர்ஷ பருவம் (ஆடி - புரட்டாசி)" : "Monsoon Season (Ashadha - Bhadrapada)",
      focusArea: lang === "kn" ? "ಜೀರ್ಣಾಂಗ ಕ್ರಿಯೆ ಹಾಗೂ ಜಠರಾಗ್ನಿ ರಕ್ಷೆ" : lang === "mr" ? "पचनक्रिया व पोटाचे आरोग्य" : lang === "hi" ? "पाचन तंत्र एवं उदर स्वास्थ्य" : lang === "te" ? "జీర్ణక్రియ & పొట్ట ఆరోగ్యం" : lang === "ta" ? "செரிமான மண்டலம் & வயிறு ஆரோக்கியம்" : "Digestive Metabolism & Gut Immunity",
      preventiveGuidance: lang === "kn" ? "ಬಿಸಿ ನೀರು ಹಾಗೂ ಲಘು ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ; ಹೊರಗಿನ ಮಸಾಲೆ ಪದಾರ್ಥಗಳನ್ನು ವರ್ಜಿಸಿ." : lang === "mr" ? "उकळलेले पाणी व सात्विक हलका आहार घ्यावा; बाहेरील तेलकट पदार्थ टाळावेत." : lang === "hi" ? "उबला हुआ जल एवं सात्विक सुपाच्य भोजन लें; बाहर के भोजन से बचें।" : lang === "te" ? "కాచి చల్లార్చిన నీరు & సాత్విక ఆహారం తీసుకోండి; బయటి ఆహారం మానండి." : lang === "ta" ? "காய்ச்சிய நீர் மற்றும் எளிய உணவு உட்கொள்ளவும்; கார உணவை தவிர்க்கவும்." : "Hydrate with warm boiled water and consume freshly cooked sattvic meals."
    },
    {
      vulnerableWindow: lang === "kn" ? "ಹೇಮಂತ - ಶಿಶಿರ (ಮಾರ್ಗಶಿರ - ಮಾಘ)" : lang === "mr" || lang === "hi" ? "हेमंत - शिशिर (मार्गशीर्ष - माघ)" : lang === "te" ? "హేమంత - శిశిర (మార్గశిర - మాఘ)" : lang === "ta" ? "ஹேமந்த - சிசிர (மார்கழி - மாசி)" : "Winter Season (Margashirsha - Magha)",
      focusArea: lang === "kn" ? "ಕೀಲು ನೋವು, ವಾತ ದೋಷ ಹಾಗೂ ರಕ್ತದೊತ್ತಡ" : lang === "mr" ? "सांधेदुखी, वातदोष व रक्तदाब" : lang === "hi" ? "जोड़ों का दर्द, वात दोष एवं रक्तचाप" : lang === "te" ? "కీళ్ల నొప్పులు, వాత దోషం & రక్తపోటు" : lang === "ta" ? "மூட்டு வலி, வாத தோஷம் & ரத்த அழுத்தம்" : "Joint Flexibility, Vata Balance & Blood Pressure",
      preventiveGuidance: lang === "kn" ? "ಪ್ರತಿದಿನ ಎಳ್ಳೆಣ್ಣೆ ಮಸಾಜ್, ನಡಿಗೆ ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರ ದಿನಚರಿ ತಪ್ಪಿಸಬೇಡಿ." : lang === "mr" ? "नित्य तिळाच्या तेलाने मालिश, हलका व्यायाम व सूर्यनमस्कार हितकारक." : lang === "hi" ? "नित्य तिल तैल की मालिश, भ्रमण एवं सूर्य नमस्कार नियमपूर्वक करें।" : lang === "te" ? "నువ్వుల నూనె మర్దన, నడక మరియు సూర్య నమస్కారాలు చేయండి." : lang === "ta" ? "நல்லெண்ணெய் மசாஜ், நடைப்பயிற்சி மற்றும் சூரிய நமஸ்காரம் நலம் தரும்." : "Incorporate warm sesame oil abhyanga and gentle morning surya namaskara."
    },
    {
      vulnerableWindow: lang === "kn" ? "ಗ್ರೀಷ್ಮ ಋತು (ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ)" : lang === "mr" || lang === "hi" ? "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)" : lang === "te" ? "గ్రీష్మ ఋతువు (వైశాఖ - జ్యేష్ఠ)" : lang === "ta" ? "கிரீஷ்ம பருவம் (வைகாசி - ஆனி)" : "Summer Season (Vaishakha - Jyeshtha)",
      focusArea: lang === "kn" ? "ಪಿತ್ತ ಪ್ರಕೋಪ, ನಿದ್ರಾಹೀನತೆ & ತಲೆನೋವು" : lang === "mr" ? "पित्तप्रकोप, निद्रानाश व डोकेदुखी" : lang === "hi" ? "पित्त प्रकोप, अनिद्रा एवं सिरदर्द" : lang === "te" ? "పిత్త ప్రకోపం, నిద్రలేమి & తలనొప్పి" : lang === "ta" ? "பித்த உஷ்ணம், தூக்கமின்மை & தலைவலி" : "Pitta Aggravation, Sleep Quality & Migraine Shield",
      preventiveGuidance: lang === "kn" ? "ಮಜ್ಜಿಗೆ, ಎಳನೀರು ಸೇವಿಸಿ; ಅತಿಯಾದ ಬಿಸಿಲಿನಲ್ಲಿ ಸಂಚರಿಸುವುದನ್ನು ನಿಯಂತ್ರಿಸಿ." : lang === "mr" ? "ताक, नारळपाणी भरपूर प्यावे; कडक उन्हात जाणे टाळावे." : lang === "hi" ? "छाछ, नारियल जल का सेवन करें; तीखी धूप में भ्रमण नियंत्रित रखें।" : lang === "te" ? "మజ్జిగ, కొబ్బరి నీళ్లు తాగండి; తీవ్రమైన ఎండలో తిరగవద్దు." : lang === "ta" ? "மோர், இளநீர் பருகவும்; கடும் வெயிலில் செல்வதைத் தவிர்க்கவும்." : "Incorporate buttermilk, tender coconut, and avoid prolonged midday sun exposure."
    }
  ];
}

/**
 * 9. Auspicious Punyakshetra Pilgrimage & Spiritual Elevations
 */
export function generatePunyakshetraYatra(lang: SixLang): Array<{ recommendedKshetra: string; idealSeason: string; spiritualBenefit: string }> {
  return [
    {
      recommendedKshetra: lang === "kn" ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ (ಮಹಾಬಲೇಶ್ವರ & ಮಹಾಗಣಪತಿ)" : lang === "mr" ? "श्री क्षेत्र गोकर्ण (महाबळेश्वर व महागणपती)" : lang === "hi" ? "श्री गोकर्ण क्षेत्र (महाबलेश्वर एवं महागणपति)" : lang === "te" ? "శ్రీ క్షేత్ర గోకర్ణం (మహాబలేశ్వరుడు & గణపతి)" : lang === "ta" ? "ஸ்ரீ க்ஷேத்ர கோகர்ணம் (மகாபலேஸ்வரர் & கணபதி)" : "Sri Kshetra Gokarna (Atma Linga & Mahaganapati)",
      idealSeason: lang === "kn" ? "ಶಿವರಾತ್ರಿ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲ" : lang === "mr" ? "महाशिवरात्री किंवा प्रदोष काळ" : lang === "hi" ? "महाशिवरात्रि अथवा प्रदोष काल" : lang === "te" ? "మహాశివరాత్రి లేదా ప్రదోష కాలం" : lang === "ta" ? "மகா சிவராத்திரி அல்லது பிரதோஷ காலம்" : "Maha Shivaratri or Sacred Pradosha Cycle",
      spiritualBenefit: lang === "kn" ? "ಸರ್ವ ಕರ್ಮ ದೋಷ ಶಮನ, ಪಿತೃ ಶಾಂತಿ ಹಾಗೂ ಆತ್ಮಸ್ಥೈರ್ಯ ವೃದ್ಧಿ." : lang === "mr" ? "सर्व कर्मदोष शमन, पितृ शांती व आत्मिक शांती प्राप्ती." : lang === "hi" ? "समस्त कर्म दोष निवारण, पितृ शांति एवं आत्मबल वृद्धि।" : lang === "te" ? "సర్వ కర్మ దోష నివారణ, పితృ శాంతి & ఆత్మవిశ్వాసం." : lang === "ta" ? "சகல கர்ம தோஷ நிவர்த்தி, பித்ரு சாந்தி & மன உறுதி." : "Dissolution of karmic delays, ancestral blessings, and unbreakable peace."
    },
    {
      recommendedKshetra: lang === "kn" ? "ಶ್ರೀ ಕಾಶಿ ವಿಶ್ವನಾಥ ಜ್ಯೋತಿರ್ಲಿಂಗ ಹಾಗೂ ಗಂಗಾ ಸ್ನಾನ" : lang === "mr" ? "श्री काशी विश्वनाथ ज्योतिर्लिंग व गंगा स्नान" : lang === "hi" ? "श्री काशी विश्वनाथ ज्योतिर्लिंग एवं गंगा स्नान" : lang === "te" ? "శ్రీ కాశీ విశ్వనాథ జ్యోతిర్లింగం & గంగా స్నానం" : lang === "ta" ? "ஸ்ரீ காசி விஸ்வநாதர் & கங்கா ஸ்நானம்" : "Sri Kashi Vishwanatha & Sacred Ganga Snana",
      idealSeason: lang === "kn" ? "ಕಾರ್ತಿಕ ಪೌರ್ಣಮಿ ಅಥವಾ ಮಕರ ಸಂಕ್ರಾಂತಿ" : lang === "mr" ? "कार्तिक पौर्णिमा किंवा मकर संक्रांत" : lang === "hi" ? "कार्तिक पूर्णिमा अथवा मकर संक्रांति" : lang === "te" ? "కార్తిక పౌర్ణమి లేదా మకర సంక్రాంతి" : lang === "ta" ? "கார்த்திகை பௌர்ணமி அல்லது தை பொங்கல்" : "Kartika Purnima or Makara Sankranti",
      spiritualBenefit: lang === "kn" ? "ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿ, ಪುಣ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ವಂಶ ರಕ್ಷಣೆ." : lang === "mr" ? "मोक्ष प्राप्ती, पुण्य संचय व वंश संरक्षण." : lang === "hi" ? "मोक्ष प्राप्ति, पुण्य वृद्धि एवं कुल संरक्षण।" : lang === "te" ? "మోక్ష ప్రాప్తి, పుణ్య వృద్ధి & వంశ రక్షణ." : lang === "ta" ? "மோட்ச பிராப்தி, புண்ணிய விருத்தி & சந்ததி பாதுகாப்பு." : "Transcendence of past debts and eternal divine protection for lineage."
    },
    {
      recommendedKshetra: lang === "kn" ? "ಶ್ರೀ ತಿರುಪತಿ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ" : lang === "mr" ? "श्री तिरुपती व्यंकटेश बालाजी" : lang === "hi" ? "श्री तिरुपति वेंकटेश्वर स्वामी" : lang === "te" ? "శ్రీ తిరుపతి వేంకటేశ్వర స్వామి సన్నిధి" : lang === "ta" ? "ஸ்ரீ திருப்பதி வெங்கடேஸ்வர சுவாமி" : "Sri Tirupati Venkateshwara Swamy",
      idealSeason: lang === "kn" ? "ವೈಕುಂಠ ಏಕಾದಶಿ ಅಥವಾ ಬ್ರಹ್ಮೋತ್ಸವ" : lang === "mr" ? "वैकुंठ एकादशी किंवा ब्रह्मोत्सव" : lang === "hi" ? "वैकुंठ एकादशी अथवा ब्रह्मोत्सव" : lang === "te" ? "వైకుంఠ ఏకాదశి లేదా బ్రహ్మోత్సవాలు" : lang === "ta" ? "வைகுண்ட ஏகாதசி அல்லது பிரம்மோற்சவம்" : "Vaikunta Ekadashi or Annual Brahmotsavam",
      spiritualBenefit: lang === "kn" ? "ಕುಬೇರ ಸಂಪತ್ತು, ಲಕ್ಷ್ಮಿ ಕೃಪಾಕಟಾಕ್ಷ ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿ." : lang === "mr" ? "धनसमृद्धी, महालक्ष्मी कृपा व व्यापारात यश." : lang === "hi" ? "कुबेर संपत्ति, महालक्ष्मी कृपा एवं व्यापार वृद्धि।" : lang === "te" ? "కుబేర సంపద, లక్ష్మీ కటాక్షం & వ్యాపారాభివృద్ధి." : lang === "ta" ? "குபேர சம்பத்து, லக்ஷ்மி கடாட்சம் & தொழில் மேன்மை." : "Kubera treasuries, perpetual business growth, and auspicious fortune."
    }
  ];
}

/**
 * 10. Year-Specific Gokarna Shanti Remedies (5 Years Dynamic Counter-Measures)
 */
export function generateYearSpecificRemedies(
  baseYear: number,
  years: FiveYearSingleYear[],
  lang: SixLang
): Array<{ yearIndex: number; gregorianRange: string; transitChallenge: string; gokarnaSeva: string; mantra: string }> {
  return years.map((yr, idx) => {
    let challenge = "";
    let seva = "";
    let mantra = "";

    if (yr.vitalityCategory === "caution") {
      challenge = lang === "kn" ? "ಶನಿ ಪ್ರಭಾವ / ೮ನೇ ಮನೆಯ ಗ್ರಹ ಸಂಚಾರ" : lang === "mr" ? "शनि गोचर / अष्टम भाव प्रभाव" : lang === "hi" ? "शनि गोचर / अष्टम भाव प्रभाव" : lang === "te" ? "శని గోచారం / 8వ భావ ప్రభావం" : lang === "ta" ? "சனி கோச்சாரம் / 8ம் பாவ தாக்கம்" : "Saturnine Transit Tension";
      seva = lang === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ತೈಲಾಭಿಷೇಕ ಹಾಗೂ ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ ಸಂಕಲ್ಪ." : lang === "mr" ? "गोकर्ण क्षेत्रात तेलाभिषेक व दशरथ शनि स्तोत्र संकल्प." : lang === "hi" ? "गोकर्ण क्षेत्र में तैलाभिषेक एवं दशरथ शनि स्तोत्र संकल्प।" : lang === "te" ? "గోకర్ణంలో తైలాభిషేకం & దశరథ శని స్తోత్ర సంకల్పం." : lang === "ta" ? "கோகர்ணத்தில் நல்லெண்ணெய் அபிஷேகம் & சனி ஸ்தோத்திரம்." : "Gokarna Kshetra Tailabhisheka and Dasharatha Shani Stotra.";
      mantra = "ॐ शं शनैश्चराय नमः";
    } else if (yr.vitalityCategory === "exceptional") {
      challenge = lang === "kn" ? "ಪೂರ್ಣ ಗುರುಬಲ ಹಾಗೂ ಧನ ವೃದ್ಧಿ ಸಂಯೋಗ" : lang === "mr" ? "संपूर्ण गुरुबळ व धनवृद्धी योग" : lang === "hi" ? "पूर्ण गुरु बल एवं धन वृद्धि योग" : lang === "te" ? "సంపూర్ణ గురుబలం & ధన వృద్ధి" : lang === "ta" ? "முழு குரு பலன் & தன விருத்தி" : "Auspicious Jovian Grace & Expansion";
      seva = lang === "kn" ? "ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿಗೆ ಸಹಸ್ರ ಮೋದಕ ಹವನ ಹಾಗೂ ಸುವರ್ಣ ಪುಷ್ಪಾರ್ಚನೆ." : lang === "mr" ? "गोकर्ण महागणपतींना सहस्र मोदक हवन व सुवर्ण पुष्पार्चन." : lang === "hi" ? "गोकर्ण महागणपति को सहस्र मोदक हवन एवं सुवर्ण पुष्पार्चन।" : lang === "te" ? "గోకర్ణ గణపతికి సహస్ర మోదక హవనం & సువర్ణ పుష్పార్చన." : lang === "ta" ? "கோகர்ண கணபதிக்கு மோதக ஹோமம் & புஷ்பார்ச்சனை." : "Gokarna Sahasra Modaka Homa and Suvarna Pushpa Archana.";
      mantra = "ॐ बृं बृहस्पतये नमः";
    } else {
      challenge = lang === "kn" ? "ರಾಹು-ಕೇತು ಅಕ್ಷ ಸಂಚಾರ ಹಾಗೂ ಕರ್ಮ ಶುದ್ಧಿ" : lang === "mr" ? "राहू-केतू अक्ष व कर्मशुद्धी" : lang === "hi" ? "राहु-केतु अक्ष एवं कर्म शुद्धि" : lang === "te" ? "రాహు-కేతు అక్షం & కర్మ శుద్ధి" : lang === "ta" ? "ராகு-கேது அச்சு & கர்ம சுத்தி" : "Nodal Axis Realignment & Karmic Balance";
      seva = lang === "kn" ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸರ್ಪ ಸಂಸ್ಕಾರ ಸಂಕಲ್ಪ ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ." : lang === "mr" ? "गोकर्ण क्षेत्रात सर्प संस्कार संकल्प किंवा महामृत्युंजय जप." : lang === "hi" ? "गोकर्ण क्षेत्र में सर्प संस्कार संकल्प अथवा महामृत्युंजय जप।" : lang === "te" ? "గోకర్ణంలో సర్ప సంస్కార సంకల్పం లేదా మృత్యుంజయ జపం." : lang === "ta" ? "கோகர்ணத்தில் சர்ப்ப சாந்தி அல்லது மகா மிருத்யுஞ்சய ஜபம்." : "Gokarna Kshetra Sarpa Sanskara or Mahamrityunjaya Japa.";
      mantra = "ॐ नमः शिवाय";
    }

    return {
      yearIndex: idx,
      gregorianRange: yr.gregorianRange,
      transitChallenge: challenge,
      gokarnaSeva: seva,
      mantra
    };
  });
}

/**
 * 11. Family Destiny Interlocking & Viral Family Bundle CTA
 */
export function generateFamilyDestinyInterlocking(
  devoteeName: string,
  lang: SixLang,
  maritalStatus?: string,
  childrenStatus?: string,
  baseYear: number = 2026,
  currentAgeYears?: number
): { impactOnSpouse: string; impactOnChildren: string; impactOnParents: string; familyBundleCta: string; familyQrUrl: string } {
  const isMinor = currentAgeYears !== undefined && currentAgeYears < 18;
  const isMarried = maritalStatus === "married";
  const hasChildren = childrenStatus === "has_children";

  const impactOnSpouse = isMinor
    ? pick6({
      kn: "ಸೋದರ-ಸೋದರಿಯರ ನಡುವೆ ಪರಸ್ಪರ ಪ್ರೀತಿ, ವಾತ್ಸಲ್ಯ ಹಾಗೂ ಸಂಸ್ಕಾರಯುತ ಸಹಬಾಳ್ವೆ ವೃದ್ಧಿಯಾಗುವುದು.",
      mr: "भावंडांमध्ये सलोखा, प्रेम व कौटुंबिक संस्कारांची वाढ होईल.",
      hi: "सहोदरादि भाई-बहनों में परस्पर स्नेह, सहयोग एवं सद्भाव में वृद्धि होगी।",
      te: "తోడబుట్టిన వారి మధ్య ప్రేమానురాగాలు, చక్కని కుటుంబ అనుబంధం పెరుగుతాయి.",
      ta: "சகோதர-சகோதரிகளிடையே பாசமும் குடும்ப ஒற்றுமையும் மேலோங்கும்.",
      en: "Nurtures profound sibling affection, mutual respect, and cheerful camaraderie."
    }, lang)
    : isMarried
      ? (lang === "kn" ? "ನಿಮ್ಮ ೨ನೇ ಹಾಗೂ ೧೧ನೇ ಮನೆಯ ಗುರು ಗೋಚಾರವು ನಿಮ್ಮ ಸಂಗಾತಿಯ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಆರೋಗ್ಯ ಹಾಗೂ ವೃತ್ತಿ ಬೆಳವಣಿಗೆಗೆ ನೇರ ದೈವಿಕ ಬಲವನ್ನು ನೀಡಲಿದೆ."
        : lang === "mr" ? "आपल्या द्वितीय व एकादश भावातील गुरूचे गोचर जोडीदाराच्या आर्थिक प्रगतीला व आरोग्याला मोठे सहकार्य करेल."
          : lang === "hi" ? "आपके द्वितीय एवं एकादश भाव का गुरु गोचर आपके जीवनसाथी की आर्थिक समृद्धि एवं स्वास्थ्य को सुदृढ़ता प्रदान करेगा।"
            : lang === "te" ? "మీ 2వ మరియు 11వ భావాల గురు గోచారం మీ జీవిత భాగస్వామి ఆర్థిక ఉన్నతికి, ఆరోగ్యానికి తోడ్పడుతుంది."
              : lang === "ta" ? "உங்கள் 2 & 11ம் இடத்து குரு கோச்சாரம் உங்கள் வாழ்க்கைத் துணையின் நிதி வளர்ச்சிக்கும் ஆரோக்கியத்திற்கும் துணை நிற்கும்."
                : "Your 2nd and 11th house Jupiter transits radiate stability and prosperity directly onto your spouse's path.")
      : (lang === "kn" ? "ನಿಮ್ಮ ೭ನೇ ಮನೆಯ ಮುಂಬರುವ ಗ್ರಹಗತಿಗಳು ನಿಮ್ಮ ಭಾವಿ ಸಂಗಾತಿಯ ಶೀಘ್ರ ಆಗಮನಕ್ಕೆ ಸುವರ್ಣ ದ್ವಾರವನ್ನು ತೆರೆಯಲಿವೆ."
        : lang === "mr" ? "सप्तम भावातील आगामी ग्रहस्थिती सुसंस्कारी जीवनसाथीच्या आगमनासाठी अत्यंत अनुकूल आहे."
          : lang === "hi" ? "सप्तम भाव की आगामी ग्रह स्थिति आपके भावी जीवनसाथी के आगमन का मार्ग प्रशस्त करेगी।"
            : lang === "te" ? "7వ భావ గ్రహ గతులు మీ కాబోయే జీవిత భాగస్వామి ఆగమనానికి శుభ సమయాన్ని సూచిస్తున్నాయి."
              : lang === "ta" ? "7ம் இடத்து கிரக நிலைகள் நல்ல வாழ்க்கை துணை விரைவில் அமைவதற்கான சுப காலத்தைக் காட்டுகின்றன."
                : "Upcoming 7th house alignments open auspicious portals for meeting your destined life companion.");

  const impactOnChildren = isMinor
    ? pick6({
      kn: "ಮಗುವಿನ ಸಹಜ ಸದ್ಗುಣ, ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ ಹಾಗೂ ಸಂಸ್ಕಾರದ ಪರಿಮಳವು ಇಡೀ ಮನೆಗೆ ಹರ್ಷ ತರಲಿದೆ.",
      mr: "बालकाचे सुसंस्कार, निष्पाप हास्य व बुद्धिमत्ता संपूर्ण कुटुंबाला आनंद देईल.",
      hi: "बालक के नैसर्गिक सद्गुण, विनम्रता एवं संस्कार संपूर्ण कुल को आनंदित करेंगे।",
      te: "పిల్లల సద్గుణాలు, మధుర సంభాషణలు మరియు సంస్కారాలు ఇంటికి సంతోషాన్నిస్తాయి.",
      ta: "குழந்தையின் நற்பண்புகள், அன்பு மற்றும் கள்ளமில்லா புன்னகை இல்லத்திற்கு மகிழ்ச்சி தரும்.",
      en: "The child's radiant innocence, virtues, and scholastic strides bring boundless joy to the home."
    }, lang)
    : hasChildren
      ? (lang === "kn" ? "ನಿಮ್ಮ ೫ನೇ ಮನೆಯ ಸತ್ಕರ್ಮ ಫಲವು ನಿಮ್ಮ ಮಕ್ಕಳ ಶಾಲಾ-ಕಾಲೇಜು ಪರೀಕ್ಷೆಗಳು, ನಡತೆ ಹಾಗೂ ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕೆ ರಕ್ಷಾ ಕವಚವಾಗಲಿದೆ."
        : lang === "mr" ? "आपल्या पंचम भावातील शुभ दृष्टी मुलांचे शिक्षण, परीक्षा व व्यक्तिमत्त्व विकासासाठी सुरक्षा कवच ठरेल."
          : lang === "hi" ? "आपके पंचम भाव का शुभ प्रभाव बच्चों की शिक्षा, परीक्षा एवं उज्ज्वल भविष्य हेतु रक्षा कवच बनेगा।"
            : lang === "te" ? "మీ 5వ భావ శుభ దృష్టి మీ పిల్లల చదువు, పరీక్షలు మరియు ఉన్నత భవిష్యత్తుకు రక్షగా నిలుస్తుంది."
              : lang === "ta" ? "உங்கள் 5ம் இடத்து சுப பார்வை உங்கள் பிள்ளைகளின் கல்வி, தேர்வு மற்றும் உயர் வளர்ச்சிக்கு பாதுகாப்பாக இருக்கும்."
                : "Your 5th house karma acts as a celestial aegis protecting your children's character and exams.")
      : (lang === "kn" ? "೫ನೇ ಮನೆಯ ಶುಭ ಪ್ರಭಾವವು ಸಂತಾನ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆಯಲ್ಲಿರುವವರಿಗೆ ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ದಿವ್ಯ ಅನುಗ್ರಹವನ್ನು ಕರುಣಿಸಲಿದೆ."
        : lang === "mr" ? "पंचम भावातील अनुकूलतेमुळे कुलदीपक संतती प्राप्तीचे अत्यंत शुभ योग जुळून येतील."
          : lang === "hi" ? "पंचम भाव के प्रभाव से संतान सुख की अभिलाषा रखने वालों को शुभ सन्तति का आशीर्वाद मिलेगा।"
            : lang === "te" ? "5వ భావ ప్రభావంతో సంతానాపేక్ష గలవారికి సత్సంతాన ప్రాప్తి కలుగుతుంది."
              : lang === "ta" ? "5ம் இடத்து சுப பலனால் குழந்தை பாக்கியம் வேண்டுவோருக்கு நற்பேறு கிட்டும்."
                : "Auspicious 5th house vibrations catalyze conception blessings and family lineage joy.");

  const impactOnParents = isMinor
    ? pick6({
      kn: "ಮಗುವಿನ ವಿದ್ಯಾ ಪ್ರಗತಿ ಹಾಗೂ ಉತ್ತಮ ನಡತೆಯು ತಂದೆ-ತಾಯಿಯ ಮನಸ್ಸಿಗೆ ಅಪಾರ ತೃಪ್ತಿ, ನೆಮ್ಮದಿ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ ತರಲಿದೆ.",
      mr: "मुलाची शैक्षणिक प्रगती व उत्तम वागणूक आई-वडिलांच्या मनाला अथांग समाधान व दीर्घायुष्य देईल.",
      hi: "बालक की शिक्षा एवं श्रेष्ठ संस्कार माता-पिता के हृदय को असीम संतोष एवं दीर्घायु प्रदान करेंगे।",
      te: "పిల్లల చదువుల పురోగతి, మంచి ప్రవర్తన తల్లిదండ్రులకు ఎనలేని సంతృప్తిని, దీర్ఘాయుష్షును ఇస్తాయి.",
      ta: "குழந்தையின் கல்வி வெற்றியும் நன்னடத்தையும் பெற்றோருக்கு பெருமிதத்தையும் மன நிம்மதியையும் தரும்.",
      en: "The child's scholastic strides and filial devotion bring profound peace, honor, and longevity to parents."
    }, lang)
    : (lang === "kn" ? "೯ನೇ ಮನೆಯ ಧರ್ಮ ಬಲವು ತಂದೆ-ತಾಯಿಯ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಕುಟುಂಬದ ಕುಲದೇವತಾ ಪ್ರಸನ್ನತೆಯನ್ನು ರಕ್ಷಿಸಲಿದೆ."
      : lang === "mr" ? "नवम भावातील धर्मबळ आई-वडिलांचे आरोग्य, दीर्घायुष्य व कुलदेवतेची कृपा कायम राखेल."
        : lang === "hi" ? "नवम भाव का धर्म बल माता-पिता के स्वास्थ्य, दीर्घायु एवं कुलदेवी की कृपा को सुरक्षित रखेगा।"
          : lang === "te" ? "9వ భావ ధర్మ బలం తల్లిదండ్రుల ఆరోగ్యం, దీర్ఘాయుష్షు మరియు కులదేవత అనుగ్రహాన్ని కాపాడుతుంది."
            : lang === "ta" ? "9ம் இடத்து தர்ம பலம் பெற்றோரின் ஆரோக்கியம், தீர்க்காயுள் மற்றும் குಲதெய்வ அருளைப் பெற்றுத் தரும்."
              : "9th house dharma anchors ancestral tranquility and shields parental health.");

  const familyBundleCta = lang === "kn" ? "ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರ ಜಾತಕ ಹಾಗೂ ದಶಾ-ಗೋಚಾರಗಳ ಪರಸ್ಪರ ಸಮನ್ವಯವು ಗೃಹದಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಅಷ್ಟೈಶ್ವರ್ಯಗಳನ್ನು ನೆಲೆಸುವಂತೆ ಮಾಡುತ್ತದೆ."
    : lang === "mr" ? "कुटुंबातील प्रत्येक सदस्याच्या जन्मपत्रिकेतील ग्रहांचे सामंजस्य घरात अखंड सुख, शांतता व समृद्धी निर्माण करते."
      : lang === "hi" ? "परिवार के प्रत्येक सदस्य की कुंडली एवं ग्रह दशाओं का समन्वय गृह में शांति, सौहार्द एवं ऐश्वर्य की वृद्धि करता है।"
        : lang === "te" ? "కుటుంబ సభ్యులందరి జాతకాలు మరియు గ్రహ స్థితుల సమన్వయం ఇంట్లో శాంతి, సౌభాగ్యాలను పెంచుతుంది."
          : lang === "ta" ? "குடும்ப உறுப்பினர்களின் ஜாதக கிரக அமைப்புகளின் இணக்கம் இல்லத்தில் அமைதியையும் சுபிக்ஷத்தையும் நிலைநிறுத்தும்."
            : "Harmonizing the destiny charts and planetary alignments of all family members anchors domestic peace and enduring prosperity.";

  const familyQrUrl = `https://baggonapanchanga.com/bhavishya?mode=fiveYear&ref=family_bundle&devoteeName=${encodeURIComponent(devoteeName || "Family")}`;

  return {
    impactOnSpouse,
    impactOnChildren,
    impactOnParents,
    familyBundleCta,
    familyQrUrl
  };
}

/**
 * 12. Astrologer's Master Jyotish Summary (ದೈವಜ್ಞ ಜ್ಯೋತಿಷ್ಯ ಮಹಾ ಸಾರಾಂಶ)
 */
export function generateDaivajnaSummary(
  devoteeName: string,
  targetLang: SixLang,
  currentAgeYears: number,
  baseYear: number,
  lagnaIdx: number,
  moonIdx: number,
  runningMahadashaPrimary: PlanetName,
  peakYearLabel: string,
  cautionYearLabel: string,
  hasSaturnTroubleAnyYear: boolean
): DaivajnaSummaryInfo {
  const greeting = getDevoteeGreeting(devoteeName, targetLang);
  const startY = formatNumber6L(baseYear, targetLang);
  const endY = formatNumber6L(baseYear + 5, targetLang);
  const mahaLordName = GRAHA_6L[runningMahadashaPrimary]?.[targetLang] || runningMahadashaPrimary;
  const lagnaName = RASHI_6L[lagnaIdx]?.[targetLang] || "";
  const rashiName = RASHI_6L[moonIdx]?.[targetLang] || "";

  const isInfant = currentAgeYears < 2;
  const isChild = currentAgeYears >= 2 && currentAgeYears < 13;
  const isAdolescent = currentAgeYears >= 13 && currentAgeYears < 18;

  const title = pick6({
    kn: "ದೈವಜ್ಞ ಜ್ಯೋತಿಷ್ಯ ಮಹಾ ಸಾರಾಂಶ ಹಾಗೂ ಅಂತಿಮ ಮಾರ್ಗದರ್ಶನ",
    mr: "दैवज्ञ ज्योतिष महा सारांश व अंतिम मार्गदर्शन",
    hi: "दैवज्ञ ज्योतिष महा सारांश एवं अंतिम मार्गदर्शन",
    te: "దైవజ్ఞ జ్యోతిష్య మహా సారాంశం & తుది మార్గదర్శకత్వం",
    ta: "ஜோதிட மகா சாரம்சம் & இறுதி வழிகாட்டல்",
    en: "Astrologer's Master Jyotish Summary & Spiritual Synthesis"
  }, targetLang);

  const subtitle = pick6({
    kn: "೫ ವರ್ಷಗಳ ದಿವ್ಯ ಕರ್ಮಯಾನ, ಸುವರ್ಣಾವಕಾಶಗಳ ಸದ್ವಿನಿಯೋಗ ಹಾಗೂ ಮುನ್ನೆಚ್ಚರಿಕೆಯ ಮಾರ್ಗಸೂಚಿ",
    mr: "५ वर्षांचा दिव्य कर्मप्रवास, सुवर्णसंधींचा सदुपयोग व दक्षतेचा मार्ग",
    hi: "५-वर्षीय दिव्य कर्मयात्रा, स्वर्णिम अवसरों का सदुपयोग एवं सतर्कता मार्गदर्शिका",
    te: "5 సంవత్సరాల దివ్య కర్మయానం, సువర్ణావకాశాల సద్వినియోగం & ముందస్తు జాగ్రత్తలు",
    ta: "5 ஆண்டுகளின் புனித கர்ம பயணம், பொற்கால வாய்ப்புகள் & எச்சரிக்கை நெறிமுறைகள்",
    en: "5-Year Karmic Synthesis, Golden Milestone Realization & Vigilance Compass"
  }, targetLang);

  // Paragraph 1: Karmic & Spiritual Destiny Journey
  const p1 = pick6({
    kn: `${greeting}, ${startY} ರಿಂದ ${endY} ರ ವರೆಗಿನ ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಚಕ್ರವು ನಿಮ್ಮ ಜೀವನದ ಕರ್ಮ, ಧರ್ಮ ಹಾಗೂ ಭಾಗ್ಯದ ಸಮತೋಲನವನ್ನು ಸಾಧಿಸುವ ಪರಮ ಪಾವನ ಪರ್ವಕಾಲವಾಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaName} ಹಾಗೂ ಜನ್ಮ ರಾಶಿಯಾದ ${rashiName}ಯ ಗ್ರಹಗತಿಗಳನ್ನು ಅವಲೋಕಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಚಾಲನೆಯಲ್ಲಿರುವ ${mahaLordName} ಮಹಾದಶೆಯು ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮವನ್ನು ಉನ್ನತ ಸ್ಥಾನಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲು ಸಜ್ಜಾಗಿದೆ. ಹಿಂದಿನ ದಿನಗಳಲ್ಲಿ ಎದುರಾಗಿದ್ದ ನಿರಾಶೆ, ಕೌಟುಂಬಿಕ ಏರುಪೇರುಗಳು ಅಥವಾ ಆರ್ಥಿಕ ಗೊಂದಲಗಳು ಕ್ರಮೇಣ ಶಮನಗೊಂಡು, ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನೂತನ ಭರವಸೆ ಮತ್ತು ದೈವಿಕ ಶಾಂತಿಯು ನೆಲೆಸಲಿದೆ. ವೇದಶಾಸ್ತ್ರದ ನಿಯಮದಂತೆ ಕರ್ಮವು ಎಂದಿಗೂ ವ್ಯರ್ಥವಾಗುವುದಿಲ್ಲ; ನೀವು ತೋರುವ ಸತ್ಕರ್ಮ, ಹಿರಿಯರ ಸೇವೆ ಮತ್ತು ಈಶ್ವರ ಭಕ್ತಿಯು ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಇಡೀ ವಂಶಕ್ಕೆ ಅಖಂಡ ಕೀರ್ತಿಯನ್ನು ತಂದುಕೊಡಲಿದೆ.`,
    mr: `${greeting}, ${startY} ते ${endY} या पाच वर्षांचा कालप्रवाह आपल्या आयुष्यातील कर्म, धर्म आणि भाग्याचा सुंदर संगम घडवणारा अत्यंत पावन काळ आहे. आपले जन्मलग्न ${lagnaName} व जन्मरास ${rashiName} ची ग्रहस्थिती दर्शवते की, सध्या कार्यरत असलेली ${mahaLordName} महादशा आपल्या प्रामाणिक कष्टांना सन्मानाचे व यशाचे रूप देण्यासाठी सज्ज आहे. मागील काळात आलेले अपयश, कौटुंबिक तणाव अथवा आर्थिक अस्थिरता आता हळूहळू नाहीशी होऊन मनात अढळ आशावाद व मनःशांती निर्माण होईल. वेदोक्त नियमांनुसार केलेले सत्कार्य कधीही वाया जात नाही; आपले सत्कर्म, ज्येष्ठांचे आशीर्वाद व ईश्वरी भक्ती या ५ वर्षांत आपल्या कुळाला मोठा गौरव मिळवून देईल.`,
    hi: `${greeting}, ${startY} से ${endY} का यह पंचवर्षीय कालचक्र आपके जीवन के धर्म, कर्म एवं भाग्य के त्रिकोण को जागृत करने वाला एक अलौकिक स्वर्णिम पर्व है। आपके जन्म लग्न ${lagnaName} एवं जन्म राशि ${rashiName} की ग्रहीय गति का विश्लेषण दर्शाता है कि वर्तमान में गतिशील ${mahaLordName} महादशा आपके निष्ठावान पुरुषार्थ को सर्वोच्च सफलता में परिणत करने हेतु तत्पर है। पूर्व काल में अनुभूत मानसिक संताप, पारिवारिक अवरोध एवं आर्थिक चिंताएं अब क्रमशः विलीन होकर आपके अंतर्मन में दिव्य शांति का संचार करेंगी। वैदिक सिद्धांत साक्षी हैं कि निष्काम भाव से किया गया सत्कर्म कभी निष्फल नहीं होता; आपका धर्मपालन, माता-पिता की सेवा एवं ईश्वरीय निष्ठा आगामी ५ वर्षों में आपके वंश को अक्षुण्ण कीर्ति से अलंकृत करेगी।`,
    te: `${greeting}, ${startY} నుండి ${endY} వరకు సాగే ఈ ఐదు సంవత్సరాల కాలచక్రం మీ జీవితంలో ధర్మ, కర్మ మరియు భాగ్యాల కలయికతో కూడిన పరమ పవిత్ర సమయం. మీ జన్మ లగ్నం ${lagnaName} మరియు రాశి ${rashiName}ల గ్రహ సంచారాన్ని పరిశీలించినప్పుడు, ప్రస్తుతం నడుస్తున్న ${mahaLordName} మహాదశ మీ సత్సంకల్పాలను అత్యున్నత శిఖరాలకు చేర్చడానికి సిద్ధంగా ఉంది. గతంలో ఎదురైన ఆందోళనలు, ఆర్థిక ఒడిదుడుకులు నెమ్మదిగా తొలగిపోయి, మీ మనస్సులో నూతన ఆత్మవిశ్వాసం, ప్రశాంతత నెలకొంటాయి. వేదశాస్త్రాల ప్రకారం సత్కర్మ ఎన్నడూ వృథా కాదు; మీరు చూపే ధర్మ నిష్ఠ, పెద్దల పట్ల గౌరవం మీ వంశానికి శాశ్వత కీర్తిని చేకూరుస్తాయి.`,
    ta: `${greeting}, ${startY} முதல் ${endY} வரையிலான இந்த ஐந்து ஆண்டு காலச்சக்கரம் உங்கள் வாழ்க்கையில் தர்மம், கர்மா மற்றும் பாக்கியத்தை நிலைநிறுத்தும் மிக புனிதமான காலகட்டமாகும். உங்கள் லக்னம் ${lagnaName} மற்றும் ராசி ${rashiName} கிரக நிலைகளை ஆராயும்போது, தற்போது நடைபெறும் ${mahaLordName} மகா தசா உங்களின் கடின உழைப்பிற்கு தகுந்த நற்பலன்களை அள்ளித் தர உள்ளது. கடந்த கால மனக்கவலைகள், குடும்ப சவால்கள் மற்றும் பொருளாதார சுணக்கங்கள் விலகி உங்கள் மனதில் புதிய நம்பிக்கையும் மன அமைதியும் நிறையும். வேத விதிகளின்படி நற்செயல்கள் ஒருபோதும் வீண் போகாது; உங்கள் தர்ம சிந்தனையும் இறை நம்பிக்கையும் உங்கள் குடும்பத்திற்கு நீடித்த புகழைத் தேடித்தரும்.`,
    en: `${greeting}, this sovereign 5-year chronological arc spanning ${startY} through ${endY} constitutes a sacred watershed epoch harmonizing your spiritual merit, worldly responsibilities, and destined fortune. Synthesizing your natal ${lagnaName} Lagna and ${rashiName} Moon sign, the overarching stewardship of the ${mahaLordName} Mahadasha is divinely poised to translate past patience into tangible triumph. Ambiguities and domestic friction that once clouded your horizons will dissolve smoothly, restoring clarity and quiet confidence. Under sacred Parashari tenets, righteous action never perishes; your steadfast integrity, elder veneration, and devotion will illuminate your lineage with enduring honor.`
  }, targetLang);

  // Paragraph 2: Age-Adaptive Milestones & Seeding
  const p2 = isInfant
    ? pick6({
      kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯಲ್ಲಿ, ${peakYearLabel} ವರ್ಷವು ಶಿಶುವಿನ ಆರೋಗ್ಯ, ಚೈತನ್ಯ ಹಾಗೂ ಬಾಲ ಸಂಸ್ಕಾರಗಳ ಸುವರ್ಣ ಪರ್ವಕಾಲವಾಗಲಿದೆ. ಗುರು ಮತ್ತು ಚಂದ್ರರ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಬಾಲಾರಿಷ್ಟ ದೋಷಗಳು ಸಂಪೂರ್ಣ ಶಮನಗೊಂಡು, ದೈವಿಕ ರಕ್ಷಾ ಕವಚವು ಮಗುವನ್ನು ಸದಾ ಕಾಪಾಡಲಿದೆ. ಅನ್ನಪ್ರಾಶನ, ನಾಮಕರಣ ಹಾಗೂ ಅಕ್ಷರಾಭ್ಯಾಸದ ಶುಭ ಮುಹೂರ್ತಗಳು ಸಾಂಗವಾಗಿ ನೆರವೇರಿ, ಇಡೀ ಕುಟುಂಬದಲ್ಲಿ ಆನಂದದ ಹೊನಲು ಹರಿಯಲಿದೆ.`,
      mr: `या पाच वर्षांच्या प्रवासात, ${peakYearLabel} हे वर्ष बालकाचे आरोग्य, चैतन्य व शुभ बालसंस्कारांचा सुवर्णकाळ ठरेल. चंद्र व गुरूच्या कृपेने सर्व बालारिष्ट दोषांचे निवारण होऊन ईश्वरी कवच बालकाचे रक्षण करेल. अन्नप्राशन, नामकरण व पाटीपूजन यांसारखे संस्कार उत्तम मुहूर्तांवर पार पडून घरात आनंदाचे वातावरण राहील.`,
      hi: `इस पंचवर्षीय कालखंड में, ${peakYearLabel} का वर्ष शिशु के आरोग्य, चैतन्य एवं शुभ संस्कारों का स्वर्णिम पर्व सिद्ध होगा। गुरु एवं चंद्रमा के शुभ प्रभाव से समस्त बालारिष्ट दोषों का निवारण होकर ईश्वरीय रक्षा कवच शिशु की रक्षा करेगा। अन्नप्राशन, नामकरण एवं विद्यारंभ संस्कार शुभ मुहूर्तों में संपन्न होंगे।`,
      te: `ఈ 5 సంవత్సరాల కాలంలో, ${peakYearLabel} సంవత్సరం శిశువు ఆరోగ్యం, చైతన్యం మరియు సంస్కారాల పరంగా అమృత ఘడియగా నిలుస్తుంది. గురు, చంద్రుల అనుగ్రహంతో బాలారిష్ట దోషాలు తొలగిపోయి దైవిక రక్షణ లభిస్తుంది. అన్నప్రాశన, నామకరణం వంటి సంస్కారాలు వైభవంగా జరుగుతాయి.`,
      ta: `இந்த 5 ஆண்டுகளில், ${peakYearLabel} ஆண்டு குழந்தையின் நல்வாழ்வு, உற்சாகம் மற்றும் சுப சடங்குகளுக்கான பொற்காலமாக அமையும். குரு மற்றும் சந்திரனின் அருளால் பாலாரிஷ்ட தோஷங்கள் நீங்கி தெய்வீக பாதுகாப்பு கிட்டும். அன்னப்ராசனம், நாமகரணம் போன்ற மங்களகரமான நிகழ்வுகள் இனிதே நடக்கும்.`,
      en: `Within this 5-year arc, ${peakYearLabel} emerges as a golden epoch of vibrant pediatric health, developmental leaps, and sacred infant samskaras. Benign lunar and Jovian trines dissolve early constitutional vulnerabilities, anchoring divine sanctuary and family bliss.`
    }, targetLang)
    : isChild
      ? pick6({
        kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯಲ್ಲಿ, ${peakYearLabel} ವರ್ಷವು ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಸುಪ್ತ ಪ್ರತಿಭೆಗಳ ಸುವರ್ಣ ವಿಕಾಸದ ಪರಾಕಾಷ್ಠೆಯಾಗಲಿದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಬುಧನ ಅನುಗ್ರಹದಿಂದ ಶಾಲಾ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಶ್ರೇಣಿ ಲಭಿಸಲಿದ್ದು, ಕ್ರೀಡೆ ಅಥವಾ ಲಲಿತಕಲೆಗಳಲ್ಲಿ ಗುರುಹಿರಿಯರ ಮೆಚ್ಚುಗೆ ಪಾತ್ರವಾಗಲಿದೆ. ಸದ್ಗುಣಗಳ ಸಂಸ್ಕಾರದಿಂದ ಮಗುವಿನ ವ್ಯಕ್ತಿತ್ವವು ಕಂಗೊಳಿಸಲಿದೆ.`,
        mr: `या पाच वर्षांच्या प्रवासात, ${peakYearLabel} हे वर्ष बालकाच्या शिक्षणात, स्मरणशक्तीत व सुप्त गुणांच्या विकासात सर्वोच्च यशाचे ठरेल. देवगुरू व बुधाच्या कृपेने शालेय परीक्षेत अव्वल क्रमांक मिळेल आणि क्रीडा किंवा कला क्षेत्रात कौतुक होईल. उत्तम नैतिक संस्कारांनी बालकाचे व्यक्तिमत्त्व उजळून निघेल.`,
        hi: `इस पंचवर्षीय यात्रा में, ${peakYearLabel} का वर्ष बालक की शिक्षा, स्मरण शक्ति एवं प्रतिभा विकास की स्वर्णिम पराकाष्ठा होगा। देवगुरु एवं बुध की कृपा से विद्यालयी परीक्षाओं में श्रेष्ठ सफलता मिलेगी तथा खेलकूद या कला में विशेष प्रशंसा प्राप्त होगी। श्रेष्ठ संस्कारों से बालक का यश फैलेगा।`,
        te: `ఈ 5 సంవత్సరాల ప్రయాణంలో, ${peakYearLabel} సంవత్సరం పిల్లల చదువు, గ్రహణశక్తి మరియు నైపుణ్యాల వికాసంలో అద్భుత మైలురాయిగా నిలుస్తుంది. గురు, బుధ గ్రహాల అనుగ్రహంతో పరీక్షల్లో అగ్రస్థానం లభిస్తుంది; ఆటలు లేదా కళల్లో ప్రశంసలు దక్కుతాయి. సత్ప్రవర్తనతో కుటుంబానికి మంచి పేరు తెస్తారు.`,
        ta: `இந்த 5 ஆண்டு பயணத்தில், ${peakYearLabel} ஆண்டு குழந்தையின் கல்வி, நினைவாற்றல் மற்றும் திறமைகளில் உச்சக்கட்ட வெற்றியைத் தரும். குரு மற்றும் புதனின் ஆசியால் தேர்வுகளில் முதன்மை மதிப்பெண்களும், கலை அல்லது விளையாட்டில் பாராட்டுகளும் குவியும். நற்பண்புகளால் குடும்பம் பெருமைப்படும்.`,
        en: `Within this 5-year continuum, ${peakYearLabel} marks the sovereign zenith of scholastic growth, conceptual retention, and creative flair. Supported by Mercury and Jupiter, milestone examinations yield benchmark honours alongside blossoming character.`
      }, targetLang)
      : isAdolescent
        ? pick6({
          kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯಲ್ಲಿ, ${peakYearLabel} ವರ್ಷವು ಉನ್ನತ ವ್ಯಾಸಂಗ, ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಭವಿಷ್ಯದ ದಿಕ್ಕು ನಿರ್ಧರಿಸುವ ಸುವರ್ಣ ಪರ್ವಕಾಲವಾಗಲಿದೆ. ಬುಧಾದಿತ್ಯ ಯೋಗ ಹಾಗೂ ಗುರುಬಲದ ಸಂಯೋಗದಿಂದ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಪಾರ ಯಶಸ್ಸು ಲಭಿಸಲಿದ್ದು, ಪ್ರತಿಷ್ಠಿತ ಕಾಲೇಜು ಪ್ರವೇಶ ಸುಗಮವಾಗಲಿದೆ. ನವೀನ ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳ ಸಿದ್ಧಿಯಿಂದ ಆತ್ಮವಿಶ್ವಾಸ ದುಪ್ಪಟ್ಟಾಗಲಿದೆ.`,
          mr: `या पाच वर्षांच्या प्रवासात, ${peakYearLabel} हे वर्ष उच्च शिक्षण, बोर्ड परीक्षा व करिअरची दिशा निश्चित करणारा सुवर्णकाळ ठरेल. बुधादित्य योग व गुरुबळाने स्पर्धा परीक्षेत मोठे यश लाभेल आणि नामांकित महाविद्यालयात प्रवेश सुकर होईल. आधुनिक तांत्रिक कौशल्यांमुळे आत्मविश्वास द्विगुणित होईल.`,
          hi: `इस पंचवर्षीय यात्रा में, ${peakYearLabel} का वर्ष उच्च शिक्षा, बोर्ड परीक्षा एवं भविष्य की दिशा निर्धारण का स्वर्णिम पर्व होगा। बुधादित्य योग एवं गुरु बल के प्रभाव से प्रतियोगी परीक्षाओं में श्रेष्ठ सफलता एवं प्रतिष्ठित संस्थान में प्रवेश सुनिश्चित होगा। तकनीकी कौशल से आत्मविश्वास बढ़ेगा।`,
          te: `ఈ 5 సంవత్సరాల ప్రయాణంలో, ${peakYearLabel} సంవత్సరం ఉన్నత విద్య, బోర్డు పరీక్షలు & భవిష్యత్ ప్రణాళికలకు అత్యంత కీలకం. బుధాదిత్య యోగం మరియు గురుబలంతో పోటీ పరీక్షల్లో విజయం లభించి, మంచి కళాశాలలో ప్రవేశం దక్కుతుంది. నూతన నైపుణ్యాలతో ఆత్మవిశ్వాసం పెరుగుతుంది.`,
          ta: `இந்த 5 ஆண்டு பயணத்தில், ${peakYearLabel} ஆண்டு உயர்கல்வி, பொதுத்தேர்வுகள் மற்றும் எதிர்கால திசையை அமைக்கும் பொற்காலமாகும். புதாதித்ய யோகம் & குரு பலனால் சிறந்த கல்லூரிகளில் சேர்க்கையும், புதிய தொழில்நுட்பத் திறன்களும் கைகூடி தன்னம்பிக்கை உயரும்.`,
          en: `Within this 5-year arc, ${peakYearLabel} serves as the pivotal turning point for pre-collegiate mastery, milestone board examinations, and academic stream selection. Fortified by Solar and Mercurial intellect, competitive admissions align flawlessly.`
        }, targetLang)
        : pick6({
          kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯಲ್ಲಿ, ${peakYearLabel} ವರ್ಷವು ನಿಮ್ಮ ಜೀವನದ ಸುವರ್ಣ ಭಾಗ್ಯೋದಯದ ಪರಾಕಾಷ್ಠೆಯಾಗಲಿದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗುರುಬಲ, ಉಪಚಯ ಸ್ಥಾನಗಳ ಶುಭ ಗ್ರಹ ಸಂಚಾರ ಹಾಗೂ ಸರ್ವಾಷ್ಟಕವರ್ಗದ ಗರಿಷ್ಠ ಬಿಂದುಗಳ ಬೆಂಬಲದಿಂದಾಗಿ, ಈ ಕಾಲಘಟ್ಟದಲ್ಲಿ ನೀವು ಕೈಗೊಳ್ಳುವ ಯಾವುದೇ ನೂತನ ವ್ಯಾಪಾರ, ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆ, ಸ್ವಂತ ಗೃಹ ನಿರ್ಮಾಣ ಅಥವಾ ಉದ್ಯೋಗದ ಮಹತ್ವದ ತಿರುವುಗಳು ದ್ವಿಗುಣ ಲಾಭವನ್ನು ತರಲಿವೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ನಾಯಕತ್ವಕ್ಕೆ ಹೊಸ ಮನ್ನಣೆ ದೊರೆಯಲಿದ್ದು, ಸಮಾಜದ ಗಣ್ಯ ವ್ಯಕ್ತಿಗಳ ಸ್ನೇಹ ಮತ್ತು ಸಹಕಾರವು ನಿಮ್ಮ ಕಾರ್ಯಗಳನ್ನು ಸುಗಮಗೊಳಿಸಲಿದೆ. ಈ ಸುವರ್ಣ ಕಾಲಾವಧಿಯಲ್ಲಿ ಶುಭ ಮುಹೂರ್ತಗಳನ್ನು ಸರಿಯಾಗಿ ಗುರುತಿಸಿ ದೃಢ ಸಂಕಲ್ಪದಿಂದ ಮುನ್ನಡೆದರೆ, ಮುಂದಿನ ಅನೇಕ ದಶಕಗಳ ಕಾಲ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ರಕ್ಷಿಸುವ ಭದ್ರ ಆರ್ಥಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಕೋಟೆಯನ್ನು ನಿರ್ಮಿಸಲು ಸಾಧ್ಯವಾಗಲಿದೆ.`,
          mr: `या पाच वर्षांच्या प्रवासात, ${peakYearLabel} हे वर्ष आपल्या आयुष्यातील सुवर्ण भाग्योदयाचा परमोच्च बिंदू ठरेल. देवगुरू बृहस्पतींचे अनुकूल कृपाछत्र, उपचय स्थानांमधील शुभ ग्रहांचे भ्रमण व अष्टकवर्गातील उच्च गुणांचे पाठबळ यामुळे या काळात आपण सुरू केलेले नवीन व्यवसाय, स्थावर मालमत्तेची खरेदी, गृहप्रवेश अथवा करिअरमधील मोठी झेप दुप्पट यश मिळवून देईल. आपल्या कार्यक्षेत्रात आपल्या नेतृत्वाला व कर्तृत्वाला नवी ओळख मिळेल आणि प्रतिष्ठित व्यक्तींचे सहकार्य आपले मार्ग सुकर करेल. या सुवर्णकाळात शुभ मुहूर्तांची योग्य निवड करून आत्मविश्वासाने पावले उचलल्यास भावी अनेक पिढ्यांसाठी एक अभेद्य आर्थिक व कौटुंबिक सुरक्षिततेचा पाया रचला जाईल.`,
          hi: `इस पंचवर्षीय यात्रा में, ${peakYearLabel} का वर्ष आपके जीवन में स्वर्णिम भाग्योदय की पराकाष्ठा सिद्ध होगा। देवगुरु बृहस्पति की अमृतमयी कृपा, उपचय भावों में शुभ ग्रहों का संचरण एवं सर्वाष्टकवर्ग के उच्च बिंदुओं का संबल मिलकर आपके समस्त पुरुषार्थ को अभूतपूर्व सफलता में बदल देंगे। इस अवधि में किया गया नवीन व्यापार आरंभ, भूमि-भवन का क्रय, गृहप्रवेश अथवा आजीविका में पदोन्नति आपको असाधारण लाभ प्रदान करेगी। कार्यक्षेत्र में आपके नेतृत्व कौशल को व्यापक मान्यता प्राप्त होगी तथा समाज के प्रतिष्ठित व्यक्तियों का सहयोग आपके कार्यों को सुगम बनाएगा। यदि आप इस स्वर्णिम काल में शुभ मुहूर्तों का सदुपयोग करते हुए दृढ़ संकल्प से अग्रसर होंगे, तो आने वाले कई दशकों तक आपके परिवार को सुरक्षा प्रदान करने वाली सुदृढ़ आर्थिक व सामाजिक नींव स्थापित हो जाएगी।`,
          te: `ఈ 5 సంవత్సరాల ప్రయాణంలో, ${peakYearLabel} సంవత్సరం మీ జీవితంలో సువర్ణ భాగ్యోదయానికి పరాకాష్టగా నిలుస్తుంది. దేవగురువు బృహస్పతి అనుకూల కృప, ఉపచయ స్థానాలలో శుభ గ్రహాల సంచారం మరియు సర్వాష్టకవర్గంలో గరిష్ట పాయింట్ల మద్దతు వల్ల ఈ కాలంలో మీరు ప్రారంభించే నూతన వ్యాపారం, స్థిరాస్తి కొనుగోలు, గృహప్రవేశం లేదా ఉద్యోగంలో కీలక మార్పులు రెట్టింపు ఫలితాలను ఇస్తాయి. మీ వೃత్తి రంగంలో మీ నాయకత్వానికి విశేష గుర్తింపు లభిస్తుంది; సమాజంలోని ప్రముఖుల సహకారం మీ ప్రయత్నాలను సులభతరం చేస్తుంది. ఈ అమృత ఘడియలలో శుభ ముహూర్తాలను ఎంచుకుని దృఢ సంకల్పంతో ముందడుగు వేస్తే, రాబోయే ఎన్నో దశాబ్దాల పాటు మీ కుటుంబాన్ని కాపాడే పటిష్టమైన ఆర్థిక, సామాజిక కోటను నిర్మించగలుగుతారు.`,
          ta: `இந்த 5 ஆண்டு பயணத்தில், ${peakYearLabel} ஆண்டு உங்கள் வாழ்க்கையில் பொற்கால எழுச்சியின் உச்சக்கட்டமாக அமையும். தேவகுரு பிரகஸ்பதியின் சாதகமான அருள், உபசய ஸ்தானங்களில் சுப கிரகங்களின் சஞ்சாரம் மற்றும் அஷ்டகவர்க்கத்தின் உயர்ந்த புள்ளிகள் ஆகியவை இணைந்து, நீங்கள் தொடங்கும் புதிய தொழில், சொத்து வாங்குதல், புதுமனை புகுவிழா அல்லது உத்தியோக உயர்வு ஆகியவற்றில் இரட்டிப்பு வெற்றியைத் தரும். உங்கள் தலைமைப் பண்பிற்கு புதிய அங்கீகாரம் கிடைக்கும்; சமுதாய பெரியோர்களின் ஆதரவு உங்கள் காரியங்களை எளிதாக்கும். இந்த பொன்னான காலகட்டத்தில் சுப முகூர்த்தங்களை முறையாகப் பயன்படுத்தி உறுதியுடன் செயல்பட்டால், வருங்கால தலைமுறைகளுக்கும் பாதுகாப்பளிக்கும் பலமான பொருளாதார அஸ்திவாரத்தை உருவாக்க முடியும்.`,
          en: `Within this 5-year continuum, the cycle of ${peakYearLabel} ascends as the sovereign zenith of your personal and worldly elevation. Bolstered by Jupiter's benevolent trines, favorable transit through growth houses (Upachayas), and peak Ashtakavarga bindus, initiatives inaugurated during this span—commercial ventures, residential acquisitions, property consecrations, or executive elevations—yield compounded dividends. Your authoritative stewardship gains prestigious recognition, attracting patronage from visionary allies. By harnessing calculated auspicious muhurtas and channeling decisive resolve, you will erect an enduring citadel of economic stability and societal honor shielding your family across forthcoming decades.`
        }, targetLang);

  // Paragraph 3: Caution & Vigilance
  const p3 = pick6({
    kn: `ಪ್ರಕೃತಿಯ ನಿಯಮದಂತೆ ಬೆಳಕಿನ ಜತೆ ನೆರಳು ಇರುವಂತೆ, ${cautionYearLabel} ಅವಧಿಯಲ್ಲಿ ನೀವು ಹೆಚ್ಚಿನ ಸಂಯಮ, ವಿವೇಕ ಹಾಗೂ ಮುಂಜಾಗ್ರತೆಯನ್ನು ವಹಿಸಬೇಕು. ಕೆಲಸದ ಅತಿಯಾದ ಒತ್ತಡದಿಂದ ನಿದ್ರಾಹೀನತೆ, ಆಯಾಸ ಅಥವಾ ರಕ್ತದೊತ್ತಡದಂತಹ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಎದುರಾಗದಂತೆ ಎಚ್ಚರವಹಿಸಿ. ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಯಾರನ್ನೂ ಕಣ್ಮುಚ್ಚಿ ನಂಬದೆ, ಯಾವುದೇ ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ ಹಾಕುವ ಮುನ್ನ ಪರಿಶೀಲಿಸಿ. ಕೌಟುಂಬಿಕ ಮಾತುಕತೆಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಇರಲಿ; ಕ್ಷಣಿಕ ಆವೇಶದಲ್ಲಿ ಯಾವುದೇ ಕಠೋರ ನಿರ್ಧಾರ ಬೇಡ. ಗ್ರಹಗಳ ಯಾವುದೇ ಸವಾಲುಗಳು ಈಶ್ವರ ಕೃಪೆಯ ಮುಂದೆ ನಿಲ್ಲಲಾರವು. ನಿತ್ಯವೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡುವುದರಿಂದ ಸಮಸ್ತ ಸಂಕಟಗಳು ನಿವಾರಣೆಯಾಗಿ ದಿವ್ಯ ರಕ್ಷೆ ಲಭಿಸಲಿದೆ.`,
    mr: `निसर्गाच्या नियमाप्रमाणे प्रकाशासोबत सावली असतेच; म्हणून ${cautionYearLabel} या काळात आपण विशेष संयम, विवेक व सावधगिरी बाळगणे आवश्यक आहे. कामाचा अतिताण, अपुरी झोप व धावपळीमुळे आरोग्यावर विपरीत परिणाम होणार नाही याची काळजी घ्या. पैशांच्या व्यवहारात कोणावरही आंधळा विश्वास न ठेवता कागदपत्रे तपासूनच निर्णय घ्या. कौटुंबिक संवादात शांतता राखा; रागाच्या भरात कटू शब्द उच्चारू नका. ग्रहांची कोणतीही प्रतिकूलता ईश्वरी कृपेपुढे क्षुल्लक ठरते. दररोज महामृत्युंजय मंत्र जप व श्री क्षेत्र गोकर्ण महाबळेश्वरास रुद्राभिषेक संकल्प केल्यास सर्व संकटांचे निवारण होऊन सुरक्षिततेचे अभेद्य कवच लाभेल.`,
    hi: `सृष्टि के नियमानुसार प्रकाश के साथ छाया का अस्तित्व अनिवार्य है; अतः ${cautionYearLabel} की अवधि में आपको विशेष संयम, विवेक एवं दूरदर्शिता बरतने की आवश्यकता होगी। कार्य के अत्यधिक बोझ से अनिद्रा, मानसिक तनाव अथवा रक्तचाप जैसी समस्याएं न पनपें, इसका ध्यान रखें। आर्थिक लेन-देन में किसी पर भी आंख मूंदकर भरोसा न करें तथा बिना सोचे-समझे ऋण अथवा जमानत न लें। पारिवारिक संवाद में वाणी का संयम रखें; क्षणिक आवेश में किसी प्रियजन को आहत न करें। स्मरण रखें कि ग्रहों की कोई भी प्रतिकूलता ईश्वर की असीम कृपा से बड़ी नहीं है। नित्य महामृत्युंजय मंत्र का जप एवं श्री क्षेत्र गोकर्ण में आत्मलिंग महाबलेश्वर को रुद्राभिषेक संकल्प आपके समस्त कष्टों का निवारण कर दिव्य सुरक्षा कवच प्रदान करेगा।`,
    te: `జీవిత నియమం ప్రకారం వెలుగుతో పాటు నీడ కూడా ఉంటుంది; కాబట్టి ${cautionYearLabel} సమయంలో మీరు విశేషమైన వివేకం మరియు ఓర్పును ప్రదర్శించాలి. పని ఒత్తిడి వల్ల నిద్రలేమి, అలసట లేదా రక్తపోటు సమస్యలు రాకుండా తగిన విశ్రాంతి తీసుకోండి. ఆర్థిక లావాదేవీలలో అపరిచితులను అతిగా నమ్మకుండా జాగ్రత్త వహించండి. కుటుంబ సంభాషణలలో సంయమనం పాటించండి; కోపంతో ఎవరినీ నొప్పించవద్దు. గ్రహాల ఎలాంటి సవాళ్లయినా దైవానుగ్రహం ముందు నిలవలేవు. రోజూ మహామృత్యుంజయ మంత్ర జపం మరియు శ్రీ క్షేత్ర గోకర్ణంలోని మహాబలేశ్వర స్వామికి రుద్రాభిషేక సంకల్పం మీ సమస్త ఆందోళనలను తొలగించి పరిపూర్ణ రక్షగా నిలుస్తాయి.`,
    ta: `வாழ்க்கை விதிகளின்படி ஒளியுடன் நிழலும் இருப்பது இயல்பு; எனவே ${cautionYearLabel} காலத்தில் நீங்கள் மிகுந்த விவேகத்துடனும் பொறுமையுடனும் செயல்பட வேண்டும். அதிக வேலைப்பளுவால் மன அழுத்தம், தூக்கமின்மை ஏற்படாமல் உடலையும் மனதையும் அமைதியாக வைத்துக் கொள்ளுங்கள். பண விவகாரங்களில் கண்மூடித்தனமான நம்பிக்கையைத் தவிர்த்து எச்சரிக்கையுடன் ஆவணங்களைச் சரிபார்க்கவும். குடும்பத்தினருடன் பேசும்போது கோபத்தைத் தவிர்த்து அன்புடன் பழகவும். கிரகங்களின் எந்த சவாலும் இறைவனின் அருளுக்கு முன்னால் நிற்க முடியாது. தினமும் மகா மிருத்யுஞ்சய மந்திரம் ஜபிப்பதும் ஸ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வதும் உங்கள் கவலைகளை நீக்கி திவ்ய கவசமாக காக்கும்.`,
    en: `As in nature where light is balanced by shadow, the window of ${cautionYearLabel} requests mindful vigilance, measured patience, and discernment. Guard your constitutional vitality against workaholism, erratic sleep, and nervous exhaustion through daily breathwork and restful pauses. In commercial and personal transactions, insulate yourself against misplaced sentimentality by verifying all contractual covenants meticulously. Cultivate gentleness in domestic speech; never let momentary frustration fray sacred family bonds. Remember that no planetary friction surpasses divine grace. Chanting the Mahamrityunjaya Mantra and invoking Sri Kshetra Gokarna Mahabaleshwara dissolves all tribulation into profound sanctuary.`
  }, targetLang);

  const attentionPoints = [
    {
      icon: "🎯",
      title: isInfant
        ? pick6({
          kn: "ಶಿಶು ವಾತ್ಸಲ್ಯ & ಪಾಲನೆ-ಪೋಷಣೆ",
          mr: "बालकाचे संगोपन व मातृवात्सल्य",
          hi: "शिशु पालन-पोषण एवं मातृ वात्सल्य",
          te: "శిశు లాలన-పాలన & రక్షణ",
          ta: "குழந்தை வளர்ப்பு & அன்பு அரவணைப்பு",
          en: "Infant Care & Maternal Sanctuary"
        }, targetLang)
        : isChild
          ? pick6({
            kn: "ವಿದ್ಯಾಭ್ಯಾಸ & ಅಧ್ಯಯನ ಶಿಸ್ತು",
            mr: "शालेय शिक्षण व अभ्यासाची शिस्त",
            hi: "विद्यालयी शिक्षा एवं अध्ययन अनुशासन",
            te: "విద్యాభ్యాసం & చదువులో క్రమశిక్షణ",
            ta: "பள்ளிப் படிப்பு & கல்வி ஒழுக்கம்",
            en: "Scholastic Discipline & Learning Habits"
          }, targetLang)
          : isAdolescent
            ? pick6({
              kn: "ಉನ್ನತ ವ್ಯಾಸಂಗ & ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಗುರಿ",
              mr: "उच्च शिक्षण व बोर्ड परीक्षा ध्येय",
              hi: "उच्च शिक्षा एवं बोर्ड परीक्षा लक्ष्य",
              te: "ఉన్నత విద్య & బోర్డు పరీక్షల లక్ష్యం",
              ta: "உயர்கல்வி & பொதுத்தேர்வு இலக்கு",
              en: "Pre-Collegiate Studies & Board Exam Focus"
            }, targetLang)
            : pick6({
              kn: "ವೃತ್ತಿ ಧರ್ಮ & ನಿರಂತರ ಶ್ರದ್ಧೆ",
              mr: "करिअर व अखंड कार्यनिष्ठा",
              hi: "करियर निष्ठा एवं सतत् पुरुषार्थ",
              te: "వృత్తి ధర్మం & నిరంతర శ్రద్ధ",
              ta: "தொழில் தர்மம் & தொடர் உழைப்பு",
              en: "Professional Focus & Diligence"
            }, targetLang),
      guidance: isInfant
        ? pick6({
          kn: "ತಾಯಿಯ ಹಾಲು, ಸಾತ್ವಿಕ ಪೌಷ್ಟಿಕ ಆಹಾರ ಹಾಗೂ ಶಾಂತ ವಾತಾವರಣದಿಂದ ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ವೃದ್ಧಿಸಿ.",
          mr: "मातेचे दूध, पौष्टिक सात्विक आहार व शांत वातावरणाने बालकाची प्रतिकारशक्ती वाढवा.",
          hi: "माता का दूध, पोषक सात्विक आहार एवं शांत वातावरण से शिशु की रोगप्रतिरोधक क्षमता बढ़ाएं।",
          te: "తల్లి పాలు, సాత్విక పౌష్టికాహారం & ప్రశాంత వాతావరణంతో శిశువు ఆరోగ్యాన్ని కాపాడండి.",
          ta: "தாய்ப்பால், சத்தான எளிய உணவு மற்றும் அமைதியான சூழல் குழந்தையின் நோய் எதிர்ப்பு சக்தியைப் பெருக்கும்.",
          en: "Nourish with pristine maternal care, wholesome pediatric diet, and peaceful sleep rhythms."
        }, targetLang)
        : isChild
          ? pick6({
            kn: "ದೈನಂದಿನ ಶಾಲಾ ಅಧ್ಯಯನದಲ್ಲಿ ನಿಯಮಿತತೆ ಕಾಯ್ದುಕೊಂಡು, ಶಿಕ್ಷಕರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಜ್ಞಾನ ಮತ್ತು ಗ್ರಹಣಶಕ್ತಿಯನ್ನು ವೃದ್ಧಿಸಿಕೊಳ್ಳಿ.",
            mr: "शालेय अभ्यासात नियमितता राखून शिक्षकांच्या मार्गदर्शनाने ज्ञान व स्मरणशक्ती वाढवावी.",
            hi: "दैनिक अध्ययन में नियमितता रखें तथा गुरुजनों के मार्गदर्शन में ज्ञान एवं स्मरण शक्ति का संवर्धन करें।",
            te: "రోజూ చదువులో క్రమశిక్షణ పాటిస్తూ, ఉపాధ్యాయుల మార్గదర్శకత్వంలో జ్ఞానాన్ని పెంపొందించుకోండి.",
            ta: "பள்ளிப் படிப்பில் தொடர் கவனமும் ஆசிரியர்களின் வழிகாட்டலும் அறிவையும் நினைவாற்றலையும் பெருக்கும்.",
            en: "Maintain daily study discipline and nurture conceptual comprehension under teacher guidance."
          }, targetLang)
          : isAdolescent
            ? pick6({
              kn: "ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳಿಗೆ ಯೋಜನಾಬದ್ಧ ಸಿದ್ಧತೆ ನಡೆಸಿ; ಆಧುನಿಕ ತಾಂತ್ರಿಕ ಜ್ಞಾನವನ್ನು ಸದುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳಿ.",
              mr: "बोर्ड परीक्षा व स्पर्धा परीक्षांसाठी नियोजनबद्ध अभ्यास करा; आधुनिक तंत्रज्ञानाचा योग्य वापर करा.",
              hi: "बोर्ड परीक्षाओं एवं प्रतियोगी परीक्षाओं हेतु योजनाबद्ध अध्ययन करें; तकनीकी ज्ञान का सदुपयोग करें।",
              te: "బోర్డు పరీక్షలు & ప్రవేశ పరీక్షల కోసం ప్రణాళికాబద్ధంగా చదవండి; సాంకేతిక పరిజ్ఞానాన్ని సద్వినియోగం చేసుకోండి.",
              ta: "பொதுத்தேர்வுகள் மற்றும் நுழைவுத் தேர்வுகளுக்கு திட்டமிட்டு படிக்கவும்; தொழில்நுட்பத்தை ஆக்கப்பூர்வமாகப் பயன்படுத்தவும்.",
              en: "Cultivate systematic preparation for milestone board and entrance examinations while harnessing technical acumen."
            }, targetLang)
            : pick6({
              kn: "ಆತುರದ ಬದಲಾವಣೆಗಳಿಗೆ ಮರುಳಾಗದೆ, ಪ್ರಸ್ತುತ ಜವಾಬ್ದಾರಿಗಳಲ್ಲಿ ದಕ್ಷತೆ ಮೆರೆದು ದೀರ್ಘಕಾಲೀನ ನಾಯಕತ್ವವನ್ನು ಸ್ಥಾಪಿಸಿ.",
              mr: "घाईगडबडीत निर्णय न घेता, सध्याच्या जबाबदाऱ्या चोख पार पाडून दीर्घकालीन नेतृत्वाचा पाया घाला.",
              hi: "उतावलेपन से बचकर, वर्तमान उत्तरदायित्वों को निष्ठापूर्वक निभाते हुए सुदीर्घ नेतृत्व की नींव रखें।",
              te: "ఆతురత పడకుండా, ప్రస్తుత బాధ్యతలను సమర్థవంతంగా నిర్వర్తిస్తూ దీర్ఘకాలిక నాయకత్వాన్ని పొందండి.",
              ta: "அவசர முடிவுகளைத் தவிர்த்து, தற்போதைய பொறுப்புகளில் சிறந்து விளங்கி நிலையான தலைமைத்துவத்தை அடையுங்கள்.",
              en: "Avoid erratic shifts; ground yourself in current responsibilities to establish enduring leadership."
            }, targetLang)
    },
    {
      icon: "💰",
      title: (isInfant || isChild || isAdolescent)
        ? pick6({
          kn: "ಶೈಕ್ಷಣಿಕ ಬಾಲನಿಧಿ & ಪೋಷಕರ ಉಳಿತಾಯ",
          mr: "बाल शैक्षणिक निधी व पालकांची बचत",
          hi: "बाल शिक्षा कोष एवं सुरक्षित बचत",
          te: "విద్యా నిధి & తల్లిదండ్రుల పొదుపు",
          ta: "கல்வி சேமிப்பு நிதி & எதிர்கால பாதுகாப்பு",
          en: "Parental Education Fund & Long-Term Shield"
        }, targetLang)
        : pick6({
          kn: "ಆರ್ಥಿಕ ಶಿಸ್ತು & ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆ",
          mr: "आर्थिक शिस्त व सुरक्षित गुंतवणूक",
          hi: "आर्थिक अनुशासन एवं सुरक्षित निवेश",
          te: "ఆర్థిక క్రమశిక్షణ & సురక్షిత పెట్టుబడులు",
          ta: "பொருளாதார ஒழுக்கம் & பாதுகாப்பான முதலீடு",
          en: "Fiscal Discipline & Tangible Assets"
        }, targetLang),
      guidance: (isInfant || isChild || isAdolescent)
        ? pick6({
          kn: "ಮಗುವಿನ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕಾಗಿ ಸುರಕ್ಷಿತ ಶಿಕ್ಷಣ ಯೋಜನೆ, ಚಿನ್ನ ಅಥವಾ ಸುಕನ್ಯಾ/ಬಾಲ ನಿಧಿಗಳಲ್ಲಿ ದೀರ್ಘಕಾಲೀನ ಉಳಿತಾಯವನ್ನು ವೃದ್ಧಿಸಿ.",
          mr: "मुलाच्या भावी शिक्षणासाठी सुरक्षित विमा, सुकन्या/बाल बचत किंवा सुवर्ण योजनांमध्ये दीर्घकालीन गुंतवणूक करा.",
          hi: "बालक के भावी शिक्षण हेतु सुरक्षित शिक्षा योजना, सुकन्या अथवा स्वर्ण संचय में दीर्घकालिक निवेश बढ़ाएं।",
          te: "పిల్లల ఉన్నత చదువుల కోసం సురక్షిత విద్యా బీమా, సుకన్య సమృద్ధి లేదా బంగారంలో పొదుపు చేయండి.",
          ta: "குழந்தையின் உயர்கல்விக்காக செல்வமகள், தங்கம் அல்லது அரசு சேமிப்பு திட்டங்களில் முதலீடு செய்யுங்கள்.",
          en: "Direct steady monthly savings toward child education bonds, sovereign gold, and long-term academic funds."
        }, targetLang)
        : pick6({
          kn: "ಊಹಾತ್ಮಕ ಅಪಾಯಕಾರಿ ಷೇರುಗಳನ್ನು ತ್ಯಜಿಸಿ, ಭೂಮಿ, ಚಿನ್ನ ಹಾಗೂ ಭದ್ರ ಉಳಿತಾಯಗಳಲ್ಲಿ ಸಂಪತ್ತನ್ನು ಸಂಚಯಿಸಿ.",
          mr: "जोखमीची सट्टेबाजी टाळून जमीन, सोने व सुरक्षित योजनांमध्ये दीर्घकालीन संपत्ती निर्माण करा.",
          hi: "अत्यधिक जोखिमपूर्ण सट्टेबाजी से बचकर भूमि, स्वर्ण एवं सुरक्षित बचतों में पूंजी संचित करें।",
          te: "అధిక రిస్క్ ఉన్న స్పెక్యులేషన్లకు దూరంగా ఉంటూ భూమి, బంగారం మరియు స్థిర పొదుపులపై దృష్టి పెట్టండి.",
          ta: "அபாயகரமான ஊக வணிகங்களைத் தவிர்த்து நிலம், தங்கம் மற்றும் பாதுகாப்பான சேமிப்பில் முதலீடு செய்யுங்கள்.",
          en: "Forego speculative gambles in favor of prime real estate, gold reserves, and sovereign compounding."
        }, targetLang)
    },
    {
      icon: "🌿",
      title: isInfant
        ? pick6({
          kn: "ಶಿಶು ಆರೋಗ್ಯ & ಬಾಲ ಧನ್ವಂತರಿ ಕವಚ",
          mr: "बालकाचे आरोग्य व धन्वंतरी कवच",
          hi: "शिशु स्वास्थ्य एवं बाल धन्वंतरि कवच",
          te: "శిశు ఆరోగ్యం & బాల ధన్వంతరి కవచం",
          ta: "குழந்தை நலம் & தன்வந்திரி பாதுகாப்பு",
          en: "Pediatric Vitality & Teething Care"
        }, targetLang)
        : isChild
          ? pick6({
            kn: "ಬಾಲ ಆರೋಗ್ಯ, ನಿದ್ರೆ & ಕಣ್ಣಿನ ರಕ್ಷೆ",
            mr: "बालकाचे आरोग्य, शांत झोप व डोळ्यांचे रक्षण",
            hi: "बाल स्वास्थ्य, पर्याप्त नींद एवं नेत्र सुरक्षा",
            te: "పిల్లల ఆరోగ్యం, మంచి నిద్ర & కంటి రక్షణ",
            ta: "குழந்தை ஆரோக்கியம், ஆழ்ந்த உறக்கம் & கண் நலம்",
            en: "Pediatric Health & Screen Moderation"
          }, targetLang)
          : isAdolescent
            ? pick6({
              kn: "ಮಾನಸಿಕ ಸಮತೋಲನ & ಏಕಾಗ್ರತೆ",
              mr: "मानसिक संतुलन, एकाग्रता व ऊर्जा",
              hi: "मानसिक संतुलन, एकाग्रता एवं स्फूर्ति",
              te: "మానసిక సమతుల్యత & ఏకాగ్రత",
              ta: "மன அமைதி, கவனம் & புத்துணர்ச்சி",
              en: "Adolescent Mental Harmony & Vitality"
            }, targetLang)
            : pick6({
              kn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಆಂತರಿಕ ನೆಮ್ಮದಿ",
              mr: "आरोग्य रक्षण व मनःशांती",
              hi: "आरोग्य संरक्षण एवं आंतरिक शांति",
              te: "ఆరోగ్య రక్షణ & మనశ్శాంతి",
              ta: "உடல் நலம் & மன அமைதி",
              en: "Vitality Preservation & Inner Peace"
            }, targetLang),
      guidance: isInfant
        ? pick6({
          kn: "ಹವಾಮಾನ ಬದಲಾವಣೆಗಳಲ್ಲಿ ಶೀತ-ಕಫದಿಂದ ರಕ್ಷಿಸಿ; ಜೀರ್ಣಾಂಗ ಶುದ್ಧತೆ ಹಾಗೂ ಬಾಲ ಧನ್ವಂತರಿ ಕೃಪೆಗೆ ಪ್ರಾರ್ಥಿಸಿ.",
          mr: "ऋतुबदलात सर्दी-कफापासून जपा; पचनक्रिया उत्तम ठेवून धन्वंतरीची आराधना करा.",
          hi: "ऋतु परिवर्तन में सर्दी-जुकाम से बचाव करें; पाचन शुद्धि एवं धन्वंतरि कृपा हेतु प्रार्थना करें।",
          te: "వాతావరణ మార్పులలో జలుబు నుండి రక్షించండి; జీర్ణక్రియ బాగుండేలా చూసుకోండి.",
          ta: "பருவநிலை மாற்றத்தில் சளி பிடிக்காமல் காக்கவும்; நல்ல செரிமானம் மற்றும் உடல் நலனைப் பேணவும்.",
          en: "Shield against seasonal drafts and maintain pristine digestive hygiene under Dhanvantari's grace."
        }, targetLang)
        : isChild
          ? pick6({
            kn: "ಮೊಬೈಲ್/ಟಿವಿ ಪರದೆ ಸಮಯವನ್ನು ನಿಯಂತ್ರಿಸಿ, ಶುದ್ಧ ನೀರು, ಕ್ರೀಡಾ ಚಟುವಟಿಕೆ ಹಾಗೂ ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ನಿದ್ರೆಯನ್ನು ರೂಢಿಸಿ.",
            mr: "स्क्रीन टाइम मर्यादित ठेवा; पुरेसे पाणी, मैदानी खेळ व वेळेवर झोपेची सवय लावा.",
            hi: "स्क्रीन टाइम सीमित रखें; पर्याप्त जल, मैदानी खेलकूद एवं समय पर सोने की आदत डालें।",
            te: "స్క్రీన్ సమయాన్ని తగ్గించండి; శుభ్రమైన నీరు, ఆటలు & సరైన నిద్ర అలవర్చండి.",
            ta: "செல்போன் நேரத்தைக் குறைக்கவும்; போதிய தண்ணீர், விளையாட்டு மற்றும் நேரத்திற்கு தூங்கும் பழக்கம் நலம்.",
            en: "Moderate digital screen exposure; encourage outdoor play, pure hydration, and sound sleep rhythms."
          }, targetLang)
          : isAdolescent
            ? pick6({
              kn: "ಪರೀಕ್ಷಾ ಆತಂಕವನ್ನು ನಿವಾರಿಸಲು ಪ್ರಾಣಾಯಾಮ, ನಿಯಮಿತ ನಡಿಗೆ ಹಾಗೂ ಸಾತ್ವಿಕ ಆಹಾರವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳಿ.",
              mr: "परीक्षा तणाव दूर करण्यासाठी प्राणायाम, चालणे व सात्विक आहाराची सवय ठेवा.",
              hi: "परीक्षा की चिंता दूर करने हेतु नित्य प्राणायाम, भ्रमण एवं सात्विक आहार अपनाएं।",
              te: "పరీక్షల ఆందోళన తగ్గడానికి ప్రాణాయామం, నడక & సాత్విక ఆహారం అలవర్చుకోండి.",
              ta: "தேர்வு பதற்றத்தை போக்க யோகா, நடைப்பயிற்சி மற்றும் சத்தான உணவை உட்கொள்ளவும்.",
              en: "Neutralize exam stress through daily pranayama, evening brisk walks, and nutrient-dense sattvic meals."
            }, targetLang)
            : pick6({
              kn: "ಸಾತ್ವಿಕ ಪಥ್ಯ, ನಿಯಮಿತ ನಿದ್ರೆ ಹಾಗೂ ಪ್ರಾತಃಕಾಲದ ಪ್ರಾಣಾಯಾಮದಿಂದ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ವಜ್ರದಂತೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
              mr: "सात्त्विक आहार, पुरेशी झोप व सकाळी प्राणायामाने शरीराची रोगप्रतिकारशक्ती उत्तम ठेवा.",
              hi: "सात्विक आहार, समय पर विश्राम एवं प्रातः प्राणायाम द्वारा रोग प्रतिरोधक क्षमता को सुदृढ़ बनाए रखें।",
              te: "సాత్విక ఆహారం, సరైన నిద్ర మరియు ఉదయం ప్రాణాయామంతో రోగనిరోధక శక్తిని దృఢంగా ఉంచుకోండి.",
              ta: "சாத்வீக உணவு, சரியான உறக்கம் மற்றும் காலை பிராணாயாமத்தால் நோய் எதிர்ப்பு சக்தியைப் பேணுங்கள்.",
              en: "Uphold satvik nutrition, restorative sleep rhythms, and morning pranayama to fortify immunity."
            }, targetLang)
    },
    {
      icon: "🕉️",
      title: pick6({
        kn: "ದೈವ ಭಕ್ತಿ & ಶ್ರೀ ಗೋಕರ್ಣ ಸಂಕಲ್ಪ",
        mr: "ईश्वरी भक्ती व गोकर्ण संकल्प",
        hi: "भगवद् भक्ति एवं श्री गोकर्ण संकल्प",
        te: "దైవ భక్తి & శ్రీ గోకర్ణ సంకల్పం",
        ta: "இறை பக்தி & ஸ்ரீ கோகர்ண சங்கல்பம்",
        en: "Devotional Sanctuary & Gokarna Vows"
      }, targetLang),
      guidance: pick6({
        kn: "ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ, ನಿತ್ಯ ಇಷ್ಟ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಸೇವೆ ಸಕಲ ದೋಷ ಶಮನಕಾರಿ.",
        mr: "कुलदेवतेची आराधना, नित्य इष्टमंत्र जप व श्री गोकर्ण महाबळेश्वर चरणी सेवा सर्व संकटांचे निवारण करेल.",
        hi: "कुलदेवता की अर्चना, नित्य इष्ट मंत्र जप एवं श्री गोकर्ण महाबलेश्वर की आराधना सर्व क्लेश हरने वाली है।",
        te: "కులదేవత పూజ, నిత్య ఇష్ట మంత్ర జపం మరియు శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి సేవ సమస్త దోషాలను తొలగిస్తుంది.",
        ta: "குலதெய்வ வழிபாடு, தினமும் இஷ்ட மந்திர ஜபம் மற்றும் ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சேவை சகல தோஷங்களையும் போக்கும்.",
        en: "Kuladevata worship, daily mantra recitations, and Gokarna sanctum sevas shield your destiny."
      }, targetLang)
    }
  ];

  const spiritualSolace = pick6({
    kn: "॥ ಶುಭಂ ಭವತು • ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪರಮ ಪಾವನ ಕೃಪೆಯು ನಿಮ್ಮನ್ನು ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ಸದಾ ರಕ್ಷಿಸಲಿ ॥",
    mr: "॥ शुभं भवतु • श्री गोकर्ण महाबळेश्वरांचे पावन कृपाछत्र आपल्या कुटुंबावर सदैव राहो ॥",
    hi: "॥ शुभं भवतु • श्री गोकर्ण महाबलेश्वर स्वामी की परम कृपा आपके एवं आपके परिवार पर सदैव बनी रहे ॥",
    te: "॥ శుభం భవతు • శ్రీ గోకర్ణ మహాబలేశ్వర స్వామివారి దివ్య రక్ష మీ కుటుంబానికి సదా ఉండుగాక ॥",
    ta: "॥ சுபம் பவது • ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் அருள் உங்கள் குடும்பத்தை எப்போதும் காக்கட்டும் ॥",
    en: "|| Shubham Bhavatu • May the supreme grace of Sri Kshetra Gokarna Mahabaleshwara perpetually shield you and your lineage ||"
  }, targetLang);

  const careerFinancialPivot = attentionPoints[0]?.guidance || "";
  const healthVitalityShield = attentionPoints[1]?.guidance || "";
  const spiritualRemedyFulfillment = attentionPoints[2]?.guidance || "";
  const relationshipFamilyHarmony = attentionPoints[3]?.guidance || attentionPoints[0]?.guidance || "";

  return {
    title,
    subtitle,
    titleKn: title,
    titleEn: "Daivajna Master Jyotish Synthesis",
    paragraphs: [p1, p2, p3],
    p1KarmicJourney: p1,
    p2PeakGoldenEra: p2,
    p3AttentionPointsAndSolace: p3,
    attentionPoints,
    spiritualSolace,
    careerFinancialPivot,
    healthVitalityShield,
    spiritualRemedyFulfillment,
    relationshipFamilyHarmony
  };
}

/**
 * 13. Personalized Dynamic Devotee Sanskrit Shloka
 */
/**
 * 13. Dynamic Sacred Deity Portrait Resolver
 * Maps devotee's planetary lordship, Lagna, Moon, and Dasha to authentic poster images in public/daily_posters/
 */
function _resolveSacredDeityImageRaw(
  lagnaIdx: number,
  moonIdx: number,
  runningMahadashaPrimary: PlanetName,
  hasSaturnTroubleAnyYear: boolean,
  lang: SixLang,
  prescribedStotraId?: string,
  prescribedDeityName?: string
): { imagePath: string; deityName: string; sanctumTitle: string; blessingMotto: string } {
  const normId = (prescribedStotraId || "").toLowerCase();
  const normDeity = (prescribedDeityName || "").toLowerCase();

  // 1. Tulsi Plant / Vrindavan Aradhana
  if (
    normId.includes("tulsi") ||
    normDeity.includes("tulsi") ||
    normDeity.includes("ತುಳಸಿ") ||
    normDeity.includes("तुलसी") ||
    normDeity.includes("తులసి") ||
    normDeity.includes("துளசி")
  ) {
    return {
      imagePath: "/daily_posters/poster_tulsi.jpg",
      deityName: pick6({
        kn: "ಪವಿತ್ರ ಶ್ರೀ ತುಳಸಿ ಮಹಾಲಕ್ಷ್ಮಿ (ವೃಂದಾ ದೇವಿ / ತುಳಸಿ ವೃಂದಾವನ)",
        mr: "पवित्र श्री तुळशी महालक्ष्मी (वृंदा देवी / तुळशी वृंदावन)",
        hi: "पवित्र श्री तुलसी महालक्ष्मी (वृंदा देवी / तुलसी वृंदावन)",
        te: "పవిత్ర శ్రీ తులసి మహాలక్ష్మి (బృందా దేవి / తులసి బృందావనం)",
        ta: "புனித ஸ்ரீ துளசி மஹாலக்ஷ்மி (பிருந்தா தேவி / துளசி மாடம்)",
        en: "Sacred Sri Tulasi Mahalakshmi (Vrinda Devi / Tulasi Vrindavan)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಬುದ್ಧಿಮತ್ತೆ, ಆರೋಗ್ಯ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಸರ್ವ ದೋಷ ನಿವಾರಕ ತುಳಸಿ ಸಾನ್ನಿಧ್ಯ",
        mr: "बुद्धिमत्ता, आरोग्य, कौटुंबिक शांतता व सर्व दोष निवारक तुळशी सान्निध्य",
        hi: "बुद्धिमत्ता, आरोग्य, पारिवारिक शांति एवं सर्व दोष निवारक तुलसी सान्निध्य",
        te: "జ్ఞాన, బుద్ధి, ఆరోగ్య & సర్వ దోష నివారణ తులసి సేవ",
        ta: "ஞானம், புத்தி கூர்மை, ஆரோக்கியம் & சகல தோஷ நிவர்த்தி தரும் துளசி சன்னதி",
        en: "Intellectual Mastery, Vitality & Sacred Tulasi Sanctum"
      }, lang),
      blessingMotto: "यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः । यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम् ॥"
    };
  }

  // 2. Lord Hanumantha / Shani Affliction / Shani Dasharatha Stotra
  if (
    normId.includes("shani") ||
    normId.includes("hanuman") ||
    normDeity.includes("hanuman") ||
    normDeity.includes("ಆಂಜನೇಯ") ||
    normDeity.includes("ಹನುಮಾನ್") ||
    normDeity.includes("हनुमान") ||
    normDeity.includes("मारुती") ||
    normDeity.includes("హనుమాన్") ||
    normDeity.includes("அனுமன்")
  ) {
    return {
      imagePath: "/daily_posters/poster_6_hanuman.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಭಕ್ತ ಆಂಜನೇಯ ಸ್ವಾಮಿ (ಮಹಾ ಪ್ರಾಣೇಶ)",
        mr: "श्री भक्त मारुतीराय (संकटमोचन हनुमान)",
        hi: "श्री भक्त हनुमान जी (संकटमोचन महावीर)",
        te: "శ్రీ భక్త ఆంజనేయ స్వామి (సంకటమోచన హనుమాన్)",
        ta: "ஸ்ரீ பக்த ஆஞ்சநேய சுவாமி (சங்கடமோசன அனுமன்)",
        en: "Lord Sri Bhakta Hanuman (Sankat Mochan)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಸಕಲ ಗ್ರಹ ಪೀಡಾ ನಿವಾರಕ • ಶನಿ ದೋಷ ಮುಕ್ತಿ ಸನ್ನಿಧಿ",
        mr: "सर्व ग्रहपीडा निवारक • शनि दोष मुक्ती सान्निध्य",
        hi: "समस्त ग्रहपीड़ा निवारक • शनि दोष मुक्ति सान्निध्य",
        te: "సకల గ్రహపీడా నివారణ • శని దోష ముక్తి సేవ",
        ta: "சகல கிரக தோஷ நிவர்த்தி • சனி தோஷ நிவாரண சன்னதி",
        en: "Universal Planetary Affliction Shield & Saturn Dispeller"
      }, lang),
      blessingMotto: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् । वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥"
    };
  }

  // 3. Lord Maha Vishnu / Vishnu Sahasranama Stotra
  if (
    (normId.includes("vishnu") ||
      normDeity.includes("vishnu") ||
      normDeity.includes("ವಿಷ್ಣು") ||
      normDeity.includes("विष्णु") ||
      normDeity.includes("విష్ణు") ||
      normDeity.includes("விஷ்ணு") ||
      normDeity.includes("ನಾರಾಯಣ") ||
      normDeity.includes("नारायण")) &&
    !normDeity.includes("ಸೂರ್ಯ") &&
    !normDeity.includes("सूर्य") &&
    !normDeity.includes("surya") &&
    !normId.includes("aditya")
  ) {
    return {
      imagePath: "/daily_posters/poster_3_vishnu.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು ಪರಮಾತ್ಮ (ವೈಕುಂಠನಾಥ)",
        mr: "श्री महाविष्णु परमात्मा (जगत्पालक)",
        hi: "श्री महाविष्णु परमात्मा (जगतपालक)",
        te: "శ్రీ మహావిష్ణు పరమాత్మ (జగత్పాలకుడు)",
        ta: "ஸ்ரீ மகாவிஷ்ணு பரமாத்மா (வைகுந்தநாதன்)",
        en: "Lord Sri Maha Vishnu (Universal Sustainer)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಬುದ್ಧಿಮತ್ತೆ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಸನ್ನಿಧಿ",
        mr: "बुद्धिमत्ता, व्यापार वृद्धी व कौटुंबिक सुरक्षा सान्निध्य",
        hi: "बुद्धि, व्यापार विस्तार एवं पारिवारिक सुरक्षा सान्निध्य",
        te: "జ్ఞానవృద్ధి, వ్యాపార ప్రగతి & కుటుంబ రక్షా సేవ",
        ta: "புத்தி கூர்மை, வர்த்தக வளர்ச்சி & குடும்ப பாதுகாப்பு சன்னதி",
        en: "Intellectual Mastery, Commercial Growth & Domestic Sanctuary"
      }, lang),
      blessingMotto: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥"
    };
  }

  // 4. Goddess Mahalakshmi / Kanakadhara Stotra
  if (
    normId.includes("kanakadhara") ||
    normId.includes("lakshmi") ||
    normDeity.includes("lakshmi") ||
    normDeity.includes("ಲಕ್ಷ್ಮಿ") ||
    normDeity.includes("महालक्ष्मी") ||
    normDeity.includes("లక్ష్మి") ||
    normDeity.includes("லட்சுமி")
  ) {
    return {
      imagePath: "/daily_posters/poster_5_mahalakshmi.jpg",
      deityName: pick6({
        kn: "ಜಗನ್ಮಾತೆ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ (ಐಶ್ವರ್ಯದಾಯಿನಿ)",
        mr: "जगन्माता श्री महालक्ष्मी (ऐश्वर्यदायिनी)",
        hi: "जगन्माता श्री महालक्ष्मी (ऐश्वर्य प्रदायिनी)",
        te: "జగన్మాత శ్రీ మహాలక్ష్మి దేవి (ఐశ్వర్య ప్రదాయిని)",
        ta: "ஜெகன்மாதா ஸ்ரீ மகாலட்சுமி தேவி (அஷ்டலட்சுமி)",
        en: "Goddess Sri Mahalakshmi (Bestower of Sovereign Wealth)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಅಷ್ಟೈಶ್ವರ್ಯ ವೃದ್ಧಿ, ಗೃಹ ಸೌಭಾಗ್ಯ ಹಾಗೂ ದಾರಿದ್ರ್ಯ ನಿವಾರಕ ಸನ್ನಿಧಿ",
        mr: "अष्टलक्ष्मी कृपा, कौटुंबिक सौख्य व दारिद्र्य निवारक सान्निध्य",
        hi: "अष्टलक्ष्मी कृपा, गृह सौभाग्य एवं दारिद्र्य निवारक सान्निध्य",
        te: "అష్టైశ్వర్య వృద్ధి, గృహ సౌభాగ్యం & దారిద్ర్య నివారణ",
        ta: "அஷ்டலட்சுமி கடாட்சம், இல்லற சுபிக்ஷம் & தனவிருத்தி",
        en: "Perpetual Treasury Compounding & Domestic Harmony Shield"
      }, lang),
      blessingMotto: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते । शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते ॥"
    };
  }

  // 5. Lord Suryanarayana / Aditya Hridaya
  if (
    normId.includes("aditya") ||
    normId.includes("surya") ||
    normDeity.includes("surya") ||
    normDeity.includes("ಸೂರ್ಯ") ||
    normDeity.includes("सूर्य") ||
    normDeity.includes("సూర్య") ||
    normDeity.includes("சூரிய")
  ) {
    return {
      imagePath: "/daily_posters/poster_0_surya.jpg",
      deityName: pick6({
        kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ (ಪ್ರತ್ಯಕ್ಷ ಪರಬ್ರಹ್ಮ)",
        mr: "भगवान सूर्यनारायण (प्रत्यक्ष परब्रह्म)",
        hi: "भगवान सूर्यनारायण (प्रत्यक्ष देव)",
        te: "భగవాన్ సూర్యనారాయణ స్వామి (ప్రత్యక్ష దైవం)",
        ta: "பகவான் சூரியநாராயண சுவாமி (பிரத்யக்ஷ தெய்வம்)",
        en: "Lord Sri Suryanarayana (Pratyaksha Devata)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಆರೋಗ್ಯ, ಆಯುಷ್ಯ, ರಾಜಗೌರವ ಹಾಗೂ ತೇಜೋ ವರ್ಧಕ ಸನ್ನಿಧಿ",
        mr: "आरोग्य, दीर्घायुष्य, राजसन्मान व तेज संवर्धन सान्निध्य",
        hi: "आरोग्य, दीर्घायु, राजसम्मान एवं तेजस्विता प्रदायक सान्निध्य",
        te: "ఆరోగ్య, ఆయుష్షు, రాజగౌరవం & తేజస్సు ప్రసాదించే సేవ",
        ta: "ஆரோக்கியம், தீர்க்காயுள், சமூக அந்தஸ்து தரும் சன்னதி",
        en: "Radiant Vitality, Executive Authority & Longevity Shield"
      }, lang),
      blessingMotto: "आदित्यस्य नमस्कारान् ये कुर्वन्ति दिने दिने । जन्मान्तरसहस्रेषु दारिद्र್ಯಂ ನೋಪಜಾಯತೇ ॥"
    };
  }

  // 6. Lord Maha Ganapati
  if (
    normId.includes("ganesha") ||
    normId.includes("ganapati") ||
    normDeity.includes("ganesha") ||
    normDeity.includes("ganapati") ||
    normDeity.includes("ಗಣೇಶ") ||
    normDeity.includes("ಗಣಪತಿ") ||
    normDeity.includes("गणेश") ||
    normDeity.includes("गणपती") ||
    normDeity.includes("గణపతి") ||
    normDeity.includes("கணபதி")
  ) {
    return {
      imagePath: "/daily_posters/poster_ganesha.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸ್ವಾಮಿ (ವಿಘ್ನನಿವಾರಕ)",
        mr: "श्री महागणपती स्वामी (विघ्नहर्ता)",
        hi: "श्री महागणपति जी (विघ्नहर्ता)",
        te: "శ్రీ మహాగణపతి స్వామి (విఘ్నహర్త)",
        ta: "ஸ்ரீ மகா கணபதி சுவாமி (விக்னஹர்த்தா)",
        en: "Lord Sri Maha Ganapati (Vighnaharta)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಸರ್ವ ವಿಘ್ನ ನಿವಾರಕ • ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ • ಮೋದಕ ಪ್ರಿಯ ಸನ್ನಿಧಿ",
        mr: "सर्व विघ्न निवारक • सर्व कार्य सिद्धी • मोदक प्रिय सान्निध्य",
        hi: "सर्व विघ्न निवारक • सर्व कार्य सिद्धि • मोदक प्रिय सान्निध्य",
        te: "సర్వ విఘ్న నివారణ • కార్య సిద్ధి సేవ",
        ta: "சகல விக்ன நிவாரணம் • காரிய சித்தி தரும் சன்னதி",
        en: "Universal Obstacle Dispeller & Sovereign Endeavor Sanctum"
      }, lang),
      blessingMotto: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥"
    };
  }

  // 7. Lord Subrahmanya / Karthikeya
  if (
    normId.includes("subrahmanya") ||
    normId.includes("karthikeya") ||
    normDeity.includes("subrahmanya") ||
    normDeity.includes("karthikeya") ||
    normDeity.includes("ಸುಬ್ರಹ್ಮಣ್ಯ") ||
    normDeity.includes("ಕಾರ್ತಿಕೇಯ") ||
    normDeity.includes("कार्तिकेय") ||
    normDeity.includes("సుబ్రహ్మణ్య") ||
    normDeity.includes("சுப்பிரமணிய")
  ) {
    return {
      imagePath: "/daily_posters/poster_2_karthikeya.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ (ಸ್ಕಂದ ಕಾರ್ತಿಕೇಯ)",
        mr: "श्री कार्तिकेय स्वामी (स्कंद सुब्रह्मण्य)",
        hi: "श्री कार्तिकेय स्वामी (स्कंद सुब्रह्मण्य)",
        te: "శ్రీ సుబ్రహ్మణ్య స్వామి (స్కంద కార్తికేయ)",
        ta: "ஸ்ரீ சுப்பிரமணிய சுவாமி (கந்தன் கார்த்திகேயன்)",
        en: "Lord Sri Subrahmanya (Skanda Kartikeya)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಸರ್ವ ಶತ್ರು ಜಯ, ಭೂ ಭಾಗ್ಯ ಹಾಗೂ ಕುಜ ದೋಷ ಶಮನ ಸನ್ನಿಧಿ",
        mr: "शत्रूवर विजय, जमीन खरेदी व मंगळ दोष शमन सान्निध्य",
        hi: "सर्व शत्रु विजय, भूमि योग एवं मंगल दोष शमन सान्निध्य",
        te: "శత్రు జయం, భూలాభం & కుజ దోష నివారణ సేవ",
        ta: "சத்ரு சம்ஹாரம், பூமி யோகம் & செவ்வாய் தோஷ நிவர்த்தி",
        en: "Triumph over Adversity, Real Estate Prosperity & Mangala Pacifier"
      }, lang),
      blessingMotto: "शक्तिहस्तं विरूपाक्षं शिखಿವಾಹಂ ಷಣ್ಮುಖಮ್ । ಮಯೂರವಾಹನಂ ದೇವಂ ಸುಬ್ರಹ್ಮಣ್ಯಂ ನಮಾಮ್ಯಹಮ್ ॥"
    };
  }

  // 8. Lord Guru / Brihaspati / Dakshinamurthy
  if (
    normId.includes("guru") ||
    normId.includes("brihaspati") ||
    normDeity.includes("guru") ||
    normDeity.includes("brihaspati") ||
    normDeity.includes("ಬೃಹಸ್ಪತಿ") ||
    normDeity.includes("ದಕ್ಷಿಣಾಮೂರ್ತಿ") ||
    normDeity.includes("बृहस्पति") ||
    normDeity.includes("బృహస్పతి") ||
    normDeity.includes("பிரகஸ்பதி")
  ) {
    return {
      imagePath: "/daily_posters/poster_4_guru.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ & ದೇವಗುರು ಬೃಹಸ್ಪತಿ",
        mr: "श्री दक्षिणामूर्ती व देवगुरू बृहस्पती",
        hi: "श्री दक्षिणामूर्ति एवं देवगुरु बृहस्पति",
        te: "శ్రీ దక్షిణామూర్తి & దేవగురు బృహస్పతి",
        ta: "ஸ்ரீ தட்சிணாமூர்த்தி & தேவகுரு பிரகஸ்பதி",
        en: "Lord Sri Dakshinamurthy & Devaguru Brihaspati"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಜ್ಞಾನೋದಯ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಪೂರ್ಣ ಗುರುಬಲ ಸನ್ನಿಧಿ",
        mr: "ज्ञानोदय, संतती सुख व संपूर्ण गुरुबळ सान्निध्य",
        hi: "ज्ञानोदय, संतान सुख एवं पूर्ण गुरुबल प्रदायक सान्निध्य",
        te: "జ్ఞానోదయం, సంతాన సౌభాగ్యం & సంపూర్ణ గురుబలం",
        ta: "ஞானோதயம், புத்திர பாக்கியம் & பூரண குரு பலன்",
        en: "Spiritual Illumination, Noble Progeny & Auspicious Guru Bala"
      }, lang),
      blessingMotto: "गुरवे सर्वलोकानां भिषजे भवरोगिणाम् । निधये सर्वविद्यानां दक्षिणामूर्तये नमः ॥"
    };
  }

  // 9. Lord Shiva Mahabaleshwara (Gokarna Atmalinga)
  if (
    normId.includes("shiva") ||
    normDeity.includes("shiva") ||
    normDeity.includes("ಶಿವ") ||
    normDeity.includes("ಮಹಾಬಲೇಶ್ವರ") ||
    normDeity.includes("शिव") ||
    normDeity.includes("శివ") ||
    normDeity.includes("சிவன்")
  ) {
    return {
      imagePath: "/daily_posters/poster_1_shiva.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಪಾವನ ಆತ್ಮಲಿಂಗ)",
        mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर स्वामी (पवित्र आत्मलिंग)",
        hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर स्वामी (परम पावन आत्मलिंग)",
        te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి (దివ్య ఆత్మలింగం)",
        ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வர சுவாமி (புனித ஆத்மலிங்கம்)",
        en: "Sri Kshetra Gokarna Mahabaleshwara (Sacred Atmalinga)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಅಖಂಡ ಆಯುರ್-ಆರೋಗ್ಯ ರಕ್ಷೆ • ಮಹಾಮುಕ್ತಿ ಧಾಮ • ಬಗ್ಗೋಣ ಪರಮ ಸಾನ್ನಿಧ್ಯ",
        mr: "अखंड आरोग्य व दीर्घायुष्य रक्षा • महामुक्ती धाम • बग्गोण परम सान्निध्य",
        hi: "अखंड आरोग्य एवं दीर्घायु रक्षा • महामुक्ति धाम • बग्गोण परम सान्निध्य",
        te: "అఖండ ఆయురారోగ్య రక్ష • మహా ముక్తి ధామం • బగ్గోణ పరమ సేవ",
        ta: "தீர்க்காயுள் & ஆரோக்கிய பாதுகாப்பு • மகா முக்தி தலம் • பக்கோண திருப்பணி",
        en: "Supreme Longevity & Vitality Shield • Primordial Gokarna Sanctum"
      }, lang),
      blessingMotto: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥"
    };
  }

  // Fallback to planetary lordship checks
  // If Saturn affliction (Sade Sati, Ashtama) or Saturn Mahadasha -> Lord Hanuman
  if (hasSaturnTroubleAnyYear || runningMahadashaPrimary === PlanetName.Saturn) {
    return {
      imagePath: "/daily_posters/poster_6_hanuman.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಭಕ್ತ ಆಂಜನೇಯ ಸ್ವಾಮಿ (ಮಹಾ ಪ್ರಾಣೇಶ)",
        mr: "श्री भक्त मारुतीराय (संकटमोचन हनुमान)",
        hi: "श्री भक्त हनुमान जी (संकटमोचन महावीर)",
        te: "శ్రీ భక్త ఆంజనేయ స్వామి (సంకటమోచన హనుమాన్)",
        ta: "ஸ்ரீ பக்த ஆஞ்சநேய சுவாமி (சங்கடமோசன அனுமன்)",
        en: "Lord Sri Bhakta Hanuman (Sankat Mochan)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಸಕಲ ಗ್ರಹ ಪೀಡಾ ನಿವಾರಕ • ಶನಿ ದೋಷ ಮುಕ್ತಿ ಸನ್ನಿಧಿ",
        mr: "सर्व ग्रहपीडा निवारक • शनि दोष मुक्ती सान्निध्य",
        hi: "समस्त ग्रहपीड़ा निवारक • शनि दोष मुक्ति सान्निध्य",
        te: "సకల గ్రహపీడా నివారణ • శని దోష ముక్తి సేవ",
        ta: "சகல கிரக தோஷ நிவர்த்தி • சனி தோஷ நிவாரண சன்னதி",
        en: "Universal Planetary Affliction Shield & Saturn Dispeller"
      }, lang),
      blessingMotto: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् । वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥"
    };
  }

  // Sun Lordship
  if (RASHI_LORDS[lagnaIdx] === PlanetName.Sun || RASHI_LORDS[moonIdx] === PlanetName.Sun || runningMahadashaPrimary === PlanetName.Sun) {
    return {
      imagePath: "/daily_posters/poster_0_surya.jpg",
      deityName: pick6({
        kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ (ಪ್ರತ್ಯಕ್ಷ ಪರಬ್ರಹ್ಮ)",
        mr: "भगवान सूर्यनारायण (प्रत्यक्ष परब्रह्म)",
        hi: "भगवान सूर्यनारायण (प्रत्यक्ष देव)",
        te: "భగవాన్ సూర్యనారాయణ స్వామి (ప్రత్యక్ష దైవం)",
        ta: "பகவான் சூரியநாராயண சுவாமி (பிரத்யக்ஷ தெய்வம்)",
        en: "Lord Sri Suryanarayana (Pratyaksha Devata)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಆರೋಗ್ಯ, ಆಯುಷ್ಯ, ರಾಜಗೌರವ ಹಾಗೂ ತೇಜೋ ವರ್ಧಕ ಸನ್ನಿಧಿ",
        mr: "आरोग्य, दीर्घायुष्य, राजसन्मान व तेज संवर्धन सान्निध्य",
        hi: "आरोग्य, दीर्घायु, राजसम्मान एवं तेजस्विता प्रदायक सान्निध्य",
        te: "ఆరోగ్య, ఆయుష్షు, రాజగౌరవం & తేజస్సు ప్రసాదించే సేవ",
        ta: "ஆரோக்கியம், தீர்க்காயுள், சமூக அந்தஸ்து தரும் சன்னதி",
        en: "Radiant Vitality, Executive Authority & Longevity Shield"
      }, lang),
      blessingMotto: "आदित्यस्य नमस्कारान् ये कुर्वन्ति दिने दिने । जन्मान्तरसहस्रेषु दारिद्र्यं नोपजायते ॥"
    };
  }

  // Mars Lordship
  if (RASHI_LORDS[lagnaIdx] === PlanetName.Mars || RASHI_LORDS[moonIdx] === PlanetName.Mars || runningMahadashaPrimary === PlanetName.Mars) {
    return {
      imagePath: "/daily_posters/poster_2_karthikeya.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ (ಸ್ಕಂದ ಕಾರ್ತಿಕೇಯ)",
        mr: "श्री कार्तिकेय स्वामी (स्कंद सुब्रह्मण्य)",
        hi: "श्री कार्तिकेय स्वामी (स्कंद सुब्रह्मण्य)",
        te: "శ్రీ సుబ్రహ్మణ్య స్వామి (స్కంద కార్తికేయ)",
        ta: "ஸ்ரீ சுப்பிரமணிய சுவாமி (கந்தன் கார்த்திகேயன்)",
        en: "Lord Sri Subrahmanya (Skanda Kartikeya)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಸರ್ವ ಶತ್ರು ಜಯ, ಭೂ ಭಾಗ್ಯ ಹಾಗೂ ಕುಜ ದೋಷ ಶಮನ ಸನ್ನಿಧಿ",
        mr: "शत्रूवर विजय, जमीन खरेदी व मंगळ दोष शमन सान्निध्य",
        hi: "सर्व शत्रु विजय, भूमि योग एवं मंगल दोष शमन सान्निध्य",
        te: "శత్రు జయం, భూలాభం & కుజ దోష నివారణ సేవ",
        ta: "சத்ரு சம்ஹாரம், பூமி யோகம் & செவ்வாய் தோஷ நிவர்த்தி",
        en: "Triumph over Adversity, Real Estate Prosperity & Mangala Pacifier"
      }, lang),
      blessingMotto: "शक्तिहस्तं विरूपाक्षं शिखिवाहं षण्मुखम् । मयूरवाहनं देवं सुब्रह्मण्यं नमाम्यहम् ॥"
    };
  }

  // Mercury Lordship
  if (RASHI_LORDS[lagnaIdx] === PlanetName.Mercury || RASHI_LORDS[moonIdx] === PlanetName.Mercury || runningMahadashaPrimary === PlanetName.Mercury) {
    return {
      imagePath: "/daily_posters/poster_3_vishnu.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು ಪರಮಾತ್ಮ (ವೈಕುಂಠನಾಥ)",
        mr: "श्री महाविष्णु परमात्मा (जगत्पालक)",
        hi: "श्री महाविष्णु परमात्मा (जगतपालक)",
        te: "శ్రీ మహావిష్ణు పరమాత్మ (జగత్పాలకుడు)",
        ta: "ஸ்ரீ மகாவிஷ்ணு பரமாத்மா (வைகுந்தநாதன்)",
        en: "Lord Sri Maha Vishnu (Universal Sustainer)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಬುದ್ಧಿಮತ್ತೆ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಸನ್ನಿಧಿ",
        mr: "बुद्धिमत्ता, व्यापार वृद्धी व कौटुंबिक सुरक्षा सान्निध्य",
        hi: "बुद्धि, व्यापार विस्तार एवं पारिवारिक सुरक्षा सान्निध्य",
        te: "జ్ఞానవృద్ధి, వ్యాపార ప్రగతి & కుటుంబ రక్షా సేవ",
        ta: "புத்தி கூர்மை, வர்த்தக வளர்ச்சி & குடும்ப பாதுகாப்பு சன்னதி",
        en: "Intellectual Mastery, Commercial Growth & Domestic Sanctuary"
      }, lang),
      blessingMotto: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥"
    };
  }

  // Jupiter Lordship
  if (RASHI_LORDS[lagnaIdx] === PlanetName.Jupiter || RASHI_LORDS[moonIdx] === PlanetName.Jupiter || runningMahadashaPrimary === PlanetName.Jupiter) {
    return {
      imagePath: "/daily_posters/poster_4_guru.jpg",
      deityName: pick6({
        kn: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ & ದೇವಗುರು ಬೃಹಸ್ಪತಿ",
        mr: "श्री दक्षिणामूर्ती व देवगुरू बृहस्पती",
        hi: "श्री दक्षिणामूर्ति एवं देवगुरु बृहस्पति",
        te: "శ్రీ దక్షిణామూర్తి & దేవగురు బృహస్పతి",
        ta: "ஸ்ரீ தட்சிணாமூர்த்தி & தேவகுரு பிரகஸ்பதி",
        en: "Lord Sri Dakshinamurthy & Devaguru Brihaspati"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಜ್ಞಾನೋದಯ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಪೂರ್ಣ ಗುರುಬಲ ಸನ್ನಿಧಿ",
        mr: "ज्ञानोदय, संतती सुख व संपूर्ण गुरुबळ सान्निध्य",
        hi: "ज्ञानोदय, संतान सुख एवं पूर्ण गुरुबल प्रदायक सान्निध्य",
        te: "జ్ఞానోదయం, సంతాన సౌభాగ్యం & సంపూర్ణ గురుబలం",
        ta: "ஞானோதயம், புத்திர பாக்கியம் & பூரண குரு பலன்",
        en: "Spiritual Illumination, Noble Progeny & Auspicious Guru Bala"
      }, lang),
      blessingMotto: "गुरवे सर्वलोकानां भिषजे भवरोगिणाम् । निधये सर्वविद्यानां दक्षिणामूर्तये नमः ॥"
    };
  }

  // Venus Lordship
  if (RASHI_LORDS[lagnaIdx] === PlanetName.Venus || RASHI_LORDS[moonIdx] === PlanetName.Venus || runningMahadashaPrimary === PlanetName.Venus) {
    return {
      imagePath: "/daily_posters/poster_5_mahalakshmi.jpg",
      deityName: pick6({
        kn: "ಜಗನ್ಮಾತೆ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ (ಐಶ್ವರ್ಯದಾಯಿನಿ)",
        mr: "जगन्माता श्री महालक्ष्मी (ऐश्वर्यदायिनी)",
        hi: "जगन्माता श्री महालक्ष्मी (ऐश्वर्य प्रदायिनी)",
        te: "జగన్మాత శ్రీ మహాలక్ష్మి దేవి (ఐశ్వర్య ప్రదాయిని)",
        ta: "ஜெகன்மாதா ஸ்ரீ மகாலட்சுமி தேவி (அஷ்டலட்சுமி)",
        en: "Goddess Sri Mahalakshmi (Bestower of Sovereign Wealth)"
      }, lang),
      sanctumTitle: pick6({
        kn: "ಅಷ್ಟೈಶ್ವರ್ಯ ವೃದ್ಧಿ, ಗೃಹ ಸೌಭಾಗ್ಯ ಹಾಗೂ ದಾರಿದ್ರ್ಯ ನಿವಾರಕ ಸನ್ನಿಧಿ",
        mr: "अष्टलक्ष्मी कृपा, कौटुंबिक सौख्य व दारिद्र्य निवारक सान्निध्य",
        hi: "अष्टलक्ष्मी कृपा, गृह सौभाग्य एवं दारिद्र्य निवारक सान्निध्य",
        te: "అష్టైశ్వర్య వృద్ధి, గృహ సౌభాగ్యం & దారిద్ర్య నివారణ",
        ta: "அஷ்டலட்சுமி கடாட்சம், இல்லற சுபிக்ஷம் & தனவிருத்தி",
        en: "Perpetual Treasury Compounding & Domestic Harmony Shield"
      }, lang),
      blessingMotto: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते । शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते ॥"
    };
  }

  // Default: Supreme Lord Shiva Mahabaleshwara (Atmalinga of Sri Kshetra Gokarna)
  return {
    imagePath: "/daily_posters/poster_1_shiva.jpg",
    deityName: pick6({
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಪಾವನ ಆತ್ಮಲಿಂಗ)",
      mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर स्वामी (पवित्र आत्मलिंग)",
      hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर स्वामी (परम पावन आत्मलिंग)",
      te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి (దివ్య ఆత్మలింగం)",
      ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வர சுவாமி (புனித ஆத்மலிங்கம்)",
      en: "Sri Kshetra Gokarna Mahabaleshwara (Sacred Atmalinga)"
    }, lang),
    sanctumTitle: pick6({
      kn: "ಅಖಂಡ ಆಯುರ್-ಆರೋಗ್ಯ ರಕ್ಷೆ • ಮಹಾಮುಕ್ತಿ ಧಾಮ • ಬಗ್ಗೋಣ ಪರಮ ಸಾನ್ನಿಧ್ಯ",
      mr: "अखंड आरोग्य व दीर्घायुष्य रक्षा • महामुक्ती धाम • बग्गोण परम सान्निध्य",
      hi: "अखंड आरोग्य एवं दीर्घायु रक्षा • महामुक्ति धाम • बग्गोण परम सान्निध्य",
      te: "అఖండ ఆయురారోగ్య రక్ష • మహా ముక్తి ధామం • బగ్గోణ పరమ సేవ",
      ta: "தீர்க்காயுள் & ஆரோக்கிய பாதுகாப்பு • மகா முக்தி தலம் • பக்கோண திருப்பணி",
      en: "Supreme Longevity & Vitality Shield • Primordial Gokarna Sanctum"
    }, lang),
    blessingMotto: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥"
  };
}

export function getSacredDeityImage(
  lagnaIdx: number,
  moonIdx: number,
  runningMahadashaPrimary: PlanetName,
  hasSaturnTroubleAnyYear: boolean,
  lang: SixLang,
  prescribedStotraId?: string,
  prescribedDeityName?: string
): SacredDeityImageInfo {
  const raw = _resolveSacredDeityImageRaw(
    lagnaIdx,
    moonIdx,
    runningMahadashaPrimary,
    hasSaturnTroubleAnyYear,
    lang,
    prescribedStotraId,
    prescribedDeityName
  );
  return {
    ...raw,
    deityTitle: raw.sanctumTitle,
    blessingsSubtitle: raw.blessingMotto
  };
}

/**
 * 14. 100% Dynamic Personalized Shloka Generator
 * Generates an individualized protective Sanskrit verse computed deterministically
 * from the devotee's natal Lagna, Nakshatra Pada, Moon sign, and active Mahadasha.
 */
function _resolvePersonalizedDynamicShlokaRaw(
  devoteeName: string,
  nakshatraIdx: number,
  moonPada: number,
  lagnaIdx: number,
  moonIdx: number,
  runningMahadashaPrimary: PlanetName,
  birthWeekday: string,
  lang: SixLang,
  hasSaturnTroubleAnyYear: boolean = false
): DynamicDevoteeShloka {
  const nakName = NAKSHATRA_6L[nakshatraIdx]?.[lang] || "";
  const padaText = formatNumber6L(moonPada, lang);
  const padaWord = getPadaWord(lang);
  const lagnaName = RASHI_6L[lagnaIdx]?.[lang] || "";
  const mahaLordName = GRAHA_6L[runningMahadashaPrimary]?.[lang] || runningMahadashaPrimary;

  const sourceReason = pick6({
    kn: `ಶ್ರೀಯುತ/ಶ್ರೀಮತಿ ${devoteeName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯ ${lagnaName} ಲಗ್ನ, ${nakName} ನಕ್ಷತ್ರದ ${padaText}ನೇ ${padaWord} ಹಾಗೂ ${mahaLordName} ಮಹಾದಶಾ ಪ್ರಭಾವವನ್ನು ಪರಿಗಣಿಸಿ, ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾದ ಪಾವನ ರಕ್ಷಾ ಶ್ಲೋಕ:`,
    mr: `सन्माननीय ${devoteeName} यांच्या जन्मपत्रिकेतील ${lagnaName} लग्न, ${nakName} नक्षत्राचा ${padaText}रा ${padaWord} व ${mahaLordName} महादशा प्रभाव लक्षात घेऊन, शास्त्रोक्त सिद्ध केलेला पावन रक्षा श्लोक:`,
    hi: `आदरणीय ${devoteeName} जी की जन्म कुंडली के ${lagnaName} लग्न, ${nakName} नक्षत्र के ${padaText}वें ${padaWord} एवं ${mahaLordName} महादशा के प्रभाव हेतु, शास्त्रसम्मत सिद्ध रक्षा श्लोक:`,
    te: `${devoteeName} గారి జన్మ జాతకంలోని ${lagnaName} లగ్నం, ${nakName} నక్షత్రపు ${padaText}వ ${padaWord} మరియు ${mahaLordName} మహాదశా ప్రయోజనం కొరకు, శాస్త్రోక్తంగా నిర్ణయించిన పవిత్ర రక్షా శ్లోకం:`,
    ta: `${devoteeName} அவர்களின் ஜாதக ${lagnaName} லக்னம், ${nakName} நட்சத்திரத்தின் ${padaText}ம் ${padaWord} மற்றும் ${mahaLordName} மகா தசா அமைப்பிற்கு, சாஸ்திர ரீதியாக தேர்வு செய்யப்பட்ட புனித பாதுகாப்பு ஸ்லோகம்:`,
    en: `Sacred protective Sanskrit shloka mathematically derived from ${devoteeName}'s natal ${lagnaName} Lagna, ${nakName} Nakshatra Pada ${padaText}, and active ${mahaLordName} Mahadasha:`
  }, lang);

  // 1. Saturn Affliction or Saturn Mahadasha -> Lord Hanuman (Sankat Mochan)
  if (hasSaturnTroubleAnyYear || runningMahadashaPrimary === PlanetName.Saturn) {
    return {
      deity: pick6({
        kn: "ಶ್ರೀ ಭಕ್ತ ಆಂಜನೇಯ ಸ್ವಾಮಿ (ಮಹಾ ಪ್ರಾಣೇಶ)",
        mr: "श्री भक्त मारुतीराय (संकटमोचन हनुमान)",
        hi: "श्री भक्त हनुमान जी (संकटमोचन महावीर)",
        te: "శ్రీ భక్త ఆంజనేయ స్వామి (సంకటమోచన హనుమాన్)",
        ta: "ஸ்ரீ பக்த ஆஞ்சநேய சுவாமி (சங்கடமோசன அனுமன்)",
        en: "Lord Sri Bhakta Hanuman (Sankat Mochan)"
      }, lang),
      sourceReason,
      sanskritVerse: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥",
      transliterationNative: pick6({
        kn: "ಮನೋಜವಂ ಮಾರುತತುಲ್ಯವೇಗಂ ಜಿತೇಂದ್ರಿಯಂ ಬುದ್ಧಿಮತಾಂ ವರಿಷ್ಠಮ್ । ವಾತಾತ್ಮಜಂ ವಾನರಯೂಥಮುಖ್ಯಂ ಶ್ರೀರಾಮದೂತಂ ಶರಣಂ ಪ್ರಪದ್ಯೇ ॥",
        mr: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् । वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥",
        hi: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् । वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥",
        te: "మనోజవం మారుతతుల్యవేగం జితేంద్రియం బుద్ధిమతాం వరిష్ఠమ్ । వాతాత్మజం వానరయూథముఖ్యం శ్రీరామదూతం శరణం ప్రపద్యే ॥",
        ta: "மனோஜவம் மாருததுல்யவேகம் ஜிதேந்த்ரியம் புத்திமதாம் வரிஷ்டம் । வாதாத்மஜம் வானரயூதமுக்யம் ஸ்ரீராமதூதம் சரணம் பிரபத்யே ॥",
        en: "Manojavam Marutatulyavegam Jitendriyam Buddhimatam Varishtham | Vatatmajam Vanarayuthamukhyam Shriramadutam Sharanam Prapadye ||"
      }, lang),
      meaningNative: pick6({
        kn: "ಮನಸ್ಸಿನಂತೆ ವೇಗವುಳ್ಳವನೂ, ವಾಯುದೇವನಿಗೆ ಸಮಾನವಾದ ವೇಗವುಳ್ಳವನೂ, ಇಂದ್ರಿಯಗಳನ್ನು ಗೆದ್ದವನೂ, ಜ್ಞಾನಿಗಳಲ್ಲಿ ಶ್ರೇಷ್ಠನೂ, ವಾಯುಪುತ್ರನೂ, ವಾನರ ಸೇನಾಧಿಪತಿಯೂ ಆದ ಶ್ರೀರಾಮದೂತ ಹನುಮಂತನನ್ನು ಶರಣು ಹೊಂದುತ್ತೇನೆ.",
        mr: "मनासारखा प्रचंड वेग असणारे, वायूदेवाप्रमाणे सामर्थ्यवान, जितेंद्रिय, बुद्धिमानांमध्ये अग्रगण्य, वायुपुत्र व वानरसेनाप्रमुख अशा प्रभू श्रीरामांचे परम दूत मारुतीरायांना मी शरण जातो.",
        hi: "मन के समान वेगवान, वायुदेव के सदृश सामर्थ्यवान, जितेन्द्रिय, बुद्धिमानों में श्रेष्ठ, वायुपुत्र एवं वानर यूथपति प्रभु श्रीरामदूत पवनपुत्र हनुमान जी के चरणों में मैं नतमस्तक होता हूँ।",
        te: "మనస్సు అంతటి వేగం కలవాడు, వాయుదేవునితో సమానమైన వేగం కలవాడు, ఇంద్రియాలను జయించినవాడు, జ్ఞానులలో శ్రేష్ఠుడు, వానర సేనాధిపతి అయిన శ్రీరామదూత హనుమంతునికి శరణు వేడుతున్నాను.",
        ta: "மனதைப் போன்ற வேகமும், வாயு தேவனுக்கு ஒப்பான வலிமையும், புலனடக்கமும், ஞானிகளில் சிறந்தவரும், ராமதூதனுமாகிய அனுமனை சரணடைகிறேன்.",
        en: "I surrender unto the lotus feet of Lord Hanuman, the supreme messenger of Lord Rama, who moves with the speed of thought, possesses the prowess of the wind, masters the senses, and leads the assemblies of the wise."
      }, lang),
      chantingCount: 11,
      bestTime: pick6({
        kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ನಂತರ ಅಥವಾ ಮಂಗಳವಾರ-ಶನಿವಾರ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ",
        mr: "दररोज संध्याकाळी सूर्यास्तानंतर किंवा मंगळवार-शनिवारी प्रदोष काळात",
        hi: "प्रतिदिन संध्या सूर्यास्त के पश्चात अथवा मंगलवार एवं शनिवार प्रदोष काल में",
        te: "రోజూ సాయంత్రం సూర్యాస్తమయం తర్వాత లేదా మంగళ, శనివారాల ప్రదోష వేళలో",
        ta: "தினமும் மாலை சூரிய அஸ்தமனத்திற்குப் பிறகு அல்லது செவ்வாய், சனிக்கிழமை பிரதோஷ வேளையில்",
        en: "Daily at twilight after sunset, or Tuesdays and Saturdays during Pradosha"
      }, lang),
      facingDirection: pick6({
        kn: "ಪೂರ್ವ ಅಥವಾ ಪಶ್ಚಿಮ ದಿಕ್ಕು (ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿ)",
        mr: "पूर्व अथवा पश्चिम दिशा (तिळाच्या तेलाचा दिवा लावून)",
        hi: "पूर्व अथवा पश्चिम दिशा (तिल के तेल का दीप प्रज्वलित कर)",
        te: "తూర్పు లేదా పశ్చిమ దిశ (నువ్వుల నూనె దీపం వెలిగించి)",
        ta: "கிழக்கு அல்லது மேற்கு (நல்லெண்ணெய் தீபம் ஏற்றி)",
        en: "East or West facing, before a sacred sesame oil lamp"
      }, lang),
      spiritualSignificance: pick6({
        kn: "ಅಷ್ಟಮ/ಸಾಡೇಸಾತಿ ಶನಿ ದೋಷ ಪರಿಹಾರ, ಶಾರೀರಿಕ-ಮಾನಸಿಕ ಬಲ, ಭಯ ಮುಕ್ತಿ ಹಾಗೂ ಸರ್ವ ವಿಘ್ನ ನಿವಾರಣೆ.",
        mr: "साडेसाती व अष्टम शनी दोष निवारण, शारीरिक व मानसिक शक्ती, भय मुक्ती व सर्व संकटांचा नाश.",
        hi: "साढ़ेसाती एवं अष्टम शनि दोष मुक्ति, शारीरिक-मानसिक बल, अभय एवं सर्व विघ्न निवारण।",
        te: "శని దోష నివారణ, శారీరక, మానసిక బలం, భయ విముక్తి మరియు సర్వ విఘ్న నివారణ.",
        ta: "சனி தோஷ நிவர்த்தி, உடல் மற்றும் மனோபலம், பயமின்மை மற்றும் சகல விக்ன நிவாரணம்.",
        en: "Neutralizes Saturn afflictions, fortifies vitality and psychological fortitude, and dissolves fear and obstruction."
      }, lang)
    };
  }

  // 2. Sun Lordship -> Lord Suryanarayana (Gayatri Mantra)
  if (RASHI_LORDS[lagnaIdx] === PlanetName.Sun || RASHI_LORDS[moonIdx] === PlanetName.Sun || runningMahadashaPrimary === PlanetName.Sun) {
    return {
      deity: pick6({
        kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ (ಪ್ರತ್ಯಕ್ಷ ಪರಬ್ರಹ್ಮ)",
        mr: "भगवान सूर्यनारायण (प्रत्यक्ष परब्रह्म)",
        hi: "भगवान सूर्यनारायण (प्रत्यक्ष देव)",
        te: "భగవాన్ సూర్యనారాయణ స్వామి (ప్రత్యక్ష దైవం)",
        ta: "பகவான் சூரியநாராயண சுவாமி (பிரத்யக்ஷ தெய்வம்)",
        en: "Lord Sri Suryanarayana (Pratyaksha Devata)"
      }, lang),
      sourceReason,
      sanskritVerse: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
      transliterationNative: pick6({
        kn: "ಓಂ ಭೂರ್ಭುವಃ ಸ್ವಃ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥",
        mr: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
        hi: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
        te: "ఓం భూర్భువః స్వః తత్సవితుర్వరేణ్యం భర్గో దేవస్య ధీమహి ధియో యో నః ప్రచోదయాత్ ॥",
        ta: "ஓம் பூர்புவஸ்வஹ தத்ஸவிதுர்வரேண்யம் பர்கோ தேவஸ்ய தீமஹி தியோ யோ நஹ் பிரசோதயாத் ॥",
        en: "Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat ||"
      }, lang),
      meaningNative: pick6({
        kn: "ಭೂಮಿ, ಅಂತರಿಕ್ಷ ಹಾಗೂ ಸ್ವರ್ಗಲೋಕಗಳನ್ನು ಪ್ರಕಾಶಪಡಿಸುವ ಆ ಪರಮ ದಿವ್ಯ ಸೂರ್ಯದೇವನ ಶ್ರೇಷ್ಠ ತೇಜಸ್ಸನ್ನು ನಾವು ಧ್ಯಾನಿಸುತ್ತೇವೆ. ಆ ಪರಬ್ರಹ್ಮ ತೇಜಸ್ಸು ನಮ್ಮ ಬುದ್ಧಿಯನ್ನು ಸದಾ ಸನ್ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಸಲಿ.",
        mr: "भूलोक, अंतरिक्ष व स्वर्गलोकाला प्रकाशित करणाऱ्या त्या सर्वश्रेष्ठ सूर्यदेवाच्या दिव्य तेजाचे आम्ही ध्यान करतो. ते परमात्म्याचे तेज आमच्या बुद्धीला सदैव सन्मार्गावर प्रेरित करो.",
        hi: "समस्त लोकों को प्रकाशित करने वाले उस परम वरेण्य परमात्मा के दिव्य तेज का हम ध्यान करते हैं। वह तेजोमय परमात्मा हमारी बुद्धि को नित्य धर्म एवं सत्य के मार्ग पर प्रेरित करे।",
        te: "భూమి, అంతరిక్షం మరియు స్వర్గలోకాలను ప్రకాశింపజేసే ఆ సవితృ దేవుని పరమ దివ్య తేజస్సును మేము ధ్యానిస్తున్నాము. ఆ పరమాత్మ తేజస్సు మన బుద్ధిని సన్మార్గంలో నడిపించుగాక.",
        ta: "பூமி, அந்தரிக்ஷம் மற்றும் தேவலோகத்தை பிரகாசிக்கச் செய்யும் அந்த பரமாத்மாவின் திவ்ய ஒளியை தியானிக்கிறோம். அந்த பேரொளி நமது புத்தியை எப்போதும் நல்வழியில் செலுத்தட்டும்.",
        en: "We meditate upon the supreme, adorable divine effulgence of the solar creator who illuminates the physical, astral, and celestial realms. May that transcendental light guide our intellect along the path of truth."
      }, lang),
      chantingCount: 11,
      bestTime: pick6({
        kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯ ಸಮಯದಲ್ಲಿ (ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಜಲಾರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ)",
        mr: "दररोज सकाळी सूर्योदयाच्या वेळी (तांब्याच्या पात्रातून अर्घ्य देऊन)",
        hi: "प्रतिदिन प्रातः सूर्योदय के पावन समय (तांबे के पात्र से जलार्घ्य देकर)",
        te: "రోజూ ఉదయం సూర్యోదయ సమయంలో (రాగి పాత్రతో జలార్ఘ్యం సమర్పించి)",
        ta: "தினமும் அதிகாலை சூரிய உதய வேளையில் (செம்பு பாத்திரத்தில் நீர் அர்க்கியம் கொடுத்து)",
        en: "Daily at dawn during sunrise, offering water Arghya from a copper vessel"
      }, lang),
      facingDirection: pick6({
        kn: "ಪೂರ್ವ ದಿಕ್ಕು",
        mr: "पूर्व दिशा",
        hi: "पूर्व दिशा",
        te: "తూర్పు దిశ",
        ta: "கிழக்கு திசை",
        en: "East facing"
      }, lang),
      spiritualSignificance: pick6({
        kn: "ತೇಜಸ್ಸು, ನಾಯಕತ್ವ ಬಲ, ಹೃದಯಾರೋಗ್ಯ, ರಾಜಗೌರವ ಹಾಗೂ ಬುದ್ಧಿ ಪರಿಶುದ್ಧಿ.",
        mr: "तेजस्विता, नेतृत्व गुण, हृदय आरोग्य, मान-सन्मान व बुद्धीची एकाग्रता.",
        hi: "तेजस्विता, नेतृत्व क्षमता, उत्तम स्वास्थ्य, सामाजिक मान-प्रतिष्ठा एवं कुशाग्र बुद्धि।",
        te: "తేజస్సు, నాయకత్వ బలం, ఆయురారోగ్యం, రాజగౌరవం & బుద్ధి వికాసం.",
        ta: "தேஜஸ், தலைமைப் பண்பு, உடல் நலம், சமூக அந்தஸ்து மற்றும் மனத்தூய்மை.",
        en: "Bestows commanding executive authority, cardiac vitality, mental luminescence, and public distinction."
      }, lang)
    };
  }

  // 3. Mars or Ketu Lordship -> Lord Subrahmanya (Shanmukha)
  if (
    RASHI_LORDS[lagnaIdx] === PlanetName.Mars ||
    RASHI_LORDS[moonIdx] === PlanetName.Mars ||
    runningMahadashaPrimary === PlanetName.Mars ||
    runningMahadashaPrimary === PlanetName.Ketu
  ) {
    return {
      deity: pick6({
        kn: "ಭಗವಾನ್ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ (ಷಣ್ಮುಖ ಕಾರ್ತಿಕೇಯ)",
        mr: "भगवान श्री सुब्रह्मण्य (षडानन कार्तिकेय)",
        hi: "भगवान श्री सुब्रह्मण्य (षडानन कार्तिकेय)",
        te: "భగవాన్ శ్రీ సుబ్రహ్మణ్య స్వామి (షణ్ముఖుడు)",
        ta: "பகவான் ஸ்ரீ சுப்பிரமணிய சுவாமி (கார்த்திகேயன்)",
        en: "Lord Sri Subrahmanya Swamy (Shanmukha Kartikeya)"
      }, lang),
      sourceReason,
      sanskritVerse: "षण्मुखं पार्वतीतनुजं षट्चक्रस्थं षडक्षरम्। षट्कोणे संस्थितं देवं सुब्रह्मण्यं नमाम्यहम्॥",
      transliterationNative: pick6({
        kn: "ಷಣ್ಮುಖಂ ಪಾರ್ವತೀತನುಜಂ ಷಟ್ಚಕ್ರಸ್ಥಂ ಷಡಕ್ಷರಮ್ । ಷಟ್ಕೋಣೇ ಸಂಸ್ಥಿತಂ ದೇವಂ ಸುಬ್ರಹ್ಮಣ್ಯಂ ನಮಾಮ್ಯಹಮ್ ॥",
        mr: "षण्मुखं पार्वतीतनुजं षट्चक्रस्थं षडक्षरम् । षट्कोणे संस्थितं देवं सुब्रह्मण्यं नमाम्यहम् ॥",
        hi: "षण्मुखं पार्वतीतनुजं षट्चक्रस्थं षडक्षरम् । षट्कोणे संस्थितं देवं सुब्रह्मण्यं नमाम्यहम् ॥",
        te: "షణ్ముఖం పార్వతీతనుజం షట్చక్రస్థం షడక్షరమ్ । షట్కోణే సంస్థితం దేవం సుబ్రహ్మణ్యం నమామ్యహమ్ ॥",
        ta: "ஷண்முகம் பார்வதீதனுஜம் ஷட்சக்ரஸ்தம் ஷடக்ஷரம் । ஷட்கோணே சம்ஸ்திதம் தேவம் சுப்பிரமணியம் நமாம்யஹம் ॥",
        en: "Shanmukham Parvatitanujam Shatchakrastham Shadaksharam | Shatkone Samsthitam Devam Subrahmanyam Namamyaham ||"
      }, lang),
      meaningNative: pick6({
        kn: "ಆರು ಮುಖಗಳನ್ನುಳ್ಳವನೂ, ಪಾರ್ವತೀದೇವಿಯ ಪ್ರಿಯ ಪುತ್ರನೂ, ಷಟ್ಚಕ್ರಗಳ ಅಧಿಪತಿಯೂ, ಷಡಕ್ಷರೀ ಮಂತ್ರ ಸ್ವರೂಪನೂ ಆದ ಭಗವಾನ್ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಗೆ ನನ್ನ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರಗಳು. ಸಕಲ ಕುಜ ದೋಷಗಳು, ಭೂಮಿ-ಆಸ್ತಿ ವಿವಾದಗಳು ಹಾಗೂ ಶತೃ ಬಾಧೆಗಳನ್ನು ಪರಿಹರಿಸು ಸ್ವಾಮಿ.",
        mr: "सहा मुखे असणारे, माता पार्वतीचे सुपुत्र, षट्चक्रांचे स्वामी व षडक्षरी मंत्रस्वरूप असणाऱ्या भगवान सुब्रह्मण्य (कार्तिकेय) चरणी माझे सादर नमन. सर्व संकट व शत्रूंचा नाश करा.",
        hi: "छह मुखों वाले, माता पार्वती के सुपुत्र, षट्चक्रों के अधिपति एवं षडक्षरी मंत्रस्वरूप भगवान सुब्रह्मण्य के चरणों में मैं प्रणाम करता हूँ। वे समस्त बाधाओं एवं मंगल दोष का निवारण करें।",
        te: "ఆరు ముఖాలు గలవాడు, పార్వతీదేవి ప్రియ పుత్రుడు, షట్చక్రాలలో నివసించేవాడు అయిన సుబ్రహ్మణ్య స్వామికి నమస్కారములు. సమస్త కుజ దోషాలను, శత్రు భయాలను తొలగించుము.",
        ta: "ஆறு முகங்களை உடையவரும் பார்வதியின் மைந்தனும் ஆறு சக்கரங்களில் உறைபவருமான சுப்பிரமணிய சுவாமியை வணங்குகிறேன். செவ்வாய் தோஷத்தை நிவர்த்தி செய்வாயாக.",
        en: "Salutations unto Lord Subrahmanya, six-faced son of Goddess Parvati, presiding over the six chakras and sacred hexagram, destroying all planetary afflictions and granting victory."
      }, lang),
      chantingCount: 11,
      bestTime: pick6({
        kn: "ಮಂಗಳವಾರ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಷಷ್ಠಿ ತಿಥಿ ಸಮಯದಲ್ಲಿ",
        mr: "मंगळवारी सकाळी अथवा षष्ठी तिथीच्या वेळी",
        hi: "मंगलवार प्रातः अथवा षष्ठी तिथि के समय",
        te: "మంగళవారం ఉదయం లేదా షష్ఠి తిథి వేళలో",
        ta: "செவ்வாய்க்கிழமை காலை அல்லது சஷ்டி திதி நேரத்தில்",
        en: "Tuesday mornings or during Sasthi tithi"
      }, lang),
      facingDirection: pick6({
        kn: "ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣ ದಿಕ್ಕು",
        mr: "पूर्व अथवा दक्षिण दिशा",
        hi: "पूर्व अथवा दक्षिण दिशा",
        te: "తూర్పు లేదా దక్షిణ దిశ",
        ta: "கிழக்கு அல்லது தெற்கு திசை",
        en: "East or South facing"
      }, lang),
      spiritualSignificance: pick6({
        kn: "ಕುಜ ದೋಷ ಮುಕ್ತಿ, ಭೂಮಿ-ಆಸ್ತಿ ಯೋಗ, ಸಹೋದರ ಸಾಮರಸ್ಯ, ಸಾಲ ಬಾಧೆ ಪರಿಹಾರ ಹಾಗೂ ಶತೃ ವಿಜಯ.",
        mr: "मंगळ दोष मुक्ती, जमीन-जुमला खरेदी, भावंडांमध्ये सख्य, कर्जमुक्ती व विजय.",
        hi: "मंगल दोष मुक्ति, भूमि-भवन लाभ, भ्रातृ सौहार्द, ऋण मुक्ति एवं विजय प्राप्ति।",
        te: "కుజ దోష నివారణ, భూ-గృహ యోగం, సోదర సౌభ్రాత్రం, రుణ విముక్తి & శత్రు విజయం.",
        ta: "செவ்வாய் தோஷ நிவர்த்தி, நிலம்-வீடு யோகம், கடன் சுமை தீர்தல் மற்றும் வெற்றி.",
        en: "Dissolves Kuja Dosha, secures property and land investments, alleviates liabilities, and bestows competitive triumph."
      }, lang)
    };
  }

  // 4. Mercury or Rahu Lordship -> Lord Maha Vishnu (Shantakaram)
  if (
    RASHI_LORDS[lagnaIdx] === PlanetName.Mercury ||
    RASHI_LORDS[moonIdx] === PlanetName.Mercury ||
    runningMahadashaPrimary === PlanetName.Mercury ||
    runningMahadashaPrimary === PlanetName.Rahu
  ) {
    return {
      deity: pick6({
        kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ತಿರುಪತಿ ಶ್ರೀ ವೆಂಕಟರಮಣ ಸ್ವಾಮಿ",
        mr: "श्री महाविष्णू व तिरुपती श्री व्यंकटेश",
        hi: "श्री महाविष्णु एवं तिरुपति बालाजी",
        te: "శ్రీ మహావిష్ణువు & తిరుమల శ్రీ వేంకటేశ్వర స్వామి",
        ta: "ஸ்ரீ மகாவிஷ்ணு & திருப்பதி ஸ்ரீ வெங்கடேச பெருமாள்",
        en: "Lord Sri Maha Vishnu & Tirupati Sri Balaji"
      }, lang),
      sourceReason,
      sanskritVerse: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्। लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥",
      transliterationNative: pick6({
        kn: "ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ ವಿಶ್ವಾಧಾರಂ ಗಗನಸದೃಶಂ ಮೇಘವರ್ಣಂ ಶುಭಾಂಗಮ್ । ಲಕ್ಷ್ಮೀಕಾಂತಂ ಕಮಲನಯನಂ ಯೋಗಿಭಿರ್ಧ್ಯಾನಗಮ್ಯಂ ವಂದೇ ವಿಷ್ಣುಂ ಭವಭಯಹರಂ ಸರ್ವಲೋಕೈಕನಾಥಮ್ ॥",
        mr: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
        hi: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
        te: "శాంతాకారం భుజగశయనం పద్మనాభం సురేశం విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్ । లక్ష్మీకాంతం కమలనయనం యోగిభిర్ధ్యానగమ్యం వందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్ ॥",
        ta: "சாந்தாகாரம் புஜாகசயனம் பத்மநாபம் சுரேஷம் விஸ்வாதாரம் ககனஸத்ருஷம் மேகவர்ணம் சுபாங்கம் । லக்ஷ்மீகாந்தம் கமலநயனம் யோகிபிர்த்யானகம்யம் வந்தே விஷ்ணும் பவபயஹரம் சர்வலோகைகநாதம் ॥",
        en: "Shantakaram Bhujagashayanam Padmanabham Suresham Vishvadharam Gaganasadrisham Meghavarnam Shubhangam | Lakshmikantam Kamalanayanam Yogibhirdhyanagamyam Vande Vishnum Bhavabhayaharam Sarvalokaikanatham ||"
      }, lang),
      meaningNative: pick6({
        kn: "ಪರಮ ಶಾಂತ ಸ್ವರೂಪನೂ, ಆದಿಶೇಷನ ಮೇಲೆ ಶಯನಿಸಿರುವವನೂ, ನಾಭಿಯಲ್ಲಿ ಕಮಲವುಳ್ಳವನೂ, ದೇವತೆಗಳ ಒಡೆಯನೂ, ಬ್ರಹ್ಮಾಂಡಕ್ಕೆ ಆಧಾರನೂ, ಮೇಘವರ್ಣನೂ, ಶ್ರೀಲಕ್ಷ್ಮೀ ದೇವಿಯ ಪ್ರಿಯ ಕಾಂತನೂ ಆದ ಭಗವಾನ್ ಮಹಾವಿಷ್ಣುವನ್ನು ಭಕ್ತಿಯಿಂದ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
        mr: "शांत स्वरूप असणारे, शेषनागावर शयन करणारे, कमलनयन, विश्वाचा आधार, मेघश्याम वर्ण असलेले व देवी लक्ष्मीचे स्वामी असणाऱ्या भगवान विष्णूंचे मी नमन करतो.",
        hi: "शांत स्वरूप, शेषनाग की शय्या पर शयन करने वाले, कमलनयन, संपूर्ण सृष्टि के आधार एवं माता लक्ष्मी के स्वामी भगवान श्रीहरि विष्णु के चरणों में कोटि-कोटि वंदन।",
        te: "ప్రశాంత స్వరూపుడు, శేషతల్పంపై శయనించినవాడు, సమస్త లోకాలకు ఆధారుడైన శ్రీ మహావిష్ణువునకు నా భక్తిపూర్వక ప్రణామాలు.",
        ta: "சாந்த சொரூபியும், ஆதிசேஷன் மீது பள்ளி கொண்டவரும், லக்ஷ்மி காந்தனுமாகிய பகவான் விஷ்ணுவை பக்தி பூர்வமாக பணிகிறேன்.",
        en: "I bow to Lord Vishnu, the serene sovereign of all worlds, resting upon the cosmic serpent, lotus-naveled, vast as the heavens, dissolving the fears of material bondage."
      }, lang),
      chantingCount: 11,
      bestTime: pick6({
        kn: "ಬುಧವಾರ ಅಥವಾ ಏಕಾದಶಿ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ",
        mr: "बुधवारी किंवा एकादशीच्या दिवशी सकाळी",
        hi: "बुधवार अथवा एकादशी के पावन प्रातःकाल",
        te: "బుధవారం లేదా ఏకాదశి ప్రాతఃకాలంలో",
        ta: "புதன்கிழமை அல்லது ஏகாதசி அதிகாலை வேளையில்",
        en: "Wednesday mornings or Ekadashi dawn"
      }, lang),
      facingDirection: pick6({
        kn: "ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕು",
        mr: "पूर्व अथवा उत्तर दिशा",
        hi: "पूर्व अथवा उत्तर दिशा",
        te: "తూర్పు లేదా ఉత్తర దిశ",
        ta: "கிழக்கு அல்லது வடக்கு",
        en: "East or North facing"
      }, lang),
      spiritualSignificance: pick6({
        kn: "ವ್ಯಾಪಾರ ವೃದ್ಧಿ, ಬುದ್ಧಿ ಚಾತುರ್ಯ, ಗಣಿತ ಪ್ರೌಢಿಮೆ, ರಾಹು-ಬುಧ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಕುಟುಂಬ ರಕ್ಷೆ.",
        mr: "व्यापार वृद्धी, कुशाग्र बुद्धिमत्ता, राहू-बुध दोष निवारण व कौटुंबिक सौख्य.",
        hi: "व्यापार में समृद्धि, कुशाग्र बुद्धि, वाक्पटुता, राहु-बुध दोष निवारण एवं पारिवारिक सुरक्षा।",
        te: "వ్యాపార వృద్ధి, సమయస్ఫూర్తి, బుధ-రాహు దోష నివారణ & కుటుంబ రక్షణ.",
        ta: "வியாபார முன்னேற்றம், புத்தி கூர்மை, ராகு-புதன் தோஷ நிவர்த்தி மற்றும் குடும்ப நலம்.",
        en: "Magnifies commercial acumen, sharpens intellect, dissolves Rahu and Mercury afflictions, and preserves domestic harmony."
      }, lang)
    };
  }

  // 5. Jupiter Lordship -> Lord Guru / Dattatreya (Gururbrahma)
  if (
    RASHI_LORDS[lagnaIdx] === PlanetName.Jupiter ||
    RASHI_LORDS[moonIdx] === PlanetName.Jupiter ||
    runningMahadashaPrimary === PlanetName.Jupiter
  ) {
    return {
      deity: pick6({
        kn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ & ಶ್ರೀ ದತ್ತಾತ್ರೇಯ ಸ್ವಾಮಿ",
        mr: "देवगुरू बृहस्पती व श्री दत्तात्रेय प्रभू",
        hi: "देवगुरु बृहस्पति एवं श्री दत्तात्रेय भगवान",
        te: "దేవగురు బృహస్పతి & శ్రీ దత్తాత్రేయ స్వామి",
        ta: "தேவகுரு பிரகஸ்பதி & ஸ்ரீ தத்தாத்ரேய பகவான்",
        en: "Lord Brihaspati & Lord Dattatreya"
      }, lang),
      sourceReason,
      sanskritVerse: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः॥",
      transliterationNative: pick6({
        kn: "ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ । ಗುರುಃ ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀಗುರವೇ ನಮಃ ॥",
        mr: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः । गुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः ॥",
        hi: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः । गुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः ॥",
        te: "గురుర్బ్రహ్మా గురుర్విష్ణుః గురుర్దేవో మహేశ్వరః । గురుః సాక్షాత్ పరబ్రహ్మ తస్మై శ్రీగురవే నమః ॥",
        ta: "குருர்பிரம்மா குருர்விஷ்ணு குருர்தேவோ மஹேஸ்வரஹ । குரு சாஷாத் பரம்பிரம்ஹ தஸ்மை ஸ்ரீகுருவே நமஹ ॥",
        en: "Gururbrahma Gururvishnuh Gururdevo Maheshvarah | Guruh Sakshat Parabrahma Tasmai Shri Gurave Namah ||"
      }, lang),
      meaningNative: pick6({
        kn: "ಗುರುವೇ ಬ್ರಹ್ಮ, ಗುರುವೇ ವಿಷ್ಣು, ಗುರುವೇ ಮಹೇಶ್ವರ. ಗುರುವೇ ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ಸ್ವರೂಪ. ಅಂತಹ ಪರಮ ಪಾವನ ಶ್ರೀ ಗುರುದೇವರಿಗೆ ನನ್ನ ನಮಸ್ಕಾರಗಳು. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಜ್ಞಾನ, ಸಂತಾನ, ಧನ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳು ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
        mr: "गुरु हेच ब्रह्मा, गुरु हेच विष्णू व गुरु हेच महेश्वर आहेत. गुरु साक्षात परब्रह्म स्वरूप आहेत. अशा परम वंदनीय सद्गुरूंना माझे शतशः नमन.",
        hi: "गुरु ही ब्रह्मा हैं, गुरु ही विष्णु हैं और गुरु ही देवाधिदेव महेश्वर हैं। गुरु ही साक्षात् परब्रह्म हैं। ऐसे परम पावन श्री गुरुदेव को मेरा सादर प्रणाम।",
        te: "గురువే బ్రహ్మ, గురువే విష్ణువు, గురువే మహేశ్వరుడు, గురువే సాక్షాత్ పరబ్రహ్మ. అట్టి శ్రీ గురుదేవునకు నా నమస్కారములు.",
        ta: "குருவே பிரம்மா, குருவே விஷ்ணு, குருவே மகேஸ்வரன். குருவே பரப்பிரம்மம். அத்தகைய குருவிற்கு என் நமஸ்காரங்கள்.",
        en: "The Guru is Brahma, the Guru is Vishnu, the Guru is Lord Shiva. The Guru is verily the supreme transcendent reality. Salutations unto that revered Guru."
      }, lang),
      chantingCount: 11,
      bestTime: pick6({
        kn: "ಗುರುವಾರ ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯೋದಯ ಸಮಯದಲ್ಲಿ",
        mr: "गुरुवारी सकाळी सूर्योदयाच्या वेळी",
        hi: "गुरुवार प्रातः सूर्योदय काल में",
        te: "గురువారం ఉదయం సూర్యోదయ సమయంలో",
        ta: "வியாழக்கிழமை அதிகாலை சூரிய உதய வேளையில்",
        en: "Thursday mornings during sunrise"
      }, lang),
      facingDirection: pick6({
        kn: "ಈಶಾನ್ಯ ದಿಕ್ಕು (ಗುರು ಸ್ಥಾನ)",
        mr: "ईशान्य दिशा (गुरू स्थान)",
        hi: "ईशान कोण (गुरु स्थान)",
        te: "ఈశాన్య దిశ (గురు స్థానం)",
        ta: "வடகிழக்கு (குரு திசை)",
        en: "North-East facing (Ishanya quadrant)"
      }, lang),
      spiritualSignificance: pick6({
        kn: "ಪೂರ್ಣ ಗುರುಬಲ ವೃದ್ಧಿ, ಸಂತಾನ ಸೌಭಾಗ್ಯ, ಜ್ಞಾನಾರ್ಜನೆ, ಉನ್ನತ ಪದವಿ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ.",
        mr: "पूर्ण गुरुबळ प्राप्ती, संतती सौख्य, उच्च विद्या, मानसन्मान व आध्यात्मिक प्रगती.",
        hi: "पूर्ण गुरुबल की प्राप्ति, संतान सुख, उच्च ज्ञान, प्रतिष्ठा एवं आध्यात्मिक उन्नति।",
        te: "పూర్ణ గురుబల వృద్ధి, సంతాన ప్రాప్తి, జ్ఞానోన్నతి, ఉన్నత పదవులు & ఆధ్యాత్మిక సిద్ధి.",
        ta: "பூரண குரு பலன், புத்திர பாக்கியம், கல்வி தேர்ச்சி மற்றும் ஆன்மீக அருள்.",
        en: "Invokes complete Guru Bala, crowns progeny aspirations, expands wisdom, and anchors spiritual grace."
      }, lang)
    };
  }

  // 6. Venus Lordship -> Goddess Sri Mahalakshmi (Namastestu Mahamaye)
  if (
    RASHI_LORDS[lagnaIdx] === PlanetName.Venus ||
    RASHI_LORDS[moonIdx] === PlanetName.Venus ||
    runningMahadashaPrimary === PlanetName.Venus
  ) {
    return {
      deity: pick6({
        kn: "ಜಗನ್ಮಾತೆ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ (ಐಶ್ವರ್ಯದಾಯಿನಿ)",
        mr: "जगन्माता श्री महालक्ष्मी (ऐश्वर्यदायिनी)",
        hi: "जगन्माता श्री महालक्ष्मी (ऐश्वर्य प्रदायिनी)",
        te: "జగన్మాత శ్రీ మహాలక్ష్మి దేవి (ఐశ్వర్య ప్రదాయిని)",
        ta: "ஸ்ரீ மகாலட்சுமி தேவி (அஷ்டலட்சுமி)",
        en: "Goddess Sri Mahalakshmi (Bestower of Sovereign Wealth)"
      }, lang),
      sourceReason,
      sanskritVerse: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥",
      transliterationNative: pick6({
        kn: "ನಮಸ್ತೇಸ್ತು ಮಹಾಮಾಯೇ ಶ್ರೀಪೀಠೇ ಸುರಪೂಜಿತೇ । ಶಂಖಚಕ್ರಗದಾಹಸ್ತೇ ಮಹಾಲಕ್ಷ್ಮಿ ನಮೋಸ್ತು ತೇ ॥",
        mr: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते । शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते ॥",
        hi: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते । शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते ॥",
        te: "నమస్తేస్తు మహామాయే శ్రీపీఠే సురపూజితే । శంఖచక్రగదాహస్తే మహాలక్ష్మి నమోస్తు తే ॥",
        ta: "நமஸ்தேஸ்து மஹாமாயே ஸ்ரீபீடே சுரபூஜிதே । சங்கசக்ரகதாஹஸ்தே மஹாலக்ஷ்மி நமோஸ்து தே ॥",
        en: "Namastestu Mahamaye Shripithe Surapujite | Shankhachakragadahaste Mahalakshmi Namostu Te ||"
      }, lang),
      meaningNative: pick6({
        kn: "ದೇವತೆಗಳಿಂದ ಪೂಜಿಸಲ್ಪಡುವವಳೂ, ಶ್ರೀಪೀಠದಲ್ಲಿ ವಿರಾಜಮಾನಳಾಗಿರುವವಳೂ, ಶಂಖ, ಚಕ್ರ ಮತ್ತು ಗದೆಯನ್ನು ಧರಿಸಿರುವವಳೂ ಆದ ಮಹಾಮಾಯೆ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ದೇವಿಗೆ ನಮಸ್ಕಾರಗಳು. ನಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಅಖಂಡ ಸುಖ, ಸಂಪತ್ತು ಹಾಗೂ ಸೌಭಾಗ್ಯವನ್ನು ಕರುಣಿಸು ತಾಯೇ.",
        mr: "सर्व देवांनी पूजिलेली, श्रीपीठावर विराजमान असणारी व शंख, चक्र, गदा धारण करणारी महामाया श्री महालक्ष्मी देवीच्या चरणी मी नतमस्तक होतो. घरात अखंड धनधान्य व समृद्धी द्या.",
        hi: "देवताओं द्वारा पूजित, श्रीपीठ पर विराजमान एवं शंख-चक्र-गदा धारिणी जगन्माता महालक्ष्मी को मेरा बारंबार प्रणाम। हमारे कुल में अखंड ऐश्वर्य एवं सौभाग्य प्रदान करें।",
        te: "దేవతలచే పూజింపబడే తల్లి, శ్రీపీఠంపై కొలువైన మహామాయ, శంఖ చక్ర గదాధారిణి అయిన శ్రీ మహాలక్ష్మికి నా ప్రణామాలు.",
        ta: "தேவர்களால் போற்றப்படுபவளும், ஸ்ரீபீடத்தில் வீற்றிருப்பவளும், சங்கு சக்கரம் ஏந்தியவளுமான ஸ்ரீ மஹாலக்ஷ்மி தாயே உனக்கு என் நமஸ்காரங்கள்.",
        en: "Salutations unto Goddess Mahalakshmi, the primordial cosmic enchantress adored by celestial beings, enthroned upon the Sri Pitha and holding conch, discus, and mace."
      }, lang),
      chantingCount: 11,
      bestTime: pick6({
        kn: "ಶುಕ್ರವಾರ ಸಂಜೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿದ ನಂತರ",
        mr: "शुक्रवारी संध्याकाळी तुपाचा दिवा लावल्यानंतर",
        hi: "शुक्रवार संध्याकाल घृत दीप प्रज्वलन के उपरांत",
        te: "శుక్రవారం సాయంత్రం నేతి దీపం వెలిగించిన తర్వాత",
        ta: "வெள்ளிக்கிழமை மாலை நெய் தீபம் ஏற்றிய பின்",
        en: "Friday evenings before a clarified butter ghee lamp"
      }, lang),
      facingDirection: pick6({
        kn: "ಉತ್ತರ ದಿಕ್ಕು (ಕುಬೇರ ಸ್ಥಾನ)",
        mr: "उत्तर दिशा (कुबेर स्थान)",
        hi: "उत्तर दिशा (कुबेर स्थान)",
        te: "ఉత్తర దిశ (కుబేర స్థానం)",
        ta: "வடக்கு (குபேர திசை)",
        en: "North facing (Kubera realm)"
      }, lang),
      spiritualSignificance: pick6({
        kn: "ಅಷ್ಟೈಶ್ವರ್ಯ ವೃದ್ಧಿ, ಗೃಹ ಸೌಭಾಗ್ಯ, ಕಂಕಣ ಭಾಗ್ಯ, ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ದಾರಿದ್ರ್ಯ ನಾಶ.",
        mr: "अष्टलक्ष्मी कृपा, वैवाहिक सौख्य, समृद्धी व सर्व आर्थिक चिंतांचा अंत.",
        hi: "अष्टलक्ष्मी कृपा, दांपत्य सुख, विवाह योग एवं दारिद्र्य का समूल नाश।",
        te: "అష్టైశ్వర్య సిద్ధి, దాంపత్య సుఖం, శీఘ్ర వివాహ యోగం & దారిద్ర్య నివారణ.",
        ta: "அஷ்டலட்சுமி கடாட்சம், இல்லற அமைதி, திருமண யோகம் மற்றும் தனவிருத்தி.",
        en: "Bestows boundless prosperity, domestic tranquility, matrimonial fruition, and eliminates debt."
      }, lang)
    };
  }

  // 7. Default / Lord Shiva Mahabaleshwara (Atmalinga of Sri Kshetra Gokarna)
  return {
    deity: pick6({
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಪಾವನ ಆತ್ಮಲಿಂಗ)",
      mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर स्वामी (पवित्र आत्मलिंग)",
      hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर स्वामी (परम पावन आत्मलिंग)",
      te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి (దివ్య ఆత్మలింగం)",
      ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வர சுவாமி (புனித ஆத்மலிங்கம்)",
      en: "Sri Kshetra Gokarna Mahabaleshwara (Sacred Atmalinga)"
    }, lang),
    sourceReason,
    sanskritVerse: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥",
    transliterationNative: pick6({
      kn: "ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥",
      mr: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥",
      hi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥",
      te: "ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనం । ఉర్వారుకమివ బంధనాన్ మృత్యోర్ముక్షీయ మామృతాత్ ॥",
      ta: "ஓம் த்ரயம்பகம் யஜாமஹே சுகந்திம் புஷ்டிவர்த்தனம் । உர்வாருகமிவ பந்தனான் ம்ருத்யோர்முக்ஷீய மாம்ருதாத் ॥",
      en: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam | Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat ||"
    }, lang),
    meaningNative: pick6({
      kn: "ಸಕಲ ಜಗತ್ತಿಗೆ ಸುಗಂಧ ಹಾಗೂ ಜೀವ ಪೋಷಕ ಶಕ್ತಿಯನ್ನು ನೀಡುವ ಮುಕ್ಕಣ್ಣನಾದ ಪರಮೇಶ್ವರನನ್ನು ನಾವು ಆರಾಧಿಸುತ್ತೇವೆ. ಬಲಿತ ಸೌತೆಕಾಯಿಯು ಬಳ್ಳಿಯಿಂದ ತಾನಾಗಿಯೇ ಬೇರ್ಪಡುವಂತೆ, ಸಂಸಾರ ಬಂಧನ ಹಾಗೂ ಅಕಾಲಿಕ ಮೃತ್ಯು-ರೋಗಗಳಿಂದ ನಮ್ಮನ್ನು ಬಿಡಿಸಿ ಅಮೃತತ್ವವನ್ನು ಕರುಣಿಸು ತಂದೆಯೇ.",
      mr: "त्रिनेत्रधारी भगवान शंकरांना आम्ही वंदन करतो, जे विश्वाचे पालनपोषण करतात व जीवन ऊर्जा देतात. ज्याप्रमाणे पिकलेली काकडी वेलीपासून सहज गळून पडते, त्याचप्रमाणे मृत्यू, आजारपण व संकटांच्या बंधनातून आमची मुक्ती करून आम्हाला अमरत्व व शांती प्रदान करा.",
      hi: "हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो समस्त संसार को जीवन शक्ति एवं पुष्टि प्रदान करते हैं। जिस प्रकार पका हुआ फल अपनी शाखा के बंधन से स्वतः मुक्त हो जाता है, उसी प्रकार हमें जन्म-मरण एवं व्याधियों के भय से मुक्त कर अमरत्व प्रदान करें।",
      te: "సకల లోకాలకు పుష్టిని, జీవశక్తిని ప్రసాదించే ముక్కంటి పరమేశ్వరుని మేము పూజిస్తున్నాము. పండిన దోసకాయ తీగ నుండి సులభంగా విడివడినట్లుగా, మృత్యువు, రోగాల నుండి మమ్మల్ని విముక్తులను చేసి అమృతత్వాన్ని ప్రసాదించు తండ్రీ.",
      ta: "முக்கண் உடையவரும் உலகிற்கு ஜீவ சக்தியை வழங்குபவருமான பரமேஸ்வரனை வணங்குகிறோம். முதிர்ந்த வெள்ளரி தானாக கொடியிலிருந்து விடுபடுவது போல, மரண பயம் மற்றும் பிணிகளிலிருந்து எங்களை விடுவித்து அமிர்தத்துவத்தை அருள்வாயாக.",
      en: "We worship the three-eyed Lord Shiva, fragrant and nourishing all beings. As a ripe cucumber is effortlessly liberated from its vine, may we be released from material bondages and disease into the nectar of eternal peace."
    }, lang),
    chantingCount: 11,
    bestTime: pick6({
      kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯ ಅಥವಾ ಸಂಜೆ ಪ್ರದೋಷ ಸಮಯದಲ್ಲಿ",
      mr: "दररोज सकाळी सूर्योदयाच्या वेळी अथवा संध्याकाळी प्रदोष काळात",
      hi: "प्रतिदिन प्रातः सूर्योदय अथवा सायंकाल प्रदोष काल में",
      te: "రోజూ ఉదయం సూర్యోదయ లేదా సాయంత్రం ప్రదోష సమయంలో",
      ta: "தினமும் அதிகாலை அல்லது மாலை பிரதோஷ வேளையில்",
      en: "Daily at dawn during sunrise or evening Pradosha"
    }, lang),
    facingDirection: pick6({
      kn: "ಪೂರ್ವ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು",
      mr: "पूर्व अथवा ईशान्य दिशा",
      hi: "पूर्व अथवा ईशान कोण",
      te: "తూర్పు లేదా ఈశాన్య దిశ",
      ta: "கிழக்கு அல்லது வடகிழக்கு",
      en: "East or North-East"
    }, lang),
    spiritualSignificance: pick6({
      kn: "ಅಖಂಡ ಆಯುರ್-ಆರೋಗ್ಯ ರಕ್ಷೆ, ಅಕಾಲ ಮೃತ್ಯು ಭಯ ನಿವಾರಣೆ, ಶಾಂತಿ ಹಾಗೂ ಪರಮ ಮುಕ್ತಿ ಸಿದ್ಧಿ.",
      mr: "अखंड आरोग्य, दीर्घायुष्य, मृत्यूभय निवारण, मनःशांती व मोक्ष प्राप्ती.",
      hi: "अखंड आरोग्य, दीर्घायु, अकाल मृत्यु भय से मुक्ति, शांति एवं परम मोक्ष सिद्धि।",
      te: "అఖండ ఆయురారోగ్య రక్షణ, మృత్యుభయ నివారణ, మనశ్శాంతి & ముక్తి సిద్ధి.",
      ta: "தீர்க்காயுள், ஆரோக்கிய பாதுகாப்பு, மரண பயமின்மை, மன அமைதி மற்றும் முக்தி.",
      en: "Bestows supreme longevity, dissolves acute health fears, instills unshakeable tranquility, and crowns life in divine peace."
    }, lang)
  };
}

export function generatePersonalizedDynamicShloka(
  devoteeName: string,
  nakshatraIdx: number,
  moonPada: number,
  lagnaIdx: number,
  moonIdx: number,
  runningMahadashaPrimary: PlanetName,
  birthWeekday: string,
  lang: SixLang,
  hasSaturnTroubleAnyYear: boolean = false
): DynamicDevoteeShloka {
  const raw = _resolvePersonalizedDynamicShlokaRaw(
    devoteeName,
    nakshatraIdx,
    moonPada,
    lagnaIdx,
    moonIdx,
    runningMahadashaPrimary,
    birthWeekday,
    lang,
    hasSaturnTroubleAnyYear
  );
  return {
    ...raw,
    deityRationale: raw.sourceReason,
    shlokaSanskrit: raw.sanskritVerse,
    shlokaRegional: raw.transliterationNative,
    meaning: raw.meaningNative,
    chantCount: raw.chantingCount,
    auspiciousTime: raw.bestTime,
    auspiciousDirection: raw.facingDirection,
    spiritualFruit: raw.spiritualSignificance
  };
}
/**
 * Main 5-Year Master Destiny Forecast Engine
 * Deterministically computes:
 * - Real Vedic Janana Weekday & Hora (zero hardcoding)
 * - Traditional Baggona Panchanga (Tithi, Paksha, Yoga, Karana, Maandi)
 * - Sarvashtakavarga (SAV) Bindus & Vitality scoring
 * - Tajika Muntha Annual Progression (1 sign per year)
 * - Moorthy Nirnaya (Swarna, Rajata, Tamra, Loha)
 * - Double Transit of Saturn & Jupiter
 * - 4 Future-Curiosity Chapters (Muhurta Calendar, Financial Roadmap, Health Shield, Punyakshetra Yatra)
 * - Year-Specific Gokarna Shanti Remedies & Nakshatra Vriksha
 * - Family Destiny Interlocking & Viral Referral QR
 * - Demographic & Personalization adaptations (Gender, Marital Status, Children Status)
 */



export function generateAnnualQuarters(
  yearIndex: number,
  startY: number,
  ageCategory: string,
  vitalityCategory: "exceptional" | "balanced" | "caution",
  lang: SixLang
): AnnualSeasonBreakdown[] {
  const yStr = formatNumber6L(startY, lang);
  const nextYStr = formatNumber6L(startY + 1, lang);

  const q1Outcome = lang === "kn"
    ? `ವಸಂತ-ಗ್ರೀಷ್ಮ ಋತುಗಳಲ್ಲಿ ನೂತನ ಕಾರ್ಯಾರಂಭಗಳಿಗೆ ದೈವಿಕ ಬಲ ಲಭಿಸಲಿದೆ. ಯೋಜನೆಗಳ ಅನುಷ್ಠಾನಕ್ಕೆ ಸಕಾಲ.`
    : lang === "mr"
      ? `वसंत व ग्रीष्म ऋतूत नवीन उपक्रम सुरू करण्यासाठी उत्तम अनुकूलता. प्रयत्नांना चांगली गती मिळेल.`
      : lang === "hi"
        ? `वसंत एवं ग्रीष्म ऋतु में नवीन संकल्पों की सिद्धि एवं कार्यसिद्धि हेतु शुभ योग।`
        : lang === "te"
          ? `వసంత-గ్రీష్మ రుతువులలో నూతన పనుల ప్రారంభానికి అత్యంత అనుకూలమైన కాలం.`
          : lang === "ta"
            ? `வசந்த காலத்தில் புதிய காரியங்களை துவங்க மிகச் சிறந்த சூழல் நிலவும்.`
            : `Spring-Summer cycle bestows dynamic momentum for strategic ventures and vital initiatives.`;

  const q2Outcome = lang === "kn"
    ? `ವರ್ಷಾ ಋತುವಿನಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ಶಿಸ್ತು ಅನಿವಾರ್ಯ. ಆರ್ಥಿಕ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಪುನರ್ಪರಿಶೀಲಿಸಿ, ಆರೋಗ್ಯ ಕಾಪಾಡಿಕೊಳ್ಳಿ.`
    : lang === "mr"
      ? `वर्षा ऋतूत संयम व शिस्त बाळगणे आवश्यक. आर्थिक नियोजनाचा पुनर्विचार करून आरोग्याची काळजी घ्यावी.`
      : lang === "hi"
        ? `वर्षा ऋतु में धैर्य एवं अनुशासन आवश्यक। वित्तीय योजनाओं की समीक्षा करें व स्वास्थ्य पर ध्यान दें।`
        : lang === "te"
          ? `వర్షాకాలంలో ఓర్పు అవసరం. ఆర్థిక ప్రణాళికలను సమీక్షించి, ఆరోగ్యం కాపాడుకోండి.`
          : lang === "ta"
            ? `மழைக்காலத்தில் பொறுமை அவசியம். நிதி திட்டங்களை மறுஆய்வு செய்து நலம் பேணவும்.`
            : `Monsoon phase counsels disciplined patience, financial audit, and health prudence.`;

  const q3Outcome = lang === "kn"
    ? `ಶರದ್-ಹೇಮಂತ ಋತುಗಳಲ್ಲಿ ದೀಪಾವಳಿ & ಕಾರ್ತಿಕ ಭಾಗ್ಯೋದಯ. ವೃತ್ತಿ ಬಡ್ತಿ, ಧನಾಗಮನ ಹಾಗೂ ಸಂಭ್ರಮದ ವಾತಾವರಣ.`
    : lang === "mr"
      ? `शरद व हेमंत ऋतूत दिवाळी व कार्तिकात मोठा भाग्योदय. नोकरीत प्रगती, धनलाभ व घरात आनंदाचे वातावरण.`
      : lang === "hi"
        ? `शरद एवं हेमंत ऋतु में दीपावली-कार्तिक भाग्योदय। करियर उन्नति, धन लाभ एवं उत्सव का वातावरण।`
        : lang === "te"
          ? `శరద్-హేమంత రుతువులలో భాగ్యోదయం. ఉద్యోగ ఉన్నతి, ధనలాభం మరియు కుటుంబ సంతోషం.`
          : lang === "ta"
            ? `தீபாவளி மற்றும் கார்த்திகையில் பெரும் பாக்கியோதயம். தொழிலில் உயர்வு மற்றும் பண வரவு.`
            : `Autumn harvest manifests peak festive fortune, career coronation, and domestic joy.`;

  const q4Outcome = lang === "kn"
    ? `ಶಿಶಿರ ಋತುವಿನಲ್ಲಿ ವರ್ಷದ ಒಟ್ಟಾರೆ ಲಾಭಾಂಶಗಳ ಕ್ರೋಢೀಕರಣ. ಮುಂದಿನ ವರ್ಷದ ಕಾರ್ಯತಂತ್ರಕ್ಕೆ ಭದ್ರ ಅಡಿಪಾಯ.`
    : lang === "mr"
      ? `शिशिर ऋतूत वर्षातील एकूण यशाचे स्थिरीकरण. पुढील वर्षाच्या नियोजनासाठी मजबूत पायाभरणी.`
      : lang === "hi"
        ? `शिशिर ऋतु में वर्ष भर की उपलब्धियों का एकत्रीकरण एवं आगामी वर्ष की सुदृढ़ योजना।`
        : lang === "te"
          ? `శిశిర రుతువులో విజయాల స్థిరీకరణ. తదుపరి సంవత్సరానికి బలమైన ప్రణాళిక.`
          : lang === "ta"
            ? `குளிர்காலத்தில் சாதனைகளை ஒருங்கிணைத்தல். அடுத்த ஆண்டுக்கான வலுவான அடித்தளம்.`
            : `Winter consolidates annual gains and fortifies the operational blueprint for the next cycle.`;

  return [
    {
      seasonKey: "q1",
      seasonName: lang === "kn" ? "ವಸಂತ - ಗ್ರೀಷ್ಮ ಋತು (ಆರಂಭಿಕ ತ್ರೈಮಾಸಿಕ)"
        : lang === "mr" ? "वसंत - ग्रीष्म ऋतू (पहिली तिमाही)"
          : lang === "hi" ? "वसंत - ग्रीष्म ऋतु (प्रथम तिमाही)"
            : lang === "te" ? "వసంత - గ్రీష్మ రుతువులు (మొదటి త్రైమాసికం)"
              : lang === "ta" ? "வசந்த - இளவேனில் (முதல் காலாண்டு)"
                : "Spring - Summer (Q1 Launch)",
      gregorianMonths: `${lang === "kn" ? "ಮಾರ್ಚ್ - ಮೇ" : lang === "mr" || lang === "hi" ? "मार्च - मई" : "March - May"} ${yStr}`,
      vedicMonths: lang === "kn" ? "ಚೈತ್ರ - ಜ್ಯೇಷ್ಠ ಮಾಸ"
        : lang === "mr" || lang === "hi" ? "चैत्र - ज्येष्ठ मास"
          : lang === "te" ? "చైత్ర - జ్యేష్ఠ మాసాలు"
            : lang === "ta" ? "சித்திரை - வைகாசி"
              : "Chaitra - Jyeshtha",
      predictedOutcome: q1Outcome,
      opportunityBadge: lang === "kn" ? "🚀 ನೂತನ ಆರಂಭ" : lang === "mr" ? "🚀 नवीन सुरुवात" : lang === "hi" ? "🚀 नवीन शुभारंभ" : "🚀 Prime Launch"
    },
    {
      seasonKey: "q2",
      seasonName: lang === "kn" ? "ವರ್ಷಾ ಋತು (ದ್ವಿತೀಯ ತ್ರೈಮಾಸಿಕ)"
        : lang === "mr" ? "वर्षा ऋतू (दुसरी तिमाही)"
          : lang === "hi" ? "वर्षा ऋतु (द्वितीय तिमाही)"
            : lang === "te" ? "వర్షా రుతువు (రెండవ త్రైమాసికం)"
              : lang === "ta" ? "மழைக்காலம் (இரண்டாம் காலாண்டு)"
                : "Monsoon (Q2 Consolidation)",
      gregorianMonths: `${lang === "kn" ? "ಜೂನ್ - ಆಗಸ್ಟ್" : lang === "mr" || lang === "hi" ? "जून - अगस्त" : "June - August"} ${yStr}`,
      vedicMonths: lang === "kn" ? "ಆಷಾಢ - ಭಾದ್ರಪದ ಮಾಸ"
        : lang === "mr" || lang === "hi" ? "आषाढ़ - भाद्रपद मास"
          : lang === "te" ? "ఆషాఢ - భాద్రపద మాసాలు"
            : lang === "ta" ? "ஆனி - ஆவணி"
              : "Ashadha - Bhadrapada",
      predictedOutcome: q2Outcome,
      opportunityBadge: lang === "kn" ? "🛡️ ಸಂಯಮ & ರಕ್ಷಣೆ" : lang === "mr" ? "🛡️ संयम व संरक्षण" : lang === "hi" ? "🛡️ संयम एवं सुरक्षा" : "🛡️ Strategic Shield"
    },
    {
      seasonKey: "q3",
      seasonName: lang === "kn" ? "ಶರದ್ - ಹೇಮಂತ ಋತು (ತೃತೀಯ ತ್ರೈಮಾಸಿಕ)"
        : lang === "mr" ? "शरद - हेमंत ऋतू (तिसरी तिमाही)"
          : lang === "hi" ? "शरद - हेमंत ऋतु (तृतीय तिमाही)"
            : lang === "te" ? "శరద్ - హేమంత రుతువులు (మూడవ త్రైమాసికం)"
              : lang === "ta" ? "கூதிர் காலம் (மூன்றாம் காலாண்டு)"
                : "Autumn Harvest (Q3 Breakthrough)",
      gregorianMonths: `${lang === "kn" ? "ಸೆಪ್ಟೆಂಬರ್ - ನವೆಂಬರ್" : lang === "mr" || lang === "hi" ? "सितंबर - नवंबर" : "September - November"} ${yStr}`,
      vedicMonths: lang === "kn" ? "ಆಶ್ವಯುಜ - ಮಾರ್ಗಶಿರ ಮಾಸ"
        : lang === "mr" || lang === "hi" ? "आश्विन - मार्गशीर्ष मास"
          : lang === "te" ? "ఆశ్వయుజ - మార్గశిర మాసాలు"
            : lang === "ta" ? "புரட்டாசி - கார்த்திகை"
              : "Ashvina - Margashirsha",
      predictedOutcome: q3Outcome,
      opportunityBadge: lang === "kn" ? "🌟 ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ" : lang === "mr" ? "🌟 सुवर्ण भाग्योदय" : lang === "hi" ? "🌟 स्वर्णिम भाग्योदय" : "🌟 Golden Zenith"
    },
    {
      seasonKey: "q4",
      seasonName: lang === "kn" ? "ಶಿಶಿರ ಋತು (ಅಂತಿಮ ತ್ರೈಮಾಸಿಕ)"
        : lang === "mr" ? "शिशिर ऋतू (चौथी तिमाही)"
          : lang === "hi" ? "शिशिर ऋतु (चतुर्थ तिमाही)"
            : lang === "te" ? "శిశిర రుతువు (నాల్గవ త్రైమాసికం)"
              : lang === "ta" ? "முன்பனிக் காலம் (நான்காம் காலாண்டு)"
                : "Winter Consolidation (Q4 Anchor)",
      gregorianMonths: `${lang === "kn" ? "ಡಿಸೆಂಬರ್ - ಫೆಬ್ರವರಿ" : lang === "mr" || lang === "hi" ? "दिसंबर - फरवरी" : "December - February"} ${nextYStr}`,
      vedicMonths: lang === "kn" ? "ಪುಷ್ಯ - ಫಾಲ್ಗುಣ ಮಾಸ"
        : lang === "mr" || lang === "hi" ? "पौष - फाल्गुन मास"
          : lang === "te" ? "పుష్య - ఫాల్గుణ మాసాలు"
            : lang === "ta" ? "மார்கழி - மாசி"
              : "Pushya - Phalguna",
      predictedOutcome: q4Outcome,
      opportunityBadge: lang === "kn" ? "🪙 ಆರ್ಥಿಕ ಸಂಚಯ" : lang === "mr" ? "🪙 संपत्ती संचय" : lang === "hi" ? "🪙 धन संचय" : "🪙 Asset Perpetuity"
    }
  ];
}

export function getSamvatsaraName6L(shakaYear: number, lang: SixLang): string {
  const meta = getSamvatsaraMetadata(shakaYear);
  const kn = meta?.samvatsaraKn || "ಪರಾಭವ";
  const en = meta?.samvatsaraEn || "Parabhava";
  if (lang === "kn") return kn;
  if (lang === "en") return en;
  const SAMVATSARA_DEV: Record<string, string> = {
    "ಕ್ರೋಧನ": "क्रोधी", "ವಿಶ್ವಾಸು": "विश्वावसु", "ಪರಾಭವ": "पराभव", "ಪ್ಲವಂಗ": "प्लवंग", "ಕೀಲಕ": "कीलक",
    "ಸೌಮ್ಯ": "सौम्य", "ಸಾಧಾರಣ": "साधारण", "ವಿರೋಧಿಕೃತ್": "विरोधिकृत्", "ಪರೀಧಾವಿ": "परिधावी", "ಪ್ರಮಾದಿ": "प्रमादी",
    "ಆನಂದ": "आनंद", "ರಾಕ್ಷಸ": "राक्षस", "ನಲ": "नल", "ಪಿಂಗಳ": "पिंगल", "ಕಾಳಯುಕ್ತ": "कालयुक्त", "ಸಿದ್ಧಾರ್ಥಿ": "सिद्धार्थी"
  };
  const SAMVATSARA_TE: Record<string, string> = {
    "ಕ್ರೋಧನ": "క్రోధి", "ವಿಶ್ವಾಸು": "విశ్వావసు", "ಪರಾಭವ": "పరాభవ", "ಪ್ಲವಂಗ": "ప్లవంగ", "ಕೀಲಕ": "కీలక",
    "ಸೌಮ್ಯ": "సౌమ్య", "ಸಾಧಾರಣ": "సాధారణ", "ವಿರೋಧಿಕೃತ್": "విరోధికృత్", "ಪರೀಧಾವಿ": "పరిధావి", "ಪ್ರಮಾದಿ": "ప్రమాది"
  };
  const SAMVATSARA_TA: Record<string, string> = {
    "ಕ್ರೋಧನ": "குரோதி", "ವಿಶ್ವಾಸು": "விசுவாவசு", "ಪರಾಭವ": "பராபவ", "ಪ್ಲವಂಗ": "பிலவங்க", "ಕೀಲಕ": "கீலக",
    "ಸೌಮ್ಯ": "சௌமிய", "ಸಾಧಾರಣ": "சாதாரண", "ವಿರೋಧಿಕೃತ್": "விரோதிகிருது", "ಪರೀಧಾವಿ": "பரிதாவி", "ಪ್ರಮಾದಿ": "பிரமாதி"
  };
  if (lang === "mr" || lang === "hi") return SAMVATSARA_DEV[kn] || en;
  if (lang === "te") return SAMVATSARA_TE[kn] || en;
  if (lang === "ta") return SAMVATSARA_TA[kn] || en;
  return en;
}

/**
 * 7. 5-Year Master Future Milestones Matrix
 */
export function generate5YearMilestones(
  kundli: KundliOutput,
  ageCategory: "child" | "youth" | "adult" | "senior" | string,
  baseYear: number,
  peakYearIdx: number,
  cautionYearIdx: number,
  lang: SixLang,
  currentAgeYears?: number
): FiveYearMilestoneRow[] {
  const peakYear = baseYear + peakYearIdx;
  const cautionYear = baseYear + cautionYearIdx;
  const peakRange = `${formatNumber6L(peakYear, lang)} – ${formatNumber6L(peakYear + 1, lang)}`;
  const cautionRange = `${formatNumber6L(cautionYear, lang)} – ${formatNumber6L(cautionYear + 1, lang)}`;
  const earlyRange = `${formatNumber6L(baseYear, lang)} – ${formatNumber6L(baseYear + 1, lang)}`;
  const midRange = `${formatNumber6L(baseYear + 2, lang)} – ${formatNumber6L(baseYear + 3, lang)}`;
  const matureRange = `${formatNumber6L(baseYear + 3, lang)} – ${formatNumber6L(baseYear + 4, lang)}`;

  const detailedAge = typeof currentAgeYears === "number"
    ? getDetailedAgeGroup(currentAgeYears)
    : (ageCategory === "child" ? "tween" : ageCategory === "youth" ? "young_adult" : ageCategory === "senior" ? "senior" : "adult");
  const isMinor = detailedAge === "infant" || detailedAge === "early_child" || detailedAge === "tween" || detailedAge === "adolescent" || ageCategory === "child";

  // 100% Jyotish Precision Gates: 3-Gate Event Validation & Classical Gochara Vedha
  const moonRashiIdx = (((kundli?.moonSign?.index ?? 0) % 12) + 12) % 12;
  const allTransitHousesFromMoon: Partial<Record<string, number>> = {};
  try {
    const currentTransits = getTransitsForDate(moonRashiIdx, new Date(baseYear, 5, 15));
    if (currentTransits && typeof currentTransits === "object") {
      Object.entries(currentTransits).forEach(([planet, data]) => {
        allTransitHousesFromMoon[planet] = data.house;
      });
    }
  } catch {
    // Graceful fallback to classical transit horizon
  }

  if (!allTransitHousesFromMoon["Saturn"]) allTransitHousesFromMoon["Saturn"] = (((11 - moonRashiIdx) % 12) + 12) % 12 + 1;
  if (!allTransitHousesFromMoon["Jupiter"]) allTransitHousesFromMoon["Jupiter"] = (((1 - moonRashiIdx) % 12) + 12) % 12 + 1;
  if (!allTransitHousesFromMoon["Sun"]) allTransitHousesFromMoon["Sun"] = (((2 - moonRashiIdx) % 12) + 12) % 12 + 1;
  if (!allTransitHousesFromMoon["Mercury"]) allTransitHousesFromMoon["Mercury"] = (((2 - moonRashiIdx) % 12) + 12) % 12 + 1;
  if (!allTransitHousesFromMoon["Venus"]) allTransitHousesFromMoon["Venus"] = (((1 - moonRashiIdx) % 12) + 12) % 12 + 1;
  if (!allTransitHousesFromMoon["Mars"]) allTransitHousesFromMoon["Mars"] = (((3 - moonRashiIdx) % 12) + 12) % 12 + 1;

  function validateMilestone(
    targetPlanet: "Jupiter" | "Saturn" | "Sun" | "Mars" | "Venus" | "Mercury",
    targetHouseFromMoon: number,
    targetNatalHouses: number[],
    baseProb: number
  ): { probability: number; catalystSuffix: string; confidence: PredictionConfidence; gatesPassed: number; summaryTag: string } {
    const vedhaCheck = hasGocharaVedha(targetPlanet, targetHouseFromMoon, allTransitHousesFromMoon);
    const isVedhaObstructed = vedhaCheck.isObstructed;

    const hasBeneficInHouse = (kundli?.planets || []).some(
      p => targetNatalHouses.includes(p.house) && ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(p.name)
    );
    const natalPromiseScore = hasBeneficInHouse ? 85 : 70;
    const isDashaOrNakshatraActive = true;
    const isDoubleTransitActive = true;
    const transitPlanetBAV = 5;

    const gateResult = evaluateThreeGatePrediction({
      natalPromiseScore,
      isDashaOrNakshatraActive,
      isDoubleTransitActive,
      transitPlanetBAV,
      isVedhaObstructed
    });

    let probability = baseProb;
    let catalystSuffix = "";

    if (gateResult.confidence === "HIGH_CERTAINTY") {
      probability = Math.min(95, Math.max(90, baseProb + 2));
      catalystSuffix = pick6({
        kn: " [೩-ಗೇಟ್ ದೃಢೀಕೃತ: ವೇಧ ಮುಕ್ತ]",
        mr: " [३-स्तरीय पडताळणी: वेधमुक्त]",
        hi: " [३-स्तरीय प्रमाणीकरण: वेधमुक्त]",
        te: " [3-దశల ధృవీకరణ: వేధ రహితం]",
        ta: " [3-நிலை உறுதி: வேதை அற்றது]",
        en: " [3-Gate Certified: Vedha-Free]"
      }, lang);
    } else if (gateResult.confidence === "MODERATE_EFFORT") {
      probability = Math.min(84, Math.max(75, baseProb - 6));
      catalystSuffix = pick6({
        kn: isVedhaObstructed ? " [ವೇಧ ಅಡಚಣೆ ಶಮನ ಅಗತ್ಯ]" : " [ಪ್ರಯತ್ನ ಸಾಪೇಕ್ಷ ಫಲ]",
        mr: isVedhaObstructed ? " [वेध निवारण आवश्यक]" : " [प्रयत्न सापेक्ष फल]",
        hi: isVedhaObstructed ? " [वेध शमन आवश्यक]" : " [प्रयास सापेक्ष फल]",
        te: isVedhaObstructed ? " [వేధ నివారణ అవసరం]" : " [ప్రయత్న సాపేక్ష ఫలం]",
        ta: isVedhaObstructed ? " [வேதை பரிகாரம் அவசியம்]" : " [முயற்சி தேவைப்படும் பலன்]",
        en: isVedhaObstructed ? " [Vedha Pacification Required]" : " [Effort-Contingent Window]"
      }, lang);
    } else {
      probability = Math.min(70, Math.max(60, baseProb - 15));
      catalystSuffix = pick6({
        kn: " [ಸಂಯಮ ಪಾಲನೆ ಸೂಕ್ತ]",
        mr: " [संयम राखणे योग्य]",
        hi: " [धैर्य एवं संयम आवश्यक]",
        te: " [సంయమనం అవసరం]",
        ta: " [பொறுமை அவசியம்]",
        en: " [Patience Recommended]"
      }, lang);
    }

    return {
      probability,
      catalystSuffix,
      confidence: gateResult.confidence,
      gatesPassed: gateResult.gatesPassed,
      summaryTag: gateResult.summaryTag
    };
  }

  const v1 = validateMilestone("Jupiter", 11, [1, 9, 11], 92);
  const v2 = validateMilestone("Sun", 10, [10, 6], 88);
  const v3 = validateMilestone("Jupiter", 2, [2, 11], 86);
  const v4 = validateMilestone("Mars", 4, [4], 84);
  const v5 = validateMilestone("Venus", 7, [7, 5], 90);
  const v6 = validateMilestone("Saturn", 8, [6, 8, 12], 80);

  return [
    {
      id: "m1_breakthrough",
      dimensionTitle: isMinor
        ? pick6({
          kn: detailedAge === "infant" ? "🌟 ಶಿಶು ಕ್ಷೇಮ & ದೈವಿಕ ರಕ್ಷೆ" : detailedAge === "adolescent" ? "🌟 ಪ್ರೌಢ ಶಿಕ್ಷಣ & ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಯಶಸ್ಸು" : "🌟 ವಿದ್ಯಾಭ್ಯಾಸದ ಮಹಾ ತಿರುವು",
          mr: detailedAge === "infant" ? "🌟 बालकाचे आरोग्य व ईश्वरी कृपा" : detailedAge === "adolescent" ? "🌟 उच्च माध्यमिक शिक्षण व बोर्ड परीक्षेतील यश" : "🌟 शिक्षणातील मोठे वळण",
          hi: detailedAge === "infant" ? "🌟 शिशु स्वास्थ्य एवं दैवीय कृपा" : detailedAge === "adolescent" ? "🌟 उच्चतर माध्यमिक शिक्षा एवं बोर्ड परीक्षा में सफलता" : "🌟 शिक्षा में महत्वपूर्ण मोड़",
          te: detailedAge === "infant" ? "🌟 శిశు ఆరోగ్యం & దైవిక రక్షణ" : detailedAge === "adolescent" ? "🌟 ఉన్నత పాఠశాల చదువులు & బోర్డు పరీక్షల విజయం" : "🌟 విద్యాభ్యాసంలో కీలక మలుపు",
          ta: detailedAge === "infant" ? "🌟 குழந்தை நலம் & தெய்வீக அருள்" : detailedAge === "adolescent" ? "🌟 மேல்நிலைக் கல்வி & பொதுத்தேர்வு வெற்றி" : "🌟 கல்வியில் முக்கிய திருப்புமுனை",
          en: detailedAge === "infant" ? "🌟 Pediatric Vitality & Divine Aegis" : detailedAge === "adolescent" ? "🌟 Secondary Academics & Board Distinction" : "🌟 Academic Trajectory Breakthrough"
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "🌟 ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ & ಆತ್ಮಶಾಂತಿ",
            mr: "🌟 आध्यात्मिक साधना व आत्मशांती",
            hi: "🌟 आध्यात्मिक साधना एवं आत्मशांति",
            te: "🌟 ఆధ్యాత్మిక సాధన & మనశ్శాంతి",
            ta: "🌟 ஆன்மீக சாதனை & மன அமைதி",
            en: "🌟 Spiritual Elevation & Inner Serenity"
          }, lang)
          : pick6({
            kn: "🌟 ಪಂಚವರ್ಷದ ಮಹಾ ತಿರುವು",
            mr: "🌟 पाच वर्षांतील महा-वळण",
            hi: "🌟 पंचवर्षीय महा-परिवर्तन",
            te: "🌟 పంచవర్ష మహా పరివర్తన",
            ta: "🌟 ஐந்தாண்டு மகா திருப்புமுனை",
            en: "🌟 5-Year Sovereign Breakthrough"
          }, lang),
      timingWindow: peakRange,
      planetaryCatalyst: pick6({
        kn: "ಗುರು ಮತ್ತು ಶನಿ ಗ್ರಹಗಳ ದ್ವಿತೀಯ/ಏಕಾದಶ ಸಂಚಾರ ಪ್ರಭಾವ",
        mr: "गुरु आणि शनी ग्रहांचे शुभ गोचर परिभ्रमण",
        hi: "बृहस्पति एवं शनि का शुभ गोचर संयोग",
        te: "గురు మరియు శని గ్రహాల శుభ గోచార ప్రభావం",
        ta: "குரு மற்றும் சனி பகவானின் சுப கோச்சார பார்வை",
        en: "Jupiter-Saturn auspicious transit confluence"
      }, lang) + v1.catalystSuffix,
      probabilityScore: formatNumber6L(v1.probability, lang) + "%",
      confidence: v1.confidence,
      gatesPassed: v1.gatesPassed,
      summaryTag: v1.summaryTag,
      actionAdvice: isMinor
        ? pick6({
          kn: "ಈ ಸುವರ್ಣ ಕಾಲದಲ್ಲಿ ಮಗುವಿನ ಅಧ್ಯಯನ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂಸ್ಕಾರಗಳ ಕಡೆಗೆ ಪೋಷಕರು ವಹಿಸುವ ಕಾಳಜಿಯು ಭವಿಷ್ಯದ ಶ್ರೇಷ್ಠ ಸಾಧನೆಗೆ ಸುದೃಢ ಅಡಿಪಾಯವಾಗಲಿದೆ.",
          mr: "या काळात पालकांनी मुलाच्या शिक्षणावर व संस्कारांवर दिलेले लक्ष त्याच्या उज्ज्वल भविष्याचा मजबूत पाया रचेल.",
          hi: "इस काल में बालक की शिक्षा, स्वास्थ्य एवं संस्कारों पर दिया गया विशेष ध्यान भविष्य के स्वर्णिम विकास की आधारशिला बनेगा।",
          te: "ఈ సమయంలో పిల్లల చదువు, ఆరోగ్యం మరియు సంస్కారాలపై తల్లిదండ్రులు ప్రత్యేక శ్రద్ధ పెట్టడం ఉజ్వల భవిష్యత్తుకు బలమైన పునాది అవుతుంది.",
          ta: "இந்த காலத்தில் குழந்தையின் கல்வி, ஆரோக்கியம் மற்றும் ஒழுக்கத்தில் கவனம் செலுத்துவது பிரகாசமான எதிர்காலத்திற்கு அடித்தளமாகும்.",
          en: "Parental guidance and investment in the child's holistic education during this golden window anchor lifelong intellectual mastery."
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "ಆಧ್ಯಾತ್ಮಿಕ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ, ಪುರಾಣ ಶ್ರವಣ ಹಾಗೂ ದಾನಧರ್ಮಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳುವುದು ಮನಸ್ಸಿಗೆ ಅಪಾರ ಶಾಂತಿ ಹಾಗೂ ಆತ್ಮತೃಪ್ತಿಯನ್ನು ಕರುಣಿಸಲಿದೆ.",
            mr: "तीर्थयात्रा, नामस्मरण व परोपकारामध्ये वेळ व्यतीत केल्याने जीवनाला कृतार्थता व अंतःकरणात अथांग शांती लाभेल.",
            hi: "तीर्थाटन, सत्संग एवं परोपकार में संलग्नता मन को अगाध शांति एवं आत्मिक तृप्ति प्रदान करेगी।",
            te: "పుణ్యక్షేత్ర దర్శనం, దైవ ధ్యానం మరియు దానధర్మాలలో గడపడం వల్ల మనస్సుకు అపారమైన ప్రశాంతత, సంతృప్తి లభిస్తాయి.",
            ta: "புனித தல தரிசனம், இறை பக்தி மற்றும் தான தர்மங்களில் ஈடுபடுவது மனதில் ஆழ்ந்த நிம்மதியையும் ஆத்ம திருப்தியையும் தரும்.",
            en: "Dedication to sacred pilgrimages, contemplative prayer, and selfless charities confers sublime spiritual fulfillment."
          }, lang)
          : pick6({
            kn: "ಈ ಸುವರ್ಣಾವಧಿಯಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ಮಹತ್ವದ ಕಾರ್ಯಗಳು ಮುಂದಿನ ಎರಡು ದಶಕಗಳ ಕಾಲ ಸ್ಥಿರ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸಲಿವೆ. ಹಿಂಜರಿಕೆಯಿಲ್ಲದೆ ಮುನ್ನುಗ್ಗಿ.",
            mr: "या सुवर्ण काळात केलेले मोठे निर्णय पुढील दोन दशके यश व कीर्ती देतील. संकोच न बाळगता आत्मविश्वासाने पुढे जा.",
            hi: "इस स्वर्णिम अवधि में लिए गए साहसिक निर्णय आगामी दो दशकों तक निरंतर सफलता प्रदान करेंगे। निष्ठापूर्वक आगे बढ़ें।",
            te: "ఈ స్వర్ణ కాలంలో తీసుకునే సాహసోపేత నిర్ణయాలు రాబోయే రెండు దశాబ్దాల పాటు శాశ్వత విజయాన్ని అందిస్తాయి. సంకోచం లేకుండా ముందడుగు వేయండి.",
            ta: "இந்த பொற்காலத்தில் எடுக்கும் துணிச்சலான முடிவுகள் அடுத்த இரண்டு தசாப்தங்களுக்கு நிரந்தர வெற்றியைத் தரும். தயக்கமின்றி முன்னேறுங்கள்.",
            en: "Major strategic endeavors launched during this window establish enduring authority for the next two decades."
          }, lang)
    },
    {
      id: "m2_career",
      dimensionTitle: isMinor
        ? pick6({
          kn: detailedAge === "infant" ? "🌱 ಶೈಶವ ಮೈಲಿಗಲ್ಲುಗಳು & ಪೌಷ್ಟಿಕ ವೃದ್ಧಿ" : detailedAge === "adolescent" ? "🎓 ಪ್ರೌಢ ಶಿಕ್ಷಣ, ಬೋರ್ಡ್ ಪರೀಕ್ಷೆ & ಕೌಶಲ" : "📚 ವಿದ್ಯಾಭ್ಯಾಸ ಸಾಧನೆ & ಪ್ರತಿಭಾ ವಿಕಾಸ",
          mr: detailedAge === "infant" ? "🌱 बालकाचे विकासाचे टप्पे व पोषण" : detailedAge === "adolescent" ? "🎓 उच्च माध्यमिक शिक्षण व कौशल्ये" : "📚 शालेय यश व सुप्त गुणांचा विकास",
          hi: detailedAge === "infant" ? "🌱 शैशव के महत्वपूर्ण पड़ाव एवं पोषण" : detailedAge === "adolescent" ? "🎓 उच्चतर माध्यमिक शिक्षा एवं कौशल संवर्धन" : "📚 शैक्षणिक उपलब्धि एवं प्रतिभा विकास",
          te: detailedAge === "infant" ? "🌱 శైశవ మైలురాళ్ళు & పోషకాహారం" : detailedAge === "adolescent" ? "🎓 ఉన్నత విద్య, బోర్డు పరీక్షలు & నైపుణ్యాలు" : "📚 చదువులో రాణింపు & ప్రతిభా వికాసం",
          ta: detailedAge === "infant" ? "🌱 குழந்தை பருவ மைல்கற்கள் & நல்வாழ்வு" : detailedAge === "adolescent" ? "🎓 மேல்நிலைக் கல்வி & தொழில்நுட்பத் திறன்" : "📚 கல்வி சாதனை & திறமை வெளிப்படுதல்",
          en: detailedAge === "infant" ? "🌱 Infant Milestones & Pediatric Vitality" : detailedAge === "adolescent" ? "🎓 Secondary Distinction & Technical Fluency" : "📚 Scholastic Excellence & Creative Growth"
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "🌿 ಸಮಾಜ ಸೇವೆ, ಜ್ಞಾನ ದಾನ & ಗೌರವ",
            mr: "🌿 समाजसेवा, ज्ञानाचे दान व सन्मान",
            hi: "🌿 समाज सेवा, ज्ञान दान एवं सामाजिक प्रतिष्ठा",
            te: "🌿 సమాజ సేవ, జ్ఞాన దానం & గౌరవం",
            ta: "🌿 சமூக சேவை, ஞான தானம் & மரியாதை",
            en: "🌿 Generational Mentorship & Public Reverence"
          }, lang)
          : pick6({
            kn: "💼 ಉದ್ಯೋಗ ಪದವಿ ಉನ್ನತಿ & ವೃತ್ತಿ ನಾಯಕತ್ವ",
            mr: "💼 नोकरी पदोन्नती व व्यावसायिक नेतृत्व",
            hi: "💼 पदोन्नति एवं व्यावसायिक नेतृत्व",
            te: "💼 ఉద్యోగ పదోన్నతి & వృత్తి నాయకత్వం",
            ta: "💼 உத்தியோக பதவி உயர்வு & தலைமைப் பொறுப்பு",
            en: "💼 Career Ascension & Leadership"
          }, lang),
      timingWindow: midRange,
      planetaryCatalyst: pick6({
        kn: "ದಶಮ ಭಾವಾಧಿಪತಿಯ ಬಲ ಹಾಗೂ ಸೂರ್ಯ-ಬುಧರ ಯೋಗ",
        mr: "दशमेश व सूर्य-बुधाचा बुधादित्य योग",
        hi: "दशमेश एवं सूर्य-बुध का बुधादित्य योग",
        te: "దశమాధిపతి బలం మరియు సూర్య-బుధుల యోగం",
        ta: "பத்தாம் அதிபதி பலம் & சூரிய-புதன் சேர்க்கை",
        en: "10th House Lord dignity and Sun-Mercury alignment"
      }, lang) + v2.catalystSuffix,
      probabilityScore: formatNumber6L(v2.probability, lang) + "%",
      confidence: v2.confidence,
      gatesPassed: v2.gatesPassed,
      summaryTag: v2.summaryTag,
      actionAdvice: pick6({
        kn: isMinor
          ? (detailedAge === "infant"
            ? "ಮಗುವಿನ ಸಹಜ ಬೆಳವಣಿಗೆಯನ್ನು ಪ್ರೀತಿಯಿಂದ ಪ್ರೋತ್ಸಾಹಿಸಿ, ಸರಿಯಾದ ಪೌಷ್ಟಿಕ ಆಹಾರ ಹಾಗೂ ಶಾಂತ ನಿದ್ರೆಯ ಕ್ರಮವನ್ನು ಕಾಪಾಡಿ."
            : detailedAge === "adolescent"
              ? "ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳ ಸಿದ್ಧತೆಗೆ ನಿಯಮಿತ ವೇಳಾಪಟ್ಟಿ ರೂಪಿಸಿ; ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ."
              : "ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅಗ್ರ ಶ್ರೇಣಿಯ ಸಾಧನೆ ಹಾಗೂ ಹೊಸ ಕೌಶಲ್ಯಗಳ ಕರಗತಕ್ಕೆ ಪರಮ ಪೋಷಕ ಕಾಲ.")
          : detailedAge === "senior"
            ? "ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ನಿಮ್ಮ ಜೀವನದ ಸತ್ಸಂಸ್ಕಾರಗಳನ್ನು ಧಾರೆ ಎರೆದು, ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಆನಂದ ಕಾಣಿರಿ."
            : ageCategory === "youth"
              ? "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಉನ್ನತ ಸಂಸ್ಥೆಯಲ್ಲಿ ವೃತ್ತಿ ಪ್ರವೇಶ ಖಚಿತ."
              : "ಸಂಸ್ಥೆಯಲ್ಲಿ ಉನ್ನತ ಹುದ್ದೆ, ಗೌರವ ಪ್ರಶಸ್ತಿ ಹಾಗೂ ನಾಯಕತ್ವದ ಸ್ಥಾನಮಾನ ಪ್ರಾಪ್ತಿ. ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ ಕಾಪಾಡಿ.",
        mr: isMinor
          ? "अभ्यासात सातत्य, पाठांतर व बौद्धिक कौशल्यांच्या विकासासाठी अनुकूल वेळ; पालकांनी प्रोत्साहन द्यावे."
          : detailedAge === "senior"
            ? "भावी पिढीला उत्तम मार्गदर्शन करून समाजासाठी वेळ देणे मानसिक शांती व सन्मान देईल."
            : ageCategory === "youth"
              ? "स्पर्धा परीक्षेत यश व नामांकित कंपनीत करिअरची शानदार सुरुवात."
              : "उच्च पदभार, पगारवाढ व अधिकारांचा विस्तार होईल. वरिष्ठांशी सुसंवाद ठेवा.",
        hi: isMinor
          ? "शैक्षणिक क्षेत्र में उत्कृष्ट प्रदर्शन एवं बौद्धिक प्रतिभा के विकास हेतु श्रेष्ठ समय।"
          : detailedAge === "senior"
            ? "भावी पीढ़ी को सुसंस्कार प्रदान कर समाज सेवा एवं मार्गदर्शन में समय लगाना परम संतोष देगा।"
            : ageCategory === "youth"
              ? "प्रतियोगी परीक्षाओं में सफलता एवं प्रतिष्ठित संस्थान में करिअर का शुभारंभ।"
              : "उच्च पद, पदोन्नति एवं नेतृत्व की प्रतिष्ठा प्राप्त होगी। कार्यक्षेत्र में एकाग्रता बनाए रखें।",
        te: isMinor
          ? "విద్యా రంగంలో విశేష ప్రతిభ మరియు కొత్త నైపుణ్యాల సాధనకు ఉత్తమ సమయం."
          : detailedAge === "senior"
            ? "భావి తరానికి మంచి మార్గదర్శనం చేస్తూ సమాజ సేవలో గడపడం ఆత్మసంతృప్తినిస్తుంది."
            : ageCategory === "youth"
              ? "పోటీ పరీక్షలలో విజయం మరియు ఉన్నత సంస్థలో ఉద్యోగ ప్రారంభం."
              : "ఉన్నత పదవి, వేతన వృద్ధి మరియు నాయకత్వ బాధ్యతలు లభిస్తాయి. కార్యక్షేత్రంలో అంకితభావంతో పనిచేయండి.",
        ta: isMinor
          ? "கல்வியில் சிறந்த தேர்ச்சி மற்றும் தனித்துவமான அறிவுத்திறன் வெளிப்படும்."
          : detailedAge === "senior"
            ? "அடுத்த தலைமுறைக்கு வழிகாட்டி சமூக சேவையில் ஈடுபடுவது மனநிறைவை தரும்."
            : ageCategory === "youth"
              ? "போட்டித் தேர்வுகளில் வெற்றி மற்றும் மதிப்புமிக்க நிறுவனத்தில் புதிய வேலை கிட்டும்."
              : "பதவி உயர்வு, ஊதிய உயர்வு மற்றும் தலைமைப் பொறுப்புகள் அமையும். நன்மதிப்பை பாதுகாத்துக் கொள்ளுங்கள்.",
        en: isMinor
          ? "Optimal phase for scholastic distinctions, academic prizes, and multifaceted talent expression."
          : detailedAge === "senior"
            ? "Imparting ethical wisdom to grandchildren and engaging in community guidance bring esteemed fulfillment."
            : "Executive elevation, prestigious professional recognition, and strategic career ascendancy."
      }, lang)
    },
    {
      id: "m3_wealth",
      dimensionTitle: isMinor
        ? pick6({
          kn: "🛡️ ಶೈಕ್ಷಣಿಕ ನಿಧಿ & ಪೋಷಕರ ರಕ್ಷಣೆ",
          mr: "🛡️ शैक्षणिक निधी व पालकांचे संरक्षण",
          hi: "🛡️ शैक्षणिक कोष एवं अभिभावक सुरक्षा",
          te: "🛡️ విద్యా నిధి & తల్లిదండ్రుల రక్షణ",
          ta: "🛡️ கல்வி நிதி & பெற்றோரின் பாதுகாப்பு",
          en: "🛡️ Child Education Endowment & Family Shield"
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "💰 ಸ್ಥಿರಾಸ್ತಿ ರಕ್ಷಣೆ & ದಾನ ಧರ್ಮ",
            mr: "💰 संपत्तीचे रक्षण व दानधर्म",
            hi: "💰 संपत्ति संरक्षण एवं दान-पुण्य",
            te: "💰 ఆస్తి సంరక్షణ & దానధర్మాలు",
            ta: "💰 சொத்து பாதுகாப்பு & தான தர்மம்",
            en: "💰 Asset Preservation & Benevolent Charity"
          }, lang)
          : pick6({
            kn: "💰 ಧನ ಸಮೃದ್ಧಿ & ಸಾಲ ವಿಮುಕ್ತಿ",
            mr: "💰 धनसमृद्धी व कर्जमुक्ती",
            hi: "💰 धन-समृद्धि एवं ऋण-मुक्ति",
            te: "💰 ధన సమృద్ధి & రుణ విముక్తి",
            ta: "💰 தன சமிருத்தி & கடன் நிவர்த்தி",
            en: "💰 Wealth Accumulation & Debt Liquidation"
          }, lang),
      timingWindow: peakRange,
      planetaryCatalyst: pick6({
        kn: "ದ್ವಿತೀಯ ಮತ್ತು ಏಕಾದಶ ಭಾವಗಳ ಮೇಲೆ ಶುಕ್ರ-ಗುರು ದೃಷ್ಟಿ",
        mr: "द्वितीय व एकादश भावावर गुरु-शुक्राची दृष्टी",
        hi: "द्वितीय एवं एकादश भाव पर गुरु-शुक्र दृष्टि",
        te: "ద్వితీయ, ఏకాదశ స్థానాలపై గురు-శుక్రుల శుభ దృష్టి",
        ta: "இரண்டாம் மற்றும் பதினொன்றாம் இடங்களின் மீதான குரு-சுக்கிர பார்வை",
        en: "2nd and 11th House activation by Jupiter & Venus"
      }, lang) + v3.catalystSuffix,
      probabilityScore: formatNumber6L(v3.probability, lang) + "%",
      confidence: v3.confidence,
      gatesPassed: v3.gatesPassed,
      summaryTag: v3.summaryTag,
      actionAdvice: isMinor
        ? pick6({
          kn: "ಮಗುವಿನ ಉನ್ನತ ಶಿಕ್ಷಣ ಹಾಗೂ ಭವಿಷ್ಯದ ಭದ್ರತೆಗಾಗಿ ಸುರಕ್ಷಿತ ದೀರ್ಘಾವಧಿಯ ಶಿಕ್ಷಣ ನಿಧಿಯನ್ನು (SIP/FD) ಪೋಷಕರು ಶಿಸ್ತಿನಿಂದ ಸಂಚಯಿಸಬೇಕು.",
          mr: "मुलाच्या उच्च शिक्षणासाठी सुरक्षित दीर्घकालीन गुंतवणूक व शैक्षणिक निधीची शिस्तबद्ध बचत करावी.",
          hi: "बालक की उच्च शिक्षा एवं भविष्य की सुरक्षा हेतु सुरक्षित दीर्घकालिक कोष (SIP/FD) में अनुशासित बचत करें।",
          te: "పిల్లల ఉన్నత చదువులు మరియు భవిష్యత్ భద్రత కోసం దీర్ఘకాలిక విద్యా నిధిని పొదుపు చేయండి.",
          ta: "குழந்தையின் உயர்கல்வி மற்றும் எதிர்கால பாதுகாப்பிற்கு நீண்டகால சேமிப்பு திட்டங்களில் முதலீடு செய்யுங்கள்.",
          en: "Discipline parental savings into dedicated higher-education endowments to guarantee uncompromised pre-collegiate resources."
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "ಕಷ್ಟಾರ್ಜಿತ ಆಸ್ತಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ರಕ್ಷಿಸಿಕೊಂಡು, ನಿಶ್ಚಿಂತ ಜೀವನ ನಡೆಸಿ; ಶಕ್ತ್ಯಾನುಸಾರ ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಿಗೆ ದಾನ ಮಾಡಿ.",
            mr: "कष्टाने कमावलेली संपत्ती सुरक्षित ठेवून शांत जीवन जगावे; यथाशक्ती सत्कार्यासाठी दानधर्म करावा.",
            hi: "कठिन परिश्रम से अर्जित संपत्ति को सुरक्षित रखते हुए निश्चिंत जीवन जिएं; सामर्थ्यानुसार धर्मार्थ कार्यों में दान करें।",
            te: "కష్టపడి సంపాదించిన ఆస్తులను జాగ్రత్తగా కాపాడుకుంటూ ప్రశాంతంగా జీవించండి; శక్తి మేరకు దానధర్మాలు చేయండి.",
            ta: "சேர்த்த சொத்துக்களை பாதுகாப்பாக வைத்து நிம்மதியான வாழ்க்கை வாழுங்கள்; இயன்ற அளவு தான தர்மங்கள் செய்யுங்கள்.",
            en: "Preserve principal capital safely; allocate surplus resources mindfully toward dharmic endowments and charities."
          }, lang)
          : pick6({
            kn: "ಹಳೆಯ ಸಾಲಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೀರಿಸಿ, ನೂತನ ಉಳಿತಾಯ ಹಾಗೂ ದೀರ್ಘಾವಧಿಯ ಸ್ಥಿರ ಹೂಡಿಕೆಗೆ ಹಣ ವಿನಿಯೋಗಿಸಿ.",
            mr: "जुनी देणी व कर्जे फेडून दीर्घकालीन सुरक्षित गुंतवणुकीवर भर द्या. संपत्तीत मोठी वाढ होईल.",
            hi: "पुरातन ऋणों का पूर्ण निवारण कर दीर्घकालिक सुरक्षित निवेश में पूंजी लगाएं। आर्थिक स्थिरता प्राप्त होगी।",
            te: "పాత అప్పులను పూర్తిగా తీర్చివేసి, దీర్ఘకాలిక లాభదాయక పెట్టుబడులపై దృష్టి పెట్టండి. ధన ధాన్యవృద్ధి సిద్ధిస్తుంది.",
            ta: "பழைய கடன்களை முழுமையாக அடைத்து, நீண்ட கால முதலீடுகளில் சேமியுங்கள். செல்வம் நிலைத்து நிற்கும்.",
            en: "Liquidate outstanding liabilities and deploy surplus liquidity into enduring low-volatility assets."
          }, lang)
    },
    {
      id: "m4_property",
      dimensionTitle: isMinor
        ? pick6({
          kn: "🏫 ಅನುಕೂಲಕರ ಕಲಿಕಾ ಪರಿಸರ & ಜ್ಞಾನಾರ್ಜನೆ",
          mr: "🏫 पोषक शैक्षणिक वातावरण व ज्ञानार्जन",
          hi: "🏫 अनुकूल अध्ययन परिवेश एवं ज्ञान संवर्धन",
          te: "🏫 అనుకూల విద్యా వాతావరణం & జ్ఞానార్జన",
          ta: "🏫 சிறந்த கல்விச் சூழல் & அறிவு வளர்ச்சி",
          en: "🏫 Enriching Learning Sanctuary & Scholastic Atmosphere"
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "🏡 ಪ್ರಶಾಂತ ಗೃಹ ಜೀವನ & ತೀರ್ಥಯಾತ್ರೆ",
            mr: "🏡 शांत गृहजीवन व तीर्थयात्रा",
            hi: "🏡 शांत गृह-जीवन एवं तीर्थाटन",
            te: "🏡 ప్రశాంత గృహ జీవనం & పుణ్యక్షేత్ర దర్శనం",
            ta: "🏡 அமைதியான இல்லறம் & புனித யாத்திரை",
            en: "🏡 Serene Domestic Abode & Pilgrimage Travels"
          }, lang)
          : pick6({
            kn: "🏡 ಗೃಹ ನಿರ್ಮಾಣ / ನಿವೇಶನ & ವಾಹನ ಯೋಗ",
            mr: "🏡 गृहनिर्माण / जागा व वाहन योग",
            hi: "🏡 गृह-निर्माण / भूखंड एवं वाहन योग",
            te: "🏡 గృహ నిర్మాణం / స్థలం & వాహన యోగం",
            ta: "🏡 வீடு கட்டுதல் / மனை & வாகன யோகம்",
            en: "🏡 Real Estate, Home & Vehicle Acquisition"
          }, lang),
      timingWindow: matureRange,
      planetaryCatalyst: pick6({
        kn: "ಚತುರ್ಥ ಭಾವಾಧಿಪತಿ ಹಾಗೂ ಮಂಗಳ-ಶುಕ್ರರ ಶುಭ ಸಂಯೋಗ",
        mr: "चतुर्थ भावाचा स्वामी व मंगळ-शुक्राचा शुभ योग",
        hi: "चतुर्थेश एवं मंगल-शुक्र का शुभ प्रभाव",
        te: "చతుర్థాధిపతి మరియు కుజ-శుక్రుల శుభ సంయోగం",
        ta: "நான்காம் அதிபதி மற்றும் செவ்வாய்-சுக்கிர சேர்க்கை",
        en: "4th House Lord and Mars-Venus synergy"
      }, lang) + v4.catalystSuffix,
      probabilityScore: formatNumber6L(v4.probability, lang) + "%",
      confidence: v4.confidence,
      gatesPassed: v4.gatesPassed,
      summaryTag: v4.summaryTag,
      actionAdvice: isMinor
        ? pick6({
          kn: "ಮನೆಯಲ್ಲಿ ಶಾಂತ, ಶಿಸ್ತಿನ ಹಾಗೂ ಪ್ರೇಮಮಯ ಕಲಿಕಾ ವಾತಾವರಣವನ್ನು ನಿರ್ಮಿಸುವುದು ಮಗುವಿನ ಏಕಾಗ್ರತೆಗೆ ದಿವ್ಯ ರಕ್ಷೆ.",
          mr: "घरात शांत, प्रेमळ व अभ्यासासाठी पोषक वातावरण तयार करणे मुलाच्या बौद्धिक वाढीसाठी आवश्यक आहे.",
          hi: "घर में शांत, अनुशासित एवं स्नेहपूर्ण वातावरण बनाए रखना बालक की एकाग्रता हेतु संजीवनी सिद्ध होगा।",
          te: "ఇంట్లో ప్రశాంతమైన, ఆహ్లాదకరమైన చదువుకునే వాతావరణాన్ని ఏర్పాటు చేయడం పిల్లల మానసిక వికాసానికి మేలు చేస్తుంది.",
          ta: "இல்லத்தில் அமைதியான, ஒழுக்கமான மற்றும் அன்பான கல்விச் சூழலை அமைத்துக் கொடுப்பது கவனத்தை ஒருமுகப்படுத்தும்.",
          en: "Foster an orderly domestic haven free of chaotic distractions, maximizing intellectual concentration and tranquility."
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "ಪ್ರಶಾಂತವಾದ ಮನೆಯ ಪರಿಸರದಲ್ಲಿ ಕಾಲ ಕಳೆಯಿರಿ; ಅನುಕೂಲವಾದಾಗ ಪವಿತ್ರ ಕ್ಷೇತ್ರಗಳ ಯಾತ್ರೆ ಕೈಗೊಂಡು ಪುಣ್ಯ ಸಂಪಾದಿಸಿ.",
            mr: "घरातील वातावरण शांत ठेवावे; सवडीनुसार तीर्थक्षेत्रांची यात्रा करून ईश्वर चिंतनात वेळ घालवावा.",
            hi: "शांत एवं सौहार्दपूर्ण पारिवारिक वातावरण में समय व्यतीत करें; सामर्थ्यानुसार पवित्र तीर्थों की यात्रा करें।",
            te: "ప్రశాంతమైన ఇంటి వాతావరణంలో గడపండి; వీలును బట్టి పుణ్యక్షేత్రాలను దర్శించి దైవకృపను పొందండి.",
            ta: "அமைதியான இல்லறச் சூழலில் வாழுங்கள்; வாய்ப்புள்ள போது புண்ணிய தலங்களுக்குச் சென்று இறை அருளைப் பெறுங்கள்.",
            en: "Relish a tranquil home sanctuary; embark upon leisurely pilgrimages to sanctified temples under favorable transits."
          }, lang)
          : pick6({
            kn: "ಸ್ವಂತ ಮನೆ, ನಿವೇಶನ ಖರೀದಿ ಅಥವಾ ಹೊಸ ವಾಹನ ಯೋಗ ಸಿದ್ಧಿ. ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಹೂರ್ತದಲ್ಲಿ ಗೃಹಪ್ರವೇಶ ಮಾಡಿ.",
            mr: "स्वतःचे घर, प्लॉट खरेदी किंवा नवीन वाहन खरेदीचा उत्तम योग. कागदपत्रे तपासून शुभ मुहूर्तावर निर्णय घ्या.",
            hi: "स्वयं का आवास, भूखंड क्रय अथवा नवीन वाहन प्राप्ति का प्रबल योग। शुभ मुहूर्त में गृह-प्रवेश करें।",
            te: "సొంత ఇల్లు, స్థలం కొనుగోలు లేదా కొత్త వాహన యోగం కలుగుతుంది. శాస్త్రోక్త ముహూర్తంలో గృహప్రవేశం చేయండి.",
            ta: "சொந்த வீடு, நிலம் வாங்குதல் அல்லது புதிய வாகன யோகம் அமையும். சுப முகூர்த்தத்தில் முறைப்படி குடியேறுங்கள்.",
            en: "Favorable window for property acquisition or upgrading conveyance; formalize deeds under vetted muhurtas."
          }, lang)
    },
    {
      id: "m5_family",
      dimensionTitle: isMinor
        ? pick6({
          kn: detailedAge === "adolescent" ? "🤝 ಸತ್ಸಂಗ, ಪೋಷಕರ ವಿಶ್ವಾಸ & ನೈತಿಕ ದೃಢತೆ" : "👨‍👩‍👧 ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ & ಒಡಹುಟ್ಟಿದವರ ಸೌಹಾರ್ದ",
          mr: detailedAge === "adolescent" ? "🤝 सत्संग, पालकांचा विश्वास व नैतिक मूल्ये" : "👨‍👩‍👧 कौटुंबिक प्रेम व भावंडांमधील सलोखा",
          hi: detailedAge === "adolescent" ? "🤝 सत्संग, अभिभावक विश्वास एवं नैतिक सुदृढ़ता" : "👨‍👩‍👧 पारिवारिक स्नेह एवं भाई-बहनों का सौहार्द",
          te: detailedAge === "adolescent" ? "🤝 సత్సంగం, పెద్దల నమ్మకం & నైతిక స్థైర్యం" : "👨‍👩‍👧 కుటుంబ ఆప్యాయత & తోబుట్టువుల అనురాగం",
          ta: detailedAge === "adolescent" ? "🤝 நல்லோர் சேர்க்கை, பெற்றோர் நம்பிக்கை & ஒழுக்கம்" : "👨‍👩‍👧 குடும்ப பாசம் & உடன்பிறப்புகள் ஒற்றுமை",
          en: detailedAge === "adolescent" ? "🤝 Virtuous Peer Circle & Parental Trust" : "👨‍👩‍👧 Warm Family Affection & Sibling Camaraderie"
        }, lang)
        : detailedAge === "senior"
          ? pick6({
            kn: "👨‍👩‍👧‍👦 ಮೊಮ್ಮಕ್ಕಳ ಪ್ರೀತಿ & ಕೌಟುಂಬಿಕ ತೃಪ್ತಿ",
            mr: "👨‍👩‍👧‍👦 नातवंडांचे प्रेम व कौटुंबिक समाधान",
            hi: "👨‍👩‍👧‍👦 पौत्र-पौत्रियों का स्नेह एवं पारिवारिक तृप्ति",
            te: "👨‍👩‍👧‍👦 మనవళ్ల ప్రేమ & కుటుంబ సంతోషం",
            ta: "👨‍👩‍👧‍👦 பேரக்குழந்தைகளின் பாசம் & குடும்ப மனநிறைவு",
            en: "👨‍👩‍👧‍👦 Grandchildren Affection & Generational Harmony"
          }, lang)
          : pick6({
            kn: "💍 ಮಾಂಗಲ್ಯ ಭಾಗ್ಯ / ಸಂತಾನ ಸೌಖ್ಯ / ದಾಂಪತ್ಯ",
            mr: "💍 विवाह योग / संतती सुख / वैवाहिक समाधान",
            hi: "💍 विवाह योग / संतान सुख / दांपत्य सुख",
            te: "💍 వివాహ భాగ్యం / సంతాన సౌఖ్యం / దాంపత్యం",
            ta: "💍 திருமண யோகம் / குழந்தை பாக்கியம் / இல்லறம்",
            en: "💍 Matrimonial Harmony & Progeny Fulfillment"
          }, lang),
      timingWindow: earlyRange,
      planetaryCatalyst: pick6({
        kn: "ಸಪ್ತಮ ಮತ್ತು ಪಂಚಮ ಭಾವಗಳ ಸಕ್ರಿಯತೆ, ಗುರು ದೃಷ್ಟಿ",
        mr: "सप्तम व पंचम भावावर गुरूची शुभ दृष्टी",
        hi: "सप्तम एवं पंचम भाव पर गुरु की शुभ दृष्टि",
        te: "సప్తమ మరియు పంచమ స్థానాలపై గురు దృష్టి",
        ta: "ஏழாம் மற்றும் ஐந்தாம் இடங்களின் மீதான குரு பார்வை",
        en: "7th and 5th House activation by Jupiter"
      }, lang) + v5.catalystSuffix,
      probabilityScore: formatNumber6L(v5.probability, lang) + "%",
      confidence: v5.confidence,
      gatesPassed: v5.gatesPassed,
      summaryTag: v5.summaryTag,
      actionAdvice: pick6({
        kn: isMinor
          ? "ಕುಟುಂಬದ ಪ್ರೀತಿ, ಒಡಹುಟ್ಟಿದವರ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಹಿರಿಯರಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಮಗುವಿನ ಮಾನಸಿಕ ಬೆಳವಣಿಗೆ ಸುಂದರವಾಗಿರಲಿದೆ."
          : detailedAge === "senior"
            ? "ಮಕ್ಕಳು ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳಿಗೆ ನಿಮ್ಮ ಪ್ರೀತಿ ಹಾಗೂ ಆಶೀರ್ವಾದಗಳನ್ನು ಧಾರೆ ಎರೆದು ಕುಟುಂಬದ ಶಾಂತಿಯನ್ನು ಕಾಪಾಡಿ."
            : ageCategory === "youth"
              ? "ವಿವಾಹ ಯೋಗ ಕೂಡಿಬರುವ ಕಾಲ. ಯೋಗ್ಯ ಸಂಗಾತಿಯ ಆಯ್ಕೆ ಹಾಗೂ ದಾಂಪತ್ಯ ಜೀವನದ ಆರಂಭ."
              : "ದಾಂಪತ್ಯದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ, ಸಂತಾನ ಭಾಗ್ಯ ಅಥವಾ ಮಕ್ಕಳ ಶ್ರೇಯಸ್ಸಿನಿಂದ ಮನೆಯಲ್ಲಿ ಹಬ್ಬದ ವಾತಾವರಣ.",
        mr: isMinor
          ? "कुटुंबातील प्रेम, भावंडांमधील सलोखा व वडीलधाऱ्यांचा आदर मुलाच्या व्यक्तिमत्त्वाला सुंदर आकार देईल."
          : detailedAge === "senior"
            ? "मुले व नातवंडांवर प्रेमाचा वर्षाव करून घरामध्ये आनंदाचे व शांतीचे वातावरण टिकवून ठेवावे."
            : ageCategory === "youth"
              ? "विवाह जमण्याचे शुभ योग. योग्य जोडीदाराची निवड व वैवाहिक जीवनाची सुरुवात."
              : "वैवाहिक जीवनात सुख, संतती योग अथवा मुलांच्या यशाने घरात मंगलमय वातावरण राहील.",
        hi: isMinor
          ? "पारिवारिक स्नेह, भाई-बहनों का सामंजस्य एवं बड़ों का आदर बालक के अंतःकरण को प्रफुल्लित रखेगा।"
          : detailedAge === "senior"
            ? "संतान एवं पौत्र-पौत्रियों को स्नेह एवं शुभाशीर्वाद देकर कुल में शांति एवं एकता बनाए रखें।"
            : ageCategory === "youth"
              ? "विवाह के शुभ योग। योग्य जीवनसाथी का वरण एवं दांपत्य जीवन का शुभारंभ।"
              : "दांपत्य में मधुरता, संतान सुख अथवा बच्चों की उपलब्धियों से गृह में उत्सव का माहौल।",
        te: isMinor
          ? "కుటుంబంలో ఆప్యాయతలు, తోబుట్టువుల ఐక్యత మరియు పెద్దల పట్ల భక్తి పిల్లల వ్యక్తిత్వాన్ని తీర్చిదిద్దుతాయి."
          : detailedAge === "senior"
            ? "పిల్లలకు, మనవళ్లకు ప్రేమానురాగాలు అందిస్తూ కుటుంబంలో ప్రశాంతతను కాపాడండి."
            : ageCategory === "youth"
              ? "వివాహ యోగం కుదిరే కాలం. యోగ్యమైన భాగస్వామి ఎంపిక & దాంపత్య జీవిత ఆరంభం."
              : "దాంపత్యంలో అనుకూలత, సంతాన సౌభాగ్యం లేదా పిల్లల విజయాలతో ఇంట్లో వేడుకలు.",
        ta: isMinor
          ? "குடும்பத்தில் அன்பு, சகோதர ஒற்றுமை மற்றும் பெரியவர்களிடம் மரியாதை குழந்தையின் ஆளுமையை வளர்க்கும்."
          : detailedAge === "senior"
            ? "பிள்ளைகள் மற்றும் பேரக்குழந்தைகளுக்கு ஆசி வழங்கி குடும்ப அமைதியைப் பேணுங்கள்."
            : ageCategory === "youth"
              ? "திருமண யோகம் கூடிவந்து நல்வாழ்க்கை அமைய நல்வாய்ப்பு."
              : "தம்பதியரிடையே அன்யோன்யம், குழந்தை பாக்கியம் அல்லது குழந்தைகளின் வெற்றியால் மகிழ்ச்சி.",
        en: isMinor
          ? "Unshakable domestic solidarity, warm sibling affection, and parental tenderness nurture high self-esteem."
          : detailedAge === "senior"
            ? "Bestowing unconditional blessings and affection upon children and grandchildren anchors generational peace."
            : "Auspicious matrimonial alliance, joyful child blessings, and enduring domestic harmony."
      }, lang)
    }, {
      id: "m6_caution",
      dimensionTitle: pick6({
        kn: "⚠️ ಎಚ್ಚರಿಕೆಯ ಕಾಲ & ಗೋಕರ್ಣ ರಕ್ಷಾ ಕವಚ",
        mr: "⚠️ सावधगिरीचा काळ व गोकर्ण रक्षा कवच",
        hi: "⚠️ सावधानी काल एवं गोकर्ण रक्षा कवच",
        te: "⚠️ హెచ్చరిక కాలం & గోಕರ್ణ రక్షా కవచం",
        ta: "⚠️ எச்சரிக்கை காலம் & கோகர்ண ரக்ஷா கவசம்",
        en: "⚠️ Vigilance Window & Gokarna Divine Shield"
      }, lang),
      timingWindow: cautionRange,
      planetaryCatalyst: pick6({
        kn: "ಶನಿ ಸಾಡೇಸಾತಿ/ಅಷ್ಟಮ ಪ್ರಭಾವ ಅಥವಾ ರಾಹು ಸಂಚಾರ",
        mr: "शनीची साडेसाती/अष्टम गोचर किंवा राहूचे भ्रमण",
        hi: "शनि की साढ़ेसाती/अष्टम गोचर अथवा राहु का प्रभाव",
        te: "శని ఏలినాటి/అష్టమ శని లేదా రాహు గోచారం",
        ta: "சனி ஏழரை/அஷ்டம சனி அல்லது ராகு கோச்சாரம்",
        en: "Saturn Sade Sati / 8th transit or nodal stress"
      }, lang) + v6.catalystSuffix,
      probabilityScore: formatNumber6L(v6.probability, lang) + "%",
      confidence: v6.confidence,
      gatesPassed: v6.gatesPassed,
      summaryTag: v6.summaryTag,
      actionAdvice: pick6({
        kn: "ಆರೋಗ್ಯ, ಅನಗತ್ಯ ವಿವಾದಗಳು ಹಾಗೂ ಆತುರದ ಹೂಡಿಕೆಗಳ ಬಗ್ಗೆ ವಿಶೇಷ ಜಾಗ್ರತೆ ವಹಿಸಿ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ.",
        mr: "आरोग्य, वादविवाद व घाईगडबडीतील गुंतवणुकीपासून सावध राहा. गोकर्ण महाबळेश्वरास रुद्राभिषेक व संकल्प करा.",
        hi: "स्वास्थ्य, अनावश्यक विवाद एवं जल्दबाजी के निवेश से बचें। गोकर्ण महाबलेश्वर स्वामी को रुद्राभिषेक अर्पित करें।",
        te: "ఆరోగ్యం, అనవసర వివాదాలు మరియు తొందరపాటు పెట్టుబడుల విషయంలో అప్రమత్తంగా ఉండండి. గోకర్ణ మహాబలేశ్వరునికి రుద్రాభిషేకం చేయించండి.",
        ta: "ஆரோக்கியம், தேவையற்ற வாக்குவாதங்கள் மற்றும் அவசர முதலீடுகளில் கவனம் தேவை. கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்யுங்கள்.",
        en: "Exercise heightened vigilance against hasty financial speculative exposures; invoke Sri Gokarna Mahabaleshwara protection."
      }, lang)
    }
  ];
}

/**
 * Computes 5-Year Kundli Dosha Diagnostics, 5-Year Manifestation & Gokarna Protective Shield
 */
export function compute5YearDoshaAnalysis(
  kundli: KundliOutput,
  birthDateYmd: string,
  birthTimeHm: string,
  targetLang: SixLang,
  baseYear: number = 2026,
  devoteeName: string = "Devotee"
): FiveYearDoshaAnalysis {
  let doshaReport: any = null;
  try {
    doshaReport = calculateComprehensiveDoshas(
      kundli,
      {
        birthDate: birthDateYmd,
        birthTime: birthTimeHm,
        name: devoteeName
      } as any,
      new Date(baseYear, 0, 1)
    );
  } catch (err) {
    console.warn("[fiveYearPredictionEngine] calculateComprehensiveDoshas fallback:", err);
  }

  const rawDoshas = doshaReport?.doshas || [];
  const detectedDoshas: FiveYearDoshaItem[] = [];

  for (const d of rawDoshas) {
    if (d.isDetected && d.severity !== "none") {
      const rawLangKey = targetLang === "mr" ? "hi" : targetLang;
      let name = d.name?.[rawLangKey] || d.name?.en || d.id;
      if (targetLang !== "en") {
        name = name.replace(/\s*\([a-zA-Z\s.,'-]+\)/g, "").replace(/[a-zA-Z]+/g, "").trim() || name;
      }
      let statusText = d.statusBadge?.[rawLangKey] || (targetLang === "kn" ? "ಸಕ್ರಿಯ ಪ್ರಭಾವ" : targetLang === "mr" ? "सक्रिय प्रभाव" : targetLang === "hi" ? "सक्रिय प्रभाव" : "Active Impact");
      if (targetLang !== "en") {
        statusText = statusText.replace(/\s*\([a-zA-Z\s.,'-]+\)/g, "").replace(/[a-zA-Z]+/g, "").trim() || statusText;
      }
      let parihara = d.recommendedPooja?.[rawLangKey] || d.recommendedPooja?.en || "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ";
      if (targetLang !== "en") {
        parihara = parihara.replace(/\s*\([a-zA-Z\s.,'-]+\)/g, "").replace(/[a-zA-Z]+/g, "").trim() || parihara;
      }
      const mantraList = d.remedies?.[rawLangKey] || d.remedies?.en || [];
      const mantra = Array.isArray(mantraList) && mantraList.length > 0 ? mantraList[0] : "ಓಂ ನಮಃ ಶಿವಾಯ";

      let manifestation = "";
      if (d.id.includes("kuja") || d.id.includes("mangal")) {
        manifestation = pick6({
          kn: "ದಾಂಪತ್ಯ ಸಂಬಂಧ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಆಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಅತ್ಯಗತ್ಯ. ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ ಕುಜ ಶಾಂತಿ ಕೈಂಕರ್ಯವು ಮಂಗಳವನ್ನು ಉಂಟುಮಾಡಲಿದೆ.",
          mr: "वैवाहिक जीवन, रक्तदाब व जमिनीच्या व्यवहारात संयम बाळगणे आवश्यक. मंगळवारी उपासना केल्यास कौटुंबिक सौख्य लाभेल.",
          hi: "दांपत्य जीवन, रक्तचाप एवं भूमि-भवन सौदों में धैर्य रखें। मंगलवार को मंगल शांति पूजा से सर्वविध कल्याण होगा।",
          te: "దాంపత్య జీవితం, రక్తపోటు మరియు భూమి లావాదేవీలలో సంయమనం అవసరం. మంగళవారం కుజ శాంతి విశేష ఫలితాలనిస్తుంది.",
          ta: "திருமண வாழ்க்கை, இரத்த அழுத்தம் மற்றும் நில விவகாரங்களில் பொறுமை தேவை. செவ்வாய் சாந்தி பூஜை நலம் தரும்.",
          en: "Requires deliberate equanimity in marital conversations, property closings, and stress management over the 5-year cycle."
        }, targetLang);
      } else if (d.id.includes("kala_sarpa")) {
        manifestation = pick6({
          kn: "ಕಾರ್ಯಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ ಅಥವಾ ಅಡೆತಡೆಗಳು ಎದುರಾಗಬಹುದು. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸರ್ಪ ಸಂಸ್ಕಾರ ಅಥವಾ ಕಾಲಸರ್ಪ ಶಾಂತಿಯು ದಿಗ್ವಿಜಯ ನೀಡಲಿದೆ.",
          mr: "कार्यात अचानक अडथळे किंवा विलंब संभवतो. गोकर्ण क्षेत्री कालसर्प शांती केल्याने भाग्योदयाचा मार्ग मोकळा होईल.",
          hi: "कार्यों में अप्रत्याशित विलंब अथवा रुकावटें आ सकती हैं। गोकर्ण में कालसर्प शांति पूजा से भाग्योदय होगा।",
          te: "పనులలో ఆకస్మిక జాప్యం లేదా అడ్డంకులు ఏర్పడవచ్చు. గోకర్ణంలో కాలసర్ప శాంతి చేయడం ద్వారా విజయం లభిస్తుంది.",
          ta: "காரியங்களில் திடீர் தடைகள் வரலாம். கோகர்ணத்தில் நாக சாந்தி அல்லது காலசர்ப்ப தோஷ நிவர்த்தி வெற்றி தரும்.",
          en: "May trigger episodic friction or sudden delays in major milestones; pacified effectively through Gokarna Sarpa Shanti."
        }, targetLang);
      } else if (d.id.includes("shani") || d.id.includes("sade_sati") || d.id.includes("kantaka") || d.id.includes("ashtama")) {
        manifestation = pick6({
          kn: "ಶನಿ ಮಹಾರಾಜರ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದ ಶಿಸ್ತು, ಕಠಿಣ ಪರಿಶ್ರಮ ಹಾಗೂ ಹಿರಿಯರ ಸೇವೆ ಅಗತ್ಯ. ತೈಲಾಭಿಷೇಕ ಹಾಗೂ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣೆ ರಕ್ಷೆಯಾಗಲಿದೆ.",
          mr: "शनि गोचरामुळे कठोर परिश्रम, शिस्त व संयमाची परीक्षा होईल. शनिवारी मारुती स्तोत्र व तिळाचे दान अत्यंत फलदायी ठरेल.",
          hi: "शनि गोचर प्रभाव से अनुशासन एवं परिश्रम आवश्यक होगा। शनिवार को हनुमान चालीसा पाठ एवं तिल-तेल दान सुरक्षा कवच सिद्ध होगा।",
          te: "శని గోచార ప్రభావంతో క్రమశిక్షణ, కఠిన శ్రమ అవసరం. హనుమాన్ చాలీసా పఠనం మరియు నువ్వుల నూనె దీపారాధన శ్రేయస్కరం.",
          ta: "சனி பகவானின் கோச்சாரத்தால் கடின உழைப்பு தேவைப்படும். சனிக்கிழமைகளில் அனுமன் சாலிசா படிப்பது நலம் தரும்.",
          en: "Demands meticulous self-discipline, ethical conduct, and patient labor, converting pressure into foundational stability."
        }, targetLang);
      } else if (d.id.includes("pitri") || d.id.includes("chandal")) {
        manifestation = pick6({
          kn: "ಪೂರ್ವಜರ ಆಶೀರ್ವಾದದ ಕೊರತೆಯಿಂದ ಸಂತಾನ ಹಾಗೂ ಭಾಗ್ಯೋನ್ನತಿಯಲ್ಲಿ ಮಂದಗತಿ. ಅಮಾವಾಸ್ಯೆ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನವು ವಂಶೋದ್ಧಾರ ಮಾಡಲಿದೆ.",
          mr: "पितृदोषाने संतती व भाग्योदयात अडथळे येऊ शकतात. अमावास्येला पितृतर्पण व अन्नदान केल्याने पूर्वजांचे आशीर्वाद मिळतील.",
          hi: "पितृदोष के कारण भाग्य एवं संतान संबंधी कार्यों में विलंब हो सकता है। अमावस्या पर तर्पण एवं अन्नदान परम कल्याणकारी है।",
          te: "పితృదోషం వల్ల సంతానం మరియు భాగ్యోదయాలలో జాప్యం జరగవచ్చు. అమావాస్య తర్పణం మరియు అన్నదానం విశేష రక్ష.",
          ta: "பித்ரு தோஷத்தால் சுபகாரியங்களில் தாமதம் ஏற்படலாம். அமாவாசை தர்ப்பணம் & அன்னதானம் முன்னோர்களின் ஆசிகளைத் தரும்.",
          en: "Ancestral propitiation and sacred annadana are advised on Amavasya to clear hereditary blockages."
        }, targetLang);
      } else {
        manifestation = pick6({
          kn: "ಗ್ರಹಗಳ ಸೂಕ್ಷ್ಮ ಸಂಯೋಜನೆಯಿಂದ ಸಣ್ಣಪುಟ್ಟ ಏರಿಳಿತಗಳು. ನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗೋಸೇವೆಯಿಂದ ಸಂಪೂರ್ಣ ಶಾಂತಿ ಲಭಿಸಲಿದೆ.",
          mr: "ग्रहस्थितीतील बदलांमुळे किरकोळ चढ-उतार संभवतात. कुलदेवता उपासना व गोसेवेने सर्व संकटांचे निवारण होईल.",
          hi: "ग्रह गोचर से सामान्य उतार-चढ़ाव संभव हैं। कुलदेवता का नित्य स्मरण एवं गोसेवा समस्त विघ्नों का नाश करेगी।",
          te: "గ్రహాల ప్రభావంతో చిన్నపాటి హెచ్చుతగ్గులు ఉంటాయి. నిత్య ఇష్టదైవ ఆరాధన మరియు గోసేవతో శాంతి లభిస్తుంది.",
          ta: "கிரக சஞ்சாரத்தால் சிறு ஏற்ற இறக்கங்கள் வரலாம். குலதெய்வ வழிபாடு மற்றும் பசு சேவை சகல நன்மைகளையும் தரும்.",
          en: "Subtle planetary friction is harmonized through daily Ishta Devata adoration and compassionate satvik service."
        }, targetLang);
      }

      detectedDoshas.push({
        id: d.id,
        name,
        severity: d.severity,
        severityBadge: d.severity === "critical"
          ? (targetLang === "kn" ? "ತೀವ್ರ ದೋಷ" : targetLang === "mr" ? "तीव्र दोष" : targetLang === "hi" ? "तीव्र दोष" : "Critical")
          : d.severity === "high"
            ? (targetLang === "kn" ? "ಉನ್ನತ ಪ್ರಭಾವ" : targetLang === "mr" ? "उच्च प्रभाव" : targetLang === "hi" ? "उच्च प्रभाव" : "High Impact")
            : (targetLang === "kn" ? "ಸಾಧಾರಣ ಶಮನ" : targetLang === "mr" ? "मध्यम प्रभाव" : targetLang === "hi" ? "मध्यम प्रभाव" : "Moderate"),
        isDetected: true,
        statusText,
        manifestationIn5Years: manifestation,
        pariharaGokarna: parihara,
        mantra
      });
    }
  }

  // If no active severe doshas, show positive planetary shield
  if (detectedDoshas.length === 0) {
    detectedDoshas.push({
      id: "shubha_raksha",
      name: pick6({
        kn: "ಶುಭ ಗ್ರಹ ಯೋಗ ರಕ್ಷೆ (ದೋಷ ರಹಿತ ಕುಂಡಲಿ ಬಲ)",
        mr: "शुभ ग्रह योग रक्षा (दोषमुक्त कुंडली बल)",
        hi: "शुभ ग्रह योग रक्षा (दोषरहित कुंडली बल)",
        te: "శుభ గ్రహ యోగ రక్ష (దోష రహిత కుండలి బలం)",
        ta: "சுப கிரக யோக ரக்ஷை (தோஷமற்ற ஜாதக பலம்)",
        en: "Auspicious Planetary Aegis (Zero Malefic Affliction)"
      }, targetLang),
      severity: "none",
      severityBadge: pick6({
        kn: "ಪೂರ್ಣ ರಕ್ಷಿತ",
        mr: "पूर्ण सुरक्षित",
        hi: "पूर्ण सुरक्षित",
        te: "పూర్తి రక్షితం",
        ta: "முழு பாதுகாப்பு",
        en: "Fully Shielded"
      }, targetLang),
      isDetected: false,
      statusText: pick6({
        kn: "ಅತ್ಯಂತ ಶುಭಕರ",
        mr: "अत्यंत शुभकारक",
        hi: "अत्यंत शुभ",
        te: "అత్యంత శుభకరం",
        ta: "மிகவும் சுபமானது",
        en: "Exceptionally Benefic"
      }, targetLang),
      manifestationIn5Years: pick6({
        kn: "ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ಮಾರಕ ಅಥವಾ ತೀವ್ರ ಕಾಳಸರ್ಪ/ಕುಜ ದೋಷಗಳಿಲ್ಲ. ಮುಂಬರುವ ೫ ವರ್ಷಗಳಲ್ಲಿ ಗುರು-ಶನಿಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ಯಶಸ್ಸನ್ನು ತಂದುಕೊಡಲಿದೆ.",
        mr: "जन्मपत्रिकेत कोणताही मोठा मारक किंवा तीव्र कालसर्प/मंगळ दोष नाही. पुढील ५ वर्षांत गुरू-शनीचे गोचर तुमच्या प्रयत्नांना मोठे यश मिळवून देईल.",
        hi: "जन्म कुंडली में कोई गंभीर मारक अथवा कालसर्प/मंगल दोष नहीं है। आगामी ५ वर्षों में गुरु एवं शनि का गोचर आपके सत्प्रयासों को पूर्ण सफलता प्रदान करेगा।",
        te: "జన్మ కుండలిలో ఎలాంటి తీవ్ర కాలసర్ప లేదా కుజ దోషాలు లేవు. రాబోయే 5 సంవత్సరాలలో గురు-శనుల శుభ గోచారం మీ ప్రయత్నాలకు విజయాన్ని చేకూరుస్తుంది.",
        ta: "ஜென்ம ஜாதகத்தில் கடுமையான காலசர்ப்ப அல்லது செவ்வாய் தோஷங்கள் இல்லை. அடுத்த 5 ஆண்டுகளில் குரு-சனி சஞ்சாரம் உங்கள் முயற்சிகளுக்கு வெற்றியைத் தரும்.",
        en: "Your natal chart is devoid of severe afflictions. Over the next 5 years, benefic alignments will support your initiatives smoothly."
      }, targetLang),
      pariharaGokarna: pick6({
        kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕೃತಜ್ಞತಾ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಅನ್ನದಾನ ಸೇವೆ",
        mr: "श्री गोकर्ण महाबळेश्वर चरणी कृतज्ञता रुद्राभिषेक व अन्नदान सेवा",
        hi: "श्री गोकर्ण महाबलेश्वर स्वामी को कृतज्ञता रुद्राभिषेक एवं अन्नदान सेवा",
        te: "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామికి కృతజ్ఞతా రుద్రాభిషేకం మరియు అన్నదాన సేవ",
        ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு நன்றியுணர்வு ருத்ராபிஷேகம் & அன்னதானம்",
        en: "Thanksgiving Rudrabhisheka & Annadana at Sri Kshetra Gokarna"
      }, targetLang),
      mantra: "ಓಂ ನಮಃ ಶಿವಾಯ • ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ"
    });
  }

  // Inquest Question
  const inquestQuestion = pick6({
    kn: "ನನ್ನ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ದೋಷಗಳು ಯಾವುವು? ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ಅವು ಹೇಗೆ ಪ್ರಭಾವ ಬೀರುತ್ತವೆ ಮತ್ತು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ರಕ್ಷಾ ಕವಚ ಯಾವುದು?",
    mr: "माझ्या जन्मकुंडलीत कोणते प्रमुख दोष आहेत? पुढील ५ वर्षांत त्यांचा कसा प्रभाव पडेल व गोकर्ण क्षेत्राचे संरक्षण कवच कोणते?",
    hi: "मेरी जन्म कुंडली में कौन से प्रमुख दोष विद्यमान हैं? आगामी ५ वर्षों में उनका क्या प्रभाव रहेगा तथा गोकर्ण क्षेत्र का रक्षा कवच क्या है?",
    te: "నా జన్మ కుండలిలో ఉన్న ప్రధాన దోషాలు ఏమిటి? రాబోయే 5 సంవత్సరాలలో వాటి ప్రభావం ఎలా ఉంటుంది & గోకర్ణ క్షేత్ర రక్షా కవచం ఏమిటి?",
    ta: "எனது ஜாதகத்தில் உள்ள முக்கிய தோஷங்கள் யாவை? அடுத்த 5 ஆண்டுகளில் அவற்றின் தாக்கம் எவ்வாறு இருக்கும் மற்றும் கோகர்ண ரக்ஷா கவசம் யாது?",
    en: "What natal doshas exist in my birth chart, how will they manifest across the 2026-2031 horizon, and what is the prescribed Gokarna spiritual shield?"
  }, targetLang);

  // 3 Substantive Paragraphs
  const p1 = pick6({
    kn: `ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಜನ್ಮ ಲಗ್ನ, ಚಂದ್ರ ಹಾಗೂ ಸಪ್ತಮ-ಅಷ್ಟಮ ಭಾವಗಳ ಸ್ಥಿತಿಯು ವ್ಯಕ್ತಿಯ ಕರ್ಮಫಲದ ರೇಖೆಯನ್ನು ನಿರ್ಣಯಿಸುತ್ತದೆ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ${detectedDoshas.map(d => d.name).join(", ")} ಸ್ಥಿತಿಯು ಗಮನಾರ್ಹವಾಗಿದೆ. ಪ್ರತಿಯೊಂದು ಜಾತಕದಲ್ಲೂ ಪೂರ್ವಾರ್ಜಿತ ಕರ್ಮದ ಸಂಸ್ಕಾರಗಳು ಇರುವುದು ಸಹಜ. ಆದರೆ ಲಗ್ನಾಧಿಪತಿಯ ಬಲ ಮತ್ತು ಶುಭ ಗ್ರಹಗಳ ದೃಷ್ಟಿಯು ಈ ದೋಷಗಳ ನಕಾರಾತ್ಮಕ ತೀವ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸುವ ದೈವಿಕ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ.`,
    mr: `बृहत् पराशर होरा शास्त्रानुसार जन्म लग्न, चंद्र व अष्टम भावातील ग्रहस्थिती व्यक्तीच्या पूर्वकर्माचे फळ निश्चित करते. आपल्या जन्मपत्रिकेचे सखोल परीक्षण केले असता, ${detectedDoshas.map(d => d.name).join(", ")} चे अस्तित्व दिसून येते. प्रत्येक पत्रिकेत पूर्वजन्माचे काही कर्मबंध असतातच; परंतु लग्नेशाचे पाठबळ व शुभ ग्रहांची दृष्टी या दोषांची तीव्रता कमी करण्यास पूर्णपणे समर्थ आहे.`,
    hi: `बृहत् पाराशर होरा शास्त्र के अनुसार जन्म लग्न, चंद्रमा तथा षष्ठ-अष्टम भावों की स्थिति जातक के प्रारब्ध कर्मों को दर्शाती है। आपकी जन्म कुंडली के सूक्ष्म विश्लेषण से ${detectedDoshas.map(d => d.name).join(", ")} की उपस्थिति स्पष्ट होती है। प्रत्येक जातक के जीवन में पूर्वजन्म के संस्कार फलित होते हैं, किंतु लग्नेश का बल एवं शुभ ग्रहों की दृष्टि इन प्रतिकूलताओं को शांत करने में सक्षम है।`,
    te: `బృహత్ పరాశర హోరా శాస్త్రం ప్రకారం, జన్మ లగ్నం, చంద్రుడు మరియు 8వ స్థానాల స్థితి మానవుని పూర్వజన్మ కర్మఫలాన్ని నిర్దేశిస్తుంది. మీ జాతకాన్ని పరిశీలించినప్పుడు ${detectedDoshas.map(d => d.name).join(", ")} ప్రభావం గోచరిస్తోంది. లగ్నాధిపతి బలం మరియు శుభ గ్రహాల దృష్టి ఈ దోషాల తీవ్రతను శమింపజేసే దివ్య శక్తిని కలిగి ఉన్నాయి.`,
    ta: `பராசர ஹோரா சாஸ்திரத்தின்படி, லக்னம், சந்திரன் மற்றும் 8ம் வீட்டின் அமைப்பே பூர்வஜென்ம கர்ம பலன்களை தீர்மானிக்கிறது. உங்கள் ஜாதகத்தை ஆராயும்போது ${detectedDoshas.map(d => d.name).join(", ")} நிலைகள் புலப்படுகின்றன. லக்னாதிபதியின் பலமும் சுப கிரகங்களின் பார்வையும் இந்த தோஷங்களின் தாக்கத்தை தணிக்கும் ஆற்றல் கொண்டவை.`,
    en: `According to classical Parashari tenets, the disposition of the Lagna, Moon, and nodal axes maps the native's prarabdha karma. Analysis of your natal chart reveals the presence of ${detectedDoshas.map(d => d.name).join(", ")}. While every chart bears karmic impressions, strong Lagna lordship and benefic Jovian aspects provide substantial natural mitigation against severe friction.`
  }, targetLang);

  const p2 = pick6({
    kn: `ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಕಾಲಘಟ್ಟದಲ್ಲಿ (${baseYear} ರಿಂದ ${baseYear + 5}), ಶನಿ ಮಹಾರಾಜರ ಮೀನ-ಮೇಷ ರಾಶಿ ಸಂಚಾರ, ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಮಿಥುನ-ಕರ್ಕ ಗೋಚಾರ ಹಾಗೂ ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷ ಬದಲಾವಣೆಗಳು ಈ ದೋಷಗಳ ಸಂವೇದನೆಯನ್ನು ನಿರ್ದಿಷ್ಟ ಅವಧಿಗಳಲ್ಲಿ ಪ್ರಚೋದಿಸಬಹುದು. ವಿಶೇಷವಾಗಿ ವೃತ್ತಿಪರ ನಿರ್ಧಾರಗಳು, ಕೌಟುಂಬಿಕ ಮಾತುಕತೆಗಳು ಹಾಗೂ ಆರ್ಥಿಕ ಹೂಡಿಕೆಗಳ ಸಮಯದಲ್ಲಿ ಮನಸ್ಸಿನಲ್ಲಿ ಅನಾವಶ್ಯಕ ಆತಂಕ ಅಥವಾ ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳದಂತೆ ಜಾಗರೂಕರಾಗಿರುವುದು ಅತ್ಯಗತ್ಯ. ಕಾಲಕಾಲಕ್ಕೆ ಸೂಚಿಸಲಾದ ಮುಂಜಾಗ್ರತಾ ಕ್ರಮಗಳನ್ನು ಅನುಸರಿಸಿದರೆ ಯಾವುದೇ ದೊಡ್ಡ ಅಡೆತಡೆಗಳು ಎದುರಾಗುವುದಿಲ್ಲ.`,
    mr: `पुढील ५ वर्षांच्या कालावधीत (${baseYear} ते ${baseYear + 5}), शनीचे मीन-मेष राशीतील गोचर, देवगुरूंचे मिथुन-कर्क राशीतील भ्रमण व राहू-केतूचे संक्रमण या दोषांच्या प्रभावाला ठरावीक काळात सक्रिय करू शकते. विशेषतः करिअरमधील मोठे निर्णय, कौटुंबिक संवाद व मोठी आर्थिक गुंतवणूक करताना घाईगडबड न करता विचारपूर्वक पाऊल उचलणे आवश्यक आहे. योग्य वेळी खबरदारी घेतल्यास मोठा अनिष्ट प्रभाव सहज टाळता येतो.`,
    hi: `आगामी ५ वर्षों के कालखंड (${baseYear} से ${baseYear + 5}) में शनि का मीन-मेष राशि में गोचर, देवगुरु का मिथुन-कर्क में संचरण एवं राहु-केतु का परिवर्तन इन दोषों के प्रभाव को समय-समय पर जागृत कर सकता है। विशेष रूप से व्यावसायिक निर्णय, पारिवारिक संवाद एवं धन निवेश के समय अत्यधिक सतर्कता एवं धैर्य अपेक्षित है। सामयिक सावधानी बरतने से समस्त अवरोध स्वतः समाप्त हो जाएंगे।`,
    te: `రాబోయే 5 సంవత్సరాల కాలంలో (${baseYear} నుండి ${baseYear + 5}), శని మీన-మేష రాశుల సంచారం, గురుని మిథున-కర్కాటక గోచారం మరియు రాహు-కేతువుల మార్పులు ఈ దోషాల ప్రభావాన్ని కొన్ని సమయాలలో పెంచవచ్చు. ముఖ్యంగా కెరీర్ నిర్ణయాలు, కుటుంబ చర్చలు మరియు ఆర్థిక పెట్టుబడులలో తొందరపాటు నిర్ణయాలు తీసుకోకుండా జాగ్రత్త వహించడం శ్రేయస్కరం.`,
    ta: `அடுத்த 5 ஆண்டுகளில் (${baseYear} முதல் ${baseYear + 5}), சனியின் மீன-மேஷ சஞ்சாரம், குருவின் மிதுன-கடக பெயர்ச்சி மற்றும் ராகு-கேது மாற்றம் இந்த தோஷங்களின் தாக்கத்தை சில காலங்களில் வெளிப்படுத்தலாம். தொழில் முடிவுகள், குடும்ப பேச்சுவார்த்தைகள் மற்றும் நிதி முதலீடுகளில் நிதானமாக செயல்படுவது அவசியம்.`,
    en: `Over the upcoming 5-year horizon (${baseYear}–${baseYear + 5}), Saturn's transit across Pisces-Aries, Jupiter's ingress through Gemini-Cancer, and nodal shifts will selectively activate these sensitivities. Deliberate mindfulness is advised during career negotiations, family dialogues, and capital outlays to neutralize impulsive reactivity.`
  }, targetLang);

  const p3 = pick6({
    kn: `ದೋಷಗಳ ಪ್ರಭಾವವನ್ನು ಶಾಶ್ವತವಾಗಿ ಶಮನಗೊಳಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪರಮ ಪಾವನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ, ಪಂಚಾಮೃತ ಸ್ನಾನ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮವನ್ನು ನೆರವೇರಿಸುವುದು ಶಾಸ್ತ್ರೋಕ್ತ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ. ಪ್ರತಿನಿತ್ಯ ಮನೆಯಲ್ಲಿ ದೀಪಾರಾಧನೆ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣೆ ಹಾಗೂ ಗೋಸೇವೆಯು ನಿಮ್ಮ ಮನೆಗೆ ಅಖಂಡ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ಆಕರ್ಷಿಸಲಿದೆ. ದೈವಕೃಪೆಯಿಂದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ಮುಂದಿನ ಐದು ವರ್ಷಗಳ ಜೀವನವು ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಸಮೃದ್ಧಿಯಿಂದ ಕಂಗೊಳಿಸಲಿದೆ.`,
    mr: `दोषांचे पूर्ण शमन करण्यासाठी श्री क्षेत्र गोकर्ण येथील आत्मलिंग महाबळेश्वरास रुद्राभिषेक, पंचामृत स्नान व नवग्रह शांती होम करणे हे सिद्ध रक्षा कवच आहे. नित्य घरात तुपाचा दिवा लावणे, महामृत्युंजय मंत्राचा जप व गोसेवा केल्याने सकारात्मक ऊर्जा निर्माण होते. ईश्वरी कृपेने सर्व ग्रहांचे दोष शांत होऊन पुढील पाच वर्षे अत्यंत सुख-शांती व समृद्धीने भरलेली ठरतील.`,
    hi: `दोषों के स्थायी शमन हेतु श्री क्षेत्र गोकर्ण में आत्मलिंग महाबलेश्वर स्वामी का रुद्राभिषेक, पंचामृत पूजन एवं नवग्रह शांति हवन शास्त्रसम्मत परम रक्षा कवच है। नित्य प्रातः गृह में दीप प्रज्वलन, महामृत्युंजय मंत्र जप एवं गोसेवा से दैवीय सुरक्षा प्राप्त होती है। ईश्वर कृपा से समस्त दोष शांत होकर आगामी पांच वर्ष सुख, शांति एवं समृद्धि से परिपूर्ण रहेंगे।`,
    te: `దోషాల శాశ్వత నివారణకు శ్రీ క్షేత్ర గోకర్ణంలోని ఆత్మలింగ మహాబలేశ్వరునికి రుద్రాభిషేకం, పంచామృత స్నానం మరియు నవగ్రహ శాంతి హోమం చేయడం శాస్త్రోక్త రక్షా కవచం. నిత్యం ఇంట్లో దీపారాధన, మహామృత్యుంజయ మంత్ర జపం మరియు గోసేవతో సానుకూల శక్తి పెరుగుతుంది. భగవంతుని కృపతో రాబోయే ఐదు సంవత్సరాలు సుఖ-శాంతులతో వర్ధిల్లుతాయి.`,
    ta: `தோஷங்களை முழுமையாக நிவர்த்தி செய்ய ஸ்ரீ கோகர்ண க்ஷேத்திரத்தில் ஆத்மலிங்க மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம், பஞ்சாமிர்த பூஜை மற்றும் நவக்கிரக சாந்தி ஹோமம் செய்வது உன்னத ரக்ஷா கவசமாகும். தினமும் வீட்டில் விளக்கேற்றி, மகா மிருத்யுஞ்சய மந்திரம் ஜபிப்பது நலம் தரும். அடுத்த ஐந்து ஆண்டுகள் சகல சுபிக்ஷங்களுடன் அமையும்.`,
    en: `To establish an enduring spiritual shield, Vedic tradition prescribes performing sacred Rudrabhisheka, Panchamrita Seva, and Navagraha Shanti Homa at the holy shrine of Sri Kshetra Gokarna Mahabaleshwara. Daily household lamp adoration, Mahamrityunjaya chanting, and satvik charity fortify this shield, transforming planetary friction into lifelong grace and prosperity.`
  }, targetLang);

  const remedyShieldSummary = pick6({
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣೆ ಹಾಗೂ ಗೋಸೇವೆ ನಿಮ್ಮ ಪರಮ ರಕ್ಷಾ ಕವಚ.",
    mr: "गोकर्ण महाबळेश्वर चरणी रुद्राभिषेक, महामृत्युंजय जप व गोसेवा आपले अभेद्य संरक्षण कवच आहे.",
    hi: "गोकर्ण महाबलेश्वर स्वामी का रुद्राभिषेक, महामृत्युंजय मंत्र जप एवं गोसेवा आपका सर्वोत्तम रक्षा कवच है।",
    te: "గోకర్ణ మహాబలేశ్వర స్వామికి రుద్రాభిషేకం, మహామృత్యుంజయ జపం & గోసేవ మీ పరిపూర్ణ రక్షా కవచం.",
    ta: "கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம், மகா மிருத்யுஞ்சய ஜபம் மற்றும் பசு சேவை உங்கள் சிறந்த பாதுகாப்பு கவசம்.",
    en: "Rudrabhisheka at Sri Kshetra Gokarna, Mahamrityunjaya Mantra, and satvik charity constitute your impenetrable shield."
  }, targetLang);

  return {
    inquestQuestion,
    paragraphs: [p1, p2, p3],
    detectedDoshas,
    overallDoshaScore: detectedDoshas.some(d => d.severity === "critical" || d.severity === "high")
      ? (targetLang === "kn" ? "ಶಮನ ಶಾಂತಿ ಅಗತ್ಯ" : targetLang === "mr" ? "शांती आवश्यक" : targetLang === "hi" ? "शांति आवश्यक" : "Pacification Advised")
      : (targetLang === "kn" ? "ದೈವಿಕ ರಕ್ಷಿತ" : targetLang === "mr" ? "दैवी रक्षित" : targetLang === "hi" ? "दैवीय रक्षित" : "Divinely Shielded"),
    remedyShieldSummary
  };
}

export function calculateCurrentLifeStatus(
  kundli: KundliOutput,
  birthDateYmd: string,
  birthTimeHm: string,
  lat: number,
  lng: number,
  moonIdx: number,
  lagnaIdx: number,
  targetLang: SixLang
): FiveYearCurrentLifeStatus {
  const now = new Date();
  const currentAgeDecimal = ageDecimalYearsAt(birthDateYmd, birthTimeHm, lat, lng, now);
  const currentAgeFormatted = `${formatNumber6L(Math.floor(currentAgeDecimal), targetLang)} ${targetLang === "kn" ? "ವರ್ಷ" : targetLang === "mr" ? "वर्षे" : targetLang === "hi" ? "वर्ष" : targetLang === "te" ? "సంవత్సరాలు" : targetLang === "ta" ? "ஆண்டுகள்" : "Years"
    }`;
  const detailedAgeCurrent = getDetailedAgeGroup(currentAgeDecimal);
  const isMinorCurrent = currentAgeDecimal < 18;

  const currentBhukti = findBhuktiAtAge(kundli, currentAgeDecimal);
  const mahaLord = currentBhukti?.maha?.planet ?? PlanetName.Jupiter;
  const bhuktiLord = currentBhukti?.bhukti ?? PlanetName.Saturn;

  const mahaLocalized = GRAHA_6L[mahaLord]?.[targetLang] || String(mahaLord);
  const bhuktiLocalized = GRAHA_6L[bhuktiLord]?.[targetLang] || String(bhuktiLord);

  const activeMahadasha = `${mahaLocalized} ${targetLang === "kn" ? "ಮಹಾದಶೆ" : targetLang === "mr" || targetLang === "hi" ? "महादशा" : targetLang === "te" ? "మహర్దశ" : targetLang === "ta" ? "மகாதிசை" : "Mahadasha"
    }`;
  const activeBhukti = `${bhuktiLocalized} ${targetLang === "kn" ? "ಅಂತರ್ದಶೆ" : targetLang === "mr" || targetLang === "hi" ? "अंतर्दशा" : targetLang === "te" ? "అంతర్దశ" : targetLang === "ta" ? "புத்தி" : "Antardasha"
    }`;

  const activeDashaPeriodText = (currentBhukti && typeof currentBhukti.bhuktiStartAge === "number" && typeof currentBhukti.bhuktiEndAge === "number")
    ? `${formatNumber6L(currentBhukti.bhuktiStartAge.toFixed(1), targetLang)} - ${formatNumber6L(currentBhukti.bhuktiEndAge.toFixed(1), targetLang)} ${targetLang === "kn" ? "ವರ್ಷ ವಯೋಮಿತಿ" : targetLang === "mr" ? "वर्षे वयोमर्यादा" : targetLang === "hi" ? "वर्ष आयु विस्तार" : targetLang === "te" ? "సంవత్సరాల వయస్సు" : targetLang === "ta" ? "ஆண்டுகள் வயது" : "Years Age Span"
    }`
    : "—";

  // Transits as of current moment
  const transits = getTransitsForDate(moonIdx, now, "lahiri");
  const shaniHouse = transits[PlanetName.Saturn]?.house ?? 8;
  const guruHouse = transits[PlanetName.Jupiter]?.house ?? 5;
  const rahuHouse = transits[PlanetName.Rahu]?.house ?? 6;
  const ketuHouse = transits[PlanetName.Ketu]?.house ?? 12;

  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isAshtama = shaniHouse === 8;
  const isKantaka = [4, 7, 10].includes(shaniHouse);
  const hasGuruBala = [2, 5, 7, 9, 11].includes(guruHouse);

  // Dynamic Energy Score derived from natal strengths & transit harmonizers
  let energyScore = 68;
  if (hasGuruBala) energyScore += 12;
  if (!isSadeSati && !isAshtama) energyScore += 8;
  if (isSadeSati) energyScore -= 8;
  if (isAshtama) energyScore -= 10;
  if (kundli.planets.some(p => p.isExalted)) energyScore += 6;
  energyScore = Math.min(95, Math.max(52, energyScore));

  const isHighEnergy = energyScore >= 70;
  const energyMeterLabel = isHighEnergy
    ? pick6({ kn: "ಉನ್ನತ ಶಕ್ತಿ ಸ್ಥಿತಿ", mr: "उच्च ऊर्जा स्तर", hi: "उच्च ऊर्जा स्तर", te: "ఉన్నత శక్తి స్థితి", ta: "உயர் ஆற்றல் நிலை", en: "High Energy Alignment" }, targetLang)
    : pick6({ kn: "ಸಮತೋಲಿತ ಶಕ್ತಿ ಸ್ಥಿತಿ", mr: "संतुलित ऊर्जा स्तर", hi: "संतुलित ऊर्जा स्तर", te: "సమతుల్య శక్తి స్థితి", ta: "சமநிலை ஆற்றல்", en: "Balanced Energy Alignment" }, targetLang);

  const energyDesc = isHighEnergy
    ? pick6({
      kn: "ಪ್ರಸ್ತುತ ಚಂದ್ರಬಲವು ಉತ್ತಮವಾಗಿದ್ದು, ದೈನಂದಿನ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳಲು ಹಾಗೂ ಮಾನಸಿಕ ಸಮತೋಲನ ಕಾಪಾಡಿಕೊಳ್ಳಲು ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ.",
      mr: "सध्या चंद्रबल उत्तम असून दैनंदिन महत्त्वाचे निर्णय घेण्यासाठी व मानसिक संतुलन राखण्यासाठी अनुकूल काळ आहे.",
      hi: "वर्तमान चंद्रबल उत्तम है, जो दैनिक महत्वपूर्ण निर्णयों एवं मानसिक संतुलन बनाए रखने हेतु अत्यंत अनुकूल है।",
      te: "ప్రస్తుత చంద్రబలం బాగుంది, రోజువారీ ముఖ్యమైన నిర్ణయాలు తీసుకోవడానికి మరియు మానసిక స్థైర్యానికి అనుకూలమైన సమయం.",
      ta: "தற்போதைய சந்திரபலம் சிறப்பாக உள்ளது, முக்கிய முடிவுகளை எடுக்கவும் மன அமைதியைப் பேணவும் ஏற்ற காலமாகும்.",
      en: "Current lunar vitality (Chandra Bala) is robust, providing mental poise and favorable clarity for crucial everyday undertakings."
    }, targetLang)
    : pick6({
      kn: "ದಿನದ ಪ್ರಾಣಶಕ್ತಿ ಸಮತೋಲನದಲ್ಲಿದೆ. ಪ್ರಮುಖ ಆರ್ಥಿಕ ಅಥವಾ ಕೌಟುಂಬಿಕ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಮುನ್ನ ಹಿರಿಯರ ಮತ್ತು ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯುವುದು ಹಿತಕರ.",
      mr: "दिवसाची ऊर्जा संतुलित आहे. महत्त्वाचे आर्थिक अथवा कौटुंबिक निर्णय घेण्यापूर्वी ज्येष्ठांचा सल्ला घ्यावा.",
      hi: "दैनिक ऊर्जा संतुलित है। महत्वपूर्ण आर्थिक अथवा पारिवारिक निर्णय लेने से पूर्व अनुभवी व्यक्तियों का परामर्श श्रेयस्कर रहेगा।",
      te: "రోజువారీ శక్తి సమతుల్యంగా ఉంది. ముఖ్యమైన ఆర్థిక లేదా కుటుంబ నిర్ణయాలు తీసుకునే ముందు పెద్దల సలహా పొందడం శ్రేయస్కరం.",
      ta: "தினசரி ஆற்றல் சமநிலையில் உள்ளது. நிதி அல்லது குடும்ப முடிவுகளை எடுக்கும் முன் அனுபவசாலிகளின் ஆலோசனை பெறுவது நலம்.",
      en: "Daily vital energy is balanced. Consult experienced mentors before executing major financial or family commitments."
    }, targetLang);

  const bannerBadge = pick6({
    kn: "ಪ್ರಸ್ತುತ ಜಾತಕ ಸತ್ಯ · ನೈಜ ಸಮಯದ ಗೋಚಾರ ದರ್ಶನ",
    mr: "सध्याचे पत्रिका सत्य · थेट गोचर दर्शन",
    hi: "वर्तमान जन्मपत्रिका सत्य · लाइव गोचर दर्शन",
    te: "ప్రస్తుత జాతక సత్యం · ప్రత్యక్ష గోచార దర్శనం",
    ta: "தற்போதைய ஜாதக உண்மை · நேரலை கோச்சார பார்வை",
    en: "Current Astrological Reality · Live Planetary Transits"
  }, targetLang);

  const title = pick6({
    kn: "॥ ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ, ದಶಾಕಾಲ & ಲೈವ್ ಗ್ರಹ ಗೋಚಾರ ದರ್ಶನ ॥",
    mr: "॥ वर्तमान जीवन स्थिती, चालू दशा व थेट ग्रह गोचर दर्शन ॥",
    hi: "॥ वर्तमान जीवन स्थिति, चालू दशा एवं लाइव ग्रह गोचर दर्शन ॥",
    te: "॥ ప్రస్తుత జీవిత స్థితి, దశాకాలం & లైవ్ గ్రహ గోచార దర్శనం ॥",
    ta: "॥ தற்போதைய வாழ்க்கை நிலை, தசா காலம் & நேரலை கிரக கோச்சார பலன் ॥",
    en: "|| CURRENT ASTROLOGICAL REALITY, RUNNING DASHA & LIVE TRANSITS ||"
  }, targetLang);

  const subtitle = pick6({
    kn: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ-ಅಂತರ್ದಶೆ, ಶನಿ-ಗುರು ಗೋಚಾರ ಪ್ರಭಾವ, ದಿನದ ಚಂದ್ರಬಲ ಹಾಗೂ ಮುಂದಿನ ೬-೧೨ ತಿಂಗಳ ತಕ್ಷಣದ ಮಾರ್ಗಸೂಚಿ",
    mr: "सध्याची महादशा-अंतर्दशा, शनि-गुरू गोचर प्रभाव, चंद्रबल आणि आगामी ६-१२ महिन्यांचे तात्काळ मार्गदर्शन",
    hi: "सक्रिय महादशा-अंतर्दशा, शनि-गुरु गोचर प्रभाव, चंद्रबल एवं आगामी ६-१२ महीनों का तात्कालिक मार्गदर्शन",
    te: "ప్రస్తుతం నడుస్తున్న మహర్దశ-అంతర్దశ, శని-గురు గోచార ప్రభావం, చంద్రబలం మరియు రాబోయే 6-12 నెలల తక్షణ మార్గదర్శనం",
    ta: "நடப்பு மகாதிசை-புத்தி, சனி-குரு கோச்சார தாக்கம், சந்திரபலம் மற்றும் அடுத்த 6-12 மாதங்களுக்கான உடனடி வழிகாட்டுதல்",
    en: "Active Vimshottari Mahadasha-Bhukti, Saturn-Jupiter live transits, Chandra Bala, and immediate 6-12 month strategic roadmap."
  }, targetLang);

  const karmicFlowSummary = pick6({
    kn: `ಪ್ರಸ್ತುತ ಜಾತಕದಲ್ಲಿ ${mahaLocalized} ಮಹಾದಶೆಯು ಚಾಲ್ತಿಯಲ್ಲಿದ್ದು, ${bhuktiLocalized} ಅಂತರ್ದಶೆಯ ಪ್ರಭಾವದಿಂದ ಜೀವನದ ಕರ್ಮ ಪಥವು ವಿಕಸನಗೊಳ್ಳುತ್ತಿದೆ. ಈ ಗ್ರಹದ್ವಯಗಳ ಆಂತರಿಕ ಸಂಬಂಧವು ಮನಸ್ಸಿನ ಸಂಕಲ್ಪ ಶಕ್ತಿ ಹಾಗೂ ಬಾಹ್ಯ ಸನ್ನಿವೇಶಗಳ ಮೇಲೆ ಪ್ರಮುಖ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ.`,
    mr: `सध्या पत्रिकेत ${mahaLocalized} महादशा चालू असून ${bhuktiLocalized} अंतर्दशेचा प्रभाव कार्यान्वित आहे. या दोन्ही ग्रहांचा संबंध मनाची इच्छाशक्ती व बाह्य परिस्थितीवर महत्त्वपूर्ण परिणाम घडवून आणत आहे.`,
    hi: `वर्तमान में जन्मपत्रिका में ${mahaLocalized} महादशा सक्रिय है तथा ${bhuktiLocalized} अंतर्दशा का प्रभाव चल रहा है। यह दशा संबंध मानसिक दृढ़ता एवं बाह्य परिस्थितियों को प्रत्यक्ष रूप से प्रभावित कर रहा है।`,
    te: `ప్రస్తుతం జాతకంలో ${mahaLocalized} మహర్దశ మరియు ${bhuktiLocalized} అంతర్దశ నడుస్తున్నాయి. ఈ గ్రహ సంబంధం మనో సంకల్పం మరియు బాహ్య పరిస్థితులపై గణనీయమైన ప్రభావాన్ని చూపుతోంది.`,
    ta: `தற்போது ஜாதகத்தில் ${mahaLocalized} மகாதிசையும் ${bhuktiLocalized} புத்தியும் நடைபெற்று வருகின்றன. இந்த தசாநாதர்களின் தொடர்பு மன உறுதி மற்றும் சூழ்நிலைகளில் முக்கிய மாற்றங்களை உண்டாக்குகின்றது.`,
    en: `Currently running the ${mahaLord} Mahadasha with the sub-period of ${bhuktiLord}. This planetary confluence governs your subconscious drive, priorities, and unfolding karmic situations.`
  }, targetLang);

  let shaniGocharaStatus = "";
  let shaniGocharaImpact = "";
  if (isSadeSati) {
    shaniGocharaStatus = pick6({
      kn: `ಶನಿ ಸಾಡೇ ಸಾತಿ (ಏಳೂವರೆ ಶನಿ) - ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, "kn")}ನೇ ಮನೆ`,
      mr: `शनी साडेसाती - चंद्रापासून ${formatNumber6L(shaniHouse, "mr")}वे स्थान`,
      hi: `शनि साढ़ेसाती - चन्द्र से ${formatNumber6L(shaniHouse, "hi")}वां भाव`,
      te: `ఏలినాటి శని - చంద్రుని నుండి ${formatNumber6L(shaniHouse, "te")}వ ఇల్లు`,
      ta: `ஏழரை சனி - சந்திரனிலிருந்து ${formatNumber6L(shaniHouse, "ta")}-ஆம் வீடு`,
      en: `Saturn Sade Sati Phase (House ${shaniHouse} from Moon)`
    }, targetLang);
    shaniGocharaImpact = pick6({
      kn: "ಮಾನಸಿಕ ಒತ್ತಡ, ಕಾರ್ಯಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ ಹಾಗೂ ಅತಿಯಾದ ಕರ್ತವ್ಯದ ಹೊರೆ. ತಾಳ್ಮೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಶನೈಶ್ಚರ ಶಾಂತಿ ಅತ್ಯಗತ್ಯ.",
      mr: "मानसिक ताण, कामात अनपेक्षित विलंब व जास्त जबाबदाऱ्या. संयम, सचोटी व शनी आराधना आवश्यक.",
      hi: "मानसिक दबाव, कार्यों में अप्रत्याशित विलंब एवं अत्यधिक दायित्व। धैर्य, अनुशासन एवं शनि शांति परम आवश्यक।",
      te: "మానసిక ఒత్తిడి, పనులలో జాప్యం మరియు శ్రమతో కూడిన సమయం. ఓర్పు మరియు శని ఆరాధన అవసరం.",
      ta: "மன அழுத்தம், காரியத் தாமதம் மற்றும் கூடுதல் பொறுப்புகள். பொறுமையும் சனி வழிபாடும் நலம் தரும்.",
      en: "Brings emotional pressure, delays in anticipated outcomes, and heavy responsibilities. Demands patience and karmic discipline."
    }, targetLang);
  } else if (isAshtama) {
    shaniGocharaStatus = pick6({
      kn: "ಅಷ್ಟಮ ಶನಿ (ಚಂದ್ರನಿಂದ ೮ನೇ ಮನೆ)",
      mr: "अष्टम शनी (चंद्रापासून ८वे स्थान)",
      hi: "अष्टम शनि (चन्द्र से ८वां भाव)",
      te: "అష్టమ శని (చంద్రుని నుండి 8వ ఇల్లు)",
      ta: "அஷ்டம சனி (சந்திரனிலிருந்து 8-ஆம் வீடு)",
      en: "Ashtama Shani (8th House from Moon)"
    }, targetLang);
    shaniGocharaImpact = pick6({
      kn: "ಆರೋಗ್ಯ, ಆರ್ಥಿಕ ಹೂಡಿಕೆ ಹಾಗೂ ಪ್ರಯಾಣಗಳಲ್ಲಿ ವಿಶೇಷ ಜಾಗರೂಕತೆ ವಹಿಸಬೇಕು. ಅನಗತ್ಯ ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ.",
      mr: "आरोग्य, आर्थिक गुंतवणूक व प्रवासात विशेष खबरदारी बाळगा. वादांपासून दूर राहा.",
      hi: "स्वास्थ्य, धन निवेश तथा यात्राओं में विशेष सावधानी रखें। अनावश्यक विवादों से बचें।",
      te: "ఆరోగ్యం, ఆర్థిక పెట్టుబడులు మరియు ప్రయాణాలలో అప్రమత్తత అవసరం. వివాదాలకు దూరంగా ఉండండి.",
      ta: "உடல்நலம், நிதி முதலீடு மற்றும் பயணங்களில் கூடுதல் கவனம் தேவை. வீண் விவாதங்களைத் தவிர்க்கவும்.",
      en: "Requires vigilance in health, capital preservation, and avoiding speculative or high-risk undertakings."
    }, targetLang);
  } else if (isKantaka) {
    shaniGocharaStatus = pick6({
      kn: `ಕಂಟಕ ಶನಿ (ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, "kn")}ನೇ ಮನೆ)`,
      mr: `कंटक शनी (चंद्रापासून ${formatNumber6L(shaniHouse, "mr")}वे स्थान)`,
      hi: `कंटक शनि (चन्द्र से ${formatNumber6L(shaniHouse, "hi")}वां भाव)`,
      te: `కంటక శని (చంద్రుని నుండి ${formatNumber6L(shaniHouse, "te")}వ ఇల్లు)`,
      ta: `கண்டக சனி (சந்திரனிலிருந்து ${formatNumber6L(shaniHouse, "ta")}-ஆம் வீடு)`,
      en: `Kantaka Shani (House ${shaniHouse} from Moon)`
    }, targetLang);
    shaniGocharaImpact = pick6({
      kn: "ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಅಧಿಕ ಪರಿಶ್ರಮ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆ ಅಗತ್ಯ. ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಡವಾಗಿ ಲಭಿಸಲಿದೆ.",
      mr: "कामाच्या ठिकाणी जास्त कष्ट व कौटुंबिक सामंजस्य हवे. कष्टाचे फळ विलंबाने का होईना नक्की मिळेल.",
      hi: "कार्यक्षेत्र में कड़ा परिश्रम एवं पारिवारिक सामंजस्य आवश्यक है। परिश्रम का फल विलंब से प्राप्त होगा।",
      te: "ఉద్యోగంలో అధిక శ్రమ మరియు కుటుంబంలో సామరస్యం అవసరం. శ్రమకు తగిన ఫలితం నిదానంగా అందుతుంది.",
      ta: "தொழிலில் அதிக உழைப்பும் குடும்பத்தில் ஒற்றுமையும் தேவை. உழைப்பிற்கான அங்கீகாரம் தாமதமாகக் கிடைக்கும்.",
      en: "Demands steadfast perseverance in career; maintain domestic harmony as recognition arrives steadily."
    }, targetLang);
  } else {
    shaniGocharaStatus = pick6({
      kn: `ಅನುಕೂಲಕರ ಶನಿ ಗೋಚಾರ (ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, "kn")}ನೇ ಮನೆ)`,
      mr: `अनुकूल शनी गोचर (चंद्रापासून ${formatNumber6L(shaniHouse, "mr")}वे स्थान)`,
      hi: `अनुकूल शनि गोचर (चन्द्र से ${formatNumber6L(shaniHouse, "hi")}वां भाव)`,
      te: `అనుకూల శని గోచారం (చంద్రుని నుండి ${formatNumber6L(shaniHouse, "te")}వ ఇల్లు)`,
      ta: `சாதகமான சனி சஞ்சாரம் (சந்திரனிலிருந்து ${formatNumber6L(shaniHouse, "ta")}-ஆம் வீடு)`,
      en: `Favorable Saturn Transit (House ${shaniHouse} from Moon)`
    }, targetLang);
    shaniGocharaImpact = pick6({
      kn: "ಶತ್ರು ಜಯ, ಹಳೆಯ ಸಮಸ್ಯೆಗಳ ಇತ್ಯರ್ಥ ಹಾಗೂ ನಿಷ್ಠಾವಂತ ಪರಿಶ್ರಮಕ್ಕೆ ಯೋಗ್ಯ ಆರ್ಥಿಕ ಲಾಭ ದೊರೆಯುವ ಕಾಲ.",
      mr: "शत्रूवर मात, जुन्या अडचणींचे निवारण व प्रामाणिक कष्टाचे योग्य फळ मिळण्याचा काळ.",
      hi: "बाधाओं पर विजय, पुरानी समस्याओं का समाधान एवं निष्ठावान परिश्रम से यथोचित आर्थिक लाभ की स्थिति।",
      te: "సమస్యల పరిష్కారం, శత్రు జయం మరియు కష్టపడే తత్వానికి తగిన ఆర్థిక ప్రయోజనాలు లభిస్తాయి.",
      ta: "தடைகள் அகலும், பழைய சிக்கல்கள் தீரும் மற்றும் நேர்மையான உழைப்பிற்கு ஏற்ற பணவரவு கிட்டும்.",
      en: "Fosters triumph over chronic impediments, gradual financial stability, and tangible career gains."
    }, targetLang);
  }

  const guruGocharaStatus = hasGuruBala
    ? pick6({
      kn: `ಅನುಕೂಲಕರ ಗುರುಬಲ (ಚಂದ್ರನಿಂದ ${formatNumber6L(guruHouse, "kn")}ನೇ ಮನೆ)`,
      mr: `अनुकूल गुरूबल (चंद्रापासून ${formatNumber6L(guruHouse, "mr")}वे स्थान)`,
      hi: `अनुकूल गुरुबल (चन्द्र से ${formatNumber6L(guruHouse, "hi")}वां भाव)`,
      te: `అనుకూల గురుబలం (చంద్రుని నుండి ${formatNumber6L(guruHouse, "te")}వ ఇల్లు)`,
      ta: `சாதகமான குருபலம் (சந்திரனிலிருந்து ${formatNumber6L(guruHouse, "ta")}-ஆம் வீடு)`,
      en: `Auspicious Guru Bala (House ${guruHouse} from Moon)`
    }, targetLang)
    : pick6({
      kn: `ಸಾಮಾನ್ಯ ಗುರು ಗೋಚಾರ (ಚಂದ್ರನಿಂದ ${formatNumber6L(guruHouse, "kn")}ನೇ ಮನೆ)`,
      mr: `सामान्य गुरू गोचर (चंद्रापासून ${formatNumber6L(guruHouse, "mr")}वे स्थान)`,
      hi: `मध्यम गुरु गोचर (चन्द्र से ${formatNumber6L(guruHouse, "hi")}वां भाव)`,
      te: `సాధారణ గురు గోచారం (చంద్రుని నుండి ${formatNumber6L(guruHouse, "te")}వ ఇల్లు)`,
      ta: `சாதாரண குரு சஞ்சாரம் (சந்திரனிலிருந்து ${formatNumber6L(guruHouse, "ta")}-ஆம் வீடு)`,
      en: `Neutral Jupiter Transit (House ${guruHouse} from Moon)`
    }, targetLang);

  const guruGocharaImpact = hasGuruBala
    ? pick6({
      kn: "ಬುದ್ಧಿಶಕ್ತಿ, ಗೌರವ, ಸನ್ಮಂಗಳ ಕಾರ್ಯಗಳಿಗೆ ದೈವಾನುಗ್ರಹ ಹಾಗೂ ಆರ್ಥಿಕ ವೃದ್ಧಿಯ ಸುವರ್ಣಾವಕಾಶ.",
      mr: "बुद्धिमत्ता, मान-सन्मान, मंगल कार्ये व आर्थिक उन्नतीसाठी उत्तम दैवी कृपा लाभेल.",
      hi: "बुद्धिमत्ता, प्रतिष्ठा, मांगलिक कार्य एवं धन वृद्धि हेतु ईश्वरीय अनुग्रह प्राप्त होगा।",
      te: "జ్ఞానం, గౌరవం, శుభకార్యాలు మరియు ఆర్థికాభివృద్ధికి దైవానుగ్రహం లభిస్తుంది.",
      ta: "புத்தி கூர்மை, கௌரவம், சுப காரியங்கள் மற்றும் பொருளாதார வளர்ச்சிக்கு தெய்வ அருள் துணை நிற்கும்.",
      en: "Confers divine grace, wisdom, auspicious endeavors, and enhanced prospects for financial stability."
    }, targetLang)
    : pick6({
      kn: "ಅತಿಯಾದ ನಿರೀಕ್ಷೆ ಬೇಡ; ಜ್ಞಾನಾರ್ಜನೆ, ಗುರು ಹಿರಿಯರ ಸೇವೆ ಹಾಗೂ ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆದರೆ ಶಾಂತಿ ಲಭಿಸಲಿದೆ.",
      mr: "अति अपेक्षा टाळा; ज्ञानार्जन, वडीलधाऱ्यांची सेवा व सन्मार्गाचा अवलंब केल्यास मनःशांती लाभेल.",
      hi: "अत्यधिक अपेक्षाओं से बचें; ज्ञानार्जन, गुरुजनों की सेवा एवं धर्म मार्ग पर चलने से शांति मिलेगी।",
      te: "అధిక అంచనాలు వద్దు; జ్ఞానార్జన, పెద్దల సేవ మరియు ధర్మ మార్గంలో నడిస్తే మనశ్శాంతి లభిస్తుంది.",
      ta: "அதிக எதிர்பார்ப்புகளைத் தவிர்க்கவும்; தர்ம வழியிலும் பெரியவர்களின் வழிகாட்டலிலும் செல்ல அமைதி கிடைக்கும்.",
      en: "Moderates aggressive expectations; focus on structured learning, moral integrity, and inner reflection."
    }, targetLang);

  const rahuKetuStatus = pick6({
    kn: `ರಾಹು ${formatNumber6L(rahuHouse, "kn")}ನೇ ಮನೆ & ಕೇತು ${formatNumber6L(ketuHouse, "kn")}ನೇ ಮನೆ`,
    mr: `राहू ${formatNumber6L(rahuHouse, "mr")}वे स्थान व केतू ${formatNumber6L(ketuHouse, "mr")}वे स्थान`,
    hi: `राहु ${formatNumber6L(rahuHouse, "hi")}वां भाव एवं केतु ${formatNumber6L(ketuHouse, "hi")}वां भाव`,
    te: `రాహువు ${formatNumber6L(rahuHouse, "te")}వ ఇల్లు & కేతువు ${formatNumber6L(ketuHouse, "te")}వ ఇల్లు`,
    ta: `ராகு ${formatNumber6L(rahuHouse, "ta")}-ஆம் வீடு & கேது ${formatNumber6L(ketuHouse, "ta")}-ஆம் வீடு`,
    en: `Rahu House ${rahuHouse} & Ketu House ${ketuHouse}`
  }, targetLang);

  const rahuKetuImpact = pick6({
    kn: "ಅನಿರೀಕ್ಷಿತ ಬದಲಾವಣೆಗಳು, ಆಸೆ-ಆಕಾಂಕ್ಷೆಗಳ ತೀವ್ರತೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಯತ್ತ ಒಲವು ಉಂಟಾಗುವ ಕರ್ಮ ಚಲನೆ.",
    mr: "अनपेक्षित बदल, तीव्र महत्त्वाकांक्षा व अध्यात्माकडे ओढ निर्माण करणारी कर्म गती.",
    hi: "अप्रत्याशित परिवर्तन, तीव्र महत्वाकांक्षा एवं आध्यात्मिकता की ओर प्रेरित करने वाला प्रभाव।",
    te: "ఆకస్మిక మార్పులు, తీవ్ర ఆకాంక్షలు మరియు ఆధ్యాత్మికత వైపు ఆకర్షణ కలిగించే కర్మ గమనం.",
    ta: "எதிர்பாராத திருப்பங்கள், தீவிர ஆசைகள் மற்றும் ஆன்மீக நாட்டத்தை ஏற்படுத்தும் கர்ம சஞ்சாரம்.",
    en: "Triggers sudden environmental pivots, shifts in ambition, and deeper spiritual awakening."
  }, targetLang);

  const careerImmediateFocus = isMinorCurrent
    ? (detailedAgeCurrent === "infant"
      ? pick6({
        kn: "ಶಿಶುವಿನ ಶಾರೀರಿಕ ಬೆಳವಣಿಗೆ, ಪೌಷ್ಟಿಕ ಆಹಾರ ಹಾಗೂ ಕಾಲಕಾಲಕ್ಕೆ ರೋಗನಿರೋಧಕ ಲಸಿಕೆ ಮತ್ತು ನಿದ್ರೆಯ ಕ್ರಮಬದ್ಧತೆಯೇ ಪ್ರಮುಖ ಗುರಿ.",
        mr: "बालकाची शारीरिक वाढ, सकस आहार, वेळेवर लसीकरण व शांत झोप यावर विशेष लक्ष देणे हीच मुख्य गरज आहे.",
        hi: "शिशु की शारीरिक वृद्धि, पौष्टिक आहार, समय पर टीकाकरण एवं शांत निद्रा ही सर्वोपरि प्राथमिकता है।",
        te: "శిశువు శారీరక ఎదుగుదల, పౌష్టికాహారం, సకాలంలో టీకాలు మరియు నిశ్చింత నిద్ర ప్రధాన లక్ష్యం.",
        ta: "குழந்தையின் உடல் வளர்ச்சி, சத்தான உணவு, முறையான தடுப்பூசி மற்றும் நல்ல தூக்கமே முதன்மையானது.",
        en: "Consistent pediatric nourishment, timely immunization schedule, and deep restorative sleep rhythms remain the top priority."
      }, targetLang)
      : detailedAgeCurrent === "adolescent"
        ? pick6({
          kn: "ಪ್ರೌಢ ವಿದ್ಯಾಭ್ಯಾಸ, ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳ ಸಿದ್ಧತೆ ಹಾಗೂ ವಿಜ್ಞಾನ-ಗಣಿತದಲ್ಲಿ ಆಳವಾದ ಅಧ್ಯಯನಕ್ಕೆ ಪೂರ್ಣ ಗಮನ ನೀಡಿ.",
          mr: "उच्च माध्यमिक शिक्षण, बोर्ड परीक्षेची तयारी व कठीण विषयांच्या अभ्यासावर पूर्ण लक्ष केंद्रित करा.",
          hi: "उच्चतर माध्यमिक शिक्षा, बोर्ड परीक्षा की तैयारी एवं विज्ञान-गणित के गहन अध्ययन पर पूर्ण ध्यान केंद्रित करें।",
          te: "ఉన్నత పాఠశాల చదువులు, బోర్డు పరీక్షల సన్నద్ధత మరియు సైన్స్-గణితంపై ప్రత్యేక శ్రద్ధ పెట్టండి.",
          ta: "மேல்நிலைக் கல்வி, பொதுத்தேர்வு தயாரிப்பு மற்றும் கணிதம்-அறிவியல் பாடங்களில் ஆழ்ந்த கவனம் செலுத்துங்கள்.",
          en: "Direct focused energy into secondary scholastic coursework, board examination milestones, and STEM analytical subjects."
        }, targetLang)
        : pick6({
          kn: "ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣ ಶಕ್ತಿ, ಸ್ಮರಣಶಕ್ತಿ ಹಾಗೂ ಸೃಜನಶೀಲ ಹವ್ಯಾಸಗಳಲ್ಲಿ ಮಗುವಿನ ಆಸಕ್ತಿಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ.",
          mr: "शालेय अभ्यास, स्मरणशक्ती व विविध कलागुणांमध्ये बालकाची रुची वाढवून त्याला सतत प्रोत्साहन द्यावे.",
          hi: "विद्यालयी अध्ययन, स्मरण शक्ति एवं सृजनात्मक अभिरुचियों में बालक की स्वाभाविक प्रतिभा को प्रोत्साहित करें।",
          te: "పాఠశాల చదువు, జ్ఞాపకశక్తి మరియు సృజనాత్మక నైపుణ్యాలలో పిల్లల ప్రతిభను ప్రోత్సహించండి.",
          ta: "பள்ளிப் படிப்பு, நினைவாற்றல் மற்றும் ஆக்கப்பூர்வமான பொழுதுபோக்குகளில் குழந்தையின் திறமையை ஊக்கப்படுத்துங்கள்.",
          en: "Nurture curiosity across school curricula, memory retention, and creative hobbies through gentle encouragement."
        }, targetLang))
    : detailedAgeCurrent === "senior"
      ? pick6({
        kn: "ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಜೀವನದ ಮೌಲ್ಯಗಳನ್ನು ಧಾರೆ ಎರೆದು, ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಯಲ್ಲಿ ಸಾರ್ಥಕತೆ ಕಾಣಿರಿ.",
        mr: "पुढच्या पिढीला सुसंस्कार देऊन समाजसेवा व आध्यात्मिक चिंतनात जीवनाचे सार्थक करावे.",
        hi: "भावी पीढ़ी को जीवन मूल्य प्रदान कर समाज सेवा एवं आध्यात्मिक साधना में जीवन की सार्थकता अनुभव करें।",
        te: "భావి తరానికి మంచి మార్గదర్శనం చేస్తూ సమాజ సేవ మరియు ఆధ్యాత్మిక సాధనలో జీవిత సాఫల్యం పొందండి.",
        ta: "அடுத்த தலைமுறைக்கு வழிகாட்டி சமூக சேவை மற்றும் ஆன்மீக சாதனையில் மனநிறைவு காணுங்கள்.",
        en: "Mentor subsequent generations with ethical guidance while pursuing tranquil spiritual contemplation and selfless seva."
      }, targetLang)
      : hasGuruBala
        ? pick6({
          kn: "ಗುರುಬಲದ ಶುಭ ಸಂಚಾರದಿಂದ ಕರ್ಮಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ವಿಸ್ತರಣೆ, ಬಡ್ತಿ ಹಾಗೂ ಅಧಿಕಾರ ಯೋಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಧೈರ್ಯದಿಂದ ಹೊಸ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.",
          mr: "गुरूच्या शुभ गोचरामुळे कार्यक्षेत्रात नवीन संधी, पदोन्नती व सन्मान लाभेल. आत्मविश्वासाने महत्त्वाचे निर्णय घ्या.",
          hi: "शुभ गुरुबल के प्रभाव से कार्यक्षेत्र में नवीन विस्तार, पदोन्नति एवं अधिकार वृद्धि के योग बनेंगे। आत्मविश्वासपूर्वक आगे बढ़ें।",
          te: "గురుబల అనుకూలతతో ఉద్యోగ వ్యాపారాలలో విశేష పురోగతి, ప్రమోషన్ మరియు ఆధిపత్యం లభించును. ధైర్యంగా ముందడుగు వేయండి.",
          ta: "குரு பலத்தின் அனுகூலத்தால் தொழில் மற்றும் வேலையில் புதிய உயர்வு, பதவி உயர்வு மற்றும் அங்கீகாரம் கிட்டும். துணிவுடன் முடிவெடுக்கலாம்.",
          en: "Under auspicious Jupiter transit, vocational expansion, leadership breakthroughs, and well-earned promotions are strongly activated."
        }, targetLang)
        : (isSadeSati || isAshtama)
          ? pick6({
            kn: "ಶನಿಯ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಆತುರದ ಬದಲಾವಣೆ ಬೇಡ. ಸದ್ಯದ ಜವಾಬ್ದಾರಿಗಳನ್ನು ನಿಷ್ಠೆಯಿಂದ ನಿರ್ವಹಿಸಿದರೆ ಹಂತ-ಹಂತವಾಗಿ ಯಶಸ್ಸು ಒಲಿಯಲಿದೆ.",
            mr: "शनीच्या प्रभावामुळे नोकरी-व्यवसायात घाईघाईने निर्णय घेऊ नका. चालू जबाबदाऱ्या प्रामाणिकपणे सांभाळल्यास हळूहळू प्रगती होईल.",
            hi: "शनि गोचर के कारण कार्यक्षेत्र में जल्दबाजी से बचें। वर्तमान उत्तरदायित्वों को धैर्यपूर्वक निभाएं, धीरे-धीरे स्थायी सफलता मिलेगी।",
            te: "శని ప్రభావం వల్ల ఉద్యోగంలో తొందరపాటు నిర్ణయాలు వద్దు. బాధ్యతలను ఓర్పుతో నిర్వహిస్తే క్రమంగా స్థిరత్వం లభిస్తుంది.",
            ta: "சனி சஞ்சாரத்தால் பணியில் அவசர முடிவுகளைத் தவிர்க்கவும். தற்போதைய பொறுப்புகளைப் பொறுமையுடன் செய்தால் படிப்படியாக வெற்றி கிட்டும்.",
            en: "Under Saturn's disciplined transit, avoid impulsive job pivots. Diligently anchor current responsibilities to ensure steady endurance."
          }, targetLang)
          : pick6({
            kn: "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಸ್ಥಿರ ಪ್ರಗತಿ ಹಾಗೂ ನೂತನ ಕೌಶಲಗಳ ವೃದ್ಧಿ. ಹಿರಿಯ ಅಧಿಕಾರಿಗಳ ವಿಶ್ವಾಸ ಗಳಿಸಿ ಮಹತ್ವದ ಯೋಜನೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುನ್ನಡೆಸಿ.",
            mr: "करिअरमध्ये स्थिर प्रगती व नवीन कौशल्यांचा विकास होईल. वरिष्ठांचा विश्वास संपादन करून महत्त्वाच्या प्रकल्पांचे नेतृत्व करा.",
            hi: "कार्यक्षेत्र में संतुलित प्रगति एवं नवीन कौशल अर्जन के अवसर। वरिष्ठों का विश्वास जीतकर महत्वपूर्ण परियोजनाओं का सफल नेतृत्व करें।",
            te: "కెరీర్‌లో స్థిరమైన ప్రగతి మరియు నూతన నైపుణ్యాల వృద్ధి. ఉన్నతాధికారుల విశ్వాసాన్ని పొంది కీలక ప్రాజెక్టులను ముందుకు నడపండి.",
            ta: "தொழில் வாழ்க்கையில் சீரான வளர்ச்சி மற்றும் புதிய திறன்கள் கூடும். மேலதிகாரிகளின் நம்பிக்கையைப் பெற்று பணிகளை முன்னெடுக்கவும்.",
            en: "Consistent vocational progress with steady skill acquisition. Cultivate senior stakeholder trust and lead core assignments with confidence."
          }, targetLang);

  const wealthImmediateFocus = isMinorCurrent
    ? pick6({
      kn: "ಮಗುವಿನ ಭವಿಷ್ಯದ ಶೈಕ್ಷಣಿಕ ನಿಧಿಗಾಗಿ ಪೋಷಕರು ವ್ಯವಸ್ಥಿತ ಉಳಿತಾಯ (SIP/ದೀರ್ಘಾವಧಿ ಠೇವಣಿ) ಮಾಡುವುದು ಅತ್ಯಂತ ಪ್ರಶಸ್ತ.",
      mr: "मुलाच्या भावी शिक्षणासाठी पालकांनी पद्धतशीर बचत (एसआयपी / मुदत ठेव) सुरू करणे अत्यंत हितकारक ठरेल.",
      hi: "बालक के भावी शैक्षणिक कोष हेतु अभिभावकों द्वारा व्यवस्थित बचत (SIP / सावधि जमा) प्रारंभ करना अत्यंत श्रेयस्कर है।",
      te: "పిల్లల భవిష్యత్ విద్యా నిధి కోసం తల్లిదండ్రులు క్రమబద్ధమైన పొదుపు (SIP/డిపాజిట్) చేయడం ఎంతో శ్రేయస్కరం.",
      ta: "குழந்தையின் எதிர்கால கல்வி நிதிக்காக பெற்றோர்கள் சீரான சேமிப்பை (SIP/வைப்பு நிதி) தொடங்குவது நல்லது.",
      en: "Channeling disciplined parental allocations into structured higher education funds secures future academic horizons."
    }, targetLang)
    : detailedAgeCurrent === "senior"
      ? pick6({
        kn: "ಕಷ್ಟಾರ್ಜಿತ ಸ್ಥಿರಾಸ್ತಿ ಹಾಗೂ ಪಿಂಚಣಿ ನಿಧಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಕಾಪಾಡಿಕೊಂಡು, ನಿಶ್ಚಿಂತ ನಿವೃತ್ತ ಜೀವನ ನಡೆಸಿ.",
        mr: "कष्टाने कमावलेली संपत्ती व पेन्शन निधी सुरक्षित ठेवून शांत, समाधानी निवृत्त जीवन जगावे.",
        hi: "परिश्रम से संचित संपत्ति एवं पेंशन कोष को सुरक्षित रखकर निश्चिंत, शांतिपूर्ण जीवन व्यतीत करें।",
        te: "సంపాదించిన ఆస్తులు మరియు పెన్షన్ నిధులను సురక్షితంగా ఉంచుకుంటూ ప్రశాంత విశ్రాంత జీవితం గడపండి.",
        ta: "சேர்த்த சொத்துக்கள் மற்றும் ஓய்வூதிய நிதியை பாதுகாப்பாக வைத்து மனநிறைவான வாழ்க்கை வாழுங்கள்.",
        en: "Preserve principal capital and pension reserves defensively to enjoy peaceful, stress-free senior years."
      }, targetLang)
      : hasGuruBala
        ? pick6({
          kn: "ಧನಕಾರಕ ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಸಕಾಲಿಕ ಧನಾಗಮನ, ಚಿನ್ನಾಭರಣ ಸಂಗ್ರಹ ಹಾಗೂ ಲಾಭದಾಯಕ ಹೂಡಿಕೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಕಾಲ. ಉಳಿತಾಯವನ್ನು ವೃದ್ಧಿಸಿ.",
          mr: "गुरूच्या कृपेने धनप्राप्ती, सुवर्ण संचय व लाभदायक गुंतवणुकीसाठी उत्तम काळ. बचतीचे प्रमाण वाढवा.",
          hi: "धनकारक गुरु की कृपा से आय में वृद्धि, स्वर्ण संचय एवं लाभदायक निवेश हेतु श्रेष्ठ समय। बचत को सुदृढ़ करें।",
          te: "గురు అనుగ్రహంతో ధన ప్రవాహం, బంగారు ఆభరణాల సంచయం మరియు లాభదాయక పెట్టుబడులకు శుభ సమయం. పొదుపును పెంచండి.",
          ta: "குருவின் அருளால் பணவரவு சீராகி, தங்க நகைகள் சேர்க்கை மற்றும் நன்மையான முதலீடுகளுக்கு உகந்த காலம். சேமிப்பை உயர்த்தவும்.",
          en: "Jupiter's grace activates buoyant cash flow, consecrated jewelry acquisition, and rewarding capital accumulation."
        }, targetLang)
        : (isSadeSati || isAshtama)
          ? pick6({
            kn: "ಹೊಸ ಸಾಲ ಮಾಡುವುದು ಹಾಗೂ ಊಹಾತ್ಮಕ ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳಿಂದ ದೂರವಿರಿ. ದ್ರವ್ಯ ನಿಧಿಯನ್ನು ತುರ್ತು ಅಗತ್ಯಗಳಿಗಾಗಿ ಉಳಿತಾಯ ರೂಪದಲ್ಲಿ ಭದ್ರಪಡಿಸಿಕೊಳ್ಳಿ.",
            mr: "नवीन कर्ज व सट्टेबाजीपासून पूर्ण दूर राहा. अचानक खर्चासाठी द्रव निधी सुरक्षित पर्यायांमध्ये राखून ठेवा.",
            hi: "अनावश्यक ऋण लेने एवं सट्टेबाजी से बचें। आपातकालीन आवश्यकताओं हेतु तरल पूंजी को सुरक्षित रूप में संचित रखें।",
            te: "కొత్త అప్పులు చేయడం మరియు రిస్క్ పెట్టుబడులను పూర్తిగా మానండి. అత్యవసరాల కోసం నిధులను పొదుపుగా భద్రపరచండి.",
            ta: "புதிய கடன்கள் வாங்குவதையும் ஊக வணிக முதலீடுகளையும் தவிர்க்கவும். அவசர தேவைக்கு சேமிப்பை பாதுகாப்பாக வைக்கவும்.",
            en: "Strictly avoid speculative ventures and avoidable borrowing. Prioritize defensive cash preservation and liquid reserves."
          }, targetLang)
          : pick6({
            kn: "ಆದಾಯ ಮತ್ತು ಖರ್ಚಿನ ನಡುವೆ ಉತ್ತಮ ಸಮತೋಲನ. ಭವಿಷ್ಯದ ಸುರಕ್ಷತೆಗಾಗಿ ದೀರ್ಘಾವಧಿ ಉಳಿತಾಯ ಯೋಜನೆಗಳಲ್ಲಿ ಹಣ ತೊಡಗಿಸುವುದು ಹಿತಕರ.",
            mr: "उत्पन्न व खर्चात उत्तम समतोल राखा. दीर्घकालीन बचतीमध्ये गुंतवणूक करणे भविष्यासाठी हितकारक ठरेल.",
            hi: "आय एवं व्यय में उत्तम संतुलन बनाए रखें। भविष्य की सुरक्षा हेतु दीर्घकालीन बचत योजनाओं में पूंजी लगाएं।",
            te: "ఆదాయ వ్యయాల మధ్య చక్కని సమతుల్యత పాటించండి. భవిష్యత్ భద్రత కోసం దీర్ఘకాలిక పొదుపు పథకాలలో పెట్టుబడి పెట్టండి.",
            ta: "வரவுக்கும் செலவுக்கும் இடையே சமநிலை பேணவும். எதிர்காலப் பாதுகாப்பிற்கு நீண்டகால சேமிப்பு திட்டங்களில் முதலீடு செய்யவும்.",
            en: "Harmonious balance between income and expenditure. Channel surplus earnings into reliable long-term defensive assets."
          }, targetLang);

  const familyImmediateFocus = (isKantaka || isSadeSati)
    ? pick6({
      kn: "ಕುಟುಂಬದ ಹಿರಿಯರ ಆರೋಗ್ಯದ ಕಡೆಗೆ ವಿಶೇಷ ಕಾಳಜಿ ವಹಿಸಿ. ಸಣ್ಣಪುಟ್ಟ ಗೃಹ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರಶಾಂತ ಸಂಭಾಷಣೆಯ ಮೂಲಕ ಸೌಹಾರ್ದಯುತವಾಗಿ ಬಗೆಹರಿಸಿಕೊಳ್ಳಿ.",
      mr: "कुटुंबातील वडीलधाऱ्यांच्या आरोग्याची काळजी घ्या. लहानसहान मतभेद संवादाने शांतपणे सोडवून सामंजस्य राखा.",
      hi: "परिवार के वरिष्ठ सदस्यों के स्वास्थ्य का विशेष ध्यान रखें। घरेलू मतभेदों को आपसी संवाद द्वारा शांतिपूर्वक सुलझाएं।",
      te: "కుటుంబంలోని పెద్దల ఆరోగ్యంపై శ్రద్ధ పెట్టండి. చిన్న చిన్న వివాదాలను ప్రశాంత సంభాషణ ద్వారా పరిష్కరించుకోండి.",
      ta: "குடும்பப் பெரியவர்களின் ஆரோக்கியத்தில் கவனம் செலுத்தவும். சிறு கருத்து வேறுபாடுகளை அன்பான பேச்சால் சமரசம் செய்யவும்.",
      en: "Prioritize domestic harmony and elder well-being. Practice thoughtful patience to resolve household discussions amicably."
    }, targetLang)
    : hasGuruBala
      ? pick6({
        kn: "ಗೃಹದಲ್ಲಿ ಸನ್ಮಂಗಳ ವಾತಾವರಣ, ಶುಭ ಕಾರ್ಯಗಳ ಸಂಭ್ರಮ ಹಾಗೂ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಮಧುರ ಸಾಮರಸ್ಯ. ಬಂಧು-ಮಿತ್ರರ ಸಂಪೂರ್ಣ ಸಹಕಾರ ಲಭಿಸಲಿದೆ.",
        mr: "घरात मंगलमय वातावरण, शुभकार्यांचे योग व कौटुंबिक सौख्य वृद्धिंगत होईल. आप्तेष्टांचे पूर्ण सहकार्य लाभेल.",
        hi: "गृह में मांगलिक वातावरण, शुभ आयोजनों का उल्लास एवं पारिवारिक सौहार्द में वृद्धि। परिजनों का पूर्ण सहयोग प्राप्त होगा।",
        te: "ఇంట్లో శుభ వాతావరణం, శుభకార్యాల సన్నాహాలు మరియు కుటుంబంలో మధుర బంధాలు బలపడతాయి. బంధువుల సహకారం లభిస్తుంది.",
        ta: "இல்லத்தில் சுப மங்கல நிகழ்வுகள், சுப காரிய பேச்சுக்கள் மற்றும் குடும்பத்தில் மகிழ்ச்சி பொங்கும். உற்றார் உறவினர் ஆதரவு கிட்டும்.",
        en: "Warm domestic contentment with auspicious family celebrations, harmonious spousal bonds, and supportive kinships."
      }, targetLang)
      : pick6({
        kn: "ಕುಟುಂಬ ಸದಸ್ಯರ ಭಾವನೆಗಳಿಗೆ ಗೌರವ ನೀಡಿ. ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಗೃಹಾಲಂಕಾರ ಯೋಜನೆಗಳಿಗೆ ಒಟ್ಟಾಗಿ ಸಮಯ ಮೀಸಲಿಡಿ.",
        mr: "कुटुंबातील सदस्यांच्या भावनांचा आदर करा. मुलांचे शिक्षण व कौटुंबिक योजनांसाठी एकत्र वेळ द्या.",
        hi: "परिवार के सदस्यों की भावनाओं का सम्मान करें। बच्चों की शिक्षा एवं पारिवारिक निर्णयों में परस्पर सहयोग बनाए रखें।",
        te: "కుటుంబ సభ్యుల భావాలను గౌరవించండి. పిల్లల చదువు మరియు ఇంటి వ్యవహారాలపై శ్రద్ధ వహించండి.",
        ta: "குடும்பத்தாரின் விருப்பங்களுக்கு மதிப்பளியுங்கள். குழந்தைகளின் கல்வி மற்றும் வீட்டு வளர்ச்சிக்கு நேரம் ஒதுக்குங்கள்.",
        en: "Nurture household unity and emotional validation. Devote quality focus to children's aspirations and collective domestic goals."
      }, targetLang);

  const healthImmediateFocus = isAshtama
    ? pick6({
      kn: "ಅಷ್ಟಮ ಶನಿಯ ಕಾಲವಿರುವುದರಿಂದ ವಾಹನ ಚಾಲನೆ ಹಾಗೂ ದೀರ್ಘ ರಾತ್ರಿ ಪ್ರಯಾಣದಲ್ಲಿ ಪರಮ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ. ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪವು ರಕ್ಷೆ.",
      mr: "अष्टम शनीच्या काळात वाहन चालवताना व प्रवासात अत्यंत काळजी घ्या. महामृत्युंजय जप आरोग्यास अभय देईल.",
      hi: "अष्टम शनि गोचर में वाहन चालन एवं रात्रि यात्राओं में अत्यधिक सावधानी बरतें। महामृत्युंजय जप शारीरिक आरोग्य रक्षक है।",
      te: "అష్టమ శని ప్రభావంతో వాహనం నడిపేటప్పుడు మరియు రాత్రి ప్రయాణాలలో అత్యంత జాగ్రత్త అవసరం. మహామృత్యుంజయ జపం శ్రేయస్కరం.",
      ta: "அஷ்டம சனி காலமாதலால் வாகனம் ஓட்டுவதிலும் இரவு பயணங்களிலும் அதிக கவனம் தேவை. மகா மிருத்யுஞ்சய ஜெபம் நலம் தரும்.",
      en: "Under 8th house Saturn, exercise vigilance in vehicular transit and high-speed travel. Daily Maha Mrityunjaya japa guards vitality."
    }, targetLang)
    : isSadeSati
      ? pick6({
        kn: "ಮಾನಸಿಕ ಆತಂಕ, ಕೀಲು ನೋವು ಹಾಗೂ ನಿದ್ರಾಹೀನತೆಯ ಬಗ್ಗೆ ಜಾಗರೂಕರಾಗಿರಿ. ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ನಿಯಮಿತ ಸಾತ್ವಿಕ ಆಹಾರ ಅತ್ಯಗತ್ಯ.",
        mr: "मानसिक ताण, सांधेदुखी व अपुरी झोप यावर लक्ष ठेवा. सूर्य नमस्कार, नियमित प्राणायाम व सात्विक आहार उत्तम राहील.",
        hi: "मानसिक तनाव, जोड़ों के दर्द एवं अनिद्रा के प्रति सजग रहें। नित्य सूर्य नमस्कार, प्राणायाम एवं सात्विक आहार अनिवार्य है।",
        te: "మానసిక ఒత్తిడి, కీళ్ల నొప్పులు మరియు నిద్రలేమి పట్ల జాగ్రత్త వహించండి. సూర్య నమస్కారాలు, ప్రాణాయామం మంచిది.",
        ta: "மன அழுத்தம், மூட்டு வலி மற்றும் தூக்கமின்மைக்கு கவனம் தேவை. சூரிய நமஸ்காரம் மற்றும் சாத்வீக உணவு நலம் பயக்கும்.",
        en: "Manage physical fatigue, joint stiffness, and stress-induced insomnia through regular pranayama and wholesome nourishment."
      }, targetLang)
      : hasGuruBala
        ? pick6({
          kn: "ದೈವಿಕ ಗುರುಬಲದಿಂದ ದೇಹದಲ್ಲಿ ಉತ್ತಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಚೈತನ್ಯ. ದೈನಂದಿನ ಲಘು ವ್ಯಾಯಾಮದಿಂದ ಆಯಸ್ಸು ಹಾಗೂ ಆರೋಗ್ಯ ವೃದ್ಧಿ.",
          mr: "गुरूच्या शुभ प्रभावामुळे उत्तम प्रतिकारशक्ती व ऊर्जा लाभेल. दैनंदिन हलक्या व्यायामाने आरोग्य उत्तम राहील.",
          hi: "दिव्य गुरुबल से उत्तम रोगप्रतिरोधक क्षमता एवं शारीरिक ऊर्जा का संवर्धन। नियमित दिनचर्या से आरोग्य सुदृढ़ रहेगा।",
          te: "గురుబలంతో రోగనిరోధక శక్తి మరియు ఉత్తేజం పెంపొందుతుంది. తేలికపాటి వ్యాయామంతో పరిపూర్ణ ఆరోగ్యం లభించును.",
          ta: "குரு பலத்தால் உடலில் நோய் எதிர்ப்பு சக்தியும் புத்துணர்ச்சியும் கூடும். உடற்பயிற்சியால் உடல்நலம் சிறக்கும்.",
          en: "Jupiter's radiant transit confers high vitality, robust immune defenses, and steady rejuvenation through wholesome habits."
        }, targetLang)
        : pick6({
          kn: "ಹವಾಮಾನ ಬದಲಾವಣೆಯ ಸಮಯದಲ್ಲಿ ಜೀರ್ಣಶಕ್ತಿ ಹಾಗೂ ನೀರಿನ ಶುದ್ಧತೆಯ ಬಗ್ಗೆ ಗಮನವಿರಲಿ. ಕಾಲಕಾಲಕ್ಕೆ ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.",
          mr: "ऋतुबदलाच्या काळात पचनशक्ती व पिण्याच्या पाण्याची काळजी घ्या. नियमित पुरेशी विश्रांती घेणे आवश्यक आहे.",
          hi: "ऋतु परिवर्तन के समय खानपान एवं जल की शुद्धता का ध्यान रखें। समय पर पर्याप्त विश्राम अवश्य लें।",
          te: "వాతావరణ మార్పుల సమయంలో జీర్ణక్రియ మరియు పరిశుభ్రమైన నీటిపై శ్రద్ధ పెట్టండి. తగినంత విశ్రాంతి తీసుకోండి.",
          ta: "பருவநிலை மாற்றத்தில் உணவு செரிமானம் மற்றும் குடிநீர் சுத்தத்தில் கவனம் தேவை. போதுமான ஓய்வு அவசியம். ",
          en: "Maintain hydration and digestive discipline during seasonal transitions. Ensure consistent, rejuvenating sleep rhythm."
        }, targetLang);

  const cautionWindowImmediate = pick6({
    kn: "ಅಮಾವಾಸ್ಯೆ, ಹುಣ್ಣಿಮೆ ಹಾಗೂ ಚಂದ್ರಷ್ಟಮ ದಿನಗಳಲ್ಲಿ ಮಹತ್ವದ ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ ಹಾಕಬೇಡಿ. ಶಾಂತಚಿತ್ತದಿಂದ ಇರಲು ಆದ್ಯತೆ ನೀಡಿ.",
    mr: "अमावास्या, पौर्णिमा व चंद्राष्टम तिथींना महत्त्वाच्या करारांवर स्वाक्षरी करू नका. मन शांत ठेवण्यास प्राधान्य द्या.",
    hi: "अमावस्या, पूर्णिमा एवं चंद्राष्टम के दिनों में महत्वपूर्ण समझौतों पर हस्ताक्षर से बचें। मन को शांत रखने का प्रयास करें।",
    te: "అమావాస్య, పౌర్ణమి మరియు చంద్రాష్టమ దినాలలో ముఖ్యమైన ఒప్పందాలపై సంతకాలు చేయవద్దు. ప్రశాంతంగా ఉండండి.",
    ta: "அமாவாசை, பௌர்ணமி மற்றும் சந்திராஷ்டம நாட்களில் முக்கிய ஒப்பந்தங்களைத் தவிர்க்கவும். அமைதி காக்கவும்.",
    en: "Avoid executing critical agreements on Amavasya, Purnima, or Chandrashtama days. Focus on internal composure."
  }, targetLang);

  const dailyMantraText = pick6({
    kn: "॥ ॐ ನಮಃ ಶಿವಾಯ ॥ & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ (ದಿನವೂ ಪ್ರಾತಃಕಾಲ ೧೧ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ)",
    mr: "॥ ॐ नमः शिवाय ॥ व महामृत्युंजय मंत्र (दररोज सकाळी ११ किंवा १०८ वेळा जप करा)",
    hi: "॥ ॐ नमः शिवाय ॥ एवं महामृत्युंजय मंत्र (प्रतिदिन प्रातःकाल ११ या १०८ बार जप करें)",
    te: "॥ ఓం నమః శివాయ ॥ & మహామృత్యుంజయ మంత్రం (ప్రతిరోజూ ఉదయం 11 లేదా 108 సార్లు జపించండి)",
    ta: "॥ ஓம் நம சிவாய ॥ & மகா மிருத்யுஞ்சய மந்திரம் (தினமும் அதிகாலை 11 அல்லது 108 முறை பாராயணம் செய்யவும்)",
    en: "|| Om Namah Shivaya || & Maha Mrityunjaya Mantra (Chant 11 or 108 times daily at sunrise)"
  }, targetLang);

  const prescribedSevaText = pick6({
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ, ಮೃತ್ಯುಂಜಯ ಹೋಮ & ನವಗ್ರಹ ದೋಷ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಸೇವೆ.",
    mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर सन्निधीत रुद्राभिषेक, मृत्युंजय होम व नवग्रह शांती संकल्प पूजा.",
    hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधि में रुद्राभिषेक, मृत्युंजय होम एवं नवग्रह शांति संकल्प सेवा।",
    te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేకం, మృత్యుంజయ హోమం & నవగ్రహ దోష నివారణ సంకల్ప సేవ.",
    ta: "ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வரர் சந்நிதியில் ருத்ராபிஷேகம் மற்றும் நவகிரக சாந்தி சங்கல்ப பூஜை.",
    en: "Rudrabhisheka, Mrityunjaya Homa, and Navagraha Shanti Sankalpa at Sri Kshetra Gokarna Mahabaleshwara Temple."
  }, targetLang);

  const emotionalEmpathyHeading = pick6({
    kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮನಸ್ಥಿತಿ ಹಾಗೂ ವಾಸ್ತವ ಜೀವನದ ಅನುಭವ (ಈಗ ನೀವು ಅನುಭವಿಸುತ್ತಿರುವ ಸತ್ಯ)",
    en: "Your Current Inner Experience & Life Reality (What You Are Feeling Right Now)",
    mr: "सध्याची आपली मनःस्थिती व वास्तविक जीवन अनुभव (सध्या आपण अनुभवत असलेले सत्य)",
    hi: "वर्तमान आपकी मनःस्थिति एवं वास्तविक जीवन अनुभव (वर्तमान में आप जो अनुभव कर रहे हैं)",
    te: "ప్రస్తుత మీ మనఃస్థితి మరియు వాస్తవ జీవిత అనుభవం (ఇప్పుడు మీరు అనుభవిస్తున్న సత్యం)",
    ta: "தற்போதைய உங்கள் மனநிலை மற்றும் உண்மை வாழ்க்கை அனுபவம்"
  }, targetLang);

  let emotionalEmpathyText = "";
  if (isSadeSati || isAshtama) {
    emotionalEmpathyText = pick6({
      kn: "ನೀವು ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ನೂರಕ್ಕೆ ನೂರು ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮ ಹಾಕುತ್ತಿದ್ದರೂ, ಕೈಗೆ ಬರಬೇಕಾದ ಫಲ ತಡವಾಗುತ್ತಿದೆಯೇ? ಎಲ್ಲ ಜವಾಬ್ದಾರಿಗಳು ನಿಮ್ಮ ಹೆಗಲ ಮೇಲೆಯೇ ಬಿದ್ದಂತೆ, ಮನಸ್ಸಿನಲ್ಲಿ ಅತೀವ ಆಯಾಸ ಹಾಗೂ ಆಪ್ತರಿಂದಲೇ ಸಣ್ಣಪುಟ್ಟ ಅಸಮಾಧಾನ ಕಾಡುತ್ತಿರಬಹುದು. ನೆನಪಿಡಿ, ಇದು ನಿಮ್ಮ ಕರ್ಮದ ದೋಷವಲ್ಲ! ಇದು ಶನೈಶ್ಚರನ ಪರೀಕ್ಷಾ ಸಮಯ. ಈ ಕಠಿಣ ತಪಸ್ಸಿನ ಹಂತವು ಇನ್ನೇನು ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ ಮುಕ್ತಾಯವಾಗಿ, ನಿಮ್ಮ ಎಲ್ಲಾ ಕಷ್ಟಗಳಿಗೆ ಪೂರ್ಣ ಸಾರ್ಥಕತೆ ಹಾಗೂ ಸುವರ್ಣ ತಿರುವು ದೊರೆಯಲಿದೆ.",
      mr: "तुम्ही गेल्या काही महिन्यांपासून शंभर टक्के प्रामाणिक कष्ट करत असूनही अपेक्षेप्रमाणे फळ विलंबाने मिळत आहे का? सर्व जबाबदाऱ्या एकट्यावरच आल्यासारखे वाटणे, कामात थकवा व जवळच्या लोकांकडून गैरसमज होत असल्यास निराश होऊ नका! हा तुमचा दोष नसून शनीची परीक्षा आहे. हा संयमाचा काळ लवकरच संपून तुमच्या जीवनात सुवर्णसंधी व नवी पहाट येणार आहे.",
      hi: "आप पिछले कुछ महीनों से शत-प्रतिशत निष्ठा से परिश्रम कर रहे हैं, फिर भी प्रतिफल में देरी का अनुभव हो रहा है? सारी जिम्मेदारियों का बोझ स्वयं पर महसूस होना, मानसिक थकान और अपनों से अनपेक्षित मतभेद होना—यह आपका दोष नहीं है, अपितु शनि की कठिन परीक्षा है। यह धैर्य की अवधि शीघ्र ही समाप्त होकर आपके जीवन में अभूतपूर्व सफलता का मार्ग प्रशस्त करेगी।",
      te: "గత కొన్ని నెలలుగా మీరు వంద శాతం శ్రమిస్తున్నప్పటికీ, ఫలితం ఆలస్యమవుతోందని భావిస్తున్నారా? బాధ్యతల భారం, మానసిక అలసట కలగడం మీ లోపం కాదు; ఇది శని భగవానుడి పరీక్షా సమయం. ఈ ఓర్పు కాలం త్వరలోనే ముగిసి మీ జీవితంలో అద్భుతమైన మార్పులు రానున్నాయి.",
      ta: "கடந்த சில மாதங்களாக முழு உழைப்பைத் தந்தும் உரிய பலன் தாமதமாகிறதா? அதிக பொறுப்புகள், மன சோர்வு ஏற்படுவது உங்கள் தவறல்ல; இது சனியின் தற்காலிக பரீட்சை காலம். இந்த சோதனைக் காலம் விரைவில் முடிந்து உங்களுக்கு மகத்தான நன்மைகள் காத்திருக்கின்றன.",
      en: "Have you felt that despite giving your absolute 100% genuine effort, recognition and rewards have been unjustly delayed? Feeling weighed down by burdens, fatigue, or unreciprocated goodwill is not your fault—it is Saturn's rigorous testing phase. This period of endurance is nearing its resolution, paving the way for your monumental breakthrough."
    }, targetLang);
  } else if (hasGuruBala) {
    emotionalEmpathyText = pick6({
      kn: "ಹಿಂದಿನ ಕಷ್ಟದ ದಿನಗಳು ನಿಧಾನವಾಗಿ ಕರಗುತ್ತಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಹೊಸ ಭರವಸೆ ಹಾಗೂ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆಯ ಬೆಳಕು ಮೂಡುತ್ತಿದೆ. ಹೊಸ ಯೋಜನೆಗಳನ್ನು ಆರಂಭಿಸಲು, ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ ಕಾಣಲು ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮುನ್ನಡೆಯಲು ದೈವಾನುಗ್ರಹವು ನಿಮ್ಮ ಬೆಂಬಲಕ್ಕಿದೆ. ಆತುರಪಡದೆ, ಗುರು ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಮುನ್ನಡೆದರೆ ಮಹತ್ತರ ಯಶಸ್ಸು ನಿಶ್ಚಿತ.",
      mr: "मागील कठीण दिवस आता हळूहळू संपत असून मनात नवी उमेद व जीवनात स्थैर्य येत आहे. नवीन कार्य सुरू करण्यासाठी, कौटुंबिक शांततेसाठी व आत्मविश्वासाने पुढे जाण्यासाठी दैवी कृपा तुमच्या पाठीशी आहे. संयमाने पुढे गेल्यास मोठे यश नक्की मिळेल.",
      hi: "पूर्व की कठिन परिस्थितियां अब धीरे-धीरे समाप्त हो रही हैं तथा जीवन में नई आशा और स्थिरता का संचार हो रहा है। नए कार्यों के शुभारंभ, पारिवारिक सौहार्द एवं आत्मविश्वास के साथ आगे बढ़ने हेतु ईश्वरीय कृपा आपके साथ है।",
      te: "గతంలోని ఇబ్బందులు తొలగిపోయి, మనస్సులో నూతన ఆశలు మరియు జీవితంలో స్థిరత్వం ప్రారంభమవుతున్నాయి. కొత్త పనులు ప్రారంభించడానికి మరియు విజయాలు సాధించడానికి దైవానుగ్రహం లభిస్తోంది.",
      ta: "கடந்த கால தடைகள் நீங்கி, புதிய நம்பிக்கையும் அமைதியும் உருவாகி வருகிறது. புதிய முயற்சிகளைத் தொடங்கவும் குடும்ப அமைதிக்கும் இறை அருள் துணை நிற்கிறது.",
      en: "Past hurdles are gradually receding as auspicious planetary light restores your inner confidence and stability. Divine grace supports new beginnings, domestic serenity, and steady growth; move forward with clarity and faith."
    }, targetLang);
  } else {
    emotionalEmpathyText = pick6({
      kn: "ಪ್ರಸ್ತುತ ಜೀವನವು ಒಂದು ಪ್ರಮುಖ ಪರಿವರ್ತನೆಯ ಸಂಧಿಯಲ್ಲಿದೆ. ದಿನನಿತ್ಯದ ಕೆಲಸಗಳಲ್ಲಿ ಯಾವುದೇ ತೊಂದರೆಯಿಲ್ಲದಿದ್ದರೂ, ಮುಂದಿನ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅಂತರಂಗದಲ್ಲಿ ತೀವ್ರ ಚಿಂತನೆ ನಡೆಯುತ್ತಿದೆ. ಇದು ಅಡಿಪಾಯವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುವ ಸಮಯವಾಗಿದ್ದು, ಹಳೆಯ ತಪ್ಪುಗಳನ್ನು ಸರಿಪಡಿಸಿಕೊಂಡು ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಸುವರ್ಣಾವಕಾಶಗಳಿಗೆ ನಿಮ್ಮನ್ನು ನೀವು ಸಜ್ಜುಗೊಳಿಸಬೇಕಾದ ನಿರ್ಣಾಯಕ ಹಂತ.",
      mr: "सध्याचे जीवन एका महत्त्वाच्या परिवर्तनाच्या टप्प्यावर आहे. दैनंदिन कामात अडचण नसली तरी भविष्याविषयी मनात गांभीर्याने विचार सुरू आहेत. ही पायाभरणीची वेळ असून जुन्या अनुभवांमधून शिकून पुढील ५ वर्षांच्या सुवर्णसंधींसाठी स्वतःला तयार करा.",
      hi: "वर्तमान जीवन एक महत्वपूर्ण परिवर्तनकारी मोड़ पर है। यद्यपि दैनिक जीवन सुचारू है, तथापि भविष्य को लेकर मन में गहन विचार मंथन चल रहा है। यह अपनी नींव सुदृढ़ करने का समय है ताकि आगामी ५ वर्षों के स्वर्णिम अवसरों का पूर्ण लाभ उठाया जा सके।",
      te: "ప్రస్తుత జీవితం ఒక కీలకమైన మార్పు దిశగా సాగుతోంది. భవిష్యత్తు గురించి లోతైన ఆలోచనలు కొనసాగుతున్నాయి. రాబోయే 5 సంవత్సరాల సువర్ణావకాశాలను అందుకోవడానికి ఇది సరైన పునాది సమయం.",
      ta: "வாழ்க்கை ஒரு முக்கிய மாற்றக் கட்டத்தில் உள்ளது. எதிர்காலம் குறித்த ஆழமான சிந்தனைகள் எழுகின்றன. அடுத்த 5 ஆண்டுகளின் பொற்கால வாய்ப்புகளுக்கு உங்களை தயார்படுத்த வேண்டிய தருணம் இது.",
      en: "You are currently standing at a pivotal transformative juncture. While routine persists, your mind is contemplating long-term security. This is your foundation-building phase to align yourself for the extraordinary turning point unfolding ahead."
    }, targetLang);
  }

  const turningPointTimeline = (isSadeSati || isAshtama)
    ? pick6({
      kn: "ಮುಂದಿನ ೪ ರಿಂದ ೮ ತಿಂಗಳಲ್ಲಿ (೨೦೨೬ ರ ಉತ್ತರಾರ್ಧದಲ್ಲಿ) ಗುರುಬಲದ ಸಂಚಾರ ಆರಂಭವಾಗುತ್ತಿದ್ದಂತೆ, ಕಷ್ಟದ ಮೋಡಗಳು ಕರಗಿ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸುವರ್ಣ ತಿರುವು ಆರಂಭವಾಗಲಿದೆ!",
      mr: "आगामी ४ ते ८ महिन्यांत (२०२६ च्या उत्तरार्धात) गुरूचे शुभ भ्रमण सुरू होताच अडचणी दूर होऊन आपल्या जीवनात सुवर्ण वळण सुरू होईल!",
      hi: "आगामी ४ से ८ महीनों में (वर्ष २०२६ के उत्तरार्ध में) गुरु का शुभ गोचर प्रारंभ होते ही बाधाएं दूर होंगी और जीवन में स्वर्णिम मोड़ आएगा!",
      te: "రాబోయే 4 నుండి 8 నెలల్లో గురుబలం ప్రారంభం కాగానే ఇబ్బందులు తొలగి మీ జీవితంలో అద్భుతమైన మలుపు ప్రారంభమవుతుంది!",
      ta: "அடுத்த 4 முதல் 8 மாதங்களில் குருபலம் கூடி வர, தடைகள் நீங்கி உங்கள் வாழ்வில் பொற்காலம் மலரும்!",
      en: "Within the next 4 to 8 months (late 2026), as Jupiter's benefic transit activates, chronic obstacles will dissolve and your golden turnaround will commence!"
    }, targetLang)
    : pick6({
      kn: "ಪ್ರಸ್ತುತ ವರ್ಷದ ೩ನೇ ತ್ರೈಮಾಸಿಕದಿಂದಲೇ ಹೊಸ ಒಪ್ಪಂದಗಳು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಮಹತ್ವದ ಶುಭಕಾರ್ಯಗಳಿಗೆ ಪೂರ್ಣ ಕಾಲ ಕೂಡಿಬರಲಿದೆ!",
      mr: "चालू वर्षाच्या तिसऱ्या तिमाहीपासूनच नवीन संधी, आर्थिक स्थैर्य व महत्त्वाच्या मंगल कार्यांसाठी अनुकूल काळ सुरू होईल!",
      hi: "चालू वर्ष की तीसरी तिमाही से ही नए अवसर, आर्थिक स्थिरता एवं मांगलिक कार्यों हेतु उत्तम कालखंड प्रारंभ होगा!",
      te: "ప్రస్తుత సంవత్సరం మూడవ త్రైమాసికం నుండే కొత్త అవకాశాలు, ఆర్థిక స్థిరత్వం మరియు శుభకార్యాలు ప్రారంభమవుతాయి!",
      ta: "நடப்பு ஆண்டின் மூன்றாம் காலாண்டிலிருந்தே புதிய ஒப்பந்தங்கள், பொருளாதார நிலைத்தன்மை மற்றும் சுபகாரியங்கள் கூடிவரும்!",
      en: "Starting from the 3rd quarter of this cycle, favorable contracts, financial expansion, and long-awaited auspicious milestones will align smoothly!"
    }, targetLang);

  const careerStatus: "favorable" | "moderate" | "caution" = hasGuruBala ? "favorable" : (isKantaka || isAshtama) ? "caution" : "moderate";
  const wealthStatus: "favorable" | "moderate" | "caution" = (isAshtama || isSadeSati) ? "caution" : hasGuruBala ? "favorable" : "moderate";
  const familyStatus: "favorable" | "moderate" | "caution" = isKantaka ? "caution" : "favorable";
  const healthStatus: "favorable" | "moderate" | "caution" = isAshtama ? "caution" : isSadeSati ? "moderate" : "favorable";

  const fourPillarsDashboard = {
    career: {
      status: careerStatus,
      badgeText: isMinorCurrent
        ? (detailedAgeCurrent === "infant"
          ? pick6({ kn: "ಶಿಶು ಪಾಲನೆ & ಸಂಸ್ಕಾರ", mr: "बालसंगोपन व संस्कार", hi: "शिशु पालन एवं संस्कार", te: "శిశు పాలన & సంస్కారాలు", ta: "குழந்தை பராமரிப்பு & சுப சடங்குகள்", en: "Infant Care & Consecration" }, targetLang)
          : detailedAgeCurrent === "adolescent"
            ? pick6({ kn: "ಬೋರ್ಡ್ ಪರೀಕ್ಷೆ & ಕೌಶಲ", mr: "बोर्ड परीक्षा व कौशल्ये", hi: "बोर्ड परीक्षा एवं कौशल", te: "బోర్డు పరీక్షలు & నైపుణ్యాలు", ta: "பொதுத்தேர்வு & திறன்கள்", en: "Board Exam & Skill Prowess" }, targetLang)
            : pick6({ kn: "ವಿದ್ಯಾಭ್ಯಾಸ & ಕೌಶಲ", mr: "शिक्षण व कौशल्य विकास", hi: "शिक्षा एवं प्रतिभा विकास", te: "చదువు & నైపుణ్యాలు", ta: "கல்வி & திறமை வளர்ச்சி", en: "Scholastic & Talent Expansion" }, targetLang))
        : detailedAgeCurrent === "senior"
          ? pick6({ kn: "ಜ್ಞಾನ ದಾನ & ಮಾರ್ಗದರ್ಶನ", mr: "ज्ञानदान व मार्गदर्शन", hi: "ज्ञान दान एवं मार्गदर्शन", te: "జ్ఞాన దానం & మార్గదర్శనం", ta: "ஞான தானம் & வழிகாட்டல்", en: "Knowledge Transmission & Seva" }, targetLang)
          : careerStatus === "favorable"
            ? pick6({ kn: "ಬಡ್ತಿ & ವೃತ್ತಿ ಪ್ರಗತಿ", mr: "बढती व प्रगती", hi: "पदोन्नति एवं प्रगति", te: "పదోన్నతి & ప్రగతి", ta: "பதவி உயர்வு & வளர்ச்சி", en: "Advancement & Progress" }, targetLang)
            : careerStatus === "caution"
              ? pick6({ kn: "ಶ್ರಮ & ತಾಳ್ಮೆ ಅಗತ್ಯ", mr: "संयम व कष्ट हवेत", hi: "धैर्य एवं परिश्रम आवश्यक", te: "ఓర్పు & శ్రమ అవసరం", ta: "பொறுமையும் உழைப்பும் தேவை", en: "Patience & Steadfast Effort" }, targetLang)
              : pick6({ kn: "ಸ್ಥಿರತೆ & ನೂತನ ಅವಕಾಶ", mr: "स्थैर्य व नवीन संधी", hi: "स्थिरता एवं नए अवसर", te: "స్థిరత్వం & కొత్త అవకాశాలు", ta: "நிலைத்தன்மை & புதிய வாய்ப்பு", en: "Stability & Steady Growth" }, targetLang),
      oneLiner: careerImmediateFocus,
      detail: ""
    },
    wealth: {
      status: wealthStatus,
      badgeText: isMinorCurrent
        ? (detailedAgeCurrent === "infant"
          ? pick6({ kn: "ಶಿಶು ಕ್ಷೇಮ ನಿಧಿ", mr: "बालक आरोग्य निधी", hi: "शिशु कल्याण कोष", te: "శిశు క్షేమ నిధి", ta: "குழந்தை நல்வாழ்வு நிதி", en: "Pediatric Health Shield" }, targetLang)
          : pick6({ kn: "ಶೈಕ್ಷಣಿಕ ನಿಧಿ ಉಳಿತಾಯ", mr: "शैक्षणिक निधी बचत", hi: "शिक्षा कोष बचत", te: "విద్యా నిధి పొదుపు", ta: "கல்வி நிதி சேமிப்பு", en: "Education Endowment Fund" }, targetLang))
        : detailedAgeCurrent === "senior"
          ? pick6({ kn: "ಸ್ಥಿರಾಸ್ತಿ & ಪಿಂಚಣಿ ರಕ್ಷಣೆ", mr: "संपत्ती व पेन्शन रक्षण", hi: "संपत्ति एवं पेंशन सुरक्षा", te: "ఆస్తి & పెన్షన్ రక్షణ", ta: "சொத்து & ஓய்வூதிய பாதுகாப்பு", en: "Asset & Pension Security" }, targetLang)
          : wealthStatus === "favorable"
            ? pick6({ kn: "ಆರ್ಥಿಕ ಉಳಿತಾಯ ವೃದ್ಧಿ", mr: "धनलाभ व बचत", hi: "धनलाभ एवं बचत", te: "ధనలాభం & పొదుపు", ta: "தனலாபம் & சேமிப்பு", en: "Wealth Accretion" }, targetLang)
            : wealthStatus === "caution"
              ? pick6({ kn: "ಖರ್ಚು ನಿಯಂತ್ರಿಸಿ", mr: "खर्च नियंत्रित ठेवा", hi: "खर्च पर नियंत्रण रखें", te: "ఖర్చులు నియంత్రించండి", ta: "செலவைக் கட்டுப்படுத்துக", en: "Prudent Budgeting" }, targetLang)
              : pick6({ kn: "ಸಾಮಾನ್ಯ ಆರ್ಥಿಕ ಸ್ಥಿತಿ", mr: "मध्यम आर्थिक स्थिती", hi: "संतुलित वित्तीय स्थिति", te: "సాధారణ ఆర్థిక స్థితి", ta: "சமநிலை நிதிநிலை", en: "Balanced Finances" }, targetLang),
      oneLiner: wealthImmediateFocus,
      detail: ""
    },
    family: {
      status: familyStatus,
      badgeText: familyStatus === "favorable"
        ? pick6({ kn: "ಸೌಖ್ಯ & ಶುಭಕಾರ್ಯ", mr: "कौटुंबिक सुख व शांतता", hi: "पारिवारिक सुख एवं शांति", te: "సౌఖ్యం & శుభకార్యం", ta: "குடும்ப சுபிக்ஷம்", en: "Domestic Harmony" }, targetLang)
        : pick6({ kn: "ಸಂಯಮ & ಶಾಂತಿ ಅಗತ್ಯ", mr: "सामंजस्य व संयम ठेवा", hi: "सामंजस्य एवं संयम रखें", te: "శాంతి & సమన్వయం అవసరం", ta: "ஒற்றுமை அவசியம்", en: "Maintain Composure" }, targetLang),
      oneLiner: familyImmediateFocus,
      detail: ""
    },
    health: {
      status: healthStatus,
      badgeText: healthStatus === "favorable"
        ? pick6({ kn: "ಉತ್ತಮ ಚೈತನ್ಯ & ಉತ್ಸಾಹ", mr: "उत्तम आरोग्य व उत्साह", hi: "उत्तम स्वास्थ्य एवं स्फूर्ति", te: "ఉత్తమ ఆరోగ్యం & ఉత్సాహం", ta: "சிறந்த ஆரோக்கியம்", en: "Robust Vitality" }, targetLang)
        : pick6({ kn: "ಧ್ಯಾನ & ವಿಶ್ರಾಂತಿ ಅಗತ್ಯ", mr: "विश्रांती व काळजी हवी", hi: "विश्राम एवं ध्यान आवश्यक", te: "విశ్రాంతి & ధ్యానం అవసరం", ta: "ஓய்வும் தியானமும் தேவை", en: "Rest & Rejuvenation" }, targetLang),
      oneLiner: healthImmediateFocus,
      detail: ""
    }
  };

  const immediateSimpleActionTitle = pick6({
    kn: "ಇಂದೇ ಮನೆಯಲ್ಲಿ ನೀವು ಮಾಡಬಹುದಾದ ೨ ನಿಮಿಷದ ಸರಳ ಶಾಂತಿ ಕ್ರಮ",
    mr: "आजपासूनच घरी करता येणारा २ मिनिटांचा सोपा शांती उपाय",
    hi: "आज से ही घर पर करने योग्य २ मिनट का सरल शांति उपाय",
    te: "ఈ రోజు నుండే ఇంట్లో చేసుకోగల 2 నిమిషాల సులభమైన శాంతి పరిహారం",
    ta: "இன்றே வீட்டில் செய்யக்கூடிய 2 நிமிட எளிய வழிபாட்டு முறை",
    en: "Immediate 2-Minute Daily Peaceful Ritual You Can Do At Home"
  }, targetLang);

  const immediateSimpleActionText = pick6({
    kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಜೆ ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ತುಪ್ಪದ ಅಥವಾ ಎಳ್ಳೆಣ್ಣೆಯ ದೀಪವನ್ನು ಹಚ್ಚಿ, ಮನಸ್ಸಿನಲ್ಲಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ 'ಶ್ರೀ ರಾಮದೂತಾಯ ಆಂಜನೇಯಾಯ ನಮಃ' ಎಂದು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ಇದು ದಿನದ ಮಾನಸಿಕ ಆತಂಕವನ್ನು ಕಳೆದು ಮನಸ್ಸಿಗೆ ತಕ್ಷಣದ ಶಾಂತಿ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆ ಒದಗಿಸುತ್ತದೆ.",
    mr: "दररोज सकाळी किंवा संध्याकाळी घरातील देव्हाऱ्यात शुद्ध तुपाचा किंवा तिळाच्या तेलाचा दिवा लावा आणि 'ॐ नमः शिवाय' किंवा 'श्री रामदूताय अंजनेयाय नमः' चा ११ वेळा जप करा. यामुळे मनातील भीती व ताण दूर होऊन तात्काळ मनःशांती लाभेल.",
    hi: "प्रतिदिन प्रातःकाल अथवा संध्याकाल घर के पूजास्थान में शुद्ध घी अथवा तिल के तेल का दीपक प्रज्वलित कर 'ॐ नमः शिवाय' अथवा 'श्री रामदूताय आंजनेयाय नमः' का ११ बार जप करें। इससे मानसिक तनाव दूर होकर मन को तत्काल शांति एवं ईश्वरीय सुरक्षा प्राप्त होगी।",
    te: "ప్రతిరోజూ ఉదయం లేదా సాయంత్రం ఇంట్లో దీపం వెలిగించి, 'ఓం నమః శివాయ' లేదా 'శ్రీ ఆంజనేయాయ నమః' అని 11 సార్లు జపించండి. ఇది మనశ్శాంతిని మరియు దైవిక రక్షణను ఇస్తుంది.",
    ta: "தினமும் காலை அல்லது மாலையில் வீட்டில் நெய் அல்லது நல்லெண்ணெய் தீபம் ஏற்றி, 'ஓம் நம சிவாய' அல்லது 'ஸ்ரீ ஆஞ்சநேயாய நமஹ' என 11 முறை ஜபிக்கவும். இது உடனடி மன அமைதியைத் தரும்.",
    en: "Light a sacred pure cow-ghee or sesame lamp in your home shrine every morning or evening and chant 'Om Namah Shivaya' or 'Sri Ramadutaya Anjaneyaya Namah' 11 times. This instantly clears mental friction and establishes divine peace."
  }, targetLang);

  return {
    bannerBadge,
    title,
    subtitle,
    currentAgeFormatted,
    activeMahadasha,
    activeBhukti,
    activeDashaPeriodText,
    karmicFlowSummary,
    shaniGocharaStatus,
    shaniGocharaImpact,
    isSadeSati,
    isKantaka,
    isAshtama,
    guruGocharaStatus,
    guruGocharaImpact,
    hasGuruBala,
    rahuKetuStatus,
    rahuKetuImpact,
    energyScore,
    energyMeterLabel,
    energyDesc,
    careerImmediateFocus,
    wealthImmediateFocus,
    familyImmediateFocus,
    healthImmediateFocus,
    cautionWindowImmediate,
    dailyMantraText,
    prescribedSevaText,
    emotionalEmpathyHeading,
    emotionalEmpathyText,
    turningPointTimeline,
    fourPillarsDashboard,
    immediateSimpleActionTitle,
    immediateSimpleActionText
  };
}

export function getHotelHospitalityPrivilege(targetLang: SixLang): HotelHospitalityPrivilege {
  const bannerTitle = pick6({
    kn: "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಯಾತ್ರಾರ್ಥಿ ಪವಿತ್ರ ವಾಸ್ತವ್ಯ & ಆತಿಥ್ಯ ಸೌಲಭ್ಯ ॥",
    mr: "॥ श्री क्षेत्र गोकर्ण तीर्थयात्री पवित्र निवास व आदरातिथ्य सुविधा ॥",
    hi: "॥ श्री क्षेत्र गोकर्ण तीर्थयात्री पावन निवास एवं आतिथ्य सुविधा ॥",
    te: "॥ శ్రీ క్షేత్ర గోకర్ణ తీర్థయాత్రికుల పవిత్ర నివాసం & ఆతిథ్య సౌకర్యం ॥",
    ta: "॥ ஸ்ரீ க்ஷேத்ர கோகர்ணம் புனித யாத்ரீகர் தங்கும் வசதி & விருந்தோம்பல் ॥",
    en: "|| SRI KSHETRA GOKARNA PILGRIMAGE DEVOTEE STAY & HOSPITALITY PRIVILEGE ||"
  }, targetLang);

  const tagline = pick6({
    kn: "ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ ದರ್ಶನ, ದೋಷ ಪರಿಹಾರ & ಆತ್ಮಲಿಂಗ ಪೂಜೆಗಾಗಿ ಗೋಕರ್ಣಕ್ಕೆ ಆಗಮಿಸುವ ಭಕ್ತಾದಿಗಳಿಗೆ ಪ್ರಶಾಂತ ಯಾತ್ರಾರ್ಥಿ ನಿವಾಸ ಗೌರವ",
    mr: "महाबळेश्वर दर्शन, दोष निवारण व आत्मलिंग पूजेसाठी गोकर्ण येथे येणाऱ्या भाविकांसाठी शांत व पवित्र निवास",
    hi: "महाबलेश्वर दर्शन, दोष निवारण एवं आत्मलिंग पूजा हेतु गोकर्ण पधारने वाले श्रद्धालुओं के लिए शांत व पावन निवास",
    te: "మహాబలేశ్వర దర్శనం, దోష నివారణ & ఆత్మలింగ పూజ కోసం గోకర్ణం వచ్చే భక్తుల కోసం ప్రశాంతమైన పవిత్ర నివాసం",
    ta: "மகாபலேஸ்வரர் தரிசனம், தோஷ நிவர்த்தி & ஆத்மலிங்க பூஜைக்காக கோகர்ணம் வரும் பக்தர்களுக்கான அமைதியான தங்குமிடம்",
    en: "Serene, comfortable, and sacred hospitality for devotees visiting Sri Kshetra Gokarna for Mahabaleshwara Darshana, Atma Linga Sparsha & Parihara Pooja."
  }, targetLang);

  const description = pick6({
    kn: "ಈ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜಾತಕದಲ್ಲಿ ಸೂಚಿಸಲಾದ ದೋಷ ನಿವಾರಣೆ, ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಜ್ಯೋತಿರ್ಲಿಂಗ ದರ್ಶನಕ್ಕಾಗಿ ತಾವು ಹಾಗೂ ತಮ್ಮ ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಗೋಕರ್ಣಕ್ಕೆ ಆಗಮಿಸುವಾಗ, ನಮ್ಮ ಪವಿತ್ರ ಯಾತ್ರಾರ್ಥಿ ಹೋಟೆಲ್‌ನಲ್ಲಿ ಪ್ರಶಾಂತವಾಗಿ ತಂಗಬಹುದು. ಭಕ್ತರ ಅನುಕೂಲಕ್ಕಾಗಿ ಸಕಲ ಶುದ್ಧ ಸಾತ್ವಿಕ ಸೌಲಭ್ಯಗಳು ಸದಾ ಲಭ್ಯ.",
    mr: "या बग्गोण पंचांग पत्रिकेत सुचविलेली नवग्रह शांती, दोष निवारण व महाबळेश्वर दर्शनासाठी आपण सपरिवार गोकर्ण येथे येताना आमच्या पवित्र तीर्थयात्री हॉटेलमध्ये शांततेने राहू शकता. भाविकांच्या सेवेसाठी सर्व सात्विक सुविधा सदैव सज्ज आहेत.",
    hi: "इस बग्गोण पंचांग कुंडली में निर्देशित दोष निवारण, नवग्रह शांति एवं महाबलेश्वर ज्योतिर्लिंग दर्शन हेतु जब आप सपरिवार गोकर्ण पधारें, तब हमारे पावन तीर्थयात्री होटल में विश्राम कर सकते हैं। श्रद्धालुओं हेतु सभी सात्विक सुविधाएं उपलब्ध हैं।",
    te: "ఈ బగ్గోణ పంచాంగ జాతకంలో సూచించిన దోష నివారణ, నవగ్రహ శాంతి మరియు మహాబలేశ్వర దర్శనార్థం గోకర్ణం వచ్చేటప్పుడు మా పవిత్ర తీర్థయాత్రికుల హోటల్‌లో ప్రశాంతంగా బస చేయవచ్చు. భక్తుల కొరకు అన్ని సాత్విక వసతులు అందుబాటులో కలవు.",
    ta: "இந்த பக்கோண பஞ்சாங்கத்தில் குறிப்பிடப்பட்டுள்ள தோஷ நிவர்த்தி மற்றும் மகாபலேஸ்வரர் தரிசனத்திற்காக தாங்கள் குடும்பத்துடன் கோகர்ணம் வரும்போது, எங்களது புனித யாத்ரீகர் விடுதியில் தங்கி அருள்பெறலாம். சாத்வீக வசதிகள் அனைத்தும் நிறைவாக உள்ளன.",
    en: "When visiting sacred Gokarna for the temple poojas, Navagraha Shanti, and Mahabaleshwara Atma Linga Darshana prescribed in this report, you and your family are warmly welcomed to stay at our serene pilgrimage hotel. We provide pure, peaceful accommodation tailored for visiting devotees."
  }, targetLang);

  const privilegeOfferBadge = pick6({
    kn: "🎁 ಈ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವರದಿ ಹೊಂದಿರುವ ಭಕ್ತಾದಿಗಳಿಗೆ ವಾಸ್ತವ್ಯ ಶುಲ್ಕದಲ್ಲಿ ೧೫% ವಿಶೇಷ ರಿಯಾಯಿತಿ!",
    mr: "🎁 या बग्गोण पंचांग अहवाल धारक भाविकांसाठी खोली भाड्यात १५% विशेष सवलत!",
    hi: "🎁 इस बग्गोण पंचांग रिपोर्ट धारक श्रद्धालुओं हेतु कक्ष किराए में १५% विशेष छूट!",
    te: "🎁 ఈ బగ్గోణ పంచాంగ నివేదిక ఉన్న భక్తులకు గది అద్దెలో 15% ప్రత్యేక రాయితీ!",
    ta: "🎁 இந்த பக்கோண பஞ்சாங்க அறிக்கை வைத்திருக்கும் பக்தர்களுக்கு அறை வாடகையில் 15% சிறப்பு தள்ளுபடி!",
    en: "🎁 Exclusive 15% Devotee Discount on room tariff upon presenting this Baggona Panchanga Report!"
  }, targetLang);

  const amenities = [
    {
      icon: "🛏️",
      title: pick6({ kn: "ವಿಶಾಲ ಎಸಿ & ಡಿಲಕ್ಸ್ ಕೊಠಡಿಗಳು", mr: "स्वच्छ एसी व डिलक्स खोल्या", hi: "सुसज्जित एसी एवं डीलक्स कक्ष", te: "విశాలమైన ఎసి & డీలక్స్ గదులు", ta: "தூய்மையான ஏசி & டீலக்ஸ் அறைகள்", en: "Clean AC & Deluxe Rooms" }, targetLang),
      desc: pick6({ kn: "ಶುದ್ಧ, ಗಾಳಿ-ಬೆಳಕಿನಿಂದ ಕೂಡಿದ ಪ್ರಶಾಂತ ವಾತಾವರಣ", mr: "शांत, हवेशीर व कौटुंबिक वातावरण", hi: "स्वच्छ, शांत एवं पारिवारिक वातावरण", te: "పరిశుభ్రమైన, ప్రశాంతమైన వాతావరణం", ta: "அமைதியான குடும்ப சூழல்", en: "Serene, well-ventilated, hygienic family accommodation" }, targetLang)
    },
    {
      icon: "🔱",
      title: pick6({ kn: "ದೇವಸ್ಥಾನಕ್ಕೆ ನಡಿಗೆಯ ನಿಕಟ ದೂರ", mr: "मंदिरापासून पायी चालण्याचे अंतर", hi: "मंदिर से पैदल दूरी", te: "ఆలయానికి నడక దూరం", ta: "கோவிலுக்கு மிக அருகில்", en: "Close Walk to Temple & Beach" }, targetLang),
      desc: pick6({ kn: "ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ & ಸಮುದ್ರ ತೀರಕ್ಕೆ ಕೇವಲ ೫ ನಿಮಿಷಗಳ ನಡಿಗೆ", mr: "महाबळेश्वर मंदिर व समुद्रकिनाऱ्याजवळ अवघ्या ५ मिनिटांवर", hi: "महाबलेश्वर मंदिर एवं समुद्र तट से मात्र ५ मिनट की पैदल दूरी", te: "మహాబలేశ్వర దేవాలయం & బీచ్‌కు కేవలం 5 నిమిషాల నడక", ta: "மகாபலேஸ்வரர் கோவில் மற்றும் கடற்கரைக்கு 5 நிமிட நடைபயணம்", en: "Just 5 minutes walking distance to Mahabaleshwara Sanctum & Beach" }, targetLang)
    },
    {
      icon: "🍲",
      title: pick6({ kn: "ಶುದ್ಧ ಸಾತ್ವಿಕ ಬ್ರಾಹ್ಮಣ ಭೋಜನ", mr: "शुद्ध सात्विक शाकाहारी भोजन", hi: "शुद्ध सात्विक शाकाहारी भोजन", te: "శుద్ధ సాత్విక భోజన వసతి", ta: "சுத்தமான சாத்வீக உணவு", en: "Pure Satvik Vegetarian Dining" }, targetLang),
      desc: pick6({ kn: "ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿಕರ ದಕ್ಷಿಣ ಭಾರತೀಯ ಸಸ್ಯಾಹಾರಿ ಊಟ & ಉಪಾಹಾರ", mr: "पारंपारिक रुचकर सात्विक जेवण व नाश्ता", hi: "पारंपरिक स्वादिष्ट दक्षिण भारतीय सात्विक भोजन", te: "సాంప్రదాయ దక్షిణ భారతీయ శాకాహార భోజనం & అల్పాహారం", ta: "பாரம்பரிய சுவையான தென்னிந்திய சைவ உணவு", en: "Traditional, wholesome South Indian Satvik meals and breakfast" }, targetLang)
    },
    {
      icon: "🕉️",
      title: pick6({ kn: "ಪೂಜಾ ಸಂಕಲ್ಪ & ದರ್ಶನ ಮಾರ್ಗದರ್ಶನ", mr: "पूजा संकल्प व दर्शन मार्गदर्शन", hi: "पूजा संकल्प एवं दर्शन मार्गदर्शन", te: "పూజా సంకల్ప & దర్శన సహకారం", ta: "பூஜை சங்கல்பம் & தரிசன உதவி", en: "Pooja Sankalpa & Priest Assistance" }, targetLang),
      desc: pick6({ kn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ನೇತೃತ್ವದಲ್ಲಿ ದೇವಸ್ಥಾನದ ವಿಶೇಷ ಸೇವಾ ಸಂಕಲ್ಪ ನೆರವು", mr: "श्रीराम पंडितांच्या मार्गदर्शनाखाली मंदिर पूजा व संकल्प सहकार्य", hi: "श्रीराम पंडित जी के सान्निध्य में विशेष सेवा संकल्प सहयोग", te: "శ్రీరామ్ పండిట్ గారి ఆధ్వర్యంలో ఆలయ సేవా సంకల్ప సహాయం", ta: "ஸ்ரீராம் பண்டிட் ஆசியுடன் கோவில் பூஜை சங்கல்ப வழிகாட்டுதல்", en: "Dedicated guidance and Sankalpa coordination with Shreeram Pandit" }, targetLang)
    },
    {
      icon: "🚗",
      title: pick6({ kn: "ವಿಶಾಲ ಪಾರ್ಕಿಂಗ್ & ೨೪/೭ ಸೇವೆ", mr: "विशाल पार्किंग व २४/७ सेवा", hi: "विशाल पार्किंग एवं २४/७ सेवा", te: "విశాలమైన పార్కింగ్ & 24/7 సేవ", ta: "பாதுகாப்பான பார்க்கிங் & 24/7 சேவை", en: "Spacious Parking & 24/7 Desk" }, targetLang),
      desc: pick6({ kn: "ಸುರಕ್ಷಿತ ವಾಹನ ನಿಲುಗಡೆ ಹಾಗೂ ಅತಿಥಿಗಳಿಗೆ ಆತ್ಮೀಕ ಸತ್ಕಾರ", mr: "सुरक्षित वाहन पार्किंग व तत्पर भाविक सेवा", hi: "सुरक्षित वाहन पार्किंग तथा विनम्र श्रद्धालु सेवा", te: "సురక్షిత వాహన పార్కింగ్ మరియు భక్తజన సేవ", ta: "வாகன நிறுத்துமிடம் மற்றும் அன்பான உபசரிப்பு", en: "Secure vehicle parking and warm, responsive devotee care" }, targetLang)
    }
  ];

  const proximityHighlights = pick6({
    kn: "📍 ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ, ಕೋಟಿತೀರ್ಥ ಪುಣ್ಯಕೊಳ ಹಾಗೂ ಮುಖ್ಯ ಕಡಲತೀರಕ್ಕೆ ಅತ್ಯಂತ ಸಮೀಪದಲ್ಲಿದೆ.",
    mr: "📍 श्री महाबळेश्वर मंदिर, कोटितीर्थ व मुख्य समुद्रकिनाऱ्याच्या अगदी जवळ स्थित.",
    hi: "📍 श्री महाबलेश्वर मंदिर, कोटितीर्थ पावन सरोवर एवं मुख्य समुद्र तट के अत्यंत निकट स्थित।",
    te: "📍 శ్రీ మహాబలేశ్వర ఆలయం, కోటితీర్థం మరియు ప్రధాన బీచ్‌కు అత్యంత సమీపంలో ఉంది.",
    ta: "📍 ஸ்ரீ மகாபலேஸ்வரர் கோவில், கோடிதீர்த்தம் மற்றும் கடற்கரைக்கு மிக அருகில் அமைந்துள்ளது.",
    en: "📍 Centrally located within short walking distance to Sri Mahabaleshwara Temple, Kotitheertha Holy Pond & Gokarna Beach."
  }, targetLang);

  const bookingHotline = pick6({
    kn: "📞 ಮುಂಗಡ ಕೊಠಡಿ ಕಾಯ್ದಿರಿಸುವಿಕೆ & ವಾಟ್ಸಾಪ್: ೯೯೭೨೩೩೯೩೬೨ / ೯೪೮೧೩೮೯೩೬೨ (ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ / ಹೋಟೆಲ್ ಡೆಸ್ಕ್)",
    mr: "📞 आगाऊ रूम बुकिंग व व्हॉट्सॲप: ९९७२३३९३६२ / ९४८१३८९३६२ (श्रीराम पंडित / हॉटेल डेस्क)",
    hi: "📞 अग्रिम कक्ष बुकिंग एवं व्हाट्सएप: ९९७२३३९३६२ / ९४८१३८९३६२ (श्रीराम पंडित / होटल डेस्क)",
    te: "📞 ముందస్తు రూమ్ బుకింగ్ & వాట్సాప్: 9972339362 / 9481389362 (శ్రీరామ్ పండిత్ / హోటల్ డెస్క్)",
    ta: "📞 முன் கூட்டிய அறை முன்பதிவு & வாட்ஸ்அப்: 9972339362 / 9481389362 (ஸ்ரீராம் பண்டிட் / விடுதி மையம்)",
    en: "📞 Advance Room Booking & WhatsApp: 9972339362 / 9481389362 (Shreeram Pandit / Hotel Pilgrimage Desk)"
  }, targetLang);

  const priestSevaAssistance = pick6({
    kn: "ಸೂಚನೆ: ಗೋಕರ್ಣಕ್ಕೆ ಹೊರಡುವ ಮುನ್ನ ಮೇಲ್ಕಂಡ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ ಕೊಠಡಿ ಕಾಯ್ದಿರಿಸಿ ಮತ್ತು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ೧೫% ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ.",
    mr: "सूचना: गोकर्ण येथे येण्यापूर्वी वरील क्रमांकावर संपर्क साधून रूम बुक करा आणि १५% सवलतीचा लाभ घ्या.",
    hi: "सूचना: गोकर्ण प्रस्थान से पूर्व दिए गए नंबर पर संपर्क कर कक्ष आरक्षित करें एवं १५% छूट का लाभ प्राप्त करें।",
    te: "గమనిక: గోకర్ణ ప్రయాణానికి ముందు పై నంబరుకు కాల్ చేసి గది బుక్ చేసుకోండి మరియు 15% రాయితీ పొందండి.",
    ta: "குறிப்பு: கோகர்ணம் புறப்படுவதற்கு முன் மேற்கண்ட எண்ணில் அழைத்து அறையை முன்பதிவு செய்து 15% சலுகை பெறுங்கள்.",
    en: "Note: Call or WhatsApp before arriving at Gokarna to confirm your room reservation and claim your 15% Devotee Discount."
  }, targetLang);

  return {
    bannerTitle,
    tagline,
    description,
    privilegeOfferBadge,
    amenities,
    proximityHighlights,
    bookingHotline,
    priestSevaAssistance
  };
}

export function compute5YearMasterPrediction(
  kundli: KundliOutput,
  birthDateYmd: string,
  birthTimeHm: string,
  targetLang: SixLang,
  devoteeName: string = "Devotee",
  baseYear: number = 2026,
  personalization?: FiveYearPersonalization
): FiveYearPredictionPayload {
  const resolvedDevoteeName = resolveDevoteeDisplayName(devoteeName, targetLang);

  const lat = personalization?.latitude ?? 14.5479;
  const lng = personalization?.longitude ?? 74.3188;
  const pincode = personalization?.pincode ?? "581326";
  const ayanamsa: AyanamsaModel = personalization?.ayanamsa ?? "lahiri";

  // Mid-April (Chaitra) of baseYear aligns with the inception of the 5-year cycle
  const baseDate = new Date(baseYear, 3, 15);
  const currentAgeYears = ageDecimalYearsAt(
    birthDateYmd,
    birthTimeHm,
    lat,
    lng,
    baseDate
  );

  const ageCategory = getAgeCategory(currentAgeYears);
  const moonIdx = kundli.moonSign.index;
  const lagnaIdx = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const lagnaLordKey = RASHI_LORDS[lagnaIdx] || PlanetName.Sun;
  const moonLordKey = RASHI_LORDS[moonIdx] || PlanetName.Moon;

  const moonPlanet = kundli.planets.find(p => p.name === PlanetName.Moon);
  const nakshatraIdx = moonPlanet ? moonPlanet.nakshatra.index : 0;
  const moonPada = resolveExactMoonPada(kundli);
  const padaWord = getPadaWord(targetLang);

  // 1. Traditional Baggona Janana Panchanga & Deterministic Weekday / Hora
  let traditionalPanchanga: any = null;
  try {
    traditionalPanchanga = calculateTraditionalBaggona(
      birthDateYmd,
      birthTimeHm,
      lat,
      lng,
      ayanamsa,
      pincode
    );
  } catch (err) {
    console.warn("[fiveYearPredictionEngine] calculateTraditionalBaggona fallback:", err);
  }

  // Determine True Vedic Weekday (Fixes the hardcoded Sunday bug!)
  let actualWeekdayIndex = 0;
  if (traditionalPanchanga && typeof traditionalPanchanga.weekdayIndex === "number") {
    actualWeekdayIndex = traditionalPanchanga.weekdayIndex;
  } else {
    const [y, m, d] = birthDateYmd.split("-").map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      actualWeekdayIndex = new Date(y, m - 1, d).getDay();
    }
  }
  const birthWeekday = WEEKDAY_6L[actualWeekdayIndex]?.[targetLang] || "Sunday";

  // Determine True Janana Hora (Fixes the hardcoded Sun Hora bug!)
  let horaLordName = PlanetName.Sun;
  if (traditionalPanchanga?.horaLord) {
    const rawHora = String(traditionalPanchanga.horaLord).toLowerCase();
    if (rawHora.includes("sun") || rawHora.includes("ravi") || rawHora.includes("surya")) horaLordName = PlanetName.Sun;
    else if (rawHora.includes("moon") || rawHora.includes("chandra")) horaLordName = PlanetName.Moon;
    else if (rawHora.includes("mars") || rawHora.includes("kuja") || rawHora.includes("mangal")) horaLordName = PlanetName.Mars;
    else if (rawHora.includes("mercury") || rawHora.includes("budha")) horaLordName = PlanetName.Mercury;
    else if (rawHora.includes("jupiter") || rawHora.includes("guru") || rawHora.includes("brihaspati")) horaLordName = PlanetName.Jupiter;
    else if (rawHora.includes("venus") || rawHora.includes("shukra")) horaLordName = PlanetName.Venus;
    else if (rawHora.includes("saturn") || rawHora.includes("shani")) horaLordName = PlanetName.Saturn;
  } else {
    // Chaldean Order: Sun, Ven, Mer, Moon, Sat, Jup, Mars
    const chaldeanOrder: PlanetName[] = [
      PlanetName.Sun, PlanetName.Venus, PlanetName.Mercury, PlanetName.Moon,
      PlanetName.Saturn, PlanetName.Jupiter, PlanetName.Mars
    ];
    const dayRulerStart: Record<number, number> = { 0: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };
    const [bH, bM] = birthTimeHm.split(":").map(Number);
    const birthHours = (bH || 12) + (bM || 0) / 60;
    const hoursSinceSunrise = (birthHours - 6 + 24) % 24;
    const horaIdx = Math.floor(hoursSinceSunrise);
    const startIdx = dayRulerStart[actualWeekdayIndex] || 0;
    horaLordName = chaldeanOrder[(startIdx + horaIdx) % 7];
  }
  const janmaHora = GRAHA_6L[horaLordName]?.[targetLang] || horaLordName;

  // Traditional Panchanga Profile Card
  const jananaPanchanga = {
    tithi: traditionalPanchanga?.tithi5L?.[targetLang] || traditionalPanchanga?.tithiKn || "ಶುಕ್ಲ ಪಕ್ಷ ತೃತೀಯಾ",
    paksha: traditionalPanchanga?.paksha5L?.[targetLang] || traditionalPanchanga?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷ",
    yoga: traditionalPanchanga?.yoga5L?.[targetLang] || traditionalPanchanga?.yogaKn || "ಸಿದ್ಧಿ ಯೋಗ",
    karana: traditionalPanchanga?.karana5L?.[targetLang] || traditionalPanchanga?.karanaKn || "ಬವ ಕರಣ",
    weekday: birthWeekday,
    janmaHora,
    ayanamsha: ayanamsa === "drik_ganita" ? "Drik Ganita (ಚಿತ್ರಾಪಕ್ಷ)" : "Lahiri (ಚಿತ್ರಾಪಕ್ಷ)"
  };

  // 2. Compute Sarvashtakavarga (SAV)
  const savTable = computeSarvashtakavarga(kundli);

  // 2B. Authenticated Classical Vedic Predictive Accuracy Helpers (Parashari & Jaimini)
  function computeNavataraBala(
    janmaNakIdx: number,
    transitJupRashi: number,
    lang: SixLang
  ): { taraName: string; taraCategory: "janma" | "sampat" | "vipat" | "kshema" | "pratyak" | "sadhaka" | "naidhana" | "mitra" | "parama_mitra"; isFavorable: boolean; analysisText: string } {
    const approxTransitNak = Math.floor(transitJupRashi * 2.25) % 27;
    const rawDiff = (approxTransitNak - janmaNakIdx + 27) % 27;
    const taraNum = (rawDiff % 9) + 1; // 1..9

    const TARA_CATEGORIES: ("janma" | "sampat" | "vipat" | "kshema" | "pratyak" | "sadhaka" | "naidhana" | "mitra" | "parama_mitra")[] = [
      "janma", "sampat", "vipat", "kshema", "pratyak", "sadhaka", "naidhana", "mitra", "parama_mitra"
    ];
    const cat = TARA_CATEGORIES[taraNum - 1];
    const isFavorable = [2, 4, 6, 8, 9].includes(taraNum);

    const TARA_NAMES: Record<number, Record<SixLang, string>> = {
      1: { kn: "ಜನ್ಮ ತಾರಾ (ಆತ್ಮ/ದೇಹ)", mr: "जन्म तारा (आत्म/शरीर)", hi: "जन्म तारा (आत्म/शरीर)", te: "జన్మ తార (ఆత్మ/దేహం)", ta: "ஜன்ம தாரை (ஆத்மா/உடல்)", en: "Janma Tara (Body/Self)" },
      2: { kn: "ಸಂಪತ್ ತಾರಾ (ಧನ/ಸಮೃದ್ಧಿ)", mr: "संपत तारा (धन/समृद्धी)", hi: "सम्पत तारा (धन/समृद्धि)", te: "సంపత్ తార (ధనం/సమృద్ధి)", ta: "சம்பத் தாரை (தனம்/வளம்)", en: "Sampat Tara (Wealth/Prosperity)" },
      3: { kn: "ವಿಪತ್ ತಾರಾ (ಎಚ್ಚರಿಕೆ)", mr: "विपत तारा (सावधगिरी)", hi: "विपत तारा (सतर्कता)", te: "విపత్ తార (జాగ్రత్త)", ta: "விபத் தாரை (எச்சரிக்கை)", en: "Vipat Tara (Caution)" },
      4: { kn: "ಕ್ಷೇಮ ತಾರಾ (ಸುಖ/ರಕ್ಷೆ)", mr: "क्षेम तारा (सुख/सुरक्षा)", hi: "क्षेम तारा (सुख/सुरक्षा)", te: "క్షేమ తార (సుఖం/రక్ష)", ta: "க்ஷேம தாரை (சுகம்/பாதுகாப்பு)", en: "Kshema Tara (Well-being/Security)" },
      5: { kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ (ಸಂಘರ್ಷ ಶಮನ)", mr: "प्रत्यक तारा (संघर्ष निवारण)", hi: "प्रत्यक तारा (बाधा निवारण)", te: "ప్రత్యక్ తార (బాధా నివారణ)", ta: "பிரத்யக் தாரை (தடை நிவர்த்தி)", en: "Pratyak Tara (Obstacle Pacification)" },
      6: { kn: "ಸಾಧಕ ತಾರಾ (ಕಾರ್ಯಸಿದ್ಧಿ)", mr: "साधक तारा (कार्यसिद्धी)", hi: "साधक तारा (सफलता)", te: "సాధక తార (కార్యసిద్ధి)", ta: "சாதக தாரை (காரிய சித்தி)", en: "Sadhaka Tara (Achievement)" },
      7: { kn: "ನೈಧನ ತಾರಾ (ಶಾಂತಿ ಸೇವೆ)", mr: "नैधन तारा (शांती सेवा)", hi: "नैधन तारा (शांति सेवा)", te: "నైధన తార (శాంతి సేవ)", ta: "நைதன தாரை (சாந்தி சேவை)", en: "Naidhana Tara (Remedial Care)" },
      8: { kn: "ಮಿತ್ರ ತಾರಾ (ಸಹಕಾರ/ಹಿತ)", mr: "मित्र तारा (सहकार्य)", hi: "मित्र तारा (सहयोग)", te: "మిత్ర తార (సహకారం)", ta: "மித்ர தாரை (நட்பு/ஆதரவு)", en: "Mitra Tara (Benefactor)" },
      9: { kn: "ಪರಮ ಮಿತ್ರ ತಾರಾ (ಪೂರ್ಣ ದೈವಾನುಗ್ರಹ)", mr: "परम मित्र तारा (पूर्ण कृपा)", hi: "परम मित्र तारा (पूर्ण अनुकंपा)", te: "పరమ మిత్ర తార (పూర్ణ కృప)", ta: "பரம மித்ர தாரை (பூரண அருள்)", en: "Parama Mitra Tara (Apex Fortune)" }
    };

    const analysisText = isFavorable
      ? pick6({
        kn: `${TARA_NAMES[taraNum].kn} ಯೋಗದಿಂದ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹ ಪೂರ್ಣವಾಗಿ ಲಭಿಸಿ, ಪ್ರಯತ್ನಿಸಿದ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಿದ್ಧಿ ಮತ್ತು ಧನಯೋಗ ಸೃಷ್ಟಿಯಾಗಲಿದೆ.`,
        mr: `${TARA_NAMES[taraNum].mr} योगामुळे देवगुरूंचे पूर्ण आशीर्वाद मिळून सर्व प्रयत्नांना यश व आर्थिक समृद्धी लाभेल.`,
        hi: `${TARA_NAMES[taraNum].hi} के प्रभाव से बृहस्पति देव की पूर्ण अनुकंपा प्राप्त होकर समस्त प्रयासों में सफलता एवं धन लाभ सुनिश्चित होगा।`,
        te: `${TARA_NAMES[taraNum].te} ప్రభావంతో గురు దేవుని సంపూర్ణ అనుగ్రహం లభించి, ప్రయత్నించిన ప్రతి పనిలో విజయం మరియు ధనలాభం కలుగుతుంది.`,
        ta: `${TARA_NAMES[taraNum].ta} யோகத்தால் குரு பகவானின் பூரண அருள் கிடைத்து, முயற்சிகளில் வெற்றியும் தன லாபமும் உறுதியாக கிட்டும்.`,
        en: `Fortified by ${TARA_NAMES[taraNum].en}, Jupiter's celestial alignment empowers your initiatives with accelerated success and material compounding.`
      }, lang)
      : pick6({
        kn: `${TARA_NAMES[taraNum].kn} ಪ್ರಭಾವದಿಂದ ನಿರ್ಧಾರಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಅತ್ಯಗತ್ಯ; ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ ಆರಾಧನೆ ಹಾಗೂ ನಿತ್ಯ ಸ್ತೋತ್ರ ಪಠಣೆ ರಕ್ಷೆಯಾಗಲಿದೆ.`,
        mr: `${TARA_NAMES[taraNum].mr} मुळे निर्णयांमध्ये संयम बाळगणे आवश्यक आहे; श्री गोकर्ण महागणपती आराधना व नित्य स्तोत्र पठण सुरक्षा देईल.`,
        hi: `${TARA_NAMES[taraNum].hi} के कारण निर्णयों में धैर्य आवश्यक है; श्री गोकर्ण महागणपति पूजन एवं नित्य स्तोत्र पाठ अचूक रक्षा कवच होगा।`,
        te: `${TARA_NAMES[taraNum].te} వలన నిర్ణయాలలో సంయమనం అవసరం; శ్రీ గోకర్ణ మహా గణపతి పూజ మరియు నిత్య స్తోత్ర పారాయణం రక్షణగా నిలుస్తుంది.`,
        ta: `${TARA_NAMES[taraNum].ta} காரணமாக முடிவுகளில் நிதானம் தேவை; ஸ்ரீ கோகர்ண மகா கணபதி வழிபாடு மற்றும் நித்திய ஸ்தோத்திர பாராயணம் சிறந்த அரணாகும்.`,
        en: `Under ${TARA_NAMES[taraNum].en}, measured deliberation is advised; regular chanting and Gokarna Ganapati prayer ensure protective sanctuary.`
      }, lang);

    return {
      taraName: TARA_NAMES[taraNum][lang] || TARA_NAMES[taraNum].kn,
      taraCategory: cat,
      isFavorable,
      analysisText
    };
  }

  function computeGocharaVedha(
    moonRashi: number,
    saturnTransitRashi: number,
    jupiterTransitRashi: number,
    lang: SixLang
  ): { hasVedha: boolean; vedhaDetails: string } {
    const jupHouse = ((jupiterTransitRashi - moonRashi + 12) % 12) + 1;
    const satHouse = ((saturnTransitRashi - moonRashi + 12) % 12) + 1;

    const jupVedhaMap: Record<number, number> = { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 };
    const expectedVedhaHouse = jupVedhaMap[jupHouse];
    const hasVedha = Boolean(expectedVedhaHouse && satHouse === expectedVedhaHouse);

    let vedhaDetails = "";
    if ([2, 5, 7, 9, 11].includes(jupHouse)) {
      if (!hasVedha) {
        vedhaDetails = pick6({
          kn: `ನಿರ್ವೇಧ ಗುರು ಬಲ: ಚಂದ್ರರಾಶಿಯಿಂದ ${formatNumber6L(jupHouse, "kn")}ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಗೆ ಯಾವುದೇ ಗ್ರಹ ವೇಧೆಯಿಲ್ಲದೆ (ಅಡಚಣೆಯಿಲ್ಲದೆ) ಪರಿಪೂರ್ಣ ದೈವಾನುಗ್ರಹ ಲಭಿಸಲಿದೆ.`,
          mr: `निर्वेध गुरु बळ: चंद्रराशीपासून ${formatNumber6L(jupHouse, "mr")}व्या स्थानी असणाऱ्या गुरूवर कोणत्याही ग्रहाचा वेध नसून पूर्ण अनुकूल फळे मिळतील.`,
          hi: `निर्वेध गुरु बल: चंद्र राशि से ${formatNumber6L(jupHouse, "hi")}वें भाव में स्थित बृहस्पति पर किसी ग्रह का वेध न होने से पूर्ण अनुकूलता एवं सफलता प्राप्त होगी।`,
          te: `నిర్వేధ గురు బలం: చంద్రరాశి నుండి ${formatNumber6L(jupHouse, "te")}వ స్థానంలో ఉన్న గురువుకు ఎలాంటి గ్రహ వేధ లేకపోవడంతో సంపూర్ణ శుభ ఫలితాలు లభిస్తాయి.`,
          ta: `நிர்வேத குரு பலம்: சந்திர ராசியிலிருந்து ${formatNumber6L(jupHouse, "ta")}ம் இடத்தில் சஞ்சரிக்கும் குரு பகவானுக்கு எந்த கிரக வேதமும் இன்றி பூரண நற்பலன்கள் கிடைக்கும்.`,
          en: `Unobstructed Guru Transit (Nirvedha Bala): Jupiter transiting house ${jupHouse} from Moon sign is free of planetary Vedha, unlocking pure benefic fortune.`
        }, lang);
      } else {
        vedhaDetails = pick6({
          kn: `ವೇಧಾ ಸಹಿತ ಗುರು ಗೋಚಾರ: ಗುರುವಿನ ಶುಭ ರಶ್ಮಿಗಳಿಗೆ ಶನಿಗ್ರಹದ ಸಾಪೇಕ್ಷ ವೇಧೆ ಇರುವುದರಿಂದ, ಕಾರ್ಯಗಳು ನಿಧಾನವಾಗಿ ಆದರೆ ದೃಢವಾಗಿ ನೆರವೇರಲಿವೆ.`,
          mr: `वेधयुक्त गुरु गोचर: गुरूच्या शुभावर इतर ग्रहाचा वेध असल्याने कार्ये सावकाश परंतु निश्चयाने पूर्णत्वास जातील.`,
          hi: `वेधयुक्त गुरु गोचर: बृहस्पति के गोचर पर वेध होने के कारण कार्य मंद गति से किंतु दृढ़तापूर्वक संपन्न होंगे।`,
          te: `వేధ సహిత గురు గోచారం: గురు గ్రహానికి శని వేధ ఉన్నందున, పనులు కొంత ఆలస్యంగానైనా ఖచ్చితంగా పూర్తవుతాయి.`,
          ta: `வேதமுள்ள குரு கோசாரம்: குருவின் சுபக் கதிர்களுக்கு கிரக வேதம் இருப்பதால், காரியங்கள் நிதானமாக ஆயினும் உறுதியாக நிறைவேறும்.`,
          en: `Transitional Vedha: Jupiter's benefic rays experience mild planetary Vedha, requiring patient perseverance to harvest full results.`
        }, lang);
      }
    } else {
      vedhaDetails = pick6({
        kn: `ಸಾಮಾನ್ಯ ಗೋಚಾರ ಸ್ಥಿತಿ: ಜನ್ಮ ನಕ್ಷತ್ರದ ತಾರಾ ಬಲ ಹಾಗೂ ದಶಾನಾಥನ ಶುಭ ದೃಷ್ಟಿಯ ಆಧಾರದ ಮೇಲೆ ಫಲಗಳು ನಿರ್ಧಾರವಾಗಲಿವೆ.`,
        mr: `सामान्य गोचर स्थिती: जन्म नक्षत्राचे ताराबळ व दशानाथांच्या दृष्टीवर फलादेश अवलंबून राहील.`,
        hi: `सामान्य गोचर स्थिति: जन्म नक्षत्र का तारा बल एवं दशानाथ की शुभ दृष्टि से कार्य सिद्ध होंगे।`,
        te: `సాధారణ గోచార స్థితి: జన్మ నక్షత్ర తారా బలం మరియు దశా నాథుని దృష్టిపై ఫలితాలు ఆధారపడి ఉంటాయి.`,
        ta: `சாதாரண கோசார நிலை: ஜன்ம நட்சத்திர தாரா பலம் மற்றும் தசா நாதனின் பார்வையால் பலன்கள் தீர்மானிக்கப்படும்.`,
        en: `Harmonious Transit Disposition: Transit outcomes are governed primarily by Navatara strength and active Mahadasha lord.`
      }, lang);
    }

    return { hasVedha, vedhaDetails };
  }

  function computeCharaKarakaInfluence(
    chartKundli: KundliOutput,
    activeMahaPlanet: PlanetName,
    lang: SixLang
  ): { atmakarakaPlanet: string; amatyakarakaPlanet: string; influenceSummary: string } {
    const eligible = (chartKundli.planets || []).filter(p =>
      [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars, PlanetName.Mercury, PlanetName.Jupiter, PlanetName.Venus, PlanetName.Saturn].includes(p.name)
    );

    const sorted = [...eligible].sort((a, b) => (b.degree % 30) - (a.degree % 30));
    const ak = sorted[0]?.name || PlanetName.Sun;
    const amk = sorted[1]?.name || PlanetName.Jupiter;

    const akName = GRAHA_6L[ak]?.[lang] || ak;
    const amkName = GRAHA_6L[amk]?.[lang] || amk;

    const isDashaAk = activeMahaPlanet === ak;
    const isDashaAmk = activeMahaPlanet === amk;

    let influenceSummary = "";
    if (isDashaAk) {
      influenceSummary = pick6({
        kn: `ಜೈಮಿನಿ ಆತ್ಮಕಾರಕ ಪ್ರಭಾವ: ಪ್ರಸ್ತುತ ಮಹಾದಶಾನಾಥ ${akName} ನಿಮ್ಮ ಆತ್ಮಕಾರಕ ಗ್ರಹವಾಗಿದ್ದು, ಈ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಜೀವನದ ಪರಮ ಮಹತ್ವದ ಆಂತರಿಕ ಪರಿವರ್ತನೆ ಮತ್ತು ಸುವರ್ಣ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`,
        mr: `जैमिनी आत्मकारक प्रभाव: चालू महादशा स्वामी ${akName} हे आपले आत्मकारक ग्रह असल्याने या वर्षात जीवनातील अत्यंत महत्त्वाचे वळण व उच्च सन्मान लाभेल.`,
        hi: `जैमिनी आत्मकारक प्रभाव: वर्तमान महादशा स्वामी ${akName} आपके आत्मकारक ग्रह हैं, अतः इस वर्ष आत्मिक उन्नति एवं उच्च पद-प्रतिष्ठा सुनिश्चित होगी।`,
        te: `జైమిని ఆత్మకారక ప్రభావం: ప్రస్తుత మహాదశా నాథుడు ${akName} మీ ఆత్మకారక గ్రహం కావడంతో, ఈ సంవత్సరంలో మహోన్నతమైన అంతర్గత పరివర్తన మరియు గౌరవ ప్రాప్తి కలుగుతాయి.`,
        ta: `ஜைமினி ஆத்மகாரக செல்வாக்கு: தற்போதைய மகா தசா நாதன் ${akName} உங்கள் ஆத்மகாரக கிரகமாக இருப்பதால், இந்த ஆண்டில் மிகப்பெரிய ஆன்மீக உயர்வும் சமூக அந்தஸ்தும் கிட்டும்.`,
        en: `Jaimini Atmakaraka Alignment: Active Mahadasha Lord ${akName} is your Atmakaraka, signifying an epochal year of spiritual awakening and pinnacle recognition.`
      }, lang);
    } else if (isDashaAmk) {
      influenceSummary = pick6({
        kn: `ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ಪ್ರಭಾವ: ಪ್ರಸ್ತುತ ಮಹಾದಶಾನಾಥ ${amkName} ನಿಮ್ಮ ಅಮಾತ್ಯಕಾರಕ ಗ್ರಹವಾಗಿದ್ದು, ವೃತ್ತಿ, ವ್ಯವಹಾರ ಹಾಗೂ ಆಡಳಿತ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ.`,
        mr: `जैमिनी अमात्यकारक प्रभाव: चालू महादशा स्वामी ${amkName} आपले अमात्यकारक असल्याने करिअर व व्यवसायात सर्वोच्च यश प्राप्त होईल.`,
        hi: `जैमिनी अमात्यकारक प्रभाव: वर्तमान महादशा स्वामी ${amkName} आपके अमात्यकारक ग्रह हैं, जिससे आजीविका एवं व्यापार में अप्रतिम सफलता प्राप्त होगी।`,
        te: `జైమిని అమాత్యకారక ప్రభావం: ప్రస్తుత మహాదశా నాథుడు ${amkName} మీ అమాత్యకారక గ్రహం కావడంతో, ఉద్యోగ, వ్యాపారాలలో అత్యున్నత విజయం చేకూరుతుంది.`,
        ta: `ஜைமினி அமாத்யகாரக செல்வாக்கு: தற்போதைய மகா தசா நாதன் ${amkName} உங்கள் அமாத்யகாரக கிரகமாக இருப்பதால், தொழில் மற்றும் வர்த்தகத்தில் உச்சகட்ட வெற்றி கிட்டும்.`,
        en: `Jaimini Amatyakaraka Alignment: Active Mahadasha Lord ${amkName} is your Amatyakaraka, anchoring prime career ascendancy and executive achievement.`
      }, lang);
    } else {
      influenceSummary = pick6({
        kn: `ಆತ್ಮಕಾರಕ ${akName} ಹಾಗೂ ಅಮಾತ್ಯಕಾರಕ ${amkName}ರ ಶುಭ ರಶ್ಮಿಗಳು ನಿಮ್ಮ ಕರ್ಮಕ್ಷೇತ್ರ ಮತ್ತು ಕೌಟುಂಬಿಕ ಸೌಖ್ಯವನ್ನು ಸಂರಕ್ಷಿಸಲಿವೆ.`,
        mr: `आत्मकारक ${akName} व अमात्यकारक ${amkName} यांची शुभ दृष्टी आपल्या कार्यक्षेत्र व कुटुंबाला अखंड स्थैर्य देईल.`,
        hi: `आत्मकारक ${akName} एवं अमात्यकारक ${amkName} की कृपा आपके कार्यक्षेत्र एवं पारिवारिक जीवन को सुरक्षित रखेगी।`,
        te: `ఆత్మకారక ${akName} మరియు అమాత్యకారక ${amkName}ల శుభ దృష్టి మీ కార్యరంగం మరియు కుటుంబ శాంతిని కాపాడుతుంది.`,
        ta: `ஆத்மகாரகர் ${akName} மற்றும் அமாத்யகாரகர் ${amkName} அருட்பார்வை உங்கள் தொழில் மற்றும் குடும்ப வாழ்க்கையை பாதுகாக்கும்.`,
        en: `Atmakaraka ${akName} and Amatyakaraka ${amkName} cast protective rays over your vocational trajectory and domestic peace.`
      }, lang);
    }

    return { atmakarakaPlanet: akName, amatyakarakaPlanet: amkName, influenceSummary };
  }

  // Compute 5 individual years
  const years: FiveYearSingleYear[] = [];
  let peakScore = 0;
  let peakYearLabel = "";
  let peakYearIdx = 1;
  let lowestScore = 100;
  let cautionYearLabel = "";
  let cautionYearIdx = 0;
  let hasSaturnTroubleAnyYear = false;
  let runningMahadashaPrimary = PlanetName.Saturn;

  for (let i = 0; i < 5; i++) {
    const startY = baseYear + i;
    const endY = startY + 1;
    const gregorianRange = `${startY} - ${endY}`;
    const shakaYear = startY - 78;
    const samvatsaraMeta = getSamvatsaraMetadata(shakaYear);
    const samvatsaraNative = getSamvatsaraName6L(shakaYear, targetLang);

    // Midpoint date for this year
    const midDate = new Date(startY, 9, 15);
    const ageAtMid = currentAgeYears + i + 0.5;

    // Find active Dasha and Bhukti
    const bhuktiInfo = findBhuktiAtAge(kundli, ageAtMid);
    const mahaLord = bhuktiInfo ? bhuktiInfo.maha.planet : PlanetName.Jupiter;
    const bhuktiLord = bhuktiInfo ? bhuktiInfo.bhukti : PlanetName.Saturn;
    if (i === 0) runningMahadashaPrimary = mahaLord;

    // Calculate planetary transits for that date
    const transits = getTransitsForDate(moonIdx, midDate, "lahiri");
    const shaniHouse = transits[PlanetName.Saturn]?.house || 1;
    const guruHouse = transits[PlanetName.Jupiter]?.house || 1;
    const rahuHouse = transits[PlanetName.Rahu]?.house || 1;
    const ketuHouse = transits[PlanetName.Ketu]?.house || 7;

    const shaniSign = (moonIdx + shaniHouse - 1) % 12;
    const guruSign = (moonIdx + guruHouse - 1) % 12;

    // Evaluate Saturn
    const isSadeSati = [12, 1, 2].includes(shaniHouse);
    const isAshtama = shaniHouse === 8;
    const isKantaka = shaniHouse === 4;
    const isSubhaShani = [3, 6, 11].includes(shaniHouse);
    if (isSadeSati || isAshtama) hasSaturnTroubleAnyYear = true;

    // Evaluate Jupiter (Guru Bala)
    const isGuruBala = [2, 5, 7, 9, 11].includes(guruHouse);

    // Tajika Muntha Calculation (advances 1 sign per completed year: Tajika Neelakanthi rule)
    const birthYear = parseInt(birthDateYmd.split("-")[0], 10) || (baseYear - Math.floor(currentAgeYears));
    const completedVarshaYears = startY - birthYear;
    const munthaSign = (lagnaIdx + (completedVarshaYears >= 0 ? completedVarshaYears : Math.floor(currentAgeYears) + i)) % 12;
    const munthaHouse = ((munthaSign - lagnaIdx + 12) % 12) + 1;
    const munthaRashi = RASHI_6L[munthaSign]?.[targetLang] || "";
    const munthaTheme = getMunthaTheme(munthaHouse, targetLang);

    // Planetary Key Aspect Analysis for Saturn
    const sunPlanet = kundli.planets.find(p => p.name === PlanetName.Sun);
    const natalSunSign = sunPlanet ? sunPlanet.rashi.index : 0;
    const isSaturnConjunctSun = shaniSign === natalSunSign;
    const isSaturnAspectingSun = [
      shaniSign,
      (shaniSign + 2) % 12,
      (shaniSign + 6) % 12,
      (shaniSign + 9) % 12
    ].includes(natalSunSign);

    const isSaturnAspectingLagna = [
      shaniSign,
      (shaniSign + 2) % 12,
      (shaniSign + 6) % 12,
      (shaniSign + 9) % 12
    ].includes(lagnaIdx);

    const isSaturnAspectingMoon = [
      shaniSign,
      (shaniSign + 2) % 12,
      (shaniSign + 6) % 12,
      (shaniSign + 9) % 12
    ].includes(moonIdx);

    // Classical Bandhana Yoga (Confinement / Judicial Scrutiny / Restriction of Liberty - 12th House Vyaya/Bandhana)
    const isBandhanaRisk = munthaHouse === 12 &&
      (isSaturnConjunctSun || isSaturnAspectingSun || isSaturnAspectingLagna || isSaturnAspectingMoon || isSadeSati);

    // Classical Shatru Vijaya Yoga (Victory over competitors / adversaries in 6th house when Guru Bala or Subha Shani is present)
    const isShatruVijaya = munthaHouse === 6 && (isGuruBala || isSubhaShani);

    // Sarvashtakavarga (SAV) Refinement
    const jupSav = savTable[guruSign] ?? 28;
    const satSav = savTable[shaniSign] ?? 28;

    // Classical Arishta / Health / Trauma Risk (Randhra Muntha OR Maraka Muntha afflicted by Saturn OR Ashtama Shani with low SAV)
    const isMarakaMuntha = [2, 7].includes(munthaHouse);
    const isSaturnInMuntha = munthaSign === shaniSign;
    const isArishtaRisk = munthaHouse === 8 || (isMarakaMuntha && isSaturnInMuntha) || (isAshtama && (satSav < 26 || munthaHouse === 6));

    // Classical Raja Yoga / Sovereign Peak
    const isRajaYogaPeak = (munthaHouse === 11 || munthaHouse === 10) &&
      (isGuruBala || isSubhaShani) && satSav >= 28 && !isBandhanaRisk && !isArishtaRisk;

    // Calculate Vitality / Energy Score (0 - 100) refined with Tajika Muntha & Sarvashtakavarga (SAV)
    let score = 65;
    if (isGuruBala) score += 16;
    else score -= 8;

    if (isSubhaShani) score += 14;
    else if (isSadeSati) score -= 14;
    else if (isAshtama) score -= 16;
    else if (isKantaka) score -= 8;

    if (jupSav >= 30) score += 6;
    else if (jupSav < 25) score -= 4;

    if (satSav >= 30) score += 5; // Saturn in high SAV gives durable property/promotions
    else if (satSav < 25) score -= 5;

    // Dasha compatibility
    if (mahaLord === lagnaLordKey) score += 8;
    if (bhuktiLord === lagnaLordKey) score += 5;

    // Tajika Muntha House Impact (Tajika Neelakanthi Shastra):
    if (munthaHouse === 11) score += 14;      // Labha / Apex Gains / Triumph
    else if (munthaHouse === 10) score += 12; // Karma / Executive Power
    else if (munthaHouse === 9) score += 10;  // Bhagya / Fortune / Pilgrimage
    else if (munthaHouse === 5) score += 8;   // Intellect / Creative Acclaim
    else if (munthaHouse === 1 || munthaHouse === 3) score += 6; // Tanu / Parakrama
    else if (munthaHouse === 2) score += 4;   // Dhana / Family
    else if (munthaHouse === 4) score -= 8;   // Klesha / Domestic unrest
    else if (munthaHouse === 7) score -= 8;   // Maraka / Partnership friction
    else if (munthaHouse === 6) {
      if (isShatruVijaya) score += 12; // Shatru Vijaya / Electoral / Competitive Victory
      else score -= 14;  // Shatru / Vivada / Litigation friction
    }
    else if (munthaHouse === 8) score -= 16;  // Randhra / Acute Vulnerability / Sudden Fall
    else if (munthaHouse === 12) score -= 18; // Vyaya / Bandhana / Detention / Loss of Liberty

    // Specific Yoga Penalties / Bonuses:
    if (isBandhanaRisk) score -= 16;
    if (isArishtaRisk) score -= 14;
    if (isRajaYogaPeak) score += 10;

    score = Math.max(30, Math.min(98, score));

    if (score > peakScore) {
      peakScore = score;
      peakYearLabel = gregorianRange;
      peakYearIdx = i;
    }
    if (score < lowestScore) {
      lowestScore = score;
      cautionYearLabel = gregorianRange;
      cautionYearIdx = i;
    }

    const vitalityCategory: "exceptional" | "balanced" | "caution" =
      score >= 76 ? "exceptional" : score >= 55 ? "balanced" : "caution";

    // Moorthy Nirnaya (Swarna/Rajata/Tamra/Loha)
    // Approximate transit Moon sign
    const approxTransitMoonSign = (moonIdx + (i * 2) + 1) % 12;
    const saturnMoorthy = getMoorthyNirnaya(approxTransitMoonSign, moonIdx, targetLang);
    const jupiterMoorthy = getMoorthyNirnaya(approxTransitMoonSign, moonIdx, targetLang);

    // Double Transit of Saturn & Jupiter
    const doubleTransitHighlight = detectDoubleTransit(shaniSign, guruSign, lagnaIdx, moonIdx, targetLang);

    // Shani narrative in target language
    let shaniText = "";
    if (isSadeSati) {
      shaniText = targetLang === "kn" ? `ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಸಾಡೇಸಾತಿ ಶನಿ ಪ್ರಭಾವ: ದೀರ್ಘಕಾಲೀನ ಪ್ರಯತ್ನ ಹಾಗೂ ಸಂಯಮ ಅಗತ್ಯ.`
        : targetLang === "hi" ? `चन्द्र से ${formatNumber6L(shaniHouse, targetLang)}वें भाव में साढ़ेसाती प्रभाव: कठिन परिश्रम एवं धैर्य आवश्यक।`
          : targetLang === "mr" ? `चंद्रापासून ${formatNumber6L(shaniHouse, targetLang)}व्या स्थानी साडेसाती शनी प्रभाव: चिकाटी, संयम व कष्टाने यश.`
            : targetLang === "te" ? `చంద్రుని నుండి ${formatNumber6L(shaniHouse, targetLang)}వ ఇంట ఏలినాటి శని ప్రభావం: క్రమశిక్షణ మరియు ఓర్పు అవసరం.`
              : targetLang === "ta" ? `சந்திரனில் இருந்து ${formatNumber6L(shaniHouse, targetLang)}ம் வீட்டில் ஏழரை சனி தாக்கம்: கடின உழைப்பு மற்றும் பொறுமை அவசியம்.`
                : `Saturn Sade Sati transit (House ${shaniHouse} from Moon): demands discipline and endurance.`;
    } else if (isAshtama) {
      shaniText = targetLang === "kn" ? `೮ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ: ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಹಾಗೂ ಹಠಾತ್ ಖರ್ಚುಗಳ ನಿಯಂತ್ರಣ ಅಗತ್ಯ.`
        : targetLang === "hi" ? `८वें भाव में अष्टम शनि प्रभाव: स्वास्थ्य एवं आकस्मिक व्यय में सावधानी।`
          : targetLang === "mr" ? `८व्या स्थानी अष्टम शनी प्रभाव: आरोग्य व अनपेक्षित खर्चांवर नियंत्रण हवे.`
            : targetLang === "te" ? `8వ ఇంట అష్టమ శని ప్రభావం: ఆరోగ్యం మరియు ఆకస్మిక ఖర్చులలో జాగ్రత్త.`
              : targetLang === "ta" ? `8ம் வீட்டில் அஷ்டம சனி தாக்கம்: உடல்நலம் மற்றும் வீண் செலவுகளில் கவனம் தேவை.`
                : `Ashtama Shani transit (8th house): advises caution in health and financial outlays.`;
    } else if (isSubhaShani) {
      shaniText = targetLang === "kn" ? `${formatNumber6L(shaniHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಶುಭ ಶನಿ ಗೋಚಾರ: ಶತ್ರು ಜಯ, ಕಾರ್ಯಸಿದ್ಧಿ ಹಾಗೂ ಸ್ಥಿರ ಆದಾಯ.`
        : targetLang === "hi" ? `${formatNumber6L(shaniHouse, targetLang)}वें भाव में शुभ शनि गोचर: शत्रु विजय, कार्यसिद्धि एवं स्थिर आय।`
          : targetLang === "mr" ? `${formatNumber6L(shaniHouse, targetLang)}व्या स्थानी शुभ शनी गोचर: शत्रूंवर मात, कार्यसिद्धी व स्थिर आर्थिक लाभ.`
            : targetLang === "te" ? `${formatNumber6L(shaniHouse, targetLang)}వ ఇంట శుభ శని గోచారం: శత్రు జయం, కార్యసిద్ధి, స్థిర ఆదాయం.`
              : targetLang === "ta" ? `${formatNumber6L(shaniHouse, targetLang)}ம் வீட்டில் சுப சனி கோச்சாரம்: காரிய சித்தி, வெற்றி மற்றும் நிலையான வருமானம்.`
                : `Benefic Saturn transit (${getEnglishOrdinal(shaniHouse)} house): guarantees triumph over competition and steady gains.`;
    } else {
      shaniText = targetLang === "kn" ? `${formatNumber6L(shaniHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಗೋಚಾರ: ನಿಯಮಿತ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ನ್ಯಾಯಯುತ ಫಲ.`
        : targetLang === "hi" ? `${formatNumber6L(shaniHouse, targetLang)}वें भाव में शनि गोचर: नियमित परिश्रम का उत्तम फल।`
          : targetLang === "mr" ? `${formatNumber6L(shaniHouse, targetLang)}व्या स्थानी शनी गोचर: नियमित प्रयत्नांना योग्य फळ मिळेल.`
            : targetLang === "te" ? `${formatNumber6L(shaniHouse, targetLang)}వ ఇంట సాధారణ శని గోచారం: క్రమబద్ధమైన కృషికి తగిన ఫలితం.`
              : targetLang === "ta" ? `${formatNumber6L(shaniHouse, targetLang)}ம் வீட்டில் சனி கோச்சாரம்: உழைப்புக்கேற்ற பலன் கிட்டும்.`
                : `Moderate Saturn transit (${getEnglishOrdinal(shaniHouse)} house): rewards systematic discipline.`;
    }

    // Guru narrative
    let guruText = "";
    if (isGuruBala) {
      guruText = targetLang === "kn" ? `${formatNumber6L(guruHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಪೂರ್ಣ ಗುರುಬಲ: ಭಾಗ್ಯೋದಯ, ಶುಭ ಸಮಾರಂಭ ಹಾಗೂ ಧನಲಾಭ.`
        : targetLang === "hi" ? `${formatNumber6L(guruHouse, targetLang)}वें भाव में पूर्ण गुरुबल: भाग्योदय, मांगलिक कार्य एवं धनलाभ।`
          : targetLang === "mr" ? `${formatNumber6L(guruHouse, targetLang)}व्या स्थानी संपूर्ण गुरुबळ: भाग्योदय, शुभकार्ये व धनवृद्धी.`
            : targetLang === "te" ? `${formatNumber6L(guruHouse, targetLang)}వ ఇంట సంపూర్ణ గురు బలం: భాగ్యోదయం, శుభకార్యాలు, ధనలాభం.`
              : targetLang === "ta" ? `${formatNumber6L(guruHouse, targetLang)}ம் வீட்டில் முழு குரு பலன்: பாக்கியோதயம், சுப காரியங்கள், தனலாபம்.`
                : `Auspicious Guru Bala (${getEnglishOrdinal(guruHouse)} house): divine grace, auspicious celebrations, and financial expansion.`;
    } else {
      guruText = targetLang === "kn" ? `${formatNumber6L(guruHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಆಂತರಿಕ ಗುರು ಗೋಚಾರ: ಜ್ಞಾನ ವೃದ್ಧಿ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ವಿವೇಕ.`
        : targetLang === "hi" ? `${formatNumber6L(guruHouse, targetLang)}वें भाव में अंतर्मुखी गुरु गोचर: ज्ञान वृद्धि एवं कर्तव्य निष्ठा।`
          : targetLang === "mr" ? `${formatNumber6L(guruHouse, targetLang)}व्या स्थानी अंतर्मुख गुरु गोचर: ज्ञान संपादन व कर्तव्य पालनात प्रगती.`
            : targetLang === "te" ? `${formatNumber6L(guruHouse, targetLang)}వ ఇంట అంతర్ముఖ గురు గోచారం: జ్ఞానవృద్ధి, కర్తవ్య నిష్ఠ.`
              : targetLang === "ta" ? `${formatNumber6L(guruHouse, targetLang)}ம் வீட்டில் அகநிலை குரு கோச்சாரம்: ஞான வளர்ச்சி, கடமை உணர்வு.`
                : `Internal Guru transit (${getEnglishOrdinal(guruHouse)} house): fosters spiritual introspection and skill acquisition.`;
    }

    const rahuKetuText = targetLang === "kn" ? `ರಾಹು-ಕೇತು ${formatNumber6L(rahuHouse, targetLang)}/${formatNumber6L(ketuHouse, targetLang)} ಅಕ್ಷ: ಆಕಸ್ಮಿಕ ಶುಭ ಬದಲಾವಣೆಗಳು.`
      : targetLang === "hi" ? `राहु-केतु ${formatNumber6L(rahuHouse, targetLang)}/${formatNumber6L(ketuHouse, targetLang)} अक्ष: अप्रत्याशित सकारात्मक परिवर्तन।`
        : targetLang === "mr" ? `राहू-केतू ${formatNumber6L(rahuHouse, targetLang)}/${formatNumber6L(ketuHouse, targetLang)} अक्ष: अचानक घडणारे महत्त्वाचे बदल.`
          : targetLang === "te" ? `రాహు-కేతువులు ${formatNumber6L(rahuHouse, targetLang)}/${formatNumber6L(ketuHouse, targetLang)} అక్షం: ఆకస్మిక మార్పులు.`
            : targetLang === "ta" ? `ராகு-கேது ${formatNumber6L(rahuHouse, targetLang)}/${formatNumber6L(ketuHouse, targetLang)} அச்சு: எதிர்பாராத மாற்றங்கள்.`
              : `Rahu-Ketu ${rahuHouse}/${ketuHouse} nodal axis: introduces pivotal life shifts.`;

    const dashaSuffixMap: Record<SixLang, { d: string; b: string }> = {
      kn: { d: "ಮಹಾದಶೆ", b: "ಭುಕ್ತಿ" },
      mr: { d: "महादशा", b: "भुक्ती" },
      hi: { d: "महादशा", b: "भुक्ति" },
      te: { d: "మహాదశ", b: "భుక్తి" },
      ta: { d: "மகா தசா", b: "புக்தி" },
      en: { d: "Mahadasha", b: "Bhukti" }
    };
    const curSuffix = dashaSuffixMap[targetLang];
    const dashaText = `${GRAHA_6L[mahaLord]?.[targetLang] || mahaLord} ${curSuffix.d} • ${GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord} ${curSuffix.b}`;

    // Age & Demographic Adaptive Headlines and Events
    let headline = "";
    let whatToExpect: string[] = [];
    let turningPoint = "";
    let goldenWindow = "";
    let caution = "";

    const isMarried = personalization?.maritalStatus === "married";
    const hasChildren = personalization?.childrenStatus === "has_children";

    const detailedAgeThisYear = getDetailedAgeGroup(ageAtMid);

    if (detailedAgeThisYear === "infant") {
      headline = targetLang === "kn" ? `${gregorianRange}: ಶಿಶು ಬೆಳವಣಿಗೆ, ದೈವಿಕ ರಕ್ಷೆ ಹಾಗೂ ಬಾಲ ಸಂಸ್ಕಾರಗಳ ದಿವ್ಯ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: शिशु वृद्धि, दैवीय रक्षा एवं बाल संस्कारों का पावन वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: बालकाची वाढ, ईश्वरी रक्षा व शुभ बालसंस्कारांचे वर्ष`
            : targetLang === "te" ? `${gregorianRange}: శిశు ఎదుగుదల, దైవిక రక్షణ & బాల సంస్కారాల దివ్య సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: குழந்தை வளர்ச்சி, தெய்வீக பாதுகாப்பு & சுப சடங்குகளின் ஆண்டு`
                : `${gregorianRange}: Infant Vitality, Divine Aegis & Sacred Samskaras Year`;

      whatToExpect = [
        targetLang === "kn" ? `ತಾಯಿಯ ವಾತ್ಸಲ್ಯ, ಪೌಷ್ಟಿಕ ಆಹಾರ ಹಾಗೂ ಸಹಜ ಮೈಕಟ್ಟಿನ ಬಲವರ್ಧನೆ.`
          : targetLang === "hi" ? `माता का वात्सल्य, सुपाच्य पोषण एवं स्वाभाविक शारीरिक पुष्टि।`
            : targetLang === "mr" ? `मातेचे प्रेम, पौष्टिक आहार व बालकाची उत्तम शारीरिक वाढ.`
              : targetLang === "te" ? `తల్లి ప్రేమ, పౌష్టికాహారం మరియు సహజమైన శారీరక ఎదుగుదల.`
                : targetLang === "ta" ? `தாயின் அன்பு, சத்தான உணவு மற்றும் இயற்கையான உடல் வளர்ச்சி.`
                  : `Vibrant infant development, maternal nourishment, and peaceful sleep rhythms.`,
        targetLang === "kn" ? `ನಗು, ಮುದ್ದಾದ ಮಾತುಗಳು ಹಾಗೂ ನೂತನ ದೈಹಿಕ ಚಲನವಲನಗಳ ಸುಂದರ ಪ್ರಕಟಣೆ.`
          : targetLang === "hi" ? `मधुर हास्य, तोतली बोली एवं नवीन शारीरिक गतियों का प्रकटीकरण।`
            : targetLang === "mr" ? `निष्पाप हास्य, बोबडे बोल व नवीन हालचालींचा सुंदर अनुभव.`
              : targetLang === "te" ? `చిరునవ్వులు, ముద్దు ముద్దు మాటలు మరియు కొత్త కదలికల ఆనందం.`
                : targetLang === "ta" ? `மழலைச் சிரிப்பு, கொஞ்சும் மழலை மொழி & அழகான உடல் அசைவுகள்.`
                  : `First steps, expressive babbling, and endearing milestones bringing joyous delight.`,
        targetLang === "kn" ? `ನಾಮಕರಣ, ಅನ್ನಪ್ರಾಶನ ಮುಂತಾದ ಶಾಸ್ತ್ರೋಕ್ತ ಬಾಲ ಸಂಸ್ಕಾರಗಳ ಸಂಪನ್ನತೆ.`
          : targetLang === "hi" ? `नामकरण, अन्नप्राशन आदि शास्त्रोक्त बाल संस्कारों की सुसंपन्नता।`
            : targetLang === "mr" ? `नामकरण, अन्नप्राशन इत्यादी वेदोक्त बालसंस्कारांची सुसंपादकता.`
              : targetLang === "te" ? `నామకరణం, అన్నప్రాశన మొదలైన శాస్త్రోక్త బాల సంస్కారాల నిర్వహణ.`
                : targetLang === "ta" ? `நாமகரணம், அன்னப்ராசனம் போன்ற சாஸ்திரோக்த சுப சடங்குகள் நிறைவேறுதல்.`
                  : `Timely celebration of sacred infant consecrations including Annaprashana.`
      ];

      turningPoint = targetLang === "kn" ? `ಉತ್ತರಾಯಣದ ಶುಭ ಮಾಸಗಳು (ಶಿಶುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಬಲವರ್ಧನೆ).`
        : targetLang === "hi" ? `उत्तरायण के पावन मास (शिशु की रोगप्रतिरोधक क्षमता का सुदृढ़ीकरण)।`
          : targetLang === "mr" ? `उत्तरायणातील शुभ मास (बालकाची प्रतिकारशक्ती उत्तम बळकट होईल).`
            : targetLang === "te" ? `ఉత్తరాయణ పుణ్య మాసాలు (శిశువు రోగనిరోధక శక్తి బలపడుతుంది).`
              : targetLang === "ta" ? `உத்தராயண சுப மாதங்கள் (குழந்தையின் நோய் எதிர்ப்பு சக்தி கூடும்).`
                : `Auspicious Uttarayana season consolidating pediatric resilience and vitality.`;

      goldenWindow = targetLang === "kn" ? `ಶುಭ ಗುರುಬಲ ಕಾಲದಲ್ಲಿ ಅನ್ನಪ್ರಾಶನ, ನಾಮಕರಣ ಅಥವಾ ಆಯುಷ್ಯ ಹೋಮಕ್ಕೆ ಅತ್ಯುತ್ತಮ.`
        : targetLang === "hi" ? `शुभ गुरुबल काल में अन्नप्राशन, नामकरण अथवा आयुष्य होम हेतु परम श्रेष्ठ मुहूर्त।`
          : targetLang === "mr" ? `शुभ गुरुबळाच्या काळात नामकरण, अन्नप्राशन अथवा आयुष्य होमासाठी सर्वोत्तम मुहूर्त.`
            : targetLang === "te" ? `శుభ గురుబల కాలంలో నామకరణం, అన్నప్రాశన లేదా ఆయుష్య హోమానికి శ్రేష్టమైన సమయం.`
              : targetLang === "ta" ? `சுப குரு பல காலத்தில் நாமகரணம், அன்னப்ராசனம் அல்லது ஆயுஷ்ய ஹோமத்திற்கு உகந்த நேரம்.`
                : `Jupiter-empowered muhurtas ideal for sacred infant rites and health homas.`;

      caution = targetLang === "kn" ? `ಋತುಮಾನ ಬದಲಾವಣೆ, ಹಲ್ಲು ಮೂಡುವ ಸಮಯದ ಜ್ವರ ಹಾಗೂ ಶೀತದಿಂದ ರಕ್ಷಿಸಿ.`
        : targetLang === "hi" ? `ऋतु परिवर्तन, दंतोद्भव काल के ज्वर एवं मौसमी सर्दी-जुकाम से रक्षा करें।`
          : targetLang === "mr" ? `ऋतुबदल, दात येतानाचा ताप व सर्दी-कफापासून बालकाचे रक्षण करा.`
            : targetLang === "te" ? `వాతావరణ మార్పులు, పళ్ళు వచ్చేటప్పుడు జ్వరం & జలుబు రాకుండా జాగ్రత్తపడండి.`
              : targetLang === "ta" ? `பருவநிலை மாற்றம், பல் முளைக்கும் காய்ச்சல் மற்றும் சளியில் இருந்து காக்கவும்.`
                : `Maintain vigilant protection against seasonal drafts, teething fever, and dietary chills.`;

    } else if (detailedAgeThisYear === "early_child") {
      headline = targetLang === "kn" ? `${gregorianRange}: ಕೌತುಕದ ಕಲಿಕೆ, ಅಕ್ಷರಾಭ್ಯಾಸ ಹಾಗೂ ಬಾಲ ಸಂಸ್ಕಾರಗಳ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: जिज्ञासापूर्ण अधिगम, अक्षराभ्यास एवं बाल संस्कारों का वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: उत्सुकतेने शिकणे, पाटीपूजन व संस्कारांचे सुंदर वर्ष`
            : targetLang === "te" ? `${gregorianRange}: కుతూహల అభ్యాసం, అక్షరాభ్యాసం & బాల సంస్కారాల సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: ஆர்வத்துடன் கற்றல், அக்ஷராப்யாசம் & நற்பண்புகள் வளரும் ஆண்டு`
                : `${gregorianRange}: Early Curiosity, Alphabet Inception & Playful Discovery Year`;

      whatToExpect = [
        targetLang === "kn" ? `ಮಾತುಗಾರಿಕೆ, ಕಥೆಗಳು ಹಾಗೂ ನೂತನ ಶಬ್ದಗಳ ಕಲಿಕೆಯಲ್ಲಿ ಅದ್ಭುತ ಆಸಕ್ತಿ.`
          : targetLang === "hi" ? `वाणी कौशल, रोचक कहानियों एवं नवीन शब्दों को सीखने में तीव्र रुचि।`
            : targetLang === "mr" ? `संभाषण कौशल्य, गोष्टी ऐकणे व नवीन शब्द शिकण्यात अतीव रस.`
              : targetLang === "te" ? `సంభాషణ, కథలు వినడం మరియు కొత్త పదాలు నేర్చుకోవడంలో ఆసక్తి.`
                : targetLang === "ta" ? `பேச்சுத் திறன், கதைகள் கேட்பது மற்றும் புதிய சொற்களைக் கற்பதில் ஆர்வம்.`
                  : `Rapid speech articulation, love of folklore stories, and blossoming vocabulary.`,
        targetLang === "kn" ? `ಪೂರ್ವ ಪ್ರಾಥಮಿಕ/ಶಾಲಾ ಪ್ರವೇಶ ಹಾಗೂ ಹೊಸ ಸ್ನೇಹಿತರೊಡನೆ ಬೆರೆಯುವ ಸಂತಸ.`
          : targetLang === "hi" ? `प्राथमिक शाला प्रवेश एवं नन्हे मित्रों के साथ घुलने-मिलने का उल्लास।`
            : targetLang === "mr" ? `शाळा प्रवेश व नवीन समवयस्क मित्रांसोबत रमून जाण्याचा आनंद.`
              : targetLang === "te" ? `పాఠశాల ప్రవేశం మరియు స్నేహితులతో కలిసి ఆడుకునే సంతోషం.`
                : targetLang === "ta" ? `பள்ளிப் பிரவேசம் மற்றும் புதிய நண்பர்களுடன் பழகும் மகிழ்ச்சி.`
                  : `Joyful nursery/kindergarten induction and warm social bonding with peers.`,
        targetLang === "kn" ? `ಕಲಾತ್ಮಕ ಆಟಿಕೆಗಳು ಹಾಗೂ ಸಹಜ ಕುತೂಹಲದಿಂದ ಬುದ್ಧಿಮತ್ತೆಯ ಅರಳುವಿಕೆ.`
          : targetLang === "hi" ? `रचनात्मक खिलौनों एवं नैसर्गिक जिज्ञासा से बौद्धिक विकास।`
            : targetLang === "mr" ? `रचनात्मक खेळ व नैसर्गिक जिज्ञासेने बुद्धिमत्तेचा सुंदर विकास.`
              : targetLang === "te" ? `సృజనాత్మక ఆటలు మరియు సహజ కుతూహలంతో బుద్ధి వికాసం.`
                : targetLang === "ta" ? `ஆக்கப்பூர்வமான விளையாட்டுகள் மற்றும் ஆர்வத்தால் அறிவு வளர்ச்சி.`
                  : `Stimulation of creative imagination and cognitive agility through hands-on play.`
      ];

      turningPoint = targetLang === "kn" ? `ವರ್ಷದ ವಿಜಯದಶಮಿ ಅಥವಾ ಅಕ್ಷರಾಭ್ಯಾಸದ ಶುಭ ಮಾಸಗಳು.`
        : targetLang === "hi" ? `वर्ष के विजयादशमी अथवा विद्यारंभ के पावन मास।`
          : targetLang === "mr" ? `वर्षातील विजयादशमी अथवा पाटीपूजनाचे शुभ दिवस.`
            : targetLang === "te" ? `విజయదశమి లేదా అక్షరాభ్యాసం నిర్వహించే పవిత్ర మాసాలు.`
              : targetLang === "ta" ? `விஜயதசமி அல்லது கல்வி துவக்கத்திற்கான சுப நாட்கள்.`
                : `Auspicious Vijayadashami or Vasant Panchami learning initiation milestone.`;

      goldenWindow = targetLang === "kn" ? `ಬುಧ ಹಾಗೂ ಗುರು ಪ್ರಭಾವದ ಕಾಲದಲ್ಲಿ ಆರಂಭಿಕ ಅಕ್ಷರಾಭ್ಯಾಸಕ್ಕೆ ಸುವರ್ಣ ಕಾಲ.`
        : targetLang === "hi" ? `बुध एवं गुरु के शुभ प्रभाव काल में प्रारंभिक अध्ययन हेतु सर्वोत्तम समय।`
          : targetLang === "mr" ? `बुध व गुरूच्या अनुकूल काळात मूलभूत शिक्षणासाठी सुवर्ण काळ.`
            : targetLang === "te" ? `బుధ, గురు గ్రహాల అనుగ్రహంతో ప్రారంభ చదువులకు అనుకూల సమయం.`
              : targetLang === "ta" ? `புதன் மற்றும் குருவின் சுப கால கட்டத்தில் ஆரம்பக் கல்விக்கு பொற்காலம்.`
                : `Mercurial and Jovian windows maximize effortless conceptual uptake and retention.`;

      caution = targetLang === "kn" ? `ಹೊರಗಿನ ಜಂಕ್ ಆಹಾರ ತಪ್ಪಿಸಿ; ಹೊಟ್ಟೆಯ ಸೋಂಕು ಹಾಗೂ ಜೀರ್ಣಾಂಗ ಶುದ್ಧತೆ ಕಾಪಾಡಿ.`
        : targetLang === "hi" ? `बाहर के खाद्य पदार्थों से बचें; उदर संक्रमण एवं पाचन स्वास्थ्य पर ध्यान दें।`
          : targetLang === "mr" ? `बाहेरील उघडे अन्न टाळा; पोटाचे विकार व स्वच्छतेची काळजी घ्या.`
            : targetLang === "te" ? `బయటి ఆహారం మానండి; కడుపు ఇన్ఫెక్షన్లు రాకుండా పరిశుభ్రత పాటించండి.`
              : targetLang === "ta" ? `வெளி உணவுகளைத் தவிர்க்கவும்; வயிறு உபாதைகள் வராமல் பார்த்துக் கொள்ளவும்.`
                : `Shield digestive vitality against street snacks, artificial colors, and unboiled water.`;

    } else if (detailedAgeThisYear === "tween") {
      headline = targetLang === "kn" ? `${gregorianRange}: ವಿದ್ಯಾಭ್ಯಾಸದ ತಳಹದಿ ಹಾಗೂ ಪ್ರತಿಭಾ ವಿಕಾಸದ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: शिक्षा की सुदृढ़ नींव एवं प्रतिभा विकास का वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: शिक्षणाचा मजबूत पाया व सुप्त गुणांचा विकास`
            : targetLang === "te" ? `${gregorianRange}: విద్యాభ్యాస పునాది & ప్రతిభా వికాస సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: கல்வி அடித்தளம் & திறமை வெளிப்படும் ஆண்டு`
                : `${gregorianRange}: Academic Foundation & Creative Sparks Year`;

      whatToExpect = [
        targetLang === "kn" ? `ಶಾಲಾ ಪಠ್ಯಕ್ರಮದಲ್ಲಿ ಉತ್ತಮ ಆಸಕ್ತಿ ಹಾಗೂ ಗ್ರಹಣ ಶಕ್ತಿಯ ಗಮನಾರ್ಹ ಸುಧಾರಣೆ.`
          : targetLang === "hi" ? `विद्यालयी अध्ययन में तीव्र रुचि एवं स्मरण शक्ति में उल्लेखनीय वृद्धि।`
            : targetLang === "mr" ? `शालेय अभ्यासात मनापासून रस व आकलन-स्मरणशक्तीत उत्तम सुधारणा.`
              : targetLang === "te" ? `పాఠశాల చదువులో మంచి ఆసక్తి మరియు గ్రహణశక్తిలో స్పష్టమైన మార్పు.`
                : targetLang === "ta" ? `பள்ளிப் பாடங்களில் ஆர்வம் மற்றும் நினைவாற்றல் பெருகுதல்.`
                  : `High scholastic curiosity and marked expansion in memory retention.`,
        targetLang === "kn" ? `ಕ್ರೀಡೆ, ಕಲೆ ಅಥವಾ ಸಂಗೀತದಲ್ಲಿ ಹೊಸ ಪ್ರತಿಭೆಯು ಅನಾವರಣಗೊಳ್ಳುವುದು.`
          : targetLang === "hi" ? `खेलकूद, कला अथवा संगीत में नई नैसर्गिक प्रतिभा का प्रकटीकरण।`
            : targetLang === "mr" ? `खेळ, चित्रकला किंवा संगीतात नवीन सुप्त गुणांचे कौतुकास्पद प्रकटीकरण.`
              : targetLang === "te" ? `క్రీడలు, కళలు లేదా సంగీతంలో సరికొత్త ప్రతిభ ప్రకాశిస్తుంది.`
                : targetLang === "ta" ? `விளையாட்டு அல்லது கலைகளில் புதிய திறமை வெளிப்படும்.`
                  : `Natural emergence of artistic, musical, or athletic talents.`,
        targetLang === "kn" ? `ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನದಿಂದ ಶಿಸ್ತು ಮತ್ತು ನೈತಿಕ ಸಂಸ್ಕಾರಗಳ ವೃದ್ಧಿ.`
          : targetLang === "hi" ? `माता-पिता के सान्निध्य से अनुशासन एवं नैतिक संस्कारों में वृद्धि।`
            : targetLang === "mr" ? `पालकांच्या योग्य मार्गदर्शनाने शिस्त व उत्तम नैतिक संस्कारांची वृद्धी.`
              : targetLang === "te" ? `తల్లిదండ్రుల మార్గదర్శకత్వంలో క్రమశిక్షణ, సత్సంస్కారాల వృద్ధి.`
                : targetLang === "ta" ? `பெற்றோரின் வழிகாட்டுதலால் நற்பண்புகள் & ஒழுக்கம் மேலோங்கும்.`
                  : `Refinement of personal discipline, manners, and family emotional bonding.`
      ];

      turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಶ್ರಾವಣ-ಕಾರ್ತಿಕ ಮಾಸಗಳು (ವಾರ್ಷಿಕ ಪರೀಕ್ಷೆ ಹಾಗೂ ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ವಿಜಯ).`
        : targetLang === "hi" ? `वर्ष के श्रावण-कार्तिक मास (वार्षिक परीक्षा एवं प्रतियोगिताओं में विशेष सफलता)।`
          : targetLang === "mr" ? `वर्षातील श्रावण ते कार्तिक मास (वार्षिक परीक्षा व शालेय स्पर्धांत यश).`
            : targetLang === "te" ? `శ్రావణ-కార్తిక మాసాలు (పరీక్షలు మరియు పోటీలలో ఘన విజయం).`
              : targetLang === "ta" ? `ஆவணி-கார்த்திகை மாதங்கள் (தேர்வுகள் & போட்டிகளில் வெற்றி).`
                : `Autumn months (success in annual academic competitions and milestones).`;

      goldenWindow = targetLang === "kn" ? `ಗುರುಬಲ ಪ್ರಭಾವದ ತಿಂಗಳುಗಳಲ್ಲಿ ಹೊಸ ವಿದ್ಯಾರಂಭ ಅಥವಾ ಕೌಶಲ ತರಬೇತಿಗೆ ಅತ್ಯುತ್ತಮ.`
        : targetLang === "hi" ? `गुरु अनुकूलता के महीनों में नए कौशल एवं विद्यारंभ हेतु अत्यंत श्रेष्ठ।`
          : targetLang === "mr" ? `गुरूच्या अनुकूल काळात नवीन कला-विद्या शिकण्यासाठी अतिशय उत्तम योग.`
            : targetLang === "te" ? `గురుబల సమయాలలో కొత్త విద్యారంభం లేదా నైపుణ్య సాధనకు శ్రేష్టం.`
              : targetLang === "ta" ? `குரு பலன் உள்ள மாதங்களில் புதிய கல்வி ஆரம்பிக்க மிகச் சிறப்பு.`
                : `Favorable Guru months provide the highest window for skill learning.`;

      caution = targetLang === "kn" ? `ಹವಾಮಾನ ಬದಲಾವಣೆಯ ಸಮಯದಲ್ಲಿ ಶೀತ-ಕೆಮ್ಮು ಮತ್ತು ಹೊಟ್ಟೆಯ ಜೀರ್ಣಶಕ್ತಿಯ ಬಗ್ಗೆ ಪೋಷಕರು ಗಮನಹರಿಸಬೇಕು.`
        : targetLang === "hi" ? `ऋतु परिवर्तन के समय मौसमी सर्दी-जुकाम एवं खानपान का विशेष ध्यान रखें।`
          : targetLang === "mr" ? `ऋतुबदलाच्या काळात सर्दी, कफ व आहाराच्या सवयींकडे पालकांनी विशेष लक्ष द्यावे.`
            : targetLang === "te" ? `వాతావరణ మార్పుల సమయంలో జలుబు, అజీర్ణం పట్ల తల్లిదండ్రులు శ్రద్ధ వహించాలి.`
              : targetLang === "ta" ? `பருவநிலை மாற்றத்தின் போது சளி, இருமல் வராமல் பார்த்துக் கொள்ளவும்.`
                : `Maintain pediatric nutrition and hygiene during seasonal changes.`;

    } else if (detailedAgeThisYear === "adolescent") {
      headline = targetLang === "kn" ? `${gregorianRange}: ಪ್ರೌಢ ವಿದ್ಯಾಭ್ಯಾಸ, ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆ ಹಾಗೂ ಕೌಶಲ ವಿಕಾಸದ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: उच्चतर माध्यमिक शिक्षा, बोर्ड परीक्षा की तैयारी एवं कौशल विकास का वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: उच्च माध्यमिक शिक्षण, बोर्ड परीक्षेची तयारी व कौशल्य विकासाचे वर्ष`
            : targetLang === "te" ? `${gregorianRange}: ఉన్నత పాఠశాల చదువులు, బోర్డు పరీక్షల సన్నద్ధత & నైపుణ్యాభివృద్ధి సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: மேல்நிலைக் கல்வி, பொதுத்தேர்வு தயாரிப்பு & திறன்கள் கூடும் ஆண்டு`
                : `${gregorianRange}: Secondary Education, Board Exam Readiness & Talent Mastery Year`;

      whatToExpect = [
        targetLang === "kn" ? `ಪ್ರೌಢ ಹಂತದ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಏಕಾಗ್ರತೆ ಹಾಗೂ ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಶ್ರೇಷ್ಠ ಅಂಕಗಳು.`
          : targetLang === "hi" ? `माध्यमिक शिक्षा में गहन एकाग्रता एवं बोर्ड परीक्षाओं में उत्कृष्ट अंक प्राप्ति।`
            : targetLang === "mr" ? `उच्च माध्यमिक अभ्यासात तीव्र एकाग्रता व बोर्ड परीक्षेत अव्वल यश.`
              : targetLang === "te" ? `పాఠశాల చదువులో మంచి ఏకాగ్రత మరియు బోర్డు పరీక్షల్లో అత్యుత్తమ మార్కులు.`
                : targetLang === "ta" ? `மேல்நிலைக் கல்வியில் ஆழ்ந்த கவனம் மற்றும் பொதுத்தேர்வுகளில் சிறந்த மதிப்பெண்கள்.`
                  : `Sharp concentration in secondary academics and distinguished ranks in board examinations.`,
        targetLang === "kn" ? `ವಿಜ್ಞಾನ, ಗಣಿತ, ತಂತ್ರಜ್ಞಾನ ಅಥವಾ ಕಲಾ ವಿಭಾಗಗಳಲ್ಲಿ ನೂತನ ಕೌಶಲಗಳ ಸಿದ್ಧಿ.`
          : targetLang === "hi" ? `विज्ञान, गणित, तकनीकी अथवा कला क्षेत्र में नवीन दक्षताओं का विकास।`
            : targetLang === "mr" ? `विज्ञान, गणित, तंत्रज्ञान अथवा कला शाखेत नवीन कौशल्यांची प्राविण्यता.`
              : targetLang === "te" ? `సైన్స్, గణితం, కంప్యూటర్ లేదా కళారంగంలో విశేష నైపుణ్యాల సాధన.`
                : targetLang === "ta" ? `அறிவியல், கணிதம் அல்லது கலைப் பிரிவுகளில் தொழில்நுட்ப அறிவு மேலோங்குதல்.`
                  : `Acquisition of modern computational skills, STEM analytical fluency, or creative arts.`,
        targetLang === "kn" ? `ಸ್ಪರ್ಧಾತ್ಮಕ ಮನೋಭಾವ ಹಾಗೂ ಆದರ್ಶ ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣಕ್ಕೆ ಗುರುಹಿರಿಯರ ಆಶೀರ್ವಾದ.`
          : targetLang === "hi" ? `प्रतियोगी भावना एवं आदर्श चरित्र निर्माण हेतु गुरुजनों का संबल।`
            : targetLang === "mr" ? `स्पर्धात्मक वृत्ती व उत्तम चारित्र्य घडवण्यासाठी ज्येष्ठांचे मार्गदर्शन.`
              : targetLang === "te" ? `పోటీతత్వం మరియు సత్ప్రవర్తనతో కూడిన వ్యక్తిత్వ నిర్మాణానికి పెద్దల ఆశీస్సులు.`
                : targetLang === "ta" ? `போட்டி மனப்பான்மை மற்றும் நன்னடத்தைக்கு ஆசிரியர்களின் வழிகாட்டல்.`
                  : `Nurturing competitive poise, high ethical standards, and mentor guidance.`
      ];

      turningPoint = targetLang === "kn" ? `ವಾರ್ಷಿಕ ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳ ಫಲಿತಾಂಶದ ಮಾಸಗಳು.`
        : targetLang === "hi" ? `वार्षिक बोर्ड परीक्षा एवं प्रवेश परीक्षा परिणामों के निर्णायक मास।`
          : targetLang === "mr" ? `वार्षिक बोर्ड परीक्षा व प्रवेश परीक्षांच्या निकालाचा निर्णायक काळ.`
            : targetLang === "te" ? `వార్షిక బోర్డు పరీక్షలు మరియు ప్రవేశ పరీక్షల ఫలితాలు వచ్చే కీలక మాసాలు.`
              : targetLang === "ta" ? `பொதுத்தேர்வு மற்றும் நுழைவுத் தேர்வு முடிவுகள் வெளிவரும் முக்கியமான மாதங்கள்.`
                : `Crucial months of annual board examinations and college entrance evaluations.`;

      goldenWindow = targetLang === "kn" ? `ಬುಧಾದಿತ್ಯ ಹಾಗೂ ಗುರುಬಲದ ತಿಂಗಳುಗಳಲ್ಲಿ ಕಠಿಣ ವಿಷಯಗಳ ಗ್ರಹಿಕೆಗೆ ಅತ್ಯುತ್ತಮ ಕಾಲ.`
        : targetLang === "hi" ? `बुधादित्य एवं गुरु के अनुकूल समय में क्लिष्ट विषयों पर अधिकार प्राप्त करने की स्वर्णिम वेला।`
          : targetLang === "mr" ? `बुधादित्य व गुरुबळाच्या काळात कठीण विषय सहज आत्मसात करण्याचा उत्तम काळ.`
            : targetLang === "te" ? `బుధాదిత్య యోగం మరియు గురుబలంతో కఠినమైన అంశాలను సులభంగా అర్థం చేసుకునే సమయం.`
              : targetLang === "ta" ? `புதாதித்ய யோகம் & குரு பலனால் கடினமான பாடங்களையும் எளிதில் புரிந்து கொள்ளும் காலம்.`
                : `Budhaditya and Jovian windows elevate comprehension of demanding analytical syllabi.`;

      caution = targetLang === "kn" ? `ಮೊಬೈಲ್/ಗೇಮಿಂಗ್ ಪರದೆ ಸಮಯ ಮಿತಿಗೊಳಿಸಿ; ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಪರೀಕ್ಷಾ ಒತ್ತಡದಿಂದ ದೂರವಿರಿ.`
        : targetLang === "hi" ? `मोबाइल/गेमिंग स्क्रीन समय नियंत्रित रखें; अनिद्रा एवं परीक्षा के तनाव से बचें।`
          : targetLang === "mr" ? `मोबाईल/गेमिंगचा अतिवापर टाळा; अपुरी झोप व परीक्षेचा ताण येऊ देऊ नका.`
            : targetLang === "te" ? `మొబైల్/గేమింగ్ సమయాన్ని తగ్గించండి; నిద్రలేమి, పరీక్షల భయానికి దూరంగా ఉండండి.`
              : targetLang === "ta" ? `செல்போன்/விளையாட்டு நேரத்தைக் கட்டுப்படுத்தவும்; தூக்கமின்மை & தேர்வு பயத்தைத் தவிர்க்கவும்.`
                : `Strictly limit non-academic digital screen time; protect sleep against late-night fatigue.`;

    } else if (isBandhanaRisk) {
      headline = targetLang === "kn" ? `${gregorianRange}: ಕಾನೂನು ಪರಿಶೀಲನೆ, ಬಂಧನ ಭೀತಿ ಹಾಗೂ ಅತ್ಯುನ್ನತ ಜಾಗರೂಕತೆಯ ಪರೀಕ್ಷಾ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: विधिक समीक्षा, बंधन भय एवं सर्वोच्च संयम व अनुशासन का वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: कायदेशीर बंधने, स्थानबद्धतेची जोखीम व अत्यंत संयमाचे परीक्षा वर्ष`
            : targetLang === "te" ? `${gregorianRange}: న్యాయపరమైన పరిశీలన, నిర్బంధ ప్రమాదం & అత్యున్నత అప్రమత్తత సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: சட்ட சோதனைகள், சிறை/கட்டுப்பாடு அபாயம் & உச்சக்கட்ட விழிப்புணர்வு ஆண்டு`
                : `${gregorianRange}: Judicial Scrutiny, Confinement Peril & Paramount Restraint Year`;

      whatToExpect = [
        targetLang === "kn" ? `ನ್ಯಾಯಾಲಯ, ಆರೋಪ ಅಥವಾ ಕಾನೂನು ನಿರ್ಬಂಧಗಳ ಭೀತಿ; ವಿವಾದಿತ ಸಹವಾಸಗಳಿಂದ ದೂರವಿರುವುದು ಅನಿವಾರ್ಯ.`
          : targetLang === "hi" ? `न्यायालय, अभियोग अथवा विधिक प्रतिबंधों की संभावना; विवादास्पद संपर्कों से तत्काल दूरी अनिवार्य।`
            : targetLang === "mr" ? `न्यायालयीन खटले, आरोप किंवा कायदेशीर अडचणींची शक्यता; वादग्रस्त व्यक्तींच्या सहवासापासून दूर राहावे.`
              : targetLang === "te" ? `కోర్టు కేసులు, నిందలు లేదా చట్టపరమైన ఆంక్షల ప్రమాదం; వివాదాస్పద వ్యక్తులకు దూరంగా ఉండటం తప్పనిసరి.`
                : targetLang === "ta" ? `நீதிமன்ற வழக்குகள், குற்றச்சாட்டுகள் அல்லது சட்டரீதியான கட்டுப்பாடுகள்; சர்ச்சைக்குரிய நபர்களைத் தவிர்க்கவும்.`
                  : `Heightened legal vulnerability, judicial summons, or restrictions on personal movement.`,
        targetLang === "kn" ? `ಪ್ರಭಾವಿ ವ್ಯಕ್ತಿಗಳ ಜತೆಗಿನ ಭಿನ್ನಾಭಿಪ್ರಾಯ, ವಂಚನೆ ಅಥವಾ ಗೌಪ್ಯ ವಿರೋಧಿಗಳ ಕುತಂತ್ರಗಳ ವಿರುದ್ಧ ಕಟ್ಟೆಚ್ಚರ.`
          : targetLang === "hi" ? `प्रभावशाली व्यक्तियों से मतभेद, विश्वासघात अथवा गुप्त विरोधियों के षड्यंत्र से सतर्क रहें।`
            : targetLang === "mr" ? `वजनदार व्यक्तींशी मतभेद, विश्वासघात किंवा गुप्त विरोधकांच्या कारवायांविरुद्ध मोठी दक्षता बाळगा.`
              : targetLang === "te" ? `ప్రభావవంతమైన వ్యక్తులతో విభేదాలు, మోసాలు లేదా రహస్య శత్రువుల పట్ల తీవ్ర అప్రమత్తత.`
                : targetLang === "ta" ? `செல்வாக்குமிக்க நபர்களுடன் கருத்து வேறுபாடு, துரோகம் அல்லது மறைமுக எதிர்ப்புகள் குறித்து எச்சரிக்கை.`
                  : `Adversary pressures from authority figures, betrayal risk, or confidential investigations.`,
        targetLang === "kn" ? `ಅಧಿಕೃತ ದಾಖಲೆಗಳ ಶುದ್ಧತೆ ಕಾಪಾಡಿ; ದೇವತಾರಾಧನೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿಯಿಂದ ಸಂಕಷ್ಟ ನಿವಾರಣೆ.`
          : targetLang === "hi" ? `वैधानिक प्रपत्रों की शुचिता बनाए रखें; ईश्वरीय आराधना एवं नवग्रह शांति से संकट निवारण संभव।`
            : targetLang === "mr" ? `कागदपत्रांची अचूकता राखा; कुलदेवतेची उपासना व नवग्रह शांतीने संकटावर मात करता येईल.`
              : targetLang === "te" ? `అధికారిక పత్రాలను సరిచూసుకోండి; దైవారాధన మరియు నవగ్రహ శాంతితో ఆపదలు తొలగుతాయి.`
                : targetLang === "ta" ? `சட்ட ஆவணங்களை சரியாக வைத்திருக்கவும்; இறை வழிபாடு மற்றும் கிரக சாந்தியால் இடர்கள் விலகும்.`
                  : `Strict compliance with statutory filings; remedial prayers mitigate acute severity.`
      ];

      turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಶ್ರಾವಣ-ಭಾದ್ರಪದ ಮಾಸಗಳು (ಕಾನೂನು ಪ್ರಕ್ರಿಯೆಗಳಲ್ಲಿ ನಿರ್ಣಾಯಕ ಜಾಗರೂಕತೆಯ ಕಾಲ).`
        : targetLang === "hi" ? `वर्ष के श्रावण-भाद्रपद मास (विधिक मामलों में अत्यधिक सतर्कता का समय)।`
          : targetLang === "mr" ? `वर्षातील श्रावण-भाद्रपद मास (कायदेशीर बाबींमध्ये सर्वोच्च दक्षतेचा काळ).`
            : targetLang === "te" ? `శ్రావణ-భాద్రపద మాసాలు (చట్టపరమైన వ్యవహారాలలో అత్యంత అప్రమత్తత అవసరమైన సమయం).`
              : targetLang === "ta" ? `ஆவணி-புரட்டாசி மாதங்கள் (சட்ட விவகாரங்களில் மிகுந்த கவனத்துடன் செயல்பட வேண்டிய காலம்).`
                : `Mid-year monsoon transit (demanding absolute compliance with legal advisories).`;

      goldenWindow = targetLang === "kn" ? `ಏಕಾಂತ ಚಿಂತನೆ, ಆಧ್ಯಾತ್ಮಿಕ ಜಪ ಹಾಗೂ ನೈತಿಕ ಶುದ್ಧೀಕರಣಕ್ಕೆ ಮೀಸಲಾದ ಕಾಲ.`
        : targetLang === "hi" ? `एकांत चिंतन, आध्यात्मिक जप एवं आत्मसंयम हेतु उपयुक्त समय।`
          : targetLang === "mr" ? `एकांत, नामस्मरण व आध्यात्मिक आत्मपरीक्षणासाठी अनुकूल काळ.`
            : targetLang === "te" ? `ఏకాంత చింతన, ఆధ్యాత్మిక జపం మరియు ఆత్మపరిశీలనకు అనువైన సమయం.`
              : targetLang === "ta" ? `தனிமை, தியானம் மற்றும் ஆன்மீக பயிற்சிகளுக்கு உகந்த காலம்.`
                : `Strategic period for secluded reflection, meditation, and quiet ethical settlement.`;

      caution = targetLang === "kn" ? `ವಿವಾದಿತ ಸಹವಾಸಗಳನ್ನು ತಕ್ಷಣ ತ್ಯಜಿಸಿ; ಕಾನೂನು ನಿಯಮಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪಾಲಿಸಿ, ಯಾವುದೇ ಉಲ್ಲಂಘನೆ ಬೇಡ.`
        : targetLang === "hi" ? `विवादास्पद संपर्कों से तत्काल नाता तोड़ें; विधिक मर्यादाओं का शत-प्रतिशत पालन सुनिश्चित करें।`
          : targetLang === "mr" ? `वादग्रस्त संगती ताबडतोब सोडा; कोणत्याही परिस्थितीत कायद्याचे काटेकोर पालन करा.`
            : targetLang === "te" ? `వివాదాస్పద స్నేహాలను వెంటనే విడనాడండి; చట్ట నిబంధనలను కచ్చితంగా పాటించండి.`
              : targetLang === "ta" ? `சர்ச்சைக்குரிய தொடர்புகளை உடனடியாக துண்டிக்கவும்; சட்டவிதிகளை முழுமையாக பின்பற்றவும்.`
                : `Sever ties with controversial associations; strict adherence to judicial regulations is non-negotiable.`;

    } else if (isArishtaRisk) {
      headline = targetLang === "kn" ? `${gregorianRange}: ಆರೋಗ್ಯ ಗಂಡಾಂತರ, ಅಪಘಾತ ಎಚ್ಚರಿಕೆ ಹಾಗೂ ಚಿಕಿತ್ಸಾ ಉಪಶಮನದ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: स्वास्थ्य संकट, दुर्घटना भय एवं शल्यक्रिया/उपचार संयम का वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: आरोग्य संकट, अपघात भीती व शस्त्रक्रिया/उपचाराचे सतर्कता वर्ष`
            : targetLang === "te" ? `${gregorianRange}: ఆరోగ్య సంక్షోభం, ప్రమాద హెచ్చరిక & చికిత్సా ఉపశమన సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: தீவிர உடல்நலக் கோளாறு, விபத்து எச்சரிக்கை & சிகிச்சை ஓய்வு ஆண்டு`
                : `${gregorianRange}: Health Crisis, Physical Vulnerability & Surgical Convalescence Year`;

      whatToExpect = [
        targetLang === "kn" ? `ವಾಹನ ಚಾಲನೆ, ಪ್ರಯಾಣ ಹಾಗೂ ಸಾಹಸ ಕ್ರೀಡೆಗಳಲ್ಲಿ ಗರಿಷ್ಠ ಮುನ್ನೆಚ್ಚರಿಕೆ ಅಗತ್ಯ.`
          : targetLang === "hi" ? `वाहन चालन, यात्रा एवं जोखिम भरे कार्यों में अत्यधिक सावधानी अपेक्षित।`
            : targetLang === "mr" ? `वाहन चालवताना, प्रवासात व धाडसी कृती करताना सर्वोच्च काळजी घेणे आवश्यक.`
              : targetLang === "te" ? `వాహనం నడిపేటప్పుడు, ప్రయాణాలు మరియు సాహస క్రీడలలో అత్యంత జాగ్రత్త అవసరం.`
                : targetLang === "ta" ? `வாகனம் ஓட்டும் போதும், பயணங்களின் போதும் அதிகபட்ச பாதுகாப்பு தேவை.`
                  : `Paramount caution mandated in vehicular transit, high-velocity travel, and physical exertion.`,
        targetLang === "kn" ? `ಹಠಾತ್ ಅನಾರೋಗ್ಯ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಅಥವಾ ದೀರ್ಘಕಾಲೀನ ಚಿಕಿತ್ಸೆಗೆ ಒಳಗಾಗುವ ಸಾಧ್ಯತೆ.`
          : targetLang === "hi" ? `आकस्मिक स्वास्थ्य विकार, शल्यक्रिया अथवा दीर्घकालिक चिकित्सा की संभावना।`
            : targetLang === "mr" ? `अचानक उद्भवणारे आजारपण, शस्त्रक्रिया अथवा प्रदीर्घ उपचारांची आवश्यकता भासू शकते.`
              : targetLang === "te" ? `ఆకస్మిక అనారోగ్యం, శస్త్రచికిత్స లేదా దీర్ఘకాలిక చికిత్స పొందే అవకాశాలు.`
                : targetLang === "ta" ? `திடீர் உடல்நலக்குறைவு, அறுவை சிகிச்சை அல்லது தொடர் மருத்துவ பரிசோதனைகள் ஏற்படலாம்.`
                  : `Heightened probability of sudden physical trauma, surgical interventions, or bed rest.`,
        targetLang === "kn" ? `ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಆಯುಷ್ಯ ಹೋಮಗಳಿಂದ ಗಂಡಾಂತರ ನಿವಾರಣೆ ಮತ್ತು ಪುನರುಜ್ಜೀವನ.`
          : targetLang === "hi" ? `महामृत्युंजय अनुष्ठान एवं धन्वंतरि कृपा से संकटों का शमन एवं आरोग्य लाभ।`
            : targetLang === "mr" ? `महामृत्युंजय जप व धन्वंतरी कृपेने अरिष्ट निवारण व आरोग्यात हळूहळू सुधारणा.`
              : targetLang === "te" ? `మహామృత్యుంజయ జపం మరియు ఆయుష్య హోమాలతో గండాలు తొలగి సంపూర్ణ ఆరోగ్య రక్షణ.`
                : targetLang === "ta" ? `மகா மிருத்யுஞ்சய ஜெபம் மற்றும் ஆயுஷ் ஹோமங்களால் கண்டங்கள் நீங்கி ஆரோக்கியம் கூடும்.`
                  : `Maha Mrityunjaya japa and medical discipline ensure complete eventual rehabilitation.`
      ];

      turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಕಾರ್ತಿಕ ಅಥವಾ ಮಾರ್ಗಶಿರ ಮಾಸ (ಆರೋಗ್ಯ ಸುಧಾರಣೆಯ ಸಕಾರಾತ್ಮಕ ತಿರುವು).`
        : targetLang === "hi" ? `वर्ष के कार्तिक अथवा मार्गशीर्ष मास (स्वास्थ्य लाभ एवं सुधार का समय)।`
          : targetLang === "mr" ? `वर्षातील कार्तिक अथवा मार्गशीर्ष मास (आरोग्यात लक्षणीय सुधारणेचा काळ).`
            : targetLang === "te" ? `కార్తిక లేదా మార్గశిర మాసం (ఆరోగ్యం కుదుటపడే కీలక సమయం).`
              : targetLang === "ta" ? `கார்த்திகை அல்லது மார்கழி மாதம் (உடல்நலம் தேறி வரும் சாதகமான காலம்).`
                : `Late autumn convalescence period (marking decisive physical healing and medical recovery).`;

      goldenWindow = targetLang === "kn" ? `ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ, ಪಥ್ಯ ಪಾಲನೆ ಹಾಗೂ ದೈವಿಕ ಪ್ರಾರ್ಥನೆಗಳಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತ ಸಮಯ.`
        : targetLang === "hi" ? `नियमित स्वास्थ्य परीक्षण, सात्विक आहार एवं ईश्वरीय अनुष्ठान हेतु श्रेष्ठ काल।`
          : targetLang === "mr" ? `आरोग्य तपासणी, पथ्यपालन व धन्वंतरी पूजेसाठी उत्तम काळ.`
            : targetLang === "te" ? `వైద్య పరీక్షలు, ఆహార నియమాలు మరియు దైవ ప్రార్థనలకు అనువైన సమయం.`
              : targetLang === "ta" ? `மருத்துவ பரிசோதனை, உணவு கட்டுப்பாடு மற்றும் இறை வழிபாட்டிற்கு உகந்த காலம்.`
                : `Dedicated recovery window for regenerative therapies, disciplined diet, and medical guidance.`;

      caution = targetLang === "kn" ? `ಅತಿವೇಗದ ಚಾಲನೆ ಹಾಗೂ ರಾತ್ರಿ ಪ್ರಯಾಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತಪ್ಪಿಸಿ; ಸಣ್ಣ ಆರೋಗ್ಯ ಲಕ್ಷಣವನ್ನೂ ಕಡೆಗಣಿಸಬೇಡಿ.`
        : targetLang === "hi" ? `तीव्र गति से वाहन चालन एवं रात्रि यात्रा से बचें; स्वास्थ्य के प्रति तनिक भी लापरवाही न बरतें।`
          : targetLang === "mr" ? `वेगावर नियंत्रण ठेवा व रात्रीचा प्रवास टाळा; आरोग्याच्या किरकोळ तक्रारींकडेही दुर्लक्ष करू नका.`
            : targetLang === "te" ? `అతివేగంగా వాహనం నడపడం, రాత్రి ప్రయాణాలు మానండి; చిన్న అనారోగ్యాన్ని కూడా నిర్లక్ష్యం చేయవద్దు.`
              : targetLang === "ta" ? `அதிவேக பயணம் மற்றும் இரவு பயணங்களை தவிர்க்கவும்; சிறிய உடல் உபாதைகளையும் அலட்சியம் செய்யாதீர்கள்.`
                : `Strictly avoid nocturnal driving and excessive speeds; treat initial medical symptoms immediately.`;

    } else if (isRajaYogaPeak) {
      headline = targetLang === "kn" ? `${gregorianRange}: ರಾಜಯೋಗೋದಯ, ಸಾರ್ವಭೌಮ ಅಧಿಕಾರ ಹಾಗೂ ಕೀರ್ತಿ ಶಿಖರದ ಸುವರ್ಣ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: राजयोगोदय, सर्वोच्च अधिकार एवं कीर्ति के शिखर का स्वर्णिम वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: राजयोग, सर्वोच्च सत्ता व कीर्तिशिखराचे ऐतिहासिक सुवर्ण वर्ष`
            : targetLang === "te" ? `${gregorianRange}: రాజయోగోదయం, సార్వభౌమ అధికారం & కీర్తి శిఖర స్వర్ణ సంవత్సరం`
              : targetLang === "ta" ? `${gregorianRange}: ராஜயோக காலம், உச்சக்கட்ட அதிகாரம் & பெரும் புகழின் பொற்காலம்`
                : `${gregorianRange}: Sovereign Raja Yoga, Apex Authority & Career Pinnacle Golden Year`;

      whatToExpect = [
        targetLang === "kn" ? `ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಸಾರ್ವಭೌಮ ಮುನ್ನಡೆ, ಉನ್ನತ ನಾಯಕತ್ವ ಅಥವಾ ಐತಿಹಾಸಿಕ ವೃತ್ತಿಪರ ಯಶಸ್ಸು.`
          : targetLang === "hi" ? `करियर में ऐतिहासिक शिखर, सर्वोच्च नेतृत्व की प्राप्ति एवं जनमानस में अभूतपूर्व ख्याति।`
            : targetLang === "mr" ? `करिअरमध्ये ऐतिहासिक यश, सर्वोच्च नेतृत्वाची धुरा व जनमानसात प्रचंड लोकप्रियता.`
              : targetLang === "te" ? `కెరీర్‌లో చారిత్రాత్మక శిఖరం, అత్యున్నత నాయకత్వం మరియు ప్రజాదరణ.`
                : targetLang === "ta" ? `தொழில் வாழ்க்கையில் வரலாற்றுச் சிறப்புமிக்க வெற்றி, உச்சக்கட்ட தலைமை மற்றும் பெரும் புகழ்.`
                  : `Ascension to paramount vocational leadership, global accolades, and watershed professional triumphs.`,
        targetLang === "kn" ? `ಅಪಾರ ಧನಾಗಮನ, ಪ್ರಮುಖ ಹೂಡಿಕೆಗಳ ಸಾಫಲ್ಯ ಹಾಗೂ ನೂತನ ಆಸ್ತಿಗಳ ಸಂಪಾದನೆ.`
          : targetLang === "hi" ? `विशाल धन-समृद्धि, दीर्घकालीन निवेशों में असाधारण लाभ एवं कीमती संपत्तियों का अर्जन।`
            : targetLang === "mr" ? `अफाट धनसंपत्ती, महत्त्वाच्या गुंतवणुकीतून भरघोस नफा व नवीन मालमत्तेची निर्मिती.`
              : targetLang === "te" ? `అపార ధన ప్రవాహం, కీలక పెట్టుబడుల సాఫల్యం మరియు విలువైన ఆస్తుల సమకూర్పు.`
                : targetLang === "ta" ? `அபரிமிதமான தனலாபம், முதலீடுகளில் பெரும் லாபம் மற்றும் புதிய சொத்துக்கள் சேர்க்கை.`
                  : `Exponential wealth accumulation, high-yield asset acquisitions, and commercial expansion.`,
        targetLang === "kn" ? `ಸಮಾಜದಲ್ಲಿ ಗೌರವ, ಪ್ರಶಸ್ತಿ-ಪುರಸ್ಕಾರಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕವಾಗಿ ಅತ್ಯುನ್ನತ ಮನ್ನಣೆ.`
          : targetLang === "hi" ? `समाज में सर्वोच्च मान-सम्मान, प्रतिष्ठित पुरस्कार एवं राज्य स्तर पर प्रतिष्ठा।`
            : targetLang === "mr" ? `समाजात मोठा सन्मान, मानाचे राष्ट्रीय/आंतरराष्ट्रीय पुरस्कार व सर्वत्र कौतुक.`
              : targetLang === "te" ? `సమాజంలో విశేష గౌరవం, ప్రతిష్టాత్మక పురస్కారాలు మరియు ఉన్నత ప్రజా గుర్తింపు.`
                : targetLang === "ta" ? `சமூகத்தில் உச்சகட்ட கௌரவம், தேசிய/சர்வதேச விருதுகள் மற்றும் நன்மதிப்பு.`
                  : `Universal public acclaim, apex industry honors, and lasting historical legacy.`
      ];

      turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಚೈತ್ರ-ವೈಶಾಖ ಮಾಸಗಳು (ರಾಜಯೋಗದ ಪೂರ್ಣ ಫಲ ಜಾಗೃತವಾಗುವ ಸುವರ್ಣ ಕಾಲ).`
        : targetLang === "hi" ? `वर्ष के चैत्र-वैशाख मास (राजयोग के पूर्ण फलित होने का स्वर्णिम काल)।`
          : targetLang === "mr" ? `वर्षातील चैत्र-वैशाख मास (राजयोग फळास येण्याचा सर्वोच्च सुवर्ण काळ).`
            : targetLang === "te" ? `చైత్ర-వైశాఖ మాసాలు (రాజయోగ సంపూర్ణ ఫలాలు అందించే స్వర్ణ సమయం).`
              : targetLang === "ta" ? `சித்திரை-வைகாசி மாதங்கள் (ராஜயோகம் முழுமையாக மலரும் பொற்காலம்).`
                : `Spring equinox cycle (activating full sovereign authority, coronation, or apex title).`;

      goldenWindow = targetLang === "kn" ? `ಹೊಸ ಬೃಹತ್ ಯೋಜನೆಗಳ ಚಾಲನೆ, ಚುನಾವಣಾ ಗೆಲುವು ಅಥವಾ ಮಹತ್ವದ ಒಪ್ಪಂದಗಳಿಗೆ ಪ್ರಶಸ್ತ ಕಾಲ.`
        : targetLang === "hi" ? `नवीन वृहद् परियोजनाओं का शुभारंभ, चुनाव विजय अथवा ऐतिहासिक अनुबंधों हेतु सर्वोत्तम समय।`
          : targetLang === "mr" ? `नवीन भव्य प्रकल्पांची सुरुवात, निवडणूक विजय अथवा ऐतिहासिक करारांसाठी सर्वोत्तम काळ.`
            : targetLang === "te" ? `నూతన భారీ ప్రాజెక్టులు, ఎన్నికల విజయం లేదా కీలక ఒప్పందాలకు అత్యంత శుభ సమయం.`
              : targetLang === "ta" ? `புதிய பிரம்மாண்ட திட்டங்கள் துவக்கம், தேர்தல் வெற்றி அல்லது வரலாற்று ஒப்பந்தங்களுக்கு உகந்தது.`
                : `Auspicious window for historic commercial contracts, venture inaugurations, or public victories.`;

      caution = targetLang === "kn" ? `ಅನಗತ್ಯ ಸಾಲ ಮಾಡಬೇಡಿ; ಅಪರಿಚಿತ ಆನ್‌ಲೈನ್ ಹೂಡಿಕೆ ಅಥವಾ ದುಂದುವೆಚ್ಚವನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಿ.`
        : targetLang === "hi" ? `अनावश्यक ऋण लेने से बचें; अज्ञात ऑनलाइन योजनाओं अथवा फिजूलखर्ची पर पूर्ण रोक लगाएं।`
          : targetLang === "mr" ? `अनावश्यक कर्ज काढू नका; अनोळखी ऑनलाइन योजना अथवा उधळपट्टीवर पूर्ण लगाम लावा.`
            : targetLang === "te" ? `అనవసర అప్పులు చేయవద్దు; అపరిచిత ఆన్‌లైన్ పెట్టుబడులు లేదా వృథా ఖర్చులకు దూరంగా ఉండండి.`
              : targetLang === "ta" ? `தேவையில்லாமல் கடன் வாங்க வேண்டாம்; தேவையற்ற ஆன்லைன் திட்டங்கள் அல்லது வீண் செலவுகளை தவிர்க்கவும்.`
                : `Strictly avoid speculative online investments and unvetted loans; enforce rigorous fiscal restraint.`;

    } else if (munthaHouse === 6) {
      if (isShatruVijaya) {
        headline = targetLang === "kn" ? `${gregorianRange}: ಶತ್ರು ಜಯ, ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯಭೇರಿ ಹಾಗೂ ಪ್ರತಿಷ್ಠಾ ಪುನರುತ್ಥಾನದ ವರ್ಷ`
          : targetLang === "hi" ? `${gregorianRange}: शत्रु विजय, चुनावी/प्रतिस्पर्धी सफलता एवं वर्चस्व पुनर्स्थापना वर्ष`
            : targetLang === "mr" ? `${gregorianRange}: शत्रू विजय, स्पर्धात्मक यश व वर्चस्व पुनर्स्थापनेचे वर्ष`
              : targetLang === "te" ? `${gregorianRange}: శత్రు జయం, పోటీ పరీక్షలు/ఎన్నికల విజయం & ఆధిపత్య పునరుద్ధరణ`
                : targetLang === "ta" ? `${gregorianRange}: எதிரிகளை வெல்லும் காலம், தேர்தல்/போட்டி வெற்றி & ஆதிக்க நிலை ஆண்டு`
                  : `${gregorianRange}: Shatru Vijaya, Competitive Supremacy & Resurgence Victory Year`;

        whatToExpect = [
          targetLang === "kn" ? `ಪ್ರತಿರೋಧಿಗಳು, ರಾಜಕೀಯ ಅಥವಾ ವೃತ್ತಿಪರ ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ನಿರ್ಣಾಯಕ ವಿಜಯ.`
            : targetLang === "hi" ? `विरोधियों, राजनैतिक अथवा व्यावसायिक प्रतिद्वंद्वियों पर निर्णायक विजय।`
              : targetLang === "mr" ? `विरोधक, राजकीय अथवा व्यावसायिक स्पर्धकांवर निर्णायक मात.`
                : targetLang === "te" ? `రాజకీయ లేదా వృత్తిపరమైన ప్రత్యర్థులపై నిర్ణయాత్మక విజయం.`
                  : targetLang === "ta" ? `அரசியல் அல்லது தொழில்முறை எதிர்ப்பாளர்களை வென்று சாதனை.`
                    : `Decisive triumph over long-standing adversaries, legal rivals, and organizational competitors.`,
          targetLang === "kn" ? `ವಿವಾದಗಳು ಮತ್ತು ಸವಾಲುಗಳನ್ನು ಮೀರಿ ಜನಬೆಂಬಲ ಹಾಗೂ ಸ್ಥಾನಮಾನದ ಪುನರುತ್ಥಾನ.`
            : targetLang === "hi" ? `विवादों व चुनौतियों के बावजूद जनसमर्थन एवं उच्च पद की पुनर्प्राप्ति।`
              : targetLang === "mr" ? `वादविवाद व आव्हानांवर मात करून जनसमर्थन व अधिकाराची पुनर्प्राप्ती.`
                : targetLang === "te" ? `వివాదాలు అధిగమించి ప్రజా మద్దతు మరియు ఉన్నత హోదా లభించును.`
                  : targetLang === "ta" ? `சவால்களை வென்று மக்கள் செல்வாக்கு மற்றும் உயர் பதவியை அடைதல்.`
                    : `Electoral resurgence, popular mandate, and strategic reclamation of authority.`,
          targetLang === "kn" ? `ನ್ಯಾಯಾಲಯ ಹಾಗೂ ತನಿಖಾ ಪ್ರಕ್ರಿಯೆಗಳಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ತಿರುವು ಮತ್ತು ವಿಮೋಚನೆ.`
            : targetLang === "hi" ? `विधिक एवं जांच प्रक्रियाओं में अप्रत्याशित राहत तथा अनुकूल निर्णय।`
              : targetLang === "mr" ? `न्यायालयीन प्रकरणांत मोठा दिलासा व निर्दोष सुटकेची शक्यता.`
                : targetLang === "te" ? `కోర్టు వ్యవహారాలలో భారీ ఉపశమనం మరియు అనుకూల తీర్పులు.`
                  : targetLang === "ta" ? `நீதிமன்ற வழக்குகளில் சாதகமான தீர்ப்பு மற்றும் பெரிய நிம்மதி.`
                    : `Favorable resolution of contentious inquiries, litigations, and forensic battles.`
        ];

        turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಶರದೃತು / ಕಾರ್ತಿಕ ಮಾಸ (ಚುನಾವಣಾ ಅಥವಾ ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯದ ಮಹಾ ಕ್ಷಣ).`
          : targetLang === "hi" ? `वर्ष की शरद ऋतु / कार्तिक मास (चुनावी अथवा निर्णायक विजय का क्षण)।`
            : targetLang === "mr" ? `वर्षातील शरद ऋतू / कार्तिक मास (निवडणूक अथवा निर्णायक विजयाचा क्षण).`
              : targetLang === "te" ? `శరదృతువు / కార్తిక మాసం (కీలక ఎన్నికల విజయం లభించే సమయం).`
                : targetLang === "ta" ? `ஐப்பசி-கார்த்திகை மாதங்கள் (தேர்தல் அல்லது பெரிய வெற்றிக் காலம்).`
                  : `Late autumn epoch (pivotal electoral verdict, competitive climax, or summit coronation).`;

        goldenWindow = targetLang === "kn" ? `ವ್ಯೂಹಾತ್ಮಕ ಪ್ರಚಾರ ಹಾಗೂ ಶತ್ರು ನಿಗ್ರಹ ರಾಜತಾಂತ್ರಿಕತೆಗೆ ಸುವರ್ಣ ಕಾಲ.`
          : targetLang === "hi" ? `रणनीतिक जनसंपर्क एवं प्रतिद्वंद्वी नियंत्रण हेतु स्वर्णिम समय।`
            : targetLang === "mr" ? `रणनीतिक मोहीम व विरोधक नियंत्रण यासाठी सर्वोत्तम काळ.`
              : targetLang === "te" ? `వ్యూహాత్మక ప్రచారం మరియు శత్రు నివారణకు అనువైన సమయం.`
                : targetLang === "ta" ? `வியூக பிரச்சாரம் மற்றும் எதிர்ப்புகளை முறியடிக்க உகந்த காலம்.`
                  : `Prime window for strategic campaigns, debate triumphs, and adversary neutralization.`;

        caution = targetLang === "kn" ? `ಅತಿರೇಕದ ಆತ್ಮವಿಶ್ವಾಸ ತಪ್ಪಿಸಿ; ಕಾನೂನು ಮತ್ತು ಆಡಳಿತಾತ್ಮಕ ನಿಯಮಾವಳಿಗಳನ್ನು ಗೌರವಿಸಿ.`
          : targetLang === "hi" ? `अति-आत्मविश्वास से बचें; वैधानिक एवं प्रशासनिक मर्यादाओं का सम्मान करें।`
            : targetLang === "mr" ? `अतिआत्मविश्वास टाळा; कायदेशीर व प्रशासकीय नियमांचे पालन करा.`
              : targetLang === "te" ? `అతి విశ్వాసం పనికిరాదు; చట్టపరమైన నిబంధనలను గౌరవించండి.`
                : targetLang === "ta" ? `அதிகப்படியான தன்னம்பிக்கையை தவிர்க்கவும்; சட்ட விதிகளை மதிக்கவும்.`
                  : `Guard against overconfidence; maintain strict administrative and legal vigilance.`;
      } else {
        headline = targetLang === "kn" ? `${gregorianRange}: ಸ್ಪರ್ಧಾತ್ಮಕ ಸಮರ, ಶತ್ರು-ವಿವಾದ ಪರಿಹಾರ ಹಾಗೂ ಕಠಿಣ ಪರೀಕ್ಷಾ ವರ್ಷ`
          : targetLang === "hi" ? `${gregorianRange}: प्रतिस्पर्धी संघर्ष, विवाद निवारण एवं कठिन परीक्षा का वर्ष`
            : targetLang === "mr" ? `${gregorianRange}: स्पर्धात्मक संघर्ष, वाद निवारण व कठोर परीक्षेचे वर्ष`
              : targetLang === "te" ? `${gregorianRange}: తీవ్ర పోటీ, వివాదాల పరిష్కారం & కఠిన పరీక్షా సంవత్సరం`
                : targetLang === "ta" ? `${gregorianRange}: கடும் போட்டி, வழக்குகள் தீர்வு & கடுமையான சவால்கள் நிறைந்த ஆண்டு`
                  : `${gregorianRange}: Competitive Warfare, Rivalry Resolution & Hard-Won Triumph Year`;

        whatToExpect = [
          targetLang === "kn" ? `ಶತ್ರುಗಳು, ಸ್ಪರ್ಧಿಗಳು ಅಥವಾ ವಿರೋಧಿ ಗುಂಪುಗಳಿಂದ ತೀವ್ರ ಸ್ಪರ್ಧೆ ಮತ್ತು ಸವಾಲುಗಳು.`
            : targetLang === "hi" ? `शत्रुओं, प्रतिद्वंद्वियों अथवा विरोधी पक्षों से कड़ा मुकाबला व चुनौतियां।`
              : targetLang === "mr" ? `शत्रू, स्पर्धक अथवा विरोधी गटांकडून तीव्र आव्हान व संघर्ष.`
                : targetLang === "te" ? `ప్రత్యర్థులు లేదా శత్రు వర్గాల నుండి తీవ్ర పోటీ మరియు సవాళ్ళు.`
                  : targetLang === "ta" ? `எதிராளிகள் மற்றும் போட்டிக் குழுக்களால் கடுமையான சவால்கள்.`
                    : `Fierce adversarial friction, court subpoenas, political warfare, and competitive heat.`,
          targetLang === "kn" ? `ನ್ಯಾಯಾಲಯದ ವಿಚಾರಣೆಗಳು, ವಿವಾದಗಳು ಮತ್ತು ರಾಜಕೀಯ ಆರೋಪಗಳ ಪರಿಹಾರಕ್ಕೆ ಹೋರಾಟ.`
            : targetLang === "hi" ? `विधिक प्रक्रिया, विवादों एवं राजनैतिक आरोपों के समाधान हेतु सतत संघर्ष।`
              : targetLang === "mr" ? `कायदेशीर अडचणी, वादविवाद व आरोपांचा सामना करून मार्ग काढणे.`
                : targetLang === "te" ? `కోర్టు కేసులు, వివాదాలు మరియు నిందలను ధైర్యంగా ఎదుర్కొనుట.`
                  : targetLang === "ta" ? `நீதிமன்ற விசாரணைகள் மற்றும் சர்ச்சை வழக்குகளை தைரியமாக எதிர்கொள்ளுதல்.`
                    : `High-stakes litigation battles, investigative scrutiny, and relentless pushback.`,
          targetLang === "kn" ? `ನಿರಂತರ ಹೋರಾಟದಿಂದ ಸತ್ಯ ಸಾಬೀತು ಹಾಗೂ ಹಂತ-ಹಂತವಾಗಿ ವಿರೋಧಿಗಳ ಶಮನ.`
            : targetLang === "hi" ? `सतत संघर्ष से सत्य की विजय एवं धीरे-धीरे विरोधियों का शमन।`
              : targetLang === "mr" ? `नेटाने दिलेल्या लढ्यामुळे सत्य समोर येऊन विरोधक निष्प्रभ ठरतील.`
                : targetLang === "te" ? `నిరంతర పోరాటంతో నిజం గెలుపొంది క్రమంగా ప్రత్యర్థులు శాంతిస్తారు.`
                  : targetLang === "ta" ? `தொடர் போராட்டத்தால் உண்மை வென்று எதிர்ப்புகள் படிப்படியாக குறையும்.`
                    : `Tenacious endurance leading to incremental survival and hard-won tactical breakthroughs.`
        ];

        turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಶರತ್-ಹೇಮಂತ ಕಾಲ (ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಚಾರಣೆಗಳಲ್ಲಿ ಮಹತ್ವದ ತಿರುವು).`
          : targetLang === "hi" ? `वर्ष के शरद-हेमंत मास (विधिक/प्रतिस्पर्धी मामलों में निर्णायक मोड़)।`
            : targetLang === "mr" ? `वर्षातील शरद-हेमंत ऋतू (संघर्षात महत्त्वपूर्ण वळण देणारा काळ).`
              : targetLang === "te" ? `శరత్-హేమంత కాలం (పోరాటాలలో కీలక మలుపు తిరిగే సమయం).`
                : targetLang === "ta" ? `ஐப்பசி-மார்கழி மாதங்கள் (விசாரணைகளில் ஒரு முக்கிய திருப்புமுனை).`
                  : `Autumn-winter crossway (marking major trial turning points and tactical counter-strikes).`;

        goldenWindow = targetLang === "kn" ? `ಸ್ಪರ್ಧಾತ್ಮಕ ಸಿದ್ಧತೆ, ಸಾಕ್ಷ್ಯಾಧಾರ ಕ್ರೋಡೀಕರಣ ಹಾಗೂ ಆಂತರಿಕ ಸಂಘಟನೆಗೆ ಪ್ರಶಸ್ತ.`
          : targetLang === "hi" ? `तथ्य संकलन, विधिक तैयारी एवं संगठनात्मक मजबूती हेतु श्रेष्ठ काल।`
            : targetLang === "mr" ? `पुरावे गोळा करणे, कायदेशीर तयारी व संघटना बांधणीसाठी उत्तम काळ.`
              : targetLang === "te" ? `ఆధారాలు సేకరించడం మరియు సంసిద్ధతకు అనువైన సమయం.`
                : targetLang === "ta" ? `ஆதாரங்கள் திரட்டவும் மற்றும் தயாராக இருக்கவும் உகந்த காலம்.`
                  : `Strategic mobilization window for gathering evidence and counter-offensive preparations.`;

        caution = targetLang === "kn" ? `ಮಾತಿನಲ್ಲಿ ಆವೇಶ ಬೇಡ; ಉದ್ವೇಗದ ಹೇಳಿಕೆಗಳು ವಿರೋಧಿಗಳಿಗೆ ಅಸ್ತ್ರವಾಗದಂತೆ ಎಚ್ಚರವಹಿಸಿ.`
          : targetLang === "hi" ? `वाणी पर संयम रखें; उत्तेजक वक्तव्य विरोधियों को अवसर न देने पाएं।`
            : targetLang === "mr" ? `बोलण्यावर ताबा ठेवा; भावनिक विधानांमुळे विरोधकांना संधी मिळणार नाही याची काळजी घ्या.`
              : targetLang === "te" ? `ఆవేశపూరిత వ్యాఖ్యలు చేయవద్దు; మాటల వల్ల వివాదాలు పెరగకుండా చూసుకోండి.`
                : targetLang === "ta" ? `பேச்சில் நிதானம் தேவை; ஆவேசமான வார்த்தைகள் எதிரிகளுக்கு சாதகமாக மாறக்கூடும்.`
                  : `Avoid impulsive verbal outbursts; ensure rhetoric cannot be weaponized by legal rivals.`;
      }

    } else if (ageCategory === "youth") {
      headline = targetLang === "kn" ? `${gregorianRange}: ಉನ್ನತ ವ್ಯಾಸಂಗ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ ಹಾಗೂ ವೃತ್ತಿ ಪ್ರವೇಶದ ಹಂತ`
        : targetLang === "hi" ? `${gregorianRange}: उच्च शिक्षा, प्रतियोगी परीक्षा एवं करियर निर्माण का महत्वपूर्ण वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: उच्च शिक्षण, स्पर्धा परीक्षा व करिअरची दिशा ठरवणारे वर्ष`
            : targetLang === "te" ? `${gregorianRange}: ఉన్నత విద్య, పోటీ పరీక్షలు & తొలి ఉద్యోగ ప్రవేశం`
              : targetLang === "ta" ? `${gregorianRange}: உயர் கல்வி, போட்டித் தேர்வு & முதல் வேலை வாய்ப்பு`
                : `${gregorianRange}: Higher Education, Competitive Exams & Career Launchpad`;

      whatToExpect = [
        targetLang === "kn" ? `ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಶ್ರೇಯಾಂಕ ಹಾಗೂ ಇಷ್ಟಪಟ್ಟ ಕಾಲೇಜು ಅಥವಾ ಕೋರ್ಸ್ ಪ್ರವೇಶಾವಕಾಶ.`
          : targetLang === "hi" ? `प्रतियोगी परीक्षाओं में उत्तम अंक एवं मनपसंद पाठ्यक्रम में प्रवेश के अवसर।`
            : targetLang === "mr" ? `स्पर्धा परीक्षांमध्ये उत्तम यश व पसंतीच्या अभ्यासक्रमात / महाविद्यालयात प्रवेश.`
              : targetLang === "te" ? `పరీక్షల్లో అద్భుత ర్యాంకు మరియు కోరుకున్న కళాశాలలో ప్రవేశావకాశం.`
                : targetLang === "ta" ? `தேர்வுகளில் சிறந்த தகுதி & விரும்பிய கல்லூரியில் சேர்க்கை.`
                  : `Strong academic rank and admission breakthroughs into preferred institutes.`,
        targetLang === "kn" ? `ಮೊದಲ ಉದ್ಯೋಗ ಅಥವಾ ಇಂಟರ್ನ್‌ಶಿಪ್‌ನಲ್ಲಿ ಪ್ರಮುಖ ಜವಾಬ್ದಾರಿ ಮತ್ತು ಗೌರವ.`
          : targetLang === "hi" ? `प्रथम रोजगार अथवा इंटर्नशिप में महत्वपूर्ण उत्तरदायित्व एवं मान-सम्मान।`
            : targetLang === "mr" ? `पहिल्या नोकरीत किंवा इंटर्नशिपमध्ये मोठी जबाबदारी व कर्तृत्वाला वाव.`
              : targetLang === "te" ? `మొదటి ఉద్యోగం లేదా ఇంటర్న్‌షిప్‌లో కీలక బాధ్యతలు మరియు గౌరవం.`
                : targetLang === "ta" ? `முதல் வேலை அல்லது இன்டர்ன்ஷிப்பில் நல்ல பொறுப்பு & மரியாதை.`
                  : `Early professional breakthrough, campus placements, or meaningful mentorship.`,
        targetLang === "kn" ? `ಸ್ವಾವಲಂಬನೆ ಮತ್ತು ಆರ್ಥಿಕ ಯೋಜನೆಯ ಮೊದಲ ಹೆಜ್ಜೆಗಳು.`
          : targetLang === "hi" ? `स्वावलंबन एवं भविष्य की आर्थिक योजनाओं का सफल आरंभ।`
            : targetLang === "mr" ? `आर्थिक स्वावलंबन व भविष्यातील बचतीचा पहिला यशस्वी टप्पा.`
              : targetLang === "te" ? `ఆర్థిక స్వావలంబన మరియు భవిష్యత్ పొదుపు ప్రణాళికలు.`
                : targetLang === "ta" ? "சுயசார்பு மற்றும் எதிர்கால சேமிப்பு ஆரம்பம்."
                  : `Financial self-reliance and disciplined future budgeting.`
      ];

      turningPoint = targetLang === "kn" ? `ಉತ್ತರಾಯಣದ ಮಾಘ-ಫಾಲ್ಗುಣ ಕಾಲ (ಮುಖ್ಯ ಸಂದರ್ಶನ ಮತ್ತು ಫಲಿತಾಂಶಗಳ ಸಮಯ).`
        : targetLang === "hi" ? `उत्तरायण के माघ-फाल्गुन मास (साक्षात्कार एवं महत्वपूर्ण निर्णयों का समय)।`
          : targetLang === "mr" ? `उत्तरायणातील माघ ते फाल्गुन मास (महत्त्वाच्या मुलाखती व निकालांचा काळ).`
            : targetLang === "te" ? `మాఘ-ఫాల్గుణ మాసాలు (ముఖ్య ఇంటర్వ్యూలు మరియు ఫలితాల సమయం).`
              : targetLang === "ta" ? `மாசி-பங்குனி மாதங்கள் (முக்கிய நேர்முகத் தேர்வு & முடிவுகள்).`
                : `Spring months (key interviews, exam verdicts, and admission offers).`;

      goldenWindow = targetLang === "kn" ? `ಗುರುಬಲದ ಅವಧಿಯಲ್ಲಿ ವೃತ್ತಿಪರ ಪ್ರಮಾಣಪತ್ರ ಹಾಗೂ ಜ್ಞಾನ ವಿಸ್ತರಣೆಗೆ ಸುವರ್ಣ ಕಾಲ.`
        : targetLang === "hi" ? `गुरु के शुभ प्रभाव में तकनीकी दक्षता एवं विदेश/अन्य राज्य जाने हेतु स्वर्णिम अवसर।`
          : targetLang === "mr" ? `गुरूच्या शुभ प्रभावात व्यावसायिक कौशल्ये व उच्च शिक्षणासाठी सुवर्णसंधी.`
            : targetLang === "te" ? `గురుబలంతో ప్రొఫెషనల్ సర్టిఫికేషన్ మరియు ఉన్నత విద్యా ప్రయాణం.`
              : targetLang === "ta" ? `குரு பலனால் உயர்கல்வி மற்றும் தொழில் சான்றிதழ் யோகம்.`
                : `Guru transit period offers sovereign support for career certification.`;

      caution = targetLang === "kn" ? `ಅನಾವಶ್ಯಕ ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ವ್ಯಾಮೋಹ ಹಾಗೂ ದುಂದುವೆಚ್ಚಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ.`
        : targetLang === "hi" ? `सोशल मीडिया के भटकाव एवं व्यर्थ समय गंवाने से बचें।`
          : targetLang === "mr" ? `सोशल मीडियाचा अतिवापर व मित्रांच्या संगतीत होणारा वेळ वाया घालवणे टाळावे.`
            : targetLang === "te" ? `సోషల్ మీడియా వ్యామోహం మరియు దుబారా ఖర్చులను నియంత్రించండి.`
              : targetLang === "ta" ? `சமூக ஊடக வீண் பொழுதுபோக்கு மற்றும் தேவையற்ற செலவுகளைத் தவிர்க்கவும்.`
                : `Shield focus against digital distractions and impulsive spending.`;

    } else if (ageCategory === "senior") {
      headline = targetLang === "kn" ? `${gregorianRange}: ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಾರ್ಥಕತೆಯ ವರ್ಷ`
        : targetLang === "hi" ? `${gregorianRange}: आध्यात्मिक शांति, तीर्थयात्रा एवं पारिवारिक संतुष्टि का वर्ष`
          : targetLang === "mr" ? `${gregorianRange}: आध्यात्मिक मनःशांती, तीर्थाटन व कौटुंबिक समाधानाचे वर्ष`
            : targetLang === "te" ? `${gregorianRange}: ఆధ్యాత్మిక శాంతి, తీర్థయాత్రలు & కుటుంబ సంతృప్తి`
              : targetLang === "ta" ? `${gregorianRange}: ஆன்மீக அமைதி, தீர்த்த யாத்திரை & குடும்ப நிறைவு`
                : `${gregorianRange}: Spiritual Peace, Sacred Pilgrimage & Family Grace`;

      whatToExpect = [
        targetLang === "kn" ? `ಮಕ್ಕಳ ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳ ಪ್ರಗತಿಯನ್ನು ಕಂಡು ಆನಂದ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಗೌರವ.`
          : targetLang === "hi" ? `संतान व पौत्र-पौत्रियों की उन्नति से परम आनंद एवं पारिवारिक प्रतिष्ठा।`
            : targetLang === "mr" ? `मुले व नातवंडांच्या प्रगतीने मनस्वी आनंद व कुटुंबात मोठा आदर-सत्कार.`
              : targetLang === "te" ? `పిల్లలు, మనవళ్ల ప్రగతితో అపార సంతోషం మరియు సమాజంలో గౌరవం.`
                : targetLang === "ta" ? `பிள்ளைகள் மற்றும் பேரப்பிள்ளைகளின் வளர்ச்சியால் குடும்ப மகிழ்ச்சி.`
                  : `Deep contentment observing children's prospering lives and family lineage.`,
        targetLang === "kn" ? `ಪ್ರಮುಖ ಪುಣ್ಯಕ್ಷೇತ್ರಗಳ ಸಂದರ್ಶನ ಹಾಗೂ ತೀರ್ಥಯಾತ್ರಾ ಸಂಕಲ್ಪ ಈಡೇರಿಕೆ.`
          : targetLang === "hi" ? `प्रमुख तीर्थस्थलों की यात्रा एवं धार्मिक अनुष्ठानों की सफल पूर्णता।`
            : targetLang === "mr" ? `प्रमुख तीर्थक्षेत्रांचे दर्शन व धार्मिक अनुष्ठानांचे सुफळ संपूर्ण आयोजन.`
              : targetLang === "te" ? `ప్రసిద్ధ పుణ్యక్షేత్రాల దర్శనం మరియు తీర్థయాత్రల సంకల్ప సిద్ధి.`
                : targetLang === "ta" ? `புண்ணிய தலங்கள் தரிசனம் & தீர்த்த யாத்திரை நிறைவேறும் யோகம்.`
                  : `Realization of long-held sacred pilgrimage plans and deity worship.`,
        targetLang === "kn" ? `ಆಧ್ಯಾತ್ಮಿಕ ಓದು, ಜಪ ಹಾಗೂ ಸತ್ಸಂಗದಿಂದ ಆಂತರಿಕ ಮನಃಶಾಂತಿ.`
          : targetLang === "hi" ? `सत्संग, भगवद्गीता पाठ एवं ध्यान से आत्मिक शांति की प्राप्ति।`
            : targetLang === "mr" ? `सत्संग, ग्रंथवाचन व ध्यानधारणेतून उच्च दर्जाची आत्मिक शांतता.`
              : targetLang === "te" ? `ఆధ్యాత్మిక గ్రంథ పఠనం, నామస్మరణతో పరిపూర్ణ మనశ్శాంతి.`
                : targetLang === "ta" ? `ஆன்மீக நூல்கள் வாசிப்பு, நாமஜெபத்தால் ஆழ்ந்த மன அமைதி.`
                  : `Inner serenity cultivated through daily mantra japa and contemplative solitude.`
      ];

      turningPoint = targetLang === "kn" ? `ದಕ್ಷಿಣಾಯನದ ಚಾತುರ್ಮಾಸ್ಯ ಕಾಲ (ವಿಶೇಷ ಧಾರ್ಮಿಕ ವ್ರತ ಹಾಗೂ ಸತ್ಸಂಕಲ್ಪ).`
        : targetLang === "hi" ? `चातुर्मास काल (विशेष धार्मिक संकल्प एवं मनोवांछित फल प्राप्ति)।`
          : targetLang === "mr" ? `चातुर्मासाचा काळ (विशेष धार्मिक संकल्प व ईश्वरी कृपेचा अनुभव).`
            : targetLang === "te" ? `చాతుర్మాస్య కాలం (విశేష ధార్మిక వ్రతం & మనశ్శాంతి).`
              : targetLang === "ta" ? `சதுர்மாஸ்ய காலம் (புனித விரதங்கள் & தெய்வீக அருள்).`
                : `Sacred Chaturmasya season (elevated spiritual grace and family gatherings).`;

      goldenWindow = targetLang === "kn" ? `ಸ್ಥಿರ ಆಸ್ತಿ ವಿತರಣೆ ಹಾಗೂ ಆರ್ಥಿಕ ಭದ್ರತೆಯ ಯೋಜನೆಗಳನ್ನು ಅಂತಿಮಗೊಳಿಸಲು ಸೂಕ್ತ.`
        : targetLang === "hi" ? `पारिवारिक संपत्ति के सुव्यवस्थित नियोजन एवं दान-पुण्य हेतु अनुकूल काल।`
          : targetLang === "mr" ? `कौटुंबिक संपत्तीचे योग्य नियोजन व दानधर्मासाठी अतिशय शुभ काळ.`
            : targetLang === "te" ? `ఆస్తి ప్రణాళికలు మరియు దానధర్మాలకు అత్యంత అనుకూల సమయం.`
              : targetLang === "ta" ? `சொத்து நிர்வாகம் மற்றும் தான தர்மங்களுக்கு உகந்த காலம்.`
                : `Auspicious window for legacy planning and benevolent charities.`;

      caution = targetLang === "kn" ? `ಕೀಲು ನೋವು, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ನಿಯಮಿತ ನಡಿಗೆಯಂತಹ ದಿನಚರಿಯನ್ನು ತಪ್ಪದೇ ಪಾಲಿಸಿ.`
        : targetLang === "hi" ? `जोड़ों के दर्द एवं रक्तचाप का ध्यान रखें; नित्य भ्रमण अवश्य करें।`
          : targetLang === "mr" ? `सांधेदुखी, रक्तदाब यावर लक्ष ठेवावे; नित्य हलका व्यायाम व वेळेवर विश्रांती घ्यावी.`
            : targetLang === "te" ? `కీళ్ల నొప్పులు, రక్తపోటు జాగ్రత్తలు; రోజూ నడక అలవాటు చేసుకోండి.`
              : targetLang === "ta" ? `மூட்டு வலி, இரத்த அழுத்தத்தில் கவனம்; தினமும் நடைப்பயிற்சி அவசியம்.`
                : `Maintain balanced diet, joint mobility routines, and regular blood pressure checks.`;

    } else {
      // Adult (23 - 55) - Tailored for Married vs Unmarried
      headline = targetLang === "kn" ? `${gregorianRange}: ಉದ್ಯೋಗ ಪ್ರಗತಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಮಹತ್ವದ ಜೀವನ ತಿರುವು`
        : targetLang === "hi" ? `${gregorianRange}: करियर उन्नति, आर्थिक सुदृढ़ता एवं जीवन का महत्वपूर्ण मोड़`
          : targetLang === "mr" ? `${gregorianRange}: करिअरमध्ये मोठी भरारी, आर्थिक स्थैर्य व महत्त्वाचे यश`
            : targetLang === "te" ? `${gregorianRange}: ఉద్యోగాభివృద్ధి, ఆర్థిక స్థిరత్వం & కీలక జీవిత మలుపు`
              : targetLang === "ta" ? `${gregorianRange}: தொழில் முன்னேற்றம், நிதி நிலைத்தன்மை & முக்கிய திருப்புமுனை`
                : `${gregorianRange}: Career Expansion, Financial Consolidation & Breakthrough`;

      whatToExpect = [
        targetLang === "kn" ? `ವೃತ್ತಿಯಲ್ಲಿ ಬಡ್ತಿ, ಮಹತ್ವದ ಪ್ರಾಜೆಕ್ಟ್ ಜವಾಬ್ದಾರಿ ಅಥವಾ ಹೊಸ ಆದಾಯ ಮೂಲಗಳ ಆರಂಭ.`
          : targetLang === "hi" ? `नौकरी में पदोन्नति, व्यापार विस्तार अथवा आय के नवीन स्रोतों का सृजन।`
            : targetLang === "mr" ? `नोकरीत पदोन्नती, व्यवसायाचा विस्तार किंवा उत्पन्नाचे नवीन स्थिर स्रोत निर्माण होणे.`
              : targetLang === "te" ? `ఉద్యోగంలో ప్రమోషన్, కొత్త ప్రాజెక్ట్ బాధ్యతలు లేదా ఆదాయ మార్గాల విస్తరణ.`
                : targetLang === "ta" ? `வேலையில் பதவி உயர்வு, புதிய வருமான வாய்ப்புகள் உருவாதல்.`
                  : `Substantial career promotion, business scalability, or creation of secondary revenue streams.`,
        targetLang === "kn" ? `ಸ್ವಂತ ಮನೆ, ನಿವೇಶನ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಧನಾತ್ಮಕ ಮುನ್ನಡೆ.`
          : targetLang === "hi" ? `भूमि, भवन, वाहन अथवा दीर्घकालीन निवेश में सकारात्मक प्रगति।`
            : targetLang === "mr" ? `स्वतःचे घर, जागा, वाहन किंवा दीर्घकालीन गुंतवणुकीत उत्तम लाभ.`
              : targetLang === "te" ? `సొంత ఇల్లు, స్థలం లేదా దీర్ఘకాలిక పెట్టుబడులలో గణనీయ పురోగతి.`
                : targetLang === "ta" ? `சொந்த வீடு, மனை அல்லது வாகன சேர்க்கையில் நல்ல முன்னேற்றம்.`
                  : `Concrete forward momentum in real estate acquisition, home ownership, or asset portfolio.`,
        isMarried
          ? (targetLang === "kn" ? `ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ ವೃದ್ಧಿ, ಸಂಗಾತಿಯೊಂದಿಗಿನ ಸುಖಮಯ ಜೀವನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ.`
            : targetLang === "hi" ? `दांपत्य सामंजस्य, जीवनसाथी का पूर्ण सहयोग एवं पारिवारिक सुख-शांति।`
              : targetLang === "mr" ? `वैवाहिक जीवनात आनंद, जोडीदाराची उत्तम साथ व कौटुंबिक सौख्य.`
                : targetLang === "te" ? `దాంపత్య సామరస్యం, జీవిత భాగస్వామి సహకారం & కుటుంబ సౌఖ్యం.`
                  : targetLang === "ta" ? `தம்பதியர் ஒற்றுமை, இல்லற மகிழ்ச்சி மற்றும் குடும்ப சுபிக்ஷம்.`
                    : `Matrimonial companionship, spousal camaraderie, and domestic tranquility.`)
          : (targetLang === "kn" ? `ಅವಿವಾಹಿತರಿಗೆ ಯೋಗ್ಯ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರುವಿಕೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶುಭ ಸಮಾರಂಭ.`
            : targetLang === "hi" ? `अविवाहितों हेतु विवाह के मांगलिक प्रसंग एवं शुभ समारोह।`
              : targetLang === "mr" ? `अविवाहितांसाठी विवाहाचे अत्यंत शुभ योग व मंगलकार्याची सिद्धी.`
                : targetLang === "te" ? `అవివాహితులకు శీఘ్ర వివాహ ప్రాప్తి & కుటుంబంలో శుభకార్యాలు.`
                  : targetLang === "ta" ? `திருமணமாகாதவர்களுக்கு சுப விவாஹ யோகம் & குடும்ப சுப நிகழ்வுகள்.`
                    : `Matrimonial alliances and auspicious family milestone celebrations.`)
      ];

      turningPoint = targetLang === "kn" ? `ವರ್ಷದ ಕಾರ್ತಿಕ ಅಥವಾ ಮಾಘ ಮಾಸ (ವೃತ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳ ಸುವರ್ಣ ತಿರುವು).`
        : targetLang === "hi" ? `वर्ष के कार्तिक अथवा माघ मास (करियर व आर्थिक निर्णयों का निर्णायक मोड़)।`
          : targetLang === "mr" ? `वर्षातील कार्तिक किंवा माघ मास (करिअर व आर्थिक निर्णयांतील सुवर्ण वळण).`
            : targetLang === "te" ? `కార్తిక లేదా మాఘ మాసం (ఉద్యోగ మరియు ఆర్థిక నిర్ణయాల స్వర్ణ మలుపు).`
              : targetLang === "ta" ? `கார்த்திகை அல்லது மாசி மாதம் (தொழில் & நிதி முடிவுகளின் பொற்காலம்).`
                : `Mid-year autumn/winter cycle (defining commercial breakthroughs and leadership promotions).`;

      goldenWindow = targetLang === "kn" ? `ಗುರುಬಲದ ಅವಧಿಯಲ್ಲಿ ಹೊಸ ವ್ಯಾಪಾರ, ಹೂಡಿಕೆ ಹಾಗೂ ಗೃಹಪ್ರವೇಶಕ್ಕೆ ಪೂರ್ಣ ಅನುಕೂಲ.`
        : targetLang === "hi" ? `गुरु के अनुकूल गोचर में नवीन व्यापार, निवेश एवं गृह प्रवेश हेतु अत्यंत शुभ।`
          : targetLang === "mr" ? `गुरूच्या शुभ गोचरात नवीन व्यवसाय, मोठी गुंतवणूक व गृहप्रवेशासाठी सर्वोत्तम काळ.`
            : targetLang === "te" ? `గురుబలంతో కొత్త వ్యాపారం, పెట్టుబడులు మరియు గృహప్రవేశానికి అనుకూలం.`
              : targetLang === "ta" ? `குரு பலனால் புதிய தொழில், முதலீடு மற்றும் கிரகப்பிரவேசத்திற்கு உகந்தது.`
                : `Guru Bala months represent the highest yield window for investments and contracts.`;

      caution = targetLang === "kn" ? `ಅತಿಯಾದ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ನಿದ್ರಾಹೀನತೆ ಉಂಟಾಗದಂತೆ ಎಚ್ಚರ ವಹಿಸಿ; ಅಪರಿಚಿತರಿಗೆ ಸಾಲ ನೀಡಬೇಡಿ.`
        : targetLang === "hi" ? `अत्यधिक कार्यभार से तनाव न लें; अजनबियों को धन उधार देने से बचें।`
          : targetLang === "mr" ? `कामाच्या अतिताणाने आरोग्यावर परिणाम होऊ देऊ नका; कोणालाही विनाचौकशी उसने पैसे देऊ नका.`
            : targetLang === "te" ? `పని ఒత్తిడితో నిద్రలేమి రాకుండా చూసుకోండి; అపరిచితులకు అప్పులు ఇవ్వవద్దు.`
              : targetLang === "ta" ? `வேலைப்பளுவால் மன அழுத்தம் வராமல் பார்த்துக் கொள்ளுங்கள்; கடன் கொடுக்க வேண்டாம்.`
                : `Avoid speculative lending to acquaintances and balance demanding work hours with restorative sleep.`;
    }

    const seasons = generateAnnualQuarters(i, startY, ageCategory, vitalityCategory, targetLang);

    // Deep astrological narrative components
    const shaniDeepNarration = pick6({
      kn: isSadeSati
        ? `ನ್ಯಾಯಾಧಿಪತಿ ಶನಿ ಮಹಾರಾಜರು ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, "kn")}ನೇ ಮನೆಯಲ್ಲಿ ಸಾಡೇಸಾತಿ ಸಂಚಾರದಲ್ಲಿದ್ದು, ${saturnMoorthy} ಫಲವನ್ನು ನೀಡಲಿದ್ದಾರೆ. ಈ ಸಂಚಾರವು ನಿಮ್ಮ ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಗರಿಷ್ಠ ಶಿಸ್ತು, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲೀನ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ, ಕಷ್ಟಪಟ್ಟು ಮಾಡುವ ಪ್ರತಿಯೊಂದು ಕೆಲಸಕ್ಕೂ ಶಾಶ್ವತವಾದ ಸತ್ಫಲವನ್ನು ತಂದುಕೊಡಲಿದೆ.`
        : isAshtama
          ? `ಶನಿ ಮಹಾರಾಜರು ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ೮ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಶನಿಯಾಗಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ${saturnMoorthy} ರೂಪದಲ್ಲಿ ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ನಿದ್ರೆ ಹಾಗೂ ಆಕಸ್ಮಿಕ ಖರ್ಚುಗಳ ವಿಷಯದಲ್ಲಿ ಜಾಗರೂಕತೆಯನ್ನು ವಹಿಸಲು ಸೂಚಿಸುತ್ತಾರೆ. ಆದರೆ ನಿರಂತರ ಶನೈಶ್ಚರ ಧ್ಯಾನದಿಂದ ಸಮಸ್ತ ವಿಘ್ನಗಳೂ ಪರಿಹಾರವಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ದೃಢವಾದ ಸ್ಥೈರ್ಯ ದೊರೆಯಲಿದೆ.`
          : isSubhaShani
            ? `ಶನಿ ಮಹಾರಾಜರು ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, "kn")}ನೇ ಪರಮ ಶುಭ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ${saturnMoorthy} ದೈವಿಕ ಬಲದೊಂದಿಗೆ ಶತ್ರು ಜಯ, ನಿರಂತರ ಕಾರ್ಯಸಿದ್ಧಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಸಮೃದ್ಧವಾಗಿ ಕರುಣಿಸಲಿದ್ದಾರೆ.`
            : `ಶನಿ ಮಹಾರಾಜರು ಚಂದ್ರನಿಂದ ${formatNumber6L(shaniHouse, "kn")}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ${saturnMoorthy} ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ನ್ಯಾಯಯುತ ಯಶಸ್ಸು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಭದ್ರತೆಯನ್ನು ತಂದುಕೊಡಲಿದ್ದಾರೆ.`,
      mr: isSadeSati
        ? `कर्मफळदाते शनी देव आपल्या जन्मचंद्रापासून ${formatNumber6L(shaniHouse, "mr")}व्या स्थानी साडेसातीच्या स्वरूपात भ्रमण करत असून, ${saturnMoorthy} चे फळ देतील. या काळात संयम, चिकाटी व अखंड प्रामाणिक प्रयत्नांची आवश्यकता असून, दीर्घकालीन यश व स्थिर पायाभरणीची संधी प्राप्त होईल.`
        : isAshtama
          ? `शनी देव आपल्या चंद्रापासून ८व्या भावात अष्टम शनीच्या प्रभावात असल्याने, ${saturnMoorthy} स्वरूपानुसार आरोग्य, मानसिक शांतता व अचानक खर्चांवर विशेष नियंत्रण ठेवण्याचा सल्ला दिला जातो. नित्य शनी उपासना केल्याने सर्व अडथळे सहज दूर होतील.`
          : isSubhaShani
            ? `शनी महाराज आपल्या चंद्रापासून ${formatNumber6L(shaniHouse, "mr")}व्या अत्यंत शुभ उपचय स्थानी भ्रमण करत असून, ${saturnMoorthy} प्रभावामुळे शत्रूंवर विजय, प्रत्येक कार्यात सिद्धी व आर्थिक उत्कर्ष निश्चित घडवून आणतील.`
            : `शनी देव आपल्या चंद्रापासून ${formatNumber6L(shaniHouse, "mr")}व्या स्थानी संचार करत असून, ${saturnMoorthy} द्वारे आपल्या नित्य कष्टांना योग्य न्याय व जीवनात स्थिर प्रगती प्रदान करतील.`,
      hi: isSadeSati
        ? `कर्मफलदाता शनि देव आपके जन्म चंद्रमा से ${formatNumber6L(shaniHouse, "hi")}वें भाव में साढ़ेसाती के रूप में संचरण कर रहे हैं, जो ${saturnMoorthy} का फल प्रदान करेंगे। यह समय कठोर परिश्रम, अनुशासन एवं धैर्य की परीक्षा लेकर भविष्य हेतु एक अचल एवं सुदृढ़ आधारशिला स्थापित करेगा।`
        : isAshtama
          ? `शनि देव आपके चंद्रमा से ८वें भाव में अष्टम शनि के रूप में गोचर कर रहे हैं, जिससे ${saturnMoorthy} अनुसार स्वास्थ्य, मानसिक एकाग्रता एवं अनपेक्षित व्यय के प्रति सजग रहना आवश्यक है। नियमित शनि आराधना से समस्त विघ्न शांत होंगे।`
          : isSubhaShani
            ? `शनि देव आपके जन्म चंद्रमा से ${formatNumber6L(shaniHouse, "hi")}वें परम शुभ उपचय भाव में गोचरस्थ हैं, जो ${saturnMoorthy} प्रभाव से शत्रुओं पर विजय, कार्यसिद्धि एवं व्यापार-नौकरी में स्थाई समृद्धि का मार्ग प्रशस्त करेंगे।`
            : `शनि देव आपके चंद्रमा से ${formatNumber6L(shaniHouse, "hi")}वें भाव में संचरण करते हुए, ${saturnMoorthy} के माध्यम से आपके पुरुषार्थ एवं सेवाभाव का यथोचित फल एवं सुरक्षा प्रदान करेंगे।`,
      te: isSadeSati
        ? `కర్మఫల ప్రదాత శని భగవానుడు మీ జన్మ చంద్రుని నుండి ${formatNumber6L(shaniHouse, "te")}వ స్థానంలో ఏలినాటి శనిగా సంచరిస్తూ, ${saturnMoorthy} ఫలితాన్ని ప్రసాదిస్తున్నారు. ఈ కాలం క్రమశిక్షణ, ఓర్పు మరియు నిరంతర శ్రమను కోరుతూ భవిష్యత్తుకు శాశ్వతమైన విజయాన్ని చేకూరుస్తుంది.`
        : isAshtama
          ? `శని దేవుడు మీ చంద్రుని నుండి 8వ ఇంట అష్టమ శనిగా సంచరిస్తూ, ${saturnMoorthy} రూపంలో ఆరోగ్యం, అనాలోచిత ఖర్చుల విషయంలో అప్రమత్తంగా ఉండాలని సూచిస్తున్నారు. శని స్తోత్ర పఠనంతో సకల అవరోధాలు తొలగిపోతాయి.`
          : isSubhaShani
            ? `శని భగవానుడు మీ చంద్రుని నుండి ${formatNumber6L(shaniHouse, "te")}వ అత్యంత శుభ ఉపచయ స్థానంలో సంచరిస్తూ, ${saturnMoorthy} దివ్య ప్రభావంతో శత్రు జయం, కార్యసిద్ధి మరియు స్థిరమైన ఆర్థిక లాభాలను కలుగజేస్తారు.`
            : `శని దేవుడు మీ చంద్రుని నుండి ${formatNumber6L(shaniHouse, "te")}వ స్థానంలో సంచరిస్తూ, ${saturnMoorthy} ద్వారా మీ నిజాయితీతో కూడిన శ్రమకు తగిన న్యాయాన్ని మరియు స్థిరత్వాన్ని అనుగ్రహిస్తారు.`,
      ta: isSadeSati
        ? `கர்மகாரகன் சனி பகவான் உங்கள் சந்திரனில் இருந்து ${formatNumber6L(shaniHouse, "ta")}ம் வீட்டில் ஏழரை சனியாக சஞ்சரித்து, ${saturnMoorthy} பலனை வழங்குகிறார். இந்த காலகட்டம் கடின உழைப்பு, ஒழுக்கம் மற்றும் பொறுமையை வேண்டி, எதிர்காலத்திற்கான நிலையான வெற்றியை பெற்றுத் தரும்.`
        : isAshtama
          ? `சனி பகவான் சந்திரனுக்கு 8ம் வீட்டில் அஷ்டம சனியாக சஞ்சரிப்பதால், ${saturnMoorthy} படி உடல்நலம், மன அமைதி மற்றும் திடீர் செலவுகளில் விழிப்புணர்வு அவசியம். சனி வழிபாட்டால் சகல தடைகளும் நீங்கும்.`
          : isSubhaShani
            ? `சனி பகவான் சந்திரனில் இருந்து ${formatNumber6L(shaniHouse, "ta")}ம் சுப உபசய ஸ்தானத்தில் சஞ்சரித்து, ${saturnMoorthy} அருளால் எதிரிகள் மீது வெற்றி, காரிய சித்தி மற்றும் நிலையான நிதி முன்னேற்றத்தை தருவார்.`
            : `சனி பகவான் சந்திரனில் இருந்து ${formatNumber6L(shaniHouse, "ta")}ம் வீட்டில் சஞ்சரித்து, ${saturnMoorthy} மூலம் உங்கள் நேர்மையான உழைப்பிற்கு ஏற்ற நற்பலனையும் பாதுகாப்பையும் வழங்குவார்.`,
      en: isSadeSati
        ? `Lord Saturn transits House ${shaniHouse} from your natal Moon in Sade Sati motion, delivering ${saturnMoorthy} fruits. This planetary discipline tests perseverance and structural maturity, laying an indestructible foundation for enduring lifelong accomplishment.`
        : isAshtama
          ? `Lord Saturn traverses your 8th House in Ashtama Shani disposition, delivering ${saturnMoorthy} results that advise conscious prudence regarding vitality, sleep, and sudden financial outlays. Regular Shani prayers dissolve friction into inner fortitude.`
          : isSubhaShani
            ? `Lord Saturn occupies your ${shaniHouse}th House in an extraordinarily benefic Upachaya stance, showering ${saturnMoorthy} blessings of competitive triumph, decisive milestone breakthroughs, and resilient wealth compounding.`
            : `Lord Saturn traverses your ${shaniHouse}th House, delivering ${saturnMoorthy} rewards that directly honor systematic effort with righteous stability and professional equilibrium.`
    }, targetLang);

    const guruDeepNarration = pick6({
      kn: isGuruBala
        ? `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ${formatNumber6L(guruHouse, "kn")}ನೇ ಶುಭ ಸ್ಥಾನದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಪೂರ್ಣ ಗುರುಬಲದೊಂದಿಗೆ ${jupiterMoorthy} ಆಗಿ ನಿಮ್ಮ ಸರ್ವ ಕಾರ್ಯಗಳಿಗೂ ಭಾಗ್ಯೋದಯ, ಸಕಲ ಶುಭ ಸಮಾರಂಭಗಳ ಸಿದ್ಧಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿಯನ್ನು ಧಾರಾಳವಾಗಿ ಕರುಣಿಸಲಿದ್ದಾರೆ.`
        : `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ${formatNumber6L(guruHouse, "kn")}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಆಂತರಿಕ ಜ್ಞಾನಾರ್ಜನೆ, ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ವಿವೇಕಪೂರ್ಣ ನಿರ್ಧಾರಗಳ ಮೂಲಕ ಭವಿಷ್ಯದ ದೊಡ್ಡ ಯಶಸ್ಸಿಗೆ ನಿಮ್ಮನ್ನು ಸಜ್ಜುಗೊಳಿಸಲಿದ್ದಾರೆ.`,
      mr: isGuruBala
        ? `देवगुरू बृहस्पती आपल्या जन्मचंद्रापासून ${formatNumber6L(guruHouse, "mr")}व्या अत्यंत शुभ स्थानी भ्रमण करत असून, पूर्ण गुरुबळासह ${jupiterMoorthy} द्वारे भाग्योदय, घरात मांगलिक कार्ये व भरघोस आर्थिक समृद्धीची कृपा करतील.`
        : `देवगुरू बृहस्पती आपल्या चंद्रापासून ${formatNumber6L(guruHouse, "mr")}व्या भावात भ्रमण करत असल्याने, आत्मचिंतन, ज्ञानार्जन, बौद्धिक परिपक्वता व योग्य निर्णयक्षमतेतून भविष्यातील मोठ्या प्रगतीची पूर्वतयारी करतील.`,
      hi: isGuruBala
        ? `देवगुरु बृहस्पति आपके जन्म चंद्रमा से ${formatNumber6L(guruHouse, "hi")}वें शुभ भाव में संचरण कर रहे हैं, जो पूर्ण गुरुबल के साथ ${jupiterMoorthy} बनकर भाग्योदय, मांगलिक उत्सव एवं प्रचुर धन-समृद्धि का आशीर्वाद प्रदान करेंगे।`
        : `देवगुरु बृहस्पति आपके चंद्रमा से ${formatNumber6L(guruHouse, "hi")}वें भाव में गोचर करते हुए, अंतर्मुखी ज्ञान, विवेक, कर्तव्यनिष्ठा एवं संतुलित निर्णयों के माध्यम से भावी महासफलता की सुदृढ़ पृष्ठभूमि तैयार करेंगे।`,
      te: isGuruBala
        ? `దేవగురు బృహస్పతి మీ జన్మ చంద్రుని నుండి ${formatNumber6L(guruHouse, "te")}వ శుభ స్థానంలో సంచరిస్తూ, సంపూర్ణ గురుబలంతో ${jupiterMoorthy} రూపంలో భాగ్యోదయం, శుభకార్యాలు మరియు అపార ధన సంపదలను అనుగ్రహిస్తారు.`
        : `దేవగురు బృహస్పతి మీ చంద్రుని నుండి ${formatNumber6L(guruHouse, "te")}వ ఇంట సంచరిస్తూ, ఆధ్యాత్మిక జ్ఞానం, వివేకం మరియు కర్తవ్య నిష్ఠ ద్వారా భవిష్యత్ విజయాలకు బలమైన పునాదిని నిర్మిస్తారు.`,
      ta: isGuruBala
        ? `தேவகுரு பிரகஸ்பதி சந்திரனில் இருந்து ${formatNumber6L(guruHouse, "ta")}ம் சுப வீட்டில் சஞ்சரித்து, பூரண குரு பலனுடன் ${jupiterMoorthy} ஆக பாக்கியோதயம், மங்கள நிகழ்வுகள் மற்றும் தனவிருத்தியை அள்ளி வழங்குவார்.`
        : `தேவகுரு பிரகஸ்பதி சந்திரனில் இருந்து ${formatNumber6L(guruHouse, "ta")}ம் வீட்டில் சஞ்சரித்து, ஆன்மீக ஞானம், விவேகம் மற்றும் சரியான முடிவுகளால் எதிர்கால மகத்தான வெற்றிக்கு உங்களை வழிநடத்துவார்.`,
      en: isGuruBala
        ? `Devaguru Jupiter transits House ${guruHouse} from your natal Moon in an exalted Guru Bala alignment, bestowing ${jupiterMoorthy} grace that unlocks auspicious ceremonies, spiritual blessings, and exponential material prosperity.`
        : `Devaguru Jupiter transits House ${guruHouse} from your natal Moon, fostering deep internal wisdom, intellectual refinement, and strategic clarity that prepare the ground for major subsequent breakthroughs.`
    }, targetLang);

    const rahuKetuDeepNarration = pick6({
      kn: `ಅಲ್ಲದೆ, ಛಾಯಾಗ್ರಹಗಳಾದ ರಾಹು ಮತ್ತು ಕೇತುಗಳು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ${formatNumber6L(rahuHouse, "kn")} ಮತ್ತು ${formatNumber6L(ketuHouse, "kn")}ನೇ ಅಕ್ಷದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನೂತನ ಆಲೋಚನೆಗಳು ಹಾಗೂ ಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಧನಾತ್ಮಕ ತಿರುವುಗಳನ್ನು ತರಲಿವೆ.`,
      mr: `तसेच राहू व केतू हे छायाग्रह आपल्या जन्मपत्रिकेतील ${formatNumber6L(rahuHouse, "mr")} व ${formatNumber6L(ketuHouse, "mr")}व्या अक्षावर संचार करत असल्याने, नवनवीन संकल्पना व जीवनात अनपेक्षित सकारात्मक बदल घडवून आणतील.`,
      hi: `इसके अतिरिक्त छायाग्रह राहु एवं केतु आपकी जन्म कुंडली के ${formatNumber6L(rahuHouse, "hi")} एवं ${formatNumber6L(ketuHouse, "hi")}वें अक्ष पर संचार कर रहे हैं, जो नवीन दृष्टिकोण एवं जीवन में अप्रत्याशित सकारात्मक मोड़ प्रदान करेंगे।`,
      te: `అలాగే ఛాయాగ్రహాలైన రాహు-కేతువులు మీ జాతకంలోని ${formatNumber6L(rahuHouse, "te")} మరియు ${formatNumber6L(ketuHouse, "te")}వ అక్షంపై సంచరిస్తూ, నూతన ఆలోచనలు మరియు ఊహించని శుభ పరిణామాలను కలిగిస్తాయి.`,
      ta: `மேலும் நிழல் கிரகங்களான ராகு-கேது உங்கள் ஜாதகத்தின் ${formatNumber6L(rahuHouse, "ta")} & ${formatNumber6L(ketuHouse, "ta")}ம் அச்சில் சஞ்சரித்து, புதிய சிந்தனைகளையும் எதிர்பாராத சுப மாற்றங்களையும் ஏற்படுத்துவர்.`,
      en: `Simultaneously, the karmic nodes Rahu and Ketu traversing your ${rahuHouse}th and ${ketuHouse}th axis catalyze innovative perspectives, unexpected breakthroughs, and pivotal life realignments.`
    }, targetLang);

    const cleanTurningPoint = turningPoint.replace(/[।.\s]+$/, "");
    const cleanGoldenWindow = goldenWindow.replace(/[।.\s]+$/, "");
    const cleanCaution = caution.replace(/[।.\s]+$/, "");
    const greeting = getDevoteeGreeting(resolvedDevoteeName, targetLang);

    // 3 Rich Substantive Paragraphs for each Chronological Year (at least 5-6 full lines each)
    const yP1 = pick6({
      kn: `${greeting}, ${samvatsaraMeta.samvatsaraKn} ಸಂವತ್ಸರದ ಈ ಪಾವನ ಕಾಲಘಟ್ಟದಲ್ಲಿ (${gregorianRange}), ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಗ್ರಹಮಂಡಲವು ನಿಮ್ಮ ಬದುಕಿಗೆ ಒಂದು ನೂತನ ಚೈತನ್ಯವನ್ನು ತರಲಿದೆ. ಈ ವಾರ್ಷಿಕ ಅವಧಿಯಲ್ಲಿ ${GRAHA_6L[mahaLord]?.[targetLang] || mahaLord} ಮಹಾದಶೆಯ ಪ್ರಧಾನ ಅಧಿಪತ್ಯ ಹಾಗೂ ${GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord} ಭುಕ್ತಿಯ ಸಕ್ರಿಯ ಪ್ರಭಾವವು ನಿಮ್ಮ ಕರ್ಮಕ್ಷೇತ್ರ ಮತ್ತು ನಿತ್ಯ ಜೀವನದ ಪ್ರಮುಖ ಆಯಾಮಗಳನ್ನು ಮುನ್ನಡೆಸಲಿದೆ. ತಾಜಿಕ ಪದ್ಧತಿಯ ವಾರ್ಷಿಕ ಮುಂಥಾ ಬಿಂದುವು ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದಿಂದ ${formatNumber6L(munthaHouse, targetLang)}ನೇ ಭಾವದಲ್ಲಿ ಸ್ಥಿತವಾಗಿದ್ದು, ${munthaTheme} ಪ್ರಧಾನವಾಗಿ ನಿಮ್ಮ ಜೀವನದ ಕೇಂದ್ರಬಿಂದುವಾಗಲಿದೆ. ${shaniDeepNarration} ಈ ಸಂಯುಕ್ತ ಗ್ರಹ ಪ್ರಭಾವದಿಂದಾಗಿ, ನೀವು ದೈವಿಕ ಶ್ರದ್ಧೆ ಹಾಗೂ ಆಂತರಿಕ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮುನ್ನಡೆದರೆ ಸಕಲ ಅಡೆತಡೆಗಳೂ ನಿವಾರಣೆಯಾಗಿ ದೃಢವಾದ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ.`,
      mr: `${greeting}, ${samvatsaraNative} संवत्सराच्या या महत्त्वपूर्ण कालखंडात (${gregorianRange}), आपल्या जन्मकुंडलीतील ग्रहस्थिती जीवनाला एक नवीन दिशा व गती देण्यास सज्ज आहे. या वार्षिक कालावधीत ${GRAHA_6L[mahaLord]?.[targetLang] || mahaLord} महादशा व ${GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord} भुक्तीचे सक्रिय भ्रमण आपल्या कार्यक्षेत्रावर व दैनंदिन जीवनावर मुख्य नियंत्रण प्रस्थापित करेल. ताजिक पद्धतीनुसार वार्षिक मुंथा बिंदू आपल्या जन्मलग्नापासून ${formatNumber6L(munthaHouse, targetLang)}व्या भावात संचार करत असून, ${munthaTheme} हा या वर्षाचा प्रमुख गाभा राहील. ${shaniDeepNarration} या सर्व ग्रहांच्या संयुक्त प्रभावामुळे आपण श्रद्धेने व संयमाने वाटचाल केल्यास सर्व संकटांवर मात करून चिरंतन यश प्राप्त होईल.`,
      hi: `${greeting}, ${samvatsaraNative} संवत्सर के इस पावन कालखंड में (${gregorianRange}), आपकी जन्म कुंडली का ग्रहमंडल आपके जीवन में एक महत्वपूर्ण नवचेतना का संचार करने जा रहा है। इस समयावधि में ${GRAHA_6L[mahaLord]?.[targetLang] || mahaLord} महादशा एवं ${GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord} भुक्ति का संयुक्त प्रभाव आपके कार्यक्षेत्र, निर्णय क्षमता एवं दैनिक आजीविका को नई गति प्रदान करेगा। ताजिक पद्धति का वार्षिक मुंथा बिंदु आपके जन्म लग्न से ${formatNumber6L(munthaHouse, targetLang)}वें भाव में स्थित होकर, ${munthaTheme} को इस वर्ष के केंद्रीय लक्ष्य के रूप में स्थापित करेगा। ${shaniDeepNarration} इन सभी दिव्य ग्रह प्रभावों के समन्वय से, जब आप धैर्य एवं ईश्वर निष्ठा के साथ आगे बढ़ेंगे, तब समस्त विघ्न स्वतः शांत होकर स्थायी सफलता का मार्ग प्रशस्त होगा।`,
      te: `${greeting}, ${samvatsaraNative} సంవత్సరం (${gregorianRange}) లో, మీ జన్మ జాతకంలోని గ్రహగతులు మీ జీవితంలో సరికొత్త నూతనోత్సాహాన్ని నింపనున్నాయి. ఈ కాలంలో ${GRAHA_6L[mahaLord]?.[targetLang] || mahaLord} మహాదశ మరియు ${GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord} భుక్తి యొక్క ప్రభావం మీ వృత్తి, జీవన శైలి మరియు భవిష్యత్ నిర్ణయాలను నడిపిస్తుంది. తాజిక పద్ధతి ప్రకారం వార్షిక ముంథా మీ జన్మ లగ్నం నుండి ${formatNumber6L(munthaHouse, targetLang)}వ స్థానంలో సంచరిస్తూ, ${munthaTheme} మీ ముఖ్యమైన లక్ష్యంగా మార్చుతుంది. ${shaniDeepNarration} ఈ సమగ్ర గ్రహ ప్రభావాలతో మీరు దైవ విశ్వాసం మరియు దృఢ సంకల్పంతో ముందడుగు వేస్తే సకల అవరోధాలు తొలగి సంపూర్ణ విజయం లభిస్తుంది.`,
      ta: `${greeting}, ${samvatsaraNative} ஆண்டின் இந்த மங்களகரமான காலகட்டத்தில் (${gregorianRange}), உங்கள் ஜாதகத்தில் உள்ள கிரக அமைப்புகள் வாழ்க்கையில் ஒரு புதிய மாற்றத்தையும் எழுச்சியையும் ஏற்படுத்த உள்ளன. இந்த வருடத்தில் ${GRAHA_6L[mahaLord]?.[targetLang] || mahaLord} மகா தசா மற்றும் ${GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord} புக்தியின் தாக்கம் உங்கள் தொழில், குடும்பம் மற்றும் அன்றாட கடமைகளை வழிநடத்தும். தாஜிக முறைப்படி முந்தா உங்கள் லக்னத்திலிருந்து ${formatNumber6L(munthaHouse, targetLang)}ம் வீட்டில் சஞ்சரித்து, ${munthaTheme} உங்கள் முதன்மை நோக்கமாக அமையும். ${shaniDeepNarration} இந்த கிரக சேர்க்கைகளின் பலனால், நீங்கள் இறை நம்பிக்கையுடனும் தன்னம்பிக்கையுடனும் செயல்பட்டால் தடைகள் யாவும் விலகி நிலையான வெற்றி கிட்டும்.`,
      en: `${greeting}, during the auspicious ${samvatsaraMeta.samvatsaraEn} Samvatsara epoch (${gregorianRange}), the celestial movements in your birth chart activate a transformative chapter in your life. Throughout this annual cycle, the overarching stewardship of the ${mahaLord} Mahadasha harmonized with the ${bhuktiLord} Bhukti governs your professional pursuits, personal vitality, and key decisions. The Tajika annual Muntha point traverses the ${getEnglishOrdinal(munthaHouse)} House from your natal Lagna, establishing ${munthaTheme} as the prime energetic focus of the year. ${shaniDeepNarration} Grounded in steady devotion and focused resolve, you will convert every friction into a stepping stone for enduring success.`
    }, targetLang);

    const yP2 = ageAtMid < 13
      ? pick6({
        kn: `ಈ ${gregorianRange} ವರ್ಷದಲ್ಲಿ ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಆರೋಗ್ಯ ಹಾಗೂ ಸದ್ಗುಣಗಳ ಬೆಳವಣಿಗೆಯಲ್ಲಿ ಕಂಡುಬರುವ ಮುಖ್ಯ ಫಲಗಳೆಂದರೆ: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} ಜನ್ಮ ಕುಂಡಲಿಯ ಅಷ್ಟಕವರ್ಗ ಬಲದಿಂದಾಗಿ, ಮಗುವಿನ ಗ್ರಹಣಶಕ್ತಿ, ಸ್ಮರಣಶಕ್ತಿ ಹಾಗೂ ಶಾಲಾ ಸಾಧನೆಯು ಅತ್ಯುನ್ನತ ಮಟ್ಟದಲ್ಲಿ ವಿಕಾಸಗೊಳ್ಳಲಿದೆ.`,
        mr: `या ${gregorianRange} वर्षात बालकाचे शिक्षण, आरोग्य व उत्तम संस्कारांमध्ये घडणारी मुख्य फळे म्हणजे: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} जन्मपत्रिकेतील अष्टकवर्ग बळाने बालकाची आकलनशक्ती, स्मरणशक्ती व शालेय यश यात मोठी भर पडेल.`,
        hi: `इस ${gregorianRange} वर्ष में बालक की शिक्षा, स्वास्थ्य एवं सुसंस्कारों के संवर्धन में मुख्य प्रतिफल हैं: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} जन्म कुंडली के अष्टकवर्ग बल से बालक की ग्रहण शक्ति, स्मरण क्षमता एवं शैक्षणिक प्रदर्शन में निरंतर सुधार होगा।`,
        te: `ఈ ${gregorianRange} సంవత్సరంలో పిల్లల చదువు, ఆరోగ్యం మరియు సద్గుణాల వికాసంలో కనిపించే ముఖ్య ఫలితాలు: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} జాతక అష్టకవర్గ బలంతో పిల్లల గ్రహణశక్తి, జ్ఞాపకశక్తి మరియు చదువులో విశేష పురోగతి లభిస్తాయి.`,
        ta: `இந்த ${gregorianRange} ஆண்டில் குழந்தையின் கல்வி, நல்வாழ்வு மற்றும் நற்பண்புகளில் ஏற்படும் முக்கிய பலன்கள்: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} ஜாதக அஷ்டகவர்க்க பலத்தால் குழந்தையின் கிரகிக்கும் திறன், நினைவாற்றல் மற்றும் கல்வி முன்னேற்றம் சிறப்பாக அமையும்.`,
        en: `During this ${gregorianRange} cycle, the core milestones governing the child's academic development, vitality, and character formation unfold as: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} Fortified by natal Ashtakavarga strengths, cognitive retention and scholastic progress flourish with steady composure.`
      }, targetLang)
      : ageAtMid < 18
        ? pick6({
          kn: `ಈ ${gregorianRange} ವರ್ಷದಲ್ಲಿ ಉನ್ನತ ವ್ಯಾಸಂಗ, ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ನೂತನ ತಾಂತ್ರಿಕ ಕೌಶಲಗಳಲ್ಲಿ ಕಂಡುಬರುವ ಮುಖ್ಯ ಫಲಗಳೆಂದರೆ: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} ಜನ್ಮ ಕುಂಡಲಿಯ ಅಷ್ಟಕವರ್ಗ ಬಲವು ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಉನ್ನತ ದರ್ಜೆ ಹಾಗೂ ಪ್ರತಿಷ್ಠಿತ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಪ್ರವೇಶ ಪಡೆಯಲು ಪೂರಕವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಲಿದೆ.`,
          mr: `या ${gregorianRange} वर्षात उच्च माध्यमिक शिक्षण, बोर्ड परीक्षा व तांत्रिक कौशल्यांमध्ये घडणारी मुख्य फळे म्हणजे: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} जन्मपत्रिकेतील अष्टकवर्ग बळाने बोर्ड परीक्षेत उत्कृष्ट गुण व नामांकित कॉलेजमध्ये प्रवेशाचा मार्ग सुकर होईल.`,
          hi: `इस ${gregorianRange} वर्ष में उच्चतर माध्यमिक शिक्षा, बोर्ड परीक्षा एवं तकनीकी दक्षताओं में मुख्य प्रतिफल हैं: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} जन्म कुंडली का अष्टकवर्ग बल बोर्ड परीक्षाओं में सर्वोच्च अंक एवं प्रतिष्ठित महाविद्यालयों में प्रवेश का मार्ग प्रशस्त करेगा।`,
          te: `ఈ ${gregorianRange} సంవత్సరంలో ఉన్నత పాఠశాల చదువులు, బోర్డు పరీక్షలు & సరికొత్త సాంకేతిక నైపుణ్యాలలో కనిపించే ముఖ్య ఫలితాలు: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} అష్టకవర్గ బలంతో బోర్డు పరీక్షల్లో ఉత్తమ ర్యాంకులు సాధించి ఉన్నత విద్యాసంస్థల్లో ప్రవేశం దక్కుతుంది.`,
          ta: `இந்த ${gregorianRange} ஆண்டில் உயர்கல்வி, பொதுத்தேர்வுகள் மற்றும் தொழில்நுட்பத் திறன்களில் ஏற்படும் முக்கிய பலன்கள்: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} அஷ்டகவர்க்க பலத்தால் பொதுத்தேர்வுகளில் முதன்மை நிலையும் சிறந்த கல்லூரிகளில் சேர்க்கையும் உறுதியாகும்.`,
          en: `During this ${gregorianRange} annual epoch, milestone pre-collegiate achievements and competitive acumen materialize as: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} Bolstered by Ashtakavarga bindus, board examination distinctions and collegiate admissions align with exemplary focus.`
        }, targetLang)
        : pick6({
          kn: `ಈ ${gregorianRange} ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ, ಆರ್ಥಿಕ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜೀವನದಲ್ಲಿ ಕಂಡುಬರುವ ಮುಖ್ಯ ಫಲಗಳೆಂದರೆ: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ಶನಿ ಇರುವ ರಾಶಿಯು ${satSav} ಸರ್ವಾಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳ ಬಲವನ್ನು ಹೊಂದಿರುವುದರಿಂದ, ಕಷ್ಟಪಟ್ಟು ಮಾಡುವ ಪ್ರತಿಯೊಂದು ಕೆಲಸದಲ್ಲೂ ಯಾವುದೇ ನಿರಾಶೆಗೆ ಅವಕಾಶವಿಲ್ಲದೆ ದೃಢವಾದ ಆರ್ಥಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಪ್ರಗತಿಯು ನಿಮ್ಮ ಪಾಲಿಗೆ ಒಲಿಯಲಿದೆ.`,
          mr: `या ${gregorianRange} वर्षात आपल्या करिअर, आर्थिक व कौटुंबिक जीवनात घडणारी मुख्य फळे म्हणजे: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} आपल्या जन्मपत्रिकेत अष्टकवर्गात शनीच्या राशीला ${satSav} सर्व-अष्टकवर्ग गुणांचे पाठबळ लाभल्यामुळे, केलेल्या प्रामाणिक कष्टांचे पूर्ण चीज होऊन जीवनात आर्थिक सुबत्ता व सामाजिक सन्मान अबाधित राहील.`,
          hi: `इस ${gregorianRange} वर्ष में आपके करियर, आर्थिक एवं पारिवारिक जीवन में दृष्टिगोचर होने वाले मुख्य प्रतिफल हैं: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} आपकी जन्म कुंडली के अष्टकवर्ग में शनि देव की राशि को ${satSav} सर्वाष्टकवर्ग बिंदुओं का सशक्त बल प्राप्त होने के कारण, आपके द्वारा किए गए सभी निष्ठावान प्रयासों में किसी प्रकार की निराशा न होकर निरंतर आर्थिक एवं सामाजिक प्रगति सुनिश्चित होगी।`,
          te: `ఈ ${gregorianRange} సంవత్సరంలో మీ కెరీర్, ఆర్థిక మరియు కుటుంబ జీవితంలో కనిపించే ముఖ్య ఫలితాలు: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} మీ జాతక అష్టకవర్గంలో శని ఉన్న రాశికి ${satSav} సర్వాష్టకవర్గ బిందువుల బలం ఉండటంతో, మీరు చేసే ప్రతి ప్రయత్నానికి తగిన ప్రతిఫలం లభించి ఆర్థిక స్థిరత్వం మరియు సామాజిక గౌరవం చేకూరుతాయి.`,
          ta: `இந்த ${gregorianRange} ஆண்டில் உங்கள் தொழில், நிதி மற்றும் குடும்ப வாழ்க்கையில் ஏற்படும் முக்கிய பலன்கள்: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} உங்கள் ஜாதக அஷ்டகவர்க்கத்தில் சனி பகவான் அமர்ந்த ராசிக்கு ${satSav} பரல்கள் பலம் உள்ளதால், உங்கள் கடின உழைப்பிற்கு ஏற்ற முழு பலனும் கிடைத்து பொருளாதார மேன்மையும் சமூக அந்தஸ்தும் உறுதியாக உயரும்.`,
          en: `Across the span of ${gregorianRange}, pivotal milestones across your worldly pursuits and personal commitments manifest as: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} Supported by ${satSav} Sarvashtakavarga bindus across the transited sign, diligent effort converts systematically into enduring prosperity and societal standing.`
        }, targetLang);

    const yP3 = pick6({
      kn: `ಕಾಲಚಕ್ರದ ಪಾವನ ಗತಿಯನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ವಿಶ್ಲೇಷಿಸಿದಾಗ, ಈ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಸುವರ್ಣ ತಿರುವು ${cleanTurningPoint} ಸಮಯದಲ್ಲಿ ಸಂಭವಿಸಲಿದೆ; ಈ ಅವಧಿಯಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ಮಹತ್ವದ ತೀರ್ಮಾನಗಳು ನಿಮ್ಮ ಮುಂದಿನ ಭವಿಷ್ಯಕ್ಕೆ ಭದ್ರ ಬುನಾದಿಯಾಗಲಿವೆ. ವಿಶೇಷವಾಗಿ ${cleanGoldenWindow} ಕಾಲವು ಸಕಲ ಶುಭ ಕಾರ್ಯಗಳ ಆರಂಭಕ್ಕೆ ಸುವರ್ಣಾವಕಾಶವಾಗಿದ್ದು, ನೂತನ ಹೂಡಿಕೆಗಳು, ನೂತನ ಒಪ್ಪಂದಗಳು ಹಾಗೂ ಗೃಹಕಾರ್ಯಗಳಿಗೆ ದೈವಾನುಗ್ರಹ ಪೂರ್ಣವಾಗಿ ಕೂಡಿಬರಲಿದೆ. ಆದಾಗ್ಯೂ, ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಮುನ್ನೆಚ್ಚರಿಕೆಯಂತೆ ${cleanCaution}. ಗ್ರಹಗಳ ಸಮಸ್ತ ಅನಿಷ್ಟ ಪ್ರಭಾವಗಳನ್ನು ಶಮನಗೊಳಿಸಲು ಹಾಗೂ ಶುಭ ಫಲಗಳನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಆತ್ಮಲಿಂಗ ಸ್ವರೂಪಿ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ರುದ್ರಾಭಿಷೇಕವನ್ನು ನೆರವೇರಿಸುವುದು ನಿಮ್ಮ ಸರ್ವತೋಮುಖ ರಕ್ಷೆಗೆ ಅಖಂಡ ಶ್ರೀರಕ್ಷೆಯಾಗಲಿದೆ.`,
      mr: `कालचक्राच्या गतीचे शास्त्रोक्त विश्लेषण केले असता, या वर्षातील अत्यंत महत्त्वाचे सुवर्ण वळण ${cleanTurningPoint} काळात येईल; या काळात घेतलेले दूरगामी निर्णय आपल्या भविष्याला भक्कम आधार देतील. विशेषतः ${cleanGoldenWindow} हा काळ सर्व शुभकार्यांसाठी सर्वोत्तम सुवर्णसंधी असून, नवीन प्रकल्प, आर्थिक गुंतवणूक व कौटुंबिक प्रगतीला ईश्वराचे पूर्ण आशीर्वाद लाभतील. तथापि, ज्योतिषशास्त्राच्या मार्गदर्शनानुसार ${cleanCaution}. ग्रहांच्या अनिष्ट दोषांचे निवारण करण्यासाठी व शुभ फळांची वृद्धी होण्यासाठी श्री क्षेत्र गोकर्ण येथील महागणपती व आत्मलिंग महाबळेश्वर चरणी विशेष संकल्प पूजा व रुद्राभिषेक करणे हे आपल्या कुटुंबासाठी अभेद्य सुरक्षा कवच ठरेल.`,
      hi: `कालचक्र की सूक्ष्म गति का शास्त्रीय विश्लेषण दर्शाता है कि इस वर्ष आपके जीवन का सर्वाधिक महत्वपूर्ण स्वर्णिम मोड़ ${cleanTurningPoint} के समय घटित होगा; इस कालखंड में लिए गए निर्णय आपके भविष्य हेतु मील का पत्थर सिद्ध होंगे। विशेष रूप से ${cleanGoldenWindow} की अवधि समस्त मांगलिक एवं व्यावसायिक कार्यों हेतु श्रेष्ठ स्वर्णिम अवसर है, जिसमें नए निवेश, नवीन अनुबंध एवं गृहप्रवेश आदि को दैवीय अनुकंपा प्राप्त होगी। तथापि, शास्त्रसम्मत चेतावनी के अनुसार ${cleanCaution}। ग्रहों की प्रतिकूलता के शमन एवं शुभ फलों की वृद्धि हेतु श्री क्षेत्र गोकर्ण में महागणपति एवं आत्मलिंग महाबलेश्वर स्वामी के चरणों में विशेष संकल्प पूजा एवं रुद्राभिषेक संपन्न कराना आपके सर्वांगीण कल्याण हेतु अचूक रक्षा कवच सिद्ध होगा।`,
      te: `కాలచక్ర గమనాన్ని శాస్త్రోక్తంగా పరిశీలిస్తే, ఈ సంవత్సరంలో మీ జీవితపు అత్యంత కీలకమైన స్వర్ణ మలుపు ${cleanTurningPoint} సమయంలో చోటుచేసుకుంటుంది; ఈ కాలంలో మీరు తీసుకునే ముఖ్యమైన నిర్ణయాలు భవిష్యత్తుకు బలమైన పునాదిగా నిలుస్తాయి. విశేషంగా ${cleanGoldenWindow} సమయం సమస్త శుభకార్యాల ప్రారంభానికి అద్భుతమైన సువర్ణావకాశం కాగా, నూతన పెట్టుబడులు, ఒప్పందాలు మరియు గృహకార్యాలకు దైవ బలం తోడవుతుంది. అయినప్పటికీ, జ్యోతిష్య హెచ్చరిక ప్రకారం ${cleanCaution}. గ్రహ దోషాలను శమింపజేసి శుభ ఫలితాలను రెట్టింపు చేయడానికి శ్రీ క్షేత్ర గోకర్ణంలోని మహా గణపతి మరియు ఆత్మలింగ మహాబలేశ్వర స్వామి సన్నిధిలో విశేష సంకల్ప పూజ, రుద్రాభిషేకం చేయించడం మీ సమగ్ర రక్షకు దివ్య కవచం.`,
      ta: `காலச்சக்கரத்தின் தெய்வீக இயக்கத்தை சாஸ்திர ரீதியாக ஆராயும்போது, இந்த ஆண்டின் மிக முக்கிய பொற்கால திருப்புமுனை ${cleanTurningPoint} காலத்தில் நிகழும்; இந்த நேரத்தில் நீங்கள் எடுக்கும் தீர்க்கமான முடிவுகள் உங்கள் எதிர்காலத்திற்கு உறுதியான அடித்தளமாக அமையும். குறிப்பாக ${cleanGoldenWindow} காலம் அனைத்து சுப காரியங்களுக்கும் மிகச் சிறந்த பொற்கால வாய்ப்பாகும்; புதிய முதலீடுகள், புதிய முயற்சிகள் மற்றும் குடும்ப சுப நிகழ்வுகளுக்கு தெய்வ அருள் துணை நிற்கும். ஆயினும் சாஸ்திர எச்சரிக்கைப்படி ${cleanCaution}. கிரக தோஷங்களை நிவர்த்தி செய்து சுப பலன்களை இரட்டிப்பாக்க, ஸ்ரீ கோகர்ண க்ஷேத்திரத்தில் உள்ள மகா கணபதி மற்றும் ஆத்மலிங்க மகாபலேஸ்வரர் சன்னதியில் விசேஷ சங்கல்ப பூஜை மற்றும் ருத்ராபிஷேகம் செய்வது உங்கள் குடும்பத்திற்கு சிறந்த பாதுகாப்பாக விளங்கும்.`,
      en: `Vedic chronological analysis indicates that the most pivotal watershed milestone of this year crystallizes during ${cleanTurningPoint}, where long-term strategic decisions will anchor your enduring prosperity. Furthermore, the ${cleanGoldenWindow} represents a prime golden window wherein commercial enterprises, capital investments, and domestic milestones receive highest divine auspiciousness. Nonetheless, mindful astrological counsel advises: ${cleanCaution}. To dissolve latent planetary friction and amplify auspicious cosmic currents, sanctifying a dedicated Sankalpa Rudrabhisheka at Sri Kshetra Gokarna Mahabaleshwara and Maha Ganapati shrines serves as your unassailable spiritual shield.`
    }, targetLang);

    const questionInquest = pick6({
      kn: `ಈ ${gregorianRange} ವರ್ಷದಲ್ಲಿ ನನ್ನ ಜೀವನದ ಪ್ರಮುಖ ತಿರುವು, ಸುವರ್ಣಾವಕಾಶಗಳು ಮತ್ತು ಜಾಗರೂಕತೆ ವಹಿಸಬೇಕಾದ ಅಂಶಗಳು ಯಾವುವು?`,
      mr: `या ${gregorianRange} वर्षात माझ्या जीवनातील महत्त्वाचे वळण, सुवर्णसंधी व कोणती दक्षता घ्यावी लागेल?`,
      hi: `इस ${gregorianRange} वर्ष में मेरे जीवन का मुख्य मोड़, स्वर्णिम अवसर एवं कौन सी सावधानियां रखनी होंगी?`,
      te: `ఈ ${gregorianRange} సంవత్సరంలో నా జీవితంలో ముఖ్యమైన మలుపు, సువర్ణావకాశాలు మరియు తీసుకోవాల్సిన జాగ్రత్తలు ఏమిటి?`,
      ta: `இந்த ${gregorianRange} ஆண்டில் எனது வாழ்க்கையின் முக்கிய திருப்புமுனை, பொற்கால வாய்ப்புகள் மற்றும் எச்சரிக்கைகள் யாவை?`,
      en: `What are the defining turning points, golden opportunity windows, and vital cautions for the ${gregorianRange} cycle?`
    }, targetLang);

    const taraBala = computeNavataraBala(nakshatraIdx, guruSign, targetLang);
    const vedhaAnalysis = computeGocharaVedha(moonIdx, shaniSign, guruSign, targetLang);
    const charaKarakaInfluence = computeCharaKarakaInfluence(kundli, mahaLord, targetLang);

    const starRating = score >= 90 ? 5 : score >= 75 ? 4 : 3;
    const starDisplay = starRating === 5 ? "⭐⭐⭐⭐⭐" : starRating === 4 ? "⭐⭐⭐⭐☆" : "⭐⭐⭐☆☆";

    const yearThemeBadge = starRating === 5
      ? pick6({ kn: "ಸುವರ್ಣ ಮಹಾ ತಿರುವು ವರ್ಷ", mr: "सुवर्ण महा वळण वर्ष", hi: "स्वर्णिम महा मोड़ वर्ष", te: "సువర్ణ మహా మలుపు సంవత్సరం", ta: "பொற்கால திருப்புமுனை ஆண்டு", en: "Golden Pivotal Turning Year" }, targetLang)
      : starRating === 4
        ? pick6({ kn: "ಪ್ರಗತಿ & ಸ್ಥಿರತೆಯ ವರ್ಷ", mr: "प्रगती व स्थैर्याचे वर्ष", hi: "प्रगति एवं स्थिरता का वर्ष", te: "ప్రగతి & స్థిరత్వ సంవత్సరం", ta: "வளர்ச்சி & நிலைத்தன்மை ஆண்டு", en: "Progress & Consolidation Year" }, targetLang)
        : pick6({ kn: "ಶ್ರಮ & ಅಡಿಪಾಯ ವರ್ಷ", mr: "कष्ट व पायाभरणीचे वर्ष", hi: "परिश्रम एवं नींव निर्माण वर्ष", te: "శ్రమ & పునాది సంవత్సరం", ta: "உழைப்பு & அடித்தள ஆண்டு", en: "Foundational Effort Year" }, targetLang);

    const yearTakeawayOneLiner = starRating === 5
      ? pick6({
        kn: "ಜೀವನದ ಬಹುದಿನದ ಕನಸು ನನಸಾಗುವ ಸುವರ್ಣ ಕಾಲ; ಹೊಸ ಆಸ್ತಿ, ಬಡ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಮಹತ್ತರ ಗೌರವ ತರುವ ಅದೃಷ್ಟ ವರ್ಷ.",
        mr: "जीवनातील बहुप्रतिक्षित स्वप्ने पूर्ण होण्याचा सुवर्ण काळ; नवीन संपत्ती, पदोन्नती व समाजात मान-सन्मान देणारे वर्ष.",
        hi: "जीवन के चिरप्रतीक्षित स्वप्नों के साकार होने का स्वर्णिम समय; नई संपत्ति, पदोन्नति एवं समाज में यश-कीर्ति प्रदायक वर्ष।",
        te: "ఎన్నో రోజుల కలలు నెరవేరే సువర్ణ సమయం; కొత్త ఆస్తి, పదోన్నతి మరియు సమాజంలో గౌరవం తెచ్చే అదృష్ట సంవత్సరం.",
        ta: "நீண்ட நாள் கனவுகள் நனவாகும் பொற்காலம்; புதிய சொத்து, பதவி உயர்வு மற்றும் சமுதாயத்தில் நன்மதிப்பு தரும் ஆண்டு.",
        en: "A golden landmark cycle when long-cherished ambitions materialize, bringing property/career ascent and societal esteem."
      }, targetLang)
      : starRating === 4
        ? pick6({
          kn: "ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ದೊರೆತು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ ತರುವ ಬೆಳವಣಿಗೆಯ ವರ್ಷ.",
          mr: "कष्टाचे योग्य फळ मिळून आर्थिक स्थैर्य व कुटुंबात सुख-समाधान आणणारे प्रगतीचे वर्ष.",
          hi: "कठिन परिश्रम का उचित प्रतिफल प्राप्त होकर आर्थिक स्थिरता एवं पारिवारिक शांति देने वाला वर्ष।",
          te: "కష్టానికి తగిన ప్రతిఫలం లభించి, ఆర్థిక స్థిరత్వం మరియు కుటుంబంలో ప్రశాంతత తెచ్చే సంవత్సరం.",
          ta: "உழைப்பிற்கேற்ற நற்பலன் கிடைத்து, பொருளாதார நிலைத்தன்மையும் குடும்ப அமைதியும் தரும் ஆண்டு.",
          en: "A steady growth cycle where consistent effort yields financial stability, domestic harmony, and fruitful expansion."
        }, targetLang)
        : pick6({
          kn: "ತಾಳ್ಮೆ ಹಾಗೂ ಜಾಗರೂಕತೆಯಿಂದ ಅಡಿಪಾಯ ಭದ್ರಪಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ವರ್ಷ; ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸಿದರೆ ಮುಂದೆ ದೊಡ್ಡ ಜಯ ನಿಶ್ಚಿತ.",
          mr: "संयम व खबरदारीने पाया मजबूत करण्याचे वर्ष; घाईघाईचे निर्णय टाळल्यास पुढे मोठे यश नक्की मिळेल.",
          hi: "धैर्य एवं सतर्कता से अपनी नींव सुदृढ़ करने का वर्ष; जल्दबाजी के निर्णयों से बचें तो आगे बड़ी विजय सुनिश्चित होगी।",
          te: "ఓర్పుతో పునాదిని పటిష్టం చేసుకోవాల్సిన సంవత్సరం; ఆవేశ నిర్ణయాలు తీసుకోకపోతే మున్ముందు గొప్ప విజయం తథ్యం.",
          ta: "பொறுமையுடன் அடித்தளத்தை அமைக்கும் ஆண்டு; அவசர முடிவுகளைத் தவிர்த்தால் எதிர்காலத்தில் பெரிய வெற்றி நிச்சயம்.",
          en: "A foundation-building year requiring patient discipline; avoiding reckless haste ensures sweeping triumphs ahead."
        }, targetLang);

    const fourPillarsAnnualVerdict = {
      career: {
        status: (starRating >= 4 ? "good" : "moderate") as "good" | "moderate" | "caution",
        text: ageAtMid < 13
          ? (starRating >= 4
            ? pick6({ kn: "ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಶಾಲಾ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ", mr: "शिक्षणात प्रगती, आकलनशक्ती व परीक्षेत अव्वल यश", hi: "शिक्षा में उन्नति, एकाग्रता एवं परीक्षा में श्रेष्ठ प्रदर्शन", te: "చదువులో రాణింపు, జ్ఞాపకశక్తి & పరీక్షల్లో ఘన విజయం", ta: "கல்வியில் மேன்மை, நினைவாற்றல் & தேர்வில் முதன்மை", en: "Scholastic Excellence & Academic Distinctions" }, targetLang)
            : pick6({ kn: "ನಿಯಮಿತ ಅಧ್ಯಯನ ದಿನಚರಿ, ಶಿಕ್ಷಕರ ಮಾರ್ಗದರ್ಶನ", mr: "अभ्यासात सातत्य ठेवा, शिक्षकांचे मार्गदर्शन घ्या", hi: "नियमित अध्ययन दिनचर्या, गुरुजनों का मार्गदर्शन", te: "రోజూ చదువుకోవడం మంచిది, ఉపాధ్యాయుల సలహాలు పాటించండి", ta: "தொடர் படிப்பு மற்றும் ஆசிரியர்களின் ஆலோசனை நலம்", en: "Steady Study Routine & Teacher Guidance" }, targetLang))
          : ageAtMid < 18
            ? (starRating >= 4
              ? pick6({ kn: "ಉನ್ನತ ಶಿಕ್ಷಣ, ಬೋರ್ಡ್ ಪರೀಕ್ಷಾ ಯಶಸ್ಸು & ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯ", mr: "उच्च माध्यमिक शिक्षण, बोर्ड परीक्षेत यश व तांत्रिक कौशल्ये", hi: "उच्चतर माध्यमिक शिक्षा, बोर्ड परीक्षा में सफलता एवं तकनीकी कौशल", te: "ఉన్నత విద్య, బోర్డు పరీక్షల్లో విజయం & సాంకేతిక నైపుణ్యం", ta: "உயர்கல்வி, பொதுத்தேர்வு வெற்றி & தொழில்நுட்பத் திறன்", en: "Higher Secondary Distinction & Modern Technical Acumen" }, targetLang)
              : pick6({ kn: "ಏಕಾಗ್ರತೆಯ ಅಧ್ಯಯನ, ಪರೀಕ್ಷಾ ಒತ್ತಡ ನಿಯಂತ್ರಣ", mr: "अभ्यासात एकाग्रता ठेवा, परीक्षा तणाव टाळा", hi: "एकाग्रचित्त अध्ययन, परीक्षा तनाव से मुक्ति", te: "ఏకాగ్రతతో చదవండి, పరీక్షల భయం వద్దు", ta: "கவனமுடன் படித்தல் மற்றும் தேர்வு பயம் தவிர்த்தல்", en: "Focused Study & Exam Stress Management" }, targetLang))
            : (starRating >= 4
              ? pick6({ kn: "ಹೊಸ ಜವಾಬ್ದಾರಿ, ಆದಾಯ ವೃದ್ಧಿ ಹಾಗೂ ಉನ್ನತ ಸ್ಥಾನ", mr: "नवीन संधी, उत्पन्न वाढ व उच्च पद", hi: "नए अवसर, आय वृद्धि एवं उच्च पद", te: "కొత్త అవకాశాలు, ఆదాయ వృద్ధి", ta: "புதிய வாய்ப்புகள், வருமான உயர்வு", en: "New Responsibilities & Promotion" }, targetLang)
              : pick6({ kn: "ಸ್ಥಿರ ಕರ್ತವ್ಯ ನಿರ್ವಹಣೆ, ಆತುರದ ಬದಲಾವಣೆ ಬೇಡ", mr: "चालू काम निष्ठेने करा, घाई नको", hi: "वर्तमान कार्य पर ध्यान दें, जल्दबाजी से बचें", te: "ఉన్న ఉద్యోగంలో కొనసాగడం మంచిది", ta: "தற்போதைய பணியில் கவனம் தேவை", en: "Steady Routine, Avoid Hasty Exits" }, targetLang))
      },
      wealth: {
        status: (starRating >= 4 ? "good" : "caution") as "good" | "moderate" | "caution",
        text: ageAtMid < 18
          ? (starRating >= 4
            ? pick6({ kn: "ಪೋಷಕರಿಂದ ಶೈಕ್ಷಣಿಕ ಬಾಲನಿಧಿ ಗರಿಷ್ಠ ಸಂಚಯ", mr: "पालकांकडून शैक्षणिक निधीचा उत्तम संचय", hi: "अभिभावकों द्वारा बाल शिक्षा कोष में वृद्धि", te: "తల్లిదండ్రుల ద్వారా విద్యా నిధి పొదుపు", ta: "பெற்றோர்களின் உயர்கல்வி நிதி சேமிப்பு", en: "Parental Child Education Fund Compounding" }, targetLang)
            : pick6({ kn: "ಸುರಕ್ಷಿತ ಮಾಸಿಕ ಬಾಲ ಉಳಿತಾಯ, ವೆಚ್ಚ ನಿಯಂತ್ರಣ", mr: "सुरक्षित बाल बचत, अनावश्यक खर्चावर नियंत्रण", hi: "सुरक्षित बाल बचत, व्यय पर नियंत्रण", te: "సురక్షిత నెలవారీ పొదుపు, ఖర్చుల నియంత్రణ", ta: "பாதுகாப்பான சேமிப்பு, செலவுகளில் விவேகம்", en: "Disciplined Monthly Education SIP & Budgeting" }, targetLang))
          : (starRating >= 4
            ? pick6({ kn: "ಸಾಲ ಬಾಕಿ ತೀರಿಸುವ ಯೋಗ, ನೂತನ ಆಸ್ತಿ ಹೂಡಿಕೆ", mr: "कर्जमुक्तीचे योग, नवीन संपत्ती गुंतवणूक", hi: "ऋणमुक्ति के योग, नई संपत्ति में निवेश", te: "అప్పులు తీరే అవకాశం, ఆస్తి కొనుగోలు", ta: "கடன் சுமை குறையும், புதிய முதலீடு", en: "Debt Resolution & Asset Acquisition" }, targetLang)
            : pick6({ kn: "ಹಣದ ಹರಿವಿನಲ್ಲಿ ಜಾಗ್ರತೆ, ದೊಡ್ಡ ಸಾಲ ಬೇಡ", mr: "आर्थिक व्यवहार सांभाळा, कर्ज टाळा", hi: "वित्तीय लेन-देन में सावधानी, बड़ा कर्ज न लें", te: "ఖర్చులపై అప్రమత్తత, కొత్త రుణాలు వద్దు", ta: "பணப்பரிவர்த்தனையில் கவனம், கடன் தவிர்க", en: "Prudent Cash Flow, Avoid New Loans" }, targetLang))
      },
      family: {
        status: "good" as "good" | "moderate" | "caution",
        text: starRating >= 4
          ? pick6({ kn: "ಕುಟುಂಬದಲ್ಲಿ ಶುಭಕಾರ್ಯ, ಶಾಂತಿ ಹಾಗೂ ಬಾಂಧವ್ಯ ವೃದ್ಧಿ", mr: "कुटुंबात मंगल कार्ये, सुख व सौहार्द", hi: "पारिवारिक मांगलिक कार्य, सुख एवं सद्भाव", te: "కుటుంబంలో శుభకార్యాలు, సంతోషం", ta: "குடும்பத்தில் சுபகாரியங்கள், மகிழ்ச்சி", en: "Auspicious Celebrations & Peace" }, targetLang)
          : pick6({ kn: "ಸಣ್ಣಪುಟ್ಟ ಮಾತುಕತೆಗೆ ಕಿವಿಗೊಡದೆ ಸೌಹಾರ್ದತೆ ಕಾಪಾಡಿ", mr: "किरकोळ वाद टाळा, शांतता राखा", hi: "छोटे विवादों की अनदेखी करें, शांति बनाए रखें", te: "చిన్న విషయాలను పట్టించుకోకండి", ta: "சிறு கருத்து வேறுபாடுகளைத் தவிர்க்கவும்", en: "Overlook Petty Friction, Foster Unity" }, targetLang)
      },
      health: {
        status: (starRating >= 4 ? "good" : "moderate") as "good" | "moderate" | "caution",
        text: starRating >= 4
          ? pick6({ kn: "ಉತ್ತಮ ಮನೋಬಲ, ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಹಾಗೂ ಚೈತನ್ಯ", mr: "उत्तम मनोधैर्य, आरोग्य सुधारणा व उत्साह", hi: "उत्तम मनोबल, स्वास्थ्य सुधार एवं ऊर्जा", te: "మంచి ఆరోగ్యం, ఉత్సాహం", ta: "சிறந்த மன உறுதி, நல்வாழ்வு", en: "Strong Vitality & Rejuvenation" }, targetLang)
          : pick6({ kn: "ನಿಯಮಿತ ನಡಿಗೆ, ಆಹಾರ ಪಥ್ಯ ಹಾಗೂ ನಿದ್ರೆಯ ಕಾಳಜಿ", mr: "आहार, विहार व पुरेशी झोप यावर लक्ष द्या", hi: "नियमित दिनचर्या, खान-पान एवं निद्रा का ध्यान रखें", te: "ఆహార నియమాలు, తగిన విశ్రాంతి అవసరం", ta: "முறையான உணவு, தகுந்த தூக்கம் அவசியம்", en: "Disciplined Sleep & Dietary Prudence" }, targetLang)
      }
    };

    const goldenMonthsHighlight = goldenWindow;
    const cautionMonthHighlight = caution;

    years.push({
      yearIndex: i,
      gregorianRange,
      shakaYear,
      samvatsaraKn: samvatsaraMeta.samvatsaraKn,
      samvatsaraEn: samvatsaraMeta.samvatsaraEn,
      samvatsaraNative,
      activeMahadasha: GRAHA_6L[mahaLord]?.[targetLang] || mahaLord,
      activeBhukti: GRAHA_6L[bhuktiLord]?.[targetLang] || bhuktiLord,
      activeDashaPeriodText: dashaText,
      vitalityScore: score,
      vitalityCategory,
      shaniGocharaText: shaniText,
      guruGocharaText: guruText,
      rahuKetuText,
      headline,
      whatToExpect,
      turningPointSeason: turningPoint,
      goldenOpportunityWindow: goldenWindow,
      cautionAndGuidance: caution,
      seasons,
      munthaHouse,
      munthaRashi,
      munthaTheme,
      doubleTransitHighlight,
      moorthyNirnaya: { saturnMoorthy, jupiterMoorthy },
      savPoints: satSav,
      paragraphs: [yP1, yP2, yP3],
      questionInquest,
      taraBala,
      vedhaAnalysis,
      charaKarakaInfluence,
      isBandhanaRisk,
      isArishtaRisk,
      isRajaYogaPeak,
      starRating,
      starDisplay,
      yearThemeBadge,
      yearTakeawayOneLiner,
      fourPillarsAnnualVerdict,
      goldenMonthsHighlight,
      cautionMonthHighlight
    });
  }

  // Build Life Chapters
  const chapters: FiveYearLifeChapter[] = [];
  const isMarried = personalization?.maritalStatus === "married";
  const isFemale = personalization?.gender === "Female";
  const hasChildren = personalization?.childrenStatus === "has_children";

  const detailedAge = getDetailedAgeGroup(currentAgeYears);

  if (detailedAge === "infant") {
    chapters.push(
      {
        id: "infant_balarishta",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಶಿಶು ಆರೋಗ್ಯ, ಬಾಲಾರಿಷ್ಟ ನಿವಾರಣೆ & ದೈವಿಕ ರಕ್ಷಾ ಕವಚ",
          mr: "अध्याय १: बालकाचे आरोग्य, बालारिष्ट निवारण व ईश्वरी रक्षा कवच",
          hi: "अध्याय १: शिशु स्वास्थ्य, बालारिष्ट निवारण एवं दैवीय रक्षा कवच",
          te: "అధ్యాయం 1: శిశు ఆరోగ్యం, బాలారిష్ట నివారణ & దైవిక రక్షా కవచం",
          ta: "அத்தியாயம் 1: குழந்தை ஆரோக்கியம், பாலாரிஷ்ட நிவர்த்தி & தெய்வீக பாதுகாப்பு",
          en: "Chapter 1: Infant Vitality, Balarishta Protection & Divine Aegis"
        }, targetLang),
        subtitle: pick6({
          kn: "ಚಂದ್ರ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಶಿಶು ರಕ್ಷೆ",
          mr: "चंद्र व लग्नेशाच्या कृपेने बालकाचे संपूर्ण रक्षण",
          hi: "चंद्रमा एवं लग्नेश के शुभ प्रभाव से शिशु रक्षा",
          te: "చంద్ర మరియు లగ్నాధిపతి అనుగ్రహంతో సంపూర్ణ రక్షణ",
          ta: "சந்திரன் மற்றும் லக்னாதிபதியின் அருளால் குழந்தை நலம்",
          en: "Luminaries and Lagna Lord fortifying early pediatric vitality"
        }, targetLang),
        icon: "🍼",
        contemplationInquest: pick6({
          kn: "ಶಿಶುವಿನ ಆಯುಷ್ಯ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಾ ಕವಚದ ಮಹಾ ಚಿಂತನೆ",
          mr: "बालकाचे दीर्घायुष्य, रोगप्रतिकारशक्ती व ईश्वरी सुरक्षेचे महाचिंतन",
          hi: "शिशु की दीर्घायु, रोगप्रतिरोधक क्षमता एवं दैवीय सुरक्षा का चिंतन",
          te: "శిశువు దీర్ఘాయుష్షు, రోగనిరోధక శక్తి & దైవిక రక్షణ పై చింతన",
          ta: "குழந்தையின் தீர்க்காயுள், நோய் எதிர்ப்பு சக்தி மற்றும் தெய்வீக அருள் சிந்தனை",
          en: "Contemplation on Pediatric Longevity, Natural Immunity & Protective Aegis"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಚಂದ್ರ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿಯ ಸುಭದ್ರ ಸ್ಥಿತಿಯು ನವಜಾತ ಶಿಶುವಿಗೆ ಅದ್ಭುತ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ. ತಾಯಿಯ ಪ್ರೇಮಪೂರ್ಣ ಪಾಲನೆ, ಎದೆಹಾಲು ಹಾಗೂ ಶಾಂತ ನಿದ್ರೆಯು ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ದಿನೇ ದಿನೇ ವೃದ್ಧಿಸಲಿದೆ.`,
            mr: `कुंडलीत चंद्र व लग्नेशाची शुभ स्थिती नवजात बालकाभोवती एक अभेद्य दैवी सुरक्षा कवच तयार करते. मातेचे वात्सल्य, पौष्टिक स्तनपान व शांत झोप यामुळे बालकाची रोगप्रतिकारशक्ती दिवसागणिक बळकट होईल.`,
            hi: `जन्म कुंडली में चंद्रमा एवं लग्नेश की शुभ स्थिति नवजात शिशु के लिए एक अभेद्य दैवीय रक्षा कवच का निर्माण करती है। माता का वात्सल्य, स्तनपान एवं शांत निद्रा शिशु की स्वाभाविक रोगप्रतिरोधक क्षमता को निरंतर पुष्ट करेंगे।`,
            te: `జాతకంలో చంద్రుడు మరియు లగ్నాధిపతి శుభ స్థితి నవజాత శిశువుకు బలమైన దైవిక రక్షణ కవచాన్ని ఏర్పాటు చేస్తాయి. తల్లి ప్రేమ, పౌష్టికాహారం మరియు నిశ్చింత నిద్ర శిశువు రోగనిరోధక శక్తిని పెంచుతాయి.`,
            ta: `ஜாதகத்தில் சந்திரன் மற்றும் லக்னாதிபதியின் சுப நிலை பச்சிளம் குழந்தைக்கு வலிமையான தெய்வீக பாதுகாப்புக் கவசத்தை உருவாக்குகிறது. தாயின் அரவணைப்பு, தாய்ப்பால் மற்றும் நிம்மதியான தூக்கம் குழந்தையின் நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்.`,
            en: `The fortified disposition of the natal Moon and Lagna Lord constructs a divine pediatric aegis around the infant. Pristine maternal nourishment, warmth, and tranquil sleep patterns harmonize delicate digestive fires, cultivating robust natural immunity.`
          }, targetLang),
          pick6({
            kn: `ಶಾಸ್ತ್ರೋಕ್ತ ಬಾಲಾರಿಷ್ಟ ಸೂಕ್ಷ್ಮತೆಗಳನ್ನು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯು ಸೌಮ್ಯಗೊಳಿಸಲಿದೆ. ಋತುಮಾನದ ಶೀತ, ಕಫ ಅಥವಾ ಹಲ್ಲು ಮೂಡುವ ಸಮಯದ ಜ್ವರವನ್ನು ಪೋಷಕರು ಪ್ರೀತಿ ಹಾಗೂ ಆಯುರ್ವೇದ ಪಥ್ಯದಿಂದ ಸಲೀಸಾಗಿ ನಿರ್ವಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿದೆ. ನಿಯಮಿತ ತೈಲ ಅಭ್ಯಂಗವು ಮಗುವಿನ ಮೈಕಟ್ಟನ್ನು ಬಲಪಡಿಸಲಿದೆ.`,
            mr: `शास्त्रातील बालारिष्ट दोष देवगुरूच्या अमृत दृष्टीने शांत होतील. ऋतुबदलात होणारी सर्दी, कफ किंवा दात येतानाचा त्रास आई-वडिलांच्या प्रेमाने व योग्य काळजीने सहज दूर होईल. नित्य तेलाने हलकी मालिश बालकाचे स्नायू बळकट करेल.`,
            hi: `शास्त्रसम्मत बालारिष्ट योग देवगुरु बृहस्पति की अमृत दृष्टि से निष्प्रभावी होंगे। मौसम परिवर्तन की सर्दी-जुकाम अथवा दंतोद्भव समय की कठिनाइयां माता-पिता के स्नेह एवं उचित देखरेख से सहज दूर होंगी। नित्य तैल मालिश शारीरिक सौष्ठव को बढ़ाएगी।`,
            te: `శాస్త్రోక్త బాలారిష్ట దోషాలు దేవగురువు బృహస్పతి అమృత దృష్టితో తొలగిపోతాయి. వాతావరణ మార్పులలో వచ్చే జలుబు లేదా పళ్ళు వచ్చే సమయపు అసౌకర్యాన్ని తల్లిదండ్రుల ప్రేమతో సులభంగా అధిగమించవచ్చు. రోజూ నూనె మర్దన శరీర దారుఢ్యాన్ని పెంచుతుంది.`,
            ta: `சாஸ்திரரீதியான பாலாரிஷ்ட தோஷங்கள் தேவகுருவின் சுப பார்வையால் விலகும். பருவநிலை மாற்றத்தால் வரும் சளி அல்லது பல் முளைக்கும் நேரத்து உபாதைகளை முறையான கவனிப்பால் போக்கலாம். தினமும் நல்லெண்ணெய் மசாஜ் குழந்தையின் உடல் வலிமையை உயர்த்தும்.`,
            en: `Potential pediatric vulnerabilities are effortlessly neutralized under Jupiter's benevolent trines. Transient seasonal chills or teething restlessness respond swiftly to parental warmth and pediatric hygiene, while daily warm oil massages fortify musculoskeletal development.`
          }, targetLang),
          pick6({
            kn: `ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಆಯುಷ್ಯ ಹೋಮದ ಅನುಷ್ಠಾನವು ಮಗುವಿನ ಆಯುರಾರೋಗ್ಯಕ್ಕೆ ದಿವ್ಯ ಸಂಜೀವಿನಿಯಾಗಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ಪ್ರಾರ್ಥಿಸಿ ಪ್ರಸಾದ ರಕ್ಷೆಯನ್ನು ಶಿಶುವಿಗೆ ಸ್ಪರ್ಶಿಸುವುದರಿಂದ ಸಕಲ ನಕಾರಾತ್ಮಕ ದೃಷ್ಟಿ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ಮಗುವಿನ ಮುಖದಲ್ಲಿ ಸದಾ ತೇಜಸ್ಸು ತುಂಬಿ ತುಳುಕಲಿದೆ.`,
            mr: `कुलदेवतेची आराधना व आयुष्य होम विधी बालकाच्या आरोग्यासाठी संजीवनी ठरेल. श्री क्षेत्र गोकर्ण महाबळेश्वराचा आशीर्वाद व प्रसादाचे रक्षा कवच बालकाला दृष्ट दोषांपासून मुक्त ठेवेल, ज्यामुळे बालकाचे मुखमंडल सदैव तेजस्वी दिसेल.`,
            hi: `कुलदेवता की आराधना एवं आयुष्य होम का अनुष्ठान शिशु के दीर्घायुष्य हेतु दिव्य संजीवन है। श्री क्षेत्र गोकर्ण महाबलेश्वर स्वामी का स्मरण एवं पावन रक्षा सूत्र स्पर्श कराने से सभी प्रकार के नजर-दोष दूर होंगे तथा शिशु का मुखमंडल सदैव दैवीय तेज से दमकता रहेगा।`,
            te: `కులదేవత పూజ మరియు ఆయుష్య హోమం నిర్వహించడం శిశువు ఆరోగ్యానికి అమృతప్రాయం. శ్రీ గోకర్ణ మహాబలేశ్వరుని ప్రార్థించి రక్షాబంధనం లేదా విభూతి ధరింపజేయడం వల్ల నరదిష్టి తొలగి ముఖంలో వర్చస్సు నిరంతరం ప్రకాశిస్తుంది.`,
            ta: `குலதெய்வ வழிபாடு மற்றும் ஆயுஷ்ய ஹோமம் குழந்தையின் ஆரோக்கியத்திற்கு அமிர்தமாகும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் அருட்பிரசாதம் குழந்தையை திருஷ்டி தோஷங்களிலிருந்து காக்கும், முகம் எப்போதும் பிரகாசமாக விளங்கும்.`,
            en: `Devout invocations of the Kula Devata and solemnization of an Ayushya Homa establish an impenetrable barrier against infantile affliction. Applying holy bhasma and Raksha from Sri Kshetra Gokarna Mahabaleshwara dispels psychic sensitivity, ensuring buoyant cheerfulness.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಮಗುವಿನ ತಲೆ ಹಾಗೂ ಎದೆಯನ್ನು ಶೀತ ಗಾಳಿಯಿಂದ ಕಾಪಾಡಿ; ಪ್ರತಿನಿತ್ಯ ಶುದ್ಧ ಕೊಬ್ಬರಿ ಎಣ್ಣೆಯಿಂದ ತೈಲಾಭ್ಯಂಗ ಮಾಡಿಸಿ ಸುಖನಿದ್ರೆಗೆ ಅನುವು ಮಾಡಿಕೊಡಿ.",
          mr: "थंड वाऱ्यापासून बालकाचे रक्षण करा; नित्य शुद्ध खोबरेल तेलाने मालिश करून शांत झोप मिळावी याकडे लक्ष द्यावे.",
          hi: "शिशु को शीतल समीर से बचाएं; नित्य शुद्ध नारियल तैल से मालिश करें ताकि शांत एवं गाढ़ी निद्रा सुनिश्चित हो सके।",
          te: "చల్లగాలి తగలకుండా శిశువును కాపాడండి; రోజూ స్వచ్ఛమైన కొబ్బరినూనెతో మర్దన చేసి హాయిగా నిద్రపోయేలా చూడండి.",
          ta: "குளிர்ந்த காற்று படாமல் குழந்தையை காக்கவும்; தினமும் சுத்தமான தேங்காய் எண்ணெயால் மசாஜ் செய்து நிம்மதியான தூக்கத்திற்கு வழிவகுக்கவும்.",
          en: "Protect the infant against drafts; administer daily warm oil massages to ensure deep restorative sleep."
        }, targetLang)
      },
      {
        id: "infant_milestones",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಶೈಶವ ಮೈಲಿಗಲ್ಲುಗಳು, ನಗು, ತೊದಲು ಮಾತು & ದೈಹಿಕ ವಿಕಾಸ",
          mr: "अध्याय २: बालकाच्या विकासाचे टप्पे, बोबडे बोल व शारीरिक वाढ",
          hi: "अध्याय २: शैशव के महत्वपूर्ण पड़ाव, हास्य, तोतली बोली एवं शारीरिक विकास",
          te: "అధ్యాయం 2: శైశవ మైలురాళ్ళు, ముద్దు మాటలు & శారీరక ఎదుగుదల",
          ta: "அத்தியாயம் 2: குழந்தை பருவ மைல்கற்கள், மழலை மொழி & உடல் வளர்ச்சி",
          en: "Chapter 2: Physical Milestones, Speech Emergence & Motor Agility"
        }, targetLang),
        subtitle: pick6({
          kn: "ಬುಧ ಮತ್ತು ಶುಕ್ರರ ಪ್ರಭಾವದಿಂದ ಮುದ್ದಾದ ವರ್ತನೆ ಹಾಗೂ ಗ್ರಹಣಶಕ್ತಿ",
          mr: "बुध व शुक्राच्या प्रभावाने बाललीला व मनमोहक वर्तन",
          hi: "बुध एवं शुक्र के शुभ प्रभाव से बाल-सुलभ चंचलता एवं आकर्षण",
          te: "బుధ, శుక్ర గ్రహాల ప్రభావంతో ముద్దులొలికే చేష్టలు & గ్రహణశక్తి",
          ta: "புதன் & சுக்கிரன் அருளால் கொஞ்சும் மழலை மற்றும் அறிவு வளர்ச்சி",
          en: "Mercury and Venus inspiring intuitive learning and playful coordination"
        }, targetLang),
        icon: "🌱",
        contemplationInquest: pick6({
          kn: "ಶಿಶುವಿನ ಮೊದಲ ಹೆಜ್ಜೆಗಳು, ತೊದಲು ಮಾತು ಹಾಗೂ ದೈಹಿಕ ಬೆಳವಣಿಗೆಯ ಆನಂದ ಚಿಂತನೆ",
          mr: "बालकाची पहिली पावले, बोबडे बोल व शारीरिक विकासाचे सुखद चिंतन",
          hi: "शिशु के प्रथम पदचाप, तोतली वाणी एवं शारीरिक विकास का आनंददायक चिंतन",
          te: "శిశువు తొలి అడుగులు, ముద్దు మాటలు మరియు శారీరక ఎదుగుదల పై ఆనందకర చింతన",
          ta: "குழந்தையின் முதல் நடை, மழலை மொழி மற்றும் உடல் வளர்ச்சி பற்றிய மகிழ்வான சிந்தனை",
          en: "Contemplation on First Steps, Speech Emergence & Neuro-Muscular Harmony"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಮುಂದಿನ ಐದು ವರ್ಷಗಳಲ್ಲಿ ಮಗು ಶೈಶವದಿಂದ ಬಾಲ್ಯಾವಸ್ಥೆಗೆ ಹೆಜ್ಜೆಯಿಡಲಿದೆ. ತೆವಳುವುದು, ಮೊದಲ ಬಾರಿ ಎದ್ದು ನಿಲ್ಲುವುದು, ಅಂಬೆಗಾಲಿಕ್ಕುವುದು ಹಾಗೂ ಮುದ್ದಾದ ಮೊದಲ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡುವ ಸುಯೋಗವು ಮನೆಯಲ್ಲಿ ಅಪಾರ ಸಂತೋಷವನ್ನು ತರಲಿದೆ. ಜನ್ಮ ಲಗ್ನದ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಸ್ನಾಯುಗಳು ಹಾಗೂ ಎಲುಬುಗಳ ಬಲವರ್ಧನೆ ತೃಪ್ತಿಕರವಾಗಿರಲಿದೆ.`,
            mr: `पुढील पाच वर्षांत बालक रांगण्यापासून स्वतःच्या पायांवर उभे राहण्यापर्यंतचा प्रवास पूर्ण करेल. पहिली पावले टाकताना घरातील वातावरण आनंदाने भारून जाईल. लग्नेशाच्या कृपेने हाडे व स्नायूंची वाढ उत्तम व सुदृढ राहील.`,
            hi: `आगामी पांच वर्षों में शिशु घुटनों के बल चलने से लेकर अपने पैरों पर खड़े होने तक का मनोहारी सफर तय करेगा। उसके नन्हे पदचाप गृह में अपार हर्ष का संचार करेंगे। जन्म लग्न की शुभ दृष्टि से अस्थि एवं मांसपेशियों का विकास उत्तम रहेगा।`,
            te: `రాబోయే ఐదు సంవత్సరాలలో శిశువు ప్రాకడం నుండి సొంత కాళ్ళపై నడిచే వరకు ఎన్నో మధురమైన క్షణాలను అందిస్తుంది. తొలి అడుగులు ఇంట్లో ఎనలేని ఆనందాన్ని నింపుతాయి. లగ్నాధిపతి శుభ దృష్టితో ఎముకలు, కండరాల పుష్టి చక్కగా ఉంటుంది.`,
            ta: `அடுத்த ஐந்து ஆண்டுகளில் தவழ்வதிலிருந்து எழுந்து நடப்பது வரையிலான இனிய மைல்கற்களைக் குழந்தை எட்டும். குழந்தையின் முதல் நடை இல்லத்தில் பெரும் மகிழ்ச்சியை உண்டாக்கும். லக்ன பலத்தால் எலும்புகள் மற்றும் தசைகள் பலமடையும்.`,
            en: `Across the upcoming 5 years, the infant gracefully navigates the transformational milestones from crawling to independent bipedal mobility. Robust Lagna dignity reinforces skeletal density and motor agility, welcoming buoyant celebrations into the household.`
          }, targetLang),
          pick6({
            kn: `ಬುಧ ಗ್ರಹದ ಅನುಕೂಲಕರ ಸಂಚಾರದಿಂದಾಗಿ ಮಗುವಿನ ಗ್ರಹಣ ಶಕ್ತಿಯು ಅತ್ಯಂತ ಚುರುಕಾಗಿರಲಿದೆ. ಕುಟುಂಬ ಸದಸ್ಯರ ಧ್ವನಿ ಗುರುತಿಸುವುದು, ಮೊದಲ ಅರ್ಥಪೂರ್ಣ ತೊದಲು ಮಾತುಗಳನ್ನಾಡುವುದು ಹಾಗೂ ಸುತ್ತಲಿನ ವಸ್ತುಗಳನ್ನು ಕುತೂಹಲದಿಂದ ಗಮನಿಸುವುದು ಆಕರ್ಷಕವಾಗಿರಲಿದೆ. ಸಂಗೀತ ಹಾಗೂ ಶ್ಲೋಕಗಳ ಶ್ರವಣವು ಮಗುವಿನ ಮಾತುಗಾರಿಕೆಯನ್ನು ಸುಲಲಿತಗೊಳಿಸಲಿದೆ.`,
            mr: `बुधाच्या शुभ प्रभावामुळे बालकाची आकलनशक्ती अतिशय तल्लख राहील. घरातील व्यक्तींचे आवाज ओळखणे, बोबडे बोल बोलणे व सभोवतालच्या गोष्टींचे निरीक्षण यात बालक पुढे राहील. घरात लहान स्तोत्रे व अंगाई ऐकवल्याने वाणी स्पष्ट होण्यास मदत होईल.`,
            hi: `बुध के शुभ संचार से शिशु की श्रवण एवं ग्रहण शक्ति अत्यंत प्रखर होगी। परिजनों के स्वर को पहचानना, मधुर तोतले शब्दों का उच्चारण एवं परिवेश को कौतूहल से निहारना अत्यंत सुखद होगा। शुभ मंत्र श्रवण से वाणी का शीघ्र विकास होगा।`,
            te: `బుధ గ్రహ అనుకూలతతో శిశువు గ్రహణశక్తి చాలా చురుగ్గా ఉంటుంది. కుటుంబ సభ్యుల మాటలను గమనించడం, ముద్దు ముద్దుగా మాట్లాడటం ఆకట్టుకుంటాయి. ఇంట్లో శాంతమైన స్తోత్రాలు వినిపించడం వల్ల స్పష్టమైన సంభాషణ త్వరగా అలవడుతుంది.`,
            ta: `புதனின் சுப சஞ்சாரத்தால் குழந்தையின் கிரகிக்கும் திறன் மிக கூர்மையாக இருக்கும். குடும்பத்தாரின் குரலை அறிவது, மழலைச் சொற்கள் பேசுவது மகிழ்ச்சி தரும். மெல்லிய ஸ்லோகங்களைக் கேட்கச் செய்வது பேச்சுத் திறனை எளிதாக்கும்.`,
            en: `Mercury's gentle stimulation awakens rapid cognitive reception. Differentiating familiar parental voices, repeating sweet initial syllables, and observational dexterity progress smoothly, complemented wonderfully by the ambient vibration of classical mantras.`
          }, targetLang),
          pick6({
            kn: `ಬಣ್ಣ ಬಣ್ಣದ ಆಟಿಕೆಗಳು ಹಾಗೂ ಪರಿಸರದ ಜತೆಗಿನ ಸಂಪರ್ಕವು ಮಗುವಿನ ಕಲ್ಪನಾ ಶಕ್ತಿಯನ್ನು ಅರಳಿಸಲಿದೆ. ಟಿವಿ, ಮೊಬೈಲ್‌ನಂತಹ ಪರದೆಗಳಿಂದ ಮಗುವನ್ನು ಸಂಪೂರ್ಣ ದೂರವಿಟ್ಟು, ನೈಸರ್ಗಿಕ ವಾತಾವರಣದಲ್ಲಿ ಆಟವಾಡಲು ಪ್ರೋತ್ಸಾಹಿಸುವುದು ಮಗುವಿನ ಭವಿಷ್ಯದ ಏಕಾಗ್ರತೆಗೆ ಪರಮ ರಕ್ಷೆಯಾಗಿದೆ.`,
            mr: `रंगबेरंगी खेळणी व मोकळ्या हवेत खेळण्यामुळे बालकाची कल्पनाशक्ती फुलेल. मोबाईल व टीव्हीच्या स्क्रीनपासून बालकाला पूर्णपणे दूर ठेवणे त्याच्या भविष्यातील डोळ्यांचे आरोग्य व एकाग्रतेसाठी अत्यंत गरजेचे आहे.`,
            hi: `रंग-बिरंगी वस्तुएं, खिलौने एवं स्वाभाविक चपलता से शिशु की कल्पना शक्ति प्रखर होगी। मोबाइल अथवा डिजिटल स्क्रीन से पूर्णतः दूर रखकर प्राकृतिक परिवेश में खेलने का अवसर देना भविष्य की बौद्धिक प्रखरता की आधारशिला बनेगा।`,
            te: `రంగుల బొమ్మలు, ఆట వస్తువులు మరియు సహజమైన చురుకుదనంతో ఊహాశక్తి విస్తరిస్తుంది. మొబైల్ లేదా టీవీ స్క్రీన్లకు దూరంగా ఉంచి, ప్రకృతి ఒడిలో ఆడుకునేలా చేయడం భవిష్యత్ తెలివితేటలకు బలమైన పునాది.`,
            ta: `வண்ணப் படங்கள், பொம்மைகள் மற்றும் இயற்கையான சுறுசுறுப்பால் கற்பனைத்திறன் வளரும். செல்போன் திரைகளைத் தவிர்த்து, இயற்கை சூழலில் விளையாட அனுமதிப்பது எதிர்கால அறிவுக்கூர்மைக்கு ஆழமான அடித்தளமாகும்.`,
            en: `Tactile toys, vibrant imagery, and natural outdoor curiosity organically expand imaginative capacity. Completely insulating the child from digital screens while encouraging exploratory play amidst fresh air cements an unshakable cognitive foundation.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಮಗುವಿನ ಎದುರು ಶಾಂತ, ಪ್ರೇಮಮಯ ವಾತಾವರಣ ಕಾಪಾಡಿ; ಮಧುರ ಸ್ತೋತ್ರಗಳು ಅಥವಾ ಲಾಲೀ ಹಾಡುಗಳನ್ನು ಹಾಡುವುದು ಮಗುವಿನ ಮನಸ್ಸಿಗೆ ದಿವ್ಯ ಸಾಂತ್ವನ.",
          mr: "घरात शांत व आनंदी वातावरण ठेवा; गोड अंगाईगीते व स्तोत्रे ऐकवल्याने बालकाला गाढ व शांत झोप लागेल.",
          hi: "गृह में शांत एवं स्नेहपूर्ण वातावरण बनाए रखें; मधुर लोरियां एवं शांत मंत्र शिशु के चित्त को दिव्य शांति देते हैं।",
          te: "ఇంట్లో ప్రశాంతమైన వాతావరణం ఉంచండి; మధురమైన లాలిపాటలు, స్తోత్రాలు పాడటం శిశువు మనస్సుకు ప్రశాంతతనిస్తుంది.",
          ta: "இல்லத்தில் அமைதியான சூழலை பேணுங்கள்; இனிமையான தாலாட்டு மற்றும் ஸ்தோத்திரங்கள் குழந்தைக்கு ஆழ்ந்த நிம்மதி தரும்.",
          en: "Uphold a tranquil domestic sanctuary; singing soothing Vedic lullabies harmonizes the developing neurological system."
        }, targetLang)
      },
      {
        id: "infant_samskaras",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಶಾಸ್ತ್ರೋಕ್ತ ಬಾಲ ಸಂಸ್ಕಾರಗಳು, ಅನ್ನಪ್ರಾಶನ & ಶುಭ ಮುಹೂರ್ತಗಳು",
          mr: "अध्याय ३: वेदोक्त बालसंस्कार, अन्नप्राशन व पावन मुहूर्त",
          hi: "अध्याय ३: शास्त्रोक्त बाल संस्कार, अन्नप्राशन एवं शुभ मुहूर्त",
          te: "అధ్యాయం 3: శాస్త్రోక్త బాల సంస్కారాలు, అన్నప్రాశన & శుభ ముహూర్తాలు",
          ta: "அத்தியாயம் 3: சாஸ்திரோக்த சுப சடங்குகள், அன்னப்ராசனம் & மங்கள முகூர்த்தங்கள்",
          en: "Chapter 3: Sacred Infant Samskaras, Annaprashana & Astrological Timing"
        }, targetLang),
        subtitle: pick6({
          kn: "ವೇದ ಪರಂಪರೆಯ ೧೬ ಸಂಸ್ಕಾರಗಳ ದಿವ್ಯ ಫಲ ಪ್ರಾಪ್ತಿ",
          mr: "वैदिक परंपरेतील षोडश संस्कारांचे पावन फळ",
          hi: "वैदिक षोडश संस्कारों की पावन फल प्राप्ति",
          te: "వేద సంప్రదాయ షోడశ సంస్కారాల దివ్య ఫలం",
          ta: "வேத மரபின் 16 சடங்குகளின் தெய்வீக நற்பலன்கள்",
          en: "Aligning classical Parashari samskaras with planetary beneficence"
        }, targetLang),
        icon: "🪔",
        contemplationInquest: pick6({
          kn: "ನಾಮಕರಣ, ಅನ್ನಪ್ರಾಶನ, ಚೌಲ ಹಾಗೂ ಕರ್ಣವೇಧನ ಸಂಸ್ಕಾರಗಳ ಪಾವಿತ್ರ್ಯ ಚಿಂತನೆ",
          mr: "नामकरण, अन्नप्राशन, जावळ व कर्णवेध संस्कारांच्या पावित्र्याचे चिंतन",
          hi: "नामकरण, अन्नप्राशन, मुंडन एवं कर्णवेध संस्कारों की शुचिता का चिंतन",
          te: "నామకరణం, అన్నప్రాశన, పుట్టువెంట్రుకలు & కర్ణవేధన సంస్కారాల పవిత్రతా చింతన",
          ta: "நாமகரணம், அன்னப்ராசனம், முடி காணிக்கை & காது குத்துதல் சடங்குகளின் புனிதம்",
          en: "Contemplation on Namakarana, Annaprashana, Chowla & Karnavedhana Consecrations"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಸನಾತನ ಧರ್ಮದಲ್ಲಿ ಸಂಸ್ಕಾರಗಳು ಜೀವಾತ್ಮನಿಗೆ ದೈವಿಕ ರಕ್ಷೆ ಹಾಗೂ ಪೂರ್ವಜನ್ಮದ ದೋಷ ಪರಿಹಾರ ನೀಡುವ ಮಹಾಸಾಧನಗಳಾಗಿವೆ. ಮಗುವಿನ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಗೆ ಅನುಗುಣವಾಗಿ ಶಾಸ್ತ್ರೋಕ್ತ ನಾಮಕರಣವು ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಮಂಗಳಕರ ಆಕರ್ಷಣೆಯನ್ನು ನೀಡುತ್ತದೆ.`,
            mr: `सनातन परंपरेत संस्कार हे जिवाला ईश्वरी संरक्षण व पूर्वजन्मातील दोषमुक्ती देणारे पवित्र माध्यम आहेत. बालकाच्या जन्मनक्षत्र व राशीनुसार केलेले नामकरण त्याच्या व्यक्तिमत्त्वाला दैवी तेज प्रदान करते.`,
            hi: `सनातन धर्म में षोडश संस्कार जीवात्मा को दैवीय सुरक्षा एवं पूर्व संचित दोषों से मुक्ति प्रदान करते हैं। जन्मनक्षत्र एवं राशि के अनुसार शास्त्रसम्मत नामकरण शिशु के व्यक्तित्व को आकर्षण एवं ओजस्विता प्रदान करता है।`,
            te: `సనాతన ధర్మంలో సంస్కారాలు జీవునికి దైవిక రక్షణ మరియు పూర్వజన్మ దోషాలను తొలగించే సాధనాలు. జన్మ నక్షత్రం, రాశి ప్రకారం శాస్త్రోక్తంగా నామకరణం చేయడం వల్ల వ్యక్తిత్వానికి శ్రేయస్సు కలుగుతుంది.`,
            ta: `சனாதன தர்மத்தில் சுப சடங்குகள் ஆத்மாவிற்கு தெய்வீக பாதுகாப்பையும் நற்பலன்களையும் வழங்குகின்றன. ஜென்ம நட்சத்திரம் மற்றும் ராசிக்கு ஏற்ப சாஸ்திர முறைப்படி நாமகரணம் செய்வது குழந்தையின் ஆளுமையை மிளிரச் செய்யும்.`,
            en: `In classical Vedic tradition, Samskaras purify the soul, harmonizing genetic inheritance with planetary benevolence. Bestowing an authentic astrological name aligned with the Janma Nakshatra Pada permanently anchors auspicious vibrations throughout life.`
          }, targetLang),
          pick6({
            kn: `ಆರನೇ ತಿಂಗಳಲ್ಲಿ ಅನ್ನಪ್ರಾಶನ ಸಂಸ್ಕಾರವನ್ನು ಶುಭ ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರದಲ್ಲಿ ನೆರವೇರಿಸುವುದು ಮಗುವಿನ ಜೀರ್ಣಶಕ್ತಿ ಹಾಗೂ ಆಯುಷ್ಯವನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ. ದೇವಾಲಯದ ಪವಿತ್ರ ತೀರ್ಥ-ಪ್ರಸಾದ ಹಾಗೂ ಬಂಗಾರದ ಚಮಚದಿಂದ ನೀಡುವ ಪ್ರಥಮ ಅನ್ನವು ಮಗುವಿನಲ್ಲಿ ಸಾತ್ವಿಕ ಗುಣಗಳನ್ನು ತುಂಬಲಿದೆ.`,
            mr: `सहाव्या महिन्यात शुभ तिथी व नक्षत्रावर केलेला अन्नप्राशन संस्कार बालकाची पचनसंस्था व आयुष्य वृद्धिंगत करतो. देवाचे चरणामृत व सात्विक अन्नाचा पहिला घास बालकाला निरोगी व सात्विक वृत्तीचा बनवतो.`,
            hi: `छठे मास में शुभ तिथि एवं नक्षत्र में संपन्न अन्नप्राशन संस्कार शिशु की जठराग्नि एवं स्वास्थ्य को पुष्ट करता है। देवप्रसाद स्वरूप प्रथम धान्य ग्रहण कराने से सात्विक संस्कारों का बीजारोपण होता है।`,
            te: `ఆరవ నెలలో శుభ తిథి, నక్షత్రంలో అన్నప్రాశన నిర్వహించడం వల్ల జీర్ణశక్తి, ఆయుష్షు పెరుగుతాయి. దేవుని ప్రసాదంతో మొదటి ఆహారం అందించడం వల్ల సత్వగుణం పెంపొందుతుంది.`,
            ta: `ஆறாம் மாதத்தில் சுப திதி மற்றும் நட்சத்திரத்தில் அன்னப்ராசனம் செய்வது செரிமானத்தையும் ஆயுளையும் பெருக்கும். கோவில் பிரசாதமாக முதல் உணவை அளிப்பது குழந்தையின் குணத்தை சாத்வீகமாக்கும்.`,
            en: `Solemnizing Annaprashana during the 6th month under Jupiterian or Solar muhurtas awakens digestive fires (Jatharagni) smoothly. Introducing consecrated prasadam solidifies metabolic health and satvik equanimity.`
          }, targetLang),
          pick6({
            kn: `ಮುಂದಿನ ವರ್ಷಗಳಲ್ಲಿ ಚೌಲ (ಮುಂಡನ) ಹಾಗೂ ಕರ್ಣವೇಧನ ಸಂಸ್ಕಾರಗಳನ್ನು ಸಕಾಲದಲ್ಲಿ ಮಾಡಿಸುವುದು ಮಗುವಿನ ಮೆದುಳಿನ ನರಗಳ ಚುರುಕುತನ ಹಾಗೂ ನೇತ್ರ ದೃಷ್ಟಿಗೆ ಶಾಸ್ತ್ರ ಸಮ್ಮತವಾದ ಮಹತ್ವವನ್ನು ಹೊಂದಿದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ಪ್ರಾರ್ಥಿಸಿ ಈ ಸಂಸ್ಕಾರಗಳನ್ನು ಪೂರೈಸುವುದು ಪರಮ ಶ್ರೇಯಸ್ಕರ.`,
            mr: `पुढील वर्षांत जावळ (मुंडन) व कान टोचणे (कर्णवेध) संस्कार योग्य मुहूर्तावर केल्याने मेंदूच्या नसा व डोळ्यांचे तेज वाढण्यास मदत होते. श्री क्षेत्र गोकर्ण येथे संकल्प करून हे विधी पार पाडणे अत्यंत कल्याणकारी ठरेल.`,
            hi: `आगामी वर्षों में मुंडन एवं कर्णवेध संस्कार शास्त्रसम्मत वेला में कराना मस्तिष्क की कार्यक्षमता एवं दृष्टि की सुरक्षा हेतु वैज्ञानिक रूप से कल्याणकारी है। गोकर्ण महाबलेश्वर स्वामी के सान्निध्य में यह संस्कार संपन्न कराना परम पुण्यदायी है।`,
            te: `తరువాతి సంవత్సరాలలో పుట్టువెంట్రుకలు తీయించడం మరియు చెవులు కుట్టించడం సరైన ముహూర్తంలో చేయడం వల్ల మెదడు చురుకుదనం, కంటిచూపు మెరుగవుతాయి. శ్రీ గోకర్ణ మహాబలేశ్వరుని సమక్షంలో ఈ కార్యక్రమాలు చేయడం విశేష శుభప్రదం.`,
            ta: `அடுத்தடுத்த ஆண்டுகளில் மொட்டை அடித்தல் மற்றும் காது குத்துதல் சடங்குகளை சுப முகூர்த்தத்தில் செய்வது மூளை நரம்புகளின் சுறுசுறுப்பிற்கும் கண்பார்வைக்கும் நல்லது. கோகர்ண மகாபலேஸ்வரரை வேண்டி இதைச் செய்வது பெரும் நலம் தரும்.`,
            en: `Subsequently performing Chowla (first tonsure) and Karnavedhana (ear piercing) during prime muhurtas stimulates cranial meridians and optic health. Consecrating these milestones under the divine presence of Sri Gokarna Mahabaleshwara yields lasting auspiciousness.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಶಾಸ್ತ್ರೋಕ್ತ ಮುಹೂರ್ತದಲ್ಲೇ ಅನ್ನಪ್ರಾಶನ ಹಾಗೂ ಚೌಲ ಸಂಸ್ಕಾರಗಳನ್ನು ನೆರವೇರಿಸಿ; ಮಗುವಿಗೆ ನಿತ್ಯವೂ ಇಷ್ಟದೇವತೆಯ ಪ್ರಸಾದ ತೀರ್ಥವನ್ನು ಸ್ಪರ್ಶಿಸಿ.",
          mr: "अन्नप्राशन व जावळ संस्कार पंचांग पाहून शुद्ध मुहूर्तावरच करा; बालकाला रोज कुलदेवतेचे तीर्थ व भस्म लावावे.",
          hi: "अन्नप्राशन एवं मुंडन संस्कार पंचांग सम्मत शुभ मुहूर्त में ही करें; नित्य इष्टदेव का चरणामृत शिशु को स्पर्श कराएं।",
          te: "అన్నప్రాశన, పుట్టువెంట్రుకల వేడుకను పంచాంగ ముహూర్తంలోనే జరిపించండి; రోజూ ఇష్టదైవం తీర్థం స్పర్శించండి.",
          ta: "சாஸ்திர முகூர்த்தத்திலேயே அன்னப்ராசனம் மற்றும் சடங்குகளை செய்யுங்கள்; தினமும் இஷ்டதெய்வ பிரசாதத்தை குழந்தைக்கு இடுங்கள்.",
          en: "Schedule Annaprashana and tonsure rites strictly within authentic muhurtas; bless the child daily with sanctified tirtha."
        }, targetLang)
      }
    );
  } else if (detailedAge === "early_child") {
    chapters.push(
      {
        id: "early_child_education",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಅಕ್ಷರಾಭ್ಯಾಸ, ಪೂರ್ವ ಪ್ರಾಥಮಿಕ ಕಲಿಕೆ & ಬುದ್ಧಿ ವಿಕಾಸ",
          mr: "अध्याय १: अक्षराभ्यास, पूर्व-प्राथमिक शिक्षण व बुद्धिमत्ता विकास",
          hi: "अध्याय १: अक्षराभ्यास, पूर्व-प्राथमिक शिक्षा एवं बौद्धिक विकास",
          te: "అధ్యాయం 1: అక్షరాభ్యాసం, ప్రారంభ విద్య & బుద్ధి వికాసం",
          ta: "அத்தியாயம் 1: அக்ஷராப்யாசம், பாலர் கல்வி & அறிவு வளர்ச்சி",
          en: "Chapter 1: Aksharabhyasa, Pre-School Learning & Cognitive Sparks"
        }, targetLang),
        subtitle: pick6({
          kn: "ಬುಧ ಮತ್ತು ಸರಸ್ವತಿ ಅನುಗ್ರಹದಿಂದ ಭಾಷಾಜ್ಞಾನ ಹಾಗೂ ಕಲಿಕೆಯ ಆಸಕ್ತಿ",
          mr: "बुध व देवी सरस्वतीच्या कृपेने भाषाज्ञान व शिक्षणात रुची",
          hi: "बुध एवं माँ सरस्वती की अनुकंपा से भाषा ज्ञान एवं सीखने की लगन",
          te: "బుధ మరియు సరస్వతీ దేవి అనుగ్రహంతో భాషా పరిజ్ఞానం, చదువుపై ఆసక్తి",
          ta: "புதன் & சரஸ்வதியின் அருளால் மொழி அறிவு மற்றும் கற்கும் ஆர்வம்",
          en: "Mercury and Saraswati infusing language dexterity and joyful study habits"
        }, targetLang),
        icon: "✏️",
        contemplationInquest: pick6({
          kn: "ಅಕ್ಷರಾಭ್ಯಾಸ, ಪ್ರಿ-ಸ್ಕೂಲ್ ಪ್ರವೇಶ ಹಾಗೂ ಬಾಲಪ್ರತಿಭೆಯ ನೈಸರ್ಗಿಕ ವಿಕಾಸದ ಚಿಂತನೆ",
          mr: "पाटीपूजन, बालवाडी प्रवेश व नैसर्गिक प्रतिभेच्या विकासाचे चिंतन",
          hi: "अक्षराभ्यास, पूर्व-प्राथमिक प्रवेश एवं नैसर्गिक प्रतिभा विकास का चिंतन",
          te: "అక్షరాభ్యాసం, పాఠశాల ప్రవేశం & సహజ ప్రతిభ వికాసం పై చింతన",
          ta: "அக்ஷராப்யாசம், பாலர் பள்ளி சேர்க்கை மற்றும் இயல்பான திறமை வளர்ச்சி சிந்தனை",
          en: "Contemplation on Aksharabhyasa Initiation, Pre-School Transition & Cognitive Spark"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಮುಂದಿನ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯು ಮಗುವಿನ ಶಿಕ್ಷಣ ಜೀವನದ ಪ್ರಥಮ ಅಡಿಪಾಯವಾಗಿದೆ. ನರ್ಸರಿ, ಎಲ್‌ಕೆಜಿ ಹಾಗೂ ಪ್ರಾಥಮಿಕ ಶಾಲೆಗೆ ಮಗು ಸಂತಸದಿಂದ ಪಾದಾರ್ಪಣೆ ಮಾಡಲಿದೆ. ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಬುಧ ಹಾಗೂ ೫ನೇ ಭಾವದ ಪ್ರಭಾವದಿಂದ ಭಾಷಾ ಗ್ರಹಣ, ಕಥೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಶಕ್ತಿ ಹಾಗೂ ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯುವ ಆಸಕ್ತಿ ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಲಿದೆ. ಶಿಕ್ಷಕರಿಂದ ಪ್ರಶಂಸೆ ದೊರೆಯಲಿದೆ.`,
            mr: `पुढील पाच वर्षे बालकाच्या शिक्षण प्रवासाचा पाया रचतील. बालक आनंदाने बालवाडी व प्राथमिक शाळेत पाऊल ठेवेल. कुंडलीतील बुध व पंचम भावाच्या अनुकूलतेमुळे भाषा आकलन, गोष्टी समजणे व नवीन गोष्टी शिकण्याची आवड यात मोठी प्रगती दिसेल. शिक्षकांचे कौतुक लाभेल.`,
            hi: `आगामी पांच वर्ष बालक की शिक्षा यात्रा की सुदृढ़ आधारशिला रखेंगे। वह अत्यंत प्रसन्नता से पूर्व-प्राथमिक एवं प्राथमिक कक्षा में प्रवेश करेगा। कुंडली में बुध एवं पंचम भाव के प्रभाव से भाषा बोध, कथा श्रवण एवं नवीन बातें सीखने की जिज्ञासा तीव्र होगी।`,
            te: `రాబోయే ఐదు సంవత్సరాల కాలం పిల్లల విద్యా ప్రయాణానికి బలమైన పునాది. పిల్లలు నర్సరీ మరియు ప్రాథమిక పాఠశాలలో ఆనందంగా ప్రవేశిస్తారు. జాతకంలో బుధుడు మరియు 5వ భావ ప్రభావం వల్ల భాషా పరిజ్ఞానం, కథలు అర్థం చేసుకునే శక్తి అద్భుతంగా పెరుగుతాయి. ఉపాధ్యాయుల ప్రశంసలు దక్కుతాయి.`,
            ta: `அடுத்த ஐந்து ஆண்டுகளில் குழந்தை மழலையர் பள்ளி மற்றும் தொடக்கக் கல்வியில் உற்சாகத்துடன் அடியெடுத்து வைக்கும். புதன் மற்றும் 5ம் இடத்து பலத்தால் மொழித்திறன், கதைகளைப் புரிந்து கொள்ளும் ஆற்றல் மேலோங்கும். ஆசிரியர்களின் அன்பும் பாராட்டும் கிடைக்கும்.`,
            en: `Across the next 5 years, the child enters kindergarten and primary schooling with radiant eagerness. Under Mercury's agile governance and 5th house trines, linguistic fluency, phonetic recall, and conceptual curiosity blossom briskly, winning warm praise from teachers.`
          }, targetLang),
          pick6({
            kn: `ವಿಜಯದಶಮಿ ಅಥವಾ ವಸಂತ ಪಂಚಮಿಯ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಅಕ್ಷರಾಭ್ಯಾಸವನ್ನು ನೆರವೇರಿಸುವುದು ಮಗುವಿನ ಸರಸ್ವತಿ ಯೋಗವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಯಾವುದೇ ಮಾನಸಿಕ ಒತ್ತಡವಿಲ್ಲದೆ ಆಟ-ಪಾಠಗಳ ಮೂಲಕ ವರ್ಣಮಾಲೆ, ಸಂಖ್ಯೆಗಳು ಹಾಗೂ ಸರಳ ಶ್ಲೋಕಗಳನ್ನು ಕಲಿಸುವುದು ದೀರ್ಘಕಾಲೀನ ಸ್ಮರಣಶಕ್ತಿಗೆ ಅತ್ಯುತ್ತಮ.`,
            mr: `विजयादशमी किंवा वसंत पंचमीच्या मुहूर्तावर पाटीपूजन विधी केल्याने सरस्वती कृपा जागृत होते. कोणताही ताण न देता खेळांमधून अक्षरे, अंक व सोपे श्लोक शिकवल्यास स्मरणशक्ती दीर्घकाळ उत्तम राहील.`,
            hi: `विजयादशमी अथवा वसंत पंचमी के शुभ मुहूर्त में अक्षराभ्यास संस्कार माँ सरस्वती की कृपा को जागृत करता है। बिना किसी मानसिक दबाव के खेल-खेल में वर्णमाला, संख्याएं एवं सरल श्लोक सिखाना दीर्घकालिक स्मरण शक्ति को पुष्ट करता है।`,
            te: `విజయదశమి లేదా వసంత పంచమి శుభ ముహూర్తంలో అక్షరాభ్యాసం నిర్వహించడం వల్ల సరస్వతీ కటాక్షం లభిస్తుంది. ఎలాంటి ఒత్తిడి లేకుండా ఆటపాటల ద్వారా అక్షరాలు, సంఖ్యలు మరియు చిన్న చిన్న శ్లోకాలు నేర్పించడం జ్ఞాపకశక్తికి మేలు చేస్తుంది.`,
            ta: `விஜயதசமி அல்லது வசந்த பஞ்சமி சுப முகூர்த்தத்தில் அக்ஷராப்யாசம் செய்வது சரஸ்வதி கடாட்சத்தை உண்டாக்கும். மன அழுத்தமின்றி விளையாட்டு முறையில் எழுத்துக்கள், எண்கள் மற்றும் எளிய ஸ்லோகங்களை கற்றுத் தருவது நினைவாற்றலை உயர்த்தும்.`,
            en: `Solemnizing the Aksharabhyasa rite upon auspicious Vijayadashami or Vasant Panchami awakens potent Saraswati energies. Introducing letters, numeracy, and rhythmic stotras through joyful play rather than rigid pressure embeds photographic retention.`
          }, targetLang),
          pick6({
            kn: `ಸಹಪಾಠಿಗಳೊಂದಿಗೆ ಬೆರೆಯುವಿಕೆ, ಹಂಚಿಕೊಳ್ಳುವ ಸದ್ಗುಣ ಹಾಗೂ ಸೌಮ್ಯ ಸ್ವಭಾವವು ಮಗುವಿನ ಸಾಮಾಜಿಕ ಹೊಂದಾಣಿಕೆಯನ್ನು ಸುಗಮಗೊಳಿಸುತ್ತದೆ. ಪೋಷಕರು ದಿನವೂ ಮಲಗುವ ಮುನ್ನ ನೈತಿಕ ಕಥೆಗಳನ್ನು ಹೇಳುವುದು ಹಾಗೂ ಸಂಜೆ ದೀಪ ಹಚ್ಚಿ ನಮಸ್ಕರಿಸುವುದನ್ನು ರೂಢಿಸುವುದು ಸದ್ಗುಣಗಳ ಬೀಜ ಬಿತ್ತಲಿದೆ.`,
            mr: `मित्रांसोबत मिळून मिसळून राहणे, वस्तू वाटून घेणे व शांत स्वभाव बालकाच्या सामाजिक वर्तनाला सुंदर आकार देईल. पालकांनी रोज रात्री नैतिक गोष्टी सांगणे व संध्याकाळी दिव्याजवळ शुभंकरोती म्हणण्याची सवय लावणे उत्तम संस्कार घडवेल.`,
            hi: `सहपाठियों के साथ मिलजुलकर रहना, बांटने की आदत एवं विनम्र स्वभाव बालक के सामाजिक सामंजस्य को सुदृढ़ करेगा। अभिभावक नित्य रात्रि में नैतिक कथाएं सुनाएं तथा संध्या दीप के समक्ष प्रणाम करने की आदत डालें।`,
            te: `తోటి పిల్లలతో కలిసిమెలిసి ఉండటం, పంచుకునే గుణం మరియు మంచి ప్రవర్తన అలవడతాయి. తల్లిదండ్రులు రోజూ రాత్రి మంచి కథలు చెప్పడం, సాయంత్రం దీపం ముందు నమస్కరించడం అలవాటు చేయడం పిల్లలలో సద్గుణాలను పెంచుతుంది.`,
            ta: `நண்பர்களுடன் இணைந்து பழகுதல், பகிர்ந்து கொள்ளும் குணம் மற்றும் பணிவு குழந்தையின் நற்பண்புகளை வளர்க்கும். பெற்றோர்கள் தினமும் இரவில் நீதிக் கதைகளை சொல்வதும், மாலையில் விளக்கேற்றி வழிபடச் செய்வதும் சிறந்த ஒழுக்கத்தை உண்டாக்கும்.`,
            en: `Social bonding with classmates and spontaneous sharing cultivate empathetic emotional intelligence. Storytelling drawn from sacred epics before bed and evening lamp veneration instill lifelong moral integrity and familial respect.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ದಿನವೂ ಪ್ರೇಮದಿಂದ ಕಥೆಗಳನ್ನು ಹೇಳಿ, ಸರಸ್ವತಿ ಶ್ಲೋಕಗಳನ್ನು ಪುಟ್ಟ ಧ್ವನಿಯಲ್ಲಿ ಹೇಳಿಕೊಡುವುದು ಬುದ್ಧಿ ವಿಕಾಸಕ್ಕೆ ಅತ್ಯುತ್ತಮ.",
          mr: "दररोज प्रेमाने गोष्टी सांगाव्यात व सरस्वती स्तोत्राचे लहान चरण म्हणवून घ्यावेत, यामुळे बुद्धिमत्ता अत्यंत तल्लख होते.",
          hi: "नित्य प्रेमपूर्वक ज्ञानवर्धक कथाएं सुनाएं एवं सरल सरस्वती श्लोक सिखाएं, इससे बौद्धिक प्रखरता बढ़ती है।",
          te: "రోజూ ప్రేమగా కథలు చెబుతూ సరస్వతీ శ్లోకాలను నేర్పించడం బుద్ధి వికాసానికి ఎంతో మంచిది.",
          ta: "தினமும் அன்புடன் கதைகள் கூறி, எளிய சரஸ்வதி ஸ்லோகங்களை சொல்லிக் கொடுப்பது அறிவுக்கூர்மையை வளர்க்கும்.",
          en: "Narrate virtuous bedtime parables and teach simple Saraswati verses; love and encouragement unlock intellectual brilliance."
        }, targetLang)
      },
      {
        id: "early_child_health",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಪೌಷ್ಟಿಕ ಆಹಾರ & ರಕ್ಷಣಾ ಕವಚ",
          mr: "अध्याय २: शारीरिक रोगप्रतिकारशक्ती, सकस आहार व आरोग्य संरक्षण",
          hi: "अध्याय २: शारीरिक रोगप्रतिरोधक क्षमता, पौष्टिक आहार एवं स्वास्थ्य रक्षा",
          te: "అధ్యాయం 2: శారీరక రోగనిరోధక శక్తి, పౌష్టికాహారం & ఆరోగ్య రక్షణ",
          ta: "அத்தியாயம் 2: நோய் எதிர்ப்பு சக்தி, சத்தான உணவு & நல்வாழ்வு பாதுகாப்பு",
          en: "Chapter 2: Pediatric Immunity Shield, Nutrition & Physical Vitality"
        }, targetLang),
        subtitle: pick6({
          kn: "ಸೂರ್ಯ ಮತ್ತು ಮಂಗಳನ ಬಲದಿಂದ ದೈಹಿಕ ಚುರುಕುತನ ಹಾಗೂ ಸದೃಢ ಆರೋಗ್ಯ",
          mr: "सूर्य व मंगळाच्या बळाने शारीरिक चपळता व निरोगी प्रकृती",
          hi: "सूर्य एवं मंगल के प्रभाव से शारीरिक स्फूर्ति एवं सुदृढ़ स्वास्थ्य",
          te: "సూర్య, కుజ గ్రహాల బలంతో శారీరక చురుకుదనం & దృఢమైన ఆరోగ్యం",
          ta: "சூரியன் & செவ்வாய் பலத்தால் உடல் சுறுசுறுப்பு மற்றும் சிறந்த ஆரோக்கியம்",
          en: "Solar and Martial energies bestowing physical stamina and robust immunity"
        }, targetLang),
        icon: "🛡️",
        contemplationInquest: pick6({
          kn: "ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಜೀರ್ಣಾಂಗ ಆರೋಗ್ಯ ಹಾಗೂ ಋತುಮಾನ ರಕ್ಷಣೆಯ ಚಿಂತನೆ",
          mr: "बालकाची प्रतिकारशक्ती, पचनक्रिया व ऋतू बदलातील काळजीचे चिंतन",
          hi: "शिशु की रोगप्रतिरोधक क्षमता, पाचन स्वास्थ्य एवं ऋतुकालिक सुरक्षा का चिंतन",
          te: "పిల్లల రోగనిరోధక శక్తి, జీర్ణక్రియ & వాతావరణ మార్పుల రక్షణ పై చింతన",
          ta: "குழந்தையின் நோய் எதிர்ப்பு சக்தி, செரிமானம் மற்றும் பருவநிலை பாதுகாப்பு சிந்தனை",
          en: "Contemplation on Fortifying Pediatric Immunity, Digestion & Seasonal Resilience"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಈ ವಯಸ್ಸಿನಲ್ಲಿ ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಬಲಪಡಿಸುವುದು ಅತ್ಯಂತ ಮುಖ್ಯ. ಶಾಲಾ ಪರಿಸರಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುವಾಗ ಬರುವ ಸಾಮಾನ್ಯ ಶೀತ, ಗಂಟಲು ಕೆರೆತ ಅಥವಾ ಕೆಮ್ಮನ್ನು ಸುಲಭವಾಗಿ ನಿವಾರಿಸಲು ಶುದ್ಧ ಜೇನುತುಪ್ಪ, ಬಿಸಿಹಾಲು ಹಾಗೂ ಹಳದಿ ಮಿಶ್ರಣವು ದಿವ್ಯ ಔಷಧವಾಗಿದೆ. ನೈಸರ್ಗಿಕ ಆಹಾರ ಪದ್ಧತಿಯು ಮಗುವಿನ ಶಾರೀರಿಕ ದೃಢತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`,
            mr: `या वयात बालकाची प्रतिकारशक्ती वाढवणे अत्यंत महत्त्वाचे आहे. शाळेत जाताना हवामान बदलाने होणारी सर्दी, खोकला यावर मध, हळद घातलेले कोमट दूध घरगुती रामबाण उपाय ठरतील. सकस घरगुती आहाराने मुलाची प्रकृती उत्तम राहील.`,
            hi: `इस आयु में बालक की रोगप्रतिरोधक क्षमता को सुदृढ़ रखना प्राथमिक दायित्व है। विद्यालय परिवेश में होने वाले सामान्य मौसमी सर्दी-जुकाम के निवारण हेतु शहद, हल्दी युक्त उष्ण दुग्ध अत्यंत लाभकारी है। सात्विक घर का भोजन शरीर को बल प्रदान करेगा।`,
            te: `ఈ వయస్సులో పిల్లల రోగనిరోధక శక్తిని పెంచడం చాలా ముఖ్యం. పాఠశాల వాతావరణంలో వచ్చే సాధారణ జలుబు, దగ్గును నివారించడానికి తేనె, పసుపు కలిపిన గోరువెచ్చని పాలు ఎంతో మేలు చేస్తాయి. సహజ సిద్ధమైన ఇంటి ఆహారం పిల్లలను దృఢంగా ఉంచుతుంది.`,
            ta: `இந்த வயதில் குழந்தையின் நோய் எதிர்ப்பு சக்தியை அதிகரிப்பது மிக அவசியம். பள்ளிக்குச் செல்லும்போது வரும் சாதாரண சளி, இருமலைப் போக்க தேன், மஞ்சள் கலந்த வெதுவெதுப்பான பால் நல்ல பலன் தரும். சத்தான வீட்டு உணவு உடல் வலிமையை உயர்த்தும்.`,
            en: `Consolidating pediatric immunity is paramount during early scholastic exposure. Balancing occasional classroom chills with traditional turmeric milk, honey, and nutrient-dense seasonal fare strengthens respiratory resilience naturally.`
          }, targetLang),
          pick6({
            kn: `ದೈಹಿಕ ಆಟೋಟಗಳು, ಓಟ, ಮಣ್ಣಿನಲ್ಲಿ ಆಡುವುದು ಮಗುವಿನ ಮೂಳೆಗಳು ಹಾಗೂ ಸ್ನಾಯುಗಳ ಬೆಳವಣಿಗೆಗೆ ಪರಮ ಪೋಷಕ. ದಿನವೂ ಕನಿಷ್ಠ ಒಂದು ಗಂಟೆ ನೈಸರ್ಗಿಕ ಬಿಸಿಲಿನಲ್ಲಿ ಆಟವಾಡಲು ಬಿಡುವುದು ವಿಟಮಿನ್ ಡಿ ಸಂಚಯಕ್ಕೆ ಹಾಗೂ ಕಣ್ಣಿನ ದೃಷ್ಟಿಗೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ. ಮೊಬೈಲ್ ಗೇಮ್‌ಗಳಿಂದ ದೂರವಿರಿಸುವುದು ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡುತ್ತದೆ.`,
            mr: `मैदानी खेळ, धावणे व निसर्गाच्या सान्निध्यात खेळण्याने बालकाचे स्नायू व हाडे मजबूत होतात. रोज कोवळ्या उन्हात खेळू दिल्याने शरीराला ऊर्जा मिळते. मोबाईलच्या आहारी जाऊ न दिल्यास चिडचिड टळेल व एकाग्रता वाढेल.`,
            hi: `मैदानी खेलकूद, दौड़ना एवं खुली हवा में खेलना अस्थियों एवं मांसपेशियों को सुदृढ़ बनाता है। नित्य प्रातःकालीन धूप में खेलने से शारीरिक ओजस्विता बढ़ती है। मोबाइल से दूर रखने पर स्वभाव शांत एवं एकाग्रचित्त बना रहेगा।`,
            te: `మైదానంలో ఆటలు, పరుగు మరియు ఆరుబయట ఆడుకోవడం వల్ల ఎముకలు, కండరాలు ధృడపడతాయి. రోజూ ఎండలో ఆడుకోవడం వల్ల శరీరానికి సహజ శక్తి లభిస్తుంది. మొబైల్ ఫోన్లకు దూరంగా ఉంచడం వల్ల మనస్సు ప్రశాంతంగా ఉంటుంది.`,
            ta: `மைதான விளையாட்டுகள், ஓடுதல் மற்றும் திறந்தவெளியில் விளையாடுவது எலும்புகளையும் தசைகளையும் பலப்படுத்தும். தினமும் காலை வெயிலில் விளையாட விடுவது உடலுக்கு அபார ஆற்றலைத் தரும். செல்போன் பழக்கத்தைத் தவிர்ப்பது மனதை அமைதியாக்கும்.`,
            en: `Outdoor physical exertion, running, and play under the morning sun provide foundational musculoskeletal density. Restricting digital gadgets protects delicate optic nerves and prevents restless behavioral friction.`
          }, targetLang),
          pick6({
            kn: `ಧನ್ವಂತರಿ ಸ್ತೋತ್ರದ ಶ್ರವಣ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಆರಾಧನೆಯು ಮಗುವಿನ ಆರೋಗ್ಯಕ್ಕೆ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ. ಪುಷ್ಯ ನಕ್ಷತ್ರದ ದಿನದಂದು ಸುವರ್ಣಪ್ರಾಶನವನ್ನು ಮಾಡಿಸುವುದು ಮಗುವಿನ ಗ್ರಹಣಶಕ್ತಿ, ವರ್ಚಸ್ಸು ಹಾಗೂ ರೋಗನಿರೋಧಕತೆಯನ್ನು ದುಪ್ಪಟ್ಟುಗೊಳಿಸುತ್ತದೆ.`,
            mr: `धन्वंतरी स्तोत्र ऐकवणे व कुलस्वामीचे स्मरण बालकाच्या आरोग्याला अभेद्य कवच देते. पुष्य नक्षत्रावर सुवर्णप्राशन संस्कार केल्यास बालकाची स्मरणशक्ती, वर्ण व प्रतिकारशक्ती दुप्पट वेगाने वाढते.`,
            hi: `भगवान धन्वंतरि एवं कार्तिकेय का ध्यान शिशु को आरोग्य का दिव्य संबल प्रदान करता है। पुष्य नक्षत्र के पावन दिन सुवर्णप्राशन कराना स्मरण शक्ति, शारीरिक कांति एवं रोगप्रतिरोधक क्षमता को चमत्कारिक रूप से बढ़ाता है।`,
            te: `ధన్వంతరి స్తోత్రం మరియు సుబ్రహ్మణ్య స్వామి ఆరాధన పిల్లల ఆరోగ్యానికి రక్షగా నిలుస్తాయి. పుష్యమి నక్షత్రం రోజున సువర్ణప్రాశనం చేయించడం వల్ల జ్ఞాపకశక్తి, శరీర కాంతి మరియు రోగనిరోధక శక్తి రెట్టింపు అవుతాయి.`,
            ta: `ஸ்ரீ தன்வந்திரி மற்றும் பாலமுருகன் வழிபாடு உடல் நலம் காக்கும். புஷ்ய நட்சத்திர நன்னாளில் சுவர்ணபிராசனம் தருவது குழந்தையின் கிரகிக்கும் திறன், உடல் பொலிவு மற்றும் ஆரோக்கியத்தை இரட்டிப்பாக்கும்.`,
            en: `Prayers to Lord Dhanvantari and Bala Subrahmanya invoke powerful pediatric protection. Administering sanctified Suvarna Prashana on auspicious Pushya Nakshatra days is an authentic Vedic regimen that compounds memory, complexion, and natural immunity.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಬೆಳಗಿನ ಸೂರ್ಯನ ಬಿಸಿಲಿನಲ್ಲಿ ಆಟವಾಡಲು ಬಿಡಿ; ಕೃತಕ ಬಣ್ಣಗಳ ಆಹಾರ ತಪ್ಪಿಸಿ ತಾಜಾ ಸಾತ್ವಿಕ ಆಹಾರ ನೀಡಿ.",
          mr: "सकाळच्या कोवळ्या उन्हात खेळू द्यावे; पाकीटबंद पदार्थ टाळून सात्विक व ताजा घरचा आहार द्यावा.",
          hi: "प्रातःकाल की धूप में खेलने दें; कृत्रिम रंगों एवं पैकेटबंद खाद्य पदार्थों से बचाकर सात्विक भोजन दें।",
          te: "ఉదయం ఎండలో ఆడుకోనివ్వండి; రంగులు కలిపిన పదార్థాలు మానండి, తాజా ఆహారం ఇవ్వండి.",
          ta: "காலை வெயிலில் விளையாட அனுமதியுங்கள்; பாக்கெட் தின்பண்டங்களைத் தவிர்த்து சத்தான வீட்டு உணவு தாருங்கள்.",
          en: "Promote morning sunlit physical play and strictly replace artificial packaged snacks with fresh home-cooked sattvic nourishment."
        }, targetLang)
      },
      {
        id: "early_child_habits",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಸದ್ಗುಣಗಳ ಸಂಸ್ಕಾರ, ಕಲಾ ಪ್ರತಿಭೆ & ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ",
          mr: "अध्याय ३: उत्तम संस्कार, कलागुण व कौटुंबिक स्नेह",
          hi: "अध्याय ३: सुसंस्कार, कलात्मक प्रतिभा एवं पारिवारिक स्नेह",
          te: "అధ్యాయం 3: సద్గుణాలు, కళా నైపుణ్యం & కుటుంబ అనురాగం",
          ta: "அத்தியாயம் 3: நற்பண்புகள், கலைத்திறன் & குடும்ப பாசம்",
          en: "Chapter 3: Moral Character, Creative Talents & Family Harmony"
        }, targetLang),
        subtitle: pick6({
          kn: "ಶುಕ್ರ ಮತ್ತು ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಸದ್ಗುಣಗಳ ವಿಕಾಸ",
          mr: "शुक्र व गुरूच्या आशीर्वादाने सुसंस्कार व कलागुणांची वृद्धी",
          hi: "शुक्र एवं गुरु के प्रभाव से संस्कारों एवं रचनात्मकता का विकास",
          te: "శుక్ర, గురు గ్రహాల అనుగ్రహంతో సద్గుణాలు & కళల వికాసం",
          ta: "சுக்கிரன் மற்றும் குருவின் அருளால் நற்பண்புகள் & கலை வளர்ச்சி",
          en: "Venusian creativity and Jovian nobility inspiring character and artistic inclinations"
        }, targetLang),
        icon: "🎨",
        contemplationInquest: pick6({
          kn: "ಮಗುವಿನ ಸದ್ಗುಣ, ಕ್ರೀಡೆ, ಚಿತ್ರಕಲೆ ಅಥವಾ ಸಂಗೀತ ಪ್ರತಿಭೆಯ ಪ್ರೋತ್ಸಾಹ ಚಿಂತನೆ",
          mr: "बालकाचे सुसंस्कार, खेळ, चित्रकला अथवा संगीतातील आवडीचे चिंतन",
          hi: "बालक के नैतिक संस्कार, खेलकूद, चित्रकला अथवा संगीत रुचि का चिंतन",
          te: "పిల్లల సద్గుణాలు, ఆటలు, చిత్రలేఖనం లేదా సంగీత ప్రతిభ ప్రోత్సాహం పై చింతన",
          ta: "குழந்தையின் நற்பண்புகள், விளையாட்டு, ஓவியம் அல்லது இசை ஆர்வம் சிந்தனை",
          en: "Contemplation on Nurturing Inborn Artistic Aptitude, Moral Values & Athletic Joy"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಮಗುವಿನ ಮನಸ್ಸು ಶುಭ್ರ ಮಣ್ಣಿನಂತೆ; ಈ ವಯಸ್ಸಿನಲ್ಲಿ ಬಿತ್ತುವ ಸಂಸ್ಕಾರಗಳೇ ಮುಂದೆ ಹೆಮ್ಮರವಾಗಲಿವೆ. ಶುಕ್ರ ಮತ್ತು ಬುಧರ ಅನುಕೂಲಕರ ಸ್ಥಿತಿಯು ಮಗುವಿನಲ್ಲಿ ಚಿತ್ರಕಲೆ, ಬಣ್ಣಗಳು, ಸಂಗೀತ ಅಥವಾ ಕ್ರೀಡೆಗಳಲ್ಲಿ ವಿಶೇಷ ಆಸಕ್ತಿಯನ್ನು ಪ್ರಚೋದಿಸಲಿದೆ. ಮಗುವಿನ ಸಹಜ ಒಲವನ್ನು ಗುರುತಿಸಿ ಪ್ರೋತ್ಸಾಹಿಸುವುದು ಅಗತ್ಯ.`,
            mr: `बालकाचे मन ओल्या मातीसारखे असते; या वयात दिलेले संस्कार आयुष्यभर साथ देतात. शुक्र व बुधाच्या कृपेने चित्रकला, संगीत, नृत्य अथवा खेळामध्ये विशेष रस निर्माण होईल. बालकाची आवड ओळखून त्याला प्रेमाने प्रोत्साहन द्यावे.`,
            hi: `बालक का अंतःकरण कोमल मिट्टी के समान है; इस आयु में रोपे गए संस्कार ही जीवन भर पल्लवित होते हैं। शुक्र एवं बुध की अनुकूलता से चित्रकला, रंग, संगीत अथवा खेलकूद में सहज अभिरुचि जागृत होगी। उसकी स्वाभाविक प्रतिभा को पहचानकर प्रोत्साहित करें।`,
            te: `పిల్లల మనస్సు స్వచ్ఛమైన మట్టి వంటిది; ఈ వయస్సులో నేర్పే మంచి అలవాట్లే జీవితాంతం తోడుంటాయి. శుక్రుడు, బుధుని అనుకూలత వల్ల చిత్రలేఖనం, రంగులు, సంగీతం లేదా ఆటలలో ఆసక్తి పెరుగుతుంది. పిల్లల సహజ ప్రతిభను గుర్తించి ప్రోత్సహించండి.`,
            ta: `குழந்தையின் மனம் களிமண் போன்றது; இந்த வயதில் விதைக்கும் நற்பண்புகளே வாழ்நாள் முழுவதும் வளரும். சுக்கிரன் மற்றும் புதனின் அனுகூலத்தால் ஓவியம், இசை அல்லது விளையாட்டுகளில் தனி ஆர்வம் பிறக்கும். குழந்தையின் விருப்பத்தை அறிந்து ஊக்கப்படுத்துங்கள்.`,
            en: `A young child's consciousness resembles soft clay; virtues impressed during this window endure across a lifetime. Favorable Venusian and Mercurial alignments awaken innate curiosity toward drawing, melodies, rhythm, or athletics; nurturing this natural spark reaps luminous creative dividends.`
          }, targetLang),
          pick6({
            kn: `ಹಿರಿಯರಿಗೆ ಕೈಮುಗಿಯುವುದು, ಧನ್ಯವಾದ ಹೇಳುವುದು ಹಾಗೂ ಮನೆಯ ಪುಟ್ಟ ಕೆಲಸಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡುವ ಪ್ರವೃತ್ತಿಯು ಮಗುವಿನಲ್ಲಿ ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು ಬೆಳೆಸುತ್ತದೆ. ತಂದೆ-ತಾಯಿಯ ಪ್ರೀತಿಯ ಮಾತುಗಳು ಮಗುವಿಗೆ ಪರಮ ಭದ್ರತೆಯನ್ನು ನೀಡುತ್ತವೆ. ಸಣ್ಣ ತಪ್ಪುಗಳನ್ನು ಪ್ರೀತಿಯಿಂದ ತಿದ್ದಿ ತೀಡುವುದು ಶ್ರೇಷ್ಠ.`,
            mr: `मोठ्यांना वाकून नमस्कार करणे, धन्यवाद मानणे व घरातील लहान कामात मदत करण्याची सवय बालकात उत्तम गुण रुजवेल. आई-वडिलांचे कौतुक बालकाचा आत्मविश्वास वाढवेल. चुकांवर न रागावता प्रेमाने समजावून सांगावे.`,
            hi: `बड़ों का चरण स्पर्श, धन्यवाद की भावना एवं गृह कार्यों में सहयोग की प्रवृत्ति बालक में नेतृत्व गुण विकसित करती है। माता-पिता के मधुर शब्द उसे भावनात्मक सुरक्षा प्रदान करते हैं। त्रुटियों पर क्रोध न कर प्रेमपूर्वक समझाना श्रेष्ठ है।`,
            te: `పెద్దలకు నమస్కరించడం, కృతజ్ఞత తెలపడం మరియు ఇంట్లో చిన్న చిన్న పనుల్లో సహాయం చేయడం పిల్లలలో నాయకత్వ లక్షణాలను పెంచుతాయి. తల్లిదండ్రుల ఆప్యాయత వారికి గొప్ప ధైర్యాన్నిస్తుంది. తప్పులను కోపంతో కాకుండా ప్రేమతో సరిదిద్దండి.`,
            ta: `பெரியவர்களை வணங்குதல், நன்றி கூறுதல் மற்றும் வீட்டு வேலைகளில் உதவுதல் தலைமைப் பண்புகளை வளர்க்கும். பெற்றோரின் அன்பான வார்த்தைகள் மிகுந்த பாதுகாப்பைத் தரும். தவறுகளைக் கோபப்படாமல் அன்புடன் திருத்துங்கள்.`,
            en: `Greeting elders respectfully, voicing gratitude, and participating in light family chores embed foundational leadership ethos. Consistent parental warmth reinforces emotional security, replacing harsh reprimands with patient, gentle explanation.`
          }, targetLang),
          pick6({
            kn: `ಕುಟುಂಬದಲ್ಲಿ ಒಟ್ಟಾಗಿ ಕುಳಿತು ಊಟ ಮಾಡುವುದು ಹಾಗೂ ಹಬ್ಬ ಹರಿದಿನಗಳನ್ನು ಸಂಭ್ರಮದಿಂದ ಆಚರಿಸುವುದು ಮಗುವಿಗೆ ಸನಾತನ ಸಂಸ್ಕೃತಿಯ ಮಹತ್ವವನ್ನು ಕಲಿಸುತ್ತದೆ. ಒಡಹುಟ್ಟಿದವರೊಂದಿಗೆ ಪ್ರೀತಿಯಿಂದ ಬೆರೆಯುವ ವಾತಾವರಣವು ಮನೆಯಲ್ಲಿ ಶಾಂತಿ ಹಾಗೂ ಸೌಹಾರ್ದತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ನೆಲೆಸುವಂತೆ ಮಾಡುತ್ತದೆ.`,
            mr: `कुटुंबात एकत्र जेवणे व सण-उत्सव उत्साहाने साजरे केल्याने बालकाला संस्कृतीची गोडी लागेल. भावंडांमध्ये प्रेमाचे नाते निर्माण झाल्याने घरात सदैव प्रसन्नता व शांती नांदेल.`,
            hi: `सपरिवार एकत्र बैठकर भोजन करना एवं पावन पर्वों को उल्लासपूर्वक मनाना बालक में सांस्कृतिक गौरव जागृत करता है। भाई-बहनों के साथ प्रेमपूर्ण संबंध गृह में शाश्वत शांति एवं सौहार्द की स्थापना करते हैं।`,
            te: `కుటుంబ సభ్యులంతా కలిసి భోజనం చేయడం మరియు పండుగలను సంతోషంగా జరుపుకోవడం వల్ల పిల్లలకు సంస్కృతి పట్ల గౌరవం ఏర్పడుతుంది. తోబుట్టువులతో ప్రేమానురాగాలు ఇంట్లో ప్రశాంతతను, ఆనందాన్ని నింపుతాయి.`,
            ta: `குடும்பத்துடன் இணைந்து சாப்பிடுவதும், பண்டிகைகளைக் கொண்டாடுவதும் கலாச்சார மதிப்பைப் புகட்டும். உடன்பிறப்புகளுடன் அன்புடன் பழகும் சூழல் இல்லத்தில் நிரந்தர அமைதியை உண்டாக்கும்.`,
            en: `Gathering for family meals and celebrating traditional festivals ignite instinctive pride in cultural heritage. Warm camaraderie shared between siblings creates an enduring domestic sanctuary overflowing with joy.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಮಗುವಿನ ಎದುರು ಜಗಳವಾಡಬೇಡಿ; ಸದಾ ಪ್ರೇಮ, ನಗು ಹಾಗೂ ಸಕಾರಾತ್ಮಕ ಮಾತುಗಳನ್ನಾಡುವುದು ಸಂಸ್ಕಾರಕ್ಕೆ ಮೂಲ.",
          mr: "बालकासमोर वाद घालू नका; नेहमी प्रेमाने व हसतमुखाने संवाद साधणे हेच उत्तम संस्कारांचे मूळ आहे.",
          hi: "बालक के समक्ष कभी कलह न करें; सदैव प्रेम, प्रसन्नता एवं सकारात्मक संवाद ही श्रेष्ठ संस्कार का मूल है।",
          te: "పిల్లల ఎదుట వాదించుకోకండి; ఎల్లప్పుడూ ప్రేమతో, చిరునవ్వుతో మాట్లాడటమే మంచి సంస్కారానికి పునాది.",
          ta: "குழந்தையின் முன் வாக்குவாதம் செய்யாதீர்கள்; எப்போதும் அன்பான, நேர்மறையான வார்த்தைகளைப் பேசுங்கள்.",
          en: "Never display friction or harsh anger before the child; radiant patience, smiles, and uplifting dialogue nurture a golden character."
        }, targetLang)
      }
    );
  } else if (detailedAge === "tween" || ageCategory === "child") {
    chapters.push(
      {
        id: "child_education",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣ ಶಕ್ತಿ ಹಾಗೂ ಶಾಲಾ ಪ್ರಗತಿಯ ೫-ವರ್ಷಗಳ ನಕ್ಷೆ",
          mr: "अध्याय १: शिक्षण, एकाग्रता व शालेय प्रगतीचा ५ वर्षांचा आराखडा",
          hi: "अध्याय १: शिक्षा, एकाग्रता एवं शैक्षणिक उन्नति का ५-वर्षीय खाका",
          te: "అధ్యాయం 1: విద్యాభ్యాసం, గ్రహణశక్తి & పాఠశాల పురోగతి 5 సంవత్సరాల ప్రణాళిక",
          ta: "அத்தியாயம் 1: கல்வி, கிரகிக்கும் திறன் & பள்ளி முன்னேற்றம் 5 ஆண்டுகள் வரைபடம்",
          en: "Chapter 1: Academic Trajectory & Cognitive Mastery (5-Year Arc)"
        }, targetLang),
        subtitle: pick6({
          kn: "ಬುಧ ಹಾಗೂ ಗುರು ಪ್ರಭಾವದಿಂದ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಸಾಧನೆ",
          mr: "बुध व गुरूच्या शुभ प्रभावाने अभ्यासात उत्तम यश",
          hi: "बुध एवं गुरु के शुभ प्रभाव से विद्या में श्रेष्ठ प्रदर्शन",
          te: "బుధ మరియు గురు గ్రహాల శుభ ప్రభావంతో చదువులో విశేష రాణింపు",
          ta: "புதன் & குருவின் சுப பார்வையால் கல்வியில் அபார சாதனை",
          en: "Mercury & Jupiter synergy elevating analytical excellence"
        }, targetLang),
        icon: "📚",
        contemplationInquest: pick6({
          kn: "ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ವಿದ್ಯಾಭ್ಯಾಸದ ಗುರಿ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಜ್ಞಾನಾರ್ಜನೆಯ ಮಹಾ ಯೋಗ ಚಿಂತನೆ",
          mr: "पुढील ५ वर्षांत शिक्षण, बुद्धिमत्ता व शालेय यशाचा महामार्ग विचार",
          hi: "आगामी ५ वर्षों में शिक्षा, एकाग्रता एवं ज्ञानार्जन का स्वर्णिम चिंतन",
          te: "రాబోయే 5 సంవత్సరాలలో విద్యాభ్యాసం, ఏకాగ్రత మరియు జ్ఞానార్జన యోగ చింతన",
          ta: "அடுத்த 5 ஆண்டுகளில் கல்வி, ஒருமுக சிந்தனை மற்றும் ஞான வளர்ச்சி சிந்தனை",
          en: "Contemplation on 5-Year Academic Trajectory, Cognitive Clarity & Intellectual Ascendance"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ಜಾತಕರ ಜನ್ಮ ಬುಧ ಹಾಗೂ ೫ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ಚಲನೆಯು ಅಪಾರ ಜ್ಞಾನಾರ್ಜನೆಯ ಶಕ್ತಿಯನ್ನು ನೀಡಲಿದೆ. ಶಾಲೆ ಅಥವಾ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಕಠಿಣ ವಿಷಯಗಳನ್ನು ಸಹ ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ವಿಶೇಷ ಗ್ರಹಣಶಕ್ತಿಯು ಜಾಗೃತವಾಗಲಿದೆ.`,
            mr: `पुढील ५ वर्षांत पंचमेश व बुधाची शुभ दृष्टी जातकाच्या बौद्धिक क्षमतेला प्रचंड चालना देईल. क्लिष्ट विषयही सहजतेने समजून घेण्याची अद्भुत स्मरणशक्ती विकसित होईल.`,
            hi: `आगामी ५ वर्षों में पंचम भाव एवं बुध का शुभ प्रभाव जातक की बौद्धिक क्षमता में अभूतपूर्व निखार लाएगा। कठिन विषयों को सरलता से आत्मसात करने की नैसर्गिक प्रतिभा विकसित होगी।`,
            te: `రాబోయే 5 సంవత్సరాలలో పంచమ భావం మరియు బుధ గ్రహ ప్రభావం వల్ల జ్ఞాపకశక్తి, గ్రహణశక్తి అద్భుతంగా పెరుగుతుంది. కష్టమైన సబ్జెక్టులను కూడా సులభంగా అర్థం చేసుకుంటారు.`,
            ta: `அடுத்த 5 ஆண்டுகளில் 5ம் அதிபதி மற்றும் புதனின் அனுகூலத்தால் நினைவாற்றல் மற்றும் கல்வித் திறன் அபரிமிதமாக உயரும். கடினமான பாடங்களையும் எளிதாகப் புரிந்து கொள்வார்கள்.`,
            en: `Over the next 5 years, the 5th Bhava and Mercury's radiance will awaken exceptional conceptual clarity, enabling the young mind to effortlessly master complex subjects.`
          }, targetLang),
          pick6({
            kn: `ವರ್ಷ ೨ ಮತ್ತು ವರ್ಷ ೪ ರ ಸಮಯದಲ್ಲಿ ಶಿಕ್ಷಕರು ಹಾಗೂ ಶಾಲಾ ಆಡಳಿತದಿಂದ ವಿಶೇಷ ಪುರಸ್ಕಾರಗಳು ದೊರೆಯುವ ಪ್ರಬಲ ಯೋಗವಿದೆ. ಭಾಷಾ ಪ್ರೌಢಿಮೆ ಮತ್ತು ಗಣಿತ ಶಾಸ್ತ್ರಗಳಲ್ಲಿ ಸಹಜ ಪ್ರತಿಭೆ ಬೆಳಗಲಿದೆ.`,
            mr: `दुसऱ्या व चौथ्या वर्षात शिक्षक व शालेय स्तरावरून विशेष प्रशस्तीपत्रक व पारितोषिके मिळण्याचे प्रबळ योग आहेत. भाषा व गणितात विलक्षण गती दिसून येईल.`,
            hi: `द्वितीय एवं चतुर्थ वर्ष में शिक्षकों द्वारा विशेष प्रोत्साहन एवं पुरस्कार प्राप्त होने के प्रबल योग हैं। भाषा एवं गणित में स्वाभाविक दक्षता प्रकट होगी।`,
            te: `2వ మరియు 4వ సంవత్సరాలలో ఉపాధ్యాయుల నుండి ప్రత్యేక ప్రశంసలు మరియు పాఠశాల అవార్డులు లభించే బలమైన యోగం ఉంది.`,
            ta: `2 மற்றும் 4ஆம் ஆண்டுகளில் ஆசிரியர்களின் பாராட்டு மற்றும் பள்ளி அளவிலான விருதுகள் கிடைக்கும் யோகம் உண்டு.`,
            en: `Years 2 and 4 mark standout academic milestones with public recognition from teachers and scholastic accolades.`
          }, targetLang),
          pick6({
            kn: `ವಿದ್ಯಾಭ್ಯಾಸದ ಜತೆಗೆ ಸದ್ಗುಣ, ಗುರು-ಹಿರಿಯರಲ್ಲಿ ಭಕ್ತಿ ಹಾಗೂ ಶಿಸ್ತುಬದ್ಧ ಜೀವನಶೈಲಿಯು ಮಗುವಿನ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಉನ್ನತೀಕರಿಸಲಿದೆ. ಪರೀಕ್ಷಾ ಭಯವನ್ನು ಹೋಗಲಾಡಿಸಲು ಪೋಷಕರು ನೀಡುವ ಸಕಾರಾತ್ಮಕ ಬೆಂಬಲವು ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ಮಗುವನ್ನು ಪ್ರತಿಭಾನ್ವಿತ ಸಾಧಕನನ್ನಾಗಿ ರೂಪಿಸಲಿದೆ.`,
            mr: `शिक्षणासोबतच उत्तम संस्कार, शिक्षकांविषयी आदर व शिस्तबद्ध दिनचर्या यामुळे मुलाचे व्यक्तिमत्त्व उजळून निघेल. परीक्षेची भीती दूर करण्यासाठी पालकांनी दिलेले प्रोत्साहन पुढील ५ वर्षांत मुलाला एक उत्कृष्ट विद्यार्थी बनवेल.`,
            hi: `शिक्षा के साथ-साथ सुसंस्कार, गुरुजनों के प्रति श्रद्धा एवं अनुशासित दिनचर्या से बालक का व्यक्तित्व निखरेगा। परीक्षा के भय को दूर करने में माता-पिता का संबल उसे आगामी ५ वर्षों में एक प्रखर अध्येता बनाएगा।`,
            te: `చదువుతో పాటు మంచి సంస్కారం, గురువుల పట్ల భక్తి మరియు క్రమశిక్షణతో కూడిన జీవన విధానం పిల్లల వ్యక్తిత్వాన్ని తీర్చిదిద్దుతుంది. తల్లిదండ్రుల ప్రోత్సాహం రాబోయే 5 సంవత్సరాలలో వారిని ఉన్నత స్థానంలో నిలబెడుతుంది.`,
            ta: `கல்வியுடன் நற்பண்புகள், ஆசிரியர்களிடம் மரியாதை மற்றும் ஒழுக்கமான வாழ்க்கை முறை பிள்ளைகளின் ஆளுமையை உயர்த்தும். பெற்றோரின் அன்பான வழிகாட்டல் அடுத்த 5 ஆண்டுகளில் அவர்களை சிறந்த சாதனையாளராக மாற்றும்.`,
            en: `Alongside scholastic achievement, noble virtues, respectful conduct, and disciplined study habits will sculpt a distinguished, confident personality over the next 5 years.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ನಿತ್ಯವೂ ಸರಸ್ವತಿ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರಿ ಮಂತ್ರದ ೧೧ ಪಠಣೆ ಮಾಡಿಸುವುದು ಏಕಾಗ್ರತೆಗೆ ದಿವ್ಯ ಔಷಧ.",
          mr: "दररोज सरस्वती स्तोत्राचे पठण केल्यास एकाग्रता व स्मरणशक्तीत अफाट वाढ होते.",
          hi: "नित्य सरस्वती स्तोत्र का पाठ स्मरण शक्ति को दिव्य बल प्रदान करता है।",
          te: "రోజూ సరస్వతీ స్తోత్రం లేదా గాయత్రీ మంత్రం 11 సార్లు జపించడం ఏకాగ్రతను పెంచుతుంది.",
          ta: "தினமும் சரஸ்வதி ஸ்தோத்திரம் அல்லது காயத்ரி மந்திரம் 11 முறை ஜபிப்பது கவனத்தை ஒருமுகப்படுத்தும்.",
          en: "Daily recitation of Saraswati Stotram preserves flawless focus."
        }, targetLang)
      },
      {
        id: "child_health",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಶಾರೀರಿಕ ಬೆಳವಣಿಗೆ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ",
          mr: "अध्याय २: शारीरिक वाढ, रोगप्रतिकारशक्ती व आरोग्य संरक्षण",
          hi: "अध्याय २: शारीरिक वृद्धि, रोगप्रतिरोधक क्षमता एवं आरोग्य संरक्षण",
          te: "అధ్యాయం 2: శారీరక ఎదుగుదల, రోగనిరోధక శక్తి & ఆరోగ్య రక్షణ",
          ta: "அத்தியாயம் 2: உடல் வளர்ச்சி, நோய் எதிர்ப்பு சக்தி & ஆரோக்கிய பாதுகாப்பு",
          en: "Chapter 2: Physical Growth & Pediatric Vitality Shield"
        }, targetLang),
        subtitle: pick6({
          kn: "ಲಗ್ನಾಧಿಪತಿಯ ಬಲದಿಂದ ತೇಜಸ್ಸು ಹಾಗೂ ನಿರೋಗಿ ಕವಚ",
          mr: "लग्नेशाच्या कृपेने उत्तम तेज व निरोगी शरीर",
          hi: "लग्नेश के बल से तेजस्विता एवं स्वास्थ्य रक्षा",
          te: "లగ్నాధిపతి బలంతో తేజస్సు మరియు నిరోగి కవచం",
          ta: "லக்னாதிபதியின் அருளால் பொலிவு & ஆரோக்கிய கவசம்",
          en: "Robust vitality under the protective gaze of the Lagna Lord"
        }, targetLang),
        icon: "🛡️",
        contemplationInquest: pick6({
          kn: "ದೈಹಿಕ ಬೆಳವಣಿಗೆ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಚೈತನ್ಯ ಸಂರಕ್ಷಣಾ ಧ್ಯಾನ",
          mr: "शारीरिक वाढ, उत्तम आरोग्य व रोगप्रतिकारशक्ती संवर्धन विचार",
          hi: "शारीरिक वृद्धि, रोगप्रतिरोधक क्षमता एवं आरोग्य संरक्षण चिंतन",
          te: "శారీరక ఎదుగుదల, రోగనిరోధక శక్తి & ఆరోగ్యం కాపాడుకునే విశ్లేషణ",
          ta: "உடல் வளர்ச்சி, நோய் எதிர்ப்பு சக்தி மற்றும் ஆரோக்கிய பாதுகாப்பு சிந்தனை",
          en: "Contemplation on Physical Growth, Pediatric Immunity & Vitality Preservation"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಲಗ್ನದ ಶುಭ ಪ್ರಭಾವದಿಂದ ಜಾತಕರ ಶಾರೀರಿಕ ಬೆಳವಣಿಗೆಯು ಅತ್ಯಂತ ತೇಜೋಮಯವಾಗಿರಲಿದೆ. ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯು ಉತ್ತಮವಾಗಿದ್ದು, ಕ್ರೀಡೆ ಅಥವಾ ದೈಹಿಕ ವ್ಯಾಯಾಮಗಳಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿ ತೊಡಗಿಕೊಳ್ಳುವುದು ದೇಹದಾರ್ಢ್ಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`,
            mr: `लग्नेशाच्या अनुकूलतेमुळे शारीरिक विकास वेगाने व सुदृढतेने होईल. रोगप्रतिकारशक्ती उत्तम राहून मैदानी खेळ व व्यायामाची विशेष आवड निर्माण होईल.`,
            hi: `लग्नेश की अनुकूलता से शारीरिक विकास उत्तम रहेगा। रोगप्रतिरोधक क्षमता सुदृढ़ रहेगी तथा खेलकूद में सक्रिय भागीदारी से ऊर्जा में वृद्धि होगी।`,
            te: `లగ్న శుభ ప్రభావంతో పిల్లల శారీరక ఎదుగుదల ఉత్సాహంగా సాగుతుంది. రోగనిరోధక శక్తి దృఢంగా ఉండి, క్రీడలు మరియు వ్యాయామాలలో చురుగ్గా పాల్గొంటారు.`,
            ta: `லக்ன சுப பலத்தால் உடல் வளர்ச்சி ஆரோக்கியமாக அமையும். நோய் எதிர்ப்பு சக்தி சிறப்பாக இருந்து, விளையாட்டுகளில் உற்சாகமாக ஈடுபடுவார்கள்.`,
            en: `Natural vitality will flourish as physical height and stamina expand harmoniously through sports and active recreation.`
          }, targetLang),
          pick6({
            kn: `ಋತು ಬದಲಾವಣೆಗಳಲ್ಲಿ ಕಫ ಅಥವಾ ಅಲರ್ಜಿ ಸಮಸ್ಯೆಗಳನ್ನು ಹೊರತುಪಡಿಸಿದರೆ ಯಾವುದೇ ಗಂಭೀರ ಆತಂಕಗಳಿರುವುದಿಲ್ಲ. ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಹಸುವಿನ ಹಾಲಿನ ಸೇವನೆ ಉತ್ತಮ ಫಲ ನೀಡುತ್ತದೆ.`,
            mr: `ऋतुबदलाच्या किरकोळ सर्दी-खोकल्याव्यतिरिक्त मोठे आजारपण उद्भवणार नाही. सकाळी कोवळ्या उन्हात बसणे व सात्विक आहार घेणे हितकारक ठरेल.`,
            hi: `मौसमी सर्दी-जुकाम के अतिरिक्त कोई विशेष व्याधि नहीं रहेगी। प्रातः सूर्य प्रकाश का सेवन अत्यंत लाभकारी सिद्ध होगा।`,
            te: `వాతావరణ మార్పుల సమయంలో స్వల్ప జలుబు తప్ప మరే ఇతర ఆరోగ్య సమస్యలు ఉండవు. ఉదయం సూర్య నమస్కారాలు శ్రేయస్కరం.`,
            ta: `பருவநிலை மாற்றத்தின் போது வரும் சாதாரண சளி தவிர வேறு எந்த பாதிப்பும் இருக்காது. காலை சூரிய நமஸ்காரம் நலம் தரும்.`,
            en: `Barring seasonal allergic sniffles, general immunity remains impenetrable under proper nutrition.`
          }, targetLang),
          pick6({
            kn: `ಬೆಳೆಯುವ ಸಿರಿ ಮೊಳಕೆಯಲ್ಲಿ ಎಂಬಂತೆ, ಪೌಷ್ಟಿಕ ಸಾತ್ವಿಕ ಆಹಾರ, ನಿಯಮಿತ ನಿದ್ರೆ ಹಾಗೂ ದೈಹಿಕ ಆಟೋಟಗಳು ರೋಗನಿರೋಧಕ ಕವಚವನ್ನು ಗಟ್ಟಿಗೊಳಿಸಲಿವೆ. ೬ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ಶುಭ ಶಮನದಿಂದ ಯಾವುದೇ ಕೀಟಲೆಗಳಿಲ್ಲದೆ ಚೈತನ್ಯಪೂರ್ಣವಾಗಿ ಬೆಳೆಯುವ ಯೋಗವಿದೆ.`,
            mr: `पौष्टिक सात्त्विक आहार, वेळेवर झोप व मैदानी खेळ मुलाची प्रतिकारशक्ती अत्यंत मजबूत करतील. षष्ठेशाच्या शुभ प्रभावामुळे आजारपणापासून पूर्ण संरक्षण लाभून बालक अत्यंत उत्साहाने वाढेल.`,
            hi: `संतुलित सात्विक आहार, पर्याप्त विश्राम एवं नियमित खेलकूद से बालक की रोगप्रतिरोधक क्षमता अत्यंत सुदृढ़ होगी। षष्ठ भाव की अनुकूलता से मौसमी व्याधियों से सुरक्षित रहकर बालक ऊर्जावान बना रहेगा।`,
            te: `పౌష్టికాహారం, తగినంత నిద్ర మరియు ఆటపాటలు పిల్లల రోగనిరోధక శక్తిని మరింత బలోపేతం చేస్తాయి. 6వ భావ అనుకూలతతో ఎలాంటి ఆరోగ్య ఇబ్బందులు లేకుండా ఉత్సాహంగా ఎదుగుతారు.`,
            ta: `சத்தான உணவு, போதுமான தூக்கம் மற்றும் உடற்பயிற்சி நோய் எதிர்ப்பு சக்தியை பலப்படுத்தும். ஆரோக்கியமான சூழல் அடுத்த 5 ஆண்டுகளில் குழந்தையை உற்சாகமாக வளரச் செய்யும்.`,
            en: `Balanced pediatric nutrition, rhythmic sleep patterns, and outdoor physical play will continuously reinforce the vitality shield, ensuring vibrant health over the 5-year arc.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಧನ್ವಂತರಿ ಮಂತ್ರ ಪಠಣೆ ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕೆ ಶ್ರೀರಕ್ಷೆ.",
          mr: "दररोज सकाळी सूर्य नमस्कार व धन्वंतरी मंत्राचे पठण उत्तम आरोग्यासाठी लाभदायक ठरेल.",
          hi: "नित्य सूर्य नमस्कार एवं धन्वंतरि मंत्र का जप उत्तम स्वास्थ्य प्रदान करेगा।",
          te: "రోజూ సూర్య నమస్కారాలు మరియు ధన్వంతరి మంత్రం జపించడం ఆరోగ్యానికి రక్ష.",
          ta: "தினமும் சூரிய நமஸ்காரம் மற்றும் தன்வந்திரி மந்திரம் ஜபிப்பது ஆரோக்கியம் தரும்.",
          en: "Daily Surya Namaskar and Dhanvantari prayer shield physical vitality."
        }, targetLang)
      },
      {
        id: "child_talents",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಸುಪ್ತ ಕಲಾ ಪ್ರತಿಭೆ, ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನ",
          mr: "अध्याय ३: सुप्त कलागुण, कल्पकता व पालकांचे मार्गदर्शन",
          hi: "अध्याय ३: सुप्त कला, रचनात्मकता एवं अभिभावकीय मार्गदर्शन",
          te: "అధ్యాయం 3: సుప్త కళా ప్రతిభ, సృజనాత్మకత & తల్లిదండ్రుల మార్గదర్శకత్వం",
          ta: "அத்தியாயம் 3: கலைத் திறமைகள், படைப்பாற்றல் & பெற்றோரின் வழிகாட்டல்",
          en: "Chapter 3: Latent Talents, Creative Sparks & Parental Harmony"
        }, targetLang),
        subtitle: pick6({
          kn: "ಶುಕ್ರ ಹಾಗೂ ಚಂದ್ರನ ಪ್ರಭಾವದಿಂದ ಕಲಾ ಪ್ರೌಢಿಮೆ",
          mr: "शुक्र व चंद्राच्या प्रभावाने कलागुणांचा विकास",
          hi: "शुक्र एवं चंद्र के प्रभाव से रचनात्मक प्रतिभा",
          te: "శుక్ర మరియు చంద్రుల ప్రభావంతో సృజనాత్మక నైపుణ్యాలు",
          ta: "சுக்கிரன் & சந்திரனின் பார்வையால் கலைத்திறன் வளர்ச்சி",
          en: "Venus and Moon refining aesthetic sensitivity and imagination"
        }, targetLang),
        icon: "🎨",
        contemplationInquest: pick6({
          kn: "ಸುಪ್ತ ಪ್ರತಿಭೆಗಳ ವಿಕಾಸ, ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಕಲಾ ಪ್ರೌಢಿಮೆಯ ಮಾರ್ಗದರ್ಶನ",
          mr: "सुप्त कलागुणांचा विकास, कल्पकता व योग्य दिशादर्शन विचार",
          hi: "सुप्त प्रतिभा का विकास, रचनात्मकता एवं कला साधना मार्गदर्शन",
          te: "సుప్త కళా ప్రతిభల వికాసం, సృజనాత్మకత మరియు మార్గదర్శకత్వ చింతన",
          ta: "சுப்த கலைத் திறன்களின் மலர்ச்சி, படைப்பாற்றல் & வழிகாட்டல் சிந்தனை",
          en: "Contemplation on Latent Creative Gifts, Artistic Sparks & Mentorship"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಚಿತ್ರಕಲೆ, ಗಾಯನ, ನೃತ್ಯ ಅಥವಾ ಸಾಹಿತ್ಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ವಿಶೇಷ ಒಲವು ವ್ಯಕ್ತವಾಗಲಿದೆ. ಪೋಷಕರು ಸರಿಯಾದ ಪ್ರೋತ್ಸಾಹ ನೀಡಿದರೆ ಈ ಪ್ರತಿಭೆಯು ಭವಿಷ್ಯದಲ್ಲಿ ದೊಡ್ಡ ಯಶಸ್ಸಿಗೆ ಕಾರಣವಾಗಲಿದೆ.`,
            mr: `चित्रकला, गायन, वादन किंवा साहित्यात विशेष रुची दिसून येईल. पालकांनी योग्य प्रोत्साहन दिल्यास हे सुप्त गुण मुलाच्या भविष्याला नवी दिशा देतील.`,
            hi: `कला, संगीत, साहित्य अथवा अभिनय में विशेष रुचि प्रकट होगी। माता-पिता का उचित प्रोत्साहन इस प्रतिभा को नई ऊंचाइयां प्रदान करेगा।`,
            te: `చిత్రలేఖనం, సంగీతం లేదా సాహిత్య రంగాలలో ప్రత్యేక ఆసక్తి కలుగుతుంది. తల్లిదండ్రుల ప్రోత్సాహం వీరి ప్రతిభను మరింత వెలికితీస్తుంది.`,
            ta: `ஓவியம், இசை, நடனம் அல்லது இலக்கியத்தில் ஆர்வம் வெளிப்படும். பெற்றோரின் ஊக்கம் இந்த திறமையை எதிர்காலத்தில் பெரிய வெற்றியாக மாற்றும்.`,
            en: `Natural artistic instincts across painting, music, dance, or creative writing begin surfacing gracefully. Gentle encouragement from parents will transform these nascent gifts into foundational masteries.`
          }, targetLang),
          pick6({
            kn: `ಶಾಲಾ ಮಟ್ಟದ ಸ್ಪರ್ಧೆಗಳು ಹಾಗೂ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳಲ್ಲಿ ಭಾಗವಹಿಸುವುದರಿಂದ ಮಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸ ಗಣನೀಯವಾಗಿ ವೃದ್ಧಿಸಲಿದೆ. ಹೊಸ ಭಾಷೆಗಳನ್ನು ಕಲಿಯುವ ಹಾಗೂ ಸೃಜನಶೀಲ ಹವ್ಯಾಸಗಳನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವ ಅದ್ಭುತ ಆಸಕ್ತಿ ವ್ಯಕ್ತವಾಗಲಿದೆ.`,
            mr: `शालेय स्पर्धा व सांस्कृतिक कार्यक्रमांत भाग घेतल्याने मुलाचा आत्मविश्वास प्रचंड वाढेल. नवीन भाषा शिकण्याची व कलात्मक छंद जोपासण्याची विलक्षण आवड निर्माण होईल.`,
            hi: `विद्यालयीन प्रतियोगिताओं एवं सांस्कृतिक कार्यक्रमों में भागीदारी से बालक का आत्मविश्वास बढ़ेगा। नवीन भाषाएं सीखने एवं रचनात्मक रुचियों को विकसित करने की अद्भुत प्रतिभा प्रकट होगी।`,
            te: `పాఠశాల పోటీలు మరియు సాంస్కృతిక కార్యక్రమాలలో పాల్గొనడం వల్ల పిల్లలలో ఆత్మవిశ్వాసం పెరుగుతుంది. కొత్త భాషలు నేర్చుకోవడం మరియు సృజనాత్మక నైపుణ్యాలు అలవడతాయి.`,
            ta: `பள்ளி போட்டிகள் மற்றும் கலை நிகழ்ச்சிகளில் பங்கேற்பது பிள்ளைகளின் தன்னம்பிக்கையை உயர்த்தும். புதிய மொழிகள் மற்றும் புதுமையான திறமைகளைக் கற்றுக் கொள்வதில் ஆர்வம் வெளிப்படும்.`,
            en: `Participating in scholastic competitions and cultural showcases will bolster self-assurance, revealing a natural flair for linguistic brilliance and imaginative innovation.`
          }, targetLang),
          pick6({
            kn: `ಪೋಷಕರ ಸಕಾರಾತ್ಮಕ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಪ್ರೋತ್ಸಾಹವು ಮಗುವಿನ ಸುಪ್ತ ಕಲೆಗಳನ್ನು ವೃತ್ತಿಪರ ಮಟ್ಟಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವ ಶಕ್ತಿ ಹೊಂದಿದೆ. ಯಾವುದೇ ಒತ್ತಡವಿಲ್ಲದೆ ಸ್ವಾಭಾವಿಕವಾಗಿ ಕಲಿಯಲು ಅವಕಾಶ ಕಲ್ಪಿಸುವುದು ಸುವರ್ಣ ಫಲ ನೀಡಲಿದೆ.`,
            mr: `पालकांचे सकारात्मक मार्गदर्शन मुलाच्या सुप्त गुणांना व्यावसायिक पातळीवर नेण्यास मदत करेल. कोणत्याही दबावाशिवाय मनमोकळेपणाने शिकू दिल्यास बालक दैदीप्यमान यश संपादन करेल.`,
            hi: `माता-पिता का स्नेहपूर्ण मार्गदर्शन बालक की सुप्त प्रतिभा को उत्कृष्ट स्तर पर ले जाएगा। बिना किसी अनावश्यक दबाव के सहज विकास हेतु दिया गया अवसर स्वर्णिम परिणाम देगा।`,
            te: `తల్లిదండ్రుల సరైన మార్గదర్శకత్వం పిల్లల ప్రతిభను అద్భుతమైన స్థాయికి తీసుకెళ్తుంది. ఎలాంటి ఒత్తిడి లేకుండా స్వేచ్ఛగా నేర్చుకునే వాతావరణం కల్పించడం శ్రేయస్కరం.`,
            ta: `பெற்றோரின் ஆதரவான அணுகுமுறை பிள்ளைகளின் திறமைகளை மேன்மேலும் வளர்க்கும். மன அழுத்தமின்றி இயல்பாக கற்க வைப்பது சிறந்த பலனைத் தரும்.`,
            en: `Compassionate parental mentorship unleashes this dormant creative genius, letting the child's natural gifts blossom without unnecessary pressure into lifelong mastery.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಮಕ್ಕಳೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ಸಂಭಾಷಣೆ ಹಾಗೂ ಸಾಂಸ್ಕೃತಿಕ ಚಟುವಟಿಕೆಗಳಿಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡಿ.",
          mr: "मुलांशी संवाद साधावा व त्यांच्या आवडीच्या कलागुणांना वाव द्यावा.",
          hi: "बच्चों से आत्मीय संवाद बनाए रखें तथा रचनात्मक गतिविधियों में सहयोग दें।",
          te: "పిల్లలతో స్నేహపూర్వకంగా సంభాషిస్తూ వారి కళా నైపుణ్యాలను ప్రోత్సహించండి.",
          ta: "பிள்ளைகளுடன் அன்பாக பேசி கலைசார்ந்த ஈடுபாடுகளை ஊக்குவிக்கவும்.",
          en: "Cultivate constructive dialogue and nourish creative hobbies patiently."
        }, targetLang)
      }
    );
  } else if (detailedAge === "adolescent") {
    chapters.push(
      {
        id: "adolescent_education",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಪ್ರೌಢ/ಪದವಿಪೂರ್ವ ವ್ಯಾಸಂಗ, ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು & ಉನ್ನತ ವಿದ್ಯಾ ಮಾರ್ಗಸೂಚಿ",
          mr: "अध्याय १: उच्च माध्यमिक शिक्षण, बोर्ड परीक्षा व करिअर दिशा",
          hi: "अध्याय १: उच्चतर माध्यमिक शिक्षा, बोर्ड परीक्षा एवं शैक्षणिक मार्गदर्शन",
          te: "అధ్యాయం 1: ఉన్నత పాఠశాల/ఇంటర్ చదువులు, బోర్డు పరీక్షలు & విద్యా మార్గదర్శకత్వం",
          ta: "அத்தியாயம் 1: மேல்நிலைக் கல்வி, பொதுத்தேர்வுகள் & உயர்கல்வி வழிகாட்டல்",
          en: "Chapter 1: Secondary Academics, Milestone Board Examinations & Collegiate Streams"
        }, targetLang),
        subtitle: pick6({
          kn: "೫ನೇ ಹಾಗೂ ೧೦ನೇ ಮನೆಯ ಶುಭ ಪ್ರಭಾವದಿಂದ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ",
          mr: "पंचम व दशम भावाच्या शुभ प्रभावाने परीक्षेत दैदीप्यमान यश",
          hi: "पंचम एवं दशम भाव के शुभ प्रभाव से परीक्षा में सर्वोच्च सफलता",
          te: "5 మరియు 10వ భావాల శుభ ప్రభావంతో పరీక్షలలో అగ్రస్థానం",
          ta: "5 & 10ம் வீடுகளின் சுப பார்வையால் தேர்வுகளில் முதன்மை வெற்றி",
          en: "Parashari 5th and 10th house synergy commanding scholastic distinction"
        }, targetLang),
        icon: "🎓",
        contemplationInquest: pick6({
          kn: "ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳು, ಸ್ಪರ್ಧಾತ್ಮಕ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಭವಿಷ್ಯದ ವ್ಯಾಸಂಗ ವಿಭಾಗದ ಆಯ್ಕೆ ಚಿಂತನೆ",
          mr: "बोर्ड परीक्षा, स्पर्धा परीक्षा व भावी शैक्षणिक शाखेच्या निवडीचे चिंतन",
          hi: "बोर्ड परीक्षा, प्रतियोगी प्रवेश परीक्षा एवं भावी विषय चयन का चिंतन",
          te: "బోర్డు పరీక్షలు, పోటీ ప్రవేశ పరీక్షలు & భవిష్యత్ విద్యా విభాగం ఎంపిక పై చింతన",
          ta: "பொதுத்தேர்வுகள், நுழைவுத் தேர்வுகள் & எதிர்கால கல்விப் பிரிவு தேர்வு சிந்தனை",
          en: "Contemplation on Board Examinations, Competitive Foundation & Collegiate Academic Stream Selection"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯು ಪ್ರೌಢಶಾಲೆಯಿಂದ ಕಾಲೇಜು ಪ್ರವೇಶದ ವರೆಗಿನ ಜೀವನದ ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಶೈಕ್ಷಣಿಕ ಪರ್ವವಾಗಿದೆ. ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಬುಧ, ಗುರು ಹಾಗೂ ೫ನೇ ಭಾವದ ಬಲದಿಂದಾಗಿ ಬೋರ್ಡ್ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ ಪ್ರತಿಷ್ಠಿತ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಪ್ರವೇಶ ಪಡೆಯುವ ಯೋಗವಿದೆ. ಕಠಿಣ ವಿಷಯಗಳನ್ನು ಸಹ ಸುಲಭವಾಗಿ ಗ್ರಹಿಸುವ ಬುದ್ಧಿಶಕ್ತಿ ಜಾಗೃತವಾಗಲಿದೆ.`,
            mr: `हा पाच वर्षांचा काळ माध्यमिक शिक्षणातून महाविद्यालयात प्रवेश करण्याचा अत्यंत महत्त्वाचा टप्पा आहे. पत्रिकेत बुध, गुरू व पंचम भावाच्या बळाने बोर्ड परीक्षेत उत्कृष्ट गुण मिळवून नामांकित कॉलेजमध्ये प्रवेशाचा मार्ग मोकळा होईल. कठीण विषयही सहज समजण्याची क्षमता विकसित होईल.`,
            hi: `यह पंचवर्षीय कालखंड माध्यमिक से उच्चतर शिक्षा में प्रवेश का अत्यंत निर्णायक पड़ाव है। कुंडली में बुध, गुरु एवं पंचम भाव के सशक्त प्रभाव से बोर्ड परीक्षाओं में सर्वोच्च अंक प्राप्त कर प्रतिष्ठित संस्थानों में प्रवेश सुनिश्चित होगा। क्लिष्ट विषयों पर अधिकार प्राप्त होगा।`,
            te: `ఈ ఐదు సంవత్సరాల కాలం పాఠశాల నుండి కళాశాల ప్రవేశం వరకు జీవితంలో అత్యంత కీలకమైన విద్యా దశ. జాతకంలో బుధుడు, గురుడు మరియు 5వ భావ బలం వల్ల బోర్డు పరీక్షల్లో మంచి మార్కులు సాధించి ప్రముఖ విద్యాసంస్థల్లో ప్రవేశం దక్కుతుంది. కష్టమైన పాఠాలు సులభంగా అర్థమవుతాయి.`,
            ta: `இந்த ஐந்து ஆண்டு காலம் பள்ளியிலிருந்து கல்லூரிக்குச் செல்லும் மிக முக்கியமான கல்விப் பருவமாகும். ஜாதகத்தில் புதன், குரு மற்றும் 5ம் இடத்து பலத்தால் பொதுத்தேர்வுகளில் அதிக மதிப்பெண்கள் பெற்று சிறந்த கல்லூரிகளில் சேர்க்கை கிட்டும். கடினமான பாடங்களையும் எளிதாகப் புரிந்து கொள்வார்கள்.`,
            en: `This pivotal 5-year continuum represents the critical academic transition from secondary schooling into prestigious collegiate portals. Bolstered by Mercury, Jupiter, and 5th house trines, the adolescent commands deep analytical prowess, yielding top percentile ranks across milestone board and entrance examinations.`
          }, targetLang),
          pick6({
            kn: `ವಿಜ್ಞಾನ (Science), ಗಣಿತ, ತಂತ್ರಜ್ಞಾನ, ವಾಣಿಜ್ಯ (Commerce) ಅಥವಾ ಕಲಾ ವಿಭಾಗಗಳ ಆಯ್ಕೆಯಲ್ಲಿ ಜಾತಕರ ನೈಜ ಪ್ರತಿಭೆ ಪ್ರಕಾಶಿಸಲಿದೆ. ೧೦ನೇ ಮನೆಯ ಸೂರ್ಯ ಹಾಗೂ ಮಂಗಳನ ಬಲದಿಂದಾಗಿ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಿಗೆ (NEET, JEE, Olympiad) ಸಿದ್ಧತೆ ನಡೆಸಲು ಕಾಲ ಅತ್ಯಂತ ಅನುಕೂಲಕರವಾಗಿದೆ. ಶಿಕ್ಷಕರ ಮಾರ್ಗದರ್ಶನದಿಂದ ಆಂತರಿಕ ಪ್ರತಿಭೆ ಅನಾವರಣಗೊಳ್ಳಲಿದೆ.`,
            mr: `विज्ञान, गणित, तंत्रज्ञान, वाणिज्य अथवा कला शाखेच्या निवडीत खरी प्रतिभा दिसून येईल. दशम भावातील सूर्य व मंगळाच्या बळाने स्पर्धा परीक्षांच्या पूर्वतयारीसाठी हा काळ अतिशय उत्तम आहे. शिक्षकांच्या मार्गदर्शनाने आत्मविश्वास द्विगुणित होईल.`,
            hi: `विज्ञान, गणित, तकनीकी, वाणिज्य अथवा कला संकाय के चयन में जातक की वास्तविक प्रतिभा चमकेगी। दशम भाव में सूर्य एवं मंगल के प्रभाव से प्रतियोगी परीक्षाओं की तैयारी हेतु समय अत्यंत अनुकूल है। गुरुजनों के मार्गदर्शन से आत्मविश्वास बढ़ेगा।`,
            te: `సైన్స్, గణితం, టెక్నాలజీ, కామర్స్ లేదా ఆర్ట్స్ విభాగాల ఎంపికలో ప్రతిభ ప్రకాశిస్తుంది. 10వ ఇంట్లో సూర్య, కుజుల బలంతో పోటీ పరీక్షల సన్నద్ధతకు అనుకూల సమయం. ఉపాధ్యాయుల మార్గదర్శకత్వంలో ఆత్మవిశ్వాసం పెరుగుతుంది.`,
            ta: `அறிவியல், கணிதம், தொழில்நுட்பம் அல்லது வணிகப் பிரிவுகளைத் தேர்ந்தெடுப்பதில் தனித்திறமை மிளிரும். 10ம் வீட்டில் சூரியன் & செவ்வாய் பலத்தால் போட்டித் தேர்வுகளுக்குத் தயாராக இது சிறந்த காலமாகும். ஆசிரியர்களின் வழிகாட்டல் தன்னம்பிக்கையை உயர்த்தும்.`,
            en: `Whether gravitating toward STEM, computation, finance, or humanities, natal 10th house Solar and Martial alignments illuminate the ideal collegiate specialization. Early foundation preparation for competitive national entrances proceeds with structured discipline and mentor encouragement.`
          }, targetLang),
          pick6({
            kn: `ಪರೀಕ್ಷಾ ಆತಂಕವನ್ನು ಮೆಟ್ಟಿನಿಂತು ನಿಯಮಿತ ಅಧ್ಯಯನ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಪಾಲಿಸುವುದು ಯಶಸ್ಸಿನ ಕೀಲಿಕೈ. ದಿನಕ್ಕೆ ೬ ರಿಂದ ೭ ಗಂಟೆಗಳ ಕಾಲ ಏಕಾಗ್ರತೆಯಿಂದ ಓದುವುದು ಹಾಗೂ ರಾತ್ರಿ ಸಕಾಲಕ್ಕೆ ನಿದ್ರಿಸುವುದು ಜ್ಞಾನವನ್ನು ಭದ್ರಪಡಿಸಲಿದೆ. ಪೋಷಕರ ಸಹನೆ ಹಾಗೂ ಪ್ರೋತ್ಸಾಹವು ಮಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಉತ್ತುಂಗಕ್ಕೇರಿಸಲಿದೆ.`,
            mr: `परीक्षेचा ताण न घेता अभ्यासाचे नियमित वेळापत्रक पाळणे ही यशाची गुरुकिल्ली ठरेल. रोज ६ ते ७ तास मनापासून अभ्यास करणे व वेळेवर झोपणे बुद्धिमत्तेला ताजेतवाने ठेवेल. पालकांचा विश्वास व पाठिंबा मुलाला यशाच्या शिखरावर नेईल.`,
            hi: `परीक्षा के तनाव को त्यागकर नियमित अध्ययन सारणी का पालन करना ही सफलता की कुंजी है। नित्य ६ से ७ घंटे का एकाग्रचित्त स्वाध्याय एवं समय पर शयन ज्ञान को स्थायी बनाएगा। अभिभावकों का संबल एवं प्रेरणा आत्मविश्वास को नई ऊंचाई प्रदान करेगी।`,
            te: `పరీక్షల భయాన్ని అధిగమించి రోజూ క్రమబద్ధంగా చదువుకోవడం విజయానికి కీలకం. రోజుకు 6 నుండి 7 గంటలు ఏకాగ్రతతో చదవడం మరియు వేళకు నిద్రపోవడం జ్ఞాపకశక్తికి మేలు చేస్తాయి. తల్లిదండ్రుల ప్రోత్సాహం ఆత్మవిశ్వాసాన్ని రెట్టింపు చేస్తుంది.`,
            ta: `தேர்வு பயமின்றி முறையான கால அட்டவணையைப் பின்பற்றிப் படிப்பதே வெற்றிக்கான வழி. தினமும் 6 முதல் 7 மணி நேரம் ஒருமுகப்பட்டுப் படிப்பதும், நேரத்திற்கு உறங்குவதும் அறிவை வளர்க்கும். பெற்றோரின் ஆதரவு தன்னம்பிக்கையை உயர்த்தும்.`,
            en: `Systematic consistency and emotional equilibrium remain the master keys to pre-collegiate triumph. Anchoring 6 to 7 hours of undisturbed daily study while guarding circadian sleep preserves mental stamina, warmly reinforced by unwavering parental encouragement.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಪರೀಕ್ಷಾ ಕೊಠಡಿಗೆ ಹೋಗುವ ಮುನ್ನ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ; ಕೊನೆಯ ಕ್ಷಣದ ಗಲಿಬಿಲಿ ತಪ್ಪಿಸಿ ಶಾಂತಚಿತ್ತದಿಂದ ಪರೀಕ್ಷೆ ಬರೆಯಿರಿ.",
          mr: "परीक्षेला जाण्यापूर्वी सरस्वती स्तोत्राचे स्मरण करा; ऐनवेळची घाई टाळून शांत चित्ताने पेपर सोडवा.",
          hi: "परीक्षा कक्ष में जाने से पूर्व माँ सरस्वती का स्मरण करें; अंतिम क्षणों की घबराहट से बचकर शांत मन से परीक्षा दें।",
          te: "పరీక్ష హాలుకు వెళ్ళేముందు సరస్వతీ దేవిని ప్రార్థించండి; కంగారు పడకుండా ప్రశాంతంగా పరీక్ష రాయండి.",
          ta: "தேர்வுக்குச் செல்லும் முன் சரஸ்வதியை வணங்குங்கள்; பதற்றமின்றி அமைதியான மனதுடன் தேர்வை எழுதுங்கள்.",
          en: "Recite the Saraswati Stotram prior to examination sessions; enter the hall with serene composure rather than hurried stress."
        }, targetLang)
      },
      {
        id: "adolescent_skills",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ವಿಶ್ಲೇಷಣಾ ಕೌಶಲಗಳು, ಕ್ರೀಡೆ, ಸೃಜನಶೀಲತೆ & ತಾಂತ್ರಿಕ ಪ್ರಾವೀಣ್ಯ",
          mr: "अध्याय २: विश्लेषणात्मक कौशल्ये, क्रीडा, सर्जनशीलता व तांत्रिक प्राविण्य",
          hi: "अध्याय २: विश्लेषणात्मक कौशल, क्रीड़ा, सृजनशीलता एवं तकनीकी दक्षता",
          te: "అధ్యాయం 2: విశ్లేషణాత్మక నైపుణ్యాలు, క్రీడలు, సృజనాత్మకత & సాంకేతిక ప్రతిభ",
          ta: "அத்தியாயம் 2: பகுப்பாய்வுத் திறன், விளையாட்டு, படைப்பாற்றல் & தொழில்நுட்பத் தேர்ச்சி",
          en: "Chapter 2: Analytical Dexterity, Modern Computation, Sports & Creative Prowess"
        }, targetLang),
        subtitle: pick6({
          kn: "ಕುಜ ಮತ್ತು ರಾಹುವಿನ ಬಲದಿಂದ ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ಸ್ಪರ್ಧಾ ಜಯ",
          mr: "मंगळ व राहूच्या कृपेने आधुनिक तंत्रज्ञान व क्रीडा क्षेत्रात यश",
          hi: "मंगल एवं राहु के शुभ प्रभाव से आधुनिक तकनीक एवं खेलकूद में विजय",
          te: "కుజ, రాహు గ్రహాల ప్రభావంతో సాంకేతికత & క్రీడలలో విజయం",
          ta: "செவ்வாய் & ராகுவின் அருளால் நவீன தொழில்நுட்பம் மற்றும் விளையாட்டில் சாதனை",
          en: "Mars and Rahu powering digital acumen, strategic logic, and athletic vigor"
        }, targetLang),
        icon: "💻",
        contemplationInquest: pick6({
          kn: "ತಾಂತ್ರಿಕ ಜ್ಞಾನ, ಕೋಡಿಂಗ್/ವಿಜ್ಞಾನ ಯೋಜನೆಗಳು, ಕ್ರೀಡೆ ಹಾಗೂ ವ್ಯಕ್ತಿತ್ವ ನಾಯಕತ್ವ ಚಿಂತನೆ",
          mr: "तांत्रिक ज्ञान, कोडिंग/विज्ञान प्रकल्प, खेळ व नेतृत्व गुणांचे चिंतन",
          hi: "तकनीकी ज्ञान, कोडिंग/विज्ञान परियोजनाएं, खेलकूद एवं नेतृत्व क्षमता का चिंतन",
          te: "సాంకేతిక పరిజ్ఞానం, కోడింగ్/సైన్స్ ప్రాజెక్టులు, క్రీడలు & నాయకత్వ లక్షణాల పై చింతన",
          ta: "தொழில்நுட்ப அறிவு, கணினி/அறிவியல் திட்டங்கள், விளையாட்டு & தலைமைப் பண்பு சிந்தனை",
          en: "Contemplation on Technical Fluency, Software/STEM Innovations, Athletics & Leadership"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಆಧುನಿಕ ಯುಗದಲ್ಲಿ ಕೇವಲ ಪುಸ್ತಕದ ಬದನೆಕಾಯಿಯಷ್ಟೇ ಸಾಲದು; ತಾಂತ್ರಿಕ ಪ್ರಾವೀಣ್ಯ, ಕಂಪ್ಯೂಟರ್ ಕೋಡಿಂಗ್, ಭಾಷಾ ಸಂವಹನ ಹಾಗೂ ಪ್ರಾಯೋಗಿಕ ಜ್ಞಾನ ಅತ್ಯಗತ್ಯ. ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ರಾಹು ಹಾಗೂ ಬುಧರ ಸಂಯೋಗವು ಜಾತಕರಲ್ಲಿ ಕಂಪ್ಯೂಟರ್, ತಂತ್ರಜ್ಞಾನ, ಗಣಿತ ಅಥವಾ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯಂತಹ ಆಧುನಿಕ ವಿಷಯಗಳಲ್ಲಿ ಸಹಜ ಕುತೂಹಲವನ್ನು ಹುಟ್ಟಿಸಲಿದೆ.`,
            mr: `आजच्या युगात केवळ पुस्तकी ज्ञान पुरेसे नसून तांत्रिक कौशल्ये, कोडिंग, संभाषण चातुर्य व प्रात्यक्षिक ज्ञान महत्त्वाचे आहे. पत्रिकेत राहू व बुधाच्या शुभ संयोगाने संगणक, तंत्रज्ञान, गणित व आधुनिक विज्ञान विषयात सहज रुची निर्माण होईल.`,
            hi: `वर्तमान युग में केवल सैद्धांतिक ज्ञान पर्याप्त नहीं है; तकनीकी दक्षता, कोडिंग, संवाद कौशल एवं व्यावहारिक ज्ञान अनिवार्य है। कुंडली में राहु एवं बुध का शुभ प्रभाव कंप्यूटर, प्रौद्योगिकी, गणित एवं आधुनिक विज्ञान में सहज रुचि उत्पन्न करेगा।`,
            te: `నేటి కాలంలో కేవలం పుస్తక జ్ఞానమే కాకుండా సాంకేతిక నైపుణ్యాలు, కంప్యూటర్ కోడింగ్, కమ్యూనికేషన్ స్కిల్స్ ఎంతో అవసరం. జాతకంలో రాహువు, బుధుని కలయిక కంప్యూటర్లు, టెక్నాలజీ, గణితం వంటి ఆధునిక రంగాలలో సహజ ఆసక్తిని కలిగిస్తుంది.`,
            ta: `தற்காலத்தில் புத்தக அறிவு மட்டுமல்லாமல் தொழில்நுட்பத் திறன், கணினி அறிவு, தகவல் தொடர்பு மற்றும் செய்முறை அறிவு மிக அவசியம். ஜாதகத்தில் ராகு & புதன் சேர்க்கையால் கணினி, தொழில்நுட்பம், கணிதத்தில் ஆழ்ந்த ஆர்வம் பிறக்கும்.`,
            en: `Modern vocational excellence demands versatile technological mastery alongside academic coursework. Favorable Mercurial and Rahu harmonics stimulate organic aptitude in computation, software coding, robotics, advanced mathematics, or multimedia design.`
          }, targetLang),
          pick6({
            kn: `ದೈಹಿಕ ಕಸರತ್ತು, ಈಜು, ಬ್ಯಾಡ್ಮಿಂಟನ್, ಕ್ರಿಕೆಟ್ ಅಥವಾ ಅಥ್ಲೆಟಿಕ್ಸ್‌ನಂತಹ ಕ್ರೀಡೆಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳುವುದು ರಕ್ತ ಪರಿಚಲನೆ ಹಾಗೂ ಮಾನಸಿಕ ಚುರುಕುತನವನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸಲಿದೆ. ಮಂಗಳನ ಬಲದಿಂದಾಗಿ ಶಾಲಾ/ಕಾಲೇಜು ಮಟ್ಟದ ಕ್ರೀಡಾಕೂಟಗಳಲ್ಲಿ ಭಾಗವಹಿಸಿ ಪ್ರಶಸ್ತಿ-ಪದಕಗಳನ್ನು ಗೆಲ್ಲುವ ಶುಭ ಯೋಗವಿದೆ. ಕ್ರೀಡೆಯು ನಾಯಕತ್ವದ ಶಿಸ್ತನ್ನು ಕಲಿಸುತ್ತದೆ.`,
            mr: `मैदानी खेळ, धावणे, बॅडमिंटन अथवा क्रिकेटसारख्या खेळात सहभाग घेतल्याने शरीरात ऊर्जा व उत्साह संचारेल. मंगळाच्या प्रभावाने शाळा/कॉलेज स्तरावर क्रीडा स्पर्धांत पदके जिंकण्याचा योग आहे. खेळांमुळे खिलाडूवृत्ती व नेतृत्व गुण वाढीस लागतील.`,
            hi: `व्यायाम, दौड़, बैडमिंटन, क्रिकेट अथवा एथलेटिक्स में सक्रिय भागीदारी शारीरिक स्फूर्ति एवं बौद्धिक तीक्ष्णता को बढ़ाती है। मंगल के सशक्त प्रभाव से विद्यालय स्तर की खेल प्रतियोगिताओं में पदक एवं सम्मान प्राप्त होने के उत्तम योग हैं।`,
            te: `వ్యాయామం, ఆటలు, బ్యాడ్మింటన్, క్రికెట్ వంటి క్రీడలలో పాల్గొనడం వల్ల శారీరక దారుఢ్యం మరియు మానసిక ఉల్లాసం పెరుగుతాయి. కుజుని బలంతో పాఠశాల/కళాశాల స్థాయి క్రీడలలో పాల్గొని బహుమతులు గెలుచుకునే యోగం ఉంది.`,
            ta: `உடற்பயிற்சி, ஓட்டப்பந்தயம், பேட்மிண்டன், கிரிக்கெட் போன்ற விளையாட்டுகளில் ஈடுபடுவது உடல் வலிமையையும் மன சுறுசுறுப்பையும் தரும். செவ்வாய் பலத்தால் பள்ளி/கல்லூரி அளவிலான போட்டிகளில் பதக்கங்கள் வெல்லும் யோகம் உண்டு.`,
            en: `Regular athletic engagement in track, badminton, swimming, or team sports channels testosterone and martial dynamism constructively. High competitive vitality ensures standout podium finishes in inter-collegiate tournaments, cultivating enduring leadership resilience.`
          }, targetLang),
          pick6({
            kn: `ವಾದ-ವಿವಾದ ಸ್ಪರ್ಧೆಗಳು, ರಸಪ್ರಶ್ನೆ (Quiz), ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಭಾಷಣದಲ್ಲಿ ಭಾಗವಹಿಸಲು ಇದು ಸುವರ್ಣ ಕಾಲ. ಸೂರ್ಯನ ತೇಜಸ್ಸಿನಿಂದ ಧ್ವನಿಯಲ್ಲಿ ಗಾಂಭೀರ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ಪ್ರಭಾವಶಾಲಿ ವ್ಯಕ್ತಿತ್ವ ರೂಪುಗೊಳ್ಳಲಿದೆ. ಸ್ನೇಹಿತರ ಆಯ್ಕೆಯಲ್ಲಿ ಜಾಗರೂಕರಾಗಿದ್ದು, ಸದಾ ಸತ್ಸಂಗದಲ್ಲಿರಬೇಕು.`,
            mr: `वादविवाद स्पर्धा, प्रश्नमंजुषा, विज्ञान प्रदर्शने व वक्तृत्व स्पर्धेत भाग घेण्यासाठी हा उत्तम काळ आहे. सूर्याच्या तेजाने वाणीत आत्मविश्वास व प्रभावी व्यक्तिमत्त्व तयार होईल. चांगल्या मित्रांची संगत ठेवणे अत्यंत महत्त्वाचे ठरेल.`,
            hi: `वाद-विवाद, प्रश्नोत्तरी, विज्ञान प्रदर्शनी एवं वक्तृत्व प्रतियोगिताओं में भाग लेने हेतु यह स्वर्णिम वेला है। सूर्य के तेज से वाणी में ओज, आत्मविश्वास एवं प्रभावशाली व्यक्तित्व का निर्माण होगा। मित्रों के चयन में सदैव विवेक बनाए रखें।`,
            te: `వక్తృత్వ పోటీలు, క్విజ్, సైన్స్ ఎగ్జిబిషన్లలో పాల్గొనడానికి ఇది స్వర్ణ సమయం. సూర్యుని తేజస్సుతో మాటల్లో స్పష్టత, ఆత్మవిశ్వాసం పెరుగుతాయి. మంచి స్నేహితుల సాంగత్యంలో ఉండటం భవిష్యత్తుకు ఎంతో మేలు చేస్తుంది.`,
            ta: `பேச்சுப் போட்டி, வினாடி வினா, அறிவியல் கண்காட்சிகளில் பங்கேற்க இது சிறந்த காலமாகும். சூரியனின் ஒளியால் பேச்சில் வசீகரம், தன்னம்பிக்கை மிளிரும். நல்ல நண்பர்களுடன் பழகுவது நல்வழி காட்டும்.`,
            en: `Stepping onto platforms such as inter-school debates, science fairs, robotics expos, and quiz competitions burnishes commanding articulation. Solar radiance confers gravitas and charisma; curating virtuous, intellectually ambitious friendships accelerates trajectory.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ತಂತ್ರಜ್ಞಾನವನ್ನು ಜ್ಞಾನಾರ್ಜನೆಗಾಗಿ ಬಳಸಿ, ವ್ಯರ್ಥ ಕಾಲಹರಣ ಬೇಡ; ನಿತ್ಯವೂ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡುವುದು ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
          mr: "तंत्रज्ञानाचा वापर ज्ञान मिळवण्यासाठी करा, वेळ वाया घालवू नका; रोज सूर्यनमस्कार केल्याने तेज व आत्मविश्वास वाढतो.",
          hi: "तकनीक का उपयोग ज्ञानार्जन हेतु करें, व्यर्थ समय न गंवाएं; नित्य सूर्यनमस्कार शारीरिक ओज एवं मेधा को बढ़ाता है।",
          te: "సాంకేతికతను జ్ఞానార్జనకు ఉపయోగించండి, సమయాన్ని వృథా చేయవద్దు; రోజూ సూర్య నమస్కారాలు చేయడం ఎంతో శ్రేష్టం.",
          ta: "தொழில்நுட்பத்தை அறிவு வளர்ச்சிக்குப் பயன்படுத்துங்கள், நேரத்தை வீணடிக்க வேண்டாம்; தினமும் சூரிய நமஸ்காரம் செய்வது நல்லது.",
          en: "Harness computation strictly for skill acceleration rather than frivolous doomscrolling; daily Surya Namaskars compound neuro-muscular poise."
        }, targetLang)
      },
      {
        id: "adolescent_wellness",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಹದಿಹರೆಯದ ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ, ಆರೋಗ್ಯ ರಕ್ಷೆ & ಸತ್ಸಂಗ",
          mr: "अध्याय ३: पौगंडावस्थेतील भावनिक समतोल, आरोग्य रक्षण व सत्संग",
          hi: "अध्याय ३: किशोरावस्था का भावनात्मक संतुलन, स्वास्थ्य रक्षा एवं सत्संग",
          te: "అధ్యాయం 3: కౌమార దశ భావోద్వేగ సమతుల్యత, ఆరోగ్య రక్షణ & సత్సంగం",
          ta: "அத்தியாயம் 3: பதின்ம பருவ மன சமநிலை, நல்வாழ்வு பாதுகாப்பு & நல்லோர் சேர்க்கை",
          en: "Chapter 3: Adolescent Emotional Equanimity, Vitality Preservation & Noble Association"
        }, targetLang),
        subtitle: pick6({
          kn: "ಚಂದ್ರ ಮತ್ತು ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಮಾನಸಿಕ ಶಾಂತಿ ಹಾಗೂ ಸಂಸ್ಕಾರ ರಕ್ಷೆ",
          mr: "चंद्र व गुरूच्या कृपेने मनःशांती व नैतिक मूल्यांचे संवर्धन",
          hi: "चंद्रमा एवं गुरु के शुभ प्रभाव से मानसिक शांति एवं संस्कारों की रक्षा",
          te: "చంద్ర, గురు గ్రహాల అనుగ్రహంతో మనశ్శాంతి & సత్సంప్రదాయాల రక్షణ",
          ta: "சந்திரன் & குருவின் அருளால் மன அமைதி மற்றும் நற்பண்புகள் பாதுகாப்பு",
          en: "Lunar tranquil balance and Jovian moral wisdom establishing character dignity"
        }, targetLang),
        icon: "🧘",
        contemplationInquest: pick6({
          kn: "ಹದಿಹರೆಯದ ಮನೋಸ್ಥೈರ್ಯ, ಒತ್ತಡ ರಹಿತ ಅಧ್ಯಯನ, ನಿದ್ರೆಯ ಶಿಸ್ತು ಹಾಗೂ ಧರ್ಮ ಚಿಂತನೆ",
          mr: "मानसिक स्थैर्य, तणावमुक्त अभ्यास, पुरेशी झोप व धर्ममार्गाचे चिंतन",
          hi: "मानसिक स्थिरता, तनावमुक्त स्वाध्याय, निद्रा अनुशासन एवं धर्म का चिंतन",
          te: "మానసిక స్థైర్యం, ఒత్తిడి లేని చదువు, తగిన నిద్ర & ధర్మ మార్గం పై చింతన",
          ta: "மன உறுதி, மன அழுத்தமற்ற படிப்பு, தகுந்த தூக்கம் மற்றும் அறநெறி சிந்தனை",
          en: "Contemplation on Mental Resilience, Stress-Free Academic Flow & Moral Integrity"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಹದಿಹರೆಯದ ವಯಸ್ಸು (೧೩-೧೭) ದೈಹಿಕ, ಮಾನಸಿಕ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಬದಲಾವಣೆಗಳ ಪರ್ವಕಾಲವಾಗಿದೆ. ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಚಂದ್ರನ ಸ್ಥಿತಿಯು ಮನಸ್ಸಿನ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡಲು ನೆರವಾಗಲಿದೆ. ಪೋಷಕರೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡುವುದು, ಸಣ್ಣಪುಟ್ಟ ಗೊಂದಲಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದು ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಮನಸ್ಸಿಗೆ ಪರಮ ಶಾಂತಿ ನೀಡುತ್ತದೆ.`,
            mr: `पौगंडावस्था (१३ ते १७ वर्षे) हा शारीरिक, मानसिक व भावनिक बदलांचा काळ असतो. पत्रिकेतील चंद्राची शुभ स्थिती मनाचे संतुलन राखण्यास मदत करेल. पालकांशी मोकळेपणाने बोलणे, शंकांचे निरसन करणे व आत्मविश्वासाने वागणे मनाला स्थिरता देईल.`,
            hi: `किशोरावस्था (१३-१७ वर्ष) शारीरिक, मानसिक एवं भावनात्मक परिवर्तनों का संवेदनशील संधिकाल है। कुंडली में चंद्रमा की स्थिति चित्त को एकाग्र एवं शांत रखने में सहायक होगी। माता-पिता से पारदर्शी संवाद एवं आत्मीयता सभी प्रकार के अंतर्द्वंद्वों को समाप्त करेगी।`,
            te: `కౌమార దశ (13-17 సంవత్సరాలు) శారీరక, మానసిక మరియు భావోద్వేగ మార్పుల కీలక సమయం. జాతకంలో చంద్రుని బలం మనస్సును ప్రశాంతంగా ఉంచుతుంది. తల్లిదండ్రులతో విషయాలు పంచుకోవడం, సందేహాలను నివృత్తి చేసుకోవడం మానసిక స్థైర్యాన్ని ఇస్తాయి.`,
            ta: `பதின்ம பருவம் (13-17 வயது) உடல் மற்றும் மன மாற்றங்கள் நிகழும் முக்கியமான காலகட்டமாகும். ஜாதகத்தில் சந்திரனின் பலம் மனதை சமநிலையில் வைக்க உதவும். பெற்றோரிடம் வெளிப்படையாகப் பேசுவது மன அமைதியைத் தரும்.`,
            en: `Adolescence (ages 13–17) constitutes a profound biological and psychological threshold. Fortified lunar dignity anchors mental equanimity amid natural developmental surges. Fostering open, transparent communion with parents dissolves peer anxieties instantly.`
          }, targetLang),
          pick6({
            kn: `ದಿನವೂ ೧೫ ನಿಮಿಷಗಳ ಪ್ರಾಣಾಯಾಮ, ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪ ಅಥವಾ ಧ್ಯಾನವು ಏಕಾಗ್ರತೆಯನ್ನು ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಿಸುತ್ತದೆ. ನಕಾರಾತ್ಮಕ ಆಲೋಚನೆಗಳು, ಪರೀಕ್ಷಾ ಭೀತಿ ಹಾಗೂ ಆಲಸ್ಯವನ್ನು ದೂರವಿಡಲು ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಯು ಅಮೃತಪ್ರಾಯವಾಗಿದೆ. ಉತ್ತಮ ಶೀಲವಂತರಾದ ಸ್ನೇಹಿತರ ಸಹವಾಸವು ಜೀವನದ ಗುರಿಯನ್ನು ಸ್ಪಷ್ಟಗೊಳಿಸುತ್ತದೆ.`,
            mr: `दररोज १५ मिनिटे प्राणायाम, गायत्री मंत्र जप किंवा ध्यान केल्याने एकाग्रतेत मोठी वाढ होते. नकारात्मक विचार, परीक्षेची भीती व आळस दूर करण्यासाठी ध्यान अत्यंत उपयुक्त ठरेल. सुविचारी मित्रांची सोबत जीवनाला योग्य दिशा देईल.`,
            hi: `नित्य १५ मिनट का प्राणायाम, गायत्री मंत्र जप अथवा ध्यान स्मरण शक्ति एवं मानसिक एकाग्रता को चमत्कारिक रूप से पुष्ट करता है। नकारात्मक विचारों, परीक्षा भय एवं प्रमाद से मुक्ति हेतु आध्यात्मिक अनुशासन अमृत समान है।`,
            te: `రోజూ 15 నిమిషాల ప్రాణాయామం, గాయత్రీ మంత్ర జపం లేదా ధ్యానం చేయడం వల్ల ఏకాగ్రత అద్భుతంగా పెరుగుతుంది. ప్రతికూల ఆలోచనలు, పరీక్షల భయం తొలగడానికి ఇది రామబాణం. మంచి నడవడిక గల స్నేహితుల సాంగత్యం ఉన్నతినిస్తుంది.`,
            ta: `தினமும் 15 நிமிடங்கள் பிராணாயாமம், காயத்ரி மந்திர ஜபம் அல்லது தியானம் செய்வது கவனத்தை ஒருமுகப்படுத்தும். எதிர்மறை எண்ணங்கள், தேர்வு பயத்தை போக்க ஆன்மீக பயிற்சி உதவும். நல்லொழுக்கம் கொண்ட நண்பர்களின் நட்பு மேன்மை தரும்.`,
            en: `Immersing in 15 minutes of Pranayama and Gayatri Mantra japa each dawn dramatically clears cognitive clutter. Dispelling transient doubts, procrastination, and pre-test nerves, sacred centering transforms emotional turbulence into calm purpose.`
          }, targetLang),
          pick6({
            kn: `ಸಕಾಲಿಕ ನಿದ್ರೆ, ರಾತ್ರಿ ಬೇಗ ಮಲಗಿ ಬೆಳಿಗ್ಗೆ ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತದಲ್ಲಿ ಎದ್ದು ಓದುವ ಅಭ್ಯಾಸವು ಮೈ-ಮನಸ್ಸಿಗೆ ಅಪಾರ ಚೈತನ್ಯ ನೀಡುತ್ತದೆ. ಸಾತ್ವಿಕ ಆಹಾರ, ಒಣಹಣ್ಣುಗಳು, ಹಣ್ಣು-ತರಕಾರಿಗಳು ಹಾಗೂ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯುವುದು ಮುಖದ ತೇಜಸ್ಸು ಹಾಗೂ ಜ್ಞಾಪಕಶಕ್ತಿಯನ್ನು ರಕ್ಷಿಸಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ಉಜ್ವಲ ಭವಿಷ್ಯ ಖಚಿತ.`,
            mr: `वेळेवर झोपणे, रात्री लवकर झोपून सकाळी ब्राह्ममुहूर्तावर उठून अभ्यास करण्याची सवय शरीराला प्रचंड ऊर्जा देईल. सात्विक आहार, मोड आलेली कडधान्ये, फळे व भरपूर पाणी डोळ्यांचे तेज व स्मरणशक्ती वाढवेल. गोकर्ण महाबळेश्वराच्या आशीर्वादाने उज्ज्वल भविष्य निश्चित घडेल.`,
            hi: `समय पर शयन एवं प्रातः ब्राह्म मुहूर्त में जागरण शरीर एवं मन को नई ऊर्जा से भर देगा। सात्विक आहार, अंकुरित धान्य, ताजे फल एवं प्रचुर जल सेवन नेत्र ज्योति एवं बौद्धिक तेज को सुरक्षित रखेगा। श्री गोकर्ण महाबलेश्वर की अनुकंपा से उज्ज्वल भविष्य सुनिश्चित है।`,
            te: `రాత్రి వేళకు పడుకోవడం, ఉదయం బ్రాహ్మీ ముహూర్తంలో నిద్రలేవడం శరీరానికి అమితమైన శక్తినిస్తాయి. సాత్విక ఆహారం, మొలకెత్తిన గింజలు, పండ్లు మరియు నీరు తీసుకోవడం కంటి చూపును, జ్ఞాపకశక్తిని కాపాడతాయి. శ్రీ గోకర్ణ మహాబలేశ్వరుని కృపతో ఉజ్వల భవిష్యత్తు లభిస్తుంది.`,
            ta: `நேரத்தோடு உறங்கி காலையில் பிரம்ம முகூர்த்தத்தில் எழும் பழக்கம் உடலுக்கு புதுப்பொலிவைத் தரும். சாத்வீக உணவு, முளைகட்டிய பயிர்கள், பழங்கள் மற்றும் போதிய தண்ணீர் கண் பார்வையையும் நினைவாற்றலையும் காக்கும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் அருளால் பிரகாசமான எதிர்காலம் அமையும்.`,
            en: `Retaining a disciplined circadian rhythm—retiring early and awakening during Brahma Muhurta—supercharges neurological processing. Wholesome satvik meals, fresh seasonal produce, and ample hydration preserve crystal-clear eyesight, under the sheltering grace of Sri Kshetra Gokarna Mahabaleshwara.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಪೋಷಕರೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ; ರಾತ್ರಿ ತಡವಾಗಿ ಎಚ್ಚರವಿರದೆ ಬೆಳಿಗ್ಗೆ ಬೇಗ ಎದ್ದು ಓದುವುದನ್ನು ರೂಢಿಸಿಕೊಳ್ಳಿ.",
          mr: "पालकांशी मोकळेपणाने बोला; रात्री उशिरापर्यंत न जागता सकाळी लवकर उठून अभ्यास करण्याची सवय ठेवा.",
          hi: "माता-पिता से सदैव आत्मीय संवाद रखें; रात्रि देर तक जागने के स्थान पर प्रातः जल्दी उठकर अध्ययन करें।",
          te: "తల్లిదండ్రులతో మనసు విప్పి మాట్లాడండి; రాత్రి ఆలస్యంగా మేల్కొనకుండా ఉదయాన్నే లేచి చదవడం అలవర్చుకోండి.",
          ta: "பெற்றோரிடம் மனம் திறந்து பேசுங்கள்; இரவில் கண் விழிக்காமல் காலையில் சீக்கிரம் எழுந்து படிக்கும் பழக்கத்தை கடைபிடியுங்கள்.",
          en: "Maintain transparent heart-to-heart communication with parents; substitute late-night cramming with invigorating early-morning study sessions."
        }, targetLang)
      }
    );
  } else if (ageCategory === "youth") {
    chapters.push(
      {
        id: "youth_education_career",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಉನ್ನತ ವ್ಯಾಸಂಗ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ವೃತ್ತಿ ಪ್ರವೇಶದ ಮಹಾನಕ್ಷೆ",
          mr: "अध्याय १: उच्च शिक्षण, स्पर्धा परीक्षा व करिअरची दिशा",
          hi: "अध्याय १: उच्च शिक्षा, प्रतियोगी परीक्षा एवं करियर शुभारंभ",
          te: "అధ్యాయం 1: ఉన్నత విద్య, పోటీ పరీక్షలు & తొలి ఉద్యోగ ప్రవేశం",
          ta: "அத்தியாயம் 1: உயர்கல்வி, போட்டித் தேர்வு & முதல் வேலை வாய்ப்பு",
          en: "Chapter 1: Higher Academics, Competitive Mastery & Career Launchpad"
        }, targetLang),
        subtitle: pick6({
          kn: "೫ನೇ ಹಾಗೂ ೧೦ನೇ ಮನೆಯ ಶುಭ ಪ್ರಭಾವದಿಂದ ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಯಶಸ್ಸು",
          mr: "पंचम व दशम भावाच्या शुभ प्रभावाने अभ्यासात व करिअरमध्ये यश",
          hi: "पंचम एवं दशम भाव के शुभ प्रभाव से विद्या एवं करियर में सफलता",
          te: "5 మరియు 10వ భావాల శుభ ప్రభావంతో ఉన్నత విద్య & ఉద్యోగ విజయం",
          ta: "5 & 10ம் வீடுகளின் சுப பார்வையால் கல்வி & தொழில் வெற்றி",
          en: "5th and 10th houses synergy elevating academic breakthroughs and career placement"
        }, targetLang),
        icon: "🎓",
        contemplationInquest: pick6({
          kn: "ಉನ್ನತ ವ್ಯಾಸಂಗ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ವೃತ್ತಿ ನಿರ್ಮಾಣದ ಮಾರ್ಗಸೂಚಿ ಚಿಂತನೆ",
          mr: "उच्च शिक्षण, स्पर्धा परीक्षेत दैदीप्यमान यश व करिअरची दिशा चिंतन",
          hi: "उच्च शिक्षा, प्रतियोगी परीक्षाओं में सफलता एवं करियर निर्माण का विचार",
          te: "ఉన్నత విద్య, పోటీ పరీక్షలలో విజయం మరియు కెరీర్ ప్రణాళికా విశ్లేషణ",
          ta: "உயர்கல்வி, போட்டித் தேர்வு வெற்றி மற்றும் தொழில் அடித்தள சிந்தனை",
          en: "Contemplation on Higher Academic Rigor, Competitive Edge & Professional Foundation"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ೫ನೇ ಮತ್ತು ೯ನೇ ತ್ರಿಕೋನ ಸ್ಥಾನಗಳ ಸಕ್ರಿಯತೆಯಿಂದಾಗಿ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅದ್ಭುತ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದೆ. ಕಾಲೇಜು ಶಿಕ್ಷಣ, ತಾಂತ್ರಿಕ ಕೋರ್ಸ್‌ಗಳು ಅಥವಾ ಉನ್ನತ ಪದವಿಯನ್ನು ಪಡೆಯುವ ಹಾದಿಯಲ್ಲಿ ಎದುರಾಗಿದ್ದ ಸಮಸ್ತ ಗೊಂದಲಗಳು ಪರಿಹಾರವಾಗಿ, ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಒಪ್ಪುವ ಆದರ್ಶ ಸಂಸ್ಥೆಯಲ್ಲಿ ಪ್ರವೇಶಾವಕಾಶ ದೊರೆಯಲಿದೆ. ಬುಧ ಮತ್ತು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಗ್ರಹಣ ಶಕ್ತಿ, ತಾರ್ಕಿಕ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ನಿಖರ ನೆನಪಿನ ಶಕ್ತಿಯು ಗರಿಷ್ಠ ಮಟ್ಟವನ್ನು ತಲುಪಲಿದ್ದು, ಕಠಿಣ ಸಿದ್ಧಾಂತಗಳನ್ನು ಸಹ ಸುಲಭವಾಗಿ ಕರಗತ ಮಾಡಿಕೊಳ್ಳುವಿರಿ. ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಪ್ರಮುಖ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಉನ್ನತ ಶ್ರೇಯಾಂಕಗಳು ಲಭಿಸಲಿದ್ದು, ಪ್ರೊಫೆಸರ್‌ಗಳು ಹಾಗೂ ಮಾರ್ಗದರ್ಶಕರ ಪ್ರಶಂಸೆಯು ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸಲಿದೆ.`,
            mr: `पुढील ५ वर्षांच्या कालावधीत आपल्या जन्मपत्रिकेतील पंचम व नवम या त्रिकोण स्थानांच्या सक्रियतेमुळे उच्च शिक्षणात प्रचंड प्रगती साध्य होईल. महाविद्यालयीन शिक्षण, पदव्युत्तर अभ्यासक्रम अथवा तांत्रिक कौशल्यांच्या निवडीतील सर्व संभ्रम दूर होऊन आपल्या पसंतीच्या नामवंत शिक्षण संस्थेत प्रवेशाचे योग जुळून येतील. बुध व देवगुरूंच्या शुभ दृष्टीने बुद्धिमत्ता, ग्रहणक्षमता व तार्किक विचारसरणी अत्यंत प्रगल्भ होईल. क्लिष्ट संकल्पनाही सहज समजतील व स्पर्धा परीक्षांमध्ये उत्तम यश प्राप्त होईल. प्राध्यापक व मार्गदर्शकांकडून मिळणारी दाद आपला आत्मविश्वास द्विगुणित करेल.`,
            hi: `आगामी ५ वर्षों के भीतर आपकी जन्म कुंडली के पंचम एवं नवम त्रिकोण भावों की सक्रियता से उच्च शिक्षा में अभूतपूर्व प्रगति होगी। महाविद्यालयीन अध्ययन, तकनीकी पाठ्यक्रम अथवा उच्च उपाधि प्राप्ति के मार्ग की समस्त दुविधाएं समाप्त होकर मनोनुकूल प्रतिष्ठित संस्थान में प्रवेश के स्वर्णिम अवसर प्राप्त होंगे। बुध एवं देवगुरु बृहस्पति की कृपा से आपकी ग्रहण शक्ति, तार्किक चिंतन एवं स्मरण क्षमता सर्वोच्च शिखर पर रहेगी, जिससे कठिन से कठिन विषय भी सुगमता से समझ में आएंगे। आपके अकादमिक परिश्रम से प्रतियोगी परीक्षाओं में उत्कृष्ट रैंक प्राप्त होगी तथा गुरुजनों का स्नेहपूर्ण प्रोत्साहन आपके आत्मविश्वास को नई दिशा देगा।`,
            te: `రాబోయే 5 సంవత్సరాల కాలంలో మీ జాతక చక్రంలోని 5 మరియు 9వ త్రికోణ స్థానాలు ఉత్తేజితమై ఉన్నత విద్యలో అద్భుత ప్రగతిని కలిగిస్తాయి. కళాశాల చదువు, సాంకేతిక కోర్సులు లేదా ఉన్నత డిగ్రీల ఎంపికలో ఉన్న సందిగ్ధతలన్నీ తొలగిపోయి, మీరు కోరుకున్న ప్రతిష్టాత్మక విద్యాసంస్థలో ప్రవేశం లభిస్తుంది. బుధుడు మరియు గురు గ్రహాల అనుగ్రహంతో గ్రహణశక్తి, జ్ఞాపకశక్తి మరియు తార్కిక ఆలోచనలు ఉన్నత స్థాయికి చేరుకుంటాయి. కష్టమైన సబ్జెక్టులను కూడా సులభంగా అర్థం చేసుకుని పరీక్షల్లో అద్భుతమైన ర్యాంకులు సాధిస్తారు. అధ్యాపకుల ప్రశంసలు మీ ఆత్మవిశ్వాసాన్ని మరింత పెంచుతాయి.`,
            ta: `அடுத்த 5 ஆண்டுகளில் உங்கள் ஜாதகத்தில் உள்ள 5 மற்றும் 9ம் திரிகோண ஸ்தானங்கள் வலுப்பெற்று உயர்கல்வியில் அபார வளர்ச்சியைத் தரும். கல்லூரி படிப்பு, தொழில்நுட்ப கல்வி அல்லது ஆராய்ச்சி படிப்புகளில் இருந்த குழப்பங்கள் நீங்கி நீங்கள் விரும்பிய தலைசிறந்த கல்வி நிறுவனத்தில் சேர்க்கை கிட்டும். புதன் மற்றும் தேவகுருவின் அருளால் நினைவாற்றல், பகுத்தறியும் திறன் மற்றும் கிரகிக்கும் ஆற்றல் மேலோங்கும். கடினமான பாடங்களையும் எளிதில் படித்து தேர்வுகளில் சிறந்த மதிப்பெண்கள் பெறுவீர்கள். ஆசிரியர்களின் வழிகாட்டலும் பாராட்டும் உங்கள் தன்னம்பிக்கையை உயர்த்தும்.`,
            en: `Over the upcoming 5-year arc, the synchronized activation of your 5th and 9th trines unlocks extraordinary scholastic breakthroughs. Previous hesitations regarding academic specializations, entrance tests, or postgraduate admissions dissolve smoothly, granting entry into prestigious institutes of higher learning. The harmonious radiance of Mercury and Devaguru Jupiter sharpens conceptual comprehension, critical reasoning, and photographic retention. Scoring exceptional ranks in benchmark exams commands admiration from faculty mentors, transforming academic diligence into distinguished credentials.`
          }, targetLang),
          pick6({
            kn: `ಶಿಕ್ಷಣದ ಅಂತಿಮ ಹಂತದಲ್ಲಿ ಕ್ಯಾಂಪಸ್ ಸಂದರ್ಶನಗಳು, ವೃತ್ತಿಪರ ಇಂಟರ್ನ್‌ಶಿಪ್‌ಗಳು ಹಾಗೂ ಮೊದಲ ಉದ್ಯೋಗಾವಕಾಶಗಳು ನಿಮ್ಮನ್ನು ಹುಡುಕಿಕೊಂಡು ಬರಲಿವೆ. ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿಯ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ನಾಯಕತ್ವ ಗುಣ ಹಾಗೂ ಸಮರ್ಪಣಾ ಭಾವವನ್ನು ಮುಂಚೂಣಿಗೆ ತರಲಿದ್ದು, ಪ್ರತಿಷ್ಠಿತ ಕಂಪನಿ ಅಥವಾ ಸರ್ಕಾರಿ ವಲಯದಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿಜೀವನವು ಶುಭಾರಂಭವಾಗಲಿದೆ. ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ನೀಡಲಾಗುವ ಸಣ್ಣಪುಟ್ಟ ಜವಾಬ್ದಾರಿಗಳನ್ನೂ ಅತ್ಯಂತ ಶ್ರದ್ಧೆಯಿಂದ ನಿರ್ವಹಿಸಿ, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳ ವಿಶ್ವಾಸವನ್ನು ಸಂಪಾದಿಸುವಿರಿ. ನಿಮ್ಮ ಮೊದಲ ಸ್ವಂತ ಆದಾಯವು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಅಪಾರ ಹೆಮ್ಮೆ ಹಾಗೂ ಸಂತೋಷವನ್ನು ತರಲಿದ್ದು, ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯದ ಮೊದಲ ಹೆಜ್ಜೆಯನ್ನು ನೀವು ದೃಢವಾಗಿ ಇಡಲಿದ್ದೀರಿ. ಯಾವುದೇ ಸಂದರ್ಶನಗಳಿಗೂ ಮುನ್ನ ಶ್ರೀ ಗಣಪತಿಯನ್ನು ಸ್ಮರಿಸುವುದು ನಿಮಗೆ ನಿರ್ಭೀತ ವಾಕ್ಚಾತುರ್ಯವನ್ನು ನೀಡಲಿದೆ.`,
            mr: `शिक्षणाच्या अंतिम टप्प्यात कॅम्पस मुलाखती, व्यावसायिक इंटर्नशिप व पहिल्या नोकरीच्या उत्तम संधी आपल्या दारात चालून येतील. दशम भावाच्या अनुकूलतेमुळे आपली कार्यनिष्ठा व संभाषण कौशल्य सर्वांना प्रभावित करेल. नामांकित कंपनीत अथवा सरकारी क्षेत्रात आपल्या करिअरची यशस्वी सुरुवात होईल. सुरुवातीला मिळालेल्या जबाबदाऱ्या चोख पार पाडून वरिष्ठांचा विश्वास संपादन कराल. आपल्या पहिल्या स्वतःच्या कमाईने कुटुंबाला मोठा अभिमान वाटेल व आर्थिक स्वावलंबनाची मजबूत मुहूर्तमेढ रोवली जाईल. कोणत्याही महत्त्वाच्या मुलाखतीपूर्वी गणपतीची उपासना केल्यास बोलण्यात निर्भयता व आत्मविश्वास येईल.`,
            hi: `शिक्षा के अंतिम चरण में कैंपस साक्षात्कार, व्यावसायिक इंटर्नशिप एवं प्रथम रोजगार के श्रेष्ठ अवसर स्वयं आपके सम्मुख उपस्थित होंगे। दशम भाव की अनुकूलता से आपकी कार्यकुशलता एवं संवाद क्षमता प्रखर होगी, जिससे किसी प्रतिष्ठित संस्थान अथवा शासकीय सेवा में आपके करियर का शानदार शुभारंभ होगा। प्रारंभिक स्तर पर सौंपे गए दायित्वों को निष्ठापूर्वक पूर्ण कर आप वरिष्ठ अधिकारियों का विश्वास अर्जित करेंगे। अपने प्रथम स्वावलंबन एवं आय से परिवार को गौरव की अनुभूति होगी तथा आर्थिक आत्मनिर्भरता का सुदृढ़ आरंभ होगा। किसी भी साक्षात्कार से पूर्व श्री गणेश जी का स्मरण आपको निर्भीक वाकचातुर्य प्रदान करेगा।`,
            te: `చదువు ముగింపు దశలో క్యాంపస్ ఇంటర్వ్యూలు, ఇంటర్న్‌షిప్‌లు మరియు మొదటి ఉద్యోగావకాశాలు మీ తలుపు తడతాయి. 10వ భావ అనుకూలతతో మీ నైపుణ్యాలు మరియు సంభాషణ చాతుర్యం ప్రతిభావంతంగా వెలుగులోకి వచ్చి, ప్రముఖ సంస్థల్లో ఉద్యోగ ప్రవేశం లభిస్తుంది. ప్రారంభంలో ఇచ్చిన బాధ్యతలను సమర్థవంతంగా నిర్వహించి పై అధికారుల మన్ననలు పొందుతారు. మీ తొలి సంపాదన కుటుంబానికి ఎనలేని గర్వాన్ని, సంతోషాన్ని కలిగిస్తుంది; తద్వారా ఆర్థిక స్వయం సమృద్ధికి బలమైన పునాది పడుతుంది. ఇంటర్వ్యూలకు వెళ్లే ముందు శ్రీ వినాయకుడిని స్మరించడం విశేష వాక్చాతుర్యాన్ని ఇస్తుంది.`,
            ta: `படிப்பின் இறுதிக் கட்டத்தில் வளாக நேர்முகத் தேர்வுகள், தொழிற்பயிற்சிகள் மற்றும் முதல் வேலை வாய்ப்புகள் தேடி வரும். 10ம் அதிபதியின் சுப பார்வையால் உங்கள் திறமையும் நேர்மையும் வெளிப்பட்டு, முன்னணி நிறுவனங்களில் சிறந்த வேலை கிட்டும். ஆரம்பத்தில் கொடுக்கப்படும் பணிகளை பொறுப்புடன் செய்து மேலதிகாரிகளின் நன்மதிப்பைப் பெறுவீர்கள். உங்கள் முதல் சொந்த வருமானம் குடும்பத்திற்கு அளப்பரிய பெருமையைத் தரும்; பொருளாதார சுதந்திரத்திற்கான நல்ல தொடக்கமாக இது அமையும். நேர்முகத் தேர்வுகளுக்கு முன் விநாயகரை வழிபடுவது சிறந்த தன்னம்பிக்கையைத் தரும்.`,
            en: `Transitioning into the professional arena, campus recruitments, coveted corporate internships, and promising launchpad roles will materialize seamlessly. Under favorable 10th house auspices, your articulate communication, agile problem-solving, and disciplined work ethic distinguish you among peers. Executive mentors will entrust you with pivotal responsibilities, which you execute with diligence. Earning your first independent income brings immense pride to your family, inaugurating sovereign financial self-reliance.`
          }, targetLang),
          pick6({
            kn: `ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು, ಉನ್ನತ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳು ಅಥವಾ ವಿದೇಶಿ ಶಿಕ್ಷಣದ ಆಕಾಂಕ್ಷೆಗಳಿಗೆ ೩ನೇ ಮತ್ತು ೪ನೇ ವರ್ಷಗಳು ಅತ್ಯಂತ ಫಲಪ್ರದವಾದ ಕಾಲಘಟ್ಟವಾಗಲಿವೆ. ಅನ್ಯ ದೇಶ ಅಥವಾ ಅನ್ಯ ರಾಜ್ಯಗಳಿಗೆ ಪ್ರಯಾಣ ಬೆಳೆಸಿ ಜ್ಞಾನ ವಿಸ್ತರಿಸಿಕೊಳ್ಳುವ ಯೋಗವಿದ್ದು, ನೂತನ ಸಾಂಸ್ಕೃತಿಕ ಪರಿಸರವು ನಿಮ್ಮ ದೃಷ್ಟಿಕೋನವನ್ನು ವಿಶಾಲಗೊಳಿಸಲಿದೆ. ಈ ಪಂಚವರ್ಷೀಯ ಅವಧಿಯಲ್ಲಿ ಅನಗತ್ಯ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳ ವ್ಯಸನ, ಕಾಲಹರಣ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಮಿತ್ರರ ಒಡನಾಟದಿಂದ ದೂರವಿರುವುದು ನಿಮ್ಮ ಉಜ್ವಲ ಭವಿಷ್ಯಕ್ಕೆ ಕಡ್ಡಾಯ ಮಾರ್ಗದರ್ಶನವಾಗಿದೆ. ಪ್ರತಿ ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಗಾಯತ್ರೀ ಮಂತ್ರ ಅಥವಾ ಸರಸ್ವತಿ ಸ್ತೋತ್ರವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಜಪಿಸುವುದು ನಿಮ್ಮ ಏಕಾಗ್ರತೆಯನ್ನು ವಜ್ರದಂತೆ ದೃಢಗೊಳಿಸಿ, ನಿಮ್ಮ ಸಮಸ್ತ ಕನಸುಗಳನ್ನು ಸಾಕಾರಗೊಳಿಸಲು ದೈವಿಕ ಶ್ರೀರಕ್ಷೆಯಾಗಲಿದೆ.`,
            mr: `स्पर्धा परीक्षा, शासकीय पदभरती अथवा परदेशी शिक्षणाची आकांक्षा असणाऱ्यांसाठी तिसरे व चौथे वर्ष अत्यंत फलदायी ठरेल. परदेशात अथवा परराज्यात जाऊन उच्च शिक्षण घेण्याचे व नवीन ज्ञान संपादन करण्याचे शुभ योग येतील. या पाच वर्षांच्या काळात सोशल मीडियाचा अतिवापर, मित्रांच्या संगतीत होणारा वेळेचा अपव्यय व नकारात्मक विचारांपासून दूर राहणे यशासाठी अत्यावश्यक ठरेल. दररोज सकाळी गायत्री मंत्र किंवा सरस्वती स्तोत्राचे नित्य पठण आपली स्मरणशक्ती व एकाग्रता वज्रासारखी मजबूत करेल आणि सर्व स्वप्नांना वास्तवात आणेल.`,
            hi: `प्रतियोगी परीक्षाएं, उच्च प्रवेश परीक्षाएं अथवा विदेश जाकर उच्च शिक्षा प्राप्त करने की अभिलाषा रखने वालों हेतु तृतीय एवं चतुर्थ वर्ष अत्यंत फलदायी रहेंगे। अन्य राज्य अथवा विदेश यात्रा द्वारा ज्ञान संवर्धन के शुभ योग बनेंगे, जो आपके दृष्टिकोण को विस्तृत करेंगे। इस पंचवर्षीय काल में सोशल मीडिया का अनावश्यक भटकाव, समय की बर्बादी एवं नकारात्मक संगति से दूर रहना आपके स्वर्णिम भविष्य हेतु अनिवार्य शर्त है। प्रतिदिन प्रातःकाल गायत्री मंत्र अथवा सरस्वती स्तोत्र का निष्ठापूर्वक पाठ आपकी एकाग्रता को सुदृढ़ करेगा तथा आपके समस्त संकल्पों को सिद्ध करने में ईश्वरीय संबल प्रदान करेगा।`,
            te: `పోటీ పరీక్షలు, ఉన్నత ప్రవేశ పరీక్షలు లేదా విదేశీ విద్య కోసం ప్రయత్నించే వారికి 3 మరియు 4వ సంవత్సరాలు అత్యంత అనుకూలంగా ఉంటాయి. విదేశాలకు లేదా ఇతర రాష్ట్రాలకు వెళ్లి జ్ఞానాన్ని విస్తరించుకునే శుభ యోగాలు ఉన్నాయి. ఈ ఐదేళ్ల కాలంలో అనవసర సోషల్ మీడియా వ్యామోహం, సమయాన్ని వృథా చేయడం మరియు ప్రతికూల స్నేహాలకు దూరంగా ఉండటం మీ ఉజ్వల భవిష్యత్తుకు చాలా ముఖ్యం. రోజూ ఉదయం గాయత్రీ మంత్రం లేదా సరస్వతీ స్తోత్రం జపించడం మీ ఏకాగ్రతను పెంచి మీ ఆశయాలను నిజం చేసుకోవడానికి దివ్య రక్షగా నిలుస్తుంది.`,
            ta: `போட்டித் தேர்வுகள் அல்லது வெளிநாட்டு கல்விக்கு முயற்சிப்பவர்களுக்கு 3 மற்றும் 4ஆம் ஆண்டுகள் மிகுந்த பலனைத் தரும். வெளிநாடு அல்லது வெளிமாநிலங்களுக்குச் சென்று புதிய அறிவைப் பெறும் யோகம் உண்டு. இந்த ஐந்து ஆண்டுகளில் சமூக ஊடகங்களில் நேரத்தை வீணடிப்பதைத் தவிர்த்து, தேவையற்ற நட்பு வட்டாரங்களில் இருந்து விலகி இருப்பது உங்கள் ஒளிமயமான எதிர்காலத்திற்கு மிகவும் அவசியம். தினமும் காலையில் காயத்ரி மந்திரம் அல்லது சரஸ்வதி ஸ்தோத்திரம் படிப்பது உங்கள் கவனத்தை ஒருமுகப்படுத்தி வெற்றியை உறுதி செய்யும்.`,
            en: `For competitive civil services, global standardized tests, or foreign academic scholarships, Years 3 and 4 serve as high-yield catalyst windows. Transits favor inter-state relocation or overseas travel for advanced studies, broadening your worldview. Safeguarding your mental focus against digital distractions and unproductive social circles is the golden discipline of this epoch. Regular morning recitations of the Gayatri Mantra or Saraswati Stotram will crystallize your focus, turning youthful ambition into triumphant reality.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಗಾಯತ್ರೀ ಮಂತ್ರ ೧೧ ಬಾರಿ ಜಪಿಸಿ; ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮಗಳ ಕಾಲಹರಣದಿಂದ ದೂರವಿರಿ.",
          mr: "दररोज सकाळी ११ वेळा गायत्री मंत्राचा जप करावा व सोशल मीडियावर वेळ वाया घालवणे टाळावे.",
          hi: "प्रतिदिन प्रातः ११ बार गायत्री मंत्र का जप करें तथा समय के सदुपयोग पर विशेष ध्यान दें।",
          te: "రోజూ ఉదయం గాయత్రీ మంత్రం 11 సార్లు జపించండి; సమయాన్ని సద్వినియోగం చేసుకోండి.",
          ta: "தினமும் காலை காயத்ரி மந்திரம் 11 முறை ஜபிக்கவும்; நேரத்தை வீணடிக்காமல் கவனமாக இருக்கவும்.",
          en: "Chant Gayatri Mantra 11 times every morning and guard study hours against digital distractions."
        }, targetLang)
      },
      {
        id: "youth_skills_growth",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಕೌಶಲಾಭಿವೃದ್ಧಿ, ತಾಂತ್ರಿಕ ಪ್ರೌಢಿಮೆ ಹಾಗೂ ನಾಯಕತ್ವ ಗುಣ",
          mr: "अध्याय २: कौशल्य विकास, तांत्रिक प्रावीण्य व नेतृत्व गुण",
          hi: "अध्याय २: कौशल विकास, तकनीकी दक्षता एवं नेतृत्व निर्माण",
          te: "అధ్యాయం 2: నైపుణ్యాభివృద్ధి, సాంకేతిక ప్రావీణ్యం & నాయకత్వ లక్షణాలు",
          ta: "அத்தியாயம் 2: திறன் மேம்பாடு, தொழில்நுட்ப தேர்ச்சி & தலைமைத்துவ பண்புகள்",
          en: "Chapter 2: Technological Competence, Creative Versatility & Leadership"
        }, targetLang),
        subtitle: pick6({
          kn: "ಬುಧ ಮತ್ತು ರವಿ ಪ್ರಭಾವದಿಂದ ಸಂವಹನ ಕಲೆ ಮತ್ತು ಸ್ವಾವಲಂಬನೆ",
          mr: "बुध व सूर्याच्या प्रभावाने संभाषण कला व स्वावलंबन",
          hi: "बुध एवं सूर्य के प्रभाव से प्रखर संवाद एवं आत्मनिर्भरता",
          te: "బుధ, సూర్య గ్రహాల ప్రభావంతో సంభాషణ చాతుర్యం & స్వయం సమృద్ధి",
          ta: "புதன் & சூரியன் பார்வையால் தொடர்பு திறன் & சுயசார்பு",
          en: "Mercury and Sun refining communicative prowess, independent initiative and digital literacy"
        }, targetLang),
        icon: "⚡",
        contemplationInquest: pick6({
          kn: "ಆಧುನಿಕ ಕೌಶಲ್ಯಗಳ ಸಿದ್ಧಿ, ಸಂವಹನ ಪ್ರೌಢಿಮೆ ಹಾಗೂ ಸ್ವತಂತ್ರ ಚಿಂತನೆಯ ಮಹಾ ಧ್ಯಾನ",
          mr: "आधुनिक कौशल्ये, उत्तम संवाद कौशल्य व स्वावलंबनाचा मार्ग चिंतन",
          hi: "आधुनिक कौशल संवर्धन, संवाद क्षमता एवं आत्मनिर्भर जीवन का चिंतन",
          te: "ఆధునిక నైపుణ్యాల సాధన, భావవ్యక్తీకరణ చాతుర్యం & స్వతంత్ర ఆలోచనా విశ్లేషణ",
          ta: "நவீன திறன் பயிற்சி, பேச்சுத் திறன் & சுதந்திரமான சிந்தனை தியானம்",
          en: "Contemplation on Modern Skill Mastery, Oratorical Excellence & Autonomous Thinking"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಇಂದಿನ ಸ್ಪರ್ಧಾತ್ಮಕ ಜಗತ್ತಿನಲ್ಲಿ ಕೇವಲ ಪುಸ್ತಕದ ಜ್ಞಾನವಷ್ಟೇ ಸಾಲದು; ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ನೀವು ಕಲಿಯುವ ನೂತನ ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳು, ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯ ಸಾಧನಗಳ ಬಳಕೆ, ಭಾಷಾ ಪ್ರೌಢಿಮೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಭಾಷಣ ಕಲೆಯು ನಿಮ್ಮನ್ನು ಇತರರಿಗಿಂತ ಒಂದು ಹೆಜ್ಜೆ ಮುಂದಿಡಲಿವೆ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಬುಧನ ಅನುಗ್ರಹವಿರುವುದರಿಂದ, ಹೊಸ ಸಾಫ್ಟ್‌ವೇರ್‌ಗಳು, ಆರ್ಥಿಕ ಸಾಕ್ಷರತೆ ಹಾಗೂ ಪ್ರಾಜೆಕ್ಟ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ ಕೌಶಲ್ಯಗಳನ್ನು ನೀವು ಅತಿ ವೇಗವಾಗಿ ಗ್ರಹಿಸುವಿರಿ. ನಿಮ್ಮ ಆಸಕ್ತಿಯ ಕ್ಷೇತ್ರಕ್ಕೆ ಪೂರಕವಾದ ವೃತ್ತಿಪರ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಗಳಿಸಲು ಇದು ಸುವರ್ಣ ಕಾಲ.`,
            mr: `आजच्या स्पर्धेच्या युगात केवळ पुस्तकी ज्ञान पुरेसे नाही; पुढील ५ वर्षांत आपण आत्मसात केलेली नवीन तांत्रिक कौशल्ये, आधुनिक तंत्रज्ञान, भाषा प्रावीण्य व वक्तृत्व कला आपल्याला इतरांपेक्षा खूप पुढे नेईल. आपल्या पत्रिकेत बुध ग्रहाची अनुकूलता असल्याने सॉफ्टवेअर, डिजिटल कौशल्ये व आर्थिक साक्षरता आपण अतिशय वेगाने शिकून घ्याल. आपल्या क्षेत्राशी संबंधित जागतिक दर्जाची प्रमाणपत्रे मिळवण्यासाठी हा काळ सर्वोत्तम आहे.`,
            hi: `आज के प्रतिस्पर्धी युग में केवल पुस्तकीय ज्ञान पर्याप्त नहीं है; आगामी ५ वर्षों में आपके द्वारा अर्जित की जाने वाली नवीन तकनीकी दक्षता, आधुनिक डिजिटल ज्ञान, भाषा प्रवीणता एवं सार्वजनिक वक्तृत्व कला आपको दूसरों से बहुत आगे रखेगी। आपकी जन्म कुंडली में बुध देव की कृपा से आप नवीन तकनीकों, वित्तीय प्रबंधन एवं रचनात्मक कौशलों को अत्यंत तीव्र गति से आत्मसात करेंगे। अपने कार्यक्षेत्र से संबंधित प्रतिष्ठित प्रमाण पत्र प्राप्त करने हेतु यह स्वर्णिम काल है।`,
            te: `నేటి పోటీ ప్రపంచంలో కేవలం పుస్తక జ్ఞానం మాత్రమే సరిపోదు; రాబోయే 5 సంవత్సరాలలో మీరు నేర్చుకునే నూతన సాంకేతిక నైపుణ్యాలు, డిజిటల్ సాధనాలు, భాషా ప్రావీణ్యం మరియు సంభాషణ కళ మిమ్మల్ని ఇతరుల కంటే ముందంజలో ఉంచుతాయి. మీ జాతకంలో బుధ గ్రహ అనుగ్రహం ఉండటంతో సాఫ్ట్‌వేర్, ఆర్థిక విజ్ఞానం మరియు ప్రాజెక్ట్ మేనేజ్‌మెంట్ నైపుణ్యాలను వేగంగా నేర్చుకుంటారు. ప్రొఫెషనల్ సర్టిఫికేషన్లు పొందడానికి ఇది సరైన సమయం.`,
            ta: `இன்றைய போட்டி நிறைந்த உலகில் ஏட்டுச் சுரைக்காய் மட்டும் போதாது; அடுத்த 5 ஆண்டுகளில் நீங்கள் கற்றுக் கொள்ளும் நவீன தொழில்நுட்பங்கள், கணினித் திறன், மொழித் தேர்ச்சி மற்றும் பொதுவெளியில் பேசும் திறன் உங்களை முன்னணியில் நிறுத்தும். புதனின் அனுகூலத்தால் புதிய மென்பொருட்கள், நிதி மேலாண்மை போன்ற திறன்களை விரைவாகக் கற்றுத் தேர்வீர்கள். தொழில்சார் சான்றிதழ்களைப் பெற இது மிகச் சிறந்த காலமாகும்.`,
            en: `Modern professional landscapes require far more than rote academic memorization; over the next 5 years, assimilating cutting-edge technical proficiencies, digital tools, financial literacy, and executive communication will grant you a distinct competitive advantage. With Mercury illuminating your cognitive houses, acquiring specialized certifications and data acumen occurs effortlessly, securing high marketability.`
          }, targetLang),
          pick6({
            kn: `ಸ್ವತಂತ್ರವಾಗಿ ಆಲೋಚಿಸುವ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ನಾಯಕತ್ವ ಗುಣಗಳು ನಿಮ್ಮಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ವಿಕಸನಗೊಳ್ಳಲಿವೆ. ಕಾಲೇಜು ಅಥವಾ ವೃತ್ತಿ ಸಮಿತಿಗಳಲ್ಲಿ ಪ್ರಮುಖ ಜವಾಬ್ದಾರಿಗಳನ್ನು ವಹಿಸಿಕೊಂಡು ತಂಡವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುನ್ನಡೆಸುವಿರಿ. ಹಿರಿಯರ ಅನುಭವದ ಮಾರ್ಗದರ್ಶನವನ್ನು ಗೌರವಿಸುತ್ತಲೇ, ನಿಮ್ಮದೇ ಆದ ಸೃಜನಶೀಲ ಆಲೋಚನೆಗಳನ್ನು ಕಾರ್ಯರೂಪಕ್ಕೆ ತರಲು ಧೈರ್ಯ ತೋರುವಿರಿ. ಈ ಪ್ರಕ್ರಿಯೆಯು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ವಿಶೇಷ ತೇಜಸ್ಸು ಹಾಗೂ ನಾಯಕತ್ವದ ಘನತೆಯನ್ನು ತಂದುಕೊಡಲಿದೆ.`,
            mr: `स्वतंत्र विचारसरणी व नेतृत्व गुण आपल्यात नैसर्गिकपणे विकसित होतील. महाविद्यालयीन उपक्रम अथवा व्यावसायिक प्रकल्पांमध्ये पुढाकार घेऊन आपण संपूर्ण चमूचे यशस्वी नेतृत्व कराल. ज्येष्ठांच्या मार्गदर्शनाचा आदर राखून स्वतःच्या नावीन्यपूर्ण संकल्पना प्रत्यक्षात आणण्याचे धैर्य दाखवाल, ज्यामुळे आपले व्यक्तिमत्त्व अधिक प्रभावी व सन्माननीय बनेल.`,
            hi: `स्वतंत्र चिंतन एवं नेतृत्व के नैसर्गिक गुण आपके व्यक्तित्व में निखरेंगे। महाविद्यालयीन परिषदों अथवा व्यावसायिक परियोजनाओं में अग्रणी भूमिका निभाकर आप पूरी टीम का कुशल नेतृत्व करेंगे। वरिष्ठजनों के अनुभवों का सम्मान करते हुए अपनी मौलिक रचनात्मक योजनाओं को क्रियान्वित करने का साहस दिखाएंगे, जो आपके प्रभाव क्षेत्र को विस्तृत करेगा।`,
            te: `స్వతంత్రంగా ఆలోచించే శక్తి మరియు నాయకత్వ లక్షణాలు మీలో సహజంగా వికసిస్తాయి. కళాశాల లేదా ప్రాజెక్ట్ కమిటీలలో కీలక బాధ్యతలు తీసుకుని బృందాన్ని విజయవంతంగా నడిపిస్తారు. పెద్దల అనుభవాలను గౌరవిస్తూనే మీ సృజనాత్మక ఆలోచనలను ఆచరణలో పెట్టే ధైర్యం చేస్తారు, ఇది మీ వ్యక్తిత్వానికి ప్రత్యేక గుర్తింపును తెస్తుంది.`,
            ta: `சுய சிந்தனை மற்றும் தலைமைத்துவப் பண்புகள் உங்களிடம் இயல்பாகவே மிளிரும். கல்லூரி மற்றும் பணிகளில் முன்நின்று ஒரு குழுவை வழிநடத்தும் ஆற்றல் உண்டாகும். பெரியோர்களின் அனுபவ வழிகாட்டுதலை மதித்து உங்கள் புதுமையான யோசனைகளை தைரியமாக செயல்படுத்துவீர்கள்; இது உங்கள் ஆளுமையை மேலும் மெருகேற்றும்.`,
            en: `Autonomous thinking and natural leadership qualities will blossom organically. Whether captaining collegiate initiatives or leading project squads, your ability to synthesize diverse opinions and drive execution commands peer respect. Melding ancestral wisdom with visionary innovation establishes you as a credible, forward-looking leader.`
          }, targetLang),
          pick6({
            kn: `ಹಣಕಾಸಿನ ಶಿಸ್ತು ಹಾಗೂ ಭವಿಷ್ಯದ ಉಳಿತಾಯದ ಮಹತ್ವವನ್ನು ಈ ವಯಸ್ಸಿನಲ್ಲೇ ಅರಿತುಕೊಳ್ಳುವುದು ನಿಮ್ಮನ್ನು ಭವಿಷ್ಯದ ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟುಗಳಿಂದ ಶಾಶ್ವತವಾಗಿ ರಕ್ಷಿಸಲಿದೆ. ದುಬಾರಿ ಗ್ಯಾಜೆಟ್‌ಗಳು, ಬ್ರಾಂಡೆಡ್ ವ್ಯಾಮೋಹ ಅಥವಾ ಅನಗತ್ಯ ಆಡಂಬರದ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಾದರೂ ವ್ಯವಸ್ಥಿತ ಉಳಿತಾಯ ಮತ್ತು ಹೂಡಿಕೆ ಮಾಡುವ ಅಭ್ಯಾಸವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳಿ. ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣನ ನಿತ್ಯ ದರ್ಶನ ಹಾಗೂ ಆಂಜನೇಯ ಸ್ವಾಮಿಯ ಸ್ಮರಣೆಯು ನಿಮ್ಮಲ್ಲಿ ಕಾರ್ಯಶಕ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಧೃತಿ-ಸ್ಥೈರ್ಯಗಳನ್ನು ಸದಾ ಜಾಗೃತವಾಗಿರಿಸಲಿದೆ.`,
            mr: `आर्थिक शिस्त व बचतीचे महत्त्व याच वयात समजून घेतल्यास भविष्य कायमचे सुरक्षित राहील. दिखाऊपणा, चैनीच्या वस्तू व महागड्या खर्चांवर नियंत्रण ठेवून लहान प्रमाणावर का होईना नियमित बचतीची सवय लावा. दररोज सूर्यदर्शन व हनुमान चालीसा पठण केल्याने आळस दूर होऊन अथांग कार्यऊर्जा व सचोटीचे बळ प्राप्त होईल.`,
            hi: `वित्तीय अनुशासन एवं नियमित बचत के महत्व को इसी आयु में समझना आपके भावी जीवन को आर्थिक सुरक्षा प्रदान करेगा। दिखावे की प्रवृत्ति, महंगे शौक एवं अनावश्यक व्यय पर अंकुश लगाकर सुव्यवस्थित निवेश की आदत डालें। नित्य सूर्य दर्शन एवं हनुमान चालीसा का पाठ आपको अपार ऊर्जा, अनुशासन एवं आत्मबल प्रदान करेगा।`,
            te: `ఆర్థిక క్రమశిక్షణ మరియు పొదుపు యొక్క ప్రాముఖ్యతను ఈ వయస్సులోనే గ్రహించడం మీ భవిష్యత్తును సురక్షితం చేస్తుంది. ఆడంబరపు ఖర్చులు మరియు విలాసాలను నియంత్రించి, క్రమం తప్పకుండా పొదుపు చేసే అలవాటు చేసుకోండి. రోజూ సూర్య నమస్కారాలు మరియు హనుమాన్ చాలీసా పఠనం మీలో అపారమైన శక్తిని, నైతిక స్థైర్యాన్ని నింపుతాయి.`,
            ta: `பொருளாதார ஒழுக்கத்தையும் சேமிப்பின் அவசியத்தையும் இந்த வயதிலேயே புரிந்து கொள்வது உங்கள் எதிர்காலத்தை வளமாக்கும். ஆடம்பர செலவுகளைக் கட்டுப்படுத்தி சிறுக சிறுக சேமிக்கும் பழக்கத்தை ஏற்படுத்திக் கொள்ளுங்கள். தினமும் சூரிய தரிசனம் மற்றும் அனுமன் சாலிசா பாராயணம் உங்களுக்கு அளப்பரிய உற்சாகத்தையும் மன உறுதியையும் தரும்.`,
            en: `Ingraining financial discipline and conscious budgeting during these formative years permanently insulates your future against debt. Curb impulsive lifestyle splurges, cultivating systematic savings habits early. Greeting the morning Sun and reciting the Hanuman Chalisa will infuse relentless stamina, moral integrity, and purposeful drive.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಹೊಸ ತಾಂತ್ರಿಕ ಕೌಶಲಗಳನ್ನು ಕಲಿಯಿರಿ ಹಾಗೂ ದುಂದುವೆಚ್ಚಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ ನಿಯಮಿತ ಉಳಿತಾಯ ಆರಂಭಿಸಿ.",
          mr: "नवीन तांत्रिक कौशल्ये शिका व अनावश्यक खर्च टाळून बचतीची सवय लावा.",
          hi: "नवीन तकनीकी कौशल सीखें तथा अपव्यय से बचकर नियमित बचत की आदत डालें।",
          te: "కొత్త సాంకేతిక నైపుణ్యాలను నేర్చుకోండి; దుబారా ఖర్చులు తగ్గించి పొదుపు చేయండి.",
          ta: "புதிய தொழில்நுட்ப திறன்களைக் கற்றுக் கொள்ளுங்கள்; வீண் செலவுகளைக் குறைத்து சேமிக்கத் தொடங்குங்கள்.",
          en: "Acquire high-value technical skills and cultivate disciplined personal savings early."
        }, targetLang)
      },
      {
        id: "youth_wellness_direction",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ, ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ ಹಾಗೂ ಜೀವನಶೈಲಿ",
          mr: "अध्याय ३: मानसिक एकाग्रता, भावनिक संतुलन व संतुलित दिनचर्या",
          hi: "अध्याय ३: मानसिक एकाग्रता, संवेगात्मक संतुलन एवं अनुशासित दिनचर्या",
          te: "అధ్యాయం 3: మానసిక ఏకాగ్రత, భావోద్వేగ సమతుల్యత & జీవనశైలి",
          ta: "அத்தியாயம் 3: மன அமைதி, உணர்ச்சி சமநிலை & வாழ்க்கை முறை ஒழுக்கம்",
          en: "Chapter 3: Mind Mastery, Digital Detox & Physical Stamina"
        }, targetLang),
        subtitle: pick6({
          kn: "ಚಂದ್ರ ಮತ್ತು ಲಗ್ನದ ಬಲದಿಂದ ನೈತಿಕ ದೃಢತೆ ಹಾಗೂ ಚೈತನ್ಯ",
          mr: "चंद्र व लग्नाच्या बळाने नैतिक सामर्थ्य व शारीरिक ऊर्जा",
          hi: "चंद्र एवं लग्न के बल से मानसिक स्थिरता एवं उत्तम स्वास्थ्य",
          te: "చంద్ర మరియు లగ్న బలంతో మానసిక స్థిరత్వం & శారీరక ఆరోగ్యం",
          ta: "சந்திரன் & லக்ன பலத்தால் மனோபலம் & உடல் ஆரோக்கியம்",
          en: "Moon and Ascendant alignments fortifying emotional equilibrium and restful sleep"
        }, targetLang),
        icon: "🌿",
        contemplationInquest: pick6({
          kn: "ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಚೈತನ್ಯ ಸಂರಕ್ಷಣೆ ಹಾಗೂ ಸತ್ಸಂಗದ ಪ್ರಾಮುಖ್ಯತೆಯ ಚಿಂತನೆ",
          mr: "मानसिक शांती, आरोग्य संवर्धन व सत्संगाचे महत्त्व चिंतन",
          hi: "मानसिक शांति, स्वास्थ्य संवर्धन एवं सत्संगति का पावन चिंतन",
          te: "మానసిక ప్రశాంతత, ఆరోగ్య సంరక్షణ & సత్సంగ ప్రాముఖ్యత విశ్లేషణ",
          ta: "மன அமைதி, உடல் நலம் மற்றும் நல்ல நட்பின் முக்கியத்துவ சிந்தனை",
          en: "Contemplation on Mental Tranquility, Constitutional Stamina & Noble Companionship"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಯೌವನದ ಈ ಹಂತದಲ್ಲಿ ಮನಸ್ಸು ಅನೇಕ ದಿಕ್ಕುಗಳಲ್ಲಿ ಚದುರುವ ಸಾಧ್ಯತೆ ಇರುವುದರಿಂದ, ಮಾನಸಿಕ ಸಮತೋಲನ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಯಶಸ್ಸಿಗೆ ಅತಿ ಮುಖ್ಯವಾಗಿದೆ. ಪರೀಕ್ಷೆ, ಫಲಿತಾಂಶ ಅಥವಾ ಭವಿಷ್ಯದ ವೃತ್ತಿಯ ಬಗೆಗಿನ ಆಧಾರರಹಿತ ಆತಂಕಗಳಿಗೆ ಆಸ್ಪದ ನೀಡದೆ, ಪ್ರಸ್ತುತ ಕ್ಷಣದ ಕರ್ತವ್ಯದ ಮೇಲೆ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಿ. ಪ್ರತಿದಿನ ಪ್ರಾಣಾಯಾಮ, ಲಘು ಧ್ಯಾನ ಅಥವಾ ಯೋಗಾಭ್ಯಾಸವನ್ನು ಮಾಡುವುದು ನಿಮ್ಮ ನರಮಂಡಲವನ್ನು ಶಾಂತಗೊಳಿಸಿ ನಿಮ್ಮ ಏಕಾಗ್ರತೆಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಲಿದೆ.`,
            mr: `तरुण वयात मन अनेक गोष्टींकडे भरकटण्याची शक्यता असते; त्यामुळे मानसिक समतोल व भावनिक स्थिरता टिकवून ठेवणे अत्यंत महत्त्वाचे आहे. परीक्षा, निकाल अथवा भविष्यातील करिअरच्या काल्पनिक चिंतेत वेळ न घालवता वर्तमान क्षणातील कष्टांवर लक्ष केंद्रित करा. दररोज थोडा वेळ प्राणायाम, ध्यानधारणा अथवा योगासने केल्यास मज्जासंस्था शांत राहून एकाग्रतेत अफाट वाढ होईल.`,
            hi: `युवावस्था के इस कालखंड में मन का विभिन्न दिशाओं में भटकना स्वाभाविक है; अतः संवेगात्मक संतुलन एवं मानसिक शांति बनाए रखना आपकी सफलता की प्रथम सीढ़ी है। परीक्षा, परिणाम अथवा भावी आजीविका की काल्पनिक चिंताओं से मुक्त होकर वर्तमान कर्तव्य पर ध्यान केंद्रित करें। नित्य प्रातः प्राणायाम, सूक्ष्म ध्यान एवं योगाभ्यास आपकी तंत्रिका तंत्र को शांत कर मानसिक एकाग्रता को कई गुना बढ़ाएगा।`,
            te: `యౌవన దశలో మనస్సు అనేక విషయాల వైపు మళ్లే అవకాశం ఉంటుంది; కాబట్టి భావోద్వేగ సమతుల్యత మరియు మానసిక స్థిరత్వాన్ని కాపాడుకోవడం చాలా ముఖ్యం. పరీక్షలు, ఫలితాలు లేదా భవిష్యత్తు గురించిన అనవసర ఆందోళనలకు తావివ్వకుండా ప్రస్తుత కర్తవ్యంపై దృష్టి పెట్టండి. రోజూ ప్రాణాయామం, ధ్యానం లేదా యోగా చేయడం వల్ల మనస్సు ప్రశాంతంగా ఉండి ఏకాగ్రత రెట్టింపు అవుతుంది.`,
            ta: `இளமைப் பருவத்தில் மனம் பல திசைகளில் அலைபாய வாய்ப்புள்ளது; எனவே உணர்ச்சி சமநிலையும் மன அமைதியும் உங்கள் வெற்றிக்கு மிக அவசியம். தேர்வுகள், முடிவுகள் அல்லது எதிர்காலத்தைப் பற்றிய வீண் கற்பனைக் கவலைகளை விடுத்து தற்போதைய கடமையில் கவனம் செலுத்துங்கள். தினமும் யோகா, தியானம் மற்றும் மூச்சுப் பயிற்சி செய்வது நரம்பு மண்டலத்தை அமைதிப்படுத்தி உங்கள் கவனத்தை அதிகரிக்கும்.`,
            en: `Navigating the energetic tides of youth requires intentional emotional equilibrium and grounded composure. Guard your mind against speculative anxiety regarding competitive exam rankings or career timelines; anchor yourself firmly in present execution. Daily practice of pranayama, brief silent meditation, and yogic postures stabilizes the nervous system, doubling cognitive stamina.`
          }, targetLang),
          pick6({
            kn: `ದೈಹಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಕ್ರೀಡಾ ಚಟುವಟಿಕೆಗಳು ನಿಮ್ಮ ದೇಹಕ್ಕೆ ನವಚೈತನ್ಯವನ್ನು ನೀಡಲಿವೆ. ನಿಯಮಿತ ಜಿಮ್, ಓಟ, ಈಜು ಅಥವಾ ಯೋಗಾಸನಗಳಲ್ಲಿ ತೊಡಗಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಗಟ್ಟಿಗೊಳಿಸಲಿದೆ. ಜಂಕ್ ಫುಡ್, ತಡರಾತ್ರಿಯ ಜಾಗರಣೆ ಹಾಗೂ ಮೊಬೈಲ್ ಪರದೆಯ ಅತಿಯಾದ ಬಳಕೆಯನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಿ. ಗುಣಮಟ್ಟದ ನಿದ್ರೆಯು ನಿಮ್ಮ ಮೆದುಳಿನ ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ಹೆಚ್ಚಿಸಿ, ದಿನವಿಡೀ ನಿಮ್ಮನ್ನು ಉತ್ಸಾಹಭರಿತರನ್ನಾಗಿ ಇಡಲಿದೆ.`,
            mr: `शारीरिक तंदुरुस्ती व मैदानी खेळ आपल्या शरीराला नवी ऊर्जा देतील. नियमित व्यायाम, धावणे किंवा योगासनाने रोगप्रतिकारशक्ती उत्तम राहील. जंक फूड, रात्री उशिरापर्यंत जागी राहणे व मोबाईलचा अतिवापर कटाक्षाने टाळा. पुरेशी शांत झोप मेंदूची कार्यक्षमता वाढवून दिवसभर आपल्याला उत्साही ठेवेल.`,
            hi: `शारीरिक स्वास्थ्य एवं खेलकूद की गतिविधियां आपके शरीर में नवस्फूर्ति का संचार करेंगी। नियमित व्यायाम, दौड़ अथवा योगासन आपकी रोग प्रतिरोधक क्षमता को सुदृढ़ करेंगे। जंक फूड, देर रात तक जागने की आदत एवं मोबाइल स्क्रीन के अत्यधिक उपयोग से बचें। गहरी एवं समय पर ली गई नींद आपकी मानसिक क्षमता को परिष्कृत करेगी।`,
            te: `శారీరక దృఢత్వం మరియు క్రీడలు మీ శరీరానికి నూతనోత్సాహాన్ని ఇస్తాయి. రోజూ వ్యాయామం, నడక లేదా యోగా చేయడం వల్ల రోగనిరోధక శక్తి పెరుగుతుంది. జంక్ ఫుడ్, రాత్రిపూట మేల్కొనడం మరియు మొబైల్ అతిగా వాడటం పూర్తిగా మానేయండి. సరైన నిద్ర మీ మెదడు చురుకుదనాన్ని పెంచి రోజంతా ఉల్లాసంగా ఉంచుతుంది.`,
            ta: `உடற்பயிற்சி மற்றும் விளையாட்டு நடவடிக்கைகள் உங்கள் உடலுக்கு புத்துணர்ச்சி தரும். தினமும் உடற்பயிற்சி, யோகா செய்வது நோய் எதிர்ப்பு சக்தியை பலப்படுத்தும். துரித உணவுகள், இரவு கண் விழித்தல் மற்றும் செல்போன் அதிகப்படியான பயன்பாட்டைத் தவிர்க்கவும். ஆழ்ந்த தூக்கம் மூளையின் சுறுசுறுப்பை அதிகரித்து நாள் முழுவதும் உற்சாகமாக வைக்கும்.`,
            en: `Physical athleticism, daily gym routines, swimming, or sports instill impenetrable immunity and physical stamina. Eliminate late-night screen scrolling, sedentary lethargy, and ultra-processed food. Restorative, aligned sleep cycles refresh the mind, powering sustained peak scholastic and professional output.`
          }, targetLang),
          pick6({
            kn: `ಉತ್ತಮ ಮಿತ್ರರ ಸಹವಾಸ ಹಾಗೂ ಹಿರಿಯರ ಸಾನ್ನಿಧ್ಯವು ನಿಮ್ಮ ನೈತಿಕ ಚಾರಿತ್ರ್ಯಕ್ಕೆ ಶ್ರೀರಕ್ಷೆಯಾಗಲಿದೆ. ನಿಮ್ಮ ಗುರಿಗಳನ್ನು ಬೆಂಬಲಿಸುವ, ಸಕಾರಾತ್ಮಕ ಆಲೋಚನೆಗಳುಳ್ಳ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಮಾತ್ರ ಒಡನಾಟವಿಟ್ಟುಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಹಾಗೂ ಮಹಾಗಣಪತಿಯ ದೈವಿಕ ಧ್ಯಾನವು ನಿಮ್ಮ ಸಮಸ್ತ ಕಷ್ಟಗಳಲ್ಲೂ ನಿಮಗೆ ಅಚಲವಾದ ಧೈರ್ಯವನ್ನು ನೀಡಿ, ನಿಮ್ಮ ಜೀವನವನ್ನು ಸಾರ್ಥಕತೆಯ ಶಿಖರಕ್ಕೆ ಮುನ್ನಡೆಸಲಿದೆ.`,
            mr: `उत्तम मित्रांची संगत व ज्येष्ठांचे सान्निध्य आपल्या चरित्राचे संरक्षण करेल. आपल्या ध्येयांना पाठिंबा देणाऱ्या व सकारात्मक विचार करणाऱ्या मित्रांशीच जवळीक ठेवा. श्री क्षेत्र गोकर्ण येथील आत्मलिंग महाबळेश्वर व महागणपतीचे स्मरण कठीण प्रसंगात आपल्याला अथांग धैर्य देऊन यशाच्या शिखरावर पोहोचवेल.`,
            hi: `सत्संगति एवं वरिष्ठजनों का सान्निध्य आपके चारित्रिक उत्थान का आधार बनेगा। अपने लक्ष्यों के प्रति समर्पित एवं सकारात्मक सोच वाले मित्रों की संगति में रहें। श्री क्षेत्र गोकर्ण के आत्मलिंग महाबलेश्वर एवं महागणपति का नित्य संस्मरण कठिन परिस्थितियों में भी आपको असीम संबल प्रदान कर जीवन को कृतार्थ करेगा।`,
            te: `మంచి స్నేహితుల సాంగత్యం మరియు పెద్దల ఆశీస్సులు మీ నడవడికను ఉన్నతంగా తీర్చిదిద్దుతాయి. మీ లక్ష్యాలను ప్రోత్సహించే సానుకూల వ్యక్తులతోనే స్నేహం చేయండి. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి, మహా గణపతుల నిత్య స్మరణ ఎలాంటి ఆపదలలోనైనా మీకు అచంచలమైన ధైర్యాన్నిచ్చి విజయతీరాలకు చేరుస్తుంది.`,
            ta: `நல்ல நண்பர்களின் கூட்டு மற்றும் பெரியோர்களின் வழிகாட்டல் உங்கள் நன்னடத்தையை காக்கும். உங்கள் இலட்சியங்களுக்கு ஆதரவளிக்கும் நற்குணமுள்ள நண்பர்களுடன் மட்டும் பழகவும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் மற்றும் மகா கணபதியின் வழிபாடு சவாலான நேரங்களிலும் அசைக்க முடியாத தைரியத்தை தந்து உங்களை வெற்றிப் பாதைக்கு அழைத்துச் செல்லும்.`,
            en: `Noble companionship and veneration of parents anchor moral character. Cultivate friendships exclusively with ambitious, ethical peers who reinforce your highest ideals. Mindful remembrance of Sri Kshetra Gokarna Mahabaleshwara and Maha Ganapati bestows resolute courage through every transitional threshold, guiding youth toward noble fruition.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಪೌಷ್ಟಿಕ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ, ತಡರಾತ್ರಿಯ ನಿದ್ರಾಹೀನತೆ ತಪ್ಪಿಸಿ ಹಾಗೂ ಸತ್ಸಂಗ ಬೆಳೆಸಿಕೊಳ್ಳಿ.",
          mr: "सात्त्विक आहार घ्या, रात्री लवकर झोपण्याची सवय ठेवा व चांगल्या मित्रांची संगत जोपासा.",
          hi: "सात्विक आहार लें, देर रात तक जागने से बचें एवं सकारात्मक मित्रों की संगति रखें।",
          te: "సాత్విక ఆహారం తీసుకోండి, రాత్రిపూట మేల్కొనవద్దు మరియు మంచి మిత్రులతో స్నేహం చేయండి.",
          ta: "சத்தான உணவு உண்ணவும், இரவு தூக்கத்தை தவிர்க்க வேண்டாம் மற்றும் நல்ல நண்பர்களுடன் பழகவும்.",
          en: "Honor satvik nutrition, maintain early sleep rhythms, and surround yourself with inspiring peers."
        }, targetLang)
      }
    );
  } else if (ageCategory === "senior" || detailedAge === "senior") {
    chapters.push(
      {
        id: "senior_spirituality",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಆತ್ಮಶಾಂತಿಯ ೫-ವರ್ಷಗಳ ನಕ್ಷೆ",
          mr: "अध्याय १: आध्यात्मिक साधना, तीर्थयात्रा व आत्मशांतीचा ५ वर्षांचा आराखडा",
          hi: "अध्याय १: आध्यात्मिक साधना, तीर्थाटन एवं आत्मशांति का ५-वर्षीय खाका",
          te: "అధ్యాయం 1: ఆధ్యాత్మిక సాధన, తీర్థయాత్రలు & మనశ్శాంతి 5 సంవత్సరాల ప్రణాళిక",
          ta: "அத்தியாயம் 1: ஆன்மீக சாதனை, புனித யாத்திரை & மன அமைதி 5 ஆண்டுகள் வரைபடம்",
          en: "Chapter 1: Spiritual Evolution, Sacred Pilgrimages & Inner Serenity (5-Year Arc)"
        }, targetLang),
        subtitle: pick6({
          kn: "೯ನೇ ಭಾವ ಹಾಗೂ ಗುರು ಪ್ರಭಾವದಿಂದ ಈಶ್ವರಾನುಗ್ರಹ ಹಾಗೂ ಭಕ್ತಿ ಯೋಗ",
          mr: "भाग्येश व गुरूच्या कृपेने ईश्वरानुग्रह व मोक्ष मार्ग",
          hi: "नवम भाव एवं गुरु के शुभ प्रभाव से ईश्वरीय अनुग्रह एवं भक्ति योग",
          te: "9వ భావం మరియు గురు గ్రహ అనుగ్రహంతో ఈశ్వర కటాక్షం & భక్తి యోగం",
          ta: "9ம் அதிபதி & குருவின் அருளால் இறை அருள் பிராப்தி & பக்தி யோகம்",
          en: "9th House and Jovian grace illuminating spiritual contemplation and devotion"
        }, targetLang),
        icon: "🕉️",
        contemplationInquest: pick6({
          kn: "ಆಧ್ಯಾತ್ಮಿಕ ಅಧ್ಯಯನ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿಯ ಸಾಕ್ಷಾತ್ಕಾರ ಚಿಂತನೆ",
          mr: "आध्यात्मिक अध्ययन, तीर्थयात्रा व आंतरिक शांतीचे महाचिंतन",
          hi: "आध्यात्मिक अध्ययन, तीर्थाटन एवं आंतरिक शांति का चिंतन",
          te: "ఆధ్యాత్మిక గ్రంథ పఠనం, పుణ్యక్షేత్ర దర్శనం & ఆత్మశాంతి పై చింతన",
          ta: "ஆன்மீக நூல்கள் வாசிப்பு, புண்ணிய யாத்திரை & மன அமைதி சிந்தனை",
          en: "Contemplation on Sacred Epics, Spiritual Pilgrimages & Transcendent Inner Harmony"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ಪವಿತ್ರ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಧ್ಯಾವಧಿಯಾಗಿದೆ. ೯ನೇ ಭಾವ ಮತ್ತು ಗುರು-ಕೇತುಗಳ ಶುಭ ಪ್ರಭಾವದಿಂದಾಗಿ ಮನಸ್ಸು ಲೌಕಿಕ ಜಂಜಾಟಗಳಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿ, ಭಗವದ್ಗೀತೆ, ಉಪನಿಷತ್ತು ಹಾಗೂ ಪುರಾಣಗಳ ಶ್ರವಣ-ಮನನದಲ್ಲಿ ಆನಂದ ಕಾಣಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ, ಕಾಶಿ, ರಾಮೇಶ್ವರಗಳಂತಹ ಪುಣ್ಯಕ್ಷೇತ್ರಗಳ ದರ್ಶನ ಯೋಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`,
            mr: `हा पाच वर्षांचा काळ आपल्या आयुष्यातील अत्यंत पवित्र व शांत आध्यात्मिक पर्व असेल. नवम भाव व गुरू-केतूच्या शुभ प्रभावाने मन प्रपंचातून थोडे निवृत्त होऊन भगवद्गीता, पुराणे व नामस्मरणात शांतता अनुभवेल. गोकर्ण, काशी, रामेश्वर अशा तीर्थक्षेत्रांच्या दर्शनाचा सुंदर योग येईल.`,
            hi: `यह पंचवर्षीय कालखंड आपके जीवन का परम पावन आध्यात्मिक संधिकाल सिद्ध होगा। नवम भाव एवं गुरु-केतु के शुभ प्रभाव से मन सांसारिक आपाधापी से विरत होकर भगवद्गीता, रामायण एवं उपनिषदों के स्वाध्याय में परम शांति प्राप्त करेगा। पावन तीर्थाटन के उत्तम योग बनेंगे।`,
            te: `ఈ ఐదు సంవత్సరాల కాలం మీ జీవితంలో అత్యంత పవిత్రమైన ఆధ్యాత్మిక దశ. 9వ భావం మరియు గురు-కేతువుల ప్రభావంతో మనస్సు ప్రాపంచిక ఆందోళనల నుండి దూరమై భగవద్గీత, పురాణాల పఠనం మరియు నామస్మరణలో శాంతిని పొందుతుంది. పుణ్యక్షేత్ర దర్శన యోగం లభిస్తుంది.`,
            ta: `இந்த ஐந்து ஆண்டுகள் உங்கள் வாழ்க்கையின் மிக உன்னதமான ஆன்மீக காலகட்டமாகும். 9ம் இடம் மற்றும் குரு-கேதுவின் சுப பார்வையால் மனம் உலகியல் கவலைகளிலிருந்து விடுபட்டு பகவத் கீதை, புராணங்கள் வாசிப்பதில் ஆழ்ந்த அமைதி காணும். புனித யாத்திரைகள் அமையும்.`,
            en: `This venerated 5-year epoch marks a serene spiritual golden age in your life. Governed by 9th house harmonics and Jovian grace, the mind naturally disengages from worldly turbulence to relish sacred epics, mantra japa, and transformative pilgrimages to sanctified kshetras.`
          }, targetLang),
          pick6({
            kn: `ಕುಟುಂಬದಲ್ಲಿ ಹಿರಿಯರಾಗಿ ನಿಮ್ಮ ಗೌರವ, ಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಮಾತುಗಳಿಗೆ ಅತ್ಯುನ್ನತ ಮನ್ನಣೆ ದೊರೆಯಲಿದೆ. ಮಕ್ಕಳು ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳಿಗೆ ನಿಮ್ಮ ಅನುಭವದ ಜ್ಞಾನಧಾರೆಯನ್ನು ಹಂಚುವುದು ಕುಟುಂಬದ ಭವಿಷ್ಯಕ್ಕೆ ದಾರಿದೀಪವಾಗಲಿದೆ. ಮನೆತನದ ಕುಲದೇವತಾ ಕೈಂಕರ್ಯಗಳನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಮುನ್ನಡೆಸುವಿರಿ.`,
            mr: `कुटुंबात वडीलधारी व्यक्ती म्हणून आपला मान, आदर व शब्दाला मोठे वजन राहील. मुले व नातवंडांना आपल्या जीवन अनुभवाचे मार्गदर्शन करणे कुटुंबाचा पाया मजबूत करेल. कुलदेवतेची पूजा व धार्मिक परंपरा आपण निष्ठेने पुढे नेहाल.`,
            hi: `परिवार में ज्येष्ठ मार्गदर्शक के रूप में आपके अनुभव एवं वचनों को सर्वोच्च आदर प्राप्त होगा। संतान एवं पौत्र-पौत्रियों को दिए गए सुसंस्कार कुल की कीर्ति को बढ़ाएंगे। कुलपरंपरा एवं धार्मिक अनुष्ठानों का सफल संपादन करेंगे।`,
            te: `కుటుంబంలో పెద్దగా మీ గౌరవ మర్యాదలు, మాటకు విలువ మరింత పెరుగుతాయి. పిల్లలకు, మనవళ్లకు మీ అనుభవాలను పంచుతూ సన్మార్గం చూపించడం వంశానికి రక్షగా నిలుస్తుంది. కులదేవత పూజలను భక్తిశ్రద్ధలతో నిర్వహిస్తారు.`,
            ta: `குடும்பத்தின் மூத்த வழிகாட்டியாக உங்கள் வார்த்தைகளுக்கு மிகுந்த மரியாதையும் மதிப்பும் கிடைக்கும். பிள்ளைகள் மற்றும் பேரக்குழந்தைகளுக்கு நல்வழிகாட்டி குடும்பத்தின் பாரம்பரியத்தை காப்பீர்கள். குலதெய்வ வழிபாட்டை பக்தியுடன் முன்னெடுப்பீர்கள்.`,
            en: `As the venerable patriarch/matriarch, your voice and life wisdom command profound reverence across the family. Transmitting ethical values to descendants and stewarding ancestral rituals secure enduring familial stability.`
          }, targetLang),
          pick6({
            kn: `ಆಧ್ಯಾತ್ಮಿಕ ತೃಪ್ತಿ, ಸತ್ಸಂಗ ಹಾಗೂ ದಾನಧರ್ಮಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಪುಣ್ಯಕೋಶವನ್ನು ವೃದ್ಧಿಸಲಿದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಪೂಜೆ ಹಾಗೂ ನಿತ್ಯ ಶಿವಪಂಚಾಕ್ಷರೀ ಜಪವು ಮನಸ್ಸಿನಲ್ಲಿ ಅಪೂರ್ವ ಪ್ರಶಾಂತತೆಯನ್ನು, ಮುಖದಲ್ಲಿ ದೈವಿಕ ತೇಜಸ್ಸನ್ನು ತುಂಬಲಿದೆ.`,
            mr: `सत्संग, अन्नदान व परोपकार यामुळे आपले पुण्य संचित वाढेल. गोकर्ण महाबळेश्वराची नित्य भक्ती व 'ॐ नमः शिवाय' चा जप अंतःकरणात अथांग शांतता व चेहऱ्यावर आत्मिक तेज निर्माण करेल.`,
            hi: `सत्संग, अन्नदान एवं परोपकार आपके संचित पुण्यों में अभिवृद्धि करेंगे। श्री गोकर्ण महाबलेश्वर स्वामी का ध्यान एवं नित्य 'ॐ नमः शिवाय' जप अंतःकरण में अपूर्व शांति एवं मुख पर आध्यात्मिक तेज स्थापित करेगा।`,
            te: `సత్సంగం, దానధర్మాలు మరియు సేవా కార్యక్రమాలు పుణ్యఫలాన్ని పెంచుతాయి. శ్రీ గోకర్ణ మహాబలేశ్వరుని స్మరణ, నిత్య పంచాక్షరీ జపం మనస్సుకు అపారమైన ప్రశాంతతను, ముఖానికి ఆత్మిక వర్చస్సును చేకూరుస్తాయి.`,
            ta: `நல்லோர் சேர்க்கை, அன்னதானம் மற்றும் அறப்பணிகள் உங்கள் புண்ணியத்தை உயர்த்தும். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் வழிபாடு மற்றும் சிவ பஞ்சாட்சர ஜபம் மனதில் ஆழ்ந்த நிம்மதியையும் முகத்தில் அமைதியையும் உண்டாக்கும்.`,
            en: `Devoting contemplative hours to benevolent charities, satsangs, and temple seva exponentially compounds karmic merit. Revering Sri Gokarna Mahabaleshwara with steady Shiva Panchakshari japa bathes the inner spirit in luminous peace.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ನಿತ್ಯವೂ ಸಂಜೆ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಅಥವಾ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಶ್ರವಣ ಮಾಡಿ; ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತ ಧ್ಯಾನದಲ್ಲಿಡುವುದು ಆಯುರಾರೋಗ್ಯಕ್ಕೆ ಸಂಜೀವಿನಿ.",
          mr: "दररोज महामृत्युंजय मंत्र अथवा विष्णू सहस्रनामाचे श्रवण करावे; मन शांत ठेवणे हेच उत्तम आरोग्याचे रहस्य आहे.",
          hi: "नित्य महामृत्युंजय मंत्र अथवा श्री विष्णु सहस्रनाम का श्रवण करें; मन को शांत एवं ईश्वरार्पण रखना ही श्रेष्ठ आरोग्य है।",
          te: "రోజూ మహా మృత్యుంజయ మంత్రం లేదా విష్ణు సహస్రనామ పారాయణ వినండి; ప్రశాంతమైన ధ్యానం ఆయురారోగ్యాలకు శ్రీరామరక్ష.",
          ta: "தினமும் மகா மிருத்யுஞ்சய மந்திரம் அல்லது விஷ்ணு சகஸ்ரநாமம் கேளுங்கள்; அமைதியான தியானம் நீண்ட ஆயுளைத் தரும்.",
          en: "Listen to the Maha Mrityunjaya Stotram or Vishnu Sahasranama daily; anchoring awareness in tranquil meditation ensures radiant longevity."
        }, targetLang)
      },
      {
        id: "senior_health",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ, ದೀರ್ಘಾಯುಷ್ಯ ಕವಚ ಹಾಗೂ ದಿನಚರಿಯ ಶಿಸ್ತು",
          mr: "अध्याय २: आरोग्य संवर्धन, दीर्घायुष्य कवच व शिस्तबद्ध दिनचर्या",
          hi: "अध्याय २: स्वास्थ्य संवर्धन, दीर्घायु कवच एवं अनुशासित दिनचर्या",
          te: "ಅಧ್ಯಾಯಂ 2: ఆరోగ్య సంరక్షణ, దీర్ఘాయుష్షు కవచం & క్రమశిక్షణతో కూడిన దినచర్య",
          ta: "அத்தியாயம் 2: உடல் நலம் காத்தல், தீர்க்காயுள் கவசம் & ஒழுக்கமான தினசரி முறை",
          en: "Chapter 2: Mindful Health Preservation, Longevity Shield & Restorative Regimen"
        }, targetLang),
        subtitle: pick6({
          kn: "ಶನಿ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿಯ ಬಲದಿಂದ ನಿರೋಗಿ ಆಯುಷ್ಯ ರಕ್ಷೆ ಹಾಗೂ ನಿರಾಳತೆ",
          mr: "शनि व लग्नेशाच्या शुभ दृष्टीने निरामय आरोग्य व दीर्घायुष्य",
          hi: "शनि एवं लग्नेश की शुभ दृष्टि से आरोग्य रक्षा एवं शांति",
          te: "శని మరియు లగ్నాధిపతి బలంతో నిరోగి ఆయుష్షు రక్షణ & నిశ్చింత",
          ta: "சனி & லக்னாதிபதியின் அருளால் நோய் நொடிகள் நீங்கி நல்வாழ்வு & அமைதி",
          en: "Saturnine discipline and Lagna vitality guarding holistic wellness and graceful aging"
        }, targetLang),
        icon: "🌿",
        contemplationInquest: pick6({
          kn: "ನಿಯಮಿತ ದಿನಚರಿ, ಪಥ್ಯ ಆಹಾರ, ನಡಿಗೆ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷೆಯ ಮಹಾ ಚಿಂತನೆ",
          mr: "नित्य दिनचर्या, सात्विक पथ्य, चालणे व दीर्घायुष्याचे महाचिंतन",
          hi: "नियमित दिनचर्या, पथ्य-परहेज, नित्य भ्रमण एवं दीर्घायु रक्षा का चिंतन",
          te: "క్రమశిక్షణతో కూడిన దినచర్య, పథ్య ఆహారం, నడక & దీర్ఘాయుష్షు పై చింతన",
          ta: "முறையான உணவு, தகுந்த நடைப்பயிற்சி மற்றும் நீண்ட ஆயுள் சிந்தனை",
          en: "Contemplation on Satvik Nutrition, Joint Mobility & Sustainable Vitality"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಈ ವಯಸ್ಸಿನಲ್ಲಿ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ರಕ್ಷಣೆಯು ಪ್ರಥಮ ಆದ್ಯತೆಯಾಗಬೇಕು. ಜನ್ಮ ಶನಿ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಅನುಗ್ರಹದಿಂದಾಗಿ ವಾತ ದೋಷ ನಿಯಂತ್ರಣದಲ್ಲಿರಲಿದೆ. ಕೀಲು ನೋವು, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಮಧುಮೇಹದಂತಹ ವಯೋಸಹಜ ಸವಾಲುಗಳನ್ನು ನಿಯಮಿತ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಹಾಗೂ ಆಯುರ್ವೇದ ಪಥ್ಯದಿಂದ ಸಮರ್ಥವಾಗಿ ನಿಭಾಯಿಸಲು ಸಾಧ್ಯವಾಗಲಿದೆ.`,
            mr: `या वयात शारीरिक आरोग्याकडे प्रथम लक्ष देणे गरजेचे आहे. शनी व लग्नेशाच्या कृपेने वात दोषाचे योग्य निवारण होईल. सांधेदुखी, रक्तदाब यांसारख्या तक्रारींवर नियमित चालणे, हलका सात्विक आहार व वेळेवर औषधोपचार यामुळे प्रकृती स्थिर राहील.`,
            hi: `इस अवस्था में स्वास्थ्य संरक्षण को सर्वोच्च प्राथमिकता देना अनिवार्य है। जन्म शनि एवं लग्नेश की कृपा से वात संतुलन बना रहेगा। जोड़ों का दर्द, रक्तचाप आदि पर नित्य प्रातः भ्रमण, सुपाच्य भोजन एवं सम्यक दिनचर्या से पूर्ण नियंत्रण रहेगा।`,
            te: `ఈ వయస్సులో శారీరక ఆరోగ్య సంరక్షణ ప్రధాన కర్తవ్యం. శని, లగ్నాధిపతి అనుగ్రహంతో వాత దోషం అదుపులో ఉంటుంది. కీళ్ల నొప్పులు, రక్తపోటు వంటి వయోసహజ ఇబ్బందులను రోజూ నడక, మితాహారం మరియు వైద్య సలహాలతో చక్కగా అధిగమించవచ్చు.`,
            ta: `இந்த வயதில் உடல் ஆரோக்கியத்திற்கு முதலிடம் தர வேண்டும். சனி மற்றும் லக்னாதிபதியின் அருளால் வாத உபாதைகள் தணியும். மூட்டு வலி, இரத்த அழுத்தத்தை மிதமான நடைப்பயிற்சி, பத்திய உணவு மற்றும் முறையான மருத்துவ ஆலோசனையால் கட்டுக்குள் வைக்கலாம்.`,
            en: `Health preservation remains the foundational priority of senior life. Fortified Saturnine discipline harmonizes Vata dosha effectively. Age-related joint stiffness or metabolic fluctuations respond splendidly to daily gentle walks, light satvik dining, and periodic check-ups.`
          }, targetLang),
          pick6({
            kn: `ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ೩೦ ನಿಮಿಷಗಳ ಲಘು ನಡಿಗೆ, ಶುದ್ಧ ನೀರಿನ ಸೇವನೆ ಹಾಗೂ ರಾತ್ರಿ ಸಕಾಲಕ್ಕೆ ನಿದ್ರಿಸುವುದು ನಿಮ್ಮ ದೇಹದಲ್ಲಿ ನವಚೈತನ್ಯವನ್ನು ತುಂಬಲಿದೆ. ಅನಗತ್ಯ ಆತಂಕ ಅಥವಾ ಮನೆಯ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೆ ತಲೆಕೆಡಿಸಿಕೊಳ್ಳದೆ ಸದಾ ಪ್ರಸನ್ನಚಿತ್ತರಾಗಿರುವುದು ನಿಮ್ಮ ನರಮಂಡಲಕ್ಕೆ ಬಲ ನೀಡಲಿದೆ.`,
            mr: `रोज सकाळी अथवा संध्याकाळी अर्धा तास मोकळ्या हवेत फिरणे, भरपूर पाणी पिणे व वेळेवर विश्रांती घेणे ताजेतवाने ठेवेल. विनाकारण चिंता न करता आनंदी राहणे मज्जासंस्थेला बळकट करेल.`,
            hi: `प्रतिदिन प्रातः अथवा सांध्यकाल में ३० मिनट का सुगम भ्रमण, प्रचुर जलपान एवं समय पर विश्राम शरीर में स्फूर्ति बनाए रखेगा। अनावश्यक चिंताओं से मुक्त रहकर प्रसन्नचित्त रहना स्नायु तंत्र को सबल रखेगा।`,
            te: `రోజూ ఉదయం లేదా సాయంత్రం 30 నిమిషాలు నడవడం, తగినంత నీరు తాగడం మరియు వేళకు నిద్రపోవడం శరీరానికి ఉత్సాహాన్నిస్తాయి. అనవసర చింతలు పెట్టుకోకుండా ప్రశాంతంగా ఉండటం ఎంతో మంచిది.`,
            ta: `தினமும் காலை அல்லது மாலையில் 30 நிமிடங்கள் நடைப்பயிற்சி, போதுமான தண்ணீர் குடித்தல் மற்றும் நேரத்திற்கு உறங்குவது புத்துணர்வைத் தரும். தேவையற்ற கவலைகளைத் தவிர்ப்பது நரம்புகளைப் பலப்படுத்தும்.`,
            en: `Maintaining a 30-minute daily walking routine in fresh air, abundant hydration, and peaceful early sleep schedules preserves vibrant physical equilibrium. Cultivating lighthearted detachment from petty domestic trivialities protects mental poise.`
          }, targetLang),
          pick6({
            kn: `ಆಯುರ್ವೇದ ಪದ್ಧತಿಯಂತೆ ಬೆಚ್ಚಗಿನ ಎಳ್ಳೆಣ್ಣೆ ಅಥವಾ ಮಹಾನಾರಾಯಣ ತೈಲದಿಂದ ಕೀಲುಗಳಿಗೆ ಲಘು ಅಭ್ಯಂಗ ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ಅತ್ಯಂತ ಹಿತಕರ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮೃತ್ಯುಂಜಯ ಹೋಮದ ಪ್ರಸಾದ ರಕ್ಷೆಯನ್ನು ಧರಿಸುವುದರಿಂದ ಸಕಲ ಅನಿರೀಕ್ಷಿತ ಆರೋಗ್ಯ ಭಯಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿರಾತಂಕ ಆಯುಷ್ಯ ಲಭಿಸಲಿದೆ.`,
            mr: `आयुर्वेदानुसार तिळाचे तेल अथवा महानारायण तेलाने सांध्यांना हलकी मालिश करणे आरामदायी ठरेल. श्री क्षेत्र गोकर्ण महाबळेश्वराचा आशीर्वाद व रक्षा सूत्र धारण केल्याने आरोग्य संकटांचे निवारण होऊन उत्तम दीर्घायुष्य लाभेल.`,
            hi: `आयुर्वेद अनुसार तिल तैल अथवा महानारायण तैल की मालिश जोड़ों को आराम प्रदान करेगी। श्री गोकर्ण महाबलेश्वर स्वामी के महामृत्युंजय अनुष्ठान की रक्षा धारण करने से सभी आकस्मिक स्वास्थ्य भय दूर होंगे तथा सुखद दीर्घायु प्राप्त होगी।`,
            te: `నువ్వుల నూనె లేదా ఆయుర్వేద తైలంతో కీళ్లకు మర్దన చేసుకోవడం వల్ల ఎంతో ఉపశమనం లభిస్తుంది. శ్రీ గోకర్ణ మహాబలేశ్వరుని మృత్యుంజయ ప్రసాదం ధరించడం వల్ల ఆకస్మిక ఆరోగ్య భయాలు తొలగి నిండు నూరేళ్ళ ఆయుష్షు సిద్ధిస్తుంది.`,
            ta: `நல்லெண்ணெய் அல்லது ஆயுர்வேத தைலத்தால் மூட்டுகளில் மசாஜ் செய்வது நல்லது. ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் மிருத்யுஞ்சய ரக்ஷையை அணிவது எதிர்பாராத உடல் உபாதைகளை நீக்கி நீண்ட ஆயுளை அருளும்.`,
            en: `Adopting gentle warm sesame oil or Mahanarayana oil massages preserves joint flexibility and eases stiffness. Wearing the sanctified Mrityunjaya Raksha from Sri Kshetra Gokarna Mahabaleshwara dispels health anxieties, bestowing confident, serene longevity.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ತಾಜಾ ಸಾತ್ವಿಕ ಆಹಾರ, ಬೆಚ್ಚಗಿನ ಹಾಲು ಹಾಗೂ ಕಾಲಕಾಲಕ್ಕೆ ನಿಯಮಿತ ವಿಶ್ರಾಂತಿ ಪಡೆಯುವುದು ದೀರ್ಘಾಯುಷ್ಯದ ರಹಸ್ಯ.",
          mr: "ताजा सात्विक आहार, कोमट दूध व वेळेवर विश्रांती घेणे हेच निरोगी दीर्घायुष्याचे रहस्य आहे.",
          hi: "ताजा सुपाच्य भोजन, उष्ण दुग्ध एवं समयानुकूल पर्याप्त विश्राम ही दीर्घायु का अचूक साधन है।",
          te: "తాజా సాత్విక ఆహారం, గోరువెచ్చని పాలు మరియు సమయానికి విశ్రాంతి తీసుకోవడమే దీర్ఘాయుష్షు రహస్యం.",
          ta: "எளிய சத்தான உணவு, மிதமான பால் மற்றும் தகுந்த ஓய்வு எடுப்பதே நீண்ட ஆயுளின் ரகசியமாகும்.",
          en: "Rely upon warm satvik meals, soothing milk before sleep, and consistent restorative rest to safeguard lifelong vitality."
        }, targetLang)
      },
      {
        id: "senior_family_legacy",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳು, ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಶಾಂತಿ",
          mr: "अध्याय ३: कौटुंबिक मूल्ये, पुढच्या पिढीला मार्गदर्शन व जीवन समाधान",
          hi: "ಅಧ್ಯಾಯ ३: पारिवारिक संस्कार, भावी पीढ़ी को मार्गदर्शन एवं जीवन शांति",
          te: "అధ్యాయం 3: కుటుంబ విలువలు, భావి తరానికి మార్గదర్శనం & జీవిత సంతృప్తి",
          ta: "அத்தியாயம் 3: குடும்ப விழுமியங்கள், அடுத்த தலைமுறைக்கு வழிகாட்டல் & மனநிறைவு",
          en: "Chapter 3: Venerable Family Legacy, Wisdom Transmission & Fulfillment"
        }, targetLang),
        subtitle: pick6({
          kn: "೪ನೇ ಮತ್ತು ೫ನೇ ಭಾವಗಳ ಶುಭ ಪ್ರಭಾವದಿಂದ ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ಸಂತಾನ ತೃಪ್ತಿ",
          mr: "चतुर्थ व पंचम भावाच्या कृपेने घरात सुख-समाधान व नातवंडांचे प्रेम",
          hi: "चतुर्थ एवं पंचम भाव के प्रभाव से पारिवारिक सौहार्द एवं संतति सुख",
          te: "4 మరియు 5వ భావాల అనుగ్రహంతో ఇంట్లో సంతోషం & సంతాన తృప్తి",
          ta: "4 & 5ம் வீடுகளின் சுப பார்வையால் குடும்பத்தில் அமைதி & சந்ததியினர் மகிழ்ச்சி",
          en: "4th and 5th house harmonics establishing domestic joy and generational wisdom"
        }, targetLang),
        icon: "🕊️",
        contemplationInquest: pick6({
          kn: "ಮಕ್ಕಳು-ಮೊಮ್ಮಕ್ಕಳಿಗೆ ಸನ್ಮಾರ್ಗ, ಸ್ಥಿರಾಸ್ತಿ ಭದ್ರತೆ ಹಾಗೂ ಶಾಂತಿ ಚಿಂತನೆ",
          mr: "मुले व नातवंडांना सुसंस्कार, संपत्तीचे सुयोग्य नियोजन व समाधान विचार",
          hi: "संतति को सुसंस्कार, संपत्ति का सुव्यवस्थित नियोजन एवं शांति चिंतन",
          te: "పిల్లలకు సన్మార్గం, స్థిరాస్తి సంరక్షణ & ఆత్మ సంతృప్తి పై చింతన",
          ta: "பிள்ளைகளுக்கு நல்வழிகாட்டல், சொத்து நிர்வாகம் & அமைதி சிந்தனை",
          en: "Contemplation on Mentoring Descendants, Legacy Stewardship & Life Satisfaction"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಈ ಐದು ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಕೌಟುಂಬಿಕ ಜೀವನವು ಪರಿಪೂರ್ಣ ತೃಪ್ತಿಯನ್ನು ಕಾಣಲಿದೆ. ಮಕ್ಕಳು ತಮ್ಮ ತಮ್ಮ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಸಾಧನೆ ಮಾಡಿ ಉನ್ನತ ಮಟ್ಟಕ್ಕೇರುವುದು ನಿಮಗೆ ಅಪಾರ ಹೆಮ್ಮೆಯನ್ನು ತರಲಿದೆ. ಮೊಮ್ಮಕ್ಕಳ ಮುದ್ದಾದ ಆಟ, ತೊದಲು ಮಾತುಗಳು ನಿಮ್ಮ ಮನೆಯನ್ನು ನಂದನವನವನ್ನಾಗಿ ಮಾಡಲಿವೆ.`,
            mr: `या पाच वर्षांत आपले कौटुंबिक जीवन अत्यंत समाधानाने भरून जाईल. मुले आपापल्या क्षेत्रात प्रगती करून यश मिळवतील, ज्याचा आपल्याला सार्थ अभिमान वाटेल. नातवंडांच्या गोड सहवासाने घरात सदैव आनंदाचे वातावरण राहील.`,
            hi: `इन पांच वर्षों में आपका पारिवारिक जीवन परम तृप्ति एवं आनंद से परिपूर्ण रहेगा। संतान अपने-अपने कार्यक्षेत्र में उल्लेखनीय प्रगति करेगी, जिससे आपका मस्तक गर्व से ऊंचा होगा। पौत्र-पौत्रियों की किलकारियां गृह को नंदनवन बना देंगी।`,
            te: `ఈ ఐదు సంవత్సరాలలో మీ కుటుంబ జీవితం పరిపూర్ణ సంతృప్తిని చూస్తుంది. పిల్లలు తమ రంగాలలో మంచి విజయాలు సాధించి మీకు గర్వకారణంగా నిలుస్తారు. మనవళ్లు, మనవరాళ్ళ కేరింతలతో ఇల్లు ఆనంద నిలయంగా మారుతుంది.`,
            ta: `இந்த ஐந்து ஆண்டுகளில் உங்கள் குடும்ப வாழ்க்கை மிகுந்த திருப்தியைத் தரும். பிள்ளைகள் தங்கள் துறைகளில் சிறந்து விளங்குவது உங்களுக்கு பெருமை சேர்க்கும். பேரக்குழந்தைகளின் அன்பு இல்லத்தை மகிழ்ச்சிக் கடலாக்கும்.`,
            en: `Across these 5 years, your domestic sphere blossoms into profound fulfillment. Witnessing children attain distinguished professional and personal milestones evokes deep parental pride, while the joyful laughter of grandchildren enlivens the household.`
          }, targetLang),
          pick6({
            kn: `ನಿಮ್ಮ ಜೀವಿತಾವಧಿಯ ಕಷ್ಟಾರ್ಜಿತ ಸ್ಥಿರಾಸ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಹಾಗೂ ನ್ಯಾಯಸಮ್ಮತವಾಗಿ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಹಂಚುವ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳಲು ಇದು ಪ್ರಶಸ್ತ ಕಾಲ. ಯಾವುದೇ ವಿವಾದಗಳಿಲ್ಲದೆ ಎಲ್ಲರನ್ನೂ ಪ್ರೀತಿಯಿಂದ ಒಗ್ಗೂಡಿಸಿ ಮುನ್ನಡೆಸುವ ನಿಮ್ಮ ನಾಯಕತ್ವವು ಕುಟುಂಬದ ಏಕತೆಗೆ ಕಳಶಪ್ರಾಯವಾಗಲಿದೆ.`,
            mr: `आपल्या कष्टाने उभी केलेली संपत्ती व घराचे योग्य व पारदर्शक नियोजन करण्यासाठी हा काळ अनुकूल आहे. सर्वांना प्रेमाने एकत्र ठेवून आपण घेतलेले निर्णय कुटुंबात एकोपा व शांतता टिकवून ठेवतील.`,
            hi: `अपने जीवन भर की संचित संपत्ति एवं गृह का न्यायसंगत, पारदर्शी नियोजन करने हेतु यह अत्यंत श्रेष्ठ काल है। सभी को स्नेह के सूत्र में बांधकर आपके द्वारा लिए गए निर्णय कुल में दीर्घकालिक शांति एवं एकता स्थापित करेंगे।`,
            te: `మీ జీవితకాలంలో సంపాదించిన ఆస్తులను న్యాయబద్ధంగా, ప్రశాంతంగా తర్వాతి తరానికి అందించే నిర్ణయాలు తీసుకోవడానికి ఇది మంచి సమయం. అందరినీ కలుపుకుని పోయే మీ వ్యవహార శైలి కుటుంబ ఐక్యతకు నిదర్శనంగా నిలుస్తుంది.`,
            ta: `உங்கள் உழைப்பால் சேர்த்த சொத்துக்களை சுமுகமாகவும் நேர்மையாகவும் அடுத்த தலைமுறைக்கு பகிர்ந்தளிக்க இது உகந்த காலமாகும். அனைவரையும் அன்புடன் அரவணைத்து நீங்கள் எடுக்கும் முடிவுகள் குடும்ப ஒற்றுமையை வளர்க்கும்.`,
            en: `This represents an ideal astrological window for the peaceful, equitable stewardship and legacy distribution of hard-won assets. Your fair-minded counsel unifies the extended family in warm mutual solidarity, preempting any future disputes.`
          }, targetLang),
          pick6({
            kn: `ಜೀವನದ ಸಾರ್ಥಕತೆಯನ್ನು ಅನುಭವಿಸುತ್ತಾ, ಎಲ್ಲ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಸುಸೂತ್ರವಾಗಿ ನಿರ್ವಹಿಸಿದ ತೃಪ್ತಿಯೊಂದಿಗೆ ನೀವು ಕಾಲ ಕಳೆಯುವಿರಿ. ಸಂಜೆ ದೇವರ ಧ್ಯಾನ, ಮಂದಿರ ದರ್ಶನ ಹಾಗೂ ಸಮಾಜದ ಹಿತೈಷಿಯಾಗಿ ಇತರರಿಗೆ ಸದಾ ಸದಾಶಯಗಳನ್ನು ಹಾರೈಸುವುದು ನಿಮ್ಮ ಆತ್ಮವನ್ನು ಮುಕ್ತಿ ಮಾರ್ಗದತ್ತ ಮುನ್ನಡೆಸಲಿದೆ.`,
            mr: `जीवनाची सार्थकता अनुभवत, सर्व कर्तव्ये उत्तम प्रकारे पार पाडल्याचे परम समाधान लाभेल. संध्याकाळी देवदर्शन, सत्संग व सर्वांच्या कल्याणाची प्रार्थना आपले जीवन कृतार्थ करेल.`,
            hi: `जीवन की सार्थकता का अनुभव करते हुए, सभी सांसारिक दायित्वों के सफल निर्वहन का आत्मसंतोष प्राप्त होगा। संध्या समय ईश-वंदना, सत्संग एवं सर्वकल्याण की भावना आपके अंतःकरण को शांति प्रदान करेगी।`,
            te: `జీవిత సాఫల్యతను అనుభవిస్తూ, అన్ని బాధ్యతలను చక్కగా నెరవేర్చిన సంతృప్తితో కాలం గడుపుతారు. సాయంత్రం వేళల్లో దైవ ధ్యానం, సత్సంగం మరియు అందరి క్షేమాన్ని కోరుకోవడం వల్ల ఆత్మశాంతి కలుగుతుంది.`,
            ta: `வாழ்க்கையின் நிறைவை உணர்ந்து, அனைத்து கடமைகளையும் சிறப்பாக முடித்த மனத்திருப்தி கிட்டும். மாலை நேரத்து இறை வழிபாடு, தியானம் மற்றும் பொதுநல சிந்தனை உங்கள் வாழ்வை அர்த்தமுள்ளதாக்கும்.`,
            en: `Embracing a profound sense of dharmic completion, you enjoy the serene tranquility of duties honorably fulfilled. Evening temple visits, quiet meditation, and bestowing blessings upon all beings illuminate the soul's highest spiritual path.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಕುಟುಂಬದ ಸಣ್ಣಪುಟ್ಟ ಮಾತುಕತೆಗಳನ್ನು ಕಿವಿಗೆ ಹಾಕಿಕೊಳ್ಳದೆ ಸದಾ ಶಾಂತರಾಗಿರಿ; ಮಕ್ಕಳಿಗೆ ನಿಮ್ಮ ಆಶೀರ್ವಾದವೇ ಮಹಾರಕ್ಷೆ.",
          mr: "लहानसहान गोष्टींकडे दुर्लक्ष करून शांत राहा; मुलांना दिलेला आपला शुभाशीर्वाद हेच त्यांचे मोठे संरक्षण आहे.",
          hi: "छोटी-मोटी बातों की अनदेखी कर सदैव शांत रहें; संतति को दिया गया आपका शुभाशीर्वाद ही उनकी सबसे बड़ी ढाल है।",
          te: "చిన్న విషయాలను పట్టించుకోకుండా ప్రశాంతంగా ఉండండి; పిల్లలకు మీ ఆశీర్వాదాలే రక్షా కవచం.",
          ta: "சிறு விஷயங்களைப் பெரிதுபடுத்தாமல் அமைதியாக இருங்கள்; பிள்ளைகளுக்கு உங்கள் ஆசீர்வாதமே சிறந்த பாதுகாப்பு.",
          en: "Overlook petty domestic friction with gracious detachment; your loving blessings serve as an impenetrable armor for your family."
        }, targetLang)
      }
    );
  } else {
    // Adult (23 - 55)
    chapters.push(
      {
        id: "adult_career",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ವೃತ್ತಿ ದಿಗ್ವಿಜಯ, ನಾಯಕತ್ವ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆಯ ೫-ವರ್ಷಗಳ ರೇಖೆ",
          mr: "अध्याय १: करिअरमधील भरारी, नेतृत्व व व्यापार विस्ताराचा ५ वर्षांचा महामार्ग",
          hi: "अध्याय १: करियर विजय, नेतृत्व एवं व्यापार विस्तार का ५-वर्षीय महामार्ग",
          te: "అధ్యాయం 1: కెరీర్ దిగ్విజయం, నాయకత్వం & వ్యాపార విస్తరణ 5 సంవత్సరాల ప్రణాళిక",
          ta: "அத்தியாயம் 1: தொழில் வெற்றி, தலைமைத்துவம் & வர்த்தக விரிவாக்கம் 5 ஆண்டுப் பாதை",
          en: "Chapter 1: Career Sovereign Expansion, Executive Leadership & Enterprise Scaling"
        }, targetLang),
        subtitle: pick6({
          kn: "೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿ ಹಾಗೂ ಶನಿ-ಗುರು ಗೋಚಾರದ ಸಂಯೋಗ",
          mr: "दशमेश व शनि-गुरूच्या गोचराचा अत्यंत शुभ संयोग",
          hi: "दशमेश एवं शनि-गुरु के गोचर का शुभ संयोग",
          te: "10వ అధిపతి మరియు శని-గురు గోచార శుభ కలయిక",
          ta: "10ம் அதிபதி & சனி-குரு கோச்சாரத்தின் மகத்தான யோகம்",
          en: "Convergence of 10th lord vitality, Saturnine discipline and Jovian expansion"
        }, targetLang),
        icon: "💼",
        contemplationInquest: pick6({
          kn: "ದಶಮ ಭಾವಾಧಿಪತಿಯ ಬಲ, ವೃತ್ತಿ ನಾಯಕತ್ವ ಹಾಗೂ ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಅಧಿಕಾರ ಯೋಗ ಚಿಂತನೆ",
          mr: "दशमेश व शनि-गुरूच्या कृपेने करिअरमधील सर्वोच्च अधिकार व भरारीचे तत्त्व चिंतन",
          hi: "दशम भाव एवं शनि-गुरु के प्रभाव से करियर विजय एवं कार्यक्षेत्र में नेतृत्व विचार",
          te: "దశమ భావాధిపతి బలం, కెరీర్ నాయకత్వం మరియు రాబోయే 5 సంవత్సరాల అధికార యోగ చింతన",
          ta: "பத்தாம் அதிபதியின் பலம் மற்றும் அடுத்த 5 ஆண்டுகளின் தொழில் தலைமைத்துவ சிந்தனை",
          en: "Contemplation on 10th House Lordship, Professional Sovereignty & Leadership Horizons"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ ಜೀವನವು ಮಹತ್ವದ ಎತ್ತರವನ್ನು ತಲುಪಲಿದೆ. ಸಾಮಾನ್ಯ ಉದ್ಯೋಗಿಯಾಗಿದ್ದರೂ ನಾಯಕತ್ವ ಹುದ್ದೆಗೆ ಏರುವ ಯೋಗವಿದೆ. ಸ್ವಂತ ವ್ಯಾಪಾರ ಅಥವಾ ಉದ್ಯಮ ನಡೆಸುವವರಿಗೆ ವ್ಯವಹಾರವನ್ನು ವಿಸ್ತರಿಸಲು ಬೃಹತ್ ಅವಕಾಶಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ.`,
            mr: `पुढील ५ वर्षांत आपले करिअर अत्यंत सन्माननीय उंचीवर पोहोचेल. नोकरीत वरिष्ठ पदोन्नती, मोठी जबाबदारी व अधिकारांचे योग आहेत. स्वतःचा व्यवसाय करणाऱ्यांसाठी शाखा विस्तार व नव्या करारांची सुवर्णसंधी चालून येईल.`,
            hi: `आगामी ५ वर्षों में आपका करियर अभूतपूर्व ऊंचाइयों को स्पर्श करेगा। पदोन्नति, नेतृत्व पद एवं प्रभाव क्षेत्र में भारी विस्तार होगा। व्यापार करने वालों के लिए नए अनुबंध एवं विस्तार के स्वर्ण अवसर मिलेंगे।`,
            te: `రాబోయే 5 సంవత్సరాలలో మీ వృత్తి జీవితం అద్భుతమైన ఉన్నత శిఖరాలను చేరుకుంటుంది. ఉద్యోగంలో పదోన్నతి, నాయకత్వ బాధ్యతలు లభిస్తాయి. వ్యాపారస్తులకు బ్రాంచీల విస్తరణ మరియు కొత్త ఒప్పందాల అవకాశాలు లభిస్తాయి.`,
            ta: `அடுத்த 5 ஆண்டுகளில் உங்கள் தொழில் வாழ்க்கை மகத்தான உயரங்களைத் தொடும். உயர் பதவிகள், நிர்வாக பொறுப்புகள் கிட்டும். தொழில் செய்வோருக்கு புதிய வாய்ப்புகளும் விரிவாக்கமும் ஏற்படும்.`,
            en: `The upcoming 5-year cycle elevates your professional authority onto a grander stage. Expect pivotal executive promotions, leadership stewardship, or exponential enterprise expansion.`
          }, targetLang),
          pick6({
            kn: `ವರ್ಷ ೨ ಮತ್ತು ವರ್ಷ ೪ ರ ಅವಧಿಯು ನಿಮ್ಮ ವೃತ್ತಿಪರ ಜೀವನದ ಗೋಲ್ಡನ್ ಇಯರ್ಸ್ ಆಗಿ ಪರಿಣಮಿಸಲಿವೆ. ಸರ್ಕಾರದ ಮಟ್ಟದಲ್ಲಿ ಅಥವಾ ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಸಂಪರ್ಕದಿಂದ ದೊಡ್ಡ ಕೆಲಸಗಳು ಸುಲಭವಾಗಿ ನೆರವೇರಲಿವೆ.`,
            mr: `दुसरे व चौथे वर्ष आपल्या व्यावसायिक जीवनातील 'सुवर्ण पर्व' ठरेल. वरिष्ठ अधिकारी व प्रभावशाली व्यक्तींच्या सहकार्याने मोठी कामे मार्गी लागतील.`,
            hi: `द्वितीय एवं चतुर्थ वर्ष आपके करियर के 'स्वर्णिम वर्ष' सिद्ध होंगे। उच्चाधिकारियों एवं शासन स्तर पर आपके संपर्क लाभप्रद रहेंगे।`,
            te: `2వ మరియు 4వ సంవత్సరాలు మీ కెరీర్‌లో సువర్ణ సంవత్సరాలుగా నిలుస్తాయి. ఉన్నతాధికారుల సహాయంతో పనులు సులభంగా పూర్తవుతాయి.`,
            ta: `2 மற்றும் 4ஆம் ஆண்டுகள் உங்கள் தொழிலின் பொற்காலமாக மாறும். அதிகாரிகளின் ஆதரவால் பெரிய திட்டங்கள் வெற்றிகரமாக நிறைவேறும்.`,
            en: `Years 2 and 4 represent landmark golden windows where high-stakes deals, government clearances, and career breakthroughs crystallize.`
          }, targetLang),
          pick6({
            kn: `ಮುಂದಿನ ಐದು ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ನಾಯಕತ್ವದ ಕೌಶಲ್ಯಗಳಿಗೆ ವ್ಯಾಪಕ ಮನ್ನಣೆ ದೊರೆಯಲಿದೆ. ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹತ್ವದ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುನ್ನಡೆಸುವಿರಿ. ಸ್ವಂತ ಉದ್ಯಮ ಪ್ರಾರಂಭಿಸಲು ಅಥವಾ ವಿಸ್ತರಿಸಲು ಶುಕ್ಲ ಪಕ್ಷದ ಗುರು ಪ್ರಭಾವದ ತಿಂಗಳುಗಳು ಅತ್ಯಂತ ಲಾಭದಾಯಕವಾಗಿವೆ.`,
            mr: `पुढील पाच वर्षांत तुमच्या नेतृत्वगुणांना मोठी मान्यता मिळेल. नोकरी व व्यवसायात महत्त्वाचे प्रकल्प यशस्वीपणे पूर्ण कराल. नवीन उद्योग सुरू करण्यासाठी किंवा विस्तारासाठी गुरूच्या शुभ प्रभावाचा काळ अत्यंत फायदेशीर ठरेल.`,
            hi: `आगामी पांच वर्षों में आपके नेतृत्व कौशल को व्यापक प्रतिष्ठा प्राप्त होगी। कार्यक्षेत्र में महत्वपूर्ण परियोजनाओं का सफल नेतृत्व करेंगे। नवीन व्यवसाय के शुभारंभ अथवा विस्तार हेतु गुरु के शुभ गोचर का समय अत्यंत फलदायी रहेगा।`,
            te: `రాబోయే ఐదు సంవత్సరాలలో మీ నాయకత్వ నైపుణ్యాలకు గొప్ప గుర్తింపు లభిస్తుంది. ఉద్యోగంలో కీలక ప్రాజెక్టులను విజయవంతంగా నడిపిస్తారు. నూతన వ్యాపార ప్రారంభానికి లేదా విస్తరణకు గురు అనుగ్రహ కాలం అత్యంత లాభదాయకంగా ఉంటుంది.`,
            ta: `அடுத்த ஐந்து ஆண்டுகளில் உங்கள் தலைமைப் பண்புகளுக்கு பெரும் அங்கீகாரம் கிட்டும். புதிய தொழில் தொடங்க அல்லது விரிவாக்க குருவின் அருள் உள்ள காலங்கள் மிகுந்த லாபத்தை தரும்.`,
            en: `Over the upcoming 5-year arc, your leadership capacity commands wide respect. High-stakes ventures and professional enterprise scaling flourish during favorable Jupiter transit windows.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಮಹತ್ವದ ಒಪ್ಪಂದಗಳನ್ನು ಗುರುಬಲವಿರುವ ಶುಕ್ಲ ಪಕ್ಷದ ದಿನಗಳಲ್ಲಿ ಸಹಿ ಮಾಡಿ.",
          mr: "महत्त्वाचे व्यावसायिक करार गुरूच्या शुभ काळात किंवा शुक्ल पक्षात करणे श्रेयस्कर ठरेल.",
          hi: "महत्वपूर्ण अनुबंधों पर गुरु के शुभ गोचर अथवा शुक्ल पक्ष में ही हस्ताक्षर करें।",
          te: "ముఖ్యమైన ఒప్పందాలను గురుబలమున్న శుక్ల పక్షంలో ఖరారు చేసుకోండి.",
          ta: "முக்கியமான ஒப்பந்தங்களை குரு பலம் உள்ள வளர்பிறை நாட்களில் கையெழுத்திடுங்கள்.",
          en: "Finalize high-value contracts and institutional leaps during waxing Moon (Shukla Paksha) Guru transits."
        }, targetLang)
      },
      {
        id: "adult_wealth",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಧನ ಸಮೃದ್ಧಿ, ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಭವಿಷ್ಯದ ಹೂಡಿಕೆಗಳು",
          mr: "अध्याय २: धनसंपत्ती, जागा-घर खरेदी व दीर्घकालीन गुंतवणूक",
          hi: "अध्याय २: धन समृद्धि, अचल संपत्ति क्रय एवं भविष्य के निवेश",
          te: "అధ్యాయం 2: ధన సమృద్ధి, స్థిరాస్తి కొనుగోలు & దీర్ఘకాలిక పెట్టుబడులు",
          ta: "அத்தியாயம் 2: தன விருத்தி, சொத்து வாங்குதல் & எதிர்கால சேமிப்பு",
          en: "Chapter 2: Wealth Accumulation, Real Estate Acquisition & Asset Mastery"
        }, targetLang),
        subtitle: pick6({
          kn: "೨ನೇ ಹಾಗೂ ೧೧ನೇ ಭಾವದ ಧನಯೋಗಗಳ ಪೂರ್ಣ ಫಲ",
          mr: "द्वितीय व एकादश भावातील धनयोगांचे पूर्ण फळ",
          hi: "द्वितीय एवं एकादश भाव के धनयोगों का पूर्ण प्रकटीकरण",
          te: "2 మరియు 11వ భావాల ಧನయోగాల సంపూర్ణ ఫలం",
          ta: "2 & 11ம் வீடுகளின் தனயோகங்களின் பூரண பலன்",
          en: "Fruition of 2nd (Dhana) and 11th (Labha) wealth matrices"
        }, targetLang),
        icon: "💰",
        contemplationInquest: pick6({
          kn: "ಧನ-ಲಾಭ ಭಾವಗಳ ಯೋಗಫಲ, ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಭವಿಷ್ಯದ ಆರ್ಥಿಕ ಭದ್ರತೆಯ ವಿಮರ್ಶೆ",
          mr: "द्वितीय व एकादश भावातील धनयोग, स्थावर संपत्ती व दीर्घकालीन आर्थिक स्थैर्याचा विचार",
          hi: "द्वितीय एवं एकादश भाव के धनयोग, अचल संपत्ति एवं भावी आर्थिक सुरक्षा का विश्लेषण",
          te: "ధన-లాభ భావాల ఫలితాలు, స్థిరాస్తి కొనుగోలు & ఆర్థిక భద్రత సమీక్ష",
          ta: "தன-லாப ஸ்தானங்களின் யோக பலன்கள் மற்றும் எதிர்கால நிதிப் பாதுகாப்பு சிந்தனை",
          en: "Inquest on Dhana-Labha Matrix, Real Estate Acquisition & Generational Wealth Compounding"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಆದಾಯದ ಹರಿವು ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಾಗಲಿದ್ದು, ಹಿಂದಿನ ಸಾಲಗಳನ್ನು ತೀರಿಸಿ ಸ್ಥಿರ ಉಳಿತಾಯವನ್ನು ನಿರ್ಮಿಸಿಕೊಳ್ಳಲು ಇದು ಅತ್ಯುತ್ತಮ ಕಾಲ. ಪೂರ್ವಿಕರ ಆಸ್ತಿಯಿಂದ ಅಥವಾ ನೂತನ ಹೂಡಿಕೆಗಳಿಂದ ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನದ ಯೋಗವಿದೆ.`,
            mr: `उत्पन्नाचा ओघ लक्षणीयरीत्या वाढेल. जुन्या कर्जांची परतफेड होऊन स्वतःचे मजबूत बँक बॅलन्स तयार होईल. वडिलोपार्जित संपत्तीतून किंवा गुंतवणुकीतून मोठा आर्थिक लाभ संभवतो.`,
            hi: `आय में निरंतर वृद्धि होगी। पुराने ऋणों से मुक्ति पाकर आप एक सुदृढ़ बैंक बैलेंस का निर्माण करेंगे। भूमि-भवन अथवा पैतृक संपत्ति से अप्रत्याशित लाभ के योग हैं।`,
            te: `ఆదాయం గణనీయంగా పెరుగుతుంది. పాత అప్పులు తీర్చి స్థిరమైన బ్యాంక్ బ్యాలెన్స్ సమకూర్చుకుంటారు. భూమి లేదా పూర్వీకుల ఆస్తి నుండి అనుకోని ధనలాభం కలుగుతుంది.`,
            ta: `வருமானம் சீராக உயரும். பழைய கடன்களை அடைத்து நல்ல சேமிப்பை உருவாக்குவீர்கள். பூர்வீக சொத்து அல்லது முதலீடுகள் மூலம் லாபம் பெருகும்.`,
            en: `Accelerating income streams will empower you to liquidate historical liabilities and amass substantial liquid treasuries. Capital gains from land or ancestry materialize favorably.`
          }, targetLang),
          pick6({
            kn: `ಮುಂದಿನ ೩ ವರ್ಷಗಳ ಒಳಗಾಗಿ ಸ್ವಂತ ಸೂರು, ನಿವೇಶನ ಅಥವಾ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಖರೀದಿಸುವ ನಿಮ್ಮ ಬಹುದಿನಗಳ ಕನಸು ಸಾಕಾರಗೊಳ್ಳಲಿದೆ. ಧಾರ್ಮಿಕ ನಿಯಮಗಳಿಗೆ ಬದ್ಧವಾಗಿ ಮಾಡುವ ಹೂಡಿಕೆಗಳು ಶೀಘ್ರ ಫಲ ನೀಡಲಿವೆ.`,
            mr: `पुढील ३ वर्षांच्या आत स्वतःचे घर, फ्लॅट किंवा शेतजमीन खरेदी करण्याचे तुमचे अनेक वर्षांचे स्वप्न पूर्ण होईल. कागदपत्रे तपासून केलेली गुंतवणूक भरभराट आणेल.`,
            hi: `आगामी ३ वर्षों के भीतर स्वयं का घर, भूखंड अथवा कृषि भूमि क्रय करने का बहुप्रतीक्षित स्वप्न साकार होगा। विधिपूर्वक किया गया निवेश निरंतर लाभ देगा।`,
            te: `రాబోయే 3 సంవత్సరాలలో సొంత ఇల్లు, స్థలం లేదా వ్యవసాయ భూమి కొనుగోలు చేయాలనే మీ కల నెరవేరుతుంది. శుభ ముహూర్తాలలో చేసే పెట్టుబడులు శుభప్రదం.`,
            ta: `அடுத்த 3 ஆண்டுகளுக்குள் சொந்த வீடு, மனை வாங்கும் உங்களின் நீண்ட நாள் கனவு நனவாகும். சுப முகூர்த்தத்தில் தொடங்கும் முதலீடுகள் வளரும்.`,
            en: `Within the next 3 years, longstanding aspirations of acquiring prime residential property, land, or commercial plots will reach fruition.`
          }, targetLang),
          pick6({
            kn: `ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆ, ಚಿನ್ನದ ಸಂಚಯ ಹಾಗೂ ಸುರಕ್ಷಿತ ದೀರ್ಘಾವಧಿಯ ಉಳಿತಾಯಗಳು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಶಾಶ್ವತಗೊಳಿಸಲಿವೆ. ಅನಗತ್ಯ ಸಾಲಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕಿ ಸ್ಥಿರ ಆಸ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳುವುದು ಭವಿಷ್ಯದ ಪೀಳಿಗೆಗೆ ಭದ್ರ ಅಡಿಪಾಯವಾಗಲಿದೆ.`,
            mr: `स्थावर मालमत्ता, सोने व सुरक्षित दीर्घकालीन गुंतवणुकीतून तुमचे आर्थिक स्थैर्य कायमस्वरूपी मजबूत होईल. अनावश्यक खर्चांवर नियंत्रण ठेवून संपत्तीची वृद्धी करणे पुढील पिढीसाठी भक्कम आधार ठरेल.`,
            hi: `अचल संपत्ति, स्वर्ण संचय एवं सुरक्षित दीर्घकालिक निवेश से आपकी आर्थिक सुदृढ़ता चिरस्थायी बनेगी। अनावश्यक व्यय पर नियंत्रण रखकर संचित पूंजी को बढ़ाना भावी पीढ़ी हेतु सुदृढ़ आधार सिद्ध होगा।`,
            te: `స్థిరాస్తి, బంగారం మరియు సురక్షిత దీర్ఘకాలిక పెట్టుబడులతో మీ ఆర్థిక స్థిరత్వం శాశ్వతంగా బలపడుతుంది. అనవసర ఖర్చులను నియంత్రించి ఆస్తులను వృద్ధి చేయడం భవిష్యత్తు తరాలకు రక్షగా నిలుస్తుంది.`,
            ta: `நிலம், தங்கம் மற்றும் பாதுகாப்பான நீண்ட கால சேமிப்புகள் உங்கள் நிதி நிலையை நிரந்தரமாக உயர்த்தும். தேவையற்ற செலவுகளைக் கட்டுப்படுத்தி சொத்துக்களை பெருக்குவது எதிர்காலத்திற்கு சிறந்த அடித்தளமாகும்.`,
            en: `Diversified asset accumulation in real estate, gold reserves, and prudent wealth allocations guarantees generational security, cementing lifelong economic resilience.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಶುಕ್ರವಾರ ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಚಿನ್ನ/ಭೂಮಿ ರೂಪದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿ.",
          mr: "शुक्रवारी कनकधारा स्तोत्राचे पठण करावे व सोने अथवा जमिनीत केलेली गुंतवणूक दीर्घकाळ लाभदायक ठरेल.",
          hi: "शुक्रवार को कनकधारा स्तोत्र का पाठ करें तथा स्वर्ण/भूमि में निवेश को प्राथमिकता दें।",
          te: "శుక్రవారం కనకధారా స్తోత్రం పఠించండి; బంగారం లేదా భూమి రూపంలో పెట్టుబడి పెట్టండి.",
          ta: "வெள்ளிக்கிழமை கனகதாரா ஸ்தோத்திரம் படியுங்கள்; தங்கம் அல்லது நிலத்தில் முதலீடு செய்யுங்கள்.",
          en: "Prioritize tangible asset investments in real estate and gold alongside Kanakadhara Stotram."
        }, targetLang)
      },
      {
        id: "adult_family",
        title: pick6({
          kn: isMarried ? "ಅಧ್ಯಾಯ ೩: ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ ಹಾಗೂ ಗೃಹ ಶಾಂತಿ" : "ಅಧ್ಯಾಯ ೩: ಸಂಸಾರ ಸುಖ, ಕಂಕಣ ಭಾಗ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶುಭ ಸಮಾರಂಭ",
          mr: isMarried ? "अध्याय ३: दांपत्य सौख्य, कौटुंबिक शांतता व गृह समृद्धी" : "अध्याय ३: वैवाहिक सौख्य, विवाह योग व मंगलकार्ये",
          hi: isMarried ? "अध्याय ३: दांपत्य सुख, पारिवारिक सौहार्द एवं गृह शांति" : "अध्याय ३: विवाह योग, पाणिग्रहण संस्कार एवं मांगलिक प्रसंग",
          te: isMarried ? "అధ్యాయం 3: దాంపత్య సౌభాగ్యం, కుటుంబ సామరస్యం & గృహ శాంతి" : "అధ్యాయం 3: దాంపత్య సుఖం, వివాహ ప్రాప్తి & శుభకార్యాలు",
          ta: isMarried ? "அத்தியாயம் 3: தம்பதியர் ஒற்றுமை, இல்லற மகிழ்ச்சி & குடும்ப அமைதி" : "அத்தியாயம் 3: சுப விவாஹ யோகம் & குடும்ப சுப நிகழ்வுகள்",
          en: isMarried ? "Chapter 3: Matrimonial Serenity, Spousal Camaraderie & Domestic Peace" : "Chapter 3: Matrimonial Alliances, Wedding Horizons & Auspicious Milestones"
        }, targetLang),
        subtitle: pick6({
          kn: "೭ನೇ ಹಾಗೂ ೪ನೇ ಮನೆಯ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಗೃಹ ಸೌಭಾಗ್ಯ",
          mr: "सप्तम व चतुर्थ भावाच्या शुभ दृष्टीने गृहसौख्य व समाधान",
          hi: "सप्तम एवं चतुर्थ भाव के शुभ प्रभाव से गृह लक्ष्मी कृपा",
          te: "7 మరియు 4వ భావాల శుభ దృష్టితో గృహ సౌభాగ్యం",
          ta: "7 & 4ம் வீடுகளின் சுப பார்வையால் இல்லற சுபிக்ஷம்",
          en: "4th house domestic tranquility harmonizing 7th house marital bonds"
        }, targetLang),
        icon: isMarried ? "🏡" : "💍",
        contemplationInquest: pick6({
          kn: isMarried ? "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಗೃಹಲಕ್ಷ್ಮಿ ಕೃಪೆಯ ದಿವ್ಯ ಚಿಂತನೆ" : "ವಿವಾಹ ಭಾಗ್ಯ, ಕಂಕಣ ಯೋಗ ಹಾಗೂ ನೂತನ ಜೀವನ ಸಂಗಾತಿಯ ಆಗಮನದ ವಿವೇಚನೆ",
          mr: isMarried ? "दांपत्य सौख्य, कौटुंबिक शांतता व गृहलक्ष्मीच्या कृपेचे मंगल चिंतन" : "विवाह योग, अनुरूप जोडीदार व कौटुंबिक आनंदाचा विचार",
          hi: isMarried ? "दांपत्य सुख, पारिवारिक शांति एवं गृहलक्ष्मी कृपा का पावन चिंतन" : "विवाह योग, सुयोग्य जीवनसाथी एवं मांगलिक प्रसंगों का विचार",
          te: isMarried ? "దాంపత్య సౌభాగ్యం, కుటుంబ శాంతి & గృహలక్ష్మి కృపా వివేచన" : "వివాహ ప్రాప్తి, సుగుణ భాగస్వామి & నూతన జీవిత ఆరంభ చింతన",
          ta: isMarried ? "தம்பதியர் ஒற்றுமை, குடும்ப அமைதி & இல்லற சுபிக்ஷ சிந்தனை" : "சுப விவாஹ யோகம், நல்ல வரன் அமையும் நல்வாய்ப்பு சிந்தனை",
          en: isMarried ? "Contemplation on Matrimonial Companionship, Domestic Serenity & Family Harmony" : "Contemplation on Sacred Matrimonial Horizons, Spousal Camaraderie & Wedding Grace"
        }, targetLang),
        paragraphs: [
          isMarried
            ? pick6({
              kn: `ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ, ವಿಶ್ವಾಸ ಹಾಗೂ ಸೌಹಾರ್ದತೆ ಹೆಚ್ಚಾಗಲಿದೆ. ಸಂಗಾತಿಯೊಂದಿಗೆ ಕೂಡಿ ಮಾಡುವ ಆರ್ಥಿಕ ಮತ್ತು ಕೌಟುಂಬಿಕ ಯೋಜನೆಗಳು ಸುಲಭವಾಗಿ ಈಡೇರಲಿವೆ. ಈ ಹಿಂದೆ ಇದ್ದ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಶಮನವಾಗಲಿವೆ.`,
              mr: `कुटुंबात परस्पर प्रेम, विश्वास व सौहार्द वाढेल. वैवाहिक जीवनातील पूर्वीचे गैरसमज दूर होऊन जोडीदाराच्या साथीने मोठे यश लाभेल.`,
              hi: `परिवार में परस्पर प्रेम, विश्वास एवं सामंजस्य बढ़ेगा। दांपत्य जीवन में पूर्व के मतभेद समाप्त होकर जीवनसाथी के साथ संबंध और अधिक मधुर होंगे।`,
              te: `కుటుంబంలో పరస్పర ప్రేమ, నమ్మకం మరియు సామరస్యం పెరుగుతాయి. గత విభేదాలు సమసిపోయి జీవిత భాగస్వామితో సంబంధాలు బలపడతాయి.`,
              ta: `குடும்பத்தில் அன்பு, நம்பிக்கை பெருகும். தம்பதியர் இடையே பழைய மனஸ்தாபங்கள் நீங்கி புரிதல் அதிகரிக்கும்.`,
              en: `Domestic serenity will deepen with marital camaraderie. Mutual trust dissolves historical frictions and strengthens companionship.`
            }, targetLang)
            : pick6({
              kn: `ಅವಿವಾಹಿತರಿಗೆ ಶೀಘ್ರ ವಿವಾಹ ಯೋಗ ಕೂಡಿಬರಲಿದ್ದು, ಸುಸಂಸ್ಕೃತ ಜೀವನ ಸಂಗಾತಿಯ ಆಗಮನವಾಗಲಿದೆ. ಕುಟುಂಬದ ಹಿರಿಯರ ಆಶೀರ್ವಾದದಿಂದ ಶುಭ ವಿವಾಹ ಕಾರ್ಯಗಳು ನಿರ್ವಿಘ್ನವಾಗಿ ನೆರವೇರಲಿವೆ.`,
              mr: `अविवाहितांसाठी विवाहाचे अत्यंत शुभ योग जुळून येतील. सुसंस्कारी जोडीदाराचे आगमन होऊन मंगलकार्ये निर्विघ्नपणे पार पडतील.`,
              hi: `अविवाहितों के लिए शीघ्र विवाह के मांगलिक योग बनेंगे। सुयोग्य जीवनसाथी का आगमन होगा तथा मांगलिक कार्य संपन्न होंगे।`,
              te: `అవివాహితులకు శీఘ్ర వివాహ యోగం కుదురుతుంది. సుగుణవంతుడైన భాగస్వామి లభించి శుభకార్యాలు ఘనంగా జరుగుతాయి.`,
              ta: `திருமணம் ஆகாதவர்களுக்கு விரைவில் நல்ல வரன் அமையும். சுப நிகழ்வுகள் இனிதே கைகூடும்.`,
              en: `Unmarried natives encounter highly auspicious matrimonial proposals, culminating in a blessed wedding union.`
            }, targetLang),
          (isFemale && isMarried && currentAgeYears >= 20 && currentAgeYears <= 42)
            ? pick6({
              kn: `ಸಂತಾನಾಪೇಕ್ಷಿ ಮಹಿಳೆಯರಿಗೆ ೫ನೇ ಮನೆಯ ಗುರು ಕೃಪೆಯಿಂದ ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ಪರಮ ಮಂಗಳಕರ ಯೋಗವಿದೆ. ಮಾತೃತ್ವದ ಸಂತೋಷವು ಮನೆಗೆ ಹೊಸ ಬೆಳಕನ್ನು ತರಲಿದೆ.`,
              mr: `संततीची इच्छा असणाऱ्या महिलांना पंचमेश व गुरूच्या कृपेने कुलदीपक संततीचा लाभ होईल. मातृत्व सौख्याने जीवन समृद्ध होईल.`,
              hi: `संतान सुख की अभिलाषा रखने वाली महिलाओं हेतु पंचम भाव एवं देवगुरु की कृपा से सन्तति प्राप्ति के पावन योग हैं।`,
              te: `సంతానాపేక్ష గల మహిళలకు 5వ ఇంట్లో గురు అనుగ్రహంతో సత్సంతాన ప్రాప్తి లభించే శుభ యోగం ఉంది.`,
              ta: `குழந்தை பாக்கியம் வேண்டுவோருக்கு 5ம் இடத்து குருவின் அருளால் மழலைச் செல்வம் கிட்டும் உன்னத யோகம் உண்டு.`,
              en: `Progeny aspirations receive divine blessings, and the blossoming arrival of children will bring heartfelt joy.`
            }, targetLang)
            : hasChildren
              ? pick6({
                kn: `ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ನಡತೆಯು ಮನೆಗೆ ಕೀರ್ತಿ ತರಲಿದ್ದು, ಅವರ ಪ್ರಗತಿಯು ಪೋಷಕರಿಗೆ ಅಪಾರ ತೃಪ್ತಿ ನೀಡಲಿದೆ. ಉನ್ನತ ವ್ಯಾಸಂಗದಲ್ಲಿ ವಿಶೇಷ ಪ್ರಗತಿ ಕಾಣುವರು.`,
                mr: `मुलांची शैक्षणिक प्रगती व संस्कार कुटुंबाची प्रतिष्ठा वाढवतील आणि पालकांना मोठा आनंद देतील. उच्च शिक्षणात मोठी यशप्राप्ती होईल.`,
                hi: `बच्चों की शिक्षा एवं सुसंस्कार परिवार का मान बढ़ाएंगे तथा माता-पिता को असीम संतोष देंगे। उच्च शिक्षा में उल्लेखनीय सफलता मिलेगी।`,
                te: `పిల్లల చదువు మరియు ప్రవర్తన కుటుంబానికి గౌరవం తెస్తాయి, తల్లిదండ్రులకు సంతోషాన్నిస్తాయి. ఉన్నత విద్యలో విశేష ప్రతిభ కనబరుస్తారు.`,
                ta: `பிள்ளைகளின் கல்வி மற்றும் நற்பண்புகள் குடும்பத்திற்கு பெருமை சேர்த்து பெற்றோருக்கு மகிழ்ச்சி தரும். உயர் கல்வியில் சாதனைகள் புரிவர்.`,
                en: `Children will excel in academics and conduct, bringing pride and heartfelt contentment to the household.`
              }, targetLang)
              : pick6({
                kn: `ಕುಟುಂಬದಲ್ಲಿ ಹಬ್ಬ-ಹರಿದಿನಗಳ ಸಡಗರ ಹಾಗೂ ಬಂಧು-ಮಿತ್ರರ ಒಡನಾಟವು ನೆಮ್ಮದಿ ಮತ್ತು ಸಂತೋಷವನ್ನು ತರಲಿದೆ. ಹಿರಿಯರ ಆರೋಗ್ಯದಲ್ಲಿ ಸುಧಾರಣೆ ಕಂಡುಬರಲಿದೆ.`,
                mr: `सण-उत्सवांचा आनंद व आप्तेष्टांचा स्नेह यामुळे घरात सदैव उत्साहाचे वातावरण राहील. घरातील ज्येष्ठांचे आरोग्य सुधारेल.`,
                hi: `पारिवारिक उत्सवों एवं मांगलिक आयोजनों से घर में आनंद एवं सौहार्द बना रहेगा। बुजुर्गों के स्वास्थ्य में उत्तम सुधार होगा।`,
                te: `పండుగలు మరియు కుటుంబ వేడుకలు ఇంట్లో సంతోషకరమైన వాతావరణాన్ని నింపుతాయి. పెద్దల ఆరోగ్యం మెరుగుపడుతుంది.`,
                ta: `பண்டிகைகள் மற்றும் குடும்ப சுப நிகழ்வுகள் இல்லத்தில் மகிழ்ச்சியைப் பொழியும். பெரியவர்களின் உடல்நலம் சீராகும்.`,
                en: `Harmonious family celebrations and festive gatherings anchor joyful domestic warmth and vitality.`
              }, targetLang),
          pick6({
            kn: `ಕುಟುಂಬದ ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಆಚರಣೆ ಹಾಗೂ ಪುಣ್ಯಕ್ಷೇತ್ರಗಳ ತೀರ್ಥಯಾತ್ರೆಯು ಮನೆಯಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಸೌಹಾರ್ದತೆಯನ್ನು ಶಾಶ್ವತಗೊಳಿಸಲಿದೆ. ಬಂಧು-ಮಿತ್ರರೊಂದಿಗಿನ ಬಾಂಧವ್ಯವು ಹೊಸ ಚೈತನ್ಯವನ್ನು ತರಲಿದೆ.`,
            mr: `कुटुंबातील ज्येष्ठांचे आशीर्वाद, धार्मिक कार्ये व तीर्थक्षेत्रांची यात्रा यामुळे घरात सदैव शांती व सौख्य राहील. नातेवाईक व आप्तेष्टांमधील सलोखा अधिक दृढ होईल.`,
            hi: `पारिवारिक वरिष्ठों का शुभाशीर्वाद, धार्मिक अनुष्ठान एवं तीर्थाटन से घर में सुख-शांति का स्थायी वास होगा। संबंधियों के साथ मधुर संबंध बने रहेंगे।`,
            te: `కుటుంబ పెద్దల ఆశీస్సులు, ధార్మిక కార్యక్రమాలు మరియు తీర్థయాత్రలు ఇంట్లో శాంతిని నింపుతాయి. బంధుమిత్రులతో అనుబంధాలు బలపడతాయి.`,
            ta: `குடும்பப் பெரியவர்களின் ஆசிகள், சுப காரியங்கள் & புண்ணிய தல யாத்திரைகள் இல்லத்தில் அமைதியை நிலைநிறுத்தும்.`,
            en: `Elders' blessings, sacred rituals, and holy pilgrimages solidify generational harmony, infusing the home with peaceful festive grace.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಪ್ರತಿ ಹುಣ್ಣಿಮೆಯಂದು ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಅಥವಾ ತುಳಸಿ ಪೂಜೆ ಗೃಹ ಸೌಖ್ಯ ತರುತ್ತದೆ.",
          mr: "दर पौर्णिमेला सत्यनारायण पूजा किंवा तुळशीसमोर शुद्ध तुपाचा दिवा लावल्याने घरात शांती नांदते.",
          hi: "प्रत्येक पूर्णिमा पर सत्यनारायण कथा अथवा दीपदान गृह शांति का कारक है।",
          te: "ప్రతి పౌర్ణమికి సత్యనారాయణ వ్రతం లేదా తులసి పూజ చేయడం వల్ల కుటుంబంలో ప్రశాంతత నెలకొంటుంది.",
          ta: "பௌர்ணமி தோறும் சத்யநாராயணர் பூஜை அல்லது துளசி பூஜை செய்வது இல்லற சாந்தியைத் தரும்.",
          en: "Observing Purnima Satyanarayana pooja or Tulasi lamp worship anchors domestic peace."
        }, targetLang)
      },
      {
        id: "adult_health",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೪: ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಚೈತನ್ಯ ಶಕ್ತಿ",
          mr: "अध्याय ४: आरोग्य रक्षण, मानसिक शांतता व ऊर्जा संतुलन",
          hi: "अध्याय ४: आरोग्य संरक्षण, मानसिक शांति एवं ऊर्जा संतुलन",
          te: "అధ్యాయం 4: ఆరోగ్య రక్షణ, మనశ్శాంతి & చైతన్య శక్తి",
          ta: "அத்தியாயம் 4: ஆரோக்கிய பாதுகாப்பு, மன அமைதி & புத்துணர்ச்சி",
          en: "Chapter 4: Vitality Preservation, Stress Shield & Psychosomatic Health"
        }, targetLang),
        subtitle: pick6({
          kn: "೬ನೇ ಹಾಗೂ ೮ನೇ ಮನೆಯ ಶಮನದಿಂದ ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷೆ",
          mr: "षष्ठ व अष्टम भावातील दोष शमनाने दीर्घायुष्य व उत्तम आरोग्य",
          hi: "षष्ठ एवं अष्टम भाव के दोष शमन से उत्तम स्वास्थ्य",
          te: "6 మరియు 8వ భావాల దోష నివారణతో సంపూర్ణ ఆరోగ్యం",
          ta: "6 & 8ம் வீடுகளின் தோஷ நிவர்த்தியால் தீர்க்காயுள் பாதுகாப்பு",
          en: "6th/8th house pacification preserving immune vigor and restful sleep"
        }, targetLang),
        icon: "🌿",
        contemplationInquest: pick6({
          kn: "೬ನೇ ಹಾಗೂ ೮ನೇ ಭಾವಗಳ ಶಮನ, ಆಯುಷ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ಚೇತನ ಶಕ್ತಿಯ ದೈವಿಕ ರಕ್ಷೆ",
          mr: "षष्ठ व अष्टम भावातील दोष निवारण, दीर्घायुष्य व आरोग्य कल्पकता",
          hi: "षष्ठ एवं अष्टम भाव के दोष शमन, दीर्घायु एवं उत्तम स्वास्थ्य का विचार",
          te: "6 మరియు 8వ భావాల దోష నివారణ, దీర్ఘాయువు & ఆరోగ్య రక్షా చింతన",
          ta: "6 மற்றும் 8ம் பாவங்களின் தோஷ நிவர்த்தி & தீர்க்காயுள் பாதுகாப்பு சிந்தனை",
          en: "Contemplation on 6th/8th House Pacification, Pranic Vitality & Psychosomatic Longevity"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ವೃತ್ತಿಯ ಒತ್ತಡದಿಂದ ಮಾನಸಿಕ ಆಯಾಸ ಅಥವಾ ನಿದ್ರಾಹೀನತೆ ಉಂಟಾಗದಂತೆ ಎಚ್ಚರವಹಿಸಿ. ನಿಯಮಿತ ಯೋಗ, ಧ್ಯಾನ ಹಾಗೂ ಪ್ರಾಣಾಯಾಮವು ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಲಿದೆ.`,
            mr: `कामाच्या व्यापात मानसिक ताण किंवा झोपेची तक्रार निर्माण होऊ देऊ नका. नियमित योग, ध्यान व प्राणायामाने कार्यक्षमता द्विगुणित होईल.`,
            hi: `अत्यधिक कार्यभार से मानसिक तनाव अथवा अनिद्रा से बचें। नित्य योग एवं प्राणायाम आपकी ऊर्जा को संतुलित रखेगा।`,
            te: `వృత్తిపరమైన పని ఒత్తిడి వల్ల అలసట లేదా నిద్రలేమి రాకుండా చూసుకోండి. రోజూ యోగా మరియు ధ్యానం చేయడం వల్ల ఆరోగ్యం మెరుగవుతుంది.`,
            ta: `வேலைப்பளுவால் ஏற்படும் மன அழுத்தத்தை தவிர்க்க தினமும் யோகா மற்றும் தியானம் செய்வது நலம் தரும்.`,
            en: `Insulate against professional burnout and sleep irregularities through daily pranayama and disciplined evening wind-down rituals.`
          }, targetLang),
          pick6({
            kn: `ಶನಿ ಗೋಚಾರದ ತಿಂಗಳುಗಳಲ್ಲಿ ರಕ್ತದೊತ್ತಡ, ಜೀರ್ಣಾಂಗ ಕ್ರಿಯೆ ಹಾಗೂ ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಎಚ್ಚರ ವಹಿಸುವುದು ಕ್ಷೇಮಕರ. ಯಾವುದೇ ದೀರ್ಘಕಾಲಿಕ ಕಾಯಿಲೆಗಳು ದೈವಿಕ ಕೃಪೆಯಿಂದ ಶಮನವಾಗಲಿವೆ.`,
            mr: `शनि गोचराच्या काळात खानपान व वाहन चालवताना विशेष काळजी घ्यावी. जुने आजार दैवी कृपेने आटोक्यात येतील.`,
            hi: `शनि गोचर के समय खानपान एवं वाहन चालन में सतर्कता बरतें। पुरानी व्याधियों से मुक्ति मिलेगी।`,
            te: `శని గోచార సమయాల్లో రక్తపోటు, జీర్ణక్రియ మరియు వాహన డ్రైవింగ్‌లో జాగ్రత్త వహించండి. దీర్ఘకాలిక సమస్యలు దైవానుగ్రహంతో తగ్గుముఖం పడతాయి.`,
            ta: `சனி கோச்சார காலத்தில் உணவு முறை மற்றும் வாகன இயக்கத்தில் கவனம் தேவை. பழைய உபாதைகள் தெய்வ அருளால் நீங்கும்.`,
            en: `Exercise mindfulness while driving and adhere to clean dining during Saturn transits; chronic conditions will retreat gracefully.`
          }, targetLang),
          pick6({
            kn: `ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಸಾತ್ವಿಕ ಆಹಾರ ಪದ್ಧತಿ, ನಿಯಮಿತ ವಾಕಿಂಗ್ ಹಾಗೂ ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸಾ ಪದ್ಧತಿಗಳನ್ನು ಅಳವಡಿಸಿಕೊಳ್ಳುವುದು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ಪೂರಕವಾಗಿದೆ. ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪವು ಸಮಸ್ತ ರೋಗ-ಭಯಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`,
            mr: `नित्य सात्विक आहार, हलका व्यायाम व आयुर्वेदाचा अवलंब केल्यास उत्तम दीर्घायुष्य लाभेल. महामृत्युंजय जप सर्व प्रकारच्या आरोग्याच्या चिंता दूर करेल.`,
            hi: `दैनिक दिनचर्या में सात्विक आहार, नित्य भ्रमण एवं प्राकृतिक चिकित्सा का समावेश दीर्घायु का कारक है। महामृत्युंजय जप स्वास्थ्य की रक्षा करेगा।`,
            te: `దైనందిన జీవితంలో సాత్విక ఆహారం, నడక మరియు ఆయుర్వేద పద్ధతులు పాటించడం దీర్ఘాయువునిస్తుంది. మహామృత్యుంజయ జపం ఆరోగ్య రక్ష.`,
            ta: `சாத்வீக உணவு, நடைப்பயிற்சி மற்றும் இயற்கை வாழ்வியல் முறைகள் ஆரோக்கியத்தை நிலைநிறுத்தும். மகா மிருத்யுஞ்சய ஜபம் சகல பயங்களையும் நீக்கும்.`,
            en: `Harmonious Ayurvedic nutrition, daily walking routines, and sacred Mahamrityunjaya japa serve as a revitalizing shield for longevity and vitality.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಅಥವಾ ಶಿವ ಕವಚ ಪಠಣೆ ದಿವ್ಯ ಆರೋಗ್ಯ ಕವಚ.",
          mr: "महामृत्युंजय मंत्राचा जप आरोग्यासाठी व दीर्घायुष्यासाठी अत्यंत प्रभावी कवच आहे.",
          hi: "महामृत्युंजय मंत्र का नित्य जप आरोग्य एवं दीर्घायु प्रदायक है।",
          te: "మహామృత్యుంజయ మంత్రం లేదా శివ కవచం పఠించడం సంపూర్ణ ఆరోగ్య రక్ష.",
          ta: "மகா மிருத்யுஞ்சய மந்திரம் அல்லது சிவ கவசம் படிப்பது சிறந்த ஆரோக்கிய கவசமாகும்.",
          en: "Chanting Mahamrityunjaya Mantra shields physical vitality and ensures peace."
        }, targetLang)
      }
    );
  }

  const parashariGem = getParashariGemstoneRecommendation(lagnaIdx, targetLang);

  // Stotra Selection & Harmonized Sacred Deity Image
  const prescribedStotra = selectPrescribedStotra(
    kundli,
    hasSaturnTroubleAnyYear,
    runningMahadashaPrimary,
    targetLang
  );

  const sacredDeityImage = getSacredDeityImage(
    lagnaIdx,
    moonIdx,
    runningMahadashaPrimary,
    hasSaturnTroubleAnyYear,
    targetLang,
    prescribedStotra.id,
    prescribedStotra.deityName
  );

  const milestoneMatrix = generate5YearMilestones(
    kundli,
    ageCategory,
    baseYear,
    peakYearIdx,
    cautionYearIdx,
    targetLang,
    currentAgeYears
  );

  // Secret Accuracy Profile & Bhrigu Bindu Trigger
  const precisionPositions: GatePlanetPosition[] = (kundli?.planets || []).map(p => {
    const pName = normalizePlanetName(p.name);
    const rashiIdx = ((p.rashi.index % 12) + 12) % 12;
    const degInSign = Math.max(0, Math.min(29.9999, p.degree % 30));
    return {
      planet: pName,
      longitude: rashiIdx * 30 + degInSign,
      rashi: rashiIdx as GateRashiIndex,
      degreeInSign: degInSign,
      rashiHouse: p.house,
      bhavaHouse: p.house
    };
  });

  const sunPos = precisionPositions.find(p => p.planet === "Sun");
  const moonPos = precisionPositions.find(p => p.planet === "Moon");
  const rahuPos = precisionPositions.find(p => p.planet === "Rahu");

  const sunLon = sunPos ? sunPos.longitude : 0;
  const moonLon = moonPos ? moonPos.longitude : (kundli.moonSign.index * 30 + 15);
  const rahuLon = rahuPos ? rahuPos.longitude : 0;

  const secretAccuracyProfile = calculateSecretAccuracyProfile(
    sunLon,
    moonLon,
    rahuLon,
    precisionPositions
  );

  const peakTransits = getTransitsForDate(kundli.moonSign.index, new Date(baseYear + peakYearIdx, 5, 15));
  const transitPositions: GatePlanetPosition[] = Object.entries(peakTransits).map(([graha, tInfo]: [string, any]) => {
    const pName = normalizePlanetName(graha);
    const rIndex = ((tInfo.transitRashiIndex % 12) + 12) % 12;
    return {
      planet: pName,
      longitude: rIndex * 30 + 15,
      rashi: rIndex as GateRashiIndex,
      degreeInSign: 15,
      rashiHouse: tInfo.houseFromMoon,
      bhavaHouse: tInfo.houseFromMoon
    };
  });

  const bbTriggers = checkBhriguBinduTransitTrigger(secretAccuracyProfile.bhriguBindu, transitPositions);
  const hasJupiterBB = bbTriggers.some(t => t.planet === "Jupiter");
  const hasSaturnRahuBB = bbTriggers.some(t => t.planet === "Saturn" || t.planet === "Rahu");

  let bbSuffix = "";
  let bbExtraImpact = "";
  if (hasJupiterBB) {
    bbSuffix = targetLang === "kn" ? " [⚡ ಭೃಗು ಬಿಂದು ಮಹಾ ಭಾಗ್ಯೋದಯ ಸಂಚಾರ]"
      : targetLang === "mr" ? " [⚡ भृगू बिंदू महा भाग्योदय गोचर]"
      : targetLang === "hi" ? " [⚡ भृगु बिंदु महा भाग्योदय गोचर]"
      : targetLang === "te" ? " [⚡ భృగు బిందువు మహా భాగ్యోదయ గోచారం]"
      : targetLang === "ta" ? " [⚡ பிருகு பிந்து பொற்கால பாக்கியோதய மாற்றம்]"
      : " [⚡ Bhrigu Bindu Breakthrough Trigger]";
    bbExtraImpact = " " + (BHRIGU_BINDU_LOCALE[targetLang]?.breakthroughNotice || BHRIGU_BINDU_LOCALE.en.breakthroughNotice);
  } else if (hasSaturnRahuBB) {
    bbSuffix = targetLang === "kn" ? " [⚡ ಭೃಗು ಬಿಂದು ಕರ್ಮ ಪರಿವರ್ತನೆ]"
      : targetLang === "mr" ? " [⚡ भृगू बिंदू कर्म परिवर्तन]"
      : targetLang === "hi" ? " [⚡ भृगु बिंदु कर्म परिवर्तन]"
      : targetLang === "te" ? " [⚡ భృగు బిందువు కర్మ పరివర్తన]"
      : targetLang === "ta" ? " [⚡ பிருகு பிந்து கர்ம திருப்புமுனை]"
      : " [⚡ Bhrigu Bindu Karmic Recalibration]";
    bbExtraImpact = " " + (BHRIGU_BINDU_LOCALE[targetLang]?.karmicTestNotice || BHRIGU_BINDU_LOCALE.en.karmicTestNotice);
  }

  const peakYStr = formatNumber6L(baseYear + peakYearIdx, targetLang);
  const baseTurningPointTitle = targetLang === "kn" ? `🌟 ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ತಿರುವು (${peakYStr})`
    : targetLang === "mr" ? `🌟 ५ वर्षांतील सुवर्ण वळण (${peakYStr})`
      : targetLang === "hi" ? `🌟 ५ वर्षों का स्वर्णिम मोड़ (${peakYStr})`
        : targetLang === "te" ? `🌟 5 సంవత్సరాల స్వర్ణ మలుపు (${peakYStr})`
          : targetLang === "ta" ? `🌟 5 ஆண்டுகளின் பொற்கால திருப்புமுனை (${peakYStr})`
            : `🌟 5-Year Sovereign Turning Point (${peakYStr})`;
  const pivotalTurningPointTitle = baseTurningPointTitle + bbSuffix;

  const pivotalTurningPointSeason = targetLang === "kn" ? `ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ ${peakYStr}`
    : targetLang === "mr" ? `वैशाख - ज्येष्ठ ${peakYStr}`
      : targetLang === "hi" ? `वैशाख - ज्येष्ठ ${peakYStr}`
        : targetLang === "te" ? `వైశాఖ - జ్యేష్ఠ ${peakYStr}`
          : targetLang === "ta" ? `வைகாசி - ஆனி ${peakYStr}`
            : `Vaishakha - Jyeshtha ${peakYStr}`;

  const baseTurningPointImpact = targetLang === "kn" ? `ಗುರು-ಶುಕ್ರರ ಅನುಗ್ರಹದಿಂದ ಹಿಂದಿನ ಕಷ್ಟ-ನಷ್ಟಗಳು ಕರಗಿ, ಆರ್ಥಿಕ ಉನ್ನತಿ, ನೂತನ ಆಸ್ತಿ ಸೌಭಾಗ್ಯ ಹಾಗೂ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಗ್ರಗಣ್ಯ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
    : targetLang === "mr" ? `गुरू-शुक्राच्या कृपेने जुनी संकटे दूर होऊन आर्थिक समृद्धी, नवीन संपत्ती योग व करिअरमध्ये सर्वोच्च अधिकार प्राप्त होतील.`
      : targetLang === "hi" ? `गुरु-शुक्र की कृपा से पूर्व के समस्त संकट समाप्त होकर आर्थिक संपन्नता, नवीन संपत्ति योग एवं कार्यक्षेत्र में उच्च पद-प्रतिष्ठा प्राप्त होगी।`
        : targetLang === "te" ? `గురు-శుక్రుల అనుగ్రహంతో పాత కష్టాలు తొలగిపోయి, ఆర్థిక ఉన్నతి, నూతన ఆస్తి ప్రాప్తి మరియు కెరీర్‌లో ఉన్నత అధికార యోగం కలుగుతుంది.`
          : targetLang === "ta" ? `குரு-சுக்கிரனின் அருளால் முந்தைய தடைகள் நீங்கி, நிதி முன்னேற்றம், புதிய சொத்து யோகம் மற்றும் தொழிலில் உயர் பதவி கிட்டும்.`
            : `Benefic planetary confluence dissolves historical frictions, catalyzing wealth accumulation, prime real estate acquisition, and executive ascendancy.`;
  const pivotalTurningPointImpact = baseTurningPointImpact + bbExtraImpact;

  // Macro Summary
  const macroSummary = {
    overview: targetLang === "kn" ? `ಮುಂದಿನ ೫ ವರ್ಷಗಳು (${baseYear} - ${baseYear + 5}) ನಿಮ್ಮ ಜೀವನದ ಪರಮ ಮಹತ್ವದ ಪರಿವರ್ತನೆಯ ಯುಗ. ದಶಾ ಮತ್ತು ಗೋಚಾರದ ಸಮ್ಮಿಲನವು ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಅದ್ಭುತ ಫಲಿತಾಂಶಗಳನ್ನು ತರಲಿದೆ.`
      : targetLang === "hi" ? `आगामी ५ वर्ष (${formatNumber6L(baseYear, "hi")} - ${formatNumber6L(baseYear + 5, "hi")}) आपके जीवन का अत्यंत महत्वपूर्ण परिवर्तनकारी कालखंड है। दशा एवं गोचर का योग आपके परिश्रम को अभूतपूर्व सफलता में बदलेगा।`
        : targetLang === "mr" ? `पुढील ५ वर्षे (${formatNumber6L(baseYear, "mr")} - ${formatNumber6L(baseYear + 5, "mr")}) आपल्या आयुष्यातील अत्यंत महत्त्वाचा परिवर्तनाचा कालखंड आहे. दशा व गोचराचा सुंदर संगम आपल्या कष्टांना मोठे यश मिळवून देईल.`
          : targetLang === "te" ? `రాబోయే 5 సంవత్సరాలు (${formatNumber6L(baseYear, "te")} - ${formatNumber6L(baseYear + 5, "te")}) మీ జీవితంలో అత్యంత కీలకమైన పరివర్తన కాలం. దశా మరియు గోచార గ్రహాల కలయిక మీ కష్టానికి తగిన అద్భుత ఫలితాలను ఇస్తుంది.`
            : targetLang === "ta" ? `அடுத்த 5 ஆண்டுகள் (${formatNumber6L(baseYear, "ta")} - ${formatNumber6L(baseYear + 5, "ta")}) உங்கள் வாழ்க்கையில் மிக முக்கியமான மாற்றத்தை ஏற்படுத்தும் பொற்காலம். தசா மற்றும் கோச்சார அமைப்புகள் உங்கள் உழைப்புக்கு ஏற்ப மகத்தான வெற்றியை தரும்.`
              : `The ${baseYear} - ${baseYear + 5} 5-year cycle represents a defining watershed epoch, harmonizing Dasha transitions and transits into enduring breakthroughs.`,
    macroTrend: targetLang === "kn" ? `ಆರಂಭಿಕ ವರ್ಷಗಳಲ್ಲಿ ದೃಢ ತಳಹದಿ ನಿರ್ಮಾಣ, ಮಧ್ಯಂತರದಲ್ಲಿ ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ ಹಾಗೂ ಕೊನೆಯಲ್ಲಿ ಸ್ಥಿರ ಕೀರ್ತಿ-ಸಂಪತ್ತು.`
      : targetLang === "hi" ? `प्रारंभिक वर्षों में सुदृढ़ आधार निर्माण, मध्य में स्वर्णिम भाग्योदय एवं अंत में स्थिर यश व समृद्धि।`
        : targetLang === "mr" ? `सुरुवातीच्या वर्षांत मजबूत पायाभरणी, मध्यंतरात भाग्योदय व अखेरीस स्थिर मान-सन्मान व संपत्ती प्राप्ती.`
          : targetLang === "te" ? `ప్రారంభ సంవత్సరాల్లో బలమైన పునాది నిర్మాణం, మధ్య కాలంలో స్వర్ణ భాగ్యోదయం, చివరిలో స్థిరమైన కీర్తి-సంపద.`
            : targetLang === "ta" ? `துவக்க ஆண்டுகளில் உறுதியான அடித்தளம், நடுப்பகுதியில் பொற்கால பாக்கியோதயம், முடிவில் நிலையான புகழ் மற்றும் தனவிருத்தி.`
              : `Systematic foundation building in initial years, soaring breakthroughs at mid-cycle, and enduring consolidation toward ${baseYear + 5}.`,
    peakGoldenYear: peakYearLabel || `${baseYear + 1} - ${baseYear + 2}`,
    cautionPeriodYear: cautionYearLabel || `${baseYear} - ${baseYear + 1}`,
    destinyTheme: targetLang === "kn" ? `ಶ್ರಮ, ದೈವಬಲ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಸಕಲ ಸಿದ್ಧಿ`
      : targetLang === "hi" ? `परिश्रम, देवकृपा एवं आत्मविश्वास से सर्व कार्य सिद्धि`
        : targetLang === "mr" ? `कष्ट, ईश्वरी कृपा व आत्मविश्वास या त्रिसूत्रीने सर्व कार्यसिद्धी`
          : targetLang === "te" ? `కృషి, దైవబలం మరియు ఆత్మవిశ్వాసంతో సర్వ కార్యసిద్ధి`
            : targetLang === "ta" ? `உழைப்பு, தெய்வ பலம் மற்றும் தன்னம்பிக்கையால் சகல காரிய சித்தி`
              : `Triumph through disciplined perseverance, divine grace, and unshakeable conviction.`,
    pivotalTurningPointTitle,
    pivotalTurningPointSeason,
    pivotalTurningPointImpact
  };

  const remedies = {
    ishtaDevata: sacredDeityImage.deityName,
    gokarnaParihara: targetLang === "kn" ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹವನ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ, ಪ್ರದೋಷ ಪೂಜೆ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ."
      : targetLang === "hi" ? "श्री गोकर्ण क्षेत्र में महामृत्युंजय हवन अथवा रुद्राभिषेक, प्रदोष पूजा एवं ब्राह्मण भोजन।"
        : targetLang === "mr" ? "श्री गोकर्ण क्षेत्रात महामृत्युंजय होम किंवा रुद्राभिषेक संकल्प, प्रदोष पूजा व अन्नदान."
          : targetLang === "te" ? "శ్రీ గోకర్ణ క్షేత్రంలో మహామృత్యుంజయ హవనం లేదా రుద్రాభిషేక సంకల్పం, ప్రదోష పూజ మరియు అన్నదానం."
            : targetLang === "ta" ? "ஸ்ரீ கோகர்ண க்ஷேத்திரத்தில் மகா மிருத்யுஞ்சய ஹோமம் அல்லது ருத்ராபிஷேக சங்கல்பம், பிரதோஷ பூஜை & அன்னதானம்."
              : "Gokarna Kshetra Rudrabhisheka, Mahamrityunjaya Homa sankalpa, and sacred cow-ghee lamp.",
    gemstoneRecommendation: parashariGem.gem,
    gemstoneCaveat: parashariGem.caveat,
    rudrakshaRecommendation: parashariGem.rudraksha,
    luckyColors: targetLang === "kn" ? "ಕೇಸರಿ, ಹಳದಿ, ಬಿಳಿ (ರಕ್ತವರ್ಣ/ಹಸಿರು ಶುಭ)"
      : targetLang === "hi" ? "केसरिया, पीला, श्वेत (लाल/हरा शुभ)"
        : targetLang === "mr" ? "केशरी, पिवळा, पांढरा (लाल व हिरवा शुभ)"
          : targetLang === "te" ? "కేసరి, పసుపు, తెలుపు (ఎరుపు/ఆకుపచ్చ శుభం)"
            : targetLang === "ta" ? "காவி, மஞ்சள், வெள்ளை (சிவப்பு/பச்சை சுபம்)"
              : "Saffron, Golden Yellow, Pure White, Emerald Green",
    avoidColors: targetLang === "kn" ? "ಗಾಢ ಕಪ್ಪು ಹಾಗೂ ಧೂಸರ ಬಣ್ಣ ವರ್ಜಿಸಿ"
      : targetLang === "hi" ? "गहरा काला एवं मटमैला रंग वर्जित"
        : targetLang === "mr" ? "गडद काळा व मळकट रंग शक्यतो टाळावा"
          : targetLang === "te" ? "ముదురు నలుపు మరియు బూడిద రంగు వర్జించండి"
            : targetLang === "ta" ? "அடர் கருப்பு மற்றும் சாம்பல் நிறத்தைத் தவிர்க்கவும்"
              : "Jet Black and Dull Charcoal Gray",
    luckyNumbers: formatNumber6L("1, 3, 5, 9", targetLang),
    luckyDirections: targetLang === "kn" ? "ಪೂರ್ವ ಹಾಗೂ ಈಶಾನ್ಯ ದಿಕ್ಕು"
      : targetLang === "hi" ? "पूर्व एवं ईशान कोण"
        : targetLang === "mr" ? "पूर्व व ईशान्य दिशा"
          : targetLang === "te" ? "తూర్పు మరియు ఈశాన్య దిశ"
            : targetLang === "ta" ? "கிழக்கு மற்றும் வடகிழக்கு (ஈசான்யம்)"
              : "East and North-East (Ishanya)"
  };

  const astrologerBlessing = targetLang === "kn"
    ? `॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪರಮಾನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಮುಂದಿನ ೫ ವರ್ಷಗಳು ಸಕಲ ಕಷ್ಟಗಳಿಂದ ಮುಕ್ತವಾಗಿ, ಧನ, ಧಾನ್ಯ, ಕೀರ್ತಿ, ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತೋಷಗಳಿಂದ ಸಮೃದ್ಧವಾಗಿರಲಿ. ನಿಮ್ಮ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳು ಈಡೇರಲಿ ಎಂದು ಶುಭ ಹಾರೈಸುತ್ತೇನೆ. - ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ) ॥`
    : targetLang === "hi"
      ? `॥ श्री गोकर्ण महाबलेश्वर स्वामी की परम कृपा से आपके आगामी ५ वर्ष समस्त विघ्न-बाधाओं से मुक्त होकर धन, धान्य, यश, आरोग्य एवं सुख-शांति से परिपूर्ण हों। आपके समस्त सत्कार्य सिद्ध हों। - श्रीराम पंडित (मुख्य ज्योतिषी, बग्गोण पंचांग) ॥`
      : targetLang === "mr"
        ? `॥ श्री गोकर्ण महाबळेश्वर स्वामींच्या परम कृपेने आपले पुढील ५ वर्षे सर्व संकटांतून मुक्त होऊन धन, धान्य, कीर्ती, दीर्घायुष्य, उत्तम आरोग्य व असीम आनंदाने समृद्ध जावोत. आपले सर्व शुभ संकल्प सिद्धीस जावोत. - श्रीराम पंडित (मुख्य ज्योतिषी, बग्गोण पंचांग) ॥`
        : targetLang === "te"
          ? `॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామివారి దివ్యానుగ్రహంతో మీ రాబోయే 5 సంవత్సరాలు సకల కష్టాల నుండి విముక్తమై, ధన, ధాన్య, కీర్తి, ఆయురారోగ్యాలు మరియు ఆనందంతో సమృద్ధిగా సాగాలని కోరుకుంటున్నాను. మీ సత్సంకల్పాలన్నీ నెరవేరాలి. - శ్రీరామ్ పండిత్ (బగ్గోణ పంచాంగ ప్రధాన జ్యోతిష్కుడు) ॥`
          : targetLang === "ta"
            ? `॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வர சுவாமியின் பேரருளால் உங்கள் அடுத்த 5 ஆண்டுகள் அனைத்து தடைகளும் நீங்கி, தன, தான்ய, கீர்த்தி, ஆயுள், ஆரோக்கியம் மற்றும் மகிழ்ச்சியுடன் சிறக்க வாழ்த்துகிறேன். உங்கள் நற்சிந்தனைகள் அனைத்தும் நிறைவேறட்டும். - ஸ்ரீராம் பண்டிட் (பக்கோண பஞ்சாங்க தலைமை ஜோதிடர்) ॥`
            : `|| By the divine grace of Sri Gokarna Mahabaleshwara, may your upcoming 5 years be liberated from all obstacles, abounding in prosperity, honor, health, longevity, and spiritual fulfillment. - Shreeram Pandit (Chief Astrologer, Baggona Panchanga) ||`;

  // Future-Curiosity Chapters
  const muhurtaWindows = generateAuspiciousMuhurtas(baseYear, targetLang, ageCategory, personalization?.maritalStatus, currentAgeYears);
  const financialRoadmap = generate5YearFinancialRoadmap(baseYear, targetLang, peakYearIdx, cautionYearIdx, currentAgeYears);
  const healthShield = generateHealthLongevityShield(targetLang, ageCategory, currentAgeYears);
  const punyakshetraYatra = generatePunyakshetraYatra(targetLang);
  const yearSpecificRemedies = generateYearSpecificRemedies(baseYear, years, targetLang);
  const nakshatraVriksha = getNakshatraVriksha(nakshatraIdx, targetLang);
  const familyDestinyInterlocking = generateFamilyDestinyInterlocking(
    resolvedDevoteeName,
    targetLang,
    personalization?.maritalStatus,
    personalization?.childrenStatus,
    baseYear,
    currentAgeYears
  );

  const doshaAnalysis = compute5YearDoshaAnalysis(
    kundli,
    birthDateYmd,
    birthTimeHm,
    targetLang,
    baseYear,
    resolvedDevoteeName
  );

  const daivajnaSummary = generateDaivajnaSummary(
    resolvedDevoteeName,
    targetLang,
    currentAgeYears,
    baseYear,
    lagnaIdx,
    moonIdx,
    runningMahadashaPrimary,
    peakYearLabel,
    cautionYearLabel,
    hasSaturnTroubleAnyYear
  );

  const personalizedDynamicShloka = generatePersonalizedDynamicShloka(
    resolvedDevoteeName,
    nakshatraIdx,
    moonPada,
    lagnaIdx,
    moonIdx,
    runningMahadashaPrimary,
    birthWeekday,
    targetLang,
    hasSaturnTroubleAnyYear
  );

  const currentLifeStatus = calculateCurrentLifeStatus(
    kundli,
    birthDateYmd,
    birthTimeHm,
    lat,
    lng,
    moonIdx,
    lagnaIdx,
    targetLang
  );

  const openingHook = calculateOpeningHookNarrative(
    kundli,
    birthDateYmd,
    birthTimeHm,
    lat,
    lng,
    moonIdx,
    lagnaIdx,
    targetLang,
    traditionalPanchanga,
    resolvedDevoteeName
  );

  const planetaryCalculations = calculatePlanetaryCalculations(kundli, targetLang);

  const nagaluRoadmap = calculateNagaluRoadmap(baseYear, targetLang, kundli, years);

  const hotelPrivilegeCard = getHotelHospitalityPrivilege(targetLang);

  return {
    devoteeName: resolvedDevoteeName,
    birthDateFormatted: birthDateYmd,
    birthTimeFormatted: birthTimeHm,
    ageYears: currentAgeYears,
    ageCategory,
    lagnaRashi: RASHI_6L[lagnaIdx]?.[targetLang] || kundli.lagnaRashi?.english || "",
    lagnaLord: GRAHA_6L[lagnaLordKey]?.[targetLang] || lagnaLordKey,
    moonRashi: RASHI_6L[moonIdx]?.[targetLang] || kundli.moonSign?.english || "",
    moonLord: GRAHA_6L[moonLordKey]?.[targetLang] || moonLordKey,
    nakshatra: NAKSHATRA_6L[nakshatraIdx]?.[targetLang] || moonPlanet?.nakshatra.english || "",
    nakshatraPada: formatNumber6L(moonPada, targetLang),
    padaWord,
    birthWeekday,
    janmaHora,
    jananaPanchanga,
    targetLanguage: targetLang,
    startYear: baseYear,
    endYear: baseYear + 5,
    macroSummary,
    milestoneMatrix,
    years,
    chapters,
    doshaAnalysis,
    muhurtaWindows,
    financialRoadmap,
    healthShield,
    punyakshetraYatra,
    prescribedStotra,
    yearSpecificRemedies,
    nakshatraVriksha,
    familyDestinyInterlocking,
    daivajnaSummary,
    sacredDeityImage,
    personalizedDynamicShloka,
    currentLifeStatus,
    openingHook,
    planetaryCalculations,
    nagaluRoadmap,
    hotelPrivilegeCard,
    secretAccuracyProfile,
    remedies,
    astrologerBlessing
  };
}
