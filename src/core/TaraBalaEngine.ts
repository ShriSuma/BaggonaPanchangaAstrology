/**
 * Tara Bala and Chandra Bala — the two classical measures of how a given day
 * treats a specific person.
 *
 * Both are measured from the person's own birth Moon:
 *  - Tara Bala counts the transit Moon's nakshatra from the janma nakshatra.
 *  - Chandra Bala counts the transit Moon's rashi from the janma rashi.
 *
 * Everything here is pure arithmetic on indices, so results are identical on
 * every device and every run — no randomness and no language dependence.
 */

import { PlanetName, type KundliOutput } from "./AstroTypes";
import type { ColourKey, DirectionKey, GrahaKey } from "../features/seva/sevaLocale";

/* ------------------------------------------------------------------ *
 * Tara Bala
 * ------------------------------------------------------------------ */

/** The nine taras, in count order starting at the janma nakshatra. */
export type TaraNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TaraResult = {
  /** 1 = Janma … 9 = Parama Mitra */
  tara: TaraNumber;
  /** Raw count 1..27 from the janma nakshatra. */
  count: number;
  /** 0..100 contribution to the day score. */
  score: number;
  /** True for Sampat, Kshema, Sadhaka, Mitra, Parama Mitra. */
  isFavourable: boolean;
  /** True for Vipat, Pratyari, Vadha. */
  isDifficult: boolean;
};

/**
 * Score per tara. Sampat / Sadhaka / Parama Mitra are the classical strong
 * ones; Vipat / Pratyari / Vadha are the three to step around.
 */
const TARA_SCORE: Record<TaraNumber, number> = {
  1: 48, // Janma — mixed, favours rest
  2: 95, // Sampat — gain
  3: 16, // Vipat — hurdles
  4: 85, // Kshema — safety
  5: 22, // Pratyari — resistance
  6: 90, // Sadhaka — accomplishment
  7: 10, // Vadha — loss
  8: 88, // Mitra — friendly
  9: 100 // Parama Mitra — strongest
};

const FAVOURABLE_TARAS: TaraNumber[] = [2, 4, 6, 8, 9];
const DIFFICULT_TARAS: TaraNumber[] = [3, 5, 7];

/**
 * @param janmaNakshatraIndex 0..26 birth Moon nakshatra
 * @param transitNakshatraIndex 0..26 Moon nakshatra on the day in question
 */
export const calculateTaraBala = (
  janmaNakshatraIndex: number,
  transitNakshatraIndex: number
): TaraResult => {
  const janma = ((Math.round(janmaNakshatraIndex) % 27) + 27) % 27;
  const transit = ((Math.round(transitNakshatraIndex) % 27) + 27) % 27;

  const count = ((transit - janma + 27) % 27) + 1; // 1..27
  const tara = (((count - 1) % 9) + 1) as TaraNumber;

  return {
    tara,
    count,
    score: TARA_SCORE[tara],
    isFavourable: FAVOURABLE_TARAS.includes(tara),
    isDifficult: DIFFICULT_TARAS.includes(tara)
  };
};

/* ------------------------------------------------------------------ *
 * Chandra Bala
 * ------------------------------------------------------------------ */

export type ChandraBalaResult = {
  /** 1..12 — transit Moon rashi counted from the janma rashi. */
  house: number;
  /** 0..100 contribution to the day score. */
  score: number;
  /** Moon in the 8th from the janma rashi. */
  isChandrashtama: boolean;
  isFavourable: boolean;
};

/**
 * Houses 1, 3, 6, 7, 10 and 11 from the janma rashi are the supportive ones;
 * 4, 8 and 12 are the draining ones, with the 8th (Chandrashtama) weakest.
 */
const CHANDRA_BALA_SCORE: Record<number, number> = {
  1: 68,
  2: 60,
  3: 90,
  4: 32,
  5: 55,
  6: 85,
  7: 78,
  8: 12,
  9: 58,
  10: 88,
  11: 96,
  12: 26
};

const FAVOURABLE_HOUSES = [1, 3, 6, 7, 10, 11];

/**
 * @param janmaRashiIndex 0..11 birth Moon rashi
 * @param transitRashiIndex 0..11 Moon rashi on the day in question
 */
export const calculateChandraBala = (
  janmaRashiIndex: number,
  transitRashiIndex: number
): ChandraBalaResult => {
  const janma = ((Math.round(janmaRashiIndex) % 12) + 12) % 12;
  const transit = ((Math.round(transitRashiIndex) % 12) + 12) % 12;

  const house = ((transit - janma + 12) % 12) + 1; // 1..12

  return {
    house,
    score: CHANDRA_BALA_SCORE[house] ?? 50,
    isChandrashtama: house === 8,
    isFavourable: FAVOURABLE_HOUSES.includes(house)
  };
};

/* ------------------------------------------------------------------ *
 * Rashi lords, day lords and graha attributes
 * ------------------------------------------------------------------ */

/** Lord of each rashi, indexed 0..11. */
export const RASHI_LORD: GrahaKey[] = [
  "Mars", // Mesha
  "Venus", // Vrishabha
  "Mercury", // Mithuna
  "Moon", // Karka
  "Sun", // Simha
  "Mercury", // Kanya
  "Venus", // Tula
  "Mars", // Vrischika
  "Jupiter", // Dhanu
  "Saturn", // Makara
  "Saturn", // Kumbha
  "Jupiter" // Meena
];

/** Lord of each weekday, index 0 = Sunday (matches Date.getDay()). */
export const WEEKDAY_LORD: GrahaKey[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn"
];

/** Classical number of each graha. */
export const GRAHA_NUMBER: Record<GrahaKey, number> = {
  Sun: 1,
  Moon: 2,
  Jupiter: 3,
  Rahu: 4,
  Mercury: 5,
  Venus: 6,
  Ketu: 7,
  Saturn: 8,
  Mars: 9
};

export const GRAHA_COLOUR: Record<GrahaKey, ColourKey> = {
  Sun: "orange",
  Moon: "white",
  Mars: "red",
  Mercury: "green",
  Jupiter: "yellow",
  Venus: "pink",
  Saturn: "darkblue",
  Rahu: "darkblue",
  Ketu: "red"
};

export const GRAHA_DIRECTION: Record<GrahaKey, DirectionKey> = {
  Sun: "east",
  Moon: "northwest",
  Mars: "south",
  Mercury: "north",
  Jupiter: "northeast",
  Venus: "southeast",
  Saturn: "west",
  Rahu: "southwest",
  Ketu: "northwest"
};

/* ------------------------------------------------------------------ *
 * Natural friendship between grahas
 * ------------------------------------------------------------------ */

export type Friendship = "same" | "friend" | "neutral" | "enemy";

const FRIENDS: Record<GrahaKey, GrahaKey[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
  Rahu: ["Venus", "Saturn"],
  Ketu: ["Mars", "Venus"]
};

const ENEMIES: Record<GrahaKey, GrahaKey[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
  Rahu: ["Sun", "Moon"],
  Ketu: ["Sun", "Moon"]
};

export const friendshipBetween = (a: GrahaKey, b: GrahaKey): Friendship => {
  if (a === b) return "same";
  if (FRIENDS[a]?.includes(b)) return "friend";
  if (ENEMIES[a]?.includes(b)) return "enemy";
  return "neutral";
};

const FRIENDSHIP_SCORE: Record<Friendship, number> = {
  same: 85,
  friend: 90,
  neutral: 65,
  enemy: 40
};

export const friendshipScore = (a: GrahaKey, b: GrahaKey): number =>
  FRIENDSHIP_SCORE[friendshipBetween(a, b)];

/* ------------------------------------------------------------------ *
 * Tithi grouping
 * ------------------------------------------------------------------ */

export type TithiGroup = "nanda" | "bhadra" | "jaya" | "rikta" | "purna";

/**
 * @param tithiInPaksha 1..15
 */
export const tithiGroupOf = (tithiInPaksha: number): TithiGroup => {
  const t = ((Math.round(tithiInPaksha) - 1 + 15) % 15) + 1; // 1..15
  const slot = t % 5; // 1 Nanda, 2 Bhadra, 3 Jaya, 4 Rikta, 0 Purna
  if (slot === 1) return "nanda";
  if (slot === 2) return "bhadra";
  if (slot === 3) return "jaya";
  if (slot === 4) return "rikta";
  return "purna";
};

export const TITHI_GROUP_SCORE: Record<TithiGroup, number> = {
  nanda: 75,
  bhadra: 86,
  jaya: 80,
  rikta: 30,
  purna: 90
};

/* ------------------------------------------------------------------ *
 * Chart helpers
 * ------------------------------------------------------------------ */

/** Nakshatra index (0..26) of the natal Moon. */
export const janmaNakshatraIndex = (kundli: KundliOutput): number => {
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  return moon ? moon.nakshatra.index : 0;
};

/** Rashi index (0..11) of the natal Moon. */
export const janmaRashiIndex = (kundli: KundliOutput): number => kundli.moonSign.index;

/** Lord of the natal Moon rashi — the person's standing "friendly" graha. */
export const janmaRashiLord = (kundli: KundliOutput): GrahaKey =>
  RASHI_LORD[janmaRashiIndex(kundli)] ?? "Moon";
