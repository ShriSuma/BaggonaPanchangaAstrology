const { calculateTraditionalBaggona } = require("../src/core/TraditionalBaggonaEngine");

try {
  calculateTraditionalBaggona("1993-05-31", "09:25", 12.9716, 77.5946, "lahiri");
  console.log("Success");
} catch(e) {
  console.log("ERR:", e);
}
