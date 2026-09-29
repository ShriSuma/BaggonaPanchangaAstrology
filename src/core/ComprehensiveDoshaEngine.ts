/**
 * ComprehensiveDoshaEngine.ts
 *
 * 100% Authentic Vedic Parashari Dosha & Parihara Computation Engine
 *
 * Evaluates and detects all major Vedic Doshas with precise technical astrological justifications ("Why"):
 * 1. Pitru Dosha (ಪಿತೃ ದೋಷ) - 9th / 5th house afflictions, Surya-Rahu/Shani, 9th lord in Dusthana
 * 2. Narayana Bali Dosha / Pretha Badha (ನಾರಾಯಣ ಬಲಿ ದೋಷ) - 5th house curse, Putra dosha, Gulika
 * 3. Kala Sarpa Dosha (ಕಾಳ ಸರ್ಪ ದೋಷ) - 12 classical types based on Rahu's house
 * 4. Guru Chandala Dosha (ಗುರು ಚಂಡಾಲ ದೋಷ) - Guru-Rahu conjunction / aspect
 * 5. Balarishta Dosha (ಬಾಲಾರಿಷ್ಟ ದೋಷ) - Infant health vulnerabilities & Bhanga (cancellation)
 * 6. Balyagraha Dosha (ಬಾಲ್ಯಗ್ರಹ ದೋಷ) - Affliction of Mercury/Moon/Gulika
 * 7. Kuja / Manglik Dosha (ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ) - 1, 2, 4, 7, 8, 12 houses from Lagna/Moon + Bhanga
 * 8. Grahan Dosha (ಗ್ರಹಣ ದೋಷ) - Surya / Chandra Grahan with Rahu/Ketu
 * 9. Shrapit Dosha (ಶ್ರಪಿತ ದೋಷ) - Shani-Rahu conjunction
 * 10. Kemadruma Dosha (ಕೇಮದ್ರುಮ ದೋಷ) - Moon isolated without flanking planets + Bhanga
 * 11. Gandanta / Moola Nakshatra Dosha (ಗಂಡಾಂತ / ಮೂಲ ನಕ್ಷತ್ರ ದೋಷ) - Trik-sandhi nakshatra junctions
 * 12. Dasha-Bhukti Sandhi Dosha (ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ದೋಷ) - Rahu-Brihaspati, Shukraditya, Shani-Budha transitions
 * 13. Gochara Doshas (ಪ್ರಸ್ತುತ ಗೋಚಾರ ದೋಷಗಳು) - Live Sade Sati, Ashtama Shani, Kantaka Shani
 *
 * Provides:
 * - Technical astronomical "Why" (exact coordinates, houses, classical citations)
 * - Current Real-World Life Problems (1 focused paragraph on what the native is experiencing RIGHT NOW)
 * - Dasha-Bhukti Resonance (how running dasha timeline activates/magnifies the dosha)
 * - Sacred Vedic Shanti & Tirtha Parihara (Gokarna Kshetra, Kukke Subramanya, etc.)
 *
 * Fully localized across 5 languages: Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), English (en).
 */

import type { KundliInput, KundliOutput, PlanetPosition } from "./AstroTypes";
import { PlanetName, PlanetName as PN } from "./AstroTypes";
import { normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import {
  detectDashaSandhiAlert,
  calculateDecimalAgeAtDate,
  type DashaSandhiAlert
} from "./DashaSandhiAndRoadmapEngine";
import {
  generateDashaTimeline,
  generateBhuktiTimeline
} from "./DashaBhuktiEngine";
import { toKannadaPlanet } from "../utils/kannadaAstrologyTerms";
import { rashiIndexInHouse, signLord } from "./KundliInsightsEngine";
import {
  calculateGandantaraAndBhaya,
  type GandantaraAndBhayaReport,
  type DetectedGandantara,
  type DetectedFear,
  type GandantaraType,
  type FearType
} from "./GandantaraAndBhayaEngine";

export {
  calculateGandantaraAndBhaya,
  type GandantaraAndBhayaReport,
  type DetectedGandantara,
  type DetectedFear,
  type GandantaraType,
  type FearType
};

export type DoshaSeverity = "critical" | "high" | "moderate" | "mild" | "none";
export type DoshaCategory = "natal" | "dasha_sandhi" | "gochara";

export interface TechnicalDetail {
  houseNumbers: number[];
  grahasInvolved: string[];
  grahaDegrees?: { name: string; rashi: string; degreeFormatted: string }[];
  lordshipsInvolved?: string[];
  scripturalReference: string;
  hasBhangaOrMitigation: boolean;
  bhangaDescription: Record<string, string>;
}

export interface DetectedDosha {
  id: string;
  name: Record<string, string>; // kn, hi, te, ta, en
  category: DoshaCategory;
  isDetected: boolean;
  severity: DoshaSeverity;
  statusBadge: Record<string, string>;
  technicalDetail: TechnicalDetail;
  technicalWhy: Record<string, string>; // The explicit "Why" in all 5 languages
  currentLifeProblems: Record<string, string>; // Dedicated 1 paragraph of current real-life problems
  dashaResonance: Record<string, string>; // Connection to running Mahadasha & Antardasha
  lifeImpact: Record<string, string>; // 2 paragraphs explaining real-world effects
  recommendedPooja: Record<string, string>; // Specific Vedic ritual (e.g. Gokarna Tila Homa, Narayana Bali)
  remedies: Record<string, string[]>; // Mantras, charity, lifestyle disciplines
}

export interface ComprehensiveDoshaReport {
  devoteeInfo: {
    name: string;
    birthDate: string;
    birthTime: string;
    place: string;
    lagnaRashi: string;
    moonRashi: string;
    nakshatra: string;
    pada: number;
    currentDashaStr: string;
    runningMahaPlanet: string;
    runningBhuktiPlanet: string;
  };
  summary: {
    totalEvaluated: number;
    totalActive: number;
    criticalCount: number;
    highCount: number;
    moderateCount: number;
    mildCount: number;
    karmicIndexScore: number; // 0 to 100
  };
  doshas: DetectedDosha[];
  activeSandhiAlert: DashaSandhiAlert | null;
  gandantaraAndBhaya: GandantaraAndBhayaReport;
  calculatedAt: string;
}

const TARA_GRAHAS: PlanetName[] = [
  PN.Sun,
  PN.Moon,
  PN.Mars,
  PN.Mercury,
  PN.Jupiter,
  PN.Venus,
  PN.Saturn,
];

const RASHI_NAMES_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const RASHI_NAMES_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ",
  "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

const getPlanet = (k: KundliOutput, name: PlanetName): PlanetPosition | undefined =>
  k.planets.find((p) => p.name === name);

const formatDegMin = (deg: number): string => {
  const inSign = deg % 30;
  const d = Math.floor(inSign);
  const m = Math.floor((inSign - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}\'`;
};

// 12 Classical Kala Sarpa Yoga Types
const KALA_SARPA_TYPES = [
  { id: "ananta", house: 1, en: "Ananta Kala Sarpa", kn: "ಅನಂತ ಕಾಳಸರ್ಪ", hi: "अनंत कालसर्प", te: "అనంత కాలసర్ప", ta: "அனந்த காலசர்ப்ப" },
  { id: "kulika", house: 2, en: "Kulika Kala Sarpa", kn: "ಕುಲಿಕ ಕಾಳಸರ್ಪ", hi: "कुलिक कालसर्प", te: "కులిక కాలసర్ప", ta: "குலிக காலசர்ப்ப" },
  { id: "vasuki", house: 3, en: "Vasuki Kala Sarpa", kn: "ವಾಸುಕಿ ಕಾಳಸರ್ಪ", hi: "वासुकी कालसर्प", te: "వాసుకి కాలసర్ప", ta: "வாசுகி காலசர்ப்ப" },
  { id: "shankhapala", house: 4, en: "Shankhapala Kala Sarpa", kn: "ಶಂಖಪಾಲ ಕಾಳಸರ್ಪ", hi: "शंखपाल कालसर्प", te: "శంఖపాల కాలసర్ప", ta: "சங்கபால காலசர்ப்ப" },
  { id: "padma", house: 5, en: "Padma Kala Sarpa", kn: "ಪದ್ಮ ಕಾಳಸರ್ಪ", hi: "पद्म कालसर्प", te: "పద్మ కాలసర్ప", ta: "பத்ம காலசர்ப்ப" },
  { id: "mahapadma", house: 6, en: "Mahapadma Kala Sarpa", kn: "ಮಹಾಪದ್ಮ ಕಾಳಸರ್ಪ", hi: "महापद्म कालसर्प", te: "మహాపద్మ కాలసర్ప", ta: "மகாபத்ம காலசர்ப்ப" },
  { id: "takshaka", house: 7, en: "Takshaka Kala Sarpa", kn: "ತಕ್ಷಕ ಕಾಳಸರ್ಪ", hi: "तक्षक कालसर्प", te: "తక్షక కాలసర్ప", ta: "தக்ஷக காலசர்ப்ப" },
  { id: "karkotaka", house: 8, en: "Karkotaka Kala Sarpa", kn: "ಕರ್ಕೋಟಕ ಕಾಳಸರ್ಪ", hi: "कर्कोटक कालसर्प", te: "కర్కోటక కాలసర్ప", ta: "கார்கோடக காலசர்ப்ப" },
  { id: "shankhachuda", house: 9, en: "Shankhachuda Kala Sarpa", kn: "ಶಂಖಚೂಡ ಕಾಳಸರ್ಪ", hi: "शंखचूड़ कालसर्प", te: "శంఖచూడ కాలసర్ప", ta: "சங்கசூட காலசர்ப்ப" },
  { id: "ghataka", house: 10, en: "Ghataka Kala Sarpa", kn: "ಘಾತಕ ಕಾಳಸರ್ಪ", hi: "घातक कालसर्प", te: "ఘాతక కాలసర్ప", ta: "காதக காலசர்ப்ப" },
  { id: "vishadhara", house: 11, en: "Vishadhara Kala Sarpa", kn: "ವಿಷಧರ ಕಾಳಸರ್ಪ", hi: "विषधर कालसर्प", te: "విషధర కాలసర్ప", ta: "விஷதர காலசர்ப்ப" },
  { id: "sheshnaga", house: 12, en: "Sheshnaga Kala Sarpa", kn: "ಶೇಷನಾಗ ಕಾಳಸರ್ಪ", hi: "शेषनाग कालसर्प", te: "శేషనాగ కాలసర్ప", ta: "சேஷநாக காலசர்ப்ப" }
];

/**
 * Main evaluation function to compute all major Vedic Doshas with strict Parashari technical integrity.
 */
export function calculateComprehensiveDoshas(
  kundli: KundliOutput,
  input: KundliInput,
  currentDate: Date = new Date()
): ComprehensiveDoshaReport {
  const sun = getPlanet(kundli, PN.Sun);
  const moon = getPlanet(kundli, PN.Moon);
  const mars = getPlanet(kundli, PN.Mars);
  const mercury = getPlanet(kundli, PN.Mercury);
  const jupiter = getPlanet(kundli, PN.Jupiter);
  const venus = getPlanet(kundli, PN.Venus);
  const saturn = getPlanet(kundli, PN.Saturn);
  const rahu = getPlanet(kundli, PN.Rahu);
  const ketu = getPlanet(kundli, PN.Ketu);

  const lagnaRashiIdx = kundli.lagnaRashi.index;
  const moonRashiIdx = moon ? moon.rashi.index : 0;
  const lagnaLordName = signLord(lagnaRashiIdx);
  const lagnaLord = getPlanet(kundli, lagnaLordName);

  const ninthRashiIdx = rashiIndexInHouse(lagnaRashiIdx, 9);
  const ninthLordName = signLord(ninthRashiIdx);
  const ninthLord = getPlanet(kundli, ninthLordName);

  const fifthRashiIdx = rashiIndexInHouse(lagnaRashiIdx, 5);
  const fifthLordName = signLord(fifthRashiIdx);
  const fifthLord = getPlanet(kundli, fifthLordName);

  const eighthRashiIdx = rashiIndexInHouse(lagnaRashiIdx, 8);
  const eighthLordName = signLord(eighthRashiIdx);
  const eighthLord = getPlanet(kundli, eighthLordName);

  // Compute Active Running Mahadasha and Bhukti
  const currentAge = calculateDecimalAgeAtDate(input.birthDate, currentDate);
  const dashaTimeline = generateDashaTimeline(kundli, 120);
  const bhuktiTimeline = generateBhuktiTimeline(kundli, 120);

  const activeMahaIdx = dashaTimeline.findIndex(
    (d) => currentAge >= d.startAge - 1e-6 && currentAge < d.endAge - 1e-6
  );
  const activeMaha = dashaTimeline[activeMahaIdx] || dashaTimeline[0];

  const activeBhuktiIdx = bhuktiTimeline.findIndex(
    (b) => currentAge >= b.startAge - 1e-6 && currentAge < b.endAge - 1e-6
  );
  const activeBhukti = bhuktiTimeline[activeBhuktiIdx] || bhuktiTimeline[0];

  const activeMahaPlanet = activeMaha.planet;
  const activeBhuktiPlanet = activeBhukti.bhukti;
  const activeMahaKn = toKannadaPlanet(activeMahaPlanet);
  const activeBhuktiKn = toKannadaPlanet(activeBhuktiPlanet);

  const buildDashaResonance = (
    triggerPlanets: PlanetName[],
    doshaNameKn: string
  ): Record<string, string> => {
    const isDirectMatch =
      triggerPlanets.includes(activeMahaPlanet) ||
      triggerPlanets.includes(activeBhuktiPlanet);

    if (isDirectMatch) {
      return {
        kn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${activeMahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${activeBhuktiKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದ್ದು, ಈ ದಶಾಧಿಪತಿಗಳು ನೇರವಾಗಿ ಈ ${doshaNameKn}ದ ಕಾರಕ ಗ್ರಹಗಳಾಗಿದ್ದಾರೆ. ಆದ್ದರಿಂದ ಪ್ರಸ್ತುತ ಈ ಅವಧಿಯಲ್ಲಿ ಈ ದೋಷದ ನೈಜ ತೊಂದರೆಗಳು ನಿಮ್ಮ ದಿನನಿತ್ಯದ ಬದುಕಿನಲ್ಲಿ ಗರಿಷ್ಠ ತೀವ್ರತೆಯಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿವೆ. ಸಕಾಲಿಕ ವೈದಿಕ ಶಾಂತಿಯು ತಕ್ಷಣದ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.`,
        hi: `वर्तमान में आपकी कुंडली में ${activeMahaPlanet} महादशा में ${activeBhuktiPlanet} भुक्ति चल रही है। यह दशा क्रम सीधे इस दोष को सक्रिय कर रहा है, जिससे वर्तमान जीवन में इसके प्रत्यक्ष प्रभाव तीव्र रूप से अनुभव हो रहे हैं। शांति अनुष्ठान शीघ्र अनिवार्य है।`,
        te: `ప్రస్తుతం మీ కుండలిలో ${activeMahaPlanet} మహాదశలో ${activeBhuktiPlanet} భుక్తి నడుస్తోంది. ఈ గ్రహాల దశా ప్రభావం వల్ల ప్రస్తుత సమయంలో ఈ దోషం గరిష్ట స్థాయిలో జీవితంలో సమస్యలను రేకెత్తిస్తోంది. శాంతి పూజలు తప్పనిసరి.`,
        ta: `தற்போது ${activeMahaPlanet} மகாதிசையில் ${activeBhuktiPlanet} அந்தர்திசை நடைபெறுகிறது. இந்த கிரகக் கூட்டமைப்பு இந்த தோஷத்தை தீவிரமாகத் தூண்டி அன்றாட வாழ்வில் சவால்களை உருவாக்குகிறது. சாந்தி பரிகாரம் உடனடி நிவாரணம் தரும்.`,
        en: `Currently running ${activeMahaPlanet} Mahadasha with ${activeBhuktiPlanet} Antardasha. As these running planetary rulers directly trigger this dosha, its disruptive symptoms are currently operating at heightened potency in your daily reality. Consecrated propitiation provides immediate protection.`
      };
    }

    return {
      kn: `ಪ್ರಸ್ತುತ ನೀವು ${activeMahaKn} ಮಹಾದಶೆ - ${activeBhuktiKn} ಭುಕ್ತಿ ಕಾಲದಲ್ಲಿದ್ದು, ಈ ದೋಷವು ಜಾತಕದಲ್ಲಿ ಅಂತರ್ಗತ ಕರ್ಮವಾಗಿ ಮುಂದುವರಿಯುತ್ತಿದೆ. ಮುಂಬರುವ ಸಂಬಂಧಿತ ಗ್ರಹದಶಾ ಕಾಲದಲ್ಲಿ ಯಾವುದೇ ತೊಂದರೆ ಬಾರದಂತೆ ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ ಮಾಡಿಸುವುದು ಶ್ರೇಯಸ್ಕರ.`,
      hi: `वर्तमान में ${activeMahaPlanet} महादशा - ${activeBhuktiPlanet} भुक्ति चल रही है। यह दोष कुंडली में अंतर्निहित कर्म के रूप में विद्यमान है। आगामी दशाओं में सुरक्षा हेतु समय पर शांति पूजा उत्तम रहेगी।`,
      te: `ప్రస్తుతం ${activeMahaPlanet} మహాదశ - ${activeBhuktiPlanet} భుక్తి జరుగుతోంది. రాబోయే కాలంలో ఇబ్బందులు రాకుండా ముందస్తుగా పరిహారాలు చేసుకోవడం మంచిది.`,
      ta: `தற்போது ${activeMahaPlanet} மகாதிசை - ${activeBhuktiPlanet} புத்தி நடப்பில் உள்ளது. எதிர்காலத்தில் பாதிப்புகள் ஏற்படாமல் தடுக்க முன்னெச்சரிக்கையாக சாந்தி செய்வது நலம்.`,
      en: `Currently traversing ${activeMahaPlanet}-${activeBhuktiPlanet} dasha; this affliction operates as latent karmic resistance. Timely sanctified remedies prevent adverse activation in upcoming cycles.`
    };
  };

  const doshasList: DetectedDosha[] = [];

  // ==========================================================================
  // 1. PITRU DOSHA (ಪಿತೃ ದೋಷ / पितृ दोष)
  // ==========================================================================
  const pitruReasonsKn: string[] = [];
  const pitruReasonsHi: string[] = [];
  const pitruReasonsTe: string[] = [];
  const pitruReasonsTa: string[] = [];
  const pitruReasonsEn: string[] = [];
  const pitruHouses: number[] = [];
  const pitruGrahas: string[] = [];

  if (rahu && (rahu.house === 9 || rahu.house === 5)) {
    pitruHouses.push(rahu.house);
    pitruGrahas.push("Rahu");
    pitruReasonsKn.push(`ರಾಹು ಗ್ರಹವು ಪಿತೃ/ಭಾಗ್ಯ ಸ್ಥಾನವಾದ ${rahu.house}ನೇ ಮನೆಯಲ್ಲಿ (${RASHI_NAMES_KN[rahu.rashi.index]}) ಸ್ಥಿತನಾಗಿರುವುದು.`);
    pitruReasonsHi.push(`छायाग्रह राहु का नवम/पंचम भाव (${rahu.house}वें भाव) में स्थित होना।`);
    pitruReasonsTe.push(`రాహువు పితృ స్థానమైన ${rahu.house}వ స్థానంలో స్థితి చెందడం.`);
    pitruReasonsTa.push(`ராகு பகவான் 9 அல்லது 5 ஆம் வீட்டில் சஞ்சரிப்பது.`);
    pitruReasonsEn.push(`Rahu occupies the vital 9th/5th house (${rahu.house}th house) in ${RASHI_NAMES_EN[rahu.rashi.index]}.`);
  }

  if (sun && rahu && sun.rashi.index === rahu.rashi.index) {
    pitruHouses.push(sun.house);
    pitruGrahas.push("Sun", "Rahu");
    const diff = Math.abs(sun.degree - rahu.degree);
    pitruReasonsKn.push(`ಪಿತೃಕಾರಕ ಸೂರ್ಯ ಮತ್ತು ರಾಹು ${sun.house}ನೇ ಮನೆಯಲ್ಲಿ ${diff.toFixed(1)}° ಅಂತರದಲ್ಲಿ ಯುತಿ ಹೊಂದಿ ಸೂರ್ಯ ಗ್ರಹಣ ಪಿತೃದೋಷ ನಿರ್ಮಿಸಿರುವುದು.`);
    pitruReasonsHi.push(`पितृकारक सूर्य एवं राहु का ${sun.house}वें भाव में युति संबंध होना।`);
    pitruReasonsTe.push(`సూర్యుడు మరియు రాహువు ${sun.house}వ స్థానంలో కలసి ఉండటం.`);
    pitruReasonsTa.push(`சூரியனும் ராகுவும் ${sun.house} ஆம் வீட்டில் இணைந்து சஞ்சரிப்பது.`);
    pitruReasonsEn.push(`Sun (Pitrukaraka) is conjunct Rahu in the ${sun.house}th house within ${diff.toFixed(1)}° orb.`);
  }

  if (sun && saturn && sun.rashi.index === saturn.rashi.index) {
    pitruHouses.push(sun.house);
    pitruGrahas.push("Sun", "Saturn");
    pitruReasonsKn.push(`ಸೂರ್ಯ ಮತ್ತು ಶನಿ ಗ್ರಹಗಳ ಪರಸ್ಪರ ಶತ್ರು ಸಂಯೋಗವು ${sun.house}ನೇ ಮನೆಯಲ್ಲಿ ಪಿತೃ ಋಣ ದೋಷ ಉಂಟುಮಾಡಿರುವುದು.`);
    pitruReasonsHi.push(`सूर्य और शनि का परस्पर युति संबंध ${sun.house}वें भाव में होना।`);
    pitruReasonsTe.push(`సూర్య-శనుల సంయోగం ${sun.house}వ స్థానంలో ఉండటం.`);
    pitruReasonsTa.push(`சூரியனும் சனியும் ${sun.house} ஆம் வீட்டில் இணைந்து இருப்பது.`);
    pitruReasonsEn.push(`Mutual combustion and enemy conjunction of Sun and Saturn in the ${sun.house}th house.`);
  }

  if (sun && (sun.house === 6 || sun.house === 8 || sun.house === 12)) {
    pitruHouses.push(sun.house);
    pitruGrahas.push("Sun");
    pitruReasonsKn.push(`ಪಿತೃಕಾರಕ ಸೂರ್ಯನು ತ್ರಿಕ/ದುಸ್ಥಾನವಾದ ${sun.house}ನೇ ಮನೆಯಲ್ಲಿ ನೆಲೆಸಿರುವುದು.`);
    pitruReasonsHi.push(`पितृकारक सूर्य का त्रिक भाव (${sun.house}वें भाव) में स्थित होना।`);
    pitruReasonsTe.push(`సూర్యుడు దుఃస్థానమైన ${sun.house}వ స్థానంలో ఉండటం.`);
    pitruReasonsTa.push(`சூரிய பகவான் ${sun.house} ஆம் மறைவு ஸ்தானத்தில் இருப்பது.`);
    pitruReasonsEn.push(`Sun (Pitrukaraka) is relegated to the Dusthana ${sun.house}th house.`);
  }

  if (ninthLord && (ninthLord.house === 6 || ninthLord.house === 8 || ninthLord.house === 12)) {
    pitruHouses.push(ninthLord.house);
    pitruGrahas.push(ninthLord.name);
    pitruReasonsKn.push(`೯ನೇ ಭಾಗ್ಯಾಧಿಪತಿಯಾದ ${ninthLord.name} ದುಸ್ಥಾನವಾದ ${ninthLord.house}ನೇ ಮನೆಯಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು.`);
    pitruReasonsHi.push(`नवमेश ${ninthLord.name} का त्रिक भाव (${ninthLord.house}वें भाव) में होना।`);
    pitruReasonsTe.push(`9వ అధిపతి ${ninthLord.name} దుఃస్థానమైన ${ninthLord.house}వ స్థానంలో ఉండటం.`);
    pitruReasonsTa.push(`9 ஆம் அதிபதி ${ninthLord.name} மறைவு ஸ்தானத்தில் இருப்பது.`);
    pitruReasonsEn.push(`9th house lord ${ninthLord.name} is placed in the ${ninthLord.house}th Dusthana.`);
  }

  const isPitruActive = pitruReasonsKn.length > 0;
  const pitruSeverity: DoshaSeverity =
    pitruReasonsKn.length >= 3 ? "critical" : pitruReasonsKn.length >= 2 ? "high" : pitruReasonsKn.length === 1 ? "moderate" : "none";

  doshasList.push({
    id: "pitru_dosha",
    name: {
      kn: "ಪಿತೃ ದೋಷ (Pitru Dosha)",
      hi: "पितृ दोष (Pitru Dosha)",
      te: "పితృ దోషం (Pitru Dosha)",
      ta: "பித்ரு தோஷம் (Pitru Dosha)",
      en: "Pitru Dosha (Ancestral Karmic Debt)"
    },
    category: "natal",
    isDetected: isPitruActive,
    severity: pitruSeverity,
    statusBadge: {
      kn: isPitruActive ? "ಸಕ್ರಿಯ ಪಿತೃ ಋಣ" : "ನಿರ್ದೋಷ (ಪಿತೃ ಕೃಪೆ)",
      hi: isPitruActive ? "सक्रिय पितृ ऋण" : "पितृ कृपा युक्त",
      te: isPitruActive ? "పితృ దోషం ఉంది" : "పితృ కృప",
      ta: isPitruActive ? "பித்ரு தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isPitruActive ? "ACTIVE PITRU DEBT" : "ANCESTRAL HARMONY"
    },
    technicalDetail: {
      houseNumbers: Array.from(new Set(pitruHouses)),
      grahasInvolved: Array.from(new Set(pitruGrahas)),
      grahaDegrees: [
        ...(sun ? [{ name: "Sun", rashi: RASHI_NAMES_EN[sun.rashi.index], degreeFormatted: formatDegMin(sun.degree) }] : []),
        ...(rahu ? [{ name: "Rahu", rashi: RASHI_NAMES_EN[rahu.rashi.index], degreeFormatted: formatDegMin(rahu.degree) }] : []),
        ...(saturn ? [{ name: "Saturn", rashi: RASHI_NAMES_EN[saturn.rashi.index], degreeFormatted: formatDegMin(saturn.degree) }] : [])
      ],
      lordshipsInvolved: ["9th Lord (Bhagya)", "5th Lord (Purva Punya)"],
      scripturalReference: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಪಿತೃದೋಷಾಧ್ಯಾಯ (BPHS, Pitru Dosha Adhyaya)",
      hasBhangaOrMitigation: !isPitruActive,
      bhangaDescription: {
        kn: isPitruActive ? "ಪಿತೃ ಋಣವು ಪ್ರತ್ಯಕ್ಷವಾಗಿದ್ದು, ವೈದಿಕ ತರ್ಪಣ ಮತ್ತು ತಿಲ ಹೋಮದ ಶಾಂತಿ ಅತ್ಯಗತ್ಯವಾಗಿದೆ." : "ಯಾವುದೇ ಪಿತೃ ಋಣವಿಲ್ಲ.",
        en: isPitruActive ? "Requires consecrated Tila Homa and ancestral Tarpanam; planetary mitigations alone do not absolve pitru debt." : "Unafflicted."
      }
    },
    technicalWhy: {
      kn: isPitruActive
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಪಿತೃ ದೋಷವು ದೃಢಪಟ್ಟಿರುವುದಕ್ಕೆ ಖಗೋಳ ಶಾಸ್ತ್ರೀಯ ಕಾರಣಗಳು: ${pitruReasonsKn.join(" ")} ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ೯ನೇ ಮನೆ ಪಿತೃ ಮತ್ತು ಧರ್ಮ ಸ್ಥಾನ, ಸೂರ್ಯನು ಪಿತೃಕಾರಕ. ಈ ಸ್ಥಾನಗಳಿಗೆ ಛಾಯಾಗ್ರಹ ರಾಹು ಅಥವಾ ಶನಿಯ ಶಾಪಯುತಿ ಉಂಟಾದಾಗ ಪಿತೃದೇವತೆಗಳ ಋಣವು ಮುಂದುವರಿಯುತ್ತದೆ.`
        : "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ೯ನೇ ಮನೆ, ೫ನೇ ಮನೆ ಹಾಗೂ ಸೂರ್ಯ ಗ್ರಹವು ಯಾವುದೇ ಪಾಪಗ್ರಹಗಳ ಬಾಧೆಯಿಲ್ಲದೆ ಶುಭಕರವಾಗಿದ್ದು, ಪಿತೃ ದೋಷವು ಇರುವುದಿಲ್ಲ.",
      hi: isPitruActive
        ? `आपकी कुंडली में पितृ दोष की शास्त्रीय खगोलीय स्थिति: ${pitruReasonsHi.join(" ")} नवम भाव धर्म, पूर्व संचित पुण्य एवं पितरों का स्थान है। सूर्य एवं राहु का प्रतिकूल संबंध पितृ ऋण को दर्शाता है।`
        : "आपकी जन्म कुंडली में नवम, पंचम भाव एवं सूर्य पूर्णतः शुभ हैं। किसी भी प्रकार का पितृ दोष नहीं है।",
      te: isPitruActive
        ? `మీ కుండలిలో పితృ దోషం ఏర్పడటానికి సాంకేతిక ఖగోళ కారణాలు: ${pitruReasonsTe.join(" ")} 9వ స్థానం మరియు సూర్యునిపై రాహు-శనుల ప్రతికూల దృష్టి పూర్వజన్మ పితృ ఋణాన్ని సూచిస్తోంది.`
        : "మీ జన్మ పత్రికలో నవమ, పంచమ స్థానాలు మరియు సూర్యుడు శుభప్రదంగా ఉన్నారు. పితృ దోషం లేదు.",
      ta: isPitruActive
        ? `உங்கள் ஜாதகத்தில் பித்ரு தோஷம் ஏற்படுவதற்கான ஜோதிடக் காரணங்கள்: ${pitruReasonsTa.join(" ")} 9 ஆம் வீடு மற்றும் சூரியன் மீதான ராகு/சனியின் தாக்கம் முன்னோர்களின் கர்ம வினையை உணர்த்துகிறது.`
        : "உங்கள் ஜாதகத்தில் 9 ஆம் வீடு மற்றும் சூரிய பகவான் சுபமாக உள்ளனர். பித்ரு தோஷம் இல்லை.",
      en: isPitruActive
        ? `Astronomical configuration generating Pitru Dosha: ${pitruReasonsEn.join(" ")} In Vedic doctrine, the 9th house represents paternal ancestry and dharmic lineage; affliction of Sun, 9th lord, or 9th house by nodal/saturnine energy signifies unfulfilled ancestral obligations requiring purification.`
        : "The 9th house, 5th house, and the Sun are free from malefic afflictions. No Pitru Dosha is present in this chart."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ಕೆಲಸವನ್ನು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಪ್ರಾರಂಭಿಸಿದರೂ ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಎದುರಾಗುತ್ತಿವೆ. ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರಮೋಷನ್ ಅಥವಾ ಆದಾಯದ ಹೆಚ್ಚಳ ಸಿಗದೆ ವಿಳಂಬ, ಹಣಕಾಸು ಉಳಿತಾಯವಾಗದೆ ಅನಗತ್ಯ ತುರ್ತು ವೆಚ್ಚಗಳು ಬರುವುದು ಹಾಗೂ ಹಿರಿಯರೊಂದಿಗೆ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಮೂಡಿ ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಕಸಿವಿಸಿ ಉಂಟಾಗುತ್ತಿದೆ.",
      hi: "वर्तमान समय में आपके जीवन में महत्वपूर्ण कार्यों के अंतिम क्षण में रुकावटें, कड़ी मेहनत के बाद भी उचित पदोन्नति अथवा सम्मान में विलंब, आर्थिक बचत न हो पाना तथा परिजनों एवं वरिष्ठों के साथ वैचारिक मतभेद जैसी समस्याएं सीधे तौर पर सामने आ रही हैं।",
      te: "ప్రస్తుతం మీరు చేపట్టే పనులలో చివరి నిమిషంలో అడ్డంకులు రావడం, కష్టానికి తగిన గుర్తింపు లభించకపోవడం, ధన వ్యయం పెరిగి పొదుపు కాకపోవడం మరియు కుటుంబంలో పెద్దలతో అభిప్రాయ భేదాలు తలెత్తడం వంటి సమస్యలు ఎదురవుతున్నాయి.",
      ta: "தற்போது நீங்கள் தொடங்கும் சுப காரியங்கள் கடைசி நேரத்தில் தடைபடுவது, உழைப்பிற்கு ஏற்ற அங்கீகாரம் கிடைப்பதில் தாமதம், எதிர்பாராத வீண் செலவுகள் மற்றும் குடும்பப் பெரியவர்களுடன் கருத்து வேறுபாடுகள் போன்ற பிரச்சனைகள் அன்றாட வாழ்க்கையில் ஏற்படுகின்றன.",
      en: "Currently in your day-to-day life, you are confronting sudden eleventh-hour stalls on vital projects, delayed recognition or promotion despite diligent toil, uncontainable leakages in savings, and strained communication with elders or paternal figures."
    },
    dashaResonance: buildDashaResonance([PN.Sun, PN.Rahu, PN.Saturn], "ಪಿತೃ ದೋಷ"),
    lifeImpact: {
      kn: isPitruActive
        ? `ಈ ಪಿತೃದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಜೀವನದ ಪ್ರಮುಖ ಹಂತಗಳಲ್ಲಿ ನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕೈತಪ್ಪುವುದು, ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಸ್ಥಗಿತತೆ, ಆರ್ಥಿಕ ಉಳಿತಾಯದಲ್ಲಿ ಕೊರತೆ ಹಾಗೂ ಹಿರಿಯರ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರುಗಳು ಎದುರಾಗಬಹುದು. ಕುಟುಂಬದೊಳಗೆ ಅನಗತ್ಯ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಮೂಡುವುದು ಮತ್ತು ಮನಸ್ಸಿನಲ್ಲಿ ಅಜ್ಞಾತ ಅಸಮಾಧಾನ ಕಾಡುವುದು ಇದರ ಪ್ರಮುಖ ಲಕ್ಷಣವಾಗಿದೆ.

ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ನೀವು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಶ್ರಮಿಸಿದರೂ ಅದಕ್ಕೆ ತಕ್ಕ ಗೌರವ ತಡವಾಗಿ ದೊರೆಯುತ್ತಿದೆ. ವಂಶ ಪಾರಂಪರ್ಯವಾಗಿ ಬರಬೇಕಾದ ಆಸ್ತಿ ಅಥವಾ ಸವಲತ್ತುಗಳಲ್ಲಿ ಕಾನೂನು ಅಡೆತಡೆಗಳು ಬಾರದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಮತ್ತು ಹಿರಿಯರ ಹೆಸರಿನಲ್ಲಿ ತರ್ಪಣ ಹಾಗೂ ಸತ್ಕರ್ಮಗಳನ್ನು ಆಚರಿಸುವುದು ನಿಮ್ಮ ಎಲ್ಲಾ ಕಾರ್ಯಗಳಲ್ಲಿ ಹೊಸ ಚೈತನ್ಯವನ್ನು ತರಲಿದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೇವತೆಗಳ ಆಶೀರ್ವಾದ ಪರಿಪೂರ್ಣವಾಗಿದ್ದು, ವಂಶಾಭಿವೃದ್ಧಿ ಮತ್ತು ಸಕಾಲಿಕ ಭಾಗ್ಯೋದಯಕ್ಕೆ ದೈವಿಕ ಬೆಂಬಲವಿದೆ.",
      hi: isPitruActive
        ? `इस पितृ दोष के कारण जीवन के महत्वपूर्ण अवसरों पर अंतिम क्षण में रुकावटें, व्यावसायिक उन्नति में मंदी, आर्थिक बचत में अस्थिरता तथा परिजनों के स्वास्थ्य को लेकर चिंताएं उत्पन्न हो सकती हैं।

वर्तमान समय में आपके परिश्रम का उचित प्रतिफल मिलने में विलंब हो रहा है। नियमित तर्पण, पूर्वजों के निमित्त दान एवं सात्विक जीवन शैली से इस दोष के समस्त अवरोध दूर होकर स्थायी समृद्धि प्राप्त होती है।`
        : "आपकी कुंडली में पितरों की पूर्ण कृपा है। पारिवारिक सुख एवं भाग्योदय निर्बाध रूप से प्राप्त होगा।",
      te: isPitruActive
        ? `ఈ పితృ దోషం వలన ముఖ్యమైన పనులలో చివరి నిమిషంలో ఆటంకాలు, వృత్తిలో మందగమనం మరియు కుటుంబంలో అశాంతి కలగవచ్చు.

ప్రస్తుతం మీ కష్టానికి తగిన గుర్తింపు లభించడంలో ఆలస్యం జరుగుతోంది. అమావాస్య తర్పణాలు మరియు గోకర్ణ తిలహోమం వంటి శాంతులు ఆచరించడం ద్వారా ఈ ప్రతికూలతలు తొలగిపోయి వంశాభివృద్ధి కలుగుతుంది.`
        : "మీ జాతకంలో పితృదేవతల సంపూర్ణ అనుగ్రహం ఉంది.",
      ta: isPitruActive
        ? `இந்த பித்ரு தோஷத்தால் காரியங்களில் கடைசி நேரத் தடைகள், தொழில் முன்னேற்றத்தில் சுணக்கம் மற்றும் குடும்ப அமைதியின்மை ஏற்படக்கூடும்.

அமாவாசை தோறும் முன்னோர்களுக்குத் தர்ப்பணம் செய்வதும், கோகர்ண திலஹோமம் செய்வதும் சகல தடைகளையும் நீக்கி நல்வாழ்வைத் தரும்.`
        : "உங்கள் ஜாதகத்தில் முன்னோர்களின் பரிபூரண ஆசி உள்ளது.",
      en: isPitruActive
        ? `In day-to-day reality, Pitru Dosha manifests as sudden threshold bottlenecks where promising professional or academic initiatives face eleventh-hour stalls. Financial accumulation feels intermittent, and domestic cohesion requires deliberate patience.

In your current life phase, this ancestral debt creates psychological friction and delayed recognition of honest labor. Performing scriptural propitiations releases trapped ancestral blessings, restoring vocational acceleration and generational peace.`
        : "Full ancestral harmony prevails in this chart, supporting spontaneous fortune and familial growth."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ 'ತಿಲ ಹೋಮ' (Tila Homa) ಮತ್ತು 'ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ' (Tripindi Shradha)",
      hi: "गोकर्ण महाबलेश्वर अथवा गया तीर्थ में 'तिल होम' एवं 'त्रिपिंडी श्राद्ध'",
      te: "గోకర్ణ క్షేత్రంలో 'తిల హోమం' మరియు 'త్రిపిండి శ్రాద్ధం'",
      ta: "கோகர்ண க்ஷேத்திரத்தில் 'தில ஹோமம்' மற்றும் 'திரிபிண்டி சிரார்த்தம்'",
      en: "Gokarna Kshetra Tila Homa & Tripindi Shradha under sacred Vedic rites"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃಗಳ ಸ್ಮರಣೆ ಮಾಡಿ ಕಾಗೆ ಮತ್ತು ಗೋವುಗಳಿಗೆ ಎಳ್ಳು ಮಿಶ್ರಿತ ಅನ್ನ ಸಮರ್ಪಿಸಿ.",
        "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯ ಸಮಯದಲ್ಲಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ಪ್ರದಾನ ಮಾಡಿ.",
        "ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಪ್ರತಿನಿತ್ಯ ಕನಿಷ್ಠ ೨೪ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ."
      ],
      hi: [
        "प्रत्येक अमावस्या को पितरों के निमित्त काले तिल व जल से तर्पण करें।",
        "तांबे के लोटे से सूर्य को कुमकुम व अक्षत युक्त जल अर्पित करें।",
        "गायत्री मंत्र का प्रतिदिन 108 बार जप करें।"
      ],
      te: [
        "ప్రతి అమావాస్యకు పితృదేవతలను స్మరిస్తూ కాకులకు, ఆవులకు ఆహారం ఇవ్వండి.",
        "సూర్యోదయ సమయంలో సూర్య భగవానునికి అర్ఘ్యం సమర్పించండి.",
        "నిత్యం గాయత్రీ మంత్రాన్ని 108 సార్లు జపించండి."
      ],
      ta: [
        "அமாவாசை தோறும் முன்னோர்களை நினைத்து காகத்திற்கு எள் கலந்த சாதம் வைக்கவும்.",
        "தினமும் சூரிய உதயத்தில் செம்பு பாத்திரத்தில் நீர் எடுத்து அர்க்கியம் விடவும்.",
        "தினமும் 108 முறை காயத்ரி மந்திரம் ஜபிக்கவும்."
      ],
      en: [
        "Perform water and black sesame Tarpanam on every Amavasya for ancestral peace.",
        "Offer copper vessel Arghya to the rising Sun daily while reciting Aditya Hridaya Stotram.",
        "Chant the sacred Gayatri Mantra 108 times at dawn."
      ]
    }
  });

  // ==========================================================================
  // 2. NARAYANA BALI DOSHA / PRETHA BADHA (ನಾರಾಯಣ ಬಲಿ ದೋಷ)
  // ==========================================================================
  const narayanaReasonsKn: string[] = [];
  const narayanaReasonsHi: string[] = [];
  const narayanaReasonsTe: string[] = [];
  const narayanaReasonsTa: string[] = [];
  const narayanaReasonsEn: string[] = [];
  const narayanaHouses: number[] = [];
  const narayanaGrahas: string[] = [];

  const fifthRashiIndex = rashiIndexInHouse(lagnaRashiIdx, 5);
  const jupiterRashi = jupiter ? jupiter.rashi.index : -1;

  if (rahu && rahu.house === 5) {
    narayanaHouses.push(5);
    narayanaGrahas.push("Rahu");
    narayanaReasonsKn.push("೫ನೇ ಸಂತಾನ/ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿ ಸರ್ಪಗ್ರಹ ರಾಹು ಸ್ಥಿತನಾಗಿರುವುದು (ವಂಶ ಋಣ).");
    narayanaReasonsEn.push("Serpent node Rahu afflicts the 5th house of lineage.");
  }

  if (ketu && ketu.house === 5) {
    narayanaHouses.push(5);
    narayanaGrahas.push("Ketu");
    narayanaReasonsKn.push("೫ನೇ ಸ್ಥಾನದಲ್ಲಿ ಮೋಕ್ಷ/ಕೇತು ನೆಲೆಸಿ ಸಂತಾನ ಸ್ಥಾನಕ್ಕೆ ಗ್ರಹಣ ತಂದಿರುವುದು.");
    narayanaReasonsEn.push("Ketu afflicts the 5th house of progeny.");
  }

  if (jupiter && rahu && (jupiter.house === rahu.house || Math.abs(jupiter.rashi.index - rahu.rashi.index) === 0)) {
    narayanaHouses.push(jupiter.house);
    narayanaGrahas.push("Jupiter", "Rahu");
    narayanaReasonsKn.push("ಪುತ್ರಕಾರಕ ಗುರು ಮತ್ತು ರಾಹುವಿನ ಯುತಿಯು ಗರುಡ ಪುರಾಣದ ಪ್ರಕಾರ ಅತೃಪ್ತ ಆತ್ಮ ಶಾಪವನ್ನು ಸೂಚಿಸುವುದು.");
    narayanaReasonsEn.push("Putrakaraka Jupiter is contaminated by nodal shadow.");
  }

  if (fifthLord && rahu && fifthLord.rashi.index === rahu.rashi.index) {
    narayanaHouses.push(fifthLord.house);
    narayanaGrahas.push(fifthLord.name, "Rahu");
    narayanaReasonsKn.push(`೫ನೇ ಅಧಿಪತಿಯಾದ ${fifthLord.name} ರಾಹುವಿನೊಂದಿಗೆ ಯುತಿ ಹೊಂದಿರುವುದು.`);
    narayanaReasonsEn.push(`5th house lord ${fifthLord.name} is afflicted by Rahu.`);
  }

  const isNarayanaActive = narayanaReasonsKn.length > 0;
  const narayanaSeverity: DoshaSeverity =
    narayanaReasonsKn.length >= 2 ? "critical" : narayanaReasonsKn.length === 1 ? "high" : "none";

  doshasList.push({
    id: "narayana_bali",
    name: {
      kn: "ನಾರಾಯಣ ಬಲಿ ದೋಷ / ಪ್ರೇತ ಬಾಧೆ (Narayana Bali Dosha)",
      hi: "नारायण बली दोष / प्रेत बाधा (Narayana Bali)",
      te: "నారాయణ బలి దోషం (Narayana Bali Dosha)",
      ta: "நாராயண பலி தோஷம் (Narayana Bali Dosha)",
      en: "Narayana Bali Dosha (Unredeemed Ancestral Debt)"
    },
    category: "natal",
    isDetected: isNarayanaActive,
    severity: narayanaSeverity,
    statusBadge: {
      kn: isNarayanaActive ? "ಶಾಂತಿ ಸಂಸ್ಕಾರ ಅವಶ್ಯಕ" : "ಶುಭ ಸಂತಾನ ಯೋಗ",
      hi: isNarayanaActive ? "नारायण बली आवश्यक" : "शुभ संतान योग",
      te: isNarayanaActive ? "శాంతి అవసరం" : "శుభ యోగం",
      ta: isNarayanaActive ? "சாந்தி தேவை" : "தோஷமில்லை",
      en: isNarayanaActive ? "NARAYANA BALI REQUIRED" : "LINEAGE HARMONY"
    },
    technicalDetail: {
      houseNumbers: Array.from(new Set(narayanaHouses)),
      grahasInvolved: Array.from(new Set(narayanaGrahas)),
      grahaDegrees: [
        ...(jupiter ? [{ name: "Jupiter (Putrakaraka)", rashi: RASHI_NAMES_EN[jupiter.rashi.index], degreeFormatted: formatDegMin(jupiter.degree) }] : []),
        ...(rahu ? [{ name: "Rahu", rashi: RASHI_NAMES_EN[rahu.rashi.index], degreeFormatted: formatDegMin(rahu.degree) }] : [])
      ],
      lordshipsInvolved: ["5th Lord (Lineage)", "Jupiter (Putrakaraka)"],
      scripturalReference: "ಗರುಡ ಪುರಾಣ, ಪ್ರೇತ ಕಲ್ಪ & ಧರ್ಮಸಿಂಧು (Garuda Purana & Dharmasindhu)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ನಾರಾಯಣ ಬಲಿ ದೋಷಕ್ಕೆ ನೇರ ವೈದಿಕ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಸ್ಕಾರವೇ ಏಕೈಕ ನಿವಾರಣೆಯಾಗಿದೆ.",
        en: "Requires direct ritual propitiation; planetary cancellations do not extinguish ancestral liberation rites."
      }
    },
    technicalWhy: {
      kn: isNarayanaActive
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ಅವಶ್ಯಕತೆಯನ್ನು ಸೂಚಿಸುವ ಖಗೋಳ ಗ್ರಹ ಸಂಯೋಜನೆ: ${narayanaReasonsKn.join(" ")} ಗರುಡ ಪುರಾಣದ ಪ್ರಕಾರ ೫ನೇ ಮನೆ ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಮೇಲಿನ ತೀವ್ರ ಛಾಯಾಗ್ರಹ ಪ್ರಭಾವವು ಹಿಂದಿನ ತಲೆಮಾರುಗಳಲ್ಲಿ ಅಕಾಲಿಕ ಮರಣ ಹೊಂದಿದ ಅಥವಾ ಮುಕ್ತಿ ಕಾಣದ ಆತ್ಮಗಳ ಶಾಂತಿಗಾಗಿ ನಾರಾಯಣ ಬಲಿ ಸಂಸ್ಕಾರದ ಅಗತ್ಯವನ್ನು ತೋರ್ಪಡಿಸುತ್ತದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ೫ನೇ ಮನೆ, ಪುತ್ರಕಾರಕ ಗುರು ಮತ್ತು ಪೂರ್ವರೀತ್ಯಾ ಸ್ಥಾನಗಳು ಶುಭವಾಗಿದ್ದು, ನಾರಾಯಣ ಬಲಿ ದೋಷದ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ.",
      hi: isNarayanaActive
        ? `कुंडली में नारायण बली की आवश्यकता के ग्रह संकेत: ${narayanaReasonsEn.join(" ")} पंचम भाव एवं संतान कारक गुरु पर राहु/केतु का प्रतिकूल प्रभाव अतृप्त आत्माओं की शांति हेतु नारायण बली पूजा का निर्देश देता है।`
        : "पंचम भाव एवं गुरु शुभ हैं। नारायण बली की कोई आवश्यकता नहीं है।",
      te: isNarayanaActive
        ? `మీ కుండలిలో నారాయణ బలి దోషం గల గ్రహ స్థితులు: 5వ స్థానం లేదా గురు గ్రహంపై రాహు-కేతువుల ప్రభావం ఉంది. గరుడ పురాణోక్త నారాయణ బలి సంస్కారం ద్వారా పూర్వీకులకు మోక్షం లభిస్తుంది.`
        : "జాతకంలో 5వ స్థానం మరియు గురు గ్రహం శుభంగా ఉన్నందున నారాయణ బలి దోషం లేదు.",
      ta: isNarayanaActive
        ? `ஜாதகத்தில் 5 ஆம் வீடு மற்றும் குரு மீதான ராகுவின் தாக்கம் நாராயண பலி பூஜையின் தேவையை உணர்த்துகிறது.`
        : "ஜாதகத்தில் 5 ஆம் வீடு மற்றும் குரு பகவான் சுபமாக உள்ளதால் நாராயண பலி தோஷம் இல்லை.",
      en: isNarayanaActive
        ? `Astrological indicators necessitating Narayana Bali: ${narayanaReasonsEn.join(" ")} Classical texts (Garuda Purana) declare that afflictions to the 5th house, 5th lord, or Jupiter by serpentine shadow nodes mirror unredeemed ancestral spirits requiring formal Vedic liberation rites.`
        : "5th house, 5th lord, and Jupiter are harmoniously placed. No Narayana Bali indications present."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಕಾರಣವಿಲ್ಲದೆ ಮಾನಸಿಕ ಅಶಾಂತಿ ಮತ್ತು ಅಭದ್ರತೆಯ ಭಾವನೆ, ವಂಶಾಭಿವೃದ್ಧಿ ಅಥವಾ ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ಅಡೆತಡೆಗಳು, ಮನೆಯಲ್ಲಿ ಸದಸ್ಯರ ಸತತ ಅನಾರೋಗ್ಯ ಹಾಗೂ ರಕ್ತಸಂಬಂಧಿಗಳಲ್ಲಿ ಆಸ್ತಿ ಅಥವಾ ಹಣಕಾಸಿನ ವಿಚಾರದಲ್ಲಿ ಮನಸ್ತಾಪಗಳು ನಿಮ್ಮ ದೈನಂದಿನ ನೆಮ್ಮದಿಯನ್ನು ಕೆಡಿಸುತ್ತಿವೆ.",
      hi: "वर्तमान में आपके परिवार में अकारण मानसिक अशांति, वंश वृद्धि अथवा संतान संबंधी कार्यों में विलंब, पारिवारिक सदस्यों का निरंतर अस्वस्थ रहना तथा परिजनों के बीच तनावपूर्ण संबंध जैसी समस्याएं उत्पन्न हो रही हैं।",
      te: "ప్రస్తుతం మీ కుటుంబంలో కారణం లేని మానసిక ఆందోళన, సంతాన భాగ్యంలో ఆలస్యం, కుటుంబ సభ్యుల అనారోగ్య సమస్యలు మరియు బంధువులతో వివాదాలు మీ మనశ్శాంతిని దెబ్బతీస్తున్నాయి.",
      ta: "தற்போது குடும்பத்தில் காரணமற்ற மன அமைதியின்மை, சந்தான பாக்கியத்தில் தாமதம், குடும்பத்தினருக்கு அடிக்கடி உடல்நலக் குறைவு மற்றும் இரத்த உறவினர்களிடையே சொத்து மனக்கசப்புகள் போன்ற பிரச்சனைகள் காணப்படுகின்றன.",
      en: "Currently experiencing persistent domestic discord, lineage continuation anxieties, recurrent unexplained health setbacks among family members, and inheritance frictions that drain mental tranquility."
    },
    dashaResonance: buildDashaResonance([PN.Rahu, PN.Ketu, PN.Jupiter], "ನಾರಾಯಣ ಬಲಿ ದೋಷ"),
    lifeImpact: {
      kn: isNarayanaActive
        ? `ಈ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ವಂಶ ವೃದ್ಧಿಯಲ್ಲಿ ನಿಧಾನಗತಿ, ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ತಡವಾಗುವುದು, ಕೌಟುಂಬಿಕ ವ್ಯವಹಾರಗಳಲ್ಲಿ ನಿರಂತರ ಅಡಚಣೆಗಳು ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಕಾರಣವಿಲ್ಲದೆ ಜಗಳ-ಮನಸ್ತಾಪಗಳು ಉಂಟಾಗಬಹುದು. ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಒಂದು ರೀತಿಯ ಅಭದ್ರತೆಯ ಭಾವನೆ ಕಾಡಬಹುದು.

ಗೋಕರ್ಣ ಅಥವಾ ತ್ರಯಂಬಕೇಶ್ವರದಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಾರಾಯಣ ಬಲಿ ಸಂಸ್ಕಾರ ಮಾಡಿಸುವುದರಿಂದ ಪಿತೃಗಳಿಗೆ ಸದ್ಗತಿ ದೊರೆತು, ಅವರ ದೈವಿಕ ಆಶೀರ್ವಾದವು ನಿಮ್ಮ ಕುಟುಂಬದ ಸಮೃದ್ಧಿ, ಆರೋಗ್ಯ ಮತ್ತು ಸಂತಾನ ಭಾಗ್ಯವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ರಕ್ಷಿಸುತ್ತದೆ.`
        : "ಕುಟುಂಬದ ವಂಶಾಭಿವೃದ್ಧಿ ಮತ್ತು ಸಂತಾನ ಭಾಗ್ಯಕ್ಕೆ ದೈವಿಕ ರಕ್ಷಣೆ ಇದೆ.",
      hi: isNarayanaActive
        ? `इस दोष के कारण पारिवारिक वंश वृद्धि में विलंब, संतान संबंधी चिंताएं तथा घर में अकारण अशांति की स्थिति बन सकती है।

पवित्र तीर्थ में नारायण बली का अनुष्ठान कराने से पूर्वजों को सद्गति मिलती है और परिवार में सुख-शांति एवं वंश वृद्धि का मार्ग प्रशस्त होता है।`
        : "परिवार में पूर्ण शांति एवं समृद्धि का वास है।",
      te: isNarayanaActive
        ? `ఈ ప్రభావం వలన సంతాన లేమి లేదా సంతాన సంబంధిత సమస్యలు, కుటుంబంలో విభేదాలు రావచ్చు. గోకర్ణంలో నారాయణ బలి పూజ చేయడం శ్రేయస్కరం.`
        : "కుటుంబంలో శాంతి, సంతాన సౌభాగ్యం మరియు వంశాభివృద్ధి స్థిరంగా ఉంటాయి.",
      ta: isNarayanaActive
        ? `குடும்பத்தில் காரணமற்ற மனக்கசப்புகள், வம்ச விருத்தியில் தடைகள் வரலாம். நாராயண பலி பரிகாரம் செய்வது நற்பலன் தரும்.`
        : "குடும்பத்தில் அமைதியும், சந்தான பாக்கியமும், வம்ச விருத்தியும் நிறைந்துள்ளது.",
      en: isNarayanaActive
        ? `Unaddressed Narayana Bali indicators typically correspond to recurring family friction, lineage continuation anxieties, unexplained domestic stagnation, or persistent sleep disturbances.

Performing the sacred Narayana Bali rites dissolves these ancestral burdens, transforming blocked generational energies into protective blessings that fortify progeny, health, and ethical prosperity.`
        : "Lineage progression and family harmony remain well protected."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ನಾರಾಯಣ ಬಲಿ' ಮತ್ತು 'ನಾಗಬಲಿ ಮಹಾ ಸಂಸ್ಕಾರ'",
      hi: "गोकर्ण अथवा त्र्यंबकेश्वर में 'नारायण बली एवं नागबली संस्कार'",
      te: "గోకర్ణంలో 'నారాయణ బలి మరియు నాగబలి పూజ'",
      ta: "கோகர்ணம் அல்லது திருநாகேஸ்வரத்தில் 'நாராயண பலி மற்றும் நாகபலி'",
      en: "Sacred Narayana Bali & Nagabali Maha Samskara at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅಥವಾ ತ್ರಯಂಬಕೇಶ್ವರದಲ್ಲಿ ಅಧಿಕೃತವಾಗಿ ನಾರಾಯಣ ಬಲಿ ಸಂಸ್ಕಾರ ನೆರವೇರಿಸಿ.",
        "ಪ್ರತಿದಿನ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸ್ತೋತ್ರವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಪಠಿಸಿ.",
        "ಗೋಶಾಲೆಗೆ ಹಸಿರು ಮೇವು ಅಥವಾ ಅನ್ನದಾನ ಸಮರ್ಪಿಸಿ."
      ],
      hi: [
        "गोकर्ण अथवा त्र्यंबकेश्वर में विधिवत नारायण बली अनुष्ठान संपन्न कराएं।",
        "नित्य श्री विष्णु सहस्रनाम का पाठ करें।",
        "गौशाला में हरी घास अथवा अन्न का दान करें।"
      ],
      te: [
        "గోకర్ణంలో శాస్త్రోక్తంగా నారాయణ బలి పూజ చేయించండి.",
        "రోజూ విష్ణు సహస్రనామ స్తోత్రం పఠించండి."
      ],
      ta: [
        "கோகர்ணத்தில் நாராயண பலி சடங்கை முறைப்படி நிறைவேற்றவும்.",
        "தினமும் விஷ்ணு சஹஸ்ரநாமம் படிக்கவும்."
      ],
      en: [
        "Commission formal Narayana Bali & Nagabali rites at Gokarna Mahabaleshwara tirtha.",
        "Chant the Sri Vishnu Sahasranama Stotram daily.",
        "Sponsor meals (Annadana) and green fodder for cows at sacred goshalas."
      ]
    }
  });

  // ==========================================================================
  // 3. KALA SARPA DOSHA (ಕಾಳ ಸರ್ಪ ದೋಷ / कालसर्प दोष)
  // ==========================================================================
  let isKalaSarpa = false;
  let isKalaAmrita = false;
  let kalaSarpaTypeObj = KALA_SARPA_TYPES[0];

  if (rahu && ketu) {
    const rLong = rahu.degree;
    const kLong = ketu.degree;

    let sideACount = 0;
    let sideBCount = 0;

    for (const pName of TARA_GRAHAS) {
      const p = getPlanet(kundli, pName);
      if (!p) continue;
      const deg = p.degree;

      const diffRahu = normalizeDegree(deg - rLong);
      if (diffRahu > 0 && diffRahu < 180) {
        sideACount++;
      } else if (diffRahu > 180 && diffRahu < 360) {
        sideBCount++;
      }
    }

    if (sideACount === 7 || sideBCount === 7) {
      isKalaSarpa = true;
      const matched = KALA_SARPA_TYPES.find((t) => t.house === rahu.house);
      if (matched) kalaSarpaTypeObj = matched;
      if (sideBCount === 7) isKalaAmrita = true;
    }
  }

  doshasList.push({
    id: "kala_sarpa",
    name: {
      kn: isKalaSarpa ? `${kalaSarpaTypeObj.kn} (${kalaSarpaTypeObj.en})` : "ಕಾಳಸರ್ಪ ದೋಷ (Kala Sarpa)",
      hi: isKalaSarpa ? `${kalaSarpaTypeObj.hi} (${kalaSarpaTypeObj.en})` : "कालसर्प दोष (Kala Sarpa)",
      te: isKalaSarpa ? `${kalaSarpaTypeObj.te} (${kalaSarpaTypeObj.en})` : "కాలసర్ప దోషం (Kala Sarpa)",
      ta: isKalaSarpa ? `${kalaSarpaTypeObj.ta} (${kalaSarpaTypeObj.en})` : "காலசர்ப்ப தோஷம் (Kala Sarpa)",
      en: isKalaSarpa ? `${kalaSarpaTypeObj.en} Yoga` : "Kala Sarpa Dosha"
    },
    category: "natal",
    isDetected: isKalaSarpa,
    severity: isKalaSarpa ? (isKalaAmrita ? "moderate" : "critical") : "none",
    statusBadge: {
      kn: isKalaSarpa ? (isKalaAmrita ? "ಕಾಲ ಅಮೃತ ಯೋಗ (ಅನುಕೂಲ)" : `${kalaSarpaTypeObj.kn} ಸಕ್ರಿಯ`) : "ಸರ್ಪದೋಷ ಮುಕ್ತ",
      hi: isKalaSarpa ? (isKalaAmrita ? "काल अमृत योग" : `${kalaSarpaTypeObj.hi} सक्रिय`) : "कालसर्प मुक्त",
      te: isKalaSarpa ? "కాలసర్ప దోషం ఉంది" : "దోష రహితం",
      ta: isKalaSarpa ? "காலசர்ப்ப தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isKalaSarpa ? (isKalaAmrita ? "KALA AMRITA YOGA" : `${kalaSarpaTypeObj.en.toUpperCase()} ACTIVE`) : "FREE OF NODAL CONFINEMENT"
    },
    technicalDetail: {
      houseNumbers: rahu && ketu ? [rahu.house, ketu.house] : [],
      grahasInvolved: ["Rahu", "Ketu", ...TARA_GRAHAS],
      grahaDegrees: [
        ...(rahu ? [{ name: "Rahu", rashi: RASHI_NAMES_EN[rahu.rashi.index], degreeFormatted: formatDegMin(rahu.degree) }] : []),
        ...(ketu ? [{ name: "Ketu", rashi: RASHI_NAMES_EN[ketu.rashi.index], degreeFormatted: formatDegMin(ketu.degree) }] : [])
      ],
      scripturalReference: "ಹೋರಾ ಸಾರ & ಭೃಗು ಸಂಹಿತಾ (Horasara & Bhrigu Samhita)",
      hasBhangaOrMitigation: isKalaAmrita,
      bhangaDescription: {
        kn: isKalaAmrita ? "ಗ್ರಹಗಳು ಕೇತುವಿನ ಕಡೆ ಚಲಿಸುತ್ತಿರುವುದರಿಂದ ಇದು ಕಾಲ ಅಮೃತ ಯೋಗವಾಗಿ ಬದಲಾಗಿ, ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಶುಭಕಾರಿಯಾಗಿದೆ." : "ಪೂರ್ಣ ಬಂಧನವಿದೆ.",
        en: isKalaAmrita ? "Planets move towards spiritual Ketu, converting binding into Kala Amrita Yoga of wisdom." : "Full nodal containment without direct exit planet."
      }
    },
    technicalWhy: {
      kn: isKalaSarpa && rahu && ketu
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ರಾಹುವು ${rahu.house}ನೇ ಮನೆಯಲ್ಲಿ (${RASHI_NAMES_KN[rahu.rashi.index]} - ${formatDegMin(rahu.degree)}) ಹಾಗೂ ಕೇತುವು ${ketu.house}ನೇ ಮನೆಯಲ್ಲಿ (${RASHI_NAMES_KN[ketu.rashi.index]} - ${formatDegMin(ketu.degree)}) ಸ್ಥಿತರಾಗಿದ್ದು, ಸೂರ್ಯ, ಚಂದ್ರ, ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ ಎಂಬ ಸಪ್ತ ಗ್ರಹಗಳೆಲ್ಲವೂ ಈ ರಾಹು-ಕೇತುಗಳ ೧೮೦ ಡಿಗ್ರಿ ಅಕ್ಷದ ಒಂದೇ ಬದಿಯಲ್ಲಿ ಬಂಧಿತವಾಗಿವೆ. ರಾಹುವು ${rahu.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ ಶಾಸ್ತ್ರ ಪ್ರಕಾರ ಇದು ನಿಖರವಾಗಿ '${kalaSarpaTypeObj.kn}' ದೋಷವಾಗಿದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಸಪ್ತ ಗ್ರಹಗಳು ರಾಹು ಮತ್ತು ಕೇತುಗಳ ಅಕ್ಷದ ಎರಡೂ ಬದಿಗಳಲ್ಲಿ ಹರಡಿಕೊಂಡಿದ್ದು, ಯಾವುದೇ ಕಾಳಸರ್ಪ ದೋಷವಿರುವುದಿಲ್ಲ.",
      hi: isKalaSarpa && rahu && ketu
        ? `कुंडली में राहु ${rahu.house}वें भाव एवं केतु ${ketu.house}वें भाव में स्थित हैं। समस्त सातों ग्रह (सूर्य से शनि) राहु-केतु अक्ष के मध्य स्थित होने से '${kalaSarpaTypeObj.hi}' का निर्माण होता है।`
        : "कुंडली में समस्त ग्रह राहु-केतु के दोनों ओर संतुलित हैं। कालसर्प दोष नहीं है।",
      te: isKalaSarpa && rahu && ketu
        ? `మీ జాతకంలో రాహువు ${rahu.house}వ స్థానంలో, కేతువు ${ketu.house}వ స్థానంలో ఉండి, సమస్త గ్రహాలు వీరిద్దరి మధ్య బంధీగా ఉన్నందున '${kalaSarpaTypeObj.te}' ఏర్పడింది.`
        : "సప్త గ్రహాలు రాహు-కేతువుల ఇరువైపులా విస్తరించి ఉన్నందున కాలసర్ప దోషం లేదు.",
      ta: isKalaSarpa && rahu && ketu
        ? `ராகு ${rahu.house} ஆம் இடத்திலும் கேது ${ketu.house} ஆம் இடத்திலும் இருந்து, மற்ற 7 கிரகங்களும் இவர்களின் பிடியில் உள்ளதால் '${kalaSarpaTypeObj.ta}' உண்டாகியுள்ளது.`
        : "ஏழு கிரகங்களும் ராகு-கேதுவின் இருபுறமும் பரவி இருப்பதால் காலசர்ப்ப தோஷம் இல்லை.",
      en: isKalaSarpa && rahu && ketu
        ? `All seven classical planets (Sun through Saturn) are hemmed between the serpentine axis of Rahu (${rahu.house}th house, ${formatDegMin(rahu.degree)}) and Ketu (${ketu.house}th house, ${formatDegMin(ketu.degree)}). As Rahu occupies house ${rahu.house}, this classical formation is classified as '${kalaSarpaTypeObj.en}'.`
        : "The natal planets span both sides of the lunar nodal axis; no Kala Sarpa confinement exists."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ವೃತ್ತಿ ಮತ್ತು ವ್ಯಾಪಾರದಲ್ಲಿ ತೀವ್ರ ಏರಿಳಿತಗಳು, ಅಪಾರ ಶ್ರಮಪಟ್ಟರೂ ಅಂತಿಮ ಫಲಿತಾಂಶದ ಸಮಯದಲ್ಲಿ ಅದೃಷ್ಟ ಕೈಕೊಡುವುದು, ಆಪ್ತ ಸ್ನೇಹಿತರಿಂದಲೇ ದ್ರೋಹ ಅಥವಾ ನಂಬಿಕೆ ದ್ರೋಹದ ಅನುಭವ ಹಾಗೂ ರಾತ್ರಿಯ ನಿದ್ರೆಯಲ್ಲಿ ಅಶಾಂತಿ ಮತ್ತು ಅನಿಶ್ಚಿತ ಭವಿಷ್ಯದ ಭಯ ಕಾಡುತ್ತಿದೆ.",
      hi: "वर्तमान समय में आजीविका और व्यापार में अनपेक्षित उतार-चढ़ाव, अंतिम समय में बनते हुए कार्यों का बिगड़ना, निकट संबंधियों से विश्वासघात का अनुभव तथा रात्रि में अनिद्रा व अज्ञात भय की समस्याएं आपको परेशान कर रही हैं।",
      te: "ప్రస్తుతం వ్యాపారం మరియు ఉద్యోగంలో తీవ్ర ఒడిదుడుకులు, ఎంత కష్టపడినా చివరి క్షణంలో ఫలితం తప్పుకోవడం, సన్నిహితుల నుండి మోసం మరియు రాత్రి వేళల్లో ఆందోళన నిద్రలేమి సమస్యలు ఎదురవుతున్నాయి.",
      ta: "தற்போது தொழில் மற்றும் வியாபாரத்தில் தீவிர ஏற்ற இறக்கங்கள், இறுதி நேரத்தில் கைநழுவிப் போகும் வாய்ப்புகள், நம்பிக்கைக்குரியவர்களால் ஏமாற்றம் மற்றும் தூக்கமின்மை போன்ற பிரச்சனைகள் ஏற்படுகின்றன.",
      en: "Currently navigating acute occupational turbulence, sudden reverses where promising outcomes slip at the last moment, betrayal from close associates, and restless nights burdened by existential anxiety."
    },
    dashaResonance: buildDashaResonance([PN.Rahu, PN.Ketu], "ಕಾಳಸರ್ಪ ದೋಷ"),
    lifeImpact: {
      kn: isKalaSarpa
        ? `ಕಾಳಸರ್ಪ ದೋಷದ ಮುಖ್ಯ ಪ್ರಭಾವವೆಂದರೆ ಜೀವನದಲ್ಲಿ ಏರಿಳಿತಗಳು ತೀವ್ರವಾಗಿರುತ್ತವೆ. ೩೨ ಅಥವಾ ೩೫ ವರ್ಷಗಳ ವರೆಗೆ ಅತಿಯಾದ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗದೆ ತಡವಾಗಬಹುದು. ಆದರೆ ಈ ದೋಷವಿರುವ ವ್ಯಕ್ತಿಗಳು ದೃಢ ನಿರ್ಧಾರ, ಅಪ್ರತಿಮ ತಾಳ್ಮೆ ಹಾಗೂ ಅಡೆತಡೆಗಳ ನಂತರ ಅಸಾಧಾರಣ ಸಾಮಾಜಿಕ ಎತ್ತರಕ್ಕೆ ಬೆಳೆಯುವ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿರುತ್ತಾರೆ.

ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ಅನಗತ್ಯ ಊಹಾಪೋಹಗಳಿಗೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಗೆ ಮರುಳಾಗದೆ, ನೇರ ನಿಷ್ಠೆಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದು ಯಶಸ್ಸನ್ನು ತಂದುಕೊಡುತ್ತದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಾಳಸರ್ಪ ಶಾಂತಿ ಮಾಡಿಸುವುದರಿಂದ ಸರ್ಪದೋಷ ನಿವಾರಣೆಯಾಗಿ, ಸ್ಥಿರ ಸಂಪತ್ತು ಮತ್ತು ಶಾಶ್ವತ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.`
        : "ಜೀವನದ ಪಯಣವು ಸಹಜ ಸಮತೋಲನದಿಂದ ಕೂಡಿದ್ದು, ಯಾವುದೇ ಸರ್ಪದೋಷದ ಬಂಧನವಿಲ್ಲ.",
      hi: isKalaSarpa
        ? `कालसर्प दोष जीवन में प्रारंभिक संघर्ष, अचानक उतार-चढ़ाव और 32-35 वर्ष की आयु तक कठिन परिश्रम कराता है, परंतु इसके पश्चात जातक को असाधारण सफलता और प्रतिष्ठा प्रदान करता है।

नियमित शिव उपासना और कालसर्प शांति से जीवन के सभी अवरोध समाप्त हो जाते हैं।`
        : "जीवन संतुलित और निर्बाध प्रगतिशील रहेगा।",
      te: isKalaSarpa
        ? `ఈ దోషం వలన జీవిత ప్రారంభంలో తీవ్ర సంఘర్షణలు ఉంటాయి. 33 సంవత్సరాల తర్వాత అద్భుతమైన ఉన్నతి లభిస్తుంది.`
        : "జీవిత గమనం సంతులనంగా ఉండి, ఎలాంటి సర్పాక్షిక బంధనాలు లేవు.",
      ta: isKalaSarpa
        ? `துவக்க காலத்தில் போராட்டங்களும் தடைகளும் இருந்தாலும், கடின உழைப்பிற்குப் பின் மாபெரும் வெற்றி கிடைக்கும்.`
        : "வாழ்க்கைப் பயணம் எவ்வித சர்ப்ப தடைகளும் இன்றி சுபமாக அமையும்.",
      en: isKalaSarpa
        ? `Kala Sarpa Yoga imposes non-linear life development—demanding extraordinary tenacity through initial decades where rewards frequently lag behind labor. However, once mastered, it confers formidable resilience, unconventional breakthroughs, and eventual distinction.

Propitiating Lord Shiva via formal Kala Sarpa Shanti harmonizes the nodal axis, converting restrictive karmic drag into catalytic executive power.`
        : "Planetary balance ensures unhampered progression without nodal drag."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ 'ಕಾಳಸರ್ಪ ದೋಷ ನಿವಾರಣಾ ಶಾಂತಿ' & 'ಮಹಾ ರುದ್ರಾಭಿಷೇಕ'",
      hi: "गोकर्ण अथवा त्र्यंबकेश्वर में 'कालसर्प दोष निवारण शांति एवं महा रुद्राभिषेक'",
      te: "గోకర్ణ క్షేత్రంలో 'కాలసర్ప దోష నివారణా శాంతి' మరియు 'మహా రుద్రాభిషేకం'",
      ta: "கோகர்ணம் அல்லது திருக்காளஹஸ்தியில் 'காலசர்ப்ப தோஷ சாந்தி பூஜை'",
      en: "Kala Sarpa Shanti Maha Homa & Consecrated Rudrabhishekam at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಸೋಮವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ ೧೦೮ ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.",
        "ನಾಗಪಂಚಮಿಯಂದು ಅಥವಾ ಸೋಮವಾರ ನಾಗದೇವರಿಗೆ ಹಾಲಿನ ತರ್ಪಣ ನೀಡಿ.",
        "ಬೆಳ್ಳಿಯ ನಾಗಪ್ರತಿಮೆಯನ್ನು ಪೂಜಿಸಿ ಶಿವಾರ್ಪಣ ಮಾಡಿ."
      ],
      hi: [
        "प्रति सोमवार शिवलिंग पर कच्चा दूध एवं जल अर्पित कर महामृत्युंजय का जप करें।",
        "नाग गायत्री मंत्र का नित्य 21 बार जप करें।",
        "चांदी के नाग-नागिन का जोड़ा जल में प्रवाहित करें।"
      ],
      te: [
        "ప్రతి సోమవారం శివునికి పాలాభిషేకం చేయండి.",
        "రోజూ నాగ గాయత్రి లేదా ఓం నమః శివాయ జపించండి."
      ],
      ta: [
        "திங்கட்கிழமை தோறும் சிவபெருமானுக்கு பாலாபிஷேகம் செய்யவும்.",
        "ஓம் நம சிவாய மந்திரத்தை தினமும் 108 முறை ஜபிக்கவும்."
      ],
      en: [
        "Perform raw milk abhishekam on Shivalinga every Monday while chanting Om Namah Shivaya.",
        "Chant the Naga Gayatri Mantra daily 21 times.",
        "Avoid leather accessories and practice ahimsa in speech and action."
      ]
    }
  });

  // ==========================================================================
  // 4. GURU CHANDALA DOSHA (ಗುರು ಚಂಡಾಲ ದೋಷ)
  // ==========================================================================
  const jupiterPlanet = jupiter;
  const isGuruChandal = jupiterPlanet && rahu && jupiterPlanet.house === rahu.house;
  const guruChandalDist = jupiterPlanet && rahu ? Math.abs(jupiterPlanet.degree - rahu.degree) : 30;
  const isGuruChandalTight = isGuruChandal && guruChandalDist <= 10.0;

  doshasList.push({
    id: "guru_chandala",
    name: {
      kn: "ಗುರು ಚಂಡಾಲ ದೋಷ (Guru Chandala)",
      hi: "गुरु चांडाल दोष (Guru Chandala)",
      te: "గురు చండాల దోషం (Guru Chandala)",
      ta: "குரு சண்டாள தோஷம் (Guru Chandala)",
      en: "Guru Chandala Dosha (Jupiter-Rahu Affliction)"
    },
    category: "natal",
    isDetected: !!isGuruChandal,
    severity: isGuruChandal ? (isGuruChandalTight ? "critical" : "high") : "none",
    statusBadge: {
      kn: isGuruChandal ? (isGuruChandalTight ? "ತೀವ್ರ ಗುರು-ರಾಹು ಯುತಿ" : "ಗುರು ಚಂಡಾಲ ಯೋಗ") : "ಶುಭ ಗುರು",
      hi: isGuruChandal ? "गुरु-राहु युति सक्रिय" : "शुभ गुरु",
      te: isGuruChandal ? "గురు చండాల దోషం ఉంది" : "శుభ గురుడు",
      ta: isGuruChandal ? "குரு சண்டாள தோஷம் உள்ளது" : "சுப குரு",
      en: isGuruChandal ? (isGuruChandalTight ? "TIGHT GURU-RAHU CONJUNCTION" : "GURU CHANDALA ACTIVE") : "BENEFIC JUPITER"
    },
    technicalDetail: {
      houseNumbers: jupiterPlanet ? [jupiterPlanet.house] : [],
      grahasInvolved: [PlanetName.Jupiter, PlanetName.Rahu],
      grahaDegrees: [
        ...(jupiterPlanet ? [{ name: "Jupiter", rashi: RASHI_NAMES_EN[jupiterPlanet.rashi.index], degreeFormatted: formatDegMin(jupiterPlanet.degree) }] : []),
        ...(rahu ? [{ name: "Rahu", rashi: RASHI_NAMES_EN[rahu.rashi.index], degreeFormatted: formatDegMin(rahu.degree) }] : [])
      ],
      scripturalReference: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಯೋಗಾಧ್ಯಾಯ (BPHS, Yogadhyaya)",
      hasBhangaOrMitigation: !isGuruChandalTight && guruChandalDist > 12.0,
      bhangaDescription: {
        kn: guruChandalDist > 12.0 ? "ಗುರು ಮತ್ತು ರಾಹುವಿನ ನಡುವೆ ೧೨ ಡಿಗ್ರಿಗಿಂತ ಹೆಚ್ಚು ಅಂತರವಿರುವುದರಿಂದ ದೋಷದ ತೀವ್ರತೆ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗಿದೆ." : "ಯಾವುದೇ ರದ್ದತಿಯಿಲ್ಲ.",
        en: guruChandalDist > 12.0 ? "Planetary orb exceeds 12 degrees, muting malefic shadow contagion." : "Tight orb; unmitigated."
      }
    },
    technicalWhy: {
      kn: isGuruChandal && jupiterPlanet && rahu
        ? `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ (${formatDegMin(jupiterPlanet.degree)}) ಹಾಗೂ ಛಾಯಾಗ್ರಹ ರಾಹು (${formatDegMin(rahu.degree)}) ಇಬ್ಬರೂ ${jupiterPlanet.house}ನೇ ಮನೆಯಾದ ${RASHI_NAMES_KN[jupiterPlanet.rashi.index]} ರಾಶಿಯಲ್ಲಿ ${guruChandalDist.toFixed(1)}° ಅಂತರದ ಅತಿಸಮೀಪ ಯುತಿ ಹೊಂದಿದ್ದಾರೆ. ಗುರುವು ಧರ್ಮ, ಜ್ಞಾನ, ನೀತಿ ಮತ್ತು ಸದ್ಬುದ್ಧಿಯ ಕಾರಕನಾಗಿದ್ದು, ರಾಹುವು ಭ್ರಮೆ, ಅಸಾಂಪ್ರದಾಯಿಕತೆ ಹಾಗೂ ಆತುರದ ಕಾರಕನಾಗಿದ್ದಾನೆ. ಈ ಸಂಯೋಗವು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ 'ಗುರು ಚಂಡಾಲ ದೋಷ'ವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಮತ್ತು ರಾಹು ಪ್ರತ್ಯೇಕ ರಾಶಿಗಳಲ್ಲಿದ್ದು ಯಾವುದೇ ಗುರುಚಂಡಾಲ ದೋಷ ಉಂಟಾಗಿರುವುದಿಲ್ಲ.",
      hi: isGuruChandal && jupiterPlanet && rahu
        ? `देवगुरु बृहस्पति एवं राहु दोनों ${jupiterPlanet.house}वें भाव (${RASHI_NAMES_EN[jupiterPlanet.rashi.index]}) में मात्र ${guruChandalDist.toFixed(1)}° के अंतर पर युति कर रहे हैं, जिससे गुरु चांडाल योग का निर्माण होता है।`
        : "गुरु और राहु का कोई अशुभ युति संबंध नहीं है।",
      te: isGuruChandal && jupiterPlanet && rahu
        ? `మీ జాతకంలో గురుడు మరియు రాహువు ${jupiterPlanet.house}వ స్థానంలో కలసి స్థితి చెందడం వల్ల గురు చండాల దోషం ఏర్పడింది.`
        : "జాతకంలో గురుడు మరియు రాహువు వేర్వేరు రాశులలో ఉండి గురు చండాల దోషం లేదు.",
      ta: isGuruChandal && jupiterPlanet && rahu
        ? `குருவும் ராகுவும் ${jupiterPlanet.house} ஆம் வீட்டில் இணைந்து சஞ்சரிப்பதால் குரு சண்டாள தோஷம் உண்டாகியுள்ளது.`
        : "ஜாதகத்தில் குருவும் ராகுவும் தனித்தனி ராசிகளில் உள்ளதால் குரு சண்டாள தோஷம் இல்லை.",
      en: isGuruChandal && jupiterPlanet && rahu
        ? `Jupiter (${formatDegMin(jupiterPlanet.degree)}) and Rahu (${formatDegMin(rahu.degree)}) are co-present in the ${jupiterPlanet.house}th house (${RASHI_NAMES_EN[jupiterPlanet.rashi.index]}) within a close ${guruChandalDist.toFixed(1)}° orb. While Jupiter presides over higher ethical wisdom, Rahu introduces rebellious unorthodox momentum, establishing classical Guru Chandala Dosha.`
        : "Jupiter and Rahu occupy distinct signs without afflictive conjunction. No Guru Chandala Dosha is present."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ತಪ್ಪು ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಪ್ರಲೋಭನೆ, ಶಾರ್ಟ್‌ಕಟ್ ಅಥವಾ ಷೇರು/ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಹಣ ಕಳೆದುಕೊಳ್ಳುವ ಭೀತಿ, ಧಾರ್ಮಿಕ ಮತ್ತು ನೈತಿಕ ವಿಚಾರಗಳಲ್ಲಿ ಗೊಂದಲ ಹಾಗೂ ಹಿರಿಯರ ಉತ್ತಮ ಸಲಹೆಗಳನ್ನು ಕಡೆಗಣಿಸುವುದರಿಂದ ಗೌರವಕ್ಕೆ ಧಕ್ಕೆ ಬರುವ ಸನ್ನಿವೇಶಗಳು ಉಂಟಾಗುತ್ತಿವೆ.",
      hi: "वर्तमान में वित्तीय निर्णयों में भटकाव, सट्टेबाजी अथवा जोखिम भरे निवेश में हानि की आशंका, आध्यात्मिक मान्यताओं में संशय तथा वरिष्ठों की नेक सलाह की अनदेखी से प्रतिष्ठा पर आंच आने की स्थिति बन रही है।",
      te: "ప్రస్తుతం నిర్ణయాలలో అయోమయం, రిస్క్ లేదా తప్పుడు పెట్టుబడుల వలన ఆర్థిక నష్ట భయం, పెద్దల సలహాలను పట్టించుకోకపోవడం వల్ల సమాజంలో అపకీర్తి వచ్చే పరిస్థితులు తలెత్తుతున్నాయి.",
      ta: "தற்போது தவறான முடிவுகளை எடுக்கும் மன உந்துதல், அவசர முதலீடுகளில் நஷ்டம் ஏற்படும் அச்சம், பெரியோர்களின் நல்லுரைகளைப் புறக்கணிப்பதால் கௌரவக் குறைவு போன்ற பிரச்சனைகள் ஏற்படுகின்றன.",
      en: "Currently encountering reckless decision-making impulses, vulnerability to fraudulent or speculative financial schemes, skepticism toward ethical counsel, and public misjudgments that risk reputation."
    },
    dashaResonance: buildDashaResonance([PN.Jupiter, PN.Rahu], "ಗುರು ಚಂಡಾಲ ದೋಷ"),
    lifeImpact: {
      kn: isGuruChandal
        ? `ಈ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಧಾರ್ಮಿಕ ಆಚರಣೆಗಳಲ್ಲಿ ಅಥವಾ ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಅಪನಂಬಿಕೆ ಮೂಡುವುದು, ತಪ್ಪು ಹೂಡಿಕೆಗಳಿಗೆ ಆಕರ್ಷಿತರಾಗುವುದು ಹಾಗೂ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಲ್ಲಿ ದ್ವಂದ್ವ ಮನಸ್ಥಿತಿ ಉಂಟಾಗಬಹುದು. ಶೀಘ್ರವಾಗಿ ಲಾಭ ಪಡೆಯುವ ಪ್ರಲೋಭನೆಗೆ ಒಳಗಾಗುವ ಅಪಾಯವಿರುತ್ತದೆ.

ಗುರು ಚರಿತ್ರೆ ಪಠಿಸುವುದು, ಗುರು-ಹಿರಿಯರನ್ನು ಗೌರವಿಸುವುದು ಹಾಗೂ ದೈವಜ್ಞರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಪ್ರಮುಖ ಒಪ್ಪಂದಗಳನ್ನು ಮಾಡಿಕೊಳ್ಳುವುದರಿಂದ ರಾಹುವಿನ ಭ್ರಮೆ ಕರಗಿ, ಗುರುವಿನ ನೈಜ ಜ್ಞಾನ ಮತ್ತು ವಿವೇಕವು ಜಾಗೃತಗೊಳ್ಳಲಿದೆ.`
        : "ಬುದ್ಧಿ ಮತ್ತು ವಿವೇಕವು ದೈವಿಕ ಸ್ಪಷ್ಟತೆಯಿಂದ ಕೂಡಿದೆ.",
      hi: isGuruChandal
        ? `यह योग कभी-कभी निर्णयों में भ्रम, वरिष्ठों की सलाह की अनदेखी अथवा वित्तीय मामलों में अति-उत्साह उत्पन्न कर सकता है।

गुरु मंत्र का जप, शिक्षकों का सम्मान और सात्विक आहार से बुद्धि में शुद्धि और स्थिरता आती है।`
        : "विवेक और निर्णय क्षमता पूर्णतः संतुलित है।",
      te: isGuruChandal
        ? `ఈ ప్రభావం వలన నిర్ణయాలలో తికమక కలగడం లేదా అనుభవజ్ఞుల సలహాలు పట్టించుకోకపోవడం జరగవచ్చు. గురు ఆరాధన శ్రేయస్కరం.`
        : "సద్బుద్ధి, వివేకం మరియు ఆధ్యాత్మిక దృక్పథం స్థిరంగా కొనసాగుతాయి.",
      ta: isGuruChandal
        ? `பெரியோர்களின் ஆலோசனைகளைப் புறக்கணிக்கும் மனநிலை வரலாம். குரு வழிபாடு மன அமைதியைத் தரும்.`
        : "ஞானமும், நேர்மையான சிந்தனையும் வாழ்வை நல்வழிப்படுத்தும்.",
      en: isGuruChandal
        ? `Guru Chandala manifests as philosophical skepticism, occasional friction with orthodox mentors, or vulnerability to high-risk speculative schemes driven by impatience.

Honoring seasoned preceptors, chanting Brihaspati mantras, and conducting rigorous due diligence before executing major contracts neutralizes the shadow energy, unlocking brilliant innovation.`
        : "Mental clarity and ethical judgment operate with unimpeded lucidity."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ 'ಗುರು ಚಂಡಾಲ ನಿವಾರಣಾ ಶಾಂತಿ' & 'ಬೃಹಸ್ಪತಿ ಮಹಾ ಹವನ'",
      hi: "गोकर्ण अथवा हरिद्वार में 'गुरु चांडाल दोष निवारण शांति एवं बृहस्पति हवन'",
      te: "గోకర్ణంలో 'గురు చండాల దోష నివారణ శాంతి'",
      ta: "கோகர்ணத்தில் 'குரு சண்டாள தோஷ சாந்தி பூஜை'",
      en: "Sri Brihaspati Shanti Homa & Guru-Rahu Dosha Nivarana at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಗುರುವಾರ ದೇವಗುರು ಬೃಹಸ್ಪತಿಗೆ ಕಡಲೆಬೇಳೆ ಸಮರ್ಪಿಸಿ ಹಳದಿ ವಸ್ತ್ರ ದಾನ ಮಾಡಿ.",
        "ಗುರು ಚರಿತ್ರೆ ಅಥವಾ ಗುರು ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ನಿತ್ಯ ಪಠಿಸಿ.",
        "ದೇವಸ್ಥಾನದಲ್ಲಿ ಹಳದಿ ಪುಷ್ಪಗಳನ್ನು ಅರ್ಪಿಸಿ ಗುರು ಹಿರಿಯರಿಗೆ ನಮಸ್ಕರಿಸಿ."
      ],
      hi: [
        "गुरुवार को चने की दाल और पीले वस्त्रों का दान करें।",
        "गुरु मंत्र 'ॐ बृं बृहस्पतये नमः' का 108 बार जप करें।",
        "शिक्षकों एवं विद्वानों का आदर करें।"
      ],
      te: [
        "గురువారం పసుపు వస్త్రాలు, శనగలు దానం చేయండి.",
        "గురు స్తోత్రం లేదా గురు గాయత్రి జపించండి."
      ],
      ta: [
        "வியாழக்கிழமைகளில் கொண்டைக்கடலை மாலை சாற்றி குருவை வழிபடவும்.",
        "குரு காயத்ரி மந்திரம் தினமும் படிக்கவும்."
      ],
      en: [
        "Offer yellow flowers, turmeric, and Bengal gram to Lord Dakshinamurthy / Brihaspati on Thursdays.",
        "Chant the Guru Gayatri Mantra or 'Om Brim Brihaspataye Namah' 108 times daily.",
        "Honor senior preceptors and maintain uncompromising integrity in financial dealings."
      ]
    }
  });

  // ==========================================================================
  // 5. BALARISHTA DOSHA (ಬಾಲಾರಿಷ್ಟ ದೋಷ)
  // ==========================================================================
  const balarishtaReasonsKn: string[] = [];
  const balarishtaReasonsEn: string[] = [];
  const balarishtaHouses: number[] = [];

  if (moon && [6, 8, 12].includes(moon.house)) {
    balarishtaHouses.push(moon.house);
    balarishtaReasonsKn.push(`ಮನಃಕಾರಕ ಚಂದ್ರನು ದುಸ್ಥಾನವಾದ ${moon.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`);
    balarishtaReasonsEn.push(`Moon occupies Dusthana house ${moon.house}.`);
  }

  if (lagnaLord && [6, 8, 12].includes(lagnaLord.house)) {
    balarishtaHouses.push(lagnaLord.house);
    balarishtaReasonsKn.push(`ದೇಹಕಾರಕ ಲಗ್ನಾಧಿಪತಿ ${lagnaLord.name} ದುಸ್ಥಾನವಾದ ${lagnaLord.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`);
    balarishtaReasonsEn.push(`Lagna lord ${lagnaLord.name} resides in Dusthana house ${lagnaLord.house}.`);
  }

  const isBalarishta = balarishtaReasonsKn.length > 0;
  // Balarishta Bhanga: Jupiter in Kendra (1, 4, 7, 10) cancels Balarishta!
  const hasBalarishtaBhanga = jupiter !== undefined && [1, 4, 7, 10].includes(jupiter.house);
  const balarishtaSeverity: DoshaSeverity = isBalarishta ? (hasBalarishtaBhanga ? "mild" : "high") : "none";

  doshasList.push({
    id: "balarishta",
    name: {
      kn: "ಬಾಲಾರಿಷ್ಟ ದೋಷ (Balarishta Dosha)",
      hi: "बालारिष्ट दोष (Balarishta Dosha)",
      te: "బాలారిష్ట దోషం (Balarishta)",
      ta: "பாலாரிஷ்ட தோஷம் (Balarishta)",
      en: "Balarishta Dosha (Vitality & Constitutional Sensitivity)"
    },
    category: "natal",
    isDetected: isBalarishta,
    severity: balarishtaSeverity,
    statusBadge: {
      kn: isBalarishta ? (hasBalarishtaBhanga ? "ಬಾಲಾರಿಷ್ಟ ಭಂಗ (ರಕ್ಷಿತ)" : "ಬಾಲಾರಿಷ್ಟ ಯೋಗ") : "ದೀರ್ಘಾಯುಷ್ಯ ಯೋಗ",
      hi: isBalarishta ? (hasBalarishtaBhanga ? "बालारिष्ट भंग योग" : "बालारिष्ट प्रभाव") : "दीर्घायु योग",
      te: isBalarishta ? "బాలారిష్ట దోషం" : "ఆయుష్షు బలం",
      ta: isBalarishta ? "பாலாரிஷ்ட தோஷம்" : "தோஷமில்லை",
      en: isBalarishta ? (hasBalarishtaBhanga ? "BALARISHTA BHANGA (PROTECTED)" : "ACTIVE BALARISHTA") : "VITAL CONSTITUTION"
    },
    technicalDetail: {
      houseNumbers: Array.from(new Set(balarishtaHouses)),
      grahasInvolved: [PlanetName.Moon, ...(lagnaLord ? [lagnaLord.name] : [])],
      scripturalReference: "ಫಲದೀಪಿಕಾ, ಬಾಲಾರಿಷ್ಟಾಧ್ಯಾಯ (Phaladeepika, Balarishta Adhyaya)",
      hasBhangaOrMitigation: hasBalarishtaBhanga,
      bhangaDescription: {
        kn: hasBalarishtaBhanga
          ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಬಾಲಾರಿಷ್ಟ ಭಂಗವಾಗಿ ಆಯುಷ್ಯ ರಕ್ಷಣೆ ಲಭಿಸಿದೆ."
          : "ಯಾವುದೇ ಭಂಗವಿಲ್ಲದೆ ದೈಹಿಕ ಸೂಕ್ಷ್ಮತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        en: hasBalarishtaBhanga
          ? "Jupiter situated in Kendra constitutes sovereign Balarishta Bhanga, bestowing vitality."
          : "Unaided Moon requires Mahamrityunjaya protection."
      }
    },
    technicalWhy: {
      kn: isBalarishta
        ? `ಖಗೋಳ ಕಾರಣ: ${balarishtaReasonsKn.join(" ")} ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ ಲಗ್ನ ಅಥವಾ ಚಂದ್ರನಿಗೆ ೬, ೮, ೧೨ನೇ ಮನೆಗಳ ಸಂಬಂಧವು ಶೈಶವಾವಸ್ಥೆಯಲ್ಲಿ ಶೀತ, ಜ್ವರ ಅಥವಾ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಏರುಪೇರನ್ನು ತರಬಹುದು.${hasBalarishtaBhanga ? " ಆದರೆ ಗುರುವು ಕೇಂದ್ರದಲ್ಲಿದ್ದು ಈ ದೋಷವನ್ನು ಪರಿಪೂರ್ಣವಾಗಿ ಭಂಗಗೊಳಿಸಿ ಆಯುರ್ಬಲ ಕರುಣಿಸಿದ್ದಾನೆ." : ""}`
        : "ಚಂದ್ರ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿ ಬಲಿಷ್ಠ ಕೇಂದ್ರ-ತ್ರಿಕೋಣಗಳಲ್ಲಿದ್ದು ಯಾವುದೇ ಬಾಲಾರಿಷ್ಟ ದೋಷವಿಲ್ಲ.",
      hi: isBalarishta
        ? `खगोलीय कारण: ${balarishtaReasonsEn.join(" ")} चंद्र अथवा लग्नेश की त्रिक स्थिति प्रारंभिक स्वास्थ्य संवेदनशीलता दर्शाती है।${hasBalarishtaBhanga ? " केंद्र में गुरु की उपस्थिति से बालारिष्ट भंग योग का निर्माण हुआ है।" : ""}`
        : "चंद्र और लग्नेश पूर्णतः सुरक्षित हैं। बालारिष्ट दोष नहीं है।",
      te: isBalarishta
        ? `చంద్రుడు లేదా లగ్నాధిపతి బలహీన స్థానాలలో ఉండటం బాలారిష్టాన్ని సూచిస్తోంది.${hasBalarishtaBhanga ? " గురు బలం వల్ల దోష భంగం జరిగింది." : ""}`
        : "చంద్రుడు మరియు లగ్నాధిపతి శుభ స్థానాలలో ఉండి ఎలాంటి బాలారిష్ట దోషం లేదు.",
      ta: isBalarishta
        ? `சந்திரன் அல்லது லக்னாதிபதி மறைவு ஸ்தானங்களில் இருப்பதால் சிறுவயது உடல்நலக் குறைபாடுகள் தோன்றி மறையலாம்.`
        : "சந்திரனும் லக்னாதிபதியும் கேந்திர-திரிகோணங்களில் பலமாக உள்ளதால் பாலாரிஷ்ட தோஷம் இல்லை.",
      en: isBalarishta
        ? `Astronomical indicators: ${balarishtaReasonsEn.join(" ")} Vedic tenets hold that placement of Moon or Lagnesha in Dusthanas indicates early childhood immune vulnerability.${hasBalarishtaBhanga ? " Divine preceptor Jupiter in Kendra fully activates Balarishta Bhanga, guaranteeing constitutional longevity." : ""}`
        : "Ascendant and Moon are vigorously placed in auspicious angles. No Balarishta Dosha present."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಬದಲಾವಣೆಗಳಿಗೆ ದೇಹವು ತ್ವರಿತವಾಗಿ ತುತ್ತಾಗುವುದು, ಶೀತ-ಜ್ವರ ಅಥವಾ ಜೀರ್ಣಾಂಗಗಳ ದೌರ್ಬಲ್ಯ, ಮಾನಸಿಕವಾಗಿ ಬೇಗನೆ ಆಯಾಸಗೊಳ್ಳುವುದು ಹಾಗೂ ದೈಹಿಕ ಶಕ್ತಿ ಕ್ಷೀಣಿಸಿ ರೋಗನಿರೋಧಕ ಸಾಮರ್ಥ್ಯ ಕುಂಠಿತಗೊಳ್ಳುವಂತಹ ತೊಂದರೆಗಳು ದಿನನಿತ್ಯದ ಚಟುವಟಿಕೆಗಳಿಗೆ ಅಡ್ಡಿಯುಂಟುಮಾಡುತ್ತಿವೆ.",
      hi: "वर्तमान समय में मौसम परिवर्तन के साथ शीघ्र बीमार पड़ना, पाचन एवं श्वसन तंत्र की संवेदनशीलता, शीघ्र थकान तथा शारीरिक ऊर्जा की कमी आपके दैनिक कार्यों को प्रभावित कर रही है।",
      te: "ప్రస్తుతం వాతావరణ మార్పులకు సులభంగా జలుబు, జ్వరం రావడం, జీర్ణవ్యవస్థ బలహీనత మరియు త్వరగా అలసిపోవడం వంటి ఆరోగ్య సమస్యలు రోజువారీ పనులకు ఆటంకం కలిగిస్తున్నాయి.",
      ta: "தற்போது பருவநிலை மாற்றங்களால் அடிக்கடி உடல்நலக் கோளாறுகள், செரிமானக் குறைபாடுகள் மற்றும் சீக்கிரம் சோர்வடைதல் போன்ற பிரச்சனைகள் ஏற்படுகின்றன.",
      en: "Currently suffering from heightened somatic vulnerability to seasonal fluctuations, sluggish gastrointestinal resilience, rapid exhaustion, and lowered stamina during demanding work routines."
    },
    dashaResonance: buildDashaResonance([PN.Moon, lagnaLordName], "ಬಾಲಾರಿಷ್ಟ ದೋಷ"),
    lifeImpact: {
      kn: isBalarishta
        ? `ಬಾಲ್ಯದಲ್ಲಿ ಹವಾಮಾನ ಬದಲಾವಣೆಗಳಿಗೆ ತ್ವರಿತವಾಗಿ ತುತ್ತಾಗುವುದು, ಶ್ವಾಸಕೋಶ ಅಥವಾ ಜೀರ್ಣಾಂಗಗಳ ಸೂಕ್ಷ್ಮತೆ ಇರಬಹುದು. ವಯಸ್ಸು ಕಳೆದಂತೆ ಈ ದೋಷವು ಕೇವಲ ದೈಹಿಕ ಸೂಕ್ಷ್ಮತೆಯಾಗಿ ಉಳಿಯುತ್ತದೆ.

ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ ಮತ್ತು ಮೃತ್ಯುಂಜಯ ಜಪ ಮಾಡಿಸುವುದರಿಂದ ಆರೋಗ್ಯವು ಸದಾ ಸುಸ್ಥಿರವಾಗಿರುತ್ತದೆ.`
        : "ಆರೋಗ್ಯ ಮತ್ತು ಆಯುಷ್ಯ ಬಲವು ಅತ್ಯಂತ ಸದೃಢವಾಗಿದೆ.",
      hi: isBalarishta
        ? `बचपन में मौसमी बीमारियों या पाचन संवेदनशीलता का प्रभाव रहा हो सकता है। महामृत्युंजय मंत्र से उत्तम स्वास्थ्य बना रहता है।`
        : "उत्तम स्वास्थ्य एवं दीर्घायु की स्थिति है।",
      te: isBalarishta
        ? `చిన్నతనంలో అనారోగ్య సమస్యలు ఉన్నా, కాలక్రమేణా ఆయుష్షు నిలకడగా ఉంటుంది.`
        : "శరీర దృఢత్వం మరియు దీర్ఘాయుష్షు అనుకూలంగా ఉన్నాయి.",
      ta: isBalarishta
        ? `சிறுவயதில் சளி, காய்ச்சல் போன்ற உபாதைகள் வந்திருக்கலாம். தற்போது நலம்.`
        : "உடல் ஆரோக்கியமும், நோய் எதிர்ப்பு சக்தியும் மற்றும் தீர்க்காயுளும் சிறப்பாய் உள்ளன.",
      en: isBalarishta
        ? `Historically reflects early childhood respiratory or digestive sensitivities. In adult life, this manifests as heightened psychosomatic sensitivity to seasonal shifts.

Cultivating clean Ayurvedic lifestyle habits and Mahamrityunjaya chanting sustains robust vitality.`
        : "Robust longevity and vital immunity."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ 'ಆಯುಷ್ಯ ಹೋಮ' & 'ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ'",
      hi: "गोकर्ण में 'आयुष्य होम एवं महामृत्युंजय जप'",
      te: "గోకర్ణంలో 'ఆయుష్య హోమం మరియు మృత్యుంజయ జపం'",
      ta: "கோகர்ணத்தில் 'ஆயுஷ்ய ஹோமம் மற்றும் ருத்ராபிஷேகம்'",
      en: "Consecrated Ayushya Homa & Mahamrityunjaya Japa at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿದಿನ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ೧೧ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ.",
        "ಪ್ರತಿ ಹುಣ್ಣಿಮೆಯಂದು ಶಿವನಿಗೆ ಜಲಾಭಿಷೇಕ ಮಾಡಿ ಕ್ಷೀರ ನೈವೇದ್ಯ ಅರ್ಪಿಸಿ."
      ],
      hi: [
        "महामृत्युंजय मंत्र का नित्य जप करें।",
        "पूर्णिमा के दिन भगवान शिव का जलाभिषेक करें।"
      ],
      te: [
        "మహా మృత్యుంజయ మంత్రం చదవండి.",
        "శివునికి అభిషేకం చేయించండి."
      ],
      ta: [
        "மகா மிருத்யுஞ்ஜய மந்திரம் தினமும் ஜபிக்கவும்.",
        "சிவபெருமானுக்கு பால் அபிஷேகம் செய்யவும்."
      ],
      en: [
        "Chant the Mahamrityunjaya Mantra daily 108 times.",
        "Perform sacred water abhishekam on Shivalinga on Full Moon days."
      ]
    }
  });

  // ==========================================================================
  // 6. BALYAGRAHA DOSHA (ಬಾಲ್ಯಗ್ರಹ ದೋಷ)
  // ==========================================================================
  const isBalyagraha =
    (mercury && rahu && mercury.house === rahu.house && [6, 8, 12].includes(mercury.house)) ||
    (moon && ketu && moon.house === ketu.house && [6, 8, 12].includes(moon.house));

  doshasList.push({
    id: "balyagraha",
    name: {
      kn: "ಬಾಲ್ಯಗ್ರಹ ದೋಷ (Balyagraha Dosha)",
      hi: "बाल्यग्रह पीड़ा (Balyagraha Dosha)",
      te: "బాల్యగ్రహ దోషం (Balyagraha)",
      ta: "பால்யக் கிரக தோஷம் (Balyagraha)",
      en: "Balyagraha Dosha (Nervous & Psychosomatic Vulnerability)"
    },
    category: "natal",
    isDetected: !!isBalyagraha,
    severity: isBalyagraha ? "moderate" : "none",
    statusBadge: {
      kn: isBalyagraha ? "ಸಕ್ರಿಯ ಬಾಲ್ಯಗ್ರಹ ಬಾಧೆ" : "ಸ್ಥಿರ ಮನೋಬಲ",
      hi: isBalyagraha ? "बाल्यग्रह पीड़ा सक्रिय" : "मानसिक स्थिरता",
      te: isBalyagraha ? "దోషం ఉంది" : "దోష రహితం",
      ta: isBalyagraha ? "தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isBalyagraha ? "PSYCHOSOMATIC VULNERABILITY" : "UNAFFLICTED"
    },
    technicalDetail: {
      houseNumbers: isBalyagraha ? [mercury?.house || moon?.house || 6] : [],
      grahasInvolved: ["Mercury", "Moon", "Rahu", "Ketu"],
      scripturalReference: "ಸುಶ್ರುತ ಸಂಹಿತಾ & ಆಯುರ್ವೇದ ಜ್ಯೋತಿಷ (Sushruta Samhita & Ayurvedic Jyotisha)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ಬುಧ ಮತ್ತು ಚಂದ್ರರ ಬಲವರ್ಧನೆಯೇ ನಿವಾರಣೆಯಾಗಿದೆ.",
        en: "Requires neurological grounding and Mercury-Moon strengthening."
      }
    },
    technicalWhy: {
      kn: isBalyagraha
        ? "ಬುಧ ಅಥವಾ ಚಂದ್ರ ಗ್ರಹವು ಛಾಯಾಗ್ರಹಗಳಾದ ರಾಹು-ಕೇತುಗಳೊಂದಿಗೆ ದುಸ್ಥಾನದಲ್ಲಿ ಯುತಿ ಹೊಂದಿದ್ದು, ಬಾಲ್ಯದಲ್ಲಿ ನರಮಂಡಲ ಅಥವಾ ಭಯದ ಭಾವನೆಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತದೆ."
        : "ಬುಧ ಮತ್ತು ಚಂದ್ರರು ನಿರ್ಮಲವಾಗಿದ್ದು ಬಾಲ್ಯಗ್ರಹ ದೋಷವಿಲ್ಲ.",
      hi: isBalyagraha
        ? "बुध या चंद्र पर छायाग्रहों का प्रभाव बाल्यकाल में घबराहट या संवेदनशीलता उत्पन्न करता है।"
        : "बुध और चंद्र शुभ हैं।",
      te: isBalyagraha
        ? "బుధుడు లేదా చంద్రునిపై రాహు-కేతువుల ప్రభావం బాల్యగ్రహ దోషాన్ని సూచిస్తోంది."
        : "బుధుడు మరియు చంద్రుడు నిర్మలంగా ఉండి ఎలాంటి బాల్యగ్రహ దోషం లేదు.",
      ta: isBalyagraha
        ? "புதன் அல்லது சந்திரன் நிழல் கிரகங்களால் பாதிக்கப்பட்டுள்ளது."
        : "புதனும் சந்திரனும் சுப ஸ்தானங்களில் உள்ளதால் பால்யக் கிரக தோஷம் இல்லை.",
      en: isBalyagraha
        ? "Affliction of cognitive Mercury or emotive Moon by lunar nodes in Dusthanas induces psychosomatic sensitivity."
        : "Mercury and Moon are clear of nodal afflictions. No Balyagraha Dosha."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮಲ್ಲಿ ಅತಿಯಾದ ನರಗಳ ಸೂಕ್ಷ್ಮತೆ, ಸಣ್ಣಪುಟ್ಟ ವಿಚಾರಗಳಿಗೂ ಹಠಾತ್ ಎದೆಬಡಿತ ಅಥವಾ ಅಂಜಿಕೆ, ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ಮನಸ್ಸಿನಲ್ಲಿ ಅಕಾರಣ ದುಗುಡ ಉಂಟಾಗುತ್ತಿದ್ದು, ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವಾಗ ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ ಕಾಡುತ್ತಿದೆ.",
      hi: "वर्तमान में तंत्रिका तंत्र की अत्यधिक संवेदनशीलता, छोटी बातों पर घबराहट या भय, अनिद्रा तथा मानसिक बेचैनी के कारण महत्वपूर्ण निर्णय लेते समय आत्मविश्वास की कमी महसूस हो रही है।",
      te: "ప్రస్తుతం విపరీతమైన ఆందోళన, చిన్న విషయాలకే భయం, సరిగ్గా నిద్రపట్టకపోవడం మరియు నిర్ణయాలు తీసుకునే సమయంలో ఆత్మవిశ్వాస లోపం వంటి సమస్యలు ఎదురవుతున్నాయి.",
      ta: "தற்போது நரம்புத் தளர்ச்சி போன்ற உணர்வு, சிறு விஷயங்களுக்கும் படபடப்பு, தூக்கமின்மை மற்றும் முடிவெடுக்கும் போது தன்னம்பிக்கைக் குறைவு போன்ற பிரச்சனைகள் நிலவுகின்றன.",
      en: "Currently manifesting as nervous oversensitivity, palpitations or anticipatory panic before unfamiliar challenges, sleep latency, and wavering self-conviction under administrative scrutiny."
    },
    dashaResonance: buildDashaResonance([PN.Mercury, PN.Moon, PN.Rahu], "ಬಾಲ್ಯಗ್ರಹ ದೋಷ"),
    lifeImpact: {
      kn: isBalyagraha
        ? "ಚಿಕ್ಕ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾದ ಆತಂಕ ಅಥವಾ ನಿದ್ರಾಹೀನತೆಯ ಭಾವನೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಸುದರ್ಶನ ಹೋಮದಿಂದ ಶಾಂತಿ ದೊರೆಯುತ್ತದೆ."
        : "ಮನಸ್ಸು ಶಾಂತ ಮತ್ತು ಸ್ಥಿರವಾಗಿದೆ.",
      hi: isBalyagraha
        ? "अनावश्यक चिंता या अनिद्रा की समस्या हो सकती है। सुदर्शन हवन से मानसिक शांति मिलती है।"
        : "मानसिक स्थिरता बनी रहेगी।",
      te: isBalyagraha
        ? "అనవసర భయాలు తగ్గడానికి సుదర్శన పూజ మంచిది."
        : "మనస్సు ప్రశాంతంగా, ధైర్యంగా మరియు ఉత్సాహంగా ఉంటుంది.",
      ta: isBalyagraha
        ? "சுதர்சன ஹோமம் செய்வது மன அமைதியைத் தரும்."
        : "மன அமைதியும், தெளிவான சிந்தனையும் என்றும் துணையிருக்கும்.",
      en: isBalyagraha
        ? "Can provoke occasional nocturnal restlessness or mental overstimulation. Easily calmed through grounding disciplines."
        : "Mental composure and nervous equilibrium are strong."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ 'ಶ್ರೀ ಸುದರ್ಶನ ಹೋಮ' & 'ಬಾಲರಕ್ಷಾ ಸ್ತೋತ್ರ ಪಾರಾಯಣ'",
      hi: "श्री सुदर्शन होम एवं बालरक्षा स्तोत्र",
      te: "సుదర్శన హోమం",
      ta: "சுதர்சன ஹோமம்",
      en: "Sri Sudarshana Maha Homa & Consecrated Balaraksha Stotram Parayana"
    },
    remedies: {
      kn: ["ಸುದರ್ಶನ ಕವಚ ಅಥವಾ ನಾರಾಯಣ ಕವಚ ಪಠಿಸಿ."],
      hi: ["नारायण कवच का पाठ करें।"],
      te: ["సుదర్శన కవచం చదవండి."],
      ta: ["சுதர்சன கவசம் படிக்கவும்."],
      en: ["Chant the Sri Sudarshana Kavacham and practice grounding breathing (pranayama)."]
    }
  });

  // ==========================================================================
  // 7. KUJA / MANGLIK DOSHA (ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ)
  // ==========================================================================
  let isKujaDosha = false;
  const kujaHouses: number[] = [];

  if (mars) {
    if ([1, 2, 4, 7, 8, 12].includes(mars.house)) {
      isKujaDosha = true;
      kujaHouses.push(mars.house);
    }
  }

  // Manglik Bhanga (Mars in Aries 1st, Capricorn 4th, Scorpio 8th, or Jupiter aspect)
  const isKujaBhanga =
    mars !== undefined &&
    ((mars.house === 1 && mars.rashi.index === 0) ||
      (mars.house === 4 && mars.rashi.index === 9) ||
      (mars.house === 8 && mars.rashi.index === 7) ||
      (jupiter !== undefined && [1, 5, 9].includes(Math.abs(jupiter.house - mars.house))));

  const kujaSeverity: DoshaSeverity = isKujaDosha ? (isKujaBhanga ? "mild" : [7, 8].includes(mars?.house || 0) ? "high" : "moderate") : "none";

  doshasList.push({
    id: "kuja_dosha",
    name: {
      kn: "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ (Kuja / Manglik Dosha)",
      hi: "कुज / मांगलिक दोष (Kuja / Manglik Dosha)",
      te: "కుజ / మాంగ్లిక్ దోషం (Kuja / Manglik Dosha)",
      ta: "செவ்வாய் தோஷம் (Kuja / Manglik)",
      en: "Kuja / Manglik Dosha (Martial Energy Imbalance)"
    },
    category: "natal",
    isDetected: isKujaDosha,
    severity: kujaSeverity,
    statusBadge: {
      kn: isKujaDosha ? (isKujaBhanga ? "ಭಂಗ ಮಾಂಗಲಿಕ (ರಹಿತ)" : "ಸಕ್ರಿಯ ಕುಜದೋಷ") : "ನಿರ್ದೋಷ",
      hi: isKujaDosha ? (isKujaBhanga ? "मांगलिक दोष भंग" : "सक्रिय मांगलिक दोष") : "दोष रहित",
      te: isKujaDosha ? "కుజ దోషం" : "దోష రహితం",
      ta: isKujaDosha ? "செவ்வாய் தோஷம்" : "தோஷமில்லை",
      en: isKujaDosha ? (isKujaBhanga ? "MANGLIK BHANGA (CANCELLED)" : "ACTIVE MANGLIK DOSHA") : "UNAFFLICTED"
    },
    technicalDetail: {
      houseNumbers: kujaHouses,
      grahasInvolved: ["Mars"],
      grahaDegrees: mars ? [{ name: "Mars", rashi: RASHI_NAMES_EN[mars.rashi.index], degreeFormatted: formatDegMin(mars.degree) }] : [],
      scripturalReference: "ಮುಹೂರ್ತ ಚಿಂತಾಮಣಿ & ಪರಾಶರ ಸಂಹಿತಾ (Muhurtha Chintamani & Parashara)",
      hasBhangaOrMitigation: isKujaBhanga,
      bhangaDescription: {
        kn: isKujaBhanga
          ? "ಕುಜನು ಸ್ವಕ್ಷೇತ್ರ/ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಅಥವಾ ಗುರುವಿನ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ಶಾಸ್ತ್ರ ಪ್ರಕಾರ ಮಾಂಗಲಿಕ ದೋಷ ಭಂಗವಾಗಿದೆ."
          : "ದೋಷವು ಪೂರ್ಣ ಪ್ರಭಾವದಲ್ಲಿದೆ.",
        en: isKujaBhanga
          ? "Mars in dignity or aspected by Jupiter activates classical Manglik Bhanga (cancellation)."
          : "Mars acts with direct martial intensity; conscious temperamental moderation advised."
      }
    },
    technicalWhy: {
      kn: isKujaDosha && mars
        ? `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದಿಂದ ಕುಜ ಗ್ರಹವು ${mars.house}ನೇ ಮನೆಯಲ್ಲಿ (${RASHI_NAMES_KN[mars.rashi.index]} - ${formatDegMin(mars.degree)}) ಸ್ಥಿತನಾಗಿದ್ದಾನೆ. ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಲಗ್ನ, ೨, ೪, ೭, ೮, ೧೨ನೇ ಮನೆಗಳಲ್ಲಿ ಕುಜನು ನೆಲೆಸಿದಾಗ ಮಾಂಗಲಿಕ ದೋಷವು ಸಿದ್ಧಿಸುತ್ತದೆ.${isKujaBhanga ? " ಆದರೆ ಶಾಸ್ತ್ರೋಕ್ತ ರದ್ದತಿ ನಿಯಮಗಳಿಂದ ಇದು ಭಂಗಗೊಂಡಿದೆ." : ""}`
        : "ಕುಜನು ಮಂಗಳಕರವಾದ ಕೇಂದ್ರ/ತ್ರಿಕೋಣಗಳಲ್ಲಿ ನೆಲೆಸಿದ್ದು ಮಾಂಗಲಿಕ ದೋಷವಿರುವುದಿಲ್ಲ.",
      hi: isKujaDosha && mars
        ? `जन्म लग्न से मंगल ${mars.house}वें भाव (${RASHI_NAMES_EN[mars.rashi.index]}) में स्थित है, जिससे मांगलिक दोष का निर्माण होता है।${isKujaBhanga ? " यद्यपि शास्त्रीय नियमों से दोष भंग हो गया है।" : ""}`
        : "कुंडली में मंगल शुभ भाव में है। मांगलिक दोष नहीं है।",
      te: isKujaDosha && mars
        ? `లగ్నం నుండి కుజుడు ${mars.house}వ స్థానంలో ఉండటం వల్ల కుజ దోషం ఏర్పడింది.`
        : "కుజుడు శుభ స్థానాలలో నెలేకొని ఉన్నందున ఎలాంటి మాంగళిక దోషం లేదు.",
      ta: isKujaDosha && mars
        ? `லக்னத்திலிருந்து செவ்வாய் ${mars.house} ஆம் வீட்டில் சஞ்சரிப்பதால் செவ்வாய் தோஷம் உண்டாகியுள்ளது.`
        : "செவ்வாய் பகவான் சுப ஸ்தானங்களில் அமர்ந்துள்ளதால் எவ்வித மாங்கல்ய தோஷமும் இல்லை.",
      en: isKujaDosha && mars
        ? `Mars occupies the ${mars.house}th house (${RASHI_NAMES_EN[mars.rashi.index]} at ${formatDegMin(mars.degree)}) from Lagna. Placement across houses 1, 2, 4, 7, 8, or 12 triggers classical Manglik energy.${isKujaBhanga ? " Scriptural cancellation criteria apply, greatly mitigating domestic severity." : ""}`
        : "Mars is positioned outside sensitive marital houses. No Manglik Dosha present."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ನಡವಳಿಕೆಯಲ್ಲಿ ಹಠಾತ್ ಕೋಪ, ಅಸಹನೆ, ಸಣ್ಣಪುಟ್ಟ ತಪ್ಪುಗಳಿಗೂ ಸಂಗಾತಿ ಅಥವಾ ಕುಟುಂಬ ಸದಸ್ಯರ ಮೇಲೆ ಕಿರುಚಾಡುವುದು, ದಾಂಪತ್ಯದಲ್ಲಿ ಸೈದ್ಧಾಂತಿಕ ಘರ್ಷಣೆಗಳು ಹಾಗೂ ಆತುರದ ನಿರ್ಧಾರಗಳಿಂದಾಗಿ ಸಂಬಂಧಗಳಲ್ಲಿ ಬಿರುಕು ಮೂಡುವ ಅಪಾಯ ಎದುರಾಗುತ್ತಿದೆ.",
      hi: "वर्तमान में स्वभाव में उग्रता, अत्यधिक अधीरता, जीवनसाथी अथवा पारिवारिक सदस्यों पर क्रोध निकलना तथा वैचारिक टकराव के कारण वैवाहिक एवं साझेदारी संबंधों में तनाव की समस्या बनी हुई है।",
      te: "ప్రస్తుతం విపరీతమైన కోపం, అసహనం, జీవిత భాగస్వామితో గొడవలు మరియు ఆవేశంలో తీసుకునే నిర్ణయాల వల్ల దాంపత్య బంధాలలో విభేదాలు వచ్చే సమస్యలు ఎదురవుతున్నాయి.",
      ta: "தற்போது திடீர் கோபம், பொறுமையின்மை, வாழ்க்கைத் துணையுடன் வாக்குவாதங்கள் மற்றும் அவசர முடிவுகளால் குடும்ப உறவுகளில் விரிசல் ஏற்படும் சூழல் நிலவுகிறது.",
      en: "Currently confronting temperamental volatility, acute intolerance for minor delays, verbal sparks that strain marital and domestic harmony, and impetuous confrontations that jeopardize vital partnerships."
    },
    dashaResonance: buildDashaResonance([PN.Mars], "ಕುಜ ದೋಷ"),
    lifeImpact: {
      kn: isKujaDosha
        ? `ಕುಜದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ನಡವಳಿಕೆಯಲ್ಲಿ ಆತುರ, ಅಸಹನೆ, ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಉದ್ವೇಗ ಹಾಗೂ ದಾಂಪತ್ಯ ಅಥವಾ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಸೈದ್ಧಾಂತಿಕ ಘರ್ಷಣೆಗಳು ಮೂಡಬಹುದು.

ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಆರಾಧನೆ, ಧ್ಯಾನ ಹಾಗೂ ಶಾಂತಿಯುತ ಸಂಭಾಷಣೆಯನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದರಿಂದ ಈ ತೀಕ್ಷ್ಣ ಶಕ್ತಿಯು ಶ್ರೇಷ್ಠ ನಾಯಕತ್ವ ಹಾಗೂ ಅದ್ಭುತ ಸಾಧನೆಯಾಗಿ ಬದಲಾಗುತ್ತದೆ.`
        : "ವೈವಾಹಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ, ಸಾಮರಸ್ಯ ನೆಲೆಸಿದೆ.",
      hi: isKujaDosha
        ? `स्वभाव में जल्दबाजी अथवा क्रोध पर नियंत्रण में कठिनाई आ सकती है। सुब्रह्मण्य/हनुमान जी की उपासना से यह ऊर्जा रचनात्मक पराक्रम में बदल जाती है।`
        : "वैवाहिक जीवन सौहार्दपूर्ण रहेगा।",
      te: isKujaDosha
        ? `కోపాన్ని నియంత్రించుకోవడం మరియు సుబ్రహ్మణ్య స్వామిని పూజించడం వల్ల సకల శుభాలు కలుగుతాయి.`
        : "వైవాహిక జీవితంలో పరస్పర అవగాహన మరియు సౌభాగ్యం నెలకొంటాయి.",
      ta: isKujaDosha
        ? `முருகப்பெருமான் வழிபாடு செய்வதும், நிதானத்தைக் கடைப்பிடிப்பதும் நன்மை தரும்.`
        : "தாம்பத்திய வாழ்க்கையில் பரஸ்பர அன்பும், குடும்ப ஒற்றுமையும் நிலவும்.",
      en: isKujaDosha
        ? `Generates dynamic surges of martial drive, occasional impatience with procedural delays, and passionate conviction in relationships.

Channelling this heat through regular athletic discipline and Kartikeya/Hanuman devotion transforms reactive impulse into constructive leadership.`
        : "Marital and interpersonal relationships operate in harmonious equilibrium."
    },
    recommendedPooja: {
      kn: "ಕುಕ್ಕೆ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಗೋಕರ್ಣದಲ್ಲಿ 'ಕುಜ ಶಾಂತಿ' & 'ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ'",
      hi: "कुकके सुब्रह्मण्य अथवा गोकर्ण में 'कुज शांति एवं सुब्रह्मण्य होम'",
      te: "కుక్కే సుబ్రహ్మణ్య లేదా గోకర్ణంలో 'కుజ శాంతి పూజ'",
      ta: "சுப்பிரமணியர் ஹோமம் மற்றும் செவ்வாய் சாந்தி",
      en: "Kuja Shanti & Sri Subramanya Homa at Kukke Subramanya or Gokarna"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಅಥವಾ ಮಂಗಲ ಚಂಡಿಕಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ.",
        "ರಕ್ತದಾನ ಮಾಡಿ ಅಥವಾ ಕೆಂಪು ವಸ್ತ್ರ, ತೊಗರಿಬೇಳೆಯನ್ನು ದಾನ ಮಾಡಿ.",
        "ತಾಮ್ರದ ಕಡಗ ಅಥವಾ ಉಂಗುರವನ್ನು ಅನಾಮಿಕಾ ಬೆರಳಿಗೆ ಧರಿಸಿ."
      ],
      hi: [
        "मंगलवार को हनुमान चालीसा अथवा सुंदरकांड का पाठ करें।",
        "लाल मसूर की दाल एवं तांबे का दान करें।"
      ],
      te: [
        "మంగళవారం సుబ్రహ్మణ్య ఆరాధన చేయండి.",
        "ఎరుపు రంగు వస్త్రాలు దానం చేయండి."
      ],
      ta: [
        "செவ்வாய்க்கிழமைகளில் கந்த சஷ்டி கவசம் படிக்கவும்.",
        "துவரம் பருப்பு தானம் செய்யவும்."
      ],
      en: [
        "Recite the Mangala Chandika Stotram or Kartikeya Ashtottara on Tuesdays.",
        "Donate red lentils (masoor dal) and copper to temples.",
        "Channel excess energy through daily physical fitness discipline."
      ]
    }
  });

  // ==========================================================================
  // 8. GRAHAN DOSHA (ಗ್ರಹಣ ದೋಷ - ಸೂರ್ಯ/ಚಂದ್ರ ರಾಹು-ಕೇತು ಯುತಿ)
  // ==========================================================================
  const isSuryaGrahan = sun && rahu && sun.house === rahu.house;
  const isChandraGrahan = moon && (rahu ? moon.house === rahu.house : false) || (ketu ? moon?.house === ketu.house : false);
  const isGrahanActive = !!(isSuryaGrahan || isChandraGrahan);
  const grahanHouses = [
    ...(isSuryaGrahan && sun ? [sun.house] : []),
    ...(isChandraGrahan && moon ? [moon.house] : [])
  ];

  doshasList.push({
    id: "grahan_dosha",
    name: {
      kn: isSuryaGrahan ? "ಸೂರ್ಯ ಗ್ರಹಣ ದೋಷ (Surya Grahan)" : isChandraGrahan ? "ಚಂದ್ರ ಗ್ರಹಣ ದೋಷ (Chandra Grahan)" : "ಗ್ರಹಣ ದೋಷ (Grahan Dosha)",
      hi: isSuryaGrahan ? "सूर्य ग्रहण दोष (Surya Grahan)" : isChandraGrahan ? "चंद्र ग्रहण दोष (Chandra Grahan)" : "ग्रहण दोष (Grahan Dosha)",
      te: "గ్రహణ దోషం (Grahan Dosha)",
      ta: "கிரகண தோஷம் (Grahan Dosha)",
      en: isSuryaGrahan ? "Surya Grahan Dosha (Solar Eclipse)" : isChandraGrahan ? "Chandra Grahan Dosha (Lunar Eclipse)" : "Grahan Dosha (Eclipse Affliction)"
    },
    category: "natal",
    isDetected: isGrahanActive,
    severity: isGrahanActive ? "high" : "none",
    statusBadge: {
      kn: isGrahanActive ? "ಸಕ್ರಿಯ ಗ್ರಹಣ ದೋಷ" : "ನಿರ್ದೋಷ (ತೇಜಸ್ಸು)",
      hi: isGrahanActive ? "सक्रिय ग्रहण दोष" : "ग्रहण मुक्त",
      te: isGrahanActive ? "గ్రహణ దోషం ఉంది" : "శుభం",
      ta: isGrahanActive ? "கிரகண தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isGrahanActive ? "ECLIPSE AFFLICTION ACTIVE" : "LUMINOUS CHARTER"
    },
    technicalDetail: {
      houseNumbers: grahanHouses,
      grahasInvolved: [
        ...(isSuryaGrahan ? ["Sun", "Rahu"] : []),
        ...(isChandraGrahan ? ["Moon", "Rahu/Ketu"] : [])
      ],
      scripturalReference: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಗ್ರಹಣ ದೋಷಾಧ್ಯಾಯ (BPHS, Grahan Adhyaya)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ಗ್ರಹಣ ಶಾಂತಿ ಹೋಮ ಮತ್ತು ನವಗ್ರಹ ದಾನದಿಂದ ಪೂರ್ಣ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.",
        en: "Harmonized through consecrated Grahan Shanti and Homa rites."
      }
    },
    technicalWhy: {
      kn: isGrahanActive
        ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${isSuryaGrahan ? "ಪಿತೃ-ಆತ್ಮಕಾರಕ ಸೂರ್ಯನು ರಾಹುವಿನೊಂದಿಗೆ" : "ಮನಃಕಾರಕ ಚಂದ್ರನು ರಾಹು/ಕೇತುವಿನೊಂದಿಗೆ"} ${grahanHouses.join(", ")}ನೇ ಮನೆಯಲ್ಲಿ ಯುತಿ ಹೊಂದಿ ಗ್ರಹಣ ದೋಷವನ್ನು ಉಂಟುಮಾಡಿದೆ. ಇದು ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಮಾನಸಿಕ ಸ್ಪಷ್ಟತೆಯನ್ನು ಮರೆಮಾಚುತ್ತದೆ.`
        : "ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರರು ಛಾಯಾಗ್ರಹಗಳಾದ ರಾಹು-ಕೇತುಗಳಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತವಾಗಿದ್ದು ಯಾವುದೇ ಗ್ರಹಣ ದೋಷವಿಲ್ಲ.",
      hi: isGrahanActive
        ? `कुंडली में ${isSuryaGrahan ? "सूर्य" : "चंद्र"} पर राहु/केतु का युति प्रभाव ग्रहण दोष निर्मित करता है, जो जीवन में आत्मबल व मन की स्थिरता को क्षीण करता है।`
        : "सूर्य एवं चंद्र ग्रहण दोष से पूर्णतः मुक्त हैं।",
      te: isGrahanActive
        ? `మీ జాతకంలో సూర్యుడు లేదా చంద్రునిపై రాహు-కేతువుల ప్రభావం వల్ల గ్రహణ దోషం ఏర్పడింది.`
        : "సూర్య చంద్రులు నిర్మలంగా ఉండి గ్రహణ దోషం లేదు.",
      ta: isGrahanActive
        ? `சூரியன் அல்லது சந்திரன் ராகு/கேதுவுடன் இணைந்து சஞ்சரிப்பதால் கிரகண தோஷம் ஏற்பட்டுள்ளது.`
        : "கிரகண தோஷம் ஏதுமில்லை.",
      en: isGrahanActive
        ? `Conjunction of vital Luminary (${isSuryaGrahan ? "Sun" : "Moon"}) with nodal axis in house ${grahanHouses.join(", ")} casts classical Grahan Dosha, eclipsing executive confidence and emotional clarity.`
        : "Luminaries Sun and Moon operate free of nodal contamination; no Grahan Dosha is present."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ, ಸಾರ್ವಜನಿಕವಾಗಿ ಅವಮಾನ ಅಥವಾ ಅಪವಾದಗಳಿಗೆ ತುತ್ತಾಗುವ ಭೀತಿ, ನೇತ್ರ ಅಥವಾ ತಲೆನೋವಿನ ಸಮಸ್ಯೆಗಳು, ಸರ್ಕಾರಿ ಕೆಲಸಗಳಲ್ಲಿ ಅಡೆತಡೆ ಹಾಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ಕತ್ತಲೆಯ ಆವರಿಸಿದಂತಹ ಖಿನ್ನತೆ ದಿನನಿತ್ಯ ಕಾಡುತ್ತಿದೆ.",
      hi: "वर्तमान में आत्मविश्वास में भारी गिरावट, सामाजिक मानहानि का भय, सिरदर्द या नेत्र विकार, सरकारी कार्यों में अड़चनें तथा मन में निराशाजनक विचारों का हावी होना प्रमुख समस्याएं हैं।",
      te: "ప్రస్తుతం ఆత్మవిశ్వాసం తగ్గడం, అపవాదులు ఎదురవుతాయనే భయం, తలనొప్పి, ప్రభుత్వ పనులలో ఆటంకాలు మరియు మానసిక స్తబ్దత వంటి సమస్యలు ఉన్నాయి.",
      ta: "தற்போது தன்னம்பிக்கைக் குறைவு, வீண் பழிச்சொல் ஏற்படும் அச்சம், தலைவலி அல்லது கண் உபாதைகள் மற்றும் மனதில் இருள் சூழ்ந்தது போன்ற மனச்சோர்வு நிலவுகிறது.",
      en: "Currently afflicted by sudden lapses in executive confidence, dread of social defamation or scapegoating, recurring ocular/cranial stress, and persistent feelings of psychic eclipse or depression."
    },
    dashaResonance: buildDashaResonance([PN.Sun, PN.Moon, PN.Rahu, PN.Ketu], "ಗ್ರಹಣ ದೋಷ"),
    lifeImpact: {
      kn: isGrahanActive
        ? "ಗ್ರಹಣ ದೋಷದಿಂದಾಗಿ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಭ್ರಮೆ ಮೂಡುವುದು, ತಂದೆ ಅಥವಾ ತಾಯಿಯ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರು ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಗೋಕರ್ಣದಲ್ಲಿ ಗ್ರಹಣ ಶಾಂತಿ ಮತ್ತು ಸೂರ್ಯ-ಚಂದ್ರ ಹವನ ಮಾಡಿಸುವುದರಿಂದ ನಿಮ್ಮ ನೈಜ ತೇಜಸ್ಸು ಜಾಗೃತಗೊಂಡು ಅದ್ಭುತ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ."
        : "ಮನಸ್ಸು ಮತ್ತು ಆತ್ಮಬಲವು ನಿರಂತರ ಪ್ರಕಾಶಮಾನವಾಗಿದೆ.",
      hi: isGrahanActive
        ? "निर्णयों में भ्रम एवं माता-पिता के स्वास्थ्य को लेकर चिंताएं हो सकती हैं। ग्रहण शांति पूजा से आत्मबल एवं मनोबल में अभूतपूर्व वृद्धि होती है।"
        : "आत्मबल एवं मनोबल सुदृढ़ बना हुआ है।",
      te: isGrahanActive
        ? "నిర్ణయాలలో తికమక మరియు ఆరోగ్య సమస్యలు రావచ్చు. శాంతి పూజలు శ్రేయస్కరం."
        : "మానసిక స్థైర్యం బాగుంది.",
      ta: isGrahanActive
        ? "முடிவெடுப்பதில் குழப்பங்கள் வரலாம். சாந்தி பூஜை நற்பலன் தரும்."
        : "மன உறுதி நிறைந்துள்ளது.",
      en: isGrahanActive
        ? "Periodic obscuration of clarity during critical turning points. Propitiating luminaries restores radiant executive magnetism and domestic stability."
        : "Executive clarity and emotional equilibrium are firmly grounded."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ಗ್ರಹಣ ದೋಷ ನಿವಾರಣಾ ಶಾಂತಿ' & 'ಸೂರ್ಯ-ಚಂದ್ರ ಹವನ'",
      hi: "गोकर्ण में 'सूर्य-चंद्र ग्रहण शांति महाहवन'",
      te: "గోకర్ణంలో 'గ్రహణ దోష నివారణ శాంతి'",
      ta: "கோகர்ணத்தில் 'கிரகண தோஷ சாந்தி பூஜை'",
      en: "Consecrated Grahan Shanti & Surya-Chandra Maha Homa at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿದಿನ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಅಥವಾ ಚಂದ್ರ ಕವಚ ಪಠಿಸಿ.",
        "ಬೆಳ್ಳಿ ಅಥವಾ ತಾಮ್ರದ ನಾಣ್ಯವನ್ನು ದಾನ ಮಾಡಿ."
      ],
      hi: [
        "आदित्य हृदय स्तोत्र का नित्य पाठ करें।",
        "चांदी का दान करें।"
      ],
      te: [
        "ఆదిత్య హృదయ స్తోత్రం చదవండి.",
        "వెండి దానం చేయండి."
      ],
      ta: [
        "ஆதித்ய ஹ்ருதய ஸ்தோத்திரம் படிக்கவும்.",
        "வெள்ளி தானம் செய்யவும்."
      ],
      en: [
        "Recite the Aditya Hridaya Stotram at sunrise.",
        "Donate silver coins or raw wheat to spiritual practitioners."
      ]
    }
  });

  // ==========================================================================
  // 9. SHRAPIT DOSHA (ಶ್ರಪಿತ ದೋಷ - ಶನಿ-ರಾಹು ಯುತಿ)
  // ==========================================================================
  const isShrapit = saturn && rahu && saturn.house === rahu.house;
  const shrapitSeverity: DoshaSeverity = isShrapit ? "critical" : "none";

  doshasList.push({
    id: "shrapit_dosha",
    name: {
      kn: "ಶ್ರಪಿತ ದೋಷ (Shrapit Dosha / Shani-Rahu)",
      hi: "श्रापित दोष (Shrapit Dosha)",
      te: "శ్రాపిత దోషం (Shrapit Dosha)",
      ta: "சிரபித தோஷம் (Shrapit Dosha)",
      en: "Shrapit Dosha (Saturn-Rahu Karmic Conjunction)"
    },
    category: "natal",
    isDetected: !!isShrapit,
    severity: shrapitSeverity,
    statusBadge: {
      kn: isShrapit ? "ತೀವ್ರ ಶ್ರಪಿತ ಕರ್ಮ" : "ಶಾಪ ರಹಿತ",
      hi: isShrapit ? "सक्रिय श्रापित योग" : "श्राप मुक्त",
      te: isShrapit ? "శ్రాపిత దోషం ఉంది" : "శుభం",
      ta: isShrapit ? "சிரபித தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isShrapit ? "ACTIVE SHRAPIT YOGA" : "UNAFFLICTED"
    },
    technicalDetail: {
      houseNumbers: isShrapit && saturn ? [saturn.house] : [],
      grahasInvolved: ["Saturn", "Rahu"],
      scripturalReference: "ಭೃಗು ಸಂಹಿತಾ, ಶ್ರಪಿತ ಕುಂಡಲಿ ಯೋಗಾಧ್ಯಾಯ (Bhrigu Samhita, Shrapit Yoga)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ಶನಿ-ರಾಹುವಿನ ಶಾಪ ನಿವಾರಣೆಗೆ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ರುದ್ರಾಭಿಷೇಕವೇ ಏಕೈಕ ರಕ್ಷಣೆಯಾಗಿದೆ.",
        en: "Requires dedicated Rudrabhishekam and Shani-Rahu Shanti."
      }
    },
    technicalWhy: {
      kn: isShrapit && saturn
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಕರ್ಮಕಾರಕ ಶನಿ ಮತ್ತು ಛಾಯಾಗ್ರಹ ರಾಹು ಇಬ್ಬರೂ ${saturn.house}ನೇ ಮನೆಯಲ್ಲಿ (${RASHI_NAMES_KN[saturn.rashi.index]}) ಒಟ್ಟಿಗೆ ಯುತಿ ಹೊಂದಿದ್ದಾರೆ. ಭೃಗು ಸಂಹಿತೆಯ ಪ್ರಕಾರ ಇದು ಹಿಂದಿನ ಜನ್ಮದ ತೀವ್ರ ಶಾಪಯುತ ಕರ್ಮವನ್ನು ಸೂಚಿಸುವ 'ಶ್ರಪಿತ ದೋಷ'ವಾಗಿದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶನಿ ಮತ್ತು ರಾಹು ಬೇರೆ ಬೇರೆ ಮನೆಗಳಲ್ಲಿದ್ದು ಯಾವುದೇ ಶ್ರಪಿತ ದೋಷವಿಲ್ಲ.",
      hi: isShrapit && saturn
        ? `कुंडली में शनि और राहु दोनों ${saturn.house}वें भाव में युति कर रहे हैं, जो पूर्वजन्म के कर्मों से उत्पन्न श्रापित दोष का निर्माण करता है।`
        : "शनि और राहु अलग-अलग भावों में हैं। श्रापित दोष नहीं है।",
      te: isShrapit && saturn
        ? `శని మరియు రాహువు ${saturn.house}వ స్థానంలో కలసి ఉండటం వల్ల శ్రాపిత దోషం ఏర్పడింది.`
        : "శ్రాపిత దోషం లేదు.",
      ta: isShrapit && saturn
        ? `சனியும் ராகுவும் ${saturn.house} ஆம் வீட்டில் இணைந்துள்ளதால் சிரபித தோஷம் உண்டாகியுள்ளது.`
        : "சிரபித தோஷம் இல்லை.",
      en: isShrapit && saturn
        ? `Saturn and Rahu are locked in exact conjunction in house ${saturn.house} (${RASHI_NAMES_EN[saturn.rashi.index]}). Classical Bhrigu treatises denote this configuration as Shrapit Yoga (cursed alignment), requiring profound penitential propitiation.`
        : "Saturn and Rahu occupy separate houses. No Shrapit Dosha present."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಶುಭ ಕಾರ್ಯ ಅಥವಾ ವೃತ್ತಿ ಯೋಜನೆ ಕೈಗೆತ್ತಿಕೊಂಡರೂ ಪದೇಪದೇ ನಿಂತುಹೋಗುವುದು, ಮಾಡಿದ ಉಪಕಾರಕ್ಕೆ ಕೆಟ್ಟ ಹೆಸರು ಬರುವುದು, ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟು ಹಾಗೂ ಕಾರಣವಿಲ್ಲದೆ ಹೊಸ ಶತ್ರುಗಳು ಹುಟ್ಟಿಕೊಳ್ಳುವ ಕಠಿಣ ಸವಾಲುಗಳು ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿವೆ.",
      hi: "वर्तमान में प्रत्येक शुभ कार्य में अकारण विघ्न, उपकार के बदले अपयश, ऋण संकट तथा गुप्त शत्रुओं की सक्रियता से जीवन में भारी अवरोध उत्पन्न हो रहे हैं।",
      te: "ప్రస్తుతం ఏ మంచి పని తలపెట్టినా ఆగిపోవడం, మేలు చేసినా చెడు ఎదురవడం, ఆర్థిక ఇబ్బందులు మరియు శత్రు బాధలు మిమ్మల్ని వేధిస్తున్నాయి.",
      ta: "தற்போது சுப காரியங்களில் தொடர் தடைகள், செய்த உதவிக்கு அவப்பெயர், பண முடக்கம் மற்றும் காரணமற்ற விரோதிகள் உருவாவது போன்ற தீவிர பிரச்சனைகள் உள்ளன.",
      en: "Currently experiencing chronic sabotage of auspicious milestones, unprovoked hostility from erstwhile beneficiaries, severe liquidity crunches, and an inescapable sense of being blocked by invisible obstacles."
    },
    dashaResonance: buildDashaResonance([PN.Saturn, PN.Rahu], "ಶ್ರಪಿತ ದೋಷ"),
    lifeImpact: {
      kn: isShrapit
        ? "ಶ್ರಪಿತ ದೋಷವು ಜೀವನದಲ್ಲಿ ಅತಿಯಾದ ಕಠಿಣ ಪರೀಕ್ಷೆಗಳನ್ನು ತರುತ್ತದೆ. ಆದರೆ ಶಿವನ ಆರಾಧನೆ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶನಿ-ರಾಹು ಶಾಂತಿ ಮಾಡಿಸುವುದರಿಂದ ಶಾಪವು ವರವಾಗಿ ಬದಲಾಗಿ ಅಪಾರ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ."
        : "ಜೀವನದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಿದೆ.",
      hi: isShrapit
        ? "कठिन संघर्षों के बाद ही सफलता मिलती है। शिव कृपा एवं गोकर्ण में शांति पूजा से समस्त बाधाएं दूर हो जाती हैं।"
        : "जीवन निर्बाध प्रगतिशील है।",
      te: isShrapit
        ? "తీవ్ర పోరాటం తర్వాత విజయం లభిస్తుంది. శివారాధన ముఖ్యం."
        : "సౌభాగ్యం స్థిరంగా ఉంది.",
      ta: isShrapit
        ? "கடுமையான போராட்டங்களுக்குப் பின் வெற்றி கிடைக்கும். சிவ வழிபாடு நலம் தரும்."
        : "வாழ்வு சீராக உள்ளது.",
      en: isShrapit
        ? "Imposes heavy existential tests where genuine kindness is rewarded with mistrust. Once cleared via Shivalinga Tailabhishekam, converts into profound worldly endurance."
        : "Free of ancestral curses; karma flows constructively."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ಶ್ರಪಿತ ದೋಷ ನಿವಾರಣಾ ಮಹಾ ಯಜ್ಞ' & 'ಶನಿ-ರಾಹು ಶಾಂತಿ'",
      hi: "गोकर्ण में 'श्रापित दोष निवारण महायज्ञ'",
      te: "గోకర్ణంలో 'శ్రాపిత దోష నివారణ మహాయజ్ఞం'",
      ta: "கோகர்ணத்தில் 'சிரபித தோஷ நிவாரண மஹாயாகம்'",
      en: "Shrapit Dosha Nivarana Maha Yajna & Tailabhishekam at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಶನಿವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಎಳ್ಳೆಣ್ಣೆ ಅಭಿಷೇಕ ಮಾಡಿ ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ.",
        "ಬಡವರಿಗೆ ಮತ್ತು ಅಂಗವಿಕಲರಿಗೆ ಅನ್ನದಾನ ಮತ್ತು ಕಪ್ಪು ವಸ್ತ್ರ ದಾನ ಮಾಡಿ."
      ],
      hi: [
        "शनिवार को शिवलिंग पर तिल के तेल का अभिषेक करें।",
        "निर्धनों की निःस्वार्थ सेवा करें।"
      ],
      te: [
        "శనివారం శివునికి తైలాభిషేకం చేయండి.",
        "పేదలకు దానం చేయండి."
      ],
      ta: [
        "சனிக்கிழமைகளில் சிவபெருமானுக்கு நல்லெண்ணெய் அபிஷேகம் செய்யவும்.",
        "ஏழைகளுக்கு அன்னதானம் வழங்கவும்."
      ],
      en: [
        "Perform Saturday sesame oil abhishekam on Shivalinga.",
        "Engage in silent, selfless service to disabled and destitute individuals."
      ]
    }
  });

  // ==========================================================================
  // 10. KEMADRUMA DOSHA (ಕೇಮದ್ರುಮ ದೋಷ - ಚಂದ್ರನ ಏಕಾಂಗಿತನ)
  // ==========================================================================
  let isKemadruma = false;
  let hasKemadrumaBhanga = false;

  if (moon) {
    const secondHouse = (moon.house % 12) + 1;
    const twelfthHouse = ((moon.house - 2 + 12) % 12) + 1;

    const planetsFlanking = kundli.planets.filter(
      (p) =>
        [PN.Mars, PN.Mercury, PN.Jupiter, PN.Venus, PN.Saturn].includes(p.name) &&
        (p.house === secondHouse || p.house === twelfthHouse)
    );

    if (planetsFlanking.length === 0) {
      isKemadruma = true;
      // Kemadruma Bhanga: If any planet is in Kendra from Lagna or Moon
      const kendraPlanets = kundli.planets.filter(
        (p) =>
          [PN.Jupiter, PN.Venus, PN.Mercury, PN.Mars].includes(p.name) &&
          ([1, 4, 7, 10].includes(p.house) || [1, 4, 7, 10].includes(((p.house - moon.house + 12) % 12) + 1))
      );
      if (kendraPlanets.length > 0) {
        hasKemadrumaBhanga = true;
      }
    }
  }

  doshasList.push({
    id: "kemadruma_dosha",
    name: {
      kn: "ಕೇಮದ್ರುಮ ದೋಷ (Kemadruma Dosha)",
      hi: "केमद्रुम दोष (Kemadruma Dosha)",
      te: "కేమద్రుమ దోషం (Kemadruma)",
      ta: "கேமத்ரும தோஷம் (Kemadruma)",
      en: "Kemadruma Dosha (Lunar Isolation & Wealth Volatility)"
    },
    category: "natal",
    isDetected: isKemadruma,
    severity: isKemadruma ? (hasKemadrumaBhanga ? "mild" : "high") : "none",
    statusBadge: {
      kn: isKemadruma ? (hasKemadrumaBhanga ? "ಕೇಮದ್ರುಮ ಭಂಗ (ರಕ್ಷಿತ)" : "ಸಕ್ರಿಯ ಕೇಮದ್ರುಮ") : "ಚಂದ್ರ ಬಲ ಯೋಗ",
      hi: isKemadruma ? (hasKemadrumaBhanga ? "केमद्रुम भंग योग" : "सक्रिय केमद्रुम") : "शुभ चंद्र योग",
      te: isKemadruma ? "కేమద్రుమ దోషం" : "దోష రహితం",
      ta: isKemadruma ? "கேமத்ரும தோஷம்" : "தோஷமில்லை",
      en: isKemadruma ? (hasKemadrumaBhanga ? "KEMADRUMA BHANGA (MITIGATED)" : "ACTIVE KEMADRUMA") : "LUNAR STABILITY"
    },
    technicalDetail: {
      houseNumbers: moon ? [moon.house] : [],
      grahasInvolved: ["Moon"],
      scripturalReference: "ಜಾತಕ ಪಾರಿಜಾತ & ಫಲದೀಪಿಕಾ (Jataka Parijata & Phaladeepika)",
      hasBhangaOrMitigation: hasKemadrumaBhanga,
      bhangaDescription: {
        kn: hasKemadrumaBhanga
          ? "ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳಿರುವುದರಿಂದ ಕೇಮದ್ರುಮ ಭಂಗ ರಾಜಯೋಗವಾಗಿ ಮಾರ್ಪಟ್ಟಿದೆ."
          : "ಚಂದ್ರನಿಗೆ ಯಾವುದೇ ಆಶ್ರಯ ಗ್ರಹಗಳಿಲ್ಲದೆ ಏಕಾಂಗಿಯಾಗಿದ್ದಾನೆ.",
        en: hasKemadrumaBhanga
          ? "Presence of Kendra planets triggers sovereign Kemadruma Bhanga Raja Yoga."
          : "Moon is isolated without flanking planetary support."
      }
    },
    technicalWhy: {
      kn: isKemadruma && moon
        ? `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಚಂದ್ರನಿಂದ ೨ನೇ ಮತ್ತು ೧೨ನೇ ಮನೆಗಳಲ್ಲಿ ಯಾವುದೇ ತಾರಾಗ್ರಹಗಳಿಲ್ಲದೆ (ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ) ಚಂದ್ರನು ಏಕಾಂಗಿಯಾಗಿದ್ದಾನೆ. ಶಾಸ್ತ್ರದಂತೆ ಇದು 'ಕೇಮದ್ರುಮ ದೋಷ'ವಾಗಿದೆ.${hasKemadrumaBhanga ? " ಆದರೆ ಕೇಂದ್ರದಲ್ಲಿ ಗ್ರಹಗಳಿರುವುದರಿಂದ ಶಾಸ್ತ್ರೋಕ್ತ ರದ್ದತಿಯಾಗಿದೆ." : ""}`
        : "ಚಂದ್ರನ ಅಕ್ಕಪಕ್ಕದ ಮನೆಗಳಲ್ಲಿ ಗ್ರಹಗಳಿದ್ದು ಸುನಫಾ/ಅನಫಾ ಶುಭಯೋಗವಿದೆ. ಕೇಮದ್ರುಮ ದೋಷವಿಲ್ಲ.",
      hi: isKemadruma && moon
        ? `चंद्रमा से द्वितीय एवं द्वादश भाव में कोई ग्रह न होने से केमद्रुम योग बनता है।${hasKemadrumaBhanga ? " हालांकि केंद्र में ग्रहों के प्रभाव से दोष भंग हो गया है।" : ""}`
        : "चंद्रमा शुभ ग्रहों से सुरक्षित है। केमद्रुम दोष नहीं है।",
      te: isKemadruma && moon
        ? `చంద్రుని ఇరువైపులా గ్రహాలు లేకపోవడం వల్ల కేమద్రుమ దోషం ఏర్పడింది.`
        : "కేమద్రుమ దోషం లేదు.",
      ta: isKemadruma && moon
        ? `சந்திரனின் இருபுறமும் கிரகங்கள் இல்லாததால் கேமத்ரும தோஷம் உண்டாகியுள்ளது.`
        : "கேமத்ரும தோஷம் இல்லை.",
      en: isKemadruma && moon
        ? `Moon is unassisted with neither 2nd nor 12th houses containing classical Tara Grahas, producing Kemadruma Dosha.${hasKemadrumaBhanga ? " Robust Kendra placements trigger classical Kemadruma Bhanga cancellation." : ""}`
        : "Flanking planets protect the lunar sphere; no Kemadruma isolation exists."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಸಂಪತ್ತು ಮತ್ತು ಹಣಕಾಸಿನ ಹರಿವಿನಲ್ಲಿ ತೀವ್ರ ಅಸ್ಥಿರತೆ, ಜನನಿಬಿಡ ಸಮಾಜದಲ್ಲಿದ್ದರೂ ತೀವ್ರ ಏಕಾಂಗಿತನದ ಭಾವನೆ, ಮಾನಸಿಕ ಆತಂಕ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ನಿರಂತರ ಪ್ರಯಾಸ ಎದುರಾಗುತ್ತಿದೆ.",
      hi: "वर्तमान में आर्थिक स्थिरता का अभाव, समाज के बीच भी गहरा अकेलापन, मानसिक असुरक्षा तथा जीवन में स्थायी संचय न हो पाने की निरंतर चिंता बनी हुई है।",
      te: "ప్రస్తుతం ఆదాయంలో తీవ్ర అస్థిరత, ఎంతమంది ఉన్నా ఒంటరితనం భావన మరియు మానసిక అభద్రత మిమ్మల్ని కలవరపెడుతున్నాయి.",
      ta: "தற்போது பொருளாதாரத்தில் தொடர் ஏற்றத்தாழ்வுகள், கூட்டத்தில் இருந்தாலும் தனிமை உணர்வு மற்றும் எதிர்காலம் பற்றிய தீவிர பயம் நிலவுகிறது.",
      en: "Currently contending with severe financial volatility where income flows out as quickly as it arrives, haunting feelings of psychological abandonment amidst crowds, and deep emotional vulnerability."
    },
    dashaResonance: buildDashaResonance([PN.Moon], "ಕೇಮದ್ರುಮ ದೋಷ"),
    lifeImpact: {
      kn: isKemadruma
        ? "ಕೇಮದ್ರುಮ ದೋಷದಿಂದಾಗಿ ಕೈಯಲ್ಲಿ ಹಣ ನಿಲ್ಲದಿರುವುದು ಮತ್ತು ಮಾನಸಿಕ ಅಭದ್ರತೆ ಕಾಡಬಹುದು. ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಪೂಜೆಯಿಂದ ಸಂಪತ್ತು ಸ್ಥಿರಗೊಳ್ಳುತ್ತದೆ."
        : "ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಮಾನಸಿಕ ತೃಪ್ತಿ ನೆಲೆಸಿದೆ.",
      hi: isKemadruma
        ? "धन संचय में कठिनाई तथा अकेलापन अनुभव हो सकता है। श्री सूक्त पाठ से लाभ होता है।"
        : "आर्थिक स्थिति सुदृढ़ है।",
      te: isKemadruma
        ? "ధన నష్టం మరియు ఒంటరితనం. లక్ష్మీ పూజ శ్రేయస్కరం."
        : "సంపద స్థిరంగా ఉంటుంది.",
      ta: isKemadruma
        ? "பண விரயம் ஏற்படலாம். லட்சுமி பூஜை செய்வது நலம்."
        : "செல்வ வளம் சிறக்கும்.",
      en: isKemadruma
        ? "Liquid capital disperses erratically unless anchored through Lakshmi Narayana worship and disciplined investments."
        : "Stable emotional grounding and consistent capital accumulation."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ 'ಕೇಮದ್ರುಮ ದೋಷ ಶಾಂತಿ' & 'ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ-ಚಂದ್ರ ಯಾಗ'",
      hi: "गोकर्ण में 'महालक्ष्मी-चंद्र शांति याग'",
      te: "గోకర్ణంలో 'మహాలక్ష్మి చంద్ర శాంతి హోమం'",
      ta: "கோகர்ணத்தில் 'மகாலட்சுமி சந்திர சாந்தி யாகம்'",
      en: "Sri Mahalakshmi-Chandra Shanti Maha Yajna at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿದಿನ ಶ್ರೀ ಸೂಕ್ತ ಮತ್ತು ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ.",
        "ಹುಣ್ಣಿಮೆಯಂದು ಬಿಳಿ ಹೂವುಗಳಿಂದ ಲಕ್ಷ್ಮೀದೇವಿಯನ್ನು ಪೂಜಿಸಿ."
      ],
      hi: [
        "प्रतिदिन श्री सूक्त का पाठ करें।",
        "पूर्णिमा को खीर का भोग लगाएं।"
      ],
      te: [
        "రోజూ శ్రీ సూక్తం చదవండి.",
        "పౌర్ణమి పూజ చేయండి."
      ],
      ta: [
        "தினமும் ஸ்ரீ சூக்தம் படிக்கவும்.",
        "பௌர்ணமியில் லட்சுமி வழிபாடு செய்யவும்."
      ],
      en: [
        "Chant the Sri Suktam and Kanakadhara Stotram daily.",
        "Offer white sweets and milk to Goddess Mahalakshmi on Purnima."
      ]
    }
  });

  // ==========================================================================
  // 11. GANDANTA / MOOLA NAKSHATRA DOSHA (ಗಂಡಾಂತ / ಮೂಲ ನಕ್ಷತ್ರ ದೋಷ)
  // ==========================================================================
  const nakshatraName = (moon?.nakshatra?.english || "").toLowerCase();
  const moonPada = kundli.moonPada || 1;

  const isAshleshaGandanta = nakshatraName.includes("ashlesha") && moonPada === 4;
  const isMaghaGandanta = nakshatraName.includes("magha") && moonPada === 1;
  const isJyeshthaGandanta = nakshatraName.includes("jyeshtha") && moonPada === 4;
  const isMoolaGandanta = nakshatraName.includes("moola") || nakshatraName.includes("mula");
  const isRevatiGandanta = nakshatraName.includes("revati") && moonPada === 4;
  const isAshwiniGandanta = nakshatraName.includes("ashwini") && moonPada === 1;

  const isGandanta =
    isAshleshaGandanta || isMaghaGandanta || isJyeshthaGandanta || isMoolaGandanta || isRevatiGandanta || isAshwiniGandanta;

  doshasList.push({
    id: "gandanta_dosha",
    name: {
      kn: isMoolaGandanta ? "ಮೂಲ ನಕ್ಷತ್ರ ಗಂಡಾಂತ ದೋಷ (Moola Gandanta)" : "ನಕ್ಷತ್ರ ಗಂಡಾಂತ ದೋಷ (Nakshatra Gandanta)",
      hi: isMoolaGandanta ? "मूल नक्षत्र गंडांत दोष (Moola Gandanta)" : "नक्षत्र गंडांत दोष (Nakshatra Gandanta)",
      te: "గండాంత నక్షత్ర దోషం (Gandanta Dosha)",
      ta: "கண்டாந்த நட்சத்திர தோஷம் (Gandanta)",
      en: isMoolaGandanta ? "Abhukta Moola Gandanta Dosha" : "Nakshatra Gandanta Junction Dosha"
    },
    category: "natal",
    isDetected: isGandanta,
    severity: isGandanta ? (isMoolaGandanta && moonPada === 1 ? "critical" : "high") : "none",
    statusBadge: {
      kn: isGandanta ? "ಗಂಡಾಂತ ಶಾಂತಿ ಅವಶ್ಯಕ" : "ಶುಭ ನಕ್ಷತ್ರ ಕಾಲ",
      hi: isGandanta ? "गंडांत शांति आवश्यक" : "शुभ नक्षत्र",
      te: isGandanta ? "శాంతి అవసరం" : "శుభ నక్షత్రం",
      ta: isGandanta ? "சாந்தி தேவை" : "சுப நட்சத்திரம்",
      en: isGandanta ? "GANDANTA SHANTI REQUIRED" : "AUSPICIOUS NAKSHATRA"
    },
    technicalDetail: {
      houseNumbers: moon ? [moon.house] : [],
      grahasInvolved: ["Moon", "Ketu/Mercury"],
      scripturalReference: "ನಾರದ ಸಂಹಿತಾ & ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಗಂಡಾಂತಾಧ್ಯಾಯ (Narada Samhita & BPHS)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "೨೭ ತೀರ್ಥೋದಕಗಳ ವಿಧಿಯುಕ್ತ ಶಾಂತಿ ಸ್ನಾನವೇ ಗಂಡಾಂತ ದೋಷಕ್ಕೆ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರವಾಗಿದೆ.",
        en: "Requires sacred 27-water abhishekam and consecrated Nakshatra Shanti."
      }
    },
    technicalWhy: {
      kn: isGandanta
        ? `ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವು ${moon?.nakshatra?.english || "Unknown"} (ಪಾದ ${moonPada}) ಆಗಿದ್ದು, ಇದು ಜಲ-ಅಗ್ನಿ ರಾಶಿಗಳ ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಸಂಧಿಕಾಲವಾದ 'ನಕ್ಷತ್ರ ಗಂಡಾಂತ'ದಲ್ಲಿ ನೆಲೆಸಿದೆ. ಶಾಸ್ತ್ರ ಪ್ರಕಾರ ಈ ಸಂಧಿಯು ಜನ್ಮ ಕರ್ಮದ ತೀವ್ರ ಋಣವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`
        : "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವು ಗಂಡಾಂತ ಸಂಧಿಯಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತವಾಗಿದ್ದು ಶುಭಕರವಾಗಿದೆ.",
      hi: isGandanta
        ? `जन्म नक्षत्र (${moon?.nakshatra?.english}, चरण ${moonPada}) जल-अग्नि राशि संधि पर स्थित है, जो शास्त्रीय गंडांत दोष का निर्माण करता है।`
        : "जन्म नक्षत्र गंडांत मुक्त एवं शुभ है।",
      te: isGandanta
        ? `మీ జన్మ నక్షత్రం గండాంత సంధిలో ఉన్నందున శాంతి పూజ అవసరం.`
        : "గండాంత దోషం లేదు.",
      ta: isGandanta
        ? `உங்கள் ஜென்ம நட்சத்திரம் கண்டாந்த சந்தியில் அமைந்துள்ளதால் சாந்தி பூஜை அவசியம்.`
        : "கண்டாந்த தோஷம் இல்லை.",
      en: isGandanta
        ? `Natal Moon occupies the critical junction between water and fire rashis in nakshatra ${moon?.nakshatra?.english} (pada ${moonPada}). Parashara Horashastra enjoins consecrated Gandanta Shanti rites.`
        : "Natal Moon is situated securely outside sensitive Sandhi junctions; no Gandanta affliction."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಸಂಬಂಧಿಕರೊಂದಿಗೆ ಅಥವಾ ಕುಟುಂಬದೊಂದಿಗೆ ಅಂತರ ಹೆಚ್ಚಾಗುವುದು, ಬಾಲ್ಯದ ಕರ್ಮ ಋಣಗಳಿಂದಾಗಿ ಪ್ರತಿಯೊಂದು ಹಂತದಲ್ಲೂ ಅತಿಯಾದ ಸಂಘರ್ಷ ಹಾಗೂ ನೂತನ ಉದ್ಯೋಗ ಅಥವಾ ಜವಾಬ್ದಾರಿಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತೊಡಕುಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತಿವೆ.",
      hi: "वर्तमान में पारिवारिक संबंधों में दूरियां, प्रारब्ध कर्मों के कारण प्रत्येक नए कदम पर असाधारण संघर्ष तथा कार्यक्षेत्र में अचानक उत्पन्न होने वाले अवरोध प्रमुख हैं।",
      te: "ప్రస్తుతం కుటుంబంలో దూరం పెరగడం, ప్రతి పనిలో తీవ్ర శ్రమ మరియు కొత్త బాధ్యతలలో unexpected సమస్యలు తలెత్తుతున్నాయి.",
      ta: "தற்போது குடும்பத்தினருடன் இடைவெளி, வாழ்க்கையின் ஒவ்வொரு நிலையிலும் கடுமையான போராட்டங்கள் மற்றும் புதிய பணிகளில் தடைகள் ஏற்படுகின்றன.",
      en: "Currently encountering systemic friction in family ties, ancestral karmic baggage that requires tenfold effort for ordinary gains, and sudden instability when assuming pivotal new responsibilities."
    },
    dashaResonance: buildDashaResonance([PN.Moon, PN.Ketu, PN.Mercury], "ಗಂಡಾಂತ ದೋಷ"),
    lifeImpact: {
      kn: isGandanta
        ? "ಜೀವನದ ಆರಂಭಿಕ ಹಂತಗಳಲ್ಲಿ ಕಠಿಣ ಸವಾಲುಗಳು. ಆದರೆ ಗಂಡಾಂತ ಶಾಂತಿಯ ನಂತರ ಅದ್ಭುತ ಧೈರ್ಯ ಮತ್ತು ಯಶಸ್ಸು ದೊರೆಯುತ್ತದೆ."
        : "ಜೀವನ ಪಯಣ ಸುಲಲಿತವಾಗಿದೆ.",
      hi: isGandanta
        ? "प्रारंभिक जीवन में संघर्ष। शांति पूजा से सर्वतोन्मुखी उन्नति होती है।"
        : "जीवन निर्बाध है।",
      te: isGandanta
        ? "ప్రారంభంలో పోరాటం. శాంతి తర్వాత మంచి ఉన్నతి."
        : "శుభం.",
      ta: isGandanta
        ? "ஆரம்ப காலத்தில் தடைகள். சாந்திக்குப் பின் பெரும் வெற்றி."
        : "நலம்.",
      en: isGandanta
        ? "Imposes formative challenges during transitions, resolved gracefully through classical purification bath rituals."
        : "Auspicious nakshatra foundation ensures harmonious momentum."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ೨೭ ತೀರ್ಥೋದಕಗಳ 'ಗಂಡಾಂತ / ಮೂಲ ನಕ್ಷತ್ರ ಶಾಂತಿ ಸ್ನಾನ ಮಹಾ ಪೂಜೆ'",
      hi: "गोकर्ण में '27 तीर्थ जल गंडांत शांति महापूजा'",
      te: "గోకర్ణంలో 'గండాంత నక్షత్ర శాంతి స్నాన పూజ'",
      ta: "கோகர்ணத்தில் 'கண்டாந்த நட்சத்திர சாந்தி ஸ்நான பூஜை'",
      en: "Consecrated 27-Sacred Waters Gandanta / Moola Nakshatra Shanti at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಗೋಕರ್ಣದಲ್ಲಿ ನಕ್ಷತ್ರ ಶಾಂತಿ ಮತ್ತು ೨೭ ಬಾವಿಗಳ ನೀರಿನ ಶಾಂತಿ ಸ್ನಾನ ನೆರವೇರಿಸಿ.",
        "ಪ್ರತಿದಿನ ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಠಿಸಿ."
      ],
      hi: [
        "गंडांत शांति पूजा एवं संकल्प कराएं।",
        "गणेश अथर्वशीर्ष का नित्य पाठ करें।"
      ],
      te: [
        "గండాంత శాంతి చేయించండి.",
        "గణపతి ఆరాధన చేయండి."
      ],
      ta: [
        "கண்டாந்த சாந்தி பூஜை செய்யவும்.",
        "கணபதி வழிபாடு செய்யவும்."
      ],
      en: [
        "Perform classical 27-sacred waters Gandanta Snana ritual at Gokarna tirtha.",
        "Chant the Ganapati Atharvashirsha daily."
      ]
    }
  });

  // ==========================================================================
  // 12. DASHA-BHUKTI SANDHI DOSHA (ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ದೋಷ)
  // ==========================================================================
  const sandhiResult = detectDashaSandhiAlert(kundli, {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    gender: input.gender,
    devoteeName: input.name,
    referenceDate: currentDate
  });
  const sandhiAlert = sandhiResult.activeAlert || (sandhiResult.upcomingAlert && sandhiResult.upcomingAlert.daysRemainingOrUntil <= 180 ? sandhiResult.upcomingAlert : null);
  const isSandhiActive = sandhiAlert !== null;

  doshasList.push({
    id: "dasha_sandhi",
    name: {
      kn: sandhiAlert ? sandhiAlert.titleKn : "ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ (Dasha Sandhi)",
      hi: sandhiAlert ? (sandhiAlert.titleEn || "").replace("Alert", "दशा संधि") : "दशा संधि दोष (Dasha Sandhi)",
      te: sandhiAlert ? (sandhiAlert.titleEn || "").replace("Alert", "దశా సంధి") : "దశా సంధి దోషం (Dasha Sandhi)",
      ta: sandhiAlert ? (sandhiAlert.titleEn || "").replace("Alert", "திசா சந்தி") : "திசா சந்தி தோஷம் (Dasha Sandhi)",
      en: sandhiAlert ? sandhiAlert.titleEn : "Dasha-Bhukti Sandhi Transition"
    },
    category: "dasha_sandhi",
    isDetected: isSandhiActive,
    severity: isSandhiActive ? (sandhiAlert?.alertLevel === "critical" ? "critical" : "high") : "none",
    statusBadge: {
      kn: isSandhiActive ? `${sandhiAlert?.badgeKn || "ಸಕ್ರಿಯ"} (${sandhiAlert?.durationFormattedKn || ""})` : "ಸ್ಥಿರ ದಶಾ ಕಾಲ",
      hi: isSandhiActive ? "दशा संधि सक्रिय" : "स्थिर दशा काल",
      te: isSandhiActive ? "దశా సంధి నడుస్తోంది" : "స్థిర దశ",
      ta: isSandhiActive ? "திசா சந்தி காலம்" : "நிலைத்த திசை",
      en: isSandhiActive ? `${(sandhiAlert?.badgeEn || "ACTIVE").toUpperCase()} ACTIVE` : "STABLE DASHA PHASE"
    },
    technicalDetail: {
      houseNumbers: [],
      grahasInvolved: sandhiAlert ? [sandhiAlert.outgoingPlanet, sandhiAlert.incomingPlanet] : [],
      scripturalReference: "ಫಲದೀಪಿಕಾ, ದಶಾಫಲಾಧ್ಯಾಯ (Phaladeepika, Dasha Phala Adhyaya)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ದಶಾ ಸಂಧಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ ಹವನವೇ ರಕ್ಷಣೆಯಾಗಿದೆ.",
        en: "Requires propitiation during the twilight planetary transition window."
      }
    },
    technicalWhy: {
      kn: isSandhiActive && sandhiAlert
        ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${sandhiAlert.outgoingPlanetKn} ದಶೆ ಮುಗಿದು ${sandhiAlert.incomingPlanetKn} ದಶೆ ಪ್ರವೇಶಿಸುವ ಮಹತ್ವದ ದಶಾ ಸಂಧಿ ಕಾಲ ನಡೀತಿದೆ (ಅವಧಿ: ${sandhiAlert.startDateStr} ರಿಂದ ${sandhiAlert.endDateStr}). ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಎರಡು ಭಿನ್ನ ತತ್ತ್ವದ ಮಹಾದಶಾಧಿಪತಿಗಳ ಸಂಧಿಕಾಲವು ಜಾತಕನ ಜೀವನದಲ್ಲಿ ಮಾನಸಿಕ ತುಮುಲ, ವೃತ್ತಿ ದಿಕ್ಕಿನ ಬದಲಾವಣೆ ಮತ್ತು ಶಾರೀರಿಕ ಆಯಾಸವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.`
        : "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಸ್ವರೂಪದ ದಶಾ ಸಂಧಿಕಾಲವಿಲ್ಲ; ಮಹಾದಶೆ ಸ್ಥಿರವಾಗಿ ಮುಂದುವರಿಯುತ್ತಿದೆ.",
      hi: isSandhiActive && sandhiAlert
        ? `वर्तमान में ${sandhiAlert.outgoingPlanetEn} से ${sandhiAlert.incomingPlanetEn} की दशा में संक्रमण का संवेदनशील काल चल रहा है। दो विरोधी ऊर्जाओं के मिलन से जीवन में आकस्मिक परिवर्तन होते हैं।`
        : "वर्तमान में कोई गंभीर दशा संधि सक्रिय नहीं है।",
      te: isSandhiActive && sandhiAlert
        ? `ప్రస్తుతం ${sandhiAlert.outgoingPlanetEn} నుండి ${sandhiAlert.incomingPlanetEn} దశా సంధి కాలం నడుస్తోంది.`
        : "ప్రస్తుతం ఏ విధమైన తీవ్ర దశా సంధి కాలం లేదు; మహాదశ స్థిరంగా సాగుతోంది.",
      ta: isSandhiActive && sandhiAlert
        ? `தற்பொழுது திசா சந்தி காலம் நடைபெறுகிறது. கிரக ஆற்றல் மாறுபடும் காலம்.`
        : "தற்போது எவ்வித திசா சந்தி காலமும் இல்லை; மகாதிசை சுபமாகத் தொடர்கிறது.",
      en: isSandhiActive && sandhiAlert
        ? `Currently navigating the sensitive planetary junction between outgoing ${sandhiAlert.outgoingPlanetEn} and incoming ${sandhiAlert.incomingPlanetEn} (${sandhiAlert.startDateStr} to ${sandhiAlert.endDateStr}). Parashara dictums warn that intersecting Mahadashas of contrasting elemental signatures trigger psychic stress, career pivots, and health recalibrations.`
        : "Currently operating within a stable mid-cycle Dasha phase. No critical Dasha Sandhi transition active."
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆಗಳ ಗಡಿ ಸಂಧಿಕಾಲದಲ್ಲಿರುವುದರಿಂದ, ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ದಿಢೀರ್ ಸ್ಥಾನಪಲ್ಲಟ, ಹಳೆಯ ಯೋಜನೆಗಳು ಹಠಾತ್ ಸ್ಥಗಿತಗೊಂಡು ಹೊಸ ಯೋಜನೆಗಳಲ್ಲಿ ಅನಿಶ್ಚಿತತೆ, ಆಪ್ತ ಸ್ನೇಹಿತರಿಂದ ದೂರವಾಗುವುದು ಹಾಗೂ ಮಾನಸಿಕ ಅಸ್ವಸ್ಥತೆ ಕಾಡುತ್ತಿದೆ.",
      hi: "वर्तमान में दशा संधि के संवेदनशील काल के कारण कार्यक्षेत्र में अचानक परिवर्तन, पुरानी योजनाओं का ठप होना, निकट मित्रों से अलगाव तथा मानसिक दिशाहीनता की समस्या चल रही है।",
      te: "ప్రస్తుతం దశా సంధి ప్రభావం వల్ల ఉద్యోగంలో ఆకస్మిక మార్పులు, వ్యాపారంలో అస్థిరత మరియు సన్నిహితులు దూరమవడం వంటి సమస్యలు ఎదురవుతున్నాయి.",
      ta: "தற்போது திசா சந்தி காலம் என்பதால் வேலையில் திடீர் இடமாற்றம், தொழில் திட்டங்களில் முடக்கம் மற்றும் நண்பர்களிடையே பிரிவு போன்ற பிரச்சனைகள் ஏற்படுகின்றன.",
      en: "Currently caught in a turbulent planetary twilight zone triggering abrupt vocational realignments, disruption of longstanding associations, disorientation regarding next steps, and severe psychosomatic strain."
    },
    dashaResonance: {
      kn: sandhiAlert
        ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${sandhiAlert.outgoingPlanetKn} ನಿಂದ ${sandhiAlert.incomingPlanetKn} ಸಂಧಿಕಾಲ ನಡೆಯುತ್ತಿರುವುದರಿಂದ, ಎರಡು ಮಹಾಗ್ರಹಗಳ ಶಕ್ತಿಯು ಪರಸ್ಪರ ಘರ್ಷಿಸುತ್ತಿದೆ.`
        : `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${activeMahaKn} ಮಹಾದಶೆ ಸ್ಥಿರವಾಗಿ ಮುಂದುವರಿಯುತ್ತಿದ್ದು, ಯಾವುದೇ ಅಸ್ಥಿರ ಸಂಧಿ ದೋಷದ ಅಪಾಯವಿರುವುದಿಲ್ಲ.`,
      hi: sandhiAlert
        ? `वर्तमान में ${sandhiAlert.outgoingPlanetEn} से ${sandhiAlert.incomingPlanetEn} का संधि काल सक्रिय है।`
        : `वर्तमान में ${activeMahaPlanet} महादशा स्थिर रूप से संचालित है, किसी संधि दोष का प्रभाव नहीं है।`,
      te: sandhiAlert
        ? `ప్రస్తుతం ${sandhiAlert.outgoingPlanetEn} నుండి ${sandhiAlert.incomingPlanetEn} దశా సంధి నడుస్తోంది.`
        : `ప్రస్తుతం ${activeMahaPlanet} మహాదశ స్థిరంగా సాగుతోంది, సంధి దోష ప్రభావం లేదు.`,
      ta: sandhiAlert
        ? `தற்போது ${sandhiAlert.outgoingPlanetEn} முதல் ${sandhiAlert.incomingPlanetEn} வரை திசா சந்தி காலம் தீவிரமாக உள்ளது.`
        : `தற்போது ${activeMahaPlanet} மகாதிசை நிலைத்து இயங்குகிறது, சந்தி தோஷ பாதிப்பு இல்லை.`,
      en: sandhiAlert
        ? `Active transition from ${sandhiAlert.outgoingPlanetEn} to ${sandhiAlert.incomingPlanetEn} Mahadasha is creating energetic twilight friction.`
        : `Currently running stable ${activeMahaPlanet} Mahadasha with no turbulent transitional sandhi vulnerability.`
    },
    lifeImpact: {
      kn: isSandhiActive && sandhiAlert
        ? `${sandhiAlert.descriptionKn}

ಪ್ರಸ್ತುತ ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಆತುರದ ಹೂಡಿಕೆಗಳು, ಉದ್ಯೋಗ ಬದಲಾವಣೆ ಅಥವಾ ಕೌಟುಂಬಿಕ ವಿವಾದಗಳಿಂದ ದೂರವಿರುವುದು ಅತ್ಯಗತ್ಯ. ಶಾಸ್ತ್ರೋಕ್ತ ದಶಾ ಸಂಧಿ ಶಾಂತಿ ಮಾಡಿಸುವುದರಿಂದ ಹೊಸ ದಶೆಯು ಅತ್ಯಂತ ಮಂಗಳಕರವಾಗಿ ಪರಿಣಮಿಸಲಿದೆ.`
        : "ಪ್ರಸ್ತುತ ಗ್ರಹದಶಾ ಕಾಲವು ನಿಮ್ಮ ದೈನಂದಿನ ಕಾರ್ಯಗಳಿಗೆ ಪೂರಕವಾಗಿದೆ.",
      hi: isSandhiActive
        ? `दशा संधि काल में अनावश्यक जल्दबाजी से बचें। महादशा शांति से आगामी काल अत्यंत लाभकारी सिद्ध होगा।`
        : "दशा क्रम अनुकूल बना हुआ है।",
      te: isSandhiActive
        ? `ఈ సమయంలో సంయమనం పాటించడం మరియు శాంతి పూజలు చేయడం శ్రేయస్కరం.`
        : "గ్రహ స్థితి మరియు దశా గమనం దైనందిన పనులకు అనుకూలంగా ఉన్నాయి.",
      ta: isSandhiActive
        ? `நிதானமான முடிவுகளை எடுப்பது நல்லது. சாந்தி பூஜை சுப பலன்களைத் தரும்.`
        : "கிரக தசைகள் தங்களுக்குரிய பணிகளுக்கு நல் ஆதரவை நல்குகின்றன.",
      en: isSandhiActive && sandhiAlert
        ? `${sandhiAlert.descriptionEn}

Avoid impetuous vocational disruptions or speculative commitments during this threshold. Performing consecrated Dasha Sandhi Shanti transforms turbulent shifts into monumental new beginnings.`
        : "Planetary timeline flows smoothly without twilight junction frictions."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ದಶಾ ಸಂಧಿ ಶಾಂತಿ ಮಹಾ ಹವನ' (Dasha Sandhi Shanti Homa)",
      hi: "गोकर्ण में 'दशा संधि शांति महाहवन'",
      te: "గోకర్ణంలో 'దశా సంధి శాంతి మహాయజ్ఞం'",
      ta: "கோகர்ணத்தில் 'திசா சந்தி சாந்தி மகா ஹோமம்'",
      en: "Dasha Sandhi Shanti Maha Homa & Navagraha Propitiation at Gokarna Kshetra"
    },
    remedies: {
      kn: sandhiAlert ? sandhiAlert.recommendedShantiRemediesKn : ["ನಿತ್ಯ ನವಗ್ರಹ ಸ್ತೋತ್ರ ಪಠಿಸಿ."],
      hi: ["नित्य नवग्रह स्तोत्र का पाठ करें।", "शिव आराधना करें।"],
      te: ["నవగ్రహ స్తోత్రం చదవండి."],
      ta: ["நவக்கிரக ஸ்தோத்திரம் படிக்கவும்."],
      en: sandhiAlert ? sandhiAlert.recommendedShantiRemediesEn : ["Recite the Navagraha Stotram daily."]
    }
  });

  // ==========================================================================
  // 13. GOCHARA DOSHAS: SADE SATI & ASHTAMA SHANI (ಪ್ರಸ್ತುತ ಗೋಚಾರ ದೋಷಗಳು)
  // ==========================================================================
  const liveLongs = siderealLongitudes(currentDate, "lahiri", "true");
  const liveSaturnRashi = Math.floor(liveLongs.saturn / 30);
  const liveSaturnHouseFromMoon = ((liveSaturnRashi - moonRashiIdx + 12) % 12) + 1;

  let isSadeSati = false;
  let sadeSatiPhaseKn = "";
  let sadeSatiPhaseEn = "";

  if (liveSaturnHouseFromMoon === 12) {
    isSadeSati = true;
    sadeSatiPhaseKn = "ಮೊದಲ ಹಂತ (ಆದಿಸಾಡೇಸಾತಿ - ೧೨ನೇ ವ್ಯಯ ಶನಿ)";
    sadeSatiPhaseEn = "Rising Phase (12th Vyaya Shani)";
  } else if (liveSaturnHouseFromMoon === 1) {
    isSadeSati = true;
    sadeSatiPhaseKn = "ಎರಡನೇ ಹಂತ (ಜನ್ಮಸಾಡೇಸಾತಿ - ಜನ್ಮ ಶನಿ)";
    sadeSatiPhaseEn = "Peak Phase (Janma Shani over natal Moon)";
  } else if (liveSaturnHouseFromMoon === 2) {
    isSadeSati = true;
    sadeSatiPhaseKn = "ಅಂತಿಮ ಹಂತ (ಅಂತ್ಯಸಾಡೇಸಾತಿ - ೨ನೇ ಧನ ಶನಿ)";
    sadeSatiPhaseEn = "Setting Phase (2nd Dhana Shani)";
  }

  const isAshtamaShani = liveSaturnHouseFromMoon === 8;
  const isKantakaShani = liveSaturnHouseFromMoon === 4;

  const isGocharaAfflicted = isSadeSati || isAshtamaShani || isKantakaShani;
  const gocharaSeverity: DoshaSeverity = isAshtamaShani ? "critical" : isSadeSati ? "high" : isKantakaShani ? "moderate" : "none";

  doshasList.push({
    id: "gochara_shani",
    name: {
      kn: isAshtamaShani
        ? "ಅಷ್ಟಮ ಶನಿ ಗೋಚಾರ (Ashtama Shani)"
        : isSadeSati
        ? `ಸಾಡೇಸಾತಿ ಶನಿ - ${sadeSatiPhaseKn}`
        : isKantakaShani
        ? "ಕಂಟಕ ಶನಿ ಗೋಚಾರ (Kantaka Shani)"
        : "ಶನಿ ಗೋಚಾರ ದೋಷ (Saturn Transit)",
      hi: isAshtamaShani
        ? "अष्टम शनि गोचर (Ashtama Shani)"
        : isSadeSati
        ? `साढ़ेसाती शनि - ${sadeSatiPhaseEn}`
        : "शनि गोचर प्रभाव (Saturn Transit)",
      te: isAshtamaShani ? "అష్టమ శని గోచారం" : isSadeSati ? "సాడేసాతి శని" : "శని గోచారం",
      ta: isAshtamaShani ? "அஷ்டம சனி" : isSadeSati ? "ஏழரை சனி" : "சனி பெயர்ச்சி",
      en: isAshtamaShani ? "Ashtama Shani Transit (8th Saturn)" : isSadeSati ? `Sade Sati Saturn (${sadeSatiPhaseEn})` : "Saturn Transit"
    },
    category: "gochara",
    isDetected: isGocharaAfflicted,
    severity: gocharaSeverity,
    statusBadge: {
      kn: isGocharaAfflicted ? (isAshtamaShani ? "ತೀವ್ರ ಅಷ್ಟಮ ಶನಿ" : "ಸಕ್ರಿಯ ಶನಿ ಗೋಚಾರ") : "ಶುಭ ಶನಿ ಗೋಚಾರ",
      hi: isGocharaAfflicted ? "सक्रिय शनि प्रभाव" : "शुभ शनि गोचर",
      te: isGocharaAfflicted ? "శని గోచారం నడుస్తోంది" : "శుభ గోచారం",
      ta: isGocharaAfflicted ? "சனி தாக்கம் உள்ளது" : "சுப கோசாரம்",
      en: isGocharaAfflicted ? (isAshtamaShani ? "CRITICAL ASHTAMA SHANI" : "ACTIVE SADE SATI") : "BENEFIC SATURN TRANSIT"
    },
    technicalDetail: {
      houseNumbers: [liveSaturnHouseFromMoon],
      grahasInvolved: ["Saturn (Live Transit)"],
      grahaDegrees: [{ name: "Live Saturn", rashi: RASHI_NAMES_EN[liveSaturnRashi], degreeFormatted: formatDegMin(liveLongs.saturn) }],
      scripturalReference: "ಬೃಹತ್ ಸಂಹಿತಾ & ಗೋಚಾರ ಫಲಾದ್ಯಾಯ (Brihat Samhita & Gochara Phala)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ಶನಿ ಪ್ರೀತಿಗಾಗಿ ತೈಲಾಭಿಷೇಕ ಮತ್ತು ದಶರಥ ಶನಿ ಸ್ತೋತ್ರವೇ ರಕ್ಷಣೆಯಾಗಿದೆ.",
        en: "Harmonized through Saturday sesame oil lighting and Dasharatha Shani Stotram."
      }
    },
    technicalWhy: {
      kn: isGocharaAfflicted
        ? `ಪ್ರಸ್ತುತ ಶನಿ ಭಗವಾನರು ಖಗೋಳದಲ್ಲಿ ${RASHI_NAMES_KN[liveSaturnRashi]} ರಾಶಿಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${RASHI_NAMES_KN[moonRashiIdx]} ದಿಂದ ನಿಖರವಾಗಿ ${liveSaturnHouseFromMoon}ನೇ ಭಾವದಲ್ಲಿದ್ದಾರೆ. ಶಾಸ್ತ್ರದಂತೆ ಇದು ${isAshtamaShani ? "ಅತ್ಯಂತ ಕಠಿಣವಾದ 'ಅಷ್ಟಮ ಶನಿ'" : isSadeSati ? `'ಸಾಡೇಸಾತಿ ಶನಿಯ ${sadeSatiPhaseKn}'` : "'ಕಂಟಕ ಶನಿ'"} ಯಾಗಿದ್ದು, ಕರ್ಮದ ಕಠಿಣ ಪರೀಕ್ಷೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`
        : `ಪ್ರಸ್ತುತ ಶನಿಯು ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರನಿಂದ ${liveSaturnHouseFromMoon}ನೇ ಅನುಕೂಲಕರ ಭಾವದಲ್ಲಿದ್ದು, ಯಾವುದೇ ಸಾಡೇಸಾತಿ ಅಥವಾ ಅಷ್ಟಮ ಶನಿ ಬಾಧೆ ಇರುವುದಿಲ್ಲ.`,
      hi: isGocharaAfflicted
        ? `वर्तमान में गोचर के शनि आपकी जन्म चंद्र राशि (${RASHI_NAMES_EN[moonRashiIdx]}) से ${liveSaturnHouseFromMoon}वें भाव में भ्रमण कर रहे हैं, जो ${isAshtamaShani ? "अष्टम शनि" : "साढ़ेसाती"} की स्थिति निर्मित करता है।`
        : "शनि का गोचर वर्तमान में अनुकूल है।",
      te: isGocharaAfflicted
        ? `ప్రస్తుతం శని మీ జన్మ చంద్ర రాశి నుండి ${liveSaturnHouseFromMoon}వ స్థానంలో సంచరిస్తున్నారు.`
        : "ప్రస్తుతం శని భగవానుడు జన్మ చంద్రుని నుండి అనుకూల స్థానంలో ఉండి, సాడేసాతి లేదా అష్టమ శని ప్రభావం లేదు.",
      ta: isGocharaAfflicted
        ? `தற்பொழுது சனி பகவான் உங்கள் சந்திர ராசியிலிருந்து ${liveSaturnHouseFromMoon} ஆம் இடத்தில் சஞ்சரிக்கிறார்.`
        : "தற்போது சனி பகவான் சந்திர ராசிக்கு சாதகமான இடத்தில் உள்ளதால் ஏழரை சனி அல்லது அஷ்டம சனி தாக்கம் இல்லை.",
      en: isGocharaAfflicted
        ? `Live astronomical Saturn is transiting ${RASHI_NAMES_EN[liveSaturnRashi]}, which falls in the ${liveSaturnHouseFromMoon}th house counted from your natal Moon sign (${RASHI_NAMES_EN[moonRashiIdx]}). Parashara principles classify this as ${isAshtamaShani ? "critical Ashtama Shani" : `Sade Sati (${sadeSatiPhaseEn})`}.`
        : `Current transiting Saturn resides in the auspicious ${liveSaturnHouseFromMoon}th house from natal Moon; no Sade Sati or Ashtama Shani affliction.`
    },
    currentLifeProblems: {
      kn: "ಪ್ರಸ್ತುತ ಶನಿಯ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಚೇರಿಯಲ್ಲಿ ವಿಪರೀತ ಕೆಲಸದ ಒತ್ತಡ, ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅಸಮಾಧಾನ, ಸಾಲದ ಹೊರೆ ತೀರಿಸುವಲ್ಲಿ ತಡ, ಆರೋಗ್ಯದಲ್ಲಿ ನಿಶ್ಯಕ್ತಿ ಹಾಗೂ ಪ್ರತಿಯೊಂದು ಕೆಲಸಕ್ಕೂ ಎರಡರಷ್ಟು ಶ್ರಮ ಪಡಬೇಕಾದ ಪರಿಸ್ಥಿತಿ ನಿರ್ಮಾಣವಾಗಿದೆ.",
      hi: "वर्तमान में गोचर शनि के प्रभाव से कार्यस्थल पर अत्यधिक दबाव, उच्चाधिकारियों की नाराजगी, ऋण चुकाने में कठिनाई, अत्यधिक शारीरिक थकान तथा हर कार्य में दोगुना विलंब का सामना करना पड़ रहा है।",
      te: "ప్రస్తుతం శని గోచారం వలన విపరీతమైన పని ఒత్తిడి, అధికారులతో ఇబ్బందులు, రుణ భారం మరియు శారీరక నీరసం వంటి సమస్యలు తీవ్రంగా ఉన్నాయి.",
      ta: "தற்போது கோசார சனியின் தாக்கத்தால் வேலையில் அதிக பணிச்சுமை, மேலதிகாரிகளுடன் மனக்கசப்பு, கடன் சுமை மற்றும் தீவிர உடல் சோர்வு போன்ற பிரச்சனைகள் நிலவுகின்றன.",
      en: "Currently subjected to crushing workplace burdens under relentless oversight, debt servicing anxieties, severe musculoskeletal lethargy, and a grueling feeling that every single step demands double the labor."
    },
    dashaResonance: buildDashaResonance([PN.Saturn], "ಶನಿ ಗೋಚಾರ ದೋಷ"),
    lifeImpact: {
      kn: isGocharaAfflicted
        ? `ಈ ಶನಿ ಗೋಚಾರದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೆಲಸದ ಒತ್ತಡ ಹೆಚ್ಚಾಗುವುದು, ಫಲಿತಾಂಶಗಳಲ್ಲಿ ವಿಳಂಬ, ಹಿರಿಯರೊಂದಿಗೆ ಜವಾಬ್ದಾರಿಗಳ ಹಂಚಿಕೆ ಹಾಗೂ ಶಾರೀರಿಕ ಆಯಾಸ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಆತುರದ ಅಥವಾ ಅನೈತಿಕ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬಾರದು.

ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸುವುದು, ದಶರಥ ಪ್ರೋಕ್ತ ಶನಿ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಹಾಗೂ ನಿರ್ಗತಿಕರಿಗೆ ಸಹಾಯ ಮಾಡುವುದರಿಂದ ಶನಿಯ ಕೃಪೆಯು ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ದೀರ್ಘಾವಧಿಯ ಶಾಶ್ವತ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸಲಿದೆ.`
        : "ಗೋಚಾರ ಗ್ರಹಗಳು ನಿಮ್ಮ ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳಿಗೆ ಪೂರ್ಣ ಬೆಂಬಲ ನೀಡುತ್ತಿವೆ.",
      hi: isGocharaAfflicted
        ? `कार्यभार में वृद्धि, अनावश्यक विलंब तथा धैर्य की परीक्षा हो सकती है। शनिवार को तिल के तेल का दीपक जलाएं और निर्धनों की सेवा करें।`
        : "दैनिक जीवन में स्थिरता बनी रहेगी।",
      te: isGocharaAfflicted
        ? `పనులలో ఆలస్యం, శ్రమ పెరగడం జరుగుతుంది. శని స్తోత్రం చదవడం మంచిది.`
        : "గోచార గ్రహాలు అనుకూలంగా ఉండి అన్ని పనులలో విజయాన్ని చేకూరుస్తాయి.",
      ta: isGocharaAfflicted
        ? `பணிச்சுமை அதிகரிக்கலாம். சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றி வழிபடவும்.`
        : "கோசார கிரகங்கள் தங்கள் முன்னேற்றத்திற்குப் பூரண ஆதரவு தருகின்றன.",
      en: isGocharaAfflicted
        ? `Demands meticulous discipline, patient perseverance under workplace loads, and emotional forbearance. Not a phase for speculative shortcuts.

Lighting sesame oil lamps on Saturdays and maintaining unshakeable ethics converts Saturn's testing pressure into unbreakable worldly security.`
        : "Celestial transits currently reinforce vocational progress."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ಶನಿ ಶಾಂತಿ ಮಹಾ ಪೂಜೆ' & 'ತೈಲಾಭಿಷೇಕ'",
      hi: "गोकर्ण में 'शनि शांति महापूजा एवं तैलाभिषेक'",
      te: "గోకర్ణంలో 'శని శాంతి పూజ'",
      ta: "கோகர்ணத்தில் 'சனி சாந்தி பூஜை மற்றும் தைலாபிஷேகம்'",
      en: "Shani Shanti Maha Puja & Sacred Tailabhishekam at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ ಅಶ್ವತ್ಥ ವೃಕ್ಷದ ಬಳಿ ಅಥವಾ ನವಗ್ರಹ ಸನ್ನಿಧಿಯಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ.",
        "ಶ್ರೀ ದಶರಥ ಕೃತ ಶನಿ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ.",
        "ಕಪ್ಪು ಎಳ್ಳು, ಕಪ್ಪು ವಸ್ತ್ರ ಅಥವಾ ಕಬ್ಬಣದ ಸಾಮಗ್ರಿಗಳನ್ನು ದಾನ ಮಾಡಿ."
      ],
      hi: [
        "प्रत्येक शनिवार को पीपल के वृक्ष के नीचे तिल के तेल का दीपक जलाएं।",
        "दशरथ कृत शनि स्तोत्र का नियमित पाठ करें।",
        "काले तिल, कंबल अथवा लोहे का दान करें।"
      ],
      te: [
        "శనివారం రావి చెట్టు వద్ద నువ్వుల నూనెతో దీపం వెలిగించండి.",
        "దశరథ ప్రోక్త శని స్తోత్రం చదవండి."
      ],
      ta: [
        "சனிக்கிழமைகளில் அரச மரத்தடியில் நல்லெண்ணெய் தீபம் ஏற்றவும்.",
        "தசரத சனி ஸ்தோத்திரம் படிக்கவும்."
      ],
      en: [
        "Light a sesame oil lamp near a sacred Peepal tree or Navagraha sanctum on Saturday evenings.",
        "Recite the Dasharatha Shani Stotram daily.",
        "Donate black sesame seeds, warm blankets, and iron implements to the elderly."
      ]
    }
  });

  // Calculate summary score
  const activeDoshas = doshasList.filter((d) => d.isDetected);
  const criticalCount = activeDoshas.filter((d) => d.severity === "critical").length;
  const highCount = activeDoshas.filter((d) => d.severity === "high").length;
  const moderateCount = activeDoshas.filter((d) => d.severity === "moderate").length;
  const mildCount = activeDoshas.filter((d) => d.severity === "mild").length;

  const karmicIndexScore = Math.min(100, criticalCount * 30 + highCount * 20 + moderateCount * 10 + mildCount * 5);

  const gandantaraAndBhaya = calculateGandantaraAndBhaya(kundli, input, currentDate);

  return {
    devoteeInfo: {
      name: input.name || "Devotee",
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      place: input.pincode || "India",
      lagnaRashi: kundli.lagnaRashi.english,
      moonRashi: moon ? moon.rashi.english : "Unknown",
      nakshatra: moon?.nakshatra?.english || "Unknown",
      pada: kundli.moonPada || 1,
      currentDashaStr: `${activeMahaPlanet} / ${activeBhuktiPlanet}`,
      runningMahaPlanet: activeMahaPlanet,
      runningBhuktiPlanet: activeBhuktiPlanet
    },
    summary: {
      totalEvaluated: doshasList.length,
      totalActive: activeDoshas.length,
      criticalCount,
      highCount,
      moderateCount,
      mildCount,
      karmicIndexScore
    },
    doshas: doshasList,
    activeSandhiAlert: sandhiAlert,
    gandantaraAndBhaya,
    calculatedAt: new Date().toISOString()
  };
}
