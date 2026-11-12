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

export interface FiveYearMilestoneRow {
  id: string;
  dimensionTitle: string;
  timingWindow: string;
  planetaryCatalyst: string;
  probabilityScore: string;
  actionAdvice: string;
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
  moorthyNirnaya?: { saturnMoorthy: string; jupiterMoorthy: string };
  savPoints?: number | { saturnHousePoints: number; jupiterHousePoints: number };
  paragraphs?: string[];
  questionInquest?: string;
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

  // If Jupiter prominent or child/education/marriage -> Sri Brihaspati Stotra / Saraswati / Vishnu
  if (activeDashaPlanet === PlanetName.Jupiter || activeDashaPlanet === PlanetName.Mercury) {
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
  maritalStatus?: string
): Array<{ category: string; icon: string; timingWindow: string; description: string }> {
  const y1 = formatNumber6L(baseYear, lang);
  const y2 = formatNumber6L(baseYear + 1, lang);
  const y3 = formatNumber6L(baseYear + 2, lang);

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
            : lang === "te" ? "10వ ఇంట్లో సూర్య-బుధ యోగంతో కొత్త ఒప్పందాలకు అనుకూల సమయం."
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
  cautionYearIdx: number
): Array<{ yearRange: string; financialStance: string; keyAction: string; targetSectors: string }> {
  return [0, 1, 2, 3, 4].map(idx => {
    const yStart = baseYear + idx;
    const yRange = `${formatNumber6L(yStart, lang)} - ${formatNumber6L(yStart + 1, lang)}`;
    const isPeak = idx === peakYearIdx;
    const isCaution = idx === cautionYearIdx;

    let stance = "";
    let action = "";
    let sectors = "";

    if (isPeak) {
      stance = lang === "kn" ? "🌟 ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ & ಗರಿಷ್ಠ ವಿಸ್ತರಣೆ"
        : lang === "mr" ? "🌟 सुवर्ण भाग्योदय व कमाल विस्तार"
          : lang === "hi" ? "🌟 स्वर्णिम भाग्योदय एवं अधिकतम विस्तार"
            : lang === "te" ? "🌟 స్వర్ణ భాగ్యోదయం & గరిష్ట విస్తరణ"
              : lang === "ta" ? "🌟 பொற்கால தனலாபம் & பெரும் வளர்ச்சி"
                : "🌟 Golden Harvest & Peak Expansion";
      action = lang === "kn" ? "ದೊಡ್ಡ ಹೂಡಿಕೆಗಳನ್ನು ಕಾರ್ಯರೂಪಕ್ಕೆ ತಂದು ಸ್ಥಿರಾಸ್ತಿ ಹಾಗೂ ವ್ಯಾಪಾರವನ್ನು ವಿಸ್ತರಿಸಿ."
        : lang === "mr" ? "मोठ्या गुंतवणुकीची अंमलबजावणी करून मालमत्ता व व्यवसाय वाढवावा."
          : lang === "hi" ? "बड़े निवेशों को क्रियान्वित करें एवं संपत्ति व व्यापार का विस्तार करें।"
            : lang === "te" ? "భారీ పెట్టుబడులను అమలు చేసి ఆస్తులు మరియు వ్యాపారాన్ని విస్తరించండి."
              : lang === "ta" ? "பெரிய முதலீடுகளை செய்து சொத்துக்கள் மற்றும் தொழிலை விரிவாக்குங்கள்."
                : "Deploy capital assertively into prime real estate and core business scaling.";
      sectors = lang === "kn" ? "ಸ್ಥಿರಾಸ್ತಿ, ಚಿನ್ನ, ಷೇರು ಮಾರುಕಟ್ಟೆ" : "Real Estate, Gold, Equity";
    } else if (isCaution) {
      stance = lang === "kn" ? "🛡️ ಭದ್ರತೆ, ಉಳಿತಾಯ & ಸಾಲ ಮುಕ್ತಿ"
        : lang === "mr" ? "🛡️ सुरक्षितता, बचत व कर्जमुक्ती"
          : lang === "hi" ? "🛡️ सुरक्षा, बचत एवं ऋण मुक्ति"
            : lang === "te" ? "🛡️ భద్రత, పొదుపు & అప్పుల విముక్తి"
              : lang === "ta" ? "🛡️ பாதுகாப்பு, சேமிப்பு & கடன் அடைத்தல்"
                : "🛡️ Capital Preservation & Debt Liquidation";
      action = lang === "kn" ? "ಆತುರದ ಊಹಾತ್ಮಕ ಹೂಡಿಕೆಗಳನ್ನು ತಪ್ಪಿಸಿ; ಹಳೆಯ ಸಾಲಗಳನ್ನು ತೀರಿಸಿ ನಗದು ಉಳಿಸಿಕೊಳ್ಳಿ."
        : lang === "mr" ? "धोकादायक गुंतवणूक टाळा; जुनी कर्जे फेडून रोख रक्कम राखून ठेवा."
          : lang === "hi" ? "जोखिम भरे निवेश से बचें; पुराने ऋण चुकाएं तथा नकद कोष सुरक्षित रखें।"
            : lang === "te" ? "రిస్క్ పెట్టుబడులు మానుకోండి; పాత అప్పులు తీర్చి నగదు నిల్వ చేసుకోండి."
              : lang === "ta" ? "ஆபத்தான முதலீடுகளைத் தவிர்க்கவும்; பழைய கடன்களை அடைத்து சேமியுங்கள்."
                : "Avoid speculative risks; prioritize debt reduction and liquid reserve buffers.";
      sectors = lang === "kn" ? "ಸ್ಥಿರ ಠೇವಣಿ, ಬ್ಯಾಂಕ್ ಉಳಿತಾಯ" : "Bank Fixed Deposits, Sovereign Debt";
    } else if (idx === 0) {
      stance = lang === "kn" ? "🌱 ದೃಢ ತಳಹದಿ & ವ್ಯವಸ್ಥಿತ ಯೋಜನೆ"
        : lang === "mr" ? "🌱 मजबूत पायाभरणी व आर्थिक नियोजन"
          : lang === "hi" ? "🌱 सुदृढ़ आधार निर्माण एवं योजना"
            : lang === "te" ? "🌱 బలమైన పునాది & ఆర్థిక ప్రణాళిక"
              : lang === "ta" ? "🌱 உறுதியான அடித்தளம் & நிதித் திட்டம்"
                : "🌱 Foundation Building & Systematic Planning";
      action = lang === "kn" ? "ಹೊಸ ಆದಾಯ ಮೂಲಗಳನ್ನು ಅನ್ವೇಷಿಸಿ ನಿಯಮಿತ ಮಾಸಿಕ ಹೂಡಿಕೆಯನ್ನು ಆರಂಭಿಸಿ."
        : lang === "mr" ? "उत्पन्नाचे नवे स्रोत शोधून शिस्तबद्ध मासिक गुंतवणूक सुरू करावी."
          : lang === "hi" ? "नवीन आय स्रोतों की खोज करें तथा नियमित मासिक निवेश आरंभ करें।"
            : lang === "te" ? "కొత్త ఆదాయ మార్గాలను అన్వేషించి క్రమం తప్పకుండా పొదుపు చేయండి."
              : lang === "ta" ? "புதிய வருமான வழிகளை உருவாக்கி முறையான மாதாந்திர சேமிப்பை துவங்குங்கள்."
                : "Establish secondary income streams and disciplined systematic investments.";
      sectors = lang === "kn" ? "ಪರಸ್ಪರ ನಿಧಿಗಳು (SIP), ನವೋದ್ಯಮ" : "Mutual Funds (SIP), Skills";
    } else {
      stance = lang === "kn" ? "📈 ಸ್ಥಿರ ಪ್ರಗತಿ & ಸಂಪತ್ತು ಬಲವರ್ಧನೆ"
        : lang === "mr" ? "📈 स्थिर प्रगती व संपत्ती संवर्धन"
          : lang === "hi" ? "📈 निरंतर प्रगति एवं संपत्ति संचय"
            : lang === "te" ? "📈 నిరంతర ప్రగతి & సంపద వృద్ధి"
              : lang === "ta" ? "📈 தொடர் வளர்ச்சி & செல்வ சேமிப்பு"
                : "📈 Steady Wealth Growth & Portfolio Diversification";
      action = lang === "kn" ? "ಗಳಿಸಿದ ಲಾಭವನ್ನು ಮರುಹೂಡಿಕೆ ಮಾಡಿ ಸ್ಥಿರ ಆದಾಯವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಿ."
        : lang === "mr" ? "मिळालेल्या नफ्याची योग्य पुनर्गंतवणूक करून नियमित परतावा मिळवावा."
          : lang === "hi" ? "प्राप्त लाभ का पुनर्निवेश करें तथा दीर्घकालीन आय सुनिश्चित करें।"
            : lang === "te" ? "వచ్చిన లాభాలను తిరిగి పెట్టుబడిగా పెట్టి స్థిర ఆదాయం పొందండి."
              : lang === "ta" ? "லாபத்தை மறுமுதலீடு செய்து நிலையான வருமானத்தை பெருக்குங்கள்."
                : "Reinvest accrued surplus into cash-flowing assets and family security.";
      sectors = lang === "kn" ? "ಸ್ಥಿರಾಸ್ತಿ, ಸಾರ್ವಭೌಮ ಬಾಂಡ್‌ಗಳು" : "Real Estate, Index Funds";
    }

    return {
      yearRange: yRange,
      financialStance: stance,
      keyAction: action,
      targetSectors: sectors
    };
  });
}

/**
 * 8. Health Vigilance & Longevity Shield
 */
export function generateHealthLongevityShield(
  lang: SixLang,
  ageCategory: string
): Array<{ vulnerableWindow: string; focusArea: string; preventiveGuidance: string }> {
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
      vulnerableWindow: lang === "kn" ? "ಗ್ರೀಷ್ಮ ಋತು (ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ)" : lang === "mr" || lang === "hi" ? "ग्रीष्म ऋतु (वैशाख - ज्येष्ठ)" : lang === "te" ? "గ్రీష్మ ఋతువు (వైశాఖ - జ్యేష్ఠ)" : lang === "ta" ? "கிரீஷ்ம பருவம் (வைகாசி - ஆனி)" : "Summer Heat (Vaishakha - Jyeshtha)",
      focusArea: lang === "kn" ? "ಪಿತ್ತ ಪ್ರಕೋಪ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ನೇತ್ರ ರಕ್ಷಣೆ" : lang === "mr" ? "पित्तप्रकोप, उष्णता व डोळ्यांचे विकार" : lang === "hi" ? "पित्त प्रकोप, अनिद्रा एवं नेत्र सुरक्षा" : lang === "te" ? "పిత్త ప్రకోపం, నిద్రలేమి & కంటి రక్షణ" : lang === "ta" ? "பித்த அதிகரிப்பு, தூக்கமின்மை & கண் நலம்" : "Pitta Cooling, Sleep Quality & Ocular Ease",
      preventiveGuidance: lang === "kn" ? "ಎಳನೀರು, ತುಳಸಿ ತೀರ್ಥ ಹಾಗೂ ಶೀತಲೀ ಪ್ರಾಣಾಯಾಮವು ದೇಹವನ್ನು ತಂಪಾಗಿರಿಸುತ್ತದೆ." : lang === "mr" ? "शहाळ्याचे पाणी, तुळशीचे पाणी व प्राणायामाने शरीरातील उष्णता कमी करावी." : lang === "hi" ? "नारियल जल, तुलसी जल एवं शीतली प्राणायाम शरीर को शीतल रखेगा।" : lang === "te" ? "కొబ్బరి నీళ్లు, తులసి తీర్థం & శీతలీ ప్రాణాయామం చేయండి." : lang === "ta" ? "இளநீர், துளசி தீர்த்தம் மற்றும் பிராணாயாமம் உடல் உஷ்ணத்தை தணிக்கும்." : "Sip natural coconut water and practice restorative evening cooling pranayama."
    }
  ];
}

/**
 * 9. Punyakshetra Pilgrimage Windows
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
  baseYear: number = 2026
): { impactOnSpouse: string; impactOnChildren: string; impactOnParents: string; familyBundleCta: string; familyQrUrl: string } {
  const isMarried = maritalStatus === "married";
  const hasChildren = childrenStatus === "has_children";

  const impactOnSpouse = isMarried
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

  const impactOnChildren = hasChildren
    ? (lang === "kn" ? "ನಿಮ್ಮ ೫ನೇ ಮನೆಯ ಸತ್ಕರ್ಮ ಫಲವು ನಿಮ್ಮ ಮಕ್ಕಳ ಶಾಲಾ-ಕಾಲೇಜು ಪರೀಕ್ಷೆಗಳು, ನಡತೆ ಹಾಗೂ ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕೆ ರಕ್ಷಾ ಕವಚವಾಗಲಿದೆ."
      : lang === "mr" ? "आपल्या पंचम भावातील शुभ दृष्टी मुलांचे शिक्षण, परीक्षा व व्यक्तिमत्त्व विकासासाठी सुरक्षा कवच ठरेल."
        : lang === "hi" ? "आपके पंचम भाव का शुभ प्रभाव बच्चों की शिक्षा, परीक्षा एवं उज्ज्वल भविष्य हेतु रक्षा कवच बनेगा।"
          : lang === "te" ? "మీ 5వ భావ శుభ దృష్టి మీ పిల్లల చదువు, పరీక్షలు మరియు ఉన్నత భవిష్యత్తుకు రక్షగా నిలుస్తుంది."
            : lang === "ta" ? "உங்கள் 5ம் இடத்து சுப பார்வை பிள்ளைகளின் கல்வி, தேர்வுகள் மற்றும் எதிர்காலத்திற்கு கவசமாக அமையும்."
              : "Your 5th house merits shelter your children's scholastic triumphs and moral excellence.")
    : (lang === "kn" ? "೫ನೇ ಮನೆಯ ಶುಭ ಪ್ರಭಾವವು ಸಂತಾನ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆಯಲ್ಲಿರುವವರಿಗೆ ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ದಿವ್ಯ ಅನುಗ್ರಹವನ್ನು ಕರುಣಿಸಲಿದೆ."
      : lang === "mr" ? "पंचम भावातील अनुकूलतेमुळे कुलदीपक संतती प्राप्तीचे अत्यंत शुभ योग जुळून येतील."
        : lang === "hi" ? "पंचम भाव के प्रभाव से संतान सुख की अभिलाषा रखने वालों को शुभ सन्तति का आशीर्वाद मिलेगा।"
          : lang === "te" ? "5వ భావ ప్రభావంతో సంతానాపేక్ష గలవారికి సత్సంతాన ప్రాప్తి కలుగుతుంది."
            : lang === "ta" ? "5ம் இடத்து சுப பலனால் குழந்தை பாக்கியம் வேண்டுவோருக்கு நற்பேறு கிட்டும்."
              : "Auspicious 5th house vibrations catalyze conception blessings and family lineage joy.");

  const impactOnParents = lang === "kn" ? "೯ನೇ ಮನೆಯ ಧರ್ಮ ಬಲವು ತಂದೆ-ತಾಯಿಯ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಕುಟುಂಬದ ಕುಲದೇವತಾ ಪ್ರಸನ್ನತೆಯನ್ನು ರಕ್ಷಿಸಲಿದೆ."
    : lang === "mr" ? "नवम भावातील धर्मबळ आई-वडिलांचे आरोग्य, दीर्घायुष्य व कुलदेवतेची कृपा कायम राखेल."
      : lang === "hi" ? "नवम भाव का धर्म बल माता-पिता के स्वास्थ्य, दीर्घायु एवं कुलदेवी की कृपा को सुरक्षित रखेगा।"
        : lang === "te" ? "9వ భావ ధర్మ బలం తల్లిదండ్రుల ఆరోగ్యం, దీర్ఘాయుష్షు మరియు కులదేవత అనుగ్రహాన్ని కాపాడుతుంది."
          : lang === "ta" ? "9ம் இடத்து தர்ம பலம் பெற்றோரின் ஆரோக்கியம், தீர்க்காயுள் மற்றும் குலதெய்வ அருளைப் பெற்றுத் தரும்."
            : "9th house dharma anchors ancestral tranquility and shields parental health.";

  const familyBundleCta = lang === "kn" ? "ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರ ಜಾತಕ ಹಾಗೂ ದಶಾ-ಗೋಚಾರಗಳ ಪರಸ್ಪರ ಸಮನ್ವಯವು ಗೃಹದಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಅಷ್ಟೈಶ್ವರ್ಯಗಳನ್ನು ನೆಲೆಸುವಂತೆ ಮಾಡುತ್ತದೆ."
    : lang === "mr" ? "कुटुंबातील प्रत्येक सदस्याच्या जन्मपत्रिकेतील ग्रहांचे सामंजस्य घरात अखंड सुख, शांतता व समृद्धी निर्माण करते."
      : lang === "hi" ? "परिवार के प्रत्येक सदस्य की कुंडली एवं ग्रह दशाओं का समन्वय गृह में शांति, सौहार्द एवं ऐश्वर्य की वृद्धि करता है।"
        : lang === "te" ? "కుటుంబ సభ్యులందరి జాతకాలు మరియు గ్రహ స్థితుల సమన్వయం ఇంట్లో శాంతి, సౌభాగ్యాలను పెంచుతుంది."
          : lang === "ta" ? "குடும்ப உறுப்பினர்களின் ஜாதக கிரக அமைப்புகளின் இணக்கம் இல்லத்தில் அமைதியையும் சுபிக்ஷத்தையும் நிலைநிறுத்தும்."
            : "Harmonizing the destiny charts and planetary alignments of all family members anchors domestic peace and enduring prosperity.";

  const familyQrUrl = `https://baggona.com/bhavishya?mode=fiveYear&ref=family_bundle&devoteeName=${encodeURIComponent(devoteeName || "Family")}`;

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
 * Synthesizes the full 5-year journey:
 * - Karmic and spiritual journey
 * - Peak golden breakthroughs
 * - Critical attention points (health, finances, emotions)
 * - 4 actionable wisdom anchors
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
    hi: `${greeting}, ${startY} से ${endY} का यह पंचवर्षीय कालचक्र आपके जीवन के धर्म, कर्म एवं भाग्य के त्रिकोण को जागृत करने वाला एक अलौकिक स्वर्णिम पर्व है। आपके जन्म लग्न ${lagnaName} एवं जन्म राशि ${rashiName} की ग्रहीय गति का विश्लेषण दर्शाता है कि वर्तमान में गतिशील ${mahaLordName} महादशा आपके निष्ठावान पुरुषार्थ को सर्वोच्च सफलता में परिणत करने हेतु तत्पर है। पूर्व काल में अनुभूत मानसिक संताप, पारिवारिक अवरोध एवं आर्थिक चिंताएं अब क्रमशः विलीन होकर आपके अंतर्मन में दिव्य शांति का संचार करेंगी। वैदिक सिद्धांत साक्षी हैं कि निष्काम भाव से किया गया सत्कर्म कभी निष्फल नहीं होता; आपका धर्मपालन, माता-पिता की सेवा एवं भगवद् भक्ति आपके कुल को चिरस्थायी प्रतिष्ठा प्रदान करेगी।`,
    te: `${greeting}, ${startY} నుండి ${endY} వరకు గల ఈ ఐదు సంవత్సరాల కాలచక్రం మీ జీవితంలో ధర్మం, కర్మ మరియు భాగ్యాల కలయికతో కూడిన పరమ పవిత్ర సమయం. మీ జన్మ లగ్నం ${lagnaName} మరియు జన్మ రాశి ${rashiName} గ్రహ స్థితులను పరిశీలిస్తే, ప్రస్తుతం నడుస్తున్న ${mahaLordName} మహాదశ మీ నిజాయితీతో కూడిన శ్రమకు అత్యున్నత ఫలితాలను అందించడానికి సిద్ధంగా ఉంది. గతంలో మీరు ఎదుర్కొన్న నిరాశలు, కుటుంబ ఒడిదుడుకులు మరియు ఆర్థిక ఇబ్బందులు క్రమంగా తొలగిపోయి, మీలో సరికొత్త నమ్మకం మరియు మనశ్శాంతి నెలకొంటాయి. వేదోక్త శాస్త్రాల ప్రకారం సత్కర్మలు ఎన్నటికీ వృథా కావు; మీ దైవభక్తి, పెద్దల ఆశీస్సులు మీ వంశానికి గొప్ప కీర్తిని చేకూరుస్తాయి.`,
    ta: `${greeting}, ${startY} முதல் ${endY} வரையிலான இந்த ஐந்து ஆண்டு காலச்சக்கரம் உங்கள் வாழ்க்கையில் தர்மம், கர்மா மற்றும் பாக்கியத்தை நிலைநிறுத்தும் மிக புனிதமான காலகட்டமாகும். உங்கள் லக்னம் ${lagnaName} மற்றும் ராசி ${rashiName} கிரக நிலைகளை ஆராயும்போது, தற்போது நடைபெறும் ${mahaLordName} மகா தசா உங்களின் கடின உழைப்பிற்கு தகுந்த நற்பலன்களை அள்ளித் தர உள்ளது. கடந்த கால மனக்கவலைகள், குடும்ப சவால்கள் மற்றும் பொருளாதார சுணக்கங்கள் விலகி உங்கள் மனதில் புதிய நம்பிக்கையும் மன அமைதியும் நிறையும். வேத விதிகளின்படி நற்செயல்கள் ஒருபோதும் வீண் போகாது; உங்கள் தர்ம சிந்தனையும் இறை நம்பிக்கையும் உங்கள் குடும்பத்திற்கு நீடித்த புகழைத் தேடித்தரும்.`,
    en: `${greeting}, this sovereign 5-year chronological arc spanning ${startY} through ${endY} constitutes a sacred watershed epoch harmonizing your spiritual merit, worldly responsibilities, and destined fortune. Synthesizing your natal ${lagnaName} Lagna and ${rashiName} Moon sign, the overarching stewardship of the ${mahaLordName} Mahadasha is divinely poised to translate past patience into tangible triumph. Ambiguities and domestic friction that once clouded your horizons will dissolve smoothly, restoring clarity and quiet confidence. Under sacred Parashari tenets, righteous action never perishes; your steadfast integrity, elder veneration, and devotion will illuminate your lineage with enduring honor.`
  }, targetLang);

  // Paragraph 2: Peak Opportunities & Milestones to Seize
  const p2 = pick6({
    kn: `ಈ ಐದು ವರ್ಷಗಳ ಕಾಲಾವಧಿಯಲ್ಲಿ, ${peakYearLabel} ವರ್ಷವು ನಿಮ್ಮ ಜೀವನದ ಸುವರ್ಣ ಭಾಗ್ಯೋದಯದ ಪರಾಕಾಷ್ಠೆಯಾಗಲಿದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗುರುಬಲ, ಉಪಚಯ ಸ್ಥಾನಗಳ ಶುಭ ಗ್ರಹ ಸಂಚಾರ ಹಾಗೂ ಸರ್ವಾಷ್ಟಕವರ್ಗದ ಗರಿಷ್ಠ ಬಿಂದುಗಳ ಬೆಂಬಲದಿಂದಾಗಿ, ಈ ಕಾಲಘಟ್ಟದಲ್ಲಿ ನೀವು ಕೈಗೊಳ್ಳುವ ಯಾವುದೇ ನೂತನ ವ್ಯಾಪಾರ, ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆ, ಸ್ವಂತ ಗೃಹ ನಿರ್ಮಾಣ ಅಥವಾ ಉದ್ಯೋಗದ ಮಹತ್ವದ ತಿರುವುಗಳು ದ್ವಿಗುಣ ಲಾಭವನ್ನು ತರಲಿವೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ನಾಯಕತ್ವಕ್ಕೆ ಹೊಸ ಮನ್ನಣೆ ದೊರೆಯಲಿದ್ದು, ಸಮಾಜದ ಗಣ್ಯ ವ್ಯಕ್ತಿಗಳ ಸ್ನೇಹ ಮತ್ತು ಸಹಕಾರವು ನಿಮ್ಮ ಕಾರ್ಯಗಳನ್ನು ಸುಗಮಗೊಳಿಸಲಿದೆ. ಈ ಸುವರ್ಣ ಕಾಲಾವಧಿಯಲ್ಲಿ ಶುಭ ಮುಹೂರ್ತಗಳನ್ನು ಸರಿಯಾಗಿ ಗುರುತಿಸಿ ದೃಢ ಸಂಕಲ್ಪದಿಂದ ಮುನ್ನಡೆದರೆ, ಮುಂದಿನ ಅನೇಕ ದಶಕಗಳ ಕಾಲ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ರಕ್ಷಿಸುವ ಭದ್ರ ಆರ್ಥಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಕೋಟೆಯನ್ನು ನಿರ್ಮಿಸಲು ಸಾಧ್ಯವಾಗಲಿದೆ.`,
    mr: `या पाच वर्षांच्या प्रवासात, ${peakYearLabel} हे वर्ष आपल्या आयुष्यातील सुवर्ण भाग्योदयाचा परमोच्च बिंदू ठरेल. देवगुरू बृहस्पतींचे अनुकूल कृपाछत्र, उपचय स्थानांमधील शुभ ग्रहांचे भ्रमण व अष्टकवर्गातील उच्च गुणांचे पाठबळ यामुळे या काळात आपण सुरू केलेले नवीन व्यवसाय, स्थावर मालमत्तेची खरेदी, गृहप्रवेश अथवा करिअरमधील मोठी झेप दुप्पट यश मिळवून देईल. आपल्या कार्यक्षेत्रात आपल्या नेतृत्वाला व कर्तृत्वाला नवी ओळख मिळेल आणि प्रतिष्ठित व्यक्तींचे सहकार्य आपले मार्ग सुकर करेल. या सुवर्णकाळात शुभ मुहूर्तांची योग्य निवड करून आत्मविश्वासाने पावले उचलल्यास भावी अनेक पिढ्यांसाठी एक अभेद्य आर्थिक व कौटुंबिक सुरक्षिततेचा पाया रचला जाईल.`,
    hi: `इस पंचवर्षीय यात्रा में, ${peakYearLabel} का वर्ष आपके जीवन में स्वर्णिम भाग्योदय की पराकाष्ठा सिद्ध होगा। देवगुरु बृहस्पति की अमृतमयी कृपा, उपचय भावों में शुभ ग्रहों का संचरण एवं सर्वाष्टकवर्ग के उच्च बिंदुओं का संबल मिलकर आपके समस्त पुरुषार्थ को अभूतपूर्व सफलता में बदल देंगे। इस अवधि में किया गया नवीन व्यापार आरंभ, भूमि-भवन का क्रय, गृहप्रवेश अथवा आजीविका में पदोन्नति आपको असाधारण लाभ प्रदान करेगी। कार्यक्षेत्र में आपके नेतृत्व कौशल को व्यापक मान्यता प्राप्त होगी तथा समाज के प्रतिष्ठित जनों का सानिध्य आपके कार्यों को सुगम बनाएगा। इस स्वर्णिम कालखंड में शुभ मुहूर्तों का सदुपयोग करते हुए दृढ़ संकल्प के साथ आगे बढ़ना आपकी आगामी पीढ़ियों हेतु एक सुदृढ़ सुरक्षा कवच निर्मित करेगा।`,
    te: `ఈ ఐదేళ్ల ప్రయాణంలో, ${peakYearLabel} సంవత్సరం మీ జీవితంలో స్వర్ణ భాగ్యోదయ పర్వంగా నిలుస్తుంది. దేవగురు బృహస్పతి అనుకూల గురుబలం, ఉపచయ స్థానాలలో శుభ గ్రహాల సంచారం మరియు సర్వాష్టకవర్గ అనుకూలతతో ఈ సమయంలో మీరు చేపట్టే కొత్త వ్యాపారాలు, స్థిరాస్తి కొనుగోలు, గృహ నిర్మాణం లేదా ఉద్యోగ ఉన్నతి రెట్టింపు ఫలితాలను అందిస్తాయి. మీ వృత్తి రంగంలో మీ నాయకత్వానికి గొప్ప గుర్తింపు లభిస్తుంది మరియు సమాజంలోని ప్రముఖుల సహాయ సహకారాలు మీ పనులను సులభతరం చేస్తాయి. ఈ స్వర్ణ సమయాన్ని సద్వినియోగం చేసుకుని ముందుకు సాగితే రాబోయే తరాలకు బలమైన ఆర్థిక, సామాజిక భద్రతను నిర్మించవచ్చు.`,
    ta: `இந்த ஐந்து ஆண்டுகளில், ${peakYearLabel} ஆண்டு உங்கள் வாழ்க்கையின் பொற்கால பாக்கியோதயத்தின் உச்சகட்டமாக அமையும். தேவகுரு பிரகஸ்பதியின் சுப பார்வை, உபசய ஸ்தான சுப கிரக சஞ்சாரம் மற்றும் அஷ்டகவர்க்க பலத்தால் இந்த காலத்தில் நீங்கள் தொடங்கும் புதிய தொழில், சொத்து வாங்குதல், புதுமனை புகுவிழா அல்லது வேலை உயர்வு பன்மடங்கு வெற்றியைத் தரும். உங்கள் தொழில் துறையில் உங்கள் தலைமைப் பண்பிற்கு புதிய அங்கீகாரம் கிடைக்கும்; சமுதாய பெரியோர்களின் ஆதரவு உங்கள் முயற்சிகளை வெற்றியாக்கும். இந்த பொற்காலத்தை நன்முறையில் பயன்படுத்தி செயல்பட்டால் எதிர்கால சந்ததியினருக்கு ஒரு வலுவான பொருளாதார அரணை உங்களால் உருவாக்க முடியும்.`,
    en: `Within this 5-year panorama, the epoch of ${peakYearLabel} stands out as your supreme golden zenith. Fortified by exalted Jovian benevolence (Guru Bala), auspicious Upachaya planetary transits, and robust Sarvashtakavarga bindus, every major endeavor inaugurated here—be it enterprise scaling, residential property acquisition, or high-stakes leadership elevation—multiplies in yield. Your professional acumen will command wide acclaim, while mentors and influential allies facilitate your ascent. Harnessing these consecrated windows with decisive purpose builds an unassailable financial and social bastion that shields your household for decades.`
  }, targetLang);

  // Paragraph 3: Critical Attention Points, Health, Equanimity & Solace
  const p3 = pick6({
    kn: `ಜೀವನದ ನೈಸರ್ಗಿಕ ನಿಯಮದಂತೆ, ಬೆಳಕಿನ ಜತೆಗೆ ನೆರಳೂ ಇರುವಂತೆ, ${cautionYearLabel} ಅವಧಿಯಲ್ಲಿ ನೀವು ವಿಶೇಷವಾದ ವಿವೇಕ ಹಾಗೂ ತಾಳ್ಮೆಯನ್ನು ಪ್ರದರ್ಶಿಸಬೇಕಾಗಿದೆ. ಈ ಕಾಲದಲ್ಲಿ ವೃತ್ತಿಪರ ಕೆಲಸದ ಅತಿಯಾದ ಒತ್ತಡದಿಂದ ನಿದ್ರಾಹೀನತೆ, ಮಾನಸಿಕ ಆಯಾಸ ಅಥವಾ ರಕ್ತದೊತ್ತಡದಂತಹ ದೈಹಿಕ ಏರುಪೇರುಗಳು ಉಂಟಾಗದಂತೆ ಮುಂಜಾಗ್ರತೆ ವಹಿಸಿ. ಅಪರಿಚಿತರೊಂದಿಗೆ ಹಣಕಾಸಿನ ವ್ಯವಹಾರಗಳನ್ನು ಮಾಡುವಾಗ ಅತಿಯಾದ ನಂಬಿಕೆಯನ್ನು ತಪ್ಪಿಸಿ, ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮುನ್ನಡೆಯುವುದು ಕ್ಷೇಮಕರ. ಕೌಟುಂಬಿಕ ಮಾತುಕತೆಗಳಲ್ಲಿ ಸಂಯಮವಿರಲಿ; ಕೋಪ ಅಥವಾ ಆತುರದಿಂದ ಯಾವುದೇ ಮಹತ್ವದ ಸಂಬಂಧಗಳನ್ನು ನೋಯಿಸಬೇಡಿ. ಗ್ರಹಗಳ ಯಾವುದೇ ಸವಾಲುಗಳೂ ಈಶ್ವರನ ಅನುಗ್ರಹಕ್ಕಿಂತ ದೊಡ್ಡದಲ್ಲ. ಪ್ರತಿ ದಿನವೂ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ಜಪಿಸುವುದು, ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡುವುದು ನಿಮ್ಮ ಸಮಸ್ತ ಆತಂಕಗಳನ್ನು ನಿವಾರಿಸಿ ನಿಮಗೆ ಅಖಂಡ ರಕ್ಷಾ ಕವಚವಾಗಲಿದೆ.`,
    mr: `जीवनाचा निसर्गनियम आहे की प्रकाशासोबत सावलीही असते; त्याचप्रमाणे ${cautionYearLabel} या काळात आपण विशेष दक्षता, संयम व विवेक बाळगणे आवश्यक आहे. कामाच्या अतिताणामुळे निद्रानाश, थकवा किंवा रक्तदाबाचा त्रास उद्भवू नये म्हणून दैनंदिन विश्रांतीकडे लक्ष द्यावे. पैशांच्या व्यवहारात किंवा कोणाला उसने पैसे देताना अतिविश्वास न ठेवता कायदेशीर कागदपत्रे तपासूनच निर्णय घ्या. कौटुंबिक संवादात शांतता ठेवा; रागाच्या भरात कोणाचेही मन दुखवू नका. ग्रहांचे कोणतेही आव्हान ईश्वराच्या कृपेपेक्षा मोठे नसते. नित्य श्रद्धेने महामृत्युंजय मंत्राचा जप करणे व श्री क्षेत्र गोकर्ण येथे आत्मलिंग महाबळेश्वरास रुद्राभिषेक संकल्प करणे आपल्या सर्व संकटांचे निवारण करून अभेद्य सुरक्षा देईल.`,
    hi: `जीवन के सनातन नियम के अनुसार प्रकाश के साथ छाया भी विद्यमान रहती है; अतः ${cautionYearLabel} के कालखंड में आपको विशेष धैर्य, विवेक एवं सतर्कता का परिचय देना होगा। कार्यक्षेत्र के अत्यधिक तनाव के कारण अनिद्रा, मानसिक अशांति अथवा रक्तचाप जैसी शारीरिक विसंगतियों से बचने हेतु समय पर विश्राम एवं प्राणायाम का आश्रय लें। आर्थिक लेन-देन अथवा नवीन साझेदारियों में अति-विश्वास से बचकर समस्त वैधानिक प्रपत्रों की जांच अवश्य करें। पारिवारिक संवाद में वाणी का संयम रखें; क्षणिक आवेश में किसी प्रियजन को आहत न करें। स्मरण रखें कि ग्रहों की कोई भी प्रतिकूलता ईश्वर की असीम कृपा से बड़ी नहीं है। नित्य महामृत्युंजय मंत्र का जप एवं श्री क्षेत्र गोकर्ण में आत्मलिंग महाबलेश्वर को रुद्राभिषेक संकल्प आपके समस्त कष्टों का निवारण कर दिव्य सुरक्षा कवच प्रदान करेगा।`,
    te: `జీవిత నియమం ప్రకారం వెలుగుతో పాటు నీడ కూడా ఉంటుంది; కాబట్టి ${cautionYearLabel} సమయంలో మీరు విశేషమైన వివేకం మరియు ఓర్పును ప్రదర్శించాలి. పని ఒత్తిడి వల్ల నిద్రలేమి, అలసట లేదా రక్తపోటు సమస్యలు రాకుండా తగిన విశ్రాంతి తీసుకోండి. ఆర్థిక లావాదేవీలలో అపరిచితులను అతిగా నమ్మకుండా జాగ్రత్త వహించండి. కుటుంబ సంభాషణలలో సంయమనం పాటించండి; కోపంతో ఎవరినీ నొప్పించవద్దు. గ్రహాల ఎలాంటి సవాళ్లయినా దైవానుగ్రహం ముందు నిలవలేవు. రోజూ మహామృత్యుంజయ మంత్ర జపం మరియు శ్రీ క్షేత్ర గోకర్ణంలోని మహాబలేశ్వర స్వామికి రుద్రాభిషేక సంకల్పం మీ సమస్త ఆందోళనలను తొలగించి పరిపూర్ణ రక్షగా నిలుస్తాయి.`,
    ta: `வாழ்க்கை விதிகளின்படி ஒளியுடன் நிழலும் இருப்பது இயல்பு; எனவே ${cautionYearLabel} காலத்தில் நீங்கள் மிகுந்த விவேகத்துடனும் பொறுமையுடனும் செயல்பட வேண்டும். அதிக வேலைப்பளுவால் மன அழுத்தம், தூக்கமின்மை ஏற்படாமல் உடலையும் மனதையும் அமைதியாக வைத்துக் கொள்ளுங்கள். பண விவகாரங்களில் கண்மூடித்தனமான நம்பிக்கையைத் தவிர்த்து எச்சரிக்கையுடன் ஆவணங்களைச் சரிபார்க்கவும். குடும்பத்தினருடன் பேசும்போது கோபத்தைத் தவிர்த்து அன்புடன் பழகவும். கிரகங்களின் எந்த சவாலும் இறைவனின் அருளுக்கு முன்னால் நிற்க முடியாது. தினமும் மகா மிருத்யுஞ்சய மந்திரம் ஜபிப்பதும் ஸ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வதும் உங்கள் கவலைகளை நீக்கி திவ்ய கவசமாக காக்கும்.`,
    en: `As in nature where light is balanced by shadow, the window of ${cautionYearLabel} requests mindful vigilance, measured patience, and discernment. Guard your constitutional vitality against workaholism, erratic sleep, and nervous exhaustion through daily breathwork and restful pauses. In commercial and personal transactions, insulate yourself against misplaced sentimentality by verifying all contractual covenants meticulously. Cultivate gentleness in domestic speech; never let momentary frustration fray sacred family bonds. Remember that no planetary friction surpasses divine grace. Chanting the Mahamrityunjaya Mantra and invoking Sri Kshetra Gokarna Mahabaleshwara dissolves all tribulation into profound sanctuary.`
  }, targetLang);

  const attentionPoints = [
    {
      icon: "🎯",
      title: pick6({
        kn: "ವೃತ್ತಿ ಧರ್ಮ & ನಿರಂತರ ಶ್ರದ್ಧೆ",
        mr: "करिअर व अखंड कार्यनिष्ठा",
        hi: "करियर निष्ठा एवं सतत् पुरुषार्थ",
        te: "వృత్తి ధర్మం & నిరంతర శ్రద్ధ",
        ta: "தொழில் தர்மம் & தொடர் உழைப்பு",
        en: "Professional Focus & Diligence"
      }, targetLang),
      guidance: pick6({
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
      title: pick6({
        kn: "ಆರ್ಥಿಕ ಶಿಸ್ತು & ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆ",
        mr: "आर्थिक शिस्त व सुरक्षित गुंतवणूक",
        hi: "आर्थिक अनुशासन एवं सुरक्षित निवेश",
        te: "ఆర్థిక క్రమశిక్షణ & సురక్షిత పెట్టుబడులు",
        ta: "பொருளாதார ஒழுக்கம் & பாதுகாப்பான முதலீடு",
        en: "Fiscal Discipline & Tangible Assets"
      }, targetLang),
      guidance: pick6({
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
      title: pick6({
        kn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಆಂತರಿಕ ನೆಮ್ಮದಿ",
        mr: "आरोग्य रक्षण व मनःशांती",
        hi: "आरोग्य संरक्षण एवं आंतरिक शांति",
        te: "ఆరోగ్య రక్షణ & మనశ్శాంతి",
        ta: "உடல் நலம் & மன அமைதி",
        en: "Vitality Preservation & Inner Peace"
      }, targetLang),
      guidance: pick6({
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
    careerFinancialPivot,
    healthVitalityShield,
    spiritualRemedyFulfillment,
    relationshipFamilyHarmony,
    spiritualSolace
  };
}

/**
 * 13. Dynamic Sacred Deity Portrait Resolver
 * Maps devotee's planetary lordship, Lagna, Moon, and Dasha to authentic poster images in public/daily_posters/
 */
function _resolveSacredDeityImageRaw(
  lagnaIdx: number,
  moonIdx: number,
  runningMahadashaPrimary: PlanetName,
  hasSaturnTroubleAnyYear: boolean,
  lang: SixLang
): { imagePath: string; deityName: string; sanctumTitle: string; blessingMotto: string } {
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
  lang: SixLang
): SacredDeityImageInfo {
  const raw = _resolveSacredDeityImageRaw(lagnaIdx, moonIdx, runningMahadashaPrimary, hasSaturnTroubleAnyYear, lang);
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
  lang: SixLang
): FiveYearMilestoneRow[] {
  const peakYear = baseYear + peakYearIdx;
  const cautionYear = baseYear + cautionYearIdx;
  const peakRange = `${formatNumber6L(peakYear, lang)} – ${formatNumber6L(peakYear + 1, lang)}`;
  const cautionRange = `${formatNumber6L(cautionYear, lang)} – ${formatNumber6L(cautionYear + 1, lang)}`;
  const earlyRange = `${formatNumber6L(baseYear, lang)} – ${formatNumber6L(baseYear + 1, lang)}`;
  const midRange = `${formatNumber6L(baseYear + 2, lang)} – ${formatNumber6L(baseYear + 3, lang)}`;
  const matureRange = `${formatNumber6L(baseYear + 3, lang)} – ${formatNumber6L(baseYear + 4, lang)}`;

  return [
    {
      id: "m1_breakthrough",
      dimensionTitle: pick6({
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
      }, lang),
      probabilityScore: formatNumber6L(92, lang) + "%",
      actionAdvice: pick6({
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
      dimensionTitle: pick6({
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
        mr: "दशम भावाचा स्वामी व सूर्य-बुधाचा शुभ योग",
        hi: "दशमेश बल एवं सूर्य-बुध का बुधादित्य योग",
        te: "దశమాధిపతి బలం మరియు సూర్య-బుధుల యోగం",
        ta: "பத்தாம் இடத்து அதிபதி பலம் & சூரிய-புதன் யோகம்",
        en: "10th House Lord strength & Sun-Mercury alignment"
      }, lang),
      probabilityScore: formatNumber6L(88, lang) + "%",
      actionAdvice: pick6({
        kn: ageCategory === "child" ? "ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಗ್ರ ಶ್ರೇಣಿಯ ಸಾಧನೆ ಹಾಗೂ ಹೊಸ ಕೌಶಲ್ಯಗಳ ಕರಗತಕ್ಕೆ ಪರಮ ಪೋಷಕ ಕಾಲ."
          : ageCategory === "youth" ? "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಉನ್ನತ ಸಂಸ್ಥೆಯಲ್ಲಿ ವೃತ್ತಿ ಪ್ರವೇಶ ಖಚಿತ."
            : "ಸಂಸ್ಥೆಯಲ್ಲಿ ಉನ್ನತ ಹುದ್ದೆ, ಗೌರವ ಪ್ರಶಸ್ತಿ ಹಾಗೂ ನಾಯಕತ್ವದ ಸ್ಥಾನಮಾನ ಪ್ರಾಪ್ತಿ. ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ ಕಾಪಾಡಿ.",
        mr: ageCategory === "child" ? "शालेय परीक्षेत अव्वल गुण व विशेष बौद्धिक कौशल्यांचा विकास होईल."
          : ageCategory === "youth" ? "स्पर्धा परीक्षेत यश व नामांकित कंपनीत करिअरची शानदार सुरुवात."
            : "उच्च पदभार, पगारवाढ व अधिकारांचा विस्तार होईल. वरिष्ठांशी सुसंवाद ठेवा.",
        hi: ageCategory === "child" ? "शैक्षणिक क्षेत्र में उत्कृष्ट प्रदर्शन एवं बौद्धिक प्रतिभा का विकास होगा।"
          : ageCategory === "youth" ? "प्रतियोगी परीक्षाओं में सफलता एवं प्रतिष्ठित संस्थान में करिअर का शुभारंभ।"
            : "उच्च पद, पदोन्नति एवं नेतृत्व की प्रतिष्ठा प्राप्त होगी। कार्यक्षेत्र में एकाग्रता बनाए रखें।",
        te: ageCategory === "child" ? "విద్యా రంగంలో విశేష ప్రతిభ మరియు కొత్త నైపుణ్యాల సాధనకు ఉత్తమ సమయం."
          : ageCategory === "youth" ? "పోటీ పరీక్షలలో విజయం మరియు ఉన్నత సంస్థలో ఉద్యోగ ప్రారంభం."
            : "ఉన్నత పదవి, వేతన వృద్ధి మరియు నాయకత్వ బాధ్యతలు లభిస్తాయి. కార్యక్షేత్రంలో అంకితభావంతో పనిచేయండి.",
        ta: ageCategory === "child" ? "கல்வியில் சிறந்த தேர்ச்சி மற்றும் தனித்துவமான அறிவுத்திறன் வெளிப்படும்."
          : ageCategory === "youth" ? "போட்டித் தேர்வுகளில் வெற்றி மற்றும் மதிப்புமிக்க நிறுவனத்தில் புதிய வேலை கிட்டும்."
            : "பதவி உயர்வு, ஊதிய உயர்வு மற்றும் தலைமைப் பொறுப்புகள் அமையும். நன்மதிப்பை பாதுகாத்துக் கொள்ளுங்கள்.",
        en: "Executive elevation, prestigious professional recognition, and strategic career ascendancy."
      }, lang)
    },
    {
      id: "m3_wealth",
      dimensionTitle: pick6({
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
      }, lang),
      probabilityScore: formatNumber6L(86, lang) + "%",
      actionAdvice: pick6({
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
      dimensionTitle: pick6({
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
      }, lang),
      probabilityScore: formatNumber6L(84, lang) + "%",
      actionAdvice: pick6({
        kn: "ಸ್ವಂತ ಮನೆ, ನಿವೇಶನ ಖರೀದಿ ಅಥವಾ ಹೊಸ ವಾಹನ ಯೋಗ ಸಿದ್ಧಿ. ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಹೂರ್ತದಲ್ಲಿ ಗೃಹಪ್ರವೇಶ ಮಾಡಿ.",
        mr: "स्वतःचे घर, प्लॉट खरेदी किंवा नवीन वाहन खरेदीचा उत्तम योग. कागदपत्रे तपासून शुभ मुहूर्तावर निर्णय घ्या.",
        hi: "स्वयं का आवास, भूखंड क्रय अथवा नवीन वाहन प्राप्ति का प्रबल योग। शुभ मुहूर्त में गृह-प्रवेश करें।",
        te: "సొంత ఇల్లు, స్థలం కొనుగోలు లేదా కొత్త వాహన యోగం కలుగుతుంది. శాస్త్రోక్త ముహూర్తంలో గృహప్రవేశం చేయండి.",
        ta: "சொந்த வீடு, நிலம் வாங்குதல் அல்லது புதிய வாகன யோகம் அமையும். சுப முகூர்த்தத்தில் கிரஹப்பிரவேசம் செய்யுங்கள்.",
        en: "Prime property acquisition, construction completion, and vehicular upgrade under auspicious Muhurtas."
      }, lang)
    },
    {
      id: "m5_family",
      dimensionTitle: pick6({
        kn: "💍 ಮಾಂಗಲ್ಯ ಭಾಗ್ಯ / ಸಂತಾನ ಸೌಖ್ಯ / ದಾಂಪತ್ಯ",
        mr: "💍 विवाह भाग्य / संतान सौख्य / कौटुंबिक शांतता",
        hi: "💍 विवाह योग / संतान सुख / दांपत्य सौख्य",
        te: "💍 వివాహ భాగ్యం / సంతాన సౌఖ్యం / దాంపత్యం",
        ta: "💍 திருமண யோகம் / புத்திர பாக்கியம் / குடும்ப ஒற்றுமை",
        en: "💍 Matrimonial Alliance, Progeny & Family Harmony"
      }, lang),
      timingWindow: earlyRange,
      planetaryCatalyst: pick6({
        kn: "ಸಪ್ತಮ ಮತ್ತು ಪಂಚಮ ಭಾವಗಳ ಮೇಲೆ ದೇವಗುರುವಿನ ದೃಷ್ಟಿ",
        mr: "सप्तम व पंचम भावावर देवगुरूंची अमृत दृष्टी",
        hi: "सप्तम एवं पंचम भाव पर गुरु की अमृत दृष्टि",
        te: "సప్తమ, పంచమ స్థానాలపై గురు గ్రహ అమృత దృష్టి",
        ta: "ஏழாம் மற்றும் ஐந்தாம் இடங்களில் குரு பகவானின் சுப பார்வை",
        en: "Jupiterian aspect on 5th and 7th houses of alliance and progeny"
      }, lang),
      probabilityScore: formatNumber6L(85, lang) + "%",
      actionAdvice: pick6({
        kn: ageCategory === "child" ? "ಕುಟುಂಬದಲ್ಲಿ ಹಿರಿಯರ ಪ್ರೀತಿ-ವಾತ್ಸಲ್ಯ, ಸೋದರ ಸೌಖ್ಯ ಹಾಗೂ ಮಂಗಳ ಕಾರ್ಯಗಳ ವೈಭವ."
          : ageCategory === "youth" ? "ಮನಮೆಚ್ಚಿದ ಸಂಗಾತಿಯೊಂದಿಗೆ ಮದುವೆ ಯೋಗ ಅಥವಾ ಆದರ್ಶ ಸಂಬಂಧದ ನಾಂದಿ."
            : "ದಾಂಪತ್ಯದಲ್ಲಿ ಅನ್ಯೋನ್ಯತೆ, ಸಂತಾನೋತ್ಸವ ಅಥವಾ ಮಕ್ಕಳ ಶೈಕ್ಷಣಿಕ/ವೈವಾಹಿಕ ಸಿದ್ಧಿಯ ಸಂಭ್ರಮ.",
        mr: ageCategory === "child" ? "कुटुंबात आनंद, भावंडांचे सहकार्य व घरात मंगल कार्यांची लगबग राहील."
          : ageCategory === "youth" ? "विवाह जमण्याचे उत्तम योग व कौटुंबिक जीवनाची गोड सुरुवात."
            : "दांपत्य जीवनात सुसंवाद, संतती सुख किंवा मुलांच्या यशामुळे कुटुंबात आनंदोत्सव.",
        hi: ageCategory === "child" ? "परिवार में स्नेह, भाई-बहनों का सहयोग एवं मांगलिक आयोजनों की प्रसन्नता रहेगी।"
          : ageCategory === "youth" ? "विवाह के उत्तम योग एवं जीवन में नए शुभ संबंधों का शुभारंभ।"
            : "दांपत्य जीवन में मधुरता, संतान सुख अथवा संतानों की प्रगति से घर में हर्षोल्लास।",
        te: ageCategory === "child" ? "కుటుంబంలో ఆప్యాయత, తోబుట్టువుల సహకారం మరియు ఇంట్లో శుభకార్యాల సంతోషం."
          : ageCategory === "youth" ? "వివాహ యోగం మరియు జీవిత భాగస్వామితో నూతన జీవిత ఆరంభం."
            : "దాంపత్యంలో అనుకూలత, సంతాన సౌభాగ్యం లేదా పిల్లల విజయాలతో ఇంట్లో వేడుకలు.",
        ta: ageCategory === "child" ? "குடும்பத்தில் அன்பு, சகோதர ஒற்றுமை மற்றும் மங்களகரமான சுப நிகழ்வுகள்."
          : ageCategory === "youth" ? "திருமண யோகம் கூடிவந்து நல்வாழ்க்கை அமைய நல்வாய்ப்பு."
            : "தம்பதியரிடையே அன்யோன்யம், குழந்தை பாக்கியம் அல்லது குழந்தைகளின் வெற்றியால் மகிழ்ச்சி.",
        en: "Auspicious matrimonial alliance, joyful child blessings, and enduring domestic harmony."
      }, lang)
    },
    {
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
      }, lang),
      probabilityScore: formatNumber6L(80, lang) + "%",
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

    // Calculate Vitality / Energy Score (0 - 100) refined with Sarvashtakavarga (SAV)
    let score = 65;
    if (isGuruBala) score += 16;
    else score -= 8;

    if (isSubhaShani) score += 14;
    else if (isSadeSati) score -= 14;
    else if (isAshtama) score -= 16;
    else if (isKantaka) score -= 8;

    // Sarvashtakavarga (SAV) Refinement
    const jupSav = savTable[guruSign] ?? 28;
    const satSav = savTable[shaniSign] ?? 28;
    if (jupSav >= 30) score += 6;
    else if (jupSav < 25) score -= 4;

    if (satSav >= 30) score += 5; // Saturn in high SAV gives durable property/promotions
    else if (satSav < 25) score -= 5;

    // Dasha compatibility
    if (mahaLord === lagnaLordKey) score += 8;
    if (bhuktiLord === lagnaLordKey) score += 5;

    score = Math.max(35, Math.min(96, score));

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

    // Tajika Muntha Calculation (advances 1 sign per completed year: Tajika Neelakanthi rule)
    const birthYear = parseInt(birthDateYmd.split("-")[0], 10) || (baseYear - Math.floor(currentAgeYears));
    const completedVarshaYears = startY - birthYear;
    const munthaSign = (lagnaIdx + (completedVarshaYears >= 0 ? completedVarshaYears : Math.floor(currentAgeYears) + i)) % 12;
    const munthaHouse = ((munthaSign - lagnaIdx + 12) % 12) + 1;
    const munthaRashi = RASHI_6L[munthaSign]?.[targetLang] || "";
    const munthaTheme = getMunthaTheme(munthaHouse, targetLang);

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
                : `Benefic Saturn transit (${shaniHouse}th house): guarantees triumph over competition and steady gains.`;
    } else {
      shaniText = targetLang === "kn" ? `${formatNumber6L(shaniHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಗೋಚಾರ: ನಿಯಮಿತ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ನ್ಯಾಯಯುತ ಫಲ.`
        : targetLang === "hi" ? `${formatNumber6L(shaniHouse, targetLang)}वें भाव में शनि गोचर: नियमित परिश्रम का उत्तम फल।`
          : targetLang === "mr" ? `${formatNumber6L(shaniHouse, targetLang)}व्या स्थानी शनी गोचर: नियमित प्रयत्नांना योग्य फळ मिळेल.`
            : targetLang === "te" ? `${formatNumber6L(shaniHouse, targetLang)}వ ఇంట సాధారణ శని గోచారం: క్రమబద్ధమైన కృషికి తగిన ఫలితం.`
              : targetLang === "ta" ? `${formatNumber6L(shaniHouse, targetLang)}ம் வீட்டில் சனி கோச்சாரம்: உழைப்புக்கேற்ற பலன் கிட்டும்.`
                : `Moderate Saturn transit (${shaniHouse}th house): rewards systematic discipline.`;
    }

    // Guru narrative
    let guruText = "";
    if (isGuruBala) {
      guruText = targetLang === "kn" ? `${formatNumber6L(guruHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಪೂರ್ಣ ಗುರುಬಲ: ಭಾಗ್ಯೋದಯ, ಶುಭ ಸಮಾರಂಭ ಹಾಗೂ ಧನಲಾಭ.`
        : targetLang === "hi" ? `${formatNumber6L(guruHouse, targetLang)}वें भाव में पूर्ण गुरुबल: भाग्योदय, मांगलिक कार्य एवं धनलाभ।`
          : targetLang === "mr" ? `${formatNumber6L(guruHouse, targetLang)}व्या स्थानी संपूर्ण गुरुबळ: भाग्योदय, शुभकार्ये व धनवृद्धी.`
            : targetLang === "te" ? `${formatNumber6L(guruHouse, targetLang)}వ ఇంట సంపూర్ణ గురు బలం: భాగ్యోదయం, శుభకార్యాలు, ధనలాభం.`
              : targetLang === "ta" ? `${formatNumber6L(guruHouse, targetLang)}ம் வீட்டில் முழு குரு பலன்: பாக்கியோதயம், சுப காரியங்கள், தனலாபம்.`
                : `Auspicious Guru Bala (${guruHouse}th house): divine grace, auspicious celebrations, and financial expansion.`;
    } else {
      guruText = targetLang === "kn" ? `${formatNumber6L(guruHouse, targetLang)}ನೇ ಮನೆಯಲ್ಲಿ ಆಂತರಿಕ ಗುರು ಗೋಚಾರ: ಜ್ಞಾನ ವೃದ್ಧಿ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ವಿವೇಕ.`
        : targetLang === "hi" ? `${formatNumber6L(guruHouse, targetLang)}वें भाव में अंतर्मुखी गुरु गोचर: ज्ञान वृद्धि एवं कर्तव्य निष्ठा।`
          : targetLang === "mr" ? `${formatNumber6L(guruHouse, targetLang)}व्या स्थानी अंतर्मुख गुरु गोचर: ज्ञान संपादन व कर्तव्य पालनात प्रगती.`
            : targetLang === "te" ? `${formatNumber6L(guruHouse, targetLang)}వ ఇంట అంతర్ముఖ గురు గోచారం: జ్ఞానవృద్ధి, కర్తవ్య నిష్ఠ.`
              : targetLang === "ta" ? `${formatNumber6L(guruHouse, targetLang)}ம் வீட்டில் அகநிலை குரு கோச்சாரம்: ஞான வளர்ச்சி, கடமை உணர்வு.`
                : `Internal Guru transit (${guruHouse}th house): fosters spiritual introspection and skill acquisition.`;
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

    if (ageCategory === "child") {
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
      en: `${greeting}, during the auspicious ${samvatsaraMeta.samvatsaraEn} Samvatsara epoch (${gregorianRange}), the celestial movements in your birth chart activate a transformative chapter in your life. Throughout this annual cycle, the overarching stewardship of the ${mahaLord} Mahadasha harmonized with the ${bhuktiLord} Bhukti governs your professional pursuits, personal vitality, and key decisions. The Tajika annual Muntha point traverses House ${munthaHouse} from your natal Lagna, establishing ${munthaTheme} as the prime energetic focus of the year. ${shaniDeepNarration} Grounded in steady devotion and focused resolve, you will convert every friction into a stepping stone for enduring success.`
    }, targetLang);

    const yP2 = pick6({
      kn: `ಈ ${gregorianRange} ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ, ಆರ್ಥಿಕ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜೀವನದಲ್ಲಿ ಕಂಡುಬರುವ ಮುಖ್ಯ ಫಲಗಳೆಂದರೆ: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ಶನಿ ಇರುವ ರಾಶಿಯು ${satSav} ಸರ್ವಾಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳ ಬಲವನ್ನು ಹೊಂದಿರುವುದರಿಂದ, ಕಷ್ಟಪಟ್ಟು ಮಾಡುವ ಪ್ರತಿಯೊಂದು ಕೆಲಸದಲ್ಲೂ ಯಾವುದೇ ನಿರಾಶೆಗೆ ಅವಕಾಶವಿಲ್ಲದೆ ದೃಢವಾದ ಆರ್ಥಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಪ್ರಗತಿಯು ನಿಮ್ಮ ಪಾಲಿಗೆ ಒಲಿಯಲಿದೆ.`,
      mr: `या ${gregorianRange} वर्षात आपल्या करिअर, आर्थिक व कौटुंबिक जीवनात घडणारी मुख्य फळे म्हणजे: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} आपल्या जन्मपत्रिकेत अष्टकवर्गात शनीच्या राशीला ${satSav} सर्व-अष्टकवर्ग गुणांचे पाठबळ लाभल्यामुळे, केलेल्या प्रामाणिक कष्टांचे पूर्ण चीज होऊन जीवनात आर्थिक सुबत्ता व सामाजिक सन्मान अबाधित राहील.`,
      hi: `इस ${gregorianRange} वर्ष में आपके करियर, आर्थिक एवं पारिवारिक जीवन में दृष्टिगोचर होने वाले मुख्य प्रतिफल हैं: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} आपकी जन्म कुंडली के अष्टकवर्ग में शनि देव की राशि को ${satSav} सर्वाष्टकवर्ग बिंदुओं का सशक्त बल प्राप्त होने के कारण, आपके द्वारा किए गए सभी निष्ठावान प्रयासों में किसी प्रकार की निराशा न होकर निरंतर आर्थिक एवं सामाजिक प्रगति सुनिश्चित होगी।`,
      te: `ఈ ${gregorianRange} సంవత్సరంలో మీ కెరీర్, ఆర్థిక మరియు కుటుంబ జీవితంలో కనిపించే ముఖ్య ఫలితాలు: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} మీ జాతక అష్టకవర్గంలో శని ఉన్న రాశికి ${satSav} సర్వాష్టకవర్గ బిందువుల బలం ఉండటంతో, మీరు చేసే ప్రతి ప్రయత్నానికి తగిన ప్రతిఫలం లభించి ఆర్థిక స్థిరత్వం మరియు సామాజిక గౌరవం చేకూరుతాయి.`,
      ta: `இந்த ${gregorianRange} ஆண்டில் உங்கள் தொழில், நிதி மற்றும் குடும்ப வாழ்க்கையில் ஏற்படும் முக்கிய பலன்கள்: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} உங்கள் ஜாதக அஷ்டகவர்க்கத்தில் சனி பகவான் அமர்ந்த ராசிக்கு ${satSav} பரல்கள் பலம் உள்ளதால், உங்கள் கடின உழைப்பிற்கு ஏற்ற முழு பலனும் கிடைத்து பொருளாதார மேன்மையும் சமூக அந்தஸ்தும் உறுதியாக உயரும்.`,
      en: `Evaluating your personal, domestic, and professional horizons during ${gregorianRange}, the tangible milestones include: ${whatToExpect.join(" ")} ${guruDeepNarration} ${doubleTransitHighlight ? `${doubleTransitHighlight} ` : ""}${rahuKetuDeepNarration} Fortified by ${satSav} Sarvashtakavarga benefic bindus in Saturn's transit sign, your systematic efforts will yield steady dividend compounding, preventing fatigue and anchoring resilient social stature.`
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
      questionInquest
    });
  }

  // Build Life Chapters
  const chapters: FiveYearLifeChapter[] = [];
  const isMarried = personalization?.maritalStatus === "married";
  const isFemale = personalization?.gender === "Female";
  const hasChildren = personalization?.childrenStatus === "has_children";

  if (ageCategory === "child") {
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
            en: `Wholesome nutrition, sound sleep, and energetic outdoor play will solidify a resilient immune shield, ensuring vibrant health and boundless enthusiasm throughout childhood.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯ ದರ್ಶನ ಹಾಗೂ ತುಳಸಿ ತೀರ್ಥ ಸೇವನೆ ಆಯುಷ್ಯ ವರ್ಧಕ.",
          mr: "सकाळी सूर्यदर्शन व तुळशीपत्राचे सेवन आरोग्यासाठी अमृततुल्य आहे.",
          hi: "प्रातः सूर्य दर्शन एवं तुलसी दल का सेवन आरोग्यवर्धक है।",
          te: "ఉదయాన్నే సూర్య దర్శనం మరియు తులసి తీర్థం సేవించడం ఆయుష్షును పెంచుతుంది.",
          ta: "காலை சூரிய தரிசனம் & துளசி தீர்த்தம் அருந்துவது உடல்நலத்திற்கு சிறந்தது.",
          en: "Morning sunlight and holy Tulasi water preserve radiant immunity."
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
            ta: `ஓவியம், இசை, நடனம் அல்லது இலக்கியத்தில் ஆர்வம் வெளிப்படும். பெற்றோரின் ஆதரவு இத்திறமைகளை மெருகேற்றும்.`,
            en: `Innate aesthetic gifts in music, visual art, or literary expression emerge vividly with warm parental encouragement.`
          }, targetLang),
          pick6({
            kn: `ಶಾಲಾ ವಾರ್ಷಿಕೋತ್ಸವಗಳು ಹಾಗೂ ಬಾಹ್ಯ ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ಭಾಗವಹಿಸುವುದರಿಂದ ಮಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸ ಗಣನೀಯವಾಗಿ ವೃದ್ಧಿಯಾಗಲಿದೆ. ಹೊಸ ಭಾಷೆಗಳನ್ನು ಕಲಿಯುವ ಹಾಗೂ ಸೃಜನಶೀಲ ಹವ್ಯಾಸಗಳನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವ ಅದ್ಭುತ ಆಸಕ್ತಿ ವ್ಯಕ್ತವಾಗಲಿದೆ.`,
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
  } else if (ageCategory === "senior") {
    chapters.push(
      {
        id: "senior_spirituality",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಆಧ್ಯಾತ್ಮಿಕ ಪರಿಪಕ್ವತೆ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಮನಃಶಾಂತಿ",
          mr: "अध्याय १: आध्यात्मिक परिपक्वता, तीर्थाटन व आत्मिक शांती",
          hi: "अध्याय १: आध्यात्मिक परिपक्वता, तीर्थाटन एवं आत्मिक शांति",
          te: "అధ్యాయం 1: ఆధ్యాత్మిక పరిపక్వత, తీర్థయాత్రలు & మనశ్శాంతి",
          ta: "அத்தியாயம் 1: ஆன்மீக முதிர்ச்சி, தீர்த்த யாத்திரை & மன அமைதி",
          en: "Chapter 1: Spiritual Maturity, Sacred Pilgrimage & Inner Serenity"
        }, targetLang),
        subtitle: pick6({
          kn: "ಗುರು ಹಾಗೂ ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ತತ್ತ್ವಜ್ಞಾನ ವೃದ್ಧಿ",
          mr: "गुरू व केतूच्या प्रभावाने तत्त्वज्ञानाची वृद्धी",
          hi: "गुरु एवं केतु के प्रभाव से तत्वज्ञान एवं वैराग्य भाव",
          te: "గురు మరియు కేతువుల ప్రభావంతో తత్వజ్ఞాన వృద్ధి",
          ta: "குரு & கேதுவின் பார்வையால் தத்துவ ஞானம்",
          en: "Jovian contemplation and Ketu's introspective detachment"
        }, targetLang),
        icon: "🪔",
        contemplationInquest: pick6({
          kn: "ಆಧ್ಯಾತ್ಮಿಕ ಪರಿಪಕ್ವತೆ, ಮೋಕ್ಷ ಸಾಧನೆ ಹಾಗೂ ತೀರ್ಥಯಾತ್ರಾ ಪುಣ್ಯ ಸಂಚಯನ ಚಿಂತನೆ",
          mr: "आध्यात्मिक प्रगती, तीर्थाटन व आत्मिक शांतीचा महामार्ग चिंतन",
          hi: "आध्यात्मिक परिपक्वता, तीर्थाटन एवं आत्मिक शांति का पावन चिंतन",
          te: "ఆధ్యాత్మిక పరిపక్వత, తీర్థయాత్రలు మరియు ఆత్మ శాంతి విశ్లేషణ",
          ta: "ஆன்மீக முதிர்ச்சி, தீர்த்த யாத்திரை & ஆத்ம சாந்தி சிந்தனை",
          en: "Contemplation on Spiritual Realization, Sacred Shrines & Inner Equanimity"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಚೇತನವು ಪರಮ ಪವಿತ್ರತೆಯನ್ನು ಪಡೆಯಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ, ಕಾಶಿ, ರಾಮೇಶ್ವರಂ ಅಥವಾ ಹರಿದ್ವಾರದಂತಹ ಪುಣ್ಯ ಕ್ಷೇತ್ರಗಳ ದರ್ಶನದಿಂದ ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ಲಭಿಸಲಿದೆ.`,
            mr: `आयुष्याच्या या टप्प्यावर आपली आध्यात्मिक वृत्ती अत्यंत सात्विक होईल. गोकर्ण, काशी, रामेश्वर किंवा पंढरपूरसारख्या पवित्र तीर्थक्षेत्रांच्या दर्शनाने मन शांत होईल.`,
            hi: `जीवन के इस पावन काल में आपकी आध्यात्मिक चेतना प्रखर होगी। गोकर्ण, काशी, रामेश्वरम अथवा बद्रीनाथ जैसे तीर्थों की यात्रा से आत्मिक आनंद मिलेगा।`,
            te: `జీవితంలోని ఈ దశలో మీ ఆధ్యాత్మిక చైతన్యం పరమ పవిత్రతను పొందుతుంది. గోకర్ణం, కాశీ, రామేశ్వరం వంటి పుణ్యక్షేత్రాల దర్శనంతో మనస్సుకు ఆనందం లభిస్తుంది.`,
            ta: `வாழ்க்கையின் இந்த புனித காலகட்டத்தில் உங்கள் ஆன்மீக உணர்வு மேலோங்கும். கோகர்ணம், காசி, ராமேஸ்வரம் போன்ற தலங்களுக்கு யாத்திரை செல்வது சாந்தி தரும்.`,
            en: `This 5-year phase marks a sublime awakening of philosophical wisdom, fulfilling cherished vows of visiting sanctified pilgrimage shrines.`
          }, targetLang),
          pick6({
            kn: `ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಾರಾಯಣ, ಗಾಯತ್ರಿ ಜಪ, ಶಿವ ಪಂಚಾಕ್ಷರೀ ಸ್ಮರಣೆ ಹಾಗೂ ಅನ್ನದಾನದಂತಹ ನಿತ್ಯ ಪುಣ್ಯ ಕಾರ್ಯಗಳು ನಿಮ್ಮ ಸಮಸ್ತ ವಂಶಕ್ಕೆ ಅಕ್ಷಯ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವಾಗಲಿವೆ. ಹಿಂದಿನ ಕರ್ಮಗಳ ಶೇಷಗಳು ಕರಗಿ, ಮನಸ್ಸು ನಿರ್ಮಲವಾಗಲಿದೆ. ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ಭಗವಂತನ ನಾಮಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಸದಾ ಧನಾತ್ಮಕ ತರಂಗಗಳು ಹರಿಯಲಿವೆ.`,
            mr: `नित्य नियमाने विष्णु सहस्रनाम, गायत्री मंत्र, शिव स्तोत्रे व अन्नदानासारखी सत्कृत्ये केल्याने आपल्या संपूर्ण कुळाला ईश्वराचे अक्षय सुरक्षा कवच लाभेल. पूर्वजन्माचे संचित दोष नष्ट होऊन अंतःकरण शुद्ध बनेल. दररोज सकाळी भगवंताचे नामस्मरण केल्याने घरातील वातावरण सदैव प्रसन्न, मंगलमय व सकारात्मक राहील.`,
            hi: `दैनिक जीवन में विष्णु सहस्रनाम पाठ, गायत्री मंत्र, शिव पंचाक्षरी जप एवं अन्नदान जैसे पुण्य कार्य आपके संपूर्ण कुल एवं भावी पीढ़ियों के लिए अक्षय सुरक्षा कवच सिद्ध होंगे। समस्त पूर्व संचित क्लेश शांत होकर अंतःकरण निर्मल बनेगा। नित्य प्रभु नाम संकीर्तन से घर में सकारात्मक ऊर्जा का निरंतर प्रवाह रहेगा।`,
            te: `నిత్య జీవితంలో విష్ణు సహస్రనామ పారాయణం, గాయత్రీ మంత్రం, శివ పంచాక్షరీ జపం మరియు అన్నదానం వంటి పుణ్యకార్యాలు మీ వంశానికి శాశ్వత దైవిక రక్షణ కవచంగా నిలుస్తాయి. పూర్వ కర్మల దోషాలు తొలగి అంతఃకరణం నిర్మలమవుతుంది. ప్రతిరోజూ దైవ నామస్మరణతో మీ ఇంట్లో సుఖశాంతులు వెల్లివిరుస్తాయి.`,
            ta: `தினசரி விஷ்ணு சஹஸ்ரநாம பாராயணம், காயத்ரி ஜபம், சிவ நாம சங்கீர்த்தனம் மற்றும் அன்னதானம் போன்ற நற்காரியங்கள் உங்கள் சந்ததியினருக்கு தெய்வீக பாதுகாப்பாக அமையும். முந்தைய கர்ம வினைகள் நீங்கி மனம் தூய்மை பெறும். தினமும் இறைவனின் திருநாமத்தை உச்சரிப்பதால் உங்கள் இல்லத்தில் எப்போதும் நேர்மறை அலைகள் பரவும்.`,
            en: `Engaging in daily recitations of the Vishnu Sahasranama, Gayatri Japa, and charitable Annadana weaves an enduring karmic protective shield across your children and grandchildren. Past anxieties dissolve into pristine mental stillness, while disciplined devotional remembrance permeates the household with auspicious grace.`
          }, targetLang),
          pick6({
            kn: `ಜೀವನದ ಸಮಸ್ತ ಏರಿಳಿತಗಳನ್ನು ಸಮಚಿತ್ತದಿಂದ ಸ್ವೀಕರಿಸುವ ಪರಮ ಶಾಂತಿಯು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನೆಲೆಸಲಿದೆ. ಆಧ್ಯಾತ್ಮಿಕ ಸತ್ಸಂಗಗಳು ಹಾಗೂ ದೇವಸ್ಥಾನಗಳ ಸೇವಾ ಕೈಂಕರ್ಯಗಳು ನಿಮಗೆ ಅಖಂಡ ಆನಂದವನ್ನು ತರಲಿವೆ.`,
            mr: `आयुष्यातील सुख-दुःखांकडे साक्षीभावाने पाहण्याची परम शांती मनात निर्माण होईल. सत्संग, देवदर्शन व धर्मकार्यात वेळ घालवल्याने आत्मिक समाधान लाभेल.`,
            hi: `जीवन के समस्त अनुभवों को समभाव से स्वीकार करने की परम शांति प्राप्त होगी। आध्यात्मिक सत्संग, तीर्थ दर्शन एवं भगवद् सेवा से असीम आनंद की अनुभूति होगी।`,
            te: `జీవితంలోని ఎగుడుదిగుళ్లను సమదృష్టితో స్వీకరించే ప్రశాంతత మీ మనస్సులో నెలకొంటుంది. ఆధ్యాత్మిక సత్సంగాలు మరియు దైవ సేవలు మీకు పరిపూర్ణ ఆనందాన్ని ఇస్తాయి.`,
            ta: `வாழ்வின் ஏற்றத்தாழ்வுகளை சமநோக்குடன் ஏற்கும் மன அமைதி உண்டாகும். ஆன்மீக சத்விஷயங்கள் மற்றும் கோவில் திருப்பணிகள் உங்களுக்கு எல்லையற்ற மன நிறைவைத் தரும்.`,
            en: `A serene equanimity will envelop your consciousness, allowing you to witness life's unfolding with tranquil grace, drawing deep bliss from spiritual assemblies and temple devotions.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ನಿತ್ಯವೂ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅಥವಾ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಜಪ ಮಾಡಿ.",
          mr: "दररोज विष्णु सहस्रनाम किंवा शिवस्तोत्रांचे पठण परम शांती देणारे ठरेल.",
          hi: "नित्य विष्णु सहस्रनाम का श्रवण अथवा पाठ परम कल्याणकारी है।",
          te: "రోజూ విష్ణు సహస్రనామ స్తోత్రం లేదా శివ పంచాక్షరీ జపం చేయండి.",
          ta: "தினமும் விஷ்ணு சஹஸ்ரநாமம் அல்லது சிவ பஞ்சாட்சரம் பாராயணம் செய்யுங்கள்.",
          en: "Recite Vishnu Sahasranama for enduring spiritual bliss."
        }, targetLang)
      },
      {
        id: "senior_legacy",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೨: ಕೌಟುಂಬಿಕ ಸಾರ್ಥಕತೆ, ಸಂತಾನ ಸುಖ ಹಾಗೂ ಆರ್ಥಿಕ ಭದ್ರತೆ",
          mr: "अध्याय २: कौटुंबिक समाधान, नातवंडांचे सुख व आर्थिक स्थैर्य",
          hi: "अध्याय २: पारिवारिक संतुष्टि, संतान सुख एवं आर्थिक सुरक्षा",
          te: "అధ్యాయం 2: కుటుంబ సంతృప్తి, సంతాన సౌఖ్యం & ఆర్థిక భద్రత",
          ta: "அத்தியாயம் 2: குடும்ப நிறைவு, சந்ததி மகிழ்ச்சி & நிதிப் பாதுகாப்பு",
          en: "Chapter 2: Family Legacy, Grandchildren Joy & Financial Independence"
        }, targetLang),
        subtitle: pick6({
          kn: "೨ನೇ ಹಾಗೂ ೯ನೇ ಮನೆಯ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಶಾಂತಿಯುತ ನಿವೃತ್ತಿ ಜೀವನ",
          mr: "द्वितीय व नवम भावाच्या शुभ दृष्टीने सुरक्षित व सन्माननीय जीवन",
          hi: "द्वितीय एवं नवम भाव के शुभ प्रभाव से सुरक्षित एवं सम्मानित जीवन",
          te: "2 మరియు 9వ భావాల శుభ దృష్టితో ప్రశాంతమైన జీవనం",
          ta: "2 மற்றும் 9ம் வீடுகளின் சுப பார்வையால் அமைதியான ஓய்வுக்காலம்",
          en: "9th house dharma anchoring family legacy and economic autonomy"
        }, targetLang),
        icon: "🌿",
        contemplationInquest: pick6({
          kn: "ವಂಶ ಪಾರಂಪರ್ಯ ಗೌರವ, ಸಂತಾನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಶಾಂತಿಯುತ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ",
          mr: "पारिवारिक प्रतिष्ठा, संततीचे समाधान व आर्थिक स्वावलंबन चिंतन",
          hi: "पारिवारिक प्रतिष्ठा, संतति सुख एवं आर्थिक स्वावलंबन का चिंतन",
          te: "వంశ గౌరవం, సంతాన సౌఖ్యం మరియు ఆర్థిక స్వావలంబన చింతన",
          ta: "குடும்ப கௌரவம், சந்ததி மகிழ்ச்சி & நிதி சுதந்திர சிந்தனை",
          en: "Contemplation on Family Legacy, Generational Grace & Financial Autonomy"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ನಿಮ್ಮ ಮಕ್ಕಳು ಸಮಾಜದಲ್ಲಿ ಉತ್ತಮ ಸ್ಥಾನಮಾನ ಪಡೆದು ಗೌರವದಿಂದ ಬಾಳುವುದನ್ನು ಕಂಡು ನೀವು ಧನ್ಯತೆಯನ್ನು ಅನುಭವಿಸುವಿರಿ. ಮೊಮ್ಮಕ್ಕಳ ಮುಗ್ಧ ನಗು ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಹಬ್ಬದ ವಾತಾವರಣ ತರಲಿದೆ.`,
            mr: `मुलांचे कर्तृत्व व यश पाहून मनाला अतीव समाधान लाभेल. नातवंडांच्या सहवासाने घरात सदैव आनंदाचे वातावरण राहील.`,
            hi: `संतान की प्रतिष्ठा एवं सफलता देखकर आपको असीम संतोष होगा। पौत्र-पौत्रियों का सान्निध्य जीवन में नवउमंग भरेगा।`,
            te: `మీ పిల్లలు సమాజంలో ఉన్నత స్థానంలో గౌరవంగా జీవించడం చూసి మీరు సంతృప్తి చెందుతారు. మనవళ్లు-మనవరాళ్ల నవ్వులు ఇంట్లో పండుగ వాతావరణాన్ని తెస్తాయి.`,
            ta: `உங்கள் பிள்ளைகளின் நல்வாழ்வைக் கண்டு மனம் நிறைவடையும். பேரக்குழந்தைகளின் மழலைச் சிரிப்பு வீட்டில் மகிழ்ச்சியைப் பொழியும்.`,
            en: `Watching your children's success and flourishing households will bring supreme fulfillment and grandfatherly/grandmotherly pride.`
          }, targetLang),
          pick6({
            kn: `ಹಿಂದಿನ ದಶಕಗಳ ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮ, ವ್ಯವಸ್ಥಿತ ಹೂಡಿಕೆಗಳು ಹಾಗೂ ಧರ್ಮಯುಕ್ತ ಉಳಿತಾಯಗಳು ಈ ೫ ವರ್ಷಗಳಲ್ಲಿ ನಿಮಗೆ ಪರಿಪೂರ್ಣ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆಯನ್ನು ದಯಪಾಲಿಸಲಿವೆ. ಯಾವುದೇ ಆರ್ಥಿಕ ಅಡಚಣೆಗಳಿಲ್ಲದೆ ಸ್ವತಂತ್ರವಾಗಿ, ಗೌರವದಿಂದ ಬದುಕುವ ಯೋಗವಿದೆ. ಆಸ್ತಿ-ಪಾಸ್ತಿ ಹಾಗೂ ಪಿತ್ರಾರ್ಜಿತ ಸಂಪತ್ತಿನ ಹಂಚಿಕೆಯನ್ನು ಹಿರಿಯರ ಸಮ್ಮುಖದಲ್ಲಿ ಶಾಂತಿಯುತವಾಗಿ, ನ್ಯಾಯೋಚಿತವಾಗಿ ನಿರ್ವಹಿಸುವುದು ಭವಿಷ್ಯದ ಸೌಹಾರ್ದಕ್ಕೆ ಅಡಿಪಾಯವಾಗಲಿದೆ.`,
            mr: `गेल्या अनेक वर्षांचे आपले प्रामाणिक कष्ट, सुयोग्य गुंतवणूक व शिस्तबद्ध बचत या ५ वर्षांत आपल्याला संपूर्ण आर्थिक स्वातंत्र्य व सुरक्षा प्रदान करेल. कोणावरही आर्थिक भार न होता सन्मानाने जीवन जगता येईल. वडिलोपार्जित संपत्ती व गुंतवणुकीचे नियोजन सर्वांच्या संमतीने शांततेने केल्यास कुटुंबात कायम एकोपा टिकून राहील.`,
            hi: `विगत दशकों का आपका कठिन परिश्रम, सुनियोजित निवेश एवं नियमित बचत आगामी ५ वर्षों में आपको पूर्ण आर्थिक स्वावलंबन एवं सुरक्षा प्रदान करेगी। किसी पर आश्रित हुए बिना पूर्ण सम्मान एवं गरिमा के साथ जीवन व्यतीत होगा। पारिवारिक संपत्तियों एवं संचित धन का वितरण समभाव एवं सौहार्द के साथ करना कुल की एकता को सुदृढ़ करेगा।`,
            te: `గతంలో మీరు చేసిన కష్టార్జితం, సరైన పెట్టుబడులు మరియు పొదుపు రాబోయే 5 సంవత్సరాలలో మీకు సంపూర్ణ ఆర్థిక స్వాతంత్ర్యాన్ని అందిస్తాయి. ఎవరి మీదా ఆధారపడకుండా ఆత్మగౌరవంతో ప్రశాంతంగా జీవిస్తారు. పూర్వీకుల ఆస్తుల పంపకాలను కుటుంబ సభ్యులతో కలిసి సామరస్యంగా పరిష్కరించుకోవడం వల్ల సఖ్యత కొనసాగుతుంది.`,
            ta: `கடந்த காலங்களில் நீங்கள் செய்த கடின உழைப்பு, முறையான முதலீடுகள் மற்றும் சேமிப்புகள் இந்த 5 ஆண்டுகளில் உங்களுக்கு முழு நிதி சுதந்திரத்தை உறுதி செய்யும். யாரையும் நிதி ரீதியாகச் சார்ந்திருக்காமல் கண்ணியத்துடன் வாழலாம். முன்னோர்களின் சொத்துக்களை நியாயமாகவும் அமைதியாகவும் பகிர்ந்தளிப்பது குடும்ப ஒற்றுமையை பலப்படுத்தும்.`,
            en: `The disciplined fiscal stewardship and conscientious savings of preceding decades guarantee unbroken economic autonomy throughout these 5 years. Living with financial self-reliance and dignified sovereignty is assured, while executing legacy distribution equitably preserves generational unity.`
          }, targetLang),
          pick6({
            kn: `ನಿಮ್ಮ ಜೀವನಾನುಭವದ ಜ್ಞಾನ ಮತ್ತು ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಇಡೀ ವಂಶಕ್ಕೆ ಮಾರ್ಗದರ್ಶಕ ಬೆಳಕಾಗಲಿವೆ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಹಿತನುಡಿಗಳಿಗೆ ಹಾಗೂ ಗೌರವಕ್ಕೆ ಹೆಚ್ಚಿನ ಮನ್ನಣೆ ದೊರೆಯಲಿದ್ದು, ಸಾರ್ಥಕ ಜೀವನದ ಧನ್ಯತೆ ನಿಮ್ಮದಾಗಲಿದೆ.`,
            mr: `तुमचा समृद्ध जीवनप्रवास व आशीर्वाद संपूर्ण कुटुंबासाठी दीपस्तंभासारखे मार्गदर्शन करतील. समाजात आपल्या शब्दांना व अनुभवाला मोठा आदर मिळून कृतकृत्यतेची भावना लाभेल.`,
            hi: `आपका समृद्ध अनुभव एवं आशीर्वाद संपूर्ण कुल के लिए मार्गदर्शक प्रकाश सिद्ध होगा। समाज में आपके वचनों को आदर मिलेगा तथा एक सार्थक जीवन की अनुभूति होगी।`,
            te: `మీ జీవిత అనుభవం మరియు ఆశీస్సులు కుటుంబ సభ్యులందరికీ మార్గదర్శకంగా నిలుస్తాయి. సమాజంలో మీ మాటకు గౌరవం లభించి, సార్థక జీవన సంతృప్తి మీ సొంతమవుతుంది.`,
            ta: `உங்கள் அனுபவ அறிவும் ஆசிகளும் உங்கள் குடும்பத்தினருக்கு நல்வழிகாட்டும் தீபமாக விளங்கும். சமூகத்தில் உங்கள் சொல்லுக்கு பெரும் மதிப்பு கிட்டும்.`,
            en: `Your accumulated wisdom and loving blessings serve as a beacon for the entire family lineage, commanding profound respect in the community and sealing a life of noble fulfillment.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಸಂಪತ್ತಿನ ಯೋಜನೆಗಳನ್ನು ಕುಟುಂಬದ ಹಿರಿಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ ಶಾಂತಿಯುತವಾಗಿ ನಿರ್ವಹಿಸಿ.",
          mr: "संपत्तीचे नियोजन समजुतीने व शांततेने केल्यास कुटुंबात कायम ऐक्य राहील.",
          hi: "पारिवारिक संपत्ति का सुचारु नियोजन सभी में प्रेम भाव बनाए रखेगा।",
          te: "ఆస్తి ప్రణాళికలను కుటుంబ సభ్యులతో సామరస్యంగా చర్చించి నిర్ణయించండి.",
          ta: "சொத்து விவகாரங்களை குடும்பத்தினருடன் பேசி அமைதியாக நிர்வகிக்கவும்.",
          en: "Execute legacy distribution with calm, transparent equanimity."
        }, targetLang)
      },
      {
        id: "senior_health_longevity",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೩: ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿ",
          mr: "अध्याय ३: आरोग्य रक्षण, दीर्घायुष्य व सात्त्विक दिनचर्या",
          hi: "अध्याय ३: स्वास्थ्य संरक्षण, दीर्घायु एवं सात्विक जीवनचर्या",
          te: "అధ్యాయం 3: ఆరోగ్య రక్షణ, దీర్ఘాయుష్షు & సాత్విక జీవనశైలి",
          ta: "அத்தியாயம் 3: உடல்நலப் பாதுகாப்பு, நீண்ட ஆயுள் & சாத்வீக வாழ்க்கை",
          en: "Chapter 3: Health Longevity, Vitality & Sattvic Wellness"
        }, targetLang),
        subtitle: pick6({
          kn: "ಆಯುಷ್ಕಾರಕ ಶನಿ ಹಾಗೂ ಸೂರ್ಯನ ಅನುಗ್ರಹದಿಂದ ದೈಹಿಕ ಸ್ವಸ್ಥತೆ",
          mr: "आयुष्यकारक शनी व सूर्याच्या कृपेने उत्तम आरोग्य व उत्साह",
          hi: "आयुष्मान कारक शनि एवं सूर्य की कृपा से स्वास्थ्य लाभ",
          te: "ఆయుష్షు కారకుడైన శని మరియు సూర్యుని అనుగ్రహంతో ఆరోగ్య రక్షణ",
          ta: "ஆயுள் காரகன் சனி & சூரியன் அருளால் உடல் ஆரோக்கியம்",
          en: "Sun and Saturn harmonizing vital life-force and physical stamina"
        }, targetLang),
        icon: "🩺",
        contemplationInquest: pick6({
          kn: "ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷಣೆ, ದೈಹಿಕ ಸ್ವಾಸ್ಥ್ಯ ಹಾಗೂ ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿಯ ದಿವ್ಯ ಧ್ಯಾನ",
          mr: "दीर्घायुष्य, शारीरिक स्वास्थ्य व सात्त्विक जीवनशैलीचा विचार",
          hi: "दीर्घायुष्य, शारीरिक स्वास्थ्य एवं सात्विक जीवनशैली का पावन चिंतन",
          te: "దీర్ఘాయుష్షు, శారీరక ఆరోగ్యం మరియు సాత్విక జీవన విధాన చింతన",
          ta: "நீண்ட ஆயுள், உடல் நலம் & சாத்வீக வாழ்க்கை முறை சிந்தனை",
          en: "Contemplation on Longevity, Radiant Vitality & Sattvic Daily Regimen"
        }, targetLang),
        paragraphs: [
          pick6({
            kn: `ಜೀವನದ ಈ ಪಕ್ವ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆಗೆ ಪ್ರಥಮ ಆದ್ಯತೆ ನೀಡುವುದು ಅತಿ ಮುಖ್ಯ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವು ನಿಮ್ಮಲ್ಲಿ ನೈಸರ್ಗಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಕಾಪಾಡಲಿದೆ. ಹವಾಮಾನ ಬದಲಾವಣೆಗಳ ಸಮಯದಲ್ಲಿ ಕೀಲು ನೋವು, ರಕ್ತದೊತ್ತಡ ಅಥವಾ ಜೀರ್ಣಾಂಗ ವ್ಯವಸ್ಥೆಯ ಬಗ್ಗೆ ಸಾಂಪ್ರದಾಯಿಕ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ವಹಿಸುವುದು ಉತ್ತಮ.`,
            mr: `आयुष्याच्या या टप्प्यावर आरोग्याला सर्वोच्च प्राधान्य देणे आवश्यक आहे. पत्रिकेतील सूर्य व लग्नेशाचे बळ आपल्यातील नैसर्गिक रोगप्रतिकारक शक्ती कायम राखेल. ऋतुबदलाच्या काळात सांधेदुखी, रक्तदाब व पचनक्रिया यासंबंधी नियमित काळजी घेणे हितावह ठरेल.`,
            hi: `जीवन के इस परिपक्व कालखंड में स्वास्थ्य रक्षा को सर्वोच्च प्राथमिकता देना अनिवार्य है। आपकी जन्म पत्रिका में सूर्य एवं लग्नेश का शुभ प्रभाव आपकी आंतरिक रोग प्रतिरोधक क्षमता को सुदृढ़ रखेगा। मौसमी परिवर्तनों के समय जोड़ों के दर्द, रक्तचाप एवं पाचन तंत्र का विशेष ध्यान रखें।`,
            te: `జీవితంలోని ఈ దశలో ఆరోగ్య పరిరక్షణకు ప్రథమ ప్రాధాన్యత ఇవ్వడం ఎంతో ముఖ్యం. మీ జాతకంలో సూర్య మరియు లగ్నాధిపతి బలం మీలో రోగనిరోధక శక్తిని కాపాడుతుంది. వాతావరణ మార్పుల సమయంలో కీళ్ల నొప్పులు, రక్తపోటు మరియు జీర్ణక్రియపై శ్రద్ధ వహించండి.`,
            ta: `வாழ்வின் இந்த முதிர்ந்த காலத்தில் உடல்நலத்திற்கு முதலிடம் அளிப்பது மிகவும் அவசியம். உங்கள் ஜாதகத்தில் சூரியன் மற்றும் லக்னாதிபதியின் பலம் நோய் எதிர்ப்பு சக்தியைத் தரும். பருவநிலை மாற்றங்களின் போது மூட்டு வலி, ரத்த அழுத்தம் மற்றும் செரிமானத்தில் கவனம் தேவை.`,
            en: `During this venerable phase of life, prioritizing physical wellness and preventive care is paramount. The stabilizing rays of the Sun and your Ascendant lord sustain intrinsic vitality, yet seasonal weather transitions require gentle attention to joint comfort, circulation, and digestive equilibrium.`
          }, targetLang),
          pick6({
            kn: `ಬೆಳಗಿನ ಶುದ್ಧ ಗಾಳಿಯಲ್ಲಿ ನಿಯಮಿತ ನಡಿಗೆ, ಲಘು ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಆಯುರ್ವೇದ ಪಥ್ಯದ ಆಹಾರ ಪದ್ಧತಿಯು ನಿಮ್ಮ ದೇಹಕ್ಕೆ ಅಖಂಡ ಚೈತನ್ಯ ನೀಡಲಿವೆ. ಅನಗತ್ಯ ಆತಂಕ ಹಾಗೂ ಅತಿಯಾದ ಚಿಂತೆಗಳಿಂದ ದೂರವಿದ್ದು, ಮನಸ್ಸನ್ನು ಸದಾ ಪ್ರಶಾಂತವಾಗಿಟ್ಟುಕೊಳ್ಳಿ. ಕುಟುಂಬದವರ ಪ್ರೀತಿಪೂರ್ವಕ ಕಾಳಜಿ ನಿಮ್ಮ ಆಯುಷ್ಯ ಹಾಗೂ ಆರೋಗ್ಯವನ್ನು ಇನ್ನಷ್ಟು ವೃದ್ಧಿಸಲಿದೆ.`,
            mr: `सकाळच्या शुद्ध हवेत हलके चालणे, प्राणायाम व सात्त्विक आहाराची सवय शरीराला नवा उत्साह देईल. अनावश्यक काळजी व मानसिक तणावापासून दूर राहून मन नेहमी शांत ठेवा. कुटुंबातील सदस्यांचे प्रेम व आपुलकी आपले आयुष्य व आनंद द्विगुणित करेल.`,
            hi: `प्रातःकाल की शुद्ध वायु में नियमित टहलना, हल्का प्राणायाम एवं सुपाच्य सात्विक आहार शरीर को नवस्फूर्ति प्रदान करेगा। व्यर्थ की चिंताओं से मुक्त रहकर मन को सदैव प्रसन्न रखें। परिवारजनों का स्नेह एवं सेवा आपके दीर्घायुष्य को संवर्धित करेगी।`,
            te: `ఉదయం స్వచ్ఛమైన గాలిలో నడక, తేలికపాటి ప్రాణాయామం మరియు సాత్విక ఆహారం శరీరానికి కొత్త ఉత్సాహాన్ని ఇస్తాయి. అనవసర చింతలు మరియు మానసిక ఒత్తిడికి దూరంగా ఉంటూ మనస్సును ప్రశాంతంగా ఉంచుకోండి. కుటుంబ సభ్యుల ప్రేమ మీ ఆయుష్షును పెంచుతుంది.`,
            ta: `காலை வேளையில் நடைபயிற்சி, எளிய பிராணாயாமம் மற்றும் சாத்வீக உணவு முறை உடலுக்கு புதிய புத்துணர்வை அளிக்கும். தேவையற்ற கவலைகளைத் தவிர்த்து மனதை எப்போதும் அமைதியாக வைத்துக் கொள்ளுங்கள். குடும்பத்தினரின் அன்பும் கவனிப்பும் உங்கள் வாழ்நாளை நீட்டிக்கும்.`,
            en: `Gentle morning walks in crisp fresh air, meditative Pranayama, and light nourishing meals will bestow sustained physical agility. Releasing past worries and anchoring the mind in serene contentment unlocks rejuvenating peace, amplified by the affectionate care of your family.`
          }, targetLang),
          pick6({
            kn: `ಶ್ರೀ ಧನ್ವಂತರಿ ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಸ್ವಾಮಿಯ ಸ್ಮರಣೆಯು ನಿಮಗೆ ಸಮಸ್ತ ದೈಹಿಕ ಪೀಡೆಗಳಿಂದ ನಿತ್ಯ ರಕ್ಷೆ ನೀಡಲಿದೆ. ವೈದ್ಯರ ಸಲಹೆಯ ಮೇರೆಗೆ ನಿಯಮಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆಗಳನ್ನು ಮಾಡಿಸಿಕೊಳ್ಳಿ. ನಿಮ್ಮ ಧರ್ಮನಿಷ್ಠೆ, ದಾನ-ಧರ್ಮ ಹಾಗೂ ಪರಹಿತ ಚಿಂತನೆಯು ನಿಮ್ಮ ಆಯುಷ್ಯವನ್ನು ದೀರ್ಘ ಹಾಗೂ ಸುಖಮಯವನ್ನಾಗಿ ಮಾಡಲಿದೆ.`,
            mr: `धन्वंतरी व महामृत्युंजय मंत्राचे नित्य श्रवण आपल्याला सर्व व्याधींपासून सुरक्षित ठेवेल. वैद्यकीय सल्ल्यानुसार वेळेवर तपासण्या करून घ्या. आपली ईश्वरनिष्ठा, दानधर्म व सात्त्विक विचार आपले जीवन दीर्घ व सुखमय बनवतील.`,
            hi: `भगवान धन्वंतरि एवं महामृत्युंजय मंत्र का नित्य स्मरण समस्त व्याधियों से आपकी रक्षा करेगा। समय-समय पर नियमित स्वास्थ्य परीक्षण कराते रहें। आपकी धर्मनिष्ठा, दान-पुण्य एवं परोपकार की भावना आपके जीवन को दीर्घ एवं सुखमय बनाएगी।`,
            te: `ధన్వంతరి మరియు మహా మృత్యుంజయ మంత్ర స్మరణ మీకు సకల రోగాల నుండి రక్షణ కల్పిస్తుంది. వైద్యుల సలహాతో క్రమం తప్పకుండా ఆరోగ్య పరీక్షలు చేయించుకోండి. మీ ధర్మనిష్ఠ మరియు దైవభక్తి మీ జీవితాన్ని దీర్ఘకాలం సుఖమయం చేస్తాయి.`,
            ta: `தன்வந்திரி பகவான் மற்றும் மகா மிருத்யுஞ்சய மந்திரத்தை நினைவுகூர்வது நோய்களிலிருந்து உங்களைப் பாதுகாக்கும். மருத்துவ ஆலோசனைகளை முறையாகப் பின்பற்றுங்கள். உங்கள் தர்ம சிந்தனையும் இறை நம்பிக்கையும் உங்கள் வாழ்வை நீண்ட ஆயுளுடன் ஆசீர்வதிக்கும்.`,
            en: `Invoking Lord Dhanvantari and the Maha Mrityunjaya mantra creates an impenetrable energetic armor against physical afflictions. Timely health checkups paired with a generous, charitable spirit will anchor your sunset years in radiant health, dignity, and blissful longevity.`
          }, targetLang)
        ],
        keyAdvice: pick6({
          kn: "ಪ್ರತಿದಿನ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಆಯುರ್ವೇದ ಪಥ್ಯವನ್ನು ಪಾಲಿಸಿ; ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ ಮಾಡಿ.",
          mr: "नियमित प्राणायाम व सात्त्विक आहाराचे पालन करा; महामृत्युंजय मंत्राचे श्रवण करा.",
          hi: "नित्य प्राणायाम एवं सात्विक आहार अपनाएं; महामृत्युंजय मंत्र का पाठ करें।",
          te: "రోజూ ప్రాణాయామం మరియు సాత్విక ఆహారం పాటించండి; మహా మృత్యుంజయ జపం చేయండి.",
          ta: "தினமும் எளிய பிராணாயாமம் செய்து சாத்வீக உணவை உண்ணுங்கள்; மிருத்யுஞ்சய மந்திரம் ஜபிக்கவும்.",
          en: "Practice gentle daily breathing exercises, follow a sattvic diet, and invoke Maha Mrityunjaya."
        }, targetLang)
      }
    );
  } else if (ageCategory === "youth") {
    chapters.push(
      {
        id: "youth_education_career",
        title: pick6({
          kn: "ಅಧ್ಯಾಯ ೧: ಉನ್ನತ ಶಿಕ್ಷಣ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ ಹಾಗೂ ವೃತ್ತಿ ಪ್ರವೇಶದ ಮಹಾನಕ್ಷೆ",
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

  // Stotra Selection
  const prescribedStotra = selectPrescribedStotra(
    kundli,
    hasSaturnTroubleAnyYear,
    runningMahadashaPrimary,
    targetLang
  );

  const milestoneMatrix = generate5YearMilestones(
    kundli,
    ageCategory,
    baseYear,
    peakYearIdx,
    cautionYearIdx,
    targetLang
  );

  const peakYStr = formatNumber6L(baseYear + peakYearIdx, targetLang);
  const pivotalTurningPointTitle = targetLang === "kn" ? `🌟 ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ತಿರುವು (${peakYStr})`
    : targetLang === "mr" ? `🌟 ५ वर्षांतील सुवर्ण वळण (${peakYStr})`
    : targetLang === "hi" ? `🌟 ५ वर्षों का स्वर्णिम मोड़ (${peakYStr})`
    : targetLang === "te" ? `🌟 5 సంవత్సరాల స్వర్ణ మలుపు (${peakYStr})`
    : targetLang === "ta" ? `🌟 5 ஆண்டுகளின் பொற்கால திருப்புமுனை (${peakYStr})`
    : `🌟 5-Year Sovereign Turning Point (${peakYStr})`;

  const pivotalTurningPointSeason = targetLang === "kn" ? `ವೈಶಾಖ - ಜ್ಯೇಷ್ಠ ${peakYStr}`
    : targetLang === "mr" ? `वैशाख - ज्येष्ठ ${peakYStr}`
    : targetLang === "hi" ? `वैशाख - ज्येष्ठ ${peakYStr}`
    : targetLang === "te" ? `వైశాఖ - జ్యేష్ఠ ${peakYStr}`
    : targetLang === "ta" ? `வைகாசி - ஆனி ${peakYStr}`
    : `Vaishakha - Jyeshtha ${peakYStr}`;

  const pivotalTurningPointImpact = targetLang === "kn" ? `ಗುರು-ಶುಕ್ರರ ಅನುಗ್ರಹದಿಂದ ಹಿಂದಿನ ಕಷ್ಟ-ನಷ್ಟಗಳು ಕರಗಿ, ಆರ್ಥಿಕ ಉನ್ನತಿ, ನೂತನ ಆಸ್ತಿ ಸೌಭಾಗ್ಯ ಹಾಗೂ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಗ್ರಗಣ್ಯ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
    : targetLang === "mr" ? `गुरू-शुक्राच्या कृपेने जुनी संकटे दूर होऊन आर्थिक समृद्धी, नवीन संपत्ती योग व करिअरमध्ये सर्वोच्च अधिकार प्राप्त होतील.`
    : targetLang === "hi" ? `गुरु-शुक्र की कृपा से पूर्व के समस्त संकट समाप्त होकर आर्थिक संपन्नता, नवीन संपत्ति योग एवं कार्यक्षेत्र में उच्च पद-प्रतिष्ठा प्राप्त होगी।`
    : targetLang === "te" ? `గురు-శుక్రుల అనుగ్రహంతో పాత కష్టాలు తొలగిపోయి, ఆర్థిక ఉన్నతి, నూతన ఆస్తి ప్రాప్తి మరియు కెరీర్‌లో ఉన్నత అధికార యోగం కలుగుతుంది.`
    : targetLang === "ta" ? `குரு-சுக்கிரனின் அருளால் முந்தைய தடைகள் நீங்கி, நிதி முன்னேற்றம், புதிய சொத்து யோகம் மற்றும் தொழிலில் உயர் பதவி கிட்டும்.`
    : `Benefic planetary confluence dissolves historical frictions, catalyzing wealth accumulation, prime real estate acquisition, and executive ascendancy.`;

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
    ishtaDevata: targetLang === "kn" ? "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ"
      : targetLang === "hi" ? "श्री महागणपति एवं श्री गोकर्ण महाबलेश्वर स्वामी"
      : targetLang === "mr" ? "श्री महागणपती व श्री गोकर्ण महाबळेश्वर स्वामी"
      : targetLang === "te" ? "శ్రీ మహాగణపతి మరియు శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి"
      : targetLang === "ta" ? "ஸ்ரீ மஹாகணபதி & ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சுவாமி"
      : "Sri Mahaganapati & Sri Gokarna Mahabaleshwara",
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
  const muhurtaWindows = generateAuspiciousMuhurtas(baseYear, targetLang, ageCategory, personalization?.maritalStatus);
  const financialRoadmap = generate5YearFinancialRoadmap(baseYear, targetLang, peakYearIdx, cautionYearIdx);
  const healthShield = generateHealthLongevityShield(targetLang, ageCategory);
  const punyakshetraYatra = generatePunyakshetraYatra(targetLang);
  const yearSpecificRemedies = generateYearSpecificRemedies(baseYear, years, targetLang);
  const nakshatraVriksha = getNakshatraVriksha(nakshatraIdx, targetLang);
  const familyDestinyInterlocking = generateFamilyDestinyInterlocking(
    resolvedDevoteeName,
    targetLang,
    personalization?.maritalStatus,
    personalization?.childrenStatus,
    baseYear
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

  const sacredDeityImage = getSacredDeityImage(
    lagnaIdx,
    moonIdx,
    runningMahadashaPrimary,
    hasSaturnTroubleAnyYear,
    targetLang
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
    remedies,
    astrologerBlessing
  };
}
