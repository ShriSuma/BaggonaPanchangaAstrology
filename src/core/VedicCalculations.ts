import * as Astronomy from "astronomy-engine";
import { degreeToRashi, normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import type { AyanamsaModel } from "./AstroTypes";

// Names of 60 Samvatsaras (Jovian cycle years)
export const KN_SAMVATSARAS = [
  "ಪ್ರಭವ", "ವಿಭವ", "ಶುಕ್ಲ", "ಪ್ರಮೋದೂತ", "ಪ್ರಜೋತ್ಪತ್ತಿ", "ಆಂಗೀರಸ", "ಶ್ರೀಮುಖ", "ಭಾವ", "ಯುವ", "ಧಾತೃ",
  "ಈಶ್ವರ", "ಬಹುಧಾನ್ಯ", "ಪ್ರಮಾಥಿ", "ವಿಕ್ರಮ", "ವೃಷ", "ಚಿತ್ರಭಾನು", "ಸ್ವಭಾನು", "ತಾರಣ", "ಪಾರ್ಥಿವ", "ವ್ಯಯ",
  "ಸರ್ವಜಿತ್", "ಸರ್ವಧಾರಿ", "ವಿರೋಧಿ", "ವಿಕೃತಿ", "ಖರ", "ನಂದನ", "ವಿಜಯ", "ಜಯ", "ಮನ್ಮಥ", "ದುರ್ಮುಖಿ",
  "ಹೇವಿಳಂಬಿ", "ವಿಳಂಬಿ", "ವಿಕಾರಿ", "ಶಾರ್ವರಿ", "ಪ್ಲವ", "ಶುಭಕೃತ್", "ಶೋಭಕೃತ್", "ಕ್ರೋಧಿ", "ವಿಶ್ವಾವಸು", "ಪರಾಭವ",
  "ಪ್ಲವಂಗ", "ಕೀಲಕ", "ಸೌಮ್ಯ", "ಸಾಧಾರಣ", "ವಿರೋಧಿಕೃತ್", "ಪರಿದಾವಿ", "ಪ್ರಮಾದೀಚ", "ಆನಂದ", "ರಾಕ್ಷಸ", "ನಳ",
  "ಪಿಂಗಳ", "ಕಾಲಯುಕ್ತಿ", "ಸಿದ್ಧಾರ್ಥಿ", "ರೌದ್ರಿ", "ದುರ್ಮತಿ", "ದುಂದುಭಿ", "ರುಧಿರೋದ್ಗಾರಿ", "ರಕ್ತಾಕ್ಷಿ", "ಕ್ರೋಧನ", "ಅಕ್ಷಯ"
];

export const EN_SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajopathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri",
  "Eeshvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrusha", "Chitrabanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajitu", "Sarvadhari", "Virodhi", "Vikruthi", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrutu", "Shobhakrutu", "Krodhi", "Viswavasu", "Parabhava",
  "Plavanga", "Keelaka", "Saumya", "Sadharana", "Virodhikrutu", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Anala",
  "Pingala", "Kalayukti", "Siddharthru", "Raudri", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
];

export const HI_SAMVATSARAS = [
  "प्रभव", "विभव", "शुक्ल", "प्रमोदूत", "प्रजोत्पत्ति", "आंगिरस", "श्रीमुख", "भाव", "युवा", "धाता",
  "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृष", "चित्रभानु", "स्वभानु", "तारण", "पार्थिव", "व्यय",
  "सर्वजित्", "सर्वधारी", "विरोधी", "विकृति", "खर", "नंदन", "विजय", "जय", "मन्मथ", "दुर्मुख",
  "हेविलंबी", "विलंबी", "विकारी", "शार्वरी", "प्लव", "शुभकृत्", "शोभकृत्", "क्रोधी", "विश्वावसु", "पराभव",
  "प्लवंग", "कीलक", "सौम्य", "साधारण", "विरोधकृत्", "परिधावी", "प्रमादी", "आनंद", "राक्षस", "नल",
  "पिंगल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुंदुभी", "रुधिरोद्गारी", "रक्ताक्षी", "क्रोधन", "अक्षय"
];

export const TE_SAMVATSARAS = [
  "ప్రభవ", "విభవ", "శుక్ల", "ప్రమోదూత", "ప్రజోత్పత్తి", "ఆంగీరస", "శ్రీముఖ", "భావ", "యువ", "ధాత",
  "ఈశ్వర", "బహుధాన్య", "ప్రమాథి", "విక్రమ", "వృష", "చిత్రభాను", "స్వభాను", "తారణ", "పార్థివ", "వ్యయ",
  "సర్వజిత్తు", "సర్వధారి", "విరోధి", "వికృతి", "ఖర", "నందన", "విజయ", "జయ", "మన్మథ", "దుర్ముఖి",
  "హేవిళంబి", "విళంబి", "వికారి", "శార్వరి", "ప్లవ", "శుభకృతు", "శోభకృతు", "క్రోధి", "విశ్వావసు", "పరాభవ",
  "ప్లవంగ", "కీలక", "సౌమ్య", "సాధారణ", "విరోధికృతు", "పరీధావి", "ప్రమాదీచ", "ఆనంద", "రాక్షస", "నల",
  "పింగళ", "కాలయుక్తి", "సిద్ధార్థి", "రౌద్రి", "దుర్మతి", "దుందుభి", "రుధిరోద్గారి", "రక్తాక్షి", "క్రోధన", "అక్షయ"
];

export const TA_SAMVATSARAS = [
  "பிரபவ", "விபவ", "சுக்ல", "பிரமோதூத", "பிரஜோத்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பாவ", "யுவ", "தாது",
  "ஈஸ்வர", "பகுதானிய", "பிரமாதி", "விக்ரம", "விஷு", "சித்ரபானு", "சுபானு", "தாரண", "பார்த்திப", "வியய",
  "சர்வஜித்", "சர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துர்முகி",
  "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாவசு", "பராபவ",
  "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதிகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராட்சச", "நள",
  "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்ரி", "துர்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரக்தாட்சி", "குரோதன", "அட்சய"
];

// Names of 12 Lunar Months (Masas)
export const KN_MASAS = [
  "ಚೈತ್ರ", "ವೈಶಾಖ", "ಜ್ಯೇಷ್ಠ", "ಆಷಾಢ", "ಶ್ರಾವಣ", "ಭಾದ್ರಪದ",
  "ಆಶ್ವೀಜ", "ಕಾರ್ತಿಕ", "ಮಾರ್ಗಶಿರ", "ಪುಷ್ಯ", "ಮಾಘ", "ಫಾಲ್ಗುಣ"
];

export const EN_MASAS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwija", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguni"
];

export const HI_MASAS = [
  "चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद",
  "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"
];

export const TE_MASAS = [
  "చైత్ర", "వైశాఖ", "జ్యేష్ఠ", "ఆషాఢ", "శ్రావణ", "భాద్రపద",
  "ఆశ్వయుజ", "కార్తిక", "మార్గశిర", "పుష్య", "మాఘ", "ఫాల్గుణ"
];

export const TA_MASAS = [
  "சைத்ர", "வைசாக", "ஜ்யேஷ்ட", "ஆஷாட", "ச்ராவண", "பாத்ரபத",
  "ஆச்வின", "கார்த்திக", "மார்கசீர்ஷ", "பௌஷ", "மாக", "பால்குன"
];

// Visha Ghati starting points for 27 Nakshatras
export const VISHA_GHATI_START: Record<number, number> = {
  0: 50, 1: 24, 2: 30, 3: 40, 4: 14, 5: 21, 6: 30, 7: 20, 8: 32, 9: 30,
  10: 20, 11: 18, 12: 21, 13: 20, 14: 14, 15: 14, 16: 10, 17: 14, 18: 20, 19: 24,
  20: 20, 21: 10, 22: 10, 23: 18, 24: 16, 25: 24, 26: 30
};

export const AMRITHA_GHATI_START: Record<number, number> = {
  0: 42, 1: 48, 2: 54, 3: 52, 4: 38, 5: 35, 6: 54, 7: 44, 8: 56, 9: 54,
  10: 44, 11: 42, 12: 45, 13: 44, 14: 38, 15: 38, 16: 34, 17: 38, 18: 44, 19: 48,
  20: 44, 21: 34, 22: 34, 23: 42, 24: 40, 25: 48, 26: 54
};

export const isAngleBetween = (target: number, a: number, b: number): boolean => {
  const t = normalizeDegree(target);
  const x = normalizeDegree(a);
  const y = normalizeDegree(b);
  if (x <= y) {
    return t >= x && t <= y;
  } else {
    return t >= x || t <= y;
  }
};

const findCrossingTime = (
  t1: Date,
  t2: Date,
  target: number,
  getLong: (d: Date) => number
): Date => {
  let low = t1.getTime();
  let high = t2.getTime();
  const tgt = normalizeDegree(target);
  for (let iter = 0; iter < 12; iter++) {
    const mid = (low + high) / 2;
    const l = normalizeDegree(getLong(new Date(mid)));
    const lowL = normalizeDegree(getLong(new Date(low)));
    if (isAngleBetween(tgt, lowL, l)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return new Date((low + high) / 2);
};

export const findBoundaryCrossing = (
  birthUtc: Date,
  model: AyanamsaModel,
  getLong: (d: Date) => number,
  targetDivisor: number,
  searchForward: boolean
): Date => {
  const birthLong = getLong(birthUtc);
  const currIdx = Math.floor(birthLong / targetDivisor);
  const targetDeg = searchForward
    ? ((currIdx + 1) * targetDivisor) % 360
    : (currIdx * targetDivisor) % 360;
  
  const step = 1.0 * 60 * 60 * 1000; // 1 hour step
  let current = birthUtc;
  let prevLong = birthLong;
  for (let i = 0; i < 30; i++) {
    const nextTime = new Date(current.getTime() + (searchForward ? step : -step));
    const nextLong = getLong(nextTime);
    const startL = searchForward ? prevLong : nextLong;
    const endL = searchForward ? nextLong : prevLong;
    if (isAngleBetween(targetDeg, startL, endL)) {
      return searchForward
        ? findCrossingTime(current, nextTime, targetDeg, getLong)
        : findCrossingTime(nextTime, current, targetDeg, getLong);
    }
    prevLong = nextLong;
    current = nextTime;
  }
  return birthUtc;
};

export const getNakshatraEnd = (birthUtc: Date, model: AyanamsaModel): Date => {
  return findBoundaryCrossing(birthUtc, model, (d) => siderealLongitudes(d, model, "mean").moon, 360 / 27, true);
};

export const getNakshatraStart = (birthUtc: Date, model: AyanamsaModel): Date => {
  return findBoundaryCrossing(birthUtc, model, (d) => siderealLongitudes(d, model, "mean").moon, 360 / 27, false);
};

export const getTithiStart = (birthUtc: Date, model: AyanamsaModel): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean");
      return normalizeDegree(l.moon - (l.sunTithi ?? l.sun));
    },
    12,
    false
  );
};

export const getTithiEnd = (birthUtc: Date, model: AyanamsaModel): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean");
      return normalizeDegree(l.moon - (l.sunTithi ?? l.sun));
    },
    12,
    true
  );
};

export const getYogaEnd = (birthUtc: Date, model: AyanamsaModel): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean");
      return normalizeDegree(l.moon + (l.sunYoga ?? l.sun));
    },
    360 / 27,
    true
  );
};

export const getKaranaEnd = (birthUtc: Date, model: AyanamsaModel): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean");
      return normalizeDegree(l.moon - (l.sunTithi ?? l.sun));
    },
    6,
    true
  );
};

export const getSunNakshatraEnd = (birthUtc: Date, model: AyanamsaModel): Date => {
  const getLong = (d: Date) => siderealLongitudes(d, model, "mean").sun;
  return findBoundaryCrossing(birthUtc, model, getLong, 360 / 27, true);
};

// Returns previous and next new moons relative to a date
export const getNewMoonsAround = (date: Date): { previous: Date; next: Date } => {
  const prev = Astronomy.SearchMoonPhase(0, date, -40);
  const next = Astronomy.SearchMoonPhase(0, date, 40);
  if (!prev || !next) {
    throw new Error("Unable to search moon phases around the given date");
  }
  return { previous: prev.date, next: next.date };
};

// Computes the Lunar month and Jovian year cycle index
export const getLunarMonthAndYear = (
  birthUtc: Date,
  model: AyanamsaModel
): { monthIndex: number; isAdhika: boolean; samvatsaraIndex: number; shakaYear: number } => {
  const { previous: prevNewMoon, next: nextNewMoon } = getNewMoonsAround(birthUtc);
  
  // Rashi of Sun at previous and next new moon
  const prevSunDeg = siderealLongitudes(prevNewMoon, model).sun;
  const nextSunDeg = siderealLongitudes(nextNewMoon, model).sun;
  
  const prevSunRashi = degreeToRashi(prevSunDeg).index;
  const nextSunRashi = degreeToRashi(nextSunDeg).index;
  
  const isAdhika = prevSunRashi === nextSunRashi;
  const monthIndex = (prevSunRashi + 1) % 12;
  
  const gYear = birthUtc.getFullYear();
  let shakaYear = gYear - 78;
  let samvatsaraIndex = (gYear - 1987 + 60) % 60;
  
  // If birth is before Chaitra Shukla Pratipada of the birth year:
  // Chaitra Shukla Pratipada is monthIndex === 0 (Chaitra) in Shukla Paksha.
  // The year changes at monthIndex = 0.
  // So if monthIndex is Phalguni (11), or if it is Chaitra (0) but still Krishna Paksha:
  // We check the Paksha of the birth time:
  const birthSun = siderealLongitudes(birthUtc, model).sun;
  const birthMoon = siderealLongitudes(birthUtc, model).moon;
  const tithiAngle = normalizeDegree(birthMoon - birthSun);
  const tithiIdx = Math.floor(tithiAngle / 12) % 30;
  const isKrishna = tithiIdx >= 15;
  
  const isBeforeNewYear = (monthIndex === 11) || (monthIndex === 0 && isKrishna);
  if (isBeforeNewYear) {
    shakaYear -= 1;
    samvatsaraIndex = (samvatsaraIndex - 1 + 60) % 60;
  }
  
  return { monthIndex, isAdhika, samvatsaraIndex, shakaYear };
};

export const getLocalizedSamvatsara = (lang: string, index: number): string => {
  const i = ((index % 60) + 60) % 60;
  const base = lang.split("-")[0] ?? lang;
  if (base === "kn") return KN_SAMVATSARAS[i]!;
  if (base === "hi") return HI_SAMVATSARAS[i] || EN_SAMVATSARAS[i]!;
  if (base === "te") return TE_SAMVATSARAS[i] || EN_SAMVATSARAS[i]!;
  if (base === "ta") return TA_SAMVATSARAS[i] || EN_SAMVATSARAS[i]!;
  return EN_SAMVATSARAS[i]!;
};

export const getLocalizedMasa = (lang: string, index: number, isAdhika: boolean): string => {
  const i = ((index % 12) + 12) % 12;
  const base = lang.split("-")[0] ?? lang;
  const prefix = isAdhika 
    ? (base === "kn" ? "ಅಧಿಕ " : base === "hi" ? "अधिक " : base === "te" ? "అధిక " : base === "ta" ? "அதிக " : "Adhika ") 
    : "";
  let name = EN_MASAS[i]!;
  if (base === "kn") name = KN_MASAS[i]!;
  else if (base === "hi") name = HI_MASAS[i]!;
  else if (base === "te") name = TE_MASAS[i]!;
  else if (base === "ta") name = TA_MASAS[i]!;
  return prefix + name;
};

export const getVishaAndAmrithaGhati = (
  birthUtc: Date,
  model: AyanamsaModel,
  sunriseUtc: Date
): {
  vishaGhati: { ghati: number; vighati: number };
  amrithaGhati: { ghati: number; vighati: number };
} => {
  let searchTime = new Date(sunriseUtc.getTime());
  
  let vishaStart: Date | null = null;
  let amrithaStart: Date | null = null;
  
  for (let i = 0; i < 3; i++) {
    // Find Nakshatra ending at or after searchTime
    const end = getNakshatraEnd(searchTime, model);
    // Find start of this Nakshatra
    const start = getNakshatraStart(searchTime, model);
    
    const dur = end.getTime() - start.getTime();
    
    // Identify Nakshatra index for the ending Nakshatra
    const endDeg = siderealLongitudes(end, model, "mean").moon;
    const nakIdx = Math.floor((endDeg - 0.0001) / (360 / 27)) % 27;
    
    let vOffset = VISHA_GHATI_START[nakIdx] ?? 20;
    let aOffset = AMRITHA_GHATI_START[nakIdx] ?? 44;
    
    if (model === "vakya") {
      // Traditional Vakya Panchangas use proportional math to scale the base offset by the Nakshatra's actual duration.
      const durGhatis = dur / 1440000;
      vOffset = vOffset * (durGhatis / 60);
      aOffset = aOffset * (durGhatis / 60);
    }
    
    // Visha/Amritha ghatis are absolute ghatis (1 ghati = 24 minutes = 1440000 ms) from the start of the Nakshatra.
    const vTime = new Date(start.getTime() + vOffset * 1440000);
    const aTime = new Date(start.getTime() + aOffset * 1440000);
    
    if (!vishaStart && vTime.getTime() >= sunriseUtc.getTime()) {
      vishaStart = vTime;
    }
    if (!amrithaStart && aTime.getTime() >= sunriseUtc.getTime()) {
      amrithaStart = aTime;
    }
    
    if (vishaStart && amrithaStart) break;
    
    // Move to next Nakshatra
    searchTime = new Date(end.getTime() + 2 * 60 * 60 * 1000);
  }
  
  const toGhatiVighati = (t: Date) => {
    const ms = Math.max(0, t.getTime() - sunriseUtc.getTime());
    const totalVighati = Math.floor(ms / 24_000);
    return {
      ghati: Math.floor(totalVighati / 60),
      vighati: totalVighati % 60
    };
  };
  
  return {
    vishaGhati: vishaStart ? toGhatiVighati(vishaStart) : { ghati: 0, vighati: 0 },
    amrithaGhati: amrithaStart ? toGhatiVighati(amrithaStart) : { ghati: 0, vighati: 0 }
  };
};

// Diva Ghati (day length in Ghati/Vighati)
export const getDivaGhati = (
  sunriseUtc: Date,
  sunsetUtc: Date
): { ghati: number; vighati: number } => {
  const ms = Math.max(0, sunsetUtc.getTime() - sunriseUtc.getTime());
  const totalVighati = Math.floor(ms / 24_000);
  return {
    ghati: Math.floor(totalVighati / 60) % 60,
    vighati: totalVighati % 60
  };
};

// Sankranti Gata Dina (Calendar days difference since the day of the last Sankranti in the local timezone)
import { inferBirthTimezoneIana } from "./birthTime";
import { calendarYmdInTimeZone } from "./placeTime";

export const getSankrantiGataDina = (
  birthUtc: Date,
  model: AyanamsaModel,
  latitude: number,
  longitude: number
): number => {
  const getSunLong = (d: Date) => normalizeDegree(siderealLongitudes(d, model).sun);
  const sunLong = getSunLong(birthUtc);
  const currIdx = Math.floor(sunLong / 30);
  const targetDeg = currIdx * 30;
  
  // Search backward in 12-hour steps up to 35 days (70 steps)
  const step = 12 * 60 * 60 * 1000;
  let current = birthUtc;
  let prevLong = getSunLong(current);
  let sankrantiTime = birthUtc;
  
  for (let i = 0; i < 70; i++) {
    const nextTime = new Date(current.getTime() - step);
    const nextLong = getSunLong(nextTime);
    
    let crossed = false;
    if (prevLong >= nextLong) {
      crossed = targetDeg >= nextLong && targetDeg <= prevLong;
    } else {
      crossed = targetDeg >= nextLong || targetDeg <= prevLong;
    }
    
    if (crossed) {
      let low = nextTime.getTime();
      let high = current.getTime();
      for (let iter = 0; iter < 15; iter++) {
        const mid = (low + high) / 2;
        const midLong = getSunLong(new Date(mid));
        if (midLong >= targetDeg) {
          high = mid;
        } else {
          low = mid;
        }
      }
      sankrantiTime = new Date((low + high) / 2);
      break;
    }
    prevLong = nextLong;
    current = nextTime;
  }
  
  const tz = inferBirthTimezoneIana(latitude, longitude);
  const sankrantiYmd = calendarYmdInTimeZone(sankrantiTime, tz);
  const birthYmd = calendarYmdInTimeZone(birthUtc, tz);
  
  const sDate = new Date(sankrantiYmd);
  const bDate = new Date(birthYmd);
  const diffDays = Math.round((bDate.getTime() - sDate.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays; // 0-based calendar days passed. In traditional panchang, Sankranti day is day 0, next is day 1, etc.
};

export const TITHIS_5L: Record<string, string[]> = {
  kn: [
    "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಪೂರ್ಣಿಮಾ",
    "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಅಮಾವಾಸ್ಯೆ"
  ],
  en: [
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ],
  hi: [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावस्या"
  ],
  te: [
    "పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి", "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి", "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "పూర్ణిమ",
    "పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి", "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి", "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "అమావాస్య"
  ],
  ta: [
    "பிரதமை", "துவிதியை", "திரிதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்தசி", "பௌர்ணமி",
    "பிரதமை", "துவிதியை", "திரிதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்தசி", "அமாவாசை"
  ]
};

export interface DetailedTithiInfo {
  // Sunrise Tithi
  sunriseTithiIdx: number; // 0..29
  tithiNumber: number; // 1..30
  tithiInPaksha: number; // 1..15
  paksha: "shukla" | "krishna";
  pakshaKn: string;
  tithiName: Record<string, string>;
  tithiFullLabel: Record<string, string>;
  tithiStartTime: Date;
  tithiEndTime: Date;
  tithiStartTimeStr: string; // Formatted IST (e.g. "08:15 PM")
  tithiEndTimeStr: string;   // Formatted IST (e.g. "09:24 PM")
  tithiEndGhati: { ghati: number; vighati: number };

  // Next / Subsequent Tithi
  nextTithiIdx: number; // 0..29
  nextTithiNumber: number; // 1..30
  nextTithiInPaksha: number; // 1..15
  nextPaksha: "shukla" | "krishna";
  nextPakshaKn: string;
  nextTithiName: Record<string, string>;
  nextTithiFullLabel: Record<string, string>;
  nextTithiStartTime: Date;
  nextTithiEndTime: Date;
  nextTithiStartTimeStr: string;
  nextTithiEndTimeStr: string;
  nextTithiDurationStr: Record<string, string>;

  // Majority Tithi
  majorityTithiIdx: number; // 0..29
  majorityTithiNumber: number; // 1..30
  majorityTithiInPaksha: number; // 1..15
  majorityPaksha: "shukla" | "krishna";
  majorityPakshaKn: string;
  majorityTithiName: Record<string, string>;
  isSunriseTithiMajority: boolean;
  hoursActiveInDay: number; // approximate hours current tithi is active from sunrise to sunset/next sunrise

  // Detailed 5-Language Narrative Summary
  transitionSummary: Record<string, string>;
}

export const formatTimeIst = (d: Date): string => {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
};

export const formatTime24Ist = (d: Date): string => {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
};

/**
 * Calculates complete, authentic Tithi timings, transitions, and the ruling Majority Tithi for a given date in IST.
 */
export function getDetailedTithiInfo(
  evalDate: Date,
  model: AyanamsaModel = "lahiri",
  sunriseBaseline?: Date
): DetailedTithiInfo {
  // If no sunriseBaseline provided, compute sunrise at 06:00 IST (00:30 UTC) for that calendar date
  const evalUtc = new Date(evalDate.getTime());
  const year = evalUtc.getUTCFullYear();
  const month = evalUtc.getUTCMonth();
  const day = evalUtc.getUTCDate();

  const sunriseUtc = sunriseBaseline || new Date(Date.UTC(year, month, day, 0, 30, 0));
  const longsSunrise = siderealLongitudes(sunriseUtc, model, "mean");
  const sunTithi = normalizeDegree(longsSunrise.sunTithi ?? longsSunrise.sun);
  const moon = normalizeDegree(longsSunrise.moon);
  const elongation = normalizeDegree(moon - sunTithi);

  const sunriseTithiIdx = Math.floor(elongation / 12) % 30; // 0..29
  const tithiNumber = sunriseTithiIdx + 1; // 1..30
  const tithiInPaksha = (sunriseTithiIdx % 15) + 1; // 1..15
  const paksha: "shukla" | "krishna" = sunriseTithiIdx < 15 ? "shukla" : "krishna";
  const pakshaKn = sunriseTithiIdx < 15 ? "ಶುಕ್ಲ" : "ಕೃಷ್ಣ";

  const tithiStart = getTithiStart(sunriseUtc, model);
  const tithiEnd = getTithiEnd(sunriseUtc, model);

  // Ghati and Vighati since sunrise
  const msEnd = Math.max(0, tithiEnd.getTime() - sunriseUtc.getTime());
  const totalVighati = Math.floor(msEnd / 24_000);
  const tithiEndGhati = {
    ghati: Math.floor(totalVighati / 60),
    vighati: totalVighati % 60
  };

  const nextTithiIdx = (sunriseTithiIdx + 1) % 30;
  const nextTithiNumber = nextTithiIdx + 1;
  const nextTithiInPaksha = (nextTithiIdx % 15) + 1;
  const nextPaksha: "shukla" | "krishna" = nextTithiIdx < 15 ? "shukla" : "krishna";
  const nextPakshaKn = nextTithiIdx < 15 ? "ಶುಕ್ಲ" : "ಕೃಷ್ಣ";

  const nextTithiStart = new Date(tithiEnd.getTime());
  const nextTithiEnd = getTithiEnd(new Date(tithiEnd.getTime() + 60000), model);

  const tithiStartTimeStr = formatTimeIst(tithiStart);
  const tithiEndTimeStr = formatTimeIst(tithiEnd);
  const nextTithiStartTimeStr = formatTimeIst(nextTithiStart);
  const nextTithiEndTimeStr = formatTimeIst(nextTithiEnd);

  // Calculate hours after sunrise that current Tithi remains active
  const hoursActiveInDay = (tithiEnd.getTime() - sunriseUtc.getTime()) / (1000 * 60 * 60);

  // Majority rule: If current Tithi remains active for 12 hours or more after sunrise (past 06:00 PM IST),
  // it dominates the waking and daily rhythm. If it ends before 12 hours (e.g. 09:00 AM or 02:00 PM),
  // the subsequent Tithi is active for the majority of the day!
  const isSunriseTithiMajority = hoursActiveInDay >= 12.0;
  const majorityTithiIdx = isSunriseTithiMajority ? sunriseTithiIdx : nextTithiIdx;
  const majorityTithiNumber = majorityTithiIdx + 1;
  const majorityTithiInPaksha = (majorityTithiIdx % 15) + 1;
  const majorityPaksha: "shukla" | "krishna" = majorityTithiIdx < 15 ? "shukla" : "krishna";
  const majorityPakshaKn = majorityTithiIdx < 15 ? "ಶುಕ್ಲ" : "ಕೃಷ್ಣ";

  const getTName = (idx: number, lang: string) => TITHIS_5L[lang]?.[idx] || TITHIS_5L.en[idx] || `Tithi ${idx + 1}`;
  const getPName = (p: string, lang: string) => {
    if (lang === "kn") return p === "shukla" ? "ಶುಕ್ಲ ಪಕ್ಷ" : "ಕೃಷ್ಣ ಪಕ್ಷ";
    if (lang === "hi") return p === "shukla" ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
    if (lang === "te") return p === "shukla" ? "శుక్ల పక్షం" : "కృష్ణ పక్షం";
    if (lang === "ta") return p === "shukla" ? "சுக்ல பக்ஷம்" : "கிருஷ்ண பக்ஷம்";
    return p === "shukla" ? "Shukla Paksha" : "Krishna Paksha";
  };

  const tithiName: Record<string, string> = {
    kn: getTName(sunriseTithiIdx, "kn"),
    en: getTName(sunriseTithiIdx, "en"),
    hi: getTName(sunriseTithiIdx, "hi"),
    te: getTName(sunriseTithiIdx, "te"),
    ta: getTName(sunriseTithiIdx, "ta")
  };

  const tithiFullLabel: Record<string, string> = {
    kn: `${getPName(paksha, "kn")} ${tithiName.kn}`,
    en: `${getPName(paksha, "en")} ${tithiName.en}`,
    hi: `${getPName(paksha, "hi")} ${tithiName.hi}`,
    te: `${getPName(paksha, "te")} ${tithiName.te}`,
    ta: `${getPName(paksha, "ta")} ${tithiName.ta}`
  };

  const nextTithiName: Record<string, string> = {
    kn: getTName(nextTithiIdx, "kn"),
    en: getTName(nextTithiIdx, "en"),
    hi: getTName(nextTithiIdx, "hi"),
    te: getTName(nextTithiIdx, "te"),
    ta: getTName(nextTithiIdx, "ta")
  };

  const nextTithiFullLabel: Record<string, string> = {
    kn: `${getPName(nextPaksha, "kn")} ${nextTithiName.kn}`,
    en: `${getPName(nextPaksha, "en")} ${nextTithiName.en}`,
    hi: `${getPName(nextPaksha, "hi")} ${nextTithiName.hi}`,
    te: `${getPName(nextPaksha, "te")} ${nextTithiName.te}`,
    ta: `${getPName(nextPaksha, "ta")} ${nextTithiName.ta}`
  };

  const majorityTithiName: Record<string, string> = {
    kn: getTName(majorityTithiIdx, "kn"),
    en: getTName(majorityTithiIdx, "en"),
    hi: getTName(majorityTithiIdx, "hi"),
    te: getTName(majorityTithiIdx, "te"),
    ta: getTName(majorityTithiIdx, "ta")
  };

  const nextTithiDurationStr: Record<string, string> = {
    kn: `${tithiEndTimeStr} ರಿಂದ ನಾಳೆ ${nextTithiEndTimeStr} ರವರೆಗೆ`,
    en: `From ${tithiEndTimeStr} to Tomorrow ${nextTithiEndTimeStr}`,
    hi: `${tithiEndTimeStr} से कल ${nextTithiEndTimeStr} तक`,
    te: `${tithiEndTimeStr} నుండి రేపు ${nextTithiEndTimeStr} వరకు`,
    ta: `${tithiEndTimeStr} முதல் நாளை ${nextTithiEndTimeStr} வரை`
  };

  const transitionSummary: Record<string, string> = {
    kn: `${tithiFullLabel.kn} ${tithiEndTimeStr} ರವರೆಗೆ ಇರುತ್ತದೆ. ನಂತರ ${nextTithiFullLabel.kn} ಆರಂಭವಾಗಿ (${nextTithiDurationStr.kn}). ದಿನದ ಪ್ರಮುಖ ಶಕ್ತಿ: ${majorityTithiName.kn}.`,
    en: `${tithiFullLabel.en} is active up to ${tithiEndTimeStr}. Thereafter, ${nextTithiFullLabel.en} begins (${nextTithiDurationStr.en}). Dominant day energy: ${majorityTithiName.en}.`,
    hi: `${tithiFullLabel.hi} ${tithiEndTimeStr} तक रहेगी। इसके बाद ${nextTithiFullLabel.hi} प्रारंभ होगी (${nextTithiDurationStr.hi})। दिन की मुख्य ऊर्जा: ${majorityTithiName.hi}।`,
    te: `${tithiFullLabel.te} ${tithiEndTimeStr} వరకు ఉంటుంది. ఆ తర్వాత ${nextTithiFullLabel.te} ప్రారంభమవుతుంది (${nextTithiDurationStr.te}). ప్రధాన దిన శక్తి: ${majorityTithiName.te}.`,
    ta: `${tithiFullLabel.ta} ${tithiEndTimeStr} வரை நீடிக்கும். பின்னர் ${nextTithiFullLabel.ta} தொடங்கும் (${nextTithiDurationStr.ta}). நாளின் முதன்மை ஆற்றல்: ${majorityTithiName.ta}.`
  };

  return {
    sunriseTithiIdx,
    tithiNumber,
    tithiInPaksha,
    paksha,
    pakshaKn,
    tithiName,
    tithiFullLabel,
    tithiStartTime: tithiStart,
    tithiEndTime: tithiEnd,
    tithiStartTimeStr,
    tithiEndTimeStr,
    tithiEndGhati,

    nextTithiIdx,
    nextTithiNumber,
    nextTithiInPaksha,
    nextPaksha,
    nextPakshaKn,
    nextTithiName,
    nextTithiFullLabel,
    nextTithiStartTime: nextTithiStart,
    nextTithiEndTime: nextTithiEnd,
    nextTithiStartTimeStr,
    nextTithiEndTimeStr,
    nextTithiDurationStr,

    majorityTithiIdx,
    majorityTithiNumber,
    majorityTithiInPaksha,
    majorityPaksha,
    majorityPakshaKn,
    majorityTithiName,
    isSunriseTithiMajority,
    hoursActiveInDay,

    transitionSummary
  };
}

