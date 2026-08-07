import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";
for(let d=1; d<=30; d++) {
  const dateStr = `1957-10-${d.toString().padStart(2, '0')}`;
  const res = calculateTraditionalBaggona(dateStr, "15:30", 14.5479, 74.3187, "lahiri");
  if (res.tithi === "Saptami" && res.paksha === "Shukla") {
    console.log("OCT MATCH:", dateStr, res.weekday, res.masa);
  }
}
for(let d=1; d<=30; d++) {
  const dateStr = `1957-11-${d.toString().padStart(2, '0')}`;
  const res = calculateTraditionalBaggona(dateStr, "15:30", 14.5479, 74.3187, "lahiri");
  if (res.tithi === "Saptami" && res.paksha === "Shukla") {
    console.log("NOV MATCH:", dateStr, res.weekday, res.masa);
  }
}
for(let d=1; d<=30; d++) {
  const dateStr = `1957-09-${d.toString().padStart(2, '0')}`;
  const res = calculateTraditionalBaggona(dateStr, "15:30", 14.5479, 74.3187, "lahiri");
  if (res.tithi === "Saptami" && res.paksha === "Shukla") {
    console.log("SEP MATCH:", dateStr, res.weekday, res.masa);
  }
}
