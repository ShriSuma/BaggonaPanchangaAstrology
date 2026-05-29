import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { resolveSunTimesForJyotish } from "./src/core/hinduSunTimes";

function run(model: "lahiri" | "drik_ganita") {
  console.log(`=== Ayanamsa: ${model} ===`);
  for (let day = 25; day <= 15 + 31; day++) {
    let dateStr = "";
    if (day <= 31) {
      dateStr = `1993-05-${day}`;
    } else {
      const d = day - 31;
      dateStr = `1993-06-${d < 10 ? '0' + d : d}`;
    }
    
    try {
      const birthUtc = wallClockBirthToUtc(dateStr, "12:00", 14.5479, 74.3187);
      const noonUtc = wallClockBirthToUtc(dateStr, "12:00", 14.5479, 74.3187);
      const scTimes = SunCalc.getTimes(noonUtc, 14.5479, 74.3187);
      const jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, 14.5479, 74.3187);
      const sunriseUtc = jyotish.sunrise;
      
      const today530 = new Date(Date.UTC(
        birthUtc.getUTCFullYear(),
        birthUtc.getUTCMonth(),
        birthUtc.getUTCDate(),
        0, 0, 0
      ));
      const next530 = new Date(today530.getTime() + 24 * 60 * 60 * 1000);
      
      const sunToday = siderealLongitudes(today530, model).sun;
      let sunNext = siderealLongitudes(next530, model).sun;
      if (sunNext < sunToday) sunNext += 360;
      const dailySunMotion = sunNext - sunToday;
      
      const sunriseLocalHours = (sunriseUtc.getUTCHours() + sunriseUtc.getUTCMinutes() / 60 + sunriseUtc.getUTCSeconds() / 3600) + 5.5;
      const sunSunrise = sunToday + dailySunMotion * (sunriseLocalHours - 5.5) / 24;
      
      const sunNakIdx = Math.floor(sunSunrise / (360 / 27)) % 27;
      const sunNakEndDeg = (sunNakIdx + 1) * (360 / 27);
      
      let sunNakDist = sunNakEndDeg - sunSunrise;
      if (sunNakDist < 0) sunNakDist += 360;
      const sunNakGhatiFloat = sunNakDist * 60 / dailySunMotion;
      const sunNakGhati = Math.floor(sunNakGhatiFloat);
      const sunNakVighati = Math.floor((sunNakGhatiFloat - sunNakGhati) * 60);
      
      if (sunNakIdx === 3) {
        console.log(`Date: ${dateStr} | Rohini Ends in: ${sunNakGhati} Ghati ${sunNakVighati} Vighati`);
      }
    } catch (e) {}
  }
}

run("lahiri");
run("drik_ganita");
