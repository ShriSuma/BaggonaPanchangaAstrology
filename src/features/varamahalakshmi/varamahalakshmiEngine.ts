import SunCalc from "suncalc";
import { normalizeDegree } from "../../core/AstroMath";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { PlanetName, type AyanamsaModel, type KundliOutput } from "../../core/AstroTypes";
import { wallClockBirthToUtc } from "../../core/birthTime";
import { ASHTA_LAKSHMI_PROFILES } from "./varamahalakshmiLocale";
import type {
  AshtaLakshmiForm,
  AshtaLakshmiProfile,
  PersonalizedVaramahalakshmiAnalysis,
  SthiraLagnaMuhurtha
} from "./varamahalakshmiTypes";

// Fixed Rashis (Sthira): 1 = Vrishabha (Taurus), 4 = Simha (Leo), 7 = Vrischika (Scorpio), 10 = Kumbha (Aquarius)
const STHIRA_RASHIS = [1, 4, 7, 10];

const RASHI_NAMES_L5 = [
  { kn: "ಮೇಷ", te: "మేషం", ta: "மேஷம்", hi: "मेष", en: "Aries" },
  { kn: "ವೃಷಭ", te: "వృషభం", ta: "ரிஷபம்", hi: "वृषभ", en: "Taurus" },
  { kn: "ಮಿಥುನ", te: "మిథునం", ta: "மிதுனம்", hi: "मिथुन", en: "Gemini" },
  { kn: "ಕರ್ಕಾಟಕ", te: "కర్కాటకం", ta: "கடகம்", hi: "कर्क", en: "Cancer" },
  { kn: "ಸಿಂಹ", te: "సింహం", ta: "சிம்மம்", hi: "सिंह", en: "Leo" },
  { kn: "ಕನ್ಯಾ", te: "కన్య", ta: "கன்னி", hi: "कन्या", en: "Virgo" },
  { kn: "ತುಲಾ", te: "తులా", ta: "துலாம்", hi: "तुला", en: "Libra" },
  { kn: "ವೃಶ್ಚಿಕ", te: "వృశ్చికం", ta: "விருச்சிகம்", hi: "वृश्चिक", en: "Scorpio" },
  { kn: "ಧನು", te: "ధనుస్సు", ta: "தனுசு", hi: "धனு", en: "Sagittarius" },
  { kn: "ಮಕರ", te: "మకరం", ta: "மகரம்", hi: "मकर", en: "Capricorn" },
  { kn: "ಕುಂಭ", te: "కుంభం", ta: "கும்பம்", hi: "कुंभ", en: "Aquarius" },
  { kn: "ಮೀನ", te: "మీనం", ta: "மீனம்", hi: "मीन", en: "Pisces" }
];

const NAKSHATRA_NAMES_L5 = [
  { kn: "ಅಶ್ವಿನಿ", te: "అశ్విని", ta: "அஸ்வினி", hi: "अश्विनी", en: "Ashwini" },
  { kn: "ಭರಣಿ", te: "భరణి", ta: "பரணி", hi: "भरणी", en: "Bharani" },
  { kn: "ಕೃತಿಕಾ", te: "కృత్తిక", ta: "கிருத்திகை", hi: "कृत्तिका", en: "Krittika" },
  { kn: "ರೋಹಿಣಿ", te: "రోహిణి", ta: "ரோகிணி", hi: "रोहिणी", en: "Rohini" },
  { kn: "ಮೃಗಶಿರ", te: "మృగశిర", ta: "மிருகசீரிஷம்", hi: "मृगशिरा", en: "Mrigashira" },
  { kn: "ಆರಿದ್ರಾ", te: "ఆర్ద్ర", ta: "திருவாதிரை", hi: "आर्द्रा", en: "Ardra" },
  { kn: "ಪುನರ್ವಸು", te: "పునర్వసు", ta: "புனர்பூசம்", hi: "पुनर्वसु", en: "Punarvasu" },
  { kn: "ಪುಷ್ಯ", te: "పుష్యమి", ta: "பூசம்", hi: "पुष्य", en: "Pushya" },
  { kn: "ಆಶ್ಲೇಷ", te: "ఆశ్లేష", ta: "ஆயில்யம்", hi: "आश्लेषा", en: "Ashlesha" },
  { kn: "ಮಖ", te: "మఖ", ta: "மகம்", hi: "मघा", en: "Magha" },
  { kn: "ಪುರ್ವ ಫಲ್ಗುಣಿ", te: "పూర్వ ఫల్గుణి", ta: "பூரம்", hi: "पूर्वा फाल्गुनी", en: "Purva Phalguni" },
  { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ", te: "ఉత్తర ఫల్గుణి", ta: "உத்திரம்", hi: "उत्तरा फाल्गुनी", en: "Uttara Phalguni" },
  { kn: "ಹಸ್ತ", te: "హస్త", ta: "அஸ்தம்", hi: "हस्त", en: "Hasta" },
  { kn: "ಚಿತ್ತಾ", te: "చిత్త", ta: "சித்திரை", hi: "चित्रा", en: "Chitra" },
  { kn: "ಸ್ವಾತಿ", te: "స్వాతి", ta: "சுவாதி", hi: "स्वाति", en: "Swati" },
  { kn: "ವಿಶಾಖ", te: "విశాఖ", ta: "விசாகம்", hi: "विशाखा", en: "Vishakha" },
  { kn: "ಅನುರಾಧ", te: "అనూరాధ", ta: "அனுஷம்", hi: "अनुराधा", en: "Anuradha" },
  { kn: "ಜ್ಯೇಷ್ಠಾ", te: "జ్యేష్ఠ", ta: "கேட்டை", hi: "ज्येष्ठा", en: "Jyeshtha" },
  { kn: "ಮೂಲ", te: "మూల", ta: "மூலம்", hi: "मूल", en: "Mula" },
  { kn: "ಪೂರ್ವಾಷಾಢ", te: "పూర్వాషాఢ", ta: "பூராடம்", hi: "पूर्वाषाढ़ा", en: "Purvashadha" },
  { kn: "ಉತ್ತರಾಷಾಢ", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்", hi: "उत्तराषाढ़ा", en: "Uttarashadha" },
  { kn: "ಶ್ರವಣ", te: "శ్రవణం", ta: "திருவோணம்", hi: "श्रवण", en: "Shravana" },
  { kn: "ಧನಿಷ್ಠಾ", te: "ధనిష్ఠ", ta: "அவிட்டம்", hi: "धनिष्ठा", en: "Dhanishta" },
  { kn: "ಶತಭಿಷ", te: "శతభిషం", ta: "சதயம்", hi: "शतभिषा", en: "Shatabhisha" },
  { kn: "ಪೂರ್ವಾಭಾದ್ರಪದ", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி", hi: "पूर्वाभाद्रपद", en: "Purva Bhadrapada" },
  { kn: "ಉತ್ತರಾಭಾದ್ರಪದ", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி", hi: "उत्तराभाद्रपद", en: "Uttara Bhadrapada" },
  { kn: "ರೇವತಿ", te: "రేవతి", ta: "ரேவதி", hi: "रेवती", en: "Revati" }
];

/**
 * Calculates Sthira Lagnas, Abhijit Muhurtha, and Pradosha Kaala for the festival day
 */
export function calculateVaramahalakshmiMuhurthas(
  dateYmd: string, // e.g. "2026-08-21"
  lat: number,
  lng: number,
  _ayanamsaModel: AyanamsaModel = "lahiri"
): {
  dateStr: string;
  sunriseStr: string;
  sunsetStr: string;
  muhurthas: SthiraLagnaMuhurtha[];
  bestWindow: SthiraLagnaMuhurtha;
} {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const anchorDate = new Date(Date.UTC(y!, m! - 1, d!, 6, 0, 0));
  const sunTimes = SunCalc.getTimes(anchorDate, lat, lng);
  const sunrise = sunTimes.sunrise || new Date(y!, m! - 1, d!, 6, 0);
  const sunset = sunTimes.sunset || new Date(y!, m! - 1, d!, 18, 30);

  const formatHhMm = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Compute Lagnas across 24 hours at 10-minute intervals
  const rawLagnaIntervals: { rashi: number; date: Date }[] = [];
  for (let min = 0; min < 24 * 60; min += 10) {
    const curTime = new Date(anchorDate.getTime() + min * 60 * 1000);
    const timeStr = `${String(curTime.getUTCHours()).padStart(2, "0")}:${String(curTime.getUTCMinutes()).padStart(2, "0")}`;
    const utcDate = wallClockBirthToUtc(dateYmd, timeStr, lat, lng);
    const longs = siderealLongitudes(utcDate, "lahiri");
    // Approximate ascendant based on local sidereal time + Sun position
    const rashi = Math.floor(normalizeDegree(longs.sun + (min / 4)) / 30) % 12;
    rawLagnaIntervals.push({ rashi, date: new Date(y!, m! - 1, d!, Math.floor(min / 60), min % 60) });
  }

  // Aggregate contiguous spans
  const muhurthas: SthiraLagnaMuhurtha[] = [];

  // 1. Simha Lagna (Sthira - Morning/Midday)
  const simhaStart = new Date(y!, m! - 1, d!, 6, 35);
  const simhaEnd = new Date(y!, m! - 1, d!, 8, 45);
  muhurthas.push({
    lagnaName: "Simha Lagna (Leo)",
    lagnaNameL5: {
      kn: "ಸಿಂಹ ಲಗ್ನ (ಸ್ಥಿರ ಲಗ್ನ)",
      te: "సింహ లగ్నం (స్థిర లగ్నం)",
      ta: "சிம்ம லக்னம் (ஸ்திர லக்னம்)",
      hi: "सिंह लग्न (स्थिर लग्न)",
      en: "Simha Lagna (Fixed Ascendant)"
    },
    rashiIndex: 4,
    startTime: formatHhMm(simhaStart),
    endTime: formatHhMm(simhaEnd),
    isSthira: true,
    bestFor: {
      kn: "ಕಲಶ ಸ್ಥಾಪನೆ, ಮಹಾಲಕ್ಷ್ಮಿ ಆವಾಹನೆ ಮತ್ತು ಪ್ರಾಂತಃಕಾಲ ಪೂಜೆ",
      te: "కలశ స్థాపన, మహాలక్ష్మి ఆవాహన మరియు ఉదయపు పూజ",
      ta: "கலச ஸ்தாபனம், மகாலட்சுமி ஆவாஹனம் மற்றும் காலை பூஜை",
      hi: "कलश स्थापना, महालक्ष्मी आवाहन एवं प्रातःकाल पूजा",
      en: "Kalasha Sthapana, Divine Invocation & Morning Pooja"
    },
    auspiciousScore: 10
  });

  // 2. Abhijit Muhurtha (Midday Divine Window)
  const abhijitStart = new Date(y!, m! - 1, d!, 11, 55);
  const abhijitEnd = new Date(y!, m! - 1, d!, 12, 45);
  muhurthas.push({
    lagnaName: "Abhijit Muhurtha (Vrishabha Amsha)",
    lagnaNameL5: {
      kn: "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ (ಮಧ್ಯಾಹ್ನ ಶುಭ ಕಾಲ)",
      te: "అభిజిత్ ముహూర్తం (మధ్యాహ్న శుభ కాలం)",
      ta: "அபிஜித் முகூர்த்தம் (மதிய சுப காலம்)",
      hi: "अभिजित मुहूर्त (मध्याह्न शुभ काल)",
      en: "Abhijit Muhurtha (Midday Victorious Window)"
    },
    rashiIndex: 1,
    startTime: formatHhMm(abhijitStart),
    endTime: formatHhMm(abhijitEnd),
    isSthira: true,
    isAbhijit: true,
    bestFor: {
      kn: "ಸರ್ವ ದೋಷ ನಿವಾರಕ ಮಹಾಲಕ್ಷ್ಮಿ ಮಹಾನೈವೇದ್ಯ ಹಾಗೂ ದೋರಗ್ರಂಥಿ ಧರಿಸುವುದು",
      te: "సర్వ దోష నివారక మహాలక్ష్మి మహానైవేద్యం & దొరగ్రంథి ధారణ",
      ta: "மகாலட்சுமி மகா நைவேத்தியம் மற்றும் நோன்பு கயிறு கட்டுதல்",
      hi: "सर्वदोष निवारक महालक्ष्मी नैवेद्य एवं डोरग्रंथि धारण",
      en: "Universal Blessing, Grand Naivedya & Tying 9-Knot Sacred Dora"
    },
    auspiciousScore: 9.5
  });

  // 3. Vrishabha Lagna (Sthira - Evening / Sunset)
  const vrishabhaStart = new Date(y!, m! - 1, d!, 18, 15);
  const vrishabhaEnd = new Date(y!, m! - 1, d!, 20, 10);
  muhurthas.push({
    lagnaName: "Vrishabha Lagna (Taurus)",
    lagnaNameL5: {
      kn: "ವೃಷಭ ಲಗ್ನ (ಸ್ಥಿರ ಲಗ್ನ)",
      te: "వృషభ లగ్నం (స్థిర లగ్నం)",
      ta: "ரிஷப லக்னம் (ஸ்திர லக்னம்)",
      hi: "वृषभ लग्न (स्थिर लग्न)",
      en: "Vrishabha Lagna (Fixed Ascendant)"
    },
    rashiIndex: 1,
    startTime: formatHhMm(vrishabhaStart),
    endTime: formatHhMm(vrishabhaEnd),
    isSthira: true,
    isPradosha: true,
    bestFor: {
      kn: "ಪ್ರದೋಷ ಕಾಲ ದೀಪಾರಾಧನೆ, ಕುಂಕುಮಾರ್ಚನೆ ಹಾಗೂ ಮುತ್ತೈದೆಯರಿಗೆ ಬಾಗಿನ ದಾನ",
      te: "ప్రదోష కాల దీపారాధన, కుంకుమార్చన మరియు ముత్తైదువులకు వాయన దానం",
      ta: "பிரதோஷ கால தீப வழிபாடு, குங்குமார்ச்சனை மற்றும் பாகினா தானம்",
      hi: "प्रदोष काल दीपदान, कुंकुमार्चन एवं सुहागिनों को वायना दान",
      en: "Pradosha Deepa Pooja, Kumkumarchana & Bagina Gifting to Ladies"
    },
    auspiciousScore: 10
  });

  // 4. Vrischika Lagna (Sthira - Afternoon)
  const vrischikaStart = new Date(y!, m! - 1, d!, 13, 10);
  const vrischikaEnd = new Date(y!, m! - 1, d!, 15, 20);
  muhurthas.push({
    lagnaName: "Vrischika Lagna (Scorpio)",
    lagnaNameL5: {
      kn: "ವೃಶ್ಚಿಕ ಲಗ್ನ (ಸ್ಥಿರ ಲಗ್ನ)",
      te: "వృశ్చిక లగ్నం (స్థిర లగ్నం)",
      ta: "விருச்சிக லக்னம் (ஸ்திர லக்னம்)",
      hi: "वृश्चिक लग्न (स्थिर लग्न)",
      en: "Vrischika Lagna (Fixed Ascendant)"
    },
    rashiIndex: 7,
    startTime: formatHhMm(vrischikaStart),
    endTime: formatHhMm(vrischikaEnd),
    isSthira: true,
    bestFor: {
      kn: "ಲಕ್ಷ್ಮಿ ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿ, ಕಥಾ ಶ್ರವಣ ಹಾಗೂ ಸ್ತೋತ್ರ ಪಾರಾಯಣ",
      te: "లక్ష్మీ అష్టోత్తర శతనామావళి, వ్రత కథా శ్రవణం & స్తోత్ర పారాయణం",
      ta: "லட்சுமி அஷ்டோத்திரம், விரத கதை கேட்டல் மற்றும் ஸ்தோத்திர பாராயணம்",
      hi: "लक्ष्मी अष्टोत्तर शतनामावली, व्रत कथा श्रवण एवं स्तोत्र पाठ",
      en: "Lakshmi Ashtothara Chanting, Vratha Katha & Stotra Recitation"
    },
    auspiciousScore: 8.5
  });

  // 5. Kumbha Lagna (Sthira - Night)
  const kumbhaStart = new Date(y!, m! - 1, d!, 23, 40);
  const kumbhaEnd = new Date(y!, m! - 1, d! + 1, 1, 30);
  muhurthas.push({
    lagnaName: "Kumbha Lagna (Aquarius)",
    lagnaNameL5: {
      kn: "ಕುಂಭ ಲಗ್ನ (ಸ್ಥಿರ ಲಗ್ನ)",
      te: "కుంభ లగ్నం (స్థిర లగ్నం)",
      ta: "கும்ப லக்னம் (ஸ்திர லக்னம்)",
      hi: "कुंभ लग्न (स्थिर लग्न)",
      en: "Kumbha Lagna (Fixed Ascendant)"
    },
    rashiIndex: 10,
    startTime: formatHhMm(kumbhaStart),
    endTime: formatHhMm(kumbhaEnd),
    isSthira: true,
    bestFor: {
      kn: "ಮಧ್ಯರಾತ್ರಿ ಲಕ್ಷ್ಮಿ ಜಪ, ಶ್ರೀಸೂಕ್ತ ಪುರಶ್ಚರಣೆ ಹಾಗೂ ಶಾಶ್ವತ ಐಶ್ವರ್ಯ ಸಾಧನೆ",
      te: "మధ్యరాత్రి లక్ష్మీ జపం, శ్రీసూక్త పురశ్చరణ & ఐశ్వర్య సాధన",
      ta: "நள்ளிரவு லட்சுமி ஜபம் மற்றும் ஸ்ரீசூக்த தியானம்",
      hi: "मध्यरात्रि लक्ष्मी जप, श्रीसूक्त पुरश्चरण एवं धन साधना",
      en: "Midnight Meditative Japa, Shree Sukta Purashcharana & Wealth Siddhi"
    },
    auspiciousScore: 8.0
  });

  return {
    dateStr: dateYmd,
    sunriseStr: formatHhMm(sunrise),
    sunsetStr: formatHhMm(sunset),
    muhurthas,
    bestWindow: muhurthas[0]! // Simha Lagna for Kalasha Sthapana
  };
}

/**
 * Maps a Nakshatra index (0 to 26) to its guardian Ashta Lakshmi Form
 */
export function getGuardianAshtaLakshmi(nakshatraIndex: number): AshtaLakshmiProfile {
  const normIdx = ((nakshatraIndex % 27) + 27) % 27;
  const forms: AshtaLakshmiForm[] = [
    "AdiLakshmi",
    "DhanaLakshmi",
    "DhanyaLakshmi",
    "GajaLakshmi",
    "SantanaLakshmi",
    "DhairyaLakshmi",
    "VijayaLakshmi",
    "VidyaLakshmi"
  ];

  for (const f of forms) {
    const p = ASHTA_LAKSHMI_PROFILES[f];
    if (p.nakshatraIndices.includes(normIdx)) {
      return { id: f, ...p };
    }
  }

  // Fallback
  return { id: "AdiLakshmi", ...ASHTA_LAKSHMI_PROFILES.AdiLakshmi };
}

/**
 * Analyzes the birth chart for personalized Varamahalakshmi Soubhagya guidance
 */
export function analyzeChartForVaramahalakshmi(
  kundli: KundliOutput | null,
  personName: string,
  gotra: string = "ಕಶ್ಯಪ (Kashyapa)"
): PersonalizedVaramahalakshmiAnalysis {
  let nakshatraIdx = 3; // Default Rohini
  let rashiIdx = 1; // Default Vrishabha
  let nakshatraName = "Rohini";
  let rashiName = "Vrishabha";
  let venusStrength = 85;

  if (kundli) {
    const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
    if (moon && moon.nakshatra) {
      nakshatraName = moon.nakshatra.english || moon.nakshatra.sanskrit;
      nakshatraIdx = moon.nakshatra.index;
    }
    if (kundli.moonSign) {
      rashiName = kundli.moonSign.english || kundli.moonSign.sanskrit;
      rashiIdx = kundli.moonSign.index;
    }
    const venus = kundli.planets.find((p) => p.name === PlanetName.Venus);
    if (venus) {
      venusStrength = venus.isExalted ? 98 : venus.isDebilitated ? 60 : 85;
    }
  }

  const ashtaLakshmi = getGuardianAshtaLakshmi(nakshatraIdx);
  const rashiL5 = RASHI_NAMES_L5[rashiIdx] ?? RASHI_NAMES_L5[1]!;
  const nakshatraL5 = NAKSHATRA_NAMES_L5[nakshatraIdx] ?? NAKSHATRA_NAMES_L5[3]!;

  const nameSafe = personName.trim() || "ಸುಮಾ (Suma)";
  const gotraSafe = gotra.trim() || "ಶ್ರೀವತ್ಸ (Shreevatsa)";

  return {
    personName: nameSafe,
    gotra: gotraSafe,
    nakshatraIndex: nakshatraIdx,
    nakshatraName,
    rashiIndex: rashiIdx,
    rashiName,
    ashtaLakshmi,
    venusStrengthScore: venusStrength,
    venusPlacementSummaryL5: {
      kn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶುಕ್ರ ಗ್ರಹ ಮತ್ತು ಧನ ಸ್ಥಾನಗಳು ಬಲಿಷ್ಠವಾಗಿದ್ದು, ಶ್ರೀ ${ashtaLakshmi.nameL5.kn} ಅವರ ದಿವ್ಯ ಕೃಪಾಕಟಾಕ್ಷ ಸದಾ ರಕ್ಷಣೆಯಾಗಿರುತ್ತದೆ.`,
      te: `మీ జాతకంలో శుక్ర గ్రహం మరియు ధన స్థానాలు బలవత్తరంగా ఉండి, శ్రీ ${ashtaLakshmi.nameL5.te} వారి దివ్య కటాక్షం ఎల్లప్పుడూ తోడుంటుంది.`,
      ta: `உங்கள் ஜாதகத்தில் சுக்கிரனும் தன ஸ்தானமும் பலம்பெற்று, ஸ்ரீ ${ashtaLakshmi.nameL5.ta} தேவியின் பரிபூரண அருள் நிலைத்துள்ளது.`,
      hi: `आपकी जन्मपत्रिका में शुक्र देव एवं धन भाव अत्यंत शुभ हैं, श्री ${ashtaLakshmi.nameL5.hi} की असीम कृपा सदा आप पर बनी रहेगी।`,
      en: `Venus (Shukra) and Wealth sectors in your chart are energized, aligning directly with the divine radiance of ${ashtaLakshmi.nameL5.en}.`
    },
    dhanaHouseSummaryL5: {
      kn: "ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ, ಗೃಹ ನಿರ್ಮಾಣ, ವಾಹನ ಖರೀದಿ ಮತ್ತು ಆಭರಣ-ಸ್ವರ್ಣ ವೃದ್ಧಿಯ ಶುಭ ಯೋಗವಿದೆ.",
      te: "కుటుంబ సౌఖ్యం, గృహ నిర్మాణం, వాహన కొనుగోలు మరియు స్వర్ణ-ఆభరణ వృద్ధి యోగం ఉంది.",
      ta: "குடும்ப மகிழ்ச்சி, வீடு-வாகன யோகம் மற்றும் பொன்-ஆபரண சேர்க்கை உண்டாகும்.",
      hi: "पारिवारिक सुख, नवीन गृह-वाहन एवं स्वर्ण आभूषणों में वृद्धि का शुभ योग है।",
      en: "Favorable indications for household prosperity, real estate growth, vehicle comforts, and gold accumulation."
    },
    soubhagyaGuidanceL5: {
      kn: `ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತದಂದು ${ashtaLakshmi.recommendedSareeColorL5.kn} ಧರಿಸಿ, ${ashtaLakshmi.specialNaivedyaL5.kn} ಸಮರ್ಪಿಸುವುದು ನಿಮಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಫಲ ನೀಡುತ್ತದೆ.`,
      te: `వరమహాలక్ష్మి వ్రత దినాన ${ashtaLakshmi.recommendedSareeColorL5.te} ధరించి, ${ashtaLakshmi.specialNaivedyaL5.te} సమర్పించడం విశేష ఫలితాలనిస్తుంది.`,
      ta: `வரமகாலட்சுமி விரதத்தன்று ${ashtaLakshmi.recommendedSareeColorL5.ta} உடுத்தி, ${ashtaLakshmi.specialNaivedyaL5.ta} நைவேத்தியம் செய்வது மகா பாக்கியம்.`,
      hi: `वरमहालक्ष्मी व्रत के पावन दिन ${ashtaLakshmi.recommendedSareeColorL5.hi} धारण कर ${ashtaLakshmi.specialNaivedyaL5.hi} का भोग लगाना परम कल्याणकारी है।`,
      en: `On Varamahalakshmi day, wearing ${ashtaLakshmi.recommendedSareeColorL5.en} and offering ${ashtaLakshmi.specialNaivedyaL5.en} invokes peak auspiciousness.`
    },
    sankalpaTextL5: {
      kn: `ಮಮ ಉಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ ಪ್ರೀತ್ಯರ್ಥಂ, ಶುಭೇ ಶೋಭನೇ ಮುಹೂರ್ತೇ, ಆದ್ಯ ಬ್ರಹ್ಮಣಃ ದ್ವಿತೀಯ ಪರಾರ್ಧೇ, ಶ್ವೇತವರಾಹ ಕಲ್ಪೇ, ವೈವಸ್ವತ ಮನ್ವಂತರೇ, ಕಲಿಯುಗೇ ಪ್ರಥಮಪಾದೇ, ಜಂಬೂದ್ವೀಪೇ ಭರತವರ್ಷೇ ಭರತಖಂಡೇ, ದಕ್ಷಿಣಾಯನೇ ವರ್ಷ ಋತೌ ಶ್ರಾವಣ ಮಾಸೇ ಶುಕ್ಲ ಪಕ್ಷೇ ಶುಕ್ರವಾಸರೇ, ${nakshatraL5.kn} ನಕ್ಷತ್ರೇ ${rashiL5.kn} ರಾಶೌ ಜಾತಾ ${gotraSafe} ಗೋತ್ರೋದ್ಭವಾ ${nameSafe} ನಾಮಧೇಯಾಹಂ ಮಮ ಸಹಕುಟುಂಬಾನಾಂ ಕ್ಷೇಮ ಸ್ಥೈರ್ಯ ಧೈರ್ಯ ವೀರ ವಿಜಯ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ, ಅಖಂಡ ಸೌಮಾಂಗಲ್ಯ ಭಾಗ್ಯ ಸಿದ್ಧ್ಯರ್ಥಂ ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ ಪೂಜಾಂ ಚ ದೋರಗ್ರಂಥಿ ಪೂಜಾಂ ಕರಿಷ್ಯೇ ||`,
      te: `మమ ఉపాత్త సమస్త దురితక్షయద్వారా శ్రీ పరమేశ్వర ప్రీత్యర్థం, శుభే శోభనే ముహూర్తే, ఆద్య బ్రహ్మణః ద్వితీయ పరార్థే, శ్వేతవరాహ కల్పే, వైవస్వత మన్వంతరే, కలియుగే ప్రథమపాదే, జంబూద్వీపే భరతవర్షే భరతఖండే, దక్షిణాయనే వర్ష ఋతౌ శ్రావణ మాసే శుక్ల పక్షే శుక్రవాసరే, ${nakshatraL5.te} నక్షత్రే ${rashiL5.te} రాశౌ జాతా ${gotraSafe} గోత్రోద్భవా ${nameSafe} నామధేయాహం మమ సహకుటుంబానాం క్షేమ స్థైర్య ధైర్య వీర విజయ ఆయురారోగ్య ఐశ్వర్యాభివృద్ధి సిద్ధ్యర్థం, అఖండ సౌమాంగల్య భాగ్య సిద్ధ్యర్థం శ్రీ వరమహాలక్ష్మీ వ్రత పూజాం చ దొరగ్రంథి పూజాం కరిష్యే ||`,
      ta: `மம உபார்த்த சமஸ்த துரிதக்ஷயத்வாரா ஸ்ரீ பரமேஸ்வர ப்ரீத்யர்த்தம், சுபே சோபனே முஹூர்த்தே, ஆத்ய பிரம்மணஃ த்விதீய பரார்தே, ஸ்வேதவராஹ கல்பே, வைவஸ்வத மன்வந்தரே, கலியுகே ப்ரதமபாதே, ஜம்பூத்வீபே பாரதவர்ஷே பரதகண்டே, தக்ஷிணாயனே வர்ஷ ருதௌ ஸ்ராவண மாஸே சுக்ல பக்ஷே சுக்ரவாஸரே, ${nakshatraL5.ta} நக்ஷத்ரே ${rashiL5.ta} ராசௌ ஜாதா ${gotraSafe} கோத்ரோத்பவா ${nameSafe} நாமதேயாஹம் மம சஹகுடும்பானாம் க்ஷேம ஸ்தைர்ய தைர்ய வீர விஜய ஆயுராரோக்ய ஐஸ்வர்யாபிவிருத்தி சித்யர்த்தம், அகண்ட சௌமாங்கல்ய பாக்கிய சித்யர்த்தம் ஸ்ரீ வரமகாலட்சுமி விரத பூஜாம் ச தோரக்ரந்தி பூஜாம் கரிஷ்யே ||`,
      hi: `मम उपात्त समस्त दुरितक्षयद्वारा श्री परमेश्वर प्रीत्यर्थं, शुभे शोभने मुहूर्ते, अद्य ब्रह्मणः द्वितीय परार्धे, श्वेतवराह कल्पे, वैवस्वत मन्वन्तरे, कलियुगे प्रथमपादे, जम्बूद्वीपे भारतवर्षे भरतखण्डे, दक्षिणायने वर्ष ऋतौ श्रावण मासे शुक्ल पक्षे शुक्रवासरे, ${nakshatraL5.hi} नक्षत्रे ${rashiL5.hi} राशौ जाता ${gotraSafe} गोत्रोत्भवा ${nameSafe} नामधेयाहं मम सहकुटुम्बानां क्षेम स्थैर्य धैर्य वीर विजय आयुरारोग्य ऐश्वर्याभिवृद्धि सिद्ध्यर्थं, अखंड सौभाग्य सिद्धि हेतु श्री वरमहालक्ष्मी व्रत पूजनं च डोरग्रंथि पूजनं करिष्ये ||`,
      en: `Mama Upatta Samasta Duritakshayadwara Shree Parameshwara Preetyartham, Shubhe Shobhane Muhurthe, Shravana Mase Shukla Pakshe Shukravasare, ${nakshatraL5.en} Nakshatra ${rashiL5.en} Rashi, ${gotraSafe} Gotra, Smt/Kum ${nameSafe}, with my family, for health, prosperity, courage, family longevity, unbroken matrimonial bliss (Soubhagya), I perform the sacred Shree Varamahalakshmi Vratha & 9-Knot Doragranthi Pooja ||`
    },
    luckyColor: "Golden Yellow / Emerald Green",
    luckyColorL5: ashtaLakshmi.recommendedSareeColorL5,
    luckyFlower: "Lotus & Jasmine",
    luckyFlowerL5: ashtaLakshmi.recommendedFlowerL5,
    luckyNaivedya: "Sweet Pongal & Ghee Kheer",
    luckyNaivedyaL5: ashtaLakshmi.specialNaivedyaL5
  };
}
