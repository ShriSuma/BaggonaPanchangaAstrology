import { calculateKundli } from "./src/core/KundliEngine";
import { sunTimesSyncForBirth } from "./src/core/birthSunTimes";

const birth = new Date("1993-05-31T09:25:00+05:30");
const sun = sunTimesSyncForBirth(birth, 14.5479, 74.3187, "581326");
const k = calculateKundli({ name: "Pramod", birthDate: "1993-05-31", birthTime: "09:25", latitude: 14.5479, longitude: 74.3187, pincode: "581326" }, { ayanamsaModel: "lahiri", sunTimes: sun });

console.log("New Maandi:", k.maandi);
