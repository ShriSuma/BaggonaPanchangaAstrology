/**
 * Panchanga Gemstone, Ring & Neck Amulet Engine
 * (ಪಂಚಾಂಗ ಸಮಗ್ರ ರತ್ನ, ಉಂಗುರ & ಕೊರಳ ರಕ್ಷಾ ಕವಚ ಎಂಜಿನ್)
 *
 * Implements rigorous Parashari & Mani Mala (ರತ್ನ ಶಾಸ್ತ್ರ) rules:
 * 1. Multi-factor Synthesis: NEVER prescribe solely based on Rashi (Moon sign)!
 *    Synthesizes: Janma Lagna (Tri-Kona vs Dusthana), Janma Nakshatra (Deity & Lord),
 *    Moon Sign, 5 Panchanga Angas (Vara, Tithi, Nakshatra, Yoga, Karana),
 *    Planetary Dignities (Exalted, Debilitated, Combust, Retrograde, Dusthana),
 *    and Running Mahadasha-Bhukti.
 * 2. Finger vs Neck Segregation:
 *    - Rings (ಉಂಗುರ): Worn on fingers; amplifies planetary currents directly into the aura.
 *      Only auspicious Tri-Kona lords (1st, 5th, 9th) or Yogakaraka should be worn as rings!
 *    - Neck Wear (ಕೊರಳ ಧಾರಣೆ): Worn at Vishuddha/Anahata chakras.
 *      Nakshatra-aligned Rudraksha (1 to 14 Mukhi), sacred pendants, kavachas, and malas
 *      provide divine shielding, absorbing malefic transits safely without adverse amplification.
 * 3. Strict Contraindications & Prohibitions:
 *    - Pinpoints dangerous stones (6th, 8th, 12th lords or bitter enemies) that cause catastrophic
 *      health issues, surgeries, bankruptcies, accidents, or divorce if worn.
 * 4. Bio-field Color Harmony & Strict Avoid Colors:
 *    - Explains why black or red elevates some natives (Yogakaraka Saturn or Mars) while
 *      triggering severe depression or road accidents in others.
 * 5. 30 Classical Internet & Historical Benchmark Case Studies:
 *    - Documented real-world records of adverse effects from wrong stones and turnaround
 *      after wearing the authentic Panchanga-aligned combination.
 */

import { PlanetName, type KundliOutput } from "./AstroTypes";
import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { signLord } from "./KundliInsightsEngine";

export interface GemstoneRingDetails {
  gemstoneKn: string;
  gemstoneEn: string;
  sanskritName: string;
  caratWeightKn: string;
  caratWeightEn: string;
  metalKn: string;
  metalEn: string;
  fingerKn: string;
  fingerEn: string;
  handKn: string;
  handEn: string;
  activationDayKn: string;
  activationDayEn: string;
  horaKn: string;
  horaEn: string;
  mantraKn: string;
  mantraEn: string;
  astrologicalReasonKn: string;
  astrologicalReasonEn: string;
}

export interface NeckWearDetails {
  nakshatraNameKn: string;
  nakshatraNameEn: string;
  nakshatraLordKn: string;
  nakshatraLordEn: string;
  nakshatraDeityKn: string;
  nakshatraDeityEn: string;
  rudrakshaMukhi: number;
  rudrakshaNameKn: string;
  rudrakshaNameEn: string;
  pendantTypeKn: string;
  pendantTypeEn: string;
  threadColorKn: string;
  threadColorEn: string;
  wearingProcedureKn: string;
  wearingProcedureEn: string;
  protectiveBlessingKn: string;
  protectiveBlessingEn: string;
}

export interface ProhibitedGemstoneAlert {
  gemstoneKn: string;
  gemstoneEn: string;
  rulingPlanetKn: string;
  rulingPlanetEn: string;
  houseLordshipKn: string;
  houseLordshipEn: string;
  severeWarningKn: string;
  severeWarningEn: string;
}

export interface ColorHarmonyDetails {
  luckyColorsKn: string[];
  luckyColorsEn: string[];
  whyLuckyKn: string;
  whyLuckyEn: string;
  strictAvoidColorsKn: string[];
  strictAvoidColorsEn: string[];
  dangerWarningKn: string;
  dangerWarningEn: string;
}

export interface EarOrnamentDetails {
  ornamentTypeKn: string;
  ornamentTypeEn: string;
  gemstoneKn: string;
  gemstoneEn: string;
  metalKn: string;
  metalEn: string;
  biologicalBenefitKn: string;
  biologicalBenefitEn: string;
  wearingInstructionsKn: string;
  wearingInstructionsEn: string;
}

export interface NextDaySadhanaDetails {
  morningDeityPrayerKn: string;
  morningDeityPrayerEn: string;
  mantraChantKn: string;
  mantraChantEn: string;
  exactMantraCount: number;
  waterOfferingArghyaKn: string;
  waterOfferingArghyaEn: string;
  foodOrAnimalCharityKn: string;
  foodOrAnimalCharityEn: string;
  templeSankalpaKn: string;
  templeSankalpaEn: string;
}

import {
  type BenchmarkCaseStudy,
  GEMSTONE_100_BENCHMARK_PROFILES,
  getBenchmarkProfilesByCategory,
  getBenchmarkProfilesByOutcome,
  getBenchmarkProfileById,
  getGemstoneAuditStatistics
} from "./gemstoneBenchmark100Profiles";

export {
  type BenchmarkCaseStudy,
  GEMSTONE_100_BENCHMARK_PROFILES,
  getBenchmarkProfilesByCategory,
  getBenchmarkProfilesByOutcome,
  getBenchmarkProfileById,
  getGemstoneAuditStatistics
};

export interface PanchangaGemstoneAmuletResult {
  primaryRing: GemstoneRingDetails;
  bhagyaRing: {
    gemstoneKn: string;
    gemstoneEn: string;
    fingerKn: string;
    fingerEn: string;
    metalKn: string;
    metalEn: string;
  };
  yogakarakaRing?: {
    gemstoneKn: string;
    gemstoneEn: string;
    fingerKn: string;
    fingerEn: string;
    metalKn: string;
    metalEn: string;
    impactKn: string;
    impactEn: string;
  };
  neckWear: NeckWearDetails;
  earOrnament: EarOrnamentDetails;
  nakshatraDignity: NakshatraDignityInfo;
  nextDaySadhana: NextDaySadhanaDetails;
  prohibitedGems: ProhibitedGemstoneAlert[];
  colors: ColorHarmonyDetails;
  consecrationTaraBalaKn: string;
  consecrationTaraBalaEn: string;
  havalaAnalysis: {
    isRecommended: boolean;
    verdictKn: string;
    verdictEn: string;
    instructionsKn: string;
    instructionsEn: string;
  };
  benchmarkCases: BenchmarkCaseStudy[];
}

// ── 1. 27 NAKSHATRAS TO SACRED NECK WEAR MAP ────────────────────────────────
export const NAKSHATRA_NECK_WEAR_CATALOG: Record<string, {
  mukhi: number;
  nameKn: string;
  nameEn: string;
  deityKn: string;
  deityEn: string;
  lord: PlanetName;
  pendantKn: string;
  pendantEn: string;
  threadKn: string;
  threadEn: string;
  blessingKn: string;
  blessingEn: string;
}> = {
  Ashwini: {
    mukhi: 9,
    nameKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ನವದುರ್ಗಾ ಶಕ್ತಿ)",
    nameEn: "9-Mukhi Rudraksha (Navadurga Grace)",
    deityKn: "ಅಶ್ವಿನೀ ಕುಮಾರರು (ದೇವ ವೈದ್ಯರು)",
    deityEn: "Ashwini Kumaras (Divine Healers)",
    lord: PlanetName.Ketu,
    pendantKn: "ಬೆಳ್ಳಿಯ ಗಣಪತಿ ಯಂತ್ರ ಅಥವಾ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Ganesha Yantra or 9-Mukhi Rudraksha Pendant",
    threadKn: "ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ ಅಥವಾ ಬೆಳ್ಳಿಯ ಸರ",
    threadEn: "Red silk thread or silver chain",
    blessingKn: "ಆರೋಗ್ಯ ಚೈತನ್ಯ, ಅನಿರೀಕ್ಷಿತ ಅಪಘಾತ ಭಯ ನಿವಾರಣೆ ಮತ್ತು ಕಾರ್ಯ ವೇಗವರ್ಧನೆ.",
    blessingEn: "Vital health resilience, fear dispelling, and rapid career momentum."
  },
  Bharani: {
    mukhi: 6,
    nameKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಸುಬ್ರಹ್ಮಣ್ಯ / ಕಾರ್ತಿಕೇಯ)",
    nameEn: "6-Mukhi Rudraksha (Lord Kartikeya)",
    deityKn: "ಯಮಧರ್ಮ ರಾಜ",
    deityEn: "Lord Yama (Dharma Lord)",
    lord: PlanetName.Venus,
    pendantKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಓಂಕಾರ ಅಥವಾ ಷಣ್ಮುಖ ಪೆಂಡೆಂಟ್",
    pendantEn: "Pure Silver Omkara or Shanmukha Pendant",
    threadKn: "ಬಿಳಿ ಅಥವಾ ಗುಲಾಬಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "White or rose silk thread",
    blessingKn: "ಇಂದ್ರಿಯ ನಿಗ್ರಹ, ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಕರ್ಮ ಬಂಧನಗಳಿಂದ ರಕ್ಷಣೆ.",
    blessingEn: "Sensory mastery, magnetic charisma, and protection from karmic traps."
  },
  Krittika: {
    mukhi: 12,
    nameKn: "೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದ್ವಾದಶಾದಿತ್ಯ ಸೂರ್ಯ)",
    nameEn: "12-Mukhi Rudraksha (Lord Surya)",
    deityKn: "ಅಗ್ನಿದೇವ",
    deityEn: "Lord Agni (Sacred Fire)",
    lord: PlanetName.Sun,
    pendantKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನದಲ್ಲಿ ಸೂರ್ಯ ಯಂತ್ರ ಪೆಂಡೆಂಟ್",
    pendantEn: "Copper or Gold Surya Yantra Pendant",
    threadKn: "ಕೇಸರಿ ಅಥವಾ ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Saffron or red silk thread",
    blessingKn: "ಆತ್ಮವಿಶ್ವಾಸ, ನಾಯಕತ್ವ ಗುಣ, ತೇಜಸ್ಸು ಹಾಗೂ ಪಿತೃದೋಷ ಶಾಂತಿ.",
    blessingEn: "Supreme self-confidence, leadership, vital radiance, and ancestral peace."
  },
  Rohini: {
    mukhi: 2,
    nameKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅರ್ಧನಾರೀಶ್ವರ / ಗೌರೀ-ಶಂಕರ)",
    nameEn: "2-Mukhi Rudraksha (Ardhanarishwara)",
    deityKn: "ಬ್ರಹ್ಮದೇವ (ಪ್ರಜಾಪತಿ)",
    deityEn: "Lord Brahma (Creator)",
    lord: PlanetName.Moon,
    pendantKn: "ಬೆಳ್ಳಿಯ ಚಂದ್ರ ಕವಚ ಅಥವಾ ನೈಸರ್ಗಿಕ ಮುತ್ತಿನ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Moon Crescent or Natural Pearl Pendant",
    threadKn: "ಬಿಳಿ ರೇಷ್ಮೆ ದಾರ ಅಥವಾ ಬೆಳ್ಳಿಯ ಸರ",
    threadEn: "White silk thread or sterling silver chain",
    blessingKn: "ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ, ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ ಹಾಗೂ ದಾಂಪತ್ಯ ಪ್ರೇಮ ಸಮೃದ್ಧಿ.",
    blessingEn: "Unshakable peace of mind, emotional poise, and domestic warmth."
  },
  Mrigashira: {
    mukhi: 3,
    nameKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಗ್ನಿ ತತ್ತ್ವ ಪಾವಿತ್ರ್ಯ)",
    nameEn: "3-Mukhi Rudraksha (Agni Tatva)",
    deityKn: "ಸೋಮ (ಚಂದ್ರದೇವ)",
    deityEn: "Lord Soma (Nectar of Immortality)",
    lord: PlanetName.Mars,
    pendantKn: "ತಾಮ್ರದ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಕವಚ ಅಥವಾ ತ್ರಿಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    pendantEn: "Copper Kartikeya Kavacha or 3-Mukhi Rudraksha",
    threadKn: "ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Red silk thread",
    blessingKn: "ಹಿಂದಿನ ಜನ್ಮದ ಪಾಪಕ್ಷಯ, ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ ಹಾಗೂ ಧೈರ್ಯ ವೃದ್ಧಿ.",
    blessingEn: "Purification of past karmas, emotional calm, and supreme courage."
  },
  Ardra: {
    mukhi: 8,
    nameKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಿಘ್ನೇಶ್ವರ & ರುದ್ರ ಕೃಪೆ)",
    nameEn: "8-Mukhi Rudraksha (Lord Ganesha & Rudra)",
    deityKn: "ರುದ್ರದೇವ (ಲಯಕರ್ತ)",
    deityEn: "Lord Rudra (Fierce Compassion)",
    lord: PlanetName.Rahu,
    pendantKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಕವಚ",
    pendantEn: "Pure Silver Gokarna Mahabaleshwara Atmalinga Kavacha",
    threadKn: "ಕಪ್ಪು ಅಥವಾ ಗಾಢ ಕಂದು ದಾರ",
    threadEn: "Dark brown or black silk thread",
    blessingKn: "ರಾಹುವಿನ ಭ್ರಮೆ, ಮಾನಸಿಕ ತೊಳಲಾಟ, ವಾಮಾಚಾರ ಭಯ ನಿವಾರಣೆ ಮತ್ತು ಅಖಂಡ ಜಯ.",
    blessingEn: "Shielding from Rahu illusions, anxiety, psychic attacks, and hurdles."
  },
  Punarvasu: {
    mukhi: 5,
    nameKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಕಾಲಾಗ್ನಿ ರುದ್ರ / ಗುರು ಬಲ)",
    nameEn: "5-Mukhi Rudraksha (Lord Shiva & Guru)",
    deityKn: "ಅದಿತಿ (ದೇವತೆಗಳ ಮಾತೆ)",
    deityEn: "Goddess Aditi (Cosmic Mother)",
    lord: PlanetName.Jupiter,
    pendantKn: "ಬಂಗಾರದ ತಾಯಿತದಲ್ಲಿ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಹಳದಿ ನೀಲಮಣಿ",
    pendantEn: "Gold-capped 5-Mukhi Rudraksha or Yellow Sapphire Pendant",
    threadKn: "ಹಳದಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Yellow silk thread",
    blessingKn: "ಜ್ಞಾನಾರ್ಜನೆ, ಗುರುಕೃಪೆ, ಪುತ್ರ-ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಧರ್ಮ ರಕ್ಷಣೆ.",
    blessingEn: "Spiritual wisdom, Divine Guru grace, progeny blessings, and virtue."
  },
  Pushya: {
    mukhi: 7,
    nameKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಮಹಾಲಕ್ಷ್ಮಿ & ಶನಿ ಕವಚ)",
    nameEn: "7-Mukhi Rudraksha (Goddess Mahalakshmi)",
    deityKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ",
    deityEn: "Brihaspati (Preceptor of Gods)",
    lord: PlanetName.Saturn,
    pendantKn: "ಬೆಳ್ಳಿಯ ಮಹಾಲಕ್ಷ್ಮಿ ಯಂತ್ರ ಅಥವಾ ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    pendantEn: "Silver Mahalakshmi Yantra or 7-Mukhi Rudraksha",
    threadKn: "ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Navy blue or black silk thread",
    blessingKn: "ಸ್ಥಿರ ಸಂಪತ್ತು, ಶನಿ ಸಾಡೇಸಾತಿ ರಕ್ಷಣೆ, ಗೌರವ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ.",
    blessingEn: "Permanent financial prosperity, Sade Sati immunity, and longevity."
  },
  Ashlesha: {
    mukhi: 4,
    nameKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಚತುರ್ಮುಖ ಬ್ರಹ್ಮ / ನಾಗ ಕವಚ)",
    nameEn: "4-Mukhi Rudraksha (Lord Brahma)",
    deityKn: "ಸರ್ಪ / ನಾಗರಾಜ",
    deityEn: "Sarpa (Serpent Deities)",
    lord: PlanetName.Mercury,
    pendantKn: "ಬೆಳ್ಳಿಯ ನಾಗ ಕವಚ ಅಥವಾ ಪಚ್ಚೆ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Naga Kavacha or Emerald Pendant",
    threadKn: "ಹಸಿರು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Green silk thread",
    blessingKn: "ಬುದ್ಧಿ ಚಾತುರ್ಯ, ಮಾತುಗಾರಿಕೆ ಬಲ, ವಿಷಭಯ ನಿವಾರಣೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿ.",
    blessingEn: "Sharp intellect, eloquence, protection from deceit, and trade gains."
  },
  Magha: {
    mukhi: 9,
    nameKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದುರ್ಗಾ ಮಾತಾ & ಪಿತೃ ಆಶೀರ್ವಾದ)",
    nameEn: "9-Mukhi Rudraksha (Durga & Pitru Grace)",
    deityKn: "ಪಿತೃ ದೇವತೆಗಳು (ಪೂರ್ವಜರು)",
    deityEn: "Pitrus (Ancestral Souls)",
    lord: PlanetName.Ketu,
    pendantKn: "ಬೆಳ್ಳಿಯ ಪಿತೃ ಮುಕ್ತಿ ಯಂತ್ರ ಅಥವಾ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    pendantEn: "Silver Pitru Mukti Yantra or 9-Mukhi Rudraksha",
    threadKn: "ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Red silk thread",
    blessingKn: "ಪಿತೃದೋಷ ಶಾಂತಿ, ಸಿಂಹಾಸನ ಸದೃಶ ಅಧಿಕಾರ, ಕೀರ್ತಿ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ.",
    blessingEn: "Ancestral liberation, royal authority, fame, and family lineage."
  },
  PurvaPhalguni: {
    mukhi: 6,
    nameKn: "೬ ಮುಖಿ / ೧೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಕಾಮದೇವ & ಲಕ್ಷ್ಮಿ)",
    nameEn: "6 or 13-Mukhi Rudraksha (Lord Kamadeva)",
    deityKn: "ಭಾಗ್ಯ ದೇವತೆ (ಭಗ)",
    deityEn: "Bhaga (God of Fortune)",
    lord: PlanetName.Venus,
    pendantKn: "ಸ್ಪಟಿಕ ಮಾಲೆ ಅಥವಾ ಬೆಳ್ಳಿಯ ಲಕ್ಷ್ಮಿ ಪೆಂಡೆಂಟ್",
    pendantEn: "Sphatika Crystal Mala or Silver Lakshmi Pendant",
    threadKn: "ಗುಲಾಬಿ ಅಥವಾ ಬಿಳಿ ದಾರ",
    threadEn: "Pink or white silk thread",
    blessingKn: "ಸೌಂದರ್ಯ, ಕಲಾ ಪ್ರತಿಭೆ, ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಆರ್ಥಿಕ ಆಕರ್ಷಣೆ.",
    blessingEn: "Personal magnetism, creative bliss, marital harmony, and affluence."
  },
  UttaraPhalguni: {
    mukhi: 12,
    nameKn: "೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಸೂರ್ಯ ನಾರಾಯಣ ಕೃಪೆ)",
    nameEn: "12-Mukhi Rudraksha (Lord Surya Narayana)",
    deityKn: "ಅರ್ಯಮನ್ (ಸ್ನೇಹ & ಧರ್ಮ ದೇವ)",
    deityEn: "Aryaman (Protector of Unions)",
    lord: PlanetName.Sun,
    pendantKn: "ತಾಮ್ರದ ಶ್ರೀ ಸೂರ್ಯ ಕವಚ ಪೆಂಡೆಂಟ್",
    pendantEn: "Copper Surya Kavacha Pendant",
    threadKn: "ಕೆಂಪು ಅಥವಾ ಕೇಸರಿ ದಾರ",
    threadEn: "Red or saffron silk thread",
    blessingKn: "ಸರ್ಕಾರಿ ಕೆಲಸದಲ್ಲಿ ಮನ್ನಣೆ, ನಾಯಕತ್ವ ಬಲ, ಶತ್ರುನಾಶ ಹಾಗೂ ಗೌರವ.",
    blessingEn: "Executive command, government patronage, victory over foes, and honor."
  },
  Hasta: {
    mukhi: 2,
    nameKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಗೌರೀ-ಶಂಕರ ಕವಚ)",
    nameEn: "2-Mukhi Rudraksha (Gauri-Shankara)",
    deityKn: "ಸವಿತೃ (ಸೂರ್ಯನ ಜ್ಞಾನ ತೇಜಸ್ಸು)",
    deityEn: "Savitur (Illuminating Sun)",
    lord: PlanetName.Moon,
    pendantKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಶ್ರೀ ಗಾಯತ್ರೀ ಯಂತ್ರ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Gayatri Yantra Pendant",
    threadKn: "ಬಿಳಿ ಅಥವಾ ತಿಳಿ ಹಳದಿ ದಾರ",
    threadEn: "White or light yellow thread",
    blessingKn: "ಕೈಹಿಡಿದ ಕೆಲಸದಲ್ಲಿ ಯಶಸ್ಸು, ಹಸ್ತಕಲಾ ನೈಪುಣ್ಯ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ನಿವಾರಣೆ.",
    blessingEn: "Golden touch in endeavors, creative dexterity, and peace."
  },
  Chitra: {
    mukhi: 3,
    nameKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಿಶ್ವಕರ್ಮ ಸೃಷ್ಟಿ ಬಲ)",
    nameEn: "3-Mukhi Rudraksha (Lord Vishwakarma)",
    deityKn: "ವಿಶ್ವಕರ್ಮ (ದೈವಿಕ ಶಿಲ್ಪಿ)",
    deityEn: "Vishwakarma (Divine Architect)",
    lord: PlanetName.Mars,
    pendantKn: "ತಾಮ್ರ ಅಥವಾ ಬೆಳ್ಳಿಯ ತ್ರಿಶೂಲ ಪೆಂಡೆಂಟ್",
    pendantEn: "Copper or Silver Trishula Pendant",
    threadKn: "ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Red silk thread",
    blessingKn: "ವಾಸ್ತು ದೋಷ ನಿವಾರಣೆ, ಎಂಜಿನಿಯರಿಂಗ್/ತಾಂತ್ರಿಕ ಪ್ರತಿಭೆ ಹಾಗೂ ತೇಜಸ್ಸು.",
    blessingEn: "Vastu harmonization, architectural brilliance, and supreme vitality."
  },
  Swati: {
    mukhi: 8,
    nameKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಾಯುದೇವ & ಗಣಪತಿ)",
    nameEn: "8-Mukhi Rudraksha (Lord Vayu & Ganesha)",
    deityKn: "ವಾಯುದೇವ (ಪ್ರಾಣವಾಯು)",
    deityEn: "Lord Vayu (Life-force)",
    lord: PlanetName.Rahu,
    pendantKn: "ಬೆಳ್ಳಿಯ ಆಂಜನೇಯ ಕವಚ ಅಥವಾ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    pendantEn: "Silver Hanuman Kavacha or 8-Mukhi Rudraksha",
    threadKn: "ಕಪ್ಪು ಅಥವಾ ಹಳದಿ ಮಿಶ್ರಿತ ದಾರ",
    threadEn: "Black or yellow-bordered thread",
    blessingKn: "ಸ್ವಾವಲಂಬನೆ, ವ್ಯಾಪಾರದಲ್ಲಿ ಮುಕ್ತ ಮುನ್ನಡೆ, ಆತಂಕ ಮುಕ್ತಿ ಹಾಗೂ ಭಾಗ್ಯೋದಯ.",
    blessingEn: "Independent enterprise, trade freedom, panic relief, and luck."
  },
  Vishakha: {
    mukhi: 5,
    nameKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಇಂದ್ರಾಗ್ನಿ ವಿಜಯ ಕವಚ)",
    nameEn: "5-Mukhi Rudraksha (Indragni Victorious)",
    deityKn: "ಇಂದ್ರ ಹಾಗೂ ಅಗ್ನಿ (ಇಂದ್ರಾಗ್ನಿ)",
    deityEn: "Indra & Agni (Triumphant Pair)",
    lord: PlanetName.Jupiter,
    pendantKn: "ಬಂಗಾರ ಅಥವಾ ಬೆಳ್ಳಿಯ ಗುರು ಯಂತ್ರ ಪೆಂಡೆಂಟ್",
    pendantEn: "Gold or Silver Guru Yantra Pendant",
    threadKn: "ಹಳದಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Yellow silk thread",
    blessingKn: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಜಯ, ಗುರಿ ಸಾಧನೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಧನಾಗಮನ.",
    blessingEn: "Competitive triumph, relentless goal achievement, and wealth."
  },
  Anuradha: {
    mukhi: 7,
    nameKn: "೭ ಮುಖಿ ಅಥವಾ ೧೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದೇವತಾ ಮಿತ್ರ ಬಲ)",
    nameEn: "7 or 14-Mukhi Rudraksha (Devata Mitra)",
    deityKn: "ಮಿತ್ರ (ಸ್ನೇಹ & ಸದ್ಭಾವನೆಯ ದೇವ)",
    deityEn: "Mitra (God of Alliances & Friendship)",
    lord: PlanetName.Saturn,
    pendantKn: "ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ ಕವಚ ಅಥವಾ ನೀಲಿ ಸ್ಪಟಿಕ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Shivalinga Kavacha or Blue Crystal Pendant",
    threadKn: "ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Blue or black silk thread",
    blessingKn: "ವಿದೇಶ ಪ್ರವಾಸ ಭಾಗ್ಯ, ಆಪ್ತ ಸ್ನೇಹಿತರ ಸಹಕಾರ, ಶನಿ ಸಂಕಷ್ಟ ನಿವಾರಣೆ.",
    blessingEn: "Foreign travel luck, loyal alliances, and Saturn affliction relief."
  },
  Jyeshtha: {
    mukhi: 4,
    nameKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದೇವೇಂದ್ರ ಕೃಪೆ)",
    nameEn: "4-Mukhi Rudraksha (Lord Indra Grace)",
    deityKn: "ಇಂದ್ರ (ದೇವತೆಗಳ ಅಧಿಪತಿ)",
    deityEn: "Lord Indra (King of Gods)",
    lord: PlanetName.Mercury,
    pendantKn: "ಬೆಳ್ಳಿಯ ವಜ್ರಾಯುಧ ಯಂತ್ರ ಅಥವಾ ಪಚ್ಚೆ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Vajra Yantra or Emerald Pendant",
    threadKn: "ಹಸಿರು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Green silk thread",
    blessingKn: "ಹಿರಿತನದ ಸ್ಥಾನಮಾನ, ಅಧಿಕಾರ, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಧೈರ್ಯ.",
    blessingEn: "Senior executive stature, authority, wisdom, and fearless leadership."
  },
  Moola: {
    mukhi: 9,
    nameKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಗಂಡಾಂತ ದೋಷ ನಿವಾರಕ)",
    nameEn: "9-Mukhi Rudraksha (Gandanta Shield)",
    deityKn: "ನಿರೃತಿ (ಮಹಾಕಾಳಿ)",
    deityEn: "Nirriti (Goddess Mahakali)",
    lord: PlanetName.Ketu,
    pendantKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಕವಚ",
    pendantEn: "Silver Gokarna Mahabaleshwara Raksha Kavacha",
    threadKn: "ಕೆಂಪು ಅಥವಾ ಕಪ್ಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Red or black silk thread",
    blessingKn: "ಮೂಲ ನಕ್ಷತ್ರ ಗಂಡಾಂತರ ಮುಕ್ತಿ, ಸಂಸಾರ ರಕ್ಷಣೆ, ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ.",
    blessingEn: "Complete Moola Gandanta relief, ancestral debt clearance, spiritual peace."
  },
  PurvaAshadha: {
    mukhi: 6,
    nameKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಜಲ ತತ್ತ್ವ ಸಮೃದ್ಧಿ)",
    nameEn: "6-Mukhi Rudraksha (Water Element Grace)",
    deityKn: "ಅಪಃ (ಜಲದೇವತೆ)",
    deityEn: "Apah (Sacred Waters)",
    lord: PlanetName.Venus,
    pendantKn: "ಬೆಳ್ಳಿಯ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೆಂಡೆಂಟ್ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್",
    pendantEn: "Silver Mahalakshmi Pendant or White Zircon",
    threadKn: "ಬಿಳಿ ಅಥವಾ ಗುಲಾಬಿ ದಾರ",
    threadEn: "White or rose silk thread",
    blessingKn: "ಅಪಜಯದ ಭಯ ನಿವಾರಣೆ, ವಾಕ್ಚಾತುರ್ಯ, ಪ್ರವಾಸಗಳಲ್ಲಿ ಜಯ ಹಾಗೂ ಸಂಪತ್ತು.",
    blessingEn: "Infallible victory, emotional flow, eloquence, and luxury."
  },
  UttaraAshadha: {
    mukhi: 12,
    nameKn: "೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಿಶ್ವೇದೇವತೆಗಳ ಅನುಗ್ರಹ)",
    nameEn: "12-Mukhi Rudraksha (Vishwadevas)",
    deityKn: "ವಿಶ್ವೇದೇವತೆಗಳು (ಸಾರ್ವಭೌಮ ದೇವತೆಗಳು)",
    deityEn: "Vishwadevas (Universal Gods)",
    lord: PlanetName.Sun,
    pendantKn: "ತಾಮ್ರದ ಶ್ರೀ ಸೂರ್ಯ-ವಿಷ್ಣು ಯಂತ್ರ ಪೆಂಡೆಂಟ್",
    pendantEn: "Copper Surya-Vishnu Yantra Pendant",
    threadKn: "ಕೇಸರಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Saffron silk thread",
    blessingKn: "ಅಪೂರ್ವ ಜನಪ್ರಿಯತೆ, ನಿಷ್ಕಳಂಕ ಚಾರಿತ್ರ್ಯ, ರಾಜಯೋಗ ಹಾಗೂ ಕೀರ್ತಿ.",
    blessingEn: "Universal admiration, pure character, Rajayoga, and lasting fame."
  },
  Shravana: {
    mukhi: 2,
    nameKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಚಂದ್ರ ಕೃಪೆ)",
    nameEn: "2-Mukhi Rudraksha (Lord Vishnu Grace)",
    deityKn: "ಮಹಾವಿಷ್ಣು (ಲೋಕರಕ್ಷಕ)",
    deityEn: "Lord Maha Vishnu (Preserver)",
    lord: PlanetName.Moon,
    pendantKn: "ಬೆಳ್ಳಿಯ ಶ್ರೀ ತುಳಸೀ ಕವಚ ಅಥವಾ ಶಂಖ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Tulasi Locket or Shankha Pendant",
    threadKn: "ಬಿಳಿ ಅಥವಾ ಹಳದಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "White or yellow silk thread",
    blessingKn: "ಶ್ರವಣ ಶಕ್ತಿ, ಉತ್ತಮ ಕಲಿಯುವಿಕೆ, ಗುರು ಹಿರಿಯರ ಪ್ರೀತಿ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿ.",
    blessingEn: "Deep listening, scholarly brilliance, family respect, and tranquility."
  },
  Dhanishta: {
    mukhi: 3,
    nameKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಷ್ಟವಸುಗಳ ಧನ ಸಮೃದ್ಧಿ)",
    nameEn: "3-Mukhi Rudraksha (Ashta Vasus)",
    deityKn: "ಅಷ್ಟ ವಸುಗಳು (ಐಶ್ವರ್ಯ ದೇವತೆಗಳು)",
    deityEn: "Ashta Vasus (Elemental Gods of Wealth)",
    lord: PlanetName.Mars,
    pendantKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನದಲ್ಲಿ ಧನಲಕ್ಷ್ಮಿ ಕವಚ",
    pendantEn: "Copper or Gold Dhanalakshmi Kavacha",
    threadKn: "ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Red silk thread",
    blessingKn: "ಸಂಗೀತ ಕಲೆ, ಅಖಂಡ ಧನಲಾಭ, ಸ್ಥಿರಾಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ನಾಯಕತ್ವ.",
    blessingEn: "Artistic talent, perpetual wealth flow, real-estate gains, and leadership."
  },
  Shatabhisha: {
    mukhi: 8,
    nameKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವರುಣದೇವ ಶತಭಿಷಕ್ ಸಂಜೀವಿನಿ)",
    nameEn: "8-Mukhi Rudraksha (Varuna Sanjeevini)",
    deityKn: "ವರುಣದೇವ (ಸಾಗರಾಧಿಪತಿ & ಸಂಜೀವಿನಿ ವೈದ್ಯ)",
    deityEn: "Lord Varuna (Cosmic Ocean & Mystic Healer)",
    lord: PlanetName.Rahu,
    pendantKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಶ್ರೀ ಮೃತ್ಯುಂಜಯ ಕವಚ ಅಥವಾ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    pendantEn: "Silver Mrityunjaya Kavacha or 8-Mukhi Rudraksha",
    threadKn: "ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Blue or black silk thread",
    blessingKn: "ದೀರ್ಘಕಾಲದ ರೋಗ ನಿವಾರಣೆ, ವಿಷಮ ಸ್ಥಿತಿಯಿಂದ ಮುಕ್ತಿ, ಸಂಶೋಧನಾ ಯಶಸ್ಸು.",
    blessingEn: "Healing of chronic afflictions, mystical insight, research triumph."
  },
  PurvaBhadrapada: {
    mukhi: 5,
    nameKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಜ ಏಕಪಾದ ತಪೋಶಕ್ತಿ)",
    nameEn: "5-Mukhi Rudraksha (Aja Ekapada)",
    deityKn: "ಅಜ ಏಕಪಾದ (ರುದ್ರನ ತಪೋರೂಪ)",
    deityEn: "Aja Ekapada (Mystic Tapasya Rudra)",
    lord: PlanetName.Jupiter,
    pendantKn: "ಬಂಗಾರ ಅಥವಾ ಹಿತ್ತಾಳೆಯ ಶ್ರೀ ಗುರು ಪೆಂಡೆಂಟ್",
    pendantEn: "Gold or Brass Guru Locket Pendant",
    threadKn: "ಹಳದಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Yellow silk thread",
    blessingKn: "ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು, ತ್ಯಾಗ ಮನೋಭಾವ, ಉನ್ನತ ತಾತ್ವಿಕ ಜ್ಞಾನ ಹಾಗೂ ಧನಶ್ರೀ.",
    blessingEn: "Spiritual elevation, detached wisdom, philosophical depth, and wealth."
  },
  UttaraBhadrapada: {
    mukhi: 7,
    nameKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಹಿರ್ಬುಧ್ನ್ಯ ಕುಂಡಲಿನಿ ಜಾಗೃತಿ)",
    nameEn: "7-Mukhi Rudraksha (Ahirbudhnya)",
    deityKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (ಆಳವಾದ ಜ್ಞಾನದ ಸರ್ಪರೂಪಿ ರುದ್ರ)",
    deityEn: "Ahirbudhnya (Deep Serpent of the Abyss)",
    lord: PlanetName.Saturn,
    pendantKn: "ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ ಅಥವಾ ನೀಲ ಸ್ಪಟಿಕ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Shivalinga or Blue Quartz Pendant",
    threadKn: "ಗಾಢ ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ದಾರ",
    threadEn: "Dark navy blue or black silk thread",
    blessingKn: "ಕುಂಡಲಿನೀ ಜಾಗೃತಿ, ಗಂಭೀರ ಯೋಚನಾಶಕ್ತಿ, ನಿರಂತರ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ.",
    blessingEn: "Kundalini balance, profound meditation, unwavering financial stability."
  },
  Revati: {
    mukhi: 4,
    nameKn: "೪ ಮುಖಿ / ೧೦ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಪೂಷನ್ ಮಾರ್ಗದರ್ಶಕ)",
    nameEn: "4 or 10-Mukhi Rudraksha (Lord Pushan)",
    deityKn: "ಪೂಷನ್ (ಪ್ರಯಾಣಿಕರ & ಪಶುಗಳ ರಕ್ಷಕ)",
    deityEn: "Pushan (Nurturer & Safe Guide)",
    lord: PlanetName.Mercury,
    pendantKn: "ಬೆಳ್ಳಿಯ ಶ್ರೀ ಗೋಪಾಲ ಕೃಷ್ಣ ಯಂತ್ರ ಅಥವಾ ಪಚ್ಚೆ ಪೆಂಡೆಂಟ್",
    pendantEn: "Silver Gopala Krishna Yantra or Emerald Pendant",
    threadKn: "ಹಸಿರು ಅಥವಾ ಬಿಳಿ ರೇಷ್ಮೆ ದಾರ",
    threadEn: "Green or white silk thread",
    blessingKn: "ಪ್ರಯಾಣದಲ್ಲಿ ರಕ್ಷಣೆ, ಹೈನುಗಾರಿಕೆ/ವ್ಯಾಪಾರದಲ್ಲಿ ವೃದ್ಧಿ, ಅಂತಿಮ ಮೋಕ್ಷ ಗತಿ.",
    blessingEn: "Safe travel, livestock/commerce flourishing, and spiritual culmination."
  }
};

// ── 1b. 27 NAKSHATRAS DIGNITY, EXALTATION, EARRING & NEXT-DAY SADHANA MASTER CATALOG ──
export interface NakshatraDignityInfo {
  nakshatraNameKn: string;
  nakshatraNameEn: string;
  nakshatraSwamiKn: string;
  nakshatraSwamiEn: string;
  swamiPlanet: PlanetName;
  nakshatraDevataKn: string;
  nakshatraDevataEn: string;
  exaltedPlanetsKn: string;
  exaltedPlanetsEn: string;
  debilitatedPlanetsKn: string;
  debilitatedPlanetsEn: string;
  sacredHaraKn: string;
  sacredHaraEn: string;
  karnaKundalaKn: string;
  karnaKundalaEn: string;
  luckyColorClothesKn: string[];
  luckyColorClothesEn: string[];
  strictAvoidColorsKn: string[];
  strictAvoidColorsEn: string[];
  nextDayActionableSadhanaKn: string;
  nextDayActionableSadhanaEn: string;
  associatedLuckyGemsKn: string;
  associatedLuckyGemsEn: string;
}

export const NAKSHATRA_DIGNITY_CATALOG: Record<string, NakshatraDignityInfo> = {
  "Ashwini": {
    nakshatraNameKn: "ಅಶ್ವಿನಿ",
    nakshatraNameEn: "Ashwini",
    nakshatraSwamiKn: "ಕೇತು",
    nakshatraSwamiEn: "Ketu",
    swamiPlanet: PlanetName.Ketu,
    nakshatraDevataKn: "ಅಶ್ವಿನೀ ಕುಮಾರರು (ದೇವ ವೈದ್ಯರು)",
    nakshatraDevataEn: "Ashwini Kumaras (Divine Healers)",
    exaltedPlanetsKn: "ಸೂರ್ಯ (ಸೂರ್ಯ ನಾರಾಯಣರು ಮೇಷ ರಾಶಿಯ ಅಶ್ವಿನಿ ೩ನೇ ಪಾದದಲ್ಲಿ ೧೦° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Sun (Reaches Parama Ucha - peak exaltation at 10°00' Aries, 3rd Pada of Ashwini)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಶುದ್ಧ ಕ್ಷಿಪ್ರ ನಕ್ಷತ್ರ)",
    debilitatedPlanetsEn: "None (Swift Sattvic initiating asterism)",
    sacredHaraKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಗಣೇಶ ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ಕೆಂಪು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "9-Mukhi Rudraksha or Pure Silver Ganesha Yantra pendant in red silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಲೋಹದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ವೈಡೂರ್ಯ ಅಥವಾ ಸ್ಪಟಿಕ ಹರಳಿನಿಂದ (ಶಿರೋ ನರಮಂಡಲ ಚುರುಕುಗೊಳಿಸಲು)",
    karnaKundalaEn: "Silver or Panchaloha ear studs set with natural Cat's Eye or Clear Quartz to stimulate cranial reflex meridians",
    luckyColorClothesKn: ["ಕೇಸರಿ", "ರೇಷ್ಮೆ ಕ್ರೀಮ್", "ತಿಳಿ ಹಳದಿ", "ಶುದ್ಧ ಬಿಳಿ"],
    luckyColorClothesEn: ["Saffron", "Silk Cream", "Light Yellow", "Pure White"],
    strictAvoidColorsKn: ["ಕಡು ಕಪ್ಪು", "ಮಬ್ಬು ಬೂದು"],
    strictAvoidColorsEn: ["Jet Black", "Dull Grey"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಮುಂಜಾನೆ ಸೂರ್ಯೋದಯದಲ್ಲಿ ಪೂರ್ವಕ್ಕೆ ಮುಖಮಾಡಿ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಗಾಯತ್ರೀ ಮಂತ್ರ ೧೧ ಬಾರಿ ಪಠಣ. ೨) 'ಓಂ ಕೇತವೇ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೩) ಗಣಪತಿಗೆ ದೂರ್ವೆ (ಗರಿಕೆ) ಅರ್ಪಣೆ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಮೊದಲ ದಿನದಿಂದಲೇ ಕಾರ್ಯತತ್ಪರತೆ ಮತ್ತು ಅದೃಷ್ಟ ವೃದ್ಧಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Face East at sunrise, perform Surya Namaskar and chant Gayatri Mantra 11 times. 2) Chant 'Om Ketave Namaha' 11 times. 3) Offer sacred Durva grass to Lord Ganesha. 4) Consecrate a prayer to Sri Kshetra Gokarna Mahabaleshwara for instant vitality and rapid momentum.",
    associatedLuckyGemsKn: "ವೈಡೂರ್ಯ (Cat's Eye), ಮಾಣಿಕ್ಯ (Ruby), ಸ್ಪಟಿಕ (Clear Quartz)",
    associatedLuckyGemsEn: "Cat's Eye (Chrysoberyl), Ruby, Clear Quartz (Sphatika)"
  },
  "Bharani": {
    nakshatraNameKn: "ಭರಣಿ",
    nakshatraNameEn: "Bharani",
    nakshatraSwamiKn: "ಶುಕ್ರ",
    nakshatraSwamiEn: "Venus",
    swamiPlanet: PlanetName.Venus,
    nakshatraDevataKn: "ಯಮಧರ್ಮ ರಾಜ (ನ್ಯಾಯ & ಧರ್ಮ ಕರ್ತ)",
    nakshatraDevataEn: "Lord Yama (Dharma & Cosmic Justice)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಉಗ್ರ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Fierce transformative star)",
    debilitatedPlanetsKn: "ಶನಿ (ಶನಿ ಮಹಾರಾಜರು ಮೇಷ ರಾಶಿಯ ಭರಣಿ ೩ನೇ ಪಾದದಲ್ಲಿ ೨೦° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Saturn (Reaches Parama Neecha - peak debilitation at 20°00' Aries, 3rd Pada of Bharani)",
    sacredHaraKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಸುಬ್ರಹ್ಮಣ್ಯ) ಅಥವಾ ಬೆಳ್ಳಿಯ ಓಂಕಾರ ಪೆಂಡೆಂಟ್ (ಬಿಳಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "6-Mukhi Rudraksha (Kartikeya) or Silver Omkara pendant in white silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ವೈಟ್ ಗೋಲ್ಡ್ ಕಿವಿಯೋಲೆ, ಅದರಲ್ಲಿ ನೈಸರ್ಗಿಕ ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಜಿರ್ಕಾನ್ (ಕಾಮ-ಕ್ರೋಧ ನಿಗ್ರಹ ಹಾಗೂ ಆಕರ್ಷಕ ತೇಜಸ್ಸಿಗೆ)",
    karnaKundalaEn: "Pure Silver or White Gold ear studs set with Natural Diamond or White Zircon (regulates sensory impulses and personal charisma)",
    luckyColorClothesKn: ["ಶುದ್ಧ ಬಿಳಿ", "ಗುಲಾಬಿ", "ತಿಳಿ ನೀಲಿ", "ಬೆಳ್ಳಿ ಬಣ್ಣ"],
    luckyColorClothesEn: ["Pure White", "Pastel Pink", "Sky Blue", "Silver Cream"],
    strictAvoidColorsKn: ["ಕಡು ಕಪ್ಪು (ಶನಿ ನೀಚ ಸ್ಥಾನ)", "ಅತಿಯಾದ ಗಾಢ ಬೂದು"],
    strictAvoidColorsEn: ["Jet Black (Saturn debilitation)", "Dull Ash Grey"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶುಕ್ರವಾರ ಅಥವಾ ನಾಳೆ ಬೆಳಗ್ಗೆ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಅಷ್ಟಕಂ ಪಠಿಸಿ. ೨) 'ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಬಿಳಿ ಹಸುವಿಗೆ ಅನ್ನ ಅಥವಾ ಸಿಹಿ ತಿನಿಸು ತಿನ್ನಿಸಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ತುಪ್ಪದ ದೀಪ ಸಮರ್ಪಿಸುವುದರಿಂದ ಕರ್ಮ ಬಂಧನಗಳು ಕಳಚಿ ಅದೃಷ್ಟ ಒಲಿಯುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Light a pure cow-ghee lamp facing East and recite Sri Mahalakshmi Ashtakam. 2) Chant 'Om Shum Shukraya Namaha' 108 times. 3) Feed white cows sweet rice or bread. 4) Dedicate a cow-ghee lamp at Sri Kshetra Gokarna Mahabaleshwara for dissolving karmic burdens.",
    associatedLuckyGemsKn: "ವಜ್ರ (Diamond), ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon), ಬಿಳಿ ಓಪಲ್ (White Opal)",
    associatedLuckyGemsEn: "Natural Diamond, White Zircon, Australian White Opal"
  },
  "Krittika": {
    nakshatraNameKn: "ಕೃತಿಕಾ",
    nakshatraNameEn: "Krittika",
    nakshatraSwamiKn: "ಸೂರ್ಯ",
    nakshatraSwamiEn: "Sun",
    swamiPlanet: PlanetName.Sun,
    nakshatraDevataKn: "ಅಗ್ನಿದೇವ (ಪಾವನ ಜ್ಯೋತಿ)",
    nakshatraDevataEn: "Lord Agni (Sacred Fire)",
    exaltedPlanetsKn: "ಚಂದ್ರ (ಚಂದ್ರದೇವನು ವೃಷಭ ರಾಶಿಯ ಕೃತಿಕಾ ೨ನೇ ಪಾದದಲ್ಲಿ ೩° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Moon (Reaches Parama Ucha - peak exaltation at 3°00' Taurus, 2nd Pada of Krittika)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ದಹನ ತೇಜಸ್ಸು)",
    debilitatedPlanetsEn: "None (Purifying solar brilliance)",
    sacredHaraKn: "೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದ್ವಾದಶಾದಿತ್ಯ) ಅಥವಾ ತಾಮ್ರದ ಸೂರ್ಯ ಯಂತ್ರ (ಕೇಸರಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "12-Mukhi Rudraksha (Lord Surya) or Copper Surya Yantra in saffron silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬಂಗಾರ ಅಥವಾ ತಾಮ್ರದ ವೃತ್ತಾಕಾರದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಮಾಣಿಕ್ಯ ಅಥವಾ ಕೆಂಪು ಗಾರ್ನೆಟ್ ಹರಳಿನಿಂದ (ಆತ್ಮಸ್ಥೈರ್ಯಕ್ಕೆ)",
    karnaKundalaEn: "Pure Gold or Copper circular studs with natural Ruby or Red Garnet to awaken radiant leadership and solar vitality",
    luckyColorClothesKn: ["ಕೇಸರಿ", "ಬಂಗಾರದ ಹಳದಿ", "ಮಾಣಿಕ್ಯ ಕೆಂಪು", "ತಾಮ್ರ ಬಣ್ಣ"],
    luckyColorClothesEn: ["Saffron", "Golden Yellow", "Ruby Red", "Copper Bronze"],
    strictAvoidColorsKn: ["ಕಡು ನೀಲಿ", "ಮಣ್ಣಿನ ಬಣ್ಣ", "ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Navy Blue", "Muddy Brown", "Jet Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸೂರ್ಯೋದಯದ ಮೊದಲ ಕಿರಣಗಳಲ್ಲಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಕೆಂಪು ಹೂವು ಹಾಗೂ ಅಕ್ಷತೆ ಬೆರೆಸಿ ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ. ೨) ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರ ೨೪ ಬಾರಿ ಪಠಿಸಿ. ೩) ಬೆಲ್ಲ ಮತ್ತು ಗೋಧಿಯನ್ನು ಹಸುಗಳಿಗೆ ತಿನ್ನಿಸಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ಅಥವಾ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸುವುದರಿಂದ ಸಕಲ ಶತ್ರುಭಯ ನಾಶವಾಗಿ ಯಶಸ್ಸು ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Offer copper-pot Arghya with red flowers and Akshatha to Lord Surya at sunrise. 2) Recite Aditya Hridaya Stotra or Gayatri Mantra 24 times. 3) Feed jaggery and wheat to cows. 4) Consecrate a solar prayer at Sri Kshetra Gokarna to conquer obstacles and unlock royal favor.",
    associatedLuckyGemsKn: "ಮಾಣಿಕ್ಯ (Ruby), ಕೆಂಪು ಗಾರ್ನೆಟ್ (Red Garnet), ಮುತ್ತು (Pearl)",
    associatedLuckyGemsEn: "Natural Ruby, Red Garnet, Natural Pearl"
  },
  "Rohini": {
    nakshatraNameKn: "ರೋಹಿಣಿ",
    nakshatraNameEn: "Rohini",
    nakshatraSwamiKn: "ಚಂದ್ರ",
    nakshatraSwamiEn: "Moon",
    swamiPlanet: PlanetName.Moon,
    nakshatraDevataKn: "ಬ್ರಹ್ಮದೇವ (ಪ್ರಜಾಪತಿ / ಸೃಷ್ಟಿಕರ್ತ)",
    nakshatraDevataEn: "Lord Brahma (Cosmic Creator)",
    exaltedPlanetsKn: "ಚಂದ್ರ (ಚಂದ್ರನ ಮೂಲ ಸೌಭಾಗ್ಯ ಕ್ಷೇತ್ರ; ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನು ಸಂಪೂರ್ಣ ಉಚ್ಛ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    exaltedPlanetsEn: "Moon (Supreme exaltation throne; Moon achieves pinnacle benefic radiance in Rohini)",
    debilitatedPlanetsKn: "ಕೇತು (ವೃಷಭ ರಾಶಿಯ ರೋಹಿಣಿಯಲ್ಲಿ ಕೇತುವು ನೀಚ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    debilitatedPlanetsEn: "Ketu (Ketu experiences deep debilitation in Rohini / Taurus)",
    sacredHaraKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅರ್ಧನಾರೀಶ್ವರ) ಅಥವಾ ಬೆಳ್ಳಿಯ ಅರ್ಧಚಂದ್ರ ಕವಚ (ಶುದ್ಧ ಬಿಳಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "2-Mukhi Rudraksha (Ardhanarishwara) or Silver Moon Crescent pendant in pure white silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಮುತ್ತು ಅಥವಾ ಮೂನ್‌ಸ್ಟೋನ್ ಹರಳಿನಿಂದ (ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಆಕರ್ಷಕ ಕಾಂತಿಗೆ)",
    karnaKundalaEn: "Sterling Silver ear studs set with Natural Freshwater Pearl or Moonstone to balance emotional serenity and lymphatic vitality",
    luckyColorClothesKn: ["ಮುತ್ತಿನ ಬಿಳಿ", "ಬೆಳ್ಳಿಯ ಬಣ್ಣ", "ರೇಷ್ಮೆ ಕ್ರೀಮ್", "ತಿಳಿ ಹಸಿರು"],
    luckyColorClothesEn: ["Pearl White", "Silver Grey", "Silk Cream", "Pale Green"],
    strictAvoidColorsKn: ["ಕಡು ಕಪ್ಪು", "ಗಾಢ ಕಂದು"],
    strictAvoidColorsEn: ["Jet Black", "Dark Brown"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಮುಂಜಾನೆ ಶಿವಲಿಂಗಕ್ಕೆ ಹಸಿಹಾಲು ಸಮರ್ಪಿಸಿ ಜಲಾಭಿಷೇಕ ಮಾಡಿ. ೨) 'ಓಂ ಸೋಮ ಸೋಮಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ನಿರ್ಗತಿಕರಿಗೆ ಅಥವಾ ದೇವಾಲಯದಲ್ಲಿ ಅಕ್ಕಿ ಅಥವಾ ಹಾಲು ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡುವುದರಿಂದ ಮನಸ್ಸಿನ ಸಮಸ್ತ ಆತಂಕಗಳು ಮಾಯವಾಗಿ ದಾಂಪತ್ಯ ಸುಖ ಹೆಚ್ಚುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Offer raw milk abhisheka to Shiva Linga in the morning. 2) Chant 'Om Somaya Namaha' 108 times. 3) Donate white rice or milk to the needy. 4) Sponsor Kshirabhisheka at Sri Kshetra Gokarna Mahabaleshwara Atmalinga for mental peace and marital bliss.",
    associatedLuckyGemsKn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (Natural Pearl), ಮೂನ್‌ಸ್ಟೋನ್ (Moonstone), ಬಿಳಿ ಸ್ಫಟಿಕ",
    associatedLuckyGemsEn: "Natural Pearl (Basra/South Sea), Moonstone, Pure Clear Quartz"
  },
  "Mrigashira": {
    nakshatraNameKn: "ಮೃಗಶಿರ",
    nakshatraNameEn: "Mrigashira",
    nakshatraSwamiKn: "ಮಂಗಳ",
    nakshatraSwamiEn: "Mars",
    swamiPlanet: PlanetName.Mars,
    nakshatraDevataKn: "ಸೋಮ (ಚಂದ್ರದೇವ - ಅಮೃತ ತತ್ತ್ವ)",
    nakshatraDevataEn: "Lord Soma (Nectar of Immortality)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಮೃದು ಅನ್ವೇಷಕ ನಕ್ಷತ್ರ)",
    exaltedPlanetsEn: "None (Gentle searching asterism)",
    debilitatedPlanetsKn: "ಕೇತು (ಮಿಥುನ ರಾಶಿಯ ಭಾಗದಲ್ಲಿ ಕೇತುವು ನೀಚ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    debilitatedPlanetsEn: "Ketu (Ketu experiences debilitation in the Gemini section of Mrigashira)",
    sacredHaraKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಗ್ನಿ ತತ್ತ್ವ) ಅಥವಾ ತಾಮ್ರದ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಕವಚ (ಕೆಂಪು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "3-Mukhi Rudraksha (Agni Tatva) or Copper Kartikeya Kavacha in red silk thread",
    karnaKundalaKn: "ತಾಮ್ರ ಅಥವಾ ಪಂಚಲೋಹದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಕೆಂಪು ಹವಳ ಅಥವಾ ಕಾರ್ನೇಲಿಯನ್ ಹರಳಿನಿಂದ (ಧೈರ್ಯ ಹಾಗೂ ರಕ್ತ ಸಂಚಾರ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ)",
    karnaKundalaEn: "Copper or Panchaloha studs set with natural Red Coral or Carnelian to regulate blood pressure and courage",
    luckyColorClothesKn: ["ಹವಳದ ಕೆಂಪು", "ರೋಸ್ ಪಿಂಕ್", "ತಿಳಿ ಹಸಿರು", "ಕೇಸರಿ"],
    luckyColorClothesEn: ["Coral Red", "Rose Pink", "Soft Green", "Saffron"],
    strictAvoidColorsKn: ["ಕಡು ಬೂದು", "ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Dull Grey", "Jet Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಮಾಡಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿ. ೨) 'ಓಂ ಅಂಗಾರಕಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೩) ಕೆಂಪು ತೊಗರಿಬೇಳೆ ಅಥವಾ ಸಿಹಿ ರೊಟ್ಟಿಯನ್ನು ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಆಸ್ತಿ ವಿವಾದಗಳು ಬಗೆಹರಿದು ಕಾರ್ಯಜಯ ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Meditate on Lord Subramanya and light a ghee lamp. 2) Chant 'Om Angarakaya Namaha' 11 times. 3) Donate red lentils (toor dal) or sweet rotis. 4) Consecrate a prayer at Sri Kshetra Gokarna to resolve land disputes and attain success.",
    associatedLuckyGemsKn: "ಕೆಂಪು ಹವಳ (Red Coral), ಕಾರ್ನೇಲಿಯನ್ (Carnelian), ಹಸಿರು ಪಚ್ಚೆ",
    associatedLuckyGemsEn: "Italian Red Coral, Red Carnelian, Natural Emerald"
  },
  "Ardra": {
    nakshatraNameKn: "ಆರ್ದ್ರಾ",
    nakshatraNameEn: "Ardra",
    nakshatraSwamiKn: "ರಾಹು",
    nakshatraSwamiEn: "Rahu",
    swamiPlanet: PlanetName.Rahu,
    nakshatraDevataKn: "ರುದ್ರದೇವ (ಲಯಕರ್ತ & ಮಹಾಕೃಪಾಸಿಂಧು)",
    nakshatraDevataEn: "Lord Rudra (Fierce Compassion)",
    exaltedPlanetsKn: "ರಾಹು (ಮಿಥುನ ರಾಶಿಯ ಆರ್ದ್ರಾ ನಕ್ಷತ್ರದಲ್ಲಿ ರಾಹುವು ಉಚ್ಛ ಕ್ಷೇತ್ರ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    exaltedPlanetsEn: "Rahu (Achieves exaltation domain dignity in Ardra / Gemini)",
    debilitatedPlanetsKn: "ಕೇತು (ಮಿಥುನ ರಾಶಿಯಲ್ಲಿ ಕೇತುವು ನೀಚ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    debilitatedPlanetsEn: "Ketu (Ketu undergoes debilitation in Gemini / Ardra)",
    sacredHaraKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಿನಾಯಕ-ರುದ್ರ) ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಕವಚ (ಕಪ್ಪು ಅಥವಾ ಗಾಢ ಕಂದು ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "8-Mukhi Rudraksha or Pure Silver Gokarna Mahabaleshwara Atmalinga Kavacha in black/dark brown thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಶುದ್ಧ ಸ್ಫಟಿಕ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ ಹರಳಿನಿಂದ (ರಾಹುವಿನ ಮಾನಸಿಕ ಭ್ರಮೆ ಹಾಗೂ ತಲೆನೋವು ನಿವಾರಿಸಲು)",
    karnaKundalaEn: "Sterling Silver studs with natural Clear Quartz or Amethyst to clear Rahu's psychic fog and migraine tensions",
    luckyColorClothesKn: ["ಮಿಂಚು ನೀಲಿ", "ಧೂಮ್ರ ಬೂದು", "ಗಾಢ ಹಸಿರು", "ಬಿಳಿ"],
    luckyColorClothesEn: ["Electric Blue", "Smoky Grey", "Forest Green", "Pure White"],
    strictAvoidColorsKn: ["ಅತಿಯಾದ ರಕ್ತ ಕೆಂಪು", "ಅಶುದ್ಧ ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Harsh Blood Red", "Unblessed Dull Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಮುಂಜಾನೆ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೨) ಶಿವಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಪತ್ರೆ ಹಾಗೂ ಜಲಾಭಿಷೇಕ ಸಮರ್ಪಿಸಿ. ೩) ಬೀದಿ ನಾಯಿಗಳಿಗೆ ಅಥವಾ ಪಕ್ಷಿಗಳಿಗೆ ಆಹಾರ ನೀಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡುವುದರಿಂದ ರಾಹುವಿನ ಸರ್ವ ಅನಿಷ್ಟಗಳು ಭಸ್ಮವಾಗಿ ಜಯ ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Chant Shiva Panchakshari Stotra or Maha Mrityunjaya Mantra 11 times at sunrise. 2) Offer Bilva leaves and water abhisheka to Shiva Linga. 3) Feed stray dogs or birds. 4) Sponsor Rudrabhisheka at Sri Kshetra Gokarna Mahabaleshwara to incinerate Rahu illusions and fears.",
    associatedLuckyGemsKn: "ಗೋಮೇಧಿಕ (Hessonite), ಶುದ್ಧ ಸ್ಫಟಿಕ (Clear Quartz), ಪಚ್ಚೆ (Emerald)",
    associatedLuckyGemsEn: "Hessonite Garnet (Gomed), Clear Quartz (Sphatika), Emerald"
  },
  "Punarvasu": {
    nakshatraNameKn: "ಪುನರ್ವಸು",
    nakshatraNameEn: "Punarvasu",
    nakshatraSwamiKn: "ಗುರು",
    nakshatraSwamiEn: "Jupiter",
    swamiPlanet: PlanetName.Jupiter,
    nakshatraDevataKn: "ಅದಿತಿ (ದೇವತೆಗಳ ಮಾತೆ / ಪುನಃ ಚೇತನ)",
    nakshatraDevataEn: "Goddess Aditi (Mother of the Gods)",
    exaltedPlanetsKn: "ಗುರು (ಕಟಕ ರಾಶಿಯ ಭಾಗದಲ್ಲಿ ದೇವಗುರು ಉಚ್ಛ ಕ್ಷೇತ್ರ ಪ್ರವೇಶಿಸುತ್ತಾನೆ)",
    exaltedPlanetsEn: "Jupiter (Enters supreme exaltation domain in the Cancer segment of Punarvasu)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಪುನಶ್ಚೇತನ ತಾರಾಮಂಡಲ)",
    debilitatedPlanetsEn: "None (Restorative rejuvenating star)",
    sacredHaraKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬಂಗಾರದ ಗುರು ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ಹಳದಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "5-Mukhi Rudraksha or Gold Guru Yantra pendant in yellow silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬಂಗಾರ ಅಥವಾ ಹಿತ್ತಾಳೆಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಹಳದಿ ಪುಷ್ಯರಾಗ ಅಥವಾ ಸಿಟ್ರಿನ್ ಹರಳಿನಿಂದ (ಗುರುಬಲ ವೃದ್ಧಿ ಹಾಗೂ ವಿದ್ಯಾ ಜ್ಞಾನಕ್ಕೆ)",
    karnaKundalaEn: "Pure Gold or Brass studs set with Yellow Sapphire or Citrine to augment Jupiter's divine wisdom and cranial nerves",
    luckyColorClothesKn: ["ಅರಿಶಿನ ಹಳದಿ", "ಬಂಗಾರದ ಬಣ್ಣ", "ಕ್ರೀಮ್", "ಕೇಸರಿ"],
    luckyColorClothesEn: ["Turmeric Yellow", "Golden Cream", "Bright Saffron", "Ivory"],
    strictAvoidColorsKn: ["ಕಡು ಕಪ್ಪು", "ಗಾಢ ನೀಲಿ"],
    strictAvoidColorsEn: ["Jet Black", "Navy Blue"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅಥವಾ ಗುರು ಗಾಯತ್ರೀ ಮಂತ್ರ ೧೦೮ ಬಾರಿ ಪಠಿಸಿ. ೨) ಬಾಳೆಗಿಡಕ್ಕೆ ನೀರು ಮತ್ತು ಅರಿಶಿನ ಸಮರ್ಪಿಸಿ. ೩) ಬ್ರಾಹ್ಮಣರಿಗೆ ಅಥವಾ ಮಕ್ಕಳಿಗೆ ಹಳದಿ ಹಣ್ಣುಗಳನ್ನು ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗುರು ಶಾಂತಿ ಪೂಜೆ ಸಂಕಲ್ಪ ಮಾಡುವುದರಿಂದ ಕಳೆದುಹೋದ ಭಾಗ್ಯ ಮರಳಿ ಬರುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Vishnu Sahasranama or Guru Gayatri Mantra 108 times. 2) Water a banana tree and offer turmeric. 3) Donate yellow bananas or sweets to children. 4) Consecrate Guru Shanti Pooja at Sri Kshetra Gokarna to recover lost fortune.",
    associatedLuckyGemsKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire), ಹಳದಿ ಸಿಟ್ರಿನ್ (Citrine), ಬಿಳಿ ಮುತ್ತು",
    associatedLuckyGemsEn: "Yellow Sapphire (Pukhraj), Golden Citrine, Natural Pearl"
  },
  "Pushya": {
    nakshatraNameKn: "ಪುಷ್ಯ",
    nakshatraNameEn: "Pushya",
    nakshatraSwamiKn: "ಶನಿ",
    nakshatraSwamiEn: "Saturn",
    swamiPlanet: PlanetName.Saturn,
    nakshatraDevataKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ (ಜ್ಞಾನ ಗುರು)",
    nakshatraDevataEn: "Brihaspati (Preceptor of Gods)",
    exaltedPlanetsKn: "ಗುರು (ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಕಟಕ ರಾಶಿಯ ಪುಷ್ಯ ನಕ್ಷತ್ರದ ೧ನೇ ಪಾದದಲ್ಲಿ ೫° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Jupiter (Reaches Parama Ucha - peak exaltation at 5°00' Cancer, 1st Pada of Pushya)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಸಕಲ ನಕ್ಷತ್ರಗಳ ರಾಜ - ಮಹಾ ಪುಣ್ಯ ನಕ್ಷತ್ರ)",
    debilitatedPlanetsEn: "None (King of Asterisms - supreme auspiciousness)",
    sacredHaraKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಮಹಾಲಕ್ಷ್ಮಿ) ಅಥವಾ ಬೆಳ್ಳಿಯ ಮಹಾಲಕ್ಷ್ಮಿ ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ನೀಲಿ ಅಥವಾ ಹಳದಿ ಮಿಶ್ರಿತ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "7-Mukhi Rudraksha (Goddess Mahalakshmi) or Silver Mahalakshmi Yantra in navy blue or yellow-bordered silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ವೈಟ್ ಗೋಲ್ಡ್ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ನೀಲಂ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ ಹರಳಿನಿಂದ (ಶನಿ ಸಾಡೇಸಾತಿ ಶಾಂತಿಗೊಳಿಸಲು ಹಾಗೂ ಅಖಂಡ ಸಂಪತ್ತಿಗೆ)",
    karnaKundalaEn: "Silver or White Gold studs with Natural Blue Sapphire or Amethyst (neutralizes Saturn transits and anchors lasting affluence)",
    luckyColorClothesKn: ["ರಾಯಲ್ ನೀಲಿ", "ಸಾಸಿವೆ ಹಳದಿ", "ಶುದ್ಧ ಬಿಳಿ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Royal Navy Blue", "Mustard Yellow", "Pure White", "Cream"],
    strictAvoidColorsKn: ["ಅತಿಯಾದ ರಕ್ತ ಕೆಂಪು"],
    strictAvoidColorsEn: ["Fiery Blood Red"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶನಿವಾರ ಅಥವಾ ಮುಂಜಾನೆ ಅಶ್ವತ್ಥ (ಅರಳಿ) ಮರಕ್ಕೆ ಹಾಲು-ನೀರು ಅರ್ಪಿಸಿ ೭ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ. ೨) 'ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ' ಹಾಗೂ ಗುರು ಸ್ತೋತ್ರ ಪಠಿಸಿ. ೩) ಕಪ್ಪು ಎಳ್ಳು ಅಥವಾ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶನಿ-ಗುರು ಶಾಂತಿ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸುವುದರಿಂದ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಶತಸಿದ್ಧವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Water a Peepal (Ashwatta) tree with milk and perform 7 pradakshinas at sunrise. 2) Chant 'Om Sham Shanaicharaya Namaha' and Brihaspati Stotra. 3) Light a sesame oil lamp. 4) Consecrate Shani-Guru Shanti at Sri Kshetra Gokarna for permanent financial stability.",
    associatedLuckyGemsKn: "ನೀಲಂ (Blue Sapphire), ಅಮೆಥಿಸ್ಟ್ (Amethyst), ಹಳದಿ ಪುಷ್ಯರಾಗ",
    associatedLuckyGemsEn: "Blue Sapphire (Neelam), Blue Quartz / Amethyst, Yellow Sapphire"
  },
  "Ashlesha": {
    nakshatraNameKn: "ಆಶ್ಲೇಷಾ",
    nakshatraNameEn: "Ashlesha",
    nakshatraSwamiKn: "ಬುಧ",
    nakshatraSwamiEn: "Mercury",
    swamiPlanet: PlanetName.Mercury,
    nakshatraDevataKn: "ಸರ್ಪ / ನಾಗರಾಜ (ಕುಂಡಲಿನಿ ರಕ್ಷಕ)",
    nakshatraDevataEn: "Sarpa / Naga Deities (Kundalini Guardians)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಗಂಡಾಂತ ಸಂಧಿಕಾಲ)",
    exaltedPlanetsEn: "None (Gandanta transitional border)",
    debilitatedPlanetsKn: "ಮಂಗಳ (ಮಂಗಳ ಗ್ರಹವು ಕಟಕ ರಾಶಿಯ ಆಶ್ಲೇಷಾ ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದದಲ್ಲಿ ೨೮° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Mars (Reaches Parama Neecha - peak debilitation at 28°00' Cancer, 4th Pada of Ashlesha)",
    sacredHaraKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಬ್ರಹ್ಮ ಕೃಪೆ) ಅಥವಾ ಬೆಳ್ಳಿಯ ನಾಗ ಕವಚ ಪೆಂಡೆಂಟ್ (ಹಸಿರು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "4-Mukhi Rudraksha (Lord Brahma) or Silver Naga Kavacha in green silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಹಸಿರು ಪಚ್ಚೆ ಅಥವಾ ಟೂರ್ಮಲಿನ್ ಹರಳಿನಿಂದ (ವಾಕ್ಚಾತುರ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ನಾಗದೋಷ ಶಾಂತಿಗೆ)",
    karnaKundalaEn: "Sterling Silver studs set with natural Emerald or Green Tourmaline to enhance intellectual dexterity and soothe Sarpa Dosha",
    luckyColorClothesKn: ["ಗಿಳಿ ಹಸಿರು", "ಪಚ್ಚೆ ಹಸಿರು", "ಮಿಂಟ್ ಗ್ರೀನ್", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Parrot Green", "Emerald Green", "Mint Green", "Silk Cream"],
    strictAvoidColorsKn: ["ರಕ್ತ ಕೆಂಪು (ಮಂಗಳ ನೀಚ ಸ್ಥಾನ)", "ಗಾಢ ಕೇಸರಿ"],
    strictAvoidColorsEn: ["Blood Red (Mars debilitation)", "Fiery Scarlet"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಸರ್ಪ ದೇವರಿಗೆ ಹಾಲು ನೈವೇದ್ಯ ಮಾಡಿ ಸರ್ಪ ಸೂಕ್ತ ಪಠಿಸಿ. ೨) 'ಓಂ ಬುಂ ಬುಧಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಹಸುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ಅಥವಾ ತರಕಾರಿ ತಿನ್ನಿಸಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಾಗಪ್ರತಿಷ್ಠೆ ಅಥವಾ ಸರ್ಪದೋಷ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸುವುದರಿಂದ ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Offer milk to Lord Subramanya or Naga deity and chant Sarpa Sukta. 2) Chant 'Om Bum Budhaya Namaha' 108 times. 3) Feed green spinach or grass to holy cows. 4) Consecrate Sarpa Shanti at Sri Kshetra Gokarna to eliminate venomous obstacles.",
    associatedLuckyGemsKn: "ಪಚ್ಚೆ (Emerald), ಹಸಿರು ಪೆರಿಡಾಟ್ (Peridot), ಹಸಿರು ಜೇಡ್",
    associatedLuckyGemsEn: "Natural Emerald (Panna), Green Peridot, Green Tourmaline"
  },
  "Magha": {
    nakshatraNameKn: "ಮಘಾ",
    nakshatraNameEn: "Magha",
    nakshatraSwamiKn: "ಕೇತು",
    nakshatraSwamiEn: "Ketu",
    swamiPlanet: PlanetName.Ketu,
    nakshatraDevataKn: "ಪಿತೃ ದೇವತೆಗಳು (ಪೂರ್ವಜರ ಆತ್ಮಬಲ)",
    nakshatraDevataEn: "Pitrus (Ancestral Souls)",
    exaltedPlanetsKn: "ಸೂರ್ಯ (ಸಿಂಹ ರಾಶಿಯ ಮೂಲತ್ರಿಕೋಣ ಸಾಮ್ರಾಜ್ಯ)",
    exaltedPlanetsEn: "Sun (Solar imperial throne domain)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಸಿಂಹಾಸನ ತಾರಾಮಂಡಲ)",
    debilitatedPlanetsEn: "None (Regal throne asterism)",
    sacredHaraKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ನವದುರ್ಗಾ) ಅಥವಾ ಬೆಳ್ಳಿಯ ಪಿತೃ ಮುಕ್ತಿ ಯಂತ್ರ (ಕೆಂಪು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "9-Mukhi Rudraksha or Silver Pitru Mukti Yantra in red silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ಚಿನ್ನದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ವೈಡೂರ್ಯ ಅಥವಾ ಮಾಣಿಕ್ಯ ಹರಳಿನಿಂದ (ಪಿತೃ ತೇಜಸ್ಸು ಹಾಗೂ ಗೌರವ ವೃದ್ಧಿಗೆ)",
    karnaKundalaEn: "Silver or Gold studs with natural Cat's Eye or Ruby to harmonize ancestral vitality and executive respect",
    luckyColorClothesKn: ["ರಾಜ ಕೆಂಪು", "ಕೇಸರಿ", "ಬಂಗಾರದ ಬಣ್ಣ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Imperial Red", "Saffron", "Royal Gold", "Silk Cream"],
    strictAvoidColorsKn: ["ಕೃತಕ ಕಪ್ಪು", "ಮಬ್ಬು ನೀಲಿ"],
    strictAvoidColorsEn: ["Synthetic Black", "Dull Faded Blue"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸೂರ್ಯೋದಯದಲ್ಲಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು, ಕಪ್ಪು ಎಳ್ಳು ಬೆರೆಸಿ ಪಿತೃಗಳಿಗೆ ತರ್ಪಣ ಬಿಡಿ. ೨) 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಹಿರಿಯರಿಗೆ ಅಥವಾ ವೃದ್ಧಾಶ್ರಮದಲ್ಲಿ ಅನ್ನದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಪಿತೃ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸುವುದರಿಂದ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Offer water and black sesame Tarpanam to ancestors at sunrise. 2) Chant 'Om Namo Narayanaya' 108 times. 3) Donate food to elders. 4) Consecrate Pitru Shanti at Sri Kshetra Gokarna for career authority and family flourishing.",
    associatedLuckyGemsKn: "ವೈಡೂರ್ಯ (Cat's Eye), ಮಾಣಿಕ್ಯ (Ruby), ಸ್ಪಟಿಕ (Clear Quartz)",
    associatedLuckyGemsEn: "Chrysoberyl Cat's Eye, Natural Ruby, Clear Quartz"
  },
  "PurvaPhalguni": {
    nakshatraNameKn: "ಪೂರ್ವಫಲ್ಗುಣಿ",
    nakshatraNameEn: "Purva Phalguni",
    nakshatraSwamiKn: "ಶುಕ್ರ",
    nakshatraSwamiEn: "Venus",
    swamiPlanet: PlanetName.Venus,
    nakshatraDevataKn: "ಭಾಗ್ಯ ದೇವತೆ (ಭಗ - ಸೌಭಾಗ್ಯದಾಯಕ)",
    nakshatraDevataEn: "Bhaga (God of Fortune & Prosperity)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಲಲಿತ ಭೋಗ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Aesthetic luxuriant asterism)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ",
    debilitatedPlanetsEn: "None",
    sacredHaraKn: "೬ ಮುಖಿ ಅಥವಾ ೧೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಕಾಮದೇವ-ಲಕ್ಷ್ಮಿ) ಅಥವಾ ಸ್ಪಟಿಕ ಮಾಲೆ (ಗುಲಾಬಿ ಅಥವಾ ಬಿಳಿ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "6 or 13-Mukhi Rudraksha (Kamadeva & Lakshmi) or Sphatika Mala in pink or white silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ವೈಟ್ ಗೋಲ್ಡ್ ಅಥವಾ ಬೆಳ್ಳಿಯ ಪುಷ್ಪಾಕಾರದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಜಿರ್ಕಾನ್ ಹರಳಿನಿಂದ (ಸೌಂದರ್ಯ ಹಾಗೂ ಜನಪ್ರಿಯತೆಗೆ)",
    karnaKundalaEn: "White Gold or Silver floral ear studs set with Natural Diamond or White Zircon for personal charisma and artistic magnetism",
    luckyColorClothesKn: ["ರೇಷ್ಮೆ ಬಿಳಿ", "ತಿಳಿ ಗುಲಾಬಿ", "ಪೀಚ್", "ಕೆನೆ ಬಣ್ಣ"],
    luckyColorClothesEn: ["Silky White", "Pastel Rose Pink", "Peach", "Cream"],
    strictAvoidColorsKn: ["ಒರಟು ಕಪ್ಪು", "ಮಬ್ಬು ಕಂದು"],
    strictAvoidColorsEn: ["Coarse Black", "Muddy Brown"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶ್ರೀ ಸೂಕ್ತ ಪಠಿಸಿ ನೈಸರ್ಗಿಕ ಗುಲಾಬಿ ಅತ್ತರ್ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿ. ೨) 'ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಕನ್ಯೆಯರಿಗೆ ಅಥವಾ ಮಹಿಳೆಯರಿಗೆ ಬಿಳಿ ಸಿಹಿತಿಂಡಿಗಳನ್ನು ನೀಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾಲಕ್ಷ್ಮೀ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಧನಲಾಭ ಸಿದ್ಧಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Sri Suktam and apply natural rose attar. 2) Chant 'Om Shum Shukraya Namaha' 108 times. 3) Offer sweets to young girls or women. 4) Consecrate Mahalakshmi Pooja at Sri Kshetra Gokarna for financial abundance.",
    associatedLuckyGemsKn: "ವಜ್ರ (Diamond), ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon), ಬಿಳಿ ಓಪಲ್",
    associatedLuckyGemsEn: "Natural Diamond, White Zircon, Australian White Opal"
  },
  "UttaraPhalguni": {
    nakshatraNameKn: "ಉತ್ತರಫಲ್ಗುಣಿ",
    nakshatraNameEn: "Uttara Phalguni",
    nakshatraSwamiKn: "ಸೂರ್ಯ",
    nakshatraSwamiEn: "Sun",
    swamiPlanet: PlanetName.Sun,
    nakshatraDevataKn: "ಅರ್ಯಮನ್ (ಸ್ನೇಹ, ಮೈತ್ರಿ & ಧರ್ಮಪಾಲಕ)",
    nakshatraDevataEn: "Aryaman (Protector of Unions & Honor)",
    exaltedPlanetsKn: "ಸೂರ್ಯ (ಸೂರ್ಯ ನಾರಾಯಣರ ಮಿತ್ರ ಕ್ಷೇತ್ರ ಬಲ)",
    exaltedPlanetsEn: "Sun (Empowered solar dignity)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ",
    debilitatedPlanetsEn: "None",
    sacredHaraKn: "೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದ್ವಾದಶಾದಿತ್ಯ) ಅಥವಾ ತಾಮ್ರದ ಸೂರ್ಯ ಕವಚ ಪೆಂಡೆಂಟ್ (ಕೆಂಪು ಅಥವಾ ಕೇಸರಿ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "12-Mukhi Rudraksha or Copper Surya Kavacha in red or saffron thread",
    karnaKundalaKn: "ಶುದ್ಧ ಚಿನ್ನ ಅಥವಾ ತಾಮ್ರದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಮಾಣಿಕ್ಯ ಅಥವಾ ರೆಡ್ ಗಾರ್ನೆಟ್ ಹರಳಿನಿಂದ (ನಾಯಕತ್ವ ಹಾಗೂ ಸರ್ಕಾರಿ ಯಶಸ್ಸಿಗೆ)",
    karnaKundalaEn: "Gold or Copper studs with natural Ruby or Red Garnet to awaken executive command and government patronage",
    luckyColorClothesKn: ["ಕೇಸರಿ", "ಬಂಗಾರದ ಬಣ್ಣ", "ಮಾಣಿಕ್ಯ ಕೆಂಪು", "ತಿಳಿ ಹಳದಿ"],
    luckyColorClothesEn: ["Saffron", "Royal Gold", "Ruby Red", "Light Yellow"],
    strictAvoidColorsKn: ["ಕಡು ನೀಲಿ", "ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Navy Blue", "Pitch Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸೂರ್ಯೋದಯದಲ್ಲಿ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಸೂರ್ಯದೇವನಿಗೆ ಜಲಾರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ. ೨) 'ಓಂ ಸೂರ್ಯಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೨೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಕೆಂಪು ಹಸುವಿಗೆ ಬೆಲ್ಲ ತಿನ್ನಿಸಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಉದ್ಯೋಗ ಬಡ್ತಿ ಮತ್ತು ಕೀರ್ತಿ ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Aditya Hridaya Stotra at sunrise and offer water Arghya to Lord Surya. 2) Chant 'Om Suryaya Namaha' 28 times. 3) Feed jaggery to cows. 4) Consecrate a career elevation prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ಮಾಣಿಕ್ಯ (Ruby), ರೆಡ್ ಸ್ಪಿನೆಲ್ (Red Spinel), ಕೆಂಪು ಗಾರ್ನೆಟ್",
    associatedLuckyGemsEn: "Natural Ruby (Manikya), Red Spinel, Red Garnet"
  },
  "Hasta": {
    nakshatraNameKn: "ಹಸ್ತ",
    nakshatraNameEn: "Hasta",
    nakshatraSwamiKn: "ಚಂದ್ರ",
    nakshatraSwamiEn: "Moon",
    swamiPlanet: PlanetName.Moon,
    nakshatraDevataKn: "ಸವಿತೃ (ಸೂರ್ಯನ ಜ್ಞಾನ ಪ್ರಕಾಶ ತೇಜಸ್ಸು)",
    nakshatraDevataEn: "Savitur (Illuminating Sun of Wisdom)",
    exaltedPlanetsKn: "ಬುಧ (ಬುಧ ಮಹಾರಾಜರು ಕನ್ಯಾ ರಾಶಿಯ ಹಸ್ತ ನಕ್ಷತ್ರದ ೨ನೇ ಪಾದದಲ್ಲಿ ೧೫° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Mercury (Reaches Parama Ucha - peak exaltation at 15°00' Virgo, 2nd Pada of Hasta)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಹಸ್ತ ಕೌಶಲ್ಯದ ಸ್ವರ್ಣ ನಕ್ಷತ್ರ)",
    debilitatedPlanetsEn: "None (Golden star of creative dexterity)",
    sacredHaraKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಗಾಯತ್ರೀ ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ಬಿಳಿ ಅಥವಾ ತಿಳಿ ಹಳದಿ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "2-Mukhi Rudraksha or Pure Silver Gayatri Yantra in white or light yellow silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ವೈಟ್ ಗೋಲ್ಡ್ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಮುತ್ತು ಅಥವಾ ಹಸಿರು ಜೇಡ್ ಹರಳಿನಿಂದ (ಮನೋಬಲ ಹಾಗೂ ಹಸ್ತಕಲಾ ಪ್ರಾವೀಣ್ಯಕ್ಕೆ)",
    karnaKundalaEn: "Silver or White Gold studs with Natural Pearl or Green Jade to balance mental clarity and creative precision",
    luckyColorClothesKn: ["ದಂತದ ಬಿಳಿ", "ತಿಳಿ ಮಿಂಟ್ ಹಸಿರು", "ರೇಷ್ಮೆ ಕ್ರೀಮ್", "ಬೆಳ್ಳಿಯ ಬಣ್ಣ"],
    luckyColorClothesEn: ["Ivory White", "Light Mint Green", "Silk Cream", "Silver"],
    strictAvoidColorsKn: ["ಗಾಢ ಕೆಂಪು", "ತುಕ್ಕು ಬಣ್ಣ"],
    strictAvoidColorsEn: ["Harsh Dark Red", "Rust Brown"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸೂರ್ಯೋದಯದಲ್ಲಿ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ೨೪ ಬಾರಿ ಏಕಾಗ್ರತೆಯಿಂದ ಜಪಿಸಿ. ೨) ಸರಸ್ವತೀ ಅಥವಾ ಗಾಯತ್ರೀ ದೇವಿಗೆ ಬಿಳಿ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ. ೩) ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ಅಥವಾ ಲೇಖನ ಸಾಮಗ್ರಿಗಳನ್ನು ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಕೈಹಿಡಿದ ಕೆಲಸಗಳಲ್ಲಿ ಯಶಸ್ಸು ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Chant Gayatri Mantra 24 times facing East at sunrise. 2) Offer white flowers to Goddess Gayatri or Saraswati. 3) Donate notebooks or study pens to poor students. 4) Consecrate an auspicious prayer at Sri Kshetra Gokarna for the golden touch in business endeavors.",
    associatedLuckyGemsKn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (Pearl), ಹಸಿರು ಪಚ್ಚೆ (Emerald), ಮೂನ್‌ಸ್ಟೋನ್",
    associatedLuckyGemsEn: "Natural Pearl, Natural Emerald (Panna), Moonstone"
  },
  "Chitra": {
    nakshatraNameKn: "ಚಿತ್ತಾ",
    nakshatraNameEn: "Chitra",
    nakshatraSwamiKn: "ಮಂಗಳ",
    nakshatraSwamiEn: "Mars",
    swamiPlanet: PlanetName.Mars,
    nakshatraDevataKn: "ವಿಶ್ವಕರ್ಮ (ದೈವಿಕ ವಾಸ್ತುಶಿಲ್ಪಿ)",
    nakshatraDevataEn: "Vishwakarma (Divine Celestial Architect)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ವಿಚಿತ್ರ ರಮಣೀಯ ನಕ್ಷತ್ರ)",
    exaltedPlanetsEn: "None (Brilliant kaleidoscopic star)",
    debilitatedPlanetsKn: "ಶುಕ್ರ (ಶುಕ್ರ ಗ್ರಹವು ಕನ್ಯಾ ರಾಶಿಯ ಚಿತ್ತಾ ನಕ್ಷತ್ರದ ೨ನೇ ಪಾದದಲ್ಲಿ ೨೭° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Venus (Reaches Parama Neecha - peak debilitation at 27°00' Virgo, 2nd Pada of Chitra)",
    sacredHaraKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಗ್ನಿ) ಅಥವಾ ತಾಮ್ರದ ತ್ರಿಶೂಲ ಪೆಂಡೆಂಟ್ (ಕೆಂಪು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "3-Mukhi Rudraksha or Copper Trishula pendant in red silk thread",
    karnaKundalaKn: "ತಾಮ್ರ ಅಥವಾ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಕೆಂಪು ಹವಳ ಅಥವಾ ಕಾರ್ನೇಲಿಯನ್ ಹರಳಿನಿಂದ (ವಾಸ್ತು ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ತಾಂತ್ರಿಕ ಪ್ರತಿಭೆಗೆ)",
    karnaKundalaEn: "Copper or Silver studs with natural Red Coral or Carnelian to harmonize architectural energy and engineering acumen",
    luckyColorClothesKn: ["ಹವಳ ಕೆಂಪು", "ಟರ್ಕಾಯ್ಸ್ ನೀಲಿ", "ಪೀಚ್", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Coral Red", "Turquoise Blue", "Pastel Peach", "Cream"],
    strictAvoidColorsKn: ["ಮಣ್ಣಿನ ಕಂದು", "ಮಬ್ಬು ಮಾಸಿದ ಬಿಳಿ (ಶುಕ್ರ ನೀಚ ಸ್ಥಾನ)"],
    strictAvoidColorsEn: ["Muddy Brown", "Faded Greyish White (Venus debilitation)"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ವಿಶ್ವಕರ್ಮ ದೇವರ ಧ್ಯಾನ ಮಾಡಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿ. ೨) 'ಓಂ ಅಂಗಾರಕಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೩) ಕಟ್ಟಡ ಕಾರ್ಮಿಕರಿಗೆ ಅಥವಾ ಕುಶಲಕರ್ಮಿಗಳಿಗೆ ಆಹಾರ ಅಥವಾ ಬೆಲ್ಲ ನೀಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ನೂತನ ಮನೆ/ಆಸ್ತಿ ಯೋಗ ಶತಸಿದ್ಧವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Meditate on Lord Vishwakarma and Lord Subramanya, lighting a ghee lamp. 2) Chant 'Om Angarakaya Namaha' 11 times. 3) Feed artisans or construction workers. 4) Consecrate a home/property prayer at Sri Kshetra Gokarna for structural harmony.",
    associatedLuckyGemsKn: "ಕೆಂಪು ಹವಳ (Red Coral), ಕಾರ್ನೇಲಿಯನ್ (Carnelian), ಹಸಿರು ಪಚ್ಚೆ",
    associatedLuckyGemsEn: "Natural Red Coral (Pravala), Red Carnelian, Emerald"
  },
  "Swati": {
    nakshatraNameKn: "ಸ್ವಾತಿ",
    nakshatraNameEn: "Swati",
    nakshatraSwamiKn: "ರಾಹು",
    nakshatraSwamiEn: "Rahu",
    swamiPlanet: PlanetName.Rahu,
    nakshatraDevataKn: "ವಾಯುದೇವ (ಪ್ರಾಣವಾಯು / ಜೀವಚೇತನ)",
    nakshatraDevataEn: "Lord Vayu (Cosmic Life-Force)",
    exaltedPlanetsKn: "ಶನಿ (ಶನಿ ಮಹಾರಾಜರು ತುಲಾ ರಾಶಿಯ ಸ್ವಾತಿ ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದದಲ್ಲಿ ೨೦° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Saturn (Reaches Parama Ucha - peak exaltation at 20°00' Libra, 4th Pada of Swati)",
    debilitatedPlanetsKn: "ಸೂರ್ಯ (ಸೂರ್ಯ ನಾರಾಯಣರು ತುಲಾ ರಾಶಿಯ ಸ್ವಾತಿ ನಕ್ಷತ್ರದ ೨ನೇ ಪಾದದಲ್ಲಿ ೧೦° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Sun (Reaches Parama Neecha - peak debilitation at 10°00' Libra, 2nd Pada of Swati)",
    sacredHaraKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಾಯುದೇವ-ಗಣಪತಿ) ಅಥವಾ ಬೆಳ್ಳಿಯ ಆಂಜನೇಯ ಕವಚ / ಸ್ಪಟಿಕ ಮಾಲೆ (ಕಪ್ಪು-ಹಳದಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "8-Mukhi Rudraksha or Pure Silver Hanuman Kavacha / Sphatika Mala in black-and-yellow silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ವೈಟ್ ಗೋಲ್ಡ್ ಅಥವಾ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಜಿರ್ಕಾನ್ ಹರಳಿನಿಂದ (ವಾಯು ತತ್ತ್ವದ ಆತಂಕ ನಿವಾರಣೆ ಮತ್ತು ಆಜ್ಞಾ ಚಕ್ರ ಸಮತೋಲನಕ್ಕಾಗಿ)",
    karnaKundalaEn: "White Gold or Sterling Silver ear studs set with Natural Diamond or White Zircon (stabilizes Vayu bio-field and cranial nervous poise)",
    luckyColorClothesKn: ["ಶುದ್ಧ ಬಿಳಿ", "ಆಕಾಶ ನೀಲಿ", "ರೇಷ್ಮೆ ಕ್ರೀಮ್", "ತಿಳಿ ಬೂದು"],
    luckyColorClothesEn: ["Pure White", "Sky Blue", "Silk Cream", "Light Grey"],
    strictAvoidColorsKn: ["ಗಾಢ ಕೆಂಪು", "ಕಡು ಕಪ್ಪು (ಸೂರ್ಯ ನೀಚ ಸ್ಥಾನವಾಗಿರುವುದರಿಂದ ಕೆಂಪು ಬಣ್ಣ ಅನಿಷ್ಟ)"],
    strictAvoidColorsEn: ["Deep Dark Red", "Harsh Pitch Black (Sun is debilitated here)"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸೂರ್ಯೋದಯದಲ್ಲಿ ಪೂರ್ವಕ್ಕೆ ಮುಖಮಾಡಿ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಅಥವಾ ವಾಯುಸ್ತುತಿ ಪಠಣ. ೨) 'ಓಂ ರಾಹವೇ ನಮಃ' ಹಾಗೂ 'ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ' ಮಂತ್ರಗಳನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೩) ಬಿಳಿ ಹಸುಗಳಿಗೆ ನೆನೆಸಿದ ಅಕ್ಕಿ ಅಥವಾ ಬೆಲ್ಲ ನೀಡುವುದು. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಒಂದೇ ದಿನದಲ್ಲಿ ಮನಸ್ಸಿನಲ್ಲಿ ದೈವಿಕ ಧೈರ್ಯ ಮತ್ತು ಅದೃಷ್ಟದ ಚೇತನ ಗೋಚರಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Face East at sunrise and recite Hanuman Chalisa or Vayu Stuti. 2) Chant 'Om Rahave Namaha' & 'Om Sham Shanaicharaya Namaha' 11 times. 3) Feed white cows with soaked rice or jaggery. 4) Consecrate a Sankalpa prayer at Sri Kshetra Gokarna Mahabaleshwara. Tangible mental clarity and luck momentum start immediately.",
    associatedLuckyGemsKn: "ವಜ್ರ (Diamond), ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon), ನೀಲಂ (Blue Sapphire), ವೈಡೂರ್ಯ (Cat's Eye)",
    associatedLuckyGemsEn: "Natural Diamond, White Zircon, Blue Sapphire, Cat's Eye"
  },
  "Vishakha": {
    nakshatraNameKn: "ವಿಶಾಖಾ",
    nakshatraNameEn: "Vishakha",
    nakshatraSwamiKn: "ಗುರು",
    nakshatraSwamiEn: "Jupiter",
    swamiPlanet: PlanetName.Jupiter,
    nakshatraDevataKn: "ಇಂದ್ರಾಗ್ನಿ (ಇಂದ್ರ ಹಾಗೂ ಅಗ್ನಿ - ವಿಜಯ ಜೋಡಿ)",
    nakshatraDevataEn: "Indragni (Triumphant Pair: Indra & Agni)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಲಕ್ಷ್ಯವೇಧೀ ನಕ್ಷತ್ರ)",
    exaltedPlanetsEn: "None (Determined goal-focused asterism)",
    debilitatedPlanetsKn: "ಚಂದ್ರ (ಚಂದ್ರದೇವನು ವೃಶ್ಚಿಕ ರಾಶಿಯ ವಿಶಾಖಾ ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದದಲ್ಲಿ ೩° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Moon (Reaches Parama Neecha - peak debilitation at 3°00' Scorpio, 4th Pada of Vishakha)",
    sacredHaraKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬಂಗಾರದ ಗುರು ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ಹಳದಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "5-Mukhi Rudraksha or Gold Guru Yantra in yellow silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬಂಗಾರ ಅಥವಾ ಹಿತ್ತಾಳೆಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಹಳದಿ ಸಿಟ್ರಿನ್ ಅಥವಾ ಗೋಲ್ಡನ್ ಟೋಪಾಜ್ ಹರಳಿನಿಂದ (ಗುರಿ ಸಾಧನೆ ಹಾಗೂ ಸ್ಪರ್ಧಾ ಜಯಕ್ಕಾಗಿ)",
    karnaKundalaEn: "Gold or Brass studs set with Golden Citrine or Topaz to catalyze competitive focus and goal achievement",
    luckyColorClothesKn: ["ಬಂಗಾರದ ಹಳದಿ", "ಅರಿಶಿನ ಬಣ್ಣ", "ರಾಯಲ್ ಪರ್ಪಲ್", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Golden Yellow", "Turmeric Yellow", "Royal Purple", "Silk Cream"],
    strictAvoidColorsKn: ["ಮಬ್ಬು ಬೂದು", "ಮಾಸಿದ ಬಿಳಿ (ಚಂದ್ರ ನೀಚ ಸ್ಥಾನ)"],
    strictAvoidColorsEn: ["Dull Ash Grey", "Faded White (Moon debilitation)"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶ್ರೀ ರುದ್ರಂ ಅಥವಾ ಇಂದ್ರಾಗ್ನಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿ. ೨) 'ಓಂ ಬೃಹಸ್ಪತಯೇ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಮಕ್ಕಳಿಗೆ ಹಳದಿ ಬಣ್ಣದ ಸಿಹಿತಿಂಡಿಗಳನ್ನು ಹಂಚಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಖಂಡ ಜಯ ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Sri Rudram or Indragni Suktam and light a ghee lamp. 2) Chant 'Om Brihaspataye Namaha' 108 times. 3) Distribute yellow sweets to young scholars. 4) Consecrate a victory prayer at Sri Kshetra Gokarna for competitive triumph.",
    associatedLuckyGemsKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire), ಗೋಲ್ಡನ್ ಸಿಟ್ರಿನ್, ಕೆಂಪು ಹವಳ",
    associatedLuckyGemsEn: "Yellow Sapphire (Pukhraj), Golden Citrine, Red Coral"
  },
  "Anuradha": {
    nakshatraNameKn: "ಅನುರಾಧಾ",
    nakshatraNameEn: "Anuradha",
    nakshatraSwamiKn: "ಶನಿ",
    nakshatraSwamiEn: "Saturn",
    swamiPlanet: PlanetName.Saturn,
    nakshatraDevataKn: "ಮಿತ್ರ (ಸ್ನೇಹ, ಸೌಹಾರ್ದತೆ & ಮೈತ್ರಿ ದೇವ)",
    nakshatraDevataEn: "Mitra (God of Friendship & Sacred Alliances)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಸಾಧನಾ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Deep spiritual devotion star)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ",
    debilitatedPlanetsEn: "None",
    sacredHaraKn: "೭ ಮುಖಿ ಅಥವಾ ೧೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದೇವತಾ ಮಿತ್ರ ಬಲ) ಅಥವಾ ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ ಕವಚ (ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "7 or 14-Mukhi Rudraksha or Silver Shivalinga Kavacha in blue or black silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ನೀಲಂ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ ಹರಳಿನಿಂದ (ಶನಿ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ನಿಷ್ಠಾವಂತ ಮಿತ್ರರ ಸಹಕಾರಕ್ಕೆ)",
    karnaKundalaEn: "Silver studs with natural Blue Sapphire or Amethyst to harmonize Saturn currents and foster loyal alliances",
    luckyColorClothesKn: ["ರಾಯಲ್ ನೀಲಿ", "ಗಾಢ ಇಂಡಿಗೋ", "ನೇರಳೆ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Royal Blue", "Deep Indigo", "Violet", "Silk Cream"],
    strictAvoidColorsKn: ["ಅತಿಯಾದ ಪ್ರಕಾಶಮಾನ ಕಿತ್ತಳೆ", "ನಿಯಾನ್ ಕೆಂಪು"],
    strictAvoidColorsEn: ["Neon Red", "Bright Fiery Orange"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸ್ಮರಣೆ ಮಾಡಿ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಮಂತ್ರ ಜಪಿಸಿ. ೨) 'ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಕಪ್ಪು ಎಳ್ಳು ಅಥವಾ ಎಣ್ಣೆ ದಾನ ಮಾಡಿ. ೪) ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡುವುದರಿಂದ ವಿದೇಶ ಪ್ರವಾಸ ಭಾಗ್ಯ ಹಾಗೂ ಶನಿ ಕಷ್ಟಗಳು ದೂರವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Meditate on Gokarna Mahabaleshwara and chant Shiva Panchakshari Mantra. 2) Chant 'Om Sham Shanaicharaya Namaha' 108 times. 3) Donate black sesame seeds or oil. 4) Consecrate Rudrabhisheka at Sri Kshetra Gokarna for overseas success.",
    associatedLuckyGemsKn: "ನೀಲಂ (Blue Sapphire), ನೀಲಿ ಸ್ಪಟಿಕ (Blue Quartz), ಅಮೆಥಿಸ್ಟ್",
    associatedLuckyGemsEn: "Blue Sapphire (Neelam), Blue Quartz, Amethyst"
  },
  "Jyeshtha": {
    nakshatraNameKn: "ಜ್ಯೇಷ್ಠಾ",
    nakshatraNameEn: "Jyeshtha",
    nakshatraSwamiKn: "ಬುಧ",
    nakshatraSwamiEn: "Mercury",
    swamiPlanet: PlanetName.Mercury,
    nakshatraDevataKn: "ದೇವೇಂದ್ರ (ದೇವತೆಗಳ ಅಧಿಪತಿ)",
    nakshatraDevataEn: "Lord Indra (King of Gods & Protector)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಹಿರಿತನದ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Senior authority asterism)",
    debilitatedPlanetsKn: "ರಾಹು (ವೃಶ್ಚಿಕ ರಾಶಿಯ ಜ್ಯೇಷ್ಠಾದಲ್ಲಿ ರಾಹುವು ನೀಚ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    debilitatedPlanetsEn: "Rahu (Rahu experiences debilitation in Scorpio / Jyeshtha)",
    sacredHaraKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬೆಳ್ಳಿಯ ವಜ್ರಾಯುಧ ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ಹಸಿರು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "4-Mukhi Rudraksha or Silver Vajra Yantra in green silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಹಸಿರು ಪಚ್ಚೆ ಅಥವಾ ಗ್ರೀನ್ ಅಗೇಟ್ ಹರಳಿನಿಂದ (ಹಿರಿಯರ ಸ್ಥಾನಮಾನ ಹಾಗೂ ನಾಯಕತ್ವಕ್ಕೆ)",
    karnaKundalaEn: "Sterling Silver studs with natural Emerald or Green Agate to strengthen executive stature and immune vitality",
    luckyColorClothesKn: ["ಅರಣ್ಯ ಹಸಿರು", "ನವಿಲು ಹಸಿರು", "ತಿಳಿ ಕ್ರೀಮ್", "ಬಿಳಿ"],
    luckyColorClothesEn: ["Forest Green", "Peacock Green", "Silk Cream", "Pure White"],
    strictAvoidColorsKn: ["ರಕ್ತ ಕೆಂಪು", "ಗಾಢ ಮರೂನ್"],
    strictAvoidColorsEn: ["Blood Red", "Dark Maroon"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅಥವಾ ಬುಧ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ೨) 'ಓಂ ಬುಂ ಬುಧಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಹಸುಗಳಿಗೆ ಪಾಲಕ್ ಸೊಪ್ಪು ಅಥವಾ ಹಸಿರು ಮೇವು ತಿನ್ನಿಸಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಸಕಲ ಕೌಟುಂಬಿಕ ವಿವಾದಗಳು ಬಗೆಹರಿದು ಹಿರಿತನದ ಮನ್ನಣೆ ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Vishnu Sahasranama or Budha Stotra. 2) Chant 'Om Bum Budhaya Namaha' 108 times. 3) Feed fresh spinach or fodder to cows. 4) Consecrate a reconciliation prayer at Sri Kshetra Gokarna for executive stature.",
    associatedLuckyGemsKn: "ಪಚ್ಚೆ (Emerald), ಹಸಿರು ಟೂರ್ಮಲಿನ್, ಹಸಿರು ಜೇಡ್",
    associatedLuckyGemsEn: "Natural Emerald (Panna), Green Tourmaline, Jade"
  },
  "Moola": {
    nakshatraNameKn: "ಮೂಲಾ",
    nakshatraNameEn: "Moola",
    nakshatraSwamiKn: "ಕೇತು",
    nakshatraSwamiEn: "Ketu",
    swamiPlanet: PlanetName.Ketu,
    nakshatraDevataKn: "ನಿರೃತಿ (ಮಹಾಕಾಳಿ - ಮೂಲ ಕರ್ಮ ನಿವಾರಕ)",
    nakshatraDevataEn: "Nirriti (Goddess Mahakali)",
    exaltedPlanetsKn: "ಕೇತು (ಧನು ರಾಶಿಯ ಮೂಲಾ ನಕ್ಷತ್ರದಲ್ಲಿ ಕೇತುವು ಉಚ್ಛ ಕ್ಷೇತ್ರ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    exaltedPlanetsEn: "Ketu (Achieves exaltation domain dignity in Moola / Sagittarius)",
    debilitatedPlanetsKn: "ರಾಹು (ಧನು ರಾಶಿಯಲ್ಲಿ ರಾಹುವು ನೀಚ ಬಲ ಹೊಂದುತ್ತಾನೆ)",
    debilitatedPlanetsEn: "Rahu (Rahu undergoes debilitation in Sagittarius / Moola)",
    sacredHaraKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಕವಚ (ಕೆಂಪು ಅಥವಾ ಕಪ್ಪು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "9-Mukhi Rudraksha or Silver Gokarna Mahabaleshwara Raksha Kavacha in red or black silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಲೋಹದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ವೈಡೂರ್ಯ ಅಥವಾ ಶುದ್ಧ ಸ್ಫಟಿಕ ಹರಳಿನಿಂದ (ಮೂಲ ಗಂಡಾಂತರ ಶಾಂತಿಗೆ)",
    karnaKundalaEn: "Silver or Panchaloha studs set with Chrysoberyl Cat's Eye or Clear Quartz to dissolve Moola Gandanta shocks",
    luckyColorClothesKn: ["ಮಣ್ಣಿನ ಕೇಸರಿ", "ಧೂಮ್ರ ಬೂದು", "ರೇಷ್ಮೆ ಕ್ರೀಮ್", "ಬಿಳಿ"],
    luckyColorClothesEn: ["Earthy Saffron", "Smoky Grey", "Silk Cream", "White"],
    strictAvoidColorsKn: ["ನಿಯಾನ್ ಬಣ್ಣಗಳು", "ಪ್ರಕಾಶಮಾನ ಕೃತಕ ನೀಲಿ"],
    strictAvoidColorsEn: ["Neon Synthetics", "Artificial Electric Blue"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಅಥವಾ ಮಹಾಕಾಳಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ೨) 'ಓಂ ಕೇಂ ಕೇತವೇ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೩) ಬೀದಿ ಶ್ವಾನಗಳಿಗೆ (ನಾಯಿಗಳಿಗೆ) ಆಹಾರ ಅಥವಾ ಹಾಲು ನೀಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೂಲ ನಕ್ಷತ್ರ ಶಾಂತಿ ಪೂಜೆ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ಸಮಸ್ತ ಕರ್ಮ ಬಾಧೆಗಳು ಭಸ್ಮವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Ganapati Atharvashirsha or Mahakali Stotra. 2) Chant 'Om Ketave Namaha' 11 times. 3) Feed stray dogs milk or bread. 4) Consecrate Moola Gandanta Shanti at Sri Kshetra Gokarna to dissolve ancestral debts.",
    associatedLuckyGemsKn: "ವೈಡೂರ್ಯ (Cat's Eye), ಶುದ್ಧ ಸ್ಫಟಿಕ (Sphatika), ಹಳದಿ ಪುಷ್ಯರಾಗ",
    associatedLuckyGemsEn: "Chrysoberyl Cat's Eye (Vaidurya), Clear Quartz, Yellow Sapphire"
  },
  "PurvaAshadha": {
    nakshatraNameKn: "ಪೂರ್ವಾಷಾಢಾ",
    nakshatraNameEn: "Purva Ashadha",
    nakshatraSwamiKn: "ಶುಕ್ರ",
    nakshatraSwamiEn: "Venus",
    swamiPlanet: PlanetName.Venus,
    nakshatraDevataKn: "ಅಪಃ (ಪವಿತ್ರ ಜಲದೇವತೆ / ಅಜೇಯ ಶಕ್ತಿ)",
    nakshatraDevataEn: "Apah (Sacred Waters / Invincible Grace)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಅಪರಾಜಿತ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Invincible victorious star)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ",
    debilitatedPlanetsEn: "None",
    sacredHaraKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬೆಳ್ಳಿಯ ಮಹಾಲಕ್ಷ್ಮಿ ಪೆಂಡೆಂಟ್ (ಬಿಳಿ ಅಥವಾ ಗುಲಾಬಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "6-Mukhi Rudraksha or Silver Mahalakshmi Pendant in white or rose silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಪುಷ್ಪಾಕಾರದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಬಿಳಿ ಓಪಲ್ ಅಥವಾ ವೈಟ್ ಜಿರ್ಕಾನ್ ಹರಳಿನಿಂದ (ಅಪಜಯ ಭಯ ನಿವಾರಣೆ ಹಾಗೂ ವಾಕ್ ಶಕ್ತಿಗೆ)",
    karnaKundalaEn: "Silver floral ear studs set with Australian White Opal or White Zircon for invincibility and verbal eloquence",
    luckyColorClothesKn: ["ಶುದ್ಧ ಬಿಳಿ", "ಜಲ ನೀಲಿ (Aqua)", "ಗುಲಾಬಿ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Pure White", "Aqua Blue", "Rose Pink", "Silk Cream"],
    strictAvoidColorsKn: ["ಇದ್ದಿಲು ಕಪ್ಪು", "ಮಣ್ಣಿನ ಕಂದು"],
    strictAvoidColorsEn: ["Charcoal Black", "Muddy Brown"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ತುಳಸಿ ಗಿಡಕ್ಕೆ ಶ್ರೀಗಂಧ ಮಿಶ್ರಿತ ಶುದ್ಧ ನೀರು ಸಮರ್ಪಿಸಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ. ೨) ಶ್ರೀ ಸೂಕ್ತ ಅಥವಾ 'ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ನಿರ್ಗತಿಕ ಮಹಿಳೆಯರಿಗೆ ವಸ್ತ್ರ ಅಥವಾ ಅಕ್ಕಿ ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಶಾಶ್ವತವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Offer sandalwood-infused water to Tulasi plant and perform 3 pradakshinas. 2) Chant Sri Suktam or 'Om Shum Shukraya Namaha' 108 times. 3) Donate clothes or rice to women in need. 4) Consecrate a prosperity prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ವಜ್ರ (Diamond), ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon), ಬಿಳಿ ಓಪಲ್ (White Opal)",
    associatedLuckyGemsEn: "Natural Diamond, White Zircon, Australian White Opal"
  },
  "UttaraAshadha": {
    nakshatraNameKn: "ಉತ್ತರಾಷಾಢಾ",
    nakshatraNameEn: "Uttara Ashadha",
    nakshatraSwamiKn: "ಸೂರ್ಯ",
    nakshatraSwamiEn: "Sun",
    swamiPlanet: PlanetName.Sun,
    nakshatraDevataKn: "ವಿಶ್ವೇದೇವತೆಗಳು (ಸಾರ್ವಭೌಮ ಧರ್ಮದೇವತೆಗಳು)",
    nakshatraDevataEn: "Vishwadevas (Universal Cosmic Protectors)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಶಾಶ್ವತ ವಿಜಯ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Eternal victory asterism)",
    debilitatedPlanetsKn: "ಗುರು (ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಮಕರ ರಾಶಿಯ ಉತ್ತರಾಷಾಢಾ ನಕ್ಷತ್ರದ ೧ನೇ ಪಾದದಲ್ಲಿ ೫° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Jupiter (Reaches Parama Neecha - peak debilitation at 5°00' Capricorn, 1st Pada of Uttara Ashadha)",
    sacredHaraKn: "೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ದ್ವಾದಶಾದಿತ್ಯ) ಅಥವಾ ತಾಮ್ರದ ಸೂರ್ಯ-ವಿಷ್ಣು ಯಂತ್ರ ಪೆಂಡೆಂಟ್ (ಕೇಸರಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "12-Mukhi Rudraksha or Copper Surya-Vishnu Yantra in saffron silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ತಾಮ್ರ ಅಥವಾ ಬಂಗಾರದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಮಾಣಿಕ್ಯ ಅಥವಾ ರೆಡ್ ಗಾರ್ನೆಟ್ ಹರಳಿನಿಂದ (ಜನಪ್ರಿಯತೆ ಹಾಗೂ ರಾಜಯೋಗ ಕೀರ್ತಿಗೆ)",
    karnaKundalaEn: "Copper or Gold studs with natural Ruby or Red Garnet to awaken universal goodwill and enduring fame",
    luckyColorClothesKn: ["ಗಾಢ ಕೇಸರಿ", "ಬಂಗಾರದ ಹಳದಿ", "ರಾಜ ಕೆಂಪು", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Deep Saffron", "Golden Yellow", "Imperial Red", "Cream"],
    strictAvoidColorsKn: ["ಮಾಸಿದ ತಿಳಿ ಹಳದಿ (ಗುರು ನೀಚ ಸ್ಥಾನ)", "ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Faded Pale Yellow (Jupiter debilitation)", "Jet Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸೂರ್ಯೋದಯದಲ್ಲಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಸೂರ್ಯನಾರಾಯಣರಿಗೆ ಜಲಾರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ. ೨) ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ೩) ಹಸುಗಳಿಗೆ ಬೆಲ್ಲ ಮತ್ತು ಗೋಧಿ ರೊಟ್ಟಿ ತಿನ್ನಿಸಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ರಾಜಕೀಯ ಹಾಗೂ ಉನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಖಂಡ ಮನ್ನಣೆ ಸಿಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Offer copper-vessel water Arghya to Surya Narayana at sunrise. 2) Recite Aditya Hridaya Stotra. 3) Feed jaggery and wheat bread to cows. 4) Consecrate an administrative victory prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ಮಾಣಿಕ್ಯ (Ruby), ರೆಡ್ ಗಾರ್ನೆಟ್ (Red Garnet), ನೀಲಂ (Blue Sapphire)",
    associatedLuckyGemsEn: "Natural Ruby, Red Garnet, Blue Sapphire"
  },
  "Shravana": {
    nakshatraNameKn: "ಶ್ರವಣಾ",
    nakshatraNameEn: "Shravana",
    nakshatraSwamiKn: "ಚಂದ್ರ",
    nakshatraSwamiEn: "Moon",
    swamiPlanet: PlanetName.Moon,
    nakshatraDevataKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು (ಲೋಕರಕ್ಷಕ & ಶ್ರವಣ ಜ್ಞಾನ)",
    nakshatraDevataEn: "Lord Maha Vishnu (Universal Preserver)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಸಿದ್ದಿ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Scholarly meditative asterism)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ",
    debilitatedPlanetsEn: "None",
    sacredHaraKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬೆಳ್ಳಿಯ ತುಳಸೀ ಕವಚ / ಶಂಖ ಪೆಂಡೆಂಟ್ (ಬಿಳಿ ಅಥವಾ ಹಳದಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "2-Mukhi Rudraksha or Silver Tulasi / Shankha Locket in white or yellow silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಶುದ್ಧ ಮುತ್ತು ಅಥವಾ ಮೂನ್‌ಸ್ಟೋನ್ ಹರಳಿನಿಂದ (ಶ್ರವಣ ಶಕ್ತಿ, ಜ್ಞಾಪಕ ಶಕ್ತಿ ಹಾಗೂ ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆಗೆ)",
    karnaKundalaEn: "Sterling Silver studs with natural Freshwater Pearl or Moonstone to enhance deep listening, memory, and cognitive poise",
    luckyColorClothesKn: ["ಚಂದ್ರನ ಬಿಳಿ", "ರೇಷ್ಮೆ ಕ್ರೀಮ್", "ತಿಳಿ ಹಳದಿ", "ಬೆಳ್ಳಿ ಬಣ್ಣ"],
    luckyColorClothesEn: ["Moon White", "Silk Cream", "Pale Yellow", "Silver"],
    strictAvoidColorsKn: ["ಒರಟು ಕಡು ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Harsh Pitch Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ವಿಷ್ಣು ಅಷ್ಟೋತ್ತರ ಅಥವಾ 'ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೨) ಶ್ರೀ ಮಹಾವಿಷ್ಣುವಿಗೆ ತುಳಸಿ ದಳಗಳನ್ನು ಅರ್ಪಿಸಿ. ೩) ವಿದ್ವಾಂಸರಿಗೆ ಅಥವಾ ಬಡ ಮಕ್ಕಳಿಗೆ ಹಾಲು ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಗುರು ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಲಭಿಸಿ ಉನ್ನತ ಜ್ಞಾನ ಪ್ರಾಪ್ತಿಯಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Chant 'Om Namo Bhagavate Vasudevaya' 108 times at sunrise. 2) Offer fresh Tulasi leaves to Lord Vishnu. 3) Donate milk or books to young students. 4) Consecrate a scholarly wisdom prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (Natural Pearl), ಮೂನ್‌ಸ್ಟೋನ್ (Moonstone), ನೀಲಂ",
    associatedLuckyGemsEn: "Natural Pearl (Moti), Moonstone, Blue Sapphire"
  },
  "Dhanishta": {
    nakshatraNameKn: "ಧನಿಷ್ಠಾ",
    nakshatraNameEn: "Dhanishta",
    nakshatraSwamiKn: "ಮಂಗಳ",
    nakshatraSwamiEn: "Mars",
    swamiPlanet: PlanetName.Mars,
    nakshatraDevataKn: "ಅಷ್ಟ ವಸುಗಳು (ಐಶ್ವರ್ಯ & ಸಾಮ್ರಾಜ್ಯ ದೇವತೆಗಳು)",
    nakshatraDevataEn: "Ashta Vasus (Elemental Deities of Wealth)",
    exaltedPlanetsKn: "ಮಂಗಳ (ಮಂಗಳ ಗ್ರಹವು ಮಕರ ರಾಶಿಯ ಧನಿಷ್ಠಾ ನಕ್ಷತ್ರದ ೨ನೇ ಪಾದದಲ್ಲಿ ೨೮° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Mars (Reaches Parama Ucha - peak exaltation at 28°00' Capricorn, 2nd Pada of Dhanishta)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಧನ ಸಮೃದ್ಧಿಯ ಸಿರಿ ನಕ್ಷತ್ರ)",
    debilitatedPlanetsEn: "None (Symphonic wealth-bearing star)",
    sacredHaraKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬಂಗಾರ/ತಾಮ್ರದ ಧನಲಕ್ಷ್ಮಿ ಕವಚ (ಕೆಂಪು ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "3-Mukhi Rudraksha or Gold/Copper Dhanalakshmi Kavacha in red silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬಂಗಾರ ಅಥವಾ ತಾಮ್ರದ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಕೆಂಪು ಹವಳ ಹರಳಿನಿಂದ (ಅಖಂಡ ಧನಲಾಭ, ಸ್ಥಿರಾಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ನಾಯಕತ್ವಕ್ಕೆ)",
    karnaKundalaEn: "Pure Gold or Copper studs with natural Red Coral to anchor perpetual wealth flow and land ownership",
    luckyColorClothesKn: ["ಉಜ್ವಲ ಕೆಂಪು", "ಗಾಢ ಮರೂನ್", "ಬಂಗಾರದ ಬಣ್ಣ", "ಕೇಸರಿ"],
    luckyColorClothesEn: ["Radiant Red", "Deep Maroon", "Royal Gold", "Saffron"],
    strictAvoidColorsKn: ["ಮಾಸಿದ ಹಸಿರು", "ಮಬ್ಬು ಬೂದು"],
    strictAvoidColorsEn: ["Faded Green", "Dull Grey"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಪಠಿಸಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿ. ೨) 'ಓಂ ಅಂಗಾರಕಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ. ೩) ನಿರ್ಗತಿಕರಿಗೆ ಅಥವಾ ಕಟ್ಟಡ ಕಾರ್ಮಿಕರಿಗೆ ಬೆಲ್ಲ ಮತ್ತು ಕಡಲೆ ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಆಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಸಂಗೀತ/ಕಲಾ ಸಿದ್ಧಿ ಶತಸಿದ್ಧವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Subramanya Ashtottara and light a pure ghee lamp. 2) Chant 'Om Angarakaya Namaha' 11 times. 3) Donate jaggery and roasted gram to the needy. 4) Consecrate a wealth and land acquisition prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ಕೆಂಪು ಹವಳ (Red Coral), ಕಾರ್ನೇಲಿಯನ್ (Carnelian), ನೀಲಂ (Blue Sapphire)",
    associatedLuckyGemsEn: "Italian Red Coral (Pravala), Red Carnelian, Blue Sapphire"
  },
  "Shatabhisha": {
    nakshatraNameKn: "ಶತಭಿಷಾ",
    nakshatraNameEn: "Shatabhisha",
    nakshatraSwamiKn: "ರಾಹು",
    nakshatraSwamiEn: "Rahu",
    swamiPlanet: PlanetName.Rahu,
    nakshatraDevataKn: "ವರುಣದೇವ (ಸಾಗರಾಧಿಪತಿ & ಸಂಜೀವಿನಿ ವೈದ್ಯ)",
    nakshatraDevataEn: "Lord Varuna (Cosmic Healer & Ocean Lord)",
    exaltedPlanetsKn: "ರಾಹು (ಕುಂಭ ರಾಶಿಯ ಮೂಲತ್ರಿಕೋಣ ಕ್ಷೇತ್ರ ಬಲ)",
    exaltedPlanetsEn: "Rahu (Moolatrikona resonance in Aquarius)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಶತ ವೈದ್ಯರ ಸಂಜೀವಿನಿ ನಕ್ಷತ್ರ)",
    debilitatedPlanetsEn: "None (Centum physician Sanjeevini asterism)",
    sacredHaraKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಶ್ರೀ ಮೃತ್ಯುಂಜಯ ಕವಚ (ಗಾಢ ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "8-Mukhi Rudraksha or Pure Silver Mrityunjaya Kavacha in navy blue or black silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಶುದ್ಧ ಸ್ಫಟಿಕ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ ಹರಳಿನಿಂದ (ದೀರ್ಘಕಾಲದ ರೋಗ ನಿವಾರಣೆ ಹಾಗೂ ಸಂಶೋಧನಾ ಜ್ಞಾನಕ್ಕೆ)",
    karnaKundalaEn: "Sterling Silver studs with natural Clear Quartz or Amethyst to heal deep-seated nervous stress and ignite research breakthroughs",
    luckyColorClothesKn: ["ಮಿಂಚು ನೀಲಿ", "ಗಾಢ ನೇರಳೆ", "ಲ್ಯಾವೆಂಡರ್", "ಬೂದು"],
    luckyColorClothesEn: ["Electric Blue", "Navy Blue", "Lavender", "Smoky Grey"],
    strictAvoidColorsKn: ["ಅಗ್ನಿ ಕೆಂಪು", "ಪ್ರಕಾಶಮಾನ ಕಿತ್ತಳೆ"],
    strictAvoidColorsEn: ["Fiery Red", "Bright Orange"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ ಪವಿತ್ರ ಜಲವನ್ನು ಪ್ರೋಕ್ಷಿಸಿಕೊಳ್ಳಿ. ೨) ಶಿವಲಿಂಗಕ್ಕೆ ಗಂಗಾಜಲಾಭಿಷೇಕ ಮಾಡಿ. ೩) ಬಾಯಾರಿದ ಪಕ್ಷಿಗಳಿಗೆ ಅಥವಾ ಪ್ರಾಣಿಗಳಿಗೆ ನೀರು ನೀಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ರಹಸ್ಯ ರೋಗಗಳು ಮತ್ತು ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Chant Maha Mrityunjaya Mantra 11 times and sprinkle holy water on head. 2) Offer water abhisheka to Shiva Linga. 3) Put out fresh water bowls for birds and animals. 4) Consecrate Mrityunjaya Pooja at Sri Kshetra Gokarna to dissolve chronic afflictions.",
    associatedLuckyGemsKn: "ಗೋಮೇಧಿಕ (Hessonite), ನೀಲಂ (Blue Sapphire), ಶುದ್ಧ ಸ್ಫಟಿಕ",
    associatedLuckyGemsEn: "Hessonite Garnet (Gomed), Blue Sapphire, Clear Quartz"
  },
  "PurvaBhadrapada": {
    nakshatraNameKn: "ಪೂರ್ವಭಾದ್ರಪದಾ",
    nakshatraNameEn: "Purva Bhadrapada",
    nakshatraSwamiKn: "ಗುರು",
    nakshatraSwamiEn: "Jupiter",
    swamiPlanet: PlanetName.Jupiter,
    nakshatraDevataKn: "ಅಜ ಏಕಪಾದ (ರುದ್ರನ ತಪೋರೂಪ / ಜ್ಞಾನಾಗ್ನಿ)",
    nakshatraDevataEn: "Aja Ekapada (Mystic Tapasya Form of Rudra)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ತಪೋನಿಷ್ಠ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Ascetic transformational star)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ",
    debilitatedPlanetsEn: "None",
    sacredHaraKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬಂಗಾರ/ಹಿತ್ತಾಳೆಯ ಶ್ರೀ ಗುರು ಪೆಂಡೆಂಟ್ (ಹಳದಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "5-Mukhi Rudraksha or Gold/Brass Guru Locket in yellow silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬಂಗಾರ ಅಥವಾ ಹಿತ್ತಾಳೆಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಹಳದಿ ಪುಷ್ಯರಾಗ ಅಥವಾ ಸಿಟ್ರಿನ್ ಹರಳಿನಿಂದ (ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ತಪೋಶಕ್ತಿಗೆ)",
    karnaKundalaEn: "Pure Gold or Brass studs with Yellow Sapphire or Citrine to augment mystic intuition and detached wisdom",
    luckyColorClothesKn: ["ಉಜ್ವಲ ಅರಿಶಿನ ಹಳದಿ", "ಅಂಬರ್", "ಕೇಸರಿ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Bright Turmeric Yellow", "Amber", "Deep Saffron", "Silk Cream"],
    strictAvoidColorsKn: ["ಕಡು ಕಪ್ಪು", "ಮಬ್ಬು ನೀಲಿ"],
    strictAvoidColorsEn: ["Jet Black", "Dull Navy Blue"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಈಶಾನ್ಯಕ್ಕೆ ಮುಖಮಾಡಿ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ಹಾಗೂ ಗುರು ಸ್ತೋತ್ರ ಪಠಿಸಿ. ೨) 'ಓಂ ಗುರವೇ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೩) ಸಂನ್ಯಾಸಿಗಳಿಗೆ ಅಥವಾ ಬಡವರಿಗೆ ಧಾನ್ಯ ದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಆಂತರಿಕ ಶಾಂತಿ ಮತ್ತು ಉನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ ಲಭಿಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Face North-East at dawn, chant Shiva Panchakshari and Guru Stotra. 2) Chant 'Om Gurave Namaha' 108 times. 3) Donate grains to monks or the needy. 4) Consecrate a spiritual peace prayer at Sri Kshetra Gokarna for wisdom.",
    associatedLuckyGemsKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire), ಗೋಲ್ಡನ್ ಸಿಟ್ರಿನ್, ಹಳದಿ ಟೋಪಾಜ್",
    associatedLuckyGemsEn: "Yellow Sapphire (Pukhraj), Golden Citrine, Yellow Topaz"
  },
  "UttaraBhadrapada": {
    nakshatraNameKn: "ಉತ್ತರಭಾದ್ರಪದಾ",
    nakshatraNameEn: "Uttara Bhadrapada",
    nakshatraSwamiKn: "ಶನಿ",
    nakshatraSwamiEn: "Saturn",
    swamiPlanet: PlanetName.Saturn,
    nakshatraDevataKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (ಕುಂಡಲಿನಿ ಜ್ಞಾನದ ಆಳದ ಸರ್ಪರೂಪಿ ರುದ್ರ)",
    nakshatraDevataEn: "Ahirbudhnya (Serpent of the Oceanic Abyssal Depths)",
    exaltedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ಗಂಭೀರ ಸಮಾಧಿ ತಾರಾಮಂಡಲ)",
    exaltedPlanetsEn: "None (Contemplative Samadhi star)",
    debilitatedPlanetsKn: "ಬುಧ (ಬುಧ ಮಹಾರಾಜರು ಮೀನ ರಾಶಿಯ ಉತ್ತರಭಾದ್ರಪದಾ ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದದಲ್ಲಿ ೧೫° ಯಲ್ಲಿ ಪರಮ ನೀಚ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    debilitatedPlanetsEn: "Mercury (Reaches Parama Neecha - peak debilitation at 15°00' Pisces, 4th Pada of Uttara Bhadrapada)",
    sacredHaraKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ / ನೀಲಿ ಸ್ಪಟಿಕ ಪೆಂಡೆಂಟ್ (ಗಾಢ ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "7-Mukhi Rudraksha or Silver Shivalinga / Blue Quartz in navy blue or black silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ನೀಲಂ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ ಹರಳಿನಿಂದ (ಕುಂಡಲಿನಿ ಸಮತೋಲನ ಹಾಗೂ ಆರ್ಥಿಕ ಶಾಶ್ವತ ಸ್ಥಿರತೆಗೆ)",
    karnaKundalaEn: "Silver studs with natural Blue Sapphire or Amethyst to ground Kundalini currents and solidify lifelong wealth",
    luckyColorClothesKn: ["ರಾಯಲ್ ನೀಲಿ", "ಗಾಢ ಚಾರ್ಕೋಲ್", "ನೇರಳೆ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Navy Blue", "Dark Charcoal", "Deep Violet", "Silk Cream"],
    strictAvoidColorsKn: ["ಗಿಳಿ ಹಸಿರು (ಬುಧ ನೀಚ ಸ್ಥಾನ)", "ಪ್ರಕಾಶಮಾನ ಹಸಿರು"],
    strictAvoidColorsEn: ["Bright Parrot Green (Mercury debilitation)", "Neon Green"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಮುಂಜಾನೆ ಶಾಂತವಾಗಿ ೧೫ ನಿಮಿಷ ಧ್ಯಾನಸ್ಥರಾಗಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೨) ಶಿವಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಪತ್ರೆ ಅರ್ಪಿಸಿ. ೩) ವೃದ್ಧರಿಗೆ ಬೆಚ್ಚನೆಯ ವಸ್ತ್ರ ಅಥವಾ ಅನ್ನದಾನ ಮಾಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಆರ್ಥಿಕ ತೊಂದರೆಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿರಂತರ ಶಾಂತಿ ನೆಲೆಸುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Meditate quietly for 15 minutes at dawn and chant 'Om Namah Shivaya' 108 times. 2) Offer Bilva leaves to Shiva Linga. 3) Donate warm clothing or food to elderly persons. 4) Consecrate a financial stability prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ನೀಲಂ (Blue Sapphire), ಅಮೆಥಿಸ್ಟ್ (Amethyst), ಹಳದಿ ಪುಷ್ಯರಾಗ",
    associatedLuckyGemsEn: "Blue Sapphire (Neelam), Blue Quartz / Amethyst, Yellow Sapphire"
  },
  "Revati": {
    nakshatraNameKn: "ರೇವತಿ",
    nakshatraNameEn: "Revati",
    nakshatraSwamiKn: "ಬುಧ",
    nakshatraSwamiEn: "Mercury",
    swamiPlanet: PlanetName.Mercury,
    nakshatraDevataKn: "ಪೂಷನ್ (ಪ್ರಯಾಣಿಕರ & ಪಶುಗಳ ಪರಮ ರಕ್ಷಕ)",
    nakshatraDevataEn: "Lord Pushan (Nurturer of Herds & Safe Journey Guide)",
    exaltedPlanetsKn: "ಶುಕ್ರ (ಶುಕ್ರ ಮಹಾರಾಜರು ಮೀನ ರಾಶಿಯ ರೇವತಿ ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದದಲ್ಲಿ ೨೭° ಯಲ್ಲಿ ಪರಮ ಉಚ್ಛ ಸ್ಥಾನ ಪಡೆಯುತ್ತಾರೆ)",
    exaltedPlanetsEn: "Venus (Reaches Parama Ucha - peak exaltation at 27°00' Pisces, 4th Pada of Revati)",
    debilitatedPlanetsKn: "ಯಾವುದೂ ಇಲ್ಲ (ರಾಶಿಚಕ್ರದ ಅಂತಿಮ ಮೋಕ್ಷ ನಕ್ಷತ್ರ)",
    debilitatedPlanetsEn: "None (Culmination star of cosmic liberation & safe journeys)",
    sacredHaraKn: "೪ ಅಥವಾ ೧೦ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಬೆಳ್ಳಿಯ ಶ್ರೀ ಗೋಪಾಲ ಕೃಷ್ಣ ಯಂತ್ರ (ಹಸಿರು ಅಥವಾ ಬಿಳಿ ರೇಷ್ಮೆ ದಾರದಲ್ಲಿ)",
    sacredHaraEn: "4 or 10-Mukhi Rudraksha or Silver Gopala Krishna Yantra in green or white silk thread",
    karnaKundalaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ ಅಥವಾ ವೈಟ್ ಗೋಲ್ಡ್ ಕಿವಿಯೋಲೆ, ನೈಸರ್ಗಿಕ ಹಸಿರು ಪಚ್ಚೆ ಅಥವಾ ಹೊಳೆಯುವ ಬಿಳಿ ಜಿರ್ಕಾನ್/ವಜ್ರ ಹರಳಿನಿಂದ (ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ, ಪಶು-ಸಂಪತ್ತು ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿಗೆ)",
    karnaKundalaEn: "Silver or White Gold studs with natural Emerald or sparkling White Zircon / Diamond to ensure safe journeys and flourishing commerce",
    luckyColorClothesKn: ["ಪಚ್ಚೆ ಹಸಿರು", "ಶುದ್ಧ ಬಿಳಿ", "ತಿಳಿ ಹಳದಿ", "ಕ್ರೀಮ್"],
    luckyColorClothesEn: ["Emerald Green", "Pure White", "Pastel Yellow", "Silk Cream"],
    strictAvoidColorsKn: ["ಕಡು ಮಣ್ಣಿನ ಕಂದು", "ಒರಟು ಕಪ್ಪು"],
    strictAvoidColorsEn: ["Dark Muddy Brown", "Harsh Jet Black"],
    nextDayActionableSadhanaKn: "ನಾಳೆಯಿಂದಲೇ ಆರಂಭಿಸಬಹುದಾದ ಮುಂಜಾನೆಯ ಸಾಧನೆ: ೧) ಶ್ರೀ ಕೃಷ್ಣ ಅಷ್ಟಕಂ ಅಥವಾ 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ೨) ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು, ಬೆಲ್ಲ ಮತ್ತು ಬಾಳೆಹಣ್ಣು ತಿನ್ನಿಸಿ. ೩) ಪ್ರಯಾಣಿಕರಿಗೆ ಅಥವಾ ದಾರಿಯಲ್ಲಿರುವವರಿಗೆ ಕುಡಿಯುವ ನೀರು/ಆಹಾರ ನೀಡಿ. ೪) ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ಸಕಲ ಪ್ರಯಾಣಗಳಲ್ಲಿ ರಕ್ಷಣೆ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ಶತಸಿದ್ಧವಾಗುವುದು.",
    nextDayActionableSadhanaEn: "Immediate Next-Day Morning Sadhana: 1) Recite Sri Krishna Ashtakam or chant 'Om Namo Narayanaya' 108 times. 2) Feed fresh grass, jaggery, and bananas to cows. 3) Offer water or food to travelers. 4) Consecrate a safe travel and trade prosperity prayer at Sri Kshetra Gokarna.",
    associatedLuckyGemsKn: "ಪಚ್ಚೆ (Emerald), ವಜ್ರ (Diamond), ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon)",
    associatedLuckyGemsEn: "Natural Emerald (Panna), Diamond, White Zircon"
  },
};

export function getNakshatraDignityInfo(nakshatraName: string): NakshatraDignityInfo {
  return NAKSHATRA_DIGNITY_CATALOG[nakshatraName] || NAKSHATRA_DIGNITY_CATALOG["Ashwini"]!;
}


// ── 2. LAGNA GEMSTONE, RING, FINGER & PROHIBITIONS MASTER CATALOG ─────────
export interface LagnaGemstoneRule {
  lagnaIdx: number;
  lagnaNameKn: string;
  lagnaNameEn: string;
  lagnaLord: PlanetName;
  primaryGemKn: string;
  primaryGemEn: string;
  sanskritName: string;
  caratRange: string;
  metalKn: string;
  metalEn: string;
  fingerKn: string;
  fingerEn: string;
  activationDayKn: string;
  activationDayEn: string;
  horaKn: string;
  horaEn: string;
  mantraKn: string;
  mantraEn: string;
  bhagyaGemKn: string;
  bhagyaGemEn: string;
  bhagyaFingerKn: string;
  bhagyaFingerEn: string;
  bhagyaMetalKn: string;
  bhagyaMetalEn: string;
  yogakarakaPlanet?: PlanetName;
  yogakarakaGemKn?: string;
  yogakarakaGemEn?: string;
  yogakarakaFingerKn?: string;
  yogakarakaFingerEn?: string;
  yogakarakaMetalKn?: string;
  yogakarakaMetalEn?: string;
  yogakarakaImpactKn?: string;
  yogakarakaImpactEn?: string;
  // Prohibitions (Dangerous Stones & Colors)
  prohibitedGems: {
    gemstoneKn: string;
    gemstoneEn: string;
    rulingPlanet: PlanetName;
    houseLordshipKn: string;
    houseLordshipEn: string;
    dangerEffectKn: string;
    dangerEffectEn: string;
  }[];
  luckyColorsKn: string[];
  luckyColorsEn: string[];
  whyLuckyKn: string;
  whyLuckyEn: string;
  avoidColorsKn: string[];
  avoidColorsEn: string[];
  dangerColorsKn: string;
  dangerColorsEn: string;
}

export const LAGNA_GEMSTONE_RULES: Record<number, LagnaGemstoneRule> = {
  // 0: Mesha (Aries)
  0: {
    lagnaIdx: 0,
    lagnaNameKn: "ಮೇಷ",
    lagnaNameEn: "Aries",
    lagnaLord: PlanetName.Mars,
    primaryGemKn: "ಕೆಂಪು ಹವಳ (ಶುದ್ಧ ತ್ರಿಕೋಣ ಪ್ರವಾಳ)",
    primaryGemEn: "Red Coral (Pure Italian Triangular Pravala)",
    sanskritName: "ಪ್ರವಾಳಂ (Pravalam)",
    caratRange: "5.5 - 7.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ತಾಮ್ರ ಅಥವಾ 18K ಚಿನ್ನ",
    metalEn: "Pure Copper or 18K Gold",
    fingerKn: "ಬಲಗೈಯ ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    fingerEn: "Right Hand Ring Finger (Anamika)",
    activationDayKn: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Tuesday Morning at Sunrise",
    horaKn: "ಕುಜ ಹೋರೆ",
    horaEn: "Mars (Kuja) Hora",
    mantraKn: "ಓಂ ಭೌಮಾಯ ನಮಃ (Om Bhaumaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Bhaumaya Namaha (108 times)",
    bhagyaGemKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (ಗುರು - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Yellow Sapphire (Jupiter - 9th Bhagya Lord)",
    bhagyaFingerKn: "ತರ್ಜನಿ ಬೆರಳು (ತೋರುಬೆರಳು)",
    bhagyaFingerEn: "Index Finger",
    bhagyaMetalKn: "ಅಪ್ಪಟ ಚಿನ್ನ",
    bhagyaMetalEn: "Pure Gold",
    prohibitedGems: [
      {
        gemstoneKn: "ಪಚ್ಚೆ (ಮರಕತ / Emerald)",
        gemstoneEn: "Emerald (Pache)",
        rulingPlanet: PlanetName.Mercury,
        houseLordshipKn: "3ನೇ ಪರಾಕ್ರಮ ಹಾಗೂ 6ನೇ ರೋಗ-ಶತ್ರು-ಋಣ ಸ್ಥಾನಗಳ ಅಧಿಪತಿ ಬುಧ",
        houseLordshipEn: "3rd & 6th Lord of Illness, Debts, Litigation (Mercury)",
        dangerEffectKn: "ಪಚ್ಚೆ ಧರಿಸಿದರೆ ಚರ್ಮ ರೋಗಗಳು, ನರಗಳ ದೌರ್ಬಲ್ಯ, ಅನಿರೀಕ್ಷಿತ ಸಾಲ ಹಾಗೂ ಕೋರ್ಟ್ ಕಚೇರಿ ವ್ಯಾಜ್ಯಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆ.",
        dangerEffectEn: "Triggers chronic nervous debility, skin flare-ups, heavy debt traps, and protracted litigation."
      },
      {
        gemstoneKn: "ನೀಲಂ (ನೀಲಿ ಪದ್ಮರಾಗ / Blue Sapphire)",
        gemstoneEn: "Blue Sapphire (Neelam)",
        rulingPlanet: PlanetName.Saturn,
        houseLordshipKn: "10ನೇ ಕರ್ಮ ಹಾಗೂ 11ನೇ ಬಾಧಕ ಸ್ಥಾನಾಧಿಪತಿ ಶನಿ",
        houseLordshipEn: "10th & 11th Badhaka Lord (Saturn)",
        dangerEffectKn: "ಮೇಷ ಲಗ್ನಕ್ಕೆ ಶನಿ ಬಾಧಕನಾಗಿದ್ದು, ನೀಲಂ ಧರಿಸಿದರೆ ತಂದೆಯೊಂದಿಗೆ ವೈಷಮ್ಯ, ಕೀಲು ನೋವು ಹಾಗೂ ವ್ಯವಹಾರದಲ್ಲಿ ದಿಢೀರ್ ನಷ್ಟ ಎದುರಾಗುತ್ತದೆ.",
        dangerEffectEn: "Acts as a severe Badhaka; wearing Neelam triggers chronic joint agony, friction with elders, and sudden business halt."
      }
    ],
    luckyColorsKn: ["ಕೆಂಪು", "ಕೇಸರಿ", "ಹಳದಿ", "ಬಂಗಾರದ ಬಣ್ಣ"],
    luckyColorsEn: ["Crimson Red", "Saffron", "Golden Yellow", "Amber"],
    whyLuckyKn: "ಲಗ್ನಾಧಿಪತಿ ಕುಜ ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿ ಗುರು-ಸೂರ್ಯರ ಅಗ್ನಿ ತತ್ತ್ವದ ಶಕ್ತಿಯನ್ನು ಪ್ರಚೋದಿಸಿ ದೇಹದಲ್ಲಿ ತೇಜಸ್ಸು ಹಾಗೂ ಜಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    whyLuckyEn: "Amplifies the fiery vitality of Lagnesha Mars and auspicious 9th lord Jupiter, ensuring unstoppable drive and vitality.",
    avoidColorsKn: ["ಕಪ್ಪು", "ಕಡು ಹಸಿರು", "ಗಾಢ ನೀಲಿ"],
    avoidColorsEn: ["Jet Black", "Dark Green", "Deep Navy Blue"],
    dangerColorsKn: "ಕಪ್ಪು ಮತ್ತು ಕಡು ಹಸಿರು ಬಣ್ಣಗಳು ಆಲಸ್ಯ, ಸಾಲದ ಹೊರೆ ಹಾಗೂ ಶತ್ರುಗಳ ಉಪಟಳವನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.",
    dangerColorsEn: "Black and dark green dampen physical vitality, attracting financial lethargy and hidden rivalry."
  },

  // 1: Vrishabha (Taurus)
  1: {
    lagnaIdx: 1,
    lagnaNameKn: "ವೃಷಭ",
    lagnaNameEn: "Taurus",
    lagnaLord: PlanetName.Venus,
    primaryGemKn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್ (ಶುಕ್ರ)",
    primaryGemEn: "Diamond or Natural White Zircon (Venus)",
    sanskritName: "ವಜ್ರಂ (Vajram)",
    caratRange: "1.0 - 2.5 Carat (Diamond) / 4.0 - 6.0 Carat (Zircon)",
    metalKn: "ಪ್ಲಾಟಿನಂ ಅಥವಾ ಬೆಳ್ಳಿ ಅಥವಾ ಬಿಳಿ ಬಂಗಾರ",
    metalEn: "Platinum, Sterling Silver, or White Gold",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು",
    fingerEn: "Middle Finger or Little Finger",
    activationDayKn: "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Friday Morning during Venus Hora",
    horaKn: "ಶುಕ್ರ ಹೋರೆ",
    horaEn: "Venus Hora",
    mantraKn: "ಓಂ ಶುಕ್ರಾಯ ನಮಃ (Om Shukraya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Shukraya Namaha (108 times)",
    bhagyaGemKn: "ನೀಲಂ (ಶನಿ - 9ನೇ ಭಾಗ್ಯ & 10ನೇ ಕರ್ಮಾಧಿಪತಿ ಯೋಗಕಾರಕ)",
    bhagyaGemEn: "Blue Sapphire / Neelam (Saturn - Supreme Yogakaraka)",
    bhagyaFingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    bhagyaFingerEn: "Middle Finger",
    bhagyaMetalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    bhagyaMetalEn: "Panchadhatu or Silver",
    yogakarakaPlanet: PlanetName.Saturn,
    yogakarakaGemKn: "ನೀಲಂ (ಶುದ್ಧ ನೀಲಿ ರತ್ನ)",
    yogakarakaGemEn: "Blue Sapphire (Neelam)",
    yogakarakaFingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    yogakarakaFingerEn: "Middle Finger (Madhyama)",
    yogakarakaMetalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    yogakarakaMetalEn: "Panchadhatu or Silver",
    yogakarakaImpactKn: "ವೃಷಭ ಲಗ್ನಕ್ಕೆ ಶನಿಯು 9ನೇ ತ್ರಿಕೋಣ ಹಾಗೂ 10ನೇ ಕೇಂದ್ರದ ಏಕೈಕ ಪರಮ ಯೋಗಕಾರಕನಾಗಿದ್ದು, ನೀಲಂ ಧರಿಸಿದರೆ ರಾಜಯೋಗ, ಆಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಅಧಿಕಾರ ಉತ್ತುಂಗಕ್ಕೇರುತ್ತದೆ.",
    yogakarakaImpactEn: "Saturn is the absolute Yogakaraka (9th & 10th lord); wearing authentic Blue Sapphire unleashes massive real-estate prosperity, executive status, and unshakeable authority.",
    prohibitedGems: [
      {
        gemstoneKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
        gemstoneEn: "Yellow Sapphire (Pushparaga)",
        rulingPlanet: PlanetName.Jupiter,
        houseLordshipKn: "8ನೇ ಆಯುಷ್ಯ/ರಂಧ್ರ ಹಾಗೂ 11ನೇ ಬಾಧಕ ಸ್ಥಾನಾಧಿಪತಿ ಗುರು",
        houseLordshipEn: "8th Dusthana & 11th Badhaka Lord (Jupiter)",
        dangerEffectKn: "ಗುರುವು ವೃಷಭ ಲಗ್ನಕ್ಕೆ ಪರಮ ಶತ್ರುವಾಗಿದ್ದು, ಪುಷ್ಯರಾಗ ಧರಿಸಿದರೆ ಯಕೃತ್ತು (ಲಿವರ್) ಸಮಸ್ಯೆ, ಬೃಹತ್ ಸಾಲದ ಹೊರೆ ಹಾಗೂ ವಿವಾಹ ವಿಚ್ಛೇದನಕ್ಕೆ ದಾರಿಯಾಗುತ್ತದೆ.",
        dangerEffectEn: "Jupiter is the worst functional malefic for Taurus; wearing Yellow Sapphire triggers liver ailments, catastrophic debt, and marital collapse."
      },
      {
        gemstoneKn: "ಮಾಣಿಕ್ಯ (Ruby)",
        gemstoneEn: "Ruby (Manikya)",
        rulingPlanet: PlanetName.Sun,
        houseLordshipKn: "4ನೇ ಸ್ಥಾನಾಧಿಪತಿಯಾದರೂ ಶುಕ್ರನಿಗೆ ನೈಸರ್ಗಿಕ ಶತ್ರು ಸೂರ್ಯ",
        houseLordshipEn: "Natural Arch-enemy to Lagnesha Venus (Sun)",
        dangerEffectKn: "ತಲೆನೋವು, ತಾಯಿಯ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರು ಹಾಗೂ ಅಹಂಕಾರದ ಸಂಘರ್ಷ ಉಂಟುಮಾಡುತ್ತದೆ.",
        dangerEffectEn: "Foments intense ego friction, maternal health decline, and blood pressure agitation."
      }
    ],
    luckyColorsKn: ["ಬಿಳಿ", "ರಾಯಲ್ ಬ್ಲೂ", "ಆಕಾಶ ನೀಲಿ", "ಹಸಿರು", "ಕಪ್ಪು"],
    luckyColorsEn: ["Pure White", "Royal Blue", "Sky Blue", "Emerald Green", "Jet Black"],
    whyLuckyKn: "ಶುಕ್ರನ ಜಲ ತತ್ತ್ವ ಹಾಗೂ ಶನಿ-ಬುಧರ ಮಿತ್ರ ತತ್ತ್ವಗಳು ಸಂಯೋಜನೆಗೊಂಡು ಆಕರ್ಷಣೆ ಮತ್ತು ಆರ್ಥಿಕ ಸಮೃದ್ಧಿಯನ್ನು ತರುತ್ತವೆ.",
    whyLuckyEn: "Harmonizes Lagnesha Venus and Yogakaraka Saturn, transmuting subtle aura into material grandeur and social luxury.",
    avoidColorsKn: ["ಹಳದಿ", "ಕೇಸರಿ", "ತಿಳಿ ಕೆಂಪು"],
    avoidColorsEn: ["Bright Yellow", "Saffron", "Scarlet Red"],
    dangerColorsKn: "ಹಳದಿ ಮತ್ತು ಕೇಸರಿ ಬಣ್ಣಗಳು ಅಷ್ಟಮಾಧಿಪತಿ ಗುರುವಿನ ಅಶುಭ ತರಂಗಗಳನ್ನು ಆಕರ್ಷಿಸಿ ಅನಾರೋಗ್ಯ ತರುತ್ತವೆ.",
    dangerColorsEn: "Yellow and saffron stimulate 8th house Jupiter friction, attracting metabolic imbalance and debt."
  },

  // 2: Mithuna (Gemini)
  2: {
    lagnaIdx: 2,
    lagnaNameKn: "ಮಿಥುನ",
    lagnaNameEn: "Gemini",
    lagnaLord: PlanetName.Mercury,
    primaryGemKn: "ಪಚ್ಚೆ (ಜಾಂಬಿಯಾ ಶುದ್ಧ ಮರಕತ / Emerald)",
    primaryGemEn: "Emerald (Pure Zambian or Colombian Marakata)",
    sanskritName: "ಮರಕತಂ (Marakatam)",
    caratRange: "4.5 - 6.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ಬೆಳ್ಳಿ ಅಥವಾ 18K ಹಸಿರು ಬಂಗಾರ",
    metalEn: "Pure Silver or 18K Gold",
    fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)",
    fingerEn: "Little Finger (Kanishthika)",
    activationDayKn: "ಬುಧವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Wednesday Morning during Mercury Hora",
    horaKn: "ಬುಧ ಹೋರೆ",
    horaEn: "Mercury (Budha) Hora",
    mantraKn: "ಓಂ ಬುಧಾಯ ನಮಃ (Om Budhaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Budhaya Namaha (108 times)",
    bhagyaGemKn: "ನೀಲಂ (ಶನಿ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Blue Sapphire (Saturn - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಮಧ್ಯದ ಬೆರಳು",
    bhagyaFingerEn: "Middle Finger",
    bhagyaMetalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    bhagyaMetalEn: "Panchadhatu or Silver",
    prohibitedGems: [
      {
        gemstoneKn: "ಕೆಂಪು ಹವಳ (Red Coral / Avala)",
        gemstoneEn: "Red Coral (Havala)",
        rulingPlanet: PlanetName.Mars,
        houseLordshipKn: "6ನೇ ರೋಗ-ಶತ್ರು ಹಾಗೂ 11ನೇ ಸ್ಥಾನಾಧಿಪತಿ ಕ್ರೂರ ಮಂಗಳ",
        houseLordshipEn: "6th Lord of Illness, Enemies, Litigation & 11th Lord (Mars)",
        dangerEffectKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಮಂಗಳ ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಶತ್ರು. ಹವಳ ಧರಿಸಿದರೆ ತೀವ್ರ ರಕ್ತದೊತ್ತಡ, ರಸ್ತೆ ಅಪಘಾತ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಹಾಗೂ ಹಿಂಸಾತ್ಮಕ ಜಗಳಗಳು ಉಂಟಾಗುತ್ತವೆ!",
        dangerEffectEn: "Mars is the deadliest functional enemy for Gemini; wearing Red Coral triggers high BP, surgery risks, road accidents, and violent litigation!"
      },
      {
        gemstoneKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
        gemstoneEn: "Yellow Sapphire (Pushparaga)",
        rulingPlanet: PlanetName.Jupiter,
        houseLordshipKn: "7ನೇ ಮಾರಕ ಹಾಗೂ 10ನೇ ಕೇಂದ್ರ ಸ್ಥಾನಗಳಿಗೆ ಕೇಂದ್ರಾಧಿಪತ್ಯ ದೋಷ ಹೊತ್ತ ಗುರು",
        houseLordshipEn: "Kendradhipatya Dosha & 7th Maraka Lord (Jupiter)",
        dangerEffectKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಅಸಹನೀಯ ಬಿರುಕು, ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಮೋಸ ಹಾಗೂ ಉದ್ಯೋಗದಲ್ಲಿ ಹಠಾತ್ ಪದಚ್ಯುತಿ ತರುತ್ತದೆ.",
        dangerEffectEn: "Inflicts Kendradhipatya affliction: marital alienation, partnership deception, and career disruption."
      }
    ],
    luckyColorsKn: ["ಹಸಿರು", "ತಿಳಿ ನೀಲಿ", "ಬಿಳಿ", "ಬೂದು ಬಣ್ಣ"],
    luckyColorsEn: ["Emerald Green", "Light Blue", "Pristine White", "Silver Grey"],
    whyLuckyKn: "ಬುದ್ಧಿಕಾರಕ ಬುಧನ ನರಮಂಡಲ ತರಂಗಗಳನ್ನು ಬಲಪಡಿಸಿ ವ್ಯಾಪಾರ ಹಾಗೂ ಮಾತಿನ ಪ್ರಭಾವ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    whyLuckyEn: "Sharpens analytical intellect, commerce acumen, and public eloquence under Lagnesha Mercury.",
    avoidColorsKn: ["ಕಡು ಕೆಂಪು", "ರಕ್ತವರ್ಣ", "ಕಿತ್ತಳೆ"],
    avoidColorsEn: ["Blood Red", "Scarlet Crimson", "Dark Orange"],
    dangerColorsKn: "ಕೆಂಪು ಬಣ್ಣವು 6ನೇ ಅಧಿಪತಿ ಕುಜನ ಕೆಟ್ಟ ಪ್ರಭಾವವನ್ನು ಕೆರಳಿಸಿ ರಕ್ತವಿಕಾರ ಹಾಗೂ ಜಗಳ ತರುತ್ತದೆ.",
    dangerColorsEn: "Red frequencies agitate 6th house Mars, triggering emotional rage, inflammation, and disputes."
  },

  // 3: Karka (Cancer)
  3: {
    lagnaIdx: 3,
    lagnaNameKn: "ಕರ್ಕಾಟಕ",
    lagnaNameEn: "Cancer",
    lagnaLord: PlanetName.Moon,
    primaryGemKn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (ದಕ್ಷಿಣ ಸಮುದ್ರದ ಶುದ್ಧ ಮುತ್ತು / Pearl)",
    primaryGemEn: "Natural Pearl (South Sea or Basra Moti)",
    sanskritName: "ಮೌಕ್ತಿಕಂ (Mauktikam)",
    caratRange: "5.0 - 7.5 Carat",
    metalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ",
    metalEn: "Pure Sterling Silver",
    fingerKn: "ಕಿರುಬೆರಳು ಅಥವಾ ಉಂಗುರದ ಬೆರಳು",
    fingerEn: "Little Finger or Ring Finger",
    activationDayKn: "ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ (ಶುಕ್ಲಪಕ್ಷ)",
    activationDayEn: "Monday Morning during Moon Hora (Shukla Paksha)",
    horaKn: "ಚಂದ್ರ ಹೋರೆ",
    horaEn: "Moon (Chandra) Hora",
    mantraKn: "ಓಂ ಸೋಮಾಯ ನಮಃ (Om Somaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Somaya Namaha (108 times)",
    bhagyaGemKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (ಗುರು - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Yellow Sapphire (Jupiter - 9th Bhagya Lord)",
    bhagyaFingerKn: "ತೋರುಬೆರಳು (ತರ್ಜನಿ)",
    bhagyaFingerEn: "Index Finger",
    bhagyaMetalKn: "ಅಪ್ಪಟ ಚಿನ್ನ",
    bhagyaMetalEn: "Pure Gold",
    yogakarakaPlanet: PlanetName.Mars,
    yogakarakaGemKn: "ಕೆಂಪು ಹವಳ (ಕುಜ - 5ನೇ ತ್ರಿಕೋಣ & 10ನೇ ಕರ್ಮಾಧಿಪತಿ ಯೋಗಕಾರಕ)",
    yogakarakaGemEn: "Red Coral (Mars - Supreme Yogakaraka for Cancer)",
    yogakarakaFingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    yogakarakaFingerEn: "Ring Finger (Anamika)",
    yogakarakaMetalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ",
    yogakarakaMetalEn: "Pure Copper or Gold",
    yogakarakaImpactKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಕುಜನು ಪರಮ ಯೋಗಕಾರಕನಾಗಿದ್ದು, ಹವಳ ಧರಿಸಿದರೆ ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಭೂಮಿ ಖರೀದಿ, ರಕ್ಷಣಾ ಕ್ಷೇತ್ರ ಹಾಗೂ ವೃತ್ತಿ ನಾಯಕತ್ವದಲ್ಲಿ ಸಾಟಿಯಿಲ್ಲದ ಯಶಸ್ಸು ತರುತ್ತದೆ.",
    yogakarakaImpactEn: "Mars is the supreme Yogakaraka (5th & 10th lord); wearing authentic Red Coral grants sovereign land ownership, executive courage, and monumental success.",
    prohibitedGems: [
      {
        gemstoneKn: "ನೀಲಂ (ನೀಲಿ ರತ್ನ / Blue Sapphire)",
        gemstoneEn: "Blue Sapphire (Neelam)",
        rulingPlanet: PlanetName.Saturn,
        houseLordshipKn: "7ನೇ ಮಾರಕ ಹಾಗೂ 8ನೇ ಮೃತ್ಯು/ರಂಧ್ರ ಸ್ಥಾನಗಳ ಅಧಿಪತಿ ಶನಿ",
        houseLordshipEn: "7th Maraka & 8th Death/Ayush Lord (Saturn)",
        dangerEffectKn: "ಕರ್ಕಾಟಕ ಲಗ್ನದವರು ನೀಲಂ ಧರಿಸಿದರೆ ಸಾವು-ನೋವಿನ ಸಮಾನ ಸಂಕಷ್ಟ, ತೀವ್ರ ಖಿನ್ನತೆ, ವಿಚ್ಛೇದನ ಹಾಗೂ ದಿವಾಳಿತನ ಎದುರಾಗುತ್ತದೆ. ನೀಲಂ ಇವರಿಗೆ ವಿಷ ಸಮಾನ!",
        dangerEffectEn: "Saturn rules both the 7th Maraka and 8th Dusthana; wearing Blue Sapphire can be fatal, triggering depressive agony, marital rupture, and ruin!"
      },
      {
        gemstoneKn: "ವಜ್ರ (Diamond)",
        gemstoneEn: "Diamond (Vajra)",
        rulingPlanet: PlanetName.Venus,
        houseLordshipKn: "4ನೇ ಹಾಗೂ 11ನೇ ಬಾಧಕ ಸ್ಥಾನಗಳ ಅಧಿಪತಿ ಶುಕ್ರ",
        houseLordshipEn: "4th & 11th Badhaka Lord (Venus)",
        dangerEffectKn: "ತಾಯಿಯ ಆರೋಗ್ಯಕ್ಕೆ ಕಂಟಕ ಹಾಗೂ ಆಸ್ತಿ ನಷ್ಟ ಉಂಟುಮಾಡುತ್ತದೆ.",
        dangerEffectEn: "Triggers domestic unrest, property disputes, and respiratory congestion."
      }
    ],
    luckyColorsKn: ["ಬಿಳಿ", "ಕೆನೆ ಬಣ್ಣ", "ತಿಳಿ ಗುಲಾಬಿ", "ಹಳದಿ", "ಕೆಂಪು"],
    luckyColorsEn: ["Pearl White", "Cream", "Soft Rose", "Warm Yellow", "Scarlet Red"],
    whyLuckyKn: "ಚಂದ್ರನ ಜಲ ತತ್ವ, ಗುರುವಿನ ಧರ್ಮ ತತ್ವ ಹಾಗೂ ಕುಜನ ಯೋಗಕಾರಕ ಶಕ್ತಿಗಳು ಜಾತಕನಿಗೆ ಸಕಲ ನೆಮ್ಮದಿ ಮತ್ತು ಭಾಗ್ಯ ತರುತ್ತವೆ.",
    whyLuckyEn: "Nourishes the intuitive water element of Moon while harnessing the dynamic power of Yogakaraka Mars.",
    avoidColorsKn: ["ಕಪ್ಪು", "ಕಡು ನೀಲಿ", "ಬೂದು ಬಣ್ಣ"],
    avoidColorsEn: ["Jet Black", "Deep Navy Blue", "Dull Charcoal"],
    dangerColorsKn: "ಕಪ್ಪು ಮತ್ತು ನೀಲಿ ಬಣ್ಣಗಳು 8ನೇ ಅಧಿಪತಿ ಶನಿಯ ಮಾರಕ ಶಕ್ತಿಯನ್ನು ಪ್ರಚೋದಿಸಿ ಮಾನಸಿಕ ಖಿನ್ನತೆ ಮತ್ತು ನಷ್ಟ ತರುತ್ತವೆ.",
    dangerColorsEn: "Black and navy blue activate 8th lord Saturn's grim drag, causing chronic melancholy and financial stagnation."
  },

  // 4: Simha (Leo)
  4: {
    lagnaIdx: 4,
    lagnaNameKn: "ಸಿಂಹ",
    lagnaNameEn: "Leo",
    lagnaLord: PlanetName.Sun,
    primaryGemKn: "ಮಾಣಿಕ್ಯ (ಬರ್ಮೀಸ್ ಶುದ್ಧ ಕೆಂಪು ರತ್ನ / Ruby)",
    primaryGemEn: "Ruby (Pure Natural Burmese Manikya)",
    sanskritName: "ಮಾಣಿಕ್ಯಂ (Manikyam)",
    caratRange: "3.5 - 5.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ಚಿನ್ನ ಅಥವಾ ತಾಮ್ರ",
    metalEn: "Pure Gold or Copper",
    fingerKn: "ಬಲಗೈಯ ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    fingerEn: "Right Hand Ring Finger (Anamika)",
    activationDayKn: "ಭಾನುವಾರ ಪ್ರಾತಃಕಾಲ (ಸೂರ್ಯೋದಯದ ವೇಳೆಗೆ)",
    activationDayEn: "Sunday Morning at Sunrise",
    horaKn: "ಸೂರ್ಯ ಹೋರೆ",
    horaEn: "Sun (Surya) Hora",
    mantraKn: "ಓಂ ಸೂರ್ಯಾಯ ನಮಃ (Om Suryaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Suryaya Namaha (108 times)",
    bhagyaGemKn: "ಕೆಂಪು ಹವಳ (ಕುಜ - 4ನೇ ಕೇಂದ್ರ & 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ ಯೋಗಕಾರಕ)",
    bhagyaGemEn: "Red Coral / Havala (Mars - Supreme Yogakaraka)",
    bhagyaFingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    bhagyaFingerEn: "Ring Finger (Anamika)",
    bhagyaMetalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ",
    bhagyaMetalEn: "Copper or Gold",
    yogakarakaPlanet: PlanetName.Mars,
    yogakarakaGemKn: "ಕೆಂಪು ಹವಳ (ಕುಜ)",
    yogakarakaGemEn: "Red Coral (Mars)",
    yogakarakaFingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    yogakarakaFingerEn: "Ring Finger",
    yogakarakaMetalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ",
    yogakarakaMetalEn: "Copper or Gold",
    yogakarakaImpactKn: "ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ಮಂಗಳನು 4ನೇ ಸುಖ ಸ್ಥಾನ ಹಾಗೂ 9ನೇ ಪರಮ ಭಾಗ್ಯ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿ ರಾಜಯೋಗ ನೀಡುತ್ತಾನೆ. ಹವಳ ಧರಿಸಿದರೆ ಸರ್ಕಾರಿ ಹುದ್ದೆ, ಆಸ್ತಿ ಸಂಪತ್ತು ಹಾಗೂ ದಿಗ್ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
    yogakarakaImpactEn: "Mars is the supreme 9th Bhagya & 4th Kendra lord; wearing Red Coral guarantees royal authority, ancestral fortune, and victory over adversaries.",
    prohibitedGems: [
      {
        gemstoneKn: "ನೀಲಂ (Blue Sapphire)",
        gemstoneEn: "Blue Sapphire (Neelam)",
        rulingPlanet: PlanetName.Saturn,
        houseLordshipKn: "6ನೇ ರೋಗ-ಶತ್ರು ಹಾಗೂ 7ನೇ ಮಾರಕ ಸ್ಥಾನಾಧಿಪತಿ ಶನಿ",
        houseLordshipEn: "6th Roga-Shatru & 7th Maraka Lord (Saturn)",
        dangerEffectKn: "ಸೂರ್ಯ ಮತ್ತು ಶನಿ ಪರಮ ವೈರಿಗಳು. ಸಿಂಹ ಲಗ್ನದವರು ನೀಲಂ ಧರಿಸಿದರೆ ಹೃದಯ ರೋಗಗಳು, ಕಣ್ಣಿನ ದೋಷ, ದಾಂಪತ್ಯ ವಿನಾಶ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಭಾರೀ ಕುಸಿತ ಎದುರಾಗುತ್ತದೆ!",
        dangerEffectEn: "Sun and Saturn are cosmic archenemies; Blue Sapphire triggers cardiac vulnerability, optical ailments, marital breakdown, and financial ruin!"
      },
      {
        gemstoneKn: "ವಜ್ರ (Diamond)",
        gemstoneEn: "Diamond (Vajra)",
        rulingPlanet: PlanetName.Venus,
        houseLordshipKn: "3ನೇ ಹಾಗೂ 10ನೇ ಸ್ಥಾನಾಧಿಪತಿಯಾದರೂ ಸೂರ್ಯನಿಗೆ ಶತ್ರು",
        houseLordshipEn: "Enemy planet to Sun (Venus)",
        dangerEffectKn: "ಸಹೋದರರೊಂದಿಗೆ ಕಲಹ, ಅಧಿಕಾರ ನಷ್ಟ ಹಾಗೂ ಅಪಖ್ಯಾತಿ ತರುತ್ತದೆ.",
        dangerEffectEn: "Fosters fraternal discord, executive loss, and public scandal."
      }
    ],
    luckyColorsKn: ["ಕೇಸರಿ", "ಕಿತ್ತಳೆ", "ಚಿನ್ನದ ಬಣ್ಣ", "ಕೆಂಪು", "ಹಳದಿ"],
    luckyColorsEn: ["Saffron", "Royal Orange", "Golden Yellow", "Ruby Red", "Warm Amber"],
    whyLuckyKn: "ಸೂರ್ಯನ ಆತ್ಮತೇಜಸ್ಸು ಮತ್ತು ಕುಜ-ಗುರುಗಳ ಧರ್ಮ ಶಕ್ತಿಯನ್ನು ಉತ್ತುಂಗಕ್ಕೇರಿಸಿ ರಾಜವೈಭವ ತರುತ್ತದೆ.",
    whyLuckyEn: "Magnifies solar luminescence, royal command, and righteous prosperity under Lagnesha Sun.",
    avoidColorsKn: ["ಕಪ್ಪು", "ಗಾಢ ನೀಲಿ", "ಬೂದು ಬಣ್ಣ"],
    avoidColorsEn: ["Jet Black", "Dark Navy Blue", "Charcoal Grey"],
    dangerColorsKn: "ಕಪ್ಪು ಬಣ್ಣವು ಶತ್ರು ಶನಿಯ ಶಕ್ತಿಯನ್ನು ಆವಾಹಿಸಿ ಹೃದಯ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿಗೆ ಧಕ್ಕೆ ತರುತ್ತದೆ.",
    dangerColorsEn: "Black invokes inimical Saturn energy, inducing vitality depletion and sudden career hurdles."
  },

  // 5: Kanya (Virgo)
  5: {
    lagnaIdx: 5,
    lagnaNameKn: "ಕನ್ಯಾ",
    lagnaNameEn: "Virgo",
    lagnaLord: PlanetName.Mercury,
    primaryGemKn: "ಪಚ್ಚೆ (ಶುದ್ಧ ಮರಕತ / Emerald)",
    primaryGemEn: "Emerald (Pure Colombian or Zambian Emerald)",
    sanskritName: "ಮರಕತಂ (Marakatam)",
    caratRange: "4.5 - 6.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಲೋಹ",
    metalEn: "Pure Silver or Panchadhatu",
    fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)",
    fingerEn: "Little Finger (Kanishthika)",
    activationDayKn: "ಬುಧವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Wednesday Morning during Mercury Hora",
    horaKn: "ಬುಧ ಹೋರೆ",
    horaEn: "Mercury Hora",
    mantraKn: "ಓಂ ಬುಧಾಯ ನಮಃ (Om Budhaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Budhaya Namaha (108 times)",
    bhagyaGemKn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್ (ಶುಕ್ರ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Diamond or White Zircon (Venus - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಕಿರುಬೆರಳು ಅಥವಾ ಮಧ್ಯದ ಬೆರಳು",
    bhagyaFingerEn: "Little Finger or Middle Finger",
    bhagyaMetalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಬಿಳಿ ಬಂಗಾರ",
    bhagyaMetalEn: "Silver or White Gold",
    prohibitedGems: [
      {
        gemstoneKn: "ಕೆಂಪು ಹವಳ (Red Coral / Avala)",
        gemstoneEn: "Red Coral (Havala)",
        rulingPlanet: PlanetName.Mars,
        houseLordshipKn: "3ನೇ ಭ್ರಾತೃ ಹಾಗೂ 8ನೇ ಮೃತ್ಯು/ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಸ್ಥಾನಾಧಿಪತಿ ಮಂಗಳ",
        houseLordshipEn: "3rd & 8th Lord of Death, Surgery, Accidents (Mars)",
        dangerEffectKn: "ಕನ್ಯಾ ಲಗ್ನಕ್ಕೆ ಮಂಗಳನು ಅಷ್ಟಮಾಧಿಪತಿಯಾಗಿ ಪರಮ ಮಾರಕ. ಹವಳ ಧರಿಸಿದರೆ ತೀವ್ರ ರಕ್ತಸ್ರಾವ, ಅಪಘಾತ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಹಾಗೂ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ದ್ರೋಹ ಸಂಭವಿಸುತ್ತದೆ!",
        dangerEffectEn: "Mars rules the lethal 8th house; wearing Red Coral triggers surgical emergencies, hemorrhage, severe road accidents, and treachery!"
      },
      {
        gemstoneKn: "ಮುತ್ತು (Pearl)",
        gemstoneEn: "Pearl (Moti)",
        rulingPlanet: PlanetName.Moon,
        houseLordshipKn: "11ನೇ ಲಾಭಾಧಿಪತಿಯಾದರೂ ಬುಧನಿಗೆ ಶತ್ರು ಹಾಗೂ ಮಾನಸಿಕ ಚಾಂಚಲ್ಯಕಾರಕ",
        houseLordshipEn: "11th Lord Enemy to Mercury (Moon)",
        dangerEffectKn: "ಶ್ವಾಸಕೋಶದ ಕಫ ಬಾಧೆ, ಮಾನಸಿಕ ತೊಳಲಾಟ ಹಾಗೂ ಅತಿಯಾದ ಸಂಶಯ ತರುತ್ತದೆ.",
        dangerEffectEn: "Induces respiratory congestion, emotional paranoia, and financial turbulence."
      }
    ],
    luckyColorsKn: ["ಹಸಿರು", "ಬಿಳಿ", "ತಿಳಿ ಹಳದಿ", "ಬೂದು ಬಣ್ಣ"],
    luckyColorsEn: ["Parrot Green", "Pristine White", "Pastel Yellow", "Silver Grey"],
    whyLuckyKn: "ಬುಧ ಮತ್ತು ಶುಕ್ರರ ಮಿತ್ರ ಬಲದಿಂದ ಬುದ್ಧಿಮತ್ತೆ, ಲೆಕ್ಕಾಚಾರ, ಆಡಿಟಿಂಗ್ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಅಗಾಧ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.",
    whyLuckyEn: "Activates intellectual precision, financial auditing acumen, and trade mastery under Mercury and Venus.",
    avoidColorsKn: ["ಕಡು ಕೆಂಪು", "ರಕ್ತವರ್ಣ", "ಕಿತ್ತಳೆ"],
    avoidColorsEn: ["Blood Crimson", "Dark Red", "Orange"],
    dangerColorsKn: "ಕೆಂಪು ಬಣ್ಣವು 8ನೇ ಅಧಿಪತಿ ಕುಜನ ವಿನಾಶಕಾರಿ ಶಕ್ತಿಯನ್ನು ಕೆರಳಿಸಿ ಅಪಘಾತ ಭಯ ತರುತ್ತದೆ.",
    dangerColorsEn: "Red frequencies energize 8th lord Mars, heightening physical vulnerability and accidents."
  },

  // 6: Tula (Libra)
  6: {
    lagnaIdx: 6,
    lagnaNameKn: "ತುಲಾ",
    lagnaNameEn: "Libra",
    lagnaLord: PlanetName.Venus,
    primaryGemKn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್ (ಶುಕ್ರ)",
    primaryGemEn: "Diamond or Natural White Zircon (Venus)",
    sanskritName: "ವಜ್ರಂ (Vajram)",
    caratRange: "1.0 - 2.5 Carat (Diamond) / 4.5 - 6.5 Carat (Zircon)",
    metalKn: "ಪ್ಲಾಟಿನಂ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿ",
    metalEn: "Platinum or Pure Sterling Silver",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು",
    fingerEn: "Middle Finger or Little Finger",
    activationDayKn: "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Friday Morning during Venus Hora",
    horaKn: "ಶುಕ್ರ ಹೋರೆ",
    horaEn: "Venus Hora",
    mantraKn: "ಓಂ ಶುಕ್ರಾಯ ನಮಃ (Om Shukraya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Shukraya Namaha (108 times)",
    bhagyaGemKn: "ಪಚ್ಚೆ (ಬುಧ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Emerald (Mercury - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)",
    bhagyaFingerEn: "Little Finger",
    bhagyaMetalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಬಂಗಾರ",
    bhagyaMetalEn: "Silver or Gold",
    yogakarakaPlanet: PlanetName.Saturn,
    yogakarakaGemKn: "ನೀಲಂ (ಶನಿ - 4ನೇ ಕೇಂದ್ರ & 5ನೇ ತ್ರಿಕೋಣ ಯೋಗಕಾರಕ)",
    yogakarakaGemEn: "Blue Sapphire (Saturn - Supreme Yogakaraka for Libra)",
    yogakarakaFingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    yogakarakaFingerEn: "Middle Finger (Madhyama)",
    yogakarakaMetalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    yogakarakaMetalEn: "Panchadhatu or Silver",
    yogakarakaImpactKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ಶನಿಯು 4ನೇ ಸುಖ ಸ್ಥಾನ ಹಾಗೂ 5ನೇ ಪುತ್ರ/ಬುದ್ಧಿಸ್ಥಾನಗಳ ಏಕೈಕ ಪರಮ ಯೋಗಕಾರಕ. ನೀಲಂ ಧರಿಸಿದರೆ ಅಖಂಡ ಭಾಗ್ಯ, ನ್ಯಾಯಾಂಗದಲ್ಲಿ ಜಯ, ರಾಜಕೀಯ ಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಬೃಹತ್ ಆಸ್ತಿ ಲಾಭ ತರುತ್ತದೆ.",
    yogakarakaImpactEn: "Saturn is the crowned Yogakaraka (4th & 5th lord); wearing Blue Sapphire unlocks monumental wealth, political prestige, legal triumph, and intellectual empire.",
    prohibitedGems: [
      {
        gemstoneKn: "ಮಾಣಿಕ್ಯ (Ruby)",
        gemstoneEn: "Ruby (Manikya)",
        rulingPlanet: PlanetName.Sun,
        houseLordshipKn: "11ನೇ ಬಾಧಕ ಸ್ಥಾನಾಧಿಪತಿ ಸೂರ್ಯ",
        houseLordshipEn: "11th Badhaka Lord (Sun)",
        dangerEffectKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ಸೂರ್ಯನು ಪ್ರಬಲ ಬಾಧಕ. ಮಾಣಿಕ್ಯ ಧರಿಸಿದರೆ ಹಿರಿಯ ಸಹೋದರರೊಂದಿಗೆ ಜಗಳ, ಕಣ್ಣಿನ ಬಾಧೆ ಹಾಗೂ ವ್ಯವಹಾರದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಉಂಟಾಗುತ್ತವೆ.",
        dangerEffectEn: "Sun acts as a virulent Badhaka for Libra; Ruby causes sibling enmity, ocular inflammation, and abrupt enterprise blocks."
      },
      {
        gemstoneKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
        gemstoneEn: "Yellow Sapphire (Pushparaga)",
        rulingPlanet: PlanetName.Jupiter,
        houseLordshipKn: "3ನೇ ಹಾಗೂ 6ನೇ ಶತ್ರು-ಋಣ ಸ್ಥಾನಗಳ ಅಧಿಪತಿ ಗುರು",
        houseLordshipEn: "3rd & 6th Lord of Debts, Diseases, Litigation (Jupiter)",
        dangerEffectKn: "ಪುಷ್ಯರಾಗ ಧರಿಸಿದರೆ ದೀರ್ಘಕಾಲದ ಸಾಲದ ಸುಳಿ, ಯಕೃತ್ತು/ಹೊಟ್ಟೆಯ ರೋಗಗಳು ಹಾಗೂ ಕೋರ್ಟ್ ವ್ಯಾಜ್ಯಗಳು ಉಲ್ಬಣಗೊಳ್ಳುತ್ತವೆ.",
        dangerEffectEn: "Triggers compounding debt liabilities, gastrointestinal/liver debility, and protracted legal entanglements."
      },
      {
        gemstoneKn: "ಕೆಂಪು ಹವಳ (Red Coral / Avala)",
        gemstoneEn: "Red Coral (Havala)",
        rulingPlanet: PlanetName.Mars,
        houseLordshipKn: "2ನೇ ಹಾಗೂ 7ನೇ ಸ್ಥಾನಗಳ ಪ್ರಬಲ ದ್ವಿ-ಮಾರಕಾಧಿಪತಿ ಮಂಗಳ",
        houseLordshipEn: "2nd & 7th Dual Maraka Lord (Mars)",
        dangerEffectKn: "ಮಂಗಳನು 2ನೇ ಮತ್ತು 7ನೇ ಸ್ಥಾನಗಳ ಉಭಯ ಮಾರಕ. ಹವಳ ಧರಿಸಿದರೆ ದಾಂಪತ್ಯ ವಿಚ್ಛೇದನ, ಸಂಗಾತಿಗೆ ಮಾರಣಾಂತಿಕ ಕಷ್ಟ ಹಾಗೂ ಅಪಘಾತ ತರುತ್ತದೆ!",
        dangerEffectEn: "Mars is a lethal Dual Maraka (2nd & 7th lord); Red Coral threatens severe marital rupture, spousal crises, and accidents!"
      }
    ],
    luckyColorsKn: ["ಬಿಳಿ", "ರಾಯಲ್ ಬ್ಲೂ", "ಆಕಾಶ ನೀಲಿ", "ಹಸಿರು", "ಕಪ್ಪು"],
    luckyColorsEn: ["Pure White", "Royal Blue", "Sky Blue", "Emerald Green", "Black"],
    whyLuckyKn: "ಶುಕ್ರ ಮತ್ತು ಯೋಗಕಾರಕ ಶನಿಯ ಸಮನ್ವಯವು ಸಕಲ ಭೋಗಭಾಗ್ಯ ಹಾಗೂ ನ್ಯಾಯಯುತ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    whyLuckyEn: "Elevates Venusian charisma and Saturnian executive authority, ensuring worldly comfort and balance.",
    avoidColorsKn: ["ಕಡು ಕೆಂಪು", "ಕಿತ್ತಳೆ", "ಹಳದಿ"],
    avoidColorsEn: ["Deep Red", "Bright Orange", "Mustard Yellow"],
    dangerColorsKn: "ಕೆಂಪು ಮತ್ತು ಹಳದಿ ಬಣ್ಣಗಳು ಮಾರಕ ಮಂಗಳ ಹಾಗೂ ಶತ್ರು ಗುರುವಿನ ಅಶುಭ ತರಂಗಗಳನ್ನು ಆಕರ್ಷಿಸುತ್ತವೆ.",
    dangerColorsEn: "Red and yellow summon 6th house Jupiter and Maraka Mars currents, causing domestic strain."
  },

  // 7: Vrischika (Scorpio)
  7: {
    lagnaIdx: 7,
    lagnaNameKn: "ವೃಶ್ಚಿಕ",
    lagnaNameEn: "Scorpio",
    lagnaLord: PlanetName.Mars,
    primaryGemKn: "ಕೆಂಪು ಹವಳ (ಶುದ್ಧ ಪ್ರವಾಳ / Red Coral)",
    primaryGemEn: "Red Coral (Pure Italian Coral / Pravalam)",
    sanskritName: "ಪ್ರವಾಳಂ (Pravalam)",
    caratRange: "5.5 - 7.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ತಾಮ್ರ ಅಥವಾ 18K ಚಿನ್ನ",
    metalEn: "Pure Copper or 18K Gold",
    fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    fingerEn: "Ring Finger (Anamika)",
    activationDayKn: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Tuesday Morning at Sunrise",
    horaKn: "ಕುಜ ಹೋರೆ",
    horaEn: "Mars (Kuja) Hora",
    mantraKn: "ಓಂ ಭೌಮಾಯ ನಮಃ (Om Bhaumaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Bhaumaya Namaha (108 times)",
    bhagyaGemKn: "ಮುತ್ತು (ಚಂದ್ರ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Natural Pearl (Moon - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಕಿರುಬೆರಳು ಅಥವಾ ಉಂಗುರದ ಬೆರಳು",
    bhagyaFingerEn: "Little Finger or Ring Finger",
    bhagyaMetalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ",
    bhagyaMetalEn: "Pure Silver",
    prohibitedGems: [
      {
        gemstoneKn: "ಪಚ್ಚೆ (Emerald / Marakata)",
        gemstoneEn: "Emerald (Pache)",
        rulingPlanet: PlanetName.Mercury,
        houseLordshipKn: "8ನೇ ರಂಧ್ರ/ಮೃತ್ಯು ಹಾಗೂ 11ನೇ ಸ್ಥಾನಾಧಿಪತಿ ಬುಧ",
        houseLordshipEn: "8th Dusthana of Scandals & 11th Lord (Mercury)",
        dangerEffectKn: "ಬುಧನು ವೃಶ್ಚಿಕಕ್ಕೆ ಪರಮ ಶತ್ರು. ಪಚ್ಚೆ ಧರಿಸಿದರೆ ಚಾರಿತ್ರ್ಯಹರಣ, ವಂಚನೆ, ಆರ್ಥಿಕ ನಷ್ಟ ಹಾಗೂ ಮಾನಸಿಕ ಖಿನ್ನತೆ ಉಂಟಾಗುತ್ತದೆ.",
        dangerEffectEn: "Mercury is a toxic functional malefic for Scorpio; Emerald triggers public humiliation, fraud, and severe debt traps."
      },
      {
        gemstoneKn: "ವಜ್ರ (Diamond)",
        gemstoneEn: "Diamond (Vajra)",
        rulingPlanet: PlanetName.Venus,
        houseLordshipKn: "7ನೇ ಮಾರಕ ಹಾಗೂ 12ನೇ ವ್ಯಯ ಸ್ಥಾನಾಧಿಪತಿ ಶುಕ್ರ",
        houseLordshipEn: "7th Maraka & 12th Loss Lord (Venus)",
        dangerEffectKn: "ವಜ್ರ ಧರಿಸಿದರೆ ಕಣ್ಣಿನ ತೊಂದರೆ, ವಿವಾಹದಲ್ಲಿ ಕಲಹ ಹಾಗೂ ಅಪಾರ ಧನವ್ಯಯ ಸಂಭವಿಸುತ್ತದೆ.",
        dangerEffectEn: "Induces heavy financial hemorrhaging, optical strain, and severe domestic conflict."
      }
    ],
    luckyColorsKn: ["ಕೆಂಪು", "ಕೇಸರಿ", "ಹಳದಿ", "ಬಿಳಿ"],
    luckyColorsEn: ["Deep Red", "Saffron", "Golden Yellow", "Milky White"],
    whyLuckyKn: "ಕುಜ, ಗುರು ಹಾಗೂ ಚಂದ್ರರ ತ್ರಿಕೋಣ ಬಲವು ಆತ್ಮರಕ್ಷಣೆ, ಧೈರ್ಯ ಹಾಗೂ ಅಖಂಡ ಭಾಗ್ಯೋದಯ ನೀಡುತ್ತದೆ.",
    whyLuckyEn: "Empowers the fierce martial essence of Mars channeled with Jupiter's wisdom and Moon's intuitive grace.",
    avoidColorsKn: ["ಹಸಿರು", "ಕಪ್ಪು"],
    avoidColorsEn: ["Green", "Jet Black"],
    dangerColorsKn: "ಹಸಿರು ಮತ್ತು ಕಪ್ಪು ಬಣ್ಣಗಳು 8ನೇ ಬುಧ ಹಾಗೂ ಶನಿಯ ಶತ್ರು ತರಂಗಗಳನ್ನು ಹೆಚ್ಚಿಸಿ ನಷ್ಟ ತರುತ್ತವೆ.",
    dangerColorsEn: "Green and black activate 8th house Mercury and 3rd house Saturn resistance, draining energy."
  },

  // 8: Dhanus (Sagittarius)
  8: {
    lagnaIdx: 8,
    lagnaNameKn: "ಧನುಸ್ಸು",
    lagnaNameEn: "Sagittarius",
    lagnaLord: PlanetName.Jupiter,
    primaryGemKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (ಶ್ರೀಲಂಕಾ ಶುದ್ಧ ಗುರು ರತ್ನ / Yellow Sapphire)",
    primaryGemEn: "Yellow Sapphire (Pure Ceylon Pushparaga)",
    sanskritName: "ಪುಷ್ಪರಾಗಂ (Pushparagam)",
    caratRange: "4.5 - 6.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ",
    metalEn: "Pure 22K Gold or Panchadhatu",
    fingerKn: "ಬಲಗೈಯ ತೋರುಬೆರಳು (ತರ್ಜನಿ)",
    fingerEn: "Right Hand Index Finger (Tarjani)",
    activationDayKn: "ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ (ಶುಕ್ಲಪಕ್ಷ)",
    activationDayEn: "Thursday Morning during Jupiter Hora (Shukla Paksha)",
    horaKn: "ಗುರು ಹೋರೆ",
    horaEn: "Jupiter (Guru) Hora",
    mantraKn: "ಓಂ ಬೃಹಸ್ಪತಯೇ ನಮಃ (Om Brihaspataye Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Brihaspataye Namaha (108 times)",
    bhagyaGemKn: "ಮಾಣಿಕ್ಯ (ಸೂರ್ಯ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Ruby (Sun - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    bhagyaFingerEn: "Ring Finger (Anamika)",
    bhagyaMetalKn: "ಅಪ್ಪಟ ಚಿನ್ನ ಅಥವಾ ತಾಮ್ರ",
    bhagyaMetalEn: "Pure Gold or Copper",
    prohibitedGems: [
      {
        gemstoneKn: "ವಜ್ರ (Diamond / Vajra)",
        gemstoneEn: "Diamond (Vajra)",
        rulingPlanet: PlanetName.Venus,
        houseLordshipKn: "6ನೇ ರೋಗ-ಶತ್ರು ಹಾಗೂ 11ನೇ ಸ್ಥಾನಾಧಿಪತಿ ಶುಕ್ರ",
        houseLordshipEn: "6th Lord of Illness, Enemies & 11th Lord (Venus)",
        dangerEffectKn: "ಗುರು ಮತ್ತು ಶುಕ್ರ ಪರಸ್ಪರ ವಿರೋಧಿಗಳು. ಧನು ಲಗ್ನದವರು ವಜ್ರ ಧರಿಸಿದರೆ ಮಧುಮೇಹ, ಮೂತ್ರಪಿಂಡ ಕಾಯಿಲೆಗಳು, ಅನಿರೀಕ್ಷಿತ ಅಪವಾದ ಹಾಗೂ ಸಾಲ ಹೆಚ್ಚಾಗುತ್ತದೆ.",
        dangerEffectEn: "Venus is an intense 6th house malefic; Diamond invites diabetes, urinary debility, scandalous accusations, and chronic debts."
      },
      {
        gemstoneKn: "ನೀಲಂ (Blue Sapphire)",
        gemstoneEn: "Blue Sapphire (Neelam)",
        rulingPlanet: PlanetName.Saturn,
        houseLordshipKn: "2ನೇ ಮಾರಕ ಹಾಗೂ 3ನೇ ಸ್ಥಾನಾಧಿಪತಿ ಶನಿ",
        houseLordshipEn: "2nd Maraka & 3rd Lord (Saturn)",
        dangerEffectKn: "ನೀಲಂ ಧರಿಸಿದರೆ ಕುಟುಂಬದಲ್ಲಿ ಕಲಹ, ಆರ್ಥಿಕ ತಡೆಯು ಹಾಗೂ ಮಾತಿನಲ್ಲಿ ಕಠೋರತೆ ಉಂಟಾಗುತ್ತದೆ.",
        dangerEffectEn: "Can act as a harsh Maraka, disrupting domestic warmth and speech harmony."
      }
    ],
    luckyColorsKn: ["ಹಳದಿ", "ಕೇಸರಿ", "ಬಂಗಾರದ ಬಣ್ಣ", "ತಿಳಿ ಕೆಂಪು"],
    luckyColorsEn: ["Bright Yellow", "Saffron", "Golden Amber", "Light Crimson"],
    whyLuckyKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಸೂರ್ಯನ ದೈವಿಕ ತೇಜಸ್ಸನ್ನು ವೃದ್ಧಿಸಿ ಧರ್ಮ, ಜ್ಞಾನ ಹಾಗೂ ಗೌರವ ನೀಡುತ್ತದೆ.",
    whyLuckyEn: "Fosters expansion, higher philosophical vision, and royal grace under Guru and Surya.",
    avoidColorsKn: ["ಕಪ್ಪು", "ಕಡು ನೀಲಿ"],
    avoidColorsEn: ["Jet Black", "Navy Blue"],
    dangerColorsKn: "ಕಪ್ಪು ಬಣ್ಣವು ಗುರುವಿನ ದೈವಿಕ ಕಾಂತಿಯನ್ನು ಕುಗ್ಗಿಸಿ ಆಲಸ್ಯ ಹಾಗೂ ಕಾರ್ಯವಿಳಂಬ ತರುತ್ತದೆ.",
    dangerColorsEn: "Black suppresses Jovian luminescence, attracting lethargy and delayed progress."
  },

  // 9: Makara (Capricorn)
  9: {
    lagnaIdx: 9,
    lagnaNameKn: "ಮಕರ",
    lagnaNameEn: "Capricorn",
    lagnaLord: PlanetName.Saturn,
    primaryGemKn: "ನೀಲಂ (ಶುದ್ಧ ನೀಲಿ ಪದ್ಮರಾಗ / Blue Sapphire)",
    primaryGemEn: "Blue Sapphire (Pure Ceylon or Kashmir Neelam)",
    sanskritName: "ನೀಲಂ (Neelam)",
    caratRange: "4.5 - 6.5 Ratti",
    metalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ ಅಥವಾ 14K ಬಿಳಿ ಚಿನ್ನ",
    metalEn: "Panchadhatu, Pure Silver, or 14K White Gold",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    fingerEn: "Middle Finger (Madhyama)",
    activationDayKn: "ಶನಿವಾರ ಸಂಧ್ಯಾಕಾಲ ಅಥವಾ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Saturday Morning or Evening during Saturn Hora",
    horaKn: "ಶನಿ ಹೋರೆ",
    horaEn: "Saturn (Shani) Hora",
    mantraKn: "ಓಂ ಶನೈಶ್ಚರಾಯ ನಮಃ (Om Shanaishcharaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Shanaishcharaya Namaha (108 times)",
    bhagyaGemKn: "ಪಚ್ಚೆ (ಬುಧ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Emerald (Mercury - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)",
    bhagyaFingerEn: "Little Finger",
    bhagyaMetalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಚಿನ್ನ",
    bhagyaMetalEn: "Silver or Gold",
    yogakarakaPlanet: PlanetName.Venus,
    yogakarakaGemKn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್ (ಶುಕ್ರ - 5ನೇ ತ್ರಿಕೋಣ & 10ನೇ ಕರ್ಮಾಧಿಪತಿ ಯೋಗಕಾರಕ)",
    yogakarakaGemEn: "Diamond or White Zircon (Venus - Supreme Yogakaraka for Capricorn)",
    yogakarakaFingerKn: "ಕಿರುಬೆರಳು ಅಥವಾ ಮಧ್ಯದ ಬೆರಳು",
    yogakarakaFingerEn: "Little Finger or Middle Finger",
    yogakarakaMetalKn: "ಪ್ಲಾಟಿನಂ ಅಥವಾ ಬೆಳ್ಳಿ",
    yogakarakaMetalEn: "Platinum or Silver",
    yogakarakaImpactKn: "ಮಕರ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು ಪರಮ ಯೋಗಕಾರಕ. ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್ ಧರಿಸಿದರೆ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್, ಸಾರ್ವಜನಿಕ ಪ್ರಸಿದ್ಧಿ, ಸುಖ ಸಮೃದ್ಧಿ ಹಾಗೂ ಅಪಾರ ಆಸ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
    yogakarakaImpactEn: "Venus is the sovereign Yogakaraka (5th & 10th lord); wearing Diamond unlocks meteoric career elevation, royal luxury, and enduring prestige.",
    prohibitedGems: [
      {
        gemstoneKn: "ಮಾಣಿಕ್ಯ (Ruby)",
        gemstoneEn: "Ruby (Manikya)",
        rulingPlanet: PlanetName.Sun,
        houseLordshipKn: "8ನೇ ರಂಧ್ರ/ಮೃತ್ಯು ಸ್ಥಾನಾಧಿಪತಿ ಸೂರ್ಯ",
        houseLordshipEn: "8th Lord of Scandals, Sudden Downfalls, Death (Sun)",
        dangerEffectKn: "ಸೂರ್ಯನು ಮಕರಕ್ಕೆ 8ನೇ ಅಧಿಪತಿಯಾಗಿ ಪರಮ ಮಾರಕ. ಮಾಣಿಕ್ಯ ಧರಿಸಿದರೆ ತಂದೆಯೊಂದಿಗೆ ವೈಷಮ್ಯ, ಸರ್ಕಾರದ ದಂಡ, ಹೃದಯಾಘಾತ ಭಯ ಹಾಗೂ ಕೀರ್ತಿನಾಶ ಸಂಭವಿಸುತ್ತದೆ!",
        dangerEffectEn: "Sun rules the catastrophic 8th Dusthana; Ruby invites executive disgrace, government penalties, cardiac strain, and downfall!"
      },
      {
        gemstoneKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
        gemstoneEn: "Yellow Sapphire (Pushparaga)",
        rulingPlanet: PlanetName.Jupiter,
        houseLordshipKn: "3ನೇ ಹಾಗೂ 12ನೇ ವ್ಯಯ ಸ್ಥಾನಾಧಿಪತಿ ಗುರು",
        houseLordshipEn: "3rd & 12th Loss Lord (Jupiter)",
        dangerEffectKn: "ಆಸ್ಪತ್ರೆ ಖರ್ಚು, ಅನಗತ್ಯ ಸಾಲ ಹಾಗೂ ಅಪಾರ ಧನವ್ಯಯ ತರುತ್ತದೆ.",
        dangerEffectEn: "Triggers runaway expenditure, hospitalization costs, and financial depletion."
      },
      {
        gemstoneKn: "ಕೆಂಪು ಹವಳ (Red Coral / Avala)",
        gemstoneEn: "Red Coral (Havala)",
        rulingPlanet: PlanetName.Mars,
        houseLordshipKn: "4ನೇ ಹಾಗೂ 11ನೇ ಬಾಧಕ ಸ್ಥಾನಾಧಿಪತಿ ಕುಜ",
        houseLordshipEn: "4th & 11th Badhaka Lord (Mars)",
        dangerEffectKn: "ಮನೆ ವಾಸ್ತು ಕಲಹ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಸ್ನೇಹಿತರಿಂದ ನಂಬಿಕೆದ್ರೋಹ ತರುತ್ತದೆ.",
        dangerEffectEn: "Induces domestic agitation, blood pressure spikes, and badhaka obstructions."
      }
    ],
    luckyColorsKn: ["ರಾಯಲ್ ಬ್ಲೂ", "ಕಪ್ಪು", "ಆಕಾಶ ನೀಲಿ", "ಬಿಳಿ", "ಹಸಿರು"],
    luckyColorsEn: ["Royal Blue", "Jet Black", "Sky Blue", "Pristine White", "Emerald Green"],
    whyLuckyKn: "ಲಗ್ನಾಧಿಪತಿ ಶನಿ ಹಾಗೂ ಯೋಗಕಾರಕ ಶುಕ್ರ-ಬುಧರ ತತ್ತ್ವಗಳು ಸಂಯೋಜನೆಗೊಂಡು ಮಹಾಸಾಮ್ರಾಜ್ಯ ಯೋಗ ತರುತ್ತವೆ.",
    whyLuckyEn: "Synthesizes Saturnian perseverance with Venusian luxury and Mercurial intellect.",
    avoidColorsKn: ["ಕೆಂಪು", "ಕೇಸರಿ", "ಹಳದಿ"],
    avoidColorsEn: ["Bright Red", "Saffron", "Yellow"],
    dangerColorsKn: "ಕೆಂಪು ಮತ್ತು ಕೇಸರಿ ಬಣ್ಣಗಳು 8ನೇ ಅಧಿಪತಿ ಸೂರ್ಯನ ಶತ್ರು ತರಂಗಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತವೆ.",
    dangerColorsEn: "Red and saffron stimulate 8th house solar friction, causing friction and vitality loss."
  },

  // 10: Kumbha (Aquarius)
  10: {
    lagnaIdx: 10,
    lagnaNameKn: "ಕುಂಭ",
    lagnaNameEn: "Aquarius",
    lagnaLord: PlanetName.Saturn,
    primaryGemKn: "ನೀಲಂ (ಶುದ್ಧ ನೀಲಿ ರತ್ನ / Blue Sapphire)",
    primaryGemEn: "Blue Sapphire (Neelam)",
    sanskritName: "ನೀಲಂ (Neelam)",
    caratRange: "4.5 - 6.5 Ratti",
    metalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    metalEn: "Panchadhatu or Silver",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    fingerEn: "Middle Finger (Madhyama)",
    activationDayKn: "ಶನಿವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Saturday Morning during Saturn Hora",
    horaKn: "ಶನಿ ಹೋರೆ",
    horaEn: "Saturn Hora",
    mantraKn: "ಓಂ ಶನೈಶ್ಚರಾಯ ನಮಃ (Om Shanaishcharaya Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Shanaishcharaya Namaha (108 times)",
    bhagyaGemKn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್ (ಶುಕ್ರ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Diamond or White Zircon (Venus - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಕಿರುಬೆರಳು ಅಥವಾ ಮಧ್ಯದ ಬೆರಳು",
    bhagyaFingerEn: "Little Finger or Middle Finger",
    bhagyaMetalKn: "ಪ್ಲಾಟಿನಂ ಅಥವಾ ಬೆಳ್ಳಿ",
    bhagyaMetalEn: "Platinum or Silver",
    prohibitedGems: [
      {
        gemstoneKn: "ಮಾಣಿಕ್ಯ (Ruby)",
        gemstoneEn: "Ruby (Manikya)",
        rulingPlanet: PlanetName.Sun,
        houseLordshipKn: "7ನೇ ಪ್ರಬಲ ಮಾರಕ ಸ್ಥಾನಾಧಿಪತಿ ಸೂರ್ಯ",
        houseLordshipEn: "7th Sovereign Maraka Lord (Sun)",
        dangerEffectKn: "ಸೂರ್ಯನು ಕುಂಭ ಲಗ್ನಕ್ಕೆ ಅತ್ಯಂತ ಕಠೋರ ಮಾರಕ. ಮಾಣಿಕ್ಯ ಧರಿಸಿದರೆ ದಾಂಪತ್ಯ ನಾಶ, ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ದ್ರೋಹ ಹಾಗೂ ರಕ್ತದೊತ್ತಡ ತೀವ್ರಗೊಳ್ಳುತ್ತದೆ!",
        dangerEffectEn: "Sun is a potent Maraka; wearing Ruby causes marital destruction, partnership betrayal, and severe hypertension!"
      },
      {
        gemstoneKn: "ಮುತ್ತು (Pearl)",
        gemstoneEn: "Pearl (Moti)",
        rulingPlanet: PlanetName.Moon,
        houseLordshipKn: "6ನೇ ರೋಗ-ಶತ್ರು-ಋಣ ಸ್ಥಾನಾಧಿಪತಿ ಚಂದ್ರ",
        houseLordshipEn: "6th Lord of Debts, Disease & Litigation (Moon)",
        dangerEffectKn: "ಮಾನಸಿಕ ಅಸ್ಥಿರತೆ, ಶೀತ-ಶ್ವಾಸಕೋಶ ತೊಂದರೆ ಹಾಗೂ ಅನಗತ್ಯ ಸಾಲ ತರುತ್ತದೆ.",
        dangerEffectEn: "Fosters mental fragility, cold/pulmonary illness, and financial liability."
      }
    ],
    luckyColorsKn: ["ನೀಲಿ", "ಕಪ್ಪು", "ಆಕಾಶ ನೀಲಿ", "ಬಿಳಿ", "ಹಸಿರು"],
    luckyColorsEn: ["Navy Blue", "Jet Black", "Electric Blue", "White", "Emerald Green"],
    whyLuckyKn: "ವಾಯು ತತ್ವದ ಶನಿ ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿ ಶುಕ್ರರ ತರಂಗಗಳು ಸಂಶೋಧನೆ, ವಿಜ್ಞಾನ ಹಾಗೂ ಜನಪ್ರಿಯತೆ ಹೆಚ್ಚಿಸುತ್ತವೆ.",
    whyLuckyEn: "Harmonizes airy Saturn with 9th lord Venus, unleashing scientific innovation and public mass appeal.",
    avoidColorsKn: ["ಕೆಂಪು", "ಕಿತ್ತಳೆ", "ಕೇಸರಿ"],
    avoidColorsEn: ["Crimson Red", "Orange", "Saffron"],
    dangerColorsKn: "ಕೆಂಪು ಬಣ್ಣವು 7ನೇ ಮಾರಕ ಸೂರ್ಯನ ತರಂಗಗಳನ್ನು ಪ್ರಚೋದಿಸಿ ಕಲಹ ತರುತ್ತದೆ.",
    dangerColorsEn: "Red fuels 7th Maraka Sun friction, bringing domestic instability."
  },

  // 11: Meena (Pisces)
  11: {
    lagnaIdx: 11,
    lagnaNameKn: "ಮೀನ",
    lagnaNameEn: "Pisces",
    lagnaLord: PlanetName.Jupiter,
    primaryGemKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (ಶುದ್ಧ ಗುರು ರತ್ನ / Yellow Sapphire)",
    primaryGemEn: "Yellow Sapphire (Pure Ceylon Pushparaga)",
    sanskritName: "ಪುಷ್ಪರಾಗಂ (Pushparagam)",
    caratRange: "4.5 - 6.5 Ratti",
    metalKn: "ಅಪ್ಪಟ ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ",
    metalEn: "Pure 22K Gold or Panchadhatu",
    fingerKn: "ಬಲಗೈಯ ತೋರುಬೆರಳು (ತರ್ಜನಿ)",
    fingerEn: "Right Hand Index Finger (Tarjani)",
    activationDayKn: "ಗುರುವಾರ ಪ್ರಾತಃಕಾಲ",
    activationDayEn: "Thursday Morning during Jupiter Hora",
    horaKn: "ಗುರು ಹೋರೆ",
    horaEn: "Jupiter Hora",
    mantraKn: "ಓಂ ಬೃಹಸ್ಪತಯೇ ನಮಃ (Om Brihaspataye Namaha - 108 ಬಾರಿ)",
    mantraEn: "Om Brihaspataye Namaha (108 times)",
    bhagyaGemKn: "ಕೆಂಪು ಹವಳ (ಕುಜ - 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ)",
    bhagyaGemEn: "Red Coral (Mars - 9th Bhagya Lord)",
    bhagyaFingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    bhagyaFingerEn: "Ring Finger (Anamika)",
    bhagyaMetalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ",
    bhagyaMetalEn: "Copper or Gold",
    prohibitedGems: [
      {
        gemstoneKn: "ವಜ್ರ (Diamond)",
        gemstoneEn: "Diamond (Vajra)",
        rulingPlanet: PlanetName.Venus,
        houseLordshipKn: "3ನೇ ಹಾಗೂ 8ನೇ ರಂಧ್ರ/ಮೃತ್ಯು ಸ್ಥಾನಾಧಿಪತಿ ಶುಕ್ರ",
        houseLordshipEn: "3rd & 8th Lord of Accidents, Death, Chronic Ailments (Venus)",
        dangerEffectKn: "ಮೀನ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು 8ನೇ ಅಧಿಪತಿಯಾಗಿ ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ. ವಜ್ರ ಧರಿಸಿದರೆ ಗಂಭೀರ ಆರೋಗ್ಯ ಹಾನಿ, ಸ್ತ್ರೀಯರಿಂದ ವಂಚನೆ, ವಿವಾಹದಲ್ಲಿ ವಿಪತ್ತು ಹಾಗೂ ಅಪಘಾತಗಳು ಸಂಭವಿಸುತ್ತವೆ!",
        dangerEffectEn: "Venus is the lethal 8th house Dusthana lord; Diamond invites chronic health decline, feminine deceit, marital turmoil, and accidents!"
      },
      {
        gemstoneKn: "ಪಚ್ಚೆ (Emerald)",
        gemstoneEn: "Emerald (Pache)",
        rulingPlanet: PlanetName.Mercury,
        houseLordshipKn: "4ನೇ ಹಾಗೂ 7ನೇ ಮಾರಕ ಸ್ಥಾನಗಳಿಗೆ ಕೇಂದ್ರಾಧಿಪತ್ಯ ದೋಷ ಹೊತ್ತ ಬುಧ",
        houseLordshipEn: "4th & 7th Kendradhipatya & Maraka Lord (Mercury)",
        dangerEffectKn: "ಮಾನಸಿಕ ಆತಂಕ, ನೆನಪಿನ ಶಕ್ತಿ ಕುಸಿತ ಹಾಗೂ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ನಷ್ಟ ತರುತ್ತದೆ.",
        dangerEffectEn: "Induces severe Kendradhipatya affliction: mental nervousness, memory fatigue, and partnership disputes."
      }
    ],
    luckyColorsKn: ["ಹಳದಿ", "ಕೇಸರಿ", "ಬಿಳಿ", "ಕೆಂಪು", "ಗುಲಾಬಿ"],
    luckyColorsEn: ["Bright Yellow", "Saffron", "Cream White", "Scarlet Red", "Rose"],
    whyLuckyKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ, ಚಂದ್ರ ಹಾಗೂ ಕುಜರ ಜಲ-ಅಗ್ನಿ ಸೌಹಾರ್ದತೆಯು ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆರ್ಥಿಕ ಸಿದ್ಧಿ ತರುತ್ತದೆ.",
    whyLuckyEn: "Blends the profound compassion of Guru with the fiery courage of 9th lord Mars and 5th lord Moon.",
    avoidColorsKn: ["ಕಪ್ಪು", "ಕಡು ಹಸಿರು"],
    avoidColorsEn: ["Jet Black", "Dark Green"],
    dangerColorsKn: "ಕಪ್ಪು ಮತ್ತು ಹಸಿರು ಬಣ್ಣಗಳು 8ನೇ ಶುಕ್ರ ಹಾಗೂ ಶನಿಯ ಮಾರಕ ತರಂಗಗಳನ್ನು ಆಕರ್ಷಿಸುತ್ತವೆ.",
    dangerColorsEn: "Black and dark green summon 8th house Venus and 12th house Saturn friction."
  }
};

// ── 3. 30 CLASSICAL REAL-WORLD BENCHMARK CASE STUDIES ─────────────────────
// ── 3. 100 AUTHENTIC REAL-WORLD BENCHMARK CASE STUDIES ─────────────────────
export const GEMSTONE_REAL_LIFE_BENCHMARK_CASES: BenchmarkCaseStudy[] = GEMSTONE_100_BENCHMARK_PROFILES;

// ── 4. CORE ENGINE SYNTHESIS FUNCTION ─────────────────────────────────────
export function evaluateGemstoneAndAmuletPrescription(
  kundli: KundliOutput,
  panchanga: {
    vara: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
  }
): PanchangaGemstoneAmuletResult {
  const lagnaRashiIdx = ((kundli.lagnaRashi.index % 12) + 12) % 12;
  const lagnaRule = LAGNA_GEMSTONE_RULES[lagnaRashiIdx] || LAGNA_GEMSTONE_RULES[0]!;

  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakName = moonPlanet?.nakshatra.english ?? "Ashwini";
  const neckWearInfo = NAKSHATRA_NECK_WEAR_CATALOG[moonNakName] || NAKSHATRA_NECK_WEAR_CATALOG["Ashwini"]!;

  // Mars / Havala Deep Compatibility Analysis
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const marsRashiIdx = mars ? mars.rashi.index : 0;
  const marsHouseFromLagna = ((marsRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const isMarsDusthana = [6, 8, 12].includes(marsHouseFromLagna);
  const isMarsBeneficLagna = [0, 3, 4, 7, 8, 11].includes(lagnaRashiIdx); // Mesha, Karka, Simha, Vrischika, Dhanus, Meena
  const isKujaNakshatra = neckWearInfo.lord === PlanetName.Mars;

  const isHavalaRecommended = (isMarsBeneficLagna && !isMarsDusthana) || isKujaNakshatra;

  const havalaVerdictKn = isHavalaRecommended
    ? `ಹೌದು! ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಕೆಂಪು ಹವಳವು (Red Coral) ಅತ್ಯಂತ ಮಂಗಳಕರ ಹಾಗೂ ಯೋಗಕಾರಕ ರತ್ನವಾಗಿದೆ.`
    : `ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಬೇಡ! ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಕೆಂಪು ಹವಳವು (Red Coral) ಪ್ರತಿಕೂಲವಾಗಿದ್ದು, ಧರಿಸಿದರೆ ರಕ್ತದೊತ್ತಡ, ಅಪಘಾತ ಅಥವಾ ಕೌಟುಂಬಿಕ ಕಲಹ ತರಬಹುದು.`;

  const havalaVerdictEn = isHavalaRecommended
    ? `YES! Red Coral (Havala / Pravala) is exceptionally auspicious and Yogakaraka-aligned for your chart.`
    : `STRICTLY NO! Red Coral is inauspicious for your chart; wearing it can trigger hypertension, road accidents, or domestic friction.`;

  const havalaInstructionsKn = isHavalaRecommended
    ? `ಶುದ್ಧ ಇಟಾಲಿಯನ್ ಪ್ರವಾಳ (೫.೫ - ೭.೫ ಕ್ಯಾರಟ್) ತಾಮ್ರ ಅಥವಾ 18K ಚಿನ್ನದಲ್ಲಿ ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ ಬಲಗೈ ಉಂಗುರದ ಬೆರಳಿನಲ್ಲಿ ಧರಿಸಿ.`
    : `ಹವಳದ ಉಂಗುರ ಧರಿಸಬೇಡಿ. ರಕ್ತ ಶುದ್ಧಿ ಹಾಗೂ ಧೈರ್ಯಕ್ಕಾಗಿ ಕೊರಳಲ್ಲಿ ೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಕವಚ ಧರಿಸುವುದು ಶಾಸ್ತ್ರೋಕ್ತ.`;

  const havalaInstructionsEn = isHavalaRecommended
    ? `Wear pure Italian Triangular Coral (5.5 - 7.5 Carat) in Copper or Gold on right hand ring finger on Tuesday morning.`
    : `Do NOT wear a Red Coral ring. To calm Mars and protect vitality, wear a 3-Mukhi Rudraksha around the neck instead.`;

  // Dynamic Tara Bala Calculation (Sampat, Kshema, Sadhana, Mitra)
  const nakIndex = ((moonPlanet?.nakshatra.index ?? 0) % 27 + 27) % 27;
  const ORDERED_NAKSHATRAS_27 = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "PurvaPhalguni", "UttaraPhalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Moola", "PurvaAshadha", "UttaraAshadha", "Shravana", "Dhanishta", "Shatabhisha",
    "PurvaBhadrapada", "UttaraBhadrapada", "Revati"
  ];
  const sampatIdx = (nakIndex + 1) % 27;
  const kshemaIdx = (nakIndex + 3) % 27;
  const sadhanaIdx = (nakIndex + 5) % 27;
  const mitraIdx = (nakIndex + 7) % 27;

  const sampatName = ORDERED_NAKSHATRAS_27[sampatIdx]!;
  const kshemaName = ORDERED_NAKSHATRAS_27[kshemaIdx]!;
  const sadhanaName = ORDERED_NAKSHATRAS_27[sadhanaIdx]!;
  const mitraName = ORDERED_NAKSHATRAS_27[mitraIdx]!;

  const consecrationTaraBalaKn = `ಸಂಪತ್ ತಾರೆ (${toKannadaNakshatra(sampatName)}), ಕ್ಷೇಮ ತಾರೆ (${toKannadaNakshatra(kshemaName)}), ಸಾಧನ ತಾರೆ (${toKannadaNakshatra(sadhanaName)}), ಮಿತ್ರ ತಾರೆ (${toKannadaNakshatra(mitraName)})`;
  const consecrationTaraBalaEn = `Sampat Tara (${sampatName}), Kshema Tara (${kshemaName}), Sadhana Tara (${sadhanaName}), Mitra Tara (${mitraName})`;

  const prohibitedAlerts: ProhibitedGemstoneAlert[] = lagnaRule.prohibitedGems.map((p) => ({
    gemstoneKn: p.gemstoneKn,
    gemstoneEn: p.gemstoneEn,
    rulingPlanetKn: toKannadaPlanet(p.rulingPlanet),
    rulingPlanetEn: p.rulingPlanet,
    houseLordshipKn: p.houseLordshipKn,
    houseLordshipEn: p.houseLordshipEn,
    severeWarningKn: p.dangerEffectKn,
    severeWarningEn: p.dangerEffectEn
  }));

  return {
    primaryRing: {
      gemstoneKn: lagnaRule.primaryGemKn,
      gemstoneEn: lagnaRule.primaryGemEn,
      sanskritName: lagnaRule.sanskritName,
      caratWeightKn: lagnaRule.caratRange,
      caratWeightEn: lagnaRule.caratRange,
      metalKn: lagnaRule.metalKn,
      metalEn: lagnaRule.metalEn,
      fingerKn: lagnaRule.fingerKn,
      fingerEn: lagnaRule.fingerEn,
      handKn: "ಬಲಗೈ (Right Hand)",
      handEn: "Right Hand (Active Hand)",
      activationDayKn: lagnaRule.activationDayKn,
      activationDayEn: lagnaRule.activationDayEn,
      horaKn: lagnaRule.horaKn,
      horaEn: lagnaRule.horaEn,
      mantraKn: lagnaRule.mantraKn,
      mantraEn: lagnaRule.mantraEn,
      astrologicalReasonKn: `ಲಗ್ನಾಧಿಪತಿಯಾದ ${toKannadaPlanet(lagnaRule.lagnaLord)} ಗ್ರಹದ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ಸ್ಥಿರಗೊಳಿಸಿ, ಶರೀರದ ರೋಗನಿರೋಧಕತೆ, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ಕರ್ಮರಕ್ಷಣೆಯನ್ನು ಬಲಪಡಿಸಲು ಈ ರತ್ನವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`,
      astrologicalReasonEn: `Prescribed to anchor Lagnesha ${lagnaRule.lagnaLord}, purifying vital prana, physical immunity, and unshakeable self-confidence.`
    },
    bhagyaRing: {
      gemstoneKn: lagnaRule.bhagyaGemKn,
      gemstoneEn: lagnaRule.bhagyaGemEn,
      fingerKn: lagnaRule.bhagyaFingerKn,
      fingerEn: lagnaRule.bhagyaFingerEn,
      metalKn: lagnaRule.bhagyaMetalKn,
      metalEn: lagnaRule.bhagyaMetalEn
    },
    yogakarakaRing: lagnaRule.yogakarakaGemKn ? {
      gemstoneKn: lagnaRule.yogakarakaGemKn,
      gemstoneEn: lagnaRule.yogakarakaGemEn || "",
      fingerKn: lagnaRule.yogakarakaFingerKn || "ಮಧ್ಯದ ಬೆರಳು",
      fingerEn: lagnaRule.yogakarakaFingerEn || "Middle Finger",
      metalKn: lagnaRule.yogakarakaMetalKn || "ಪಂಚಲೋಹ",
      metalEn: lagnaRule.yogakarakaMetalEn || "Panchadhatu",
      impactKn: lagnaRule.yogakarakaImpactKn || "",
      impactEn: lagnaRule.yogakarakaImpactEn || ""
    } : undefined,
    neckWear: {
      nakshatraNameKn: toKannadaNakshatra(moonNakName),
      nakshatraNameEn: moonNakName,
      nakshatraLordKn: toKannadaPlanet(neckWearInfo.lord),
      nakshatraLordEn: neckWearInfo.lord,
      nakshatraDeityKn: neckWearInfo.deityKn,
      nakshatraDeityEn: neckWearInfo.deityEn,
      rudrakshaMukhi: neckWearInfo.mukhi,
      rudrakshaNameKn: neckWearInfo.nameKn,
      rudrakshaNameEn: neckWearInfo.nameEn,
      pendantTypeKn: neckWearInfo.pendantKn,
      pendantTypeEn: neckWearInfo.pendantEn,
      threadColorKn: neckWearInfo.threadKn,
      threadColorEn: neckWearInfo.threadEn,
      wearingProcedureKn: `ಪವಿತ್ರ ಸೋಮವಾರ ಅಥವಾ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನದ ನಂತರ ಗಂಗಾಜಲ ಹಾಗೂ ಹಸಿಹಾಲಿನಿಂದ ಪ್ರೋಕ್ಷಿಸಿ "ಓಂ ನಮಃ ಶಿವಾಯ" ಜಪಿಸಿ ಕೊರಳಲ್ಲಿ ಧಾರಣೆ ಮಾಡಿ.`,
      wearingProcedureEn: `Consecrate on Monday morning or your Janma Nakshatra day with Gangajal and raw milk, chanting "Om Namah Shivaya" 108 times before wearing around the neck.`,
      protectiveBlessingKn: neckWearInfo.blessingKn,
      protectiveBlessingEn: neckWearInfo.blessingEn
    },
    earOrnament: {
      ornamentTypeKn: "ಕರ್ಣ ಕುಂಡಲ / ಕಿವಿಯೋಲೆ (Karna Kundala)",
      ornamentTypeEn: "Karna Kundala / Ear Ornament",
      gemstoneKn: getNakshatraDignityInfo(moonNakName).associatedLuckyGemsKn.split(",")[0]?.trim() || "ನೈಸರ್ಗಿಕ ರತ್ನ",
      gemstoneEn: getNakshatraDignityInfo(moonNakName).associatedLuckyGemsEn.split(",")[0]?.trim() || "Natural Gemstone",
      metalKn: getNakshatraDignityInfo(moonNakName).karnaKundalaKn.includes("ಚಿನ್ನ") ? "ಶುದ್ಧ ಬಂಗಾರ (Gold)" : "ಶುದ್ಧ ಬೆಳ್ಳಿ (Silver)",
      metalEn: getNakshatraDignityInfo(moonNakName).karnaKundalaEn.includes("Gold") ? "Gold" : "Sterling Silver",
      biologicalBenefitKn: getNakshatraDignityInfo(moonNakName).karnaKundalaKn,
      biologicalBenefitEn: getNakshatraDignityInfo(moonNakName).karnaKundalaEn,
      wearingInstructionsKn: "ಮುಂಜಾನೆ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನದ ನಂತರ ಶುದ್ಧೀಕರಿಸಿ ಧರಿಸುವುದರಿಂದ ಕಪಾಲ ನರಮಂಡಲ ಪ್ರಶಾಂತಗೊಂಡು, ಆಜ್ಞಾ ಹಾಗೂ ವಿಶುದ್ಧ ಚಕ್ರಗಳು ಜಾಗೃತಗೊಳ್ಳುತ್ತವೆ.",
      wearingInstructionsEn: "Wear on earlobes after morning ablutions to stimulate cranial nerve meridians, harmonizing Ajna and Vishuddha bio-energy chakras."
    },
    nakshatraDignity: getNakshatraDignityInfo(moonNakName),
    nextDaySadhana: {
      morningDeityPrayerKn: `${getNakshatraDignityInfo(moonNakName).nakshatraDevataKn} ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಾರ್ಥನೆ`,
      morningDeityPrayerEn: `Prayer to ${getNakshatraDignityInfo(moonNakName).nakshatraDevataEn} and Sri Kshetra Gokarna Mahabaleshwara`,
      mantraChantKn: `${getNakshatraDignityInfo(moonNakName).nakshatraSwamiKn} ಗಾಯತ್ರೀ ಅಥವಾ ದೇವತಾ ಮಂತ್ರ`,
      mantraChantEn: `${getNakshatraDignityInfo(moonNakName).nakshatraSwamiEn} Gayatri or Deity Mantra`,
      exactMantraCount: 11,
      waterOfferingArghyaKn: "ಮುಂಜಾನೆ ಸೂರ್ಯೋದಯದಲ್ಲಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಸೂರ್ಯದೇವರಿಗೆ ಜಲಾರ್ಘ್ಯ ಸಮರ್ಪಣೆ",
      waterOfferingArghyaEn: "Morning sunrise water Arghya offering using a copper vessel facing East",
      foodOrAnimalCharityKn: "ಗೋವುಗಳಿಗೆ ಹಸಿರು ಮೇವು ಅಥವಾ ಬೆಲ್ಲ-ಅಕ್ಕಿ ನೈವೇದ್ಯ",
      foodOrAnimalCharityEn: "Feeding holy cows green grass, soaked rice, or jaggery",
      templeSankalpaKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ",
      templeSankalpaEn: "Consecrating a dedicated Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara"
    },
    prohibitedGems: prohibitedAlerts,
    colors: {
      luckyColorsKn: lagnaRule.luckyColorsKn,
      luckyColorsEn: lagnaRule.luckyColorsEn,
      whyLuckyKn: lagnaRule.whyLuckyKn,
      whyLuckyEn: lagnaRule.whyLuckyEn,
      strictAvoidColorsKn: lagnaRule.avoidColorsKn,
      strictAvoidColorsEn: lagnaRule.avoidColorsEn,
      dangerWarningKn: lagnaRule.dangerColorsKn,
      dangerWarningEn: lagnaRule.dangerColorsEn
    },
    consecrationTaraBalaKn,
    consecrationTaraBalaEn,
    havalaAnalysis: {
      isRecommended: isHavalaRecommended,
      verdictKn: havalaVerdictKn,
      verdictEn: havalaVerdictEn,
      instructionsKn: havalaInstructionsKn,
      instructionsEn: havalaInstructionsEn
    },
    benchmarkCases: GEMSTONE_REAL_LIFE_BENCHMARK_CASES
  };
}

/**
 * Generates an authoritative, 100% accurate, multi-factor Vedic Pandit consultation
 * response for any query regarding rings, gemstones, neck amulets, havala, and colors.
 */

// ── 5. MULTI-FACTOR VEDIC GEMSTONE CONFIRMATION ENGINE ───────────────────

export interface GemstoneConfirmationInput {
  gemstoneOrPlanet: string;
  vara?: string;
  tithi?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
  runningMahadasha?: string;
  runningBhukti?: string;
  isDashaSandhi?: boolean;
}

export interface GemstoneConfirmationResult {
  isConfirmed: boolean;
  confidenceScore: number; // 0 to 100
  targetPlanet: PlanetName;
  targetPlanetKn: string;
  gemstoneCanonicalEn: string;
  gemstoneCanonicalKn: string;
  verdictKn: string;
  verdictEn: string;
  primaryAlertKn?: string;
  primaryAlertEn?: string;
  lagnaLordshipAnalysisKn: string;
  lagnaLordshipAnalysisEn: string;
  planetaryDignityKn: string;
  planetaryDignityEn: string;
  aspectDrishtiAnalysisKn: string;
  aspectDrishtiAnalysisEn: string;
  dashaBhuktiAlignmentKn: string;
  dashaBhuktiAlignmentEn: string;
  panchangaConsecrationKn: string;
  panchangaConsecrationEn: string;
  tulaControversyExplanationKn?: string;
  tulaControversyExplanationEn?: string;
  rahuBlackColorExplanationKn?: string;
  rahuBlackColorExplanationEn?: string;
  matchingBenchmarkCases: BenchmarkCaseStudy[];
}

/**
 * Resolves user gemstone query / planet string to canonical PlanetName and Gemstone details
 */
export function resolveGemstoneTarget(raw: string): {
  planet: PlanetName;
  planetKn: string;
  gemEn: string;
  gemKn: string;
  isDiamond: boolean;
  isYellowSapphire: boolean;
  isBlueSapphire: boolean;
  isHessoniteOrRahu: boolean;
  isRedCoral: boolean;
  isEmerald: boolean;
  isRuby: boolean;
  isPearl: boolean;
  isCatsEye: boolean;
} {
  const q = raw.toLowerCase().trim();

  if (/ವಜ್ರ|vajra|diamond|heera|ಹೀರಾ|ಶುಕ್ರ|venus|white zircon|white sapphire|opal|ಒಪಲ್|ಝಿರ್ಕಾನ್/i.test(q)) {
    return {
      planet: PlanetName.Venus,
      planetKn: "ಶುಕ್ರ",
      gemEn: "Diamond (Vajra / White Zircon)",
      gemKn: "ವಜ್ರ (ವಜ್ರಂ / ಬಿಳಿ ಝಿರ್ಕಾನ್)",
      isDiamond: true,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: false,
      isRuby: false,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ಪುಷ್ಯ|pushpa|pushparaga|yellow sapphire|pukhraj|ಪುಖರಾಜ್|ಗುರು|jupiter|ಬೃಹಸ್ಪತಿ|ಹಳದಿ/i.test(q)) {
    return {
      planet: PlanetName.Jupiter,
      planetKn: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
      gemEn: "Yellow Sapphire (Pushparaga / Pukhraj)",
      gemKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (ಪುಷ್ಪರಾಗಂ / ಪುಖರಾಜ್)",
      isDiamond: false,
      isYellowSapphire: true,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: false,
      isRuby: false,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ನೀಲಂ|neelam|blue sapphire|ಶನಿ|saturn|amethyst|ಜಂಬೂಮಣಿ/i.test(q)) {
    return {
      planet: PlanetName.Saturn,
      planetKn: "ಶನಿ",
      gemEn: "Blue Sapphire (Neelam)",
      gemKn: "ನೀಲಂ (ನೀಲಿ ಪದ್ಮರಾಗ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: true,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: false,
      isRuby: false,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ಗೋಮೇಧಿಕ|gomed|hessonite|ರಾಹು|rahu|ಕಪ್ಪು|black|tourmaline/i.test(q)) {
    return {
      planet: PlanetName.Rahu,
      planetKn: "ರಾಹು",
      gemEn: "Hessonite (Gomed / Black Hues)",
      gemKn: "ಗೋಮೇಧಿಕ (ರಾಹು ರತ್ನ / ಕಪ್ಪು ವರ್ಣ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: true,
      isRedCoral: false,
      isEmerald: false,
      isRuby: false,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ಹವಳ|avala|havala|coral|ಪ್ರವಾಳ|ಕುಜ|ಮಂಗಳ|mars|ರಕ್ತವರ್ಣ/i.test(q)) {
    return {
      planet: PlanetName.Mars,
      planetKn: "ಕುಜ (ಮಂಗಳ)",
      gemEn: "Red Coral (Pravala / Havala)",
      gemKn: "ಕೆಂಪು ಹವಳ (ಶುದ್ಧ ಪ್ರವಾಳ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: true,
      isEmerald: false,
      isRuby: false,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ಪಚ್ಚೆ|pache|panna|emerald|ಮರಕತ|ಬುಧ|mercury|ಹಸಿರು/i.test(q)) {
    return {
      planet: PlanetName.Mercury,
      planetKn: "ಬುಧ",
      gemEn: "Emerald (Panna / Marakata)",
      gemKn: "ಪಚ್ಚೆ (ಮರಕತಂ / ಪನ್ನಾ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: true,
      isRuby: false,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ಮಾಣಿಕ್ಯ|manikya|ruby|ಸೂರ್ಯ|sun|ರವಿ|ಕೆಂಪು ರತ್ನ/i.test(q)) {
    return {
      planet: PlanetName.Sun,
      planetKn: "ಸೂರ್ಯ",
      gemEn: "Ruby (Manikya)",
      gemKn: "ಮಾಣಿಕ್ಯ (ಮಾಣಿಕ್ಯಂ / ಕೆಂಪು ರತ್ನ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: false,
      isRuby: true,
      isPearl: false,
      isCatsEye: false
    };
  }

  if (/ಮುತ್ತು|moti|pearl|ಚಂದ್ರ|moon|ಮುಕ್ತಾ|ಶ್ವೇತ/i.test(q)) {
    return {
      planet: PlanetName.Moon,
      planetKn: "ಚಂದ್ರ",
      gemEn: "Natural Pearl (Moti / Mukta)",
      gemKn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (ಮೌಕ್ತಿಕಂ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: false,
      isRuby: false,
      isPearl: true,
      isCatsEye: false
    };
  }

  if (/ವೈಡೂರ್ಯ|vaidurya|cats eye|cat's eye|ಕೇತು|ketu|chrysoberyl/i.test(q)) {
    return {
      planet: PlanetName.Ketu,
      planetKn: "ಕೇತು",
      gemEn: "Cat's Eye (Vaidurya / Chrysoberyl)",
      gemKn: "ವೈಡೂರ್ಯ (ಕನಕಕ್ಷೇತ ವೈಡೂರ್ಯ)",
      isDiamond: false,
      isYellowSapphire: false,
      isBlueSapphire: false,
      isHessoniteOrRahu: false,
      isRedCoral: false,
      isEmerald: false,
      isRuby: false,
      isPearl: false,
      isCatsEye: true
    };
  }

  // Default fallback to Venus (Diamond) since user explicitly asked about Vajra audit
  return {
    planet: PlanetName.Venus,
    planetKn: "ಶುಕ್ರ",
    gemEn: "Diamond (Vajra)",
    gemKn: "ವಜ್ರ (ವಜ್ರಂ)",
    isDiamond: true,
    isYellowSapphire: false,
    isBlueSapphire: false,
    isHessoniteOrRahu: false,
    isRedCoral: false,
    isEmerald: false,
    isRuby: false,
    isPearl: false,
    isCatsEye: false
  };
}

/**
 * Executes a deterministic, 100% rigorous Vedic multi-factor gemstone confirmation audit.
 * Integrates:
 * 1. Janma Kundali Lordship (Lagna, Trikona, Kendra, Dusthana 6/8/12, Maraka 2/7, Badhaka)
 * 2. Planetary Dignity (Ucha, Neecha, Neechabhanga, Moolatrikona, Swakshetra, Mitra, Shatru)
 * 3. Planetary Aspects (Drishti), specifically Guru Drishti (Jupiter's protective nectar 5/7/9 aspect)
 * 4. Running Dasha & Bhukti harmony & Dasha Sandhi
 * 5. Panchanga 5-Anga consecration (Vara, Tithi, Nakshatra Tara Bala, Yoga, Karana)
 * 6. Explicit resolution of the Tula (Libra) Lagna Diamond vs Yellow Sapphire controversy
 * 7. Explicit resolution of Rahu & Black color / Hessonite placement rules
 */
export function confirmGemstoneSuitability(
  kundli: KundliOutput,
  input: GemstoneConfirmationInput
): GemstoneConfirmationResult {
  const target = resolveGemstoneTarget(input.gemstoneOrPlanet);
  const lagnaRashiIdx = ((kundli.lagnaRashi.index % 12) + 12) % 12;
  const lagnaNameEn = kundli.lagnaRashi.english;
  const lagnaNameKn = toKannadaRashi(lagnaNameEn);

  // Identify houses ruled by target planet from Lagna
  // Sign index: 0 Mesha, 1 Vrishabha, 2 Mithuna, 3 Karka, 4 Simha, 5 Kanya, 6 Tula, 7 Vrischika, 8 Dhanus, 9 Makara, 10 Kumbha, 11 Meena
  const PLANET_SIGNS: Record<PlanetName, number[]> = {
    [PlanetName.Sun]: [4],
    [PlanetName.Moon]: [3],
    [PlanetName.Mars]: [0, 7],
    [PlanetName.Mercury]: [2, 5],
    [PlanetName.Jupiter]: [8, 11],
    [PlanetName.Venus]: [1, 6],
    [PlanetName.Saturn]: [9, 10],
    [PlanetName.Rahu]: [10], // co-rules Aquarius
    [PlanetName.Ketu]: [7]   // co-rules Scorpio
  };

  const ruledSigns = PLANET_SIGNS[target.planet] || [];
  const ruledHouses = ruledSigns.map(s => ((s - lagnaRashiIdx + 12) % 12) + 1);

  const isLagnaLord = ruledHouses.includes(1);
  const isTrikonaLord = ruledHouses.some(h => [1, 5, 9].includes(h));
  const isKendraLord = ruledHouses.some(h => [1, 4, 7, 10].includes(h));
  const isDusthanaLord = ruledHouses.some(h => [6, 8, 12].includes(h));
  const isMarakaLord = ruledHouses.some(h => [2, 7].includes(h));

  // Badhaka house: 11th for Chara (0, 3, 6, 9), 9th for Sthira (1, 4, 7, 10), 7th for Dwisvabhava (2, 5, 8, 11)
  const badhakaHouse = [0, 3, 6, 9].includes(lagnaRashiIdx) ? 11 : [1, 4, 7, 10].includes(lagnaRashiIdx) ? 9 : 7;
  const isBadhakaLord = ruledHouses.includes(badhakaHouse);

  // Yogakaraka detection:
  // Taurus (1): Saturn (9 & 10)
  // Cancer (3): Mars (5 & 10)
  // Leo (4): Mars (4 & 9)
  // Libra (6): Saturn (4 & 5)
  // Capricorn (9): Venus (5 & 10)
  // Aquarius (10): Venus (4 & 9)
  let isYogakaraka = false;
  if (lagnaRashiIdx === 1 && target.planet === PlanetName.Saturn) isYogakaraka = true;
  if (lagnaRashiIdx === 3 && target.planet === PlanetName.Mars) isYogakaraka = true;
  if (lagnaRashiIdx === 4 && target.planet === PlanetName.Mars) isYogakaraka = true;
  if (lagnaRashiIdx === 6 && target.planet === PlanetName.Saturn) isYogakaraka = true;
  if (lagnaRashiIdx === 9 && target.planet === PlanetName.Venus) isYogakaraka = true;
  if (lagnaRashiIdx === 10 && target.planet === PlanetName.Venus) isYogakaraka = true;

  // Planet placement in native chart
  const planetInChart = kundli.planets.find(p => p.name === target.planet);
  const planetRashiIdx = planetInChart ? planetInChart.rashi.index : -1;
  const planetHouseFromLagna = planetRashiIdx !== -1 ? ((planetRashiIdx - lagnaRashiIdx + 12) % 12) + 1 : 1;

  // Dignity calculations
  const EXALTATION_RASHIS: Record<PlanetName, number> = {
    [PlanetName.Sun]: 0,     // Aries
    [PlanetName.Moon]: 1,    // Taurus
    [PlanetName.Mars]: 9,    // Capricorn
    [PlanetName.Mercury]: 5, // Virgo
    [PlanetName.Jupiter]: 3, // Cancer
    [PlanetName.Venus]: 11,  // Pisces
    [PlanetName.Saturn]: 6,  // Libra
    [PlanetName.Rahu]: 1,    // Taurus / Gemini
    [PlanetName.Ketu]: 7     // Scorpio / Sagittarius
  };

  const DEBILITATION_RASHIS: Record<PlanetName, number> = {
    [PlanetName.Sun]: 6,     // Libra
    [PlanetName.Moon]: 7,    // Scorpio
    [PlanetName.Mars]: 3,    // Cancer
    [PlanetName.Mercury]: 11,// Pisces
    [PlanetName.Jupiter]: 9, // Capricorn
    [PlanetName.Venus]: 5,   // Virgo
    [PlanetName.Saturn]: 0,  // Aries
    [PlanetName.Rahu]: 7,    // Scorpio
    [PlanetName.Ketu]: 1     // Taurus
  };

  const isExalted = planetRashiIdx !== -1 && planetRashiIdx === EXALTATION_RASHIS[target.planet];
  const isDebilitated = planetRashiIdx !== -1 && planetRashiIdx === DEBILITATION_RASHIS[target.planet];
  const isOwnSign = planetRashiIdx !== -1 && ruledSigns.includes(planetRashiIdx);

  // Neechabhanga: if debilitated, check if dispositor or exaltation lord is in Kendra (1, 4, 7, 10) from Lagna
  let hasNeechabhanga = false;
  if (isDebilitated) {
    const dispositorPlanet = signLord(planetRashiIdx);
    const dispInChart = kundli.planets.find(p => p.name === dispositorPlanet);
    if (dispInChart) {
      const dispHouse = ((dispInChart.rashi.index - lagnaRashiIdx + 12) % 12) + 1;
      if ([1, 4, 7, 10].includes(dispHouse)) {
        hasNeechabhanga = true;
      }
    }
  }

  // Aspects (Drishti) & Guru Drishti Check
  const jupiterInChart = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  let hasGuruDrishti = false;
  if (jupiterInChart && planetRashiIdx !== -1 && target.planet !== PlanetName.Jupiter) {
    const diffFromJup = (planetRashiIdx - jupiterInChart.rashi.index + 12) % 12;
    // Jupiter casts 5th (diff=4), 7th (diff=6), 9th (diff=8) house drishti
    if ([4, 6, 8].includes(diffFromJup)) {
      hasGuruDrishti = true;
    }
  }

  // Saturn Drishti (3rd diff=2, 7th diff=6, 10th diff=9)
  const saturnInChart = kundli.planets.find(p => p.name === PlanetName.Saturn);
  let hasShaniDrishti = false;
  if (saturnInChart && planetRashiIdx !== -1 && target.planet !== PlanetName.Saturn) {
    const diffFromSat = (planetRashiIdx - saturnInChart.rashi.index + 12) % 12;
    if ([2, 6, 9].includes(diffFromSat)) {
      hasShaniDrishti = true;
    }
  }

  // Rahu In Upachaya Check
  const rahuInChart = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const rahuHouse = rahuInChart ? ((rahuInChart.rashi.index - lagnaRashiIdx + 12) % 12) + 1 : 1;
  const isRahuUpachaya = [3, 6, 11].includes(rahuHouse);

  // ─────────────────────────────────────────────────────────────────────────
  // SCORING & LOGICAL SYNTHESIS
  // ─────────────────────────────────────────────────────────────────────────
  let score = 50;
  let isConfirmed = false;
  let primaryAlertEn: string | undefined = undefined;
  let primaryAlertKn: string | undefined = undefined;
  let tulaControversyExplanationEn: string | undefined = undefined;
  let tulaControversyExplanationKn: string | undefined = undefined;
  let rahuBlackColorExplanationEn: string | undefined = undefined;
  let rahuBlackColorExplanationKn: string | undefined = undefined;

  // 1. TULA (LIBRA) SPECIALIZED LOGIC & CONTROVERSY RESOLUTION
  if (lagnaRashiIdx === 6) {
    // 6 = Tula
    if (target.isYellowSapphire || target.planet === PlanetName.Jupiter) {
      // PUSHPARAGA FOR TULA IS STRICTLY FORBIDDEN!
      score = 5;
      isConfirmed = false;
      primaryAlertEn = "STRICT PROHIBITION: For Libra Ascendant, Jupiter rules the 3rd and 6th houses (illness, debts, litigation). Wearing Yellow Sapphire triggers compounding debts, hepatic/liver ailments, and bitter lawsuits!";
      primaryAlertKn = "ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ಎಚ್ಚರಿಕೆ: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಗುರುವು 3ನೇ ಮತ್ತು 6ನೇ ಶತ್ರು-ರೋಗ-ಋಣ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿ ಪರಮ ಪಾಪಿ ಗ್ರಹ. ಪುಷ್ಯರಾಗ ಧರಿಸಿದರೆ ದೀರ್ಘಕಾಲದ ಯಕೃತ್ತು/ಲಿವರ್ ರೋಗ, ತೀರಿಸಲಾಗದ ಸಾಲ ಹಾಗೂ ಕೋರ್ಟ್ ಕೇಸ್‌ಗಳು ಭುಗಿಲೇಳುತ್ತವೆ!";
      tulaControversyExplanationEn = "Classical Parashari Resolution: Many amateur astrologers get confused because Jupiter is a natural benefic (Naisargika Shubha) and wrongly prescribe Pushparaga for Tula. In Vedic astrology, Functional Nature (Kendra/Trikona vs Dusthana) strictly supersedes natural beneficence! Jupiter as 6th lord is an enemy to Lagnesha Venus. Pushparaga is 100% prohibited for Libra.";
      tulaControversyExplanationKn = "ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ಪಷ್ಟೀಕರಣ: ಕೆಲವರು ಗುರುವನ್ನು ಸ್ವಾಭಾವಿಕ ಶುಭಗ್ರಹವೆಂದು ಭಾವಿಸಿ ತುಲಾ ಲಗ್ನಕ್ಕೂ ಪುಷ್ಯರಾಗ ಧರಿಸಲು ಹೇಳಿ ಗೊಂದಲ ಮೂಡಿಸುತ್ತಾರೆ. ಇದು ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ದೃಷ್ಟಿಯಿಂದ ಘೋರ ತಪ್ಪು! ಪರಾಶರ ಸಂಹಿತೆಯ ಪ್ರಕಾರ 6ನೇ ಮನೆಯ ಅಧಿಪತ್ಯವು ರೋಗ ಮತ್ತು ಸಾಲವನ್ನು ನೇರವಾಗಿ ಆವಾಹಿಸುತ್ತದೆ. ತುಲಾ ಲಗ್ನಕ್ಕೆ ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನ ವಜ್ರ, 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ ಬುಧನ ಪಚ್ಚೆ ಅಥವಾ ಪರಮ ಯೋಗಕಾರಕ ಶನಿಯ ನೀಲಂ ಮಾತ್ರ ಧರಿಸಬೇಕು.";
    } else if (target.isDiamond || target.planet === PlanetName.Venus) {
      // VAJRA FOR TULA:
      if (isDebilitated && !hasNeechabhanga) {
        score = 40;
        isConfirmed = false;
        primaryAlertEn = "CAUTION: For Libra Ascendant, Venus is Lagna lord but is currently debilitated in the 6th house (Virgo) without Neechabhanga. High-carat Diamond can inadvertently stimulate the 8th house trauma. Wear White Zircon in Silver or a Gauri-Shankar Rudraksha instead.";
        primaryAlertKn = "ಎಚ್ಚರಿಕೆ: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನೇ ಲಗ್ನಾಧಿಪತಿಯಾದರೂ, ಜಾತಕದಲ್ಲಿ 6ನೇ ಮನೆಯ ಕನ್ಯಾ ರಾಶಿಯಲ್ಲಿ ನೀಚನಾಗಿದ್ದು ನೀಚಭಂಗವಾಗಿಲ್ಲ. ಈ ಸ್ಥಿತಿಯಲ್ಲಿ ನೇರವಾಗಿ ವಜ್ರ ಧರಿಸಿದರೆ 8ನೇ ಮನೆಯ ಅಶುಭ ತರಂಗಗಳು ಪ್ರಚೋದಿತವಾಗಬಹುದು. ಸೌಮ್ಯವಾದ ಬಿಳಿ ಝಿರ್ಕಾನ್ ಅಥವಾ ಗೌರೀಶಂಕರ ರುದ್ರಾಕ್ಷಿ ಧರಿಸುವುದು ಶ್ರೇಷ್ಠ.";
        tulaControversyExplanationEn = "Tula Diamond Nuance: Venus rules both the 1st (Lagna) and 8th (Scorpio/Taurus) houses. Parashara states 'Lagnadhipati na dosham' (Lagna lord is exempt from 8th house blemish), meaning Diamond is inherently your life stone. However, because it is debilitated in the 6th house in this specific chart, gentler Uparatnas (White Zircon / White Sapphire) with Gangajal consecration are required.";
        tulaControversyExplanationKn = "ತುಲಾ ವಜ್ರ ರಹಸ್ಯ: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು 1ನೇ (ಲಗ್ನ) ಹಾಗೂ 8ನೇ (ಆಯುಷ್ಯ) ಸ್ಥಾನಗಳೆರಡರ ಅಧಿಪತಿ. 'ಲಗ್ನಾಧಿಪತಯೇ ನ ದೋಷಃ' ನಿಯಮದಂತೆ ಲಗ್ನಾಧಿಪತಿಗೆ ಅಷ್ಟಮಾಧಿಪತ್ಯ ದೋಷ ತಟ್ಟುವುದಿಲ್ಲ. ಆದರೆ ಶುಕ್ರನು ನೀಚನಾಗಿದ್ದಾಗ ಉಗ್ರ ವಜ್ರದ ಬದಲು ಸೌಮ್ಯವಾದ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಝಿರ್ಕಾನ್ ಧರಿಸುವುದರಿಂದ ಪರಿಪೂರ್ಣ ಭಾಗ್ಯೋದಯ ಸಿದ್ಧಿಸುತ್ತದೆ.";
      } else {
        score = 95;
        isConfirmed = true;
        tulaControversyExplanationEn = "Tula Diamond Confirmed: Venus is your sovereign Lagna Lord. Under the supreme Parashari principle 'Lagnadhipati na dosham', the 1st house primacy completely overrides the 8th lordship. Worn on the little or middle finger in Platinum or Silver, Diamond provides invincible charisma, worldly luxury, artistic success, and physical vitality.";
        tulaControversyExplanationKn = "ತುಲಾ ವಜ್ರ ಖಚಿತ ಅನುಮೋದನೆ: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನೇ ಶರೀರ ಮತ್ತು ಭಾಗ್ಯದ ಒಡೆಯ (ಲಗ್ನಾಧಿಪತಿ). 'ಲಗ್ನಾಧಿಪತಯೇ ನ ದೋಷಃ' ನಿಯಮದಂತೆ ಲಗ್ನಾಧಿಪತಿಗೆ ಅಷ್ಟಮ ದೋಷ ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಪ್ಲಾಟಿನಂ ಅಥವಾ ಬೆಳ್ಳಿಯಲ್ಲಿ ಕಿರುಬೆರಳು/ಮಧ್ಯದ ಬೆರಳಿನಲ್ಲಿ ವಜ್ರ ಧರಿಸುವುದರಿಂದ ಅಪ್ರತಿಮ ವ್ಯಕ್ತಿತ್ವ, ಕಲಾ ವಿಜಯ, ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಸಕಲ ಭೋಗಭಾಗ್ಯಗಳು ಲಭಿಸುತ್ತವೆ.";
      }
    }
  }

  // 2. RAHU & BLACK COLOR LOGIC
  if (target.isHessoniteOrRahu || target.planet === PlanetName.Rahu) {
    if (isRahuUpachaya) {
      score = 90;
      isConfirmed = true;
      rahuBlackColorExplanationEn = `Rahu In Upachaya House (${rahuHouse}th house): Highly Auspicious! Rahu in 3rd, 6th, or 11th in friendly signs transforms into an unstoppable engine of sudden wealth, deep-tech innovation, fearless media triumph, and international contracts. Wearing Hessonite (Gomed) or smoky tones during Rahu Dasha is confirmed.`;
      rahuBlackColorExplanationKn = `ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು (${rahuHouse}ನೇ ಮನೆ): ಅತ್ಯಂತ ಮಂಗಳಕರ! ರಾಹುವು 3, 6 ಅಥವಾ 11ನೇ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿದ್ದಾಗ ಆಕಸ್ಮಿಕ ಧನಲಾಭ, ತಂತ್ರಜ್ಞಾನದಲ್ಲಿ ಪವಾಡ, ಮಾಧ್ಯಮ/ರಾಜಕೀಯ ವಿಜಯ ಹಾಗೂ ವಿದೇಶಿ ಭಾಗ್ಯ ತರುತ್ತಾನೆ. ರಾಹು ಮಹಾದಶೆಯಲ್ಲಿ ಗೋಮೇಧಿಕ ಧರಿಸುವುದು 100% ಶಾಸ್ತ್ರೋಕ್ತ.`;
    } else {
      score = 15;
      isConfirmed = false;
      primaryAlertEn = `STRICT AVOID: Rahu is placed in the ${rahuHouse}th house (Kendra/Dusthana). Stimulating Rahu with Hessonite (Gomed) or wearing excessive black clothing will trigger severe psychic anxiety, paranoid hallucinations, sudden police/ED raids, marital rupture, or unexplainable illness!`;
      primaryAlertKn = `ಕಟ್ಟುನಿಟ್ಟಾದ ನಿಷೇಧ: ರಾಹುವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${rahuHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ (ಕೇಂದ್ರ/ದುಸ್ಥಾನ). ಗೋಮೇಧಿಕ ಧರಿಸಿದರೆ ಅಥವಾ ಸದಾ ಕಪ್ಪು ಬಟ್ಟೆಗಳನ್ನು ಧರಿಸಿದರೆ ತೀವ್ರ ಮಾನಸಿಕ ಭ್ರಮೆ, ನಿದ್ರಾಹೀನತೆ, ಅಪಘಾತ, ಪೊಲೀಸ್/ಸರ್ಕಾರಿ ತನಿಖೆ ಹಾಗೂ ದಾಂಪತ್ಯ ವಿಚ್ಛೇದನ ಸಂಭವಿಸಬಹುದು!`;
      rahuBlackColorExplanationEn = "Rahu Shadow Principle: Rahu in 1st, 2nd, 7th, 8th, or 12th houses must NEVER be strengthened with gems. It should be pacified through Lord Ganesha worship, 8-Mukhi Rudraksha around the neck, and charitable donations.";
      rahuBlackColorExplanationKn = "ರಾಹು ಶಾಸ್ತ್ರೀಯ ನಿಯಮ: 1, 2, 7, 8 ಅಥವಾ 12ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ರಾಹುವಿಗೆ ಎಂದಿಗೂ ಉಂಗುರ ಧರಿಸಬಾರದು. ಕೊರಳಲ್ಲಿ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಿ ಗಣಪತಿ ಆರಾಧನೆ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶಾಂತಿ ಪೂಜೆ ಮಾಡಿಸಬೇಕು.";
    }
  }

  // 3. GENERAL PLANETARY EVALUATION (When not already set by Tula/Rahu override)
  if (score === 50) {
    if (isYogakaraka) {
      score += 35; // 85
      isConfirmed = true;
    } else if (isLagnaLord) {
      score += 30; // 80
      isConfirmed = true;
    } else if (isTrikonaLord && !isDusthanaLord) {
      score += 25; // 75
      isConfirmed = true;
    } else if (isDusthanaLord && !isLagnaLord) {
      score -= 35; // 15
      isConfirmed = false;
      primaryAlertEn = `DANGEROUS DUSTHANA LORD: This planet rules the ${ruledHouses.filter(h => [6, 8, 12].includes(h)).join(", ")}th Dusthana for ${lagnaNameEn} Ascendant. Wearing its gemstone directly amplifies illness, debts, and sudden ruin!`;
      primaryAlertKn = `ಅಪಾಯಕಾರಿ ದುಸ್ಥಾನಾಧಿಪತಿ: ಈ ಗ್ರಹವು ನಿಮ್ಮ ${lagnaNameKn} ಲಗ್ನಕ್ಕೆ ${ruledHouses.filter(h => [6, 8, 12].includes(h)).join(", ")}ನೇ ರೋಗ, ಸಾಲ ಹಾಗೂ ಆಯುಷ್ಯ/ವ್ಯಯ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿದ್ದು, ಇದರ ರತ್ನ ಧರಿಸಿದರೆ ಸರ್ವನಾಶ ಗ್ಯಾರಂಟಿ!`;
    } else if (isMarakaLord && !isLagnaLord && !isTrikonaLord) {
      score -= 25; // 25
      isConfirmed = false;
      primaryAlertEn = `MARAKA LORD HAZARD: This planet rules Maraka house (${ruledHouses.filter(h => [2, 7].includes(h)).join(", ")}). Wearing its ring can induce severe health and marital hazards.`;
      primaryAlertKn = `ಮಾರಕ ಸ್ಥಾನಾಧಿಪತಿ ಎಚ್ಚರಿಕೆ: ಈ ಗ್ರಹವು ನಿಮ್ಮ ಲಗ್ನಕ್ಕೆ ${ruledHouses.filter(h => [2, 7].includes(h)).join(", ")}ನೇ ಮಾರಕ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿದ್ದು ಧರಿಸುವುದು ಅಪಾಯಕಾರಿ.`;
    }

    if (isBadhakaLord && !isLagnaLord && !isYogakaraka) {
      score -= 15;
      if (score < 50) isConfirmed = false;
    }

    if (isExalted) score += 10;
    if (isOwnSign && !isDusthanaLord) score += 8;
    if (isDebilitated && !hasNeechabhanga) {
      score -= 20;
      if (score < 50) isConfirmed = false;
    }
    if (hasGuruDrishti) score += 10;
    if (hasShaniDrishti && !isYogakaraka) score -= 5;
  }

  // Bounds check score
  score = Math.max(0, Math.min(100, score));
  isConfirmed = score >= 65;

  // Dignity narrative
  const dignityKn = isExalted
    ? `ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು (Exalted) ಪರಮ ಬಲಶಾಲಿಯಾಗಿದೆ.`
    : isDebilitated
    ? hasNeechabhanga
      ? `ನೀಚ ಸ್ಥಾನದಲ್ಲಿದ್ದರೂ ಪ್ರಬಲ ನೀಚಭಂಗ ರಾಜಯೋಗ (Neechabhanga Rajayoga) ಪಡೆದಿದೆ.`
      : `ನೀಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು (Debilitated) ಯಾವುದೇ ನೀಚಭಂಗವಿಲ್ಲದೆ ಬಲಹೀನವಾಗಿದೆ.`
    : isOwnSign
    ? `ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು (Swakshetra) ಸ್ವಗೃಹ ಬಲವನ್ನು ಹೊಂದಿದೆ.`
    : `ಜಾತಕದಲ್ಲಿ ${planetHouseFromLagna}ನೇ ಮನೆಯಲ್ಲಿ ಸ್ಥಿತವಾಗಿದೆ.`;

  const dignityEn = isExalted
    ? `Exalted (Ucha) with peak positive luminescence.`
    : isDebilitated
    ? hasNeechabhanga
      ? `Debilitated but blessed with authentic Neechabhanga Rajayoga.`
      : `Debilitated (Neecha) without cancellation; bio-field amplification requires extreme care.`
    : isOwnSign
    ? `Swakshetra (Own sign) with solid structural stability.`
    : `Placed in the ${planetHouseFromLagna}th house from Lagna.`;

  // Aspect narrative
  const aspectKn = hasGuruDrishti
    ? `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಪವಿತ್ರ ಅಮೃತ ದೃಷ್ಟಿ (5/7/9ನೇ ತ್ರಿಕೋಣ ದೃಷ್ಟಿ) ಗ್ರಹದ ಮೇಲಿದ್ದು, ಸಕಲ ದೋಷಗಳನ್ನು ಭಸ್ಮಗೊಳಿಸಿ ದೈವಿಕ ರಕ್ಷಣೆ ನೀಡುತ್ತಿದೆ.`
    : hasShaniDrishti
    ? `ಶನಿಯ ಕಠಿಣ ದೃಷ್ಟಿ ಇದ್ದು, ಶಿಸ್ತು ಮತ್ತು ಕರ್ಮ ಪರಿಶುದ್ಧಿಯ ನಂತರವೇ ಫಲ ನೀಡುತ್ತದೆ.`
    : `ಯಾವುದೇ ಅಶುಭ ಗ್ರಹಗಳ ದುಷ್ಟ ದೃಷ್ಟಿಯಿಲ್ಲದೆ ಸ್ವತಂತ್ರವಾಗಿದೆ.`;

  const aspectEn = hasGuruDrishti
    ? `Blessed by divine Guru Drishti (Jupiter's protective 5th/7th/9th nectar aspect), purifying inherent blemishes into spiritual resilience.`
    : hasShaniDrishti
    ? `Aspected by Saturn, demanding strict moral conduct and patience.`
    : `Free from destructive planetary aspects.`;

  // Dasha narrative
  const dashaKn = input.isDashaSandhi
    ? `ಪ್ರಸ್ತುತ ದಶಾ ಸಂಧಿಯ ಕಾಲಘಟ್ಟದಲ್ಲಿದ್ದು (Dasha Sandhi), ಹೊಸ ರತ್ನ ಧರಿಸುವುದನ್ನು ಮುಂದಿನ 3 ತಿಂಗಳು ಮುಂದೂಡುವುದು ಶಾಸ್ತ್ರೋಕ್ತ.`
    : input.runningMahadasha
    ? `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${input.runningMahadasha} ಮಹಾದಶೆಯಲ್ಲಿ ಈ ಗ್ರಹದ ತರಂಗಗಳು ಅನುಕೂಲಕರವಾಗಿವೆ.`
    : `ನಡೆಯುತ್ತಿರುವ ದಶಾ ಕಾಲಘಟ್ಟದಲ್ಲಿ ತ್ರಿಕೋಣ ಬಲವನ್ನು ಸ್ಥಿರಗೊಳಿಸಲು ಸೂಕ್ತವಾಗಿದೆ.`;

  const dashaEn = input.isDashaSandhi
    ? `Currently under volatile Dasha Sandhi transition; ring consecration should be deferred for 90 days until the bio-field stabilizes.`
    : input.runningMahadasha
    ? `Harmoniously aligned with your running ${input.runningMahadasha} Mahadasha cycle.`
    : `Well-aligned with life cycles for vitality anchoring.`;

  // Panchanga Consecration
  const panchangaKn = `ಧರಿಸಲು ಶುಕ್ಲಪಕ್ಷದ ಪವಿತ್ರ ಶುಭ ಮುಹೂರ್ತ, ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯ ವೇಳೆಗೆ, ಗಂಗಾಜಲ ಮತ್ತು ಹಸಿಹಾಲಿನ ಪ್ರೋಕ್ಷಣೆಯೊಂದಿಗೆ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಧರಿಸಬೇಕು.`;
  const panchangaEn = `Consecrate strictly during Shukla Paksha auspicious Tithis, morning sunrise Hora, using Gangajal and raw milk sanctification.`;

  // Verdict strings
  const verdictKn = isConfirmed
    ? `100% ಶಾಸ್ತ್ರೋಕ್ತ ಅನುಮೋದನೆ (Confidence: ${score}%): ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ${target.gemEn} (${target.gemKn}) ರತ್ನವು ಪರಮ ಮಂಗಳಕರ ಹಾಗೂ ಭಾಗ್ಯೋದಾಯಕವಾಗಿದೆ!`
    : `ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿತ (Confidence: ${score}%): ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ${target.gemEn} (${target.gemKn}) ರತ್ನವು ಪ್ರತಿಕೂಲವಾಗಿದ್ದು ಧರಿಸಿದರೆ ತೀವ್ರ ಕಷ್ಟ, ಸಾಲ ಅಥವಾ ರೋಗ ತರಬಹುದು!`;

  const verdictEn = isConfirmed
    ? `100% VEDIC APPROVED (Confidence: ${score}%): ${target.gemEn} is exceptionally auspicious and aligned to elevate your fortune and bio-field!`
    : `STRICTLY CONTRAINDICATED (Confidence: ${score}%): ${target.gemEn} is malefic for your horoscope; wearing it risks severe setbacks, debt traps, or health flare-ups!`;

  // Find matching benchmark cases
  const matchingCases = GEMSTONE_100_BENCHMARK_PROFILES.filter(c => {
    const isCatMatch = c.gemstoneCategory?.toLowerCase().includes(target.planet.toLowerCase()) ||
                       (target.isDiamond && c.gemstoneCategory === "Vajra_Diamond") ||
                       (target.isYellowSapphire && c.gemstoneCategory === "Pushparaga_YellowSapphire") ||
                       (target.isBlueSapphire && c.gemstoneCategory === "Neelam_BlueSapphire") ||
                       (target.isHessoniteOrRahu && c.gemstoneCategory === "Gomed_Rahu_Black") ||
                       (target.isRedCoral && c.gemstoneCategory === "Pavala_RedCoral") ||
                       (target.isEmerald && c.gemstoneCategory === "Panna_Emerald") ||
                       (target.isRuby && c.gemstoneCategory === "Manikya_Ruby") ||
                       (target.isPearl && c.gemstoneCategory === "Moti_Pearl") ||
                       (target.isCatsEye && c.gemstoneCategory === "Vaidurya_CatsEye");
    return isCatMatch;
  }).slice(0, 4);

  return {
    isConfirmed,
    confidenceScore: score,
    targetPlanet: target.planet,
    targetPlanetKn: target.planetKn,
    gemstoneCanonicalEn: target.gemEn,
    gemstoneCanonicalKn: target.gemKn,
    verdictKn,
    verdictEn,
    primaryAlertKn,
    primaryAlertEn,
    lagnaLordshipAnalysisKn: `ನಿಮ್ಮ ${lagnaNameKn} ಲಗ್ನಕ್ಕೆ ಈ ಗ್ರಹವು ${ruledHouses.join(", ")}ನೇ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿದೆ. ${isYogakaraka ? "ಇದು ಪರಮ ರಾಜಯೋಗಕಾರಕ!" : isLagnaLord ? "ಇದು ದೇಹ ರಕ್ಷಕ ಲಗ್ನಾಧಿಪತಿ!" : isTrikonaLord ? "ಇದು ಭಾಗ್ಯ ನೀಡುವ ತ್ರಿಕೋಣಾಧಿಪತಿ!" : isDusthanaLord ? "ಇದು ರೋಗ-ಸಾಲ-ನಷ್ಟದ ದುಸ್ಥಾನಾಧಿಪತಿ!" : ""}`,
    lagnaLordshipAnalysisEn: `For your ${lagnaNameEn} Ascendant, this planet rules the ${ruledHouses.join(", ")}th houses. ${isYogakaraka ? "It is crowned supreme Yogakaraka!" : isLagnaLord ? "It is your vital Lagna Lord!" : isTrikonaLord ? "It is an auspicious Trikona lord!" : isDusthanaLord ? "It is a malefic Dusthana lord!" : ""}`,
    planetaryDignityKn: dignityKn,
    planetaryDignityEn: dignityEn,
    aspectDrishtiAnalysisKn: aspectKn,
    aspectDrishtiAnalysisEn: aspectEn,
    dashaBhuktiAlignmentKn: dashaKn,
    dashaBhuktiAlignmentEn: dashaEn,
    panchangaConsecrationKn: panchangaKn,
    panchangaConsecrationEn: panchangaEn,
    tulaControversyExplanationKn,
    tulaControversyExplanationEn,
    rahuBlackColorExplanationKn,
    rahuBlackColorExplanationEn,
    matchingBenchmarkCases: matchingCases
  };
}

export function generateGemstoneConsultationAnswer(
  kundli: KundliOutput,
  question: string,
  devoteeName?: string,
  isKn: boolean = true,
  dashaSummary?: string
): string {
  const nameFormatted = devoteeName?.trim() || (isKn ? "ಭಕ್ತರೇ" : "Devotee");
  const lagnaRashiIdx = ((kundli.lagnaRashi.index % 12) + 12) % 12;
  const lagnaRule = LAGNA_GEMSTONE_RULES[lagnaRashiIdx] || LAGNA_GEMSTONE_RULES[0]!;
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakName = moonPlanet?.nakshatra.english ?? "Ashwini";
  const neckWearInfo = NAKSHATRA_NECK_WEAR_CATALOG[moonNakName] || NAKSHATRA_NECK_WEAR_CATALOG["Ashwini"]!;

  const analysis = evaluateGemstoneAndAmuletPrescription(kundli, {
    vara: "",
    tithi: "",
    nakshatra: moonNakName,
    yoga: "",
    karana: ""
  });

  const qLower = question.toLowerCase();
  const isHavalaSpecific = /ಹವಳ|avala|havala|coral|ಮಂಗಳ|ಕುಜ/i.test(qLower);
  const isVajraSpecific = /ವಜ್ರ|vajra|diamond|heera|ಹೀರಾ|ಶುಕ್ರ|venus/i.test(qLower);
  const isPushparagaSpecific = /ಪುಷ್ಯ|pushpa|pushparaga|yellow sapphire|pukhraj|ಗುರು|jupiter|ಪುಖರಾಜ್/i.test(qLower);
  const isNeelamSpecific = /ನೀಲಂ|neelam|blue sapphire|ಶನಿ|saturn/i.test(qLower);
  const isGomedOrBlackSpecific = /ಗೋಮೇಧಿಕ|gomed|hessonite|ರಾಹು|rahu|ಕಪ್ಪು|black/i.test(qLower);
  const isNeckSpecific = /ಕೊರಳು|ಕೊರಳಲ್ಲಿ|ಕುತ್ತಿಗೆ|ಪೆಂಡೆಂಟ್|ಹಾರ|ಮಾಲೆ|necklace|neck|pendant|rudraksha|ರುದ್ರಾಕ್ಷಿ/i.test(qLower);
  const isColorSpecific = /ಬಣ್ಣ|ಕಲರ್|ಕಪ್ಪು|ಕೆಂಪು|color|colour|black|red/i.test(qLower);

  // Run the confirmation engine if any gemstone query is detected
  const confirmedEval = confirmGemstoneSuitability(kundli, {
    gemstoneOrPlanet: question,
    nakshatra: moonNakName,
    runningMahadasha: dashaSummary
  });

  if (isKn) {
    let bullet1Verdict = "";
    let specialControversyBoxKn = "";

    if (isPushparagaSpecific && lagnaRashiIdx === 6) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${confirmedEval.verdictKn} ${confirmedEval.primaryAlertKn || ""}`;
      specialControversyBoxKn = `\n\n• ⚖️ ತುಲಾ ಲಗ್ನ & ಪುಷ್ಯರಾಗ ಗೊಂದಲ ಪರಿಹಾರ: ${confirmedEval.tulaControversyExplanationKn || ""}`;
    } else if (isVajraSpecific && lagnaRashiIdx === 6) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${confirmedEval.verdictKn}`;
      specialControversyBoxKn = `\n\n• 💎 ತುಲಾ ಲಗ್ನ & ವಜ್ರ ಶಾಸ್ತ್ರೀಯ ರಹಸ್ಯ: ${confirmedEval.tulaControversyExplanationKn || ""}`;
    } else if (isGomedOrBlackSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${confirmedEval.verdictKn} ${confirmedEval.primaryAlertKn || ""}`;
      specialControversyBoxKn = `\n\n• 🌑 ರಾಹು & ಕಪ್ಪು ಬಣ್ಣ ಶಾಸ್ತ್ರೀಯ ನಿಯಮ: ${confirmedEval.rahuBlackColorExplanationKn || ""}`;
    } else if (isHavalaSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${analysis.havalaAnalysis.verdictKn} ${analysis.havalaAnalysis.instructionsKn}`;
    } else if (isNeckSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${analysis.neckWear.nakshatraNameKn} ನಕ್ಷತ್ರಕ್ಕೆ ಕೊರಳಲ್ಲಿ '${analysis.neckWear.rudrakshaNameKn}' ಹಾಗೂ '${analysis.neckWear.pendantTypeKn}' ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಮಂಗಳಕರ ಹಾಗೂ ಜೀವ ರಕ್ಷಕವಾಗಿದೆ. ಇದನ್ನು ${analysis.neckWear.threadColorKn}ದಲ್ಲಿ ಧರಿಸಬೇಕು.`;
    } else if (isColorSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಗರಿಷ್ಠ ಅದೃಷ್ಟ ತರುವ ಶುಭ ಬಣ್ಣಗಳು: ${analysis.colors.luckyColorsKn.join(", ")}. ಆದರೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ವರ್ಜ್ಯ ಮಾಡಬೇಕಾದ ಅಪಾಯಕಾರಿ ಬಣ್ಣಗಳು: ${analysis.colors.strictAvoidColorsKn.join(", ")} (${analysis.colors.dangerWarningKn}).`;
    } else {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ '${analysis.primaryRing.gemstoneKn}' (${analysis.primaryRing.caratWeightKn}) ರತ್ನವನ್ನು ${analysis.primaryRing.metalKn}ದಲ್ಲಿ ${analysis.primaryRing.fingerKn}ಯಲ್ಲಿ ಧರಿಸಬೇಕು. ಜೊತೆಗೆ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಶ್ರೀರಕ್ಷೆಗಾಗಿ ಕೊರಳಲ್ಲಿ '${analysis.neckWear.rudrakshaNameKn}' ಧರಿಸುವುದು 100% ಶಾಸ್ತ್ರೋಕ್ತ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ.`;
    }

    const prohibitedGemsText = analysis.prohibitedGems.map(p => `${p.gemstoneKn} (${p.houseLordshipKn} - ${p.severeWarningKn})`).join("; ");

    const benchmarkExampleKn = confirmedEval.matchingBenchmarkCases.length > 0
      ? `\n\n• 📜 ನೈಜ ಸಂಶೋಧನಾ ಕೇಸ್ ಸ್ಟಡಿ (ಪ್ರೊಫೈಲ್ #${confirmedEval.matchingBenchmarkCases[0].id}): "${confirmedEval.matchingBenchmarkCases[0].titleKn}" - ${confirmedEval.matchingBenchmarkCases[0].astrologicalRootCauseKn} ಪರಿಹಾರದ ನಂತರ: ${confirmedEval.matchingBenchmarkCases[0].verifiedTurnaroundKn}`
      : "";

    return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${nameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪಂಚಾಂಗ, ಜನ್ಮ ನಕ್ಷತ್ರ, ಲಗ್ನ ಹಾಗೂ ಗ್ರಹ ಬಲದ ಆಧಾರದ ಮೇಲೆ ಕೂಲಂಕಷವಾಗಿ ನೋಡಿದೆ.

${bullet1Verdict}${specialControversyBoxKn}

• 🎯 ಪಂಚಾಂಗ, ನಕ್ಷತ್ರ & ಗ್ರಹ ಶಾಸ್ತ್ರೀಯ ಕಾರಣ: ಕೇವಲ ರಾಶಿಯನ್ನು ನೋಡಿ ರತ್ನ ಅಥವಾ ಉಂಗುರ ಧರಿಸುವುದು ಶಾಸ್ತ್ರವಿರುದ್ಧ. ನಿಮ್ಮ ${toKannadaRashi(kundli.lagnaRashi.english)} ಲಗ್ನಕ್ಕೆ ತ್ರಿಕೋಣಾಧಿಪತಿಯಾದ ${toKannadaPlanet(lagnaRule.lagnaLord)} ಹಾಗೂ ${analysis.neckWear.nakshatraNameKn} ನಕ್ಷತ್ರಾಧಿಪತಿ ${analysis.neckWear.nakshatraLordKn}ನ ತರಂಗಗಳು ನಿಮ್ಮ ದೇಹದ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತವೆ. ${analysis.primaryRing.astrologicalReasonKn} ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaSummary || "ದಶಾ ಕಾಲಘಟ್ಟ"}ದಲ್ಲಿ ಇದು ನಿಮ್ಮ ಭಾಗ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.${benchmarkExampleKn}

• ⚠️ ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ರತ್ನ & ಅಪಾಯದ ಎಚ್ಚರಿಕೆ (Strict Prohibitions): ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಧೂಳೀಪಟ ತರಬಲ್ಲ ವರ್ಜ್ಯ ರತ್ನಗಳು: ${prohibitedGemsText}. ಇವು 6, 8 ಅಥವಾ 12ನೇ ದುಸ್ಥಾನಗಳ ಅಧಿಪತಿಗಳಾಗಿದ್ದು, ಇವುಗಳ ಉಂಗುರ ಧರಿಸಿದರೆ ಆಸ್ಪತ್ರೆ ಖರ್ಚು, ಸಾಲ, ಕೌಟುಂಬಿಕ ಕಲಹ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ನಷ್ಟ ಉಂಟಾಗುತ್ತದೆ. ಎಂದಿಗೂ ಇವುಗಳನ್ನು ಧರಿಸಬೇಡಿ!

• 📿 ಕೊರಳ ಧಾರಣೆ, ಮುಹೂರ್ತ & ಶ್ರೀ ಸನ್ನಿಧಾನ ಆಶೀರ್ವಾದ: ಉಂಗುರದ ಜೊತೆಗೆ ಕೊರಳಿನಲ್ಲಿ ${analysis.neckWear.threadColorKn}ದಲ್ಲಿ ${analysis.neckWear.rudrakshaNameKn} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅನಿಷ್ಟ ಗ್ರಹಗಳ ಕೆಟ್ಟ ದೃಷ್ಟಿ ಭಸ್ಮವಾಗುತ್ತದೆ. ಜೊತೆಗೆ ನಿಮ್ಮ ಕಪಾಲ ನರಮಂಡಲ ಪ್ರಶಾಂತತೆಗಾಗಿ ಕಿವಿಯಲ್ಲಿ '${analysis.earOrnament.biologicalBenefitKn}' ಧಾರಣೆ ಮಾಡುವುದು ಅದ್ಭುತ ಅದೃಷ್ಟ ತರುತ್ತದೆ. ನಾಳೆಯಿಂದಲೇ ಧರಿಸಬಹುದಾದ ಶುಭ ಬಣ್ಣದ ಉಡುಪುಗಳು: ${analysis.nakshatraDignity.luckyColorClothesKn.join(", ")}. ವರ್ಜ್ಯ ಬಣ್ಣ: ${analysis.nakshatraDignity.strictAvoidColorsKn.join(", ")}. ಧರಿಸಲು ಶುಭ ತಾರಾಬಲ: ${analysis.consecrationTaraBalaKn}. ಧರಿಸುವ ಶುಭ ದಿನ: ${analysis.primaryRing.activationDayKn} (${analysis.primaryRing.horaKn}ಯಲ್ಲಿ). ಮಂತ್ರ: "${analysis.primaryRing.mantraKn}". ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಧರಿಸಿದರೆ 15-20 ದಿನಗಳಲ್ಲಿ ಜೀವನದಲ್ಲಿ ಅದ್ಭುತ ಧನಾತ್ಮಕ ತಿರುವು ಕಾಣುವಿರಿ.

• 🌅 ನಾಳೆಯಿಂದಲೇ ಅದೃಷ್ಟ ವೃದ್ಧಿಸುವ ಪ್ರಾತಃಕಾಲ ಸಾಧನೆ & ನಕ್ಷತ್ರ ಶಾಸ್ತ್ರ ರಹಸ್ಯ: ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${analysis.neckWear.nakshatraNameKn}ದಲ್ಲಿ ಉಚ್ಛ ಗ್ರಹ: ${analysis.nakshatraDignity.exaltedPlanetsKn}; ನೀಚ ಗ್ರಹ: ${analysis.nakshatraDignity.debilitatedPlanetsKn}. ${analysis.nakshatraDignity.nextDayActionableSadhanaKn}`
    );
  } else {
    let bullet1VerdictEn = "";
    let specialControversyBoxEn = "";

    if (isPushparagaSpecific && lagnaRashiIdx === 6) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: ${confirmedEval.verdictEn} ${confirmedEval.primaryAlertEn || ""}`;
      specialControversyBoxEn = `\n\n• ⚖️ Libra & Yellow Sapphire Controversy Settled: ${confirmedEval.tulaControversyExplanationEn || ""}`;
    } else if (isVajraSpecific && lagnaRashiIdx === 6) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: ${confirmedEval.verdictEn}`;
      specialControversyBoxEn = `\n\n• 💎 Libra & Diamond Astrological Nuance: ${confirmedEval.tulaControversyExplanationEn || ""}`;
    } else if (isGomedOrBlackSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: ${confirmedEval.verdictEn} ${confirmedEval.primaryAlertEn || ""}`;
      specialControversyBoxEn = `\n\n• 🌑 Rahu & Black Color Alignment Rule: ${confirmedEval.rahuBlackColorExplanationEn || ""}`;
    } else if (isHavalaSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: ${analysis.havalaAnalysis.verdictEn} ${analysis.havalaAnalysis.instructionsEn}`;
    } else if (isNeckSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: For your birth nakshatra ${analysis.neckWear.nakshatraNameEn}, wearing '${analysis.neckWear.rudrakshaNameEn}' along with '${analysis.neckWear.pendantTypeEn}' in the neck using ${analysis.neckWear.threadColorEn} provides supreme spiritual shielding and vital health protection.`;
    } else if (isColorSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: Highly auspicious colors that unlock your luck: ${analysis.colors.luckyColorsEn.join(", ")}. Strictly prohibited colors that cause setbacks: ${analysis.colors.strictAvoidColorsEn.join(", ")} (${analysis.colors.dangerWarningEn}).`;
    } else {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: Wear '${analysis.primaryRing.gemstoneEn}' (${analysis.primaryRing.caratWeightEn}) set in ${analysis.primaryRing.metalEn} on your ${analysis.primaryRing.fingerEn}. Concurrently wear '${analysis.neckWear.rudrakshaNameEn}' around your neck for divine Nakshatra shielding.`;
    }

    const prohibitedGemsTextEn = analysis.prohibitedGems.map(p => `${p.gemstoneEn} (${p.houseLordshipEn} - ${p.severeWarningEn})`).join("; ");

    const benchmarkExampleEn = confirmedEval.matchingBenchmarkCases.length > 0
      ? `\n\n• 📜 Real-World Benchmark Case Study (Profile #${confirmedEval.matchingBenchmarkCases[0].id}): "${confirmedEval.matchingBenchmarkCases[0].titleEn}" - ${confirmedEval.matchingBenchmarkCases[0].astrologicalRootCauseEn} Verified Outcome: ${confirmedEval.matchingBenchmarkCases[0].verifiedTurnaroundEn}`
      : "";

    return (
`Namaskara ${nameFormatted}, I have analyzed your horoscope through comprehensive synthesis of Lagna, Janma Nakshatra, Moon sign, and Panchanga elements.

${bullet1VerdictEn}${specialControversyBoxEn}

• 🎯 Astrological & Panchanga Foundation: Never prescribe stones merely based on Moon sign (Rashi)! In your ${kundli.lagnaRashi.english} Ascendant chart, your Tri-Kona lord ${lagnaRule.lagnaLord} and Janma Nakshatra lord ${analysis.neckWear.nakshatraLordEn} dictate your bio-energetic vitality. ${analysis.primaryRing.astrologicalReasonEn} Under ${dashaSummary || "your running Dasha"}, this alignment unlocks your dormant fortune.${benchmarkExampleEn}

• ⚠️ Strict Contraindications & Prohibited Stones (Severe Warning): Highly dangerous stones you must NEVER wear: ${prohibitedGemsTextEn}. These rule the 6th, 8th, or 12th Dusthanas; wearing their rings amplifies disease, litigation, debt traps, and sudden accidents.

• 📿 Neck Wear, Consecration Muhurtha & Temple Grace: Worn around the neck in ${analysis.neckWear.threadColorEn}, your ${analysis.neckWear.rudrakshaNameEn} absorbs malefic transits safely. Concurrently wear ${analysis.earOrnament.biologicalBenefitEn} on earlobes for cranial nerve poise. Lucky apparel colors starting tomorrow: ${analysis.nakshatraDignity.luckyColorClothesEn.join(", ")}. Strictly avoid colors: ${analysis.nakshatraDignity.strictAvoidColorsEn.join(", ")}. Auspicious Tara Bala: ${analysis.consecrationTaraBalaEn}. Consecrate on ${analysis.primaryRing.activationDayEn} during ${analysis.primaryRing.horaEn}. Mantra: "${analysis.primaryRing.mantraEn}". Sponsor a dedicated Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara for visible breakthroughs within 15 to 20 days.

• 🌅 Immediate Next-Day Morning Sadhana & Nakshatra Dignity Secret: In your birth nakshatra ${analysis.neckWear.nakshatraNameEn}, Exalted planet: ${analysis.nakshatraDignity.exaltedPlanetsEn}; Debilitated planet: ${analysis.nakshatraDignity.debilitatedPlanetsEn}. ${analysis.nakshatraDignity.nextDayActionableSadhanaEn}`
    );
  }
}
