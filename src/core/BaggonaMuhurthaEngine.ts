import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";
import { getMoonPhase } from "./AstroMath";

export interface MuhurthaCriteria {
  isShubhaMasa: boolean;
  isShubhaTithi: boolean;
  isShubhaVara: boolean;
  isShubhaNakshatra: boolean;
  isShubhaYoga: boolean;
  isShubhaKarana: boolean;
  reasons: string[];
}

export interface MuhurthaResult {
  date: string;
  isMuhurtha: boolean;
  panchanga: any;
  criteria: MuhurthaCriteria;
  score: number;
}

const SHUBHA_MASA = ["Chaitra", "Vaishakha", "Jyeshtha", "Magha", "Phalguna", "Kartika", "Margashira"];
const SHUBHA_TITHI = ["Dvitiya", "Triteeya", "Panchami", "Saptami", "Dashami", "Ekadashi", "Trayodashi"];
const SHUBHA_VARA = ["Monday", "Wednesday", "Thursday", "Friday"];
const SHUBHA_NAKSHATRA = [
  "Rohini", "Mrigashira", "Magha", "Uttara Phalguni", 
  "Hasta", "Swati", "Anuradha", "Mula", 
  "Uttara Ashadha", "Uttara Bhadrapada", "Revati"
];
const ASHUBHA_YOGA = [
  "Vishkambha", "Atiganda", "Shula", "Ganda", 
  "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"
];

export const evaluateBaggonaMuhurtha = (dateStr: string, lat: number, lng: number): MuhurthaResult => {
  // Check morning at 08:00 AM as a standard time to evaluate the day
  const panchanga = calculateTraditionalBaggona(dateStr, "08:00", lat, lng);
  
  const criteria: MuhurthaCriteria = {
    isShubhaMasa: false,
    isShubhaTithi: false,
    isShubhaVara: false,
    isShubhaNakshatra: false,
    isShubhaYoga: true,
    isShubhaKarana: true,
    reasons: []
  };

  let score = 0;

  // 1. Masa Check
  if (SHUBHA_MASA.includes(panchanga.masa)) {
    criteria.isShubhaMasa = true;
    score += 20;
    criteria.reasons.push(`Shubha Masa: ${panchanga.masa}`);
  } else {
    criteria.reasons.push(`Avoid Masa: ${panchanga.masa}`);
  }

  // 2. Tithi Check
  if (SHUBHA_TITHI.includes(panchanga.tithi) && panchanga.tithi !== "Amavasya") {
    criteria.isShubhaTithi = true;
    score += 20;
    criteria.reasons.push(`Shubha Tithi: ${panchanga.tithi}`);
  } else {
    criteria.reasons.push(`Avoid Tithi: ${panchanga.tithi}`);
  }

  // 3. Vara Check
  if (SHUBHA_VARA.includes(panchanga.weekday)) {
    criteria.isShubhaVara = true;
    score += 15;
    criteria.reasons.push(`Shubha Vara: ${panchanga.weekday}`);
  } else {
    criteria.reasons.push(`Avoid Vara: ${panchanga.weekday}`);
  }

  // 4. Nakshatra Check
  if (SHUBHA_NAKSHATRA.includes(panchanga.moonNakshatra)) {
    criteria.isShubhaNakshatra = true;
    score += 25;
    criteria.reasons.push(`Shubha Nakshatra: ${panchanga.moonNakshatra}`);
  } else {
    criteria.reasons.push(`Avoid Nakshatra: ${panchanga.moonNakshatra}`);
  }

  // 5. Yoga Check
  if (ASHUBHA_YOGA.includes(panchanga.yoga)) {
    criteria.isShubhaYoga = false;
    score -= 10;
    criteria.reasons.push(`Ashubha Yoga: ${panchanga.yoga}`);
  } else {
    score += 10;
    criteria.reasons.push(`Shubha Yoga: ${panchanga.yoga}`);
  }

  // 6. Karana Check
  if (panchanga.karana === "Vishti") {
    criteria.isShubhaKarana = false;
    score -= 20;
    criteria.reasons.push(`Bhadra (Vishti) Karana present. Unfavorable.`);
  } else {
    score += 10;
    criteria.reasons.push(`Shubha Karana: ${panchanga.karana}`);
  }

  // Total possible is 100
  const isMuhurtha = score >= 75 && criteria.isShubhaTithi && criteria.isShubhaNakshatra && criteria.isShubhaKarana;

  return {
    date: dateStr,
    isMuhurtha,
    panchanga,
    criteria,
    score
  };
};

export const generateBaggonaMuhurthasForMonth = (year: number, month: number, lat: number, lng: number): MuhurthaResult[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const muhurthas: MuhurthaResult[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(month).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    
    const res = evaluateBaggonaMuhurtha(dateStr, lat, lng);
    if (res.isMuhurtha) {
      muhurthas.push(res);
    }
  }

  return muhurthas;
};

export const generateBaggonaMuhurthasForYear = (year: number, lat: number, lng: number): MuhurthaResult[] => {
  const muhurthas: MuhurthaResult[] = [];
  for (let month = 1; month <= 12; month++) {
    muhurthas.push(...generateBaggonaMuhurthasForMonth(year, month, lat, lng));
  }
  return muhurthas;
};
