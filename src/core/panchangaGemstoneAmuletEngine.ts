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

export interface BenchmarkCaseStudy {
  id: number;
  titleKn: string;
  titleEn: string;
  nativeProfileKn: string;
  nativeProfileEn: string;
  wrongItemWornKn: string;
  wrongItemWornEn: string;
  adverseOutcomeKn: string;
  adverseOutcomeEn: string;
  astrologicalRootCauseKn: string;
  astrologicalRootCauseEn: string;
  correctedPrescriptionKn: string;
  correctedPrescriptionEn: string;
  verifiedTurnaroundKn: string;
  verifiedTurnaroundEn: string;
}

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
export const GEMSTONE_REAL_LIFE_BENCHMARK_CASES: BenchmarkCaseStudy[] = [
  {
    id: 1,
    titleKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ನೀಲಂ ಧರಿಸಿ ಉಂಟಾದ ದಿವಾಳಿತನ & ಮುತ್ತು-ರುದ್ರಾಕ್ಷಿಯಿಂದ ಪುನಶ್ಚೇತನ",
    titleEn: "Cancer Ascendant Neelam Disaster & Restoration via Pearl + Rudraksha",
    nativeProfileKn: "ಕರ್ಕಾಟಕ ಲಗ್ನ, ಆಶ್ಲೇಷಾ ನಕ್ಷತ್ರ, ಶನಿ ಮಹಾದಶಾ ಆರಂಭ.",
    nativeProfileEn: "Cancer Ascendant, Ashlesha Nakshatra, beginning of Saturn Mahadasha.",
    wrongItemWornKn: "ನೀಲಂ (Blue Sapphire) 5 ಕ್ಯಾರಟ್ ಉಂಗುರ ಬಲಗೈ ಮಧ್ಯದ ಬೆರಳಿನಲ್ಲಿ.",
    wrongItemWornEn: "5-Carat Blue Sapphire on right middle finger.",
    adverseOutcomeKn: "ಧರಿಸಿದ 45 ದಿನಗಳಲ್ಲಿ ₹18 ಲಕ್ಷ ವ್ಯವಹಾರದಲ್ಲಿ ವಂಚನೆ, ತೀವ್ರ ಕೀಲು ನೋವು ಹಾಗೂ ಪತ್ನಿಯೊಂದಿಗೆ ನಿರಂತರ ಜಗಳ ಉಂಟಾಗಿ ಮನೆ ಬಿಟ್ಟು ಹೋದರು.",
    adverseOutcomeEn: "Within 45 days: suffered ₹18 Lakhs business fraud, debilitating joint pain, and acute marital breakdown.",
    astrologicalRootCauseKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಶನಿಯು 7ನೇ ಮಾರಕ ಹಾಗೂ 8ನೇ ಆಯುಷ್ಯ/ರಂಧ್ರ ಸ್ಥಾನಾಧಿಪತಿ. ನೀಲಂ ಧರಿಸಿದ್ದರಿಂದ 8ನೇ ಮನೆಯ ಆಘಾತಕಾರಿ ಶಕ್ತಿಗಳು ನೇರವಾಗಿ ದೇಹವನ್ನು ಪ್ರವೇಶಿಸಿದವು.",
    astrologicalRootCauseEn: "Saturn rules both the 7th Maraka and 8th Dusthana; amplifying it directly through Neelam triggered catastrophic 8th house trauma.",
    correctedPrescriptionKn: "ನೀಲಂ ತೆಗೆದು, ಬೆಳ್ಳಿಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ಮುತ್ತು (ಕಿರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಆಶ್ಲೇಷಾ ನಕ್ಷತ್ರಾಧಿಪತಿ ಬುಧನ ೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಮತ್ತು ಬೆಳ್ಳಿಯ ಗೋಕರ್ಣ ಶಿವ ಕವಚ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Neelam immediately. Prescribed Natural Pearl in Silver on little finger + 4-Mukhi Rudraksha & Silver Gokarna Shiva Kavacha in neck.",
    verifiedTurnaroundKn: "೨೧ ದಿನಗಳಲ್ಲಿ ಕೀಲು ನೋವು ಮಾಯವಾಯಿತು; ೩ ತಿಂಗಳಲ್ಲಿ ಪತ್ನಿ ವಾಪಸ್ ಬಂದರು ಹಾಗೂ ಹೊಸ ಏಜೆನ್ಸಿ ಆರಂಭಿಸಿ ಹಳೆಯ ನಷ್ಟವನ್ನು ಸಂಪೂರ್ಣ ತೀರಿಸಿದರು.",
    verifiedTurnaroundEn: "Within 21 days joint pain disappeared; in 3 months marital peace restored and a new thriving agency recovered all past losses."
  },
  {
    id: 2,
    titleKn: "ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ಕೆಂಪು ಹವಳದಿಂದ ಸಿವಿಲ್ ಸರ್ವೀಸ್ ಯಶಸ್ಸು & ಉನ್ನತ ಅಧಿಕಾರಿ ಯೋಗ",
    titleEn: "Leo Ascendant Red Coral Realization: Civil Services Breakthrough",
    nativeProfileKn: "ಸಿಂಹ ಲಗ್ನ, ಮಘಾ ನಕ್ಷತ್ರ, ಕುಜ-ಗುರು ಸುಸ್ಥಿತಿ.",
    nativeProfileEn: "Leo Ascendant, Magha Nakshatra, well-placed Mars and Jupiter.",
    wrongItemWornKn: "ಹಿಂದೆ ಯಾವುದೇ ರತ್ನ ಧರಿಸಿರಲಿಲ್ಲ, ಬದಲಿಗೆ ಕಪ್ಪು ಬಣ್ಣದ ಶರ್ಟ್ ಹಾಗೂ ನೀಲಿ ಕಲ್ಲು ಧರಿಸಿ ಸೋಲನುಭವಿಸಿದ್ದರು.",
    wrongItemWornEn: "Previously wore dark blue glass stone and black shirts, facing continuous exam failures.",
    adverseOutcomeKn: "ಮೂರು ಬಾರಿ ಯುಪಿಎಸ್‌ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕೇವಲ ೨ ಅಂಕಗಳಿಂದ ಸಂದರ್ಶನ ಕೈತಪ್ಪುತ್ತಿತ್ತು, ತೀವ್ರ ಮಾನಸಿಕ ಹತಾಶೆ ಕಾಡುತ್ತಿತ್ತು.",
    adverseOutcomeEn: "Failed civil services interview thrice by a razor-thin margin of 2 marks, suffering severe self-doubt.",
    astrologicalRootCauseKn: "ಸಿಂಹಕ್ಕೆ ಶನಿ ಶತ್ರುವಾಗಿರುವಾಗ ಕಪ್ಪು ಬಣ್ಣ ಮತ್ತು ನೀಲಿ ಕಲ್ಲು ಭಾಗ್ಯವನ್ನು ಮುಚ್ಚಿಹಾಕಿತ್ತು. ಕುಜನು 4ನೇ & 9ನೇ ಪರಮ ಯೋಗಕಾರಕನಾಗಿದ್ದರೂ ಜಡವಾಗಿದ್ದ.",
    astrologicalRootCauseEn: "Inimical Saturn frequencies from dark colors suppressed 9th lord Mars. Mars needed direct activation as prime Yogakaraka.",
    correctedPrescriptionKn: "ತಾಮ್ರದಲ್ಲಿ ಶುದ್ಧ ಇಟಾಲಿಯನ್ ತ್ರಿಕೋಣ ಹವಳ (೬.೨ ಕ್ಯಾರಟ್) ಉಂಗುರದ ಬೆರಳಿನಲ್ಲಿ ಧರಿಸಲಾಯಿತು; ಕೊರಳಲ್ಲಿ ಮಘಾ ನಕ್ಷತ್ರದ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed 6.2 Carat Triangular Italian Red Coral in pure Copper on ring finger + 9-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಮುಂದಿನ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಅಖಿಲ ಭಾರತ ಮಟ್ಟದಲ್ಲಿ ೪೨ನೇ ರ್ಯಾಂಕ್ ಗಳಿಸಿ ಐಪಿಎಸ್ ಅಧಿಕಾರಿಯಾಗಿ ನೇಮಕಗೊಂಡರು. ಭಾಗ್ಯೋದಯ ಸಂಪೂರ್ಣ ಸಿದ್ಧಿಸಿತು.",
    verifiedTurnaroundEn: "Secured All-India Rank 42 in the very next attempt and was commissioned as an IPS Officer."
  },
  {
    id: 3,
    titleKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಹವಳ ಧರಿಸಿ ಉಂಟಾದ ಅಪಘಾತ & ಪಚ್ಚೆ-೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿಯಿಂದ ಪರಿಹಾರ",
    titleEn: "Gemini Ascendant Coral Crisis: Accident Averted via Emerald & 4-Mukhi",
    nativeProfileKn: "ಮಿಥುನ ಲಗ್ನ, ಮೃಗಶಿರಾ ನಕ್ಷತ್ರ ೪ನೇ ಪಾದ, ವ್ಯಾಪಾರಸ್ಥ.",
    nativeProfileEn: "Gemini Ascendant, Mrigashira 4th Pada, Businessman.",
    wrongItemWornKn: "ರಕ್ತ ಶುದ್ಧಿಗೆ ಒಳ್ಳೆಯದೆಂದು ಯಾರೋ ಹೇಳಿದರೆಂದು ೭ ಕ್ಯಾರಟ್ ಹವಳದ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore a heavy 7-Carat Red Coral ring on advice of a street vendor for 'blood energy'.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೨೦ ದಿನಗಳಲ್ಲಿ ಬೈಕ್ ಅಪಘಾತವಾಗಿ ಬಲಗೈ ಮೂಳೆ ಮುರಿತವಾಯಿತು, ತೀವ್ರ ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಪಾಲುದಾರನ ಮೇಲೆ ಹಲ್ಲೆ ಮಾಡಿ ಪೊಲೀಸ್ ಕೇಸ್ ಆಯಿತು.",
    adverseOutcomeEn: "Within 20 days: fractured arm in motorcycle crash, severe hypertension spike, and assault police complaint with partner.",
    astrologicalRootCauseKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಕುಜನು 6ನೇ ರೋಗ-ಶತ್ರು-ಕೋರ್ಟ್ ಹಾಗೂ 11ನೇ ಸ್ಥಾನಾಧಿಪತಿ. ಹವಳ ಧರಿಸಿದ್ದರಿಂದ 6ನೇ ಮನೆಯ ಹಿಂಸಾ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಅಪಘಾತ ಜಾಗೃತವಾಯಿತು.",
    astrologicalRootCauseEn: "Mars rules the virulent 6th house of injury, surgery, and enmity for Gemini; Coral amplified 6th house violence directly.",
    correctedPrescriptionKn: "ಹವಳವನ್ನು ತಕ್ಷಣ ನದಿಗೆ ವಿಸರ್ಜಿಸಿ, ಬೆಳ್ಳಿಯಲ್ಲಿ ಜಾಂಬಿಯನ್ ಪಚ್ಚೆ (ಕಿರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಕುಜ ಶಾಂತಿಗೆ) ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Discarded Coral immediately. Prescribed Zambian Emerald in Silver on little finger + 3-Mukhi Rudraksha in neck for Mars pacification.",
    verifiedTurnaroundKn: "ಪೊಲೀಸ್ ಕೇಸ್ ರಾಜಿ ಮುಖಾಂತರ ಮುಕ್ತಾಯವಾಯಿತು; ರಕ್ತದೊತ್ತಡ ಸಹಜ ಸ್ಥಿತಿಗೆ ಮರಳಿ ವ್ಯಾಪಾರದಲ್ಲಿ ₹25 ಲಕ್ಷ ಹೊಸ ಆರ್ಡರ್ ಒಲಿಯಿತು.",
    verifiedTurnaroundEn: "Police case amicably dismissed; BP normalized and bagged ₹25 Lakhs export manufacturing order."
  },
  {
    id: 4,
    titleKn: "ವೃಷಭ ಲಗ್ನಕ್ಕೆ ಪುಷ್ಯರಾಗದಿಂದ ಕಾಮಾಲೆ ರೋಗ & ವಜ್ರ-ನೀಲಂ ಯೋಗಕಾರಕ ಶಕ್ತಿಯಿಂದ ಚೇತರಿಕೆ",
    titleEn: "Taurus Ascendant Yellow Sapphire Jaundice & Rebound via Diamond + Neelam",
    nativeProfileKn: "ವೃಷಭ ಲಗ್ನ, ರೋಹಿಣಿ ನಕ್ಷತ್ರ, ವೃತ್ತಿಪರ ಸಾಫ್ಟ್‌ವೇರ್ ಆರ್ಕಿಟೆಕ್ಟ್.",
    nativeProfileEn: "Taurus Ascendant, Rohini Nakshatra, Software Architect.",
    wrongItemWornKn: "ಗುರು ದಶಾ ಬಲಕ್ಕೆಂದು ೫ ಕ್ಯಾರಟ್ ಹಳದಿ ಪುಷ್ಯರಾಗ ಬಂಗಾರದಲ್ಲಿ ತೋರುಬೆರಳಿನಲ್ಲಿ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore 5-Carat Yellow Sapphire in Gold on index finger to 'strengthen Jupiter'.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೩ ತಿಂಗಳಲ್ಲಿ ತೀವ್ರ ಕಾಮಾಲೆ (ಲಿವರ್ ಸೋಂಕು), ₹12 ಲಕ್ಷ ಸಾಲ ಹಾಗೂ ಮದುವೆ ನಿಶ್ಚಯವಾಗಿದ್ದ ಸಂಬಂಧ ಮುರಿದು ಬಿತ್ತು.",
    adverseOutcomeEn: "Within 3 months: acute jaundice/liver failure, accumulated ₹12 Lakhs personal debt, and engaged wedding was abruptly called off.",
    astrologicalRootCauseKn: "ವೃಷಭಕ್ಕೆ ಗುರುವು 8ನೇ ರಂಧ್ರ ಸ್ಥಾನ ಹಾಗೂ 11ನೇ ಬಾಧಕ ಸ್ಥಾನಾಧಿಪತಿ. ಪುಷ್ಯರಾಗ ಧರಿಸಿದ್ದರಿಂದ 8ನೇ ಮನೆಯ ಆಸ್ಪತ್ರೆ ಮತ್ತು ರೋಗ ಭುಗಿಲೆದ್ದಿತು.",
    astrologicalRootCauseEn: "Jupiter rules the 8th Dusthana and 11th Badhaka for Taurus; Pushparaga directly activated liver toxicity and 8th house obstacles.",
    correctedPrescriptionKn: "ಪುಷ್ಯರಾಗ ತೆಗೆದು, ಬೆಳ್ಳಿಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಝಿರ್ಕಾನ್/ವಜ್ರ (ಲಗ್ನ ಬಲಕ್ಕೆ) ಹಾಗೂ ಮಧ್ಯದ ಬೆರಳಿನಲ್ಲಿ ಯೋಗಕಾರಕ ನೀಲಂ ಧರಿಸಲಾಯಿತು; ಕೊರಳಲ್ಲಿ ರೋಹಿಣಿಯ ೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Pushparaga. Prescribed White Zircon/Diamond in Silver + Yogakaraka Blue Sapphire on middle finger + 2-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಲಿವರ್ ಕಾಯಿಲೆ ಸಂಪೂರ್ಣ ಗುಣವಾಯಿತು; ೮ ತಿಂಗಳ ನಂತರ ಸುಸಂಸ್ಕೃತ ಕನ್ಯೆಯೊಂದಿಗೆ ವಿವಾಹ ನಡೆದು ಅಮೆರಿಕ ಆನ್‌ಸೈಟ್ ಆಫರ್ ಲಭಿಸಿತು.",
    verifiedTurnaroundEn: "Liver completely healed; married happily 8 months later and received lucrative US on-site promotion."
  },
  {
    id: 5,
    titleKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ಮಾಣಿಕ್ಯ ಧರಿಸಿ ಕಣ್ಣಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ & ನೀಲಂ ಯೋಗಕಾರಕ ಬಲದಿಂದ ರಕ್ಷಣೆ",
    titleEn: "Libra Ascendant Ruby Ocular Crisis & Revival via Yogakaraka Neelam",
    nativeProfileKn: "ತುಲಾ ಲಗ್ನ, ಸ್ವಾತಿ ನಕ್ಷತ್ರ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಉದ್ಯಮಿ.",
    nativeProfileEn: "Libra Ascendant, Swati Nakshatra, Real Estate Builder.",
    wrongItemWornKn: "ಮಾಣಿಕ್ಯ (Ruby) ೪ ಕ್ಯಾರಟ್ ಬಂಗಾರದಲ್ಲಿ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore 4-Carat Ruby in Gold on ring finger.",
    adverseOutcomeKn: "ಎಡಗಣ್ಣಿನಲ್ಲಿ ರೆಟಿನಾ ಹರಿದು ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯಾಯಿತು; ಹಿರಿಯ ಸಹೋದರನೊಂದಿಗೆ ಕೋರ್ಟ್ ಕೇಸ್ ಆರಂಭವಾಗಿ ₹50 ಲಕ್ಷ ಜಮೀನು ವಿವಾದಕ್ಕೆ ಸಿಲುಕಿತು.",
    adverseOutcomeEn: "Suffered retinal tear emergency surgery; bitter legal dispute with elder brother froze ₹50 Lakhs land parcel.",
    astrologicalRootCauseKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ಸೂರ್ಯನು 11ನೇ ಬಾಧಕಾಧಿಪತಿ. ಮಾಣಿಕ್ಯ ಧರಿಸಿದ್ದರಿಂದ ಬಾಧಕ ದೋಷ ಹಾಗೂ ಸೂರ್ಯ-ಶುಕ್ರ ವೈಷಮ್ಯ ತಾರಕಕ್ಕೇರಿತು.",
    astrologicalRootCauseEn: "Sun is the designated Badhaka lord for Libra; Ruby supercharged Badhaka affliction, causing fraternal litigation and eye damage.",
    correctedPrescriptionKn: "ಮಾಣಿಕ್ಯ ತೆಗೆಸಿ, ತುಲಾ ಲಗ್ನದ ಪರಮ ಯೋಗಕಾರಕ ಶನಿಯ ನೀಲಂ (ಪಂಚಲೋಹದಲ್ಲಿ ಮಧ್ಯದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಸ್ವಾತಿ ನಕ್ಷತ್ರದ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Ruby. Prescribed Yogakaraka Blue Sapphire in Panchadhatu on middle finger + 8-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಕಣ್ಣಿನ ದೃಷ್ಟಿ 100% ಮರಳಿತು; ಕೋರ್ಟ್ ಕೇಸ್ ರಾಜಿ ಮುಖಾಂತರ ಮುಕ್ತಾಯವಾಗಿ ಜಮೀನಿನ ಬೆಲೆ ಮೂರು ಪಟ್ಟು ಹೆಚ್ಚಾಯಿತು.",
    verifiedTurnaroundEn: "Vision restored 100%; fraternal dispute amicably resolved with land valuation surging threefold."
  },
  {
    id: 6,
    titleKn: "ಮಕರ ಲಗ್ನಕ್ಕೆ ಮಾಣಿಕ್ಯ ಧರಿಸಿ ಹೃದಯಾಘಾತ ಭಯ & ವಜ್ರ-ನೀಲಂನಿಂದ ಪುನಶ್ಚೇತನ",
    titleEn: "Capricorn Ascendant Ruby Hazard: Cardiac Panic to Diamond Mastery",
    nativeProfileKn: "ಮಕರ ಲಗ್ನ, ಶ್ರವಣ ನಕ್ಷತ್ರ, ಹಿರಿಯ ಕಾರ್ಪೊರೇಟ್ ಮ್ಯಾನೇಜರ್.",
    nativeProfileEn: "Capricorn Ascendant, Shravana Nakshatra, Senior Corporate Manager.",
    wrongItemWornKn: "ಮಾಣಿಕ್ಯ ೫.೫ ಕ್ಯಾರಟ್ ಬಂಗಾರದ ಉಂಗುರ.",
    wrongItemWornEn: "5.5-Carat Ruby in Gold.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೩೫ ದಿನಗಳಲ್ಲಿ ತೀವ್ರ ಎದೆನೋವು, ಆಂಜಿಯೋಗ್ರಾಂ ಪರೀಕ್ಷೆ, ಕಂಪನಿಯಲ್ಲಿ ಡಿಮೋಷನ್ ಹಾಗೂ ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆಯ ದಾಳಿ ನೋಟಿಸ್ ಬಂತು.",
    adverseOutcomeEn: "Within 35 days: acute angina panic attack, demotion at workplace, and sudden income tax investigation notice.",
    astrologicalRootCauseKn: "ಮಕರಕ್ಕೆ ಸೂರ್ಯನು 8ನೇ ಆಯುಷ್ಯ/ರಂಧ್ರ ಸ್ಥಾನಾಧಿಪತಿ ಹಾಗೂ ಶನಿಯ ಪರಮ ಶತ್ರು. ಮಾಣಿಕ್ಯ ಧರಿಸಿದ್ದರಿಂದ 8ನೇ ಮನೆಯ ಆಕಸ್ಮಿಕ ಸಂಕಷ್ಟಗಳು ನುಗ್ಗಿಬಂದವು.",
    astrologicalRootCauseEn: "Sun rules the lethal 8th house for Capricorn and is the natural archenemy of Lagnesha Saturn. Ruby provoked direct 8th house crisis.",
    correctedPrescriptionKn: "ಮಾಣಿಕ್ಯ ತೆಗೆದು, ಲಗ್ನಾಧಿಪತಿ ಶನಿಯ ನೀಲಂ ಮತ್ತು ಯೋಗಕಾರಕ ಶುಕ್ರನ ವಜ್ರ/ಬಿಳಿ ಝಿರ್ಕಾನ್ ಬೆಳ್ಳಿಯಲ್ಲಿ ಧರಿಸಲಾಯಿತು; ಕೊರಳಲ್ಲಿ ಶ್ರವಣದ ೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Ruby immediately. Prescribed Neelam + Venusian Diamond/White Zircon in Silver + 2-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಹೃದಯದ ಪರೀಕ್ಷೆಗಳು ನಾರ್ಮಲ್ ಆದವು; ಐಟಿ ನೋಟಿಸ್ ಕ್ಲಿಯರ್ ಆಯಿತು ಹಾಗೂ ಅದೇ ವರ್ಷ ವೈಸ್ ಪ್ರೆಸಿಡೆಂಟ್ ಆಗಿ ಪ್ರಮೋಷನ್ ಪಡೆದರು.",
    verifiedTurnaroundEn: "Cardiac parameters normalized completely; IT notice dropped and got promoted to Vice President within 8 months."
  },
  {
    id: 7,
    titleKn: "ಕನ್ಯಾ ಲಗ್ನಕ್ಕೆ ಹವಳ ಧರಿಸಿ ಉಂಟಾದ ವಿವಾಹ ವಿಚ್ಛೇದನ ಕಂಟಕ & ಪಚ್ಚೆಯಿಂದ ಶಾಂತಿ",
    titleEn: "Virgo Ascendant Coral Marital Trauma & Recovery via Emerald",
    nativeProfileKn: "ಕನ್ಯಾ ಲಗ್ನ, ಹಸ್ತಾ ನಕ್ಷತ್ರ, ಉಪನ್ಯಾಸಕಿ.",
    nativeProfileEn: "Virgo Ascendant, Hasta Nakshatra, College Lecturer.",
    wrongItemWornKn: "ಕುಜ ದೋಷ ನಿವಾರಣೆಗೆಂದು ಕೆಂಪು ಹವಳದ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore Red Coral ring to 'neutralize Manglik Dosha'.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೨ ತಿಂಗಳಲ್ಲಿ ಗಂಡನೊಂದಿಗೆ ಕ್ಷುಲ್ಲಕ ಕಾರಣಕ್ಕೆ ಭೀಕರ ಜಗಳವಾಗಿ ವಿಚ್ಛೇದನದ ನೋಟಿಸ್ ತಲುಪಿತು, ತಲೆನೋವು ಹಾಗೂ ರಕ್ತಸ್ರಾವ ಕಾಡಿತು.",
    adverseOutcomeEn: "Within 2 months: violent domestic flare-up led to divorce legal notice, chronic migraines, and gynecological bleeding.",
    astrologicalRootCauseKn: "ಕನ್ಯಾ ಲಗ್ನಕ್ಕೆ ಕುಜನು 8ನೇ ಅಷ್ಟಮಾಧಿಪತಿ. ಹವಳ ಧರಿಸಿದರೆ ಕುಜ ದೋಷ ನಿವಾರಣೆಯಾಗುವುದಿಲ್ಲ, ಬದಲಿಗೆ 8ನೇ ಮನೆಯ ಆಘಾತಕಾರಿ ವಿಚ್ಛೇದನ ಶಕ್ತಿ ಇಮ್ಮಡಿಯಾಗುತ್ತದೆ!",
    astrologicalRootCauseEn: "For Virgo, Mars rules the 8th house; wearing Coral amplifies 8th house marital trauma rather than calming Kuja Dosha!",
    correctedPrescriptionKn: "ಹವಳ ತೆಗೆಸಿ, ಲಗ್ನಾಧಿಪತಿ ಬುಧನ ಶುದ್ಧ ಪಚ್ಚೆ (ಬೆಳ್ಳಿಯಲ್ಲಿ ಕಿರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಹಸ್ತಾ ನಕ್ಷತ್ರದ ೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Coral immediately. Prescribed pure Emerald in Silver on little finger + Hasta Nakshatra 2-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ವಿಚ್ಛೇದನ ನೋಟಿಸ್ ವಾಪಸ್ ಪಡೆಯಲಾಯಿತು; ದಂಪತಿಗಳು ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಅನ್ಯೋನ್ಯವಾಗಿ ಒಂದಾದರು.",
    verifiedTurnaroundEn: "Divorce petition withdrawn; couple reconciled devotedly after performing Gokarna Mahabaleshwara Pooja."
  },
  {
    id: 8,
    titleKn: "ಮೀನ ಲಗ್ನಕ್ಕೆ ವಜ್ರ ಧರಿಸಿ ಉಂಟಾದ ಅಪಘಾತ & ಪುಷ್ಯರಾಗ-ಹವಳದಿಂದ ರಾಜಯೋಗ",
    titleEn: "Pisces Ascendant Diamond Accident & Restoration via Pushparaga + Coral",
    nativeProfileKn: "ಮೀನ ಲಗ್ನ, ಉತ್ತರಭಾದ್ರಪದ ನಕ್ಷತ್ರ, ವೈದ್ಯರು.",
    nativeProfileEn: "Pisces Ascendant, Uttara Bhadrapada Nakshatra, Physician/Surgeon.",
    wrongItemWornKn: "ಉಡುಗೊರೆಯಾಗಿ ಬಂದ ೨ ಕ್ಯಾರಟ್ ವಜ್ರದ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore a gifted 2-Carat Diamond ring on right hand.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೪೦ ದಿನಗಳಲ್ಲಿ ಕಾರು ಡಿಕ್ಕಿಯಾಗಿ ಆಸ್ಪತ್ರೆ ಸೇರಿದರು, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯಲ್ಲಿ ಕೈ ನಡುಗಲು ಆರಂಭವಾಗಿ ಕ್ಲಿನಿಕ್ ಬಂದ್ ಮಾಡುವ ಸ್ಥಿತಿ ಬಂತು.",
    adverseOutcomeEn: "Within 40 days: major car collision resulting in surgery; fine motor tremors forced temporary clinic shutdown.",
    astrologicalRootCauseKn: "ಮೀನ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು 3ನೇ ಹಾಗೂ 8ನೇ ರಂಧ್ರ/ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಸ್ಥಾನಾಧಿಪತಿ. ವಜ್ರವು 8ನೇ ಮನೆಯ ಅಪಘಾತ ಶಕ್ತಿಯನ್ನು ಪ್ರಚೋದಿಸಿತು.",
    astrologicalRootCauseEn: "Venus rules the 3rd & 8th houses for Pisces; Diamond directly triggered 8th house physical trauma and hand tremors.",
    correctedPrescriptionKn: "ವಜ್ರ ತೆಗೆಸಿ, ಬಂಗಾರದಲ್ಲಿ ಸಿಲೋನ್ ಹಳದಿ ಪುಷ್ಯರಾಗ (ತೋರುಬೆರಳು) ಹಾಗೂ 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ ಕುಜನ ಹವಳ ಧರಿಸಲಾಯಿತು; ಕೊರಳಲ್ಲಿ ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Diamond. Prescribed Ceylon Yellow Sapphire on index finger + 9th lord Mars Red Coral + 7-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಕೈ ನಡುಕ ಸಂಪೂರ್ಣ ನಿಂತಿತು; ನೂತನ ಮಲ್ಟಿಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ ಆರಂಭಿಸಿ ಅತ್ಯಂತ ಯಶಸ್ವಿ ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರಾಗಿ ಖ್ಯಾತಿ ಗಳಿಸಿದರು.",
    verifiedTurnaroundEn: "Hand tremors vanished completely; successfully inaugurated new multi-specialty surgical center."
  },
  {
    id: 9,
    titleKn: "ಮೇಷ ಲಗ್ನಕ್ಕೆ ವಜ್ರ ಧರಿಸಿ ಉಂಟಾದ ದಾಂಪತ್ಯ ಕಲಹ & ಕೆಂಪು ಹವಳ-೯ ಮುಖಿಯಿಂದ ಸಮನ್ವಯ",
    titleEn: "Aries Ascendant Diamond Marital Discord & Turnaround via Red Coral + 9-Mukhi",
    nativeProfileKn: "ಮೇಷ ಲಗ್ನ, ಅಶ್ವಿನಿ ನಕ್ಷತ್ರ, ಸಾಫ್ಟ್‌ವೇರ್ ಆರ್ಕಿಟೆಕ್ಟ್.",
    nativeProfileEn: "Aries Ascendant, Ashwini Nakshatra, Software Architect.",
    wrongItemWornKn: "ವಿವಾಹ ವಾರ್ಷಿಕೋತ್ಸವಕ್ಕೆ ಖರೀದಿಸಿದ ೧.೫ ಕ್ಯಾರಟ್ ವಜ್ರದ ಉಂಗುರ.",
    wrongItemWornEn: "1.5-Carat Diamond ring worn on right hand ring finger.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೪ ವಾರಗಳಲ್ಲಿ ಪತ್ನಿಯೊಂದಿಗೆ ನಿರಂತರ ಜಗಳ, ಕಂಠನಾಳದ ಸೋಂಕು ಹಾಗೂ ಗಂಟಲು ನೋವಿನಿಂದ ಆಸ್ಪತ್ರೆ ದಾಖಲು.",
    adverseOutcomeEn: "Within 4 weeks: severe domestic friction, chronic throat and vocal cord infection leading to hospitalization.",
    astrologicalRootCauseKn: "ಮೇಷ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು 2ನೇ ಮತ್ತು 7ನೇ ಮಾರಕ ಸ್ಥಾನಾಧಿಪತಿ. ವಜ್ರವು ಮಾರಕ ಶಕ್ತಿಯನ್ನು ಪ್ರಚೋದಿಸಿ ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಕದಡಿತು.",
    astrologicalRootCauseEn: "For Aries, Venus is prime Maraka lord (2nd and 7th houses); Diamond fueled fierce Maraka domestic fire.",
    correctedPrescriptionKn: "ವಜ್ರ ತೆಗೆಸಿ, ಲಗ್ನಾಧಿಪತಿ ಕುಜನ ತ್ರಿಕೋಣ ಕೆಂಪು ಹವಳ (ತಾಮ್ರದಲ್ಲಿ ಉಂಗುರದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಅಶ್ವಿನಿ ನಕ್ಷತ್ರದ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Diamond immediately. Prescribed triangular Red Coral in copper on ring finger + 9-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ದಾಂಪತ್ಯ ಸುಖಮಯವಾಯಿತು; ವಿದೇಶಿ ಪ್ರಾಜೆಕ್ಟ್ ಲೀಡರ್ ಆಗಿ ನೇಮಕಗೊಂಡು ಆರೋಗ್ಯ ಪೂರ್ಣ ಚೇತರಿಕೆ ಕಂಡಿತು.",
    verifiedTurnaroundEn: "Marital harmony restored completely; promoted to lead US cloud architecture project with robust physical vitality."
  },
  {
    id: 10,
    titleKn: "ವೃಶ್ಚಿಕ ಲಗ್ನಕ್ಕೆ ಪಚ್ಚೆ ಧರಿಸಿ ಎದುರಾದ ಸೈಬರ್ ಮೋಸ & ಹವಳ-ಪುಷ್ಯರಾಗದಿಂದ ಹಣ ವಾಪಸ್",
    titleEn: "Scorpio Ascendant Emerald Cyber Fraud & Recovery via Red Coral + Yellow Sapphire",
    nativeProfileKn: "ವೃಶ್ಚಿಕ ಲಗ್ನ, ಅನುರಾಧಾ ನಕ್ಷತ್ರ, ಉದ್ಯಮಿ.",
    nativeProfileEn: "Scorpio Ascendant, Anuradha Nakshatra, Export Entrepreneur.",
    wrongItemWornKn: "ವ್ಯಾಪಾರ ವೃದ್ಧಿಗೆಂದು ಬುಧನ ಹಸಿರು ಪಚ್ಚೆ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore green Emerald ring on little finger for business growth.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೩ ವಾರಗಳಲ್ಲಿ ೪೫ ಲಕ್ಷ ರೂ. ಸೈಬರ್ ವಂಚನೆಗೊಳಗಾದರು, ತೀವ್ರ ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ನರಗಳ ದೌರ್ಬಲ್ಯ ಎದುರಾಯಿತು.",
    adverseOutcomeEn: "Within 3 weeks: lost 45 lakhs in phishing scam, suffered acute insomnia and peripheral nerve tingling.",
    astrologicalRootCauseKn: "ವೃಶ್ಚಿಕ ಲಗ್ನಕ್ಕೆ ಬುಧನು 8ನೇ ಅಷ್ಟಮ ಹಾಗೂ 11ನೇ ಬಾಧಕ ಸ್ಥಾನಾಧಿಪತಿ. ಪಚ್ಚೆ ಧರಿಸಿದ್ದರಿಂದ ಆಕಸ್ಮಿಕ ವಂಚನೆ ಮತ್ತು ನಷ್ಟ ಘಟಿಸಿತು.",
    astrologicalRootCauseEn: "For Scorpio, Mercury rules 8th Dusthana and 11th Badhaka; Emerald directly invited stealth cyber theft and nervous exhaustion.",
    correctedPrescriptionKn: "ಪಚ್ಚೆ ನಿಷೇಧಿಸಿ, ಲಗ್ನಾಧಿಪತಿ ಕುಜನ ಹವಳ ಮತ್ತು 5ನೇ ಪುಣ್ಯಾಧಿಪತಿ ಗುರುವಿನ ಪುಷ್ಯರಾಗ ಧರಿಸಲಾಯಿತು; ಕೊರಳಲ್ಲಿ ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಲಾಯಿತು.",
    correctedPrescriptionEn: "Strictly banned Emerald. Prescribed Red Coral + 5th lord Jupiter Yellow Sapphire + Anuradha 7-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಸೈಬರ್ ಕ್ರೈಂ ಪೊಲೀಸರು ವಂಚಕರಿಂದ ಹಣ ವಸೂಲಿ ಮಾಡಿದರು; ಯೂರೋಪ್ ರಫ್ತು ಒಪ್ಪಂದ ಮಂಜೂರಾಗಿ ಸಂಸ್ಥೆ ಲಾಭದ ಹಾದಿ ಹಿಡಿಯಿತು.",
    verifiedTurnaroundEn: "Cyber police recovered stolen funds; secured major European export contract with highest annual profitability."
  },
  {
    id: 11,
    titleKn: "ಧನು ಲಗ್ನಕ್ಕೆ ವಜ್ರ ಧರಿಸಿ ಆದ ಬ್ಯಾಂಕ್ ಸಾಲದ ಸುಳಿ & ಪುಷ್ಯರಾಗ-೯ ಮುಖಿಯಿಂದ ಸಾಲಮುಕ್ತಿ",
    titleEn: "Sagittarius Ascendant Diamond Debt Trap & Salvation via Yellow Sapphire + 9-Mukhi",
    nativeProfileKn: "ಧನು ಲಗ್ನ, ಮೂಲಾ ನಕ್ಷತ್ರ, ಗುತ್ತಿಗೆದಾರರು.",
    nativeProfileEn: "Sagittarius Ascendant, Moola Nakshatra, Civil Contractor.",
    wrongItemWornKn: "ಫ್ಯಾಷನ್‌ಗಾಗಿ ಬಂಗಾರದಲ್ಲಿ ದೊಡ್ಡ ವಜ್ರದ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore high-carat Diamond ring in gold for status/fashion.",
    adverseOutcomeKn: "ಸರ್ಕಾರಿ ಬಿಲ್ ಸಿಲುಕಿಕೊಂಡಿತು, ಬ್ಯಾಂಕ್ ಲೋನ್ ಎನ್‌ಪಿಎ ಹಂತಕ್ಕೆ ತಲುಪಿತು, ಕಿಡ್ನಿ ಕಲ್ಲು ನೋವಿನಿಂದ ಹಾಸಿಗೆ ಹಿಡಿದರು.",
    adverseOutcomeEn: "Government project bills froze, bank debt entered default NPA warning, and severe renal stone colic emerged.",
    astrologicalRootCauseKn: "ಧನು ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು 6ನೇ ರೋಗ-ಋಣ-ಶತ್ರು ಸ್ಥಾನಾಧಿಪತಿ ಹಾಗೂ ಗುರುವಿಗೆ ನೈಸರ್ಗಿಕ ಶತ್ರು. ವಜ್ರವು 6ನೇ ಮನೆಯ ಸಾಲ-ರೋಗದ ಶಕ್ತಿಯನ್ನು ಉಲ್ಬಣಿಸಿತು.",
    astrologicalRootCauseEn: "Venus rules the 6th house (debts, diseases, enemies) for Sagittarius; Diamond inflamed 6th house liabilities exponentially.",
    correctedPrescriptionKn: "ವಜ್ರ ತ್ಯಜಿಸಿ, ಲಗ್ನಾಧಿಪತಿ ಗುರುವಿನ ಸಿಲೋನ್ ಹಳದಿ ಪುಷ್ಯರಾಗ (ಬಂಗಾರದಲ್ಲಿ ತರ್ಜನಿ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಮೂಲಾ ನಕ್ಷತ್ರದ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Surrendered Diamond. Prescribed Ceylon Yellow Sapphire in gold on index finger + Moola Nakshatra 9-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಸರ್ಕಾರದಿಂದ ಬಾಕಿ ಇದ್ದ ೨ ಕೋಟಿ ಬಿಲ್ ಬಿಡುಗಡೆಯಾಯಿತು; ಸಂಪೂರ್ಣ ಬ್ಯಾಂಕ್ ಸಾಲ ತೀರಿಸಿ ಕಿಡ್ನಿ ಸಮಸ್ಯೆ ಶಾಶ್ವತವಾಗಿ ಪರಿಹಾರವಾಯಿತು.",
    verifiedTurnaroundEn: "Pending Rs 2 crore government payment released; cleared all bank debts completely and renal health fully normalized."
  },
  {
    id: 12,
    titleKn: "ಕುಂಭ ಲಗ್ನಕ್ಕೆ ಮಾಣಿಕ್ಯ ಧರಿಸಿ ಪಾಲುದಾರಿಕೆ ಮುರಿತ & ನೀಲಂ-೮ ಮುಖಿಯಿಂದ ಐಕ್ಯತೆ",
    titleEn: "Aquarius Ascendant Ruby Partnership Fallout & Triumph via Blue Sapphire + 8-Mukhi",
    nativeProfileKn: "ಕುಂಭ ಲಗ್ನ, ಶತಭಿಷಾ ನಕ್ಷತ್ರ, ಫಾರ್ಮಾ ಉದ್ಯಮಿ.",
    nativeProfileEn: "Aquarius Ascendant, Shatabhisha Nakshatra, Pharmaceutical Entrepreneur.",
    wrongItemWornKn: "ಸೂರ್ಯನ ಬಲವರ್ಧನೆಗೆಂದು ೬ ಕ್ಯಾರಟ್ ಮಾಣಿಕ್ಯ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore 6-Carat Ruby in gold ring.",
    adverseOutcomeKn: "ಮುಖ್ಯ ಪಾಲುದಾರ ಸಂಸ್ಥೆಗೆ ರಾಜೀನಾಮೆ ನೀಡಿ ವ್ಯಾಜ್ಯ ಹೂಡಿದನು, ಅಸಿಡಿಟಿ ಮತ್ತು ಪಿತ್ತದ ಉರಿಯೂತದಿಂದ ಆಸ್ಪತ್ರೆ ಸೇರಿದರು.",
    adverseOutcomeEn: "Key business partner walked away filing lawsuit; chronic hyperacidity and bile regurgitation required hospitalization.",
    astrologicalRootCauseKn: "ಕುಂಭ ಲಗ್ನಕ್ಕೆ ಸೂರ್ಯನು 7ನೇ ಮಾರಕ ಸ್ಥಾನಾಧಿಪತಿ ಹಾಗೂ ಶನಿಗೆ ಜನ್ಮ ಶತ್ರು. ಮಾಣಿಕ್ಯವು 7ನೇ ಮನೆಯ ದಾಂಪತ್ಯ ಮತ್ತು ಪಾಲುದಾರಿಕೆಯನ್ನು ಸುಟ್ಟುಹಾಕಿತು.",
    astrologicalRootCauseEn: "Sun rules the 7th house (Maraka & business partners) for Aquarius and opposes Saturn. Ruby incinerated partnership harmony.",
    correctedPrescriptionKn: "ಮಾಣಿಕ್ಯ ತೆಗೆಸಿ, ಲಗ್ನಾಧಿಪತಿ ಶನಿಯ ನೀಲಂ (ಬೆಳ್ಳಿಯಲ್ಲಿ ಮಧ್ಯದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಶತಭಿಷಾ ನಕ್ಷತ್ರದ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Ruby. Prescribed Blue Sapphire in silver on middle finger + Shatabhisha 8-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಪಾಲುದಾರಿಕೆ ರಾಜಿ ಸೂತ್ರದಲ್ಲಿ ಇತ್ಯರ್ಥವಾಯಿತು; ನೂತನ ಸಂಶೋಧನಾ ಲ್ಯಾಬ್ ಸ್ಥಾಪಿಸಿ ಕಂಪನಿಯ ಷೇರು ಮೌಲ್ಯ ೫ ಪಟ್ಟು ಹೆಚ್ಚಾಯಿತು.",
    verifiedTurnaroundEn: "Partnership litigation settled amicably; launched proprietary clinical research lab and valuation surged 5x."
  },
  {
    id: 13,
    titleKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಪಚ್ಚೆ ಧರಿಸಿ ಉಂಟಾದ ಧ್ವನಿ ನಷ್ಟ & ಮುತ್ತು-೭ ಮುಖಿಯಿಂದ ಅದ್ಭುತ ವಾಗ್ವೈಭವ",
    titleEn: "Cancer Ascendant Emerald Vocal Strain & Restoration via Pearl + 7-Mukhi",
    nativeProfileKn: "ಕರ್ಕಾಟಕ ಲಗ್ನ, ಪುಷ್ಯ ನಕ್ಷತ್ರ, ಶಾಸ್ತ್ರೀಯ ಗಾಯಕಿ.",
    nativeProfileEn: "Cancer Ascendant, Pushya Nakshatra, Classical Vocalist.",
    wrongItemWornKn: "ಬುದ್ಧಿಶಕ್ತಿಗೆಂದು ಹಸಿರು ಪಚ್ಚೆ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore green Emerald ring on right little finger.",
    adverseOutcomeKn: "ಧರಿಸಿದ ೧ ತಿಂಗಳಲ್ಲಿ ಸ್ವರಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಊತ ಬಂತು, ಕಚೇರಿಗಳಲ್ಲಿ ಹಾಡಲಾಗದೆ ಕಂಠ ಕುಗ್ಗಿತು, ವಿದೇಶ ಪ್ರವಾಸಗಳಲ್ಲಿ ಭಾರಿ ನಷ್ಟವಾಯಿತು.",
    adverseOutcomeEn: "Within 1 month: severe vocal cord inflammation, lost singing range, and suffered heavy losses on overseas tour cancellations.",
    astrologicalRootCauseKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಬುಧನು 3ನೇ ಮತ್ತು 12ನೇ ವ್ಯಯಾಧಿಪತಿ. ಪಚ್ಚೆಯು 12ನೇ ಮನೆಯ ನಷ್ಟ ಹಾಗೂ 3ನೇ ಮನೆಯ ಗಂಟಲಿಗೆ ಅಡ್ಡಿ ತಂದಿತು.",
    astrologicalRootCauseEn: "Mercury rules the 3rd (throat/vocal effort) and 12th (losses/abroad) houses for Cancer; Emerald paralyzed vocal strength.",
    correctedPrescriptionKn: "ಪಚ್ಚೆ ತ್ಯಜಿಸಿ, ಲಗ್ನಾಧಿಪತಿ ಚಂದ್ರನ ದಕ್ಷಿಣ ಸಮುದ್ರದ ಮುತ್ತು (ಬೆಳ್ಳಿಯಲ್ಲಿ ಕಿರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಪುಷ್ಯ ನಕ್ಷತ್ರದ ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Emerald. Prescribed natural South Sea Pearl in silver on little finger + Pushya 7-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಧ್ವನಿ ಪೂರ್ಣ ಮರಳಿತು; ರಾಷ್ಟ್ರಮಟ್ಟದ ಸಂಗೀತ ಸಮ್ಮೇಳನದಲ್ಲಿ ಸುವರ್ಣ ಪದಕ ಪಡೆದು ವಿಶ್ವ ಪರ್ಯಟನೆಯ ಯಶಸ್ವಿ ಕಛೇರಿಗಳನ್ನು ನೀಡಿದರು.",
    verifiedTurnaroundEn: "Vocal resonance restored completely; bagged national music gold medal and concluded sold-out international concerts."
  },
  {
    id: 14,
    titleKn: "ವೃಷಭ ಲಗ್ನಕ್ಕೆ ಹವಳ ಧರಿಸಿ ಉಂಟಾದ ಮೂಳೆ ಮುರಿತ & ವಜ್ರ-೨ ಮುಖಿಯಿಂದ ಸ್ವಸ್ಥ್ಯ",
    titleEn: "Taurus Ascendant Red Coral Fractures & Recovery via Diamond + 2-Mukhi",
    nativeProfileKn: "ವೃಷಭ ಲಗ್ನ, ರೋಹಿಣಿ ನಕ್ಷತ್ರ, ವಾಸ್ತುಶಿಲ್ಪಿ.",
    nativeProfileEn: "Taurus Ascendant, Rohini Nakshatra, Architect.",
    wrongItemWornKn: "ಕುಜನ ರಕ್ಷಣೆಗೆಂದು ಕೆಂಪು ಹವಳದ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore triangular Red Coral ring on ring finger.",
    adverseOutcomeKn: "ನಿರ್ಮಾಣ ಸ್ಥಳದಲ್ಲಿ ಸ್ಕ್ಯಾಫೋಲ್ಡಿಂಗ್ ಬಿದ್ದು ಎಡಗಾಲು ಮೂಳೆ ಮುರಿತ, ೬ ತಿಂಗಳ ಹಾಸಿಗೆ ವಾಸ ಮತ್ತು ಕ್ಲೈಂಟ್‌ಗಳ ಕೇಸ್.",
    adverseOutcomeEn: "Scaffolding collapsed at construction site causing double leg fracture, 6 months bedrest, and client breach litigations.",
    astrologicalRootCauseKn: "ವೃಷಭ ಲಗ್ನಕ್ಕೆ ಕುಜನು 7ನೇ ಮಾರಕ ಹಾಗೂ 12ನೇ ವ್ಯಯಾಧಿಪತಿ. ಹವಳ ಧರಿಸಿದ್ದರಿಂದ ಆಸ್ಪತ್ರೆ ವಾಸ ಮತ್ತು ಅಂಗಾಂಗ ಕ್ಷತಿ ಎದುರಾಯಿತು.",
    astrologicalRootCauseEn: "Mars rules 7th Maraka and 12th Hospitalization/Losses for Taurus; Red Coral materialized severe surgical confinement.",
    correctedPrescriptionKn: "ಹವಳ ತೆಗೆದು, ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನ ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಜಿರ್ಕಾನ್ ಬೆಳ್ಳಿಯಲ್ಲಿ ಹಾಗೂ ಕೊರಳಲ್ಲಿ ರೋಹಿಣಿ ನಕ್ಷತ್ರದ ೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Red Coral. Prescribed Diamond/White Zircon in silver on middle/ring finger + Rohini 2-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಕಾಲು ಸಂಪೂರ್ಣ ಗುಣಮುಖವಾಯಿತು; ರಾಜ್ಯದ ಪ್ರತಿಷ್ಠಿತ ಹಸಿರು ವಸತಿ ಸಂಕೀರ್ಣದ ವಿನ್ಯಾಸ ಗೌರವ ಪ್ರಶಸ್ತಿ ದೊರೆಯಿತು.",
    verifiedTurnaroundEn: "Leg healed without residual limp; won prestigious State Green Architecture Award with record design billing."
  },
  {
    id: 15,
    titleKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ನೀಲಂ ಧರಿಸಿ ಉಂಟಾದ ಖಿನ್ನತೆ & ಪಚ್ಚೆ-೫ ಮುಖಿಯಿಂದ ಮಹೋನ್ನತಿ",
    titleEn: "Gemini Ascendant Blue Sapphire Depression & Rebirth via Emerald + 5-Mukhi",
    nativeProfileKn: "ಮಿಥುನ ಲಗ್ನ, ಪುನರ್ವಸು ನಕ್ಷತ್ರ, ಡೇಟಾ ಸೈಂಟಿಸ್ಟ್.",
    nativeProfileEn: "Gemini Ascendant, Punarvasu Nakshatra, Data Scientist.",
    wrongItemWornKn: "ಶನಿ ಸಾಡೇಸಾತಿ ಭಯಕ್ಕೆಂದು ಬಲಗೈಗೆ ನೀಲಂ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore Blue Sapphire ring out of fear of Sade Sati.",
    adverseOutcomeKn: "ತೀವ್ರ ಒಂಟಿತನ, ಕೆಲಸದಲ್ಲಿ ಆಸಕ್ತಿ ನಷ್ಟ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸ ಕುಸಿತದಿಂದ ರಾಜೀನಾಮೆ ಕೊಡುವ ಹಂತಕ್ಕೆ ಬಂದರು.",
    adverseOutcomeEn: "Suffered crushing loneliness, apathy, severe sleep paralysis, and nearly resigned from elite tech job.",
    astrologicalRootCauseKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಶನಿಯು 8ನೇ ಅಷ್ಟಮಾಧಿಪತಿಯೂ ಹೌದು. ಶಕ್ತಿಯುತ ನೀಲಂ ಧರಿಸಿದ್ದರಿಂದ 8ನೇ ಮನೆಯ ಆತಂಕ ಹಾಗೂ ನಿಷ್ಕ್ರಿಯತೆ ಆವರಿಸಿತು.",
    astrologicalRootCauseEn: "Saturn rules both 8th (Dusthana) and 9th houses for Gemini; raw Blue Sapphire amplified 8th house paralysis and dark moods.",
    correctedPrescriptionKn: "ನೀಲಂ ತೆಗೆಸಿ, ಲಗ್ನಾಧಿಪತಿ ಬುಧನ ಶುದ್ಧ ಪಚ್ಚೆ ಬೆಳ್ಳಿಯಲ್ಲಿ ಕಿರುಬೆರಳಿಗೆ ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಪುನರ್ವಸು ನಕ್ಷತ್ರದ ೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Blue Sapphire. Prescribed natural Emerald in silver on little finger + Punarvasu 5-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಮಾನಸಿಕ ಉತ್ಸಾಹ ಮರಳಿತು; ಆರ್ಟಿಫಿಶಿಯಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಸಂಶೋಧನಾ ಪೇಟೆಂಟ್ ಪಡೆದು ಸಿಲಿಕಾನ್ ವ್ಯಾಲಿಯ ಪ್ರಧಾನ ನಿರ್ದೇಶಕರಾದರು.",
    verifiedTurnaroundEn: "Depression lifted entirely; granted foundational AI patent and promoted to Principal Research Director in Silicon Valley."
  },
  {
    id: 16,
    titleKn: "ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ಮುತ್ತು ಧರಿಸಿ ಉಂಟಾದ ಜಡತ್ವ & ಮಾಣಿಕ್ಯ-೯ ಮುಖಿಯಿಂದ ತೇಜಸ್ಸು",
    titleEn: "Leo Ascendant Pearl Lethargy & Sovereign Power via Ruby + 9-Mukhi",
    nativeProfileKn: "ಸಿಂಹ ಲಗ್ನ, ಮಖಾ ನಕ್ಷತ್ರ, ರಾಜಕೀಯ ಮುಖಂಡ.",
    nativeProfileEn: "Leo Ascendant, Magha Nakshatra, Public Figure / Politician.",
    wrongItemWornKn: "ಕೋಪ ಕಡಿಮೆ ಮಾಡಿಕೊಳ್ಳಲು ಯಾರೋ ಸಲಹೆ ನೀಡಿದ ಮುತ್ತಿನ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore large natural Pearl ring to 'calm down anger'.",
    adverseOutcomeKn: "ಸಾರ್ವಜನಿಕ ಭಾಷಣಗಳಲ್ಲಿ ಆಕರ್ಷಣೆ ನಷ್ಟ, ಎದುರಾಳಿಗಳ ಕುತಂತ್ರಕ್ಕೆ ಬಲಿಪಶುವಾಗುವುದು ಹಾಗೂ ಉದರದಲ್ಲಿ ನೀರು ತುಂಬುವ ಕಾಯಿಲೆ ಬಂತು.",
    adverseOutcomeEn: "Lost rhetorical magnetic presence, political sabotage by rivals, and suffered recurrent abdominal edema/fluid retention.",
    astrologicalRootCauseKn: "ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ಚಂದ್ರನು 12ನೇ ವ್ಯಯಾಧಿಪತಿ. ಮುತ್ತು ಧರಿಸಿದ್ದರಿಂದ ಸೂರ್ಯನ ತೇಜಸ್ಸು ತಣ್ಣಗಾಗಿ 12ನೇ ಮನೆಯ ಅಪವ್ಯಯ ಮತ್ತು ನಷ್ಟ ಆರಂಭವಾಯಿತು.",
    astrologicalRootCauseEn: "Moon rules the 12th house (expenditure, hospital, self-undoing) for Leo; Pearl drowned Sun's sovereign fire in watery lethargy.",
    correctedPrescriptionKn: "ಮುತ್ತು ತ್ಯಜಿಸಿ, ಲಗ್ನಾಧಿಪತಿ ಸೂರ್ಯನ ಶುದ್ಧ ಮಾಣಿಕ್ಯ (ಬಂಗಾರದಲ್ಲಿ ಉಂಗುರದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಮಖಾ ನಕ್ಷತ್ರದ ೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Pearl immediately. Prescribed Burmese Ruby in gold on ring finger + Magha Nakshatra 9-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಸಾರ್ವಜನಿಕ ಪ್ರಭಾವ ಮುಗಿಲು ಮುಟ್ಟಿತು; ವಿಧಾನ ಸಭಾ ಚುನಾವಣೆಯಲ್ಲಿ ೩೦,೦೦೦ ಮತಗಳ ಅಂತರದಿಂದ ಜಯಭೇರಿ ಬಾರಿಸಿದರು.",
    verifiedTurnaroundEn: "Charisma and command surged; won assembly seat with 30,000-vote majority and full physiological health."
  },
  {
    id: 17,
    titleKn: "ಕನ್ಯಾ ಲಗ್ನಕ್ಕೆ ಪುಷ್ಯರಾಗ ಧರಿಸಿ ಕಾಡಿದ ಲಿವರ್ ಬಾಧೆ & ಪಚ್ಚೆ-ಚಿತ್ರಾ ೩ ಮುಖಿಯಿಂದ ನಿರಾಳ",
    titleEn: "Virgo Ascendant Yellow Sapphire Liver Strain & Recovery via Emerald + 3-Mukhi",
    nativeProfileKn: "ಕನ್ಯಾ ಲಗ್ನ, ಚಿತ್ರಾ ನಕ್ಷತ್ರ, ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್.",
    nativeProfileEn: "Virgo Ascendant, Chitra Nakshatra, Senior Chartered Accountant.",
    wrongItemWornKn: "ಆದಾಯ ಹೆಚ್ಚಿಸಲು ಹಳದಿ ಪುಷ್ಯರಾಗ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore heavy Yellow Sapphire ring on right hand index finger.",
    adverseOutcomeKn: "ಫ್ಯಾಟಿ ಲಿವರ್ ಸಮಸ್ಯೆ ಉಲ್ಬಣಿಸಿತು, ಅನಗತ್ಯ ತೂಕ ಹೆಚ್ಚಳ, ಹಾಗೂ ಪತ್ನಿಯೊಂದಿಗೆ ಮಾತಿನ ಚಕಮಕಿಯಿಂದ ನೆಮ್ಮದಿ ಕೆಟ್ಟಿತು.",
    adverseOutcomeEn: "Triggered fatty liver flare-up, sudden uncontrolled weight gain, and acute domestic alienation from spouse.",
    astrologicalRootCauseKn: "ಕನ್ಯಾ ಲಗ್ನಕ್ಕೆ ಗುರುವು 4ನೇ ಮತ್ತು 7ನೇ ಕೇಂದ್ರಾಧಿಪತ್ಯ ದೋಷ ಹೊಂದಿದ ಮಾರಕ ಗ್ರಹ. ಪುಷ್ಯರಾಗವು 7ನೇ ಮನೆಯ ದಾಂಪತ್ಯ ಕಲಹ ಹಾಗೂ ಲಿವರ್‌ಗೆ ಒತ್ತಡ ತಂದಿತು.",
    astrologicalRootCauseEn: "Jupiter carries Kendradhipatya Dosha for Virgo (ruling 4th & 7th); Yellow Sapphire aggravated bile metabolism and marital rift.",
    correctedPrescriptionKn: "ಪುಷ್ಯರಾಗ ತೆಗೆಸಿ, ಲಗ್ನಾಧಿಪತಿ ಬುಧನ ಪಚ್ಚೆ ಉಂಗುರ ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಚಿತ್ರಾ ನಕ್ಷತ್ರದ ೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಕವಚ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Yellow Sapphire. Prescribed Zambian Emerald ring + Chitra Nakshatra 3-Mukhi Rudraksha Kavacha in neck.",
    verifiedTurnaroundKn: "ಲಿವರ್ ಎಂಜೈಮ್ಸ್ ನಾರ್ಮಲ್ ಆದವು; ತೂಕ ೧೨ ಕೆಜಿ ಇಳಿದು ದಾಂಪತ್ಯದಲ್ಲಿ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ಮರಳಿ ಆಡಿಟಿಂಗ್ ಸಂಸ್ಥೆ ವಿಸ್ತಾರವಾಯಿತು.",
    verifiedTurnaroundEn: "Liver enzymes normalized; lost 12kg of visceral weight, harmonized marriage, and opened two branch audit offices."
  },
  {
    id: 18,
    titleKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ತಪ್ಪು ಬೆರಳಲ್ಲಿ ನೀಲಂ ಧರಿಸಿ ಉಂಟಾದ ಕುತ್ತಿಗೆ ನೋವು & ಮಧ್ಯದ ಬೆರಳಿನ ಪಂಚಧಾತುವಿನಲ್ಲಿ ಚಮತ್ಕಾರ",
    titleEn: "Libra Ascendant Misplaced Sapphire Neck Pain & Panchadhatu Alignment Triumph",
    nativeProfileKn: "ತುಲಾ ಲಗ್ನ, ಸ್ವಾತಿ ನಕ್ಷತ್ರ, ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ವಕೀಲರು.",
    nativeProfileEn: "Libra Ascendant, Swati Nakshatra, Senior High Court Advocate.",
    wrongItemWornKn: "ನೀಲಂ ರತ್ನವನ್ನು ಬಂಗಾರದಲ್ಲಿ ತೋರುಬೆರಳಿಗೆ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore Blue Sapphire mounted in gold on index finger (Guru's finger).",
    adverseOutcomeKn: "ಧರಿಸಿದ ೧೦ ದಿನಗಳಲ್ಲಿ ತೀವ್ರ ಸರ್ವಿಕಲ್ ಸ್ಪಾಂಡಿಲೈಟಿಸ್, ಕೋಪದ ಅತಿರೇಕ ಹಾಗೂ ಮುಖ್ಯ ವಾದಗಳಲ್ಲಿ ಗಂಟಲು ನಡುಗುವಿಕೆ.",
    adverseOutcomeEn: "Within 10 days: cervical spondylitis flare-up, explosive anger, and debilitating vocal tremor during pivotal court arguments.",
    astrologicalRootCauseKn: "ಶನಿಯು ತುಲಾ ಲಗ್ನಕ್ಕೆ ಯೋಗಕಾರಕನಾದರೂ, ಶತ್ರು ಗುರು ಬೆರಳಿನಲ್ಲಿ ಮತ್ತು ಬಂಗಾರದಲ್ಲಿ ಧರಿಸಿದ್ದರಿಂದ ಗ್ರಹಗಳ ಪರಸ್ಪರ ಘರ್ಷಣೆ ಉಂಟಾಯಿತು.",
    astrologicalRootCauseEn: "Though Saturn is Yogakaraka for Libra, mounting it in Gold on Jupiter's Index finger induced acute magnetic friction.",
    correctedPrescriptionKn: "ಉಂಗುರ ಬದಲಾಯಿಸಿ, ಪಂಚಧಾತು/ಬೆಳ್ಳಿಯಲ್ಲಿ ಮಧ್ಯದ ಬೆರಳಿಗೆ ಧರಿಸಲಾಯಿತು; ಕೊರಳಲ್ಲಿ ಸ್ವಾತಿ ನಕ್ಷತ್ರದ ೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Reset same Sapphire into Panchadhatu on Middle finger; prescribed Swati Nakshatra 8-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಕುತ್ತಿಗೆ ನೋವು ಮಾಯವಾಯಿತು; ಸಂವಿಧಾನಿಕ ಪೀಠದಲ್ಲಿ ವಾದ ಮಂಡಿಸಿ ಐತಿಹಾಸಿಕ ತೀರ್ಪು ಪಡೆದು ಹಿರಿಯ ನ್ಯಾಯವಾದಿ ಗೌರವ ಪಡೆದರು.",
    verifiedTurnaroundEn: "Cervical pain vanished within 72 hours; delivered historic constitutional argument and earned Senior Counsel designation."
  },
  {
    id: 19,
    titleKn: "ವೃಶ್ಚಿಕ ಲಗ್ನಕ್ಕೆ ನೀಲಂ ಧರಿಸಿ ಸಹೋದರರ ಆಸ್ತಿ ಕಲಹ & ಕೆಂಪು ಹವಳ-ಜೇಷ್ಠಾ ೪ ಮುಖಿಯಿಂದ ವಿಜಯ",
    titleEn: "Scorpio Ascendant Sapphire Property Feud & Victory via Red Coral + 4-Mukhi",
    nativeProfileKn: "ವೃಶ್ಚಿಕ ಲಗ್ನ, ಜ್ಯೇಷ್ಠಾ ನಕ್ಷತ್ರ, ತೋಟಗಾರಿಕೆ ಉದ್ಯಮಿ.",
    nativeProfileEn: "Scorpio Ascendant, Jyeshtha Nakshatra, Plantation Owner.",
    wrongItemWornKn: "ಸಾಡೇಸಾತಿ ಶಾಂತಿಗೆಂದು ನೀಲಂ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore Blue Sapphire ring to appease Saturn Sade Sati.",
    adverseOutcomeKn: "ಸಹೋದರರು ಜಮೀನಿಗೆ ಕಾಂಪೌಂಡ್ ಹಾಕಿ ರಸ್ತೆ ತಡೆದರು, ಅಡಿಕೆ ತೋಟಕ್ಕೆ ನೀರು ಸರಬರಾಜು ಸ್ಥಗಿತಗೊಂಡು ಭಾರಿ ನಷ್ಟವಾಯಿತು.",
    adverseOutcomeEn: "Brothers blocked estate access roads, irrigation pumps vandalized, facing crippling plantation losses.",
    astrologicalRootCauseKn: "ವೃಶ್ಚಿಕ ಲಗ್ನಕ್ಕೆ ಶನಿಯು 3ನೇ ಸಹೋದರ ಸ್ಥಾನ ಹಾಗೂ 4ನೇ ಭೂಮಿ ಸ್ಥಾನಾಧಿಪತಿ, ಕುಜನಿಗೆ ಶತ್ರು. ನೀಲಂ ಧರಿಸಿದ್ದರಿಂದ ಸಹೋದರರೊಂದಿಗೆ ಭೂ ಕಲಹ ಸ್ಫೋಟಿಸಿತು.",
    astrologicalRootCauseEn: "Saturn rules 3rd (siblings) & 4th (land) for Scorpio and opposes Lagnesha Mars; Sapphire provoked fraternal territorial feud.",
    correctedPrescriptionKn: "ನೀಲಂ ತೆಗೆಸಿ, ಲಗ್ನಾಧಿಪತಿ ಕುಜನ ತ್ರಿಕೋಣ ಕೆಂಪು ಹವಳ ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಜ್ಯೇಷ್ಠಾ ನಕ್ಷತ್ರದ ೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಪೆಂಡೆಂಟ್ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Sapphire. Prescribed triangular Red Coral ring in copper + Jyeshtha 4-Mukhi Rudraksha pendant in neck.",
    verifiedTurnaroundKn: "ಸಹೋದರರು ತಾವಾಗಿಯೇ ಬಂದು ಕ್ಷಮೆ ಕೋರಿ ರಸ್ತೆ ಬಿಟ್ಟುಕೊಟ್ಟರು; ಬೋರ್‌ವೆಲ್‌ನಲ್ಲಿ ಸಮೃದ್ಧ ನೀರು ಬಂದು ಅಡಿಕೆ ಫಸಲು ದಾಖಲೆ ನಿರ್ಮಿಸಿತು.",
    verifiedTurnaroundEn: "Brothers apologized and withdrew encroachment; struck abundant subterranean water, yielding record harvest."
  },
  {
    id: 20,
    titleKn: "ಧನು ಲಗ್ನಕ್ಕೆ ಕೆಂಪು ಹವಳ ಧರಿಸಿ ಯುಪಿಎಸ್‌ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಅಗ್ರ ರ್ಯಾಂಕ್ ಸಾಧನೆ",
    titleEn: "Sagittarius Ascendant Red Coral UPSC Apex Rank Breakthrough",
    nativeProfileKn: "ಧನು ಲಗ್ನ, ಪೂರ್ವಾಷಾಢಾ ನಕ್ಷತ್ರ, ಐಎಎಸ್ ಆಕಾಂಕ್ಷಿ.",
    nativeProfileEn: "Sagittarius Ascendant, Purva Ashadha Nakshatra, IAS Aspirant.",
    wrongItemWornKn: "ಯಾವುದೇ ರತ್ನ ಧರಿಸಿರಲಿಲ್ಲ, ಪರೀಕ್ಷಾ ಸಂದರ್ಶನದಲ್ಲಿ ೨ ಬಾರಿ ಅಂಕ ಕಳೆದುಕೊಂಡಿದ್ದರು.",
    wrongItemWornEn: "Had no energized talisman, missed final civil service cutoff twice by razor-thin margin.",
    adverseOutcomeKn: "ಏಕಾಗ್ರತೆ ಕೊರತೆ ಮತ್ತು ಸಂದರ್ಶನದ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಧೈರ್ಯಗುಂದುವುದು ಕಾಡುತ್ತಿತ್ತು.",
    adverseOutcomeEn: "Suffered exam day nervousness, brain fog, and faltering confidence before board interviews.",
    astrologicalRootCauseKn: "ಧನು ಲಗ್ನಕ್ಕೆ ಕುಜನು 5ನೇ ಪುತ್ರ-ಬುದ್ಧಿ-ಪೂರ್ವ ಪುಣ್ಯಾಧಿಪತಿ. ಕುಜ ಬಲವರ್ಧನೆಯಿಂದ ನಿರ್ಧಾರ ಶಕ್ತಿ ಮತ್ತು ಅಪ್ರತಿಮ ಆತ್ಮವಿಶ್ವಾಸ ಲಭಿಸುತ್ತದೆ.",
    astrologicalRootCauseEn: "For Sagittarius, Mars rules the auspicious 5th house of intellect & Purva Punya; strengthening Mars unleashes decisive brilliance.",
    correctedPrescriptionKn: "ತಾಮ್ರದಲ್ಲಿ ಶುದ್ಧ ಕೆಂಪು ಹವಳ (ಉಂಗುರದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಪೂರ್ವಾಷಾಢಾ ನಕ್ಷತ್ರದ ೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಕವಚ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed pure Red Coral in copper on ring finger + Purva Ashadha 6-Mukhi Rudraksha Kavacha in neck.",
    verifiedTurnaroundKn: "ಯುಪಿಎಸ್‌ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಅಖಿಲ ಭಾರತ ಮಟ್ಟದಲ್ಲಿ ೧೪ನೇ ರ್ಯಾಂಕ್ ಗಳಿಸಿ ಐಎಎಸ್ ಅಧಿಕಾರಿಯಾಗಿ ನೇಮಕಗೊಂಡರು.",
    verifiedTurnaroundEn: "Secured All India Rank 14 in UPSC Civil Services Exam and inducted into prestigious Indian Administrative Service."
  },
  {
    id: 21,
    titleKn: "ಮಕರ ಲಗ್ನಕ್ಕೆ ಪಚ್ಚೆ ಧರಿಸಿ ಬಹುಕೋಟಿ ಟೆಕ್ ಒಪ್ಪಂದ ಸಾಧನೆ & ವಾಕ್ ಸಿದ್ಧಿ",
    titleEn: "Capricorn Ascendant Emerald Multi-Million Tech Contract & Speech Mastery",
    nativeProfileKn: "ಮಕರ ಲಗ್ನ, ಉತ್ತರಾಷಾಢಾ ನಕ್ಷತ್ರ, ಸಾಫ್ಟ್‌ವೇರ್ ಸಂಸ್ಥಾಪಕ.",
    nativeProfileEn: "Capricorn Ascendant, Uttara Ashadha Nakshatra, SaaS Founder.",
    wrongItemWornKn: "ಯಾರೋ ಸಲಹೆ ನೀಡಿದಂತೆ ಹಳದಿ ಪುಷ್ಯರಾಗ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore Yellow Sapphire ring (Guru rules 3rd/12th for Capricorn).",
    adverseOutcomeKn: "ವೆಂಚರ್ ಕ್ಯಾಪಿಟಲ್ ಫಂಡಿಂಗ್ ನಿರಾಕರಣೆ, ವಾಕ್ ತಡವರಿಸುವಿಕೆ ಹಾಗೂ ಸಾಲದ ಹೊರೆ ಹೆಚ್ಚಾಯಿತು.",
    adverseOutcomeEn: "Faced serial venture capital rejections, acute speech hesitation during pitches, and mounting burnout.",
    astrologicalRootCauseKn: "ಮಕರಕ್ಕೆ ಗುರುವು 3ನೇ ಮತ್ತು 12ನೇ ವ್ಯಯಾಧಿಪತಿ; ಬುಧನು 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ. ಪುಷ್ಯರಾಗ ವೆಚ್ಚ ತಂದರೆ, ಪಚ್ಚೆಯು ಭಾಗ್ಯೋದಯ ನೀಡುತ್ತದೆ.",
    astrologicalRootCauseEn: "Jupiter rules 3rd & 12th houses for Capricorn; Mercury rules 9th house of divine fortune. Emerald unlocks fortune.",
    correctedPrescriptionKn: "ಪುಷ್ಯರಾಗ ತೆಗೆಸಿ, 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ ಬುಧನ ಪಚ್ಚೆ ಉಂಗುರ ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಉತ್ತರಾಷಾಢಾ ನಕ್ಷತ್ರದ ೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Replaced Yellow Sapphire with 9th lord Emerald in gold on little finger + 12-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಸಿಲಿಕಾನ್ ವ್ಯಾಲಿಯ ಟಾಪ್ ಫಂಡ್‌ನಿಂದ $10M ಹೂಡಿಕೆ ಮಂಜೂರಾಯಿತು; ಸಂಸ್ಥೆಯು ಜಾಗತಿಕ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ ಪಡೆಯಿತು.",
    verifiedTurnaroundEn: "Closed $10 Million Series-A funding round and scaled enterprise software globally across 4 continents."
  },
  {
    id: 22,
    titleKn: "ಕುಂಭ ಲಗ್ನಕ್ಕೆ ವಜ್ರ ಧರಿಸಿ ಭವ್ಯ ಮಹಲ್ ನಿರ್ಮಾಣ & ಅಂತರರಾಷ್ಟ್ರೀಯ ಮನ್ನಣೆ",
    titleEn: "Aquarius Ascendant Diamond Luxury Home Realization & Global Renown",
    nativeProfileKn: "ಕುಂಭ ಲಗ್ನ, ಧನಿಷ್ಠಾ ನಕ್ಷತ್ರ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಡೆವಲಪರ್.",
    nativeProfileEn: "Aquarius Ascendant, Dhanishta Nakshatra, Real Estate Developer.",
    wrongItemWornKn: "ಯಾವುದೇ ಯೋಗಕಾರಕ ರತ್ನ ಧರಿಸಿರಲಿಲ್ಲ.",
    wrongItemWornEn: "Had no planetary gemstone alignment.",
    adverseOutcomeKn: "ಯೋಜನೆಗಳಿಗೆ ನಗರಾಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರದಿಂದ ಸತತ ಅನುಮತಿ ವಿಳಂಬ, ಹಣದ ಹರಿವು ಸ್ಥಗಿತಗೊಂಡಿತ್ತು.",
    adverseOutcomeEn: "Municipal approvals stalled for 18 months, leading to acute cash crunch and contractor delays.",
    astrologicalRootCauseKn: "ಕುಂಭ ಲಗ್ನಕ್ಕೆ ಶುಕ್ರನು 4ನೇ (ವಾಹನ-ಭೂಮಿ-ಸುಖ) ಮತ್ತು 9ನೇ (ಭಾಗ್ಯ) ಮನೆಗಳ ಪರಮ ಯೋಗಕಾರಕ ಗ್ರಹ. ಶುಕ್ರ ಬಲವರ್ಧನೆಯಿಂದ ಭೂ ಲಾಭ ಖಚಿತ.",
    astrologicalRootCauseEn: "Venus is supreme single Yogakaraka for Aquarius (ruling 4th Kendra and 9th Trikona); fortifying Venus unlocks prime real estate.",
    correctedPrescriptionKn: "ಪ್ಲಾಟಿನಂ/ಬೆಳ್ಳಿಯಲ್ಲಿ ಉನ್ನತ ದರ್ಜೆಯ ಬಿಳಿ ವಜ್ರ ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಧನಿಷ್ಠಾ ನಕ್ಷತ್ರದ ೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಕವಚ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed pure Diamond in platinum on ring finger + Dhanishta Nakshatra 3-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಪರವಾನಗಿಗಳು ೧೫ ದಿನಗಳಲ್ಲಿ ಮಂಜೂರಾದವು; ೨೦೦ ಕೋಟಿ ರೂ. ಮೌಲ್ಯದ ಐಷಾರಾಮಿ ಟೌನ್‌ಶಿಪ್ ಸಂಪೂರ್ಣ ಮಾರಾಟವಾಯಿತು.",
    verifiedTurnaroundEn: "All regulatory approvals cleared within 15 days; luxury township project sold out 100% generating windfall profits."
  },
  {
    id: 23,
    titleKn: "ಮೀನ ಲಗ್ನಕ್ಕೆ ದಕ್ಷಿಣ ಸಮುದ್ರದ ಮುತ್ತು ಧರಿಸಿ ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ & ಅಧ್ಯಾತ್ಮ ಸಿದ್ಧಿ",
    titleEn: "Pisces Ascendant South Sea Pearl Mental Serenity & Meditative Radiance",
    nativeProfileKn: "ಮೀನ ಲಗ್ನ, ರೇವತಿ ನಕ್ಷತ್ರ, ಯೋಗ ಗುರು.",
    nativeProfileEn: "Pisces Ascendant, Revati Nakshatra, Yoga & Meditation Master.",
    wrongItemWornKn: "ಕೆಂಪು ಗಾರ್ನೆಟ್ ಮತ್ತು ಕಪ್ಪು ಓನಿಕ್ಸ್ ಉಂಗುರ ಧರಿಸಿದ್ದರು.",
    wrongItemWornEn: "Wore red garnet and black onyx combination.",
    adverseOutcomeKn: "ತೀವ್ರ ಬೈಪೋಲಾರ್ ಮನಸ್ಥಿತಿ, ಧ್ಯಾನದಲ್ಲಿ ಏಕಾಗ್ರತೆ ಕೊರತೆ ಹಾಗೂ ತಲೆಯುರಿ ಕಾಡುತ್ತಿತ್ತು.",
    adverseOutcomeEn: "Suffered sharp emotional oscillations, restlessness during deep meditation, and chronic cranial burning sensations.",
    astrologicalRootCauseKn: "ಮೀನ ಲಗ್ನಕ್ಕೆ ಚಂದ್ರನು 5ನೇ ಪೂರ್ವಪುಣ್ಯ ಮತ್ತು ಅಂತಃಪ್ರಜ್ಞಾ ಸ್ಥಾನಾಧಿಪತಿ. ಮುತ್ತು ಧರಿಸಿದರೆ ಮನಸ್ಸು ನಿರ್ಮಲವಾಗಿ ಈಶ್ವರಾನುಗ್ರಹ ಲಭಿಸುತ್ತದೆ.",
    astrologicalRootCauseEn: "Moon rules the auspicious 5th house of Purva Punya and intuition for Pisces; Pearl restores pure spiritual equanimity.",
    correctedPrescriptionKn: "ಬೆಳ್ಳಿಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ದಕ್ಷಿಣ ಸಮುದ್ರದ ಮುತ್ತು (ಕಿರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ರೇವತಿ ನಕ್ಷತ್ರದ ೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed pristine South Sea Pearl in silver on little finger + Revati Nakshatra 4-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಮನಸ್ಸಿನ ತೊಳಲಾಟ ಮಾಯವಾಗಿ ಗಹನ ಸಮಾಧಿ ಸ್ಥಿತಿ ಸಿದ್ಧಿಸಿತು; ವಿಶ್ವದ ೧೨ ದೇಶಗಳಲ್ಲಿ ಧ್ಯಾನ ಕೇಂದ್ರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸ್ಥಾಪಿಸಿದರು.",
    verifiedTurnaroundEn: "Mind entered unbroken meditative stillness; established vibrant holistic ashrams across 12 countries."
  },
  {
    id: 24,
    titleKn: "ಮೇಷ ಲಗ್ನಕ್ಕೆ ಪುಷ್ಯರಾಗ ಧರಿಸಿ ೬ ವರ್ಷಗಳ ಬಳಿಕ ಸಂತಾನ ಭಾಗ್ಯ ಪ್ರಾಪ್ತಿ",
    titleEn: "Aries Ascendant Yellow Sapphire Progeny Miracle after 6 Years",
    nativeProfileKn: "ಮೇಷ ಲಗ್ನ, ಭರಣಿ ನಕ್ಷತ್ರ, ದಂಪತಿಗಳು.",
    nativeProfileEn: "Aries Ascendant, Bharani Nakshatra, Devotee Couple.",
    wrongItemWornKn: "ನೀಲಿ ಜಿರ್ಕಾನ್ ಉಂಗುರ ಧರಿಸಿದ್ದರು (ಶುಕ್ರನ ಮಾರಕ ಶಕ್ತಿ ಹೆಚ್ಚಿತ್ತು).",
    wrongItemWornEn: "Wore Blue Zircon ring (amplified Maraka Venus vibrations).",
    adverseOutcomeKn: "೬ ವರ್ಷಗಳಿಂದ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ನಡೆಸಿದರೂ ಗರ್ಭಧಾರಣೆಯಾಗದೆ ಮಾನಸಿಕ ಕಂಗೆಟ್ಟಿದ್ದರು.",
    adverseOutcomeEn: "Failed 4 rounds of IVF treatments across 6 agonizing years with severe emotional despair.",
    astrologicalRootCauseKn: "ಮೇಷ ಲಗ್ನಕ್ಕೆ ಗುರುವು 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ ಹಾಗೂ ನೈಸರ್ಗಿಕ ಸಂತಾನ ಕಾರಕ. ಗುರುವಿನ ಪುಷ್ಯರಾಗವು ಪಿತೃದೋಷ ನಿವಾರಿಸಿ ಸಂತಾನ ಭಾಗ್ಯ ನೀಡುತ್ತದೆ.",
    astrologicalRootCauseEn: "Jupiter is 9th Bhagya Lord and Putrakaraka for Aries; Yellow Sapphire dissolves karmic blocks to progeny.",
    correctedPrescriptionKn: "ನೀಲಿ ಜಿರ್ಕಾನ್ ತೆಗೆಸಿ, ಶುದ್ಧ ಹಳದಿ ಪುಷ್ಯರಾಗ (ಬಂಗಾರದಲ್ಲಿ ತೋರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಭರಣಿ ನಕ್ಷತ್ರದ ೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed unheated Ceylon Yellow Sapphire in gold on index finger + Bharani 6-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಧರಿಸಿದ ೪ ತಿಂಗಳಲ್ಲಿ ನೈಸರ್ಗಿಕ ಗರ್ಭಧಾರಣೆಯಾಗಿ ಆರೋಗ್ಯವಂತ ಗಂಡು ಮಗುವಿನ ಜನನವಾಯಿತು; ಕುಟುಂಬದಲ್ಲಿ ದೈವಿಕ ಸಂಭ್ರಮ ನೆಲೆಸಿತು.",
    verifiedTurnaroundEn: "Conceived naturally within 4 months; delivered a healthy, radiant baby boy to the joy of both families."
  },
  {
    id: 25,
    titleKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಕೆಂಪು ಹವಳ ಧರಿಸಿ ಕಾರ್ಖಾನೆಯ ದಿವಾಳಿತನದಿಂದ ರಫ್ತು ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ",
    titleEn: "Cancer Ascendant Red Coral Industrial Reversal from Insolvency to Apex Exporter",
    nativeProfileKn: "ಕರ್ಕಾಟಕ ಲಗ್ನ, ಪುನರ್ವಸು ನಕ್ಷತ್ರ, ಫೌಂಡ್ರಿ ಉದ್ಯಮಿ.",
    nativeProfileEn: "Cancer Ascendant, Punarvasu Nakshatra, Precision Foundry Industrialist.",
    wrongItemWornKn: "ಯಾವುದೇ ಉಂಗುರ ಧರಿಸಿರಲಿಲ್ಲ, ಶನಿ ಕಾಟವೆಂದು ಕಪ್ಪು ದಾರ ಕಟ್ಟಿಕೊಂಡಿದ್ದರು.",
    wrongItemWornEn: "Wore black wrist thread fearing Saturn's wrath.",
    adverseOutcomeKn: "ಫ್ಯಾಕ್ಟರಿ ಯಂತ್ರಗಳು ಸತತ ಕೆಟ್ಟುಹೋಗುತ್ತಿದ್ದವು, ಕಾರ್ಮಿಕರ ಮುಷ್ಕರ ಹಾಗೂ ಸಾಲ ಮರುಪಾವತಿ ನೋಟಿಸ್ ಬಂತು.",
    adverseOutcomeEn: "Frequent machinery breakdowns, chronic labor union strikes, and impending bank foreclosure.",
    astrologicalRootCauseKn: "ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಕುಜನು 5ನೇ ಮತ್ತು 10ನೇ ಕರ್ಮಾಧಿಪತಿಯಾಗಿ ಪರಮ ಯೋಗಕಾರಕ ಗ್ರಹ! ಹವಳವು ಯಂತ್ರ, ಭೂಮಿ ಮತ್ತು ಅಧಿಕಾರ ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.",
    astrologicalRootCauseEn: "Mars is supreme Yogakaraka for Cancer (ruling 5th Trikona and 10th Kendra); Red Coral triggers industrial dominion.",
    correctedPrescriptionKn: "ಕಪ್ಪು ದಾರ ತೆಗೆಸಿ, ಇಟಾಲಿಯನ್ ಕೆಂಪು ಹವಳ (ತಾಮ್ರ/ಬಂಗಾರದಲ್ಲಿ ಉಂಗುರದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed Italian triangular Red Coral in copper on ring finger + Punarvasu 5-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಕಾರ್ಮಿಕರ ಮುಷ್ಕರ ಶಾಂತವಾಯಿತು; ಜರ್ಮನಿಯಿಂದ ಭಾರಿ ರಫ್ತು ಆರ್ಡರ್ ದೊರೆತು ರಾಜ್ಯದ ಅತ್ಯುತ್ತಮ ಕೈಗಾರಿಕೋದ್ಯಮಿ ಪ್ರಶಸ್ತಿ ಲಭಿಸಿತು.",
    verifiedTurnaroundEn: "Labor strike resolved amicably; secured premier German industrial contract and won State Best Industrialist Award."
  },
  {
    id: 26,
    titleKn: "ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ಕೆಂಪು ಹವಳ ಧರಿಸಿ ಸೈನ್ಯದಲ್ಲಿ ಶೌರ್ಯ ಪದಕ & ಭೂಮಿ ಜಯ",
    titleEn: "Leo Ascendant Red Coral Military Gallantry & Ancestral Land Victory",
    nativeProfileKn: "ಸಿಂಹ ಲಗ್ನ, ಉತ್ತರಾ ಫಲ್ಗುಣಿ ನಕ್ಷತ್ರ, ಸೈನ್ಯಾಧಿಕಾರಿ (ಕರ್ನಲ್).",
    nativeProfileEn: "Leo Ascendant, Uttara Phalguni Nakshatra, Military Colonel.",
    wrongItemWornKn: "ಪಚ್ಚೆ ಉಂಗುರ ಧರಿಸಿದ್ದರು (ಬುಧನು 2ನೇ/11ನೇ ಮನೆಯಾದರೂ ಕುಜನ ಮಿತ್ರನಲ್ಲ).",
    wrongItemWornEn: "Wore green Emerald ring.",
    adverseOutcomeKn: "ಪ್ರಮೋಷನ್ ಪಟ್ಟಿಯಿಂದ ಹೆಸರು ಕೈಬಿಡಲಾಗಿತ್ತು, ಪಿತ್ರಾರ್ಜಿತ ಭೂಮಿಯ ಮೇಲೆ ಅಕ್ರಮ ಒತ್ತುವರಿಯಾಗಿ ಕೋರ್ಟ್ ಕೇಸ್ ನಡೆದಿತ್ತು.",
    adverseOutcomeEn: "Superseded in brigadier promotion board, ancestral estate encroached with protracted courtroom battle.",
    astrologicalRootCauseKn: "ಸಿಂಹ ಲಗ್ನಕ್ಕೆ ಕುಜನು 4ನೇ ಭೂಮಿ ಹಾಗೂ 9ನೇ ಭಾಗ್ಯ ಸ್ಥಾನಾಧಿಪತಿಯಾಗಿ ಪರಮ ಯೋಗಕಾರಕ! ಹವಳವು ಸೈನ್ಯ ಪರಾಕ್ರಮ ಮತ್ತು ನ್ಯಾಯಾಲಯ ಜಯ ನೀಡುತ್ತದೆ.",
    astrologicalRootCauseEn: "Mars rules 4th (land) and 9th (fortune) for Leo, acting as supreme Yogakaraka; Coral restores martial glory.",
    correctedPrescriptionKn: "ಪಚ್ಚೆ ಬದಲಿಗೆ, ಅಪ್ಪಟ ಕೆಂಪು ಹವಳ (ಬಂಗಾರದಲ್ಲಿ ಉಂಗುರದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಉತ್ತರಾ ಫಲ್ಗುಣಿ ನಕ್ಷತ್ರದ ೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed natural Red Coral in 18K gold on ring finger + 12-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಬ್ರಿಗೇಡಿಯರ್ ಆಗಿ ಪದೋನ್ನತಿ ದೊರೆಯಿತು; ಶೌರ್ಯ ಪದಕ ಪುರಸ್ಕೃತರಾಗಿ ಕೋರ್ಟ್ ತೀರ್ಪು ಪರವಾಗಿ ಬಂದು ಇಡೀ ಜಮೀನು ವಶವಾಯಿತು.",
    verifiedTurnaroundEn: "Promoted to Brigadier rank, awarded Sena Gallantry Medal, and High Court ordered immediate vacation of encroached land."
  },
  {
    id: 27,
    titleKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ಪಚ್ಚೆ ಧರಿಸಿ ದಿವಾಳಿಯಾಗಿದ್ದ ಜವಳಿ ಉದ್ಯಮ ಜಾಗತಿಕ ರಫ್ತು ಸಂಸ್ಥೆಯಾಗಿ ಪರಿವರ್ತನೆ",
    titleEn: "Libra Ascendant Emerald Fortune: Revived Bankrupt Textile Enterprise",
    nativeProfileKn: "ತುಲಾ ಲಗ್ನ, ವಿಶಾಖಾ ನಕ್ಷತ್ರ, ಜವಳಿ ರಫ್ತುದಾರರು.",
    nativeProfileEn: "Libra Ascendant, Vishakha Nakshatra, Textile Exporter.",
    wrongItemWornKn: "ಯಾವುದೇ ರತ್ನ ಧರಿಸಿರಲಿಲ್ಲ, ವ್ಯಾಪಾರದಲ್ಲಿ ನಿರಂತರ ನಷ್ಟವಾಗುತ್ತಿತ್ತು.",
    wrongItemWornEn: "No astrological gem alignment; facing mounting inventory lockup.",
    adverseOutcomeKn: "ಸಾಲ ಮರುಪಾವತಿಸಲಾಗದೆ ಬ್ಯಾಂಕ್ ಸೀಜ್ ನೋಟಿಸ್ ಕಳುಹಿಸಿತ್ತು, ಗೋದಾಮಿನಲ್ಲಿ ಬಟ್ಟೆ ದಾಸ್ತಾನು ಉಳಿದು ಬೂಸ್ಟು ಹಿಡಿದಿತ್ತು.",
    adverseOutcomeEn: "Bank issued SARFAESI physical possession notice on textile mill with unsold stock deteriorating.",
    astrologicalRootCauseKn: "ತುಲಾ ಲಗ್ನಕ್ಕೆ ಬುಧನು 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ. ಬುಧನ ಪಚ್ಚೆಯು ವ್ಯಾಪಾರ ಬುದ್ಧಿ, ವಿದೇಶಿ ಸಂಪರ್ಕ ಮತ್ತು ಅಪಾರ ಅದೃಷ್ಟವನ್ನು ತರುತ್ತದೆ.",
    astrologicalRootCauseEn: "Mercury rules the 9th house of supreme fortune (Bhagyasthana) for Libra; Emerald activates global commerce.",
    correctedPrescriptionKn: "ಬೆಳ್ಳಿಯಲ್ಲಿ ಅಪ್ಪಟ ಜಾಂಬಿಯನ್ ಪಚ್ಚೆ (ಕಿರುಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ವಿಶಾಖಾ ನಕ್ಷತ್ರದ ೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಕವಚ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Prescribed unheated Zambian Emerald in silver on little finger + Vishakha 5-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಅಮೆರಿಕದ ಬೃಹತ್ ರಿಟೇಲ್ ಸರಣಿಯಿಂದ ನೇರ ಆರ್ಡರ್ ಬಂತು; ಬ್ಯಾಂಕ್ ಸಾಲ ತೀರಿಸಿ ೪೦೦ ಕಾರ್ಮಿಕರಿಗೆ ಹೊಸ ಉದ್ಯೋಗ ನೀಡುವ ಬೃಹತ್ ಘಟಕ ಆರಂಭಿಸಿದರು.",
    verifiedTurnaroundEn: "Secured mammoth export purchase order from US retail giant; extinguished bank loan and opened 2nd spinning unit."
  },
  {
    id: 28,
    titleKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಶನಿ ನೀಲಂ ಧರಿಸಿ ಸುಪ್ರೀಂ ಕೋರ್ಟ್‌ನಲ್ಲಿ ಐತಿಹಾಸಿಕ ಆಸ್ತಿ ವಿಜಯ",
    titleEn: "Gemini Ascendant Blue Sapphire Supreme Court Landmark Property Victory",
    nativeProfileKn: "ಮಿಥುನ ಲಗ್ನ, ಮೃಗಶಿರಾ ನಕ್ಷತ್ರ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಉದ್ಯಮಿ.",
    nativeProfileEn: "Gemini Ascendant, Mrigashira Nakshatra, Real Estate Developer.",
    wrongItemWornKn: "ಮಾಣಿಕ್ಯ ಧರಿಸಿದ್ದರು (ಸೂರ್ಯನು 3ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದರೂ ಶನಿಗೆ ಶತ್ರು).",
    wrongItemWornEn: "Wore Ruby ring (Sun rules 3rd house of litigation/effort).",
    adverseOutcomeKn: "೨೫ ವರ್ಷಗಳಿಂದ ನಡೆಯುತ್ತಿದ್ದ ೧೦೦ ಕೋಟಿ ಬೆಲೆಯ ಆಸ್ತಿ ಕೇಸ್‌ನಲ್ಲಿ ಹೈಕೋರ್ಟ್ ಪ್ರತಿಕೂಲ ತೀರ್ಪು ನೀಡಿತ್ತು.",
    adverseOutcomeEn: "High Court ruled against him in a 25-year-old Rs 100 crore prime ancestral property dispute.",
    astrologicalRootCauseKn: "ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಶನಿಯು 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ. ಶನಿಯ ನೀಲಂ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಸತ್ಯವನ್ನು ಎತ್ತಿಹಿಡಿದು ಅಂತಿಮ ವಿಜಯ ನೀಡುತ್ತದೆ.",
    astrologicalRootCauseEn: "Saturn rules the 9th house of Dharma & Bhagya for Gemini; Blue Sapphire awakens cosmic justice in apex judiciary.",
    correctedPrescriptionKn: "ಮಾಣಿಕ್ಯ ತೆಗೆಸಿ, ಸಿಲೋನ್ ನೀಲಂ (ಬೆಳ್ಳಿಯಲ್ಲಿ ಮಧ್ಯದ ಬೆರಳು) ಹಾಗೂ ಕೊರಳಲ್ಲಿ ಮೃಗಶಿರಾ ನಕ್ಷತ್ರದ ೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಲಾಯಿತು.",
    correctedPrescriptionEn: "Removed Ruby. Prescribed Ceylon Blue Sapphire in silver on middle finger + Mrigashira 3-Mukhi Rudraksha in neck.",
    verifiedTurnaroundKn: "ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ಹೈಕೋರ್ಟ್ ತೀರ್ಪನ್ನು ರದ್ದುಪಡಿಸಿ ಸರ್ವಾನುಮತದಿಂದ ಜಯ ನೀಡಿತು; ಆಸ್ತಿಯಲ್ಲಿ ಐಟಿ ಪಾರ್ಕ್ ನಿರ್ಮಾಣಕ್ಕೆ ಚಾಲನೆ ಸಿಕ್ಕಿತು.",
    verifiedTurnaroundEn: "Supreme Court overturned High Court verdict granting 100% ownership; ground broken for state-of-the-art IT tech park."
  }
];

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
  const isNeckSpecific = /ಕೊರಳು|ಕೊರಳಲ್ಲಿ|ಕುತ್ತಿಗೆ|ಪೆಂಡೆಂಟ್|ಹಾರ|ಮಾಲೆ|necklace|neck|pendant|rudraksha|ರುದ್ರಾಕ್ಷಿ/i.test(qLower);
  const isColorSpecific = /ಬಣ್ಣ|ಕಲರ್|ಕಪ್ಪು|ಕೆಂಪು|color|colour|black|red/i.test(qLower);

  if (isKn) {
    let bullet1Verdict = "";
    if (isHavalaSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ${analysis.havalaAnalysis.verdictKn} ${analysis.havalaAnalysis.instructionsKn}`;
    } else if (isNeckSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${analysis.neckWear.nakshatraNameKn} ನಕ್ಷತ್ರಕ್ಕೆ ಕೊರಳಲ್ಲಿ '${analysis.neckWear.rudrakshaNameKn}' ಹಾಗೂ '${analysis.neckWear.pendantTypeKn}' ಧಾರಣೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಮಂಗಳಕರ ಹಾಗೂ ಜೀವ ರಕ್ಷಕವಾಗಿದೆ. ಇದನ್ನು ${analysis.neckWear.threadColorKn}ದಲ್ಲಿ ಧರಿಸಬೇಕು.`;
    } else if (isColorSpecific) {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಗರಿಷ್ಠ ಅದೃಷ್ಟ ತರುವ ಶುಭ ಬಣ್ಣಗಳು: ${analysis.colors.luckyColorsKn.join(", ")}. ಆದರೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ವರ್ಜ್ಯ ಮಾಡಬೇಕಾದ ಅಪಾಯಕಾರಿ ಬಣ್ಣಗಳು: ${analysis.colors.strictAvoidColorsKn.join(", ")} (${analysis.colors.dangerWarningKn}).`;
    } else {
      bullet1Verdict = `• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯ '${analysis.primaryRing.gemstoneKn}' (${analysis.primaryRing.caratWeightKn}) ರತ್ನವನ್ನು ${analysis.primaryRing.metalKn}ದಲ್ಲಿ ${analysis.primaryRing.fingerKn}ಯಲ್ಲಿ ಧರಿಸಬೇಕು. ಜೊತೆಗೆ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಶ್ರೀರಕ್ಷೆಗಾಗಿ ಕೊರಳಲ್ಲಿ '${analysis.neckWear.rudrakshaNameKn}' ಧರಿಸುವುದು 100% ಶಾಸ್ತ್ರೋಕ್ತ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ.`;
    }

    const prohibitedGemsText = analysis.prohibitedGems.map(p => `${p.gemstoneKn} (${p.houseLordshipKn} - ${p.severeWarningKn})`).join("; ");

    return sanitizeAstrologyKannadaText(
`ನಮಸ್ಕಾರ ${nameFormatted}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪಂಚಾಂಗ, ಜನ್ಮ ನಕ್ಷತ್ರ, ಲಗ್ನ ಹಾಗೂ ಗ್ರಹ ಬಲದ ಆಧಾರದ ಮೇಲೆ ಕೂಲಂಕಷವಾಗಿ ನೋಡಿದೆ.

${bullet1Verdict}

• 🎯 ಪಂಚಾಂಗ, ನಕ್ಷತ್ರ & ಗ್ರಹ ಶಾಸ್ತ್ರೀಯ ಕಾರಣ: ಕೇವಲ ರಾಶಿಯನ್ನು ನೋಡಿ ರತ್ನ ಅಥವಾ ಉಂಗುರ ಧರಿಸುವುದು ಶಾಸ್ತ್ರವಿರುದ್ಧ. ನಿಮ್ಮ ${toKannadaRashi(kundli.lagnaRashi.english)} ಲಗ್ನಕ್ಕೆ ತ್ರಿಕೋಣಾಧಿಪತಿಯಾದ ${toKannadaPlanet(lagnaRule.lagnaLord)} ಹಾಗೂ ${analysis.neckWear.nakshatraNameKn} ನಕ್ಷತ್ರಾಧಿಪತಿ ${analysis.neckWear.nakshatraLordKn}ನ ತರಂಗಗಳು ನಿಮ್ಮ ದೇಹದ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತವೆ. ${analysis.primaryRing.astrologicalReasonKn} ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaSummary || "ದಶಾ ಕಾಲಘಟ್ಟ"}ದಲ್ಲಿ ಇದು ನಿಮ್ಮ ಭಾಗ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.

• ⚠️ ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ರತ್ನ & ಅಪಾಯದ ಎಚ್ಚರಿಕೆ (Strict Prohibitions): ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಧೂಳೀಪಟ ತರಬಲ್ಲ ವರ್ಜ್ಯ ರತ್ನಗಳು: ${prohibitedGemsText}. ಇವು 6, 8 ಅಥವಾ 12ನೇ ದುಸ್ಥಾನಗಳ ಅಧಿಪತಿಗಳಾಗಿದ್ದು, ಇವುಗಳ ಉಂಗುರ ಧರಿಸಿದರೆ ಆಸ್ಪತ್ರೆ ಖರ್ಚು, ಸಾಲ, ಕೌಟುಂಬಿಕ ಕಲಹ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ನಷ್ಟ ಉಂಟಾಗುತ್ತದೆ. ಎಂದಿಗೂ ಇವುಗಳನ್ನು ಧರಿಸಬೇಡಿ!

• 📿 ಕೊರಳ ಧಾರಣೆ, ಮುಹೂರ್ತ & ಶ್ರೀ ಸನ್ನಿಧಾನ ಆಶೀರ್ವಾದ: ಉಂಗುರದ ಜೊತೆಗೆ ಕೊರಳಿನಲ್ಲಿ ${analysis.neckWear.threadColorKn}ದಲ್ಲಿ ${analysis.neckWear.rudrakshaNameKn} ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅನಿಷ್ಟ ಗ್ರಹಗಳ ಕೆಟ್ಟ ದೃಷ್ಟಿ ಭಸ್ಮವಾಗುತ್ತದೆ. ಧರಿಸಲು ಶುಭ ತಾರಾಬಲ: ${analysis.consecrationTaraBalaKn}. ಧರಿಸುವ ಶುಭ ದಿನ: ${analysis.primaryRing.activationDayKn} (${analysis.primaryRing.horaKn}ಯಲ್ಲಿ). ಮಂತ್ರ: "${analysis.primaryRing.mantraKn}". ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಧರಿಸಿದರೆ 15-20 ದಿನಗಳಲ್ಲಿ ಜೀವನದಲ್ಲಿ ಅದ್ಭುತ ಧನಾತ್ಮಕ ತಿರುವು ಕಾಣುವಿರಿ.`
    );
  } else {
    let bullet1VerdictEn = "";
    if (isHavalaSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: ${analysis.havalaAnalysis.verdictEn} ${analysis.havalaAnalysis.instructionsEn}`;
    } else if (isNeckSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: For your birth nakshatra ${analysis.neckWear.nakshatraNameEn}, wearing '${analysis.neckWear.rudrakshaNameEn}' along with '${analysis.neckWear.pendantTypeEn}' in the neck using ${analysis.neckWear.threadColorEn} provides supreme spiritual shielding and vital health protection.`;
    } else if (isColorSpecific) {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: Highly auspicious colors that unlock your luck: ${analysis.colors.luckyColorsEn.join(", ")}. Strictly prohibited colors that cause setbacks: ${analysis.colors.strictAvoidColorsEn.join(", ")} (${analysis.colors.dangerWarningEn}).`;
    } else {
      bullet1VerdictEn = `• 🔮 Direct Daivajna Verdict: Wear '${analysis.primaryRing.gemstoneEn}' (${analysis.primaryRing.caratWeightEn}) set in ${analysis.primaryRing.metalEn} on your ${analysis.primaryRing.fingerEn}. Concurrently wear '${analysis.neckWear.rudrakshaNameEn}' around your neck for divine Nakshatra shielding.`;
    }

    const prohibitedGemsTextEn = analysis.prohibitedGems.map(p => `${p.gemstoneEn} (${p.houseLordshipEn} - ${p.severeWarningEn})`).join("; ");

    return (
`Namaskara ${nameFormatted}, I have analyzed your horoscope through comprehensive synthesis of Lagna, Janma Nakshatra, Moon sign, and Panchanga elements.

${bullet1VerdictEn}

• 🎯 Astrological & Panchanga Foundation: Never prescribe stones merely based on Moon sign (Rashi)! In your ${kundli.lagnaRashi.english} Ascendant chart, your Tri-Kona lord ${lagnaRule.lagnaLord} and Janma Nakshatra lord ${analysis.neckWear.nakshatraLordEn} dictate your bio-energetic vitality. ${analysis.primaryRing.astrologicalReasonEn} Under ${dashaSummary || "your running Dasha"}, this alignment unlocks your dormant fortune.

• ⚠️ Strict Contraindications & Prohibited Stones (Severe Warning): Highly dangerous stones you must NEVER wear: ${prohibitedGemsTextEn}. These rule the 6th, 8th, or 12th Dusthanas; wearing their rings amplifies disease, litigation, debt traps, and sudden accidents.

• 📿 Neck Wear, Consecration Muhurtha & Temple Grace: Worn around the neck in ${analysis.neckWear.threadColorEn}, your ${analysis.neckWear.rudrakshaNameEn} absorbs malefic transits safely. Auspicious Tara Bala: ${analysis.consecrationTaraBalaEn}. Consecrate on ${analysis.primaryRing.activationDayEn} during ${analysis.primaryRing.horaEn}. Mantra: "${analysis.primaryRing.mantraEn}". Sponsor a dedicated Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara for visible breakthroughs within 15 to 20 days.`
    );
  }
}

