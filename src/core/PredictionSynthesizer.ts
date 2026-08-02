import type { KundliOutput, PlanetName, Rashi } from "./AstroTypes";
import type { DashaEntry } from "./DashaBhuktiEngine";
import predictiveRules from "../data/predictive_rules.json";

export type PredictionCategory = "Auspicious Indications" | "Current Challenges" | "Core Life Lesson" | "Education & Growth" | "Marriage & Relationships" | "Career & Profession" | "Longevity & Wisdom" | "Life Stability & Wealth" | "Current Dasha Bhukti";

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
  "Rahu": [3, 6, 10, 11],
  "Ketu": [3, 6, 11]
};

const MALEFIC_GOCHARA: Record<string, number[]> = {
  "Saturn": [1, 2, 4, 8, 12],
  "Jupiter": [1, 3, 4, 6, 8, 10, 12],
  "Rahu": [1, 2, 4, 5, 7, 8, 9, 12],
  "Ketu": [1, 2, 4, 5, 7, 8, 9, 10, 12]
};

const DYNAMIC_TEXTS: Record<string, Record<string, string>> = {
  "Saturn": {
    "1": "You may feel a lot of responsibilities right now. Life is testing your patience. Do not hurry. Take things one step at a time.",
    "2": "Financial matters might be strict right now, and there could be arguments in your family. You must be very careful with your money and your words.",
    "3": "You have a lot of courage and strength right now! The planets are supporting your hard work. You can solve old problems easily and your efforts will give good results.",
    "4": "There might be a lack of peace in your home, or worries about your mother's health. You need to focus on finding inner peace during this time.",
    "6": "This is a great time of victory for you! You have the energy to defeat your enemies and overcome daily health or work problems.",
    "8": "This is a time for deep thinking. You might face sudden changes or feel worried. Please take care of your mental and physical health above everything else.",
    "11": "The planets are very good for you right now! Your old wishes will be fulfilled and your friendships will grow stronger. Happiness is coming to you.",
    "12": "You are going through a time of endings. You might spend a lot of money or travel far away. It is a good time for spiritual thoughts."
  },
  "Jupiter": {
    "1": "You might feel confused about your life path. It is a time to seek deeper knowledge instead of taking fast actions.",
    "2": "A very beautiful period of wealth is starting for you! Expect good money growth, peace in your family, and a lot of grace in your daily life.",
    "3": "Your hard work might not give fast results, which can be frustrating. But this is necessary to make you stronger.",
    "4": "There might be small worries about your property or mental peace. The universe wants you to understand the true meaning of safety.",
    "5": "This is a very happy time for your mind and creativity! You will find deep joy through learning or spending time with children.",
    "6": "You might face some resistance at your job or minor health issues. You must be very patient and avoid unnecessary fights.",
    "7": "This time brings wonderful blessings to your relationships! It is a great time for marriage and understanding the people you love.",
    "8": "You might feel tired emotionally or face unexpected problems. It is a time to stay quiet and avoid risks while you rest.",
    "9": "You are in a very spiritual phase! This brings divine luck, good chances for learning, and a deep connection to God.",
    "10": "There might be sudden changes or stress in your job. Stay humble and keep working hard without expecting fast rewards.",
    "11": "Great profits are coming to you! This time favors the fulfillment of your wishes, new friends, and good support from others.",
    "12": "You might want to stay alone and away from the noise of the world. This is a very good time for prayer and inner healing."
  },
  "Rahu": {
    "3": "You have immense courage now. You can speak your ideas boldly and overcome the fears that stopped you before.",
    "6": "This is an excellent period to defeat your enemies. You have a sharp mind that helps you succeed in competitions.",
    "10": "You have a very strong desire for professional success! You may experience fast career growth and get good recognition.",
    "11": "Unexpected profits and expansion of your desires are highlighted now. Doing things differently will give you wonderful rewards."
  }
};

function makeJargonFree(text: string): string {
  return text
    .replace(/Native/gi, "You")
    .replace(/native/gi, "you")
    .replace(/In house \d+:/gi, "")
    .replace(/planet/gi, "energy")
    .replace(/Dasha/gi, "major life chapter")
    .replace(/Bhukti/gi, "sub-chapter");
}

export function synthesizePredictions(
  natalKundali: KundliOutput | null,
  activeBhuktiData: BhuktiData | undefined,
  gocharaPositions: { name: PlanetName; rashiIndex: number }[]
): SynthesizedPrediction[] {
  const predictions: SynthesizedPrediction[] = [];

  if (!natalKundali) return predictions;

  const moonSignIndex = getRashiIndex(natalKundali.moonSign);
  let blessingsText = "";
  let challengesText = "";

  for (const gochara of gocharaPositions) {
    let transitHouse = ((gochara.rashiIndex - moonSignIndex + 12) % 12) + 1;
    
    const textDict = DYNAMIC_TEXTS[gochara.name];
    if (textDict && textDict[transitHouse.toString()]) {
      const isBenefic = BENEFIC_GOCHARA[gochara.name]?.includes(transitHouse);
      const isMalefic = MALEFIC_GOCHARA[gochara.name]?.includes(transitHouse);
      
      const snippet = textDict[transitHouse.toString()] + " ";
      if (isBenefic) {
        blessingsText += snippet;
      } else if (isMalefic) {
        challengesText += snippet;
      }
    }
  }

  if (!blessingsText) {
    blessingsText = "You are currently being protected by a quiet cosmic energy. The universe is giving you strength and a gentle foundation to build your dreams. Please accept this grace.";
  }
  
  if (!challengesText) {
    challengesText = "The stars are peaceful regarding direct problems right now. However, you might still feel the normal pressure of daily life. Use this calm period to rest and become stronger.";
  }

  predictions.push({
    category: "Auspicious Indications",
    text: blessingsText.trim()
  });

  predictions.push({
    category: "Current Challenges",
    text: challengesText.trim()
  });

  let lessonText = "";
  
  if (activeBhuktiData) {
    const dashaLord = activeBhuktiData.maha.planet;
    const bhuktiLord = activeBhuktiData.bhukti;
    
    const dashaPlanet = natalKundali.planets.find((p) => p.name === dashaLord);
    const bhuktiPlanet = natalKundali.planets.find((p) => p.name === bhuktiLord);
    
    lessonText = `Based on your current major life chapter, society views you as someone going through a unique journey. `;

    if (dashaPlanet) {
      const planetsInBhavas = (predictiveRules as any).planets_in_bhavas;
      if (planetsInBhavas) {
        const planetKey = dashaLord.toLowerCase();
        const houseKey = `in_house_${dashaPlanet.house}`;
        const houseRule = planetsInBhavas[planetKey]?.[houseKey];
        if (houseRule) {
          lessonText += `In the eyes of the world, your main focus right now is this: ${makeJargonFree(houseRule)} `;
        }
      }
    }

    lessonText += `However, your deep internal lesson right now is different. `;

    if (bhuktiPlanet) {
      const planetsInBhavas = (predictiveRules as any).planets_in_bhavas;
      if (planetsInBhavas) {
        const planetKey = bhuktiLord.toLowerCase();
        const houseKey = `in_house_${bhuktiPlanet.house}`;
        const houseRule = planetsInBhavas[planetKey]?.[houseKey];
        if (houseRule) {
          lessonText += `Deep down, the universe is specifically asking you to learn this: ${makeJargonFree(houseRule)}. `;
        }
      }
    }
    
    lessonText += "Approach this lesson with great patience and a willingness to grow. You have the inner light to navigate this beautifully.";
  } else {
    lessonText = "You are in a transitional phase. The main lesson right now is to trust the process and allow yourself to rest before the next major cosmic chapter begins.";
  }

  predictions.push({
    category: "Core Life Lesson",
    text: lessonText.trim()
  });

  return predictions;
}
