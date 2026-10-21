import { degreeToNakshatra, degreeToRashi, normalizeDegree } from "../../core/AstroMath";
import { PlanetName, type KundliOutput, type AyanamsaModel, type NodeType } from "../../core/AstroTypes";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import * as Astronomy from "astronomy-engine";
import { getAyanamsa } from "../../core/AstroMath";
import type {
  CosmicPillarId,
  DoshaSeverity,
  FrictionNode,
  GokarnaSevaRecommendation,
  KarmaMandalaSynthesis,
  MuhurthaWindow,
  BijaMantraDetail
} from "./karmaMandalaTypes";
import {
  RASHI_NAMES_5L,
  NAKSHATRA_NAMES_5L,
  KARMA_MANDALA_5L
} from "./karmaMandalaLocale";

const RASHI_LORDS: Record<number, PlanetName> = {
  0: PlanetName.Mars,      // Mesha
  1: PlanetName.Venus,     // Vrishabha
  2: PlanetName.Mercury,   // Mithuna
  3: PlanetName.Moon,      // Karka
  4: PlanetName.Sun,       // Simha
  5: PlanetName.Mercury,   // Kanya
  6: PlanetName.Venus,     // Tula
  7: PlanetName.Mars,      // Vrishchika
  8: PlanetName.Jupiter,   // Dhanus
  9: PlanetName.Saturn,    // Makara
  10: PlanetName.Saturn,   // Kumbha
  11: PlanetName.Jupiter   // Meena
};

const getLocaleLookup = (map: Record<string, any>, key: string, fallback: any): any => {
  return map[key] || fallback;
};

/**
 * Deterministically computes the full Divine Karma Sanjeevini synthesis
 * based on the devotee's authentic birth chart and real-time sidereal planetary transits.
 */
export function calculateKarmaMandalaSynthesis(
  chart: KundliOutput,
  options?: {
    evalDate?: Date;
    ayanamsaModel?: AyanamsaModel;
    nodeType?: NodeType;
    isUnlocked?: boolean;
    devoteeName?: string;
  }
): KarmaMandalaSynthesis {
  const evalDate = options?.evalDate ?? new Date();
  const ayanamsaModel = options?.ayanamsaModel ?? "lahiri";
  const nodeType = options?.nodeType ?? "mean";
  const isUnlocked = options?.isUnlocked ?? false;
  const devoteeName = options?.devoteeName || "ಭಕ್ತ / Devotee";

  // 1. Current Transit Ephemeris
  const currentTransit = siderealLongitudes(evalDate, ayanamsaModel, nodeType);
  const transitSaturnRashi = degreeToRashi(currentTransit.saturn).index;
  const transitJupiterRashi = degreeToRashi(currentTransit.jupiter).index;
  const transitRahuRashi = degreeToRashi(currentTransit.rahu).index;
  const transitMarsRashi = degreeToRashi(currentTransit.mars).index;

  // 2. Natal Planetary Coordinates
  const lagnaDeg = chart.ascendant;
  const natalLagnaRashi = degreeToRashi(lagnaDeg).index;

  const getPlanetDeg = (name: PlanetName | string): number => {
    const p = chart.planets?.find((pl) => pl.name === name);
    return (p as any)?.degree ?? (p as any)?.longitude ?? 0;
  };

  const natalMoonDeg = getPlanetDeg("Moon");
  const natalSaturnDeg = getPlanetDeg("Saturn");
  const natalMarsDeg = getPlanetDeg("Mars");
  const natalRahuDeg = getPlanetDeg("Rahu");
  const natalKetuDeg = getPlanetDeg("Ketu");
  const natalJupiterDeg = getPlanetDeg("Jupiter");
  const natalSunDeg = getPlanetDeg("Sun");
  const natalMercuryDeg = getPlanetDeg("Mercury");
  const natalVenusDeg = getPlanetDeg("Venus");

  const natalMoonRashi = degreeToRashi(natalMoonDeg).index;
  const natalMoonNakshatra = degreeToNakshatra(natalMoonDeg).index;
  const lagnaLord = RASHI_LORDS[natalLagnaRashi];
  const natalLagnaLordDeg = getPlanetDeg(lagnaLord);
  const natalLagnaLordRashi = degreeToRashi(natalLagnaLordDeg).index;

  // =========================================================================
  // PILLAR 1: SADE SATI & KANTAKA SHANI FRICTION
  // =========================================================================
  const saturnHouseFromMoon = ((transitSaturnRashi - natalMoonRashi + 12) % 12) + 1;
  const saturnHouseFromLagna = ((transitSaturnRashi - natalLagnaRashi + 12) % 12) + 1;

  let sadeSatiFriction = 30;
  let sadeSatiRelief = 88;
  let sadeSatiSeverity: DoshaSeverity = "calm";
  let sadeSatiAfflictionKey = "none";

  if (saturnHouseFromMoon === 12) {
    sadeSatiFriction = 78;
    sadeSatiRelief = 24;
    sadeSatiSeverity = "high";
    sadeSatiAfflictionKey = "rising"; // 1st Phase (Vyaya)
  } else if (saturnHouseFromMoon === 1) {
    sadeSatiFriction = 92;
    sadeSatiRelief = 26;
    sadeSatiSeverity = "critical";
    sadeSatiAfflictionKey = "peak"; // 2nd Phase (Janma Shani)
  } else if (saturnHouseFromMoon === 2) {
    sadeSatiFriction = 74;
    sadeSatiRelief = 22;
    sadeSatiSeverity = "high";
    sadeSatiAfflictionKey = "setting"; // 3rd Phase (Dhana)
  } else if (saturnHouseFromMoon === 4 || saturnHouseFromLagna === 4) {
    sadeSatiFriction = 68;
    sadeSatiRelief = 20;
    sadeSatiSeverity = "moderate";
    sadeSatiAfflictionKey = "ardhashtama"; // Kantaka
  } else if (saturnHouseFromMoon === 8 || saturnHouseFromLagna === 8) {
    sadeSatiFriction = 86;
    sadeSatiRelief = 25;
    sadeSatiSeverity = "critical";
    sadeSatiAfflictionKey = "ashtama"; // Ashtama Shani
  } else if (saturnHouseFromMoon === 7) {
    sadeSatiFriction = 56;
    sadeSatiRelief = 18;
    sadeSatiSeverity = "moderate";
    sadeSatiAfflictionKey = "saptama";
  } else {
    sadeSatiFriction = 24;
    sadeSatiRelief = 12;
    sadeSatiSeverity = "calm";
    sadeSatiAfflictionKey = "anukula";
  }

  // Adjust for natal Saturn dignity: If exalted (Libra) or Own sign (Capricorn/Aquarius), dampen friction
  const natalSaturnRashi = degreeToRashi(natalSaturnDeg).index;
  if (natalSaturnRashi === 6 || natalSaturnRashi === 9 || natalSaturnRashi === 10) {
    sadeSatiFriction = Math.max(15, sadeSatiFriction - 14);
  } else if (natalSaturnRashi === 0) {
    // Debilitated in Aries
    sadeSatiFriction = Math.min(99, sadeSatiFriction + 10);
  }

  const sadeSatiNode: FrictionNode = {
    id: "sade_sati",
    title: KARMA_MANDALA_5L.nodes.sadeSati.title,
    subtitle: KARMA_MANDALA_5L.nodes.sadeSati.subtitle,
    frictionScore: sadeSatiFriction,
    reliefScore: sadeSatiRelief,
    severity: sadeSatiSeverity,
    primaryAffliction: getLocaleLookup(KARMA_MANDALA_5L.nodes.sadeSati.afflictions, sadeSatiAfflictionKey, KARMA_MANDALA_5L.nodes.sadeSati.afflictions.anukula),
    planetaryDrivers: ["Saturn", "Moon"],
    classicalAuthority: KARMA_MANDALA_5L.nodes.sadeSati.authority,
    immediateAction: getLocaleLookup(KARMA_MANDALA_5L.nodes.sadeSati.actions, sadeSatiAfflictionKey, KARMA_MANDALA_5L.nodes.sadeSati.actions.default),
    gokarnaSeva: {
      id: "gokarna_shani_tailabhisheka",
      name: KARMA_MANDALA_5L.sevas.shaniTailabhisheka.name,
      templeName: KARMA_MANDALA_5L.sevas.shaniTailabhisheka.templeName,
      deity: KARMA_MANDALA_5L.sevas.shaniTailabhisheka.deity,
      significance: KARMA_MANDALA_5L.sevas.shaniTailabhisheka.significance,
      costInRupees: 750,
      costInCoins: 700,
      benefits: KARMA_MANDALA_5L.sevas.shaniTailabhisheka.benefits,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
      priestPhone: "9972339362",
      prasadaDetails: KARMA_MANDALA_5L.sevas.shaniTailabhisheka.prasada
    },
    bijaMantra: {
      sanskrit: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ ॥",
      kannada: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ ॥",
      transliteration: {
        kn: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ ॥",
        hi: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥",
        te: "ఓం ప్రాం ప్రీం ప్రౌం సః శనైశ్చరాయ నమః ॥",
        ta: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ சனைச்சராய நமஃ ॥",
        en: "Om Praam Preem Proum Sah Shanaishcharaaya Namah ||"
      },
      count: 108,
      deity: {
        kn: "ಶನೈಶ್ಚರ ಭಗವಾನ್",
        hi: "शनैश्चर देव",
        te: "శనైశ్చర స్వామి",
        ta: "சனைச்சர பகவான்",
        en: "Lord Shani Deva"
      },
      meaning: KARMA_MANDALA_5L.mantras.shaniMeaning
    },
    transitContext: {
      kn: `ಗೋಚಾರ ಶನಿ ಪ್ರಸ್ತುತ ${RASHI_NAMES_5L[transitSaturnRashi]?.kn} ರಾಶಿಯಲ್ಲಿದ್ದು, ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರನಿಂದ ${saturnHouseFromMoon}ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದಾರೆ.`,
      hi: `गोचर शनि वर्तमान में ${RASHI_NAMES_5L[transitSaturnRashi]?.hi} राशि में स्थित होकर आपके जन्म चंद्र से ${saturnHouseFromMoon}वें स्थान पर हैं।`,
      te: `గోచార శని ప్రస్తుతం ${RASHI_NAMES_5L[transitSaturnRashi]?.te} రాశిలో ఉండి మీ జన్మ చంద్రుని నుండి ${saturnHouseFromMoon}వ స్థానంలో ఉన్నారు.`,
      ta: `கோச்சார சனி தற்போது ${RASHI_NAMES_5L[transitSaturnRashi]?.ta} ராசியில் உங்கள் ஜென்ம சந்திரனிலிருந்து ${saturnHouseFromMoon}ஆம் இடத்தில் அமர்ந்துள்ளார்.`,
      en: `Transit Saturn is traversing ${RASHI_NAMES_5L[transitSaturnRashi]?.en}, placing it in the ${saturnHouseFromMoon}th house from your natal Moon.`
    }
  };

  // =========================================================================
  // PILLAR 2: RAHU-KETU KARMIC KNOT (KALA SARPA & PITRU DOSHA)
  // =========================================================================
  const allPlanetDegrees = [
    natalSunDeg,
    natalMoonDeg,
    natalMarsDeg,
    natalMercuryDeg,
    natalJupiterDeg,
    natalVenusDeg,
    natalSaturnDeg
  ];

  const rahuSign = degreeToRashi(natalRahuDeg);
  const ketuSign = degreeToRashi(natalKetuDeg);

  // Check if all 7 planets are hemmed on one side of Rahu-Ketu
  let sideCount = 0;
  for (const deg of allPlanetDegrees) {
    const diff = normalizeDegree(deg - natalRahuDeg);
    if (diff > 0 && diff < 180) {
      sideCount++;
    }
  }

  const isKalaSarpa = sideCount === 0 || sideCount === 7;
  const isKalaAmrita = sideCount === 1 || sideCount === 6; // Partial

  // Check Pitru affliction: Sun conjunct Rahu/Ketu within 12 degrees or 9th house from Lagna
  const sunRahuDist = Math.abs(normalizeDegree(natalSunDeg - natalRahuDeg));
  const sunKetuDist = Math.abs(normalizeDegree(natalSunDeg - natalKetuDeg));
  const isPitruAfflicted = sunRahuDist < 12 || sunKetuDist < 12 || Math.abs(360 - sunRahuDist) < 12 || Math.abs(360 - sunKetuDist) < 12;

  let rahuKetuFriction = 32;
  let rahuKetuRelief = 85;
  let rahuKetuSeverity: DoshaSeverity = "calm";
  let rahuAfflictionKey = "anukula";

  if (isKalaSarpa) {
    rahuKetuFriction = 88;
    rahuKetuRelief = 24;
    rahuKetuSeverity = "critical";
    rahuAfflictionKey = "kalasarpa_full";
  } else if (isPitruAfflicted) {
    rahuKetuFriction = 82;
    rahuKetuRelief = 22;
    rahuKetuSeverity = "high";
    rahuAfflictionKey = "pitru_dosha";
  } else if (isKalaAmrita) {
    rahuKetuFriction = 65;
    rahuKetuRelief = 20;
    rahuKetuSeverity = "moderate";
    rahuAfflictionKey = "kalasarpa_partial";
  } else {
    rahuKetuFriction = 28;
    rahuKetuRelief = 12;
    rahuKetuSeverity = "calm";
    rahuAfflictionKey = "anukula";
  }

  const rahuKetuNode: FrictionNode = {
    id: "rahu_ketu",
    title: KARMA_MANDALA_5L.nodes.rahuKetu.title,
    subtitle: KARMA_MANDALA_5L.nodes.rahuKetu.subtitle,
    frictionScore: rahuKetuFriction,
    reliefScore: rahuKetuRelief,
    severity: rahuKetuSeverity,
    primaryAffliction: getLocaleLookup(KARMA_MANDALA_5L.nodes.rahuKetu.afflictions, rahuAfflictionKey, KARMA_MANDALA_5L.nodes.rahuKetu.afflictions.anukula),
    planetaryDrivers: ["Rahu", "Ketu", "Sun"],
    classicalAuthority: KARMA_MANDALA_5L.nodes.rahuKetu.authority,
    immediateAction: getLocaleLookup(KARMA_MANDALA_5L.nodes.rahuKetu.actions, rahuAfflictionKey, KARMA_MANDALA_5L.nodes.rahuKetu.actions.default),
    gokarnaSeva: {
      id: "gokarna_tila_homa_kotitirtha",
      name: KARMA_MANDALA_5L.sevas.tilaHomaKotitirtha.name,
      templeName: KARMA_MANDALA_5L.sevas.tilaHomaKotitirtha.templeName,
      deity: KARMA_MANDALA_5L.sevas.tilaHomaKotitirtha.deity,
      significance: KARMA_MANDALA_5L.sevas.tilaHomaKotitirtha.significance,
      costInRupees: 1500,
      costInCoins: 1400,
      benefits: KARMA_MANDALA_5L.sevas.tilaHomaKotitirtha.benefits,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
      priestPhone: "9972339362",
      prasadaDetails: KARMA_MANDALA_5L.sevas.tilaHomaKotitirtha.prasada
    },
    bijaMantra: {
      sanskrit: "ॐ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ ॥ ॐ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ ॥",
      kannada: "ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ ॥ ಓಂ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ ॥",
      transliteration: {
        kn: "ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ ॥ ಓಂ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ ॥",
        hi: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥ ॐ स्रां स्रीं स्रौं सः केतवे नमः ॥",
        te: "ఓం భ్రాం భ్రీం భ్రౌం సః రాహవే నమః ॥ ఓం స్రాం స్రీం స్రౌం సః కేతవే నమః ॥",
        ta: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ ராகவே நமஃ ॥ ஓம் ஸ்ராம் ஸ்ரீம் ஸ்ரௌம் ஸஃ கேதவே நமஃ ॥",
        en: "Om Bhraam Bhreem Bhroum Sah Rahave Namah || Om Sraam Sreem Sroum Sah Ketave Namah ||"
      },
      count: 108,
      deity: {
        kn: "ಸರ್ಪ ದೇವತೆ & ಪಿತೃ ಗಣ",
        hi: "सर्प देवता एवं पितृ गण",
        te: "సర్ప దేవత & పితృ గణాలు",
        ta: "சர்ப்ப தேவதை & பித்ரு கணங்கள்",
        en: "Naga Devata & Ancestral Pitrus"
      },
      meaning: KARMA_MANDALA_5L.mantras.rahuMeaning
    },
    transitContext: {
      kn: `ಗೋಚಾರ ರಾಹು-ಕೇತು ಅಕ್ಷವು ${RASHI_NAMES_5L[transitRahuRashi]?.kn} ಹಾಗೂ ${RASHI_NAMES_5L[(transitRahuRashi + 6) % 12]?.kn} ರಾಶಿಗಳಲ್ಲಿದೆ.`,
      hi: `गोचर राहु-केतु अक्ष ${RASHI_NAMES_5L[transitRahuRashi]?.hi} एवं ${RASHI_NAMES_5L[(transitRahuRashi + 6) % 12]?.hi} राशियों में गतिमान है।`,
      te: `గోచార రాహు-కేతు అక్షం ${RASHI_NAMES_5L[transitRahuRashi]?.te} మరియు ${RASHI_NAMES_5L[(transitRahuRashi + 6) % 12]?.te} రాశులలో సంచరిస్తోంది.`,
      ta: `கோச்சார ராகு-கேது அச்சு ${RASHI_NAMES_5L[transitRahuRashi]?.ta} மற்றும் ${RASHI_NAMES_5L[(transitRahuRashi + 6) % 12]?.ta} ராசிகளில் இயங்குகிறது.`,
      en: `Transit nodal axis is crossing ${RASHI_NAMES_5L[transitRahuRashi]?.en} and ${RASHI_NAMES_5L[(transitRahuRashi + 6) % 12]?.en}.`
    }
  };

  // =========================================================================
  // PILLAR 3: KUJA / MANGLIK DOSHA (RELATIONSHIPS & AGGRESSION)
  // =========================================================================
  const natalMarsRashi = degreeToRashi(natalMarsDeg).index;
  const marsHouseFromLagna = ((natalMarsRashi - natalLagnaRashi + 12) % 12) + 1;
  const marsHouseFromMoon = ((natalMarsRashi - natalMoonRashi + 12) % 12) + 1;

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const isLagnaManglik = manglikHouses.includes(marsHouseFromLagna);
  const isChandraManglik = manglikHouses.includes(marsHouseFromMoon);

  // Parashari cancellations
  const isAriesMarsInLagna = marsHouseFromLagna === 1 && natalMarsRashi === 0;
  const isScorpioMarsIn4th = marsHouseFromLagna === 4 && natalMarsRashi === 7;
  const isCapricornExaltedIn7th = marsHouseFromLagna === 7 && natalMarsRashi === 9;
  const isJupiterAspectingMars = Math.abs(degreeToRashi(natalJupiterDeg).index - natalMarsRashi) % 4 === 0;

  const hasManglikCancellation = isAriesMarsInLagna || isScorpioMarsIn4th || isCapricornExaltedIn7th || isJupiterAspectingMars;

  let kujaFriction = 25;
  let kujaRelief = 85;
  let kujaSeverity: DoshaSeverity = "calm";
  let kujaAfflictionKey = "anukula";

  if (isLagnaManglik && !hasManglikCancellation) {
    kujaFriction = 84;
    kujaRelief = 22;
    kujaSeverity = "high";
    kujaAfflictionKey = "lagna_manglik";
  } else if (isChandraManglik && !hasManglikCancellation) {
    kujaFriction = 72;
    kujaRelief = 20;
    kujaSeverity = "moderate";
    kujaAfflictionKey = "chandra_manglik";
  } else if (hasManglikCancellation) {
    kujaFriction = 38;
    kujaRelief = 15;
    kujaSeverity = "moderate";
    kujaAfflictionKey = "bhanga_manglik";
  } else {
    kujaFriction = 20;
    kujaRelief = 10;
    kujaSeverity = "calm";
    kujaAfflictionKey = "anukula";
  }

  const kujaNode: FrictionNode = {
    id: "kuja_manglik",
    title: KARMA_MANDALA_5L.nodes.kujaManglik.title,
    subtitle: KARMA_MANDALA_5L.nodes.kujaManglik.subtitle,
    frictionScore: kujaFriction,
    reliefScore: kujaRelief,
    severity: kujaSeverity,
    primaryAffliction: getLocaleLookup(KARMA_MANDALA_5L.nodes.kujaManglik.afflictions, kujaAfflictionKey, KARMA_MANDALA_5L.nodes.kujaManglik.afflictions.anukula),
    planetaryDrivers: ["Mars", "Venus"],
    classicalAuthority: KARMA_MANDALA_5L.nodes.kujaManglik.authority,
    immediateAction: getLocaleLookup(KARMA_MANDALA_5L.nodes.kujaManglik.actions, kujaAfflictionKey, KARMA_MANDALA_5L.nodes.kujaManglik.actions.default),
    gokarnaSeva: {
      id: "gokarna_subramanya_mangala_shanti",
      name: KARMA_MANDALA_5L.sevas.subramanyaHoma.name,
      templeName: KARMA_MANDALA_5L.sevas.subramanyaHoma.templeName,
      deity: KARMA_MANDALA_5L.sevas.subramanyaHoma.deity,
      significance: KARMA_MANDALA_5L.sevas.subramanyaHoma.significance,
      costInRupees: 1200,
      costInCoins: 1100,
      benefits: KARMA_MANDALA_5L.sevas.subramanyaHoma.benefits,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
      priestPhone: "9972339362",
      prasadaDetails: KARMA_MANDALA_5L.sevas.subramanyaHoma.prasada
    },
    bijaMantra: {
      sanskrit: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ ॥ ॐ ಶರವಣಭವಾಯ ನಮಃ ॥",
      kannada: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ ॥ ಓಂ ಶರವಣಭವಾಯ ನಮಃ ॥",
      transliteration: {
        kn: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ ॥ ಓಂ ಶರವಣಭವಾಯ ನಮಃ ॥",
        hi: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥ ॐ शरवणभवाय नमः ॥",
        te: "ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః ॥ ఓం శరవణభవాయ నమః ॥",
        ta: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ பௌமாய நமஃ ॥ ஓம் சரவணபவாய நமஃ ॥",
        en: "Om Kraam Kreem Kroum Sah Bhoumaaya Namah || Om Sharavanabhavaaya Namah ||"
      },
      count: 108,
      deity: {
        kn: "ಸುಬ್ರಹ್ಮಣ್ಯ / ಅಂಗಾರಕ ದೇವರು",
        hi: "सुब्रह्मण्य / मंगल देव",
        te: "సుబ్రహ్మణ్య / అంగారక స్వామి",
        ta: "சுப்ரமண்யர் / செவ்வாய் பகவான்",
        en: "Lord Subramanya / Mangala Deva"
      },
      meaning: KARMA_MANDALA_5L.mantras.kujaMeaning
    },
    transitContext: {
      kn: `ಕುಜನು ನಿಮ್ಮ ಜಾತಕದ ${marsHouseFromLagna}ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಗೋಚಾರ ಕುಜನು ${RASHI_NAMES_5L[transitMarsRashi]?.kn} ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ.`,
      hi: `मंगल आपकी कुंडली के ${marsHouseFromLagna}वें भाव में है, तथा गोचर मंगल ${RASHI_NAMES_5L[transitMarsRashi]?.hi} राशि में स्थित है।`,
      te: `కుజుడు మీ జాతకంలో ${marsHouseFromLagna}వ భావంలో ఉన్నారు, గోచార కుజుడు ${RASHI_NAMES_5L[transitMarsRashi]?.te} రాశిలో ఉన్నారు.`,
      ta: `செவ்வாய் உங்கள் ஜாதகத்தில் ${marsHouseFromLagna}ஆம் பாவத்தில் உள்ளார், கோச்சார செவ்வாய் ${RASHI_NAMES_5L[transitMarsRashi]?.ta} ராசியில் உள்ளார்.`,
      en: `Mars occupies house ${marsHouseFromLagna} in your natal chart, with transit Mars in ${RASHI_NAMES_5L[transitMarsRashi]?.en}.`
    }
  };

  // =========================================================================
  // PILLAR 4: GURU-CHANDAL & DHANA/KEMADRUMA WEALTH BLOCKS
  // =========================================================================
  // Kemadruma: houses 2 and 12 from Moon are empty (excluding Sun/Rahu/Ketu)
  const planetsAroundMoon = [
    natalMarsDeg,
    natalMercuryDeg,
    natalJupiterDeg,
    natalVenusDeg,
    natalSaturnDeg
  ];

  let hasPlanetIn2ndFromMoon = false;
  let hasPlanetIn12thFromMoon = false;
  const secondFromMoon = (natalMoonRashi + 1) % 12;
  const twelfthFromMoon = (natalMoonRashi + 11) % 12;

  for (const deg of planetsAroundMoon) {
    const r = degreeToRashi(deg).index;
    if (r === secondFromMoon) hasPlanetIn2ndFromMoon = true;
    if (r === twelfthFromMoon) hasPlanetIn12thFromMoon = true;
  }

  const isKemadruma = !hasPlanetIn2ndFromMoon && !hasPlanetIn12thFromMoon;

  // Guru Chandal: Jupiter within 10 degrees of Rahu
  const jupRahuDiff = Math.abs(normalizeDegree(natalJupiterDeg - natalRahuDeg));
  const isGuruChandal = jupRahuDiff < 10 || Math.abs(360 - jupRahuDiff) < 10;

  let dhanaFriction = 28;
  let dhanaRelief = 82;
  let dhanaSeverity: DoshaSeverity = "calm";
  let dhanaAfflictionKey = "anukula";

  if (isKemadruma) {
    dhanaFriction = 76;
    dhanaRelief = 24;
    dhanaSeverity = "high";
    dhanaAfflictionKey = "kemadruma";
  } else if (isGuruChandal) {
    dhanaFriction = 80;
    dhanaRelief = 22;
    dhanaSeverity = "high";
    dhanaAfflictionKey = "guru_chandal";
  } else {
    dhanaFriction = 26;
    dhanaRelief = 10;
    dhanaSeverity = "calm";
    dhanaAfflictionKey = "anukula";
  }

  const dhanaNode: FrictionNode = {
    id: "guru_chandal_dhana",
    title: KARMA_MANDALA_5L.nodes.guruChandalDhana.title,
    subtitle: KARMA_MANDALA_5L.nodes.guruChandalDhana.subtitle,
    frictionScore: dhanaFriction,
    reliefScore: dhanaRelief,
    severity: dhanaSeverity,
    primaryAffliction: getLocaleLookup(KARMA_MANDALA_5L.nodes.guruChandalDhana.afflictions, dhanaAfflictionKey, KARMA_MANDALA_5L.nodes.guruChandalDhana.afflictions.anukula),
    planetaryDrivers: ["Jupiter", "Rahu", "Mercury"],
    classicalAuthority: KARMA_MANDALA_5L.nodes.guruChandalDhana.authority,
    immediateAction: getLocaleLookup(KARMA_MANDALA_5L.nodes.guruChandalDhana.actions, dhanaAfflictionKey, KARMA_MANDALA_5L.nodes.guruChandalDhana.actions.default),
    gokarnaSeva: {
      id: "gokarna_sri_sukta_ganapati_homa",
      name: KARMA_MANDALA_5L.sevas.sriSuktaHoma.name,
      templeName: KARMA_MANDALA_5L.sevas.sriSuktaHoma.templeName,
      deity: KARMA_MANDALA_5L.sevas.sriSuktaHoma.deity,
      significance: KARMA_MANDALA_5L.sevas.sriSuktaHoma.significance,
      costInRupees: 1001,
      costInCoins: 950,
      benefits: KARMA_MANDALA_5L.sevas.sriSuktaHoma.benefits,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
      priestPhone: "9972339362",
      prasadaDetails: KARMA_MANDALA_5L.sevas.sriSuktaHoma.prasada
    },
    bijaMantra: {
      sanskrit: "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಗ್ಲೌಂ ಗಂ ಗಣಪತಯೇ ವರ ವರದ ಸರ್ವಜನಂ ಮೇ ವಶಮಾನಯ ಸ್ವಾಹಾ ॥",
      kannada: "ಓಂ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಗ್ಲೌಂ ಗಂ ಗಣಪತಯೇ ವರ ವರದ ಸರ್ವಜನಂ ಮೇ ವಶಮಾನಯ ಸ್ವಾಹಾ ॥",
      transliteration: {
        kn: "ಓಂ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಗ್ಲೌಂ ಗಂ ಗಣಪತಯೇ ವರ ವರದ ಸರ್ವಜನಂ ಮೇ ವಶಮಾನಯ ಸ್ವಾಹಾ ॥",
        hi: "ॐ श्रीं ह्रीं क्लीं ग्लौं गं गणपतये वर वरद सर्वजनं मे वशमानय स्वाहा ॥",
        te: "ఓం శ్రీం హ్రీం క్లీం గ్లౌం గం గణపతయే వర వరద సర్వజనం మే వశమానయ స్వాహా ॥",
        ta: "ஓம் ஸ்ரீம் ஹ்ரீம் க்லீம் க்லௌம் கம் கணபதயே வர வரத ஸர்வஜனம் மே வசமானய ஸ்வாஹா ॥",
        en: "Om Shreem Hreem Kleem Gloum Gam Ganapataye Vara Varada Sarvajanam Me Vashamaanaya Swaahaa ||"
      },
      count: 108,
      deity: {
        kn: "ಮಹಾ ಗಣಪತಿ ಹಾಗೂ ಮಹಾಲಕ್ಷ್ಮಿ",
        hi: "महा गणपति एवं महालक्ष्मी",
        te: "మహా గణపతి మరియు మహాలక్ష్మి",
        ta: "மகா கணபதி மற்றும் மகாலட்சுமி",
        en: "Maha Ganapati & Mahalakshmi"
      },
      meaning: KARMA_MANDALA_5L.mantras.ganapatiMeaning
    },
    transitContext: {
      kn: `ಗೋಚಾರ ಗುರುವು ${RASHI_NAMES_5L[transitJupiterRashi]?.kn} ರಾಶಿಯಲ್ಲಿದ್ದು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಪುನಶ್ಚೇತನಗೊಳಿಸುತ್ತಿದ್ದಾರೆ.`,
      hi: `गोचर बृहस्पति ${RASHI_NAMES_5L[transitJupiterRashi]?.hi} राशि में स्थित होकर आर्थिक संबल प्रदान कर रहे हैं।`,
      te: `గోచార బృహస్పతి ${RASHI_NAMES_5L[transitJupiterRashi]?.te} రాశిలో ఉండి ఆర్థిక స్థిరత్వాన్ని పునరుజ్జీవింపజేస్తున్నారు.`,
      ta: `கோச்சார குரு ${RASHI_NAMES_5L[transitJupiterRashi]?.ta} ராசியில் அமர்ந்து நிதி ஸ்திரத்தன்மையை புதுப்பிக்கிறார்.`,
      en: `Transit Jupiter is in ${RASHI_NAMES_5L[transitJupiterRashi]?.en}, reviving liquidity cycles.`
    }
  };

  // =========================================================================
  // PILLAR 5: AYUR-BALA & HEALTH VITALITY
  // =========================================================================
  const lagnaLordHouse = ((natalLagnaLordRashi - natalLagnaRashi + 12) % 12) + 1;
  const isLagnaLordInDusthana = [6, 8, 12].includes(lagnaLordHouse);

  let ayurFriction = 24;
  let ayurRelief = 86;
  let ayurSeverity: DoshaSeverity = "calm";
  let ayurAfflictionKey = "anukula";

  if (isLagnaLordInDusthana) {
    ayurFriction = 70;
    ayurRelief = 20;
    ayurSeverity = "moderate";
    ayurAfflictionKey = "dusthana_lagnesha";
  } else if (sadeSatiFriction > 80) {
    ayurFriction = 68;
    ayurRelief = 22;
    ayurSeverity = "moderate";
    ayurAfflictionKey = "shani_stress";
  } else {
    ayurFriction = 22;
    ayurRelief = 10;
    ayurSeverity = "calm";
    ayurAfflictionKey = "anukula";
  }

  const ayurNode: FrictionNode = {
    id: "ayur_bala",
    title: KARMA_MANDALA_5L.nodes.ayurBala.title,
    subtitle: KARMA_MANDALA_5L.nodes.ayurBala.subtitle,
    frictionScore: ayurFriction,
    reliefScore: ayurRelief,
    severity: ayurSeverity,
    primaryAffliction: getLocaleLookup(KARMA_MANDALA_5L.nodes.ayurBala.afflictions, ayurAfflictionKey, KARMA_MANDALA_5L.nodes.ayurBala.afflictions.anukula),
    planetaryDrivers: ["Sun", "Saturn", lagnaLord],
    classicalAuthority: KARMA_MANDALA_5L.nodes.ayurBala.authority,
    immediateAction: getLocaleLookup(KARMA_MANDALA_5L.nodes.ayurBala.actions, ayurAfflictionKey, KARMA_MANDALA_5L.nodes.ayurBala.actions.default),
    gokarnaSeva: {
      id: "gokarna_mrityunjaya_rudrabhisheka",
      name: KARMA_MANDALA_5L.sevas.rudrabhisheka.name,
      templeName: KARMA_MANDALA_5L.sevas.rudrabhisheka.templeName,
      deity: KARMA_MANDALA_5L.sevas.rudrabhisheka.deity,
      significance: KARMA_MANDALA_5L.sevas.rudrabhisheka.significance,
      costInRupees: 2100,
      costInCoins: 2000,
      benefits: KARMA_MANDALA_5L.sevas.rudrabhisheka.benefits,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
      priestPhone: "9972339362",
      prasadaDetails: KARMA_MANDALA_5L.sevas.rudrabhisheka.prasada
    },
    bijaMantra: {
      sanskrit: "ॐ ತ್ರ್ಯ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥",
      kannada: "ಓಂ ತ್ರ್ಯ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥",
      transliteration: {
        kn: "ಓಂ ತ್ರ್ಯ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥",
        hi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात् ॥",
        te: "ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ । ఉర్వారుకమివ బంధనాన్ మృత్యోర్ముక్షీయ మాಽమృతాత్ ॥",
        ta: "ஓம் த்ரயம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம் । உர்வாருகமிவ பந்தனான் ம்ருத்யோர்முக்ஷீய மாஅம்ருதாத் ॥",
        en: "Om Tryambakam Yajaamahe Sugandhim Pushtivardhanam | Urvaarukamiva Bandhanaan Mrityormuksheeya Maamritaat ||"
      },
      count: 108,
      deity: {
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾದೇವ (ಗೋಕರ್ಣ)",
        hi: "श्री महाबलेश्वर महादेव (गोकर्ण)",
        te: "శ్రీ మహాబలేశ్వర మహాదేవ (గోకర్ణ)",
        ta: "ஸ்ரீ மகாபலேஸ்வர மகாதேவர் (கோகர்ணா)",
        en: "Sri Mahabaleshwara Mahadeva (Gokarna)"
      },
      meaning: KARMA_MANDALA_5L.mantras.mrityunjayaMeaning
    },
    transitContext: {
      kn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLord} ಜಾತಕದಲ್ಲಿ ${lagnaLordHouse}ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಜೀವಶಕ್ತಿಯನ್ನು ರಕ್ಷಿಸುವ ಪರಿಹಾರ ಅಗತ್ಯ.`,
      hi: `लग्नेश ${lagnaLord} कुंडली के ${lagnaLordHouse}वें भाव में स्थित हैं, प्राण शक्ति संवर्धन आवश्यक है।`,
      te: `లగ్నాధిపతి ${lagnaLord} జాతకంలో ${lagnaLordHouse}వ స్థానంలో ఉన్నారు, ప్రాణశక్తి పెంపొందించుకోవాలి.`,
      ta: `லக்னாதிபதி ${lagnaLord} ஜாதகத்தில் ${lagnaLordHouse}ஆம் பாவத்தில் உள்ளார், பிராண சக்தியை வலுப்படுத்த வேண்டும்.`,
      en: `Ascendant lord ${lagnaLord} resides in house ${lagnaLordHouse}, signaling vital energy preservation.`
    }
  };

  const nodes: FrictionNode[] = [
    sadeSatiNode,
    rahuKetuNode,
    kujaNode,
    dhanaNode,
    ayurNode
  ];

  // Sort to identify the single highest-crisis node
  const sortedNodes = [...nodes].sort((a, b) => b.frictionScore - a.frictionScore);
  const highestCrisisNode = sortedNodes[0];

  // Overall scores
  const overallFrictionScore = Math.round(
    nodes.reduce((acc, n) => acc + n.frictionScore, 0) / nodes.length
  );
  const overallHarmonyScore = Math.round(
    100 - (overallFrictionScore * 0.28)
  );

  // Active Japa is derived from highest-crisis planet
  const activeJapaMantra = highestCrisisNode.bijaMantra;

  // =========================================================================
  // UPCOMING HIGH-POTENCY REMEDIAL MUHURTHAS (ASTRONOMICAL CALCULATION)
  // =========================================================================
  const upcomingMuhurthas = calculateUpcomingGokarnaMuhurthas(evalDate, natalMoonNakshatra, ayanamsaModel);

  return {
    devoteeName,
    birthSummary: `${RASHI_NAMES_5L[natalLagnaRashi]?.kn || "ಲಗ್ನ"} ಲಗ್ನ • ${RASHI_NAMES_5L[natalMoonRashi]?.kn || "ರಾಶಿ"} ರಾಶಿ • ${NAKSHATRA_NAMES_5L[natalMoonNakshatra]?.kn || "ನಕ್ಷತ್ರ"} ನಕ್ಷತ್ರ`,
    lagnaName: RASHI_NAMES_5L[natalLagnaRashi] || { kn: "ಲಗ್ನ", hi: "लग्न", te: "లగ్నం", ta: "லக்னம்", en: "Ascendant" },
    chandraRashiName: RASHI_NAMES_5L[natalMoonRashi] || { kn: "ರಾಶಿ", hi: "राशि", te: "రాశి", ta: "ராசி", en: "Moon Sign" },
    nakshatraName: NAKSHATRA_NAMES_5L[natalMoonNakshatra] || { kn: "ನಕ್ಷತ್ರ", hi: "नक्षत्र", te: "నక్షత్రం", ta: "நட்சத்திரம்", en: "Birth Star" },
    overallFrictionScore,
    overallHarmonyScore,
    highestCrisisNode,
    nodes,
    upcomingMuhurthas,
    activeJapaMantra,
    isUnlocked,
    transitSnapshot: {
      saturnRashiIndex: transitSaturnRashi,
      jupiterRashiIndex: transitJupiterRashi,
      rahuRashiIndex: transitRahuRashi,
      marsRashiIndex: transitMarsRashi,
      calculatedAt: evalDate.toISOString()
    }
  };
}

/**
 * Scans forward from evalDate to identify exact astronomical muhurtha windows:
 * 1. Next Shani Pradosha / Pradosha Vratam (Trayodashi Tithi)
 * 2. Next Gokarna Kotitirtha Amavasya (New Moon)
 * 3. Next Sankashti Chaturthi (Ganesha obstacle breaker)
 * 4. Devotee's upcoming Janma Nakshatra Day
 */
export function calculateUpcomingGokarnaMuhurthas(
  startDate: Date,
  birthNakshatraIdx: number,
  ayanamsaModel: AyanamsaModel = "lahiri"
): MuhurthaWindow[] {
  const windows: MuhurthaWindow[] = [];
  const startMs = startDate.getTime();

  let foundPradosha = false;
  let foundAmavasya = false;
  let foundSankashti = false;
  let foundJanmaNakshatra = false;

  // Scan day by day up to 35 days
  for (let dayOffset = 0; dayOffset <= 35; dayOffset++) {
    const scanDate = new Date(startMs + dayOffset * 24 * 60 * 60 * 1000);
    const ayanamsa = getAyanamsa(scanDate, ayanamsaModel);

    const sunTropical = normalizeDegree(Astronomy.SunPosition(scanDate).elon);
    const moonTropical = normalizeDegree(Astronomy.EclipticGeoMoon(scanDate).lon);
    const sunLong = normalizeDegree(sunTropical - ayanamsa);
    const moonLong = normalizeDegree(moonTropical - ayanamsa);

    const tithiIdx = Math.floor(normalizeDegree(moonLong - sunLong) / 12) % 30;
    const nakshatraIdx = Math.floor(moonLong / (360 / 27)) % 27;
    const weekday = scanDate.getDay(); // 0 = Sun, 6 = Sat

    const hoursRemaining = Math.max(1, Math.round((scanDate.getTime() - startMs) / (1000 * 60 * 60)));

    // 1. Shani Pradosha / Pradosha Vratam (Tithi 12 or 26)
    if (!foundPradosha && (tithiIdx === 12 || tithiIdx === 26)) {
      foundPradosha = true;
      const isShaniPradosha = weekday === 6;
      windows.push({
        id: "muhurtha_pradosha",
        title: isShaniPradosha
          ? KARMA_MANDALA_5L.muhurtha.shaniPradoshaTitle
          : KARMA_MANDALA_5L.muhurtha.pradoshaTitle,
        tithiVara: {
          kn: `${isShaniPradosha ? "ಶನಿವಾರ" : "ಪ್ರದೋಷ"} • ತ್ರಯೋದಶಿ ಪ್ರದೋಷ ಕಾಲ`,
          hi: `${isShaniPradosha ? "शनिवार" : "प्रदोष"} • त्रयोदशी प्रदोष काल`,
          te: `${isShaniPradosha ? "శనివారం" : "ప్రదోషం"} • త్రయోదశి ప్రదోష కాలం`,
          ta: `${isShaniPradosha ? "சனிக்கிழமை" : "பிரதோஷம்"} • திரயோதசி பிரதோஷ காலம்`,
          en: `${isShaniPradosha ? "Saturday" : "Pradosha"} • Trayodashi Twilight Window`
        },
        startDateTime: scanDate.toISOString(),
        endDateTime: new Date(scanDate.getTime() + 3 * 3600 * 1000).toISOString(),
        urgencyHoursRemaining: hoursRemaining,
        remedialPowerMultiplier: isShaniPradosha
          ? { kn: "೧೦೦ ಪಟ್ಟು ಕರ್ಮ ಶಾಂತಿ", hi: "१०० गुना कर्म शांति", te: "100 రెట్ల కర్మ శాంతి", ta: "100 மடங்கு கர்ம சாந்தி", en: "100x Karmic Efficacy" }
          : { kn: "೧೦ ಪಟ್ಟು ಶಕ್ತಿ", hi: "१० गुना शक्ति", te: "10 రెట్ల శక్తి", ta: "10 மடங்கு சக்தி", en: "10x Potency Window" },
        guideline: isShaniPradosha
          ? KARMA_MANDALA_5L.muhurtha.shaniPradoshaGuideline
          : KARMA_MANDALA_5L.muhurtha.pradoshaGuideline
      });
    }

    // 2. Amavasya (Kotitirtha Tila Homa Window, Tithi 29)
    if (!foundAmavasya && tithiIdx === 29) {
      foundAmavasya = true;
      windows.push({
        id: "muhurtha_amavasya",
        title: KARMA_MANDALA_5L.muhurtha.amavasyaTitle,
        tithiVara: {
          kn: "ದರ್ಶ ಅಮಾವಾಸ್ಯೆ • ಪಿತೃ ತರ್ಪಣ ಕಾಲ",
          hi: "दर्श अमावस्या • पितृ तर्पण काल",
          te: "దర్శ అమావాస్య • పితృ తర్పణ కాలం",
          ta: "தர்ச அமாவாசை • பித்ரு தர்ப்பண காலம்",
          en: "Darsha Amavasya • Ancestral Cleansing"
        },
        startDateTime: scanDate.toISOString(),
        endDateTime: new Date(scanDate.getTime() + 12 * 3600 * 1000).toISOString(),
        urgencyHoursRemaining: hoursRemaining,
        remedialPowerMultiplier: {
          kn: "ಪಿತೃ ಋಣ ಮುಕ್ತಿ ಕಾಲ",
          hi: "पितृ ऋण मुक्ति काल",
          te: "పితృ ఋణ విముక్తి కాలం",
          ta: "பித்ரு கடன் தீர்வு காலம்",
          en: "Ancestral Karma Release"
        },
        guideline: KARMA_MANDALA_5L.muhurtha.amavasyaGuideline
      });
    }

    // 3. Sankashti Chaturthi (Tithi 18 = Krishna Chaturthi)
    if (!foundSankashti && tithiIdx === 18) {
      foundSankashti = true;
      windows.push({
        id: "muhurtha_sankashti",
        title: KARMA_MANDALA_5L.muhurtha.sankashtiTitle,
        tithiVara: {
          kn: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ • ಚಂದ್ರೋದಯ ಕಾಲ",
          hi: "संकष्टहर चतुर्थी • चंद्रोदय काल",
          te: "సంకష్టహర చతుర్థి • చంద్రోదయ కాలం",
          ta: "சங்கடஹர சதுர்த்தி • சந்திரோதய காலம்",
          en: "Sankashti Chaturthi • Moonrise Window"
        },
        startDateTime: scanDate.toISOString(),
        endDateTime: new Date(scanDate.getTime() + 4 * 3600 * 1000).toISOString(),
        urgencyHoursRemaining: hoursRemaining,
        remedialPowerMultiplier: {
          kn: "ಸರ್ವ ವಿಘ್ನ ನಿವಾರಕ",
          hi: "सर्व विघ्न निवारक",
          te: "సర్వ విఘ్న నివారణ",
          ta: "சகல தடைகள் நீக்கம்",
          en: "All-Obstacle Clearing"
        },
        guideline: KARMA_MANDALA_5L.muhurtha.sankashtiGuideline
      });
    }

    // 4. Native's Janma Nakshatra Day
    if (!foundJanmaNakshatra && nakshatraIdx === birthNakshatraIdx && dayOffset > 0) {
      foundJanmaNakshatra = true;
      windows.push({
        id: "muhurtha_janma_nakshatra",
        title: KARMA_MANDALA_5L.muhurtha.janmaNakshatraTitle,
        tithiVara: {
          kn: `ಜನ್ಮ ನಕ್ಷತ್ರ ಆವರ್ತನ (${NAKSHATRA_NAMES_5L[birthNakshatraIdx]?.kn || ""})`,
          hi: `जन्म नक्षत्र आवर्तन (${NAKSHATRA_NAMES_5L[birthNakshatraIdx]?.hi || ""})`,
          te: `జన్మ నక్షత్ర ఆవర్తనం (${NAKSHATRA_NAMES_5L[birthNakshatraIdx]?.te || ""})`,
          ta: `ஜென்ம நட்சத்திர சுழற்சி (${NAKSHATRA_NAMES_5L[birthNakshatraIdx]?.ta || ""})`,
          en: `Natal Star Orbit (${NAKSHATRA_NAMES_5L[birthNakshatraIdx]?.en || ""})`
        },
        startDateTime: scanDate.toISOString(),
        endDateTime: new Date(scanDate.getTime() + 24 * 3600 * 1000).toISOString(),
        urgencyHoursRemaining: hoursRemaining,
        remedialPowerMultiplier: {
          kn: "ಆಯುಷ್ಯ-ಆರೋಗ್ಯ ವರ್ಧನೆ",
          hi: "आयुष्य एवं आरोग्य वर्धन",
          te: "ఆయురారోగ్య వర్ధనం",
          ta: "ஆயுள்-ஆரோக்கிய பெருக்கம்",
          en: "Vital Aura Amplification"
        },
        guideline: KARMA_MANDALA_5L.muhurtha.janmaNakshatraGuideline
      });
    }

    if (windows.length >= 4) break;
  }

  return windows.sort((a, b) => a.urgencyHoursRemaining - b.urgencyHoursRemaining);
}
