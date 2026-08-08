/**
 * Reads a birth chart and recommends the sevas performed at Gokarna.
 *
 * Each recommendation carries the reason it was raised, written in plain
 * language in all five supported languages, so the person understands what in
 * their own chart led to the suggestion.
 */

import { normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import { PlanetName, type AyanamsaModel, type KundliOutput, type NodeType } from "./AstroTypes";
import { SEVA_CATALOG, type SevaEntry, type SevaId } from "../data/gokarnaSevas";
import type { L5 } from "../features/seva/sevaLocale";

export type SevaFinding = {
  id: string;
  /** Higher means the chart pushes harder towards the linked sevas. */
  weight: number;
  reason: L5;
  sevas: SevaId[];
};

export type SevaRecommendation = {
  seva: SevaEntry;
  /** Combined weight of every finding that pointed here. */
  score: number;
  reasons: L5[];
};

/* ------------------------------------------------------------------ *
 * Chart reading helpers
 * ------------------------------------------------------------------ */

const houseOf = (kundli: KundliOutput, planet: PlanetName): number =>
  kundli.planets.find((p) => p.name === planet)?.house ?? 0;

const degreeOf = (kundli: KundliOutput, planet: PlanetName): number =>
  kundli.planets.find((p) => p.name === planet)?.degree ?? 0;

const isDebilitated = (kundli: KundliOutput, planet: PlanetName): boolean =>
  Boolean(kundli.planets.find((p) => p.name === planet)?.isDebilitated);

const sharesHouse = (kundli: KundliOutput, a: PlanetName, b: PlanetName): boolean => {
  const ha = houseOf(kundli, a);
  const hb = houseOf(kundli, b);
  return ha > 0 && ha === hb;
};

const planetsInHouse = (kundli: KundliOutput, house: number): PlanetName[] =>
  kundli.planets.filter((p) => p.house === house).map((p) => p.name);

const MALEFICS = [PlanetName.Saturn, PlanetName.Mars, PlanetName.Rahu, PlanetName.Ketu];

const DUSTHANAS = [6, 8, 12];

/**
 * Kala Sarpa: the seven visible grahas all fall on one side of the Rahu–Ketu
 * axis. Measured on the sidereal circle rather than by house, which is the
 * stricter reading.
 */
const hasKalaSarpa = (kundli: KundliOutput): boolean => {
  const rahu = degreeOf(kundli, PlanetName.Rahu);
  const others = [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Mercury,
    PlanetName.Jupiter,
    PlanetName.Venus,
    PlanetName.Saturn
  ].map((p) => normalizeDegree(degreeOf(kundli, p) - rahu));

  // Everything within the 180° arc that runs forward from Rahu, or the one behind.
  return others.every((d) => d < 180) || others.every((d) => d >= 180);
};

/** Saturn transiting the 12th, 1st or 2nd rashi from the natal Moon. */
const sadeSatiHouse = (
  kundli: KundliOutput,
  now: Date,
  model: AyanamsaModel,
  nodeType: NodeType
): number | null => {
  const sky = siderealLongitudes(now, model, nodeType);
  const transitSaturnRashi = Math.floor(normalizeDegree(sky.saturn) / 30);
  const house = ((transitSaturnRashi - kundli.moonSign.index + 12) % 12) + 1;
  return house === 12 || house === 1 || house === 2 ? house : null;
};

/* ------------------------------------------------------------------ *
 * Findings
 * ------------------------------------------------------------------ */

export type SevaAnalysisOptions = {
  now?: Date;
  ayanamsaModel?: AyanamsaModel;
  nodeType?: NodeType;
};

export const analyseChartForSeva = (
  kundli: KundliOutput,
  options: SevaAnalysisOptions = {}
): SevaFinding[] => {
  const now = options.now ?? new Date();
  const model = options.ayanamsaModel ?? "lahiri";
  const nodeType = options.nodeType ?? "mean";

  const findings: SevaFinding[] = [];

  /* --- Kuja dosha ------------------------------------------------- */
  const marsHouse = houseOf(kundli, PlanetName.Mars);
  if ([1, 2, 4, 7, 8, 12].includes(marsHouse)) {
    findings.push({
      id: "kuja_dosha",
      weight: 80,
      sevas: ["kujashanti", "ganapatihoma"],
      reason: {
        en: `Kuja sits in house ${marsHouse} of your chart. Classically this brings delay or friction in marriage.`,
        kn: `ನಿಮ್ಮ ಜಾತಕದ ${marsHouse}ನೇ ಮನೆಯಲ್ಲಿ ಕುಜ ಇದ್ದಾನೆ. ಇದು ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ಮದುವೆಯಲ್ಲಿ ವಿಳಂಬ ಅಥವಾ ಘರ್ಷಣೆ ತರುತ್ತದೆ.`,
        te: `మీ జాతకంలో ${marsHouse}వ ఇంట్లో కుజుడు ఉన్నాడు. ఇది సంప్రదాయకంగా వివాహంలో జాప్యం లేదా ఘర్షణ తెస్తుంది.`,
        ta: `உங்கள் ஜாதகத்தின் ${marsHouse}ஆம் வீட்டில் செவ்வாய் உள்ளார். இது பாரம்பரியமாக திருமணத்தில் தாமதம் அல்லது உரசலைத் தரும்.`,
        hi: `आपकी कुंडली के ${marsHouse}वें भाव में कुज स्थित है। परंपरा के अनुसार यह विवाह में देरी या मतभेद लाता है।`
      }
    });
  }

  /* --- Sade Sati -------------------------------------------------- */
  const sadeSati = sadeSatiHouse(kundli, now, model, nodeType);
  if (sadeSati) {
    findings.push({
      id: "sade_sati",
      weight: 88,
      sevas: ["shanitilahoma", "mrityunjaya"],
      reason: {
        en: "Shani is currently passing over the region of your janma rashi. This is the Sade Sati period, when work moves slowly.",
        kn: "ಶನಿ ಈಗ ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯ ಸುತ್ತ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ. ಇದು ಸಾಡೇ ಸಾತಿ ಕಾಲ, ಈ ಸಮಯದಲ್ಲಿ ಕೆಲಸ ನಿಧಾನವಾಗಿ ನಡೆಯುತ್ತದೆ.",
        te: "శని ప్రస్తుతం మీ జన్మ రాశి చుట్టూ సంచరిస్తున్నాడు. ఇది ఏలినాటి శని కాలం, ఈ సమయంలో పని నెమ్మదిగా సాగుతుంది.",
        ta: "சனி தற்போது உங்கள் ஜன்ம ராசியைச் சுற்றி சஞ்சரிக்கிறார். இது ஏழரைச் சனி காலம், இந்நேரத்தில் வேலை மெதுவாக நகரும்.",
        hi: "शनि इस समय आपकी जन्म राशि के आसपास से गुजर रहे हैं। यह साढ़े साती की अवधि है, जिसमें काम धीरे चलता है।"
      }
    });
  }

  /* --- Saturn in a dusthana --------------------------------------- */
  const saturnHouse = houseOf(kundli, PlanetName.Saturn);
  if (DUSTHANAS.includes(saturnHouse)) {
    findings.push({
      id: "saturn_dusthana",
      weight: 66,
      sevas: ["shanitilahoma", "navagrahashanti"],
      reason: {
        en: `Shani is placed in house ${saturnHouse}, a difficult house. Effort takes longer to show results.`,
        kn: `ಶನಿ ${saturnHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ, ಇದು ಕಠಿಣ ಸ್ಥಾನ. ಪ್ರಯತ್ನದ ಫಲ ಕಾಣಲು ಹೆಚ್ಚು ಸಮಯ ಬೇಕಾಗುತ್ತದೆ.`,
        te: `శని ${saturnHouse}వ ఇంట్లో ఉన్నాడు, ఇది కష్టమైన స్థానం. ప్రయత్న ఫలితం కనిపించడానికి ఎక్కువ సమయం పడుతుంది.`,
        ta: `சனி ${saturnHouse}ஆம் வீட்டில் உள்ளார், இது கடினமான இடம். முயற்சியின் பலன் தெரிய அதிக நேரம் ஆகும்.`,
        hi: `शनि ${saturnHouse}वें भाव में स्थित हैं, जो कठिन भाव है। प्रयास का फल दिखने में अधिक समय लगता है।`
      }
    });
  }

  /* --- Kala Sarpa -------------------------------------------------- */
  if (hasKalaSarpa(kundli)) {
    findings.push({
      id: "kala_sarpa",
      weight: 95,
      sevas: ["sarpasamskara", "rudrabhisheka"],
      reason: {
        en: "All seven grahas fall on one side of the Rahu and Ketu axis. This is the Kala Sarpa pattern and it asks for a serpent seva.",
        kn: "ಏಳೂ ಗ್ರಹಗಳು ರಾಹು-ಕೇತು ಅಕ್ಷದ ಒಂದೇ ಬದಿಯಲ್ಲಿವೆ. ಇದು ಕಾಲ ಸರ್ಪ ಯೋಗ, ಇದಕ್ಕೆ ಸರ್ಪ ಸೇವೆ ಅಗತ್ಯ.",
        te: "ఏడు గ్రహాలూ రాహు-కేతు అక్షానికి ఒకే వైపు ఉన్నాయి. ఇది కాల సర్ప యోగం, దీనికి సర్ప సేవ అవసరం.",
        ta: "ஏழு கிரகங்களும் ராகு-கேது அச்சின் ஒரே பக்கத்தில் உள்ளன. இது கால சர்ப்ப அமைப்பு, இதற்கு சர்ப்ப சேவை தேவை.",
        hi: "सातों ग्रह राहु-केतु अक्ष के एक ही ओर हैं। यह काल सर्प योग है, जिसके लिए सर्प सेवा आवश्यक है।"
      }
    });
  }

  /* --- Nodal axis on a sensitive house ----------------------------- */
  const rahuHouse = houseOf(kundli, PlanetName.Rahu);
  if ([1, 5, 7, 9].includes(rahuHouse)) {
    findings.push({
      id: "nodal_axis",
      weight: 70,
      sevas: ["sarpasamskara", "ganapatihoma"],
      reason: {
        en: `Rahu occupies house ${rahuHouse}. This can create sudden turns and confusion in that part of life.`,
        kn: `ರಾಹು ${rahuHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ಇದು ಜೀವನದ ಆ ಭಾಗದಲ್ಲಿ ಹಠಾತ್ ತಿರುವು ಮತ್ತು ಗೊಂದಲ ಉಂಟುಮಾಡಬಹುದು.`,
        te: `రాహువు ${rahuHouse}వ ఇంట్లో ఉన్నాడు. ఇది జీవితంలోని ఆ భాగంలో హఠాత్ మలుపులు, గందరగోళం కలిగించవచ్చు.`,
        ta: `ராகு ${rahuHouse}ஆம் வீட்டில் உள்ளார். இது வாழ்வின் அப்பகுதியில் திடீர் திருப்பங்களையும் குழப்பத்தையும் ஏற்படுத்தலாம்.`,
        hi: `राहु ${rahuHouse}वें भाव में हैं। यह जीवन के उस हिस्से में अचानक मोड़ और उलझन ला सकता है।`
      }
    });
  }

  /* --- Pitru dosha -------------------------------------------------- */
  const sunWithNode =
    sharesHouse(kundli, PlanetName.Sun, PlanetName.Rahu) ||
    sharesHouse(kundli, PlanetName.Sun, PlanetName.Ketu);
  const ninthHouseMalefics = planetsInHouse(kundli, 9).filter((p) => MALEFICS.includes(p));

  if (sunWithNode || ninthHouseMalefics.length > 0) {
    findings.push({
      id: "pitru_dosha",
      weight: 90,
      sevas: ["pindapradana", "tripindi", "narayanabali"],
      reason: {
        en: sunWithNode
          ? "Surya, who stands for the father and the forefathers, sits with a shadow graha. This points to a pending duty towards the ancestors."
          : "The ninth house of forefathers carries a difficult graha. This points to a pending duty towards the ancestors.",
        kn: sunWithNode
          ? "ತಂದೆ ಮತ್ತು ಪಿತೃಗಳನ್ನು ಸೂಚಿಸುವ ಸೂರ್ಯ ಛಾಯಾ ಗ್ರಹದೊಂದಿಗೆ ಇದ್ದಾನೆ. ಇದು ಪಿತೃಗಳಿಗೆ ಬಾಕಿ ಇರುವ ಕರ್ತವ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ."
          : "ಪಿತೃಗಳ ಒಂಬತ್ತನೇ ಮನೆಯಲ್ಲಿ ಕಠಿಣ ಗ್ರಹವಿದೆ. ಇದು ಪಿತೃಗಳಿಗೆ ಬಾಕಿ ಇರುವ ಕರ್ತವ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        te: sunWithNode
          ? "తండ్రిని, పితరులను సూచించే సూర్యుడు ఛాయా గ్రహంతో ఉన్నాడు. ఇది పితరులకు మిగిలిన బాధ్యతను సూచిస్తుంది."
          : "పితరుల తొమ్మిదవ ఇంట్లో కఠిన గ్రహం ఉంది. ఇది పితరులకు మిగిలిన బాధ్యతను సూచిస్తుంది.",
        ta: sunWithNode
          ? "தந்தையையும் முன்னோர்களையும் குறிக்கும் சூரியன் நிழல் கிரகத்துடன் உள்ளார். இது முன்னோர்களுக்கான நிலுவைக் கடமையைக் காட்டுகிறது."
          : "முன்னோர்களின் ஒன்பதாம் வீட்டில் கடினமான கிரகம் உள்ளது. இது முன்னோர்களுக்கான நிலுவைக் கடமையைக் காட்டுகிறது.",
        hi: sunWithNode
          ? "पिता और पितरों के कारक सूर्य छाया ग्रह के साथ हैं। यह पितरों के प्रति शेष कर्तव्य को दर्शाता है।"
          : "पितरों के नवम भाव में कठिन ग्रह है। यह पितरों के प्रति शेष कर्तव्य को दर्शाता है।"
      }
    });
  }

  /* --- Afflicted Guru ------------------------------------------------ */
  const guruAfflicted =
    isDebilitated(kundli, PlanetName.Jupiter) ||
    sharesHouse(kundli, PlanetName.Jupiter, PlanetName.Rahu) ||
    sharesHouse(kundli, PlanetName.Jupiter, PlanetName.Ketu);

  if (guruAfflicted) {
    findings.push({
      id: "guru_afflicted",
      weight: 64,
      sevas: ["ganapatihoma", "navagrahashanti", "satyanarayana"],
      reason: {
        en: "Guru, the graha of wisdom and growth, is weak in your chart. Clarity and steady growth need support.",
        kn: "ಜ್ಞಾನ ಮತ್ತು ಅಭಿವೃದ್ಧಿಯ ಗ್ರಹವಾದ ಗುರು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ದುರ್ಬಲನಾಗಿದ್ದಾನೆ. ಸ್ಪಷ್ಟತೆ ಮತ್ತು ಸ್ಥಿರ ಬೆಳವಣಿಗೆಗೆ ಬೆಂಬಲ ಬೇಕು.",
        te: "జ్ఞానం, అభివృద్ధి గ్రహమైన గురువు మీ జాతకంలో బలహీనంగా ఉన్నాడు. స్పష్టతకు, స్థిర వృద్ధికి మద్దతు అవసరం.",
        ta: "ஞானமும் வளர்ச்சியும் தரும் குரு உங்கள் ஜாதகத்தில் பலவீனமாக உள்ளார். தெளிவுக்கும் நிலையான வளர்ச்சிக்கும் ஆதரவு தேவை.",
        hi: "ज्ञान और वृद्धि के ग्रह गुरु आपकी कुंडली में कमजोर हैं। स्पष्टता और स्थिर उन्नति के लिए सहारा चाहिए।"
      }
    });
  }

  /* --- Afflicted Chandra --------------------------------------------- */
  const moonHouse = houseOf(kundli, PlanetName.Moon);
  const moonAfflicted =
    DUSTHANAS.includes(moonHouse) ||
    sharesHouse(kundli, PlanetName.Moon, PlanetName.Saturn) ||
    sharesHouse(kundli, PlanetName.Moon, PlanetName.Rahu) ||
    sharesHouse(kundli, PlanetName.Moon, PlanetName.Ketu);

  if (moonAfflicted) {
    findings.push({
      id: "moon_afflicted",
      weight: 74,
      sevas: ["rudrabhisheka", "mrityunjaya"],
      reason: {
        en: "Chandra, who rules the mind, is under pressure in your chart. Rest and regular prayer settle the mind quickly.",
        kn: "ಮನಸ್ಸನ್ನು ಆಳುವ ಚಂದ್ರ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಒತ್ತಡದಲ್ಲಿದ್ದಾನೆ. ವಿಶ್ರಾಂತಿ ಮತ್ತು ನಿಯಮಿತ ಪ್ರಾರ್ಥನೆ ಮನಸ್ಸನ್ನು ಬೇಗ ಶಾಂತಗೊಳಿಸುತ್ತದೆ.",
        te: "మనసును పాలించే చంద్రుడు మీ జాతకంలో ఒత్తిడిలో ఉన్నాడు. విశ్రాంతి, నియమిత ప్రార్థన మనసును త్వరగా శాంతపరుస్తాయి.",
        ta: "மனதை ஆளும் சந்திரன் உங்கள் ஜாதகத்தில் அழுத்தத்தில் உள்ளார். ஓய்வும் தவறாத பிரார்த்தனையும் மனதை விரைவில் அமைதிப்படுத்தும்.",
        hi: "मन के स्वामी चंद्र आपकी कुंडली में दबाव में हैं। विश्राम और नियमित प्रार्थना मन को शीघ्र शांत करते हैं।"
      }
    });
  }

  /* --- Malefics in the eighth ---------------------------------------- */
  const eighthMalefics = planetsInHouse(kundli, 8).filter((p) => MALEFICS.includes(p));
  if (eighthMalefics.length > 0) {
    findings.push({
      id: "eighth_house",
      weight: 68,
      sevas: ["mrityunjaya", "ayushyahoma"],
      reason: {
        en: "The eighth house, which governs health and sudden change, carries a difficult graha. A health seva is advised.",
        kn: "ಆರೋಗ್ಯ ಮತ್ತು ಹಠಾತ್ ಬದಲಾವಣೆಯ ಎಂಟನೇ ಮನೆಯಲ್ಲಿ ಕಠಿಣ ಗ್ರಹವಿದೆ. ಆರೋಗ್ಯದ ಸೇವೆ ಸೂಚಿಸಲಾಗಿದೆ.",
        te: "ఆరోగ్యం, ఆకస్మిక మార్పుల ఎనిమిదవ ఇంట్లో కఠిన గ్రహం ఉంది. ఆరోగ్య సేవ సూచించబడింది.",
        ta: "ஆரோக்கியமும் திடீர் மாற்றமும் சார்ந்த எட்டாம் வீட்டில் கடினமான கிரகம் உள்ளது. ஆரோக்கியச் சேவை பரிந்துரைக்கப்படுகிறது.",
        hi: "स्वास्थ्य और आकस्मिक परिवर्तन के अष्टम भाव में कठिन ग्रह है। स्वास्थ्य सेवा की सलाह है।"
      }
    });
  }

  /* --- Several weak grahas -------------------------------------------- */
  const weakCount = kundli.planets.filter(
    (p) => p.isDebilitated || DUSTHANAS.includes(p.house)
  ).length;

  if (weakCount >= 3) {
    findings.push({
      id: "many_weak",
      weight: 72,
      sevas: ["navagrahashanti", "rudrabhisheka"],
      reason: {
        en: `${weakCount} grahas in your chart stand in weak positions. A combined shanti for all nine works better than separate ones.`,
        kn: `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${weakCount} ಗ್ರಹಗಳು ದುರ್ಬಲ ಸ್ಥಾನದಲ್ಲಿವೆ. ಪ್ರತ್ಯೇಕ ಶಾಂತಿಗಿಂತ ಒಂಬತ್ತೂ ಗ್ರಹಗಳಿಗೆ ಒಟ್ಟಿಗೆ ಶಾಂತಿ ಮಾಡುವುದು ಉತ್ತಮ.`,
        te: `మీ జాతకంలో ${weakCount} గ్రహాలు బలహీన స్థానాల్లో ఉన్నాయి. వేర్వేరు శాంతుల కంటే తొమ్మిది గ్రహాలకు కలిపి శాంతి చేయడం మేలు.`,
        ta: `உங்கள் ஜாதகத்தில் ${weakCount} கிரகங்கள் பலவீனமான இடங்களில் உள்ளன. தனித்தனி சாந்தியை விட ஒன்பது கிரகங்களுக்கும் சேர்த்துச் செய்வது சிறந்தது.`,
        hi: `आपकी कुंडली में ${weakCount} ग्रह कमजोर स्थानों पर हैं। अलग-अलग शांति की तुलना में नौ ग्रहों की सम्मिलित शांति अधिक लाभकारी है।`
      }
    });
  }

  /* --- Baseline, always offered ---------------------------------------- */
  findings.push({
    id: "gokarna_baseline",
    weight: 55,
    sevas: ["rudrabhisheka", "ganapatihoma", "satyanarayana"],
    reason: {
      en: "Gokarna is the seat of the Atmalinga. A visit is not considered complete without an offering to Shri Mahabaleshwara.",
      kn: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗದ ಕ್ಷೇತ್ರ. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಸೇವೆ ಸಲ್ಲಿಸದೆ ಯಾತ್ರೆ ಪೂರ್ಣವೆಂದು ಪರಿಗಣಿಸಲಾಗುವುದಿಲ್ಲ.",
      te: "గోకర్ణం ఆత్మలింగ క్షేత్రం. శ్రీ మహాబలేశ్వరునికి సేవ చేయకుండా యాత్ర పూర్తయినట్లు భావించరు.",
      ta: "கோகர்ணம் ஆத்மலிங்கத்தின் தலம். ஸ்ரீ மகாபலேஸ்வரருக்குச் சேவை செய்யாமல் யாத்திரை நிறைவடைந்ததாகக் கருதப்படுவதில்லை.",
      hi: "गोकर्ण आत्मलिंग का क्षेत्र है। श्री महाबलेश्वर को सेवा अर्पित किए बिना यात्रा पूर्ण नहीं मानी जाती।"
    }
  });

  return findings.sort((a, b) => b.weight - a.weight);
};

/**
 * Turns the findings into a ranked seva list. The first entry is the primary
 * recommendation; the rest are shown as further options.
 */
export const recommendSevas = (
  kundli: KundliOutput,
  options: SevaAnalysisOptions = {}
): { findings: SevaFinding[]; recommendations: SevaRecommendation[] } => {
  const findings = analyseChartForSeva(kundli, options);

  const bucket = new Map<SevaId, { score: number; reasons: L5[] }>();

  for (const finding of findings) {
    finding.sevas.forEach((sevaId, position) => {
      // The first seva named by a finding carries its full weight; the rest taper.
      const share = finding.weight * (position === 0 ? 1 : position === 1 ? 0.55 : 0.35);
      const existing = bucket.get(sevaId);
      if (existing) {
        existing.score += share;
        if (position === 0) existing.reasons.push(finding.reason);
      } else {
        bucket.set(sevaId, { score: share, reasons: position === 0 ? [finding.reason] : [] });
      }
    });
  }

  const recommendations: SevaRecommendation[] = Array.from(bucket.entries())
    .map(([sevaId, value]) => ({
      seva: SEVA_CATALOG[sevaId],
      score: Math.round(value.score),
      reasons: value.reasons
    }))
    .sort((a, b) => b.score - a.score);

  // Every recommendation should be able to explain itself.
  for (const rec of recommendations) {
    if (rec.reasons.length === 0) {
      const supporting = findings.find((f) => f.sevas.includes(rec.seva.id));
      if (supporting) rec.reasons.push(supporting.reason);
    }
  }

  return { findings, recommendations };
};
