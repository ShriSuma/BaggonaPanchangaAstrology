import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";

function testCase(birthDate: string, birthTime: string, lat: number, lon: number) {
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lon);
  
  // Sunrise time on birthDate
  const noonUtc = wallClockBirthToUtc(birthDate, "12:00", lat, lon);
  const scTimes = SunCalc.getTimes(noonUtc, lat, lon);
  const sunriseUtc = scTimes.sunrise;
  
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
  // Wait, Sunrise time local hour. Since IST is UTC+5.5, Sunrise local hour is Sunrise UTC hour + 5.5.
  // Sunrise UTC in fractional hours:
  const sunriseUtcHours = sunriseUtc.getUTCHours() + sunriseUtc.getUTCMinutes() / 60 + sunriseUtc.getUTCSeconds() / 3600;
  const sunriseLocalHours = sunriseUtcHours + 5.5;
  
  console.log(`--- ${birthDate} ${birthTime} ---`);
  console.log("Sunrise Local Hour:", sunriseLocalHours);
  
  // Moon_Sunrise = Moon_Today_5_30 + (Moon_Next_5_30 - Moon_Today_5_30) * (Sunrise_Time - 5.5) / 24
  const moonSunrise = moonToday + dailyMotion * (sunriseLocalHours - 5.5) / 24;
  
  // Birth moon position
  const moonBirth = normalizeDegree(siderealLongitudes(birthUtc, "lahiri").moon);
  
  // Nakshatra index of birth moon
  const nakIdx = Math.floor(moonBirth / (360 / 27));
  const nakEndDeg = (nakIdx + 1) * (360 / 27);
  
  console.log("Moon Sunrise:", moonSunrise);
  console.log("Nakshatra Index:", nakIdx);
  console.log("Nakshatra End Degree:", nakEndDeg);
  console.log("Daily Motion:", dailyMotion);
  
  // Ghati = (Nakshatra_End - Moon_Sunrise) * 60 / Daily_Moon_Motion
  let dist = nakEndDeg - moonSunrise;
  if (dist < 0) dist += 360;
  
  const ghatiFloat = dist * 60 / dailyMotion;
  console.log("Ghati float:", ghatiFloat);
  
  const ghati = Math.floor(ghatiFloat);
  const vighati = Math.floor((ghatiFloat - ghati) * 60);
  console.log(`Calculated: ${ghati} Ghati ${vighati} Vighati`);
}

testCase("1993-05-31", "09:25", 14.5479, 74.3187); // Pramod (Hasta: 30 Ghati 35 Vighati)
testCase("1997-10-24", "20:15", 14.5479, 74.3187); // Vidyashree (Tishya: 1 Ghati 59 Vighati)
