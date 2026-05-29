import { findBoundaryCrossing } from "./src/core/VedicCalculations";
import { wallClockBirthToUtc } from "./src/core/birthTime";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { degreeToRashi, normalizeDegree } from "./src/core/AstroMath";

function run() {
  // Pramod: birth 1993-05-31
  const birthUtc = wallClockBirthToUtc("1993-05-31", "09:25", 14.5479, 74.3187);
  
  // Find Vrishabha Sankranti (Sun crosses 30 degrees)
  // Let's search backward from birthUtc for the Sun crossing 30 degrees
  const getSunLong = (d: Date) => siderealLongitudes(d, "lahiri").sun;
  const sankrantiTime = findBoundaryCrossing(birthUtc, "lahiri", getSunLong, 30, false);
  
  console.log("Vrishabha Sankranti UTC:", sankrantiTime.toISOString());
  console.log("Vrishabha Sankranti Local (IST):", sankrantiTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  console.log("Birth UTC:", birthUtc.toISOString());
  console.log("Birth Local (IST):", birthUtc.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  const diffMs = birthUtc.getTime() - sankrantiTime.getTime();
  const diffDays = diffMs / (24 * 60 * 60 * 1000);
  console.log("Days since Sankranti:", diffDays);
  
  // Vidyashree: birth 1997-10-24
  const birthUtc2 = wallClockBirthToUtc("1997-10-24", "20:15", 14.5479, 74.3187);
  // Find Tula Sankranti (Sun crosses 180 degrees)
  const sankrantiTime2 = findBoundaryCrossing(birthUtc2, "lahiri", getSunLong, 30, false);
  console.log("\nTula Sankranti UTC:", sankrantiTime2.toISOString());
  console.log("Tula Sankranti Local (IST):", sankrantiTime2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  console.log("Birth UTC 2:", birthUtc2.toISOString());
  console.log("Birth Local 2 (IST):", birthUtc2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  const diffMs2 = birthUtc2.getTime() - sankrantiTime2.getTime();
  const diffDays2 = diffMs2 / (24 * 60 * 60 * 1000);
  console.log("Days since Sankranti 2:", diffDays2);
}

run();
