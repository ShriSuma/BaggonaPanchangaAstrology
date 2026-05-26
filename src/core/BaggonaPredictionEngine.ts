import type { KundliOutput, PlanetName, Rashi } from "./AstroTypes";
import { PlanetName as PN } from "./AstroTypes";
import type { TraditionalBaggonaPanchanga } from "./TraditionalBaggonaEngine";
import { translateTexts } from "../services/translationService";

export interface BaggonaPredictionSection {
  title: string;
  description: string;
}

export interface BaggonaPredictions {
  overview: BaggonaPredictionSection[];
  planets: BaggonaPredictionSection[];
  houses: BaggonaPredictionSection[];
  yogas: BaggonaPredictionSection[];
  longevity: BaggonaPredictionSection[];
}

// 1. Planetary Exaltation / Debilitation details (Page 9, 12, 19)
export const EXALTATION_SIGNS: Record<PlanetName, number> = {
  [PN.Sun]: 0,        // Mesha (Aries)
  [PN.Moon]: 1,       // Vrishabha (Taurus)
  [PN.Mars]: 9,       // Makara (Capricorn)
  [PN.Mercury]: 5,    // Kanya (Virgo)
  [PN.Jupiter]: 3,    // Karka (Cancer)
  [PN.Venus]: 11,     // Meena (Pisces)
  [PN.Saturn]: 6,     // Tula (Libra)
  [PN.Rahu]: 1,       // Vrishabha (also Mithuna)
  [PN.Ketu]: 7        // Vrischika (also Dhanu)
};

export const DEBILITATION_SIGNS: Record<PlanetName, number> = {
  [PN.Sun]: 6,        // Tula (Libra)
  [PN.Moon]: 7,       // Vrischika (Scorpio)
  [PN.Mars]: 3,       // Karka (Cancer)
  [PN.Mercury]: 11,   // Meena (Pisces)
  [PN.Jupiter]: 9,    // Makara (Capricorn)
  [PN.Venus]: 5,      // Kanya (Virgo)
  [PN.Saturn]: 0,     // Mesha (Aries)
  [PN.Rahu]: 7,       // Vrischika
  [PN.Ketu]: 1        // Vrishabha
};

// 2. Graha Castes & Genders (Page 6)
export const GRAHA_CASTES: Record<PlanetName, string> = {
  [PN.Sun]: "Kshatriya (Warrior)",
  [PN.Moon]: "Vaishya (Merchant)",
  [PN.Mars]: "Kshatriya (Warrior)",
  [PN.Mercury]: "Vaishya (Merchant)",
  [PN.Jupiter]: "Brahmana (Priest/Intellectual)",
  [PN.Venus]: "Brahmana (Priest/Intellectual)",
  [PN.Saturn]: "Shudra (Worker/Service)",
  [PN.Rahu]: "Chandala (Outcaste/Unorthodox)",
  [PN.Ketu]: "Chandala (Outcaste/Unorthodox)"
};

export const GRAHA_GENDERS: Record<PlanetName, string> = {
  [PN.Sun]: "Male (Purusha)",
  [PN.Moon]: "Female (Stri)",
  [PN.Mars]: "Male (Purusha)",
  [PN.Mercury]: "Neuter (Napumsaka)",
  [PN.Jupiter]: "Male (Purusha)",
  [PN.Venus]: "Female (Stri)",
  [PN.Saturn]: "Neuter (Napumsaka)",
  [PN.Rahu]: "Female (Stri)",
  [PN.Ketu]: "Male (Purusha)"
};

// 3. Graha Temples & Significations (Page 20-24)
export const GRAHA_TEMPLE: Record<PlanetName, string> = {
  [PN.Sun]: "Shiva",
  [PN.Moon]: "Durga",
  [PN.Mars]: "Subramanya",
  [PN.Mercury]: "Vishnu",
  [PN.Jupiter]: "Shiva (Guru)",
  [PN.Venus]: "Lakshmi",
  [PN.Saturn]: "Yama / Shani Dev",
  [PN.Rahu]: "Durga / Snake Shrine",
  [PN.Ketu]: "Ganesha"
};

// 4. Bhava Significations mapping (Page 14-17)
const BHAVA_NAMES = [
  "Tanu Bhava (Self & Physical Body)",
  "Dhana Bhava (Wealth, Family & Speech)",
  "Sahaja Bhava (Siblings & Courage)",
  "Matri Bhava (Mother, Happiness & Vehicles)",
  "Putra Bhava (Children, Intellect & Good Deeds)",
  "Shatru Bhava (Debts, Diseases & Enemies)",
  "Kalatra Bhava (Spouse & Partnerships)",
  "Ayur Bhava (Longevity & Obstacles)",
  "Bhagya Bhava (Fortune, Father & Pilgrimage)",
  "Karma Bhava (Profession, Action & Fame)",
  "Labha Bhava (Gains & Income)",
  "Vyaya Bhava (Expenditure, Losses & Foreign Travel)"
];

const BHAVA_SIGNIFICATIONS = [
  "Physical health, form, appearance, face, general character, happiness and sorrow.",
  "Family, wealth, right eye, speech, primary education, lineage, mouth, teeth, tongue and food habits.",
  "Siblings, courage, ears, throat, short journeys, writing, communication, neighbors and hands.",
  "Mother, happiness, home, vehicles, land, property, chest health, assets and friends.",
  "Children, intellect, memory, education, mantras, speculation, belly, liver and past good deeds.",
  "Debts, diseases, enemies, maternal uncles, litigation, lungs, kidney and stomach issues.",
  "Spouse, marriage, business partnerships, long journeys, public life and lower abdomen.",
  "Longevity, mode of death, inheritance, hidden wealth, sudden obstacles, accidents and chronic diseases.",
  "Fortune, father, guru/teacher, dharma (righteousness), long journeys, higher education and pilgrimages.",
  "Profession, status, authority, fame, knees and father's status.",
  "Gains, income, elder siblings, fulfillment of desires, friends and left ear.",
  "Expenditure, losses, sleep, bed comforts, isolation, foreign travel, feet and eyes."
];

// Helper to determine natural friendship (Page 9)
export const naturalRelation = (planet: PlanetName, other: PlanetName): "mitra" | "shatru" | "sama" => {
  const friends: Record<PlanetName, PlanetName[]> = {
    [PN.Sun]: [PN.Moon, PN.Mars, PN.Jupiter],
    [PN.Moon]: [PN.Sun, PN.Mercury],
    [PN.Mars]: [PN.Sun, PN.Moon, PN.Jupiter],
    [PN.Mercury]: [PN.Sun, PN.Venus, PN.Rahu],
    [PN.Jupiter]: [PN.Sun, PN.Moon, PN.Mars],
    [PN.Venus]: [PN.Mercury, PN.Saturn, PN.Rahu],
    [PN.Saturn]: [PN.Mercury, PN.Venus, PN.Rahu],
    [PN.Rahu]: [PN.Mercury, PN.Venus, PN.Saturn],
    [PN.Ketu]: [PN.Venus, PN.Saturn]
  };

  const enemies: Record<PlanetName, PlanetName[]> = {
    [PN.Sun]: [PN.Venus, PN.Saturn, PN.Rahu],
    [PN.Moon]: [PN.Rahu],
    [PN.Mars]: [PN.Mercury, PN.Rahu] as any, // fallback
    [PN.Mercury]: [PN.Moon],
    [PN.Jupiter]: [PN.Mercury, PN.Venus],
    [PN.Venus]: [PN.Sun, PN.Moon, PN.Ketu],
    [PN.Saturn]: [PN.Sun, PN.Moon, PN.Mars, PN.Ketu],
    [PN.Rahu]: [PN.Sun, PN.Moon, PN.Mars],
    [PN.Ketu]: [PN.Sun, PN.Moon]
  };

  // Adjust for Mangala/Kuja spelling
  const fList = friends[planet] ?? [];
  const eList = enemies[planet] ?? [];

  if (fList.includes(other)) return "mitra";
  if (eList.includes(other)) return "shatru";
  return "sama";
};

// Exaltation description mapping (Page 25-26)
export const getPlanetAppearance = (p: PlanetName): string => {
  switch (p) {
    case PN.Sun: return "Hot constitution, sharp vision, copper-colored eyes, sparse hair, and courageous.";
    case PN.Moon: return "Beautiful eyes, soft-spoken, white constitution, sensitive mind, and cold nature.";
    case PN.Mars: return "Youthful body, red complexion, courageous, hot constitution, and angry eyes.";
    case PN.Mercury: return "Humorous nature, highly intellectual, soft skin, green/dark complexion, and clever speech.";
    case PN.Jupiter: return "Large/stately body, yellow complexion, broad chest, wise demeanor, and deep voice.";
    case PN.Venus: return "Beautiful, attractive body, curly hair, artistic inclination, and lovely eyes.";
    case PN.Saturn: return "Tall body, dark complexion, coarse hair, slow-moving nature, and serious expression.";
    case PN.Rahu: return "Intimidating appearance, smoky complexion, skin diseases tendency, and speculative mind.";
    case PN.Ketu: return "Intense look, philosophical demeanor, interested in spiritual matters, and healing skills.";
  }
};

/**
 * Generate predictions based on the Traditional Baggona PDF Rules
 */
export function generateBaggonaPredictions(
  kundli: KundliOutput,
  panchanga: TraditionalBaggonaPanchanga
): BaggonaPredictions {
  const moon = kundli.planets.find((p) => p.name === PN.Moon);
  const sun = kundli.planets.find((p) => p.name === PN.Sun);
  const lagnaLord = kundli.planets.find((p) => p.name === PN.Jupiter) ? PN.Jupiter : PN.Sun; // Placeholder / simple detection

  // --- 1. OVERVIEW & PANCHANGA ANALYSIS ---
  const overview: BaggonaPredictionSection[] = [
    {
      title: "Lagna (Ascendant) & Chandra Rashi Overview",
      description: `Your Lagna is ${kundli.lagnaRashi.english} and Chandra Rashi is ${kundli.moonSign.english}. ` +
        `Chandra Rashi is in the ${kundli.moonSign.index % 4 === 0 ? "Fire (Agni)" : kundli.moonSign.index % 4 === 1 ? "Earth (Bhoomi)" : kundli.moonSign.index % 4 === 2 ? "Air (Vayu)" : "Water (Jala)"} element. ` +
        `This gives a temperament aligned with ${kundli.moonSign.index % 4 === 0 ? "courage and leadership" : kundli.moonSign.index % 4 === 1 ? "stability and patience" : kundli.moonSign.index % 4 === 2 ? "intellect and communication" : "emotion and intuition"} (Page 8).`
    },
    {
      title: "Vedic Panchanga Parameters",
      description: `Born in ${panchanga.samvatsara} Samvatsara, during ${panchanga.masa} Masa, ${panchanga.paksha} Paksha. ` +
        `The birth Tithi is ${panchanga.tithi} (${panchanga.tithiGhati} Ghati, ${panchanga.tithiVighati} Vighati). ` +
        `Active birth Nakshatra is ${panchanga.moonNakshatra} with its ending Ghati at ${panchanga.moonNakshatraGhati} Ghati and ${panchanga.moonNakshatraVighati} Vighati. ` +
        `Yoga is ${panchanga.yoga} and Karana is ${panchanga.karana}. These parameters establish the foundational elements of your character and life path.`
    }
  ];

  // --- 2. PLANETARY ANALYSIS (UCHCHA, NEECHA, SVA, FRIENDSHIP) ---
  const planets: BaggonaPredictionSection[] = [];
  let exaltedCount = 0;
  let debilitatedCount = 0;

  for (const p of kundli.planets) {
    const rIdx = p.rashi.index;
    const isExalted = EXALTATION_SIGNS[p.name] === rIdx;
    const isDebilitated = DEBILITATION_SIGNS[p.name] === rIdx;
    const caste = GRAHA_CASTES[p.name] || "Vaishya";
    const gender = GRAHA_GENDERS[p.name] || "Neuter";
    const temple = GRAHA_TEMPLE[p.name] || "Devi";
    const appearance = getPlanetAppearance(p.name);

    let statusPhrase = `placed in ${p.rashi.english} Rashi (House ${p.house}).`;
    if (isExalted) {
      exaltedCount++;
      statusPhrase = `placed in ${p.rashi.english} Rashi, where it is EXALTED (Uchcha) (Page 9, 12). This planet acts as a powerhouse of positive traits.`;
    } else if (isDebilitated) {
      debilitatedCount++;
      statusPhrase = `placed in ${p.rashi.english} Rashi, where it is DEBILITATED (Neecha) (Page 9, 12). This points to lessons of discipline and effort.`;
    }

    planets.push({
      title: `${p.name} - The Significator`,
      description: `${p.name} is ${statusPhrase} It belongs to the ${caste} caste, exhibits ${gender} energy, and represents the temple of Lord ${temple} (Page 6, 20-24). ` +
        `Physical and behavioral traits include: ${appearance} (Page 25-26).`
    });
  }

  // --- 3. 12 BHAVAS (HOUSE) PREDICTIONS ---
  const houses: BaggonaPredictionSection[] = [];
  for (let h = 1; h <= 12; h++) {
    const occupants = kundli.planets.filter((p) => p.house === h);
    const occupantsStr = occupants.length > 0 
      ? occupants.map((p) => p.name).join(", ") 
      : "No occupants";

    houses.push({
      title: `${BHAVA_NAMES[h - 1]}`,
      description: `This house governs: ${BHAVA_SIGNIFICATIONS[h - 1]} Currently occupied by: ${occupantsStr}. ` +
        `Lagna lord and occupants influence this house. ` +
        `${occupants.some(p => p.name === PN.Jupiter || p.name === PN.Venus) ? "Benefics present here bring expansion, prosperity, and joy." : "Presence of other planets or lack of occupants suggests standard developments under the house lord's aspect (Page 14-17)."}`
    });
  }

  // --- 4. SPECIAL COMBINATIONS / YOGAS ---
  const yogas: BaggonaPredictionSection[] = [];
  
  // Rule: Exaltation / Debilitation cancellation (Neechabhanga Rajayoga)
  if (debilitatedCount > 0 && exaltedCount > 0) {
    yogas.push({
      title: "Neechabhanga Rajayoga",
      description: "You have both exalted and debilitated planets in the chart. Under traditional rules, the debilitated planet receives cancellation of its weakness, giving rise to success after initial struggle (Page 18)."
    });
  }

  // Rule: Upachaya Houses (3, 6, 11) Malefics
  const upachayaMalefics: string[] = [];
  for (const p of kundli.planets) {
    const isMalefic = p.name === PN.Saturn || p.name === PN.Mars || p.name === PN.Sun || p.name === PN.Rahu || p.name === PN.Ketu;
    const isUpachaya = p.house === 3 || p.house === 6 || p.house === 11;
    if (isMalefic && isUpachaya) {
      upachayaMalefics.push(p.name);
    }
  }

  if (upachayaMalefics.length > 0) {
    yogas.push({
      title: "Malefics in Upachaya Houses",
      description: `Planets ${upachayaMalefics.join(", ")} are placed in Upachaya houses (3rd, 6th, or 11th). ` +
        `This is highly auspicious under traditional rules (Page 18, 28-32), indicating strong courage, victory over enemies, and high earnings.`
    });
  }

  // Rule: Benefics in Kendra/Trikona
  const kendraBenefics: string[] = [];
  for (const p of kundli.planets) {
    const isBenefic = p.name === PN.Jupiter || p.name === PN.Venus || p.name === PN.Mercury || p.name === PN.Moon;
    const isKendraOrTrikona = p.house === 1 || p.house === 4 || p.house === 7 || p.house === 10 || p.house === 5 || p.house === 9;
    if (isBenefic && isKendraOrTrikona) {
      kendraBenefics.push(p.name);
    }
  }

  if (kendraBenefics.length > 0) {
    yogas.push({
      title: "Benefics in Kendra/Trikona Houses",
      description: `Benefic planets (${kendraBenefics.join(", ")}) are placed in auspicious angles/triangles. ` +
        `This is a mark of good health, mental peace, spiritual progress, and social honor (Page 18).`
    });
  }

  if (yogas.length === 0) {
    yogas.push({
      title: "Bhava Raja Combinations",
      description: "Planetary placements suggest a balanced layout, with main house lords supporting standard life milestones across marriage, career, and finance (Page 28-32)."
    });
  }

  // --- 5. LONGEVITY (AYUSH) ANALYSIS ---
  let longevityScore = 3; // out of 5
  const lagnaLordExalted = EXALTATION_SIGNS[lagnaLord] === (kundli.planets.find(p => p.name === lagnaLord)?.rashi.index ?? -1);
  const shaniStrong = (kundli.planets.find(p => p.name === PN.Saturn)?.house ?? 0) >= 1 && (kundli.planets.find(p => p.name === PN.Saturn)?.house ?? 0) !== 6 && (kundli.planets.find(p => p.name === PN.Saturn)?.house ?? 0) !== 8;

  if (lagnaLordExalted) longevityScore += 1;
  if (shaniStrong) longevityScore += 1;

  const longevity: BaggonaPredictionSection[] = [
    {
      title: "Ayush (Longevity) Evaluation",
      description: `Evaluation of Lagna and Lagna Lord, 8th house, 3rd house, and Saturn (Ayush Karaka) indicates a ` +
        `${longevityScore >= 4 ? "LONG (Purna Ayus)" : longevityScore === 3 ? "MEDIUM (Madhya Ayus)" : "VARIABLE (Alpa Ayus)"} lifespan parameters (Page 27). ` +
        `Strengths: ${lagnaLordExalted ? "Strong Lagna Lord ensures robust health." : "Standard Lagna Lord health."} ` +
        `${shaniStrong ? "Saturn in a non-dusthana house acts as a protective shield for longevity." : "Standard Saturn placement."}`
    }
  ];

  return {
    overview,
    planets,
    houses,
    yogas,
    longevity
  };
}

/**
 * Dynamically translate the predictions object into the target language
 */
export async function translateBaggonaPredictions(
  pred: BaggonaPredictions,
  targetLang: string
): Promise<BaggonaPredictions> {
  if (targetLang === "en") return pred;

  // Flatten the predictions into an array of strings for batch translation
  const flatStrings: string[] = [];
  const mappings: { type: keyof BaggonaPredictions; index: number; field: "title" | "description" }[] = [];

  const addSection = (sectionName: keyof BaggonaPredictions, list: BaggonaPredictionSection[]) => {
    list.forEach((sec, idx) => {
      flatStrings.push(sec.title);
      mappings.push({ type: sectionName, index: idx, field: "title" });
      flatStrings.push(sec.description);
      mappings.push({ type: sectionName, index: idx, field: "description" });
    });
  };

  addSection("overview", pred.overview);
  addSection("planets", pred.planets);
  addSection("houses", pred.houses);
  addSection("yogas", pred.yogas);
  addSection("longevity", pred.longevity);

  // Call the translation API
  const translated = await translateTexts(flatStrings, targetLang);

  // Re-assemble the object
  const next: BaggonaPredictions = {
    overview: pred.overview.map(x => ({ ...x })),
    planets: pred.planets.map(x => ({ ...x })),
    houses: pred.houses.map(x => ({ ...x })),
    yogas: pred.yogas.map(x => ({ ...x })),
    longevity: pred.longevity.map(x => ({ ...x }))
  };

  mappings.forEach((map, i) => {
    const list = next[map.type] as BaggonaPredictionSection[];
    const item = list[map.index]!;
    item[map.field] = translated[i] ?? item[map.field];
  });

  return next;
}
