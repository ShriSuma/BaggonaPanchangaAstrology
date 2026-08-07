import { siderealLongitudes, getNakshatraStart, getNakshatraEnd } from "../src/core/VedicCalculations";

function analyze(dateStr: string, timeStr: string, name: string) {
    const b = new Date(`${dateStr}T${timeStr}:00Z`); // Roughly...
    console.log(`\n=== ${name} ===`);
    const nStart = getNakshatraStart(b, 'lahiri');
    const nEnd = getNakshatraEnd(b, 'lahiri');
    console.log("Nakshatra Start:", nStart.toISOString());
    console.log("Nakshatra End:  ", nEnd.toISOString());
}

analyze("2007-03-20", "09:10", "Abhiram");
analyze("1995-09-21", "05:50", "Shamburu"); // approximate date for Bhadrapada Krishna 13
