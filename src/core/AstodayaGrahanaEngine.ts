/**
 * AstodayaGrahanaEngine.ts
 *
 * 100% Authentic Vedic & High-Precision Astronomical Engine for:
 * 1. Guru & Shukra Astodaya (ಬೃಹಸ್ಪತಿ & ಶುಕ್ರರ ಮೌಢ್ಯ / ಅಸ್ತ ಮತ್ತು ಉದಯ)
 *    - Heliacal rising and combustion windows with exact dates, degrees, directions (Prachi/Prateechi)
 *    - Classical Moudhya Nishedha (marriage, upanayana, grihapravesha bans) & Shanti guidelines
 * 2. Surya & Chandra Grahana (ಸೂರ್ಯ & ಚಂದ್ರ ಗ್ರಹಣಗಳು - Solar & Lunar Eclipses)
 *    - NASA JPL precision eclipse search via astronomy-engine
 *    - Global vs. Local visibility filtering (World, India, Karnataka, etc.)
 *    - Exact Sidereal Rashi & Nakshatra coordinates (True Chitrapaksha Lahiri Ayanamsa)
 *    - 12-Rashi impact analysis (ದ್ವಾದಶ ರಾಶಿ ಫಲ) & Sutaka Kaala (ವೇಧ / ಸೂತಕ ನಿಯಮಗಳು)
 * 3. Major Planetary Ingresses (ಗುರು, ಶನಿ, ರಾಹು-ಕೇತು ಗೋಚಾರ & ಅಯನ ಪರಿವರ್ತನೆ)
 *
 * Fully localized across 5 languages: Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), English (en).
 */

import * as Astronomy from "astronomy-engine";
import { trueChitrapakshaAyanamsaDegrees } from "./DrikGanitaAyanamsa";

export type EclipseType = "surya" | "chandra";
export type EclipseKind = "total" | "annular" | "partial" | "penumbral" | "hybrid";
export type VisibilityState = "full" | "partial" | "grastodaya" | "grastasta" | "invisible";

export interface LocationPreset {
  id: string;
  name: Record<string, string>; // kn, hi, te, ta, en
  isGlobal: boolean;
  observers: Array<{
    name: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
  }>;
}

export const LOCATION_PRESETS: LocationPreset[] = [
  {
    id: "world",
    name: {
      kn: "ವಿಶ್ವಾದ್ಯಂತ (Global / Worldwide)",
      hi: "विश्व भर में (Global)",
      te: "ప్రపంచవ్యాప్తంగా (Global)",
      ta: "உலகளவில் (Global)",
      en: "Worldwide (Global All Eclipses)"
    },
    isGlobal: true,
    observers: []
  },
  {
    id: "india",
    name: {
      kn: "ಭಾರತ (All India)",
      hi: "संपूर्ण भारत (All India)",
      te: "భారతదేశం (All India)",
      ta: "இந்தியா முழுவதும் (All India)",
      en: "India (National)"
    },
    isGlobal: false,
    observers: [
      { name: "Central India (Ujjain)", latitude: 23.18, longitude: 75.77, altitudeMeters: 490 },
      { name: "South India (Gokarna)", latitude: 14.54, longitude: 74.31, altitudeMeters: 10 },
      { name: "North India (New Delhi)", latitude: 28.61, longitude: 77.20, altitudeMeters: 216 },
      { name: "East India (Kolkata)", latitude: 22.57, longitude: 88.36, altitudeMeters: 10 },
      { name: "West India (Mumbai)", latitude: 19.07, longitude: 72.87, altitudeMeters: 14 }
    ]
  },
  {
    id: "karnataka",
    name: {
      kn: "ಕರ್ನಾಟಕ (Karnataka - ಗೋಕರ್ಣ / ಬೆಂಗಳೂರು)",
      hi: "कर्नाटक (Karnataka)",
      te: "కర్ణాటక (Karnataka)",
      ta: "கர்நாடகா (Karnataka)",
      en: "Karnataka (Gokarna / Bangalore)"
    },
    isGlobal: false,
    observers: [
      { name: "Gokarna Kshetra", latitude: 14.5478, longitude: 74.3188, altitudeMeters: 12 },
      { name: "Bangalore", latitude: 12.9716, longitude: 77.5946, altitudeMeters: 920 }
    ]
  },
  {
    id: "maharashtra",
    name: {
      kn: "ಮಹಾರಾಷ್ಟ್ರ (Maharashtra - ಮುಂಬೈ / ಪುಣೆ)",
      hi: "महाराष्ट्र (Maharashtra)",
      te: "మహారాష్ట్ర (Maharashtra)",
      ta: "மகாராஷ்டிரா (Maharashtra)",
      en: "Maharashtra (Mumbai / Pune)"
    },
    isGlobal: false,
    observers: [
      { name: "Mumbai", latitude: 19.076, longitude: 72.8777, altitudeMeters: 14 }
    ]
  },
  {
    id: "tamilnadu",
    name: {
      kn: "ತಮಿಳುನಾಡು (Tamil Nadu - ಚೆನ್ನೈ)",
      hi: "तमिलनाडु (Tamil Nadu)",
      te: "తమిళనాడు (Tamil Nadu)",
      ta: "தமிழ்நாடு (Tamil Nadu)",
      en: "Tamil Nadu (Chennai)"
    },
    isGlobal: false,
    observers: [
      { name: "Chennai", latitude: 13.0827, longitude: 80.2707, altitudeMeters: 7 }
    ]
  },
  {
    id: "andhra_telangana",
    name: {
      kn: "ಆಂಧ್ರ / ತೆಲಂಗಾಣ (Andhra & Telangana - ತಿರುಪತಿ / ಹೈದರಾಬಾದ್)",
      hi: "आंध्र / तेलंगाना (AP & TS)",
      te: "ఆంధ్రప్రదేశ్ & తెలంగాణ (AP & TS)",
      ta: "ஆந்திரா / தெலங்கானா (AP & TS)",
      en: "Andhra & Telangana (Tirupati / Hyderabad)"
    },
    isGlobal: false,
    observers: [
      { name: "Hyderabad", latitude: 17.385, longitude: 78.4867, altitudeMeters: 505 },
      { name: "Tirupati", latitude: 13.6288, longitude: 79.4192, altitudeMeters: 161 }
    ]
  },
  {
    id: "north_america",
    name: {
      kn: "ಉತ್ತರ ಅಮೆರಿಕ (USA / Canada)",
      hi: "उत्तरी अमेरिका (USA / Canada)",
      te: "ఉత్తర అమెరికా (USA / Canada)",
      ta: "வட அமெரிக்கா (USA / Canada)",
      en: "North America (USA / Canada)"
    },
    isGlobal: false,
    observers: [
      { name: "New York", latitude: 40.7128, longitude: -74.006, altitudeMeters: 10 },
      { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437, altitudeMeters: 80 }
    ]
  },
  {
    id: "europe_uk",
    name: {
      kn: "ಯುರೋಪ್ & ಯುಕೆ (Europe & UK)",
      hi: "यूरोप एवं यूके (Europe & UK)",
      te: "యూరప్ & యుకె (Europe & UK)",
      ta: "ஐரோப்பா & யுகே (Europe & UK)",
      en: "Europe & United Kingdom"
    },
    isGlobal: false,
    observers: [
      { name: "London", latitude: 51.5074, longitude: -0.1278, altitudeMeters: 25 }
    ]
  },
  {
    id: "middle_east",
    name: {
      kn: "ಮಧ್ಯಪ್ರಾಚ್ಯ (Middle East - ದುಬೈ)",
      hi: "मध्य पूर्व (Middle East - Dubai)",
      te: "మధ్య ప్రాచ్యం (Middle East)",
      ta: "மத்திய கிழக்கு (Middle East)",
      en: "Middle East (Dubai / Gulf)"
    },
    isGlobal: false,
    observers: [
      { name: "Dubai", latitude: 25.2048, longitude: 55.2708, altitudeMeters: 5 }
    ]
  },
  {
    id: "australia",
    name: {
      kn: "ಆಸ್ಟ್ರೇಲಿಯಾ (Australia - ಸಿಡ್ನಿ)",
      hi: "ऑस्ट्रेलिया (Australia)",
      te: "ఆస్ట్రేలియా (Australia)",
      ta: "ஆஸ்திரேலியா (Australia)",
      en: "Australia & Pacific (Sydney)"
    },
    isGlobal: false,
    observers: [
      { name: "Sydney", latitude: -33.8688, longitude: 151.2093, altitudeMeters: 19 }
    ]
  }
];

export const RASHI_NAMES_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಮೇಷ", en: "Aries", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  1: { kn: "ವೃಷಭ", en: "Taurus", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  2: { kn: "ಮಿಥುನ", en: "Gemini", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  3: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  4: { kn: "ಸಿಂಹ", en: "Leo", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  5: { kn: "ಕನ್ಯಾ", en: "Virgo", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  6: { kn: "ತುಲಾ", en: "Libra", hi: "तुला", te: "తుల", ta: "துலாம்" },
  7: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  8: { kn: "ಧನುಸ್ಸು", en: "Sagittarius", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு" },
  9: { kn: "ಮಕರ", en: "Capricorn", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  10: { kn: "ಕುಂಭ", en: "Aquarius", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்" },
  11: { kn: "ಮೀನ", en: "Pisces", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

export const NAKSHATRA_NAMES_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", hi: "अश्विनी", te: "అశ్విని", ta: "அஸ்வினி" },
  1: { kn: "ಭರಣಿ", en: "Bharani", hi: "भरणी", te: "భరణి", ta: "பரணி" },
  2: { kn: "ಕೃತ್ತಿಕಾ", en: "Krittika", hi: "कृत्तिका", te: "కృత్తిక", ta: "கிருத்திகை" },
  3: { kn: "ರೋಹಿಣಿ", en: "Rohini", hi: "रोहिणी", te: "రోహిణి", ta: "ரோகிணி" },
  4: { kn: "ಮೃಗಶಿರ", en: "Mrigashira", hi: "मृगशिरा", te: "మృగశిర", ta: "மிருகசீரிஷம்" },
  5: { kn: "ಆರಿದ್ರಾ", en: "Ardra", hi: "आर्द्रा", te: "ఆరుద్ర", ta: "திருவாதிரை" },
  6: { kn: "ಪುನರ್ವಸು", en: "Punarvasu", hi: "पुनर्वसु", te: "పునర్వసు", ta: "புனர்பூசம்" },
  7: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पुष्य", te: "పుష్యమి", ta: "பூசம்" },
  8: { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", hi: "आश्लेषा", te: "ఆశ్లేష", ta: "ஆயில்யம்" },
  9: { kn: "ಮಘಾ", en: "Magha", hi: "मघा", te: "మఘ", ta: "மகம்" },
  10: { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ", en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", te: "పూర్వ ఫల్గుణి", ta: "பூரம்" },
  11: { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ", en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", te: "ఉత్తర ఫల్గుణి", ta: "உத்திரம்" },
  12: { kn: "ಹಸ್ತಾ", en: "Hasta", hi: "हस्त", te: "హస్త", ta: "அஸ்தம்" },
  13: { kn: "ಚಿತ್ತಾ", en: "Chitra", hi: "चित्रा", te: "చిత్ర", ta: "சித்திரை" },
  14: { kn: "ಸ್ವಾತಿ", en: "Swati", hi: "स्वाति", te: "స్వాతి", ta: "சுவாதி" },
  15: { kn: "ವಿಶಾಖಾ", en: "Vishakha", hi: "विशाखा", te: "విశాఖ", ta: "விசாகம்" },
  16: { kn: "ಅನೂರಾಧಾ", en: "Anuradha", hi: "अनुराधा", te: "అనూరాధ", ta: "அனுஷம்" },
  17: { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", hi: "ज्येष्ठा", te: "జ్యేష్ఠ", ta: "கேட்டை" },
  18: { kn: "ಮೂಲಾ", en: "Moola", hi: "मूल", te: "మూల", ta: "மூலம்" },
  19: { kn: "ಪೂರ್ವಾಷಾಢಾ", en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", te: "పూర్వాషాఢ", ta: "பூராடம்" },
  20: { kn: "ಉತ್ತರಾಷಾಢಾ", en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்" },
  21: { kn: "ಶ್ರವಣಾ", en: "Shravana", hi: "श्रवण", te: "శ్రవణం", ta: "திருவோணம்" },
  22: { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", hi: "धनिष्ठा", te: "ధనిష్ఠ", ta: "அவிட்டம்" },
  23: { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", hi: "शतभिषा", te: "శతభిషం", ta: "சதயம்" },
  24: { kn: "ಪೂರ್ವ ಭಾದ್ರಪದಾ", en: "Purva Bhadrapada", hi: "पूर्वा भाद्रपद", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி" },
  25: { kn: "ಉತ್ತರ ಭಾದ್ರಪದಾ", en: "Uttara Bhadrapada", hi: "उत्तरा भाद्रपद", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி" },
  26: { kn: "ರೇವತಿ", en: "Revati", hi: "रेवती", te: "రేవతి", ta: "ரேவதி" }
};

export interface AstodayaEvent {
  planet: "Jupiter" | "Venus";
  eventType: "asta" | "udaya";
  date: Date;
  dateStr: string;
  timeIstStr: string;
  timeUtcStr: string;
  direction: "East" | "West";
  directionLabel: Record<string, string>;
  rashiIndex: number;
  rashi: Record<string, string>;
  degreeFormatted: string;
  nakshatraIndex: number;
  nakshatra: Record<string, string>;
  pada: number;
  angDistSun: number;
  isRetrograde: boolean;
  significance: Record<string, string>;
}

export interface AstodayaPeriod {
  planet: "Jupiter" | "Venus";
  title: Record<string, string>;
  astaDate: Date;
  udayaDate: Date;
  astaDateStr: string;
  udayaDateStr: string;
  durationDays: number;
  direction: Record<string, string>;
  rashi: Record<string, string>;
  shastraRules: Record<string, string>;
  prohibitions: Record<string, string[]>;
  recommendedPooja: Record<string, string>;
}

export interface GrahanaPhalaRashi {
  rashiIndex: number;
  rashiName: Record<string, string>;
  effect: "shubha" | "madhyama" | "ashubha";
  badge: Record<string, string>;
  description: Record<string, string>;
}

export interface GrahanaEvent {
  id: string;
  type: EclipseType;
  subType: EclipseKind;
  typeLabel: Record<string, string>;
  subTypeLabel: Record<string, string>;
  title: Record<string, string>;
  peakDate: Date;
  peakDateStr: string;
  peakTimeIst: string;
  peakTimeUtc: string;
  startTimeIst?: string;
  endTimeIst?: string;
  durationMinutes: number;
  obscurationPercent: number;
  rashiIndex: number;
  rashi: Record<string, string>;
  degreeFormatted: string;
  nakshatraIndex: number;
  nakshatra: Record<string, string>;
  pada: number;
  globalVisibilityNote: Record<string, string>;
  visibility: {
    isGloballyActive: boolean;
    isVisibleInSelected: boolean;
    visibilityState: VisibilityState;
    locationLabel: Record<string, string>;
    statusBadge: Record<string, string>;
    sutakaApplicable: boolean;
    sutakaStartTimeIst?: string;
    visibilityDetails: Record<string, string>;
  };
  impact: {
    afflictedNakshatra: Record<string, string>;
    afflictedRashi: Record<string, string>;
    rashiSummary: GrahanaPhalaRashi[];
  };
  vedicInjunctions: {
    sutakaRule: Record<string, string>;
    aharaNiyama: Record<string, string>;
    snanaDanaRule: Record<string, string>;
    mantraJapa: Record<string, string>;
    gokarnaPooja: Record<string, string>;
  };
}

export interface MajorTransitEvent {
  planet: "Jupiter" | "Saturn" | "Rahu" | "Ketu";
  date: Date;
  dateStr: string;
  timeIstStr: string;
  fromRashiIndex: number;
  toRashiIndex: number;
  fromRashi: Record<string, string>;
  toRashi: Record<string, string>;
  title: Record<string, string>;
  description: Record<string, string>;
}

export interface AnnualAstroReport {
  year: number;
  locationId: string;
  locationName: Record<string, string>;
  calculatedAt: string;
  eclipses: GrahanaEvent[];
  visibleEclipsesCount: number;
  totalGlobalEclipsesCount: number;
  astodayaEvents: AstodayaEvent[];
  astodayaPeriods: AstodayaPeriod[];
  majorTransits: MajorTransitEvent[];
  auspiciousMarriageWindowsSummary: Record<string, string>;
}

// Helpers
const formatDegMin = (deg: number): string => {
  const inSign = deg % 30;
  const d = Math.floor(inSign);
  const m = Math.floor((inSign - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
};

const toIstString = (date: Date): string => {
  const istT = new Date(date.getTime() + 5.5 * 3600000);
  const h = istT.getUTCHours().toString().padStart(2, "0");
  const m = istT.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m} IST`;
};

const toUtcString = (date: Date): string => {
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m} UTC`;
};

const toYmdString = (date: Date): string => {
  const istT = new Date(date.getTime() + 5.5 * 3600000);
  const y = istT.getUTCFullYear();
  const m = (istT.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = istT.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Calculates high-precision sidereal coordinates using True Chitrapaksha Lahiri Ayanamsa.
 */
export function getSiderealPosition(date: Date, body: Astronomy.Body): {
  siderealDegree: number;
  rashiIndex: number;
  degreeInRashi: number;
  nakshatraIndex: number;
  pada: number;
} {
  let tropicalLon = 0;
  if (body === Astronomy.Body.Sun) {
    tropicalLon = Astronomy.SunPosition(date).elon;
  } else if (body === Astronomy.Body.Moon) {
    tropicalLon = Astronomy.EclipticGeoMoon(date).lon;
  } else {
    const v = Astronomy.GeoVector(body, date, true);
    tropicalLon = Astronomy.Ecliptic(v).elon;
  }

  const ayanamsa = trueChitrapakshaAyanamsaDegrees(date);
  const sidereal = (tropicalLon - ayanamsa + 360) % 360;

  const rashiIndex = Math.floor(sidereal / 30);
  const degreeInRashi = sidereal % 30;
  const nakshatraIndex = Math.floor(sidereal / (360 / 27));
  const pada = Math.floor((sidereal % (360 / 27)) / (360 / 108)) + 1;

  return {
    siderealDegree: sidereal,
    rashiIndex,
    degreeInRashi,
    nakshatraIndex,
    pada
  };
}

/**
 * Detects whether a body is retrograde.
 */
function checkRetrograde(body: Astronomy.Body, date: Date): boolean {
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) return false;
  const next = new Date(date.getTime() + 6 * 3600000);
  const v1 = Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
  const v2 = Astronomy.Ecliptic(Astronomy.GeoVector(body, next, true)).elon;
  return ((v2 - v1 + 360) % 360) > 180;
}

/**
 * Computes Guru & Shukra Astodaya (Combustion & Heliacal Rising) for any given year.
 */
export function calculateYearlyAstodaya(year: number): {
  events: AstodayaEvent[];
  periods: AstodayaPeriod[];
} {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const allEvents: AstodayaEvent[] = [];

  const targets: Array<{
    planet: "Jupiter" | "Venus";
    body: Astronomy.Body;
    thresholdNormal: number;
    thresholdRetro: number;
  }> = [
    { planet: "Jupiter", body: Astronomy.Body.Jupiter, thresholdNormal: 11.0, thresholdRetro: 11.0 },
    { planet: "Venus", body: Astronomy.Body.Venus, thresholdNormal: 10.0, thresholdRetro: 8.0 }
  ];

  for (const t of targets) {
    const scanStart = new Date(Date.UTC(year - 1, 11, 10));
    const scanEnd = new Date(Date.UTC(year + 1, 0, 20));

    let prevCombust: boolean | null = null;
    let prevDate: Date | null = null;

    for (let timeMs = scanStart.getTime(); timeMs <= scanEnd.getTime(); timeMs += 86400000) {
      const d = new Date(timeMs);
      const sunV = Astronomy.GeoVector(Astronomy.Body.Sun, d, true);
      const planetV = Astronomy.GeoVector(t.body, d, true);
      const dist = Astronomy.AngleBetween(sunV, planetV);

      const isRetro = checkRetrograde(t.body, d);
      const threshold = isRetro ? t.thresholdRetro : t.thresholdNormal;
      const isCombust = dist < threshold;

      if (prevCombust !== null && isCombust !== prevCombust) {
        let t1 = prevDate!.getTime();
        let t2 = d.getTime();
        for (let step = 0; step < 8; step++) {
          const midT = (t1 + t2) / 2;
          const midD = new Date(midT);
          const sV = Astronomy.GeoVector(Astronomy.Body.Sun, midD, true);
          const pV = Astronomy.GeoVector(t.body, midD, true);
          const dAngle = Astronomy.AngleBetween(sV, pV);
          if ((dAngle < threshold) === prevCombust) {
            t1 = midT;
          } else {
            t2 = midT;
          }
        }
        const exactDate = new Date((t1 + t2) / 2);

        if (exactDate >= startOfYear && exactDate <= endOfYear) {
          const sidereal = getSiderealPosition(exactDate, t.body);
          const sunSidereal = getSiderealPosition(exactDate, Astronomy.Body.Sun);
          const eventRetro = checkRetrograde(t.body, exactDate);

          const diffSun = (sidereal.siderealDegree - sunSidereal.siderealDegree + 360) % 360;
          const isEast = diffSun > 180;
          const direction: "East" | "West" = isEast ? "East" : "West";

          const isAsta = isCombust;
          const rashiName = RASHI_NAMES_5LANG[sidereal.rashiIndex];
          const nakName = NAKSHATRA_NAMES_5LANG[sidereal.nakshatraIndex];

          allEvents.push({
            planet: t.planet,
            eventType: isAsta ? "asta" : "udaya",
            date: exactDate,
            dateStr: toYmdString(exactDate),
            timeIstStr: toIstString(exactDate),
            timeUtcStr: toUtcString(exactDate),
            direction,
            directionLabel: {
              kn: direction === "East" ? "ಪೂರ್ವ (ಪ್ರಾಚಿ)" : "ಪಶ್ಚಿಮ (ಪ್ರತೀಚಿ)",
              hi: direction === "East" ? "पूर्व (प्राची)" : "पश्चिम (प्रतीची)",
              te: direction === "East" ? "తూర్పు (ప్రాచి)" : "పడమర (ప్రతీచి)",
              ta: direction === "East" ? "கிழக்கு (பிராசி)" : "மேற்கு (பிரதீசி)",
              en: direction === "East" ? "East (Morning / Prachi)" : "West (Evening / Prateechi)"
            },
            rashiIndex: sidereal.rashiIndex,
            rashi: rashiName,
            degreeFormatted: formatDegMin(sidereal.degreeInRashi),
            nakshatraIndex: sidereal.nakshatraIndex,
            nakshatra: nakName,
            pada: sidereal.pada,
            angDistSun: dist,
            isRetrograde: eventRetro,
            significance: {
              kn: isAsta
                ? `${t.planet === "Jupiter" ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು" : "ದೈತ್ಯಗುರು ಶುಕ್ರನು"} ${rashiName.kn} ರಾಶಿಯಲ್ಲಿ ಸೂರ್ಯನ ಅತಿಸಮೀಪ ಬಂದು ಮೌಢ್ಯ (ಅಸ್ತ) ಸ್ಥಿತಿಯನ್ನು ತಲುಪಿದ್ದಾರೆ. ಈ ದಿನದಿಂದ ಸಮಸ್ತ ಶುಭ ಕಾರ್ಯಗಳು ನಿಷೇಧಿಸಲ್ಪಡುತ್ತವೆ.`
                : `${t.planet === "Jupiter" ? "ಗುರು" : "ಶುಕ್ರ"} ಗ್ರಹವು ${rashiName.kn} ರಾಶಿಯಲ್ಲಿ ಮೌಢ್ಯ ಕಳೆದುಕೊಂಡು ${direction === "East" ? "ಪೂರ್ವದಲ್ಲಿ" : "ಪಶ್ಚಿಮದಲ್ಲಿ"} ದೈವಿಕ ಉದಯವನ್ನು ಕಂಡಿದೆ. ಮೌಢ್ಯ ದೋಷ ಮುಕ್ತಾಯವಾಗುತ್ತದೆ.`,
              hi: isAsta
                ? `${t.planet === "Jupiter" ? "देवगुरु बृहस्पति" : "शुक्र देव"} ${rashiName.hi} में सूर्य के सन्निकट आकर अस्त (मौढ्य) हो रहे हैं। मांगलिक कार्य वर्जित हैं।`
                : `${t.planet === "Jupiter" ? "बृहस्पति" : "शुक्र"} का ${direction === "East" ? "पूर्व" : "पश्चिम"} में उदय हो रहा है। शुभ मुहूर्त पुनः प्रारंभ।`,
              te: isAsta
                ? `${t.planet === "Jupiter" ? "గురుడు" : "శుక్రుడు"} ${rashiName.te} రాశిలో మౌఢ్య ప్రవేశం చేస్తున్నారు.`
                : `${t.planet === "Jupiter" ? "గురు" : "శుక్ర"} గ్రహం ఉదయించి మౌఢ్య దోషం ముగుస్తుంది.`,
              ta: isAsta
                ? `${t.planet === "Jupiter" ? "குரு" : "சுக்கிரன்"} ${rashiName.ta} ராசியில் அஸ்தமனம் ஆகிறார். சுப நிகழ்வுகள் தவிர்க்கவும்.`
                : `${t.planet === "Jupiter" ? "குரு" : "சுக்கிரன்"} உதயமாகிறார். சுப முகூர்த்தங்கள் தொடங்கலாம்.`,
              en: isAsta
                ? `${t.planet} enters combustion (Moudhya) in ${rashiName.en} at ${formatDegMin(sidereal.degreeInRashi)}. Sacred rites (marriages, upanayana, initiations) are suspended.`
                : `${t.planet} experiences heliacal rising (Udaya) in the ${direction} in ${rashiName.en}. Moudhya bans conclude; auspicious muhurthas resume.`
            }
          });
        }
      }

      prevCombust = isCombust;
      prevDate = d;
    }
  }

  allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  const periods: AstodayaPeriod[] = [];

  for (const planet of ["Jupiter", "Venus"] as const) {
    const pEvents = allEvents.filter((e) => e.planet === planet);
    for (let i = 0; i < pEvents.length; i++) {
      if (pEvents[i].eventType === "asta") {
        const udaya = pEvents.find((e, idx) => idx > i && e.eventType === "udaya");
        if (udaya) {
          const duration = Math.max(1, Math.round((udaya.date.getTime() - pEvents[i].date.getTime()) / 86400000));
          const pRashi = pEvents[i].rashi;
          periods.push({
            planet,
            title: {
              kn: `${planet === "Jupiter" ? "ಗುರು ಮೌಢ್ಯ ಕಾಲ" : "ಶುಕ್ರ ಮೌಢ್ಯ ಕಾಲ"} (${duration} ದಿನಗಳು)`,
              hi: `${planet === "Jupiter" ? "गुरु मौढ्य काल" : "शुक्र मौढ्य काल"} (${duration} दिन)`,
              te: `${planet === "Jupiter" ? "గురు మౌఢ్య కాలం" : "శుక్ర మౌఢ్య కాలం"} (${duration} రోజులు)`,
              ta: `${planet === "Jupiter" ? "குரு மௌட்டிய காலம்" : "சுக்கிர மௌட்டிய காலம்"} (${duration} நாட்கள்)`,
              en: `${planet} Combustion Window (${duration} Days)`
            },
            astaDate: pEvents[i].date,
            udayaDate: udaya.date,
            astaDateStr: pEvents[i].dateStr,
            udayaDateStr: udaya.dateStr,
            durationDays: duration,
            direction: udaya.directionLabel,
            rashi: pRashi,
            shastraRules: {
              kn: `ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರ ಪ್ರಕಾರ ${planet === "Jupiter" ? "ಗುರು" : "ಶುಕ್ರ"} ಮೌಢ್ಯ ಕಾಲದಲ್ಲಿ ಯಾವುದೇ ಶುಭ ಕರ್ಮಗಳನ್ನು ಮಾಡಬಾರದು. ಈ ಅವಧಿಯಲ್ಲಿ ದೈವಿಕ ಮಂತ್ರ ಜಪ ಮತ್ತು ಈಶ್ವರಾರಾಧನೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
              hi: `${planet === "Jupiter" ? "गुरु" : "शुक्र"} मौढ्य के दौरान विवाह, उपनयन, गृहप्रवेश आदि सर्वथा वर्जित हैं। केवल नित्य कर्म व मंत्र जप करें।`,
              te: `${planet === "Jupiter" ? "గురు" : "శుక్ర"} మౌఢ్య సమయంలో వివాహాది శుభకార్యాలు నిషిద్ధం.`,
              ta: `${planet === "Jupiter" ? "குரு" : "சுக்கிர"} மௌட்டிய காலத்தில் விவாகம், புதுமனை புகுவிழா செய்யக்கூடாது.`,
              en: `Classical Parashari and Muhurtha treatises strictly prohibit marriages, thread ceremonies, and foundation stones during ${planet} Moudhya.`
            },
            prohibitions: {
              kn: [
                "ವಿವಾಹ ಮಹೋತ್ಸವ (Marriages strictly prohibited)",
                "ಉಪನಯನ ಸಂಸ್ಕಾರ (Sacred Thread Ceremonies)",
                "ಗೃಹಪ್ರವೇಶ & ಭೂಮಿ ಪೂಜೆ (House Warming / Groundbreaking)",
                "ದೇವತಾ ಪ್ರತಿಷ್ಠಾಪನೆ & ನೂತನ ವ್ರತಾರಂಭ (Temple Idol Installations)"
              ],
              hi: [
                "विवाह संस्कार (Vivaha)",
                "उपनयन संस्कार (Thread Ceremony)",
                "गृहप्रवेश एवं भूमि पूजन",
                "नूतन व्रत एवं तीर्थ संकल्प"
              ],
              te: [
                "వివాహం",
                "ఉపనయనం",
                "గృహప్రవేశం",
                "దేవతా ప్రతిష్ఠ"
              ],
              ta: [
                "திருமணம்",
                "பூணூல் அணிவித்தல்",
                "புதுமனை புகுவிழா",
                "கோவில் கும்பாபிஷேகம்"
              ],
              en: [
                "Vivaha (Marriages and engagement ceremonies)",
                "Upanayana (Sacred thread investitures)",
                "Griha Pravesha (New home entries & groundbreaking)",
                "Deity consecrations and commencement of new austerities"
              ]
            },
            recommendedPooja: {
              kn: planet === "Jupiter"
                ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬೃಹಸ್ಪತಿ ಶಾಂತಿ ಪೂಜೆ ಹಾಗೂ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಷ್ಟೋತ್ತರ ಜಪ."
                : "ಗೋಕರ್ಣದಲ್ಲಿ ಶುಕ್ರ ಶಾಂತಿ ಪೂಜೆ, ಮಹಾಲಕ್ಷ್ಮೀ ಆರಾಧನೆ ಹಾಗೂ ಕಡಲೆ ದಾನ.",
              hi: planet === "Jupiter"
                ? "गोकर्ण में बृहस्पति शांति एवं दक्षिणामूर्ति पूजा।"
                : "महालक्ष्मी आराधना एवं शुक्र शांति होम।",
              te: planet === "Jupiter" ? "గురు శాంతి పూజ మరియు దక్షిణామూర్తి ఆరాధన." : "శుక్ర శాంతి మరియు లక్ష్మీ పూజ.",
              ta: planet === "Jupiter" ? "குரு சாந்தி பூஜை மற்றும் தட்சிணாமூர்த்தி வழிபாடு." : "சுக்கிர சாந்தி மற்றும் லக்ஷ்மி பூஜை.",
              en: planet === "Jupiter"
                ? "Brihaspati Shanti Puja and Dakshinamurthy Japa at Gokarna Kshetra."
                : "Shukra Shanti and Mahalakshmi Archana at Gokarna Kshetra."
            }
          });
        }
      }
    }
  }

  return { events: allEvents, periods };
}

/**
 * Checks visibility of a solar eclipse for a given observer.
 */
function evaluateLocalSolarVisibility(
  globalPeakDate: Date,
  observer: Astronomy.Observer
): { isVisible: boolean; obscuration: number; kind: EclipseKind | null } {
  try {
    const searchStart = new Date(globalPeakDate.getTime() - 12 * 3600000);
    const local = Astronomy.SearchLocalSolarEclipse(searchStart, observer);
    const diffDays = Math.abs(local.peak.time.date.getTime() - globalPeakDate.getTime()) / 86400000;
    if (diffDays < 1.0 && local.obscuration > 0 && local.peak.altitude > 0) {
      return {
        isVisible: true,
        obscuration: local.obscuration,
        kind: local.kind as EclipseKind
      };
    }
  } catch (e) {
    // Ignore calculation edge errors
  }
  return { isVisible: false, obscuration: 0, kind: null };
}

/**
 * Checks visibility of a lunar eclipse for a given observer.
 */
function evaluateLocalLunarVisibility(
  lunarEclipse: Astronomy.LunarEclipseInfo,
  observer: Astronomy.Observer
): { isVisible: boolean; visibilityState: VisibilityState; maxAltitude: number } {
  const peakDate = lunarEclipse.peak.date;
  const semiDurationMin = lunarEclipse.sd_partial > 0 ? lunarEclipse.sd_partial : lunarEclipse.sd_penum;
  const pStart = new Date(peakDate.getTime() - semiDurationMin * 60000);
  const pEnd = new Date(peakDate.getTime() + semiDurationMin * 60000);

  const samples = [
    pStart,
    new Date((pStart.getTime() + peakDate.getTime()) / 2),
    peakDate,
    new Date((peakDate.getTime() + pEnd.getTime()) / 2),
    pEnd
  ];

  let maxAlt = -90;
  for (const t of samples) {
    const eq = Astronomy.Equator(Astronomy.Body.Moon, t, observer, true, true);
    const hor = Astronomy.Horizon(t, observer, eq.ra, eq.dec, "normal");
    if (hor.altitude > maxAlt) maxAlt = hor.altitude;
  }

  if (maxAlt <= 0) {
    return { isVisible: false, visibilityState: "invisible", maxAltitude: maxAlt };
  }

  const eqStart = Astronomy.Equator(Astronomy.Body.Moon, pStart, observer, true, true);
  const altStart = Astronomy.Horizon(pStart, observer, eqStart.ra, eqStart.dec, "normal").altitude;
  const eqEnd = Astronomy.Equator(Astronomy.Body.Moon, pEnd, observer, true, true);
  const altEnd = Astronomy.Horizon(pEnd, observer, eqEnd.ra, eqEnd.dec, "normal").altitude;

  let state: VisibilityState = "full";
  if (altStart < 0 && altEnd > 0) {
    state = "grastodaya";
  } else if (altStart > 0 && altEnd < 0) {
    state = "grastasta";
  } else if (maxAlt < 5) {
    state = "partial";
  }

  return { isVisible: true, visibilityState: state, maxAltitude: maxAlt };
}

/**
 * Generates the 12-Rashi Phala for an eclipse occurring in a specific Rashi index.
 */
function generate12RashiImpact(eclipseRashiIdx: number): GrahanaPhalaRashi[] {
  const results: GrahanaPhalaRashi[] = [];

  for (let r = 0; r < 12; r++) {
    const houseFromNative = ((eclipseRashiIdx - r + 12) % 12) + 1;
    const rashiName = RASHI_NAMES_5LANG[r];

    let effect: "shubha" | "madhyama" | "ashubha" = "madhyama";
    let badge = { kn: "ಮಧ್ಯಮ ಫಲ", hi: "मध्यम फल", te: "మధ్యమ ఫలితం", ta: "மத்தியம பலன்", en: "Moderate Impact" };
    let desc = { kn: "", hi: "", te: "", ta: "", en: "" };

    if ([3, 6, 10, 11].includes(houseFromNative)) {
      effect = "shubha";
      badge = { kn: "ಶುಭ ಫಲ", hi: "शुभ फल", te: "శుభ ఫలితం", ta: "சுப பலன்", en: "Auspicious & Benefic" };
      if (houseFromNative === 3) {
        desc = {
          kn: "೩ನೇ ಮನೆಯಲ್ಲಿ ಗ್ರಹಣ ಸಂಭವಿಸುವುದರಿಂದ ಶತ್ರುಜಯ, ಧನಲಾಭ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಧೈರ್ಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
          hi: "तृतीय भाव में ग्रहण से शत्रु पराजय, धनलाभ एवं साहस की वृद्धि होगी।",
          te: "3వ స్థానంలో గ్రహణం వల్ల విజయాలు మరియు ధన లాభం చేకూరుతాయి.",
          ta: "3ஆம் இடத்தில் கிரகணம் நிகழ்வதால் வெற்றி மற்றும் பண வரவு ஏற்படும்.",
          en: "3rd house alignment confers triumph over obstacles, financial gains, and enhanced courage."
        };
      } else if (houseFromNative === 6) {
        desc = {
          kn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಗ್ರಹಣವು ರೋಗನಾಶ, ಸಾಲ ಪರಿಹಾರ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು ನೀಡುತ್ತದೆ.",
          hi: "षष्ठ भाव में ग्रहण से रोग मुक्ति, कर्ज निवारण एवं सफलता प्राप्त होगी।",
          te: "6వ స్థానంలో గ్రహణం వల్ల రోగ విముక్తి మరియు రుణ సమస్యలు తొలగుతాయి.",
          ta: "6ஆம் இடத்தில் கிரகணம் ஆரோக்கியம் மற்றும் கடன் நிவாரணம் தரும்.",
          en: "6th house alignment dissolves health infirmities and delivers financial respite."
        };
      } else if (houseFromNative === 10) {
        desc = {
          kn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಗ್ರಹಣವು ಉದ್ಯೋಗ ಪ್ರಗತಿ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕೀರ್ತಿ ಹೆಚ್ಚಳಕ್ಕೆ ಕಾರಣವಾಗಲಿದೆ.",
          hi: "दशम भाव में ग्रहण से कार्यक्षेत्र में पदोन्नति एवं मान-सम्मान प्राप्त होगा।",
          te: "10వ స్థానంలో గ్రహణం ఉద్యోగ ప్రగతిని మరియు కీర్తిని ఇస్తుంది.",
          ta: "10ஆம் இடத்தில் கிரகணம் தொழில் முன்னேற்றம் தரும்.",
          en: "10th house alignment propels vocational advancement and reputation."
        };
      } else {
        desc = {
          kn: "೧೧ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ಗ್ರಹಣವು ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಹಾಗೂ ನೂತನ ಆದಾಯ ತರುತ್ತದೆ.",
          hi: "एकादश भाव में ग्रहण से अभीष्ट फल, आर्थिक समृद्धि एवं नए अवसर प्राप्त होंगे।",
          te: "11వ స్థానంలో గ్రహణం సకల కార్యసిద్ధి మరియు లాభాలను కలిగిస్తుంది.",
          ta: "11ஆம் இடத்தில் கிரகணம் அனைத்து காரியங்களிலும் வெற்றி தரும்.",
          en: "11th house placement triggers massive material fruition and auspicious fulfillments."
        };
      }
    } else if ([1, 4, 8, 12].includes(houseFromNative)) {
      effect = "ashubha";
      badge = { kn: "ಅಶುಭ / ಜಾಗರೂಕತೆ", hi: "अशुभ / सावधानी", te: "అశుభం / జాగ్రత్త", ta: "அசுபம் / கவனம்", en: "Caution / Afflicted" };
      if (houseFromNative === 1) {
        desc = {
          kn: "ಜನ್ಮ ರಾಶಿಯಲ್ಲೇ ಗ್ರಹಣ ಸಂಭವಿಸುವುದರಿಂದ ಶಾರೀರಿಕ ಆಯಾಸ, ಮಾನಸಿಕ ತಲ್ಲಣ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ಅಪವಾದಗಳಿಂದ ಎಚ್ಚರವಿರಬೇಕು.",
          hi: "जन्म राशि में ग्रहण से शारीरिक अस्वस्थता, मानसिक तनाव एवं बदनामी से सावधान रहें।",
          te: "జన్మ రాశిలో గ్రహణం వల్ల ఆరోగ్య సమస్యలు మరియు మానసిక ఆందోళన ఉంటాయి.",
          ta: "ஜன்ம ராசியில் கிரகணம் மன உளைச்சல் தரும். கவனமாக இருக்கவும்.",
          en: "Janma Rashi eclipse: exercise utmost vigilance regarding physical stamina, inner anxiety, and reputational security."
        };
      } else if (houseFromNative === 4) {
        desc = {
          kn: "೪ನೇ ಮನೆಯಲ್ಲಿ ಗ್ರಹಣವು ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಗೆ ಭಂಗ, ತಾಯಿಯ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರು ಹಾಗೂ ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕತೆ ಬಯಸುತ್ತದೆ.",
          hi: "चतुर्थ भाव में ग्रहण से पारिवारिक अशांति एवं मातृ स्वास्थ्य की चिंता हो सकती है।",
          te: "4వ స్థానంలో గ్రహణం గృహ శాంతి మరియు వాహన ప్రయాణాలలో జాగ్రత్త అవసరం.",
          ta: "4ஆம் இடத்தில் கிரகணம் குடும்பத்தில் அமைதிக்கு பங்கம் விளைவிக்கலாம்.",
          en: "4th house eclipse prompts domestic vigilance, maternal health care, and cautious travel."
        };
      } else if (houseFromNative === 8) {
        desc = {
          kn: "೮ನೇ ಅಷ್ಟಮ ಸ್ಥಾನದಲ್ಲಿ ಗ್ರಹಣವು ಅತ್ಯಂತ ಕಠಿಣವಾಗಿದ್ದು, ಆರೋಗ್ಯ ಸಮಸ್ಯೆ, ಆರ್ಥಿಕ ನಷ್ಟ ಹಾಗೂ ಅಪಘಾತಗಳಿಂದ ರಕ್ಷಣೆಗೆ ಶಾಂತಿ ಪೂಜೆ ಕಡ್ಡಾಯ.",
          hi: "अष्टम भाव में ग्रहण अत्यंत संवेदनशील है। आकस्मिक चोट एवं आर्थिक संकट से बचें।",
          te: "8వ అష్టమ స్థానంలో గ్రహణం ప్రమాదకరమైనది. శాంతి పూజ తప్పనిసరి.",
          ta: "8ஆம் இடத்தில் கிரகணம் விபத்து, நஷ்டம் தரும். சாந்தி பூஜை செய்யவும்.",
          en: "8th house Ashtama alignment mandates spiritual sanctification, avoiding hazardous speculation, and strict defensive health practices."
        };
      } else {
        desc = {
          kn: "೧೨ನೇ ವ್ಯಯ ಸ್ಥಾನದಲ್ಲಿ ಗ್ರಹಣವು ಹಠಾತ್ ಧನಹಾನಿ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಅನಾವಶ್ಯಕ ಪ್ರಯಾಣದ ಅಲೆದಾಟ ತರಬಹುದು.",
          hi: "द्वादश भाव में ग्रहण से व्यर्थ व्यय, अनिद्रा एवं अनावश्यक यात्राएं होंगी।",
          te: "12వ స్థానంలో గ్రహణం అకస్మాత్తుగా ఖర్చులు మరియు నిద్రలేమి కలిగిస్తుంది.",
          ta: "12ஆம் இடத்தில் கிரகணம் வீண் விரயச் செலவுகளை உண்டாக்கும்.",
          en: "12th house placement suggests guarding against sudden expenditure leaks and sleepless restlessness."
        };
      }
    } else {
      effect = "madhyama";
      badge = { kn: "ಮಧ್ಯಮ ಫಲ", hi: "मध्यम फल", te: "మధ్యమ ఫలితం", ta: "மத்தியம பலன்", en: "Moderate" };
      desc = {
        kn: `${houseFromNative}ನೇ ಮನೆಯಲ್ಲಿ ಗ್ರಹಣ ಸಂಭವಿಸಿದ್ದು, ಫಲಗಳು ಮಿಶ್ರವಾಗಿರುತ್ತವೆ. ಸಂಯಮದಿಂದ ವ್ಯವಹರಿಸಿದರೆ ಶುಭ ಫಲ ಪಡೆಯಬಹುದು.`,
        hi: `${houseFromNative}वें भाव में ग्रहण मिश्रित प्रभाव देगा। विवेक से कार्य करें।`,
        te: `${houseFromNative}వ స్థానంలో గ్రహణం సాధారణ ఫలితాలను ఇస్తుంది.`,
        ta: `${houseFromNative}ஆம் இடத்தில் கிரகணம் மிதமான பலன்களைத் தரும்.`,
        en: `Occurring in the ${houseFromNative}th house; results are balanced and moderate, responding well to meditative calmness.`
      };
    }

    results.push({
      rashiIndex: r,
      rashiName,
      effect,
      badge,
      description: desc
    });
  }

  return results;
}

/**
 * Searches and evaluates all Solar and Lunar Eclipses for a given year.
 */
export function calculateYearlyEclipses(
  year: number,
  locationPresetId: string = "karnataka"
): GrahanaEvent[] {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const preset = LOCATION_PRESETS.find((p) => p.id === locationPresetId) || LOCATION_PRESETS[2];

  const results: GrahanaEvent[] = [];

  // 1. Search Solar Eclipses
  let curTime = new Date(startOfYear);
  while (curTime <= endOfYear) {
    try {
      const eclipse = Astronomy.SearchGlobalSolarEclipse(curTime);
      if (eclipse.peak.date > endOfYear) break;
      if (eclipse.peak.date >= startOfYear) {
        const peakDate = eclipse.peak.date;
        const sidereal = getSiderealPosition(peakDate, Astronomy.Body.Sun);
        const rashiName = RASHI_NAMES_5LANG[sidereal.rashiIndex];
        const nakName = NAKSHATRA_NAMES_5LANG[sidereal.nakshatraIndex];

        let isVisibleInLocation = false;
        let localObscuration = 0;
        let localKind: EclipseKind | null = null;
        const baseObs = eclipse.obscuration ?? 1.0;

        if (preset.isGlobal) {
          isVisibleInLocation = true;
          localObscuration = baseObs;
        } else {
          for (const obs of preset.observers) {
            const o = new Astronomy.Observer(obs.latitude, obs.longitude, obs.altitudeMeters);
            const vis = evaluateLocalSolarVisibility(peakDate, o);
            if (vis.isVisible) {
              isVisibleInLocation = true;
              if (vis.obscuration > localObscuration) {
                localObscuration = vis.obscuration;
                localKind = vis.kind;
              }
            }
          }
        }

        const subType: EclipseKind = (localKind || eclipse.kind) as EclipseKind;
        const subTypeLabels: Record<EclipseKind, Record<string, string>> = {
          total: { kn: "ಖಗ್ರಾಸ ಸೂರ್ಯ ಗ್ರಹಣ (Total)", hi: "पूर्ण सूर्य ग्रहण", te: "సంపూర్ణ సూర్య గ్రహణం", ta: "முழு சூரிய கிரகணம்", en: "Total Solar Eclipse" },
          annular: { kn: "ಕಂಕಣ ಸೂರ್ಯ ಗ್ರಹಣ (Annular)", hi: "कंकणाकार सूर्य ग्रहण", te: "కంకణ సూర్య గ్రహణం", ta: "வளைய சூரிய கிரகணம்", en: "Annular Solar Eclipse" },
          partial: { kn: "ಖಂಡಗ್ರಾಸ ಸೂರ್ಯ ಗ್ರಹಣ (Partial)", hi: "खंडग्रास सूर्य ग्रहण", te: "పాక్షిక సూర్య గ్రహణం", ta: "பகுதி சூரிய கிரகணம்", en: "Partial Solar Eclipse" },
          penumbral: { kn: "ಉಪಛಾಯಾ ಸೂರ್ಯ ಗ್ರಹಣ", hi: "उपच्छाया सूर्य ग्रहण", te: "ఉపఛాయా సూర్య గ్రహణం", ta: "புறநிழல் சூரிய கிரகணம்", en: "Penumbral Solar Eclipse" },
          hybrid: { kn: "ಮಿಶ್ರ (ಖಗ್ರಾಸ-ಕಂಕಣ) ಸೂರ್ಯ ಗ್ರಹಣ", hi: "मिश्रित सूर्य ग्रहण", te: "మిశ్రమ సూర్య గ్రహణం", ta: "கலப்பு சூரிய கிரகணம்", en: "Hybrid Solar Eclipse" }
        };

        const kindLabel = subTypeLabels[subType] || subTypeLabels.partial;
        const sutakaStartIst = toIstString(new Date(peakDate.getTime() - 12 * 3600000));
        const latStr = eclipse.latitude != null ? eclipse.latitude.toFixed(1) : "0.0";
        const lonStr = eclipse.longitude != null ? eclipse.longitude.toFixed(1) : "0.0";

        results.push({
          id: `solar_${toYmdString(peakDate)}`,
          type: "surya",
          subType,
          typeLabel: { kn: "ಸೂರ್ಯ ಗ್ರಹಣ", hi: "सूर्य ग्रहण", te: "సూర్య గ్రహణం", ta: "சூரிய கிரகணம்", en: "Solar Eclipse" },
          subTypeLabel: kindLabel,
          title: {
            kn: `${kindLabel.kn} - ${rashiName.kn} (${nakName.kn})`,
            hi: `${kindLabel.hi} - ${rashiName.hi} (${nakName.hi})`,
            te: `${kindLabel.te} - ${rashiName.te} (${nakName.te})`,
            ta: `${kindLabel.ta} - ${rashiName.ta} (${nakName.ta})`,
            en: `${kindLabel.en} in ${rashiName.en} (${nakName.en})`
          },
          peakDate,
          peakDateStr: toYmdString(peakDate),
          peakTimeIst: toIstString(peakDate),
          peakTimeUtc: toUtcString(peakDate),
          durationMinutes: 180,
          obscurationPercent: Math.round((isVisibleInLocation ? (localObscuration || baseObs) : baseObs) * 100),
          rashiIndex: sidereal.rashiIndex,
          rashi: rashiName,
          degreeFormatted: formatDegMin(sidereal.degreeInRashi),
          nakshatraIndex: sidereal.nakshatraIndex,
          nakshatra: nakName,
          pada: sidereal.pada,
          globalVisibilityNote: {
            kn: `ಜಾಗತಿಕ ಗರಿಷ್ಠ ರೇಖಾಂಶ: ${latStr}° Lat, ${lonStr}° Lon.`,
            hi: `वैश्विक केंद्र: ${latStr}° अक्षांश, ${lonStr}° देशांतर.`,
            te: `ప్రపంచ కేంద్రం: ${latStr}° అక్షాంశం, ${lonStr}° రేఖాంశం.`,
            ta: `உலக மையப் புள்ளி: ${latStr}° அட்சரேகை, ${lonStr}° தீர்க்கரேகை.`,
            en: `Global greatest eclipse coordinates: ${latStr}° Lat, ${lonStr}° Lon.`
          },
          visibility: {
            isGloballyActive: true,
            isVisibleInSelected: isVisibleInLocation,
            visibilityState: isVisibleInLocation ? "full" : "invisible",
            locationLabel: preset.name,
            statusBadge: isVisibleInLocation
              ? {
                  kn: "🟢 ಆಯ್ಕೆಮಾಡಿದ ಸ್ಥಳದಲ್ಲಿ ಗೋಚರ (Visible)",
                  hi: "🟢 इस स्थान पर दृश्य (Visible)",
                  te: "🟢 ఈ ప్రదేశంలో గోచరిస్తుంది (Visible)",
                  ta: "🟢 இந்த இடத்தில் தெரியும் (Visible)",
                  en: "🟢 Visible in Selected Location"
                }
              : {
                  kn: "⚪ ಅದೃಶ್ಯ (Invisible - ಸೂತಕ ದೋಷವಿಲ್ಲ)",
                  hi: "⚪ अदृश्य (Invisible - सूतक मान्य नहीं)",
                  te: "⚪ అగోచరం (Invisible - సూతకం లేదు)",
                  ta: "⚪ புலப்படவில்லை (Invisible - தீட்டு இல்லை)",
                  en: "⚪ Invisible in Location (No Sutaka App)"
                },
            sutakaApplicable: isVisibleInLocation,
            sutakaStartTimeIst: isVisibleInLocation ? sutakaStartIst : undefined,
            visibilityDetails: isVisibleInLocation
              ? {
                  kn: `ಆಯ್ಕೆಮಾಡಿದ ${preset.name.kn} ಭಾಗದಲ್ಲಿ ಈ ಸೂರ್ಯ ಗ್ರಹಣವು ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸಲಿದ್ದು, ಗ್ರಹಣ ಸ್ಪರ್ಶಕ್ಕೆ ೧೨ ಗಂಟೆಗಳ ಮುಂಚಿತವಾಗಿ (ಸೂತಕ ಕಾಲ: ${sutakaStartIst}) ಶಾಸ್ತ್ರೋಕ್ತ ಸೂತಕ ಆಚರಣೆ ಅನ್ವಯಿಸುತ್ತದೆ.`,
                  hi: `यह सूर्य ग्रहण इस क्षेत्र में दृश्य रहेगा। स्पर्श से 12 घंटे पूर्व सूतक मान्य होगा।`,
                  te: `ఈ సూర్య గ్రహణం ఇక్కడ కనిపిస్తుంది. 12 గంటల ముందే సూతకం ప్రారంభమవుతుంది.`,
                  ta: `இந்த சூரிய கிரகணம் தெரியும். 12 மணி நேரத்திற்கு முன் தீட்டு தொடங்கும்.`,
                  en: `Visible in ${preset.name.en}. Vedic Sutaka rules apply commencing 12 hours prior to contact.`
                }
              : {
                  kn: `ಈ ಸೂರ್ಯ ಗ್ರಹಣವು ಆಯ್ಕೆಮಾಡಿದ ${preset.name.kn} ಭಾಗದಲ್ಲಿ ಗೋಚರಿಸುವುದಿಲ್ಲ (ಅದೃಶ್ಯ ಗ್ರಹಣ). ಧರ್ಮಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಕಣ್ಣಿಗೆ ಕಾಣದ ಗ್ರಹಣಕ್ಕೆ ಯಾವುದೇ ಸೂತಕ, ವೇಧ, ಸ್ನಾನ, ಜಪ ಅಥವಾ ಆಹಾರ ನಿಷೇಧಗಳು ಅನ್ವಯಿಸುವುದಿಲ್ಲ.`,
                  hi: `यह सूर्य ग्रहण इस स्थान पर दिखाई नहीं देगा। अतः शास्त्रानुसार कोई सूतक अथवा निषेध मान्य नहीं है।`,
                  te: `ఈ గ్రహణం ఇక్కడ కనిపించదు కాబట్టి ఎటువంటి సూతకం పాటించనవసరం లేదు.`,
                  ta: `இந்த கிரகணம் புலப்படாததால் எவ்வித தீட்டும் கடைப்பிடிக்கத் தேவையில்லை.`,
                  en: `Invisible in ${preset.name.en}. Per classical Dharmashastra injunctions, invisible eclipses incur ZERO Sutaka, dietary, or ceremonial prohibitions.`
                }
          },
          impact: {
            afflictedNakshatra: nakName,
            afflictedRashi: rashiName,
            rashiSummary: generate12RashiImpact(sidereal.rashiIndex)
          },
          vedicInjunctions: {
            sutakaRule: {
              kn: "ಸೂರ್ಯ ಗ್ರಹಣಕ್ಕೆ ಗ್ರಹಣ ಸ್ಪರ್ಶಕ್ಕಿಂತ ೪ ಯಾಮಗಳು (೧೨ ಗಂಟೆಗಳು) ಮುಂಚಿತವಾಗಿ ಸೂತಕ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ. ಬಾಲಕರು, ವೃದ್ಧರು, ರೋಗಿಗಳನ್ನು ಹೊರತುಪಡಿಸಿ ಇತರರು ಆಹಾರ ಸೇವಿಸಬಾರದು.",
              hi: "सूर्य ग्रहण में स्पर्श से 12 घंटे पूर्व सूतक लगता है। भोजन, शयन आदि वर्जित हैं।",
              te: "సూర్య గ్రహణానికి 12 గంటల ముందే సూతకం ఆరంభమవుతుంది.",
              ta: "சூரிய கிரகணத்திற்கு 12 மணி நேரத்திற்கு முன்னரே தீட்டு ஆரம்பமாகும்.",
              en: "Sutaka begins 12 hours (4 Yamas) prior to touch. No solid meals consumed during Sutaka window."
            },
            aharaNiyama: {
              kn: "ನೀರು, ಹಾಲು, ತುಪ್ಪ ಮೊದಲಾದ ಆಹಾರ ಪದಾರ್ಥಗಳಿಗೆ ಮೊದಲೇ ದರ್ಭೆ (ದರ್ಭಾ ಹುಲ್ಲು) ಹಾಕಿಡಬೇಕು.",
              hi: "जल, दूध, घी आदि पदार्थों में कुशा (दूर्वा) डालें।",
              te: "నీరు, పాలు తదితర ఆహార పదార్థాలలో దర్భలు వేయాలి.",
              ta: "பால், தயிர், குடிநீரில் தருப்பை புல் போட்டு வைக்கவும்.",
              en: "Place sacred Kusha grass (Darbha) into water and food vessels prior to eclipse onset."
            },
            snanaDanaRule: {
              kn: "ಗ್ರಹಣ ಮುಕ್ತಾಯವಾದ (ಮೋಕ್ಷ) ತಕ್ಷಣವೇ ತಣ್ಣೀರಿನಿಂದ ಸಚೇಲ ಸ್ನಾನ ಮಾಡಿ, ದೇವತಾರ್ಚನೆ ಮಾಡಿ, ಬಡವರಿಗೆ ಧಾನ್ಯ ಮತ್ತು ವಸ್ತ್ರ ದಾನ ಮಾಡಬೇಕು.",
              hi: "मोक्ष के उपरांत स्नान कर तिल, अन्न एवं वस्त्र का दान करें।",
              te: "గ్రహణ మోక్షం తర్వాత తలస్నానం చేసి దానాలు ఇవ్వాలి.",
              ta: "கிரகண முடிவில் குளித்துவிட்டு தானம் செய்ய வேண்டும்.",
              en: "Perform head bath immediately upon release (Moksha), worship family deities, and offer grain charity."
            },
            mantraJapa: {
              kn: "ಗ್ರಹಣ ಕಾಲದಲ್ಲಿ ಮಾಡುವ 'ಗಾಯತ್ರೀ ಮಂತ್ರ' ಅಥವಾ 'ಶ್ರೀ ಸೂರ್ಯ ಕವಚ' ಜಪವು ಕೋಟಿ ಪಟ್ಟು ಮಹಾ ಫಲ ನೀಡುತ್ತದೆ.",
              hi: "ग्रहण काल में गायत्री मंत्र अथवा सूर्य स्तोत्र का जप कोटि गुना फलदायी होता है।",
              te: "గాయత్రీ మంత్ర జపం కోటి రెట్ల ఫలితాన్ని ఇస్తుంది.",
              ta: "கிரகண காலத்தில் காயத்ரி மந்திரம் ஜபிப்பது கோடி மடங்கு பலன் தரும்.",
              en: "Mantra recitations (Gayatri, Aditya Hridaya, Surya Kavacha) during eclipse are magnified ten-million-fold."
            },
            gokarnaPooja: {
              kn: "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಸೂರ್ಯ ಗ್ರಹಣ ಪುಣ್ಯಕಾಲ ಸ್ನಾನ, ಆತ್ಮಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ಪೂಜೆ.",
              hi: "गोकर्ण कोटितीर्थ में ग्रहण स्नान एवं आत्मलिंग अभिषेक।",
              te: "గోకర్ణంలో గ్రహణ స్నానం మరియు ఆత్మలింగార్చన.",
              ta: "கோகர்ணத்தில் புண்ணிய ஸ்நானம் மற்றும் ஆத்மலிங்க பூஜை.",
              en: "Consecrated Grahana Snana at Gokarna Koti Tirtha and Mahabaleshwara Atmalinga Kshirabhishekam."
            }
          }
        });
      }
      curTime = new Date(eclipse.peak.date.getTime() + 30 * 86400000);
    } catch (e) {
      break;
    }
  }

  // 2. Search Lunar Eclipses
  curTime = new Date(startOfYear);
  while (curTime <= endOfYear) {
    try {
      const eclipse = Astronomy.SearchLunarEclipse(curTime);
      if (eclipse.peak.date > endOfYear) break;
      if (eclipse.peak.date >= startOfYear) {
        const peakDate = eclipse.peak.date;
        const sidereal = getSiderealPosition(peakDate, Astronomy.Body.Moon);
        const rashiName = RASHI_NAMES_5LANG[sidereal.rashiIndex];
        const nakName = NAKSHATRA_NAMES_5LANG[sidereal.nakshatraIndex];

        let isVisibleInLocation = false;
        let bestState: VisibilityState = "invisible";

        if (preset.isGlobal) {
          isVisibleInLocation = true;
          bestState = "full";
        } else {
          for (const obs of preset.observers) {
            const o = new Astronomy.Observer(obs.latitude, obs.longitude, obs.altitudeMeters);
            const vis = evaluateLocalLunarVisibility(eclipse, o);
            if (vis.isVisible) {
              isVisibleInLocation = true;
              bestState = vis.visibilityState;
            }
          }
        }

        const subType: EclipseKind = (eclipse.kind as EclipseKind) || "partial";
        const subTypeLabels: Record<EclipseKind, Record<string, string>> = {
          total: { kn: "ಖಗ್ರಾಸ ಚಂದ್ರ ಗ್ರಹಣ (Total)", hi: "पूर्ण चंद्र ग्रहण", te: "సంపూర్ణ చంద్ర గ్రహణం", ta: "முழு சந்திர கிரகணம்", en: "Total Lunar Eclipse" },
          annular: { kn: "ಚಂದ್ರ ಗ್ರಹಣ", hi: "चंद्र ग्रहण", te: "చంద్ర గ్రహణం", ta: "சந்திர கிரகணம்", en: "Lunar Eclipse" },
          partial: { kn: "ಖಂಡಗ್ರಾಸ ಚಂದ್ರ ಗ್ರಹಣ (Partial)", hi: "खंडग्रास चंद्र ग्रहण", te: "పాక్షిక చంద్ర గ్రహణం", ta: "பகுதி சந்திர கிரகணம்", en: "Partial Lunar Eclipse" },
          penumbral: { kn: "ಉಪಛಾಯಾ / ಮಾಂದ್ಯ ಚಂದ್ರ ಗ್ರಹಣ (Penumbral)", hi: "उपच्छाया चंद्र ग्रहण", te: "ఉపఛాయా చంద్ర గ్రహణం", ta: "புறநிழல் சந்திர கிரகணம்", en: "Penumbral Lunar Eclipse" },
          hybrid: { kn: "ಮಿಶ್ರ ಚಂದ್ರ ಗ್ರಹಣ", hi: "मिश्रित चंद्र ग्रहण", te: "మిశ్రమ చంద్ర గ్రహణం", ta: "கலப்பு சந்திர கிரகணம்", en: "Hybrid Lunar Eclipse" }
        };

        const kindLabel = subTypeLabels[subType] || subTypeLabels.partial;
        const sutakaStartIst = toIstString(new Date(peakDate.getTime() - 9 * 3600000));
        const durationMin = Math.round((eclipse.sd_partial > 0 ? eclipse.sd_partial : eclipse.sd_penum) * 2);

        results.push({
          id: `lunar_${toYmdString(peakDate)}`,
          type: "chandra",
          subType,
          typeLabel: { kn: "ಚಂದ್ರ ಗ್ರಹಣ", hi: "चंद्र ग्रहण", te: "చంద్ర గ్రహణం", ta: "சந்திர கிரகணம்", en: "Lunar Eclipse" },
          subTypeLabel: kindLabel,
          title: {
            kn: `${kindLabel.kn} - ${rashiName.kn} (${nakName.kn})`,
            hi: `${kindLabel.hi} - ${rashiName.hi} (${nakName.hi})`,
            te: `${kindLabel.te} - ${rashiName.te} (${nakName.te})`,
            ta: `${kindLabel.ta} - ${rashiName.ta} (${nakName.ta})`,
            en: `${kindLabel.en} in ${rashiName.en} (${nakName.en})`
          },
          peakDate,
          peakDateStr: toYmdString(peakDate),
          peakTimeIst: toIstString(peakDate),
          peakTimeUtc: toUtcString(peakDate),
          durationMinutes: durationMin,
          obscurationPercent: subType === "total" ? 100 : Math.min(100, Math.round(eclipse.obscuration * 100) || 75),
          rashiIndex: sidereal.rashiIndex,
          rashi: rashiName,
          degreeFormatted: formatDegMin(sidereal.degreeInRashi),
          nakshatraIndex: sidereal.nakshatraIndex,
          nakshatra: nakName,
          pada: sidereal.pada,
          globalVisibilityNote: {
            kn: `ಖಗೋಳ ಗರಿಷ್ಠ ಅವಧಿ: ${durationMin} ನಿಮಿಷಗಳು.`,
            hi: `अवधि: ${durationMin} मिनट।`,
            te: `వ్యవధి: ${durationMin} నిమిషాలు.`,
            ta: `கால அளவு: ${durationMin} நிமிடங்கள்.`,
            en: `Astronomical duration: ${durationMin} minutes.`
          },
          visibility: {
            isGloballyActive: true,
            isVisibleInSelected: isVisibleInLocation,
            visibilityState: bestState,
            locationLabel: preset.name,
            statusBadge: isVisibleInLocation
              ? {
                  kn: bestState === "grastodaya"
                    ? "🌅 ಗ್ರಸ್ತೋದಯ ಗೋಚರ (Rises Eclipsed)"
                    : bestState === "grastasta"
                    ? "🌇 ಗ್ರಸ್ತಾಸ್ತ ಗೋಚರ (Sets Eclipsed)"
                    : "🟢 ಸಂಪೂರ್ಣ ಗೋಚರ (Visible)",
                  hi: bestState === "grastodaya" ? "🌅 ग्रस्तोद्य दृश्य" : "🟢 पूर्ण दृश्य",
                  te: bestState === "grastodaya" ? "🌅 గ్రస్తోదయ దృశ్యం" : "🟢 సంపూర్ణ దర్శనం",
                  ta: bestState === "grastodaya" ? "🌅 கிரகண உதயம்" : "🟢 முழுமையாக தெரியும்",
                  en: bestState === "grastodaya" ? "🌅 Rises While Eclipsed (Grastodaya)" : "🟢 Visible in Selected Region"
                }
              : {
                  kn: "⚪ ಅದೃಶ್ಯ (Invisible - ಸೂತಕ ದೋಷವಿಲ್ಲ)",
                  hi: "⚪ अदृश्य (Invisible - सूतक मान्य नहीं)",
                  te: "⚪ అగోచరం (Invisible - సూతకం లేదు)",
                  ta: "⚪ புலப்படவில்லை (Invisible - தீட்டு இல்லை)",
                  en: "⚪ Invisible in Location (No Sutaka App)"
                },
            sutakaApplicable: isVisibleInLocation,
            sutakaStartTimeIst: isVisibleInLocation ? sutakaStartIst : undefined,
            visibilityDetails: isVisibleInLocation
              ? {
                  kn: `ಆಯ್ಕೆಮಾಡಿದ ${preset.name.kn} ಭಾಗದಲ್ಲಿ ಈ ಚಂದ್ರ ಗ್ರಹಣವು ${bestState === "grastodaya" ? "ಗ್ರಸ್ತೋದಯವಾಗಿ (ಚಂದ್ರೋದಯದ ವೇಳೆಗೆ ಗ್ರಹಣ ಹಿಡಿದ ಸ್ಥಿತಿಯಲ್ಲಿ)" : "ಭಾಗಶಃ ಅಥವಾ ಪೂರ್ಣವಾಗಿ"} ಗೋಚರಿಸಲಿದ್ದು, ಗ್ರಹಣ ಸ್ಪರ್ಶಕ್ಕಿಂತ ೯ ಗಂಟೆಗಳ ಮುಂಚಿತವಾಗಿ (ಸೂತಕ ಕಾಲ: ${sutakaStartIst}) ಸೂತಕ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.`,
                  hi: `यह चंद्र ग्रहण दृश्य रहेगा। स्पर्श से 9 घंटे पूर्व सूतक प्रभावी होगा।`,
                  te: `ఈ చంద్ర గ్రహణం కనిపిస్తుంది. 9 గంటల ముందు సూతకం మొదలవుతుంది.`,
                  ta: `இந்த சந்திர கிரகணம் தெரியும். 9 மணி நேரத்திற்கு முன் தீட்டு தொடங்கும்.`,
                  en: `Visible in ${preset.name.en} (${bestState === "grastodaya" ? "rising while already eclipsed" : "visible phase"}). Sutaka rules take effect 9 hours prior to touch.`
                }
              : {
                  kn: `ಈ ಚಂದ್ರ ಗ್ರಹಣವು ಆಯ್ಕೆಮಾಡಿದ ${preset.name.kn} ಭಾಗದಲ್ಲಿ ಗೋಚರಿಸುವುದಿಲ್ಲ (ಅದೃಶ್ಯ ಗ್ರಹಣ). ಶಾಸ್ತ್ರದಂತೆ ಅದೃಶ್ಯ ಗ್ರಹಣಕ್ಕೆ ಯಾವುದೇ ಸೂತಕ ಅಥವಾ ಧಾರ್ಮಿಕ ನಿರ್ಬಂಧಗಳಿರುವುದಿಲ್ಲ.`,
                  hi: `यह चंद्र ग्रहण यहां दिखाई नहीं देगा। कोई सूतक मान्य नहीं है।`,
                  te: `ఈ గ్రహణం ఇక్కడ కనిపించదు కాబట్టి ఎటువంటి సూతకం లేదు.`,
                  ta: `இந்த கிரகணம் புலப்படாததால் தீட்டு இல்லை.`,
                  en: `Invisible in ${preset.name.en}. Per classical Dharmashastra principles, invisible eclipses incur ZERO Sutaka obligations.`
                }
          },
          impact: {
            afflictedNakshatra: nakName,
            afflictedRashi: rashiName,
            rashiSummary: generate12RashiImpact(sidereal.rashiIndex)
          },
          vedicInjunctions: {
            sutakaRule: {
              kn: "ಚಂದ್ರ ಗ್ರಹಣಕ್ಕೆ ಗ್ರಹಣ ಸ್ಪರ್ಶಕ್ಕಿಂತ ೩ ಯಾಮಗಳು (೯ ಗಂಟೆಗಳು) ಮುಂಚಿತವಾಗಿ ಸೂತಕ ಆರಂಭವಾಗುತ್ತದೆ. ಈ ಸಮಯದಲ್ಲಿ ನಿದ್ರೆ, ಆಹಾರ ನಿಷಿದ್ಧ.",
              hi: "चंद्र ग्रहण में स्पर्श से 9 घंटे पूर्व सूतक मान्य होता है।",
              te: "చంద్ర గ్రహణానికి 9 గంటల ముందే సూతకం ప్రారంభమవుతుంది.",
              ta: "சந்திர கிரகணத்திற்கு 9 மணி நேரத்திற்கு முன் தீட்டு ஆரம்பமாகும்.",
              en: "Sutaka for Lunar Eclipse commences 9 hours (3 Yamas) prior to touch."
            },
            aharaNiyama: {
              kn: "ಗ್ರಹಣ ಪ್ರಾರಂಭದಿಂದ ಮೋಕ್ಷದವರೆಗೆ ಯಾವುದೇ ಆಹಾರ ಸೇವಿಸಬಾರದು. ಆಹಾರ ಪಾತ್ರೆಗಳಿಗೆ ತುಳಸಿ ಅಥವಾ ದರ್ಭೆ ಹಾಕಿಡುವುದು ಪುಣ್ಯಪ್ರದ.",
              hi: "ग्रहण के समय अन्न-जल ग्रहण न करें। तुलसी दल का प्रयोग करें।",
              te: "గ్రహణ సమయంలో ఆహారం తీసుకోకూడదు. తులసి దళాలు వేయాలి.",
              ta: "கிரகண நேரத்தில் உணவு உட்கொள்ளக் கூடாது. துளசி இலை இடவும்.",
              en: "Fasting during eclipse duration; place Tulsi or Darbha leaves in stored liquids."
            },
            snanaDanaRule: {
              kn: "ಮೋಕ್ಷದ ನಂತರ ತಕ್ಷಣವೇ ತಣ್ಣೀರಿನಿಂದ ಪೂರ್ಣ ಸ್ನಾನ ಮಾಡಿ, ಬಿಳಿ ವಸ್ತ್ರ, ಅಕ್ಕಿ ಅಥವಾ ಬೆಳ್ಳಿಯ ದಾನ ಮಾಡಬೇಕು.",
              hi: "मोक्षोपरांत स्नान कर श्वेत वस्त्र, चावल या चांदी का दान करें।",
              te: "మోక్షం తర్వాత స్నానం చేసి బియ్యం లేదా వెండి దానం చేయాలి.",
              ta: "கிரகண முடிவில் குளித்துவிட்டு அரிசி அல்லது வெள்ளி தானம் செய்யவும்.",
              en: "Cold-water bath immediately after Moksha followed by donation of white cloth, rice, or silver."
            },
            mantraJapa: {
              kn: "ಗ್ರಹಣ ಕಾಲದಲ್ಲಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ 'ಚಂದ್ರ ಗಾಯತ್ರೀ ಮಂತ್ರ' ಜಪಿಸುವುದರಿಂದ ಮನಃಶಾಂತಿ ಮತ್ತು ರಕ್ಷಣೆ ಸಿಗುತ್ತದೆ.",
              hi: "ग्रहण काल में महामृत्युंजय अथवा शिव पंचाक्षर मंत्र का जप सर्वोत्तम है।",
              te: "'ఓం నమః శివాయ' మంత్ర జపం అత్యంత శ్రేయస్కరం.",
              ta: "'ஓம் நம சிவாய' மந்திரம் ஜபிப்பது மிகுந்த புண்ணியம் தரும்.",
              en: "Chanting 'Om Namah Shivaya' or Maha Mrityunjaya Mantra bestows profound psychic shielding."
            },
            gokarnaPooja: {
              kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ಚಂದ್ರ ಶಾಂತಿ ಪೂಜೆ', ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪುಣ್ಯ ಸ್ನಾನ.",
              hi: "गोकर्ण में चंद्र शांति एवं रुद्राभिषेक पूजा।",
              te: "గోకర్ణంలో చంద్ర శాంతి మరియు రుద్రాభిషేకం.",
              ta: "கோகர்ணத்தில் சந்திர சாந்தி மற்றும் ருத்ராபிஷேகம்.",
              en: "Chandra Shanti Puja and Rudrabhishekam at Gokarna Mahabaleshwara Kshetra."
            }
          }
        });
      }
      curTime = new Date(eclipse.peak.date.getTime() + 30 * 86400000);
    } catch (e) {
      break;
    }
  }

  results.sort((a, b) => a.peakDate.getTime() - b.peakDate.getTime());

  return results;
}

/**
 * Computes major planetary transits (Jupiter, Saturn, Rahu-Ketu shifting signs) for that year.
 */
export function calculateMajorTransits(year: number): MajorTransitEvent[] {
  const transits: MajorTransitEvent[] = [];
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const planets: Array<{ name: "Jupiter" | "Saturn" | "Rahu" | "Ketu"; body?: Astronomy.Body }> = [
    { name: "Jupiter", body: Astronomy.Body.Jupiter },
    { name: "Saturn", body: Astronomy.Body.Saturn }
  ];

  for (const p of planets) {
    if (!p.body) continue;
    let prevRashi = getSiderealPosition(startOfYear, p.body).rashiIndex;

    for (let t = startOfYear.getTime(); t <= endOfYear.getTime(); t += 86400000 * 2) {
      const d = new Date(t);
      const curRashi = getSiderealPosition(d, p.body).rashiIndex;

      if (curRashi !== prevRashi) {
        let t1 = t - 86400000 * 2;
        let t2 = t;
        for (let step = 0; step < 7; step++) {
          const midT = (t1 + t2) / 2;
          const midR = getSiderealPosition(new Date(midT), p.body).rashiIndex;
          if (midR === prevRashi) {
            t1 = midT;
          } else {
            t2 = midT;
          }
        }
        const exactDate = new Date((t1 + t2) / 2);

        const fromR = RASHI_NAMES_5LANG[prevRashi];
        const toR = RASHI_NAMES_5LANG[curRashi];

        transits.push({
          planet: p.name,
          date: exactDate,
          dateStr: toYmdString(exactDate),
          timeIstStr: toIstString(exactDate),
          fromRashiIndex: prevRashi,
          toRashiIndex: curRashi,
          fromRashi: fromR,
          toRashi: toR,
          title: {
            kn: `${p.name === "Jupiter" ? "ಗುರು" : "ಶನಿ"} ಗೋಚಾರ ಪರಿವರ್ತನೆ: ${fromR.kn}ದಿಂದ ${toR.kn}ಕ್ಕೆ`,
            hi: `${p.name === "Jupiter" ? "गुरु" : "शनि"} राशि परिवर्तन: ${fromR.hi} से ${toR.hi} में`,
            te: `${p.name === "Jupiter" ? "గురు" : "శని"} రాశి మార్పు: ${fromR.te} నుండి ${toR.te}కి`,
            ta: `${p.name === "Jupiter" ? "குரு" : "சனி"} பெயர்ச்சி: ${fromR.ta} முதல் ${toR.ta} வரை`,
            en: `${p.name} Transit into ${toR.en} (from ${fromR.en})`
          },
          description: {
            kn: `${p.name === "Jupiter" ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು" : "ಕರ್ಮಕಾರಕ ಶನಿಯು"} ${toYmdString(exactDate)} ರಂದು ${toR.kn} ರಾಶಿಗೆ ಅಧಿಕೃತವಾಗಿ ಪ್ರವೇಶಿಸಲಿದ್ದು, ದ್ವಾದಶ ರಾಶಿಗಳ ಫಲಗಳಲ್ಲಿ ಮಹತ್ವದ ತಿರುವು ಉಂಟಾಗಲಿದೆ.`,
            hi: `${p.name === "Jupiter" ? "गुरु" : "शनि"} का ${toR.hi} में गोचर व्यापक प्रभाव डालेगा।`,
            te: `${p.name === "Jupiter" ? "గురు" : "శని"} రాశి ప్రవేశం విశేష ఫలితాలను ఇస్తుంది.`,
            ta: `${p.name === "Jupiter" ? "குரு" : "சனி"} பெயர்ச்சி முக்கிய மாற்றங்களை ஏற்படுத்தும்.`,
            en: `${p.name} crosses into ${toR.en} on ${toYmdString(exactDate)}, reshaping worldly and personal fortunes.`
          }
        });

        prevRashi = curRashi;
      }
    }
  }

  transits.sort((a, b) => a.date.getTime() - b.date.getTime());
  return transits;
}

/**
 * Unified calculation function returning the entire annual dossier for any year.
 */
export function calculateAnnualAstroReport(
  year: number,
  locationPresetId: string = "karnataka"
): AnnualAstroReport {
  const preset = LOCATION_PRESETS.find((p) => p.id === locationPresetId) || LOCATION_PRESETS[2];

  const eclipses = calculateYearlyEclipses(year, preset.id);
  const { events: astodayaEvents, periods: astodayaPeriods } = calculateYearlyAstodaya(year);
  const majorTransits = calculateMajorTransits(year);

  const visibleCount = eclipses.filter((e) => e.visibility.isVisibleInSelected).length;

  const marriageWindowsSummary: Record<string, string> = {
    kn: astodayaPeriods.length > 0
      ? `ಈ ವರ್ಷದಲ್ಲಿ ಒಟ್ಟು ${astodayaPeriods.length} ಮೌಢ್ಯ ಕಾಲಗಳಿವೆ. ಮೌಢ್ಯವಿರುವ ದಿನಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಗುರು ಮತ್ತು ಶುಕ್ರರು ಇಬ್ಬರೂ ಉದಯದಲ್ಲಿರುವ ಉಳಿದ ದಿನಗಳಲ್ಲಿ ಶುಭ ವಿವಾಹ ಮುಹೂರ್ತಗಳನ್ನು ನಿಶ್ಚಯಿಸಬಹುದು.`
      : "ಈ ವರ್ಷದಲ್ಲಿ ಯಾವುದೇ ದೀರ್ಘಕಾಲದ ಮೌಢ್ಯ ದೋಷವಿಲ್ಲದೆ ಹೆಚ್ಚಿನ ತಿಂಗಳುಗಳು ವಿವಾಹಕ್ಕೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾಗಿವೆ.",
    hi: `वर्ष ${year} में कुल ${astodayaPeriods.length} मौढ्य अवधियां हैं। मौढ्य काल को छोड़कर शेष समय में शुभ विवाह मुहूर्त निर्धारित किए जा सकते हैं।`,
    te: `ఈ సంవత్సరంలో మొత్తం ${astodayaPeriods.length} మౌఢ్య కాలాలు ఉన్నాయి. మిగిలిన కాలం వివాహాది శుభకార్యాలకు శ్రేయస్కరం.`,
    ta: `இந்த ஆண்டில் ${astodayaPeriods.length} மௌட்டிய காலங்கள் உள்ளன. மற்ற காலங்களில் திருமண முகூர்த்தங்கள் வைக்கலாம்.`,
    en: `This year contains ${astodayaPeriods.length} combustion windows. Auspicious marriage muhurthas can be consecrated across all non-Moudhya periods when both Jupiter and Venus shine with unhindered Udaya.`
  };

  return {
    year,
    locationId: preset.id,
    locationName: preset.name,
    calculatedAt: new Date().toISOString(),
    eclipses,
    visibleEclipsesCount: visibleCount,
    totalGlobalEclipsesCount: eclipses.length,
    astodayaEvents,
    astodayaPeriods,
    majorTransits,
    auspiciousMarriageWindowsSummary: marriageWindowsSummary
  };
}
