import { calculateKundli } from "../src/core/KundliEngine";
import { PlanetName } from "../src/core/AstroTypes";

const context1 = {
  name: "Friend 1",
  birthDate: "1993-03-16",
  birthTime: "01:40",
  latitude: 12.9716, // Bangalore default
  longitude: 77.5946
};

const context2 = {
  name: "Friend 2",
  birthDate: "1993-11-04",
  birthTime: "09:15",
  latitude: 12.9716,
  longitude: 77.5946
};

function analyzeChart(context: any) {
  const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
  console.log(`\nChart for ${context.name}`);
  console.log(`Lagna: ${kundli.lagnaRashi.name}`);
  
  const planets = kundli.planets;
  planets.forEach(p => {
    console.log(`${p.name}: House ${p.house}, Rashi ${p.rashi.name}`);
  });
}

analyzeChart(context1);
analyzeChart(context2);
