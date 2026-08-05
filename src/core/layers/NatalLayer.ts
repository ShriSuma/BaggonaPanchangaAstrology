import { type KundliOutput, PlanetName } from "../AstroTypes";

export interface NatalLayerOutput {
  shadowSelf: {
    title: string;
    description: string;
    bluntTruth: string;
  };
  karmicBaggage: {
    title: string;
    description: string;
    soulPurpose: string;
  };
  yogas: string[];
}

/**
 * Layer 1: Janana Kundali (Natal Layer)
 * Focuses on static birth chart analysis: Shadow Self (Dusthanas) and Karmic Baggage (Rahu/Ketu).
 */
export function evaluateNatalLayer(kundli: KundliOutput, lang: string): NatalLayerOutput {
  // Translate keys based on language. 
  // In a real app, this would use i18next or similar. 
  // For the MVP, we use simple English defaults and allow the Synthesis layer to localize.

  return {
    shadowSelf: analyzeShadowSelf(kundli),
    karmicBaggage: analyzeKarmicBaggage(kundli),
    yogas: ["Gaja Kesari Yoga", "Dhana Yoga"] // Placeholder for BV Raman Yogas
  };
}

function analyzeShadowSelf(kundli: KundliOutput) {
  // The Shadow Self relies on 6th, 8th, and 12th houses (Dusthanas).
  // For the MVP, we simulate reading Saturn and Rahu's placement.
  
  const saturnPos = kundli.planets.find(p => p.name === PlanetName.Saturn);
  
  if (saturnPos && saturnPos.house === 7) {
    return {
      title: "The Shadow Self: Fear of Abandonment",
      description: "Saturn in the 7th house brings heavy restriction in partnerships.",
      bluntTruth: "You constantly seek validation through partners, but your fear of abandonment pushes them away. It's time to stop expecting others to fix you."
    };
  }

  // Default Shadow Self if specific placement isn't matched
  return {
    title: "The Shadow Self: Self-Doubt",
    description: "The 8th house energies indicate a tendency to hide your true feelings.",
    bluntTruth: "You often sabotage your own success because you are deeply afraid of being seen and judged. Stop hiding."
  };
}

function analyzeKarmicBaggage(kundli: KundliOutput) {
  // Karmic Baggage relies on Rahu and Ketu axis.
  const ketuPos = kundli.planets.find(p => p.name === PlanetName.Ketu);
  const rahuPos = kundli.planets.find(p => p.name === PlanetName.Rahu);

  if (ketuPos?.house === 4 && rahuPos?.house === 10) {
    return {
      title: "Karmic Baggage: The Restless Wanderer",
      description: "Ketu in the 4th house shows a past life where home was a source of detachment.",
      soulPurpose: "You carried an ancient feeling of not belonging anywhere into this life. Your soul's purpose (Rahu in 10th) is to build your own empire, not find comfort in a traditional home."
    };
  }

  return {
    title: "Karmic Baggage: The Debt of Service",
    description: "Ketu's placement indicates unresolved duties from a past life.",
    soulPurpose: "Your soul's purpose in this lifetime is to embrace the chaos of the material world without losing your spiritual center. Don't run away from responsibilities."
  };
}
