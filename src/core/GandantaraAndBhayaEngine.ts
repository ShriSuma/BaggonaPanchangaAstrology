/**
 * GandantaraAndBhayaEngine.ts
 *
 * 100% Authentic Vedic Parashari Engine for:
 * 1. Gandantaragalu (ಗಂಡಾಂತರಗಳು / Critical Life Hazard Windows & Age Thresholds)
 *    - Jala Gandantara (ಜಲ ಗಂಡಾಂತರ - Aquatic/Deep Water Hazard) till safe age
 *    - Agni & Vidyut Gandantara (ಅಗ್ನಿ & ವಿದ್ಯುತ್ ಗಂಡಾಂತರ - Fire, Electrical & Burns Hazard) till safe age
 *    - Vahana & Margastha Apaghata (ವಾಹನ & ಅಪಘಾತ ಗಂಡಾಂತರ - Vehicle, Driving & Road Accidents) till safe age
 *    - Sarpa & Visha Gandantara (ಸರ್ಪ, ಕೀಟ & ವಿಷ ಗಂಡಾಂತರ - Snakebite, Venomous Creatures & Food Toxicity) till safe age
 *    - Prapata / Patana Gandantara (ಎತ್ತರದಿಂದ ಬೀಳುವ ಗಂಡಾಂತರ - Heights & Fall Hazard) till safe age
 *    - Shastra & Raktasrava Gandantara (ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ & ರಕ್ತಸ್ರಾವ ಗಂಡಾಂತರ - Sharp Weapons, Surgical & Bleeding Hazard) till safe age
 *
 * 2. Innate Subconscious Phobias & Mental Fears (ಅಂತರ್ಗತ ಮನೋಭಯಗಳು & ಭೀತಿಗಳು)
 *    - Jala Bhaya / Hydrophobia (ಜಲ ಭಯ - Deep Water Phobia)
 *    - Agni Bhaya / Pyrophobia (ಅಗ್ನಿ ಭಯ - Fire Phobia)
 *    - Sarpa Bhaya / Ophidiophobia (ಸರ್ಪ ಭಯ - Snake & Reptile Dread)
 *    - Rakta Bhaya / Hemophobia (ರಕ್ತ ಭಯ - Blood & Needles Dread / Fainting)
 *    - Uchchata Bhaya / Acrophobia (ಎತ್ತರ ಭಯ - Heights & Vertigo)
 *    - Andhakara & Ekantata Bhaya / Nyctophobia (ಕತ್ತಲೆ & ಒಂಟಿತನ ಭಯ - Darkness & Isolation Dread)
 *    - Samajika Apakirti Bhaya / Glossophobia (ಸಾಮಾಜಿಕ ನಿಂದಾ & ಸಭಾ ಭಯ - Social & Public Humiliation Phobia)
 *    - Mrityu & Akasmika Bhaya / Thanatophobia (ಅನಿರೀಕ್ಷಿತ ಆಕಸ್ಮಿಕ & ಸಾವು ಭಯ - Panic Disorder & Death Dread)
 *
 * Computes:
 * - Exact Janma Kundli planetary triggers (Houses, Grahas, Rashis)
 * - Safe Age Threshold (ನಿರ್ಣೀತ ಗಂಡಾಂತರ ವಯೋಮಿತಿ - till what age hazard is active)
 * - Status relative to native's current age (Currently in Danger Window vs Passed & Safe)
 * - Running Dasha-Bhukti resonance
 * - Practical Precautions & Behavioral Restrictions ("Don't swim in deep rivers till age 28", etc.)
 * - Sacred Vedic Shanti, Kavachas & Mantras
 *
 * Fully localized across 5 languages: kn, hi, te, ta, en.
 */

import type { KundliInput, KundliOutput, PlanetPosition } from "./AstroTypes";
import { PlanetName, PlanetName as PN } from "./AstroTypes";
import {
  calculateDecimalAgeAtDate
} from "./DashaSandhiAndRoadmapEngine";
import {
  generateDashaTimeline,
  generateBhuktiTimeline
} from "./DashaBhuktiEngine";
import { toKannadaPlanet } from "../utils/kannadaAstrologyTerms";
import { rashiIndexInHouse, signLord } from "./KundliInsightsEngine";

export type GandantaraType =
  | "jala"
  | "agni"
  | "vahana"
  | "sarpa"
  | "patana"
  | "shastra";

export type FearType =
  | "jala_bhaya"
  | "agni_bhaya"
  | "sarpa_bhaya"
  | "rakta_bhaya"
  | "uchchata_bhaya"
  | "andhakara_bhaya"
  | "samajika_bhaya"
  | "mrityu_bhaya";

export interface DetectedGandantara {
  id: string;
  type: GandantaraType;
  name: Record<string, string>;
  icon: string;
  isDetected: boolean;
  vulnerableTillAge: number;
  isCurrentlyInDangerWindow: boolean;
  currentAge: number;
  ageWindowDescription: Record<string, string>;
  grahasInvolved: string[];
  houseNumbers: number[];
  scripturalReference: string;
  technicalReason: Record<string, string>;
  dashaResonance: Record<string, string>;
  cautionDirectives: Record<string, string[]>;
  protectiveParihara: Record<string, string>;
  protectiveMantras: Record<string, string[]>;
}

export interface DetectedFear {
  id: string;
  type: FearType;
  name: Record<string, string>;
  icon: string;
  isDetected: boolean;
  severity: "high" | "moderate" | "mild";
  planetaryTrigger: Record<string, string>;
  psychologicalSymptom: Record<string, string>;
  realLifeManifestation: Record<string, string>;
  strengtheningPractice: Record<string, string>;
}

export interface GandantaraAndBhayaReport {
  currentAge: number;
  activeGandantarasCount: number;
  allGandantaras: DetectedGandantara[];
  activeGandantaras: DetectedGandantara[];
  detectedFears: DetectedFear[];
  runningDashaStr: string;
}

const getPlanet = (kundli: KundliOutput, name: PlanetName): PlanetPosition | undefined => {
  return kundli.planets.find((p) => p.name === name);
};

export const calculateGandantaraAndBhaya = (
  kundli: KundliOutput,
  input: KundliInput,
  currentDate: Date = new Date()
): GandantaraAndBhayaReport => {
  const currentAge = calculateDecimalAgeAtDate(input.birthDate, currentDate);

  const sun = getPlanet(kundli, PN.Sun);
  const moon = getPlanet(kundli, PN.Moon);
  const mars = getPlanet(kundli, PN.Mars);
  const mercury = getPlanet(kundli, PN.Mercury);
  const jupiter = getPlanet(kundli, PN.Jupiter);
  const venus = getPlanet(kundli, PN.Venus);
  const saturn = getPlanet(kundli, PN.Saturn);
  const rahu = getPlanet(kundli, PN.Rahu);
  const ketu = getPlanet(kundli, PN.Ketu);

  const lagnaRashiIdx = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const moonRashiIdx = moon ? moon.rashi.index : 0;

  // Running Dasha calculation
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
  const runningDashaStr = `${activeMahaKn} - ${activeBhuktiKn}`;

  // Water rashis (Cancer=3, Scorpio=7, Pisces=11)
  const isWaterRashi = (rIdx: number) => [3, 7, 11].includes(rIdx);
  // Fiery rashis (Aries=0, Leo=4, Sagittarius=8)
  const isFireRashi = (rIdx: number) => [0, 4, 8].includes(rIdx);
  // Airy rashis (Gemini=2, Libra=6, Aquarius=10)
  const isAirRashi = (rIdx: number) => [2, 6, 10].includes(rIdx);

  const fourthRashiIdx = rashiIndexInHouse(lagnaRashiIdx, 4);
  const fourthLordName = signLord(fourthRashiIdx);
  const fourthLord = getPlanet(kundli, fourthLordName);

  const eighthRashiIdx = rashiIndexInHouse(lagnaRashiIdx, 8);
  const eighthLordName = signLord(eighthRashiIdx);
  const eighthLord = getPlanet(kundli, eighthLordName);

  const sixthRashiIdx = rashiIndexInHouse(lagnaRashiIdx, 6);
  const sixthLordName = signLord(sixthRashiIdx);
  const sixthLord = getPlanet(kundli, sixthLordName);

  // Helper for dasha resonance
  const buildDashaResonance = (
    triggerPlanets: PlanetName[],
    hazardNameKn: string
  ): Record<string, string> => {
    const isDirectMatch =
      triggerPlanets.includes(activeMahaPlanet) ||
      triggerPlanets.includes(activeBhuktiPlanet);

    if (isDirectMatch) {
      return {
        kn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${activeMahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${activeBhuktiKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದ್ದು, ಇವು ನೇರವಾಗಿ ಈ ${hazardNameKn}ದ ಕಾರಕ ಗ್ರಹಗಳಾಗಿವೆ. ಆದ್ದರಿಂದ ಪ್ರಸ್ತುತ ಈ ಕಾಲದಲ್ಲಿ ಹೆಚ್ಚಿನ ಜಾಗರೂಕತೆ ಅತ್ಯಗತ್ಯ.`,
        hi: `वर्तमान में ${activeMahaPlanet} महादशा में ${activeBhuktiPlanet} भुक्ति चल रही है, जो सीधे इस संकट कारक ग्रह से संबंधित है। अतः वर्तमान समय में विशेष सतर्कता आवश्यक है।`,
        te: `ప్రస్తుతం ${activeMahaPlanet} మహాదశలో ${activeBhuktiPlanet} భుక్తి నడుస్తోంది. ఈ కాలంలో ఈ ప్రమాద సూచనపై అత్యంత అప్రమత్తత అవసరం.`,
        ta: `தற்போது ${activeMahaPlanet} மகாதிசை - ${activeBhuktiPlanet} புத்தி நடப்பில் உள்ளது. இந்த காலகட்டத்தில் கூடுதல் எச்சரிக்கையுடன் இருக்க வேண்டும்.`,
        en: `Currently running ${activeMahaPlanet} Mahadasha with ${activeBhuktiPlanet} Antardasha, which directly rules the trigger planets for this hazard. Heightened vigilance is required right now.`
      };
    }

    return {
      kn: `ಪ್ರಸ್ತುತ ${activeMahaKn}-${activeBhuktiKn} ಕಾಲ ನಡೆಯುತ್ತಿದ್ದು, ಈ ಗಂಡಾಂತರವು ಜಾತಕದ ವಯೋಮಿತಿಯ ಅನ್ವಯ ಎಚ್ಚರಿಕೆಯ ಹಂತದಲ್ಲಿದೆ.`,
      hi: `वर्तमान दशा क्रम सामान्य है, तथापि आयु सीमा के अनुसार सावधानी अपेक्षित है।`,
      te: `ప్రస్తుత దశ సాధారణంగా ఉన్నప్పటికీ, నిర్ణీత వయస్సు వరకు జాగ్రత్తలు పాటించాలి.`,
      ta: `தற்போதைய திசை சீராக இருந்தாலும், குறிப்பிட்ட வயது வரை விழிப்புணர்வு தேவை.`,
      en: `Currently traversing ${activeMahaPlanet}-${activeBhuktiPlanet} cycle. General adherence to prescribed safety age boundaries is advised.`
    };
  };

  const gandantaras: DetectedGandantara[] = [];

  // ==========================================================================
  // 1. JALA GANDANTARA (ಜಲ ಗಂಡಾಂತರ - Water / Aquatic Hazard)
  // ==========================================================================
  const jalaGrahas: string[] = [];
  const jalaHouses: number[] = [];
  let isJalaActive = false;
  let jalaSafeAge = 28;

  if (moon) {
    if ([6, 8, 12].includes(moon.house)) {
      isJalaActive = true;
      jalaGrahas.push("Moon");
      jalaHouses.push(moon.house);
    }
    if (moon.rashi.index === 7) { // Scorpio debilitation
      isJalaActive = true;
      jalaGrahas.push("Moon (Neecha)");
      jalaHouses.push(moon.house);
      jalaSafeAge = 32;
    }
    if (rahu && (rahu.house === moon.house || Math.abs(rahu.degree - moon.degree) < 15)) {
      isJalaActive = true;
      jalaGrahas.push("Rahu");
      jalaHouses.push(moon.house);
      jalaSafeAge = 32;
    }
    if (saturn && (saturn.house === moon.house || Math.abs(saturn.degree - moon.degree) < 15)) {
      isJalaActive = true;
      jalaGrahas.push("Saturn");
      jalaHouses.push(moon.house);
      jalaSafeAge = 36;
    }
  }

  if (mars && mars.house === 8 && isWaterRashi(eighthRashiIdx)) {
    isJalaActive = true;
    jalaGrahas.push("Mars in 8th (Water Rashi)");
    jalaHouses.push(8);
    jalaSafeAge = 28;
  }

  if (isJalaActive) {
    const isUnderDanger = currentAge <= jalaSafeAge;
    gandantaras.push({
      id: "gandantara_jala",
      type: "jala",
      name: {
        kn: "ಜಲ ಗಂಡಾಂತರ (Deep Water & Aquatic Hazard)",
        hi: "जल गंडांतर (जलीय एवं गहरे जल का संकट)",
        te: "జల గండాంతరం (లోతైన నీటి ప్రమాద సూచన)",
        ta: "ஜல கண்டாந்தரம் (ஆழமான நீர் நிலைப் பேராபத்து)",
        en: "Jala Gandantara (Deep Water & Drowning Hazard)"
      },
      icon: "🌊",
      isDetected: true,
      vulnerableTillAge: jalaSafeAge,
      isCurrentlyInDangerWindow: isUnderDanger,
      currentAge,
      ageWindowDescription: {
        kn: isUnderDanger
          ? `⚠️ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಗಂಡಾಂತರ ವಯೋಮಿತಿ: ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸು ${Math.floor(currentAge)} ಆಗಿದ್ದು, ${jalaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಜಲ ಗಂಡಾಂತರ ಕಾಲ ಸಕ್ರಿಯವಾಗಿದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ನೀರಿನ ಸಾಹಸಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ.`
          : `✅ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ದಾಟಿದೆ: ${jalaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಇದ್ದ ಜಲ ಗಂಡಾಂತರ ಕಾಲವು ಪೂರ್ಣಗೊಂಡಿದೆ. ಆದರೂ ಸಾಮಾನ್ಯ ಸುರಕ್ಷತಾ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಿ.`,
        hi: isUnderDanger
          ? `⚠️ वर्तमान में सक्रिय संकट काल: आपकी वर्तमान आयु ${Math.floor(currentAge)} वर्ष है तथा ${jalaSafeAge} वर्ष की आयु तक जल संकट काल प्रभावी है। गहरे जल से दूर रहें।`
          : `✅ सुरक्षित आयु सीमा पार: ${jalaSafeAge} वर्ष तक का जल गंडांतर काल अब समाप्त हो चुका है।`,
        te: isUnderDanger
          ? `⚠️ ప్రస్తుతం ప్రమాదకర వయస్సు: మీ ప్రస్తుత వయస్సు ${Math.floor(currentAge)} కాగా, ${jalaSafeAge} సంవత్సరాల వరకు జల గండాంతరం ఉంది. నీటి సాహసాలు వద్దు.`
          : `✅ సురక్షిత వయస్సు దాటింది: ${jalaSafeAge} సంవత్సరాల వరకు ఉన్న జల గండాంతరం గడిచిపోయింది.`,
        ta: isUnderDanger
          ? `⚠️ தற்போது தீவிர காலகட்டம்: தங்களின் வயது ${Math.floor(currentAge)}; ${jalaSafeAge} வயது வரை நீர்நிலைகளில் ஆபத்து உள்ளது. ஆழமான நீரில் இறங்க வேண்டாம்.`
          : `✅ பாதுகாப்பு எல்லை கடந்தது: ${jalaSafeAge} வயது வரை இருந்த ஜல கண்டாந்தர காலம் முடிந்தது.`,
        en: isUnderDanger
          ? `⚠️ Currently Active Vulnerability Window: Current age is ${Math.floor(currentAge)}; critical water hazard window operates until Age ${jalaSafeAge}. Strictly avoid deep water ventures.`
          : `✅ Safe Threshold Surpassed: The acute Jala Gandantara window (till Age ${jalaSafeAge}) has elapsed safely. Continue standard precautions.`
      },
      grahasInvolved: jalaGrahas,
      houseNumbers: jalaHouses,
      scripturalReference: "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ - ಜಲಾರೀಷ್ಟ ಯೋಗ (Phaladeepika Ch. 14)",
      technicalReason: {
        kn: `ಜಾತಕದಲ್ಲಿ ಜಲ ಕಾರಕ ಚಂದ್ರನು ${jalaHouses.join(", ")}ನೇ ದುಸ್ಥಾನದಲ್ಲಿದ್ದು ಅಥವಾ ರಾಹು/ಶನಿ ಯುತಿಯಿಂದ ಜಲ ತತ್ತ್ವದ ಮೇಲೆ ತೀವ್ರ ಪೀಡೆ ಉಂಟಾಗಿದೆ.`,
        hi: `कुंडली में जल कारक चंद्र ${jalaHouses.join(", ")}वें भाव में स्थित अथवा राहु/शनि से आक्रांत होने से जलीय संकट का योग बनता है।`,
        te: `కుండలిలో చంద్రుడు ${jalaHouses.join(", ")}వ స్థానంలో బాధితమై ఉండటం వల్ల జల గండాంతరం ఏర్పడింది.`,
        ta: `சந்திரன் ${jalaHouses.join(", ")}ஆம் பாவத்தில் ராகு/சனியுடன் கூடி பலவீனமடைந்துள்ளதால் ஜல கண்டாந்தரம் உருவாகியுள்ளது.`,
        en: `Moon (ruler of water and mind) is afflicted in house(s) ${jalaHouses.join(", ")} or conjunct Rahu/Saturn in water signs, creating acute aquatic vulnerability.`
      },
      dashaResonance: buildDashaResonance([PN.Moon, PN.Rahu, PN.Saturn], "ಜಲ ಗಂಡಾಂತರ"),
      cautionDirectives: {
        kn: [
          `${jalaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಸಮುದ್ರ ಸ್ನಾನ, ಆಳವಾದ ನದಿ, ಈಜು ಕೊಳ, ಜಲಪಾತ ಹಾಗೂ ಬೋಟಿಂಗ್ ಸಾಹಸಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ.`,
          "ಮಳೆಗಾಲದಲ್ಲಿ ಹಾಗೂ ರಾತ್ರಿ ವೇಳೆಯಲ್ಲಿ ಜಲಮೂಲಗಳ ಸಮೀಪ ಹೋಗುವುದನ್ನು ನಿಷೇಧಿಸಲಾಗಿದೆ.",
          "ಈಜು ಬಾರದಿದ್ದರೂ ಅಥವಾ ಬಂದರೂ ನಂಬಿಕೆ ಇಲ್ಲದ ಅಜ್ಞಾತ ಜಲಮೂಲಗಳಿಗೆ ಇಳಿಯಬಾರದು."
        ],
        hi: [
          `${jalaSafeAge} वर्ष की आयु तक गहरे समुद्र, नदी, जलप्रपात एवं नौका विहार के जोखिम से पूर्णतः बचें।`,
          "वर्षा ऋतु में एवं रात्रि के समय नदियों अथवा तालाबों के निकट न जाएं।",
          "अज्ञात जलस्रोतों में तैराकी का जोखिम कभी न उठाएं।"
        ],
        te: [
          `${jalaSafeAge} సంవత్సరాలు వచ్చేవరకు సముద్ర స్నానాలు, లోతైన నదులు, జలపాతాలు మరియు బోటింగ్‌లకు దూరంగా ఉండండి.`,
          "రాత్రి సమయాల్లో మరియు భారీ వర్షాల్లో నీటి ప్రవాహాల వద్దకు వెళ్లరాదు."
        ],
        ta: [
          `${jalaSafeAge} வயது வரை ஆழ்கடல் குளியல், காட்டாறுகள் மற்றும் படகு சவாரிகளை முழுமையாகத் தவிர்க்கவும்.`,
          "இரவு நேரங்களில் நீர்நிலைகளின் அருகில் செல்வதைத் தவிர்க்கவும்."
        ],
        en: [
          `Strictly avoid ocean bathing, deep river swimming, rapids, waterfalls, and adventure boating until Age ${jalaSafeAge}.`,
          "Do not venture near swelling water bodies during monsoons or late evening/night hours.",
          "Never enter unfamiliar reservoirs or step onto slippery riverbanks even in groups."
        ]
      },
      protectiveParihara: {
        kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ವರುಣ ಶಾಂತಿ' ಹಾಗೂ 'ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹವನ'",
        hi: "गोकर्ण में 'वरुण शांति' एवं 'महामृत्युंजय हवन'",
        te: "గోకర్ణంలో 'వరుణ శాంతి' & 'మహామృత్యుంజయ హోమం'",
        ta: "கோகர்ணத்தில் 'வருண சாந்தி' & 'மகா மிருத்யுஞ்ஜய ஹோமம்'",
        en: "Varuna Shanti & Maha Mrityunjaya Homa at Gokarna Kshetra"
      },
      protectiveMantras: {
        kn: ["ನಿತ್ಯವೂ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ.", "ವರುಣ ಗಾಯತ್ರೀ ಮಂತ್ರ ಪಠಿಸಿ."],
        hi: ["नित्य 'ॐ नमः शिवाय' एवं महामृत्युंजय मंत्र जपें।"],
        te: ["నిత్యం మహా మృత్యుంజయ మంత్రం జపించండి."],
        ta: ["தினசரி மகா மிருத்யுஞ்ஜய மந்திரம் ஜபிக்கவும்."],
        en: ["Recite Maha Mrityunjaya Mantra 11 times daily before traveling."]
      }
    });
  }

  // ==========================================================================
  // 2. VAHANA & APAGHATA GANDANTARA (ವಾಹನ & ಅಪಘಾತ ಗಂಡಾಂತರ - Vehicle / Accident)
  // ==========================================================================
  const vahanaGrahas: string[] = [];
  const vahanaHouses: number[] = [];
  let isVahanaActive = false;
  let vahanaSafeAge = 32;

  if (mars && (mars.house === 4 || mars.house === 8)) {
    isVahanaActive = true;
    vahanaGrahas.push("Mars");
    vahanaHouses.push(mars.house);
    vahanaSafeAge = 28;
  }
  if (rahu && (rahu.house === 4 || rahu.house === 8)) {
    isVahanaActive = true;
    vahanaGrahas.push("Rahu");
    vahanaHouses.push(rahu.house);
    vahanaSafeAge = 36;
  }
  if (fourthLord && [6, 8, 12].includes(fourthLord.house)) {
    isVahanaActive = true;
    vahanaGrahas.push(`4th Lord (${fourthLordName}) in ${fourthLord.house}th`);
    vahanaHouses.push(4, fourthLord.house);
  }

  if (isVahanaActive) {
    const isUnderDanger = currentAge <= vahanaSafeAge;
    gandantaras.push({
      id: "gandantara_vahana",
      type: "vahana",
      name: {
        kn: "ವಾಹನ & ಮಾರ್ಗ ಅಪಘಾತ ಗಂಡಾಂತರ (Vehicle & Road Hazard)",
        hi: "वाहन एवं मार्ग दुर्घटना गंडांतर (Road & Vehicular Hazard)",
        te: "వాహన & మార్గ ప్రమాద గండాంతరం (Vehicle Hazard)",
        ta: "வாகன விபத்து கண்டாந்தரம் (Vehicle & Road Hazard)",
        en: "Vahana & Road Accident Gandantara (Vehicular Vulnerability)"
      },
      icon: "🚗",
      isDetected: true,
      vulnerableTillAge: vahanaSafeAge,
      isCurrentlyInDangerWindow: isUnderDanger,
      currentAge,
      ageWindowDescription: {
        kn: isUnderDanger
          ? `⚠️ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಗಂಡಾಂತರ ವಯೋಮಿತಿ: ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸು ${Math.floor(currentAge)} ಆಗಿದ್ದು, ${vahanaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ವಾಹನ ಗಂಡಾಂತರ ಅವಧಿಯಿದೆ. ವೇಗದ ಚಾಲನೆ ಹಾಗೂ ರಾತ್ರಿ ಪಯಣ ತಪ್ಪಿಸಿ.`
          : `✅ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ದಾಟಿದೆ: ${vahanaSafeAge}ನೇ ವಯಸ್ಸಿನ ತೀವ್ರ ವಾಹನ ಗಂಡಾಂತರ ಕಾಲ ದಾಟಿದೆ. ಆದರೂ ನಿತ್ಯ ರಕ್ಷಣಾ ಸ್ತೋತ್ರ ಪಠಣ ಉತ್ತಮ.`,
        hi: isUnderDanger
          ? `⚠️ वर्तमान संकट काल: आयु ${Math.floor(currentAge)} वर्ष है; ${vahanaSafeAge} वर्ष तक तेज गति से वाहन चलाने एवं रात्रि यात्राओं से पूर्ण बचाव करें।`
          : `✅ सुरक्षा सीमा पार: ${vahanaSafeAge} वर्ष तक का गंभीर वाहन गंडांतर काल समाप्त हो चुका है।`,
        te: isUnderDanger
          ? `⚠️ ప్రస్తుత ప్రమాద కాలం: ${vahanaSafeAge} సంవత్సరాల వరకు ద్విచక్ర వాహనాల వేగవంతమైన ప్రయాణాలు నివారించండి.`
          : `✅ సంరక్షణ వయస్సు దాటింది.`,
        ta: isUnderDanger
          ? `⚠️ தீவிர எச்சரிக்கை: ${vahanaSafeAge} வயது வரை அதிவேக வாகன ஓட்டுதலை முழுமையாகத் தவிர்க்கவும்.`
          : `✅ விபத்து கண்டாந்தர எல்லை கடந்தது.`,
        en: isUnderDanger
          ? `⚠️ Currently Active Danger Window: Native is age ${Math.floor(currentAge)}; acute vehicular collision risk persists until Age ${vahanaSafeAge}. Defensive driving is paramount.`
          : `✅ Safe Threshold Surpassed: Critical high-risk vehicular threshold (till Age ${vahanaSafeAge}) has elapsed.`
      },
      grahasInvolved: vahanaGrahas,
      houseNumbers: vahanaHouses,
      scripturalReference: "ಜಾತಕ ಪಾರಿಜಾತ - ವಾಹನ ಪೀಡಾ ಅಧ್ಯಾಯ (Jataka Parijata)",
      technicalReason: {
        kn: `ವಾಹನ ಸ್ಥಾನವಾದ 4ನೇ ಭಾವ ಅಥವಾ 8ನೇ ರಂಧ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕುಜ/ರಾಹು ಸಂಚಾರ ಅಥವಾ 4ನೇ ಅಧಿಪತಿ ದುಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ವಾಹನ ಅಪಘಾತದ ಯೋಗವಿದೆ.`,
        hi: `चतुर्थ भाव (वाहन भाव) अथवा अष्टम भाव में मंगल/राहु की दृष्टि या स्थिति वाहन संकट को दर्शाती है।`,
        te: `4వ స్థానంలో కుజుడు/రాహువు ఉండటం వల్ల వాహన ప్రమాదాల సూచన ఉంది.`,
        ta: `4ஆம் பாவத்தில் செவ்வாய் அல்லது ராகு அமர்ந்திருப்பதால் வாகன ஆபத்து காணப்படுகிறது.`,
        en: `4th house (vehicles) or 8th house (accidents) afflicted by Mars or Rahu, or 4th lord stationed in Dusthana.`
      },
      dashaResonance: buildDashaResonance([PN.Mars, PN.Rahu, PN.Saturn], "ವಾಹನ ಗಂಡಾಂತರ"),
      cautionDirectives: {
        kn: [
          `${vahanaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ದ್ವಿಚಕ್ರ ವಾಹನಗಳಲ್ಲಿ ಅತಿ ವೇಗವಾಗಿ ಚಲಿಸುವುದು ಹಾಗೂ ರಾತ್ರಿ ವೇಳೆ ಹೆದ್ದಾರಿ ಪಯಣ ಸಂಪೂರ್ಣ ತ್ಯಜಿಸಿ.`,
          "ನಿದ್ರಾವಸ್ಥೆಯಲ್ಲಿ ಅಥವಾ ಆಯಾಸಗೊಂಡಾಗ ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಡ್ರೈವಿಂಗ್ ಮಾಡಬಾರದು.",
          "ವಾಹನದಲ್ಲಿ ಯಾವಾಗಲೂ ಶ್ರೀ ಸುದರ್ಶನ ಅಥವಾ ಹನುಮಾನ್ ಯಂತ್ರ/ಚಿತ್ರವನ್ನು ಸ್ಥಾಪಿಸಿ."
        ],
        hi: [
          `${vahanaSafeAge} वर्ष की आयु तक दोपहिया वाहन पर तेज गति एवं देर रात राजमार्ग पर ड्राइविंग से बचें।`,
          "थकान या अनिद्रा की स्थिति में वाहन कभी न चलाएं।",
          "वाहन में हनुमान जी का यंत्र अथवा चित्र अवश्य रखें।"
        ],
        te: [
          `${vahanaSafeAge} ఏళ్ల వరకు రాత్రి వేళల్లో హైవే డ్రైవింగ్ మరియు వేగవంతమైన బైక్ ప్రయాణాలు మానండి.`,
          "హనుమాన్ చాలీసా నిత్యం పఠించండి."
        ],
        ta: [
          `${vahanaSafeAge} வயது வரை இரவு நேர நெடுஞ்சாலைப் பயணங்களையும் அதிவேக இருசக்கர வாகன ஓட்டுதலையும் தவிர்க்கவும்.`
        ],
        en: [
          `Strictly avoid high-speed two-wheeler driving and late-night highway travels until Age ${vahanaSafeAge}.`,
          "Never operate motor vehicles under fatigue, sleep deprivation, or emotional agitation.",
          "Keep an energized consecrated Hanuman or Sudarshana protective yantra in the vehicle."
        ]
      },
      protectiveParihara: {
        kn: "ಶ್ರೀ ಸುದರ್ಶನ ಹೋಮ & ವಾಹನ ರಕ್ಷಾ ಆಂಜನೇಯ ಪೂಜೆ",
        hi: "श्री सुदर्शन होम एवं संकटमोचन हनुमान पूजा",
        te: "శ్రీ సుదర్శన హోమం & ఆంజనేయ పూజ",
        ta: "ஸ்ரீ சுதர்சன ஹோமம் & ஆஞ்சநேயர் வழிபாடு",
        en: "Sri Sudarshana Homa & Sankat Mochan Hanuman Puja"
      },
      protectiveMantras: {
        kn: ["ಪ್ರತಿದಿನ ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ."],
        hi: ["यात्रा से पूर्व नित्य 'हनुमान चालीसा' का पाठ करें।"],
        te: ["ప్రయాణానికి ముందు హనుమాన్ చాలీసా పఠించండి."],
        ta: ["பயணத்திற்கு முன் அனுமன் சாலிசா படிக்கவும்."],
        en: ["Recite Sri Hanuman Chalisa or Sudarshana Kavacha before every journey."]
      }
    });
  }

  // ==========================================================================
  // 3. AGNI & VIDYUT GANDANTARA (ಅಗ್ನಿ & ವಿದ್ಯುತ್ ಗಂಡಾಂತರ - Fire & Electric Hazard)
  // ==========================================================================
  const agniGrahas: string[] = [];
  const agniHouses: number[] = [];
  let isAgniActive = false;
  let agniSafeAge = 28;

  if (mars && ketu && (mars.house === ketu.house || Math.abs(mars.degree - ketu.degree) < 15)) {
    isAgniActive = true;
    agniGrahas.push("Mars conjunct Ketu (Angaraka-Ketu)");
    agniHouses.push(mars.house);
    agniSafeAge = 35;
  }
  if (mars && sun && (mars.house === sun.house || Math.abs(mars.degree - sun.degree) < 10) && isFireRashi(mars.rashi.index)) {
    isAgniActive = true;
    agniGrahas.push("Mars conjunct Sun in Fire Rashi");
    agniHouses.push(mars.house);
    agniSafeAge = 28;
  }
  if (mars && mars.house === 8 && isFireRashi(eighthRashiIdx)) {
    isAgniActive = true;
    agniGrahas.push("Mars in 8th (Fire Rashi)");
    agniHouses.push(8);
  }

  if (isAgniActive) {
    const isUnderDanger = currentAge <= agniSafeAge;
    gandantaras.push({
      id: "gandantara_agni",
      type: "agni",
      name: {
        kn: "ಅಗ್ನಿ & ವಿದ್ಯುತ್ ಗಂಡಾಂತರ (Fire, Electrical & Burn Hazard)",
        hi: "अग्नि एवं विद्युत गंडांतर (Fire & Electric Burns Hazard)",
        te: "అగ్ని & విద్యుత్ గండాంతరం (Fire & Burns Hazard)",
        ta: "அக்னி & மின்சார கண்டாந்தரம் (Fire & Shock Hazard)",
        en: "Agni & Vidyut Gandantara (Fire, Thermal & Electrical Shock Hazard)"
      },
      icon: "🔥",
      isDetected: true,
      vulnerableTillAge: agniSafeAge,
      isCurrentlyInDangerWindow: isUnderDanger,
      currentAge,
      ageWindowDescription: {
        kn: isUnderDanger
          ? `⚠️ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಗಂಡಾಂತರ ವಯೋಮಿತಿ: ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸು ${Math.floor(currentAge)} ಆಗಿದ್ದು, ${agniSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಅಗ್ನಿ-ವಿದ್ಯುತ್ ಗಂಡಾಂತರ ಅವಧಿಯಿದೆ. ಬೆಂಕಿ, ಸ್ಫೋಟಕ ಹಾಗೂ ಹೈವೋಲ್ಟೇಜ್ ವಿದ್ಯುತ್ ಉಪಕರಣಗಳಿಂದ ಎಚ್ಚರವಹಿಸಿ.`
          : `✅ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ದಾಟಿದೆ: ${agniSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗಿನ ಅಗ್ನಿ ಗಂಡಾಂತರ ಹಂತ ಮುಕ್ತಾಯವಾಗಿದೆ.`,
        hi: isUnderDanger
          ? `⚠️ वर्तमान संकट काल: ${agniSafeAge} वर्ष की आयु तक अग्नि, गैस एवं उच्च विद्युत उपकरणों से अत्यधिक सतर्क रहें।`
          : `✅ सुरक्षा सीमा पार हो चुकी है।`,
        te: isUnderDanger
          ? `⚠️ ${agniSafeAge} ఏళ్ల వరకు అగ్ని మరియు విద్యుత్ ఉపకరణాలతో జాగ్రత్తగా ఉండండి.`
          : `✅ సురక్షిత వయస్సు దాటింది.`,
        ta: isUnderDanger
          ? `⚠️ ${agniSafeAge} வயது வரை தீ மற்றும் மின்சாதனங்களில் கூடுதல் கவனம் தேவை.`
          : `✅ அக்னி கண்டாந்தர எல்லை கடந்தது.`,
        en: isUnderDanger
          ? `⚠️ Currently Active Vulnerability Window: Native is Age ${Math.floor(currentAge)}; acute thermal burns and electrical hazards persist until Age ${agniSafeAge}.`
          : `✅ Safe Threshold Surpassed: Thermal/electrical vulnerability window has elapsed.`
      },
      grahasInvolved: agniGrahas,
      houseNumbers: agniHouses,
      scripturalReference: "ಬೃಹತ್ ಜಾತಕ - ಅಗ್ನಿ ದೋಷ ಯೋಗ (Brihat Jataka)",
      technicalReason: {
        kn: `ಅಗ್ನಿ ಕಾರಕ ಕುಜನು ಕೇತು ಅಥವಾ ಸೂರ್ಯನೊಂದಿಗೆ ಅಗ್ನಿ ತತ್ತ್ವದ ರಾಶಿಯಲ್ಲಿ ಸಂಯೋಗಗೊಂಡಿರುವುದರಿಂದ ಅಗ್ನಿ-ವಿದ್ಯುತ್ ಪೀಡೆ ಉಂಟಾಗಿದೆ.`,
        hi: `अग्नि तत्व राशि में मंगल-केतु अथवा मंगल-सूर्य की युति से अग्नि एवं करंट का संकट योग बनता है।`,
        te: `అగ్ని తత్వంలో కుజ-కేతు సంయోగం వల్ల విద్యుత్ మరియు అగ్ని గండాంతరం ఉంది.`,
        ta: `நெருப்பு ராசியில் செவ்வாய்-கேது கூடி இருப்பதால் அக்னி ஆபத்து உண்டாகிறது.`,
        en: `Fiery element Mars conjunct Ketu or Sun in fire signs / 8th house, signifying acute risk of burns, boiling liquids, or high voltage.`
      },
      dashaResonance: buildDashaResonance([PN.Mars, PN.Sun, PN.Ketu], "ಅಗ್ನಿ ಗಂಡಾಂತರ"),
      cautionDirectives: {
        kn: [
          `${agniSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ದುರಸ್ತಿ, ಪಟಾಕಿ ಸಿಡಿಸುವುದು, ಹೈವೋಲ್ಟೇಜ್ ತಂತಿಗಳು ಹಾಗೂ ಕುದಿಯುವ ಎಣ್ಣೆ/ನೀರಿನ ಕೆಲಸಗಳಲ್ಲಿ ನೇರವಾಗಿ ತೊಡಗಬೇಡಿ.`,
          "ವಿದ್ಯುತ್ ಶಾರ್ಟ್ ಸರ್ಕ್ಯೂಟ್ ನಿರೋಧಕಗಳನ್ನು ಮನೆಯಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
        ],
        hi: [
          `${agniSafeAge} वर्ष तक गैस रिपेयरिंग, आतिशबाजी एवं हाई-वोल्टेज तारों से दूर रहें।`,
          "घर में विद्युत सुरक्षा उपकरण अवश्य लगवाएं।"
        ],
        te: [
          `${agniSafeAge} ఏళ్ల వరకు బాణసంచా మరియు కరెంట్ పనులకు దూరంగా ఉండండి.`
        ],
        ta: [
          `${agniSafeAge} வயது வரை வெடிபொருட்கள் மற்றும் மின்சார பழுதுபார்க்கும் பணிகளில் ஈடுபட வேண்டாம்.`
        ],
        en: [
          `Strictly avoid DIY high-voltage electrical repairs, gas cylinder maintenance, explosive fireworks, and handling boiling vats until Age ${agniSafeAge}.`,
          "Ensure top-grade residual current circuit breakers (RCCB) are installed at domicile."
        ]
      },
      protectiveParihara: {
        kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಸನ್ನಿಧಿಯಲ್ಲಿ 'ಅಗ್ನಿ ಶಾಂತಿ' ಹಾಗೂ 'ಕುಜ-ಕೇತು ಹವನ'",
        hi: "भगवान कार्तिकेय / सुब्रह्मण्य स्वामी को 'अग्नि शांति' पूजा",
        te: "సుబ్రహ్మణ్య స్వామికి అభిషేకం & కుజ-కేతు శాంతి",
        ta: "முருகப் பெருமானுக்கு அக்னி சாந்தி பூஜை",
        en: "Subrahmanya Swamy Agni Shanti & Kuja-Ketu Homa"
      },
      protectiveMantras: {
        kn: ["ನಿತ್ಯವೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಗಾಯತ್ರೀ ಅಥವಾ ಷಣ್ಮುಖ ಸ್ತೋತ್ರ ಪಠಿಸಿ."],
        hi: ["नित्य 'ॐ सुब्रह्मण्याय नमः' अथवा कार्तिकेय स्तोत्र का पाठ करें।"],
        te: ["సుబ్రహ్మణ్య గాయత్రీ మంత్రం జపించండి."],
        ta: ["தினசரி கந்த சஷ்டி கவசம் பாராயணம் செய்யவும்."],
        en: ["Recite Subrahmanya Gayatri or Kartikeya Raksha Kavacha daily."]
      }
    });
  }

  // ==========================================================================
  // 4. SARPA & VISHA GANDANTARA (ಸರ್ಪ & ವಿಷ ಗಂಡಾಂತರ - Snakebite & Toxicity)
  // ==========================================================================
  const sarpaGrahas: string[] = [];
  const sarpaHouses: number[] = [];
  let isSarpaActive = false;
  let sarpaSafeAge = 36;

  if (rahu && (rahu.house === 2 || rahu.house === 8)) {
    isSarpaActive = true;
    sarpaGrahas.push(`Rahu in ${rahu.house}th (Maraka/Randhra)`);
    sarpaHouses.push(rahu.house);
    sarpaSafeAge = 42;
  }
  if (moon && moon.rashi.index === 7 && rahu) { // Moon in Scorpio with Rahu influence
    isSarpaActive = true;
    sarpaGrahas.push("Moon in Scorpio with Rahu");
    sarpaHouses.push(moon.house);
    sarpaSafeAge = 36;
  }

  if (isSarpaActive) {
    const isUnderDanger = currentAge <= sarpaSafeAge;
    gandantaras.push({
      id: "gandantara_sarpa",
      type: "sarpa",
      name: {
        kn: "ಸರ್ಪ, ಕೀಟ & ವಿಷ ಗಂಡಾಂತರ (Reptile, Venom & Toxin Hazard)",
        hi: "सर्प, कीट एवं विष गंडांतर (Reptile & Poison Hazard)",
        te: "సర్ప & విష గండాంతరం (Reptile & Toxin Hazard)",
        ta: "சர்ப்ப & விஷ கண்டாந்தரம் (Serpent & Poison Hazard)",
        en: "Sarpa & Visha Gandantara (Snakebite, Venomous Creatures & Toxin Hazard)"
      },
      icon: "🐍",
      isDetected: true,
      vulnerableTillAge: sarpaSafeAge,
      isCurrentlyInDangerWindow: isUnderDanger,
      currentAge,
      ageWindowDescription: {
        kn: isUnderDanger
          ? `⚠️ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಗಂಡಾಂತರ ವಯೋಮಿತಿ: ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸು ${Math.floor(currentAge)} ಆಗಿದ್ದು, ${sarpaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಸರ್ಪ-ವಿಷ ಗಂಡಾಂತರ ಅವಧಿಯಿದೆ. ಕತ್ತಲೆಯ ಕಾಡು, ಪೊದೆ, ಹಳೆಯ ಕಟ್ಟಡಗಳು ಹಾಗೂ ಅಜ್ಞಾತ ಆಹಾರ ಪದಾರ್ಥಗಳ ಸೇವನೆಯಲ್ಲಿ ಎಚ್ಚರವಹಿಸಿ.`
          : `✅ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ದಾಟಿದೆ: ${sarpaSafeAge}ನೇ ವಯಸ್ಸಿನ ವಿಷ ಗಂಡಾಂತರ ಕಾಲ ಸಂಪೂರ್ಣ ಮುಗಿದಿದೆ.`,
        hi: isUnderDanger
          ? `⚠️ वर्तमान संकट काल: ${sarpaSafeAge} वर्ष तक झाड़ियों, अंधेरी जगहों में सर्पदंश एवं फूड पॉइजनिंग से विशेष सावधानी रखें।`
          : `✅ सुरक्षा सीमा पार हो चुकी है।`,
        te: isUnderDanger
          ? `⚠️ ${sarpaSafeAge} ఏళ్ల వరకు పాములు మరియు విష కీటకాలతో జాగ్రత్తగా ఉండండి.`
          : `✅ సురక్షిత వయస్సు దాటింది.`,
        ta: isUnderDanger
          ? `⚠️ ${sarpaSafeAge} வயது வரை விஷப் பூச்சிகள் மற்றும் பாம்புகளிடம் எச்சரிக்கை தேவை.`
          : `✅ சர்ப்ப கண்டாந்தர எல்லை கடந்தது.`,
        en: isUnderDanger
          ? `⚠️ Currently Active Vulnerability Window: Native is Age ${Math.floor(currentAge)}; acute snakebite, venomous insect, or food toxicity hazard persists until Age ${sarpaSafeAge}.`
          : `✅ Safe Threshold Surpassed: Venomous creature hazard window has elapsed.`
      },
      grahasInvolved: sarpaGrahas,
      houseNumbers: sarpaHouses,
      scripturalReference: "ಫಲದೀಪಿಕಾ - ಸರ್ಪ ವಿಷ ಯೋಗ (Phaladeepika Ch. 13)",
      technicalReason: {
        kn: `ಮೃತ್ಯು ಅಥವಾ ಮಾರಕ ಸ್ಥಾನಗಳಾದ 2 ಅಥವಾ 8ನೇ ಭಾವದಲ್ಲಿ ಸರ್ಪ ಕಾರಕ ರಾಹು ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ ವಿಷ ಹಾಗೂ ಉರಗ ಗಂಡಾಂತರ ಸೂಚಿತವಾಗಿದೆ.`,
        hi: `द्वितीय अथवा अष्टम भाव में राहु की स्थिति सर्प एवं विष जनित बाधा का योग बनाती है।`,
        te: `2 లేదా 8వ స్థానంలో రాహువు వల్ల సర్ప గండాంతరం ఏర్పడింది.`,
        ta: `2 அல்லது 8ஆம் பாவத்தில் ராகு அமர்ந்திருப்பதால் சர்ப்ப கண்டாந்தரம் உள்ளது.`,
        en: `Rahu (karaka of venom and serpents) positioned in 2nd Maraka or 8th Randhra house, causing vulnerability to venomous creatures and systemic toxicities.`
      },
      dashaResonance: buildDashaResonance([PN.Rahu, PN.Ketu], "ಸರ್ಪ ಗಂಡಾಂತರ"),
      cautionDirectives: {
        kn: [
          `${sarpaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಕತ್ತಲೆಯಲ್ಲಿ ಬೆಳಕಿಲ್ಲದೆ ನಡೆಯುವುದು, ಪೊದೆ-ಹುತ್ತಗಳ ಬಳಿ ಹೋಗುವುದು ಹಾಗೂ ಕಾಡುಗಳಲ್ಲಿ ಬರಿಗಾಲಿನಲ್ಲಿ ನಡೆಯುವುದನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಿ.`,
          "ಆಹಾರ ಸೇವಿಸುವ ಮುನ್ನ ನೈರ್ಮಲ್ಯ ಹಾಗೂ ಗಡುವಿನ ದಿನಾಂಕವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ (ಫುಡ್ ಪಾಯಿಸನಿಂಗ್ ಎಚ್ಚರಿಕೆ)."
        ],
        hi: [
          `${sarpaSafeAge} वर्ष की आयु तक अंधेरे रास्तों, झाड़ियों में बिना टॉर्च न जाएं।`,
          "खाद्य पदार्थों की शुद्धता एवं एक्सपायरी डेट का विशेष ध्यान रखें।"
        ],
        te: [
          `${sarpaSafeAge} ఏళ్ల వరకు చీకటి ప్రదేశాల్లో చెప్పులు లేకుండా నడవవద్దు.`
        ],
        ta: [
          `${sarpaSafeAge} வயது வரை புதர்கள் நிறைந்த பகுதிகளில் பாதுகாப்பற்ற முறையில் செல்ல வேண்டாம்.`
        ],
        en: [
          `Strictly avoid traversing unlit rural paths, dense undergrowth, ruins, or dense forest floor barefoot until Age ${sarpaSafeAge}.`,
          "Meticulously inspect food items and pharmaceuticals for expiration and sanitary storage to avoid acute systemic toxic reactions."
        ]
      },
      protectiveParihara: {
        kn: "ಕುಕ್ಕೆ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಗೋಕರ್ಣದಲ್ಲಿ 'ಆಶ್ಲೇಷಾ ಬಲಿ' ಹಾಗೂ 'ಸರ್ಪ ಸಂಸ್ಕಾರ ಶಾಂತಿ'",
        hi: "कुक्के सुब्रह्मण्य अथवा गोकर्ण में 'आश्लेषा बलि' एवं 'सर्प संस्कार'",
        te: "కుక్కే సుబ్రహ్మణ్య లేదా గోకర్ణంలో 'ఆశ్లేష బలి' పూజ",
        ta: "குக்கே சுப்பிரமணியா அல்லது கோகர்ணத்தில் 'ஆஷ்லேஷா பலி' பூஜை",
        en: "Ashlesha Bali & Sarpa Samskara at Kukke Subramanya or Gokarna Kshetra"
      },
      protectiveMantras: {
        kn: ["ನಿತ್ಯವೂ 'ಸುಬ್ರಹ್ಮಣ್ಯ ಭುಜಂಗ ಸ್ತೋತ್ರ' ಪಠಿಸಿ.", "ಗರುಡ ಗಾಯತ್ರೀ ಜಪಿಸಿ."],
        hi: ["नित्य 'सुब्रह्मण्य भुजंग स्तोत्र' अथवा गरुड़ गायत्री का पाठ करें।"],
        te: ["సుబ్రహ్మణ్య భుజంగ స్తోత్రం పఠించండి."],
        ta: ["கருட காயத்ரி மந்திரம் ஜபிக்கவும்."],
        en: ["Chant Garuda Gayatri or Subrahmanya Bhujangam daily for supreme protection."]
      }
    });
  }

  // ==========================================================================
  // 5. PRAPATA / PATANA GANDANTARA (ಎತ್ತರದಿಂದ ಬೀಳುವ ಗಂಡಾಂತರ - Fall / Height Hazard)
  // ==========================================================================
  const patanaGrahas: string[] = [];
  const patanaHouses: number[] = [];
  let isPatanaActive = false;
  let patanaSafeAge = 26;

  if (saturn && (saturn.house === 8 || saturn.house === 10) && isAirRashi(saturn.rashi.index)) {
    isPatanaActive = true;
    patanaGrahas.push("Saturn in 8th/10th in Air Rashi");
    patanaHouses.push(saturn.house);
  }
  if (saturn && mars && Math.abs(saturn.house - mars.house) === 6) { // Saturn-Mars mutual aspect
    isPatanaActive = true;
    patanaGrahas.push("Saturn-Mars Mutual Aspect");
    patanaHouses.push(saturn.house, mars.house);
    patanaSafeAge = 32;
  }

  if (isPatanaActive) {
    const isUnderDanger = currentAge <= patanaSafeAge;
    gandantaras.push({
      id: "gandantara_patana",
      type: "patana",
      name: {
        kn: "ಎತ್ತರದಿಂದ ಬೀಳುವ ಗಂಡಾಂತರ (Heights, Falls & Gravity Hazard)",
        hi: "ऊंचाई से गिरने का गंडांतर (Height & Fall Hazard)",
        te: "ఎత్తు నుండి పడే గండాంతరం (Falls & Heights Hazard)",
        ta: "உயரத்திலிருந்து விழும் கண்டாந்தரம் (Heights & Fall Hazard)",
        en: "Prapata / Fall Hazard Gandantara (Heights & Gravity Vulnerability)"
      },
      icon: "🧗",
      isDetected: true,
      vulnerableTillAge: patanaSafeAge,
      isCurrentlyInDangerWindow: isUnderDanger,
      currentAge,
      ageWindowDescription: {
        kn: isUnderDanger
          ? `⚠️ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಗಂಡಾಂತರ ವಯೋಮಿತಿ: ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸು ${Math.floor(currentAge)} ಆಗಿದ್ದು, ${patanaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ಎತ್ತರದಿಂದ ಜಾರಿ ಬೀಳುವ ಗಂಡಾಂತರವಿದೆ. ಕಟ್ಟಡಗಳ ತಾರಸಿ, ಬೆಟ್ಟ ಹತ್ತುವುದು ಹಾಗೂ ಮರ ಹತ್ತುವ ಸಾಹಸಗಳಿಂದ ದೂರವಿರಿ.`
          : `✅ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ದಾಟಿದೆ: ${patanaSafeAge}ನೇ ವಯಸ್ಸಿನ ಎತ್ತರದ ಗಂಡಾಂತರ ಹಂತ ಮುಕ್ತಾಯವಾಗಿದೆ.`,
        hi: isUnderDanger
          ? `⚠️ वर्तमान संकट काल: ${patanaSafeAge} वर्ष तक छत की रेलिंग, पर्वतारोहण एवं ऊंची जगहों पर जाने से बचें।`
          : `✅ सुरक्षा सीमा पार हो चुकी है।`,
        te: isUnderDanger
          ? `⚠️ ${patanaSafeAge} ఏళ్ల వరకు ఎత్తైన ప్రదేశాలలో జాగ్రత్తగా ఉండండి.`
          : `✅ సురక్షిత వయస్సు దాటింది.`,
        ta: isUnderDanger
          ? `⚠️ ${patanaSafeAge} வயது வரை மொட்டை மாடி மற்றும் மலை ஏறுதலைத் தவிர்க்கவும்.`
          : `✅ எல்லை கடந்தது.`,
        en: isUnderDanger
          ? `⚠️ Currently Active Vulnerability Window: Native is Age ${Math.floor(currentAge)}; acute vertigo and fall risk persists until Age ${patanaSafeAge}.`
          : `✅ Safe Threshold Surpassed: Acute fall risk window has elapsed.`
      },
      grahasInvolved: patanaGrahas,
      houseNumbers: patanaHouses,
      scripturalReference: "ಜಾತಕ ತತ್ತ್ವ - ಪ್ರಪಾತ ಯೋಗ (Jataka Tattwa)",
      technicalReason: {
        kn: `ವಾಯು ತತ್ತ್ವದ ರಾಶಿಯಲ್ಲಿ ಶನಿಯ ದುಸ್ಥಾನ ಸ್ಥಿತಿ ಅಥವಾ ಕುಜ-ಶನಿ ಪರಸ್ಪರ ದೃಷ್ಟಿಯು ಎತ್ತರದಿಂದ ಆಕಸ್ಮಿಕ ಬೀಳುವಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
        hi: `वायु तत्व राशि में शनि की स्थिति अथवा शनि-मंगल की परस्पर दृष्टि ऊंचाई से गिरने का संकेत देती है।`,
        te: `శని-కుజుల దృష్టి వల్ల ఎత్తైన ప్రదేశాల్లో జారే ప్రమాదం ఉంది.`,
        ta: `சனி-செவ்வாய் சேர்க்கையால் உயரத்திலிருந்து தவறி விழும் ஆபத்து உள்ளது.`,
        en: `Saturn afflicted in airy signs or mutual aspect between Saturn and Mars across cardinal axes.`
      },
      dashaResonance: buildDashaResonance([PN.Saturn, PN.Mars], "ಎತ್ತರ ಬೀಳುವ ಗಂಡಾಂತರ"),
      cautionDirectives: {
        kn: [
          `${patanaSafeAge}ನೇ ವಯಸ್ಸಿನವರೆಗೆ ರಕ್ಷಣಾ ಗೋಡೆ ಇಲ್ಲದ ತಾರಸಿ, ಕಡಿದಾದ ಬೆಟ್ಟದ ಅಂಚುಗಳು, ಮರ ಹತ್ತುವುದು ಹಾಗೂ ರೋಪ್ ವೇ ಸಾಹಸಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ.`
        ],
        hi: [
          `${patanaSafeAge} वर्ष की आयु तक बिना रेलिंग वाली छत, ऊंची चट्टानों एवं ट्रैकिंग के जोखिम से बचें।`
        ],
        te: [
          `${patanaSafeAge} ఏళ్ల వరకు రెయిలింగ్ లేని డాబాలు మరియు కొండల అంచులకు వెళ్లరాదు.`
        ],
        ta: [
          `${patanaSafeAge} வயது வரை பாதுகாப்பற்ற மொட்டை மாடிகளுக்குச் செல்வதைத் தவிர்க்கவும்.`
        ],
        en: [
          `Strictly avoid unguarded terrace perimeters, treacherous cliff edges, high ladders, and unregulated adventure high-ropes until Age ${patanaSafeAge}.`
        ]
      },
      protectiveParihara: {
        kn: "ಶ್ರೀ ನರಸಿಂಹ ಸ್ವಾಮಿ ಕವಚ ಪಾರಾಯಣ & ತೈಲಾಭಿಷೇಕ",
        hi: "श्री नृसिंह कवच पाठ एवं भैरव पूजा",
        te: "శ్రీ నరసింహ కవచ పారాయణం",
        ta: "ஸ்ரீ நரசிம்மர் கவசம் பாராயணம்",
        en: "Sri Narasimha Kavacha Parayana & Tailabhisheka"
      },
      protectiveMantras: {
        kn: ["ನಿತ್ಯವೂ 'ಉಗ್ರಂ ವೀರಂ ಮಹಾವಿಷ್ಣುಂ' ಮಂತ್ರ ಪಠಿಸಿ."],
        hi: ["नित्य 'उग्रं वीरं महाविष्णुं' मंत्र का जाप करें।"],
        te: ["నరసింహ మంత్రం జపించండి."],
        ta: ["நரசிம்ம மந்திரம் ஜபிக்கவும்."],
        en: ["Chant Narasimha Maha Mantra daily for unyielding gravitational protection."]
      }
    });
  }

  // ==========================================================================
  // INNATE SUBCONSCIOUS PHOBIAS & MENTAL FEARS (ಅಂತರ್ಗತ ಮನೋಭಯಗಳು)
  // ==========================================================================
  const detectedFears: DetectedFear[] = [];

  // A. JALA BHAYA / HYDROPHOBIA (ಜಲ ಭಯ - Deep Water Fear)
  if (moon && (isWaterRashi(moon.rashi.index) || [6, 8, 12].includes(moon.house)) && (rahu || saturn)) {
    const isHigh = [6, 8].includes(moon.house) || moon.rashi.index === 7;
    detectedFears.push({
      id: "fear_jala",
      type: "jala_bhaya",
      name: {
        kn: "ಜಲ ಭಯ / ಹೈಡ್ರೋಫೋಬಿಯಾ (Deep Water Phobia)",
        hi: "जल भय / हाइड्रोफोबिया (Deep Water Phobia)",
        te: "జల భయం / హైడ్రోఫోబియా (Deep Water Phobia)",
        ta: "ஜல பயம் / நீர் பயம் (Hydrophobia)",
        en: "Jala Bhaya / Hydrophobia (Deep Water Phobia)"
      },
      icon: "🌊",
      isDetected: true,
      severity: isHigh ? "high" : "moderate",
      planetaryTrigger: {
        kn: "ಮನಃಕಾರಕ ಚಂದ್ರನು ಜಲ ರಾಶಿಯಲ್ಲಿ ದುಸ್ಥಾನದಲ್ಲಿದ್ದು, ಶನಿ ಅಥವಾ ರಾಹುವಿನ ಪ್ರಭಾವಕ್ಕೊಳಗಾಗಿರುವುದು.",
        hi: "मनःकारक चंद्रमा का जल राशि अथवा दुस्थान में राहु/शनि से प्रभावित होना।",
        te: "చంద్రుడు జల రాశిలో రాహు/శని ప్రభావానికి లోనవడం.",
        ta: "சந்திரன் நீர் ராசியில் ராகு/சனி சேர்க்கையால் பாதிக்கப்படுவது.",
        en: "Moon (ruler of mind and subconscious) afflicted in water signs or Dusthana houses by Saturn or Rahu."
      },
      psychologicalSymptom: {
        kn: "ಆಳವಾದ ಸಮುದ್ರ, ಕೆರೆ ಅಥವಾ ಪ್ರವಾಹವನ್ನು ಕಂಡಾಗ ಎದೆಯಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ನಡುಕ, ಉಸಿರುಗಟ್ಟುವಿಕೆ ಹಾಗೂ ಮುಳುಗಿ ಸಾಯುವ ಆತಂಕ ಉಂಟಾಗುವುದು.",
        hi: "गहरे समुद्र अथवा नदी को देखकर अचानक हृदय की धड़कन बढ़ना, सांस फूलना एवं डूबने का तीव्र अज्ञात भय उत्पन्न होना।",
        te: "లోతైన నీటిని చూసినప్పుడు తీవ్ర భయం మరియు ఆందోళన కలగడం.",
        ta: "ஆழமான நீர்நிலைகளைக் காணும்போது நெஞ்சு படபடப்பு மற்றும் மூச்சுத்திணறல் ஏற்படுதல்.",
        en: "Acute physiological panic, palpitations, and intense suffocation anxiety when encountering deep oceans, turbulent rivers, or swimming pools."
      },
      realLifeManifestation: {
        kn: "ಈ ವ್ಯಕ್ತಿಯು ಸ್ವಭಾವತಃ ನೀರಿಗೆ ಇಳಿಯಲು ಹಿಂಜರಿಯುತ್ತಾರೆ. ಬೋಟಿಂಗ್ ಅಥವಾ ಈಜು ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳಲು ತೀವ್ರ ಅಂಜಿಕೆ ವ್ಯಕ್ತಪಡಿಸುತ್ತಾರೆ.",
        hi: "यह जातक स्वाभाविक रूप से पानी में उतरने से डरते हैं तथा बोटिंग या स्विमिंग से सदा कतराते हैं।",
        te: "ఈ వ్యక్తి సాధారణంగా నీళ్లలోకి దిగడానికి జంకుతారు.",
        ta: "இயற்கையாகவே இவர்கள் தண்ணீரில் இறங்க அஞ்சுவர்; படகு சவாரியைத் தவிர்ப்பர்.",
        en: "The native instinctively resists entering water bodies, recoils from boat rides, and experiences visceral panic if splashed unexpectedly."
      },
      strengtheningPractice: {
        kn: "ಪ್ರತಿದಿನ ಬೆಳ್ಳಿ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು ಹಾಗೂ 'ಓಂ ಸೋಮ ಸೋಮಾಯ ನಮಃ' ಜಪಿಸುವುದು ಮನೋಸ್ಥೈರ್ಯವನ್ನು ನೀಡುತ್ತದೆ.",
        hi: "चांदी के पात्र में जल पीना एवं 'ॐ सोमाय नमः' का जाप मानसिक संबल प्रदान करता है।",
        te: "వెండి గ్లాసులో నీరు త్రాగడం మరియు చంద్ర గాయత్రి జపించడం మంచిది.",
        ta: "வெள்ளி டம்ளரில் தண்ணீர் குடிப்பதும் சந்திர தியானமும் மன உறுதியைத் தரும்.",
        en: "Drinking energized water from a silver tumbler and chanting the Chandra Gayatri strengthens subconscious emotional resilience."
      }
    });
  }

  // B. RAKTA BHAYA / HEMOPHOBIA (ರಕ್ತ ಭಯ - Blood & Injections Dread)
  if (mars && (mars.rashi.index === 3 || mars.house === 6 || mars.house === 8 || (saturn && mars.house === saturn.house))) {
    detectedFears.push({
      id: "fear_rakta",
      type: "rakta_bhaya",
      name: {
        kn: "ರಕ್ತ & ಸೂಜಿ ಭಯ / ಹೀಮೋಫೋಬಿಯಾ (Blood & Injection Phobia)",
        hi: "रक्त एवं सुई भय / हीमोफोबिया (Blood & Needle Phobia)",
        te: "రక్త భయం / హిమోఫోబియా (Blood & Injection Phobia)",
        ta: "இரத்த பயம் / ஊசி பயம் (Hemophobia)",
        en: "Rakta Bhaya / Hemophobia (Fear of Blood, Wounds & Injections)"
      },
      icon: "🩸",
      isDetected: true,
      severity: mars.rashi.index === 3 ? "high" : "moderate", // Debilitated in Cancer
      planetaryTrigger: {
        kn: "ರಕ್ತ ಕಾರಕ ಕುಜನು ಕರ್ಕಾಟಕದಲ್ಲಿ ನೀಚನಾಗಿರುವುದು ಅಥವಾ ಶನಿ/ರಾಹುವಿನಿಂದ ಪೀಡಿತನಾಗಿರುವುದು.",
        hi: "रक्त कारक मंगल का नीच राशि (कर्क) में होना अथवा शनि से आक्रांत होना।",
        te: "రక్త కారకుడు కుజుడు బలహీనపడటం.",
        ta: "இரத்த காரகன் செவ்வாய் பலவீனமடைதல்.",
        en: "Mars (karaka of blood, iron, and surgery) debilitated in Cancer or afflicted by Saturn/Rahu."
      },
      psychologicalSymptom: {
        kn: "ರಕ್ತ, ಗಾಯ ಅಥವಾ ಇಂಜೆಕ್ಷನ್ ಸೂಜಿಯನ್ನು ನೋಡಿದ ತಕ್ಷಣ ತಲೆತಿರುಗುವಿಕೆ, ವಾಕರಿಕೆ, ರಕ್ತದೊತ್ತಡ ಕುಸಿತ ಹಾಗೂ ತಲೆತಪ್ಪಿ ಬೀಳುವ (ಫೇಂಟ್ ಆಗುವ) ಅನುಭವ.",
        hi: "रक्त, खुला घाव अथवा इंजेक्शन की सुई देखते ही चक्कर आना, जी मिचलाना अथवा बेहोश हो जाना।",
        te: "రక్తం లేదా ఇంజెక్షన్ చూడగానే కళ్లు తిరగడం లేదా స్పృహ తప్పడం.",
        ta: "இரத்தத்தையோ ஊசியையோ பார்த்தவுடன் தலைசுற்றல், மயக்கம் அல்லது வாந்தி வருவது போன்ற உணர்வு ஏற்படுதல்.",
        en: "Vasovagal syncope: sudden dizziness, drop in blood pressure, nausea, or fainting upon witnessing open blood, injuries, or surgical needles."
      },
      realLifeManifestation: {
        kn: "ವೈದ್ಯಕೀಯ ರಕ್ತ ಪರೀಕ್ಷೆ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳ ದೃಶ್ಯ ಅಥವಾ ಅಪಘಾತದ ರಕ್ತ ಕಂಡಾಗ ಇವರಿಗೆ ತೀವ್ರ ಅಸಹ್ಯ ಹಾಗೂ ದಿಗಿಲು ಉಂಟಾಗುತ್ತದೆ.",
        hi: "रक्त जांच कराने या चोट का दृश्य देखने पर अत्यंत घबराहट होना।",
        te: "బ్లడ్ టెస్ట్ లేదా ఆసుపత్రికి వెళ్లినప్పుడు తీవ్ర భయపడతారు.",
        ta: "இரத்தப் பரிசோதனை அல்லது மருத்துவமனைக் காட்சிகளைக் கண்டு அஞ்சுவர்.",
        en: "The native strongly dreads routine blood tests, hospital visits, horror movies depicting gore, or surgical procedures."
      },
      strengtheningPractice: {
        kn: "ಪ್ರತಿದಿನ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಪಠಿಸಿ ಮತ್ತು ಮಂಗಳವಾರ ಬೆಲ್ಲ ದಾನ ಮಾಡಿ.",
        hi: "मंगलवार को गुड़ का दान एवं कार्तिकेय स्तोत्र का पाठ शक्ति प्रदान करता है।",
        te: "మంగళవారం సుబ్రహ్మణ్య స్వామిని పూజించండి.",
        ta: "செவ்வாய்க்கிழமை சுப்பிரமணியர் வழிபாடு தைரியத்தை அளிக்கும்.",
        en: "Propitiate Lord Subrahmanya on Tuesdays and consume jaggery/pomegranate to fortify blood vitality and autonomic courage."
      }
    });
  }

  // C. SARPA BHAYA / OPHIDIOPHOBIA (ಸರ್ಪ ಭಯ - Snake & Reptile Dread)
  if (rahu && (rahu.house === 1 || rahu.house === 2 || rahu.house === 5 || rahu.house === 8)) {
    detectedFears.push({
      id: "fear_sarpa",
      type: "sarpa_bhaya",
      name: {
        kn: "ಸರ್ಪ & ಉರಗ ಭಯ / ಒಫಿಡಿಯೋಫೋಬಿಯಾ (Snake & Reptile Phobia)",
        hi: "सर्प एवं सरीसृप भय / ओफिडियोफोबिया (Snake Phobia)",
        te: "సర్ప భయం / ఒఫిడియోఫోబియా (Snake Phobia)",
        ta: "பாம்பு பயம் / சர்ப்ப பயம் (Ophidiophobia)",
        en: "Sarpa Bhaya / Ophidiophobia (Acute Snake & Reptile Dread)"
      },
      icon: "🐍",
      isDetected: true,
      severity: rahu.house === 8 ? "high" : "moderate",
      planetaryTrigger: {
        kn: "ಸರ್ಪ ಕಾರಕ ರಾಹು ಲಗ್ನ, 2, 5 ಅಥವಾ 8ನೇ ಭಾವದಲ್ಲಿ ಬಲವಾಗಿ ನೆಲೆಸಿರುವುದು.",
        hi: "सर्प कारक राहु का लग्न, द्वितीय, पंचम अथवा अष्टम भाव में स्थित होना।",
        te: "రాహువు లగ్నం లేదా 8వ స్థానంలో ఉండటం.",
        ta: "ராகு லக்னம் அல்லது 8ஆம் பாவத்தில் அமர்ந்திருப்பது.",
        en: "Rahu (serpentine node) stationed in sensitive psyche houses (1st, 2nd, 5th, or 8th house)."
      },
      psychologicalSymptom: {
        kn: "ಹಾವು, ಹಲ್ಲಿ, ಜೇಡ ಅಥವಾ ತೆವಳುವ ಕೀಟಗಳನ್ನು ಕಂಡಾಗ ಮೈಜುಮ್ಮೆನ್ನುವ ತೀವ್ರ ಕಂಪನ, ನಡುಕ ಹಾಗೂ ಕನಸಿನಲ್ಲಿ ಹಾವುಗಳು ಬೆನ್ನಟ್ಟಿದಂತೆ ಕಾಣುವುದು.",
        hi: "सांप, छिपकली को देखकर रोंगटे खड़े होना, अत्यधिक सिहरन एवं स्वप्न में सर्प दिखाई देना।",
        te: "పాములను చూసినా లేదా కలలో కనిపించినా తీవ్ర భయభ్రాంతులకు గురికావడం.",
        ta: "பாம்பு அல்லது ஊர்வனவற்றைக் கண்டால் உடல் நடுக்கம் மற்றும் கனவில் பாம்பு வருதல்.",
        en: "Visceral goosebumps, paralysis of motion, and recurring nightmares of coiling serpents, venomous snakes, or reptiles."
      },
      realLifeManifestation: {
        kn: "ಹುಲ್ಲುಹಾಸು, ತೋಟ ಅಥವಾ ಹಳೆಯ ಕತ್ತಲೆ ಕೋಣೆಗಳಲ್ಲಿ ಹೋಗಲು ನಡುಗುತ್ತಾರೆ; ಹಾವಿನ ಚಿತ್ರ ಅಥವಾ ವಿಡಿಯೋ ನೋಡಿದರೂ ಕಂಪನ ಉಂಟಾಗುತ್ತದೆ.",
        hi: "घास अथवा बगीचे में जाने से घबराना तथा टीवी पर सांप देखकर भी डर लगना।",
        te: "తోటల్లో లేదా చీకటిలో నడవడానికి తీవ్ర జంకు ప్రదర్శిస్తారు.",
        ta: "புல்வெளி அல்லது தோட்டங்களில் செல்ல தயங்குவர்.",
        en: "Refuses to walk on open lawns at dusk, avoids pet reptiles, and experiences a physical jolt even when seeing a snake on screen."
      },
      strengtheningPractice: {
        kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಹಾಗೂ ನಿತ್ಯವೂ 'ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ' ಅಥವಾ ನಾಗ ಸ್ತೋತ್ರ ಪಠಣ.",
        hi: "नित्य 'ॐ नमः शिवाय' एवं नाग गायत्री का पाठ भयमुक्त करता है।",
        te: "నాగ గాయత్రి లేదా సుబ్రహ్మణ్య అష్టకం పఠించండి.",
        ta: "நாக காயத்ரி மந்திரம் ஜபித்து வரவும்.",
        en: "Chant the Naga Gayatri or Garuda Dandaka to dissolve subconscious serpentine anxiety."
      }
    });
  }

  // D. AGNI BHAYA / PYROPHOBIA (ಅಗ್ನಿ ಭಯ - Fire & Burn Phobia)
  if (mars && (isFireRashi(mars.rashi.index) || (ketu && mars.house === ketu.house))) {
    detectedFears.push({
      id: "fear_agni",
      type: "agni_bhaya",
      name: {
        kn: "ಅಗ್ನಿ ಭಯ / ಪೈರೋಫೋಬಿಯಾ (Fire & Burns Phobia)",
        hi: "अग्नि भय / पायरोफोबिया (Fire Phobia)",
        te: "అగ్ని భయం / పైరోఫోబియా (Fire Phobia)",
        ta: "அக்னி பயம் / தீ பயம் (Pyrophobia)",
        en: "Agni Bhaya / Pyrophobia (Fire & Burns Phobia)"
      },
      icon: "🔥",
      isDetected: true,
      severity: "moderate",
      planetaryTrigger: {
        kn: "ಅಗ್ನಿ ತತ್ತ್ವದ ಕುಜ-ಕೇತು ಸಂಯೋಗ ಅಥವಾ ಮೇಷ/ಸಿಂಹ ರಾಶಿಯಲ್ಲಿ ಅಂಗಾರಕ ದೋಷ.",
        hi: "अग्नि तत्व में मंगल-केतु युति अथवा अत्यधिक उग्र ग्रह प्रभाव।",
        te: "కుజ-కేతు సంయోగం వల్ల అగ్ని భయం.",
        ta: "செவ்வாய்-கேது சேர்க்கை.",
        en: "Fiery planet Mars conjunct Ketu or dominant in Agni Rashis (Aries/Leo)."
      },
      psychologicalSymptom: {
        kn: "ದೊಡ್ಡ ಬೆಂಕಿ, ಗ್ಯಾಸ್ ಸ್ಟವ್ ಹಚ್ಚುವುದು, ಪಟಾಕಿ ಸಿಡಿಸುವ ಶಬ್ದ ಹಾಗೂ ಸುಡುವ ಎಣ್ಣೆಯ ಸಿಡಿತಕ್ಕೆ ತೀವ್ರ ಬೆಚ್ಚಿಬೀಳುವುದು.",
        hi: "गैस चूल्हा जलाने, आतिशबाजी के धमाके तथा आग की लपटों से अत्यधिक सहम जाना।",
        te: "మంటలు మరియు బాణసంచా శబ్దాలకు ఉలిక్కిపడటం.",
        ta: "நெருப்பு சுவாலைகள் மற்றும் பட்டாசு வெடிப்புகளைக் கண்டு அஞ்சுதல்.",
        en: "Startle response, extreme flinching around gas burners, matchsticks, fireworks, and open bonfires."
      },
      realLifeManifestation: {
        kn: "ಅಡುಗೆ ಮನೆಯಲ್ಲಿ ಗ್ಯಾಸ್ ಲೀಕ್ ಆಗಬಹುದೆಂಬ ಸದಾ ಆತಂಕ, ಪಟಾಕಿ ಹಬ್ಬಗಳಲ್ಲಿ ಒಳಗೆ ಉಳಿಯುವುದು.",
        hi: "रसोई में बार-बार गैस बंद होने की जांच करना तथा पटाखों से दूर रहना।",
        te: "వంటగదిలో గ్యాస్ లీక్ అవుతుందేమోనని నిరంతర ఆందోళన.",
        ta: "அடுப்பறையில் எப்போதும் ஒருவித பயத்துடன் செயல்படுதல்.",
        en: "Compulsive re-checking of gas stove valves, reluctance to light deepas, and staying indoors during fireworks displays."
      },
      strengtheningPractice: {
        kn: "ಶ್ರೀ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ ಹಾಗೂ ಮಂಗಳ ಶಾಂತಿ ಆಚರಣೆ.",
        hi: "गणपति अथर्वशीर्ष का पाठ मन को निर्भय बनाता है।",
        te: "గణపతి అథర్వశీర్షం పఠించండి.",
        ta: "கணபதி வழிபாடு அச்சத்தைப் போக்கும்.",
        en: "Reciting Ganapati Atharvashirsha bestows grounded stability and dissolves irrational fire dread."
      }
    });
  }

  // E. ANDHAKARA & EKANTATA BHAYA / NYCTOPHOBIA (ಕತ್ತಲೆ & ಒಂಟಿತನ ಭಯ)
  if (moon && saturn && (moon.house === saturn.house || Math.abs(moon.house - saturn.house) === 6 || [8, 12].includes(moon.house))) {
    detectedFears.push({
      id: "fear_andhakara",
      type: "andhakara_bhaya",
      name: {
        kn: "ಕತ್ತಲೆ & ಒಂಟಿತನ ಭಯ / ನಿಕ್ಟೋಫೋಬಿಯಾ (Darkness & Isolation Phobia)",
        hi: "अंधकार एवं अकेलापन भय / निक्टोफोबिया (Fear of Darkness)",
        te: "చీకటి & ఒంటరితన భయం (Darkness & Loneliness Phobia)",
        ta: "இருள் மற்றும் தனிமை பயம் (Nyctophobia & Autophobia)",
        en: "Andhakara & Ekantata Bhaya (Nyctophobia - Fear of Darkness & Solitude)"
      },
      icon: "🌑",
      isDetected: true,
      severity: "high",
      planetaryTrigger: {
        kn: "ಚಂದ್ರನೊಂದಿಗೆ ಶನಿಯ ಯುತಿ (ವಿಷ ಯೋಗ) ಅಥವಾ ಚಂದ್ರನು 8/12ನೇ ಕತ್ತಲೆಯ ಭಾವಗಳಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು.",
        hi: "चंद्र-शनि युति (विष योग) अथवा चंद्रमा का 8वें/12वें अंधकार भाव में बैठना।",
        te: "చంద్ర-శని యుతి వల్ల చీకటి భయం.",
        ta: "சந்திர-சனி சேர்க்கையால் ஏற்படும் இருள் பயம்.",
        en: "Moon-Saturn conjunction (Visha Yoga) or Moon submerged in shadowy 8th or 12th houses."
      },
      psychologicalSymptom: {
        kn: "ಸಂಪೂರ್ಣ ಕತ್ತಲೆಯಲ್ಲಿ ಮಲಗಲು ಭಯ, ಯಾರೋ ಬೆನ್ನಹಿಂದೆ ನಿಂತಂತೆ ಭ್ರಮೆ, ಒಂಟಿಯಾಗಿ ಮನೆಯಲ್ಲಿ ಉಳಿಯಲು ಅಸಾಧ್ಯವಾಗುವುದು.",
        hi: "घोर अंधेरे में दम घुटना, ऐसा लगना कि कोई पीछे खड़ा है तथा अकेले रहने पर बेचैनी।",
        te: "చీకటిలో నిద్రపోలేకపోవడం మరియు ఒంటరిగా ఉండటానికి భయపడటం.",
        ta: "கும்மிருட்டில் தூங்க அச்சம், பின்னால் யாரோ இருப்பது போன்ற பிரமை ஏற்படுதல்.",
        en: "Inability to sleep in pitch darkness without night-lamps, somatic sensation of unseen presence, and panic when left alone."
      },
      realLifeManifestation: {
        kn: "ರಾತ್ರಿ ಲೈಟ್ ಹಾಕಿಕೊಂಡೇ ಮಲಗುತ್ತಾರೆ, ಕೋಣೆಯ ಬಾಗಿಲು ಪೂರ್ತಿ ಮುಚ್ಚಲು ಹಿಂಜರಿಯುತ್ತಾರೆ.",
        hi: "रात को नाइट-लैंप जलाकर सोना एवं बंद कमरों से घबराना।",
        te: "లైట్ వేసుకుని పడుకుంటారు.",
        ta: "இரவில் விளக்கை எரியவிட்டே உறங்குவர்.",
        en: "Sleeps exclusively with ambient lighting or television on; actively avoids locked rooms or solitary basements."
      },
      strengtheningPractice: {
        kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಗಾಯತ್ರೀ ಮಂತ್ರ ಪಠಣ.",
        hi: "नित्य सूर्य नमस्कार एवं गायत्री मंत्र से आत्मिक प्रकाश जागृत होता है।",
        te: "గాయత్రీ మంత్రం జపించండి.",
        ta: "காயத்ரி மந்திரம் ஜபித்து வரவும்.",
        en: "Daily Surya Namaskar at dawn and Aditya Hridaya Stotram dispel inner darkness and neuroses."
      }
    });
  }

  // F. UCHCHATA BHAYA / ACROPHOBIA (ಎತ್ತರ ಭಯ - Heights & Vertigo)
  if (saturn && (isAirRashi(saturn.rashi.index) || saturn.house === 8 || saturn.house === 10)) {
    detectedFears.push({
      id: "fear_uchchata",
      type: "uchchata_bhaya",
      name: {
        kn: "ಎತ್ತರ ಭಯ & ತಲೆತಿರುಗುವಿಕೆ / ಅಕ್ರೋಫೋಬಿಯಾ (Heights & Vertigo Phobia)",
        hi: "ऊंचाई भय / एक्रोफोबिया (Heights & Vertigo Phobia)",
        te: "ఎత్తు భయం / అక్రోఫోబియా (Acrophobia)",
        ta: "உயர பயம் (Acrophobia)",
        en: "Uchchata Bhaya / Acrophobia (Fear of Heights & Vertigo)"
      },
      icon: "🧗",
      isDetected: true,
      severity: "moderate",
      planetaryTrigger: {
        kn: "ವಾಯು ತತ್ತ್ವದಲ್ಲಿ ಶನಿ ಅಥವಾ 10ನೇ ಕರ್ಮ/ಆಕಾಶ ಭಾವದಲ್ಲಿ ಶನಿಯ ಪ್ರಭಾವ.",
        hi: "वायु तत्व अथवा दशम भाव में शनि की प्रबल उपस्थिति।",
        te: "వాయు తత్వంలో శని ప్రభావం.",
        ta: "வாயு ராசியில் சனியின் ஆதிக்கம்.",
        en: "Saturn placed in airy signs or occupying midheaven 10th/8th house."
      },
      psychologicalSymptom: {
        kn: "ಎತ್ತರದ ಬಾಲ್ಕನಿ, ಸೇತುವೆ ಅಥವಾ ಗಾಜಿನ ಮಹಡಿಗಳ ಮೇಲೆ ನಿಂತಾಗ ಕಾಲು ನಡುಗುವುದು, ತಲೆಸುತ್ತುವುದು ಹಾಗೂ ಕೆಳಗೆ ಬಿದ್ದುಬಿಡುವೆನೆಂಬ ತೀವ್ರ ಭ್ರಮೆ.",
        hi: "ऊंची बालकनी, कांच के फर्श अथवा पुल पर खड़े होते ही पैर कांपना एवं सिर चकराना।",
        te: "ఎత్తైన ప్రదేశాలలో నిలబడినప్పుడు కాళ్లు వణకడం మరియు తల తిరగడం.",
        ta: "மாடி விளிம்பில் நிற்கும்போது கால் நடுக்கம் மற்றும் மயக்கம் வருதல்.",
        en: "True vestibular vertigo, trembling knees, and acute magnetic pull sensation of falling when peering over railings or high bridges."
      },
      realLifeManifestation: {
        kn: "ರೋಲರ್ ಕೋಸ್ಟರ್, ಕೇಬಲ್ ಕಾರ್, ವಿಮಾನ ಪ್ರಯಾಣ ಹಾಗೂ ಎತ್ತರದ ಕಟ್ಟಡಗಳ ತುದಿಗಳಿಗೆ ಹೋಗಲು ಇವರು ಸದಾ ಹಿಂದೇಟು ಹಾಕುತ್ತಾರೆ.",
        hi: "झूलों, केबल कार तथा ऊंची इमारतों की छत पर जाने से बचते हैं।",
        te: "ఎత్తైన భవనాలు ఎక్కడానికి ఇష్టపడరు.",
        ta: "ராட்டினங்கள், கேபிள் கார் சவாரிகளைத் தவிர்ப்பர்.",
        en: "Avoids high observation decks, Ferris wheels, glass-bottom bridges, and chooses windowless seating during flights."
      },
      strengtheningPractice: {
        kn: "ಭೂಮಿ ತತ್ತ್ವವನ್ನು ಬಲಪಡಿಸಲು ನಿತ್ಯವೂ ಬರಿಗಾಲಿನಲ್ಲಿ ಹಸಿರು ಹುಲ್ಲಿನ ಮೇಲೆ ನಡೆಯುವುದು ಹಾಗೂ ಪವನಸುತ ಹನುಮಾನ್ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು.",
        hi: "नंगे पैर घास पर चलना एवं 'हनुमान बाहुक' का पाठ करना लाभकारी है।",
        te: "హనుమాన్ చాలీసా నిత్యం పఠించండి.",
        ta: "ஹனுமான் வழிபாடு மனோதிடத்தை அளிக்கும்.",
        en: "Earthing (walking barefoot on grass) and chanting Hanuman Vadavanala Stotram stabilize somatic grounding."
      }
    });
  }

  // Filter detected gandantaras
  const activeGandantaras = gandantaras.filter((g) => g.isDetected);

  return {
    currentAge,
    activeGandantarasCount: activeGandantaras.length,
    allGandantaras: gandantaras,
    activeGandantaras,
    detectedFears,
    runningDashaStr
  };
};
