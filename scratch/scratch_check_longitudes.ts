import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { wallClockBirthToUtc } from "./src/core/birthTime";

const lat = 14.5479;
const lon = 74.3187;

const printLong = (label: string, utc: Date) => {
  const longs = siderealLongitudes(utc, "lahiri");
  console.log(`${label}: UTC=${utc.toISOString()} IST=${utc.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
  console.log(`  Sun Longitude: ${longs.sun.toFixed(4)}`);
  console.log(`  Moon Longitude: ${longs.moon.toFixed(4)}`);
};

printLong("Sunrise", wallClockBirthToUtc("1993-05-31", "06:07", lat, lon));
printLong("Birth", wallClockBirthToUtc("1993-05-31", "09:25", lat, lon));
printLong("12:50 UTC", new Date("1993-05-31T12:50:00Z"));
printLong("19:26 UTC", new Date("1993-05-31T19:26:26Z"));
printLong("Next Sunrise", wallClockBirthToUtc("1993-06-01", "06:07", lat, lon));
