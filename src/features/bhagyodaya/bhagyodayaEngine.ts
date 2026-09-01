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

/**
 * Calculates the complete Bhagyodaya Mahadarshana Life Dossier from a devotee's KundliOutput.
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
  const devoteeName = input.name || "Devotee";
  const birthDate = input.birthDate;
  const birthTime = input.birthTime;
  const gotra = input.gotra || "ಕಾಶ್ಯಪ";

  const lagnaRashiEng = kundli.lagnaRashi?.english || "Dhanu";
  const moonPlanet = kundli.planets.find(p => p.name === "Moon") || kundli.planets[1];
  const jupiterPlanet = kundli.planets.find(p => p.name === "Jupiter");
  const venusPlanet = kundli.planets.find(p => p.name === "Venus");
  const saturnPlanet = kundli.planets.find(p => p.name === "Saturn");
  const sunPlanet = kundli.planets.find(p => p.name === "Sun");
  const marsPlanet = kundli.planets.find(p => p.name === "Mars");
  const rahuPlanet = kundli.planets.find(p => p.name === "Rahu");

  const moonRashiEng = kundli.moonSign?.english || moonPlanet?.rashi?.english || "Dhanu";
  const nakshatraEng = moonPlanet?.nakshatra?.english || "Mula";
  const nakshatraKn = moonPlanet?.nakshatra?.sanskrit || "ಮೂಲಾ";
  const nakshatraPada = 1;

  const rashiLord = RASHI_LORDS[moonRashiEng] || "Jupiter";
  const lagnaLord = RASHI_LORDS[lagnaRashiEng] || "Jupiter";

  // 1. Wealth & Debt Freedom Calculations
  const hasGajaKesari = jupiterPlanet && moonPlanet && Math.abs(jupiterPlanet.house - moonPlanet.house) % 3 === 0;
  const dhanaScore = Math.min(98, Math.max(65, 70 + (hasGajaKesari ? 15 : 0) + (venusPlanet && (venusPlanet.house === 2 || venusPlanet.house === 11) ? 12 : 5)));
  
  const wealthVerdictKn = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${lagnaRashiEng} ಲಗ್ನದ ${RASHI_KN[lagnaRashiEng] || lagnaRashiEng} ರಾಶ್ಯಾಧಿಪತಿಯ ಬಲದಿಂದಾಗಿ ನಿಮ್ಮ ಜೀವಿತಾವಧಿಯಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು ಸೃಷ್ಟಿಯಾಗುವ ಮಹಾ ಯೋಗವಿದೆ. ${hasGajaKesari ? "ಗಜಕೇಸರಿ ಯೋಗ ಹಾಗೂ ಧನಯೋಗವು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಭದ್ರಪಡಿಸುತ್ತದೆ." : "ದ್ವಿತೀಯ ಮತ್ತು ಏಕಾದಶ ಭಾವಗಳ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನಿರಂತರ ಧನಾಗಮನವಿರುತ್ತದೆ."}`;
  const wealthVerdictEn = `With your ${lagnaRashiEng} Ascendant and strong planetary alignments, you possess powerful Dhana Yogas for exponential wealth accumulation. ${hasGajaKesari ? "Gajakesari Yoga guarantees steady financial resilience and real estate growth." : "Direct aspects on your 2nd and 11th houses ensure recurring income streams."}`;

  // 2. Marriage & Children Calculations
  const vivahaWindow = "೨೦೨೬ ರ ಕೊನೆಯ ತ್ರೈಮಾಸಿಕದಿಂದ ೨೦೨೮ ರ ಮಧ್ಯಭಾಗ (Next 18-24 Months)";
  const vivahaWindowEn = "Late 2026 to Mid 2028 (Next 18-24 Months)";

  // 3. Health Constitution
  const dosha: "Vata" | "Pitta" | "Kapha" | "Tridosha" = 
    ["Mesha", "Simha", "Dhanu"].includes(lagnaRashiEng) ? "Pitta" :
    ["Vrishabha", "Kanya", "Makara"].includes(lagnaRashiEng) ? "Vata" :
    ["Mithuna", "Tula", "Kumbha"].includes(lagnaRashiEng) ? "Vata" : "Kapha";

  // 4. Protection Level
  const drishtiLevel = rahuPlanet && (rahuPlanet.house === 1 || rahuPlanet.house === 7 || rahuPlanet.house === 8) ? "Severe" : "Medium";

  // 5. 10-Year Milestones (2026 - 2036)
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(birthDate.split("-")[0] || "1990", 10);
  const baseAge = currentYear - birthYear;

  const milestoneTemplates = [
    { offset: 0, rating: "golden" as const, themeKn: "ಮಹಾ ಭಾಗ್ಯೋದಯ & ಆರ್ಥಿಕ ತಿರುವು", themeEn: "Financial Breakthrough & Wealth Inflow", reasonKn: "ಗುರು ಗೋಚಾರ ಶುಭ ದೃಷ್ಟಿ ಹಾಗೂ ನವಮ ಭಾವೋದಯ", reasonEn: "Jupiter trine aspect opening 9th house of fortune" },
    { offset: 1, rating: "growth" as const, themeKn: "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ & ಕುಟುಂಬ ವೃದ್ಧಿ", themeEn: "Property Acquisition & Family Harmony", reasonKn: "ಚತುರ್ಥ ಭಾವಾಧಿಪತಿಯ ಶುಭ ಸಂಚಾರ", reasonEn: "4th house lord entering exaltation" },
    { offset: 2, rating: "golden" as const, themeKn: "ಉದ್ಯೋಗ ಬಡ್ತಿ & ಕೀರ್ತಿ ಪ್ರಾಪ್ತಿ", themeEn: "Career Elevation & Stature Growth", reasonKn: "ದಶಮ ಭಾವದಲ್ಲಿ ರವಿ-ಬುಧಾದಿತ್ಯ ಯೋಗ ಸಕ್ರಿಯ", reasonEn: "Budhaditya Yoga energizing the 10th house" },
    { offset: 3, rating: "caution" as const, themeKn: "ಆರೋಗ್ಯ ಜಾಗರೂಕತೆ & ಶಾಂತಿ ಸಂಕಲ್ಪ", themeEn: "Health Vigilance & Spiritual Fortification", reasonKn: "ಶನಿ ಗೋಚಾರ ಮಧ್ಯಂತರ ಸಂಚಾರ", reasonEn: "Saturn transit requiring peace remedies" },
    { offset: 4, rating: "golden" as const, themeKn: "ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ & ಹೊಸ ಯೋಜನೆಗಳು", themeEn: "Business Expansion & Major Ventures", reasonKn: "ಲಾಭ ಭಾವದಲ್ಲಿ ಶುಕ್ರನ ಪ್ರಬಲ ಸ್ಥಾನ", reasonEn: "Venus illuminating the 11th house of gains" },
    { offset: 5, rating: "growth" as const, themeKn: "ವಿದೇಶ/ದೂರ ಪ್ರಯಾಣ & ಜ್ಞಾನಾರ್ಜನೆ", themeEn: "Foreign Travel & Auspicious Relocation", reasonKn: "ದ್ವಾದಶ ಮತ್ತು ನವಮ ಭಾವಗಳ ಸಂಯೋಗ", reasonEn: "9th and 12th house mutual reception" },
    { offset: 6, rating: "golden" as const, themeKn: "ಪೂರ್ಣ ಋಣ ಮುಕ್ತಿ & ಸುಖ ಸಮೃದ್ಧಿ", themeEn: "Total Debt Liberation & Supreme Peace", reasonKn: "ಷಷ್ಠಾಧಿಪತಿಯ ಉಪಶಮನ ಹಾಗೂ ಧನ ಸ್ಥಾನ ಬಲವರ್ಧನೆ", reasonEn: "Complete dissolution of 6th house obligations" },
    { offset: 7, rating: "growth" as const, themeKn: "ಮಕ್ಕಳ ಪ್ರಗತಿ & ಸಂತೋಷ", themeEn: "Children's Prosperity & Academic Honors", reasonKn: "ಪಂಚಮ ಭಾವದಲ್ಲಿ ದೇವಗುರು ಅನುಗ್ರಹ", reasonEn: "Jupiter illuminating the 5th house of progeny" },
    { offset: 8, rating: "caution" as const, themeKn: "ಹೂಡಿಕೆ ಎಚ್ಚರಿಕೆ & ದಾನ ಧರ್ಮ", themeEn: "Investment Caution & Sacred Charity", reasonKn: "ರಾಹು-ಕೇತು ಅಕ್ಷ ಸಂಚಾರ", reasonEn: "Rahu-Ketu nodal axis shift" },
    { offset: 9, rating: "golden" as const, themeKn: "ಪರಿಪೂರ್ಣ ಆತ್ಮತೃಪ್ತಿ & ಯಶಸ್ಸು", themeEn: "Mastery, Fulfilled Desires & Spiritual Heights", reasonKn: "ಲಗ್ನಾಧಿಪತಿಯ ಸಾರ್ವಭೌಮ ದಶಾ ಫಲ", reasonEn: "Lagna Lord major sub-period culmination" }
  ];

  const milestones: GoldenMilestoneYear[] = milestoneTemplates.map((t, idx) => {
    const yr = currentYear + idx;
    const age = baseAge + idx;
    return {
      year: yr,
      age,
      rating: t.rating,
      ratingLabel: t.rating === "golden" ? (lang === "kn" ? "🌟 ಸ್ವರ್ಣಾವಧಿ (Golden)" : "🌟 Golden Era") : t.rating === "growth" ? (lang === "kn" ? "📈 ಸ್ಥಿರ ಪ್ರಗತಿ (Growth)" : "📈 Steady Growth") : (lang === "kn" ? "⚠️ ಶಾಂತಿ ಅವಧಿ (Caution)" : "⚠️ Vigilance Period"),
      theme: lang === "kn" ? t.themeKn : t.themeEn,
      astrologicalReason: lang === "kn" ? t.reasonKn : t.reasonEn,
      actionableGuidance: lang === "kn" ? `ಈ ವರ್ಷದಲ್ಲಿ ${t.themeKn.toLowerCase()}ಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.` : `Seize key decisions around ${t.themeEn.toLowerCase()} during this cycle.`,
      favorableMonths: [lang === "kn" ? "ಏಪ್ರಿಲ್ - ಜೂನ್" : "April - June", lang === "kn" ? "ಅಕ್ಟೋಬರ್ - ಡಿಸೆಂಬರ್" : "October - December"]
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
    gotra,

    wealth: {
      dhanaYogaScore: dhanaScore,
      dhanaYogaName: hasGajaKesari ? "ಗಜಕೇಸರಿ ಮಹಾಲಕ್ಷ್ಮಿ ಯೋಗ (Gajakesari Mahalakshmi Yoga)" : "ದ್ವಿತೀಯ-ಏಕಾದಶ ಧನ ಯೋಗ (Dhana-Labha Yoga)",
      wealthVerdict: lang === "kn" ? wealthVerdictKn : wealthVerdictEn,
      runaVimochanaTimeline: lang === "kn" ? "೨೦೨೬ ರ ದೀಪಾವಳಿಯಿಂದ ೨೦೨೭ ರ ಯುಗಾದಿ ಒಳಗೆ ಸಾಲ ಬಾಧೆಗಳಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತಿ" : "Between Diwali 2026 and Yugadi 2027 complete relief from debts",
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
      dampatyaHarmonyRating: "೮೮% ಅತ್ಯುನ್ನತ ಸುಖ-ಶಾಂತಿ (88% High Harmony)",
      santathiBlessingWindow: lang === "kn" ? "೨೦೨೭ ರ ಶುಭ ಗುರು ಸಂಚಾರ ಕಾಲಾವಧಿ" : "During 2027 Jupiter Transit Window",
      relationshipRemedy: lang === "kn"
        ? "ಪ್ರತಿ ಶುಕ್ರವಾರ ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟೇಶ್ವರರಿಗೆ ಬಿಳಿ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ, ಕರ್ಪೂರ ಆರತಿ ಮಾಡಿ."
        : "Offer white fragrant flowers to Lakshmi-Venkateshwara on Fridays with camphor aarti."
    },

    health: {
      vitalityScore: 86,
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
      rudrakshaMukhi: lang === "kn" ? "೫ ಮುಖಿ ಮತ್ತು ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 7 Mukhi Nepali Rudraksha)" : "5 Mukhi and 7 Mukhi Nepali Rudraksha",
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
      specialSankalpaMantra: "ಶ್ರೀಮತ್ ಕಾಶ್ಯಪ ಗೋತ್ರೋದ್ಭವಸ್ಯ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧರ್ಥಂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿ ರಸ್ತು ||",
      recommendedSevaName: lang === "kn" ? "೯೦-ದಿನಗಳ ಆಶೀರ್ವಾದ ಸಂಕಲ್ಪ ಮಹಾಪೂಜೆ (90-Day Ashirvada Master Seva)" : "90-Day Ashirvada Master Seva & Prasada"
    }
  };
}
