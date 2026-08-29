import { siderealLongitudes } from "../src/core/EphemerisEngine";
import { normalizeDegree } from "../src/core/AstroMath";
import { calculatePanchang } from "../src/core/PanchangEngine";
import SunCalc from "suncalc";

const lat = 14.5426; // Gokarna
const lon = 74.3168;

// Scan hourly from Aug 26 00:00 IST to Aug 30 00:00 IST
const startUtc = new Date(Date.UTC(2026, 7, 25, 18, 30, 0)); // 2026-08-26 00:00 IST
const endUtc = new Date(Date.UTC(2026, 7, 29, 18, 30, 0)); // 2026-08-30 00:00 IST

console.log("=== TITHI TRANSITIONS FOR SHRAVANA PURNIMA 2026 (GOKARNA) ===");

let currentTithi = -1;

for (let time = startUtc.getTime(); time <= endUtc.getTime(); time += 15 * 60 * 1000) { // every 15 min
  const date = new Date(time);
  const coords = siderealLongitudes(date);
  const diff = normalizeDegree(coords.moon - coords.sun);
  const tithiIdx = Math.floor(diff / 12); // 0=Pratipada, 13=Chaturdashi, 14=Purnima, 15=Krishna Pratipada
  
  if (tithiIdx !== currentTithi) {
    const tithiNames = [
      "Shukla Pratipada (1)", "Shukla Dvitiya (2)", "Shukla Tritiya (3)", "Shukla Chaturthi (4)",
      "Shukla Panchami (5)", "Shukla Shashthi (6)", "Shukla Saptami (7)", "Shukla Ashtami (8)",
      "Shukla Navami (9)", "Shukla Dashami (10)", "Shukla Ekadashi (11)", "Shukla Dwadashi (12)",
      "Shukla Trayodashi (13)", "Shukla Chaturdashi (14)", "Purnima / Hunnime (15)",
      "Krishna Pratipada / Padya (16)", "Krishna Dvitiya (17)", "Krishna Tritiya (18)"
    ];
    console.log(`\n>>> TITHI CHANGE: ${tithiNames[tithiIdx]} BEGINS at:`);
    console.log(`    IST: ${date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
    console.log(`    UTC: ${date.toISOString()}`);
    console.log(`    Moon: ${coords.moon.toFixed(3)}°, Sun: ${coords.sun.toFixed(3)}°, Diff: ${diff.toFixed(3)}°`);
    currentTithi = tithiIdx;
  }
}

console.log("\n=== SUNRISE (SURYODAYA) TITHIS AT GOKARNA ===");
for (let d = 26; d <= 29; d++) {
  const dt = new Date(Date.UTC(2026, 7, d, 0, 0, 0));
  const sunTimes = SunCalc.getTimes(dt, lat, lon);
  const sunrise = sunTimes.sunrise;
  const coords = siderealLongitudes(sunrise);
  const diff = normalizeDegree(coords.moon - coords.sun);
  const tithiIdx = Math.floor(diff / 12);
  
  const panchang = calculatePanchang(dt, lat, lon);
  
  console.log(`\nDate: 2026-08-${d} (${dt.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })})`);
  console.log(`  Sunrise: ${sunrise.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST`);
  console.log(`  Tithi at Sunrise (Udaya Tithi): Tithi Index ${tithiIdx + 1} (${panchang.tithi} / ${panchang.kannadaTithi}, ${panchang.paksha})`);
  console.log(`  Moon-Sun Diff at Sunrise: ${diff.toFixed(2)}°`);
}
