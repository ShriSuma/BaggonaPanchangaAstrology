import { calculateKundli } from "./src/core/KundliEngine";
import { generateMasterPrediction } from "./src/core/MasterPredictionEngine";
import { PlanetName } from "./src/core/AstroTypes";

async function run() {
  try {
    const kundli = calculateKundli("1993-03-16", "08:15", 13.0827, 77.2913, "Lahiri");
    const result = await generateMasterPrediction(kundli, "Shree", "1993-03-16", "08:15", "en");
    console.log("Success! Result length:", JSON.stringify(result).length);
  } catch (e) {
    console.error("Master prediction error:", e);
  }
}
run();
