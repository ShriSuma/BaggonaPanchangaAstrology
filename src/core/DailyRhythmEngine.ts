/**
 * DailyRhythmEngine — builds a personal day-by-day rhythm for the next six
 * months from one birth chart.
 *
 * Each day is scored from five classical inputs, all measured against the
 * person's own birth Moon:
 *   1. Tara Bala      — transit Moon nakshatra counted from the janma nakshatra
 *   2. Chandra Bala   — transit Moon rashi counted from the janma rashi
 *   3. Tithi group    — Nanda / Bhadra / Jaya / Rikta / Purna
 *   4. Vara           — friendship between the weekday lord and the janma rashi lord
 *   5. Vimshottari    — the running bhukti lord's relationship to the same
 *
 * The output is fully deterministic: the same birth details always produce the
 * same calendar, on any device, offline, with no AI involved.
 */

import { degreeToNakshatra, degreeToRashi, normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import {
  calculateChandraBala,
  calculateTaraBala,
  friendshipScore,
  janmaNakshatraIndex,
  janmaRashiIndex,
  janmaRashiLord,
  tithiGroupOf,
  GRAHA_COLOUR,
  GRAHA_DIRECTION,
  GRAHA_NUMBER,
  TITHI_GROUP_SCORE,
  WEEKDAY_LORD,
  type ChandraBalaResult,
  type TaraResult,
  type TithiGroup
} from "./TaraBalaEngine";
import type { AyanamsaModel, KundliOutput, NodeType } from "./AstroTypes";
import type { ColourKey, DirectionKey, EnergyBand, GrahaKey } from "../features/seva/sevaLocale";

/** Indian Standard Time, the default reckoning for this panchanga. */
const IST_OFFSET_MINUTES = 330;

/** Panchanga days are reckoned from sunrise; 06:00 local is a stable stand-in. */
const SAMPLE_HOUR_LOCAL = 6;

export type RhythmDay = {
  /** Local calendar day, YYYY-MM-DD. */
  ymd: string;
  /** 0 = Sunday, matching Date.getDay(). */
  weekday: number;
  /** 1..31 */
  dayOfMonth: number;
  /** 0..11 */
  monthIndex: number;
  year: number;

  moonNakshatraIndex: number;
  moonRashiIndex: number;

  /** 1..30 across the full lunar month. */
  tithiNumber: number;
  /** 1..15 within the paksha. */
  tithiInPaksha: number;
  paksha: "shukla" | "krishna";
  tithiGroup: TithiGroup;

  tara: TaraResult;
  chandra: ChandraBalaResult;
  dayLord: GrahaKey;
  bhuktiLord: GrahaKey | null;

  /** 0..100 */
  energyScore: number;
  band: EnergyBand;
  /** 0..100 */
  arthaScore: number;
  isMoneyDay: boolean;

  isChandrashtama: boolean;
  /** Transit Moon is back on the person's own birth star. */
  isJanmaNakshatraDay: boolean;
  isEkadashi: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
  isPradosha: boolean;
  isSankashti: boolean;
  /** Any of the vrata days above — a good day to light a lamp. */
  isPoojaDay: boolean;

  luckyNumbers: number[];
  luckyColour: ColourKey;
  luckyDirection: DirectionKey;
};

export type RhythmMonth = {
  /** 0..11 */
  monthIndex: number;
  year: number;
  days: RhythmDay[];
  /** Blank cells before the 1st so the grid starts on the right weekday. */
  leadingBlanks: number;
  highCount: number;
  steadyCount: number;
  restCount: number;
  moneyCount: number;
  /** Up to three strongest days of the month, by energy. */
  bestDays: RhythmDay[];
  /** Up to three days to take gently. */
  carefulDays: RhythmDay[];
  moneyDays: RhythmDay[];
};

export type RhythmResult = {
  startYmd: string;
  endYmd: string;
  days: RhythmDay[];
  months: RhythmMonth[];
  janmaNakshatraIndex: number;
  janmaRashiIndex: number;
  janmaRashiLord: GrahaKey;
  /** Overall lucky numbers that hold across the whole period. */
  personalNumbers: number[];
  /** The person's standing colour, from their janma rashi lord. */
  personalColour: ColourKey;
  personalDirection: DirectionKey;
};

export type RhythmOptions = {
  /** Defaults to 180. */
  days?: number;
  ayanamsaModel?: AyanamsaModel;
  nodeType?: NodeType;
  /** Minutes east of UTC for the calendar owner. Defaults to IST. */
  utcOffsetMinutes?: number;
};

/* ------------------------------------------------------------------ *
 * Date helpers — all reckoned in the calendar owner's local offset
 * ------------------------------------------------------------------ */

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** YYYY-MM-DD of an instant, as seen at the given UTC offset. */
const localYmd = (instant: Date, offsetMinutes: number): string => {
  const shifted = new Date(instant.getTime() + offsetMinutes * 60000);
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
};

/** The UTC instant of 06:00 local on the given local calendar day. */
const sampleInstantFor = (ymd: string, offsetMinutes: number): Date =>
  new Date(Date.parse(`${ymd}T${pad2(SAMPLE_HOUR_LOCAL)}:00:00Z`) - offsetMinutes * 60000);

const addLocalDays = (ymd: string, delta: number): string => {
  const base = Date.parse(`${ymd}T12:00:00Z`);
  const next = new Date(base + delta * 86400000);
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
};

/** Weekday 0..6 of a local calendar day. */
const weekdayOf = (ymd: string): number => new Date(`${ymd}T12:00:00Z`).getUTCDay();

/* ------------------------------------------------------------------ *
 * Scoring weights
 * ------------------------------------------------------------------ */

const W_TARA = 0.34;
const W_CHANDRA = 0.3;
const W_TITHI = 0.14;
const W_VARA = 0.11;
const W_DASHA = 0.11;

const BAND_HIGH_MIN = 70;
const BAND_STEADY_MIN = 45;

/** A difficult tara can never read as a high-energy day, whatever else lines up. */
const DIFFICULT_TARA_CAP = 55;
/** Chandrashtama is always a quiet day in classical practice. */
const CHANDRASHTAMA_CAP = 38;

/** How well each house from the janma rashi supports money matters. */
const CHANDRA_ARTHA_SCORE: Record<number, number> = {
  1: 62,
  2: 96,
  3: 80,
  4: 30,
  5: 50,
  6: 76,
  7: 58,
  8: 8,
  9: 55,
  10: 82,
  11: 100,
  12: 20
};

/** Weekday suitability for money matters, index 0 = Sunday. */
const VARA_ARTHA_SCORE = [65, 70, 55, 85, 95, 90, 45];

/** Natural benevolence of each graha, used for the running bhukti. */
const GRAHA_BENEFIC_SCORE: Record<GrahaKey, number> = {
  Jupiter: 90,
  Venus: 85,
  Mercury: 75,
  Moon: 75,
  Sun: 65,
  Mars: 55,
  Saturn: 50,
  Rahu: 45,
  Ketu: 45
};

const MONEY_DAY_MIN = 72;

const clamp = (n: number, lo = 0, hi = 100): number => Math.min(hi, Math.max(lo, n));

const bandFor = (score: number): EnergyBand => {
  if (score >= BAND_HIGH_MIN) return "high";
  if (score >= BAND_STEADY_MIN) return "steady";
  return "rest";
};

/* ------------------------------------------------------------------ *
 * Main computation
 * ------------------------------------------------------------------ */

/**
 * @param kundli    the birth chart
 * @param birthDate YYYY-MM-DD wall clock at the birthplace
 * @param birthTime HH:mm wall clock at the birthplace
 * @param startFrom first day of the calendar (defaults to today)
 */
export const calculateRhythm = (
  kundli: KundliOutput,
  birthDate: string,
  birthTime: string,
  birthLat: number,
  birthLng: number,
  startFrom: Date = new Date(),
  options: RhythmOptions = {}
): RhythmResult => {
  const totalDays = options.days ?? 180;
  const model = options.ayanamsaModel ?? "lahiri";
  const nodeType = options.nodeType ?? "mean";
  const offset = options.utcOffsetMinutes ?? IST_OFFSET_MINUTES;

  const natalNak = janmaNakshatraIndex(kundli);
  const natalRashi = janmaRashiIndex(kundli);
  const natalLord = janmaRashiLord(kundli);

  const startYmd = localYmd(startFrom, offset);
  const days: RhythmDay[] = [];

  for (let i = 0; i < totalDays; i += 1) {
    const ymd = addLocalDays(startYmd, i);
    const instant = sampleInstantFor(ymd, offset);
    const sky = siderealLongitudes(instant, model, nodeType);

    const moonNak = degreeToNakshatra(sky.moon).index;
    const moonRashi = degreeToRashi(sky.moon).index;

    const elongation = normalizeDegree(sky.moon - (sky.sunTithi ?? sky.sun));
    const tithiNumber = Math.min(30, Math.floor(elongation / 12) + 1);
    const paksha: "shukla" | "krishna" = tithiNumber <= 15 ? "shukla" : "krishna";
    const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
    const tithiGroup = tithiGroupOf(tithiInPaksha);

    const tara = calculateTaraBala(natalNak, moonNak);
    const chandra = calculateChandraBala(natalRashi, moonRashi);

    const weekday = weekdayOf(ymd);
    const dayLord = WEEKDAY_LORD[weekday]!;

    const age = ageDecimalYearsAt(birthDate, birthTime, birthLat, birthLng, instant);
    const bhukti = findBhuktiAtAge(kundli, age);
    const bhuktiLord = (bhukti?.bhukti as GrahaKey | undefined) ?? null;

    const varaScore = friendshipScore(natalLord, dayLord);
    const dashaScore = bhuktiLord
      ? 0.6 * friendshipScore(natalLord, bhuktiLord) + 0.4 * GRAHA_BENEFIC_SCORE[bhuktiLord]
      : 65;

    let energyScore =
      W_TARA * tara.score +
      W_CHANDRA * chandra.score +
      W_TITHI * TITHI_GROUP_SCORE[tithiGroup] +
      W_VARA * varaScore +
      W_DASHA * dashaScore;

    if (tara.isDifficult) energyScore = Math.min(energyScore, DIFFICULT_TARA_CAP);
    if (chandra.isChandrashtama) energyScore = Math.min(energyScore, CHANDRASHTAMA_CAP);
    energyScore = clamp(Math.round(energyScore));

    const arthaScore = clamp(
      Math.round(
        0.42 * (CHANDRA_ARTHA_SCORE[chandra.house] ?? 50) +
          0.28 * tara.score +
          0.16 * TITHI_GROUP_SCORE[tithiGroup] +
          0.14 * (VARA_ARTHA_SCORE[weekday] ?? 60)
      )
    );

    const isMoneyDay =
      arthaScore >= MONEY_DAY_MIN &&
      !chandra.isChandrashtama &&
      tithiGroup !== "rikta" &&
      !tara.isDifficult;

    const isEkadashi = tithiInPaksha === 11;
    const isPurnima = tithiNumber === 15;
    const isAmavasya = tithiNumber === 30;
    const isPradosha = tithiInPaksha === 13;
    const isSankashti = paksha === "krishna" && tithiInPaksha === 4;
    const isJanmaNakshatraDay = moonNak === natalNak;

    const parts = ymd.split("-");

    const luckyNumbers = Array.from(
      new Set([GRAHA_NUMBER[dayLord], GRAHA_NUMBER[natalLord]])
    ).sort((a, b) => a - b);

    days.push({
      ymd,
      weekday,
      dayOfMonth: Number(parts[2]),
      monthIndex: Number(parts[1]) - 1,
      year: Number(parts[0]),
      moonNakshatraIndex: moonNak,
      moonRashiIndex: moonRashi,
      tithiNumber,
      tithiInPaksha,
      paksha,
      tithiGroup,
      tara,
      chandra,
      dayLord,
      bhuktiLord,
      energyScore,
      band: bandFor(energyScore),
      arthaScore,
      isMoneyDay,
      isChandrashtama: chandra.isChandrashtama,
      isJanmaNakshatraDay,
      isEkadashi,
      isPurnima,
      isAmavasya,
      isPradosha,
      isSankashti,
      isPoojaDay: isEkadashi || isPurnima || isAmavasya || isPradosha || isSankashti || isJanmaNakshatraDay,
      luckyNumbers,
      luckyColour: GRAHA_COLOUR[dayLord],
      luckyDirection: GRAHA_DIRECTION[dayLord]
    });
  }

  return {
    startYmd,
    endYmd: days[days.length - 1]?.ymd ?? startYmd,
    days,
    months: groupIntoMonths(days),
    janmaNakshatraIndex: natalNak,
    janmaRashiIndex: natalRashi,
    janmaRashiLord: natalLord,
    personalNumbers: [GRAHA_NUMBER[natalLord]],
    personalColour: GRAHA_COLOUR[natalLord],
    personalDirection: GRAHA_DIRECTION[natalLord]
  };
};

/* ------------------------------------------------------------------ *
 * Month grouping and highlights
 * ------------------------------------------------------------------ */

const byEnergyDesc = (a: RhythmDay, b: RhythmDay): number => b.energyScore - a.energyScore;
const byEnergyAsc = (a: RhythmDay, b: RhythmDay): number => a.energyScore - b.energyScore;
const byDate = (a: RhythmDay, b: RhythmDay): number => a.ymd.localeCompare(b.ymd);

const groupIntoMonths = (days: RhythmDay[]): RhythmMonth[] => {
  const buckets = new Map<string, RhythmDay[]>();

  for (const day of days) {
    const key = `${day.year}-${pad2(day.monthIndex + 1)}`;
    const list = buckets.get(key);
    if (list) list.push(day);
    else buckets.set(key, [day]);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, monthDays]) => {
      const first = monthDays[0]!;
      // Weekday of the 1st, so a partial first month still lines up in the grid.
      const firstOfMonth = `${first.year}-${pad2(first.monthIndex + 1)}-01`;

      return {
        monthIndex: first.monthIndex,
        year: first.year,
        days: monthDays,
        leadingBlanks: weekdayOf(firstOfMonth),
        highCount: monthDays.filter((d) => d.band === "high").length,
        steadyCount: monthDays.filter((d) => d.band === "steady").length,
        restCount: monthDays.filter((d) => d.band === "rest").length,
        moneyCount: monthDays.filter((d) => d.isMoneyDay).length,
        bestDays: [...monthDays].sort(byEnergyDesc).slice(0, 3).sort(byDate),
        carefulDays: [...monthDays].sort(byEnergyAsc).slice(0, 3).sort(byDate),
        moneyDays: monthDays.filter((d) => d.isMoneyDay)
      };
    });
};

/** Look up a single day in a computed result. */
export const findDay = (result: RhythmResult, ymd: string): RhythmDay | undefined =>
  result.days.find((d) => d.ymd === ymd);
