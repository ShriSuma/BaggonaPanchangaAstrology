import { calculateTraditionalBaggona } from "./src/core/TraditionalBaggonaEngine";
import { calculateKundli } from "./src/core/KundliEngine";

const coords = { latitude: 14.5479, longitude: 74.3187 }; // Gokarna

// Let's check June 16, 2005 at 02:55 AM (represented as "02:55")
const c = { name: "Pratyush (Image 1)", date: "2005-06-16", time: "02:55" };

const trad = calculateTraditionalBaggona(c.date, c.time, coords.latitude, coords.longitude, "lahiri");
const k = calculateKundli({ name: c.name, birthDate: c.date, birthTime: c.time, ...coords }, { ayanamsaModel: "lahiri" });

console.log("Tithi:   ", trad.tithiKn, "Ghati:", trad.tithiGhati, "Vighati:", trad.tithiVighati);
console.log("Nakshatra:", trad.moonNakshatraKn, "Ghati:", trad.moonNakshatraGhati, "Vighati:", trad.moonNakshatraVighati);
console.log("Yoga:     ", trad.yogaKn, "Ghati:", trad.yogaGhati, "Vighati:", trad.yogaVighati);
console.log("Karana:   ", trad.karanaKn, "Ghati:", trad.karanaGhati, "Vighati:", trad.karanaVighati);
console.log("Suryodhayadgata (Time of birth in Ghati):", trad.suryodhayadgata.ghati, "Vighati:", trad.suryodhayadgata.vighati);
console.log("Dasha Balance:", trad.dashaLord, `${trad.dashaYears}y ${trad.dashaMonths}m ${trad.dashaDays}d`);

const moon = k.planets.find(p => p.name === "Moon");
const maandi = k.planets.find(p => p.name === "Maandi") || k.maandi;
console.log("Moon House:", moon?.house, "Rashi:", moon?.rashi.sanskrit, "Degree:", moon?.degree);
if (maandi) {
  console.log("Maandi placement:", maandi);
}
