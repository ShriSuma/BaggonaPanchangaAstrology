/**
 * 🎓 BAGGONA KUNDLI READING GURUKULA ENGINE (ಕುಂಡಲಿ ವಾಚನ ಗುರು / ಜ್ಯೋತಿಷ್ಯ ಶಿಕ್ಷಣ ದರ್ಶನ)
 *
 * Deterministic, 100% offline educational engine for priests, astrologers, and learners.
 * Teaches systematically from scratch to advanced on the native's active chart:
 * 1. Where to look first (ದೃಷ್ಟಿ ಕೇಂದ್ರ / 📍 ಎಲ್ಲಿ ನೋಡಬೇಕು?)
 * 2. Technical Shastric rules & dignity (ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ವಿವರಣೆ / 📐 ಗ್ರಹ ಮೈತ್ರಿ & ಬಲಾಬಲ)
 * 3. Why this result occurs (ಕಾರಣ-ಪರಿಣಾಮ ತರ್ಕ / 💡 ಏಕೆ ಈ ಫಲಿತ?)
 * 4. What exact words to tell the client (ದೈವಜ್ಞ ವಾಕ್ಯ / 🗣️ ಭಕ್ತರಿಗೆ ಮುಖತಃ ಏನು ಹೇಳಬೇಕು?)
 * 5. Astrological remedies & practical cautions (🪔 ದೈವಿಕ ಪರಿಹಾರ & ಎಚ್ಚರಿಕೆ)
 *
 * EXPANDED ADVANCED MODULES:
 * 6. Interactive Q&A 3-Pillar Synthesizer (ಜಾತಕರ ಪ್ರಶ್ನೆಗಳಿಗೆ ಜನ್ಮ ಕುಂಡಲಿ + ದಶಾ-ಭುಕ್ತಿ + ಗೋಚಾರ ತ್ರಿವೇಣಿ ಸಂಯೋಗ)
 * 7. Dosha Shodhana (ದೋಷ ಶೋಧನೆ: ಕುಜ, ಪಿತೃ, ಕಾಳಸರ್ಪ, ಕೆಮದ್ರುಮ, ಗುರು ಚಂಡಾಲ, ಮಾಂದಿ)
 * 8. Gandanthara & Hazard Windows (ಗಂಡಾಂತರಗಳು & ನಿರ್ಣೀತ ಸುರಕ್ಷಿತ ವಯೋಮಿತಿ)
 * 9. Subconscious Fears & Phobias (ಅಂತರ್ಗತ ಮನೋಭಯಗಳು & ಭೀತಿ ಶೋಧನೆ)
 * 10. Inner Secrets & Hidden Drives (ಆಂತರಿಕ ರಹಸ್ಯಗಳು & ಆಳವಾದ ಮನೋಧರ್ಮ)
 * 11. Temperament Diagnostics (ಸ್ವಭಾವ ಪರೀಕ್ಷೆ: ಕ್ರೂರಿಯೋ ಅಥವಾ ಸೌಮ್ಯನೋ?)
 */

import {
  PlanetName,
  type KundliOutput,
  type PlanetPosition,
  type Rashi,
  RASHIS
} from "./AstroTypes";
import { signLord, naturalRelation, rashiIndexInHouse } from "./KundliInsightsEngine";
import { findBhuktiAtAge, generateDashaTimeline } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { PLANET_NAMES_5LANG, RASHI_NAMES_5LANG } from "./ComprehensiveDoshaEngine";
import { siderealLongitudes } from "./EphemerisEngine";

// ---------------------------------------------------------
// TYPES & INTERFACES
// ---------------------------------------------------------

export interface GurukulaStep {
  stepIndex: number; // 1 to 11
  stepCode: string;
  titleKn: string;
  titleEn: string;
  stageBadgeKn: string;
  stageBadgeEn: string;
  focusHouses: number[];
  focusRashis: number[];
  focusPlanets: PlanetName[];

  // 1. Where to look first (📍 ಎಲ್ಲಿ ನೋಡಬೇಕು?)
  whereToLookKn: {
    primaryHouseKn: string;
    rashiAndLordKn: string;
    occupyingGrahasKn: string;
    aspectingGrahasKn: string;
    observationTipKn: string;
  };
  whereToLookEn: {
    primaryHouseEn: string;
    rashiAndLordEn: string;
    occupyingGrahasEn: string;
    aspectingGrahasEn: string;
    observationTipEn: string;
  };

  // 2. Technical & Shastric Mechanics (📐 ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಸೂತ್ರ & ಗ್ರಹ ಮೈತ್ರಿ)
  technicalAnalysisKn: {
    shastricRuleKn: string;
    dignityKn: string; // ಉಚ್ಚ / ನೀಚ / ಸ್ವಕ್ಷೇತ್ರ / ಮಿತ್ರ / ಶತ್ರು / ಸಮ
    grahaRelationsKn: string;
    specialConditionKn?: string;
    bulletPointsKn: string[];
  };
  technicalAnalysisEn: {
    shastricRuleEn: string;
    dignityEn: string;
    grahaRelationsEn: string;
    specialConditionEn?: string;
    bulletPointsEn: string[];
  };

  // 3. Why this Result (💡 ಏಕೆ ಈ ಫಲಿತ? / ಕಾರಣ-ಪರಿಣಾಮ ತರ್ಕ)
  whyThisResultKn: {
    astrologicalLogicKn: string;
    lifeDomainKn: string;
    keyInfluencesKn: string[];
  };
  whyThisResultEn: {
    astrologicalLogicEn: string;
    lifeDomainEn: string;
    keyInfluencesEn: string[];
  };

  // 4. What exact words to tell the devotee/client (🗣️ ಭಕ್ತರಿಗೆ ಮುಖತಃ ಏನು ಹೇಳಬೇಕು?)
  spokenConsultationScriptKn: string;
  spokenConsultationScriptEn: string;

  // 5. Astrological Remedy or Caution (🪔 ದೈವಿಕ ಸಲಹೆ & ಪರಿಹಾರ)
  practicalGuidanceKn: string;
  practicalGuidanceEn: string;
}

export interface PlanetaryDignityDetail {
  planet: PlanetName;
  planetKn: string;
  planetEn: string;
  house: number;
  rashi: Rashi;
  rashiKn: string;
  rashiEn: string;
  dispositor: PlanetName;
  dispositorKn: string;
  dignityType: "uccha" | "neecha" | "swakshetra" | "moolatrikona" | "mitra" | "shatru" | "sama";
  dignityLabelKn: string;
  dignityLabelEn: string;
  isRetrograde: boolean;
  isCombust: boolean;
  hasDigbala: boolean;
  aspectsCastingOnHouses: number[];
}

export interface LiveGocharaSnapshot {
  saturnRashiKn: string;
  saturnRashiEn: string;
  saturnHouseFromMoon: number;
  saturnHouseFromLagna: number;
  isSadeSati: boolean;
  sadeSatiPhaseKn?: string;
  isAshtamaShani: boolean;
  isKantakaShani: boolean;

  jupiterRashiKn: string;
  jupiterRashiEn: string;
  jupiterHouseFromMoon: number;
  jupiterHouseFromLagna: number;
  hasGuruBala: boolean;
  guruBalaSummaryKn: string;
  guruBalaSummaryEn: string;

  rahuRashiKn: string;
  ketuRashiKn: string;
  rahuHouseFromMoon: number;

  summaryKn: string;
  summaryEn: string;
}

export interface GurukulaQuestionAnswer {
  id: string;
  category: "career" | "business" | "marriage" | "friction" | "finance" | "property" | "health" | "progeny";
  categoryKn: string;
  categoryEn: string;
  icon: string;
  questionKn: string;
  questionEn: string;

  // 1. Where to look & why
  whereToLookKn: {
    primaryHousesKn: string;
    karakaPlanetsKn: string;
    targetHouseLordsKn: string;
    whyThisPlaceImportantKn: string;
  };
  whereToLookEn: {
    primaryHousesEn: string;
    karakaPlanetsEn: string;
    targetHouseLordsEn: string;
    whyThisPlaceImportantEn: string;
  };

  // 2. The Three Pillars
  pillar1KundliKn: {
    titleKn: string;
    analysisKn: string;
    scoreLabelKn: string;
  };
  pillar1KundliEn: {
    titleEn: string;
    analysisEn: string;
    scoreLabelEn: string;
  };

  pillar2DashaKn: {
    titleKn: string;
    analysisKn: string;
    activeTimingKn: string;
  };
  pillar2DashaEn: {
    titleEn: string;
    analysisEn: string;
    activeTimingEn: string;
  };

  pillar3GocharaKn: {
    titleKn: string;
    analysisKn: string;
    transitVerdictKn: string;
  };
  pillar3GocharaEn: {
    titleEn: string;
    analysisEn: string;
    transitVerdictEn: string;
  };

  // 3. Synthesis & How to Combine all three
  synthesisKn: {
    howToCombineKn: string;
    verdictKn: string;
    timingWindowKn: string;
  };
  synthesisEn: {
    howToCombineEn: string;
    verdictEn: string;
    timingWindowEn: string;
  };

  // 4. Consultation Spoken Script & Remedy
  spokenScriptKn: string;
  spokenScriptEn: string;
  remedyKn: string;
  remedyEn: string;
}

export interface GurukulaDeepDiagnostics {
  // 1. Doshas
  doshas: {
    id: string;
    nameKn: string;
    nameEn: string;
    isPresent: boolean;
    howToSpotKn: string;
    howToSpotEn: string;
    specificPlacementKn: string;
    specificPlacementEn: string;
    remedyKn: string;
    remedyEn: string;
  }[];

  // 2. Gandantharas
  gandantharas: {
    id: string;
    nameKn: string;
    nameEn: string;
    hazardTypeKn: string;
    hazardTypeEn: string;
    howToSpotKn: string;
    howToSpotEn: string;
    isDetected: boolean;
    safeAgeYears: number;
    isPastSafeAge: boolean;
    precautionKn: string;
    precautionEn: string;
    shantiKn: string;
    shantiEn: string;
  }[];

  // 3. Fears and Phobias
  fears: {
    id: string;
    fearNameKn: string;
    fearNameEn: string;
    astrologicalOriginKn: string;
    astrologicalOriginEn: string;
    isDetected: boolean;
    manifestationKn: string;
    manifestationEn: string;
    counselingTipKn: string;
    counselingTipEn: string;
  }[];

  // 4. Inner Secrets & Hidden Traits
  innerSecrets: {
    domainKn: string;
    domainEn: string;
    hiddenTraitKn: string;
    hiddenTraitEn: string;
    astrologicalWhyKn: string;
    astrologicalWhyEn: string;
  }[];

  // 5. Temperament: Cruel vs Gentle
  temperament: {
    disposition: "gentle" | "cruel_assertive" | "mixed";
    titleKn: string;
    titleEn: string;
    shastricRuleKn: string;
    shastricRuleEn: string;
    analysisKn: string;
    analysisEn: string;
    cruelScore: number;
    gentleScore: number;
    howToSpotKn: string;
    howToSpotEn: string;
    spokenAdviceKn: string;
    spokenAdviceEn: string;
  };
}

export interface PanchangaAngasDetail {
  tithi: {
    index: number;
    nameKn: string;
    nameEn: string;
    pakshaKn: string;
    pakshaEn: string;
    shriFactorKn: string;
    shriFactorEn: string;
    dagdhaRashisKn: string[];
    dagdhaRashisEn: string[];
    planetsInDagdha: {
      planetKn: string;
      planetEn: string;
      rashiKn: string;
      rashiEn: string;
      implicationKn: string;
      implicationEn: string;
    }[];
  };
  vaara: {
    weekdayKn: string;
    weekdayEn: string;
    lordKn: string;
    lordEn: string;
    vitalityKn: string;
    vitalityEn: string;
  };
  nakshatra: {
    index: number;
    nameKn: string;
    nameEn: string;
    pada: number;
    lordKn: string;
    lordEn: string;
    devataKn: string;
    devataEn: string;
    ganaKn: string;
    ganaEn: string;
    yoniKn: string;
    yoniEn: string;
    nadiKn: string;
    nadiEn: string;
    tatvaKn: string;
    tatvaEn: string;
    symbolKn: string;
    symbolEn: string;
    karmicMeaningKn: string;
    karmicMeaningEn: string;
    howNakshatraHelpsKn: string;
    howNakshatraHelpsEn: string;
  };
  yoga: {
    index: number;
    nameKn: string;
    nameEn: string;
    isAuspicious: boolean;
    natureKn: string;
    natureEn: string;
    healthImmunityKn: string;
    healthImmunityEn: string;
    remedyKn?: string;
    remedyEn?: string;
  };
  karana: {
    index: number;
    nameKn: string;
    nameEn: string;
    type: "chara" | "sthira";
    typeKn: string;
    typeEn: string;
    isVishtiBhadra: boolean;
    careerActionStaminaKn: string;
    careerActionStaminaEn: string;
    remedyKn?: string;
    remedyEn?: string;
  };
  navataraChakra: {
    taraIndex: number;
    taraNameKn: string;
    taraNameEn: string;
    significanceKn: string;
    significanceEn: string;
    quality: "benefic" | "malefic" | "neutral";
    nakshatras: {
      index: number;
      nameKn: string;
      nameEn: string;
      occupyingPlanetsKn: string[];
      occupyingPlanetsEn: string[];
    }[];
  }[];
  upagrahas: {
    id: string;
    nameKn: string;
    nameEn: string;
    category: "aprakasha" | "kalaja";
    longitude: number;
    rashiKn: string;
    rashiEn: string;
    house: number;
    nakshatraKn: string;
    nakshatraEn: string;
    pada: number;
    subtleImpactKn: string;
    subtleImpactEn: string;
    afflictedFactorKn?: string;
    afflictedFactorEn?: string;
  }[];
  pushkaraPlacements: {
    planetKn: string;
    planetEn: string;
    rashiKn: string;
    rashiEn: string;
    navamshaSignKn: string;
    navamshaSignEn: string;
    isPushkaraBhaga: boolean;
    blessingKn: string;
    blessingEn: string;
  }[];
}

export interface GurukulaMasterclassReport {
  nativeName: string;
  lagnaRashiKn: string;
  lagnaRashiEn: string;
  lagnaLordKn: string;
  lagnaLordEn: string;
  moonSignKn: string;
  moonSignEn: string;
  nakshatraKn: string;
  nakshatraEn: string;
  currentAgeYears?: number;
  currentDashaMahaKn?: string;
  currentDashaBhuktiKn?: string;
  totalSteps: number;
  dignityMatrix: PlanetaryDignityDetail[];
  steps: GurukulaStep[];
  gochara: LiveGocharaSnapshot;
  questions: GurukulaQuestionAnswer[];
  diagnostics: GurukulaDeepDiagnostics;
  panchangaAngas: PanchangaAngasDetail;
}

// ---------------------------------------------------------
// Helper Utilities for Dignity, Aspects, and House Mapping
// ---------------------------------------------------------

export const getPlanet = (kundli: KundliOutput, name: PlanetName): PlanetPosition | undefined =>
  kundli.planets.find((p) => p.name === name);

export const getPlanetKn = (name: PlanetName): string =>
  PLANET_NAMES_5LANG[name]?.kn || String(name);

export const getPlanetEn = (name: PlanetName): string =>
  PLANET_NAMES_5LANG[name]?.en || String(name);

export const getRashiKn = (rashi: Rashi): string =>
  RASHI_NAMES_5LANG[rashi.english]?.kn || rashi.sanskrit;

export const getRashiEn = (rashi: Rashi): string =>
  RASHI_NAMES_5LANG[rashi.english]?.en || rashi.english;

export const getHouseRashi = (lagnaRashiIdx: number, houseNum: number): Rashi => {
  const idx = rashiIndexInHouse(lagnaRashiIdx, houseNum);
  return RASHIS[idx]!;
};

export const getHouseLord = (lagnaRashiIdx: number, houseNum: number): PlanetName => {
  const rashiIdx = rashiIndexInHouse(lagnaRashiIdx, houseNum);
  return signLord(rashiIdx);
};

export const normalizeDeg = (deg: number): number => ((deg % 360) + 360) % 360;

export const getPlanetAbsoluteLongitude = (p?: { degree: number; rashi?: Rashi }): number => {
  if (!p) return 0;
  if (p.degree > 30) {
    return normalizeDeg(p.degree);
  }
  const rashiBase = (p.rashi?.index ?? 0) * 30;
  return normalizeDeg(rashiBase + p.degree);
};

export const getAscendantAbsoluteLongitude = (kundli: KundliOutput): number => {
  const asc = kundli.ascendant ?? 0;
  if (asc > 30) {
    return normalizeDeg(asc);
  }
  const rashiBase = (kundli.lagnaRashi?.index ?? 0) * 30;
  return normalizeDeg(rashiBase + asc);
};

export const getHouseOccupants = (kundli: KundliOutput, houseNum: number): PlanetPosition[] => {
  return kundli.planets.filter((p) => p.house === houseNum);
};

/**
 * Calculates which planets cast a full Parashari aspect (Drishti) on targetHouse (1-12).
 */
export const getAspectingPlanets = (
  kundli: KundliOutput,
  targetHouse: number
): { planet: PlanetPosition; aspectType: string; aspectTypeKn: string }[] => {
  const results: { planet: PlanetPosition; aspectType: string; aspectTypeKn: string }[] = [];

  for (const p of kundli.planets) {
    if (p.house === targetHouse) continue;
    const distance = ((targetHouse - p.house + 12) % 12) + 1;

    // 1. All planets cast 7th aspect
    if (distance === 7) {
      results.push({
        planet: p,
        aspectType: "7th Full Aspect",
        aspectTypeKn: "ಪೂರ್ಣ ಸಪ್ತಮ ದೃಷ್ಟಿ (7ನೇ ದೃಷ್ಟಿ)"
      });
      continue;
    }

    // 2. Mars casts 4th and 8th aspects
    if (p.name === PlanetName.Mars) {
      if (distance === 4) {
        results.push({
          planet: p,
          aspectType: "4th Special Aspect",
          aspectTypeKn: "ಕುಜನ ಚತುರ್ಥ ವಿಶೇಷ ದೃಷ್ಟಿ (4ನೇ ದೃಷ್ಟಿ)"
        });
      } else if (distance === 8) {
        results.push({
          planet: p,
          aspectType: "8th Special Aspect",
          aspectTypeKn: "ಕುಜನ ಅಷ್ಟಮ ವಿಶೇಷ ದೃಷ್ಟಿ (8ನೇ ದೃಷ್ಟಿ)"
        });
      }
    }

    // 3. Jupiter, Rahu, Ketu cast 5th and 9th aspects
    if (p.name === PlanetName.Jupiter || p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) {
      if (distance === 5) {
        results.push({
          planet: p,
          aspectType: "5th Trikona Aspect",
          aspectTypeKn: `${getPlanetKn(p.name)}ನ ಪಂಚಮ ತ್ರಿಕೋಣ ದೃಷ್ಟಿ (5ನೇ ದೃಷ್ಟಿ)`
        });
      } else if (distance === 9) {
        results.push({
          planet: p,
          aspectType: "9th Trikona Aspect",
          aspectTypeKn: `${getPlanetKn(p.name)}ನ ನವಮ ತ್ರಿಕೋಣ ದೃಷ್ಟಿ (9ನೇ ದೃಷ್ಟಿ)`
        });
      }
    }

    // 4. Saturn casts 3rd and 10th aspects
    if (p.name === PlanetName.Saturn) {
      if (distance === 3) {
        results.push({
          planet: p,
          aspectType: "3rd Special Aspect",
          aspectTypeKn: "ಶನಿಯ ತೃತೀಯ ವಿಶೇಷ ದೃಷ್ಟಿ (3ನೇ ದೃಷ್ಟಿ)"
        });
      } else if (distance === 10) {
        results.push({
          planet: p,
          aspectType: "10th Special Aspect",
          aspectTypeKn: "ಶನಿಯ ದಶಮ ವಿಶೇಷ ದೃಷ್ಟಿ (10ನೇ ದೃಷ್ಟಿ)"
        });
      }
    }
  }

  return results;
};

/**
 * Classical planetary exaltation, debilitation, and own sign mappings.
 */
export const checkPlanetaryDignity = (
  p: PlanetPosition,
  kundli: KundliOutput
): PlanetaryDignityDetail => {
  const rashiIdx = p.rashi.index;
  const dispositor = signLord(rashiIdx);

  const EXALT_MAP: Partial<Record<PlanetName, number>> = {
    [PlanetName.Sun]: 0,
    [PlanetName.Moon]: 1,
    [PlanetName.Mars]: 9,
    [PlanetName.Mercury]: 5,
    [PlanetName.Jupiter]: 3,
    [PlanetName.Venus]: 11,
    [PlanetName.Saturn]: 6,
    [PlanetName.Rahu]: 1,
    [PlanetName.Ketu]: 7
  };

  const NEECHA_MAP: Partial<Record<PlanetName, number>> = {
    [PlanetName.Sun]: 6,
    [PlanetName.Moon]: 7,
    [PlanetName.Mars]: 3,
    [PlanetName.Mercury]: 11,
    [PlanetName.Jupiter]: 9,
    [PlanetName.Venus]: 5,
    [PlanetName.Saturn]: 0,
    [PlanetName.Rahu]: 7,
    [PlanetName.Ketu]: 1
  };

  const OWN_MAP: Partial<Record<PlanetName, number[]>> = {
    [PlanetName.Sun]: [4],
    [PlanetName.Moon]: [3],
    [PlanetName.Mars]: [0, 7],
    [PlanetName.Mercury]: [2, 5],
    [PlanetName.Jupiter]: [8, 11],
    [PlanetName.Venus]: [1, 6],
    [PlanetName.Saturn]: [9, 10]
  };

  let dignityType: PlanetaryDignityDetail["dignityType"] = "sama";
  let dignityLabelKn = "ಸಮ ಕ್ಷೇತ್ರ";
  let dignityLabelEn = "Neutral Sign";

  if (EXALT_MAP[p.name] === rashiIdx) {
    dignityType = "uccha";
    dignityLabelKn = "ಉಚ್ಚ ಕ್ಷೇತ್ರ (ಉಪರಿ ಬಲ)";
    dignityLabelEn = "Exalted (Supreme Dignity)";
  } else if (NEECHA_MAP[p.name] === rashiIdx) {
    dignityType = "neecha";
    dignityLabelKn = "ನೀಚ ಕ್ಷೇತ್ರ (ಅವನತಿ)";
    dignityLabelEn = "Debilitated (Friction)";
  } else if (OWN_MAP[p.name]?.includes(rashiIdx)) {
    dignityType = "swakshetra";
    dignityLabelKn = "ಸ್ವಕ್ಷೇತ್ರ (ಸ್ವಗೃಹ ಬಲ)";
    dignityLabelEn = "Own Sign (Strong)";
  } else {
    const rel = naturalRelation(p.name, dispositor);
    if (rel === "mitra") {
      dignityType = "mitra";
      dignityLabelKn = "ಮಿತ್ರ ಕ್ಷೇತ್ರ (ಸ್ನೇಹ ಬಲ)";
      dignityLabelEn = "Friendly Sign";
    } else if (rel === "shatru") {
      dignityType = "shatru";
      dignityLabelKn = "ಶತ್ರು ಕ್ಷೇತ್ರ (ಕ್ಲೇಶ)";
      dignityLabelEn = "Enemy Sign";
    } else {
      dignityType = "sama";
      dignityLabelKn = "ಸಮ ಕ್ಷೇತ್ರ (ಮಧ್ಯಮ)";
      dignityLabelEn = "Neutral Sign";
    }
  }

  let hasDigbala = false;
  if ((p.name === PlanetName.Mercury || p.name === PlanetName.Jupiter) && p.house === 1) {
    hasDigbala = true;
  } else if ((p.name === PlanetName.Moon || p.name === PlanetName.Venus) && p.house === 4) {
    hasDigbala = true;
  } else if (p.name === PlanetName.Saturn && p.house === 7) {
    hasDigbala = true;
  } else if ((p.name === PlanetName.Sun || p.name === PlanetName.Mars) && p.house === 10) {
    hasDigbala = true;
  }

  let isCombust = false;
  const sun = getPlanet(kundli, PlanetName.Sun);
  if (sun && p.name !== PlanetName.Sun && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu) {
    const diff = Math.abs(p.degree - sun.degree);
    const orb = Math.min(diff, 360 - diff);
    const limits: Record<PlanetName, number> = {
      [PlanetName.Moon]: 12,
      [PlanetName.Mars]: 17,
      [PlanetName.Mercury]: p.isRetrograde ? 12 : 14,
      [PlanetName.Jupiter]: 11,
      [PlanetName.Venus]: p.isRetrograde ? 8 : 10,
      [PlanetName.Saturn]: 15,
      [PlanetName.Sun]: 0,
      [PlanetName.Rahu]: 0,
      [PlanetName.Ketu]: 0
    };
    if (orb < (limits[p.name] ?? 12)) {
      isCombust = true;
    }
  }

  const aspectsCastingOnHouses: number[] = [];
  const addTarget = (dist: number) => {
    aspectsCastingOnHouses.push(((p.house - 1 + dist - 1) % 12) + 1);
  };
  addTarget(7);
  if (p.name === PlanetName.Mars) {
    addTarget(4);
    addTarget(8);
  } else if (p.name === PlanetName.Jupiter || p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) {
    addTarget(5);
    addTarget(9);
  } else if (p.name === PlanetName.Saturn) {
    addTarget(3);
    addTarget(10);
  }

  return {
    planet: p.name,
    planetKn: getPlanetKn(p.name),
    planetEn: getPlanetEn(p.name),
    house: p.house,
    rashi: p.rashi,
    rashiKn: getRashiKn(p.rashi),
    rashiEn: getRashiEn(p.rashi),
    dispositor,
    dispositorKn: getPlanetKn(dispositor),
    dignityType,
    dignityLabelKn,
    dignityLabelEn,
    isRetrograde: Boolean(p.isRetrograde),
    isCombust,
    hasDigbala,
    aspectsCastingOnHouses
  };
};

// ---------------------------------------------------------
// REAL-TIME GOCHARA SNAPSHOT CALCULATION
// ---------------------------------------------------------

export function calculateLiveGochara(
  kundli: KundliOutput,
  currentDate: Date = new Date()
): LiveGocharaSnapshot {
  const longs = siderealLongitudes(currentDate, "lahiri");
  const saturnRashiIdx = Math.floor(longs.saturn / 30);
  const jupiterRashiIdx = Math.floor(longs.jupiter / 30);
  const rahuRashiIdx = Math.floor(longs.rahu / 30);
  const ketuRashiIdx = Math.floor(longs.ketu / 30);

  const moonRashiIdx = kundli.moonSign.index;
  const lagnaRashiIdx = kundli.lagnaRashi.index;

  const saturnHouseFromMoon = ((saturnRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const saturnHouseFromLagna = ((saturnRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const jupiterHouseFromMoon = ((jupiterRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const jupiterHouseFromLagna = ((jupiterRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const rahuHouseFromMoon = ((rahuRashiIdx - moonRashiIdx + 12) % 12) + 1;

  const isSadeSati = [12, 1, 2].includes(saturnHouseFromMoon);
  let sadeSatiPhaseKn = "";
  if (saturnHouseFromMoon === 12) sadeSatiPhaseKn = "ಪ್ರಥಮ ಹಂತ (ಆರಂಭಿಕ ಸಾಡೇ ಸಾತಿ)";
  else if (saturnHouseFromMoon === 1) sadeSatiPhaseKn = "ದ್ವಿತೀಯ ಹಂತ (ಜನ್ಮ ಶನಿ - ಗರಿಷ್ಠ ಪ್ರಭಾವ)";
  else if (saturnHouseFromMoon === 2) sadeSatiPhaseKn = "ತೃತೀಯ ಹಂತ (ಅಂತ್ಯ ಹಂತದ ಸಾಡೇ ಸಾತಿ)";

  const isAshtamaShani = saturnHouseFromMoon === 8;
  const isKantakaShani = [4, 7, 10].includes(saturnHouseFromMoon);
  const hasGuruBala = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);

  const saturnRashi = RASHIS[saturnRashiIdx]!;
  const jupiterRashi = RASHIS[jupiterRashiIdx]!;
  const rahuRashi = RASHIS[rahuRashiIdx]!;
  const ketuRashi = RASHIS[ketuRashiIdx]!;

  const saturnRashiKn = getRashiKn(saturnRashi);
  const saturnRashiEn = getRashiEn(saturnRashi);
  const jupiterRashiKn = getRashiKn(jupiterRashi);
  const jupiterRashiEn = getRashiEn(jupiterRashi);

  const guruBalaSummaryKn = hasGuruBala
    ? `ಗುರು ಬಲವಿದೆ (${jupiterHouseFromMoon}ನೇ ಸ್ಥಾನ - ಶುಭ ಕಾರ್ಯ, ವಿವಾಹ, ಉದ್ಯೋಗಕ್ಕೆ ಪೂರ್ಣ ಸಹಕಾರಿ)`
    : `ಗುರು ಬಲ ಸಾಧಾರಣ (${jupiterHouseFromMoon}ನೇ ಸ್ಥಾನ - ಹೆಚ್ಚಿನ ಪರಿಶ್ರಮ ಅಪೇಕ್ಷಿತ)`;
  const guruBalaSummaryEn = hasGuruBala
    ? `Auspicious Guru Bala (House ${jupiterHouseFromMoon} from Moon - Highly favorable)`
    : `Moderate Jupiter transit (House ${jupiterHouseFromMoon} from Moon)`;

  let summaryKn = `ಶನಿ ಗೋಚಾರ: ${saturnRashiKn} (${saturnHouseFromMoon}ನೇ ಮನೆ). ಗುರು ಗೋಚಾರ: ${jupiterRashiKn} (${jupiterHouseFromMoon}ನೇ ಮನೆ).`;
  if (isSadeSati) summaryKn += ` ಸಾಡೇ ಸಾತಿ (${sadeSatiPhaseKn}) ಪ್ರಭಾವವಿದೆ.`;
  else if (isAshtamaShani) summaryKn += ` ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವವಿದೆ (ಆರೋಗ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಂಯಮ ಅಗತ್ಯ).`;
  else if (isKantakaShani) summaryKn += ` ಕಂಟಕ ಶನಿ ಪ್ರಭಾವವಿದೆ.`;
  if (hasGuruBala) summaryKn += ` ಶುಭ ಗುರು ಬಲ ರಕ್ಷಣೆ ನೀಡುತ್ತಿದೆ.`;

  const summaryEn = `Saturn in ${saturnRashiEn} (H${saturnHouseFromMoon} from Moon), Jupiter in ${jupiterRashiEn} (H${jupiterHouseFromMoon} from Moon). ${hasGuruBala ? "Auspicious Guru Bala active." : "Jupiter neutral."}`;

  return {
    saturnRashiKn,
    saturnRashiEn,
    saturnHouseFromMoon,
    saturnHouseFromLagna,
    isSadeSati,
    sadeSatiPhaseKn,
    isAshtamaShani,
    isKantakaShani,
    jupiterRashiKn,
    jupiterRashiEn,
    jupiterHouseFromMoon,
    jupiterHouseFromLagna,
    hasGuruBala,
    guruBalaSummaryKn,
    guruBalaSummaryEn,
    rahuRashiKn: getRashiKn(rahuRashi),
    ketuRashiKn: getRashiKn(ketuRashi),
    rahuHouseFromMoon,
    summaryKn,
    summaryEn
  };
}

// ---------------------------------------------------------
// STEP BUILDERS (11 Guided Steps from Scratch to Advanced)
// ---------------------------------------------------------

const buildLagnaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashi = kundli.lagnaRashi;
  const lagnaRashiKn = getRashiKn(lagnaRashi);
  const lagnaRashiEn = getRashiEn(lagnaRashi);
  const lagnaLord = signLord(lagnaRashi.index);
  const lagnaLordKn = getPlanetKn(lagnaLord);
  const lagnaLordEn = getPlanetEn(lagnaLord);
  const lagnaLordPos = getPlanet(kundli, lagnaLord);
  const lagnaLordDignity = dignityMap.get(lagnaLord);

  const occupants1 = getHouseOccupants(kundli, 1);
  const occupants1Kn = occupants1.length > 0
    ? occupants1.map((p) => getPlanetKn(p.name)).join(", ")
    : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಶೂನ್ಯ ಸ್ಥಾನ)";
  const occupants1En = occupants1.length > 0
    ? occupants1.map((p) => getPlanetEn(p.name)).join(", ")
    : "No occupying planets (Empty House)";

  const aspects1 = getAspectingPlanets(kundli, 1);
  const aspects1Kn = aspects1.length > 0
    ? aspects1.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ")
    : "ಯಾವುದೇ ಗ್ರಹದ ನೇರ ದೃಷ್ಟಿ ಇಲ್ಲ";
  const aspects1En = aspects1.length > 0
    ? aspects1.map((a) => `${getPlanetEn(a.planet.name)} (${a.aspectType})`).join(", ")
    : "No direct planetary aspects";

  const lordHouseNum = lagnaLordPos?.house ?? 1;
  const lordHouseSign = lagnaLordPos?.rashi ? getRashiKn(lagnaLordPos.rashi) : lagnaRashiKn;
  const lordDignityKn = lagnaLordDignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ";
  const lordDignityEn = lagnaLordDignity?.dignityLabelEn || "Normal placement";

  return {
    stepIndex: 1,
    stepCode: "lagna_foundation",
    titleKn: "ಹಂತ ೧: ಲಗ್ನ & ಲಗ್ನಾಧಿಪತಿ (ಪ್ರಥಮ ದರ್ಶನ - ತನು ಭಾವ)",
    titleEn: "Step 1: Ascendant & Lagna Lord (The Foundation of Life)",
    stageBadgeKn: "ಪ್ರಾರಂಭಿಕ ಹಂತ • ಮೂಲ ತಳಹದಿ",
    stageBadgeEn: "Beginner Stage • Life Foundation",
    focusHouses: [1, lordHouseNum],
    focusRashis: [lagnaRashi.index, lagnaLordPos ? lagnaLordPos.rashi.index : lagnaRashi.index],
    focusPlanets: [lagnaLord, ...occupants1.map((p) => p.name)],

    whereToLookKn: {
      primaryHouseKn: `1ನೇ ಮನೆ (ತನು ಭಾವ) • ${lagnaRashiKn} ರಾಶಿ (ಅಂಶ: ${kundli.ascendant.toFixed(2)}°)`,
      rashiAndLordKn: `ಲಗ್ನಾಧಿಪತಿ: ${lagnaLordKn} • ಸ್ಥಿತಿ: ${lordHouseNum}ನೇ ಮನೆಯಲ್ಲಿ (${lordHouseSign} ರಾಶಿ)`,
      occupyingGrahasKn: `1ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants1Kn}`,
      aspectingGrahasKn: `1ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವ ಗ್ರಹಗಳು: ${aspects1Kn}`,
      observationTipKn: "ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಯಾವುದೇ ಜಾತಕವನ್ನು ಕೈಗೆತ್ತಿಕೊಂಡ ತಕ್ಷಣ ಮೊದಲು ನೋಡಬೇಕಾದ್ದು ಲಗ್ನ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿ. ಇದು ಜಾತಕದ ಇಡೀ ಜೀವನದ ಆಧಾರ ಸ್ತಂಭ."
    },
    whereToLookEn: {
      primaryHouseEn: `1st House (Tanu Bhava) • ${lagnaRashiEn} Sign (Ascendant: ${kundli.ascendant.toFixed(2)}°)`,
      rashiAndLordEn: `Lagna Lord: ${lagnaLordEn} • Placed in House ${lordHouseNum} (${lagnaLordPos ? getRashiEn(lagnaLordPos.rashi) : lagnaRashiEn})`,
      occupyingGrahasEn: `Planets in 1st House: ${occupants1En}`,
      aspectingGrahasEn: `Planets aspecting 1st House: ${aspects1En}`,
      observationTipEn: "In Vedic astrology, the first place your eyes must look is the Ascendant (Lagna) and where the Lagna Lord resides. It sets the foundational strength for the entire horoscope."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಲಗ್ನಂ ದೇಹಂ ಚ ರೂಪಂ ಚ ಬಲಂ ಪ್ರಕೃತಿಮೇವ ಚ । ಲಗ್ನೇಶೇ ಬಲಸಂಪನ್ನೇ ಸರ್ವಂ ಕಲ್ಯಾಣದಾಯಕಮ್ ॥",
      dignityKn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ${lordDignityKn}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: `ಲಗ್ನಾಧಿಪತಿ ಕುಳಿತಿರುವ ರಾಶ್ಯಾಧಿಪತಿ ಜೊತೆಗೆ ಸಂಬಂಧ: ${lagnaLordDignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಮೈತ್ರಿ"}.`,
      specialConditionKn: lagnaLordDignity?.isRetrograde
        ? "ಲಗ್ನಾಧಿಪತಿ ವಕ್ರಿಯಾಗಿದ್ದಾರೆ (Retrograde) — ಇದು ಜೀವನದಲ್ಲಿ ಆಳವಾದ ಆತ್ಮಾವಲೋಕನ ಮತ್ತು ಸ್ವಪ್ರಯತ್ನವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ."
        : lagnaLordDignity?.isCombust
        ? "ಲಗ್ನಾಧಿಪತಿ ಸೂರ್ಯನಿಗೆ ಹತ್ತಿರವಾಗಿ ಅಸ್ತಂಗತರಾಗಿದ್ದಾರೆ — ತೇಜಸ್ಸು ಇದ್ದರೂ ಆರಂಭಿಕ ಗುರುತಿಸುವಿಕೆಗೆ ಸಂಯಮ ಬೇಕು."
        : undefined,
      bulletPointsKn: [
        `ಲಗ್ನ ರಾಶಿ ${lagnaRashiKn} ಸ್ಥಿರ/ಚರ ಸ್ವಭಾವವನ್ನು ಜಾತಕರ ಶಾರೀರಿಕ ಪ್ರಕೃತಿಗೆ ನೀಡುತ್ತದೆ.`,
        `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ${lordHouseNum}ನೇ ಭಾವದಲ್ಲಿರುವುದರಿಂದ, ಜಾತಕರ ಪ್ರಮುಖ ಜೀವನ ಶಕ್ತಿ ಮತ್ತು ಗಮನ ಆ ಭಾವದ ವಿಷಯಗಳಲ್ಲೇ ಇರುತ್ತದೆ.`,
        occupants1.length > 0
          ? `1ನೇ ಮನೆಯಲ್ಲಿರುವ ${occupants1Kn} ಗ್ರಹಗಳು ನೇರವಾಗಿ ಜಾತಕರ ಬಾಹ್ಯ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ವರ್ತನೆಯ ಮೇಲೆ ನೇರ ಛಾಪು ಮೂಡಿಸುತ್ತವೆ.`
          : `1ನೇ ಮನೆ ಶುಭ್ರವಾಗಿದ್ದು (ಖಾಲಿ), ಲಗ್ನಾಧಿಪತಿಯ ಬಲವೇ ನೇರವಾಗಿ ದೇಹಬಲವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "The Lagna represents vitality, body, aura, constitution, and foundational destiny. If the Lagna Lord is strong, the native overcomes difficulties with grace.",
      dignityEn: `Lagna Lord ${lagnaLordEn} is in ${lordDignityEn}.`,
      grahaRelationsEn: `Relationship with sign dispositor: ${lagnaLordDignity?.dignityLabelEn || "Natural relationship"}.`,
      specialConditionEn: lagnaLordDignity?.isRetrograde
        ? "Lagna Lord is Retrograde — gives deep introspection and self-reliance."
        : undefined,
      bulletPointsEn: [
        `The rising sign ${lagnaRashiEn} defines the physical constitution and temperament.`,
        `Since the Lagna Lord sits in House ${lordHouseNum}, the native's core life energy is concentrated in that domain.`,
        `Occupants in House 1 (${occupants1En}) directly flavor the native's aura and first impressions.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ${lordHouseNum}ನೇ ಮನೆಯಲ್ಲಿ ${lordDignityKn}ದಲ್ಲಿ ನೆಲೆಗೊಂಡಿರುವುದರಿಂದ, ಜಾತಕರು ತಮ್ಮ ಆರೋಗ್ಯ, ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸದಲ್ಲಿ ${lordHouseNum === 6 || lordHouseNum === 8 || lordHouseNum === 12 ? "ಹೋರಾಟದ ನಂತರ ಜಯ ಪಡೆಯುವ" : "ಸಹಜ ನಾಯಕತ್ವ ಹಾಗೂ ದೃಢತೆ ಪ್ರದರ್ಶಿಸುವ"} ಲಕ್ಷಣಗಳನ್ನು ಹೊಂದಿರುತ್ತಾರೆ.`,
      lifeDomainKn: "ಆರೋಗ್ಯ, ಆಯುಷ್ಯ, ಆತ್ಮಸ್ಥೈರ್ಯ, ಶಾರೀರಿಕ ಶಕ್ತಿ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಗೌರವ.",
      keyInfluencesKn: [
        `ಲಗ್ನ ರಾಶಿ: ${lagnaRashiKn}`,
        `ಲಗ್ನಾಧಿಪತಿ: ${lagnaLordKn} (${lordHouseNum}ನೇ ಮನೆ)`,
        `ದೃಷ್ಟಿ ಬಲ: ${aspects1.length} ಗ್ರಹಗಳ ದೃಷ್ಟಿ`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the Lagna Lord sits in House ${lordHouseNum} with ${lordDignityEn}, the native's vitality and self-identity channel primarily through that life sphere.`,
      lifeDomainEn: "Vitality, Physical Stamina, Self-confidence, Aura and Life Trajectory.",
      keyInfluencesEn: [
        `Rising Sign: ${lagnaRashiEn}`,
        `Lagna Lord: ${lagnaLordEn} in House ${lordHouseNum}`,
        `Aspects: ${aspects1.length} planetary aspect(s)`
      ]
    },

    spokenConsultationScriptKn: `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಥಮ ದರ್ಶನದಲ್ಲಿ ಲಗ್ನವು ${lagnaRashiKn} ಆಗಿದೆ. ಇದರ ಅಧಿಪತಿಯಾದ ${lagnaLordKn} ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${lordHouseNum}ನೇ ಮನೆಯಲ್ಲಿ ನೆಲೆಸಿದ್ದಾರೆ. ಇದರರ್ಥ ನಿಮ್ಮ ಜೀವನದ ಶಕ್ತಿ ಮತ್ತು ಚಿಂತನೆಯು ಸದಾ ನಿಮ್ಮ ಪ್ರಯತ್ನ ಮತ್ತು ಆಂತರಿಕ ಶಕ್ತಿಯ ಮೇಲೆ ನಿಂತಿದೆ. ಯಾವುದೇ ಕಷ್ಟ ಬಂದರೂ ನೀವು ಧೈರ್ಯಗೆಡದೆ ಮುನ್ನುಗ್ಗುವ ಛಲಗಾರಿಕೆ ನಿಮ್ಮ ದೇಹಬಲದಲ್ಲಿದೆ. ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯನ್ನು ಪ್ರತಿದಿನ ಸ್ಮರಿಸುವುದರಿಂದ ನಿಮ್ಮ ತೇಜಸ್ಸು ಹಾಗೂ ಆರೋಗ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Looking at your chart's foundation, your Ascendant is ${lagnaRashiEn}, ruled by ${lagnaLordEn} who is placed in your ${lordHouseNum}th house. This shows that your core vitality and determination are self-reliant. Even when challenges arise, your inner resilience sustains you. Strengthening your Lagna Lord through daily prayer aligns your health and personal magnetism.`,

    practicalGuidanceKn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn}ನ ಅನುಗ್ರಹಕ್ಕಾಗಿ ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಅಥವಾ ಈ ಗ್ರಹದ ಮೂಲ ಮಂತ್ರ ಜಪಿಸಿ. ಯಾವುದೇ ಹೊಸ ಕೆಲಸ ಆರಂಭಿಸುವ ಮುನ್ನ ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ಕಾಲಾವಧಿಯನ್ನು ಗಮನಿಸಿ.`,
    practicalGuidanceEn: `To strengthen the Lagna Lord (${lagnaLordEn}), chant the seed mantra or practice daily Surya Namaskara to maintain physical stamina and mental clarity.`
  };
};

const buildMoonStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const moon = getPlanet(kundli, PlanetName.Moon);
  const moonRashi = kundli.moonSign;
  const moonRashiKn = getRashiKn(moonRashi);
  const moonRashiEn = getRashiEn(moonRashi);
  const moonHouse = moon?.house ?? 1;
  const moonDignity = dignityMap.get(PlanetName.Moon);
  const moonNak = moon?.nakshatra ? moon.nakshatra.sanskrit : "ಅಜ್ಞಾತ";
  const moonPada = kundli.moonPada;

  const sun = getPlanet(kundli, PlanetName.Sun);
  let pakshaBalaKn = "ಶುಕ್ಲ ಪಕ್ಷ (ಬಲಶಾಲಿ ಮನಸ್ಸು)";
  let pakshaBalaEn = "Bright Fortnight (Strong Paksha Bala)";
  if (moon && sun) {
    const diff = (moon.degree - sun.degree + 360) % 360;
    if (diff > 180) {
      pakshaBalaKn = "ಕೃಷ್ಣ ಪಕ್ಷ (ಅಂತರ್ಮುಖಿ ಮನಸ್ಸು / ಆಲೋಚನಾ ಶಕ್ತಿ)";
      pakshaBalaEn = "Dark Fortnight (Introspective & Reflective Mind)";
    }
  }

  const moonOccupants = kundli.planets.filter((p) => p.name !== PlanetName.Moon && p.house === moonHouse);
  const moonOccupantsKn = moonOccupants.length > 0
    ? moonOccupants.map((p) => getPlanetKn(p.name)).join(", ")
    : "ಯಾವ ಗ್ರಹದ ಸಂಯೋಗವೂ ಇಲ್ಲ";
  const moonOccupantsEn = moonOccupants.length > 0
    ? moonOccupants.map((p) => getPlanetEn(p.name)).join(", ")
    : "No conjunct planets";

  const moonAspects = getAspectingPlanets(kundli, moonHouse);
  const moonAspectsKn = moonAspects.length > 0
    ? moonAspects.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ")
    : "ಯಾವುದೇ ಕ್ರೂರ ಗ್ರಹದ ದೃಷ್ಟಿ ಇಲ್ಲ";

  return {
    stepIndex: 2,
    stepCode: "moon_mind_anchor",
    titleKn: "ಹಂತ ೨: ಚಂದ್ರ, ಜನ್ಮ ರಾಶಿ & ನಕ್ಷತ್ರ (ಮನಃಕಾರಕ - ಭಾವನಾತ್ಮಕ ಶಕ್ತಿ)",
    titleEn: "Step 2: The Moon & Nakshatra (The Emotional Engine & Mind)",
    stageBadgeKn: "ಪ್ರಾರಂಭಿಕ ಹಂತ • ಮಾನಸಿಕ ನೆಲೆ",
    stageBadgeEn: "Beginner Stage • Mental Anchor",
    focusHouses: [moonHouse],
    focusRashis: [moonRashi.index],
    focusPlanets: [PlanetName.Moon, ...moonOccupants.map((p) => p.name)],

    whereToLookKn: {
      primaryHouseKn: `ಚಂದ್ರ ಸ್ಥಿತಿ: ${moonHouse}ನೇ ಮನೆ • ${moonRashiKn} ರಾಶಿ`,
      rashiAndLordKn: `ಜನ್ಮ ನಕ್ಷತ್ರ: ${moonNak} (${moonPada}ನೇ ಪಾದ) • ಪಕ್ಷ ಬಲ: ${pakshaBalaKn}`,
      occupyingGrahasKn: `ಚಂದ್ರನೊಂದಿಗೆ ಒಂದೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${moonOccupantsKn}`,
      aspectingGrahasKn: `ಚಂದ್ರನಿಗೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವ ಗ್ರಹಗಳು: ${moonAspectsKn}`,
      observationTipKn: "ಲಗ್ನದ ನಂತರ ಎರಡನೆಯದಾಗಿ ನೋಡಬೇಕಾದ್ದು ಚಂದ್ರ. 'ಚಂದ್ರಮಾ ಮನಸೋ ಜಾತಃ' — ಮನಸ್ಸಿನ ಶಾಂತಿ, ನಿರ್ಧಾರ ಸಾಮರ್ಥ್ಯ, ನಿದ್ರೆ ಮತ್ತು ಸುಖವನ್ನು ಚಂದ್ರನೇ ನಿರ್ಧರಿಸುತ್ತಾನೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `Moon in House ${moonHouse} • ${moonRashiEn} Sign`,
      rashiAndLordEn: `Birth Nakshatra: ${moonNak} (Pada ${moonPada}) • Paksha: ${pakshaBalaEn}`,
      occupyingGrahasEn: `Planets conjunct Moon: ${moonOccupantsEn}`,
      aspectingGrahasEn: `Planets aspecting Moon: ${moonAspectsKn}`,
      observationTipEn: "After the Ascendant, look at the Moon. The Moon governs the subconscious mind, emotional stability, sleep quality, and daily moods."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಚಂದ್ರಮಾ ಮನಸೋ ಜಾತಶ್ಚಕ್ಷೋಃ ಸೂರ್ಯೋ ಅಜಾಯತ । ಚಂದ್ರೇ ಶುಭಯುತೇ ಶಾಂತಂ ಪಾಪಯುತೇ ಮನೋವ್ಯಥಾ ॥",
      dignityKn: `ಚಂದ್ರನು ${moonDignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: `ಚಂದ್ರನು ಮನಸ್ಸಿನ ಕಾರಕನಾಗಿದ್ದು, ${moonOccupants.some((p) => p.name === PlanetName.Saturn || p.name === PlanetName.Rahu) ? "ಶನಿ/ರಾಹು ಸಂಬಂಧದಿಂದ ಅತಿಯಾದ ಆಲೋಚನೆ ಅಥವಾ ಆತಂಕಕ್ಕೆ ಗುರಿಯಾಗುವ ಸಾಧ್ಯತೆ" : "ಶಾಂತ ಹಾಗೂ ಸ್ಥಿರ ಮನಃಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತಾನೆ"}.`,
      bulletPointsKn: [
        `ಜನ್ಮ ನಕ್ಷತ್ರ ${moonNak} ಪಾದ ${moonPada} ವ್ಯಕ್ತಿಯ ಮೂಲಭೂತ ಚಿಂತನಾ ಲಹರಿಯನ್ನು ರೂಪಿಸುತ್ತದೆ.`,
        `ಚಂದ್ರನ ಸ್ಥಾನ ${moonHouse}ನೇ ಮನೆಯಾಗಿರುವುದರಿಂದ, ಭಾವನಾತ್ಮಕ ನೆಮ್ಮದಿ ಆ ಭಾವದ ಫಲಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ.`,
        moonOccupants.length > 0
          ? `ಚಂದ್ರನೊಂದಿಗೆ ${moonOccupantsKn} ಗ್ರಹಗಳಿರುವುದರಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಆ ಗ್ರಹಗಳ ಗುಣಲಕ್ಷಣಗಳು ಪ್ರತಿಧ್ವನಿಸುತ್ತವೆ.`
          : `ಚಂದ್ರನು ಪ್ರತ್ಯೇಕವಾಗಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ವತಂತ್ರ ವಿಚಾರಶಕ್ತಿ ಇರುತ್ತದೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Moon represents consciousness and mind. If Moon is conjunct or aspected by benefics, there is serenity; if afflicted by Saturn/Rahu, mental stress ensues.",
      dignityEn: `Moon is placed in ${moonDignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: `Emotional balance is governed by planetary conjunctions with Moon.`,
      bulletPointsEn: [
        `Birth Nakshatra ${moonNak} defines intuitive responses and behavioral habits.`,
        `House ${moonHouse} is where the native seeks emotional safety and peace.`,
        `Conjunctions (${moonOccupantsEn}) color the emotional filter of the native.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಚಂದ್ರನು ${moonHouse}ನೇ ಮನೆಯಲ್ಲಿ ${moonRashiKn} ರಾಶಿಯಲ್ಲಿ ಕುಳಿತಿರುವುದರಿಂದ ಜಾತಕರಿಗೆ ಯಾವುದೇ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವಾಗ ${moonDignity?.dignityType === "uccha" || moonDignity?.dignityType === "swakshetra" ? "ಆಳವಾದ ಅಂತಃಪ್ರಜ್ಞೆ ಮತ್ತು ಸ್ಥೈರ್ಯ" : "ಅತಿಯಾದ ಸೂಕ್ಷ್ಮತೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ತಲ್ಲಣಗಳು"} ಉಂಟಾಗುತ್ತವೆ.`,
      lifeDomainKn: "ಮನಸ್ಸಿನ ಶಾಂತಿ, ತಾಯಿಯ ಬಾಂಧವ್ಯ, ನಿದ್ರೆ, ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ.",
      keyInfluencesKn: [
        `ಜನ್ಮ ರಾಶಿ: ${moonRashiKn}`,
        `ನಕ್ಷತ್ರ: ${moonNak} (${moonPada}ನೇ ಪಾದ)`,
        `ಪಕ್ಷ: ${pakshaBalaKn}`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the Moon resides in House ${moonHouse} in ${moonRashiEn}, decisions are deeply driven by intuitive sensitivity and emotional security.`,
      lifeDomainEn: "Peace of Mind, Maternal Ties, Sleep Harmony, Emotional Resilience.",
      keyInfluencesEn: [
        `Moon Sign: ${moonRashiEn}`,
        `Nakshatra: ${moonNak} (Pada ${moonPada})`,
        `Paksha Bala: ${pakshaBalaEn}`
      ]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಮನಸ್ಸಿನ ಸ್ಥಿತಿಯನ್ನು ನೋಡಿದರೆ, ನೀವು ಮನಸ್ಸಿನಲ್ಲಿ ಬಹಳಷ್ಟು ವಿಷಯಗಳನ್ನು ಒಳಗೊಳಗೆ ಇಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಹೊಂದಿದ್ದೀರಿ. ನಿಮ್ಮ ರಾಶಿ ${moonRashiKn} ಹಾಗೂ ನಕ್ಷತ್ರ ${moonNak}. ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾಗಿ ಯೋಚನೆ ಮಾಡುವುದು ಅಥವಾ ರಾತ್ರಿ ವೇಳೆ ನಿದ್ರೆಗೆ ಅಡ್ಡಿಯಾಗುವ ಆಲೋಚನೆಗಳು ಬರುವುದು ಸಹಜ. ನಿಮ್ಮ ಮನಸ್ಸು ಶಾಂತವಾಗಿದ್ದರೆ ನೀವು ಅಸಾಧ್ಯವಾದುದನ್ನೂ ಸಾಧಿಸಬಲ್ಲಿರಿ. ಆದ್ದರಿಂದ ಮನೋನಿಗ್ರಹಕ್ಕಾಗಿ ಪ್ರತಿದಿನ ಸ್ವಲ್ಪ ಸಮಯ ಧ್ಯಾನ ಅಥವಾ ಶಿವನ ಸ್ಮರಣೆ ಮಾಡುವುದು ನಿಮಗೆ ಶ್ರೇಯಸ್ಕರ.`,
    spokenConsultationScriptEn: `Looking at your mental engine, your Moon is in ${moonRashiEn} under ${moonNak} Nakshatra. You tend to carry emotional impressions deeply inside. When under stress, overthinking may disturb your night peace. Cultivating daily tranquility through meditation or Shiva prayer will bring tremendous clarity to your decisions.`,

    practicalGuidanceKn: "ಪ್ರತಿದಿನ ಶುದ್ಧ ನೀರನ್ನು ಬೆಳ್ಳಿಯ ಪಾತ್ರೆಯಲ್ಲಿಟ್ಟು ಸೇವಿಸುವುದು, ಹುಣ್ಣಿಮೆಯ ದಿನ ಚಂದ್ರ ದರ್ಶನ ಮಾಡುವುದು ಮತ್ತು ತಾಯಿಯ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು ಮನಸ್ಸಿಗೆ ಅಖಂಡ ಶಾಂತಿ ನೀಡುತ್ತದೆ.",
    practicalGuidanceEn: "Drink pure water from a silver cup, take blessings from your mother, and perform brief silent meditation to stabilize lunar vibrations."
  };
};

const buildSukhaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house4Sign = getHouseRashi(lagnaRashiIdx, 4);
  const house4SignKn = getRashiKn(house4Sign);
  const house4SignEn = getRashiEn(house4Sign);
  const lord4 = signLord(house4Sign.index);
  const lord4Kn = getPlanetKn(lord4);
  const lord4En = getPlanetEn(lord4);
  const lord4Pos = getPlanet(kundli, lord4);
  const lord4Dignity = dignityMap.get(lord4);

  const occupants4 = getHouseOccupants(kundli, 4);
  const occupants4Kn = occupants4.length > 0 ? occupants4.map((p) => getPlanetKn(p.name)).join(", ") : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಶುದ್ಧ ಸುಖ ಭಾವ)";
  const occupants4En = occupants4.length > 0 ? occupants4.map((p) => getPlanetEn(p.name)).join(", ") : "No occupying planets";
  const aspects4 = getAspectingPlanets(kundli, 4);
  const aspects4Kn = aspects4.length > 0 ? aspects4.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ") : "ಯಾವುದೇ ಅಶುಭ ದೃಷ್ಟಿ ಇಲ್ಲ";
  const lord4House = lord4Pos?.house ?? 4;

  return {
    stepIndex: 3,
    stepCode: "sukha_bhava_foundation",
    titleKn: "ಹಂತ ೩: ೪ನೇ ಕೇಂದ್ರ - ಸುಖ ಸ್ಥಾನ (ಮಾತೃ, ಗೃಹ, ವಾಹನ & ಮನಃಶಾಂತಿ)",
    titleEn: "Step 3: 4th House - Sukha Bhava (Inner Peace, Mother & Property)",
    stageBadgeKn: "ಕೇಂದ್ರ ಪರೀಕ್ಷೆ • ಸುಖ ಸ್ತಂಭ",
    stageBadgeEn: "Kendra Pillar • Domestic Peace",
    focusHouses: [4, lord4House],
    focusRashis: [house4Sign.index, lord4Pos ? lord4Pos.rashi.index : house4Sign.index],
    focusPlanets: [lord4, ...occupants4.map((p) => p.name)],

    whereToLookKn: {
      primaryHouseKn: `4ನೇ ಮನೆ (ಸುಖ ಭಾವ) • ${house4SignKn} ರಾಶಿ`,
      rashiAndLordKn: `ಚತುರ್ಥಾಧಿಪತಿ: ${lord4Kn} • ಸ್ಥಿತಿ: ${lord4House}ನೇ ಮನೆಯಲ್ಲಿ`,
      occupyingGrahasKn: `4ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants4Kn}`,
      aspectingGrahasKn: `4ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವ ಗ್ರಹಗಳು: ${aspects4Kn}`,
      observationTipKn: "ಮನುಷ್ಯನಿಗೆ ಎಷ್ಟು ಸಂಪತ್ತಿದ್ದರೂ ಮನೆಯಲ್ಲಿ ನೆಮ್ಮದಿ ಇದೆಯೇ? ತಾಯಿಯ ವಾತ್ಸಲ್ಯ, ಗೃಹ, ವಾಸ್ತು ಮತ್ತು ವಾಹನ ಸುಖ ಸಿಗುತ್ತದೆಯೇ ಎಂಬುದನ್ನು 4ನೇ ಮನೆಯೇ ಹೇಳುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `4th House (Sukha Bhava) • ${house4SignEn} Sign`,
      rashiAndLordEn: `4th Lord: ${lord4En} • Resides in House ${lord4House}`,
      occupyingGrahasEn: `Planets in 4th House: ${occupants4En}`,
      aspectingGrahasEn: `Planets aspecting 4th House: ${aspects4Kn}`,
      observationTipEn: "Domestic happiness, maternal blessings, real estate stability, and vehicle comforts are revealed by the 4th house."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಮಾತೃ ಸುಖಂ ಗೃಹಂ ಚೈವ ವಾಹನಂ ಭೂಮಿಮೇವ ಚ । ಚತುರ್ಥಭಾವೇ ಪಶ್ಯಂತಿ ವಿದ್ಯಾಂ ಚ ಹೃದಯಂ ತಥಾ ॥",
      dignityKn: `ಚತುರ್ಥಾಧಿಪತಿ ${lord4Kn} ${lord4Dignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: "4ನೇ ಮನೆಯು ನೈಸರ್ಗಿಕವಾಗಿ ಶುಕ್ರ ಮತ್ತು ಚಂದ್ರರಿಗೆ ದಿಗ್ಬಲ ನೀಡುವ ಸ್ಥಾನ.",
      bulletPointsKn: [
        `4ನೇ ಮನೆ ${house4SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಗೃಹ ಶಾಂತಿಯ ಅಡಿಪಾಯವಾಗಿದೆ.`,
        `ಚತುರ್ಥಾಧಿಪತಿ ${lord4Kn} ${lord4House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಆಸ್ತಿ ಮತ್ತು ವಾಹನ ಸುಖ ಆ ಸ್ಥಾನಕ್ಕೆ ಜೋಡಿಸಲ್ಪಟ್ಟಿದೆ.`,
        occupants4.length > 0 ? `4ನೇ ಮನೆಯಲ್ಲಿರುವ ${occupants4Kn} ಗ್ರಹಗಳು ಮನೆಯ ಆಂತರಿಕ ಪರಿಸರದ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರುತ್ತವೆ.` : "ಯಾವುದೇ ಪಾಪಗ್ರಹಗಳಿಲ್ಲದಿರುವುದು ಗೃಹ ಸಮಾಧಾನಕ್ಕೆ ಅನುಕೂಲಕರ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "4th house rules maternal happiness, property, vehicles, heart contentment, and primary foundation.",
      dignityEn: `4th Lord ${lord4En} sits in ${lord4Dignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: "Venus and Moon obtain natural directional strength (Digbala) in the 4th house.",
      bulletPointsEn: [
        `4th sign ${house4SignEn} dictates the emotional tone inside the residence.`,
        `Placement of 4th Lord in House ${lord4House} links property luck to that realm.`,
        `Occupants in 4th (${occupants4En}) reveal whether home life feels restful or demanding.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `4ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${lord4Kn} ${lord4House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಜಾತಕರ ಮನೆಯ ವಾತಾವರಣದಲ್ಲಿ ${lord4House === 6 || lord4House === 8 || lord4House === 12 ? "ಕೆಲವು ಏರುಪೇರುಗಳು ಮತ್ತು ಸ್ಥಳ ಬದಲಾವಣೆಯ ಯೋಗವಿದೆ" : "ಸ್ಥಿರತೆ, ವಾಹನ ಲಾಭ ಮತ್ತು ಕುಟುಂಬ ಸೌಖ್ಯ ಒಲಿದುಬರುತ್ತದೆ"}.`,
      lifeDomainKn: "ಮನಸ್ಸಿನ ನೆಮ್ಮದಿ, ತಾಯಿ, ಸ್ವಂತ ಮನೆ, ವಾಹನ, ವಾಸ್ತು ಸುಖ.",
      keyInfluencesKn: [`4ನೇ ರಾಶಿ: ${house4SignKn}`, `ಚತುರ್ಥಾಧಿಪತಿ: ${lord4Kn}`, `ಗ್ರಹಗಳು: ${occupants4Kn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 4th Lord sits in House ${lord4House}, the native's domestic satisfaction correlates with that house's karmic energy.`,
      lifeDomainEn: "Domestic Harmony, Mother, Real Estate, Vehicles, Inner Contentment.",
      keyInfluencesEn: [`4th Sign: ${house4SignEn}`, `4th Lord: ${lord4En}`, `Occupants: ${occupants4En}`]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಗೃಹಸ್ಥಿತಿ ಮತ್ತು ಮನಃಶಾಂತಿಯ ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ನಿಮ್ಮ 4ನೇ ಮನೆ ${house4SignKn} ಆಗಿದ್ದು, ಇದರ ಅಧಿಪತಿ ${lord4Kn} ${lord4House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ಹೊರಗಡೆ ಎಷ್ಟೇ ಕೆಲಸವಿದ್ದರೂ ಮನೆಗೆ ಬಂದಾಗ ಸಂಪೂರ್ಣ ಶಾಂತಿ ಸಿಗಬೇಕೆಂದು ನೀವು ಬಯಸುತ್ತೀರಿ. ಸ್ವಂತ ಆಸ್ತಿ ಅಥವಾ ವಾಹನ ಯೋಗ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ. ತಾಯಿಯ ಮನಸ್ಸನ್ನು ನೋಯಿಸದೆ ಆಶೀರ್ವಾದ ಪಡೆದರೆ ನಿಮ್ಮ ಸುಖ ಸ್ಥಾನಕ್ಕೆ ಅಪಾರ ಬಲ ಬರುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Regarding your home and peace of mind, your 4th house is ${house4SignEn} ruled by ${lord4En} in House ${lord4House}. Real estate and vehicle comforts are indicated. Honoring your mother's wishes will anchor peace in your household.`,

    practicalGuidanceKn: "ಮನೆಯ ಈಶಾನ್ಯ ಭಾಗವನ್ನು ಸದಾ ಶುದ್ಧವಾಗಿಡಿ. ಗೋಸೇವೆ ಮಾಡುವುದು ಅಥವಾ ತಾಯಿಗೆ ಪ್ರೀತಿಯಿಂದ ವಸ್ತ್ರದಾನ ಮಾಡುವುದು ಚತುರ್ಥ ಸ್ಥಾನದ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
    practicalGuidanceEn: "Keep the northeast quadrant of your dwelling clean and clutter-free. Feeding cows and respecting the mother mitigates any 4th house afflictions."
  };
};

const buildKalatraStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house7Sign = getHouseRashi(lagnaRashiIdx, 7);
  const house7SignKn = getRashiKn(house7Sign);
  const house7SignEn = getRashiEn(house7Sign);
  const lord7 = signLord(house7Sign.index);
  const lord7Kn = getPlanetKn(lord7);
  const lord7En = getPlanetEn(lord7);
  const lord7Pos = getPlanet(kundli, lord7);
  const lord7Dignity = dignityMap.get(lord7);

  const occupants7 = getHouseOccupants(kundli, 7);
  const occupants7Kn = occupants7.length > 0 ? occupants7.map((p) => getPlanetKn(p.name)).join(", ") : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಖಾಲಿ ಸಪ್ತಮ)";
  const occupants7En = occupants7.length > 0 ? occupants7.map((p) => getPlanetEn(p.name)).join(", ") : "No occupying planets";
  const aspects7 = getAspectingPlanets(kundli, 7);
  const aspects7Kn = aspects7.length > 0 ? aspects7.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ") : "ಯಾವುದೇ ನೇರ ದೃಷ್ಟಿ ಇಲ್ಲ";
  const lord7House = lord7Pos?.house ?? 7;

  const mars = getPlanet(kundli, PlanetName.Mars);
  const hasMarsIn7 = mars?.house === 7;
  const saturn = getPlanet(kundli, PlanetName.Saturn);
  const hasSaturnIn7 = saturn?.house === 7;

  return {
    stepIndex: 4,
    stepCode: "kalatra_bhava_marriage",
    titleKn: "ಹಂತ ೪: ೭ನೇ ಕೇಂದ್ರ - ಕಳತ್ರ ಸ್ಥಾನ (ದಾಂಪತ್ಯ, ಜೀವನ ಸಂಗಾತಿ & ಪಾಲುದಾರಿಕೆ)",
    titleEn: "Step 4: 7th House - Kalatra Bhava (Marriage, Spouse & Public Relations)",
    stageBadgeKn: "ಕೇಂದ್ರ ಪರೀಕ್ಷೆ • ದಾಂಪತ್ಯ ಸ್ತಂಭ",
    stageBadgeEn: "Kendra Pillar • Marital Bond",
    focusHouses: [7, lord7House],
    focusRashis: [house7Sign.index, lord7Pos ? lord7Pos.rashi.index : house7Sign.index],
    focusPlanets: [lord7, ...occupants7.map((p) => p.name)],

    whereToLookKn: {
      primaryHouseKn: `7ನೇ ಮನೆ (ಕಳತ್ರ ಭಾವ) • ${house7SignKn} ರಾಶಿ (ಲಗ್ನಕ್ಕೆ ನೇರ 180° ಎದುರು)`,
      rashiAndLordKn: `ಸಪ್ತಮಾಧಿಪತಿ: ${lord7Kn} • ಸ್ಥಿತಿ: ${lord7House}ನೇ ಮನೆಯಲ್ಲಿ`,
      occupyingGrahasKn: `7ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants7Kn}`,
      aspectingGrahasKn: `7ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವ ಗ್ರಹಗಳು: ${aspects7Kn}`,
      observationTipKn: "7ನೇ ಮನೆಯು ಲಗ್ನದ ಪ್ರತಿಬಿಂಬ. ಸಂಗಾತಿಯ ಸ್ವಭಾವ, ವಿವಾಹದ ಸಮಯ, ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ ಮತ್ತು ಪಾಲುದಾರಿಕೆಯನ್ನು 7ನೇ ಮನೆಯೇ ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `7th House (Kalatra Bhava) • ${house7SignEn} Sign (Direct 180° opposite Lagna)`,
      rashiAndLordEn: `7th Lord: ${lord7En} • Resides in House ${lord7House}`,
      occupyingGrahasEn: `Planets in 7th House: ${occupants7En}`,
      aspectingGrahasEn: `Planets aspecting 7th House: ${aspects7Kn}`,
      observationTipEn: "The 7th house reveals the temperament of the spouse, marriage timing, marital harmony, and public interactions."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಕಳತ್ರಂ ಕಾಮಭಾವಂ ಚ ಜಾಯಾಂ ಚ ವಣಿಜಾಂ ತಥಾ । ಸಪ್ತಮೇ ವೀಕ್ಷ್ಯ ತದ್ಭಾವಂ ಶುಭಪಾಶ್ಚ ಸುಖಪ್ರದಮ್ ॥",
      dignityKn: `ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7Dignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: hasMarsIn7 ? "ಕುಜನು 7ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಮಾಂಗಲ್ಯ ದೋಷವಿದೆ." : hasSaturnIn7 ? "ಶನಿ 7ನೇ ಮನೆಯಲ್ಲಿದ್ದು ದಿಗ್ಬಲ ಹೊಂದಿದ್ದಾರೆ." : "ಸಪ್ತಮ ಸ್ಥಾನವು ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಕೂಡಿದೆ.",
      bulletPointsKn: [
        `7ನೇ ರಾಶಿ ${house7SignKn} ಸಂಗಾತಿಯ ಮನೋಧರ್ಮವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
        `ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ.`,
        occupants7.length > 0 ? `7ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants7Kn}.` : "7ನೇ ಮನೆ ನಿರ್ಮಲವಾಗಿದೆ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "7th house governs spouse, marriage longevity, contracts, and partnerships.",
      dignityEn: `7th Lord ${lord7En} is placed in ${lord7Dignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: hasMarsIn7 ? "Mars in 7th creates Kuja influence." : hasSaturnIn7 ? "Saturn in 7th has Digbala." : "Standard influences apply.",
      bulletPointsEn: [
        `7th sign ${house7SignEn} reflects the partner's character.`,
        `Placement of 7th Lord in House ${lord7House} links marriage destiny.`,
        `Planets in 7th (${occupants7En}) color daily dynamics.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಜಾತಕರ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಸಹಕಾರದಿಂದ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುವ ಲಕ್ಷಣಗಳಿವೆ.`,
      lifeDomainKn: "ವಿವಾಹ, ಜೀವನ ಸಂಗಾತಿ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ, ಸಾರ್ವಜನಿಕ ಒಪ್ಪಂದಗಳು.",
      keyInfluencesKn: [`7ನೇ ರಾಶಿ: ${house7SignKn}`, `ಸಪ್ತಮಾಧಿಪತಿ: ${lord7Kn}`, `ಗ್ರಹ ಸ್ಥಿತಿ: ${occupants7Kn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 7th Lord sits in House ${lord7House}, marital happiness depends upon mutual respect.`,
      lifeDomainEn: "Marriage, Spouse Disposition, Business Partnerships.",
      keyInfluencesEn: [`7th Sign: ${house7SignEn}`, `7th Lord: ${lord7En}`, `Occupants: ${occupants7En}`]
    },

    spokenConsultationScriptKn: `ದಾಂಪತ್ಯದ ವಿಚಾರಕ್ಕೆ ಬಂದರೆ, ನಿಮ್ಮ 7ನೇ ಮನೆ ${house7SignKn} ಆಗಿದ್ದು, ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ನಿಮ್ಮ ಸಂಗಾತಿಯು ಸ್ವಾಭಿಮಾನಿ ಹಾಗೂ ಕರ್ತವ್ಯನಿಷ್ಠ ಸ್ವಭಾವದವರು. ಪರಸ್ಪರ ಗೌರವ ನೀಡಿದರೆ ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಸಂತೋಷ ಸದಾ ಇರುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Regarding marriage, your 7th house is ${house7SignEn}, ruled by ${lord7En} in House ${lord7House}. Mutual patience and empathetic communication ensure lasting bliss.`,

    practicalGuidanceKn: "ಶುಕ್ರವಾರ ಉಮಾ-ಮಹೇಶ್ವರ ಅಥವಾ ಲಕ್ಷ್ಮೀ-ನಾರಾಯಣ ಪೂಜೆ ಮಾಡುವುದು ಹಾಗೂ ಸಂಗಾತಿಯೊಂದಿಗೆ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ದಾಂಪತ್ಯಕ್ಕೆ ರಕ್ಷಣೆ ಒದಗಿಸುತ್ತದೆ.",
    practicalGuidanceEn: "Offer prayers to Uma-Maheshwara on Fridays. Cultivate attentive listening to nurture mutual affection."
  };
};

const buildKarmaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house10Sign = getHouseRashi(lagnaRashiIdx, 10);
  const house10SignKn = getRashiKn(house10Sign);
  const house10SignEn = getRashiEn(house10Sign);
  const lord10 = signLord(house10Sign.index);
  const lord10Kn = getPlanetKn(lord10);
  const lord10En = getPlanetEn(lord10);
  const lord10Pos = getPlanet(kundli, lord10);
  const lord10Dignity = dignityMap.get(lord10);

  const occupants10 = getHouseOccupants(kundli, 10);
  const occupants10Kn = occupants10.length > 0 ? occupants10.map((p) => getPlanetKn(p.name)).join(", ") : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಖಾಲಿ ಕರ್ಮ ಭಾವ)";
  const occupants10En = occupants10.length > 0 ? occupants10.map((p) => getPlanetEn(p.name)).join(", ") : "No occupying planets";
  const aspects10 = getAspectingPlanets(kundli, 10);
  const aspects10Kn = aspects10.length > 0 ? aspects10.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ") : "ಯಾವುದೇ ನೇರ ದೃಷ್ಟಿ ಇಲ್ಲ";
  const lord10House = lord10Pos?.house ?? 10;

  return {
    stepIndex: 5,
    stepCode: "karma_bhava_career",
    titleKn: "ಹಂತ ೫: ೧೦ನೇ ಕೇಂದ್ರ - ಕರ್ಮ ಸ್ಥಾನ (ಆಜೀವಿಕ, ಉದ್ಯೋಗ, ಕೀರ್ತಿ & ಅಧಿಕಾರ)",
    titleEn: "Step 5: 10th House - Karma Bhava (Career, Livelihood & Public Status)",
    stageBadgeKn: "ಕೇಂದ್ರ ಪರೀಕ್ಷೆ • ಕರ್ಮ ಸ್ತಂಭ",
    stageBadgeEn: "Kendra Pillar • Professional Zenith",
    focusHouses: [10, lord10House],
    focusRashis: [house10Sign.index, lord10Pos ? lord10Pos.rashi.index : house10Sign.index],
    focusPlanets: [lord10, ...occupants10.map((p) => p.name)],

    whereToLookKn: {
      primaryHouseKn: `10ನೇ ಮನೆ (ಕರ್ಮ ಭಾವ) • ${house10SignKn} ರಾಶಿ (ಮಧ್ಯ ಲಗ್ನ)`,
      rashiAndLordKn: `ದಶಮಾಧಿಪತಿ: ${lord10Kn} • ಸ್ಥಿತಿ: ${lord10House}ನೇ ಮನೆಯಲ್ಲಿ`,
      occupyingGrahasKn: `10ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants10Kn}`,
      aspectingGrahasKn: `10ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವ ಗ್ರಹಗಳು: ${aspects10Kn}`,
      observationTipKn: "ಜಾತಕದ ಆಕಾಶದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಶಿಖರ 10ನೇ ಮನೆ. ಜಾತಕರು ಸ್ವಂತ ಉದ್ಯಮವೋ ಅಥವಾ ಸೇವಾವೃತ್ತಿಯೋ ಎಂಬುದನ್ನು 10ನೇ ಮನೆಯೇ ನಿರ್ಧರಿಸುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `10th House (Karma Bhava) • ${house10SignEn} Sign (Midheaven)`,
      rashiAndLordEn: `10th Lord: ${lord10En} • Resides in House ${lord10House}`,
      occupyingGrahasEn: `Planets in 10th House: ${occupants10En}`,
      aspectingGrahasEn: `Planets aspecting 10th House: ${aspects10Kn}`,
      observationTipEn: "The 10th house is the zenith of the chart. It determines career direction and authority."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಕರ್ಮಸ್ಥಾನಂ ಪ್ರವಕ್ಷ್ಯಾಮಿ ಕೀರ್ತಿಂ ವೃತ್ತಿಂ ಚ ಗೌರವಮ್ । ದಶಮೇಶೇ ಬಲೋಪೇತೇ ರಾಜಪೂಜ್ಯೋ ನ ಸಂಶಯಃ ॥",
      dignityKn: `ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10Dignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: "10ನೇ ಮನೆಯು ಸಮಾಜದ ಕರ್ಮಕ್ಷೇತ್ರವನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.",
      bulletPointsKn: [
        `10ನೇ ರಾಶಿ ${house10SignKn} ಜಾತಕರ ಕಾರ್ಯಶೈಲಿಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತದೆ.`,
        `ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ.`,
        occupants10.length > 0 ? `10ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants10Kn}.` : "ದಶಮಾಧಿಪತಿಯ ಬಲವೇ ಪ್ರಮುಖ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "10th house dictates livelihood, public respect, and honors.",
      dignityEn: `10th Lord ${lord10En} is placed in ${lord10Dignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: "Standard professional karma indications apply.",
      bulletPointsEn: [
        `10th sign ${house10SignEn} dictates suitable industries.`,
        `Placement of 10th Lord in House ${lord10House} links career success.`,
        `Occupants in 10th describe responsibilities.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ಜಾತಕರಿಗೆ ಸತತ ಪರಿಶ್ರಮದಿಂದ ಹಂತಹಂತವಾಗಿ ಉನ್ನತಿ ಹೊಂದುವ ಭಾಗ್ಯವಿದೆ.`,
      lifeDomainKn: "ವೃತ್ತಿ, ಆಜೀವಿಕ, ಸಾಮಾಜಿಕ ಕೀರ್ತಿ, ನಾಯಕತ್ವ.",
      keyInfluencesKn: [`10ನೇ ರಾಶಿ: ${house10SignKn}`, `ದಶಮಾಧಿಪತಿ: ${lord10Kn}`, `ಗ್ರಹಗಳು: ${occupants10Kn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 10th Lord sits in House ${lord10House}, livelihood is tied to consistent application.`,
      lifeDomainEn: "Career, Enterprise, Social Standing.",
      keyInfluencesEn: [`10th Sign: ${house10SignEn}`, `10th Lord: ${lord10En}`, `Occupants: ${occupants10En}`]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಉದ್ಯೋಗ ಕ್ಷೇತ್ರವನ್ನು ನೋಡಿದರೆ, 10ನೇ ಮನೆ ${house10SignKn} ಆಗಿದ್ದು, ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ಶಿಸ್ತು ಮತ್ತು ನಿಷ್ಠೆಯನ್ನು ಇಟ್ಟುಕೊಂಡರೆ ನಿಮಗೆ ಉನ್ನತ ಸ್ಥಾನ ಖಂಡಿತ ಸಿಗುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Looking at your career, your 10th house is ${house10SignEn}, ruled by ${lord10En} in House ${lord10House}. Combining discipline with focused execution will yield steady recognition.`,

    practicalGuidanceKn: "ಪ್ರತಿದಿನ ಸೂರ್ಯನಿಗೆ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಅರ್ಘ್ಯ ನೀಡುವುದು ಉದ್ಯೋಗದಲ್ಲಿ ಪ್ರಗತಿ ನೀಡುತ್ತದೆ.",
    practicalGuidanceEn: "Offer morning Surya Arghya in a copper vessel for steady career advancement."
  };
};

const buildTrikonaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house5Sign = getHouseRashi(lagnaRashiIdx, 5);
  const house9Sign = getHouseRashi(lagnaRashiIdx, 9);
  const lord5 = signLord(house5Sign.index);
  const lord9 = signLord(house9Sign.index);
  const lord5Kn = getPlanetKn(lord5);
  const lord9Kn = getPlanetKn(lord9);
  const lord5Pos = getPlanet(kundli, lord5);
  const lord9Pos = getPlanet(kundli, lord9);
  const occupants5 = getHouseOccupants(kundli, 5);
  const occupants9 = getHouseOccupants(kundli, 9);

  return {
    stepIndex: 6,
    stepCode: "trikona_poorva_punya_bhagya",
    titleKn: "ಹಂತ ೬: ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳು - ೫ನೇ (ಪೂರ್ವ ಪುಣ್ಯ) & ೯ನೇ (ಭಾಗ್ಯ ಸ್ಥಾನ)",
    titleEn: "Step 6: Trikona Houses - 5th & 9th (Poorva Punya & Divine Fortune)",
    stageBadgeKn: "ತ್ರಿಕೋಣ ಪರೀಕ್ಷೆ • ಲಕ್ಷ್ಮೀ ಕೃಪೆ",
    stageBadgeEn: "Trikona Blessings • Lakshmi Grace",
    focusHouses: [5, 9],
    focusRashis: [house5Sign.index, house9Sign.index],
    focusPlanets: [lord5, lord9],

    whereToLookKn: {
      primaryHouseKn: `5ನೇ ಮನೆ (${getRashiKn(house5Sign)}) & 9ನೇ ಮನೆ (${getRashiKn(house9Sign)})`,
      rashiAndLordKn: `ಪಂಚಮಾಧಿಪತಿ: ${lord5Kn} (${lord5Pos?.house}ನೇ ಮನೆ) • ಭಾಗ್ಯಾಧಿಪತಿ: ${lord9Kn} (${lord9Pos?.house}ನೇ ಮನೆ)`,
      occupyingGrahasKn: `5ನೇ ಮನೆಯಲ್ಲಿ: ${occupants5.map((p) => getPlanetKn(p.name)).join(", ") || "ಖಾಲಿ"} | 9ನೇ ಮನೆಯಲ್ಲಿ: ${occupants9.map((p) => getPlanetKn(p.name)).join(", ") || "ಖಾಲಿ"}`,
      aspectingGrahasKn: "ತ್ರಿಕೋಣಗಳು ಜಾತಕದ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚಗಳು.",
      observationTipKn: "ಜೀವನದಲ್ಲಿ ಎಷ್ಟೇ ಕಷ್ಟ ಬಂದರೂ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕಾಪಾಡುವ ದೈವಿಕ ಶಕ್ತಿಯೇ ತ್ರಿಕೋಣ."
    },
    whereToLookEn: {
      primaryHouseEn: `5th House (${getRashiEn(house5Sign)}) & 9th House (${getRashiEn(house9Sign)})`,
      rashiAndLordEn: `5th Lord: ${getPlanetEn(lord5)} • 9th Lord: ${getPlanetEn(lord9)}`,
      occupyingGrahasEn: `Planets in 5th: ${occupants5.map((p) => getPlanetEn(p.name)).join(", ") || "Empty"} | 9th: ${occupants9.map((p) => getPlanetEn(p.name)).join(", ") || "Empty"}`,
      aspectingGrahasEn: "Trikonas form the divine armor.",
      observationTipEn: "When life throws turbulence, it is the Trikonas that rescue the native."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಭಾಗ್ಯಸ್ಥಾನಂ ಶುಭಂ ಪ್ರಾಹುಃ ಪೂರ್ವಪುಣ್ಯಂ ಚ ಪಂಚಮಮ್ । ತ್ರಿಕೋಣಾಧೀಶ ಸಂಯೋಗೇ ರಾಜಯೋಗೋ ನ ಸಂಶಯಃ ॥",
      dignityKn: `ಪಂಚಮಾಧಿಪತಿ ${lord5Kn} ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿ ${lord9Kn}ರ ಬಲ ಶುಭಕರವಾಗಿದೆ.`,
      grahaRelationsKn: "ಕೇಂದ್ರ ಮತ್ತು ತ್ರಿಕೋಣಾಧಿಪತಿಗಳ ಸಂಬಂಧ ರಾಜಯೋಗ ನೀಡುತ್ತದೆ.",
      bulletPointsKn: [
        "5ನೇ ಮನೆ ಬುದ್ಧಿವಂತಿಕೆ ಮತ್ತು ಪೂರ್ವಜನ್ಮ ಪುಣ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        "9ನೇ ಮನೆ ದೇವರ ಕೃಪೆ ಮತ್ತು ತಂದೆಯ ಆಶೀರ್ವಾದವನ್ನು ನೀಡುತ್ತದೆ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Trikonas are Lakshmi Sthanas giving spontaneous breakthroughs.",
      dignityEn: "5th and 9th lords govern spiritual and fortune quotient.",
      grahaRelationsEn: "Kendra-Trikona synergies form premier Raja Yogas.",
      bulletPointsEn: [
        "5th house governs creative intelligence.",
        "9th house governs divine luck."
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `5ನೇ ಮತ್ತು 9ನೇ ಅಧಿಪತಿಗಳಾದ ${lord5Kn} ಮತ್ತು ${lord9Kn} ಉತ್ತಮ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ, ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ದೈವಿಕ ಸಹಾಯ ಸಕಾಲದಲ್ಲಿ ಸಿಗುತ್ತದೆ.`,
      lifeDomainKn: "ದೈವಬಲ, ಬುದ್ಧಿಮತ್ತೆ, ತಂದೆಯ ಪ್ರೀತಿ, ಗುರು ಕೃಪೆ.",
      keyInfluencesKn: [`5ನೇ ಅಧಿಪತಿ: ${lord5Kn}`, `9ನೇ ಅಧಿಪತಿ: ${lord9Kn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: "Because the 5th and 9th lords are positioned favorably, efforts are rewarded.",
      lifeDomainEn: "Divine Grace, Wisdom, Paternal Support.",
      keyInfluencesEn: [`5th Lord: ${getPlanetEn(lord5)}`, `9th Lord: ${getPlanetEn(lord9)}`]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪೂರ್ವ ಪುಣ್ಯ ಮತ್ತು ಭಾಗ್ಯ ಸ್ಥಾನಗಳು ಅನುಕೂಲಕರವಾಗಿವೆ. ಕಷ್ಟದ ಸಮಯದಲ್ಲೂ ಕೊನೆ ಗಳಿಗೆಯಲ್ಲಿ ಸಹಾಯ ಒದಗಿಬರುತ್ತದೆ. ತಂದೆ ಮತ್ತು ಗುರುಗಳನ್ನು ಸದಾ ಗೌರವಿಸಿ.`,
    spokenConsultationScriptEn: `Your past-life merit and fortune houses are well-placed. Timely support arrives during crises. Respect elders and mentors.`,

    practicalGuidanceKn: "ಪ್ರತಿದಿನ ಇಷ್ಟದೇವತಾ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ನಿಮ್ಮ ಭಾಗ್ಯೋದಯವನ್ನು ತ್ವರಿತಗೊಳಿಸುತ್ತದೆ.",
    practicalGuidanceEn: "Chant your Ishta Devata Stotra daily."
  };
};

const buildDusthanaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house6Sign = getHouseRashi(lagnaRashiIdx, 6);
  const house8Sign = getHouseRashi(lagnaRashiIdx, 8);
  const house12Sign = getHouseRashi(lagnaRashiIdx, 12);
  const lord6 = signLord(house6Sign.index);
  const lord8 = signLord(house8Sign.index);
  const lord12 = signLord(house12Sign.index);
  const maandi = kundli.maandi;
  const maandiRashiKn = maandi?.rashi ? getRashiKn(maandi.rashi) : "ಗೊತ್ತಿಲ್ಲ";

  return {
    stepIndex: 7,
    stepCode: "dusthana_maandi_karma",
    titleKn: "ಹಂತ ೭: ತ್ರಿಕ ಸ್ಥಾನಗಳು (೬, ೮, ೧೨) & ಮಾಂದಿ (ಕರ್ಮ ಗ್ರಂಥಿ - ಕಂಟಕ & ಸವಾಲುಗಳು)",
    titleEn: "Step 7: Dusthanas (6, 8, 12) & Maandi (Karmic Obstacles & Hurdles)",
    stageBadgeKn: "ಎಚ್ಚರಿಕೆ ಪರೀಕ್ಷೆ • ಕರ್ಮ ಶೋಧನೆ",
    stageBadgeEn: "Cautionary Audit • Karmic Nodes",
    focusHouses: [6, 8, 12],
    focusRashis: [house6Sign.index, house8Sign.index, house12Sign.index],
    focusPlanets: [lord6, lord8, lord12],

    whereToLookKn: {
      primaryHouseKn: "6ನೇ (ಋಣ-ರೋಗ), 8ನೇ (ಆಕಸ್ಮಿಕ ಸಂಕಟ), 12ನೇ (ವ್ಯಯ) ಸ್ಥಾನಗಳು",
      rashiAndLordKn: `6ನೇ: ${getPlanetKn(lord6)} • 8ನೇ: ${getPlanetKn(lord8)} • 12ನೇ: ${getPlanetKn(lord12)}`,
      occupyingGrahasKn: `ಮಾಂದಿ ಸ್ಥಿತಿ: ${maandiRashiKn} ರಾಶಿಯಲ್ಲಿ`,
      aspectingGrahasKn: "ದುಷ್ಟಾನಗಳ ಅಧಿಪತಿಗಳ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಬೇಕು.",
      observationTipKn: "ಕೆಲಸಗಳು 99% ತಲುಪಿ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ನಿಲ್ಲಲು ಮಾಂದಿ ಮತ್ತು ದುಷ್ಟಾನಗಳೇ ಕಾರಣ."
    },
    whereToLookEn: {
      primaryHouseEn: "6th (Debts), 8th (Sudden Obstacles), 12th (Expenses)",
      rashiAndLordEn: `Lords: 6th (${getPlanetEn(lord6)}), 8th (${getPlanetEn(lord8)}), 12th (${getPlanetEn(lord12)})`,
      occupyingGrahasEn: `Maandi in ${maandi?.rashi ? getRashiEn(maandi.rashi) : "Unknown"}`,
      aspectingGrahasEn: "Scrutinize Dusthana placements.",
      observationTipEn: "Maandi causes 99% task hurdles."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಷಷ್ಠಾಷ್ಟಮ ವ್ಯಯಸ್ಥಾನೇ ಪಾಪಗ್ರಹ ಸಮನ್ವಿತೇ । ರೋಗ ಶತ್ರು ಋಣಂ ಚೈವ ಮಾಂದೇಸ್ತು ಸರ್ವವಿಘ್ನಕೃತ್ ॥",
      dignityKn: "ದುಷ್ಟಾನಾಧಿಪತಿಗಳ ಬಲ ಪರೀಕ್ಷೆ ಮುಖ್ಯ.",
      grahaRelationsKn: "ಮಾಂದಿಯು ಶನಿಯ ಉಪಗ್ರಹವಾಗಿದ್ದು ಕರ್ಮ ಗ್ರಂಥಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
      bulletPointsKn: [
        "6ನೇ ಮನೆ ರೋಗ ಮತ್ತು ಸಾಲವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.",
        "ಮಾಂದಿ ಕುಳಿತ ಮನೆಯಲ್ಲಿ ಕೊನೆಯ ಕ್ಷಣದ ಅಡೆತಡೆಗಳು ಉಂಟಾಗುತ್ತವೆ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Houses 6, 8, 12 test resilience. Maandi marks unfinished karma.",
      dignityEn: "Examine Dusthana relationships.",
      grahaRelationsEn: "Maandi is the subtle satellite of Saturn.",
      bulletPointsEn: [
        "6th house tests financial discipline.",
        "Maandi brings eleventh-hour delays."
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: "ಆರ್ಥಿಕ ಹೂಡಿಕೆ ಅಥವಾ ಸಾಲ ಕೊಡುವ ವಿಚಾರದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಅನಿವಾರ್ಯ.",
      lifeDomainKn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ಸಾಲ ನಿವಾರಣೆ, ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು.",
      keyInfluencesKn: [`6ನೇ ಅಧಿಪತಿ: ${getPlanetKn(lord6)}`, `ಮಾಂದಿ ರಾಶಿ: ${maandiRashiKn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: "Financial prudence and health vigilance are essential.",
      lifeDomainEn: "Health Precaution, Debt Prevention.",
      keyInfluencesEn: [`6th Lord: ${getPlanetEn(lord6)}`, `Maandi: ${maandiRashiKn}`]
    },

    spokenConsultationScriptKn: "ಯಾರಿಗೂ ಆತುರದಲ್ಲಿ ಸಾಲ ಕೊಡಬೇಡಿ ಅಥವಾ ಜಾಮೀನು ನಿಲ್ಲಬೇಡಿ. ಕೆಲಸಗಳು 99% ತಲುಪಿದಾಗ ಯಾರೊಂದಿಗೂ ಅತಿಯಾಗಿ ಪ್ರಚಾರ ಮಾಡದೆ ಶಾಂತರಾಗಿರಿ. ದೈವಿಕ ಸಂಕಲ್ಪದಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
    spokenConsultationScriptEn: "Avoid standing surety for loans. When ventures reach 99%, maintain discretion until finished. Prayers dissolve friction.",

    practicalGuidanceKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಪೂಜೆ ಅಥವಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಮಾಡಿಸುವುದರಿಂದ ಮಾಂದಿಯ ಕಂಟಕ ಶಮನಗೊಳ್ಳುತ್ತದೆ.",
    practicalGuidanceEn: "Perform Mahamrityunjaya Japa or Gokarna Atma Linga Abhisheka."
  };
};

const buildDignityMatrixStep = (kundli: KundliOutput, dignityList: PlanetaryDignityDetail[]): GurukulaStep => {
  const ucchaGrahas = dignityList.filter((d) => d.dignityType === "uccha");
  const swakshetraGrahas = dignityList.filter((d) => d.dignityType === "swakshetra");
  const neechaGrahas = dignityList.filter((d) => d.dignityType === "neecha");
  const shatruGrahas = dignityList.filter((d) => d.dignityType === "shatru");

  const ucchaKn = ucchaGrahas.length > 0 ? ucchaGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";
  const swakshetraKn = swakshetraGrahas.length > 0 ? swakshetraGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";
  const neechaKn = neechaGrahas.length > 0 ? neechaGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";
  const shatruKn = shatruGrahas.length > 0 ? shatruGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";

  return {
    stepIndex: 8,
    stepCode: "planetary_dignity_matrix",
    titleKn: "ಹಂತ ೮: ಗ್ರಹ ಮೈತ್ರಿ, ಉಚ್ಚ-ನೀಚ & ಶತ್ರು-ಮಿತ್ರ ಚಕ್ರ (ಪೂರ್ಣ ಗ್ರಹ ಬಲಾಬಲ)",
    titleEn: "Step 8: Planetary Dignity & Friendship Matrix (Exaltation, Own & Enemy Signs)",
    stageBadgeKn: "ಬಲಾಬಲ ಪರೀಕ್ಷೆ • ತಾಂತ್ರಿಕ ಸೂಕ್ಷ್ಮತೆ",
    stageBadgeEn: "Dignity Matrix • Technical Deep-Dive",
    focusHouses: dignityList.map((d) => d.house),
    focusRashis: dignityList.map((d) => d.rashi.index),
    focusPlanets: dignityList.map((d) => d.planet),

    whereToLookKn: {
      primaryHouseKn: "ಸಮಗ್ರ 9 ಗ್ರಹಗಳ ಸ್ಥಿತಿ: ಸೂರ್ಯ, ಚಂದ್ರ, ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ, ರಾಹು, ಕೇತು",
      rashiAndLordKn: `ಉಚ್ಚ ಗ್ರಹಗಳು: ${ucchaKn} • ಸ್ವಕ್ಷೇತ್ರ: ${swakshetraKn}`,
      occupyingGrahasKn: `ನೀಚ ಗ್ರಹಗಳು: ${neechaKn} • ಶತ್ರು ಕ್ಷೇತ್ರಸ್ಥ ಗ್ರಹಗಳು: ${shatruKn}`,
      aspectingGrahasKn: "ಪ್ರತಿಯೊಂದು ಗ್ರಹದ ಸ್ವಾಭಾವಿಕ ಮೈತ್ರಿಯನ್ನು ಗಮನಿಸಬೇಕು.",
      observationTipKn: "ಉಚ್ಚ ಅಥವಾ ಮಿತ್ರ ಮನೆಯಲ್ಲಿದ್ದರೆ ಸುಲಭವಾಗಿ ಶುಭ ಫಲ ನೀಡುತ್ತದೆ; ಶತ್ರು ಮನೆಯಲ್ಲಿದ್ದರೆ ತಾಳ್ಮೆ ಪರೀಕ್ಷಿಸುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: "All 9 Grahas",
      rashiAndLordEn: `Exalted: ${ucchaGrahas.map((g) => g.planetEn).join(", ") || "None"} • Own: ${swakshetraGrahas.map((g) => g.planetEn).join(", ") || "None"}`,
      occupyingGrahasEn: `Debilitated: ${neechaGrahas.map((g) => g.planetEn).join(", ") || "None"}`,
      aspectingGrahasEn: "Examine dispositor relations.",
      observationTipEn: "Planetary dignity determines how smoothly fruits are delivered."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಉಚ್ಚೇ ಪೂರ್ಣಫಲಂ ಪ್ರೋಕ್ತಂ ಮಿತ್ರೇ ಪಾದತ್ರಯಂ ಭವೇತ್ । ಸಮೇರ್ಧಂ ಶತ್ರುಭೇ ಪಾದಂ ನೀಚೇ ಶೂನ್ಯಂ ವಿನಿರ್ದಿಶೇತ್ ॥",
      dignityKn: "ಉಚ್ಚ ಗ್ರಹ 100% ಬಲ, ಸ್ವಕ್ಷೇತ್ರ/ಮಿತ್ರ 75% ಬಲ, ಶತ್ರು 25% ಬಲ.",
      grahaRelationsKn: "ಪರಾಶರ ಮೈತ್ರಿ ನಿಯಮಗಳ ಪ್ರಕಾರ ಲೆಕ್ಕಾಚಾರ.",
      bulletPointsKn: [
        ucchaGrahas.length > 0 ? `ಉಚ್ಚ ಗ್ರಹಗಳು: ${ucchaKn}` : "ಉಚ್ಚ ಗ್ರಹಗಳಿಲ್ಲದಿದ್ದರೂ ಸಮತೋಲನವಿದೆ.",
        swakshetraGrahas.length > 0 ? `ಸ್ವಕ್ಷೇತ್ರ ಗ್ರಹಗಳು: ${swakshetraKn}` : "ಸ್ವಕ್ಷೇತ್ರ ಬಲ ಮಧ್ಯಮ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Exalted planets yield 100% fruit; enemy signs test endurance.",
      dignityEn: "Strength calibrated using Parashari friendship rules.",
      grahaRelationsEn: "Dispositor relations determine operating friction.",
      bulletPointsEn: [
        `Exalted: ${ucchaGrahas.length}`,
        `Own: ${swakshetraGrahas.length}`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: "ಬಲಶಾಲಿ ಗ್ರಹಗಳ ಕಾರಕತ್ವದಲ್ಲಿ ಜಾತಕರಿಗೆ ಸ್ವಾಭಾವಿಕ ಜಯ ಸಿಗುತ್ತದೆ.",
      lifeDomainKn: "ಸಮಗ್ರ ಗ್ರಹ ಶಕ್ತಿ, ಆತ್ಮವಿಶ್ವಾಸ, ಪ್ರತಿಭೆ.",
      keyInfluencesKn: [`ಉಚ್ಚ ಗ್ರಹಗಳು: ${ucchaKn}`, `ಸ್ವಕ್ಷೇತ್ರ ಗ್ರಹಗಳು: ${swakshetraKn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: "Planetary dignity dictates the efficiency of delivery.",
      lifeDomainEn: "Overall Vitality, Talents.",
      keyInfluencesEn: [`Exalted: ${ucchaKn}`, `Own: ${swakshetraKn}`]
    },

    spokenConsultationScriptKn: "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅನುಕೂಲಕರವಾದ ಗ್ರಹಗಳು ನಿಮ್ಮ ಬೆಂಬಲಕ್ಕೆ ನಿಂತಿವೆ. ಶತ್ರು ಸ್ಥಾನದಲ್ಲಿರುವ ಗ್ರಹಗಳ ದಶಾ ಕಾಲದಲ್ಲಿ ಸಂಯಮದಿಂದ ನಡೆದರೆ ಅಪಜಯವಿಲ್ಲ.",
    spokenConsultationScriptEn: "Supportive planets stand by you. When running challenging periods, patience is key.",

    practicalGuidanceKn: "ಶತ್ರು ಸ್ಥಾನದಲ್ಲಿರುವ ಗ್ರಹಗಳಿಗೆ ಆಯಾ ಗ್ರಹದ ದಾನ ಅಥವಾ ಜಪ ಮಾಡುವುದು ಶ್ರೇಷ್ಠ.",
    practicalGuidanceEn: "Propitiate enemy-sign planets with designated charities."
  };
};

const buildYogasStep = (kundli: KundliOutput): GurukulaStep => {
  const yogas: string[] = [];
  const yogasEn: string[] = [];
  const doshas: string[] = [];
  const doshasEn: string[] = [];

  const sun = getPlanet(kundli, PlanetName.Sun);
  const moon = getPlanet(kundli, PlanetName.Moon);
  const mars = getPlanet(kundli, PlanetName.Mars);
  const mer = getPlanet(kundli, PlanetName.Mercury);
  const jup = getPlanet(kundli, PlanetName.Jupiter);
  const rahu = getPlanet(kundli, PlanetName.Rahu);

  if (moon && jup) {
    const dist = (jup.house - moon.house + 12) % 12;
    if (dist === 0 || dist === 3 || dist === 6 || dist === 9) {
      yogas.push("ಗಜಕೇಸರಿ ಯೋಗ (ಚಂದ್ರ-ಗುರು ಕೇಂದ್ರ ಸಂಬಂಧ)");
      yogasEn.push("Gajakesari Yoga (Jupiter in Kendra from Moon)");
    }
  }

  if (sun && mer && sun.rashi.index === mer.rashi.index) {
    yogas.push("ಬುಧಾದಿತ್ಯ ಯೋಗ (ಸೂರ್ಯ-ಬುಧ ಸಂಯೋಗ)");
    yogasEn.push("Budhaditya Yoga (Sun-Mercury conjunction)");
  }

  if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) {
    doshas.push(`ಕುಜ ದೋಷ (${mars.house}ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ)`);
    doshasEn.push(`Kuja Dosha (Mars in House ${mars.house})`);
  }

  if (jup && rahu && jup.rashi.index === rahu.rashi.index) {
    doshas.push("ಗುರು ಚಂಡಾಲ ಯೋಗ (ಗುರು-ರಾಹು ಯುತಿ)");
    doshasEn.push("Guru Chandala Yoga (Jupiter-Rahu conjunction)");
  }

  if (yogas.length === 0) {
    yogas.push("ಸಾಧಾರಣ ಶುಭ ಯೋಗಗಳು");
    yogasEn.push("Balanced planetary combinations");
  }

  return {
    stepIndex: 9,
    stepCode: "yogas_and_doshas",
    titleKn: "ಹಂತ ೯: ಪ್ರಮುಖ ಯೋಗಗಳು & ಜಾತಕ ದೋಷಗಳು (ಯೋಗಗಳ ಫಲ)",
    titleEn: "Step 9: Yogas & Afflictions (Planetary Combinations in this Chart)",
    stageBadgeKn: "ವಿಶೇಷ ಯೋಗ ಪರೀಕ್ಷೆ • ಕರ್ಮ ಫಲ",
    stageBadgeEn: "Yoga Combinations • Karmic Blessings",
    focusHouses: [1, 4, 7, 10, 5, 9],
    focusRashis: [kundli.lagnaRashi.index, kundli.moonSign.index],
    focusPlanets: [PlanetName.Jupiter, PlanetName.Moon, PlanetName.Sun, PlanetName.Mercury],

    whereToLookKn: {
      primaryHouseKn: `ಶುಭ ಯೋಗಗಳು: ${yogas.length} | ದೋಷಗಳು: ${doshas.length}`,
      rashiAndLordKn: `ಶುಭ ಯೋಗಗಳು: ${yogas.join(" • ")}`,
      occupyingGrahasKn: `ದೋಷಗಳು: ${doshas.length > 0 ? doshas.join(" • ") : "ಯಾವುದೇ ಗಂಭೀರ ದೋಷಗಳಿಲ್ಲ"}`,
      aspectingGrahasKn: "ಯೋಗಗಳು ಗ್ರಹಗಳ ಸಂಯೋಗದಿಂದ ಉದ್ಭವಿಸುತ್ತವೆ.",
      observationTipKn: "ಯೋಗಗಳೇ ಮನುಷ್ಯನನ್ನು ಸಾಮಾನ್ಯನಿಂದ ಅಸಾಮಾನ್ಯನನ್ನಾಗಿ ಮಾಡುತ್ತವೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `Benefic Yogas: ${yogasEn.length} | Doshas: ${doshasEn.length}`,
      rashiAndLordEn: `Yogas: ${yogasEn.join(" • ")}`,
      occupyingGrahasEn: `Doshas: ${doshasEn.length > 0 ? doshasEn.join(" • ") : "None"}`,
      aspectingGrahasEn: "Yogas arise from conjunctions and Kendra angles.",
      observationTipEn: "Yogas act as force multipliers."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಯೋಗಾಃ ಕುಂಡಲಿ ಸಾರಂ ಚ ದೋಷಾಃ ಪರಿಹಾರಮೇವ ಚ । ಶುಭಯೋಗೇ ಸಮುತ್ಪನ್ನೋ ರಾಜತೇ ಭುವಿ ಮಾನವಃ ॥",
      dignityKn: "ಶುಭ ಯೋಗಗಳು ಜಾತಕದ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.",
      grahaRelationsKn: "ಯೋಗಕಾರಕ ಗ್ರಹಗಳ ದಶಾ ಕಾಲದಲ್ಲಿ ಪೂರ್ಣ ಫಲ.",
      bulletPointsKn: [...yogas.map((y) => `✨ ${y}`), ...doshas.map((d) => `⚠️ ${d}`)]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Yogas are catalytic combinations.",
      dignityEn: "Planetary yogas flower in their respective Dashas.",
      grahaRelationsEn: "Kendra-Trikona combinations act as catalysts.",
      bulletPointsEn: [...yogasEn.map((y) => `✨ ${y}`), ...doshasEn.map((d) => `⚠️ ${d}`)]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಜಾತಕದಲ್ಲಿ ${yogas[0]} ಇರುವುದರಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಮತ್ತು ಬುದ್ಧಿಮತ್ತೆ ಒಲಿಯುತ್ತದೆ.`,
      lifeDomainKn: "ಕೀರ್ತಿ, ನಾಯಕತ್ವ, ಬುದ್ಧಿಮತ್ತೆ.",
      keyInfluencesKn: yogas
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Due to ${yogasEn[0]}, the native commands respect.`,
      lifeDomainEn: "Public Prestige, Intellect.",
      keyInfluencesEn: yogasEn
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${yogas[0]} ರೂಪುಗೊಂಡಿದೆ. ನಿಮ್ಮ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಸರಿಯಾದ ದಿಕ್ಕಿನಲ್ಲಿ ಬಳಸಿದರೆ ಮಹತ್ತರ ಸಾಧನೆ ಸಾಧ್ಯ.`,
    spokenConsultationScriptEn: `Your chart carries ${yogasEn[0]}. Channelling your abilities productively yields lasting success.`,

    practicalGuidanceKn: "ವಿದ್ಯಾ ದಾನ ಅಥವಾ ಸಮಾಜಮುಖಿ ಧರ್ಮ ಕಾರ್ಯಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.",
    practicalGuidanceEn: "Engage in educational or charitable service."
  };
};

const buildDashaTimingStep = (
  kundli: KundliOutput,
  birthDate?: string,
  birthTime?: string,
  dignityMap?: Map<PlanetName, PlanetaryDignityDetail>
): GurukulaStep => {
  let currentAge = 30;
  if (birthDate && birthTime) {
    try {
      currentAge = ageDecimalYearsAt(birthDate, birthTime, 14.54, 74.31, new Date());
    } catch {
      currentAge = 30;
    }
  }

  const bhuktiInfo = findBhuktiAtAge(kundli, currentAge);
  const mahaLord = bhuktiInfo?.maha.planet || PlanetName.Jupiter;
  const bhuktiLord = bhuktiInfo?.bhukti || PlanetName.Saturn;
  const mahaLordKn = getPlanetKn(mahaLord);
  const bhuktiLordKn = getPlanetKn(bhuktiLord);
  const mahaPos = getPlanet(kundli, mahaLord);
  const bhuktiPos = getPlanet(kundli, bhuktiLord);
  const mahaHouse = mahaPos?.house ?? 1;
  const bhuktiHouse = bhuktiPos?.house ?? 1;

  const relDist = ((bhuktiHouse - mahaHouse + 12) % 12) + 1;
  const relToneKn = relDist === 6 || relDist === 8 ? "ಷಡಾಷ್ಟಕ ಸಂಬಂಧ (ಸಂಯಮ ಅಗತ್ಯ)" : "ಅನುಕೂಲಕರ ಸಂಬಂಧ";

  return {
    stepIndex: 10,
    stepCode: "vimshottari_dasha_timing",
    titleKn: "ಹಂತ ೧೦: ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಚಕ್ರ (ಸಮಯ ನಿರ್ಣಯ - ಪ್ರಸ್ತುತ ದಶಾ & ಭುಕ್ತಿ)",
    titleEn: "Step 10: Vimshottari Dasha (Event Timing & Turning Points)",
    stageBadgeKn: "ಸಮಯ ನಿರ್ಣಯ • ಕಾಲಚಕ್ರ",
    stageBadgeEn: "Timing Mastery • Vimshottari Engine",
    focusHouses: [mahaHouse, bhuktiHouse],
    focusRashis: [mahaPos?.rashi.index ?? 0, bhuktiPos?.rashi.index ?? 0],
    focusPlanets: [mahaLord, bhuktiLord],

    whereToLookKn: {
      primaryHouseKn: `ಮಹಾದಶಾ: ${mahaLordKn} (${mahaHouse}ನೇ ಮನೆ) • ಭುಕ್ತಿ: ${bhuktiLordKn} (${bhuktiHouse}ನೇ ಮನೆ)`,
      rashiAndLordKn: `ಪ್ರಸ್ತುತ ವಯಸ್ಸು: ${currentAge.toFixed(1)} ವರ್ಷಗಳು`,
      occupyingGrahasKn: `ಪರಸ್ಪರ ಸಂಬಂಧ: ${relDist}ನೇ ಮನೆ (${relToneKn})`,
      aspectingGrahasKn: "ದಶಾನಾಥನು ವಾತಾವರಣ ಸೃಷ್ಟಿಸಿದರೆ, ಭುಕ್ತಿನಾಥನು ಘಟನೆಗಳನ್ನು ನಡೆಸುತ್ತಾನೆ.",
      observationTipKn: "ದಶಾ ಕಾಲ ಬರದ ಹೊರತು ಫಲ ಸಿಗುವುದಿಲ್ಲ. 'ಯಾವಾಗ ನಡೆಯುತ್ತದೆ?' ಎಂದು ಹೇಳುವುದೇ ದಶೆಯ ಕೆಲಸ."
    },
    whereToLookEn: {
      primaryHouseEn: `Mahadasha: ${getPlanetEn(mahaLord)} (H${mahaHouse}) • Bhukti: ${getPlanetEn(bhuktiLord)} (H${bhuktiHouse})`,
      rashiAndLordEn: `Age: ~${currentAge.toFixed(1)} yrs`,
      occupyingGrahasEn: `Angle: ${relDist}th house`,
      aspectingGrahasEn: "Dasha sets the stage; Bhukti triggers the events.",
      observationTipEn: "Dasha timing answers 'When will it happen?'"
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ದಶಾ ನಾಯಕ ಫಲಂ ದದ್ಯಾತ್ ಅಂತರ್ದಶಾ ವಿಶೇಷತಃ । ದಶಾಧಿಪೇ ಶುಭೇ ಯುಕ್ತೇ ರಾಜಸನ್ಮಾನ ಕೀರ್ತಿದಃ ॥",
      dignityKn: `ಮಹಾದಶಾನಾಥ ${mahaLordKn} ಮತ್ತು ಭುಕ್ತಿನಾಥ ${bhuktiLordKn}ರ ಸ್ಥಿತಿ.`,
      grahaRelationsKn: `ದಶಾ-ಭುಕ್ತಿ ಕೋನ: ${relToneKn}.`,
      bulletPointsKn: [
        `ಮಹಾದಶಾನಾಥ ${mahaLordKn} ಪ್ರಧಾನ ಕಾಲಘಟ್ಟ ನಿರ್ದೇಶಿಸುತ್ತಾನೆ.`,
        `ಅಂತರ್ದಶಾನಾಥ ${bhuktiLordKn} ಪ್ರಸ್ತುತ ದೈನಂದಿನ ಅನುಭವಗಳನ್ನು ನೀಡುತ್ತಾನೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Mahadasha establishes macro themes; Antardasha brings tangible events.",
      dignityEn: "Dignity of dasha lords governs results.",
      grahaRelationsEn: "Mutual relationship governs smooth execution.",
      bulletPointsEn: [
        "Mahadasha rules the life chapter.",
        "Antardasha drives immediate developments."
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಪ್ರಸ್ತುತ ${mahaLordKn}-${bhuktiLordKn} ದಶಾ ಕಾಲಾವಧಿಯು ಜಾತಕರಿಗೆ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಮತ್ತು ಸವಾಲುಗಳನ್ನು ನೀಡುತ್ತದೆ.`,
      lifeDomainKn: "ಪ್ರಸ್ತುತ ಜೀವನ ಘಟ್ಟ, ತಿರುವುಗಳು.",
      keyInfluencesKn: [`ಮಹಾದಶಾ: ${mahaLordKn}`, `ಅಂತರ್ದಶಾ: ${bhuktiLordKn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: "Current cycle channels the energies of the ruling lords.",
      lifeDomainEn: "Current Chapter, Opportunities.",
      keyInfluencesEn: [`Maha: ${getPlanetEn(mahaLord)}`, `Bhukti: ${getPlanetEn(bhuktiLord)}`]
    },

    spokenConsultationScriptKn: `ಪ್ರಸ್ತುತ ನಿಮಗೆ ${mahaLordKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ. ಕರ್ತವ್ಯವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮಾಡಿ, ಕಾಲವೇ ನಿಮಗೆ ಒಲಿಯಲಿದೆ.`,
    spokenConsultationScriptEn: `You are running ${getPlanetEn(mahaLord)} Mahadasha with ${getPlanetEn(bhuktiLord)} Bhukti. Diligent focus brings steady rewards.`,

    practicalGuidanceKn: "ಪ್ರಸ್ತುತ ದಶಾನಾಥರ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.",
    practicalGuidanceEn: "Offer prayers to the ruling Dasha planets."
  };
};

const buildDaivajnaSynthesisStep = (kundli: KundliOutput, nativeName = "ಜಾತಕರು"): GurukulaStep => {
  const lagnaRashiKn = getRashiKn(kundli.lagnaRashi);
  const moonRashiKn = getRashiKn(kundli.moonSign);
  const lagnaLordKn = getPlanetKn(signLord(kundli.lagnaRashi.index));

  return {
    stepIndex: 11,
    stepCode: "daivajna_synthesis_remedies",
    titleKn: "ಹಂತ ೧೧: ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸೂತ್ರ (ಸಮಗ್ರ ಸಾರಾಂಶ & ಪರಿಹಾರ ಸೂತ್ರ)",
    titleEn: "Step 11: The Astrologer's Master Synthesis (How to Counsel & Prescribe)",
    stageBadgeKn: "ಉನ್ನತ ಹಂತ • ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ",
    stageBadgeEn: "Masterclass Zenith • Priest Consultation",
    focusHouses: [1, 4, 7, 10, 5, 9],
    focusRashis: [kundli.lagnaRashi.index, kundli.moonSign.index],
    focusPlanets: [signLord(kundli.lagnaRashi.index), PlanetName.Moon, PlanetName.Jupiter],

    whereToLookKn: {
      primaryHouseKn: `ಲಗ್ನ (${lagnaRashiKn}) + ರಾಶಿ (${moonRashiKn}) + ಕರ್ಮ (10ನೇ ಮನೆ) + ದಶಾ ಕಾಲಚಕ್ರ`,
      rashiAndLordKn: "ದೈವಜ್ಞನ ಚತುಸ್ಸಂಕಲ್ಪ: ಭಯ ನಿವಾರಣೆ, ಕರ್ಮ ಶುದ್ಧಿ, ಆತ್ಮವಿಶ್ವಾಸ, ದೈವಿಕ ಪರಿಹಾರ.",
      occupyingGrahasKn: "ಜಾತಕರಿಗೆ ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡಿ ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಸುವುದು.",
      aspectingGrahasKn: "ಜ್ಯೋತಿಷ್ಯವು ದೈವಿಕ ಬೆಳಕು (ಜ್ಯೋತಿ).",
      observationTipKn: "ಭಕ್ತರಿಗೆ ಮಮತೆ ಮತ್ತು ಧೈರ್ಯದಿಂದ ಸಮಾಲೋಚನೆ ನೀಡಿ."
    },
    whereToLookEn: {
      primaryHouseEn: `Synthesis: Lagna (${getRashiEn(kundli.lagnaRashi)}) + Moon (${getRashiEn(kundli.moonSign)}) + Career (10th)`,
      rashiAndLordEn: "Golden Creed: Dispelling fear, root karmic insight, confidence, remedies.",
      occupyingGrahasEn: "Astrology provides guidance and peace.",
      aspectingGrahasEn: "Holistic integration of body, mind, and spirit.",
      observationTipEn: "Counsel with reverence and empathy."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಶಾಂತಂ ದಂತಂ ಶುಚಿಂ ದಕ್ಷಂ ಜ್ಯೋತಿಃಶಾಸ್ತ್ರ ವಿಶಾರದಮ್ । ದೈವಜ್ಞಂ ತಂ ವಿಜಾನೀಯಾತ್ ಸರ್ವಲೋಕ ಹಿತೈಷಿಣಮ್ ॥",
      dignityKn: "ದೈವಜ್ಞನ ಮಾತು ಭಕ್ತರ ಪಾಲಿಗೆ ಔಷಧಿಯಂತಿರಬೇಕು.",
      grahaRelationsKn: "ಲಗ್ನಾಧಿಪತಿ ಮತ್ತು ಚಂದ್ರನ ಬಲವರ್ಧನೆಯೇ ಪರಿಹಾರದ ಗುಟ್ಟು.",
      bulletPointsKn: [
        "ಭಯ ಹುಟ್ಟಿಸದೆ ಧೈರ್ಯ ತುಂಬುವುದು ದೈವಜ್ಞನ ಪ್ರಥಮ ಕರ್ತವ್ಯ.",
        "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಶ್ರೇಷ್ಠ ಪರಿಹಾರ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "A true Daivajna is calm, empathetic, and dedicated to spiritual welfare.",
      dignityEn: "Words must heal, not paralyze.",
      grahaRelationsEn: "Strengthening Lagna Lord and Moon is key.",
      bulletPointsEn: [
        "Never create superstitious dread.",
        "Prescribe Sattvic remedies like Gokarna Puja."
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಜಾತಕದಲ್ಲಿ ${lagnaLordKn}ನ ಅನುಗ್ರಹ ಮತ್ತು ಶಿವನ ಕೃಪೆಯಿಂದ ಸಕಲ ಅಡೆತಡೆಗಳೂ ಹರಿದು ಶುಭ ಫಲಗಳು ಪ್ರಾಪ್ತಿಯಾಗುತ್ತವೆ.`,
      lifeDomainKn: "ಸಮಗ್ರ ಜೀವನ ಕಲ್ಯಾಣ, ಮನಃಶಾಂತಿ, ದೈವಿಕ ರಕ್ಷಣೆ.",
      keyInfluencesKn: [`ಲಗ್ನ: ${lagnaRashiKn}`, `ರಾಶಿ: ${moonRashiKn}`]
    },
    whyThisResultEn: {
      astrologicalLogicEn: "Harmonizing the Lagna Lord and Moon brings holistic tranquility.",
      lifeDomainEn: "Holistic Peace, Spiritual Protection.",
      keyInfluencesEn: [`Lagna: ${getRashiEn(kundli.lagnaRashi)}`, `Moon: ${getRashiEn(kundli.moonSign)}`]
    },

    spokenConsultationScriptKn: `ಆತ್ಮೀಯ ${nativeName}ನವರೇ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅಪಾರ ಪ್ರತಿಭೆ ಮತ್ತು ದೈವಬಲವಿದೆ. ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯಾದ ${lagnaLordKn} ನಿಮ್ಮ ಬೆನ್ನಿಗಿದ್ದಾರೆ. ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ಮಾಡಿ, ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಸದಾ ಶಾಂತಿ ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ರಕ್ಷಣೆ ಸಿಗಲಿದೆ. ಧೈರ್ಯವಾಗಿ ಮುನ್ನುಗ್ಗಿ.`,
    spokenConsultationScriptEn: `Dear ${nativeName}, you carry genuine talents and divine protection. Your Lagna Lord stands firmly behind you. Have faith; perform a sincere Sankalpa Seva at Gokarna Mahabaleshwara Temple and step forward with courage.`,

    practicalGuidanceKn: "ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಜಲಾಭಿಷೇಕ ಮತ್ತು ದಿನನಿತ್ಯ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು ಈ ಜಾತಕಕ್ಕೆ ಪರಮೌಷಧ.",
    practicalGuidanceEn: "Gokarna Mahabaleshwara Atma Linga Abhisheka and elders' blessings act as an invincible shield."
  };
};

// ---------------------------------------------------------
// QUESTION & ANSWER 3-PILLAR ENGINE (Kundli + Dasha + Gochara)
// ---------------------------------------------------------

export function calculateGurukulaQuestions(
  kundli: KundliOutput,
  gochara: LiveGocharaSnapshot,
  dignityMap: Map<PlanetName, PlanetaryDignityDetail>,
  currentAgeYears = 30
): GurukulaQuestionAnswer[] {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const bhuktiInfo = findBhuktiAtAge(kundli, currentAgeYears);
  const mahaLord = bhuktiInfo?.maha.planet || PlanetName.Jupiter;
  const bhuktiLord = bhuktiInfo?.bhukti || PlanetName.Saturn;
  const mahaLordKn = getPlanetKn(mahaLord);
  const bhuktiLordKn = getPlanetKn(bhuktiLord);

  // 1. Career promotion & job change
  const house10Lord = getHouseLord(lagnaRashiIdx, 10);
  const house10LordKn = getPlanetKn(house10Lord);
  const house10Occupants = getHouseOccupants(kundli, 10);
  const house10OccKn = house10Occupants.map((p) => getPlanetKn(p.name)).join(", ") || "ಖಾಲಿ";
  const careerDashaConnected = [house10Lord, PlanetName.Sun, PlanetName.Saturn, PlanetName.Mars].includes(mahaLord) || [house10Lord, PlanetName.Sun, PlanetName.Saturn, PlanetName.Mars].includes(bhuktiLord);

  // 2. Business vs Job
  const house7Lord = getHouseLord(lagnaRashiIdx, 7);
  const house7LordKn = getPlanetKn(house7Lord);
  const mercury = getPlanet(kundli, PlanetName.Mercury);
  const mercuryDignity = dignityMap.get(PlanetName.Mercury);
  const suitsBusiness = mercuryDignity?.dignityType === "uccha" || mercuryDignity?.dignityType === "swakshetra" || [2, 7, 10, 11].includes(mercury?.house ?? 0);

  // 3. Marriage timing & Kalatra
  const venus = getPlanet(kundli, PlanetName.Venus);
  const marriageDashaConnected = [house7Lord, PlanetName.Venus, PlanetName.Jupiter].includes(mahaLord) || [house7Lord, PlanetName.Venus, PlanetName.Jupiter].includes(bhuktiLord);

  // 4. Marital Friction
  const mars = getPlanet(kundli, PlanetName.Mars);
  const hasKujaInfluence = mars && [1, 2, 4, 7, 8, 12].includes(mars.house);

  // 5. Debt & Loan Relief
  const house6Lord = getHouseLord(lagnaRashiIdx, 6);
  const house6LordKn = getPlanetKn(house6Lord);
  const house11Lord = getHouseLord(lagnaRashiIdx, 11);
  const house11LordKn = getPlanetKn(house11Lord);

  // 6. Property Purchase
  const house4Lord = getHouseLord(lagnaRashiIdx, 4);
  const house4LordKn = getPlanetKn(house4Lord);

  // 7. Health & Anxiety
  const moon = getPlanet(kundli, PlanetName.Moon);
  const lagnaLord = signLord(lagnaRashiIdx);

  // 8. Progeny & Children
  const house5Lord = getHouseLord(lagnaRashiIdx, 5);
  const house5LordKn = getPlanetKn(house5Lord);

  return [
    {
      id: "career_promotion",
      category: "career",
      categoryKn: "ಉದ್ಯೋಗ & ಪ್ರಮೋಷನ್",
      categoryEn: "Career & Promotion",
      icon: "💼",
      questionKn: "ನನ್ನ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಅಥವಾ ಕೆಲಸ ಬದಲಾವಣೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?",
      questionEn: "When will I get a job promotion or career breakthrough?",
      whereToLookKn: {
        primaryHousesKn: "೧೦ನೇ ಮನೆ (ಕರ್ಮ ಭಾವ) ಮತ್ತು ೬ನೇ ಮನೆ (ಸೇವಾ ಸ್ಥಾನ)",
        karakaPlanetsKn: "ಸೂರ್ಯ (ಅಧಿಕಾರ ಕಾರಕ) ಮತ್ತು ಶನಿ (ಕರ್ಮ ಕಾರಕ)",
        targetHouseLordsKn: `ದಶಮಾಧಿಪತಿ: ${house10LordKn} (೧೦ನೇ ಮನೆ)`,
        whyThisPlaceImportantKn: "೧೦ನೇ ಮನೆಯು ಸಮಾಜದಲ್ಲಿ ಅಧಿಕಾರ, ಬಡ್ತಿ ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ೬ನೇ ಮನೆಯು ದೈನಂದಿನ ಸೇವೆ ಮತ್ತು ಪೈಪೋಟಿಯಲ್ಲಿ ವಿಜಯವನ್ನು ನೀಡುತ್ತದೆ."
      },
      whereToLookEn: {
        primaryHousesEn: "10th House (Karma/Career) and 6th House (Service/Competence)",
        karakaPlanetsEn: "Sun (Authority Karaka) and Saturn (Work Karaka)",
        targetHouseLordsEn: `10th Lord: ${getPlanetEn(house10Lord)}`,
        whyThisPlaceImportantEn: "The 10th house governs professional zenith and honors, while the 6th governs competitive victories."
      },
      pillar1KundliKn: {
        titleKn: "1️⃣ ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರ",
        analysisKn: `ನಿಮ್ಮ 10ನೇ ಮನೆ ${getRashiKn(getHouseRashi(lagnaRashiIdx, 10))} ಆಗಿದ್ದು, ದಶಮಾಧಿಪತಿ ${house10LordKn}. 10ನೇ ಮನೆಯಲ್ಲಿ ${house10OccKn} ಗ್ರಹಗಳಿವೆ.`,
        scoreLabelKn: "ದೃಢ ವೃತ್ತಿ ಬಲ"
      },
      pillar1KundliEn: {
        titleEn: "1. Natal Chart Foundation",
        analysisEn: `10th house is ${getRashiEn(getHouseRashi(lagnaRashiIdx, 10))} ruled by ${getPlanetEn(house10Lord)}. Occupants: ${house10OccKn}.`,
        scoreLabelEn: "Stable Foundation"
      },
      pillar2DashaKn: {
        titleKn: "2️⃣ ದಶಾ-ಭುಕ್ತಿ ಕಾಲಾವಧಿ",
        analysisKn: `ಪ್ರಸ್ತುತ ${mahaLordKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ. ${careerDashaConnected ? "ಈ ದಶಾ ವೃತ್ತಿ ಸ್ಥಾನಕ್ಕೆ ನೇರ ಸಂಬಂಧ ಹೊಂದಿದ್ದು ಬಡ್ತಿಗೆ ಸಕಾಲವಾಗಿದೆ." : "ದಶಾನಾಥರು ಆಂತರಿಕ ಶಿಸ್ತನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾರೆ."}`,
        activeTimingKn: `${mahaLordKn} - ${bhuktiLordKn} ದಶಾ ಸಂಧಿ`
      },
      pillar2DashaEn: {
        titleEn: "2. Dasha-Bhukti Timing",
        analysisEn: `Currently running ${mahaLordKn} Mahadasha with ${bhuktiLordKn} Bhukti. ${careerDashaConnected ? "Dasha is actively triggering professional changes." : "Dasha demands perseverance."}`,
        activeTimingEn: `${getPlanetEn(mahaLord)} - ${getPlanetEn(bhuktiLord)} Period`
      },
      pillar3GocharaKn: {
        titleKn: "3️⃣ ಗೋಚಾರ ಸಂಚಾರ",
        analysisKn: `ಶನಿ ಗೋಚಾರ: ${gochara.saturnRashiKn} (${gochara.saturnHouseFromMoon}ನೇ ಸ್ಥಾನ). ಗುರು ಗೋಚಾರ: ${gochara.jupiterRashiKn} (${gochara.guruBalaSummaryKn}).`,
        transitVerdictKn: gochara.hasGuruBala ? "ಗೋಚಾರದಲ್ಲಿ ಗುರು ಬಲವಿದ್ದು ಬಡ್ತಿಗೆ ಸಂಪೂರ್ಣ ಹಸಿರು ನಿಶಾನೆ ಇದೆ." : "ಶನಿ/ಗುರು ಗೋಚಾರ ಪರೀಕ್ಷಾತ್ಮಕವಾಗಿದ್ದು, ಹಿರಿಯರೊಂದಿಗೆ ಸಂಘರ್ಷ ತಪ್ಪಿಸಬೇಕು."
      },
      pillar3GocharaEn: {
        titleEn: "3. Live Transit Influences",
        analysisEn: `Saturn in ${gochara.saturnRashiEn} (H${gochara.saturnHouseFromMoon} from Moon), Jupiter in ${gochara.jupiterRashiEn}.`,
        transitVerdictEn: gochara.hasGuruBala ? "Jupiter grants protective green light." : "Transits advise patience with superiors."
      },
      synthesisKn: {
        howToCombineKn: "ಜ್ಯೋತಿಷಿ ಕಲಿಯಬೇಕಾದ ಸೂತ್ರ: ಜನ್ಮ ಕುಂಡಲಿ ಸಾಮರ್ಥ್ಯ ತೋರಿಸುತ್ತದೆ, ದಶಾ ಅನುಮತಿ ನೀಡುತ್ತದೆ, ಗೋಚಾರ ಬಾಗಿಲು ತೆರೆಯುತ್ತದೆ. ಈ ಮೂರೂ ಒಂದಾದಾಗ ಬಡ್ತಿ ಖಚಿತ.",
        verdictKn: gochara.hasGuruBala && careerDashaConnected ? "ಶೀಘ್ರದಲ್ಲೇ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಮತ್ತು ಜವಾಬ್ದಾರಿ ಹೆಚ್ಚಳವಾಗಲಿದೆ." : "ಪ್ರಸ್ತುತ ಕೆಲಸದಲ್ಲಿ ಶಿಸ್ತು ಕಾಪಾಡಿ; ಗುರು ಬದಲಾವಣೆಯ ನಂತರ ಉತ್ತಮ ಅವಕಾಶ ಸಿಗಲಿದೆ.",
        timingWindowKn: "ಮುಂದಿನ 6 ರಿಂದ 9 ತಿಂಗಳುಗಳಲ್ಲಿ ಶುಭ ತಿರುವು ನಿರೀಕ್ಷಿತ."
      },
      synthesisEn: {
        howToCombineEn: "Rule of Synthesis: Kundli shows potential, Dasha grants permission, Transit opens the door.",
        verdictEn: gochara.hasGuruBala ? "Promotion and enhanced responsibilities indicated shortly." : "Persevere currently; favorable shift upon next Jupiter transit.",
        timingWindowEn: "Favorable window within next 6 to 9 months."
      },
      spokenScriptKn: `ಉದ್ಯೋಗದ ವಿಷಯದಲ್ಲಿ, ನಿಮ್ಮ 10ನೇ ಮನೆ ದೃಢವಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaLordKn}-${bhuktiLordKn} ಕಾಲಘಟ್ಟ ನಡೆಯುತ್ತಿದ್ದು, ಗೋಚಾರದಲ್ಲಿ ${gochara.hasGuruBala ? "ಗುರು ಬಲ ನಿಮ್ಮ ರಕ್ಷಣೆಗೆ ನಿಂತಿದೆ." : "ಸ್ವಲ್ಪ ತಾಳ್ಮೆ ಬೇಕಾಗಿದೆ."} ವಿನಾಕಾರಣ ಕೆಲಸ ಬಿಡಬೇಡಿ; ಪ್ರಸ್ತುತ ಸ್ಥಳದಲ್ಲೇ ನಿಷ್ಠೆಯಿಂದ ಕೆಲಸ ಮಾಡಿದರೆ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ ಬಡ್ತಿ ಅಥವಾ ಗೌರವ ಸಿಗಲಿದೆ.`,
      spokenScriptEn: `Regarding your job, your 10th house is stable. Running ${getPlanetEn(mahaLord)}-${getPlanetEn(bhuktiLord)}, ${gochara.hasGuruBala ? "Jupiter offers favorable support." : "maintain patience."} Avoid impulsive resignations; loyalty now yields a dignified promotion.`,
      remedyKn: "ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಮತ್ತು ಭಾನುವಾರ ಗೋಧಿ ದಾನ ಮಾಡಿ.",
      remedyEn: "Chant Aditya Hridaya Stotra and practice morning Surya Namaskara."
    },
    {
      id: "marriage_timing",
      category: "marriage",
      categoryKn: "ವಿವಾಹ & ಕಂಕಣ ಭಾಗ್ಯ",
      categoryEn: "Marriage Timing",
      icon: "💍",
      questionKn: "ನನಗೆ ವಿವಾಹ ಯೋಗ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ? ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡುವ ಕಾಲ ಯಾವುದು?",
      questionEn: "When will marriage materialize in my horoscope?",
      whereToLookKn: {
        primaryHousesKn: "೭ನೇ ಮನೆ (ಕಳತ್ರ ಸ್ಥಾನ) ಮತ್ತು ೨ನೇ ಮನೆ (ಕುಟುಂಬ ವೃದ್ಧಿ)",
        karakaPlanetsKn: "ಶುಕ್ರ (ವಿವಾಹ ಕಾರಕ) ಮತ್ತು ಗುರು (ದೈವಿಕ ಆಶೀರ್ವಾದ)",
        targetHouseLordsKn: `ಸಪ್ತಮಾಧಿಪತಿ: ${house7LordKn}`,
        whyThisPlaceImportantKn: "೭ನೇ ಮನೆಯು ಸಂಗಾತಿ ಮತ್ತು ವಿವಾಹ ಬಂಧವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಗುರು ಗ್ರಹವು ಗೋಚಾರದಲ್ಲಿ ೨, ೫, ೭, ೯, ೧೧ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದಾಗ ವಿವಾಹ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರುತ್ತದೆ."
      },
      whereToLookEn: {
        primaryHousesEn: "7th House (Kalatra) and 2nd House (Family Additions)",
        karakaPlanetsEn: "Venus (Marriage Karaka) and Jupiter (Blessings)",
        targetHouseLordsEn: `7th Lord: ${getPlanetEn(house7Lord)}`,
        whyThisPlaceImportantEn: "7th house dictates the spouse, and Jupiter's transit on 2/5/7/9/11 from Moon triggers marriage."
      },
      pillar1KundliKn: {
        titleKn: "1️⃣ ಜನ್ಮ ಕುಂಡಲಿ ಸ್ಥಿತಿ",
        analysisKn: `7ನೇ ಮನೆ ${getRashiKn(getHouseRashi(lagnaRashiIdx, 7))} ಆಗಿದ್ದು, ಸಪ್ತಮಾಧಿಪತಿ ${house7LordKn}. ಶುಕ್ರನ ಸ್ಥಿತಿ: ${venus ? getRashiKn(venus.rashi) : "ಅಜ್ಞಾತ"}.`,
        scoreLabelKn: "ಕಳತ್ರ ಬಲ ಸುಸ್ಥಿತಿ"
      },
      pillar1KundliEn: {
        titleEn: "1. Natal Promise",
        analysisEn: `7th house is ${getRashiEn(getHouseRashi(lagnaRashiIdx, 7))} with lord ${getPlanetEn(house7Lord)}.`,
        scoreLabelEn: "Marital Potential Active"
      },
      pillar2DashaKn: {
        titleKn: "2️⃣ ದಶಾ-ಭುಕ್ತಿ ಸಹಕಾರ",
        analysisKn: `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${mahaLordKn} ಮಹಾದಶಾ ಮತ್ತು ${bhuktiLordKn} ಭುಕ್ತಿ. ${marriageDashaConnected ? "ದಶಾನಾಥರು ವಿವಾಹ ಸಂಬಂಧಕ್ಕೆ ನೇರ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತಿದ್ದಾರೆ." : "ದಶಾ ಕಾಲವು ವಿವಾಹದ ಸಿದ್ಧತೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದೆ."}`,
        activeTimingKn: `${mahaLordKn} - ${bhuktiLordKn}`
      },
      pillar2DashaEn: {
        titleEn: "2. Dasha Window",
        analysisEn: `Running ${getPlanetEn(mahaLord)} with ${getPlanetEn(bhuktiLord)}. ${marriageDashaConnected ? "Dasha strongly activates matrimonial prospects." : "Dasha tests inner preparedness."}`,
        activeTimingEn: "Active Cycle"
      },
      pillar3GocharaKn: {
        titleKn: "3️⃣ ಗೋಚಾರ ಗುರು ಬಲ",
        analysisKn: `ಗೋಚಾರ ಗುರು: ${gochara.jupiterRashiKn} (${gochara.guruBalaSummaryKn}).`,
        transitVerdictKn: gochara.hasGuruBala ? "ಗೋಚಾರದಲ್ಲಿ ಗುರು ಬಲವಿರುವುದರಿಂದ ವಿವಾಹ ಮಾತುಕತೆಗಳು ಫಲಪ್ರದವಾಗುವ ಸಕಾಲ." : "ಗುರು ಬಲ ಬರುವವರೆಗೂ ಕಂಕಣ ಭಾಗ್ಯಕ್ಕೆ ಶಾಂತಿ ಅಥವಾ ಕಾಯುವಿಕೆ ಅಗತ್ಯ."
      },
      pillar3GocharaEn: {
        titleEn: "3. Transit Guru Bala",
        analysisEn: `Transit Jupiter in ${gochara.jupiterRashiEn}.`,
        transitVerdictEn: gochara.hasGuruBala ? "Jupiter grants supportive wedding bells." : "Wait for favorable Jupiter alignment."
      },
      synthesisKn: {
        howToCombineKn: "ವಿವಾಹದ ರಹಸ್ಯ: ಸಪ್ತಮಾಧಿಪತಿಯ ಬಲ + ಶುಕ್ರನ ಶುದ್ಧಿ + ಗೋಚಾರ ಗುರು ಬಲ. ಈ ಮೂರರಲ್ಲಿ ಎರಡು ಕೂಡಿಬಂದರೂ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರುತ್ತದೆ.",
        verdictKn: gochara.hasGuruBala ? "ವಿವಾಹ ಮಾತುಕತೆಗಳಿಗೆ ಸಕಾಲ. ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ಉತ್ತಮ ಸಂಬಂಧ ನಿಶ್ಚಯವಾಗಲಿದೆ." : "ಸಂಬಂಧಗಳು ಬಂದು ತಪ್ಪಿಹೋಗದಂತೆ ಗುರು ಮತ್ತು ಕುಜ ಶಾಂತಿ ಮಾಡಿಸುವುದು ಒಳಿತು.",
        timingWindowKn: "ಮುಂದಿನ 1 ವರ್ಷದೊಳಗೆ ಕಂಕಣ ಯೋಗ ಬಲವಾಗಿದೆ."
      },
      synthesisEn: {
        howToCombineEn: "Synthesis Key: 7th lord strength + Venus purity + Transit Jupiter. When any two align, wedding manifests.",
        verdictEn: gochara.hasGuruBala ? "Auspicious matrimonial talks will finalize successfully." : "Perform Guru-Kuja shanti to clear lingering delays.",
        timingWindowEn: "High probability window within 12 months."
      },
      spokenScriptKn: `ವಿವಾಹದ ಬಗ್ಗೆ ಚಿಂತಿಸಬೇಡಿ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನ ಸುಸ್ಥಿತಿಯಲ್ಲಿದೆ. ${gochara.hasGuruBala ? "ಪ್ರಸ್ತುತ ಗುರು ಬಲವಿರುವುದರಿಂದ ಉತ್ತಮ ಸಂಬಂಧಗಳು ಹುಡುಕಿಕೊಂಡು ಬರಲಿವೆ." : "ಸ್ವಲ್ಪ ವಿಳಂಬವಾದರೂ ಸಂಸ್ಕಾರಯುತ ಮತ್ತು ಪ್ರಬುದ್ಧ ಸಂಗಾತಿ ಸಿಗಲಿದ್ದಾರೆ."} ಶುಕ್ರವಾರದಂದು ದೇವಿಯ ಆರಾಧನೆ ಮಾಡಿ, ಸಕಾಲದಲ್ಲಿ ಕಂಕಣ ಭಾಗ್ಯ ನೆರವೇರುತ್ತದೆ.`,
      spokenScriptEn: `Do not worry regarding marriage. Your 7th house is intact. ${gochara.hasGuruBala ? "With Jupiter's grace active now, excellent alliances will surface." : "Though slightly delayed, you will be blessed with a cultured partner."} Offer prayers on Fridays.`,
      remedyKn: "ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಸೇವೆ, ಅಥವಾ ಶುಕ್ರವಾರ ಉಮಾ-ಮಹೇಶ್ವರ ಅಷ್ಟೋತ್ತರ ಪಠಣೆ.",
      remedyEn: "Gokarna Kalyanotsava Seva or chanting Uma-Maheshwara Stotra on Fridays."
    },
    {
      id: "debt_finance_relief",
      category: "finance",
      categoryKn: "ಧನ ಲಾಭ & ಸಾಲ ಮುಕ್ತಿ",
      categoryEn: "Debt Relief & Wealth",
      icon: "💰",
      questionKn: "ನನ್ನ ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಮತ್ತು ಸಾಲದ ಬಾಧೆ ಯಾವಾಗ ತೀರುತ್ತದೆ? ಸಾಲ ಮುಕ್ತಿ ಕಾಲ ಯಾವುದು?",
      questionEn: "When will financial stress ease and debts be cleared?",
      whereToLookKn: {
        primaryHousesKn: "೬ನೇ ಮನೆ (ಋಣ/ಸಾಲ) ಮತ್ತು ೧೧ನೇ ಮನೆ (ಲಾಭ/ಆದಾಯ), ೨ನೇ ಮನೆ (ಧನ ಸ್ಥಾನ)",
        karakaPlanetsKn: "ಗುರು (ಧನ ಕಾರಕ) ಮತ್ತು ಬುಧ (ವ್ಯಾಪಾರ/ಆದಾಯ)",
        targetHouseLordsKn: `೬ನೇ ಅಧಿಪತಿ: ${house6LordKn} • ೧೧ನೇ ಅಧಿಪತಿ: ${house11LordKn}`,
        whyThisPlaceImportantKn: "೬ನೇ ಮನೆಯು ಸಾಲದ ಹೊರೆಯನ್ನು ತೋರಿಸಿದರೆ, ೧೧ನೇ ಮನೆಯು ಆ ಸಾಲವನ್ನು ತೀರಿಸುವ ಆದಾಯ ಮೂಲಗಳನ್ನು ನೀಡುತ್ತದೆ."
      },
      whereToLookEn: {
        primaryHousesEn: "6th House (Debts) and 11th House (Gains/Income), 2nd House (Wealth)",
        karakaPlanetsEn: "Jupiter (Dhana Karaka) and Mercury (Commerce)",
        targetHouseLordsEn: `6th Lord: ${getPlanetEn(house6Lord)} • 11th Lord: ${getPlanetEn(house11Lord)}`,
        whyThisPlaceImportantEn: "6th governs debt pressure while 11th provides the inflow to dissolve it."
      },
      pillar1KundliKn: {
        titleKn: "1️⃣ ಜನ್ಮ ಕುಂಡಲಿ ಧನ-ಋಣ ಸಮತೋಲನ",
        analysisKn: `11ನೇ ಮನೆ ಅಧಿಪತಿ ${house11LordKn} ಮತ್ತು 6ನೇ ಮನೆ ಅಧಿಪತಿ ${house6LordKn}. ಆದಾಯ ಮೂಲಗಳು ಉಳಿಯುವಂತೆ ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು.`,
        scoreLabelKn: "ಆದಾಯ ಸಮತೋಲನ"
      },
      pillar1KundliEn: {
        titleEn: "1. Natal Debt-Income Balance",
        analysisEn: `11th lord ${getPlanetEn(house11Lord)} and 6th lord ${getPlanetEn(house6Lord)} determine the inflow-outflow balance.`,
        scoreLabelEn: "Manageable Inflows"
      },
      pillar2DashaKn: {
        titleKn: "2️⃣ ದಶಾ ಕಾಲಚಕ್ರದ ಆದಾಯ ಶಕ್ತಿ",
        analysisKn: `ಪ್ರಸ್ತುತ ${mahaLordKn}-${bhuktiLordKn} ದಶೆ. ${gochara.isSadeSati ? "ಸಾಡೇ ಸಾತಿ ಇರುವ ಕಾರಣ ಹಠಾತ್ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಬೇಕು." : "ಆದಾಯದ ಹರಿವು ಸ್ಥಿರವಾಗಿರುತ್ತದೆ."}`,
        activeTimingKn: "ದಶಾ ಹರಿವು"
      },
      pillar2DashaEn: {
        titleEn: "2. Dasha Timing Factor",
        analysisEn: `Active ${getPlanetEn(mahaLord)}-${getPlanetEn(bhuktiLord)}. Financial discipline required.`,
        activeTimingEn: "Active Period"
      },
      pillar3GocharaKn: {
        titleKn: "3️⃣ ಗೋಚಾರ ಶನಿ & ಗುರು ಪ್ರಭಾವ",
        analysisKn: `ಶನಿ ಗೋಚಾರ: ${gochara.saturnRashiKn}. ಗುರು ಗೋಚಾರ: ${gochara.jupiterRashiKn}. ${gochara.hasGuruBala ? "ಗುರು ಬಲವು ಧನಾಗಮನಕ್ಕೆ ದಾರಿ ಮಾಡಿಕೊಡುತ್ತದೆ." : "ಆರ್ಥಿಕ ಸಂಯಮ ಅನಿವಾರ್ಯ."}`,
        transitVerdictKn: gochara.hasGuruBala ? "ಗುರು ಬಲದಿಂದ ನೂತನ ಆದಾಯ ಮೂಲಗಳು ಸೃಷ್ಟಿಯಾಗಿ ಸಾಲ ತೀರಲು ಸಹಕಾರಿಯಾಗುತ್ತದೆ." : "ಅನಗತ್ಯ ಸಾಲಗಳನ್ನು ತಪ್ಪಿಸಿ."
      },
      pillar3GocharaEn: {
        titleEn: "3. Transit Influences",
        analysisEn: `Saturn in ${gochara.saturnRashiEn}, Jupiter in ${gochara.jupiterRashiEn}.`,
        transitVerdictEn: gochara.hasGuruBala ? "Jupiter generates new income streams to liquidate debt." : "Maintain strict thrift."
      },
      synthesisKn: {
        howToCombineKn: "ಸಾಲ ಮುಕ್ತಿಯ ಜ್ಯೋತಿಷ್ಯ ಸೂತ್ರ: 6ನೇ ಮನೆಯ ಕ್ಲೇಶವನ್ನು 11ನೇ ಮನೆಯ ಆದಾಯದಿಂದ ದಾಟಬೇಕು. ಗುರು ಬಲ ಬಂದಾಗ ಸಾಲ ತೀರಿಸಲು ಮೊದಲ ಪ್ರಾಶಸ್ತ್ಯ ನೀಡಬೇಕು.",
        verdictKn: "ಆತುರದ ಷೇರು ಅಥವಾ ಜೂಜಾಟದ ಹೂಡಿಕೆ ಮಾಡಬೇಡಿ; ಹಂತಹಂತವಾಗಿ ಸಾಲ ಸಂಪೂರ್ಣ ನಿವಾರಣೆಯಾಗಲಿದೆ.",
        timingWindowKn: "ಮುಂದಿನ 8 ರಿಂದ 14 ತಿಂಗಳುಗಳಲ್ಲಿ ಸಾಲದ ಹೊರೆ ಗಣನೀಯವಾಗಿ ಇಳಿಯಲಿದೆ."
      },
      synthesisEn: {
        howToCombineEn: "Synthesis Rule: Balance 6th house debt with 11th house inflows. Direct unexpected windfalls immediately into debt reduction.",
        verdictEn: "Avoid speculative investments. Systematic repayment will liberate you.",
        timingWindowEn: "Significant relief within 8 to 14 months."
      },
      spokenScriptKn: `ಸಾಲದ ವಿಷಯದಲ್ಲಿ ಆತಂಕ ಬೇಡ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಆದಾಯದ ಮೂಲಗಳು ಬತ್ತಿಹೋಗಿಲ್ಲ. ಆತುರದಲ್ಲಿ ಸಾಲ ತೀರಿಸಲು ಮತ್ತೊಂದು ಸಾಲ ಮಾಡುವ ತಪ್ಪನ್ನು ಮಾಡಬೇಡಿ. ಹಂತಹಂತವಾಗಿ ಯೋಜನಾಬದ್ಧವಾಗಿ ಮರುಪಾವತಿ ಮಾಡಿ, ಭಗವಂತನ ಕೃಪೆಯಿಂದ ಸದ್ಯದಲ್ಲೇ ಸಾಲ ಮುಕ್ತಿ ಸಿಗಲಿದೆ.`,
      spokenScriptEn: `Do not despair regarding debts. Your income channels are resilient. Avoid borrowing fresh loans to pay older ones; systematic repayment will soon restore your peace of mind.`,
      remedyKn: "ಋಣಮುಕ್ತ ಗಣಪತಿ ಸ್ತೋತ್ರ ಪಠಣೆ ಮತ್ತು ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ನರಸಿಂಹ ಸ್ವಾಮಿಗೆ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚುವುದು.",
      remedyEn: "Chant Rinamochana Ganapati Stotra and light a ghee lamp for Lord Subrahmanya on Tuesdays."
    },
    {
      id: "business_suitability",
      category: "business",
      categoryKn: "ಸ್ವಂತ ವ್ಯಾಪಾರ ಅಥವಾ ಉದ್ಯೋಗ",
      categoryEn: "Business vs Job",
      icon: "🏪",
      questionKn: "ನನಗೆ ಸ್ವಂತ ವ್ಯಾಪಾರ / ಉದ್ಯಮ ಲಾಭದಾಯಕವೋ ಅಥವಾ ಕೆಲಸವೇ ಉತ್ತಮವೋ?",
      questionEn: "Is independent business or salaried employment better for me?",
      whereToLookKn: {
        primaryHousesKn: "೭ನೇ ಮನೆ (ವ್ಯಾಪಾರ), ೩ನೇ ಮನೆ (ಸಾಹಸ/ಧೈರ್ಯ) ಅಥವಾ ೬ನೇ ಮನೆ (ಉದ್ಯೋಗ)",
        karakaPlanetsKn: "ಬುಧ (ವ್ಯಾಪಾರ ಬುದ್ಧಿ) ಮತ್ತು ಮಂಗಳ (ಸಾಹಸ ಶಕ್ತಿ)",
        targetHouseLordsKn: `ಸಪ್ತಮಾಧಿಪತಿ: ${house7LordKn} • ದಶಮಾಧಿಪತಿ: ${house10LordKn}`,
        whyThisPlaceImportantKn: "೭ನೇ ಮನೆ ಸ್ವತಂತ್ರ ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆಯನ್ನು ತೋರಿಸುತ್ತದೆ, ೬ನೇ ಮನೆ ನೌಕರಿಯನ್ನು ತೋರಿಸುತ್ತದೆ."
      },
      whereToLookEn: {
        primaryHousesEn: "7th House (Commerce) & 3rd (Initiative) vs 6th House (Service)",
        karakaPlanetsEn: "Mercury (Trading Intellect) & Mars (Enterprise Courage)",
        targetHouseLordsEn: `7th Lord: ${getPlanetEn(house7Lord)} • 10th Lord: ${getPlanetEn(house10Lord)}`,
        whyThisPlaceImportantEn: "7th house governs independent trade, while 6th governs salaried service."
      },
      pillar1KundliKn: {
        titleKn: "1️⃣ ಜನ್ಮ ಕುಂಡಲಿ ವ್ಯಾಪಾರ ಯೋಗ",
        analysisKn: suitsBusiness ? "ಬುಧ ಹಾಗೂ 7ನೇ ಮನೆಯ ಸ್ಥಿತಿ ವ್ಯಾಪಾರಕ್ಕೆ ಪೂರಕವಾಗಿದೆ. ಸ್ವಂತ ಉದ್ಯಮದಲ್ಲಿ ಲಾಭ ಗಳಿಸುವ ಯೋಗವಿದೆ." : "ಜಾತಕದಲ್ಲಿ 6ನೇ ಮನೆಯ ಸೇವಾ ಬಲ ಹೆಚ್ಚಿದ್ದು, ಸ್ಥಿರ ನೌಕರಿಯೇ ಹೆಚ್ಚಿನ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
        scoreLabelKn: suitsBusiness ? "ಸ್ವಂತ ಉದ್ಯಮ ಯೋಗ" : "ಉದ್ಯೋಗವೇ ಶ್ರೇಷ್ಠ"
      },
      pillar1KundliEn: {
        titleEn: "1. Natal Business Potential",
        analysisEn: suitsBusiness ? "Mercury and 7th house support independent trade." : "6th house favors stable salaried employment over risky entrepreneurship.",
        scoreLabelEn: suitsBusiness ? "Enterprise Favored" : "Employment Favored"
      },
      pillar2DashaKn: {
        titleKn: "2️⃣ ದಶಾ ಬಲ ಪರಿಶೀಲನೆ",
        analysisKn: `ಪ್ರಸ್ತುತ ${mahaLordKn} ದಶೆ ನಡೆಯುತ್ತಿದೆ. ಸ್ವತಂತ್ರ ಹೂಡಿಕೆಗೆ ಸಾಕಷ್ಟು ಬಂಡವಾಳ ಮತ್ತು ಸಂಯಮ ಅಗತ್ಯ.`,
        activeTimingKn: "ದಶಾ ಪರೀಕ್ಷೆ"
      },
      pillar2DashaEn: {
        titleEn: "2. Dasha Evaluation",
        analysisEn: `Current dasha demands caution before taking substantial business leverage.`,
        activeTimingEn: "Active Cycle"
      },
      pillar3GocharaKn: {
        titleKn: "3️⃣ ಗೋಚಾರ ಅನುಕೂಲತೆ",
        analysisKn: `ಗೋಚಾರ ಗುರು ಬಲ: ${gochara.hasGuruBala ? "ಅನುಕೂಲಕರ" : "ಮಧ್ಯಮ"}. ಶನಿ: ${gochara.saturnRashiKn}.`,
        transitVerdictKn: gochara.hasGuruBala ? "ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಹೊಸ ವ್ಯಾಪಾರ ಆರಂಭಿಸಲು ಶುಭ." : "ದೊಡ್ಡ ಸಾಲ ಮಾಡಿ ವ್ಯಾಪಾರ ಆರಂಭಿಸುವುದು ಅಪಾಯಕಾರಿ."
      },
      pillar3GocharaEn: {
        titleEn: "3. Transit Feasibility",
        analysisEn: `Transit Jupiter is ${gochara.hasGuruBala ? "supportive" : "moderate"}.`,
        transitVerdictEn: gochara.hasGuruBala ? "Small scale ventures can be initiated." : "Avoid heavy debt-financed expansion."
      },
      synthesisKn: {
        howToCombineKn: "ವ್ಯಾಪಾರ ಸೂತ್ರ: ಜಾತಕದಲ್ಲಿ ಬುಧ ಮತ್ತು 7ನೇ ಮನೆ ಬಲವಿದ್ದರೆ ವ್ಯಾಪಾರ; ಇಲ್ಲದಿದ್ದರೆ ನೌಕರಿ ಮಾಡುತ್ತಾ ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಮಾತ್ರ ಪ್ರಯತ್ನಿಸಬೇಕು.",
        verdictKn: suitsBusiness ? "ವ್ಯಾಪಾರ ಯೋಗವಿದೆ, ಆದರೆ ಪಾಲುದಾರರ ಆಯ್ಕೆಯಲ್ಲಿ ಕಣ್ಣಿಟ್ಟಿರಬೇಕು." : "ಖಾಯಂ ನೌಕರಿಯಲ್ಲಿದ್ದುಕೊಂಡೇ ಹೆಚ್ಚುವರಿ ಆದಾಯದ ದಾರಿಗಳನ್ನು ಹುಡುಕುವುದು ಬುದ್ಧಿವಂತಿಕೆ.",
        timingWindowKn: "ಮುಂದಿನ 1 ವರ್ಷದಲ್ಲಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ."
      },
      synthesisEn: {
        howToCombineEn: "Synthesis Rule: Strong Mercury & 7th house = business; otherwise keep salaried job as primary anchor.",
        verdictEn: suitsBusiness ? "Business is viable with strict partnership caution." : "Retain primary job; pursue side ventures conservatively.",
        timingWindowEn: "Plan steadily over next 12 months."
      },
      spokenScriptKn: suitsBusiness ? "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಸ್ವತಂತ್ರವಾಗಿ ವ್ಯಾಪಾರ ಮಾಡುವ ಯೋಗವಿದೆ. ಆದರೆ ಆರಂಭದಲ್ಲಿ ದೊಡ್ಡ ಸಾಲ ಮಾಡಬೇಡಿ. ಹಂತಹಂತವಾಗಿ ಬೆಳೆಯಿರಿ." : "ನೀವು ಸದ್ಯಕ್ಕೆ ಉದ್ಯೋಗದಲ್ಲಿರುವುದೇ ಕ್ಷೇಮ. ಕೈಯಲ್ಲಿದ್ದ ಕೆಲಸ ಬಿಟ್ಟು ದಿಢೀರನೆ ವ್ಯಾಪಾರಕ್ಕೆ ದುಮುಕಬೇಡಿ. ನಿಧಾನವಾಗಿ ಸಣ್ಣ ಮಟ್ಟದಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ.",
      spokenScriptEn: suitsBusiness ? "You possess entrepreneurial aptitude. Scale gradually without excessive debt." : "Maintain your salaried employment as an anchor. Do not resign precipitously for unproven ventures.",
      remedyKn: "ಬುಧವಾರ ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಪೂಜೆ ಮತ್ತು ಹಸಿರು ಹೆಸರುಕಾಳು ದಾನ ಮಾಡಿ.",
      remedyEn: "Worship Lakshmi-Narayana on Wednesdays and donate green gram."
    }
  ];
}

// ---------------------------------------------------------
// DOSHAS, GANDANTHARAS, FEARS, SECRETS & TEMPERAMENT
// ---------------------------------------------------------

export function calculateGurukulaDiagnostics(kundli: KundliOutput, currentAgeYears = 30): GurukulaDeepDiagnostics {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const sun = getPlanet(kundli, PlanetName.Sun);
  const moon = getPlanet(kundli, PlanetName.Moon);
  const mars = getPlanet(kundli, PlanetName.Mars);
  const jup = getPlanet(kundli, PlanetName.Jupiter);
  const sat = getPlanet(kundli, PlanetName.Saturn);
  const mer = getPlanet(kundli, PlanetName.Mercury);
  const ven = getPlanet(kundli, PlanetName.Venus);
  const rahu = getPlanet(kundli, PlanetName.Rahu);
  const ketu = getPlanet(kundli, PlanetName.Ketu);

  // 1. Doshas Detection
  const hasKuja = mars ? [1, 2, 4, 7, 8, 12].includes(mars.house) : false;
  const hasPitru = sun && rahu && sun.rashi.index === rahu.rashi.index;
  const hasGuruChandala = jup && rahu && jup.rashi.index === rahu.rashi.index;
  const hasMaandi = Boolean(kundli.maandi);

  let hasKalaSarpa = false;
  if (rahu && ketu) {
    const rDeg = rahu.degree;
    const diffs = kundli.planets
      .filter((p) => p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu)
      .map((p) => (p.degree - rDeg + 360) % 360);
    const allHemmed = diffs.every((d) => d < 180) || diffs.every((d) => d > 180);
    hasKalaSarpa = allHemmed;
  }

  const prevHouse = moon ? ((moon.house - 2 + 12) % 12) + 1 : 12;
  const nextHouse = moon ? (moon.house % 12) + 1 : 2;
  const hasNeighbors = kundli.planets.some(
    (p) =>
      p.name !== PlanetName.Moon &&
      p.name !== PlanetName.Sun &&
      p.name !== PlanetName.Rahu &&
      p.name !== PlanetName.Ketu &&
      (p.house === prevHouse || p.house === nextHouse)
  );
  const hasKemadruma = !hasNeighbors;

  // Panchanga-based Dosha variables
  const sunLong = getPlanetAbsoluteLongitude(sun);
  const moonLong = getPlanetAbsoluteLongitude(moon);
  const diffLong = normalizeDeg(moonLong - sunLong);
  const tithiNum = Math.floor(diffLong / 12) + 1;
  const dagdhaIndices = DAGDHA_RASHIS_BY_TITHI[tithiNum] || [];
  const planetsInDagdha = kundli.planets.filter((p) => dagdhaIndices.includes(p.rashi.index));
  const hasDagdhaDosha = planetsInDagdha.length > 0;

  const halfTithi = Math.floor(diffLong / 6) % 60;
  const charaIdx = (halfTithi - 1) % 7;
  const isVishtiBhadra = halfTithi > 0 && halfTithi < 57 && charaIdx === 6;

  const yogaSum = normalizeDeg(sunLong + moonLong);
  const yogaIdx = Math.floor(yogaSum / (360 / 27)) % 27;
  const inauspiciousYogas = [0, 5, 8, 9, 12, 14, 16, 18, 26];
  const hasAshubhaYoga = inauspiciousYogas.includes(yogaIdx);
  const yogaNameKn = YOGAS_METADATA[yogaIdx]?.kn || "";
  const yogaNameEn = YOGAS_METADATA[yogaIdx]?.en || "";

  // Upari / Upagraha check
  const dhumaLong = normalizeDeg(sunLong + 133 + 20 / 60);
  const vyatipataLong = normalizeDeg(360 - dhumaLong);
  const moonNakIdxDiag = Math.floor(moonLong / (360 / 27)) % 27;
  const dhumaNak = Math.floor(dhumaLong / (360 / 27)) % 27;
  const vyatipataNak = Math.floor(vyatipataLong / (360 / 27)) % 27;
  const hasUpariAffliction = (dhumaNak === moonNakIdxDiag || vyatipataNak === moonNakIdxDiag);

  const doshas = [
    {
      id: "kuja_dosha",
      nameKn: "ಕುಜ ದೋಷ (ಮಂಗಳ ದೋಷ)",
      nameEn: "Kuja Dosha (Mars Affliction)",
      isPresent: hasKuja,
      howToSpotKn: "ಕುಜನು ಲಗ್ನ, 2, 4, 7, 8 ಅಥವಾ 12ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ಕುಜ ದೋಷ ಉಂಟಾಗುತ್ತದೆ.",
      howToSpotEn: "Mars residing in houses 1, 2, 4, 7, 8, or 12 triggers Kuja Dosha.",
      specificPlacementKn: hasKuja ? `ಕುಜನು ${mars?.house}ನೇ ಮನೆಯಲ್ಲಿ ${mars ? getRashiKn(mars.rashi) : ""} ರಾಶಿಯಲ್ಲಿದ್ದಾರೆ.` : "ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷವಿಲ್ಲ.",
      specificPlacementEn: hasKuja ? `Mars occupies House ${mars?.house}.` : "No Kuja Dosha present.",
      remedyKn: "ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಗೆ ಅಭಿಷೇಕ ಮತ್ತು ಕೆಂಪು ವಸ್ತ್ರ ದಾನ.",
      remedyEn: "Subrahmanya Abhisheka on Tuesdays."
    },
    {
      id: "kala_sarpa",
      nameKn: "ಕಾಳಸರ್ಪ ಯೋಗ / ದೋಷ",
      nameEn: "Kala Sarpa Dosha",
      isPresent: hasKalaSarpa,
      howToSpotKn: "ಎಲ್ಲಾ 7 ಗ್ರಹಗಳು ರಾಹು ಮತ್ತು ಕೇತುಗಳ ಅಕ್ಷದ ನಡುವೆ ಬಂಧಿಯಾಗಿದ್ದರೆ ಕಾಳಸರ್ಪ ದೋಷ ಉಂಟಾಗುತ್ತದೆ.",
      howToSpotEn: "When all 7 planets are hemmed between Rahu and Ketu.",
      specificPlacementKn: hasKalaSarpa ? "ಎಲ್ಲಾ ಗ್ರಹಗಳು ರಾಹು-ಕೇತುಗಳ ಮಧ್ಯೆ ಬಂಧಿಯಾಗಿವೆ." : "ಗ್ರಹಗಳು ಮುಕ್ತವಾಗಿದ್ದು ಕಾಳಸರ್ಪ ದೋಷವಿಲ್ಲ.",
      specificPlacementEn: hasKalaSarpa ? "Planets hemmed between Rahu-Ketu." : "No Kala Sarpa Dosha.",
      remedyKn: "ಗೋಕರ್ಣ ಅಥವಾ ಶ್ರೀಕಾಳಹಸ್ತಿಯಲ್ಲಿ ಸರ್ಪ ಶಾಂತಿ ಪೂಜೆ.",
      remedyEn: "Sarpa Shanti at Gokarna Mahabaleshwara Temple."
    },
    {
      id: "pitru_dosha",
      nameKn: "ಪಿತೃ ದೋಷ",
      nameEn: "Pitru Dosha",
      isPresent: Boolean(hasPitru),
      howToSpotKn: "ಸೂರ್ಯನೊಂದಿಗೆ ರಾಹು/ಶನಿ ಯುತಿಯಾಗಿದ್ದರೆ ಅಥವಾ 9ನೇ ಮನೆಗೆ ರಾಹು ದೃಷ್ಟಿ ಇದ್ದರೆ ಪಿತೃ ದೋಷ ಉಂಟಾಗುತ್ತದೆ.",
      howToSpotEn: "Sun conjunct Rahu/Saturn or affliction to the 9th house.",
      specificPlacementKn: hasPitru ? "ಸೂರ್ಯ ಮತ್ತು ರಾಹು ಒಂದೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ." : "ಪಿತೃ ದೋಷ ಕಂಡುಬಂದಿಲ್ಲ.",
      specificPlacementEn: hasPitru ? "Sun-Rahu conjunction detected." : "No Pitru Dosha.",
      remedyKn: "ಗೋಕರ್ಣದಲ್ಲಿ ತಿಲ ತರ್ಪಣ ಮತ್ತು ಅಮಾವಾಸ್ಯೆಯಂದು ಅನ್ನದಾನ.",
      remedyEn: "Tila Tarpanam at Gokarna on Amavasya."
    },
    {
      id: "kemadruma",
      nameKn: "ಕೆಮದ್ರುಮ ಯೋಗ (ಏಕಾಂಗಿ ಮನಸ್ಸು)",
      nameEn: "Kemadruma Yoga",
      isPresent: hasKemadruma,
      howToSpotKn: "ಚಂದ್ರನ ಎರಡೂ ಬದಿಯ ಮನೆಗಳಲ್ಲಿ (2 ಮತ್ತು 12) ಸೂರ್ಯ/ಛಾಯಾಗ್ರಹಗಳನ್ನು ಹೊರತುಪಡಿಸಿ ಬೇರೆ ಗ್ರಹಗಳಿಲ್ಲದಿದ್ದರೆ.",
      howToSpotEn: "When Moon has no planets in 2nd or 12th from itself.",
      specificPlacementKn: hasKemadruma ? "ಚಂದ್ರನ ಪಕ್ಕದಲ್ಲಿ ಗ್ರಹಗಳಿಲ್ಲದಿರುವುದು ಏಕಾಂಗಿತನ ಮತ್ತು ಆತಂಕ ತರುತ್ತದೆ." : "ಚಂದ್ರನಿಗೆ ಗ್ರಹಗಳ ಬೆಂಬಲವಿದೆ.",
      specificPlacementEn: hasKemadruma ? "Isolated Moon detected." : "Moon is supported.",
      remedyKn: "ಸೋಮವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಹಾಲಿನ ಅಭಿಷೇಕ ಮತ್ತು ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ.",
      remedyEn: "Milk Abhisheka to Shiva on Mondays."
    },
    {
      id: "maandi_dosha",
      nameKn: "ಮಾಂದಿ / ಗುಳಿಕ ದೋಷ (99% ತಡೆ)",
      nameEn: "Maandi / Gulika Dosha",
      isPresent: hasMaandi,
      howToSpotKn: "ಮಾಂದಿಯು ಜಾತಕದಲ್ಲಿ ಕುಳಿತ ಮನೆಗೆ ಸಂಬಂಧಿಸಿದ ಕೆಲಸಗಳು 99% ತಲುಪಿ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಅಡೆತಡೆ ಎದುರಿಸುತ್ತವೆ.",
      howToSpotEn: "Maandi causes 99% task completion hurdles.",
      specificPlacementKn: `ಮಾಂದಿಯು ${kundli.maandi?.rashi ? getRashiKn(kundli.maandi.rashi) : ""} ರಾಶಿಯಲ್ಲಿದ್ದಾರೆ.`,
      specificPlacementEn: `Maandi in ${kundli.maandi?.rashi ? getRashiEn(kundli.maandi.rashi) : "Unknown"}.`,
      remedyKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಪತ್ರೆ ಸಮರ್ಪಣೆ ಮತ್ತು ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ.",
      remedyEn: "Bilva Patra to Gokarna Atma Linga on Saturdays."
    },
    {
      id: "dagdha_rashi_dosha",
      nameKn: "ತಿಥಿ ಶೂನ್ಯ / ದಗ್ಧ ರಾಶಿ ದೋಷ",
      nameEn: "Tithi Dagdha (Shoonya) Rashi Dosha",
      isPresent: hasDagdhaDosha,
      howToSpotKn: "ಹುಟ್ಟಿದ ತಿಥಿಗೆ ನಿಗದಿತ ದಗ್ಧ (ಶೂನ್ಯ) ರಾಶಿಯಲ್ಲಿ ಗ್ರಹಗಳು ಕುಳಿತಾಗ ಅವುಗಳ ಶುಭ ಫಲಗಳು ಸುಲಭವಾಗಿ ಸಿಗುವುದಿಲ್ಲ.",
      howToSpotEn: "Planets in Dagdha Rashis assigned to the birth Tithi become temporarily void of auspicious results.",
      specificPlacementKn: hasDagdhaDosha
        ? `${planetsInDagdha.map((p) => getPlanetKn(p.name)).join(", ")} ಗ್ರಹಗಳು ದಗ್ಧ ರಾಶಿಯಲ್ಲಿವೆ.`
        : "ಯಾವುದೇ ಗ್ರಹಗಳು ದಗ್ಧ ರಾಶಿಯಲ್ಲಿಲ್ಲ; ತಿಥಿ ನಿರ್ದೋಷವಾಗಿದೆ.",
      specificPlacementEn: hasDagdhaDosha
        ? `Planets in Dagdha Rashi: ${planetsInDagdha.map((p) => getPlanetEn(p.name)).join(", ")}.`
        : "No planets in Dagdha Rashis.",
      remedyKn: "ದಗ್ಧ ರಾಶ್ಯಾಧಿಪತಿಯ ಜಪ ಮತ್ತು ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿಯ ಆರಾಧನೆ.",
      remedyEn: "Worship Lakshmi Venkateshwara and chant dispositor mantra."
    },
    {
      id: "bhadra_karana_dosha",
      nameKn: "ಭದ್ರಾ ಕರಣ ದೋಷ (ವಿಷ್ಟಿ)",
      nameEn: "Vishti (Bhadra Karana) Dosha",
      isPresent: isVishtiBhadra,
      howToSpotKn: "ಪಂಚಾಂಗದ 7 ಚರ ಕರಣಗಳಲ್ಲಿ ಕೊನೆಯದಾದ 'ವಿಷ್ಟಿ' (ಭದ್ರಾ) ಕರಣದಲ್ಲಿ ಜನನವಾದರೆ ಶುಭ ಕಾರ್ಯಗಳಲ್ಲಿ ಕೊನೆಯ ಕ್ಷಣದ ವಿಳಂಬ ಉಂಟಾಗುತ್ತದೆ.",
      howToSpotEn: "Birth in Vishti (Bhadra Karana) causes last-mile bottlenecks in auspicious initiatives.",
      specificPlacementKn: isVishtiBhadra ? "ಜಾತಕರು ವಿಷ್ಟಿ (ಭದ್ರಾ) ಕರಣದಲ್ಲಿ ಜನಿಸಿದ್ದಾರೆ." : "ಭದ್ರಾ ಕರಣವಿಲ್ಲ; ಕರಣವು ಶುಭಕರವಾಗಿದೆ.",
      specificPlacementEn: isVishtiBhadra ? "Born in Vishti (Bhadra) Karana." : "Free from Bhadra Karana.",
      remedyKn: "ಶನಿವಾರ ಹನುಮಂತನಿಗೆ ಸಿಂಧೂರ ಲೇಪನ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಮತ್ತು ಎಳ್ಳೆಣ್ಣೆ ದೀಪ.",
      remedyEn: "Hanuman Chalisa recitation and sesame oil lamp on Saturdays."
    },
    {
      id: "ashubha_yoga_dosha",
      nameKn: "ಅಶುಭ ನಿತ್ಯ ಯೋಗ ದೋಷ",
      nameEn: "Inauspicious Nitya Yoga Dosha",
      isPresent: hasAshubhaYoga,
      howToSpotKn: "೨೭ ನಿತ್ಯ ಯೋಗಗಳಲ್ಲಿ ವ್ಯತೀಪಾತ, ವೈಧೃತಿ, ಶೂಲ, ಅತಿಗಂಡ, ಗಂಡ, ವ್ಯಾಘಾತ ಅಥವಾ ವಜ್ರ ಯೋಗದಲ್ಲಿ ಜನಿಸಿದರೆ ಆರೋಗ್ಯ ಮತ್ತು ಮನಃಶಾಂತಿಯಲ್ಲಿ ಏರುಪೇರು ಉಂಟಾಗಬಹುದು.",
      howToSpotEn: "Birth in severe yogas like Vyatipata, Vaidhriti, Shoola, Atiganda, Ganda, Vyaghata or Vajra.",
      specificPlacementKn: hasAshubhaYoga
        ? `ಜನನ ಯೋಗ: ${yogaNameKn} (${YOGAS_METADATA[yogaIdx]?.natureKn || ""}).`
        : `ಜನನ ಯೋಗ: ${yogaNameKn} (ಶುಭ ನಿತ್ಯ ಯೋಗ).`,
      specificPlacementEn: hasAshubhaYoga
        ? `Birth Yoga: ${yogaNameEn} (Requires Shanti).`
        : `Birth Yoga: ${yogaNameEn} (Auspicious).`,
      remedyKn: hasAshubhaYoga ? `${YOGAS_METADATA[yogaIdx]?.remedyKn || "ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗಾಯತ್ರೀ ಜಪ."}` : "ನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ.",
      remedyEn: hasAshubhaYoga ? "Rudrabhisheka and daily Gayatri chanting." : "Daily prayer to Ishta Devata."
    },
    {
      id: "upari_upagraha_dosha",
      nameKn: "ನಕ್ಷತ್ರ ಉಪರಿ / ಛಾಯಾಗ್ರಹ ವೇಧ ಬಾಧೆ",
      nameEn: "Nakshatra Upari (Upagraha Vedha) Affliction",
      isPresent: hasUpariAffliction,
      howToSpotKn: "ಅಪ್ರಕಾಶ ಉಪಗ್ರಹಗಳಾದ ಧೂಮ ಅಥವಾ ವ್ಯತೀಪಾತವು ಜನ್ಮ ನಕ್ಷತ್ರದ ಮೇಲೆ ಅಥವಾ ಲಗ್ನದ ಮೇಲೆ ಕುಳಿತಾಗ ಅಜ್ಞಾತ ಮಾನಸಿಕ ತೊಳಲಾಟ ಉಂಟಾಗುತ್ತದೆ.",
      howToSpotEn: "When subtle shadow upagrahas like Dhuma or Vyatipata occupy the natal Moon nakshatra.",
      specificPlacementKn: hasUpariAffliction
        ? "ಧೂಮ/ವ್ಯತೀಪಾತ ಛಾಯಾಗ್ರಹವು ಜನ್ಮ ನಕ್ಷತ್ರದ ನಿಕಟದಲ್ಲಿದೆ; ಉಪರಿ ಬಾಧೆ ಗೋಚರ."
        : "ನಕ್ಷತ್ರ ಉಪರಿ ವೇಧವಿಲ್ಲ; ಜನ್ಮ ನಕ್ಷತ್ರವು ಮುಕ್ತವಾಗಿದೆ.",
      specificPlacementEn: hasUpariAffliction
        ? "Subtle Upagraha (Dhuma/Vyatipata) casts shadow on natal nakshatra."
        : "Free from Upagraha Nakshatra Vedha.",
      remedyKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಿಲ್ವಾರ್ಚನೆ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ಸಂಕಲ್ಪ.",
      remedyEn: "Bilva archana at Gokarna Mahabaleshwara Kshetra."
    }
  ];

  // 2. Gandanthara Detection
  const moonNakIdx = moon?.nakshatra ? moon.nakshatra.index : 0;
  const isNakGandantara = [0, 8, 9, 16, 17, 26].includes(moonNakIdx); // Ashwini, Ashlesha, Magha, Jyeshtha, Moola, Revati
  const jalaDanger = [4, 8, 12].includes(moon?.house ?? 0) && (sat?.house === 4 || sat?.house === 8 || rahu?.house === 8);
  const vahanaDanger = [4, 8].includes(mars?.house ?? 0) || (sat?.house === 4);
  const agniDanger = (mars?.house === 1 || mars?.house === 8) && [0, 4, 8].includes(mars?.rashi.index ?? 0);

  const gandantharas = [
    {
      id: "nakshatra_gandantara",
      nameKn: "ನಕ್ಷತ್ರ ಗಂಡಾಂತರ",
      nameEn: "Nakshatra Gandantara",
      hazardTypeKn: "ಜಲ-ಅಗ್ನಿ ರಾಶಿ ಸಂಧಿಯ ನಕ್ಷತ್ರ ಗಂಡಾಂತರ",
      hazardTypeEn: "Water-Fire Zodiac Junction",
      howToSpotKn: "ಆಶ್ಲೇಷಾ-ಮಘಾ, ಜ್ಯೇಷ್ಠಾ-ಮೂಲಾ, ರೇವತಿ-ಅಶ್ವಿನಿ ಸಂಧಿಯಲ್ಲಿ ಜನನವಾದಾಗ ಉಂಟಾಗುತ್ತದೆ.",
      howToSpotEn: "Occurs at junctions: Ashlesha-Magha, Jyeshtha-Moola, Revati-Ashwini.",
      isDetected: isNakGandantara,
      safeAgeYears: 24,
      isPastSafeAge: currentAgeYears >= 24,
      precautionKn: "ಬಾಲ್ಯದಲ್ಲಿ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ಆಕಸ್ಮಿಕ ಜ್ವರ/ರೋಗಗಳ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ.",
      precautionEn: "Health vigilance during youth.",
      shantiKn: "ನಕ್ಷತ್ರ ಶಾಂತಿ ಮತ್ತು ಗೋ ಪ್ರದಕ್ಷಿಣೆ.",
      shantiEn: "Nakshatra Shanti ritual."
    },
    {
      id: "jala_gandantara",
      nameKn: "ಜಲ ಗಂಡಾಂತರ (ಆಳ ನೀರಿನ ಅಪಾಯ)",
      nameEn: "Jala Gandantara (Deep Water Hazard)",
      hazardTypeKn: "ನದಿ, ಸಾಗರ ಮತ್ತು ಆಳ ನೀರಿನ ಅಪಾಯ",
      hazardTypeEn: "Aquatic / Deep Water Hazard",
      howToSpotKn: "4ನೇ ಅಥವಾ 8ನೇ ಮನೆಯಲ್ಲಿ ಕ್ಷೀಣ ಚಂದ್ರ ಅಥವಾ ಶನಿ-ರಾಹು ಸಂಬಂಧವಿದ್ದಾಗ.",
      howToSpotEn: "Moon afflicted in 4th or 8th house.",
      isDetected: Boolean(jalaDanger),
      safeAgeYears: 28,
      isPastSafeAge: currentAgeYears >= 28,
      precautionKn: "28 ವರ್ಷ ವಯಸ್ಸಿನವರೆಗೆ ಆಳವಾದ ನದಿ, ಸಮುದ್ರದಲ್ಲಿ ಈಜಾಡುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ತಪ್ಪಿಸಬೇಕು.",
      precautionEn: "Strictly avoid swimming in deep turbulent waters till safe age.",
      shantiKn: "ವರುಣ ಶಾಂತಿ ಮತ್ತು ಗಂಗಾ ಜಲಾಭಿಷೇಕ.",
      shantiEn: "Ganga Jal Abhisheka to Lord Shiva."
    },
    {
      id: "vahana_gandantara",
      nameKn: "ವಾಹನ & ಅಪಘಾತ ಗಂಡಾಂತರ",
      nameEn: "Vahana Gandantara (Vehicle Accident Risk)",
      hazardTypeKn: "ವಾಹನ ಚಾಲನೆ ಮತ್ತು ರಸ್ತೆ ಅಪಘಾತ",
      hazardTypeEn: "Vehicular & Road Accident Hazard",
      howToSpotKn: "4ನೇ ಮನೆಯಲ್ಲಿ ಕುಜ-ಶನಿ ಯುತಿ ಅಥವಾ 8ನೇ ಮನೆಯಲ್ಲಿ ಕುಜ ಸ್ಥಿತಿ.",
      howToSpotEn: "Mars or Saturn afflicting 4th or 8th house.",
      isDetected: Boolean(vahanaDanger),
      safeAgeYears: 32,
      isPastSafeAge: currentAgeYears >= 32,
      precautionKn: "ಅತಿಯಾದ ವೇಗದ ಚಾಲನೆ ತಪ್ಪಿಸಬೇಕು; ರಾತ್ರಿ ವೇಳೆ ದ್ವಿಚಕ್ರ ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕತೆ.",
      precautionEn: "Exercise extreme caution against rash driving, especially at night.",
      shantiKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಕವಚ ಮತ್ತು ವಾಹನ ಪೂಜೆ.",
      shantiEn: "Subrahmanya Kavacha and vehicle sanctification."
    },
    {
      id: "agni_gandantara",
      nameKn: "ಅಗ್ನಿ & ವಿದ್ಯುತ್ ಗಂಡಾಂತರ",
      nameEn: "Agni Gandantara (Fire & Electrical Hazard)",
      hazardTypeKn: "ಅಗ್ನಿ, ಸುಟ್ಟಗಾಯ ಮತ್ತು ವಿದ್ಯುತ್ ಅವಘಡ",
      hazardTypeEn: "Fire & Electrical Hazards",
      howToSpotKn: "ಕುಜ ಅಥವಾ ಸೂರ್ಯ ಮೇಷ, ಸಿಂಹ, ಧನು ರಾಶಿಯಲ್ಲಿ 8ನೇ ಮನೆಯಲ್ಲಿದ್ದಾಗ.",
      howToSpotEn: "Mars or Sun in fiery signs in 8th house.",
      isDetected: Boolean(agniDanger),
      safeAgeYears: 21,
      isPastSafeAge: currentAgeYears >= 21,
      precautionKn: "ಬೆಂಕಿ ಮತ್ತು ವಿದ್ಯುತ್ ಉಪಕರಣಗಳೊಂದಿಗೆ ಜಾಗರೂಕತೆ.",
      precautionEn: "Avoid reckless handling of fire and high voltage electricals.",
      shantiKn: "ಮೃತ್ಯುಂಜಯ ಹೋಮ.",
      shantiEn: "Mrityunjaya Homa."
    }
  ];

  // 3. Subconscious Fears and Phobias
  const fears = [
    {
      id: "fear_darkness_solitude",
      fearNameKn: "ಕತ್ತಲೆ & ಒಂಟಿತನ ಭಯ (Nyctophobia & Isolation)",
      fearNameEn: "Darkness & Solitude Phobia",
      astrologicalOriginKn: "ಚಂದ್ರ-ಶನಿ ಯುತಿ (ವಿಷ ಯೋಗ) ಅಥವಾ 12ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರ",
      astrologicalOriginEn: "Moon afflicted by Saturn or in 12th house",
      isDetected: Boolean(moon && (sat?.house === moon.house || moon.house === 12)),
      manifestationKn: "ರಾತ್ರಿ ವೇಳೆ ಏಕಾಂಗಿಯಾಗಿರಲು ಭಯ, ಕತ್ತಲೆಯಲ್ಲಿ ಆತಂಕ, ಒಂಟಿಯಾಗಿ ಉಳಿಯುವ ಭೀತಿ.",
      manifestationEn: "Fear of darkness, panic when left alone, nocturnal unease.",
      counselingTipKn: "ದೀಪ ಹಚ್ಚಿ ಮಲಗುವುದು ಮತ್ತು ಮಲಗುವ ಮುನ್ನ ಶಿವನಾಮ ಸ್ಮರಣೆ ಮಾಡುವುದು.",
      counselingTipEn: "Sleep with a gentle nightlight and chant Shiva mantra."
    },
    {
      id: "fear_water",
      fearNameKn: "ಜಲ ಭಯ (Hydrophobia)",
      fearNameEn: "Deep Water Phobia",
      astrologicalOriginKn: "4ನೇ ಅಥವಾ 8ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರನಿಗೆ ರಾಹು/ಶನಿ ದೃಷ್ಟಿ",
      astrologicalOriginEn: "Moon in 4th/8th afflicted by malefics",
      isDetected: Boolean(jalaDanger),
      manifestationKn: "ಆಳವಾದ ನೀರನ್ನು ಕಂಡರೆ ತಲೆತಿರುಗುವಿಕೆ ಅಥವಾ ಮುಳುಗಿಹೋಗುವ ತಲ್ಲಣ.",
      manifestationEn: "Dread of swimming in deep or turbulent waters.",
      counselingTipKn: "ಬಲವಂತವಾಗಿ ನೀರಿನ ಸಾಹಸಕ್ಕೆ ಇಳಿಯಬೇಡಿ; ಜಲ ದೇವತೆಯ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.",
      counselingTipEn: "Avoid force-swimming; honor water with prayer."
    },
    {
      id: "fear_snakes",
      fearNameKn: "ಸರ್ಪ & ಕೀಟ ಭಯ (Ophidiophobia)",
      fearNameEn: "Snake & Reptile Phobia",
      astrologicalOriginKn: "2ನೇ ಅಥವಾ 8ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು, ಅಥವಾ ಚಂದ್ರನೊಂದಿಗೆ ರಾಹು",
      astrologicalOriginEn: "Rahu in 2nd/8th or conjunct Moon",
      isDetected: Boolean(rahu && (rahu.house === 2 || rahu.house === 8 || (moon && rahu.house === moon.house))),
      manifestationKn: "ಹಾವುಗಳ ಕನಸು ಬೀಳುವುದು, ಪೊದೆಗಳು ಮತ್ತು ಕತ್ತಲೆಯ ಮೂಲೆಗಳಲ್ಲಿ ಭಯ.",
      manifestationEn: "Recurring dreams of serpents, dread of dark corners.",
      counselingTipKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕಂ ಪಠಣೆ ಮತ್ತು ನಾಗರ ಪಂಚಮಿಯಂದು ಹಾಲೆರೆದು ಪ್ರಾರ್ಥನೆ.",
      counselingTipEn: "Chant Subrahmanya Ashtakam."
    },
    {
      id: "fear_blood_surgery",
      fearNameKn: "ರಕ್ತ & ಸೂಜಿ ಭಯ (Hemophobia)",
      fearNameEn: "Blood & Surgical Phobia",
      astrologicalOriginKn: "ಕುಜನು 6 ಅಥವಾ 8ನೇ ಮನೆಯಲ್ಲಿ ದುರ್ಬಲನಾಗಿದ್ದಾಗ",
      astrologicalOriginEn: "Afflicted Mars in 6th or 8th house",
      isDetected: Boolean(mars && (mars.house === 6 || mars.house === 8)),
      manifestationKn: "ರಕ್ತ ಅಥವಾ ಚುಚ್ಚುಮದ್ದನ್ನು ಕಂಡರೆ ಎದೆಬಡಿತ ಹೆಚ್ಚುವುದು ಅಥವಾ ತಲೆತಿರುಗುವುದು.",
      manifestationEn: "Fainting or dizziness at the sight of blood or injections.",
      counselingTipKn: "ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ಕಣ್ಣು ಮುಚ್ಚಿ ದೀರ್ಘ ಉಸಿರಾಟ ಮಾಡುವುದು.",
      counselingTipEn: "Practice mindful breathing during medical procedures."
    },
    {
      id: "fear_humiliation",
      fearNameKn: "ಸಾರ್ವಜನಿಕ ಅಪಕೀರ್ತಿ & ನಿಂದಾ ಭಯ",
      fearNameEn: "Social & Humiliation Phobia",
      astrologicalOriginKn: "ಸೂರ್ಯನಿಗೆ ರಾಹು ಸಂಬಂಧ ಅಥವಾ 10ನೇ ಮನೆಗೆ ಪಾಪಗ್ರಹಗಳ ಬಾಧೆ",
      astrologicalOriginEn: "Sun afflicted by Rahu/Saturn",
      isDetected: Boolean(hasPitru),
      manifestationKn: "ಸಮಾಜದಲ್ಲಿ ತನ್ನ ಮಾನ-ಮರ್ಯಾದೆಗೆ ಧಕ್ಕೆ ಬರುವುದೇ ಎಂಬ ಅತಿಯಾದ ನಿರಂತರ ಆತಂಕ.",
      manifestationEn: "Persistent dread of reputational loss or public shame.",
      counselingTipKn: "ಸತ್ಯವಂತರಾಗಿರಿ, ಇತರರ ಚುಚ್ಚುಮಾತುಗಳಿಗೆ ವಿಚಲಿತರಾಗದೆ ಆತ್ಮಸ್ಥೈರ್ಯ ಕಾಪಾಡಿ.",
      counselingTipEn: "Anchor confidence in truthfulness; dismiss idle gossip."
    }
  ];

  // 4. Inner Secrets & Hidden Traits
  const house8Sign = getHouseRashi(lagnaRashiIdx, 8);
  const house8Occupants = getHouseOccupants(kundli, 8);
  const house8OccKn = house8Occupants.map((p) => getPlanetKn(p.name)).join(", ") || "ಖಾಲಿ";
  const innerSecrets = [
    {
      domainKn: "8ನೇ ಮನೆಯ ಆಂತರಿಕ ರಹಸ್ಯ (Hidden Karmic Drive)",
      domainEn: "8th House Secret Motivation",
      hiddenTraitKn: `ನಿಮ್ಮ 8ನೇ ಮನೆ ${getRashiKn(house8Sign)} ಆಗಿದ್ದು, ಇಲ್ಲಿ ${house8OccKn} ಗ್ರಹಗಳಿವೆ. ನೀವು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಮತ್ತು ಆಳವಾದ ನೋವುಗಳನ್ನು ಯಾರಿಗೂ ಸುಲಭವಾಗಿ ಹೇಳಿಕೊಳ್ಳುವುದಿಲ್ಲ.`,
      hiddenTraitEn: `8th house is ${getRashiEn(house8Sign)}. You guard your financial reserves and deepest vulnerabilities strictly within yourself.`,
      astrologicalWhyKn: "8ನೇ ಮನೆಯು ಅಷ್ಟಮ ಗುಪ್ತ ಸ್ಥಾನವಾಗಿದ್ದು, ವ್ಯಕ್ತಿಯ ರಹಸ್ಯ ಮನಸ್ಸನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.",
      astrologicalWhyEn: "8th house governs confidential reserves and unexpressed inner battles."
    },
    {
      domainKn: "ಅಂತರ್ಮುಖಿ ಭಾವನಾತ್ಮಕ ರಹಸ್ಯ",
      domainEn: "Emotional Secrecy",
      hiddenTraitKn: "ಹೊರಗಡೆ ನಗುಮುಖ ಪ್ರದರ್ಶಿಸಿದರೂ, ಮನಸ್ಸಿನೊಳಗೆ ಹಳೆಯ ನೆನಪುಗಳನ್ನು ವರ್ಷಗಟ್ಟಲೆ ಜೀವಂತವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುವ ಸ್ವಭಾವ.",
      hiddenTraitEn: "Behind a smiling exterior lies a memory that holds past grievances for years.",
      astrologicalWhyKn: "ಚಂದ್ರನ ರಾಶಿ ಮತ್ತು ನಕ್ಷತ್ರದ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ.",
      astrologicalWhyEn: "Governed by the lunar subconscious retention pattern."
    }
  ];

  // 5. Temperament Diagnostics: Cruel vs Gentle (ಸ್ವಭಾವ ಪರೀಕ್ಷೆ)
  let cruelScore = 0;
  let gentleScore = 0;

  // Check 1st house & Lagna Lord
  const occupants1 = getHouseOccupants(kundli, 1);
  for (const p of occupants1) {
    if ([PlanetName.Mars, PlanetName.Rahu, PlanetName.Saturn, PlanetName.Sun].includes(p.name)) cruelScore += 2;
    if ([PlanetName.Jupiter, PlanetName.Venus, PlanetName.Mercury].includes(p.name)) gentleScore += 2;
  }
  // Check Moon occupants
  if (moon) {
    const moonCon = kundli.planets.filter((p) => p.name !== PlanetName.Moon && p.house === moon.house);
    for (const p of moonCon) {
      if ([PlanetName.Mars, PlanetName.Rahu, PlanetName.Saturn].includes(p.name)) cruelScore += 2;
      if ([PlanetName.Jupiter, PlanetName.Venus, PlanetName.Mercury].includes(p.name)) gentleScore += 2;
    }
  }
  // Check aspects on Lagna
  const aspects1 = getAspectingPlanets(kundli, 1);
  for (const a of aspects1) {
    if ([PlanetName.Mars, PlanetName.Saturn, PlanetName.Rahu].includes(a.planet.name)) cruelScore += 1;
    if ([PlanetName.Jupiter, PlanetName.Venus].includes(a.planet.name)) gentleScore += 2;
  }

  let disposition: "gentle" | "cruel_assertive" | "mixed" = "mixed";
  let titleKn = "ಮಿಶ್ರ ಪ್ರಕೃತಿ (ಸೌಮ್ಯ ಹೃದಯದೊಂದಿಗೆ ಕರ್ತವ್ಯದ ಶಿಸ್ತು)";
  let titleEn = "Balanced Disposition (Compassionate heart with firm boundaries)";
  let analysisKn = "ನಿಮ್ಮ ಸ್ವಭಾವವು ಸ್ವಾಭಾವಿಕವಾಗಿ ದಯಾಪರವಾಗಿದೆ, ಆದರೆ ಅನ್ಯಾಯ ಅಥವಾ ಅವಮಾನವಾದಾಗ ಕ್ಷಾತ್ರ ತೇಜಸ್ಸು ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ.";
  let analysisEn = "Naturally compassionate, yet assertive and uncompromising when confronted with injustice.";

  if (gentleScore >= cruelScore + 2) {
    disposition = "gentle";
    titleKn = "ಪರಮ ಸೌಮ್ಯ & ಧಾರ್ಮಿಕ ಪ್ರಕೃತಿ (Gentle, Forgiving & Sattvic)";
    titleEn = "Gentle, Forgiving & Sattvic Temperament";
    analysisKn = "ಜಾತಕದಲ್ಲಿ ಗುರು/ಶುಕ್ರ/ಬುಧನ ಪ್ರಭಾವ ಹೆಚ್ಚಿದ್ದು, ಯಾರನ್ನೂ ನೋಯಿಸಲಾಗದ ಕರುಣಾಮಯಿ ಹೃದಯವಿದೆ. ಕ್ಷಮಾ ಗುಣ ಮತ್ತು ಉಪಕಾರ ಮಾಡುವ ಬುದ್ಧಿ ಇವರ ರಕ್ತದಲ್ಲಿದೆ.";
    analysisEn = "Dominated by benefics; incapable of cruelty, possessing an empathetic heart and forgiving spirit.";
  } else if (cruelScore >= gentleScore + 2) {
    disposition = "cruel_assertive";
    titleKn = "ಉಗ್ರ & ಸ್ವಾಭಿಮಾನಿ ಕ್ಷಾತ್ರ ಪ್ರಕೃತಿ (Assertive, Fiery & Intolerant of Injustice)";
    titleEn = "Fiery, Assertive & Strict Temperament";
    analysisKn = "ಜಾತಕದಲ್ಲಿ ಕುಜ/ಸೂರ್ಯ/ಶನಿಯ ಪ್ರಭಾವ ಹೆಚ್ಚಿದ್ದು, ತಪ್ಪುಗಳನ್ನು ಕ್ಷಮಿಸುವುದು ಕಷ್ಟ. ಕೋಪ ಬಂದಾಗ ಮಾತು ಕಠೋರವಾಗಬಹುದು; ಕಠಿಣ ಶಿಸ್ತುಗಾರರು.";
    analysisEn = "Strong martial/solar influence; fierce intolerance for incompetence and sharp verbal reactions when provoked.";
  }

  const temperament = {
    disposition,
    titleKn,
    titleEn,
    shastricRuleKn: "ಸೌಮ್ಯಗ್ರಹೇ ತನೌ ಶಾಂತಃ ಕ್ರೂರೇ ತೀಕ್ಷ್ಣೋ ನ ಸಂಶಯಃ । ಶುಭಾಶುಭ ಸಮಾಯೋಗೇ ಮಧ್ಯಮೋ ಜಾಯತೇ ನರಃ ॥",
    shastricRuleEn: "Benefics in Lagna grant tranquility; malefics grant fiery severity.",
    analysisKn,
    analysisEn,
    cruelScore,
    gentleScore,
    howToSpotKn: "ಲಗ್ನ, ಲಗ್ನಾಧಿಪತಿ ಮತ್ತು ಚಂದ್ರನ ಮೇಲೆ ಗುರು/ಶುಕ್ರರ ದೃಷ್ಟಿಯಿದ್ದರೆ ಸೌಮ್ಯ; ಕುಜ/ರಾಹು/ಶನಿಯ ಪ್ರಭಾವ ಹೆಚ್ಚಿದ್ದರೆ ತೀಕ್ಷ್ಣ ಪ್ರಕೃತಿ.",
    howToSpotEn: "Benefic aspects on Lagna/Moon indicate gentleness; Mars/Rahu/Saturn dominance indicates strict severity.",
    spokenAdviceKn: disposition === "cruel_assertive"
      ? "ಕೋಪ ಬಂದಾಗ ಯಾವುದೇ ಆತುರದ ತೀರ್ಮಾನ ಅಥವಾ ಕಠೋರ ಮಾತುಗಳನ್ನು ಆಡಬೇಡಿ. ಸ್ವಲ್ಪ ಸಮಯ ಮೌನ ವಹಿಸುವುದು ನಿಮ್ಮ ಯಶಸ್ಸಿನ ಗುಟ್ಟು."
      : "ನಿಮ್ಮ ಒಳ್ಳೆಯತನವನ್ನು ಜನರು ದುರ್ಬಳಕೆ ಮಾಡಿಕೊಳ್ಳದಂತೆ ಮೃದುವಾಗಿದ್ದರೂ ದೃಢವಾಗಿರಲು ಕಲಿಯಿರಿ.",
    spokenAdviceEn: disposition === "cruel_assertive"
      ? "When provoked, practice conscious silence before replying."
      : "Do not let people exploit your kindness; balance softness with firm boundaries."
  };

  return {
    doshas,
    gandantharas,
    fears,
    innerSecrets,
    temperament
  };
}

// ---------------------------------------------------------
// PANCHANGA ANGAS, NAKSHATRA, YOGA, KARANA & UPAGRAHAS ENGINE
// ---------------------------------------------------------

export const DAGDHA_RASHIS_BY_TITHI: Record<number, number[]> = {
  1: [6, 9], // Tula, Makara
  2: [8, 11], // Dhanu, Meena
  3: [4, 9], // Simha, Makara
  4: [1, 10], // Vrishabha, Kumbha
  5: [2, 5], // Mithuna, Kanya
  6: [0, 4], // Mesha, Simha
  7: [8, 3], // Dhanu, Karka
  8: [2, 5], // Mithuna, Kanya
  9: [4, 7], // Simha, Vrischika
  10: [4, 7], // Simha, Vrischika
  11: [8, 11], // Dhanu, Meena
  12: [6, 9], // Tula, Makara
  13: [1, 4], // Vrishabha, Simha
  14: [2, 5, 8, 11], // Mithuna, Kanya, Dhanu, Meena
  15: [], // Purnima
  16: [6, 9],
  17: [8, 11],
  18: [4, 9],
  19: [1, 10],
  20: [2, 5],
  21: [0, 4],
  22: [8, 3],
  23: [2, 5],
  24: [4, 7],
  25: [4, 7],
  26: [8, 11],
  27: [6, 9],
  28: [1, 4],
  29: [2, 5, 8, 11],
  30: [] // Amavasya
};

export const NAKSHATRAS_METADATA = [
  {
    nameKn: "ಅಶ್ವಿನಿ",
    nameEn: "Ashwini",
    lordKn: "ಕೇತು",
    lordEn: "Ketu",
    devataKn: "ಅಶ್ವಿನಿ ಕುಮಾರರು (ದೇವ ವೈದ್ಯರು)",
    devataEn: "Ashwini Kumaras (Celestial Physicians)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಅಶ್ವ (ಕುದುರೆ)",
    yoniEn: "Horse",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಕುದುರೆಯ ಮುಖ",
    symbolEn: "Horse Head",
    karmicMeaningKn: "ವೇಗ, ನವ ಚೈತನ್ಯ, ಅನ್ವೇಷಣಾ ಮನೋಭಾವ ಮತ್ತು ಸಂಕಷ್ಟಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಪರಿಹರಿಸುವ ಶಕ್ತಿ.",
    karmicMeaningEn: "Swift initiative, energetic vitality, spontaneous healing and pioneering drive.",
    howNakshatraHelpsKn: "ಅಶ್ವಿನಿ ನಕ್ಷತ್ರವು ಜಾತಕರಿಗೆ ಕಷ್ಟದ ಸನ್ನಿವೇಶಗಳಿಂದ ಶೀಘ್ರವಾಗಿ ಚೇತರಿಸಿಕೊಳ್ಳುವ ಅಸಾಧಾರಣ ದೈಹಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಸಂಜೀವಿನಿ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants rapid healing, miraculous bounce-back ability from crises, and sharp entrepreneurial intuition."
  },
  {
    nameKn: "ಭರಣಿ",
    nameEn: "Bharani",
    lordKn: "ಶುಕ್ರ",
    lordEn: "Venus",
    devataKn: "ಯಮಧರ್ಮರಾಜ",
    devataEn: "Yama (God of Dharma & Transition)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಗಜ (ಆನೆ)",
    yoniEn: "Elephant",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಯೋನಿ / ನೌಕೆ",
    symbolEn: "Yoni / Boat",
    karmicMeaningKn: "ಸಹನಾ ಶಕ್ತಿ, ಪರಿವರ್ತನೆ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಮತ್ತು ತೀವ್ರ ಭಾವನಾತ್ಮಕ ನಿಷ್ಠೆ.",
    karmicMeaningEn: "Endurance, creative metamorphosis, ethical conviction and emotional intensity.",
    howNakshatraHelpsKn: "ಭರಣಿ ನಕ್ಷತ್ರವು ಎಂತಹ ಕಠಿಣ ಜವಾಬ್ದಾರಿಗಳನ್ನೂ ಹೊತ್ತು ಮುನ್ನಡೆಯುವ ತಾಳ್ಮೆ ಮತ್ತು ಕಲಾತ್ಮಕ ಸೃಜನಶೀಲತೆಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    howNakshatraHelpsEn: "Empowers the native to shoulder monumental responsibilities and emerge victorious through transformative crises."
  },
  {
    nameKn: "ಕೃತ್ತಿಕಾ",
    nameEn: "Krittika",
    lordKn: "ಸೂರ್ಯ",
    lordEn: "Sun",
    devataKn: "ಅಗ್ನಿದೇವ",
    devataEn: "Agni (Fire God)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಮೇಷ (ಕುರಿ)",
    yoniEn: "Sheep",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಕತ್ತರಿ / ಜ್ವಾಲೆ",
    symbolEn: "Razor / Flame",
    karmicMeaningKn: "ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ, ಸತ್ಯನಿಷ್ಠೆ, ಶುದ್ಧೀಕರಣ ಮತ್ತು ಅನ್ಯಾಯವನ್ನು ಕಡಿದುಹಾಕುವ ಛಲ.",
    karmicMeaningEn: "Sharp discrimination, purifying fire, direct honesty and cutting through illusions.",
    howNakshatraHelpsKn: "ಕೃತ್ತಿಕಾ ನಕ್ಷತ್ರವು ಸತ್ಯ-ಅಸತ್ಯಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಪ್ರತ್ಯೇಕಿಸುವ ತೀಕ್ಷ್ಣ ವಿವೇಚನೆ ಮತ್ತು ನಾಯಕತ್ವ ತೇಜಸ್ಸನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Endows razor-sharp discernment, magnetic leadership aura, and relentless drive to burn away negativities."
  },
  {
    nameKn: "ರೋಹಿಣಿ",
    nameEn: "Rohini",
    lordKn: "ಚಂದ್ರ",
    lordEn: "Moon",
    devataKn: "ಬ್ರಹ್ಮದೇವ (ಪ್ರಜಾಪತಿ)",
    devataEn: "Brahma / Prajapati",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಸರ್ಪ (ಹಾವು)",
    yoniEn: "Serpent",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ಪೃಥ್ವಿ ತತ್ವ",
    tatvaEn: "Prithvi (Earth)",
    symbolKn: "ರಥ / ಬಂಡಿ",
    symbolEn: "Chariot / Temple Cart",
    karmicMeaningKn: "ಸೌಂದರ್ಯ, ಆಕರ್ಷಣೆ, ಫಲವತ್ತತೆ, ಸಮೃದ್ಧಿ ಮತ್ತು ಕಲಾತ್ಮಕ ಆನಂದ.",
    karmicMeaningEn: "Fertility, aesthetic charm, material abundance, luxury and sensory growth.",
    howNakshatraHelpsKn: "ರೋಹಿಣಿ ನಕ್ಷತ್ರವು ಧನಾಗಮನ, ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಎಲ್ಲರನ್ನೂ ಆಕರ್ಷಿಸುವ ಸೌಮ್ಯ ವ್ಯಕ್ತಿತ್ವವನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Cultivates fertile material prosperity, creative charm, and deeply affectionate family bonds."
  },
  {
    nameKn: "ಮೃಗಶಿರಾ",
    nameEn: "Mrigashira",
    lordKn: "ಕುಜ",
    lordEn: "Mars",
    devataKn: "ಸೋಮದೇವ (ಚಂದ್ರ/ಅಮೃತ)",
    devataEn: "Soma (Moon/Nectar)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಸರ್ಪ (ಹಾವು)",
    yoniEn: "Serpent",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಪೃಥ್ವಿ ತತ್ವ",
    tatvaEn: "Prithvi (Earth)",
    symbolKn: "ಜಿಂಕೆಯ ತಲೆ",
    symbolEn: "Deer Head",
    karmicMeaningKn: "ಜ್ಞಾನಾನ್ವೇಷಣೆ, ಚುರುಕುತನ, ಸಂಶೋಧನಾ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಪ್ರಯಾಣ ಪ್ರಿಯತೆ.",
    karmicMeaningEn: "Relentless quest for knowledge, agility, curiosity and investigative acumen.",
    howNakshatraHelpsKn: "ಮೃಗಶಿರಾ ನಕ್ಷತ್ರವು ಜಾತಕರಿಗೆ ಸೂಕ್ಷ್ಮ ಸಂಶೋಧನೆ, ಸಂವಹನ ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳನ್ನು ಗ್ರಹಿಸುವ ಚುರುಕನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants intellectual curiosity, rapid adaptation, and acute skill in spotting golden opportunities."
  },
  {
    nameKn: "ಆರ್ದ್ರಾ",
    nameEn: "Ardra",
    lordKn: "ರಾಹು",
    lordEn: "Rahu",
    devataKn: "ರುದ್ರದೇವ",
    devataEn: "Rudra (God of Storms & Transformation)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಶ್ವಾನ (ನಾಯಿ)",
    yoniEn: "Dog",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಕಣ್ಣೀರಿನ ಹನಿ / ವಜ್ರ",
    symbolEn: "Teardrop / Diamond",
    karmicMeaningKn: "ಬಿರುಗಾಳಿಯಂತಹ ಪರಿವರ್ತನೆ, ಹಳೆಯ ಸಂಕಷ್ಟಗಳ ಕರಗುವಿಕೆ ಮತ್ತು ತಪಸ್ಸಿನ ಶಕ್ತಿ.",
    karmicMeaningEn: "Stormy breakthroughs, emotional catharsis, technological depth and resilience.",
    howNakshatraHelpsKn: "ಆರ್ದ್ರಾ ನಕ್ಷತ್ರವು ಕಠಿಣ ಸಂಕಟಗಳಿಂದ ಶುದ್ಧೀಕರಿಸಲ್ಪಟ್ಟು ನವಜನ್ಮ ಪಡೆಯುವ ಅಸಾಧಾರಣ ಮಾನಸಿಕ ಧೃಢತೆಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Empowers the soul to dissolve dense karmic knots and rebuild life with indestructible intellectual power."
  },
  {
    nameKn: "ಪುನರ್ವಸು",
    nameEn: "Punarvasu",
    lordKn: "ಗುರು",
    lordEn: "Jupiter",
    devataKn: "ಅದಿತಿ (ದೇವಮಾತೆ)",
    devataEn: "Aditi (Cosmic Mother)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಮಾರ್ಜಾಲ (ಬೆಕ್ಕು)",
    yoniEn: "Cat",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಬಿಲ್ಲು & ಬತ್ತಳಿಕೆ",
    symbolEn: "Bow & Quiver of Arrows",
    karmicMeaningKn: "ಪುನಶ್ಚೇತನ, ಕಳೆದುಹೋದ ಸಂಪತ್ತಿನ ಮರುಪ್ರಾಪ್ತಿ, ಸದಾಚಾರ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆ.",
    karmicMeaningEn: "Renewal, retrieval of lost status, motherly benevolence and spiritual homecoming.",
    howNakshatraHelpsKn: "ಪುನರ್ವಸು ನಕ್ಷತ್ರವು ಒಮ್ಮೆ ಕಳೆದುಹೋದ ಗೌರವ, ಸಂಪತ್ತು ಅಥವಾ ಸಂಬಂಧಗಳು ಮತ್ತೆ ಮರಳಿ ಬರುವಂತೆ ಮಾಡುವ ಸಂಜೀವಿನಿ.",
    howNakshatraHelpsEn: "Guarantees that lost opportunities, wealth, and goodwill return magnified through divine maternal grace."
  },
  {
    nameKn: "ಪುಷ್ಯ",
    nameEn: "Pushya",
    lordKn: "ಶನಿ",
    lordEn: "Saturn",
    devataKn: "ಬೃಹಸ್ಪತಿ (ದೇವಗುರು)",
    devataEn: "Brihaspati (Preceptor of Gods)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಮೇಷ (ಕುರಿ)",
    yoniEn: "Sheep",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಕಮಲ / ಹಸುವಿನ ಕೆಚ್ಚಲು",
    symbolEn: "Cow Udder / Lotus Flower",
    karmicMeaningKn: "ಪೋಷಣೆ, ಧಾರ್ಮಿಕ ಉನ್ನತಿ, ಸಮಸ್ತ ಶುಭ ಕಾರ್ಯಗಳ ಸಿದ್ಧಿ ಮತ್ತು ದೈವಾನುಗ್ರಹ.",
    karmicMeaningEn: "Supreme nourishment, spiritual preeminence, moral rectitude and unshakeable dharma.",
    howNakshatraHelpsKn: "ರಾಶಿಚಕ್ರದ ಅತ್ಯಂತ ಪವಿತ್ರ ನಕ್ಷತ್ರವಾದ ಪುಷ್ಯವು ಜಾತಕರಿಗೆ ಯಾವುದೇ ಶಾಪ ಅಥವಾ ದೋಷವನ್ನು ಕರಗಿಸುವ ಕವಚವನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Acts as a celestial armor that nourishes health, purifies ancestral karma, and ensures lasting prosperity."
  },
  {
    nameKn: "ಆಶ್ಲೇಷಾ",
    nameEn: "Ashlesha",
    lordKn: "ಬುಧ",
    lordEn: "Mercury",
    devataKn: "ಸರ್ಪದೇವತೆಗಳು (ನಾಗರು)",
    devataEn: "Sarpas (Nagas / Serpent Deities)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಮಾರ್ಜಾಲ (ಬೆಕ್ಕು)",
    yoniEn: "Cat",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಸುರುಳಿ ನಾಗ",
    symbolEn: "Coiled Serpent",
    karmicMeaningKn: "ಕುಂಡಲಿನೀ ಶಕ್ತಿ, ಗೂಢ ಜ್ಞಾನ, ರಹಸ್ಯ ಭೇದನೆ ಮತ್ತು ರಕ್ಷಣಾತ್ಮಕ ಎಚ್ಚರಿಕೆ.",
    karmicMeaningEn: "Kundalini force, profound occult depth, hypnotic intuition and tactical caution.",
    howNakshatraHelpsKn: "ಆಶ್ಲೇಷಾ ನಕ್ಷತ್ರವು ಶತ್ರುಗಳ ಗುಪ್ತ ತಂತ್ರಗಳನ್ನು ಮೊದಲೇ ಗ್ರಹಿಸುವ ಅತೀಂದ್ರಿಯ ದೃಷ್ಟಿ ಮತ್ತು ಜ್ಞಾನವನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants intuitive radar to anticipate hidden risks and access deep esoteric wisdom."
  },
  {
    nameKn: "ಮಖಾ",
    nameEn: "Magha",
    lordKn: "ಕೇತು",
    lordEn: "Ketu",
    devataKn: "ಪಿತೃದೇವತೆಗಳು",
    devataEn: "Pitrus (Ancestral Forefathers)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಮೂಷಿಕ (ಇಲಿ)",
    yoniEn: "Rat",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ರಾಜ ಸಿಂಹಾಸನ / ಪಲ್ಲಕ್ಕಿ",
    symbolEn: "Royal Throne / Palanquin",
    karmicMeaningKn: "ವಂಶ ಪರಂಪರೆ, ರಾಜ ಮರ್ಯಾದೆ, ಪಿತೃ ಕೃಪೆ ಮತ್ತು ನಾಯಕತ್ವದ ಗಾಂಭೀರ್ಯ.",
    karmicMeaningEn: "Ancestral lineage, aristocratic dignity, leadership authority and traditional legacy.",
    howNakshatraHelpsKn: "ಮಖಾ ನಕ್ಷತ್ರವು ಪೂರ್ವಜರ ಪುಣ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಅಧಿಕಾರ ಸ್ಥಾನವನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    howNakshatraHelpsEn: "Awakens ancestral blessings (Pitru Kripa) to elevate the native to influential, respected roles."
  },
  {
    nameKn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ",
    nameEn: "Purva Phalguni",
    lordKn: "ಶುಕ್ರ",
    lordEn: "Venus",
    devataKn: "ಭಗ (ಸೌಭಾಗ್ಯ ದೇವ)",
    devataEn: "Bhaga (God of Fortune & Prosperity)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಮೂಷಿಕ (ಇಲಿ)",
    yoniEn: "Rat",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಹೂವಿನ ಮಂಚ / ವಿಶ್ರಾಂತಿ ಆಸನ",
    symbolEn: "Hammock / Restful Couch",
    karmicMeaningKn: "ಸೌಭಾಗ್ಯ, ಕಲಾತ್ಮಕ ಆನಂದ, ವೈವಾಹಿಕ ಪ್ರೇಮ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಸೌಖ್ಯ.",
    karmicMeaningEn: "Romantic bliss, artistic refinement, conjugal harmony and relaxed prosperity.",
    howNakshatraHelpsKn: "ಪೂರ್ವ ಫಲ್ಗುಣಿಯು ಬದುಕಿನಲ್ಲಿ ಸಂತೋಷ, ಉತ್ತಮ ಸ್ನೇಹಿತರು ಹಾಗೂ ಸುಖಮಯ ಜೀವನವನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Bestows warm social popularity, artistic flair, and harmonious domestic joy."
  },
  {
    nameKn: "ಉತ್ತರ ಫಲ್ಗುಣಿ",
    nameEn: "Uttara Phalguni",
    lordKn: "ಸೂರ್ಯ",
    lordEn: "Sun",
    devataKn: "ಆರ್ಯಮಾ (ಧರ್ಮ & ಸ್ನೇಹ ದೇವ)",
    devataEn: "Aryama (God of Patronage & Nobility)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಗೋವು (ಹಸು)",
    yoniEn: "Cow",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಮಂಚದ ಕಾಲುಗಳು",
    symbolEn: "Bed Legs / Pillars",
    karmicMeaningKn: "ಪರೋಪಕಾರ, ಕರುಣೆ, ಸ್ಥಿರ ಸಂಬಂಧಗಳು ಮತ್ತು ಉನ್ನತ ವ್ಯವಹಾರ ನಿಷ್ಠೆ.",
    karmicMeaningEn: "Philanthropy, benevolent patronage, contractual fidelity and honorable friendships.",
    howNakshatraHelpsKn: "ಉತ್ತರ ಫಲ್ಗುಣಿಯು ಜಾತಕರಿಗೆ ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡುವ ಸಜ್ಜನ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ದೃಢ ವಿಶ್ವಾಸಾರ್ಹತೆಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Fosters noble integrity, generous charity, and lifelong loyalty from superiors and friends."
  },
  {
    nameKn: "ಹಸ್ತಾ",
    nameEn: "Hasta",
    lordKn: "ಚಂದ್ರ",
    lordEn: "Moon",
    devataKn: "ಸವಿತೃ (ಸೂರ್ಯನ ಜ್ಯೋತಿರ್ಮಯ ರೂಪ)",
    devataEn: "Savitr (The Golden Solar Initiator)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಮಹಿಷ (ಕೋಣ)",
    yoniEn: "Buffalo",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಪೃಥ್ವಿ ತತ್ವ",
    tatvaEn: "Prithvi (Earth)",
    symbolKn: "ಅಭಯ ಹಸ್ತ (ಬೆರಳುಗಳುಳ್ಳ ಕೈ)",
    symbolEn: "Open Hand / Blessing Palm",
    karmicMeaningKn: "ಕರಕೌಶಲ, ಚಿಕಿತ್ಸಾ ಸ್ಪರ್ಶ, ವ್ಯಾಪಾರ ಚತುರತೆ ಮತ್ತು ವಾಕ್ಚಾತುರ್ಯ.",
    karmicMeaningEn: "Handicrafts, healing touch, commercial resourcefulness and dexterous intelligence.",
    howNakshatraHelpsKn: "ಹಸ್ತಾ ನಕ್ಷತ್ರವು ಕೈಯಿಂದ ಮಾಡುವ ಯಾವುದೇ ಕೆಲಸದಲ್ಲಿ ಅದ್ಭುತ ಕೌಶಲ ಹಾಗೂ ಲೆಕ್ಕಾಚಾರದ ವ್ಯಾಪಾರ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants nimble artistic or surgical craft, healing hands, and swift mastery in commerce."
  },
  {
    nameKn: "ಚಿತ್ತಾ",
    nameEn: "Chitra",
    lordKn: "ಕುಜ",
    lordEn: "Mars",
    devataKn: "ತ್ವಷ್ಟಾ (ವಿಶ್ವಕರ್ಮ / ವಾಸ್ತುಶಿಲ್ಪಿ)",
    devataEn: "Tvashtr (Divine Architect / Artisan)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ವ್ಯಾಘ್ರ (ಹುಲಿ)",
    yoniEn: "Tiger",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಪೃಥ್ವಿ ತತ್ವ",
    tatvaEn: "Prithvi (Earth)",
    symbolKn: "ಪ್ರಕಾಶಮಾನ ರತ್ನ / ಮುತ್ತು",
    symbolEn: "Shining Gem / Pearl",
    karmicMeaningKn: "ವಾಸ್ತುಶಿಲ್ಪ, ವಿನ್ಯಾಸ, ಕಲಾ ಸೌಂದರ್ಯ ಮತ್ತು ಆಕರ್ಷಕ ನಿರ್ಮಾಣ ಶಕ್ತಿ.",
    karmicMeaningEn: "Architectural vision, sparkling design, aesthetic innovation and dazzling presence.",
    howNakshatraHelpsKn: "ಚಿತ್ತಾ ನಕ್ಷತ್ರವು ಕಲ್ಪನೆಗಳನ್ನು ಅದ್ಭುತ ವಾಸ್ತವ ವಿನ್ಯಾಸಗಳನ್ನಾಗಿ ಪರಿವರ್ತಿಸುವ ಶಿಲ್ಪಕಲಾ ಪ್ರತಿಭೆಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Endows visionary design talent, structural elegance, and unforgettable personal charisma."
  },
  {
    nameKn: "ಸ್ವಾತಿ",
    nameEn: "Swati",
    lordKn: "ರಾಹು",
    lordEn: "Rahu",
    devataKn: "ವಾಯುದೇವ",
    devataEn: "Vayu (Wind God)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಮಹಿಷ (ಕೋಣ)",
    yoniEn: "Buffalo",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ಗಾಳಿಯಲ್ಲಿ ತೂಗುವ ಎಳೆಯ ಸಸಿ",
    symbolEn: "Young Sprout in the Wind",
    karmicMeaningKn: "ಸ್ವಾತಂತ್ರ್ಯ, ನಮ್ರತೆ, ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ ಮತ್ತು ಹೊಂದಾಣಿಕೆಯ ಚಾತುರ್ಯ.",
    karmicMeaningEn: "Independence, diplomatic flexibility, commercial expansion and graceful adaptability.",
    howNakshatraHelpsKn: "ಸ್ವಾತಿ ನಕ್ಷತ್ರವು ಗಾಳಿಯಂತೆ ಎಲ್ಲೆಡೆ ಸಂಚರಿಸಿ ಹೊಸ ವ್ಯವಹಾರಗಳನ್ನು ವಿಸ್ತರಿಸುವ ಸ್ವತಂತ್ರ ಚೈತನ್ಯವನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants diplomatic tact, freedom from dogmatism, and the agility to navigate unpredictable market winds."
  },
  {
    nameKn: "ವಿಶಾಖಾ",
    nameEn: "Vishakha",
    lordKn: "ಗುರು",
    lordEn: "Jupiter",
    devataKn: "ಇಂದ್ರ & ಅಗ್ನಿ",
    devataEn: "Indra & Agni (Dual Powers)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ವ್ಯಾಘ್ರ (ಹುಲಿ)",
    yoniEn: "Tiger",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ವಿಜಯ ತೋರಣ / ಕಮಾನು",
    symbolEn: "Triumphal Archway",
    karmicMeaningKn: "ಏಕಾಗ್ರತೆಯ ಗುರಿ, ಅಚಲ ಸಂಕಲ್ಪ, ವಿಜಯೋತ್ಸವ ಮತ್ತು ಕಠಿಣ ಪರಿಶ್ರಮ.",
    karmicMeaningEn: "Single-minded focus, unyielding determination, triumphant ambition and perseverance.",
    howNakshatraHelpsKn: "ವಿಶಾಖಾ ನಕ್ಷತ್ರವು ಎದುರಾಗುವ ಯಾವುದೇ ಅಡೆತಡೆಗಳನ್ನೂ ಮೆಟ್ಟಿ ನಿಂತು ಗುರಿ ಮುಟ್ಟುವ ಅಪ್ರತಿಮ ಛಲವನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Ignites relentless stamina to overcome fierce competition and plant the flag of victory."
  },
  {
    nameKn: "ಅನುರಾಧಾ",
    nameEn: "Anuradha",
    lordKn: "ಶನಿ",
    lordEn: "Saturn",
    devataKn: "ಮಿತ್ರ (ಸ್ನೇಹದ ದೇವ)",
    devataEn: "Mitra (God of Friendship & Harmony)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಮೃಗ (ಜಿಂಕೆ)",
    yoniEn: "Deer",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ಕಮಲ / ದಂಡ",
    symbolEn: "Lotus / Victorious Staff",
    karmicMeaningKn: "ಭಕ್ತಿ, ಸಹಕಾರ, ಪರದೇಶ ವಾಸದಲ್ಲಿ ಜಯ, ಸಂಘಟನೆ ಮತ್ತು ಕಮಲದಂತಹ ಪರಿಶುದ್ಧತೆ.",
    karmicMeaningEn: "Devotion, cooperative teamwork, success in foreign lands and lotus-like purity amidst mud.",
    howNakshatraHelpsKn: "ಅನುರಾಧಾ ನಕ್ಷತ್ರವು ಕಷ್ಟಕರ ಪರಿಸರದಲ್ಲಿದ್ದರೂ ಕಮಲದಂತೆ ಅರಳಿ, ವಿಶ್ವಾಸಾರ್ಹ ಮಿತ್ರರ ಸಹಕಾರದಿಂದ ಗೆಲ್ಲುವ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Enables thriving in foreign or adverse environments through loyal alliances and pure spiritual focus."
  },
  {
    nameKn: "ಜ್ಯೇಷ್ಠಾ",
    nameEn: "Jyeshtha",
    lordKn: "ಬುಧ",
    lordEn: "Mercury",
    devataKn: "ಇಂದ್ರದೇವ",
    devataEn: "Indra (King of Gods)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಮೃಗ (ಜಿಂಕೆ)",
    yoniEn: "Deer",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ರಕ್ಷಾ ಕವಚ / ಛತ್ರಿ",
    symbolEn: "Circular Amulet / Umbrella",
    karmicMeaningKn: "ಹಿರಿಯತನ, ಅಧಿಕಾರ, ರಕ್ಷಣಾ ಕವಚ, ಗೌಪ್ಯತೆ ಮತ್ತು ಪ್ರತಿಷ್ಠೆ.",
    karmicMeaningEn: "Seniority, protective leadership, occult mastery, administrative courage and stature.",
    howNakshatraHelpsKn: "ಜ್ಯೇಷ್ಠಾ ನಕ್ಷತ್ರವು ಕುಟುಂಬ ಅಥವಾ ಸಂಸ್ಥೆಯನ್ನು ಮುನ್ನಡೆಸುವ ಹಿರಿಯತನದ ನಾಯಕತ್ವ ಮತ್ತು ರಕ್ಷಣಾ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants commanding authority, strategic courage to protect dependents, and executive insight."
  },
  {
    nameKn: "ಮೂಲಾ",
    nameEn: "Mula",
    lordKn: "ಕೇತು",
    lordEn: "Ketu",
    devataKn: "ನಿರೃತಿ (ಮೂಲ ಪರಿವರ್ತನಾ ಶಕ್ತಿ)",
    devataEn: "Nirriti (Goddess of Root Transformation)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಶ್ವಾನ (ನಾಯಿ)",
    yoniEn: "Dog",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಬೇರಿನ ಕಂತೆ / ಸಿಂಹದ ಬಾಲ",
    symbolEn: "Tied Bunch of Roots",
    karmicMeaningKn: "ಮೂಲ ಶೋಧನೆ, ಭ್ರಮೆಗಳ ಕಳಚುವಿಕೆ, ಅಧ್ಯಾತ್ಮ ಜ್ಞಾನ ಮತ್ತು ಅಮೂಲಾಗ್ರ ಪರಿವರ್ತನೆ.",
    karmicMeaningEn: "Root investigation, uprooting illusions, philosophical depth and radical rebirth.",
    howNakshatraHelpsKn: "ಮೂಲಾ ನಕ್ಷತ್ರವು ಸಮಸ್ಯೆಯ ಆಳವಾದ ಬೇರನ್ನು ಕಿತ್ತುಹಾಕಿ, ಶಾಶ್ವತ ಸತ್ಯವನ್ನು ಕಂಡುಕೊಳ್ಳುವ ತಪಸ್ಸಿನ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Empowers the native to dig to the very root of problems and rebuild life on unshakeable spiritual bedrock."
  },
  {
    nameKn: "ಪೂರ್ವಾಷಾಢಾ",
    nameEn: "Purva Ashadha",
    lordKn: "ಶುಕ್ರ",
    lordEn: "Venus",
    devataKn: "ಆಪಃ (ಜಲ ದೇವತೆ)",
    devataEn: "Apah (Cosmic Waters)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ವಾನರ (ಕೋತಿ)",
    yoniEn: "Monkey",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ವಿಂಝಣಿಗೆ / ಬೀಸಣಿಗೆ",
    symbolEn: "Hand Fan / Winnowing Basket",
    karmicMeaningKn: "ಅಪರಾಜಿತ ಛಲ, ಶುದ್ಧೀಕರಣ, ವಾಕ್ಪ್ರಭಾವ ಮತ್ತು ಜನಪ್ರಿಯತೆ.",
    karmicMeaningEn: "Invincible conviction, purification, persuasive rhetoric and unshakable self-belief.",
    howNakshatraHelpsKn: "ಪೂರ್ವಾಷಾಢಾ ನಕ್ಷತ್ರವು ಸೋಲನ್ನು ಒಪ್ಪಿಕೊಳ್ಳದ ಅಪರಾಜಿತ ಶಕ್ತಿ ಮತ್ತು ವಾದ-ವಿವಾದಗಳಲ್ಲಿ ಜಯ ಗಳಿಸುವ ವಾಕ್ಚಾತುರ್ಯ ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Endows invincible morale that refuses defeat and wins over crowds through charismatic speech."
  },
  {
    nameKn: "ಉತ್ತರಾಷಾಢಾ",
    nameEn: "Uttara Ashadha",
    lordKn: "ಸೂರ್ಯ",
    lordEn: "Sun",
    devataKn: "ವಿಶ್ವೇದೇವತೆಗಳು (೧೦ ಧರ್ಮ ದೇವತೆಗಳು)",
    devataEn: "Vishvedevas (10 Universal Gods of Virtue)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ನಕುಲ (ಮುಂಗುಸಿ)",
    yoniEn: "Mongoose",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ಅಗ್ನಿ ತತ್ವ",
    tatvaEn: "Agni (Fire)",
    symbolKn: "ಆನೆಯ ದಂತ",
    symbolEn: "Elephant Tusk",
    karmicMeaningKn: "ಶಾಶ್ವತ ವಿಜಯ, ವಿನಮ್ರತೆ, ಸಾರ್ವಭೌಮ ನಾಯಕತ್ವ ಮತ್ತು ಧರ್ಮ ರಕ್ಷಣೆ.",
    karmicMeaningEn: "Permanent victory, profound humility, statesman leadership and universal duty.",
    howNakshatraHelpsKn: "ಉತ್ತರಾಷಾಢಾ ನಕ್ಷತ್ರವು ತಾಳ್ಮೆಯಿಂದ ಕಾಯ್ದು ಕೊನೆಯಲ್ಲಿ ಶಾಶ್ವತ ಹಾಗೂ ನಿರ್ವಿವಾದ ವಿಜಯವನ್ನು ತಂದುಕೊಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants enduring triumph that arrives steadily and remains unshakeable for generations."
  },
  {
    nameKn: "ಶ್ರವಣಾ",
    nameEn: "Shravana",
    lordKn: "ಚಂದ್ರ",
    lordEn: "Moon",
    devataKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು",
    devataEn: "Lord Vishnu (Supreme Preserver)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ವಾನರ (ಕೋತಿ)",
    yoniEn: "Monkey",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ಕಿವಿ / ತ್ರಿವಿಕ್ರಮ ಪಾದಗಳು",
    symbolEn: "Ear / Three Footsteps of Vishnu",
    karmicMeaningKn: "ಶ್ರವಣ ಭಕ್ತಿ, ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣ ಶಕ್ತಿ ಮತ್ತು ದೈವಿಕ ಸಂರಕ್ಷಣೆ.",
    karmicMeaningEn: "Deep listening, scholarship, oral transmission and divine preservation.",
    howNakshatraHelpsKn: "ಶ್ರವಣಾ ನಕ್ಷತ್ರವು ಇತರರ ಕಷ್ಟಗಳನ್ನು ಕಿವಿಗೊಟ್ಟು ಕೇಳಿ ಪರಿಹರಿಸುವ ಸಮಾಲೋಚನಾ ಶಕ್ತಿ ಮತ್ತು ವಿದ್ವತ್ತನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants high scholarship, acute intuitive hearing, and the preserving blessings of Lord Narayana."
  },
  {
    nameKn: "ಧನಿಷ್ಠಾ",
    nameEn: "Dhanishta",
    lordKn: "ಕುಜ",
    lordEn: "Mars",
    devataKn: "ಅಷ್ಟವಸುಗಳು (೮ ಪ್ರಾಕೃತಿಕ ಸಂಪತ್ತು ದೇವತೆಗಳು)",
    devataEn: "Ashta Vasus (8 Elemental Deities of Wealth)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಸಿಂಹ",
    yoniEn: "Lion",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ಡಮರು / ಮೃದಂಗ",
    symbolEn: "Drum / Flute",
    karmicMeaningKn: "ಸಂಗೀತ, ಲಯ, ಧನ ಸಂಪತ್ತು, ಕೀರ್ತಿ ಮತ್ತು ವಿಶಾಲ ಮನಸ್ಸು.",
    karmicMeaningEn: "Musical rhythm, financial prosperity, fame, bravery and magnanimous enterprise.",
    howNakshatraHelpsKn: "ಧನಿಷ್ಠಾ ನಕ್ಷತ್ರವು ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಸಂಗೀತ ಅಥವಾ ವ್ಯವಹಾರದಲ್ಲಿ ವಿಪುಲ ಸಂಪತ್ತು ಮತ್ತು ಪ್ರಖ್ಯಾತಿಯನ್ನು ತರುತ್ತದೆ.",
    howNakshatraHelpsEn: "Bestows high wealth-generating capacity, martial rhythm, and wide public renown."
  },
  {
    nameKn: "ಶತಭಿಷಾ",
    nameEn: "Shatabhisha",
    lordKn: "ರಾಹು",
    lordEn: "Rahu",
    devataKn: "ವರುಣದೇವ (ಸಾಗರ & ಜಲದ ಅಧಿಪತಿ)",
    devataEn: "Varuna (God of Cosmic Waters & Healing)",
    ganaKn: "ರಾಕ್ಷಸ ಗಣ",
    ganaEn: "Rakshasa Gana",
    yoniKn: "ಅಶ್ವ (ಕುದುರೆ)",
    yoniEn: "Horse",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ವಾಯು ತತ್ವ",
    tatvaEn: "Vayu (Air)",
    symbolKn: "ನೂರು ನಕ್ಷತ್ರಗಳ ವೃತ್ತ / ಔಷಧಿ ಕುಂಭ",
    symbolEn: "Circle of 100 Stars / Medicine Vessel",
    karmicMeaningKn: "ನೂರು ವೈದ್ಯರ ಶಕ್ತಿ, ಚಿಕಿತ್ಸೆ, ರಹಸ್ಯ ಸಂಶೋಧನೆ ಮತ್ತು ಕರ್ಮ ಬಂಧನದಿಂದ ಮುಕ್ತಿ.",
    karmicMeaningEn: "Hundred healers, medical breakthroughs, occult secrets and breaking complex karmic knots.",
    howNakshatraHelpsKn: "ಶತಭಿಷಾ ನಕ್ಷತ್ರವು ಸಂಕೀರ್ಣ ರೋಗಗಳನ್ನು ಅಥವಾ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುವ ಅಸಾಧಾರಣ ರೋಗನಿವಾರಕ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Grants mastery in medicine, pharmaceuticals, technology, and unravelling deep mysteries."
  },
  {
    nameKn: "ಪೂರ್ವಭಾದ್ರಾ",
    nameEn: "Purva Bhadrapada",
    lordKn: "ಗುರು",
    lordEn: "Jupiter",
    devataKn: "ಅಜೈಕಪಾದ (ರುದ್ರನ ತಪೋರೂಪ)",
    devataEn: "Aja Ekapada (The Cosmic Fire Dragon)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಸಿಂಹ",
    yoniEn: "Lion",
    nadiKn: "ಆದಿ ನಾಡಿ (ವಾತ)",
    nadiEn: "Aadi Nadi (Vata)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಖಡ್ಗ / ಎರಡು ಮುಖಗಳ ಮನುಷ್ಯ",
    symbolEn: "Sword / Two-Faced Figure",
    karmicMeaningKn: "ತಪಸ್ಸು, ತೀವ್ರ ಪರಿಶ್ರಮ, ಆಧ್ಯಾತ್ಮಿಕ ಅಗ್ನಿ ಮತ್ತು ಆಂತರಿಕ ತ್ಯಾಗ.",
    karmicMeaningEn: "Ascetic austerity, transformative sacrifice, occult mysticism and spiritual fire.",
    howNakshatraHelpsKn: "ಪೂರ್ವಭಾದ್ರಾ ನಕ್ಷತ್ರವು ಲೌಕಿಕ ಭೋಗಗಳಿಂದ ಮುಕ್ತವಾಗಿ ಉನ್ನತ ಸತ್ಯವನ್ನು ಅರಿತುಕೊಳ್ಳುವ ತಪಸ್ಸಿನ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Endows fiery philosophical detachment, acute occult penetration, and dedication to higher truth."
  },
  {
    nameKn: "ಉತ್ತರಭಾದ್ರಾ",
    nameEn: "Uttara Bhadrapada",
    lordKn: "ಶನಿ",
    lordEn: "Saturn",
    devataKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (ಸಾಗರದ ಆಳದ ಜ್ಞಾನ ಸರ್ಪ)",
    devataEn: "Ahirbudhnya (Serpent of the Oceanic Depths)",
    ganaKn: "ಮನುಷ್ಯ ಗಣ",
    ganaEn: "Manushya Gana",
    yoniKn: "ಗೋವು (ಹಸು)",
    yoniEn: "Cow",
    nadiKn: "ಮಧ್ಯ ನಾಡಿ (ಪಿತ್ತ)",
    nadiEn: "Madhya Nadi (Pitta)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಸಮುದ್ರ ನಾಗ / ಆಳದ ನೀರು",
    symbolEn: "Deep Sea Serpent / Meditation Seat",
    karmicMeaningKn: "ಗಾಂಭೀರ್ಯ, ಶಾಂತಿ, ಆಳವಾದ ಜ್ಞಾನ, ಕರುಣೆ ಮತ್ತು ಆಂತರಿಕ ಸೌಖ್ಯ.",
    karmicMeaningEn: "Deep tranquility, wisdom of the abyss, benevolence and enduring spiritual peace.",
    howNakshatraHelpsKn: "ಉತ್ತರಭಾದ್ರಾ ನಕ್ಷತ್ರವು ಎಂತಹ ಸಂಕಷ್ಟದ ವೇಳೆಯಲ್ಲೂ ವಿಚಲಿತವಾಗದ ಸಾಗರದಂತಹ ಆಳವಾದ ಶಾಂತಿ ಮತ್ತು ಕರುಣೆ ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Anchors unshakeable inner serenity, benevolent charity, and profound meditative stability."
  },
  {
    nameKn: "ರೇವತಿ",
    nameEn: "Revati",
    lordKn: "ಬುಧ",
    lordEn: "Mercury",
    devataKn: "ಪೂಷಾ (ದಾರಿ ತೋರುವ ದೇವ)",
    devataEn: "Pushan (The Cosmic Guide & Nourisher)",
    ganaKn: "ದೇವ ಗಣ",
    ganaEn: "Deva Gana",
    yoniKn: "ಗಜ (ಆನೆ)",
    yoniEn: "Elephant",
    nadiKn: "ಅಂತ್ಯ ನಾಡಿ (ಕಫ)",
    nadiEn: "Antya Nadi (Kapha)",
    tatvaKn: "ಜಲ ತತ್ವ",
    tatvaEn: "Jala (Water)",
    symbolKn: "ಜೋಡಿ ಮೀನುಗಳು / ಡೋಲು",
    symbolEn: "Pair of Swimming Fishes",
    karmicMeaningKn: "ಮೋಕ್ಷ, ಪ್ರಾಣಿ ದಯೆ, ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ, ಸಮೃದ್ಧಿ ಮತ್ತು ಮಧುರ ಸ್ವಭಾವ.",
    karmicMeaningEn: "Moksha, compassion for living beings, safe journeys, gentle sweetness and cosmic completion.",
    howNakshatraHelpsKn: "ರೇವತಿ ನಕ್ಷತ್ರವು ಪ್ರಯಾಣದಲ್ಲಿ ರಕ್ಷಣೆ, ಪ್ರಾಣಿಗಳ ಪ್ರೀತಿ ಹಾಗೂ ಸಂಕಷ್ಟದಲ್ಲಿರುವವರಿಗೆ ಸರಿಯಾದ ದಾರಿ ತೋರಿಸುವ ಕರುಣೆ ನೀಡುತ್ತದೆ.",
    howNakshatraHelpsEn: "Serves as a beacon for lost wanderers, guaranteeing safe voyages, gentle charm and spiritual completion."
  }
];

export const YOGAS_METADATA = [
  { id: 0, kn: "ವಿಷ್ಕಂಭ", en: "Vishkambha", isAuspicious: false, natureKn: "ಆರಂಭದಲ್ಲಿ ಅಡ್ಡಿ, ನಂತರ ಜಯ", natureEn: "Initial hurdles followed by success", remedyKn: "ಶಿವಾರ್ಚನೆ ಮತ್ತು ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ" },
  { id: 1, kn: "ಪ್ರೀತಿ", en: "Priti", isAuspicious: true, natureKn: "ಸ್ನೇಹ, ಪ್ರೀತಿ ಮತ್ತು ಸೌಹಾರ್ದಯುತ ಬದುಕು", natureEn: "Affectionate, loving and sociable", remedyKn: "ಶ್ರೀ ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಪೂಜೆ" },
  { id: 2, kn: "ಆಯುಷ್ಮಾನ್", en: "Ayushman", isAuspicious: true, natureKn: "ದೀರ್ಘಾಯುಷ್ಯ, ಉತ್ತಮ ಆರೋಗ್ಯ ಮತ್ತು ಗೌರವ", natureEn: "Longevity, sound health and respect", remedyKn: "ಧನ್ವಂತರಿ ಸ್ತೋತ್ರ" },
  { id: 3, kn: "ಸೌಭಾಗ್ಯ", en: "Saubhagya", isAuspicious: true, natureKn: "ಸಕಲ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಸುಖ ಮತ್ತು ಸಮೃದ್ಧಿ", natureEn: "Fortune, familial happiness and luxury", remedyKn: "ಲಲಿತಾ ಸಹಸ್ರನಾಮ" },
  { id: 4, kn: "ಶೋಭನ", en: "Shobhana", isAuspicious: true, natureKn: "ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ, ಶುಭ ಕಾರ್ಯಗಳಲ್ಲಿ ಆಸಕ್ತಿ", natureEn: "Splendid aura and virtuous deeds", remedyKn: "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ" },
  { id: 5, kn: "ಅತಿಗಂಡ", en: "Atiganda", isAuspicious: false, natureKn: "⚠️ ಅನಿರೀಕ್ಷಿತ ವಿಘ್ನ, ಶಾರೀರಿಕ ಆಯಾಸ", natureEn: "Obstacles, emotional turbulence", remedyKn: "ಅತಿಗಂಡ ಶಾಂತಿ, ರುದ್ರಾಭಿಷೇಕ" },
  { id: 6, kn: "ಸುಕರ್ಮ", en: "Sukarma", isAuspicious: true, natureKn: "ಸತ್ಕರ್ಮಶೀಲತೆ, ಧಾರ್ಮಿಕ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಧರ್ಮಪಾಲನೆ", natureEn: "Righteous action and noble work", remedyKn: "ಗಾಯತ್ರೀ ಮಂತ್ರ" },
  { id: 7, kn: "ಧೃತಿ", en: "Dhriti", isAuspicious: true, natureKn: "ಧೈರ್ಯ, ಸ್ಥಿರತೆ, ತಾಳ್ಮೆ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸ", natureEn: "Steadfastness, patience and courage", remedyKn: "ಹನುಮಾನ್ ಚಾಲೀಸಾ" },
  { id: 8, kn: "ಶೂಲ", en: "Shoola", isAuspicious: false, natureKn: "⚠️ ಶಾರೀರಿಕ ನೋವು, ಭಿನ್ನಾಭಿಪ್ರಾಯ, ಕಠಿಣ ಪರಿಶ್ರಮ", natureEn: "Physical aches, frictions, trials", remedyKn: "ಶೂಲ ಯೋಗ ಶಾಂತಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ" },
  { id: 9, kn: "ಗಂಡ", en: "Ganda", isAuspicious: false, natureKn: "⚠️ ಕೌಟುಂಬಿಕ ಕ್ಲೇಶ, ವಿಳಂಬಿತ ಫಲ", natureEn: "Family friction, delayed outcomes", remedyKn: "ಗಂಡ ಶಾಂತಿ ಹೋಮ, ವಿಷ್ಣು ಪೂಜೆ" },
  { id: 10, kn: "ವೃದ್ಧಿ", en: "Vriddhi", isAuspicious: true, natureKn: "ನಿರಂತರ ಅಭಿವೃದ್ಧಿ, ಜ್ಞಾನ ಮತ್ತು ಧನ ಸಮೃದ್ಧಿ", natureEn: "Continuous growth and wisdom", remedyKn: "ಶ್ರೀ ಸೂಕ್ತ" },
  { id: 11, kn: "ಧ್ರುವ", en: "Dhruva", isAuspicious: true, natureKn: "ಸ್ಥಿರ ಯಶಸ್ಸು, ಅಚಲ ಸಂಕಲ್ಪ ಮತ್ತು ಪ್ರತಿಷ್ಠೆ", natureEn: "Enduring success and steady focus", remedyKn: "ಧ್ರುವ ಸ್ತೋತ್ರ" },
  { id: 12, kn: "ವ್ಯಾಘಾತ", en: "Vyaghata", isAuspicious: false, natureKn: "⚠️ ಆತುರದ ನಿರ್ಧಾರಗಳಿಂದ ಸಂಕಷ್ಟ, ತೀಕ್ಷ್ಣ ಕೋಪ", natureEn: "Impulsive distress and sharp temper", remedyKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ" },
  { id: 13, kn: "ಹರ್ಷಣ", en: "Harshana", isAuspicious: true, natureKn: "ಆನಂದದಾಯಕ ಮನಸ್ಸು, ಹಾಸ್ಯಪ್ರಿಯತೆ, ಸಂತೋಷ", natureEn: "Cheerful, witty and optimistic", remedyKn: "ಕೃಷ್ಣಾಷ್ಟಕಂ" },
  { id: 14, kn: "ವಜ್ರ", en: "Vajra", isAuspicious: false, natureKn: "⚠️ ಕಠಿಣ ಸವಾಲುಗಳು, ಸಂಘರ್ಷದ ಹಾದಿ", natureEn: "Rigid trials, resilience demanded", remedyKn: "ವಜ್ರ ಯೋಗ ಶಾಂತಿ, ಇಂದ್ರ ಸ್ತೋತ್ರ" },
  { id: 15, kn: "ಸಿದ್ಧಿ", en: "Siddhi", isAuspicious: true, natureKn: "ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಿದ್ಧಿ, ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿ", natureEn: "Accomplishment of goals and mastery", remedyKn: "ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ" },
  { id: 16, kn: "ವ್ಯತೀಪಾತ", en: "Vyatipata", isAuspicious: false, natureKn: "⚠️ ಮಹಾ ಯೋಗ ದೋಷ: ಅನಿರೀಕ್ಷಿತ ಹಿನ್ನಡೆ, ನಿರಂತರ ಪರಿಶ್ರಮ", natureEn: "Major Yoga Dosha: Sudden reversals and heavy trials", remedyKn: "ವ್ಯತೀಪಾತ ಮಹಾಶಾಂತಿ, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆ" },
  { id: 17, kn: "ವರೀಯಾನ್", en: "Variyan", isAuspicious: true, natureKn: "ಶ್ರೇಷ್ಠತೆ, ವೈಭವ, ಅಧಿಕಾರ ಮತ್ತು ಜನಪ್ರಿಯತೆ", natureEn: "Preeminence, dignity and luxury", remedyKn: "ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ" },
  { id: 18, kn: "ಪರಿಘ", en: "Parigha", isAuspicious: false, natureKn: "⚠️ ಮೊದಲಾರ್ಧದಲ್ಲಿ ಅಡೆತಡೆಗಳು, ನಂತರ ಸಾಫಲ್ಯ", natureEn: "Initial locks and delays, overcoming through grit", remedyKn: "ದುರ್ಗಾ ಸಪ್ತಶತಿ ಪಾರಾಯಣ" },
  { id: 19, kn: "ಶಿವ", en: "Shiva", isAuspicious: true, natureKn: "ಪರಮ ಕಲ್ಯಾಣ, ಮನಃಶಾಂತಿ, ದೈವಾನುಗ್ರಹ", natureEn: "Auspiciousness, peace and divinity", remedyKn: "ಶಿವ ಪಂಚಾಕ್ಷರಿ ಮಂತ್ರ" },
  { id: 20, kn: "ಸಿದ್ಧ", en: "Siddha", isAuspicious: true, natureKn: "ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆ, ಯಶಸ್ವಿ ಕಾರ್ಯ ನಿರ್ವಹಣೆ", natureEn: "Religious faith and accomplished work", remedyKn: "ದತ್ತಾತ್ರೇಯ ಸ್ತೋತ್ರ" },
  { id: 21, kn: "ಸಾಧ್ಯ", en: "Sadhya", isAuspicious: true, natureKn: "ವಿನಯ, ಸೌಜನ್ಯ, ಕಠಿಣ ಕಾರ್ಯಗಳನ್ನು ಸಾಧಿಸುವ ಛಲ", natureEn: "Polite demeanor and persistent pursuit", remedyKn: "ರಾಮ ರಕ್ಷಾ ಸ್ತೋತ್ರ" },
  { id: 22, kn: "ಶುಭ", en: "Shubha", isAuspicious: true, natureKn: "ಪವಿತ್ರ ಆಲೋಚನೆ, ದಾನ ಧರ್ಮ, ಸೌಭಾಗ್ಯ", natureEn: "Purity of mind and charitable nature", remedyKn: "ಅನ್ನಪೂರ್ಣಾ ಸ್ತೋತ್ರ" },
  { id: 23, kn: "ಶುಕ್ಲ", en: "Shukla", isAuspicious: true, natureKn: "ನಿಷ್ಕಳಂಕ ಚಾರಿತ್ರ್ಯ, ವಿದ್ಯಾ ಪ್ರತಿಭೆ, ಕೀರ್ತಿ", natureEn: "Bright intellect and upright reputation", remedyKn: "ಸರಸ್ವತೀ ಸ್ತೋತ್ರ" },
  { id: 24, kn: "ಬ್ರಹ್ಮ", en: "Brahma", isAuspicious: true, natureKn: "ಆಳವಾದ ಜ್ಞಾನ, ತಪಸ್ವಿ ಪ್ರವೃತ್ತಿ, ಗುರು ಗೌರವ", natureEn: "Profound wisdom and spiritual reverence", remedyKn: "ಗುರು ಪಾದುಕಾ ಸ್ತೋತ್ರ" },
  { id: 25, kn: "ಇಂದ್ರ", en: "Indra", isAuspicious: true, natureKn: "ನಾಯಕತ್ವ ಗುಣ, ಅಧಿಕಾರ, ಸಮಾಜದಲ್ಲಿ ಮನ್ನಣೆ", natureEn: "Leadership, authority and prominence", remedyKn: "ಇಂದ್ರ ಕವಚ" },
  { id: 26, kn: "ವೈಧೃತಿ", en: "Vaidhriti", isAuspicious: false, natureKn: "⚠️ ಮಹಾ ಯೋಗ ದೋಷ: ಮಾನಸಿಕ ತೊಳಲಾಟ, ತೀವ್ರ ಪರಿಶ್ರಮ", natureEn: "Major Yoga Dosha: Emotional turmoil and persistent struggle", remedyKn: "ವೈಧೃತಿ ಶಾಂತಿ, ರುದ್ರ ಜಪ, ಅನ್ನದಾನ" }
];

export function calculatePanchangaAngas(
  kundli: KundliOutput,
  birthDate?: string,
  _birthTime?: string
): PanchangaAngasDetail {
  const sun = getPlanet(kundli, PlanetName.Sun);
  const moon = getPlanet(kundli, PlanetName.Moon);
  const mars = getPlanet(kundli, PlanetName.Mars);
  const mercury = getPlanet(kundli, PlanetName.Mercury);
  const jupiter = getPlanet(kundli, PlanetName.Jupiter);
  const saturn = getPlanet(kundli, PlanetName.Saturn);

  const sunLong = getPlanetAbsoluteLongitude(sun);
  const moonLong = getPlanetAbsoluteLongitude(moon);
  const marsLong = getPlanetAbsoluteLongitude(mars);
  const mercuryLong = getPlanetAbsoluteLongitude(mercury);
  const jupiterLong = getPlanetAbsoluteLongitude(jupiter);
  const saturnLong = getPlanetAbsoluteLongitude(saturn);
  const lagnaLong = getAscendantAbsoluteLongitude(kundli);

  // 1. Tithi & Dagdha Rashis
  const diff = normalizeDeg(moonLong - sunLong);
  const tithiNum = Math.floor(diff / 12) + 1; // 1 to 30
  const isShukla = tithiNum <= 15;
  const tithiNameBaseKn = [
    "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ",
    "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
    "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ",
    isShukla ? "ಹುಣ್ಣಿಮೆ (ಪೂರ್ಣಿಮಾ)" : "ಅಮಾವಾಸ್ಯೆ"
  ][(tithiNum - 1) % 15]!;

  const tithiNameBaseEn = [
    "Pratipat", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi",
    isShukla ? "Purnima" : "Amavasya"
  ][(tithiNum - 1) % 15]!;

  const tithiKn = `${isShukla ? "ಶುಕ್ಲ ಪಕ್ಷ" : "ಕೃಷ್ಣ ಪಕ್ಷ"} ${tithiNameBaseKn}`;
  const tithiEn = `${isShukla ? "Shukla" : "Krishna"} ${tithiNameBaseEn}`;

  const dagdhaIndices = DAGDHA_RASHIS_BY_TITHI[tithiNum] || [];
  const dagdhaRashisKn = dagdhaIndices.map((idx) => RASHIS[idx]?.sanskrit || "");
  const dagdhaRashisEn = dagdhaIndices.map((idx) => RASHIS[idx]?.english || "");

  const planetsInDagdha: PanchangaAngasDetail["tithi"]["planetsInDagdha"] = [];
  for (const p of kundli.planets) {
    if (dagdhaIndices.includes(p.rashi.index)) {
      planetsInDagdha.push({
        planetKn: getPlanetKn(p.name),
        planetEn: getPlanetEn(p.name),
        rashiKn: getRashiKn(p.rashi),
        rashiEn: getRashiEn(p.rashi),
        implicationKn: `${getPlanetKn(p.name)} ಗ್ರಹವು ದಗ್ಧ (ಶೂನ್ಯ) ರಾಶಿಯಲ್ಲಿರುವುದರಿಂದ ಇದರ ಕಾರಕತ್ವದ ಫಲಗಳು ಸುಲಭವಾಗಿ ಸಿಗದೆ ಆರಂಭದಲ್ಲಿ ನಿಷ್ಫಲವಾಗಬಹುದು; ಶಾಂತಿ ಅಗತ್ಯ.`,
        implicationEn: `${getPlanetEn(p.name)} in Dagdha Rashi faces temporary voidness; its significations require remedial activation.`
      });
    }
  }

  // 2. Vaara (Weekday)
  let weekdayIdx = 0;
  if (birthDate) {
    try {
      weekdayIdx = new Date(birthDate).getDay();
    } catch {
      weekdayIdx = 0;
    }
  }
  const WEEKDAYS_INFO = [
    { kn: "ಭಾನುವಾರ (ರವಿವಾರ)", en: "Sunday", lordKn: "ಸೂರ್ಯ", lordEn: "Sun", vitalityKn: "ಆತ್ಮಬಲ, ತೇಜಸ್ಸು ಮತ್ತು ನಾಯಕತ್ವ ಶಕ್ತಿ", vitalityEn: "Solar vitality, prana and leadership energy" },
    { kn: "ಸೋಮವಾರ", en: "Monday", lordKn: "ಚಂದ್ರ", lordEn: "Moon", vitalityKn: "ಭಾವನಾತ್ಮಕ ಸಂವೇದನೆ, ಆಕರ್ಷಕ ಮನಸ್ಸು ಮತ್ತು ಶಾಂತಿ", vitalityEn: "Lunar empathy, calm mind and fluid grace" },
    { kn: "ಮಂಗಳವಾರ", en: "Tuesday", lordKn: "ಕುಜ", lordEn: "Mars", vitalityKn: "ಧೈರ್ಯ, ಸಾಹಸ, ಶಾರೀರಿಕ ತ್ರಾಣ ಮತ್ತು ರಕ್ಷಣಾ ಶಕ್ತಿ", vitalityEn: "Martial courage, physical stamina and protective vigor" },
    { kn: "ಬುಧವಾರ", en: "Wednesday", lordKn: "ಬುಧ", lordEn: "Mercury", vitalityKn: "ಬುದ್ಧಿಚಾತುರ್ಯ, ಮಾತುಗಾರಿಕೆ ಮತ್ತು ವ್ಯಾಪಾರ ಕೌಶಲ", vitalityEn: "Mercurial intellect, articulation and commercial acumen" },
    { kn: "ಗುರುವಾರ", en: "Thursday", lordKn: "ಗುರು", lordEn: "Jupiter", vitalityKn: "ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆ, ಸದಾಚಾರ, ವಿದ್ವತ್ತು ಮತ್ತು ದೈವ ಕೃಪೆ", vitalityEn: "Jupiterian wisdom, righteous conduct and spiritual grace" },
    { kn: "ಶುಕ್ರವಾರ", en: "Friday", lordKn: "ಶುಕ್ರ", lordEn: "Venus", vitalityKn: "ಕಲಾಸಕ್ತಿ, ಆಕರ್ಷಣೆ, ಸೌಂದರ್ಯ ಮತ್ತು ಭೋಗ ಭಾಗ್ಯ", vitalityEn: "Venusian aesthetics, charisma and gracious charm" },
    { kn: "ಶನಿವಾರ", en: "Saturday", lordKn: "ಶನಿ", lordEn: "Saturn", vitalityKn: "ತಾಳ್ಮೆ, ಶ್ರಮಶೀಲತೆ, ಕಠಿಣ ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಮತ್ತು ಸ್ಥಿರತೆ", vitalityEn: "Saturnine perseverance, duty-bound grit and endurance" }
  ];
  const vaaraData = WEEKDAYS_INFO[weekdayIdx]!;

  // 3. Nakshatra Deep Dive
  const moonNakIdx = Math.floor(moonLong / (360 / 27)) % 27;
  const moonPada = (Math.floor((moonLong % (360 / 27)) / (360 / 108)) + 1) as 1 | 2 | 3 | 4;
  const nakMeta = NAKSHATRAS_METADATA[moonNakIdx]!;

  // 4. 27 Nitya Yogas
  const yogaSum = normalizeDeg(sunLong + moonLong);
  const yogaIdx = Math.floor(yogaSum / (360 / 27)) % 27;
  const yogaMeta = YOGAS_METADATA[yogaIdx]!;

  // 5. 11 Karanas
  const halfTithiIdx = Math.floor(diff / 6) % 60;
  let karanaNameKn = "";
  let karanaNameEn = "";
  let karanaType: "chara" | "sthira" = "chara";
  let isVishtiBhadra = false;

  if (halfTithiIdx === 0) {
    karanaNameKn = "ಕಿಂತುಘ್ನ";
    karanaNameEn = "Kintughna";
    karanaType = "sthira";
  } else if (halfTithiIdx >= 57) {
    const sthiraIdx = halfTithiIdx - 57;
    const sthiraKn = ["ಶಕುನಿ", "ಚತುಷ್ಪದ", "ನಾಗ"][sthiraIdx]!;
    const sthiraEn = ["Shakuni", "Chatushpada", "Naga"][sthiraIdx]!;
    karanaNameKn = sthiraKn;
    karanaNameEn = sthiraEn;
    karanaType = "sthira";
  } else {
    const charaIdx = (halfTithiIdx - 1) % 7;
    const charaKn = ["ಬವ", "ಬಾಲವ", "ಕೌಲವ", "ತೈತಿಲ", "ಗರಜ", "ವಣಿಜ", "ವಿಷ್ಟಿ (ಭದ್ರಾ)"][charaIdx]!;
    const charaEn = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti (Bhadra)"][charaIdx]!;
    karanaNameKn = charaKn;
    karanaNameEn = charaEn;
    karanaType = "chara";
    if (charaIdx === 6) {
      isVishtiBhadra = true;
    }
  }

  // 6. Navatara Chakra Matrix (27 nakshatras grouped into 9 Taras)
  const TARA_NAMES = [
    { idx: 0, kn: "೧. ಜನ್ಮ ತಾರಾ", en: "1. Janma Tara", sigKn: "ಶರೀರ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಆತ್ಮ ಗುರುತು", sigEn: "Self, physical vitality and baseline mind", qual: "neutral" as const },
    { idx: 1, kn: "೨. ಸಂಪತ್ ತಾರಾ", en: "2. Sampat Tara", sigKn: "ಧನಾಗಮನ, ಐಶ್ವರ್ಯ, ವ್ಯಾಪಾರ ಲಾಭ", sigEn: "Wealth, material influx and prosperity", qual: "benefic" as const },
    { idx: 2, kn: "೩. ವಿಪತ್ ತಾರಾ ⚠️", en: "3. Vipat Tara ⚠️", sigKn: "ಆಕಸ್ಮಿಕ ಅಪಾಯ, ಅಡೆತಡೆ, ನಷ್ಟದ ಭೀತಿ", sigEn: "Unexpected hurdles, peril and losses", qual: "malefic" as const },
    { idx: 3, kn: "೪. ಕ್ಷೇಮ ತಾರಾ", en: "4. Kshema Tara", sigKn: "ರಕ್ಷಣೆ, ಕುಟುಂಬ ಸುಖ, ಯಶಸ್ಸು", sigEn: "Protection, comfort and peace of mind", qual: "benefic" as const },
    { idx: 4, kn: "೫. ಪ್ರತ್ಯಕ್ ತಾರಾ ⚠️", en: "5. Pratyak Tara ⚠️", sigKn: "ವಿರೋಧ, ಶತ್ರುತ್ವ, ವಿಳಂಬ, ತಿಕ್ಕಾಟ", sigEn: "Opposition, enmity, delay and friction", qual: "malefic" as const },
    { idx: 5, kn: "೬. ಸಾಧನಾ ತಾರಾ", en: "6. Sadhana Tara", sigKn: "ಕಾರ್ಯಸಿದ್ಧಿ, ಪರಿಶ್ರಮಕ್ಕೆ ಪೂರ್ಣ ಫಲ", sigEn: "Fruition, goal achievement and mastery", qual: "benefic" as const },
    { idx: 6, kn: "೭. ನೈಧನ (ವಧ) ತಾರಾ ⚠️", en: "7. Naidhana (Vadha) Tara ⚠️", sigKn: "ತೀವ್ರ ಕ್ಲೇಶ, ದೀರ್ಘಕಾಲದ ಸಂಕಷ್ಟ, ಸಾಲ", sigEn: "Severe crisis, heavy debt and mortality fear", qual: "malefic" as const },
    { idx: 7, kn: "೮. ಮಿತ್ರ ತಾರಾ", en: "8. Mitra Tara", sigKn: "ಸ್ನೇಹ, ಸಹಕಾರ, ಸಂತೋಷ, ಸುಲಭ ಜಯ", sigEn: "Friendly alliances, easy gains and joy", qual: "benefic" as const },
    { idx: 8, kn: "೯. ಪರಮ ಮಿತ್ರ ತಾರಾ", en: "9. Parama Mitra Tara", sigKn: "ಪರಮ ಕಲ್ಯಾಣ, ಸರ್ವತೋಮುಖ ಯಶಸ್ಸು", sigEn: "Supreme blessing, royal patronage and bliss", qual: "benefic" as const }
  ];

  const navataraChakra: PanchangaAngasDetail["navataraChakra"] = TARA_NAMES.map((t) => ({
    taraIndex: t.idx,
    taraNameKn: t.kn,
    taraNameEn: t.en,
    significanceKn: t.sigKn,
    significanceEn: t.sigEn,
    quality: t.qual,
    nakshatras: []
  }));

  for (let n = 0; n < 27; n++) {
    const dist = (n - moonNakIdx + 27) % 27;
    const tIdx = dist % 9;
    const occupying = kundli.planets.filter((p) => {
      const pLong = getPlanetAbsoluteLongitude(p);
      const pNak = Math.floor(pLong / (360 / 27)) % 27;
      return pNak === n;
    });

    navataraChakra[tIdx]!.nakshatras.push({
      index: n,
      nameKn: NAKSHATRAS_METADATA[n]!.nameKn,
      nameEn: NAKSHATRAS_METADATA[n]!.nameEn,
      occupyingPlanetsKn: occupying.map((p) => getPlanetKn(p.name)),
      occupyingPlanetsEn: occupying.map((p) => getPlanetEn(p.name))
    });
  }

  // 7. Upagrahas & Nakshatra Upari Analysis
  const dhumaLong = normalizeDeg(sunLong + 133 + 20 / 60);
  const vyatipataLong = normalizeDeg(360 - dhumaLong);
  const pariveshaLong = normalizeDeg(vyatipataLong + 180);
  const indrachapaLong = normalizeDeg(360 - pariveshaLong);
  const upaketuLong = normalizeDeg(indrachapaLong + 16 + 40 / 60);

  const gulikaLong = kundli.maandi ? getPlanetAbsoluteLongitude(kundli.maandi) : normalizeDeg(saturnLong + 120);
  const yamaghantakaLong = normalizeDeg(jupiterLong + 180);
  const ardhapraharaLong = normalizeDeg(mercuryLong + 90);
  const kalaLong = normalizeDeg(sunLong + 60);
  const mrityuLong = normalizeDeg(marsLong + 150);

  const upagrahasRaw = [
    { id: "dhuma", nameKn: "ಧೂಮ", nameEn: "Dhuma", cat: "aprakasha" as const, long: dhumaLong, impactKn: "ಸೂರ್ಯನಿಂದ ಜನಿಸಿದ ಧೂಮವು ಮಾನಸಿಕ ಸಂತಾಪ ಹಾಗೂ ಉರಿಯೂತ ತರುತ್ತದೆ.", impactEn: "Born of Sun, brings psychic agitation." },
    { id: "vyatipata", nameKn: "ವ್ಯತೀಪಾತ (ಉಪಗ್ರಹ)", nameEn: "Vyatipata (Upagraha)", cat: "aprakasha" as const, long: vyatipataLong, impactKn: "ಅನಿರೀಕ್ಷಿತ ಆಪತ್ತು ಮತ್ತು ಯೋಜನೆಗಳಲ್ಲಿ ವಿಪರ್ಯಾಸ ಉಂಟುಮಾಡುತ್ತದೆ.", impactEn: "Brings sudden mishaps and reversals." },
    { id: "parivesha", nameKn: "ಪರಿವೇಷ", nameEn: "Parivesha", cat: "aprakasha" as const, long: pariveshaLong, impactKn: "ಗುಪ್ತ ಭಯ ಮತ್ತು ನೀರಿನ ಅಪಾಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.", impactEn: "Indicates hidden fears and water peril." },
    { id: "indrachapa", nameKn: "ಇಂದ್ರಚಾಪ (ಕೋದಂಡ)", nameEn: "Indrachapa (Kodanda)", cat: "aprakasha" as const, long: indrachapaLong, impactKn: "ಸಹೋದರರೊಂದಿಗೆ ಕಲಹ ಅಥವಾ ವಾಹನ ಅಪಾಯ ಸೂಚಕ.", impactEn: "Friction with kin or vehicle accidents." },
    { id: "upaketu", nameKn: "ಉಪಕೇತು (ಶಿಖಿ)", nameEn: "Upaketu (Shikhi)", cat: "aprakasha" as const, long: upaketuLong, impactKn: "ಕಾರ್ಯಹಾನಿ ಹಾಗೂ ಅಗ್ನಿ ಸಂಬಂಧಿತ ಮುನ್ನೆಚ್ಚರಿಕೆ.", impactEn: "Work disruptions and fiery alerts." },
    { id: "gulika_maandi", nameKn: "ಗುಳಿಕ / ಮಾಂದಿ", nameEn: "Gulika / Maandi", cat: "kalaja" as const, long: gulikaLong, impactKn: "ಶನಿಯ ಉಪಗ್ರಹ; ಕೆಲಸಗಳು 99% ತಲುಪಿ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಸಿಲುಕಿಕೊಳ್ಳಲು ಕಾರಣ.", impactEn: "Saturn's shadow; stalls 99% completed ventures." },
    { id: "yamaghantaka", nameKn: "ಯಮಘಂಟಕ", nameEn: "Yamaghantaka", cat: "kalaja" as const, long: yamaghantakaLong, impactKn: "ಗುರುವಿನ ಉಪಗ್ರಹ; ಅನೇಕ ಕಷ್ಟಗಳ ನಡುವೆಯೂ ದೈವಿಕ ರಕ್ಷಣೆ ಒದಗಿಸುತ್ತದೆ.", impactEn: "Jupiter's son; offers spiritual shielding." },
    { id: "ardhaprahara", nameKn: "ಅರ್ಧಪ್ರಹರ", nameEn: "Ardhaprahara", cat: "kalaja" as const, long: ardhapraharaLong, impactKn: "ಬುಧನ ಉಪಗ್ರಹ; ವ್ಯಾಪಾರದಲ್ಲಿ ಲೆಕ್ಕಾಚಾರದ ಗೊಂದಲ ತರುತ್ತದೆ.", impactEn: "Mercury's shadow; causes trade miscalculations." },
    { id: "kala", nameKn: "ಕಾಲ", nameEn: "Kala", cat: "kalaja" as const, long: kalaLong, impactKn: "ಸೂರ್ಯನ ಕಾಲಜ ಉಪಗ್ರಹ; ಕೀರ್ತಿಹಾನಿ ಅಥವಾ ಅಧಿಕಾರದ ತಿಕ್ಕಾಟ.", impactEn: "Solar shadow; clashes with authority." },
    { id: "mrityu", nameKn: "ಮೃತ್ಯು", nameEn: "Mrityu", cat: "kalaja" as const, long: mrityuLong, impactKn: "ಕುಜನ ಉಪಗ್ರಹ; ಗಾಯ, ರಕ್ತಸ್ರಾವ ಹಾಗೂ ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಎಚ್ಚರಿಕೆ.", impactEn: "Martial shadow; surgical and wound alert." }
  ];

  const moonNak = moonNakIdx;
  const lagnaNak = Math.floor(lagnaLong / (360 / 27)) % 27;
  const sunNak = Math.floor(sunLong / (360 / 27)) % 27;

  const upagrahas: PanchangaAngasDetail["upagrahas"] = upagrahasRaw.map((u) => {
    const rIdx = Math.floor(u.long / 30) % 12;
    const h = ((rIdx - kundli.lagnaRashi.index + 12) % 12) + 1;
    const nIdx = Math.floor(u.long / (360 / 27)) % 27;
    const p = Math.floor((u.long % (360 / 27)) / (360 / 108)) + 1;

    let affKn: string | undefined;
    let affEn: string | undefined;

    if (nIdx === moonNak) {
      affKn = `⚠️ ಚಂದ್ರ ನಕ್ಷತ್ರಕ್ಕೆ ಉಪರಿ ವೇಧ (${u.nameKn} ಚಂದ್ರನ ನಕ್ಷತ್ರವಾದ ${NAKSHATRAS_METADATA[moonNak]!.nameKn}ದಲ್ಲಿದೆ)`;
      affEn = `⚠️ Moon Nakshatra Upari Vedha (${u.nameEn} occupies natal Moon nakshatra)`;
    } else if (nIdx === lagnaNak) {
      affKn = `⚠️ ಲಗ್ನ ನಕ್ಷತ್ರಕ್ಕೆ ಉಪರಿ ವೇಧ (${u.nameKn} ಲಗ್ನದ ನಕ್ಷತ್ರದಲ್ಲಿದೆ)`;
      affEn = `⚠️ Lagna Nakshatra Upari Vedha (${u.nameEn} occupies Lagna nakshatra)`;
    } else if (nIdx === sunNak) {
      affKn = `⚠️ ಸೂರ್ಯ ನಕ್ಷತ್ರಕ್ಕೆ ಉಪರಿ ವೇಧ (${u.nameKn} ಸೂರ್ಯನ ನಕ್ಷತ್ರದಲ್ಲಿದೆ)`;
      affEn = `⚠️ Sun Nakshatra Upari Vedha (${u.nameEn} occupies Sun nakshatra)`;
    }

    return {
      id: u.id,
      nameKn: u.nameKn,
      nameEn: u.nameEn,
      category: u.cat,
      longitude: u.long,
      rashiKn: RASHIS[rIdx]?.sanskrit || "",
      rashiEn: RASHIS[rIdx]?.english || "",
      house: h,
      nakshatraKn: NAKSHATRAS_METADATA[nIdx]!.nameKn,
      nakshatraEn: NAKSHATRAS_METADATA[nIdx]!.nameEn,
      pada: p,
      subtleImpactKn: u.impactKn,
      subtleImpactEn: u.impactEn,
      afflictedFactorKn: affKn,
      afflictedFactorEn: affEn
    };
  });

  // 8. Pushkara Navamsha & Pushkara Bhaga
  const pushkaraPlacements: PanchangaAngasDetail["pushkaraPlacements"] = [];
  for (const p of kundli.planets) {
    const pAbs = getPlanetAbsoluteLongitude(p);
    const intraSignDeg = pAbs % 30;
    const navamshaWithinSign = Math.floor(intraSignDeg / (30 / 9));
    const signIdx = Math.floor(pAbs / 30) % 12;
    let isPushkara = false;

    // Fire signs: 6, 8
    if ([0, 4, 8].includes(signIdx) && [6, 8].includes(navamshaWithinSign)) isPushkara = true;
    // Earth signs: 2, 4
    if ([1, 5, 9].includes(signIdx) && [2, 4].includes(navamshaWithinSign)) isPushkara = true;
    // Air signs: 5, 7
    if ([2, 6, 10].includes(signIdx) && [5, 7].includes(navamshaWithinSign)) isPushkara = true;
    // Water signs: 0, 2
    if ([3, 7, 11].includes(signIdx) && [0, 2].includes(navamshaWithinSign)) isPushkara = true;

    if (isPushkara) {
      pushkaraPlacements.push({
        planetKn: getPlanetKn(p.name),
        planetEn: getPlanetEn(p.name),
        rashiKn: getRashiKn(p.rashi),
        rashiEn: getRashiEn(p.rashi),
        navamshaSignKn: `ನವಾಂಶ #${navamshaWithinSign + 1}`,
        navamshaSignEn: `Navamsha #${navamshaWithinSign + 1}`,
        isPushkaraBhaga: Math.abs(intraSignDeg - 21) < 1,
        blessingKn: `${getPlanetKn(p.name)} ಗ್ರಹವು ಪುಷ್ಕರ ನವಾಂಶದಲ್ಲಿದ್ದು, ಅಮೃತ ತುಲ್ಯ ಬಲ ಪಡೆದಿದೆ. ನೀಚ/ಶತ್ರು ರಾಶಿಯಲ್ಲಿದ್ದರೂ ಜಾತಕರಿಗೆ ಅನಿರೀಕ್ಷಿತ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಕೀರ್ತಿ ನೀಡುತ್ತದೆ.`,
        blessingEn: `${getPlanetEn(p.name)} occupies sacred Pushkara Navamsha; endowed with divine nectar that neutralizes planetary friction.`
      });
    }
  }

  return {
    tithi: {
      index: tithiNum,
      nameKn: tithiKn,
      nameEn: tithiEn,
      pakshaKn: isShukla ? "ಶುಕ್ಲ ಪಕ್ಷ" : "ಕೃಷ್ಣ ಪಕ್ಷ",
      pakshaEn: isShukla ? "Shukla Paksha" : "Krishna Paksha",
      shriFactorKn: isShukla ? "ಶುಕ್ಲ ಪಕ್ಷದ ಜನನವು ಮಾನಸಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷಕ್ಕೆ ಪೂರಕ." : "ಕೃಷ್ಣ ಪಕ್ಷದ ಜನನವು ತಪಸ್ಸು ಹಾಗೂ ಆಳವಾದ ಆಂತರಿಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
      shriFactorEn: isShukla ? "Shukla birth supports mental expansion and financial growth." : "Krishna birth cultivates resilience and introspective depth.",
      dagdhaRashisKn,
      dagdhaRashisEn,
      planetsInDagdha
    },
    vaara: {
      weekdayKn: vaaraData.kn,
      weekdayEn: vaaraData.en,
      lordKn: vaaraData.lordKn,
      lordEn: vaaraData.lordEn,
      vitalityKn: vaaraData.vitalityKn,
      vitalityEn: vaaraData.vitalityEn
    },
    nakshatra: {
      index: moonNakIdx,
      nameKn: nakMeta.nameKn,
      nameEn: nakMeta.nameEn,
      pada: moonPada,
      lordKn: nakMeta.lordKn,
      lordEn: nakMeta.lordEn,
      devataKn: nakMeta.devataKn,
      devataEn: nakMeta.devataEn,
      ganaKn: nakMeta.ganaKn,
      ganaEn: nakMeta.ganaEn,
      yoniKn: nakMeta.yoniKn,
      yoniEn: nakMeta.yoniEn,
      nadiKn: nakMeta.nadiKn,
      nadiEn: nakMeta.nadiEn,
      tatvaKn: nakMeta.tatvaKn,
      tatvaEn: nakMeta.tatvaEn,
      symbolKn: nakMeta.symbolKn,
      symbolEn: nakMeta.symbolEn,
      karmicMeaningKn: nakMeta.karmicMeaningKn,
      karmicMeaningEn: nakMeta.karmicMeaningEn,
      howNakshatraHelpsKn: nakMeta.howNakshatraHelpsKn,
      howNakshatraHelpsEn: nakMeta.howNakshatraHelpsEn
    },
    yoga: {
      index: yogaIdx,
      nameKn: yogaMeta.kn,
      nameEn: yogaMeta.en,
      isAuspicious: yogaMeta.isAuspicious,
      natureKn: yogaMeta.natureKn,
      natureEn: yogaMeta.natureEn,
      healthImmunityKn: yogaMeta.isAuspicious
        ? "ಶುಭ ನಿತ್ಯ ಯೋಗವು ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಿ ಆಯುಷ್ಯವನ್ನು ಸಂರಕ್ಷಿಸುತ್ತದೆ."
        : "ಅಶುಭ ನಿತ್ಯ ಯೋಗವು ಶಾರೀರಿಕ ಆಯಾಸ ಅಥವಾ ಕಾಲೋಚಿತ ಅನಾರೋಗ್ಯವನ್ನು ತರಬಹುದು; ಶಾಂತಿ ಪೂಜೆ ಅಗತ್ಯ.",
      healthImmunityEn: yogaMeta.isAuspicious
        ? "Benefic Yoga bolsters immune resilience and longevity."
        : "Inauspicious Yoga can bring bodily fatigue or recurring ailments; requires remedy.",
      remedyKn: yogaMeta.remedyKn,
      remedyEn: yogaMeta.natureEn
    },
    karana: {
      index: halfTithiIdx,
      nameKn: karanaNameKn,
      nameEn: karanaNameEn,
      type: karanaType,
      typeKn: karanaType === "chara" ? "ಚರ ಕರಣ" : "ಸ್ಥಿರ ಕರಣ",
      typeEn: karanaType === "chara" ? "Chara Karana" : "Sthira Karana",
      isVishtiBhadra,
      careerActionStaminaKn: isVishtiBhadra
        ? "⚠️ ವಿಷ್ಟಿ (ಭದ್ರಾ ಕರಣ): ಶುಭ ಕಾರ್ಯಗಳಲ್ಲಿ ಆರಂಭಿಕ ಅಡ್ಡಿ ಹಾಗೂ ಕೆಲಸಗಳು 90% ತಲುಪಿ ಕೊನೆಯಲ್ಲಿ ಸಿಲುಕಿಕೊಳ್ಳುವ ಲಕ್ಷಣ. ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಅಗತ್ಯ."
        : `${karanaNameKn} ಕರಣವು ಜಾತಕರಿಗೆ ಕಾರ್ಯ ನಿರ್ವಹಣೆಯಲ್ಲಿ ಛಲ, ಚುರುಕುತನ ಮತ್ತು ಸತತ ಪ್ರಯತ್ನದ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.`,
      careerActionStaminaEn: isVishtiBhadra
        ? "⚠️ Vishti (Bhadra Karana): Prone to last-mile bottlenecks in auspicious endeavors; chant Hanuman Chalisa."
        : `${karanaNameEn} Karana provides dedicated persistence and practical competence in undertakings.`,
      remedyKn: isVishtiBhadra ? "ಶನಿವಾರ ಹನುಮಂತನಿಗೆ ಸಿಂಧೂರ ಲೇಪನ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಮತ್ತು ಭದ್ರಾ ಶಾಂತಿ ಸಂಕಲ್ಪ." : undefined,
      remedyEn: isVishtiBhadra ? "Hanuman Chalisa recitation and sesame oil lamp on Saturdays." : undefined
    },
    navataraChakra,
    upagrahas,
    pushkaraPlacements
  };
}

// ---------------------------------------------------------
// Master Calculation Function
// ---------------------------------------------------------

export function calculateGurukulaMasterclass(
  kundli: KundliOutput,
  birthDate?: string,
  birthTime?: string,
  nativeName = "ಜಾತಕರು",
  gender?: string
): GurukulaMasterclassReport {
  // 1. Planetary dignity map for all 9 grahas
  const dignityList = kundli.planets.map((p) => checkPlanetaryDignity(p, kundli));
  const dignityMap = new Map<PlanetName, PlanetaryDignityDetail>();
  for (const d of dignityList) {
    dignityMap.set(d.planet, d);
  }

  // 2. Generate the 11 progressive pedagogical steps
  const steps: GurukulaStep[] = [
    buildLagnaStep(kundli, dignityMap),
    buildMoonStep(kundli, dignityMap),
    buildSukhaStep(kundli, dignityMap),
    buildKalatraStep(kundli, dignityMap),
    buildKarmaStep(kundli, dignityMap),
    buildTrikonaStep(kundli, dignityMap),
    buildDusthanaStep(kundli, dignityMap),
    buildDignityMatrixStep(kundli, dignityList),
    buildYogasStep(kundli),
    buildDashaTimingStep(kundli, birthDate, birthTime, dignityMap),
    buildDaivajnaSynthesisStep(kundli, nativeName)
  ];

  let currentAgeYears = 30;
  if (birthDate && birthTime) {
    try {
      currentAgeYears = ageDecimalYearsAt(birthDate, birthTime, 14.54, 74.31, new Date());
    } catch {
      currentAgeYears = 30;
    }
  }

  const bhukti = findBhuktiAtAge(kundli, currentAgeYears);

  // 3. Real-time Gochara Snapshot
  const gochara = calculateLiveGochara(kundli, new Date());

  // 4. Interactive Q&A 3-Pillar Synthesizer
  const questions = calculateGurukulaQuestions(kundli, gochara, dignityMap, currentAgeYears);

  // 5. Deep Diagnostics: Doshas, Gandanthara, Fears, Secrets & Cruelty
  const diagnostics = calculateGurukulaDiagnostics(kundli, currentAgeYears);

  // 6. Panchanga Angas, Nakshatra, Yoga, Karana & Upagrahas Engine
  const panchangaAngas = calculatePanchangaAngas(kundli, birthDate, birthTime);

  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakIdx = moonPlanet?.nakshatra ? moonPlanet.nakshatra.index : -1;
  const moonNakKn = moonNakIdx >= 0 && NAKSHATRAS_METADATA[moonNakIdx]
    ? NAKSHATRAS_METADATA[moonNakIdx]!.nameKn
    : (moonPlanet?.nakshatra?.sanskrit || "ಅಜ್ಞಾತ");

  return {
    nativeName,
    lagnaRashiKn: getRashiKn(kundli.lagnaRashi),
    lagnaRashiEn: getRashiEn(kundli.lagnaRashi),
    lagnaLordKn: getPlanetKn(signLord(kundli.lagnaRashi.index)),
    lagnaLordEn: getPlanetEn(signLord(kundli.lagnaRashi.index)),
    moonSignKn: getRashiKn(kundli.moonSign),
    moonSignEn: getRashiEn(kundli.moonSign),
    nakshatraKn: moonNakKn,
    nakshatraEn: moonPlanet?.nakshatra?.english || "Unknown",
    currentAgeYears,
    currentDashaMahaKn: bhukti ? getPlanetKn(bhukti.maha.planet) : undefined,
    currentDashaBhuktiKn: bhukti ? getPlanetKn(bhukti.bhukti) : undefined,
    totalSteps: steps.length,
    dignityMatrix: dignityList,
    steps,
    gochara,
    questions,
    diagnostics,
    panchangaAngas
  };
}
