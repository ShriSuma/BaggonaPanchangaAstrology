import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";

// 1980 Jyeshtha Krishna 8 Saturday. Let's try around June/July 1980.
// Let's find out the exact date.
import { SwissEphemeris } from "../src/core/SwissEphemeris";
import * as swisseph from 'swisseph';

// A quick brute force to find the date
for(let d=1; d<=30; d++) {
  const dateStr = `1980-06-${d.toString().padStart(2, '0')}`;
  const b = new Date(`${dateStr}T12:00:00Z`);
  const day = b.getUTCDay();
  if (day === 6) { // Saturday
     const res = calculateTraditionalBaggona(dateStr, "12:44", 14.5479, 74.3187, "lahiri");
     console.log(`Date: ${dateStr}, Tithi: ${res.tithi}, Masa: ${res.masa}`);
     if (res.tithi === "Ashtami" && res.paksha === "Krishna") {
       console.log("MATCH:", JSON.stringify(res, null, 2));
     }
  }
}
for(let d=1; d<=31; d++) {
  const dateStr = `1980-07-${d.toString().padStart(2, '0')}`;
  const b = new Date(`${dateStr}T12:00:00Z`);
  const day = b.getUTCDay();
  if (day === 6) { // Saturday
     const res = calculateTraditionalBaggona(dateStr, "12:44", 14.5479, 74.3187, "lahiri");
     //console.log(`Date: ${dateStr}, Tithi: ${res.tithi}`);
     if (res.tithi === "Ashtami" && res.paksha === "Krishna") {
       console.log("MATCH:", JSON.stringify(res, null, 2));
     }
  }
}
