import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";

function printPanchangAt(label: string, time: Date) {
  const longs = siderealLongitudes(time, "lahiri");
  const sunLong = normalizeDegree(longs.sun);
  const moonLong = normalizeDegree(longs.moon);
  
  const tithiIdx = Math.floor(normalizeDegree(moonLong - sunLong) / 12) % 30;
  const nakIdx = Math.floor(moonLong / (360 / 27)) % 27;
  const yogaIdx = Math.floor(normalizeDegree(moonLong + sunLong) / (360 / 27)) % 27;
  
  // Karana calculation: each tithi is 12 degrees. A half-tithi (6 degrees) is a Karana.
  // There are 60 Karanas in a lunar month of 30 tithis.
  const elongation = normalizeDegree(moonLong - sunLong);
  const halfTithiIndex = Math.floor(elongation / 6) % 60;
  
  console.log(`[${label}]`);
  console.log("  Moon Longitude:", moonLong.toFixed(4));
  console.log("  Sun Longitude:", sunLong.toFixed(4));
  console.log("  Tithi Index (0-29):", tithiIdx);
  console.log("  Nakshatra Index (0-26):", nakIdx);
  console.log("  Yoga Index (0-26):", yogaIdx);
  console.log("  Half Tithi Index (0-59):", halfTithiIndex);
}

function run(birthDate: string, birthTime: string, lat: number, lon: number) {
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lon);
  const noonUtc = wallClockBirthToUtc(birthDate, "12:00", lat, lon);
  const scTimes = SunCalc.getTimes(noonUtc, lat, lon);
  const sunriseUtc = scTimes.sunrise;
  
  console.log(`\n=================== ${birthDate} ${birthTime} ===================`);
  printPanchangAt("SUNRISE", sunriseUtc);
  printPanchangAt("BIRTH", birthUtc);
}

run("1993-05-31", "09:25", 14.5479, 74.3187);
run("1997-10-24", "20:15", 14.5479, 74.3187);
