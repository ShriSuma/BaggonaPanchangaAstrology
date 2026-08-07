import fs from "fs";
const p = "src/core/VedicCalculations.ts";
let c = fs.readFileSync(p, "utf-8");
c = c.replace(
  /if \(\!vishaStart \&\& vTime\.getTime\(\) \>\= sunriseUtc\.getTime\(\)\) \{/g,
  `console.log("Nak=" + nakIdx + " aTime=" + aTime.toISOString() + " sV=" + sunriseUtc.toISOString() + " start=" + start.toISOString());
    if (!vishaStart && vTime.getTime() >= sunriseUtc.getTime()) {`
);
fs.writeFileSync(p, c);
