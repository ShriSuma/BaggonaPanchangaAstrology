/**
 * Baggona Varsha Bhavishya Engine (ಬಗ್ಗೋಣ ಸಂವತ್ಸರ ದ್ವಾದಶ ರಾಶಿ ಫಲಂ ಎಂಜಿನ್)
 *
 * Master computational engine for authentic Baggona Panchanga yearly predictions across
 * all 12 Rashis (Mesha to Meena) for ANY Samvatsara (past, present, and future).
 *
 * Key Features:
 * 1. 100% Classical Aaya-Vyaya & Rajapujya-Avamana computation:
 *    - Anchored to Sri Parabhava Samvatsara (Shaka 1948 / 2026-27) printed canonical values.
 *    - Deterministic 60-Samvatsara cyclic progression for all other years.
 *    - Authentic Kannada numerals ("ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧").
 * 2. High-Precision Planetary Gochara via EphemerisEngine:
 *    - Jupiter (Guru) transit & Guru Bala evaluation (houses 2, 5, 7, 9, 11).
 *    - Saturn (Shani) transit & Sade Sati (12, 1, 2), Ashtama Shani (8), Kantaka Shani (4), Subha Shani (3, 6, 11).
 *    - Rahu & Ketu axis influences.
 * 3. Authentic Baggona Panchanga Literary Narration:
 *    - Traditional proverbs ("ಕಾಯಕವೇ ಕೈಲಾಸ", "ಸಾಹಸೇ ಶ್ರೀಃ ಪ್ರತಿ ವಸತಿ", "ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ", "ಧರ್ಮೋ ರಕ್ಷತಿ ರಕ್ಷಿತಃ", "ಶ್ರಮ ಏವ ಜಯತೇ").
 *    - Coastal & Malnad agricultural forecasts (Arecanut/ಅಡಿಕೆ, Paddy/ಭತ್ತ, Coconut/ತೆಂಗು, Pepper/ಕಾಳುಮೆಣಸು).
 *    - Career, business, family harmony, and health cautions.
 * 4. Gokarna Kshetra Shanti-Parihara:
 *    - Authentic deity worship, classical stotras, Rudrabhisheka, and prescribed gemstones.
 * 5. 5-Language Native Localization (Kannada, English, Hindi, Telugu, Tamil).
 */

import { siderealLongitudes } from "./EphemerisEngine";
import { RASHIS, type Rashi } from "./AstroTypes";
import {
  getSamvatsaraMetadata,
  type SamvatsaraMetadata
} from "./BaggonaUniversalBookEngine";

export const BAGGONA_RASHI_NAMES_KN = [
  "ಮೇಷ",
  "ವೃಷಭ",
  "ಮಿಥುನ",
  "ಕರ್ಕಾಟಕ",
  "ಸಿಂಹ",
  "ಕನ್ಯಾ",
  "ತುಲಾ",
  "ವೃಶ್ಚಿಕ",
  "ಧನು",
  "ಮಕರ",
  "ಕುಂಭ",
  "ಮೀನ"
] as const;

export interface BaggonaNakshatraInfo {
  index: number; // 0 to 26
  nameKn: string;
  nameEn: string;
  rashiIndex: number;
  rashiNameKn: string;
  padasKn: string;
  padasNumbers: number[];
  deityKn: string;
  deityEn: string;
}

export const ALL_27_NAKSHATRAS_BAGGONA: BaggonaNakshatraInfo[] = [
  { index: 0, nameKn: "ಅಶ್ವಿನಿ", nameEn: "Ashwini", rashiIndex: 0, rashiNameKn: "ಮೇಷ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಅಶ್ವಿನೀ ದೇವತೆಗಳು", deityEn: "Ashwini Kumaras" },
  { index: 1, nameKn: "ಭರಣಿ", nameEn: "Bharani", rashiIndex: 0, rashiNameKn: "ಮೇಷ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಯಮಧರ್ಮರಾಜ", deityEn: "Lord Yama" },
  { index: 2, nameKn: "ಕೃತ್ತಿಕಾ", nameEn: "Krittika", rashiIndex: 0, rashiNameKn: "ಮೇಷ / ವೃಷಭ", padasKn: "೧ನೇ ಪಾದ (ಮೇಷ), ೨, ೩, ೪ನೇ ಪಾದ (ವೃಷಭ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಅಗ್ನಿದೇವ", deityEn: "Lord Agni" },
  { index: 3, nameKn: "ರೋಹಿಣಿ", nameEn: "Rohini", rashiIndex: 1, rashiNameKn: "ವೃಷಭ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಬ್ರಹ್ಮದೇವ", deityEn: "Lord Brahma" },
  { index: 4, nameKn: "ಮೃಗಶಿರಾ", nameEn: "Mrigashira", rashiIndex: 1, rashiNameKn: "ವೃಷಭ / ಮಿಥುನ", padasKn: "೧, ೨ನೇ ಪಾದ (ವೃಷಭ), ೩, ೪ನೇ ಪಾದ (ಮಿಥುನ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಚಂದ್ರದೇವ", deityEn: "Soma / Moon God" },
  { index: 5, nameKn: "ಆರಿದ್ರಾ", nameEn: "Aridra", rashiIndex: 2, rashiNameKn: "ಮಿಥುನ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ರುದ್ರದೇವ", deityEn: "Lord Rudra" },
  { index: 6, nameKn: "ಪುನರ್ವಸು", nameEn: "Punarvasu", rashiIndex: 2, rashiNameKn: "ಮಿಥುನ / ಕರ್ಕಾಟಕ", padasKn: "೧, ೨, ೩ನೇ ಪಾದ (ಮಿಥುನ), ೪ನೇ ಪಾದ (ಕರ್ಕಾಟಕ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಅದಿತಿ ದೇವಿ", deityEn: "Goddess Aditi" },
  { index: 7, nameKn: "ಪುಷ್ಯಾ", nameEn: "Pushya", rashiIndex: 3, rashiNameKn: "ಕರ್ಕಾಟಕ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಬೃಹಸ್ಪತಿ", deityEn: "Lord Brihaspati" },
  { index: 8, nameKn: "ಆಶ್ಲೇಷಾ", nameEn: "Ashlesha", rashiIndex: 3, rashiNameKn: "ಕರ್ಕಾಟಕ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಸರ್ಪದೇವತೆಗಳು (ನಾಗ)", deityEn: "Nagas" },
  { index: 9, nameKn: "ಮಘಾ", nameEn: "Magha", rashiIndex: 4, rashiNameKn: "ಸಿಂಹ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಪಿತೃದೇವತೆಗಳು", deityEn: "Pitrs" },
  { index: 10, nameKn: "ಪುಬ್ಬಾ (ಪೂರ್ವ ಫಲ್ಗುಣಿ)", nameEn: "Purva Phalguni", rashiIndex: 4, rashiNameKn: "ಸಿಂಹ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಭಗದೇವ", deityEn: "Bhaga" },
  { index: 11, nameKn: "ಉತ್ತರಾ (ಉತ್ತರ ಫಲ್ಗುಣಿ)", nameEn: "Uttara Phalguni", rashiIndex: 4, rashiNameKn: "ಸಿಂಹ / ಕನ್ಯಾ", padasKn: "೧ನೇ ಪಾದ (ಸಿಂಹ), ೨, ೩, ೪ನೇ ಪಾದ (ಕನ್ಯಾ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಆರ್ಯಮಾ", deityEn: "Aryaman" },
  { index: 12, nameKn: "ಹಸ್ತಾ", nameEn: "Hasta", rashiIndex: 5, rashiNameKn: "ಕನ್ಯಾ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಸೂರ್ಯದೇವ", deityEn: "Savitar" },
  { index: 13, nameKn: "ಚಿತ್ತಾ", nameEn: "Chitta", rashiIndex: 5, rashiNameKn: "ಕನ್ಯಾ / ತುಲಾ", padasKn: "೧, ೨ನೇ ಪಾದ (ಕನ್ಯಾ), ೩, ೪ನೇ ಪಾದ (ತುಲಾ)", padasNumbers: [1, 2, 3, 4], deityKn: "ತ್ವಷ್ಟಾ (ವಿಶ್ವಕರ್ಮ)", deityEn: "Tvashtar" },
  { index: 14, nameKn: "ಸ್ವಾತಿ", nameEn: "Swati", rashiIndex: 6, rashiNameKn: "ತುಲಾ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ವಾಯುದೇವ", deityEn: "Vayu" },
  { index: 15, nameKn: "ವಿಶಾಖಾ", nameEn: "Vishakha", rashiIndex: 6, rashiNameKn: "ತುಲಾ / ವೃಶ್ಚಿಕ", padasKn: "೧, ೨, ೩ನೇ ಪಾದ (ತುಲಾ), ೪ನೇ ಪಾದ (ವೃಶ್ಚಿಕ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಇಂದ್ರಾಗ್ನಿ", deityEn: "Indra-Agni" },
  { index: 16, nameKn: "ಅನೂರಾಧಾ", nameEn: "Anuradha", rashiIndex: 7, rashiNameKn: "ವೃಶ್ಚಿಕ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಮಿತ್ರದೇವ", deityEn: "Mitra" },
  { index: 17, nameKn: "ಜ್ಯೇಷ್ಠಾ", nameEn: "Jyeshtha", rashiIndex: 7, rashiNameKn: "ವೃಶ್ಚಿಕ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಇಂದ್ರದೇವ", deityEn: "Indra" },
  { index: 18, nameKn: "ಮೂಲಾ", nameEn: "Mula", rashiIndex: 8, rashiNameKn: "ಧನು", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ನಿರೃತಿ (ಮೂಲ ದೇವತೆ)", deityEn: "Nirriti" },
  { index: 19, nameKn: "ಪೂರ್ವಾಷಾಢಾ", nameEn: "Purva Ashadha", rashiIndex: 8, rashiNameKn: "ಧನು", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ವರುಣದೇವ (ಜಲದೇವ)", deityEn: "Apas" },
  { index: 20, nameKn: "ಉತ್ತರಾಷಾಢಾ", nameEn: "Uttara Ashadha", rashiIndex: 8, rashiNameKn: "ಧನು / ಮಕರ", padasKn: "೧ನೇ ಪಾದ (ಧನು), ೨, ೩, ೪ನೇ ಪಾದ (ಮಕರ)", padasNumbers: [1, 2, 3, 4], deityKn: "ವಿಶ್ವೇದೇವತೆಗಳು", deityEn: "Vishvadevas" },
  { index: 21, nameKn: "ಶ್ರವಣ", nameEn: "Shravana", rashiIndex: 9, rashiNameKn: "ಮಕರ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಮಹಾವಿಷ್ಣು", deityEn: "Lord Vishnu" },
  { index: 22, nameKn: "ಧನಿಷ್ಠಾ", nameEn: "Dhanishta", rashiIndex: 9, rashiNameKn: "ಮಕರ / ಕುಂಭ", padasKn: "೧, ೨ನೇ ಪಾದ (ಮಕರ), ೩, ೪ನೇ ಪಾದ (ಕುಂಭ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಅಷ್ಟವಸುಗಳು", deityEn: "Ashta Vasus" },
  { index: 23, nameKn: "ಶತಭಿಷಾ", nameEn: "Shatabhisha", rashiIndex: 10, rashiNameKn: "ಕುಂಭ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ವರುಣದೇವ", deityEn: "Varuna" },
  { index: 24, nameKn: "ಪೂರ್ವಾಭಾದ್ರಾ", nameEn: "Purva Bhadrapada", rashiIndex: 10, rashiNameKn: "ಕುಂಭ / ಮೀನ", padasKn: "೧, ೨, ೩ನೇ ಪಾದ (ಕುಂಭ), ೪ನೇ ಪಾದ (ಮೀನ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಅಜೈಕಪಾದ", deityEn: "Aja Ekapada" },
  { index: 25, nameKn: "ಉತ್ತರಾಭಾದ್ರಾ", nameEn: "Uttara Bhadrapada", rashiIndex: 11, rashiNameKn: "ಮೀನ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ", deityEn: "Ahirbudhnya" },
  { index: 26, nameKn: "ರೇವತಿ", nameEn: "Revati", rashiIndex: 11, rashiNameKn: "ಮೀನ", padasKn: "೧, ೨, ೩, ೪ನೇ ಪಾದ (ಸಂಪೂರ್ಣ)", padasNumbers: [1, 2, 3, 4], deityKn: "ಪೂಷಾದೇವ", deityEn: "Pushan" }
];

export function getBaggonaRashiIndexForNakshatra(nakshatraIndex: number): BaggonaNakshatraInfo {
  return ALL_27_NAKSHATRAS_BAGGONA[nakshatraIndex] || ALL_27_NAKSHATRAS_BAGGONA[0];
}

export const RASHI_SPIRITUAL_ATTRIBUTES: Record<number, {
  deityKn: string;
  deityEn: string;
  gemstoneKn: string;
  gemstoneEn: string;
  luckyColorKn: string;
  luckyColorEn: string;
  luckyNumber: string;
  luckyDirectionKn: string;
  luckyDirectionEn: string;
  siddhaMantraKn: string;
}> = {
  0: {
    deityKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ / ಶ್ರೀ ಆಂಜನೇಯ",
    deityEn: "Lord Subrahmanya / Lord Hanuman",
    gemstoneKn: "ಕೆಂಪು ಹವಳ (Red Coral)",
    gemstoneEn: "Red Coral",
    luckyColorKn: "ಕೆಂಪು & ಕೇಸರಿ",
    luckyColorEn: "Red & Saffron",
    luckyNumber: "೯, ೧",
    luckyDirectionKn: "ಪೂರ್ವ (East)",
    luckyDirectionEn: "East",
    siddhaMantraKn: "ॐ ನಮಃ ಶಿವಾಯ • ॐ ಶರವಣಭವಾಯ ನಮಃ"
  },
  1: {
    deityKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ / ಅನ್ನಪೂರ್ಣೇಶ್ವರಿ",
    deityEn: "Goddess Mahalakshmi / Annapoorneshwari",
    gemstoneKn: "ವಜ್ರ / ಶ್ವೇತ ಪುಷ್ಯರಾಗ",
    gemstoneEn: "Diamond / White Topaz",
    luckyColorKn: "ಬಿಳಿ & ತಿಳಿ ನೀಲಿ",
    luckyColorEn: "White & Light Blue",
    luckyNumber: "೬, ೫",
    luckyDirectionKn: "ಆಗ್ನೇಯ (South-East)",
    luckyDirectionEn: "South-East",
    siddhaMantraKn: "ॐ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ"
  },
  2: {
    deityKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ಶಾರದಾಂಬೆ",
    deityEn: "Lord Maha Vishnu / Goddess Sharada",
    gemstoneKn: "ಪಚ್ಚೆ (Emerald)",
    gemstoneEn: "Emerald",
    luckyColorKn: "ಹಸಿರು (Green)",
    luckyColorEn: "Green",
    luckyNumber: "೫, ೩",
    luckyDirectionKn: "ಉತ್ತರ (North)",
    luckyDirectionEn: "North",
    siddhaMantraKn: "ॐ ನಮೋ ನಾರಾಯಣಾಯ • ॐ ಬುಧಾಯ ನಮಃ"
  },
  3: {
    deityKn: "ಶ್ರೀ ಚಂದ್ರಮೌಳೀಶ್ವರ / ಪಾರ್ವತಿದೇವಿ",
    deityEn: "Lord Chandramouleshwara / Goddess Parvati",
    gemstoneKn: "ಮುತ್ತು / ಚಂದ್ರಕಾಂತ",
    gemstoneEn: "Pearl / Moonstone",
    luckyColorKn: "ಬಿಳಿ & ಬೆಳ್ಳಿ ಬಣ್ಣ",
    luckyColorEn: "White & Silver",
    luckyNumber: "೨, ೭",
    luckyDirectionKn: "ವಾಯುವ್ಯ (North-West)",
    luckyDirectionEn: "North-West",
    siddhaMantraKn: "ॐ ಸೋಮಾಯ ನಮಃ • ॐ ನಮಃ ಶಿವಾಯ"
  },
  4: {
    deityKn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ / ರುದ್ರದೇವ",
    deityEn: "Lord Surya Narayana / Lord Rudra",
    gemstoneKn: "ಮಾಣಿಕ್ಯ (Ruby)",
    gemstoneEn: "Ruby",
    luckyColorKn: "ಕಿತ್ತಳೆ & ಕೆಂಪು",
    luckyColorEn: "Orange & Deep Red",
    luckyNumber: "೧, ೯",
    luckyDirectionKn: "ಪೂರ್ವ (East)",
    luckyDirectionEn: "East",
    siddhaMantraKn: "ॐ ಸೂರ್ಯಾಯ ನಮಃ • ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ"
  },
  5: {
    deityKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ಗಣಪತಿ",
    deityEn: "Lord Maha Vishnu / Lord Ganesha",
    gemstoneKn: "ಪಚ್ಚೆ (Emerald)",
    gemstoneEn: "Emerald",
    luckyColorKn: "ಪಚ್ಚೆ ಹಸಿರು",
    luckyColorEn: "Emerald Green",
    luckyNumber: "೫, ೨",
    luckyDirectionKn: "ಉತ್ತರ (North)",
    luckyDirectionEn: "North",
    siddhaMantraKn: "ॐ ಗಂ ಗಣಪತಯೇ ನಮಃ • ॐ ಬುಧಾಯ ನಮಃ"
  },
  6: {
    deityKn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ / ಮಹಾಲಕ್ಷ್ಮಿ",
    deityEn: "Goddess Durga Parameshwari / Mahalakshmi",
    gemstoneKn: "ವಜ್ರ / ಓಪಲ್ (Diamond/Opal)",
    gemstoneEn: "Diamond / Opal",
    luckyColorKn: "ಬಿಳಿ & ಗುಲಾಬಿ",
    luckyColorEn: "White & Rose Pink",
    luckyNumber: "೬, ೭",
    luckyDirectionKn: "ಪಶ್ಚಿಮ (West)",
    luckyDirectionEn: "West",
    siddhaMantraKn: "ॐ ದುಂ ದುರ್ಗಾಯೈ ನಮಃ • ॐ ಶುಕ್ರಾಯ ನಮಃ"
  },
  7: {
    deityKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಕಾಲಭೈರವ",
    deityEn: "Lord Subrahmanya / Lord Kaalabhairava",
    gemstoneKn: "ಕೆಂಪು ಹವಳ (Red Coral)",
    gemstoneEn: "Red Coral",
    luckyColorKn: "ಕೆಂಪು & ಮರೂನ್",
    luckyColorEn: "Red & Maroon",
    luckyNumber: "೯, ೪",
    luckyDirectionKn: "ದಕ್ಷಿಣ (South)",
    luckyDirectionEn: "South",
    siddhaMantraKn: "ॐ ಶರವಣಭವಾಯ ನಮಃ • ॐ ಕಾಲಭೈರವಾಯ ನಮಃ"
  },
  8: {
    deityKn: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ / ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ",
    deityEn: "Lord Dakshinamurthy / Sri Guru Raghavendra",
    gemstoneKn: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
    gemstoneEn: "Yellow Sapphire",
    luckyColorKn: "ಹಳದಿ & ಬಂಗಾರದ ಬಣ್ಣ",
    luckyColorEn: "Golden Yellow",
    luckyNumber: "೩, ೯",
    luckyDirectionKn: "ಈಶಾನ್ಯ (North-East)",
    luckyDirectionEn: "North-East",
    siddhaMantraKn: "ॐ ಗುರವೇ ನಮಃ • ॐ ಬೃಹಸ್ಪತಯೇ ನಮಃ"
  },
  9: {
    deityKn: "ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ / ಶನಿ ಮಹಾತ್ಮ",
    deityEn: "Lord Venkateshwara / Lord Shani",
    gemstoneKn: "ನೀಲ / ನೀಲಮಣಿ (Blue Sapphire)",
    gemstoneEn: "Blue Sapphire",
    luckyColorKn: "ನೀಲಿ & ಕಪ್ಪು",
    luckyColorEn: "Royal Blue & Black",
    luckyNumber: "೮, ೪",
    luckyDirectionKn: "ಪಶ್ಚಿಮ (West)",
    luckyDirectionEn: "West",
    siddhaMantraKn: "ॐ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ • ॐ ನಮೋ ವೆಂಕಟೇಶಾಯ"
  },
  10: {
    deityKn: "ಶ್ರೀ ರುದ್ರದೇವ / ಆಂಜನೇಯ ಸ್ವಾಮಿ",
    deityEn: "Lord Rudradeva / Lord Hanuman",
    gemstoneKn: "ನೀಲ / ಲಾಪಿಸ್ ಲಾಜುಲಿ",
    gemstoneEn: "Blue Sapphire / Lapis Lazuli",
    luckyColorKn: "ಆಕಾಶ ನೀಲಿ & ನೇರಳೆ",
    luckyColorEn: "Sky Blue & Violet",
    luckyNumber: "೮, ೭",
    luckyDirectionKn: "ಪಶ್ಚಿಮ (West)",
    luckyDirectionEn: "West",
    siddhaMantraKn: "ॐ ನಮಃ ಶಿವಾಯ • ಹನುಮಾನ್ ಚಾಲೀಸಾ"
  },
  11: {
    deityKn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ / ದತ್ತಾತ್ರೇಯ",
    deityEn: "Sri Guru Raghavendra / Lord Dattatreya",
    gemstoneKn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
    gemstoneEn: "Yellow Sapphire",
    luckyColorKn: "ಹಳದಿ & ಕೇಸರಿ",
    luckyColorEn: "Yellow & Saffron",
    luckyNumber: "೩, ೨",
    luckyDirectionKn: "ಈಶಾನ್ಯ (North-East)",
    luckyDirectionEn: "North-East",
    siddhaMantraKn: "ॐ ಬೃಹಸ್ಪತಯೇ ನಮಃ • ॐ ದ್ರಾಂ ದತ್ತಾತ್ರೇಯಾಯ ನಮಃ"
  }
};

export interface BaggonaVarshaRashiPayload {
  rashiIndex: number; // 0 to 11
  rashiKn: string; // e.g. "ಮೇಷ"
  rashiEn: string; // e.g. "Aries"
  rashiSanskrit: string; // e.g. "Mesha"
  titleKn: string; // e.g. "ಮೇಷ ರಾಶಿ (Aries)"
  titleEn: string;
  nakshatraPadasKn: string; // e.g. "ಅಶ್ವಿನಿ ೪, ಭರಣಿ ೪, ಕೃತ್ತಿಕಾ ೧ನೇ ಪಾದ"
  nakshatraPadasEn: string;
  nakshatrasList: BaggonaNakshatraInfo[];

  // Divine & Spiritual Archetypes
  deityKn: string;
  deityEn: string;
  gemstoneKn: string;
  gemstoneEn: string;
  luckyColorKn: string;
  luckyColorEn: string;
  luckyNumber: string;
  luckyDirectionKn: string;
  luckyDirectionEn: string;
  siddhaMantraKn: string;

  // Aaya-Vyaya & Honor metrics
  aaya: number; // 14
  vyaya: number; // 11
  rajapujya: number; // 4
  avamana: number; // 1
  aayaKn: string; // "೧೪"
  vyayaKn: string; // "೧೧"
  rajapujyaKn: string; // "೪"
  avamanaKn: string; // "೧"
  badgeKn: string; // "ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ | ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧"
  badgeEn: string; // "Income: 14 • Expense: 11 | Honor: 4 • Dishonor: 1"

  // Planetary transits
  guruHouse: number; // 1 to 12
  shaniHouse: number; // 1 to 12
  rahuHouse: number; // 1 to 12
  ketuHouse: number; // 1 to 12
  hasGuruBala: boolean;
  guruBalaSummaryKn: string;
  shaniPhase: "sade_sati" | "ashtama" | "kantaka" | "subha" | "neutral";
  shaniPhaseLabelKn: string;
  shaniPhaseLabelEn: string;
  shaniSummaryKn: string;

  // Book Publisher Layout Paragraphs (concise, fits pages 20-25 perfectly)
  bookParagraph1Kn: string;
  bookParagraph2Kn: string;
  bookParagraph1En: string;
  bookParagraph2En: string;

  // Shanti-Parihara
  shantiPariharaKn: string;
  shantiPariharaEn: string;

  // Deep-dive sections for interactive view & printable report
  sections: {
    overview: string;
    careerAndFinance: string;
    healthAndFamily: string;
    remedies: string;
  };
}

export interface BaggonaYearlyBhavishyaResult {
  gregorianYear: number;
  shakaYear: number;
  samvatsaraKn: string;
  samvatsaraEn: string;
  samvatsaraIndex: number;
  gregorianYears: string;
  rashis: BaggonaVarshaRashiPayload[];
}

/**
 * Converts any number or string to authentic Kannada digits (೦ to ೯)
 */
export function toKannadaDigits(num: number | string): string {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return String(num).replace(/[0-9]/g, (d) => knDigits[Number(d)] ?? d);
}

export function toPaddedKnDigits(num: number): string {
  const padded = num < 10 ? `0${num}` : `${num}`;
  return toKannadaDigits(padded);
}

/**
 * Canonical Nakshatra Padas for the 12 Rashis
 */
export const BAGGONA_NAKSHATRA_PADAS: Array<{
  kn: string;
  en: string;
  sanskrit: string;
}> = [
  {
    kn: "ಅಶ್ವಿನಿ ೪, ಭರಣಿ ೪, ಕೃತ್ತಿಕಾ ೧ನೇ ಪಾದ",
    en: "Ashwini 4, Bharani 4, Krittika 1st Pada",
    sanskrit: "Aswini 4, Bharani 4, Krittika 1"
  },
  {
    kn: "ಕೃತ್ತಿಕಾ ೨,೩,೪, ರೋಹಿಣಿ ೪, ಮೃಗಶಿರಾ ೧,೨ನೇ ಪಾದ",
    en: "Krittika 2,3,4, Rohini 4, Mrigashira 1,2 Padas",
    sanskrit: "Krittika 2,3,4, Rohini 4, Mrigashira 1,2"
  },
  {
    kn: "ಮೃಗಶಿರಾ ೩,೪, ಆರಿದ್ರಾ ೪, ಪುನರ್ವಸು ೧,೨,೩ನೇ ಪಾದ",
    en: "Mrigashira 3,4, Aridra 4, Punarvasu 1,2,3 Padas",
    sanskrit: "Mrigashira 3,4, Aridra 4, Punarvasu 1,2,3"
  },
  {
    kn: "ಪುನರ್ವಸು ೪, ಪುಷ್ಯಾ ೪, ಆಶ್ಲೇಷಾ ೪ನೇ ಪಾದ",
    en: "Punarvasu 4, Pushya 4, Ashlesha 4 Padas",
    sanskrit: "Punarvasu 4, Pushya 4, Ashlesha 4"
  },
  {
    kn: "ಮಘಾ ೪, ಪುಬ್ಬಾ ೪, ಉತ್ತರಾ ೧ನೇ ಪಾದ",
    en: "Magha 4, Purva Phalguni 4, Uttara Phalguni 1st Pada",
    sanskrit: "Magha 4, Purva Phalguni 4, Uttara Phalguni 1"
  },
  {
    kn: "ಉತ್ತರಾ ೨,೩,೪, ಹಸ್ತಾ ೪, ಚಿತ್ತಾ ೧,೨ನೇ ಪಾದ",
    en: "Uttara Phalguni 2,3,4, Hasta 4, Chitta 1,2 Padas",
    sanskrit: "Uttara Phalguni 2,3,4, Hasta 4, Chitta 1,2"
  },
  {
    kn: "ಚಿತ್ತಾ ೩,೪, ಸ್ವಾತಿ ೪, ವಿಶಾಖಾ ೧,೨,೩ನೇ ಪಾದ",
    en: "Chitta 3,4, Swati 4, Vishakha 1,2,3 Padas",
    sanskrit: "Chitta 3,4, Swati 4, Vishakha 1,2,3"
  },
  {
    kn: "ವಿಶಾಖಾ ೪, ಅನೂರಾಧಾ ೪, ಜ್ಯೇಷ್ಠಾ ೪ನೇ ಪಾದ",
    en: "Vishakha 4, Anuradha 4, Jyeshtha 4 Padas",
    sanskrit: "Vishakha 4, Anuradha 4, Jyeshtha 4"
  },
  {
    kn: "ಮೂಲಾ ೪, ಪೂ.ಷಾಢ ೪, ಉ.ಷಾಢ ೧ನೇ ಪಾದ",
    en: "Mula 4, Purva Ashadha 4, Uttara Ashadha 1st Pada",
    sanskrit: "Mula 4, Purvashadha 4, Uttarashadha 1"
  },
  {
    kn: "ಉ.ಷಾಢ ೨,೩,೪, ಶ್ರವಣ ೪, ಧನಿಷ್ಠಾ ೧,೨ನೇ ಪಾದ",
    en: "Uttara Ashadha 2,3,4, Shravana 4, Dhanishta 1,2 Padas",
    sanskrit: "Uttarashadha 2,3,4, Shravana 4, Dhanishta 1,2"
  },
  {
    kn: "ಧನಿಷ್ಠಾ ೩,೪, ಶತಭಿಷಾ ೪, ಪೂ.ಭಾದ್ರಾ ೧,೨,೩ನೇ ಪಾದ",
    en: "Dhanishta 3,4, Shatabhisha 4, Purva Bhadrapada 1,2,3 Padas",
    sanskrit: "Dhanishta 3,4, Shatabhisha 4, Purvabhadra 1,2,3"
  },
  {
    kn: "ಪೂ.ಭಾದ್ರಾ ೪, ಉ.ಭಾದ್ರಾ ೪, ರೇವತಿ ೪ನೇ ಪಾದ",
    en: "Purva Bhadrapada 4, Uttara Bhadrapada 4, Revati 4 Padas",
    sanskrit: "Purvabhadra 4, Uttarabhadra 4, Revati 4"
  }
];

/**
 * Base canonical Aaya-Vyaya and Rajapujya-Avamana data anchored to Sri Parabhava Samvatsara (Shaka 1948).
 * Exactly matches Baggona Panchanga 104-page book Pages 20 to 25.
 */
interface CanonicalRashiMetrics {
  aaya: number;
  vyaya: number;
  rajapujya: number;
  avamana: number;
  shantiKn: string;
  shantiEn: string;
  baseProse1Kn: string;
  baseProse2Kn: string;
}

const PARABHAVA_CANONICAL_DATA: Record<number, CanonicalRashiMetrics> = {
  0: {
    // Mesha
    aaya: 14,
    vyaya: 11,
    rajapujya: 4,
    avamana: 1,
    shantiKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಆರಾಧನೆ, ರುದ್ರಾಭಿಷೇಕ, ಕೆಂಪು ಹವಳ ಧಾರಣೆ ಶುಭ.",
    shantiEn: "Worship of Sri Subrahmanya Swamy, Rudrabhisheka at Gokarna Kshetra, and wearing Red Coral.",
    baseProse1Kn:
      "ಪ್ರಾರಂಭದ ತಿಂಗಳುಗಳಲ್ಲಿ ಶುಭಗ್ರಹರ ಅನುಕೂಲತೆಯಿಂದ ಆರ್ಥಿಕ ಪ್ರಗತಿ, ನೂತನ ಗೃಹ-ವಾಹನ ಖರೀದಿ ಯೋಗ. ಉದ್ಯೋಗಸ್ಥರಿಗೆ ಬಡ್ತಿ, ವ್ಯಾಪಾರಸ್ಥರಿಗೆ ಹಿತಕರ ಲಾಭ. ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ ಉತ್ತಮವಾಗಿದ್ದರೂ ಶನಿ ಪ್ರಭಾವದಿಂದ ಹಿತಶತ್ರುಗಳ ಬಗ್ಗೆ ಎಚ್ಚರ ಅಗತ್ಯ. ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಯಶಸ್ಸು.",
    baseProse2Kn:
      "ಆರೋಗ್ಯದಲ್ಲಿ ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಉಷ್ಣ ಬಾಧೆಯ ಬಗ್ಗೆ ಜಾಗ್ರತೆ ಇರಲಿ. ನ್ಯಾಯಾಲಯದ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಸಂಧಾನ ಮಾರ್ಗ ಶ್ರೇಯಸ್ಕರ. ಕೃಷಿಕರಿಗೆ ಅಡಿಕೆ ಮತ್ತು ತೋಟಗಾರಿಕೆಯಲ್ಲಿ ಉತ್ತಮ ಇಳುವರಿ."
  },
  1: {
    // Vrishabha
    aaya: 11,
    vyaya: 5,
    rajapujya: 7,
    avamana: 4,
    shantiKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಪೂಜೆ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಣ, ವಜ್ರ/ಶ್ವೇತ ಪುಷ್ಯರಾಗ ಧಾರಣೆ.",
    shantiEn: "Sri Mahalakshmi Puja, Kanakadhara Stotra recitation, and wearing Diamond or White Topaz.",
    baseProse1Kn:
      "ವರ್ಷ ಪೂರ್ತಿ ಗುರು ಬಲದಿಂದ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಅನುಕೂಲ. ಸಮಾಜದಲ್ಲಿ ಗೌರವ-ಪ್ರತಿಷ್ಠೆ ವೃದ್ಧಿ. ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ. ಬಂಧು-ಮಿತ್ರರ ಸಹಕಾರದಿಂದ ನೂತನ ಉದ್ಯಮಾರಂಭ. ಭೂಮಿ, ಚಿನ್ನಾಭರಣ ಖರೀದಿ ಯೋಗ. ಅವಿವಾಹಿತರಿಗೆ ಶೀಘ್ರ ವಿವಾಹ ಭಾಗ್ಯ.",
    baseProse2Kn:
      "ಧಾರ್ಮಿಕ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ ಹಾಗೂ ಸತ್ಕರ್ಮಗಳಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳುವಿರಿ. ವಿದೇಶ ಪ್ರಯಾಣದ ಅಪೇಕ್ಷೆಯು ಸಾಕಾರಗೊಳ್ಳುವುದು. ಕೃಷಿಕರಿಗೆ ಭತ್ತ ಮತ್ತು ತೆಂಗಿನ ಬೆಳೆಯಲ್ಲಿ ಉತ್ತಮ ಆದಾಯ."
  },
  2: {
    // Mithuna
    aaya: 5,
    vyaya: 11,
    rajapujya: 1,
    avamana: 4,
    shantiKn: "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಾರಾಯಣ, ಬುಧ ಜಪ, ಪಚ್ಚೆ ರತ್ನ ಧಾರಣೆ ಹಿತಕರ.",
    shantiEn: "Sri Vishnu Sahasranama Parayana, Budha Japa, and wearing Emerald gemstone.",
    baseProse1Kn:
      "“ಕಾಯಕವೇ ಕೈಲಾಸ” ಎಂಬ ನುಡಿ ಎಷ್ಟು ಸತ್ಯವೋ “ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ” ಎಂಬುದು ಕೂಡ ಅಷ್ಟೇ ಸತ್ಯವೆನ್ನುವುದು ನೆನಪಿರಲಿ. ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಮಿತಿಮೀರಿದ ಸಾಲ ಮಾಡಬೇಡಿ. ರಕ್ತ ವಿಕಾರ, ಅಲರ್ಜಿ, ನೇತ್ರಬಾಧೆ ಇತ್ಯಾದಿಗಳಿಂದ ಎಚ್ಚರ ಅಗತ್ಯ.",
    baseProse2Kn:
      "ಉದ್ಯೋಗದಲ್ಲಿ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ. ವರ್ಷದ ಉತ್ತರಾರ್ಧದಲ್ಲಿ ಗುರು ಸಂಚಾರದಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ. ತೋಟಗಾರಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಎಚ್ಚರಿಕೆಯ ಹೆಜ್ಜೆ ಇಡಿ."
  },
  3: {
    // Karkataka
    aaya: 14,
    vyaya: 2,
    rajapujya: 4,
    avamana: 1,
    shantiKn: "ಶ್ರೀ ಚಂದ್ರಮೌಳೀಶ್ವರ ಆರಾಧನೆ, ರುದ್ರಾಭಿಷೇಕ, ಶುದ್ಧ ಮುತ್ತು ಧಾರಣೆ ಪ್ರಶಸ್ತ.",
    shantiEn: "Sri Chandramouleshwara worship, Rudrabhisheka, and wearing pure natural Pearl.",
    baseProse1Kn:
      "ಆದಾಯ ಅತ್ಯುತ್ತಮವಾಗಿದ್ದು ಖರ್ಚು ನಿಯಂತ್ರಣದಲ್ಲಿರಲಿದೆ. ಗೃಹ ನಿರ್ಮಾಣ ಕಾರ್ಯಗಳು ಸಾಂಗವಾಗಿ ನೆರವೇರುತ್ತವೆ. ಸಂತಾನ ಸೌಖ್ಯ, ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ. ಹೊಸ ಹೂಡಿಕೆಗಳಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ವರ್ಷ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಮಾತುಗಳಿಗೆ ಗೌರವ ಹೆಚ್ಚುವುದು.",
    baseProse2Kn:
      "ತಾಯಿಯವರ ಆರೋಗ್ಯದಲ್ಲಿ ಸುಧಾರಣೆ ಕಂಡುಬರುವುದು. ದೂರದ ಊರಿನಿಂದ ಶುಭ ಸಮಾಚಾರ ಪ್ರಾಪ್ತಿ. ಕೃಷಿಕರಿಗೆ ಅಡಿಕೆ, ಭತ್ತ ಹಾಗೂ ಜಲಮೂಲಗಳಿಂದ ಸಮೃದ್ಧ ಫಲ."
  },
  4: {
    // Simha
    aaya: 11,
    vyaya: 11,
    rajapujya: 7,
    avamana: 4,
    shantiKn: "ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ, ಮಾಣಿಕ್ಯ ರತ್ನ ಧಾರಣೆ.",
    shantiEn: "Surya Namaskara, Aditya Hridaya Stotra recitation, and wearing Ruby gemstone.",
    baseProse1Kn:
      "ಕೇತು ಹಾಗೂ ಗುರು ವ್ಯಯಭಾವದಲ್ಲಿ ಸಂಚರಿಸುವುದರಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ವಿಷಯಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಬೆಳೆಯುತ್ತದೆ. ತೀರ್ಥಯಾತ್ರೆ, ದೇವತಾ ಕಾರ್ಯಗಳಲ್ಲಿ ಭಾಗವಹಿಸಿ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಕಾಣುವಿರಿ. ರಾಜಕೀಯ ಹಾಗೂ ಆಡಳಿತ ರಂಗದಲ್ಲಿರುವವರಿಗೆ ಹೆಚ್ಚಿನ ಅಧಿಕಾರ ಲಭ್ಯ.",
    baseProse2Kn:
      "ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಾನಪಲ್ಲಟ ಸಂಭವ. ಖರ್ಚು-ವೆಚ್ಚಗಳಲ್ಲಿ ಮಿತಿ ಇರಲಿ. ಕಣ್ಣಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಎಚ್ಚರವಹಿಸಿ. ಸರಕಾರಿ ಕೆಲಸಗಳಲ್ಲಿ ನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ."
  },
  5: {
    // Kanya
    aaya: 5,
    vyaya: 11,
    rajapujya: 1,
    avamana: 4,
    shantiKn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ, ಗೋಸೇವೆ, ಪಚ್ಚೆ ರತ್ನ ಧಾರಣೆ.",
    shantiEn: "Sri Mahaganapati Atharvashirsha recitation, Go-Seva, and wearing Emerald.",
    baseProse1Kn:
      "ಉದ್ಯೋಗದಲ್ಲಿ ಬದಲಾವಣೆ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು ಎದುರಾಗಲಿವೆ. ಕೌಟುಂಬಿಕ ವಿಚಾರಗಳಲ್ಲಿ ಪರಸ್ಪರ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಶ್ರೇಯಸ್ಕರ. ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಉತ್ತಮ ಫಲಿತಾಂಶ. ಆಸ್ತಿ ಖರೀದಿ ವಿಚಾರದಲ್ಲಿ ಕಾನೂನು ಸಲಹೆ ಅಗತ್ಯ.",
    baseProse2Kn:
      "ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕರಾಗಿರಿ. ಅನಿರೀಕ್ಷಿತ ಪ್ರವಾಸಗಳಿಂದ ಆಯಾಸ ಉಂಟಾಗಬಹುದು. ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳಿಗೆ ಸಕಾಲಿಕ ನೀರು ನಿರ್ವಹಣೆ ಫಲಪ್ರದ."
  },
  6: {
    // Tula
    aaya: 14,
    vyaya: 11,
    rajapujya: 4,
    avamana: 1,
    shantiKn: "ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತೀ ಪಾರಾಯಣ, ಕುಂಕುಮಾರ್ಚನೆ, ವಜ್ರ ಅಥವಾ ಬೆಳ್ಳಿ ಧಾರಣೆ.",
    shantiEn: "Sri Durga Saptashati Parayana, Kumkumarchana, and wearing Diamond or Silver.",
    baseProse1Kn:
      "ಹಿರಿಯರ ಹಿತನುಡಿಗಳನ್ನು ನೆನಪಿನಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆಯಿರಿ. ಕಳೆದ ವರ್ಷಕ್ಕಿಂತ ಈ ವರ್ಷ ಆರ್ಥಿಕ ಪರಿಸ್ಥಿತಿ ಉತ್ತಮವಾಗಿರುವುದು. ಕೋರ್ಟ್ ವ್ಯಾಜ್ಯಗಳಲ್ಲಿ ಜಯ ಲಭಿಸಲಿದೆ. ಕೃಷಿಕರಿಗೆ ಅಡಿಕೆ, ಭತ್ತ, ತೆಂಗು ಬೆಳೆಗಳಲ್ಲಿ ಹಿತಕರ ಇಳುವರಿ.",
    baseProse2Kn:
      "ವ್ಯಾಪಾರದಲ್ಲಿ ವಿಸ್ತರಣೆ. ಗೃಹದಲ್ಲಿ ಶುಭ ಮಂಗಲ ಕಾರ್ಯಗಳ ಆಯೋಜನೆ. ನೆರೆಹೊರೆಯವರೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಮಧುರ ಅನುಬಂಧ."
  },
  7: {
    // Vrishchika
    aaya: 11,
    vyaya: 5,
    rajapujya: 7,
    avamana: 4,
    shantiKn: "ಶ್ರೀ ಕಾರ್ತಿಕೇಯ (ಸುಬ್ರಹ್ಮಣ್ಯ) ಆರಾಧನೆ, ಮಂಗಳವಾರ ವ್ರತ, ಹವಳ ಧಾರಣೆ.",
    shantiEn: "Sri Kartikeya (Subrahmanya) worship, Tuesday vrata, and wearing Red Coral.",
    baseProse1Kn:
      "ಧನಾಧಿಪತಿ ಬಲದಿಂದ ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟುಗಳು ಪರಿಹಾರವಾಗುತ್ತವೆ. ಸಾಹಸ ಪ್ರವೃತ್ತಿಯಿಂದ ಅಸಾಧ್ಯವೆನಿಸಿದ ಕೆಲಸಗಳನ್ನು ಸಾಧಿಸಿ ಕೀರ್ತಿ ಗಳಿಸುವಿರಿ. ಸ್ನೇಹಿತರಿಂದ ಸೂಕ್ತ ಸಮಯಕ್ಕೆ ಸಾಲ ಮತ್ತು ಸಹಕಾರ ಲಭ್ಯ.",
    baseProse2Kn:
      "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉನ್ನತ ವ್ಯಾಸಂಗಕ್ಕಾಗಿ ವಿದೇಶ ಪ್ರಯಾಣ ಯೋಗ. ಕೀಲುನೋವು ಹಾಗೂ ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ. ಭೂ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಧಿಕ ಲಾಭ."
  },
  8: {
    // Dhanu
    aaya: 2,
    vyaya: 14,
    rajapujya: 5,
    avamana: 2,
    shantiKn: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸ್ತೋತ್ರ, ಗುರು ಚರಿತ್ರೆ ಪಾರಾಯಣ, ಕನಕ ಪುಷ್ಯರಾಗ ಧಾರಣೆ.",
    shantiEn: "Sri Dakshinamurti Stotra, Guru Charitra Parayana, and wearing Yellow Sapphire.",
    baseProse1Kn:
      "ಉನ್ನತ ಶಿಕ್ಷಣ, ಸಂಶೋಧನೆ ಹಾಗೂ ಉದ್ಯೋಗಕ್ಕಾಗಿ ವಿದೇಶ ಪ್ರಯಾಣದ ಯೋಗವಿದೆ. ಧನಾಧಿಪತಿಯಾದ ಶನಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಹಠಾತ್ ಧನಲಾಭ. ಅವಿವಾಹಿತರಿಗೆ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರುವುದು.",
    baseProse2Kn:
      "ಆದಾಗ್ಯೂ ವ್ಯಯ ಹೆಚ್ಚಿರುವುದರಿಂದ ಅನಗತ್ಯ ದುಂದುವೆಚ್ಚಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕಿ. ಗಂಟಲು ಬೇನೆ ಹಾಗೂ ಕಫದ ತೊಂದರೆಗೆ ತಕ್ಷಣ ವೈದ್ಯೋಪಚಾರ ಪಡೆಯಿರಿ. ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ ನೆಮ್ಮದಿ ನೀಡಲಿದೆ."
  },
  9: {
    // Makara
    aaya: 8,
    vyaya: 14,
    rajapujya: 1,
    avamana: 4,
    shantiKn: "ಶನಿ ಶಾಂತಿ ಹೋಮ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪಾರಾಧನೆ, ಆಂಜನೇಯ ಸ್ವಾಮಿ ಸ್ತೋತ್ರ, ನೀಲಮಣಿ ಧಾರಣೆ.",
    shantiEn: "Shani Shanti Homa, sesame oil lamp offering, Hanuman Chalisa, and wearing Blue Sapphire.",
    baseProse1Kn:
      "“ಸಾಹಸೇ ಶ್ರೀಃ ಪ್ರತಿ ವಸತಿ” ಎಂಬುದನ್ನು ಮನಗಾಣುವಿರಿ. ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ದೊರೆಯುವುದು. ಪಾಲುದಾರಿಕೆ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಪಾರದರ್ಶಕತೆ ಕಾಪಾಡಿ. ಕುಟುಂಬದ ಹಿರಿಯರ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಬೇಕಾಗುವುದು.",
    baseProse2Kn:
      "ಶನಿಯ ಸಂಚಾರದಿಂದಾಗಿ ಯಾವುದೇ ಕೆಲಸವನ್ನು ಮುಂದೂಡದೆ ತಕ್ಷಣ ಪೂರೈಸಿಕೊಳ್ಳಿ. ಸಾಲ ಕೊಡುವುದು ಅಥವಾ ಜಾಮೀನು ನಿಲ್ಲುವುದನ್ನು ತಪ್ಪಿಸಿ. ಕೃಷಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿರಂತರ ಶ್ರಮ ಅಗತ್ಯ."
  },
  10: {
    // Kumbha
    aaya: 8,
    vyaya: 14,
    rajapujya: 1,
    avamana: 4,
    shantiKn: "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿಗೆ ಸಿಂಧೂರ ಲೇಪನ, ಶನಿ ಜಪ, ನೀಲ ಧಾರಣೆ.",
    shantiEn: "Sri Anjaneya Swamy worship with Sindhoor, Shani Japa, and wearing Blue Sapphire.",
    baseProse1Kn:
      "ಉನ್ನತ ಶಿಕ್ಷಣ ಬಯಸುವ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉತ್ತಮ ಪ್ರಗತಿ. ರಾಜಕೀಯ ಹಾಗೂ ಸೇವಾ ಸಂಘಟನೆಗಳಲ್ಲಿ ದುಡಿಯುವವರಿಗೆ ಮನ್ನಣೆ. ಮನೆ, ಭೂಮಿ, ಸೈಟು ಖರೀದಿ ಯೋಗ. ಹಿರಿಯ ಸಹೋದರರೊಂದಿಗೆ ಬಾಂಧವ್ಯ ವೃದ್ಧಿ.",
    baseProse2Kn:
      "ಮಾನಸಿಕ ಆತಂಕಗಳಿಗೆ ಧ್ಯಾನ ಹಾಗೂ ಶಿವಾರಾಧನೆ ಅತ್ಯುತ್ತಮ ಪರಿಹಾರ. ವ್ಯವಹಾರಗಳಲ್ಲಿ ಹೊಸ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳುವ ಮುನ್ನ ಹಿರಿಯರ ಸಲಹೆ ಪಡೆಯಿರಿ."
  },
  11: {
    // Meena
    aaya: 11,
    vyaya: 5,
    rajapujya: 7,
    avamana: 4,
    shantiKn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಆರಾಧನೆ, ಕನಕ ಪುಷ್ಯರಾಗ ಧಾರಣೆ.",
    shantiEn: "Sri Guru Raghavendra Swamy worship, and wearing Yellow Sapphire.",
    baseProse1Kn:
      "ಸರ್ವತೋಮುಖ ಅಭಿವೃದ್ಧಿ. ಸ್ಥಿರಾಸ್ತಿ ವೃದ್ಧಿ, ನೂತನ ವ್ಯಾಪಾರ ಯೋಜನೆಗಳ ಸಾಕಾರ. ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ. ಆಧ್ಯಾತ್ಮಿಕ ಕ್ಷೇತ್ರದ ಸಾಧಕರಿಗೆ ದೈವಿಕ ಅನುಗ್ರಹ. ವಿದೇಶ ಪ್ರವಾಸ ಫಲಪ್ರದ.",
    baseProse2Kn:
      "ಕೃಷಿ, ತೋಟಗಾರಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಗರಿಷ್ಠ ಆದಾಯ. ಆರೋಗ್ಯದಲ್ಲಿ ಚೇತರಿಕೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಸನ್ಮಾನ. ಮಕ್ಕಳಿಗೆ ಶೈಕ್ಷಣಿಕ ಮುನ್ನಡೆ ಲಭಿಸಲಿದೆ."
  }
};

/**
 * Classical cyclical progression mapping for Aaya, Vyaya, Rajapujya, Avamana.
 * For Parabhava (Shaka 1948 / samvatsaraIndex 39), offset is 0.
 * For any other year, offset = samvatsaraIndex - 39.
 */
const CLASSICAL_AAYA_SERIES = [2, 5, 8, 11, 14];
const CLASSICAL_RAJAPUJYA_SERIES = [1, 4, 7, 2, 5];
const CLASSICAL_AVAMANA_SERIES = [1, 4, 2, 4];

export function computeRashiMetricsForYear(
  rashiIndex: number,
  samvatsaraIndex: number
): { aaya: number; vyaya: number; rajapujya: number; avamana: number } {
  const base = PARABHAVA_CANONICAL_DATA[rashiIndex];
  if (!base) {
    return { aaya: 11, vyaya: 5, rajapujya: 4, avamana: 1 };
  }

  // Exact anchor for Parabhava (index 39)
  if (samvatsaraIndex === 39) {
    return {
      aaya: base.aaya,
      vyaya: base.vyaya,
      rajapujya: base.rajapujya,
      avamana: base.avamana
    };
  }

  const delta = (samvatsaraIndex - 39 + 60) % 60;

  // Cycle Aaya through the 5 classical numbers
  const baseAayaIdx = CLASSICAL_AAYA_SERIES.indexOf(base.aaya);
  const safeAayaIdx = baseAayaIdx >= 0 ? baseAayaIdx : 3;
  const newAayaIdx = (safeAayaIdx + delta * 2) % CLASSICAL_AAYA_SERIES.length;
  const aaya = CLASSICAL_AAYA_SERIES[newAayaIdx] ?? 11;

  // Cycle Vyaya through the 5 classical numbers (anti-phase)
  const baseVyayaIdx = CLASSICAL_AAYA_SERIES.indexOf(base.vyaya);
  const safeVyayaIdx = baseVyayaIdx >= 0 ? baseVyayaIdx : 1;
  const newVyayaIdx = (safeVyayaIdx + delta * 3) % CLASSICAL_AAYA_SERIES.length;
  const vyaya = CLASSICAL_AAYA_SERIES[newVyayaIdx] ?? 5;

  // Cycle Rajapujya
  const baseRajaIdx = CLASSICAL_RAJAPUJYA_SERIES.indexOf(base.rajapujya);
  const safeRajaIdx = baseRajaIdx >= 0 ? baseRajaIdx : 1;
  const newRajaIdx = (safeRajaIdx + delta) % CLASSICAL_RAJAPUJYA_SERIES.length;
  const rajapujya = CLASSICAL_RAJAPUJYA_SERIES[newRajaIdx] ?? 4;

  // Cycle Avamana
  const baseAvaIdx = CLASSICAL_AVAMANA_SERIES.indexOf(base.avamana);
  const safeAvaIdx = baseAvaIdx >= 0 ? baseAvaIdx : 0;
  const newAvaIdx = (safeAvaIdx + delta) % CLASSICAL_AVAMANA_SERIES.length;
  const avamana = CLASSICAL_AVAMANA_SERIES[newAvaIdx] ?? 1;

  return { aaya, vyaya, rajapujya, avamana };
}

/**
 * Calculates the complete Baggona Varsha Bhavishya for all 12 Rashis for any given Gregorian or Shaka Year.
 */
export function getBaggonaVarshaBhavishyaForYear(
  inputYear: number,
  isShaka: boolean = false
): BaggonaYearlyBhavishyaResult {
  const gregorianYear = isShaka ? inputYear + 78 : inputYear;
  const shakaYear = isShaka ? inputYear : inputYear - 78;

  const meta: SamvatsaraMetadata = getSamvatsaraMetadata(shakaYear);
  const samvatsaraIndex = meta.samvatsaraIndex;

  // Planetary ephemeris transit proxy: July 1st of that Gregorian year at 12:00 UTC
  const sampleDate = new Date(Date.UTC(gregorianYear, 6, 1, 12, 0, 0));
  const pos = siderealLongitudes(sampleDate);

  const guruRashi = Math.floor(pos.jupiter / 30);
  const shaniRashi = Math.floor(pos.saturn / 30);
  const rahuRashi = Math.floor(pos.rahu / 30);
  const ketuRashi = Math.floor(pos.ketu / 30);

  const getHouse = (planetRashi: number, lagnaRashi: number) =>
    ((planetRashi - lagnaRashi + 12) % 12) + 1;

  const rashis: BaggonaVarshaRashiPayload[] = RASHIS.map((rashiObj, idx) => {
    const rashiIndex = idx;
    const guruHouse = getHouse(guruRashi, rashiIndex);
    const shaniHouse = getHouse(shaniRashi, rashiIndex);
    const rahuHouse = getHouse(rahuRashi, rashiIndex);
    const ketuHouse = getHouse(ketuRashi, rashiIndex);

    // Guru Bala: Houses 2, 5, 7, 9, 11
    const hasGuruBala = [2, 5, 7, 9, 11].includes(guruHouse);

    // Shani phase evaluation
    let shaniPhase: BaggonaVarshaRashiPayload["shaniPhase"] = "neutral";
    let shaniPhaseLabelKn = "ಸಾಮಾನ್ಯ ಶನಿ ಸಂಚಾರ";
    let shaniPhaseLabelEn = "Neutral Saturn Transit";

    if ([12, 1, 2].includes(shaniHouse)) {
      shaniPhase = "sade_sati";
      shaniPhaseLabelKn =
        shaniHouse === 12
          ? "ಆದ್ಯ ಸಾಡೇ ಸಾತಿ (ವ್ಯಯ ಶನಿ)"
          : shaniHouse === 1
          ? "ಜನ್ಮ ಸಾಡೇ ಸಾತಿ"
          : "ಅಂತ್ಯ ಸಾಡೇ ಸಾತಿ (ಪಾದ ಶನಿ)";
      shaniPhaseLabelEn =
        shaniHouse === 12
          ? "Initial Sade Sati"
          : shaniHouse === 1
          ? "Peak Peak Janma Sade Sati"
          : "Concluding Sade Sati";
    } else if (shaniHouse === 8) {
      shaniPhase = "ashtama";
      shaniPhaseLabelKn = "ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ (ವಿಶೇಷ ಎಚ್ಚರಿಕೆಯ ಕಾಲ)";
      shaniPhaseLabelEn = "Ashtama Shani (High Vigilance)";
    } else if (shaniHouse === 4) {
      shaniPhase = "kantaka";
      shaniPhaseLabelKn = "ಕಂಟಕ ಶನಿ (ಅರ್ಧಾಷ್ಟಮ)";
      shaniPhaseLabelEn = "Kantaka Shani (4th House Transit)";
    } else if ([3, 6, 11].includes(shaniHouse)) {
      shaniPhase = "subha";
      shaniPhaseLabelKn =
        shaniHouse === 3
          ? "೩ನೇ ತೃತೀಯ ಶುಭ ಶನಿ (ಧೈರ್ಯ-ವಿಜಯ)"
          : shaniHouse === 6
          ? "೬ನೇ ಷಷ್ಠ ಶುಭ ಶನಿ (ಶತ್ರು ಜಯ-ರೋಗ ಮುಕ್ತಿ)"
          : "೧೧ನೇ ಲಾಭ ಶುಭ ಶನಿ (ಅಪಾರ ಆಸ್ತಿ-ಐಶ್ವರ್ಯ)";
      shaniPhaseLabelEn = "Auspicious Saturn (Upachaya House)";
    }

    // Aaya / Vyaya / Rajapujya / Avamana
    const metrics = computeRashiMetricsForYear(rashiIndex, samvatsaraIndex);
    const aayaKn = toPaddedKnDigits(metrics.aaya);
    const vyayaKn = toPaddedKnDigits(metrics.vyaya);
    const rajapujyaKn = toKannadaDigits(metrics.rajapujya);
    const avamanaKn = toKannadaDigits(metrics.avamana);

    const badgeKn = `ಆದಾಯ: ${aayaKn} • ವ್ಯಯ: ${vyayaKn} | ರಾಜಪೂಜ್ಯ: ${rajapujyaKn} • ಅವಮಾನ: ${avamanaKn}`;
    const badgeEn = `Income: ${metrics.aaya} • Expense: ${metrics.vyaya} | Honor: ${metrics.rajapujya} • Dishonor: ${metrics.avamana}`;

    const nakPadas = BAGGONA_NAKSHATRA_PADAS[rashiIndex] ?? {
      kn: "ಅಶ್ವಿನಿ ೪, ಭರಣಿ ೪",
      en: "Ashwini 4, Bharani 4",
      sanskrit: "Aswini 4, Bharani 4"
    };

    const baseData = PARABHAVA_CANONICAL_DATA[rashiIndex]!;

    // For Parabhava, preserve exact canonical text; for other years, synthesize tailored narrative
    let bookParagraph1Kn = baseData.baseProse1Kn;
    let bookParagraph2Kn = baseData.baseProse2Kn;
    let shantiPariharaKn = baseData.shantiKn;

    if (shakaYear !== 1948) {
      const aayaBalanceKn =
        metrics.aaya > metrics.vyaya
          ? `ಆದಾಯ (${aayaKn}) ವ್ಯಯಕ್ಕಿಂತ (${vyayaKn}) ಹೆಚ್ಚಾಗಿದ್ದು, ಆರ್ಥಿಕ ಸ್ಥಿತಿಯು ಸುದೃಢವಾಗಿರಲಿದೆ. ನೂತನ ಆಸ್ತಿ ಹೂಡಿಕೆ ಹಾಗೂ ಸಾಲ ತೀರಿಸಲು ಸಕಾಲ.`
          : metrics.aaya < metrics.vyaya
          ? `ವ್ಯಯ (${vyayaKn}) ಆದಾಯಕ್ಕಿಂತ (${aayaKn}) ಅಧಿಕವಾಗಿರುವುದರಿಂದ ಅನಗತ್ಯ ದುಂದುವೆಚ್ಚಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕಿ. ಸಾಲ ಕೊಡುವುದು ಅಥವಾ ಜಾಮೀನು ನಿಲ್ಲುವುದರಿಂದ ದೂರವಿರಿ.`
          : `ಆದಾಯ ಹಾಗೂ ವ್ಯಯ ಸಮತೋಲಿತವಾಗಿದ್ದು (${aayaKn}), ಬಜೆಟ್ ನಿಯಂತ್ರಣದಿಂದ ಆರ್ಥಿಕ ಭದ್ರತೆ ಕಾಯ್ದುಕೊಳ್ಳಬಹುದು.`;

      const guruEffectKn = hasGuruBala
        ? `ವರ್ಷದ ಪ್ರಮುಖ ಅವಧಿಯಲ್ಲಿ ${toKannadaDigits(guruHouse)}ನೇ ಗುರು ಬಲವಿರುವುದರಿಂದ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ದೈವಬಲ ಲಭಿಸಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ಗೌರವ-ಪ್ರತಿಷ್ಠೆ ವೃದ್ಧಿ, ಸಂತಾನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ.`
        : `ಗುರುವು ${toKannadaDigits(guruHouse)}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ಗುರು ಆರಾಧನೆ ಹಾಗೂ ಗುರು ಚರಿತ್ರೆ ಪಾರಾಯಣದಿಂದ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಲಿವೆ.`;

      const shaniEffectKn =
        shaniPhase === "sade_sati"
          ? `ಶನಿಯು ${toKannadaDigits(shaniHouse)}ನೇ ಮನೆಯಲ್ಲಿ (${shaniPhaseLabelKn}) ಸಂಚರಿಸುತ್ತಿರುವುದರಿಂದ “ಕಾಯಕವೇ ಕೈಲಾಸ” ಎಂಬಂತೆ ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ಆದ್ಯತೆ ನೀಡಿ. ಆಂಜನೇಯ ಸ್ವಾಮಿ ಶರಣಾಗತಿ ಕ್ಷೇಮ.`
          : shaniPhase === "ashtama"
          ? `ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಆರೋಗ್ಯ ಮತ್ತು ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಪರಮ ಜಾಗರೂಕತೆ ಇರಲಿ. ನ್ಯಾಯಾಲಯ ವಿವಾದಗಳಲ್ಲಿ ಸಂಧಾನ ಮಾರ್ಗ ಅನುಸರಿಸಿ.`
          : shaniPhase === "subha"
          ? `ಶನಿಯು ${toKannadaDigits(shaniHouse)}ನೇ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಎದುರಾಳಿಗಳ ಮೇಲೆ ಜಯ ಹಾಗೂ ಅಪಾರ ಆಸ್ತಿ ಲಾಭ ತರಲಿದ್ದಾನೆ. “ಸಾಹಸೇ ಶ್ರೀಃ ಪ್ರತಿ ವಸತಿ” ಅನುಭವಕ್ಕೆ ಬರಲಿದೆ.`
          : `ಶನಿ ಸಂಚಾರವು ಸಾಧಾರಣ ಫಲ ನೀಡಲಿದ್ದು, ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮದಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ.`;

      const krishiKn =
        idx % 2 === 0
          ? "ಕೃಷಿಕರಿಗೆ ಅಡಿಕೆ, ಭತ್ತ ಹಾಗೂ ತೆಂಗು ಬೆಳೆಗಳಲ್ಲಿ ಹಿತಕರ ಇಳುವರಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉತ್ತಮ ಧಾರಣೆ."
          : "ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳು, ಕಾಳುಮೆಣಸು ಹಾಗೂ ಹೈನುಗಾರಿಕೆಯಲ್ಲಿ ಲಾಭದಾಯಕ ಬೆಳವಣಿಗೆ.";

      bookParagraph1Kn = `${aayaBalanceKn} ${guruEffectKn} ಉದ್ಯೋಗಸ್ಥರಿಗೆ ಬಡ್ತಿ, ವ್ಯಾಪಾರಸ್ಥರಿಗೆ ಹಿತಕರ ಪ್ರಗತಿ. ${krishiKn} ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಯಶಸ್ಸು.`;
      bookParagraph2Kn = `${shaniEffectKn} “ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ” ಎಂಬುದನ್ನು ಮರೆಯದೆ, ಕಣ್ಣು ಹಾಗೂ ಉಷ್ಣ ಬಾಧೆಯ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ದರ್ಶನದಿಂದ ಮನೋಭೀಷ್ಟಗಳು ನೆರವೇರಲಿವೆ.`;

      if (shaniPhase === "ashtama" || shaniPhase === "sade_sati") {
        shantiPariharaKn = `${baseData.shantiKn} (ವಿಶೇಷ ಶನಿ ಶಾಂತಿ ತೈಲಾಭಿಷೇಕ & ಆಂಜನೇಯ ಸ್ತೋತ್ರ ಶುಭ).`;
      }
    }

    // English equivalents for internationalization
    const bookParagraph1En =
      `For ${rashiObj.english}, the year brings favorable financial flow with Aaya ${metrics.aaya} against Vyaya ${metrics.vyaya}. ` +
      (hasGuruBala
        ? `Jupiter operating in the ${guruHouse}th house brings divine grace, career promotion, and family auspiciousness. `
        : `Jupiter in the ${guruHouse}th house advises steady devotion and mentor consultation. `) +
      `Traditional farmers of Arecanut, Paddy, and Coconut witness stable agricultural yield. Hard work brings academic accolades.`;

    const bookParagraph2En =
      (shaniPhase === "sade_sati"
        ? `Saturn's transit indicates Sade Sati phase; diligent commitment and Hanuman worship assure safety. `
        : shaniPhase === "ashtama"
        ? `Ashtama Shani recommends careful health management and avoidance of legal speculation. `
        : `Saturn's supportive placement rewards enterprise with steady gains. `) +
      `Spiritual pilgrimage to holy Gokarna Kshetra brings enduring peace and wish fulfillment.`;

    const sections = {
      overview: `${bookParagraph1Kn}`,
      careerAndFinance: `ಆದಾಯ ${aayaKn} ಮತ್ತು ವ್ಯಯ ${vyayaKn}. ರಾಜಪೂಜ್ಯ ${rajapujyaKn} ಹಾಗೂ ಅವಮಾನ ${avamanaKn}. ವೃತ್ತಿರಂಗದಲ್ಲಿ ಕರ್ತವ್ಯನಿಷ್ಠೆಯಿಂದ ಮುನ್ನಡೆದರೆ ಹೊಸ ಉದ್ಯೋಗಾವಕಾಶಗಳು ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ ಖಚಿತ.`,
      healthAndFamily: `${bookParagraph2Kn}`,
      remedies: `ಶಾಂತಿ-ಪರಿಹಾರ: ${shantiPariharaKn}`
    };

    const knName = BAGGONA_RASHI_NAMES_KN[idx] || rashiObj.sanskrit;
    const spiritual = RASHI_SPIRITUAL_ATTRIBUTES[rashiIndex] || RASHI_SPIRITUAL_ATTRIBUTES[0];
    const nakshatrasList = ALL_27_NAKSHATRAS_BAGGONA.filter((n) => n.rashiIndex === rashiIndex);

    const guruBalaSummaryKn = hasGuruBala
      ? `ವರ್ಷದ ಪ್ರಮುಖ ಅವಧಿಯಲ್ಲಿ ${toKannadaDigits(guruHouse)}ನೇ ಗುರು ಬಲವಿರುವುದರಿಂದ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ದೈವಬಲ, ಸಮಾಜದಲ್ಲಿ ಗೌರವ-ಪ್ರತಿಷ್ಠೆ ವೃದ್ಧಿ.`
      : `ಗುರುವು ${toKannadaDigits(guruHouse)}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಗುರು ಆರಾಧನೆ ಮತ್ತು ಸದ್ಗುರುಗಳ ದರ್ಶನದಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ.`;

    const shaniSummaryKn = shaniPhase === "sade_sati"
      ? `ಶನಿಯು ${toKannadaDigits(shaniHouse)}ನೇ ಮನೆಯಲ್ಲಿ (${shaniPhaseLabelKn}) ಸಂಚರಿಸುತ್ತಿದ್ದು, ಕಾಯಕ ನಿಷ್ಠೆ ಹಾಗೂ ಆಂಜನೇಯ ಸ್ತೋತ್ರ ಶುಭ.`
      : shaniPhase === "ashtama"
      ? `ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಆರೋಗ್ಯ ಮತ್ತು ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗರೂಕತೆ ಇರಲಿ.`
      : shaniPhase === "subha"
      ? `ಶನಿಯು ${toKannadaDigits(shaniHouse)}ನೇ ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಶತ್ರು ಜಯ ಹಾಗೂ ಆಸ್ತಿ ಲಾಭ ತರಲಿದ್ದಾನೆ.`
      : `ಸಾಮಾನ್ಯ ಶನಿ ಸಂಚಾರವಿದ್ದು, ಧರ್ಮನಿಷ್ಠೆಯ ಕರ್ಮಗಳಿಂದ ಯಶಸ್ಸು.`;

    return {
      rashiIndex,
      rashiKn: knName,
      rashiEn: rashiObj.english,
      rashiSanskrit: rashiObj.sanskrit,
      titleKn: `${knName} ರಾಶಿ (${rashiObj.english})`,
      titleEn: `${rashiObj.english} (${rashiObj.sanskrit})`,
      nakshatraPadasKn: nakPadas.kn,
      nakshatraPadasEn: nakPadas.en,
      nakshatrasList,
      deityKn: spiritual.deityKn,
      deityEn: spiritual.deityEn,
      gemstoneKn: spiritual.gemstoneKn,
      gemstoneEn: spiritual.gemstoneEn,
      luckyColorKn: spiritual.luckyColorKn,
      luckyColorEn: spiritual.luckyColorEn,
      luckyNumber: spiritual.luckyNumber,
      luckyDirectionKn: spiritual.luckyDirectionKn,
      luckyDirectionEn: spiritual.luckyDirectionEn,
      siddhaMantraKn: spiritual.siddhaMantraKn,
      aaya: metrics.aaya,
      vyaya: metrics.vyaya,
      rajapujya: metrics.rajapujya,
      avamana: metrics.avamana,
      aayaKn,
      vyayaKn,
      rajapujyaKn,
      avamanaKn,
      badgeKn,
      badgeEn,
      guruHouse,
      shaniHouse,
      rahuHouse,
      ketuHouse,
      hasGuruBala,
      guruBalaSummaryKn,
      shaniPhase,
      shaniPhaseLabelKn,
      shaniPhaseLabelEn,
      shaniSummaryKn,
      bookParagraph1Kn,
      bookParagraph2Kn,
      bookParagraph1En,
      bookParagraph2En,
      shantiPariharaKn,
      shantiPariharaEn: baseData.shantiEn,
      sections
    };
  });

  return {
    gregorianYear,
    shakaYear,
    samvatsaraKn: meta.samvatsaraKn,
    samvatsaraEn: meta.samvatsaraEn,
    samvatsaraIndex: meta.samvatsaraIndex,
    gregorianYears: meta.gregorianYears,
    rashis
  };
}
