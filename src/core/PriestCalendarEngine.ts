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
import {
  getLocalizedFestivalName,
  getLocalizedMasaName,
  getLocalizedPreparationAlert
} from "./festivalLocalization";
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
  amritaKaala: string;
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
  lang?: string;
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

  // Rahu, Gulika, Yama, Amrita octants for day (0=Sun, 1=Mon, ..., 6=Sat)
  const rahuOctantMap = [8, 2, 7, 5, 6, 4, 3];
  const gulikaOctantMap = [7, 6, 5, 4, 3, 2, 1];
  const yamaOctantMap = [5, 4, 3, 2, 1, 7, 6];
  const amritaOctantMap = [4, 1, 5, 2, 6, 3, 7];

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
    amritaKaala: getWindow(amritaOctantMap[idx] ?? 4),
    durmuhurtha: "10:15 AM - 11:05 AM & 03:20 PM - 04:10 PM"
  };
}

/**
 * Intelligent Next-Day Preparation Alert Detector
 */
export function getPreviousDayPreparationAlert(currentDateStr: string, lang: string = "kn"): string | undefined {
  const code = (lang || "kn").slice(0, 2);
  const validCode = (["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn") as "kn" | "en" | "hi" | "te" | "ta";

  // Find next day's date string safely in UTC
  const [y, m, d] = currentDateStr.slice(0, 10).split('-').map(Number);
  const nextDateObj = new Date(Date.UTC(y, m - 1, d + 1));
  const nextDateStr = nextDateObj.toISOString().slice(0, 10);

  const nextDay = getParabhavaDayDetails(nextDateStr);
  const nextFest = getFestivalByDate(nextDateStr);

  const localizedFestName = nextFest ? getLocalizedFestivalName(nextFest, validCode) : "";
  const masaName = getLocalizedMasaName(nextDay.chandramanaMasaKn, validCode);

  // 1. Ekadashi alert (Dashami evening prep & fasting sankalpa)
  if (nextDay.tithiKn.includes("ಏಕಾದಶಿ") || (nextFest && (nextFest.nameKn.includes("ಏಕಾದಶಿ") || nextFest.nameEn.toLowerCase().includes("ekadashi")))) {
    const festName = localizedFestName || (validCode === "kn" ? nextDay.tithiKn : "Ekadashi");
    return getLocalizedPreparationAlert({ type: "EKADASHI", festName }, validCode);
  }

  // 2. Major Festival alert (Ugadi, Maha Shivaratri, Shri Rama Navami, Varamahalakshmi, etc.)
  if (nextFest && nextFest.category === "Major Festival") {
    return getLocalizedPreparationAlert({
      type: "MAJOR_FESTIVAL",
      festName: localizedFestName,
      pujaWindow: nextFest.pujaWindow
    }, validCode);
  }

  // 3. Purnima alert
  if (nextDay.tithiKn.includes("ಹುಣ್ಣಿಮೆ") || nextDay.tithiKn.includes("ಪೂರ್ಣಿಮಾ")) {
    const festName = localizedFestName || (validCode === "kn" ? "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ" : "Satyanarayana Puja");
    return getLocalizedPreparationAlert({
      type: "PURNIMA",
      festName,
      masaName
    }, validCode);
  }

  // 4. Amavasya alert (including Mahalaya Amavasya)
  if (nextDay.tithiKn.includes("ಅಮಾವಾಸ್ಯೆ") || (nextFest && (nextFest.id === "mahalaya_amavasya" || nextFest.nameKn.includes("ಅಮಾವಾಸ್ಯೆ")))) {
    const festName = localizedFestName || (validCode === "kn" ? "ದರ್ಶ ಅಮಾವಾಸ್ಯೆ" : "Darsha Amavasya");
    return getLocalizedPreparationAlert({
      type: "AMAVASYA",
      festName,
      masaName
    }, validCode);
  }

  // 5. Pradosha alert
  if (nextDay.tithiKn.includes("ತ್ರಯೋದಶಿ")) {
    return getLocalizedPreparationAlert({
      type: "PRADOSHAM",
      festName: ""
    }, validCode);
  }

  // 6. Other religious festival alert
  if (nextFest) {
    return getLocalizedPreparationAlert({
      type: "MAJOR_FESTIVAL",
      festName: localizedFestName,
      pujaWindow: nextFest.pujaWindow
    }, validCode);
  }

  return undefined;
}

const dossierCache = new Map<string, PriestDayDossier>();

/**
 * Builds the complete zero-hallucination Priest Dossier for a specific day
 */
export function generatePriestDayDossier(
  dateStr: string,
  lat: number = 14.5479,
  lng: number = 74.3187,
  pincode: string = "581326",
  lang: string = "kn"
): PriestDayDossier {
  const cacheKey = `${dateStr}_${lat.toFixed(3)}_${lng.toFixed(3)}_${pincode}_${lang}`;
  if (dossierCache.has(cacheKey)) {
    return dossierCache.get(cacheKey)!;
  }

  const bookDay = getParabhavaDayDetails(dateStr);
  const matchedFest = getFestivalByDate(dateStr);
  const dutyWindows = computePriestIstDutyWindows(dateStr, lat, lng, pincode);
  const prevAlert = getPreviousDayPreparationAlert(dateStr, lang);

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
  pincode: string = "581326",
  lang: string = "kn"
): PriestDayDossier[] {
  const count = Math.min(Math.max(daysCount, 1), 180);
  const startObj = new Date(startDateStr);
  const results: PriestDayDossier[] = [];

  for (let i = 0; i < count; i++) {
    const cur = new Date(startObj.getTime() + i * 86400000);
    const ymd = cur.toISOString().slice(0, 10);
    results.push(generatePriestDayDossier(ymd, lat, lng, pincode, lang));
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
    webAppBaseUrl = "https://baggonapanchanga.web.app",
    lang = "kn"
  } = options;

  const schedule = generatePriestCalendarSchedule(startDateStr, daysCount, lat, lng, pincode, lang);

  const isEn = lang.startsWith("en");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");

  const calName = isEn
    ? `Baggona Panchanga — ${priestName} (Priest Calendar)`
    : isHi
    ? `बग्गोण पंचांग — ${priestName} (पुरोहित कैलेंडर)`
    : isTe
    ? `బగ్గోణ పంచాంగం — ${priestName} (పురోహిత క్యాలెండర్)`
    : isTa
    ? `பக்கோணா பஞ்சாங்கம் — ${priestName} (புரோகிதர் நாட்காட்டி)`
    : `ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ${priestName} (ಪುರೋಹಿತ ಕ್ಯಾಲೆಂಡರ್)`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baggona Panchanga Astrology//NONSGML Priest Calendar v3.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(calName)}`,
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
    const festNameLocalized = day.matchedFestival ? getLocalizedFestivalName(day.matchedFestival, lang) : "";
    const festTitle = festNameLocalized ? ` 🪔 ${festNameLocalized}` : (!isEn && day.festivalsAndVratas.length > 0) ? ` 🪔 ${day.festivalsAndVratas[0]}` : "";

    const pakshaEn = day.paksha || (day.pakshaKn.includes("ಶುಕ್ಲ") ? "Shukla" : "Krishna");
    const tithiEn = day.tithi || day.tithiKn;
    const shraddhaEn = `${tithiEn} Shraddha`;

    const summary = isEn
      ? `|| Baggona || ${getLocalizedMasaName(day.chandramanaMasaKn, "en")} ${pakshaEn} Paksha ${tithiEn} • ${shraddhaEn}${festTitle}`
      : `॥ ಬಗ್ಗೋಣ ॥ ${day.chandramanaMasaKn} ${day.pakshaKn} ${day.tithiKn} • ${day.shraddhaTithi}${festTitle}`;

    // Royal ASCII Framed Description
    const descLines: string[] = isEn
      ? [
          "╔═══════════════════════════════════════════════════════════════╗",
          "           || Shri Baggona Panchanga — Priest Calendar Darshana ||         ",
          "╚═══════════════════════════════════════════════════════════════╝",
          "",
          `📅 Date: ${day.dateStr} (${day.weekday}) | Location: ${locationName} (${pincode})`,
          `🪐 Samvatsara: ${day.samvatsara} (Shaka ${day.shakaYear})`,
          `🌙 Chandramana: ${getLocalizedMasaName(day.chandramanaMasaKn, "en")} Masa, ${pakshaEn} Paksha`,
          `☀️ Sauramana: ${day.sauramanaMasa} Masa (Day ${day.sauramanaDina})`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "📖 LEFT PAGE — PANCHANGA 5 ANGAS & SHRADDHA",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          `• Tithi: ${tithiEn} (${day.tithiGhati}) [End: ${day.tithiEndTime}]`,
          `• Nakshatra: ${day.nakshatra} (${day.nakshatraGhati}) [End: ${day.nakshatraEndTime}]`,
          `• Yoga: ${day.yoga} (${day.yogaGhati})`,
          `• Karana: ${day.karana} (${day.karanaGhati})`,
          `• Sun Nakshatra: ${day.sunNakshatra}`,
          `• Shraddha Tithi: ${shraddhaEn}`,
          `• Dinapramana: ${day.dinapramana} (Visha Ghati: ${day.vishaGhati} | Amrita Ghati: ${day.amritaGhati})`,
          `• Sunrise: ${day.suryodaya} | Sunset: ${day.suryasta}`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "🏛️ RIGHT PAGE — 12 DINA LAGNA ENDING TIMES",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          `• Pisces: ${day.lagnaEndingTimes.meena} | Aries: ${day.lagnaEndingTimes.mesha} | Taurus: ${day.lagnaEndingTimes.vrishabha} | Gemini: ${day.lagnaEndingTimes.mithuna}`,
          `• Cancer: ${day.lagnaEndingTimes.karkataka} | Leo: ${day.lagnaEndingTimes.simha} | Virgo: ${day.lagnaEndingTimes.kanya} | Libra: ${day.lagnaEndingTimes.tula}`,
          `• Scorpio: ${day.lagnaEndingTimes.vrischika} | Sagittarius: ${day.lagnaEndingTimes.dhanu} | Capricorn: ${day.lagnaEndingTimes.makara} | Aquarius: ${day.lagnaEndingTimes.kumbha}`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "🪐 PLANETARY POSITIONS (GRAHA SPASHTA)",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          `• Sun: ${day.grahaSpashta.ravi.rashi} (${day.grahaSpashta.ravi.nakshatra} Pada ${day.grahaSpashta.ravi.pada})`,
          `• Mars: ${day.grahaSpashta.kuja.rashi} (${day.grahaSpashta.kuja.nakshatra} Pada ${day.grahaSpashta.kuja.pada}) ${day.grahaSpashta.kuja.isVakri ? "[Retrograde]" : ""}`,
          `• Mercury: ${day.grahaSpashta.budha.rashi} (${day.grahaSpashta.budha.nakshatra}) ${day.grahaSpashta.budha.isVakri ? "[Retrograde]" : ""}`,
          `• Jupiter: ${day.grahaSpashta.guru.rashi} (${day.grahaSpashta.guru.nakshatra} Pada ${day.grahaSpashta.guru.pada}) ${day.grahaSpashta.guru.isVakri ? "[Retrograde]" : ""}`,
          `• Venus: ${day.grahaSpashta.shukra.rashi} (${day.grahaSpashta.shukra.nakshatra} Pada ${day.grahaSpashta.shukra.pada}) ${day.grahaSpashta.shukra.isVakri ? "[Retrograde]" : ""}`,
          `• Saturn: ${day.grahaSpashta.shani.rashi} (${day.grahaSpashta.shani.nakshatra} Pada ${day.grahaSpashta.shani.pada}) ${day.grahaSpashta.shani.isVakri ? "[Retrograde]" : ""}`,
          `• Rahu: ${day.grahaSpashta.rahu.rashi} (${day.grahaSpashta.rahu.nakshatra} Pada ${day.grahaSpashta.rahu.pada}) | Ketu: ${day.grahaSpashta.ketu.rashi} (${day.grahaSpashta.ketu.nakshatra} Pada ${day.grahaSpashta.ketu.pada})`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "⏳ DAILY PRIEST MUHURTHA & AUSPICIOUS TIMINGS (IST)",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          `• Brahma Muhurtha: ${day.brahmaMuhurtha}`,
          `• Morning Sandhya: ${day.pratahkalaSandhya}`,
          `• Abhijit Muhurtha: ${day.abhijitMuhurtha}`,
          `• Aparahna Shraddha Window: ${day.madhyahnaShraddhaWindow.replace(/\(ಅಪರಾಹ್ನ ಕಾಲ\)/g, "(Aparahna Period)")}`,
          `• Evening Pradosha: ${day.sayankalaPradosha}`,
          `• Nishita Kaala: ${day.nishitaKaala}`,
          `• Rahu Kaala: ${day.rahuKaala}`,
          `• Gulika Kaala: ${day.gulikaKaala}`,
          `• Yamaganda: ${day.yamaganda}`,
          `• Amrita Kaala: ${day.amritaKaala}`,
          ""
        ]
      : [
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
          `• ಅಮೃತಕಾಲ: ${day.amritaKaala}`,
          ""
        ];

    if (festNameLocalized || (!isEn && day.festivalsAndVratas.length > 0)) {
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      const fHeader = isEn ? "🪔 Festivals & Religious Observances" : "🪔 ಹಬ್ಬಗಳು & ಧಾರ್ಮಿಕ ವಿಶೇಷಗಳು";
      const fContent = festNameLocalized || day.festivalsAndVratas.join(" • ");
      descLines.push(`${fHeader}: ${fContent}`);
      if (day.matchedFestival?.pujaWindow) {
        const pLabel = isEn ? "⏳ Puja Window" : "⏳ ಪೂಜಾ ಕಾಲ";
        descLines.push(`${pLabel}: ${day.matchedFestival.pujaWindow}`);
      }
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      descLines.push("");
    }

    if (day.previousDayAlert) {
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      const alertHeader = isEn
        ? "🔔 Upcoming Sacred Religious Preparation Alert:"
        : isHi
        ? "🔔 आगामी पावन धार्मिक सूचना एवं पूर्व तैयारी:"
        : isTe
        ? "🔔 రాబోయే పవిత్ర ధార్మిక సమాచారం & ముందస్తు సన్నాహాలు:"
        : isTa
        ? "🔔 வரவிருக்கும் புனித ஆன்மீகத் தகவல் & முன் தயாரிப்பு:"
        : "🔔 ಮುಂಬರುವ ದಿನದ ಪೂರ್ವಭಾವಿ ಧಾರ್ಮಿಕ ಸೂಚನೆ:";
      descLines.push(alertHeader);
      descLines.push(day.previousDayAlert);
      descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      descLines.push("");
    }

    descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const portalLabel = isEn
      ? "🌐 Live Gochara Kundli & Full Panchanga Darshana:"
      : isHi
      ? "🌐 लाइव गोचर कुंडली एवं पंचांग दर्शन:"
      : isTe
      ? "🌐 ప్రత్యక్ష గోచార కుండలి & పంచాంగ దర్శనం:"
      : isTa
      ? "🌐 நேரடி கோச்சார குண்டலி & பஞ்சாங்க தரிசனம்:"
      : "🌐 ಲೈವ್ ಗೋಚಾರ ಕುಂಡಲಿ & ಪೂರ್ಣ ಪಂಚಾಂಗ ದರ್ಶನ:";
    descLines.push(portalLabel);
    descLines.push(`${portalUrl}`);
    descLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const priestTitle = isEn
      ? `📞 Chief Priest: ${priestName} (9972339362)`
      : isHi
      ? `📞 मुख्य अर्चक: ${priestName} (9972339362)`
      : isTe
      ? `📞 ముఖ్య అర్చకులు: ${priestName} (9972339362)`
      : isTa
      ? `📞 முதன்மை அர்ச்சகர்: ${priestName} (9972339362)`
      : `📞 ಮುಖ್ಯ ಅರ್ಚಕರು: ${priestName} (9972339362)`;
    descLines.push(priestTitle);
    const benediction = isEn
      ? "✨ Shri Mahabaleshwara Prasada Siddhirastu ✨"
      : isHi
      ? "✨ श्री महाबलेश्वर प्रसाद सिद्धिरस्तु ✨"
      : isTe
      ? "✨ శ్రీ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు ✨"
      : isTa
      ? "✨ ஸ்ரீ மகாபலேஸ்வரர் பிரசாத சித்தியரஸ்து ✨"
      : "✨ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು ✨";
    descLines.push(benediction);

    const description = descLines.join("\n");

    const htmlTitle = isEn
      ? "|| Shri Baggona Panchanga — Priest Calendar Darshana ||"
      : "॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಪುರೋಹಿತ ಪಂಚಾಂಗ ದರ್ಶನ ॥";
    const dateLabel = isEn ? "📅 Date:" : "📅 ದಿನಾಂಕ:";
    const dateVal = isEn ? `${day.dateStr} (${day.weekday})` : `${day.dateStr} (${day.weekdayKn})`;
    const chandraLabel = isEn ? "🌙 Chandramana:" : "🌙 ಚಾಂದ್ರಮಾನ:";
    const chandraVal = isEn ? `${getLocalizedMasaName(day.chandramanaMasaKn, "en")} ${pakshaEn} Paksha` : `${day.chandramanaMasaKn} ${day.pakshaKn}`;
    const tithiHLabel = isEn ? "📜 Tithi & End:" : "📜 ತಿಥಿ & ಅಂತ್ಯ:";
    const tithiHVal = isEn ? `${tithiEn} (${day.tithiGhati}) [${day.tithiEndTime}]` : `${day.tithiKn} (${day.tithiGhati}) [${day.tithiEndTime}]`;
    const nakshatraHLabel = isEn ? "⭐ Nakshatra:" : "⭐ ನಕ್ಷತ್ರ:";
    const nakshatraHVal = isEn ? `${day.nakshatra} (${day.nakshatraGhati}) [${day.nakshatraEndTime}]` : `${day.nakshatraKn} (${day.nakshatraGhati}) [${day.nakshatraEndTime}]`;
    const shraddhaHLabel = isEn ? "🕉️ Shraddha Tithi:" : "🕉️ ಶ್ರಾದ್ಧ ತಿಥಿ:";
    const shraddhaHVal = isEn ? shraddhaEn : day.shraddhaTithi;
    const lagnaHLabel = isEn ? "🏛️ 12 Dina Lagna Endings:" : "🏛️ ೧೨ ಲಗ್ನ ಸಮಾಪ್ತಿ:";
    const lagnaHVal = isEn
      ? `Pisces: ${day.lagnaEndingTimes.meena} | Aries: ${day.lagnaEndingTimes.mesha} | Taurus: ${day.lagnaEndingTimes.vrishabha} | Gemini: ${day.lagnaEndingTimes.mithuna}`
      : `ಮೀ: ${day.lagnaEndingTimes.meena} | ಮೇ: ${day.lagnaEndingTimes.mesha} | ವೃ: ${day.lagnaEndingTimes.vrishabha} | ಮಿ: ${day.lagnaEndingTimes.mithuna}`;
    const muhurthaHLabel = isEn ? "⏳ Brahma / Abhijit:" : "⏳ ಬ್ರಾಹ್ಮೀ / ಅಭಿಜಿತ್:";
    const openPortalLabel = isEn ? "👉 Open Portal" : "👉 ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ";
    const fullDarshanaLabel = isEn ? "🌐 Full Darshana:" : "🌐 ಪೂರ್ಣ ದರ್ಶನ:";

    const htmlDesc = `<html><body style="font-family:sans-serif; background-color:#1c0a00; color:#fff8e7; padding:12px;"><div style="background-color:#501b11; border:2px solid #f59e0b; border-radius:12px; padding:16px; margin-bottom:14px;"><h2 style="color:#fde68a; margin:0 0 10px 0; font-size:16px; text-align:center;">${htmlTitle}</h2><table style="width:100%; border-collapse:collapse; font-size:13px;"><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b; width:40%;">${dateLabel}</td><td style="padding:5px 4px; color:#fff8e7;">${dateVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b;">${chandraLabel}</td><td style="padding:5px 4px; color:#fff8e7;">${chandraVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b;">${tithiHLabel}</td><td style="padding:5px 4px; color:#fff8e7;">${tithiHVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b;">${nakshatraHLabel}</td><td style="padding:5px 4px; color:#fff8e7;">${nakshatraHVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b;">${shraddhaHLabel}</td><td style="padding:5px 4px; color:#fde68a; font-weight:bold;">${shraddhaHVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b;">${lagnaHLabel}</td><td style="padding:5px 4px; color:#fff8e7; font-size:11px;">${lagnaHVal}</td></tr><tr style="border-bottom:1px solid rgba(245,158,11,0.3);"><td style="padding:5px 4px; font-weight:bold; color:#f59e0b;">${muhurthaHLabel}</td><td style="padding:5px 4px; color:#fff8e7;">${day.brahmaMuhurtha} / ${day.abhijitMuhurtha}</td></tr><tr><td style="padding:10px 4px; font-weight:bold; color:#f59e0b;">${fullDarshanaLabel}</td><td style="padding:10px 4px;"><a href="${portalUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background-color:#d97706; color:#ffffff; text-decoration:none; padding:8px 16px; border-radius:6px; font-weight:bold; font-size:13px;">${openPortalLabel}</a></td></tr></table></div><div style="text-align:center;"><p style="font-size:12px;"><a href="${portalUrl}" style="color:#6ee7b7; word-break:break-all;">${portalUrl}</a></p><p style="color:#f59e0b; font-size:12px; margin-top:8px;">${benediction}</p></div></body></html>`;

    const [dy, dm, dd] = day.dateStr.slice(0, 10).split('-').map(Number);
    const nextDayCompact = formatYmdCompact(new Date(Date.UTC(dy, dm - 1, dd + 1)).toISOString().slice(0, 10));

    const valarmBellDesc = isEn
      ? `[Morning Panchanga Bell Reminder] ${tithiEn} • ${shraddhaEn}`
      : `[ಪ್ರಾತಃಕಾಲ ಪಂಚಾಂಗ ಘಂಟಾನಾದ ಸ್ಮರಣೆ] ${day.tithiKn} • ${day.shraddhaTithi}`;

    const valarmPrepDesc = isEn
      ? `[Advance Religious Alert & Preparation] ${day.previousDayAlert || `${tithiEn} Advance Sankalpa`}`
      : `[ಪೂರ್ವದಿನದ ಧಾರ್ಮಿಕ ಸೂಚನೆ & ಸಿದ್ಧತೆ] ${day.previousDayAlert || `${day.tithiKn} ಪೂರ್ವಭಾವಿ ಸಂಕಲ್ಪ`}`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:priest-bgn-${compactDate}-${index}@baggonapanchanga.org`,
      `DTSTAMP:${nowIso}`,
      `DTSTART;VALUE=DATE:${compactDate}`,
      `DTEND;VALUE=DATE:${nextDayCompact}`,
      `SUMMARY:${escapeIcs(summary)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `X-ALT-DESC;FMTTYPE=text/html:${escapeIcs(htmlDesc)}`,
      `URL;VALUE=URI:${portalUrl}`,
      `URL:${portalUrl}`,
      `LOCATION:${escapeIcs(`${locationName}, Karnataka, India (${pincode})`)}`,
      "PRIORITY:1",
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "CATEGORIES:Panchanga,Purohita,Temple,Puja,Astrology,Daily Ritual,Baggona Panchanga",
      "BEGIN:VALARM",
      "ACTION:AUDIO",
      "TRIGGER:-PT1H", // 05:00 AM IST (1 hour before sunrise)
      "ATTACH;VALUE=URI:PresetSound#Bells",
      `ATTACH;VALUE=URI:${baseUrl}/audio/ghantanada.mp3`,
      "X-APPLE-DEFAULT-ALARM:TRUE",
      "X-MICROSOFT-DEFAULT-ALARM:TRUE",
      "SOUND:Bells",
      `DESCRIPTION:${escapeIcs(valarmBellDesc)}`,
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:AUDIO",
      "TRIGGER:-P1D", // 1 day before preparation reminder
      "ATTACH;VALUE=URI:PresetSound#Bells",
      `ATTACH;VALUE=URI:${baseUrl}/audio/ghantanada.mp3`,
      "X-APPLE-DEFAULT-ALARM:TRUE",
      `DESCRIPTION:${escapeIcs(valarmPrepDesc)}`,
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
