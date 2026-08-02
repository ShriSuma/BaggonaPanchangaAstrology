import type { KundliOutput } from "./AstroTypes";
import type { BhuktiData } from "./PredictionSynthesizer";
import { rashiIndexInHouse, signLord } from "./KundliInsightsEngine";
import { AyurdayaEngine } from "./AyurdayaEngine";

function getKannadaPlanetName(planetName: string): string {
  const map: Record<string, string> = {
    Sun: "ಸೂರ್ಯ",
    Moon: "ಚಂದ್ರ",
    Mars: "ಕುಜ",
    Mercury: "ಬುಧ",
    Jupiter: "ಗುರು",
    Venus: "ಶುಕ್ರ",
    Saturn: "ಶನಿ",
    Rahu: "ರಾಹು",
    Ketu: "ಕೇತು",
  };
  return map[planetName] || planetName;
}

function evaluateDomain(kundli: KundliOutput, houseNum: number, domainName: string, dashaData: BhuktiData | null): string {
  const lagnaIdx = kundli.lagnaRashi.index;
  const signIdx = rashiIndexInHouse(lagnaIdx, houseNum);
  const lord = signLord(signIdx);
  const lordPlanet = kundli.planets.find((p) => p.name === lord);

  const knLord = getKannadaPlanetName(lord);

  let good = "";
  let bad = "";
  let feeling = "";

  if (lordPlanet) {
    if ([1, 4, 7, 10, 5, 9, 2, 11].includes(lordPlanet.house)) {
      good = `ಖಂಡಿತ, ನಿಮ್ಮ ${domainName} ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ಈಗಿನ ಗ್ರಹಗತಿಗಳು ನಿಮಗೆ ಅದ್ಭುತವಾದ ಆಶೀರ್ವಾದಗಳನ್ನು ನೀಡುತ್ತಿವೆ. ಈ ವಿಚಾರದಲ್ಲಿ ನಿಮ್ಮನ್ನು ಮುನ್ನಡೆಸುವ ಗ್ರಹವಾದ ${knLord} ಈಗ ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ಥಾನದಲ್ಲಿ (ಮನೆ ${lordPlanet.house}) ಕುಳಿತಿದ್ದಾನೆ. ಇದರ ಅರ್ಥ, ಈ ವಿಷಯದಲ್ಲಿ ನಿಮಗೆ ನೈಸರ್ಗಿಕ ಬೆಂಬಲ, ಹಠಾತ್ ಯಶಸ್ಸು ಮತ್ತು ಎಲ್ಲವೂ ಸುಸೂತ್ರವಾಗಿ ನಡೆಯುವ ಸಾಧ್ಯತೆಗಳಿವೆ. ಇದು ನಿಜಕ್ಕೂ ನಿಮಗೆ ಶುಭ ಸಮಯ.`;
      bad = `ಆದರೆ ಒಂದು ಸಣ್ಣ ಕಿವಿಮಾತು: ಗ್ರಹಗಳು ಎಷ್ಟೇ ಒಳ್ಳೆಯ ಸ್ಥಾನದಲ್ಲಿದ್ದರೂ, ನಮ್ಮ ಪ್ರಯತ್ನ ಇಲ್ಲದೆ ಏನೂ ಆಗುವುದಿಲ್ಲ. 'ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿಯೇ ಆಗುತ್ತದೆ' ಎಂದು ಸುಮ್ಮನೆ ಕೂರಬೇಡಿ. ನೀವು ಸ್ವಲ್ಪ ಶ್ರಮ ಹಾಕಿದರೆ, ಈ ಸಮಯದ ಪೂರ್ಣ ಲಾಭವನ್ನು ನಿಮ್ಮದಾಗಿಸಿಕೊಳ್ಳಬಹುದು.`;
    } else if ([6, 8, 12].includes(lordPlanet.house)) {
      good = `ನಿಮ್ಮ ${domainName} ವಿಚಾರದಲ್ಲಿ, ಇದನ್ನು ನಿಯಂತ್ರಿಸುವ ಗ್ರಹವಾದ ${knLord} ಈಗ ನಿಮ್ಮನ್ನು ಆಳವಾಗಿ ಪರೀಕ್ಷಿಸುವ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ. ಆದರೆ ಇದರಿಂದ ಭಯಪಡುವ ಅಗತ್ಯವಿಲ್ಲ. ಈ ಗ್ರಹಗತಿ ನಿಮ್ಮಲ್ಲಿ ಅಸಾಧಾರಣವಾದ ಧೈರ್ಯ ಮತ್ತು ಯಾವುದನ್ನಾದರೂ ಎದುರಿಸುವ ಶಕ್ತಿಯನ್ನು ತುಂಬುತ್ತಿದೆ. ಇದು ನಿಮ್ಮನ್ನು ಮಾನಸಿಕವಾಗಿ ಮತ್ತು ಭಾವನಾತ್ಮಕವಾಗಿ ಬಹಳ ಗಟ್ಟಿಗೊಳಿಸುವ ಸಮಯ.`;
      bad = `ನೀವು ಈಗ ಈ ವಿಚಾರದಲ್ಲಿ ಕೆಲವು ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು, ವಿಳಂಬ ಅಥವಾ ಸ್ವಲ್ಪ ಬೇಸರವನ್ನು ಅನುಭವಿಸುತ್ತಿರಬಹುದು. ಕೆಲವೊಮ್ಮೆ 'ಎಷ್ಟು ಕಷ್ಟಪಟ್ಟರೂ ಕೆಲಸ ಆಗುತ್ತಿಲ್ಲ' ಎಂದು ಅನಿಸಬಹುದು. ಆದರೆ ನಂಬಿ, ಈ ಕಷ್ಟಗಳು ನಿಮ್ಮನ್ನು ಒಡೆಯುವುದಕ್ಕಲ್ಲ, ಬದಲಾಗಿ ಭವಿಷ್ಯಕ್ಕಾಗಿ ನಿಮ್ಮನ್ನು ಇನ್ನಷ್ಟು ಗಟ್ಟಿಯಾಗಿ ರೂಪಿಸಲು ಬಂದಿವೆ. ತಾಳ್ಮೆ ಇರಲಿ.`;
    } else {
      good = `ನಿಮ್ಮ ${domainName} ವಿಚಾರವನ್ನು ನೋಡಿಕೊಳ್ಳುವ ಗ್ರಹವಾದ ${knLord} ಈಗ ಬಹಳ ಸಮತೋಲಿತ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ. ಇದರಿಂದಾಗಿ ಈ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮಗೆ ಯಾವುದೇ ದೊಡ್ಡ ಏರುಪೇರುಗಳಿಲ್ಲದೆ, ನೆಮ್ಮದಿಯ ಮತ್ತು ಸ್ಥಿರವಾದ ವಾತಾವರಣ ಇರಲಿದೆ. ನೀವು ಬಹಳ ಪ್ರಾಯೋಗಿಕವಾಗಿ ಯೋಚಿಸಿ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತೀರಿ.`;
      bad = `ಕೆಲವೊಮ್ಮೆ ಸಣ್ಣಪುಟ್ಟ ಗೊಂದಲಗಳು ಬರಬಹುದು, ಆದರೆ ನಿಮ್ಮ ಸಹಜವಾದ ಶಾಂತ ಸ್ವಭಾವ ಮತ್ತು ತಾಳ್ಮೆಯಿಂದ ನೀವು ಅವುಗಳನ್ನು ಸುಲಭವಾಗಿ ದಾಟಿ ಮುಂದೆ ಹೋಗುತ್ತೀರಿ.`;
    }
  }

  if (dashaData) {
    const knMaha = getKannadaPlanetName(dashaData.maha.planet);
    const knBhukti = getKannadaPlanetName(dashaData.bhukti);

    if (dashaData.maha.planet === lord || dashaData.bhukti === lord) {
      feeling = `ವಿಶೇಷವಾಗಿ ಗಮನಿಸಬೇಕಾದ ಅಂಶವೆಂದರೆ, ಈಗ ನಿಮಗೆ ${knMaha} ಮಹಾದಶೆ ಮತ್ತು ${knBhukti} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿರುವುದರಿಂದ, ನಿಮ್ಮ ಜೀವನದ ಈ ಘಟ್ಟ ಬಹಳ ಪ್ರಮುಖವಾಗಿದೆ. ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಗಮನ ಮತ್ತು ಶಕ್ತಿ ಈಗ ಈ ವಿಚಾರದ ಮೇಲೆಯೇ ಇದೆ. ಇದು ಬದಲಾವಣೆಯ ಸಮಯ, ಹಾಗಾಗಿ ಸ್ವಲ್ಪ ಆಯಾಸ ಅನಿಸುವುದು ಸಹಜ. ನಿಮ್ಮ ಬಗ್ಗೆ ನೀವು ಕಾಳಜಿ ವಹಿಸಿ.`;
    } else {
      feeling = `ಈಗ ನಿಮಗೆ ${knMaha} ಮಹಾದಶೆ ನಡೆಯುತ್ತಿದ್ದರೂ, ನಿಮ್ಮ ${domainName} ವಿಚಾರವು ಒಳಗೊಳಗೇ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಒಂದು ಆಸೆಯಾಗಿ ಉಳಿದಿದೆ. ಎಲ್ಲವೂ ತನ್ನದೇ ಆದ ಸಮಯದಲ್ಲಿ ಕೈಗೂಡುತ್ತದೆ. ಬ್ರಹ್ಮಾಂಡಕ್ಕೆ ನಿಮ್ಮ ಬಗ್ಗೆ ಕಾಳಜಿ ಇದೆ, ಹಾಗಾಗಿ ಆತುರ ಬೇಡ. ದಿನಕ್ಕೊಂದರಂತೆ ಹೆಜ್ಜೆ ಇಡಿ.`;
    }
  } else {
    feeling = `ನೀವು ಈಗ ಒಂದು ಪ್ರಮುಖ ಬದಲಾವಣೆಯ ಹಂತದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ${domainName} ಬಗ್ಗೆ ಯೋಚಿಸುವಾಗ, ಸದ್ಯಕ್ಕೆ ಸ್ವಲ್ಪ ವಿರಮಿಸಿ, ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸಿಕೊಂಡು ಮುಂದಿನ ಒಳ್ಳೆಯ ದಿನಗಳಿಗಾಗಿ ತಯಾರಾಗುವುದು ಉತ್ತಮ.`;
  }

  return `${good}\n\n${bad}\n\n${feeling}`;
}

export function generateChatResponse(
  kundli: KundliOutput,
  currentBhuktiData: BhuktiData | null,
  domainId: string
): string {
  if (domainId === "lifespan") {
    const sunP = kundli.planets.find((p) => p.name === "Sun");
    const sunDegree = sunP ? sunP.degree : 0;
    const pData = AyurdayaEngine.mapPlanets(kundli.planets, sunDegree);
    const ayurdaya = AyurdayaEngine.calculateAyurdaya(pData, kundli.ascendant);
    
    // We will extract the numbers for dynamic insertion
    const match = ayurdaya.formattedText.match(/(\d+)\s*Years,\s*(\d+)\s*Months,\s*(\d+)\s*Days/i);
    let years = match ? match[1] : "0";
    let months = match ? match[2] : "0";
    let days = match ? match[3] : "0";

    return `ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿದಾಗ, ನಿಮ್ಮ ಆಯುರ್ದಾಯ (ಜೀವಿತಾವಧಿ) ಅಂದಾಜು ${years} ವರ್ಷ, ${months} ತಿಂಗಳು ಮತ್ತು ${days} ದಿನಗಳು ಎಂದು ತೋರಿಸುತ್ತಿದೆ.\n\nಇದು ನಿಜಕ್ಕೂ ಒಂದು ದೊಡ್ಡ ಆಶೀರ್ವಾದ. ಆದರೆ ನೆನಪಿಡಿ, ಬದುಕಿನಲ್ಲಿ ಎಷ್ಟು ವರ್ಷ ಬದುಕುತ್ತೇವೆ ಎನ್ನುವುದಕ್ಕಿಂತ, ಬದುಕಿರುವಷ್ಟು ದಿನ ಎಷ್ಟು ಸಂತೋಷದಿಂದ ಇದ್ದೇವೆ ಎನ್ನುವುದು ಮುಖ್ಯ. ಈ ಅಮೂಲ್ಯವಾದ ಸಮಯವನ್ನು ಒಳ್ಳೆಯ ಕೆಲಸಗಳಿಗೆ ಬಳಸಿ.\n\nಜ್ಯೋತಿಷ್ಯವು ನಮ್ಮ ಹಾದಿಯನ್ನು ಮಾತ್ರ ತೋರಿಸುತ್ತದೆ, ಆದರೆ ನಮ್ಮ ದಿನನಿತ್ಯದ ಅಭ್ಯಾಸಗಳು, ನಾವು ಮಾಡುವ ಕರ್ಮಗಳು ಮತ್ತು ನಮ್ಮ ಆರೋಗ್ಯದ ಕಾಳಜಿಯೇ ನಮ್ಮ ನಿಜವಾದ ಆಯಸ್ಸನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ. ಒಬ್ಬ ಸ್ನೇಹಿತನಾಗಿ ನಾನು ಹೇಳುವುದಿಷ್ಟೇ: ಪ್ರತಿದಿನ ನಿಮ್ಮ ಆರೋಗ್ಯ ಮತ್ತು ನೆಮ್ಮದಿಗೆ ಹೆಚ್ಚಿನ ಪ್ರಾಮುಖ್ಯತೆ ಕೊಡಿ.`;
  } else if (domainId === "marriage") {
    return evaluateDomain(kundli, 7, "ಮದುವೆ ಮತ್ತು ದಾಂಪತ್ಯ ಜೀವನದ", currentBhuktiData);
  } else if (domainId === "children") {
    return evaluateDomain(kundli, 5, "ಮಕ್ಕಳು ಮತ್ತು ಸಂತಾನದ", currentBhuktiData);
  } else if (domainId === "job") {
    return evaluateDomain(kundli, 10, "ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ ಜೀವನದ", currentBhuktiData);
  } else if (domainId === "newHome") {
    return evaluateDomain(kundli, 4, "ಸ್ವಂತ ಮನೆ ಅಥವಾ ಆಸ್ತಿ ಖರೀದಿಯ", currentBhuktiData);
  } else if (domainId === "family") {
    return evaluateDomain(kundli, 2, "ಕುಟುಂಬ ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿತಿಯ", currentBhuktiData);
  } else if (domainId === "father") {
    return evaluateDomain(kundli, 9, "ತಂದೆಯ ಆರೋಗ್ಯ ಮತ್ತು ಅದೃಷ್ಟದ", currentBhuktiData);
  } else if (domainId === "dasha") {
    if (currentBhuktiData) {
      const knMaha = getKannadaPlanetName(currentBhuktiData.maha.planet);
      const knBhukti = getKannadaPlanetName(currentBhuktiData.bhukti);
      return `ನಿಮಗೆ ಈಗ ${knMaha} ಮಹಾದಶೆ ಮತ್ತು ${knBhukti} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ.\n\nಈ ಸಮಯದಲ್ಲಿ ಈ ಎರಡು ಗ್ರಹಗಳ ಶಕ್ತಿಗಳು ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ನೇರವಾಗಿ ಪ್ರಭಾವ ಬೀರುತ್ತಿವೆ. ಇದರಿಂದಾಗಿ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು, ಆದ್ಯತೆಗಳು ಮತ್ತು ಜೀವನದ ಗುರಿಗಳಲ್ಲಿ ನೀವು ದೊಡ್ಡ ಬದಲಾವಣೆಯನ್ನು ಅನುಭವಿಸುತ್ತಿರಬಹುದು.\n\nನನ್ನ ಸಲಹೆ ಏನೆಂದರೆ: ಈ ${knMaha} ದಶೆಯು ತರುವ ಕಷ್ಟಗಳಾಗಲಿ ಅಥವಾ ಸಂತೋಷಗಳಾಗಲಿ, ಅವುಗಳನ್ನು ಪ್ರೀತಿಯಿಂದ ಸ್ವೀಕರಿಸಿ. ಅದರ ವಿರುದ್ಧ ಹೋರಾಡಲು ಹೋಗಬೇಡಿ, ಬದಲಾಗಿ ಆ ಹರಿವಿನ ಜೊತೆಯಲ್ಲೇ ಸಾಗಿ. ಬ್ರಹ್ಮಾಂಡಕ್ಕೆ ನಿಮ್ಮನ್ನು ಎಲ್ಲಿಗೆ ಒಯ್ಯಬೇಕು ಎಂಬುದು ಖಂಡಿತವಾಗಿ ತಿಳಿದಿದೆ.`;
    } else {
      return "ನಿಮ್ಮ ಜೀವನದ ದಶೆಯಲ್ಲಿ ಈಗ ಒಂದು ಬದಲಾವಣೆಯ ಹಂತ ನಡೆಯುತ್ತಿದೆ. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ದಯವಿಟ್ಟು ಮುಖ್ಯ ಪುಟದಲ್ಲಿರುವ 'ಪ್ರಸ್ತುತ ದಶಾ ಮತ್ತು ಭುಕ್ತಿ' ವಿಭಾಗವನ್ನು ಗಮನಿಸಿ.";
    }
  }

  return "ಕ್ಷಮಿಸಿ, ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯ পণ্ডিতರನ್ನು ಸಂಪರ್ಕಿಸಿ.";
}
