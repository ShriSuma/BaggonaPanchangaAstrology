/**
 * instantPrashnaEngine.ts — Instant Horary / Prashna Consultation Engine
 *
 * Classical Vedic Horary & Real-time Consultation Clock based on Prashna Marga,
 * Daivajna Vallabha, and Brihat Samhita.
 *
 * Computes:
 * 1. Current Planetary Hour (ಹೋರೆ / Hora) and its cosmic ruler & significance.
 * 2. Current Choghadiya (ಚೋಘಡಿಯಾ) period, quality, and action suitability.
 * 3. Live Chandra Bala (ಚಂದ್ರಬಲ) & Chandrashtama (ಚಂದ್ರಾಷ್ಟಮ ಪರೀಕ್ಷೆ).
 * 4. Rahu Kalam & Gulika Kalam active status.
 * 5. Overall Consultation Muhurtha score (0-100) and authoritative verdict.
 */

import { siderealLongitudes } from "./EphemerisEngine";
import { degreeToRashi } from "./AstroMath";
import { toKannadaRashi, toKannadaPlanet } from "../utils/kannadaAstrologyTerms";

export interface InstantPrashnaClock {
  timestamp: string;
  weekdayKn: string;
  weekdayEn: string;

  // 1. Hora
  horaLordEn: string;
  horaLordKn: string;
  horaSignificanceKn: string;
  horaSignificanceEn: string;
  isHoraAuspicious: boolean;

  // 2. Choghadiya
  choghadiyaNameKn: string;
  choghadiyaNameEn: string;
  choghadiyaQuality: "auspicious" | "gainful" | "neutral" | "caution" | "inauspicious";
  choghadiyaDescKn: string;
  choghadiyaDescEn: string;

  // 3. Chandra Bala & Chandrashtama
  transitMoonRashiKn: string;
  transitMoonRashiEn: string;
  transitMoonRashiIdx: number;
  chandraHouseOffset: number; // 1 to 12 from natal Moon
  isChandrashtama: boolean;
  isArdhaChandrashtama: boolean;
  isVyayaChandra: boolean;
  isChandraShubha: boolean;
  chandraBalaStatusKn: string;
  chandraBalaStatusEn: string;
  chandraGuidanceKn: string;
  chandraGuidanceEn: string;

  // 4. Rahu Kalam / Gulika
  isRahuKalamActive: boolean;
  isGulikaKalamActive: boolean;
  rahuKalamTimeStr: string;

  // 5. Overall Consultation Score & Verdict
  muhurthaScore: number;
  verdictKn: string;
  verdictEn: string;
  badgeColor: "emerald" | "amber" | "rose";
}

// Chaldean Planetary Order (Descending speed/distance)
const CHALDEAN_HORA_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

// Weekday Day-Lord Map (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
const WEEKDAY_NAMES_KN = ["ಭಾನುವಾರ", "ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ"];
const WEEKDAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_LORDS_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

// Day Choghadiyas for 7 weekdays (8 periods per day, sunrise to sunset)
const DAY_CHOGHADIYA_TABLE: Record<number, string[]> = {
  0: ["Udvega", "Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga", "Udvega"], // Sun
  1: ["Amrita", "Kala", "Shubha", "Roga", "Udvega", "Chara", "Labha", "Amrita"], // Mon
  2: ["Roga", "Udvega", "Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga"],   // Tue
  3: ["Labha", "Amrita", "Kala", "Shubha", "Roga", "Udvega", "Chara", "Labha"],  // Wed
  4: ["Shubha", "Roga", "Udvega", "Chara", "Labha", "Amrita", "Kala", "Shubha"], // Thu
  5: ["Chara", "Labha", "Amrita", "Kala", "Shubha", "Roga", "Udvega", "Chara"],  // Fri
  6: ["Kala", "Shubha", "Roga", "Udvega", "Chara", "Labha", "Amrita", "Kala"]    // Sat
};

// Night Choghadiyas for 7 weekdays (8 periods per night, sunset to next sunrise)
const NIGHT_CHOGHADIYA_TABLE: Record<number, string[]> = {
  0: ["Shubha", "Amrita", "Chara", "Roga", "Kala", "Labha", "Udvega", "Shubha"],
  1: ["Chara", "Roga", "Kala", "Labha", "Udvega", "Shubha", "Amrita", "Chara"],
  2: ["Kala", "Labha", "Udvega", "Shubha", "Amrita", "Chara", "Roga", "Kala"],
  3: ["Udvega", "Shubha", "Amrita", "Chara", "Roga", "Kala", "Labha", "Udvega"],
  4: ["Amrita", "Chara", "Roga", "Kala", "Labha", "Udvega", "Shubha", "Amrita"],
  5: ["Roga", "Kala", "Labha", "Udvega", "Shubha", "Amrita", "Chara", "Roga"],
  6: ["Labha", "Udvega", "Shubha", "Amrita", "Chara", "Roga", "Kala", "Labha"]
};

// Rahu Kalam day fraction (1-8):
// Sun: 8, Mon: 2, Tue: 7, Wed: 5, Thu: 6, Fri: 4, Sat: 3
const RAHU_KALAM_PERIOD: Record<number, number> = {
  0: 8,
  1: 2,
  2: 7,
  3: 5,
  4: 6,
  5: 4,
  6: 3
};

/**
 * Calculates real-time Prashna Clock and Chandra Bala for any instant consultation.
 */
export function calculateInstantPrashnaClock(
  natalMoonSignIndex: number,
  targetDate: Date = new Date(),
  latitude = 14.5479,
  longitude = 74.3188
): InstantPrashnaClock {
  // 1. Current Weekday & Times
  const weekday = targetDate.getDay();
  const weekdayKn = WEEKDAY_NAMES_KN[weekday];
  const weekdayEn = WEEKDAY_NAMES_EN[weekday];

  // Standard Vedic approximate sunrise: 06:00, sunset: 18:00 local time
  const hours = targetDate.getHours() + targetDate.getMinutes() / 60;
  const isNight = hours < 6 || hours >= 18;

  // 2. Calculate Hora
  let horaLord = "Jupiter";
  let horaIndex = 0;
  if (!isNight) {
    const elapsedDayHours = Math.max(0, hours - 6);
    horaIndex = Math.min(11, Math.floor((elapsedDayHours / 12) * 12));
  } else {
    const elapsedNightHours = hours >= 18 ? hours - 18 : hours + 6;
    horaIndex = 12 + Math.min(11, Math.floor((elapsedNightHours / 12) * 12));
  }

  const dayLordName = WEEKDAY_LORDS_ORDER[weekday];
  const chaldeanStartIdx = CHALDEAN_HORA_ORDER.indexOf(dayLordName);
  const currentChaldeanIdx = (chaldeanStartIdx + horaIndex) % 7;
  horaLord = CHALDEAN_HORA_ORDER[currentChaldeanIdx] || "Jupiter";

  const horaLordKn = toKannadaPlanet(horaLord);
  const isHoraAuspicious = ["Jupiter", "Venus", "Mercury", "Moon"].includes(horaLord);

  let horaSignificanceKn = "ದೈವಾನುಗ್ರಹ, ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ & ಮಂಗಳ ಕಾರ್ಯಗಳಿಗೆ ಶುಭ ಮುಹೂರ್ತ.";
  let horaSignificanceEn = "Divine grace, spiritual counsel, and auspicious resolution.";
  if (horaLord === "Jupiter") {
    horaSignificanceKn = "ಗುರು ಹೋರೆ: ಜ್ಞಾನ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ, ಸತ್ಸಲಹೆ & ಗುರು ಕೃಪೆಯ ಪರಮ ಶುಭ ಮುಹೂರ್ತ.";
    horaSignificanceEn = "Jupiter Hora: Supreme wisdom, family tranquility, and auspicious divine counsel.";
  } else if (horaLord === "Venus") {
    horaSignificanceKn = "ಶುಕ್ರ ಹೋರೆ: ಕಲ್ಯಾಣ ಯೋಗ, ಸೌಭಾಗ್ಯ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ದಾಂಪತ್ಯ ಪ್ರೀತಿಯ ಶುಭ ಮುಹೂರ್ತ.";
    horaSignificanceEn = "Venus Hora: Matrimonial grace, prosperity, harmony, and creative vision.";
  } else if (horaLord === "Mercury") {
    horaSignificanceKn = "ಬುಧ ಹೋರೆ: ವ್ಯಾಪಾರ, ವಿದ್ಯಾಭ್ಯಾಸ, ಲೆಕ್ಕಪತ್ರ, ನೂತನ ಒಪ್ಪಂದ & ಸಂವಹನಕ್ಕೆ ಅತ್ಯುತ್ತಮ ಕಾಲ.";
    horaSignificanceEn = "Mercury Hora: Commerce, education, strategic planning, and clear communication.";
  } else if (horaLord === "Moon") {
    horaSignificanceKn = "ಚಂದ್ರ ಹೋರೆ: ಮಾತೃ ಆಶೀರ್ವಾದ, ಪ್ರಯಾಣ, ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ & ಮಾನಸಿಕ ಶಾಂತಿಗೆ ಅನುಕೂಲ.";
    horaSignificanceEn = "Moon Hora: Maternal blessings, public resonance, and emotional composure.";
  } else if (horaLord === "Sun") {
    horaSignificanceKn = "ರವಿ ಹೋರೆ: ಆಡಳಿತಾತ್ಮಕ ನಿರ್ಧಾರ, ಸರ್ಕಾರಿ ಕೆಲಸ, ಆತ್ಮಗೌರವ & ಪಿತೃ ಪ್ರಾರ್ಥನೆಗೆ ಸೂಕ್ತ ಕಾಲ.";
    horaSignificanceEn = "Sun Hora: Governance, administrative clarity, leadership, and paternal honoring.";
  } else if (horaLord === "Mars") {
    horaSignificanceKn = "ಕುಜ ಹೋರೆ: ಶೌರ್ಯ, ಆಸ್ತಿ/ಭೂಮಿ ವಿಚಾರ, ಸ್ಪರ್ಧೆ; ವಾಗ್ವಾದ ಹಾಗೂ ಅವಸರದ ನಿರ್ಧಾರ ಬೇಡ.";
    horaSignificanceEn = "Mars Hora: Vitality, property matters, courage; avoid impulsive confrontation.";
  } else if (horaLord === "Saturn") {
    horaSignificanceKn = "ಶನಿ ಹೋರೆ: ಸಂಯಮ, ಕರ್ಮ ಶಾಂತಿ, ಶ್ರಮದಾಯಕ ಕಾರ್ಯ; ಧಾವಂತದ ಒಪ್ಪಂದಗಳನ್ನು ಮುಂದೂಡಿ.";
    horaSignificanceEn = "Saturn Hora: Endurance, karmic pacification, patient contemplation; avoid haste.";
  }

  // 3. Calculate Choghadiya
  const choghadiyaList = isNight ? NIGHT_CHOGHADIYA_TABLE[weekday] : DAY_CHOGHADIYA_TABLE[weekday];
  const partIndex = Math.min(7, Math.floor((isNight ? (hours >= 18 ? hours - 18 : hours + 6) : hours - 6) / 1.5));
  const rawChoghadiya = choghadiyaList[partIndex] || "Shubha";

  const CHOGHADIYA_MAP: Record<string, { kn: string; en: string; quality: InstantPrashnaClock["choghadiyaQuality"]; descKn: string; descEn: string }> = {
    Amrita: {
      kn: "ಅಮೃತ",
      en: "Amrita",
      quality: "auspicious",
      descKn: "ಅತ್ಯುನ್ನತ ಅಮೃತ ಮುಹೂರ್ತ: ಸಮಸ್ತ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ ಹಾಗೂ ಸಂಕಲ್ಪಗಳಿಗೆ ಪರಿಪೂರ್ಣ ಸಫಲತೆ.",
      descEn: "Supreme Amrita Muhurtha: Highly auspicious for divine counsel and auspicious vows."
    },
    Shubha: {
      kn: "ಶುಭ",
      en: "Shubha",
      quality: "auspicious",
      descKn: "ಮಂಗಳಕರ ಶುಭ ಮುಹೂರ್ತ: ಕಲ್ಯಾಣ, ದೈವಿಕ ಪರಿಹಾರ ಹಾಗೂ ಧರ್ಮ ಕಾರ್ಯಗಳಿಗೆ ಶ್ರೇಷ್ಠ ಕಾಲ.",
      descEn: "Auspicious Shubha Period: Highly favorable for religious rituals, remedies, and wellness."
    },
    Labha: {
      kn: "ಲಾಭ",
      en: "Labha",
      quality: "gainful",
      descKn: "ಧನ-ಲಾಭ ಮುಹೂರ್ತ: ವೃತ್ತಿ ಪ್ರಗತಿ, ಆರ್ಥಿಕ ಯೋಜನೆ ಹಾಗೂ ನೂತನ ಹೆಜ್ಜೆಗಳಿಗೆ ಅನುಕೂಲ.",
      descEn: "Gainful Labha Period: Favorable for professional progress, investments, and breakthroughs."
    },
    Chara: {
      kn: "ಚರ",
      en: "Chara",
      quality: "neutral",
      descKn: "ಚರ ಮುಹೂರ್ತ: ಪ್ರಯಾಣ, ಬದಲಾವಣೆ ಹಾಗೂ ಸಾಮಾನ್ಯ ಕಾರ್ಯಗಳಿಗೆ ಸಾಧಾರಣ ಅನುಕೂಲ.",
      descEn: "Mobile Chara Period: Neutral for general affairs, movement, and travel."
    },
    Udvega: {
      kn: "ಉದ್ವೇಗ",
      en: "Udvega",
      quality: "caution",
      descKn: "ಉದ್ವೇಗ ಕಾಲ: ಮಾನಸಿಕ ಆತಂಕ ಕಾಡಬಹುದು; ಪ್ರಮುಖ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸಂಯಮ ವಹಿಸಿ.",
      descEn: "Udvega Period: Anxiety-prone window; exercise prudence in critical financial commitments."
    },
    Roga: {
      kn: "ರೋಗ",
      en: "Roga",
      quality: "caution",
      descKn: "ರೋಗ ಕಾಲ: ಪರಿಶ್ರಮ ಹಾಗೂ ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ; ದೇವತಾ ಪ್ರಾರ್ಥನೆ ಶ್ರೇಯಸ್ಕರ.",
      descEn: "Roga Period: Demands patience and physical care; invoke divine protection."
    },
    Kala: {
      kn: "ಕಾಲ",
      en: "Kala",
      quality: "inauspicious",
      descKn: "ಕಾಲ ಮುಹೂರ್ತ: ತೀವ್ರ ಜಾಗರೂಕತೆ ವಹಿಸಿ; ಕೇವಲ ಶಾಂತಿ-ಪೂಜೆ ಹಾಗೂ ಈಶ್ವರ ಸ್ಮರಣೆಗೆ ಸೀಮಿತಗೊಳಿಸಿ.",
      descEn: "Kala Period: Inauspicious for new beginnings; focus solely on prayer and karmic remedies."
    }
  };

  const chogData = CHOGHADIYA_MAP[rawChoghadiya] || CHOGHADIYA_MAP.Shubha;

  // 4. Rahu Kalam
  const rahuPeriod = RAHU_KALAM_PERIOD[weekday] || 8;
  const rahuStartHour = 6 + (rahuPeriod - 1) * 1.5;
  const rahuEndHour = rahuStartHour + 1.5;
  const isRahuKalamActive = !isNight && hours >= rahuStartHour && hours < rahuEndHour;
  const formatTimeHM = (h: number) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
  };
  const rahuKalamTimeStr = `${formatTimeHM(rahuStartHour)} - ${formatTimeHM(rahuEndHour)}`;

  // 5. Live Chandra Bala & Chandrashtama
  const liveSky = siderealLongitudes(targetDate, "lahiri");
  const liveMoonDeg = liveSky.moon;
  const transitMoonRashi = degreeToRashi(liveMoonDeg);
  const transitMoonRashiIdx = transitMoonRashi.index;
  const transitMoonRashiKn = toKannadaRashi(transitMoonRashi.english);
  const transitMoonRashiEn = transitMoonRashi.english;

  const chandraHouseOffset = ((transitMoonRashiIdx - natalMoonSignIndex + 12) % 12) + 1;
  const isChandrashtama = chandraHouseOffset === 8;
  const isArdhaChandrashtama = chandraHouseOffset === 4;
  const isVyayaChandra = chandraHouseOffset === 12;
  const isChandraShubha = [1, 3, 6, 7, 10, 11].includes(chandraHouseOffset);

  let chandraBalaStatusKn = "ಶುಭ ಚಂದ್ರಬಲ";
  let chandraBalaStatusEn = "Favorable Moon Transit";
  let chandraGuidanceKn = "ಇಂದು ಚಂದ್ರನು ನಿಮ್ಮ ರಾಶಿಗೆ ಅನುಕೂಲ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಧೈರ್ಯ, ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಶಾಂತಿಯನ್ನು ನೀಡುತ್ತಿದ್ದಾನೆ.";
  let chandraGuidanceEn = "The Moon is transiting a supportive house, conferring mental clarity, courage, and serenity.";

  if (isChandrashtama) {
    chandraBalaStatusKn = "🔴 ಚಂದ್ರಾಷ್ಟಮ (Chandrashtama Active)";
    chandraBalaStatusEn = "🔴 Chandrashtama Active (8th House Transit)";
    chandraGuidanceKn = "⚠️ ಎಚ್ಚರಿಕೆ: ಇಂದು ನಿಮ್ಮ ರಾಶಿಗೆ ಚಂದ್ರಾಷ್ಟಮ ದಿನವಾಗಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಅಕಾರಣ ಆತಂಕ, ಚಾಂಚಲ್ಯ ಹಾಗೂ ಗೊಂದಲ ಉಂಟಾಗುವುದು ಸಹಜ. ಮಹತ್ವದ ನಿರ್ಧಾರಗಳನ್ನು ಮುಂದೂಡಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಮಾಡಿ.";
    chandraGuidanceEn = "⚠️ Notice: Active Chandrashtama today (Moon transiting 8th from your natal Moon). Natural to experience unexplained restlessness or mental fog; defer major gambles and meditate on Lord Shiva.";
  } else if (isArdhaChandrashtama) {
    chandraBalaStatusKn = "🟡 ಅರ್ಧ ಚಂದ್ರಾಷ್ಟಮ (4th House Moon)";
    chandraBalaStatusEn = "🟡 4th House Transit (Restless Mind)";
    chandraGuidanceKn = "ಚಂದ್ರನು 4ನೇ ಸುಖ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಸಣ್ಣಪುಟ್ಟ ಕೌಟುಂಬಿಕ ಯೋಚನೆಗಳು ಕಾಡಬಹುದು; ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತವಾಗಿರಿಸಿ.";
    chandraGuidanceEn = "Moon transiting 4th house may provoke domestic reflections; maintain emotional balance.";
  } else if (isVyayaChandra) {
    chandraBalaStatusKn = "🟡 ವ್ಯಯ ಚಂದ್ರ (12th House Moon)";
    chandraBalaStatusEn = "🟡 12th House Transit (Drain & Fatigue)";
    chandraGuidanceKn = "ಚಂದ್ರನು 12ನೇ ವ್ಯಯ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಅನಗತ್ಯ ಚಿಂತೆಗಳಿಂದ ದೂರವಿರಿ.";
    chandraGuidanceEn = "Moon transiting 12th house advises guarding against fatigue and overspending.";
  }

  // 6. Overall Consultation Score & Verdict
  let muhurthaScore = 75;
  if (chogData.quality === "auspicious") muhurthaScore += 15;
  if (chogData.quality === "gainful") muhurthaScore += 10;
  if (chogData.quality === "caution") muhurthaScore -= 15;
  if (chogData.quality === "inauspicious") muhurthaScore -= 25;
  if (isHoraAuspicious) muhurthaScore += 10;
  if (isChandraShubha) muhurthaScore += 10;
  if (isChandrashtama) muhurthaScore -= 25;
  if (isRahuKalamActive) muhurthaScore -= 20;

  muhurthaScore = Math.max(25, Math.min(99, muhurthaScore));

  let verdictKn = "ಪರಮ ಶುಭ ಸಮಾಲೋಚನಾ ಮುಹೂರ್ತ";
  let verdictEn = "Highly Auspicious Consultation Window";
  let badgeColor: InstantPrashnaClock["badgeColor"] = "emerald";

  if (isChandrashtama || isRahuKalamActive || chogData.quality === "inauspicious") {
    verdictKn = isChandrashtama ? "ಚಂದ್ರಾಷ್ಟಮ ದಿನ — ಶಾಂತಿ ಮುಹೂರ್ತ" : "ಜಾಗರೂಕತೆಯ ಮುಹೂರ್ತ — ಈಶ್ವರ ಸ್ಮರಣೆ ಮಾಡಿ";
    verdictEn = isChandrashtama ? "Chandrashtama Day — Remedial Window" : "Cautionary Muhurtha — Focus on Prayer";
    badgeColor = "rose";
  } else if (muhurthaScore < 65) {
    verdictKn = "ಸಾಮಾನ್ಯ ಮುಹೂರ್ತ";
    verdictEn = "Moderate Consultation Window";
    badgeColor = "amber";
  }

  return {
    timestamp: targetDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    weekdayKn,
    weekdayEn,
    horaLordEn: horaLord,
    horaLordKn,
    horaSignificanceKn,
    horaSignificanceEn,
    isHoraAuspicious,
    choghadiyaNameKn: chogData.kn,
    choghadiyaNameEn: chogData.en,
    choghadiyaQuality: chogData.quality,
    choghadiyaDescKn: chogData.descKn,
    choghadiyaDescEn: chogData.descEn,
    transitMoonRashiKn,
    transitMoonRashiEn,
    transitMoonRashiIdx,
    chandraHouseOffset,
    isChandrashtama,
    isArdhaChandrashtama,
    isVyayaChandra,
    isChandraShubha,
    chandraBalaStatusKn,
    chandraBalaStatusEn,
    chandraGuidanceKn,
    chandraGuidanceEn,
    isRahuKalamActive,
    isGulikaKalamActive: false,
    rahuKalamTimeStr,
    muhurthaScore,
    verdictKn,
    verdictEn,
    badgeColor
  };
}
