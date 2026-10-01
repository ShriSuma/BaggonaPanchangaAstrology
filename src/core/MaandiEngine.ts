import type { PlaceSunTimes } from "./birthSunTimes";
import { calculateExactNoaaSunTimes, sunTimesSyncForBirth, vedicWeekdayAtBirth } from "./birthSunTimes";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { calculateLocalSiderealTime, dateToJulianUt, degreeToRashi, getAyanamsa, normalizeDegree } from "./AstroMath";
import type { AyanamsaModel } from "./AstroTypes";
import { ascendantTropicalDegrees, meanObliquityDegrees } from "./EphemerisEngine";
import { formatClockAtPlace } from "./placeTime";
import { patrikaNavamshaFromDegree } from "./localeNumbers";

const MANDI_GHATI_DAY = [26, 22, 18, 14, 10, 6, 2]; // Sun=0, Mon=1...
const MANDI_GHATI_NIGHT = [10, 6, 2, 26, 22, 18, 14];

export const computeMaandi = (
  birthUtc: Date,
  latitude: number,
  longitude: number,
  pincode = "",
  ayanamsaModel: AyanamsaModel = "lahiri",
  sunTimes?: PlaceSunTimes
): {
  degree: number;
  rashi: ReturnType<typeof degreeToRashi>;
  navamsha: number;
  windowLabel: string;
} => {
  const actualSunTimes = sunTimes ?? sunTimesSyncForBirth(birthUtc, latitude, longitude, pincode);

  const birthMs = birthUtc.getTime();
  const sunriseMs = actualSunTimes.sunrise.getTime();
  const sunsetMs = actualSunTimes.sunset.getTime();

  let targetMs = 0;
  let wd = 0;
  const isNight = birthMs >= sunsetMs || birthMs < sunriseMs;

  if (isNight) {
    if (birthMs < sunriseMs) {
      // Night birth before sunrise (belongs to previous Hindu day).
      // vedicWeekdayAtBirth automatically detects birthUtc < sunrise and steps back 24h.
      wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
      
      const yesterdayDate = new Date(birthUtc.getTime() - 86_400_000);
      const yesterdayNoaa = calculateExactNoaaSunTimes(yesterdayDate, latitude, longitude);
      const yesterdaySun = resolveSunTimesForJyotish(yesterdayNoaa, latitude, longitude, pincode);
      const yesterdaySunsetMs = yesterdaySun.sunset.getTime();
      
      const nightMs = sunriseMs - yesterdaySunsetMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = yesterdaySunsetMs + (ghati / 30) * nightMs;
    } else {
      // Night birth after sunset (belongs to today's Hindu day).
      wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
      
      const tomorrowDate = new Date(birthUtc.getTime() + 86_400_000);
      const tomorrowNoaa = calculateExactNoaaSunTimes(tomorrowDate, latitude, longitude);
      const tomorrowSun = resolveSunTimesForJyotish(tomorrowNoaa, latitude, longitude, pincode);
      const tomorrowSunriseMs = tomorrowSun.sunrise.getTime();
      
      const nightMs = tomorrowSunriseMs - sunsetMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = sunsetMs + (ghati / 30) * nightMs;
    }
  } else {
    // Daytime birth
    wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
    const dayMs = sunsetMs - sunriseMs;
    const ghati = MANDI_GHATI_DAY[wd] ?? 14;
    targetMs = sunriseMs + (ghati / 30) * dayMs;
  }

  const mid = new Date(targetMs);
  const jd = dateToJulianUt(mid);
  const lst = calculateLocalSiderealTime(mid, longitude);
  const eps = meanObliquityDegrees(jd);
  const ascTropical = ascendantTropicalDegrees(lst, latitude, eps);
  const ayan = getAyanamsa(mid, ayanamsaModel);
  const deg = normalizeDegree(ascTropical - ayan);

  const clockTime = formatClockAtPlace(mid, "en-IN", latitude, longitude, pincode);
  const ghatiVal = isNight ? MANDI_GHATI_NIGHT[wd] : MANDI_GHATI_DAY[wd];
  const windowLabel = `${ghatiVal} Gh (${clockTime})`;

  return {
    degree: deg,
    rashi: degreeToRashi(deg),
    navamsha: patrikaNavamshaFromDegree(deg),
    windowLabel
  };
};

export interface MaandiPerspectiveInquest {
  title: string;
  paragraph1: string;
  paragraph2: string;
  house: number;
}

export const getMaandiHouseFromLagna = (maandiRashiIndex: number, lagnaRashiIndex: number): number => {
  return (((maandiRashiIndex - lagnaRashiIndex) % 12 + 12) % 12) + 1;
};

interface HouseInterpretation {
  title: Record<string, string>;
  paragraph1: Record<string, string>;
  paragraph2: Record<string, string>;
}

const MAANDI_PERSPECTIVE_DATA: Record<number, HouseInterpretation> = {
  1: {
    title: {
      kn: "ಆಂತರಿಕ ತೇಜಸ್ಸು, ನಿಗೂಢ ಚೇತನ ಹಾಗೂ ಆತ್ಮಸ್ಥೈರ್ಯ",
      en: "Inner Resilience, Soul Awakening & Sacred Self-Reliance",
      hi: "आंतरिक तेज, आत्मबल एवं गूढ़ चेतना शक्ति",
      te: "ఆంతరంగిక చైతన్యం & ఆత్మస్థైర్యం",
      ta: "உள் வலிமை & ஆன்ம விழிப்புணர்வு"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಜೀವನದ ಅಂತರಾಳವನ್ನು ಗಮನಿಸಿದಾಗ, ಬಾಹ್ಯ ಪ್ರಪಂಚಕ್ಕೆ ನೀವು ಅಚಲ ಧೈರ್ಯಶಾಲಿ ಮತ್ತು ಗಂಭೀರ ವ್ಯಕ್ತಿಯಂತೆ ಕಂಡರೂ, ನಿಮ್ಮ ಮನಸ್ಸಿನೊಳಗೆ ನಿರಂತರವಾಗಿ ಒಂದು ಮೌನ ಹೋರಾಟ ನಡೆಯುತ್ತಿರುತ್ತದೆ. ಯಾವುದೇ ಕೆಲಸವನ್ನು ಇತರರಿಗಿಂತ ಎರಡು ಪಟ್ಟು ಶ್ರಮವಹಿಸಿ ನಿರ್ವಹಿಸಿದರೂ, ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಸಿಗಬೇಕಾದ ಮನ್ನಣೆ ಅಥವಾ ಫಲಿತಾಂಶವು ಕೈತಪ್ಪಿ ಹೋಗುವಂತಹ ಅನುಭವಗಳು ನಿಮ್ಮನ್ನು ಅನೇಕ ಬಾರಿ ಕಾಡಿರುತ್ತವೆ. ನಿಮ್ಮ ಆಂತರ್ಯದಲ್ಲಿ ಒಂದು ವಿಧದ ನಿಗೂಢ ಒಂಟಿತನ ಹಾಗೂ ಸ್ವಾವಲಂಬನೆಯ ಅದಮ್ಯ ಛಲವಿದೆ. ಅನ್ಯಾಯವನ್ನು ಎಂದಿಗೂ ಸಹಿಸದ ನಿಮ್ಮ ನೇರ ನಡೆ ಮತ್ತು ಕರ್ತವ್ಯನಿಷ್ಠೆ ಕೆಲವೊಮ್ಮೆ ನಿಮ್ಮ ಅತ್ಯಂತ ಆಪ್ತರಲ್ಲೂ ತಪ್ಪು ಕಲ್ಪನೆಗಳನ್ನು ಹುಟ್ಟುಹಾಕುತ್ತದೆ. ಶಾರೀರಿಕ ಆಯಾಸಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ, ಪ್ರತಿಯೊಂದನ್ನೂ ಪರಿಪೂರ್ಣವಾಗಿ ಒಬ್ಬರೇ ನಿಭಾಯಿಸಬೇಕೆಂಬ ಮಾನಸಿಕ ಒತ್ತಡವು ನಿಮ್ಮ ವಿಶ್ರಾಂತಿಯನ್ನು ಕಸಿದುಕೊಳ್ಳುತ್ತದೆ.",
      en: "Observing the deepest chambers of your inner life, while the outer world perceives you as an unshakable, deeply composed, and authoritative individual, you carry an unspoken solitary battle within your soul. You frequently experience that despite putting in twice the effort of others, true recognition and the final fruits of your toil seem to stall right at the threshold. A profound current of solitary self-reliance defines your nature; you fiercely avoid being a burden to anyone. Your uncompromising moral standards and transparent conduct sometimes cause even close companions to misunderstand your serious demeanor. More than physical exhaustion, the relentless internal pressure to hold everything together alone taxes your peace of mind."
    },
    paragraph2: {
      kn: "ಆದರೆ ಈ ಕಠಿಣ ಪರೀಕ್ಷೆಯೇ ನಿಮ್ಮ ಆತ್ಮವನ್ನು ಅಪೂರ್ವವಾಗಿ ಪುಟವಿಟ್ಟಿದೆ ಎಂಬುದನ್ನು ನೀವು ಅರಿಯಬೇಕು. ನಿಮ್ಮ ಈ ಅಗಾಧವಾದ ಸಹನ ಶಕ್ತಿಯು ಪೂರ್ವಾರ್ಜಿತ ಕರ್ಮದ ಬಿಡುಗಡೆಗೆ ಕಾರಣವಾಗುತ್ತಿದ್ದು, ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಒಂದು ದೈವಿಕ ತಿರುವು ಆರಂಭವಾಗಲಿದೆ. ಇತರರ ಕ್ಷಣಿಕ ಮೆಚ್ಚುಗೆಗಾಗಿ ಹಂಬಲಿಸದೆ ನಿಮ್ಮ ಆತ್ಮಸಾಕ್ಷಿಯನ್ನೇ ಪರಮ ಶಕ್ತಿಯನ್ನಾಗಿಸಿಕೊಂಡಾಗ, ಈ ಕಠೋರ ಅಡೆತಡೆಗಳೇ ನಿಮ್ಮ ಅತಿ ದೊಡ್ಡ ರಕ್ಷಣಾ ಕವಚವಾಗಿ ಬದಲಾಗುತ್ತವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸಂಕಲ್ಪವು ನಿಮ್ಮ ಈ ಮೌನ ತಪಸ್ಸಿಗೆ ಸಾರ್ಥಕತೆಯನ್ನು ಕರುಣಿಸಲಿದೆ. ಪ್ರತಿದಿನ ಸಂಜೆ ಪ್ರಶಾಂತವಾಗಿ ಧ್ಯಾನಸ್ಥರಾಗಿ ಶಿವಪಂಚಾಕ್ಷರಿ ಜಪಿಸುವುದರಿಂದ ಹಾಗೂ ಶನಿವಾರದಂದು ದೀಪಾರಾಧನೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಲ್ಮಷಗಳು ಕರಗಿ, ಅಪೂರ್ವ ಆತ್ಮತೇಜಸ್ಸು ಹಾಗೂ ನಿಶ್ಚಿಂತ ಜೀವನ ನಿಮ್ಮದಾಗಲಿದೆ.",
      en: "Yet, you must recognize that this intense karmic pressure is the very fire that is refining your soul into pure gold. This immense endurance is actively burning away past karmic debts, and a profound spiritual and worldly breakthrough is now quietly taking root in your life. The moment you stop seeking external validation and anchor yourself fully in your sacred inner conscience, these persistent roadblocks transform into an impenetrable spiritual armor. The benevolent grace of Lord Gokarna Mahabaleshwara directly watches over your quiet penance. Dedicating a few moments each twilight to peaceful contemplation, invoking the sacred Shiva Panchakshari, and maintaining serene faith will dissolve all inner shadows, unlocking radiant self-sovereignty, boundless clarity, and enduring peace."
    }
  },
  2: {
    title: {
      kn: "ಆರ್ಥಿಕ ಜಾಗೃತಿ, ವಾಗ್ವಿವೇಕ ಹಾಗೂ ಕುಟುಂಬ ಸಮೃದ್ಧಿ",
      en: "Resource Vigilance, Articulate Wisdom & Prosperity Crossroads",
      hi: "आर्थिक विवेक, वाणी संयम एवं पारिवारिक स्थिरता",
      te: "ఆర్థిక వివేకం & కుటుంబ సమృద్ధి",
      ta: "பொருளாதார விவேகம் & குடும்ப சுபிட்சம்"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಜೀವನ ಪಯಣದಲ್ಲಿ ಧನ ಸಂಪಾದನೆ ಮತ್ತು ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿಗಳ ವಿಷಯದಲ್ಲಿ ನೀವು ಅತ್ಯಂತ ವಿಚಿತ್ರವಾದ ಏರಿಳಿತಗಳನ್ನು ಅನುಭವಿಸಿರುತ್ತೀರಿ. ಪ್ರಾಮಾಣಿಕವಾಗಿ ಕಷ್ಟಪಟ್ಟು ಉಳಿಸಿದ ಹಣವು ನಿರೀಕ್ಷಿಸದ ಕೌಟುಂಬಿಕ ತುರ್ತುಗಳಿಗೆ ಅಥವಾ ಇತರರ ಜವಾಬ್ದಾರಿಗೆ ಖರ್ಚಾಗಿ ಹೋಗುವುದು ನಿಮಗೆ ಆಗಾಗ ಆತಂಕ ತಂದಿರುತ್ತದೆ. ನಿಮ್ಮ ಮಾತುಗಳು ಸತ್ಯವಾಗಿದ್ದರೂ, ಕೆಲವೊಮ್ಮೆ ಅವು ಕಟುವಾಗಿ ಕೇಳಿ ಕುಟುಂಬ ಸದಸ್ಯರಲ್ಲಿ ಮನಸ್ತಾಪಗಳಿಗೆ ದಾರಿಮಾಡಿಕೊಡಬಹುದು. ಹಣಕಾಸಿನ ಯೋಜನೆಗಳು ೯೯% ಪೂರ್ಣಗೊಂಡ ಹಂತದಲ್ಲೇ ಅನಿರೀಕ್ಷಿತ ತಡೆ ಉಂಟಾಗುವುದು ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತದೆ. ಸಂಪತ್ತನ್ನು ಕೂಡಿಡುವ ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಇಚ್ಛೆಯು ಅನೇಕ ಕೌಟುಂಬಿಕ ಹೊಣೆಗಾರಿಕೆಗಳ ನಡುವೆ ಮರೆಯಾಗಿ, ಒಂಟಿಯಾಗಿ ಆರ್ಥಿಕ ಹೊರೆ ಹೊರಬೇಕಾದ ಸನ್ನಿವೇಶಗಳು ಎದುರಾಗುತ್ತವೆ.",
      en: "Throughout your life's financial journey, you have weathered perplexing fluctuations between dedicated accumulation and sudden unanticipated expenses. Money earned through righteous toil often gets diverted toward urgent family emergencies or fulfilling obligations for others, leaving your personal reserves under strain. Even though your words stem from unfiltered truth, their bluntness sometimes sparks unintended friction among loved ones. You know the exact frustration of financial deals and investments halting at the 99% mark just before fruition, demanding superhuman patience to cross the finish line."
    },
    paragraph2: {
      kn: "ಆದಾಗ್ಯೂ, ಈ ಆರ್ಥಿಕ ಸವಾಲುಗಳು ನಿಮಗೆ ನಿಜವಾದ ಮೌಲ್ಯಗಳ ಅರಿವು ಮೂಡಿಸುವ ದೈವಿಕ ಪಾಠಗಳಾಗಿವೆ. ನಿಮ್ಮ ವಾಕ್ ಶಕ್ತಿಯನ್ನು ಸದಾ ಮೃದುವಾಗಿಸಿ, ಸತ್ಯವನ್ನು ಪ್ರೀತಿಯಿಂದ ಹೇಳುವ ಅಭ್ಯಾಸ ಬೆಳೆಸಿಕೊಂಡರೆ ಕುಟುಂಬದ ಎಲ್ಲ ತಪ್ಪುಗ್ರಹಿಕೆಗಳು ತಾವಾಗಿಯೇ ಮರೆಯಾಗುತ್ತವೆ. ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಅನಿರೀಕ್ಷಿತ ಸ್ಥಿರಾಸ್ತಿ ಅಥವಾ ಸ್ಥಿರ ಆದಾಯದ ಬಾಗಿಲುಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಲಕ್ಷ್ಮಿ ಸಹಿತ ಮಹಾಬಲೇಶ್ವರನ ಅನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಸಂಚಿತ ಸಂಪತ್ತು ಸಂರಕ್ಷಿತವಾಗಲಿದೆ. ಪ್ರತಿದಿನ ಅಲ್ಪಸ್ವಲ್ಪ ಅನ್ನದಾನ ಮಾಡುವುದು ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಸದಾ ಧೂಪ-ದೀಪ ಪ್ರಜ್ವಲಿಸುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ಮಾರ್ಗದ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಿ ಸಮೃದ್ಧಿ ತರಲಿದೆ.",
      en: "Yet, these financial crucibles are divine lessons designed to anchor you in genuine material prudence and unshakeable values. As you temper your speech with gentle warmth and speak truth with loving patience, family misunderstandings naturally dissolve. Very soon, unexpected avenues of immovable property and resilient income streams will unlock in direct proportion to your past patience. Under the grace of Lord Gokarna Mahabaleshwara and Mahalakshmi, your accumulated assets will remain divinely protected. Practicing small acts of food charity and keeping sacred lamps lit at home will banish all monetary obstacles and usher in lasting prosperity."
    }
  },
  3: {
    title: {
      kn: "ಅಪಾರ ಧೈರ್ಯ, ಸ್ವಯಂ ಪರಿಶ್ರಮ ಹಾಗೂ ಕಾರ್ಯಸಿದ್ಧಿ",
      en: "Indomitable Courage, Enterprise & Unstoppable Willpower",
      hi: "अदम्य साहस, स्वप्रयत्न एवं कार्य सिद्धि"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದಲ್ಲಿ ಎದ್ದು ಕಾಣುವ ಪ್ರಮುಖ ಗುಣವೆಂದರೆ ಎಂದೂ ಸೋಲೊಪ್ಪದ ಅದಮ್ಯ ಧೈರ್ಯ ಮತ್ತು ಸ್ವಂತ ಕಾಲ ಮೇಲೆ ನಿಲ್ಲುವ ಹಠ. ಆದರೆ ಒಡಹುಟ್ಟಿದವರೊಂದಿಗೆ ಅಥವಾ ನಿಕಟ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಉಂಟಾಗುವ ಸಂವಹನ ಕೊರತೆ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನೋವುಂಟುಮಾಡುತ್ತದೆ. ಯಾವುದೇ ಕೆಲಸವನ್ನು ಸ್ವತಃ ನೀವೇ ಮುಂಚೂಣಿಯಲ್ಲಿ ನಿಂತು ಮುಗಿಸಬೇಕೇ ವಿನಃ, ಇತರರನ್ನು ನಂಬಿ ವಹಿಸಿದ ಕೆಲಸಗಳು ಅರ್ಧದಲ್ಲೇ ನಿಂತುಹೋಗುತ್ತವೆ. ನಿಮ್ಮ ಕೈಯಿಂದ ಉಪಕಾರ ಪಡೆದವರೇ ಕಾಲಾನಂತರದಲ್ಲಿ ಕೃತಘ್ನರಾಗುವುದು ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ಘಾಸಿ ಮಾಡುತ್ತದೆ. ಕೈಗೆತ್ತಿಕೊಂಡ ಸಾಹಸಮಯ ಯೋಜನೆಗಳು ಆರಂಭದಲ್ಲಿ ಕಠಿಣ ವಿರೋಧಗಳನ್ನು ಎದುರಿಸಿದರೂ, ನಿಮ್ಮ ಛಲವು ನಿಮ್ಮನ್ನು ಮುನ್ನಡೆಸುತ್ತದೆ.",
      en: "Your core temperament is distinguished by fearless courage, enterprise, and a fierce refusal to surrender before daunting odds. However, recurring misunderstandings with siblings, neighbors, or close colleagues often leave deep, unvoiced wounds in your heart. You have repeatedly discovered that tasks you manage personally succeed, whereas delegating to others leads to eleventh-hour stagnation. The ingratitude of individuals you selflessly assisted in their times of crisis has tested your faith in human nature. Even when ventures encounter fierce headwinds at their inception, your solitary grit refuses to bow."
    },
    paragraph2: {
      kn: "ಈ ಸಂಘರ್ಷಮಯ ಅನುಭವಗಳೇ ನಿಮ್ಮನ್ನು ಅಪ್ರತಿಮ ನಾಯಕರನ್ನಾಗಿ ರೂಪಿಸುತ್ತಿವೆ. ಇತರರ ಮೇಲಿನ ಅತಿಯಾದ ನಿರೀಕ್ಷೆಯನ್ನು ತ್ಯಜಿಸಿ, ನಿಮ್ಮ ಸ್ವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ದೇವರ ಮೇಲಿನ ವಿಶ್ವಾಸವನ್ನೇ ಆಯುಧವನ್ನಾಗಿಸಿಕೊಂಡರೆ ವಿಜಯ ನಿಮ್ಮದೇ ಆಗಲಿದೆ. ಸಹೋದರ ಅಥವಾ ಮಿತ್ರರೊಂದಿಗಿನ ಹಳೆಯ ಕಹಿ ನೆನಪುಗಳನ್ನು ಕ್ಷಮಿಸಿ ಮರೆತಾಗ ನಿಮ್ಮ ಆಂತರಿಕ ಚೇತನಕ್ಕೆ ಮಹತ್ತರ ಶಕ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ರಕ್ಷಾ ಕವಚವು ನಿಮ್ಮ ಸಾಹಸಗಳಿಗೆ ಜಯವನ್ನು ತಂದುಕೊಡಲಿದೆ. ಸುಬ್ರಹ್ಮಣ್ಯ ಹಾಗೂ ಕಾಲಭೈರವನ ಉಪಾಸನೆಯು ನಿಮ್ಮ ಬಾಕಿ ಉಳಿದಿರುವ ಎಲ್ಲ ಸಾಹಸಮಯ ಕೆಲಸಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಲು ನೆರವಾಗಲಿದೆ.",
      en: "These trials are intentionally molding you into an unyielding leader who depends neither on luck nor on fragile human loyalties. The moment you release past grudges and forgive those who failed you, a floodgate of spiritual vitality returns to your heart. Victory is destined to crown your personal endeavors because your efforts are purified through integrity. The protective shield of Lord Gokarna Mahabaleshwara surrounds your bold initiatives. Contemplating Lord Kartikeya and Bhairava will demolish lingering delays, empowering you to conclude all stalled projects with resounding triumph."
    }
  },
  4: {
    title: {
      kn: "ಮನಃಶಾಂತಿ, ಗೃಹಕ್ಷೇಮ ಹಾಗೂ ಆಂತರಿಕ ನೆಮ್ಮದಿಯ ಅನ್ವೇಷಣೆ",
      en: "Inner Peace, Emotional Sanctuary & Domestic Tranquility",
      hi: "मानसिक शांति, गृह सौख्य एवं अंतःकरण शुद्धि"
    },
    paragraph1: {
      kn: "ಬಾಹ್ಯವಾಗಿ ಸುಖ-ಭೋಗಗಳಿದ್ದರೂ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಆಳದಲ್ಲಿ ಸದಾ ಒಂದು ರೀತಿಯ ಅಶಾಂತಿ ಮತ್ತು ಆತಂಕದ ನೆರಳು ಸುಳಿದಾಡುತ್ತಿರುತ್ತದೆ. ಸ್ವಂತ ಮನೆ ಅಥವಾ ವಾಹನದಂತಹ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅನಗತ್ಯ ಗೊಂದಲಗಳು, ದಸ್ತಾವೇಜು ವಿಳಂಬ ಅಥವಾ ತಾಯಿಯವರ ಆರೋಗ್ಯದ ಬಗೆಗಿನ ನಿರಂತರ ಚಿಂತೆ ನಿಮ್ಮ ನಿದ್ರೆಗೆ ಭಂಗ ತಂದಿರುತ್ತದೆ. ಎಲ್ಲ ಸೌಕರ್ಯಗಳಿದ್ದರೂ ಮನೆಯಲ್ಲಿ ದೀರ್ಘಕಾಲ ನೆಮ್ಮದಿಯಿಂದ ಕುಳಿತುಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗದಂತಹ ಒಂದು ನಿಗೂಢ ಒತ್ತಡ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತದೆ. ಕುಟುಂಬದ ಎಲ್ಲರ ಸಂತೋಷಕ್ಕಾಗಿ ನೀವು ಎಲ್ಲವನ್ನೂ ತ್ಯಾಗ ಮಾಡಿದರೂ, ಮನೆಯವರ ಕಡೆಯಿಂದ ನಿರೀಕ್ಷಿತ ಭಾವನಾತ್ಮಕ ಬೆಂಬಲ ಸಿಗದಿರುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಒಂಟಿತನದ ಭಾವನೆಯನ್ನು ತರುತ್ತದೆ.",
      en: "Beneath whatever outward comforts and conveniences you possess, an elusive shadow of restlessness and subconscious domestic anxiety frequently haunts your quiet moments. Matters concerning home ownership, vehicles, or ancestral properties have been plagued by bureaucratic delays or unexpected complications. Continuous worry regarding your mother's health or emotional well-being has weighed heavily upon your thoughts. Despite your tireless sacrifices to provide safety and warmth for your family, the absence of mutual emotional reassurance often leaves you feeling isolated within your own home."
    },
    paragraph2: {
      kn: "ನಿಮ್ಮ ಈ ಆಂತರಿಕ ತೊಳಲಾಟವು ಬಾಹ್ಯ ಭೌತಿಕ ವಿಷಯಗಳಿಂದ ಮುಕ್ತಿ ಪಡೆದು ಸಾತ್ವಿಕ ನೆಮ್ಮದಿಯನ್ನು ಕಂಡುಕೊಳ್ಳಲು ಬಂದಿರುವ ದೈವಿಕ ಕರೆಯಾಗಿದೆ. ಮನೆಯಲ್ಲಿ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಲು ವಾಸ್ತು ಮತ್ತು ಸಕಾರಾತ್ಮಕ ವಾತಾವರಣವನ್ನು ನಿರ್ಮಿಸುವುದು ಅತಿ ಮುಖ್ಯವಾಗಿದೆ. ತಾಯಿಯವರ ಆಶೀರ್ವಾದವನ್ನು ನಿತ್ಯವೂ ಭಕ್ತಿಯಿಂದ ಪಡೆಯುವುದರಿಂದ ನಿಮ್ಮ ಜನ್ಮದ ಬಹುತೇಕ ಕಷ್ಟಗಳು ಕರಗಿ ನೀರಾಗಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದ ಸ್ಮರಣೆಯು ನಿಮ್ಮ ಗೃಹಕ್ಕೆ ಶಾಂತಿಯನ್ನು ತುಂಬಲಿದೆ. ಮನೆಯಲ್ಲಿ ಗೋಮಯ ದೀಪ ಹಾಗೂ ತುಳಸಿ ಪೂಜೆಯನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮುಂದುವರಿಸಿದರೆ, ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಕಳೆದುಹೋದ ದಿವ್ಯ ನೆಮ್ಮದಿ ಮತ್ತು ಗೃಹ ಸೌಖ್ಯ ಮರಳಿ ದೊರೆಯುವುದು ಖಚಿತ.",
      en: "This emotional yearning is a sacred summons to build your true sanctuary within your own heart rather than depending on external surroundings. Cleansing your living space of negative static and receiving your mother's heartfelt blessings will dissolve the heaviest karmic knot resting upon your domestic life. Remembering the sacred Kotiteertha of Gokarna will restore peaceful vibrations to your dwelling. Lighting pure sesame oil or cow-ghee lamps and nurturing the holy Tulasi plant will permanently dissolve this restlessness, crowning your home with serene harmony and profound mental solace."
    }
  },
  5: {
    title: {
      kn: "ಪೂರ್ವಪುಣ್ಯ ಪ್ರಜ್ಞೆ, ಸೂಕ್ಷ್ಮ ಬುದ್ಧಿಮತ್ತೆ ಹಾಗೂ ದೈವಜ್ಞಾನ",
      en: "Karmic Intuition, Creative Awakening & Dharmic Grace",
      hi: "पूर्वपुण्य संस्कार, सूक्ष्म प्रज्ञा एवं आध्यात्मिक मेधा"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿಯು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾಗಿದ್ದು, ಯಾವುದೇ ವಿಷಯದ ಸಾರವನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಗ್ರಹಿಸುವ ಅಪೂರ್ವ ಪ್ರತಿಭೆ ನಿಮ್ಮಲ್ಲಿದೆ. ಆದರೆ ನಿಮ್ಮ ಸೃಜನಶೀಲ ಯೋಜನೆಗಳು ಅಥವಾ ಹೂಡಿಕೆಗಳು ಫಲಕೊಡುವ ಹಂತದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ನಿರಾಶೆ ಅಥವಾ ಮಕ್ಕಳ ಪ್ರಗತಿಯ ಬಗೆಗಿನ ದೀರ್ಘಕಾಲೀನ ಚಿಂತೆ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿರುತ್ತದೆ. ಹಿಂದಿನ ಜನ್ಮದ ಸಂಚಿತ ಕರ್ಮದ ಒಂದು ಸಣ್ಣ ಗಂಟು ನಿಮ್ಮ ನಿರ್ಧಾರಗಳನ್ನು ಕೆಲವೊಮ್ಮೆ ಸಂದಿಗ್ಧತೆಗೆ ತಳ್ಳುತ್ತದೆ. ಇತರರಿಗೆ ಅತ್ಯುತ್ತಮ ಸಲಹೆಗಳನ್ನು ನೀಡುವ ನೀವು, ನಿಮ್ಮ ಸ್ವಂತ ಜೀವನದ ನಿರ್ಣಾಯಕ ಹಂತಗಳಲ್ಲಿ ತೀರ್ಮಾನ ತೆಗೆದುಕೊಳ್ಳಲು ಹಿಂಜರಿಯುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿನ ನಿಗೂಢ ಹೋರಾಟಕ್ಕೆ ಸಾಕ್ಷಿಯಾಗಿದೆ.",
      en: "Your intellect is exceptionally penetrating, gifted with an intuitive faculty that discerns the hidden truths of situations in an instant. Yet, your grandest creative inspirations and strategic investments have frequently met sudden, frustrating pauses just as they were ready to manifest. Prolonged anxieties regarding your children's welfare, academic trajectory, or emotional balance have quietly drained your vitality. While you effortlessly provide profound counsel that resolves others' crises, you paradoxically experience agonizing hesitation when deciding critical junctures in your own life."
    },
    paragraph2: {
      kn: "ಆದರೆ ನಿಮ್ಮಲ್ಲಿ ಸುಪ್ತವಾಗಿರುವ ಈ ಸೂಕ್ಷ್ಮ ಪ್ರಜ್ಞೆಯೇ ನಿಮ್ಮ ನಿಜವಾದ ದೈವಿಕ ಶಕ್ತಿ. ಮಂತ್ರ ಜಪ, ಇಷ್ಟದೇವತಾ ಆರಾಧನೆ ಮತ್ತು ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆಯಿಂದ ಈ ಸಂಚಿತ ಕರ್ಮದ ಗಂಟು ಸುಲಭವಾಗಿ ಕಳಚಿಕೊಳ್ಳುತ್ತದೆ. ಮಕ್ಕಳೊಂದಿಗೆ ಪ್ರೀತಿ ಮತ್ತು ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಹಾಗೂ ನಿಮ್ಮ ಜ್ಞಾನವನ್ನು ಇತರರಿಗೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ಧಾರೆ ಎರೆಯುವುದು ನಿಮ್ಮ ಭಾಗ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸಾನ್ನಿಧ್ಯದಲ್ಲಿ ಮಾಡುವ ರುದ್ರಾಭಿಷೇಕವು ನಿಮ್ಮ ಬುದ್ಧಿಗೆ ಅಗಾಧ ಸ್ಪಷ್ಟತೆಯನ್ನು ನೀಡಲಿದೆ. ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಸೃಜನಶೀಲತೆ ಜಗತ್ತಿಗೆ ಪರಿಚಯವಾಗಿ, ಉನ್ನತ ಗೌರವ ಹಾಗೂ ಸಂತೋಷ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.",
      en: "Understand that this latent intuitive sensitivity is your greatest spiritual inheritance from past births. Through dedicated mantra japa and invoking your Kuladevata, the karmic knot clouding your discernment will completely untie. Nurturing your children with compassionate patience and selflessly sharing your wisdom will awaken dormant ancestral merit. Performing sacred Rudrabhisheka at Sri Gokarna Mahabaleshwara will bestow crystal-clear visionary focus upon your mind, paving the way for celebrated intellectual accomplishments and deep domestic fulfillment."
    }
  },
  6: {
    title: {
      kn: "ಸಂಕಷ್ಟ ನಿವಾರಣೆ, ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ವಿಜಯ ಪಥ",
      en: "Karmic Armor, Triumph Over Adversity & Vital Renewal",
      hi: "विघ्न निवारण, आत्मरक्षा बल एवं विजय संकल्प"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಎದುರಾಗುವ ಸ್ಪರ್ಧೆಗಳು, ಗುಪ್ತ ವಿರೋಧಿಗಳ ಕುತಂತ್ರಗಳು ಮತ್ತು ಹಳೆಯ ಸಾಲ ಅಥವಾ ಆರೋಗ್ಯದ ಏರುಪೇರುಗಳು ನಿಮ್ಮ ತಾಳ್ಮೆಯ ಪರಮಾವಧಿಯನ್ನು ಪರೀಕ್ಷಿಸಿರುತ್ತವೆ. ನೀವು ಯಾರಿಗೂ ಕೆಡುಕನ್ನು ಬಯಸದಿದ್ದರೂ, ನಿಮ್ಮ ಏಳಿಗೆಯನ್ನು ಕಂಡು ಅಸೂಯೆಪಡುವ ಗುಪ್ತ ಶತ್ರುಗಳ ಉಪಟಳ ನಿಮಗೆ ಹಲವು ಬಾರಿ ಮಾನಸಿಕ ಕ್ಲೇಶವನ್ನು ಉಂಟುಮಾಡಿದೆ. ರೋಗ ಲಕ್ಷಣಗಳು ಸ್ಪಷ್ಟವಾಗಿ ತೋರದಿದ್ದರೂ ದೇಹದಲ್ಲಿ ನಿರಂತರ ನಿಶ್ಯಕ್ತಿ ಅಥವಾ ಜೀರ್ಣಾಂಗ ಸಂಬಂಧಿ ತೊಂದರೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ದಿನಚರಿಯನ್ನು ಏರುಪೇರು ಮಾಡುತ್ತದೆ. ನ್ಯಾಯಾಲಯದಂತಹ ವಿವಾದಗಳು ಅಥವಾ ಸಾಲದ ಹೊರೆಗಳು ದೀರ್ಘಕಾಲ ಎಳೆಯುವುದು ನಿಮ್ಮನ್ನು ಬೇಸರಗೊಳಿಸಿರಬಹುದು.",
      en: "Life has repeatedly thrust you into intense arenas of competition, hidden hostility, and lingering obligations that have stretched your endurance to its limits. Even though you harbor malice toward none, your quiet progress has ignited unprovoked envy and passive opposition in certain quarters. Unexplained bouts of fatigue or digestive sensitivity have periodically dampened your physical stamina, resisting conventional diagnosis. Drawn-out financial liabilities or institutional frictions have tested your nerves, making you wonder when complete freedom will arrive."
    },
    paragraph2: {
      kn: "ಆದರೆ ನೆನಪಿಡಿ, ಈ ಯಾವುದೇ ಸವಾಲುಗಳು ನಿಮ್ಮನ್ನು ಎಂದಿಗೂ ಮಣಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ; ಏಕೆಂದರೆ ನಿಮ್ಮಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿಯೇ ಅದ್ಭುತ ರೋಗ ನಿರೋಧಕ ಮತ್ತು ಶತ್ರುಜಯ ಶಕ್ತಿಯಿದೆ. ನೀವು ಎದುರಿಸಿದ ಪ್ರತಿಯೊಂದು ಬಿಕ್ಕಟ್ಟೂ ನಿಮ್ಮನ್ನು ಮತ್ತಷ್ಟು ಉಕ್ಕಿನಂತೆ ಗಟ್ಟಿಗೊಳಿಸಿದೆ. ನಿಯಮಿತ ದಿನಚರಿ, ಸಾತ್ವಿಕ ಆಹಾರ ಮತ್ತು ಋಣ ವಿಮೋಚನಾ ಸಂಕಲ್ಪದಿಂದ ಸಕಲ ಬಾಧೆಗಳೂ ದೂರವಾಗಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಆಂಜನೇಯ ಸ್ವಾಮಿಯ ಕವಚ ಪಠಣವು ನಿಮ್ಮ ಸುತ್ತ ಒಂದು ರಕ್ಷಣಾತ್ಮಕ ಕೋಟೆಯನ್ನು ನಿರ್ಮಿಸಲಿದೆ. ಶೀಘ್ರದಲ್ಲೇ ವಿರೋಧಿಗಳೆಲ್ಲ ತಲೆಬಾಗಿ, ನಿಮ್ಮ ಸಕಲ ಸಂಕಷ್ಟಗಳೂ ಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗಲಿವೆ.",
      en: "Take heart, for within your spirit resides an invincible warrior resilience that cannot be broken by petty adversities. Every single confrontation you survived has forged you into steel. By adhering to a disciplined Ayurvedic routine and maintaining unwavering ethical purity, these debts and ailments will dissolve one by one. The sacred Mahamrityunjaya vibration of Lord Gokarna Mahabaleshwara combined with Hanuman Chalisa creates an impenetrable armor around your life. Your competitors will inevitably retreat, and triumphant resolution is guaranteed across all contested fronts."
    }
  },
  7: {
    title: {
      kn: "ದಾಂಪತ್ಯ ಸೌಹಾರ್ದ, ಪಾಲುದಾರಿಕೆ ವಿವೇಕ ಹಾಗೂ ಸಾಮರಸ್ಯ",
      en: "Relational Harmony, Compassionate Poise & Partnership Grace",
      hi: "दांपत्य सौहार्द, साझेदारी विवेक एवं आपसी सामंजस्य"
    },
    paragraph1: {
      kn: "ವೈವಾಹಿಕ ಜೀವನ ಅಥವಾ ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಹೊಂದಾಣಿಕೆಯು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ಸವಾಲಾಗಿರುತ್ತದೆ. ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿಯು ಸದ್ಗುಣಿಯಾಗಿದ್ದರೂ, ಇಬ್ಬರ ನಡುವೆ ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಅಹಂ ಸಂಘರ್ಷಗಳು ಅಥವಾ ಮೂರನೆಯವರ ಹಸ್ತಕ್ಷೇಪದಿಂದಾಗಿ ಅಪಾರ್ಥಗಳು ತಲೆದೋರುವುದು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ವೇದನೆ ತಂದಿರುತ್ತದೆ. ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಸಂಗಾತಿಗೆ ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಸಲು ಸಾಧ್ಯವಾಗದ ಮೌನ ಕಂದಕವು ಕೆಲವೊಮ್ಮೆ ಏಕಾಂತಕ್ಕೆ ದೂಡುತ್ತದೆ. ಪಾಲುದಾರಿಕೆ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಪ್ರಾಮಾಣಿಕತೆ ಇದ್ದರೂ, ಕರಾರುಗಳಲ್ಲಿ ಎಚ್ಚರ ತಪ್ಪಿದರೆ ನಷ್ಟ ಅಥವಾ ಮನಸ್ತಾಪ ಅನುಭವಿಸಬೇಕಾಗುತ್ತದೆ.",
      en: "In the delicate realm of partnerships and holy matrimony, establishing deep emotional consensus has demanded tremendous inner sacrifice. Even though your partner is noble and well-intentioned, minor triggers or external interference by third parties have often provoked painful communication standoffs. You know the ache of feeling profoundly misunderstood by the very person you cherish most, retreating into wounded silence rather than escalating arguments. In collaborative business endeavors, blind trust without meticulous written clarity has previously brought bitter disillusionment."
    },
    paragraph2: {
      kn: "ಈ ಸಂಬಂಧಗಳ ಪರೀಕ್ಷೆಯು ನಿಮ್ಮಲ್ಲಿ ತ್ಯಾಗ, ಮೌನ ಹಾಗೂ ಆಳವಾದ ಪ್ರಬುದ್ಧತೆಯನ್ನು ಜಾಗೃತಗೊಳಿಸಲು ಬಂದಿರುವ ಕರ್ಮದ ಹಾದಿಯಾಗಿದೆ. ಸಂಗಾತಿಯ ಸಣ್ಣಪುಟ್ಟ ದೋಷಗಳನ್ನು ಕ್ಷಮಿಸಿ, ಪ್ರೀತಿಪೂರ್ವಕ ಮಾತುಕತೆಯ ಮೂಲಕ ವಿಶ್ವಾಸವನ್ನು ಮರುಸ್ಥಾಪಿಸಿದರೆ ದಾಂಪತ್ಯದಲ್ಲಿ ಅದ್ಭುತ ಮಧುರತೆ ನೆಲೆಸಲಿದೆ. ಯಾವುದೇ ಹೊರಗಿನವರ ಮಾತುಗಳನ್ನು ನಂಬಿ ಕುಟುಂಬದ ನೆಮ್ಮದಿಯನ್ನು ಹಾಳುಮಾಡಿಕೊಳ್ಳಬೇಡಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾಮಹೇಶ್ವರ ಸೇವೆ ಹಾಗೂ ದಂಪತಿ ಸಮೇತ ಸಂಕಲ್ಪ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಸಂಬಂಧಗಳಲ್ಲಿನ ಎಲ್ಲ ಅಡೆತಡೆಗಳು ಮಂಜಿನಂತೆ ಕರಗಲಿವೆ. ಪರಸ್ಪರ ಗೌರವದಿಂದ ಕೂಡಿದ ನೂತನ ಸುಖಮಯ ಜೀವನವು ಶೀಘ್ರದಲ್ಲೇ ಚಿಗುರೊಡೆಯಲಿದೆ.",
      en: "These relational crucibles exist not to sever bonds, but to purify ego into compassionate, mature companionship. By consciously replacing reactive defense mechanisms with gentle listening, you will witness old walls crumbling into renewed tenderness. Never allow outside gossip to dictate the sanctuary of your marriage. Invoking the divine union of Uma-Maheshwara at Gokarna Kshetra dissolves accumulated bitterness, ushering in an era of sublime mutual reverence, joyous teamwork, and unshakeable conjugal harmony."
    }
  },
  8: {
    title: {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಪರಿವರ್ತನೆ, ಆಯುಷ್ಯ ರಕ್ಷಣೆ ಹಾಗೂ ನಿಗೂಢ ಜ್ಞಾನ",
      en: "Sacred Rebirth, Transformative Turning Points & Hidden Truths",
      hi: "आध्यात्मिक रूपांतरण, गूढ़ ज्ञान एवं प्राण रक्षा"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಹಲವು ಬಾರಿ ಊಹಿಸಲೂ ಅಸಾಧ್ಯವಾದ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಆಘಾತಕಾರಿ ಘಟನೆಗಳು ಸಂಭವಿಸಿ ನಿಮ್ಮ ಬದುಕಿನ ದಿಕ್ಕನ್ನೇ ಬದಲಿಸಿರಬಹುದು. ಹಠಾತ್ ಧನನಷ್ಟ, ವಂಚನೆ ಅಥವಾ ಆಪ್ತರ ಅಗಲಿಕೆಯಂತಹ ಸನ್ನಿವೇಶಗಳು ನಿಮ್ಮನ್ನು ಮಾನಸಿಕವಾಗಿ ತೀವ್ರ ಆಘಾತಕ್ಕೆ ದೂಡಿದ ಅನುಭವಗಳಾಗಿವೆ. ನಿಮ್ಮಲ್ಲಿ ಒಂದು ಅದ್ಭುತವಾದ ಆರನೇ ಇಂದ್ರಿಯ ಶಕ್ತಿಯಿದ್ದು, ನಡೆಯಬಹುದಾದ ಕೆಡುಕುಗಳು ನಿಮಗೆ ಮೊದಲೇ ಕನಸಿನಲ್ಲೋ ಅಥವಾ ಮನಸ್ಸಿನ ತಳಮಳದಲ್ಲೋ ಸುಳಿವು ನೀಡುತ್ತವೆ. ಗೂಢ ವಿದ್ಯೆಗಳು, ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ನಿಗೂಢ ಆಧ್ಯಾತ್ಮಿಕ ರಹಸ್ಯಗಳ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಂತರಾಳದಲ್ಲಿ ಅಪಾರವಾದ ಸೆಳೆತ ಮತ್ತು ಜ್ಞಾನದಾಹವಿದೆ.",
      en: "Your biography is marked by sudden, seismically unexpected plot twists that tore down old realities and forced you into radical rebirth. You have looked directly into the abyss of unexpected financial reversals, emotional betrayals, or traumatic endings that would have permanently shattered lesser souls. You possess an uncanny sixth sense—a subconscious radar that warns you of danger long before words are spoken or events manifest physically. A deep, magnetic fascination with occult wisdom, astrology, and metaphysical mysteries beats incessantly within your heart."
    },
    paragraph2: {
      kn: "ಈ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಕೇವಲ ಸವಾಲುಗಳಲ್ಲ, ನಿಮ್ಮ ಆತ್ಮವನ್ನು ಲೌಕಿಕ ಭ್ರಮೆಗಳಿಂದ ಎಚ್ಚರಿಸಿ ಪರಮ ಸತ್ಯದತ್ತ ಕೊಂಡೊಯ್ಯುವ ದೈವಿಕ ರಹಸ್ಯವಾಗಿದೆ. ಪ್ರತಿಯೊಂದು ಬಿಕ್ಕಟ್ಟಿನ ನಂತರವೂ ನೀವು ಫೀನಿಕ್ಸ್ ಹಕ್ಕಿಯಂತೆ ಹೊಸ ಶಕ್ತಿಯೊಂದಿಗೆ ಪುನರ್ಜನ್ಮ ಪಡೆದು ಮೇಲೆದ್ದಿದ್ದೀರಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗದ ಆರಾಧನೆಯು ನಿಮ್ಮ ಆಯುಷ್ಯಕ್ಕೆ ದಿವ್ಯ ರಕ್ಷೆ ನೀಡಲಿದ್ದು, ಅಕಾಲಿಕ ಭಯ ಮತ್ತು ಆತಂಕಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಭಸ್ಮ ಮಾಡಲಿದೆ. ನಿತ್ಯವೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃತರ್ಪಣ ಶ್ರಾದ್ಧ ಮಾಡುವುದರಿಂದ ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮ ಮೇಲಿದ್ದು, ಮಹೋನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿ ಲಭಿಸಲಿದೆ.",
      en: "Know with certainty that these severe transformational storms were not punishments, but sacred initiations stripping away fragile worldly illusions. Like the legendary Phoenix, you have risen from every ash heap stronger, wiser, and spiritually invincible. Surrendering to the primordial Atmalinga of Gokarna Mahabaleshwara blesses you with longevity, neutralizing sudden fear and phantom phobias. Chanting the sacred Mahamrityunjaya Mantra and offering reverent Tarpanam to ancestors will unlock profound esoteric wisdom and grant you enduring vitality."
    }
  },
  9: {
    title: {
      kn: "ಭಾಗ್ಯೋದಯದ ತಿರುವು, ಧರ್ಮ ನಿಷ್ಠೆ ಹಾಗೂ ದೈವಿಕ ಅನುಗ್ರಹ",
      en: "Destiny Awakening, Faith Refined & Dharmic Breakthrough",
      hi: "भाग्योदय का मोड़, धर्म निष्ठा एवं ईश्वरीय कृपा"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅದೃಷ್ಟವು ಸುಲಭವಾಗಿ ಕೈಗೆಟುಕದೆ, ಪ್ರತಿಯೊಂದು ಭಾಗ್ಯೋದಯವೂ ಅಪಾರ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ವಿಳಂಬಗಳ ನಂತರವೇ ಪ್ರಾಪ್ತವಾಗುವ ಅನುಭವ ನಿಮಗಾಗಿದೆ. ತಂದೆಯವರೊಂದಿಗಿನ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಅಥವಾ ಪೂರ್ವಜರ ಆಸ್ತಿ-ಪಾಸ್ತಿಗಳ ವಿಷಯದಲ್ಲಿ ಉಂಟಾದ ಅನಿರೀಕ್ಷಿತ ತೊಡಕುಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಅಸಮಾಧಾನವನ್ನು ಉಳಿಸಿರುತ್ತವೆ. ದೇವರ ಮೇಲಿನ ನಂಬಿಕೆಯು ಅನೇಕ ಕಠಿಣ ಸಂದರ್ಭಗಳಲ್ಲಿ ಪ್ರಶ್ನಿಸಲ್ಪಟ್ಟರೂ, ಆಂತರ್ಯದಲ್ಲಿ ಧರ್ಮದ ಹಾದಿಯನ್ನು ಬಿಡದ ನಿಮ್ಮ ನೈತಿಕತೆ ಪ್ರಶಂಸನೀಯವಾಗಿದೆ. ಧಾರ್ಮಿಕ ಯಾತ್ರೆಗಳು ಅಥವಾ ಉನ್ನತ ಶಿಕ್ಷಣದ ಪ್ರಯತ್ನಗಳು ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಮುಂದೂಡಲ್ಪಟ್ಟ ಸಂದರ್ಭಗಳು ನಿಮ್ಮನ್ನು ನಿರಾಶೆಗೊಳಿಸಿರಬಹುದು.",
      en: "Fortune has never arrived for you as an effortless gift; every single blessing of destiny has been chiseled out of prolonged patience and grueling trials. Philosophical differences or emotional distance with your father or paternal elders have cast a lingering shadow over your heart. There were painful periods where prolonged injustice caused you to question divine fairness, yet you stubbornly refused to abandon moral righteousness. Pilgrimages, higher academic pursuits, or foreign aspirations were often deferred right before departure, testing your faith."
    },
    paragraph2: {
      kn: "ಆದರೆ ಕಠಿಣ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಪರಿಶುದ್ಧಗೊಂಡ ನಿಮ್ಮ ಧರ್ಮನಿಷ್ಠೆಯೇ ಈಗ ನಿಮ್ಮ ಬಹುದೊಡ್ಡ ಭಾಗ್ಯವಾಗಿ ಫಲ ನೀಡಲು ಸಿದ್ಧವಾಗಿದೆ. ತಂದೆ, ಗುರುಹಿರಿಯರ ಸೇವೆ ಮತ್ತು ಆಶೀರ್ವಾದವು ನಿಮ್ಮ ಜನ್ಮದ ಸಕಲ ದುರದೃಷ್ಟಗಳನ್ನು ತೊಳೆದುಹಾಕುವ ಪರಮೌಷಧಿಯಾಗಿದೆ. ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಭಾಗ್ಯಸ್ಥಾನವು ಜಾಗೃತಗೊಂಡು, ದೀರ್ಘಕಾಲದಿಂದ ನಿಂತುಹೋಗಿದ್ದ ಮಹತ್ವದ ಕಾರ್ಯಗಳು ದೈವಬಲದಿಂದ ಪುನರಾರಂಭಗೊಳ್ಳಲಿವೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಗುರು ಸೇವೆ, ಗೋಪೂಜೆ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನವು ನಿಮ್ಮ ಭವಿಷ್ಯಕ್ಕೆ ರಾಜಮಾರ್ಗವನ್ನು ನಿರ್ಮಿಸಲಿದೆ. ಸದಾ ಧರ್ಮದ ಪರವಾಗಿ ನಿಲ್ಲಿ, ದೈವಿಕ ಅನುಗ್ರಹವು ನಿಮ್ಮನ್ನು ಉನ್ನತ ಕೀರ್ತಿ ಮತ್ತು ಯಶಸ್ಸಿನ ಶಿಖರಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲಿದೆ.",
      en: "That very integrity, tested through fire, is now ripening into extraordinary karmic fortune. The blessings of your preceptors and sincere service to elders will transmute past misfortune into magnificent breakthroughs. A dormant gateway of fortune is preparing to swing open, resurrecting projects that lay frozen for years. Serving cows, respecting mentors, and seeking the holy feet of Lord Mahabaleshwara at Gokarna will carve a royal highway for your destiny, elevating your name with honor and boundless divine grace."
    }
  },
  10: {
    title: {
      kn: "ವೃತ್ತಿ ಧರ್ಮ, ಕರ್ಮ ಸಿದ್ಧಿ ಹಾಗೂ ನಾಯಕತ್ವದ ಕೀರ್ತಿ",
      en: "Professional Mastery, Karma Siddhi & Enduring Stature",
      hi: "कर्म सिद्धि, कार्यक्षेत्र प्रतिष्ठा एवं नेतृत्व विजय"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯ, ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ಎಂದೂ ಕೊರತೆಯಿಲ್ಲದಿದ್ದರೂ, ಪ್ರಮೋಷನ್ ಅಥವಾ ಉನ್ನತ ಸ್ಥಾನಮಾನಗಳು ಸಿಗುವ ೯೯% ಹಂತದಲ್ಲೇ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಎದುರಾಗಿ ನಿಲ್ಲುವುದು ನಿಮ್ಮ ಅನುಭವಕ್ಕೆ ಬಂದಿರುತ್ತದೆ. ನೀವು ಕಷ್ಟಪಟ್ಟು ರೂಪಿಸಿದ ಯೋಜನೆಗಳ ಶ್ರೇಯಸ್ಸನ್ನು ಕಣ್ಣೆದುರೇ ಇತರರು ಕಸಿದುಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ತೀವ್ರ ಆಘಾತವನ್ನುಂಟುಮಾಡಿರಬಹುದು. ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅಥವಾ ವ್ಯವಸ್ಥೆಯೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ ಮಾಡಿಕೊಳ್ಳಲಾಗದಂತಹ ಅಸಹಾಯಕತೆ ಕೆಲವೊಮ್ಮೆ ಉದ್ಯೋಗ ಬದಲಾವಣೆಯ ಯೋಚನೆಗೆ ದೂಡುತ್ತದೆ. ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕ ಮನ್ನಣೆ ತಕ್ಷಣಕ್ಕೆ ಸಿಗದಿದ್ದರೂ, ನಿಮ್ಮ ಕರ್ತವ್ಯನಿಷ್ಠೆ ಎಂದೂ ಕುಂದಿಲ್ಲ.",
      en: "In your vocation and professional sphere, your technical mastery and tireless diligence are beyond question, yet you have repeatedly confronted the heart-wrenching 99% bottleneck—career promotions, titles, or tenders halting right at the signing table. You have witnessed less-deserving opportunists hijack the credit for your painstaking innovations, wounding your professional dignity. Clashes with rigid organizational politics or authoritarian superiors have repeatedly prompted thoughts of walking away to launch independent ventures."
    },
    paragraph2: {
      kn: "ಆದರೆ ತಿಳಿಯಿರಿ, ಈ ವಿಳಂಬಗಳು ನಿಮ್ಮನ್ನು ಕೇವಲ ಒಬ್ಬ ಸಾಮಾನ್ಯ ಉದ್ಯೋಗಿಯನ್ನಾಗಿ ಉಳಿಸದೆ, ಭವಿಷ್ಯದ ಅಪ್ರತಿಮ ಸ್ವತಂತ್ರ ನಾಯಕನನ್ನಾಗಿ ರೂಪಿಸಲು ಸೃಷ್ಟಿಯಾದ ಕರ್ಮ ಸಿದ್ಧತೆಯಾಗಿದೆ. ಯಾರ ಕೃಪೆಯೂ ಇಲ್ಲದೆ ನಿಮ್ಮ ಸ್ವಂತ ಶಕ್ತಿಯಿಂದಲೇ ಉನ್ನತ ಕೀರ್ತಿ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಗೌರವವನ್ನು ಗಳಿಸುವ ಕಾಲ ಸನ್ನಿಹಿತವಾಗಿದೆ. ಕಚೇರಿ ರಾಜಕೀಯಕ್ಕೆ ತಲೆಕೆಡಿಸಿಕೊಳ್ಳದೆ ನಿಮ್ಮ ಕರ್ಮಧರ್ಮವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಪಾಲಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರವನ್ನು ನಿತ್ಯವೂ ಕೈಗೊಳ್ಳುವುದು ನಿಮ್ಮ ವೃತ್ತಿ ಬದುಕಿನ ಎಲ್ಲ ಸಂಕೋಲೆಗಳನ್ನು ಮುರಿದು, ಅಪೂರ್ವ ಯಶಸ್ಸು ಮತ್ತು ಅಧಿಕಾರವನ್ನು ತಂದುಕೊಡಲಿದೆ.",
      en: "Recognize that these career delays were orchestrated not to suppress you, but to emancipate you from mediocre dependency and prepare you for sovereign leadership. The hour has arrived where your relentless craftsmanship will be acknowledged on the grand stage without needing to pander to power. Dedicate your labor directly as a sacred offering to the Divine. Offering daily Surya Namaskar and sponsoring Rudrabhisheka at Sri Kshetra Gokarna will smash every professional ceiling, establishing you in authentic authority and permanent public respect."
    }
  },
  11: {
    title: {
      kn: "ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ಸಂಚಿತ ಧನಲಾಭ ಹಾಗೂ ಸಾರ್ಥಕ ಪಯಣ",
      en: "Aspiration Manifestation, Delayed Abundance & True Alliances",
      hi: "मनोरथ सिद्धि, अप्रत्याशित लाभ एवं संचित समृद्धि"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಆಕಾಂಕ್ಷೆಗಳು ಮತ್ತು ದೊಡ್ಡ ಕನಸುಗಳು ಫಲಪ್ರದವಾಗುವ ಹಂತದಲ್ಲಿ ನಿರೀಕ್ಷೆಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುವುದು ನಿಮಗೆ ನಿರಂತರ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯಾಗಿದೆ. ಅಪಾರ ಲಾಭ ತರಬೇಕಾದ ದೊಡ್ಡ ಯೋಜನೆಗಳು ಕೊನೆಯ ಗಳಿಗೆಯಲ್ಲಿ ಸಣ್ಣ ಲಾಭಕ್ಕೆ ಸೀಮಿತವಾಗುವುದು ಅಥವಾ ಹಿರಿಯ ಸಹೋದರರೊಂದಿಗೆ, ಆಪ್ತ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಹಣಕಾಸಿನ ವ್ಯವಹಾರಗಳಿಂದ ಮನಸ್ತಾಪಗಳು ಉಂಟಾಗಿರುವುದು ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ನೋವು ತಂದಿರುತ್ತದೆ. ನೀವು ನಂಬಿದ ಸ್ನೇಹಿತರ ವಲಯವೇ ಕೆಲವೊಮ್ಮೆ ನಿಮ್ಮ ಅಗತ್ಯದ ಸಮಯದಲ್ಲಿ ಕೈಕೊಟ್ಟ ಅನುಭವಗಳು ನಿಮ್ಮನ್ನು ಜಾಗರೂಕರನ್ನಾಗಿ ಮಾಡಿವೆ. ಆದರೂ ನಿಮ್ಮ ಆಶಾವಾದ ಮತ್ತು ಗುರಿ ತಲುಪುವ ಛಲ ಎಂದೂ ಅಳಿಸಿಲ್ಲ.",
      en: "Your grandest long-term ambitions have undergone agonizing gestation periods, requiring double the patience expected in ordinary undertakings. High-stakes ventures that promised abundant returns ended up yielding modest windfalls at the final hour. Financial entanglements or joint ventures with trusted friends or elder siblings produced awkward friction, revealing that superficial acquaintances evaporate the moment adversity strikes. Even so, your innate optimism and stubborn pursuit of noble ideals remain undiminished."
    },
    paragraph2: {
      kn: "ನಿಮ್ಮ ದೀರ್ಘಕಾಲದ ಕಾಯುವಿಕೆಗೆ ಈಗ ಪರಿಪೂರ್ಣ ಫಲ ಸಿಗುವ ಸಮಯ ಸನ್ನಿಹಿತವಾಗಿದೆ. ಕಾಲಕ್ರಮೇಣ ಈ ವಿಳಂಬಗಳೇ ನಿಮಗೆ ಯಾರು ನಿಜವಾದ ಆಪ್ತರು, ಯಾರು ಸ್ವಾರ್ಥಿಗಳು ಎಂಬುದನ್ನು ನಿಖರವಾಗಿ ಕಲಿಸಿವೆ. ಶೀಘ್ರದಲ್ಲೇ ನೀವು ಊಹಿಸದ ಮೂಲಗಳಿಂದ ಅನಿರೀಕ್ಷಿತ ಧನಲಾಭ, ಹಳೆಯ ಬಾಕಿ ವಸೂಲಾತಿ ಮತ್ತು ಸಮಾಜದ ಪ್ರಭಾವಿ ವ್ಯಕ್ತಿಗಳ ಬೆಂಬಲ ದೊರೆಯಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಇಷ್ಟಾರ್ಥಗಳೆಲ್ಲವೂ ಈಡೇರಲಿವೆ. ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ನೆರವು ನೀಡುವುದು ಹಾಗೂ ಶನಿವಾರದಂದು ದಾನ ಧರ್ಮಗಳನ್ನು ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಲಾಭಸ್ಥಾನವು ಸದಾ ತುಂಬಿ ತುಳುಕಲಿದೆ.",
      en: "The arduous season of waiting is drawing to a victorious close. Those painful delays have blessed you with peerless discernment, weeding out fair-weather companions and leaving only loyal allies. You are entering a harvest window where long-deferred gains, trapped capital, and unexpected patronage will surge into your accounts. Supporting underprivileged students and offering Saturday charities will activate your house of fulfillment. Lord Gokarna Mahabaleshwara will satisfy your heartfelt aspirations, blessing you with overflowing abundance."
    }
  },
  12: {
    title: {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ, ಧ್ಯಾನಾನುಭವ ಹಾಗೂ ನಿಶ್ಚಿಂತ ಜೀವನ",
      en: "Spiritual Transcendence, Solitary Sanctuary & Inner Freedom",
      hi: "आध्यात्मिक मुक्ति, ध्यान साधना एवं परम शांति"
    },
    paragraph1: {
      kn: "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಬರುವ ಆದಾಯಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ನಿರೀಕ್ಷಿಸದ ವ್ಯಯಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ ಅಥವಾ ಅನಿವಾರ್ಯ ಪ್ರವಾಸಗಳಿಗೆ ಖರ್ಚಾಗುವ ಪರಿಸ್ಥಿತಿಗಳು ನಿಮ್ಮನ್ನು ಚಿಂತೆಗೀಡುಮಾಡಿರಬಹುದು. ರಾತ್ರಿ ವೇಳೆ ಗಾಢ ನಿದ್ರೆ ಬಾರದೆ ಅತಿಯಾದ ಆಲೋಚನೆಗಳು, ಏಕಾಂತದ ಹಂಬಲ ಮತ್ತು ಲೌಕಿಕ ಜಗತ್ತಿನ ಕೃತಕತೆಯಿಂದ ದೂರ ಸರಿಯಬೇಕೆಂಬ ತೀವ್ರ ವೈರಾಗ್ಯದ ಭಾವನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಸುಳಿದಾಡುತ್ತವೆ. ವಿದೇಶ ಪ್ರವಾಸ ಅಥವಾ ಜನ್ಮಸ್ಥಳದಿಂದ ದೂರವಿರುವ ದೂರದ ಊರುಗಳಲ್ಲಿ ಬದುಕು ಕಟ್ಟಿಕೊಳ್ಳುವ ಸನ್ನಿವೇಶಗಳು ಎದುರಾಗುತ್ತವೆ. ಪ್ರಪಂಚಕ್ಕೆ ನಿಮ್ಮ ತ್ಯಾಗ ಮತ್ತು ಮೌನ ಅರ್ಥವಾಗದೆ, ಕೆಲವರು ನಿಮ್ಮನ್ನು ತಪ್ಪಾಗಿ ಗ್ರಹಿಸಿರಬಹುದು.",
      en: "Uncontrollable financial leakages, unexpected medical outlays, or compulsory travel expenses have repeatedly disrupted your carefully budgeted savings. During quiet nights, restorative deep sleep frequently eludes you as racing thoughts and subconscious anxieties replay past memories. A profound sense of spiritual dispassion (Vairagya) and a deep yearning to withdraw from the hollow theater of worldly politics tugs incessantly at your soul. Destiny often pushes you toward foreign shores or living far away from your birthplace to find true purpose."
    },
    paragraph2: {
      kn: "ನಿಮ್ಮ ಈ ಆಧ್ಯಾತ್ಮಿಕ ತುಡಿತವು ಈ ಜನ್ಮದಲ್ಲಿ ಮುಕ್ತಿ ಮತ್ತು ಆತ್ಮಸಾಕ್ಷಾತ್ಕಾರವನ್ನು ಪಡೆಯಲು ಬಂದಿರುವ ಪರಮ ಪವಿತ್ರ ಸಂಸ್ಕಾರವಾಗಿದೆ. ಅತಿಯಾದ ವ್ಯಯಗಳನ್ನು ನಿಯಂತ್ರಿಸಲು ನಿತ್ಯವೂ ದಾನ-ಧರ್ಮಗಳ ಸಂಕಲ್ಪ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ. ಏಕಾಂತದಲ್ಲಿ ಕುಳಿತು ಮಾಡುವ ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಧ್ಯಾನವು ನಿಮ್ಮ ನಿದ್ರಾಹೀನತೆಯನ್ನು ಹೋಗಲಾಡಿಸಿ ಪರಮ ಆನಂದವನ್ನು ತುಂಬಲಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಾಲ ಕಳೆಯುವುದು ಹಾಗೂ ಸಂಜೆ ಶಿವನಾಮ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಎಲ್ಲ ಭಾರಗಳೂ ಇಳಿದು, ಸಾಕ್ಷಾತ್ ಈಶ್ವರನ ಪರಮ ಕೃಪೆಯು ನಿಮ್ಮನ್ನು ನಿಶ್ಚಿಂತ ಮುಕ್ತ ಜೀವನಕ್ಕೆ ಮುನ್ನಡೆಸಲಿದೆ.",
      en: "This spiritual yearning is not an affliction, but your soul's supreme initiation toward true liberation and inner peace. By proactively channeling your wealth into sacred charities and temple services, you invert unwanted expenditures into eternal spiritual merit. Practicing evening Pranayama and silent meditation will dissolve insomnia, gifting you sweet, rejuvenating rest. Spending contemplative moments at the sacred sea-shore Atmalinga of Gokarna will lift every subconscious weight from your shoulders, establishing you in serene bliss, clarity, and sovereign freedom."
    }
  }
};

export const getMaandiPerspectiveInterpretation = (
  houseNumber: number,
  rashiIndex: number,
  lang: string = "kn",
  _name?: string
): MaandiPerspectiveInquest => {
  const h = Math.max(1, Math.min(12, Math.floor(houseNumber) || 1));
  const data = MAANDI_PERSPECTIVE_DATA[h] || MAANDI_PERSPECTIVE_DATA[1];

  const targetLang = (lang || "kn").split("-")[0].toLowerCase();

  const title =
    data.title[targetLang] ||
    data.title.en ||
    data.title.kn ||
    "ಆಂತರಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ನಿಗೂಢ ಚೇತನ ಶಕ್ತಿ";

  const p1 =
    data.paragraph1[targetLang] ||
    (targetLang === "hi" || targetLang === "te" || targetLang === "ta" ? data.paragraph1.en : undefined) ||
    data.paragraph1.kn ||
    data.paragraph1.en;

  const p2 =
    data.paragraph2[targetLang] ||
    (targetLang === "hi" || targetLang === "te" || targetLang === "ta" ? data.paragraph2.en : undefined) ||
    data.paragraph2.kn ||
    data.paragraph2.en;

  return {
    title,
    paragraph1: p1,
    paragraph2: p2,
    house: h
  };
};


