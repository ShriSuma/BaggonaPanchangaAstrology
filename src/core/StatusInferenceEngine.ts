import { PlanetName, type KundliOutput } from "./AstroTypes";
import { isDusthanaHouse, lordOfHouse } from "./ChartPredictionKnowledge";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";

/**
 * Mathematically infers Marital, Career, and Progeny status based on classical 
 * Vedic rules (Baggona Panchanga) to determine if a person is experiencing severe delays or denials.
 */
export function inferLifeStatus(kundli: KundliOutput, ageDecimal: number) {
  return {
    isLikelyUnmarried: checkMarriageDelay(kundli, ageDecimal),
    isLikelyUnemployed: checkCareerStruggle(kundli, ageDecimal),
    isLikelyChildless: checkProgenyDelay(kundli, ageDecimal)
  };
}

function checkMarriageDelay(kundli: KundliOutput, ageDecimal: number): boolean {
  if (ageDecimal < 28) return false; // Too early to definitively infer severe delay
  
  let delayScore = 0;
  
  const planets = kundli.planets;
  const h7Lord = lordOfHouse(kundli, 7);
  const h7LordPos = planets.find(p => p.name === h7Lord);
  const venus = planets.find(p => p.name === PlanetName.Venus);
  
  // Rule 1: 7th Lord in Dusthana (6, 8, 12)
  if (h7LordPos && isDusthanaHouse(h7LordPos.house)) {
    delayScore += 2;
  }
  
  // Rule 2: Malefics in the 7th House (Saturn, Rahu, Ketu, Mars, Sun)
  const malefics = [PlanetName.Saturn, PlanetName.Rahu, PlanetName.Ketu, PlanetName.Mars, PlanetName.Sun];
  const planetsIn7th = planets.filter(p => p.house === 7);
  planetsIn7th.forEach(p => {
    if (malefics.includes(p.name)) {
      delayScore += p.name === PlanetName.Saturn ? 2 : 1; // Saturn causes maximum delay
    }
  });
  
  // Rule 3: Venus afflicted by malefics (conjunct)
  const planetsWithVenus = planets.filter(p => p.house === venus?.house && p.name !== PlanetName.Venus);
  planetsWithVenus.forEach(p => {
    if (malefics.includes(p.name)) delayScore += 1;
  });
  
  // Rule 4: Manglik Dosha (Mars in 1, 4, 7, 8, 12)
  const mars = planets.find(p => p.name === PlanetName.Mars);
  if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
    delayScore += 1;
  }
  
  // Rule 5: 7th Lord debilitated
  if (h7LordPos?.isDebilitated) {
    delayScore += 2;
  }
  
  // If score is 3 or more, strong indication of delayed or denied marriage
  return delayScore >= 3;
}

function checkCareerStruggle(kundli: KundliOutput, ageDecimal: number): boolean {
  if (ageDecimal < 22) return false;
  
  let struggleScore = 0;
  const planets = kundli.planets;
  
  const h10Lord = lordOfHouse(kundli, 10);
  const h10LordPos = planets.find(p => p.name === h10Lord);
  
  // Rule 1: 10th Lord in Dusthana
  if (h10LordPos && isDusthanaHouse(h10LordPos.house)) {
    struggleScore += 2;
  }
  
  // Rule 2: Malefics in 10th
  const malefics = [PlanetName.Saturn, PlanetName.Rahu, PlanetName.Ketu];
  planets.filter(p => p.house === 10).forEach(p => {
    if (malefics.includes(p.name)) struggleScore += 1;
  });
  
  // Rule 3: Current Dasha of Dusthana Lord
  const currentDasha = findBhuktiAtAge(kundli, ageDecimal);
  if (currentDasha) {
    const mahaLordPos = planets.find(p => p.name === currentDasha.maha.planet);
    const bhuktiLordPos = planets.find(p => p.name === currentDasha.bhukti);
    
    if (mahaLordPos && isDusthanaHouse(mahaLordPos.house)) struggleScore += 1;
    if (bhuktiLordPos && isDusthanaHouse(bhuktiLordPos.house)) struggleScore += 1;
  }
  
  return struggleScore >= 3;
}

function checkProgenyDelay(kundli: KundliOutput, ageDecimal: number): boolean {
  if (ageDecimal < 30) return false;
  
  let delayScore = 0;
  const planets = kundli.planets;
  
  const h5Lord = lordOfHouse(kundli, 5);
  const h5LordPos = planets.find(p => p.name === h5Lord);
  const jupiter = planets.find(p => p.name === PlanetName.Jupiter);
  
  // Rule 1: 5th Lord in Dusthana
  if (h5LordPos && isDusthanaHouse(h5LordPos.house)) {
    delayScore += 2;
  }
  
  // Rule 2: Malefics in 5th
  const malefics = [PlanetName.Saturn, PlanetName.Rahu, PlanetName.Ketu, PlanetName.Mars];
  planets.filter(p => p.house === 5).forEach(p => {
    if (malefics.includes(p.name)) delayScore += 1;
  });
  
  // Rule 3: Jupiter (Karaka) afflicted or debilitated
  if (jupiter?.isDebilitated) {
    delayScore += 1;
  }
  const planetsWithJupiter = planets.filter(p => p.house === jupiter?.house && p.name !== PlanetName.Jupiter);
  planetsWithJupiter.forEach(p => {
    if (malefics.includes(p.name)) delayScore += 1;
  });
  
  return delayScore >= 3;
}
