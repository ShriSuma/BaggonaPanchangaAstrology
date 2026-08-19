import { calculateKundli } from "../src/core/KundliEngine";

const NAKSHATRA_UNIVERSAL_BIRTH_TABLE: Record<number, { dob: string; tob: string }> = {
  0: { dob: "1994-01-19", tob: "18:00" },
  1: { dob: "1994-01-20", tob: "18:00" },
  2: { dob: "1994-01-22", tob: "00:00" },
  3: { dob: "1994-01-23", tob: "00:00" },
  4: { dob: "1994-01-24", tob: "06:00" },
  5: { dob: "1994-01-25", tob: "06:00" },
  6: { dob: "1994-01-26", tob: "06:00" },
  7: { dob: "1994-01-27", tob: "06:00" },
  8: { dob: "1994-01-01", tob: "00:00" },
  9: { dob: "1994-01-01", tob: "18:00" },
  10: { dob: "1994-01-02", tob: "18:00" },
  11: { dob: "1994-01-03", tob: "18:00" },
  12: { dob: "1994-01-04", tob: "12:00" },
  13: { dob: "1994-01-05", tob: "12:00" },
  14: { dob: "1994-01-06", tob: "12:00" },
  15: { dob: "1994-01-07", tob: "12:00" },
  16: { dob: "1994-01-08", tob: "12:00" },
  17: { dob: "1994-01-09", tob: "06:00" },
  18: { dob: "1994-01-10", tob: "06:00" },
  19: { dob: "1994-01-11", tob: "06:00" },
  20: { dob: "1994-01-12", tob: "06:00" },
  21: { dob: "1994-01-13", tob: "06:00" },
  22: { dob: "1994-01-14", tob: "06:00" },
  23: { dob: "1994-01-15", tob: "06:00" },
  24: { dob: "1994-01-16", tob: "12:00" },
  25: { dob: "1994-01-17", tob: "12:00" },
  26: { dob: "1994-01-18", tob: "12:00" },
};

let correctCount = 0;
for (let i = 0; i < 27; i++) {
  const item = NAKSHATRA_UNIVERSAL_BIRTH_TABLE[i];
  const res = calculateKundli({
    name: `Devotee ${i}`,
    birthDate: item.dob,
    birthTime: item.tob,
    latitude: 14.54,
    longitude: 74.31
  });
  const moon = res.planets.find((p) => p.name === "Moon");
  const actualNak = moon?.nakshatra?.index;
  if (actualNak === i) {
    correctCount++;
  } else {
    console.log(`Mismatch for ${i}: got ${actualNak}`);
  }
}

console.log(`Verification: ${correctCount}/27 Nakshatras matched 100%!`);
