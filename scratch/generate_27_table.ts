import { calculateKundli } from "../src/core/KundliEngine";

const exactNakMap: Record<number, { dob: string; tob: string }> = {};

// Scan days in 1994-1995 to find an exact date and time for each Nakshatra 0..26
let foundCount = 0;
const startDate = new Date("1994-01-01T00:00:00Z");

for (let day = 0; day < 365 && foundCount < 27; day++) {
  const d = new Date(startDate.getTime() + day * 24 * 3600 * 1000);
  for (let hour = 0; hour < 24; hour += 6) {
    const dHours = new Date(d.getTime() + hour * 3600 * 1000);
    const dobStr = dHours.toISOString().slice(0, 10);
    const tobStr = dHours.toISOString().slice(11, 16);

    const res = calculateKundli({
      name: "Scan",
      birthDate: dobStr,
      birthTime: tobStr,
      latitude: 14.54,
      longitude: 74.31
    });

    const moon = res.planets.find((p) => p.name === "Moon");
    const nakIdx = moon?.nakshatra?.index;

    if (nakIdx !== undefined && nakIdx >= 0 && nakIdx < 27 && !exactNakMap[nakIdx]) {
      exactNakMap[nakIdx] = { dob: dobStr, tob: tobStr };
      foundCount++;
    }
  }
}

console.log("const NAKSHATRA_UNIVERSAL_BIRTH_TABLE: Record<number, { dob: string; tob: string }> = {");
for (let nk = 0; nk < 27; nk++) {
  const item = exactNakMap[nk];
  if (item) {
    console.log(`  ${nk}: { dob: "${item.dob}", tob: "${item.tob}" },`);
  }
}
console.log("};");
