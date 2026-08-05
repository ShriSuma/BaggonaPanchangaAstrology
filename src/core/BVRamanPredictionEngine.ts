import { PlanetName, type KundliOutput } from "./AstroTypes";
import { lordOfHouse, isKendraHouse, isTrikonaHouse, isDusthanaHouse } from "./ChartPredictionKnowledge";
import { signLord } from "./KundliInsightsEngine";

export type BVRamanYoga = {
  name: string;
  description: string;
  isFavorable: boolean;
};

export type BVRamanDignity = {
  planet: PlanetName;
  status: "Exalted" | "Debilitated" | "OwnHouse" | "Neutral";
  description: string;
};

export type BVRamanPrediction = {
  dignities: BVRamanDignity[];
  yogas: BVRamanYoga[];
  dashaAnalysis: string;
  gocharaAnalysis: string;
};

const EXALTATION_RASHIS: Partial<Record<PlanetName, number>> = {
  [PlanetName.Sun]: 0,     // Aries
  [PlanetName.Moon]: 1,    // Taurus
  [PlanetName.Mars]: 9,    // Capricorn
  [PlanetName.Mercury]: 5, // Virgo
  [PlanetName.Jupiter]: 3, // Cancer
  [PlanetName.Venus]: 11,  // Pisces
  [PlanetName.Saturn]: 6,  // Libra
};

const DEBILITATION_RASHIS: Partial<Record<PlanetName, number>> = {
  [PlanetName.Sun]: 6,     // Libra
  [PlanetName.Moon]: 7,    // Scorpio
  [PlanetName.Mars]: 3,    // Cancer
  [PlanetName.Mercury]: 11,// Pisces
  [PlanetName.Jupiter]: 9, // Capricorn
  [PlanetName.Venus]: 5,   // Virgo
  [PlanetName.Saturn]: 0,  // Aries
};

/**
 * Evaluates planetary dignities according to classical Baggona Panchanga rules.
 */
function evaluateDignities(kundli: KundliOutput): BVRamanDignity[] {
  const dignities: BVRamanDignity[] = [];

  for (const planet of kundli.planets) {
    if (planet.name === PlanetName.Rahu || planet.name === PlanetName.Ketu) continue;

    const rashiIdx = planet.rashi.index;
    let status: BVRamanDignity["status"] = "Neutral";
    let description = `${planet.name} is placed in ${planet.rashi.english}.`;

    if (EXALTATION_RASHIS[planet.name] === rashiIdx) {
      status = "Exalted";
      description = `${planet.name} is Exalted (Ucha) in ${planet.rashi.english}, giving exceptional strength and highly positive results.`;
    } else if (DEBILITATION_RASHIS[planet.name] === rashiIdx) {
      status = "Debilitated";
      description = `${planet.name} is Debilitated (Neecha) in ${planet.rashi.english}, indicating challenges in its natural significations.`;
    } else if (signLord(rashiIdx) === planet.name) {
      status = "OwnHouse";
      description = `${planet.name} is in its Own House (Swakshetra) in ${planet.rashi.english}, making it very comfortable and strong.`;
    }

    if (status !== "Neutral") {
      dignities.push({ planet: planet.name, status, description });
    }
  }

  return dignities;
}

/**
 * Detects classical Yogas (Raja Yoga, Dhana Yoga) as defined in Hindu Predictive Astrology.
 */
function evaluateYogas(kundli: KundliOutput): BVRamanYoga[] {
  const yogas: BVRamanYoga[] = [];
  
  const lagnaLord = lordOfHouse(kundli, 1);
  const p9Lord = lordOfHouse(kundli, 9);
  const p10Lord = lordOfHouse(kundli, 10);
  const p5Lord = lordOfHouse(kundli, 5);
  const p4Lord = lordOfHouse(kundli, 4);

  const lagnaLordPos = kundli.planets.find(p => p.name === lagnaLord);
  const p9LordPos = kundli.planets.find(p => p.name === p9Lord);
  const p10LordPos = kundli.planets.find(p => p.name === p10Lord);
  
  // Dharma-Karma Adhipati Yoga (Raja Yoga): Lord of 9th (Trikona) and 10th (Kendra) conjunct
  if (p9LordPos && p10LordPos && p9LordPos.house === p10LordPos.house && p9LordPos.name !== p10LordPos.name) {
    yogas.push({
      name: "Dharma-Karma Adhipati Yoga",
      description: `The lords of the 9th (${p9Lord}) and 10th (${p10Lord}) houses are conjunct in house ${p9LordPos.house}. According to Baggona Panchanga, this is a powerful Raja Yoga bestowing high status, success in career, and great fortune.`,
      isFavorable: true,
    });
  }

  // Dhana Yoga (Wealth): 2nd lord and 11th lord connection (e.g. conjunction)
  const p2Lord = lordOfHouse(kundli, 2);
  const p11Lord = lordOfHouse(kundli, 11);
  const p2LordPos = kundli.planets.find(p => p.name === p2Lord);
  const p11LordPos = kundli.planets.find(p => p.name === p11Lord);

  if (p2LordPos && p11LordPos && p2LordPos.house === p11LordPos.house && p2LordPos.name !== p11LordPos.name) {
    yogas.push({
      name: "Dhana Yoga",
      description: `The lords of wealth (2nd) and gains (11th) are conjunct in house ${p2LordPos.house}, forming a potent Dhana Yoga that promises excellent financial prosperity.`,
      isFavorable: true,
    });
  }

  // Gaja Kesari Yoga: Jupiter in Kendra from Moon
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  if (jupiter && moon) {
    const diff = (jupiter.house - moon.house + 12) % 12;
    if (diff === 0 || diff === 3 || diff === 6 || diff === 9) { // 1st, 4th, 7th, 10th from Moon
      yogas.push({
        name: "Gaja Kesari Yoga",
        description: "Jupiter is in a Kendra (angular house) from the Moon. This highly auspicious yoga grants intelligence, lasting reputation, and prosperity.",
        isFavorable: true,
      });
    }
  }

  return yogas;
}

/**
 * Analyzes Dasha based on Mahadasha and Antardasha lords' mutual placements.
 */
function analyzeDasha(kundli: KundliOutput, mahaLord: PlanetName, bhuktiLord: PlanetName): string {
  if (mahaLord === bhuktiLord) {
    return `Currently running the Mahadasha and Bhukti of ${mahaLord}. The pure effects of ${mahaLord} will be felt according to its house placement and dignity in your chart.`;
  }

  const mahaPos = kundli.planets.find(p => p.name === mahaLord);
  const bhuktiPos = kundli.planets.find(p => p.name === bhuktiLord);

  if (!mahaPos || !bhuktiPos) return "Dasha lords are not found in the chart.";

  const mutualDistance = (bhuktiPos.house - mahaPos.house + 12) % 12 + 1; // 1-based

  if (mutualDistance === 6 || mutualDistance === 8 || mutualDistance === 12) {
    return `According to Baggona Panchanga, the Bhukti lord ${bhuktiLord} is in the ${mutualDistance}th house from the Mahadasha lord ${mahaLord} (a Shadashtaka or Dwirdwadasa relationship). This period may bring struggles, opposition, or unexpected changes, requiring patience.`;
  } else if (mutualDistance === 5 || mutualDistance === 9) {
    return `The Bhukti lord ${bhuktiLord} is in a trinal (Trikona - ${mutualDistance}th) relationship with the Mahadasha lord ${mahaLord}. This indicates a highly favorable and prosperous period, bringing opportunities and grace.`;
  } else if (mutualDistance === 4 || mutualDistance === 7 || mutualDistance === 10) {
    return `The Bhukti lord ${bhuktiLord} is in a Kendra (angular - ${mutualDistance}th) position from the Mahadasha lord ${mahaLord}. This period will be dynamic and action-oriented, yielding solid achievements.`;
  }

  return `The Mahadasha of ${mahaLord} and Bhukti of ${bhuktiLord} will give mixed results based on their mutual relationship (${mutualDistance}th position) in the chart.`;
}

export function generateBVRamanPrediction(kundli: KundliOutput, mahaLord: PlanetName, bhuktiLord: PlanetName): BVRamanPrediction {
  const dignities = evaluateDignities(kundli);
  const yogas = evaluateYogas(kundli);
  const dashaAnalysis = analyzeDasha(kundli, mahaLord, bhuktiLord);
  
  // Basic Gochara placeholder based on Saturn/Jupiter (Sade Sati, etc. could be expanded here)
  const gocharaAnalysis = `Baggona Panchanga emphasizes the transit (Gochara) of major slow-moving planets (Saturn and Jupiter) evaluated from your natal Moon sign (${kundli.moonSign.english}).`;

  return {
    dignities,
    yogas,
    dashaAnalysis,
    gocharaAnalysis
  };
}
