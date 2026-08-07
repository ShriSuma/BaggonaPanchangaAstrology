import { askGeminiBatch } from "./GeminiEngine";
import type { KundliOutput } from "./AstroTypes";
import { PlanetName } from "./AstroTypes";
import { wallClockBirthToUtc } from "./birthTime";
import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";
import { degreeToRashi } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  tithiKn: string;
  tithiEn: string;
  nakshatraKn: string;
  nakshatraEn: string;
  moonSymbol: string; // 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 based on tithi
  moonSign: string; // transit moon sign
}

export interface SixMonthCalendarData {
  monthlyNarratives: {
    month: string; // e.g., "August 2026"
    themeKn: string;
    themeEn: string;
    keyDatesKn: string;
    keyDatesEn: string;
    ritualsKn: string;
    ritualsEn: string;
  }[];
  days: CalendarDay[];
}

export interface PrasadBagData {
  luckyNumbers: string;
  luckyColorsKn: string;
  luckyColorsEn: string;
  mantraKn: string;
  mantraEn: string;
  cosmicSummaryKn: string;
  cosmicSummaryEn: string;
}

// Helper to determine Moon Phase symbol based on Tithi (1 to 30)
function getMoonSymbol(tithiVal: number): string {
  if (tithiVal === 15) return "🌕"; // Purnima
  if (tithiVal === 30 || tithiVal === 0) return "🌑"; // Amavasya

  if (tithiVal >= 1 && tithiVal <= 3) return "🌒";
  if (tithiVal >= 4 && tithiVal <= 7) return "🌓";
  if (tithiVal >= 8 && tithiVal <= 11) return "🌔";
  if (tithiVal >= 12 && tithiVal <= 14) return "🌕";

  if (tithiVal >= 16 && tithiVal <= 18) return "🌖";
  if (tithiVal >= 19 && tithiVal <= 22) return "🌗";
  if (tithiVal >= 23 && tithiVal <= 26) return "🌘";
  if (tithiVal >= 27 && tithiVal <= 29) return "🌑";

  return "🌕";
}

export async function generatePrasadBagData(
  kundli: KundliOutput,
  name: string,
  apiKey: string,
  lang: string
): Promise<PrasadBagData> {
  const moonSign = kundli.moonSign.sanskrit;
  const lagna = kundli.lagnaRashi.sanskrit;
  const nakshatra = kundli.planets.find(p => p.name === PlanetName.Moon)?.nakshatra.sanskrit || "Ashwini";

  const prompt = `You are an expert Vedic Astrologer. We are creating a personalized "Prasad Bag Insert" (a beautiful keepsake card) for ${name}.
Their Lagna is ${lagna}, Moon Sign is ${moonSign}, and Nakshatra is ${nakshatra}.

Please generate a JSON response with the following fields:
{
  "luckyNumbers": "Provide 3 lucky numbers",
  "luckyColorsKn": "Provide lucky colors in Kannada",
  "luckyColorsEn": "Provide lucky colors in English",
  "mantraKn": "A highly personalized powerful Vedic mantra based on their chart, written in Kannada script",
  "mantraEn": "The same mantra written in English/Sanskrit transliteration with a short meaning",
  "cosmicSummaryKn": "A short, beautiful, magical 2-sentence summary of their cosmic destiny in Kannada",
  "cosmicSummaryEn": "A short, beautiful, magical 2-sentence summary of their cosmic destiny in English"
}
Output ONLY valid JSON. Do not output anything else.`;

  try {
    const result = await askGeminiBatch(prompt, apiKey, ["luckyNumbers", "luckyColorsKn", "luckyColorsEn", "mantraKn", "mantraEn", "cosmicSummaryKn", "cosmicSummaryEn"]);
    return {
      luckyNumbers: result.luckyNumbers || "3, 7, 9",
      luckyColorsKn: result.luckyColorsKn || "ಹಳದಿ ಮತ್ತು ಬಿಳಿ",
      luckyColorsEn: result.luckyColorsEn || "Yellow and White",
      mantraKn: result.mantraKn || "ಓಂ ನಮಃ ಶಿವಾಯ",
      mantraEn: result.mantraEn || "Om Namah Shivaya - The universal mantra of peace",
      cosmicSummaryKn: result.cosmicSummaryKn || "ನಿಮ್ಮ ಜಾತಕವು ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿಯಾಗಿದೆ. ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಯಶಸ್ಸು ಕಾದಿದೆ.",
      cosmicSummaryEn: result.cosmicSummaryEn || "Your cosmic blueprint is powerful. Great success awaits you."
    };
  } catch (e) {
    console.error("Error generating prasad bag data:", e);
    return {
      luckyNumbers: "1, 5, 9",
      luckyColorsKn: "ಬಿಳಿ ಮತ್ತು ಕೇಸರಿ",
      luckyColorsEn: "White and Saffron",
      mantraKn: "ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ",
      mantraEn: "Om Namo Bhagavate Vasudevaya",
      cosmicSummaryKn: "ಗ್ರಹಗಳ ಅನುಗ್ರಹ ನಿಮ್ಮ ಮೇಲಿದೆ.",
      cosmicSummaryEn: "The planets are aligned in your favor."
    };
  }
}

export async function generateSixMonthCalendarData(
  kundli: KundliOutput,
  name: string,
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  apiKey: string,
  lang: string
): Promise<SixMonthCalendarData> {
  const days: CalendarDay[] = [];
  const today = new Date();

  // Calculate local daily transits for the next 180 days (approx 6 months)
  for (let i = 0; i < 180; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const panchanga = calculateTraditionalBaggona(dateStr, "12:00", latitude, longitude, "lahiri");

    // Tithi calculation roughly by moon - sun distance
    const noonUtc = wallClockBirthToUtc(dateStr, "12:00", latitude, longitude);
    const longs = siderealLongitudes(noonUtc, "lahiri");
    let diff = longs.moon - longs.sun;
    if (diff < 0) diff += 360;
    const tithiVal = Math.floor(diff / 12) + 1;

    days.push({
      date: dateStr,
      tithiKn: panchanga.tithiKn,
      tithiEn: panchanga.tithi,
      nakshatraKn: panchanga.moonNakshatraKn,
      nakshatraEn: panchanga.moonNakshatra,
      moonSymbol: getMoonSymbol(tithiVal),
      moonSign: degreeToRashi(longs.moon).sanskrit
    });
  }

  // Get next 6 month names
  const monthNames: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setMonth(today.getMonth() + i);
    monthNames.push(d.toLocaleString("en-US", { month: "long", year: "numeric" }));
  }

  const prompt = `You are an expert Vedic Astrologer creating a premium 6-month personalized astrological calendar for ${name}.
Their Moon Sign is ${kundli.moonSign.sanskrit} and Lagna is ${kundli.lagnaRashi.sanskrit}.
The 6 months are: ${monthNames.join(", ")}.

Please provide a monthly summary for these 6 months. For EACH of the 6 months, provide:
1. "month": The month name (e.g., "${monthNames[0]}")
2. "themeKn": A short 2-sentence summary of the astrological theme for this month in Kannada.
3. "themeEn": A short 2-sentence summary of the astrological theme for this month in English.
4. "keyDatesKn": 2 or 3 highly favorable or cautious dates in this month and why (in Kannada).
5. "keyDatesEn": 2 or 3 highly favorable or cautious dates in this month and why (in English).
6. "ritualsKn": Recommended ritual/puja for this month in Kannada.
7. "ritualsEn": Recommended ritual/puja for this month in English.

Return EXACTLY a JSON object with a single key "monthlyNarratives" containing an array of 6 objects, matching the structure above.`;

  let monthlyNarratives: SixMonthCalendarData["monthlyNarratives"] = [];
  try {
    const result = await askGeminiBatch(prompt, apiKey, ["monthlyNarratives"]);
    if (result && Array.isArray(result.monthlyNarratives)) {
      monthlyNarratives = result.monthlyNarratives;
    } else {
      throw new Error("Invalid format");
    }
  } catch (e) {
    console.error("Error generating calendar narrative:", e);
    // Fallback mock data
    monthlyNarratives = monthNames.map(m => ({
      month: m,
      themeKn: "ಈ ತಿಂಗಳು ನಿಮಗೆ ಶುಭ ತರಲಿದೆ.",
      themeEn: "This month brings positive energy.",
      keyDatesKn: "10 ಮತ್ತು 24ನೇ ದಿನಾಂಕಗಳು ಶುಭ.",
      keyDatesEn: "10th and 24th are favorable.",
      ritualsKn: "ಶಿವನ ಆರಾಧನೆ ಮಾಡಿ.",
      ritualsEn: "Worship Lord Shiva."
    }));
  }

  return { monthlyNarratives, days };
}
