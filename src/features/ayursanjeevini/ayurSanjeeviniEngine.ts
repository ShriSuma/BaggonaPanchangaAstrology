import type { SupportedLanguage } from "../../stores/appStore";
import type {
  AyurSanjeeviniInput,
  AyurSanjeeviniResult,
  GandantaAnalysis,
  LongevityAnalysis,
  MarakaBadhakaDetail,
  KarmaVipakaItem,
  MokshaGatiAnalysis,
  SanjeeviniRakshaShield,
  PitruRinaAndAncestral,
  GokarnaKshetraSankalpa,
  LongevityClass,
  LokaRealm,
  GandantaType
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
 * Determines Gandanta Dosha
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
 * Computes Ayurdaya & Longevity Class
 */
export function calculateAyurdaya(lagnaRashi: string, moonRashi: string, dob: string): LongevityAnalysis {
  const lagnaType = RASHI_TYPES[lagnaRashi] || "movable";
  const moonType = RASHI_TYPES[moonRashi] || "fixed";

  // Deterministic seed from date
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
 * Calculates Maraka & Badhaka Planets
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
 * Calculates Karma Vipaka Root Causes
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
 * Determines Soul Gati / Moksha Realm
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
    karakamsaKetuBala: "ಕಾರಕಾಂಶ ಲಗ್ನದಿಂದ ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿ.",
    karmicDebtRemaining: "ಶೇಕಡಾ ೧೨ ಮಾತ್ರ ಸಂಚಿತ ಕರ್ಮ ಬಾಕಿ - ಸತ್ಕಾರ್ಯಗಳಿಂದ ಸಂಪೂರ್ಣ ನಿವೃತ್ತಿ.",
    pathwayToMoksha: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ದರ್ಶನ, ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಹಾಗೂ ಗೋಸೇವೆ."
  };
}

/**
 * Builds Sanjeevini Raksha Shield
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
 * Pitru Karma & Gokarna Details
 */
export function buildPitruKarmaAndGokarna(): {
  pitruKarma: PitruRinaAndAncestral;
  gokarnaSankalpa: GokarnaKshetraSankalpa;
} {
  return {
    pitruKarma: {
      pitruRinaLevel: "low",
      tripindiRequired: false,
      narayanaBaliRecommended: false,
      ancestralBlessingStatus: "ಪಿತೃ ದೇವತೆಗಳ ಆಶೀರ್ವಾದ ಲಭ್ಯವಿದ್ದು, ವಂಶಾಭಿವೃದ್ಧಿ ಯೋಗವಿದೆ.",
      remedies: [
        "ಪ್ರತಿ ಅಮಾವಾಸ್ಯೆ ಹಾಗೂ ಮಹಾಲಯ ಪಕ್ಷದಲ್ಲಿ ಎಳ್ಳು-ನೀರು ತರ್ಪಣ ಸಮರ್ಪಣೆ.",
        "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನ ಸೇವೆ.",
        "ಶ್ರಾದ್ಧ ತಿಥಿಯಂದು ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಹಾಗೂ ವಸ್ತ್ರದಾನ."
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
          title: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಪಿತೃ ಮುಕ್ತಿ ಸಂಕಲ್ಪ (Tripindi & Pitru Mukti)",
          description: "ಪೂರ್ವಜರ ಸದ್ಗತಿ ಹಾಗೂ ಪಿತೃ ದೋಷ ಪರಿಹಾರಕ್ಕಾಗಿ ಕೋಟಿತೀರ್ಥ ತೀರದಲ್ಲಿ ಪವಿತ್ರ ಕೃತ್ಯ.",
          idealTithi: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಮಹಾಲಯ ಪಕ್ಷ",
          significance: "ಪಿತೃ ಶಾಪ ವಿಮೋಚನೆ ಮತ್ತು ವಂಶ ರಕ್ಷಣೆ."
        }
      ]
    }
  };
}

/**
 * AI Divine Narrative Generator with Robust Vedic Fallback
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

  const fallbackNarrative = isKn
    ? `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n\n` +
      `ಶ್ರೀಯುತ ${result.personName} ಅವರ ಆಯುರ್-ಸಂಜೀವಿನಿ ಹಾಗೂ ಕರ್ಮ ಚಕ್ರ ವಿಶ್ಲೇಷಣೆ:\n` +
      `೧. ಆಯುರ್ದಾಯ & ಪ್ರಾಣ ಶಕ್ತಿ: ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಶನಿ ಗ್ರಹದ ಬಲದಿಂದ "${result.longevity.estimatedAgeSpan}" ಆಯುಷ್ಯ ಸಂಕೇತವಿದೆ. ಪ್ರಾಣಶಕ್ತಿ ಸ್ಕೋರ್: ${result.longevity.vitalityScore}/100.\n` +
      `೨. ಗಂಡಾಂತ-ಮಾರಕ ಶಮನ: ${result.gandanta.hasGandanta ? result.gandanta.description : "ಗಂಡಾಂತ ದೋಷರಹಿತ ಶುಭ ಯೋಗ"}. ಮಾರಕ-ಬಾಧಕ ಗ್ರಹರಾದ ${result.marakaBadhaka.marakaPlanets.join(", ")} ಅವರ ಪ್ರಭಾವವನ್ನು ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪದಿಂದ ಸುಲಭವಾಗಿ ನಿಯಂತ್ರಿಸಬಹುದು.\n` +
      `೩. ಕರ್ಮ ವಿಪಾಕ & ಆರೋಗ್ಯ ಸಂಜೀವಿನಿ: ${result.karmaVipaka[0]?.ailmentOrChallenge || "ದೈಹಿಕ ಶಕ್ತಿ ರಕ್ಷಣೆ"} ಗೆ "${result.karmaVipaka[0]?.recommendedDaana || "ಸೂರ್ಯ ದಾನ"}" ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ.\n` +
      `೪. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸಂಕಲ್ಪ: ಗೋಕರ್ಣದ ಶ್ರೀರಾಮ ಪಂಡಿತ್ ಅವರ ಸಾನಿಧ್ಯದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆತ್ಮಲಿಂಗ ಬಿಲ್ವಾರ್ಚನೆ ಕೈಗೊಳ್ಳುವುದರಿಂದ ದೀರ್ಘಾಯುಷ್ಯ, ಆರೋಗ್ಯ ಮತ್ತು ದೈವಿಕ ರಕ್ಷೆ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`
    : isHi
    ? `॥ श्री महाबलेश्वर प्रसन्न ॥\n\n` +
      `श्रीमान ${result.personName} का आयुर्-संजीवनी एवं कर्म चक्र विश्लेषण:\n` +
      `१. आयुर्दाय व प्राण शक्ति: आपकी कुंडली में लग्नाधिपति एवं शनि बल से "${result.longevity.estimatedAgeSpan}" दीर्घायु योग है। जीवन शक्ति स्कोर: ${result.longevity.vitalityScore}/100।\n` +
      `२. मारक-बाधक शमन: महामृत्युंजय जप एवं रुद्राभिषेक से स्वास्थ्य संकटों का पूर्ण निवारण होता है।\n` +
      `३. गोकर्ण क्षेत्र संकल्प: गोकर्ण महाबलेश्वर आत्मलिंग के सानिध्य में महामृत्युंजय होम करवाने से अकाल मृत्यु भय दूर होता है और पूर्ण आरोग्य प्राप्त होता है।`
    : isTe
    ? `॥ శ్రీ మహాబలేశ్వర ప్రసన్న ॥\n\n` +
      `శ్రీయుత ${result.personName} గారి ఆయుర్-సంజీవిని & కర్మ చక్ర విశ్లేషణ:\n` +
      `1. ఆయుర్దాయం & ప్రాణ శక్తి: మీ కుండలిలో లగ్నాధిపతి మరియు శని గ్రహ బలంతో "${result.longevity.estimatedAgeSpan}" దీర్ఘాయువు సూచించబడింది. వైటాలిటీ స్కోర్: ${result.longevity.vitalityScore}/100.\n` +
      `2. గోకర్ణ క్షేత్ర సంకల్పం: గోకర్ణంలో శ్రీరామ పండిట్ గారి ఆధ్వర్యంలో మహామృత్యుంజయ హోమం చేయడం వల్ల సంపూర్ణ ఆయురారోగ్యాలు సిద్ధిస్తాయి.`
    : isTa
    ? `॥ ஸ்ரீ மகாபலேஸ்வர பிரசன்னம் ॥\n\n` +
      `திரு ${result.personName} அவர்களின் ஆயுர்-சஞ்சீவினி மற்றும் கர்ம சக்கர ஆய்வு:\n` +
      `1. ஆயுர்தாயம் & பிராண சக்தி: உங்கள் ஜாதகத்தில் லக்னாதிபதி மற்றும் சனி பலத்தால் "${result.longevity.estimatedAgeSpan}" தீர்க்காயுள் யோகம் அமைந்துள்ளது. பிராண சக்தி: ${result.longevity.vitalityScore}/100.\n` +
      `2. கோகர்ண க்ஷேத்ர சங்கல்பம்: கோகர்ணத்தில் ஸ்ரீராம் பண்டிட் தலைமையில் மகாமிருத்யுஞ்சய ஹோமம் செய்வதன் மூலம் பூரண நல்வாழ்வு உண்டாகும்.`
    : `॥ Sri Mahabaleshwara Prasanna ॥\n\n` +
      `Divine Ayur Sanjeevini & Karma Moksha Synthesis for ${result.personName}:\n` +
      `1. Longevity & Vitality Matrix: Blessed with "${result.longevity.estimatedAgeSpan}" under strong Lagna Lord and Ayushkaraka Saturn placement. Vitality Score: ${result.longevity.vitalityScore}/100.\n` +
      `2. Gandanta & Maraka Mitigation: ${result.gandanta.hasGandanta ? result.gandanta.description : "Free from critical Gandanta affliction"}. Mitigate Maraka influences (${result.marakaBadhaka.marakaPlanets.join(", ")}) via regular Maha Mrityunjaya Japa.\n` +
      `3. Karma Vipaka & Root Causes: Address chronic strain through prescribed Vedic charity: ${result.karmaVipaka[0]?.recommendedDaana || "Surya Daana"}.\n` +
      `4. Gokarna Kshetra Blessing: Under the guidance of Priest Shreeram Pandit (+91 94801 84545), performing Mahamrityunjaya Homa and Atma Linga Bilva Archana ensures long life, vitality, and family protection.`;

  if (!geminiApiKey) {
    return fallbackNarrative;
  }

  try {
    const prompt = `You are the venerable Head Astrologer & Sanjeevini Vedic Acharya at Sri Kshetra Gokarna Mahabaleshwara Temple.
Generate a profound, compassionate, 4-paragraph Vedic Ayur Sanjeevini & Karma Moksha revelation in ${lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : lang === "te" ? "Telugu" : lang === "ta" ? "Tamil" : "English"}.
Mode: ${result.mode === "janma" ? "Birth & Longevity Protection" : "Soul Transition & Pitru Moksha"}
Person Name: ${result.personName}
Longevity: ${result.longevity.category} (${result.longevity.estimatedAgeSpan})
Gandanta: ${result.gandanta.type}
Soul Realm: ${result.mokshaGati.realmName}
Priest: Shreeram Pandit, Gokarna (+91 94801 84545)
Write with authentic Sanskrit sloka references, compassionate spiritual tone, and practical Vedic guidance without markdown bold symbols.`;

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

    if (!response.ok) return fallbackNarrative;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.replace(/\*\*/g, "").trim() : fallbackNarrative;
  } catch (err) {
    console.error("Gemini AI Sanjeevini call failed, using fallback:", err);
    return fallbackNarrative;
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
  const mokshaGati = calculateMokshaGati(lagnaRashi, nakshatra);
  const sanjeeviniShield = buildSanjeeviniShield();
  const { pitruKarma, gokarnaSankalpa } = buildPitruKarmaAndGokarna();

  return {
    input,
    calculatedAt: new Date().toISOString(),
    mode: input.mode,
    personName: input.personName || "Devotee",
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
    mokshaGati,
    sanjeeviniShield,
    pitruKarma,
    gokarnaSankalpa
  };
}
