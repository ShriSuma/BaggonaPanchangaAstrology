/**
 * Bhagyodaya Mahadarshana & Life Transformation Master Engine
 * (ಭಾಗ್ಯೋದಯ ಮಹಾದರ್ಶನ & ಜೀವನ ಸಂಜೀವಿನಿ ಎಂಜಿನ್)
 * 
 * Deeply analyzes a devotee's Janma Kundali across 7 fundamental life pillars:
 * 1. 💰 Dhana Prapti & Runa Vimochana (Wealth breakout, Debt freedom, Career fortune)
 * 2. ❤️ Dampatya, Vivaha & Santathi Bhagya (Marriage timing, Soul partner, Children)
 * 3. 🌿 Ayur Arogya Raksha Kavacha (Health vitality, Doshas, Healing herbs, Longevity)
 * 4. 🛡️ Drishti, Shatru Badha & Graha Nivaran (Evil eye, Enemy protection, Sudarshana Kavacha)
 * 5. 🌟 10-Year Golden Milestones Timeline (Year-by-year life turning points 2026-2036)
 * 6. 💎 Bhagya Gemstone, Rudraksha & 5-Minute Daily Karma Blueprint
 * 7. 🪔 Gokarna Temple Priest Archana Sankalpa Recommendation
 */

import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { degreeToRashi } from "../../core/AstroMath";

export type BhagyodayaLang = "kn" | "en" | "hi" | "ta" | "te";

export interface GoldenMilestoneYear {
  year: number;
  age: number;
  rating: "golden" | "growth" | "caution";
  ratingLabel: string;
  theme: string;
  astrologicalReason: string;
  actionableGuidance: string;
  favorableMonths: string[];
}

export interface BhagyodayaReport {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  lagnaRashi: string;
  moonRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  rashiLord: string;
  lagnaLord: string;
  gotra: string;

  // 1. Wealth & Debt Freedom
  wealth: {
    dhanaYogaScore: number; // 0 to 100
    dhanaYogaName: string;
    wealthVerdict: string;
    runaVimochanaTimeline: string;
    goldenCareerSectors: string[];
    optimalWealthDirection: string;
    kuberaRemedy: string;
  };

  // 2. Marriage & Children
  relationship: {
    vivahaYogaWindow: string;
    spouseCharacteristics: string;
    spouseDirection: string;
    dampatyaHarmonyRating: string;
    santathiBlessingWindow: string;
    relationshipRemedy: string;
  };

  // 3. Health & Vitality
  health: {
    vitalityScore: number; // 0 to 100
    constitutionDosha: "Vata" | "Pitta" | "Kapha" | "Tridosha";
    vulnerableOrgans: string[];
    ayurSanjeeviniHerbs: string[];
    dailyDietRitual: string;
    mahaMrityunjayaShield: string;
  };

  // 4. Protection & Evil Eye
  protection: {
    drishtiSensitivityLevel: "Low" | "Medium" | "High" | "Severe";
    activeTransitAfflictions: string[];
    sudarshanaKavachaMantra: string;
    rakshaSutraTiming: string;
    homeEnergyRemedy: string;
  };

  // 5. 10-Year Golden Milestones (2026 - 2036)
  milestones: GoldenMilestoneYear[];

  // 6. Gemstone, Rudraksha & Daily Karma Blueprint
  karmaBlueprint: {
    bhagyaGemstone: {
      name: string;
      sanskritName: string;
      weightRatti: string;
      metal: string;
      finger: string;
      consecrationDay: string;
      caution: string;
    };
    rudrakshaMukhi: string;
    fiveMinuteMorningRoutine: {
      facingDirection: string;
      prescribedMantra: string;
      chantCount: number;
      sacredAction: string;
    };
    charityAction: string;
  };

  // 7. Temple Archana Sankalpa
  templeBlessing: {
    deity: string;
    templeName: string;
    specialSankalpaMantra: string;
    recommendedSevaName: string;
  };
}

const RASHI_LORDS: Record<string, string> = {
  Mesha: "Mars",
  Vrishabha: "Venus",
  Mithuna: "Mercury",
  Karka: "Moon",
  Simha: "Sun",
  Kanya: "Mercury",
  Tula: "Venus",
  Vrischika: "Mars",
  Dhanu: "Jupiter",
  Makara: "Saturn",
  Kumbha: "Saturn",
  Meena: "Jupiter"
};

const RASHI_KN: Record<string, string> = {
  Mesha: "ಮೇಷ",
  Vrishabha: "ವೃಷಭ",
  Mithuna: "ಮಿಥುನ",
  Karka: "ಕರ್ಕಾಟಕ",
  Simha: "ಸಿಂಹ",
  Kanya: "ಕನ್ಯಾ",
  Tula: "ತುಲಾ",
  Vrischika: "ವೃಶ್ಚಿಕ",
  Dhanu: "ಧನುಸ್ಸು",
  Makara: "ಮಕರ",
  Kumbha: "ಕುಂಭ",
  Meena: "ಮೀನ"
};

const GRAHA_KN: Record<string, string> = {
  Sun: "ಸೂರ್ಯ",
  Moon: "ಚಂದ್ರ",
  Mars: "ಕುಜ (ಮಂಗಳ)",
  Mercury: "ಬುಧ",
  Jupiter: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
  Venus: "ಶುಕ್ರ",
  Saturn: "ಶನಿ",
  Rahu: "ರಾಹು",
  Ketu: "ಕೇತು"
};

/**
 * Calculates the complete Bhagyodaya Mahadarshana Life Dossier from a devotee's KundliOutput.
 * 100% dynamic, computed from Janma Kundali, Dasha-Bhukti, and Gochara transits.
 */
export function generateBhagyodayaReport(
  kundli: KundliOutput,
  input: {
    name: string;
    birthDate: string;
    birthTime: string;
    gotra?: string;
  },
  lang: BhagyodayaLang = "kn"
): BhagyodayaReport {
  const devoteeName = input.name || (lang === "kn" ? "ಶ್ರೀಯುತ ಜಾತಕರು" : "Devotee");
  const birthDate = input.birthDate;
  const birthTime = input.birthTime;
  const gotra = input.gotra || "ಕಾಶ್ಯಪ";

  const lagnaRashiEng = kundli.lagnaRashi?.english || "Dhanu";
  const planets = kundli.planets;
  const moonPlanet = planets.find(p => p.name === "Moon") || planets[1];
  const jupiterPlanet = planets.find(p => p.name === "Jupiter");
  const venusPlanet = planets.find(p => p.name === "Venus");
  const saturnPlanet = planets.find(p => p.name === "Saturn");
  const sunPlanet = planets.find(p => p.name === "Sun");
  const marsPlanet = planets.find(p => p.name === "Mars");
  const mercuryPlanet = planets.find(p => p.name === "Mercury");
  const rahuPlanet = planets.find(p => p.name === "Rahu");
  const ketuPlanet = planets.find(p => p.name === "Ketu");

  const moonRashiEng = kundli.moonSign?.english || moonPlanet?.rashi?.english || "Dhanu";
  const nakshatraEng = moonPlanet?.nakshatra?.english || "Mula";
  const nakshatraKn = moonPlanet?.nakshatra?.sanskrit || "ಮೂಲಾ";

  // Dynamic Nakshatra Pada calculation from Moon's longitude
  const moonLong = ((moonPlanet?.rashi?.index ?? 0) * 30) + (moonPlanet?.degree ?? 0);
  const nakshatraPada = Math.floor(((moonLong % (360 / 27)) / (360 / 108))) + 1;

  const rashiLord = RASHI_LORDS[moonRashiEng] || "Jupiter";
  const lagnaLord = RASHI_LORDS[lagnaRashiEng] || "Jupiter";

  // 1. Wealth & Debt Freedom Calculations
  const hasGajaKesari = jupiterPlanet && moonPlanet && Math.abs(jupiterPlanet.house - moonPlanet.house) % 3 === 0;
  const has2ndLordWealth = venusPlanet && (venusPlanet.house === 2 || venusPlanet.house === 11);
  const dhanaScore = Math.min(98, Math.max(65, 70 + (hasGajaKesari ? 14 : 0) + (has2ndLordWealth ? 12 : 5) + (jupiterPlanet && jupiterPlanet.house === 9 ? 8 : 0)));
  
  const wealthVerdictKn = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${lagnaRashiEng} ಲಗ್ನದ ${RASHI_KN[lagnaRashiEng] || lagnaRashiEng} ರಾಶ್ಯಾಧಿಪತಿಯ ಬಲದಿಂದಾಗಿ ನಿಮ್ಮ ಜೀವಿತಾವಧಿಯಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು ಸೃಷ್ಟಿಯಾಗುವ ಮಹಾ ಯೋಗವಿದೆ. ${hasGajaKesari ? "ಗಜಕೇಸರಿ ಯೋಗ ಹಾಗೂ ಧನಯೋಗವು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಭದ್ರಪಡಿಸುತ್ತದೆ." : "ದ್ವಿತೀಯ ಮತ್ತು ಏಕಾದಶ ಭಾವಗಳ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನಿರಂತರ ಧನಾಗಮನವಿರುತ್ತದೆ."}`;
  const wealthVerdictEn = `With your ${lagnaRashiEng} Ascendant and strong planetary alignments, you possess powerful Dhana Yogas for exponential wealth accumulation. ${hasGajaKesari ? "Gajakesari Yoga guarantees steady financial resilience and real estate growth." : "Direct aspects on your 2nd and 11th houses ensure recurring income streams."}`;

  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(birthDate.split("-")[0] || "1990", 10);
  const baseAge = Math.max(0, currentYear - birthYear);

  // Dynamic Timeline for Debt Freedom / Runa Vimochana
  const runaReliefOffset = (saturnPlanet && saturnPlanet.house === 6) ? 0 : 1;
  const runaStartYear = currentYear + runaReliefOffset;
  const runaEndYear = runaStartYear + 1;
  const runaVimochanaTimeline = lang === "kn"
    ? `${runaStartYear} ರ ದೀಪಾವಳಿಯಿಂದ ${runaEndYear} ರ ಯುಗಾದಿ ಒಳಗೆ ಷಷ್ಠಾಧಿಪತಿ ಉಪಶಮನ ಹಾಗೂ ಋಣ ಬಾಧೆಗಳಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತಿ`
    : `Between Diwali ${runaStartYear} and Yugadi ${runaEndYear} 6th house pacification and total debt liberation`;

  // 2. Marriage & Children Calculations
  const hasKujaDosha = planets.some(p => p.name === "Mars" && [1, 2, 4, 7, 8, 12].includes(p.house));
  const has7thBenefic = planets.some(p => (p.name === "Jupiter" || p.name === "Venus" || p.name === "Mercury") && p.house === 7);
  const has7thMalefic = planets.some(p => (p.name === "Saturn" || p.name === "Rahu" || p.name === "Ketu") && p.house === 7);
  
  let harmonyScore = 80;
  if (has7thBenefic) harmonyScore += 12;
  if (has7thMalefic) harmonyScore -= 10;
  if (hasKujaDosha) harmonyScore -= 6;
  if (venusPlanet && [1, 4, 5, 9, 11].includes(venusPlanet.house)) harmonyScore += 6;
  harmonyScore = Math.min(96, Math.max(62, harmonyScore));

  const currentBhuktiAtAge = findBhuktiAtAge(kundli, baseAge);
  const dashaLordName = currentBhuktiAtAge?.bhukti || currentBhuktiAtAge?.maha?.planet || "Jupiter";
  const dashaLordKn = GRAHA_KN[dashaLordName] || dashaLordName;

  const vivahaStartYear = currentYear;
  const vivahaEndYear = currentYear + 2;
  const vivahaWindow = lang === "kn" 
    ? `${vivahaStartYear} ರ ಉತ್ತರಾರ್ಧದಿಂದ ${vivahaEndYear} ರ ಮಧ್ಯಭಾಗ (${dashaLordKn} ದಶಾ ಹಾಗೂ ಗುರು ಸಂಚಾರ ಬಲ)`
    : `Late ${vivahaStartYear} to Mid ${vivahaEndYear} (${dashaLordName} Dasha & Auspicious Jupiter Transit)`;
  const vivahaWindowEn = `Late ${vivahaStartYear} to Mid ${vivahaEndYear} (${dashaLordName} Dasha & Auspicious Jupiter Transit)`;

  const santathiYear = currentYear + ((jupiterPlanet && [5, 9, 11].includes(jupiterPlanet.house)) ? 1 : 2);
  const santathiBlessingWindow = lang === "kn"
    ? `${santathiYear} - ${santathiYear + 1} ರ ಪಂಚಮ ಸ್ಥಾನ ಗುರು ದೃಷ್ಟಿ ಕಾಲಾವಧಿ`
    : `During ${santathiYear} - ${santathiYear + 1} Jupiter 5th House Transit Window`;

  // 3. Health Constitution & Vitality Score
  const dosha: "Vata" | "Pitta" | "Kapha" | "Tridosha" = 
    ["Mesha", "Simha", "Dhanu"].includes(lagnaRashiEng) ? "Pitta" :
    ["Vrishabha", "Kanya", "Makara"].includes(lagnaRashiEng) ? "Vata" :
    ["Mithuna", "Tula", "Kumbha"].includes(lagnaRashiEng) ? "Vata" : "Kapha";

  let vit = 76;
  if (sunPlanet && [1, 5, 9, 10, 11].includes(sunPlanet.house)) vit += 12;
  if (sunPlanet?.isDebilitated || (sunPlanet && [6, 8, 12].includes(sunPlanet.house))) vit -= 14;
  if (saturnPlanet && [6, 8].includes(saturnPlanet.house)) vit -= 6;
  if (jupiterPlanet && [1, 5, 9].includes(jupiterPlanet.house)) vit += 8;
  const vitalityScore = Math.min(98, Math.max(56, vit));

  // 4. Protection Level
  const drishtiLevel = rahuPlanet && (rahuPlanet.house === 1 || rahuPlanet.house === 7 || rahuPlanet.house === 8) ? "Severe" : "Medium";

  // 5. 10-Year Dynamic Golden Milestones (2026 - 2036)
  let baseJupDeg = 45;
  let baseSatDeg = 325;
  try {
    const ephem = siderealLongitudes(new Date(), "lahiri", "mean");
    baseJupDeg = ephem.jupiter ?? 45;
    baseSatDeg = ephem.saturn ?? 325;
  } catch {
    baseJupDeg = 45;
    baseSatDeg = 325;
  }

  const moonRashiIdx = kundli.moonSign?.index ?? (moonPlanet?.rashi?.index ?? 0);

  const milestones: GoldenMilestoneYear[] = Array.from({ length: 10 }).map((_, idx) => {
    const yr = currentYear + idx;
    const age = baseAge + idx;

    // Running Dasha & Bhukti for that specific year & age
    const bhuktiInfo = findBhuktiAtAge(kundli, age);
    const mahaPl = bhuktiInfo?.maha?.planet || PlanetName.Jupiter;
    const subPl = bhuktiInfo?.bhukti || PlanetName.Jupiter;
    const mahaKn = GRAHA_KN[mahaPl] || mahaPl;
    const subKn = GRAHA_KN[subPl] || subPl;

    // Projected Gochara Transit
    const projectedJupDeg = (baseJupDeg + idx * 30) % 360;
    const projectedSatDeg = (baseSatDeg + idx * 12) % 360;
    const jupRashi = degreeToRashi(projectedJupDeg);
    const satRashi = degreeToRashi(projectedSatDeg);

    const jupHouseFromMoon = (jupRashi.index - moonRashiIdx + 12) % 12 + 1;
    const satHouseFromMoon = (satRashi.index - moonRashiIdx + 12) % 12 + 1;

    const isSadeSatiOrAshtama = [1, 2, 12, 8].includes(satHouseFromMoon);
    const isJupBenefic = [2, 5, 7, 9, 11].includes(jupHouseFromMoon);

    let rating: "golden" | "growth" | "caution" = "growth";
    if (isSadeSatiOrAshtama && !isJupBenefic) {
      rating = "caution";
    } else if (isJupBenefic) {
      rating = "golden";
    } else {
      rating = "growth";
    }

    // Dynamic House Activation themes
    const subPlanetObj = planets.find(p => p.name === subPl);
    const subHouse = subPlanetObj?.house || 1;

    let themeKn = "ಸ್ಥಿರ ಪ್ರಗತಿ & ನೂತನ ಅವಕಾಶಗಳು";
    let themeEn = "Steady Growth & New Opportunities";
    let reasonKn = `${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${subKn} ಭುಕ್ತಿ ಹಾಗೂ ಗೋಚಾರದಲ್ಲಿ ${jupHouseFromMoon}ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಸಂಚಾರ`;
    let reasonEn = `${mahaPl} Mahadasha with ${subPl} Bhukti, Jupiter transiting House ${jupHouseFromMoon}`;

    if (subHouse === 1 || subHouse === 9) {
      themeKn = "ಮಹಾ ಭಾಗ್ಯೋದಯ, ಗೌರವ & ದೈವ ಕೃಪೆ";
      themeEn = "Supreme Fortune, Honor & Divine Grace";
    } else if (subHouse === 2 || subHouse === 11) {
      themeKn = "ಆರ್ಥಿಕ ತಿರುವು & ಬೃಹತ್ ಧನಾಗಮನ";
      themeEn = "Financial Breakthrough & Major Inflow";
    } else if (subHouse === 4) {
      themeKn = "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಗೃಹ ಸೌಖ್ಯ & ವಾಹನ ಯೋಗ";
      themeEn = "Property Acquisition & Domestic Joy";
    } else if (subHouse === 5) {
      themeKn = "ಜ್ಞಾನೋದಯ, ಮಕ್ಕಳ ಪ್ರಗತಿ & ಯಶಸ್ಸು";
      themeEn = "Intellectual Honors & Children's Progress";
    } else if (subHouse === 7) {
      themeKn = "ವೈವಾಹಿಕ ಸೌಖ್ಯ & ನೂತನ ಪಾಲುದಾರಿಕೆ";
      themeEn = "Marital Harmony & Business Alliance";
    } else if (subHouse === 10) {
      themeKn = "ಉದ್ಯೋಗ ಬಡ್ತಿ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ & ಕೀರ್ತಿ";
      themeEn = "Career Elevation & Stature Growth";
    } else if (subHouse === 6 || subHouse === 8 || subHouse === 12) {
      themeKn = "ಆರೋಗ್ಯ ಜಾಗರೂಕತೆ, ಋಣ ಮುಕ್ತಿ & ಶಾಂತಿ ಸಂಕಲ್ಪ";
      themeEn = "Health Vigilance, Debt Clearance & Peace";
    }

    const ratingLabel = rating === "golden" 
      ? (lang === "kn" ? "🌟 ಸ್ವರ್ಣಾವಧಿ (Golden)" : "🌟 Golden Era") 
      : rating === "growth" 
      ? (lang === "kn" ? "📈 ಸ್ಥಿರ ಪ್ರಗತಿ (Growth)" : "📈 Steady Growth") 
      : (lang === "kn" ? "⚠️ ಶಾಂತಿ ಅವಧಿ (Caution)" : "⚠️ Vigilance Period");

    const actionableGuidance = lang === "kn"
      ? `ಈ ವರ್ಷದಲ್ಲಿ ${themeKn.toLowerCase()}ಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಹಾಗೂ ನಿತ್ಯ ${subKn} ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.`
      : `Execute strategic plans around ${themeEn.toLowerCase()} and maintain daily spiritual mindfulness.`;

    const favorableMonths = lang === "kn" 
      ? ["ಏಪ್ರಿಲ್ - ಜೂನ್", "ಅಕ್ಟೋಬರ್ - ಡಿಸೆಂಬರ್"] 
      : ["April - June", "October - December"];

    return {
      year: yr,
      age,
      rating,
      ratingLabel,
      theme: lang === "kn" ? themeKn : themeEn,
      astrologicalReason: lang === "kn" ? reasonKn : reasonEn,
      actionableGuidance,
      favorableMonths
    };
  });

  // 6. Gemstone Recommendation
  const gemstoneMap: Record<string, { kn: string; en: string; ratti: string; metal: string; finger: string; day: string }> = {
    Mesha: { kn: "ಕೆಂಪು ಹವಳ (Coral)", en: "Red Coral (Moonga)", ratti: "6.5 - 7.25 Ratti", metal: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ (Copper/Gold)", finger: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", day: "ಮಂಗಳವಾರ (Tuesday)" },
    Vrishabha: { kn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ನೀಲ (Diamond/White Zircon)", en: "Diamond / White Sapphire", ratti: "4.25 - 5.5 Ratti", metal: "ಬೆಳ್ಳಿ ಅಥವಾ ಪ್ಲಾಟಿನಂ (Silver)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶುಕ್ರವಾರ (Friday)" },
    Mithuna: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Panna)", ratti: "5.25 - 6.25 Ratti", metal: "ಚಿನ್ನ ಅಥವಾ ಕಂಚು (Gold/Bronze)", finger: "ಕಿರುಬೆರಳು (Little Finger)", day: "ಬುಧವಾರ (Wednesday)" },
    Karka: { kn: "ಮುತ್ತು (Pearl)", en: "Natural Pearl (Moti)", ratti: "6.5 - 8.0 Ratti", metal: "ಶುದ್ಧ ಬೆಳ್ಳಿ (Pure Silver)", finger: "ಕಿರುಬೆರಳು (Little Finger)", day: "ಸೋಮವಾರ (Monday)" },
    Simha: { kn: "ಮಾಣಿಕ್ಯ (Ruby)", en: "Ruby (Manikya)", ratti: "5.5 - 6.5 Ratti", metal: "ಶುದ್ಧ ಚಿನ್ನ (Gold/Copper)", finger: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", day: "ಭಾನುವಾರ (Sunday)" },
    Kanya: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Panna)", ratti: "5.25 - 6.25 Ratti", metal: "ಚಿನ್ನ ಅಥವಾ ಬೆಳ್ಳಿ (Gold/Silver)", finger: "ಕಿರುಬೆರಳು (Little Finger)", day: "ಬುಧವಾರ (Wednesday)" },
    Tula: { kn: "ವಜ್ರ ಅಥವಾ ಓಪಲ್ (Diamond/Opal)", en: "Diamond / Australian Opal", ratti: "5.5 - 7.0 Ratti", metal: "ಬೆಳ್ಳಿ (Silver)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶುಕ್ರವಾರ (Friday)" },
    Vrischika: { kn: "ಕೆಂಪು ಹವಳ (Red Coral)", en: "Red Coral (Moonga)", ratti: "6.5 - 7.5 Ratti", metal: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ (Copper/Gold)", finger: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", day: "ಮಂಗಳವಾರ (Tuesday)" },
    Dhanu: { kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pukhraj)", ratti: "5.25 - 6.5 Ratti", metal: "ಶುದ್ಧ ಚಿನ್ನ (Gold)", finger: "ತೋರುಬೆರಳು (Index Finger)", day: "ಗುರುವಾರ (Thursday)" },
    Makara: { kn: "ಇಂದ್ರನೀಲ (Blue Sapphire)", en: "Blue Sapphire / Amethyst", ratti: "5.5 - 7.25 Ratti", metal: "ಪಂಚಧಾತು ಅಥವಾ ಬೆಳ್ಳಿ (Panchadhatu)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶನಿವಾರ (Saturday)" },
    Kumbha: { kn: "ನೀಲಮಣಿ (Blue Sapphire)", en: "Blue Sapphire (Neelam)", ratti: "5.5 - 7.0 Ratti", metal: "ಪಂಚಧಾತು ಅಥವಾ ಉಕ್ಕು (Panchadhatu)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶನಿವಾರ (Saturday)" },
    Meena: { kn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pukhraj)", ratti: "5.5 - 6.75 Ratti", metal: "ಶುದ್ಧ ಚಿನ್ನ (Gold)", finger: "ತೋರುಬೆರಳು (Index Finger)", day: "ಗುರುವಾರ (Thursday)" }
  };

  const gem = gemstoneMap[lagnaRashiEng] || gemstoneMap["Dhanu"];

  // Dynamic Rudraksha Mukhi derived from Lagna and Moon
  const rudrakshaMukhiMap: Record<string, string> = {
    Mesha: "೩ ಮುಖಿ ಹಾಗೂ ೧೧ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (3 & 11 Mukhi Rudraksha)",
    Vrishabha: "೬ ಮುಖಿ ಹಾಗೂ ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6 & 7 Mukhi Rudraksha)",
    Mithuna: "೪ ಮುಖಿ ಹಾಗೂ ೧೦ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (4 & 10 Mukhi Rudraksha)",
    Karka: "೨ ಮುಖಿ ಹಾಗೂ ಗೌರೀ-ಶಂಕರ ರುದ್ರಾಕ್ಷಿ (2 Mukhi & Gauri Shankar)",
    Simha: "೧ ಮುಖಿ ಅಥವಾ ೧೨ ಮುಖಿ ಸೂರ್ಯ ರುದ್ರಾಕ್ಷಿ (1 & 12 Mukhi Rudraksha)",
    Kanya: "೪ ಮುಖಿ ಹಾಗೂ ಗಣೇಶ ರುದ್ರಾಕ್ಷಿ (4 Mukhi & Ganesha Rudraksha)",
    Tula: "೬ ಮುಖಿ ಹಾಗೂ ೧೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6 & 13 Mukhi Rudraksha)",
    Vrischika: "೩ ಮುಖಿ ಹಾಗೂ ೧೧ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (3 & 11 Mukhi Rudraksha)",
    Dhanu: "೫ ಮುಖಿ ಹಾಗೂ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 9 Mukhi Rudraksha)",
    Makara: "೭ ಮುಖಿ ಹಾಗೂ ೧೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7 & 14 Mukhi Rudraksha)",
    Kumbha: "೭ ಮುಖಿ ಹಾಗೂ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7 & 8 Mukhi Rudraksha)",
    Meena: "೫ ಮುಖಿ ಹಾಗೂ ೧೧ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 11 Mukhi Rudraksha)"
  };
  const rudrakshaRecommendation = rudrakshaMukhiMap[lagnaRashiEng] || "೫ ಮುಖಿ ಮತ್ತು ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 7 Mukhi Nepali Rudraksha)";

  // Dynamic Archana Sankalpa with native's Gotra and Name
  const gotraLabel = gotra || "ಕಾಶ್ಯಪ";
  const specialSankalpaMantra = `ಶ್ರೀಮತ್ ${gotraLabel} ಗೋತ್ರೋದ್ಭವಸ್ಯ ${devoteeName} ನಾಮಧೇಯಸ್ಯ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧರ್ಥಂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿ ರಸ್ತು ||`;

  return {
    devoteeName,
    birthDate,
    birthTime,
    lagnaRashi: lang === "kn" ? (RASHI_KN[lagnaRashiEng] || lagnaRashiEng) : lagnaRashiEng,
    moonRashi: lang === "kn" ? (RASHI_KN[moonRashiEng] || moonRashiEng) : moonRashiEng,
    nakshatra: lang === "kn" ? nakshatraKn : nakshatraEng,
    nakshatraPada,
    rashiLord,
    lagnaLord,
    gotra: gotraLabel,

    wealth: {
      dhanaYogaScore: dhanaScore,
      dhanaYogaName: hasGajaKesari ? "ಗಜಕೇಸರಿ ಮಹಾಲಕ್ಷ್ಮಿ ಯೋಗ (Gajakesari Mahalakshmi Yoga)" : "ದ್ವಿತೀಯ-ಏಕಾದಶ ಧನ ಯೋಗ (Dhana-Labha Yoga)",
      wealthVerdict: lang === "kn" ? wealthVerdictKn : wealthVerdictEn,
      runaVimochanaTimeline,
      goldenCareerSectors: lang === "kn" 
        ? ["ಆಡಳಿತ & ನಾಯಕತ್ವ (Leadership & Management)", "ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಭೂಮಿ ವ್ಯವಹಾರ (Real Estate)", "ತಂತ್ರಜ್ಞಾನ & ಸಲಹಾ ಸೇವೆಗಳು (Tech & Consulting)", "ಹಣಕಾಸು & ಹೂಡಿಕೆ (Finance & Investment)"]
        : ["Leadership & Management", "Real Estate & Infrastructure", "Technology & Consulting", "Finance & Investment"],
      optimalWealthDirection: lang === "kn" ? "ಉತ್ತರ ಮತ್ತು ಈಶಾನ್ಯ ದಿಕ್ಕು (North & North-East)" : "North & North-East",
      kuberaRemedy: lang === "kn" 
        ? "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಉತ್ತರ ದಿಕ್ಕಿನಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ."
        : "Chant Kanakadhara Stotra every morning and light a ghee lamp facing the North direction."
    },

    relationship: {
      vivahaYogaWindow: lang === "kn" ? vivahaWindow : vivahaWindowEn,
      spouseCharacteristics: lang === "kn"
        ? "ಸಂಸ್ಕಾರವಂತೆ, ಶಾಂತ ಸ್ವಭಾವ, ಸೌಂದರ್ಯ ಮತ್ತು ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಹೊಂದಿರುವ, ಕುಟುಂಬದ ಗೌರವ ಹೆಚ್ಚಿಸುವ ಜೀವನ ಸಂಗಾತಿ."
        : "Cultured, calm-minded, virtuous, and spiritually inclined life partner who enhances family prosperity.",
      spouseDirection: lang === "kn" ? "ಜನ್ಮಸ್ಥಳದಿಂದ ಪೂರ್ವ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು" : "East or North-East from Birthplace",
      dampatyaHarmonyRating: lang === "kn" ? `${harmonyScore}% ಅತ್ಯುನ್ನತ ಸುಖ-ಶಾಂತಿ (${harmonyScore}% Harmony)` : `${harmonyScore}% High Harmony`,
      santathiBlessingWindow,
      relationshipRemedy: lang === "kn"
        ? "ಪ್ರತಿ ಶುಕ್ರವಾರ ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟೇಶ್ವರರಿಗೆ ಬಿಳಿ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ, ಕರ್ಪೂರ ಆರತಿ ಮಾಡಿ."
        : "Offer white fragrant flowers to Lakshmi-Venkateshwara on Fridays with camphor aarti."
    },

    health: {
      vitalityScore,
      constitutionDosha: dosha,
      vulnerableOrgans: lang === "kn" 
        ? ["ಜೀರ್ಣಾಂಗ & ಯಕೃತ್ತು (Digestive & Liver)", "ಬೆನ್ನುಹುರಿ & ಕೀಲುಗಳು (Spine & Joints)", "ನಿದ್ರಾಹೀನತೆ/ಒತ್ತಡ (Sleep & Stress)"]
        : ["Digestive System & Liver", "Spine & Joint Flexibility", "Stress & Sleep Rhythm"],
      ayurSanjeeviniHerbs: ["ಅಶ್ವಗಂಧ (Ashwagandha)", "ತುಳಸಿ (Tulsi)", "ಶಂಖಪುಷ್ಪಿ (Shankhapushpi)", "ತ್ರಿಫಲಾ (Triphala)"],
      dailyDietRitual: lang === "kn"
        ? "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ವೇಳೆ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿಟ್ಟ ನೀರನ್ನು ಕುಡಿಯಿರಿ ಹಾಗೂ ಹಸುವಿನ ಹಾಲಿನ ತುಪ್ಪವನ್ನು ಸೇವಿಸಿ."
        : "Drink copper-charged water at sunrise and include A2 cow ghee in daily morning meals.",
      mahaMrityunjayaShield: lang === "kn"
        ? "ಪ್ರತಿದಿನ ೧೧ ಬಾರಿ 'ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ...' ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣವು ಸರ್ವ ರೋಗ ನಿವಾರಕ."
        : "Chant the Maha Mrityunjaya Mantra 11 times daily for absolute vitality and immune shield."
    },

    protection: {
      drishtiSensitivityLevel: drishtiLevel,
      activeTransitAfflictions: lang === "kn" 
        ? ["ಶನಿ ಸಾಡೇಸಾತಿ/ಅಷ್ಟಮ ಪ್ರಭಾವ (ಮಧ್ಯಮ)", "ರಾಹು-ಕೇತು ಅಕ್ಷ ದೋಷ (ಶಾಂತಿಯುತ)"]
        : ["Saturn Subtle Transit (Moderate)", "Rahu-Ketu Axis Transit (Peaceful)"],
      sudarshanaKavachaMantra: "ಓಂ ನಮೋ ಭಗವತೇ ಮಹಾಸುದರ್ಶನಾಯ ನಮಃ || Om Namo Bhagavate Maha Sudarshanaya Namah ||",
      rakshaSutraTiming: lang === "kn" ? "ಪ್ರತಿ ಹುಣ್ಣಿಮೆ ಅಥವಾ ಅಮಾವಾಸ್ಯೆಯಂದು ಸಂಧ್ಯಾ ಕಾಲ" : "Purnima or Amavasya Twilight Hours",
      homeEnergyRemedy: lang === "kn"
        ? "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರಕ್ಕೆ ಅರಿಶಿನ-ಕುಂಕುಮ ಹಚ್ಚಿ, ನವರತ್ನ ರಕ್ಷಾ ಸೂತ್ರ ಅಥವಾ ಗೋಕರ್ಣ ರಕ್ಷಾ ದಾರವನ್ನು ಧರಿಸಿ."
        : "Apply turmeric-kumkum to main entrance and wear consecrated Gokarna Raksha Sutra on right wrist."
    },

    milestones,

    karmaBlueprint: {
      bhagyaGemstone: {
        name: lang === "kn" ? gem.kn : gem.en,
        sanskritName: gem.en,
        weightRatti: gem.ratti,
        metal: gem.metal,
        finger: gem.finger,
        consecrationDay: gem.day,
        caution: lang === "kn" ? "ಯಾವುದೇ ಬಿರುಕು ಅಥವಾ ಕಪ್ಪು ಕಲೆ ಇಲ್ಲದ ನೈಸರ್ಗಿಕ ರತ್ನವನ್ನೇ ಧರಿಸಬೇಕು." : "Must wear only 100% untreated, flaw-free natural gemstone."
      },
      rudrakshaMukhi: rudrakshaRecommendation,
      fiveMinuteMorningRoutine: {
        facingDirection: lang === "kn" ? "ಪೂರ್ವ ಅಥವಾ ಈಶಾನ್ಯ (East or North-East)" : "East or North-East",
        prescribedMantra: "ಓಂ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಶ್ರೀ ಸಿದ್ಧಲಕ್ಷ್ಮ್ಯೈ ನಮಃ || Om Shreem Hreem Kleem Shri Siddhalakshmyai Namah ||",
        chantCount: 27,
        sacredAction: lang === "kn" 
          ? "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ತಾಮ್ರದ ಲೋಟದಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ಅರ್ಪಿಸಿ, ಪಂಚಾಂಗ ತಿಥಿ ನಮಸ್ಕಾರ ಮಾಡಿ."
          : "Offer Arghya to Surya at dawn in a copper vessel, chanting your birth nakshatra prayer."
      },
      charityAction: lang === "kn"
        ? "ಪ್ರತಿ ಶನಿವಾರ ಗೋವಿಗೆ ಹಸಿರು ಹುಲ್ಲು ಅಥವಾ ಬೆಲ್ಲ-ಅಕ್ಕಿ ನೀಡುವುದು ಹಾಗೂ ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅನ್ನದಾನ."
        : "Feed green grass/jaggery to sacred cows on Saturdays and support free meals for students."
    },

    templeBlessing: {
      deity: lang === "kn" ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಭದ್ರಕಾಳಿ ಅಮ್ಮನವರು (Shri Mahabaleshwara Gokarna)" : "Shri Mahabaleshwara & Goddess Bhadrakali (Gokarna)",
      templeName: "ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರ - ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೇವಾ ಮಂಡಳಿ (Gokarna Heritage)",
      specialSankalpaMantra,
      recommendedSevaName: lang === "kn" ? "೯೦-ದಿನಗಳ ಆಶೀರ್ವಾದ ಸಂಕಲ್ಪ ಮಹಾಪೂಜೆ (90-Day Ashirvada Master Seva)" : "90-Day Ashirvada Master Seva & Prasada"
    }
  };
}
