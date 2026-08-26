import type { SupportedLanguage } from "../../stores/appStore";
import type {
  AyurSanjeeviniInput,
  AyurSanjeeviniResult,
  GandantaAnalysis,
  LongevityAnalysis,
  MarakaBadhakaDetail,
  KarmaVipakaItem,
  TransitionDoshaAnalysis,
  MokshaGatiAnalysis,
  SanjeeviniRakshaShield,
  PitruRinaAndAncestral,
  VamshaRakshaShield,
  GokarnaKshetraSankalpa,
  LongevityClass,
  LokaRealm
} from "./ayurSanjeeviniTypes";

const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Kataka",
  "Simha", "Kanya", "Tula", "Vrischika",
  "Dhanu", "Makara", "Kumbha", "Meena"
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const RASHI_LORDS: Record<string, string> = {
  Mesha: "Mars", Vrishabha: "Venus", Mithuna: "Mercury", Kataka: "Moon",
  Simha: "Sun", Kanya: "Mercury", Tula: "Venus", Vrischika: "Mars",
  Dhanu: "Jupiter", Makara: "Saturn", Kumbha: "Saturn", Meena: "Jupiter"
};

const RASHI_TYPES: Record<string, "movable" | "fixed" | "dual"> = {
  Mesha: "movable", Vrishabha: "fixed", Mithuna: "dual", Kataka: "movable",
  Simha: "fixed", Kanya: "dual", Tula: "movable", Vrischika: "fixed",
  Dhanu: "dual", Makara: "movable", Kumbha: "fixed", Meena: "dual"
};

/**
 * Determines Gandanta Dosha (Janana Portal)
 */
export function calculateGandanta(nakshatraName: string, lagnaRashi: string): GandantaAnalysis {
  const nakLower = nakshatraName.toLowerCase();
  const lagnaLower = lagnaRashi.toLowerCase();

  const isNakGandanta = ["ashwini", "ashlesha", "magha", "jyeshtha", "mula", "revati"].some((n) =>
    nakLower.includes(n)
  );

  const isLagnaGandanta = ["mesha", "kataka", "simha", "vrischika", "dhanu", "meena"].some((r) =>
    lagnaLower.includes(r)
  );

  if (isNakGandanta && isLagnaGandanta) {
    return {
      hasGandanta: true,
      type: "sarpa_gandanta",
      description: "ನಕ್ಷತ್ರ ಮತ್ತು ಲಗ್ನ ಎರಡರ ಸಂಧಿಕಾಲ ಗಂಡಾಂತ ಯೋಗ (Severe Junction Zone).",
      remedyRequired: "ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರದಲ್ಲಿ ಗಂಡಾಂತ ಶಾಂತಿ, ಸುವರ್ಣ ದಾನ ಹಾಗೂ ಆಯುಷ್ಯ ಹೋಮ ಅಗತ್ಯ."
    };
  }

  if (isNakGandanta) {
    return {
      hasGandanta: true,
      type: "nakshatra",
      description: `ನಕ್ಷತ್ರ ಗಂಡಾಂತ ಸಂಧಿ ದೋಷ (${nakshatraName} ನಕ್ಷತ್ರ).`,
      remedyRequired: "ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ, ಗೋದಾನ ಅಥವಾ ತೈಲ ದಾನ ಮತ್ತು ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ."
    };
  }

  if (isLagnaGandanta) {
    return {
      hasGandanta: true,
      type: "lagna",
      description: `ಲಗ್ನ ಗಂಡಾಂತ ಸಂಧಿ (ಜಲ-ಅಗ್ನಿ ರಾಶಿ ಸಂಕ್ರಮಣ ಕಾಲ).`,
      remedyRequired: "ರುದ್ರಾಭಿಷೇಕ, ಪಂಚಾಮೃತ ಸ್ನಾನ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಕವಚ ಧಾರಣೆ."
    };
  }

  return {
    hasGandanta: false,
    type: "none",
    description: "ಗಂಡಾಂತ ದೋಷರಹಿತ ಶುಭ ಜನ್ಮ ಕಾಲ (No Gandanta Affliction).",
    remedyRequired: "ಸಾಮಾನ್ಯ ದೈನಂದಿನ ಶಿವ ಪೂಜೆ ಹಾಗೂ ಈಶ್ವರ ಪ್ರಾರ್ಥನೆ ಸಾಕು."
  };
}

/**
 * Computes Ayurdaya & Longevity Class (Janana Portal)
 */
export function calculateAyurdaya(lagnaRashi: string, moonRashi: string, dob: string): LongevityAnalysis {
  const lagnaType = RASHI_TYPES[lagnaRashi] || "movable";
  const moonType = RASHI_TYPES[moonRashi] || "fixed";

  const hash = dob.split("-").reduce((acc, val) => acc + parseInt(val || "0", 10), 0);

  let category: LongevityClass = "deerghayu";
  let estimatedAgeSpan = "78 - 92 ವರ್ಷಗಳು (Years)";
  let vitalityScore = 84;

  if (lagnaType === "movable" && moonType === "movable") {
    category = "divyayu";
    estimatedAgeSpan = "88 - 100+ ವರ್ಷಗಳು (Full Century Blessing)";
    vitalityScore = 95;
  } else if (lagnaType === "fixed" && moonType === "fixed") {
    category = "deerghayu";
    estimatedAgeSpan = "74 - 86 ವರ್ಷಗಳು (Robust Longevity)";
    vitalityScore = 82;
  } else if (lagnaType === "dual" || moonType === "dual") {
    if (hash % 3 === 0) {
      category = "madhyayu";
      estimatedAgeSpan = "62 - 74 ವರ್ಷಗಳು (Sound Health with Care)";
      vitalityScore = 72;
    } else {
      category = "deerghayu";
      estimatedAgeSpan = "75 - 88 ವರ್ಷಗಳು (Blessed Lifespan)";
      vitalityScore = 86;
    }
  }

  return {
    category,
    estimatedAgeSpan,
    vitalityScore,
    ayushkarakaStrength: "ಶನಿ ಗ್ರಹ ಬಲ ಉತ್ತಮ (Saturn Strong in 8th/10th resonance)",
    threePairsMethod: {
      lagnaAndEighth: `${lagnaType.toUpperCase()} + DUAL -> ದೀರ್ಘಾಯುಷ್ಯ ಸಂಕೇತ`,
      moonAndSaturn: `${moonType.toUpperCase()} + FIXED -> ಸ್ಥಿರ ಪ್ರಾಣ ಶಕ್ತಿ`,
      lagnaAndHoraLagna: "ಶುಭ ದೃಷ್ಟಿ ಯುಕ್ತ ಲಗ್ನಾಧಿಪತಿ ರಕ್ಷೆ"
    },
    keyProtectiveYogas: [
      "ಲಗ್ನಾಧಿಪತಿ ಬಲ ಯುಕ್ತ ದೀರ್ಘಾಯುಷ್ಯ ಯೋಗ",
      "ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ ಗ್ರಹರ ದೃಷ್ಟಿ (Benefic Angular Shield)",
      "ಮಹಾಮೃತ್ಯುಂಜಯ ರಕ್ಷಾ ಕವಚ ಪ್ರಭಾವ"
    ]
  };
}

/**
 * Calculates Maraka & Badhaka Planets (Janana Portal)
 */
export function calculateMarakaBadhaka(lagnaRashi: string): MarakaBadhakaDetail {
  const lagnaIdx = Math.max(0, RASHIS.indexOf(lagnaRashi));
  const secondRashi = RASHIS[(lagnaIdx + 1) % 12];
  const seventhRashi = RASHIS[(lagnaIdx + 6) % 12];

  const marakaLord1 = RASHI_LORDS[secondRashi] || "Venus";
  const marakaLord2 = RASHI_LORDS[seventhRashi] || "Mars";

  const lagnaType = RASHI_TYPES[lagnaRashi] || "movable";
  let badhakaHouse = 11;
  if (lagnaType === "fixed") badhakaHouse = 9;
  if (lagnaType === "dual") badhakaHouse = 7;

  const badhakaRashi = RASHIS[(lagnaIdx + badhakaHouse - 1) % 12];
  const badhadhipati = RASHI_LORDS[badhakaRashi] || "Sun";

  return {
    marakaHouses: ["2ನೇ ಭಾವ (Dhana Sthana)", "7ನೇ ಭಾವ (Kalatra Sthana)"],
    marakaPlanets: [marakaLord1, marakaLord2],
    badhakaHouse,
    badhadhipati: `${badhadhipati} (${badhakaRashi} ರಾಶ್ಯಾಧಿಪತಿ)`,
    chhidraDashaAlert: `${marakaLord1} ಮತ್ತು ${badhadhipati} ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿಕಾಲದಲ್ಲಿ ವಿಶೇಷ ಶಿವಾರಾಧನೆ ಪ್ರಶಸ್ತ.`,
    severityScore: 35,
    mitigationSummary: "ಸೋಮವಾರ ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ರುದ್ರಾಭಿಷೇಕದಿಂದ ಮಾರಕ-ಬಾಧಕ ಶಮನ ಸಾಧ್ಯ."
  };
}

/**
 * Calculates Karma Vipaka Root Causes (Janana Portal)
 */
export function calculateKarmaVipaka(lagnaRashi: string, rashi: string): KarmaVipakaItem[] {
  return [
    {
      ailmentOrChallenge: "ಆರೋಗ್ಯ ಏರುಪೇರು & ಶಕ್ತಿ ಕ್ಷೀಣತೆ (Vitality & Stress)",
      karmicCause: "ಪೂರ್ವಜನ್ಮದಲ್ಲಿ ಕರ್ತವ್ಯ ಲೋಪ ಅಥವಾ ಸೂರ್ಯ ದೇವ ಪ್ರಾರ್ಥನೆ ಮರೆತ ಸಂಚಿತ ಕರ್ಮ.",
      afflictedPlanet: "ಸೂರ್ಯ (Sun) & ಶನಿ (Saturn)",
      shastraReference: "ಕರ್ಮ ವಿಪಾಕ ಸಂಹಿತಾ - ಅಧ್ಯಾಯ ೪ (Karma Vipaka Samhita)",
      recommendedDaana: "ತಾಮ್ರ ಪಾತ್ರೆ, ಗೋಧಿ ಹಾಗೂ ಕೆಂಪು ವಸ್ತ್ರ ದಾನ.",
      prescribedMantra: "ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ (Om Suryaya Namah)"
    },
    {
      ailmentOrChallenge: "ಮಾನಸಿಕ ಆತಂಕ & ಅನಿಶ್ಚಿತತೆ (Mental Turbulence)",
      karmicCause: "ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಜಲ ಸಂರಕ್ಷಣೆ ಅಥವಾ ತಾಯಿಯ ಆಶೀರ್ವಾದ ಉಲ್ಲಂಘನೆ.",
      afflictedPlanet: "ಚಂದ್ರ (Moon) & ಕೇತು (Ketu)",
      shastraReference: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ - ಕರ್ಮ ವಿಪಾಕ ಖಂಡ",
      recommendedDaana: "ಬೆಳ್ಳಿ ನಾಣ್ಯ, ಹಾಲು, ಅನ್ನ ಹಾಗೂ ಬಿಳಿ ವಸ್ತ್ರ ದಾನ.",
      prescribedMantra: "ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ (Om Somaya Namah)"
    },
    {
      ailmentOrChallenge: "ಸಂಧಿವಾತ ಅಥವಾ ನರ ದೌರ್ಬಲ್ಯ (Nerve/Joint Stiffness)",
      karmicCause: "ಶ್ರಮಿಕ ವರ್ಗದವರಿಗೆ ಅನ್ಯಾಯ ಅಥವಾ ವೃದ್ಧರ ಉಪೇಕ್ಷೆ.",
      afflictedPlanet: "ಶನಿ (Saturn)",
      shastraReference: "ಶಿವ ಪುರಾಣ - ಮೃತ್ಯುಂಜಯ ವಿಭಾಗ",
      recommendedDaana: "ಕಪ್ಪು ಎಳ್ಳು, ಕಬ್ಬಿಣದ ದೀಪ ಹಾಗೂ ಎಳ್ಳೆಣ್ಣೆ ದಾನ.",
      prescribedMantra: "ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ (Om Sham Shanaishcharaya Namah)"
    }
  ];
}

/**
 * Determines Transition / Demise Nakshatra & Panchaka (Marana Portal)
 */
export function calculateTransitionDosha(nakshatra: string): TransitionDoshaAnalysis {
  const nakLower = nakshatra.toLowerCase();

  const isPanchaka = [
    "dhanishta",
    "shatabhisha",
    "purva bhadrapada",
    "uttara bhadrapada",
    "revati"
  ].some((n) => nakLower.includes(n));

  const isDwiswabhava = [
    "punarvasu",
    "vishakha",
    "krittika",
    "uttara phalguni",
    "uttara ashadha"
  ].some((n) => nakLower.includes(n));

  if (isPanchaka) {
    return {
      nakshatra,
      isPanchaka: true,
      panchakaType: "ಧನಿಷ್ಠಾ ಪಂಚಕ / ಮೃತ್ಯು ಪಂಚಕ (Panchaka Transition)",
      isDwiswabhavaOrYamaGanda: false,
      doshaDescription: `${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ನಿರ್ಯಾಣವಾಗಿದ್ದು ಪಂಚಕ ದೋಷವಿದೆ. ಕುಟುಂಬದ ಇತರ ಸದಸ್ಯರ ರಕ್ಷಣೆಗಾಗಿ ಪಂಚಕ ಶಾಂತಿ ಅತ್ಯಗತ್ಯ.`,
      prescribedParihara: "ಕುಶ ಪುತ್ಥಳಿ (೫ ದರ್ಭೆ ಬೊಂಬೆಗಳು) ಸ್ಥಾಪನೆ, ತಿಲ ಹೋಮ ಹಾಗೂ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪಂಚಕ ದೋಷ ನಿವೃತ್ತಿ ಸಂಕಲ್ಪ.",
      peacePeriodRecommendation: "ಅಂತ್ಯ ಸಂಸ್ಕಾರ ಮುಗಿದ ನಂತರ ೬ ತಿಂಗಳು ಮನೆಯಲ್ಲಿ ನಿತ್ಯ ತುಳಸಿ ಪೂಜೆ ಹಾಗೂ ದೀಪಾರಾಧನೆ."
    };
  }

  if (isDwiswabhava) {
    return {
      nakshatra,
      isPanchaka: false,
      panchakaType: "ದ್ವಿಪುಷ್ಕರ / ತ್ರಿಪುಷ್ಕರ ಸಂಧಿಕಾಲ (Dwi-Pushkara Influence)",
      isDwiswabhavaOrYamaGanda: true,
      doshaDescription: `${nakshatra} ನಕ್ಷತ್ರ ಸಂಧಿಕಾಲ ನಿರ್ಯಾಣ - ವಂಶ ರಕ್ಷಣೆಗಾಗಿ ವಿಶೇಷ ತಿಲದಾನ ಹಾಗೂ ರುದ್ರ ಶಾಂತಿ ಪ್ರಶಸ್ತ.`,
      prescribedParihara: "ತಾಮ್ರ ಪಾತ್ರೆಯಲ್ಲಿ ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ಸುವರ್ಣ ದಾನ (ಯಥಾಶಕ್ತಿ) ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅರ್ಚನೆ.",
      peacePeriodRecommendation: "ಪ್ರತಿ ಮಾಸಿಕ ತಿಥಿಯಂದು ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಅಥವಾ ಅನ್ನದಾನ ಸೇವೆ."
    };
  }

  return {
    nakshatra,
    isPanchaka: false,
    panchakaType: "ಶುಭ ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ (Peaceful Auspicious Departure)",
    isDwiswabhavaOrYamaGanda: false,
    doshaDescription: `${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ನಿರ್ಯಾಣವಾಗಿದ್ದು ಯಾವುದೇ ತೀವ್ರ ಪಂಚಕ ಅಥವಾ ಯಮಗಂಡ ದೋಷವಿಲ್ಲ.`,
    prescribedParihara: "ಶಾಸ್ತ್ರೋಕ್ತ ೧೬ ಶ್ರಾದ್ಧಗಳು ಹಾಗೂ ಗೋಕರ್ಣದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ / ಪಿಂಡ ಪ್ರದಾನ.",
    peacePeriodRecommendation: "ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ ತರ್ಪಣ ಸಾಕು."
  };
}

/**
 * Determines Soul Gati / Moksha Realm (Marana Portal)
 */
export function calculateMokshaGati(lagnaRashi: string, nakshatra: string): MokshaGatiAnalysis {
  const nakLower = nakshatra.toLowerCase();
  let soulRealm: LokaRealm = "deva";
  let realmName = "ದೇವಲೋಕ / ಸ್ವರ್ಗ ಲೋಕ (Celestial Higher Realm)";

  if (["mula", "ashwini", "revati", "shravana", "uttara bhadrapada"].some((n) => nakLower.includes(n))) {
    soulRealm = "moksha";
    realmName = "ಕೈವಲ್ಯ ಮೋಕ್ಷ ಪದವಿ (Moksha / Supreme Spiritual Abode)";
  } else if (["magha", "anuradha", "rohini", "pushya"].some((n) => nakLower.includes(n))) {
    soulRealm = "pitru";
    realmName = "ಪಿತೃ ಲೋಕ (Venerable Ancestral Realm)";
  }

  return {
    soulRealm,
    realmName,
    twelfthHouseInfluence: "೧೨ನೇ ವ್ಯಯ ಭಾವದಲ್ಲಿ ಗುರು/ಕೇತು ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಮುಕ್ತಿ ಮಾರ್ಗ ಸೂಚನೆ.",
    karakamsaKetuBala: "ಕಾರಕಾಂಶ ಲಗ್ನದಿಂದ ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ಜೀವಾತ್ಮನಿಗೆ ಆಧ್ಯಾತ್ಮಿಕ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿ.",
    karmicDebtRemaining: "ಶೇಕಡಾ ೧೨ ಮಾತ್ರ ಸಂಚಿತ ಕರ್ಮ ಬಾಕಿ - ಗೋಕರ್ಣ ಶ್ರಾದ್ಧದಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತಿ.",
    pathwayToMoksha: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಬಿಲ್ವಾರ್ಚನೆ, ಗೋದಾನ ಹಾಗೂ ಮಹಾನಾರಾಯಣ ಬಲಿ."
  };
}

/**
 * Builds Sanjeevini Raksha Shield (Janana Portal)
 */
export function buildSanjeeviniShield(): SanjeeviniRakshaShield {
  return {
    mrityunjayaMantra: "ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥",
    recommendedJapaCount: 1008,
    rudrakshaRecommendation: "೫ ಮುಖಿ ಹಾಗೂ ೧೧ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (Five & Eleven Faced Sacred Rudraksha)",
    gemstoneOrMetalShield: "ತಾಮ್ರ ಅಥವಾ ಬೆಳ್ಳಿ ಕಡಗದಲ್ಲಿ ರುದ್ರ ಮಂತ್ರ ಸ್ಪರ್ಶ (Consecrated Copper/Silver Band)",
    ayushyaSuktaHomaDetails: "ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ ಗೋಕರ್ಣದಲ್ಲಿ ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಕಲಶಾಭಿಷೇಕ.",
    dailySankalpaMantra: "ಓಂ ನಮೋ ಭಗವತೇ ರುದ್ರಾಯ ಮಹಾಮೃತ್ಯುಂಜಯಾಯ ನಮಃ"
  };
}

/**
 * Builds Descendant Vamsha Protection Shield (Marana Portal)
 */
export function buildVamshaShield(): VamshaRakshaShield {
  return {
    vamshaProtectionMantra: "ಓಂ ಪಿತೃಗಣಾಯ ವಿದ್ಮಹೇ ಜಗದ್ಧಾರಿಣ್ಯೈ ಧೀಮಹಿ ತನ್ನಃ ಪಿತೃಃ ಪ್ರಚೋದಯಾತ್ ॥",
    dailyPitruTarpanaGuideline: "ಪ್ರತಿ ಅಮಾವಾಸ್ಯೆಯಂದು ದಕ್ಷಿಣಾಭಿಮುಖವಾಗಿ ಕಪ್ಪು ಎಳ್ಳು ಮತ್ತು ಜಲದಿಂದ ೩ ಬಾರಿ ತರ್ಪಣ ನೀಡುವುದು.",
    gayaGokarnaKashiRecommendation: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಅಥವಾ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ನೆರವೇರಿಸುವುದರಿಂದ ೨೧ ತಲೆಮಾರುಗಳ ವಂಶ ರಕ್ಷಣೆ.",
    blessingEffect: "ಸಂತಾನಾಭಿವೃದ್ಧಿ, ಕುಟುಂಬ ಕಲಹ ನಿವೃತ್ತಿ ಹಾಗೂ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಪಿತೃ ದೇವತೆಗಳ ದೈವಿಕ ರಕ್ಷಣೆ."
  };
}

/**
 * Pitru Karma & Gokarna Details
 */
export function buildPitruKarmaAndGokarna(mode: "janma" | "mrityu"): {
  pitruKarma: PitruRinaAndAncestral;
  gokarnaSankalpa: GokarnaKshetraSankalpa;
} {
  if (mode === "janma") {
    return {
      pitruKarma: {
        pitruRinaLevel: "low",
        tripindiRequired: false,
        narayanaBaliRecommended: false,
        ancestralBlessingStatus: "ಪಿತೃ ದೇವತೆಗಳ ಆಶೀರ್ವಾದ ಲಭ್ಯವಿದ್ದು, ಆಯುರ್ದಾಯ ಮತ್ತು ವಂಶಾಭಿವೃದ್ಧಿ ಯೋಗವಿದೆ.",
        remedies: [
          "ಪ್ರತಿ ಜನ್ಮ ನಕ್ಷತ್ರ ದಿನ ಈಶ್ವರ ದರ್ಶನ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಜಪ.",
          "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ.",
          "ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರ."
        ]
      },
      gokarnaSankalpa: {
        priestName: "ಶ್ರೀರಾಮ ಪಂಡಿತ್ (Shreeram Pandit)",
        priestPhone: "+91 94801 84545",
        templeAddress: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ, ರಥಬೀದಿ, ಗೋಕರ್ಣ - 581326",
        recommendedSevas: [
          {
            title: "ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ & ಆಯುಷ್ಯ ಶಾಂತಿ (Mahamrityunjaya Homa)",
            description: "ದೀರ್ಘಾಯುಷ್ಯ, ಆರೋಗ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ಮಾರಕ-ಬಾಧಕ ಶಮನಕ್ಕಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತ ಹೋಮ.",
            idealTithi: "ಜನ್ಮ ನಕ್ಷತ್ರ ದಿನ ಅಥವಾ ತ್ರಯೋದಶಿ/ಸೋಮವಾರ",
            significance: "ಅಕಾಲ ಮೃತ್ಯು ಭಯ ನಿವಾರಣೆ ಮತ್ತು ಪ್ರಾಣಶಕ್ತಿ ಜಾಗೃತಿ."
          },
          {
            title: "ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ಪಂಚಾಮೃತ ಸೇವೆ (Atma Linga Abhisheka)",
            description: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಪ್ರತ್ಯಕ್ಷ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಬಿಲ್ವಾರ್ಚನೆ.",
            idealTithi: "ಪ್ರದೋಷ ಕಾಲ ಅಥವಾ ಸೋಮವಾರ",
            significance: "ಸಕಲ ಗ್ರಹ ದೋಷ ನಿವಾರಣೆ ಮತ್ತು ಮನಃಶಾಂತಿ."
          },
          {
            title: "ರುದ್ರ ಜಪ & ನವಗ್ರಹ ಶಾಂತಿ (Rudra Japa & Navagraha Shanti)",
            description: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ಆಯುಷ್ಯ ವೃದ್ಧಿಗಾಗಿ ಪ್ರಧಾನ ಅರ್ಚಕರ ನೇತೃತ್ವದಲ್ಲಿ ರುದ್ರ ಜಪ.",
            idealTithi: "ಮಾಸ ಶಿವರಾತ್ರಿ ಅಥವಾ ಶುಕ್ಲ ಪಕ್ಷ ಸೋಮವಾರ",
            significance: "ದೇಹ-ಮನಸ್ಸುಗಳಿಗೆ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ."
          }
        ]
      }
    };
  }

  // Marana Mode Gokarna Sevas
  return {
    pitruKarma: {
      pitruRinaLevel: "medium",
      tripindiRequired: true,
      narayanaBaliRecommended: true,
      ancestralBlessingStatus: "ದಿವಂಗತ ಜೀವಾತ್ಮರಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಪಿಂಡ ಪ್ರದಾನ ಹಾಗೂ ಪಿತೃ ಮುಕ್ತಿ ಸಂಕಲ್ಪ ಅಗತ್ಯವಿದೆ.",
      remedies: [
        "೧ ರಿಂದ ೧೨ ದಿನಗಳ ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರಾದ್ಧ & ವೈತರಣೀ ಗೋದಾನ.",
        "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ & ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ.",
        "ಪ್ರತಿ ಮಾಸಿಕ ತಿಥಿ ಹಾಗೂ ಪ್ರಥಮ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ ಆಚರಣೆ."
      ]
    },
    gokarnaSankalpa: {
      priestName: "ಶ್ರೀರಾಮ ಪಂಡಿತ್ (Shreeram Pandit)",
      priestPhone: "+91 94801 84545",
      templeAddress: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ, ರಥಬೀದಿ, ಗೋಕರ್ಣ - 581326",
      recommendedSevas: [
        {
          title: "ಮಹಾನಾರಾಯಣ ಬಲಿ & ಸದ್ಗತಿ ಕಲ್ಪ (Maha Narayana Bali)",
          description: "ಜೀವಾತ್ಮನ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿ ಮತ್ತು ಅತೃಪ್ತ ಆತ್ಮ ಶಾಂತಿಗಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಪ್ರಮುಖ ಪವಿತ್ರ ವಿಧಿ.",
          idealTithi: "ಅಮಾವಾಸ್ಯೆ, ಮಹಾಲಯ ಪಕ್ಷ ಅಥವಾ ಏಕಾದಶಿ",
          significance: "ಸಮಸ್ತ ಪಿತೃ ಶಾಪ ವಿಮೋಚನೆ ಮತ್ತು ಪರಮಪದ ಪ್ರಾಪ್ತಿ."
        },
        {
          title: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಕೋಟಿತೀರ್ಥ ಪಿಂಡ ಪ್ರದಾನ (Tripindi Shradha)",
          description: "ಪೂರ್ವಜರ ಮೂರು ತಲೆಮಾರುಗಳ (ಪಿತೃ, ಪಿತಾಮಹ, ಪ್ರಪಿತಾಮಹ) ತೃಪ್ತಿಗಾಗಿ ಗೋಕರ್ಣ ತೀರ್ಥ ಶ್ರಾದ್ಧ.",
          idealTithi: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಭರಣಿ/ಮಘಾ ನಕ್ಷತ್ರ",
          significance: "ವಂಶಸ್ಥರಿಗೆ ಸಂತಾನ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷೆ."
        },
        {
          title: "ಆತ್ಮಲಿಂಗ ಮೋಕ್ಷ ಕ್ಷೀರಾಭಿಷೇಕ & ಗೋದಾನ (Moksha Archana & Godaana)",
          description: "ದಿವಂಗತರ ಹೆಸರಿನಲ್ಲಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ಸಂಕಲ್ಪ ಗೋದಾನ.",
          idealTithi: "ಮಾಸಿಕ ತಿಥಿ ಅಥವಾ ಪ್ರದೋಷ",
          significance: "ಪುಣ್ಯ ಲೋಕ ನಿವಾಸ ಮತ್ತು ದೈವಿಕ ಆಶೀರ್ವಾದ."
        }
      ]
    }
  };
}

/**
 * AI Divine Narrative Generator with 100% Separation for Janana vs Marana
 */
export async function generateAyurSanjeeviniAINarrative(
  result: AyurSanjeeviniResult,
  lang: SupportedLanguage,
  geminiApiKey?: string
): Promise<string> {
  const isKn = lang === "kn";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";

  if (result.mode === "janma") {
    // 100% Janana Exclusive Narrative
    const fallbackJanana = isKn
      ? `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n\n` +
        `ಶ್ರೀಯುತ ${result.personName} ಅವರ ಜನನ ಆಯುರ್-ಸಂಜೀವಿನಿ ಮಹಾರಕ್ಷಾ ದರ್ಶನ:\n` +
        `೧. ಆಯುರ್ದಾಯ & ಪ್ರಾಣ ಶಕ್ತಿ: ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಆಯುಷ್ಕಾರಕ ಶನಿ ಗ್ರಹದ ಬಲದಿಂದ "${result.longevity.estimatedAgeSpan}" ಆಯುಷ್ಯ ಯೋಗವಿದೆ. ಪ್ರಾಣಶಕ್ತಿ ಸ್ಕೋರ್: ${result.longevity.vitalityScore}/100.\n` +
        `೨. ಗಂಡಾಂತ-ಮಾರಕ ಶಮನ: ${result.gandanta.hasGandanta ? result.gandanta.description : "ಗಂಡಾಂತ ದೋಷರಹಿತ ಶುಭ ಜನ್ಮ ಕಾಲ"}. ಮಾರಕ ಗ್ರಹರಾದ ${result.marakaBadhaka.marakaPlanets.join(", ")} ಅವರ ಪ್ರಭಾವವನ್ನು ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪದಿಂದ ನಿಗ್ರಹಿಸಬಹುದು.\n` +
        `೩. ಕರ್ಮ ವಿಪಾಕ & ಆರೋಗ್ಯ ರಕ್ಷಣೆ: ${result.karmaVipaka[0]?.ailmentOrChallenge || "ದೈಹಿಕ ಶಕ್ತಿ ರಕ್ಷಣೆ"} ಗೆ "${result.karmaVipaka[0]?.recommendedDaana || "ಸೂರ್ಯ ದಾನ"}" ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ.\n` +
        `೪. ಗೋಕರ್ಣ ಸಂಕಲ್ಪ: ಗೋಕರ್ಣದ ಶ್ರೀರಾಮ ಪಂಡಿತ್ ಅವರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ ಕೈಗೊಳ್ಳುವುದರಿಂದ ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಪರಿಪೂರ್ಣ ಆರೋಗ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.`
      : isHi
      ? `॥ श्री महाबलेश्वर प्रसन्न ॥\n\n` +
        `श्रीमान ${result.personName} का जन्म आयुर्-संजीवनी विश्लेषण:\n` +
        `१. आयुर्दाय व प्राण शक्ति: आपकी कुंडली में लग्नाधिपति एवं शनि कृपा से "${result.longevity.estimatedAgeSpan}" दीर्घायु योग है। प्राणशक्ति स्कोर: ${result.longevity.vitalityScore}/100।\n` +
        `२. मारक-बाधक शमन: महामृत्युंजय जप एवं रुद्राभिषेक से स्वास्थ्य संकटों का पूर्ण निवारण होता है।\n` +
        `३. गोकर्ण क्षेत्र संकल्प: गोकर्ण महाबलेश्वर के सानिध्य में महामृत्युंजय होम करवाने से अकाल कष्ट दूर होते हैं।`
      : isTe
      ? `॥ శ్రీ మహాబలేశ్వర ప్రసన్న ॥\n\n` +
        `శ్రీయుత ${result.personName} గారి జన్మ ఆయుర్-సంజీవిని విశ్లేషణ:\n` +
        `1. ఆయుర్దాయం & ప్రాణ శక్తి: మీ కుండలిలో లగ్నాధిపతి మరియు శని బలంతో "${result.longevity.estimatedAgeSpan}" దీర్ఘాయువు కలదు. వైటాలిటీ స్కోర్: ${result.longevity.vitalityScore}/100.\n` +
        `2. గోకర్ణ క్షేత్ర సంకల్పం: గోಕರ್ణంలో శ్రీరామ పండిట్ గారి ఆధ్వర్యంలో మహామృత్యుంజయ హోమం చేయడం వల్ల సంపూర్ణ ఆయురారోగ్యాలు సిద్ధిస్తాయి.`
      : isTa
      ? `॥ ஸ்ரீ மகாபலேஸ்வர பிரசன்னம் ॥\n\n` +
        `திரு ${result.personName} அவர்களின் பிறப்பு ஆயுர்-சஞ்சீவினி ஆய்வு:\n` +
        `1. ஆயுர்தாயம் & பிராண சக்தி: உங்கள் ஜாதகத்தில் லக்னாதிபதி மற்றும் சனி பலத்தால் "${result.longevity.estimatedAgeSpan}" தீர்க்காயுள் யோகம் அமைந்துள்ளது. பிராண சக்தி: ${result.longevity.vitalityScore}/100.\n` +
        `2. கோகர்ண க்ஷேத்ர சங்கல்பம்: கோகர்ணத்தில் ஸ்ரீராம் பண்டிட் தலைமையில் மகாமிருத்யுஞ்சய ஹோமம் செய்வதன் மூலம் பூரண நல்வாழ்வு உண்டாகும்.`
      : `॥ Sri Mahabaleshwara Prasanna ॥\n\n` +
        `Divine Birth Ayur Sanjeevini Revelation for ${result.personName}:\n` +
        `1. Longevity & Vitality Matrix: Blessed with "${result.longevity.estimatedAgeSpan}" under strong Lagna Lord and Ayushkaraka Saturn placement. Vitality Score: ${result.longevity.vitalityScore}/100.\n` +
        `2. Gandanta & Maraka Mitigation: ${result.gandanta.hasGandanta ? result.gandanta.description : "Free from critical Gandanta affliction"}. Mitigate Maraka influences (${result.marakaBadhaka.marakaPlanets.join(", ")}) via regular Maha Mrityunjaya Japa.\n` +
        `3. Karma Vipaka & Health Shield: Address physical stress through prescribed charity: ${result.karmaVipaka[0]?.recommendedDaana || "Surya Daana"}.\n` +
        `4. Gokarna Kshetra Blessing: Under Priest Shreeram Pandit (+91 94801 84545), performing Mahamrityunjaya Homa ensures vitality and long life.`;

    if (!geminiApiKey) return fallbackJanana;

    try {
      const prompt = `You are the Head Astrologer & Sanjeevini Acharya at Sri Kshetra Gokarna Mahabaleshwara Temple.
Generate a pure BIRTH & LONGEVITY (Janana Ayurdaya) consultation in ${lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : lang === "te" ? "Telugu" : lang === "ta" ? "Tamil" : "English"}.
DO NOT MENTION DEATH, POSTHUMOUS RITES, OR FUNERALS. Focus 100% on living vitality, longevity span, health protection, Maha Mrityunjaya Japa, and Ayushya Homa.
Person Name: ${result.personName}
Longevity: ${result.longevity.category} (${result.longevity.estimatedAgeSpan})
Vitality Score: ${result.longevity.vitalityScore}/100
Priest: Shreeram Pandit, Gokarna (+91 94801 84545)
Write 3-4 inspiring paragraphs without markdown asterisks.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 800, temperature: 0.6 }
          })
        }
      );

      if (!response.ok) return fallbackJanana;
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.replace(/\*\*/g, "").trim() : fallbackJanana;
    } catch (err) {
      return fallbackJanana;
    }
  }

  // 100% Marana Exclusive Narrative
  const fallbackMarana = isKn
    ? `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n\n` +
      `ದಿವಂಗತ ಪುಣ್ಯಾತ್ಮ ${result.personName} ಅವರ ಮರಣ ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ ಸಂಕಲ್ಪ ದರ್ಶನ:\n` +
      `೧. ಜೀವಾತ್ಮ ಸದ್ಗತಿ & ಲೋಕ ಪ್ರಾಪ್ತಿ: ೧೨ನೇ ವ್ಯಯ ಭಾವ ಮತ್ತು ಕಾರಕಾಂಶ ಕೇತು ಬಲದಿಂದ ಜೀವಾತ್ಮರಿಗೆ "${result.mokshaGati.realmName}" ಪ್ರಾಪ್ತಿಯಾಗಿದೆ.\n` +
      `೨. ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ & ಪಂಚಕ ವಿಶ್ಲೇಷಣೆ: ${result.transitionDosha.doshaDescription} ಪರಿಹಾರ: ${result.transitionDosha.prescribedParihara}\n` +
      `೩. ಪಿತೃ ಋಣ & ತ್ರಿಪಿಂಡಿ ಶಾಂತಿ: ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ನೆರವೇರಿಸುವುದರಿಂದ ಜೀವಾತ್ಮನಿಗೆ ಸಂಪೂರ್ಣ ಮುಕ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.\n` +
      `೪. ವಂಶ ರಕ್ಷಣೆ: ಗೋಕರ್ಣದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ಶ್ರೀರಾಮ ಪಂಡಿತ್ (+91 94801 84545) ಅವರ ಸಾನಿಧ್ಯದಲ್ಲಿ ಶ್ರಾದ್ಧ ವಿಧಿ ಪೂರೈಸುವುದರಿಂದ ವಂಶಸ್ಥರಿಗೆ ಸಮಸ್ತ ಪಿತೃ ಆಶೀರ್ವಾದ ಸಿದ್ಧಿಸುತ್ತದೆ.`
    : isHi
    ? `॥ श्री महाबलेश्वर प्रसन्न ॥\n\n` +
      `दिवंगत पुण्यात्मा ${result.personName} का मरण सद्गति एवं मोक्ष विश्लेषण:\n` +
      `१. सद्गति लोक: आपकी 12वें भाव की स्थिति से पुण्यात्मा को "${result.mokshaGati.realmName}" प्राप्त हुआ है।\n` +
      `२. प्रयाण नक्षत्र व पंचक: ${result.transitionDosha.doshaDescription}।\n` +
      `३. गोकर्ण कोटितीर्थ संकल्प: नारायण बलि व त्रिपिंडी श्राद्ध से पुण्यात्मा को परम शांति मिलती है और वंश को आशीर्वाद प्राप्त होता है।`
    : isTe
    ? `॥ శ్రీ మహాబలేశ్వర ప్రసన్న ॥\n\n` +
      `దివంగత పుణ్యాత్మ ${result.personName} గారి సద్గతి & పితృ మోక్ష విశ్లేషణ:\n` +
      `1. సద్గతి లోకం: 12వ భావం & కేతు ప్రభావంతో పుణ్యాత్మకు "${result.mokshaGati.realmName}" ప్రాప్తించింది.\n` +
      `2. గోకర్ణ క్షేత్ర సంకల్పం: గోకర్ణంలో శ్రీరామ పండిట్ గారి ఆధ్వర్యంలో నారాయణ బలి & త్రిపిండి శ్రాద్ధం చేయడం వల్ల పితృ ముక్తి కలుగుతుంది.`
    : isTa
    ? `॥ ஸ்ரீ மகாபலேஸ்வர பிரசன்னம் ॥\n\n` +
      `மறைந்த புண்ணிய ஆன்மா ${result.personName} அவர்களின் சத்கதி & பித்ரு மோக்ஷ ஆய்வு:\n` +
      `1. ஆன்ம சத்கதி: 12-ஆம் பாவ பலத்தால் ஆன்மாவுக்கு "${result.mokshaGati.realmName}" கிட்டியுள்ளது.\n` +
      `2. கோகர்ண சங்கல்பம்: கோகர்ணத்தில் நாராயண பலி மற்றும் திரிபிண்டி ஷ்ராத்தம் செய்வதன் மூலம் ஆன்மா சாந்தி அடையும்.`
    : `॥ Sri Mahabaleshwara Prasanna ॥\n\n` +
      `Soul Transition & Moksha Revelation for Departed Soul ${result.personName}:\n` +
      `1. Attained Loka Realm: Blessed with "${result.mokshaGati.realmName}" under 12th house and Karakamsa Ketu spiritual resonance.\n` +
      `2. Transition Nakshatra Assessment: ${result.transitionDosha.doshaDescription} Prescribed Rites: ${result.transitionDosha.prescribedParihara}.\n` +
      `3. Pitru Peace & Descendant Shield: Performing Narayana Bali & Tripindi Shradha at Gokarna Kotiteertha releases all karmic knots.\n` +
      `4. Gokarna Kshetra Blessing: Under Priest Shreeram Pandit (+91 94801 84545), fulfilling these Vedic rites ensures ancestral peace and family prosperity.`;

  if (!geminiApiKey) return fallbackMarana;

  try {
    const prompt = `You are the Head Priest & Pitru Moksha Acharya at Sri Kshetra Gokarna Mahabaleshwara Temple.
Generate a pure SOUL TRANSITION & PITRU MOKSHA (Marana Sadgati) guidance in ${lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : lang === "te" ? "Telugu" : lang === "ta" ? "Tamil" : "English"}.
DO NOT MENTION BIRTH LONGEVITY OR BALARISHTA. Focus 100% on soul transition, Panchaka/Nakshatra peace, Pitru Rina, Tripindi Shradha, Narayana Bali, and descendant blessings.
Departed Soul Name: ${result.personName}
Soul Realm: ${result.mokshaGati.realmName}
Transition Analysis: ${result.transitionDosha.doshaDescription}
Priest: Shreeram Pandit, Gokarna (+91 94801 84545)
Write 3-4 compassionate paragraphs without markdown asterisks.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.6 }
        })
      }
    );

    if (!response.ok) return fallbackMarana;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.replace(/\*\*/g, "").trim() : fallbackMarana;
  } catch (err) {
    return fallbackMarana;
  }
}

/**
 * Main Ayur Sanjeevini Calculation Orchestrator
 */
export function executeAyurSanjeeviniCalculation(input: AyurSanjeeviniInput): AyurSanjeeviniResult {
  const hash = (input.dob || "2000-01-01")
    .split("-")
    .reduce((acc, v) => acc + parseInt(v || "0", 10), 0);

  const lagnaRashi = RASHIS[hash % 12];
  const moonRashi = RASHIS[(hash + 4) % 12];
  const nakshatra = input.nakshatra || NAKSHATRAS[(hash * 2) % 27];

  const gandanta = calculateGandanta(nakshatra, lagnaRashi);
  const longevity = calculateAyurdaya(lagnaRashi, moonRashi, input.dob);
  const marakaBadhaka = calculateMarakaBadhaka(lagnaRashi);
  const karmaVipaka = calculateKarmaVipaka(lagnaRashi, moonRashi);
  const transitionDosha = calculateTransitionDosha(nakshatra);
  const mokshaGati = calculateMokshaGati(lagnaRashi, nakshatra);
  const sanjeeviniShield = buildSanjeeviniShield();
  const vamshaShield = buildVamshaShield();
  const { pitruKarma, gokarnaSankalpa } = buildPitruKarmaAndGokarna(input.mode);

  return {
    input,
    calculatedAt: new Date().toISOString(),
    mode: input.mode,
    personName: input.personName || (input.mode === "janma" ? "Devotee" : "Departed Soul"),
    dobFormatted: input.dob,
    tobFormatted: input.tob || "12:00 PM",
    pob: input.pob || "Gokarna, Karnataka",
    gotra: input.gotra || "Kashyapa",
    rashi: moonRashi,
    nakshatra,
    lagnaRashi,
    gandanta,
    longevity,
    marakaBadhaka,
    karmaVipaka,
    transitionDosha,
    mokshaGati,
    sanjeeviniShield,
    vamshaShield,
    pitruKarma,
    gokarnaSankalpa
  };
}
