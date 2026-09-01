import { PlanetName, type Nakshatra } from "./AstroTypes";
import { normalizeDegree, degreeToNakshatra } from "./AstroMath";

export const VIMSHOTTARI_LORDS: PlanetName[] = [
  PlanetName.Ketu,
  PlanetName.Venus,
  PlanetName.Sun,
  PlanetName.Moon,
  PlanetName.Mars,
  PlanetName.Rahu,
  PlanetName.Jupiter,
  PlanetName.Saturn,
  PlanetName.Mercury
];

export const VIMSHOTTARI_YEARS: Record<PlanetName, number> = {
  [PlanetName.Ketu]: 7,
  [PlanetName.Venus]: 20,
  [PlanetName.Sun]: 6,
  [PlanetName.Moon]: 10,
  [PlanetName.Mars]: 7,
  [PlanetName.Rahu]: 18,
  [PlanetName.Jupiter]: 16,
  [PlanetName.Saturn]: 19,
  [PlanetName.Mercury]: 17
};

const NAKSHATRA_SPAN = 360 / 27; // 13.333333333333334 degrees

export interface KpSubLordInfo {
  nakshatra: Nakshatra;
  nakshatraIndex: number;
  nakshatraLord: PlanetName;
  subLord: PlanetName;
  subSubLord: PlanetName;
  degreeInNakshatra: number;
  subLordSpanStart: number;
  subLordSpanEnd: number;
}

/**
 * Returns the Vimshottari lord of the nakshatra (0-26).
 */
export const nakshatraLordForIndex = (nakIndex: number): PlanetName => {
  const normIdx = ((Math.floor(nakIndex) % 27) + 27) % 27;
  return VIMSHOTTARI_LORDS[normIdx % 9]!;
};

/**
 * Calculates the exact KP Sub-Lord and Sub-Sub-Lord for any sidereal longitude (0° to 360°).
 */
export const calculateKpSubLord = (siderealDeg: number): KpSubLordInfo => {
  const d = normalizeDegree(siderealDeg);
  const nakshatra = degreeToNakshatra(d);
  const nakIndex = nakshatra.index;
  const nakLord = nakshatraLordForIndex(nakIndex);

  const nakStartDeg = nakIndex * NAKSHATRA_SPAN;
  const degInNak = Math.min(NAKSHATRA_SPAN - 1e-12, Math.max(0, d - nakStartDeg));

  // Sub-lords start from the Nakshatra lord and cycle through 9 planets in Vimshottari order
  const startLordIdx = VIMSHOTTARI_LORDS.indexOf(nakLord);
  
  let accumulatedDeg = 0;
  let subLord: PlanetName = nakLord;
  let subStart = 0;
  let subEnd = NAKSHATRA_SPAN;
  let subSpan = 0;

  for (let i = 0; i < 9; i++) {
    const p = VIMSHOTTARI_LORDS[(startLordIdx + i) % 9]!;
    const span = (VIMSHOTTARI_YEARS[p] / 120) * NAKSHATRA_SPAN;
    const nextAcc = accumulatedDeg + span;

    if (degInNak >= accumulatedDeg - 1e-12 && degInNak < nextAcc + 1e-12) {
      subLord = p;
      subStart = accumulatedDeg;
      subEnd = nextAcc;
      subSpan = span;
      break;
    }
    accumulatedDeg = nextAcc;
  }

  // Calculate Sub-Sub-Lord within the Sub-Lord span
  const degInSub = Math.min(subSpan - 1e-12, Math.max(0, degInNak - subStart));
  const subStartLordIdx = VIMSHOTTARI_LORDS.indexOf(subLord);
  let accSubSub = 0;
  let subSubLord: PlanetName = subLord;

  for (let j = 0; j < 9; j++) {
    const p = VIMSHOTTARI_LORDS[(subStartLordIdx + j) % 9]!;
    const subSubSpan = (VIMSHOTTARI_YEARS[p] / 120) * subSpan;
    const nextSubSubAcc = accSubSub + subSubSpan;

    if (degInSub >= accSubSub - 1e-12 && degInSub < nextSubSubAcc + 1e-12) {
      subSubLord = p;
      break;
    }
    accSubSub = nextSubSubAcc;
  }

  return {
    nakshatra,
    nakshatraIndex: nakIndex,
    nakshatraLord: nakLord,
    subLord,
    subSubLord,
    degreeInNakshatra: degInNak,
    subLordSpanStart: subStart,
    subLordSpanEnd: subEnd
  };
};
