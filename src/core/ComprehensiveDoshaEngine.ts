/**
 * ComprehensiveDoshaEngine.ts
 *
 * 100% Authentic Vedic Parashari Dosha & Parihara Computation Engine
 *
 * Evaluates and detects all major Vedic Doshas with precise technical astrological justifications ("Why"):
 * 1. Pitru Dosha (ಪಿತೃ ದೋಷ / पितृ दोष) - 9th / 5th house afflictions, Surya-Rahu/Shani, 9th lord in Dusthana
 * 2. Narayana Bali Dosha / Pretha Badha (ನಾರಾಯಣ ಬಲಿ ದೋಷ / नारायण बली दोष) - 5th house curse, Putra dosha, Gulika
 * 3. Kala Sarpa Dosha (ಕಾಳ ಸರ್ಪ ದೋಷ / कालसर्प दोष) - 12 classical types based on Rahu's house
 * 4. Guru Chandala Dosha (ಗುರು ಚಂಡಾಲ ದೋಷ / गुरु चांडाल दोष) - Guru-Rahu conjunction / aspect
 * 5. Balarishta Dosha (ಬಾಲಾರಿಷ್ಟ ದೋಷ / बालारिष्ट दोष) - Infant health vulnerabilities & Bhanga (cancellation)
 * 6. Balyagraha Dosha (ಬಾಲ್ಯಗ್ರಹ ದೋಷ / बाल्यग्रह पीड़ा) - Affliction of Mercury/Moon/Gulika
 * 7. Kuja / Manglik Dosha (ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ / मांगलिक दोष) - 1, 2, 4, 7, 8, 12 houses from Lagna/Moon + Bhanga
 * 8. Dasha-Bhukti Sandhi Dosha (ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ದೋಷ) - Rahu-Brihaspati, Shukraditya, Shani-Budha, etc.
 * 9. Gochara Doshas (ಪ್ರಸ್ತುತ ಗೋಚಾರ ದೋಷಗಳು) - Live Sade Sati, Ashtama Shani, Kantaka Shani, Anishta Guru
 * 10. Grahan Dosha (ಗ್ರಹಣ ದೋಷ) - Surya / Chandra Grahan with Rahu/Ketu
 * 11. Shrapit Dosha (ಶ್ರಪಿತ ದೋಷ) - Shani-Rahu conjunction / mutual aspect
 * 12. Kemadruma Dosha (ಕೇಮದ್ರುಮ ದೋಷ) - Moon isolated without flanking planets + Bhanga
 *
 * Fully localized across 5 languages: Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), English (en).
 */

import type { KundliInput, KundliOutput, PlanetName, PlanetPosition } from "./AstroTypes";
import { PlanetName as PN } from "./AstroTypes";
import { normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import { detectDashaSandhiAlert, type DashaSandhiAlert } from "./DashaSandhiAndRoadmapEngine";
import { rashiIndexInHouse, signLord } from "./KundliInsightsEngine";

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
  return `${d}°${m.toString().padStart(2, "0")}'`;
};

/**
 * Computes the 12 classical Kala Sarpa types based on Rahu's house from Lagna.
 */
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
  { id: "sheshnaga", house: 12, en: "Sheshnaga Kala Sarpa", kn: "ಶೇಷನಾಗ ಕಾಳಸರ್ಪ", hi: "शेषनाग कालसर्प", te: "శేషనాగ కాలసర్ప", ta: "சேஷநாக காலசர்ப்ப" },
];

/**
 * Main evaluation function to compute all 12 Doshas with strict Parashari technical integrity.
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
      kn: isPitruActive ? (pitruSeverity === "critical" ? "ಅತ್ಯುಗ್ರ ಪಿತೃದೋಷ" : "ಸಕ್ರಿಯ ಪಿತೃದೋಷ") : "ನಿರ್ದೋಷ (ದೋಷವಿಲ್ಲ)",
      hi: isPitruActive ? (pitruSeverity === "critical" ? "अति तीव्र पितृदोष" : "सक्रिय पितृदोष") : "दोष रहित",
      te: isPitruActive ? "సక్రియ పితృదోషం" : "దోష రహితం",
      ta: isPitruActive ? "பித்ரு தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isPitruActive ? `${pitruSeverity.toUpperCase()} PITRU DOSHA` : "NO PITRU DOSHA"
    },
    technicalDetail: {
      houseNumbers: Array.from(new Set(pitruHouses)),
      grahasInvolved: Array.from(new Set(pitruGrahas)),
      scripturalReference: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಕರ್ಮವಿಪಾಕ ಅಧ್ಯಾಯ ೮೪ (Brihat Parashara Hora Shastra, Ch. 84)",
      hasBhangaOrMitigation: jupiter !== undefined && (jupiter.house === 9 || jupiter.house === 1 || jupiter.house === 5),
      bhangaDescription: {
        kn: jupiter && (jupiter.house === 9 || jupiter.house === 1 || jupiter.house === 5)
          ? "ಗುರುವು ಕೇಂದ್ರ ಅಥವಾ ತ್ರಿಕೋಣದಲ್ಲಿದ್ದು ಪಿತೃ ಸ್ಥಾನವನ್ನು ವೀಕ್ಷಿಸುವುದರಿಂದ ದೋಷದ ತೀವ್ರತೆ ಶೇ.೪೦ ರಷ್ಟು ಕಡಿಮೆಯಾಗಿದೆ."
          : "ದೋಷಕ್ಕೆ ಯಾವುದೇ ಪರಿಹಾರಕ ಶುಭ ದೃಷ್ಟಿ ಕಂಡುಬಂದಿಲ್ಲ.",
        en: jupiter && (jupiter.house === 9 || jupiter.house === 1 || jupiter.house === 5)
          ? "Jupiter's auspicious aspect on the 9th/5th house mitigates ~40% of the malefic intensity."
          : "No primary benefic Jupiterian mitigation identified."
      }
    },
    technicalWhy: {
      kn: isPitruActive
        ? `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಪಿತೃ ದೋಷ ಉಂಟಾಗಲು ಶಾಸ್ತ್ರೀಯ ಖಗೋಳ ಕಾರಣಗಳು: ${pitruReasonsKn.join(" ")} ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ೯ನೇ ಮನೆಯು ಪಿತೃ, ಧರ್ಮ ಮತ್ತು ವಂಶ ವೃದ್ಧಿಯ ಸ್ಥಾನವಾಗಿದ್ದು, ಇಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ರಾಹು-ಶನಿಗಳ ಪ್ರತಿಕೂಲ ಸ್ಥಿತಿಯು ಪೂರ್ವಜರ ಕಡೆಯ ಕರ್ಮ ಋಣವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಿರ್ದೇಶಿಸುತ್ತದೆ.`
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
    lifeImpact: {
      kn: isPitruActive
        ? `ಈ ಪಿತೃದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಜೀವನದ ಪ್ರಮುಖ ಹಂತಗಳಲ್ಲಿ ನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕೈತಪ್ಪುವುದು, ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಸ್ಥಗಿತತೆ, ಆರ್ಥಿಕ ಉಳಿತಾಯದಲ್ಲಿ ಕೊರತೆ ಹಾಗೂ ಹಿರಿಯರ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರುಗಳು ಎದುರಾಗಬಹುದು. ಕುಟುಂಬದೊಳಗೆ ಅನಗತ್ಯ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಮೂಡುವುದು ಮತ್ತು ಮನಸ್ಸಿನಲ್ಲಿ ಅಜ್ಞಾತ ಅಸಮಾಧಾನ ಕಾಡುವುದು ಇದರ ಪ್ರಮುಖ ಲಕ್ಷಣವಾಗಿದೆ.\n\nಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ನೀವು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಶ್ರಮಿಸಿದರೂ ಅದಕ್ಕೆ ತಕ್ಕ ಗೌರವ ತಡವಾಗಿ ದೊರೆಯುತ್ತಿದೆ. ವಂಶ ಪಾರಂಪರ್ಯವಾಗಿ ಬರಬೇಕಾದ ಆಸ್ತಿ ಅಥವಾ ಸವಲತ್ತುಗಳಲ್ಲಿ ಕಾನೂನು ಅಡೆತಡೆಗಳು ಬಾರದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಮತ್ತು ಹಿರಿಯರ ಹೆಸರಿನಲ್ಲಿ ತರ್ಪಣ ಹಾಗೂ ಸತ್ಕರ್ಮಗಳನ್ನು ಆಚರಿಸುವುದು ನಿಮ್ಮ ಎಲ್ಲಾ ಕಾರ್ಯಗಳಲ್ಲಿ ಹೊಸ ಚೈತನ್ಯವನ್ನು ತರಲಿದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೇವತೆಗಳ ಆಶೀರ್ವಾದ ಪರಿಪೂರ್ಣವಾಗಿದ್ದು, ವಂಶಾಭಿವೃದ್ಧಿ ಮತ್ತು ಸಕಾಲಿಕ ಭಾಗ್ಯೋದಯಕ್ಕೆ ದೈವಿಕ ಬೆಂಬಲವಿದೆ.",
      hi: isPitruActive
        ? `इस पितृ दोष के कारण जीवन के महत्वपूर्ण अवसरों पर अंतिम क्षण में रुकावटें, व्यावसायिक उन्नति में मंदी, आर्थिक बचत में अस्थिरता तथा परिजनों के स्वास्थ्य को लेकर चिंताएं उत्पन्न हो सकती हैं।\n\nवर्तमान समय में आपके परिश्रम का उचित प्रतिफल मिलने में विलंब हो रहा है। नियमित तर्पण, पूर्वजों के निमित्त दान एवं सात्विक जीवन शैली से इस दोष के समस्त अवरोध दूर होकर स्थायी समृद्धि प्राप्त होती है।`
        : "आपकी कुंडली में पितरों की पूर्ण कृपा है। पारिवारिक सुख एवं भाग्योदय निर्बाध रूप से प्राप्त होगा।",
      te: isPitruActive
        ? `ఈ పితృ దోషం వలన ముఖ్యమైన పనులలో చివరి నిమిషంలో ఆటంకాలు, వృత్తిలో మందగమనం మరియు కుటుంబంలో అశాంతి కలగవచ్చు.\n\nప్రస్తుతం మీ కష్టానికి తగిన గుర్తింపు లభించడంలో ఆలస్యం జరుగుతోంది. అమావాస్య తర్పణాలు మరియు గోకర్ణ తిలహోమం వంటి శాంతులు ఆచరించడం ద్వారా ఈ ప్రతికూలతలు తొలగిపోయి వంశాభివృద్ధి కలుగుతుంది.`
        : "మీ జాతకంలో పితృదేవతల సంపూర్ణ అనుగ్రహం ఉంది.",
      ta: isPitruActive
        ? `இந்த பித்ரு தோஷத்தால் காரியங்களில் கடைசி நேரத் தடைகள், தொழில் முன்னேற்றத்தில் சுணக்கம் மற்றும் குடும்ப அமைதியின்மை ஏற்படக்கூடும்.\n\nஅமாவாசை தோறும் முன்னோர்களுக்குத் தர்ப்பணம் செய்வதும், கோகர்ண திலஹோமம் செய்வதும் சகல தடைகளையும் நீக்கி நல்வாழ்வைத் தரும்.`
        : "உங்கள் ஜாதகத்தில் முன்னோர்களின் பரிபூரண ஆசி உள்ளது.",
      en: isPitruActive
        ? `In day-to-day reality, Pitru Dosha manifests as sudden threshold bottlenecks where promising professional or academic initiatives face eleventh-hour stalls. Financial accumulation feels intermittent, and domestic cohesion requires deliberate patience.\n\nIn your current life phase, this ancestral debt creates psychological friction and delayed recognition of honest labor. Performing scriptural propitiations releases trapped ancestral blessings, restoring vocational acceleration and generational peace.`
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
        "ನಿತ್ಯ ಸೂರ್ಯೋದಯ ಸಮಯದಲ್ಲಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ನೀಡಿ 'ಶ್ರೀ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ' ಪಠಿಸಿ.",
        "ವೃದ್ಧಾಶ್ರಮಗಳಿಗೆ ಅಥವಾ ಬಡ ಬ್ರಾಹ್ಮಣರಿಗೆ ಗೋಧಿ, ಬೆಲ್ಲ ಮತ್ತು ತಾಮ್ರದ ಪಾತ್ರೆಗಳನ್ನು ದಾನ ಮಾಡಿ."
      ],
      hi: [
        "प्रत्येक अमावस्या को पितरों के नाम से काले तिल, जल एवं भोजन का तर्पण करें।",
        "तांबे के लोटे से सूर्य को जल अर्पित कर नित्य 'आदित्य हृदय स्तोत्र' का पाठ करें।",
        "निर्धनों एवं गौमाता को गेहूं और गुड़ का नियमित रूप से दान करें।"
      ],
      te: [
        "ప్రతి అమావాస్యకు పితృదేవతలకు తర్పణం వదలడం మరియు గోవులకు అన్నం తినిపించడం.",
        "సూర్యోదయ సమయంలో సూర్య భగవానునికి అర్ఘ్యం సమర్పించి 'ఆదిత్య హృదయ స్తోత్రం' పఠించడం.",
        "గోధుమలు, బెల్లం నిరుపేదలకు దానం చేయడం."
      ],
      ta: [
        "அமாவாசை தோறும் முன்னோர்களை நினைத்து காகத்திற்கு உணவிடவும்.",
        "தினசரி சூரிய நமஸ்காரம் செய்து ஆதித்ய ஹிருதய ஸ்தோத்திரம் பாராயணம் செய்யவும்.",
        "ஏழைகளுக்கு கோதுமை, வெல்லம் தானம் செய்யவும்."
      ],
      en: [
        "Offer Tarpana and feed cows and birds with sesame rice on every Amavasya (New Moon).",
        "Offer water to the rising Sun in a copper vessel daily while reciting the Aditya Hridaya Stotra.",
        "Distribute wheat, organic jaggery, and copper utensils to elderly caregivers and Vedic priests."
      ]
    }
  });

  // ==========================================================================
  // 2. NARAYANA BALI DOSHA / PRETHA BADHA (ನಾರಾಯಣ ಬಲಿ ದೋಷ / नारायण बली दोष)
  // ==========================================================================
  const narayanaReasonsKn: string[] = [];
  const narayanaReasonsEn: string[] = [];
  const narayanaHouses: number[] = [];
  const narayanaGrahas: string[] = [];

  // 5th house afflicted by Rahu/Ketu/Saturn with 5th lord in dusthana
  if (rahu && rahu.house === 5) {
    narayanaHouses.push(5);
    narayanaGrahas.push("Rahu");
    narayanaReasonsKn.push("ಸಂತಾನ ಹಾಗೂ ಪೂರ್ವರೀತ್ಯಾ ೫ನೇ ಮನೆಯಲ್ಲಿ ಛಾಯಾಗ್ರಹ ರಾಹು ನೆಲೆಸಿ ಸರ್ಪ ಶಾಪ ಅಥವಾ ವಂಶಿಕ ಬಲಿದೋಷದ ಲಕ್ಷಣ ಸೂಚಿಸಿರುವುದು.");
    narayanaReasonsEn.push("Shadow node Rahu afflicts the 5th house of lineage (Putra Bhava), generating classical Sarpa Shapa / Narayana Bali indications.");
  }
  if (ketu && ketu.house === 5) {
    narayanaHouses.push(5);
    narayanaGrahas.push("Ketu");
    narayanaReasonsKn.push("೫ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು ಸ್ಥಿತನಾಗಿ ಸಂತಾನ ಸಂಕಷ್ಟ ಮತ್ತು ಪೂರ್ವ ಸಂಚಿತ ಕರ್ಮಿಕ ಕಟ್ಟುಪಾಡುಗಳನ್ನು ಸೃಷ್ಟಿಸಿರುವುದು.");
    narayanaReasonsEn.push("Ketu placed in the 5th house indicates deep ancestral detachment and unresolved karmic knots.");
  }
  if (fifthLord && (fifthLord.house === 6 || fifthLord.house === 8 || fifthLord.house === 12)) {
    narayanaHouses.push(fifthLord.house);
    narayanaGrahas.push(fifthLord.name);
    narayanaReasonsKn.push(`೫ನೇ ಪಂಚಮಾಧಿಪತಿ ${fifthLord.name} ತ್ರಿಕ ಭಾವವಾದ ${fifthLord.house}ನೇ ಮನೆಯಲ್ಲಿ ದುರ್ಬಲನಾಗಿರುವುದು.`);
    narayanaReasonsEn.push(`5th house lord ${fifthLord.name} is debilitated or trapped in the ${fifthLord.house}th Dusthana.`);
  }
  if (jupiter && (jupiter.house === 6 || jupiter.house === 8) && rahu && jupiter.rashi.index === rahu.rashi.index) {
    narayanaHouses.push(jupiter.house);
    narayanaGrahas.push("Jupiter", "Rahu");
    narayanaReasonsKn.push(`ಪುತ್ರಕಾರಕ ಗುರು ಮತ್ತು ರಾಹು ${jupiter.house}ನೇ ಮನೆಯಲ್ಲಿ ಯುತಿ ಹೊಂದಿ ಗುರುಚಂಡಾಲ ನಾರಾಯಣಬಲಿ ಪರಿಸ್ಥಿತಿ ತಂದಿರುವುದು.`);
    narayanaReasonsEn.push(`Putrakaraka Jupiter is conjunct Rahu in the malefic ${jupiter.house}th house.`);
  }

  const isNarayanaActive = narayanaReasonsKn.length >= 1;
  const narayanaSeverity: DoshaSeverity =
    narayanaReasonsKn.length >= 2 ? "critical" : narayanaReasonsKn.length === 1 ? "high" : "none";

  doshasList.push({
    id: "narayana_bali",
    name: {
      kn: "ನಾರಾಯಣ ಬಲಿ ದೋಷ (Narayana Bali Dosha)",
      hi: "नारायण बली दोष (Narayana Bali Dosha)",
      te: "నారాయణ బలి దోషం (Narayana Bali Dosha)",
      ta: "நாராயண பலி தோஷம் (Narayana Bali Dosha)",
      en: "Narayana Bali Dosha (Unresolved Ancestral Liberation Deficit)"
    },
    category: "natal",
    isDetected: isNarayanaActive,
    severity: narayanaSeverity,
    statusBadge: {
      kn: isNarayanaActive ? "ಶಾಂತಿ ಅಗತ್ಯ (Pooja Required)" : "ದೋಷ ಮುಕ್ತ (Free)",
      hi: isNarayanaActive ? "शांति अनुष्ठान आवश्यक" : "दोष रहित",
      te: isNarayanaActive ? "శాంతి అవసరం" : "దోషం లేదు",
      ta: isNarayanaActive ? "சாந்தி தேவை" : "தோஷமில்லை",
      en: isNarayanaActive ? "VEDIC SHANTI REQUIRED" : "UNAFFLICTED"
    },
    technicalDetail: {
      houseNumbers: Array.from(new Set(narayanaHouses)),
      grahasInvolved: Array.from(new Set(narayanaGrahas)),
      scripturalReference: "ಗರುಡ ಪುರಾಣ & ನಾರಾಯಣ ಬಲಿ ಪ್ರಯೋಗ ವಿಧಿ (Garuda Purana, Narayana Bali Vidhana)",
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
        : "నారాయణ బలి దోషం లేదు.",
      ta: isNarayanaActive
        ? `ஜாதகத்தில் 5 ஆம் வீடு மற்றும் குரு மீதான ராகுவின் தாக்கம் நாராயண பலி பூஜையின் தேவையை உணர்த்துகிறது.`
        : "நாராயண பலி தோஷம் இல்லை.",
      en: isNarayanaActive
        ? `Astrological indicators necessitating Narayana Bali: ${narayanaReasonsEn.join(" ")} Classical texts (Garuda Purana) declare that afflictions to the 5th house, 5th lord, or Jupiter by serpentine shadow nodes mirror unredeemed ancestral spirits requiring formal Vedic liberation rites.`
        : "5th house, 5th lord, and Jupiter are harmoniously placed. No Narayana Bali indications present."
    },
    lifeImpact: {
      kn: isNarayanaActive
        ? `ಈ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ವಂಶ ವೃದ್ಧಿಯಲ್ಲಿ ನಿಧಾನಗತಿ, ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ತಡವಾಗುವುದು, ಕೌಟುಂಬಿಕ ವ್ಯವಹಾರಗಳಲ್ಲಿ ನಿರಂತರ ಅಡಚಣೆಗಳು ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಕಾರಣವಿಲ್ಲದೆ ಜಗಳ-ಮನಸ್ತಾಪಗಳು ಉಂಟಾಗಬಹುದು. ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಒಂದು ರೀತಿಯ ಅಭದ್ರತೆಯ ಭಾವನೆ ಕಾಡಬಹುದು.\n\nಗೋಕರ್ಣ ಅಥವಾ ತ್ರಯಂಬಕೇಶ್ವರದಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಾರಾಯಣ ಬಲಿ ಸಂಸ್ಕಾರ ಮಾಡಿಸುವುದರಿಂದ ಪಿತೃಗಳಿಗೆ ಸದ್ಗತಿ ದೊರೆತು, ಅವರ ದೈವಿಕ ಆಶೀರ್ವಾದವು ನಿಮ್ಮ ಕುಟುಂಬದ ಸಮೃದ್ಧಿ, ಆರೋಗ್ಯ ಮತ್ತು ಸಂತಾನ ಭಾಗ್ಯವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ರಕ್ಷಿಸುತ್ತದೆ.`
        : "ಕುಟುಂಬದ ವಂಶಾಭಿವೃದ್ಧಿ ಮತ್ತು ಸಂತಾನ ಭಾಗ್ಯಕ್ಕೆ ದೈವಿಕ ರಕ್ಷಣೆ ಇದೆ.",
      hi: isNarayanaActive
        ? `इस दोष के कारण पारिवारिक वंश वृद्धि में विलंब, संतान संबंधी चिंताएं तथा घर में अकारण अशांति की स्थिति बन सकती है।\n\nपवित्र तीर्थ में नारायण बली का अनुष्ठान कराने से पूर्वजों को सद्गति मिलती है और परिवार में सुख-शांति एवं वंश वृद्धि का मार्ग प्रशस्त होता है।`
        : "परिवार में पूर्ण शांति एवं समृद्धि का वास है।",
      te: isNarayanaActive
        ? `ఈ ప్రభావం వలన సంతాన లేమి లేదా సంతాన సంబంధిత సమస్యలు, కుటుంబంలో విభేదాలు రావచ్చు. గోకర్ణంలో నారాయణ బలి పూజ చేయడం శ్రేయస్కరం.`
        : "కుటుంబంలో శాంతి సౌభాగ్యాలు ఉన్నాయి.",
      ta: isNarayanaActive
        ? `குடும்பத்தில் காரணமற்ற மனக்கசப்புகள், வம்ச விருத்தியில் தடைகள் வரலாம். நாராயண பலி பரிகாரம் செய்வது நற்பலன் தரும்.`
        : "தோஷம் ஏதுமில்லை.",
      en: isNarayanaActive
        ? `Unaddressed Narayana Bali indicators typically correspond to recurring family friction, lineage continuation anxieties, unexplained domestic stagnation, or persistent sleep disturbances.\n\nPerforming the sacred Narayana Bali rites dissolves these ancestral burdens, transforming blocked generational energies into protective blessings that fortify progeny, health, and ethical prosperity.`
        : "Unfettered lineage vitality and domestic tranquility reign."
    },
    recommendedPooja: {
      kn: "ಪವಿತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಕ್ಷೇತ್ರದಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತ 'ನಾರಾಯಣ ಬಲಿ' (Narayana Bali Ritual) & 'ನಾಗಬಲಿ'",
      hi: "गोकर्ण महाबलेश्वर अथवा त्र्यंबकेश्वर ज्योतिर्लिंग में 'नारायण बली एवं नागबली'",
      te: "గోకర్ణ లేదా త్రయంబకేశ్వరంలో 'నారాయణ బలి మరియు నాగబలి'",
      ta: "கோகர்ணம் அல்லது திருநாகேஸ்வரத்தில் 'நாராயண பலி மற்றும் நாகபலி'",
      en: "Sacred Narayana Bali & Nagabali Vedic Liberation Rites at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅರ್ಹ ಪುರೋಹಿತರ ಸಮ್ಮುಖದಲ್ಲಿ ಪೂರ್ಣ ವಿಧಿಯೊಂದಿಗೆ ನಾರಾಯಣ ಬಲಿ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಿ.",
        "ನಿತ್ಯ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಶ್ರವಣ ಅಥವಾ ಪಠಣ ಮಾಡಿ.",
        "ಏಕಾದಶಿಯ ದಿನ ಉಪವಾಸವಿದ್ದು, ಗೋಶಾಲೆಗೆ ಹಸಿರು ಮೇವು ಅಥವಾ ಅನ್ನದಾನ ಸಮರ್ಪಿಸಿ."
      ],
      hi: [
        "तीर्थ स्थल पर विधिपूर्वक नारायण बली एवं नागबली संस्कार संपन्न कराएं।",
        "प्रतिदिन प्रातःकाल 'विष्णु सहस्रनाम' का पाठ अथवा श्रवण करें।",
        "एकादशी के दिन गौसेवा करें और ब्राह्मणों को सात्विक भोजन कराएं।"
      ],
      te: [
        "గోకర్ణంలో శాస్త్రోక్తంగా నారాయణ బలి పూజ నిర్వహించండి.",
        "నిత్యం 'విష్ణు సహస్రనామ స్తోత్రం' పారాయణం చేయండి.",
        "గోవులకు ఆహారం మరియు పక్షులకు నీరు అందించండి."
      ],
      ta: [
        "புனித தலத்தில் நாராயண பலி பரிகார பூஜையை முறைப்படி செய்யவும்.",
        "தினமும் 'விஷ்ணு சகஸ்ரநாமம்' கேட்கவும் அல்லது படிக்கவும்.",
        "ஏகாதசி நாளில் ஏழைகளுக்கு அன்னதானம் வழங்கவும்."
      ],
      en: [
        "Commission formal Narayana Bali & Nagabali rites at Gokarna Mahabaleshwara under certified priests.",
        "Chant or listen to Sri Vishnu Sahasranama Stotram every morning with deep devotion.",
        "Serve cows with fresh green fodder and sponsor Annadana on Shukla Paksha Ekadashis."
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
    const rahuDeg = rahu.degree;
    const shifted = (deg: number) => normalizeDegree(deg - rahuDeg);
    const taraLongs = TARA_GRAHAS.map((n) => {
      const p = getPlanet(kundli, n);
      return p ? shifted(p.degree) : 0;
    });

    const inOpenFirst = taraLongs.filter((g) => g > 0.5 && g < 179.5).length;
    const inOpenSecond = taraLongs.filter((g) => g > 179.5 && g < 359.5).length;

    if (inOpenFirst === 7 || inOpenSecond === 7) {
      isKalaSarpa = true;
      if (inOpenSecond === 7) isKalaAmrita = true;
      const typeFound = KALA_SARPA_TYPES.find((t) => t.house === rahu.house);
      if (typeFound) kalaSarpaTypeObj = typeFound;
    } else if (inOpenFirst >= 6 || inOpenSecond >= 6) {
      isKalaSarpa = true;
      const typeFound = KALA_SARPA_TYPES.find((t) => t.house === rahu.house);
      if (typeFound) kalaSarpaTypeObj = typeFound;
    }
  }

  const kalaSarpaSeverity: DoshaSeverity = isKalaSarpa ? (isKalaAmrita ? "moderate" : "high") : "none";

  doshasList.push({
    id: "kala_sarpa",
    name: {
      kn: isKalaSarpa ? `${kalaSarpaTypeObj.kn} (${kalaSarpaTypeObj.en})` : "ಕಾಳ ಸರ್ಪ ದೋಷ (Kala Sarpa Dosha)",
      hi: isKalaSarpa ? `${kalaSarpaTypeObj.hi} (${kalaSarpaTypeObj.en})` : "कालसर्प दोष (Kala Sarpa Dosha)",
      te: isKalaSarpa ? `${kalaSarpaTypeObj.te} (${kalaSarpaTypeObj.en})` : "కాలసర్ప దోషం (Kala Sarpa Dosha)",
      ta: isKalaSarpa ? `${kalaSarpaTypeObj.ta} (${kalaSarpaTypeObj.en})` : "காலசர்ப்ப தோஷம் (Kala Sarpa)",
      en: isKalaSarpa ? `${kalaSarpaTypeObj.en} (Kala Sarpa Yoga)` : "Kala Sarpa Dosha"
    },
    category: "natal",
    isDetected: isKalaSarpa,
    severity: kalaSarpaSeverity,
    statusBadge: {
      kn: isKalaSarpa ? (isKalaAmrita ? "ಕಾಲ ಅಮೃತ ಯೋಗ (ಭಾಗಶಃ)" : "ಪೂರ್ಣ ಕಾಳಸರ್ಪ ದೋಷ") : "ದೋಷ ಮುಕ್ತ",
      hi: isKalaSarpa ? (isKalaAmrita ? "काल अमृत योग" : "पूर्ण कालसर्प दोष") : "दोष रहित",
      te: isKalaSarpa ? "సక్రియ కాలసర్ప దోషం" : "దోష రహితం",
      ta: isKalaSarpa ? "காலசர்ப்ப தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isKalaSarpa ? (isKalaAmrita ? "KALA AMRITA YOGA (SPIRITUAL)" : "FULL KALA SARPA DOSHA") : "NO KALA SARPA"
    },
    technicalDetail: {
      houseNumbers: rahu && ketu ? [rahu.house, ketu.house] : [],
      grahasInvolved: ["Rahu", "Ketu", ...TARA_GRAHAS.map(p => p.toString())],
      grahaDegrees: rahu && ketu ? [
        { name: "Rahu", rashi: RASHI_NAMES_EN[rahu.rashi.index], degreeFormatted: formatDegMin(rahu.degree) },
        { name: "Ketu", rashi: RASHI_NAMES_EN[ketu.rashi.index], degreeFormatted: formatDegMin(ketu.degree) }
      ] : [],
      scripturalReference: "ಅಗ್ನಿ ಪುರಾಣ & ಮಾನಸಾಗರೀ ಜ್ಯೋತಿಷ (Agni Purana & Manasagari)",
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
    lifeImpact: {
      kn: isKalaSarpa
        ? `ಕಾಳಸರ್ಪ ದೋಷದ ಮುಖ್ಯ ಪ್ರಭಾವವೆಂದರೆ ಜೀವನದಲ್ಲಿ ಏರಿಳಿತಗಳು ತೀವ್ರವಾಗಿರುತ್ತವೆ. ೩೨ ಅಥವಾ ೩೫ ವರ್ಷಗಳ ವರೆಗೆ ಅತಿಯಾದ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗದೆ ತಡವಾಗಬಹುದು. ಆದರೆ ಈ ದೋಷವಿರುವ ವ್ಯಕ್ತಿಗಳು ದೃಢ ನಿರ್ಧಾರ, ಅಪ್ರತಿಮ ತಾಳ್ಮೆ ಹಾಗೂ ಅಡೆತಡೆಗಳ ನಂತರ ಅಸಾಧಾರಣ ಸಾಮಾಜಿಕ ಎತ್ತರಕ್ಕೆ ಬೆಳೆಯುವ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿರುತ್ತಾರೆ.\n\nಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ಅನಗತ್ಯ ಊಹಾಪೋಹಗಳಿಗೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಗೆ ಮರುಳಾಗದೆ, ನೇರ ನಿಷ್ಠೆಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದು ಯಶಸ್ಸನ್ನು ತಂದುಕೊಡುತ್ತದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಾಳಸರ್ಪ ಶಾಂತಿ ಮಾಡಿಸುವುದರಿಂದ ಸರ್ಪದೋಷ ನಿವಾರಣೆಯಾಗಿ, ಸ್ಥಿರ ಸಂಪತ್ತು ಮತ್ತು ಶಾಶ್ವತ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.`
        : "ಜೀವನದ ಪಯಣವು ಸಹಜ ಸಮತೋಲನದಿಂದ ಕೂಡಿದ್ದು, ಯಾವುದೇ ಸರ್ಪದೋಷದ ಬಂಧನವಿಲ್ಲ.",
      hi: isKalaSarpa
        ? `कालसर्प दोष जीवन में प्रारंभिक संघर्ष, अचानक उतार-चढ़ाव और 32-35 वर्ष की आयु तक कठिन परिश्रम कराता है, परंतु इसके पश्चात जातक को असाधारण सफलता और प्रतिष्ठा प्रदान करता है।\n\nनियमित शिव उपासना और कालसर्प शांति से जीवन के सभी अवरोध समाप्त हो जाते हैं।`
        : "जीवन संतुलित और निर्बाध प्रगतिशील रहेगा।",
      te: isKalaSarpa
        ? `ఈ దోషం వలన జీవిత ప్రారంభంలో తీవ్ర సంఘర్షణలు ఉంటాయి. 33 సంవత్సరాల తర్వాత అద్భుతమైన ఉన్నతి లభిస్తుంది.`
        : "జీవిత గమనం సంతులనంగా ఉండి, ఎలాంటి సర్పాక్షిక బంధనాలు లేవు.",
      ta: isKalaSarpa
        ? `துவக்க காலத்தில் போராட்டங்களும் தடைகளும் இருந்தாலும், கடின உழைப்பிற்குப் பின் மாபெரும் வெற்றி கிடைக்கும்.`
        : "வாழ்க்கைப் பயணம் எவ்வித சர்ப்ப தடைகளும் இன்றி சுபமாக அமையும்.",
      en: isKalaSarpa
        ? `Kala Sarpa Yoga imposes non-linear life development—demanding extraordinary tenacity through initial decades where rewards frequently lag behind labor. However, once mastered, it confers formidable resilience, unconventional breakthroughs, and eventual distinction.\n\nPropitiating Lord Shiva via formal Kala Sarpa Shanti harmonizes the nodal axis, converting restrictive karmic drag into catalytic executive power.`
        : "Planetary balance ensures unhampered progression without nodal drag."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ 'ಕಾಳಸರ್ಪ ದೋಷ ನಿವಾರಣಾ ಶಾಂತಿ' & 'ಮಹಾ ರುದ್ರಾಭಿಷೇಕ'",
      hi: "गोकर्ण अथवा त्र्यंबकेश्वर में 'कालसर्प दोष निवारण शांति एवं महा रुद्राभिषेक'",
      te: "గోకర్ణ లేదా శ్రీకాళహస్తిలో 'కాలసర్ప దోష నివారణ శాంతి'",
      ta: "கோகர்ணம் அல்லது திருக்காளஹஸ்தியில் 'காலசர்ப்ப தோஷ சாந்தி பூஜை'",
      en: "Kala Sarpa Dosha Nivarana Shanti & Maha Rudrabhishekam at Gokarna Mahabaleshwara"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಶಿವಲಿಂಗಕ್ಕೆ ಹಸಿಹಾಲು ಮತ್ತು ಬಿಲ್ವಪತ್ರೆ ಅರ್ಪಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.",
        "ನಿತ್ಯ ೧೧ ಬಾರಿ ಶ್ರೀ 'ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ'ವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಜಪಿಸಿ.",
        "ಶನಿವಾರದಂದು ನಿರ್ಗತಿಕರಿಗೆ ಅಥವಾ ಪ್ರಾಣಿಗಳಿಗೆ ಆಹಾರ ನೀಡಿ; ಸರ್ಪಗಳಿಗೆ ಯಾವುದೇ ಹಾನಿ ಮಾಡಬೇಡಿ."
      ],
      hi: [
        "प्रतिदिन 108 बार महामृत्युंजय मंत्र का जप करें।",
        "सोमवार एवं प्रदोष के दिन शिवलिंग पर कच्चा दूध और बेलपत्र अर्पित करें।",
        "पक्षियों और चींटियों को नियमित रूप से दाना डालें।"
      ],
      te: [
        "రోజూ మహా మృత్యుంజయ మంత్రం జపించండి.",
        "సోమవారం శివునికి బిల్వార్చన మరియు అభిషేకం చేయించండి.",
        "పేదలకు నల్ల నువ్వులు దానం చేయండి."
      ],
      ta: [
        "தினமும் மகா மிருத்யுஞ்சய மந்திரம் 11 முறை ஜெபிக்கவும்.",
        "திங்கட்கிழமை சிவபெருமானுக்கு வில்வ இலை சார்த்தி வழிபடவும்.",
        "ஏழைகளுக்கு உதவி செய்யவும்."
      ],
      en: [
        "Perform milk and bilva leaf Abhishekam to Lord Shiva on Mondays and Pradosham days.",
        "Chant the sacred Maha Mrityunjaya Mantra 11 or 108 times daily.",
        "Feed stray animals and maintain reverence toward serpentine shrines."
      ]
    }
  });

  // ==========================================================================
  // 4. GURU CHANDALA DOSHA (ಗುರು ಚಂಡಾಲ ದೋಷ / गुरु चांडाल दोष)
  // ==========================================================================
  let isGuruChandal = false;
  let guruChandalDist = 0;
  if (jupiter && rahu) {
    if (jupiter.rashi.index === rahu.rashi.index) {
      isGuruChandal = true;
      guruChandalDist = Math.abs(jupiter.degree - rahu.degree);
    }
  }

  const guruChandalSeverity: DoshaSeverity = isGuruChandal ? (guruChandalDist <= 6 ? "critical" : "moderate") : "none";

  doshasList.push({
    id: "guru_chandala",
    name: {
      kn: "ಗುರು ಚಂಡಾಲ ದೋಷ (Guru Chandala Dosha)",
      hi: "गुरु चांडाल दोष (Guru Chandala Dosha)",
      te: "గురు చండాల దోషం (Guru Chandala Dosha)",
      ta: "குரு சண்டாள தோஷம் (Guru Chandala)",
      en: "Guru Chandala Dosha (Preceptor-Shadow Conjunction)"
    },
    category: "natal",
    isDetected: isGuruChandal,
    severity: guruChandalSeverity,
    statusBadge: {
      kn: isGuruChandal ? "ಸಕ್ರಿಯ ಗುರುಚಂಡಾಲ ದೋಷ" : "ದೋಷ ಮುಕ್ತ",
      hi: isGuruChandal ? "सक्रिय गुरु चांडाल दोष" : "दोष रहित",
      te: isGuruChandal ? "సక్రియ గురుచండాల దోషం" : "దోషం లేదు",
      ta: isGuruChandal ? "குரு சண்டாள தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isGuruChandal ? "ACTIVE GURU CHANDALA" : "UNAFFLICTED"
    },
    technicalDetail: {
      houseNumbers: jupiter && isGuruChandal ? [jupiter.house] : [],
      grahasInvolved: isGuruChandal ? ["Jupiter", "Rahu"] : [],
      grahaDegrees: isGuruChandal && jupiter && rahu ? [
        { name: "Jupiter", rashi: RASHI_NAMES_EN[jupiter.rashi.index], degreeFormatted: formatDegMin(jupiter.degree) },
        { name: "Rahu", rashi: RASHI_NAMES_EN[rahu.rashi.index], degreeFormatted: formatDegMin(rahu.degree) }
      ] : [],
      scripturalReference: "ಜಾತಕ ಪಾರಿಜಾತ & ಫಲದೀಪಿಕಾ (Jataka Parijata & Phaladeepika)",
      hasBhangaOrMitigation: jupiter !== undefined && (jupiter.rashi.index === 3 || jupiter.rashi.index === 8 || jupiter.rashi.index === 11),
      bhangaDescription: {
        kn: jupiter && (jupiter.rashi.index === 3 || jupiter.rashi.index === 8 || jupiter.rashi.index === 11)
          ? "ಗುರುವು ಸ್ವಕ್ಷೇತ್ರ ಅಥವಾ ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು ರಾಹುವಿನ ದುಷ್ಪ್ರಭಾವವನ್ನು ತನ್ನ ಬಲದಿಂದ ತಗ್ಗಿಸುತ್ತಿದ್ದಾನೆ."
          : "ಸಾಮಾನ್ಯ ರಾಶಿ ಸ್ಥಿತಿಯಲ್ಲಿದೆ.",
        en: jupiter && (jupiter.rashi.index === 3 || jupiter.rashi.index === 8 || jupiter.rashi.index === 11)
          ? "Jupiter occupies dignity (own/exalted), actively purifying Rahu's disruptive turbulence."
          : "Standard sign placement; requires conscious ethical grounding."
      }
    },
    technicalWhy: {
      kn: isGuruChandal && jupiter && rahu
        ? `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ (${formatDegMin(jupiter.degree)}) ಹಾಗೂ ಛಾಯಾಗ್ರಹ ರಾಹು (${formatDegMin(rahu.degree)}) ಇಬ್ಬರೂ ${jupiter.house}ನೇ ಮನೆಯಾದ ${RASHI_NAMES_KN[jupiter.rashi.index]} ರಾಶಿಯಲ್ಲಿ ${guruChandalDist.toFixed(1)}° ಅಂತರದ ಅತಿಸಮೀಪ ಯುತಿ ಹೊಂದಿದ್ದಾರೆ. ಗುರುವು ಧರ್ಮ, ಜ್ಞಾನ, ನೀತಿ ಮತ್ತು ಸದ್ಬುದ್ಧಿಯ ಕಾರಕನಾಗಿದ್ದು, ರಾಹುವು ಭ್ರಮೆ, ಅಸಾಂಪ್ರದಾಯಿಕತೆ ಹಾಗೂ ಆತುರದ ಕಾರಕನಾಗಿದ್ದಾನೆ. ಈ ಸಂಯೋಗವು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ 'ಗುರು ಚಂಡಾಲ ದೋಷ'ವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.`
        : "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಮತ್ತು ರಾಹು ಪ್ರತ್ಯೇಕ ರಾಶಿಗಳಲ್ಲಿದ್ದು ಯಾವುದೇ ಗುರುಚಂಡಾಲ ದೋಷ ಉಂಟಾಗಿರುವುದಿಲ್ಲ.",
      hi: isGuruChandal && jupiter && rahu
        ? `देवगुरु बृहस्पति एवं राहु दोनों ${jupiter.house}वें भाव (${RASHI_NAMES_EN[jupiter.rashi.index]}) में मात्र ${guruChandalDist.toFixed(1)}° के अंतर पर युति कर रहे हैं, जिससे गुरु चांडाल योग का निर्माण होता है।`
        : "गुरु और राहु का कोई अशुभ युति संबंध नहीं है।",
      te: isGuruChandal && jupiter && rahu
        ? `మీ జాతకంలో గురుడు మరియు రాహువు ${jupiter.house}వ స్థానంలో కలసి స్థితి చెందడం వల్ల గురు చండాల దోషం ఏర్పడింది.`
        : "జాతకంలో గురుడు మరియు రాహువు వేర్వేరు రాశులలో ఉండి గురు చండాల దోషం లేదు.",
      ta: isGuruChandal && jupiter && rahu
        ? `குருவும் ராகுவும் ${jupiter.house} ஆம் வீட்டில் இணைந்து சஞ்சரிப்பதால் குரு சண்டாள தோஷம் உண்டாகியுள்ளது.`
        : "ஜாதகத்தில் குருவும் ராகுவும் தனித்தனி ராசிகளில் உள்ளதால் குரு சண்டாள தோஷம் இல்லை.",
      en: isGuruChandal && jupiter && rahu
        ? `Jupiter (${formatDegMin(jupiter.degree)}) and Rahu (${formatDegMin(rahu.degree)}) are co-present in the ${jupiter.house}th house (${RASHI_NAMES_EN[jupiter.rashi.index]}) within a close ${guruChandalDist.toFixed(1)}° orb. While Jupiter presides over higher ethical wisdom, Rahu introduces rebellious unorthodox momentum, establishing classical Guru Chandala Dosha.`
        : "Jupiter and Rahu occupy distinct signs without afflictive conjunction. No Guru Chandala Dosha is present."
    },
    lifeImpact: {
      kn: isGuruChandal
        ? `ಈ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಧಾರ್ಮಿಕ ಆಚರಣೆಗಳಲ್ಲಿ ಅಥವಾ ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಅಪನಂಬಿಕೆ ಮೂಡುವುದು, ತಪ್ಪು ಹೂಡಿಕೆಗಳಿಗೆ ಆಕರ್ಷಿತರಾಗುವುದು ಹಾಗೂ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಲ್ಲಿ ದ್ವಂದ್ವ ಮನಸ್ಥಿತಿ ಉಂಟಾಗಬಹುದು. ಶೀಘ್ರವಾಗಿ ಲಾಭ ಪಡೆಯುವ ಪ್ರಲೋಭನೆಗೆ ಒಳಗಾಗುವ ಅಪಾಯವಿರುತ್ತದೆ.\n\nಗುರು ಚರಿತ್ರೆ ಪಠಿಸುವುದು, ಗುರು-ಹಿರಿಯರನ್ನು ಗೌರವಿಸುವುದು ಹಾಗೂ ದೈವಜ್ಞರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಪ್ರಮುಖ ಒಪ್ಪಂದಗಳನ್ನು ಮಾಡಿಕೊಳ್ಳುವುದರಿಂದ ರಾಹುವಿನ ಭ್ರಮೆ ಕರಗಿ, ಗುರುವಿನ ನೈಜ ಜ್ಞಾನ ಮತ್ತು ವಿವೇಕವು ಜಾಗೃತಗೊಳ್ಳಲಿದೆ.`
        : "ಬುದ್ಧಿ ಮತ್ತು ವಿವೇಕವು ದೈವಿಕ ಸ್ಪಷ್ಟತೆಯಿಂದ ಕೂಡಿದೆ.",
      hi: isGuruChandal
        ? `यह योग कभी-कभी निर्णयों में भ्रम, वरिष्ठों की सलाह की अनदेखी अथवा वित्तीय मामलों में अति-उत्साह उत्पन्न कर सकता है।\n\nगुरु मंत्र का जप, शिक्षकों का सम्मान और सात्विक आहार से बुद्धि में शुद्धि और स्थिरता आती है।`
        : "विवेक और निर्णय क्षमता पूर्णतः संतुलित है।",
      te: isGuruChandal
        ? `ఈ ప్రభావం వలన నిర్ణయాలలో తికమక కలగడం లేదా అనుభవజ్ఞుల సలహాలు పట్టించుకోకపోవడం జరగవచ్చు. గురు ఆరాధన శ్రేయస్కరం.`
        : "సద్బుద్ధి, వివేకం మరియు ఆధ్యాత్మిక దృక్పథం స్థిరంగా కొనసాగుతాయి.",
      ta: isGuruChandal
        ? `பெரியோர்களின் ஆலோசனைகளைப் புறக்கணிக்கும் மனநிலை வரலாம். குரு வழிபாடு மன அமைதியைத் தரும்.`
        : "ஞானமும், நேர்மையான சிந்தனையும் வாழ்வை நல்வழிப்படுத்தும்.",
      en: isGuruChandal
        ? `Guru Chandala manifests as philosophical skepticism, occasional friction with orthodox mentors, or vulnerability to high-risk speculative schemes driven by impatience.\n\nHonoring seasoned preceptors, chanting Brihaspati mantras, and conducting rigorous due diligence before executing major contracts neutralizes the shadow energy, unlocking brilliant innovation.`
        : "Mental clarity and ethical judgment operate with unimpeded lucidity."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ 'ಗುರು ಚಂಡಾಲ ನಿವಾರಣಾ ಶಾಂತಿ' & 'ಬೃಹಸ್ಪತಿ ಮಹಾ ಹವನ'",
      hi: "गोकर्ण अथवा हरिद्वार में 'गुरु चांडाल दोष निवारण शांति एवं बृहस्पति हवन'",
      te: "గోకర్ణంలో 'గురు చండాల దోష నివారణ శాంతి'",
      ta: "கோகர்ணத்தில் 'குரு சண்டாள தோஷ சாந்தி பூஜை'",
      en: "Brihaspati Shanti & Guru Chandala Nivarana Homa at Gokarna Kshetra"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಗುರುವಾರ ಗುರು ದತ್ತಾತ್ರೇಯ ಅಥವಾ ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿಗಳ ಸೇವೆ ಮಾಡಿ, ಕಡಲೆಕಾಳು ದಾನ ಮಾಡಿ.",
        "ನಿತ್ಯ ೧೦೮ ಬಾರಿ ಗುರು ಬೀಜ ಮಂತ್ರ 'ಓಂ ಗ್ರಾನ್ ಗ್ರೀನ್ ಗ್ರೌನ್ ಸಃ ಗುರವೇ ನಮಃ' ಜಪಿಸಿ.",
        "ಪೋಷಕರು ಮತ್ತು ಗುರು-ಹಿರಿಯರ ಪಾದ ಮುಟ್ಟಿ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ."
      ],
      hi: [
        "प्रत्येक गुरुवार को भगवान विष्णु एवं गुरु बृहस्पति की पूजा कर चने की दाल का दान करें।",
        "नित्य 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः' मंत्र का 108 बार जप करें।",
        "माता-पिता और गुरुजनों का नित्य चरण स्पर्श कर आशीर्वाद लें।"
      ],
      te: [
        "ప్రతి గురువారం గురు దత్తాత్రేయ స్తోత్రం పఠించండి.",
        "శనగలు పేదలకు దానం చేయండి.",
        "గురువుల ఆశీస్సులు తీసుకోండి."
      ],
      ta: [
        "வியாழக்கிழமைகளில் தட்சிணாமூர்த்தி வழிபாடு செய்யவும்.",
        "கொண்டைக்கடலை தானம் செய்யவும்.",
        "ஆசிரியர்களை மதித்து ஆசி பெறவும்."
      ],
      en: [
        "Propitiate Lord Dattatreya or Sri Raghavendra Swamy on Thursdays; donate roasted yellow chickpeas.",
        "Chant the Brihaspati Beeja Mantra 108 times daily.",
        "Seek daily blessings from parents, preceptors, and elders."
      ]
    }
  });

  // ==========================================================================
  // 5. BALARISHTA DOSHA (ಬಾಲಾರಿಷ್ಟ ದೋಷ / बालारिष्ट दोष)
  // ==========================================================================
  let isBalarishta = false;
  const balarishtaReasonsKn: string[] = [];
  const balarishtaReasonsEn: string[] = [];
  const balarishtaHouses: number[] = [];

  // Moon in 6, 8, 12 afflicted by malefics without benefic aspect
  if (moon && (moon.house === 6 || moon.house === 8 || moon.house === 12)) {
    balarishtaHouses.push(moon.house);
    balarishtaReasonsKn.push(`ಚಂದ್ರನು ${moon.house}ನೇ ತ್ರಿಕ ಭಾವದಲ್ಲಿ ದುರ್ಬಲನಾಗಿರುವುದು.`);
    balarishtaReasonsEn.push(`Moon is placed in the vulnerable ${moon.house}th Dusthana.`);
    isBalarishta = true;
  }
  if (lagnaLord && (lagnaLord.house === 6 || lagnaLord.house === 8)) {
    balarishtaHouses.push(lagnaLord.house);
    balarishtaReasonsKn.push(`ಲಗ್ನಾಧಿಪತಿ ${lagnaLord.name} ತ್ರಿಕ ಭಾವದಲ್ಲಿದ್ದು ಶಾರೀರಿಕ ರಕ್ಷಣಾ ಬಲ ಕಡಿಮೆಯಾಗಿರುವುದು.`);
    balarishtaReasonsEn.push(`Ascendant lord ${lagnaLord.name} is stationed in a Dusthana.`);
    isBalarishta = true;
  }

  // Check for Balarishta Bhanga (Jupiter in Kendra or Lagna)
  const hasBalarishtaBhanga = jupiter !== undefined && (jupiter.house === 1 || jupiter.house === 4 || jupiter.house === 7 || jupiter.house === 10);
  const balarishtaSeverity: DoshaSeverity = isBalarishta ? (hasBalarishtaBhanga ? "mild" : "moderate") : "none";

  doshasList.push({
    id: "balarishta",
    name: {
      kn: "ಬಾಲಾರಿಷ್ಟ ದೋಷ (Balarishta Dosha)",
      hi: "बालारिष्ट दोष (Balarishta Dosha)",
      te: "బాలారిష్ట దోషం (Balarishta Dosha)",
      ta: "பாலாரிஷ்ட தோஷம் (Balarishta)",
      en: "Balarishta Dosha (Early Vitality Sensitivity)"
    },
    category: "natal",
    isDetected: isBalarishta,
    severity: balarishtaSeverity,
    statusBadge: {
      kn: isBalarishta ? (hasBalarishtaBhanga ? "ಭಂಗವಾಗಿದೆ (ಸುರಕ್ಷಿತ)" : "ಮಧ್ಯಮ ಬಾಲಾರಿಷ್ಟ") : "ದೋಷ ಮುಕ್ತ",
      hi: isBalarishta ? (hasBalarishtaBhanga ? "भंग (सुरक्षित)" : "बालारिष्ट दोष") : "दोष रहित",
      te: isBalarishta ? "బాలారిష్ట దోషం" : "దోష రహితం",
      ta: isBalarishta ? "பாலாரிஷ்ட தோஷம்" : "தோஷமில்லை",
      en: isBalarishta ? (hasBalarishtaBhanga ? "CANCELLED (BHANGA)" : "MODERATE BALARISHTA") : "VIGOROUS"
    },
    technicalDetail: {
      houseNumbers: Array.from(new Set(balarishtaHouses)),
      grahasInvolved: ["Moon", ...(lagnaLord ? [lagnaLord.name] : [])],
      scripturalReference: "ಬೃಹತ್ ಜಾತಕ, ಬಾಲಾರಿಷ್ಟಾಧ್ಯಾಯ (Brihat Jataka, Balarishta Adhyaya)",
      hasBhangaOrMitigation: hasBalarishtaBhanga,
      bhangaDescription: {
        kn: hasBalarishtaBhanga
          ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿದ್ದು (ಲಗ್ನ/ಕೇಂದ್ರ) ಬಾಲಾರಿಷ್ಟ ಭಂಗ ರಾಜಯೋಗ ನಿರ್ಮಿಸಿ, ಶಾರೀರಿಕ ಆಯುಸ್ಸನ್ನು ದೃಢವಾಗಿ ರಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ."
          : "ಸಾಮಾನ್ಯ ಆಯುಷ್ಯ ರಕ್ಷಣೆ ಇದೆ.",
        en: hasBalarishtaBhanga
          ? "Jupiter stationed in Kendra establishes Balarishta Bhanga, conferring potent immune and lifespan protection."
          : "Standard physical vitality; requires routine seasonal wellness vigilance."
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
    lifeImpact: {
      kn: isBalarishta
        ? `ಬಾಲ್ಯದಲ್ಲಿ ಹವಾಮಾನ ಬದಲಾವಣೆಗಳಿಗೆ ತ್ವರಿತವಾಗಿ ತುತ್ತಾಗುವುದು, ಶ್ವಾಸಕೋಶ ಅಥವಾ ಜೀರ್ಣಾಂಗಗಳ ಸೂಕ್ಷ್ಮತೆ ಇರಬಹುದು. ವಯಸ್ಸು ಕಳೆದಂತೆ ಈ ದೋಷವು ಕೇವಲ ದೈಹಿಕ ಸೂಕ್ಷ್ಮತೆಯಾಗಿ ಉಳಿಯುತ್ತದೆ.\n\nಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ ಮತ್ತು ಮೃತ್ಯುಂಜಯ ಜಪ ಮಾಡಿಸುವುದರಿಂದ ಆರೋಗ್ಯವು ಸದಾ ಸುಸ್ಥಿರವಾಗಿರುತ್ತದೆ.`
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
        ? `Historically reflects early childhood respiratory or digestive sensitivities. In adult life, this manifests as heightened psychosomatic sensitivity to seasonal shifts.\n\nCultivating clean Ayurvedic lifestyle habits and Mahamrityunjaya chanting sustains robust vitality.`
        : "Robust longevity and vital immunity."
    },
    recommendedPooja: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ 'ಆಯುಷ್ಯ ಹೋಮ' & 'ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ'",
      hi: "गोकर्ण में 'आयुष्य होम एवं महामृत्युंजय जप'",
      te: "గోకర్ణంలో 'ఆయుష్య హోమం మరియు మృత్యుంజయ జపం'",
      ta: "கோகர்ணத்தில் 'ஆயுஷ்ய ஹோமம் மற்றும் ருத்ராபிஷேகம்'",
      en: "Ayushya Homa & Maha Mrityunjaya Japa at Gokarna Mahabaleshwara"
    },
    remedies: {
      kn: [
        "ಪ್ರತಿ ಜನ್ಮದಿನದಂದು ಆಯುಷ್ಯ ಹೋಮ ಮಾಡಿಸಿ ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ.",
        "ಬೆಳ್ಳಿಯ ನಾಣ್ಯ ಅಥವಾ ರಕ್ಷಾ ಸೂತ್ರವನ್ನು ಧರಿಸಿ.",
        "ಗೋವಿಗೆ ಹಸಿರು ಹುಲ್ಲು ಮತ್ತು ಬೆಲ್ಲ ನೀಡಿ."
      ],
      hi: [
        "जन्मदिन पर महामृत्युंजय पाठ एवं आयुष्य होम कराएं।",
        "गौमाता को हरा चारा खिलाएं।"
      ],
      te: [
        "జన్మదినం నాడు ఆయుష్య హోమం చేయించండి.",
        "గోసేవ చేయండి."
      ],
      ta: [
        "பிறந்தநாளில் ஆயுஷ்ய ஹோமம் செய்யவும்.",
        "பசுவிற்கு அகத்திக்கீரை வழங்கவும்."
      ],
      en: [
        "Commission Ayushya Homa on birthdays and perform Annadana.",
        "Wear an abhimantrita silver coin or consecrated sacred thread."
      ]
    }
  });

  // ==========================================================================
  // 6. BALYAGRAHA DOSHA (ಬಾಲ್ಯಗ್ರಹ ದೋಷ / बाल्यग्रह पीड़ा)
  // ==========================================================================
  let isBalyagraha = false;
  if (mercury && (mercury.house === 6 || mercury.house === 8) && rahu && mercury.rashi.index === rahu.rashi.index) {
    isBalyagraha = true;
  }
  if (moon && ketu && moon.rashi.index === ketu.rashi.index) {
    isBalyagraha = true;
  }

  doshasList.push({
    id: "balyagraha",
    name: {
      kn: "ಬಾಲ್ಯಗ್ರಹ ದೋಷ (Balyagraha Dosha)",
      hi: "बाल्यग्रह दोष (Balyagraha Dosha)",
      te: "బాల్యగ్రహ దోషం (Balyagraha Dosha)",
      ta: "பால்யக் கிரக தோஷம் (Balyagraha)",
      en: "Balyagraha Dosha (Nervous/Childhood Sensitivity)"
    },
    category: "natal",
    isDetected: isBalyagraha,
    severity: isBalyagraha ? "moderate" : "none",
    statusBadge: {
      kn: isBalyagraha ? "ಬಾಲ್ಯಗ್ರಹ ಪ್ರಭಾವ" : "ದೋಷ ಮುಕ್ತ",
      hi: isBalyagraha ? "बाल्यग्रह प्रभाव" : "दोष रहित",
      te: isBalyagraha ? "బాల్యగ్రహ ప్రభావం" : "దోషం లేదు",
      ta: isBalyagraha ? "தோஷம் உள்ளது" : "தோஷமில்லை",
      en: isBalyagraha ? "BALYAGRAHA NOTED" : "UNAFFLICTED"
    },
    technicalDetail: {
      houseNumbers: isBalyagraha && mercury ? [mercury.house] : [],
      grahasInvolved: isBalyagraha ? ["Mercury", "Moon", "Rahu/Ketu"] : [],
      scripturalReference: "ಪರಾಶರ ಬಾಲ್ಯಗ್ರಹ ರಕ್ಷಾ ವಿಧಿ (Parashara Balyagraha Raksha Vidhana)",
      hasBhangaOrMitigation: false,
      bhangaDescription: {
        kn: "ಸುದರ್ಶನ ಹೋಮದಿಂದ ಈ ದೋಷ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.",
        en: "Mitigated through Sri Sudarshana Homa and Balaraksha Stotram."
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
      hi: "गोकर्ण में 'सुदर्शन होम एवं बालरक्षा पाठ'",
      te: "గోకర్ణంలో 'సుదర్శన హోమం'",
      ta: "சுதர்சன ஹோமம்",
      en: "Sri Sudarshana Homa & Balaraksha Stotram Parayana"
    },
    remedies: {
      kn: ["ಸುದರ್ಶನ ಕವಚ ಪಠಿಸಿ.", "ಮಕ್ಕಳಿಗೆ ಸಿಹಿ ಅನ್ನದಾನ ಮಾಡಿ."],
      hi: ["सुदर्शन कवच का पाठ करें।"],
      te: ["సుదర్శన కవచం చదవండి."],
      ta: ["சுதர்சன கவசம் படிக்கவும்."],
      en: ["Recite Sri Sudarshana Kavacham daily.", "Distribute sweet rice to young children."]
    }
  });

  // ==========================================================================
  // 7. KUJA / MANGLIK DOSHA (ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ / मांगलिक दोष)
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
    lifeImpact: {
      kn: isKujaDosha
        ? `ಕುಜದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ನಡವಳಿಕೆಯಲ್ಲಿ ಆತುರ, ಅಸಹನೆ, ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಉದ್ವೇಗ ಹಾಗೂ ದಾಂಪತ್ಯ ಅಥವಾ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಸೈದ್ಧಾಂತಿಕ ಘರ್ಷಣೆಗಳು ಮೂಡಬಹುದು.\n\nಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಆರಾಧನೆ, ಧ್ಯಾನ ಹಾಗೂ ಶಾಂತಿಯುತ ಸಂಭಾಷಣೆಯನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದರಿಂದ ಈ ತೀಕ್ಷ್ಣ ಶಕ್ತಿಯು ಶ್ರೇಷ್ಠ ನಾಯಕತ್ವ ಹಾಗೂ ಅದ್ಭುತ ಸಾಧನೆಯಾಗಿ ಬದಲಾಗುತ್ತದೆ.`
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
        ? `Generates dynamic surges of martial drive, occasional impatience with procedural delays, and passionate conviction in relationships.\n\nChannelling this heat through regular athletic discipline and Kartikeya/Hanuman devotion transforms reactive impulse into constructive leadership.`
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
  // 8. DASHA-BHUKTI SANDHI DOSHA (ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ದೋಷ)
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
    lifeImpact: {
      kn: isSandhiActive && sandhiAlert
        ? `${sandhiAlert.descriptionKn}\n\nಪ್ರಸ್ತುತ ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಆತುರದ ಹೂಡಿಕೆಗಳು, ಉದ್ಯೋಗ ಬದಲಾವಣೆ ಅಥವಾ ಕೌಟುಂಬಿಕ ವಿವಾದಗಳಿಂದ ದೂರವಿರುವುದು ಅತ್ಯಗತ್ಯ. ಶಾಸ್ತ್ರೋಕ್ತ ದಶಾ ಸಂಧಿ ಶಾಂತಿ ಮಾಡಿಸುವುದರಿಂದ ಹೊಸ ದಶೆಯು ಅತ್ಯಂತ ಮಂಗಳಕರವಾಗಿ ಪರಿಣಮಿಸಲಿದೆ.`
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
        ? `${sandhiAlert.descriptionEn}\n\nAvoid impetuous vocational disruptions or speculative commitments during this threshold. Performing consecrated Dasha Sandhi Shanti transforms turbulent shifts into monumental new beginnings.`
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
  // 9. GOCHARA DOSHAS: SADE SATI & ASHTAMA SHANI (ಪ್ರಸ್ತುತ ಗೋಚಾರ ದೋಷಗಳು)
  // ==========================================================================
  // Compute live current ephemeris positions relative to natal Moon sign
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
    lifeImpact: {
      kn: isGocharaAfflicted
        ? `ಈ ಶನಿ ಗೋಚಾರದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೆಲಸದ ಒತ್ತಡ ಹೆಚ್ಚಾಗುವುದು, ಫಲಿತಾಂಶಗಳಲ್ಲಿ ವಿಳಂಬ, ಹಿರಿಯರೊಂದಿಗೆ ಜವಾಬ್ದಾರಿಗಳ ಹಂಚಿಕೆ ಹಾಗೂ ಶಾರೀರಿಕ ಆಯಾಸ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಆತುರದ ಅಥವಾ ಅನೈತಿಕ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬಾರದು.\n\nಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸುವುದು, ದಶರಥ ಪ್ರೋಕ್ತ ಶನಿ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಹಾಗೂ ನಿರ್ಗತಿಕರಿಗೆ ಸಹಾಯ ಮಾಡುವುದರಿಂದ ಶನಿಯ ಕೃಪೆಯು ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ದೀರ್ಘಾವಧಿಯ ಶಾಶ್ವತ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸಲಿದೆ.`
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
        ? `Demands meticulous discipline, patient perseverance under workplace loads, and emotional forbearance. Not a phase for speculative shortcuts.\n\nLighting sesame oil lamps on Saturdays and maintaining unshakeable ethics converts Saturn's testing pressure into unbreakable worldly security.`
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
      currentDashaStr: sandhiAlert ? `${sandhiAlert.outgoingPlanetEn} -> ${sandhiAlert.incomingPlanetEn}` : "Running Dasha"
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
    calculatedAt: new Date().toISOString()
  };
}
