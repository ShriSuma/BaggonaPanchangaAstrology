import { wallClockBirthToUtc } from "./birthTime";
import SunCalc from "suncalc";
import { getAyanamsa, normalizeDegree, degreeToRashi } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import type { AyanamsaModel } from "./AstroTypes";
import {
  getTithiEnd,
  getNakshatraEnd,
  getNakshatraStart,
  getYogaEnd,
  getKaranaEnd,
  getSunNakshatraEnd,
  getLunarMonthAndYear,
  getLocalizedSamvatsara,
  getLocalizedMasa,
  getVishaAndAmrithaGhati,
  getDivaGhati,
  getSankrantiGataDina,
  getDetailedTithiInfo,
  TITHIS_5L,
  type DetailedTithiInfo
} from "./VedicCalculations";
import { vedicWeekdayAtBirth } from "./birthSunTimes";
import { panchangClockTimeZone, weekdayInTimeZone } from "./placeTime";
import { ghatiVighatiSinceSunrise } from "./ghatiVighati";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { resolvePincodeCoordinatesSync } from "../services/locationApi";


export interface TraditionalBaggonaPanchanga {
  shakaYear: number;
  samvatsara: string;
  samvatsaraKn: string;
  samvatsara5L?: Record<string, string>;
  masa: string;
  masaKn: string;
  masa5L?: Record<string, string>;
  paksha: string;
  pakshaKn: string;
  paksha5L?: Record<string, string>;
  tithi: string;
  tithiKn: string;
  tithi5L?: Record<string, string>;
  tithiGhati: number;
  tithiVighati: number;
  weekday: string;
  weekdayKn: string;
  weekday5L?: Record<string, string>;
  weekdayIndex: number;
  sunNakshatra: string;
  sunNakshatraKn: string;
  sunNakshatra5L?: Record<string, string>;
  sunNakshatraGhati: number;
  sunNakshatraVighati: number;
  moonNakshatra: string;
  moonNakshatraKn: string;
  moonNakshatra5L?: Record<string, string>;
  moonNakshatraGhati: number;
  moonNakshatraVighati: number;
  yoga: string;
  yogaKn: string;
  yoga5L?: Record<string, string>;
  yogaGhati: number;
  yogaVighati: number;
  karana: string;
  karanaKn: string;
  karana5L?: Record<string, string>;
  karanaGhati: number;
  karanaVighati: number;
  vishaGhati: { ghati: number; vighati: number };
  amrithaGhati: { ghati: number; vighati: number };
  divaGhati: { ghati: number; vighati: number };
  nisheGhati?: { ghati: number; vighati: number };
  sankrantiSign: string;
  sankrantiSignKn: string;
  sankrantiSign5L?: Record<string, string>;
  sankrantiGataDina: number;
  paramaGhati: { ghati: number; vighati: number };
  ashayaGhati: { ghati: number; vighati: number };
  ghatadina: { ghati: number; vighati: number };
  suryodhayadgata: { ghati: number; vighati: number };
  sunrise: string;
  sunset: string;
  dashaLord?: string;
  dashaYears?: number;
  dashaMonths?: number;
  dashaDays?: number;
  tithiEndTime?: string;
  tithiStartTime?: string;
  tithiNext?: string;
  tithiNextKn?: string;
  tithiNextStartTime?: string;
  tithiNextEndTime?: string;
  majorityTithi?: string;
  majorityTithiKn?: string;
  detailedTithi?: DetailedTithiInfo;
  hora?: string;
  horaKn?: string;
  hora5L?: Record<string, string>;
  horaLord?: string;
  horaNumber?: number;
}

const TITHIS_EN = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const TITHIS_KN = [
  "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
  "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ",
  "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
  "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಅಮಾವಾಸ್ಯೆ"
];

const YOGAS_EN = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const YOGAS_KN = [
  "ವಿಷ್ಕಂಭ", "ಪ್ರೀತಿ", "ಆಯುಷ್ಮಾನ್", "ಸೌಭಾಗ್ಯ", "ಶೋಭನ", "ಅತಿಗಂಡ", "ಸುಕರ್ಮ", "ಧೃತಿ", "ಶೂಲ", "ಗಂಡ",
  "ವೃದ್ಧಿ", "ಧ್ರುವ", "ವ್ಯಾಘಾತ", "ಹರ್ಷಣ", "ವಜ್ರ", "ಸಿದ್ಧಿ", "ವ್ಯತೀಪಾತ", "ವರೀಯಾನ್", "ಪರಿಘ", "ಶಿವ",
  "ಸಿದ್ಧ", "ಸಾಧ್ಯ", "ಶುಭ", "ಶುಕ್ಲ", "ಬ್ರಹ್ಮ", "ಐಂದ್ರ", "ವೈಧೃತಿ"
];

const YOGAS_HI = [
  "विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड",
  "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव",
  "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "ऐन्द्र", "वैधृति"
];

const YOGAS_TE = [
  "విష్కంభ", "ప్రీతి", "ఆయుష్మాన్", "సౌభాగ్య", "శోభన", "అతిగండ", "సుకర్మ", "ధృతి", "శూల", "గండ",
  "వృద్ధి", "ధ్రువ", "వ్యాఘాత", "హర్షణ", "వజ్ర", "సిద్ధి", "వ్యతీపాత", "వరీయాన్", "పరిఘ", "శివ",
  "సిద్ధ", "సాధ్య", "శుభ", "శుక్ల", "బ్రహ్మ", "ఐంద్ర", "వైధృతి"
];

const YOGAS_TA = [
  "விஷ்கம்பம்", "ப்ரீதி", "ஆயுஷ்மான்", "ஸௌபாக்யம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்", "த்ருதி", "சூலம்", "கண்டம்",
  "வ்ருத்தி", "த்ருவம்", "வ்யாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி", "வ்யதீபாதம்", "வரீயான்", "பரிகம்", "சிவம்",
  "சித்தம்", "சாத்யம்", "சுபம்", "சுக்லம்", "ப்ரம்மம்", "ஐந்த்ரம்", "வைத்ருதி"
];

const KARANAS_EN = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kintughna"
];

const KARANAS_KN = [
  "ಬವ", "ಬಾಲವ", "ಕೌಲವ", "ತೈತಿಲ", "ಗರಜ", "ವಣಿಜ", "ಭದ್ರೆ",
  "ಶಕುನಿ", "ಚತುಷ್ಪಾದ", "ನಾಗ", "ಕಿಂಸ್ತುಘ್ನ"
];

const KARANAS_HI = [
  "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि",
  "शकुनि", "चतुष्पाद", "नाग", "किंस्तुघ्न"
];

const KARANAS_TE = [
  "బవ", "బాలవ", "కౌలవ", "తైతిల", "గరజి", "వణిజ", "భద్ర",
  "శకుని", "చతుష్పాద", "నాగ", "కింస్తుఘ్న"
];

const KARANAS_TA = [
  "பவம்", "பாலவம்", "கௌலவம்", "தைதிலம்", "கரசை", "வணிசை", "பத்திரை",
  "சகுனி", "சதுஷ்பாதம்", "நாகம்", "கிம்ஸ்துக்னம்"
];

const NAKSHATRAS_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRAS_KN = [
  "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರಾ", "ಆರಿದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ",
  "ಮಖಾ", "ಪುಬ್ಬಾ", "ಉತ್ತರಾ", "ಹಸ್ತಾ", "ಚಿತ್ತಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲಾ", "ಪೂರ್ವಾಷಾಢಾ", "ಉತ್ತರಾಷಾಢಾ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ", "ಪೂರ್ವಾಭಾದ್ರಾ", "ಉತ್ತರಾಭಾದ್ರಾ", "ರೇವತಿ"
];

const NAKSHATRAS_HI = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
  "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"
];

const NAKSHATRAS_TE = [
  "అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆరుద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష",
  "మఘ", "పూర్వ ఫల్గుణి", "ఉత్తర ఫల్గుణి", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ",
  "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"
];

const NAKSHATRAS_TA = [
  "அஸ்வினி", "பரணி", "கிருத்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்",
  "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

const RASHIS_EN = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
];

const RASHIS_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

const RASHIS_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
];

const RASHIS_TE = [
  "మేష", "వృషభ", "మిథున", "కర్కాటక", "సింహ", "కన్య", "తులా", "వృశ్చిక", "ధనుస్సు", "మకర", "కుంభ", "మీన"
];

const RASHIS_TA = [
  "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
];

const WEEKDAYS_EN = [
  "Aditya Vaasare", "Chandra Vaasare", "Bhauma Vaasare", "Saumya Vaasare", "Guru Vaasare", "Bhrigu Vaasare", "Sthira Vaasare"
];

const WEEKDAYS_KN = [
  "ಆದಿತ್ಯ ವಾಸರೇ", "ಚಂದ್ರ ವಾಸರೇ", "ಭೌಮ ವಾಸರೇ", "ಸೌಮ್ಯ ವಾಸರೇ", "ಗುರು ವಾಸರೇ", "ಭೃಗು ವಾಸರೇ", "ಸ್ಥಿರ ವಾಸರೇ"
];

const WEEKDAYS_HI = [
  "आदित्य वासरे", "चन्द्र वासरे", "भौम वासरे", "सौम्य वासरे", "गुरु वासरे", "भृगु वासरे", "स्थिर वासरे"
];

const WEEKDAYS_TE = [
  "ఆదిత్య వాసరే", "చంద్ర వాసరే", "భౌమ వాసరే", "సౌమ్య వాసరే", "గురు వాసరే", "భృగు వాసరే", "స్థిర వాసరే"
];

const WEEKDAYS_TA = [
  "ஆதித்ய வாசரே", "சந்திர வாசரே", "பௌம வாசரே", "ஸௌம்ய வாசரே", "குரு வாசரே", "ப்ருகோ வாசரே", "ஸ்திர வாசரே"
];

export function calculateTraditionalBaggona(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  ayanamsaModel: AyanamsaModel = "lahiri",
  pincode = ""
): TraditionalBaggonaPanchanga {
  let effectivePin = (pincode || "").trim();
  let lat = latitude;
  let lng = longitude;

  // Authentic resolution: Gokarna 581326 or user pincode
  if (
    effectivePin === "581326" ||
    (!lat && !lng) ||
    (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) ||
    !isFinite(lat) ||
    !isFinite(lng)
  ) {
    if (effectivePin && effectivePin !== "581326" && /^\d{6}$/.test(effectivePin)) {
      const resolved = resolvePincodeCoordinatesSync(effectivePin, 14.5479, 74.3188);
      lat = resolved.lat;
      lng = resolved.lng;
    } else {
      lat = 14.5479;
      lng = 74.3188;
      if (!effectivePin) effectivePin = "581326";
    }
  }

  // Generic dynamic calculation for any other date/location
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lng, effectivePin);
  if (isNaN(birthUtc.getTime())) {
    return null as any; // Fail fast if Invalid Date
  }
  let noonUtc = wallClockBirthToUtc(birthDate, "12:00", lat, lng, effectivePin);
  let scTimes = SunCalc.getTimes(noonUtc, lat, lng);
  let jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, lat, lng, effectivePin);
  let sunriseUtc = jyotish.sunrise && !isNaN(jyotish.sunrise.getTime()) ? jyotish.sunrise : new Date(noonUtc.getTime() - 6 * 60 * 60 * 1000);
  let sunsetUtc = jyotish.sunset && !isNaN(jyotish.sunset.getTime()) ? jyotish.sunset : new Date(noonUtc.getTime() + 6 * 60 * 60 * 1000);

  // If birth is before sunrise on the calendar date, use the previous day's sunrise/sunset as baseline
  if (birthUtc.getTime() < sunriseUtc.getTime()) {
    const prevDayUtc = new Date(noonUtc.getTime() - 24 * 60 * 60 * 1000);
    scTimes = SunCalc.getTimes(prevDayUtc, lat, lng);
    jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, lat, lng, effectivePin);
    if (jyotish.sunrise && !isNaN(jyotish.sunrise.getTime())) sunriseUtc = jyotish.sunrise;
    if (jyotish.sunset && !isNaN(jyotish.sunset.getTime())) sunsetUtc = jyotish.sunset;
  }



  const getFormatTime = (d: Date): string => {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });
  };

  const getEndGhati = (endTime: Date): { ghati: number; vighati: number } => {
    const ms = endTime.getTime() - sunriseUtc.getTime();
    const totalVighati = Math.floor(ms / 24_000);
    return {
      ghati: Math.max(0, Math.floor(totalVighati / 60)),
      vighati: Math.max(0, totalVighati % 60)
    };
  };

  // Find longitudes at sunrise for the day's Panchanga elements
  const longsSunrise = siderealLongitudes(sunriseUtc, ayanamsaModel, "mean");
  const moonSunrise = normalizeDegree(longsSunrise.moon);
  const sunSunrise = normalizeDegree(longsSunrise.sun);
  const sunTithiSunrise = normalizeDegree(longsSunrise.sunTithi ?? longsSunrise.sun);
  const sunYogaSunrise = normalizeDegree(longsSunrise.sunYoga ?? longsSunrise.sun);

  // Sum for Yoga:
  const sumSunrise = normalizeDegree(moonSunrise + sunYogaSunrise);
  // Difference for Tithi:
  const elongationSunrise = normalizeDegree(moonSunrise - sunTithiSunrise);

  let tithiEnd = getTithiEnd(sunriseUtc, ayanamsaModel);
  let tEnd = getEndGhati(tithiEnd);
  let tithiIdx = Math.floor(elongationSunrise / 12) % 30;

  const tithi = TITHIS_EN[tithiIdx] ?? "";
  const tithiKn = TITHIS_KN[tithiIdx] ?? "";
  const paksha = tithiIdx < 15 ? "Shukla" : "Krishna";
  const pakshaKn = tithiIdx < 15 ? "ಶುಕ್ಲ" : "ಕೃಷ್ಣ";

  const tz = panchangClockTimeZone(latitude, longitude, pincode);
  const wdIdx = weekdayInTimeZone(noonUtc, tz);
  const weekday = WEEKDAYS_EN[wdIdx] ?? "";
  const weekdayKn = WEEKDAYS_KN[wdIdx] ?? "";

  const sunNakIdx = Math.floor(sunSunrise / (360 / 27)) % 27;
  const sunNakshatra = NAKSHATRAS_EN[sunNakIdx] ?? "";
  const sunNakshatraKn = NAKSHATRAS_KN[sunNakIdx] ?? "";

  let moonNakIdx = Math.floor(moonSunrise / (360 / 27)) % 27;
  let nakshatraEnd = getNakshatraEnd(sunriseUtc, ayanamsaModel);
  let mEnd = getEndGhati(nakshatraEnd);
  
  const moonNakshatra = NAKSHATRAS_EN[moonNakIdx] ?? "";
  const moonNakshatraKn = NAKSHATRAS_KN[moonNakIdx] ?? "";

  let karanaEnd = getKaranaEnd(sunriseUtc, ayanamsaModel);
  let kEnd = getEndGhati(karanaEnd);

  let halfTithiIdxSunrise = Math.floor(elongationSunrise / 6) % 60;
  let karanaIdx = 0;
  if (halfTithiIdxSunrise === 0) karanaIdx = 10;
  else if (halfTithiIdxSunrise >= 1 && halfTithiIdxSunrise <= 56) karanaIdx = (halfTithiIdxSunrise - 1) % 7;
  else if (halfTithiIdxSunrise === 57) karanaIdx = 7;
  else if (halfTithiIdxSunrise === 58) karanaIdx = 8;
  else karanaIdx = 9;

  const karana = KARANAS_EN[karanaIdx] ?? "";
  const karanaKn = KARANAS_KN[karanaIdx] ?? "";

  let yogaEnd = getYogaEnd(sunriseUtc, ayanamsaModel);
  let yEnd = getEndGhati(yogaEnd);
  
  let yogaIdx = Math.floor(sumSunrise / (360 / 27)) % 27;
  
  const yoga = YOGAS_EN[yogaIdx] ?? "";
  const yogaKn = YOGAS_KN[yogaIdx] ?? "";

  const sunNakshatraEnd = getSunNakshatraEnd(sunriseUtc, ayanamsaModel);

  const nakLength = 360 / 27;
  const sunNakStart = Math.floor(sunSunrise / nakLength) * nakLength;
  const sunNakPassed = sunSunrise - sunNakStart;
  const passedGhati = (sunNakPassed * 60) / nakLength;
  const sEnd = {
    ghati: Math.floor(passedGhati),
    vighati: Math.floor((passedGhati - Math.floor(passedGhati)) * 60)
  };

  const { vishaGhati, amrithaGhati } = getVishaAndAmrithaGhati(birthUtc, ayanamsaModel, sunriseUtc) ?? { vishaGhati: { ghati: 0, vighati: 0 }, amrithaGhati: { ghati: 0, vighati: 0 } };
  const divaGhatiVal = getDivaGhati(sunriseUtc, sunsetUtc);

  const sunLong = normalizeDegree(siderealLongitudes(birthUtc, ayanamsaModel).sun);
  const sunRashiIdx = degreeToRashi(sunLong).index;
  const sankrantiSign = RASHIS_EN[sunRashiIdx] ?? "";
  const sankrantiSignKn = RASHIS_KN[sunRashiIdx] ?? "";
  const sankrantiGataDina = getSankrantiGataDina(birthUtc, ayanamsaModel, latitude, longitude);

  const ghatiSinceSunrise = ghatiVighatiSinceSunrise(birthUtc, sunriseUtc);

  // Parama Ghati, Ashaya Ghati, Ghatadina dynamic calculations based on Moon Nakshatra boundaries
  const nakStart = getNakshatraStart(birthUtc, ayanamsaModel);
  const nakEnd = getNakshatraEnd(birthUtc, ayanamsaModel);

  const durationMs = nakEnd.getTime() - nakStart.getTime();
  const elapsedMs = birthUtc.getTime() - nakStart.getTime();
  const remainingMs = nakEnd.getTime() - birthUtc.getTime();

  const toGhatiVighati = (ms: number) => {
    const totalVighati = Math.floor(ms / 24_000);
    return {
      ghati: Math.floor(totalVighati / 60),
      vighati: totalVighati % 60
    };
  };

  const paramaGhati = toGhatiVighati(durationMs);
  const ashayaGhati = toGhatiVighati(remainingMs);
  const ghatadina = toGhatiVighati(elapsedMs);

  const { monthIndex, isAdhika, samvatsaraIndex, shakaYear } = getLunarMonthAndYear(birthUtc, ayanamsaModel);
  const samvatsara = getLocalizedSamvatsara("en", samvatsaraIndex);
  const samvatsaraKn = getLocalizedSamvatsara("kn", samvatsaraIndex);
  const samvatsara5L: Record<string, string> = {
    en: getLocalizedSamvatsara("en", samvatsaraIndex),
    kn: getLocalizedSamvatsara("kn", samvatsaraIndex),
    hi: getLocalizedSamvatsara("hi", samvatsaraIndex),
    te: getLocalizedSamvatsara("te", samvatsaraIndex),
    ta: getLocalizedSamvatsara("ta", samvatsaraIndex),
  };

  const masa = getLocalizedMasa("en", monthIndex, isAdhika);
  const masaKn = getLocalizedMasa("kn", monthIndex, isAdhika);
  const masa5L: Record<string, string> = {
    en: getLocalizedMasa("en", monthIndex, isAdhika),
    kn: getLocalizedMasa("kn", monthIndex, isAdhika),
    hi: getLocalizedMasa("hi", monthIndex, isAdhika),
    te: getLocalizedMasa("te", monthIndex, isAdhika),
    ta: getLocalizedMasa("ta", monthIndex, isAdhika),
  };

  const paksha5L: Record<string, string> = {
    en: paksha,
    kn: pakshaKn,
    hi: tithiIdx < 15 ? "शुक्ल" : "कृष्ण",
    te: tithiIdx < 15 ? "శుక్ల" : "కృష్ణ",
    ta: tithiIdx < 15 ? "சுக்ல" : "கிருஷ்ண"
  };

  const tithi5L: Record<string, string> = {
    en: tithi,
    kn: tithiKn,
    hi: TITHIS_5L.hi?.[tithiIdx] ?? tithi,
    te: TITHIS_5L.te?.[tithiIdx] ?? tithi,
    ta: TITHIS_5L.ta?.[tithiIdx] ?? tithi
  };

  const weekday5L: Record<string, string> = {
    en: weekday,
    kn: weekdayKn,
    hi: WEEKDAYS_HI[wdIdx] ?? weekday,
    te: WEEKDAYS_TE[wdIdx] ?? weekday,
    ta: WEEKDAYS_TA[wdIdx] ?? weekday
  };

  const sunNakshatra5L: Record<string, string> = {
    en: sunNakshatra,
    kn: sunNakshatraKn,
    hi: NAKSHATRAS_HI[sunNakIdx] ?? sunNakshatra,
    te: NAKSHATRAS_TE[sunNakIdx] ?? sunNakshatra,
    ta: NAKSHATRAS_TA[sunNakIdx] ?? sunNakshatra
  };

  const moonNakshatra5L: Record<string, string> = {
    en: moonNakshatra,
    kn: moonNakshatraKn,
    hi: NAKSHATRAS_HI[moonNakIdx] ?? moonNakshatra,
    te: NAKSHATRAS_TE[moonNakIdx] ?? moonNakshatra,
    ta: NAKSHATRAS_TA[moonNakIdx] ?? moonNakshatra
  };

  const yoga5L: Record<string, string> = {
    en: yoga,
    kn: yogaKn,
    hi: YOGAS_HI[yogaIdx] ?? yoga,
    te: YOGAS_TE[yogaIdx] ?? yoga,
    ta: YOGAS_TA[yogaIdx] ?? yoga
  };

  const karana5L: Record<string, string> = {
    en: karana,
    kn: karanaKn,
    hi: KARANAS_HI[karanaIdx] ?? karana,
    te: KARANAS_TE[karanaIdx] ?? karana,
    ta: KARANAS_TA[karanaIdx] ?? karana
  };

  const sankrantiSign5L: Record<string, string> = {
    en: sankrantiSign,
    kn: sankrantiSignKn,
    hi: RASHIS_HI[sunRashiIdx] ?? sankrantiSign,
    te: RASHIS_TE[sunRashiIdx] ?? sankrantiSign,
    ta: RASHIS_TA[sunRashiIdx] ?? sankrantiSign
  };

  const dayVighatis = divaGhatiVal.ghati * 60 + divaGhatiVal.vighati;
  const nightVighatis = Math.max(0, 3600 - dayVighatis);
  const nisheGhati = {
    ghati: Math.floor(nightVighatis / 60),
    vighati: nightVighatis % 60
  };

  // Dynamic Dasha Balance at birth calculation:
  const NAK_SPAN = 360 / 27;
  const dashaOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const dashaYearsMap: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };

  const moonLongBirth = normalizeDegree(siderealLongitudes(birthUtc, ayanamsaModel).moon);
  let nakIdxBirth = Math.floor(moonLongBirth / NAK_SPAN);
  if (nakIdxBirth > 26) nakIdxBirth = 26;
  const nakStartBirth = nakIdxBirth * NAK_SPAN;
  const degInNakBirth = normalizeDegree(moonLongBirth - nakStartBirth);
  const fraction = Math.min(1, Math.max(0, degInNakBirth / NAK_SPAN));

  const startLordIdx = nakIdxBirth % dashaOrder.length;
  const dashaLord = dashaOrder[startLordIdx]!;
  const totalYears = dashaYearsMap[dashaLord]!;
  const elapsedYears = fraction * totalYears;
  const balanceYears = Math.max(0, totalYears - elapsedYears);

  const totalDays = Math.floor(balanceYears * 360 + 1e-9);
  const dashaYears = Math.floor(totalDays / 360);
  const r1 = totalDays % 360;
  const dashaMonths = Math.floor(r1 / 30);
  const dashaDays = r1 % 30;

  const detailedTithi = getDetailedTithiInfo(birthUtc, ayanamsaModel, sunriseUtc);
  const tithiEndTime = detailedTithi.tithiEndTimeStr;
  const tithiStartTime = detailedTithi.tithiStartTimeStr;
  const nextTithiIdx = detailedTithi.nextTithiIdx;
  const tithiNext = detailedTithi.nextTithiName.en;
  const tithiNextKn = detailedTithi.nextTithiName.kn;
  const tithiNextStartTime = detailedTithi.nextTithiStartTimeStr;
  const tithiNextEndTime = detailedTithi.nextTithiEndTimeStr;
  const majorityTithi = detailedTithi.majorityTithiName.en;
  const majorityTithiKn = detailedTithi.majorityTithiName.kn;

  // Calculation of Janma Hora (Birth Planetary Hour)
  const WEEKDAY_HORA_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const CHALDEAN_HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

  let horaIndex = 0;
  const birthMs = birthUtc.getTime();
  const srMs = sunriseUtc.getTime();
  const ssMs = sunsetUtc.getTime();

  if (birthMs >= srMs && birthMs < ssMs) {
    const dayDuration = Math.max(1, ssMs - srMs);
    const elapsed = Math.max(0, birthMs - srMs);
    horaIndex = Math.min(11, Math.floor((elapsed / dayDuration) * 12));
  } else {
    let nextSunriseMs = srMs + 24 * 3600 * 1000;
    if (scTimes && scTimes.sunrise) {
      const nextDayUtc = new Date(noonUtc.getTime() + 24 * 60 * 60 * 1000);
      const scNext = SunCalc.getTimes(nextDayUtc, latitude, longitude);
      const jyotishNext = resolveSunTimesForJyotish({ sunrise: scNext.sunrise, sunset: scNext.sunset }, latitude, longitude, effectivePin);
      if (jyotishNext.sunrise && !isNaN(jyotishNext.sunrise.getTime())) {
        nextSunriseMs = jyotishNext.sunrise.getTime();
      }
    }
    const nightDuration = Math.max(1, nextSunriseMs - ssMs);
    let elapsed = 0;
    if (birthMs >= ssMs) {
      elapsed = birthMs - ssMs;
    } else {
      elapsed = Math.max(0, birthMs - (ssMs - 24 * 3600 * 1000));
    }
    horaIndex = 12 + Math.min(11, Math.floor((elapsed / nightDuration) * 12));
  }

  const dayLord = WEEKDAY_HORA_LORDS[wdIdx] || "Sun";
  const chaldeanStartIdx = CHALDEAN_HORA_ORDER.indexOf(dayLord);
  const currentChaldeanIdx = (chaldeanStartIdx + horaIndex) % 7;
  const horaLord = CHALDEAN_HORA_ORDER[currentChaldeanIdx] || "Jupiter";

  const HORA_MAP_5L: Record<string, { en: string; kn: string; hi: string; te: string; ta: string }> = {
    Sun: { en: "Sun Hora", kn: "ರವಿ ಹೋರೆ", hi: "सूर्य होरा", te: "సూర్య హోర", ta: "சூரிய ஓரை" },
    Moon: { en: "Moon Hora", kn: "ಚಂದ್ರ ಹೋರೆ", hi: "चन्द्र होरा", te: "చంద్ర హోర", ta: "சந்திர ஓரை" },
    Mars: { en: "Mars Hora", kn: "ಕುಜ ಹೋರೆ", hi: "मंगल होरा", te: "కుజ హోర", ta: "செவ்வாய் ஓரை" },
    Mercury: { en: "Mercury Hora", kn: "ಬುಧ ಹೋರೆ", hi: "बुध होरा", te: "ಬುಧ హోర", ta: "புதன் ஓரை" },
    Jupiter: { en: "Jupiter Hora", kn: "ಗುರು ಹೋರೆ", hi: "गुरु होरा", te: "గురు హోర", ta: "குரு ஓரை" },
    Venus: { en: "Venus Hora", kn: "ಶುಕ್ರ ಹೋರೆ", hi: "शुक्र होरा", te: "శుక్ర హోర", ta: "சுக்கிர ஓரை" },
    Saturn: { en: "Saturn Hora", kn: "ಶನಿ ಹೋರೆ", hi: "शनि होरा", te: "శని హోర", ta: "சனி ஓரை" }
  };

  const hora5L = HORA_MAP_5L[horaLord] || HORA_MAP_5L.Sun!;
  const hora = hora5L.en;
  const horaKn = hora5L.kn;
  const horaNumber = horaIndex + 1;

  return {
    shakaYear,
    samvatsara,
    samvatsaraKn,
    samvatsara5L,
    masa,
    masaKn,
    masa5L,
    paksha,
    pakshaKn,
    paksha5L,
    tithi,
    tithiKn,
    tithi5L,
    tithiGhati: tEnd.ghati,
    tithiVighati: tEnd.vighati,
    weekday,
    weekdayKn,
    weekday5L,
    weekdayIndex: wdIdx,
    sunNakshatra,
    sunNakshatraKn,
    sunNakshatra5L,
    sunNakshatraGhati: sEnd.ghati,
    sunNakshatraVighati: sEnd.vighati,
    moonNakshatra,
    moonNakshatraKn,
    moonNakshatra5L,
    moonNakshatraGhati: mEnd.ghati,
    moonNakshatraVighati: mEnd.vighati,
    yoga,
    yogaKn,
    yoga5L,
    yogaGhati: yEnd.ghati,
    yogaVighati: yEnd.vighati,
    karana,
    karanaKn,
    karana5L,
    karanaGhati: kEnd.ghati,
    karanaVighati: kEnd.vighati,
    vishaGhati,
    amrithaGhati,
    divaGhati: divaGhatiVal,
    nisheGhati,
    sankrantiSign,
    sankrantiSignKn,
    sankrantiSign5L,
    sankrantiGataDina,
    paramaGhati,
    ashayaGhati,
    ghatadina,
    suryodhayadgata: ghatiSinceSunrise,
    sunrise: getFormatTime(sunriseUtc),
    sunset: getFormatTime(sunsetUtc),
    dashaLord,
    dashaYears,
    dashaMonths,
    dashaDays,
    tithiEndTime,
    tithiStartTime,
    tithiNext,
    tithiNextKn,
    tithiNextStartTime,
    tithiNextEndTime,
    majorityTithi,
    majorityTithiKn,
    detailedTithi,
    hora,
    horaKn,
    hora5L,
    horaLord,
    horaNumber
  };
}
