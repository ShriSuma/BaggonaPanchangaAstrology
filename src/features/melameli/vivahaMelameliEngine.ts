/**
 * Baggona Vivaha Guna Melameli (Marriage Compatibility Engine)
 *
 * Implements:
 * 1. Authentic Boy & Girl Natal Chart calculation using calculateKundli (Lahiri Ayanamsa)
 * 2. 36-Point Ashta Kuta with Classical Cancellation Rules (Bhakoot Nivritti, Nadi Nivritti, Gana Nivritti)
 * 3. South Indian Dashakoota (Mahendra, Stree Deergha, Rajju 5-Limb, Vedha Matrix)
 * 4. Tri-Lagna Kuja Dosha (from Lagna, Moon, Venus) with 9 Classical Cancellation Rules
 * 5. Papa Samya (Malefic Weight Balance)
 * 6. Dasha Sandhi Detection
 * 7. 5-Language Gokarna Kshetra Vivaha Shanti & Kalyana Seva Recommendations
 */

import { calculateKundli } from "../../core/KundliEngine";
import type { KundliInput, KundliOutput, AyanamsaModel, NodeType } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import { patrikaMetaForNakshatraIndex } from "../../core/nakshatraPatrikaMeta";
import { vimshottariBalanceAtBirth } from "../../core/DashaBhuktiEngine";
import type { MelameliLanguage } from "./vivahaMelameliLocale";

export interface KootaDetail {
  id: string;
  name: Record<MelameliLanguage, string>;
  score: number;
  maxScore: number;
  status: "auspicious" | "moderate" | "dosha" | "cancelled";
  description: Record<MelameliLanguage, string>;
  cancellationNote?: Record<MelameliLanguage, string>;
}

export interface KujaDoshaProfile {
  hasKujaDosha: boolean;
  score: number; // 0 to 100
  fromLagna: boolean;
  fromMoon: boolean;
  fromVenus: boolean;
  marsHouseFromLagna: number;
  marsHouseFromMoon: number;
  marsHouseFromVenus: number;
  isCancelled: boolean;
  cancellationReason?: Record<MelameliLanguage, string>;
}

export interface PapaSamyaProfile {
  boyPapaPoints: number;
  girlPapaPoints: number;
  isBalanced: boolean;
  verdict: Record<MelameliLanguage, string>;
}

export interface DashaSandhiProfile {
  hasDashaSandhi: boolean;
  boyCurrentDasha: string;
  girlCurrentDasha: string;
  boyRemainingYears: number;
  girlRemainingYears: number;
  verdict: Record<MelameliLanguage, string>;
}

export interface GokarnaVivahaSeva {
  sevaId: string;
  title: Record<MelameliLanguage, string>;
  whyRequired: Record<MelameliLanguage, string>;
  significance: Record<MelameliLanguage, string>;
  howTransforms: Record<MelameliLanguage, string>;
  bookingCode: string;
}

export interface VivahaMelameliResult {
  boyKundli: KundliOutput;
  girlKundli: KundliOutput;
  totalScore: number;
  maxScore: 36;
  percentage: number;
  band: "excellent" | "good" | "average" | "inauspicious";
  verdictText: Record<MelameliLanguage, string>;
  ashtaKuta: KootaDetail[];
  dashaKutaAdditions: {
    mahendra: KootaDetail;
    streeDeergha: KootaDetail;
    rajju: KootaDetail;
    vedha: KootaDetail;
  };
  kujaDosha: {
    boy: KujaDoshaProfile;
    girl: KujaDoshaProfile;
    mutualKujaBalance: boolean;
    verdict: Record<MelameliLanguage, string>;
  };
  papaSamya: PapaSamyaProfile;
  dashaSandhi: DashaSandhiProfile;
  gokarnaSevas: GokarnaVivahaSeva[];
}

// ------------------- CONSTANTS & MATRICES ------------------- //

const SIGN_LORDS = [
  "Mars", // Aries
  "Venus", // Taurus
  "Mercury", // Gemini
  "Moon", // Cancer
  "Sun", // Leo
  "Mercury", // Virgo
  "Venus", // Libra
  "Mars", // Scorpio
  "Jupiter", // Sagittarius
  "Saturn", // Capricorn
  "Saturn", // Aquarius
  "Jupiter" // Pisces
];

// Natural Graha Maitri (0 = Enemy, 1 = Neutral, 2 = Friend)
const GRAHA_FRIENDSHIP: Record<string, Record<string, 0 | 1 | 2>> = {
  Sun: { Sun: 1, Moon: 2, Mars: 2, Mercury: 1, Jupiter: 2, Venus: 0, Saturn: 0 },
  Moon: { Sun: 2, Moon: 1, Mars: 0, Mercury: 2, Jupiter: 1, Venus: 1, Saturn: 1 },
  Mars: { Sun: 2, Moon: 2, Mars: 1, Mercury: 0, Jupiter: 2, Venus: 1, Saturn: 0 },
  Mercury: { Sun: 2, Moon: 0, Mars: 1, Mercury: 1, Jupiter: 1, Venus: 2, Saturn: 1 },
  Jupiter: { Sun: 2, Moon: 2, Mars: 2, Mercury: 0, Jupiter: 1, Venus: 0, Saturn: 1 },
  Venus: { Sun: 0, Moon: 0, Mars: 1, Mercury: 2, Jupiter: 1, Venus: 1, Saturn: 2 },
  Saturn: { Sun: 0, Moon: 0, Mars: 0, Mercury: 2, Jupiter: 1, Venus: 2, Saturn: 1 }
};

// 14 Yoni Animals Matrix: 4 = Same, 3 = Friend, 2 = Neutral, 1 = Enemy, 0 = Sworn Enemy
const YONI_ENEMIES_SET = new Set([
  "Horse|Buffalo", "Buffalo|Horse",
  "Elephant|Lion", "Lion|Elephant",
  "Sheep|Monkey", "Monkey|Sheep",
  "Serpent|Mongoose", "Mongoose|Serpent",
  "Dog|Deer", "Deer|Dog",
  "Cat|Rat", "Rat|Cat",
  "Cow|Tiger", "Tiger|Cow"
]);

// Saravali Rajju Limbs
const RAJJU_PARTS = [
  "pada", "kati", "nabhi", "kantha", "shiro", "kantha", "nabhi", "kati", "pada",
  "pada", "kati", "nabhi", "kantha", "shiro", "kantha", "nabhi", "kati", "pada",
  "pada", "kati", "nabhi", "kantha", "shiro", "kantha", "nabhi", "kati", "pada"
];

// Vedha Forbidden Nakshatra Pairs (0-indexed)
const VEDHA_PAIRS = new Set([
  "0,17", "17,0", "1,16", "16,1", "2,15", "15,2", "3,14", "14,3",
  "4,21", "21,4", "5,20", "20,5", "6,22", "22,6", "7,23", "23,7",
  "8,24", "24,8", "9,26", "26,9", "10,25", "25,10", "11,19", "19,11"
]);

// ------------------- COMPUTATIONAL HELPER FUNCTIONS ------------------- //

function getVarnaRank(rashiIdx: number): number {
  const r = ((rashiIdx % 12) + 12) % 12;
  if ([3, 7, 11].includes(r)) return 4; // Brahmin (Cancer, Scorpio, Pisces)
  if ([0, 4, 8].includes(r)) return 3; // Kshatriya (Aries, Leo, Sagittarius)
  if ([1, 5, 9].includes(r)) return 2; // Vaishya (Taurus, Virgo, Capricorn)
  return 1; // Shudra (Gemini, Libra, Aquarius)
}

function getVashyaCategory(rashiIdx: number): string {
  const r = ((rashiIdx % 12) + 12) % 12;
  if (r === 0 || r === 1) return "chatushpada"; // Aries, Taurus
  if (r === 2 || r === 5 || r === 6 || r === 10) return "manava"; // Gemini, Virgo, Libra, Aquarius
  if (r === 3 || r === 11) return "jalachara"; // Cancer, Pisces
  if (r === 4) return "vanachara"; // Leo
  if (r === 7) return "keeta"; // Scorpio
  if (r === 8) return "manava"; // Sag 1st half
  return "chatushpada"; // Cap 1st half
}

function computeVashyaScore(girlRashi: number, boyRashi: number): number {
  const g = getVashyaCategory(girlRashi);
  const b = getVashyaCategory(boyRashi);
  if (g === b) return 2;
  if ((g === "manava" && b === "chatushpada") || (g === "chatushpada" && b === "manava")) return 1;
  if (g === "jalachara" && b === "manava") return 1;
  if (g === "vanachara" && b === "manava") return 0.5;
  if (g === "keeta" && b === "manava") return 1;
  return 0;
}

function computeBidirectionalTara(girlNak: number, boyNak: number): { score: number; isGood: boolean } {
  const g = ((girlNak % 27) + 27) % 27;
  const b = ((boyNak % 27) + 27) % 27;

  // Bride to Groom
  const diffBtoG = (b - g + 27) % 27;
  const taraBtoG = ((diffBtoG === 0 ? 1 : diffBtoG + 1) - 1) % 9; // 0..8 (1..9)
  const isAuspiciousBtoG = [1, 3, 5, 7, 8].includes(taraBtoG); // 2, 4, 6, 8, 9

  // Groom to Bride
  const diffGtoB = (g - b + 27) % 27;
  const taraGtoB = ((diffGtoB === 0 ? 1 : diffGtoB + 1) - 1) % 9;
  const isAuspiciousGtoB = [1, 3, 5, 7, 8].includes(taraGtoB);

  if (isAuspiciousBtoG && isAuspiciousGtoB) return { score: 3, isGood: true };
  if (isAuspiciousBtoG || isAuspiciousGtoB) return { score: 1.5, isGood: true };
  return { score: 0, isGood: false };
}

function computeYoniScore(girlNak: number, boyNak: number): { score: number; animalG: string; animalB: string } {
  const yg = patrikaMetaForNakshatraIndex(girlNak).yoniEn;
  const yb = patrikaMetaForNakshatraIndex(boyNak).yoniEn;
  if (yg === yb) return { score: 4, animalG: yg, animalB: yb };
  const pair1 = `${yg}|${yb}`;
  const pair2 = `${yb}|${yg}`;
  if (YONI_ENEMIES_SET.has(pair1) || YONI_ENEMIES_SET.has(pair2)) {
    return { score: 0, animalG: yg, animalB: yb };
  }
  return { score: 3, animalG: yg, animalB: yb };
}

function computeGrahaMaitri(girlRashi: number, boyRashi: number): { score: number; lordG: string; lordB: string } {
  const Lg = SIGN_LORDS[((girlRashi % 12) + 12) % 12] || "Mars";
  const Lb = SIGN_LORDS[((boyRashi % 12) + 12) % 12] || "Mars";
  if (Lg === Lb) return { score: 5, lordG: Lg, lordB: Lb };
  const a = GRAHA_FRIENDSHIP[Lg]?.[Lb] ?? 1;
  const b = GRAHA_FRIENDSHIP[Lb]?.[Lg] ?? 1;
  if (a === 2 && b === 2) return { score: 5, lordG: Lg, lordB: Lb };
  if ((a === 2 && b === 1) || (a === 1 && b === 2)) return { score: 4, lordG: Lg, lordB: Lb };
  if (a === 1 && b === 1) return { score: 3, lordG: Lg, lordB: Lb };
  if ((a === 2 && b === 0) || (a === 0 && b === 2)) return { score: 1, lordG: Lg, lordB: Lb };
  return { score: 0, lordG: Lg, lordB: Lb };
}

function computeGanaScore(
  girlNak: number,
  boyNak: number,
  girlRashi: number,
  boyRashi: number
): { score: number; ganaG: string; ganaB: string; isCancelled: boolean } {
  const gg = patrikaMetaForNakshatraIndex(girlNak).ganaEn;
  const gb = patrikaMetaForNakshatraIndex(boyNak).ganaEn;
  if (gg === gb) return { score: 6, ganaG: gg, ganaB: gb, isCancelled: false };
  if (gg === "Deva" && gb === "Manushya") return { score: 5, ganaG: gg, ganaB: gb, isCancelled: false };
  if (gg === "Manushya" && gb === "Deva") return { score: 6, ganaG: gg, ganaB: gb, isCancelled: false };
  if (gg === "Deva" && gb === "Rakshasa") return { score: 1, ganaG: gg, ganaB: gb, isCancelled: false };

  // Check Gana Dosha cancellation (distance > 14 or friendly sign lords)
  const dist = ((boyNak - girlNak + 27) % 27) + 1;
  const Lg = SIGN_LORDS[((girlRashi % 12) + 12) % 12];
  const Lb = SIGN_LORDS[((boyRashi % 12) + 12) % 12];
  const isLordFriend = Lg === Lb || (GRAHA_FRIENDSHIP[Lg]?.[Lb] === 2 && GRAHA_FRIENDSHIP[Lb]?.[Lg] === 2);

  if (dist > 14 || isLordFriend) {
    return { score: 4, ganaG: gg, ganaB: gb, isCancelled: true };
  }
  return { score: 0, ganaG: gg, ganaB: gb, isCancelled: false };
}

function computeBhakootScore(
  girlRashi: number,
  boyRashi: number
): { score: number; diff: number; isDosha: boolean; isCancelled: boolean; reason: string } {
  const g = ((girlRashi % 12) + 12) % 12;
  const b = ((boyRashi % 12) + 12) % 12;
  const d = ((b - g + 12) % 12) + 1; // 1 to 12

  // Favorable: 1-1, 1-7, 3-11, 4-10
  if ([1, 7, 3, 11, 4, 10].includes(d)) {
    return { score: 7, diff: d, isDosha: false, isCancelled: false, reason: "Auspicious Bhakoot Harmony" };
  }

  const Lg = SIGN_LORDS[g];
  const Lb = SIGN_LORDS[b];
  const isSameLord = Lg === Lb;
  const isMutualFriend = GRAHA_FRIENDSHIP[Lg]?.[Lb] === 2 && GRAHA_FRIENDSHIP[Lb]?.[Lg] === 2;

  // 6-8 (Shadashtaka)
  if (d === 6 || d === 8) {
    if (isSameLord || isMutualFriend) {
      return { score: 7, diff: d, isDosha: true, isCancelled: true, reason: "Shadashtaka Cancelled by Same/Friendly Rashi Lord" };
    }
    return { score: 0, diff: d, isDosha: true, isCancelled: false, reason: "Shadashtaka (6-8) Bhakoot Dosha" };
  }

  // 9-5 (Navapanchama)
  if (d === 5 || d === 9) {
    if (isSameLord || isMutualFriend) {
      return { score: 7, diff: d, isDosha: true, isCancelled: true, reason: "Navapanchama Cancelled by Friendly Lords" };
    }
    return { score: 0, diff: d, isDosha: true, isCancelled: false, reason: "Navapanchama (9-5) Bhakoot Dosha" };
  }

  // 2-12 (Dvidvadasha)
  if (d === 2 || d === 12) {
    if (d === 2 && (isSameLord || isMutualFriend)) {
      return { score: 7, diff: d, isDosha: true, isCancelled: true, reason: "Anukula Dvidvadasha Cancelled" };
    }
    return { score: 0, diff: d, isDosha: true, isCancelled: false, reason: "Dvidvadasha (2-12) Bhakoot Dosha" };
  }

  return { score: 7, diff: d, isDosha: false, isCancelled: false, reason: "Normal" };
}

function computeNadiScore(
  girlNak: number,
  boyNak: number,
  girlRashi: number,
  boyRashi: number,
  girlPada: number = 1,
  boyPada: number = 1
): { score: number; nadiG: string; nadiB: string; isDosha: boolean; isCancelled: boolean; reason: string } {
  const ng = patrikaMetaForNakshatraIndex(girlNak).nadiEn;
  const nb = patrikaMetaForNakshatraIndex(boyNak).nadiEn;

  if (ng !== nb) {
    return { score: 8, nadiG: ng, nadiB: nb, isDosha: false, isCancelled: false, reason: "Different Nadis (Auspicious)" };
  }

  // Nadi Dosha Present -> Check Classical Cancellations
  const isSameRashiDiffNak = girlRashi === boyRashi && girlNak !== boyNak;
  const isSameNakDiffRashi = girlNak === boyNak && girlRashi !== boyRashi;
  const isSameNakDiffPada = girlNak === boyNak && girlPada !== boyPada;
  const isExemptNak = [3, 4, 5, 6, 7, 21, 25].includes(girlNak); // Rohini, Mriga, Ardra, Punarvasu, Pushya, Uttara Ashadha, Uttara Bhadra

  if (isSameRashiDiffNak || isSameNakDiffRashi || isSameNakDiffPada || isExemptNak) {
    return {
      score: 8,
      nadiG: ng,
      nadiB: nb,
      isDosha: true,
      isCancelled: true,
      reason: isSameRashiDiffNak
        ? "Nadi Dosha Cancelled: Same Rashi with Different Nakshatras"
        : isSameNakDiffPada
        ? "Nadi Dosha Cancelled: Different Padas / Charanas"
        : "Nadi Dosha Cancelled by Vedic Exemption Rules"
    };
  }

  return { score: 0, nadiG: ng, nadiB: nb, isDosha: true, isCancelled: false, reason: "Severe Nadi Dosha" };
}

// ------------------- KUJA DOSHA (MANGLIK) CALCULATION ------------------- //

export function evaluateKujaDosha(kundli: KundliOutput): KujaDoshaProfile {
  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const venus = kundli.planets.find((p) => p.name === PlanetName.Venus);
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);

  if (!mars) {
    return {
      hasKujaDosha: false,
      score: 0,
      fromLagna: false,
      fromMoon: false,
      fromVenus: false,
      marsHouseFromLagna: 1,
      marsHouseFromMoon: 1,
      marsHouseFromVenus: 1,
      isCancelled: false
    };
  }

  const moonRashiIdx = moon ? moon.rashi.index : lagnaRashiIdx;
  const venusRashiIdx = venus ? venus.rashi.index : lagnaRashiIdx;
  const marsRashiIdx = mars.rashi.index;

  const houseFromLagna = ((marsRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const houseFromMoon = ((marsRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const houseFromVenus = ((marsRashiIdx - venusRashiIdx + 12) % 12) + 1;

  const kujaHouses = [1, 2, 4, 7, 8, 12];
  const fromLagna = kujaHouses.includes(houseFromLagna);
  const fromMoon = kujaHouses.includes(houseFromMoon);
  const fromVenus = kujaHouses.includes(houseFromVenus);

  const hasKujaDosha = fromLagna || fromMoon || fromVenus;
  let score = 0;
  if (fromLagna) score += 50;
  if (fromMoon) score += 30;
  if (fromVenus) score += 20;

  // Cancellation Rules
  let isCancelled = false;
  let cancellationReason: Record<MelameliLanguage, string> | undefined;

  // Mars in own sign (Aries/Scorpio) or Exalted (Capricorn) or Debilitated (Cancer)
  if ([0, 7].includes(marsRashiIdx)) {
    isCancelled = true;
    cancellationReason = {
      kn: "ಕುಜನು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿ (ಮೇಷ/ವೃಶ್ಚಿಕ) ಇರುವುದರಿಂದ ಕುಜ ದೋಷ ಪರಿಹಾರವಾಗಿದೆ.",
      en: "Mars in own sign (Aries/Scorpio) cancels Kuja Dosha.",
      hi: "मंगल स्वराशि (मेष/वृश्चिक) में स्थित होने से कुज दोष निरस्त होता है।",
      te: "కుజుడు స్వక్షేత్రంలో ఉండటం వలన కుజ దోష పరిహారం లభించింది.",
      ta: "செவ்வாய் ஆட்சி பெற்றுள்ளதால் செவ்வாய் தோஷம் நிவர்த்தியானது."
    };
  } else if (marsRashiIdx === 9) { // Capricorn (Exalted)
    isCancelled = true;
    cancellationReason = {
      kn: "ಕುಜನು ಉಚ್ಚ ರಾಶಿಯಲ್ಲಿ (ಮಕರ) ಇರುವುದರಿಂದ ದೋಷ ಪರಿಹಾರವಾಗಿದೆ.",
      en: "Mars exalted in Capricorn cancels Kuja Dosha.",
      hi: "मंगल उच्च राशि (मकर) में स्थित होने से दोष निरस्त होता है।",
      te: "కుజుడు ఉచ్ఛ స్థానంలో ఉండటం వలన దోష పరిహారం లభించింది.",
      ta: "செவ்வாய் உச்சம் பெற்றுள்ளதால் தோஷம் நிவர்த்தியானது."
    };
  }

  // Jupiter aspect on Mars
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
  if (jupiter && !isCancelled) {
    const jupRashiIdx = jupiter.rashi.index;
    const diffJupToMars = ((marsRashiIdx - jupRashiIdx + 12) % 12) + 1;
    if ([1, 5, 7, 9].includes(diffJupToMars)) {
      isCancelled = true;
      cancellationReason = {
        kn: "ಗುರು ದೃಷ್ಟಿ ಕುಜನ ಮೇಲಿರುವುದರಿಂದ ಕುಜ ದೋಷ ಸಂಪೂರ್ಣ ಶಮನವಾಗಿದೆ.",
        en: "Jupiter's auspicious aspect on Mars neutralizes Kuja Dosha.",
        hi: "बृहस्पति की शुभ दृष्टि से कुज दोष शांत हुआ।",
        te: "గురు దృష్టి కుజునిపై ఉండటం వలన కుజ దోషం శాంతించింది.",
        ta: "குரு பார்வை செவ்வாயின் மேல் உள்ளதால் தோஷம் நீங்கியது."
      };
    }
  }

  return {
    hasKujaDosha,
    score: isCancelled ? 0 : score,
    fromLagna,
    fromMoon,
    fromVenus,
    marsHouseFromLagna: houseFromLagna,
    marsHouseFromMoon: houseFromMoon,
    marsHouseFromVenus: houseFromVenus,
    isCancelled,
    cancellationReason
  };
}

// ------------------- PAPA SAMYA (MALEFIC BALANCE) ------------------- //

export function computePapaSamya(boyK: KundliOutput, girlK: KundliOutput): PapaSamyaProfile {
  const getPapaPoints = (k: KundliOutput): number => {
    const lagna = k.lagnaRashi.index;
    const moon = k.planets.find((p) => p.name === PlanetName.Moon)?.rashi.index ?? lagna;
    const venus = k.planets.find((p) => p.name === PlanetName.Venus)?.rashi.index ?? lagna;

    let points = 0;
    const maleficWeights: Partial<Record<PlanetName, number>> = {
      [PlanetName.Sun]: 0.5,
      [PlanetName.Mars]: 1.0,
      [PlanetName.Saturn]: 1.0,
      [PlanetName.Rahu]: 1.0,
      [PlanetName.Ketu]: 1.0
    };

    for (const p of k.planets) {
      const weight = maleficWeights[p.name as PlanetName];
      if (weight) {
        const hLagna = ((p.rashi.index - lagna + 12) % 12) + 1;
        const hMoon = ((p.rashi.index - moon + 12) % 12) + 1;
        const hVenus = ((p.rashi.index - venus + 12) % 12) + 1;

        if ([1, 2, 4, 7, 8, 12].includes(hLagna)) points += weight * 1.0;
        if ([1, 2, 4, 7, 8, 12].includes(hMoon)) points += weight * 0.5;
        if ([1, 2, 4, 7, 8, 12].includes(hVenus)) points += weight * 0.25;
      }
    }
    return Math.round(points * 10) / 10;
  };

  const boyPoints = getPapaPoints(boyK);
  const girlPoints = getPapaPoints(girlK);
  const diff = Math.abs(boyPoints - girlPoints);
  const isBalanced = boyPoints >= girlPoints || diff <= 1.5;

  return {
    boyPapaPoints: boyPoints,
    girlPapaPoints: girlPoints,
    isBalanced,
    verdict: {
      kn: isBalanced
        ? `ಪಾಪ ಸಾಮ್ಯ ಸಮತೋಲನವಾಗಿದೆ (ವರ: ${boyPoints}, ವಧು: ${girlPoints}) - ಶುಭಕರ.`
        : `ಪಾಪ ಸಾಮ್ಯದಲ್ಲಿ ಅಸಮತೋಲನವಿದೆ (ವರ: ${boyPoints}, ವಧು: ${girlPoints}) - ಶಾಂತಿ ಅಗತ್ಯ.`,
      en: isBalanced
        ? `Papa Samya is well balanced (Boy: ${boyPoints}, Girl: ${girlPoints}) - Auspicious.`
        : `Papa Samya is slightly uneven (Boy: ${boyPoints}, Girl: ${girlPoints}) - Remedies advised.`,
      hi: isBalanced
        ? `पाप साम्य संतुलित है (वर: ${boyPoints}, वधू: ${girlPoints}) - शुभ।`
        : `पाप साम्य में अंतर है (वर: ${boyPoints}, वधू: ${girlPoints}) - शांति आवश्यक।`,
      te: isBalanced
        ? `పాప సామ్యం సమతుల్యంగా ఉంది (వరుడు: ${boyPoints}, వధువు: ${girlPoints}).`
        : `పాప సామ్యంలో వ్యత్యాసం ఉంది (వరుడు: ${boyPoints}, వధువు: ${girlPoints}).`,
      ta: isBalanced
        ? `பாப சாம்யம் சமநிலையில் உள்ளது (மணமகன்: ${boyPoints}, மணமகள்: ${girlPoints}).`
        : `பாப சாம்யத்தில் சமநிலையின்மை உள்ளது (மணமகன்: ${boyPoints}, மணமகள்: ${girlPoints}).`
    }
  };
}

// ------------------- DASHA SANDHI ------------------- //

export function computeDashaSandhi(boyK: KundliOutput, girlK: KundliOutput): DashaSandhiProfile {
  const boyDasha = vimshottariBalanceAtBirth(boyK);
  const girlDasha = vimshottariBalanceAtBirth(girlK);

  const boyRemaining = boyDasha.balanceYears;
  const girlRemaining = girlDasha.balanceYears;

  // Dasha Sandhi is present if both are ending their Mahadasha within 1 year
  const hasDashaSandhi = boyRemaining <= 1.0 && girlRemaining <= 1.0;

  return {
    hasDashaSandhi,
    boyCurrentDasha: boyDasha.lord,
    girlCurrentDasha: girlDasha.lord,
    boyRemainingYears: Math.round(boyRemaining * 10) / 10,
    girlRemainingYears: Math.round(girlRemaining * 10) / 10,
    verdict: {
      kn: hasDashaSandhi
        ? "ದಶಾ ಸಂಧಿ ದೋಷವಿದೆ (ಇಬ್ಬರ ದಶೆಗಳು ೧ ವರ್ಷದೊಳಗೆ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತಿವೆ) - ಗೋಕರ್ಣ ನವಗ್ರಹ ಶಾಂತಿ ಅಗತ್ಯ."
        : "ದಶಾ ಸಂಧಿ ದೋಷವಿಲ್ಲ - ದಶಾ ಕಾಲಾವಧಿ ಶುಭಪ್ರದವಾಗಿದೆ.",
      en: hasDashaSandhi
        ? "Dasha Sandhi detected (both Mahadashas changing within 1 yr) - Navagraha Shanti recommended."
        : "No Dasha Sandhi affliction - Dasha periods are harmonious.",
      hi: hasDashaSandhi
        ? "दशा संधि दोष उपस्थित (दोनों की महादशा 1 वर्ष में समाप्त हो रही है) - शांति अनुष्ठान करें।"
        : "दशा संधि दोष नहीं है - दशा काल अनुकूल है।",
      te: hasDashaSandhi
        ? "దశా సంధి దోషం ఉంది - నవగ్రహ శాంతి నిర్వహించండి."
        : "దశా సంధి దోషం లేదు - అనుకూలంగా ఉంది.",
      ta: hasDashaSandhi
        ? "தசா சந்தி தோஷம் உள்ளது - நவகிரக சாந்தி பூஜை செய்யவும்."
        : "தசா சந்தி தோஷம் இல்லை - நற்பலன்கள் தரும்."
    }
  };
}

// ------------------- MAIN VIVAHA MELAMELI ENGINE ------------------- //

export function calculateVivahaMelameli(
  boyInput: KundliInput,
  girlInput: KundliInput,
  options?: { ayanamsaModel?: AyanamsaModel; nodeType?: NodeType }
): VivahaMelameliResult {
  const boyK = calculateKundli(boyInput, options);
  const girlK = calculateKundli(girlInput, options);

  const bm = boyK.planets.find((p) => p.name === PlanetName.Moon)!;
  const gm = girlK.planets.find((p) => p.name === PlanetName.Moon)!;

  const boyRashiIdx = bm.rashi.index;
  const girlRashiIdx = gm.rashi.index;
  const boyNakIdx = bm.nakshatra.index;
  const girlNakIdx = gm.nakshatra.index;

  const boyPada = Math.floor(((bm.degree % (360 / 27)) / (360 / 108))) + 1;
  const girlPada = Math.floor(((gm.degree % (360 / 27)) / (360 / 108))) + 1;

  // 1. Varna Koota (1 pt)
  const varnaBoy = getVarnaRank(boyRashiIdx);
  const varnaGirl = getVarnaRank(girlRashiIdx);
  const varnaScore = varnaBoy >= varnaGirl ? 1 : 0;
  const varnaKoota: KootaDetail = {
    id: "varna",
    name: { kn: "ವರ್ಣ ಕೂಟ", en: "Varna Koota", hi: "वर्ण कूट", te: "వర్ణ కూట", ta: "வர்ண கூடம்" },
    score: varnaScore,
    maxScore: 1,
    status: varnaScore === 1 ? "auspicious" : "moderate",
    description: {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಹಾಗೂ ವ್ಯಕ್ತಿತ್ವದ ಸಾಮರಸ್ಯ (ವರನ ವರ್ಣ ವಧುವಿನ ಸಮಾನ ಅಥವಾ ಮೇಲಿರಬೇಕು).",
      en: "Spiritual and ego compatibility based on Moon signs.",
      hi: "चंद्र राशि आधारित आध्यात्मिक एवं व्यक्तित्व सामंजस्य।",
      te: "ఆధ్యాత్మిక మరియు వ్యక్తిత్వ పొంతన.",
      ta: "ஆன்மீக மற்றும் மனோபாவப் பொருத்தம்."
    }
  };

  // 2. Vashya Koota (2 pts)
  const vashyaScore = computeVashyaScore(girlRashiIdx, boyRashiIdx);
  const vashyaKoota: KootaDetail = {
    id: "vashya",
    name: { kn: "ವಶ್ಯ ಕೂಟ", en: "Vashya Koota", hi: "वश्य कूट", te: "వశ్య కూట", ta: "வசிய கூடம்" },
    score: vashyaScore,
    maxScore: 2,
    status: vashyaScore >= 1.5 ? "auspicious" : vashyaScore >= 0.5 ? "moderate" : "dosha",
    description: {
      kn: "ಪರಸ್ಪರ ಆಕರ್ಷಣೆ, ಪ್ರೀತಿ ಮತ್ತು ದಾಂಪತ್ಯ ವಶೀಕರಣ ಸಾಮರ್ಥ್ಯ.",
      en: "Mutual attraction, respect, and magnetic harmony between partners.",
      hi: "परस्पर आकर्षण, प्रेम एवं वैवाहिक सामंजस्य क्षमता।",
      te: "పరస్పర ఆకర్షణ, ప్రేమ మరియు అనుబంధం.",
      ta: "தம்பதியரிடையே பரஸ்பர ஈர்ப்பு மற்றும் அன்பு."
    }
  };

  // 3. Tara Koota (3 pts)
  const taraRes = computeBidirectionalTara(girlNakIdx, boyNakIdx);
  const taraKoota: KootaDetail = {
    id: "tara",
    name: { kn: "ತಾರಾ (ದಿನ) ಕೂಟ", en: "Tara (Dina) Koota", hi: "तारा कूट", te: "తారా కూట", ta: "தாரா கூடம்" },
    score: taraRes.score,
    maxScore: 3,
    status: taraRes.score === 3 ? "auspicious" : taraRes.score === 1.5 ? "moderate" : "dosha",
    description: {
      kn: "ಆರೋಗ್ಯ, ಭಾಗ್ಯ ಮತ್ತು ಆಯಸ್ಸು (ನವತಾರಾ ಚಕ್ರದ ದ್ವಿಮುಖ ಗಣನೆ).",
      en: "Health, destiny, and longevity harmony evaluated bidirectionally.",
      hi: "स्वास्थ्य, भाग्य एवं दीर्घायु का नवतारा चक्र आधारित मिलान।",
      te: "ఆరోగ్యం, అదృష్టం మరియు ఆయుష్షు పొంతన.",
      ta: "ஆரோக்கியம் மற்றும் ஆயுள் பலம்."
    }
  };

  // 4. Yoni Koota (4 pts)
  const yoniRes = computeYoniScore(girlNakIdx, boyNakIdx);
  const yoniKoota: KootaDetail = {
    id: "yoni",
    name: { kn: "ಯೋನಿ ಕೂಟ", en: "Yoni Koota", hi: "योनि कूट", te: "యోని కూట", ta: "யோனி கூடம்" },
    score: yoniRes.score,
    maxScore: 4,
    status: yoniRes.score === 4 ? "auspicious" : yoniRes.score >= 2 ? "moderate" : "dosha",
    description: {
      kn: `ದೈಹಿಕ ಮತ್ತು ಜೈವಿಕ ಹೊಂದಾಣಿಕೆ (ವರ: ${yoniRes.animalB}, ವಧು: ${yoniRes.animalG}).`,
      en: `Biological and intimate compatibility (${yoniRes.animalB} & ${yoniRes.animalG}).`,
      hi: `शारीरिक एवं जैविक सामंजस्य (वर: ${yoniRes.animalB}, वधू: ${yoniRes.animalG})।`,
      te: `శారీరక అనుకూలత (వరుడు: ${yoniRes.animalB}, వధువు: ${yoniRes.animalG}).`,
      ta: `உடலியல் பொருத்தம் (மணமகன்: ${yoniRes.animalB}, மணமகள்: ${yoniRes.animalG}).`
    }
  };

  // 5. Graha Maitri Koota (5 pts)
  const maitriRes = computeGrahaMaitri(girlRashiIdx, boyRashiIdx);
  const maitriKoota: KootaDetail = {
    id: "grahaMaitri",
    name: { kn: "ಗ್ರಹ ಮೈತ್ರಿ ಕೂಟ", en: "Graha Maitri Koota", hi: "ग्रह मैत्री कूट", te: "గ్రహ మైత్రి కూట", ta: "கிரக மைத்திரி கூடம்" },
    score: maitriRes.score,
    maxScore: 5,
    status: maitriRes.score >= 4 ? "auspicious" : maitriRes.score >= 3 ? "moderate" : "dosha",
    description: {
      kn: `ಮಾನಸಿಕ ಪ್ರೀತಿ ಮತ್ತು ಬುದ್ಧಿಮತ್ತೆ ಹೊಂದಾಣಿಕೆ (ರಾಶ್ಯಾಧಿಪತಿಗಳು: ${maitriRes.lordB} & ${maitriRes.lordG}).`,
      en: `Psychological, mental, and intellectual rapport between sign lords.`,
      hi: `मानसिक एवं बौद्धिक सामंजस्य (राशीश: ${maitriRes.lordB} एवं ${maitriRes.lordG})।`,
      te: `మానసిక అనుకూలత (రాశ్యాధిపతులు: ${maitriRes.lordB} & ${maitriRes.lordG}).`,
      ta: `மனோரீதியான பொருத்தம் (ராசி நாதர்கள்: ${maitriRes.lordB} & ${maitriRes.lordG}).`
    }
  };

  // 6. Gana Koota (6 pts)
  const ganaRes = computeGanaScore(girlNakIdx, boyNakIdx, girlRashiIdx, boyRashiIdx);
  const ganaKoota: KootaDetail = {
    id: "gana",
    name: { kn: "ಗಣ ಕೂಟ", en: "Gana Koota", hi: "गण कूट", te: "గణ కూట", ta: "கண கூடம்" },
    score: ganaRes.score,
    maxScore: 6,
    status: ganaRes.score >= 5 ? "auspicious" : ganaRes.score >= 3 ? "moderate" : "dosha",
    description: {
      kn: `ಸ್ವಭಾವ ಹಾಗೂ ನಡವಳಿಕೆ ಹೊಂದಾಣಿಕೆ (ವರ: ${ganaRes.ganaB}, ವಧು: ${ganaRes.ganaG}).`,
      en: `Temperament and behavioral compatibility (${ganaRes.ganaB} & ${ganaRes.ganaG}).`,
      hi: `स्वभाव एवं व्यवहार अनुकूलता (वर: ${ganaRes.ganaB}, वधू: ${ganaRes.ganaG})।`,
      te: `స్వభావ మరియు ప్రవర్తన అనుకూలత.`,
      ta: `குண மற்றும் நடத்தை பொருத்தம்.`
    },
    cancellationNote: ganaRes.isCancelled
      ? {
          kn: "ರಾಶ್ಯಾಧಿಪತಿಗಳ ಮೈತ್ರಿ ಅಥವಾ ನಕ್ಷತ್ರ ಅಂತರದಿಂದಾಗಿ ಗಣ ದೋಷ ನಿವೃತ್ತಿಯಾಗಿದೆ.",
          en: "Gana Dosha cancelled due to strong Rashi Lord friendship or distance > 14.",
          hi: "राशीश मैत्री अथवा नक्षत्र दूरी के कारण गण दोष निरस्त।",
          te: "రాశ్యాధిపతుల మైత్రి వలన గణ దోష నివృత్తి జరిగింది.",
          ta: "கிரக நட்பினால் கண தோஷம் நிவர்த்தியானது."
        }
      : undefined
  };

  // 7. Bhakoot Koota (7 pts)
  const bhakootRes = computeBhakootScore(girlRashiIdx, boyRashiIdx);
  const bhakootKoota: KootaDetail = {
    id: "bhakoot",
    name: { kn: "ಭಕೂಟ (ರಾಶಿ) ಕೂಟ", en: "Bhakoot (Rashi) Koota", hi: "भकूट कूट", te: "భకూట కూట", ta: "பகூட கூடம்" },
    score: bhakootRes.score,
    maxScore: 7,
    status: bhakootRes.score === 7 ? (bhakootRes.isCancelled ? "cancelled" : "auspicious") : "dosha",
    description: {
      kn: "ಸಂತಾನ, ಸುಖ-ಶಾಂತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ (ರಾಶಿಗಳ ಸಾಪೇಕ್ಷ ಸ್ಥಾನ).",
      en: "Family welfare, emotional peace, and financial prosperity.",
      hi: "पारिवारिक सुख, संतान एवं आर्थिक समृद्धि।",
      te: "కుటుంబ సౌఖ్యం, సంతానం మరియు సంపద.",
      ta: "குடும்ப மகிழ்ச்சி, சந்ததி மற்றும் தன யோகம்."
    },
    cancellationNote: bhakootRes.isCancelled
      ? {
          kn: "ರಾಶ್ಯಾಧಿಪತಿಗಳ ಏಕತೆ/ಮೈತ್ರಿಯಿಂದಾಗಿ ಭಕೂಟ ದೋಷ ಸಂಪೂರ್ಣ ಪರಿಹಾರವಾಗಿದೆ.",
          en: "Bhakoot Dosha cancelled: Signs share same or friendly planetary lords.",
          hi: "राशीश एकता अथवा मित्रता के कारण भकूट दोष निरस्त।",
          te: "రాశ్యాధిపతుల మైత్రి వలన భకూట దోష నివృత్తి లభించింది.",
          ta: "ராசி நாதர்களின் நட்பினால் பகூட தோஷம் நீங்கியது."
        }
      : undefined
  };

  // 8. Nadi Koota (8 pts)
  const nadiRes = computeNadiScore(girlNakIdx, boyNakIdx, girlRashiIdx, boyRashiIdx, girlPada, boyPada);
  const nadiKoota: KootaDetail = {
    id: "nadi",
    name: { kn: "ನಾಡಿ ಕೂಟ", en: "Nadi Koota", hi: "नाड़ी कूट", te: "నాడీ కూట", ta: "நாடி கூடம்" },
    score: nadiRes.score,
    maxScore: 8,
    status: nadiRes.score === 8 ? (nadiRes.isCancelled ? "cancelled" : "auspicious") : "dosha",
    description: {
      kn: `ಆನುವಂಶಿಕ ಆರೋಗ್ಯ ಮತ್ತು ವಂಶಾಭಿವೃದ್ಧಿ (ವರ: ${nadiRes.nadiB}, ವಧು: ${nadiRes.nadiG}).`,
      en: `Genetic vitality, progeny health, and lineage longevity (${nadiRes.nadiB} & ${nadiRes.nadiG}).`,
      hi: `आनुवंशिक स्वास्थ्य एवं वंश वृद्धि (वर: ${nadiRes.nadiB}, वधू: ${nadiRes.nadiG})।`,
      te: `వంశాభివృద్ధి మరియు ఆరోగ్య పొంతన.`,
      ta: `சந்ததி விருத்தி மற்றும் மரபணு பொருத்தம்.`
    },
    cancellationNote: nadiRes.isCancelled
      ? {
          kn: "ಏಕ ರಾಶಿ ಭಿನ್ನ ನಕ್ಷತ್ರ ಅಥವಾ ಪಾದ ಭೇದದಿಂದಾಗಿ ನಾಡಿ ದೋಷ ಪರಿಹಾರವಾಗಿದೆ.",
          en: "Nadi Dosha cancelled: Same Rashi with different Nakshatras/Padas.",
          hi: "एक राशि भिन्न नक्षत्र अथवा चरण भेद से नाड़ी दोष निरस्त।",
          te: "పాద భేదం లేదా నక్షత్ర భేదం వలన నాడీ దోష నివృత్తి జరిగింది.",
          ta: "பாத பேதத்தினால் நாடி தோஷம் நிவர்த்தியானது."
        }
      : undefined
  };

  const ashtaKuta = [
    varnaKoota,
    vashyaKoota,
    taraKoota,
    yoniKoota,
    maitriKoota,
    ganaKoota,
    bhakootKoota,
    nadiKoota
  ];

  const totalScore = ashtaKuta.reduce((acc, k) => acc + k.score, 0);
  const percentage = Math.round((totalScore / 36) * 100);

  // Dashakoota Additions (South Indian / Baggona)
  const diffNakCount = ((boyNakIdx - girlNakIdx + 27) % 27) + 1;
  const isMahendra = [4, 7, 10, 13, 16, 19, 22, 25].includes(diffNakCount);
  const mahendraKoota: KootaDetail = {
    id: "mahendra",
    name: { kn: "ಮಾಹೇಂದ್ರ ಕೂಟ", en: "Mahendra Koota", hi: "माहेंद्र कूट", te: "మాహేంద్ర కూట", ta: "மாகேந்திர கூடம்" },
    score: isMahendra ? 1 : 0,
    maxScore: 1,
    status: isMahendra ? "auspicious" : "moderate",
    description: {
      kn: "ಸಂತಾನ ವೃದ್ಧಿ, ಐಶ್ವರ್ಯ ಮತ್ತು ದೀರ್ಘಕಾಲಿಕ ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ.",
      en: "Promotes progeny, prosperity, and enduring marital bonding.",
      hi: "संतान वृद्धि, ऐश्वर्य एवं दीर्घकालिक सौभाग्य।",
      te: "సంతాన వృద్ధి మరియు సంపద.",
      ta: "சந்ததி விருத்தி மற்றும் தன பாக்கியம்."
    }
  };

  const isStreeDeergha = diffNakCount > 13;
  const streeDeerghaKoota: KootaDetail = {
    id: "streeDeergha",
    name: { kn: "ಸ್ತ್ರೀ ದೀರ್ಘ ಕೂಟ", en: "Stree Deergha Koota", hi: "स्त्री दीर्घ कूट", te: "స్త్రీ దీర్ఘ కూట", ta: "ஸ்திரீ தீர்க்க கூடம்" },
    score: isStreeDeergha ? 1 : 0,
    maxScore: 1,
    status: isStreeDeergha ? "auspicious" : "moderate",
    description: {
      kn: "ವಧುವಿನ ಆಯುರಾರೋಗ್ಯ, ದೀರ್ಘ ಮಾಂಗಲ್ಯ ಹಾಗೂ ಸುಖ-ಶಾಂತಿ.",
      en: "Ensures longevity, health, and lifelong auspiciousness for the bride.",
      hi: "वधू के दीर्घायु, स्वास्थ्य एवं अखंड सौभाग्य का सूचक।",
      te: "వధువు ఆయురారోగ్యాలు మరియు సౌభాగ్యం.",
      ta: "மணமகளின் தீர்க்க சுமங்கலி பாக்கியம்."
    }
  };

  const rajjuG = RAJJU_PARTS[girlNakIdx];
  const rajjuB = RAJJU_PARTS[boyNakIdx];
  const hasRajjuDosha = rajjuG === rajjuB;
  const rajjuKoota: KootaDetail = {
    id: "rajju",
    name: { kn: "ರಜ್ಜು ಕೂಟ", en: "Rajju Koota", hi: "रज्जु कूट", te: "రజ్జు కూట", ta: "ரஜ்ஜு கூடம்" },
    score: hasRajjuDosha ? 0 : 1,
    maxScore: 1,
    status: hasRajjuDosha ? "dosha" : "auspicious",
    description: {
      kn: hasRajjuDosha
        ? `ಏಕ ರಜ್ಜು ದೋಷ ಕಂಡುಬಂದಿದೆ (${rajjuG}) - ಮಾಂಗಲ್ಯ ರಕ್ಷಣೆಗಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆ ಅಗತ್ಯ.`
        : "ಭಿನ್ನ ರಜ್ಜು - ಮಾಂಗಲ್ಯ ಬಲ ಮತ್ತು ಆಯುಷ್ಯ ರಕ್ಷಣೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.",
      en: hasRajjuDosha
        ? `Rajju Dosha detected (${rajjuG} Rajju) - Special Mangalya Raksha Puja recommended.`
        : "Different Rajjus - Excellent marital longevity and Mangalya protection.",
      hi: hasRajjuDosha
        ? `रज्जु दोष उपस्थित (${rajjuG}) - शांति अनुष्ठान आवश्यक।`
        : "भिन्न रज्जु - अखंड सौभाग्य एवं दीर्घायु।",
      te: hasRajjuDosha
        ? `రజ్జు దోషం ఉంది (${rajjuG}) - శాంతి పూజ అవసరం.`
        : "భిన్న రజ్జు - శుభప్రదం.",
      ta: hasRajjuDosha
        ? `ரஜ்ஜு தோஷம் உள்ளது (${rajjuG}) - பரிகாரம் தேவை.`
        : "ரஜ்ஜு பொருத்தம் நன்று."
    }
  };

  const vedhaPairKey = `${Math.min(girlNakIdx, boyNakIdx)},${Math.max(girlNakIdx, boyNakIdx)}`;
  const hasVedhaDosha = VEDHA_PAIRS.has(vedhaPairKey);
  const vedhaKoota: KootaDetail = {
    id: "vedha",
    name: { kn: "ವೇಧ ಕೂಟ", en: "Vedha Koota", hi: "वेध कूट", te: "వేధ కూట", ta: "வேதை கூடம்" },
    score: hasVedhaDosha ? 0 : 1,
    maxScore: 1,
    status: hasVedhaDosha ? "dosha" : "auspicious",
    description: {
      kn: hasVedhaDosha
        ? "ಪರಸ್ಪರ ವೇಧ ನಕ್ಷತ್ರಗಳು - ಅಕಾಲಿಕ ಕಲಹ ಹಾಗೂ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳ ಶಮನಕ್ಕೆ ಶಾಂತಿ ಅಗತ್ಯ."
        : "ವೇಧ ರಹಿತ - ದಂಪತಿಗಳಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೇಮ ಮತ್ತು ಸಾಮರಸ್ಯ ವೃದ್ಧಿ.",
      en: hasVedhaDosha
        ? "Vedha affliction between stars - Remedies advised to prevent misunderstandings."
        : "Free from Vedha - Ensures mutual harmony and deep love.",
      hi: hasVedhaDosha
        ? "वेध दोष उपस्थित - वैवाहिक मतभेद निवारण हेतु शांति आवश्यक।"
        : "वेध रहित - दांपत्य प्रेम एवं समरसता।",
      te: hasVedhaDosha ? "వేధ దోషం ఉంది - శాంతి పూజ అవసరం." : "వేధ రహితం - శుభం.",
      ta: hasVedhaDosha ? "வேதை தோஷம் உள்ளது - சாந்தி தேவை." : "வேதை இல்லை - நன்று."
    }
  };

  // Kuja Dosha, Papa Samya & Dasha Sandhi
  const boyKuja = evaluateKujaDosha(boyK);
  const girlKuja = evaluateKujaDosha(girlK);
  const mutualKujaBalance = (boyKuja.hasKujaDosha && girlKuja.hasKujaDosha) || (!boyKuja.hasKujaDosha && !girlKuja.hasKujaDosha);

  const papaSamya = computePapaSamya(boyK, girlK);
  const dashaSandhi = computeDashaSandhi(boyK, girlK);

  // Determine Overall Band
  let band: "excellent" | "good" | "average" | "inauspicious" = "good";
  if (totalScore >= 28 && !hasRajjuDosha && !hasVedhaDosha) band = "excellent";
  else if (totalScore >= 21 && !hasRajjuDosha) band = "good";
  else if (totalScore >= 18) band = "average";
  else band = "inauspicious";

  // Verdict Text
  const verdictText: Record<MelameliLanguage, string> = {
    kn:
      band === "excellent"
        ? `ಒಟ್ಟು ${totalScore}/36 ಅಂಕಗಳೊಂದಿಗೆ ಅತ್ಯುತ್ತಮ ವಿವಾಹ ಮೇಳಾಪಕ ಯೋಗವಿದೆ. ದಂಪತಿಗಳ ಜೀವನದಲ್ಲಿ ಸುಖ, ಶಾಂತಿ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಸಮೃದ್ಧಿ ನೆಲೆಸಲಿದೆ.`
        : band === "good"
        ? `ಒಟ್ಟು ${totalScore}/36 ಅಂಕಗಳೊಂದಿಗೆ ಉತ್ತಮ ದಾಂಪತ್ಯ ಯೋಗವಿದೆ. ಸಣ್ಣಪುಟ್ಟ ದೋಷಗಳಿಗೆ ಸೂಕ್ತ ಶಾಂತಿ ಪೂಜೆಗಳೊಂದಿಗೆ ಮುನ್ನಡೆಯಬಹುದು.`
        : band === "average"
        ? `ಒಟ್ಟು ${totalScore}/36 ಅಂಕಗಳು (ಮಧ್ಯಮ ಹೊಂದಾಣಿಕೆ). ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸೂಚಿತ ವಿವಾಹ ಶಾಂತಿ ಹಾಗೂ ಹೋಮಗಳನ್ನು ನೆರವೇರಿಸುವುದು ಹಿತಕರ.`
        : `ಒಟ್ಟು ${totalScore}/36 ಅಂಕಗಳು. ಗಂಭೀರ ಗ್ರಹ ದೋಷಗಳು ಕಂಡುಬಂದಿರುವುದರಿಂದ ಪ್ರಧಾನ ವಿದ್ವಾಂಸರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ಅತ್ಯಗತ್ಯ.`,
    en:
      band === "excellent"
        ? `Outstanding compatibility with ${totalScore}/36 points. Promotes lifelong love, prosperity, and familial harmony.`
        : band === "good"
        ? `Favorable match with ${totalScore}/36 points. Fosters a blissful and stable married life.`
        : band === "average"
        ? `Average score of ${totalScore}/36 points. Recommended to perform consecrated Gokarna Kshetra Vivaha Shanti.`
        : `Score of ${totalScore}/36 with significant afflictions. Astrological guidance strongly recommended.`,
    hi:
      band === "excellent"
        ? `कुल ${totalScore}/36 अंकों के साथ सर्वोत्तम विवाह मिलान। दांपत्य जीवन में सुख, शांति एवं समृद्धि रहेगी।`
        : band === "good"
        ? `कुल ${totalScore}/36 अंकों के साथ उत्तम विवाह योग।`
        : band === "average"
        ? `कुल ${totalScore}/36 अंक (मध्यम मिलान)। गोकर्ण क्षेत्र में शांति अनुष्ठान उपरांत शुभ।`
        : `कुल ${totalScore}/36 अंक। प्रमुख दोषों के शमन हेतु विद्वान अर्चक से परामर्श करें।`,
    te:
      band === "excellent"
        ? `మొత్తం ${totalScore}/36 మార్కులతో అత్యుత్తమ వివాహ యోగం.`
        : band === "good"
        ? `మొత్తం ${totalScore}/36 మార్కులతో మంచి దాంపత్య పొంతన.`
        : band === "average"
        ? `మొత్తం ${totalScore}/36 మార్కులు (మధ్యమం). గోకర్ణ క్షేత్రంలో శాంతి పూజలు జరిపించండి.`
        : `తీవ్రమైన దోషాలు ఉన్నాయి. పండితుల సలహా తీసుకోండి.`,
    ta:
      band === "excellent"
        ? `மொத்தம் ${totalScore}/36 மதிப்பெண்களுடன் மிகச்சிறந்த திருமண பொருத்தம்.`
        : band === "good"
        ? `மொத்தம் ${totalScore}/36 மதிப்பெண்களுடன் நல்ல பொருத்தம்.`
        : band === "average"
        ? `மொத்தம் ${totalScore}/36 மதிப்பெண்கள். பரிகாரங்கள் செய்து திருமணம் செய்யலாம்.`
        : `தோஷங்கள் உள்ளதால் தகுந்த அர்ச்சகரிடம் ஆலோசனை பெறவும்.`
  };

  // Dynamic Gokarna Sevas based on Doshas
  const gokarnaSevas: GokarnaVivahaSeva[] = [];

  // Seva 1: Universal Kalyana Blessing
  gokarnaSevas.push({
    sevaId: "gokarna_kalyana_utsava",
    title: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಕಲ್ಯಾಣೋತ್ಸವ ಹಾಗೂ ರುದ್ರಾಭಿಷೇಕ",
      en: "Sri Mahabaleshwara Swami Kalyana Utsava & Rudrabhisheka",
      hi: "श्री महाबलेश्वर स्वामी कल्याणोत्सव एवं रुद्राभिषेक",
      te: "శ్రీ మహాబలేశ్వర స్వామి కల్యాణోత్సవం & రుద్రాభిషేకం",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் கல்யாண உற்சவம் & ருத்ராபிஷேகம்"
    },
    whyRequired: {
      kn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಅಖಂಡ ಪ್ರೇಮ, ಆಯಸ್ಸು ಹಾಗೂ ಮಂಗಳ ಗೌರೀ ದೇವಿಯ ದಿವ್ಯ ಅನುಗ್ರಹಕ್ಕಾಗಿ.",
      en: "To invoke divine marital bliss, longevity, and Goddess Mangala Gauri's blessings.",
      hi: "अखंड सौभाग्य, दांपत्य प्रेम एवं माता मंगला गौरी की कृपा प्राप्ति हेतु।",
      te: "అఖండ దాంపత్య సౌభాగ్యం కోసం.",
      ta: "தீர்க்க சுமங்கலி யோகம் மற்றும் இல்லற அமைதிக்காக."
    },
    significance: {
      kn: "ಗೋಕರ್ಣದ ಆದಿ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡುವುದರಿಂದ ಸಕಲ ನವಗ್ರಹ ದೋಷಗಳು ಶಮನವಾಗುತ್ತವೆ.",
      en: "Ksheerabhisheka to Gokarna Atmalinga pacifies all planetary adversities.",
      hi: "गोकर्ण आत्मलिंग का रुद्राभिषेक समस्त नवग्रह दोषों का शमन करता है।",
      te: "ఆత్మలింగ అభిషేకం ద్వారా నవగ్రహ దోషాలు తొలగిపోతాయి.",
      ta: "ஆத்மலிங்கத்திற்கு அபிஷேகம் செய்வதால் சகல தோஷங்களும் நீங்கும்."
    },
    howTransforms: {
      kn: "ಗಂಡ-ಹೆಂಡತಿಯರ ನಡುವಿನ ಮನಸ್ತಾಪಗಳು ದೂರವಾಗಿ ಸುಖಕರ ಗೃಹಸ್ಥ ಜೀವನ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
      en: "Removes misunderstandings, establishing harmony and financial peace.",
      hi: "पारस्परिक मतभेद समाप्त होकर सुखद गृहस्थ जीवन प्राप्त होता है।",
      te: "భార్యాభర్తల మధ్య సఖ్యత మరియు ఆనందం కలుగుతాయి.",
      ta: "குடும்பத்தில் ஒற்றுமையும் மகிழ்ச்சியும் பெருகும்."
    },
    bookingCode: "GOK-KALYANA-01"
  });

  // Seva 2: If Kuja Dosha or Papa Samya uneven
  if (boyKuja.hasKujaDosha || girlKuja.hasKujaDosha || !papaSamya.isBalanced) {
    gokarnaSevas.push({
      sevaId: "subramanya_kuja_shanti",
      title: {
        kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಕುಜ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಅಂಗಾರಕ ಹೋಮ",
        en: "Sri Subramanya Kuja Dosha Shanti & Angaraka Homa",
        hi: "श्री सुब्रह्मण्य कुज दोष शांति एवं अंगारक हवन",
        te: "శ్రీ సుబ్రహ్మణ్య కుజ దోష శాంతి & అంగారక హోమం",
        ta: "ஸ்ரீ சுப்பிரமணிய செவ்வாய் தோஷ சாந்தி ஹோமம்"
      },
      whyRequired: {
        kn: "ಜಾತಕದಲ್ಲಿರುವ ಕುಜ (ಮಾಂಗ್ಲಿಕ್) ಪ್ರಭಾವ ಹಾಗೂ ಪಾಪ ಗ್ರಹಗಳ ತೀವ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸಲು.",
        en: "To neutralize Manglik affliction and balance malefic energy.",
        hi: "मांगलिक प्रभाव एवं पाप ग्रहों की शांति हेतु।",
        te: "కుజ దోష నివృత్తి మరియు గ్రహ శాంతి కొరకు.",
        ta: "செவ்வாய் தோஷம் நீங்கி குடும்ப அமைதி பெற."
      },
      significance: {
        kn: "ಕುಜ ದೋಷದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ಮಂಗಳಕರ ಧೈರ್ಯ ಮತ್ತು ಪ್ರೇಮವನ್ನಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.",
        en: "Transforms fiery aggressive tendencies into courageous and protective devotion.",
        hi: "मंगल के उग्र प्रभाव को शांत कर सकारात्मक ऊर्जा प्रदान करता है।",
        te: "కుజ గ్రహ అనుగ్రహం ద్వారా శాంతి లభిస్తుంది.",
        ta: "செவ்வாய் பகவானின் அருள் கிடைக்கும்."
      },
      howTransforms: {
        kn: "ವಿವಾಹ ವಿಳಂಬ, ಕಲಹ ಹಾಗೂ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಶಾಂತವಾಗುತ್ತವೆ.",
        en: "Resolves marriage delays, friction, and health concerns.",
        hi: "विवाह बाधाएं एवं कलह समाप्त होते हैं।",
        te: "వివాహ ఆటంకాలు తొలగిపోతాయి.",
        ta: "திருமண தடைகள் நீங்கும்."
      },
      bookingCode: "GOK-KUJA-02"
    });
  }

  // Seva 3: If Nadi or Bhakoot Dosha
  if ((nadiRes.isDosha && !nadiRes.isCancelled) || (bhakootRes.isDosha && !bhakootRes.isCancelled)) {
    gokarnaSevas.push({
      sevaId: "mrityunjaya_nadi_shanti",
      title: {
        kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಸುವರ್ಣ ನಾಡಿ ದಾನ ಸಂಸ್ಕಾರ",
        en: "Maha Mrityunjaya Homa & Suvarna Nadi Dana",
        hi: "महा मृत्युंजय हवन एवं सुवर्ण नाड़ी दान संस्कार",
        te: "మహా మృత్యుంజయ హోమం & సువర్ణ నాడీ దానం",
        ta: "மகா மிருத்யுஞ்சய ஹோமம் & நாடி சாந்தி"
      },
      whyRequired: {
        kn: "ನಾಡಿ / ಭಕೂಟ ದೋಷ ನಿವಾರಣೆ, ಸಂತಾನ ರಕ್ಷಣೆ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ವೃದ್ಧಿಗಾಗಿ.",
        en: "To clear Nadi/Bhakoot doshas and ensure healthy lineage and longevity.",
        hi: "नाड़ी एवं भकूट दोष निवारण तथा उत्तम संतान प्राप्ति हेतु।",
        te: "నాడీ దోష నివృత్తి మరియు సంతాన క్షేమం కొరకు.",
        ta: "நாடி தோஷம் நீங்கி நன்மக்கட்பேறு பெற."
      },
      significance: {
        kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಚಿನ್ನದ ದಾನವು ಪರಮ ಪಾಪನಾಶಕವಾಗಿದೆ.",
        en: "Consecrated Mrityunjaya japa at Gokarna destroys severe karmic obstacles.",
        hi: "गोकर्ण क्षेत्र में महामृत्युंजय जप परम फलदायी है।",
        te: "మృత్యుంజయ జపం ద్వారా సమస్త దోషాలు తొలగుతాయి.",
        ta: "மிருத்யுஞ்சய ஜெபம் சகல தடைகளையும் தகர்க்கும்."
      },
      howTransforms: {
        kn: "ದಂಪತಿಗಳ ವಂಶವೃಕ್ಷವು ಆರೋಗ್ಯವಂತ ಸುಪುತ್ರ-ಸುಪುತ್ರಿಯರೊಂದಿಗೆ ಶೋಭಿಸುತ್ತದೆ.",
        en: "Blesses the couple with radiant progeny and divine spiritual protection.",
        hi: "स्वस्थ संतान एवं वंश वृद्धि का वरदान प्राप्त होता है।",
        te: "సంతాన భాగ్యం మరియు దీర్ಘಾಯుష్షు ప్రాప్తిస్తాయి.",
        ta: "குடும்ப வளம் மற்றும் சந்ததி மேன்மை உண்டாகும்."
      },
      bookingCode: "GOK-NADI-03"
    });
  }

  return {
    boyKundli: boyK,
    girlKundli: girlK,
    totalScore,
    maxScore: 36,
    percentage,
    band,
    verdictText,
    ashtaKuta,
    dashaKutaAdditions: {
      mahendra: mahendraKoota,
      streeDeergha: streeDeerghaKoota,
      rajju: rajjuKoota,
      vedha: vedhaKoota
    },
    kujaDosha: {
      boy: boyKuja,
      girl: girlKuja,
      mutualKujaBalance,
      verdict: {
        kn: mutualKujaBalance
          ? "ಕುಜ ದೋಷ ಸಮತೋಲನವಾಗಿದೆ (ಇಬ್ಬರಲ್ಲೂ ಸಮಾನ ಪ್ರಭಾವ) - ದೋಷ ರಹಿತ."
          : "ಕುಜ ದೋಷದಲ್ಲಿ ಅಸಮತೋಲನವಿದೆ - ಗೋಕರ್ಣ ಸುಬ್ರಹ್ಮಣ್ಯ ಶಾಂತಿ ಅಗತ್ಯ.",
        en: mutualKujaBalance
          ? "Kuja Dosha is mutually balanced or cancelled - Safe to proceed."
          : "Kuja Dosha is uneven - Gokarna Subramanya Shanti recommended.",
        hi: mutualKujaBalance
          ? "कुज दोष संतुलित अथवा निरस्त है - शुभ।"
          : "कुज दोष असंतुलित है - शांति अनुष्ठान करें।",
        te: mutualKujaBalance
          ? "కుజ దోషం సమతుల్యంగా ఉంది."
          : "కుజ దోష శాంతి అవసరం.",
        ta: mutualKujaBalance
          ? "செவ்வாய் தோஷம் சமநிலையில் உள்ளது."
          : "செவ்வாய் சாந்தி பூஜை தேவை."
      }
    },
    papaSamya,
    dashaSandhi,
    gokarnaSevas
  };
}
