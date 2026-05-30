import { siderealLongitudes } from "./src/core/EphemerisEngine";

const l = siderealLongitudes(new Date("1993-05-31T09:25:00+05:30"), "lahiri", "mean");

function getRashi(deg: number) {
    return Math.floor(deg / 30);
}

const rashis = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"];

console.log("Sun:", getRashi(l.sun), rashis[getRashi(l.sun)]);
console.log("Moon:", getRashi(l.moon), rashis[getRashi(l.moon)]);
console.log("Mars:", getRashi(l.mars), rashis[getRashi(l.mars)]);
console.log("Mercury:", getRashi(l.mercury), rashis[getRashi(l.mercury)]);
console.log("Jupiter:", getRashi(l.jupiter), rashis[getRashi(l.jupiter)]);
console.log("Venus:", getRashi(l.venus), rashis[getRashi(l.venus)]);
console.log("Saturn:", getRashi(l.saturn), rashis[getRashi(l.saturn)]);
console.log("Rahu:", getRashi(l.rahu), rashis[getRashi(l.rahu)]);
console.log("Ketu:", getRashi(l.ketu), rashis[getRashi(l.ketu)]);

