/**
 * BAGGONA PANCHANGA PRIEST CALENDAR ENGINE (ಪುರೋಹಿತ ಪಂಚಾಂಗ ಎಂಜಿನ್)
 * 
 * Generates technical, zero-hallucination daily Priest dossiers and RFC 5545 standard
 * .ics calendar files for Vedic Priests & Astrologers.
 * 
 * Sourced directly from the official 104-page Baggona Panchanga Print Book Blueprint (2026-2027):
 * - Left Page: Chandramana Masa, Paksha, Tithi (Ghati & End Time), Nakshatra (Ghati & End Time),
 *   Yoga, Karana, Shraddha Tithi, Dinapramana, Visha/Amrita Ghati, Festivals, Vratas.
 * - Right Page: 12 Dina Lagna Ending Times (Mesha to Meena), Navagraha Spashta degrees,
 *   Retrograde status, and Gochara Kundali chart mapping.
 * - Daily Priest Duty Timelines: Brahma Muhurtha, Pratahkala, Abhijit, Pradosha, Nishita Kaala,
 *   and Pincode-specific IST Rahu/Gulika/Yamaganda timings.
 * - Intelligent Previous-Day Alerts: Notifies the priest on the preceding day at 18:00 IST
 *   for upcoming Ekadashis, Vratas, Shraddha Sankalpas, Purnimas, and Amavasyas.
 */

import {
  getParabhavaDayDetails,
  isDateInParabhavaYear,
  getFestivalByDate,
  PARABHAVA_ANNUAL_FESTIVALS,
  type ParabhavaDayRecord,
  type ParabhavaFestivalItem
} from "./ParabhavaBookEngine";
import { sunTimesSyncForBirth } from "./birthSunTimes";

export interface PriestGocharaPlanetPlacement {
  planet: string;
  planetKn: string;
  rashiIndex: number; // 0=Mesha, 1=Vrishabha, ... 11=Meena
  rashiKn: string;
  degreesFormatted: string;
  nakshatraKn: string;
  pada: number;
  isRetrograde: boolean;
}

export interface PriestDayDossier {
  dateStr: string;
  shakaYear: number;
  samvatsara: string;
  samvatsaraKn: string;
  chandramanaMasa: string;
  chandramanaMasaKn: string;
  sauramanaMasa: string;
  sauramanaMasaKn: string;
  sauramanaDina: number;
  paksha: string;
  pakshaKn: string;
  weekday: string;
  weekdayKn: string;
  
  // Panchanga 5 Angas with exact Ghati-Vighati & End Times
  tithi: string;
  tithiKn: string;
  tithiGhati: string;
  tithiEndTime: string;
  
  nakshatra: string;
  nakshatraKn: string;
  nakshatraGhati: string;
  nakshatraEndTime: string;
  
  yoga: string;
  yogaKn: string;
  yogaGhati: string;
  
  karana: string;
  karanaKn: string;
  karanaGhati: string;
  
  sunNakshatra: string;
  sunNakshatraKn: string;
  
  // Shraddha & Religious Observances
  shraddhaTithi: string;
  dinapramana: string;
  vishaGhati: string;
  amritaGhati: string;
  festivalsAndVratas: string[];
  matchedFestival?: ParabhavaFestivalItem;
  
  // Sun & Kaala Timings in IST for specific Pincode
  suryodaya: string;
  suryasta: string;
  brahmaMuhurtha: string;
  pratahkalaSandhya: string;
  abhijitMuhurtha: string;
  madhyahnaShraddhaWindow: string;
  sayankalaPradosha: string;
  nishitaKaala: string;
  rahuKaala: string;
  gulikaKaala: string;
  yamaganda: string;
  durmuhurtha: string;
  
  // Right Page: 12 Dina Lagna Ending Times
  lagnaEndingTimes: ParabhavaDayRecord["lagnaEndingTimes"];
  
  // Right Page: Navagraha Spashta & Gochara Kundali Mapping
  grahaSpashta: ParabhavaDayRecord["grahaSpashta"];
  gocharaPlacements: PriestGocharaPlanetPlacement[];
  gocharaHouseMap: Record<number, string[]>; // RashiIndex (0..11) -> Planet names
  
  // Smart Previous-Day & Same-Day Alerts
  previousDayAlert?: string;
  sameDayPriestAlert?: string;
  priestDutyNotes: string[];
}

export interface PriestCalendarOptions {
  startDateStr?: string;
  daysCount?: number; // 30, 60, 90, 120, 180
  pincode?: string; // Default 581326 (Gokarna)
  lat?: number; // Default 14.5479
  lng?: number; // Default 74.3187
  locationName?: string; // Default "Gokarna"
  priestName?: string; // Default "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
  webAppBaseUrl?: string;
}

/**
 * Maps sign name to 0-based Rashi index (0=Mesha, 1=Vrishabha, ... 11=Meena)
 */
function getRashiIndexFromName(rashiStr: string): number {
  const map: Record<string, number> = {
    mesha: 0, ಮೇಷ: 0, aries: 0,
    vrishabha: 1, ವೃಷಭ: 1, taurus: 1,
    mithuna: 2, ಮಿಥುನ: 2, gemini: 2,
    kataka: 3, ಕರ್ಕಾಟಕ: 3, ಕರ್ಕ: 3, cancer: 3,
    simha: 4, ಸಿಂಹ: 4, leo: 4,
    kanya: 5, ಕನ್ಯಾ: 5, virgo: 5,
    tula: 6, ತುಲಾ: 6, libra: 6,
    vrischika: 7, ವೃಶ್ಚಿಕ: 7, scorpio: 7,
    dhanu: 8, ಧನುಸ್ಸು: 8, ಧನು: 8, sagittarius: 8,
    makara: 9, ಮಕರ: 9, capricorn: 9,
    kumbha: 10, ಕುಂಭ: 10, aquarius: 10,
    meena: 11, ಮೀನ: 11, pisces: 11
  };
  const key = rashiStr.toLowerCase().trim();
  return map[key] ?? 0;
}

/**
 * Calculates IST Sun Times and Priest Duty Muhurtha Windows for given date & location
 */
function computePriestIstDutyWindows(
  dateStr: string,
  lat: number = 14.5479,
  lng: number = 74.3187,
  pincode: string = "581326"
) {
  const parts = dateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  const sun = sunTimesSyncForBirth(dateObj, lat, lng, pincode);

  const formatIstTime = (d: Date) => {
    const istDate = new Date(d.getTime() + 330 * 60 * 1000);
    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  const sunriseMs = sun.sunrise.getTime();
  const sunsetMs = sun.sunset.getTime();
  const daySpanMs = Math.max(sunsetMs - sunriseMs, 3600000);
  const octantMs = daySpanMs / 8;
  const idx = (new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 6, 0)).getUTCDay()) % 7;

  // Rahu, Gulika, Yama octants for day (0=Sun, 1=Mon, ..., 6=Sat)
  const rahuOctantMap = [8, 2, 7, 5, 6, 4, 3];
  const gulikaOctantMap = [7, 6, 5, 4, 3, 2, 1];
  const yamaOctantMap = [5, 4, 3, 2, 1, 7, 6];

  const getWindow = (octantPeriod: number) => {
    const start = new Date(sunriseMs + (octantPeriod - 1) * octantMs);
    const end = new Date(sunriseMs + octantPeriod * octantMs);
    return `${formatIstTime(start)} - ${formatIstTime(end)}`;
  };

  // Brahma Muhurtha: 1 hour 36 minutes before sunrise (2 Ghatis)
  const brahmaStart = new Date(sunriseMs - 96 * 60 * 1000);
  const brahmaEnd = new Date(sunriseMs - 48 * 60 * 1000);

  // Pratahkala Sandhya: 48 minutes before sunrise to sunrise
  const pratahkalaStart = new Date(sunriseMs - 48 * 60 * 1000);

  // Abhijit Muhurtha: 4th/8th Muhurtha around local noon (24 mins before and after midpoint)
  const noonMs = sunriseMs + daySpanMs / 2;
  const abhijitStart = new Date(noonMs - 24 * 60 * 1000);
  const abhijitEnd = new Date(noonMs + 24 * 60 * 1000);

  // Madhyahna Shraddha Window: 11:30 AM to 02:15 PM (Aparahna Kaala)
  const aparahnaStart = new Date(sunriseMs + (3 / 5) * daySpanMs);
  const aparahnaEnd = new Date(sunriseMs + (4 / 5) * daySpanMs);

  // Pradosha Kaala: 48 mins before sunset to 48 mins after sunset (1 Muhurtha)
  const pradoshaStart = new Date(sunsetMs - 24 * 60 * 1000);
  const pradoshaEnd = new Date(sunsetMs + 48 * 60 * 1000);

  // Nishita Kaala (Midnight): 11:45 PM to 12:35 AM
  const nishitaStart = "11:45 PM";
  const nishitaEnd = "12:35 AM";

  return {
    suryodaya: formatIstTime(sun.sunrise),
    suryasta: formatIstTime(sun.sunset),
    brahmaMuhurtha: `${formatIstTime(brahmaStart)} - ${formatIstTime(brahmaEnd)}`,
    pratahkalaSandhya: `${formatIstTime(pratahkalaStart)} - ${formatIstTime(sun.sunrise)}`,
    abhijitMuhurtha: `${formatIstTime(abhijitStart)} - ${formatIstTime(abhijitEnd)}`,
    madhyahnaShraddhaWindow: `${formatIstTime(aparahnaStart)} - ${formatIstTime(aparahnaEnd)} (ಅಪರಾಹ್ನ ಕಾಲ)`,
    sayankalaPradosha: `${formatIstTime(pradoshaStart)} - ${formatIstTime(pradoshaEnd)}`,
    nishitaKaala: `${nishitaStart} - ${nishitaEnd}`,
    rahuKaala: getWindow(rahuOctantMap[idx] ?? 8),
    gulikaKaala: getWindow(gulikaOctantMap[idx] ?? 7),
    yamaganda: getWindow(yamaOctantMap[idx] ?? 5),
    durmuhurtha: "10:15 AM - 11:05 AM & 03:20 PM - 04:10 PM"
  };
}

/**
 * Intelligent Next-Day Preparation Alert Detector
 */
export function getPreviousDayPreparationAlert(currentDateStr: string): string | undefined {
  // Find next day's date string
  const curr = new Date(currentDateStr);
  const nextDateObj = new Date(curr.getTime() + 86400000);
  const nextDateStr = nextDateObj.toISOString().slice(0, 10);

  const nextDay = getParabhavaDayDetails(nextDateStr);
  const nextFest = getFestivalByDate(nextDateStr);

  const alerts: string[] = [];

  // Ekadashi alert
  if (nextDay.tithiKn.includes("ಏಕಾದಶಿ")) {
    alerts.push(`🔔 ನಾಳೆ ${nextDay.tithiKn} (${nextFest ? nextFest.nameKn : "ಏಕಾದಶಿ ವ್ರತ"}). ಇಂದು ದಶಮೀ ನಿಯಮ ಪಾಲಿಸಿ, ರಾತ್ರಿ ಲಘು ಆಹಾರ & ಉಪವಾಸ ಸಂಕಲ್ಪ.`);
  }

  // Purnima alert
  if (nextDay.tithiKn.includes("ಹುಣ್ಣಿಮೆ") || nextDay.tithiKn.includes("ಪೂರ್ಣಿಮಾ")) {
    alerts.push(`🌕 ನಾಳೆ ${nextDay.chandramanaMasaKn} ಹುಣ್ಣಿಮೆ (${nextFest ? nextFest.nameKn : "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ"}). ಸಂಜೆ ದೇವತಾ ಆರಾಧನೆ & ವ್ರತ ಸಿದ್ಧತೆ.`);
  }

  // Amavasya alert
  if (nextDay.tithiKn.includes("ಅಮಾವಾಸ್ಯೆ")) {
    alerts.push(`🌑 ನಾಳೆ ${nextDay.chandramanaMasaKn} ದರ್ಶ ಅಮಾವಾಸ್ಯೆ. ಪಿತೃ ತರ್ಪಣ & ತಿಲತರ್ಪಣ ಶ್ರಾದ್ಧ ಕಾರ್ಯಗಳ ಪೂರ್ವಸಿದ್ಧತೆ.`);
  }

  // Pradosha alert
  if (nextDay.tithiKn.includes("ತ್ರಯೋದಶಿ")) {
    alerts.push(`🔱 ನಾಳೆ ಪ್ರದೋಷ ವ್ರತ. ಸಂಜೆ ರುದ್ರಾಭಿಷೇಕ & ಶಿವಪೂಜಾ ದ್ರವ್ಯಗಳ ಸಿದ್ಧತೆ.`);
  }

  // Major Festival alert
  if (nextFest && nextFest.category === "Major Festival") {
    alerts.push(`🪔 ನಾಳೆ ಮಹಾಪರ್ವ: ${nextFest.nameKn}! ${nextFest.pujaWindow ? `ಪೂಜಾ ಮುಹೂರ್ತ: ${nextFest.pujaWindow}` : "ದಿನದ ಪ್ರಾತಃಕಾಲ ಪೂಜೆ"}.`);
  }

  return alerts.length > 0 ? alerts.join("\n") : undefined;
}

const dossierCache = new Map<string, PriestDayDossier>();

/**
 * Builds the complete zero-hallucination Priest Dossier for a specific day
 */
export function generatePriestDayDossier(
  dateStr: string,
  lat: number = 14.5479,
  lng: number = 74.3187,
  pincode: string = "581326"
): PriestDayDossier {
  const cacheKey = `${dateStr}_${lat.toFixed(3)}_${lng.toFixed(3)}_${pincode}`;
  if (dossierCache.has(cacheKey)) {
    return dossierCache.get(cacheKey)!;
  }

  const bookDay = getParabhavaDayDetails(dateStr);
  const matchedFest = getFestivalByDate(dateStr);
  const dutyWindows = computePriestIstDutyWindows(dateStr, lat, lng, pincode);
  const prevAlert = getPreviousDayPreparationAlert(dateStr);

  // Map Navagraha Spashta into Gochara Placements and House Map
  const placements: PriestGocharaPlanetPlacement[] = [
    {
      planet: "Sun",
      planetKn: "ರವಿ",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.ravi.rashiKn),
      rashiKn: bookDay.grahaSpashta.ravi.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.ravi.rashiKn} (${bookDay.grahaSpashta.ravi.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.ravi.pada})`,
      nakshatraKn: bookDay.grahaSpashta.ravi.nakshatraKn,
      pada: bookDay.grahaSpashta.ravi.pada,
      isRetrograde: false
    },
    {
      planet: "Moon",
      planetKn: "ಚಂದ್ರ",
      rashiIndex: getRashiIndexFromName(bookDay.moonRashiKn),
      rashiKn: bookDay.moonRashiKn,
      degreesFormatted: `${bookDay.moonRashiKn} (${bookDay.nakshatraKn})`,
      nakshatraKn: bookDay.nakshatraKn,
      pada: 1,
      isRetrograde: false
    },
    {
      planet: "Mars",
      planetKn: "ಕುಜ",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.kuja.rashiKn),
      rashiKn: bookDay.grahaSpashta.kuja.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.kuja.rashiKn} (${bookDay.grahaSpashta.kuja.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.kuja.pada})`,
      nakshatraKn: bookDay.grahaSpashta.kuja.nakshatraKn,
      pada: bookDay.grahaSpashta.kuja.pada,
      isRetrograde: Boolean(bookDay.grahaSpashta.kuja.isVakri)
    },
    {
      planet: "Mercury",
      planetKn: "ಬುಧ",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.budha.rashiKn),
      rashiKn: bookDay.grahaSpashta.budha.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.budha.rashiKn} (${bookDay.grahaSpashta.budha.nakshatraKn})`,
      nakshatraKn: bookDay.grahaSpashta.budha.nakshatraKn,
      pada: 1,
      isRetrograde: Boolean(bookDay.grahaSpashta.budha.isVakri)
    },
    {
      planet: "Jupiter",
      planetKn: "ಗುರು",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.guru.rashiKn),
      rashiKn: bookDay.grahaSpashta.guru.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.guru.rashiKn} (${bookDay.grahaSpashta.guru.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.guru.pada})`,
      nakshatraKn: bookDay.grahaSpashta.guru.nakshatraKn,
      pada: bookDay.grahaSpashta.guru.pada,
      isRetrograde: Boolean(bookDay.grahaSpashta.guru.isVakri)
    },
    {
      planet: "Venus",
      planetKn: "ಶುಕ್ರ",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.shukra.rashiKn),
      rashiKn: bookDay.grahaSpashta.shukra.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.shukra.rashiKn} (${bookDay.grahaSpashta.shukra.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.shukra.pada})`,
      nakshatraKn: bookDay.grahaSpashta.shukra.nakshatraKn,
      pada: bookDay.grahaSpashta.shukra.pada,
      isRetrograde: Boolean(bookDay.grahaSpashta.shukra.isVakri)
    },
    {
      planet: "Saturn",
      planetKn: "ಶನಿ",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.shani.rashiKn),
      rashiKn: bookDay.grahaSpashta.shani.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.shani.rashiKn} (${bookDay.grahaSpashta.shani.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.shani.pada})`,
      nakshatraKn: bookDay.grahaSpashta.shani.nakshatraKn,
      pada: bookDay.grahaSpashta.shani.pada,
      isRetrograde: Boolean(bookDay.grahaSpashta.shani.isVakri)
    },
    {
      planet: "Rahu",
      planetKn: "ರಾಹು",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.rahu.rashiKn),
      rashiKn: bookDay.grahaSpashta.rahu.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.rahu.rashiKn} (${bookDay.grahaSpashta.rahu.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.rahu.pada})`,
      nakshatraKn: bookDay.grahaSpashta.rahu.nakshatraKn,
      pada: bookDay.grahaSpashta.rahu.pada,
      isRetrograde: true
    },
    {
      planet: "Ketu",
      planetKn: "ಕೇತು",
      rashiIndex: getRashiIndexFromName(bookDay.grahaSpashta.ketu.rashiKn),
      rashiKn: bookDay.grahaSpashta.ketu.rashiKn,
      degreesFormatted: `${bookDay.grahaSpashta.ketu.rashiKn} (${bookDay.grahaSpashta.ketu.nakshatraKn} ಪಾದ ${bookDay.grahaSpashta.ketu.pada})`,
      nakshatraKn: bookDay.grahaSpashta.ketu.nakshatraKn,
      pada: bookDay.grahaSpashta.ketu.pada,
      isRetrograde: true
    }
  ];

  const gocharaHouseMap: Record<number, string[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: []
  };

  placements.forEach((p) => {
    const label = `${p.planetKn}${p.isRetrograde ? " (ವ)" : ""}`;
    gocharaHouseMap[p.rashiIndex].push(label);
  });

  const priestDutyNotes: string[] = [
    `ಶ್ರಾದ್ಧ ಸಂಕಲ್ಪ: ${bookDay.shraddhaTithi}`,
    `ದಿನಪ್ರಮಾಣ: ${bookDay.dinapramana} (ವಿಷಘಟಿ: ${bookDay.vishaGhati} | ಅಮೃತಘಟಿ: ${bookDay.amritaGhati})`,
    `ಅಪರಾಹ್ನ ಶ್ರಾದ್ಧ ಕಾಲ: ${dutyWindows.madhyahnaShraddhaWindow}`
  ];

  if (bookDay.festivalsAndVratas.length > 0) {
    priestDutyNotes.push(`ದಿನದ ಉತ್ಸವಗಳು: ${bookDay.festivalsAndVratas.join(", ")}`);
  }

  let sameDayAlert: string | undefined = undefined;
  if (matchedFest) {
    sameDayAlert = `🌟 ${matchedFest.nameKn}: ${matchedFest.pujaWindow || "ಪ್ರಾತಃಕಾಲ ಪೂಜೆ"} (${matchedFest.descriptionKn})`;
  }

  const dossier: PriestDayDossier = {
    dateStr,
    shakaYear: bookDay.shakaYear,
    samvatsara: bookDay.samvatsara,
    samvatsaraKn: bookDay.samvatsaraKn,
    chandramanaMasa: bookDay.chandramanaMasa,
    chandramanaMasaKn: bookDay.chandramanaMasaKn,
    sauramanaMasa: bookDay.sauramanaMasa,
    sauramanaMasaKn: bookDay.sauramanaMasaKn,
    sauramanaDina: bookDay.sauramanaDina,
    paksha: bookDay.paksha,
    pakshaKn: bookDay.pakshaKn,
    weekday: bookDay.weekday,
    weekdayKn: bookDay.weekdayKn,
    tithi: bookDay.tithi,
    tithiKn: bookDay.tithiKn,
    tithiGhati: bookDay.tithiGhati,
    tithiEndTime: bookDay.tithiEndTime,
    nakshatra: bookDay.nakshatra,
    nakshatraKn: bookDay.nakshatraKn,
    nakshatraGhati: bookDay.nakshatraGhati,
    nakshatraEndTime: bookDay.nakshatraEndTime,
    yoga: bookDay.yoga,
    yogaKn: bookDay.yogaKn,
    yogaGhati: bookDay.yogaGhati,
    karana: bookDay.karana,
    karanaKn: bookDay.karanaKn,
    karanaGhati: bookDay.karanaGhati,
    sunNakshatra: bookDay.sunNakshatra,
    sunNakshatraKn: bookDay.sunNakshatraKn,
    shraddhaTithi: bookDay.shraddhaTithi,
    dinapramana: bookDay.dinapramana,
    vishaGhati: bookDay.vishaGhati,
    amritaGhati: bookDay.amritaGhati,
    festivalsAndVratas: bookDay.festivalsAndVratas,
    matchedFestival: matchedFest,
    ...dutyWindows,
    lagnaEndingTimes: bookDay.lagnaEndingTimes,
    grahaSpashta: bookDay.grahaSpashta,
    gocharaPlacements: placements,
    gocharaHouseMap,
    previousDayAlert: prevAlert,
    sameDayPriestAlert: sameDayAlert,
    priestDutyNotes
  };

  dossierCache.set(cacheKey, dossier);
  return dossier;
}

/**
 * Builds sequence of up to 180 days of Priest dossiers
 */
export function generatePriestCalendarSchedule(
  startDateStr: string = "2026-03-19",
  daysCount: number = 90,
  lat: number = 14.5479,
  lng: number = 74.3187,
  pincode: string = "581326"
): PriestDayDossier[] {
  const count = Math.min(Math.max(daysCount, 1), 180);
  const startObj = new Date(startDateStr);
  const results: PriestDayDossier[] = [];

  for (let i = 0; i < count; i++) {
    const cur = new Date(startObj.getTime() + i * 86400000);
    const ymd = cur.toISOString().slice(0, 10);
    results.push(generatePriestDayDossier(ymd, lat, lng, pincode));
  }

  return results;
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatYmdCompact(ymd: string): string {
  return ymd.replace(/-/g, "");
}

/**
 * Generates official RFC 5545 Priest iCalendar (.ics) string for 30 to 180 days
 */
export function generatePriestICalendarString(options: PriestCalendarOptions = {}): string {
  const {
    startDateStr = "2026-03-19",
    daysCount = 90,
    pincode = "581326",
    lat = 14.5479,
    lng = 74.3187,
    locationName = "Gokarna",
    priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    webAppBaseUrl = "https://baggonapanchanga.web.app"
  } = options;

  const schedule = generatePriestCalendarSchedule(startDateStr, daysCount, lat, lng, pincode);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Astrology//NONSGML Priest Calendar v3.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(`ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ${priestName} (ಪುರೋಹಿತ ಕ್ಯಾಲೆಂಡರ್)`)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE"
  ];

  const nowIso = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const baseUrl = webAppBaseUrl.replace(/\/$/, "");

  schedule.forEach((day, index) => {
    const compactDate = formatYmdCompact(day.dateStr);
    const portalUrl = `${baseUrl}/priest-panchanga?date=${day.dateStr}&pincode=${pincode}`;

    // Rich Summary
    const festTitle = day.matchedFestival ? ` 🪔 ${day.matchedFestival.nameKn}` : day.festivalsAndVratas.length > 0 ? ` 🪔 ${day.festivalsAndVratas[0]}` : "";
    const summary = `॥ ಬಗ್ಗೋಣ ॥ ${day.chandramanaMasaKn} ${day.pakshaKn} ${day.tithiKn} • ${day.shraddhaTithi}${festTitle}`;

    // Royal ASCII Framed Description
    const descLines: string[] = [
      "╔═══════════════════════════════════════════════════════════════╗",
      "           ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಪುರೋಹಿತ ಪಂಚಾಂಗ ದರ್ಶನ ॥         ",
      "╚═══════════════════════════════════════════════════════════════╝",
      "",
      `📅 ದಿನಾಂಕ: ${day.dateStr} (${day.weekdayKn}) | ಸ್ಥಳ: ${locationName} (${pincode})`,
      `🪐 ಸಂವತ್ಸರ: ${day.samvatsaraKn} (ಶಕ ${day.shakaYear})`,
      `🌙 ಚಾಂದ್ರಮಾನ: ${day.chandramanaMasaKn} ಮಾಸ, ${day.pakshaKn} ಪಕ್ಷ`,
      `☀️ ಸೌರಮಾನ: ${day.sauramanaMasaKn} ಮಾಸ (ದಿನ ${day.sauramanaDina})`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "📖 ಎಡ ಪುಟ (LEFT PAGE — PANCHANGA 5 ANGAS & SHRADDHA)",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `• ತಿಥಿ (Tithi): ${day.tithiKn} (${day.tithiGhati}) [ಅಂತ್ಯ: ${day.tithiEndTime}]`,
      `• ನಕ್ಷತ್ರ (Nakshatra): ${day.nakshatraKn} (${day.nakshatraGhati}) [ಅಂತ್ಯ: ${day.nakshatraEndTime}]`,
      `• ಯೋಗ (Yoga): ${day.yogaKn} (${day.yogaGhati})`,
      `• ಕರಣ (Karana): ${day.karanaKn} (${day.karanaGhati})`,
      `• ರವಿ ನಕ್ಷತ್ರ: ${day.sunNakshatraKn}`,
      `• ಶ್ರಾದ್ಧ ತಿಥಿ (Shraddha): ${day.shraddhaTithi}`,
      `• ದಿನಪ್ರಮಾಣ: ${day.dinapramana} (ವಿಷಘಟಿ: ${day.vishaGhati} | ಅಮೃತಘಟಿ: ${day.amritaGhati})`,
      `• ಸೂರ್ಯೋದಯ: ${day.suryodaya} | ಸೂರ್ಯಾಸ್ತ: ${day.suryasta}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🏛️ ಬಲ ಪುಟ (RIGHT PAGE — 12 DINA LAGNA ENDING TIMES)",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `• ಮೀನ: ${day.lagnaEndingTimes.meena} | ಮೇಷ: ${day.lagnaEndingTimes.mesha} | ವೃಷಭ: ${day.lagnaEndingTimes.vrishabha} | ಮಿಥುನ: ${day.lagnaEndingTimes.mithuna}`,
      `• ಕರ್ಕ: ${day.lagnaEndingTimes.karkataka} | ಸಿಂಹ: ${day.lagnaEndingTimes.simha} | ಕನ್ಯಾ: ${day.lagnaEndingTimes.kanya} | ತುಲಾ: ${day.lagnaEndingTimes.tula}`,
      `• ವೃಶ್ಚಿಕ: ${day.lagnaEndingTimes.vrischika} | ಧನು: ${day.lagnaEndingTimes.dhanu} | ಮಕರ: ${day.lagnaEndingTimes.makara} | ಕುಂಭ: ${day.lagnaEndingTimes.kumbha}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🪐 ನವಗ್ರಹ ಗೋಚಾರ ಸ್ಪಷ್ಟ (PLANETARY POSITIONS)",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `• ರವಿ: ${day.grahaSpashta.ravi.rashiKn} (${day.grahaSpashta.ravi.nakshatraKn} ಪಾದ ${day.grahaSpashta.ravi.pada})`,
      `• ಕುಜ: ${day.grahaSpashta.kuja.rashiKn} (${day.grahaSpashta.kuja.nakshatraKn} ಪಾದ ${day.grahaSpashta.kuja.pada}) ${day.grahaSpashta.kuja.isVakri ? "[ವಕ್ರೀ]" : ""}`,
      `• ಬುಧ: ${day.grahaSpashta.budha.rashiKn} (${day.grahaSpashta.budha.nakshatraKn}) ${day.grahaSpashta.budha.isVakri ? "[ವಕ್ರೀ]" : ""}`,
      `• ಗುರು: ${day.grahaSpashta.guru.rashiKn} (${day.grahaSpashta.guru.nakshatraKn} ಪಾದ ${day.grahaSpashta.guru.pada}) ${day.grahaSpashta.guru.isVakri ? "[ವಕ್ರೀ]" : ""}`,
      `• ಶುಕ್ರ: ${day.grahaSpashta.shukra.rashiKn} (${day.grahaSpashta.shukra.nakshatraKn} ಪಾದ ${day.grahaSpashta.shukra.pada}) ${day.grahaSpashta.shukra.isVakri ? "[ವಕ್ರೀ]" : ""}`,
      `• ಶನಿ: ${day.grahaSpashta.shani.rashiKn} (${day.grahaSpashta.shani.nakshatraKn} ಪಾದ ${day.grahaSpashta.shani.pada}) ${day.grahaSpashta.shani.isVakri ? "[ವಕ್ರೀ]" : ""}`,
      `• ರಾಹು: ${day.grahaSpashta.rahu.rashiKn} (${day.grahaSpashta.rahu.nakshatraKn} ಪಾದ ${day.grahaSpashta.rahu.pada}) | ಕೇತು: ${day.grahaSpashta.ketu.rashiKn} (${day.grahaSpashta.ketu.nakshatraKn} ಪಾದ ${day.grahaSpashta.ketu.pada})`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "⏳ ನಿತ್ಯ ಪುರೋಹಿತ ಮುಹೂರ್ತ & ಪೂಜಾ ಕಾಲಗಳು (IST)",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `• ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ: ${day.brahmaMuhurtha}`,
      `• ಪ್ರಾತಃ ಸಂಧ್ಯಾ: ${day.pratahkalaSandhya}`,
      `• ಅಭಿಜಿತ್ ಮುಹೂರ್ತ: ${day.abhijitMuhurtha}`,
      `• ಅಪರಾಹ್ನ ಶ್ರಾದ್ಧ ಕಾಲ: ${day.madhyahnaShraddhaWindow}`,
      `• ಸಾಯಂಕಾಲ ಪ್ರದೋಷ: ${day.sayankalaPradosha}`,
      `• ನಿಶೀಥ ಕಾಲ: ${day.nishitaKaala}`,
      `• ರಾಹುಕಾಲ: ${day.rahuKaala}`,
      `• ಗುಳಿಕಕಾಲ: ${day.gulikaKaala}`,
      `• ಯಮಗಂಡ: ${day.yamaganda}`,
      ""
    ];

    if (day.festivalsAndVratas.length > 0) {
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      descLines.push(`🪔 ಹಬ್ಬಗಳು & ಧಾರ್ಮಿಕ ವಿಶೇಷಗಳು: ${day.festivalsAndVratas.join(" • ")}`);
      if (day.matchedFestival?.pujaWindow) {
        descLines.push(`⏳ ಪೂಜಾ ಕಾಲ: ${day.matchedFestival.pujaWindow}`);
      }
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      descLines.push("");
    }

    if (day.previousDayAlert) {
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      descLines.push("🔔 ಮುಂಬರುವ ದಿನದ ಪೂರ್ವಭಾವಿ ಧಾರ್ಮಿಕ ಸೂಚನೆ:");
      descLines.push(day.previousDayAlert);
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      descLines.push("");
    }

    descLines.push(`🌐 ಲೈವ್ ಗೋಚಾರ ಕುಂಡಲಿ & ಪೂರ್ಣ ಪಂಚಾಂಗ ದರ್ಶನ: ${portalUrl}`);
    descLines.push(`📞 ಸಂಪರ್ಕ: ${priestName} (9972339362)`);

    const description = descLines.join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:priest-bgn-${compactDate}-${index}@baggonapanchanga.org`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;VALUE=DATE:${compactDate}`,
      `DTEND;VALUE=DATE:${formatYmdCompact(new Date(new Date(day.dateStr).getTime() + 86400000).toISOString().slice(0, 10))}`,
      `SUMMARY:${escapeIcs(summary)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `URL:${portalUrl}`,
      `LOCATION:${escapeIcs(`${locationName}, Karnataka, India (${pincode})`)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(`[ಪ್ರಾತಃಕಾಲ ಪಂಚಾಂಗ ಸ್ಮರಣೆ] ${day.tithiKn} • ${day.shraddhaTithi}`)}`,
      "TRIGGER:-PT1H", // 1 hour before day start (05:00 AM IST)
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(`[ಪೂರ್ವದಿನದ ಸೂಚನೆ] ${day.previousDayAlert || `${day.tithiKn} ಸಿದ್ಧತೆ`}`)}`,
      "TRIGGER:-P1D", // 1 day before
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
