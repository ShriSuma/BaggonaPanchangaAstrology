import { tryParseDate } from "../src/pages/AIAstrologerPage";
import { calculateKundliWithPlaceSun } from "../src/core/KundliEngine";
import { useAppStore } from "../src/stores/appStore";

async function main() {
  const text = "ಹೆಸರು ಪ್ರಮೋದ ಗೋತ್ರ ವಸಿಷ್ಠ ದಿನಾಂಕ 31 ಮೇ 1993 ಬೆಳಿಗ್ಗೆ 9 25ಕ್ಕೆ ಜನನ";
  const extracted = tryParseDate(text);
  console.log("Extracted:", extracted);

  if (extracted.date && extracted.time) {
    const ymd = `${extracted.date.getFullYear()}-${(extracted.date.getMonth()+1).toString().padStart(2, '0')}-${extracted.date.getDate().toString().padStart(2, '0')}`;
    const inputPayload = {
      name: "User",
      birthDate: ymd,
      birthTime: extracted.time,
      latitude: 12.9716,
      longitude: 77.5946,
    };
    console.log("Input:", inputPayload);
    try {
      const output = await calculateKundliWithPlaceSun(inputPayload, { ayanamsaModel: "lahiri", nodeType: "mean" });
      console.log("Success!");
    } catch(e) {
      console.error("Caught error:", e);
    }
  } else {
    console.log("Not both date and time");
  }
}
main();
