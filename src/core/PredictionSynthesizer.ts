import type { KundliOutput, PlanetName, Rashi } from "./AstroTypes";
import type { DashaEntry } from "./DashaBhuktiEngine";
import predictiveRules from "../data/predictive_rules.json";

export type PredictionCategory = string;

export type SynthesizedPrediction = {
  category: PredictionCategory;
  text: string;
  sourceLang?: string;
};

export type BhuktiData = {
  maha: DashaEntry;
  bhukti: PlanetName;
  bhuktiStartAge: number;
  bhuktiEndAge: number;
};

function sample(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRashiIndex(rashi: Rashi | string | undefined): number {
  if (!rashi) return 0;
  if (typeof rashi === "string") {
    const rashiNames = [
      "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
    ];
    return Math.max(0, rashiNames.indexOf(rashi));
  }
  return rashi.index;
}

const BENEFIC_GOCHARA: Record<string, number[]> = {
  "Saturn": [3, 6, 11],
  "Jupiter": [2, 5, 7, 9, 11],
  "Sun": [3, 6, 10, 11],
  "Mars": [3, 6, 11],
  "Rahu": [3, 6, 10, 11],
  "Ketu": [3, 6, 11],
  "Venus": [1, 2, 3, 4, 5, 8, 9, 11, 12],
  "Mercury": [2, 4, 6, 8, 10, 11],
  "Moon": [1, 3, 6, 7, 10, 11]
};

const MALEFIC_GOCHARA: Record<string, number[]> = {
  "Saturn": [1, 2, 4, 8, 12],
  "Jupiter": [1, 3, 4, 6, 8, 10, 12],
  "Sun": [1, 2, 4, 5, 7, 8, 9, 12],
  "Mars": [1, 2, 4, 5, 7, 8, 9, 12],
  "Rahu": [1, 2, 4, 5, 7, 8, 9, 12],
  "Ketu": [1, 2, 4, 5, 7, 8, 9, 10, 12]
};

const EXALTATION_SIGNS: Record<string, number> = {
  "Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6
};

const DEBILITATION_SIGNS: Record<string, number> = {
  "Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11, "Jupiter": 9, "Venus": 5, "Saturn": 0
};

function getDignity(planetName: string, rashiIndex: number): string | null {
  if (EXALTATION_SIGNS[planetName] === rashiIndex) return "exalted (Uccha)";
  if (DEBILITATION_SIGNS[planetName] === rashiIndex) return "debilitated (Neecha)";
  return null;
}

function makeJargonFree(text: string): string {
  if (!text) return "";
  let cleanText = text
    .replace(/Native is/gi, "You are")
    .replace(/Native will/gi, "You will")
    .replace(/Native/gi, "You")
    .replace(/native is/gi, "you are")
    .replace(/native/gi, "you")
    .replace(/In house \d+:/gi, "")
    .replace(/planet/gi, "energy")
    .replace(/Dasha/gi, "major life chapter")
    .replace(/Bhukti/gi, "sub-chapter");
  
  cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
  return cleanText;
}

export function synthesizePredictions(
  natalKundali: KundliOutput | null,
  activeBhuktiData: BhuktiData | undefined,
  gocharaPositions: { name: PlanetName; rashiIndex: number }[]
): SynthesizedPrediction[] {
  const predictions: SynthesizedPrediction[] = [];

  if (!natalKundali) return predictions;

  const rules = predictiveRules as any;

  // --- 1. Natal Potential (Janana Kundali) ---
  let natalText = "";
  const lagnaRashiName = natalKundali.lagnaRashi.english;
  const lagnaLord = rules.astrology_engine_core?.zodiac_signs?.[lagnaRashiName]?.lord;
  
  if (lagnaLord) {
    const lagnaLordPlanet = natalKundali.planets.find(p => p.name === lagnaLord);
    const lagnaNature = rules.astrology_engine_core?.zodiac_signs?.[lagnaRashiName]?.element?.toLowerCase() || 'dynamic';
    
    natalText += sample([
      `Your cosmic blueprint begins with your Ascendant in ${lagnaRashiName}, endowing you with a strong ${lagnaNature} nature. `,
      `Born with ${lagnaRashiName} rising on the eastern horizon, your core personality carries a deeply ${lagnaNature} vibration. `,
      `With ${lagnaRashiName} as your Ascendant, your fundamental character is inherently ${lagnaNature}. `
    ]);
    
    if (lagnaLordPlanet) {
      const lordHouse = lagnaLordPlanet.house;
      const dignity = getDignity(lagnaLord, lagnaLordPlanet.rashi.index);
      
      if (dignity) {
        natalText += sample([
          `Your ruling planet ${lagnaLord} is ${dignity} in your birth chart, amplifying its influence. `,
          `Notably, your ascendant lord ${lagnaLord} is placed in a ${dignity} state, making its impact highly pronounced in your life. `,
          `Because your ruling planet ${lagnaLord} is ${dignity}, its traits are powerfully magnified in your destiny. `
        ]);
      }

      const firstLordRule = rules.bhava_lords_in_houses?.first_lord_lagnesha?.[`in_house_${lordHouse}`];
      if (firstLordRule) {
        const cleanedRule = makeJargonFree(firstLordRule).toLowerCase();
        natalText += sample([
          `Since ${lagnaLord} is placed in your ${lordHouse}th house, ${cleanedRule} `,
          `Because your ruling planet occupies the ${lordHouse}th house, it means that ${cleanedRule} `,
          `With ${lagnaLord} situated in the ${lordHouse}th house of your chart, ${cleanedRule} `
        ]);
      }
    }
  }

  // Moon placement
  const moonPlanet = natalKundali.planets.find(p => p.name === "Moon");
  if (moonPlanet) {
    const moonRule = rules.planets_in_bhavas?.moon?.[`in_house_${moonPlanet.house}`];
    if (moonRule) {
      const cleanedMoonRule = makeJargonFree(moonRule).toLowerCase();
      natalText += sample([
        `Emotionally, with the Moon located in your ${moonPlanet.house}th house, ${cleanedMoonRule} `,
        `On a psychological level, because your Moon is in the ${moonPlanet.house}th house, ${cleanedMoonRule} `,
        `Looking at your mind and emotions, the Moon's placement in the ${moonPlanet.house}th house suggests that ${cleanedMoonRule} `
      ]);
    }
  }

  if (natalText) {
    predictions.push({
      category: "Natal Potential",
      text: natalText.trim()
    });
  }

  // --- 2. Current Life Chapter (Dasha Bhukti) ---
  let dashaText = "";
  if (activeBhuktiData) {
    const dashaLord = activeBhuktiData.maha.planet;
    const bhuktiLord = activeBhuktiData.bhukti;
    
    const dashaPlanet = natalKundali.planets.find((p) => p.name === dashaLord);
    const bhuktiPlanet = natalKundali.planets.find((p) => p.name === bhuktiLord);
    
    const dashaMetadata = rules.planetary_specification?.graha_metadata?.find((g: any) => g.planet === dashaLord);
    
    dashaText += sample([
      `You are currently navigating the major era of ${dashaLord} and the sub-period of ${bhuktiLord}. `,
      `At this stage in your life, the overarching planetary influence is governed by ${dashaLord}, with a secondary focus driven by ${bhuktiLord}. `,
      `Your current astrological life chapter is dictated by the ${dashaLord} major period and the ${bhuktiLord} sub-period. `
    ]);
    
    if (dashaMetadata) {
      const rep = dashaMetadata.representation?.toLowerCase() || 'life growth';
      dashaText += sample([
        `During this time, the cosmic focus heavily shifts toward matters of ${rep}. `,
        `Consequently, issues surrounding ${rep} will take center stage for you. `,
        `Because of this, your energy naturally gravitates toward themes of ${rep}. `
      ]);
    }

    if (dashaPlanet) {
      const dashaRule = rules.planets_in_bhavas?.[dashaLord.toLowerCase()]?.[`in_house_${dashaPlanet.house}`];
      if (dashaRule) {
        dashaText += sample([
          `Since ${dashaLord} was positioned in your ${dashaPlanet.house}th house at birth, this era's overarching theme is: ${makeJargonFree(dashaRule)} `,
          `Because ${dashaLord} occupies your ${dashaPlanet.house}th house, the broader narrative of this period implies that ${makeJargonFree(dashaRule).toLowerCase()} `,
          `With ${dashaLord} sitting in your ${dashaPlanet.house}th house natively, expect this phase to mean: ${makeJargonFree(dashaRule)} `
        ]);
      }
    }

    if (bhuktiPlanet) {
      const bhuktiRule = rules.planets_in_bhavas?.[bhuktiLord.toLowerCase()]?.[`in_house_${bhuktiPlanet.house}`];
      if (bhuktiRule) {
        dashaText += sample([
          `Simultaneously, the active sub-influence of ${bhuktiLord} from your ${bhuktiPlanet.house}th house is adding a sharp daily focus, meaning: ${makeJargonFree(bhuktiRule)} `,
          `On a day-to-day level, ${bhuktiLord} in your ${bhuktiPlanet.house}th house refines this experience, indicating that ${makeJargonFree(bhuktiRule).toLowerCase()} `,
          `Meanwhile, the sub-period of ${bhuktiLord} (placed in the ${bhuktiPlanet.house}th house) brings a specific undercurrent to your life: ${makeJargonFree(bhuktiRule)} `
        ]);
      }
    }
  } else {
    dashaText = sample([
      "You are currently in a transitional life chapter. The cosmic energies are urging you to balance your inner self and prepare for the upcoming major phase.",
      "Right now, you are navigating a period of transition between major planetary cycles. It's a time for reflection and preparation.",
      "Your chart indicates you are in a transitional phase between planetary periods, making this an ideal time for grounding and inner focus."
    ]);
  }

  if (dashaText) {
    predictions.push({
      category: "Current Life Chapter",
      text: dashaText.trim()
    });
  }

  // --- 3. Cosmic Environment (Gochara Transits) ---
  let gocharaText = "";
  const moonSignIndex = getRashiIndex(natalKundali.moonSign);
  
  const keyTransits = ["Saturn", "Jupiter", "Rahu", "Mars", "Sun"];
  let hasTransits = false;

  for (const gochara of gocharaPositions) {
    if (!keyTransits.includes(gochara.name)) continue;
    
    let transitHouse = ((gochara.rashiIndex - moonSignIndex + 12) % 12) + 1;
    
    const isBenefic = BENEFIC_GOCHARA[gochara.name]?.includes(transitHouse);
    const isMalefic = MALEFIC_GOCHARA[gochara.name]?.includes(transitHouse);
    
    const houseSignifications = rules.bhava_karakatwas_house_significations?.[`house_${transitHouse}`]?.signifies?.join(", ");
    
    if (houseSignifications) {
      if (isBenefic) {
        gocharaText += sample([
          `The current transit of ${gochara.name} in your ${transitHouse}th house from the Moon is highly favorable. It positively activates matters related to ${houseSignifications.toLowerCase()}. `,
          `At this moment, ${gochara.name} is moving through your ${transitHouse}th house, which is an extremely auspicious transit, blessing areas involving ${houseSignifications.toLowerCase()}. `,
          `You are receiving very supportive energy from ${gochara.name} as it transits your ${transitHouse}th house, bringing positive developments in ${houseSignifications.toLowerCase()}. `
        ]);
        hasTransits = true;
      } else if (isMalefic) {
        gocharaText += sample([
          `Presently, transiting ${gochara.name} in your ${transitHouse}th house from the Moon demands patience. You may experience slow progress or friction regarding ${houseSignifications.toLowerCase()}. `,
          `With ${gochara.name} currently transiting your ${transitHouse}th house, you need to exercise caution. There might be some hurdles or delays concerning ${houseSignifications.toLowerCase()}. `,
          `The transit of ${gochara.name} through your ${transitHouse}th house is a bit challenging right now, asking you to be patient with matters of ${houseSignifications.toLowerCase()}. `
        ]);
        hasTransits = true;
      }
    }
  }

  if (!hasTransits) {
    gocharaText = sample([
      "The major transiting planets are currently in neutral positions relative to your Moon sign, bringing a period of cosmic stability and steady routines.",
      "Currently, the heavy-hitting planets are moving through neutral zones in your chart, which means life should feel relatively stable and predictable.",
      "You are in a phase of cosmic equilibrium, as the major planets are transiting through areas that don't cause significant disruption or sudden windfalls."
    ]);
  }

  predictions.push({
    category: "Cosmic Environment",
    text: gocharaText.trim()
  });

  return predictions;
}
