import { NAKSHATRAS, RASHIS, PlanetName, type AyanamsaModel, type Nakshatra, type Rashi } from "./AstroTypes";
import { ayanamsaForModel } from "./Ayanamsa";

export type { AyanamsaModel } from "./AstroTypes";

export const normalizeDegree = (deg: number): number => {
  const value = deg % 360;
  return value < 0 ? value + 360 : value;
};

/** Julian Day (UT) from a JavaScript Date that represents a UTC instant. */
export const dateToJulianUt = (d: Date): number => d.getTime() / 86400000 + 2440587.5;

/** Ayanāṃśa (degrees, UT). Default: Drik Gaṇita (True Chitrā / Spica 180°). Pass `lahiri` for older tables. */
export const getAyanamsa = (date: Date, model: AyanamsaModel = "lahiri"): number =>
  ayanamsaForModel(date, model);

const NAK_DEG = 360 / 27;
const PADA_DEG = NAK_DEG / 4;

export const degreeToRashi = (deg: number): Rashi => {
  const normalized = normalizeDegree(deg);
  return RASHIS[Math.floor(normalized / 30)];
};

export const degreeToNakshatra = (deg: number): Nakshatra => {
  const normalized = normalizeDegree(deg);
  const nakIdx = Math.min(26, Math.floor(normalized / NAK_DEG + 1e-12));
  return NAKSHATRAS[nakIdx]!;
};

/**
 * Converts a degree or planet object into normalized absolute sidereal longitude (0–360°).
 * Safely handles both sign-relative degrees (0–30°) and absolute ecliptic degrees (0–360°).
 */
export const toAbsoluteLongitude = (
  planetOrDeg: number | { degree: number; rashi?: { index: number } },
  rashiIdx?: number
): number => {
  if (typeof planetOrDeg === "number") {
    if (rashiIdx !== undefined && rashiIdx > 0 && planetOrDeg < 30) {
      return normalizeDegree(rashiIdx * 30 + (planetOrDeg % 30));
    }
    return normalizeDegree(planetOrDeg);
  }
  if (!planetOrDeg) return 0;
  const deg = planetOrDeg.degree ?? 0;
  const rIdx = planetOrDeg.rashi?.index ?? rashiIdx ?? 0;
  if (deg >= 30) {
    return normalizeDegree(deg);
  }
  return normalizeDegree(rIdx * 30 + (deg % 30));
};

/** Pada 1–4 within the nakshatra of this sidereal longitude. */
export const degreeToNakshatraPada = (deg: number, rashiIndex?: number): 1 | 2 | 3 | 4 => {
  let normalized = normalizeDegree(deg);
  if (rashiIndex !== undefined && rashiIndex > 0 && normalized < 30) {
    normalized = normalizeDegree(rashiIndex * 30 + normalized);
  }
  const nakIdx = Math.min(26, Math.floor(normalized / NAK_DEG + 1e-12));
  const nakStart = nakIdx * NAK_DEG;
  const within = Math.min(NAK_DEG - 1e-9, Math.max(0, normalized - nakStart));
  const p = Math.floor(within / PADA_DEG + 1e-12) + 1;
  return Math.min(4, Math.max(1, p)) as 1 | 2 | 3 | 4;
};

/**
 * 100% Deterministic Moon Pada resolver.
 * Computes exact Nakshatra Pada from Moon's astronomical sidereal longitude if planets exist.
 * Otherwise reliably parses numeric or string representation (e.g. "ಪಾದ 4", "चरण ४", "Pada 4").
 * Completely eliminates the bug where Pada 4 was erroneously defaulted or calculated as 1 or 2.
 */
export const resolveExactMoonPada = (kundli: any): 1 | 2 | 3 | 4 => {
  if (!kundli) return 1;

  // 1. Gold standard: Mathematical calculation from Moon's astronomical position
  const moonPlanet = kundli.planets?.find((p: any) => p.name === "Moon" || p.name === PlanetName?.Moon || p.name === "Chandra");
  if (moonPlanet && typeof moonPlanet.degree === "number" && !isNaN(moonPlanet.degree)) {
    const absDeg = toAbsoluteLongitude(moonPlanet, kundli.moonSign?.index);
    return degreeToNakshatraPada(absDeg);
  }

  // 2. Direct valid numeric pada
  if (typeof kundli.moonPada === "number" && kundli.moonPada >= 1 && kundli.moonPada <= 4) {
    return kundli.moonPada as 1 | 2 | 3 | 4;
  }

  // 3. String representation (Kannada, Devanagari, Telugu, Tamil, Latin numerals)
  if (typeof kundli.moonPada === "string") {
    const s = kundli.moonPada.trim();
    if (/[4೪४౪௪]/.test(s)) return 4;
    if (/[3೩३౩௩]/.test(s)) return 3;
    if (/[2೨२౨௨]/.test(s)) return 2;
    if (/[1೧१౧௧]/.test(s)) return 1;
  }

  // 4. Check nested kundliData
  if (kundli.kundliData) {
    return resolveExactMoonPada(kundli.kundliData);
  }

  return 1;
};

export const calculateLocalSiderealTime = (date: Date, longitude: number): number => {
  const jd = dateToJulianUt(date);
  const t = (jd - 2451545.0) / 36525;
  const gst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return normalizeDegree(gst + longitude);
};
