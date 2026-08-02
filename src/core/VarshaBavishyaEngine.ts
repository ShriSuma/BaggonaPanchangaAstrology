import { siderealLongitudes } from "./EphemerisEngine";
import { RASHIS, type Rashi } from "./AstroTypes";

export type VarshaPrediction = {
  year: number;
  rashi: Rashi;
  guruHouse: number;
  shaniHouse: number;
  rahuHouse: number;
  ketuHouse: number;
  paragraphs: string[][];
};

/**
 * Calculates the Varsha Bavishya (Yearly Prediction) for a given year and Rashi.
 * It samples the planetary transits near the middle of the year (July 1st) 
 * as a proxy for the dominant planetary positions of that year.
 */
export const calculateVarshaBavishya = (year: number, rashiIndex: number): VarshaPrediction => {
  // Sample date: July 1st of the given year at 12:00 UTC
  const sampleDate = new Date(Date.UTC(year, 6, 1, 12, 0, 0));
  
  const pos = siderealLongitudes(sampleDate);
  
  const guruRashi = Math.floor(pos.jupiter / 30);
  const shaniRashi = Math.floor(pos.saturn / 30);
  const rahuRashi = Math.floor(pos.rahu / 30);
  const ketuRashi = Math.floor(pos.ketu / 30);
  
  const getHouse = (planetRashi: number, lagnaRashi: number) => ((planetRashi - lagnaRashi + 12) % 12) + 1;
  
  const guruHouse = getHouse(guruRashi, rashiIndex);
  const shaniHouse = getHouse(shaniRashi, rashiIndex);
  const rahuHouse = getHouse(rahuRashi, rashiIndex);
  const ketuHouse = getHouse(ketuRashi, rashiIndex);
  
  const paragraphs: string[][] = [];
  
  // Paragraph 1: Overview & Jupiter's primary effect
  paragraphs.push([`varsha.overview.rashi_${rashiIndex}`, `varsha.guru.${guruHouse}`]);
  
  // Paragraph 2: Career, Hard Work & Saturn's effect
  paragraphs.push([`varsha.career.intro`, `varsha.shani.${shaniHouse}`]);
  
  // Paragraph 3: Health, Unexpected Changes & Rahu/Ketu
  paragraphs.push([`varsha.health.intro`, `varsha.rahu.${rahuHouse}`, `varsha.ketu.${ketuHouse}`]);
  
  // Paragraph 4: Cautions & Remedies
  paragraphs.push([`varsha.remedy.guru_${guruHouse}`, `varsha.remedy.shani_${shaniHouse}`, `varsha.closing`]);

  return {
    year,
    rashi: RASHIS[rashiIndex],
    guruHouse,
    shaniHouse,
    rahuHouse,
    ketuHouse,
    paragraphs
  };
};
