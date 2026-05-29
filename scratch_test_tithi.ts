import { calculatePanchang } from "./src/pages/../core/PanchangEngine";
import { calculateTraditionalBaggona } from "./src/core/TraditionalBaggonaEngine";
import { panchangSolarAnchorDate } from "./src/core/placeTime";

const lat = 12.9716; // Bangalore
const lng = 77.5946;
const dateStr = "2026-05-27";
const anchor = new Date("2026-05-27T12:00:00+05:30");

const p = calculatePanchang(anchor, lat, lng, {
  ayanamsaModel: "lahiri"
});

const t = calculateTraditionalBaggona(
  dateStr,
  "12:00",
  lat,
  lng,
  "lahiri"
);

console.log("PanchangEngine (Home Page) calculated Tithi:", p.tithi, p.tithiKn);
console.log("PanchangEngine (Home Page) tithiEndTime:", p.tithiEndTime, "next:", p.tithiNext, p.tithiNextKn);
console.log("TraditionalBaggonaEngine (Gochara Page) calculated Tithi:", t.tithi, t.tithiKn);
console.log("TraditionalBaggonaEngine (Gochara Page) tithiEndTime:", t.tithiEndTime, "next:", t.tithiNext, t.tithiNextKn);
