import type { TFunction } from "i18next";
import type { AyanamsaModel, KundliOutput, PlanetName, PredictionOutput } from "./AstroTypes";
import { PlanetName as PN } from "./AstroTypes";
import { siderealLongitudes } from "./EphemerisEngine";
import { degreeToRashi, normalizeDegree } from "./AstroMath";
import { ageDecimalYearsAt } from "./birthTime";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";

export type PredictionBirthContext = {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  ayanamsaModel?: AyanamsaModel;
};

// Seed-based deterministic random variation generator
const getVariation = (seed: string, options: string[]): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % options.length;
  return options[idx] || options[0] || "";
};

const PLANET_NAMES: Record<PlanetName, Record<string, string>> = {
  [PN.Sun]: { en: "Sun (Surya)", kn: "ರವಿ (ಸೂರ್ಯ)", hi: "सूर्य (आदित्य)", te: "సూర్యుడు", ta: "சூரியன்" },
  [PN.Moon]: { en: "Moon (Chandra)", kn: "ಚಂದ್ರ", hi: "चन्द्र (सोम)", te: "చంద్రుడు", ta: "சந்திரன்" },
  [PN.Mars]: { en: "Mars (Mangala)", kn: "ಮಂಗಳ", hi: "मंगल (भौम)", te: "మంగళగ్రహం (కుజుడు)", ta: "செவ்வாய்" },
  [PN.Mercury]: { en: "Mercury (Budha)", kn: "ಬುಧ", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  [PN.Jupiter]: { en: "Jupiter (Guru)", kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", hi: "बृहस्पति (गुरु)", te: "బృహస్పతి (గురుడు)", ta: "குரு" },
  [PN.Venus]: { en: "Venus (Shukra)", kn: "ಶುಕ್ರ", hi: "शुक्र", te: "शुक्रుడు", ta: "சுக்கிரன்" },
  [PN.Saturn]: { en: "Saturn (Shani)", kn: "ಶನಿ ದೇವ್", hi: "शनि", te: "శని దేవుడు", ta: "சனி பகவான்" },
  [PN.Rahu]: { en: "Rahu", kn: "ರಾಹು", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  [PN.Ketu]: { en: "Ketu", kn: "ಕೇತು", hi: "केतु", te: "కేతువు", ta: "கேது" }
};

const RASHI_NAMES: Record<string, Record<string, string>> = {
  Mesha: { en: "Aries (Mesha)", kn: "ಮೇಷ", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  Vrishabha: { en: "Taurus (Vrishabha)", kn: "ವೃಷಭ", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  Mithuna: { en: "Gemini (Mithuna)", kn: "ಮಿಥುನ", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  Karka: { en: "Cancer (Karka)", kn: "ಕಟಕ", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  Simha: { en: "Leo (Simha)", kn: "ಸಿಂಹ", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  Kanya: { en: "Virgo (Kanya)", kn: "ಕನ್ಯಾ", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  Tula: { en: "Libra (Tula)", kn: "ತುಲಾ", hi: "तुला", te: "తులా", ta: "துலாம்" },
  Vrischika: { en: "Scorpio (Vrischika)", kn: "ವೃಶ್ಚಿಕ", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  Dhanu: { en: "Sagittarius (Dhanu)", kn: "ಧನುಸ್ಸು", hi: "धनु", te: "ధనస్సు", ta: "தனுசு" },
  Makara: { en: "Capricorn (Makara)", kn: "ಮಕರ", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  Kumbha: { en: "Aquarius (Kumbha)", kn: "ಕುಂಭ", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்" },
  Meena: { en: "Pisces (Meena)", kn: "ಮೀನ", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

const LUCKY_COLORS: Record<string, string>[] = [
  { en: "Emerald Green", kn: "ಪಚ್ಚೆ ಹಸಿರು", hi: "पन्ना हरा", te: "పచ్చ రంగు", ta: "பச்சை நிறம்" },
  { en: "Deep Saffron", kn: "ಕಡು ಕೇಸರಿ", hi: "गहरा केसरिया", te: "కేసరి రంగు", ta: "குங்கும நிறம்" },
  { en: "Royal Blue", kn: "ರಾಯಲ್ ಬ್ಲೂ", hi: "ರಾಯಲ್ ಬ್ಲೂ", te: "నీలం రంగు", ta: "நீல நிறம்" },
  { en: "Bright Yellow", kn: "ಹಳದಿ", hi: "चमकीला पीला", te: "పసుపు రంగు", ta: "மஞ்சள் நிறம்" },
  { en: "Crimson Red", kn: "ರಕ್ತ ಕೆಂಪು", hi: "गहरा लाल", te: "ఎరుపు రంగు", ta: "சிவப்பு நிறம்" },
  { en: "Pure White", kn: "ಶುಭ್ರ ಬಿಳಿ", hi: "सफेद", te: "తెలుపు రంగు", ta: "வெள்ளை நிறம்" }
];

const LUCKY_DIRECTIONS: Record<string, string>[] = [
  { en: "East (Purva)", kn: "ಪೂರ್ವ", hi: "पूर्व", te: "తూర్పు", ta: "கிழக்கு" },
  { en: "North (Uttara)", kn: "ಉತ್ತರ", hi: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு" },
  { en: "Northeast (Ishanya)", kn: "ಈಶಾನ್ಯ", hi: "ईशान कोण", te: "ఈశాన్యం", ta: "வடகிழக்கு" },
  { en: "West (Pashchima)", kn: "ಪಶ್ಚಿಮ", hi: "पश्चिम", te: "పడమర", ta: "மேற்கு" }
];

const noonUtcForCalendarDate = (d: Date): Date =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));

const getTransitHouses = (targetDate: Date, natalMoonRashiIdx: number, model: AyanamsaModel) => {
  const longs = siderealLongitudes(noonUtcForCalendarDate(targetDate), model);
  return {
    sun: (degreeToRashi(longs.sun).index - natalMoonRashiIdx + 12) % 12 + 1,
    moon: (degreeToRashi(longs.moon).index - natalMoonRashiIdx + 12) % 12 + 1,
    mars: (degreeToRashi(longs.mars).index - natalMoonRashiIdx + 12) % 12 + 1,
    mercury: (degreeToRashi(longs.mercury).index - natalMoonRashiIdx + 12) % 12 + 1,
    jupiter: (degreeToRashi(longs.jupiter).index - natalMoonRashiIdx + 12) % 12 + 1,
    venus: (degreeToRashi(longs.venus).index - natalMoonRashiIdx + 12) % 12 + 1,
    saturn: (degreeToRashi(longs.saturn).index - natalMoonRashiIdx + 12) % 12 + 1,
    rahu: (degreeToRashi(longs.rahu).index - natalMoonRashiIdx + 12) % 12 + 1,
    ketu: (degreeToRashi(longs.ketu).index - natalMoonRashiIdx + 12) % 12 + 1,
  };
};

export const getDynamicPrediction = (
  period: "daily" | "weekly" | "monthly" | "yearly",
  kundli: KundliOutput,
  targetDate: Date,
  t: TFunction,
  personName?: string,
  birth?: PredictionBirthContext
): PredictionOutput => {
  const model = birth?.ayanamsaModel ?? "lahiri";
  const natalMoonRashi = kundli.moonSign.sanskrit;
  const natalMoonRashiIdx = kundli.moonSign.index;
  const name = personName || "Seeker";

  // Determine language code (en, kn, hi, te, ta)
  let lang = t("nav.home") === "ಮನೆ" ? "kn" : "en";
  if (t("nav.home") === "होम") lang = "hi";
  if (t("nav.home") === "ఇల్లు") lang = "te";
  if (t("nav.home") === "முகப்பு") lang = "ta";

  // Calculate transits
  const transits = getTransitHouses(targetDate, natalMoonRashiIdx, model);

  // Retrieve active Dasha-Bhukti
  let dashaLord: PlanetName = PN.Jupiter;
  let bhuktiLord: PlanetName = PN.Venus;
  let ageYears = 30;

  if (birth) {
    ageYears = ageDecimalYearsAt(birth.birthDate, birth.birthTime, birth.latitude, birth.longitude, targetDate);
    if (ageYears > 0) {
      const vb = findBhuktiAtAge(kundli, ageYears);
      if (vb) {
        dashaLord = vb.maha.planet;
        bhuktiLord = vb.bhukti;
      }
    }
  }

  // Fetch translated names
  const transRashiName = RASHI_NAMES[natalMoonRashi]?.[lang] || natalMoonRashi;
  const dashaName = PLANET_NAMES[dashaLord]?.[lang] || dashaLord;
  const bhuktiName = PLANET_NAMES[bhuktiLord]?.[lang] || bhuktiLord;

  // Create unique seed for deterministic randomization to guarantee non-constant wording
  const seed = `${name}_${natalMoonRashi}_${period}_${targetDate.getFullYear()}_${targetDate.getMonth()}_${targetDate.getDate()}`;

  // Evaluate transit scoring (rating)
  let score = 3.5; // Base
  if ([2, 5, 7, 9, 11].includes(transits.jupiter)) score += 0.5;
  if ([3, 6, 11].includes(transits.saturn)) score += 0.5;
  if ([12, 1, 2, 4, 8].includes(transits.saturn)) score -= 0.5;
  if ([3, 6, 10, 11].includes(transits.sun)) score += 0.3;
  if (dashaLord === PN.Jupiter || dashaLord === PN.Venus || dashaLord === PN.Mercury) score += 0.2;
  const rating = Math.max(1, Math.min(5, Math.round(score)));

  // Generate Lucky properties
  const colorOptions = LUCKY_COLORS.map(c => c[lang] || c.en || "");
  const luckyColor = getVariation(seed + "_color", colorOptions);

  const directionOptions = LUCKY_DIRECTIONS.map(d => d[lang] || d.en || "");
  const luckyDirection = getVariation(seed + "_dir", directionOptions);

  const luckyNumber = (seed.length % 9) + 1;

  // Title generation
  const titles = {
    en: [
      `Auspicious Transits for ${name} (${transRashiName} Rashi)`,
      `Cosmic Energy Guidance for ${transRashiName} & Dasha ${dashaLord}-${bhuktiLord}`,
      `Astrological Outlook: ${period.toUpperCase()} Rhythms for ${name}`
    ],
    kn: [
      `${name} ಅವರ (${transRashiName} ರಾಶಿ) ${period === "daily" ? "ದೈನಂದಿನ" : period === "weekly" ? "ಸಾಪ್ತಾಹಿಕ" : period === "monthly" ? "ಮಾಸಿಕ" : "ವಾರ್ಷಿಕ"} ಗೋಚಾರ ಫಲ`,
      `${dashaName} ದಶಾ ಹಾಗೂ ${bhuktiName} ಭುಕ್ತಿಯ ಶುಭ ಪ್ರಭಾವಗಳು`,
      `${transRashiName} ರಾಶಿಯ ನಕ್ಷತ್ರ ಫಲ ಹಾಗೂ ಗ್ರಹ ಬಲ ವಿಶ್ಲೇಷಣೆ`
    ],
    hi: [
      `${name} (${transRashiName} राशि) के लिए ${period === "daily" ? "आज का" : period === "weekly" ? "इस सप्ताह का" : period === "monthly" ? "इस महीने का" : "इस वर्ष का"} राशिफल`,
      `दशा स्वामी ${dashaName} और गोचर ग्रहों का एकीकृत विश्लेषण`,
      `${transRashiName} राशि हेतु मुख्य ज्योतिषीय संकेत और मार्गदर्शन`
    ],
    te: [
      `${name} (${transRashiName} రాశి) వారికీ ఈ ${period === "daily" ? "రోజు" : period === "weekly" ? "వారం" : period === "monthly" ? "నెల" : "సంవత్సరం"} గోచార ఫలితాలు`,
      `ప్రస్తుత ${dashaName} దశా మరియు ${bhuktiName} అంతర్దశ ప్రభావ సూచిక`,
      `${transRashiName} చంద్ర రాశి మరియు గోచార గ్రహ సంచార విశ్లేషణ`
    ],
    ta: [
      `${name} (${transRashiName} ராசி) - ${period === "daily" ? "இன்றைய" : period === "weekly" ? "இந்த வார" : period === "monthly" ? "இந்த மாத" : "இந்த வருட"} கிரக பலன்கள்`,
      `நடைபெறும் ${dashaName} திசை மற்றும் ${bhuktiName} புக்தியின் கூட்டுப் பலன்`,
      `${transRashiName} ராசிக்கான கோச்சார கிரகங்களின் விரிவான கணிப்புகள்`
    ]
  };
  const title = getVariation(seed + "_title", titles[lang as keyof typeof titles] || titles.en);

  // Core content generators based on transit houses
  let career = "";
  let finance = "";
  let health = "";
  let relationships = "";
  let summary = "";

  // 1. CAREER
  const isJupCareerGood = [2, 5, 7, 9, 11].includes(transits.jupiter);
  const isSatCareerHeavy = [12, 1, 2, 4, 8].includes(transits.saturn);

  if (lang === "kn") {
    const careerOptions = isJupCareerGood
      ? [
          `ಗೋಚಾರದಲ್ಲಿ **ಗುರು ಬಲ** ಉತ್ತಮವಾಗಿದ್ದು, ನಿಮ್ಮ ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಯಶಸ್ಸು ದೊರೆಯಲಿದೆ. ಮೇಲಧಿಕಾರಿಗಳಿಂದ ಶ್ಲಾಘನೆ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು ಸಿಗಲಿವೆ.`,
          `ನಿಮ್ಮ ಪ್ರಸ್ತುತ **${dashaName} ದಶಾ** ಮತ್ತು ಅನುಕೂಲಕರ ಗುರು ಸಂಚಾರದಿಂದ ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ಇಮ್ಮಡಿಯಾಗಲಿದೆ. ಹೊಸ ಉದ್ಯೋಗ ಪ್ರಯತ್ನಗಳು ಸಫಲವಾಗುತ್ತವೆ.`
        ]
      : isSatCareerHeavy
      ? [
          `ಶನಿ ಗೋಚಾರವು ಮಂದಗತಿಯನ್ನು ತರುವುದರಿಂದ ಕೆಲಸದಲ್ಲಿ **ಹೆಚ್ಚಿನ ಒತ್ತಡ** ಮತ್ತು ಕಾರ್ಯವಿಳಂಬ ಉಂಟಾಗಬಹುದು. ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸಿ.`,
          `ನಿಮ್ಮ ಕರ್ಮಕ್ಷೇತ್ರದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ವಿಳಂಬವಾಗಬಹುದು. **${dashaName} ದಶಾ** ಪ್ರಭಾವದಿಂದಾಗಿ ಕಠಿಣ ನಿರ್ಧಾರಗಳನ್ನು ಸದ್ಯಕ್ಕೆ ಮುಂದೂಡುವುದು ಒಳಿತು.`
        ]
      : [
          `ಉದ್ಯೋಗದಲ್ಲಿ ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ ಮುಂದುವರಿಯಲಿದ್ದು, ದಿನನಿತ್ಯದ ಕೆಲಸಗಳಲ್ಲಿ ಶ್ರದ್ಧೆ ಇರಲಿ. ಯೋಜಿತ ಕಾರ್ಯಗಳು ನಿಧಾನವಾಗಿ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತವೆ.`,
          `ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಉತ್ತಮ ಬಾಂಧವ್ಯ ಇರಲಿ. ಹೊಸ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಆಲೋಚಿಸಲು ಇದು ಸಕಾಲವಾಗಿದೆ.`
        ];
    career = getVariation(seed + "_career", careerOptions);
  } else if (lang === "hi") {
    const careerOptions = isJupCareerGood
      ? [
          `गोचर में **बृहस्पति (गुरु) का शुभ गोचर** आपके करियर में उन्नति और मान-सम्मान दिलाएगा। नए व्यावसायिक सौदे सफल होंगे।`,
          `आपकी चालू **${dashaName} महादशा** और अनुकूल गुरु बल से नौकरी में पदोन्नति के योग बनेंगे। काम में रचनात्मकता बढ़ेगी।`
        ]
      : isSatCareerHeavy
      ? [
          `शनि का गोचर कार्यक्षेत्र में **कार्यभार और मानसिक तनाव** बढ़ा सकता है। वाद-विवाद से दूर रहें और अपने काम पर ध्यान केंद्रित करें।`,
          `मेहनत का फल मिलने में कुछ देरी हो सकती है। **${dashaName} महादशा** के कारण महत्वपूर्ण व्यावसायिक समझौतों में जल्दबाजी न करें।`
        ]
      : [
          `करियर के दृष्टिकोण से सामान्य दिन रहेगा। रोजमर्रा के कार्यों को ईमानदारी से पूरा करें, भविष्य में लाभ होगा।`,
          `नौकरीपेशा लोगों के लिए सहकर्मियों का सहयोग मददगार साबित होगा। नए विचारों पर काम शुरू कर सकते हैं।`
        ];
    career = getVariation(seed + "_career", careerOptions);
  } else if (lang === "te") {
    const careerOptions = isJupCareerGood
      ? [
          `గోచారంలో **గురు బలం** అద్భుతంగా ఉండటం వల్ల ఉద్యోగంలో పదోన్నతి మరియు వ్యాపారంలో లాభాలు పొందుతారు.`,
          `మీకు నడుస్తున్న **${dashaName} మహాదశ** ఉద్యోగ మార్పులకు మరియు కొత్త ఆదాయ వనరులకు అత్యంత అనుకూలంగా ఉంటుంది.`
        ]
      : isSatCareerHeavy
      ? [
          `శని గోచారం వల్ల పని ఒత్తిడి ఎక్కువగా ఉంటుంది. **సహోద్యోగులతో వాదోపవాదాలు** రాకుండా జాగ్రత్త వహించండి.`,
          `పనులలో ఆటంకాలు ఎదురైనప్పటికీ నిరాశ చెందకండి. **${dashaName} దశ** కారణంగా ఓర్పు వహించాల్సి ఉంటుంది.`
        ]
      : [
          `ఉద్యోగంలో సాధారణ మార్పులు ఉంటాయి. రోజువారీ పనులపై శ్రద్ధ పెట్టడం మంచి ఫలితాలను ఇస్తుంది.`,
          `వ్యాపార విస్తరణకు సంబంధించి కీలక ఆలోచనలు చేస్తారు, కానీ నిర్ణయాలు ఒకటికి రెండుసార్లు ఆలోచించి తీసుకోండి.`
        ];
    career = getVariation(seed + "_career", careerOptions);
  } else if (lang === "ta") {
    const careerOptions = isJupCareerGood
      ? [
          `கோச்சாரத்தில் **குரு பகவானின் அருள்** பூரணமாக உள்ளதால் தொழிலில் முன்னேற்றமும் புதிய வாய்ப்புகளும் தேடிவரும்.`,
          `தற்போது நடைபெறும் **${dashaName} திசை** உங்கள் உத்தியோகத்தில் நல்ல மாற்றங்களையும் புதிய பொறுப்புகளையும் தரும்.`
        ]
      : isSatCareerHeavy
      ? [
          `சனி பகவானின் கோச்சாரத்தினால் பணியிடத்தில் **வேலை பளுவும் அலைச்சலும்** அதிகரிக்கும். அதிகாரிகளிடம் பேசும்போது நிதானம் தேவை.`,
          `முயற்சிகளில் தாமதம் ஏற்படலாம். **${dashaName} திசை** உங்களை கடினமாக உழைக்க வைக்கும், பொறுமை காப்பது நல்லது.`
        ]
      : [
          `வேலையில் சாதாரண சூழ்நிலையே நிலவும். உங்களது அன்றாட கடமைகளைச் சரியாகச் செய்து முடிப்பதில் கவனம் செலுத்துங்கள்.`,
          `தொழில் கூட்டாளிகளுடன் சுமூகமான உறவு நீடிக்கும். புதிய திட்டங்களைப் பற்றி யோசிக்கலாம்.`
        ];
    career = getVariation(seed + "_career", careerOptions);
  } else {
    const careerOptions = isJupCareerGood
      ? [
          `The **auspicious transit of Jupiter** promises dynamic growth in your professional sphere. You will receive appreciation from authorities.`,
          `Aligned with your running **${dashaName} Mahadasha**, you are set for career breakthroughs, promotions, or lucrative business ventures.`
        ]
      : isSatCareerHeavy
      ? [
          `Saturn's transit indicates **heavy workload and short delays**. Maintain a disciplined daily approach and avoid conflicts with superiors.`,
          `Rewards for your hard work might be deferred due to the **${dashaName} dasha**. Double-check critical contracts and project deliverables.`
        ]
      : [
          `A stable and routine period in your workspace. Focus on clearing pending tasks and stabilizing your daily workflows.`,
          `Collaboration with peers will bring clarity. Avoid impulsive professional changes for a few days.`
        ];
    career = getVariation(seed + "_career", careerOptions);
  }

  // 2. FINANCE
  const isJupFinanceGood = [2, 5, 9, 11].includes(transits.jupiter);
  const isSatFinanceHeavy = [12, 1, 2, 8].includes(transits.saturn);

  if (lang === "kn") {
    const financeOptions = isJupFinanceGood
      ? [
          `ಹಣಕಾಸಿನ ಹರಿವು ಉತ್ತಮವಾಗಲಿದ್ದು, **ಹೊಸ ಹೂಡಿಕೆಗಳಿಗೆ** ಸಕಾಲವಾಗಿದೆ. ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿಯಿಂದ ಲಾಭವಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ.`,
          `ನಿಮ್ಮ ದಶಾ ಅಧಿಪತಿ **${dashaName}** ನಿಮಗೆ ಧನಲಾಭ ತರಲಿದ್ದು, ಹಳೆಯ ಸಾಲಗಳು ಸುಲಭವಾಗಿ ತೀರಲಿವೆ.`
        ]
      : isSatFinanceHeavy
      ? [
          `ಖರ್ಚುಗಳು ಹೆಚ್ಚಾಗುವ ಸಂಭವವಿದ್ದು, **ಅನಗತ್ಯ ವೆಚ್ಚಗಳಿಗೆ** ಬ್ರೇಕ್ ಹಾಕಿ. ಯಾವುದೇ ಷೇರು ಮಾರುಕಟ್ಟೆ ಹೂಡಿಕೆಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಇರಲಿ.`,
          `ಬಜೆಟ್ ಯೋಜನೆಯಲ್ಲಿ ಶಿಸ್ತು ಅಗತ್ಯ. ಆಪ್ತರಿಂದ ಆರ್ಥಿಕ ಸಹಾಯ ಪಡೆಯಬೇಕಾದೀತು, ಅನಗತ್ಯ ಸಾಲಗಳನ್ನು ತಪ್ಪಿಸಿ.`
        ]
      : [
          `ಆದಾಯ ಮತ್ತು ವೆಚ್ಚಗಳು ಸಮತೋಲನದಲ್ಲಿರಲಿವೆ. ದೊಡ್ಡ ಹೂಡಿಕೆಗಳನ್ನು ಮಾಡುವ ಮುನ್ನ ಹಿರಿಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.`,
          `ನಿಮ್ಮ ದೈನಂದಿನ ಹಣಕಾಸಿನ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಜಾಗರೂಕತೆ ಇರಲಿ, ಉಳಿತಾಯಕ್ಕೆ ಆದ್ಯತೆ ನೀಡಿ.`
        ];
    finance = getVariation(seed + "_finance", financeOptions);
  } else if (lang === "hi") {
    const financeOptions = isJupFinanceGood
      ? [
          `आर्थिक लाभ की मजबूत संभावनाएं हैं। **निवेश से अच्छा रिटर्न** मिलने के योग हैं। संपत्ति की खरीद का मन बन सकता है।`,
          `दशा स्वामी **${dashaName}** की अनुकूलता से पुराने अटके हुए धन की प्राप्ति होगी। वित्तीय स्थिरता सुदृढ़ होगी।`
        ]
      : isSatFinanceHeavy
      ? [
          `अचानक **खर्चों में वृद्धि** हो सकती है। सट्टेबाजी या जोखिम भरे निवेश से पूरी तरह दूर रहें। बजट बनाकर चलें।`,
          `धन के लेन-देन में सावधानी बरतें। बिना सोचे-समझे किसी को उधार न दें, पैसा फंसने की आशंका है।`
        ]
      : [
          `आय सामान्य बनी रहेगी। घरेलू बजट पर नियंत्रण रखना आवश्यक है ताकि भविष्य में कोई समस्या न हो।`,
          `वित्तीय योजना बनाने के लिए आज का दिन उपयुक्त है। छोटी बचतों पर ध्यान दें।`
        ];
    finance = getVariation(seed + "_finance", financeOptions);
  } else if (lang === "te") {
    const financeOptions = isJupFinanceGood
      ? [
          `ధన యోగం అనుకూలంగా ఉంది. **ఆర్థికాభివృద్ధి** మరియు కొత్త పెట్టుబడులు పెట్టడానికి వీలవుతుంది.`,
          `మీకు నడుస్తున్న దశా కాలం వల్ల ఆకస్మిక ధనలాభం కలిగే అవకాశం ఉంది. అప్పులు తీరే మార్గాలు లభిస్తాయి.`
        ]
      : isSatFinanceHeavy
      ? [
          `ఆకస్మిక ఖర్చులు పెరగవచ్చు. **జూదాలు లేదా స్పెక్యులేషన్స్** కి దూరంగా ఉండడం శ్రేయస్కరం.`,
          `ఆর্থిక లావాదేవీలలో అప్రమత్తంగా ఉండాలి. ఎవరికైనా హామీ సంతకాలు పెట్టే ముందు ఆలోచించండి.`
        ]
      : [
          `ఆర్థిక పరంగా సామాన్యంగా ఉంటుంది. ఖర్చులను అదుపులో ఉంచుకోవడం అవసరం.`,
          `నిలకడైన ఆదాయం ఉంటుంది కానీ పెద్ద ఎత్తున ఖర్చులు చేసే ముందు బడ్జెట్ చూసుకోండి.`
        ];
    finance = getVariation(seed + "_finance", financeOptions);
  } else if (lang === "ta") {
    const financeOptions = isJupFinanceGood
      ? [
          `பண வரவு திருப்திகரமாக இருக்கும். **சேமிப்புகள் உயரும்** உகந்த காலம். சொத்துக்கள் வாங்குவதில் ஆர்வம் காட்டுவீர்கள்.`,
          `திசா நாதன் **${dashaName}** அருளால் கடன் தொல்லைகள் குறைந்து பொருளாதார நிலைமை சீரடையும்.`
        ]
      : isSatFinanceHeavy
      ? [
          `தேவையற்ற செலவுகளால் மன உழைச்சல் ஏற்படலாம். **ஊக வணிகம் மற்றும் பங்குச் சந்தை** முதலீடுகளைத் தவிர்க்கவும்.`,
          `பண விஷயத்தில் கவனம் தேவை, மற்றவர்களுக்கு ஜாமீன் கையெழுத்து போடுவதைத் தவிர்க்கவும்.`
        ]
      : [
          `வரவும் செலவும் சமமாக இருக்கும். குடும்ப பட்ஜெட்டில் கவனம் செலுத்தி வீண் செலவுகளைக் கட்டுப்படுத்துங்கள்.`,
          `சிறிய முதலீடுகள் மூலம் எதிர்காலத்திற்கு சேமிக்கத் தொடங்குவது நல்லது.`
        ];
    finance = getVariation(seed + "_finance", financeOptions);
  } else {
    const financeOptions = isJupFinanceGood
      ? [
          `Financial prospects look highly encouraging. It is a good time for **strategic long-term investments** or purchasing assets.`,
          `Supported by **${dashaName}**, you will find new avenues of income and resolve outstanding debts or financial disputes.`
        ]
      : isSatFinanceHeavy
      ? [
          `Avoid impulse buying and **high-risk market speculations**. Heavy expenditures related to home or family might arise.`,
          `A structured budget is critical. Refrain from lending money without documentation, as recovery may be slow.`
        ]
      : [
          `Cash flows are steady and predictable. Focus on savings and review your recurring subscriptions or small leaks.`,
          `A balanced period. Financial consultations with family members will yield productive results.`
        ];
    finance = getVariation(seed + "_finance", financeOptions);
  }

  // 3. HEALTH
  const isSatHealthHeavy = [12, 1, 2, 4, 8].includes(transits.saturn);
  const isMarsHealthHeavy = [1, 2, 7, 8, 12].includes(transits.mars);

  if (lang === "kn") {
    const healthOptions = isSatHealthHeavy || isMarsHealthHeavy
      ? [
          `ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರಾಗಬಹುದು, ವಿಶೇಷವಾಗಿ **ಕೀಲು ನೋವು ಅಥವಾ ಉದರ ದೋಷ** ಸಾಧ್ಯತೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಆಹಾರ ಸೇವಿಸಿ.`,
          `ಶ್ರಮ ಹೆಚ್ಚಿ ಆಯಾಸವಾಗಬಹುದು. ಚಾಲನೆ ಮಾಡುವಾಗ ಮತ್ತು ಹರಿತವಾದ ವಸ್ತುಗಳನ್ನು ಬಳಸುವಾಗ ಜಾಗರೂಕತೆ ಇರಲಿ.`
        ]
      : [
          `ದೇಹಾರೋಗ್ಯವು ಉತ್ತಮವಾಗಿದ್ದು, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಇರಲಿದೆ. ಯೋಗ ಮತ್ತು ನಿಯಮಿತ ನಡಿಗೆಯನ್ನು ಮುಂದುವರಿಸಿ.`,
          `ಚುರುಕುತನದಿಂದ ಕೂಡಿರುತ್ತೀರಿ. ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಲು ಉತ್ತಮ ದಿನ.`
        ];
    health = getVariation(seed + "_health", healthOptions);
  } else if (lang === "hi") {
    const healthOptions = isSatHealthHeavy || isMarsHealthHeavy
      ? [
          `स्वास्थ्य के प्रति सजग रहें। **जोड़ों में दर्द या पेट खराब** होने की आशंका है। बाहर के खाने से परहेज करें।`,
          `काम की अधिकता से थकान महसूस होगी। वाहन चलाते समय पूर्ण सतर्कता बरतें और गुस्सा करने से बचें।`
        ]
      : [
          `स्वास्थ्य अनुकूल रहेगा। मानसिक शांति और शारीरिक स्फूर्ति महसूस करेंगे। ध्यान और व्यायाम को दिनचर्या में शामिल करें।`,
          `ऊर्जा का स्तर अच्छा रहेगा। स्वास्थ्य उत्तम बना रहेगा, किसी पुरानी बीमारी से राहत मिल सकती है।`
        ];
    health = getVariation(seed + "_health", healthOptions);
  } else if (lang === "te") {
    const healthOptions = isSatHealthHeavy || isMarsHealthHeavy
      ? [
          `ఆరోగ్యం విషయంలో శ్రద్ధ అవసరం. **కీళ్ల నొప్పులు లేదా ఉదర సంబంధిత సమస్యలు** వచ్చే అవకాశం ఉంది.`,
          `మానసిక ఒత్తిడి పెరగవచ్చు. ప్రయాణాలలో మరియు వాహన చోదనలో వేగాన్ని తగ్గించండి.`
        ]
      : [
          `ఆరోగ్యం నిలకడగా ఉంటుంది. ఉత్సాహంగా మరియు ప్రశాంతంగా ఉంటారు. యోగా చేయడం మేలు చేస్తుంది.`,
          `శారీరక దారుఢ్యం బాగుంటుంది. పాత అనారోగ్య సమస్యల నుండి ఉపశమనం లభిస్తుంది.`
        ];
    health = getVariation(seed + "_health", healthOptions);
  } else if (lang === "ta") {
    const healthOptions = isSatHealthHeavy || isMarsHealthHeavy
      ? [
          `உடல் ஆரோக்கியத்தில் அக்கறை காட்டுங்கள். **வயிற்று உபாதைகள் அல்லது மூட்டு வலி** ஏற்பட வாய்ப்புண்டு. உணவுக் கட்டுப்பாடு தேவை.`,
          `மன உளைச்சல் காரணமாக சோர்வு ஏற்படலாம். வாகனம் ஓட்டும்போது அதிக கவனம் தேவை.`
        ]
      : [
          `உடல் நலம் சிறப்பாக இருக்கும். மன அமைதியும் புத்துணர்ச்சியும் காண்பீர்கள். யோகா அல்லது நடைப்பயிற்சி செய்யவும்.`,
          `சுறுசுறுப்புடன் செயல்படுவீர்கள். பழைய நோய்கள் குணமாகும் வாய்ப்புள்ளது.`
        ];
    health = getVariation(seed + "_health", healthOptions);
  } else {
    const healthOptions = isSatHealthHeavy || isMarsHealthHeavy
      ? [
          `Pay attention to your body. **Indigestion, joint aches, or fatigue** could arise. Avoid fast food and keep hydrated.`,
          `High stress levels could impact sleep quality. Drive cautiously and handle sharp objects with extreme care.`
        ]
      : [
          `Excellent vitality and mental peace. Maintain your fitness routine, light yoga, or nature walks for best energy.`,
          `A rejuvenating period. You will feel highly energetic and clear-headed. Minor past ailments will heal.`
        ];
    health = getVariation(seed + "_health", healthOptions);
  }

  // 4. RELATIONSHIPS
  const isJupRelationGood = [2, 5, 7, 9, 11].includes(transits.jupiter);
  const isMarsRelationHeavy = [1, 2, 4, 7, 8, 12].includes(transits.mars);

  if (lang === "kn") {
    const relOptions = isJupRelationGood && !isMarsRelationHeavy
      ? [
          `ಕುಟುಂಬದಲ್ಲಿ ಹಿತಕರ ವಾತಾವರಣವಿರಲಿದೆ. **ಸಂಗಾತಿಯೊಂದಿಗೆ ಮಧುರ ಬಾಂಧವ್ಯ** ಮೂಡಲಿದ್ದು, ಪ್ರೇಮಿಗಳಿಗೆ ವಿವಾಹ ಯೋಗ ಕೂಡಿಬರಲಿದೆ.`,
          `ಮನೆಗೆ ಹತ್ತಿರದ ಸಂಬಂಧಿಕರ ಆಗಮನವಾಗಲಿದ್ದು, ನೆಮ್ಮದಿಯ ಕ್ಷಣಗಳನ್ನು ಕಳೆಯುವಿರಿ.`
        ]
      : isMarsRelationHeavy
      ? [
          `ಮಾತಿನ ಮೇಲೆ ಹಿಡಿತವಿರಲಿ. ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ **ಕೋಪಗೊಳ್ಳುವ ಸಾಧ್ಯತೆಯಿದ್ದು**, ಕೌಟುಂಬಿಕ ವಲಯದಲ್ಲಿ ಸಹನೆ ವಹಿಸಿ.`,
          `ಸಂಗಾತಿಯೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಮೂಡದಂತೆ ಎಚ್ಚರವಹಿಸಿ. ಅತಿಯಾದ ನಿರೀಕ್ಷೆಗಳು ಬೇಸರ ತರಬಹುದು.`
        ]
      : [
          `ಕೌಟುಂಬಿಕ ಜೀವನ ಸುಗಮವಾಗಿರಲಿದೆ. ಹಳೆಯ ಸ್ನೇಹಿತರ ಭೇಟಿಯಾಗುವ ಸಂಭವವಿದ್ದು, ಸೃಜನಶೀಲ ಸಂಭಾಷಣೆ ನಡೆಯಲಿದೆ.`,
          `ಮಕ್ಕಳ ವಿಷಯದಲ್ಲಿ ಸಂತೋಷ ತರಲಿದೆ. ಪ್ರೀತಿಪಾತ್ರರ ಜೊತೆಗೆ ಸುಂದರ ಸಮಯ ಕಳೆಯುವಿರಿ.`
        ];
    relationships = getVariation(seed + "_rel", relOptions);
  } else if (lang === "hi") {
    const relOptions = isJupRelationGood && !isMarsRelationHeavy
      ? [
          `पारिवारिक जीवन में मधुरता रहेगी। **जीवनसाथी के साथ संबंध मजबूत** होंगे। नए प्रेम संबंधों की शुरुआत हो सकती है।`,
          `घर में कोई मांगलिक कार्य संपन्न हो सकता है। प्रियजनों से सहयोग मिलेगा और प्रसन्नता बढ़ेगी.`
        ]
      : isMarsRelationHeavy
      ? [
          `वाणी पर संयम रखना अत्यंत आवश्यक है। **क्रोध में आकर कोई गलत शब्द** न बोलें, जिससे पारिवारिक कलह हो।`,
          `जीवनसाथी के साथ वैचारिक मतभेद हो सकते हैं। आपसी समझ से मसले सुलझाने की कोशिश करें।`
        ]
      : [
          `पारिवारिक संबंध सामान्य रहेंगे। पुराने मित्रों से मुलाकात पुरानी यादें ताजा करेगी। एक-दूसरे का सम्मान करें।`,
          `संतान पक्ष से कोई शुभ समाचार मिल सकता है। प्रियजनों के साथ सामान्य बातचीत सुखद रहेगी।`
        ];
    relationships = getVariation(seed + "_rel", relOptions);
  } else if (lang === "te") {
    const relOptions = isJupRelationGood && !isMarsRelationHeavy
      ? [
          `కుటుంబ సభ్యుల మధ్య సఖ్యత పెరుగుతుంది. **దంపతుల మధ్య అనురాగం** మరియు సంతోషకరమైన వాతావరణం ఉంటుంది.`,
          `బంధువులతో సంతోషంగా గడుపుతారు. శుభకార్యాలలో పాల్గొనే అవకాశం లభిస్తుంది.`
        ]
      : isMarsRelationHeavy
      ? [
          `కోపాన్ని అదుపులో ఉంచుకోవాలి. **చిన్న విషయాలకే కోపతాపాలు** రావడం వల్ల బంధాలు దెబ్బతినే ప్రమాదం ఉంది.`,
          `భార్యాభర్తల మధ్య మనస్పర్థలు రావచ్చు. సంయమనం పాటించడం చాలా అవసరం.`
        ]
      : [
          `కుటుంబ జీవితం ప్రశాంతంగా సాగుతుంది. పాత స్నేహితులను కలుసుకుని ఆనందంగా గడుపుతారు.`,
          `పిల్లల అభివృద్ధి మిమ్మల్ని సంతోషపరుస్తుంది. స్నేహపూర్వక సంభాషణలు మేలు చేస్తాయి.`
        ];
    relationships = getVariation(seed + "_rel", relOptions);
  } else if (lang === "ta") {
    const relOptions = isJupRelationGood && !isMarsRelationHeavy
      ? [
          `குடும்பத்தில் மகிழ்ச்சி நிலவும். **தம்பதியரிடையே ஒற்றுமை** பலப்படும். சுப நிகழ்ச்சிகள் கைகூடும் இனிய காலம்.`,
          `உறவினர்களின் ஆதரவு கிடைக்கும். நண்பர்களுடன் இனிமையான சந்திப்புகள் நிகழும்.`
        ]
      : isMarsRelationHeavy
      ? [
          `பேச்சில் நிதானத்தைக் கடைப்பிடிக்கவும். **தேவையற்ற கோபத்தால்** உறவுகளில் விரிசல் ஏற்படாமல் பார்த்துக் கொள்ளுங்கள்.`,
          `வாழ்க்கைத் துணையுடன் கருத்து வேறுபாடுகள் வரலாம். ஒருவரையொருவர் புரிந்து கொள்ள முயற்சி செய்யுங்கள்.`
        ]
      : [
          `குடும்ப வாழ்க்கை சுமூகமாகச் செல்லும். பழைய நண்பர்களைச் சந்தித்து மகிழ்வீர்கள். உறவுகளில் அமைதி நிலவும்.`,
          `பிள்ளைகளால் பெருமை சேரும். அன்பானவர்களுடன் நல்ல நேரத்தைச் செலவிடுவீர்கள்.`
        ];
    relationships = getVariation(seed + "_rel", relOptions);
  } else {
    const relOptions = isJupRelationGood && !isMarsRelationHeavy
      ? [
          `Harmony prevails at home. A **wonderful understanding with your spouse** or partner is indicated. Auspicious for romance.`,
          `You will reconnect with loving family members or gather for celebratory events. Mutual support will increase.`
        ]
      : isMarsRelationHeavy
      ? [
          `Keep your temper under check. **Impulsive remarks and arguments** can strain relationships. Practice active listening.`,
          `Avoid imposing your expectations on loved ones. Give them space and prioritize compromise over proving points.`
        ]
      : [
          `Relationships remain steady and cordial. An unexpected chat with an old friend will bring joy and nostalgia.`,
          `Good news from children or young members of the family will light up the atmosphere.`
        ];
    relationships = getVariation(seed + "_rel", relOptions);
  }

  // 5. SUMMARY & SYNTHESIS
  if (lang === "kn") {
    const sumOptions = [
      `${name} ಅವರೇ, ಪ್ರಸ್ತುತ **${dashaName} ಮಹಾದಶಾ** ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಯೋಚನೆಗಳಲ್ಲಿ ನಾವೀನ್ಯತೆ ಇರಲಿದೆ. ಗೋಚಾರದಲ್ಲಿ ಗುರುವು ${transits.jupiter}ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಶನಿಯು ${transits.saturn}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ಈ ಗ್ರಹಗತಿಯು ನಿಮ್ಮ ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ಯಶಸ್ಸನ್ನು ನೀಡಲಿದೆ.`,
      `ಚಂದ್ರ ರಾಶಿ **${transRashiName}** ಮತ್ತು ರವಿ ಸಂಚಾರದ ಫಲವಾಗಿ ಈ ${period === "daily" ? "ದಿನ" : period === "weekly" ? "ವಾರ" : period === "monthly" ? "ತಿಂಗಳು" : "ವರ್ಷ"} ನಿಮಗೆ ಮಿಶ್ರ ಫಲಗಳನ್ನು ನೀಡಲಿದೆ. ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಿಗೆ ಒಲವು ಹೆಚ್ಚಲಿದೆ.`
    ];
    summary = getVariation(seed + "_sum", sumOptions);
  } else if (lang === "hi") {
    const sumOptions = [
      `${name}, आपकी चल रही **${dashaName} महादशा** और गोचर स्थिति के कारण जीवन में महत्वपूर्ण बदलाव आएंगे। गुरु का ${transits.jupiter}वें और शनि का ${transits.saturn}वें भाव में होना कर्म और भाग्य के बीच संतुलन स्थापित करेगा।`,
      `चन्द्र राशि **${transRashiName}** के अनुसार गोचर ग्रह आपके पराक्रम को बढ़ाएंगे। धैर्य बनाए रखें, आध्यात्मिक कार्यों में रुचि बढ़ेगी और शांति मिलेगी।`
    ];
    summary = getVariation(seed + "_sum", sumOptions);
  } else if (lang === "te") {
    const sumOptions = [
      `${name} గారు, ప్రస్తుత **${dashaName} దశా** ప్రభావం వల్ల మీ నిర్ణయాలు సత్ఫలితాలను ఇస్తాయి. గోచారంలో గురుడు ${transits.jupiter}వ స్థానంలో, శని ${transits.saturn}వ స్థానంలో సంచరిస్తున్నారు.`,
      `చంద్ర రాశి **${transRashiName}** కు తగినట్లుగా ఈ కాలం మీకు ఒడిదుడుకులు లేని ప్రశాంత జీవితాన్ని మరియు అనుకూల ఫలితాలను ఇస్తుంది.`
    ];
    summary = getVariation(seed + "_sum", sumOptions);
  } else if (lang === "ta") {
    const sumOptions = [
      `${name} அவர்களே, தங்களுக்கு நடைபெறும் **${dashaName} திசை** பல சுப மாற்றங்களைத் தரும். கோச்சாரத்தில் குரு ${transits.jupiter}ஆம் இடத்திலும், சனி ${transits.saturn}ஆம் இடத்திலும் சஞ்சரிப்பதால் நன்மை விளையும்.`,
      `உங்களது **${transRashiName}** ராசியின் அடிப்படையில் கிரக அமைப்புகள் சாதகமான சூழ்நிலையை உருவாக்கித் தரும். ஆலய வழிபாடுகள் மன அமைதியைத் தரும்.`
    ];
    summary = getVariation(seed + "_sum", sumOptions);
  } else {
    const sumOptions = [
      `${name}, under your active **${dashaName} Mahadasha** and ${bhuktiName} Antardasha, life takes a structured turn. Jupiter transits your ${transits.jupiter}th house and Saturn occupies the ${transits.saturn}th house relative to your Moon sign.`,
      `With your natal Moon in **${transRashiName}**, the transits of Sun and Mars highlight energy management. Focus on consistency rather than rapid shifts.`
    ];
    summary = getVariation(seed + "_sum", sumOptions);
  }

  // Formatting integrated reading to hold everything together
  let integratedReading = "";
  if (lang === "kn") {
    integratedReading = `**ಸಂಶ್ಲೇಷಣಾತ್ಮಕ ವಿಶ್ಲೇಷಣೆ**: ${name} ಅವರೇ, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಯ ಆಧಾರದ ಮೇಲೆ, ಈ ಅವಧಿಯು ಅತ್ಯಂತ ಮಹತ್ವದಾಗಿದೆ. **${dashaName} ಮಹಾದಶಾ** ಮತ್ತು **${bhuktiName} ಭುಕ್ತಿ** ಯು ನಿಮ್ಮ ದೈನಂದಿನ ಚಿಂತನೆಗಳನ್ನು ಆಳುತ್ತವೆ. ಗೋಚಾರ ಫಲಗಳನ್ನು ಗಮನಿಸಿದಾಗ, ಗುರು ಹಾಗೂ ಶನಿಯ ಸಂಚಾರವು ಅನುಕೂಲಕರವಾದ ಬದಲಾವಣೆಗಳನ್ನೇ ಸೂಚಿಸುತ್ತದೆ. ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಾಳ್ಮೆಯಿಂದ ಪ್ರಗತಿ ಸಾಧಿಸಿ ಹಾಗೂ ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆಯಿಂದ ವ್ಯವಹಾರ ನಡೆಸಿ. ಕೌಟುಂಬಿಕ ಬಾಂಧವ್ಯವನ್ನು ಗಟ್ಟಿಗೊಳಿಸಲು ಇದು ಸೂಕ್ತ ಸಮಯ.`;
  } else if (lang === "hi") {
    integratedReading = `**एकीकृत ज्योतिषीय विश्लेषण**: ${name}, गोचर और दशा का यह संयोजन आपके लिए फलदायी रहेगा। **${dashaName} महादशा** और **${bhuktiName} अंतर्दशा** के अंतर्गत आपकी मानसिक ऊर्जा मजबूत रहेगी। व्यापार और नौकरी में नए अवसरों का सृजन होगा। वित्तीय रूप से बजट का पालन करें। स्वास्थ्य के लिहाज से जोड़ों और खान-आन का ध्यान रखें। प्रियजनों के साथ समझदारी भरा रवैया रखें ताकि गृह-क्लेश न हो।`;
  } else if (lang === "te") {
    integratedReading = `**సమన్వయ విశ్లేషణ**: ${name} గారు, మీ జన్మ నక్షత్ర మరియు చంద్ర రాశి సంచారము ప్రకారం ఈ కాలం మిశ్రమ ఫలితాలను కలిగిస్తుంది. **${dashaName} దశ** మరియు **${bhuktiName} అంతర్దశ** ల ప్రభావం తో పాటు గురు మరియు శని గ్రహాల సంచారం వల్ల వృత్తి లో ఉన్నతి సాధిస్తారు. ధన వ్యవహారాలలో అనుకూలత ఉంటుంది కానీ ఖర్చులు అదుపులో ఉంచండి. ఆరోగ్య క్షేమాల్లో శ్రద్ధ వహించండి.`;
  } else if (lang === "ta") {
    integratedReading = `**ஒருங்கிணைந்த ஜோதிடப் பலன்**: ${name} அவர்களே, உங்களது ஜாதக அமைப்பு மற்றும் தற்போதைய கோச்சார நிலைகளின்படி இந்த காலகட்டம் மிகவும் முக்கியத்துவம் வாய்ந்தது. **${dashaName} திசை** மற்றும் **${bhuktiName} புக்தி** தங்களுக்கு புதிய உத்வேகத்தைத் தரும். உத்தியோகத்தில் நல்ல மாற்றங்களும், பொருளாதாரத்தில் நிதானமான வளர்ச்சியும் காணப்படும். குடும்பத்தாரை அனுசரித்துச் செல்வது நலம் தரும்.`;
  } else {
    integratedReading = `**Synthesized Reading**: ${name}, the planetary alignments for this period reflect a balance of tests and rewards. The governing cycle of **${dashaName} Mahadasha** and **${bhuktiName} Antardasha** directs your core focus towards stability. With Jupiter in your ${transits.jupiter}th house and Saturn in your ${transits.saturn}th house from your Rashi, you are advised to maintain regular schedules. Build career momentum slowly, watch financial outflows, take care of minor health indices, and foster calm communications with family.`;
  }

  // Construct final JSON output matching the PredictionOutput type
  const result: PredictionOutput = {
    title,
    summary,
    career,
    finance,
    health,
    relationships,
    lucky: {
      color: luckyColor,
      number: luckyNumber,
      direction: luckyDirection
    },
    rating,
    dashaLine: lang === "kn"
      ? `ವಿಂಶೋತ್ತರಿ ದಶಾ: ${dashaName} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiName} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ.`
      : lang === "hi"
      ? `विंशोत्तरी दशा: ${dashaName} महादशा में ${bhuktiName} अंतर्दशा चल रही है।`
      : lang === "te"
      ? `వింశోత్తరి దశా: ${dashaName} మహాదశ లో ${bhuktiName} అంతర్దశ జరుగుతోంది.`
      : lang === "ta"
      ? `விம்சோத்தரி திசை: ${dashaName} மகாதிசையில் ${bhuktiName} புக்தி நடைபெறுகிறது.`
      : `Vimshottari Dasha: ${dashaName} Mahadasha with ${bhuktiName} Antardasha.`,
    timingLine: lang === "kn"
      ? `ಸುಮಾರು ${ageYears.toFixed(1)} ವರ್ಷ ಪ್ರಾಯದಲ್ಲಿ ಸಂಚರಿಸುವ ಗ್ರಹಬಲಗಳು ನಿಮ್ಮ ಪ್ರಗತಿಯನ್ನು ವೇಗಗೊಳಿಸುತ್ತವೆ.`
      : lang === "hi"
      ? `लगभग ${ageYears.toFixed(1)} वर्ष की आयु में गोचर ग्रह आपकी प्रगति में सहायक होंगे।`
      : lang === "te"
      ? `సుమారు ${ageYears.toFixed(1)} సంవత్సరాల వయస్సులో గోచార గ్రహాలు అనుకూలంగా స్పందిస్తాయి.`
      : lang === "ta"
      ? `சுமார் ${ageYears.toFixed(1)} வயதில் கோச்சார கிரகங்கள் தங்களின் முன்னேற்றத்திற்கு வழிகாட்டும்.`
      : `Around age ${ageYears.toFixed(1)} years, these planetary movements guide your pathway.`,
    integratedReading
  };

  return result;
};

export const getDailyPrediction = (
  kundli: KundliOutput,
  date: Date,
  t: TFunction,
  personName?: string,
  birth?: PredictionBirthContext
): PredictionOutput => {
  return getDynamicPrediction("daily", kundli, date, t, personName, birth);
};

export const getWeeklyPrediction = (
  kundli: KundliOutput,
  startDate: Date,
  t: TFunction,
  personName?: string,
  birth?: PredictionBirthContext
): PredictionOutput => {
  return getDynamicPrediction("weekly", kundli, startDate, t, personName, birth);
};

export const getMonthlyPrediction = (
  kundli: KundliOutput,
  year: number,
  month: number,
  t: TFunction,
  personName?: string,
  birth?: PredictionBirthContext
): PredictionOutput => {
  const targetDate = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
  return getDynamicPrediction("monthly", kundli, targetDate, t, personName, birth);
};

export const getYearlyPrediction = (
  kundli: KundliOutput,
  year: number,
  t: TFunction,
  personName?: string,
  birth?: PredictionBirthContext
): PredictionOutput => {
  const targetDate = new Date(Date.UTC(year, 5, 15, 12, 0, 0));
  return getDynamicPrediction("yearly", kundli, targetDate, t, personName, birth);
};
