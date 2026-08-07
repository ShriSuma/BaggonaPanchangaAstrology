import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";
for(let d=1; d<=30; d++) {
  const dateStr = `1957-11-${d.toString().padStart(2, '0')}`;
  const b = new Date(`${dateStr}T12:00:00Z`);
  const day = b.getUTCDay();
  if (day === 6) { // Saturday
     const res = calculateTraditionalBaggona(dateStr, "15:30", 14.5479, 74.3187, "lahiri");
     if (res.tithi === "Saptami" && res.paksha === "Shukla") {
       console.log("MATCH:", JSON.stringify(res, null, 2));
     }
  }
}
