import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";
import { KundliEngine } from "../src/core/KundliEngine";

const testCases = [
  {
    year: 1968, date: "1968-10-20", time: "05:10", lat: 14.0, lng: 74.5,
    desc: "1968 Keelaka, Ashvayuja Krishna Dvitiya, Sunday 5:10 AM"
  },
  {
    year: 1971, date: "1971-06-24", time: "19:20", lat: 14.0, lng: 74.5, // 1971 Ashadha Shukla Triteeya Thursday is Jun 24 or 25? We'll check both.
    desc: "1971 Virodhikrut, Ashadha Shukla Triteeya, Thursday 7:20 PM"
  },
  {
    year: 1992, date: "1992-06-07", time: "13:34", lat: 14.0, lng: 74.5, // 1992 Jyeshtha Shukla Shasthi Sunday
    desc: "1992 Angeerasa, Jyeshtha Shukla Shasthi, Sunday 1:34 PM"
  },
  {
    year: 1993, date: "1993-10-12", time: "14:44", lat: 14.0, lng: 74.5, // 1993 Ashvayuja Krishna Ekadashi Friday. Wait, is it Oct?
    desc: "1993 Shrimukha, Ashvayuja Krishna Ekadashi, Friday 2:44 PM"
  },
  {
    year: 2005, date: "2005-07-12", time: "15:30", lat: 14.0, lng: 74.5, // 2005 Ashadha Shukla Shasthi Tuesday. Wait, the audio said 12 6 2005 (June 12). Let's check June 12 and July 12.
    desc: "2005 Parthiva, Ashadha Shukla Shasthi, Tuesday? 3:30 PM"
  }
];

// Let's refine the dates for the test cases using a quick check:
async function runTests() {
  for (const tc of testCases) {
    console.log(`\n=== Testing ${tc.desc} (${tc.date}) ===`);
    try {
      const result = calculateTraditionalBaggona(tc.date, tc.time, tc.lat, tc.lng);
      console.log(`Tithi: ${result.tithi} (${result.tithiEnd.ghati}-${result.tithiEnd.vighati})`);
      console.log(`Nakshatra: ${result.moonNakshatra} (${result.nakshatraEnd.ghati}-${result.nakshatraEnd.vighati})`);
      console.log(`Yoga: ${result.yoga} (${result.yogaEnd.ghati}-${result.yogaEnd.vighati})`);
      console.log(`Karana: ${result.karana} (${result.karanaEnd.ghati}-${result.karanaEnd.vighati})`);
      console.log(`Sun Nak: ${result.sunNakshatra} (${result.sunNakshatraGhati.ghati}-${result.sunNakshatraGhati.vighati})`);
      console.log(`Visha Ghati: ${result.vishaGhati.ghati}-${result.vishaGhati.vighati}`);
      console.log(`Amritha Ghati: ${result.amrithaGhati.ghati}-${result.amrithaGhati.vighati}`);
      console.log(`Diva Ghati: ${result.divaGhati.ghati}-${result.divaGhati.vighati}`);
      console.log(`Parama Ghati: ${result.paramaGhati.ghati}-${result.paramaGhati.vighati}`);
      console.log(`Yeshya Ghati: ${result.ashayaGhati.ghati}-${result.ashayaGhati.vighati}`);
      console.log(`Gatadina: ${result.ghatadina.ghati}-${result.ghatadina.vighati}`);
      console.log(`Suryodayadita: ${result.suryodayaditaGhati.ghati}-${result.suryodayaditaGhati.vighati}`);
      
      const engine = new KundliEngine(tc.date, tc.time, tc.lat, tc.lng, "lahiri");
      const chart = engine.getPlanetaryPositions();
      const mandi = chart.find(p => p.id === "Ma");
      console.log(`Mandi: ${mandi?.sign} (${mandi?.longitude.toFixed(2)})`);
    } catch (e) {
      console.log("Error:", e);
    }
  }
}

runTests();
