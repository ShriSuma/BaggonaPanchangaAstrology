import { calculateDeterministicRhythmDay } from "../src/features/seva/icsCalendarGenerator";
import { getSpecialVrataInfo } from "../src/features/seva/specialVrataAlertEngine";
import { siderealLongitudes } from "../src/core/EphemerisEngine";
import { calculatePanchang } from "../src/core/PanchangEngine";
import SunCalc from "suncalc";

const lat = 14.5426; // Gokarna
const lon = 74.3168;

const dates = [
  "2026-08-25",
  "2026-08-26",
  "2026-08-27",
  "2026-08-28",
  "2026-08-29",
  "2026-08-30"
];

console.log("=== PANCHANGA & TITHI CALCULATION FOR GOKARNA (Lat: " + lat + ", Lon: " + lon + ") ===");

for (const ymd of dates) {
  const [y, m, d] = ymd.split("-").map(Number);
  const targetDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const sunTimes = SunCalc.getTimes(targetDate, lat, lon);
  const sunrise = sunTimes.sunrise;
  
  // Calculate Panchang at Sunrise
  const panchang = calculatePanchang(targetDate, lat, lon);
  const pos = siderealLongitudes(sunrise, "lahiri");
  
  const diff = (pos.moon - pos.sun + 360) % 360;
  const rawTithiIndex = Math.floor(diff / 12);
  
  const vrata = getSpecialVrataInfo(ymd, 12, "kn", lat, lon);
  const rhythmDay = calculateDeterministicRhythmDay(ymd, 12, 5, 0, 0, lat, lon);
  
  console.log(`\n========================================`);
  console.log(`Date: ${ymd} (${targetDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })})`);
  console.log(`Sunrise: ${sunrise.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`);
  console.log(`Sun Longitude (Lahiri): ${pos.sun.toFixed(4)}°`);
  console.log(`Moon Longitude (Lahiri): ${pos.moon.toFixed(4)}°`);
  console.log(`Moon - Sun Elongation: ${diff.toFixed(4)}° (Tithi #${rawTithiIndex + 1})`);
  console.log(`Panchang Output Tithi: ${panchang.tithi} (${panchang.kannadaTithi}), Paksha: ${panchang.paksha}`);
  console.log(`Panchang Tithi End: ${panchang.tithiEnd ? panchang.tithiEnd.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A"}`);
  console.log(`RhythmDay Tithi: ${rhythmDay.tithi} (${rhythmDay.kannadaTithi}), Paksha: ${rhythmDay.paksha}`);
  console.log(`RhythmDay Tithi End Time: ${rhythmDay.tithiEndTime || "N/A"}`);
  console.log(`Special Vrata Category: ${vrata.category}, isSpecial: ${vrata.isSpecial}, name: "${vrata.vrataName}"`);
  console.log(`Eve Alert Title: "${vrata.eveAlertTitle}"`);
}
