import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";

// Date from Image 4: 1948 Hevilambi Samvatsara, Kartika Masa, Shukla Paksha 7, Sthira Vaasare.
// Wait, 1948 Hevilambi? 1948 Shaka = 2026? No, 1948 Shaka = 2026. Wait, Hevilambi was 1957? No, Hevilambi was 2017/2018?
// Wait, "ಹೇವಿಳಂಬಿ" is Hevilambi.
// 2017-1957 = 60 years. 1957 was Hevilambi. 1957 is Shaka 1879.
// But it says 1879 Hevilambi? Let me re-read Image 4's Shaka year.
// "೧೮೭೯ ಹೇವಿಳಂಬಿ" (1879). That makes sense! 1879 Shaka = 1957.
// Kartika Shukla 7 (Saptami) Sthira (Saturday).
import { SwissEphemeris } from "../src/core/SwissEphemeris";

for(let d=1; d<=30; d++) {
  const dateStr = `1957-10-${d.toString().padStart(2, '0')}`;
  const b = new Date(`${dateStr}T12:00:00Z`);
  const day = b.getUTCDay();
  if (day === 6) { // Saturday
     const res = calculateTraditionalBaggona(dateStr, "15:30", 14.5479, 74.3187, "lahiri");
     //console.log(`Date: ${dateStr}, Tithi: ${res.tithi}, Masa: ${res.masa}`);
     if (res.tithi === "Saptami" && res.paksha === "Shukla") {
       console.log("MATCH:", JSON.stringify(res, null, 2));
     }
  }
}
