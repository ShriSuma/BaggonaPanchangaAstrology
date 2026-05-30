import { getTithiEnd, getNakshatraEnd, getSunNakshatraEnd } from "./src/core/VedicCalculations";
import { resolveSunTimesForJyotish } from "./src/core/hinduSunTimes";
import SunCalc from "suncalc";

const date = "1993-05-31";
const lat = 14.5501;
const lng = 74.3184;
const noonDate = new Date(`${date}T12:00:00+05:30`);
const astro = SunCalc.getTimes(noonDate, lat, lng);
const { sunrise } = resolveSunTimesForJyotish({ sunrise: astro.sunrise, sunset: astro.sunset }, lat, lng, "581326");

const toGV = (dateStr: Date) => {
    let diff = dateStr.getTime() - sunrise.getTime();
    if (diff < 0) diff += 24 * 3600 * 1000;
    const v = Math.floor(diff / 24000);
    return { g: Math.floor(v / 60), v: v % 60 };
};

let moonOff = 1.5166; 
let tithiOff = 1.8761; 
let sunNakOff = 0.6700; 

const d1 = getTithiEnd(sunrise, "lahiri", { moonOffset: moonOff, sunNakOffset: sunNakOff, tithiSunOffset: tithiOff });
console.log("Tithi End:", toGV(d1), "Target: 54:59");

const d2 = getNakshatraEnd(sunrise, "lahiri", { moonOffset: moonOff, sunNakOffset: sunNakOff, tithiSunOffset: tithiOff });
console.log("Nak End:", toGV(d2), "Target: 26:24");

const d4 = getSunNakshatraEnd(sunrise, "lahiri", { moonOffset: moonOff, sunNakOffset: sunNakOff, tithiSunOffset: tithiOff });
console.log("Sun Nak End:", toGV(d4), "Target: 29:14");

