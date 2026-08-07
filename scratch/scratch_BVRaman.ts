import { PlanetName, type KundliOutput } from "../src/core/AstroTypes";
import { lordOfHouse, isKendraHouse, isTrikonaHouse, isDusthanaHouse } from "../src/core/ChartPredictionKnowledge";
import { signLord } from "../src/core/KundliInsightsEngine";

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
  doshas: BVRamanYoga[]; // Added Doshas explicitly
  dashaAnalysis: string;
  gocharaAnalysis: string;
};

// Exaltation and Debilitation logic remains the same
const EXALTATION_RASHIS: Partial<Record<PlanetName, number>> = {
  [PlanetName.Sun]: 0,
  [PlanetName.Moon]: 1,
  [PlanetName.Mars]: 9,
  [PlanetName.Mercury]: 5,
  [PlanetName.Jupiter]: 3,
  [PlanetName.Venus]: 11,
  [PlanetName.Saturn]: 6,
};

const DEBILITATION_RASHIS: Partial<Record<PlanetName, number>> = {
  [PlanetName.Sun]: 6,
  [PlanetName.Moon]: 7,
  [PlanetName.Mars]: 3,
  [PlanetName.Mercury]: 11,
  [PlanetName.Jupiter]: 9,
  [PlanetName.Venus]: 5,
  [PlanetName.Saturn]: 0,
};

function isKendra(house: number, refHouse: number = 1): boolean {
  const diff = (house - refHouse + 12) % 12;
  return diff === 0 || diff === 3 || diff === 6 || diff === 9; // 1, 4, 7, 10
}

function isTrikona(house: number, refHouse: number = 1): boolean {
  const diff = (house - refHouse + 12) % 12;
  return diff === 0 || diff === 4 || diff === 8; // 1, 5, 9
}

function distance(fromHouse: number, toHouse: number): number {
  return (toHouse - fromHouse + 12) % 12 + 1;
}

// Special aspects:
// Jupiter aspects 5, 7, 9
// Mars aspects 4, 7, 8
// Saturn aspects 3, 7, 10
function hasJupiterAspect(kundli: KundliOutput, targetHouse: number): boolean {
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  if (!jupiter) return false;
  const d = distance(jupiter.house, targetHouse);
  return d === 5 || d === 7 || d === 9;
}

function hasMarsAspect(kundli: KundliOutput, targetHouse: number): boolean {
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  if (!mars) return false;
  const d = distance(mars.house, targetHouse);
  return d === 4 || d === 7 || d === 8;
}

function hasSaturnAspect(kundli: KundliOutput, targetHouse: number): boolean {
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  if (!saturn) return false;
  const d = distance(saturn.house, targetHouse);
  return d === 3 || d === 7 || d === 10;
}

// All planets aspect the 7th house
function hasAspect(kundli: KundliOutput, aspectingPlanet: PlanetName, targetHouse: number): boolean {
  if (aspectingPlanet === PlanetName.Jupiter) return hasJupiterAspect(kundli, targetHouse);
  if (aspectingPlanet === PlanetName.Mars) return hasMarsAspect(kundli, targetHouse);
  if (aspectingPlanet === PlanetName.Saturn) return hasSaturnAspect(kundli, targetHouse);
  
  const planet = kundli.planets.find(p => p.name === aspectingPlanet);
  if (!planet) return false;
  return distance(planet.house, targetHouse) === 7;
}

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

export function evaluateYogasAndDoshas(kundli: KundliOutput): { yogas: BVRamanYoga[], doshas: BVRamanYoga[] } {
  const yogas: BVRamanYoga[] = [];
  const doshas: BVRamanYoga[] = [];
  
  const getLord = (h: number) => lordOfHouse(kundli, h);
  const getPos = (pName: PlanetName) => kundli.planets.find(p => p.name === pName);
  
  const p1Lord = getLord(1);
  const p2Lord = getLord(2);
  const p4Lord = getLord(4);
  const p5Lord = getLord(5);
  const p6Lord = getLord(6);
  const p7Lord = getLord(7);
  const p9Lord = getLord(9);
  const p10Lord = getLord(10);
  const p11Lord = getLord(11);
  const p12Lord = getLord(12);

  const p1LordPos = getPos(p1Lord);
  const p2LordPos = getPos(p2Lord);
  const p4LordPos = getPos(p4Lord);
  const p5LordPos = getPos(p5Lord);
  const p6LordPos = getPos(p6Lord);
  const p7LordPos = getPos(p7Lord);
  const p9LordPos = getPos(p9Lord);
  const p10LordPos = getPos(p10Lord);
  const p11LordPos = getPos(p11Lord);
  const p12LordPos = getPos(p12Lord);

  const sun = getPos(PlanetName.Sun);
  const moon = getPos(PlanetName.Moon);
  const mars = getPos(PlanetName.Mars);
  const mercury = getPos(PlanetName.Mercury);
  const jupiter = getPos(PlanetName.Jupiter);
  const venus = getPos(PlanetName.Venus);
  const saturn = getPos(PlanetName.Saturn);
  const rahu = getPos(PlanetName.Rahu);

  const benefics = [PlanetName.Jupiter, PlanetName.Venus, PlanetName.Mercury, PlanetName.Moon];
  const malefics = [PlanetName.Saturn, PlanetName.Mars, PlanetName.Rahu, PlanetName.Ketu, PlanetName.Sun];

  // Dharma-Karma Adhipati Yoga
  if (p9LordPos && p10LordPos && p9LordPos.house === p10LordPos.house && p9LordPos.name !== p10LordPos.name) {
    yogas.push({
      name: "Dharma-Karma Adhipati Yoga",
      description: `The lords of the 9th and 10th houses are conjunct in house ${p9LordPos.house}. A powerful Raja Yoga bestowing high status, success in career, and great fortune.`,
      isFavorable: true,
    });
  }

  // Dhana Yoga
  if (p2LordPos && p11LordPos && p2LordPos.house === p11LordPos.house && p2LordPos.name !== p11LordPos.name) {
    yogas.push({
      name: "Dhana Yoga",
      description: `The lords of wealth (2nd) and gains (11th) are conjunct in house ${p2LordPos.house}, forming a potent Dhana Yoga that promises excellent financial prosperity.`,
      isFavorable: true,
    });
  }

  // Gaja Kesari / Kesari Yoga
  if (jupiter && moon) {
    if (isKendra(jupiter.house, moon.house)) {
      yogas.push({
        name: "Gaja Kesari Yoga",
        description: "Jupiter is in a Kendra from the Moon. Grants intelligence, lasting reputation, and possession of all worldly enjoyments.",
        isFavorable: true,
      });
    }
  }

  // Chamara Yoga
  let chamaraFormed = false;
  if (p1LordPos && EXALTATION_RASHIS[p1Lord] === p1LordPos.rashi.index && isKendra(p1LordPos.house)) {
    if (hasJupiterAspect(kundli, p1LordPos.house)) chamaraFormed = true;
  }
  // OR two benefics in Asc, 7, 10
  const beneficsIn1_7_10 = kundli.planets.filter(p => benefics.includes(p.name) && [1, 7, 10].includes(p.house));
  if (beneficsIn1_7_10.length >= 2) chamaraFormed = true;
  if (chamaraFormed) {
    yogas.push({
      name: "Chamara Yoga",
      description: "The person will be greatly respected by rulers and the aristocracy, a good conversationalist, a profound scholar and lives a long life.",
      isFavorable: true
    });
  }

  // Shankha Yoga
  let shankhaFormed = false;
  if (p10LordPos && p1LordPos && p9LordPos) {
    const isMoveable = (rashiIndex: number) => rashiIndex % 3 === 0;
    if ((isMoveable(p10LordPos.rashi.index) || isMoveable(p1LordPos.rashi.index)) && EXALTATION_RASHIS[p9Lord] === p9LordPos.rashi.index) {
       shankhaFormed = true; // simplifying 'powerful 9th lord' to exalted for computation
    }
  }
  if (p5LordPos && p6LordPos && p1LordPos) {
    if (isKendra(p5LordPos.house, p6LordPos.house) && (EXALTATION_RASHIS[p1Lord] === p1LordPos.rashi.index || signLord(p1LordPos.rashi.index) === p1LordPos.name)) {
      shankhaFormed = true;
    }
  }
  if (shankhaFormed) {
    yogas.push({
      name: "Shankha Yoga",
      description: "Fond of pleasures, learned in sciences and philosophy, philanthropic, agreeable family surroundings, and long life.",
      isFavorable: true
    });
  }

  // Sreenatha Yoga
  if (p7LordPos && EXALTATION_RASHIS[p7Lord] === p7LordPos.rashi.index && p7LordPos.house === 10) {
    if (p10LordPos && p9LordPos && p10LordPos.house === p9LordPos.house) {
      yogas.push({
        name: "Sreenatha Yoga",
        description: "Great respect, reputation, honourable living, much wealth and nice surroundings.",
        isFavorable: true
      });
    }
  }

  // Bheri Yoga
  let bheriFormed = false;
  if (p10LordPos && [EXALTATION_RASHIS[p10Lord], p10LordPos.name].includes(signLord(p10LordPos.rashi.index))) { // powerful 10th
    const planetsIn1_2_7_12 = kundli.planets.filter(p => [1, 2, 7, 12].includes(p.house));
    if (planetsIn1_2_7_12.length >= 3) bheriFormed = true;
  }
  if (p9LordPos && [EXALTATION_RASHIS[p9Lord], p9LordPos.name].includes(signLord(p9LordPos.rashi.index))) {
    if (venus && p1LordPos && jupiter) {
      if (isKendra(venus.house, jupiter.house) && isKendra(p1LordPos.house, jupiter.house)) bheriFormed = true;
    }
  }
  if (bheriFormed) {
    yogas.push({
      name: "Bheri Yoga",
      description: "Landed estates, free from encumbrance, high family traditions, courageous, expert in sciences and arts.",
      isFavorable: true
    });
  }

  // Sarada Yoga
  let saradaFormed = false;
  if (moon && jupiter && isTrikona(jupiter.house, moon.house)) {
     if (mars && mercury && isTrikona(mars.house, mercury.house)) saradaFormed = true;
     if (mercury && jupiter && distance(mercury.house, jupiter.house) === 11) saradaFormed = true;
  }
  if (p10LordPos && p10LordPos.house === 5 && mercury && isKendra(mercury.house) && sun && signLord(sun.rashi.index) === sun.name) {
    saradaFormed = true;
  }
  if (saradaFormed) {
    yogas.push({
      name: "Sarada Yoga",
      description: "Respector of preceptors, religiously inclined, praised by the royalty, saintly disposition and patron of fine arts.",
      isFavorable: true
    });
  }

  // Matsya Yoga
  const planetsIn1 = kundli.planets.filter(p => p.house === 1);
  const planetsIn9 = kundli.planets.filter(p => p.house === 9);
  const planetsIn5 = kundli.planets.filter(p => p.house === 5);
  const planetsIn4 = kundli.planets.filter(p => p.house === 4);
  const planetsIn8 = kundli.planets.filter(p => p.house === 8);
  const hasMalefic = (arr: any[]) => arr.some(p => malefics.includes(p.name));
  const hasBenefic = (arr: any[]) => arr.some(p => benefics.includes(p.name));
  
  if (hasMalefic(planetsIn1) && hasMalefic(planetsIn9) && hasBenefic(planetsIn5) && hasMalefic(planetsIn5) && hasMalefic(planetsIn4) && hasMalefic(planetsIn8)) {
    yogas.push({
      name: "Matsya Yoga",
      description: "Lover of astrology, sympathetic temperament and religious nature.",
      isFavorable: true
    });
  }

  // Adhi Yoga
  if (moon) {
    const planetsIn678FromMoon = kundli.planets.filter(p => [6, 7, 8].includes(distance(moon.house, p.house)));
    const onlyBenefics = planetsIn678FromMoon.length > 0 && planetsIn678FromMoon.every(p => benefics.includes(p.name));
    if (onlyBenefics) {
      yogas.push({
        name: "Adhi Yoga",
        description: "Commander, Minister or a king, foeless, long-lived and free from diseases.",
        isFavorable: true
      });
    }
  }

  // Anapha, Sunapha, Durdhura, Kemadruma
  if (moon) {
    const planetsIn2FromMoon = kundli.planets.filter(p => p.name !== PlanetName.Sun && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu && distance(moon.house, p.house) === 2);
    const planetsIn12FromMoon = kundli.planets.filter(p => p.name !== PlanetName.Sun && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu && distance(moon.house, p.house) === 12);
    
    if (planetsIn2FromMoon.length > 0 && planetsIn12FromMoon.length > 0) {
      yogas.push({
        name: "Durdhura Yoga",
        description: "Enjoyment of all pleasures, conveyances, liberal, generous, commanding, dutiful and faithful children.",
        isFavorable: true
      });
    } else if (planetsIn2FromMoon.length > 0) {
      yogas.push({
        name: "Sunapha Yoga",
        description: "Self-made person, self-acquired wealth, intelligent and reputed.",
        isFavorable: true
      });
    } else if (planetsIn12FromMoon.length > 0) {
      yogas.push({
        name: "Anapha Yoga",
        description: "Commanding and majestic appearance, healthy, moral, renowned, and fond of sense pleasures.",
        isFavorable: true
      });
    } else if (planetsIn2FromMoon.length === 0 && planetsIn12FromMoon.length === 0 && !kundli.planets.some(p => p.name !== PlanetName.Sun && p.name !== PlanetName.Moon && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu && isKendra(p.house, moon.house))) {
      doshas.push({
        name: "Kemadruma Yoga",
        description: "No planets in 2nd and 12th from Moon. Misery and poverty throughout life, neutralising beneficial yogas unless cancelled.",
        isFavorable: false
      });
    }
  }

  // Kahala Yoga
  if (p4LordPos && jupiter && isKendra(p4LordPos.house, jupiter.house)) {
    if (p1LordPos && (EXALTATION_RASHIS[p1Lord] === p1LordPos.rashi.index || signLord(p1LordPos.rashi.index) === p1LordPos.name)) {
      yogas.push({
        name: "Kahala Yoga",
        description: "Stubbornness, courageous and adventurous, ruling towns and cities.",
        isFavorable: true
      });
    }
  }

  // Vasi, Vesi, Obhayachari
  if (sun) {
    const planetsIn2FromSun = kundli.planets.filter(p => p.name !== PlanetName.Moon && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu && distance(sun.house, p.house) === 2);
    const planetsIn12FromSun = kundli.planets.filter(p => p.name !== PlanetName.Moon && p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu && distance(sun.house, p.house) === 12);
    
    if (planetsIn2FromSun.length > 0 && planetsIn12FromSun.length > 0) {
      yogas.push({
        name: "Obhayachari Yoga",
        description: "Equal to a king, good, sympathetic and philanthropic.",
        isFavorable: true
      });
    } else {
      if (planetsIn2FromSun.some(p => benefics.includes(p.name))) {
        yogas.push({
          name: "Vesi Yoga",
          description: "Good conversationalist, fluent speaker, wealthy, courageous and extremely charitable.",
          isFavorable: true
        });
      }
      if (planetsIn12FromSun.length > 0) {
        yogas.push({
          name: "Vasi Yoga",
          description: "Influential, rich and wealthy.",
          isFavorable: true
        });
      }
    }
  }

  // Khadga Yoga
  if (p2LordPos && p9LordPos && p2LordPos.house === 9 && p9LordPos.house === 2) {
    if (p1LordPos && (isKendra(p1LordPos.house) || isTrikona(p1LordPos.house))) {
      yogas.push({
        name: "Khadga Yoga",
        description: "Religiously inclined, courageous, strong, penetrating intelligence.",
        isFavorable: true
      });
    }
  }

  // Lakshmi Yoga
  if (p9LordPos && (isKendra(p9LordPos.house) || isTrikona(p9LordPos.house)) && (EXALTATION_RASHIS[p9Lord] === p9LordPos.rashi.index || signLord(p9LordPos.rashi.index) === p9LordPos.name)) {
    yogas.push({
      name: "Lakshmi Yoga",
      description: "Extremely handsome appearance, noble qualities, immense wealth, high reputation and honoured by aristocracy.",
      isFavorable: true
    });
  } else if (p9LordPos && p1LordPos && p9LordPos.house === p1LordPos.house) {
    yogas.push({
      name: "Lakshmi Yoga",
      description: "Extremely handsome appearance, noble qualities, immense wealth, high reputation and honoured by aristocracy.",
      isFavorable: true
    });
  }

  // Kusuma Yoga
  if (venus && p10LordPos && moon && sun) {
    const isFixed = (rashiIndex: number) => rashiIndex % 3 === 1;
    if (isFixed(venus.rashi.index) && isKendra(venus.house) && isTrikona(moon.house) && sun.house === 10) {
      yogas.push({
        name: "Kusuma Yoga",
        description: "Extremely liberal, war-like and possessed of unsullied reputation and good enjoyment.",
        isFavorable: true
      });
    }
  }

  // Rajju Yoga
  const isMoveableRashi = (rashiIndex: number) => rashiIndex % 3 === 0;
  const allInMoveable = kundli.planets.filter(p => p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu).every(p => isMoveableRashi(p.rashi.index));
  if (allInMoveable) {
    doshas.push({
      name: "Rajju Yoga",
      description: "All planets in moveable signs. Frequent travels, resident in foreign country, unstable.",
      isFavorable: false
    });
  }

  // Brihadbija Yoga
  if (rahu && mars && saturn && p1LordPos) {
    if (rahu.house === 1 && mars.house === 1 && saturn.house === 1) {
      doshas.push({
        name: "Brihadbija Yoga",
        description: "Rahu with Mars and Saturn in Ascendant. Prone to severe reproductive/venereal complaints.",
        isFavorable: false
      });
    } else if (p1LordPos.house === 8 && rahu.house === 8) {
      const otherMaleficsIn8 = kundli.planets.some(p => p.house === 8 && p.name !== p1LordPos.name && p.name !== PlanetName.Rahu && malefics.includes(p.name));
      if (otherMaleficsIn8) {
        doshas.push({
          name: "Brihadbija Yoga",
          description: "Ascendant lord in 8th with Rahu and malefics. Prone to severe reproductive/venereal complaints.",
          isFavorable: false
        });
      }
    }
  }

  // Daridra Yoga
  if (p1LordPos && p12LordPos && p1LordPos.house === 12 && p12LordPos.house === 1) {
    doshas.push({
      name: "Daridra Yoga",
      description: "Exchange between 1st and 12th lords. Loss of wealth, financial struggles, and general poverty.",
      isFavorable: false
    });
  }

  // Asatyavadi Yoga
  if (p2LordPos) {
    const lordOf2ndHouseSign = signLord(p2LordPos.rashi.index);
    if (lordOf2ndHouseSign === PlanetName.Saturn) {
      doshas.push({
        name: "Asatyavadi Yoga",
        description: "Lord of the house occupied by the 2nd lord is Saturn. Likes falsehood and indulges in fraudulent schemes.",
        isFavorable: false
      });
    }
  }

  // Gnana Yogas
  // Lecturer/Orator
  if (jupiter && hasAspect(kundli, PlanetName.Venus, jupiter.house)) { // simplified well-aspected
     if (isKendra(jupiter.house) || isTrikona(jupiter.house)) {
        yogas.push({
          name: "Gnana Yoga (Lecturer/Orator)",
          description: "Powerful Jupiter. The person becomes a great lecturer and orator.",
          isFavorable: true
        });
     }
  }
  // Astrologer
  if (mercury && venus && (moon || jupiter)) {
    if (isKendra(mercury.house) && venus.house === 2 && ((moon && moon.house === 3) || (jupiter && jupiter.house === 3))) {
      yogas.push({
        name: "Gnana Yoga (Astrologer)",
        description: "Mercury in Kendra, Venus in 2nd, Moon/Jupiter in 3rd. It makes the native a great astrologer.",
        isFavorable: true
      });
    }
  }
  // Mathematician
  if (mars && mercury && moon) {
    if (mars.house === 2 && mercury.house === 2 && moon.house === 2) {
      yogas.push({
        name: "Gnana Yoga (Mathematician)",
        description: "Makes a person a great mathematician.",
        isFavorable: true
      });
    } else if (isKendra(mars.house) && isKendra(mercury.house) && isKendra(moon.house)) {
      yogas.push({
        name: "Gnana Yoga (Mathematician)",
        description: "Makes a person a great mathematician.",
        isFavorable: true
      });
    }
  }

  // --- Common Pancha Mahapurusha Yogas ---
  const checkMahapurusha = (planet: PlanetName, yogaName: string) => {
    const p = getPos(planet);
    if (p && isKendra(p.house) && (EXALTATION_RASHIS[planet] === p.rashi.index || signLord(p.rashi.index) === planet)) {
      yogas.push({
        name: yogaName,
        description: `${planet} is in Kendra in own/exaltation sign. Bestows exceptional leadership, fortune, and high character traits.`,
        isFavorable: true
      });
    }
  };
  checkMahapurusha(PlanetName.Mars, "Ruchaka Yoga");
  checkMahapurusha(PlanetName.Mercury, "Bhadra Yoga");
  checkMahapurusha(PlanetName.Jupiter, "Hamsa Yoga");
  checkMahapurusha(PlanetName.Venus, "Malavya Yoga");
  checkMahapurusha(PlanetName.Saturn, "Sasa Yoga");

  // --- Kuja Dosha (Manglik) ---
  if (mars && [1, 2, 4, 7, 8, 12].includes(mars.house)) { // Some include 2nd house
    doshas.push({
      name: "Kuja Dosha",
      description: `Mars is placed in the ${mars.house} house. This forms Kuja (Manglik) Dosha, which can cause challenges or delays in marriage and partnerships.`,
      isFavorable: false
    });
  }

  // --- Guru Chandala Dosha ---
  if (jupiter && rahu && jupiter.house === rahu.house) {
    doshas.push({
      name: "Guru Chandala Dosha",
      description: "Jupiter and Rahu are conjunct. This dosha can cause confusion in morals, unconventional beliefs, and challenges with preceptors.",
      isFavorable: false
    });
  }

  // --- Kala Sarpa Dosha ---
  // A simplistic check: if all planets are between Rahu and Ketu
  // We can calculate this by checking if all planets fall in one half of the zodiac (distance <= 6 signs from Rahu to Ketu)
  if (rahu) {
    let allOnOneSide = true;
    for (const p of kundli.planets) {
      if (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) continue;
      const distFromRahu = (p.rashi.index - rahu.rashi.index + 12) % 12;
      // All must be <= 5 or all must be >= 7.
      // (Actually, Kala Sarpa is strictly between Rahu and Ketu, so distance from Rahu is 1..5 for Anuloma, 7..11 for Viloma)
    }
    // We will skip full Kala Sarpa logic to avoid errors unless necessary, it's a bit complex. Let's do a basic check.
    const housesOccupied = new Set(kundli.planets.filter(p => p.name !== PlanetName.Rahu && p.name !== PlanetName.Ketu).map(p => p.house));
    let start = rahu.house;
    let isKalaSarpa = true;
    for (let i = 1; i < 6; i++) {
      let h1 = (start + i - 1) % 12 + 1;
      let h2 = (start - i + 12 - 1) % 12 + 1;
      // if all planets are in 6 contiguous houses
    }
    // Simplification: if houses 1-6 from rahu or 7-12 from rahu contain all planets
    let leftCount = 0;
    let rightCount = 0;
    for (const p of kundli.planets) {
      if (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) continue;
      const dist = distance(rahu.house, p.house);
      if (dist > 1 && dist < 7) leftCount++;
      if (dist > 7 && dist <= 12) rightCount++;
    }
    if ((leftCount === 7 && rightCount === 0) || (rightCount === 7 && leftCount === 0)) {
      doshas.push({
        name: "Kala Sarpa Dosha",
        description: "All major planets are hemmed between Rahu and Ketu. Can cause delays, unseen obstacles, and intense karmic lessons.",
        isFavorable: false
      });
    }
  }

  return { yogas, doshas };
}

function analyzeDasha(kundli: KundliOutput, mahaLord: PlanetName, bhuktiLord: PlanetName): string {
  if (mahaLord === bhuktiLord) {
    return `Currently running the Mahadasha and Bhukti of ${mahaLord}. The pure effects of ${mahaLord} will be felt according to its house placement and dignity in your chart.`;
  }
  const mahaPos = kundli.planets.find(p => p.name === mahaLord);
  const bhuktiPos = kundli.planets.find(p => p.name === bhuktiLord);
  if (!mahaPos || !bhuktiPos) return "Dasha lords are not found in the chart.";
  const mutualDistance = distance(mahaPos.house, bhuktiPos.house);
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
  const { yogas, doshas } = evaluateYogasAndDoshas(kundli);
  const dashaAnalysis = analyzeDasha(kundli, mahaLord, bhuktiLord);
  const gocharaAnalysis = `Baggona Panchanga emphasizes the transit (Gochara) of major slow-moving planets (Saturn and Jupiter) evaluated from your natal Moon sign (${kundli.moonSign.english}).`;

  return {
    dignities,
    yogas,
    doshas,
    dashaAnalysis,
    gocharaAnalysis
  };
}
