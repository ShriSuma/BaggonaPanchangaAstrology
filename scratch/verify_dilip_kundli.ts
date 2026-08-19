import { calculateKundli } from "../src/core/KundliEngine";

const kundli = calculateKundli({
  name: "Dilip",
  birthDate: "1993-03-22",
  birthTime: "23:40",
  latitude: 14.5479,
  longitude: 74.3187
});

const moonPlanet = kundli.planets.find(p => p.name === "Moon");

console.log("Lagna Rashi:", kundli.lagnaRashi.sanskrit, "Index:", kundli.lagnaRashi.index);
console.log("Moon Sign:", kundli.moonSign.sanskrit, "Index:", kundli.moonSign.index);
console.log("Moon Nakshatra:", moonPlanet?.nakshatra.sanskrit, "Index:", moonPlanet?.nakshatra.index);
