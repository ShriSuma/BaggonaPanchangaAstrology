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
    // 1-based distance from planet's house to target house
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
    [PlanetName.Sun]: 0, // Mesha
    [PlanetName.Moon]: 1, // Vrishabha
    [PlanetName.Mars]: 9, // Makara
    [PlanetName.Mercury]: 5, // Kanya
    [PlanetName.Jupiter]: 3, // Karka
    [PlanetName.Venus]: 11, // Meena
    [PlanetName.Saturn]: 6, // Tula
    [PlanetName.Rahu]: 1, // Vrishabha
    [PlanetName.Ketu]: 7 // Vrischika
  };

  const NEECHA_MAP: Partial<Record<PlanetName, number>> = {
    [PlanetName.Sun]: 6, // Tula
    [PlanetName.Moon]: 7, // Vrischika
    [PlanetName.Mars]: 3, // Karka
    [PlanetName.Mercury]: 11, // Meena
    [PlanetName.Jupiter]: 9, // Makara
    [PlanetName.Venus]: 5, // Kanya
    [PlanetName.Saturn]: 0, // Mesha
    [PlanetName.Rahu]: 7, // Vrischika
    [PlanetName.Ketu]: 1 // Vrishabha
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

  // Digbala (Directional Strength)
  let hasDigbala = false;
  if (
    (p.name === PlanetName.Mercury || p.name === PlanetName.Jupiter) &&
    p.house === 1
  ) {
    hasDigbala = true;
  } else if (
    (p.name === PlanetName.Moon || p.name === PlanetName.Venus) &&
    p.house === 4
  ) {
    hasDigbala = true;
  } else if (p.name === PlanetName.Saturn && p.house === 7) {
    hasDigbala = true;
  } else if (
    (p.name === PlanetName.Sun || p.name === PlanetName.Mars) &&
    p.house === 10
  ) {
    hasDigbala = true;
  }

  // Combustion check with Sun
  let isCombust = false;
  const sun = getPlanet(kundli, PlanetName.Sun);
  if (sun && p.name !== PlanetName.Sun && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu) {
    const diff = Math.abs(p.degree - sun.degree);
    const orb = Math.min(diff, 360 - diff);
    const combustionLimits: Record<PlanetName, number> = {
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
    if (orb < (combustionLimits[p.name] ?? 12)) {
      isCombust = true;
    }
  }

  // Calculate houses this planet casts aspects on
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
// STEP BUILDERS (11 Classical Steps from Scratch to Advanced)
// ---------------------------------------------------------

/**
 * Step 1: Lagna & Lagna Lord (ಪ್ರಥಮ ದರ್ಶನ - ತನು ಭಾವ & ಲಗ್ನಾಧಿಪತಿ)
 */
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
    titleKn: "ಹಂತ 1: ಲಗ್ನ & ಲಗ್ನಾಧಿಪತಿ (ಪ್ರಥಮ ದರ್ಶನ - ತನು ಭಾವ)",
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

/**
 * Step 2: Moon, Rashi & Nakshatra (ಮನಃಕಾರಕ - ಭಾವನಾತ್ಮಕ ಶಕ್ತಿ & ಜನ್ಮ ನಕ್ಷತ್ರ)
 */
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

  // Moon conjunctions
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
    titleKn: "ಹಂತ 2: ಚಂದ್ರ, ಜನ್ಮ ರಾಶಿ & ನಕ್ಷತ್ರ (ಮನಃಕಾರಕ - ಭಾವನಾತ್ಮಕ ಶಕ್ತಿ)",
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

/**
 * Step 3: 4th House (ಸುಖ, ಮಾತೃ, ಗೃಹ & ವಾಹನ ಸ್ಥಾನ)
 */
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
  const occupants4Kn = occupants4.length > 0
    ? occupants4.map((p) => getPlanetKn(p.name)).join(", ")
    : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಶುದ್ಧ ಸುಖ ಭಾವ)";
  const occupants4En = occupants4.length > 0
    ? occupants4.map((p) => getPlanetEn(p.name)).join(", ")
    : "No occupying planets";

  const aspects4 = getAspectingPlanets(kundli, 4);
  const aspects4Kn = aspects4.length > 0
    ? aspects4.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ")
    : "ಯಾವುದೇ ಅಶುಭ ದೃಷ್ಟಿ ಇಲ್ಲ";

  const lord4House = lord4Pos?.house ?? 4;

  return {
    stepIndex: 3,
    stepCode: "sukha_bhava_foundation",
    titleKn: "ಹಂತ 3: 4ನೇ ಕೇಂದ್ರ - ಸುಖ ಸ್ಥಾನ (ಮಾತೃ, ಗೃಹ, ವಾಹನ & ಮನಃಶಾಂತಿ)",
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
      observationTipKn: "ಮನುಷ್ಯನಿಗೆ ಎಷ್ಟು ಕೋಟಿ ಸಂಪತ್ತಿದ್ದರೂ ಮನೆಯಲ್ಲಿ ನೆಮ್ಮದಿ ಇದೆಯೇ? ತಾಯಿಯ ವಾತ್ಸಲ್ಯ ಸಿಗುತ್ತದೆಯೇ? ಗೃಹ, ವಾಸ್ತು ಮತ್ತು ವಾಹನ ಸುಖ ಸಿಗುತ್ತದೆಯೇ ಎಂಬುದನ್ನು 4ನೇ ಮನೆಯೇ ಹೇಳುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `4th House (Sukha Bhava) • ${house4SignEn} Sign`,
      rashiAndLordEn: `4th Lord: ${lord4En} • Resides in House ${lord4House}`,
      occupyingGrahasEn: `Planets in 4th House: ${occupants4En}`,
      aspectingGrahasEn: `Planets aspecting 4th House: ${aspects4Kn}`,
      observationTipEn: "No matter how much wealth one has, true domestic happiness, maternal blessings, real estate stability, and vehicle comforts are revealed by the 4th house."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಮಾತೃ ಸುಖಂ ಗೃಹಂ ಚೈವ ವಾಹನಂ ಭೂಮಿಮೇವ ಚ । ಚತುರ್ಥಭಾವೇ ಪಶ್ಯಂತಿ ವಿದ್ಯಾಂ ಚ ಹೃದಯಂ ತಥಾ ॥",
      dignityKn: `ಚತುರ್ಥಾಧಿಪತಿ ${lord4Kn} ${lord4Dignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: `4ನೇ ಮನೆಯು ನೈಸರ್ಗಿಕವಾಗಿ ಶುಕ್ರ ಮತ್ತು ಚಂದ್ರರಿಗೆ ದಿಗ್ಬಲ ನೀಡುವ ಸ್ಥಾನ.`,
      bulletPointsKn: [
        `4ನೇ ಮನೆ ${house4SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಗೃಹ ಶಾಂತಿಯ ಅಡಿಪಾಯವಾಗಿದೆ.`,
        `ಚತುರ್ಥಾಧಿಪತಿ ${lord4Kn} ${lord4House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಗೃಹ ವಾಸ್ತು ಮತ್ತು ಭೂಮಿ-ಆಸ್ತಿಗಳು ಆ ಭಾವದ ಫಲಕ್ಕೆ ಕಟ್ಟುಬಿದ್ದಿರುತ್ತವೆ.`,
        occupants4.length > 0
          ? `4ನೇ ಮನೆಯಲ್ಲಿರುವ ${occupants4Kn} ಗ್ರಹಗಳು ಮನೆಯ ಆಂತರಿಕ ಪರಿಸರ ಮತ್ತು ಮನಸ್ಸಿನ ಶಾಂತಿಯ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರುತ್ತವೆ.`
          : `ಯಾವುದೇ ಪಾಪಗ್ರಹಗಳಿಲ್ಲದಿರುವುದು ಗೃಹ ಸಮಾಧಾನಕ್ಕೆ ಅನುಕೂಲಕರ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "4th house rules maternal happiness, property, vehicles, heart contentment, and primary foundation. Benefics here grant deep peace; malefics cause unrest.",
      dignityEn: `4th Lord ${lord4En} sits in ${lord4Dignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: `Venus and Moon obtain natural directional strength (Digbala) in the 4th house.`,
      bulletPointsEn: [
        `4th sign ${house4SignEn} dictates the emotional tone inside the residence.`,
        `Placement of 4th Lord in House ${lord4House} links property and vehicle luck to that realm.`,
        `Occupants in 4th (${occupants4En}) reveal whether home life feels restful or demanding.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `4ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${lord4Kn} ${lord4House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ಮತ್ತು 4ನೇ ಸ್ಥಾನದಲ್ಲಿ ${occupants4Kn} ಇರುವುದರಿಂದ, ಜಾತಕರ ಮನೆಯ ವಾತಾವರಣದಲ್ಲಿ ${lord4House === 6 || lord4House === 8 || lord4House === 12 ? "ಕೆಲವು ಏರುಪೇರುಗಳು ಮತ್ತು ಸ್ಥಳ ಬದಲಾವಣೆಯ ಯೋಗವಿದೆ" : "ಸ್ಥಿರತೆ, ವಾಹನ ಲಾಭ ಮತ್ತು ಕುಟುಂಬ ಸೌಖ್ಯ ಒಲಿದುಬರುತ್ತದೆ"}.`,
      lifeDomainKn: "ಮನಸ್ಸಿನ ನೆಮ್ಮದಿ, ತಾಯಿ, ಸ್ವಂತ ಮನೆ, ವಾಹನ, ವಾಸ್ತು ಸುಖ.",
      keyInfluencesKn: [
        `4ನೇ ರಾಶಿ: ${house4SignKn}`,
        `ಚತುರ್ಥಾಧಿಪತಿ: ${lord4Kn} (${lord4House}ನೇ ಮನೆ)`,
        `ಗ್ರಹಗಳು: ${occupants4Kn}`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 4th Lord sits in House ${lord4House}, the native's domestic satisfaction correlates with that house's karmic energy.`,
      lifeDomainEn: "Domestic Harmony, Mother, Real Estate, Vehicles, Inner Contentment.",
      keyInfluencesEn: [
        `4th Sign: ${house4SignEn}`,
        `4th Lord: ${lord4En} in House ${lord4House}`,
        `Occupants: ${occupants4En}`
      ]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಗೃಹಸ್ಥಿತಿ ಮತ್ತು ಮನಃಶಾಂತಿಯ ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ನಿಮ್ಮ 4ನೇ ಮನೆ ${house4SignKn} ಆಗಿದ್ದು, ಇದರ ಅಧಿಪತಿ ${lord4Kn} ${lord4House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ನೀವು ಹೊರಗಡೆ ಎಷ್ಟು ಸಕ್ರಿಯರಾಗಿದ್ದರೂ ಮನೆಗೆ ಬಂದಾಗ ಸಂಪೂರ್ಣ ಶಾಂತಿ ಸಿಗಬೇಕೆಂದು ಬಯಸುತ್ತೀರಿ. ಸ್ವಂತ ಆಸ್ತಿ ಅಥವಾ ವಾಹನ ಯೋಗ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ. ಮನೆಯ ವಾಸ್ತು ಸರಿಯಾಗಿಟ್ಟುಕೊಂಡು, ತಾಯಿಯ ಮನಸ್ಸನ್ನು ನೋಯಿಸದೆ ಆಶೀರ್ವಾದ ಪಡೆದರೆ ನಿಮ್ಮ ಸುಖ ಸ್ಥಾನಕ್ಕೆ ಅಪಾರ ಬಲ ಬರುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Regarding your home and peace of mind, your 4th house is ${house4SignEn} ruled by ${lord4En} in House ${lord4House}. Regardless of outside success, you deeply crave sanctuary at home. Real estate and vehicle comforts are indicated. Maintaining positive Vastu and honoring your mother's wishes will anchor peace in your household.`,

    practicalGuidanceKn: "ಮನೆಯಲ್ಲಿ ಈಶಾನ್ಯ ಭಾಗವನ್ನು ಸದಾ ಶುದ್ಧವಾಗಿಡಿ. ಗೋಸೇವೆ ಮಾಡುವುದು ಅಥವಾ ತಾಯಿಗೆ ಪ್ರೀತಿಯಿಂದ ವಸ್ತ್ರದಾನ ಮಾಡುವುದು ಚತುರ್ಥ ಸ್ಥಾನದ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
    practicalGuidanceEn: "Keep the northeast quadrant of your dwelling clean and clutter-free. Feeding cows and respecting the mother mitigates any 4th house afflictions."
  };
};

/**
 * Step 4: 7th House (ಕಳತ್ರ, ವಿವಾಹ, ಜೀವನ ಸಂಗಾತಿ & ಪಾಲುದಾರಿಕೆ)
 */
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
  const occupants7Kn = occupants7.length > 0
    ? occupants7.map((p) => getPlanetKn(p.name)).join(", ")
    : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಖಾಲಿ ಸಪ್ತಮ)";
  const occupants7En = occupants7.length > 0
    ? occupants7.map((p) => getPlanetEn(p.name)).join(", ")
    : "No occupying planets";

  const aspects7 = getAspectingPlanets(kundli, 7);
  const aspects7Kn = aspects7.length > 0
    ? aspects7.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ")
    : "ಯಾವುದೇ ನೇರ ದೃಷ್ಟಿ ಇಲ್ಲ";

  const lord7House = lord7Pos?.house ?? 7;

  // Kuja Dosha check in 7th
  const mars = getPlanet(kundli, PlanetName.Mars);
  const hasMarsIn7 = mars?.house === 7;
  const saturn = getPlanet(kundli, PlanetName.Saturn);
  const hasSaturnIn7 = saturn?.house === 7;

  return {
    stepIndex: 4,
    stepCode: "kalatra_bhava_marriage",
    titleKn: "ಹಂತ 4: 7ನೇ ಕೇಂದ್ರ - ಕಳತ್ರ ಸ್ಥಾನ (ದಾಂಪತ್ಯ, ಜೀವನ ಸಂಗಾತಿ & ಪಾಲುದಾರಿಕೆ)",
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
      observationTipKn: "7ನೇ ಮನೆಯು ಲಗ್ನದ ಪ್ರತಿಬಿಂಬ. ಸಂಗಾತಿಯ ಸ್ವಭಾವ, ವಿವಾಹದ ಸಮಯ, ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಜನರೊಂದಿಗೆ ವ್ಯವಹರಿಸುವ ರೀತಿಯನ್ನು 7ನೇ ಮನೆಯೇ ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `7th House (Kalatra Bhava) • ${house7SignEn} Sign (Direct 180° opposite Lagna)`,
      rashiAndLordEn: `7th Lord: ${lord7En} • Resides in House ${lord7House}`,
      occupyingGrahasEn: `Planets in 7th House: ${occupants7En}`,
      aspectingGrahasEn: `Planets aspecting 7th House: ${aspects7Kn}`,
      observationTipEn: "The 7th house is the mirror of the self. It reveals the temperament of the spouse, marriage timing, marital harmony, and public interactions."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಕಳತ್ರಂ ಕಾಮಭಾವಂ ಚ ಜಾಯಾಂ ಚ ವಣಿಜಾಂ ತಥಾ । ಸಪ್ತಮೇ ವೀಕ್ಷ್ಯ ತದ್ಭಾವಂ ಶುಭಪಾಶ್ಚ ಸುಖಪ್ರದಮ್ ॥",
      dignityKn: `ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7Dignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: hasMarsIn7
        ? "ಕುಜನು 7ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ಮಾಂಗಲ್ಯ/ಕುಜ ದೋಷದ ಪ್ರಭಾವವಿದ್ದು, ಸಂಗಾತಿಯೊಂದಿಗೆ ಮಾತುಕತೆಯಲ್ಲಿ ಸಂಯಮ ಅಗತ್ಯ."
        : hasSaturnIn7
        ? "ಶನಿಯು 7ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ದಿಗ್ಬಲ ಪಡೆಯುತ್ತಾನೆ; ವಿವಾಹದಲ್ಲಿ ಸ್ವಲ್ಪ ವಿಳಂಬವಾದರೂ ಸಂಗಾತಿ ಪ್ರಬುದ್ಧರು ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತರಾಗಿರುತ್ತಾರೆ."
        : "ಸಪ್ತಮ ಸ್ಥಾನವು ಸಾಧಾರಣವಾಗಿ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಕೂಡಿದೆ.",
      bulletPointsKn: [
        `7ನೇ ರಾಶಿ ${house7SignKn} ಸಂಗಾತಿಯ ಮನೋಧರ್ಮ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವದ ಲಕ್ಷಣಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
        `ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ವಿವಾಹ ಜೀವನದ ಬಂಧವು ಆ ಭಾವದ ಫಲಕ್ಕೆ ಹೊಂದಿಕೊಂಡಿದೆ.`,
        occupants7.length > 0
          ? `7ನೇ ಮನೆಯಲ್ಲಿರುವ ${occupants7Kn} ಗ್ರಹಗಳು ನೇರವಾಗಿ ದಾಂಪತ್ಯದ ಹೊಂದಾಣಿಕೆಯ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರುತ್ತವೆ.`
          : `7ನೇ ಮನೆ ನಿರ್ಮಲವಾಗಿದ್ದು, ಸಪ್ತಮಾಧಿಪತಿಯ ಬಲವೇ ಪ್ರಮುಖ ನಿರ್ಧಾರಕ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "7th house governs spouse, marriage longevity, contracts, and partnerships. Benefics here grant devoted companionship; malefics demand conscious compromise.",
      dignityEn: `7th Lord ${lord7En} is placed in ${lord7Dignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: hasMarsIn7
        ? "Mars in 7th creates fiery Kuja influence, calling for temper control in relationships."
        : hasSaturnIn7
        ? "Saturn in 7th has Digbala, bringing a mature, pragmatic, and serious partner."
        : "7th house receives standard planetary influences.",
      bulletPointsEn: [
        `7th sign ${house7SignEn} reflects the partner's character and appearance.`,
        `Placement of 7th Lord in House ${lord7House} links marriage destiny to that life department.`,
        `Planets in 7th (${occupants7En}) color daily partnership dynamics.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7House}ನೇ ಮನೆಯಲ್ಲಿ ನೆಲೆಸಿದ್ದು 7ನೇ ಮನೆಯಲ್ಲಿ ${occupants7Kn} ಇರುವುದರಿಂದ, ಜಾತಕರ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ${hasMarsIn7 ? "ಅಭಿಪ್ರಾಯ ಭೇದಗಳು ಬರದಂತೆ ತಾಳ್ಮೆ ವಹಿಸುವುದು" : "ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಸಹಕಾರದಿಂದ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುವ"} ಲಕ್ಷಣಗಳಿವೆ.`,
      lifeDomainKn: "ವಿವಾಹ, ಜೀವನ ಸಂಗಾತಿ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ, ಸಾರ್ವಜನಿಕ ಒಪ್ಪಂದಗಳು.",
      keyInfluencesKn: [
        `7ನೇ ರಾಶಿ: ${house7SignKn}`,
        `ಸಪ್ತಮಾಧಿಪತಿ: ${lord7Kn} (${lord7House}ನೇ ಮನೆ)`,
        `ಗ್ರಹ ಸ್ಥಿತಿ: ${occupants7Kn}`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 7th Lord sits in House ${lord7House}, marital happiness depends upon mutual respect and accommodating partner perspectives.`,
      lifeDomainEn: "Marriage, Spouse Disposition, Business Partnerships, Public Deals.",
      keyInfluencesEn: [
        `7th Sign: ${house7SignEn}`,
        `7th Lord: ${lord7En} in House ${lord7House}`,
        `Occupants: ${occupants7En}`
      ]
    },

    spokenConsultationScriptKn: `ದಾಂಪತ್ಯ ಮತ್ತು ಪಾಲುದಾರಿಕೆಯ ವಿಚಾರಕ್ಕೆ ಬಂದರೆ, ನಿಮ್ಮ 7ನೇ ಮನೆ ${house7SignKn} ಆಗಿದ್ದು, ಸಪ್ತಮಾಧಿಪತಿ ${lord7Kn} ${lord7House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ನಿಮ್ಮ ಸಂಗಾತಿಯು ಸ್ವಾಭಿಮಾನಿ ಹಾಗೂ ಕರ್ತವ್ಯನಿಷ್ಠ ಸ್ವಭಾವದವರಾಗಿರುತ್ತಾರೆ. ಸಣ್ಣಪುಟ್ಟ ಮಾತುಗಳಲ್ಲಿ ಹಠ ಬಿಟ್ಟು ಪರಸ್ಪರ ಗೌರವ ನೀಡಿದರೆ ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಸಂತೋಷ ಸದಾ ಇರುತ್ತದೆ. ಪಾಲುದಾರಿಕೆ ವ್ಯಾಪಾರ ಮಾಡುವುದಾದರೆ ಎಲ್ಲಾ ಒಪ್ಪಂದಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಲಿಖಿತ ರೂಪದಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳುವುದು ಬುದ್ಧಿವಂತಿಕೆ.`,
    spokenConsultationScriptEn: `Looking at your marriage and partnership house, your 7th house is ${house7SignEn}, ruled by ${lord7En} in House ${lord7House}. Your spouse carries strong principles and self-respect. Mutual patience and empathetic communication ensure lasting domestic bliss. If venturing into business partnerships, keep all agreements transparent.`,

    practicalGuidanceKn: "ಶುಕ್ರವಾರ ಅಥವಾ ಸೋಮವಾರದಂದು ಉಮಾ-ಮಹೇಶ್ವರ ಅಥವಾ ಲಕ್ಷ್ಮೀ-ನಾರಾಯಣ ಪೂಜೆ ಮಾಡುವುದು ಹಾಗೂ ಸಂಗಾತಿಯೊಂದಿಗೆ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ದಾಂಪತ್ಯಕ್ಕೆ ದೈವಿಕ ರಕ್ಷಣೆ ಒದಗಿಸುತ್ತದೆ.",
    practicalGuidanceEn: "Offer prayers to Uma-Maheshwara or Lakshmi-Narayana on Fridays. Cultivate attentive listening to nurture mutual affection."
  };
};

/**
 * Step 5: 10th House (ಕರ್ಮ, ಆಜೀವಿಕ & ಕೀರ್ತಿ ಸ್ಥಾನ)
 */
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
  const occupants10Kn = occupants10.length > 0
    ? occupants10.map((p) => getPlanetKn(p.name)).join(", ")
    : "ಯಾವ ಗ್ರಹವೂ ಇಲ್ಲ (ಖಾಲಿ ಕರ್ಮ ಭಾವ)";
  const occupants10En = occupants10.length > 0
    ? occupants10.map((p) => getPlanetEn(p.name)).join(", ")
    : "No occupying planets";

  const aspects10 = getAspectingPlanets(kundli, 10);
  const aspects10Kn = aspects10.length > 0
    ? aspects10.map((a) => `${getPlanetKn(a.planet.name)} (${a.aspectTypeKn})`).join(", ")
    : "ಯಾವುದೇ ನೇರ ದೃಷ್ಟಿ ಇಲ್ಲ";

  const lord10House = lord10Pos?.house ?? 10;

  // Digbala check: Sun or Mars in 10
  const hasSunIn10 = occupants10.some((p) => p.name === PlanetName.Sun);
  const hasMarsIn10 = occupants10.some((p) => p.name === PlanetName.Mars);

  return {
    stepIndex: 5,
    stepCode: "karma_bhava_career",
    titleKn: "ಹಂತ 5: 10ನೇ ಕೇಂದ್ರ - ಕರ್ಮ ಸ್ಥಾನ (ಆಜೀವಿಕ, ಉದ್ಯೋಗ, ಕೀರ್ತಿ & ಅಧಿಕಾರ)",
    titleEn: "Step 5: 10th House - Karma Bhava (Career, Livelihood & Public Status)",
    stageBadgeKn: "ಕೇಂದ್ರ ಪರೀಕ್ಷೆ • ಕರ್ಮ ಸ್ತಂಭ",
    stageBadgeEn: "Kendra Pillar • Professional Zenith",
    focusHouses: [10, lord10House],
    focusRashis: [house10Sign.index, lord10Pos ? lord10Pos.rashi.index : house10Sign.index],
    focusPlanets: [lord10, ...occupants10.map((p) => p.name)],

    whereToLookKn: {
      primaryHouseKn: `10ನೇ ಮನೆ (ಕರ್ಮ ಭಾವ) • ${house10SignKn} ರಾಶಿ (ಮಧ್ಯ ಲಗ್ನ - ಅತ್ಯುನ್ನತ ಸ್ಥಾನ)`,
      rashiAndLordKn: `ದಶಮಾಧಿಪತಿ: ${lord10Kn} • ಸ್ಥಿತಿ: ${lord10House}ನೇ ಮನೆಯಲ್ಲಿ`,
      occupyingGrahasKn: `10ನೇ ಮನೆಯಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${occupants10Kn}`,
      aspectingGrahasKn: `10ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿರುವ ಗ್ರಹಗಳು: ${aspects10Kn}`,
      observationTipKn: "ಜಾತಕದ ಆಕಾಶದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಶಿಖರ 10ನೇ ಮನೆ. ಜಾತಕರು ಯಾವ ವೃತ್ತಿ ಮಾಡಬೇಕು? ಸ್ವಂತ ಉದ್ಯಮವೋ ಅಥವಾ ಸೇವಾವೃತ್ತಿಯೋ? ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ಗೌರವ ಸಿಗುತ್ತದೆಯೇ ಎಂಬುದನ್ನು 10ನೇ ಮನೆಯೇ ನಿರ್ಧರಿಸುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `10th House (Karma Bhava) • ${house10SignEn} Sign (Midheaven - Highest Zenith)`,
      rashiAndLordEn: `10th Lord: ${lord10En} • Resides in House ${lord10House}`,
      occupyingGrahasEn: `Planets in 10th House: ${occupants10En}`,
      aspectingGrahasEn: `Planets aspecting 10th House: ${aspects10Kn}`,
      observationTipEn: "The 10th house is the zenith of the chart. It determines career direction, whether one suits employment vs enterprise, authority standing, and public prestige."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಕರ್ಮಸ್ಥಾನಂ ಪ್ರವಕ್ಷ್ಯಾಮಿ ಕೀರ್ತಿಂ ವೃತ್ತಿಂ ಚ ಗೌರವಮ್ । ದಶಮೇಶೇ ಬಲೋಪೇತೇ ರಾಜಪೂಜ್ಯೋ ನ ಸಂಶಯಃ ॥",
      dignityKn: `ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10Dignity?.dignityLabelKn || "ಸ್ವಭಾವಿಕ ಸ್ಥಿತಿ"}ದಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: hasSunIn10 || hasMarsIn10
        ? "ಸೂರ್ಯ ಅಥವಾ ಕುಜ 10ನೇ ಮನೆಯಲ್ಲಿದ್ದು ದಿಗ್ಬಲ (Directional Strength) ಪಡೆದಿದ್ದಾರೆ. ಇದು ಅಧಿಕಾರ, ನಾಯಕತ್ವ ಮತ್ತು ಪ್ರಭಾವಿ ಸ್ಥಾನವನ್ನು ಕರುಣಿಸುತ್ತದೆ."
        : `10ನೇ ಮನೆಯು ಸಮಾಜದ ಕರ್ಮಕ್ಷೇತ್ರವನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.`,
      bulletPointsKn: [
        `10ನೇ ರಾಶಿ ${house10SignKn} ಜಾತಕರ ಕಾರ್ಯಕ್ಷೇತ್ರ ಮತ್ತು ಕಾರ್ಯಶೈಲಿಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತದೆ.`,
        `ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10House}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಆಜೀವಿಕೆಯ ಸಂಪತ್ತು ಮತ್ತು ಆದಾಯ ಆ ಸ್ಥಾನಕ್ಕೆ ನೇರವಾಗಿ ಜೋಡಿಸಲ್ಪಟ್ಟಿದೆ.`,
        occupants10.length > 0
          ? `10ನೇ ಮನೆಯಲ್ಲಿರುವ ${occupants10Kn} ಗ್ರಹಗಳು ನೇರವಾಗಿ ವೃತ್ತಿ ಕ್ಷೇತ್ರದ ಸ್ವರೂಪವನ್ನು ರೂಪಿಸುತ್ತವೆ.`
          : `ದಶಮಾಧಿಪತಿಯ ಸ್ವತಂತ್ರ ಬಲದಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ನಿರಂತರ ಪ್ರಗತಿ ಸಾಧ್ಯವಾಗುತ್ತದೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "10th house dictates livelihood, public respect, leadership, and professional honors. Sun and Mars have directional strength here.",
      dignityEn: `10th Lord ${lord10En} is placed in ${lord10Dignity?.dignityLabelEn || "Normal status"}.`,
      grahaRelationsEn: hasSunIn10 || hasMarsIn10
        ? "Sun or Mars commands full Digbala in the 10th house, giving commanding executive authority."
        : "Standard professional karma indications apply.",
      bulletPointsEn: [
        `10th sign ${house10SignEn} dictates suitable industries and executive styles.`,
        `Placement of 10th Lord in House ${lord10House} links career success to that sphere.`,
        `Occupants in 10th (${occupants10En}) describe daily workplace responsibilities.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10House}ನೇ ಮನೆಯಲ್ಲಿ ಕುಳಿತಿರುವುದರಿಂದ ಜಾತಕರಿಗೆ ${lord10House === 1 || lord10House === 10 ? "ಸ್ವಪ್ರಯತ್ನದಿಂದ ಸ್ವಂತ ನಾಯಕತ್ವ ವಹಿಸುವ ಯೋಗ" : lord10House === 2 || lord10House === 11 ? "ಉದ್ಯೋಗದಿಂದ ಅಧಿಕ ಧನಲಾಭ ಗಳಿಸುವ ಯೋಗ" : "ಸತತ ಪರಿಶ್ರಮದಿಂದ ಹಂತಹಂತವಾಗಿ ಉನ್ನತಿ ಹೊಂದುವ ಭಾಗ್ಯ"} ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`,
      lifeDomainKn: "ವೃತ್ತಿ, ಆಜೀವಿಕ, ಸಾಮಾಜಿಕ ಕೀರ್ತಿ, ನಾಯಕತ್ವ, ಸರಕಾರಿ ಗೌರವ.",
      keyInfluencesKn: [
        `10ನೇ ರಾಶಿ: ${house10SignKn}`,
        `ದಶಮಾಧಿಪತಿ: ${lord10Kn} (${lord10House}ನೇ ಮನೆ)`,
        `ಗ್ರಹಗಳು: ${occupants10Kn}`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 10th Lord sits in House ${lord10House}, livelihood is tied to consistent application in that respective sphere.`,
      lifeDomainEn: "Career, Enterprise, Social Standing, Executive Command, Promotion.",
      keyInfluencesEn: [
        `10th Sign: ${house10SignEn}`,
        `10th Lord: ${lord10En} in House ${lord10House}`,
        `Occupants: ${occupants10En}`
      ]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಉದ್ಯೋಗ ಮತ್ತು ಕರ್ಮಕ್ಷೇತ್ರವನ್ನು ನೋಡಿದರೆ, 10ನೇ ಮನೆ ${house10SignKn} ಆಗಿದ್ದು, ದಶಮಾಧಿಪತಿ ${lord10Kn} ${lord10House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ನೀವು ಕೆಲಸದಲ್ಲಿ ಶಿಸ್ತು ಮತ್ತು ನಿಷ್ಠೆಯನ್ನು ಇಟ್ಟುಕೊಂಡರೆ ನಿಮಗೆ ಖಂಡಿತವಾಗಿಯೂ ಉನ್ನತ ಸ್ಥಾನ ಮತ್ತು ಗೌರವ ಸಿಗುತ್ತದೆ. ಅಧಿಕಾರಸ್ಥರೊಂದಿಗೆ ವಿನಾಕಾರಣ ಸಂಘರ್ಷಕ್ಕಿಳಿಯದೆ ನಿಮ್ಮ ಜವಾಬ್ದಾರಿಯನ್ನು ಪ್ರಾಮಾಣಿಕವಾಗಿ ನಿರ್ವಹಿಸಿದರೆ ನಿಮ್ಮ ಕೀರ್ತಿ ಸಮಾಜದಲ್ಲಿ ಬೆಳಗುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Looking at your professional zenith, your 10th house is ${house10SignEn}, ruled by ${lord10En} in House ${lord10House}. When you combine discipline with focused execution, authority and recognition follow naturally. Avoid unnecessary power struggles with superiors, and your professional reputation will shine.`,

    practicalGuidanceKn: "ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ಸೂರ್ಯನಿಗೆ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಅರ್ಘ್ಯ ನೀಡುವುದು ಮತ್ತು ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ಪ್ರಾಮಾಣಿಕತೆ ಕಾಪಾಡುವುದು ಉದ್ಯೋಗದಲ್ಲಿ ಶೀಘ್ರ ಬಡ್ತಿ ನೀಡುತ್ತದೆ.",
    practicalGuidanceEn: "Offer morning Surya Arghya in a copper vessel and maintain strict ethical integrity at work for steady career advancement."
  };
};

/**
 * Step 6: Trikonas - 5th & 9th Houses (ಪೂರ್ವ ಪುಣ್ಯ & ಭಾಗ್ಯ ಸ್ಥಾನ)
 */
const buildTrikonaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house5Sign = getHouseRashi(lagnaRashiIdx, 5);
  const house5SignKn = getRashiKn(house5Sign);
  const house5SignEn = getRashiEn(house5Sign);
  const lord5 = signLord(house5Sign.index);
  const lord5Kn = getPlanetKn(lord5);
  const lord5En = getPlanetEn(lord5);
  const lord5Pos = getPlanet(kundli, lord5);

  const house9Sign = getHouseRashi(lagnaRashiIdx, 9);
  const house9SignKn = getRashiKn(house9Sign);
  const house9SignEn = getRashiEn(house9Sign);
  const lord9 = signLord(house9Sign.index);
  const lord9Kn = getPlanetKn(lord9);
  const lord9En = getPlanetEn(lord9);
  const lord9Pos = getPlanet(kundli, lord9);

  const occupants5 = getHouseOccupants(kundli, 5);
  const occupants9 = getHouseOccupants(kundli, 9);

  return {
    stepIndex: 6,
    stepCode: "trikona_poorva_punya_bhagya",
    titleKn: "ಹಂತ 6: ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳು - 5ನೇ (ಪೂರ್ವ ಪುಣ್ಯ) & 9ನೇ (ಭಾಗ್ಯ ಸ್ಥಾನ)",
    titleEn: "Step 6: Trikona Houses - 5th & 9th (Poorva Punya & Divine Fortune)",
    stageBadgeKn: "ತ್ರಿಕೋಣ ಪರೀಕ್ಷೆ • ಲಕ್ಷ್ಮೀ ಕೃಪೆ",
    stageBadgeEn: "Trikona Blessings • Lakshmi Grace",
    focusHouses: [5, 9],
    focusRashis: [house5Sign.index, house9Sign.index],
    focusPlanets: [lord5, lord9],

    whereToLookKn: {
      primaryHouseKn: `5ನೇ ಮನೆ (${house5SignKn}) & 9ನೇ ಮನೆ (${house9SignKn}) — ಧರ್ಮ-ತ್ರಿಕೋಣಗಳು`,
      rashiAndLordKn: `ಪಂಚಮಾಧಿಪತಿ: ${lord5Kn} (${lord5Pos?.house}ನೇ ಮನೆ) • ಭಾಗ್ಯಾಧಿಪತಿ: ${lord9Kn} (${lord9Pos?.house}ನೇ ಮನೆ)`,
      occupyingGrahasKn: `5ನೇ ಮನೆಯಲ್ಲಿ: ${occupants5.map((p) => getPlanetKn(p.name)).join(", ") || "ಖಾಲಿ"} | 9ನೇ ಮನೆಯಲ್ಲಿ: ${occupants9.map((p) => getPlanetKn(p.name)).join(", ") || "ಖಾಲಿ"}`,
      aspectingGrahasKn: "ತ್ರಿಕೋಣಗಳು ಜಾತಕದ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚಗಳು (Divine Shield).",
      observationTipKn: "ಜೀವನದಲ್ಲಿ ಎಷ್ಟೇ ಕಷ್ಟ ಬಂದರೂ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕಾಪಾಡುವ ದೈವಿಕ ಶಕ್ತಿಯೇ ತ್ರಿಕೋಣ. 5ನೇ ಮನೆ ಬುದ್ಧಿ ಮತ್ತು ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯವಾದರೆ, 9ನೇ ಮನೆ ಸಾಕ್ಷಾತ್ ಈ ಜನ್ಮದ ಭಾಗ್ಯ ಮತ್ತು ತಂದೆಯ ಆಶೀರ್ವಾದ."
    },
    whereToLookEn: {
      primaryHouseEn: `5th House (${house5SignEn}) & 9th House (${house9SignEn}) — Dharma Trikonas`,
      rashiAndLordEn: `5th Lord: ${lord5En} (House ${lord5Pos?.house}) • 9th Lord: ${lord9En} (House ${lord9Pos?.house})`,
      occupyingGrahasEn: `Planets in 5th: ${occupants5.map((p) => getPlanetEn(p.name)).join(", ") || "Empty"} | Planets in 9th: ${occupants9.map((p) => getPlanetEn(p.name)).join(", ") || "Empty"}`,
      aspectingGrahasEn: "Trikonas form the divine armor of the horoscope.",
      observationTipEn: "When life throws turbulence, it is the Trikonas that rescue the native. House 5 is past-life merit and sharp intellect; House 9 is divine luck and grace."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಭಾಗ್ಯಸ್ಥಾನಂ ಶುಭಂ ಪ್ರಾಹುಃ ಪೂರ್ವಪುಣ್ಯಂ ಚ ಪಂಚಮಮ್ । ತ್ರಿಕೋಣಾಧೀಶ ಸಂಯೋಗೇ ರಾಜಯೋಗೋ ನ ಸಂಶಯಃ ॥",
      dignityKn: `ಪಂಚಮಾಧಿಪತಿ ${lord5Kn} ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿ ${lord9Kn}ರ ಬಲವು ಜಾತಕದ ಸಮಗ್ರ ಭಾಗ್ಯೋದಯವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.`,
      grahaRelationsKn: "ಕೇಂದ್ರಾಧಿಪತಿ ಮತ್ತು ತ್ರಿಕೋಣಾಧಿಪತಿಗಳ ನಡುವೆ ಸಂಬಂಧವಿದ್ದರೆ ಪರಮ ಪವಿತ್ರ 'ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ' ಸೃಷ್ಟಿಯಾಗುತ್ತದೆ.",
      bulletPointsKn: [
        `5ನೇ ಮನೆ ಬುದ್ಧಿವಂತಿಕೆ, ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಮಕ್ಕಳ ಸುಖವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
        `9ನೇ ಮನೆ ದೇವರ ಕೃಪೆ, ಗುರುಗಳ ಆಶೀರ್ವಾದ, ಧಾರ್ಮಿಕ ಪ್ರವೃತ್ತಿ ಮತ್ತು ತಂದೆಯ ಸಹಕಾರವನ್ನು ನೀಡುತ್ತದೆ.`,
        `ತ್ರಿಕೋಣಾಧಿಪತಿಗಳು ಬಲವಾಗಿದ್ದಾಗ ಎಂತಹ ಆಪತ್ತಿನಿಂದಲೂ ಪವಾಡಸದೃಶವಾಗಿ ಪಾರಾಗುವ ಯೋಗವಿರುತ್ತದೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Trikonas are the auspicious Lakshmi Sthanas. Strong 5th and 9th lords provide spontaneous breakthroughs in times of distress.",
      dignityEn: `Strengths of 5th Lord (${lord5En}) and 9th Lord (${lord9En}) govern the spiritual and fortune quotient.`,
      grahaRelationsEn: "Kendra-Trikona lord associations form premier Raja Yogas.",
      bulletPointsEn: [
        `5th house governs creative intelligence, intuition, and progeny merits.`,
        `9th house governs higher dharma, guidance of mentors, and spontaneous good luck.`,
        `Trikona strength acts as a lifelong protective talisman against sudden downfalls.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `5ನೇ ಮತ್ತು 9ನೇ ಅಧಿಪತಿಗಳಾದ ${lord5Kn} ಮತ್ತು ${lord9Kn} ಉತ್ತಮ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ, ಜಾತಕರು ತಮ್ಮ ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ದೈವಿಕ ಸಹಾಯವನ್ನು ಸಕಾಲದಲ್ಲಿ ಪಡೆಯುತ್ತಾರೆ.`,
      lifeDomainKn: "ದೈವಬಲ, ಬುದ್ಧಿಮತ್ತೆ, ತಂದೆಯ ಪ್ರೀತಿ, ಗುರು ಕೃಪೆ, ತೀರ್ಥಯಾತ್ರೆ, ಸಂತಾನ ಸೌಖ್ಯ.",
      keyInfluencesKn: [
        `5ನೇ ಅಧಿಪತಿ: ${lord5Kn}`,
        `9ನೇ ಅಧಿಪತಿ: ${lord9Kn}`,
        `ತ್ರಿಕೋಣ ರಾಶಿಗಳು: ${house5SignKn} & ${house9SignKn}`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the 5th and 9th lords (${lord5En} & ${lord9En}) are positioned favorably, efforts are rewarded with timely fortune and spiritual grace.`,
      lifeDomainEn: "Divine Grace, Progeny, Wisdom, Paternal Support, Spiritual Mentors.",
      keyInfluencesEn: [
        `5th Lord: ${lord5En}`,
        `9th Lord: ${lord9En}`,
        `Trikona Signs: ${house5SignEn} & ${house9SignEn}`
      ]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅದೃಷ್ಟ ಮತ್ತು ದೇವರ ಕೃಪೆಯ ವಿಚಾರಕ್ಕೆ ಬಂದರೆ, ನಿಮ್ಮ 5ನೇ ಮನೆ ${house5SignKn} ಹಾಗೂ 9ನೇ ಮನೆ ${house9SignKn}. ನೀವು ಪೂರ್ವಜನ್ಮದಲ್ಲಿ ಮಾಡಿದ ಪುಣ್ಯ ನಿಮ್ಮ ಬೆನ್ನಿಗಿದೆ. ನೀವು ಯಾವುದೇ ಕಷ್ಟಕ್ಕೆ ಸಿಲುಕಿದಾಗಲೂ ಕೊನೆಯ ಹಂತದಲ್ಲಿ ಯಾರೋ ಒಬ್ಬರು ಬಂದು ಸಹಾಯ ಮಾಡುವ ಅಥವಾ ಒಂದು ದಾರಿ ಗೋಚರಿಸುವ ಅನುಭವ ನಿಮಗಾಗುತ್ತಿರುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಭಾಗ್ಯ ಸ್ಥಾನದ ಮಹಿಮೆ. ನಿಮ್ಮ ತಂದೆ ಮತ್ತು ಗುರುಗಳನ್ನು ಗೌರವಿಸುವುದರಿಂದ ನಿಮ್ಮ ಅದೃಷ್ಟ ದ್ವಿಗುಣಗೊಳ್ಳುತ್ತದೆ.`,
    spokenConsultationScriptEn: `Regarding divine fortune and luck, your 5th house is ${house5SignEn} and 9th is ${house9SignEn}. You carry significant past-life spiritual merits. Even during crises, timely help or unexpected doors open for you at the eleventh hour. Respecting your father and elders directly magnifies this blessing.`,

    practicalGuidanceKn: "ಪ್ರತಿದಿನ ಗಾಯತ್ರೀ ಮಂತ್ರ ಅಥವಾ ಇಷ್ಟದೇವತಾ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಮತ್ತು ಗುರುವಾರದಂದು ಗುರು ಹಿರಿಯರಿಗೆ ಗೌರವ ಸಮರ್ಪಿಸುವುದು ನಿಮ್ಮ ಭಾಗ್ಯೋದಯವನ್ನು ತ್ವರಿತಗೊಳಿಸುತ್ತದೆ.",
    practicalGuidanceEn: "Chant the Gayatri Mantra or your Ishta Devata Stotra daily. Honoring teachers and spiritual preceptors accelerates fortune."
  };
};

/**
 * Step 7: Dusthanas (6, 8, 12) & Maandi (ದುಷ್ಟಾನಗಳು & ಮಾಂದಿ ಕರ್ಮ ಗ್ರಂಥಿ)
 */
const buildDusthanaStep = (kundli: KundliOutput, dignityMap: Map<PlanetName, PlanetaryDignityDetail>): GurukulaStep => {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const house6Sign = getHouseRashi(lagnaRashiIdx, 6);
  const house8Sign = getHouseRashi(lagnaRashiIdx, 8);
  const house12Sign = getHouseRashi(lagnaRashiIdx, 12);

  const lord6 = signLord(house6Sign.index);
  const lord8 = signLord(house8Sign.index);
  const lord12 = signLord(house12Sign.index);

  const lord6Kn = getPlanetKn(lord6);
  const lord8Kn = getPlanetKn(lord8);
  const lord12Kn = getPlanetKn(lord12);

  const maandi = kundli.maandi;
  const maandiRashiKn = maandi?.rashi ? getRashiKn(maandi.rashi) : "ಗೊತ್ತಿಲ್ಲ";
  const maandiHouse = maandi?.rashi ? rashiIndexInHouse(lagnaRashiIdx, (maandi.rashi.index - lagnaRashiIdx + 12) % 12 + 1) : 0;

  return {
    stepIndex: 7,
    stepCode: "dusthana_maandi_karma",
    titleKn: "ಹಂತ 7: ತ್ರಿಕ ಸ್ಥಾನಗಳು (6, 8, 12) & ಮಾಂದಿ (ಕರ್ಮ ಗ್ರಂಥಿ - ಕಂಟಕ & ಸವಾಲುಗಳು)",
    titleEn: "Step 7: Dusthanas (6, 8, 12) & Maandi (Karmic Obstacles & Hurdles)",
    stageBadgeKn: "ಎಚ್ಚರಿಕೆ ಪರೀಕ್ಷೆ • ಕರ್ಮ ಶೋಧನೆ",
    stageBadgeEn: "Cautionary Audit • Karmic Nodes",
    focusHouses: [6, 8, 12],
    focusRashis: [house6Sign.index, house8Sign.index, house12Sign.index],
    focusPlanets: [lord6, lord8, lord12],

    whereToLookKn: {
      primaryHouseKn: `6ನೇ (ಋಣ-ರೋಗ-ಶತ್ರು), 8ನೇ (ಆಯುಷ್ಯ-ಆಕಸ್ಮಿಕ ಸಂಕಟ), 12ನೇ (ವ್ಯಯ-ಮೋಕ್ಷ) ಸ್ಥಾನಗಳು`,
      rashiAndLordKn: `6ನೇ ಅಧಿಪತಿ: ${lord6Kn} • 8ನೇ ಅಧಿಪತಿ: ${lord8Kn} • 12ನೇ ಅಧಿಪತಿ: ${lord12Kn}`,
      occupyingGrahasKn: `ಮಾಂದಿ (ಗುಳಿಕ) ಸ್ಥಿತಿ: ${maandiRashiKn} ರಾಶಿಯಲ್ಲಿ (ಅಂಶ: ${maandi?.degree.toFixed(2) || "0"}°)`,
      aspectingGrahasKn: "ದುಷ್ಟಾನಗಳ ಅಧಿಪತಿಗಳು ಎಲ್ಲಿ ಕುಳಿತಿದ್ದಾರೆ ಮತ್ತು ಮಾಂದಿ ಎಲ್ಲಿದ್ದಾನೆ ಎಂಬುದನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ನೋಡಬೇಕು.",
      observationTipKn: "ಜೀವನದಲ್ಲಿ ಕೆಲಸಗಳು 99% ತಲುಪಿ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೈಜಾರಲು ಈ ಮಾಂದಿ ಮತ್ತು 8/12ನೇ ಮನೆಗಳೇ ಕಾರಣ. ಜಾತಕರಿಗೆ ಎಲ್ಲಿ ಅಡೆತಡೆ ಬರುತ್ತದೆ ಎಂದು ಮೊದಲೇ ಎಚ್ಚರಿಸುವುದು ಜ್ಯೋತಿಷಿಯ ಧರ್ಮ."
    },
    whereToLookEn: {
      primaryHouseEn: `6th (Debts/Illness), 8th (Sudden Obstacles/Longevity), 12th (Expenses/Losses)`,
      rashiAndLordEn: `6th Lord: ${getPlanetEn(lord6)} • 8th Lord: ${getPlanetEn(lord8)} • 12th Lord: ${getPlanetEn(lord12)}`,
      occupyingGrahasEn: `Maandi (Gulika) placement: ${maandi?.rashi ? getRashiEn(maandi.rashi) : "Unknown"} (${maandi?.degree.toFixed(2) || "0"}°)`,
      aspectingGrahasEn: "Examine where the 6/8/12 lords sit and where Maandi casts its shadow.",
      observationTipEn: "When projects reach 99% completion and fail at the finish line, Maandi and the 8th/12th houses are often responsible. Guiding on these hurdles is an astrologer's duty."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಷಷ್ಠಾಷ್ಟಮ ವ್ಯಯಸ್ಥಾನೇ ಪಾಪಗ್ರಹ ಸಮನ್ವಿತೇ । ರೋಗ ಶತ್ರು ಋಣಂ ಚೈವ ಮಾಂದೇಸ್ತು ಸರ್ವವಿಘ್ನಕೃತ್ ॥",
      dignityKn: "ದುಷ್ಟಾನಾಧಿಪತಿಗಳು ಕೇಂದ್ರ/ತ್ರಿಕೋಣಗಳಲ್ಲಿದ್ದರೆ ಕ್ಲೇಶ; ದುಷ್ಟಾನದಲ್ಲೇ ಇದ್ದರೆ ವಿಪರೀತ ರಾಜಯೋಗ ಸಾಧ್ಯ.",
      grahaRelationsKn: "ಮಾಂದಿಯು ಶನಿಯ ಉಪಗ್ರಹವಾಗಿದ್ದು, ಪಿತೃ ಬಾಧೆ ಅಥವಾ ಅಪೂರ್ಣ ಸಂಕಲ್ಪಗಳ ಕರ್ಮ ಗ್ರಂಥಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
      bulletPointsKn: [
        `6ನೇ ಮನೆ ರೋಗ, ಸಾಲ ಮತ್ತು ವಿರೋಧಿಗಳನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ; ಇಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಿದ್ದರೆ ಶತ್ರುನಾಶವಾಗುತ್ತದೆ.`,
        `8ನೇ ಮನೆ ಆಕಸ್ಮಿಕ ಏರಿಳಿತಗಳು ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಸವಾಲುಗಳನ್ನು ನೀಡುತ್ತದೆ.`,
        `12ನೇ ಮನೆ ಅನಗತ್ಯ ಖರ್ಚುಗಳು ಮತ್ತು ವಿದೇಶ ವಾಸವನ್ನು ನಿರ್ದೇಶಿಸುತ್ತದೆ.`,
        `ಮಾಂದಿ ಕುಳಿತ ಮನೆಯ ವಿಷಯದಲ್ಲಿ ಕೆಲಸಗಳು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ನಿಲ್ಲುವ '99% ತಡೆ' ಉಂಟಾಗುತ್ತದೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Houses 6, 8, 12 test resilience through debts, obstacles, and expenses. Maandi marks unfinished ancestral karma.",
      dignityEn: "Dusthana lords in other Dusthanas can trigger Vipareeta Raja Yoga.",
      grahaRelationsEn: "Maandi is the subtle satellite of Saturn representing the 99% task hurdle.",
      bulletPointsEn: [
        `6th house tests health and financial discipline; natural malefics here defeat adversaries.`,
        `8th house governs unexpected turns of fate and hidden endurance.`,
        `12th house handles unavoidable expenditures and foreign connections.`,
        `Maandi causes eleventh-hour delays unless propitiated through prayer.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಜಾತಕದಲ್ಲಿ 6, 8, 12ನೇ ಮನೆಗಳ ಪ್ರಭಾವದಿಂದ ಜಾತಕರಿಗೆ ${lord6Kn} ಮತ್ತು ಮಾಂದಿಯ ಕಾರಣದಿಂದ ಯಾವುದೇ ದೊಡ್ಡ ಆರ್ಥಿಕ ಹೂಡಿಕೆ ಅಥವಾ ಸಾಲ ಕೊಡುವ ವಿಚಾರದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಅನಿವಾರ್ಯ.`,
      lifeDomainKn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ಸಾಲ ನಿವಾರಣೆ, ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು, ಖರ್ಚು ನಿಯಂತ್ರಣ.",
      keyInfluencesKn: [
        `6ನೇ ಅಧಿಪತಿ: ${lord6Kn}`,
        `8ನೇ ಅಧಿಪತಿ: ${lord8Kn}`,
        `ಮಾಂದಿ ರಾಶಿ: ${maandiRashiKn}`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the Dusthana nodes reflect karmic clearing houses, financial prudence, loan avoidance, and preventative health habits are essential.`,
      lifeDomainEn: "Health Precaution, Debt Prevention, Unforeseen Obstacles, Expense Management.",
      keyInfluencesEn: [
        `6th Lord: ${getPlanetEn(lord6)}`,
        `8th Lord: ${getPlanetEn(lord8)}`,
        `Maandi: ${maandi?.rashi ? getRashiEn(maandi.rashi) : "Unknown"}`
      ]
    },

    spokenConsultationScriptKn: `ಒಂದು ಮುಖ್ಯವಾದ ಎಚ್ಚರಿಕೆಯ ಮಾತು: ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 6, 8 ಮತ್ತು 12ನೇ ಸ್ಥಾನಗಳ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ನೀವು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಯಾರಿಗೂ ಜಾಮೀನು ನಿಲ್ಲಬಾರದು ಹಾಗೂ ಆತುರದಲ್ಲಿ ಸಾಲ ಕೊಡಬಾರದು. ಕೆಲಸಗಳು 99% ತಲುಪಿದಾಗ ಯಾರೊಂದಿಗೂ ಆ ಕೆಲಸದ ಬಗ್ಗೆ ಅತಿಯಾಗಿ ಪ್ರಚಾರ ಮಾಡಬೇಡಿ, ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೆಲಸ ಮುಗಿಯುವವರೆಗೂ ಸಂಯಮದಿಂದಿರಿ. ನಿಮ್ಮ ಆರೋಗ್ಯದಲ್ಲಿ ಸಣ್ಣ ವ್ಯತ್ಯಾಸವಾದರೂ ತಕ್ಷಣ ಗಮನಹರಿಸಿ. ಧೈರ್ಯವಾಗಿರಿ, ಸರಿಯಾದ ದೈವಿಕ ಸಂಕಲ್ಪದಿಂದ ಈ ಎಲ್ಲಾ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`,
    spokenConsultationScriptEn: `An important word of counsel: Due to your 6th, 8th, and 12th house dynamics, avoid standing surety/guarantee for loans or lending money impulsively. When ventures reach 99%, maintain discretion until the contract is fully sealed to avoid the evil-eye/Maandi hurdle. Proactive health habits and divine prayers will dissolve these friction points.`,

    practicalGuidanceKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಪೂಜೆ, ತಿಲ ತರ್ಪಣ ಅಥವಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಮಾಡಿಸುವುದರಿಂದ ಮಾಂದಿಯ ಕಂಟಕ ಮತ್ತು ದೋಷಗಳು ಶಮನಗೊಳ್ಳುತ್ತವೆ.",
    practicalGuidanceEn: "Perform Mahamrityunjaya Japa or Gokarna Atma Linga Abhisheka. Offer sesame seeds (Tila) in prayers to clear lingering ancestral knots."
  };
};

/**
 * Step 8: Planetary Dignity & Relationship Matrix (ಗ್ರಹ ಮೈತ್ರಿ, ಉಚ್ಚ-ನೀಚ & ಶತ್ರು-ಮಿತ್ರ ಚಕ್ರ)
 */
const buildDignityMatrixStep = (kundli: KundliOutput, dignityList: PlanetaryDignityDetail[]): GurukulaStep => {
  const ucchaGrahas = dignityList.filter((d) => d.dignityType === "uccha");
  const swakshetraGrahas = dignityList.filter((d) => d.dignityType === "swakshetra");
  const neechaGrahas = dignityList.filter((d) => d.dignityType === "neecha");
  const shatruGrahas = dignityList.filter((d) => d.dignityType === "shatru");
  const mitraGrahas = dignityList.filter((d) => d.dignityType === "mitra");

  const ucchaKn = ucchaGrahas.length > 0 ? ucchaGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";
  const swakshetraKn = swakshetraGrahas.length > 0 ? swakshetraGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";
  const neechaKn = neechaGrahas.length > 0 ? neechaGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ (ಶುಭಕರ)";
  const shatruKn = shatruGrahas.length > 0 ? shatruGrahas.map((g) => `${g.planetKn} (${g.rashiKn})`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ";

  return {
    stepIndex: 8,
    stepCode: "planetary_dignity_matrix",
    titleKn: "ಹಂತ 8: ಗ್ರಹ ಮೈತ್ರಿ, ಉಚ್ಚ-ನೀಚ & ಶತ್ರು-ಮಿತ್ರ ಚಕ್ರ (ಪೂರ್ಣ ಗ್ರಹ ಬಲಾಬಲ)",
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
      aspectingGrahasKn: "ಪ್ರತಿಯೊಂದು ಗ್ರಹವು ತಾನು ಕುಳಿತ ಮನೆಯ ಅಧಿಪತಿಯೊಂದಿಗೆ ಹೊಂದಿರುವ ಸ್ವಾಭಾವಿಕ ಮೈತ್ರಿಯನ್ನು ಪರಿಶೀಲಿಸಬೇಕು.",
      observationTipKn: "ಒಂದು ಗ್ರಹ ಎಷ್ಟೇ ಒಳ್ಳೆಯ ಮನೆಯಲ್ಲಿದ್ದರೂ, ಅದು ಶತ್ರು ಮನೆಯಲ್ಲಿದ್ದರೆ (Shatru Kshetra) ಫಲ ಕೊಡಲು ಹೆಣಗಾಡುತ್ತದೆ. ಉಚ್ಚ ಅಥವಾ ಮಿತ್ರ ಮನೆಯಲ್ಲಿದ್ದರೆ (Upari / Mitra) ಸುಲಭವಾಗಿ ಶುಭ ಫಲ ನೀಡುತ್ತದೆ."
    },
    whereToLookEn: {
      primaryHouseEn: "All 9 Grahas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu",
      rashiAndLordEn: `Exalted (Uccha): ${ucchaGrahas.map((g) => g.planetEn).join(", ") || "None"} • Own Sign: ${swakshetraGrahas.map((g) => g.planetEn).join(", ") || "None"}`,
      occupyingGrahasEn: `Debilitated (Neecha): ${neechaGrahas.map((g) => g.planetEn).join(", ") || "None"} • Enemy Sign: ${shatruGrahas.map((g) => g.planetEn).join(", ") || "None"}`,
      aspectingGrahasEn: "Examine whether each planet sits in a friendly, enemy, or own sign dispositor.",
      observationTipEn: "Even if a planet occupies a good house, sitting in an enemy's sign creates struggle. In friendly or exalted signs (Upari), it delivers auspicious results effortlessly."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಉಚ್ಚೇ ಪೂರ್ಣಫಲಂ ಪ್ರೋಕ್ತಂ ಮಿತ್ರೇ ಪಾದತ್ರಯಂ ಭವೇತ್ । ಸಮೇರ್ಧಂ ಶತ್ರುಭೇ ಪಾದಂ ನೀಚೇ ಶೂನ್ಯಂ ವಿನಿರ್ದಿಶೇತ್ ॥",
      dignityKn: `ಉಚ್ಚ ಗ್ರಹ: 100% ಬಲ, ಸ್ವಕ್ಷೇತ್ರ/ಮಿತ್ರ: 75% ಬಲ, ಸಮ: 50% ಬಲ, ಶತ್ರು: 25% ಬಲ, ನೀಚ: ಪರಿಹಾರಾಪೇಕ್ಷಿ.`,
      grahaRelationsKn: "ಪರಾಶರ ಶಾಸ್ತ್ರದ ನೈಸರ್ಗಿಕ ಮೈತ್ರಿ ಕೋಷ್ಟಕದ ಪ್ರಕಾರ ಗ್ರಹಗಳ ಬಲವನ್ನು ಮಾಪನ ಮಾಡಲಾಗುತ್ತದೆ.",
      bulletPointsKn: [
        ucchaGrahas.length > 0 ? `ಉಚ್ಚ ಗ್ರಹಗಳು (${ucchaKn}) ಜಾತಕರಿಗೆ ಅಸಾಧಾರಣ ಪ್ರತಿಭೆ ಮತ್ತು ಪ್ರಭಾವವನ್ನು ನೀಡುತ್ತವೆ.` : "ಯಾವುದೇ ಗ್ರಹ ಅತಿಯಾದ ಉಚ್ಚ ಸ್ಥಿತಿಯಲ್ಲಿಲ್ಲದಿದ್ದರೂ ಸಮತೋಲನವಿದೆ.",
        swakshetraGrahas.length > 0 ? `ಸ್ವಕ್ಷೇತ್ರದ ಗ್ರಹಗಳು (${swakshetraKn}) ಸ್ವಾವಲಂಬಿ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತವೆ.` : "ಸ್ವಕ್ಷೇತ್ರ ಬಲವು ಮಧ್ಯಮವಾಗಿದೆ.",
        neechaGrahas.length > 0 ? `ನೀಚ ಗ್ರಹಗಳಿಗೆ (${neechaKn}) ನೀಚಭಂಗ ರಾಜಯೋಗವಿದೆಯೇ ಎಂದು ಪರೀಕ್ಷಿಸಬೇಕು.` : "ಯಾವುದೇ ನೀಚ ಗ್ರಹಗಳಿಲ್ಲದಿರುವುದು ಜಾತಕದ ದೊಡ್ಡ ಶಕ್ತಿ.",
        shatruGrahas.length > 0 ? `ಶತ್ರು ಗ್ರಹ ಸ್ಥಾನಗಳು (${shatruKn}) ಆ ಗ್ರಹಗಳ ದಶಾ ಕಾಲದಲ್ಲಿ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತವೆ.` : "ಶತ್ರು ಗ್ರಹಗಳ ಬಾಧೆ ಕನಿಷ್ಠವಾಗಿದೆ."
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Exalted planets yield 100% fruit; friendly signs yield 75%; neutral signs 50%; enemy signs 25%; debilitated planets require remedies.",
      dignityEn: "Planetary strength is calibrated using classical Parashari friendship rules.",
      grahaRelationsEn: "Dispositor relations determine how smoothly a planet operates.",
      bulletPointsEn: [
        `Exalted Grahas give exceptional charisma and talent.`,
        `Own-sign planets anchor independence and self-sufficiency.`,
        `Debilitated planets must be scrutinized for Neechabhanga cancellation.`,
        `Enemy-sign planets indicate areas where patience and discipline are tested.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಜಾತಕದಲ್ಲಿ ${ucchaKn !== "ಯಾವುದೂ ಇಲ್ಲ" ? `${ucchaKn} ಉಚ್ಚ ಬಲ ಹೊಂದಿರುವುದರಿಂದ` : "ಗ್ರಹಗಳು ಸಮಸ್ಥಿತಿಯಲ್ಲಿರುವುದರಿಂದ"} ಆಯಾ ಗ್ರಹಗಳ ಕಾರಕತ್ವದಲ್ಲಿ ಜಾತಕರಿಗೆ ಸ್ವಾಭಾವಿಕ ಜಯ ಸಿಗುತ್ತದೆ.`,
      lifeDomainKn: "ಸಮಗ್ರ ಗ್ರಹ ಶಕ್ತಿ, ಆತ್ಮವಿಶ್ವಾಸ, ಪ್ರತಿಭೆ, ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುವ ಸಾಮರ್ಥ್ಯ.",
      keyInfluencesKn: [
        `ಉಚ್ಚ ಗ್ರಹಗಳು: ${ucchaKn}`,
        `ಸ್ವಕ್ಷೇತ್ರ ಗ್ರಹಗಳು: ${swakshetraKn}`,
        `ಮಿತ್ರ ಗ್ರಹಗಳು: ${mitraGrahas.length} ಗ್ರಹಗಳು`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Planetary dignity determines the efficiency with which planets deliver their promises during their transits and dashas.`,
      lifeDomainEn: "Overall Planetary Vitality, Talents, Resourcefulness, Natural Ease.",
      keyInfluencesEn: [
        `Exalted: ${ucchaGrahas.length}`,
        `Own Sign: ${swakshetraGrahas.length}`,
        `Friendly Signs: ${mitraGrahas.length}`
      ]
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಗ್ರಹಗಳ ಬಲಾಬಲವನ್ನು ನೋಡಿದರೆ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅನುಕೂಲಕರವಾದ ಗ್ರಹಗಳು ನಿಮ್ಮ ಪರವಾಗಿ ನಿಂತಿವೆ. ಉದಾಹರಣೆಗೆ ${ucchaGrahas.length > 0 ? `${ucchaGrahas[0]!.planetKn} ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು` : swakshetraGrahas.length > 0 ? `${swakshetraGrahas[0]!.planetKn} ಸ್ವಂತ ಮನೆಯಲ್ಲಿದ್ದು` : "ಪ್ರಮುಖ ಗ್ರಹಗಳು ಮಿತ್ರ ಸ್ಥಾನದಲ್ಲಿದ್ದು"} ನಿಮಗೆ ಬೆಂಬಲ ನೀಡುತ್ತಿವೆ. ಆದರೆ ${shatruGrahas.length > 0 ? `${shatruGrahas[0]!.planetKn} ಶತ್ರು ಮನೆಯಲ್ಲಿದ್ದು` : "ಕೆಲವು ಗ್ರಹಗಳು"} ನಿಮ್ಮ ಸಹನೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತವೆ. ಈ ಗ್ರಹಗಳ ಸ್ವಭಾವವನ್ನು ತಿಳಿದು ನಡೆದರೆ ಅಪಜಯವಿಲ್ಲ.`,
    spokenConsultationScriptEn: `Evaluating your planetary strengths, the supportive planets are actively working in your favor. ${ucchaGrahas.length > 0 ? `Your ${ucchaGrahas[0]!.planetEn} is exalted, giving rare talents.` : `Your friendly planets provide stable support.`} Understanding which planets are your true friends helps you channel your energy without futile frustration.`,

    practicalGuidanceKn: "ಶತ್ರು ಸ್ಥಾನದಲ್ಲಿರುವ ಗ್ರಹಗಳಿಗೆ ಆಯಾ ಗ್ರಹದ ದಾನ ಅಥವಾ ಜಪ ಮಾಡುವುದು ಮತ್ತು ಉಚ್ಚ ಗ್ರಹಗಳ ಗುಣಗಳನ್ನು ನಿಮ್ಮ ಜೀವನ ಶೈಲಿಯಲ್ಲಿ ಅಳವಡಿಸಿಕೊಳ್ಳುವುದು ಅತ್ಯುತ್ತಮ ಪರಿಹಾರ.",
    practicalGuidanceEn: "Propitiate enemy-sign planets with designated charities and align your lifestyle with the positive virtues of your exalted or own-sign planets."
  };
};

/**
 * Step 9: Yogas & Afflictions (ಪ್ರಮುಖ ಯೋಗಗಳು & ಜಾತಕ ದೋಷಗಳು)
 */
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
  const ven = getPlanet(kundli, PlanetName.Venus);
  const sat = getPlanet(kundli, PlanetName.Saturn);
  const rahu = getPlanet(kundli, PlanetName.Rahu);
  const ketu = getPlanet(kundli, PlanetName.Ketu);

  // Gajakesari
  if (moon && jup) {
    const dist = (jup.house - moon.house + 12) % 12;
    if (dist === 0 || dist === 3 || dist === 6 || dist === 9) {
      yogas.push("ಗಜಕೇಸರಿ ಯೋಗ (ಚಂದ್ರ-ಗುರು ಕೇಂದ್ರ ಸಂಬಂಧ - ಸಕಲ ಕೀರ್ತಿ & ಬುದ್ಧಿಮತ್ತೆ)");
      yogasEn.push("Gajakesari Yoga (Jupiter in Kendra from Moon - Wisdom & Respect)");
    }
  }

  // Budhaditya
  if (sun && mer && sun.rashi.index === mer.rashi.index) {
    yogas.push("ಬುಧಾದಿತ್ಯ ಯೋಗ (ಸೂರ್ಯ-ಬುಧ ಸಂಯೋಗ - ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ & ಆಡಳಿತ ಸಾಮರ್ಥ್ಯ)");
    yogasEn.push("Budhaditya Yoga (Sun-Mercury conjunction - Sharp Intellect & Governance)");
  }

  // Chandra-Mangala
  if (moon && mars && moon.rashi.index === mars.rashi.index) {
    yogas.push("ಚಂದ್ರ-ಮಂಗಳ ಯೋಗ (ಧನ ಸಂಚಯ & ಸಾಹಸ ಪ್ರವೃತ್ತಿ)");
    yogasEn.push("Chandra-Mangala Yoga (Moon-Mars conjunction - Wealth accumulation)");
  }

  // Kuja Dosha check
  if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) {
    doshas.push(`ಕುಜ ದೋಷ (${mars.house}ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ - ದಾಂಪತ್ಯ ಸಂಯಮ ಅಪೇಕ್ಷಿತ)`);
    doshasEn.push(`Kuja Dosha (Mars in House ${mars.house} - Calls for relational patience)`);
  }

  // Guru Chandala
  if (jup && rahu && jup.rashi.index === rahu.rashi.index) {
    doshas.push("ಗುರು ಚಂಡಾಲ ಯೋಗ (ಗುರು-ರಾಹು ಯುತಿ - ನೈತಿಕ ಸಂಘರ್ಷ)");
    doshasEn.push("Guru Chandala Yoga (Jupiter-Rahu conjunction - Ethical conflicts)");
  }

  // Kemadruma
  if (moon) {
    const prevHouse = ((moon.house - 2 + 12) % 12) + 1;
    const nextHouse = (moon.house % 12) + 1;
    const hasNeighbors = kundli.planets.some(
      (p) =>
        p.name !== PlanetName.Moon &&
        p.name !== PlanetName.Sun &&
        p.name !== PlanetName.Rahu &&
        p.name !== PlanetName.Ketu &&
        (p.house === prevHouse || p.house === nextHouse)
    );
    if (!hasNeighbors) {
      doshas.push("ಕೆಮದ್ರುಮ ಯೋಗ (ಚಂದ್ರನ ಪಕ್ಕದಲ್ಲಿ ಗ್ರಹಗಳಿಲ್ಲದಿರುವುದು - ಏಕಾಂಗಿತನ & ಮಾನಸಿಕ ತೊಳಲಾಟ)");
      doshasEn.push("Kemadruma Yoga (Isolated Moon - Periodic solitude and inner longing)");
    }
  }

  if (yogas.length === 0) {
    yogas.push("ಸಾಧಾರಣ ಶುಭ ಯೋಗಗಳು (ಸ್ಥಿರ ಜೀವನ ಯೋಗ)");
    yogasEn.push("Balanced planetary combinations (Stable life path)");
  }

  return {
    stepIndex: 9,
    stepCode: "yogas_and_doshas",
    titleKn: "ಹಂತ 9: ಪ್ರಮುಖ ಯೋಗಗಳು & ಜಾತಕ ದೋಷಗಳು (ಯೋಗಗಳ ಫಲ)",
    titleEn: "Step 9: Yogas & Afflictions (Planetary Combinations in this Chart)",
    stageBadgeKn: "ವಿಶೇಷ ಯೋಗ ಪರೀಕ್ಷೆ • ಕರ್ಮ ಫಲ",
    stageBadgeEn: "Yoga Combinations • Karmic Blessings",
    focusHouses: [1, 4, 7, 10, 5, 9],
    focusRashis: [kundli.lagnaRashi.index, kundli.moonSign.index],
    focusPlanets: [PlanetName.Jupiter, PlanetName.Moon, PlanetName.Sun, PlanetName.Mercury],

    whereToLookKn: {
      primaryHouseKn: `ಜಾತಕದಲ್ಲಿ ಕಂಡುಬಂದಿರುವ ಶುಭ ಯೋಗಗಳು: ${yogas.length} | ದೋಷಗಳು: ${doshas.length}`,
      rashiAndLordKn: `ಶುಭ ಯೋಗಗಳು: ${yogas.join(" • ")}`,
      occupyingGrahasKn: `ಗಮನಿಸಬೇಕಾದ ದೋಷಗಳು: ${doshas.length > 0 ? doshas.join(" • ") : "ಯಾವುದೇ ಗಂಭೀರ ದೋಷಗಳಿಲ್ಲ (ನಿರ್ದೋಷ ಜಾತಕ)"}`,
      aspectingGrahasKn: "ಯೋಗಗಳು ಗ್ರಹಗಳ ಪರಸ್ಪರ ಸಂಯೋಗ ಮತ್ತು ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಸ್ಥಿತಿಗಳಿಂದ ಉದ್ಭವಿಸುತ್ತವೆ.",
      observationTipKn: "ಕೇವಲ ಮನೆಗಳನ್ನು ನೋಡುವುದು ಸಾಕಾಗುವುದಿಲ್ಲ. ಗ್ರಹಗಳು ಒಟ್ಟಿಗೆ ಸೇರಿ ಯಾವ 'ಯೋಗ' ನಿರ್ಮಿಸಿವೆ ಎಂದು ನೋಡಬೇಕು. ಯೋಗಗಳೇ ಮನುಷ್ಯನನ್ನು ಸಾಮಾನ್ಯನಿಂದ ಅಸಾಮಾನ್ಯನನ್ನಾಗಿ ಮಾಡುತ್ತವೆ."
    },
    whereToLookEn: {
      primaryHouseEn: `Benefic Yogas detected: ${yogasEn.length} | Afflictions: ${doshasEn.length}`,
      rashiAndLordEn: `Auspicious Yogas: ${yogasEn.join(" • ")}`,
      occupyingGrahasEn: `Afflictions: ${doshasEn.length > 0 ? doshasEn.join(" • ") : "No major doshas (Balanced chart)"}`,
      aspectingGrahasEn: "Yogas arise from Kendra-Trikona synergies and conjunctions.",
      observationTipEn: "Looking at houses alone is incomplete. One must inspect planetary combinations (Yogas), as they act as force multipliers in destiny."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಯೋಗಾಃ ಕುಂಡಲಿ ಸಾರಂ ಚ ದೋಷಾಃ ಪರಿಹಾರಮೇವ ಚ । ಶುಭಯೋಗೇ ಸಮುತ್ಪನ್ನೋ ರಾಜತೇ ಭುವಿ ಮಾನವಃ ॥",
      dignityKn: "ಶುಭ ಯೋಗಗಳು ಜಾತಕದ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೆಚ್ಚಿಸಿದರೆ, ದೋಷಗಳು ಆಧ್ಯಾತ್ಮಿಕ ಪರಿಹಾರವನ್ನು ಬಯಸುತ್ತವೆ.",
      grahaRelationsKn: "ಯೋಗಕಾರಕ ಗ್ರಹಗಳ ದಶಾ ಕಾಲದಲ್ಲಿ ಈ ಯೋಗಗಳು ಪೂರ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಫಲ ನೀಡುತ್ತವೆ.",
      bulletPointsKn: [
        ...yogas.map((y) => `✨ ${y}`),
        ...doshas.map((d) => `⚠️ ${d}`)
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Yogas are the catalytic combinations in a horoscope. Benefic yogas elevate destiny, while doshas require propitiation.",
      dignityEn: "Planetary yogas manifest their fullest promise during the respective ruling Dashas.",
      grahaRelationsEn: "Kendra and Trikona combinations act as premier catalysts.",
      bulletPointsEn: [
        ...yogasEn.map((y) => `✨ ${y}`),
        ...doshasEn.map((d) => `⚠️ ${d}`)
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಜಾತಕದಲ್ಲಿ ${yogas[0]} ಇರುವುದರಿಂದ ಜಾತಕರಿಗೆ ಜೀವನದಲ್ಲಿ ವಿಶೇಷ ಗೌರವ, ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ ಮತ್ತು ಸಕಾಲಿಕ ಯಶಸ್ಸು ಒಲಿದುಬರುತ್ತದೆ.`,
      lifeDomainKn: "ಕೀರ್ತಿ, ನಾಯಕತ್ವ, ಬುದ್ಧಿಮತ್ತೆ, ಜೀವನದ ತಿರುವುಗಳು.",
      keyInfluencesKn: yogas
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Due to the presence of ${yogasEn[0]}, the native commands innate analytical discernment and social respect.`,
      lifeDomainEn: "Public Prestige, Strategic Intellect, Turning Points.",
      keyInfluencesEn: yogasEn
    },

    spokenConsultationScriptKn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅತ್ಯಂತ ಸುಂದರವಾದ ಯೋಗಗಳು ರೂಪುಗೊಂಡಿವೆ. ಮುಖ್ಯವಾಗಿ ${yogas[0]}. ಇದರ ಫಲವಾಗಿ ನೀವು ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ವ್ಯಕ್ತಿಯಾಗಿ ಬೆಳೆಯುತ್ತೀರಿ. ನಿಮ್ಮ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಸರಿಯಾದ ದಿಕ್ಕಿನಲ್ಲಿ ಬಳಸಿದರೆ ನೀವು ಮುಟ್ಟಿದ್ದೆಲ್ಲಾ ಬಂಗಾರವಾಗುತ್ತದೆ. ${doshas.length > 0 ? `ಆದರೆ ${doshas[0]} ಇರುವುದರಿಂದ ಸ್ವಲ್ಪ ಸಂಯಮ ಅಗತ್ಯ.` : "ನಿಮ್ಮ ಜಾತಕವು ದೋಷಮುಕ್ತವಾಗಿದ್ದು ಶುಭಪ್ರದವಾಗಿದೆ."}`,
    spokenConsultationScriptEn: `Your chart carries auspicious planetary combinations, notably ${yogasEn[0]}. This blesses you with respect, intellectual depth, and leadership. ${doshasEn.length > 0 ? `Keep mindful of ${doshasEn[0]} through conscious balance.` : "Your horoscope is exceptionally clean and harmonious."}`,

    practicalGuidanceKn: "ಶುಭ ಯೋಗಗಳ ಸದ್ಬಳಕೆಗಾಗಿ ವಿದ್ಯಾ ದಾನ ಅಥವಾ ಸಮಾಜಮುಖಿ ಧರ್ಮ ಕಾರ್ಯಗಳನ್ನು ಕೈಗೊಳ್ಳಿ. ದೋಷಗಳಿದ್ದರೆ ಗೋಕರ್ಣದಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಮಾಡಿಸಿ.",
    practicalGuidanceEn: "Channel your positive yogas through charitable or educational causes. Mitigate any afflictions through Gokarna temple sankalpa."
  };
};

/**
 * Step 10: Vimshottari Dasha (ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಚಕ್ರ & ಸಮಯ ನಿರ್ಣಯ)
 */
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
  const mahaLordEn = getPlanetEn(mahaLord);
  const bhuktiLordKn = getPlanetKn(bhuktiLord);
  const bhuktiLordEn = getPlanetEn(bhuktiLord);

  const mahaPos = getPlanet(kundli, mahaLord);
  const bhuktiPos = getPlanet(kundli, bhuktiLord);

  const mahaHouse = mahaPos?.house ?? 1;
  const bhuktiHouse = bhuktiPos?.house ?? 1;

  // Relative distance between Maha and Bhukti
  const relDist = ((bhuktiHouse - mahaHouse + 12) % 12) + 1;
  let relToneKn = "ಅನುಕೂಲಕರ ಪರಸ್ಪರ ಸಂಬಂಧ";
  let relToneEn = "Favorable mutual relation";
  if (relDist === 6 || relDist === 8) {
    relToneKn = "ಷಡಾಷ್ಟಕ ಸಂಬಂಧ (ಆರೋಗ್ಯ ಮತ್ತು ಮಾನಸಿಕ ಸಂಯಮ ಅಗತ್ಯ)";
    relToneEn = "Shadashtaka 6-8 relationship (Requires health & stress vigilance)";
  } else if (relDist === 2 || relDist === 12) {
    relToneKn = "ದ್ವಿರ್ದ್ವಾದಶ ಸಂಬಂಧ (ಆರ್ಥಿಕ ಖರ್ಚುಗಳು & ಸ್ಥಳ ಬದಲಾವಣೆ)";
    relToneEn = "Dwirdwadasa 2-12 relationship (Expenses and location shifts)";
  }

  return {
    stepIndex: 10,
    stepCode: "vimshottari_dasha_timing",
    titleKn: "ಹಂತ 10: ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಚಕ್ರ (ಸಮಯ ನಿರ್ಣಯ - ಪ್ರಸ್ತುತ ದಶಾ & ಭುಕ್ತಿ)",
    titleEn: "Step 10: Vimshottari Dasha (Event Timing & Turning Points)",
    stageBadgeKn: "ಸಮಯ ನಿರ್ಣಯ • ಕಾಲಚಕ್ರ",
    stageBadgeEn: "Timing Mastery • Vimshottari Engine",
    focusHouses: [mahaHouse, bhuktiHouse],
    focusRashis: [mahaPos?.rashi.index ?? 0, bhuktiPos?.rashi.index ?? 0],
    focusPlanets: [mahaLord, bhuktiLord],

    whereToLookKn: {
      primaryHouseKn: `ಪ್ರಸ್ತುತ ಮಹಾದಶಾ: ${mahaLordKn} (${mahaHouse}ನೇ ಮನೆ) • ಅಂತರ್ದಶಾ (ಭುಕ್ತಿ): ${bhuktiLordKn} (${bhuktiHouse}ನೇ ಮನೆ)`,
      rashiAndLordKn: `ಜಾತಕರ ಪ್ರಸ್ತುತ ಅಂದಾಜು ವಯಸ್ಸು: ${currentAge.toFixed(1)} ವರ್ಷಗಳು`,
      occupyingGrahasKn: `ದಶಾನಾಥ & ಭುಕ್ತಿನಾಥರ ಪರಸ್ಪರ ಸಂಬಂಧ: ${relDist}ನೇ ಮನೆ (${relToneKn})`,
      aspectingGrahasKn: "ದಶಾನಾಥನು ವಾತಾವರಣ ಸೃಷ್ಟಿಸಿದರೆ, ಭುಕ್ತಿನಾಥನು ದೈನಂದಿನ ಘಟನೆಗಳನ್ನು ನಡೆಸುತ್ತಾನೆ.",
      observationTipKn: "ಜಾತಕದಲ್ಲಿ ಎಷ್ಟೇ ದೊಡ್ಡ ರಾಜಯೋಗಗಳಿದ್ದರೂ, ಸರಿಯಾದ ದಶಾ ಕಾಲ ಬರದ ಹೊರತು ಫಲ ಸಿಗುವುದಿಲ್ಲ. ಮನುಷ್ಯನಿಗೆ 'ಯಾವಾಗ ಏನು ನಡೆಯುತ್ತದೆ?' ಎಂದು ಹೇಳುವುದೇ ದಶಾ ಕಾಲಚಕ್ರದ ಉದ್ದೇಶ."
    },
    whereToLookEn: {
      primaryHouseEn: `Current Mahadasha: ${mahaLordEn} (House ${mahaHouse}) • Bhukti (Antardasha): ${bhuktiLordEn} (House ${bhuktiHouse})`,
      rashiAndLordEn: `Current Age: ~${currentAge.toFixed(1)} years`,
      occupyingGrahasEn: `Mutual Dasha-Bhukti angle: House ${relDist} (${relToneEn})`,
      aspectingGrahasEn: "Mahadasha sets the ambient stage; Bhukti triggers the specific events.",
      observationTipEn: "No matter how grand a Raja Yoga is, it only flowers when its Vimshottari Dasha arrives. Dasha timing answers 'When will it happen?'"
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ದಶಾ ನಾಯಕ ಫಲಂ ದದ್ಯಾತ್ ಅಂತರ್ದಶಾ ವಿಶೇಷತಃ । ದಶಾಧಿಪೇ ಶುಭೇ ಯುಕ್ತೇ ರಾಜಸನ್ಮಾನ ಕೀರ್ತಿದಃ ॥",
      dignityKn: `ಮಹಾದಶಾನಾಥ ${mahaLordKn} ${mahaHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ಭುಕ್ತಿನಾಥ ${bhuktiLordKn} ${bhuktiHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ.`,
      grahaRelationsKn: `ದಶಾ ಮತ್ತು ಭುಕ್ತಿನಾಥರ ನಡುವಿನ ಕೋನ: ${relToneKn}.`,
      bulletPointsKn: [
        `ಮಹಾದಶಾನಾಥ ${mahaLordKn} ಆಳುವ ಇಡೀ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಆ ಗ್ರಹದ ಕಾರಕತ್ವವೇ ಪ್ರಧಾನವಾಗಿರುತ್ತದೆ.`,
        `ಅಂತರ್ದಶಾನಾಥ ${bhuktiLordKn} ಪ್ರಸ್ತುತ ದೈನಂದಿನ ಮಾನಸಿಕ, ಆರ್ಥಿಕ ಮತ್ತು ಕೌಟುಂಬಿಕ ಅನುಭವಗಳನ್ನು ನೀಡುತ್ತಾನೆ.`,
        relDist === 6 || relDist === 8
          ? `ದಶಾ-ಭುಕ್ತಿ ಷಡಾಷ್ಟಕವಾಗಿರುವುದರಿಂದ ಆರೋಗ್ಯ ಮತ್ತು ಹಣಕಾಸಿನ ವಹಿವಾಟಿನಲ್ಲಿ ಅತ್ಯಂತ ಜಾಗರೂಕರಾಗಿರಬೇಕು.`
          : `ದಶಾ-ಭುಕ್ತಿ ಪರಸ್ಪರ ಕೇಂದ್ರ ಅಥವಾ ತ್ರಿಕೋಣದಲ್ಲಿದ್ದು ಶುಭ ಫಲಗಳನ್ನು ವೃದ್ಧಿಸುತ್ತವೆ.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "Mahadasha establishes the overarching life theme; the Antardasha brings crisp, tangible milestones.",
      dignityEn: `Maha Lord ${mahaLordEn} sits in House ${mahaHouse}; Bhukti Lord ${bhuktiLordEn} in House ${bhuktiHouse}.`,
      grahaRelationsEn: `Mutual planetary configuration: ${relToneEn}.`,
      bulletPointsEn: [
        `Mahadasha sets the dominant macro chapter in the native's journey.`,
        `Antardasha dictates current 12-24 month experiences and opportunities.`,
        `Favorable angles yield effortless breakthroughs; difficult angles test endurance.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${mahaLordKn} ಮಹಾದಶಾ ಮತ್ತು ${bhuktiLordKn} ಭುಕ್ತಿಯು ಜಾತಕರ ಜೀವನದಲ್ಲಿ ${relToneKn}ಯನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.`,
      lifeDomainKn: "ಪ್ರಸ್ತುತ ಜೀವನ ಘಟ್ಟ, ಅವಕಾಶಗಳು, ತಿರುವುಗಳು, ಆರೋಗ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಮಯ ಪ್ರಜ್ಞೆ.",
      keyInfluencesKn: [
        `ಮಹಾದಶಾ: ${mahaLordKn}`,
        `ಅಂತರ್ದಶಾ: ${bhuktiLordKn}`,
        `ವಯಸ್ಸು: ${currentAge.toFixed(1)} ವರ್ಷ`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Because the current cycle is guided by ${mahaLordEn}-${bhuktiLordEn}, this period highlights the themes of Houses ${mahaHouse} and ${bhuktiHouse}.`,
      lifeDomainEn: "Current Life Chapter, Window of Opportunity, Health & Financial Timing.",
      keyInfluencesEn: [
        `Mahadasha: ${mahaLordEn}`,
        `Bhukti: ${bhuktiLordEn}`,
        `Age: ${currentAge.toFixed(1)} yrs`
      ]
    },

    spokenConsultationScriptKn: `ಕಾಲ ನಿರ್ಣಯದ ವಿಷಯಕ್ಕೆ ಬಂದರೆ, ಪ್ರಸ್ತುತ ನಿಮಗೆ ${mahaLordKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ. ಇದರರ್ಥ ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಗಮನವು ಮುಖ್ಯವಾಗಿ ನಿಮ್ಮ ವೃತ್ತಿ ಮತ್ತು ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿಗಳ ಮೇಲಿರಬೇಕು. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳದೆ ತಾಳ್ಮೆಯಿಂದ ಹೆಜ್ಜೆ ಇಡಿ. ಈ ದಶಾ ಕಾಲಾವಧಿಯು ಮುಗಿಯುತ್ತಿದ್ದಂತೆ ನಿಮಗೆ ಹೊಸ ಶುಭ ಅಧ್ಯಾಯ ಆರಂಭವಾಗಲಿದೆ. ನಿಮ್ಮ ಕರ್ತವ್ಯವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮಾಡಿ, ಕಾಲವೇ ನಿಮಗೆ ಒಲಿಯಲಿದೆ.`,
    spokenConsultationScriptEn: `Regarding current life timing, you are running ${mahaLordEn} Mahadasha with ${bhuktiLordEn} Bhukti. This highlights your vocational and familial responsibilities. Avoid impetuous moves; patient diligence now lays the ground for a rewarding breakthrough as this cycle matures.`,

    practicalGuidanceKn: `ಪ್ರಸ್ತುತ ದಶಾನಾಥರಾದ ${mahaLordKn} ಮತ್ತು ಭುಕ್ತಿನಾಥರಾದ ${bhuktiLordKn}ರನ್ನು ಒಲಿಸಿಕೊಳ್ಳಲು ಆಯಾ ಗ್ರಹದ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಶನಿವಾರ ಅಥವಾ ಗುರುವಾರದಂದು ಎಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಪ್ರಾರ್ಥಿಸಿ.`,
    practicalGuidanceEn: `Propitiate current Dasha rulers (${mahaLordEn} & ${bhuktiLordEn}) with targeted planetary prayers and light an oil lamp on their ruling weekday.`
  };
};

/**
 * Step 11: Daivajna Synthesis & Consultation Script (ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ & ಪರಿಹಾರ ಸೂತ್ರ)
 */
const buildDaivajnaSynthesisStep = (
  kundli: KundliOutput,
  nativeName = "ಜಾತಕರು"
): GurukulaStep => {
  const lagnaRashiKn = getRashiKn(kundli.lagnaRashi);
  const moonRashiKn = getRashiKn(kundli.moonSign);
  const lagnaLordKn = getPlanetKn(signLord(kundli.lagnaRashi.index));

  return {
    stepIndex: 11,
    stepCode: "daivajna_synthesis_remedies",
    titleKn: "ಹಂತ 11: ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸೂತ್ರ (ಸಮಗ್ರ ಸಾರಾಂಶ, ಮಾತುಗಾರಿಕೆ & ದೈವಿಕ ಪರಿಹಾರ)",
    titleEn: "Step 11: The Astrologer's Master Synthesis (How to Counsel & Prescribe Remedies)",
    stageBadgeKn: "ಉನ್ನತ ಹಂತ • ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ",
    stageBadgeEn: "Masterclass Zenith • Priest Consultation",
    focusHouses: [1, 4, 7, 10, 5, 9],
    focusRashis: [kundli.lagnaRashi.index, kundli.moonSign.index],
    focusPlanets: [signLord(kundli.lagnaRashi.index), PlanetName.Moon, PlanetName.Jupiter],

    whereToLookKn: {
      primaryHouseKn: `ಲಗ್ನ (${lagnaRashiKn}) + ರಾಶಿ (${moonRashiKn}) + ಕರ್ಮ (10ನೇ ಮನೆ) + ದಶಾ ಕಾಲಚಕ್ರದ ಸಮಗ್ರ ಸಂಯೋಜನೆ`,
      rashiAndLordKn: "ದೈವಜ್ಞನ ಚತುಸ್ಸಂಕಲ್ಪ: 1. ಭಯ ನಿವಾರಣೆ, 2. ಕರ್ಮ ಶುದ್ಧಿ, 3. ಆತ್ಮವಿಶ್ವಾಸ ಜಾಗೃತಿ, 4. ದೈವಿಕ ಪರಿಹಾರ",
      occupyingGrahasKn: "ಜಾತಕರಿಗೆ ಕೇವಲ ಭವಿಷ್ಯ ಹೇಳುವುದಷ್ಟೇ ಅಲ್ಲ, ಅವರ ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡಿ ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಸುವುದು.",
      aspectingGrahasKn: "ಜ್ಯೋತಿಷ್ಯವು ವಿಧಿಯ ಅನಿವಾರ್ಯತೆಯಲ್ಲ, ಬದಲಿಗೆ ದೈವಿಕ ಬೆಳಕು (ಜ್ಯೋತಿ).",
      observationTipKn: "ಒಬ್ಬ ಪರಿಪೂರ್ಣ ದೈವಜ್ಞನು ಜಾತಕವನ್ನು ಕೇವಲ ಕಾಗದದಂತೆ ನೋಡದೆ, ಸಾಕ್ಷಾತ್ ದೇವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಂತು ಭಕ್ತರಿಗೆ ಮಾರ್ಗದರ್ಶನ ಮಾಡುವಂತೆ ಮಮತೆಯಿಂದ ನುಡಿಯಬೇಕು."
    },
    whereToLookEn: {
      primaryHouseEn: `Holistic Synthesis: Ascendant (${getRashiEn(kundli.lagnaRashi)}) + Moon (${getRashiEn(kundli.moonSign)}) + Career (10th) + Vimshottari Timeline`,
      rashiAndLordEn: "Astrologer's Golden Creed: 1. Dispelling Fear, 2. Root Karmic Insight, 3. Igniting Self-Belief, 4. Sattvic Remedies",
      occupyingGrahasEn: "Astrology is not fatalism; it is divine light (Jyoti) to navigate destiny.",
      aspectingGrahasEn: "Holistic integration of body, mind, career, and spiritual remedies.",
      observationTipEn: "A master Daivajna speaks with empathy, reverence, and clarity—never inducing panic, always uplifting the native's confidence and spiritual connection."
    },

    technicalAnalysisKn: {
      shastricRuleKn: "ಶಾಂತಂ ದಂತಂ ಶುಚಿಂ ದಕ್ಷಂ ಜ್ಯೋತಿಃಶಾಸ್ತ್ರ ವಿಶಾರದಮ್ । ದೈವಜ್ಞಂ ತಂ ವಿಜಾನೀಯಾತ್ ಸರ್ವಲೋಕ ಹಿತೈಷಿಣಮ್ ॥",
      dignityKn: "ದೈವಜ್ಞನ ಮಾತು ಭಕ್ತರ ಪಾಲಿಗೆ ಔಷಧಿಯಂತಿರಬೇಕು; ವಿಷದಂತಿರಬಾರದು.",
      grahaRelationsKn: "ಲಗ್ನಾಧಿಪತಿ, ಚಂದ್ರ ಮತ್ತು ಪ್ರಸ್ತುತ ದಶಾನಾಥರ ಬಲವರ್ಧನೆಯೇ ಪರಿಹಾರದ ಗುಟ್ಟು.",
      bulletPointsKn: [
        `ಭಯ ಹುಟ್ಟಿಸುವ ಮಾತುಗಳನ್ನು ಆಡದೆ, ಧೈರ್ಯ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ತುಂಬುವುದು ದೈವಜ್ಞನ ಪ್ರಥಮ ಕರ್ತವ್ಯ.`,
        `ಮೂಲ ಕರ್ಮ ಗ್ರಂಥಿಯನ್ನು (Maandi & Dusthanas) ಗುರುತಿಸಿ ಅದಕ್ಕೆ ಸತ್ತ್ವಿಕ ಪರಿಹಾರ ನೀಡುವುದು.`,
        `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಅರ್ಚನೆ, ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಸಂಕಲ್ಪ ಪೂಜೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರ.`,
        `ಉಕ್ತ ರುದ್ರಾಕ್ಷಿ ಮತ್ತು ರತ್ನಗಳನ್ನು ಸರಿಯಾದ ಪರೀಕ್ಷೆಯ ನಂತರವಷ್ಟೇ ಧರಿಸಲು ಮಾರ್ಗದರ್ಶನ ನೀಡುವುದು.`
      ]
    },
    technicalAnalysisEn: {
      shastricRuleEn: "A true Daivajna is calm, pure, disciplined, empathetic, and dedicated to the spiritual welfare of all souls.",
      dignityEn: "An astrologer's words must heal and reassure, never paralyze with fear.",
      grahaRelationsEn: "Remedies align subtle frequencies through prayer, charity, and sacred mantras.",
      bulletPointsEn: [
        `Never create superstitious dread; always anchor the native in constructive Dharma.`,
        `Address root karmic knots rather than treating superficial symptoms.`,
        `Recommend authentic Sattvic remedies like Gokarna Mahabaleshwara Puja and Sankalpa.`,
        `Prescribe energized Rudraksha and gemstones with scientific precision.`
      ]
    },

    whyThisResultKn: {
      astrologicalLogicKn: `ಜಾತಕದ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆಯಿಂದ ಜಾತಕರಿಗೆ ${lagnaLordKn}ನ ಅನುಗ್ರಹ ಮತ್ತು ಶಿವನ ಕೃಪೆಯಿಂದ ಎಲ್ಲಾ ಅಡೆತಡೆಗಳೂ ಹರಿದು ಶುಭ ಫಲಗಳು ಪ್ರಾಪ್ತಿಯಾಗುತ್ತವೆ.`,
      lifeDomainKn: "ಸಮಗ್ರ ಜೀವನ ಕಲ್ಯಾಣ, ಮನಃಶಾಂತಿ, ದೈವಿಕ ರಕ್ಷಣೆ, ಧರ್ಮ-ಅರ್ಥ-ಕಾಮ-ಮೋಕ್ಷ ಪುರುಷಾರ್ಥಗಳು.",
      keyInfluencesKn: [
        `ಲಗ್ನ: ${lagnaRashiKn}`,
        `ಚಂದ್ರ: ${moonRashiKn}`,
        `ದೈವಿಕ ಪರಿಹಾರ ಮಾರ್ಗ`
      ]
    },
    whyThisResultEn: {
      astrologicalLogicEn: `Harmonizing the Lagna Lord, Moon, and active Dasha brings holistic tranquility and empowers the native to navigate their life trajectory.`,
      lifeDomainEn: "Holistic Life Peace, Spiritual Protection, Four Purusharthas.",
      keyInfluencesEn: [
        `Lagna: ${getRashiEn(kundli.lagnaRashi)}`,
        `Moon: ${getRashiEn(kundli.moonSign)}`,
        `Sattvic Remedial Path`
      ]
    },

    spokenConsultationScriptKn: `ಆತ್ಮೀಯ ${nativeName}ನವರೇ, ನಿಮ್ಮ ಇಡೀ ಜಾತಕವನ್ನು ಸಮಗ್ರವಾಗಿ ನೋಡಿದಾಗ ನೀವು ಅಪಾರವಾದ ಪ್ರತಿಭೆ ಮತ್ತು ದೈವಬಲವನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಜೀವನದಲ್ಲಿ ಬರುವ ಏರಿಳಿತಗಳು ನಿಮ್ಮನ್ನು ಪರೀಕ್ಷಿಸಲು ಬರುವ ಮೆಟ್ಟಿಲುಗಳೇ ಹೊರತು ಸೋಲಿಸಲು ಅಲ್ಲ. ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯಾದ ${lagnaLordKn} ನಿಮ್ಮ ಬೆನ್ನಿಗಿದ್ದಾರೆ. ಯಾವುದೇ ಚಿಂತೆ ಮಾಡಬೇಡಿ. ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ಮಾಡಿ, ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಸದಾ ಶಾಂತಿ ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ರಕ್ಷಣೆ ಸಿಗಲಿದೆ. ಧೈರ್ಯವಾಗಿ ನಿಮ್ಮ ಕರ್ತವ್ಯ ಮಾಡಿ, ಭಗವಂತನ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮ ಮೇಲಿದೆ.`,
    spokenConsultationScriptEn: `Dear ${nativeName}, reviewing your complete astrological blueprint, you carry genuine talents and divine protection. The tribulations you face are stepping stones designed to strengthen your soul, not defeat you. Your Lagna Lord (${getPlanetEn(signLord(kundli.lagnaRashi.index))}) stands firmly behind you. Have faith; perform a sincere Sankalpa Seva at Gokarna Mahabaleshwara Temple. Step forward with courage, knowing divine grace accompanies you.`,

    practicalGuidanceKn: "ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಜಲಾಭಿಷೇಕ, ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ, ಮತ್ತು ದಿನನಿತ್ಯ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು ಈ ಜಾತಕಕ್ಕೆ ಪರಮೌಷಧ.",
    practicalGuidanceEn: "Gokarna Mahabaleshwara Atma Linga Abhisheka, wearing a consecrated Rudraksha, and receiving elders' blessings will act as an invincible shield."
  };
};

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
  // 1. Build planetary dignity map for all 9 grahas
  const dignityList = kundli.planets.map((p) => checkPlanetaryDignity(p, kundli));
  const dignityMap = new Map<PlanetName, PlanetaryDignityDetail>();
  for (const d of dignityList) {
    dignityMap.set(d.planet, d);
  }

  // 2. Generate each of the 11 progressive pedagogical steps
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

  let currentAgeYears: number | undefined;
  if (birthDate && birthTime) {
    try {
      currentAgeYears = ageDecimalYearsAt(birthDate, birthTime, 14.54, 74.31, new Date());
    } catch {
      // ignore
    }
  }

  const bhukti = currentAgeYears ? findBhuktiAtAge(kundli, currentAgeYears) : undefined;

  return {
    nativeName,
    lagnaRashiKn: getRashiKn(kundli.lagnaRashi),
    lagnaRashiEn: getRashiEn(kundli.lagnaRashi),
    lagnaLordKn: getPlanetKn(signLord(kundli.lagnaRashi.index)),
    lagnaLordEn: getPlanetEn(signLord(kundli.lagnaRashi.index)),
    moonSignKn: getRashiKn(kundli.moonSign),
    moonSignEn: getRashiEn(kundli.moonSign),
    nakshatraKn: kundli.planets.find((p) => p.name === PlanetName.Moon)?.nakshatra.sanskrit || "ಅಜ್ಞಾತ",
    nakshatraEn: kundli.planets.find((p) => p.name === PlanetName.Moon)?.nakshatra.english || "Unknown",
    currentAgeYears,
    currentDashaMahaKn: bhukti ? getPlanetKn(bhukti.maha.planet) : undefined,
    currentDashaBhuktiKn: bhukti ? getPlanetKn(bhukti.bhukti) : undefined,
    totalSteps: steps.length,
    dignityMatrix: dignityList,
    steps
  };
}
