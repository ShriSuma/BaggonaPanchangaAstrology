import { PlanetName, type KundliOutput, type PlanetPosition } from "./AstroTypes";
import { normalizeDegree } from "./AstroMath";
import { navamsaSignIndex } from "./Navamsa";
import { signLord } from "./KundliInsightsEngine";
import { friendshipBetween } from "./TaraBalaEngine";

export const MAX_PLANET_RASHMI: Record<PlanetName, number> = {
  [PlanetName.Sun]: 10,
  [PlanetName.Moon]: 9,
  [PlanetName.Mars]: 5,
  [PlanetName.Mercury]: 5,
  [PlanetName.Jupiter]: 7,
  [PlanetName.Venus]: 8,
  [PlanetName.Saturn]: 5,
  [PlanetName.Rahu]: 4,
  [PlanetName.Ketu]: 4
};

export const DEEP_EXALTATION_DEGREE: Record<PlanetName, number> = {
  [PlanetName.Sun]: 10,       // 10° Aries
  [PlanetName.Moon]: 33,      // 3° Taurus
  [PlanetName.Mars]: 298,     // 28° Capricorn
  [PlanetName.Mercury]: 165,  // 15° Virgo
  [PlanetName.Jupiter]: 95,   // 5° Cancer
  [PlanetName.Venus]: 357,    // 27° Pisces
  [PlanetName.Saturn]: 200,   // 20° Libra
  [PlanetName.Rahu]: 45,      // 15° Taurus
  [PlanetName.Ketu]: 225      // 15° Scorpio
};

export const DEEP_DEBILITATION_DEGREE: Record<PlanetName, number> = {
  [PlanetName.Sun]: 190,      // 10° Libra
  [PlanetName.Moon]: 213,     // 3° Scorpio
  [PlanetName.Mars]: 118,     // 28° Cancer
  [PlanetName.Mercury]: 345,  // 15° Pisces
  [PlanetName.Jupiter]: 275,  // 5° Capricorn
  [PlanetName.Venus]: 177,    // 27° Virgo
  [PlanetName.Saturn]: 20,    // 20° Aries
  [PlanetName.Rahu]: 225,     // 15° Scorpio
  [PlanetName.Ketu]: 45       // 15° Taurus
};

export interface PlanetRashmiInfo {
  planet: PlanetName;
  rawDegrees: number;
  maxRashmi: number;
  baseRashmi: number;
  modifiedRashmi: number;
  isRetrograde: boolean;
  isCombust: boolean;
  vargaStatus: "Exalted" | "Vargottama" | "Friendly" | "Neutral" | "Enemy" | "Debilitated";
  rayTransmissionQuality: "Luminous" | "Steady" | "Scattered" | "Latent";
}

export interface HoroscopeRashmiSynthesis {
  planets: PlanetRashmiInfo[];
  totalRashmi: number;
  averageRashmi: number;
  strengthGrade: "Maharaja / Supreme Luminous" | "Uttama / Strong Radiance" | "Madhyama / Moderate Radiance" | "Alpa / Latent Radiance";
  raySummary: string;
}

/**
 * Checks whether a planet is combust (Asta) with the Sun.
 */
export const isPlanetCombust = (planetDeg: number, sunDeg: number, planet: PlanetName): boolean => {
  if (planet === PlanetName.Sun || planet === PlanetName.Rahu || planet === PlanetName.Ketu) {
    return false;
  }
  const diff = Math.abs(normalizeDegree(planetDeg - sunDeg));
  const shortest = diff > 180 ? 360 - diff : diff;

  // Combustion orbs in degrees
  const combustionOrbs: Partial<Record<PlanetName, number>> = {
    [PlanetName.Moon]: 12,
    [PlanetName.Mars]: 17,
    [PlanetName.Mercury]: 14, // 12 if retrograde
    [PlanetName.Jupiter]: 11,
    [PlanetName.Venus]: 10,   // 8 if retrograde
    [PlanetName.Saturn]: 15
  };

  const orb = combustionOrbs[planet] ?? 12;
  return shortest <= orb;
};

/**
 * Calculates Rashmi (Planetary Rays) for a single planet.
 */
export const calculateSinglePlanetRashmi = (
  position: PlanetPosition,
  sunDegree: number
): PlanetRashmiInfo => {
  const planet = position.name;
  const deg = normalizeDegree(position.degree);
  const maxR = MAX_PLANET_RASHMI[planet];
  const debDeg = DEEP_DEBILITATION_DEGREE[planet];
  
  // Calculate distance from debilitation towards exaltation (0 to 180 degrees)
  let diff = normalizeDegree(deg - debDeg);
  if (diff > 180) {
    diff = 360 - diff;
  }

  const baseRashmi = Number(((diff / 180) * maxR).toFixed(2));
  let modified = baseRashmi;

  // Navamsha Varga check
  const d1Sign = position.rashi.index;
  const d9Sign = navamsaSignIndex(deg);
  const navLord = signLord(d9Sign);
  const relation = friendshipBetween(planet as any, navLord as any);

  let vargaStatus: PlanetRashmiInfo["vargaStatus"] = "Neutral";
  if (d1Sign === d9Sign) {
    vargaStatus = "Vargottama";
    modified *= 1.2;
  } else if (relation === "friend" || relation === "same") {
    vargaStatus = "Friendly";
    modified *= 1.1;
  } else if (relation === "enemy") {
    vargaStatus = "Enemy";
    modified *= 0.85;
  }

  // Retrograde amplification (Vakri reflects direct cosmic rays towards Earth)
  const isRetro = !!position.isRetrograde;
  if (isRetro && planet !== PlanetName.Rahu && planet !== PlanetName.Ketu) {
    modified *= 1.35;
  }

  // Combustion attenuation
  const isComb = isPlanetCombust(deg, sunDegree, planet);
  if (isComb) {
    modified *= 0.55;
  }

  // Bound within realistic limits [0, maxR * 1.5]
  const finalModified = Number(Math.max(0.1, Math.min(maxR * 1.5, modified)).toFixed(2));

  let transmission: PlanetRashmiInfo["rayTransmissionQuality"] = "Steady";
  const ratio = finalModified / maxR;
  if (ratio >= 0.85) transmission = "Luminous";
  else if (ratio >= 0.5) transmission = "Steady";
  else if (ratio >= 0.25) transmission = "Scattered";
  else transmission = "Latent";

  return {
    planet,
    rawDegrees: deg,
    maxRashmi: maxR,
    baseRashmi,
    modifiedRashmi: finalModified,
    isRetrograde: isRetro,
    isCombust: isComb,
    vargaStatus,
    rayTransmissionQuality: transmission
  };
};

/**
 * Calculates the complete Rashmi Chintha synthesis for a natal Kundli.
 */
export const calculateHoroscopeRashmi = (kundli: KundliOutput): HoroscopeRashmiSynthesis => {
  const sun = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const sunDeg = sun?.degree ?? 0;

  const planets = kundli.planets.map((p) => calculateSinglePlanetRashmi(p, sunDeg));
  const totalRashmi = Number(planets.reduce((acc, p) => acc + p.modifiedRashmi, 0).toFixed(2));
  const averageRashmi = Number((totalRashmi / planets.length).toFixed(2));

  let strengthGrade: HoroscopeRashmiSynthesis["strengthGrade"] = "Madhyama / Moderate Radiance";
  let raySummary = "";

  if (totalRashmi >= 36) {
    strengthGrade = "Maharaja / Supreme Luminous";
    raySummary = "Supreme planetary ray potency. Planetary rays transmit cleanly to terrestrial life domains with minimum obstruction.";
  } else if (totalRashmi >= 26) {
    strengthGrade = "Uttama / Strong Radiance";
    raySummary = "Robust planetary ray transmission. Key life goals and professional achievements manifest with consistent momentum.";
  } else if (totalRashmi >= 18) {
    strengthGrade = "Madhyama / Moderate Radiance";
    raySummary = "Balanced planetary ray capacity. Manifestation requires targeted effort in specific houses with favorable sub-lords.";
  } else {
    strengthGrade = "Alpa / Latent Radiance";
    raySummary = "Planetary rays are latent or scattered. Shanti rituals, gemstone/mantra tuning, and Vastu alignment are recommended to unblock rays.";
  }

  return {
    planets,
    totalRashmi,
    averageRashmi,
    strengthGrade,
    raySummary
  };
};
