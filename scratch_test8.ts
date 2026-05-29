import { wallClockBirthToUtc } from "./src/core/birthTime";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { degreeToRashi, normalizeDegree } from "./src/core/AstroMath";

function findSunSankrantiBackward(birthUtc: Date, targetDeg: number): Date {
  const getSunLong = (d: Date) => normalizeDegree(siderealLongitudes(d, "lahiri").sun);
  
  // Search backward in 12-hour steps
  const step = 12 * 60 * 60 * 1000;
  let current = birthUtc;
  let prevLong = getSunLong(current);
  
  for (let i = 0; i < 70; i++) { // search up to 35 days
    const nextTime = new Date(current.getTime() - step);
    const nextLong = getSunLong(nextTime);
    
    // Check if targetDeg is crossed.
    // Since we search backward, the longitude decreases.
    // So prevLong is greater than nextLong.
    // We check if targetDeg is between nextLong and prevLong.
    let crossed = false;
    if (prevLong >= nextLong) {
      crossed = targetDeg >= nextLong && targetDeg <= prevLong;
    } else {
      // Handles 360 wrap around
      crossed = targetDeg >= nextLong || targetDeg <= prevLong;
    }
    
    if (crossed) {
      // Binary search between nextTime and current
      let low = nextTime.getTime();
      let high = current.getTime();
      for (let iter = 0; iter < 15; iter++) {
        const mid = (low + high) / 2;
        const midLong = getSunLong(new Date(mid));
        if (midLong >= targetDeg) {
          high = mid; // since we search backward, higher time has higher degree
        } else {
          low = mid;
        }
      }
      return new Date((low + high) / 2);
    }
    prevLong = nextLong;
    current = nextTime;
  }
  return birthUtc;
}

function run() {
  // Pramod: birth 1993-05-31
  const birthUtc = wallClockBirthToUtc("1993-05-31", "09:25", 14.5479, 74.3187);
  const sunLong = normalizeDegree(siderealLongitudes(birthUtc, "lahiri").sun);
  const currIdx = Math.floor(sunLong / 30);
  const targetDeg = currIdx * 30; // 30 degrees for Taurus
  
  const sankrantiTime = findSunSankrantiBackward(birthUtc, targetDeg);
  console.log("Sun Longitude at Birth:", sunLong);
  console.log("Target Sankranti Degree:", targetDeg);
  console.log("Vrishabha Sankranti Local (IST):", sankrantiTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  // Diff in calendar days:
  // In India, Gatadina is calculated as calendar days in IST.
  // Sankranti day is day 1.
  // Let's get the date of Sankranti in IST
  const sankrantiYmd = sankrantiTime.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const birthYmd = birthUtc.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  
  console.log("Sankranti Date:", sankrantiYmd);
  console.log("Birth Date:", birthYmd);
  
  const sDate = new Date(sankrantiYmd);
  const bDate = new Date(birthYmd);
  const daysDiff = Math.round((bDate.getTime() - sDate.getTime()) / (24 * 60 * 60 * 1000));
  console.log("Calendar Days passed:", daysDiff);
  console.log("Gatadina (Calendar Days + 1):", daysDiff + 1);
  
  // Vidyashree: birth 1997-10-24
  const birthUtc2 = wallClockBirthToUtc("1997-10-24", "20:15", 14.5479, 74.3187);
  const sunLong2 = normalizeDegree(siderealLongitudes(birthUtc2, "lahiri").sun);
  const currIdx2 = Math.floor(sunLong2 / 30);
  const targetDeg2 = currIdx2 * 30; // 180 degrees for Libra
  
  const sankrantiTime2 = findSunSankrantiBackward(birthUtc2, targetDeg2);
  console.log("\nSun Longitude at Birth 2:", sunLong2);
  console.log("Target Sankranti Degree 2:", targetDeg2);
  console.log("Tula Sankranti Local (IST):", sankrantiTime2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  const sankrantiYmd2 = sankrantiTime2.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const birthYmd2 = birthUtc2.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  console.log("Sankranti Date 2:", sankrantiYmd2);
  console.log("Birth Date 2:", birthYmd2);
  
  const sDate2 = new Date(sankrantiYmd2);
  const bDate2 = new Date(birthYmd2);
  const daysDiff2 = Math.round((bDate2.getTime() - sDate2.getTime()) / (24 * 60 * 60 * 1000));
  console.log("Calendar Days passed 2:", daysDiff2);
  console.log("Gatadina 2 (Calendar Days + 1):", daysDiff2 + 1);
}

run();
