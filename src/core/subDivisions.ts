import { normalizeDegree } from "./AstroMath";
import { navamsaSignIndex, navamsaLongitude } from "./Navamsa";

export interface SubDivisionalAmsha {
  d1Sign: number; // 0-11 (Mesha = 0)
  d9NavamsaSign: number; // 0-11
  d9NavamsaNumber: number; // 1-12 (Karnataka patrika style)
  d7SaptamsaSign: number; // 0-11
  d7SaptamsaNumber: number; // 1-12
  d10DasamsaSign: number; // 0-11
  d10DasamsaNumber: number; // 1-12
  d12DwadasamsaSign: number; // 0-11
  d12DwadasamsaNumber: number; // 1-12
  isVargottama: boolean;
  isPushkaramsha: boolean;
  isGandanta: boolean;
  degreeInSign: number;
}

const SAPTAMSA_SPAN = 30 / 7; // 4.285714285714286 degrees
const DASAMSA_SPAN = 30 / 10;  // 3.0 degrees
const DWADASAMSA_SPAN = 30 / 12; // 2.5 degrees

/**
 * Calculates Saptamsha (D-7) sign index (0-11).
 * Parashara rule:
 * For Odd signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius): counting starts from the sign itself.
 * For Even signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces): counting starts from the 7th house from the sign.
 */
export const saptamsaSignIndex = (siderealDeg: number): number => {
  const d = normalizeDegree(siderealDeg);
  const sign = Math.floor(d / 30);
  const inSign = d - sign * 30;
  const part = Math.min(6, Math.floor(inSign / SAPTAMSA_SPAN + 1e-12));
  const isOdd = sign % 2 === 0; // 0=Mesha (odd sign), 1=Vrishabha (even sign)
  const startSign = isOdd ? sign : (sign + 6) % 12;
  return (startSign + part) % 12;
};

/**
 * Calculates Dashamsha (D-10) sign index (0-11).
 * Parashara rule:
 * For Odd signs: counting starts from the sign itself.
 * For Even signs: counting starts from the 9th house from the sign.
 */
export const dasamsaSignIndex = (siderealDeg: number): number => {
  const d = normalizeDegree(siderealDeg);
  const sign = Math.floor(d / 30);
  const inSign = d - sign * 30;
  const part = Math.min(9, Math.floor(inSign / DASAMSA_SPAN + 1e-12));
  const isOdd = sign % 2 === 0; // 0=Mesha (odd sign)
  const startSign = isOdd ? sign : (sign + 8) % 12;
  return (startSign + part) % 12;
};

/**
 * Calculates Dwadashamsha (D-12) sign index (0-11).
 * Parashara rule: counting starts from the sign itself for all signs.
 */
export const dwadasamsaSignIndex = (siderealDeg: number): number => {
  const d = normalizeDegree(siderealDeg);
  const sign = Math.floor(d / 30);
  const inSign = d - sign * 30;
  const part = Math.min(11, Math.floor(inSign / DWADASAMSA_SPAN + 1e-12));
  return (sign + part) % 12;
};

/**
 * Checks if a longitude falls in Pushkaramsha (highly auspicious planetary degrees).
 * Classical table of Pushkaramsha Navamshas across 12 signs.
 */
export const isPushkaramshaDegree = (siderealDeg: number): boolean => {
  const d = normalizeDegree(siderealDeg);
  const sign = Math.floor(d / 30);
  const inSign = d - sign * 30;
  const navPart = Math.min(8, Math.floor(inSign / (30 / 9) + 1e-12)); // 0-8

  // Fire signs (0, 4, 8): 7th (Tula navamsa) & 9th (Dhanu navamsa) navamshas -> parts 6 and 8
  if (sign === 0 || sign === 4 || sign === 8) {
    return navPart === 6 || navPart === 8;
  }
  // Earth signs (1, 5, 9): 3rd (Pisces) & 5th (Taurus) navamshas -> parts 2 and 4
  if (sign === 1 || sign === 5 || sign === 9) {
    return navPart === 2 || navPart === 4;
  }
  // Air signs (2, 6, 10): 6th (Pisces) & 8th (Taurus) navamshas -> parts 5 and 7
  if (sign === 2 || sign === 6 || sign === 10) {
    return navPart === 5 || navPart === 7;
  }
  // Water signs (3, 7, 11): 1st (Cancer) & 3rd (Virgo) navamshas -> parts 0 and 2
  if (sign === 3 || sign === 7 || sign === 11) {
    return navPart === 0 || navPart === 2;
  }
  return false;
};

/**
 * Checks if a longitude is Gandanta (karmic junction between water and fire signs: 0°-1° / 29°-30°).
 * Revati-Ashwini (359°-1°), Ashlesha-Magha (119°-121°), Jyeshtha-Mula (239°-241°).
 */
export const isGandantaDegree = (siderealDeg: number): boolean => {
  const d = normalizeDegree(siderealDeg);
  const junctions = [0, 120, 240];
  for (const j of junctions) {
    const diff = Math.abs(d - j);
    if (diff <= 1.0 || diff >= 359.0) {
      return true;
    }
  }
  return false;
};

/**
 * Computes full Sub-Divisional Amsha matrix for any sidereal degree.
 */
export const computeSubDivisionalAmsha = (siderealDeg: number): SubDivisionalAmsha => {
  const d = normalizeDegree(siderealDeg);
  const d1Sign = Math.floor(d / 30);
  const inSign = d - d1Sign * 30;

  const d9Sign = navamsaSignIndex(d);
  const d7Sign = saptamsaSignIndex(d);
  const d10Sign = dasamsaSignIndex(d);
  const d12Sign = dwadasamsaSignIndex(d);

  return {
    d1Sign,
    d9NavamsaSign: d9Sign,
    d9NavamsaNumber: d9Sign + 1,
    d7SaptamsaSign: d7Sign,
    d7SaptamsaNumber: d7Sign + 1,
    d10DasamsaSign: d10Sign,
    d10DasamsaNumber: d10Sign + 1,
    d12DwadasamsaSign: d12Sign,
    d12DwadasamsaNumber: d12Sign + 1,
    isVargottama: d1Sign === d9Sign,
    isPushkaramsha: isPushkaramshaDegree(d),
    isGandanta: isGandantaDegree(d),
    degreeInSign: inSign
  };
};
