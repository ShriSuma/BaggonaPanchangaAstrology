import { calculateKundli } from "../src/core/KundliEngine";

const nakshatraRefTable: Record<number, { dob: string; tob: string; rashi: number }> = {
  0: { dob: "1994-04-12", tob: "10:00", rashi: 0 },  // Ashwini (Mesha)
  1: { dob: "1994-04-13", tob: "14:00", rashi: 0 },  // Bharani (Mesha)
  2: { dob: "1994-04-14", tob: "18:00", rashi: 1 },  // Krittika (Vrishabha)
  3: { dob: "1994-04-16", tob: "02:00", rashi: 1 },  // Rohini (Vrishabha)
  4: { dob: "1994-04-17", tob: "10:00", rashi: 1 },  // Mrigashira (Vrishabha)
  5: { dob: "1994-04-18", tob: "16:00", rashi: 2 },  // Ardra (Mithuna)
  6: { dob: "1994-04-20", tob: "00:00", rashi: 2 },  // Punarvasu (Mithuna)
  7: { dob: "1994-04-21", tob: "10:00", rashi: 3 },  // Pushya (Karka)
  8: { dob: "1994-04-22", tob: "16:00", rashi: 3 },  // Ashlesha (Karka)
  9: { dob: "1994-04-24", tob: "00:00", rashi: 4 },  // Magha (Simha)
  10: { dob: "1994-04-25", tob: "08:00", rashi: 4 }, // Purva Phalguni (Simha)
  11: { dob: "1994-04-26", tob: "16:00", rashi: 4 }, // Uttara Phalguni (Simha)
  12: { dob: "1994-04-28", tob: "02:00", rashi: 5 }, // Hasta (Kanya)
  13: { dob: "1994-04-29", tob: "10:00", rashi: 5 }, // Chitra (Kanya)
  14: { dob: "1994-04-30", tob: "18:00", rashi: 6 }, // Swati (Tula)
  15: { dob: "1994-05-02", tob: "04:00", rashi: 6 }, // Vishakha (Tula)
  16: { dob: "1994-05-03", tob: "12:00", rashi: 7 }, // Anuradha (Vrischika)
  17: { dob: "1994-05-04", tob: "20:00", rashi: 7 }, // Jyeshtha (Vrischika)
  18: { dob: "1993-03-16", tob: "01:40", rashi: 8 }, // Mula (Dhanu - Manoj)
  19: { dob: "1994-05-07", tob: "12:00", rashi: 8 }, // Purva Ashadha (Dhanu)
  20: { dob: "1994-05-08", tob: "20:00", rashi: 8 }, // Uttara Ashadha (Dhanu)
  21: { dob: "1994-05-10", tob: "04:00", rashi: 9 }, // Shravana (Makara)
  22: { dob: "1994-05-11", tob: "12:00", rashi: 9 }, // Dhanishta (Makara)
  23: { dob: "1994-05-12", tob: "20:00", rashi: 10 },// Shatabhisha (Kumbha)
  24: { dob: "1993-03-22", tob: "23:40", rashi: 11 },// Purva Bhadrapada (Meena - Dilip)
  25: { dob: "1994-05-15", tob: "12:00", rashi: 11 },// Uttara Bhadrapada (Meena)
  26: { dob: "1994-05-16", tob: "20:00", rashi: 11 } // Revati (Meena)
};

console.log("=== Testing 27 Nakshatras Reference Table ===");
for (let nk = 0; nk < 27; nk++) {
  const ref = nakshatraRefTable[nk];
  if (!ref) continue;
  const res = calculateKundli({
    name: `User Nakshatra ${nk}`,
    birthDate: ref.dob,
    birthTime: ref.tob,
    latitude: 14.54,
    longitude: 74.31
  });

  const moon = res.planets.find(p => p.name === "Moon");
  const actualNak = moon?.nakshatra?.index;
  const actualRashi = moon?.rashi?.index;

  console.log(`Nak ${nk.toString().padStart(2, "0")}: expected nak=${nk.toString().padStart(2, "0")} | actual nak=${actualNak?.toString().padStart(2, "0")}, rashi=${actualRashi}`);
}
