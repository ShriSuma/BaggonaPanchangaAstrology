import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";
import { resolveSunTimesForJyotish } from "./src/core/hinduSunTimes";

function testCase(birthDate: string, birthTime: string, lat: number, lon: number) {
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lon);
  
  // Sunrise time on birthDate
  const noonUtc = wallClockBirthToUtc(birthDate, "12:00", lat, lon);
  const scTimes = SunCalc.getTimes(noonUtc, lat, lon);
  const jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, lat, lon);
  const sunriseUtc = jyotish.sunrise;
  
  // Today 5:30 AM IST (00:00 UTC on birthDate)
  const today530 = new Date(Date.UTC(
    birthUtc.getUTCFullYear(),
    birthUtc.getUTCMonth(),
    birthUtc.getUTCDate(),
    0, 0, 0
  ));
  
  // Next 5:30 AM IST (00:00 UTC on next day)
  const next530 = new Date(today530.getTime() + 24 * 60 * 60 * 1000);
  
  const moonToday = normalizeDegree(siderealLongitudes(today530, "lahiri").moon);
  let moonNext = normalizeDegree(siderealLongitudes(next530, "lahiri").moon);
  if (moonNext < moonToday) moonNext += 360;
  
  const dailyMotion = moonNext - moonToday;
  
  // Sunrise time in hours since 00:00 UTC (i.e. since 5:30 AM IST)
  const sunriseUtcHours = sunriseUtc.getUTCHours() + sunriseUtc.getUTCMinutes() / 60 + sunriseUtc.getUTCSeconds() / 3600;
  const sunriseLocalHours = sunriseUtcHours + 5.5;
  
  console.log(`--- ${birthDate} ${birthTime} ---`);
  console.log("Sunrise Local Time:", sunriseUtc.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }));
  
  const moonSunrise = moonToday + dailyMotion * (sunriseLocalHours - 5.5) / 24;
  
  // Birth moon position
  const moonBirth = normalizeDegree(siderealLongitudes(birthUtc, "lahiri").moon);
  // Nakshatra index of moon at SUNRISE
  const nakIdx = Math.floor(moonSunrise / (360 / 27));
  const nakEndDeg = (nakIdx + 1) * (360 / 27);
  
  // Ghati = (Nakshatra_End - Moon_Sunrise) * 60 / Daily_Moon_Motion
  let dist = nakEndDeg - moonSunrise;
  if (dist < 0) dist += 360;
  
  const ghatiFloat = dist * 60 / dailyMotion;
  
  const ghati = Math.floor(ghatiFloat);
  const vighati = Math.floor((ghatiFloat - ghati) * 60);
  console.log(`Calculated Nakshatra End: ${ghati} Ghati ${vighati} Vighati`);
  
  // Let's also do Tithi End Ghati:
  // Tithi_End = (Tithi_End_Deg - Elongation_Sunrise) * 60 / Daily_Elongation_Motion
  const sunToday = normalizeDegree(siderealLongitudes(today530, "lahiri").sun);
  let sunNext = normalizeDegree(siderealLongitudes(next530, "lahiri").sun);
  if (sunNext < sunToday) sunNext += 360;
  const dailySunMotion = sunNext - sunToday;
  const dailyElongation = dailyMotion - dailySunMotion;
  
  const elongationToday = normalizeDegree(moonToday - sunToday);
  const elongationSunrise = elongationToday + dailyElongation * (sunriseLocalHours - 5.5) / 24;
  
  const tithiIdx = Math.floor(elongationSunrise / 12);
  const tithiEndDeg = (tithiIdx + 1) * 12;
  
  let tithiDist = tithiEndDeg - elongationSunrise;
  if (tithiDist < 0) tithiDist += 360;
  const tithiGhatiFloat = tithiDist * 60 / dailyElongation;
  const tithiGhati = Math.floor(tithiGhatiFloat);
  const tithiVighati = Math.floor((tithiGhatiFloat - tithiGhati) * 60);
  console.log(`Calculated Tithi End: ${tithiGhati} Ghati ${tithiVighati} Vighati`);
  
  // Yoga End Ghati:
  // Sum = Moon + Sun
  const sumToday = normalizeDegree(moonToday + sunToday);
  const dailySumMotion = dailyMotion + dailySunMotion;
  const sumSunrise = sumToday + dailySumMotion * (sunriseLocalHours - 5.5) / 24;
  const yogaIdx = Math.floor(sumSunrise / (360 / 27));
  const yogaEndDeg = (yogaIdx + 1) * (360 / 27);
  let yogaDist = yogaEndDeg - sumSunrise;
  if (yogaDist < 0) yogaDist += 360;
  const yogaGhatiFloat = yogaDist * 60 / dailySumMotion;
  const yogaGhati = Math.floor(yogaGhatiFloat);
  const yogaVighati = Math.floor((yogaGhatiFloat - yogaGhati) * 60);
  console.log(`Calculated Yoga End: ${yogaGhati} Ghati ${yogaVighati} Vighati`);
  
  // Karana End Ghati:
  // Karana ends when elongation crosses multiples of 6 degrees.
  const karanaIdx = Math.floor(elongationSunrise / 6);
  const karanaEndDeg = (karanaIdx + 1) * 6;
  let karanaDist = karanaEndDeg - elongationSunrise;
  if (karanaDist < 0) karanaDist += 360;
  const karanaGhatiFloat = karanaDist * 60 / dailyElongation;
  const karanaGhati = Math.floor(karanaGhatiFloat);
  const karanaVighati = Math.floor((karanaGhatiFloat - karanaGhati) * 60);
  console.log(`Calculated Karana End: ${karanaGhati} Ghati ${karanaVighati} Vighati`);

  // Sun Nakshatra End Ghati:
  // Sun_Nakshatra_End = (Sun_Nak_End_Deg - Sun_Sunrise) * 60 / Daily_Sun_Motion
  const sunSunrise = sunToday + dailySunMotion * (sunriseLocalHours - 5.5) / 24;
  const sunNakIdx = Math.floor(sunSunrise / (360 / 27));
  const sunNakEndDeg = (sunNakIdx + 1) * (360 / 27);
  let sunNakDist = sunNakEndDeg - sunSunrise;
  if (sunNakDist < 0) sunNakDist += 360;
  const sunNakGhatiFloat = sunNakDist * 60 / dailySunMotion;
  const sunNakGhati = Math.floor(sunNakGhatiFloat);
  const sunNakVighati = Math.floor((sunNakGhatiFloat - sunNakGhati) * 60);
  console.log(`Calculated Sun Nakshatra End: ${sunNakGhati} Ghati ${sunNakVighati} Vighati`);
}

testCase("1993-05-31", "09:25", 14.5479, 74.3187);
testCase("1997-10-24", "20:15", 14.5479, 74.3187);
