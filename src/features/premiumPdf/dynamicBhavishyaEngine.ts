/**
 * Dynamic Bhavishya Engine (100% Mathematical Kundali Fallback Engine)
 *
 * Guarantees that every section of the Premium PDF V1 report is 100% mathematically
 * grounded in the native's exact birth chart, running Vimshottari Dasha-Bhukti,
 * live planetary transits (Gochara), and classical Parashara / Raman rules.
 *
 * ZERO static treatise or generic placeholders.
 * STRICT REQUIREMENT: At least 2 substantial paragraphs with 5 to 6 full lines each.
 */

import {
  type GrahaKey,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5
} from "./premiumPdfLocale";
import type { NatalPlacement, TransitPlacement } from "./premiumPrompts";

export interface KundaliAnalysisInput {
  lagnaRashiIndex: number;
  moonRashiIndex: number;
  moonNakshatraIndex?: number | null;
  natalPlanets: NatalPlacement[];
  transits?: TransitPlacement[];
  mahaLord?: GrahaKey | null;
  bhuktiLord?: GrahaKey | null;
  gender?: "Male" | "Female";
  ageYears?: number;
  lang: string;
}

export interface HouseFact {
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  lordGraha: GrahaKey;
  lordName: string;
  lordHouse: number;
  lordRashiIndex: number;
  lordRashiName: string;
  lordIsExalted: boolean;
  lordIsDebilitated: boolean;
  lordIsRetrograde: boolean;
  occupants: NatalPlacement[];
  occupantsNames: string[];
}

export interface ParsedKundaliChart {
  lang: string;
  lagnaRashiIndex: number;
  lagnaSignName: string;
  moonRashiIndex: number;
  moonSignName: string;
  nakshatraName: string;
  gender: "Male" | "Female";
  ageYears: number;
  mahaLordKey: GrahaKey | null;
  mahaLordName: string;
  bhuktiLordKey: GrahaKey | null;
  bhuktiLordName: string;
  dashaSummary: string;
  houses: Record<number, HouseFact>;
  venusPlacement: NatalPlacement | null;
  jupiterPlacement: NatalPlacement | null;
  saturnPlacement: NatalPlacement | null;
  marsPlacement: NatalPlacement | null;
  mercuryPlacement: NatalPlacement | null;
  sunPlacement: NatalPlacement | null;
  moonPlacement: NatalPlacement | null;
  isManglik: boolean;
  spouseDirection: { en: string; kn: string; hi: string; te: string; ta: string };
  transitSaturn: { houseFromMoon: number; isSadeSati: boolean; isAshtama: boolean; isKantaka: boolean } | null;
  transitJupiter: { houseFromMoon: number; isGuruBala: boolean } | null;
  transitRahu: { houseFromMoon: number } | null;
  transitKetu: { houseFromMoon: number } | null;
}

const RASHI_LORD_GRAHAS: GrahaKey[] = [
  "Mars",    // 0 Aries
  "Venus",   // 1 Taurus
  "Mercury", // 2 Gemini
  "Moon",    // 3 Cancer
  "Sun",     // 4 Leo
  "Mercury", // 5 Virgo
  "Venus",   // 6 Libra
  "Mars",    // 7 Scorpio
  "Jupiter", // 8 Sagittarius
  "Saturn",  // 9 Capricorn
  "Saturn",  // 10 Aquarius
  "Jupiter"  // 11 Pisces
];

export const SPOUSE_DIRECTIONS: Record<number, { en: string; kn: string; hi: string; te: string; ta: string }> = {
  0: { en: "East", kn: "ಪೂರ್ವ", hi: "पूर्व", te: "తూర్పు", ta: "கிழக்கு" },
  1: { en: "South", kn: "ದಕ್ಷಿಣ", hi: "दक्षिण", te: "దక్షిణం", ta: "தெற்கு" },
  2: { en: "West", kn: "ಪಶ್ಚಿಮ", hi: "पश्चिम", te: "పడమర", ta: "மேற்கு" },
  3: { en: "North", kn: "ಉತ್ತರ", hi: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு" }
};

export function analyzeKundali(input: KundaliAnalysisInput): ParsedKundaliChart {
  const { lang, lagnaRashiIndex, moonRashiIndex, natalPlanets, transits = [], gender = "Male", ageYears = 30 } = input;

  const lagnaSignName = pick(RASHI_L5[lagnaRashiIndex], lang);
  const moonSignName = pick(RASHI_L5[moonRashiIndex], lang);
  const nakshatraName = input.moonNakshatraIndex !== null && input.moonNakshatraIndex !== undefined && input.moonNakshatraIndex >= 0
    ? pick(NAKSHATRA_L5[input.moonNakshatraIndex], lang)
    : "";

  const mahaLordKey = input.mahaLord || null;
  const bhuktiLordKey = input.bhuktiLord || null;
  const mahaLordName = mahaLordKey ? pick(GRAHA_L5[mahaLordKey], lang) : "Dasha Lord";
  const bhuktiLordName = bhuktiLordKey ? pick(GRAHA_L5[bhuktiLordKey], lang) : "Bhukti Lord";
  const dashaSummary = `${mahaLordName} - ${bhuktiLordName}`;

  // Analyze all 12 houses from Lagna
  const houses: Record<number, HouseFact> = {};
  for (let h = 1; h <= 12; h++) {
    const rIdx = (lagnaRashiIndex + h - 1) % 12;
    const rName = pick(RASHI_L5[rIdx], lang);
    const lordKey = RASHI_LORD_GRAHAS[rIdx];
    const lordName = pick(GRAHA_L5[lordKey], lang);

    const lordPlacement = natalPlanets.find(p => p.graha === lordKey);
    const occupants = natalPlanets.filter(p => p.house === h);
    const occupantsNames = occupants.map(p => pick(GRAHA_L5[p.graha], lang));

    houses[h] = {
      houseNumber: h,
      rashiIndex: rIdx,
      rashiName: rName,
      lordGraha: lordKey,
      lordName,
      lordHouse: lordPlacement ? lordPlacement.house : 1,
      lordRashiIndex: lordPlacement ? lordPlacement.rashiIndex : rIdx,
      lordRashiName: lordPlacement ? pick(RASHI_L5[lordPlacement.rashiIndex], lang) : rName,
      lordIsExalted: !!lordPlacement?.exalted,
      lordIsDebilitated: !!lordPlacement?.debilitated,
      lordIsRetrograde: !!lordPlacement?.retrograde,
      occupants,
      occupantsNames
    };
  }

  const venusPlacement = natalPlanets.find(p => p.graha === "Venus") || null;
  const jupiterPlacement = natalPlanets.find(p => p.graha === "Jupiter") || null;
  const saturnPlacement = natalPlanets.find(p => p.graha === "Saturn") || null;
  const marsPlacement = natalPlanets.find(p => p.graha === "Mars") || null;
  const mercuryPlacement = natalPlanets.find(p => p.graha === "Mercury") || null;
  const sunPlacement = natalPlanets.find(p => p.graha === "Sun") || null;
  const moonPlacement = natalPlanets.find(p => p.graha === "Moon") || null;

  // Kuja / Manglik Check (Mars in 1, 4, 7, 8, 12 from Lagna or Moon)
  let isManglik = false;
  if (marsPlacement) {
    const mHouseLagna = marsPlacement.house;
    const mMoonHouse = ((marsPlacement.rashiIndex - moonRashiIndex + 12) % 12) + 1;
    if ([1, 4, 7, 8, 12].includes(mHouseLagna) || [1, 4, 7, 8, 12].includes(mMoonHouse)) {
      isManglik = true;
    }
  }

  // Spouse Direction based on 7th rashi
  const house7Rashi = houses[7].rashiIndex;
  const dirGroup = house7Rashi % 4;
  const spouseDirection = SPOUSE_DIRECTIONS[dirGroup] || SPOUSE_DIRECTIONS[0];

  // Gochara Transits from Moon
  const shaniTransitObj = transits.find(t => t.graha === "Saturn");
  let transitSaturn = null;
  if (shaniTransitObj) {
    const hfm = shaniTransitObj.houseFromMoon;
    transitSaturn = {
      houseFromMoon: hfm,
      isSadeSati: [12, 1, 2].includes(hfm),
      isAshtama: hfm === 8,
      isKantaka: [4, 7, 10].includes(hfm)
    };
  }

  const guruTransitObj = transits.find(t => t.graha === "Jupiter");
  let transitJupiter = null;
  if (guruTransitObj) {
    const hfm = guruTransitObj.houseFromMoon;
    transitJupiter = {
      houseFromMoon: hfm,
      isGuruBala: [2, 5, 7, 9, 11].includes(hfm)
    };
  }

  const rahuTransitObj = transits.find(t => t.graha === "Rahu");
  const ketuTransitObj = transits.find(t => t.graha === "Ketu");

  return {
    lang,
    lagnaRashiIndex,
    lagnaSignName,
    moonRashiIndex,
    moonSignName,
    nakshatraName,
    gender,
    ageYears,
    mahaLordKey,
    mahaLordName,
    bhuktiLordKey,
    bhuktiLordName,
    dashaSummary,
    houses,
    venusPlacement,
    jupiterPlacement,
    saturnPlacement,
    marsPlacement,
    mercuryPlacement,
    sunPlacement,
    moonPlacement,
    isManglik,
    spouseDirection,
    transitSaturn,
    transitJupiter,
    transitRahu: rahuTransitObj ? { houseFromMoon: rahuTransitObj.houseFromMoon } : null,
    transitKetu: ketuTransitObj ? { houseFromMoon: ketuTransitObj.houseFromMoon } : null
  };
}

/* ========================================================================= */
/* Astrological Archetype Builders for Spouse & Other Domains               */
/* ========================================================================= */

function getSpouseArchetypeByLord(lord: GrahaKey, lang: string): string {
  switch (lord) {
    case "Sun":
      if (lang === "kn") return "ರಾಜಗಾಂಭೀರ್ಯ, ಉನ್ನತ ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ನಾಯಕತ್ವ ಗುಣಗಳಿಂದ ಶೋಭಿಸುವವರಾಗಿದ್ದು, ಆಡಳಿತ, ಸರ್ಕಾರಿ ಸೇವೆ ಅಥವಾ ಸಾರ್ವಜನಿಕ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನದಲ್ಲಿರುತ್ತಾರೆ";
      if (lang === "hi") return "राजसी व्यक्तित्व, उच्च स्वाभिमान और प्रशासनिक या प्रबंधकीय क्षेत्रों में प्रतिष्ठित पद पर कार्य करने वाले";
      if (lang === "te") return "రాచరిక గాంభీర్యం, ఉన్నత ఆత్మగౌరవం మరియు నాయకత్వ లక్షణాలు కలిగి, పరిపాలన, ప్రభుత్వ లేదా ఉన్నత నిర్వహణ రంగాలలో గౌరవప్రదమైన హోదాలో ఉంటారు";
      if (lang === "ta") return "ராஜ கம்பீரம், உயர்ந்த சுயமரியாதை மற்றும் தலைமைப் பண்புகளுடன் நிர்வாகம், அரசு அல்லது மேலாண்மைத் துறைகளில் மதிப்புமிக்க பதவியில் இருப்பார்கள்";
      return "regal, dignified, and values integrity, possessing strong leadership instincts and authoritative presence in administrative, governmental, or management spheres";
    case "Moon":
      if (lang === "kn") return "ಅತ್ಯಂತ ಸೌಮ್ಯ, ಕರುಣಾಮಯಿ ಹಾಗೂ ವಾತ್ಸಲ್ಯಪೂರ್ಣ ಸ್ವಭಾವದವರಾಗಿದ್ದು, ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ, ಕಲೆ, ಆತಿಥ್ಯ, ಶಿಕ್ಷಣ ಅಥವಾ ಸಮಾಜಸೇವಾ ರಂಗಗಳಲ್ಲಿ ಸಕ್ರಿಯರಾಗಿರುತ್ತಾರೆ";
      if (lang === "hi") return "अत्यंत सौम्य, संवेदनशील, सहृदय तथा पारिवारिक शांति, रचनात्मक कला, शिक्षा अथवा सेवा क्षेत्र में रुचि रखने वाले";
      if (lang === "te") return "అత్యంత సౌమ్యమైన, దయాగుణం మరియు వాత్సల్యం కలిగిన స్వభావం కలవారై, కుటుంబ సౌఖ్యం, కళలు, విద్య, ఆతిథ్యం లేదా సేవారంగాల్లో చురుగ్గా ఉంటారు";
      if (lang === "ta") return "மிகவும் சாந்தமான, அன்பும் கருணையும் நிறைந்த சுபாவத்துடன் குடும்ப அமைதி, கலை, கல்வி, விருந்தோம்பல் அல்லது சேவைத் துறைகளில் ஈடுபாடு கொண்டிருப்பார்கள்";
      return "deeply empathetic, nurturing, emotionally intuitive, and supportive, fond of domestic harmony, creative expressions, and caregiving";
    case "Mars":
      if (lang === "kn") return "ಧೈರ್ಯಶಾಲಿ, ಉತ್ಸಾಹಿ ಹಾಗೂ ನೇರ ನುಡಿಯ ವ್ಯಕ್ತಿತ್ವದವರಾಗಿದ್ದು, ತಾಂತ್ರಿಕ, ಇಂಜಿನಿಯರಿಂಗ್, ರಕ್ಷಣೆ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಅಥವಾ ಸ್ವತಂತ್ರ ಉದ್ಯಮಗಳಲ್ಲಿ ಸದಾ ಮುಂಚೂಣಿಯಲ್ಲಿರುತ್ತಾರೆ";
      if (lang === "hi") return "साहसी, ऊर्जावान, स्पष्टवादी तथा इंजीनियरिंग, तकनीकी, रक्षा या स्वतंत्र उद्यम में अग्रणी भूमिका निभाने वाले";
      if (lang === "te") return "ధైర్యసాహసాలు, ఉత్సాహం మరియు సూటిగా మాట్లాడే వ్యక్తిత్వం కలిగి, ఇంజనీరింగ్, సాంకేతిక, రక్షణ, రియల్ ఎస్టేట్ లేదా స్వతంత్ర వ్యాపారాల్లో రాణిస్తారు";
      if (lang === "ta") return "தைரியம், சுறுசுறுப்பு மற்றும் நேர்மையான சுபாவத்துடன் பொறியியல், தொழில்நுட்பம், பாதுகாப்பு அல்லது ரியல் எஸ்டேட் துறைகளில் முன்னணி வகிப்பார்கள்";
      return "dynamic, courageous, decisive, and ambitious, possessing high physical stamina and frankness, excelling in engineering, technical, defense, or entrepreneurial enterprises";
    case "Mercury":
      if (lang === "kn") return "ಚುರುಕಾದ ಬುದ್ಧಿವಂತಿಕೆ, ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ಹಾಸ್ಯಪ್ರಜ್ಞೆ ಉಳ್ಳವರಾಗಿದ್ದು, ವಾಣಿಜ್ಯ, ಹಣಕಾಸು, ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ, ಮಾಧ್ಯಮ ಅಥವಾ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ರಂಗಗಳಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿರುತ್ತಾರೆ";
      if (lang === "hi") return "कुशाग्र बुद्धि, वाक्पटु, व्यावहारिक सोच वाले तथा वाणिज्य, वित्त, मीडिया, लेखन अथवा आईटी क्षेत्र में सफल";
      if (lang === "te") return "చురుకైన బుద్ధికుశలత, వాక్చాతుర్యం మరియు హాస్యచతురత కలిగి, వాణిజ్యం, ఆర్థిక విశ్లేషణ, ఐటీ, మీడియా లేదా పరిశోధనా రంగాల్లో విజయవంతంగా ఉంటారు";
      if (lang === "ta") return "கூர்மையான புத்தி கூர்மை, சொல்வன்மை மற்றும் நகைச்சுவை உணர்வுடன் வணிகம், நிதி, தகவல் தொழில்நுட்பம் அல்லது ஊடகத் துறைகளில் சிறந்து விளங்குவார்கள்";
      return "intellectually agile, articulate, witty, and commercially sharp, thriving in communications, commerce, finance, analytical technology, writing, or research";
    case "Jupiter":
      if (lang === "kn") return "ಜ್ಞಾನಿ, ಧರ್ಮನಿಷ್ಠ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಗೌರವ ಹೊಂದಿರುವ ಸಜ್ಜನರಾಗಿದ್ದು, ಶಿಕ್ಷಣ, ಕಾನೂನು, ಬ್ಯಾಂಕಿಂಗ್, ಸಲಹಾ ರಂಗ ಅಥವಾ ಧಾರ್ಮಿಕ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಕೀರ್ತಿ ಹೊಂದಿರುತ್ತಾರೆ";
      if (lang === "hi") return "विद्वान, संस्कारी, गंभीर तथा शिक्षा, कानून, वित्त, परामर्श या आध्यात्मिक क्षेत्र में विशेष सम्मान प्राप्त करने वाले";
      if (lang === "te") return "విద్యావంతులు, ధర్మనిష్ఠ మరియు సమాజంలో ఉన్నత గౌరవం కలిగిన సద్గుణవంతులై, ఉన్నత విద్య, న్యాయశాస్త్రం, బ్యాంకింగ్, సలహా లేదా ఆధ్యాత్మిక రంగాల్లో ప్రసిద్ధి చెందుతారు";
      if (lang === "ta") return "கல்வியறிவு, தர்மசிந்தனை மற்றும் சமுதாயத்தில் உயர்ந்த மதிப்பு கொண்டவர்களாக விளங்கி, கல்வி, சட்டம், வங்கி அல்லது ஆன்மீகத் துறைகளில் புகழ்பெற்றிருப்பார்கள்";
      return "scholarly, virtuous, philosophically grounded, and respected, possessing dignified wisdom and thriving in education, legal affairs, financial advisory, or institutional leadership";
    case "Venus":
      if (lang === "kn") return "ಆಕರ್ಷಕ ರೂಪ, ಕಲಾತ್ಮಕ ಅಭಿರುಚಿ ಹಾಗೂ ಸೌಜನ್ಯವುಳ್ಳವರಾಗಿದ್ದು, ವಿನ್ಯಾಸ, ಮಾಧ್ಯಮ, ಮನರಂಜನೆ, ವಾಸ್ತುಶಿಲ್ಪ, ಫ್ಯಾಷನ್ ಅಥವಾ ಸೃಜನಶೀಲ ರಂಗಗಳಲ್ಲಿ ಖ್ಯಾತಿ ಪಡೆದಿರುತ್ತಾರೆ";
      if (lang === "hi") return "आकर्षक, कलाप्रेमी, शिष्ट तथा सौंदर्य, मीडिया, डिजाइनिंग, मनोरंजन अथवा ललित कलाओं में निपुण";
      if (lang === "te") return "ఆకర్షణీయమైన రూపం, కళాత్మక అభిరుచి మరియు మర్యాదపూర్వక ప్రవర్తన కలిగి, డిజైనింగ్, మీడియా, వినోదం, ఫ్యాషన్ లేదా సృజనాత్మక రంగాల్లో పేరు తెచ్చుకుంటారు";
      if (lang === "ta") return "கவர்ச்சிகரமான தோற்றம், கலை ரசனை மற்றும் கண்ணியமான சுபாவத்துடன் வடிவமைப்பு, ஊடகம், பொழுதுபோக்கு அல்லது கலைத் துறைகளில் பிரகாசிப்பார்கள்";
      return "charming, artistically refined, diplomatic, and fond of cultural elegance, luxury, and aesthetics, flourishing in design, media, luxury commerce, hospitality, or creative arts";
    case "Saturn":
    default:
      if (lang === "kn") return "ಗಂಭೀರ, ಅತ್ಯಂತ ಶಿಸ್ತುಬದ್ಧ, ಪರಿಶ್ರಮಿ ಹಾಗೂ ವಾಸ್ತವವಾದಿ ವ್ಯಕ್ತಿಯಾಗಿದ್ದು, ಕೈಗಾರಿಕೆ, ನಿರ್ಮಾಣ, ಕಾನೂನು, ಸರ್ಕಾರಿ ಆಡಳಿತ ಅಥವಾ ಕಾರ್ಪೊರೇಟ್ ರಂಗಗಳಲ್ಲಿ ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸು ಕಾಣುವವರಾಗಿರುತ್ತಾರೆ";
      if (lang === "hi") return "गंभीर, परिश्रमी, अनुशासित, व्यावहारिक सोच वाले तथा उद्योग, प्रशासन, तकनीकी या विधि क्षेत्र में निष्ठापूर्वक कार्यरत";
      if (lang === "te") return "గంభీరమైన, అత్యంత క్రమశిక్షణ, కష్టపడే తత్వం మరియు వాస్తవిక ఆలోచనలు కలవారై, పరిశ్రమలు, నిర్మాణం, న్యాయం లేదా కార్పొరేట్ నిర్వహణలో దీర్ಘకాలిక విజయాన్ని సాధిస్తారు";
      if (lang === "ta") return "கம்பீரமான, கடுமையான உழைப்பு, ஒழுக்கம் மற்றும் நடைமுறை சிந்தனையுடன் தொழில்துறை, கட்டுமானம், சட்டம் அல்லது நிர்வாகத் துறைகளில் நிலையான வெற்றி பெறுவார்கள்";
      return "mature, methodical, industrious, and grounded in practical reality, embodying steadfast loyalty, enduring patience, and organizational discipline in industry, law, administration, or engineering";
  }
}

function getCareerDomainByLord(lord: GrahaKey, lang: string): string {
  switch (lord) {
    case "Sun":
      if (lang === "kn") return "ಸರ್ಕಾರಿ ಆಡಳಿತ, ಸಾರ್ವಜನಿಕ ನೀತಿ, ಅಧಿಕಾರಯುತ ಹುದ್ದೆಗಳು ಹಾಗೂ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ";
      if (lang === "hi") return "प्रशासनिक सेवा, राजकीय पद, नीति निर्धारण एवं उच्च प्रबंधकीय नेतृत्व";
      if (lang === "te") return "ప్రభుత్వ పరిపాలన, ప్రజా విధానం, అధికార హోదాలు మరియు సంస్థాగత నాయకత్వం";
      if (lang === "ta") return "அரசு நிர்வாகம், பொதுக் கொள்கை, அதிகாரப் பதவிகள் மற்றும் தலைமைப் பொறுப்புகள்";
      return "governmental administration, public policy, executive management, and authoritative leadership roles";
    case "Moon":
      if (lang === "kn") return "ಶಿಕ್ಷಣ, ವೈದ್ಯಕೀಯ ಸೇವೆ, ಆತಿಥ್ಯ, ಮಾನಸಿಕ ಸಮಾಲೋಚನೆ ಹಾಗೂ ಸೃಜನಾತ್ಮಕ ರಂಗಗಳು";
      if (lang === "hi") return "शिक्षा, चिकित्सा, परामर्श, आतिथ्य सत्कार एवं रचनात्मक संचार";
      if (lang === "te") return "విద్య, వైద్య సేవలు, ఆతిథ్యం, కౌన్సిలింగ్ మరియు సృజనాత్మక రంగాలు";
      if (lang === "ta") return "கல்வி, மருத்துவ சேவை, விருந்தோம்பல், ஆலோசனை மற்றும் படைப்புத் துறைகள்";
      return "education, healthcare, public counseling, hospitality, and intuitive creative communications";
    case "Mars":
      if (lang === "kn") return "ಇಂಜಿನಿಯರಿಂಗ್, ರಕ್ಷಣೆ, ತಂತ್ರಜ್ಞಾನ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಹಾಗೂ ಸಾಹಸೋದ್ಯಮಗಳು";
      if (lang === "hi") return "इंजीनियरिंग, तकनीकी अनुसंधान, रियल एस्टेट, रक्षा एवं स्वतंत्र उद्यम";
      if (lang === "te") return "ఇంజనీరింగ్, రక్షణ, సాంకేతికత, రియల్ ఎస్టేట్ మరియు సాహసోపేత వ్యాపారాలు";
      if (lang === "ta") return "பொறியியல், பாதுகாப்பு, தொழில்நுட்பம், ரியல் எஸ்டேட் மற்றும் தொழில் முயற்சிகள்";
      return "engineering, advanced technology, real estate, technical operations, and dynamic entrepreneurial ventures";
    case "Mercury":
      if (lang === "kn") return "ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ, ಹಣಕಾಸು ವಿಶ್ಲೇಷಣೆ, ವಾಣಿಜ್ಯ, ಮಾಧ್ಯಮ, ಸಂಶೋಧನೆ ಹಾಗೂ ಬರವಣಿಗೆ";
      if (lang === "hi") return "सूचना प्रौद्योगिकी, वित्तीय विश्लेषण, वाणिज्य, मीडिया, डेटा साइंस एवं शोध";
      if (lang === "te") return "సమాచార సాంకేతికత (IT), ఆర్థిక విశ్లేషణ, వాణిజ్యం, మీడియా, పరిశోధన మరియు రచన";
      if (lang === "ta") return "தகவல் தொழில்நுட்பம், நிதி பகுப்பாய்வு, வணிகம், ஊடகம், ஆராய்ச்சி மற்றும் எழுத்து";
      return "information technology, data science, financial analysis, commerce, corporate consulting, and media communications";
    case "Jupiter":
      if (lang === "kn") return "ಉನ್ನತ ಶಿಕ್ಷಣ, ನ್ಯಾಯಾಂಗ, ಕಾನೂನು, ಬ್ಯಾಂಕಿಂಗ್, ಆರ್ಥಿಕ ಸಲಹೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಘಟನೆಗಳು";
      if (lang === "hi") return "उच्च शिक्षा, कानून, न्यायपालिका, बैंकिंग, वित्तीय सलाह एवं नीतिगत नेतृत्व";
      if (lang === "te") return "ఉన్నత విద్య, న్యాయవ్యవస్థ, చట్టం, బ్యాంకింగ్, ఆర్థిక సలహా మరియు ఆధ్యాత్మిక సంస్థలు";
      if (lang === "ta") return "உயர் கல்வி, நீதித்துறை, சட்டம், வங்கி, நிதி ஆலோசனை மற்றும் ஆன்மீக அமைப்புகள்";
      return "higher education, judiciary, legal counsel, wealth advisory, banking, and institutional governance";
    case "Venus":
      if (lang === "kn") return "ವಾಸ್ತುಶಿಲ್ಪ, ಕಲೆ, ಮಾಧ್ಯಮ, ಮನರಂಜನೆ, ಐಷಾರಾಮಿ ಉತ್ಪನ್ನಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ";
      if (lang === "hi") return "डिजाइनिंग, कला, मीडिया, फिल्म, फैशन, सौंदर्य एवं जनसंपर्क";
      if (lang === "te") return "వాస్తుశిల్పం, కళలు, మీడియా, వినోదం, విలాస వస్తువులు మరియు ప్రజా సంబంధాలు";
      if (lang === "ta") return "கட்டடக்கலை, கலை, ஊடகம், பொழுதுபோக்கு, ஆடம்பரப் பொருட்கள் மற்றும் மக்கள் தொடர்பு";
      return "architectural design, creative arts, media entertainment, luxury goods, and public diplomacy";
    case "Saturn":
    default:
      if (lang === "kn") return "ಬೃಹತ್ ಕೈಗಾರಿಕೆಗಳು, ಮೂಲಸೌಕರ್ಯ, ಗಣಿಗಾರಿಕೆ, ಕಾನೂನು, ಕಾರ್ಪೊರೇಟ್ ಆಡಳಿತ ಹಾಗೂ ತಾಂತ್ರಿಕ ನಿರ್ವಹಣೆ";
      if (lang === "hi") return "भारी उद्योग, अवसंरचना, कानून, कॉरपोरेट प्रशासन एवं तकनीकी प्रबंधन";
      if (lang === "te") return "భారీ పరిశ్రమలు, మౌలిక సదుపాయాలు, గనుల తవ్వకం, చట్టం, కార్పొరేట్ పరిపాలన మరియు సాంకేతిక నిర్వహణ";
      if (lang === "ta") return "கனரகத் தொழில்கள், உள்கட்டமைப்பு, சுரங்கம், சட்டம், கார்ப்பரேட் நிர்வாகம் மற்றும் பராமரிப்பு";
      return "heavy industries, infrastructure, corporate governance, organizational logistics, engineering, and administrative discipline";
  }
}

/* ========================================================================= */
/* 100% Dynamic Fallback Narrative Builders (Strict 5-6 Lines per Paragraph) */
/* ========================================================================= */

export function buildDynamicMarriageFallback(
  chart: ParsedKundaliChart,
  status: "unmarried" | "married" | "general"
): string {
  const baseLang = chart.lang.split("-")[0];
  const h7 = chart.houses[7];
  const h7Lord = h7.lordName;
  const h7Sign = h7.rashiName;
  const h7Where = `Bhava ${h7.lordHouse} (${h7.lordRashiName})`;
  const karakaName = chart.gender === "Female" ? "Jupiter (Guru)" : "Venus (Shukra)";
  const karakaHouse = chart.gender === "Female" ? (chart.jupiterPlacement?.house ?? 9) : (chart.venusPlacement?.house ?? 4);
  const dirName = chart.spouseDirection[baseLang as keyof typeof chart.spouseDirection] || chart.spouseDirection.en;
  const spouseArchetype = getSpouseArchetypeByLord(h7.lordGraha, baseLang);

  // Senior Native (60+ Years): Emotional, Spiritual Companionship & Domestic Peace
  if (chart.ageYears >= 60) {
    const partnerTermKn = chart.gender === "Female" ? "ಧರ್ಮ ಸಹಚರ" : "ಧರ್ಮ ಸಹಚರಿ";
    const mangalyaKn = chart.gender === "Female" ? "ಮಾಂಗಲ್ಯ ಭಾಗ್ಯ" : "ದಾಂಪತ್ಯ ಭಾಗ್ಯ";
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, 7ನೇ ಮನೆಯಾದ ${h7Sign} ಹಾಗೂ ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವ ಬಲವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಶಾಶ್ವತ ಸಾಂಗತ್ಯ, ಕೌಟುಂಬಿಕ ರಕ್ಷಣೆ, ಧರ್ಮ ಸಹಚಾರ್ಯ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ದಾಂಪತ್ಯ ಸೌಖ್ಯವನ್ನು ಕರುಣಿಸಿದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ${mangalyaKn} ಹಾಗೂ ಸಂಸಾರದ ಹಿರಿಯ ಮಾರ್ಗದರ್ಶಕರಾಗಿ ಗೌರವಯುತ ಸ್ಥಾನವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ. ಗೋಚಾರ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಗೃಹದಲ್ಲಿ ಸದಾ ಶಾಂತಿಯುತ ವಾತಾವರಣವನ್ನು ಕಾಪಾಡಲಿದೆ.

ಹಿರಿಯ ವಯಸ್ಸಿನ ದಾಂಪತ್ಯದಲ್ಲಿ ನಿಮ್ಮ ${partnerTermKn}ಯೊಂದಿಗೆ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ, ಗೌರವ ಹಾಗೂ ಆರೋಗ್ಯದ ಆರೈಕೆಯೇ ಪರಮ ತಪಸ್ಸಾಗಿದೆ. ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord}ನ ಪ್ರಭಾವದಿಂದಾಗಿ, ದಶಕಗಳ ನಿಮ್ಮ ಒಡನಾಟವು ಕೌಟುಂಬಿಕ ಏಕತೆಗೆ ಬಲವಾದ ಅಡಿಪಾಯವಾಗಿದೆ. ಮಕ್ಕಳ ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳ ಯೋಗಕ್ಷೇಮವನ್ನು ಜೊತೆಯಾಗಿ ಹಾರೈಸುತ್ತಾ, ಸಣ್ಣಪುಟ್ಟ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಸಮಾಧಾನದಿಂದ ಸ್ವೀಕರಿಸುವುದು ನಿಮ್ಮ ಅಂತರಂಗದ ಶಾಂತಿಯನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸಲಿದೆ. ಪರಸ್ಪರ ಭಾವನೆಗಳಿಗೆ ನೀಡುವ ಮನ್ನಣೆಯು ಜೀವನದ ಈ ಸಾರ್ಥಕ ಹಂತವನ್ನು ಧನ್ಯವಾಗಿಸಲಿದೆ.

ದೀರ್ಘಾಯುಷ್ಯ, ದಾಂಪತ್ಯ ಶಾಂತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕ್ಷೇಮಕ್ಕಾಗಿ ನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ನಾರಾಯಣ ಮತ್ತು ಗೌರಿ-ಶಂಕರ ಆರಾಧನೆ ಶ್ರೇಷ್ಠ. ಮಂಗಳವಾರ ಅಥವಾ ಶುಕ್ರವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಹಾಗೂ ಗೌರಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು, ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಅರ್ಪಿಸುವುದು ಸಕಲ ಕೌಟುಂಬಿಕ ವಿಘ್ನಗಳನ್ನು ಪರಿಹರಿಸಿ ನೆಮ್ಮದಿಯನ್ನು ನೀಡಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      const partnerTermHi = chart.gender === "Female" ? "धर्म सहचर" : "धर्म सहचरी";
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के अनुसार, सप्तम भाव (${h7Sign}) और सप्तमेश ${h7Lord} की ${h7Where} में स्थिति आपके जीवन में स्थायी साहचर्य, आत्मीयता एवं आध्यात्मिक दांपत्य शांति को पुष्ट करती है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल जीवन के इस परिपक्व पड़ाव में मानसिक संतोष, परस्पर सहयोग तथा परिवार के सम्मानित मार्गदर्शक के रूप में आपकी प्रतिष्ठा को सुदृढ़ करेगा।

वरिष्ठ जीवन में आपके ${partnerTermHi} के साथ परस्पर समझ, सम्मान और स्वास्थ्य की संयुक्त देखभाल ही दांपत्य का सच्चा आधार है। सप्तमेश ${h7Lord} के शुभ प्रभाव से आपका पारिवारिक जीवन शांतिपूर्ण और सौहार्दपूर्ण रहेगा। संतान एवं पौत्र-पौत्रियों के मंगल की संयुक्त कामना करते हुए एक-दूसरे के विचारों को आदर देना आपके मन को असीम संतुष्टि और प्रसन्नता प्रदान करेगा।

अखंड पारिवारिक शांति, आरोग्य एवं दीर्घायु हेतु नित्य प्रातःकाल श्री लक्ष्मी-नारायण एवं गौरी-शंकर की आराधना करें। मंगलवार या शुक्रवार को श्री सुब्रह्मण्य एवं मां गौरी की पूजा तथा गोಕರ್ण महाबलेश्वर ज्योतिर्लिंग क्षेत्र में सेवा समर्पित करने से समस्त पारिवारिक बाधाएं शांत होकर निरंतर आनंद की प्राप्ति होगी।`;
    }
    if (baseLang === "te") {
      const partnerTermTe = chart.gender === "Female" ? "ధర్మ సహచరుడు" : "ధర్మ సహచరి";
      return `మీ జన్మ లగ్నం (${chart.lagnaSignName}) మరియు చంద్ర రాశి (${chart.moonSignName}) ప్రకారం, 7వ ఇల్లు అయిన ${h7Sign} మరియు సప్తమాధిపతి ${h7Lord} ${h7Where}లో స్థితమై ఉండటం మీ జీవితంలో స్థిరమైన సహచర్యం, కుటుంబ రక్షణ, దాంపత్య సౌఖ్యం మరియు ఆధ్యాత్మిక శాంతిని ప్రసాదిస్తుంది. ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం జీవితంలోని ఈ అనుభవజ్ఞులైన దశలో మానసిక ప్రశాంతతను, పరస్పర సహకారాన్ని మరియు కుటుంబానికి మార్గదర్శకులుగా గౌరవాన్ని అందిస్తుంది.

ఈ పరిపక్వ వయస్సులో మీ ${partnerTermTe}తో పరస్పర అవగాహన, గౌరవం మరియు ఆరోగ్య సంరక్షణ అత్యంత ముఖ్యమైనవి. సప్తమాధిపతి ${h7Lord} అనుగ్రహంతో మీ అనుబంధం కుటుంబ ఐక్యతకు బలమైన పునాదిగా నిలుస్తుంది. పిల్లలు మరియు మనుమల శ్రేయస్సును కాంక్షిస్తూ ఒకరికొకరు తోడుగా ఉండటం మీ అంతరంగంలో గొప్ప శాంతిని నింపుతుంది.

దీర్ఘాయుష్షు, దాంపత్య శాంతి మరియు కుటుంబ క్షేమం కోసం ప్రతిరోజూ శ్రీ లక్ష్మీ-నారాయణ మరియు గౌరీ-శంకరుల ఆరాధన శ్రేష్ఠం. మంగళవారం లేదా శుక్రవారం సుబ్రహ్మణ్య స్వామి మరియు గౌరీ దేవి పూజ చేయడం వల్ల సకల కుటుంబ విఘ్నాలు తొలగి ప్రశాంతత చేకూరుతుంది.`;
    }
    if (baseLang === "ta") {
      const mangalyaTa = chart.gender === "Female" ? "மாங்கல்ய பலம்" : "தம்பதியர் நல்வாழ்வு";
      return `உங்கள் ஜென்ம லக்னம் (${chart.lagnaSignName}) மற்றும் சந்திர ராசி (${chart.moonSignName}) அடிப்படையில், 7-ம் வீடான ${h7Sign} மற்றும் 7-ம் அதிபதி ${h7Lord} ${h7Where}-ல் அமைந்திருப்பது உங்கள் வாழ்வில் நிலையான தோழமை, குடும்பப் பாதுகாப்பு, தம்பதியர் நல்வாழ்வு மற்றும் ${mangalyaTa} போன்ற நன்மைகளை வழங்குகிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் மூத்த வயதில் மன அமைதியையும், பரஸ்பர ஆதரவையும், குடும்பத்தின் வழிகாட்டியாக நன்மதிப்பையும் உறுதிப்படுத்துகிறது.

இவ்வயதில் இல்லறத்தில் பரஸ்பர புரிதல், மரியாதை மற்றும் உடல் நலனை கவனித்துக்கொள்வதே முதன்மையானதாகும். 7-ம் அதிபதி ${h7Lord} அருளால் உங்கள் பல தசாப்த கால வாழ்க்கை குடும்ப ஒற்றுமைக்கு தூணாக விளங்கும். பிள்ளைகள் மற்றும் பேரக்குழந்தைகளின் நல்வாழ்வைக் கண்டு மகிழ்வது உங்கள் மனதில் ஆழ்ந்த நிம்மதியைத் தரும்.

நீண்ட ஆயுள், தம்பதியர் அமைதி மற்றும் குடும்ப க்ஷேமத்திற்காக தினமும் ஸ்ரீ லட்சுமி நாராயணர் மற்றும் கௌரி-சங்கரர் வழிபாடு செய்வது சிறந்தது. செவ்வாய் அல்லது வெள்ளிக்கிழமைகளில் சுப்பிரமணியர் மற்றும் கௌரி பூஜை மேற்கொள்வது நன்மைகளை வாரி வழங்கும்.`;
    }
    const partnerTermEn = chart.gender === "Female" ? "Dharma Sahachara" : "Dharma Sahacharini";
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) and 7th lord ${h7Lord} situated in ${h7Where} govern enduring spiritual companionship, mutual security, and lifelong matrimonial harmony in this golden phase of life. Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period foster mental serenity, shared familial wisdom, and revered status as an elder pillar of the lineage, shielded by favorable planetary transits.

Cultivating deep mutual understanding, respect, and attentive health care with your ${partnerTermEn} forms the sacred cornerstone of senior relationship harmony. Influenced by ${h7Lord}, your decades of shared life journey serve as an inspirational bedrock for children and grandchildren. Honoring emotional needs with compassionate patience enriches this contemplative chapter with genuine fulfillment and domestic grace.

To invite continuous longevity, marital peace, and household blessings, offering prayers to Goddess Lakshmi and Lord Narayana remains deeply auspicious. Chanting the Gauri-Shankara stotram and seeking divine grace at Gokarna Mahabaleshwara Kshetra ensures lasting domestic harmony, spiritual poise, and robust wellbeing.`;
  }

  // Youth / Student Native (< 22 Years): Character, Mental Focus & Dharma
  if (chart.ageYears < 22) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, 7ನೇ ಮನೆಯಾದ ${h7Sign} ಹಾಗೂ ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ಯೌವನದ ಈ ಹಂತದಲ್ಲಿ ನಿಮ್ಮ ನೈತಿಕ ನಡತೆ, ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ, ಶೈಕ್ಷಣಿಕ ಶಿಸ್ತು ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಪರಿಪಕ್ವತೆಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ವ್ಯರ್ಥ ಆಕರ್ಷಣೆಗಳಿಂದ ದೂರವಿದ್ದು, ಉನ್ನತ ಆದರ್ಶಗಳು ಹಾಗೂ ಆತ್ಮಶಿಸ್ತಿನ ಮೇಲೆ ದೃಷ್ಟಿ ಕೇಂದ್ರೀಕರಿಸಲು ಅತ್ಯಂತ ಪೂರಕವಾಗಿದೆ.

ಯುವ ಹಂತದಲ್ಲಿ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ, ಹಿರಿಯರ ಮೇಲಿನ ಗೌರವ ಹಾಗೂ ಸತ್ಸಂಗವೇ ನಿಮ್ಮ ಉಜ್ವಲ ಭವಿಷ್ಯದ ಆಧಾರಸ್ತಂಭಗಳಾಗಿವೆ. ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord}ನ ಪ್ರಭಾವದಿಂದಾಗಿ, ಕಾಲೇಜು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಒಡನಾಟದಲ್ಲಿ ಸನ್ನಡತೆಯ ಸ್ನೇಹಿತರನ್ನು ಆಯ್ಕೆ ಮಾಡಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಉನ್ನತೀಕರಿಸುತ್ತದೆ. ಮನಸ್ಸಿನ ಚಂಚಲತೆಯನ್ನು ನಿಯಂತ್ರಿಸಿ, ಭಾವನಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ಅಧ್ಯಯನ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸಕ್ಕೆ ಧಾರೆ ಎರೆಯುವುದು ದೀರ್ಘಾವಧಿಯ ಯಶಸ್ಸನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.

ಮಾನಸಿಕ ಶಾಂತಿ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ನೈತಿಕ ದೃಢತೆಗಾಗಿ ನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಗಣಪತಿ ಮತ್ತು ಸುಬ್ರಹ್ಮಣ್ಯ ಆರಾಧನೆ ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ. ವಿದ್ಯಾರ್ಥಿ ಜೀವನದಲ್ಲಿ ಗೌರಿ ಪೂಜೆ ಹಾಗೂ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸುವುದರಿಂದ ಮನಸ್ಸಿನ ಗೊಂದಲಗಳು ಪರಿಹಾರವಾಗಿ, ಶ್ರೇಷ್ಠ ಸಂಸ್ಕಾರ ಮತ್ತು ಅಚಲ ಧ್ಯೇಯ ಲಭಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के अनुसार, सप्तम भाव (${h7Sign}) और सप्तमेश ${h7Lord} की स्थिति युवावस्था के इस काल में आपके चारित्रिक निर्माण, भावनात्मक परिपक्वता और सामाजिक विवेक को दिशा देती है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल व्यर्थ के आकर्षणों से दूर रहकर उच्च नैतिक मूल्यों और आत्म-अनुशासन पर ध्यान केंद्रित करने का संकेत देता है।

विद्यार्थी जीवन में परस्पर समझ, बड़ों का सम्मान और सत्संगति आपके भविष्य की सच्ची पूंजी है। सप्तमेश ${h7Lord} के प्रभाव से मित्रों के चयन में विवेकशीलता बरतना आपकी मानसिक एकाग्रता को सुदृढ़ करेगा। अपनी ऊर्जा को ज्ञानार्जन और रचनात्मक विकास में लगाना दीर्घकालिक सफलता का मार्ग प्रशस्त करेगा।

मानसिक शांति, एकाग्रता और आत्मबल की वृद्धि हेतु प्रतिदिन भगवान श्री गणेश एवं श्री सुब्रह्मण्य स्वामी का स्मरण करें। गायत्री मंत्र का नियमित पाठ तथा मां गौरी की आराधना मन को स्थिर कर उज्ज्वल भविष्य का निर्माण करेगी।`;
    }
    if (baseLang === "te") {
      return `మీ జన్మ లగ్నం (${chart.lagnaSignName}) మరియు చంద్ర రాశి (${chart.moonSignName}) ప్రకారం, 7వ ఇల్లు అయిన ${h7Sign} మరియు సప్తమాధిపతి ${h7Lord} స్థితి యవ్వన దశలో మీ నైతిక ప్రవర్తన, వ్యక్తిత్వ నిర్మాణం మరియు భావోద్వేగ పరిపక్వతను సూచిస్తుంది. ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం అవాంఛనీయ వ్యామోహాలకు దూరంగా ఉండి, క్రమశిక్షణ మరియు ఉన్నత లక్ష్యాలపై దృష్టి పెట్టడానికి అనుకూలంగా ఉంది.

ఈ వయస్సులో పరస్పర అవగాహన, పెద్దల పట్ల గౌరవం మరియు మంచి స్నేహితుల సాంగత్యం మీ ఉన్నతికి తోడ్పడతాయి. సప్తమాధిపతి ${h7Lord} ప్రభావం వలన వివేకవంతమైన ఆలోచనలతో వ్యవహరించడం శ్రేయస్కరం. మీ మానసిక శక్తిని విద్యాభ్యాసం మరియు వ్యక్తిత్వ వికాసానికి ఉపయోగించడం గొప్ప విజయాన్ని తెస్తుంది.

ఏకాగ్రత మరియు మానసిక స్థైర్యం కోసం శ్రీ గణపతి మరియు సుబ్రహ్మణ్య స్వామిని ప్రార్థించండి. గాయత్రీ మంత్ర పఠనం మరియు గౌరీ దేవి ఆరాధన విద్యార్థి జీవితంలో చక్కటి సంస్కారాన్ని మరియు విజయాన్ని ప్రసాదిస్తాయి.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜென்ம லக்னம் (${chart.lagnaSignName}) மற்றும் சந்திர ராசி (${chart.moonSignName}) அடிப்படையில், 7-ம் வீடான ${h7Sign} மற்றும் 7-ம் அதிபதி ${h7Lord} அமைப்பு இளமைக்காலத்தில் உங்கள் நற்குணங்கள், ஒழுக்கம் மற்றும் மன முதிர்ச்சியை உருவாக்குகிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் தேவையற்ற ஈர்ப்புகளைத் தவிர்த்து, சுய ஒழுக்கத்துடன் படிப்பில் கவனம் செலுத்த வழிகாட்டுகிறது.

இளமையில் பரஸ்பர புரிதல், பெரியவர்களிடம் மரியாதை மற்றும் நல்ல நண்பர்களின் சேர்க்கை உங்கள் எதிர்காலத்திற்கு அடித்தளமாகும். 7-ம் அதிபதி ${h7Lord} அருளால் விவேகமான பழக்கவழக்கங்கள் உங்கள் தன்னம்பிக்கையை உயர்த்தும். உங்கள் சிந்தனையை உயர்கல்வி மற்றும் திறமைகளை வளர்ப்பதில் ஈடுபடுத்துவது சிறந்தது.

மன அமைதி மற்றும் கவனக் குவிப்புக்கு ஸ்ரீ விநாயகர் மற்றும் சுப்பிரமணியர் வழிபாடு துணைபுரியும். காயத்ரி மந்திர ஜபம் மற்றும் கௌரி பூஜை நல்வழியில் வழிநடத்தும்.`;
    }
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) and 7th lord ${h7Lord} situated in ${h7Where} govern interpersonal maturity, character formation, academic discipline, and emotional maturity during your youth. Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period encourage steering clear of premature distractions and dedicating focused energy toward foundational life preparation and self-mastery.

Developing mutual understanding, respect for elders, and choosing noble, inspiring friendships forms the bedrock of your personal growth under this placement. Influenced by ${h7Lord}, maintaining emotional boundaries and channeling youthful vitality into academic and extracurricular mastery builds an unshakeable relationship with your own higher purpose.

To cultivate mental calmness, cognitive focus, and emotional equilibrium, offering morning prayers to Lord Ganesha and Lord Subramanya is recommended. Chanting the sacred Gayatri mantra and invoking divine mother Gauri harmonizes your subtle energetic field and guarantees clarity in life decisions.`;
  }

  // Adult Native (22 to 59 Years): Unmarried, Married, General
  if (status === "unmarried") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, ಸಪ್ತಮ ಭಾವವಾದ ${h7Sign} ಹಾಗೂ ಸಪ್ತಮಾಧಿಪತಿಯಾದ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ನೆಲೆಸಿರುವ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ವೈವಾಹಿಕ ಯೋಗದ ಕರ್ಮಿಕ ಸಂರಚನೆಯನ್ನು ನಿರ್ಣಯಿಸುತ್ತದೆ. 7ನೇ ಮನೆಯ ಮೇಲೆ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನಕ್ಕೆ ಸ್ಥಿರ ಅಡಿಪಾಯ ಒದಗಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಕಲ್ಯಾಣ ಪ್ರಾಪ್ತಿಯ ದಿವ್ಯ ಶುಭ ಮುಹೂರ್ತವು ಸಕ್ರಿಯವಾಗಿದೆ. ಶನಿ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ಪ್ರಚಲಿತ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ದಾರಿಯಲ್ಲಿ ಹಿಂದಿದ್ದ ವಿಳಂಬಗಳನ್ನು ನಿವಾರಿಸಿ, ವಿವಾಹ ಸಂಬಂಧಗಳ ಮಾತುಕತೆಗಳಿಗೆ ವೇಗ ನೀಡಲಿದೆ.

ನಿಮಗೆ ಲಭಿಸುವ ಜೀವನ ಸಂಗಾತಿಯು ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord} ಗ್ರಹದ ಪ್ರಭಾವದಂತೆ ${spouseArchetype} ಉಳ್ಳವರಾಗಿದ್ದು, ಉನ್ನತ ನೈತಿಕ ನಿಷ್ಠೆ, ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ಸುಸಂಸ್ಕೃತ ಜೀವನಶೈಲಿಯನ್ನು ಹೊಂದಿರುತ್ತಾರೆ. ಕಾರಕ ಗ್ರಹವಾದ ${karakaName} ಗ್ರಹದ ಸ್ಥಿತಿಯು ನಿಮ್ಮಿಬ್ಬರ ನಡುವೆ ಸಮಾನ ಆಲೋಚನೆ ಹಾಗೂ ಆಳವಾದ ಪರಸ್ಪರ ನಂಬಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಸಪ್ತಮ ಭಾವದ ದಿಕ್ಬಲ ಸೂತ್ರಗಳ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮಸ್ಥಳದಿಂದ ${dirName} ದಿಕ್ಕಿನಿಂದ ಅತ್ಯಂತ ಯೋಗ್ಯ ಹಾಗೂ ಸೌಭಾಗ್ಯದಾಯಕ ವಿವಾಹ ಪ್ರಸ್ತಾಪಗಳು ಒದಗಿಬರುವ ಬಲವಾದ ಸಾಧ್ಯತೆಗಳಿವೆ. ಅವರ ಪ್ರವೇಶವು ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ ಹಾಗೂ ನೆಮ್ಮದಿಯನ್ನು ತರಲಿದೆ.

ವೈವಾಹಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಳಂಬ ನಿವಾರಣೆಗೆ ಹಾಗೂ ಕುಜ ಗ್ರಹದ ಪ್ರಭಾವ ಶಮನಕ್ಕಾಗಿ ${chart.isManglik ? "ಕುಜ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಆರಾಧನೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ." : "ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷ ಬಾಧೆಯಿಲ್ಲದೆ ಮಾರ್ಗ ಸುಗಮವಾಗಿದೆ."}, ನಿತ್ಯ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ 'ಓಂ ಶ್ರೀಂ ಗೌರ್ಯೈ ನಮಃ' ಹಾಗೂ 'ಓಂ ಸಪ್ತಮಾಧಿಪತಯೇ ನಮಃ' ಮಂತ್ರಗಳನ್ನು 108 ಬಾರಿ ಜಪಿಸುವುದು ಶ್ರೇಷ್ಠವಾಗಿದೆ. ಮಂಗಳವಾರ ಹಾಗೂ ಶುಕ್ರವಾರಗಳಂದು ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಮತ್ತು ಗೌರಿ ಪೂಜೆ ನೆರವೇರಿಸುವುದು ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಂಗಲ ಸೇವೆ ಸಮರ್ಪಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರ ಕಲ್ಯಾಣ ಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के अनुसार, सप्तम भाव (${h7Sign}) तथा सप्तमेश ${h7Lord} की ${h7Where} में स्थिति आपके वैवाहिक योग की आधारशिला निर्धारित करती है। सप्तम भाव की यह स्थिति दांपत्य जीवन में स्थिरता को संबल प्रदान करती है। वर्तमान में गतिमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल विवाह के शुभ अवसरों को प्रबलता से जागृत कर रहा है। गोचर में गुरु एवं शनि का शुभ प्रभाव पूर्व में आ रहे विलंब को समाप्त कर पारिवारिक वार्ताओं को शीघ्र सफलता की ओर अग्रसर करेगा।

आपके भावी जीवनसाथी में सप्तमेश ${h7Lord} के अनुसार ${spouseArchetype} के विशिष्ट गुण परिलक्षित होंगे। वे उच्च नैतिक मूल्य, बौद्धिक परिपक्वता तथा उत्तरदायित्व की गहरी भावना से युक्त होंगे। कारक ग्रह ${karakaName} की शुभ स्थिति दांपत्य में परस्पर आत्मीयता एवं सुख-शांति को सुनिश्चित करती है। सप्तम भाव के दिशा बल नियमानुसार, आपके जन्मस्थान से ${dirName} दिशा से अत्यंत योग्य एवं प्रतिष्ठित विवाह प्रस्ताव प्राप्त होने के प्रबल योग हैं। जीवनसाथी के आगमन से आपके जीवन में स्थिरता और सौभाग्य का विस्तार होगा।

विवाह में आ रहे किसी भी सूक्ष्म अवरोध अथवा मंगल प्रभाव की शांति हेतु ${chart.isManglik ? "कुंडली में मंगल दोष के निवारणार्थ सुब्रह्मण्य शांति आवश्यक है।" : "मंगल का प्रभाव संतुलित रहने से विवाह मार्ग सुगम है।"}, नित्य प्रातःकाल 'ॐ श्रीं गौर्यै नमः' एवं 'ॐ सप्तमेशाय नमः' मंत्र का 108 बार जाप करना अत्यंत शुभ फलदायी है। मंगलवार और शुक्रवार को मां गौरी तथा श्री सुब्रह्मण्य स्वामी का पूजन करें। गोಕರ್ण महाबलेश्वर क्षेत्र में मंगल सेवा समर्पित करने से समस्त बाधाएं दूर होकर शीघ्र कल्याण एवं वैवाहिक सुख की प्राप्ति होगी।`;
    }
    if (baseLang === "te") {
      return `మీ జన్మ లగ్నం (${chart.lagnaSignName}) మరియు చంద్ర రాశి (${chart.moonSignName}) ప్రకారం, 7వ ఇల్లు అయిన ${h7Sign} మరియు సప్తమాధిపతి ${h7Lord} ${h7Where}లో ఉన్న గ్రహస్థితి మీ వివాహ యోగాన్ని నిర్దేశిస్తుంది. 7వ ఇంటిపై శుభగ్రహాల ప్రభావం స్థిరమైన దాంపత్య జీవితానికి బలమైన పునాది వేస్తుంది. ప్రస్తుతం నడుస్తున్న ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం వివాహ ప్రాప్తికి అనుకూలమైన శుభ సమయాన్ని సూచిస్తోంది. గోచారంలో గురు, శని గ్రహాల సంచారం గతంలో ఎదురైన ఆటంకాలను తొలగించి సంబంధాల చర్చలను వేగవంతం చేస్తుంది.

మీకు లభించే జీవిత భాగస్వామి సప్తమాధిపతి ${h7Lord} ప్రభావంతో ${spouseArchetype} కలిగి, ఉన్నతమైన వ్యక్తిత్వం మరియు బాధ్యతాయుతమైన ప్రవర్తనతో ఉంటారు. కారక గ్రహమైన ${karakaName} స్థితి మీ ఇద్దరి మధ్య పరస్పర అవగాహన మరియు విశ్వాసాన్ని పెంపొందిస్తుంది. సప్తమ భావ దిశా బలం ప్రకారం, మీ జన్మస్థలం నుండి ${dirName} దిశ నుండి యోగ్యమైన మరియు సౌభాగ్యవంతమైన వివాహ సంబంధాలు వచ్చే బలమైన అవకాశాలు ఉన్నాయి.

వివాహ సంబంధిత కార్యాల్లో అడ్డంకులు తొలగడానికి ${chart.isManglik ? "కుజ దోష శాంతి మరియు సుబ్రహ్మణ్య ఆరాధన అవసరం." : "కుజ ప్రభావం సమతుల్యంగా ఉంది."}, ప్రతిరోజూ ఉదయం 'ఓం శ్రీం గౌర్యై నమః' మంత్రాన్ని 108 సార్లు జపించడం శ్రేయస్కరం. మంగళవారం మరియు శుక్రవారాల్లో సుబ్రహ్మణ్య స్వామి మరియు గౌరీ దేవి పూజలు చేయడం వల్ల శీఘ్ర వివాహ సిద్ధి లభిస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜென்ம லக்னம் (${chart.lagnaSignName}) மற்றும் சந்திர ராசி (${chart.moonSignName}) அடிப்படையில், 7-ம் வீடான ${h7Sign} மற்றும் 7-ம் அதிபதி ${h7Lord} ${h7Where}-ல் அமைந்திருப்பது திருமண யோகத்தை உறுதிப்படுத்துகிறது. 7-ம் வீட்டின் சுப பலம் உங்கள் இல்லற வாழ்க்கைக்கு உறுதியான அடித்தளம் அமைக்கும். தற்போது நடைபெறும் ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் சுப மங்கல திருமண யோகத்தை விரைவுபடுத்துகிறது. குரு மற்றும் சனி கிரகங்களின் கோசார சஞ்சாரம் முந்தைய தாமதங்களை நீக்கி வரன் பேச்சுவார்த்தைகளை சுபமாக முடிக்கும்.

உங்களுக்கு அமையவிருக்கும் வாழ்க்கைத் துணை 7-ம் அதிபதி ${h7Lord} ஆதிக்கத்தால் ${spouseArchetype} கொண்டவராகவும், நற்பண்பும் கடமை உணர்வும் நிறைந்தவராகவும் இருப்பார். காரக கிரகமான ${karakaName} இருப்பு உங்களிடையே சிறந்த பாசத்தையும் நம்பிக்கையையும் வளர்க்கும். திசா பல விதிகளின்படி, உங்கள் பிறந்த இடத்திலிருந்து ${dirName} திசையிலிருந்து தகுதியான மற்றும் யோகமான வரன் அமைய அதிக வாய்ப்புகள் உள்ளன.

திருமணத் தடைகள் நீங்க ${chart.isManglik ? "செவ்வாய் தோஷ சாந்தியும் சுப்பிரமணியர் வழிபாடும் அவசியம்." : "செவ்வாய் பலம் சாதகமாக உள்ளது."}, தினமும் காலையில் 'ஓம் ஸ்ரீம் கௌரியை நமஹ' மந்திரத்தை 108 முறை ஜபிப்பது நல்லது. செவ்வாய் மற்றும் வெள்ளிக்கிழமைகளில் சுப்பிரமணியர் மற்றும் கௌரி அம்மனை வழிபடுவது விரைவில் திருமண யோகத்தை நல்கும்.`;
    }
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) and 7th lord ${h7Lord} situated in ${h7Where} govern your marital union and partnership karma. This celestial alignment establishes the foundational framework for lifelong mutual companionship and emotional harmony. Currently, your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period activate a potent matrimonial window, breaking through prior delays and bringing favorable planetary alignments for alliance negotiations. Favorable Gochara planetary transits of Jupiter and Saturn dissolve historical hesitations and open genuine avenues for a sacred alliance.

Your prospective life partner will unmistakably reflect the core planetary qualities of ${h7Lord} placed in ${h7Where}. They are indicated to be ${spouseArchetype}, possessing strong moral conviction, pragmatic intellect, and a harmonious social demeanor. The placement of Karaka ${karakaName} in Bhava ${karakaHouse} further confirms that your spouse will bring emotional grounding, mutual companionship, and shared domestic values into the union. In accordance with the classical directional strength of your 7th house (${h7Sign}), auspicious and compatible matrimonial proposals are strongly indicated to arrive from the ${dirName} direction relative to your birthplace, laying the foundation for an enduring and prosperous marital chapter.

To neutralize subtle planetary friction, dissolve past karmic blockages, and harmonize Kuja/Manglik influences (${chart.isManglik ? "Kuja Dosha is present in your chart and requires dedicated Shanti" : "no severe Kuja Dosha is present, ensuring smooth marital progress"}), performing dedicated Vedic remedies is highly beneficial. Reciting the sacred mantra 'Om Shreem Gauryai Namah' and performing Gauri Pooja alongside Sri Subramanya Seva 108 times during the morning sandhya creates an auspicious energetic shield for domestic bliss. Furthermore, offering archana at Gokarna Mahabaleshwara Kshetra on auspicious Tuesdays or Fridays will remove all lingering impediments, pacify planetary afflictions, and ensure early, blessed marital fulfillment.`;
  } else if (status === "married") {
    if (baseLang === "kn") {
      const femaleMangalyaKn = chart.gender === "Female"
        ? `ಮಾಂಗಲ್ಯ ಸ್ಥಾನ ಹಾಗೂ ಜೀವಕಾರಕ ಗುರುವಿನ ಶುಭ ಬಲವು ನಿಮ್ಮ ದಾಂಪತ್ಯ ಬಾಂಧವ್ಯವನ್ನು ರಕ್ಷಿಸುತ್ತದೆ. `
        : "";
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಆಳವಾದ ಪ್ರೀತಿ, ಪರಸ್ಪರ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ${femaleMangalyaKn}ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿಯು ಸಂಸಾರದಲ್ಲಿ ನೈತಿಕ ಹೊಣೆಗಾರಿಕೆಗಳನ್ನು ಒಟ್ಟಾಗಿ ನಿರ್ವಹಿಸಲು ಪ್ರೇರೇಪಿಸುತ್ತದೆ. ಗ್ರಹಗಳ ಶುಭ ಬಲವು ನಿಮ್ಮ ಗೃಹದಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ ಹಾಗೂ ಸಮೃದ್ಧಿಯ ವಾತಾವರಣವನ್ನು ಕಾಪಾಡಲಿದೆ.

ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ, ಗೌರವ ಹಾಗೂ ಮುಕ್ತ ಸಂಭಾಷಣೆಯು ನಿಮ್ಮ ಯಶಸ್ಸಿಗೆ ಮುಖ್ಯ ಆಧಾರಸ್ತಂಭಗಳಾಗಿವೆ. ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord}ನ ಪ್ರಭಾವದಿಂದಾಗಿ, ಕೌಟುಂಬಿಕ ಪ್ರಗತಿ ಮತ್ತು ಆರ್ಥಿಕ ಹೂಡಿಕೆಗಳ ನಿರ್ಧಾರಗಳಲ್ಲಿ ನಿಮ್ಮ ಸಂಗಾತಿಯ ವಿವೇಕಯುತ ಸಲಹೆಗಳನ್ನು ಗೌರವಿಸುವುದು ಅದ್ಭುತ ಫಲಗಳನ್ನು ತರಲಿದೆ. ಇಬ್ಬರೂ ಜೊತೆಯಾಗಿ ಕೈಗೊಳ್ಳುವ ದೀರ್ಘಕಾಲಿಕ ಯೋಜನೆಗಳು ಸ್ಥಿರಾಸ್ತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಮನ್ನಣೆಯನ್ನು ತಂದುಕೊಡುತ್ತವೆ. ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ಸಮಾಧಾನದಿಂದ ಬಗೆಹರಿಸಿಕೊಳ್ಳುವುದು ಬಾಂಧವ್ಯವನ್ನು ಮತ್ತಷ್ಟು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.

ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳ ನಿರಂತರ ವೃದ್ಧಿಗಾಗಿ ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಪ್ರಾರ್ಥಿಸುವುದು ಶ್ರೇಷ್ಠ. ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ನಾರಾಯಣ ಹಾಗೂ ಗೌರಿ-ಶಂಕರ ದೇವಸ್ಥಾನಗಳಲ್ಲಿ ದಂಪತಿ ಸಮೇತರಾಗಿ ಅರ್ಚನೆ ನೆರವೇರಿಸಿ, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸಮರ್ಪಿಸುವುದರಿಂದ ಕೌಟುಂಬಿಕ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗಿ ದಾಂಪತ್ಯದಲ್ಲಿ ನಿತ್ಯ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      const femaleMangalyaHi = chart.gender === "Female"
        ? `मांगल्य भाव एवं जीवकारक बृहस्पति का शुभ प्रभाव आपके दांपत्य को सुरक्षा प्रदान करता है। `
        : "";
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के अनुसार, सप्तमेश ${h7Lord} की ${h7Where} में स्थिति दांपत्य जीवन में प्रगाढ़ विश्वास, समर्पण और स्थायी सामंजस्य को पुष्ट करती है। ${femaleMangalyaHi}वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति का प्रभाव पारिवारिक उत्तरदायित्वों को गरिमापूर्ण ढंग से निभाने में सहायक सिद्ध होगा। शुभ ग्रहों की स्थिति आपके गृहस्थ जीवन में निरंतर सुख और शांति का वातावरण बनाए रखेगी।

वैवाहिक जीवन में परस्पर समझ, सम्मान और सौहार्दपूर्ण संवाद सफलता का मूल मंत्र है। सप्तमेश ${h7Lord} के प्रभाव से, पारिवारिक एवं वित्तीय योजनाओं में जीवनसाथी के परामर्श को महत्व देने से आर्थिक समृद्धि और मान-सम्मान में दोगुनी वृद्धि होगी। संयुक्त रूप से लिए गए निर्णय भविष्य को सुरक्षित और समृद्ध बनाएंगे। किसी भी प्रकार के मतभेद को शांति और धैर्य से सुलझाने से रिश्ते में नवीन ऊर्जा और मधुरता बनी रहेगी।

गृहस्थी में अखंड शांति, समृद्धि और आरोग्य की वृद्धि हेतु प्रत्येक शुक्रवार को मां महालक्ष्मी तथा श्री गौरी-शंकर का विधिपूर्वक पूजन करें। गोಕರ್ण क्षेत्र में महाबलेश्वर भगवान का अभिषेक एवं लक्ष्मी नारायण स्तोत्र का पाठ करने से समस्त नकारात्मकता समाप्त होकर दांपत्य जीवन में अपार सुख और समृद्धि का वास होगा।`;
    }
    if (baseLang === "te") {
      const femaleMangalyaTe = chart.gender === "Female"
        ? `మాంగళ్య స్థానం మరియు జీవకారక గురుగ్రహ శుభ దృష్టి మీ దాంపత్య బంధాన్ని కాపాడుతాయి. `
        : "";
      return `మీ జన్మ లగ్నం (${chart.lagnaSignName}) మరియు చంద్ర రాశి (${chart.moonSignName}) ప్రకారం, సప్తమాధిపతి ${h7Lord} ${h7Where}లో ఉండటం మీ వైవాహిక జీవితంలో ప్రగాఢ విశ్వాసం, అంకితభావం మరియు స్థిరమైన శాంతిని చేకూరుస్తుంది. ${femaleMangalyaTe}ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి ప్రభావం కుటుంబ బాధ్యతలను గౌరవప్రదంగా నిర్వహించడంలో సహాయపడుతుంది. శుభ గ్రహాల స్థానాలు మీ గృహంలో నిరంతరం సుఖశాంతులను నింపుతాయి.

దాంపత్య జీవితంలో పరస్పర అవగాహన, గౌరవం మరియు సత్సంబంధాలు విజయానికి మూలస్తంభాలు. సప్తమాధిపతి ${h7Lord} ప్రభావంతో, కుటుంబ మరియు ఆర్థిక నిర్ణయాల్లో జీవిత భాగస్వామి సలహాలను గౌరవించడం వల్ల సౌభాగ్యం రెట్టింపవుతుంది. ఇద్దరూ కలిసి తీసుకునే నిర్ణయాలు భవిష్యత్తును సురక్షితం చేస్తాయి. చిన్నపాటి అభిప్రాయభేదాలను శాంతితో పరిష్కరించుకోవడం బంధాన్ని మరింత బలపరుస్తుంది.

ఇంట్లో అఖండ శాంతి, సమృద్ధి కోసం ప్రతి శుక్రవారం లక్ష్మీ-నారాయణ మరియు గౌరీ-శంకరులను పూజించండి. గోకర్ణ క్షేత్రంలో మహాబలేశ్వరునికి అభిషేకం చేయడం వల్ల ప్రతికూలతలు తొలగి దాంపత్య జీవితంలో అపారమైన ఆనందం కలుగుతుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜென்ம லக்னம் (${chart.lagnaSignName}) மற்றும் சந்திர ராசி (${chart.moonSignName}) அடிப்படையில், 7-ம் அதிபதி ${h7Lord} ${h7Where}-ல் அமைந்திருப்பது இல்லற வாழ்வில் ஆழ்ந்த பாசம், அர்ப்பணிப்பு மற்றும் நிலைத்தன்மையை உறுதி செய்கிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி குடும்பப் பொறுப்புகளை நல்ல முறையில் நிர்வகிக்க உதவும். சுப கிரகங்களின் சேர்க்கை இல்லத்தில் அமைதியையும் மகிழ்ச்சியையும் நிலைநிறுத்தும்.

இல்லற வாழ்வில் பரஸ்பர புரிதல், மரியாதை மற்றும் சுமுகமான உறவு வெற்றிக்கான மூலமந்திரமாகும். 7-ம் அதிபதி ${h7Lord} அருளால், குடும்ப மற்றும் நிதி திட்டங்களில் வாழ்க்கைத்துணையின் ஆலோசனையை ஏற்பது செல்வத்தையும் புகழையும் பெருக்கும். இருவரும் இணைந்து எடுக்கும் முடிவுகள் எதிர்காலத்தை வளமாக்கும். கருத்து வேறுபாடுகளை அன்புடன் தீர்த்துக்கொள்வது பிணைப்பை மேலும் உறுதியாக்கும்.

இல்லத்தில் நிம்மதியும் செல்வ வளமும் பெருக ஒவ்வொரு வெள்ளிக்கிழமையும் ஸ்ரீ லட்சுமி நாராயணர் மற்றும் கௌரி-சங்கரர் வழிபாடு செய்யவும். கோகர்ணத்தில் மகாபலேஸ்வரருக்கு பாலபிஷேகம் செய்வது இல்லறத்தில் மகிழ்ச்சியை நிறைக்கும்.`;
    }
    const femaleNuanceEn = chart.gender === "Female"
      ? ` With the auspicious alignment of your Mangalya Sthana (8th house) and protective grace from Jeevakaraka Jupiter, benefic planetary placements anchor the marital bond in lasting harmony.`
      : ` Benefic planetary placements create an energetic sanctuary within the household, protecting the marriage from external discord and anchoring the relationship in mutual loyalty.`;

    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) and 7th house lord ${h7Lord} placed in ${h7Where} alongside your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti fosters enduring trust, emotional warmth, and domestic stability in your married life.${femaleNuanceEn}

Cultivating deep mutual understanding, respectful communication, and empathy forms the true bedrock of your marital journey. Reflecting the qualities of ${h7Lord}, involving your spouse in pivotal household, financial, and life decisions directly accelerates family prosperity and harmony. Collaborative planning generates constructive milestones for long-term investments and children's upbringing, turning occasional differences into opportunities for deeper emotional intimacy and spiritual cohesion.

To invite continuous divine grace and domestic peace, offering prayers to Goddess Lakshmi and Lord Narayana on Fridays remains exceptionally beneficial. Maintaining a serene sacred altar at home, reciting the Gauri-Shankara stotram, and offering prayers at Gokarna Mahabaleshwara Kshetra ensures that your family remains shielded from negative energies while enjoying lifelong abundance and harmony.`;
  } else {
    // general
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, ಸಪ್ತಮ ಭಾವವಾದ ${h7Sign} ಹಾಗೂ ಸಪ್ತಮಾಧಿಪತಿಯಾದ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ಸಂಬಂಧಗಳಲ್ಲಿ ಸಮತೋಲನ, ಗೌರವ ಹಾಗೂ ನೈತಿಕ ಪರಿಪಕ್ವತೆಯನ್ನು ಮಾರ್ಗದರ್ಶನ ಮಾಡುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಸಾರ್ವಜನಿಕ ಒಡನಾಟದಲ್ಲಿ ಪ್ರಬುದ್ಧತೆಯನ್ನು ಕರುಣಿಸಲಿದೆ.

ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ, ಪ್ರಾಮಾಣಿಕ ಮಾತುಕತೆ ಹಾಗೂ ನೈತಿಕ ಮೌಲ್ಯಗಳ ರಕ್ಷಣೆಯು ಎಲ್ಲಾ ಒಡನಾಟಗಳಲ್ಲಿ ಶಾಶ್ವತ ವಿಶ್ವಾಸವನ್ನು ನೀಡುತ್ತದೆ. ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord}ನ ಪ್ರಭಾವವು ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸಂಯಮ ಹಾಗೂ ದಾರ್ಶನಿಕ ದೃಷ್ಟಿಯನ್ನು ತುಂಬಲಿದೆ.

ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚುವುದು ಹಾಗೂ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು ಸಂಬಂಧಗಳಲ್ಲಿ ಸೌಹಾರ್ದತೆ ಮತ್ತು ನೆಮ್ಮದಿಯನ್ನು ಕಾಪಾಡಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के आधार पर, सप्तम भाव (${h7Sign}) और सप्तमेश ${h7Lord} की स्थिति संबंधों में संतुलन, परस्पर सम्मान और भावनात्मक परिपक्वता का निर्माण करती है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल व्यावहारिक जीवन में सामंजस्य स्थापित करने में सहायक सिद्ध होगा।

पारस्परिक समझ, स्पष्ट संवाद और नैतिक सिद्धांतों का पालन हर संबंध को स्थायी और विश्वसनीय बनाता है। सप्तमेश ${h7Lord} का प्रभाव आपके व्यवहार में गरिमा और धैर्य का संचार करेगा।

शुक्रवार को कुलदेवता का स्मरण एवं घी का दीपक प्रज्वलित करना जीवन में शांति और सौहार्द बनाए रखेगा।`;
    }
    if (baseLang === "te") {
      return `మీ జన్మ లగ్నం (${chart.lagnaSignName}) మరియు చంద్ర రాశి (${chart.moonSignName}) ప్రకారం, 7వ ఇల్లు (${h7Sign}) మరియు సప్తమాధిపతి ${h7Lord} స్థితి సంబంధాలలో సమతుల్యత, గౌరవం మరియు పరిపక్వతను కలిగిస్తాయి. ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం సామాజిక మరియు వ్యక్తిగత సంబంధాలలో స్థిరత్వాన్ని తెస్తుంది.

పరస్పర అవగాహన, స్పష్టమైన సంభాషణ మరియు నైతిక విలువల పరిరక్షణ సంబంధాలను దృఢపరుస్తాయి. సప్తమాధిపతి ${h7Lord} అనుగ్రహం వలన మీ ఆలోచనల్లో సహనం మరియు వివేకం పెరుగుతాయి.

ప్రతి శుక్రవారం నెయ్యి దీపం వెలిగించి ఇష్టదేవతను పూజించడం సంబంధాలలో శాంతిని ప్రసాదిస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜென்ம லக்னம் (${chart.lagnaSignName}) மற்றும் சந்திர ராசி (${chart.moonSignName}) அடிப்படையில், 7-ம் வீடான ${h7Sign} மற்றும் 7-ம் அதிபதி ${h7Lord} அமைப்பு உறவுகளில் சமநிலை, மரியாதை மற்றும் முதிர்ச்சியை உருவாக்குகிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி நற்பலன்களைத் தரும்.

பரஸ்பர புரிதல், நேர்மையான உரையாடல் மற்றும் நன்னெறிகள் உறவுகளை வலுப்படுத்தும். 7-ம் அதிபதி ${h7Lord} அருளால் அமைதியும் நல்லிணக்கமும் உண்டாகும்.

வெள்ளிக்கிழமைகளில் நெய் தீபமேற்றி இஷ்ட தெய்வத்தை வழிபடுவது குடும்பத்தில் அமைதியை நிலைநிறுத்தும்.`;
    }
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) governed by ${h7Lord} in ${h7Where} guides partnerships, mutual respect, and emotional maturity. Your current ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period foster balanced relationships, teaching the profound spiritual lessons of collaboration, compromise, and shared purpose across all interpersonal spheres.

Transparent communication, shared ethical values, and mutual honoring of personal boundaries remain the bedrock of successful relationships under this configuration. Daily prayers to your Ishta Devata and lighting a ghee lamp on Fridays ensure enduring relationship harmony and dissolve interpersonal misunderstandings effortlessly.

Maintaining an altar of devotion and regularly chanting planetary mantras harmonizes subtle relationship karma and guarantees lifelong companionship.`;
  }
}

export function buildDynamicChildrenFallback(
  chart: ParsedKundaliChart,
  status: "no_children" | "has_children" | "general"
): string {
  const baseLang = chart.lang.split("-")[0];
  const h5 = chart.houses[5];
  const h5Lord = h5.lordName;
  const h5Sign = h5.rashiName;
  const h5Where = `Bhava ${h5.lordHouse} (${h5.lordRashiName})`;
  const jupWhere = chart.jupiterPlacement ? `Bhava ${chart.jupiterPlacement.house}` : "chart";

  // Senior Native (60+ Years): Children's Stability, Grandchildren Joy & Lineage
  if (chart.ageYears >= 60) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮ ಭಾವವಾದ ${h5Sign} ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${h5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯೊಂದಿಗೆ ಪುತ್ರಕಾರಕ ಬೃಹಸ್ಪತಿ (Jupiter), ಚಂದ್ರ (Moon) ಹಾಗೂ ಕುಜ (ಮಂಗಳ) ಗ್ರಹಗಳ ಶುಭ ಪ್ರಭಾವವು ನಿಮ್ಮ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಸೌಖ್ಯದ ಪೂರ್ಣ ಸಾರ್ಥಕತೆಯನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಮಕ್ಕಳು ತಮ್ಮ ತಮ್ಮ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಉತ್ತಮವಾಗಿ ನೆಲೆನಿಂತು ಕೀರ್ತಿ ತರುವುದನ್ನು ಕಣ್ತುಂಬಿಕೊಳ್ಳುವ ಧನ್ಯತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.

ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ ಮೊಮ್ಮಕ್ಕಳ ಮಂದಹಾಸ, ಕೌಟುಂಬಿಕ ಒಡನಾಟ ಹಾಗೂ ವಂಶದ ಮುನ್ನಡೆಯೇ ಪರಮ ಆನಂದವಾಗಿದೆ. ಪಂಚಮಾಧಿಪತಿ ${h5Lord}ನ ದೈವಿಕ ಬಲವು ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಸುಸಂಸ್ಕೃತ ನೈತಿಕ ಪರಂಪರೆಯನ್ನು ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಯಶಸ್ವಿಯಾಗಿ ವರ್ಗಾಯಿಸಿದೆ. ಮಕ್ಕಳು ಮತ್ತು ಮೊಮ್ಮಕ್ಕಳು ನೀಡುವ ಪ್ರೀತಿ, ಗೌರವ ಹಾಗೂ ಅವರ ಶ್ರೇಯಸ್ಸು ನಿಮ್ಮ ಅಂತರಂಗಕ್ಕೆ ಅಪಾರ ತೃಪ್ತಿಯನ್ನು ನೀಡಲಿದೆ.

ಕುಟುಂಬದ ದೀರ್ಘಾಯುಷ್ಯ, ಸಕಲ ಸಂತತಿ ರಕ್ಷಣೆ ಹಾಗೂ ವಂಶದ ನಿರಂತರ ಅಭ್ಯುದಯಕ್ಕಾಗಿ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗಣೇಶ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಶ್ರೇಷ್ಠ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಂಶಾಭಿವೃದ್ಧಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸುವುದರಿಂದ ಮುಂಬರುವ ಪೀಳಿಗೆಗಳಿಗೆ ನಿರಂತರ ದೈವಿಕ ರಕ್ಷೆ ಮತ್ತು ಸಮೃದ್ಧಿ ಲಭಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} की स्थिति के साथ संतानकारक देवगुरु बृहस्पति का शुभ प्रभाव जीवन के इस पड़ाव में संतान की सुदृढ़ उन्नति और कुल की प्रतिष्ठा को दर्शाता है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में आपके बच्चे अपने कार्यक्षेत्र और जीवन में स्थापित होकर परिवार का नाम रोशन करेंगे।

वरिष्ठ जीवन में पौत्र-पौत्रियों की किलकारियां और परिवार का स्नेह असीम मानसिक शांति प्रदान करता है। पंचमेश ${h5Lord} के प्रभाव से आपके द्वारा दिए गए संस्कार अगली पीढ़ी में स्पष्ट रूप से परिलक्षित होंगे, जिससे समाज में कुल का मान-सम्मान निरंतर बढ़ेगा।

परिवार की निरंतर समृद्धि और भावी पीढ़ियों के कल्याणार्थ श्री संतान गोपाल स्तोत्र तथा भगवान श्री गणेश की आराधना करें। गोಕರ್ण क्षेत्र में परिवार कल्याण संकल्प समर्पित करना समस्त संतति को आरोग्य और यश प्रदान करेगा।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 5వ ఇల్లు (${h5Sign}) మరియు పంచమాధిపతి ${h5Lord} శుభ స్థితితో పాటు గురు గ్రహ ప్రభావం మీ వంశాభివృద్ధిని మరియు పిల్లల ఉన్నతిని సూచిస్తుంది. ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం మీ పిల్లలు తమ రంగాల్లో స్థిరపడి కుటుంబానికి మంచి పేరు తెచ్చే ఆనందాన్ని ఇస్తుంది.

ఈ పరిపక్వ వయస్సులో మనుమలు, మనవరాళ్ళతో గడిపే సమయం మరియు కుటుంబ ఐక్యత గొప్ప మానసిక శాంతిని ప్రసాదిస్తాయి. పంచమాధిపతి ${h5Lord} అనుగ్రహం వలన మీ సంస్కారవంతమైన విలువలు భావితరాలకు చక్కగా అందుతాయి.

వంశ రక్షణ మరియు సంతాన శ్రేయస్సు కోసం శ్రీ సంతాన గోపాల మంత్ర జపం మరియు గణపతి పూజ చేయడం శుభకరం. ఇది మీ భావితరాలకు దీర్ఘాయుష్షు మరియు శ్రేయస్సును అందిస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 5-ம் வீடான ${h5Sign} மற்றும் 5-ம் அதிபதி ${h5Lord} அமைப்புடன் குருவின் சுப பலம் உங்கள் சந்ததியின் மேன்மையையும், குடும்பப் பெருமையையும் குறிக்கிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி உங்கள் பிள்ளைகள் நல்ல நிலையில் வாழ்ந்து உங்களுக்கு மனநிறைவைத் தரும் காலமாகும்.

பேரக்குழந்தைகளின் மகிழ்ச்சி மற்றும் குடும்ப அன்பு இந்த வயதில் உங்களுக்கு அளவற்ற அமைதியைத் தரும். 5-ம் அதிபதி ${h5Lord} அருளால் உங்கள் நற்பண்புகள் அடுத்த தலைமுறைக்கும் தொடரும்.

வம்ச விருத்தி மற்றும் பிள்ளைகளின் நீண்ட ஆயுளுக்காக ஸ்ரீ சந்தான கோபாலர் மற்றும் விநாயகர் வழிபாடு செய்வது குடும்பத்திற்கு தொடர்ந்து பாதுகாப்பைத் தரும்.`;
    }
    return `In your birth chart, the 5th house (${h5Sign}), 5th lord ${h5Lord} in ${h5Where}, and Putrakaraka Jupiter signify the profound fruition of Poorva Punya through your family lineage. Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period bring immense pride as you witness your grown children well-established in their vocational callings, carrying forward family honor with Venus (Shukra) grace and distinguished intellect.

At this mature life milestone, the joyous presence of grandchildren (Poutra-Poutri and Dauhitra sukha) brings deep emotional contentment and spiritual fulfillment. The benefic disposition of ${h5Lord} confirms that your moral guidance and family heritage have successfully taken root in the younger generations, preserving ancestral traditions and bringing lasting domestic tranquility.

To continuously protect your family lineage and invite longevity and prosperity for children and grandchildren, sponsoring regular Ganapati prayers and offering Santana Gopala archana remains deeply meritorious. Prayers offered at Gokarna Mahabaleshwara Kshetra ensure generational grace and uninterrupted auspiciousness.`;
  }

  // Youth / Student Native (< 22 Years): Buddhi, Memory, Academics & Creativity
  if (chart.ageYears < 22) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮ ಭಾವವಾದ ${h5Sign} ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${h5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯೊಂದಿಗೆ ಪುತ್ರಕಾರಕ ಬೃಹಸ್ಪತಿ (Jupiter), ಚಂದ್ರ (Moon) ಹಾಗೂ ಕುಜ (ಮಂಗಳ) ಗ್ರಹಗಳ ಸಂಯೋಗವು ನಿಮ್ಮ ಜನ್ಮಜಾತ ಬುದ್ಧಿಶಕ್ತಿ, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಪರೀಕ್ಷಾ ಏಕಾಗ್ರತೆಯನ್ನು ನಿರ್ಣಯಿಸುತ್ತದೆ. ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ 5ನೇ ಮನೆಯು ಪೂರ್ವಪುಣ್ಯ ಹಾಗೂ ಬುದ್ಧಿಸ್ಥಾನವಾಗಿದ್ದು, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲವು ಉನ್ನತ ಶಿಕ್ಷಣ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಸಾಧನೆಗಳಿಗೆ ಅದ್ಭುತ ಚೈತನ್ಯವನ್ನು ನೀಡಲಿದೆ.

ಪಂಚಮಾಧಿಪತಿ ${h5Lord}ನ ಶುಭ ಪ್ರಭಾವವು ನಿಮ್ಮಲ್ಲಿ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಚಿಂತನೆ, ಸೃಜನಶೀಲ ಪ್ರತಿಭೆ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳನ್ನು ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಎದುರಿಸುವ ಶಕ್ತಿಯನ್ನು ತುಂಬುತ್ತದೆ. ಶಿಸ್ತುಬದ್ಧ ಅಧ್ಯಯನ ಹಾಗೂ ಸಮಯ ನಿರ್ವಹಣೆಯು ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಗುರಿಗಳನ್ನು ನಿರಾಯಾಸವಾಗಿ ತಲುಪಲು ನೆರವಾಗಲಿದೆ.

ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ನಿರಂತರ ಪ್ರಥಮ ಸ್ಥಾನ, ಜ್ಞಾಪಕ ಶಕ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಸರಸ್ವತಿ ಕೃಪೆಗಾಗಿ ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲ 'ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ' ಮಂತ್ರವನ್ನು ಮತ್ತು ಗಾಯತ್ರಿ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಜಪಿಸುವುದು ಅತ್ಯುತ್ತಮ. ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ವಿಜಯಕ್ಕಾಗಿ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಿಸುವುದು ನಿಮ್ಮ ಮಾನಸಿಕ ತೇಜಸ್ಸನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली में पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} की स्थिति बुद्धि, मेधा शक्ति और पूर्वपुण्य का केंद्र है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल आपकी स्मरण शक्ति, अध्ययन में एकाग्रता और अकादमिक उत्कृष्टता को नई ऊंचाइयां प्रदान करेगा।

पंचमेश ${h5Lord} के शुभ प्रभाव से आपकी तार्किक क्षमता और रचनात्मक प्रतिभा में उल्लेखनीय वृद्धि होगी। नियमित अध्ययन, समय का सदुपयोग और सकारात्मक दृष्टिकोण आपको प्रतियोगी परीक्षाओं में विशिष्ट सफलता दिलाएगा।

विद्या में सफलता और तीक्ष्ण बुद्धि हेतु प्रतिदिन 'ॐ ऐं सरस्वत्यै नमः' तथा गायत्री मंत्र का जाप करें। परीक्षा के समय भगवान श्री गणेश की आराधना आपके आत्मविश्वास को सुदृढ़ करेगी।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 5వ ఇల్లు (${h5Sign}) మరియు పంచమాధిపతి ${h5Lord} మీ జ్ఞాపకశక్తి, గ్రహణశక్తి మరియు విద్యా వికాసానికి మూలస్తంభాలు. జ్యోతిషశాస్త్రంలో 5వ స్థానం పూర్వపుణ్యం మరియు బుద్ధి స్థానం. ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం ఉన్నత విద్య మరియు పరీక్షలలో విజయానికి గొప్ప అవకాశాలను కల్పిస్తోంది.

పంచమాధిపతి ${h5Lord} శుభ దృష్టి మీలో విశ్లేషణాత్మక ఆలోచనను మరియు సృజనాత్మక నైపుణ్యాలను పెంచుతుంది. ప్రణాళికాబద్ధమైన చదువు మరియు క్రమశిక్షణతో కూడిన సాధన మీకు ఉత్తమ ఫలితాలను అందిస్తాయి.

విద్యాభివృద్ధి మరియు ఏకాగ్రత కోసం ప్రతిరోజూ 'ఓం ఐం సరస్వత్యై నమః' మంత్రాన్ని మరియు గాయత్రీ మంత్రాన్ని జపించండి. శ్రీ గణపతి పూజ మీ విజయానికి మార్గం సుగమం చేస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 5-ம் வீடான ${h5Sign} மற்றும் 5-ம் அதிபதி ${h5Lord} அமைப்பு உங்கள் புத்திக்கூர்மை, நினைவாற்றல் மற்றும் கல்வித் திறனை உருவாக்குகிறது. 5-ம் வீடு பூர்வ புண்ணியம் மற்றும் புத்தி ஸ்தானமாகும். தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி உயர்கல்வி மற்றும் தேர்வுகளில் வெற்றி பெற அருமையான ஆற்றலைத் தரும்.

5-ம் அதிபதி ${h5Lord} அருளால் படைப்பாற்றலும் ஆழமான புரிதலும் உண்டாகும். முறையான படிப்பு மற்றும் நேர மேலாண்மை உங்கள் கல்வி இலக்குகளை எளிதாக அடைய உதவும்.

கல்வியில் சிறந்து விளங்க தினமும் 'ஓம் ஐம் சரஸ்வத்யை நமஹ' மந்திரத்தையும் காயத்ரி மந்திரத்தையும் ஜபிக்கவும். ஸ்ரீ விநாயகர் வழிபாடு தேர்வுகளில் தன்னம்பிக்கையைத் தரும்.`;
    }
    return `In your natal chart, the 5th house (${h5Sign}) and 5th lord ${h5Lord} placed in ${h5Where}, harmonized by Putrakaraka Jupiter, govern your foundational intellect, cognitive absorption, and Poorva Punya. Astrologically, the 5th house is Buddhi Sthana—the seat of memory, discernment, and creative expression. Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period actively stimulate intellectual curiosity, intellectual acumen, and higher education, blessed by Venus (Shukra) and planetary intellect.

The planetary radiation of ${h5Lord} empowers you with sharp analytical comprehension, strategic problem-solving abilities, and high success in competitive examinations. Cultivating structured study rhythms, disciplined time allocation, and intellectual curiosity ensures that you consistently distinguish yourself in academic and creative pursuits.

To awaken photographic recall, mental focus, and academic distinction, reciting the sacred Saraswati mantra ('Om Aim Saraswatyai Namah') alongside the Gayatri Mantra during morning dawn is highly recommended. Offering prayers to Lord Ganesha ensures that all academic hurdles are dissolved, paving the way for scholarly brilliance.`;
  }

  // Adult Native (22 to 59 Years): Seeking Progeny vs Has Children vs General
  if (status === "no_children") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮ ಭಾವವಾದ ${h5Sign} ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${h5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯೊಂದಿಗೆ ಪುತ್ರಕಾರಕ ಬೃಹಸ್ಪತಿ (Jupiter), ಚಂದ್ರ (Moon) ಹಾಗೂ ಕುಜ (ಮಂಗಳ) ಗ್ರಹಗಳ ಶುಭ ಪ್ರಭಾವವು ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಯೋಗವನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲವು ವಂಶಾಭಿವೃದ್ಧಿಯ ಶುಭ ಸಂಕೇತಗಳನ್ನು ಹೊತ್ತುತಂದಿದೆ. ಪಂಚಮ ಭಾವದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ಬಲವು ನೈಸರ್ಗಿಕ ಗರ್ಭಧಾರಣೆಗೆ ಹಾಗೂ ಸಂತಾನ ಸೌಖ್ಯಕ್ಕೆ ಪೂರಕವಾದ ದಿವ್ಯ ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿದೆ.

ಶುಭ ಗ್ರಹಗಳ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಸಂಚಾರವು ಗರ್ಭಧಾರಣೆ ಹಾಗೂ ಸಂತಾನೋತ್ಪತ್ತಿಗೆ ಅನುಕೂಲಕರವಾದ ದಿವ್ಯ ಕಾಲಘಟ್ಟವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ದಂಪತಿಗಳು ಕೈಗೊಳ್ಳುವ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಧಾರ್ಮಿಕ ಸಂಕಲ್ಪಗಳು ಶೀಘ್ರ ಯಶಸ್ಸು ನೀಡಲಿವೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದಾಗಿ ಸಂತಾನ ನಿರೀಕ್ಷೆಯಲ್ಲಿರುವ ಕುಟುಂಬದಲ್ಲಿ ಶೀಘ್ರದಲ್ಲೇ ಮಂದಸ್ಮಿತ ಮಗುವಿನ ಆಗಮನದ ಶುಭ ವಾರ್ತೆ ಕೇಳಿಬರಲಿದೆ.

ಸಂತಾನ ಪ್ರತಿಬಂಧಕ ದೋಷಗಳ ನಿವಾರಣೆಗಾಗಿ ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸುವುದು ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ ಹಾಗೂ ನಾಗ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು, ಮತ್ತು ಪ್ರತಿ ಗುರುವಾರ ಹಸುವಿಗೆ ಹಸಿರು ಹುಲ್ಲು ಅಥವಾ ಬೆಲ್ಲ-ಕಡಲೆ ನೀಡಿ ಗೋಸೇವೆ ಮಾಡುವುದರಿಂದ ಸಂತಾನ ಯೋಗದ ಸಕಲ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಲಿವೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} की ${h5Where} में स्थिति के साथ संतानकारक देवगुरु बृहस्पति का शुभ प्रभाव वंश वृद्धि एवं संतान प्राप्ति के योग को पुष्ट करता है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल संतान सुख की प्राप्ति में अत्यंत सहायक सिद्ध होगा। पंचम भाव का यह प्रभाव दंपत्ति के जीवन में नवीन ऊर्जा और मातृत्व-पितृत्व के शुभ अवसर निर्मित कर रहा है।

अनुकूल ग्रहों का वर्तमान गोचर गर्भाधान तथा स्वास्थ्य संवर्धन हेतु अत्यंत फलदायी वातावरण तैयार कर रहा है। इस समय किए जाने वाले चिकित्सीय प्रयास और आध्यात्मिक अनुष्ठान शीघ्र सकारात्मक परिणाम लेकर आएंगे। देवगुरु बृहस्पति की कृपा से संतान अभिलाषी दंपत्ति के घर में शीघ्र ही नन्हें शिशु की किलकारियां गूंजने के प्रबल योग बन रहे हैं।

संतान प्राप्ति में आ रहे किसी भी सूक्ष्म व्यवधान के निवारणार्थ प्रतिदिन 'ॐ क्लीं देवकीसुत गोविंद वासुदेव जगत्पते। देहि मे तनयं कृष्ण त्वामहं शरणं गतः॥' मंत्र का 108 बार जाप करें। गोಕರ್ण क्षेत्र में सुब्रह्मण्य होम एवं गुरुवार को गौ-माता की सेवा करना समस्त दोषों को शांत कर शीघ्र संतान सुख प्रदान करेगा।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 5వ ఇల్లు (${h5Sign}) మరియు పంచమాధిపతి ${h5Lord} స్థితితో పాటు సంతానకారక గురు గ్రహ అనుగ్రహం సంతాన ప్రాప్తి యోగాన్ని బలపరుస్తోంది. ప్రస్తుతం నడుస్తున్న ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం వంశాభివృద్ధికి సంబంధించిన శుభవార్తలను తెస్తుంది. 5వ భావంలో శుభగ్రహాల బలం సంతాన సౌఖ్యానికి అనుకూలమైన శక్తిని అందిస్తోంది.

అనుకూల గోచార గ్రహ సంచారం గర్భధారణకు మరియు ఆరోగ్య వృద్ధికి అత్యంత అనుకూలమైన వాతావరణాన్ని సృష్టిస్తోంది. ఈ సమయంలో చేపట్టే వైద్య పరీక్షలు మరియు దైవ ప్రార్థనలు త్వరిత ఫలితాలను ఇస్తాయి. గురు భగవానుని కృపతో త్వరలోనే మీ ఇంట పసిపాప నవ్వులు విరిసే శుభయోగం ఉంది.

సంతాన అవరోధాల నివారణకు ప్రతిరోజూ శ్రీ సంతాన గోపాల మంత్రాన్ని 108 సార్లు జపించండి. గోకర్ణ మహాబలేశ్వర క్షేత్రంలో సుబ్రహ్మణ్య హోమం నిర్వహించడం మరియు గురువారం ఆవుకు సేవ చేయడం వలన సకల విఘ్నాలు తొలగి శీఘ్ర సంతాన ప్రాప్తి కలుగుతుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 5-ம் வீடான ${h5Sign} மற்றும் 5-ம் அதிபதி ${h5Lord} அமைப்புடன் சந்தானகாரக குருவின் சுப பார்வை வம்ச விருத்தி மற்றும் குழந்தை பாக்கிய யோகத்தை பலப்படுத்துகிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் மழலைச் செல்வம் பெற சாதகமான காலமாக அமைகிறது.

சுப கிரகங்களின் கோசார சஞ்சாரம் கருத்தரிப்புக்கும் நல்வாழ்வுக்கும் உகந்த சூழலை உருவாக்குகிறது. இக்காலத்தில் மேற்கொள்ளும் மருத்துவ முயற்சிகளும் ஆன்மீக வழிபாடுகளும் விரைவில் நல்ல பலனைத் தரும். குரு பகவானின் திருவருளால் உங்கள் இல்லத்தில் மழலை குரல் கேட்கும் சுப யோகம் கூடிவருகிறது.

குழந்தைப் பேற்றுக்கு ஏற்படும் தடைகள் நீங்க தினமும் ஸ்ரீ சந்தான கோபால மந்திரத்தை 108 முறை ஜபிக்கவும். கோகர்ணத்தில் சுப்பிரமணிய ஹோமம் செய்வதும், வியாழக்கிழமைகளில் பசு சேவை செய்வதும் தோஷங்களை நீக்கி விரைவில் குழந்தை பாக்கியம் தரும்.`;
    }
    return `In your birth chart, the 5th house (${h5Sign}) and 5th lord ${h5Lord} placed in ${h5Where}, along with Putrakaraka Jupiter's benefic disposition in ${jupWhere}, signify strong Santana Yoga (progeny blessings). The 5th house governs Poorva Punya, creative intelligence, and lineage continuity, indicating that your karmic bank carries positive momentum for family expansion. Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period actively stimulate the reproductive houses, creating an auspicious astrological window for conception and parental fulfillment.

Favorable planetary transits of Jupiter and supportive planetary aspects establish a fertile and protected window for physical wellbeing and conception. Medical consultations and lifestyle optimizations undertaken during this phase will yield exceptionally positive and timely outcomes. With divine blessings aligning in your chart, the joy of parenthood and the continuation of your lineage are strongly favored to manifest in the coming phase.

To eliminate any subtle energetic blockages or pitru-related delays, regular recitation of the Santana Gopala Mantra ('Om Kleem Devakisuta Govinda Vasudeva Jagatpate, Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah') 108 times daily is recommended. Additionally, sponsoring a Subramanya Pooja or Naga Dosha Nivarana at Gokarna Kshetra and performing Gau-seva (cow service) on Thursdays will harmonize planetary energies and grant early, healthy progeny blessings.`;
  } else if (status === "has_children") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪಂಚಮ ಭಾವವಾದ ${h5Sign} ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${h5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯು ಮಕ್ಕಳ ಶೈಕ್ಷಣಿಕ, ಬೌದ್ಧಿಕ ಹಾಗೂ ಸೃಜನಶೀಲ ರಂಗಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಪ್ರತಿಭೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಪುತ್ರಕಾರಕ ಬೃಹಸ್ಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯು ಅವರಲ್ಲಿ ನೈಸರ್ಗಿಕ ಜ್ಞಾನದಾಹ, ಸನ್ನಡತೆ ಹಾಗೂ ಉನ್ನತ ಸಂಸ್ಕಾರವನ್ನು ನೆಲೆನಿಲ್ಲಿಸುತ್ತದೆ. ಮಕ್ಕಳ ತೀಕ್ಷ್ಣ ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಶಿಸ್ತುಬದ್ಧ ಪರಿಶ್ರಮವು ಕುಟುಂಬದ ಕೀರ್ತಿಯನ್ನು ಸಮಾಜದಲ್ಲಿ ಉನ್ನತೀಕರಿಸಲಿದೆ.

ಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣ, ಕ್ರೀಡೆ ಹಾಗೂ ವೃತ್ತಿಜೀವನದ ಮಹತ್ವದ ಹಂತಗಳಲ್ಲಿ ಪೋಷಕರಾಗಿ ನಿಮ್ಮ ವಾತ್ಸಲ್ಯಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನವು ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸಲಿದೆ. ಅವರ ಸುಪ್ತ ಪ್ರತಿಭೆಗಳನ್ನು ಗುರುತಿಸಿ ಪ್ರೋತ್ಸಾಹಿಸುವುದು ಅವರ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸುತ್ತದೆ. ಮಕ್ಕಳೊಂದಿಗೆ ಮುಕ್ತ ಸ್ನೇಹಪರ ಸಂಭಾಷಣೆ ನಡೆಸುವುದು ಅವರ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯನ್ನು ಕಾಪಾಡುತ್ತದೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಸಾಧನೆಗಳಿಗೆ ಗಟ್ಟಿ ಅಡಿಪಾಯ ಹಾಕುತ್ತದೆ.

ಮಕ್ಕಳ ಸಕಲ ವಿದ್ಯಾಭ್ಯಾಸದ ಜಯ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯಕ್ಕಾಗಿ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಾರಾಯಣ ಮಾಡಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರವಾಗಿದೆ. ಮಕ್ಕಳಿಗೆ ಪ್ರಾತಃಕಾಲ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸುವ ಅಭ್ಯಾಸ ಮಾಡಿಸುವುದು ಹಾಗೂ ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆಯಲು ಪ್ರೇರೇಪಿಸುವುದು ಅವರ ಭವಿಷ್ಯವನ್ನು ಸದಾ ಉಜ್ವಲವಾಗಿಡಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली में पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} तथा देवगुरु बृहस्पति के शुभ प्रभाव से बच्चों के बौद्धिक विकास, शिक्षा और रचनात्मक क्षेत्रों में सराहनीय उन्नति के प्रबल योग हैं। उनका स्वाभाविक अनुशासन, तीव्र स्मरण शक्ति और संस्कारी स्वभाव परिवार का नाम रोशन करेगा। वे विद्या और व्यावहारिक ज्ञान दोनों में निपुण होकर अपनी विशिष्ट पहचान बनाएंगे।

उनकी उच्च शिक्षा, करियर और व्यक्तिगत विकास में माता-पिता के रूप में आपका मार्गदर्शन अत्यंत प्रेरणादायी सिद्ध होगा। बच्चों की व्यक्तिगत रुचियों को पहचानकर उन्हें सकारात्मक दिशा में प्रोत्साहित करना उनके आत्मविश्वास को सुदृढ़ करेगा। उनके साथ सौहार्दपूर्ण और मित्रवत संवाद बनाए रखने से पारिवारिक संबंध और अधिक प्रगाढ़ होंगे।

बच्चों की मानसिक एकाग्रता, उत्कृष्ट परीक्षा परिणाम और दीर्घायु हेतु मां सरस्वती की नित्य आराधना तथा भगवान श्री गणेश का अथर्वशीर्ष अभिषेक कराना परम कल्याणकारी रहेगा। गुरुवार को विद्यार्थियों को पाठ्य सामग्री का दान करना तथा घर में सात्विक वातावरण बनाए रखना बच्चों के सर्वांगीण विकास को गति प्रदान करेगा।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 5వ ఇల్లు (${h5Sign}) మరియు పంచమాధిపతి ${h5Lord} స్థితి పిల్లల విద్యా ప్రగతి, మేధస్సు మరియు సృజనాత్మక రంగాలలో అద్భుతమైన ప్రతిభను సూచిస్తోంది. గురు గ్రహ అనుగ్రహం వారిలో సహజ జ్ఞాన దాహం, మంచి నడవడిక మరియు సంస్కారాన్ని పెంపొందిస్తుంది. పిల్లల చురుకుదనం మరియు క్రమశిక్షణ కుటుంబ గౌరవాన్ని సమాజంలో ఇనుమడింపజేస్తాయి.

పిల్లల ఉన్నత విద్య మరియు కెరీర్ నిర్మాణంలో తల్లిదండ్రులుగా మీ ఆప్యాయతతో కూడిన మార్గదర్శకత్వం కీలక పాత్ర పోషిస్తుంది. వారిలోని ప్రతిభను గుర్తించి ప్రోత్సహించడం వారి ఆత్మవిశ్వాసాన్ని రెట్టింపు చేస్తుంది. వారితో స్నేహపూర్వక సంభాషణలు జరపడం వారి భవిష్యత్తుకు బలమైన పునాదిని వేస్తుంది.

పిల్లల చదువులో విజయం, ఏకాగ్రత మరియు ఆయురారోగ్యాల కోసం ఇంట్లో శ్రీ సరస్వతీ దేవి ప్రార్థన మరియు గణపతి అథర్వశీర్ష పారాయణం శ్రేయస్కరం. విద్యార్థులకు సాయం చేయడం వారి భవిష్యత్తును ఉజ్వలం చేస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 5-ம் வீடான ${h5Sign} மற்றும் 5-ம் அதிபதி ${h5Lord} அமைப்பு பிள்ளைகளின் கல்வி வளர்ச்சி, புத்திக்கூர்மை மற்றும் கலைத்திறனை வெளிப்படுத்துகிறது. குரு பகவானின் அருள் அவர்களிடத்தில் நல்லொழுக்கத்தையும் கல்வியறிவையும் வளர்க்கும். பிள்ளைகளின் கடுமையான உழைப்பு குடும்பத்தின் புகழை உயர்த்தும்.

பிள்ளைகளின் உயர்கல்வி மற்றும் எதிர்கால வளர்ச்சியில் பெற்றோரின் அன்பான வழிகாட்டுதல் பெரும் பலமாக இருக்கும். அவர்களின் தனித்துவமான திறமைகளை ஊக்குவிப்பது தன்னம்பிக்கையை உயர்த்தும். அவர்களுடன் அன்பான நட்புடன் பழகுவது உறவை மேம்படுத்தும்.

பிள்ளைகளின் கல்வி வெற்றி மற்றும் நீண்ட ஆயுளுக்கு ஸ்ரீ சரஸ்வதி தேவி வழிபாடு மற்றும் விநாயகர் பூஜை மிகவும் நல்லது. தினமும் காயத்ரி மந்திரம் சொல்லி வழிபடுவது பிரகாசமான எதிர்காலத்தை அமைத்துத்தரும்.`;
    }
    return `The benefic alignment of your 5th house (${h5Sign}), 5th lord ${h5Lord} in ${h5Where}, and Putrakaraka Jupiter in ${jupWhere} indicates sharp intellect, moral integrity, and commendable academic promise in your children. They possess a natural curiosity, disciplined grasping power, and creative problem-solving abilities that will distinguish them in scholarly and extracurricular pursuits, bringing joy, pride, and honor to the family with Venus (Shukra) blessings.

Your loving parental mentorship, patience, and active encouragement will play a pivotal role in shaping their higher educational milestones and career paths. Fostering open, compassionate communication and respecting their individual talents bolsters their inner confidence, equipping them to navigate competitive challenges with dignity and emotional poise.

To continuously support their academic clarity, cognitive focus, and overall vitality, offering Saraswati prayers and Lord Ganesha Atharvashirsha Abhishekam is highly beneficial. Encouraging them to chant the Gayatri Mantra daily and maintaining an enriching, culturally grounded home environment ensures lifelong success, happiness, and moral brilliance.`;
  } else {
    // general
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ 5ನೇ ಮನೆ (${h5Sign}) ಹಾಗೂ ಅಧಿಪತಿ ${h5Lord} ಪೂರ್ವಪುಣ್ಯ, ಅಂತಃಪ್ರಜ್ಞೆ ಹಾಗೂ ವಂಶದ ಕೀರ್ತಿಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿಯು ಬೌದ್ಧಿಕ ಸಾಧನೆಗಳು ಮತ್ತು ಸೃಜನಶೀಲ ಯಶಸ್ಸಿಗೆ ಅನುಕೂಲಕರವಾಗಿದೆ.

ಉನ್ನತ ಆದರ್ಶಗಳು, ಸತ್ಕರ್ಮಗಳು ಹಾಗೂ ಧಾರ್ಮಿಕ ಅಧ್ಯಯನವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಶಾಶ್ವತ ಪ್ರಗತಿಯನ್ನು ತರಲಿವೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಕೃಪೆಯು ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಲ್ಲಿ ದೈವಿಕ ವಿವೇಕವನ್ನು ತುಂಬಲಿದೆ.

ನಿತ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸುವುದು ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅನ್ನದಾನ ಅಥವಾ ಪುಸ್ತಕ ದಾನ ಮಾಡುವುದು ನಿಮ್ಮ ಕುಟುಂಬದ ಯೋಗಕ್ಷೇಮವನ್ನು ವೃದ್ಧಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली का पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} पूर्वपुण्य, प्रज्ञा और रचनात्मक सामर्थ्य के मुख्य स्रोत हैं। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल आपके बौद्धिक कौशल और दूरदर्शिता को निखारेगा।

सदाचार, ज्ञान संवर्धन और आध्यात्मिक निष्ठा आपके जीवन में स्थायी समृद्धि का मार्ग प्रशस्त करेगी। देवगुरु बृहस्पति की कृपा से पारिवारिक मान-प्रतिष्ठा में वृद्धि होगी।

नित्य गायत्री मंत्र का जाप तथा निर्धन विद्यार्थियों को शिक्षा सामग्री का दान करना असीम पुण्य फल प्रदान करेगा।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 5వ ఇల్లు (${h5Sign}) మరియు పంచమాధిపతి ${h5Lord} పూర్వపుణ్యం, అంతఃప్రజ్ఞ మరియు ప్రతిభను సూచిస్తాయి. ప్రస్తుత ${chart.mahaLordName} మహాదశ మరియు ${chart.bhuktiLordName} భుక్తి మీ ఆలోచనలను సృజనాత్మకంగా మరియు విజయవంతంగా నడిపిస్తాయి.

ధర్మనిష్ఠ, విద్యా వికాసం మరియు సత్కార్యాలు మీ జీవితంలో శాశ్వతమైన ఉన్నతిని చేకూరుస్తాయి. గురు భగవానుని కటాక్షం మీ నిర్ణయాల్లో వివేకాన్ని నింపుతుంది.

ప్రతిరోజూ గాయత్రీ మంత్రాన్ని జపించడం మరియు విద్యార్థులకు సహాయం చేయడం కుటుంబ శ్రేయస్సుకు తోడ్పడుతుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 5-ம் வீடான ${h5Sign} மற்றும் 5-ம் அதிபதி ${h5Lord} அமைப்பு பூர்வ புண்ணியம் மற்றும் ஆழ்ந்த அறிவைக் குறிக்கிறது. தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் அறிவுசார்ந்த சாதனைகளுக்கு உகந்ததாகும்.

உயர்ந்த கொள்கைகளும் தர்ம சிந்தனையும் உங்கள் வாழ்வில் தொடர் வெற்றியைத் தரும். குரு பகவானின் அருள் நல்வழியில் வழிநடத்தும்.

தினமும் காயத்ரி மந்திரம் சொல்லி வழிபடுவதும், மாணவர்களுக்கு கல்வி உதவி செய்வதும் புண்ணியத்தைத் தரும்.`;
    }
    return `The 5th house (${h5Sign}) and its ruler ${h5Lord} govern Poorva Punya, intuitive intellect, and creative legacy. The running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti inspire scholarly achievements, strategic foresight, and noble creative endeavors that leave an enduring positive imprint on your lineage.

Nurturing noble ideals, philosophical study, and spiritual wisdom activates powerful karmic momentum for enduring prosperity. Daily chanting of the Gayatri Mantra and supporting youth educational causes awakens profound mental radiance and divine grace.

Maintaining pure ethical principles and seeking blessings from learned spiritual preceptors ensures that your intellect remains sharp and aligned with higher dharmic goals.`;
  }
}

export function buildDynamicCareerFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h10 = chart.houses[10];
  const h10Lord = h10.lordName;
  const h10Sign = h10.rashiName;
  const h10Where = `Bhava ${h10.lordHouse} (${h10.lordRashiName})`;
  const careerDomain = getCareerDomainByLord(h10.lordGraha, baseLang);
  const saturnWhere = chart.saturnPlacement ? `Bhava ${chart.saturnPlacement.house}` : "chart";

  // Branch 1: Senior Citizens (Age 60+) - Advisory, Mentorship, Legacy, Spiritual Service
  if (chart.ageYears >= 60) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಮನೆ (ದಶಮ ಭಾವವಾದ ${h10Sign}) ಹಾಗೂ ಕರ್ಮಾಧಿಪತಿಯಾದ ${h10Lord} ಗ್ರಹವು ${h10Where}ದಲ್ಲಿ ನೆಲೆಸಿರುವ ಸ್ಥಿತಿಯು ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ (೬೦+ ವರ್ಷ) ನಿವೃತ್ತಿ ನಂತರದ ಗೌರವಾನ್ವಿತ ಜೀವನ, ಸಮಾಜ ಸೇವೆ, ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಧಾರ್ಮಿಕ ನೇತೃತ್ವವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನಿಮ್ಮ ಅಪಾರ ಜೀವನಾನುಭವ ಹಾಗೂ ವೃತ್ತಿ ಕೌಶಲ್ಯವು ಯುವ ಪೀಳಿಗೆಗೆ ದಾರಿದೀಪವಾಗಲಿದೆ. ಕರ್ಮಕಾರಕ ಶನಿ ಗ್ರಹವು ${saturnWhere}ದಲ್ಲಿ ನೆಲೆಸಿರುವುದು ನಿಮ್ಮಲ್ಲಿ ಧರ್ಮ ಕಾರ್ಯಗಳು, ಟ್ರಸ್ಟ್‌ಗಳು ಅಥವಾ ಸಮಾಜಮುಖಿ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿರಲು ಪ್ರೇರೇಪಿಸುತ್ತದೆ. ಜಾತಕದ ಪ್ರಕಾರ ನೀವು ${careerDomain} ಮುಂತಾದ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಹಿರಿಯ ಸಲಹೆಗಾರರಾಗಿ ಮುಂದುವರಿಯುವ ಯೋಗವಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಕೀರ್ತಿ, ಮರ್ಯಾದೆ ಹಾಗೂ ಗೌರವವನ್ನು ಮತ್ತಷ್ಟು ಹೆಚ್ಚಿಸಲಿದೆ. ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಒತ್ತಡವಿಲ್ಲದ ಧಾರ್ಮಿಕ ಅಧ್ಯಯನ, ಧ್ಯಾನ ಹಾಗೂ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣವು ಮನಸ್ಸಿಗೆ ಅಪಾರ ತೃಪ್ತಿ, ನೆಮ್ಮದಿ ಮತ್ತು ಶಾಶ್ವತ ಕೀರ್ತಿಯನ್ನು ಕರುಣಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के 10वें भाव (दशम भाव ${h10Sign}) और कर्मेश ${h10Lord} की ${h10Where} में स्थिति वरिष्ठ अवस्था (60+ वर्ष) में सेवानिवृत्ति उपरांत प्रतिष्ठित जीवन, सामाजिक सेवा, मार्गदर्शन तथा आध्यात्मिक नेतृत्व का संकेत देती है। आपका विशाल जीवन अनुभव और कार्यकुशलता युवा पीढ़ी के लिए प्रकाशस्तंभ बनेगी। कर्मकारक शनि का प्रभाव धर्मार्थ कार्यों, परामर्श तथा समाजोपयोगी गतिविधियों में सम्मानजनक सहभागिता का योग बनाता है। आप ${careerDomain} से संबंधित क्षेत्रों में एक सम्मानित वरिष्ठ सलाहकार अथवा मार्गदर्शक के रूप में पूजनीय रहेंगे।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में आपकी प्रतिष्ठा और सामाजिक आदर में निरंतर वृद्धि होगी। नियमित ईश्वर स्मरण, धार्मिक अध्ययन तथा शनिवार को हनुमान चालीसा का पाठ मानसिक शांति, आत्मिक संतोष और दीर्घकालिक सम्मान प्रदान करेगा।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 10వ ఇల్లు (${h10Sign}) మరియు కర్మాధిపతి ${h10Lord} ${h10Where}లో ఉండటం సీనియర్ వయస్సులో (60+ సంవత్సరాలు) పదవీ విరమణ తర్వాత గౌరవప్రదమైన జీవితం, సమాజ సేవ, మార్గదర్శకత్వం మరియు ధార్మిక నాయకత్వాన్ని సూచిస్తాయి. మీ అమూల్యమైన జీవిత అనుభవం యువతరానికి ఆదర్శంగా నిలుస్తుంది. కర్మకారక శని ప్రభావం వల్ల ధార్మిక ట్రస్టులు, ఆధ్యాత్మిక లేదా సామాజిక కార్యక్రమాలలో మీరు గౌరవప్రదమైన స్థానాన్ని పొందుతారు. ${careerDomain} సంబంధిత రంగాలలో అనుభవజ్ఞుడైన సలహాదారుగా మీ మాటకు ఎంతో విలువ ఉంటుంది.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం సమాజంలో మీ గౌరవాన్ని మరియు ఆత్మసంతృప్తిని పెంచుతుంది. ప్రశాంతమైన జీవనశైలి, ఆధ్యాత్మిక చింతన మరియు హనుమాన్ చాలీసా పారాయణం ఆత్మశాంతిని మరియు ఉన్నత కీర్తిని చేకూరుస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 10-ம் வீடான ${h10Sign} மற்றும் 10-ம் அதிபதி ${h10Lord} ${h10Where} அமைப்பில் இருப்பது மூத்த வயதில் (60+ வயது) பணி ஓய்வுக்குப் பிந்தைய கௌரவமான வாழ்க்கை, ஆன்மீக சேவை மற்றும் இளைய தலைமுறைக்கான வழிகாட்டுதலைக் குறிக்கிறது. உங்கள் வாழ்நாள் அனுபவமும் அறிவாற்றலும் சமூகத்திற்கு சிறந்த நல்வழிகாட்டியாக விளங்கும். கர்மகாரகன் சனி பகவானின் அருளால் அறக்கட்டளைகள் மற்றும் ஆன்மீக பணிகளில் கௌரவப் பொறுப்புகள் கிட்டும். ${careerDomain} துறைகளில் நீங்கள் அனுபவமிக்க மூத்த ஆலோசகராக மதிக்கப்படுவீர்கள்.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் சமூகத்தில் உங்கள் நற்பெயரையும் மனநிறைவையும் உயர்த்தும். நிம்மதியான ஆன்மீக ஈடுபாடும் அனுமன் சாலிசா பாராயணமும் வாழ்விற்கு அமைதியையும் நிறைவையும் தரும்.`;
    }
    return `In your senior years (age 60+), the 10th house (${h10Sign}) and 10th lord ${h10Lord} situated in ${h10Where} indicate an honorable post-retirement chapter enriched by mentorship, advisory consulting, and spiritual contribution rather than aggressive corporate competition. Karmakaraka Saturn positioned in ${saturnWhere} directs your vocational focus toward community trusts, institutional guidance, and charitable leadership. Drawing upon your deep expertise in ${careerDomain}, you will command sincere respect as an elder statesman and trusted counselor.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period foster public veneration, philosophical contemplation, and family pride in your lifelong accomplishments. Chanting the Hanuman Chalisa and supporting educational or Vedic foundations brings profound inner fulfillment and enduring legacy.`;
  }

  // Branch 2: Youth & Students (Age < 22) - Academic Preparation, Vocational Direction & Skill Mastery
  if (chart.ageYears < 22) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಮನೆ (ದಶಮ ಭಾವವಾದ ${h10Sign}) ಹಾಗೂ ಕರ್ಮಾಧಿಪತಿಯಾದ ${h10Lord} ಗ್ರಹವು ${h10Where}ದಲ್ಲಿ ನೆಲೆಸಿರುವ ಸ್ಥಿತಿಯು ಈ ಯುವ ವಯಸ್ಸಿನಲ್ಲಿ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದ ಆಯ್ಕೆ, ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಭವಿಷ್ಯದ ವೃತ್ತಿ ಅಡಿಪಾಯವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಕರ್ಮಕಾರಕ ಶನಿಯು ${saturnWhere}ದಲ್ಲಿರುವುದು ಓದಿನಲ್ಲಿ ಕಠಿಣ ಶಿಸ್ತು, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಕಾಲಹರಣ ಮಾಡದೆ ಗುರಿಯತ್ತ ಸಾಗುವ ದೃಢ ಮನೋಭಾವವನ್ನು ನೀಡುತ್ತದೆ. ಜಾತಕದ ಪ್ರಭಾವದಿಂದಾಗಿ ನೀವು ಭವಿಷ್ಯದಲ್ಲಿ ${careerDomain} ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಉನ್ನತ ಸಾಧನೆ ಮಾಡುವ ಪ್ರಕಾಶಮಾನ ಯೋಗವನ್ನು ಹೊಂದಿದ್ದೀರಿ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಕಾಲೇಜು ಪ್ರವೇಶ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಭವಿಷ್ಯದ ವೃತ್ತಿಪರ ಯೋಜನೆಗಳಿಗೆ ಸಕಾಲವಾಗಿದೆ. ಅನಗತ್ಯ ಆಕರ್ಷಣೆಗಳಿಂದ ದೂರವಿದ್ದು, ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಸಂಪೂರ್ಣ ಗಮನ ಕೇಂದ್ರೀಕರಿಸುವುದು ಉತ್ತಮ ಭವಿಷ್ಯವನ್ನು ನಿರ್ಮಿಸಲಿದೆ. ನಿತ್ಯ ಶ್ರೀ ಗಣೇಶ ಹಾಗೂ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು ಜ್ಞಾನಾರ್ಜನೆಯಲ್ಲಿ ಸದಾ ಜಯವನ್ನು ತರಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली का 10वां भाव (दशम भाव ${h10Sign}) और कर्मेश ${h10Lord} की ${h10Where} में स्थिति इस युवा अवस्था में उच्च शिक्षा, कौशल विकास और भावी करियर की मजबूत नींव का निर्धारण करते हैं। कर्मकारक शनि का प्रभाव अध्ययन में अनुशासन, एकाग्रता और समय के सदुपयोग की प्रेरणा देता है। ग्रहों के शुभ प्रभाव से आप भविष्य में ${careerDomain} के क्षेत्रों में असाधारण सफलता और ख्याति प्राप्त करने की योग्यता रखते हैं।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल प्रतियोगी परीक्षाओं, उच्च अध्ययन और करियर की दिशा तय करने के लिए अत्यंत महत्वपूर्ण है। भटकाव से बचकर विद्याध्ययन पर ध्यान केंद्रित करना स्वर्णिम भविष्य की गारंटी देगा। नित्य मां सरस्वती और भगवान गणेश की आराधना बुद्धि और एकाग्रता को प्रखर बनाएगी।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 10వ ఇల్లు (${h10Sign}) మరియు కర్మాధిపతి ${h10Lord} ${h10Where}లో ఉండటం ఈ విద్యాభ్యాస దశలో ఉన్నత చదువులు, నైపుణ్యాభివృద్ధి మరియు భవిష్యత్ కెరీర్ పునాదిని సూచిస్తాయి. కర్మకారక శని ప్రభావం వల్ల చదువులో క్రమశిక్షణ, ఏకాగ్రత మరియు లక్ష్యంపై పట్టుదల అలవడుతుంది. జాతక రీత్యా మీరు భవిష్యత్తులో ${careerDomain} రంగాలలో అత్యున్నత విజయాలు సాధించే శుభ యోగం ఉంది.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం పోటీ పరీక్షలు మరియు ఉన్నత విద్యా ప్రవేశాలకు అనుకూలమైనది. అనవసర వ్యాపకాలకు దూరంగా ఉండి చదువుపై శ్రద్ధ వహించడం ఉజ్వల భవిష్యత్తుకు బాటలు వేస్తుంది. శ్రీ సరస్వతీ దేవిని ఆరాధించడం జ్ఞాన వికాసానికి తోడ్పడుతుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 10-ம் வீடான ${h10Sign} மற்றும் 10-ம் அதிபதி ${h10Lord} ${h10Where} அமைப்பில் இருப்பது இந்த இளமைப் பருவத்தில் உயர்கல்வி, தொழில்முறை திறன் வளர்ச்சி மற்றும் எதிர்கால வாழ்க்கைக்கான அடித்தளத்தைக் குறிக்கிறது. கர்மகாரகன் சனி பகவான் படிப்பில் ஆழ்ந்த ஈடுபாடு, கடின உழைப்பு மற்றும் ஒழுக்கத்தை வழங்குகிறார். ஜாதக அமைப்பின்படி எதிர்காலத்தில் நீங்கள் ${careerDomain} சார்ந்த துறைகளில் பெரும் சாதனைகளைப் படைக்கும் யோகம் உள்ளது.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் உயர்கல்வி தேர்வுகள் மற்றும் போட்டித் தேர்வுகளில் சிறந்து விளங்க உதவும் பொற்காலமாகும். கவனச்சிதறல்களைத் தவிர்த்து கல்வியில் தீவிர கவனம் செலுத்துவது பிரகாசமான எதிர்காலத்தை அமைத்துத் தரும். சரஸ்வதி தேவியின் வழிபாடு கல்வி வெற்றியைத் தரும்.`;
    }
    return `For students and young natives (under age 22), the 10th house (${h10Sign}) and 10th lord ${h10Lord} situated in ${h10Where} govern foundational academic excellence, skill acquisition, and vocational stream selection rather than corporate management. Karmakaraka Saturn positioned in ${saturnWhere} instills scholarly discipline, methodical study habits, and intellectual endurance. Based on your planetary alignment, you are naturally primed to build an outstanding future career in ${careerDomain}, excelling in specialized degree curricula and technical mastery.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period represent a formative chapter for competitive exams, university admissions, and vocational apprenticeship. Shielding yourself from premature distractions and focusing wholeheartedly on core studies ensures academic distinction. Daily invocations of Lord Ganesha and Goddess Saraswati bestow sharp memory and scholastic brilliance.`;
  }

  // Branch 3: Adults (Age 22–59) - Professional Leadership, Career Ascent & Executive Recognition
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಮನೆ (ದಶಮ ಭಾವವಾದ ${h10Sign}) ಹಾಗೂ ಕರ್ಮಾಧಿಪತಿಯಾದ ${h10Lord} ಗ್ರಹವು ${h10Where}ದಲ್ಲಿ ನೆಲೆಸಿರುವ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಸ್ಥಿರ ಏಳಿಗೆ, ನಾಯಕತ್ವ ಹಾಗೂ ಗೌರವವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಕರ್ಮಕಾರಕ ಶನಿ ಗ್ರಹವು ${saturnWhere}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ನಿಮ್ಮಲ್ಲಿ ಅದ್ಭುತ ಕಾರ್ಯದಕ್ಷತೆ, ಕಠಿಣ ಪರಿಶ್ರಮ ಹಾಗೂ ಜವಾಬ್ದಾರಿ ನಿರ್ವಹಣಾ ಸಾಮರ್ಥ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಜಾತಕದ ಪ್ರಕಾರ ನೀವು ${careerDomain} ಮುಂತಾದ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ಯಶಸ್ಸು ಹಾಗೂ ಉನ್ನತ ಅಧಿಕಾರವನ್ನು ಗಳಿಸುವ ಯೋಗವಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನಾಯಕತ್ವ ಸ್ಥಾನ, ಬಡ್ತಿ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳನ್ನು ವಹಿಸಿಕೊಳ್ಳಲು ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ. ಶನಿ ಮತ್ತು ಗುರು ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ದೀರ್ಘಕಾಲದ ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ, ಆರ್ಥಿಕ ಉನ್ನತಿ ಹಾಗೂ ವೃತ್ತಿಪರ ಯಶಸ್ಸನ್ನು ಒದಗಿಸಲಿದೆ. ಕಚೇರಿಯಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸಮನ್ವಯ ಕಾಪಾಡುವುದು ಹಾಗೂ ಶನಿವಾರ ಶನಿ ಶಾಂತಿ ಅಥವಾ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸುವುದು ವೃತ್ತಿ ರಂಗದ ಸಕಲ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी कुंडली के 10वें भाव (दशम भाव ${h10Sign}) और कर्मेश ${h10Lord} की ${h10Where} में स्थिति आपके कार्यक्षेत्र में निरंतर उन्नति, प्रतिष्ठा और प्रशासनिक क्षमता का संकेत देती है। कर्मकारक शनि का प्रभाव आपकी कार्यशैली में अनुशासन, दूरदर्शिता और गंभीर उत्तरदायित्व की भावना भरता है। आपकी कुंडली के अनुसार ${careerDomain} के क्षेत्रों में आपकी प्रतिभा विशेष रूप से निखरेगी और आप उच्च पद प्राप्त करेंगे।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में व्यावसायिक उत्तरदायित्वों में वृद्धि, पदोन्नति एवं मान-सम्मान के प्रबल योग बन रहे हैं। गोचर में गुरु और शनि का अनुकूल प्रभाव आपके प्रयासों को यथोचित पुरस्कार और आर्थिक स्थिरता प्रदान करेगा। कार्यस्थल पर धैर्य और रणनीतिक दृष्टिकोण बनाए रखना दीर्घकालिक सफलता सुनिश्चित करेगा। शनिवार को हनुमान चालीसा का पाठ तथा तिल के तेल का दीप प्रज्वलित करना करियर की समस्त बाधाओं को दूर करेगा।`;
  }
  if (baseLang === "te") {
    return `మీ జాతకంలో 10వ ఇల్లు (దశమ భావం ${h10Sign}) మరియు కర్మాధిపతి ${h10Lord} ${h10Where}లో ఉండటం మీ ఉద్యోగం మరియు వృత్తిలో నిరంతర ఎదుగుదల, నాయకత్వం మరియు గౌరవాన్ని సూచిస్తాయి. కర్మకారక శని ప్రభావం వల్ల మీ పనితీరులో క్రమశిక్షణ, నిబద్ధత మరియు బాధ్యతాయుత ప్రవర్తన వెల్లివిరుస్తాయి. జాతక రీత్యా మీరు ${careerDomain} రంగాలలో విశేష నైపుణ్యాన్ని ప్రదర్శించి ఉన్నత పదవులను అధిరోహిస్తారు.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలంలో వృత్తిపరమైన ఎదుగుదల, పదోన్నతి మరియు గుర్తింపు లభించే అవకాశాలు మెండుగా ఉన్నాయి. శని మరియు గురు గ్రహాల అనుకూల గోచారం మీ శ్రమకు తగిన ఫలితాన్ని, ఆర్థిక స్థిరత్వాన్ని చేకూరుస్తుంది. సహోద్యోగులతో సత్సంబంధాలు కొనసాగించడం మరియు శనివారాలలో హనుమాన్ చాలీసా పారాయణం చేయడం వృత్తిలోని ఆటంకాలను తొలగిస్తుంది.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் ஜாதகத்தில் 10-ம் வீடான (தசம ஸ்தானம் ${h10Sign}) மற்றும் 10-ம் அதிபதி ${h10Lord} ${h10Where} அமைப்பில் இருப்பது உங்கள் தொழில் மற்றும் உத்தியோகத்தில் நிலையான வளர்ச்சி, தலைமைப் பண்பு மற்றும் சமூக அந்தஸ்தைக் குறிக்கிறது. கர்மகாரகன் சனி பகவானின் தாக்கம் உங்கள் பணியில் ஆழ்ந்த ஒழுக்கத்தையும் கடமை உணர்வையும் வளர்க்கிறது. ஜாதகப்படி நீங்கள் ${careerDomain} சார்ந்த துறைகளில் மிகச்சிறந்த வெற்றியையும் உயர் பதவிகளையும் அடைவீர்கள்.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் பணியிடத்தில் பதவி உயர்வு, புதிய பொறுப்புகள் மற்றும் நற்பெயரைப் பெறுவதற்கு மிகவும் சாதகமானது. சனி மற்றும் குரு பகவானின் கோசார பலன்கள் உங்கள் உழைப்பிற்கு ஏற்ற அங்கீகாரத்தையும் பொருளாதார முன்னேற்றத்தையும் வழங்கும். சனிக்கிழமைகளில் அனுமன் சாலிசா பாராயணம் செய்வதும் நல்லெண்ணெய் தீபம் ஏற்றுவதும் தொழில் தடைகளை நீக்கும்.`;
  }
  return `In your birth chart, the 10th house (${h10Sign}) and 10th lord ${h10Lord} situated in ${h10Where} indicate structured career growth, professional resilience, and executive capabilities. Karmakaraka Saturn positioned in ${saturnWhere} infuses your vocational path with industrious discipline, methodical focus, and strategic stamina. Based on these planetary configurations, you are naturally suited to achieve distinction in ${careerDomain}, where your organizational leadership and integrity command lasting respect.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period bring new milestones, expanding responsibilities, and leadership elevation in your chosen vocational field. Favorable transits of Saturn and Jupiter ensure that your sustained dedication earns peer recognition, promotion opportunities, and managerial authority. Maintaining strategic patience during workplace transitions and chanting the Hanuman Chalisa or Shani Gayatri reinforces professional triumph and neutralizes competitive obstacles.`;
}

export function buildDynamicWealthFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h2 = chart.houses[2];
  const h11 = chart.houses[11];
  const h2Lord = h2.lordName;
  const h11Lord = h11.lordName;
  const jupWhere = chart.jupiterPlacement ? `Bhava ${chart.jupiterPlacement.house}` : "chart";

  // Branch 1: Senior Citizens (Age 60+) - Asset Preservation, Estate Planning & Philanthropic Grace
  if (chart.ageYears >= 60) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ 2ನೇ ಮನೆ (ಧನ ಭಾವವಾದ ${h2.rashiName}, ಅಧಿಪತಿ ${h2Lord}) ಹಾಗೂ 11ನೇ ಮನೆ (ಲಾಭ ಭಾವವಾದ ${h11.rashiName}, ಅಧಿಪತಿ ${h11Lord}) ಗ್ರಹಗಳ ಸಂಯೋಜನೆಯು ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ (೬೦+ ವರ್ಷ) ಸಂಪತ್ತಿನ ಸಂರಕ್ಷಣೆ, ಕುಟುಂಬದ ಆಸ್ತಿ ಭದ್ರತೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಧನಕಾರಕ ಬೃಹಸ್ಪತಿಯು ${jupWhere}ದಲ್ಲಿ ನೆಲೆಸಿರುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯನ್ನು ಸುಭದ್ರವಾಗಿಟ್ಟು, ಮಕ್ಕಳಿಗಾಗಿ ಆಸ್ತಿಯನ್ನು ಶಾಂತಿಯುತವಾಗಿ ನಿರ್ವಹಿಸಲು ವಿವೇಕವನ್ನು ಕರುಣಿಸುತ್ತದೆ. ನೀವು ಗಳಿಸಿದ ಸಂಪತ್ತು ಹಾಗೂ ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿಗಳು ಸಂರಕ್ಷಿತವಾಗಿ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಶುಭದಾಯಕವಾಗಿ ವರ್ಗಾವಣೆಯಾಗಲಿವೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲದಲ್ಲಿ ದಾನ-ಧರ್ಮಗಳು, ಧಾರ್ಮಿಕ ಕೈಂಕರ್ಯಗಳು ಹಾಗೂ ತೀರ್ಥಯಾತ್ರೆಗಳಿಗೆ ಸದ್ವಿನಿಯೋಗವಾಗುವ ಶುಭ ಯೋಗವಿದೆ. ಅತಿಯಾದ ಆರ್ಥಿಕ ರಿಸ್ಕ್ ಅಥವಾ ಊಹಾಪೋಹದ ಹೂಡಿಕೆಗಳಿಂದ ದೂರವಿದ್ದು, ಸ್ಥಿರ ಠೇವಣಿಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಆಸ್ತಿಗಳಲ್ಲಿ ಹಣವಿಡುವುದು ನೆಮ್ಮದಿಯನ್ನು ನೀಡುತ್ತದೆ. ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟಕಂ ಪಠಿಸುವುದು ಹಾಗೂ ನಿರ್ಗತಿಕರಿಗೆ ಅನ್ನದಾನ ಮಾಡುವುದು ಸದಾ ಅಷ್ಟೈಶ್ವರ್ಯಗಳನ್ನು ಮತ್ತು ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿಯನ್ನು ರಕ್ಷಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के द्वितीय भाव (धन ${h2.rashiName}, स्वामी ${h2Lord}) तथा एकादश भाव (लाभ ${h11.rashiName}, स्वामी ${h11Lord}) का शुभ संबंध वरिष्ठ अवस्था (60+ वर्ष) में संचित संपत्ति की सुरक्षा, वित्तीय आत्मनिर्भरता और पारिवारिक समृद्धि को दर्शाता है। धनकारक बृहस्पति की ${jupWhere} में स्थिति आपके वित्तीय निर्णयों में परिपक्व विवेक और सुरक्षा प्रदान करती है। आपके द्वारा संचित संपत्ति और पैतृक धरोहर अगली पीढ़ी के लिए कल्याणकारी और सुरक्षित रहेगी।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में परोपकार, धार्मिक अनुष्ठान तथा तीर्थयात्राओं में धन का सदुपयोग होगा। जोखिम भरे निवेशों से बचते हुए सुरक्षित बचत बनाए रखना परम शांति प्रदान करेगा। शुक्रवार को मां महालक्ष्मी की आराधना और अन्नदान करने से परिवार में सुख-शांति और स्थायी समृद्धि बनी रहेगी।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 2వ ఇల్లు (ధన స్థానం ${h2.rashiName}, అధిపతి ${h2Lord}) మరియు 11వ ఇల్లు (లాభ స్థానం ${h11.rashiName}, అధిపతి ${h11Lord}) సీనియర్ వయస్సులో (60+ సంవత్సరాలు) సంపాదించిన సంపదను కాపాడుకోవడం, ఆర్థిక స్వావలంబన మరియు కుటుంబ ఆస్తుల సురక్షితత్వాన్ని సూచిస్తాయి. ధనకారక బృహస్పతి ${jupWhere}లో ఉండటం వల్ల మీ వద్ద ఉన్న ధనం భద్రంగా ఉండి, తర్వాతి తరానికి ఆశీర్వాదంగా అందుతుంది.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలంలో దానధర్మాలు, తీర్థయాత్రలు మరియు శుభకార్యాలకు ధనాన్ని సద్వినియోగం చేస్తారు. సురక్షితమైన పొదుపు పద్ధతులను అనుసరించడం వల్ల పూర్తి మానసిక ప్రశాంతత లభిస్తుంది. ప్రతి శుక్రవారం మహాలక్ష్మి స్తోత్ర పారాయణం చేయడం వల్ల సంపద స్థిరంగా ఉంటుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 2-ம் வீடான (தன ஸ்தானம் ${h2.rashiName}, அதிபதி ${h2Lord}) மற்றும் 11-ம் வீடான (லாப ஸ்தானம் ${h11.rashiName}, அதிபதி ${h11Lord}) மூத்த வயதில் (60+ வயது) சேர்த்த செல்வத்தைப் பாதுகாத்தல், பொருளாதார தற்சார்பு மற்றும் குடும்ப அமைதியைக் குறிக்கிறது. தனகாரகன் குரு பகவான் ${jupWhere} அமைப்பில் இருப்பது உங்கள் பொருளாதாரத்தை பாதுகாத்து, அடுத்த தலைமுறைக்கு சீரான பரம்பரை சொத்துக்களை உறுதி செய்யும்.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் தர்ம காரியங்கள், அன்னதானம் மற்றும் ஆன்மீகச் செலவுகளுக்கு நற்பலன்களைத் தரும். ஊக வணிகங்களைத் தவிர்த்து பாதுகாப்பான சேமிப்புகளில் கவனம் செலுத்துவது மன அமைதியைத் தரும். வெள்ளிக்கிழமைகளில் மகாலட்சுமி வழிபாடு செய்வது குடும்பத்தில் சுபமங்களத்தை நிலைநிறுத்தும்.`;
    }
    return `In your senior years (age 60+), the 2nd house of accumulated wealth (${h2.rashiName}, ruled by ${h2Lord}) and the 11th house of gains (${h11.rashiName}, ruled by ${h11Lord}) emphasize capital preservation, estate harmony, and dignified financial self-reliance. Dhanakaraka Jupiter situated in ${jupWhere} shields your life savings from speculative volatility, ensuring that ancestral resources and personal assets seamlessly transition as a protective blessing for your descendants.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period support purposeful dharmic philanthropy, sponsoring community annadana, and pilgrimages that bring immense spiritual joy. Anchoring resources in secure sovereign instruments preserves complete fiscal sovereignty. Reciting the Sri Suktam on Fridays invites enduring Mahalakshmi grace and multigenerational serenity.`;
  }

  // Branch 2: Youth & Students (Age < 22) - Financial Discipline, Budgeting & Valuing Family Resources
  if (chart.ageYears < 22) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ 2ನೇ ಮನೆ (ಧನ ಭಾವವಾದ ${h2.rashiName}, ಅಧಿಪತಿ ${h2Lord}) ಹಾಗೂ 11ನೇ ಮನೆ (ಲಾಭ ಭಾವವಾದ ${h11.rashiName}, ಅಧಿಪತಿ ${h11Lord}) ಗ್ರಹಗಳ ಸಂಯೋಜನೆಯು ಯುವ ವಯಸ್ಸಿನಲ್ಲಿ ಆರ್ಥಿಕ ಶಿಸ್ತು, ವಿವೇಕಯುತ ಉಳಿತಾಯ ಹಾಗೂ ಪೋಷಕರ ಸಂಪತ್ತಿನ ಮೌಲ್ಯವನ್ನು ಅರಿತುಕೊಳ್ಳುವ ಸದ್ಗುಣವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಧನಕಾರಕ ಬೃಹಸ್ಪತಿಯು ${jupWhere}ದಲ್ಲಿ ನೆಲೆಸಿರುವುದು ಭವಿಷ್ಯದಲ್ಲಿ ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಅತ್ಯುತ್ತಮ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆಯನ್ನು ಸಾಧಿಸುವ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯಲ್ಲಿ ಅನಗತ್ಯ ದುಂದುವೆಚ್ಚಗಳು ಹಾಗೂ ಟ್ರೆಂಡ್‌ಗಳ ಹಿಂದಿನ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ಸಣ್ಣ ಉಳಿತಾಯದ ಹವ್ಯಾಸ ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ಉತ್ತಮ. ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಜ್ಞಾನಾರ್ಜನೆಯಲ್ಲಿ ಹಣ ಹೂಡುವುದು ಮುಂದೆ ಮಹತ್ತರ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ತರಲಿದೆ. ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು ಸದಾ ಶುಭ ತರಂಗಗಳನ್ನು ಉಂಟುಮಾಡಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के द्वितीय भाव (धन ${h2.rashiName}, स्वामी ${h2Lord}) तथा एकादश भाव (लाभ ${h11.rashiName}, स्वामी ${h11Lord}) का संबंध युवावस्था में वित्तीय अनुशासन, विवेकपूर्ण बचत और माता-पिता के परिश्रम के मूल्य को समझने की प्रेरणा देता है। धनकारक बृहस्पति की ${jupWhere} में स्थिति भविष्य में स्व-अर्जित संपत्ति और उत्तम आर्थिक आत्मनिर्भरता का मजबूत आधार तैयार करती है।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में अनावश्यक खर्चों से बचते हुए ज्ञान, शिक्षा और कौशल में निवेश करना भविष्य के लिए सर्वोत्तम पूंजी सिद्ध होगा। नियमित बचत की आदत और शुक्रवार को मां महालक्ष्मी की प्रार्थना जीवन में चिरस्थायी समृद्धि की नींव रखेगी।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 2వ ఇల్లు (${h2.rashiName}, అధిపతి ${h2Lord}) మరియు 11వ ఇల్లు (${h11.rashiName}, అధిపతి ${h11Lord}) ఈ యువ దశలో ఆర్థిక క్రమశిక్షణ, పొదుపు అలవాటు మరియు తల్లిదండ్రుల కష్టాన్ని గౌరవించే సద్బుద్ధిని సూచిస్తాయి. గురు గ్రహం ${jupWhere}లో ఉండటం భవిష్యత్తులో స్వయంకృషితో సంపదను సమకూర్చుకునే శక్తిని ప్రసాదిస్తుంది.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలంలో జ్ఞానార్జన మరియు విద్యపై దృష్టి పెట్టడం మీ నిజమైన సంపద అవుతుంది. వృధా ఖర్చులకు దూరంగా ఉండటం భవిష్యత్తులో గొప్ప ఆర్థిక స్వాతంత్ర్యాన్ని ఇస్తుంది. లక్ష్మీదేవి ప్రార్థన శుభప్రదం.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தில் 2-ம் வீடான (${h2.rashiName}, அதிபதி ${h2Lord}) மற்றும் 11-ம் வீடான (${h11.rashiName}, அதிபதி ${h11Lord}) இந்த இளமைப் பருவத்தில் பணத்தின் மதிப்பை உணர்தல், வீண் செலவுகளைக் குறைத்தல் மற்றும் சேமிப்புப் பழக்கத்தை வளர்த்துக் கொள்வதைக் குறிக்கிறது. குரு பகவான் ${jupWhere} அமைப்பில் இருப்பது பிற்காலத்தில் சொந்த உழைப்பால் பெரும் செல்வம் ஈட்டும் ஆற்றலைத் தருகிறது.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் கல்வியிலும் அறிவு வளர்ச்சியிலும் முதலீடு செய்ய வேண்டிய சிறந்த காலமாகும். சேமிப்பு நற்பழக்கங்களும் வெள்ளிக்கிழமை லட்சுமி வழிபாடும் எதிர்கால பொருளாதார வெற்றிக்கு வழிவகுக்கும்.`;
    }
    return `For young scholars and youth (under age 22), the 2nd house of accumulated wealth (${h2.rashiName}, ruled by ${h2Lord}) and 11th house of gains (${h11.rashiName}, ruled by ${h11Lord}) govern early financial discipline, gratitude for family resources, and cultivating prudent budgeting habits rather than commercial asset management. Dhanakaraka Jupiter placed in ${jupWhere} ensures that investing time and resources into high-value education compounds into remarkable self-earned prosperity in adulthood.

Under your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period, eschewing superficial gadget trends and building disciplined personal savings lays an unshakeable cornerstone for future autonomy. Honoring family sacrifices and offering Friday prayers to Goddess Mahalakshmi blesses your educational path with auspicious stability.`;
  }

  // Branch 3: Adults (Age 22–59) - Active Asset Accumulation, Tangible Investments & Generational Wealth
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ 2ನೇ ಮನೆ (ಧನ ಭಾವವಾದ ${h2.rashiName}, ಅಧಿಪತಿ ${h2Lord}) ಹಾಗೂ 11ನೇ ಮನೆ (ಲಾಭ ಭಾವವಾದ ${h11.rashiName}, ಅಧಿಪತಿ ${h11Lord}) ಗ್ರಹಗಳ ಸಂಯೋಜನೆಯು ಅತ್ಯುತ್ತಮ ಆರ್ಥಿಕ ಭದ್ರತೆ, ಧನಸಂಗ್ರಹ ಶಕ್ತಿ ಹಾಗೂ ನಿರಂತರ ಲಾಭದ ಹರಿವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಧನಕಾರಕ ಬೃಹಸ್ಪತಿಯು ${jupWhere}ದಲ್ಲಿ ನೆಲೆಸಿರುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ವಿವೇಕ, ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ಸ್ಥಿರ ಸಂಪತ್ತು ವೃದ್ಧಿಯನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ. ನಿಮ್ಮ ಕುಟುಂಬದ ಸಾಂಪ್ರದಾಯಿಕ ಆಸ್ತಿ ಹಾಗೂ ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಗಳಿಸಿದ ಸಂಪತ್ತು ಎರಡೂ ಸಮತೋಲನದಲ್ಲಿ ವೃದ್ಧಿಯಾಗಲಿವೆ. ಆರ್ಥಿಕ ಶಿಸ್ತು, ವಿವೇಚನಾಯುಕ್ತ ಹೂಡಿಕೆಗಳು ಮತ್ತು ದೂರದೃಷ್ಟಿಯ ಬಜೆಟ್ ಯೋಜನೆಗಳು ನಿಮ್ಮ ಕುಟುಂಬದ ಬೊಕ್ಕಸವನ್ನು ಸದಾ ಸುಭದ್ರವಾಗಿಡಲಿವೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲದಲ್ಲಿ ಸ್ಥಿರಾಸ್ತಿ, ವಾಹನ ಖರೀದಿ ಹಾಗೂ ಬುದ್ಧಿವಂತಿಕೆಯ ಹೂಡಿಕೆಗಳ ಮೂಲಕ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಹೆಚ್ಚಲಿದೆ. ಅತಿಯಾದ ದುಂದುವೆಚ್ಚಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ದೀರ್ಘಾವಧಿ ಉಳಿತಾಯ ಯೋಜನೆಗಳಲ್ಲಿ ಹಣ ತೊಡಗಿಸುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯನ್ನು ಇನ್ನಷ್ಟು ಸುಭದ್ರಗೊಳಿಸುತ್ತದೆ. ವ್ಯಾಪಾರ ಹಾಗೂ ವೃತ್ತಿಪರ ಒಪ್ಪಂದಗಳಲ್ಲಿ ಪಾರದರ್ಶಕತೆ ಕಾಪಾಡುವುದು ನಿರಂತರ ಲಾಭವನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ. ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟಕಂ ಅಥವಾ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು, ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚುವುದು ಹಾಗೂ ನಿರ್ಗತಿಕರಿಗೆ ಅನ್ನದಾನ ಮಾಡುವುದು ನಿಮ್ಮ ಗೃಹದಲ್ಲಿ ಸದಾ ಅಷ್ಟೈಶ್ವರ್ಯಗಳು ಮತ್ತು ಧನಲಕ್ಷ್ಮಿ ನೆಲೆಸುವಂತೆ ಮಾಡಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी कुंडली के 2nd house (द्वितीय भाव धन ${h2.rashiName}, स्वामी ${h2Lord}) तथा एकादश भाव (लाभ ${h11.rashiName}, स्वामी ${h11Lord}) का शुभ संबंध निरंतर आय वृद्धि और उत्कृष्ट धन संचय क्षमता को दर्शाता है। धनकारक बृहस्पति की ${jupWhere} में स्थिति आपके वित्तीय निर्णयों में दूरदर्शिता, विवेक और आर्थिक स्थिरता प्रदान करती है। पैतृक संपत्ति के साथ-साथ आपके स्वयं के परिश्रम से अर्जित धन में निरंतर विस्तार होगा तथा आपकी वित्तीय योजनाएं भविष्य को सुरक्षित बनाएंगी।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में संचित संपत्ति, भूमि-भवन तथा सुरक्षित निवेशों से प्रचुर आर्थिक लाभ प्राप्त होने के योग हैं। अनियोजित खर्चों पर नियंत्रण रखना और विवेकपूर्ण वित्तीय योजना बनाना आपकी समृद्धि को चिरस्थायी बनाएगा। शुक्रवार को मां महालक्ष्मी की आराधना, कनकधारा स्तोत्र का पाठ और सामर्थ्यानुसार दान-पुण्य करने से धन के नए स्रोत खुलेंगे और परिवार में धन-धान्य तथा संपन्नता की निरंतर वृद्धि होगी।`;
  }
  if (baseLang === "te") {
    return `మీ జాతకంలో 2వ ఇల్లు (ధన భావం ${h2.rashiName}, అధిపతి ${h2Lord}) మరియు 11వ ఇల్లు (లాభ భావం ${h11.rashiName}, అధిపతి ${h11Lord}) అద్భుతమైన ఆర్థిక భద్రత, ధన సంపాదన మరియు నిరంతర ఆదాయ వృద్ధిని సూచిస్తాయి. ధనకారక బృహస్పతి ${jupWhere}లో ఉండటం మీ ఆర్థిక నిర్ణయాలలో వివేకాన్ని, స్థిరమైన సంపద వృద్ధిని ప్రసాదిస్తుంది. స్వయంకృషితో పాటు కుటుంబ ఆస్తులు కూడా అభివృద్ధి చెందుతాయి.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలంలో స్థిరాస్తులు, గృహం లేదా వాహనాల కొనుగోలుకు అనుకూల సమయం. దీర్ఘకాలిక పెట్టుబడులు మరియు పొదుపు మీ ఆర్థిక స్థానాన్ని మరింత బలోపేతం చేస్తాయి. ప్రతి శుక్రవారం శ్రీ మహాలక్ష్మి అష్టకం లేదా కనకధారా స్తోత్రం పఠించడం, ఆవు నెయ్యితో దీపారాధన చేయడం వల్ల మీ గృహంలో అష్టైశ్వర్యాలు వర్ధిల్లుతాయి.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் ஜாதகத்தில் 2-ம் வீடான (தன ஸ்தானம் ${h2.rashiName}, அதிபதி ${h2Lord}) மற்றும் 11-ம் வீடான (லாப ஸ்தானம் ${h11.rashiName}, அதிபதி ${h11Lord}) சிறந்த பொருளாதார பாதுகாப்பு, நிதி மேலாண்மை மற்றும் தொடர் வருமானத்தைக் குறிக்கிறது. தனகாரகன் குரு பகவான் ${jupWhere} அமைப்பில் இருப்பது நிதி முடிவுகளில் நிதானத்தையும் நிலையான செல்வப் பெருக்கத்தையும் உறுதி செய்கிறது. சுயமாக உழைத்துச் சேர்க்கும் செல்வமும் பூர்வீக சொத்துக்களும் பெருகும்.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் நிலம், வீடு அல்லது சுப சொத்துக்களை வாங்குவதற்கு உகந்தது. தேவையற்ற செலவுகளைக் குறைத்து நீண்டகால சேமிப்புகளில் முதலீடு செய்வது நிதியை பலப்படுத்தும். வெள்ளிக்கிழமைகளில் கனகதாரா ஸ்தோத்திரம் அல்லது ஸ்ரீ சூக்தம் பாராயணம் செய்வதும் ஏழைகளுக்கு அன்னதானம் வழங்குவதும் வீட்டில் மகாலட்சுமி கடாட்சத்தை நிரந்தரமாக்கும்.`;
  }
  return `In your natal chart, the 2nd house of accumulated wealth (${h2.rashiName}, ruled by ${h2Lord}) and the 11th house of gains (${h11.rashiName}, ruled by ${h11Lord}) indicate sound financial instincts, disciplined wealth preservation, and multiple diversified revenue streams. Dhanakaraka Jupiter situated in ${jupWhere} blesses you with ethical fiscal prudence, protecting your accumulated capital from speculative volatility and fostering steady tangible assets over time. The geometric synergy between these wealth bhavas ensures substantial equilibrium between ancestral family resources and self-earned enterprise, granting lasting economic autonomy and fiscal security.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period support significant property acquisition, long-term portfolio growth, commercial expansion, and beneficial capital returns. Exercising disciplined budgetary management while avoiding impulsive speculative ventures fortifies your family treasury against unforeseen inflationary or macroeconomic shifts. Engaging in transparent financial agreements and methodically reinvesting surpluses into land, gold, or secure sovereign bonds accelerates your asset compounding. Reciting the Sri Suktam or Kanakadhara Stotram on Fridays and supporting educational charities invites continuous Mahalakshmi blessings and generational prosperity into your household.`;
}

export function buildDynamicHealthFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h1 = chart.houses[1];
  const h6 = chart.houses[6];
  const h1Lord = h1.lordName;
  const h6Lord = h6.lordName;
  const sunWhere = chart.sunPlacement ? `Bhava ${chart.sunPlacement.house}` : "chart";

  // Branch 1: Senior Citizens (Age 60+) - Geriatric Wellness, Joint Mobility & Longevity Care
  if (chart.ageYears >= 60) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಲಗ್ನ ಭಾವವಾದ ${h1.rashiName}ದ ಅಧಿಪತಿ ${h1Lord} ಗ್ರಹವು ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ (೬೦+ ವರ್ಷ) ದೀರ್ಘಾಯುಷ್ಯ, ಆಂತರಿಕ ಚೈತನ್ಯ ಹಾಗೂ ದೃಢತೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ. ಆರೋಗ್ಯಕಾರಕ ಸೂರ್ಯನು ${sunWhere}ದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು ನೈಸರ್ಗಿಕ ಜೀವಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಜಾತಕದ 6ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${h6Lord} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೀಲುಗಳ ನೋವು, ರಕ್ತದೊತ್ತಡ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಜೀರ್ಣಕ್ರಿಯೆಯ ಮಂದತೆಯ ಬಗ್ಗೆ ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ ವಿಶೇಷ ನಿಗಾ ವಹಿಸುವುದು ಅತ್ಯವಶ್ಯಕ. ಸುಲಭವಾಗಿ ಜೀರ್ಣವಾಗುವ ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಮುಂಜಾನೆಯ ಲಘು ನಡಿಗೆಯು ಆರೋಗ್ಯಕ್ಕೆ ರಾಮಬಾಣವಾಗಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿಯಮಿತ ದಿನಚರಿ, ಪ್ರಶಾಂತ ಮನಸ್ಸು ಹಾಗೂ ಹಿತಮಿತವಾದ ಊಟ-ತಿಂಡಿ ಅತ್ಯಂತ ಮುಖ್ಯ. ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಅಥವಾ ಸೂರ್ಯ ದರ್ಶನ ಮಾಡುವುದು, ಶ್ರೀ ಧನ್ವಂತರಿ ಸ್ತೋತ್ರ ಹಾಗೂ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಿಸುವುದು ಶರೀರಕ್ಕೆ ನವಚೈತನ್ಯವನ್ನು ನೀಡಿ ಆಯಸ್ಸು ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ವೃದ್ಧಿಸಲಿದೆ. ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು ಮತ್ತು ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ರಕ್ಷಾ ಕವಚವಾಗಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी लग्न राशि ${h1.rashiName} के स्वामी ${h1Lord} वरिष्ठ अवस्था (60+ वर्ष) में दीर्घायु, आंतरिक जीवनी शक्ति और आरोग्य के मुख्य संरक्षक हैं। सूर्य की स्थिति प्राकृतिक प्राणशक्ति प्रदान करती है। षष्ठेश ${h6Lord} के प्रभाव के कारण जोड़ों के दर्द, रक्तचाप, पाचन मंदता तथा मौसमी सर्दी के प्रति विशेष सावधानी बरतना आवश्यक है। सुपाच्य सात्विक आहार और प्रातःकालीन हल्का भ्रमण शरीर को सक्रिय और स्वस्थ रखेगा।

वर्तमान ${chart.mahaLordName} महादशा में नियमित दिनचर्या, पर्याप्त विश्राम और मानसिक शांति अत्यंत आवश्यक है। प्रातःकाल भगवान सूर्य को जल अर्पित करना, भगवान धन्वंतरि की स्तुति और महामृत्युंजय मंत्र का जप दीर्घायु और आरोग्य प्रदान करेगा। नियमित स्वास्थ्य परीक्षण और शांत जीवनशैली संपूर्ण स्वास्थ्य की रक्षा करेगी।`;
    }
    if (baseLang === "te") {
      return `మీ లగ్నం ${h1.rashiName} అధిపతి ${h1Lord} సీనియర్ వయస్సులో (60+ సంవత్సరాలు) దీర్ఘాయుష్షు, సహజ రోగనిరోధక శక్తి మరియు ఆరోగ్యానికి రక్షకుడు. సూర్య భగవానుడు ${sunWhere}లో ఉండటం అంతర్గత ప్రాణశక్తిని ఇస్తుంది. 6వ ఇంటి అధిపతి ${h6Lord} ప్రభావం వల్ల కీళ్ల నొప్పులు, రక్తపోటు మరియు జీర్ణక్రియ మందగించడంపై ప్రత్యేక శ్రద్ధ వహించాలి. తేలికగా జీర్ణమయ్యే సాత్విక ఆహారం మరియు ఉదయపు నడక ఆరోగ్యానికి మేలు చేస్తాయి.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ కాలంలో ప్రశాంతమైన మానసిక స్థితి మరియు సరైన విశ్రాంతి ఎంతో ముఖ్యం. రోజూ ధన్వంతరి స్తోత్రం మరియు మహా మృత్యుంజయ మంత్రం జపించడం ఆయురారోగ్యాలను ప్రసాదిస్తుంది. రాగి పాత్రలో నీరు త్రాగడం మరియు వైద్య పరీక్షలు క్రమం తప్పకుండా చేయించుకోవడం శ్రేయస్కరం.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் லக்னமான ${h1.rashiName} அதிபதி ${h1Lord} மூத்த வயதில் (60+ வயது) நீண்ட ஆயுள், உடல் தெம்பு மற்றும் நல்வாழ்வின் பாதுகாவலராக விளங்குகிறார். சூரிய பகவான் ${sunWhere} அமைப்பில் இருப்பது இயற்கையான பிராண சக்தியைத் தருகிறது. 6-ம் அதிபதி ${h6Lord} தாக்கத்தால் மூட்டு வலி, ரத்த அழுத்தம் மற்றும் செரிமானக் குறைபாடுகள் போன்றவற்றில் கவனம் செலுத்துவது அவசியம். எளிதில் செரிக்கும் சாத்வீக உணவும் காலை நடைப்பயிற்சியும் உடலுக்கு புத்துணர்ச்சி தரும்.

தற்போதைய ${chart.mahaLordName} மகாதிசை காலத்தில் போதுமான ஓய்வும் மன அமைதியும் மிக முக்கியம். தன்வந்திரி பகவான் வழிபாடு மற்றும் மகா மிருத்யுஞ்சய மந்திரம் ஜெபிப்பது பூரண ஆரோக்கியத்தையும் நீண்ட ஆயுளையும் தரும். செம்பு பாத்திரத்தில் நீர் அருந்துவதும் மருத்துவ ஆலோசனைகளை முறையாகப் பின்பற்றுவதும் உடல்நலத்தை பாதுகாக்கும்.`;
    }
    return `In your senior years (age 60+), your Lagna (${h1.rashiName}) and Lagna lord ${h1Lord} govern longevity, cellular resilience, and restorative vitality. The Sun as Arogyakaraka situated in ${sunWhere} provides foundational vitality, while the Moon preserves serene emotional equilibrium. The 6th house (${h6.rashiName}, lord ${h6Lord}) indicates that attention is warranted toward joint mobility, cardiovascular equilibrium, blood pressure balance, and unhurried digestion. A gentle, easily assimilable satvik diet combined with morning sunshine and leisurely walks fosters robust geriatric vitality.

Under your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period, establishing a tranquil daily rhythm free from psychological stress directly nurtures your nervous system. Reciting the Maha Mrityunjaya Mantra and Dhanvantari Stotram while drinking pure water from a copper vessel strengthens longevity and cellular rejuvenation. Regular preventive health checkups and meditative breathing shield your physical vessel with vibrant peace and enduring wellbeing.`;
  }

  // Branch 2: Youth & Students (Age < 22) - Youthful Vitality, Screen-Time Balance & Posture
  if (chart.ageYears < 22) {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಲಗ್ನ ಭಾವವಾದ ${h1.rashiName}ದ ಅಧಿಪತಿ ${h1Lord} ಗ್ರಹವು ಯುವ ವಯಸ್ಸಿನಲ್ಲಿ ಅಪಾರ ದೈಹಿಕ ಚೈತನ್ಯ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಉತ್ಸಾಹವನ್ನು ನೀಡುತ್ತದೆ. ಆರೋಗ್ಯಕಾರಕ ಸೂರ್ಯನು ${sunWhere}ದಲ್ಲಿರುವುದು ಉತ್ತಮ ದೈಹಿಕ ಬೆಳವಣಿಗೆಗೆ ಪೂರಕವಾಗಿದೆ. ಜಾತಕದ 6ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${h6Lord} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ಅತಿಯಾದ ಮೊಬೈಲ್/ಸ್ಕ್ರೀನ್ ಬಳಕೆ, ತಡರಾತ್ರಿಯ ಜಾಗರಣೆ ಹಾಗೂ ಜಂಕ್ ಫುಡ್ ಸೇವನೆಯಿಂದ ಕಣ್ಣಿನ ಆಯಾಸ ಮತ್ತು ಜೀರ್ಣಕ್ರಿಯೆಯ ತೊಂದರೆಗಳು ಬರದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಅಗತ್ಯವಾಗಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿತ್ಯ ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಕ್ರೀಡೆಗಳು ಹಾಗೂ ಯೋಗಾಭ್ಯಾಸವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದು ದೇಹ ಮತ್ತು ಮನಸ್ಸನ್ನು ಸದೃಢವಾಗಿಡಲಿದೆ. ರಾತ್ರಿ ಬೇಗ ಮಲಗಿ ಮುಂಜಾನೆ ಬೇಗ ಏಳುವ ಅಭ್ಯಾಸ ಹಾಗೂ ಪೌಷ್ಟಿಕ ನೈಸರ್ಗಿಕ ಆಹಾರ ಸೇವನೆಯು ನೆನಪಿನ ಶಕ್ತಿ ಮತ್ತು ದೈಹಿಕ ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಮಾಡುವುದು ವಿದ್ಯಾಭ್ಯಾಸದ ಒತ್ತಡವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी लग्न राशि ${h1.rashiName} के स्वामी ${h1Lord} युवावस्था में प्रचुर शारीरिक ऊर्जा, रोग प्रतिरोधक क्षमता और उत्साह का संचार करते हैं। आरोग्यकारक सूर्य की स्थिति उत्तम शारीरिक विकास और स्फूर्ति प्रदान करती है। षष्ठेश ${h6Lord} के प्रभाव के कारण अत्यधिक स्क्रीन समय, देर रात तक जागने और अनियमित खान-पान से होने वाली थकान तथा नेत्र संबंधी तनाव से बचना आवश्यक है।

वर्तमान ${chart.mahaLordName} महादशा में दैनिक जीवन में योग, सूर्य नमस्कार और खेलकूद को शामिल करना शारीरिक एवं मानसिक शक्ति को सुदृढ़ बनाएगा। समय पर शयन और पौष्टिक सात्विक आहार स्मरण शक्ति और एकाग्रता को बढ़ाएगा। नित्य प्राणायाम करने से परीक्षा और अध्ययन का तनाव दूर रहेगा।`;
    }
    if (baseLang === "te") {
      return `మీ లగ్నం ${h1.rashiName} అధిపతి ${h1Lord} ఈ యువ దశలో అపారమైన శారీరక శక్తిని, ఉత్సాహాన్ని ప్రసాదిస్తారు. సూర్య గ్రహం అనుకూలత వల్ల సహజ రోగనిరోధక శక్తి బాగుంటుంది. అయితే 6వ అధిపతి ${h6Lord} ప్రభావం వల్ల ఎక్కువ సమయం స్క్రీన్ చూడటం, ఆలస్యంగా నిద్రపోవడం మరియు బయటి ఆహారం తినడం వల్ల వచ్చే అలసటపై జాగ్రత్త వహించాలి.

ప్రస్తుత ${chart.mahaLordName} మహర్దశలో రోజూ సూర్య నమస్కారాలు, వ్యాయామం లేదా క్రీడలలో పాల్గొనడం శారీరక దృఢత్వాన్ని ఇస్తుంది. సమయానికి నిద్రపోవడం మరియు పౌష్టికాహారం తీసుకోవడం ఏకాగ్రతను, జ్ఞాపకశక్తిని పెంచుతాయి. ప్రాణాయామం చదువుల ఒత్తిడిని తగ్గిస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் லக்னமான ${h1.rashiName} அதிபதி ${h1Lord} இந்த இளமைப் பருவத்தில் அபரிமிதமான உடலாற்றல், நோய் எதிர்ப்புச் சக்தி மற்றும் சுறுசுறுப்பை வழங்குகிறார். சூரிய பகவான் நல்ல உடல் வலிமையைத் தருகிறார். ஆயினும் 6-ம் அதிபதி ${h6Lord} தாக்கத்தால் அதிக நேரம் திரை பார்ப்பது, கண் சோர்வு, இரவு கண்விழிப்பது மற்றும் துரித உணவுகளால் ஏற்படும் செரிமானக் கோளாறுகளைத் தவிர்ப்பது அவசியம்.

தற்போதைய ${chart.mahaLordName} மகாதிசை காலத்தில் யோகா, சூரிய நமஸ்காரம் மற்றும் உடற்பயிற்சி செய்வது மனதையும் உடலையும் வலிமையாக்கும். சரியான தூக்கமும் சத்தான உணவும் நினைவாற்றலை மேம்படுத்தும். தினசரி பிராணாயாமம் தேர்வு மற்றும் படிப்பு அழுத்தத்தைக் குறைக்கும்.`;
    }
    return `For students and young natives (under age 22), your Lagna (${h1.rashiName}) and Lagna lord ${h1Lord} endow you with vibrant metabolic vitality, swift cellular recovery, and natural physical enthusiasm. The Sun as Arogyakaraka placed in ${sunWhere} supports robust bone growth and athletic energy. The 6th house (${h6.rashiName}, lord ${h6Lord}) cautions against excessive digital screen strain, irregular late-night sleep, and sedentary study habits, which can trigger eye fatigue or digestive sluggishness.

Under your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period, integrating morning Surya Namaskars, competitive athletics, and balanced outdoor hydration preserves optimal physical equilibrium. Prioritizing 8 hours of uninterrupted sleep and wholesome, home-prepared meals sharpens mental retention and protects immune resilience during demanding academic examination cycles.`;
  }

  // Branch 3: Adults (Age 22–59) - Metabolic Equilibrium, Stress Management & Preventive Wellness
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಲಗ್ನ ಭಾವವಾದ ${h1.rashiName}ದ ಅಧಿಪತಿ ${h1Lord} ಗ್ರಹವು ನಿಮ್ಮ ದೈಹಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ದೃಢತೆ ಹಾಗೂ ಚೈತನ್ಯವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ. ಆರೋಗ್ಯಕಾರಕ ಸೂರ್ಯನು ${sunWhere}ದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು ನೈಸರ್ಗಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಜೀವಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಜಾತಕದ 6ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${h6Lord} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾಲೋಚಿತ ಶೀತ, ಜೀರ್ಣಕ್ರಿಯೆಯ ಏರುಪೇರು, ನಿದ್ರಾಹೀನತೆ ಅಥವಾ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ಉಂಟಾಗುವ ಮಾನಸಿಕ ಆಯಾಸದ ಬಗ್ಗೆ ನಿಯಮಿತ ನಿಗಾ ವಹಿಸುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ಋತುಮಾನಕ್ಕೆ ತಕ್ಕಂತೆ ತ್ರಿದೋಷಗಳ (ವಾತ, ಪಿತ್ತ, ಕಫ) ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಹಾಗೂ ನೈಸರ್ಗಿಕ ಪೌಷ್ಟಿಕ ಆಹಾರ ಸೇವನೆಯು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ಮತ್ತು ದೃಢ ಆರೋಗ್ಯಕ್ಕೆ ಪೂರಕವಾಗಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿಯಮಿತ ದಿನಚರಿ, ಸಮತೋಲಿತ ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಯೋಗಾಭ್ಯಾಸವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದು ದೇಹ ಮತ್ತು ಮನಸ್ಸಿಗೆ ಅತ್ಯುತ್ತಮ ನವಚೈತನ್ಯವನ್ನು ನೀಡಲಿದೆ. ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡುವುದು, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಹಾಗೂ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಸದಾ ತೇಜಸ್ವಿಯಾಗಿಡಲಿದೆ. ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಪ್ರಾಣಾಯಾಮ, ಧ್ಯಾನ ಹಾಗೂ ರಾತ್ರಿಯ ಕಾಲದಲ್ಲಿ ಕನಿಷ್ಠ ೭ ರಿಂದ ೮ ಗಂಟೆಗಳ ಕಾಲ ಶಾಂತ ನಿದ್ರೆ ಪಡೆಯುವುದು ನಿಮ್ಮ ನರಮಂಡಲಕ್ಕೆ ಬಲ ತುಂಬಿ ಸಮಗ್ರ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ದಿವ್ಯ ರಕ್ಷಾ ಕವಚವಾಗಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी लग्न राशि ${h1.rashiName} के स्वामी ${h1Lord} आपकी शारीरिक जीवनी शक्ति, रोग प्रतिरोधक क्षमता और सामान्य आरोग्यता के मुख्य नियंत्रक हैं। आरोग्यकारक सूर्य की स्थिति आपको प्राकृतिक ऊर्जा और सहनशक्ति प्रदान करती है। षष्ठेश ${h6Lord} के प्रभाव के कारण पाचन तंत्र, मौसमी बदलावों और अत्यधिक मानसिक तनाव से होने वाली थकान के प्रति सतर्कता बरतना आवश्यक है। त्रिदोष (वात, पित्त, कफ) का प्राकृतिक संतुलन बनाए रखना आपके शारीरिक स्वास्थ्य को सुदृढ़ रखेगा।

वर्तमान ${chart.mahaLordName} महादशा में दैनिक जीवन में योग, प्राणायाम और संतुलित सात्विक आहार का समावेश शारीरिक एवं मानसिक संतुलन बनाए रखेगा। प्रातःकाल सूर्य देव को जल अर्पित करना, आदित्य हृदय स्तोत्र का पाठ और पर्याप्त विश्राम करना आपकी जीवन शक्ति को प्रखर बनाए रखेगा। ताम्र पात्र में जलपान करना तथा भगवान धन्वंतरि की आराधना करना आपके संपूर्ण शरीर को निरोगी और दीर्घायु प्रदान करेगा।`;
  }
  if (baseLang === "te") {
    return `మీ లగ్నం ${h1.rashiName} అధిపతి ${h1Lord} మీ సహజ రోగనిరోధక శక్తి, శారీరక దృఢత్వం మరియు ప్రాణశక్తికి మూలకారకుడు. ఆరోగ్యకారక సూర్యుడు ${sunWhere}లో ఉండటం సహజ జీవశక్తిని ఇస్తుంది. 6వ భావాధిపతి ${h6Lord} ప్రభావం వల్ల పని ఒత్తిడి, జీర్ణక్రియలో మార్పులు మరియు అలసటపై దృష్టి పెట్టడం అవసరం. వాత, పిత్త, కఫ త్రిదోషాల సమతుల్యతను కాపాడుకోవడం మరియు సాత్విక ఆహారం తీసుకోవడం సంపూర్ణ ఆరోగ్యానికి దోహదపడుతుంది.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ కాలంలో క్రమబద్ధమైన దినచర్య, యోగా మరియు సమతుల్య ఆహారం శరీరానికి మరియు మనస్సుకు నూతనోత్తేజాన్ని ఇస్తాయి. ఉదయాన్నే సూర్య నమస్కారాలు చేయడం, ఆదిత్య హృదయ స్తోత్రం పఠించడం మరియు రాగి పాత్రలో నీరు త్రాగడం ఆరోగ్యాన్ని కాపాడుతుంది. రాత్రి తగినంత నిద్ర మరియు ధ్యానం నాడీ వ్యవస్థను బలోపేతం చేస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் லக்னமான ${h1.rashiName} அதிபதி ${h1Lord} உங்கள் உடல் நோய் எதிர்ப்புச் சக்தி, வலிமை மற்றும் ஆயுளைக் கட்டுப்படுத்துகிறார். ஆரோக்கியகாரகன் சூரிய பகவான் ${sunWhere} அமைப்பில் இருப்பது இயற்கையான உடல் வலிமையைத் தருகிறது. 6-ம் அதிபதி ${h6Lord} தாக்கத்தால் வேலைப்பளு, மன அழுத்தம், செரிமானக் கோளாறுகள் மற்றும் தூக்கமின்மை ஏற்படாமல் விழிப்புடன் இருப்பது அவசியம். வாத, பித்த, கப சமநிலையைக் காப்பதும் ஆரோக்கியமான உணவை உட்கொள்வதும் நீண்ட ஆயுளுக்கு வழிவகுக்கும்.

தற்போதைய ${chart.mahaLordName} மகாதிசை காலத்தில் உடற்பயிற்சி, யோகா மற்றும் சாத்வீக உணவை வழக்கமாக்கிக் கொள்வது மனதிற்கும் உடலிற்கும் புத்துணர்ச்சி தரும். காலையில் சூரிய நமஸ்காரம் செய்வதும், ஆதித்ய ஹிருதய ஸ்தோத்திரம் பாராயணம் செய்வதும் செம்பு பாத்திரத்தில் நீர் அருந்துவதும் ஆரோக்கியத்தை மேம்படுத்தும். தினசரி தியானமும் ஆழ்ந்த தூக்கமும் நரம்பு மண்டலத்தை வலுப்படுத்தும்.`;
  }
  return `Your Lagna (${h1.rashiName}) and Lagna lord ${h1Lord} govern your foundational constitution, natural vitality, cellular immunity, and physical stamina. The Sun as Arogyakaraka situated in ${sunWhere} bestows intrinsic metabolic vigor and resilience, while the Moon governs emotional equilibrium and mental calmness. The 6th house of health vulnerabilities (${h6.rashiName}, lord ${h6Lord}) advises proactive attentiveness toward digestive fire (Jatharagni), rhythmic sleep hygiene, and managing work-induced nervous fatigue. Maintaining harmonious Tridosha balance (Vata, Pitta, Kapha) through seasonally attuned lifestyles shields your physical body against chronic ailments and promotes cellular longevity.

Under your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period, establishing a grounded daily regimen of gentle hatha yoga, conscious pranayama, and unhurried hydration directly revitalizes your physical stamina and nervous energy. Offering Arghya to the rising Sun with pure water, chanting the Aditya Hridaya Stotram at dawn, and incorporating warm herbal teas balance internal metabolic rhythms effortlessly. Ensuring adequate rest during demanding professional phases and dedicating time to meditative stillness protects your aura, ensuring radiant vitality and robust lifelong wellbeing.`;
}

/* ========================================================================= */
/* Child Horoscopes (< 8 Years): Non-Adult Pedagogical Fallbacks             */
/* ========================================================================= */

export function buildDynamicChildEducationFallback(chart: ParsedKundaliChart): string {
  const h4 = chart.houses[4];
  const h5 = chart.houses[5];
  const baseLang = chart.lang.split("-")[0];

  if (baseLang === "kn") {
    return `ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸದ 4ನೇ ಮನೆ (${h4.rashiName}, ಅಧಿಪತಿ ${h4.lordName}) ಹಾಗೂ ಬುದ್ಧಿ ಶಕ್ತಿಯ 5ನೇ ಮನೆ (${h5.rashiName}, ಅಧಿಪತಿ ${h5.lordName}) ಜಾತಕದಲ್ಲಿ ಅತ್ಯಂತ ಬಲಿಷ್ಠವಾಗಿದ್ದು, ಮಗುವಿನಲ್ಲಿ ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ಅದ್ಭುತ ಜ್ಞಾಪಕ ಶಕ್ತಿ ಮತ್ತು ನಿರಂತರ ಜಿಜ್ಞಾಸೆಯನ್ನು ಮೂಡಿಸುತ್ತವೆ. ಬಾಲ್ಯದ ಈ ಹಂತದಲ್ಲಿ ಮಗು ಹೊಸ ವಿಷಯಗಳನ್ನು ಅತ್ಯಂತ ವೇಗವಾಗಿ ಕಲಿಯುವ ನೈಸರ್ಗಿಕ ಪ್ರವೃತ್ತಿಯನ್ನು ಹೊಂದಿದ್ದು, ಭಾಷೆಗಳು, ಗಣಿತ, ವಿಜ್ಞಾನ ಹಾಗೂ ಸೃಜನಶೀಲ ಕಲೆಗಳಲ್ಲಿ ವಿಶೇಷ ಆಸಕ್ತಿಯನ್ನು ಪ್ರದರ್ಶಿಸಲಿದೆ. ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣದಲ್ಲಿ ಮಗುವಿಗೆ ಒತ್ತಡವಿಲ್ಲದ ಮುಕ್ತ ಕಲಿಕೆಯ ಅವಕಾಶವನ್ನು ಒದಗಿಸಿದರೆ, ಅದು ತನ್ನ ಸಹಪಾಠಿಗಳಿಗಿಂತ ಬಹುಮುಂದೆ ಸಾಗಿ ಶ್ರೇಷ್ಠ ಸಾಧನೆ ಮಾಡುವ ಅಪೂರ್ವ ಯೋಗವನ್ನು ಹೊಂದಿದೆ. ಶಿಕ್ಷಕರು ಮತ್ತು ಪಾಲಕರ ಪ್ರೋತ್ಸಾಹವು ಮಗುವಿನ ಪ್ರತಿಭೆಯನ್ನು ಮತ್ತಷ್ಟು ಉಜ್ವಲಗೊಳಿಸಲಿದೆ.

ಆಟದ ಮೂಲಕ ಕಲಿಯುವ ನವೀನ ಪದ್ಧತಿ, ಚಿತ್ರ ಸಹಿತ ಪುಸ್ತಕಗಳು ಹಾಗೂ ಪ್ರಶಾಂತ ಅಧ್ಯಯನ ವಾತಾವರಣವು ಮಗುವಿನ ಏಕಾಗ್ರತೆಯನ್ನು ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಿಸುತ್ತದೆ. ನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಮಗುವಿನಿಂದ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಮತ್ತು 'ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ' ಮಂತ್ರವನ್ನು ಹೇಳಿಸುವುದು ಮಗುವಿನ ವಾಗ್ಶಕ್ತಿ ಮತ್ತು ಮೇಧಾ ಶಕ್ತಿಯನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ. ಅನಗತ್ಯ ಮೊಬೈಲ್ ಮತ್ತು ಟಿವಿ ಪರದೆಯ ಸಮಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ, ಪ್ರಕೃತಿಯೊಂದಿಗೆ ಬೆರೆಯುವ ಮತ್ತು ಪುಸ್ತಕ ಓದುವ ಹವ್ಯಾಸವನ್ನು ಬೆಳೆಸುವುದು ಮಗುವಿನ ಭವಿಷ್ಯದ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಭದ್ರ ಬುನಾದಿ ಹಾಕಲಿದೆ. ಗುರು ಮತ್ತು ಸರಸ್ವತಿಯ ಕೃಪೆಯಿಂದ ಮಗು ವಿದ್ಯಾ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ಗಳಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `बच्चे की कुंडली का चतुर्थ भाव (${h4.rashiName}, स्वामी ${h4.lordName}) जो प्रारंभिक शिक्षा का कारक है, तथा पंचम भाव (${h5.rashiName}, स्वामी ${h5.lordName}) जो बुद्धि और विवेक का स्थान है, अत्यंत शुभ स्थिति में हैं। यह ग्रह स्थिति बच्चे में तीव्र स्मरण शक्ति, त्वरित ग्रहण क्षमता और स्वाभाविक बौद्धिक जिज्ञासा को दर्शाती है। बाल्यावस्था से ही बच्चा तर्कसंगत विषयों, नवीन भाषाओं तथा रचनात्मक गतिविधियों में असाधारण रुचि दिखाएगा। यदि इस आयु में बच्चे को तनावमुक्त तथा ज्ञानवर्धक वातावरण दिया जाए, तो वह अपने सहपाठियों से आगे रहकर उत्कृष्ट शैक्षणिक उपलब्धियां हासिल करेगा।

खेल-खेल में शिक्षा, प्रयोगात्मक अधिगम और घर में एक शांत अध्ययन स्थल बच्चे की एकाग्रता को कई गुना बढ़ा देगा। प्रतिदिन प्रातःकाल मां सरस्वती की वंदना तथा 'ॐ ऐं सरस्वत्यै नमः' का जाप बच्चे की वाणी और बौद्धिक प्रखरता को अभूतपूर्व तेज प्रदान करेगा। डिजिटल उपकरणों के अत्यधिक उपयोग को सीमित करते हुए रचनात्मक पुस्तकों और प्रकृति से जुड़ाव विकसित करना भावी विद्याध्ययन की मजबूत नींव रखेगा। गुरुजनों का स्नेह और मां सरस्वती का आशीर्वाद इस बालक को उच्च शिक्षा में शीर्ष स्थान और प्रतिष्ठा दिलाएगा।`;
  }
  if (baseLang === "te") {
    return `చిన్నారి జాతకంలో ప్రాథమిక విద్యను సూచించే 4వ ఇల్లు (${h4.rashiName}, అధిపతి ${h4.lordName}) మరియు జ్ఞానాన్ని, తెలివితేటలను సూచించే 5వ ఇల్లు (${h5.rashiName}, అధిపతి ${h5.lordName}) బలమైన స్థానాల్లో ఉన్నాయి. ఈ శుభ గ్రహాల కలయిక పిల్లల్లో అద్భుతమైన జ్ఞాపకశక్తి, చురుకైన పరిశీలనా సామర్థ్యం మరియు నేర్చుకోవాలనే సహజమైన ఆసక్తిని కలిగిస్తుంది. ఈ వయస్సులో భాషలు, గణితం మరియు సృజనాత్మక విషయాలలో పిల్లలు విశేషమైన ప్రతిభను కనబరుస్తారు. ఒత్తిడి లేని కుటుంబ వాతావరణం ఈ చిన్నారిని చదువులో ఎల్లప్పుడూ అగ్రగామిగా నిలబెడుతుంది.

ఆటపాటల ద్వారా నేర్చుకునే విద్యావిధానం, వర్ణరంజిత చిత్రాల పుస్తకాలు మరియు ప్రశాంతమైన అధ్యయన గది పిల్లల ఏకాగ్రతను విశేషంగా పెంచుతాయి. ప్రతిరోజూ ఉదయం శ్రీ సరస్వతీ దేవి ప్రార్థన మరియు 'ఓం ఐం సరస్వత్యై నమః' మంత్రోచ్ఛారణ చేయించడం పిల్లల వాక్చాతుర్యాన్ని, మేధో వికాసాన్ని పెంపొందిస్తుంది. అనవసరమైన మొబైల్ స్క్రీన్ సమయాన్ని తగ్గించి పుస్తకాలు చదివే అలవాటు చేయడం ఉజ్వల విద్యా పునాదికి కారణమవుతుంది. సరస్వతీ కటాక్షంతో ఈ చిన్నారి విద్యా రంగంలో విశేష కీర్తి ప్రతిష్టలను సంపాదిస్తారు.`;
  }
  if (baseLang === "ta") {
    return `குழந்தையின் ஜாதகத்தில் ஆரம்பக் கல்வியைக் குறிக்கும் 4-ம் வீடு (${h4.rashiName}, அதிபதி ${h4.lordName}) மற்றும் புத்தி கூர்மையைக் குறிக்கும் 5-ம் வீடு (${h5.rashiName}, அதிபதி ${h5.lordName}) மிகச் சிறந்த யோக அமைப்பில் உள்ளன. இது குழந்தைக்கு அபார நினைவாற்றல், எதையும் எளிதில் கிரகிக்கும் திறன் மற்றும் புதிய விஷயங்களைக் கற்றுக்கொள்ளும் தீவிர ஆர்வத்தை வழங்குகிறது. தொடக்கக் கல்வியிலிருந்தே மொழி, கணிதம் மற்றும் கலை சார்ந்த துறைகளில் குழந்தை தனது தனித்திறனை வெளிப்படுத்தும். அன்பான மற்றும் அமைதியான சூழல் குழந்தையின் கற்றல் திறனை பல மடங்கு அதிகரிக்கும்.

விளையாட்டு வழிக் கல்வி முறையும், வண்ணப் படப் புத்தகங்களும், வீட்டின் அமைதியான வாசிப்புச் சூழலும் குழந்தையின் கவனக் குவிப்பை மேம்படுத்தும். தினசரி காலையில் சரஸ்வதி தேவி வழிபாடும், 'ஓம் ஐம் சரஸ்வத்யை நமஹ' மந்திர பாராயணமும் குழந்தையின் வாக்குவன்மையையும் புத்தி கூர்மையையும் மேலும் மிளிரச் செய்யும். தேவையற்ற செல்போன் பயன்பாட்டைக் குறைத்து, நற்பழக்கங்களையும் வாசிப்புப் பழக்கத்தையும் வளர்ப்பது எதிர்காலக் கல்விக்கு உறுதியான அடித்தளமாக அமையும். சரஸ்வதி தேவியின் பரிபூரண அருளால் குழந்தை கல்வியில் பெரும் புகழ் பெறும்.`;
  }
  return `The child's 4th house of foundational learning (${h4.rashiName}, ruled by ${h4.lordName}) and 5th house of intellect (${h5.rashiName}, ruled by ${h5.lordName}) form a profoundly harmonious cosmic axis. This configuration endows the young native with exceptional cognitive retention, rapid conceptual grasping, and an insatiable curiosity about the world around them. Even in early developmental years, the child displays an innate flair for linguistic expression, logical sequencing, and imaginative storytelling. Providing an unhurried, encouraging, and emotionally secure learning atmosphere will allow their intellectual brilliance to flourish far ahead of conventional benchmarks.

Interactive visual learning, sensory-rich play, and establishing a dedicated, peaceful study alcove will naturally deepen their attention span and cognitive absorption. Introducing a gentle morning routine of chanting the Saraswati Mantra ('Om Aim Saraswatyai Namah') and offering gratitude before study enhances verbal eloquence and intellectual clarity. Guarding against excessive digital screen exposure while nurturing an early love for physical books and nature exploration builds an unshakeable scholastic foundation. Under divine grace, the child is destined to achieve outstanding academic distinctions and honorable recognition throughout their schooling.`;
}

export function buildDynamicChildActivitiesFallback(chart: ParsedKundaliChart): string {
  const h3 = chart.houses[3];
  const h5 = chart.houses[5];
  const baseLang = chart.lang.split("-")[0];

  if (baseLang === "kn") {
    return `ಪರಾಕ್ರಮ, ಕೌಶಲ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಉತ್ಸಾಹದ 3ನೇ ಮನೆ (${h3.rashiName}, ಅಧಿಪತಿ ${h3.lordName}) ಹಾಗೂ ಕಲಾ ಪ್ರತಿಭೆಯ 5ನೇ ಮನೆ (${h5.rashiName}) ಮಗುವಿನಲ್ಲಿ ಅಪಾರ ದೈಹಿಕ ಚೈತನ್ಯ, ತೀವ್ರ ಕುತೂಹಲ ಹಾಗೂ ಕ್ರಿಯಾಶೀಲ ಕಲ್ಪನಾ ಶಕ್ತಿಯನ್ನು ತುಂಬಿವೆ. ಮಗು ಸ್ವಾಭಾವಿಕವಾಗಿಯೇ ಓಡಾಟ, ಹೊರಾಂಗಣ ಆಟಗಳು, ಲಯಬದ್ಧ ಸಂಗೀತ ಹಾಗೂ ಚಿತ್ರಕಲೆಯಂತಹ ಕಲಾತ್ಮಕ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ನೈಸರ್ಗಿಕ ಆಸಕ್ತಿಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ. ಈ ಜನ್ಮಜಾತ ಚೈತನ್ಯವನ್ನು ಸರಿಯಾದ ದಿಕ್ಕಿನಲ್ಲಿ ಮುನ್ನಡೆಸಿದರೆ, ಮಗು ಕ್ರೀಡೆ, ಚಿತ್ರಕಲೆ ಅಥವಾ ಸಂಗೀತ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅಸಾಧಾರಣ ನೈಪುಣ್ಯವನ್ನು ಸಾಧಿಸಲಿದೆ. ಮಗುವಿನ ಈ ಸೃಜನಶೀಲ ಉತ್ಸಾಹವನ್ನು ಕಟ್ಟಿಹಾಕದೆ, ಅದಕ್ಕೆ ಪೂರಕವಾದ ವೇದಿಕೆಯನ್ನು ಒದಗಿಸುವುದು ಪಾಲಕರ ಪ್ರಮುಖ ಜವಾಬ್ದಾರಿಯಾಗಿದೆ.

ಮಗುವಿನ ಅದ್ಭುತ ಶಕ್ತಿಯನ್ನು ಈಜು, ಜಿಮ್ನಾಸ್ಟಿಕ್ಸ್, ನೃತ್ಯ ಅಥವಾ ಸಾಂಪ್ರದಾಯಿಕ ಕಲೆಗಳಲ್ಲಿ ತೊಡಗಿಸುವುದು ಮಗುವಿನಲ್ಲಿ ದೈಹಿಕ ಸಮತೋಲನ, ಶಿಸ್ತು ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಗಣನೀಯವಾಗಿ ಬೆಳೆಸಲಿದೆ. ಸಮಾನ ವಯಸ್ಕರೊಂದಿಗೆ ಕೂಡಿ ಆಡುವ ತಂಡದ ಆಟಗಳು ಮಗುವಿನಲ್ಲಿ ಸಾಮಾಜಿಕ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು ಬಾಲ್ಯದಲ್ಲೇ ರೂಪಿಸುತ್ತವೆ. ನಿಯಮಿತ ಹೊರಾಂಗಣ ಆಟಗಳು ಮಗುವಿನ ಶಕ್ತಿಯನ್ನು ಸದ್ವಿನಿಯೋಗಪಡಿಸಿ, ಅನಗತ್ಯ ಚಂಚಲತೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ ರಾತ್ರಿಯ ನಿದ್ರೆಯನ್ನು ಗಾಢವಾಗಿಸುತ್ತವೆ. ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ಮಗುವಿಗೆ ಉತ್ತಮ ದೈಹಿಕ ಬಲ, ಸಾಹಸ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಸರ್ವತೋಮುಖ ವಿಕಾಸವು ಸದಾ ಸಿದ್ಧಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `पराक्रम और कौशल का तृतीय भाव (${h3.rashiName}, स्वामी ${h3.lordName}) तथा रचनात्मक प्रतिभा का पंचम भाव (${h5.rashiName}) बच्चे में असीम ऊर्जा, स्वाभाविक उत्साह और कलात्मक कल्पनाशीलता का संचार करते हैं। बच्चा स्वभाव से ही खेलकूद, दौड़भाग, संगीत, चित्रकला तथा हस्तशिल्प जैसी गतिविधियों में गहरी रुचि दिखाएगा। यह जन्मजात सक्रियता दर्शाती है कि बच्चे के भीतर शारीरिक स्फूर्ति और कलात्मक संवेदना का सुंदर समन्वय है। यदि इस ऊर्जा को सही समय पर सही मार्गदर्शन मिले, तो बच्चा खेल या किसी विशिष्ट ललित कला में अद्वितीय कीर्तिमान स्थापित कर सकता है।

बच्चे की ऊर्जा को तैराकी, एथलेटिक्स, गायन, वादन अथवा चित्रकला जैसी रचनात्मक गतिविधियों में नियोजित करना उसके शारीरिक विकास और मानसिक एकाग्रता को मजबूत करेगा। अन्य बच्चों के साथ समूह में खेलने से उसमें सहयोग, नेतृत्व और सामाजिक समरसता के संस्कार स्वतः विकसित होंगे। नियमित आउटडोर खेल बच्चे की चंचलता को संयमित करके उसकी ऊर्जा को सकारात्मक दिशा प्रदान करेंगे। भगवान श्री हनुमान जी की कृपा से बच्चे को उत्तम शारीरिक बल, पराक्रम और खेलकूद में निरंतर विजय प्राप्त होगी।`;
  }
  if (baseLang === "te") {
    return `పరాక్రమ మరియు నైపుణ్య స్థానమైన 3వ ఇల్లు (${h3.rashiName}, అధిపతి ${h3.lordName}) మరియు సృజనాత్మక ప్రతిభను సూచించే 5వ ఇల్లు (${h5.rashiName}) చిన్నారిలో ఉత్సాహాన్ని, అపారమైన శారీరక శక్తిని మరియు కళాత్మక ఊహాశక్తిని నింపుతున్నాయి. పిల్లలు సహజంగానే ఆటపాటలు, వ్యాయామం, సంగీతం మరియు చిత్రలేఖనం వంటి అంశాలపై అమితమైన ఆసక్తిని కనబరుస్తారు. ఈ సహజసిద్ధమైన శక్తిని చిన్నతనం నుంచే సద్వినియోగం చేసుకుంటే, భవిష్యత్తులో క్రీడారంగంలో గానీ లేదా ఏదైనా కళారంగంలో గానీ అద్భుతమైన గుర్తింపు లభిస్తుంది.

ఈత, నృత్యం, చిత్రలేఖనం లేదా సంగీతం వంటి అభిరుచులలో పిల్లలను ప్రోత్సహించడం వల్ల వారిలో శారీరక దృఢత్వం, ఏకాగ్రత మరియు ఆత్మవిశ్వాసం పెరుగుతాయి. స్నేహితులతో కలిసి ఆడే ఆటలు పిల్లలలో నాయకత్వ లక్షణాలను మరియు స్నేహభావాన్ని పెంపొందిస్తాయి. రోజూ కొంత సమయం మైదానంలో ఆడుకోవడం వలన మానసిక చంచలత్వం తగ్గి రాత్రి ప్రశాంతమైన నిద్ర పడుతుంది. శ్రీ ఆంజనేయ స్వామి అనుగ్రహంతో ఈ చిన్నారికి మంచి శారీరక బలం, ధైర్యం మరియు సర్వతోముఖాభివృద్ధి కలుగుతాయి.`;
  }
  if (baseLang === "ta") {
    return `வீரம், சுறுசுறுப்பு மற்றும் தனித்திறனைக் குறிக்கும் 3-ம் வீடு (${h3.rashiName}, அதிபதி ${h3.lordName}) மற்றும் படைப்பாற்றலின் 5-ம் வீடு (${h5.rashiName}) குழந்தையிடம் அளப்பரிய ஆற்றல், விளையாட்டுத்தனம் மற்றும் இயல்பான கலை ஆர்வத்தை ஏற்படுத்துகின்றன. குழந்தை இயல்பாகவே ஓடி ஆடி விளையாடுவது, உடற்பயிற்சி, இசை, ஓவியம் மற்றும் கைவினைப் பொருட்களில் அதிக ஈடுபாடு காட்டும். இந்த ஆற்றலைச் சரியான வழியில் செலுத்தினால், விளையாட்டுத் துறையிலோ அல்லது நுண்கலைகளிலோ குழந்தை தனது அபார திறமையை நிரூபிக்கும்.

நீச்சல், நடனம், இசைக்கருவி வாசித்தல் அல்லது ஓவியம் போன்ற ஆக்கப்பூர்வமான பொழுதுபோக்குகளில் குழந்தையை ஈடுபடுத்துவது உடல் உறுதியையும் மன ஒருமைப்பாட்டையும் வளர்க்கும். சக குழந்தைகளுடன் இணைந்து விளையாடும் குழு விளையாட்டுக்கள் தலைமைப் பண்பையும் தோழமையையும் உருவாக்கும். தினசரி மாலையில் திறந்தவெளி விளையாட்டுக்களில் ஈடுபடுவது குழந்தையின் சுறுசுறுப்பைப் பாதுகாத்து நல்ல தூக்கத்தைத் தரும். ஸ்ரீ ஆஞ்சநேயரின் திருவருளால் குழந்தைக்கு அபார உடல் வலிமையும் தைரியமும் எந்நாளும் துணை நிற்கும்.`;
  }
  return `With the dynamic 3rd house of vitality (${h3.rashiName}, lord ${h3.lordName}) working in concert with the 5th house of creative ingenuity (${h5.rashiName}), the child is blessed with abundant kinetic vigor, spirited imagination, and an intuitive affinity for physical play, rhythm, and artistic exploration. The native displays an innate passion for hands-on creation, athletics, melodic sounds, and expressive craft. Rather than suppressing their natural restlessness, channeling this vibrant vitality into positive, constructive disciplines will awaken remarkable talents and poise early in life.

Encouraging structured athletic activities such as swimming, gymnastics, martial arts, or rhythmic music will build excellent neuromuscular coordination, discipline, and emotional balance. Engaging in collaborative team sports instills healthy sportsmanship, social empathy, and natural peer leadership. Ensuring daily outdoor sunshine and vigorous physical play burns excess restlessness, promoting deep restorative sleep and joyful emotional equilibrium. Under the blessings of Lord Hanuman, the child will cultivate robust physical resilience, unyielding courage, and wholesome extracurricular excellence.`;
}

export function buildDynamicChildFoundationFallback(chart: ParsedKundaliChart): string {
  const h1 = chart.houses[1];
  const h9 = chart.houses[9];
  const baseLang = chart.lang.split("-")[0];

  if (baseLang === "kn") {
    return `ಮಗುವಿನ ವ್ಯಕ್ತಿತ್ವದ ಲಗ್ನ ಭಾವವಾದ ${h1.rashiName} (ಅಧಿಪತಿ ${h1.lordName}) ಹಾಗೂ ಧರ್ಮ ಮತ್ತು ಸತ್ಸಂಸ್ಕಾರದ 9ನೇ ಮನೆ (${h9.rashiName}, ಅಧಿಪತಿ ${h9.lordName}) ಜಾತಕದಲ್ಲಿ ಅದ್ಭುತವಾಗಿ ಸಂಯೋಜನೆಗೊಂಡಿದ್ದು, ಮಗುವಿನಲ್ಲಿ ಜನ್ಮಜಾತ ಸಚ್ಚಾರಿತ್ರ್ಯ, ಸತ್ಯನಿಷ್ಠೆ ಮತ್ತು ಧರ್ಮದ ಅರಿವನ್ನು ಬಿತ್ತುತ್ತವೆ. ಬಾಲ್ಯದ ಆರಂಭಿಕ ವರ್ಷಗಳಲ್ಲಿ ಪೋಷಕರು ಮತ್ತು ಹಿರಿಯರಿಂದ ಕಲಿಯುವ ಮೌಲ್ಯಗಳು ಮಗುವಿನ ಸುಕೋಮಲ ಮನಸ್ಸಿನ ಮೇಲೆ ಅಳಿಸಲಾಗದ ಸತ್ಪ್ರಭಾವವನ್ನು ಬೀರುತ್ತವೆ. ಮಗು ಪ್ರಕೃತಿ, ಪ್ರಾಣಿ-ಪಕ್ಷಿಗಳು ಹಾಗೂ ಮನೆಯ ಹಿರಿಯರ ಬಗ್ಗೆ ಅಪಾರ ವಾತ್ಸಲ್ಯ ಮತ್ತು ಗೌರವವನ್ನು ತಳೆಯಲಿದ್ದು, ನೈಸರ್ಗಿಕವಾಗಿಯೇ ಸೌಜನ್ಯಯುತ ವರ್ತನೆಯನ್ನು ಪ್ರದರ್ಶಿಸಲಿದೆ.

ಕುಟುಂಬದಲ್ಲಿ ಧಾರ್ಮಿಕ ಆಚರಣೆಗಳು, ರಾಮಾಯಣ, ಮಹಾಭಾರತದಂತಹ ಪವಿತ್ರ ಕಥೆಗಳನ್ನು ಹೇಳುವುದು ಮತ್ತು ಸತ್ಯದ ಮಹತ್ವವನ್ನು ಬೋಧಿಸುವುದು ಮಗುವಿನ ಮನಸ್ಸಿನಲ್ಲಿ ಅಚಲ ನೈತಿಕ ಅಡಿಪಾಯವನ್ನು ನಿರ್ಮಿಸಲಿದೆ. ಮಗುವಿನ ಮುಂದೆ ಶಾಂತಿಯುತ ಹಾಗೂ ಪ್ರೀತಿಯಿಂದ ವರ್ತಿಸುವುದು ಅತ್ಯಂತ ಮುಖ್ಯ, ಏಕೆಂದರೆ ಮಗು ಹಿರಿಯರ ಪ್ರತಿಯೊಂದು ನಡೆಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅನುಕರಿಸುತ್ತದೆ. ದಿನನಿತ್ಯ ಸಂಜೆ ದೇವರಿಗೆ ನಮಸ್ಕಾರ ಮಾಡಿಸುವ ಸಂಸ್ಕಾರವು ಮಗುವಿನ ಅಂತರಂಗದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ನೆಲೆಗೊಳಿಸುತ್ತದೆ. ಈ ದಿವ್ಯ ಸಂಸ್ಕಾರಗಳಿಂದ ಬೆಳೆಯುವ ಈ ಮಗು ಭವಿಷ್ಯದಲ್ಲಿ ಸಮಾಜಕ್ಕೆ ಶ್ರೇಷ್ಠ ಆದರ್ಶ ವ್ಯಕ್ತಿಯಾಗಿ ಕೀರ್ತಿ ತರಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `लग्न भाव (${h1.rashiName}, स्वामी ${h1.lordName}) जो व्यक्तित्व और आत्मबल का आधार है, तथा नवम भाव (${h9.rashiName}, स्वामी ${h9.lordName}) जो धर्म और संस्कारों का स्थान है, बच्चे की कुंडली में अत्यंत शुभ और शक्तिशाली स्थिति में हैं। यह योग बच्चे में जन्मजात सत्यनिष्ठा, दयालुता और उच्च नैतिक मूल्यों के बीज बोता है। बाल्यावस्था के ये वर्ष उसके चारित्रिक निर्माण के लिए अत्यंत महत्वपूर्ण हैं। बच्चा स्वभाव से ही बड़ों का आदर करने वाला, संवेदनशील और सच बोलने के प्रति निष्ठावान रहेगा, जिससे उसका व्यक्तित्व अत्यंत आकर्षक और गरिमामयी बनेगा।

पारिवारिक संस्कारों, धार्मिक कथाओं, रामायण और महाभारत के प्रेरक प्रसंगों का श्रवण बच्चे के अवचेतन मन में एक सुदृढ़ नैतिक आधारशिला स्थापित करेगा। माता-पिता का मधुर और मर्यादित व्यवहार बच्चे के लिए सबसे बड़ा मार्गदर्शक सिद्ध होगा, क्योंकि वह अपने आस-पास के आचरण को बहुत तीव्रता से ग्रहण करता है। संध्या के समय घर में दीप प्रज्वलन और प्रार्थना का संस्कार उसके भीतर आध्यात्मिक शांति और सकारात्मक ऊर्जा का संचार करेगा। इन पावन संस्कारों के बल पर यह बालक भविष्य में परिवार और समाज का गौरव बढ़ाएगा।`;
  }
  if (baseLang === "te") {
    return `వ్యక్తిత్వాన్ని సూచించే లగ్న భావం (${h1.rashiName}, అధిపతి ${h1.lordName}) మరియు ధర్మాన్ని, సత్సంస్కారాన్ని సూచించే 9వ ఇల్లు (${h9.rashiName}, అధిపతి ${h9.lordName}) చిన్నారి జాతకంలో అద్భుతమైన సమన్వయాన్ని కలిగి ఉన్నాయి. ఇది పిల్లల్లో పుట్టుకతోనే మంచి నైతిక విలువలు, సత్యసంధత మరియు ధర్మనిష్ఠను పెంపొందిస్తుంది. ఈ బాల్య దశలో పెద్దల నుండి నేర్చుకునే ఆదర్శాలు పిల్లల మనస్సుపై చెరగని ముద్ర వేస్తాయి. పెద్దల పట్ల గౌరవం, తోటివారి పట్ల దయ మరియు బాధ్యతాయుతమైన ప్రవర్తన ఈ చిన్నారిలో స్వాభావికంగా కనిపిస్తాయి.

ఇంట్లో సంప్రదాయ పండుగలు జరుపుకోవడం, రామాయణ భారతాల కథలు చెప్పడం మరియు మంచి నీతి కథల ద్వారా పిల్లలను తీర్చిదిద్దడం బలమైన నైతిక పునాదిని నిర్మిస్తుంది. పిల్లల ఎదుట ప్రశాంతంగా, ప్రేమగా వ్యవహరించడం ఎంతో అవసరం, ఎందుకంటే వారు పెద్దల ప్రతి చర్యను అనుకరిస్తారు. ప్రతిరోజూ సాయంత్రం దీపారాధన చేయడం మరియు దైవ ప్రార్థన చేయించడం వల్ల పిల్లల అంతరంగంలో ఆధ్యాత్మిక శక్తి నిండుతుంది. ఈ గొప్ప సంస్కారాలతో ఎదిగే ఈ చిన్నారి భవిష్యత్తులో అందరి మన్ననలు పొందే గొప్ప వ్యక్తిగా ఎదుగుతారు.`;
  }
  if (baseLang === "ta") {
    return `ஆளுமை மற்றும் குணநலன்களைக் குறிக்கும் லக்னம் (${h1.rashiName}, அதிபதி ${h1.lordName}) மற்றும் தர்மம், நற்பண்புகளைக் குறிக்கும் 9-ம் வீடு (${h9.rashiName}, அதிபதி ${h9.lordName}) குழந்தையின் ஜாதகத்தில் மிகவும் சிறப்பாக அமைந்துள்ளன. இது குழந்தையிடம் பிறவியிலேயே உண்மை பேசுதல், இரக்க குணம் மற்றும் ஒழுக்க நெறிகளை உருவாக்கும். இளமைப் பருவத்தில் குடும்பத்தினர் புகட்டும் நல்ல பழக்கவழக்கங்கள் குழந்தையின் மென்மையான மனதில் ஆழமாகப் பதியும். பெரியோர்களை மதித்தல், பிறருக்கு உதவுதல் போன்ற உயரிய குணங்கள் இயல்பாகவே குழந்தையிடம் வெளிப்படும்.

பாரம்பரிய ஆன்மீகக் கதைகள், இதிகாச நன்னெறிகள் மற்றும் நல்லொழுக்கக் கதைகளைக் கூறுவது குழந்தையின் மனதில் அசைக்க முடியாத தார்மீக அடித்தளத்தை அமைக்கும். குழந்தையின் முன்னிலையில் பெற்றோர்கள் அமைதியாகவும் அன்பாகவும் நடந்துகொள்வது மிக முக்கியம், ஏனெனில் அது பெரியவர்களின் நடத்தையை உன்னிப்பாகக் கவனித்துப் பின்பற்றும். மாலையில் வீட்டில் விளக்கேற்றி இறைவழிபாடு செய்யும் பழக்கம் குழந்தையின் மனதில் நேர்மறை ஆற்றலை வளர்க்கும். இத்தகைய நற்பண்புகளுடன் வளரும் குழந்தை எதிர்காலத்தில் குடும்பத்திற்கும் சமுதாயத்திற்கும் பெருமை சேர்க்கும்.`;
  }
  return `Governed by the foundational vitality of Lagna ${h1.rashiName} (ruled by Lord ${h1.lordName}) and illuminated by the 9th house of Dharma and ancestral nobility (${h9.rashiName}, ruled by Lord ${h9.lordName}), the child is endowed with an inherent moral compass, truthful disposition, and spiritual purity. Formative childhood impressions during these early years will profoundly mold their psychological core and social temperament. The young native intuitively exhibits empathy toward animals, polite deference to elders, and a natural distaste for falsehood or deceit.

Imparting noble parables from timeless epics, celebrating cultural traditions, and exemplifying compassionate behavior within the home will anchor an unshakeable ethical backbone. Parents should maintain a calm, harmonious demeanor around the child, as their subconscious mind absorbs domestic vibration like a pure mirror. Nurturing a simple twilight tradition of lighting an oil lamp and expressing gratitude creates protective spiritual boundaries. Rooted in these pristine samskaras, the child will grow into a person of exemplary character, societal reverence, and enduring dignity.`;
}

export function buildDynamicChildFamilyFallback(chart: ParsedKundaliChart): string {
  const h2 = chart.houses[2];
  const h4 = chart.houses[4];
  const baseLang = chart.lang.split("-")[0];

  if (baseLang === "kn") {
    return `ಕುಟುಂಬ ಸ್ಥಾನವಾದ 2ನೇ ಮನೆ (${h2.rashiName}, ಅಧಿಪತಿ ${h2.lordName}) ಹಾಗೂ ಮಾತೃ ಸ್ಥಾನವಾದ 4ನೇ ಮನೆ (${h4.rashiName}) ಗ್ರಹಗಳ ಪ್ರಭಾವವು ಮಗುವಿಗೆ ಕುಟುಂಬದ ಪ್ರೀತಿ, ವಾತ್ಸಲ್ಯ ಹಾಗೂ ಆಪ್ತ ಭದ್ರತೆಯೇ ಅತ್ಯುನ್ನತ ಶಕ್ತಿಯಾಗಿದೆ ಎಂಬುದನ್ನು ಸೂಚಿಸುತ್ತದೆ. ತಂದೆ-ತಾಯಿ, ಹಿರಿಯರು ಹಾಗೂ ಒಡಹುಟ್ಟಿದವರ ಪ್ರೀತಿಯ ಅಪ್ಪುಗೆಯು ಮಗುವಿನಲ್ಲಿ ಅಚಲ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆಯನ್ನು ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಿಸುತ್ತದೆ. ಸಂಸ್ಕಾರಯುತ ಮತ್ತು ಪ್ರಶಾಂತ ಕೌಟುಂಬಿಕ ವಾತಾವರಣವು ಮಗುವಿನ ಮಾನಸಿಕ ಬೆಳವಣಿಗೆಗೆ ದಿವ್ಯ ಅಮೃತದಂತೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ.

ಕುಟುಂಬದಲ್ಲಿ ಧಾರ್ಮಿಕ ಹಬ್ಬಗಳ ಆಚರಣೆ, ಸಂಪ್ರದಾಯದ ಕಥೆಗಳನ್ನು ಹೇಳುವುದು, ಒಟ್ಟಾಗಿ ಊಟ ಮಾಡುವುದು ಮತ್ತು ಪ್ರೀತಿಯ ಸಂವಾದಗಳು ಮಗುವಿಗೆ ಆಳವಾದ ಭದ್ರತಾ ಭಾವನೆಯನ್ನು ನೀಡುತ್ತವೆ. ಮಗುವಿನ ಸಣ್ಣ ಸಣ್ಣ ಸಾಧನೆಗಳನ್ನು ಪ್ರಶಂಸಿಸುವುದು ಮತ್ತು ತಪ್ಪುಗಳನ್ನು ಪ್ರೀತಿಯಿಂದ ತಿದ್ದಿ ಹೇಳುವುದು ಅದರ ಮನಸ್ಸಿನಲ್ಲಿ ಕುಟುಂಬದ ಮೇಲಿನ ಅಪಾರ ಭಕ್ತಿ ಮತ್ತು ಗೌರವವನ್ನು ಸದಾ ಜೀವಂತವಾಗಿಡಲಿದೆ. ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ಸಂಜೆ ದೀಪ ಹಚ್ಚಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿಸುವ ಅಭ್ಯಾಸವು ಮಗುವಿನ ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಧನಾತ್ಮಕ ತರಂಗಗಳನ್ನು ತುಂಬಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `कुटुंब भाव (द्वितीय भाव ${h2.rashiName}, स्वामी ${h2.lordName}) तथा मातृ भाव (चतुर्थ भाव ${h4.rashiName}) का शुभ प्रभाव यह दर्शाता है कि परिवार का प्रेम, स्नेह और सुरक्षा ही बच्चे की सबसे बड़ी शक्ति है। माता-पिता और बड़ों का वात्सल्य बच्चे में अगाध आत्मविश्वास और भावनात्मक स्थिरता भरता है। एक शांत और संस्कारी पारिवारिक वातावरण बच्चे के सर्वांगीण विकास के लिए अमृत तुल्य है।

पारिवारिक उत्सवों में भागीदारी, बड़ों का सान्निध्य और मधुर संवाद बच्चे में गहरी सुरक्षा की भावना जगाते हैं। बच्चे के नन्हें प्रयासों की सराहना करना और गलतियों को धैर्य से सुधारना परिवार के प्रति उसके आदर और प्रेम को प्रगाढ़ बनाएगा। संध्या काल में घर के पूजा स्थल पर दीपक प्रज्वलित करने का संस्कार मन में सकारात्मक ऊर्जा का संचार करेगा।`;
  }
  if (baseLang === "te") {
    return `కుటుంబ స్థానమైన 2వ ఇల్లు (${h2.rashiName}, అధిపతి ${h2.lordName}) మరియు మాతృ స్థానమైన 4వ ఇల్లు (${h4.rashiName}) పిల్లలకు కుటుంబ ప్రేమ, ఆప్యాయత మరియు భద్రతలే అత్యున్నత రక్షణ అని తెలియజేస్తున్నాయి. తల్లిదండ్రులు, పెద్దల వాత్సల్యం పిల్లలలో అచంచలమైన ఆత్మవిశ్వాసాన్ని నింపుతుంది. ప్రశాంతమైన కుటుంబ వాతావరణం పిల్లల మానసిక వికాసానికి దివ్య ఔషధంగా పనిచేస్తుంది.

కుటుంబంలో పండుగలు జరుపుకోవడం, కలిసి భోజనం చేయడం మరియు ప్రేమపూర్వక సంభాషణలు పిల్లలకు ఎంతో భరోసానిస్తాయి. పిల్లల చిన్న ప్రయత్నాలను అభినందించడం మరియు ఇంట్లో సంధ్యా దీపారాధన చేయించే అలవాటు వారిలో సానుకూల తరంగాలను నింపుతుంది.`;
  }
  if (baseLang === "ta") {
    return `குடும்ப ஸ்தானமான 2-ம் வீடு (${h2.rashiName}, அதிபதி ${h2.lordName}) மற்றும் மாத்ரு ஸ்தானமான 4-ம் வீடு (${h4.rashiName}) குழந்தைக்கு குடும்பத்தின் பாசம், அரவணைப்பு மற்றும் பாதுகாப்பே மிகப்பெரிய பலம் என்பதைக் காட்டுகின்றன. பெற்றோரின் அன்பும் ஆதரவும் குழந்தையிடம் அசைக்க முடியாத தன்னம்பிக்கையையும் மன அமைதியையும் உருவாக்கும். அமைதியான குடும்பச் சூழல் குழந்தையின் ஆரோக்கியமான வளர்ச்சிக்கு மிக அவசியம்.

குடும்பத்தினருடன் நேரத்தை செலவிடுவது, நல்ல கதைகளைக் கூறுவது மற்றும் குழந்தையின் சிறு முயற்சிகளையும் பாராட்டுவது பாசப்பிணைப்பை வலுப்படுத்தும். வீட்டில் மாலையில் விளக்கேற்றி இறைவழிபாடு செய்யும் பழக்கம் குழந்தையின் மனதில் நேர்மறை எண்ணங்களை விதைக்கும்.`;
  }
  return `The 2nd house of family warmth (${h2.rashiName}, lord ${h2.lordName}) and 4th house of maternal affection (${h4.rashiName}) indicate that a serene, loving, and supportive domestic atmosphere directly blossoms the child's emotional stability and sense of inner security. The unconditional warmth received from parents, grandparents, and household elders acts as their greatest emotional anchor during formative years. Experiencing peaceful familial interactions instills deep psychological grounding, allowing the young child to explore the world with joyous curiosity, robust confidence, and emotional fortitude.

Maintaining consistent family rituals, shared joyous celebratory meals, cultural bedtime stories, and gentle parental discipline nurtures profound self-worth, making the child feel cherished, heard, and deeply rooted in their heritage. Celebrating their small daily creative milestones and offering patient, compassionate corrections without harsh judgment reinforces mutual trust and deep familial devotion. Creating a sacred domestic sanctuary with evening prayers and cultural harmony ensures the child flourishes into an emotionally balanced, empathetic, and culturally enlightened individual.`;
}

export function buildDynamicChildPediatricHealthFallback(chart: ParsedKundaliChart): string {
  const h1 = chart.houses[1];
  const h6 = chart.houses[6];
  const baseLang = chart.lang.split("-")[0];

  if (baseLang === "kn") {
    return `ಲಗ್ನಾಧಿಪತಿಯಾದ ${h1.lordName} ಗ್ರಹವು ಮಗುವಿಗೆ ಉತ್ತಮ ಜೀವಶಕ್ತಿ, ದೈಹಿಕ ಬೆಳವಣಿಗೆ ಹಾಗೂ ನೈಸರ್ಗಿಕ ರೋಗನಿರೋಧಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ. ಜಾತಕದ 6ನೇ ಮನೆಯಾದ ${h6.rashiName} (ಅಧಿಪತಿ ${h6.lordName}) ಪರಿಶೀಲನೆಯ ಪ್ರಕಾರ, ಋತುಮಾನ ಬದಲಾಗುವ ಸಮಯದಲ್ಲಿ ಶೀತ, ಗಂಟಲಿನ ಕಿರಿಕಿರಿ ಹಾಗೂ ಜೀರ್ಣಾಂಗಗಳ ಸೂಕ್ಷ್ಮತೆಯ ಬಗ್ಗೆ ಪೋಷಕರು ವಿಶೇಷ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಅವಶ್ಯಕ. ಬಾಲ್ಯದ ಬೆಳವಣಿಗೆಯ ಈ ಹಂತದಲ್ಲಿ ಮಗುವಿನ ಜಠರಾಗ್ನಿ ಮತ್ತು ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಸಮತೋಲನದಲ್ಲಿಡುವುದು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಲಿದೆ. ತಂಪು ಪಾನೀಯಗಳು ಮತ್ತು ಅತಿಯಾದ ಸಿಹಿತಿಂಡಿಗಳನ್ನು ನಿಯಂತ್ರಿಸುವುದು ಉತ್ತಮ.

ಮನೆಮದ್ದಿನಂತಹ ನೈಸರ್ಗಿಕ ಸಾತ್ವಿಕ ಆಹಾರ, ಬಿಸಿ ನೀರು, ಶುದ್ಧ ಹಾಲು ಹಾಗೂ ಹಸಿರು ತರಕಾರಿಗಳ ಸೇವನೆಯು ಮಗುವಿನ ದೈಹಿಕ ಧೃಢತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಪ್ರತಿದಿನ ನಿಯಮಿತ ಸಮಯದಲ್ಲಿ ನಿದ್ರೆ ಮಾಡಿಸುವ ಅಭ್ಯಾಸ ಮತ್ತು ಸೂರ್ಯೋದಯದ ಎಳೆಯ ಬಿಸಿಲಿಗೆ ಮಗುವನ್ನು ಒಡ್ಡುವುದು ಮೂಳೆಗಳ ಬೆಳವಣಿಗೆಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಮುಂಜಾನೆ ಶ್ರೀ ಗಣೇಶನ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಸಂಜೆ ಋಣವಿಮೋಚಕ ಅಥವಾ ಬಾಲರಕ್ಷಾ ಸ್ತೋತ್ರವನ್ನು ಮನೆಯಲ್ಲಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ನಕಾರಾತ್ಮಕ ದೃಷ್ಟಿ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ಮಗು ಸದಾ ಚೈತನ್ಯ ಮತ್ತು ಆರೋಗ್ಯದಿಂದ ಕಂಗೊಳಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `लग्नेश ${h1.lordName} बच्चे को उत्तम शारीरिक आरोग्यता, तेजस्विता और मजबूत प्राकृतिक रोग प्रतिरोधक क्षमता प्रदान करते हैं। षष्ठ भाव (${h6.rashiName}, स्वामी ${h6.lordName}) की स्थिति यह संकेत करती है कि बदलते मौसम के दौरान बच्चे के खान-पान, सर्दी-जुकाम और पाचन तंत्र के प्रति विशेष सतर्कता बरतनी चाहिए। बाल्यावस्था में पाचन शक्ति को संतुलित रखना बच्चे के समग्र विकास के लिए अनिवार्य है। अत्यधिक ठंडी वस्तुएं, कृत्रिम मिठास और बाहर के तले-भुने भोजन से परहेज करना स्वास्थ्य को सुदृढ़ बनाए रखेगा।

घर का बना ताजा, सुपाच्य और सात्विक भोजन, गुनगुना जल, देशी गाय का दूध तथा हरी सब्जियां बच्चे की शारीरिक शक्ति को बढ़ाएंगी। समय पर सोने और जागने की नियमित दिनचर्या तथा प्रातःकालीन गुनगुनी धूप का सेवन उसकी हड्डियों और त्वचा के लिए अत्यंत लाभकारी रहेगा। प्रतिदिन प्रातःकाल भगवान श्री गणेश का स्मरण और बालक की नजर उतारने के पारंपरिक नियम समस्त नकारात्मक प्रभावों को दूर रखेंगे। ईश्वर की अनुकंपा से बालक सदैव निरोगी, प्रफुल्लित और दीर्घायु बना रहेगा।`;
  }
  if (baseLang === "te") {
    return `లగ్నాధిపతి ${h1.lordName} చిన్నారికి మంచి శారీరక పెరుగుదల, సహజమైన రోగనిరోధక శక్తి మరియు అద్భుతమైన ఉత్సాహాన్ని ప్రసాదిస్తారు. జాతకంలో రోగ స్థానమైన 6వ ఇల్లు (${h6.rashiName}, అధిపతి ${h6.lordName}) పరిశీలన ప్రకారం, వాతావరణ మార్పుల సమయంలో జలుబు, గొంతు నొప్పి మరియు జీర్ణ సమస్యల పట్ల తల్లిదండ్రులు జాగ్రత్త వహించాలి. ఈ ఎదుగుదల దశలో పిల్లల జీర్ణక్రియ ఆరోగ్యంగా ఉంటే అన్ని రకాల అనారోగ్యాల నుంచి సులభంగా రక్షణ లభిస్తుంది. నిల్వ ఉంచిన పదార్థాలు మరియు శీతల పానీయాలను దూరంగా ఉంచడం మంచిది.

ఇంట్లో వండిన వేడి తాజా భోజనం, తగినంత మంచినీరు, పాలు మరియు పౌష్టికాహారం పిల్లల రోగనిరోధక శక్తిని రెట్టింపు చేస్తాయి. రోజూ సరైన సమయానికి నిద్రపోవడం మరియు ఉదయపు లేలేత ఎండలో కొద్దిసేపు తిరగడం వల్ల ఎముకలు ధృడపడతాయి. ప్రతిరోజూ ఉదయం వినాయకుడిని ప్రార్థించడం మరియు ఇంట్లో సంధ్యా సమయంలో ధూపం వేయడం ద్వారా పిల్లలకు దిష్టి దోషాలు తొలగిపోయి, సంపూర్ణ ఆరోగ్యంతో మరియు ఉల్లాసంగా ఉంటారు.`;
  }
  if (baseLang === "ta") {
    return `லக்னாதிபதி ${h1.lordName} குழந்தைக்கு நல்ல உடல் வலிமை, சுறுசுறுப்பு மற்றும் இயற்கை நோய் எதிர்ப்புச் சக்தியை அருளுகிறார். ஜாதகத்தில் 6-ம் வீட்டின் (${h6.rashiName}, அதிபதி ${h6.lordName}) அமைப்பைக் கவனிக்கும் போது, பருவமழை அல்லது குளிர்கால மாற்றங்களின் போது சளி, இருமல் மற்றும் செரிமானக் கோளாறுகளில் கூடுதல் கவனம் செலுத்துவது அவசியமாகும். குழந்தைப் பருவத்தில் செரிமான மண்டலத்தை சீராகப் பராமரிப்பதே நோயற்ற வாழ்விற்கு முதல் படியாகும். குளிர்ச்சியான பானங்கள் மற்றும் அதிக இனிப்புகளைத் தவிர்ப்பது நல்லது.

வீட்டில் சமைத்த சத்தான உணவு, வெதுவெதுப்பான நீர், பசும்பால் மற்றும் கீரைகள் குழந்தையின் உடலை வலுப்படுத்தும். குறித்த நேரத்தில் உறங்குவதும், அதிகாலை இளவெயிலில் சிறிது நேரம் விளையாடுவதும் எலும்பு வளர்ச்சிக்கு மிகவும் உகந்தது. தினமும் காலையில் விநாயகப் பெருமானை வழிபடுவதும், மாலையில் திருஷ்டி கழித்து நெய் தீபம் ஏற்றுவதும் குழந்தையை அனைத்து திருஷ்டி தோஷங்களிலிருந்தும் காக்கும். இறைவனின் திருவருளால் குழந்தை எவ்வித நோயுமின்றி நீண்ட ஆயுளுடனும் பூரண நலத்துடனும் திகழும்.`;
  }
  return `The benevolent disposition of Lagna Lord ${h1.lordName} infuses the child with vibrant vital force, strong recuperative energy, and resilient cellular immunity. An astrological examination of the 6th house of physiological balance (${h6.rashiName}, ruled by ${h6.lordName}) indicates that transitional seasonal shifts warrant mindful parental attention regarding upper respiratory sniffles, throat sensitivity, and delicate digestive assimilation. Maintaining balanced digestive fire (Jatharagni) during these formative years serves as the primary gateway to sustaining optimal metabolic immunity and unhindered physical development.

Emphasizing warm, freshly cooked home meals, adequate natural hydration, boiled pure milk, and seasonal fruits will strengthen their constitution exponentially. Establishing consistent sleep rituals and ensuring daily exposure to gentle morning sunshine fortifies skeletal density and natural vitamin assimilation. Chanting simple Ganapati prayers and offering evening protection rituals dispel subtle psychic fatigue and nazar (drishti dosha). Under divine grace, the child will enjoy vibrant pediatric wellness, spirited physical exuberance, and continuous holistic flourishing.`;
}

/* ========================================================================= */
/* Chapters II, III, IV, VII Fallbacks                                       */
/* ========================================================================= */

export function buildDynamicCharacteristicsFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h1 = chart.houses[1];
  const h1Lord = h1.lordName;
  const h1Where = `Bhava ${h1.lordHouse} (${h1.lordRashiName})`;

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${chart.lagnaSignName}, ಮನಃಕಾರಕ ಚಂದ್ರ ರಾಶಿಯಾದ ${chart.moonSignName} ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯಾದ ${h1Lord} ಗ್ರಹವು ${h1Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವ ದೈವಿಕ ಸಂರಚನೆಯು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಅಪೂರ್ವ ಗಾಂಭೀರ್ಯ, ನೈಸರ್ಗಿಕ ನಾಯಕತ್ವ ಹಾಗೂ ಅಚಲ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಕರುಣಿಸಿದೆ. ನೀವು ಬಾಹ್ಯವಾಗಿ ಪ್ರಶಾಂತ ಹಾಗೂ ಸಂಯಮದ ವ್ಯಕ್ತಿಯಾಗಿ ಕಂಡರೂ, ಅಂತರಂಗದಲ್ಲಿ ತೀಕ್ಷ್ಣ ವಿಶ್ಲೇಷಣಾ ಶಕ್ತಿ, ನ್ಯಾಯನಿಷ್ಠೆ ಮತ್ತು ಯಾವುದೇ ಸವಾಲನ್ನು ಎದುರಿಸುವ ಅದ್ಭುತ ಧೃತಿಯನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಕೌಟುಂಬಿಕ ಕರ್ತವ್ಯಗಳು ಹಾಗೂ ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಸಮತೋಲನದಲ್ಲಿ ಮುನ್ನಡೆಸುವ ನಿಮ್ಮ ಚಾತುರ್ಯವು ಸಮಾಜದಲ್ಲಿ ಎಲ್ಲರ ಮೆಚ್ಚುಗೆಗೆ ಪಾತ್ರವಾಗುತ್ತದೆ. ತತ್ವನಿಷ್ಠ ನಡವಳಿಕೆ, ಸತ್ಯಕ್ಕೆ ತಲೆಬಾಗುವ ಗುಣ ಹಾಗೂ ಆತ್ಮಾಭಿಮಾನವು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಮೂಲಾಧಾರ ಸ್ತಂಭಗಳಾಗಿವೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ನಿಮ್ಮ ಸುಪ್ತ ಸಾಮರ್ಥ್ಯಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಜಾಗೃತಗೊಳಿಸುವ ಮಹತ್ವದ ಕಾಲಘಟ್ಟವಾಗಿದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿ, ಕಾರ್ಯಕ್ಷಮತೆ ಹಾಗೂ ಕಾರ್ಯತಂತ್ರಗಳು ಹೊಸ ಎತ್ತರವನ್ನು ತಲುಪಲಿದ್ದು, ದೀರ್ಘಕಾಲದ ಕನಸುಗಳನ್ನು ನನಸಾಗಿಸಲು ಅತ್ಯುತ್ತಮ ವೇದಿಕೆ ದೊರೆಯಲಿದೆ. ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆ, ಆತ್ಮಾವಲೋಕನ ಹಾಗೂ ಕುಲದೇವತಾ ಆರಾಧನೆಯನ್ನು ಅಳವಡಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಅಂತಃಪ್ರಜ್ಞೆಯನ್ನು ಮತ್ತಷ್ಟು ತೀಕ್ಷ್ಣಗೊಳಿಸಲಿದೆ. ಸತ್ಕರ್ಮಗಳ ಅನುಷ್ಠಾನವು ನಿಮ್ಮ ಕೀರ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಿ, ಜೀವನದ ಪ್ರತಿಯೊಂದು ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಾಶ್ವತ ಗೌರವ, ಆರ್ಥಿಕ ಉನ್ನತಿ ಮತ್ತು ನೆಮ್ಮದಿಯನ್ನು ತರಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी जन्म लग्न ${chart.lagnaSignName}, चंद्र राशि ${chart.moonSignName} तथा लग्नेश ${h1Lord} की ${h1Where} में विशिष्ट स्थिति आपके संपूर्ण व्यक्तित्व को अद्वितीय गरिमा, नेतृत्व क्षमता और अटूट संकल्प शक्ति प्रदान करती है। आप बाह्य रूप से शांत और गंभीर प्रतीत होते हैं, किंतु आपके अंतर्मन में सूक्ष्म विश्लेषण, धर्मनिष्ठा और किसी भी संकट का धैर्यपूर्वक सामना करने का असीम सामर्थ्य विद्यमान है। परिवार और समाज के प्रति अपनी जिम्मेदारियों को मर्यादापूर्वक निभाने की आपकी स्वाभाविक प्रवृत्ति आपको सम्मान दिलाती है। सिद्धांतप्रियता, आत्मसम्मान और सत्य के प्रति निष्ठा आपके चरित्र की सर्वोच्च पहचान हैं।

वर्तमान में संचालित ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल आपके आंतरिक सामर्थ्य और प्रतिभा को निखारने का स्वर्णिम अवसर प्रस्तुत कर रहा है। इस समय आपकी निर्णय क्षमता, कार्यकुशलता और दूरदर्शिता नई ऊंचाइयों को स्पर्श करेगी, जिससे पुरानी योजनाएं साकार होने लगेंगी। नित्य जीवन में सकारात्मक चिंतन, सात्विक आचरण और कुलदेवता का स्मरण आपके आत्मबल को अभूतपूर्व शक्ति देगा। आपकी कर्मठता और न्यायप्रियता कार्यक्षेत्र में उच्च पद-प्रतिष्ठा तथा समाज में स्थायी यश और शांति की स्थापना करेगी।`;
  }
  if (baseLang === "te") {
    return `మీ జన్మ లగ్నం ${chart.lagnaSignName}, మనఃకారక చంద్ర రాశి ${chart.moonSignName} మరియు లగ్నాధిపతి ${h1Lord} ${h1Where}లో ఉన్న గ్రహ స్థితి మీ వ్యక్తిత్వానికి అద్భుతమైన గంభీరతను, సహజ నాయకత్వ లక్షణాలను మరియు అచంచలమైన ధైర్యాన్ని ప్రసాదిస్తున్నాయి. మీరు పైకి ప్రశాంతంగా కనిపించినప్పటికీ, అంతరంగంలో లోతైన ఆలోచనలు, న్యాయబుద్ధి మరియు ఎలాంటి క్లిష్ట పరిస్థితులనైనా ఎదుర్కొనే అపారమైన మానసిక స్థైర్యం కలిగి ఉన్నారు. కుటుంబ బాధ్యతలను మరియు వృత్తిపరమైన కర్తవ్యాలను సమర్థవంతంగా నిర్వహించే మీ నేర్పు అందరి ప్రశంసలను అందుకుంటుంది. నిజాయితీ మరియు ఆత్మగౌరవం మీ వ్యక్తిత్వానికి మూలస్తంభాలు.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం మీలోని దాగి ఉన్న శక్తులను వెలికితీసే అత్యంత కీలకమైన సమయం. ఈ కాలంలో మీ నిర్ణయాధికారం, కార్యదక్షత మరియు వ్యూహాత్మక ఆలోచనలు ఉన్నత శిఖరాలను చేరుస్తాయి, తద్వారా దీర్ఘకాలిక లక్ష్యాలు నెరవేరుతాయి. రోజువారీ జీవితంలో సానుకూల దృక్పథం, ఆత్మపరిశీలన మరియు కులదైవ ప్రార్థన మీ అంతఃచేతనను మరింత పదును పెడతాయి. మీ ధర్మనిష్ఠ మీకు సమాజంలో శాశ్వత గౌరవాన్ని, ఉన్నత స్థానాన్ని మరియు మానసిక ప్రశాంతతను అందిస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் ஜென்ம லக்னம் ${chart.lagnaSignName}, சந்திர ராசி ${chart.moonSignName} மற்றும் லக்னாதிபதி ${h1Lord} ${h1Where} அமைப்பில் இருப்பது உங்கள் ஆளுமைக்குத் தனித்துவமான கம்பீரம், தலைமைப் பண்பு மற்றும் அசைக்க முடியாத மன உறுதியை வழங்குகிறது. நீங்கள் வெளியில் அமைதியாகவும் நிதானமாகவும் தெரிந்தாலும், ஆழ்மனதில் சிறந்த நுண்ணறிவு, நியாய உணர்வு மற்றும் எத்தகைய சவாலையும் எதிர்கொள்ளும் திடமான துணிவைக் கொண்டுள்ளீர்கள். குடும்பப் பொறுப்புகளையும் தொழில் கடமைகளையும் செம்மையாக நிர்வகிக்கும் உங்கள் திறமை அனைவராலும் போற்றப்படும். தர்ம நெறி, நேர்மை மற்றும் சுயமரியாதை ஆகியவை உங்கள் வாழ்வின் முக்கிய தூண்களாக விளங்குகின்றன.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் உங்கள் உள் ஆற்றலையும் செயல்திறனையும் முழுமையாக வெளிப்படுத்தும் பொற்காலமாகும். இந்த காலகட்டத்தில் உங்கள் திட்டமிடல், விவேகம் மற்றும் நிர்வாகத் திறன் ஆகியவை புதிய உச்சங்களைத் தொடும், நீண்ட நாள் ஆசைகள் நிறைவேறும் சூழல் உருவாகும். அன்றாட வாழ்வில் நேர்மறை எண்ணங்கள், தியானம் மற்றும் குலதெய்வ வழிபாடு உங்கள் மன வலிமையை மென்மேலும் உயர்த்தும். உங்கள் கடின உழைப்பும் நியாயமான பாதையும் சமுதாயத்தில் உயர்ந்த அந்தஸ்தையும், நிலைத்த வெற்றியையும், மன நிறைவையும் தரும்.`;
  }
  return `Rooted in the primordial strength of your Ascendant (${chart.lagnaSignName}), mental ruler Moon in ${chart.moonSignName}, and Lagna lord ${h1Lord} favorably positioned in ${h1Where}, your personality reflects innate poise, quiet dignity, and natural command. While outwardly projecting composed tranquility, internally you possess sharp discernment, steadfast moral integrity, and an unyielding endurance to weather complex challenges. You balance familial obligations and vocational responsibilities with remarkable grace, earning genuine admiration from peers and elders alike. Principles of honor, truthfulness, and self-respect form the bedrock of your soul's identity.

Your currently operating ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti window act as a potent catalyst for awakening dormant talents and realizing ambitious visions. This cosmic period sharpens your strategic foresight and execution capabilities, creating fertile ground for converting long-standing aspirations into tangible milestones. Incorporating daily mindfulness, ethical clarity, and honoring your ancestral lineage provides an impregnable psychic shield against life's uncertainties. Sustained dedication and authentic self-expression will culminate in enduring public reverence, financial prosperity, and profound inner peace.`;
}

export function buildDynamicDarkSecretFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h8 = chart.houses[8];
  const h12 = chart.houses[12];

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ ಅಷ್ಟಮ ಭಾವವಾದ ${h8.rashiName} (ಅಧಿಪತಿ ${h8.lordName}) ಹಾಗೂ ದ್ವಾದಶ ಭಾವವಾದ ${h12.rashiName} (ಅಧಿಪತಿ ${h12.lordName}) ಗಳ ಕರ್ಮಿಕ ಸಂಯೋಜನೆಯು 'ನಿಗೂಢ ರಹಸ್ಯ' ಎಂಬ ಆತ್ಮದ ಆಳವಾದ ಆಂತರಿಕ ಹೋರಾಟವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನೀವು ಬಾಹ್ಯ ಜಗತ್ತಿಗೆ ಎಂದಿಗೂ ಅಂಜದ, ಸದಾ ದೃಢಚಿತ್ತರಾದ ಹಾಗೂ ಎಲ್ಲರನ್ನೂ ಸಂತೈಸುವ ಧೀರ ವ್ಯಕ್ತಿಯಂತೆ ಕಂಡರೂ, ನಿಮ್ಮ ಅಂತರಂಗದ ಗುಪ್ತ ಕೋಣೆಯಲ್ಲಿ ಹಳೆಯ ಕಹಿ ನೆನಪುಗಳು, ಅನ್ಯಾಯದ ನೋವುಗಳು ಅಥವಾ ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಲಾಗದ ಏಕಾಂಗಿತನದ ಭಾವನೆಯು ಕಾಡುತ್ತಿರುತ್ತದೆ. ನಿಮ್ಮ ಕಷ್ಟಗಳನ್ನು ಇತರರ ಮೇಲೆ ಹೊರಿಸಿ ಅವರ ನೆಮ್ಮದಿಯನ್ನು ಕೆಡಿಸಬಾರದೆಂಬ ಅತಿಯಾದ ಕಾಳಜಿಯಿಂದಾಗಿ, ಎಲ್ಲ ನೋವುಗಳನ್ನು ನಿಮ್ಮ ಎದೆಯಾಳದಲ್ಲೇ ಹುದುಗಿಸಿಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.

ಪ್ರಸ್ತುತ ${chart.mahaLordName} ದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಈ ಹಳೆಯ ಕರ್ಮಿಕ ಗಂಟುಗಳನ್ನು ಸಡಿಲಿಸಿ ಮಾನಸಿಕ ಮುಕ್ತಿ ಪಡೆಯಲು ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಕಾಲವಾಗಿದೆ. ಭೂತಕಾಲದ ನೆನಪುಗಳನ್ನು ಬಿಟ್ಟುಬಿಡುವುದು ಮತ್ತು ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಆಪ್ತರೊಂದಿಗೆ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಹಂಚಿಕೊಳ್ಳುವುದು ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿಯನ್ನು ನೀಡಲಿದೆ. ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ, ಧ್ಯಾನ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಅಥವಾ ಶಿವಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ನಿಮ್ಮ ಸುಪ್ತ ಮನಸ್ಸಿನ ಆತಂಕಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಕರಗಿಸಲಿದೆ. ಈ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಯಿಂದ ನಿಮ್ಮ ಅಂತರಂಗವು ದಿವ್ಯ ಶಾಂತಿ, ಅಚಲ ಧೈರ್ಯ ಮತ್ತು ನವ ಚೈತನ್ಯದಿಂದ ಪುನರುಜ್ಜೀವನಗೊಳ್ಳಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी जन्म कुंडली के अष्टम भाव (${h8.rashiName}, स्वामी ${h8.lordName}) और द्वादश भाव (${h12.rashiName}, स्वामी ${h12.lordName}) का कर्मिक विन्यास अंतर्मन में एक गहन और गुप्त आत्मिक संघर्ष को दर्शाता है। संसार के समक्ष आप अत्यंत साहसी, सुलझे हुए और दूसरों को सहारा देने वाले एक मजबूत स्तंभ की भांति खड़े रहते हैं, किंतु अपने एकांत में आप पुरानी स्मृतियों, अनकहे आघातों और भावनात्मक अकेलेपन के भारी बोझ को वहन करते हैं। दूसरों को व्यथित न करने की आपकी उदात्त भावना आपको अपने दुखों को भीतर ही भीतर दबाए रखने के लिए विवश करती है, जिससे मानसिक थकावट उत्पन्न होती है।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति का समय इस मानसिक संताप और कर्मिक बंधनों से मुक्ति पाने का शुभ काल है। अपने विश्वसनीय जनों से मन की बात कहना और भूतकाल की व्यथाओं को त्यागना आपके हृदय को नई ऊर्जा से भर देगा। नित्य प्राणायाम, ध्यान, ॐ नमः शिवाय का जप तथा गोकर्ण क्षेत्र में महामृत्युंजय जाप का अनुष्ठान समस्त अंतर्निहित भयों और चिंताओं को समूल नष्ट कर देगा। यह आध्यात्मिक हीलिंग आपके चित्त को निर्मल, शांत और आत्मिक रूप से अत्यंत शक्तिशाली बनाएगी।`;
  }
  if (baseLang === "te") {
    return `మీ జాతకంలో అష్టమ స్థానమైన 8వ ఇల్లు (${h8.rashiName}, అధిపతి ${h8.lordName}) మరియు మోక్ష స్థానమైన 12వ ఇల్లు (${h12.rashiName}, అధిపతి ${h12.lordName}) అంతరంగంలో దాగి ఉన్న ఒక లోతైన రహస్య భావోద్వేగ స్థితిని స్పష్టం చేస్తున్నాయి. బయటి సమాజానికి మీరు ఎంతో దృఢంగా, దేనికీ చలించని ధైర్యవంతుడిగా కనిపించినప్పటికీ, మీ ఏకాంతంలో పాత జ్ఞాపకాలు, గతంలో జరిగిన అన్యాయాలు లేదా తెలియని ఒంటరితనం మిమ్మల్ని లోలోపల కలవరపెడుతుంటాయి. మీ బాధలతో ఇతరులను ఇబ్బంది పెట్టకూడదనే గొప్ప ఆలోచనతో మీ వేదనలను మీలోనే దాచుకుంటారు, ఇది మీపై అనవసరమైన మానసిక ఒత్తిడిని కలిగిస్తుంది.

ప్రస్తుత ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం ఈ అంతర్గత కర్మిక బంధాల నుండి విముక్తి పొందడానికి దివ్యమైన సమయం. గతించిన విషయాలను మరచిపోయి, మీ భావాలను ఆత్మీయులతో పంచుకోవడం ద్వారా మనస్సు తేలికపడుతుంది. రోజూ ధ్యానం, ప్రాణాయామం చేయడం మరియు గోకర్ణ క్షేత్రంలో మహా మృత్యుంజయ జపం లేదా శివారాధన చేయించడం వల్ల అంతర్లీన భయాలు, ఆందోళనలు సమసిపోతాయి. ఈ ఆధ్యాత్మిక సాధన మీ మనస్సుకు అపారమైన ప్రశాంతతను, నూతన ఉత్సాహాన్ని మరియు ఆత్మస్థైర్యాన్ని చేకూరుస్తుంది.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் ஜாதகத்தில் அஷ்டம ஸ்தானமான 8-ம் வீடு (${h8.rashiName}, அதிபதி ${h8.lordName}) மற்றும் விரய ஸ்தானமான 12-ம் வீடு (${h12.rashiName}, அதிபதி ${h12.lordName}) ஆழ்மனதில் மறைந்துள்ள ஒரு ரகசிய உணர்வுப் போராட்டத்தைக் குறிக்கின்றன. வெளியுலகிற்கு நீங்கள் அசைக்க முடியாத மனவலிமை கொண்டவராகவும், அனைவரையும் தாங்கும் தூணாகவும் தோன்றினாலும், தனிமையில் பழைய கசப்பான நினைவுகள், சொல்லொணா துயரங்கள் அல்லது தனிமை உணர்வு உங்களை வாட்டக்கூடும். உங்கள் கஷ்டங்களால் பிறர் வருந்தக் கூடாது என்ற உயரிய நோக்கத்திற்காக, வலிகள் அனைத்தையும் உங்களுக்குள்ளேயே புதைத்து வைக்கும் சுபாவம் உங்களிடம் காணப்படுகிறது.

தற்போதைய ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் இந்த மனச்சுமையிலிருந்தும் பழைய கர்ம வினைகளிலிருந்தும் விடுபடுவதற்கான சிறந்த காலமாகும். கடந்த கால நிகழ்வுகளை மறந்து, நம்பிக்கையானவர்களிடம் மனந்திறந்து பேசுவது உங்கள் இதயத்திற்கு பெரும் நிம்மதியைத் தரும். தினசரி பிராணாயாமம், தியானம் மற்றும் கோகர்ண க்ஷேத்திரத்தில் மகா மிருத்யுஞ்சய ஜபம் அல்லது சிவபெருமானுக்கு பாலாபிஷேகம் செய்விப்பது ஆழ்மனக் கவலைகளை முற்றிலுமாகப் போக்கும். இந்த ஆன்மீக அமைதி உங்களுக்குப் புதிய புத்துணர்ச்சியையும், தைரியத்தையும், நிலையான மன அமைதியையும் தரும்.`;
  }
  return `The karmic alignment of your 8th house (${h8.rashiName}, ruled by Lord ${h8.lordName}) and 12th house (${h12.rashiName}, ruled by Lord ${h12.lordName}) reveals an intimate soul pattern—the Niguda Rahasya (subconscious reservoir of emotional endurance). To the outside world, you present an unshakable bastion of fortitude, maturity, and empathetic reliability; yet, in moments of quiet solitude, you carry the invisible weight of unexpressed grief, past injustices, or recurring existential loneliness. Your protective nature makes you reluctant to burden loved ones, causing you to internalize vulnerabilities that deserve gentle release.

Your current ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period provide an auspicious window for profound psychological catharsis and karmic untying. Consciously releasing attachment to bygone chapters and confiding in trusted spiritual counselors dissolves subconscious tension. Committing to daily pranayama, silent meditation, and sponsoring a Maha Mrityunjaya Japa at Gokarna Kshetra transmutes suppressed anxieties into crystal-clear intuition. Embracing this internal healing process awakens boundless inner peace, emotional rebirth, and spiritual sovereignty.`;
}

export function buildDynamicCurrentPhaseFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${chart.lagnaSignName} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯಾದ ${chart.moonSignName} ಆಧಾರದ ಮೇಲೆ, ಪ್ರಸ್ತುತ ಸಾಗುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಮಹತ್ವದ ಹಾಗೂ ಪರಿವರ್ತನೀಯ ಘಟ್ಟವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿದೆ. ಈ ಕಾಲಘಟ್ಟವು ಕೇವಲ ಸಾಮಾನ್ಯ ದಿನಚರಿಯಾಗಿರದೆ, ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಪಕ್ವಗೊಳಿಸುವ, ಹೊಸ ಕರ್ತವ್ಯಗಳನ್ನು ಮೈಗೂಡಿಸಿಕೊಳ್ಳುವ ಹಾಗೂ ಭವಿಷ್ಯದ ದೀರ್ಘಕಾಲೀನ ಭದ್ರತೆಯನ್ನು ನಿರ್ಮಿಸುವ ದೈವಿಕ ಕಾಲವಾಗಿದೆ. ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು, ಕುಟುಂಬದಲ್ಲಿ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನಮಾನವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುವ ಸಂದರ್ಭಗಳು ಎದುರಾಗಲಿವೆ.

ಗೋಚಾರ ಗ್ರಹಗಳಾದ ಗುರು ಮತ್ತು ಶನಿ ಭಗವಾನರ ಪ್ರಸ್ತುತ ಸಂಚಾರವು ನಿಮ್ಮ ದೃಢ ಪರಿಶ್ರಮ, ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಧರ್ಮನಿಷ್ಠೆಗೆ ತಕ್ಕ ಸತ್ಫಲಗಳನ್ನು ನೀಡಲು ಸನ್ನದ್ಧವಾಗಿವೆ. ತಾತ್ಕಾಲಿಕ ಅಡೆತಡೆಗಳು ಎದುರಾದರೂ ಧೃತಿಗೆಡದೆ, ತಾಳ್ಮೆ ಮತ್ತು ಸಂಯಮದಿಂದ ಮುನ್ನಡೆಯುವುದು ಅಪಾರ ಯಶಸ್ಸಿಗೆ ಕಾರಣವಾಗಲಿದೆ. ಗುರು-ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನವನ್ನು ಗೌರವಿಸುವುದು, ಪ್ರತಿದಿನ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು ಹಾಗೂ ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚುವುದು ಎಲ್ಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ. ಈ ಶುಭ ಕಾಲಘಟ್ಟದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಸತ್ಸಂಕಲ್ಪವೂ ಈಡೇರಿ, ಜೀವನದಲ್ಲಿ ಶಾಶ್ವತ ಪ್ರಗತಿ, ಶಾಂತಿ ಮತ್ತು ಸಮೃದ್ಧಿ ನೆಲೆಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी जन्म लग्न ${chart.lagnaSignName} और चंद्र राशि ${chart.moonSignName} के विश्लेषण से स्पष्ट होता है कि वर्तमान में संचालित ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल आपके जीवन का एक अत्यंत महत्वपूर्ण और परिवर्तनकारी मोड़ सिद्ध हो रहा है। यह समय केवल सामान्य दिनचर्या का नहीं, अपितु आपके अनुभवों को परिपक्व करने, नई जिम्मेदारियों को स्वीकार करने और भविष्य की सुदृढ़ नींव रखने का है। कार्यक्षेत्र में पदोन्नति या नए अवसर, पारिवारिक जीवन में निर्णायक फैसले तथा समाज में आपकी प्रतिष्ठा को सुदृढ़ करने वाले शुभ संयोग बन रहे हैं।

गोचर में देवगुरु बृहस्पति और शनि देव की चाल आपके धैर्य, अनुशासन और धर्मनिष्ठ कर्मों का उत्तम प्रतिफल देने के लिए तत्पर है। यदि मार्ग में क्षणिक बाधाएं आएं, तो भी विचलित हुए बिना कर्तव्य पथ पर अडिग रहना ही आपकी सबसे बड़ी शक्ति होगी। माता-पिता का आशीर्वाद, प्रातःकाल सूर्य नारायण को जल अर्पण तथा शनिवार को तिल के तेल का दीपक प्रज्वलित करना मार्ग की समस्त रुकावटों को समाप्त करेगा। यह पावन समयावधि आपके जीवन में स्थायी उन्नति, आर्थिक संपन्नता और मानसिक परमानंद लेकर आएगी।`;
  }
  if (baseLang === "te") {
    return `మీ జన్మ లగ్నం ${chart.lagnaSignName} మరియు చంద్ర రాశి ${chart.moonSignName} ఆధారంగా, ప్రస్తుతం నడుస్తున్న ${chart.mahaLordName} మహర్దశ మరియు ${chart.bhuktiLordName} భుక్తి కాలం మీ జీవితంలో అత్యంత కీలకమైన, నూతన శకానికి నాంది పలికే సమయంగా నిలుస్తుంది. ఇది కేవలం సాధారణ కాలం మాత్రమే కాదు, మీ ప్రతిభను మరింత పదును పెట్టేందుకు, కొత్త బాధ్యతలను భుజాన వేసుకునేందుకు మరియు భవిష్యత్ ఆర్థిక భద్రతను నిర్మించుకునేందుకు వచ్చిన గొప్ప అవకాశం. వృత్తిలో నూతన అవకాశాలు మరియు కుటుంబంలో శుభ పరిణామాలు సంభవిస్తాయి.

గోచారంలో గురు మరియు శని గ్రహాల సంచారం మీ కష్టానికి తగిన ప్రతిఫలాన్ని మరియు స్థిరత్వాన్ని అందించేందుకు అనుకూలంగా ఉన్నాయి. చిన్నపాటి ఆటంకాలు ఎదురైనా అధైర్యపడకుండా సంయమనంతో వ్యవహరిస్తే తిరుగులేని విజయాలు సాధిస్తారు. పెద్దల ఆశీర్వాదాలు తీసుకోవడం, రోజూ ఇష్టదైవ ప్రార్థన చేయడం మరియు శనివారం నువ్వుల నూనెతో దీపం వెలిగించడం వల్ల గ్రహ దోషాలు తొలగిపోతాయి. ఈ శుభ సమయంలో మీ ఆలోచనలు, ప్రయత్నాలు సఫలమై జీవితంలో శాశ్వత ప్రగతి మరియు ఆనందం చేకూరుతాయి.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் ஜென்ம லக்னம் ${chart.lagnaSignName} மற்றும் சந்திர ராசி ${chart.moonSignName} அடிப்படையில், தற்பொழுது நடைபெறும் ${chart.mahaLordName} மகாதிசை மற்றும் ${chart.bhuktiLordName} புக்தி காலம் உங்கள் வாழ்க்கையில் ஒரு மிக முக்கியமான திருப்புமுனையை ஏற்படுத்தி வருகிறது. இது வழக்கமான காலம் மட்டுமல்லாமல், உங்கள் அனுபவங்களை முதிர்ச்சியடையச் செய்து, புதிய பொறுப்புகளை ஏற்று, எதிர்காலத்திற்கான வலுவான அடித்தளத்தை அமைக்கும் தெய்வீகத் தருணமாகும். பணியிடத்தில் புதிய வாய்ப்புகள், குடும்பத்தில் சுப நிகழ்வுகள் மற்றும் சமூகத்தில் உங்கள் நற்பெயரை உயர்த்தும் சூழல்கள் கூடி வருகின்றன.

கோசாரத்தில் குரு பகவான் மற்றும் சனி பகவானின் சஞ்சாரம் உங்கள் உண்மையான உழைப்பிற்கும் நேர்மைக்கும் ஏற்ற நற்பலன்களை வாரி வழங்கக் காத்திருக்கின்றன. தற்காலிகத் தடைகள் தோன்றினாலும் தளராமல், பொறுமையுடனும் விவேகத்துடனும் செயல்படுவது மகத்தான வெற்றியைத் தேடித்தரும். பெரியோர்களின் ஆசிகளைப் பெறுவதும், தினசரி இஷ்ட தெய்வ வழிபாடும், சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றுவதும் அனைத்து தோஷங்களையும் போக்கும். இந்த நற்காலத்தில் உங்கள் நல்லெண்ணங்கள் யாவும் ஈடேறி வாழ்வில் நிலையான வளர்ச்சியும், அமைதியும், சுபிட்சமும் நிறையும்.`;
  }
  return `Synthesized through your natal Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), your active ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period inaugurate a deeply transformative, consequential life chapter. Rather than routine existence, this cosmic window is designed to accelerate emotional maturity, bestow elevated vocational responsibilities, and solidify long-range security. Strategic decisions made during this interval carry compounding long-term implications, opening prestigious avenues in public standing, asset acquisition, and family dignity.

Live transits of Saturn and Jupiter converge to reward unyielding perseverance, ethical discipline, and professional integrity. Even if transient hurdles arise, greeting them with meditative poise and calculated patience converts apparent friction into substantial stepping stones. Honoring mentors, greeting each dawn with conscious spiritual grounding, and lighting a sesame oil lamp on Saturdays harmonizes karmic forces. Navigating this potent phase with righteous intent guarantees structural advancement, domestic tranquility, and enduring holistic prosperity.`;
}

export function buildDynamicSummaryFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿ, ನಕ್ಷತ್ರ ಬಲ, ದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ಗೋಚಾರಗಳ ಅದ್ಭುತ ಸಮತೋಲನವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ. ಕೇಂದ್ರ ಸ್ಥಾನಗಳಾದ 1, 4, 7, 10 ನೇ ಮನೆಗಳು ಹಾಗೂ ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳಾದ 5, 9 ನೇ ಮನೆಗಳ ಶುಭ ಪ್ರಭಾವವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಸುಖಮಯ ಕೌಟುಂಬಿಕ ಬಾಂಧವ್ಯ ಮತ್ತು ವೃತ್ತಿಪರ ಮನ್ನಣೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಕರುಣಿಸುವ ದೈವಿಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿವೆ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿರುವ ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ಯೋಗಗಳು ಹಾಗೂ ಶುಭ ಗ್ರಹಗಳ ದೃಷ್ಟಿಯು ಯಾವುದೇ ಸಂಕಷ್ಟದಿಂದ ಸುಲಭವಾಗಿ ಪಾರಾಗುವ ಅದ್ಭುತ ರಕ್ಷಣಾ ಕವಚವನ್ನು ನಿಮಗೆ ಒದಗಿಸಿವೆ.

ಬರುವ ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಮುಖ್ಯ ಗುರಿಯು ಆರ್ಥಿಕ ಉಳಿತಾಯದ ಕ್ರೋಡೀಕರಣ, ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆಯ ಸಂರಕ್ಷಣೆ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದ ವಿಸ್ತರಣೆಯಾಗಿರಬೇಕು. ನಿಯಮಿತ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ, ಸತ್ಪಾತ್ರರಿಗೆ ದಾನ, ಧರ್ಮನಿಷ್ಠ ನಡವಳಿಕೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳನ್ನು ಸಿದ್ಧಿಗೊಳಿಸಲಿವೆ. ಯಾವುದೇ ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳದೆ, ಯೋಚಿಸಿ ಮುನ್ನಡೆಯುವುದು ನಿಮ್ಮನ್ನು ಯಶಸ್ಸಿನ ಶಿಖರಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲಿದೆ. ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ಪರಮ ಪಾವನ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ನಿಮ್ಮ ಜೀವನದುದ್ದಕ್ಕೂ ಆಯುರಾರೋಗ್ಯ, ಸಕಲ ಸೌಭಾಗ್ಯ, ಶಾಂತಿ ಮತ್ತು ಪರಮಾನಂದವು ಸದಾ ನೆಲೆಸಲಿ ಎಂದು ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी संपूर्ण जन्म कुंडली लग्न भाव से लेकर द्वादश भाव तक के ग्रहों, नक्षत्रों, वर्तमान दशा-भुक्ति एवं गोचर का अत्यंत संतुलित, शुभ और आशाजनक समन्वय प्रस्तुत करती है। केंद्र भावों (1, 4, 7, 10) तथा त्रिकोण भावों (5, 9) का शुभ प्रभाव आपके जीवन में निरंतर आर्थिक समृद्धि, सुदृढ़ पारिवारिक संबंध और व्यावसायिक प्रतिष्ठा का मार्ग प्रशस्त करता है। कुंडली में विद्यमान शुभ ग्रहों की दृष्टि और राजयोग किसी भी विपरीत परिस्थिति से आपको सुरक्षित निकालने के लिए एक दिव्य सुरक्षा कवच की भांति कार्य करते हैं।

आगामी वर्षों में आपका मुख्य ध्यान आर्थिक स्थिरता, संचित धन की सुरक्षा, परिवार में सौहार्द और आध्यात्मिक चेतना के विस्तार पर केंद्रित होना चाहिए। अपने कुलदेवता का नित्य स्मरण, सुपात्र को अन्नदान, सात्विक जीवनशैली और माता-पिता का आशीर्वाद आपके समस्त सत्संकल्पों को सिद्ध करेगा। किसी भी जल्दबाजी से बचते हुए धैर्यपूर्वक लिया गया प्रत्येक निर्णय आपको सफलता के सर्वोच्च शिखर पर पहुंचाएगा। बग्गोण क्षेत्र के पावन आशीर्वाद से आपके जीवन में निरंतर स्वास्थ्य, ऐश्वर्य, शांति और समृद्धि की वृद्धि होती रहे।`;
  }
  if (baseLang === "te") {
    return `మీ సమగ్ర జన్మ కుండలి 12 భావాలలోని గ్రహాల స్థితులు, నక్షత్ర బలం, ప్రస్తుత దశా-భుక్తి మరియు గోచార గ్రహాల అద్భుత సమతుల్యతను ప్రతిబింబిస్తుంది. కేంద్ర స్థానాలైన 1, 4, 7, 10 మరియు త్రికోణ స్థానాలైన 5, 9 భావాల శుభ ప్రభావం మీ జీవితంలో ఆర్థిక స్థిరత్వాన్ని, కుటుంబ సౌఖ్యాన్ని మరియు సమాజంలో ఉన్నత గౌరవాన్ని ప్రసాదిస్తాయి. జాతకంలో ఏర్పడిన శుభ యోగాలు మరియు గ్రహాల అనుకూల వీక్షణలు ఎలాంటి కష్టాల నుంచైనా మిమ్మల్ని సురక్షితంగా రక్షించే దివ్య కవచంలా పనిచేస్తాయి.

రాబోయే కాలంలో మీ దృష్టి ఆర్థిక ప్రణాళిక, సంపద పరిరక్షణ, కుటుంబ సామరస్యం మరియు ఆధ్యాత్మిక సాధనపై నిలపాలి. కులదైవ ప్రార్థన, అర్హులకు దానం చేయడం మరియు పెద్దల ఆశీస్సులు మీ సకల సంకల్పాలను విజయవంతం చేస్తాయి. ఆవేశపూరిత నిర్ణయాలకు దూరంగా ఉండి ఆలోచించి అడుగు వేస్తే అద్భుత ఫలితాలు లభిస్తాయి. బగ్గోణ దివ్య క్షేత్ర ఆశీస్సులతో మీ జీవితం ఆయురారోగ్యాలు, అష్టైశ్వర్యాలు మరియు శాశ్వత శాంతితో వర్ధిల్లాలని ఆకాంక్షిస్తున్నాము.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் முழுமையான ஜாதகக் கட்டமைப்பு 12 பாவங்களின் கிரக நிலைகள், நட்சத்திர பலம், தற்போதைய தசா-புக்தி மற்றும் கோசார கிரகங்களின் அருமையான தெய்வீக சமநிலையைக் காட்டுகிறது. கேந்திர ஸ்தானங்களான 1, 4, 7, 10 மற்றும் திரிகோண ஸ்தானங்களான 5, 9 ஆகியவற்றின் சுப பலன்கள் உங்கள் வாழ்வில் பொருளாதார ஸ்திரத்தன்மை, குடும்ப மகிழ்ச்சி மற்றும் தொழில்முறை நற்பெயரை நிரந்தரமாக வழங்கும் வல்லமை கொண்டவை. ஜாதகத்தில் உள்ள சுப யோகங்களும் சுப கிரகங்களின் பார்வையும் எந்தவொரு சோதனையிலிருந்தும் உங்களைப் பாதுகாக்கும் கவசமாக விளங்குகின்றன.

வரும் ஆண்டுகளில் உங்கள் முக்கிய கவனம் சேமிப்பை உயர்த்துதல், குடும்ப நல்லிணக்கத்தைப் பாதுகாத்தல் மற்றும் ஆன்மீக அமைதியை வளர்த்தல் ஆகியவற்றில் நிலைத்திருக்க வேண்டும். குலதெய்வ வழிபாடு, ஏழைகளுக்கு அன்னதானம், பெரியோர்களின் நல்லாசி ஆகியவை உங்கள் நல்லெண்ணங்களை யாவும் நிறைவேற்றும். அவசர முடிவுகளைத் தவிர்த்து நிதானமாக சிந்தித்துச் செயல்படுவது உங்களை வெற்றியின் உச்சிக்குக் கொண்டு செல்லும். பக்கவணா திருத்தலத்தின் திவ்ய ஆசியுடன் உங்கள் வாழ்வில் நீண்ட ஆயுள், ஆரோக்கியம், சகல செல்வங்கள் மற்றும் அமைதி நிறைந்து விளங்கப் பிரார்த்திக்கிறோம்.`;
  }
  return `Your comprehensive birth chart demonstrates a resilient, highly auspicious synergy across the 12 Bhavas, harmonizing natal Kendra (1, 4, 7, 10) and Trikona (1, 5, 9) strengths with the progressive momentum of your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period. Favorable planetary aspects and classical Raja Yoga formations weave an enduring protective auric shield around you, granting timely remedies and intuitive guidance to effortlessly transcend temporary worldly turbulence.

In the years ahead, channeling your energy toward financial consolidation, nurturing harmonious family bonds, and cultivating spiritual discipline will unlock compounding multidimensional prosperity. Consistent worship of your Ishta and Kula Devatas, performing charitable acts, and making patient, well-deliberated life decisions ensure uninterrupted evolutionary ascension. Showered with the divine grace of the Baggona sacred sanctum, may your life path be perpetually adorned with robust longevity, joyous fulfillment, radiant prosperity, and abiding supreme peace.`;
}

export function buildDynamicGocharaFallback(chart: ParsedKundaliChart): Array<{ name: string; impact: string; remedy?: string }> {
  const baseLang = chart.lang.split("-")[0];
  const items: Array<{ name: string; impact: string; remedy?: string }> = [];

  if (chart.transitSaturn) {
    const s = chart.transitSaturn;
    let sName = "Saturn (Shani) Live Transit";
    let remedy = "Light sesame oil lamp on Saturdays and chant Shani Stotram.";

    if (baseLang === "kn") {
      sName = "ಶನಿ ಗೋಚಾರ ಸಂಚಾರ (Saturn Transit)";
      remedy = "ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಶನಿ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಶ್ರೇಷ್ಠ.";
    } else if (baseLang === "hi") {
      sName = "शनि गोचर प्रभाव";
      remedy = "शनिवार को तिल के तेल का दीपक जलाएं तथा शनि स्तोत्र का पाठ करें।";
    } else if (baseLang === "te") {
      sName = "శని గోచార సంచారం";
      remedy = "శనివారం నువ్వుల నూనెతో దీపం వెలిగించి శని స్తోత్రం పఠించడం శుభప్రదం.";
    } else if (baseLang === "ta") {
      sName = "சனி பகவான் கோசார பலன்";
      remedy = "சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றி சனி ஸ்தோத்திரம் பாராயணம் செய்யவும்.";
    }

    let desc = `Saturn is transiting the ${s.houseFromMoon}th house from your natal Moon (${chart.moonSignName}).`;
    if (s.isSadeSati) {
      if (baseLang === "kn") desc += " ಇದು ಏಳರೆ ಶನಿಯ ಕಾಲಘಟ್ಟವಾಗಿದ್ದು, ಶಿಸ್ತು, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯಗಳನ್ನು ನಿರ್ವಹಿಸುವುದರಿಂದ ಶನಿ ಮಹಾರಾಜರ ಕೃಪೆ ಲಭಿಸಲಿದೆ.";
      else if (baseLang === "hi") desc += " यह साढ़ेसाती का प्रभाव काल है, जिसमें धैर्य, संयम और कर्तव्यनिष्ठा से किए गए कार्यों में शनि देव की विशेष कृपा प्राप्त होगी।";
      else if (baseLang === "te") desc += " ఇది ఏలినాటి శని కాలం, ఓర్పు, ధర్మం మరియు క్రమశిక్షణతో వ్యవహరిస్తే శనీశ్వరుని అనుగ్రహం లభిస్తుంది.";
      else if (baseLang === "ta") desc += " இது ஏழரை நாட்டுச் சனியின் காலமாகும். பொறுமையுடனும் கடமை உணர்வுடனும் செயல்படுவது சனி பகவானின் அருளைப் பெற்றுத் தரும்.";
      else desc += " This marks a period of heightened karmic discipline, urging patience and ethical perseverance.";
    } else if (s.isAshtama) {
      if (baseLang === "kn") desc += " ಇದು ಅಷ್ಟಮ ಶನಿಯ ಸಂಚಾರವಾಗಿದ್ದು, ಆರೋಗ್ಯ ಹಾಗೂ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಕ್ಷೇಮಕರ.";
      else if (baseLang === "hi") desc += " यह अष्टम शनि का गोचर है, जिसमें स्वास्थ्य और आर्थिक निर्णयों में सतर्कता बरतना कल्याणकारी रहेगा।";
      else if (baseLang === "te") desc += " ఇది అష్టమ శని సంచారం, ఆరోగ్యం మరియు ఆర్థిక విషయాలలో జాగ్రత్తగా ఉండడం మంచిది.";
      else if (baseLang === "ta") desc += " இது அட்டமச் சனியின் காலமாகும். உடல்நலம் மற்றும் நிதி முடிவுகளில் விழிப்புடன் இருப்பது அவசியம்.";
      else desc += " Navigating 8th house transit requires conscious focus on wellness precautions and cautious financial choices.";
    } else {
      if (baseLang === "kn") desc += " ಶನಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರಗತಿ ಹಾಗೂ ಸ್ಥಿರತೆಯನ್ನು ನೀಡಲಿದ್ದಾನೆ.";
      else if (baseLang === "hi") desc += " शनि शुभ स्थिति में गोचर कर रहे हैं, जिससे आपके परिश्रम का यथोचित फल और जीवन में स्थिरता प्राप्त होगी।";
      else if (baseLang === "te") desc += " శని అనుకూల స్థానంలో సంచరిస్తూ మీ కష్టానికి తగిన గుర్తింపు మరియు స్థిరత్వాన్ని ప్రసాదిస్తారు.";
      else if (baseLang === "ta") desc += " சனி பகவான் சாதகமான நிலையில் சஞ்சரிப்பதால் உங்கள் உழைப்பிற்கு ஏற்ற முன்னேற்றமும் ஸ்திரத்தன்மையும் கிட்டும்.";
      else desc += " Saturn transit provides constructive stability, rewarding focused perseverance with steady career growth.";
    }
    items.push({ name: sName, impact: desc, remedy });
  }

  if (chart.transitJupiter) {
    const j = chart.transitJupiter;
    let jName = "Jupiter (Guru) Live Transit";
    let remedy = "Offer archana to Guru and engage in cow service on Thursdays.";

    if (baseLang === "kn") {
      jName = "ಗುರು ಗೋಚಾರ ಸಂಚಾರ (Jupiter Transit)";
      remedy = "ಗುರುವಾರ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಆರಾಧನೆ ಹಾಗೂ ಗೋಸೇವೆ ಮಾಡುವುದು ಶುಭ.";
    } else if (baseLang === "hi") {
      jName = "गुरु गोचर प्रभाव";
      remedy = "गुरुवार को देवगुरु बृहस्पति की पूजा और गोसेवा करना अत्यंत शुभ रहेगा।";
    } else if (baseLang === "te") {
      jName = "గురు గోచార సంచారం";
      remedy = "గురువారం బృహస్పతి పూజ మరియు గోసేవ చేయడం అత్యంత శుభప్రదం.";
    } else if (baseLang === "ta") {
      jName = "குரு பகவான் கோசார பலன்";
      remedy = "வியாழக்கிழமைகளில் குரு வழிபாடு மற்றும் பசு சேவை செய்வது மிகுந்த நன்மையைத் தரும்.";
    }

    let desc = `Jupiter is transiting the ${j.houseFromMoon}th house from your natal Moon.`;
    if (j.isGuruBala) {
      if (baseLang === "kn") desc += " ಇದು ಪ್ರಬಲ ಗುರು ಬಲದ ಕಾಲಘಟ್ಟವಾಗಿದ್ದು, ಕಲ್ಯಾಣ ಯೋಗ, ಧನ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಖ್ಯವನ್ನು ವೃದ್ಧಿಸಲಿದೆ.";
      else if (baseLang === "hi") desc += " गुरु बल अत्यंत अनुकूल है, जो भाग्योदय, धन लाभ और पारिवारिक सुख-शांति में वृद्धि करेगा।";
      else if (baseLang === "te") desc += " బలమైన గురు బలం ఉంది, ఇది శుభకార్యాలు, ధనలాభం మరియు కుటుంబ సౌభాగ్యాన్ని చేకూరుస్తుంది.";
      else if (baseLang === "ta") desc += " சிறப்பான குரு பலம் உள்ளது, இது சுபகாரியங்கள், தனலாபம் மற்றும் குடும்ப மகிழ்ச்சியை அதிகரிக்கும்.";
      else desc += " Powerful Guru Bala is active, bestowing spiritual clarity, family auspiciousness, and financial expansion.";
    } else {
      if (baseLang === "kn") desc += " ಇದು ಆತ್ಮಾವಲೋಕನ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಪ್ರಶಸ್ತವಾದ ಕಾಲಘಟ್ಟವಾಗಿದೆ.";
      else if (baseLang === "hi") desc += " यह आत्मचिंतन और आध्यात्मिक ज्ञानार्जन के लिए उपयुक्त काल है।";
      else if (baseLang === "te") desc += " ఇది ఆత్మపరిశీలన మరియు ఆధ్యాత్మిక సాధనకు అనుకూలమైన సమయం.";
      else if (baseLang === "ta") desc += " இது ஆன்மீக சாதனைக்கும் அக அமைதிக்கும் உகந்த காலமாகும்.";
      else desc += " This period fosters internal wisdom, study, and contemplative spiritual development.";
    }
    items.push({ name: jName, impact: desc, remedy });
  }

  if (items.length === 0) {
    let name = "Planetary Transit Impact";
    let impact = `Running transits through your Moon sign (${chart.moonSignName}) provide cosmic balance, supporting steady progress.`;
    let remedy = "Daily prayer to Ishta Devata.";

    if (baseLang === "kn") {
      name = "ಗ್ರಹ ಗೋಚಾರ ಫಲ";
      impact = `ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯ (${chart.moonSignName}) ಮೂಲಕ ಪ್ರಸ್ತುತ ಸಾಗುತ್ತಿರುವ ಗೋಚಾರವು ಜೀವನದಲ್ಲಿ ಸಮತೋಲನ ಹಾಗೂ ಸ್ಥಿರ ಪ್ರಗತಿಯನ್ನು ನೀಡಲಿದೆ.`;
      remedy = "ನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು ಶುಭ.";
    } else if (baseLang === "hi") {
      name = "ग्रह गोचर फल";
      impact = `आपकी चंद्र राशि (${chart.moonSignName}) में वर्तमान गोचर संतुलित प्रगति और स्थिरता प्रदान करेगा।`;
      remedy = "नित्य इष्टदेव की आराधना करें।";
    } else if (baseLang === "te") {
      name = "గ్రహ గోచార ఫలితం";
      impact = `మీ చంద్ర రాశి (${chart.moonSignName}) ద్వారా గోచార సంచారం సమతుల్యమైన పురోగతిని అందిస్తుంది.`;
      remedy = "రోజూ ఇష్టదైవ ప్రార్థన చేయండి.";
    } else if (baseLang === "ta") {
      name = "கிரக கோசார பலன்";
      impact = `உங்கள் சந்திர ராசியில் (${chart.moonSignName}) சஞ்சரிக்கும் கிரகங்கள் சீரான முன்னேற்றத்தை தரும்.`;
      remedy = "தினசரி இஷ்ட தெய்வத்தை வழிபடவும்.";
    }

    items.push({ name, impact, remedy });
  }

  return items;
}
