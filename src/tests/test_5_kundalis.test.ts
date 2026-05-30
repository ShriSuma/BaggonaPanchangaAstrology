import { test } from "vitest";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { calculateKundli } from "../core/KundliEngine";

const testCases = [
  {
    year: 1968, date: "1968-10-20", time: "05:10", lat: 14.5, lng: 74.3, 
    desc: "1968 Keelaka, Ashvayuja Krishna Dvitiya, Sunday 5:10 AM"
  },
  {
    year: 1971, date: "1971-06-24", time: "19:20", lat: 14.5, lng: 74.3,
    desc: "1971 Virodhikrut, Ashadha Shukla Triteeya, Thursday 7:20 PM"
  },
  {
    year: 1992, date: "1992-06-07", time: "13:34", lat: 14.5, lng: 74.3, 
    desc: "1992 Angeerasa, Jyeshtha Shukla Shasthi, Sunday 1:34 PM"
  },
  {
    year: 1993, date: "1993-10-15", time: "14:44", lat: 14.5, lng: 74.3,
    desc: "1993 Shrimukha, Ashvayuja Krishna Ekadashi, Friday 2:44 PM"
  },
  {
    year: 2005, date: "2005-07-12", time: "15:30", lat: 14.5, lng: 74.3,
    desc: "2005 Parthiva, Ashadha Shukla Shasthi, Tuesday 3:30 PM"
  }
];

test("Calculate 5 Panchangas", () => {
  for (const tc of testCases) {
    console.log(`\n=== Testing ${tc.desc} (${tc.date}) ===`);
    try {
      const result = calculateTraditionalBaggona(tc.date, tc.time, tc.lat, tc.lng);
      console.log(`Tithi: ${result.tithi} (${result.tithiGhati}-${result.tithiVighati})`);
      console.log(`Nakshatra: ${result.moonNakshatra} (${result.moonNakshatraGhati}-${result.moonNakshatraVighati})`);
      console.log(`Yoga: ${result.yoga} (${result.yogaGhati}-${result.yogaVighati})`);
      console.log(`Karana: ${result.karana} (${result.karanaGhati}-${result.karanaVighati})`);
      console.log(`Sun Nak: ${result.sunNakshatra} (${result.sunNakshatraGhati}-${result.sunNakshatraVighati})`);
      console.log(`Visha Ghati: ${result.vishaGhati.ghati}-${result.vishaGhati.vighati}`);
      console.log(`Amritha Ghati: ${result.amrithaGhati.ghati}-${result.amrithaGhati.vighati}`);
      console.log(`Diva Ghati: ${result.divaGhati.ghati}-${result.divaGhati.vighati}`);
      console.log(`Parama Ghati: ${result.paramaGhati.ghati}-${result.paramaGhati.vighati}`);
      console.log(`Yeshya Ghati: ${result.ashayaGhati.ghati}-${result.ashayaGhati.vighati}`);
      console.log(`Gatadina: ${result.ghatadina.ghati}-${result.ghatadina.vighati}`);
      console.log(`Suryodayadita: ${result.suryodhayadgata.ghati}-${result.suryodhayadgata.vighati}`);
    } catch (e) {
      console.log("Error:", e);
    }
  }
});
