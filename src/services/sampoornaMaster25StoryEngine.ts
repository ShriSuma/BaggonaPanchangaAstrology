/**
 * ============================================================================
 * BAGGONA PANCHANGA — DYNAMIC STORYTELLING, PANCHANGA VARIATION & DOSHA ENGINE
 * ============================================================================
 * Transforms the 25-chapter booklet into:
 *  1. 100% Panchanga-seeded Cover & chapters (zero identical prose across 5 people).
 *  2. Crisp, jargon-free, plot-twist storytelling across Chapters 1–22 (NO remedies spam).
 *  3. Interactive "Pause & Notice" real-life reflection per chapter.
 *  4. Consolidated Final Action & Dosha Audit section (Chapters 23–25) detailing:
 *     - What each active Dosha is doing right now
 *     - Which domain & life phase it affects
 *     - Exact targeted solution for that specific Dosha
 *  5. Chart-grounded SVG metrics for visual diagrams across every chapter page.
 * ============================================================================
 */

import type { DetectedDosha } from "../core/ComprehensiveDoshaEngine";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import { cleanDegreesFromText, cleanPunctuationArtifacts } from "../features/premiumPdf/yogaDoshaGocharaEnricher";
import { type SixLang, pick6, RASHI_6L, GRAHA_6L } from "../features/fiveYearPrediction/fiveYearLocale";
import type { BookletCoverContent, ExtendedPrecisionMetrics, HouseLordPlacementInfo } from "./sampoornaMaster25BookletEngine";

export type ChapterVisualType =
  | "energy-gauge"
  | "timeline-meter"
  | "rashi-mandala"
  | "element-radar"
  | "sav-pillars"
  | "horizon-wave"
  | "power-compass";

export interface ActiveDoshaProfile {
  id: string;
  title: string;
  severityLabel: string;
  doingNow: string;
  affectingArea: string;
  exactAction: string;
}

export interface ChartVisualMetrics {
  elemPercentages: { fire: number; earth: number; air: number; water: number };
  savByHouse: number[]; // 12 items: House 1..12
  mandalaPlacements: {
    lagnaRashiIdx: number;
    moonRashiIdx: number;
    sunRashiIdx: number;
    yogiRashiIdx: number;
    maandiRashiIdx: number;
    saturnRashiIdx: number;
    jupiterRashiIdx: number;
  };
  tarabalaScore: number;
  isChandrashtama: boolean;
  shaniHouseFromMoon: number;
  guruHouseFromMoon: number;
  shaniTransitSav: number;
  guruTransitSav: number;
  fiveYearScores: Array<{ year: number; score: number }>;
  yogiPlanetName: string;
  yogiColor: string;
  yogiDirection: string;
  yogiDirectionDeg: number;
  yogiDay: string;
  maandiHouse: number;
  bhriguRashiName: string;
  nowYear: number;
  dominantElementKey: "fire" | "earth" | "air" | "water";
}

export interface StoryEngineInput {
  targetLang: SixLang;
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  ageYears: number;
  ageCategory: "infant" | "early_child" | "child" | "teen" | "young_adult" | "adult" | "senior";
  gender: "male" | "female";
  maritalStatus?: string;
  childrenStatus?: string;

  // Complete Panchanga inputs for true per-person uniqueness
  weekdayIdx: number; // 0=Sun..6=Sat
  weekdayName: string;
  isShuklaPaksha: boolean;
  pakshaName: string;
  tithiName: string;
  yogaName: string;
  karanaName: string;
  nakshatraIdx: number;
  nakshatraName: string;
  nakshatraPada: number;
  janmaHora: string;
  livePrashnaHora: string;

  // Chart & precision points
  lagnaRashiIdx: number;
  lagnaRashiName: string;
  moonRashiIdx: number;
  moonRashiName: string;
  sunRashiIdx: number;
  yogiRashiIdx: number;
  maandiRashiIdx: number;
  saturnRashiIdx: number;
  jupiterRashiIdx: number;
  shaniTransitRashiIdx: number;
  guruTransitRashiIdx: number;

  currentMahadasha: string;
  currentBhuktiLord: string;
  bhuktiEndDate: string;
  isDashaSandhi: boolean;

  rawYogi: string;
  yogiPlanetName: string;
  avayogiPlanetName: string;
  localizedYogiColor: string;
  localizedYogiDirection: string;
  localizedYogiDay: string;
  localizedYogiDeity: string;

  bhriguBinduRashiName: string;
  bhriguDeg: string;
  maandiHouse: number;
  maandiRashiName: string;
  maandiDomainAffected: string;

  primaryElem: "fire" | "earth" | "air" | "water";
  secondaryElem: "fire" | "earth" | "air" | "water";
  dominantElement: string;
  elemWeights: { fire: number; earth: number; air: number; water: number };

  savTable: number[];
  shaniTransitRashi: string;
  shaniHouseFromMoon: number;
  shaniTransitSav: number;
  guruTransitRashi: string;
  guruHouseFromMoon: number;
  guruTransitSav: number;
  rahuHouseFromMoon: number;

  detectedYogasSummary: string;
  detectedDoshasSummary: string;
  activeRawDoshas: DetectedDosha[];

  house10Info: HouseLordPlacementInfo;
  house2Info: HouseLordPlacementInfo;
  house11Info: HouseLordPlacementInfo;
  house7Info: HouseLordPlacementInfo;
  house5Info: HouseLordPlacementInfo;
  house6Info: HouseLordPlacementInfo;

  // Dynamic First-Person Chart Hero & Closest Neighboring Colleague
  heroPlanetName: string;
  heroPlanetHouse: number;
  heroPlanetRashi: string;
  nearestColleagueName: string;
  nearestColleagueHouse: number;
  nearestColleagueRashi: string;
  lagnaLordName: string;

  extendedPrecision: ExtendedPrecisionMetrics;
  nowYear: number;
}

export type NarrativeThemeKey =
  | "cinema"
  | "nakshatra"
  | "yoga_karana"
  | "near_far"
  | "parable";

export interface ChapterVisualSummary {
  themeKey: NarrativeThemeKey;
  themeBadge: string;
  nearLabel: string;
  nearValue: string;
  farLabel: string;
  farValue: string;
  focusHouse?: number;
  focusYearOffset?: number;
  glanceVerdict: string;
}

export interface GeneratedStoryChapter {
  chapterNumber: number;
  sectionNumber: number;
  sectionTitle: string;
  title: string;
  icon: string;
  question: string;
  storyHook: string;
  paragraphs: string[];
  precisionAnchors: string[];
  guidanceBadge: string;
  practicalGuidance: string;
  visualType: ChapterVisualType;
  visualSummary: ChapterVisualSummary;
}

// ============================================================================
// INTERNAL HELPERS (PURE SCRIPT + DIGITS)
// ============================================================================

function digits(num: number | string, lang: SixLang): string {
  const s = String(num);
  if (lang === "en") return s;
  const map =
    lang === "kn"
      ? ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"]
      : lang === "mr" || lang === "hi"
      ? ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
      : lang === "te"
      ? ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"]
      : ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  return s.replace(/\d/g, (d) => map[parseInt(d, 10)] || d);
}

function cleanRegional(text: string, lang: SixLang): string {
  if (!text || lang === "en") return cleanPunctuationArtifacts(text);
  const noDeg = cleanDegreesFromText(cleanPunctuationArtifacts(text));
  return noDeg
    .split("•")
    .map((seg) => cleanEnglishFromRegionalText(seg, lang).trim())
    .filter(Boolean)
    .join(" • ");
}

type NakGana = "deva" | "manushya" | "rakshasa";

function getNakshatraGana(nakIdx: number): NakGana {
  const deva = new Set([0, 4, 6, 7, 12, 14, 16, 21, 26]);
  const rakshasa = new Set([2, 8, 9, 13, 15, 17, 18, 22, 23]);
  if (deva.has(nakIdx % 27)) return "deva";
  if (rakshasa.has(nakIdx % 27)) return "rakshasa";
  return "manushya";
}

function getLagnaModality(lagnaIdx: number): "movable" | "fixed" | "dual" {
  const m = ((lagnaIdx % 3) + 3) % 3;
  return m === 0 ? "movable" : m === 1 ? "fixed" : "dual";
}

function getYogiCompassDeg(rawYogi: string): number {
  switch (rawYogi) {
    case "Sun": return 90;       // East
    case "Venus": return 135;    // South-East
    case "Mars": return 180;     // South
    case "Rahu": return 225;     // South-West
    case "Saturn": return 270;   // West
    case "Moon": return 315;     // North-West
    case "Mercury": return 0;    // North
    case "Jupiter": return 45;   // North-East
    default: return 45;
  }
}

// ============================================================================
// DYNAMIC COVER PAGE BUILDER (UNIQUE BY FULL PANCHANGA FINGERPRINT)
// ============================================================================

export function buildDynamicBookletCover(ctx: StoryEngineInput): BookletCoverContent {
  const {
    targetLang: lang,
    devoteeName,
    birthDate,
    birthTime,
    birthPlace,
    weekdayIdx,
    weekdayName,
    isShuklaPaksha,
    pakshaName,
    tithiName,
    yogaName,
    karanaName,
    nakshatraIdx,
    nakshatraName,
    nakshatraPada,
    lagnaRashiName,
    moonRashiName,
    janmaHora,
    primaryElem,
    yogiPlanetName,
    maandiHouse,
    maandiDomainAffected,
  } = ctx;

  const n = (v: number | string) => digits(v, lang);
  const gana = getNakshatraGana(nakshatraIdx);
  const cleanTithiWithPaksha = (() => {
    const cleanT = tithiName.replace(/^(\S+)\s+\1(?=\s|$)/u, "$1").trim();
    if (!pakshaName || isShuklaPaksha === undefined) return cleanT;
    if (cleanT.includes(pakshaName) || /ಹುಣ್ಣಿಮೆ|ಅಮಾವಾಸ್ಯೆ|पूर्णिमा|अमावस्या|పౌర్ణమి|అమావాస్య|பௌர்ணமி|அமாவாசை|purnima|amavasya/i.test(cleanT)) {
      return cleanT;
    }
    return `${pakshaName} ${cleanT}`.trim();
  })();

  // 7 distinct weekday life-spark archetypes
  const varaSpark = [
    pick6({
      kn: `${weekdayName}ದ ಸೂರ್ಯ ತೇಜಸ್ಸು ನಿಮಗೆ ಸ್ವಾಭಾವಿಕ ನಾಯಕತ್ವ ಹಾಗೂ ಯಾರ ಮುಂದೆಯೂ ತಲೆಬಾಗದ ಆತ್ಮಾಭಿಮಾನವನ್ನು ನೀಡಿದೆ`,
      mr: `${weekdayName}च्या जन्मतेजामुळे आपल्यामध्ये नैसर्गिक नेतृत्व व कोणापुढेही न झुकणारा स्वाभिमान आहे`,
      hi: `${weekdayName} के जन्म-तेज ने आपको स्वाभाविक नेतृत्व और अडिग आत्मसम्मान प्रदान किया है`,
      te: `${weekdayName} నాటి సూర్య తేజస్సు మీకు సహజ నాయకత్వాన్ని, ఆత్మాభిమానాన్ని ఇచ్చింది`,
      ta: `${weekdayName} அன்று பிறந்த சூரிய ஒளி உங்களுக்கு இயல்பான தலைமையையும் தன்மானத்தையும் தந்துள்ளது`,
      en: `born under ${weekdayName}'s solar current, you carry an unmistakable quiet authority and refusal to shrink your self-worth`,
    }, lang),
    pick6({
      kn: `${weekdayName}ದ ಚಂದ್ರ ಶಕ್ತಿಯು ನಿಮಗೆ ಜನರ ಮನಸ್ಸನ್ನು ಮಾತಾಡದೆಯೇ ಓದುವ ಅಸಾಧಾರಣ ಅಂತಃಪ್ರಜ್ಞೆ ನೀಡಿದೆ`,
      mr: `${weekdayName}च्या चंद्रस्पंदनामुळे आपल्याला न बोलताच समोरच्याचे मन ओळखण्याची अद्भुत संवेदनशीलता लाभली आहे`,
      hi: `${weekdayName} की चंद्र-ऊर्जा ने आपको बिना शब्दों के भी दूसरों के भाव पढ़ लेने की दुर्लभ अंतर्दृष्टि दी है`,
      te: `${weekdayName} నాటి చంద్ర బలం మీకు ఎదుటివారి మనసును మాటల్లేకుండానే చదివే అరుదైన అంతర్దృష్టిని ఇచ్చింది`,
      ta: `${weekdayName} சந்திர ஆற்றல் மற்றவர்களின் எண்ணங்களை வார்த்தைகளின்றியே உணரும் ஆழ்ந்த உள்ளுணர்வைத் தந்துள்ளது`,
      en: `shaped by ${weekdayName}'s lunar current, you sense the unspoken moods in a room long before anyone speaks a word`,
    }, lang),
    pick6({
      kn: `${weekdayName}ದ ಮಂಗಳ ಶಕ್ತಿಯು ಕಷ್ಟ ಬಂದಾಗ ಹಿಂದೆ ಸರಿಯದೆ ಎದುರಿಸಿ ಗೆಲ್ಲುವ ಅಪ್ರತಿಮ ಧೈರ್ಯವನ್ನು ಕಟ್ಟಿದೆ`,
      mr: `${weekdayName}च्या मंगळ ऊर्जेमुळे संकटात मागे न हटता लढण्याची असामान्य हिंमत आपल्या रक्तात आहे`,
      hi: `${weekdayName} की मंगल-ऊर्जा ने आपके भीतर चुनौतियों से न डरने वाला अदम्य साहस भरा है`,
      te: `${weekdayName} నాటి కుజ శక్తి కష్టాలను చూసి వెనకడుగు వేయని అసాధారణ ధైర్యాన్ని మీకు అందించింది`,
      ta: `${weekdayName} செவ்வாய் ஆற்றல் நெருக்கடிகளில் பின்வாங்காமல் எதிர்நிற்கும் அசாதாரண துணிச்சலைத் தந்துள்ளது`,
      en: `forged on a spirited ${weekdayName}, your core instinct never retreats when pressure mounts—you step forward`,
    }, lang),
    pick6({
      kn: `${weekdayName}ದ ಬುಧ ಬುದ್ಧಿಮತ್ತೆಯು ಸಂಕೀರ್ಣ ಸಮಸ್ಯೆಗಳಲ್ಲೂ ಚುರುಕಾದ ದಾರಿ ಹುಡುಕುವ ಜಾಣ್ಮೆ ನೀಡಿದೆ`,
      mr: `${weekdayName}च्या बुध बुद्धिमत्तेमुळे कठीण प्रसंगातही चाणाक्ष मार्ग काढण्याची कला आपल्याला अवगत आहे`,
      hi: `${weekdayName} की बुध-प्रज्ञा ने आपको जटिल परिस्थितियों में भी सटीक राह खोजने की विलक्षण सूझबूझ दी है`,
      te: `${weekdayName} నాటి బుధ ప్రజ్ఞ క్లిష్ట పరిస్థితుల్లో సైతం సరైన దారి వెతికే తెలివితేటలను ఇచ్చింది`,
      ta: `${weekdayName} புதன் அறிவுத்திறன் சிக்கலான சூழலிலும் புத்திசாலித்தனமான தீர்வு காணும் ஆற்றலைத் தந்துள்ளது`,
      en: `born on sharp-minded ${weekdayName}, your intellect spots exits and opportunities others completely overlook`,
    }, lang),
    pick6({
      kn: `${weekdayName}ದ ಗುರು ಕೃಪೆಯು ಜನರು ತಮ್ಮ ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಸಲಹೆ ಹುಡುಕಿ ಬರುವಂತಹ ಗೌರವ ತಂದಿದೆ`,
      mr: `${weekdayName}च्या गुरुकृपेमुळे लोक कठीण काळात आपल्या सल्ल्यावर आणि मार्गदर्शनावर विश्वास ठेवतात`,
      hi: `${weekdayName} की गुरु-कृपा से लोग जीवन के कठिन मोड़ों पर स्वतः ही आपके विवेक और परामर्श की ओर खिंचे आते हैं`,
      te: `${weekdayName} నాటి గురు కృప వల్ల కష్టాల్లో ఉన్నవారు సైతం మీ సలహా కోసం ఎదురుచూసే గౌరవం లభించింది`,
      ta: `${weekdayName} குருவருள் பிறர் நெருக்கடியில் தவிக்கும்போது உங்கள் அறிவுரையைத் தேடி வரும் பெருமையைத் தந்துள்ளது`,
      en: `blessed by expansive ${weekdayName}, people naturally gravitate toward your counsel whenever storms hit their lives`,
    }, lang),
    pick6({
      kn: `${weekdayName}ದ ಶುಕ್ರ ಕಳೆಯು ನಿಮ್ಮ ಮಾತು, ಅಭಿರುಚಿ ಮತ್ತು ಸಂಬಂಧಗಳಲ್ಲಿ ಸಹಜ ಆಕರ್ಷಣೆಯನ್ನು ತುಂಬಿದೆ`,
      mr: `${weekdayName}च्या शुक्र तेजामुळे आपल्या बोलण्यात, कलात्मकतेत व स्वभावात एक वेगळेच आकर्षण आहे`,
      hi: `${weekdayName} की शुक्र-आभा ने आपके व्यक्तित्व, वाणी और संबंधों में एक स्वाभाविक सौम्यता एवं आकर्षण भरा है`,
      te: `${weekdayName} నాటి శుక్ర కళ మీ మాటల్లో, అభిరుచిలో మరియు వ్యక్తిత్వంలో సహజమైన ఆకర్షణను నింపింది`,
      ta: `${weekdayName} சுக்கிர ஒளி உங்கள் பேச்சிலும் ரசனையிலும் இயல்பான ஈர்ப்பையும் அன்பையும் சேர்த்துள்ளது`,
      en: `infused with ${weekdayName}'s creative magnetism, grace under pressure is your silent signature`,
    }, lang),
    pick6({
      kn: `${weekdayName}ದ ಶನಿ ಶಿಸ್ತು ನಿಮಗೆ ಹತ್ತು ಮಂದಿ ಸೋತರೂ ಕೊನೆಯವರೆಗೂ ನಿಂತು ಗೆಲ್ಲುವ ದೃಢ ಸಂಕಲ್ಪ ನೀಡಿದೆ`,
      mr: `${weekdayName}च्या शनी शिस्तीमुळे इतर थकले तरी शेवटपर्यंत टिकून जिंकण्याची ताकद आपल्यामध्ये आहे`,
      hi: `${weekdayName} के शनि-अनुशासन ने आपको वह सहनशक्ति दी है जहां सबके थक जाने पर भी आप विजयी होकर उभरते हैं`,
      te: `${weekdayName} నాటి శని క్రమశిక్షణ అందరూ అలసిపోయినా చివరి వరకు నిలబడి గెలిచే పట్టుదలను ఇచ్చింది`,
      ta: `${weekdayName} சனி ஒழுக்கம் மற்றவர்கள் சோர்ந்தாலும் இறுதிவரை நின்று வெல்லும் அசைக்க முடியாத உறுதியைத் தந்துள்ளது`,
      en: `anchored by enduring ${weekdayName}, you possess rare staying power—the ability to outlast chaos until truth settles`,
    }, lang),
  ][((weekdayIdx % 7) + 7) % 7];

  // Paksha moon energy
  const pakshaTone = isShuklaPaksha
    ? pick6({
      kn: `${pakshaName} ಪಕ್ಷದ ಏರುವ ಚಂದ್ರನಂತೆ ನಿಮ್ಮ ಆಸೆಗಳು ನಿಧಾನವಾದರೂ ನಿರಂತರವಾಗಿ ಬೆಳೆಯುವ ಸ್ವಭಾವದವು`,
      mr: `${pakshaName} पक्षातील वाढत्या चंद्राप्रमाणे आपली स्वप्ने हळूहळू पण निश्चित आकार घेत जाणारी आहेत`,
      hi: `${pakshaName} पक्ष के बढ़ते चंद्रमा की भांति आपके स्वप्न धीरे-धीरे पर निश्चित रूप से साकार होते जाते हैं`,
      te: `${pakshaName} పక్షపు పెరుగుతున్న చంద్రునిలా మీ ఆశయాలు నెమ్మదిగానైనా తప్పకుండా సాకారమవుతాయి`,
      ta: `${pakshaName} வளர்பிறை நிலவு போல உங்கள் இலக்குகள் மெல்ல மெல்ல உறுதியான வடிவம் பெறுபவை`,
      en: `carrying the waxing tide of ${pakshaName}, your ambitions gather momentum step by patient step`,
    }, lang)
    : pick6({
      kn: `${pakshaName} ಪಕ್ಷದ ಗಾಢ ಚಂದ್ರನಂತೆ ನೀವು ಮೇಲ್ನೋಟಕ್ಕಿಂತ ಆಳದಲ್ಲಿ ಸತ್ಯವನ್ನು ಅರಿಯುವ ತೀಕ್ಷ್ಣ ಒಳನೋಟ ಉಳ್ಳವರು`,
      mr: `${pakshaName} पक्षातील अंतर्मुख चंद्राप्रमाणे आपण वरवरच्या देखाव्यापेक्षा सत्य जाणून घेणारे आहात`,
      hi: `${pakshaName} पक्ष के गहन चंद्रमा के समान आप सतही दिखावे से परे गहराई का सत्य पहचान लेते हैं`,
      te: `${pakshaName} పక్షపు గంభీర చంద్రునిలా మీరు పైకి కనిపించే వాటికంటే లోతైన సత్యాన్ని గుర్తించగలరు`,
      ta: `${pakshaName} தேய்பிறை நிலவின் ஆழம் போல வெளித்தோற்றத்தை விட உண்மையான சாரத்தை எளிதில் உணர்பவர்`,
      en: `shaped by ${pakshaName}'s reflective lunar depth, you see right through surface noise into real motives`,
    }, lang);

  // Gana + Element personal twist for Para 2
  const ganaTwist = gana === "deva"
    ? pick6({
      kn: `${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ನಕ್ಷತ್ರದ ದೇವ ಗಣ ಸ್ವಭಾವದಿಂದ ನೀವು ಹೃದಯದಿಂದ ಯೋಚಿಸುವವರು — ಕಪಟತನ ನಿಮ್ಮಿಂದ ಸಾಧ್ಯವೇ ಇಲ್ಲ; ಅದೇ ನಿಮಗೆ ಅನೇಕ ಬಾರಿ ನೋವು ತಂದರೂ, ಕೊನೆಗೆ ಅದು ನಿಮ್ಮ ದೊಡ್ಡ ರಕ್ಷಣೆಯಾಗುತ್ತದೆ`,
      mr: `${nakshatraName} (चरण ${n(nakshatraPada)}) नक्षत्राच्या देव गणामुळे आपण मनाने अतिशय शुद्ध व प्रामाणिक आहात — कधीकधी याच चांगुलपणाचा त्रास झाला असला तरी शेवटी हेच आपले सर्वात मोठे कवच ठरते`,
      hi: `${nakshatraName} (पाद ${n(nakshatraPada)}) के देव गण ने आपको निष्कपट हृदय दिया है — भलाई के बदले कड़वाहट मिलने पर भी यही सच्चाई अंततः आपका सबसे बड़ा रक्षा कवच बनती है`,
      te: `${nakshatraName} (${n(nakshatraPada)}వ పాదం) దేవ గణ స్వభావం వల్ల మీరు కపటం ఎరుగని మనసు కలవారు — అదే మీకు కొన్నిసార్లు బాధ కలిగించినా, చివరికి అదే మిమ్మల్ని కాపాడుతుంది`,
      ta: `${nakshatraName} (${n(nakshatraPada)}-ம் பாதம்) தேவ கண இயல்பால் கபடமற்ற மனம் கொண்டவர் — சில சமயம் அதனால் வருத்தம் வந்தாலும் அதுவே உங்கள் நிரந்தர கவசம்`,
      en: `Because your birth star ${nakshatraName} belongs to the empathetic Deva archetype, you lead with sincerity—and though takers tested your trust, that same integrity quietly attracts your breakthrough`,
    }, lang)
    : gana === "manushya"
    ? pick6({
      kn: `${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ನಕ್ಷತ್ರದ ಮನುಷ್ಯ ಗಣ ಬುದ್ಧಿಯಿಂದ ನೀವು ಭಾವನೆ ಮತ್ತು ವಾಸ್ತವ ಎರಡನ್ನೂ ಸಮತೋಲನಗೊಳಿಸುತ್ತೀರಿ — ಪ್ರತಿಯೊಂದು ಸವಾಲೂ ನಿಮ್ಮನ್ನು ಹಂತ ಹಂತವಾಗಿ ಮತ್ತಷ್ಟು ಪ್ರಬುದ್ಧರನ್ನಾಗಿಸಿದೆ`,
      mr: `${nakshatraName} (चरण ${n(nakshatraPada)}) नक्षत्राच्या मनुष्य गणामुळे आपण भावना व व्यवहार यांचा अचूक समतोल साधता — प्रत्येक अडचणीने तुम्हाला अधिक परिपक्व व खंबीर बनवले आहे`,
      hi: `${nakshatraName} (पाद ${n(nakshatraPada)}) के मनुष्य गण के कारण आप भावना और व्यावहारिकता का अद्भुत संतुलन रखते हैं — हर संघर्ष ने आपको पहले से अधिक मजबूत बनाया है`,
      te: `${nakshatraName} (${n(nakshatraPada)}వ పాదం) మనుష్య గణం వల్ల భావోద్వేగాలను, వాస్తవాన్ని సమన్వయం చేసుకోగలరు — ప్రతి పరీక్ష మిమ్మల్ని మరింత దృఢంగా మార్చింది`,
      ta: `${nakshatraName} (${n(nakshatraPada)}-ம் பாதம்) மனுஷ்ய கண இயல்பால் உணர்வையும் யதார்த்தத்தையும் சமமாகக் கையாள்பவர் — ஒவ்வொரு தடையும் உங்களை வலிமைப்படுத்தியுள்ளது`,
      en: `Born in the grounded Manushya archetype of ${nakshatraName}, you balance heart with realism—every delayed promise so far was quietly training you for bigger stewardship`,
    }, lang)
    : pick6({
      kn: `${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ನಕ್ಷತ್ರದ ರಾಕ್ಷಸ ಗಣದ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿಯಿಂದ ಸುಳ್ಳು ಮಾತುಗಳನ್ನು ನೀವು ಕ್ಷಣದಲ್ಲಿ ಕಂಡುಹಿಡಿಯುತ್ತೀರಿ — ಹಳೆಯ ಗಡಿಗಳನ್ನು ಮುರಿದು ಹೊಸ ಹಾದಿ ನಿರ್ಮಿಸುವುದೇ ನಿಮ್ಮ ನಿಜವಾದ ಶಕ್ತಿ`,
      mr: `${nakshatraName} (चरण ${n(nakshatraPada)}) नक्षत्राच्या राक्षस गणामुळे खोटेपणा आपल्या नजरेतून सुटत नाही — जुन्या मर्यादा मोडून नवी वाट तयार करणे हीच आपली खरी ताकद आहे`,
      hi: `${nakshatraName} (पाद ${n(nakshatraPada)}) के प्रखर स्वभाव के कारण बनावटी बातें आपसे छिप नहीं सकतीं — पुरानी सीमाओं को तोड़कर नया मार्ग बनाना ही आपकी वास्तविक शक्ति है`,
      te: `${nakshatraName} (${n(nakshatraPada)}వ పాదం) రాక్షస గణ తీక్షణ దృష్టి వల్ల అబద్ధాలను వెంటనే పసిగట్టగలరు — పాత హద్దులను దాటి కొత్త దారి వేయడమే మీ అసలైన బలం`,
      ta: `${nakshatraName} (${n(nakshatraPada)}-ம் பாதம்) இயல்பின் கூர்மையான பார்வையால் போலிகளை நொடியில் அடையாளம் காண்பவர் — பழைய எல்லைகளைத் தாண்டி புதிய பாதை அமைப்பதே உங்கள் பலம்`,
      en: `Guided by the bold, perceptive archetype of ${nakshatraName}, you spot hidden agendas almost instantly—your life opens fastest the day you stop shrinking to make hesitant people comfortable`,
    }, lang);

  const elemFlavor =
    primaryElem === "fire"
      ? pick6({ kn: "ಅಗ್ನಿ ಚೇತನ", mr: "अग्नी ऊर्जा", hi: "अग्नि ऊर्जा", te: "అగ్ని శక్తి", ta: "அக்னி ஆற்றல்", en: "Fire momentum" }, lang)
      : primaryElem === "earth"
      ? pick6({ kn: "ಪೃಥ್ವಿ ಸ್ಥಿರತೆ", mr: "पृथ्वी स्थैर्य", hi: "पृथ्वी स्थायित्व", te: "భూ తత్వ స్థిరత్వం", ta: "பூமி உறுதி", en: "Earth steadiness" }, lang)
      : primaryElem === "air"
      ? pick6({ kn: "ವಾಯು ಚುರುಕುತನ", mr: "वायू गती", hi: "वायु गतिशीलता", te: "వాయు వేగం", ta: "வாயு வேகம்", en: "Air agility" }, lang)
      : pick6({ kn: "ಜಲ ಅಂತಃಪ್ರಜ್ಞೆ", mr: "जल संवेदनशीलता", hi: "जल अंतर्ज्ञान", te: "జల అంతర్దృష్టి", ta: "நீர் உள்ளுணர்வு", en: "Water intuition" }, lang);

  const p1 = pick6({
    kn: `ಪ್ರೀತಿಯ ${devoteeName}, ${n(birthDate)} ರಂದು ${n(birthTime)}ಕ್ಕೆ ${birthPlace}ದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಥಮ ಶ್ವಾಸ ಮೂಡಿದ ಕ್ಷಣದ ಪವಿತ್ರ ಪಂಚಾಂಗವು (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} ಹೋರೆ) ಒಂದು ಅಪೂರ್ವ ಜೀವನ ಕಥೆಯನ್ನು ಬರೆದಿದೆ: ${varaSpark}; ಹಾಗೂ ${pakshaTone}.`,
    mr: `प्रिय ${devoteeName}, दिनांक ${n(birthDate)} रोजी ${n(birthTime)} वाजता ${birthPlace} येथील आपल्या जन्मपंचांगाने (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} होरा) एक अनोखी जीवनकथा घडवली आहे: ${varaSpark}; तसेच ${pakshaTone}.`,
    hi: `प्रिय ${devoteeName}, दिनांक ${n(birthDate)} को ${n(birthTime)} बजे ${birthPlace} के पावन जन्म-पंचांग (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} होरा) ने आपके जीवन की एक विशिष्ट कथा लिखी है: ${varaSpark}, और ${pakshaTone}।`,
    te: `ప్రియమైన ${devoteeName}, ${n(birthDate)} నాడు ${n(birthTime)} గంటలకు ${birthPlace}లో మీ జన్మ పంచాంగం (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} హోర) ఒక విశేషమైన జీవన కథనాన్ని రాసింది: ${varaSpark}; మరియు ${pakshaTone}.`,
    ta: `அன்புள்ள ${devoteeName}, ${n(birthDate)} அன்று ${n(birthTime)} மணிக்கு ${birthPlace}ல் அமைந்த உங்கள் ஜென்ம பஞ்சாங்கம் (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} ஹோரை) ஒரு தனித்துவமான வாழ்க்கைக் கதையை வரைந்துள்ளது: ${varaSpark}; மேலும் ${pakshaTone}.`,
    en: `Dear ${devoteeName}, your exact birth Panchanga on ${birthDate} at ${birthTime} in ${birthPlace} (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} Hora) reveals why your path never matched anyone else's: ${varaSpark}, while ${pakshaTone}.`,
  }, lang);

  const p2 = pick6({
    kn: `${ganaTwist}. ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${moonRashiName} ರಾಶಿಯಲ್ಲಿ ಬೆಸೆದ '${elemFlavor}', ಯೋಗಿ '${yogiPlanetName}' ರಕ್ಷೆ ಹಾಗೂ ${n(maandiHouse)}ನೇ ಭಾವದ (${maandiDomainAffected}) ಪರೀಕ್ಷೆ ಏಕೆ ನಡೆದಿದೆ ಎಂಬ ರಹಸ್ಯವು ಮುಂದಿನ ೨೫ ಅಧ್ಯಾಯಗಳಲ್ಲಿ ರೋಚಕ ತಿರುವುಗಳೊಂದಿಗೆ ತೆರೆದುಕೊಳ್ಳಲಿದೆ — ಇದು ಕೇವಲ ನಿಮಗಾಗಿ ಬರೆದ ಜೀವನ ಕೈಪಿಡಿ!`,
    mr: `${ganaTwist}. आपल्या ${lagnaRashiName} लग्न व ${moonRashiName} राशीतील '${elemFlavor}', योगी '${yogiPlanetName}' चे बळ आणि ${n(maandiHouse)}व्या स्थानाची (${maandiDomainAffected}) परीक्षा कशी सुटणार, ही रंजक कथा पुढील २५ अध्यायांत उलगडणार आहे — ही केवळ आपल्यासाठी घडवलेली पुस्तिका आहे!`,
    hi: `${ganaTwist}। आपके ${lagnaRashiName} लग्न और ${moonRashiName} राशि में समाहित '${elemFlavor}', योगी '${yogiPlanetName}' का वरदान एवं ${n(maandiHouse)}वें स्थान (${maandiDomainAffected}) के अनकहे मोड़ आगे के २५ अध्यायों में एक रोचक कथा की तरह खुलेंगे — इसे संभालकर रखें!`,
    te: `${ganaTwist}. మీ ${lagnaRashiName} లగ్నం, ${moonRashiName} రాశిలోని '${elemFlavor}', యోగి '${yogiPlanetName}' బలం మరియు ${n(maandiHouse)}వ స్థానం (${maandiDomainAffected}) వెనుక ఉన్న ఆసక్తికర మలుపులు రాబోయే 25 అధ్యాయాల్లో కళ్ళకు కట్టినట్లు విచ్చుకోనున్నాయి!`,
    ta: `${ganaTwist}. உங்கள் ${lagnaRashiName} லக்னம் மற்றும் ${moonRashiName} ராசியின் '${elemFlavor}', யோகி '${yogiPlanetName}' துணை மற்றும் ${n(maandiHouse)}-ம் இட (${maandiDomainAffected}) திருப்பங்கள் அடுத்த 25 அத்தியாயங்களில் விறுவிறுப்பான கதையாக விரியவுள்ளன!`,
    en: `${ganaTwist}. Woven around your ${lagnaRashiName} ascendant, ${moonRashiName} Moon, innate ${elemFlavor}, Yogi ${yogiPlanetName}'s quiet backing, and the hidden test inside ${maandiDomainAffected}, the 25 chapters ahead unfold your real story—keep this private edition close.`,
  }, lang);

  const rawCover: BookletCoverContent = {
    brandBannerTitle: pick6({
      kn: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥",
      mr: "॥ बग्गोण पंचांग ॥",
      hi: "॥ बग्गोण पंचांग ॥",
      te: "॥ బగ్గోణ పంచాంగం ॥",
      ta: "✦ பக்கோண பஞ்சாங்கம் ✦",
      en: "BAGGONA PANCHANGA",
    }, lang),
    kshetraSubtitle: pick6({
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ • ಶುದ್ಧ ಪರಾಶರ ಹಾಗೂ ಪಂಚಾಂಗ ಜೀವನ ಗ್ರಂಥ",
      mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर सानिध्य • वैयक्तिक पंचांग जीवन ग्रंथ",
      hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर सान्निध्य • व्यक्तिगत पंचांग जीवन ग्रंथ",
      te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానం • వ్యక్తిగత పంచాంగ జీవన గ్రంథం",
      ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதி • தனித்துவ பஞ்சாங்க வாழ்க்கை நூல்",
      en: "Sri Kshetra Gokarna Mahabaleshwara Sannidhana • Personal Panchanga Story Edition",
    }, lang),
    exclusiveForTag: pick6({
      kn: `${devoteeName} ರವರ ಸ್ವಂತ ಸಂಗ್ರಹಕ್ಕೆ`,
      mr: `${devoteeName} यांच्या वैयक्तिक संग्रहासाठी`,
      hi: `${devoteeName} के निजी संग्रह हेतु`,
      te: `${devoteeName} గారి వ్యక్తిగత సంచిక`,
      ta: `${devoteeName} அவர்களின் தனிப்பட்ட தொகுப்பு`,
      en: `Exclusive Private Edition for ${devoteeName}`,
    }, lang),
    bookletEditionLine: pick6({
      kn: `${weekdayName} • ${cleanTithiWithPaksha} • ${yogaName} ಯೋಗ • ${karanaName} ಕರಣ • ${janmaHora} ಹೋರೆ`,
      mr: `${weekdayName} • ${cleanTithiWithPaksha} • ${yogaName} योग • ${karanaName} करण • ${janmaHora} होरा`,
      hi: `${weekdayName} • ${cleanTithiWithPaksha} • ${yogaName} योग • ${karanaName} करण • ${janmaHora} होरा`,
      te: `${weekdayName} • ${cleanTithiWithPaksha} • ${yogaName} యోగం • ${karanaName} కరణం • ${janmaHora} హోర`,
      ta: `${weekdayName} • ${cleanTithiWithPaksha} • ${yogaName} யோகம் • ${karanaName} கரணம் • ${janmaHora} ஹோரை`,
      en: `${weekdayName} • ${cleanTithiWithPaksha} • ${yogaName} • ${karanaName} • ${janmaHora} Hora`,
    }, lang),
    personalAssurancePara1: cleanRegional(p1, lang),
    personalAssurancePara2: cleanRegional(p2, lang),
    sealHeading: pick6({
      kn: "ಆಶೀರ್ವಾದದ ಮುದ್ರೆ • ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
      mr: "आशीर्वाद मुद्रा • वेदमूर्ती चैतन्य पंडित • श्री क्षेत्र गोकर्ण",
      hi: "आशीर्वाद मुद्रा • वेदमूर्ति चैतन्य पंडित • श्री क्षेत्र गोकर्ण",
      te: "ఆశీర్వాద ముద్ర • వేదమూర్తి చైతన్య పండిత్ • శ్రీ క్షేత్ర గోకర్ణ",
      ta: "ஆசீர்வாத முத்திரை • வேதமூர்த்தி சைதன்ய பண்டிதர் • ஸ்ரீ கோகர்ண",
      en: "Blessed & Sealed • Veda Moorthy Chaitanya Pandit • Sri Kshetra Gokarna",
    }, lang),
    confidentialFooterNote: pick6({
      kn: "ನಿಮ್ಮ ಜನ್ಮ ಪಂಚಾಂಗ ಹಾಗೂ ಗ್ರಹ ಗಣಿತದಿಂದ ಕೇವಲ ನಿಮಗಾಗಿ ಹೆಣೆದ ವೈಯಕ್ತಿಕ ಕಥನ",
      mr: "केवळ आपल्या जन्म पंचांगावरून खास आपल्यासाठी घडवलेले जीवन कथन",
      hi: "आपके जन्म पंचांग से केवल आपके लिए रचित व्यक्तिगत जीवन-कथा",
      te: "మీ జన్మ పంచాంగం ఆధారంగా కేవలం మీ కోసం రాసిన వ్యక్తిగత కథనం",
      ta: "உங்கள் ஜென்ம பஞ்சாங்கத்தின்படி உங்களுக்காக மட்டுமே உருவாக்கப்பட்ட வாழ்க்கைக் கதை",
      en: "Crafted Dynamically From Your Exact Birth Panchanga • Strictly Personal Keeping",
    }, lang),
  };

  if (lang === "te") {
    rawCover.brandBannerTitle = "॥ బగ్గోణ పంచాంగం ॥";
  }
  return rawCover;
}

// ============================================================================
// CONSOLIDATED DOSHA AUDIT (WHAT IT DOES NOW + LIFE AREA + EXACT ACTION)
// ============================================================================

export function buildConsolidatedDoshaProfiles(ctx: StoryEngineInput): ActiveDoshaProfile[] {
  const { targetLang: lang, activeRawDoshas, maandiHouse, maandiRashiName, maandiDomainAffected, shaniHouseFromMoon, shaniTransitRashi, currentMahadasha, devoteeName, lagnaRashiName } = ctx;
  const n = (v: number | string) => digits(v, lang);
  const profiles: ActiveDoshaProfile[] = [];

  for (const d of activeRawDoshas.slice(0, 4)) {
    const rawTitle = lang === "mr" ? (d.name?.hi || d.name?.en) : (d.name?.[lang] || d.name?.en);
    const title = cleanRegional(rawTitle || "", lang);
    const sevMap: Record<string, Record<SixLang, string>> = {
      CRITICAL: { kn: "ತೀವ್ರ ಪ್ರಭಾವ", mr: "प्रमुख प्रभाव", hi: "प्रमुख प्रभाव", te: "ప్రధాన ప్రభావం", ta: "முக்கிய தாக்கம்", en: "High Priority" },
      HIGH: { kn: "ಸಕ್ರಿಯ ಪ್ರಭಾವ", mr: "सक्रिय प्रभाव", hi: "सक्रिय प्रभाव", te: "క్రియాశీల ప్రభావం", ta: "செயல்பாட்டில்", en: "Active" },
      MODERATE: { kn: "ಮಧ್ಯಮ ಪ್ರಭಾವ", mr: "मध्यम प्रभाव", hi: "मध्यम प्रभाव", te: "మధ్యస్థ ప్రభావం", ta: "மிதமான தாக்கம்", en: "Moderate" },
      MILD: { kn: "ಸೂಕ್ಷ್ಮ ಪ್ರಭಾವ", mr: "सौम्य प्रभाव", hi: "सौम्य प्रभाव", te: "స్వల్ప ప్రభావం", ta: "லேசான தாக்கம்", en: "Gentle" },
    };
    const severityLabel = sevMap[(d.severity || "MODERATE").toUpperCase()]?.[lang] || sevMap.MODERATE[lang];

    const rawDoing = lang === "mr" ? (d.currentLifeProblems?.hi || d.lifeImpact?.hi || d.currentLifeProblems?.en) : (d.currentLifeProblems?.[lang] || d.lifeImpact?.[lang] || d.currentLifeProblems?.en);
    const rawAffecting = lang === "mr" ? (d.agePriorityReason?.hi || d.dashaResonance?.hi || d.agePriorityReason?.en) : (d.agePriorityReason?.[lang] || d.dashaResonance?.[lang] || d.agePriorityReason?.en);
    const rawPooja = lang === "mr" ? (d.recommendedPooja?.hi || d.recommendedPooja?.en) : (d.recommendedPooja?.[lang] || d.recommendedPooja?.en);
    const rawRemList = lang === "mr" ? (d.remedies?.hi || d.remedies?.en || []) : (d.remedies?.[lang] || d.remedies?.en || []);
    const remLine = [rawPooja, rawRemList[0]].filter(Boolean).join(" • ");

    profiles.push({
      id: d.id,
      title,
      severityLabel,
      doingNow: cleanRegional(rawDoing || "", lang),
      affectingArea: cleanRegional(
        rawAffecting ||
        pick6({
          kn: `ಪ್ರಸ್ತುತ ದಶಾ ಅವಧಿ ಹಾಗೂ ${maandiDomainAffected} ಕ್ಷೇತ್ರದ ಮೇಲೆ ನೇರ ಪ್ರಭಾವ`,
          mr: `सध्याचा दशा काळ व ${maandiDomainAffected} क्षेत्रावर थेट परिणाम`,
          hi: `वर्तमान दशा चक्र तथा ${maandiDomainAffected} क्षेत्र पर प्रत्यक्ष प्रभाव`,
          te: `ప్రస్తుత దశ మరియు ${maandiDomainAffected} విభాగంపై ప్రభావం`,
          ta: `நடப்பு தசா காலம் மற்றும் ${maandiDomainAffected} பகுதியில் தாக்கம்`,
          en: `Directly influencing your active life chapter and ${maandiDomainAffected}`,
        }, lang),
        lang
      ),
      exactAction: cleanRegional(
        remLine ||
        pick6({
          kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಹಾಗೂ ನಿಯಮಿತ ದಾನ-ಸೇವೆ",
          mr: "श्री गोकर्ण महाबळेश्वर येथे संकल्प पूजा व गरजूंना दान",
          hi: "श्री गोकर्ण महाबलेश्वर में संकल्प पूजा एवं नियमित सेवा-दान",
          te: "గోకర్ణ మహాబలేశ్వర ఆలయంలో సంకల్ప పూజ & అన్నదానం",
          ta: "கோகர்ண மகாபலேஸ்வரர் சன்னதியில் சங்கல்ப வழிபாடு மற்றும் அன்னதானம்",
          en: "Perform targeted sankalpa puja at Sri Kshetra Gokarna paired with disciplined service",
        }, lang),
        lang
      ),
    });
  }

  // Always include Maandi / Gulika Knot profile so every user sees what subtle Maandi is doing & how to unlock it cleanly
  profiles.push({
    id: "maandi_knot",
    title: pick6({
      kn: `ಮಾಂದಿ (ಗುಳಿಕ) ${n(maandiHouse)}ನೇ ಭಾವ ಗಂಟು (${maandiRashiName})`,
      mr: `मांदी (गुलिक) ${n(maandiHouse)}वे स्थान गाठ (${maandiRashiName})`,
      hi: `मांदी (गुलिक) ${n(maandiHouse)}वां भाव अवरोध (${maandiRashiName})`,
      te: `మాంది (గుళిక) ${n(maandiHouse)}వ స్థాన గ్రంథి (${maandiRashiName})`,
      ta: `மாந்தி (குளிகை) ${n(maandiHouse)}-ம் இடம் (${maandiRashiName})`,
      en: `Maandi (Gulika) Knot — House ${maandiHouse} (${maandiRashiName})`,
    }, lang),
    severityLabel: pick6({ kn: "ನಿಯಂತ್ರಣೀಯ ಗಂಟು", mr: "नियंत्रणीय गाठ", hi: "सुधार योग्य", te: "నియంత్రణలో", ta: "சரிசெய்யக் கூடியது", en: "Key Unlock" }, lang),
    doingNow: cleanRegional(pick6({
      kn: `ಕೈಗೆ ಬಂದ ಅವಕಾಶಗಳು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಸಣ್ಣ ಕಾರಣಕ್ಕೆ ತಡೆಹಿಡಿಯಲ್ಪಡುವ ಅನುಭವ (${maandiDomainAffected}).`,
      mr: `हातातोंडाशी आलेले यश शेवटच्या क्षणी थोडक्यात अडकण्याचा अनुभव (${maandiDomainAffected}).`,
      hi: `अंतिम चरण में पहुंचकर किसी कार्य में अनावश्यक विलंब या भटकाव का अनुभव (${maandiDomainAffected})।`,
      te: `పూర్తయ్యే చివరి క్షణంలో పనులు ఆగిపోతున్న భావన (${maandiDomainAffected}).`,
      ta: `கைக்கு எட்டிய வாய்ப்பு கடைசி நிமிடத்தில் தாமதமாகும் அனுபவம் (${maandiDomainAffected}).`,
      en: `Creates subtle last-minute friction right before completion inside ${maandiDomainAffected}.`,
    }, lang), lang),
    affectingArea: cleanRegional(pick6({
      kn: `${maandiDomainAffected} • ${devoteeName} ರವರ ಪ್ರಸ್ತುತ ಮಹಾದಶಾ (${currentMahadasha}) ವೇಗ`,
      mr: `${maandiDomainAffected} • चालू दशा (${currentMahadasha}) व निर्णय वेग`,
      hi: `${maandiDomainAffected} • वर्तमान दशा (${currentMahadasha}) में कार्य की गति`,
      te: `${maandiDomainAffected} • ప్రస్తుత ${currentMahadasha} దశలో ఫలితాల వేగం`,
      ta: `${maandiDomainAffected} • நடப்பு ${currentMahadasha} தசா கால வேகம்`,
      en: `${maandiDomainAffected} • Pacing within your active ${currentMahadasha} phase for ${lagnaRashiName} ascendant`,
    }, lang), lang),
    exactAction: cleanRegional(pick6({
      kn: "ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಬಡವರಿಗೆ ಅಥವಾ ಮೂಕ ಪ್ರಾಣಿಗಳಿಗೆ ಆಹಾರ ನೀಡಿ; ಅಗತ್ಯವಿದ್ದರೆ ಗೋಕರ್ಣದಲ್ಲಿ ತಿಲ ಹೋಮ / ಶನಿ-ಮಾಂದಿ ಶಾಂತಿ ಮಾಡಿಸಿ.",
      mr: "शनिवारी तीळतेलाचा दिवा लावून गरजूंना अन्न द्या; गोकर्णात शनी-मांदी शांती किंवा तिल होमाचा संकल्प करा.",
      hi: "शनिवार को तिल के तेल का दीपक जलाकर असहाय जनों को भोजन कराएं; गोकर्ण में तिल होम या शनि-मांदी शांति कराएं।",
      te: "శనివారం నువ్వుల నూనె దీపం వెలిగించి అన్నదానం చేయండి; అవసరమైతే గోకర్ణంలో తిల హోమం జరిపించండి.",
      ta: "சனிக்கிழமை நல்லெண்ணெய் தீபம் ஏற்றி ஏழைகளுக்கு உணவளிக்கவும்; கோகர்ணத்தில் தில ஹோமம் செய்வது நன்று.",
      en: "Offer sesame oil lamp lighting and feed the needy on Saturdays; for persistent blocks, perform Tila Homa / Shani-Maandi Shanti at Gokarna.",
    }, lang), lang),
  });

  // Add active Saturn transit check if in Sade Sati / Ashtama / Kantaka
  if ([12, 1, 2, 8, 4, 7].includes(shaniHouseFromMoon) && profiles.length < 4) {
    profiles.push({
      id: "shani_transit_cycle",
      title: pick6({
        kn: shaniHouseFromMoon === 8 ? "ಅಷ್ಟಮ ಶನಿ ಸಂಚಾರ ಪರೀಕ್ಷೆ" : [12, 1, 2].includes(shaniHouseFromMoon) ? "ಸಾಡೇಸಾತಿ ಶನಿ ಸಂಚಾರ ಹಂತ" : "ಕಂಟಕ / ಅರ್ಧಾಷ್ಟಮ ಶನಿ ಹಂತ",
        mr: shaniHouseFromMoon === 8 ? "अष्टम शनी परीक्षा काळ" : [12, 1, 2].includes(shaniHouseFromMoon) ? "साडेसाती शनी टप्पा" : "अर्धाष्टम / कंटक शनी",
        hi: shaniHouseFromMoon === 8 ? "अष्टम शनि गोचर चरण" : [12, 1, 2].includes(shaniHouseFromMoon) ? "साढ़ेसाती शनि चरण" : "ढैया / कंटक शनि चरण",
        te: shaniHouseFromMoon === 8 ? "అష్టమ శని సంచార దశ" : [12, 1, 2].includes(shaniHouseFromMoon) ? "ఏల్నాటి శని దశ" : "కంటక శని దశ",
        ta: shaniHouseFromMoon === 8 ? "அஷ்டம சனி காலம்" : [12, 1, 2].includes(shaniHouseFromMoon) ? "ஏழரை சனி காலம்" : "கண்டக சனி காலம்",
        en: shaniHouseFromMoon === 8 ? "Ashtama Saturn Cycle" : [12, 1, 2].includes(shaniHouseFromMoon) ? "Sade Sati Saturn Cycle" : "Kantaka Saturn Cycle",
      }, lang),
      severityLabel: pick6({ kn: "ಕಾಲಚಕ್ರ ಪಾಠ", mr: "कालचक्र परीक्षा", hi: "गोचर प्रभाव", te: "గోచార దశ", ta: "கோசார நிலை", en: "Transit Phase" }, lang),
      doingNow: cleanRegional(pick6({
        kn: `ನಂಬಿದವರಿಂದ ಅಂತರ ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳ ಹೊರೆ ಹೆಚ್ಚಾಗಿ ಮನಸ್ಸಿಗೆ ಭಾರ ಅನಿಸುವಂತೆ ಮಾಡುತ್ತಿದೆ (${shaniTransitRashi}).`,
        mr: `जवळच्या लोकांपासून दुरावा आणि जबाबदाऱ्यांचे ओझे वाढल्याची जाणीव होत आहे (${shaniTransitRashi}).`,
        hi: `अपेक्षित सहयोग में देरी तथा पारिवारिक-आजीविका दायित्वों का भार बढ़ा हुआ प्रतीत होता है (${shaniTransitRashi})।`,
        te: `బాధ్యతల భారం పెరిగి, ఆశించిన సహకారం ఆలస్యమవుతున్న అనుభూతి (${shaniTransitRashi}).`,
        ta: `பொறுப்புகளின் சுமை கூடி, நெருங்கியவர்களின் ஆதரவு தாமதமாகும் நிலை (${shaniTransitRashi}).`,
        en: `Tightens patience by removing easy shortcuts and increasing real responsibility while transiting ${shaniTransitRashi}.`,
      }, lang), lang),
      affectingArea: cleanRegional(pick6({
        kn: `ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಸ್ಥಾನ — ಮನಸ್ಸಿನ ಶಾಂತಿ, ನಿದ್ರೆ ಮತ್ತು ತಾಳ್ಮೆಯ ಕ್ಷೇತ್ರ`,
        mr: `चंद्रापासून ${n(shaniHouseFromMoon)}वे स्थान — मानसिक शांतता व संयम क्षेत्र`,
        hi: `चंद्र से ${n(shaniHouseFromMoon)}वां स्थान — मानसिक शांति, धैर्य और कार्यक्षेत्र`,
        te: `చంద్రుని నుండి ${n(shaniHouseFromMoon)}వ స్థానం — మనశ్శాంతి మరియు వృత్తి`,
        ta: `சந்திரனிலிருந்து ${n(shaniHouseFromMoon)}-ம் இடம் — மன அமைதி மற்றும் நிதானம்`,
        en: `House ${shaniHouseFromMoon} from natal Moon — patience, rest cycles, and steady accountability`,
      }, lang), lang),
      exactAction: cleanRegional(pick6({
        kn: "ಪ್ರತಿ ಶನಿವಾರ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಶ್ರಮಜೀವಿಗಳಿಗೆ ಗೌರವ-ಸಹಾಯ ನೀಡಿ; ಗೋಕರ್ಣದಲ್ಲಿ ಮೃತ್ಯುಂಜಯ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಅತ್ಯುತ್ತಮ ರಕ್ಷೆ.",
        mr: "दर शनिवारी मारुती स्तोत्र म्हणा व कष्टकरी व्यक्तींना मदत करा; गोकर्णात रुद्राभिषेक करणे उत्तम.",
        hi: "प्रत्येक शनिवार को हनुमान चालीसा पाठ कर श्रमजीवियों की सहायता करें; गोकर्ण में रुद्राभिषेक रक्षा देगा।",
        te: "ప్రతి శనివారం హనుమాన్ చాలీసా చదివి శ్రామికులకు సహాయం చేయండి; గోకర్ణంలో రుద్రాభిషేకం శుభం.",
        ta: "ஒவ்வொரு சனிக்கிழமையும் அனுமன் சாலிசா பாராயணம் செய்து உழைப்பாளிகளுக்கு உதவுங்கள்.",
        en: "Recite Hanuman Chalisa on Saturdays, support hardworking elders/laborers, and keep promises strictly on time.",
      }, lang), lang),
    });
  }

  return profiles;
}

// ============================================================================
// CHART VISUAL METRICS BUILDER (DRIVES CHAPTER SVG INFOGRAPHICS)
// ============================================================================

export function computeChartVisualMetrics(ctx: StoryEngineInput): ChartVisualMetrics {
  const totalW = Math.max(1, ctx.elemWeights.fire + ctx.elemWeights.earth + ctx.elemWeights.air + ctx.elemWeights.water);
  const f = Math.round((ctx.elemWeights.fire / totalW) * 100);
  const e = Math.round((ctx.elemWeights.earth / totalW) * 100);
  const a = Math.round((ctx.elemWeights.air / totalW) * 100);
  const w = Math.max(5, 100 - (f + e + a));

  const savByHouse: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const rIdx = (ctx.lagnaRashiIdx + h - 1) % 12;
    savByHouse.push(ctx.savTable[rIdx] ?? 28);
  }

  const baseScore = ctx.extendedPrecision.liveTarabala.score || 68;
  const guruBoost = [2, 5, 7, 9, 11].includes(ctx.guruHouseFromMoon) ? 14 : 4;
  const shaniDrag = [8, 12, 1, 2].includes(ctx.shaniHouseFromMoon) ? -8 : 8;
  const peakSav = Math.round(((savByHouse[9] + savByHouse[10]) / 2) * 1.1);
  const clamp = (v: number) => Math.max(38, Math.min(96, Math.round(v)));

  const fiveYearScores = [
    { year: ctx.nowYear, score: clamp(58 + shaniDrag + (baseScore > 65 ? 8 : 0)) },
    { year: ctx.nowYear + 1, score: clamp(66 + guruBoost * 0.7 + (ctx.isDashaSandhi ? 4 : 9)) },
    { year: ctx.nowYear + 2, score: clamp(72 + (peakSav - 25)) },
    { year: ctx.nowYear + 3, score: clamp(78 + guruBoost * 0.6) },
    { year: ctx.nowYear + 4, score: clamp(82 + Math.min(12, Math.max(0, peakSav - 24))) },
  ];

  return {
    elemPercentages: { fire: f, earth: e, air: a, water: w },
    savByHouse,
    mandalaPlacements: {
      lagnaRashiIdx: ctx.lagnaRashiIdx,
      moonRashiIdx: ctx.moonRashiIdx,
      sunRashiIdx: ctx.sunRashiIdx,
      yogiRashiIdx: ctx.yogiRashiIdx,
      maandiRashiIdx: ctx.maandiRashiIdx,
      saturnRashiIdx: ctx.saturnRashiIdx,
      jupiterRashiIdx: ctx.jupiterRashiIdx,
    },
    tarabalaScore: ctx.extendedPrecision.liveTarabala.score,
    isChandrashtama: ctx.extendedPrecision.liveTarabala.isChandrashtama,
    shaniHouseFromMoon: ctx.shaniHouseFromMoon,
    guruHouseFromMoon: ctx.guruHouseFromMoon,
    shaniTransitSav: ctx.shaniTransitSav,
    guruTransitSav: ctx.guruTransitSav,
    fiveYearScores,
    yogiPlanetName: ctx.yogiPlanetName,
    yogiColor: ctx.localizedYogiColor,
    yogiDirection: ctx.localizedYogiDirection,
    yogiDirectionDeg: getYogiCompassDeg(ctx.rawYogi),
    yogiDay: ctx.localizedYogiDay,
    maandiHouse: ctx.maandiHouse,
    bhriguRashiName: ctx.bhriguBinduRashiName,
    nowYear: ctx.nowYear,
    dominantElementKey: ctx.primaryElem,
  };
}

// ============================================================================
// 5-THEME SHUFFLE ENGINE, VIVID HOOK EXAMPLES & NEAR-VS-FAR VISUAL SUMMARIES
// ============================================================================

const ALL_NARRATIVE_THEMES: NarrativeThemeKey[] = [
  "cinema",
  "nakshatra",
  "yoga_karana",
  "near_far",
  "parable",
];

function buildShuffledChapterThemes(ctx: StoryEngineInput): Record<number, NarrativeThemeKey> {
  const dobSum = (ctx.birthDate || "")
    .split("")
    .reduce((acc, ch) => acc + (ch.charCodeAt(0) || 0), 0);
  const seedBase =
    dobSum * 31 +
    ctx.nakshatraIdx * 17 +
    ctx.lagnaRashiIdx * 13 +
    ctx.moonRashiIdx * 11 +
    ctx.weekdayIdx * 7 +
    (ctx.isShuklaPaksha ? 5 : 19);

  const assignment: Record<number, NarrativeThemeKey> = {};
  let prevBlockLast: NarrativeThemeKey | null = null;

  for (let block = 0; block < 5; block++) {
    const pool: NarrativeThemeKey[] = [...ALL_NARRATIVE_THEMES];
    for (let i = pool.length - 1; i > 0; i--) {
      const h = Math.abs((seedBase + block * 97 + i * 53) * 2654435761) >>> 0;
      const j = h % (i + 1);
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    if (prevBlockLast && pool[0] === prevBlockLast) {
      const swap = pool[0];
      pool[0] = pool[2];
      pool[2] = swap;
    }
    for (let k = 0; k < 5; k++) {
      const chNum = block * 5 + k + 1;
      assignment[chNum] = pool[k];
    }
    prevBlockLast = pool[4];
  }
  return assignment;
}

type ChapterBucket = "mirror" | "pivot" | "transit" | "pillar" | "horizon" | "finale";

function getChapterBucket(chNum: number): ChapterBucket {
  if (chNum <= 2 || chNum === 5) return "mirror";
  if (chNum === 3 || chNum === 4 || chNum === 6 || chNum === 18) return "pivot";
  if (chNum >= 7 && chNum <= 11) return "transit";
  if (chNum >= 12 && chNum <= 16) return "pillar";
  if (chNum >= 17 && chNum <= 22) return "horizon";
  return "finale";
}

function buildChapterThemeAndNarrativeLayer(args: {
  chNum: number;
  themeKey: NarrativeThemeKey;
  ctx: StoryEngineInput;
  savByHouse: number[];
  peakHouseNum: number;
  doshaProfiles: ActiveDoshaProfile[];
  isChildOrInfant: boolean;
  taraScore: number;
  taraWord: string;
}): {
  storyHook: string;
  extP1: string;
  extP2: string;
  extP3: string;
  visualSummary: ChapterVisualSummary;
} {
  const {
    chNum,
    themeKey,
    ctx,
    savByHouse,
    peakHouseNum,
    doshaProfiles,
    isChildOrInfant,
    taraScore,
    taraWord,
  } = args;

  const {
    targetLang: lang,
    devoteeName,
    nakshatraName,
    nakshatraPada,
    yogaName,
    karanaName,
    weekdayName,
    lagnaRashiName,
    moonRashiName,
    yogiPlanetName,
    avayogiPlanetName,
    localizedYogiDay,
    localizedYogiDirection,
    bhriguBinduRashiName,
    maandiHouse,
    shaniTransitRashi,
    guruTransitRashi,
    currentMahadasha,
    currentBhuktiLord,
    bhuktiEndDate,
    dominantElement,
    detectedYogasSummary,
    house6Info,
    heroPlanetName,
    heroPlanetHouse,
    heroPlanetRashi,
    nearestColleagueName,
    nearestColleagueHouse,
    nearestColleagueRashi,
    lagnaLordName,
    nowYear,
  } = ctx;

  const n = (v: number | string) => digits(v, lang);
  const bucket = getChapterBucket(chNum);

  const themeBadge =
    themeKey === "cinema"
      ? pick6({ kn: `👑 ನಾನು ನಿನ್ನ '${heroPlanetName}' ನಾಯಕ`, mr: `👑 मी तुझा '${heroPlanetName}' नायक`, hi: `👑 मैं तुम्हारा '${heroPlanetName}' नायक`, te: `👑 నేను నీ '${heroPlanetName}' నాయకుడు`, ta: `👑 நான் உன் '${heroPlanetName}' நாயகன்`, en: `👑 I Am Your Hero: ${heroPlanetName}` }, lang)
      : themeKey === "nakshatra"
      ? pick6({ kn: `⭐ ನಾನು ನಿನ್ನ ${nakshatraName}`, mr: `⭐ मी तुझे ${nakshatraName}`, hi: `⭐ मैं तुम्हारा ${nakshatraName}`, te: `⭐ నేను నీ ${nakshatraName}`, ta: `⭐ நான் உன் ${nakshatraName}`, en: `⭐ I Am ${nakshatraName} Star` }, lang)
      : themeKey === "yoga_karana"
      ? pick6({ kn: `⚡ ನಾನು ನಿನ್ನ '${yogaName}' • '${karanaName}'`, mr: `⚡ मी तुझा '${yogaName}' • '${karanaName}'`, hi: `⚡ मैं तुम्हारा '${yogaName}' • '${karanaName}'`, te: `⚡ నేను నీ '${yogaName}' • '${karanaName}'`, ta: `⚡ நான் உன் '${yogaName}' • '${karanaName}'`, en: `⚡ I Am ${yogaName} & ${karanaName}` }, lang)
      : themeKey === "near_far"
      ? pick6({ kn: `🧭 ನಾನು ನಿನ್ನ '${lagnaRashiName}' ಲಗ್ನ`, mr: `🧭 मी तुझे '${lagnaRashiName}' लग्न`, hi: `🧭 मैं तुम्हारा '${lagnaRashiName}' लग्न`, te: `🧭 నేను నీ '${lagnaRashiName}' లగ్నం`, ta: `🧭 நான் உன் '${lagnaRashiName}' லக்னம்`, en: `🧭 I Am ${lagnaRashiName} Ascendant` }, lang)
      : pick6({ kn: `⛵ ನಾನು ನಿನ್ನ ಯೋಗಿ '${yogiPlanetName}'`, mr: `⛵ मी तुझा योगी '${yogiPlanetName}'`, hi: `⛵ मैं तुम्हारा योगी '${yogiPlanetName}'`, te: `⛵ నేను నీ యోగి '${yogiPlanetName}'`, ta: `⛵ நான் உன் யோகி '${yogiPlanetName}'`, en: `⛵ I Am Your Yogi ${yogiPlanetName}` }, lang);

  // Authentic First-Person Hero Voice introducing real neighboring colleagues inside THIS devotee's Kundali
  const rawHook = (): string => {
    if (isChildOrInfant && (chNum === 12 || chNum === 13 || chNum === 14)) {
      if (themeKey === "cinema" || themeKey === "yoga_karana") {
        return pick6({
          kn: `ನಮಸ್ಕಾರ, ನಾನು ಈ ಪುಟ್ಟ ಕಂದಮ್ಮನ ಕುಂಡಲಿಯ ನಾಯಕ '${heroPlanetName}' (${n(heroPlanetHouse)}ನೇ ಮನೆ) ಹಾಗೂ ಜನ್ಮ ಯೋಗ '${yogaName}' ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ! ನನ್ನ ಪಕ್ಕದಲ್ಲೇ ಸಹೋದ್ಯೋಗಿ '${nearestColleagueName}' ನಿಂತಿದ್ದು, ಮಗುವಿನ ನೈಸರ್ಗಿಕ ಕುತೂಹಲ ಮತ್ತು ಸುರಕ್ಷತೆಯನ್ನು ನಾವು ಇಬ್ಬರೂ ಕಾಯುತ್ತಿದ್ದೇವೆ.`,
          mr: `नमस्कार, मी या चिमुकल्याच्या पत्रिकेतील प्रमुख नायक '${heroPlanetName}' (स्थान ${n(heroPlanetHouse)}) आणि जन्म योग '${yogaName}' बोलत आहे! माझ्या अगदी शेजारी '${nearestColleagueName}' उभा असून आम्ही दोघे या बाळाच्या आनंदाचे रक्षण करत आहोत.`,
          hi: `नमस्ते, मैं इस बालक की कुंडली का प्रमुख नायक '${heroPlanetName}' (भाव ${n(heroPlanetHouse)}) तथा जन्म योग '${yogaName}' बोल रहा हूं! मेरे ठीक पास सहकर्मी '${nearestColleagueName}' स्थित है और हम दोनों इस बच्चे की मुस्कान की रक्षा कर रहे हैं।`,
          te: `నమస్కారం, నేను ఈ చిన్నారి జాతకంలో ప్రధాన నాయకుడైన '${heroPlanetName}' (${n(heroPlanetHouse)}వ స్థానం) మరియు '${yogaName}' మాట్లాడుతున్నాను! నా పక్కనే ఉన్న '${nearestColleagueName}' తో కలిసి మేము ఈ చిన్నారి ఆనందాన్ని కాపాడుతున్నాము.`,
          ta: `வணக்கம், நான் இந்தக் குழந்தையின் ஜாதக நாயகன் '${heroPlanetName}' (${n(heroPlanetHouse)}-ம் வீடு) மற்றும் '${yogaName}' பேசுகிறேன்! என் அருகில் நிற்கும் '${nearestColleagueName}' உடன் சேர்ந்து இந்தக் குழந்தையின் மகிழ்ச்சியைக் காத்து வருகிறோம்.`,
          en: `Hello parents—I am ${heroPlanetName} in House ${heroPlanetHouse}, paired with ${yogaName} Yoga as the protecting hero of this child's chart! Standing right beside me is ${nearestColleagueName}, and together we nurture this child's bright curiosity in safety.`,
        }, lang);
      }
      if (themeKey === "nakshatra") {
        return pick6({
          kn: `ನಾನು ಈ ಕಂದಮ್ಮನ ಜನ್ಮ ನಕ್ಷತ್ರ ${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ! ${weekdayName}ದಿಂದ ನಾನು ಈ ಮಗುವಿನ ಮೃದು ಮನಸ್ಸನ್ನು ಕಾಯುತ್ತಿದ್ದೇನೆ — ಪ್ರೀತಿಯ ಮಾತು ಮತ್ತು ಶಾಂತ ವಾತಾವರಣವೇ ಇದಕ್ಕೆ ಅತಿ ದೊಡ್ಡ ಕವಚ.`,
          mr: `मी या बाळाचे जन्म नक्षत्र ${nakshatraName} (चरण ${n(nakshatraPada)}) बोलत आहे! जन्म दिवसापासूनच मी या चिमुकल्याचे संरक्षण करत आहे — घरची शांतता आणि प्रेमाची ऊब हेच याचे खरे बळ आहे.`,
          hi: `मैं इस बालक का जन्म नक्षत्र ${nakshatraName} (पाद ${n(nakshatraPada)}) बोल रहा हूं! पहले दिन से ही मैं इसकी कोमल ऊर्जा की रक्षा कर रहा हूं—घर की मिठास और धैर्य ही इसकी सबसे बड़ी ताकत बनेंगे।`,
          te: `నేను ఈ చిన్నారి జన్మ నక్షత్రం ${nakshatraName} (పాదం ${n(nakshatraPada)}) మాట్లాడుతున్నాను! మొదటి శ్వాస నుండి ఈ బిడ్డను కాపాడుతున్నాను—ఇంటి ప్రేమ, ప్రశాంతతే దీనికి అసలైన కవచం.`,
          ta: `நான் இந்தக் குழந்தையின் ஜென்ம நட்சத்திரம் ${nakshatraName} (பாதம் ${n(nakshatraPada)}) பேசுகிறேன்! முதல் நாளிலிருந்தே இந்தக் குழந்தையைக் காத்து வருகிறேன்—அன்பான வீட்டுச் சூழலே இதன் பெரும் பலம்.`,
          en: `I am this child's birth star ${nakshatraName} (Pada ${nakshatraPada}), watching silently since ${weekdayName}! Every gentle encouragement spoken at home right now becomes an invisible lifelong shield around this bright young mind.`,
        }, lang);
      }
      return pick6({
        kn: `ನಾನು ಜನ್ಮ ಲಗ್ನ '${lagnaRashiName}' ನಾಯಕ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ: ಈ ಕಂದನಿಗೆ ಕುತೂಹಲ ಮತ್ತು ಮನೆಯ ಪ್ರೀತಿ ಕೈಗೆಟುಕುವಷ್ಟು ಹತ್ತಿರದಲ್ಲಿವೆ; ಆದರೆ ಭಯ ಮತ್ತು ಬಾಲಾರಿಷ್ಟ ಆತಂಕಗಳು ಇದರಿಂದ ಬಹುದೂರ ಸರಿದಿವೆ.`,
        mr: `मी जन्म लग्न '${lagnaRashiName}' नायक बोलत आहे: या बाळाच्या हाताशी अद्भुत कुतूहल व घरचे प्रेम आहे, तर कोणत्याही भीतीचे सावट यापासून खूप दूर सरले आहे.`,
        hi: `मैं जन्म लग्न '${lagnaRashiName}' नायक बोल रहा हूं: इस बच्चे के बिल्कुल पास अद्भुत जिज्ञासा और पारिवारिक सुरक्षा है, जबकि अनावश्यक चिंता इससे कोसों दूर हट चुकी है।`,
        te: `నేను జన్మ లగ్నం '${lagnaRashiName}' నాయకుడిగా మాట్లాడుతున్నాను: ఈ చిన్నారికి ఆనందం, ఇంటి రక్షణ చాలా దగ్గరలో ఉన్నాయి—అనవసర భయాలన్నీ దూరంగా తొలగిపోయాయి.`,
        ta: `நான் ஜென்ம லக்னம் '${lagnaRashiName}' நாயகனாகப் பேசுகிறேன்: இக்குழந்தையின் அருகே ஆர்வமும் பாதுகாப்பும் நிறைந்துள்ளன; தேவையற்ற அச்சங்கள் வெகு தொலைவில் விலகிவிட்டன.`,
        en: `I am ${lagnaRashiName}, guardian captain of this child's chart: joyful curiosity and family warmth stand inches near today, while early worries drift far behind.`,
      }, lang);
    }

    if (themeKey === "cinema") {
      if (bucket === "mirror") {
        return pick6({
          kn: `ನಮಸ್ಕಾರ ${devoteeName}, ನಾನು ನಿಮ್ಮ ಕುಂಡಲಿಯ ${n(heroPlanetHouse)}ನೇ ಮನೆಯ (${heroPlanetRashi}) ಪ್ರಬಲ ನಾಯಕ '${heroPlanetName}' ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ! ನನ್ನ ಪಕ್ಕದಲ್ಲೇ ನನ್ನ ಸಹೋದ್ಯೋಗಿ '${nearestColleagueName}' (${n(nearestColleagueHouse)}ನೇ ಮನೆ) ನಿಂತಿರುವುದನ್ನು ನಾನು ನೋಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಬದುಕನ್ನು ಸಿನಿಮಾದಂತೆ ನೋಡಿದರೆ ಈಗ 'ಮಧ್ಯಂತರದ ಹಿಂದಿನ ನಿಗೂಢ ದೃಶ್ಯ' ನಡೆಯುತ್ತಿದೆ — ನಾವೆಲ್ಲರೂ ಒಳಗೊಳಗೇ ನಿಮ್ಮ ಮುಂದಿನ ದೊಡ್ಡ ಗೆಲುವಿಗೆ ವೇದಿಕೆ ಸಜ್ಜುಗೊಳಿಸುತ್ತಿದ್ದೇವೆ.`,
          mr: `नमस्कार ${devoteeName}, मी तुमच्या पत्रिकेतील ${n(heroPlanetHouse)}व्या भावाचा (${heroPlanetRashi}) सर्वात बलवान नायक '${heroPlanetName}' बोलत आहे! माझ्या अगदी शेजारी माझा सहकारी '${nearestColleagueName}' (${n(nearestColleagueHouse)}वे स्थान) कसा काम करतोय ते पहा — तुमच्या आयुष्याचा हा सिनेमा आता मोठ्या वळणावर आला आहे आणि आम्ही पडद्यामागे तुमच्या विजयाची स्क्रिप्ट पक्की करत आहोत.`,
          hi: `नमस्ते ${devoteeName}, मैं आपकी कुंडली के ${n(heroPlanetHouse)}वें भाव (${heroPlanetRashi}) का सबसे सशक्त नायक '${heroPlanetName}' बोल रहा हूं! मेरे ठीक बगल में मेरा सहकर्मी '${nearestColleagueName}' (${n(nearestColleagueHouse)}वां भाव) खड़ा है। यदि आपका जीवन एक फिल्म हो, तो अभी इंटरवल से ठीक पहले का रोमांचक दृश्य चल रहा है—भीतर ही भीतर आपकी अगली बड़ी जीत की पटकथा तैयार हो चुकी है।`,
          te: `నమస్కారం ${devoteeName}, నేను మీ జాతకంలోని ${n(heroPlanetHouse)}వ స్థాన (${heroPlanetRashi}) ప్రధాన నాయకుడు '${heroPlanetName}' మాట్లాడుతున్నాను! నా పక్కనే ఉన్న నా సహోద్యోగి '${nearestColleagueName}' (${n(nearestColleagueHouse)}వ స్థానం) ఎలా పనిచేస్తున్నాడో చూడండి. మీ జీవితాన్ని సినిమాగా చూస్తే ఇప్పుడు ఇంటర్వెల్ ముందు కీలక సన్నివేశం నడుస్తోంది—మీ తర్వాతి విజయం కోసం తెరవెనుక మేమంతా సిద్ధమవుతున్నాము.`,
          ta: `வணக்கம் ${devoteeName}, நான் உங்கள் ஜாதகத்தில் ${n(heroPlanetHouse)}-ம் வீட்டில் (${heroPlanetRashi}) அமர்ந்திருக்கும் வலிமையான நாயகன் '${heroPlanetName}' பேசுகிறேன்! என் அருகிலிருக்கும் சகா '${nearestColleagueName}' (${n(nearestColleagueHouse)}-ம் வீடு) எவ்வாறு செயல்படுகிறார் பாருங்கள். உங்கள் வாழ்க்கை ஒரு திரைப்படமென்றால், இப்போது இடைவேளைக்கு முந்தைய முக்கிய காட்சி ஓடுகிறது.`,
          en: `Listen directly to me, ${devoteeName}: I am ${heroPlanetName}, seated powerfully in House ${heroPlanetHouse} (${heroPlanetRashi}) as the strongest hero of your Kundali! Standing nearest beside me in House ${nearestColleagueHouse} (${nearestColleagueRashi}) is my colleague ${nearestColleagueName}. Watch how we are directing this pre-interval film scene behind the curtain to swing the next act toward you.`,
        }, lang);
      }
      if (bucket === "pivot" || bucket === "transit") {
        return pick6({
          kn: `ನಾನು ನಿಮ್ಮ ಜಾತಕದ ನಾಯಕ '${heroPlanetName}' ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ ${devoteeName}! ನನ್ನ ಸಹೋದ್ಯೋಗಿ '${nearestColleagueName}' (${n(nearestColleagueHouse)}ನೇ ಮನೆ) ಹಾಗೂ ${shaniTransitRashi}ನ ಶನಿ ಒಟ್ಟಾಗಿ ಆಡುತ್ತಿರುವ ರೋಚಕ ದೃಶ್ಯವಿದು: ಹೀರೋ ೯೯% ಹಂತದಲ್ಲಿ ನಿಂತಾಗ ಬಾಗಿಲು ತಡೆದದ್ದು ನಿಮಗೆ ಶಿಕ್ಷೆಯಲ್ಲ — ಆ ಬಾಗಿಲ ಹಿಂದಿದ್ದ ದೊಡ್ಡ ನಷ್ಟದಿಂದ ನಿಮ್ಮನ್ನು ತಪ್ಪಿಸಲು ನಾವು ಹಾಕಿದ ಸಿನಿಮಾ ಬ್ರೇಕ್ ಅಷ್ಟೇ!`,
          mr: `मी तुमच्या कुंडलीचा नायक '${heroPlanetName}' बोलत आहे ${devoteeName}! माझा सहकारी '${nearestColleagueName}' आणि ${shaniTransitRashi} मधील शनी एकत्र काम करून तुमचे रक्षण करत आहेत — ९९% वर आलेले काम कधी अडले असेल तर ते अपयश नव्हते, तर मोठ्या धोक्यातून तुम्हाला वाचवणारे आमचे रक्षण होते!`,
          hi: `मैं आपकी कुंडली का नायक '${heroPlanetName}' बोल रहा हूं ${devoteeName}! मेरे साथ खड़ा सहकर्मी '${nearestColleagueName}' और ${shaniTransitRashi} के शनि मिलकर आपकी रक्षा कर रहे हैं—जब काम ९९% पर अटका तो वह हार नहीं थी, बल्कि आगे छिपे बड़े नुकसान से बचाने के लिए हमने लगाया हुआ सुरक्षा-ब्रेक था!`,
          te: `నేను మీ జాతక నాయకుడు '${heroPlanetName}' మాట్లాడుతున్నాను ${devoteeName}! నా పక్కనున్న '${nearestColleagueName}' మరియు ${shaniTransitRashi} శని కలిసి మిమ్మల్ని కాపాడుతున్నారు—99% వద్ద ఆగిన ప్రతి అడ్డంకి ఓటమి కాదు, పెద్ద ప్రమాదం నుండి తప్పించిన మా రక్షణ కవచం!`,
          ta: `நான் உங்கள் ஜாதக நாயகன் '${heroPlanetName}' பேசுகிறேன் ${devoteeName}! என் அருகிலுள்ள '${nearestColleagueName}' மற்றும் ${shaniTransitRashi} சனி இணைந்து உங்களைப் பாதுகாக்கிறார்கள்—99%-ல் நின்ற தாமதம் தோல்வியல்ல, பெரிய இழப்பிலிருந்து உங்களைக் காத்த கவசம்!`,
          en: `I am your chart hero ${heroPlanetName} speaking directly to you, ${devoteeName}! Together with my close colleague ${nearestColleagueName} in House ${nearestColleagueHouse} and Saturn tracking ${shaniTransitRashi}, whenever a deal froze at 99% on your screen, it was our deliberate safety brake saving you from an unseen trap ahead.`,
        }, lang);
      }
      return pick6({
        kn: `ನಾನು ನಿಮ್ಮ ಕುಂಡಲಿಯ ಶಕ್ತಿಶಾಲಿ ನಾಯಕ '${heroPlanetName}' (${heroPlanetRashi}) ಹೇಳುತ್ತಿದ್ದೇನೆ ${devoteeName}: ನನ್ನ ಸಹೋದ್ಯೋಗಿ '${nearestColleagueName}' ಹಾಗೂ '${yogiPlanetName}' ಈಗ ಒಂದೇ ದಿಕ್ಕಿನಲ್ಲಿ ತಿರುಗುತ್ತಿದ್ದಾರೆ! ಸಿನಿಮಾದ ಕ್ಲೈಮ್ಯಾಕ್ಸ್ ಹತ್ತಿರ ಬರುತ್ತಿದೆ — '${n(nowYear + 2)}–${n(nowYear + 4)}'ರ ಗೆಲುವಿನ ದೃಶ್ಯದಲ್ಲಿ ಪ್ರೇಕ್ಷಕರೇ ಎದ್ದು ಚಪ್ಪಾಳೆ ತಟ್ಟಲಿದ್ದಾರೆ.`,
        mr: `मी तुमच्या कुंडलीचा मुख्य नायक '${heroPlanetName}' (${heroPlanetRashi}) सांगत आहे ${devoteeName}: माझा सहकारी '${nearestColleagueName}' व '${yogiPlanetName}' आता एकाच दिशेने तुमची साथ देत आहेत! '${n(nowYear + 2)}–${n(nowYear + 4)}' चा विजयी टप्पा तुमच्या आयुष्याची सर्वोत्तम कामगिरी ठरणार आहे.`,
        hi: `मैं आपकी कुंडली का प्रमुख नायक '${heroPlanetName}' (${heroPlanetRashi}) कह रहा हूं ${devoteeName}: मेरा सहकर्मी '${nearestColleagueName}' और '${yogiPlanetName}' अब एक ही दिशा में आपके पक्ष में आ गए हैं! '${n(nowYear + 2)}–${n(nowYear + 4)}' का स्वर्णिम चरण आपके जीवन का सबसे शानदार अध्याय बनेगा।`,
        te: `నేను మీ జాతక ప్రధాన నాయకుడు '${heroPlanetName}' (${heroPlanetRashi}) చెబుతున్నాను ${devoteeName}: నా పక్కనున్న '${nearestColleagueName}' మరియు '${yogiPlanetName}' ఇప్పుడు మీకు అనుకూలంగా కదులుతున్నారు! '${n(nowYear + 2)}–${n(nowYear + 4)}' మధ్య రాబోయే స్వర్ణయుగం మిమ్మల్ని ఉన్నత స్థానంలో నిలబెడుతుంది.`,
        ta: `நான் உங்கள் ஜாதக நாயகன் '${heroPlanetName}' (${heroPlanetRashi}) சொல்கிறேன் ${devoteeName}: என் சகா '${nearestColleagueName}' மற்றும் '${yogiPlanetName}' இப்போது உங்கள் வெற்றிக்காக ஒருங்கிணைந்துள்ளனர்! '${n(nowYear + 2)}–${n(nowYear + 4)}' காலம் உங்களுக்கு மாபெரும் திருப்பமாகும்.`,
        en: `I am your chart champion ${heroPlanetName} in ${heroPlanetRashi}, speaking with my colleague ${nearestColleagueName} right beside me: Act 2 is accelerating fast, ${devoteeName}, and every scene ahead locks into the rising peak of ${nowYear + 2}–${nowYear + 4}!`,
      }, lang);
    }

    if (themeKey === "nakshatra") {
      return pick6({
        kn: `ನಾನು ನಿನ್ನ ಜನ್ಮ ನಕ್ಷತ್ರ '${nakshatraName}' (${n(nakshatraPada)}ನೇ ಪಾದ) ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ ${devoteeName}! ಹುಟ್ಟಿದ ${weekdayName}ದಿಂದ ನಿನ್ನ ಹೃದಯದ ಬಡಿತವನ್ನು ಕೇಳುತ್ತಿದ್ದೇನೆ; ನನ್ನ ಮಿತ್ರ '${yogiPlanetName}' ಹಾಗೂ ನಾಯಕ '${heroPlanetName}' ನಿನ್ನ ಬೆನ್ನಿಗೆ ನಿಂತಿರುವಾಗ ಸುತ್ತಲಿನವರ ಅನ್ಯಾಯದ ಮಾತುಗಳಿಗೆ ನೀನೇಕೆ ಹೆದರಬೇಕು?`,
        mr: `मी तुझे जन्म नक्षत्र '${nakshatraName}' (चरण ${n(nakshatraPada)}) बोलत आहे ${devoteeName}! जन्माच्या ${weekdayName} पासून तुझ्यासोबत राहून मी तुझा मूक संघर्ष पाहिला आहे; तुझा मित्र '${yogiPlanetName}' आणि नायक '${heroPlanetName}' तुझ्या पाठीशी ठाम आहेत.`,
        hi: `मैं तुम्हारा जन्म नक्षत्र '${nakshatraName}' (पाद ${n(nakshatraPada)}) बोल रहा हूं ${devoteeName}! जन्म के ${weekdayName} से आज तक मैंने तुम्हारे भीतर के हर तूफ़ान को देखा है; तुम्हारा रक्षक '${yogiPlanetName}' और नायक '${heroPlanetName}' तुम्हारे साथ हैं।`,
        te: `నేను నీ జన్మ నక్షత్రం '${nakshatraName}' (పాదం ${n(nakshatraPada)}) మాట్లాడుతున్నాను ${devoteeName}! నీ పుట్టిన ${weekdayName} నుండి అన్నీ గమనిస్తున్నాను; నీ మిత్రుడు '${yogiPlanetName}' మరియు నాయకుడు '${heroPlanetName}' నీ వెన్నంటే ఉన్నారు.`,
        ta: `நான் உன் ஜென்ம நட்சத்திரம் '${nakshatraName}' (பாதம் ${n(nakshatraPada)}) பேசுகிறேன் ${devoteeName}! பிறந்த ${weekdayName} முதல் உன்னுடன் இருக்கிறேன்; உன் நண்பன் '${yogiPlanetName}' மற்றும் நாயகன் '${heroPlanetName}' எப்போதும் துணை நிற்கிறார்கள்.`,
        en: `Listen closely, ${devoteeName}: I am your birth star ${nakshatraName} (Pada ${nakshatraPada}), watching beside you since ${weekdayName}! Joined by your ally ${yogiPlanetName} and chart hero ${heroPlanetName}, I guard the silent conviction others keep underestimating.`,
      }, lang);
    }

    if (themeKey === "yoga_karana") {
      return pick6({
        kn: `ನಾನು ನಿನ್ನ ಜನ್ಮ ಯೋಗ '${yogaName}' ಹಾಗೂ ಕರಣ '${karanaName}' — ನಿನ್ನ ಕುಂಡಲಿಯ ಅಸಲಿ ನಾಯಕ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ! ನನ್ನ ಪಕ್ಕದಲ್ಲೇ ಸಹೋದ್ಯೋಗಿಗಳಾದ '${heroPlanetName}' ಮತ್ತು '${nearestColleagueName}' ಹೇಗೆ ವರ್ತಿಸುತ್ತಿದ್ದಾರೆ ಗೊತ್ತೇ? ನಿನ್ನ ಕೆಲಸದ ವೇಗವನ್ನು ನಿಯಂತ್ರಿಸಿ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಬೀಗ ತೆರೆಯುವ ಕೀಲಿ ನನ್ನ ಕೈಯಲ್ಲಿದೆ!`,
        mr: `मी तुझा जन्म योग '${yogaName}' आणि करण '${karanaName}' — तुझ्या कुंडलीचा खरा नायक बोलत आहे! माझे सहकारी '${heroPlanetName}' आणि '${nearestColleagueName}' पत्रिकेत कशी हालचाल करत आहेत ते पहा — योग्य क्षणी यशाचे कुलूप उघडणारी गुप्त किल्ली माझ्याकडेच आहे!`,
        hi: `मैं तुम्हारा जन्म योग '${yogaName}' और करण '${karanaName}' — तुम्हारी कुंडली का असली नायक बोल रहा हूं! मेरे साथ काम करने वाले सहकर्मी '${heroPlanetName}' और '${nearestColleagueName}' तुम्हारे भाग्य की घड़ी चला रहे हैं—जब समय पक्का होता है, बंद ताले मैं ही खोलता हूं!`,
        te: `నేను నీ జన్మ యోగం '${yogaName}' మరియు కరణం '${karanaName}' — నీ కుండలిలోని శక్తివంతమైన నాయకుడిని! నా సహోద్యోగులైన '${heroPlanetName}' మరియు '${nearestColleagueName}' ఇప్పుడు నీ కోసం ఎలా పనిచేస్తున్నారో చూడు—సరైన సమయానికి తలుపు తెరిచే తాళం నా చేతిలోనే ఉంది!`,
        ta: `நான் உன் பிறப்பு யோகம் '${yogaName}' மற்றும் கரணம் '${karanaName}' — உன் ஜாதகத்தின் வலிமையான நாயகன் பேசுகிறேன்! என் சகாக்களான '${heroPlanetName}' மற்றும் '${nearestColleagueName}' உனக்காக எப்படிச் செயல்படுகிறார்கள் பார்—சரியான நேரத்தில் பூட்டைத் திறப்பவன் நானே!`,
        en: `I am ${yogaName} Yoga fused with ${karanaName} Karana—the hidden commander of your Kundali, ${devoteeName}! Watch how my colleagues ${heroPlanetName} (House ${heroPlanetHouse}) and ${nearestColleagueName} (House ${nearestColleagueHouse}) behave together to turn your timing valve right now.`,
      }, lang);
    }

    if (themeKey === "near_far") {
      return pick6({
        kn: `${devoteeName}, ನಾನು ನಿನ್ನ ಜನ್ಮ ಲಗ್ನ '${lagnaRashiName}' (ಅಧಿಪತಿ '${lagnaLordName}') — ನಿನ್ನ ಜೀವನ ರಥದ ಸಾರಥಿ! ನನ್ನ ಸಮೀಪದಲ್ಲೇ ನಿಂತಿರುವ '${nearestColleagueName}' ಹಾಗೂ '${yogiPlanetName}' ಹತ್ತಿರದ ಅವಕಾಶವನ್ನು ತರುತ್ತಿದ್ದರೆ, ಹಳೆಯ ಚಿಂತೆಗಳು ನನ್ನ ದೃಷ್ಟಿಯಿಂದ ಬಹುದೂರ ಸರಿದಿವೆ.`,
        mr: `${devoteeName}, मी तुझे जन्म लग्न '${lagnaRashiName}' (स्वामी '${lagnaLordName}') — तुझ्या आयुष्याचा सारथी बोलत आहे! माझ्या जवळ उभे असलेले '${nearestColleagueName}' आणि '${yogiPlanetName}' संधी जवळ आणत आहेत, तर जुना तणाव दूर सरला आहे.`,
        hi: `${devoteeName}, मैं तुम्हारा जन्म लग्न '${lagnaRashiName}' (स्वामी '${lagnaLordName}') — तुम्हारे जीवन रथ का सारथी बोल रहा हूं! मेरे करीब स्थित '${nearestColleagueName}' और '${yogiPlanetName}' नया अवसर पास ला रहे हैं, जबकि पुरानी उलझनें दूर हो रही हैं।`,
        te: `${devoteeName}, నేను నీ జన్మ లగ్నం '${lagnaRashiName}' (అధిపతి '${lagnaLordName}') మాట్లాడుతున్నాను! నా దగ్గర ఉన్న '${nearestColleagueName}' మరియు '${yogiPlanetName}' విజయాన్ని నీ చేతికందేలా చేస్తుండగా, పాత కష్టాలు దూరంగా వెళ్ళిపోతున్నాయి.`,
        ta: `${devoteeName}, நான் உன் ஜென்ம லக்னம் '${lagnaRashiName}' (அதிபதி '${lagnaLordName}') பேசுகிறேன்! என் அருகிலுள்ள '${nearestColleagueName}' மற்றும் '${yogiPlanetName}' வெற்றியை அருகே கொண்டு வர, பழைய கவலைகள் தூர விலகுகின்றன.`,
        en: `I am your ascendant chariot—${lagnaRashiName}, steered by ${lagnaLordName}—speaking right to you, ${devoteeName}! With ${nearestColleagueName} nearby and ${yogiPlanetName} lighting the lane ahead, your next milestone sits closer than fear claims.`,
      }, lang);
    }

    // parable / Yogi voice
    return pick6({
      kn: `ನಾನು ನಿನ್ನ ಯೋಗಿ '${yogiPlanetName}' ಒಂದು ಸಣ್ಣ ನಿದರ್ಶನದೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ ${devoteeName}: ಶಿಲ್ಪಿಯು ಕಲ್ಲಿಗೆ ೯೯ ಏಟು ಹೊಡೆದರೂ ಅದು ಒಡೆಯುವುದಿಲ್ಲ — ಆದರೆ ೧೦೦ನೇ ಮೃದು ಏಟಿಗೆ ಮಹಾ ಮೂರ್ತಿ ಹೊರಬರುತ್ತದೆ! ನನ್ನ ಮಿತ್ರ '${heroPlanetName}' ಹಾಗೂ '${nearestColleagueName}' ಆ ೧೦೦ನೇ ಏಟಿನ ಘಳಿಗೆಯನ್ನೇ ನಿಮಗಾಗಿ ತಂದಿದ್ದಾರೆ.`,
      mr: `मी तुझा योगी '${yogiPlanetName}' एक छान गोष्ट सांगतो ${devoteeName}: शिल्पकार ९९ घाव घालतो तेव्हा दगड हलत नाही — पण १०० व्या एका स्पर्शाने मूर्ती साकार होते! माझे सहकारी '${heroPlanetName}' आणि '${nearestColleagueName}' तोच १०० वा सुवर्ण क्षण घेऊन येत आहेत.`,
      hi: `मैं तुम्हारा योगी '${yogiPlanetName}' एक सच्चे उदाहरण से बात शुरू करता हूं ${devoteeName}: मूर्तिकार ९९ बार पत्थर तराशता है पर वह मौन रहता है—और १००वें हल्के स्पर्श से अद्भुत मूर्ति प्रकट होती है! मेरे सहयोगी '${heroPlanetName}' और '${nearestColleagueName}' तुम्हारे लिए वही निर्णायक घड़ी लाए हैं।`,
      te: `నేను నీ యోగి '${yogiPlanetName}' ఒక చిన్న ఉదాహరణతో చెబుతున్నాను ${devoteeName}: శిల్పి 99 సార్లు కొట్టినప్పుడు ఏ మార్పూ కనిపించదు—కానీ 100వ దెబ్బకు అద్భుత శిల్పం బయటపడుతుంది! నా మిత్రుడు '${heroPlanetName}' మరియు '${nearestColleagueName}' ఆ 100వ విజయం కోసమే పనిచేస్తున్నారు.`,
      ta: `நான் உன் யோகி '${yogiPlanetName}' ஒரு அழகான உதாரணத்துடன் பேசுகிறேன் ${devoteeName}: சிற்பி 99 முறை அடிக்கும்போது சிலை தெரியாது—100-வது அடியில் அதிசயம் பிறக்கும்! என் நண்பர்கள் '${heroPlanetName}' மற்றும் '${nearestColleagueName}' அந்த 100-வது வெற்றியைத் தர உள்ளனர்.`,
      en: `I am your Yogi planet ${yogiPlanetName}, opening with a quiet story for you, ${devoteeName}: ninety-nine taps of the chisel barely crack rough stone, until the hundredth quiet strike unveils the statue inside! My colleagues ${heroPlanetName} and ${nearestColleagueName} stand right beside your hundredth strike.`,
    }, lang);
  };

  // Rich narrative extensions to bring every chapter paragraph to compelling 5–6 line depth (no remedies!)
  const extP1 = chNum === 23 ? "" : isChildOrInfant
    ? pick6({
        kn: `ದಿನನಿತ್ಯದ ಮನೆಯ ಸಣ್ಣ ಸನ್ನಿವೇಶಗಳಲ್ಲೇ ಮಗುವಿನ ನೈಜ ಸ್ವಭಾವ ಪ್ರಕಾಶಿಸುತ್ತದೆ — ನಗು, ಕುತೂಹಲ ಮತ್ತು ಪೋಷಕರ ಮೃದು ಮಾತುಗಳು ಇದರ ಆಂತರಿಕ ಶಕ್ತಿಯನ್ನು ದಿನೇ ದಿನೇ ಇಮ್ಮಡಿಗೊಳಿಸುತ್ತವೆ.`,
        mr: `घरातील रोजच्या छोट्या प्रसंगांतूनच बाळाची खरी क्षमता खुलते — आनंदी संवाद आणि सुरक्षित वातावरण यातून त्याचा आत्मविश्वास रोज वाढत जातो.`,
        hi: `घर के छोटे-छोटे दैनिक क्षणों में ही इस बच्चे की वास्तविक प्रतिभा निखरती है—प्रेमपूर्ण संवाद और खुला माहौल इसके आत्मबल को दोगुना करता है।`,
        te: `ఇంట్లోని రోజువారీ చిన్న ఆటపాటలు, నవ్వులలోనే ఈ చిన్నారి సహజ ప్రతిభ వెలుగు చూస్తుంది—తల్లిదండ్రుల ప్రశాంత మాటలు దీనికి అపారమైన ధైర్యాన్నిస్తాయి.`,
        ta: `வீட்டின் அன்றாடச் சிறிய நிகழ்வுகளிலேயே குழந்தையின் தனித்திறன் வெளிப்படும்—பெற்றோரின் அன்பான வார்த்தைகளும் நிதானமும் இதன் ஆற்றலைப் பலமடங்கு பெருக்கும்.`,
        en: `Notice how vividly this appears in tiny daily routines at home—gentle patience, warm encouragement, and unhurried play awaken this young spirit far faster than pressure ever could.`,
      }, lang)
    : themeKey === "near_far" || themeKey === "cinema"
    ? pick6({
        kn: `ನೀವು ದಿನನಿತ್ಯ ಎದುರಿಸುವ ಮಾತುಕತೆ, ಕೆಲಸದ ಜವಾಬ್ದಾರಿ ಮತ್ತು ಕುಟುಂಬದ ನಿರೀಕ್ಷೆಗಳ ನಡುವೆ ಈ ಗ್ರಹಗತಿ ಕನ್ನಡಿ ಹಿಡಿದಂತೆ ಸ್ಪಷ್ಟವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದೆ; ಎಲ್ಲಿ ಶಕ್ತಿ ಹರಿಯುತ್ತಿದೆ ಎಂಬುದನ್ನು ಗಮನಿಸಿದರೆ ಅರ್ಧ ಗೊಂದಲ ತಕ್ಷಣ ಕರಗುತ್ತದೆ.`,
        mr: `दररोजच्या कामातील निर्णय, संवाद आणि कौटुंबिक जबाबदाऱ्या यांत हाच पॅटर्न स्पष्टपणे जाणवतो; तुमची ऊर्जा नेमकी कुठे अडकली आहे हे एकदा लक्षात आले की निम्मा ताण लगेच नाहीसा होतो.`,
        hi: `दैनिक कामकाज, संबंधों और निर्णयों में यह प्रभाव आईने की तरह साफ़ झलकता है; जैसे ही आप समझते हैं कि आपकी ऊर्जा कहां जा रही है, आधी उलझन उसी क्षण शांत हो जाती है।`,
        te: `రోజువారీ పనులు, కుటుంబ చర్చలు మరియు నిర్ణయాలలో ఈ ప్రభావం అద్దంలా స్పష్టంగా కనిపిస్తుంది; మీ శక్తి ఎటువైపు ప్రవహిస్తోందో గుర్తించిన క్షణమే సగం గందరగోళం తగ్గిపోతుంది.`,
        ta: `அன்றாடப் பணிகள், குடும்ப உரையாடல்கள் மற்றும் முக்கிய முடிவுகளில் இந்த அமைப்பு கண்ணாடி போல் வெளிப்படுகிறது; உங்கள் ஆற்றல் எங்கே செல்கிறது எனப் பார்த்த நொடியில் பாதி குழப்பம் நீங்கும்.`,
        en: `Look at how vividly this plays out in ordinary weekly conversations, finances, and family responsibilities—once you recognize this exact rhythm on screen instead of taking delays personally, half the mental tension melts immediately.`,
      }, lang)
    : pick6({
        kn: `${nakshatraName} ಮತ್ತು '${yogaName}'ದ ಈ ವಿಶಿಷ್ಟ ಸಂಯೋಜನೆ ನಿಮ್ಮನ್ನು ಗಾಳಿಯಲ್ಲಿ ದೀಪದಂತೆ ಅಲ್ಲಾಡಲು ಬಿಡುವುದಿಲ್ಲ; ಮೇಲ್ನೋಟಕ್ಕೆ ಸಣ್ಣದಾಗಿ ಕಾಣುವ ನಿಮ್ಮ ಶಿಸ್ತು ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಯೇ ಒಳಗೆ ದೊಡ್ಡ ಬಲವನ್ನು ಕಟ್ಟುತ್ತಿದೆ.`,
        mr: `${nakshatraName} व '${yogaName}'ची ही खास जोड तुमच्यातील ठामपणा कधीही खचू देत नाही; वरवर साधी वाटणारी तुमची प्रामाणिकता आणि सातत्य आतमध्ये मोठी ताकद निर्माण करत आहे.`,
        hi: `${nakshatraName} और '${yogaName}' का यह विशेष संयोग आपके धैर्य को कभी बिखरने नहीं देता; बाहर से साधारण दिखने वाला आपका अनुशासन ही भीतर से भविष्य की बड़ी नींव गढ़ रहा है।`,
        te: `${nakshatraName} మరియు '${yogaName}' కలయిక మిమ్మల్ని ఒడిదుడుకులలోనూ నిలబెడుతుంది; బయటకు సాధారణంగా కనిపించే మీ క్రమశిక్షణ మరియు నిజాయితీ లోపల గొప్ప శక్తిని నిర్మిస్తున్నాయి.`,
        ta: `${nakshatraName} மற்றும் '${yogaName}' இணைப்பு உங்களை ஒருபோதும் தளரவிடாது; வெளியே எளிமையாகத் தெரியும் உங்கள் நேர்மையும் ஒழுக்கமும் உள்ளே அசைக்க முடியாத பலத்தைக் கட்டுகின்றன.`,
        en: `Backed quietly by your ${nakshatraName} spark and ${yogaName} timing engine, your steadiness holds even under silent pressure—everyday integrity is stacking compound trust behind scenes nobody else notices yet.`,
      }, lang);

  const extP2 = chNum === 23 ? "" : isChildOrInfant
    ? pick6({
        kn: `ಹತ್ತಿರದಲ್ಲಿರುವ ಸಂತೋಷವೇನೆಂದರೆ ಮಗುವಿನ ನೈಸರ್ಗಿಕ ಕಲಿಕಾ ಶಕ್ತಿ ಅತ್ಯಂತ ಪ್ರಬಲವಾಗಿದೆ; ತಂದೆ-ತಾಯಿ ಆತಂಕವನ್ನು ದೂರವಿಟ್ಟು ಪ್ರೋತ್ಸಾಹಿಸಿದಷ್ಟು ಭವಿಷ್ಯ ಇನ್ನೂ ಉಜ್ವಲವಾಗಿ ಬೆಳಗುತ್ತದೆ.`,
        mr: `जवळ असलेली सुंदर गोष्ट म्हणजे बाळाची ग्रहणशक्ती खूप तीक्ष्ण आहे; पालकांनी विनाकारण काळजी दूर ठेवून हसता संवाद वाढवला की प्रगती झपाट्याने होते.`,
        hi: `पास खड़ा सबसे बड़ा वरदान यह है कि इस बच्चे की सीखने की क्षमता अत्यंत प्रखर है; अभिभावक अनावश्यक चिंता दूर रखकर जितना प्रोत्साहन देंगे, उतना यह खिलेगा।`,
        te: `దగ్గరగా ఉన్న ఆనందం ఏమిటంటే ఈ చిన్నారి గ్రహణశక్తి చాలా చురుకుగా ఉంది; తల్లిదండ్రులు ఆందోళనను దూరంగా ఉంచి నవ్వుతూ ప్రోత్సహిస్తే అద్భుతంగా ఎదుగుతుంది.`,
        ta: `அருகிலுள்ள பெரிய நன்மை என்னவென்றால் குழந்தையின் கற்கும் திறன் மிகவும் கூர்மையானது; பெற்றோர் அச்சத்தைத் தவிர்த்து ஊக்கப்படுத்திய அளவுக்கு எதிர்காலம் ஒளிவீசும்.`,
        en: `Notice what stands wonderfully near: bright curiosity and emotional resilience come naturally to this child—the further parents push comparison away, the stronger this young talent shines.`,
      }, lang)
    : pick6({
        kn: `ಹತ್ತಿರ-ದೂರ ನೋಡಿ: ಹಳೆಯ ಗೊಂದಲ ಹಾಗೂ ತಪ್ಪು ನಿರೀಕ್ಷೆಗಳು ನಿಮ್ಮಿಂದ ದೂರ ಸರಿಯುತ್ತಿವೆ; ಅದೇ ಸಮಯದಲ್ಲಿ '${lagnaRashiName}' ಲಗ್ನಕ್ಕೆ ತಕ್ಕ ಸ್ಪಷ್ಟ ಗುರಿ ಮತ್ತು ಹೊಸ ಬಾಗಿಲುಗಳು ಹತ್ತಿರ ಬರುತ್ತಿವೆ.`,
        mr: `जवळ आणि दूर नीट पहा: जुना गोंधळ व चुकीच्या अपेक्षा हळूहळू मागे सरत आहेत; त्याच वेळी तुमच्या '${lagnaRashiName}' स्वभावाशी जुळणारे नवे मार्ग व विश्वासू लोक हाताशी येत आहेत.`,
        hi: `पास और दूर का स्पष्ट संकेत देखें: पुराने भ्रम और अनावश्यक बोझ अब आपसे दूर खिसक रहे हैं, जबकि आपके '${lagnaRashiName}' स्वभाव के अनुकूल ठोस अवसर कदम-दर-कदम पास आ रहे हैं।`,
        te: `దగ్గర-దూరం గమనించండి: పాత గందరగోళం మరియు అనవసర అపోహలు మీ నుండి దూరంగా వెళ్ళిపోతున్నాయి; అదే సమయంలో మీ '${lagnaRashiName}' బలానికి సరిపోయే కొత్త దారులు దగ్గరవుతున్నాయి.`,
        ta: `அருகும் தொலைவும் தெளிவாகத் தெரிகிறது: பழைய குழப்பமும் தேவையற்ற எதிர்பார்ப்புகளும் விலகிச் செல்கின்றன; அதே நேரத்தில் உங்கள் '${lagnaRashiName}' வலிமைக்கு ஏற்ற புதிய வாய்ப்புகள் அருகே வருகின்றன.`,
        en: `Look at that clean distance contrast right inside your chart: outdated confusion and fair-weather friction are steadily receding far behind, while clearer timing and authentic doors aligned with your ${lagnaRashiName} core pull noticeably near.`,
      }, lang);

  const extP3 = chNum === 23 ? "" : isChildOrInfant
    ? pick6({
        kn: `ಪ್ರತಿದಿನ ಮಗುವಿನ ಜೊತೆ ನಗುತ್ತಾ ಕಳೆಯುವ ಶಾಂತ ಸಮಯವೇ ಇದರ ಬಾಲ್ಯದ ಸವಿ ನೆನಪು ಮತ್ತು ಮುಂದಿನ ದೊಡ್ಡ ಯಶಸ್ಸಿಗೆ ಭದ್ರ ಬುನಾದಿ.`,
        mr: `दररोज बाळासोबत खेळलेला व हसलेला शांत वेळच त्याचे बालपण समृद्ध करतो आणि भविष्याचा पाया मजबूत करतो.`,
        hi: `प्रतिदिन बच्चे के साथ बिताया गया शांत, हंसमुख समय ही इसके सुखद बचपन और उज्ज्वल भविष्य की सबसे पक्की नींव है।`,
        te: `ప్రతిరోజూ చిన్నారితో ఆనందంగా గడిపే ప్రశాంత సమయమే దాని ఉజ్వల భవిష్యత్తుకు గట్టి పునాది.`,
        ta: `தினமும் குழந்தையுடன் மகிழ்ச்சியாகச் செலவிடும் அமைதியான நேரமே அதன் இனிய எதிர்காலத்திற்கு வலுவான அடித்தளமாகும்.`,
        en: `Warm unhurried moments spent listening and laughing together each day form the true anchor behind every future milestone.`,
      }, lang)
    : pick6({
        kn: `ನೀವು ಇದನ್ನು ಸಂಕೀರ್ಣ ಗಣಿತವೆಂದು ತಲೆಕೆಡಿಸಿಕೊಳ್ಳಬೇಕಿಲ್ಲ — ಸರಿಯಾದ ವಾರ '${localizedYogiDay}', ಸ್ಪಷ್ಟ ಮಾತು ಹಾಗೂ ತಾಳ್ಮೆಯ ಹೆಜ್ಜೆಗಳೇ ಕಥೆಯನ್ನು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಿಸುತ್ತವೆ.`,
        mr: `यासाठी मोठ्या तांत्रिक गणितात अडकण्याची गरज नाही — योग्य दिवस '${localizedYogiDay}', स्पष्ट संवाद आणि शांत सातत्य हीच तुमची कथा यशस्वी करतात.`,
        hi: `इसमें किसी कठिन नियम की उलझन नहीं है—आपका शुभ दिन '${localizedYogiDay}', साफ़ निर्णय और धैर्यपूर्ण निरंतरता ही पूरी कहानी को आपके पक्ष में मोड़ देते हैं।`,
        te: `దీని కోసం కష్టమైన గణనల గురించి ఆలోచించాల్సిన పనిలేదు—మీ శుభ రోజు '${localizedYogiDay}', స్పష్టమైన మాట మరియు ప్రశాంతమైన అడుగులే కథను మీకు అనుకూలంగా మలుపుతిప్పుతాయి.`,
        ta: `இதற்குக் கடினமான விதிகள் எதுவும் தேவையில்லை—உங்கள் சுப நாளான '${localizedYogiDay}', தெளிவான பேச்சு மற்றும் நிதானமான முயற்சியே முழுக் கதையையும் உங்கள் பக்கம் திருப்பும்.`,
        en: `Zero heavy formulas required here: move cleanly on your aligned day (${localizedYogiDay}), keep promises crisp, and watch practical clarity turn the whole storyline unmistakably in your favor.`,
      }, lang);

  // Per-chapter visual summary: what is NEAR, what is FAR, focusHouse/focusYearOffset, glanceVerdict!
  const lblNear = pick6({ kn: "ಹತ್ತಿರ (ನಿಮ್ಮ ಕಡೆ ಬರುತ್ತಿದೆ)", mr: "जवळ (हाताशी येत आहे)", hi: "निकट (तेज़ी से पास आ रहा)", te: "దగ్గర (మీ వైపు వస్తున్నది)", ta: "அருகில் (உங்களிடம் வருவது)", en: "Near You Now" }, lang);
  const lblFar = pick6({ kn: "ದೂರ (ಹಿಂದೆ ಸರಿಯುತ್ತಿದೆ)", mr: "दूर (मागे सरत आहे)", hi: "दूर (पीछे छूट रहा है)", te: "దూరం (తొలగిపోతున్నది)", ta: "தொலைவில் (விலகிச் செல்வது)", en: "Fading Behind" }, lang);

  const chapterVisualLookup: Record<number, { near: string; far: string; verdict: string; house?: number; yr?: number }> = {
    1: {
      near: pick6({ kn: `ಇಂದಿನ ತಾರಾಬಲ (${n(taraScore)}%) & ಸ್ಪಷ್ಟತೆ`, mr: `आजची ताराबळ ऊर्जा (${n(taraScore)}%)`, hi: `आज का ताराबल (${n(taraScore)}%) एवं सूझ`, te: `నేటి తారాబలం (${n(taraScore)}%)`, ta: `இன்றைய தாராபலன் (${n(taraScore)}%)`, en: `Live Clarity (${taraScore}% • ${taraWord})` }, lang),
      far: pick6({ kn: "ಹಳೆಯ ಗೊಂದಲ ಮತ್ತು ಮೌನ ಚಿಂತೆ", mr: "जुनी अस्वस्थता व गोंधळ", hi: "पुरानी दुविधा और चिंता", te: "పాత ఆందోళన & గందరగోళం", ta: "பழைய குழப்பம் & தயக்கம்", en: "Silent Confusion & Old Worry" }, lang),
      verdict: `${taraWord} • ${n(taraScore)}%`,
    },
    2: {
      near: pick6({ kn: `${yogiPlanetName} ಗುಪ್ತ ಬೆಂಬಲ`, mr: `${yogiPlanetName} चे गुप्त पाठबळ`, hi: `${yogiPlanetName} का गुप्त संरक्षण`, te: `${yogiPlanetName} రక్షణ బలం`, ta: `${yogiPlanetName} ரகசிய ஆதரவு`, en: `${yogiPlanetName} Silent Support` }, lang),
      far: pick6({ kn: "ನಕಲಿ ನಿರೀಕ್ಷೆಗಳ ಭಾರ", mr: "इतरांच्या अवास्तव अपेक्षा", hi: "अनुचित अपेक्षाओं का बोझ", te: "ఇతరుల భారమైన అంచనాలు", ta: "தேவையற்ற எதிர்பார்ப்பு சுமை", en: "One-Sided Expectations" }, lang),
      verdict: `${yogiPlanetName}`,
    },
    3: {
      near: pick6({ kn: "ಶುದ್ಧ ಅನುಭವ & ಹೊಸ ಆರಂಭ", mr: "परिपक्वता व नवे वळण", hi: "अर्जित विवेक एवं नया आरंभ", te: "అనుభవం & కొత్త దారి", ta: "பக்குவம் & புதிய தொடக்கம்", en: "Seasoned Wisdom & Fresh Reset" }, lang),
      far: pick6({ kn: "ಕಳೆದ ೨೪ ತಿಂಗಳ ಪರೀಕ್ಷೆ", mr: "मागील २४ महिन्यांचा त्रास", hi: "बीते २४ महीनों की परीक्षा", te: "గత 24 నెలల కఠిన పరీక్ష", ta: "கடந்த 24 மாத சோதனை", en: "24-Month Storm Filter" }, lang),
      verdict: pick6({ kn: "೨೪ ತಿಂಗಳ ಪಾಠ ಮುಕ್ತಾಯ", mr: "कसोटी टप्पा मागे", hi: "कठिन चरण समाप्त", te: "పరీక్ష ముగింపు", ta: "சோதனை முடிவு", en: "24-Month Pivot Done" }, lang),
    },
    4: {
      near: pick6({ kn: `${n(maandiHouse)}ನೇ ಭಾವದ ೧% ಕೀಲಿ`, mr: `${n(maandiHouse)}व्या स्थानाची १% किल्ली`, hi: `${n(maandiHouse)}वें भाव की अंतिम १% कुंजी`, te: `${n(maandiHouse)}వ స్థాన 1% తాళం`, ta: `${n(maandiHouse)}-ம் இட 1% திறவுகோல்`, en: `House ${maandiHouse} Final 1% Key` }, lang),
      far: pick6({ kn: "೯೯% ಹಂತದ ಆಕಸ್ಮಿಕ ತಡೆ", mr: "९९% वरील शेवटचा अडथळा", hi: "९९% पर अंतिम मिनट का अवरोध", te: "99% వద్ద ఆగే ఆలస్యం", ta: "99%-ல் வரும் தாமதம்", en: "99% Finish-Line Freeze" }, lang),
      verdict: `${n(maandiHouse)} • ೯೯% -> ೧೦೦%`,
      house: maandiHouse,
    },
    5: {
      near: pick6({ kn: `${dominantElement} ನೈಸರ್ಗಿಕ ಶಕ್ತಿ`, mr: `${dominantElement} मूळ ताकद`, hi: `${dominantElement} मुख्य शक्ति`, te: `${dominantElement} బలం`, ta: `${dominantElement} இயல்பு`, en: `${dominantElement} Core Edge` }, lang),
      far: pick6({ kn: "ಎಲ್ಲವನ್ನೂ ಒಬ್ಬರೇ ಹೊರುವ ಒತ್ತಡ", mr: "एकाकी ताण व घाई", hi: "अकेले सब संभालने का दबाव", te: "ఒంటరిగా మోసే ఒత్తిడి", ta: "தனியாகச் சுமக்கும் அழுத்தம்", en: "Silent Self-Overload" }, lang),
      verdict: `${dominantElement}`,
    },
    6: {
      near: pick6({ kn: `${localizedYogiDay} • ${localizedYogiDirection}`, mr: `${localizedYogiDay} • ${localizedYogiDirection}`, hi: `${localizedYogiDay} • ${localizedYogiDirection}`, te: `${localizedYogiDay} • ${localizedYogiDirection}`, ta: `${localizedYogiDay} • ${localizedYogiDirection}`, en: `${localizedYogiDay} • ${localizedYogiDirection}` }, lang),
      far: pick6({ kn: `${avayogiPlanetName} ಅವಸರದ ತಪ್ಪು`, mr: `${avayogiPlanetName} घाईचा फटका`, hi: `${avayogiPlanetName} जल्दबाजी की भूल`, te: `${avayogiPlanetName} తొందరపాటు`, ta: `${avayogiPlanetName} அவசரத் தவறு`, en: `${avayogiPlanetName} Hasty Traps` }, lang),
      verdict: `${yogiPlanetName} ★`,
      house: peakHouseNum,
    },
    7: {
      near: pick6({ kn: `${currentBhuktiLord} ಅವಕಾಶ (${n(bhuktiEndDate)})`, mr: `${currentBhuktiLord} संधी (${n(bhuktiEndDate)})`, hi: `${currentBhuktiLord} अवसर (${n(bhuktiEndDate)})`, te: `${currentBhuktiLord} అవకాశం (${n(bhuktiEndDate)})`, ta: `${currentBhuktiLord} வாய்ப்பு (${n(bhuktiEndDate)})`, en: `${currentBhuktiLord} Window (${bhuktiEndDate})` }, lang),
      far: pick6({ kn: "ಹಳೆಯ ಅಸಂಬದ್ಧ ದಿನಚರಿ", mr: "जुन्या निष्क्रिय सवयी", hi: "पुरानी निष्क्रिय आदतें", te: "పాత నిరుపయోగ అలవాట్లు", ta: "பழைய செயலற்ற பழக்கங்கள்", en: "Outgrown Routine Loops" }, lang),
      verdict: `${currentMahadasha} • ${currentBhuktiLord}`,
    },
    8: {
      near: pick6({ kn: `೧೦ ವರ್ಷದ ಶಾಶ್ವತ ಅಡಿಪಾಯ`, mr: `१० वर्षांचा भक्कम पाया`, hi: `१० वर्षों की अटल नींव`, te: `10 ఏళ్ల గట్టి పునాది`, ta: `10 ஆண்டு உறுதியான அடித்தளம்`, en: `10-Year Solid Foundation` }, lang),
      far: pick6({ kn: "ಸ್ವಾರ್ಥ ಸಂಬಂಧ & ಸುಲಭ ದಾರಿ", mr: "तात्पुरते शॉर्टकट व दिखावा", hi: "अस्थायी सहारे और शॉर्टकट", te: "తాత్కాలిక షార్ట్‌కట్‌లు", ta: "போலி ஆதரவும் குறுக்கு வழியும்", en: "Flimsy Shortcuts & Fake Allies" }, lang),
      verdict: `${shaniTransitRashi}`,
      house: ctx.shaniHouseFromMoon,
    },
    9: {
      near: pick6({ kn: `${guruTransitRashi} ಗುರು ಬಲ & ಮಾರ್ಗದರ್ಶನ`, mr: `${guruTransitRashi} गुरु कृपा व संधी`, hi: `${guruTransitRashi} गुरु कृपा एवं मार्गदर्शन`, te: `${guruTransitRashi} గురు వరం & దారి`, ta: `${guruTransitRashi} குரு அருள் & வழிகாட்டல்`, en: `${guruTransitRashi} Mentor & Relief` }, lang),
      far: pick6({ kn: "ಸಣ್ಣ ಯೋಚನೆಯ ಪರಿಧಿ", mr: "संकुचित विचारसरणी", hi: "सीमित सोच का दायरा", te: "చిన్న ఆలోచనల హద్దులు", ta: "குறுகிய சிந்தனை எல்லை", en: "Narrow Self-Doubt" }, lang),
      verdict: `${guruTransitRashi}`,
      house: ctx.guruHouseFromMoon,
    },
    10: {
      near: pick6({ kn: `${moonRashiName} ವಾಸ್ತವ ಸ್ಪಷ್ಟತೆ`, mr: `${moonRashiName} स्पष्ट वास्तव`, hi: `${moonRashiName} स्पष्ट विवेक`, te: `${moonRashiName} వాస్తవ దృష్టి`, ta: `${moonRashiName} உண்மைத் தெளிவு`, en: `${moonRashiName} Grounded Clarity` }, lang),
      far: pick6({ kn: "ರಾಹು ಆತುರದ ಕಾಲ್ಪನಿಕ ಭಯ", mr: "राहु भ्रम व काल्पनिक भीती", hi: "राहु का काल्पनिक भय व लालच", te: "రాహు భ్రమ & అపోహలు", ta: "ராகு மாயையும் வீண் பயமும்", en: "Shadow Anxiety & Hype" }, lang),
      verdict: pick6({ kn: "ವಾಸ್ತವ ಜಯ", mr: "स्पष्ट दृष्टी", hi: "स्पष्ट दृष्टि", te: "స్పష్టత", ta: "தெளிவு", en: "Clear Lens" }, lang),
      house: ctx.rahuHouseFromMoon,
    },
    11: {
      near: pick6({ kn: `${detectedYogasSummary}`, mr: `${detectedYogasSummary}`, hi: `${detectedYogasSummary}`, te: `${detectedYogasSummary}`, ta: `${detectedYogasSummary}`, en: `${detectedYogasSummary}` }, lang),
      far: pick6({ kn: "ಮೌನ ಸಂಕೋಚ & ಹಿಂಜರಿಕೆ", mr: "बोलण्यातला संकोच व कमीपणा", hi: "संकोच और आत्म-संशय", te: "మొహమాటం & సంకోచం", ta: "தயக்கமும் மௌனமும்", en: "Muted Voice & Hesitation" }, lang),
      verdict: pick6({ kn: "ಸುಪ್ತ ರಾಜಯೋಗ", mr: "राजयोग जागृती", hi: "राजयोग जागृति", te: "రాజయోగ బలం", ta: "ராஜயோக ஆற்றல்", en: "Crown Gifts Awake" }, lang),
    },
    12: isChildOrInfant
      ? {
          near: pick6({ kn: `ಬಾಲ ಪ್ರತಿಭೆ & ${house6Info.lordName} ರಕ್ಷೆ`, mr: `तल्लख बुद्धी व सुरक्षा`, hi: `तीव्र जिज्ञासा व सुरक्षा`, te: `తెలివైన ఆసక్తి & రక్షణ`, ta: `அறிவு வளர்ச்சியும் பாதுகாப்பும்`, en: `Bright Curiosity & Shield` }, lang),
          far: pick6({ kn: "ಬೇರೆಯವರೊಡನೆ ಹೋಲಿಕೆಯ ಒತ್ತಡ", mr: "इतरांशी तुलनेचा ताण", hi: "तुलना का अनावश्यक दबाव", te: "ఇతరులతో పోలికల భారం", ta: "பிறருடன் ஒப்பிடும் அழுத்தம்", en: "Forced Pace Comparisons" }, lang),
          verdict: pick6({ kn: "ಬಾಲ ವಿಕಾಸ", mr: "बाल प्रतिभा", hi: "बाल प्रतिभा", te: "బాల ప్రతిభ", ta: "குழந்தை திறன்", en: "Early Genius" }, lang),
          house: 5,
        }
      : {
          near: pick6({ kn: `೧೦ನೇ ಮನೆ ನಾಯಕತ್ವ (${n(savByHouse[9])} ಅಂಕ)`, mr: `१०वे स्थान नेतृत्व (${n(savByHouse[9])} गुण)`, hi: `१०वां भाव नेतृत्व (${n(savByHouse[9])} अंक)`, te: `10వ స్థాన నాయకత్వం (${n(savByHouse[9])})`, ta: `10-ம் இட தலைமை (${n(savByHouse[9])})`, en: `House 10 Authority (${savByHouse[9]} SAV)` }, lang),
          far: pick6({ kn: "ಗುರುತು ಸಿಗದ ಹೆಚ್ಚುವರಿ ದುಡಿಮೆ", mr: "विनाश्रेय राबणे", hi: "अदृश्य परिश्रम में उलझाव", te: "గుర్తింపు లేని శ్రమ", ta: "அங்கீகாரமற்ற உழைப்பு", en: "Invisible Uncredited Grunt Work" }, lang),
          verdict: pick6({ kn: `ಮನೆ ೧೦ • ${n(savByHouse[9])} ಅಂಕ`, mr: `स्थान १० • ${n(savByHouse[9])} गुण`, hi: `भाव १० • ${n(savByHouse[9])} अंक`, te: `స్థానం 10 • ${n(savByHouse[9])}`, ta: `வீடு 10 • ${n(savByHouse[9])}`, en: `House 10 • ${savByHouse[9]}` }, lang),
          house: 10,
        },
    13: isChildOrInfant
      ? {
          near: pick6({ kn: "ಕುಟುಂಬದ ಲಕ್ಷ್ಮಿ & ಭವಿಷ್ಯ ನಿಧಿ", mr: "कौटुंबिक समृद्धी व बचत", hi: "पारिवारिक समृद्धि व बचत", te: "కుటుంబ శుభ ఐశ్వర్యం", ta: "குடும்ப வளம் & சேமிப்பு", en: "Family Cushion & Security" }, lang),
          far: pick6({ kn: "ಅನಗತ್ಯ ಆಡಂಬರದ ವೆಚ್ಚ", mr: "अनावश्यक दिखावा", hi: "अनावश्यक दिखावे का व्यय", te: "ఆడంబర వృథా ఖర్చులు", ta: "தேவையற்ற ஆடம்பர செலவு", en: "Unplanned Clutter Spending" }, lang),
          verdict: pick6({ kn: "ವಂಶ ಲಕ್ಷ್ಮಿ", mr: "समृद्धी योग", hi: "समृद्धि योग", te: "లక్ష్మీ యోగం", ta: "வளமை யோகம்", en: "Family Fortune" }, lang),
          house: 2,
        }
      : {
          near: pick6({ kn: `೧೧ನೇ ಮನೆ ಆದಾಯ (${n(savByHouse[10])} ಅಂಕ)`, mr: `११वे स्थान आवक (${n(savByHouse[10])} गुण)`, hi: `११वां भाव लाभ (${n(savByHouse[10])} अंक)`, te: `11వ స్థాన లాభం (${n(savByHouse[10])})`, ta: `11-ம் இட வருமானம் (${n(savByHouse[10])})`, en: `House 11 Inflow (${savByHouse[10]} SAV)` }, lang),
          far: pick6({ kn: "ಮೊಹಮ್ಮದ/ದಾಕ್ಷಿಣ್ಯದ ಸೋರಿಕೆ", mr: "भावनेपोटी होणारी गळती", hi: "संकोच में अनावश्यक खर्च", te: "మొహమాటపు వృథా ఖర్చు", ta: "உணர்ச்சிவசப்பட்ட செலவுகள்", en: "Politeness Money Leaks" }, lang),
          verdict: pick6({ kn: `ಮನೆ ೧೧ • ${n(savByHouse[10])} ಅಂಕ`, mr: `स्थान ११ • ${n(savByHouse[10])} गुण`, hi: `भाव ११ • ${n(savByHouse[10])} अंक`, te: `స్థానం 11 • ${n(savByHouse[10])}`, ta: `வீடு 11 • ${n(savByHouse[10])}`, en: `House 11 • ${savByHouse[10]}` }, lang),
          house: 11,
        },
    14: isChildOrInfant
      ? {
          near: pick6({ kn: "ಪೋಷಕರ ಪ್ರೀತಿ & ಮನೆಯ ನಗು", mr: "आई-वडिलांची ऊब व प्रेम", hi: "माता-पिता का स्नेह व शांति", te: "తల్లిదండ్రుల ప్రేమ & ఆనందం", ta: "பெற்றோர் அன்பும் மகிழ்ச்சியும்", en: "Parent Warmth & Home Joy" }, lang),
          far: pick6({ kn: "ಕಠಿಣ ಗದರಿಕೆ & ಭಯ", mr: "कठोर रागावणे व तणाव", hi: "कठोर डांट व भय", te: "కోపం & కఠిన వాతావరణం", ta: "கடுமையான பேச்சும் அச்சமும்", en: "Harsh Tension & Fear" }, lang),
          verdict: pick6({ kn: "ಪ್ರೇಮ ರಕ್ಷೆ", mr: "प्रेमळ सहवास", hi: "पारिवारिक स्नेह", te: "కుటుంబ ప్రేమ", ta: "குடும்ப அன்பு", en: "Home Harmony" }, lang),
          house: 4,
        }
      : {
          near: pick6({ kn: `೭ನೇ ಮನೆ ಸೌಹಾರ್ದ (${n(savByHouse[6])} ಅಂಕ)`, mr: `७वे स्थान सलोखा (${n(savByHouse[6])} गुण)`, hi: `७वां भाव सामंजस्य (${n(savByHouse[6])} अंक)`, te: `7వ స్థాన సామరస్యం (${n(savByHouse[6])})`, ta: `7-ம் இட ஒற்றுமை (${n(savByHouse[6])})`, en: `House 7 Bond (${savByHouse[6]} SAV)` }, lang),
          far: pick6({ kn: "ಮಾತನಾಡದ ಮೌನ ಗೋಡೆ", mr: "न बोलल्यामुळे आलेला अबोला", hi: "अनकहे मौन की दूरी", te: "మాట్లాడని మౌన దూరం", ta: "பேசாத மௌன இடைவெளி", en: "Silent Pride & Distance" }, lang),
          verdict: pick6({ kn: `ಮನೆ ೭ • ${n(savByHouse[6])} ಅಂಕ`, mr: `स्थान ७ • ${n(savByHouse[6])} गुण`, hi: `भाव ७ • ${n(savByHouse[6])} अंक`, te: `స్థానం 7 • ${n(savByHouse[6])}`, ta: `வீடு 7 • ${n(savByHouse[6])}`, en: `House 7 • ${savByHouse[6]}` }, lang),
          house: 7,
        },
    15: {
      near: pick6({ kn: `೫ನೇ ಮನೆ ಬುದ್ಧಿ & ಕಲೆ (${n(savByHouse[4])} ಅಂಕ)`, mr: `५वे स्थान कल्पकता (${n(savByHouse[4])} गुण)`, hi: `५वां भाव सृजन (${n(savByHouse[4])} अंक)`, te: `5వ స్థాన ప్రతిభ (${n(savByHouse[4])})`, ta: `5-ம் இட படைப்பு (${n(savByHouse[4])})`, en: `House 5 Spark (${savByHouse[4]} SAV)` }, lang),
      far: pick6({ kn: "ಕೇವಲ ಯಾಂತ್ರಿಕ ದಿನಚರಿ", mr: "कोरडी यांत्रिक दिनचर्या", hi: "नीरस यांत्रिक दिनचर्या", te: "ఆనందం లేని యాంత్రిక శ్రమ", ta: "மகிழ்ச்சியற்ற இயந்திர வாழ்க்கை", en: "Joyless Mechanical Grind" }, lang),
      verdict: pick6({ kn: `ಮನೆ ೫ • ${n(savByHouse[4])} ಅಂಕ`, mr: `स्थान ५ • ${n(savByHouse[4])} गुण`, hi: `भाव ५ • ${n(savByHouse[4])} अंक`, te: `స్థానం 5 • ${n(savByHouse[4])}`, ta: `வீடு 5 • ${n(savByHouse[4])}`, en: `House 5 • ${savByHouse[4]}` }, lang),
      house: 5,
    },
    16: {
      near: pick6({ kn: `${house6Info.lordName} ದೇಹಬಲ & ಚೇತರಿಕೆ`, mr: `${house6Info.lordName} रोगप्रतिकार व तंदुरुस्ती`, hi: `${house6Info.lordName} प्राण ऊर्जा व स्फूर्ति`, te: `${house6Info.lordName} జీవశక్తి & ఆరోగ్యం`, ta: `${house6Info.lordName} உடல் ஆரோக்கியம்`, en: `${house6Info.lordName} Core Stamina` }, lang),
      far: pick6({ kn: "ತಲೆಯ ಒತ್ತಡ & ನಿದ್ದೆಯ ಕೊರತೆ", mr: "विचारांचा ताण व कमी झोप", hi: "अति-चिंता एवं नींद की कमी", te: "ఆలోచనల ఒత్తిడి & నిద్రలేమి", ta: "மன அழுத்தம் & தூக்கமின்மை", en: "Mental Heat & Poor Rest" }, lang),
      verdict: pick6({ kn: `ಮನೆ ೬ • ${n(savByHouse[5])} ಅಂಕ`, mr: `स्थान ६ • ${n(savByHouse[5])} गुण`, hi: `भाव ६ • ${n(savByHouse[5])} अंक`, te: `స్థానం 6 • ${n(savByHouse[5])}`, ta: `வீடு 6 • ${n(savByHouse[5])}`, en: `Health Shield` }, lang),
      house: 6,
    },
    17: {
      near: pick6({ kn: "೯೦ ದಿನಗಳಲ್ಲೇ ಹೊಸ ಚಾಲನೆ", mr: "९० दिवसांत नवी गती", hi: "९० दिनों में ठोस गति", te: "90 రోజుల్లో కొత్త కదలిక", ta: "90 நாட்களில் புதிய வேகம்", en: "90-Day Ignition Spark" }, lang),
      far: pick6({ kn: "ನಿಂತ ನೀರಿನಂತೆ ಇದ್ದ ವಿಳಂಬ", mr: "अडकलेली जुनी कामे", hi: "लंबित कार्यों का ठहराव", te: "ఆగిపోయిన పాత స్థితి", ta: "தேங்கி நின்ற தாமதம்", en: "Stalled Waiting Loops" }, lang),
      verdict: pick6({ kn: "೯೦ ದಿನದ ವೇಗ", mr: "९० दिवस वेग", hi: "९० दिन की गति", te: "90 రోజుల వేగం", ta: "90 நாள் வேகம்", en: "Next 90 Days" }, lang),
      yr: 0,
    },
    18: {
      near: pick6({ kn: `${bhriguBinduRashiName} ಅದೃಷ್ಟ ತಿರುವು`, mr: `${bhriguBinduRashiName} सुवर्ण बिंदू`, hi: `${bhriguBinduRashiName} भृगु बिंदु उदय`, te: `${bhriguBinduRashiName} అదృష్ట బిందువు`, ta: `${bhriguBinduRashiName} பிருகு பிந்து`, en: `${bhriguBinduRashiName} Destiny Point` }, lang),
      far: pick6({ kn: "ಸಣ್ಣ ಯೋಚನೆಯ ಸಂಶಯ", mr: "आत्मविश्वासाची कमतरता", hi: "छोटी झिझक और संदेह", te: "అనవసర సందేహం", ta: "சந்தேகமும் தயக்கமும்", en: "Self-Doubt & Waiting" }, lang),
      verdict: `${bhriguBinduRashiName}`,
    },
    19: {
      near: pick6({ kn: `${n(nowYear)} ಶಿಸ್ತು & ನಿಚ್ಚಳ ಅಡಿಪಾಯ`, mr: `${n(nowYear)} पायाभरणी व सुसूत्रता`, hi: `${n(nowYear)} स्पष्ट आधार व नियंत्रण`, te: `${n(nowYear)} గట్టి పునాది`, ta: `${n(nowYear)} சீரான அடித்தளம்`, en: `${nowYear} Reset & Control` }, lang),
      far: pick6({ kn: "ಹಳೆಯ ಸಮಯ ವ್ಯರ್ಥ ಮಾಡುವ ಹೊರೆ", mr: "अनावश्यक जुने ओझे", hi: "समय बर्बाद करने वाले बोझ", te: "సమయం వృథా చేసే భారాలు", ta: "தேவையற்ற பழைய சுமைகள்", en: "Time-Draining Obligations" }, lang),
      verdict: `${n(nowYear)} (${n(1)})`,
      yr: 0,
    },
    20: {
      near: pick6({ kn: `${n(nowYear + 1)} ಹೊಸ ವೇದಿಕೆ & ಕೀರ್ತಿ`, mr: `${n(nowYear + 1)} नवी झेप व मान`, hi: `${n(nowYear + 1)} बड़ा मंच व पहचान`, te: `${n(nowYear + 1)} కొత్త హోదా & కీర్తి`, ta: `${n(nowYear + 1)} புதிய மேடை & புகழ்`, en: `${nowYear + 1} Spotlight Surge` }, lang),
      far: pick6({ kn: "ಚಿಕ್ಕ ಗುರಿಯ ಮಿತಿ", mr: "लहान ध्येयांची मर्यादा", hi: "सीमित दायरे की झिझक", te: "చిన్న లక్ష్యాల హద్దులు", ta: "சிறிய எல்லைத் தயக்கம்", en: "Playing Too Small" }, lang),
      verdict: `${n(nowYear + 1)} (${n(2)})`,
      yr: 1,
    },
    21: {
      near: pick6({ kn: `${n(nowYear + 2)}–${n(nowYear + 3)} ಆಸ್ತಿ & ಕುಟುಂಬ ಸುಖ`, mr: `${n(nowYear + 2)}–${n(nowYear + 3)} मालमत्ता व सुख`, hi: `${n(nowYear + 2)}–${n(nowYear + 3)} संपत्ति व उत्सव`, te: `${n(nowYear + 2)}–${n(nowYear + 3)} ఆస్తి & వేడుక`, ta: `${n(nowYear + 2)}–${n(nowYear + 3)} சொத்து & மகிழ்ச்சி`, en: `${nowYear + 2}–${nowYear + 3} Tangible Crest` }, lang),
      far: pick6({ kn: "ಆರ್ಥಿಕ ಜವಾಬ್ದಾರಿಯ ಆತಂಕ", mr: "मोठ्या खर्चाची काळजी", hi: "आर्थिक अस्थिरता का तनाव", te: "ఆర్థిక భారం & చింత", ta: "பொருளாதாரக் கவலை", en: "Funding Anxiety" }, lang),
      verdict: `${n(nowYear + 2)}–${n(nowYear + 3)}`,
      yr: 2,
    },
    22: {
      near: pick6({ kn: `${n(nowYear + 4)} ಸ್ವಾತಂತ್ರ್ಯ & ನೆಮ್ಮದಿ`, mr: `${n(nowYear + 4)} शांत व खंबीर स्थान`, hi: `${n(nowYear + 4)} स्थायी स्वतंत्रता`, te: `${n(nowYear + 4)} శాశ్వత ప్రశాంతత`, ta: `${n(nowYear + 4)} நிரந்தர நிம்மதி`, en: `${nowYear + 4} Lasting Freedom` }, lang),
      far: pick6({ kn: "ದೈನಂದಿನ ಹೋರಾಟದ ದಣಿವು", mr: "रोजची धावपळ व थकवा", hi: "दैनिक संघर्ष की थकान", te: "రోజువారీ పరుగుల అలసట", ta: "தினசரிப் போராட்டச் சோர்வு", en: "Daily Crisis Scramble" }, lang),
      verdict: `${n(nowYear + 4)} (${n(5)})`,
      yr: 4,
    },
    23: {
      near: pick6({ kn: `${n(doshaProfiles.length)} ನಿಖರ ಪರಿಹಾರಗಳು`, mr: `${n(doshaProfiles.length)} अचूक उपाय`, hi: `${n(doshaProfiles.length)} सटीक समाधान`, te: `${n(doshaProfiles.length)} ఖచ్చిత పరిహారాలు`, ta: `${n(doshaProfiles.length)} துல்லிய தீர்வுகள்`, en: `${doshaProfiles.length} Targeted Solutions` }, lang),
      far: pick6({ kn: "ಗೊಂದಲಮಯ ನೂರು ಪೂಜೆಗಳು", mr: "भीती व अनावश्यक खर्च", hi: "भय व अनगिनत कर्मकांड", te: "వందల కొద్దీ గందరగోళం", ta: "குழப்பமான சடங்குகள்", en: "Blanket Ritual Confusion" }, lang),
      verdict: pick6({ kn: `${n(doshaProfiles.length)} ಸಕ್ರಿಯ ಅಂಶಗಳು`, mr: `${n(doshaProfiles.length)} सक्रिय मुद्दे`, hi: `${n(doshaProfiles.length)} सक्रिय बिंदु`, te: `${n(doshaProfiles.length)} ముఖ్యాంశాలు`, ta: `${n(doshaProfiles.length)} முக்கிய அம்சங்கள்`, en: `${doshaProfiles.length} Active Items` }, lang),
    },
    24: {
      near: pick6({ kn: `${localizedYogiDay} • ೫ ನಿಮಿಷ ನಿಯಮ`, mr: `${localizedYogiDay} • ५ मिनिटे नियम`, hi: `${localizedYogiDay} • ५-मिनट सूत्र`, te: `${localizedYogiDay} • 5 నిమిషాల సూత్రం`, ta: `${localizedYogiDay} • 5 நிமிட நெறி`, en: `${localizedYogiDay} • 5-Min Rhythm` }, lang),
      far: pick6({ kn: "ಪಾಲಿಸಲಾಗದ ಕಠಿಣ ನಿಯಮಗಳು", mr: "क्लिष्ट नियमांचे ओझे", hi: "कठिन नियमों का बोझ", te: "కష్టమైన నియమాల భారం", ta: "சிக்கலான விதிமுறைகள்", en: "Complicated Exhaustion" }, lang),
      verdict: `${localizedYogiDay}`,
    },
    25: {
      near: pick6({ kn: `${n(peakHouseNum)}ನೇ ಭಾವ + ಗೋಕರ್ಣ ಆಶೀರ್ವಾದ`, mr: `गोकर्ण आशीर्वाद व ${n(nowYear + 2)}–${n(nowYear + 4)}`, hi: `गोकर्ण आशीर्वाद व ${n(peakHouseNum)}वां बल`, te: `గోకర్ణ ఆశీస్సు & ${n(peakHouseNum)}వ బలం`, ta: `கோகர்ண ஆசி & பொற்காலம்`, en: `Peak House ${peakHouseNum} + Gokarna Grace` }, lang),
      far: pick6({ kn: "ಅಧ್ಯಾಯ ೧ರ ಹಳೆಯ ಭಯ", mr: "पहिल्या अध्यायाची चिंता", hi: "अध्याय १ की पुरानी चिंता", te: "మొదటి అధ్యాయపు చింత", ta: "முதல் அத்தியாயக் கவலை", en: "Chapter 1 Doubts Cleared" }, lang),
      verdict: pick6({ kn: "ಸಂಪೂರ್ಣ ಶುಭಂ", mr: "शुभं भवतु", hi: "शुभं भवतु", te: "శుభం భవతు", ta: "சுபம் பவத்து", en: "Shubham Bhavatu" }, lang),
      house: peakHouseNum,
    },
  };

  const entry = chapterVisualLookup[chNum] || chapterVisualLookup[1];

  return {
    storyHook: cleanRegional(rawHook(), lang),
    extP1: cleanRegional(extP1, lang),
    extP2: cleanRegional(extP2, lang),
    extP3: cleanRegional(extP3, lang),
    visualSummary: {
      themeKey,
      themeBadge: cleanRegional(themeBadge, lang),
      nearLabel: cleanRegional(lblNear, lang),
      nearValue: cleanRegional(entry.near, lang),
      farLabel: cleanRegional(lblFar, lang),
      farValue: cleanRegional(entry.far, lang),
      focusHouse: entry.house,
      focusYearOffset: entry.yr,
      glanceVerdict: cleanRegional(entry.verdict, lang),
    },
  };
}

// ============================================================================
// DYNAMIC 25-CHAPTER STORYTELLING ENGINE (PLOT TWISTS, NO REMEDY SPAM)
// ============================================================================

export function buildDynamicStoryChapters(
  ctx: StoryEngineInput,
  doshaProfiles: ActiveDoshaProfile[]
): GeneratedStoryChapter[] {
  const {
    targetLang: lang,
    devoteeName,
    ageCategory,
    maritalStatus,
    lagnaRashiIdx,
    lagnaRashiName,
    moonRashiName,
    nakshatraIdx,
    nakshatraName,
    nakshatraPada,
    weekdayName,
    pakshaName,
    tithiName,
    janmaHora,
    livePrashnaHora,
    currentMahadasha,
    currentBhuktiLord,
    bhuktiEndDate,
    isDashaSandhi,
    yogiPlanetName,
    avayogiPlanetName,
    localizedYogiColor,
    localizedYogiDirection,
    localizedYogiDay,
    localizedYogiDeity,
    bhriguBinduRashiName,
    maandiHouse,
    maandiDomainAffected,
    primaryElem,
    dominantElement,
    savTable,
    shaniTransitRashi,
    shaniHouseFromMoon,
    guruTransitRashi,
    guruHouseFromMoon,
    rahuHouseFromMoon,
    detectedYogasSummary,
    house10Info,
    house2Info,
    house11Info,
    house7Info,
    house5Info,
    house6Info,
    extendedPrecision,
    nowYear,
  } = ctx;

  const n = (v: number | string) => digits(v, lang);
  const isChildOrInfant = ageCategory === "infant" || ageCategory === "early_child" || ageCategory === "child";
  const isMinor = isChildOrInfant || ageCategory === "teen";
  const isSenior = ageCategory === "senior";
  const isUnmarried = !isMinor && String(maritalStatus || "").toLowerCase() === "unmarried";
  const gana = getNakshatraGana(nakshatraIdx);
  const modality = getLagnaModality(lagnaRashiIdx);

  const taraScore = extendedPrecision.liveTarabala.score;
  const taraWord = extendedPrecision.taraLabelLocalized;
  const savByHouse = Array.from({ length: 12 }, (_, idx) => savTable[(lagnaRashiIdx + idx) % 12] ?? 28);
  const peakHouseNum = savByHouse.reduce((bestIdx, val, idx, arr) => (val > arr[bestIdx] ? idx : bestIdx), 0) + 1;

  // Dynamic Gana & Modality plot descriptors for per-person divergence
  const modalityStyle =
    modality === "movable"
      ? pick6({ kn: "ವೇಗವಾಗಿ ಹೆಜ್ಜೆ ಹಾಕುವ ಚಲನಶೀಲ ಸ್ವಭಾವ", mr: "जलद निर्णय घेणारा गतिमान स्वभाव", hi: "त्वरित निर्णय लेने वाला गतिशील स्वभाव", te: "వేగంగా అడుగులు వేసే చలనశీల స్వభావం", ta: "வேகமாக செயல்படும் சர குணம்", en: "fast-moving initiator instinct" }, lang)
      : modality === "fixed"
      ? pick6({ kn: "ಒಮ್ಮೆ ನಿರ್ಧರಿಸಿದರೆ ಬದಲಾಗದ ದೃಢ ಸ್ವಭಾವ", mr: "एकदा ठरवले की मागे न हटणारा खंबीर स्वभाव", hi: "एक बार ठान लेने पर न हिलने वाला अटल स्वभाव", te: "ఒకసారి నిర్ణయిస్తే మారని స్థిర స్వభావం", ta: "உறுதியுடன் நிலைத்து நிற்கும் ஸ்திர குணம்", en: "unshakeable builder temperament" }, lang)
      : pick6({ kn: "ಎರಡು ಕಡೆ ಯೋಚಿಸಿ ಚಾಣಾಕ್ಷತನದಿಂದ ಬದಲಾಗುವ ಬುದ್ಧಿ", mr: "दोन्ही बाजूंनी विचार करून जुळवून घेणारी बुद्धी", hi: "हर पहलू को तौलकर तालमेल बिठाने वाली चतुराई", te: "రెండు కోణాల్లో ఆలోచించే చతురత", ta: "இரு பக்கமும் ஆராய்ந்து சூழலுக்கேற்ப மாறும் திறன்", en: "adaptive strategist mind" }, lang);

  const ganaHook =
    gana === "deva"
      ? pick6({ kn: "ಇತರರ ನೋವನ್ನು ನಿಮ್ಮದೇ ಎಂದು ಭಾವಿಸಿ ಸ್ಪಂದಿಸುವ ಮೃದು ಹೃದಯ", mr: "इतरांचे दुःख स्वतःचे मानणारे संवेदनशील मन", hi: "दूसरों की पीड़ा को अपना मान लेने वाला कोमल हृदय", te: "ఇతరుల కష్టాన్ని తనదిగా భావించే మంచి మనసు", ta: "பிறர் துன்பத்தை தன் துன்பமாக உணரும் இளகிய மனம்", en: "your heart that absorbs others' pain as your own" }, lang)
      : gana === "manushya"
      ? pick6({ kn: "ಎಲ್ಲರನ್ನೂ ಸಮಾಧಾನಪಡಿಸುತ್ತಾ ಒಳಗೊಳಗೇ ಜವಾಬ್ದಾರಿ ಹೊರುವ ಪ್ರಬುದ್ಧತೆ", mr: "सर्वांना सांभाळत न बोलता जबाबदारी पेलण्याची ताकद", hi: "सबको संभालते हुए चुपचाप जिम्मेदारी निभाने की परिपक्वता", te: "అందరినీ నడిపిస్తూ మౌనంగా బాధ్యత మోసే పరిపక్వత", ta: "அனைவரையும் அரவணைத்து பொறுப்பு சுமக்கும் பக்குவம்", en: "how calmly you hold everyone together without asking for applause" }, lang)
      : pick6({ kn: "ಯಾರ ಅನ್ಯಾಯವನ್ನೂ ಮನಸ್ಸಿನಲ್ಲಿ ಸಹಿಸದ ಸ್ವಾಭಿಮಾನದ ಕಿಚ್ಚು", mr: "कोणाचाही अन्याय न सहन करणारा बाणेदार स्वाभिमान", hi: "किसी भी अन्याय या दिखावे को न सहने वाला स्वाभिमान", te: "అన్యాయాన్ని సహించని ఆత్మాభిమానం", ta: "அநீதியை ஒருபோதும் சகித்துக்கொள்ளாத சுயமரியாதை", en: "your razor-sharp intolerance for hypocrisy or disrespect" }, lang);

  // Clean story builder helper
  const sec1 = pick6({ kn: "ವಿಭಾಗ ೧: ರಹಸ್ಯ ತಿರುವು & ಆಂತರಿಕ ಕಥನ", mr: "विभाग १: अंतरंग ओळख व पहिले वळण", hi: "खंड १: अनकहा सच एवं पहला मोड़", te: "విభాగం 1: ఆంతరంగిక సత్యం & మలుపు", ta: "பிரிவு 1: மனக் கண்ணாடி & முதல் திருப்பம்", en: "Part 1: The Unspoken Mirror & Hidden Shift" }, lang);
  const sec2 = pick6({ kn: "ವಿಭಾಗ ೨: ಕಾಲಚಕ್ರದ ಆಟ & ಸುಪ್ತ ಬಲ", mr: "विभाग २: काळाची दिशा व सुप्त ताकद", hi: "खंड २: समय का चक्र एवं प्रसुप्त शक्ति", te: "విభాగం 2: కాలచక్ర గమనం & అంతర్గత బలం", ta: "பிரிவு 2: காலச் சுழற்சி & மறைந்திருக்கும் பலம்", en: "Part 2: The Hidden Forces Moving Your Story" }, lang);
  const sec3 = pick6({ kn: "ವಿಭಾಗ ೩: ಬದುಕಿನ ೫ ಮುಖ್ಯ ಅಧ್ಯಾಯಗಳು", mr: "विभाग ३: आयुष्याचे ५ महत्त्वाचे टप्पे", hi: "खंड ३: जीवन के ५ प्रमुख अध्याय", te: "విభాగం 3: జీవితంలోని 5 ప్రధాన అధ్యాయాలు", ta: "பிரிவு 3: வாழ்வின் 5 முக்கிய தூண்கள்", en: "Part 3: Five Real-World Chapters" }, lang);
  const sec4 = pick6({ kn: "ವಿಭಾಗ ೪: ಮುಂದಿನ ೫ ವರ್ಷಗಳ ರೋಚಕ ಪಯಣ", mr: "विभाग ४: पुढील ५ वर्षांचा थरारक प्रवास", hi: "खंड ४: आगामी ५ वर्षों की रोमांचक यात्रा", te: "విభాగం 4: రాబోయే 5 ఏళ్ల భవిష్యత్ ప్రయాణం", ta: "பிரிவு 4: அடுத்த 5 வருடப் பயணத் திருப்பம்", en: "Part 4: The 5-Year Story Horizon" }, lang);
  const sec5 = pick6({ kn: "ವಿಭಾಗ ೫: ಪ್ರಮುಖ ಸಾರಾಂಶ, ದೋಷ ಪರಿಹಾರ & ಅಂತಿಮ ತೀರ್ಪು", mr: "विभाग ५: महत्त्वाचा सारांश, दोष निवारण व अंतिम आशीर्वाद", hi: "खंड ५: विशेष निष्कर्ष, दोष-समाधान एवं महा आशीर्वाद", te: "విభాగం 5: తుది సారాంశం, దోష నివారణ & దివ్య ఆశీస్సు", ta: "பிரிவு 5: முக்கிய முடிவுகள், தோஷத் தீர்வு & ஆசீர்வாதம்", en: "Part 5: Final Remedies, Highlights & Grand Verdict" }, lang);

  const list: Array<{
    n: number;
    sec: number;
    secTitle: string;
    icon: string;
    visual: ChapterVisualType;
    title: Record<SixLang, string>;
    question: Record<SixLang, string>;
    p1: Record<SixLang, string>;
    p2: Record<SixLang, string>;
    p3: Record<SixLang, string>;
    reflection: Record<SixLang, string>;
    badge: Record<SixLang, string>;
    anchors: string[];
  }> = [
    // CHAPTER 1 — Live Moment Story + Plot Twist (NO Remedy)
    {
      n: 1, sec: 1, secTitle: sec1, icon: "👁️", visual: "energy-gauge",
      title: {
        kn: "ಪ್ರಶ್ನ ದೃಷ್ಟಿ & ಈ ಕ್ಷಣದ ಮನಸ್ಸಿನ ನಿಗೂಢ ತಿರುವು",
        mr: "प्रश्न दृष्टी व आत्ताच्या मनातील न उलगडलेले कोडे",
        hi: "प्रश्न दृष्टि एवं इस क्षण के अंतर्मन का छिपा मोड़",
        te: "ప్రశ్న దృష్టి & ఈ క్షణం మీ మనసులోని మలుపు",
        ta: "பிரஸ்ன திருஷ்டி & இந்த நொடியின் மனத் திருப்பம்",
        en: "Prashna Drishti & The Story Inside This Exact Hour",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನೀವು ಹೊರಗೆ ನಗುತ್ತಿದ್ದರೂ ಒಳಗೆ ಕುದಿಯುತ್ತಿರುವ ಆ ಒಂದು ಗುಪ್ತ ಪ್ರಶ್ನೆ ಯಾವುದು?`,
        mr: `प्रश्न: ${devoteeName}, बाहेरून शांत राहूनही मनाच्या कोपऱ्यात अस्वस्थ करणारी कोणती गोष्ट आहे?`,
        hi: `प्रश्न: ${devoteeName}, बाहर से सहज दिखने के बाद भी भीतर मन में कौन सा अनकहा प्रश्न घूम रहा है?`,
        te: `ప్రశ్న: ${devoteeName}, బయటకు ప్రశాంతంగా కనిపిస్తున్నా లోపల మిమ్మల్ని ఆలోచింపజేస్తున్న ఆ విషయం ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, வெளியே சிரித்தாலும் உள்ளுக்குள் ஓடிக்கொண்டிருக்கும் அந்த ரகசியக் கேள்வி என்ன?`,
        en: `Question: ${devoteeName}, what is the real tension running quietly behind your calm face today—and why did it show up right now?`,
      },
      p1: {
        kn: `ಈ ಪುಸ್ತಕವನ್ನು ನೀವು ಕೈಗೆತ್ತಿಕೊಂಡ ಕ್ಷಣದಲ್ಲಿ '${livePrashnaHora}' ಶಕ್ತಿ ಸಕ್ರಿಯವಾಗಿದೆ; ಹಾಗೂ ನಿಮ್ಮ ${weekdayName}ದ ಹುಟ್ಟು ಗುಣ ಮತ್ತು ${lagnaRashiName} ಲಗ್ನದ '${modalityStyle}' ಒಟ್ಟಾಗಿ ನಿಮ್ಮ ಕಥೆಯನ್ನು ತೆರೆಯುತ್ತಿವೆ. ನೀವು ಏನನ್ನೂ ಸುಮ್ಮನೆ ಬಿಡುವವರಲ್ಲ — ಈಗಲೂ ಒಂದು ಅರ್ಧಕ್ಕೆ ನಿಂತ ಕೆಲಸ, ಹಣಕಾಸಿನ ಲೆಕ್ಕ, ಅಥವಾ ಪ್ರೀತಿಪಾತ್ರರ ಮೌನ ನಿಮ್ಮ ನಿದ್ದೆಯನ್ನು ಸ್ವಲ್ಪಮಟ್ಟಿಗೆ ಕದಡುತ್ತಿದೆ.`,
        mr: `आपण हे पान उघडले त्या क्षणी '${livePrashnaHora}' ऊर्जा सक्रिय आहे. तुमच्या ${weekdayName}च्या जन्मस्वभावाप्रमाणे व '${modalityStyle}' मुळे तुम्ही कोणतेही काम अर्धवट सोडणारे नाही — म्हणूनच एखादे रखडलेले काम किंवा कोणाचे तरी न बोललेले शब्द मनात घर करून आहेत.`,
        hi: `जिस पल आप यह पृष्ठ पढ़ रहे हैं, '${livePrashnaHora}' ऊर्जा सक्रिय है। आपके ${weekdayName} के जन्म-संस्कार और '${modalityStyle}' के कारण आप बातों को अधूरा नहीं छोड़ते—यही वजह है कि कोई अटका हुआ निर्णय या किसी अपने की चुप्पी भीतर चुभ रही है।`,
        te: `మీరు ఈ పుట తెరిచిన వేళ '${livePrashnaHora}' ప్రభావం ఉంది. మీ ${weekdayName} నాటి స్వభావం మరియు '${modalityStyle}' కారణంగా ఏ పనినైనా మధ్యలో వదలరు—అందుకే ఆగిపోయిన ఒక ముఖ్య విషయం మిమ్మల్ని ఇంకా ఆలోచింపజేస్తోంది.`,
        ta: `நீங்கள் இதைப் படிக்கும் நேரத்தில் '${livePrashnaHora}' ஆற்றல் ஓடுகிறது. உங்கள் ${weekdayName} குணமும் '${modalityStyle}' இயல்பும் எதையும் பாதியில் விடாது—அதனால்தான் முற்றுப்பெறாத ஒரு விஷயம் மனதின் ஓரத்தில் உறுத்திக்கொண்டிருக்கிறது.`,
        en: `Notice how uncanny the timing is: as you open this page under ${livePrashnaHora} influence, your ${weekdayName} spirit and ${modalityStyle} tell a clear story. You appear composed on the outside, yet one unfinished commitment or someone's unexpected silence has been replaying in your mind all week.`,
      },
      p2: {
        kn: `ಇಲ್ಲಿಯೇ ಕಥೆಯ ದೊಡ್ಡ ತಿರುವು ಇದೆ: ನೀವು ಅಂದುಕೊಂಡಂತೆ ಇದು ಸೋಲಿನ ಸೂಚನೆಯಲ್ಲ! ಇಂದಿನ '${taraWord}' (${n(taraScore)}%) ಸ್ಥಿತಿಯು ಹಳೆಯ ಗೊಂದಲಗಳನ್ನು ತೊಳೆಯುವ ಒಂದು ಮೌನ ಪರದೆ. ಯಾರನ್ನು ನೀವು ಕೈತಪ್ಪಿತು ಎಂದು ಭಾವಿಸಿದ್ದೀರೋ, ಆ ಪರಿಸ್ಥಿತಿಯೇ ಮುಂದಿನ ಕೆಲವು ವಾರಗಳಲ್ಲಿ ನಿಮ್ಮ ನಿಜವಾದ ಬೆಲೆಯನ್ನು ತೋರಿಸುವ ಹಂತಕ್ಕೆ ತಿರುಗಲಿದೆ.`,
        mr: `इथेच कथेचे खरे वळण आहे: तुम्ही ज्याला माघार समजता आहात, ती खरं तर पुढच्या उडीची तयारी आहे! आजचा '${taraWord}' (${n(taraScore)}%) टप्पा जुनी धूळ साफ करत आहे — ज्या गोष्टी हातातून गेल्या असे वाटत होते, त्याच पुढच्या काही आठवड्यांत नव्या रूपात तुमच्यासमोर येतील.`,
        hi: `यहीं कहानी का सबसे बड़ा मोड़ है: जिसे आप रुकावट समझ रहे हैं, वह वास्तव में अगले चरण से पहले की सफ़ाई है। आज का '${taraWord}' (${n(taraScore)}%) चरण दिखाता है कि जो बात हाथ से निकलती दिखी, वही कुछ ही सप्ताह में आपके पक्ष में मुड़ने वाली है।`,
        te: `ఇక్కడే అసలైన మలుపు ఉంది: మీరు వెనుకడుగు అనుకున్నదే నిజానికి తదుపరి ఎత్తుకు పునాది! నేటి '${taraWord}' (${n(taraScore)}%) స్థితి పాత గందరగోళాన్ని తొలగిస్తోంది—చేజారిపోయిందనుకున్న ఒక అంశం త్వరలోనే మీకు అనుకూలంగా మారుతుంది.`,
        ta: `இங்கேதான் கதையின் பெரிய திருப்பம்: நீங்கள் தோல்வி என நினைத்தது உண்மையில் அடுத்த பாய்ச்சலுக்கான அமைதி! இன்றைய '${taraWord}' (${n(taraScore)}%) நிலை பழைய குழப்பத்தைக் கரைக்கிறது—நழுவியது என நினைத்த ஒன்று விரைவில் உங்கள் பக்கம் திரும்பும்.`,
        en: `Here is the plot twist almost nobody spots: this pause is not rejection—it is filtration. Today's alignment (${taraScore}% on ${taraWord}) marks the closing act of old confusion; the very delay bothering you right now is clearing space so the next move lands on your terms.`,
      },
      p3: {
        kn: `ಈ ಕ್ಷಣದ ನಿಮ್ಮ ಜಾಣ ಹೆಜ್ಜೆ: ಹಿಂದೆ ನಡೆದ ಮಾತುಗಳನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಪುನಃ ಓಡಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ನಿಮ್ಮ ${moonRashiName} ಮನಸ್ಸಿನ ತೀಕ್ಷ್ಣ ಗ್ರಹಿಕೆ ಈ ವಾರ ನಿಮಗೆ ಸರಿಯಾದ ಸುಳಿವು ಕೊಡುತ್ತದೆ — ಆತುರದ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡದೆ ಕೇವಲ ೭ ದಿನ ಶಾಂತವಾಗಿ ಗಮನಿಸಿ, ಸತ್ಯ ತಾನಾಗಿಯೇ ಬಯಲಾಗುತ್ತದೆ.`,
        mr: `आत्ताचे शहाणपणाचे पाऊल: भूतकाळातील वादांचा विचार थांबवा. तुमच्या ${moonRashiName} मनाची अंतर्ज्ञानी जाणीव या आठवड्यात तुम्हाला अचूक इशारा देईल — फक्त ७ दिवस शांत राहून निरीक्षण करा, चित्र आपोआप स्पष्ट होईल.`,
        hi: `इस पल का सही कदम: बीते प्रसंगों को मन में दोहराना बंद करें। आपकी ${moonRashiName} अंतर्दृष्टि इस सप्ताह आपको स्पष्ट संकेत देगी—बिना जल्दबाजी किए अगले ७ दिन शांत भाव से देखें, सत्य स्वयं सामने आ जाएगा।`,
        te: `ఈ సమయంలో మీ తెలివైన అడుగు: గతాన్ని మళ్ళీ మళ్ళీ తలచుకోవడం ఆపండి. మీ ${moonRashiName} అంతర్దృష్టి ఈ వారం మీకు స్పష్టమైన సంకేతం ఇస్తుంది—వచ్చే 7 రోజులు తొందరపడకుండా గమనించండి, నిజం అదే బయటపడుతుంది.`,
        ta: `இப்போதைய புத்திசாலித்தனமான முடிவு: பழைய கசப்புகளை மனதில் ஓட்டுவதை நிறுத்துங்கள். உங்கள் ${moonRashiName} உள்ளுணர்வு இந்த வாரம் தெளிவான சமிக்ஞை தரும்—அடுத்த 7 நாட்கள் நிதானமாகக் கவனியுங்கள்.`,
        en: `Your sharp move right now: stop replaying old conversations to rewrite them. Trust your ${moonRashiName} intuition over noisy opinions for the next seven days—when you stay steady instead of reacting early, the truth reveals itself unforced.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಕಳೆದ ೧೦ ದಿನಗಳಲ್ಲಿ 'ಯಾಕೋ ಇಂದು ಮನಸ್ಸು ಸರಿ ಇಲ್ಲ' ಅನಿಸಿದಾಗ, ಆ ಕ್ಷಣವೇ ಎಲ್ಲಿಂದಲೋ ಒಂದು ಸಣ್ಣ ದಾರಿ ತೆರೆದ ಅನುಭವ ನಿಮಗಾಗಿತ್ತೇ? ಹೌದಾದರೆ ಅದೇ ನಿಮ್ಮ ಚಾರ್ಟ್ ತೋರುತ್ತಿರುವ ಸಂಕೇತ!`,
        mr: `स्वतःला तपासा: गेल्या १० दिवसांत अस्वस्थ वाटत असतानाच अचानक कुठून तरी आशेचा एखादा छोटा किरण दिसला का? तीच तुमच्या कथेची सुरुवात आहे!`,
        hi: `स्वयं-निरीक्षण: क्या पिछले १० दिनों में ठीक उस समय, जब आप थक चुके थे, कहीं से अचानक एक छोटा सकारात्मक संकेत मिला? वही आपके अगले अध्याय की शुरुआत है!`,
        te: `మిమ్మల్ని మీరు పరిశీలించుకోండి: గత 10 రోజుల్లో మీరు ఆందోళన పడినప్పుడే ఎక్కడి నుండో ఒక చిన్న ఆశాకిరణం కనిపించిందా? అదే మీ కథలోని మార్పు!`,
        ta: `சுய பரிசோதனை: கடந்த 10 நாட்களில் நீங்கள் சோர்ந்திருந்த தருணத்தில் எதிர்பாராத சிறிய நம்பிக்கைத் துளி தோன்றியதா? அதுவே உங்கள் திருப்புமுனையின் அறிகுறி!`,
        en: `Pause & Check: Think back over the last 10 days—just when frustration peaked, did one unexpected small clue or message appear out of nowhere? That was not coincidence.`,
      },
      badge: { kn: "ಆತ್ಮ-ಪರಿಶೀಲನೆ", mr: "स्व-निरीक्षण", hi: "आत्म-संकेत", te: "స్వీయ పరిశీలన", ta: "சுய சோதனை", en: "Story Mirror" },
      anchors: [`${livePrashnaHora}`, `${taraWord} (${n(taraScore)}%)`],
    },

    // CHAPTER 2 — Nigooda Rahasya (Hidden Burdens & Silent Turning Point)
    {
      n: 2, sec: 1, secTitle: sec1, icon: "🕯️", visual: "energy-gauge",
      title: {
        kn: "ನಿಗೂಢ ರಹಸ್ಯ: ಯಾರೂ ಕಾಣದ ನಿಮ್ಮ ಮೌನ ತ್ಯಾಗ & ಮನಸ್ಸಿನ ಆಳ",
        mr: "निगूढ रहस्य: कोणासही न दिसलेला तुमचा मूक त्याग",
        hi: "निगूढ़ रहस्य: सबकी नज़रों से छिपा आपका मौन त्याग",
        te: "నిగూఢ రహస్యం: ఎవరూ గుర్తించని మీ మౌన త్యాగం",
        ta: "நிகூட ரகசியம்: யாரும் அறியாத உங்கள் மௌன தியாகம்",
        en: "Nigooda Rahasya — The Quiet Role Nobody Thanked You For",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನೀವು ಕುಟುಂಬ ಹಾಗೂ ಆಪ್ತರಿಗಾಗಿ ಎಷ್ಟೋ ಬಾರಿ ಮೌನವಾಗಿ ಹಿಂದೆ ಸರಿದಿದ್ದರೂ, ಅದರ ಹಿಂದೆ ಅಡಗಿರುವ ದೊಡ್ಡ ಸತ್ಯವೇನು?`,
        mr: `प्रश्न: ${devoteeName}, आपण अनेकदा इतरांसाठी गप्प राहिलात आणि झटलात—यामागे तुमच्या पत्रिकेतील कोणते रहस्य लपले आहे?`,
        hi: `प्रश्न: ${devoteeName}, आपने बार-बार चुपचाप सबका बोझ उठाया—इसके पीछे आपके जीवन की कौन सी अनकही सच्चाई छिपी है?`,
        te: `ప్రశ్న: ${devoteeName}, మీరు అనేకసార్లు మౌనంగా ఇతరుల కోసం తగ్గారు—దీని వెనుక ఉన్న నిజమైన రహస్యం ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, பலமுறை மற்றவர்களுக்காக மௌனமாக விட்டுக்கொடுத்தீர்கள்—அதன் பின்னால் உள்ள உண்மை என்ன?`,
        en: `Question: ${devoteeName}, why do people lean heavily on you in crises yet overlook what you silently gave up for them?`,
      },
      p1: {
        kn: `${ganaHook}. ಎಷ್ಟೋ ಸಲ ಇತರರ ಸುಖಕ್ಕಾಗಿ ನಿಮ್ಮ ಸ್ವಂತ ಇಷ್ಟ, ಸಮಯ ಅಥವಾ ಹಣವನ್ನು ಹಿಂದಿಟ್ಟಿದ್ದೀರಿ — ಆದರೆ ಪ್ರತಿಯಾಗಿ ಸಿಗಬೇಕಾದ ಒಂದು ಪ್ರೀತಿಯ ಮಾತು ಮಾತ್ರ ತಡವಾಗಿದೆ ಎಂಬ ಸಣ್ಣ ನೋವು ನಿಮ್ಮಲ್ಲಿ ಉಳಿದಿದೆ.`,
        mr: `${ganaHook}. अनेक वेळा तुम्ही घरच्यांच्या किंवा मित्रांच्या समाधानासाठी स्वतःच्या इच्छा बाजूला ठेवल्या — पण समोरून हवा तितका आदर किंवा कृतज्ञता मिळाली नाही, हीच खंत मनात राहिली.`,
        hi: `${ganaHook}। कितनी ही बार आपने दूसरों की सुविधा के लिए अपने समय, विश्राम और इच्छाओं को पीछे रखा—परंतु जिनसे सबसे अधिक आशा थी, उनकी ओर से धन्यवाद के दो शब्द तक समय पर नहीं मिले।`,
        te: `${ganaHook}. ఎన్నోసార్లు మీ సొంత ఆనందాన్ని, సమయాన్ని కుటుంబం కోసం త్యాగం చేశారు—కానీ మీరు ఆశించిన ఆత్మీయ గుర్తింపు పూర్తిగా దక్కలేదన్న చిన్న లోటు లోపల ఉండిపోయింది.`,
        ta: `${ganaHook}. பலமுறை பிறருடைய நலனுக்காக உங்கள் விருப்பங்களையும் நேரத்தையும் விட்டுக்கொடுத்தீர்கள்—ஆனால் அதற்குரிய நன்றி உணர்வு கிடைக்கவில்லையே என்ற மெல்லிய வலி மனதில் உள்ளது.`,
        en: `Here is the chapter you rarely tell aloud: shaped by ${ganaHook}, you repeatedly stepped in to rescue schedules, peace, or family pride when no one else volunteered. Yet afterward, the same people walked forward assuming you never needed anything back.`,
      },
      p2: {
        kn: `ಇದರಲ್ಲಿರುವ ಅಚ್ಚರಿಯ ತಿರುವು: ನಿಮ್ಮ ಜಾತಕದ ಯೋಗಿ '${yogiPlanetName}' ರಹಸ್ಯದಂತೆ, ನೀವು ಯಾರಿಗೂ ಹೇಳದೆ ಮಾಡಿದ ಉಪಕಾರಗಳೆಲ್ಲಾ ಕಳೆದುಹೋಗಿಲ್ಲ — ಅವು ನಿಮ್ಮ ಹೆಸರಿನಲ್ಲಿ 'ಗುಪ್ತ ಬಲ'ವಾಗಿ ಕೂಡಿವೆ! ಇನ್ನೊಂದು ತಿರುವೆಂದರೆ, ನೀವು ಸಹಾಯ ನಿಲ್ಲಿಸಿದ ಕ್ಷಣದಲ್ಲೇ ಸುತ್ತಲಿನವರಿಗೆ ನಿಮ್ಮ ನಿಜವಾದ ತೂಕ ಎಷ್ಟೆಂದು ಅರಿವಾಗಲಿದೆ.`,
        mr: `कथेचे खरे वळण हेच आहे: तुमचा योगी '${yogiPlanetName}' सांगतो की तुमचे न बोललेले उपकार वाया गेलेले नाहीत — ज्या दिवशी तुम्ही गरजेपेक्षा जास्त धावणे कमी कराल, त्याच दिवशी लोकांना तुमची खरी किंमत कळेल!`,
        hi: `रोमांचक मोड़ यही है: आपके जीवन के रक्षक '${yogiPlanetName}' बताते हैं कि आपका कोई भी निःस्वार्थ श्रम व्यर्थ नहीं गया—जिस दिन आप अनावश्यक दौड़ना कम करेंगे, उसी दिन लोगों को आपकी वास्तविक अहमियत समझ में आएगी!`,
        te: `దీనిలోని ఆసక్తికరమైన మలుపు: మీ యోగి '${yogiPlanetName}' బలం వల్ల మీరు చేసిన ఏ మంచి వృధా కాలేదు—మీరు అనవసరంగా ఇతరుల కోసం పరుగెత్తడం తగ్గించిన రోజే మీ విలువ వారికి అర్థమవుతుంది!`,
        ta: `இதில் உள்ள சுவாரஸ்யமான திருப்பம்: உங்கள் யோகி '${yogiPlanetName}' சக்தி சொல்வது என்னவென்றால், நீங்கள் செய்த எந்த உதவியும் வீணாகவில்லை—அளவுக்கு மீறி வளைந்து கொடுப்பதைக் குறைத்த நொடியில் உங்கள் மதிப்பு அனைவருக்கும் புரியும்!`,
        en: `The hidden plot twist: none of that silent goodwill vanished—your ${yogiPlanetName} factor quietly banks unseen loyalty. Even better: the moment you stop over-explaining and over-delivering for ungrateful expectations, people around you suddenly wake up to your real value.`,
      },
      p3: {
        kn: `ನಿಮ್ಮ ಮುಂದಿನ ನಿಲುವು: ಸಹಾಯ ಮಾಡುವ ಹೃದಯವನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ, ಆದರೆ 'ಇಲ್ಲ' ಎನ್ನಲು ಹಿಂಜರಿಯಬೇಡಿ. ಪ್ರತಿದಿನ ಒಂದಷ್ಟು ಸಮಯವನ್ನು ಕೇವಲ ನಿಮ್ಮ ಸ್ವಂತ ಸಂತೋಷ ಮತ್ತು ನೆಮ್ಮದಿಗಾಗಿ ಮೀಸಲಿಟ್ಟರೆ, ಜೀವನದ ಸಮತೋಲನ ತಾನಾಗಿಯೇ ಬದಲಾಗುತ್ತದೆ.`,
        mr: `पुढचे पाऊल: तुमचा चांगुलपणा टिकवा, पण गरज असेल तिथे ठामपणे 'नाही' म्हणायला शिका. दिवसातील थोडा वेळ फक्त स्वतःच्या आनंदासाठी राखून ठेवा.`,
        hi: `आगे का कदम: अपनी उदारता बनाए रखें, परंतु अनुचित बोझ के लिए स्पष्ट 'ना' कहना सीखें। दिन का कुछ समय केवल अपनी शांति और रुचियों के लिए सुरक्षित रखें।`,
        te: `మీ తదుపరి నిర్ణయం: మంచితనం ఉంచుకోండి కానీ అవసరమైన చోట 'కుదరదు' అని చెప్పడం నేర్చుకోండి. రోజులో కొంత సమయాన్ని మీ సొంత ఆనందం కోసం కేటాయించండి.`,
        ta: `உங்கள் அடுத்த நிலை: நல்ல குணத்தைக் காத்துக்கொள்ளுங்கள், ஆனால் தேவையில்லாத சுமைகளுக்கு 'முடியாது' என்று சொல்லப் பழகுங்கள். தினமும் சிறிது நேரம் உங்களுக்காக ஒதுக்குங்கள்.`,
        en: `From today onward: keep your generous heart, but retire from rescuing problems that are not yours to solve. Reclaim thirty guilt-free minutes daily solely for your own energy.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ನಾನು ಏಕೆ ಎಲ್ಲರಿಗೂ ಸ್ಪಂದಿಸುತ್ತೇನೆ, ನನಗೆ ಬೇಕಾದಾಗ ಯಾರೂ ಹೀಗೇಕೆ ಮುಂದೆ ಬರುವುದಿಲ್ಲ?' ಎಂಬ ಯೋಚನೆ ನಿಮಗೆ ಕನಿಷ್ಠ ಒಮ್ಮೆಯಾದರೂ ಬಂದಿದೆಯೇ?`,
        mr: `स्व-परीक्षण: 'मी नेहमी सगळ्यांच्या मदतीला धावतो, पण माझ्या वेळी लोक इतके गप्प का राहतात?' हा प्रश्न तुम्हाला कधी ना कधी नक्कीच पडला असेल, नाही का?`,
        hi: `स्वयं-निरीक्षण: क्या आपके मन में कभी यह विचार आया है कि 'मैं सबके लिए खड़ा रहता हूं, पर मेरे समय लोग चुप क्यों हो जाते हैं'?`,
        te: `మిమ్మల్ని మీరు అడుగండి: 'నేను అందరికీ అండగా ఉంటాను కానీ నా అవసరానికి ఎందుకు ఎవరూ రారు?' అన్న ఆలోచన మీకు ఎప్పుడైనా వచ్చిందా?`,
        ta: `சுய பரிசோதனை: 'நான் எல்லோருக்கும் உதவுகிறேன், ஆனால் எனக்குத் தேவைப்படும்போது ஏன் அமைதியாக இருக்கிறார்கள்?' என்று எப்போதாவது நினைத்திருக்கிறீர்களா?`,
        en: `Pause & Check: Have you ever asked yourself, "Why do I always show up for everyone, yet feel strangely alone when the tables turn?"—that chapter ends here.`,
      },
      badge: { kn: "ಆಂತರಿಕ ಗಡಿ", mr: "भावनिक मर्यादा", hi: "भावनात्मक सीमा", te: "హృదయ సత్యం", ta: "உள்ளத் தெளிவு", en: "Hidden Truth" },
      anchors: [`${yogiPlanetName}`, tithiName.includes(pakshaName) ? tithiName : `${pakshaName} ${tithiName}`],
    },

    // CHAPTER 3 — Past 24-Month Reality Check & Turning Point
    {
      n: 3, sec: 1, secTitle: sec1, icon: "⚖️", visual: "timeline-meter",
      title: {
        kn: "ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳ ಗಣಿತ ಪರಿಶೀಲನೆ: ನೀವು ಗೆದ್ದು ಬಂದ ಬಿರುಗಾಳಿ",
        mr: "मागील २४ महिन्यांची अचूक पडताळणी: तुम्ही जिंकलेले वादळ",
        hi: "विगत २४ महीनों का गणितीय सत्यापन: दो कठिन मोड़ जिनसे आप उबरे",
        te: "గత 24 నెలల గణిత పరిశీలన: మీరు దాటిన తుఫాను",
        ta: "கடந்த 24 மாத கணித உண்மை: நீங்கள் கடந்து வந்த புயல்",
        en: "Past 24-Month Verification — The Storm That Rewrote You",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಕಳೆದ ೨ ವರ್ಷಗಳಲ್ಲಿ 'ಎಲ್ಲಾ ಮುಗಿಯಿತೇನೋ' ಅನಿಸುವಷ್ಟು ಪರೀಕ್ಷೆ ಕೊಟ್ಟ ಆ ಎರಡು ಘಟನೆಗಳು ಯಾವುವು?`,
        mr: `प्रश्न: ${devoteeName}, गेल्या २ वर्षांत तुमचा संयम तपासणाऱ्या नेमक्या कोणत्या दोन घटना घडल्या होत्या?`,
        hi: `प्रश्न: ${devoteeName}, पिछले २ वर्षों में वे कौन सी दो घटनाएं थीं जिन्होंने आपके धैर्य की पूरी परीक्षा ले ली?`,
        te: `ప్రశ్న: ${devoteeName}, గత రెండేళ్లలో మీ సహనాన్ని తీవ్రంగా పరీక్షించిన ఆ రెండు సంఘటనలు ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, கடந்த 2 ஆண்டுகளில் உங்கள் பொறுமையை முழுமையாகச் சோதித்த இரண்டு நிகழ்வுகள் எவை?`,
        en: `Question: ${devoteeName}, looking back across the past 24 months, which two unexpected tests nearly broke your trust—yet quietly forged today's strength?`,
      },
      p1: {
        kn: `ಕಳೆದ ಎರಡು ವರ್ಷಗಳು ಸುಲಭವಾಗಿರಲಿಲ್ಲ: ಒಂದೆಡೆ ಬಹಳ ನಿರೀಕ್ಷೆಯಿಟ್ಟಿದ್ದ ಕೆಲಸ ಅಥವಾ ಹಣದ ಹರಿವು ಕೊನೆಯ ಹಂತದಲ್ಲಿ ಕೈಜಾರಿ 'ನಂಬಿದವರೇ ಬದಲಾದರೇ?' ಎನಿಸಿತು; ಮತ್ತೊಂದೆಡೆ ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿ ಅಥವಾ ಆಪ್ತರ ಆರೋಗ್ಯದ ಚಿಂತೆ ನಿಮ್ಮ ರಾತ್ರಿಗಳ ನಿದ್ದೆಯನ್ನು ಕಸಿದಿತ್ತು.`,
        mr: `गेली दोन वर्षे तुमच्यासाठी साधी नव्हती: एकीकडे हातात आलेले काम किंवा पैशाचे गणित ऐनवेळी फसले आणि विश्वासू माणसे मागे हटली; दुसरीकडे घरच्यांचे आरोग्य किंवा नात्यातील ताण यांमुळे कित्येक रात्री झोप लागली नाही.`,
        hi: `पिछले दो वर्ष सहज नहीं थे: एक तरफ जिस काम या आर्थिक योजना पर सबसे ज्यादा भरोसा था, वह अंतिम मोड़ पर अटक गई और कुछ अपने पीछे हट गए; दूसरी ओर परिवार या किसी प्रियजन की चिंता ने रातों की नींद उड़ाई।`,
        te: `గత రెండేళ్లు మీకు అంత సులభంగా గడవలేదు: ఒకవైపు ఎంతో నమ్మిన పని లేదా ఆర్థిక విషయం చివరి క్షణంలో ఆగిపోయి నమ్మకం దెబ్బతింది; మరోవైపు కుటుంబ చింతలు మీ మనశ్శాంతిని పరీక్షించాయి.`,
        ta: `கடந்த இரண்டு ஆண்டுகள் எளிதானதாக இல்லை: ஒரு பக்கம் கைக்கு எட்டிய வேலை அல்லது பண விஷயம் கடைசியில் தடம் மாறியது; மறுபக்கம் குடும்பப் பொறுப்போ உறவுகளின் மனக்கசப்போ இரவுத் தூக்கத்தைக் கெடுத்தது.`,
        en: `Let us verify your real timeline first: the last 24 months delivered a sharp double test. First, an expected financial or work breakthrough stalled just before completion while people you trusted backed away. Second, a quiet strain around family health or a close bond weighed heavily on your nights.`,
      },
      p2: {
        kn: `ರೋಚಕ ತಿರುವು ಏನೆಂದರೆ: ${shaniTransitRashi} ಮೂಲಕ ಸಾಗಿದ ಶನಿ ಪಾಠವು ನಿಮ್ಮ ಸುತ್ತಲಿನ ನಕಲಿ ಮುಖವಾಡಗಳನ್ನು ಕಳಚಿ ಹಾಕಲು ಬಂದಿತ್ತೇ ವಿನಃ ನಿಮ್ಮನ್ನು ಕೆಡವಲು ಅಲ್ಲ! ಆ ಕಠಿಣ ೨೪ ತಿಂಗಳುಗಳು ನಿಜವಾಗಿಯೂ ನಿಮ್ಮ ಪಾಲಿಗೆ ಅನಗತ್ಯ ಬಾಂಧವ್ಯಗಳನ್ನು ಬೇರ್ಪಡಿಸಿದ ಮಹಾ ಶುದ್ಧೀಕರಣವಾಗಿತ್ತು.`,
        mr: `खरा ट्विस्ट हाच आहे: ${shaniTransitRashi} मधील या कठीण काळाने तुमच्या सभोवतालच्या खोट्या चेहऱ्यांवरचे मुखवटे उतरवले! ती कसरत तुम्हाला पाडण्यासाठी नव्हती, तर चुकीच्या लोकांना व मार्गांना तुमच्या आयुष्यातून दूर करण्यासाठी होती.`,
        hi: `कहानी का बड़ा मोड़ यह है: ${shaniTransitRashi} के इस सख्त दौर का उद्देश्य आपको तोड़ना नहीं, बल्कि आपके आसपास के नकली चेहरों को बेनक़ाब करना था! वे कठिन महीने एक आवश्यक शुद्धिकरण थे ताकि आप सही लोगों के साथ आगे बढ़ सकें।`,
        te: `ఇక్కడ ఉన్న ఆసక్తికర మలుపు ఏమిటంటే: ${shaniTransitRashi} లోని ఆ కఠిన సమయం మిమ్మల్ని ఓడించడానికి కాదు, మీ చుట్టూ ఉన్న అసలైన వ్యక్తులు ఎవరో చూపించడానికి వచ్చింది! అది మీ జీవితంలో ఒక పెద్ద శుద్ధి.`,
        ta: `இதன் சுவாரஸ்ய திருப்பம்: ${shaniTransitRashi} வழியாக நடந்த அந்தக் கடினக் காலம் உங்களை வீழ்த்த வரவில்லை—உங்களைச் சுற்றியிருந்த போலி முகங்களை அடையாளம் காட்டவே வந்தது! அது தேவையற்ற சுமைகளை நீக்கிய சுத்திகரிப்பு.`,
        en: `Here is the surprise twist: that tough 24-month cycle through ${shaniTransitRashi} never came to ruin you—it arrived to strip masks off unreliable allies before bigger doors opened. Look closely: every detour saved you from a larger trap down the road.`,
      },
      p3: {
        kn: `ಈಗ ಆ ಬಿರುಗಾಳಿಯ ತೀವ್ರ ಭಾಗ ಮುಗಿಯುವ ಹಂತದಲ್ಲಿದೆ. ಕಳೆದ ೨ ವರ್ಷಗಳಲ್ಲಿ ನೀವು ಕಲಿತ ಕಠಿಣ ಪಾಠವೇ ಮುಂದಿನ ಹೆಜ್ಜೆಯಲ್ಲಿ ನಿಮ್ಮನ್ನು ಯಾರೂ ಮೋಸ ಮಾಡದಂತೆ ಕಾಯುವ ಕವಚವಾಗಲಿದೆ — ಇನ್ನು ಭಯಪಡುವ ಅಗತ್ಯವೇ ಇಲ್ಲ.`,
        mr: `आता त्या वादळाचा सर्वात कठीण भाग मागे सरत आहे. मागील दोन वर्षांत शिकलेले धडेच पुढे तुम्हाला कोणाकडूनही फसू न देणारे संरक्षण बनतील.`,
        hi: `अब उस तूफ़ान का सबसे भारी दौर समाप्त होने की ओर है। बीते दो वर्षों में जो अनुभव आपने कमाया, वही आगे हर नए निर्णय में आपका अचूक कवच बनेगा।`,
        te: `ఆ తుఫానులో అత్యంత కఠినమైన భాగం ఇప్పుడు ముగుస్తోంది. గత రెండేళ్లలో మీరు నేర్చుకున్న పాఠమే ఇకపై మిమ్మల్ని ఎవరూ మోసం చేయకుండా కాపాడే రక్షణ కవచం.`,
        ta: `அந்தப் புயலின் மிகக் கடினமான பகுதி இப்போது முடிவுக்கு வருகிறது. கடந்த இரண்டு ஆண்டு அனுபவம் இனி யாராலும் உங்களை ஏமாற்ற முடியாத கவசமாக மாறிவிட்டது.`,
        en: `The heaviest stretch of that test is already behind you. What felt like two lost years actually forged the sharp discernment that now keeps you untouchable in your next chapter.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ೨ ವರ್ಷಗಳ ಹಿಂದೆ ಇದ್ದ 'ಎಲ್ಲರನ್ನೂ ಕಣ್ಣುಮುಚ್ಚಿ ನಂಬುವ' ಸ್ವಭಾವ ಇಂದು ಎಷ್ಟು ಬದಲಾಗಿದೆ ಗಮನಿಸಿ ನೋಡಿ — ಅದೇ ನಿಮ್ಮ ಬೆಳವಣಿಗೆ!`,
        mr: `स्व-परीक्षण: २ वर्षांपूर्वीचा भाबडा विश्वास आणि आजचा तुमचा सावधपणा यातला फरक जाणवतो का? हीच तुमची खरी प्रगती आहे!`,
        hi: `स्वयं-निरीक्षण: ज़रा सोचें—२ वर्ष पहले की तुलना में आज आप लोगों को कितनी जल्दी परख लेते हैं? यही आपका सबसे बड़ा विकास है!`,
        te: `మిమ్మల్ని మీరు అడుగండి: రెండేళ్ల క్రితం అందరినీ గుడ్డిగా నమ్మిన మీకూ, నేటి జాగ్రత్తగల మీకూ ఎంత తేడా ఉందో గమనించారా? అదే మీ ఎదుగుదల!`,
        ta: `சுய பரிசோதனை: இரண்டு ஆண்டுகளுக்கு முன்பு அனைவரையும் கண்மூடித்தனமாக நம்பியதற்கும் இன்றைய உங்கள் தெளிவுக்கும் உள்ள மாற்றத்தை உணர்கிறீர்களா?`,
        en: `Pause & Check: Compare how easily you trusted people two years ago versus how clearly you read character today—that sharp instinct is your trophy.`,
      },
      badge: { kn: "೨೪ ತಿಂಗಳ ಪಾಠ", mr: "२४ महिन्यांचे सत्य", hi: "२४ महीनों की कसौटी", te: "24 నెలల పాఠం", ta: "24 மாத உண்மை", en: "24-Month Pivot" },
      anchors: [`${shaniTransitRashi}`, `${currentMahadasha} – ${currentBhuktiLord}`],
    },

    // CHAPTER 4 — 99% Maandi Knot Secret (Story + Twist, NO Remedy)
    {
      n: 4, sec: 1, secTitle: sec1, icon: "🪢", visual: "rashi-mandala",
      title: {
        kn: "೯೯% ಹಂತದ ಮಾಂದಿ ಗಂಟು: ಕೈಗೆ ಬಂದ ಯಶಸ್ಸು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಜಾರುವುದೇಕೆ?",
        mr: "९९% वर येऊन थांबणारी मांदी गाठ: यशाच्या उंबरठ्यावर अडथळा का येतो?",
        hi: "९९% पर रुकने वाली मांदी ग्रंथि: सफलता के अंतिम कदम पर देरी क्यों?",
        te: "99% వద్ద ఆగిపోయే మాంది ముడి: చివరి క్షణంలో ఎందుకు ఆలస్యం?",
        ta: "99% நிலையில் தடுக்கும் மாந்தி முடிச்சு: கடைசி நொடி தடை ஏன்?",
        en: "The 99% Maandi Knot — Why Near-Wins Keep Pausing at the Door",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ ಎನ್ನುವಾಗಲೇ ೯೯% ಹಂತದಲ್ಲಿ ತಡೆ ಬರುವ ಆ ವಿಚಿತ್ರ ಪ್ಯಾಟರ್ನ್ ನಿಮಗೂ ಅನುಭವವಾಗಿದೆಯೇ?`,
        mr: `प्रश्न: ${devoteeName}, सगळी तयारी पूर्ण झाल्यावर अगदी शेवटच्या टप्प्यावर काम अडकण्याचा अनुभव तुम्हाला वारंवार येतो का?`,
        hi: `प्रश्न: ${devoteeName}, क्या आपके साथ अक्सर ऐसा होता है कि ९९% काम पूरा होने पर भी अंतिम हस्ताक्षर या परिणाम अटक जाता है?`,
        te: `ప్రశ్న: ${devoteeName}, అంతా సిద్ధమైంది అనుకున్న 99% వద్దే పనులు ఎందుకు ఆగిపోతున్నాయి?`,
        ta: `கேள்வி: ${devoteeName}, எல்லாம் முடிந்தது என்ற 99% கட்டத்தில் ஏன் மீண்டும் மீண்டும் சிறு தடை வருகிறது?`,
        en: `Question: ${devoteeName}, why do your best plans reach 99% completion only to stall on one strange final hurdle?`,
      },
      p1: {
        kn: `ನೀವು ಕೆಲಸದಲ್ಲಿ ಸೋಮಾರಿಗಳಲ್ಲ — ಬಹುತೇಕ ಬಾರಿ ಇತರರಿಗಿಂತ ಹತ್ತು ಪಟ್ಟು ಶ್ರಮ ಹಾಕುತ್ತೀರಿ. ಆದರೂ '${maandiDomainAffected}' ವಿಷಯದಲ್ಲಿ ೯೯% ಯಶಸ್ಸು ಕೈಗೆ ಬಂದು ಕೊನೆಯ ೧% ಹಂತದಲ್ಲಿ ಸಣ್ಣ ತಾಂತ್ರಿಕ ಕಾರಣ ಅಥವಾ ಯಾರದೋ ಮೊಂಡುತನದಿಂದ ತಡೆಯಾಗುವ ವಿಚಿತ್ರ ಅನುಭವ ನಿಮಗೆ ಪರಿಚಿತವಾಗಿದೆ.`,
        mr: `तुम्ही मेहनतीत कधीच कमी पडत नाही — उलट इतरांपेक्षा दहापट जास्त झटता. तरीही '${maandiDomainAffected}' मध्ये ९९% काम पूर्ण होऊन शेवटच्या १% टप्प्यावर अगदी छोट्या कारणाने अडखळण्याचा अनुभव तुम्हाला नवा नाही.`,
        hi: `आप परिश्रम में कभी पीछे नहीं रहते—अक्सर दूसरों से दस गुना अधिक मेहनत करते हैं। फिर भी '${maandiDomainAffected}' में काम ९९% पूरा होकर अंतिम १% पर किसी छोटी ग़लतफ़हमी या कागज़ी अड़चन से अटक जाता है।`,
        te: `మీరు శ్రమలో ఎప్పుడూ వెనుకబడరు. అయినప్పటికీ '${maandiDomainAffected}' విషయాల్లో 99% పూర్తయ్యాక, చివరి 1% దగ్గర అనూహ్య కారణంతో ఆలస్యమయ్యే విచిత్రమైన అనుభవం మీకు చాలాసార్లు ఎదురైంది.`,
        ta: `நீங்கள் உழைப்பில் சளைத்தவரல்ல. ஆனாலும் '${maandiDomainAffected}' சார்ந்த விஷயங்களில் 99% வரை முடிந்து, கடைசி 1% கட்டத்தில் எதிர்பாராத சிறிய காரணத்தால் நிற்பது உங்களுக்குப் பழக்கமான அனுபவமாக உள்ளது.`,
        en: `You have never lacked effort—usually you work twice as hard as anyone else in the room. Yet inside '${maandiDomainAffected}', you know the eerie frustration of reaching 99% completion only to hit one unexpected final lock right before the finish line.`,
      },
      p2: {
        kn: `ಇದರ ಹಿಂದಿನ ಅಚ್ಚರಿಯ ಕಥೆ: ನಿಮ್ಮ ಜಾತಕದ ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿಯು ಗುಣಮಟ್ಟದ ಕಾವಲುಗಾರನಂತೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ! ಬೇಗನೆ ಮುಗಿದಿದ್ದರೆ ಮುಂದೆ ದೊಡ್ಡ ನಷ್ಟವಾಗುತ್ತಿದ್ದ ವ್ಯವಹಾರವನ್ನೇ ಅದು ೯೯%ನಲ್ಲಿ ನಿಲ್ಲಿಸಿ ನಿಮ್ಮನ್ನು ತಿದ್ದಿಕೊಳ್ಳುವಂತೆ ಮಾಡಿದೆ. ಅಂದರೆ ಆ ವಿಳಂಬದಲ್ಲೇ ನಿಮ್ಮ ಸುರಕ್ಷತೆ ಅಡಗಿತ್ತು.`,
        mr: `यामागचा आश्चर्यकारक ट्विस्ट: तुमच्या ${n(maandiHouse)}व्या स्थानातील मांदी हा तुमचा विरोधक नसून एक गुप्त रक्षक आहे! जे काम अर्धवट गुणवत्तेवर किंवा चुकीच्या अटींवर होत होते, ते त्याने ९९% वर रोखून तुमचे मोठे नुकसान वाचवले आहे.`,
        hi: `इसके पीछे की चौंकाने वाली सच्चाई: आपके ${n(maandiHouse)}वें भाव की मांदी आपकी शत्रु नहीं, बल्कि एक सख्त रक्षक है! जो सौदा या निर्णय आगे चलकर बड़ा नुकसान दे सकता था, उसी ने उसे ९९% पर रोककर आपको संभलने का मौका दिया।`,
        te: `దీని వెనుక ఉన్న ఆశ్చర్యకరమైన మలుపు: మీ ${n(maandiHouse)}వ స్థానంలోని మాంది మీ శత్రువు కాదు, రక్షకుడు! తప్పుగా జరుగుతున్న ఒప్పందం లేదా నిర్ణయం వల్ల భవిష్యత్తులో నష్టం రాకుండా అది చివరి క్షణంలో అడ్డుకొని మిమ్మల్ని కాపాడింది.`,
        ta: `இதன் பின்னணியில் உள்ள ஆச்சரிய திருப்பம்: உங்கள் ${n(maandiHouse)}-ம் இட மாந்தி உங்களுக்கு எதிரி அல்ல, கடுமையான காவலாளி! பிற்காலத்தில் பெரிய இழப்பு தரக்கூடிய முடிவுகளை 99%-ல் நிறுத்தி உங்களைக் காப்பாற்றியுள்ளது.`,
        en: `Here is the shocking twist about your Maandi placement in House ${maandiHouse}: it acts like a strict quality inspector, not a curse. Almost every time it froze things at 99%, an unseen flaw or hidden clause existed—that freeze saved you from signing into a far costlier regret.`,
      },
      p3: {
        kn: `ಹಾಗಾದರೆ ಇದನ್ನು ಗೆಲ್ಲುವುದು ಹೇಗೆ? ಆ ೧% ತಡೆಯನ್ನು ಬಿಡಿಸಲು ಪದೇ ಪದೇ ಆತುರಪಡಬೇಡಿ — ಒಮ್ಮೆ ನಿಂತು 'ಇಲ್ಲಿ ನಾನು ಯಾವುದನ್ನು ಗಮನಿಸದೆ ಬಿಟ್ಟೆ?' ಎಂದು ಪರಿಶೀಲಿಸಿ. ಸಣ್ಣ ವಿವರಗಳನ್ನು ಪಕ್ಕಾ ಮಾಡಿಕೊಂಡ ಕ್ಷಣವೇ ಆ ಬೀಗ ತಾನಾಗಿಯೇ ತೆರೆಯುತ್ತದೆ.`,
        mr: `यावरचा व्यावहारिक उपाय: शेवटच्या १% अडकलेल्या क्षणी घाई करू नका — उलट एक क्षण थांबून लहान तपशील तपासा. सूक्ष्म चूक दुरुस्त होताच कुलूप आपोआप उघडते.`,
        hi: `इसे पार करने का तरीका: अंतिम १% की देरी पर झुंझलाएं नहीं, बल्कि एक कदम रुककर बारीकी से जांचें कि क्या छूट रहा था। वही एक सुधार बंद दरवाज़ा खोल देगा।`,
        te: `దీనిని దాటడానికి మార్గం: చివరి 1% ఆలస్యానికి కంగారు పడకండి. ఒక్క క్షణం ఆగి 'ఇక్కడ నేను ఏ చిన్న విషయాన్ని వదిలేశాను?' అని సరిచూసుకోండి; తలుపు వెంటనే తెరుచుకుంటుంది.`,
        ta: `இதை வெல்லும் வழி: கடைசி 1% தாமதத்தில் பதற்றப்படாமல், 'எந்தச் சிறிய விஷயத்தைக் கவனிக்காமல் விட்டோம்?' என ஒருமுறை சரிபாருங்கள்; பூட்டு தானாகத் திறக்கும்.`,
        en: `How to unlock the final 1%: whenever a major milestone hits a strange last-minute pause, never force it through frustration—inspect the fine print calmly once, fix that one overlooked detail, and watch the lock click open cleanly.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಹಿಂದೆ 'ಅಯ್ಯೋ ಕೈತಪ್ಪಿತಲ್ಲ' ಎಂದು ಬೇಸರಪಟ್ಟ ಒಂದು ಕೆಲಸ, ಆಮೇಲೆ 'ಒಳ್ಳೆಯದೇ ಆಯ್ತು, ಆಗದಿದ್ದದ್ದೇ ಪುಣ್ಯ!' ಅನಿಸಿದ ಉದಾಹರಣೆ ನಿಮ್ಮ ಬದುಕಲ್ಲಿ ಇದೆಯೇ?`,
        mr: `स्व-परीक्षण: पूर्वी 'हे काम का झाले नाही' म्हणून वाईट वाटलेली एखादी गोष्ट, नंतर 'बरं झालं ते टळलं!' असे वाटल्याचे आठवते का?`,
        hi: `स्वयं-निरीक्षण: क्या आपके जीवन में कभी ऐसा हुआ कि जो बात न बनने पर आप दुखी हुए, बाद में लगा कि 'अच्छा हुआ वह रुक गया'?`,
        te: `మిమ్మల్ని మీరు అడుగండి: గతంలో జరగలేదని బాధపడ్డ ఒక పని గురించి, ఆ తర్వాత 'మంచిదైంది ఆగిపోయింది!' అని ఎప్పుడైనా అనిపించిందా?`,
        ta: `சுய பரிசோதனை: முன்பு 'கைநழுவிப் போனதே' என வருந்திய ஒரு விஷயம், பிறகு 'நல்லவேளை நடக்காமல் போனது!' என்று நினைக்க வைத்ததுண்டா?`,
        en: `Pause & Check: Recall one deal or plan that stalled at the last second—did you later realize how lucky it was that you didn't get it then?`,
      },
      badge: { kn: "೯೯% ರಹಸ್ಯ", mr: "मांदी रहस्य", hi: "९९% का सच", te: "99% మలుపు", ta: "99% ரகசியம்", en: "The 99% Secret" },
      anchors: [`${n(maandiHouse)}`, `${maandiDomainAffected}`],
    },

    // CHAPTER 5 — 3 Inner Truths & Panchabhuta Constitution
    {
      n: 5, sec: 1, secTitle: sec1, icon: "🔥", visual: "element-radar",
      title: {
        kn: "ಆಂತರಿಕ ೩ ಪರಮ ಸತ್ಯಗಳು: ನಿಮ್ಮ ಪಂಚಭೂತ ಸ್ವಭಾವ & ಗುಪ್ತ ವ್ಯಕ್ತಿತ್ವ",
        mr: "अंतर्मनाची ३ मोठी सत्ये: तुमचा पंचतत्त्व स्वभाव",
        hi: "अंतर्मन के ३ परम सत्य: आपका पंचभूत स्वभाव एवं वास्तविक व्यक्तित्व",
        te: "అంతరంగంలోని 3 పరమ సత్యాలు: మీ పంచభూత వ్యక్తిత్వం",
        ta: "உள்ளத்தின் 3 உண்மைகள்: உங்கள் பஞ்சபூத இயல்பு",
        en: "Three Hidden Inner Truths & Your Elemental Temperament",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಯಾರಿಗೂ ಕಾಣದ ನಿಮ್ಮ ಒಳಗಿನ ೩ ನಿಜವಾದ ಸ್ವಭಾವಗಳು ಯಾವುವು?`,
        mr: `प्रश्न: ${devoteeName}, लोकांना न दिसणारे तुमचे ३ खरे स्वभावगुण कोणते आहेत?`,
        hi: `प्रश्न: ${devoteeName}, आपके भीतर छिपे वे ३ मूल स्वभाव कौन से हैं जिन्हें बाहर की दुनिया समझ नहीं पाती?`,
        te: `ప్రశ్న: ${devoteeName}, బయటి ప్రపంచానికి తెలియని మీ లోపలి 3 అసలైన లక్షణాలు ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, வெளி உலகம் அறியாத உங்கள் உள்ளத்தின் 3 உண்மையான இயல்புகள் எவை?`,
        en: `Question: ${devoteeName}, what are the three private truths about how your mind works that almost nobody around you guesses?`,
      },
      p1: {
        kn: `ನಿಮ್ಮ ಪಂಚಭೂತ (${dominantElement}) ಸಂಯೋಜನೆಯ ಮೊದಲ ಸತ್ಯ: ನೀವು ಮೇಲ್ನೋಟಕ್ಕೆ ಸೌಮ್ಯವಾಗಿದ್ದರೂ ಒಳಗೆ ಅಪಾರ ಸ್ವಾಭಿಮಾನಿ — ಅಪಮಾನವನ್ನು ಎಂದಿಗೂ ಮರೆಯುವುದಿಲ್ಲ. ಎರಡನೆಯದಾಗಿ, ಸುಳ್ಳು ಹೊಗಳಿಕೆಗಿಂತ ನಿಜವಾದ ಕಾಳಜಿಯನ್ನು ಕ್ಷಣದಲ್ಲಿ ಗುರುತಿಸುವ 'ನೇರ ನೋಟ' ನಿಮ್ಮಲ್ಲಿದೆ.`,
        mr: `तुमच्या '${dominantElement}' स्वभावाचे पहिले सत्य: तुम्ही वरवर शांत दिसत असलात तरी आतून अतिशय स्वाभिमानी आहात. दुसरे म्हणजे, खोट्या स्तुतीपेक्षा खऱ्या भावना क्षणात ओळखण्याची तुमची नजर अचूक आहे.`,
        hi: `आपके '${dominantElement}' स्वभाव का पहला सच: ऊपर से शांत दिखते हुए भी आप भीतर से बेहद स्वाभिमानी हैं। दूसरा सच यह है कि आप झूठी प्रशंसा और सच्ची परवाह के अंतर को पल भर में पहचान लेते हैं।`,
        te: `మీ '${dominantElement}' తత్వంలోని మొదటి నిజం: మీరు బయటకు సౌమ్యంగా ఉన్నా లోపల ఆత్మాభిమానం చాలా ఎక్కువ. రెండవది: నకిలీ పొగడ్తలను, నిజమైన ప్రేమను క్షణంలో వేరు చేసి చూస్తారు.`,
        ta: `உங்கள் '${dominantElement}' இயல்பின் முதல் உண்மை: வெளியே மென்மையாகத் தெரிந்தாலும் உள்ளே சுயமரியாதை மிக அதிகம். இரண்டாவது: போலிப் புகழ்ச்சியையும் உண்மையான அக்கறையையும் நொடியில் பிரித்தறியும் திறன் உங்களிடம் உள்ளது.`,
        en: `Three quiet truths define your ${dominantElement} constitution. First, behind your outward politeness sits fierce self-respect—you silently step away once dignity is crossed. Second, empty flattery never fools your radar; you immediately sense genuine care versus convenience.`,
      },
      p2: {
        kn: `ಮೂರನೆಯ ಮತ್ತು ಅತ್ಯಂತ ರೋಚಕ ಸತ್ಯ: ನಿಮ್ಮಲ್ಲಿರುವ ${dominantElement} ತತ್ವ ಹೆಚ್ಚಾದಾಗ, ಒಮ್ಮೆಗೇ ಎಲ್ಲವನ್ನೂ ಸರಿಪಡಿಸುವ ಭರದಲ್ಲಿ ನೀವು ನಿಮ್ಮ ಮೇಲೇ ಅನಗತ್ಯ ಒತ್ತಡ ಹಾಕಿಕೊಳ್ಳುತ್ತೀರಿ! ನಿಜವಾದ ಶಕ್ತಿ ಗಡಿಬಿಡಿಯಲ್ಲಿಲ್ಲ — ನಿಮ್ಮ ಅಂತಃಪ್ರಜ್ಞೆ ಶಾಂತವಾದಾಗ ಹೊರಹೊಮ್ಮುವ ನಿಖರತೆಯಲ್ಲಿದೆ.`,
        mr: `तिसरे आणि सर्वात रंजक सत्य: तुमच्यातील '${dominantElement}' ऊर्जा वाढली की तुम्ही सगळ्या जबाबदाऱ्या एकाच वेळी अंगावर ओढून घेता! पण तुमची खरी शक्ती धावपळीत नाही, तर शांत राहून घेतलेल्या निर्णयात असते.`,
        hi: `तीसरा और सबसे रोचक सच: जब आपकी '${dominantElement}' ऊर्जा बढ़ती है, तो आप सब कुछ एक साथ सुधारने के दबाव में थक जाते हैं! आपकी असली ताक़त भागदौड़ में नहीं, बल्कि शांत विवेक में छिपी है।`,
        te: `మూడవ మరియు ఆశ్చర్యకర నిజం: మీలోని '${dominantElement}' శక్తి పెరిగినప్పుడు అన్ని బాధ్యతలను ఒక్కరే మోయాలని ఒత్తిడి పడతారు! కానీ మీ అసలు శక్తి హడావిడిలో కాదు, ప్రశాంతంగా తీసుకునే నిర్ణయాల్లోనే ఉంది.`,
        ta: `மூன்றாவது சுவாரஸ்ய உண்மை: உங்கள் '${dominantElement}' ஆற்றல் உயரும்போது எல்லாப் பொறுப்புகளையும் நீங்களே சுமந்து அழுத்தத்திற்கு உள்ளாகிறீர்கள்! ஆனால் உங்கள் உண்மையான பலம் பதற்றத்தில் அல்ல, அமைதியான தெளிவில் உள்ளது.`,
        en: `Here is the third—and sharpest—truth: whenever your ${primaryElem === "fire" ? "Fire drive" : primaryElem === "water" ? "Water empathy" : primaryElem === "earth" ? "Earth responsibility" : "Air curiosity"} surges too high, you silently overload yourself trying to fix everything alone. The moment you let half-urgent noise wait, your sharpest intuition switches on.`,
      },
      p3: {
        kn: `ನಿಮ್ಮ ನಿತ್ಯ ಸೂತ್ರ: ಮನಸ್ಸು ಭಾರವಾದಾಗ ವಾದಗಳಿಗೆ ಇಳಿಯದೆ ಪ್ರಕೃತಿಯಲ್ಲಿ ೧೫ ನಿಮಿಷ ಮೌನವಾಗಿ ನಡೆಯಿರಿ — ನಿಮ್ಮ ಪಂಚಭೂತ ಬಲ ಸಮತೋಲನಗೊಂಡ ತಕ್ಷಣ ಪರಿಹಾರ ತಾನಾಗಿಯೇ ಹೊಳೆಯುತ್ತದೆ.`,
        mr: `रोजचा सोपा मंत्र: डोक्यावर ताण वाढल्यास वादात न पडता १५ मिनिटे मोकळ्या हवेत शांत चाला — तुमचे संतुलन परत येताच अचूक मार्ग सुचेल.`,
        hi: `आपका सहज सूत्र: मन भारी लगे तो बहस के बजाय १५ मिनट शांत प्रकृति में टहलें—भीतर का संतुलन लौटते ही सही समाधान स्वयं चमक उठेगा।`,
        te: `మీ రోజువారీ సూత్రం: మనసు భారంగా ఉన్నప్పుడు వాదనలకు దిగకుండా 15 నిమిషాలు ప్రశాంతంగా నడవండి—మీ శక్తి సమతుల్యమవగానే సమాధానం అదే దొరుకుతుంది.`,
        ta: `உங்கள் எளிய சூத்திரம்: மனம் பாரமாகும்போது விவாதம் செய்யாமல் 15 நிமிடங்கள் திறந்தவெளியில் நடக்கவும்—சமநிலை திரும்பியதும் சரியான தீர்வு தானாகத் தோன்றும்.`,
        en: `Your daily edge: whenever mental static spikes, step outside for fifteen quiet minutes before answering anyone. Once your natural balance resets, you see the exact clean solution immediately.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ಎಲ್ಲರೂ ನನ್ನ ಶಾಂತ ಸ್ವಭಾವವನ್ನು ದೌರ್ಬಲ್ಯ ಅಂದುಕೊಂಡಿದ್ದಾರಾ?' ಎಂದು ನಿಮಗೆ ಒಮ್ಮೆಯಾದರೂ ಅನಿಸಿದೆಯಾ?`,
        mr: `स्व-परीक्षण: 'माझ्या शांत स्वभावाचा लोक गैरफायदा घेत आहेत का?' असे तुम्हाला कधी वाटले आहे का?`,
        hi: `स्वयं-निरीक्षण: क्या आपको कभी ऐसा लगा कि लोग आपके शांत स्वभाव को आपकी कमज़ोरी समझ बैठे?`,
        te: `మిమ్మల్ని మీరు అడుగండి: 'నా మంచితనాన్ని, ప్రశాంతతను జనం బలహీనత అనుకుంటున్నారా?' అని ఎప్పుడైనా అనిపించిందా?`,
        ta: `சுய பரிசோதனை: 'என் அமைதியான குணத்தை மற்றவர்கள் பலவீனம் என நினைக்கிறார்களா?' என்று எப்போதாவது எண்ணியதுண்டா?`,
        en: `Pause & Check: Have people ever mistaken your calm silence for weakness—only to be stunned when you finally drew a firm line?`,
      },
      badge: { kn: "ಪಂಚಭೂತ ಸತ್ಯ", mr: "पंचतत्त्व सत्य", hi: "अंतर्मन का सत्य", te: "పంచభూత నిజం", ta: "பஞ்சபூத உண்மை", en: "3 Inner Truths" },
      anchors: [`${dominantElement}`, `${lagnaRashiName}`],
    },

    // CHAPTER 6 — Yogi vs Avayogi Story (Life Shortcut without Rituals)
    {
      n: 6, sec: 1, secTitle: sec1, icon: "✨", visual: "sav-pillars",
      title: {
        kn: "ಯೋಗಿ ಗ್ರಹದ ನಿಧಿ & ಅವಯೋಗಿ ಎಚ್ಚರಿಕೆ: ದಕ್ಷಿಣ ಭಾರತದ ರಹಸ್ಯ",
        mr: "योगी ग्रहाची किल्ली व अवयोगी सावधता: यशाचे गुप्त सूत्र",
        hi: "योगी ग्रह की शक्ति एवं अवयोगी सतर्कता: गुप्त सफलता सूत्र",
        te: "యోగి గ్రహ రహస్యం & అవయోగి జాగ్రత్త: అదృష్టపు తాళం",
        ta: "யோகி கிரகத்தின் ரகசியம் & அவயோகி எச்சரிக்கை",
        en: "The Yogi Advantage & Avayogi Trap — Your Hidden Shortcut",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಯಾಕೋ ಕೆಲವು ದಿನ ಪ್ರಯತ್ನ ಕಡಿಮೆಯಿದ್ದರೂ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ, ಮತ್ತೆ ಕೆಲವು ದಿನ ಎಷ್ಟೇ ಕಷ್ಟಪಟ್ಟರೂ ತಡೆ ಬರುತ್ತದೆ ಏಕೆ?`,
        mr: `प्रश्न: ${devoteeName}, काही दिवसांत कमी कष्टात मोठे यश मिळते, तर काही विशिष्ट दिवशी काम का अडते?`,
        hi: `प्रश्न: ${devoteeName}, क्यों कुछ दिनों में कम प्रयास से बड़ी सफलता मिलती है और कुछ विशेष क्षणों में अचानक रुकावट आती है?`,
        te: `ప్రశ్న: ${devoteeName}, కొన్నిసార్లు తక్కువ శ్రమతోనే పనులు జరిగిపోవడం, మరికొన్ని సార్లు ఎంత కష్టపడినా ఆలస్యమవడం ఎందుకు జరుగుతుంది?`,
        ta: `கேள்வி: ${devoteeName}, சில நாட்களில் குறைந்த முயற்சியில் பெரிய வெற்றி கிடைப்பதும், சில நாட்களில் எவ்வளவு முயன்றாலும் தடை வருவதும் ஏன்?`,
        en: `Question: ${devoteeName}, why do certain days effortlessly open locked doors while other days drain your momentum?`,
      },
      p1: {
        kn: `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಅತಿ ದೊಡ್ಡ ಗುಪ್ತ ಆಸ್ತಿಯೇ ಯೋಗಿ '${yogiPlanetName}'! ಪ್ರತಿಯೊಬ್ಬರ ಬದುಕಲ್ಲೂ ಒಂದು 'ಗಾಳಿ ಬೀಸುವ ದಿಕ್ಕು' ಇರುತ್ತದೆ — ನೀವು ${localizedYogiDay} ಅಥವಾ '${localizedYogiDirection}' ದಿಕ್ಕಿನ ಸಂಪರ್ಕದಲ್ಲಿ ಪ್ರಮುಖ ಮಾತುಕತೆ, ಹೆಜ್ಜೆ ಅಥವಾ ಕೆಲಸ ಕೈಗೊಂಡಾಗ ಅದು ಅನಿರೀಕ್ಷಿತ ಬೆಂಬಲ ತರುತ್ತದೆ.`,
        mr: `तुमच्या कुंडलीतील सर्वात मोठी गुप्त ताकद म्हणजे योगी '${yogiPlanetName}'! ज्याप्रमाणे वाऱ्याची एक अनुकूल दिशा असते, त्याचप्रमाणे ${localizedYogiDay} किंवा '${localizedYogiDirection}' दिशेच्या सुसंगतीत केलेली कामे कमी श्रमात यशस्वी होतात.`,
        hi: `आपकी कुंडली की सबसे बड़ी गुप्त पूंजी योगी '${yogiPlanetName}' हैं! जब भी आप ${localizedYogiDay} के दिन या '${localizedYogiDirection}' की सकारात्मक दिशा में अपने प्रमुख निर्णय आगे बढ़ाते हैं, तो परिस्थितियां स्वतः आपका साथ देती हैं।`,
        te: `మీ జాతకంలో దాగి ఉన్న అసలైన నిధి యోగి '${yogiPlanetName}'! ప్రతి ఒక్కరికీ ఒక అనుకూల వేగం ఉంటుంది—మీరు ${localizedYogiDay} రోజున లేదా '${localizedYogiDirection}' దిశకు సంబంధించిన పనుల్లో ముందుకెళ్ళినప్పుడు తక్కువ కష్టంతోనే అద్భుత ఫలితం వస్తుంది.`,
        ta: `உங்கள் ஜாதகத்தின் மிகப்பெரிய ரகசியப் பொக்கிஷம் யோகி '${yogiPlanetName}'! நீங்கள் ${localizedYogiDay} அன்றோ அல்லது '${localizedYogiDirection}' திசை சார்ந்த முயற்சிகளிலோ இறங்கும்போது எதிர்பாராத ஆதரவும் வெற்றியும் இயல்பாகக் கிடைக்கும்.`,
        en: `Behind the scenes of your chart runs a secret multiplier: your Yogi planet ${yogiPlanetName}. Notice the rhythm—when you schedule important steps on ${localizedYogiDay} or orient your workspace facing ${localizedYogiDirection}, opportunities click cleanly without exhausting chases.`,
      },
      p2: {
        kn: `ಇದರ ವಿರುದ್ಧ ತಿರುವೇ '${avayogiPlanetName}' (ಅವಯೋಗಿ) ಜಾಲ! ${isChildOrInfant ? "ಮಗುವಿನ ಶಿಕ್ಷಣ ಮತ್ತು ಉಳಿತಾಯ ಯೋಜನೆಗಳಲ್ಲಿ ಕುಟುಂಬವು ಆತುರದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳದೆ" : "ನೀವು ಆತುರದಿಂದ ಬೇರೆಯವರ ಮಾತಿನ ಒತ್ತಡಕ್ಕೆ ಸಿಲುಕಿ ಹಣ ಅಥವಾ ಸಮಯ ಕೊಡುವಾಗಲೆಲ್ಲಾ"} ಅದು ಈ ತಪ್ಪು ಸಮಯದ ಪ್ರಭಾವದಿಂದಲೇ ಘಟಿಸಿದೆ. ಈ ಒಂದು ವ್ಯತ್ಯಾಸ ತಿಳಿದರೆ ಅರ್ಧದಷ್ಟು ತಪ್ಪುಗಳು ತಪ್ಪುತ್ತವೆ.`,
        mr: `याचा उलटा कोपरा म्हणजे '${avayogiPlanetName}'चा सावध टप्पा! ${isChildOrInfant ? "मुलाच्या भविष्यासाठी कोणतेही मोठे आर्थिक पाऊल घाईत न घेता" : "जेव्हा जेव्हा तुम्ही दबावाखाली घाईने निर्णय घेतले किंवा कोणाला पैसा उधार दिला"}, तेव्हा या प्रतिकूल वेळेचा फटका बसला.`,
        hi: `इसका विपरीत मोड़ '${avayogiPlanetName}' की परीक्षा है! ${isChildOrInfant ? "बच्चे की शिक्षा और सुरक्षा को लेकर जल्दबाजी से बचें।" : "जब भी आपने दबाव या जल्दबाजी में कोई बड़ा आर्थिक वादा किया"}, तब इसी विपरीत घड़ी ने काम उलझाया।`,
        te: `దీనికి వ్యతిరేక కోణం '${avayogiPlanetName}' హెచ్చరిక! ${isChildOrInfant ? "పిల్లల చదువు లేదా భవిష్యత్ ప్రణాళికల్లో తొందరపాటు లేకుండా" : "ఎప్పుడైనా మీరు ఒత్తిడిలో తొందరపడి నిర్ణయాలు తీసుకున్నప్పుడు"} ఈ వ్యతిరేక ప్రభావం అడ్డంకులు తెచ్చింది.`,
        ta: `இதன் மறுபக்கம் '${avayogiPlanetName}' எச்சரிக்கை! ${isChildOrInfant ? "குழந்தையின் கல்வி திட்டங்களில் அவசர முடிவுகளைத் தவிர்த்து" : "நீங்கள் அவசரப்பட்டு அல்லது பிறர் வற்புறுத்தலால் முடிவு எடுத்த போதெல்லாம்"} இந்த எதிர் ஆற்றல் தடையை உருவாக்கியது.`,
        en: `Now here is the contrast most people miss: the opposite frequency (${avayogiPlanetName}) creates sneaky friction whenever you act out of urgency, peer pressure, or guilt. Learning to move on your high-tide days instead of forcing locked days doubles your results with half the fatigue.`,
      },
      p3: {
        kn: `ಸರಳ ಜೀವನ ತಂತ್ರ: ${isChildOrInfant ? `${localizedYogiDay}ರಂದು ಮಗುವಿಗೆ ಹೊಸ ಪುಸ್ತಕ, ಕಲೆ ಅಥವಾ ಕಲಿಕೆಯ ಆರಂಭ ಮಾಡಿಸಿ.` : `ಮುಖ್ಯ ಹಣಕಾಸು ಹೆಜ್ಜೆ, ಹೂಡಿಕೆ ಅಥವಾ ಪ್ರಮುಖ ಸಂದರ್ಶನಗಳಿಗೆ '${localizedYogiDay}' ಆಯ್ಕೆ ಮಾಡಿ; '${localizedYogiColor}' ಬಣ್ಣದ ಉಡುಪು ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ತಕ್ಷಣ ಹೆಚ್ಚಿಸುತ್ತದೆ.`}`,
        mr: `सोपे धोरण: ${isChildOrInfant ? `${localizedYogiDay} रोजी मुलांच्या वाचन व कलागुणांचा नवा अभ्यास सुरू करा.` : `महत्त्वाच्या बैठका, नवीन करार व बचतीचे निर्णय '${localizedYogiDay}' या दिवशी घ्या; '${localizedYogiColor}' रंग तुमचा आत्मविश्वास वाढवेल.`}`,
        hi: `सरल जीवन नीति: ${isChildOrInfant ? `${localizedYogiDay} को बालक की नई पुस्तक या सीखने का आरंभ कराएं।` : `प्रमुख बातचीत, बचत एवं निर्णय '${localizedYogiDay}' को रखें; '${localizedYogiColor}' रंग आपका आत्मबल बढ़ाता है।`}`,
        te: `సులభమైన వ్యూహం: ${isChildOrInfant ? `${localizedYogiDay} నాడు చిన్నారితో కొత్త ఆటలు లేదా పుస్తకాలు మొదలుపెట్టండి.` : `కీలక ఆర్థిక చర్చలు మరియు కొత్త ప్రయత్నాలు '${localizedYogiDay}' నాడు ప్రారంభించండి; '${localizedYogiColor}' రంగు మీ ఆత్మవిశ్వాసాన్ని పెంచుతుంది.`}`,
        ta: `எளிய வாழ்வியல் உத்தி: ${isChildOrInfant ? `${localizedYogiDay} அன்று குழந்தையின் புதிய கற்றல் பழக்கத்தைத் தொடங்குங்கள்.` : `முக்கிய சந்திப்புகள் மற்றும் பண முடிவுகளை '${localizedYogiDay}' அன்று திட்டமிடுங்கள்; '${localizedYogiColor}' நிறம் உங்கள் தன்னம்பிக்கையைக் கூட்டும்.`}`,
        en: `Simple everyday leverage: ${isChildOrInfant ? `introduce joyful new books or creative skills to the child on ${localizedYogiDay}.` : `schedule important conversations, pitches, and savings allocations on ${localizedYogiDay}, and wear touches of ${localizedYogiColor} when stepping into high-stakes rooms.`}`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಬಂದ ದೊಡ್ಡ ಶುಭ ಸುದ್ದಿ ಅಥವಾ ಲಾಭಗಳಲ್ಲಿ ಹೆಚ್ಚಿನವು ಯಾವ ವಾರ ಅಥವಾ ಯಾವ ಸಂದರ್ಭದಲ್ಲಿ ಬಂದಿವೆ ಎಂದು ಗಮನಿಸಿ ನೋಡಿ!`,
        mr: `स्व-परीक्षण: तुमच्या आयुष्यातील बहुतेक चांगल्या बातम्या आणि संधी आठवड्याच्या कोणत्या दिवशी आल्या आहेत याचा कधी विचार केला आहे का?`,
        hi: `स्वयं-निरीक्षण: क्या आपने कभी ध्यान दिया है कि जीवन की अधिकांश खुशखबरी किस विशेष दिन या मूड में मिली हैं?`,
        te: `మిమ్మల్ని మీరు అడుగండి: మీ జీవితంలో జరిగిన ముఖ్యమైన శుభవార్తలు ఎక్కువగా ఏ రోజున వచ్చాయో ఎప్పుడైనా గమనించారా?`,
        ta: `சுய பரிசோதனை: உங்கள் வாழ்வில் நடந்த முக்கிய நற்செய்திகள் அதிகம் எந்தக் கிழமையில் வந்தன என்பதை கவனித்துப் பாருங்கள்!`,
        en: `Pause & Check: Think back to three happiest turning points of your life—check how many landed right near ${localizedYogiDay} or when your head was calm and clear.`,
      },
      badge: { kn: "ಯೋಗಿ ರಹಸ್ಯ", mr: "योगी कळस", hi: "योगी सूत्र", te: "యోగి సూత్రం", ta: "யோகி சூத்திரம்", en: "Yogi Edge" },
      anchors: [`${yogiPlanetName}`, `${localizedYogiDay}`],
    },
  ];

  // Add Chapters 7 to 11 (Section 2: Moving Forces)
  list.push(
    {
      n: 7, sec: 2, secTitle: sec2, icon: "⏳", visual: "timeline-meter",
      title: {
        kn: `ಪ್ರಸ್ತುತ ಮಹಾದಶೆ – ಅಂತರ್ದಶೆ (${currentMahadasha} – ${currentBhuktiLord}) ವಾಸ್ತವ`,
        mr: `चालू महादशा – अंतर्दशा (${currentMahadasha} – ${currentBhuktiLord}) वास्तव`,
        hi: `वर्तमान महादशा – अंतर्दशा (${currentMahadasha} – ${currentBhuktiLord}) यथार्थ`,
        te: `ప్రస్తుత మహర్దశ – అంతర్దశ (${currentMahadasha} – ${currentBhuktiLord}) వాస్తవం`,
        ta: `நடப்பு மகாதசை – அந்தர்தசை (${currentMahadasha} – ${currentBhuktiLord}) உண்மை`,
        en: `Active Dasha Reality — Inside the ${currentMahadasha}–${currentBhuktiLord} Chapter`,
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈಗ ನಡೆಯುತ್ತಿರುವ ${currentMahadasha} – ${currentBhuktiLord} ಅವಧಿಯು ${n(bhuktiEndDate)}ರವರೆಗೆ ನಿಮ್ಮ ಬದುಕನ್ನು ಎಲ್ಲಿಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, सध्याची ${currentMahadasha} – ${currentBhuktiLord} दशा ${n(bhuktiEndDate)} पर्यंत तुमच्या आयुष्याला कोणती नवी दिशा देत आहे?`,
        hi: `प्रश्न: ${devoteeName}, वर्तमान ${currentMahadasha} – ${currentBhuktiLord} दशा ${n(bhuktiEndDate)} तक आपके जीवन को किस नए मोड़ पर ले जा रही है?`,
        te: `ప్రశ్న: ${devoteeName}, ప్రస్తుత ${currentMahadasha} – ${currentBhuktiLord} దశ ${n(bhuktiEndDate)} వరకు మీ జీవితాన్ని ఎటువైపు నడిపిస్తోంది?`,
        ta: `கேள்வி: ${devoteeName}, நடப்பு ${currentMahadasha} – ${currentBhuktiLord} தசை ${n(bhuktiEndDate)} வரை உங்கள் வாழ்வை எந்தத் திசையில் நகர்த்துகிறது?`,
        en: `Question: ${devoteeName}, what hidden story is your active ${currentMahadasha}–${currentBhuktiLord} cycle writing through ${bhuktiEndDate}?`,
      },
      p1: {
        kn: `ಮೊದಲು ಮಹಾದಶೆ ಮತ್ತು ಭುಕ್ತಿ ಎಂದರೆ ಏನು ಎಂದು ಸರಳವಾಗಿ ನೋಡೋಣ: ನಿಮ್ಮ ಜೀವನವನ್ನು ಒಂದು ದೊಡ್ಡ ಸಿನಿಮಾ ಅಥವಾ ದೀರ್ಘ ಪಯಣ ಎಂದುಕೊಂಡರೆ, 'ಮಹಾದಶೆ' ಎಂದರೆ ಹಲವು ವರ್ಷಗಳ ಕಾಲ ನಡೆಯುವ ಮುಖ್ಯ ಋತು ಹಾಗೂ 'ಭುಕ್ತಿ (ಅಂತರ್ದಶೆ)' ಎಂದರೆ ಆ ಋತುವಿನೊಳಗೆ ಈ ಕ್ಷಣ ಕ್ಯಾಮೆರಾ ಹಿಡಿದಿರುವ ನಿರ್ದೇಶಕ! ಸದ್ಯಕ್ಕೆ ನಿಮಗೆ '${currentMahadasha}' ಮಹಾದಶೆ ಹಾಗೂ '${currentBhuktiLord}' ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದ್ದು, ಇಬ್ಬರೂ ಸೇರಿ ನಿಮ್ಮನ್ನು ಕೇವಲ ಕನಸು ಕಾಣುವ ಹಂತದಿಂದ ನಿಜವಾದ ಕಟ್ಟಡ ಕಟ್ಟುವ ಹಂತಕ್ಕೆ ಕರೆದೊಯ್ಯುತ್ತಿದ್ದಾರೆ.${isDashaSandhi ? " ವಿಶೇಷವಾಗಿ ನೀವೀಗ ಒಂದು ದಶಾ ಸಂಧಿ (ತಿರುವಿನ ಗಡಿ)ಯಲ್ಲಿರುವುದರಿಂದ ಹಳೆಯ ಅಭ್ಯಾಸಗಳು ಕಳಚಿಹೋಗುತ್ತಿವೆ." : ""}`,
        mr: `सर्वप्रथम महादशा व भुक्ती म्हणजे काय हे सोप्या शब्दांत पहा: आयुष्य हा एक मोठा प्रवास मानला तर 'महादशा' म्हणजे अनेक वर्षे चालणारा मुख्य काळ आणि 'भुक्ती' म्हणजे त्या काळातील सध्याचा सक्रिय मार्गदर्शक! सध्या तुमची '${currentMahadasha}' महादशा व '${currentBhuktiLord}' भुक्ती सुरू असून ती तुम्हाला केवळ विचारांतून ठोस प्रत्यक्ष कृतीकडे नेत आहे.${isDashaSandhi ? " सध्या तुम्ही दशा-संधीच्या उंबरठ्यावर असल्याने जुन्या सवयी गळून पडत आहेत." : ""}`,
        hi: `सबसे पहले सरल शब्दों में समझें कि महादशा और भुक्ति क्या हैं: यदि जीवन एक लंबी यात्रा है, तो 'महादशा' वर्षों तक चलने वाला मुख्य मौसम है और 'भुक्ति (अंतर्दशा)' उस मौसम के भीतर अभी निर्णय लेने वाला मुख्य निर्देशक! वर्तमान में आपकी '${currentMahadasha}' महादशा एवं '${currentBhuktiLord}' भुक्ति चल रही है, जो आपको कल्पना से निकालकर ठोस निर्माण की ओर ले जा रही है।${isDashaSandhi ? " चूंकि आप दशा-संधि की दहलीज पर हैं, इसलिए पुराने ढर्रे अब अपने आप छूट रहे हैं।" : ""}`,
        te: `ముందుగా మహర్దశ మరియు భుక్తి అంటే ఏమిటో సులభంగా చూద్దాం: జీవితాన్ని ఒక సుదీర్ఘ ప్రయాణంగా చూస్తే, 'మహర్దశ' అంటే కొన్నేళ్లపాటు నడిచే ప్రధాన కాలం, 'భుక్తి (అంతర్దశ)' అంటే అందులో ఇప్పుడు ఫలితాలనిచ్చే సబ్-కెప్టెన్! ప్రస్తుతం మీకు '${currentMahadasha}' మహర్దశ & '${currentBhuktiLord}' భుక్తి నడుస్తూ మిమ్మల్ని ఆలోచనల నుండి ఆచరణాత్మక నిర్మాణం వైపు నడిపిస్తోంది.${isDashaSandhi ? " మీరు దశా-సంధి మలుపులో ఉండటం వల్ల పాత పరిస్థితులు పూర్తిగా మారుతున్నాయి." : ""}`,
        ta: `முதலில் மகாதசை மற்றும் புக்தி என்றால் என்ன என்று எளிமையாகப் பார்ப்போம்: வாழ்க்கை ஒரு நீண்ட பயணம் என்றால், 'மகாதசை' என்பது பல ஆண்டுகள் நீடிக்கும் முக்கிய பருவம்; 'புக்தி' என்பது அதற்குள் இப்போது செயல்படும் துணை இயக்குநர்! தற்போது உங்களுக்கு '${currentMahadasha}' மகாதசை & '${currentBhuktiLord}' புக்தி நடப்பதால் வெறும் சிந்தனையிலிருந்து உறுதியான செயல்பாட்டுக்கு நகர்கிறீர்கள்.${isDashaSandhi ? " இப்போது தசா-சந்தி வாசலில் இருப்பதால் பழைய நடைமுறைகள் மெல்ல விலகுகின்றன." : ""}`,
        en: `First, what are Mahadasha and Bhukti in plain life terms? Think of Mahadasha as the multi-year main season of your story, while Bhukti (Antardasha) is the co-director guiding everyday scenes inside that season! Right now your chart runs ${currentMahadasha} Mahadasha paired with ${currentBhuktiLord} Bhukti through ${bhuktiEndDate}, shifting you out of wishful planning into tangible creation.${isDashaSandhi ? " Because you stand right near a chapter transition seam, old routines feel noticeably outgrown." : ""}`,
      },
      p2: {
        kn: `ಈ ಅಧ್ಯಾಯದ ಅಚ್ಚರಿ ಏನೆಂದರೆ: ${n(bhuktiEndDate)}ರವರೆಗಿನ ಸಮಯದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಹಳೆಯ ಪರಿಚಯಸ್ಥರು, ಬಾಕಿ ಉಳಿದಿದ್ದ ಅವಕಾಶಗಳು ಅಥವಾ ಅರ್ಧಕ್ಕೆ ಬಿಟ್ಟಿದ್ದ ವಿದ್ಯೆ/ಯೋಜನೆಗಳು ಹೊಸ ರೂಪದಲ್ಲಿ ಮರಳಿ ಬರುತ್ತವೆ! ಯಾವುದನ್ನು ನೀವು 'ಮುಗಿದ ಅಧ್ಯಾಯ' ಅಂದುಕೊಂಡಿದ್ದಿರೋ ಅಲ್ಲಿಂದಲೇ ಹೊಸ ಲಾಭ ಶುರುವಾಗಲಿದೆ.`,
        mr: `या टप्प्याचे आश्चर्य असे की: ${n(bhuktiEndDate)} पर्यंत अनपेक्षितपणे जुनी ओळख, रखडलेली संधी किंवा मागे सुटलेले काम नव्या स्वरूपात परत येऊ शकते! ज्याला तुम्ही संपलेला विषय समजत होता, तिथूनच नवी वाट उघडेल.`,
        hi: `इस चरण का सबसे बड़ा सरप्राइज़ यह है कि ${n(bhuktiEndDate)} से पहले कोई पुराना संपर्क, छूटा हुआ अवसर या अधूरी योजना नए रूप में लौटकर सामने आएगी—जहां से आपने उम्मीद छोड़ी थी, वहीं से नया मोड़ आएगा।`,
        te: `ఇందులోని ఆశ్చర్యం ఏమిటంటే: ${n(bhuktiEndDate)} నాటికి అనుకోకుండా పాత పరిచయం, ఆగిపోయిన అవకాశం లేదా మీరు ఆశ వదులుకున్న అంశమే కొత్త రూపంలో తిరిగి మీ ముందుకు వస్తుంది!`,
        ta: `இக்காலத்தின் சுவாரஸ்யம்: ${n(bhuktiEndDate)}-க்குள் பழைய தொடர்பு, விடுபட்ட வாய்ப்பு அல்லது முடிந்ததாக நினைத்த விஷயமே புதிய வடிவில் திரும்பி வந்து நன்மை சேர்க்கும்!`,
        en: `The plot twist of this window leading to ${bhuktiEndDate}: something you thought was finished—an old skill, dormant connection, or paused goal—walks back into your story in a stronger form.`,
      },
      p3: {
        kn: `ನಿಮ್ಮ ಚತುರ ನಡೆ: ಒಂದೇ ದಿನದಲ್ಲಿ ಫಲಿತಾಂಶ ಬಯಸಬೇಡಿ; ಹಂತ-ಹಂತವಾಗಿ ನಿರ್ಮಿಸುವುದರಲ್ಲಿ ಈ ದಶೆ ನಿಮಗೆ ಅಗಾಧ ಗೆಲುವು ತರುತ್ತದೆ. ನಿಯಮಿತ ಸಮಯಪಾಲನೆ ಮತ್ತು ಮಾತು ಉಳಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ವೇಗವನ್ನು ದ್ವಿಗುಣಗೊಳಿಸುತ್ತದೆ.`,
        mr: `चतुर धोरण: एका रात्रीत जादूची अपेक्षा ठेवू नका; सातत्याने घेतलेले छोटे टप्पे या दशेत तुम्हाला अफाट यश मिळवून देतील.`,
        hi: `सटीक रणनीति: रातों-रात परिणाम न खोजें; इस दशा में नियमबद्ध और धैर्यपूर्ण कदम ही सबसे बड़ी जीत दिलाते हैं।`,
        te: `సరైన అడుగు: ఒక్కరోజులో మార్పు కోరుకోకండి; క్రమశిక్షణతో వేసే చిన్న అడుగులే ఈ దశలో పెద్ద విజయాన్నిస్తాయి.`,
        ta: `புத்திசாலித்தனமான வழி: ஒரே நாளில் பலனை எதிர்பார்க்காமல் தொடர்ச்சியான சிறிய முயற்சிகளைச் செய்தால் இந்த தசை உச்சத்தைத் தரும்.`,
        en: `Play this phase cleanly: stop demanding overnight fireworks—this chapter heavily rewards steady execution, kept promises, and finishing what you start.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಕಳೆದ ಕೆಲವು ವಾರಗಳಲ್ಲಿ 'ಅರೇ, ಈ ವಿಷಯ ಮರೆತೇ ಹೋಗಿತ್ತು, ಮತ್ತೆ ಹೇಗೆ ಕಣ್ಮುಂದೆ ಬಂತು!' ಎನಿಸಿದ ಅನುಭವ ನಿಮಗಾಯಿತೇ?`,
        mr: `स्व-परीक्षण: अलीकडेच एखादी जुनी गोष्ट किंवा ओळखीची व्यक्ती अचानक आठवणीत किंवा संपर्कात परत आल्याचे जाणवले का?`,
        hi: `स्वयं-निरीक्षण: क्या हाल ही में कोई पुराना सपना या भूला हुआ संपर्क अचानक फिर से आपके सामने आया है?`,
        te: `మిమ్మల్ని మీరు అడుగండి: ఇటీవల మీరు మర్చిపోయిన పాత ఆలోచన లేదా వ్యక్తి మళ్ళీ అనుకోకుండా తారసపడ్డారా?`,
        ta: `சுய பரிசோதனை: சமீபத்தில் நீங்கள் மறந்திருந்த பழைய யோசனையோ நபரோ எதிர்பாராமல் மீண்டும் உங்கள் முன் வந்தார்களா?`,
        en: `Pause & Check: Has an old contact, hobby, or abandoned idea unexpectedly crossed your path again in the last 30 days?`,
      },
      badge: { kn: "ಕಾಲಚಕ್ರ ವೇಗ", mr: "दशा वेग", hi: "दशा गति", te: "దశా గమనం", ta: "தசா வேகம்", en: "Cycle Pulse" },
      anchors: [`${currentMahadasha}`, `${n(bhuktiEndDate)}`],
    },
    {
      n: 8, sec: 2, secTitle: sec2, icon: "🪐", visual: "timeline-meter",
      title: {
        kn: `ಶನಿ ಗೋಚಾರ ವಾಸ್ತವ (${shaniTransitRashi}): ಕಠಿಣ ಶಿಸ್ತು & ಶಾಶ್ವತ ನಿರ್ಮಾಣ`,
        mr: `शनी गोचर वास्तव (${shaniTransitRashi}): शिस्तीतून भक्कम उभारणी`,
        hi: `शनि गोचर यथार्थ (${shaniTransitRashi}): अनुशासन से स्थायी निर्माण`,
        te: `శని గోచార వాస్తవం (${shaniTransitRashi}): క్రమశిక్షణతో శాశ్వత విజయం`,
        ta: `சனி பெயர்ச்சி உண்மை (${shaniTransitRashi}): ஒழுக்கத்தால் நிலைத்த வெற்றி`,
        en: `Saturn's Real Lesson (${shaniTransitRashi}) — Why Shortcuts Failed`,
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಶನಿ ಸಂಚಾರವು ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಾ ನಿಮ್ಮ ಬದುಕಿನಲ್ಲಿ ಯಾವ ಗಟ್ಟಿ ಕಟ್ಟಡವನ್ನು ಕಟ್ಟುತ್ತಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, शनीची ही चाल तुमचा संयम तपासत आयुष्यात कोणती पक्की पायाभरणी करत आहे?`,
        hi: `प्रश्न: ${devoteeName}, शनि का यह गोचर आपके धैर्य की परीक्षा लेते हुए कौन सी स्थायी नींव तैयार कर रहा है?`,
        te: `ప్రశ్న: ${devoteeName}, శని సంచారం మీ సహనాన్ని పరీక్షిస్తూ ఎలాంటి శాశ్వత పునాదిని నిర్మిస్తోంది?`,
        ta: `கேள்வி: ${devoteeName}, சனியின் பெயர்ச்சி உங்கள் பொறுமையைச் சோதித்து எந்த உறுதியான அடித்தளத்தைக் கட்டுகிறது?`,
        en: `Question: ${devoteeName}, what fake support is Saturn pruning away—and what unbreakable foundation is taking its place?`,
      },
      p1: {
        kn: `${shaniTransitRashi} ಮೂಲಕ ಚಲಿಸುತ್ತಿರುವ ಶನಿ ಸ್ವಭಾವ ಬಹಳ ನೇರ: ಇದು ಕಾಗದದ ಮೇಲಿನ ಟೊಳ್ಳು ಯೋಜನೆಗಳಿಗೆ ಒಪ್ಪುವುದಿಲ್ಲ. ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಸುಲಭದ ದಾರಿಗಳನ್ನು ಮುಚ್ಚಿ 'ಸ್ವಂತ ಶ್ರಮದಿಂದ ಮಾತ್ರ ಗೆಲ್ಲಬೇಕು' ಎಂಬ ನಿಜವಾದ ಸತ್ಯವನ್ನು ಕಲಿಸಿದೆ.`,
        mr: `${shaniTransitRashi} मधून जाणारा शनी कधीही पोकळ आश्वासनांना थारा देत नाही. तुमच्या चंद्रापासून ${n(shaniHouseFromMoon)}व्या स्थानात राहून त्याने सोपे वाटणारे चुकीचे मार्ग बंद केले आणि स्वतःच्या ताकदीवर उभे राहायला शिकवले.`,
        hi: `${shaniTransitRashi} से गुज़रते हुए शनि कभी खोखले वादों का साथ नहीं देते। आपकी राशि से ${n(shaniHouseFromMoon)}वें स्थान पर रहते हुए इसने अस्थायी सहारे हटाकर आपको आत्मनिर्भर बनाया है।`,
        te: `${shaniTransitRashi} లో సంచరిస్తున్న శని బలహీనమైన వాటిని ఉంచదు. మీ రాశి నుండి ${n(shaniHouseFromMoon)}వ స్థానంలో ఉండి సులభమైన దారులను మూసివేసి, స్వశక్తితో ఎదగడం నేర్పింది.`,
        ta: `${shaniTransitRashi} வழியாகச் செல்லும் சனி போலியான வழிகளை அனுமதிக்காது. உங்கள் ராசிக்கு ${n(shaniHouseFromMoon)}-ம் இடத்தில் இருந்து குறுக்கு வழிகளை அடைத்து, சுய உழைப்பின் பலத்தை உணர்த்தியது.`,
        en: `Saturn transiting ${shaniTransitRashi} operates like an honest architect: it hates flimsy shortcuts. Sitting in House ${shaniHouseFromMoon} from your Moon, it quietly dismantled unreliable crutches so you would discover how capable you actually are alone.`,
      },
      p2: {
        kn: `ಆಶ್ಚರ್ಯಕರ ತಿರುವು: ಯಾರು ನಿಮ್ಮೊಂದಿಗೆ 'ಕೇವಲ ಲಾಭ ಇದ್ದಾಗ' ಮಾತ್ರ ಇದ್ದರೋ ಅವರನ್ನು ಶನಿ ಈಗಾಗಲೇ ದೂರ ಸರಿಸಿದೆ! ಈಗ ಉಳಿದಿರುವ ಸಣ್ಣ ಬಳಗ ಹಾಗೂ ನೀವು ಕಟ್ಟಿದ ಅನುಭವ ಮುಂದಿನ ೧೦ ವರ್ಷಗಳವರೆಗೆ ಯಾರೂ ಅಲುಗಾಡಿಸಲಾಗದ ಕೋಟೆಯಾಗಲಿದೆ.`,
        mr: `यामागील मोठा ट्विस्ट: केवळ स्वार्थासाठी जवळ असणारे लोक शनीने स्वतःहूनच बाजूला केले आहेत! आता उरलेली मोजकी माणसे आणि तुमचा अनुभव पुढच्या १० वर्षांसाठी तुमचा अभेद्य किल्ला ठरणार आहेत.`,
        hi: `बड़ा मोड़ यही है: जो लोग केवल अपने स्वार्थ के लिए साथ थे, उन्हें इस समय ने स्वयं ही दूर कर दिया! अब जो चुनिंदा लोग और अनुभव आपके पास बचे हैं, वही अगले १० वर्षों का आपका अभेद्य दुर्ग हैं।`,
        te: `ఆశ్చర్యకరమైన మలుపు: స్వార్థంతో ఉన్నవారిని ఇది ఇప్పటికే మీ నుండి దూరం చేసింది! ఇప్పుడు మీ వద్ద మిగిలిన నిజాయితీగల మనుషులు, మీ అనుభవమే రాబోయే పదేళ్ల పాటు మిమ్మల్ని కాపాడే కోట.`,
        ta: `இதன் ஆச்சரிய திருப்பம்: சுயநலத்திற்காக உடன் இருந்தவர்களைச் சனி தானாகவே விலக்கிவிட்டது! இப்போது உங்களுடன் நிற்கும் உண்மையான சிலரும் உங்கள் அனுபவமுமே அடுத்த 10 ஆண்டுகளுக்கான கோட்டை.`,
        en: `Here is the hidden favor inside Saturn's strictness: it filtered out fair-weather company early. What survives a Saturn phase—skills, real friends, and self-respect—stays rock-solid for an entire decade.`,
      },
      p3: {
        kn: `ಈಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿರುವ ಅಸ್ತ್ರ: ಕೆಲಸವನ್ನು ಮುಂದೂಡಬೇಡಿ, ಸಮಯಕ್ಕೆ ಬೆಲೆ ಕೊಡಿ ಮತ್ತು ವಯಸ್ಸಾದವರಿಗೆ ಹಾಗೂ ಶ್ರಮಜೀವಿಗಳಿಗೆ ಗೌರವದಿಂದ ನಡೆದುಕೊಳ್ಳಿ — ಶನಿ ಮೆಚ್ಚುವ ಏಕೈಕ ಗುಣ ಪ್ರಾಮಾಣಿಕ ಶ್ರಮ.`,
        mr: `पुढील यशोमार्ग: कोणतेही काम पुढे ढकलू नका, वेळेचा आदर करा आणि कष्टकरी व्यक्तींशी सन्मानाने वागा — प्रामाणिक परिश्रम हाच खरा विजय आहे.`,
        hi: `सफलता की कुंजी: कार्यों को टालें नहीं, समय के पाबंद रहें और मेहनतकश लोगों का सम्मान करें—ईमानदार कर्म ही सबसे बड़ी शक्ति है।`,
        te: `మీ బలమైన ఆయుధం: పనులను వాయిదా వేయకండి, సమయపాలన పాటించండి మరియు కష్టపడేవారిని గౌరవించండి—నిజాయితీగల శ్రమే విజయానికి మూలం.`,
        ta: `உங்கள் வெற்றிக்கான சாவி: வேலைகளைத் தள்ளிப் போடாதீர்கள், நேரத்தை மதித்து உழைப்பாளர்களைக் கௌரவியுங்கள்—நேர்மையான உழைப்பே சனியின் அருள்.`,
        en: `Your winning edge: drop procrastination, keep deadlines sacred, and treat people doing hard unglamorous work with genuine warmth—integrity compounds fastest under Saturn.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ಹಿಂದೆ ಕಷ್ಟ ಎನಿಸಿದ ಆ ಶಿಸ್ತು ಈಗ ನನ್ನನ್ನು ಎಷ್ಟು ಗಟ್ಟಿ ಮಾಡಿದೆ' ಎಂದು ಕನಿಷ್ಠ ಒಂದು ವಿಷಯವನ್ನಾದರೂ ನೆನಪಿಸಿಕೊಳ್ಳಬಲ್ಲಿರಾ?`,
        mr: `स्व-परीक्षण: 'पूर्वी कठीण वाटलेल्या त्या वेळेने मला आज किती मजबूत बनवले' अशी एक गोष्ट आठवते का?`,
        hi: `स्वयं-निरीक्षण: क्या आप ऐसी कम से कम एक बात याद कर सकते हैं जिसने पहले रुलाया, पर आज उसी ने आपको सबसे समझदार बनाया?`,
        te: `మిమ్మల్ని మీరు అడుగండి: ఒకప్పుడు కష్టంగా అనిపించిన ఏ అనుభవం మిమ్మల్ని నేడు ఎంతో బలంగా మార్చిందో గుర్తుందా?`,
        ta: `சுய பரிசோதனை: முன்பு கடினமாகத் தெரிந்த எந்த அனுபவம் இன்று உங்களை மிகவும் வலிமையானவராக மாற்றியுள்ளது என்பதை நினைத்துப் பாருங்கள்!`,
        en: `Pause & Check: Name one hard discipline you resisted a year ago that you are secretly proud of mastering today.`,
      },
      badge: { kn: "ಶನಿ ಶಿಸ್ತು", mr: "शनी स्थैर्य", hi: "शनि निर्माण", te: "శని పునాది", ta: "சனி உறுதி", en: "Steady Core" },
      anchors: [`${shaniTransitRashi}`, `${n(shaniHouseFromMoon)}`],
    },
    {
      n: 9, sec: 2, secTitle: sec2, icon: "🌟", visual: "timeline-meter",
      title: {
        kn: `ಗುರು ಗ್ರಹ ಸಂಚಾರ (${guruTransitRashi}): ದೈವಿಕ ಕಿಟಕಿ & ಬುದ್ಧಿ ವಿಸ್ತಾರ`,
        mr: `गुरु गोचर (${guruTransitRashi}): विस्ताराची सुवर्ण खिडकी`,
        hi: `गुरु गोचर (${guruTransitRashi}): विस्तार एवं शुभ अवसर की खिड़की`,
        te: `గురు గోచారం (${guruTransitRashi}): విస్తరణ & శుభ అవకాశం`,
        ta: `குரு பெயர்ச்சி (${guruTransitRashi}): வளர்ச்சி மற்றும் பொற்கதவு`,
        en: `Jupiter's Open Door (${guruTransitRashi}) — Where Grace Expands`,
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಗುರುವಿನ ಸಂಚಾರವು ನಿಮ್ಮ ಬದುಕಿನ ಯಾವ ಬಾಗಿಲನ್ನು ಅನಿರೀಕ್ಷಿತವಾಗಿ ತೆರೆಯುತ್ತಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, गुरु ग्रहाचे हे भ्रमण तुमच्या आयुष्याचे कोणते सुवर्ण दार उघडत आहे?`,
        hi: `प्रश्न: ${devoteeName}, बृहस्पति का यह गोचर आपके जीवन में विकास का कौन सा नया द्वार खोल रहा है?`,
        te: `ప్రశ్న: ${devoteeName}, గురు సంచారం మీ జీవితంలో ఏ అభివృద్ధి తలుపును తెరుస్తోంది?`,
        ta: `கேள்வி: ${devoteeName}, குருவின் சஞ்சாரம் உங்கள் வாழ்வில் எந்தப் புதிய வளர்ச்சிக் கதவைத் திறக்கிறது?`,
        en: `Question: ${devoteeName}, where is Jupiter transiting ${guruTransitRashi} opening a quiet window of relief, mentors, and growth?`,
      },
      p1: {
        kn: `ಶನಿಯು ಗಡಿಗಳನ್ನು ಪರೀಕ್ಷಿಸಿದರೆ, ${guruTransitRashi} ಮೂಲಕ ಸಾಗುತ್ತಿರುವ ಗುರುವು ಸರಿಯಾದ ವ್ಯಕ್ತಿ, ಒಳ್ಳೆಯ ಸಲಹೆ ಹಾಗೂ ಹೊಸ ಅವಕಾಶವನ್ನು ನಿಮ್ಮ ಬಳಿಗೆ ತರುತ್ತಿದೆ. ಚಂದ್ರನಿಂದ ${n(guruHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ಗುರು ಬಲವು ನಿಮ್ಮ ದೃಷ್ಟಿಕೋನವನ್ನು ಚಿಕ್ಕ ಚಿಂತೆಗಳಿಂದ ದೊಡ್ಡ ಗುರಿಗಳ ಕಡೆಗೆ ಎಳೆಯುತ್ತಿದೆ.`,
        mr: `शनी जिथे शिस्त लावतो, तिथे ${guruTransitRashi} मधील गुरु तुम्हाला योग्य माणसे, चांगला सल्ला व नवीन संधी आणून देतो. चंद्रापासून ${n(guruHouseFromMoon)}व्या स्थानातून गुरु तुमची दृष्टी मोठ्या ध्येयांकडे नेत आहे.`,
        hi: `जहां शनि अनुशासन देते हैं, वहीं ${guruTransitRashi} से संचार करते हुए गुरु सही व्यक्तियों, शुभ मार्गदर्शन एवं अवसरों को आपके निकट ला रहे हैं। चंद्र से ${n(guruHouseFromMoon)}वें भाव से यह आपकी दृष्टि को बड़े लक्ष्यों की ओर मोड़ता है।`,
        te: `శని క్రమశిక్షణను నేర్పితే, ${guruTransitRashi} లో సంచరిస్తున్న గురువు సరైన వ్యక్తులను, మంచి సలహాలను మరియు అవకాశాలను మీ వద్దకు తెస్తున్నాడు. మీ రాశి నుండి ${n(guruHouseFromMoon)}వ స్థానం ద్వారా మీ దృష్టిని ఉన్నత లక్ష్యాల వైపు మళ్ళిస్తున్నాడు.`,
        ta: `சனி ஒழுக்கத்தைத் தந்தால், ${guruTransitRashi} வழியாகச் செல்லும் குரு சரியான நபர்களையும் நல்ல வாய்ப்புகளையும் உங்களிடம் கொண்டு வருகிறார். ராசிக்கு ${n(guruHouseFromMoon)}-ம் இட குரு உங்கள் பார்வையைப் பெரிய இலக்குகளுக்கு உயர்த்துகிறார்.`,
        en: `While Saturn builds walls that hold, Jupiter gliding through ${guruTransitRashi} opens windows that bring air. Seated in House ${guruHouseFromMoon} from your Moon, it quietly introduces the right mentor, timely information, or fresh optimism just when outlook feels narrow.`,
      },
      p2: {
        kn: `ಗುಪ್ತ ತಿರುವು: ಗುರುವು ಎಂದಿಗೂ ಬರಿಗೈಯಲ್ಲಿ ದೊಡ್ಡ ಬದಲಾವಣೆ ತರುವುದಿಲ್ಲ — ಮೊದಲು ನಿಮ್ಮ ಯೋಚನಾ ವಿಧಾನವನ್ನು ಬದಲಿಸಿ, ನಂತರ ಒಂದೇ ಒಂದು ಸರಿಯಾದ ಪರಿಚಯದ ಮೂಲಕ ದೊಡ್ಡ ಬಾಗಿಲನ್ನು ತೆರೆಯುತ್ತದೆ! ನೀವು ಸಣ್ಣದೆಂದು ನಿರ್ಲಕ್ಷಿಸಿದ ಒಂದು ಆಲೋಚನೆಯೇ ಮುಂದೆ ದೊಡ್ಡ ದಾರಿಯಾಗಬಹುದು.`,
        mr: `गूढ वळण: गुरु कधीच घाईघाईत चमत्कार करत नाही — तो आधी तुमचा विचार बदलतो आणि नंतर एका योग्य ओळखीच्या माध्यमातून अचानक मोठे दार उघडतो! ज्या कल्पनेला तुम्ही छोटे समजलात, तीच मोठी ठरू शकते.`,
        hi: `सुंदर मोड़ यही है: गुरु पहले आपकी सोच का दायरा बढ़ाते हैं और फिर किसी एक सही परिचय या सूचना के ज़रिए बड़ा रास्ता खोल देते हैं! जिसे आपने सामान्य विचार समझा, वही बड़ा मोड़ बन सकता है।`,
        te: `ఇందులోని మలుపు: గురువు ముందుగా మీ ఆలోచనా విధానాన్ని మార్చి, ఆపై ఒక మంచి పరిచయం ద్వారా పెద్ద దారిని తెరుస్తాడు! మీరు చిన్నదని వదిలేసిన ఒక ఆలోచనే పెద్ద మలుపు కావచ్చు.`,
        ta: `இதன் அழகான திருப்பம்: குரு முதலில் உங்கள் சிந்தனையை விரிவுபடுத்தி, பின்னர் ஒரு சரியான அறிமுகத்தின் மூலம் பெரிய வாய்ப்பைத் திறப்பார்! சாதாரணமாக நினைத்த ஒரு யோசனையே திருப்புமுனையாகும்.`,
        en: `Here is Jupiter's signature twist: growth rarely announces itself with noise—it enters disguised as one casual conversation, book, or invitation you almost declined. Stay curious instead of cynical.`,
      },
      p3: {
        kn: `ಸದುಪಯೋಗದ ದಾರಿ: ಹೊಸ ಕೌಶಲ್ಯ ಕಲಿಯಿರಿ, ಗುರು-ಹಿರಿಯರ ಅನುಭವ ಕೇಳಿ ಹಾಗೂ ಒಳ್ಳೆಯ ಜನರ ಗುಂಪಿನಲ್ಲಿ ಹೆಚ್ಚಾಗಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ — ವಿಸ್ತಾರ ತಾನಾಗಿಯೇ ಬರುತ್ತದೆ.`,
        mr: `लाभ घेण्याचा मार्ग: नवीन कौशल्य शिका, अनुभवी लोकांशी चर्चा करा आणि सकारात्मक सहवासात राहा — संधी आपोआप वाढतील.`,
        hi: `लाभ उठाने का उपाय: नया कौशल सीखें, अनुभवी गुरुजनों की सुनें और सकारात्मक संगति चुनें—प्रगति स्वतः गति पकड़ेगी।`,
        te: `సద్వినియోగం: కొత్త నైపుణ్యాలు నేర్చుకోండి, అనుభవజ్ఞుల సలహాలు తీసుకోండి మరియు సానుకూల వ్యక్తులతో కలసి సాగండి.`,
        ta: `பயன்படுத்தும் வழி: புதிய திறன்களைக் கற்றுக்கொள்ளுங்கள், பெரியவர்களின் அனுபவத்தைக் கேளுங்கள், நல்ல நட்பு வட்டத்தில் இணையுங்கள்.`,
        en: `Catch this tailwind: learn one new skill, ask one wise mentor an honest question, and say yes to constructive rooms where people think bigger than gossip.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ಹೌದಲ್ಲ, ನಾನೇಕೆ ಈ ಕೋನದಿಂದ ಯೋಚಿಸಿರಲಿಲ್ಲ?' ಎಂದು ಇತ್ತೀಚೆಗೆ ನಿಮಗೆ ಅನಿಸಿದ ಒಂದು ಹೊಸ ಆಲೋಚನೆ ಯಾವುದು?`,
        mr: `स्व-परीक्षण: 'अरे हो, मी असा विचार का केला नव्हता?' असे वाटलेली अलीकडची एखादी नवी कल्पना आठवते का?`,
        hi: `स्वयं-निरीक्षण: हाल ही में ऐसा कौन सा नया विचार आया जिस पर आपको लगा कि 'मैंने पहले ऐसे क्यों नहीं सोचा'?`,
        te: `మిమ్మల్ని మీరు అడుగండి: 'అవును కదా, నేను ఇలా ఎందుకు ఆలోచించలేదు?' అని ఇటీవల అనిపించిన ఒక కొత్త ఆలోచన ఏమిటి?`,
        ta: `சுய பரிசோதனை: 'அடடா, இதை ஏன் நான் முன்பே யோசிக்கவில்லை?' என்று சமீபத்தில் உங்களுக்குத் தோன்றிய புதிய எண்ணம் எது?`,
        en: `Pause & Check: Which unexpected idea or piece of advice lately made you pause and think, "Why didn't I look at it that way before?"`,
      },
      badge: { kn: "ಗುರು ಬೆಳಕು", mr: "गुरु संधी", hi: "गुरु प्रकाश", te: "గురు కటాక్షం", ta: "குரு ஒளி", en: "Growth Window" },
      anchors: [`${guruTransitRashi}`, `${n(guruHouseFromMoon)}`],
    },
    {
      n: 10, sec: 2, secTitle: sec2, icon: "🐍", visual: "energy-gauge",
      title: {
        kn: "ರಾಹು-ಕೇತು ಅಕ್ಷ: ಮನಸ್ಸಿನ ಭ್ರಮೆ v/s ನಿಜವಾದ ಸ್ಪಷ್ಟತೆ",
        mr: "राहु-केतू अक्ष: मनातील भ्रम विरुद्ध खरे वास्तव",
        hi: "राहु-केतु अक्ष: मन के भ्रम बनाम वास्तविक स्पष्टता",
        te: "రాహు-కేతు అక్షం: భ్రమలు v/s అసలైన స్పష్టత",
        ta: "ராகு-கேது அச்சு: மன மாயை மற்றும் உண்மைத் தெளிவு",
        en: "The Shadow Axis — Escaping Mirages & Trusting Reality",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಒಂದು ಕಡೆ ದೊಡ್ಡ ಮಹತ್ವಾಕಾಂಕ್ಷೆ, ಇನ್ನೊಂದು ಕಡೆ 'ಇದೆಲ್ಲಾ ಬೇಕಾ?' ಎಂಬ ವೈರಾಗ್ಯ — ಈ ಎರಡು ಎಳೆತಗಳ ನಡುವೆ ನಿಜ ಯಾವುದು?`,
        mr: `प्रश्न: ${devoteeName}, एकीकडे मोठी स्वप्ने आणि दुसरीकडे अचानक येणारी अलिप्तता — या दोन्हींमधील खरे संतुलन काय?`,
        hi: `प्रश्न: ${devoteeName}, एक ओर बड़ी महत्त्वाकांक्षा और दूसरी ओर अचानक मन उचटने का भाव—इन दोनों के बीच सच्चाई क्या है?`,
        te: `ప్రశ్న: ${devoteeName}, ఒకవైపు పెద్ద ఆశయాలు, మరోవైపు విరక్తి—ఈ రెండు భావాల మధ్య నిజమైన సమతుల్యత ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, ஒரு பக்கம் பெரிய ஆசை, மறுபக்கம் திடீர் வெறுமை—இந்த இரு இழுப்புகளுக்கும் நடுவே உண்மை எது?`,
        en: `Question: ${devoteeName}, why does half your mind chase giant breakthroughs while the other half suddenly whispers "walk away"?`,
      },
      p1: {
        kn: `ರಾಹು-ಕೇತುಗಳ ಕಥೆ ಮಾನವ ಮನಸ್ಸಿನ ತಾಕಲಾಟದ ಪ್ರತಿಬಿಂಬ. ನಿಮ್ಮ ${moonRashiName} ರಾಶಿಯಿಂದ ${n(rahuHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ರಾಹು 'ವೇಗವಾಗಿ ಏನಾದರೂ ಸಾಧಿಸಬೇಕು' ಎಂಬ ಕಿಚ್ಚು ಹಚ್ಚಿದರೆ, ಕೇತುವು ತೋರಿಕೆಯ ಜಗತ್ತಿನ ಬಗ್ಗೆ ಒಳಗಿಂದೊಳಗೇ ಅಸಹನೆ ಹುಟ್ಟಿಸುತ್ತದೆ.`,
        mr: `राहु-केतूची कथा मानवी मनाच्या ओढाताणीची आहे. तुमच्या ${moonRashiName} राशीपासून ${n(rahuHouseFromMoon)}व्या स्थानात राहु मोठे काहीतरी करण्याची भूक निर्माण करतो, तर केतू दाखवेगिरीबद्दल मनात अलिप्तता आणतो.`,
        hi: `राहु-केतु की कथा मन की दो विपरीत धाराओं की कहानी है। आपकी ${moonRashiName} राशि से ${n(rahuHouseFromMoon)}वें भाव का राहु बड़ी छलांग की चाह जगाता है, जबकि केतु दिखावे से मन को हटा देता है।`,
        te: `రాహు-కేతువుల ప్రభావం మనసులోని రెండు భిన్న కోరికల వంటిది. మీ ${moonRashiName} రాశి నుండి ${n(rahuHouseFromMoon)}వ స్థానంలో రాహువు పెద్ద ఆశయాలను రేకెత్తిస్తే, కేతువు కృత్రిమ ప్రపంచంపై విముఖతను కలిగిస్తుంది.`,
        ta: `ராகு-கேதுவின் கதை மனதின் இரு எதிர் உணர்வுகளின் வெளிப்பாடு. உங்கள் ${moonRashiName} ராசியிலிருந்து ${n(rahuHouseFromMoon)}-ம் இட ராகு பெரிய சாதனை ஆசையைத் தூண்டினால், கேது போலித்தனத்தின் மீது சலிப்பை உண்டாக்கும்.`,
        en: `Here is why your drive sometimes feels like two steering wheels pulling opposite ways: Rahu in House ${rahuHouseFromMoon} from your ${moonRashiName} Moon makes you hunger for extraordinary results, while Ketu opposite it abruptly strips excitement out of shallow praise.`,
      },
      p2: {
        kn: `ಇದರ ಗುಪ್ತ ತಿರುವು: ಇವೆರಡರ ನಡುವೆ ನಿಮ್ಮನ್ನು ಸಿಲುಕಿಸುವುದು 'ಆತುರದ ಭ್ರಮೆ'! ರಾತ್ರೋರಾತ್ರಿ ಶ್ರೀಮಂತರಾಗುವ ಆಮಿಷ, ಪರಿಶೀಲಿಸದ ಭರವಸೆ, ಅಥವಾ ತಲೆಯಲ್ಲಿ ಬರುವ ಅನಗತ್ಯ ಭಯ — ಇವು ನಿಜವಲ್ಲ, ಕೇವಲ ನೆರಳಿನ ಆಟಗಳು.`,
        mr: `यातील खरा सापळा: घाईचा भ्रम! झटपट यशाची आमिषे, तपासून न पाहिलेली आश्वासने किंवा मनातली काल्पनिक भीती — या गोष्टी खऱ्या नसून केवळ सावल्यांचा खेळ आहेत.`,
        hi: `असली पेंच यहीं है: 'जल्दबाजी का भ्रम'! रातों-रात लाभ का लालच, बिना परखे किसी पर भरोसा या मन में उठने वाला काल्पनिक भय—ये सब केवल छाया हैं, सत्य नहीं।`,
        te: `ఇక్కడ జాగ్రత్త పడాల్సిన మలుపు: 'తొందరపాటు భ్రమ'! రాత్రికి రాత్రే అద్భుతాలు జరుగుతాయనే ఆశలు, పూర్తిగా పరిశీలించని మాటలు, అనవసర భయాలు నిజమైనవి కావు—కేవలం ఛాయలు మాత్రమే.`,
        ta: `இதன் முக்கிய திருப்பம்: 'அவசர மாயை'! ஒரே இரவில் வெற்றி தரும் என்ற கவர்ச்சி, சரிபார்க்காத வாக்குறுதிகள் அல்லது தேவையற்ற மனப் பயம்—இவை நிஜமல்ல, வெறும் நிழல்கள் மட்டுமே.`,
        en: `The mirage to spot early: both extreme hype ("this shortcut solves everything tomorrow!") and sudden doom ("nothing works!") are illusions from the same shadow axis. Reality is far calmer and far more solid than anxiety predicts.`,
      },
      p3: {
        kn: `ನಿಮ್ಮ ಗೆಲುವಿನ ಮಂತ್ರ: ದೊಡ್ಡ ಕನಸು ಕಾಣಿ, ಆದರೆ ಪ್ರತಿ ಹಂತದ ದಾಖಲೆ, ಅಂಕಿಅಂಶ ಮತ್ತು ವಾಸ್ತವವನ್ನು ಕಣ್ಣಾರೆ ಪರೀಕ್ಷಿಸಿ ಮುಂದುವರಿಯಿರಿ.`,
        mr: `यशाचा सोपा नियम: मोठी स्वप्ने पहा, पण कागदपत्रे आणि वास्तव स्वतः तपासूनच प्रत्येक पाऊल टाका.`,
        hi: `स्पष्ट रास्ता: बड़े सपने अवश्य देखें, परंतु हर कदम पर तथ्य और कागज़ी हकीकत स्वयं जांचकर ही आगे बढ़ें।`,
        te: `విజయ సూత్రం: పెద్ద కలలు కనండి, కానీ వాస్తవాలను మరియు వివరాలను స్వయంగా పరిశీలించుకుంటూ ముందుకు సాగండి.`,
        ta: `வெற்றி விதி: பெரிய கனவு காணுங்கள், ஆனால் உண்மையையும் ஆவணங்களையும் நேரில் சரிபார்த்த பிறகே அடியெடுத்து வையுங்கள்.`,
        en: `Keep your feet planted while dreaming big: check real numbers, verify agreements in writing, and refuse to let artificial urgency rush your judgment.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ಏನೋ ದೊಡ್ಡ ಅನಾಹುತ ಆಗಬಹುದು' ಎಂದು ನೀವು ಭಯಪಟ್ಟ ವಿಷಯಗಳಲ್ಲಿ ೯೦% ನಿಜಕ್ಕೂ ನಡೆದಿಲ್ಲ ಎಂಬುದನ್ನು ಗಮನಿಸಿದ್ದೀರಾ?`,
        mr: `स्व-परीक्षण: ज्या गोष्टींची तुम्हाला प्रचंड भीती वाटली होती, त्यातील ९०% गोष्टी प्रत्यक्षात कधीच घडल्या नाहीत, हे लक्षात आले का?`,
        hi: `स्वयं-निरीक्षण: क्या आपने ध्यान दिया कि जिन अनिष्टों से आप सबसे ज्यादा डरे, उनमें से ९०% कभी घटित ही नहीं हुए?`,
        te: `మిమ్మల్ని మీరు అడుగండి: మీరు ఏదో జరిగిపోతుందని భయపడిన విషయాల్లో 90% అసలు జరగనే లేదని ఎప్పుడైనా గమనించారా?`,
        ta: `சுய பரிசோதனை: 'ஏதோ தவறு நடந்துவிடுமோ' என நீங்கள் பயந்த விஷயங்களில் 90% நிஜத்தில் நடக்கவே இல்லை என்பதைக் கவனித்திருக்கிறீர்களா?`,
        en: `Pause & Check: How many of the worst-case scenarios you worried about last year actually happened in real life? Almost none—remember that next time fear knocks.`,
      },
      badge: { kn: "ಭ್ರಮೆ ಮುಕ್ತಿ", mr: "भ्रम मुक्ती", hi: "स्पष्ट दृष्टि", te: "వాస్తవ దృష్టి", ta: "மாயை நீக்கம்", en: "Clear Lens" },
      anchors: [`${moonRashiName}`, `${n(rahuHouseFromMoon)}`],
    },
    {
      n: 11, sec: 2, secTitle: sec2, icon: "👑", visual: "rashi-mandala",
      title: {
        kn: "ವಿಶೇಷ ರಾಜಯೋಗಗಳು, ಗಜಕೇಸರಿ, ಬುಧಾದಿತ್ಯ & ಸುಪ್ತ ವರದಾನ",
        mr: "विशेष राजयोग, गजकेसरी, बुधादित्य व तुमचे जन्मजात वरदान",
        hi: "विशिष्ट राजयोग, गजकेसरी, बुधादित्य एवं आपके जन्मजात वरदान",
        te: "ప్రత్యేక రాజయోగాలు, గజకేసరి, బుధాదిత్య & మీ సహజ వరాలు",
        ta: "விசேஷ ராஜயோகங்கள், கஜகேசரி, புதாதித்ய & உங்கள் பிறவி வரங்கள்",
        en: "Hidden Crown Gifts — The Natural Leadership Inside Your Chart",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಕಷ್ಟ ಬಂದಾಗಲೂ ನಿಮ್ಮನ್ನು ಮತ್ತೆ ಎದ್ದು ನಿಲ್ಲಿಸುವ ಆ ಗುಪ್ತ ರಾಜಯೋಗ ಶಕ್ತಿ ಯಾವುದು?`,
        mr: `प्रश्न: ${devoteeName}, कठीण प्रसंगानंतरही तुम्हाला पुन्हा उभे करणारे पत्रिकेतील कोणते छुपे राजयोग आहेत?`,
        hi: `प्रश्न: ${devoteeName}, हर ठोकर के बाद भी आपको फिर से ऊपर उठाने वाली वे जन्मजात शक्तियां और राजयोग कौन से हैं?`,
        te: `ప్రశ్న: ${devoteeName}, ఎన్ని కష్టాలు వచ్చినా మిమ్మల్ని మళ్ళీ నిలబెట్టే ఆ ప్రత్యేక రాజయోగాలు ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, எத்தனை தடைகள் வந்தாலும் உங்களை மீண்டும் உயர்த்தும் மறைமுக ராஜயோக பலம் எது?`,
        en: `Question: ${devoteeName}, what quiet natural gifts ensure you rise higher after every setback instead of staying down?`,
      },
      p1: {
        kn: `ನೀವು ಸಾಮಾನ್ಯರಂತೆ ಒಮ್ಮೆ ಬಿದ್ದು ಸುಮ್ಮನಾಗುವವರಲ್ಲ. ನಿಮ್ಮ ${lagnaRashiName} ಚಾರ್ಟಿನಲ್ಲಿರುವ '${detectedYogasSummary}' ನಂತಹ ಶುಭ ಯೋಗಗಳು ಹಾಗೂ ಪಾರಂಪರಿಕ ಗಜಕೇಸರಿ ಮತ್ತು ಬುಧಾದಿತ್ಯ ತತ್ವಗಳು ನಿಮ್ಮಲ್ಲಿ ಜನಸಂಪರ್ಕದ ಗೌರವ, ಸಂದರ್ಭಕ್ಕೆ ತಕ್ಕ ಮಾತಿನ ಜಾಣ್ಮೆ ಹಾಗೂ ತಲೆಬಾಗದ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಕಟ್ಟಿವೆ.`,
        mr: `तुमचा स्वभाव एकदा पडल्यावर थांबणारा नाही. तुमच्या ${lagnaRashiName} पत्रिकेतील '${detectedYogasSummary}' यांसारखे शुभ राजयोग तसेच गजकेसरी व बुधादित्य तत्त्वे तुमच्यामध्ये लोकसंग्रह, समयसूचक बुद्धिमत्ता आणि नैसर्गिक प्रतिष्ठा घडवतात.`,
        hi: `आप गिरकर रुक जाने वालों में से नहीं हैं। आपके ${lagnaRashiName} लग्न के '${detectedYogasSummary}' तथा गजकेसरी और बुधादित्य जैसे राजयोग संकेत आपके भीतर वाक्पटुता, लोगों का विश्वास जीतने की कला एवं सम्मान रचते हैं।`,
        te: `మీరు ఒక్కసారి వెనకబడితే ఆగిపోయే రకం కాదు. మీ ${lagnaRashiName} కుండలిలోని '${detectedYogasSummary}' వంటి రాజయోగాలు, గజకేసరి మరియు బుధాదిత్య శక్తులు మీకు సహజ గౌరవాన్ని, మాటకారితనాన్ని మరియు నాయకత్వ పటిమను ఇచ్చాయి.`,
        ta: `நீங்கள் ஒருமுறை விழுந்தால் முடங்கிவிடுபவர் அல்ல. உங்கள் ${lagnaRashiName} ஜாதகத்தில் உள்ள '${detectedYogasSummary}' மற்றும் கஜகேசரி, புதாதித்ய போன்ற ராஜயோகத் தன்மைகள் உங்களுக்கு மக்கள் செல்வாக்கையும் புத்திசாலித்தனத்தையும் தந்துள்ளன.`,
        en: `You were never wired to stay in the background permanently. Within your ${lagnaRashiName} blueprint stand royal combinations—such as ${detectedYogasSummary}, carrying classic Gajakesari poise and Budhaditya sharpness—that give you unexpected presence in critical rooms.`,
      },
      p2: {
        kn: `ಇಲ್ಲಿರುವ ಸುಂದರ ತಿರುವು: ಅನೇಕರಿಗೆ ಈ ರಾಜಯೋಗಗಳ ಫಲ ಚಿಕ್ಕ ವಯಸ್ಸಲ್ಲೇ ಕಾಣಿಸದೆ, ಮೊದಲು ಕಷ್ಟದ ಪರೀಕ್ಷೆ ನಡೆದ ನಂತರವೇ 'ತಡವಾದರೂ ಗಟ್ಟಿಯಾಗಿ' ಪ್ರಕಟವಾಗುತ್ತದೆ! ನೀವು ಸಾಧಾರಣ ದಾರಿಯಲ್ಲಿ ಹೋಗದೆ, ಸ್ವಂತ ಪ್ರತಿಭೆಯಿಂದ ಮನ್ನಣೆ ಪಡೆಯುವ ಜೀವನವಿದು.`,
        mr: `यातला सुंदर ट्विस्ट: हे राजयोग अनेकांना सुरुवातीच्या संघर्षानंतर व स्वकर्तृत्वाने उशिरा पण अत्यंत भक्कम स्वरूपात फळ देतात! इतरांच्या मेहेरबानीपेक्षा स्वतःच्या कौशल्याने तुम्ही मान मिळवणार आहात.`,
        hi: `खूबसूरत मोड़ यह है: ऐसे राजयोग अक्सर आरंभिक संघर्ष के बाद ही अपनी असली चमक दिखाते हैं ताकि आपकी सफलता किसी की कृपा नहीं, बल्कि आपकी अपनी काबिलियत की देन बने!`,
        te: `అద్భుత మలుపు: ఈ రాజయోగాలు ప్రారంభంలో కొంత శ్రమ పెట్టినా, ఆ తర్వాత ఎవరూ అడ్డుకోలేని స్థిరమైన గౌరవాన్ని మీ స్వయంకృషి ద్వారా అందిస్తాయి!`,
        ta: `அழகான திருப்பம்: இத்தகைய ராஜயோகங்கள் ஆரம்ப சோதனைகளுக்குப் பிறகுதான் முழுமையாக வெளிப்படும்—மற்றவர்களின் தயவால் அல்ல, உங்கள் சுய திறமையால் உயரப்போகிறீர்கள்!`,
        en: `Here is why it felt delayed earlier: strong royal patterns rarely hand out easy trophies young—they forge experience first so no one can claim they gave you your success. When your window clicks, authority comes through your own earned voice.`,
      },
      p3: {
        kn: `ನಿಮ್ಮ ಶಕ್ತಿ ಜಾಗೃತವಾಗುವ ರೀತಿ: ನಿಮ್ಮ ಅಭಿಪ್ರಾಯಗಳನ್ನು ಸಂಕೋಚದಿಂದ ಮುಚ್ಚಿಡಬೇಡಿ; ಜವಾಬ್ದಾರಿ ತೆಗೆದುಕೊಳ್ಳಲು ಮುಂದೆ ನಿಂತ ದಿನವೇ ನಿಮ್ಮ ಗೌರವ ಹೊಸ ಎತ್ತರಕ್ಕೆ ಏರುತ್ತದೆ.`,
        mr: `ही शक्ती जागवण्याचा मार्ग: स्वतःची मते संकोचाने मागे ठेवू नका; जबाबदारी स्वीकाराल त्या क्षणी तुमचे नेतृत्व चमकू लागेल.`,
        hi: `प्रभाव बढ़ाने का उपाय: संकोच छोड़कर अपने विचार स्पष्ट रखें; जिस दिन आप पहल करेंगे, लोग स्वतः आपके पीछे खड़े होंगे।`,
        te: `మీ శక్తిని మేల్కొల్పే మార్గం: మీ ఆలోచనలను మొహమాటంతో దాచకండి; బాధ్యత తీసుకున్న రోజే మీ గౌరవం రెట్టింపు అవుతుంది.`,
        ta: `திறமையை வெளிப்படுத்தும் வழி: தயக்கத்தை விட்டு உங்கள் கருத்துக்களைத் துணிந்து முன்வையுங்கள்; பொறுப்பை ஏற்கும் நொடியில் உயர்வு தொடங்கும்.`,
        en: `How to awaken these gifts daily: stop muting your strongest ideas out of politeness. Step forward cleanly when leadership sits vacant—the room waits for your clarity more than you realize.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ನೀವು ಮಾತನಾಡಿದರೆ ಮಾತ್ರ ಈ ಸಮಸ್ಯೆಗೆ ದಾರಿ ಸಿಕ್ಕಿತು' ಎಂದು ಸುತ್ತಲಿನವರು ಎಂದಾದರೂ ಹೇಳಿದ ಕ್ಷಣ ನಿಮಗೆ ನೆನಪಿದೆಯೇ?`,
        mr: `स्व-परीक्षण: 'तुम्ही बोललात आणि मार्ग निघाला' असे सभोवतालच्या लोकांनी कधीतरी कौतुकाने म्हटल्याचे आठवते का?`,
        hi: `स्वयं-निरीक्षण: क्या कभी ऐसा हुआ कि सब चुप थे, और आपके एक सही सुझाव ने पूरा माहौल बदल दिया?`,
        te: `మిమ్మల్ని మీరు అడుగండి: అందరూ ఆలోచిస్తుంటే మీరు చెప్పిన ఒక్క మాటతో సమస్య పరిష్కారమైన సందర్భం గుర్తుందా?`,
        ta: `சுய பரிசோதனை: அனைவரும் தயங்கியபோது உங்கள் ஒரு கருத்து முழுச் சூழலையும் மாற்றிய தருணம் நினைவிருக்கிறதா?`,
        en: `Pause & Check: Remember a moment when everyone argued in circles until your one calm sentence settled the whole room? That is your signature.`,
      },
      badge: { kn: "ಸುಪ್ತ ರಾಜಯೋಗ", mr: "राजयोग शक्ती", hi: "राजयोग शक्ति", te: "రాజయోగ బలం", ta: "ராஜயோக ஆற்றல்", en: "Royal Spark" },
      anchors: [`${lagnaRashiName}`, `${detectedYogasSummary.slice(0, 28)}`],
    }
  );

  // CHAPTER 12 — Career / Education (Strictly Age-Bracket Safe!)
  list.push({
    n: 12, sec: 3, secTitle: sec3, icon: "💼", visual: "sav-pillars",
    title: isChildOrInfant
      ? { kn: "ಬಾಲಾರಿಷ್ಟ ರಕ್ಷೆ, ಕಲಿಕೆಯ ಚುರುಕುತನ & ಪ್ರತಿಭಾ ವಿಕಾಸ", mr: "बालारिष्ट संरक्षण, बुद्धिमत्ता व कलागुण विकास", hi: "बालारिष्ट रक्षा, कुशाग्र बुद्धि एवं प्रतिभा विकास", te: "బాలారిష్ట రక్షణ, విద్యా చురుకుదనం & ప్రతిభ", ta: "பாலாரிஷ்ட பாதுகாப்பு, கல்வி & தனித்திறன் வளர்ச்சி", en: "Childhood Spark — Learning Gifts & Natural Protection" }
      : isSenior
      ? { kn: "ಅನುಭವದ ಕಿರೀಟ, ಸಲಹಾ ಗೌರವ & ಶಾಂತ ನಿವೃತ್ತಿ", mr: "अनुभवाचा सन्मान, मार्गदर्शन व समाधानी जीवन", hi: "अनुभव का सम्मान, परामर्श प्रतिष्ठा एवं शांति", te: "అనుభవ గౌరవం, మార్గదర్శనం & ప్రశాంత జీవితం", ta: "அனுபவப் பெருமை, வழிகாட்டல் & நிம்மதி", en: "Elder Crown — Advisory Influence & Deep Respect" }
      : { kn: "ವೃತ್ತಿ, ಕೆಲಸ, ವ್ಯಾಪಾರ & ಅಧಿಕಾರದ ನಿಜವಾದ ದಾರಿ", mr: "कारकीर्द, नोकरी, व्यवसाय व प्रगतीची दिशा", hi: "करियर, आजीविका, व्यवसाय एवं अधिकार की राह", te: "వృత్తి, ఉద్యోగం, వ్యాపారం & అధికార మార్గం", ta: "தொழில், வேலை, வியாபாரம் & வளர்ச்சிப் பாதை", en: "Work, Business & Authority — Where You Truly Shine" },
    question: isChildOrInfant
      ? { kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಪುಟ್ಟ ಶಿಶುವಿನ ಕಲಿಕೆ, ಕುತೂಹಲ ಮತ್ತು ಸುರಕ್ಷತೆಯ ಕಥೆ ಏನು ಹೇಳುತ್ತದೆ?`, mr: `प्रश्न: ${devoteeName}, या चिमुकल्याच्या शिक्षण व प्रगतीची नैसर्गिक दिशा कोणती आहे?`, hi: `प्रश्न: ${devoteeName}, इस बालक की सीखने की गति, जिज्ञासा और सुरक्षा के बारे में चार्ट क्या कहता है?`, te: `ప్రశ్న: ${devoteeName}, ఈ చిన్నారి విద్యాభ్యాసం, ఆసక్తులు & రక్షణ గురించి కథ ఏమి చెబుతోంది?`, ta: `கேள்வி: ${devoteeName}, இந்தக் குழந்தையின் கற்றல் ஆர்வம் மற்றும் வளர்ச்சிப் பாதை எவ்வாறு உள்ளது?`, en: `Question: ${devoteeName}, how does this child naturally learn, explore, and grow brightest?` }
      : { kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಬರೀ ದುಡಿಮೆ ಸಾಕೇ, ಅಥವಾ ನಿಮ್ಮ ಪ್ರತಿಭೆಗೆ ತಕ್ಕ ಎತ್ತರ ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕಾದಿದೆ?`, mr: `प्रश्न: ${devoteeName}, केवळ नोकरीत अडकून न राहता तुम्हाला खरा मान व प्रगती कोणत्या दिशेने मिळेल?`, hi: `प्रश्न: ${devoteeName}, केवल रोज़मर्रा के काम से आगे बढ़कर आपकी असली पहचान किस क्षेत्र में बनेगी?`, te: `ప్రశ్న: ${devoteeName}, మీ ప్రతిభకు తగిన అసలైన గుర్తింపు, ఉన్నత స్థానం ఏ రంగంలో ఉన్నాయి?`, ta: `கேள்வி: ${devoteeName}, சாதாரண உழைப்பைத் தாண்டி உங்கள் திறமைக்கு உரிய உயர்வு எந்த வழியில் உள்ளது?`, en: `Question: ${devoteeName}, where are you meant to stop merely trading time and step into real professional leverage?` },
    p1: isChildOrInfant
      ? { kn: `ಈ ಪುಟ್ಟ ಶಿಶುವಿನ ಜಾತಕದಲ್ಲಿ ಬಾಲಾರಿಷ್ಟ ಭೀತಿಯಿಲ್ಲದೆ ಚುರುಕಾದ ಮನಸ್ಸು ಬೆಳಗುತ್ತಿದೆ. ಗಿಳಿಪಾಠಕ್ಕಿಂತ ಕಥೆ, ಚಿತ್ರ, ಹಾಡು ಮತ್ತು ಪ್ರಶ್ನೆಗಳ ಮೂಲಕ ಕಲಿಯುವುದು ಈ ಮಗುವಿಗೆ ಬಹಳ ಬೇಗ ಹಿಡಿಸುತ್ತದೆ.`, mr: `या बाळाच्या पत्रिकेत बालारिष्टाची कोणतीही भीती नसून तल्लख बुद्धी आहे. रटाळ पाठांतरापेक्षा गोष्टी, चित्रे व खेळातून हे बाळ लवकर शिकेल.`, hi: `इस बालक के जीवन में बालारिष्ट का कोई भय नहीं है और जिज्ञासा अत्यंत तीव्र है। रटने के बजाय कहानियों, चित्रों और खेल के माध्यम से सीखना इसे सबसे तेज़ आगे बढ़ाएगा।`, te: `ఈ చిన్నారి జాతకంలో బాలారిష్ట భయం లేకుండా తెలివైన గ్రహణ శక్తి కనిపిస్తోంది. బట్టీ చదువుల కంటే కథలు, బొమ్మలు మరియు ఆసక్తికర ప్రశ్నల ద్వారా త్వరగా నేర్చుకుంటుంది.`, ta: `இந்தக் குழந்தையின் ஜாதகத்தில் பாலாரிஷ்ட பயமின்றி கூர்மையான அறிவு பிரகாசிக்கிறது. மனப்பாடத்தை விட கதைகள், ஓவியம் மற்றும் கேள்விகள் மூலம் மிக வேகமாகக் கற்றுக்கொள்ளும்.`, en: `Free from heavy childhood vulnerabilities, this young child's chart glows with curiosity. Rather than rigid rote drills, stories, hands-on play, and patient answers to their endless questions ignite genuine brilliance.` }
      : { kn: `ನಿಮ್ಮ ವೃತ್ತಿ ಜಾತಕ ಹೇಳುವ ಕಥೆ: ನೀವು ಕೇವಲ ಮೇಲಧಿಕಾರಿ ಹೇಳಿದಷ್ಟೇ ಮಾಡುವವರಲ್ಲ — ಒಂದು ವ್ಯವಸ್ಥೆಯನ್ನು ನಿಭಾಯಿಸಿ, ಜನರನ್ನು ಮುನ್ನಡೆಸಿ ಅಥವಾ ಸ್ವಂತ ವೃತ್ತಿ/ವ್ಯಾಪಾರದಲ್ಲಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಸ್ಥಾನಕ್ಕೆ ಬರುವಾಗಲೇ ನಿಮ್ಮ ನಿಜವಾದ ಶಕ್ತಿ ಹೊರಬರುತ್ತದೆ.`, mr: `तुमच्या करिअरची कथा स्पष्ट आहे: तुम्ही फक्त आदेश पाळणारे नाही, तर संपूर्ण व्यवस्था सांभाळून निर्णय घेणारे आहात. जिथे जबाबदारी आणि स्वातंत्र्य मिळते, तिथेच तुमची खरी चमक दिसते.`, hi: `आपकी आजीविका की कहानी स्पष्ट है: आप केवल निर्देश मानने वाले नहीं, बल्कि पूरे तंत्र को संभालकर निर्णय लेने वाले व्यक्ति हैं। जहां आपको ज़िम्मेदारी और स्वतंत्रता मिलती है, वहीं आपका श्रेष्ठ प्रदर्शन निखरता है।`, te: `మీ వృత్తి కథనం చాలా స్పష్టంగా ఉంది: మీరు కేవలం ఇతరుల ఆదేశాలు పాటించే రకం కాదు—బాధ్యత తీసుకుని, ఒక బృందాన్ని లేదా సొంత వ్యాపారాన్ని నడిపించే చోటే మీ అసలైన శక్తి వెలుగులోకి వస్తుంది.`, ta: `உங்கள் தொழில் கதை மிகத் தெளிவானது: மற்றவர் சொல்வதை மட்டும் செய்யும் சாதாரண நிலையில் உங்களால் திருப்தி அடைய முடியாது—பொறுப்புகளையும் முடிவுகளையும் நீங்களே எடுக்கும் இடத்தில்தான் உங்கள் திறமை ஒளிரும்.`, en: `Look closely at how you work: you quickly outgrow rigid, micromanaged roles. Whether inside leadership or your own venture (guided cleanly by ${house10Info.lordName}), your momentum multiplies the day people trust you to own outcomes rather than just follow checklists.` },
    p2: isChildOrInfant
      ? { kn: `ಪೋಷಕರಿಗೆ ರೋಚಕ ಸುಳಿವು: ಮಗುವನ್ನು ಬೇರೆ ಮಕ್ಕಳೊಂದಿಗೆ ಹೋಲಿಕೆ ಮಾಡದಿದ್ದರೆ, ಇದರ ವಿಶಿಷ್ಟ ಕಲಾತ್ಮಕ ಅಥವಾ ತಾರ್ಕಿಕ ಪ್ರತಿಭೆ ತನ್ನಿಂದ ತಾನೇ ಜಗತ್ತನ್ನು ಬೆರಗುಗೊಳಿಸುವ ಮಟ್ಟಕ್ಕೆ ಬೆಳೆಯುತ್ತದೆ.`, mr: `पालकांसाठी मोठे गुपित: इतरांशी तुलना टाळल्यास या मुलाची नैसर्गिक कला व तर्कशक्ती सर्वांना थक्क करेल.`, hi: `अभिभावकों के लिए विशेष संकेत: दूसरों से तुलना न करने पर इस बच्चे की अनूठी रचनात्मक और तार्किक प्रतिभा सबको चकित कर देगी।`, te: `తల్లిదండ్రులకు ముఖ్య సూచన: ఇతర పిల్లలతో పోల్చకుండా ప్రోత్సహిస్తే ఈ చిన్నారి సహజ ప్రతిభ అద్భుతంగా వికసిస్తుంది.`, ta: `பெற்றோருக்கான முக்கிய ரகசியம்: பிற குழந்தைகளுடன் ஒப்பிடாமல் விட்டால் இதன் தனித்துவமான சிந்தனை எல்லோரையும் வியக்க வைக்கும்.`, en: `Here is the golden clue for parents: never force comparisons with other children's pace—guard confidence early, and this child's original talent will stand out effortlessly.` }
      : { kn: `ವೃತ್ತಿ ತಿರುವು: ಇತರರ ಕೆಲಸದ ಭಾರವನ್ನೆಲ್ಲಾ ಹೊತ್ತುಕೊಂಡು 'ಕೆಲಸ ಮುಗಿಸುವ ಒಳ್ಳೆಯ ವ್ಯಕ್ತಿ'ಯಷ್ಟೇ ಆಗಿರುವುದೇ ನಿಮ್ಮ ಹಳೆಯ ತಡೆ! ನಿಮ್ಮ ಕೊಡುಗೆಗೆ ಸ್ಪಷ್ಟ ಬೆಲೆ ಮತ್ತು ಗೌರವ ಕೇಳಿದ ದಿನವೇ ಬಡ್ತಿ ಹಾಗೂ ಹೊಸ ಸ್ಥಾನಮಾನ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ.`, mr: `कारकिर्दीतील मोठा ट्विस्ट: इतरांचेही काम अंगावर घेऊन फक्त 'मदतगार' राहणे हाच तुमचा अडकलेला बिंदू होता! ज्या दिवशी तुम्ही तुमच्या कामाचे योग्य श्रेय मागाल, तिथूनच खरी प्रगती सुरू होईल.`, hi: `करियर का बड़ा मोड़: सबका अतिरिक्त बोझ उठाकर चुपचाप 'अच्छा सहकर्मी' बने रहना ही आपकी देरी का कारण रहा! जिस दिन आप अपने योगदान का स्पष्ट श्रेय और मूल्य मांगेंगे, पदोन्नति और सम्मान दोनों आगे आएंगे।`, te: `ఇక్కడున్న మలుపు: అందరి భారాన్ని మోస్తూ మౌనంగా పనిచేయడమే మిమ్మల్ని వెనక్కు లాగింది! మీ శ్రమకు తగిన గుర్తింపు మరియు విలువను స్పష్టంగా అడిగిన రోజే ఉన్నత పదవి మీ దరిచేరుతుంది.`, ta: `தொழில் திருப்பம்: பிறரின் வேலைகளையும் சுமந்து அமைதியாக உழைத்ததுதான் உங்களைத் தேக்கியது! உங்கள் உழைப்புக்கான அங்கீகாரத்தையும் மதிப்பையும் கேட்கத் தொடங்கிய நாளிலிருந்து பதவி உயர்வு தேடி வரும்.`, en: `The career twist holding you back: silently fixing everyone else's mess made you indispensable in your old box—sometimes too useful to promote! The moment you step back from invisible busywork and claim credit for big wins, stalled advancement breaks loose.` },
    p3: isChildOrInfant
      ? { kn: `ದಿನಚರಿಯ ಸರಳ ಹೆಜ್ಜೆ: ಮಗುವಿನ ನಿದ್ದೆ, ಹೊರಾಂಗಣ ಆಟ ಹಾಗೂ ಕಥೆ ಹೇಳುವ ಸಮಯವನ್ನು ಪ್ರೀತಿಯಿಂದ ನಿಗದಿಪಡಿಸಿ — ಅದೇ ಬುದ್ಧಿವಂತಿಕೆಯ ಅಡಿಪಾಯ.`, mr: `सोपे पाऊल: पुरेशी झोप, मोकळेपणाने खेळणे आणि रोजच्या गप्पा यांतूनच या मुलाचा आत्मविश्वास भक्कम होईल.`, hi: `सरल दिनचर्या: पर्याप्त नींद, खुला खेल और प्रेमपूर्ण संवाद ही इसकी प्रतिभा की असली नींव हैं।`, te: `సులభమైన అలవాటు: తగినంత నిద్ర, ఆటలు మరియు ఆనందకరమైన వాతావరణం చాలు—మిగతాదంతా సహజంగా వస్తుంది.`, ta: `எளிய வழி: நல்ல தூக்கம், விளையாட்டு மற்றும் அன்பான உரையாடல் மூலம் குழந்தையின் ஆற்றலை வளர்த்தெடுங்கள்.`, en: `Keep daily rhythms calm, playful, and screen-light—curiosity thrives best inside warmth and unhurried conversation.` }
      : { kn: `ಈ ವಾರದ ವೃತ್ತಿ ನಡೆ: ನೀವು ತಂದ ಫಲಿತಾಂಶಗಳನ್ನು ಲಿಖಿತವಾಗಿ ದಾಖಲಿಸಿ, ಒಂದು ನಿರ್ಣಾಯಕ ಕೌಶಲ್ಯವನ್ನು ಮೇಲ್ದರ್ಜೆಗೆ ಏರಿಸಿ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗೆ ಧೈರ್ಯದಿಂದ 'ಸಿದ್ಧ' ಎನ್ನಿ.`, mr: `पुढील पाऊल: तुमचे यश आकडेवारीने मांडायला शिका, एक नवीन कौशल्य आत्मसात करा आणि मोठ्या जबाबदारीसाठी पुढे या.`,
        hi: `सटीक कदम: अपनी उपलब्धियों को स्पष्ट रूप से सामने रखना सीखें, एक आधुनिक कौशल बढ़ाएं और बड़े दायित्व के लिए आगे बढ़ें।`,
        te: `మీ వృత్తి అడుగు: మీరు సాధించిన ఫలితాలను స్పష్టంగా చూపించండి, ఒక కొత్త నైపుణ్యాన్ని పెంచుకోండి మరియు పెద్ద బాధ్యతకు సిద్ధమవండి.`,
        ta: `அடுத்த நகர்வு: உங்கள் சாதனைகளை வெளிப்படையாக முன்வையுங்கள், ஒரு புதிய திறனை வளர்த்து பெரிய பொறுப்புகளுக்குத் தயாராகுங்கள்.`,
        en: `Your tactical upgrade: document your real results clearly, sharpen one high-leverage skill, and stop turning down larger seats out of false modesty.` },
    reflection: isChildOrInfant
      ? { kn: `ಪೋಷಕರ ಅವಲೋಕನ: ಮಗು ಯಾವ ಆಟ ಅಥವಾ ಪ್ರಶ್ನೆಯಲ್ಲಿ ಗಂಟೆಗಟ್ಟಲೆ ಮಗ್ನವಾಗುತ್ತದೆ ಎಂದು ಗಮನಿಸಿ — ಅದೇ ಅದರ ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆಯ ದಿಕ್ಕು!`, mr: `पालकांनी पहावे: मूल कोणत्या गोष्टीत किंवा खेळात सर्वात जास्त रमते ते पहा — तीच त्याची नैसर्गिक आवड आहे!`, hi: `अभिभावक ध्यान दें: देखें कि बच्चा किस गतिविधि या सवाल में बिना थके खो जाता है—वही उसकी असली प्रतिभा का संकेत है!`, te: `తల్లిదండ్రుల పరిశీలన: చిన్నారి ఏ ఆటలో లేదా విషయంలో ఆసక్తిగా నిమగ్నమవుతుందో గమనించండి—అదే దాని భవిష్యత్ ప్రతిభకు సంకేతం!`, ta: `பெற்றோர் கவனம்: குழந்தை எந்தச் செயலில் சோர்வின்றி ஆர்வமாக ஈடுபடுகிறது எனப் பாருங்கள்—அதுவே அதன் எதிர்காலத் திறமை!`, en: `Parent Mirror: Notice what toy, sound, or question makes this child lose track of time—that spark is their earliest compass.` }
      : { kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ನಾನು ಮಾಡಿದ ಕೆಲಸಕ್ಕೆ ಬೇರೆಯವರು ಹೆಸರು ತೆಗೆದುಕೊಂಡರಲ್ಲ' ಎಂಬ ಬೇಸರ ಕಳೆದ ವರ್ಷದಲ್ಲಿ ನಿಮಗೆ ಒಮ್ಮೆಯಾದರೂ ಆಯಿತೇ? ಇನ್ನು ಆ ಅವಕಾಶ ಕೊಡಬೇಡಿ!`, mr: `स्व-परीक्षण: 'कष्ट मी केले आणि श्रेय भलत्याच कोणीतरी घेतले' असे गेल्या वर्षात वाटले होते का? आता तसे होऊ देऊ नका!`, hi: `स्वयं-निरीक्षण: क्या पिछले वर्ष कभी लगा कि 'मेहनत मैंने की और श्रेय कोई और ले गया'? अब यह अध्याय बदलने का समय है!`, te: `మిమ్మల్ని మీరు అడుగండి: గత ఏడాది 'కష్టపడింది నేను కానీ పేరు వేరొకరికి వచ్చింది' అని ఎప్పుడైనా అనిపించిందా? ఇక అలా జరగనివ్వకండి!`, ta: `சுய பரிசோதனை: கடந்த ஆண்டில் 'உழைத்தது நான், ஆனால் புகழ் வேறு யாருக்கோ சென்றதே' என்று எப்போதாவது வருந்தியதுண்டா? இனி அதற்கு இடமளிக்காதீர்கள்!`, en: `Pause & Check: Think back to last year—did you do the heavy lifting while someone louder collected the applause? That ends with this chapter.` },
    badge: { kn: "ವೃತ್ತಿ ದಿಕ್ಕು", mr: "कारकीर्द दिशा", hi: "कार्य क्षेत्र", te: "వృత్తి మార్గం", ta: "தொழில் திசை", en: "Life Work" },
    anchors: [`${house10Info.lordName}`, `SAV ${n(savByHouse[9])}`],
  });

  // CHAPTER 13 — Wealth & Finance (Strictly Minor-Safe!)
  list.push({
    n: 13, sec: 3, secTitle: sec3, icon: "💰", visual: "sav-pillars",
    title: isChildOrInfant
      ? { kn: "ವಂಶೋದ್ಧಾರ ಲಕ್ಷ್ಮಿ ಯೋಗ & ಮಗುವಿನ ಭವಿಷ್ಯದ ಭದ್ರತೆ", mr: "कौटुंबिक समृद्धी व मुलाचे सुरक्षित भविष्य", hi: "कौटुंबिक समृद्धि एवं बालक का सुरक्षित भविष्य", te: "కుటుంబ ఐశ్వర్యం & చిన్నారి భవిష్యత్ భద్రత", ta: "குடும்ப வளமை & குழந்தையின் பாதுகாப்பான எதிர்காலம்", en: "Family Fortune — Protective Abundance Around This Child" }
      : { kn: "ಧನ ಯೋಗ, ಹಣ ಉಳಿತಾಯ, ಸೋರಿಕೆ ತಡೆ & ಆಸ್ತಿ ವೃದ್ಧಿ", mr: "धनयोग, बचत, आर्थिक गळती रोखणे व संपत्ती वाढ", hi: "धन योग, संचय शक्ति, व्यय नियंत्रण एवं संपत्ति वृद्धि", te: "ధన యోగం, పొదుపు, వృథా ఖర్చుల నియంత్రణ & ఆస్తి", ta: "தன யோகம், சேமிப்பு, செலவுக் கட்டுப்பாடு & சொத்து வளர்ச்சி", en: "Wealth Flow — Why Money Moves Fast & How You Keep It" },
    question: isChildOrInfant
      ? { kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಮಗುವಿನ ಆಗಮನದಿಂದ ಕುಟುಂಬದ ಆರ್ಥಿಕ ಅದೃಷ್ಟದಲ್ಲಿ ಯಾವ ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆ ಕಾಣುತ್ತಿದೆ?`, mr: `प्रश्न: ${devoteeName}, या बाळाच्या जन्माने कुटुंबाच्या आर्थिक स्थैर्यावर कोणता शुभ प्रभाव पडत आहे?`, hi: `प्रश्न: ${devoteeName}, इस संतान के आगमन से परिवार के धन एवं समृद्धि पर क्या शुभ प्रभाव पड़ रहा है?`, te: `ప్రశ్న: ${devoteeName}, ఈ చిన్నారి రాకతో కుటుంబ ఆర్థిక పరిస్థితిలో ఎలాంటి శుభ మార్పులు వస్తున్నాయి?`, ta: `கேள்வி: ${devoteeName}, இந்தக் குழந்தையின் வருகையால் குடும்பப் பொருளாதாரத்தில் ஏற்படும் நன்மைகள் என்ன?`, en: `Question: ${devoteeName}, how does this child's birth wave strengthen long-term family security?` }
      : { kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಹಣ ಕೈಗೆ ಬರುತ್ತಿದ್ದರೂ 'ಎಲ್ಲಿ ಹೋಗುತ್ತಿದೆಯೋ ಗೊತ್ತಾಗುತ್ತಿಲ್ಲ' ಎನಿಸುವ ರಹಸ್ಯ ಏನು?`, mr: `प्रश्न: ${devoteeName}, हातात पैसे येऊनही ते हातात का टिकत नाहीत—ही आर्थिक गळती कशी थांबवायची?`, hi: `प्रश्न: ${devoteeName}, धन आने के बाद भी वह स्थिर क्यों नहीं टिक पाता और स्थायी समृद्धि कैसे बनेगी?`, te: `ప్రశ్న: ${devoteeName}, డబ్బు వస్తున్నా చేతిలో ఎందుకు నిలవడం లేదు—దీనిని మార్చే అసలైన రహస్యం ఏమిటి?`, ta: `கேள்வி: ${devoteeName}, பணம் வந்தாலும் கையில் தங்காமல் கரைவதன் ரகசியம் என்ன?`, en: `Question: ${devoteeName}, why does money enter your hands strongly yet disappear quietly before compounding?` },
    p1: isChildOrInfant
      ? { kn: `ಈ ಕಂದನ ಜಾತಕವು ಕುಟುಂಬದ ಆದಾಯ ಮತ್ತು ಮನೆ-ಆಸ್ತಿ ಕ್ಷೇತ್ರಕ್ಕೆ ಹೊಸ ಉತ್ಸಾಹ ತಂದಿದೆ. ಪೋಷಕರು ಶಿಸ್ತುಬದ್ಧವಾಗಿ ದೀರ್ಘಕಾಲದ ವಿದ್ಯಾನಿಧಿ ಜೋಡಿಸಿದರೆ ಮಗುವಿನ ಉನ್ನತ ಶಿಕ್ಷಣ ಹಂತದಲ್ಲಿ ಹಣಕಾಸಿನ ಕೊರತೆಯೇ ಬರುವುದಿಲ್ಲ.`, mr: `या बाळाचा जन्म कुटुंबाच्या संपत्तीत हळूहळू पण स्थिर भर घालणारा आहे. पालकांनी वेळेवर केलेली शैक्षणिक बचत पुढे मोठे बळ ठरेल.`, hi: `इस बालक के भाग्य से परिवार की आय और स्थिर संपत्ति में शुभ संयोग बना है। माता-पिता द्वारा की गई नियमित दीर्घकालिक बचत इसकी उच्च शिक्षा को निर्विघ्न बनाएगी।`, te: `ఈ చిన్నారి రాక కుటుంబ ఆర్థిక పురోగతికి శుభ సంకేతం. తల్లిదండ్రులు క్రమంగా చేసే చిన్న పొదుపులు కూడా భవిష్యత్తులో పెద్ద అండగా నిలుస్తాయి.`, ta: `இந்தக் குழந்தையின் ஜாதகம் குடும்பத்தின் நிதி நிலைமையில் நல்ல முன்னேற்றத்தைத் தருகிறது. பெற்றோர் அமைக்கும் நீண்டகாலக் கல்விச் சேமிப்பு பெரிய பலமாக இருக்கும்.`, en: `This child arrives carrying gentle fortune for the household. Steady, automated long-term family savings set aside quietly now will fund big educational dreams smoothly later.` }
      : { kn: `ನಿಮ್ಮ ಧನ-ಲಾಭ (${house2Info.lordName} ಮತ್ತು ${house11Info.lordName}) ಕಥೆ ಬಹಳ ಕುತೂಹಲಕಾರಿ: ನಿಮ್ಮಲ್ಲಿ ಹಣ ಸಂಪಾದಿಸುವ ಬುದ್ಧಿ ಮತ್ತು ಶ್ರಮ ಎರಡೂ ಇವೆ. ಆದರೆ 'ಮನಸ್ಸು ಸರಿ ಇಲ್ಲದಾಗ' ಅಥವಾ 'ಆಪ್ತರನ್ನು ಖುಷಿಪಡಿಸಲು' ಮಾಡುವ ಅನಿರೀಕ್ಷಿತ ಖರ್ಚುಗಳೇ ನಿಮ್ಮ ಉಳಿತಾಯವನ್ನು ನುಂಗುತ್ತಿವೆ!`, mr: `तुमची आर्थिक कथा मोठी रंजक आहे: पैसे कमावण्याची ताकद तुमच्यात पुरेपूर आहे, पण 'भावनिक होऊन' किंवा 'आपल्या लोकांना खुश ठेवण्यासाठी' केलेला खर्चच तुमची बचत खाऊन टाकतो!`, hi: `आपके धन की कहानी बड़ी दिलचस्प है: कमाने की क्षमता और परिश्रम दोनों आपमें भरपूर हैं, परंतु जब आप भावुक होकर या किसी अपने की अपेक्षा पूरी करने के लिए खर्च करते हैं, वहीं आपकी बचत बह जाती है!`, te: `మీ ధన కథనం చాలా ఆసక్తికరంగా ఉంటుంది: సంపాదించే తెలివితేటలు, శ్రమ మీలో పుష్కలంగా ఉన్నాయి. కానీ మీరు ఎవరినైనా సంతోషపెట్టడానికి లేదా భావోద్వేగంతో చేసే అనుకోని ఖర్చులే పొదుపును కరిగిస్తున్నాయి!`, ta: `உங்கள் பணக் கதை மிகவும் சுவாரசியமானது: சம்பாதிக்கும் திறமையும் உழைப்பும் உங்களிடம் நிறைய உள்ளன. ஆனால் உணர்ச்சிவசப்பட்டு அல்லது மற்றவர்களைத் திருப்திப்படுத்தச் செய்யும் எதிர்பாராத செலவுகளே சேமிப்பைக் கரைக்கின்றன!`, en: `Look closely at your wealth curve: earning ability is NOT your bottleneck. The real leak comes from generosity without fences—loaning to rescue friends, impulse upgrades when stressed, or hiding true costs to keep peace at home.` },
    p2: isChildOrInfant
      ? { kn: `ಪೋಷಕರಿಗೆ ರೋಚಕ ತಿರುವು: ಅನಗತ್ಯ ಆಡಂಬರದ ವಸ್ತುಗಳಿಗಿಂತ ಮಗುವಿನ ಆರೋಗ್ಯ ಮತ್ತು ಭವಿಷ್ಯದ ಕಲಿಕಾ ನಿಧಿಗೆ ಹಣ ಮೀಸಲಿಡುವುದೇ ನಿಜವಾದ ಲಕ್ಷ್ಮೀ ವೃದ್ಧಿ.`, mr: `महत्त्वाचे वळण: दिखाव्याच्या वस्तूंऐवजी मुलाच्या शिक्षणासाठी केलेल्या छोट्या गुंतवणुकीतूनच मोठे धनसौख्य लाभेल.`, hi: `विशेष मोड़: अनावश्यक दिखावे से बचकर केवल शिक्षा और स्वास्थ्य सुरक्षा पर ध्यान देना परिवार को अद्भुत समृद्धि देगा।`, te: `మలుపు: ఆడంబర ఖర్చులు తగ్గించి, చిన్నారి భవిష్యత్తు కోసం చేసే ప్రతి చిన్న పెట్టుబడి కుటుంబానికి అదృష్టాన్ని పెంచుతుంది.`, ta: `திருப்பம்: ஆடம்பர செலவுகளைக் குறைத்து, குழந்தையின் கல்விக்காக ஒதுக்கும் தொகை குடும்பத்திற்குப் பெரும் வளத்தைச் சேர்க்கும்.`, en: `The family twist: redirecting impulsive celebratory spending into quiet long-term child reserves multiplies household peace faster than chasing risky quick gains.` }
      : { kn: `ಹಣಕಾಸಿನ ದೊಡ್ಡ ತಿರುವು: ನೀವು 'ಹೆಚ್ಚು ಗಳಿಸುವ' ಹಿಂದೆ ಓಡುವ ಬದಲು 'ಖಾತೆಗೆ ಬಂದ ತಕ್ಷಣ ಮೊದಲು ಸ್ವಂತ ಉಳಿತಾಯ ಬೇರ್ಪಡಿಸುವ' ನಿಯಮ ಹಾಕಿಕೊಂಡ ಕೇವಲ ೬ ತಿಂಗಳಲ್ಲೇ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಸ್ಥಿತಿ ಕಣ್ಣು ಕುಕ್ಕುವಂತೆ ಬದಲಾಗುತ್ತದೆ!`, mr: `आर्थिक प्रगतीचा मोठा ट्विस्ट: तुम्ही फक्त उत्पन्न वाढवण्यापेक्षा 'पैसे येताच आधी स्वतःची बचत बाजूला काढण्याचा' नियम लावा — अवघ्या ६ महिन्यांत तुम्हाला फरक दिसेल!`, hi: `आर्थिक मोड़ यहीं है: अधिक कमाने की दौड़ के साथ यदि आप आय आते ही पहले अपना निश्चित अंश सुरक्षित करने का नियम बना लें, तो केवल ६ महीनों में आर्थिक स्थिरता चमत्कारी ढंग से बदल जाएगी!`, te: `ఆర్థిక మలుపు ఇక్కడే ఉంది: సంపాదన పెంచుకునే ప్రయత్నంతో పాటు, డబ్బు చేతికి రాగానే ముందుగా ఒక భాగాన్ని పక్కన పెట్టే అలవాటు చేసుకుంటే కేవలం 6 నెలల్లోనే మీ పరిస్థితి అద్భుతంగా మారుతుంది!`, ta: `பொருளாதாரத் திருப்பம்: வருமானம் வந்தவுடன் முதலில் ஒரு பகுதியைச் சேமிப்புக்கு ஒதுக்கிவிட்டு மீதியைச் செலவழிக்கும் பழக்கத்தைத் தொடங்கினால் 6 மாதங்களில் பெரும் மாற்றம் காண்பீர்கள்!`, en: `Here is your wealth turning point: you do not need risky gambling or extreme hustle—locking savings FIRST on day one before paying anyone else transforms your liquid reserve inside six calm months.` },
    p3: isChildOrInfant
      ? { kn: `ಕುಟುಂಬದ ಆರ್ಥಿಕ ಹೆಜ್ಜೆ: ಸರಳತೆ ಮತ್ತು ದೀರ್ಘಕಾಲದ ಸ್ಥಿರ ಉಳಿತಾಯವೇ ನಿಮ್ಮ ಮಗುವಿಗೆ ನೀಡುವ ಅತ್ಯುತ್ತಮ ಆಸ್ತಿ.`, mr: `साधा नियम: साधेपणा आणि शांत दीर्घकालीन बचत हीच मुलासाठी सर्वोत्तम ठेव आहे.`, hi: `कुटुंब सूत्र: सादगी और दीर्घकालिक सुरक्षित निवेश ही इस संतान के लिए सबसे बड़ी संपत्ति है।`, te: `కుటుంబ సూత్రం: నిరాడంబరత మరియు దీర్ఘకాలిక సురక్షిత పొదుపే చిన్నారికి ఇచ్చే గొప్ప ఆస్తి.`, ta: `குடும்ப நெறி: எளிமையான வாழ்க்கையும் நிலையான நீண்டகாலச் சேமிப்பும் குழந்தைக்கு மிகப்பெரிய சொத்தாகும்.`, en: `Keep household spending transparent and let patient, steady reserves compound silently for the years ahead.` }
      : { kn: `ಕಟ್ಟುನಿಟ್ಟಿನ ಆರ್ಥಿಕ ಗಡಿ: ${isMinor ? "ಹೊಸ ಹವ್ಯಾಸಗಳ ಮೂಲಕ ಕಲಿಕೆಗೆ ಒತ್ತು ನೀಡಿ." : "ಭಾವನೆಗೆ ಒಳಗಾಗಿ ಜಾಮೀನು ಸಹಿ ಹಾಕಬೇಡಿ ಮತ್ತು ೨೪ ಗಂಟೆ ಯೋಚಿಸದೆ ದೊಡ್ಡ ಖರೀದಿ ಮಾಡಬೇಡಿ."}`, mr: `आर्थिक मर्यादा: ${isMinor ? "नवीन कौशल्ये शिकून पुढे जा." : "भावनिक दबावाखाली कोणालाही जामीन राहू नका व २४ तास विचार केल्याशिवाय मोठा खर्च करू नका."}`, hi: `आर्थिक सीमा: ${isMinor ? "विद्या एवं रचनात्मक कौशल बढ़ाएं।" : "भावना में बहकर किसी के लिए गारंटी न दें और २४ घंटे सोचे बिना बड़ा खर्च न करें।"}`, te: `ఆర్థిక నియమం: ${isMinor ? "చదువు మరియు కొత్త నైపుణ్యాలపై దృష్టి పెట్టండి." : "మొహమాటానికి పోయి ఎవరికీ పూచీకత్తు ఉండకండి; 24 గంటలు ఆలోచించాకే పెద్ద కొనుగోళ్లు చేయండి."}`, ta: `நிதி எல்லை: ${isMinor ? "கல்வியிலும் புதிய திறன்களிலும் கவனம் செலுத்துங்கள்." : "உணர்ச்சிவசப்பட்டு யாருக்கும் பொறுப்பேற்காதீர்கள்; 24 மணி நேரம் யோசித்த பிறகே பெரிய செலவு செய்யுங்கள்."}`, en: `Golden money fence: ${isMinor ? "invest energy into foundational skills that pay lifelong dividends." : "sleep 24 hours on non-essential purchases and stop co-signing favors just to avoid awkwardness."}` },
    reflection: isChildOrInfant
      ? { kn: `ಪೋಷಕರ ಪರಿಶೀಲನೆ: ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿದ ಒಂದು ಸಣ್ಣ ಉಳಿತಾಯ ಖಾತೆ ಮುಂದೆ ಎಷ್ಟು ದೊಡ್ಡ ಭರವಸೆಯಾಗಬಲ್ಲದು ಯೋಚಿಸಿ ನೋಡಿ.`, mr: `विचार करा: मुलाच्या नावाने आज केलेली छोटी बचत पुढे किती मोठा आधार ठरेल!`, hi: `सोचें: बालक के नाम आज शुरू की गई छोटी-सी नियमित बचत भविष्य में कितना बड़ा संबल बनेगी!`, te: `ఆలోచించండి: చిన్నారి పేరుతో ప్రారంభించే చిన్న పొదుపు భవిష్యత్తులో ఎంత పెద్ద భరోసాగా నిలుస్తుందో!`, ta: `சிந்தியுங்கள்: குழந்தையின் பெயரில் தொடங்கும் சிறிய சேமிப்பு எதிர்காலத்தில் எவ்வளவு பெரிய பலமாக இருக்கும்!`, en: `Parent Mirror: Notice how much calmer family money feels the moment an automated monthly education reserve runs quietly in the background.` }
      : { kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಕಳೆದ ೬ ತಿಂಗಳಲ್ಲಿ ನೀವು 'ಬೇಡ ಅನ್ನಲಾರದೆ' ಖರ್ಚು ಮಾಡಿದ ಹಣ ಎಷ್ಟು ಎಂದು ಲೆಕ್ಕ ಹಾಕಿದರೆ ಆಶ್ಚರ್ಯವಾಗುತ್ತದೆಯೇ?`, mr: `स्व-परीक्षण: गेल्या ६ महिन्यांत केवळ 'नाही म्हणता न आल्यामुळे' किती पैसे गेले याचा हिशोब करून पहा!`, hi: `स्वयं-निरीक्षण: क्या कभी हिसाब लगाया है कि पिछले ६ महीनों में केवल 'ना न कह पाने' की वजह से कितना धन खर्च हो गया?`, te: `మిమ్మల్ని మీరు అడుగండి: గత 6 నెలల్లో కేవలం 'మొహమాటం కొద్దీ' ఎంత ఖర్చు చేశారో ఒక్కసారి లెక్కవేసుకోండి!`, ta: `சுய பரிசோதனை: கடந்த 6 மாதங்களில் 'மறுக்க முடியாமல்' செலவழித்த தொகை எவ்வளவு என்று கணக்கிட்டுப் பார்த்திருக்கிறீர்களா?`, en: `Pause & Check: Add up how much money left your pocket in the last six months simply because you were too polite to say "not right now."` },
    badge: { kn: "ಧನ ಸುರಕ್ಷೆ", mr: "बचत सूत्र", hi: "धन संरक्षण", te: "ధన రక్షణ", ta: "செல்வப் பாதுகாப்பு", en: "Wealth Guard" },
    anchors: [`${house2Info.lordName}`, `${house11Info.lordName}`],
  });

  // CHAPTER 14 — Relationships & Love (Strictly Minor-Safe!)
  list.push({
    n: 14, sec: 3, secTitle: sec3, icon: "❤️", visual: "sav-pillars",
    title: isChildOrInfant
      ? { kn: "ಪೋಷಕರ ವಾತ್ಸಲ್ಯ, ಮನೆಯ ಶಾಂತಿ & ಬಾಲ್ಯದ ಸೌಹಾರ್ದತೆ", mr: "आई-वडिलांचे प्रेम, घरातील वातावरण व भावनिक सुरक्षा", hi: "माता-पिता का स्नेह, गृह सौहार्द एवं बाल्य सुरक्षा", te: "తల్లిదండ్రుల ప్రేమ, ఇంటి వాతావరణం & ఆనందం", ta: "பெற்றோர் பாசம், இல்லற அமைதி & குழந்தைப் பருவ மகிழ்ச்சி", en: "Warm Home Bond — Parental Care & Peaceful Upbringing" }
      : { kn: "ಪ್ರೀತಿ, ದಾಂಪತ್ಯ / ಸಂಬಂಧಗಳ ಅಂತರಂಗ & ತಪ್ಪು ತಿಳುವಳಿಕೆ ನಿವಾರಣೆ", mr: "नातेसंबंध, प्रेम, वैवाहिक सलोखा व गैरसमज निवारण", hi: "प्रेम, दाम्पत्य, निकट संबंध एवं गलतफहमी का समाधान", te: "ప్రేమ, దాంపత్యం, అనుబంధాలు & అపార్థాల తొలగింపు", ta: "அன்பு, திருமண உறவு, ஒற்றுமை & மனக்கசப்பு தீர்வு", en: "Love & Close Bonds — What Happens Behind Closed Doors" },
    question: isChildOrInfant
      ? { kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪೋಷಕರ ಪ್ರೀತಿ ಹಾಗೂ ಮನೆಯ ಶಾಂತ ವಾತಾವರಣ ಈ ಮಗುವಿನ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಹೇಗೆ ರೂಪಿಸುತ್ತದೆ?`, mr: `प्रश्न: ${devoteeName}, आई-वडिलांच्या सहवासाचा आणि घरातील शांततेचा या बाळाच्या मनावर काय परिणाम होतो?`, hi: `प्रश्न: ${devoteeName}, माता-पिता का धैर्य और घर का शांत वातावरण इस बच्चे के मन को कैसे संवारता है?`, te: `ప్రశ్న: ${devoteeName}, తల్లిదండ్రుల ప్రేమ మరియు ఇంటి ప్రశాంతత ఈ చిన్నారి మనసుపై ఎలాంటి ప్రభావం చూపుతాయి?`, ta: `கேள்வி: ${devoteeName}, பெற்றோரின் அன்பும் வீட்டின் அமைதியும் குழந்தையின் மனதை எப்படி உருவாக்கும்?`, en: `Question: ${devoteeName}, how does home harmony shape this child's emotional security?` }
      : { kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನೀವು ಅತಿಯಾಗಿ ಕಾಳಜಿ ತೋರಿಸಿದ ಸಂಬಂಧದಲ್ಲೇ ಯಾಕೆ ಒಮ್ಮೊಮ್ಮೆ ಮೌನ ಗೋಡೆ ಏಳುತ್ತದೆ?`, mr: `प्रश्न: ${devoteeName}, तुम्ही ज्या नात्यात सर्वात जास्त जीव ओतता, तिथेच कधीकधी अबोला का येतो?`, hi: `प्रश्न: ${devoteeName}, जिस रिश्ते में आप सबसे अधिक समर्पण देते हैं, वहीं कभी-कभी चुप्पी की दीवार क्यों आ जाती है?`, te: `ప్రశ్న: ${devoteeName}, మీరు ఎంతో ప్రేమ చూపే బంధంలోనే అప్పుడప్పుడు ఎందుకు అపార్థాలు వస్తున్నాయి?`, ta: `கேள்வி: ${devoteeName}, நீங்கள் அதிகம் அக்கறை காட்டும் உறவிலேயே ஏன் சில நேரங்களில் இடைவெளி ஏற்படுகிறது?`, en: `Question: ${devoteeName}, why can the relationships you care about most feel miles apart over the smallest tone of voice?` },
    p1: isChildOrInfant
      ? { kn: `ಈ ಪುಟ್ಟ ಕಂದಮ್ಮನಿಗೆ ಪೋಷಕರ ನಗು ಮತ್ತು ಶಾಂತ ಮಾತುಗಳೇ ದೊಡ್ಡ ಶಕ್ತಿ! ಮನೆಯಲ್ಲಿ ಒಬ್ಬರಿಗೊಬ್ಬರು ಪ್ರೀತಿಯಿಂದ ಮಾತನಾಡುವ ವಾತಾವರಣ ಇದ್ದರೆ, ಮಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸವು ಬೆಟ್ಟದಷ್ಟು ಗಟ್ಟಿಯಾಗುತ್ತದೆ.`, mr: `या चिमुकल्यासाठी आई-वडिलांचे हसरे व शांत बोलणे हेच खरे टॉनिक आहे! घरातील प्रेमळ संवादातून मुलाचे मन अत्यंत खंबीर व आनंदी राहते.`, hi: `इस बच्चे के लिए माता-पिता की मुस्कान और घर का शांत संवाद ही सबसे बड़ी सुरक्षा है। घर में आपसी प्रेम देखकर इसका आत्मविश्वास चट्टान जैसा मज़बूत बनता है।`, te: `ఈ చిన్నారికి తల్లిదండ్రుల నవ్వు మరియు ఇంట్లోని ప్రశాంత వాతావరణమే అసలైన రక్షణ! ఇంట్లో ప్రేమగా మాట్లాడుకుంటే చాలు, చిన్నారిలో ఎనలేని ధైర్యం పెరుగుతుంది.`, ta: `இந்தக் குழந்தைக்குப் பெற்றோரின் சிரிப்பும் வீட்டின் அமைதியான பேச்சுமே பெரிய பலம்! வீட்டில் அன்பான சூழல் இருந்தால் குழந்தையின் தன்னம்பிக்கை பலமடங்கு பெருகும்.`, en: `A child of this star reads emotional temperature like a sponge. Calm voices, affectionate listening, and warm family harmony build deeper courage in this child than any strict lecture ever could.` }
      : isUnmarried
      ? { kn: `ನಿಮ್ಮ ಪ್ರೀತಿ-ಸಂಗಾತಿ (${house7Info.lordName}) ಅಧ್ಯಾಯ ಬಹಳ ಸೂಕ್ಷ್ಮವಾಗಿದೆ: ನೀವು ಹೊರಗಿನ ಆಡಂಬರಕ್ಕೆ ಮನಸೋಲುವವರಲ್ಲ; 'ನನ್ನ ಮೌನವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ' ಪ್ರಾಮಾಣಿಕ ಮನಸ್ಸನ್ನು ಹುಡುಕುತ್ತೀರಿ. ಅದೇ ಕಾರಣಕ್ಕೆ ಸಣ್ಣ ಅಹಂಕಾರ ಕಂಡರೂ ನಿಮ್ಮ ಮನಸ್ಸು ತಕ್ಷಣ ಹಿಂದೆ ಸರಿಯುತ್ತದೆ.`, mr: `तुमच्या जोडीदाराची व नात्यांची अपेक्षा अगदी वेगळी आहे: तुम्हाला वरवरचा दिखावा नको, तर तुमचे मन वाचणारी प्रामाणिक साथ हवी असते — म्हणूनच समोरच्यात थोडाही अहंकार दिसला की तुम्ही मनाने दूर जाता.`, hi: `आपके जीवनसाथी एवं संबंधों का सच यह है: आप बाहरी दिखावे से प्रभावित नहीं होते, बल्कि ऐसा ईमानदार साथ चाहते हैं जो आपकी अनकही भावना समझे—इसलिए थोड़ा सा भी अहंकार दिखने पर आप पीछे हट जाते हैं।`, te: `మీ అనుబంధాల కథ చాలా సున్నితమైనది: మీరు పైపై మెరుగులకు ఆకర్షితులు కారు—మీ మనసును అర్థం చేసుకునే నిజాయితీగల తోడును కోరుకుంటారు. అందుకే చిన్న అహంకారం కనిపించినా వెంటనే వెనకడుగు వేస్తారు.`, ta: `உங்கள் உறவுப் பார்வை மிகவும் ஆழமானது: வெளிப் பகட்டுக்கு மயங்காமல் உங்கள் மௌனத்தைப் புரிந்துகொள்ளும் நேர்மையான மனதைத் தேடுகிறீர்கள்—அதனால்தான் சிறு ஆணவம் தெரிந்தாலும் விலகிவிடுகிறீர்கள்.`, en: `Look closely at your relationship lens: shallow charm leaves you cold. You want a loyal teammate who reads what you leave unsaid—which is why even subtle arrogance or half-truths make you pull the drawbridge up immediately.` }
      : { kn: `ನಿಮ್ಮ ದಾಂಪತ್ಯ, ಜೀವನ ಸಂಗಾತಿ ಮತ್ತು ಆಪ್ತ ಸಂಬಂಧಗಳ (${house7Info.lordName}) ಕಥೆಯಿದು: ನಿಮ್ಮಲ್ಲಿ ಪ್ರೀತಿ ಕಡಿಮೆಯಲ್ಲ, ಆದರೆ ನೀವು ಪ್ರೀತಿಯನ್ನು 'ಮಾತಿನಲ್ಲಿ ಹೇಳುವುದಕ್ಕಿಂತ ಜವಾಬ್ದಾರಿ ನಿಭಾಯಿಸುವುದರಲ್ಲಿ' ತೋರಿಸುತ್ತೀರಿ! ಪ್ರೀತಿಪಾತ್ರರು ಪ್ರೀತಿಯ ಎರಡು ಮಾತು ನಿರೀಕ್ಷಿಸಿದಾಗ ನಿಮ್ಮ ಗಂಭೀರ ಮೌನವೇ ಅವರಿಗೆ ತಪ್ಪು ತಿಳುವಳಿಕೆ ತರುತ್ತದೆ.`, mr: `तुमच्या नात्यांमधील खरी गोष्ट: तुमच्या मनात प्रेम अपार आहे, पण ते बोलून दाखवण्यापेक्षा जबाबदारी पार पाडून तुम्ही व्यक्त करता! समोरच्याला मात्र प्रेमाचे दोन गोड शब्द हवे असतात — इथेच गैरसमज सुरू होतात.`, hi: `आपके संबंधों की असली कहानी: आपके हृदय में प्रेम की कमी नहीं है, परंतु आप उसे शब्दों से जताने के बजाय कर्तव्य निभाकर दिखाते हैं! जब सामने वाला दो मीठे शब्दों की प्रतीक्षा करता है, तभी आपकी चुप्पी दूरी बना देती है।`, te: `మీ దాంపత్య, ఆత్మీయ బంధాల సత్యం: మీలో ప్రేమ తక్కువ లేదు, కానీ దానిని మాటల్లో చెప్పడం కంటే బాధ్యతలు మోయడంలో చూపిస్తారు! ఎదుటివారు ఆత్మీయంగా రెండు మాటలు ఆశించినప్పుడు మీ మౌనమే అపార్థానికి దారితీస్తోంది.`, ta: `உங்கள் இல்லற மற்றும் நெருக்கமான உறவுகளின் உண்மை: உங்களிடம் அன்பு குறைவாக இல்லை—ஆனால் அதை வார்த்தைகளால் சொல்வதை விடப் பொறுப்புகளைச் சுமந்து காட்டுகிறீர்கள்! அன்பான இரு வார்த்தைகளை மற்றவர் எதிர்பார்க்கும்போது உங்கள் அமைதியே இடைவெளியாக்குகிறது.`, en: `Here is the hidden pattern in your closest bond: love inside you runs deep, yet you express care by fixing duties rather than voicing affection out loud. When your partner simply wants to feel heard, silence feels like distance.` },
    p2: isChildOrInfant
      ? { kn: `ಕುಟುಂಬದ ಆಪ್ತ ಸತ್ಯ: ಮಗು ತಪ್ಪು ಮಾಡಿದಾಗ ಗದರುವುದಕ್ಕಿಂತ 'ಏಕೆ ಹೀಗೆ ಆಯ್ತು?' ಎಂದು ಪ್ರೀತಿಯಿಂದ ಕೇಳಿದರೆ ಪೋಷಕರ ಮಾತು ಜೀವನಪರ್ಯಂತ ಹೃದಯದಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.`, mr: `प्रेमळ सूत्र: चूक झाल्यावर रागावण्याऐवजी शांतपणे समजावले तर या बाळाचे मन आयुष्यभर तुमच्या जवळ राहील.`, hi: `अनमोल संकेत: डांटने के बजाय शांति से कारण समझाने पर यह बच्चा जीवन भर अभिभावकों की हर बात को आदर देगा।`, te: `కుటుంబ సూత్రం: పొరపాటు చేసినప్పుడు కోప్పడకుండా ప్రేమగా వివరిస్తే, తల్లిదండ్రుల మాట చిన్నారి మనసులో చిరస్థాయిగా నిలుస్తుంది.`, ta: `குடும்ப நெறி: தவறு செய்யும்போது சத்தமிடாமல் அன்பாகப் புரியவைத்தால் பெற்றோரின் சொல் வாழ்நாள் முழுவதும் துணை நிற்கும்.`, en: `Key insight for parents: gentle explanation turns mistakes into lasting trust—harsh tension closes this sensitive heart quickly.` }
      : { kn: `ಸಂಬಂಧದ ತಿರುವು: ಅನೇಕ ಬಾರಿ ನೀವು 'ಅವರು ನನ್ನನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬೇಕು' ಎಂದು ಮೌನವಾಗಿದ್ದರೆ, ಅವರೂ 'ನೀವು ಯಾಕೆ ಹೀಗೆ ದೂರವಿದ್ದೀರಿ?' ಎಂದು ಗೊಂದಲದಲ್ಲೇ ಇರುತ್ತಾರೆ! ಒಂದೇ ಒಂದು ಮುಕ್ತ ಮಾತು ಅರ್ಧದಷ್ಟು ಮುನಿಸನ್ನು ೫ ನಿಮಿಷದಲ್ಲಿ ಕರಗಿಸಿಬಿಡುತ್ತದೆ.`, mr: `नात्यातील सुंदर वळण: अनेकदा तुम्ही 'त्यांनी आपणहून समजून घ्यावे' म्हणून गप्प बसता, आणि समोरचा 'तुम्ही शांत का आहात' या विचारात अडकतो! ५ मिनिटांचा मोकळा संवाद अर्धा ताण क्षणात विरघळवतो.`, hi: `संबंधों का प्यारा मोड़: कई बार आप सोचते हैं 'वे बिना कहे समझ लें' और सामने वाला सोचता है 'ये नाराज़ क्यों हैं'! ५ मिनट का खुला, शांत संवाद आधे मनमुटाव को पल में पिघला देता है।`, te: `ఇక్కడ ఉన్న మలుపు: మీరు 'వారే అర్థం చేసుకోవాలి కదా' అని మౌనంగా ఉంటే, వారు 'మీరెందుకు దూరంగా ఉంటున్నారు?' అని అపార్థం చేసుకుంటారు! కేవలం ఐదు నిమిషాల ఆత్మీయ సంభాషణ సగం దూరాన్ని తగ్గిస్తుంది.`, ta: `உறவுத் திருப்பம்: 'அவர்களாகவே புரிந்துகொள்ள வேண்டும்' என நீங்கள் அமைதியாக இருந்தால், அவர்கள் 'ஏன் ஒதுங்கிப் போகிறீர்கள்?' என்று குழம்புகிறார்கள்! 5 நிமிட மனம் திறந்த பேச்சு பாதிப் பிணக்கைக் கரைத்துவிடும்.`, en: `The plot twist inside love and partnerships: half the distance happened because you waited for someone to mind-read your silence while they wondered why you went cold. Five minutes of honest, calm conversation unlocks years of stuck pride.` },
    p3: isChildOrInfant
      ? { kn: `ಪೋಷಕರ ಜೊತೆ: ಪ್ರತಿದಿನ ಮಲಗುವ ಮುನ್ನ ೧೦ ನಿಮಿಷ ಮಗುವಿನ ಮಾತುಗಳನ್ನು ತಾಳ್ಮೆಯಿಂದ ಕೇಳಿ — ಅದೇ ಅದಕ್ಕೆ ದೊಡ್ಡ ಭರವಸೆ.`, mr: `दररोजचा सोपा वेळ: झोपण्यापूर्वी १० मिनिटे मुलाच्या दिवसभराच्या गप्पा शांतपणे ऐका.`, hi: `नित्य प्रेम सूत्र: रात्रि शयन से पूर्व १० मिनट बच्चे की दिनभर की बातें ध्यान से सुनें।`, te: `రోజువారీ అలవాటు: నిద్రపోయే ముందు 10 నిమిషాలు చిన్నారి కబుర్లు ఓపికగా వినండి—అదే దానికి పెద్ద భరోసా.`, ta: `தினசரி அன்பு: இரவு தூங்கும் முன் 10 நிமிடங்கள் குழந்தையின் கதைகளைப் பொறுமையாகக் கேளுங்கள்.`, en: `Gift this child ten unhurried minutes every night to talk about their day—presence creates unshakable peace.` }
      : { kn: `ನಿಮ್ಮ ಪ್ರೀತಿಯ ಹೆಜ್ಜೆ: ವಾದದಲ್ಲಿ 'ಯಾರು ಗೆದ್ದರು?' ಎನ್ನುವುದಕ್ಕಿಂತ 'ಸಂಬಂಧ ಉಳಿಯಿತೇ?' ಎಂಬುದಕ್ಕೆ ಮಹತ್ವ ಕೊಡಿ; ನಿಮ್ಮ ದಾಂಪತ್ಯ / ಬಾಂಧವ್ಯ ಹೊಸ ಸೌಹಾರ್ದತೆ ಪಡೆಯುತ್ತದೆ.`, mr: `पुढील पाऊल: वादात 'मी जिंकलो का?' पेक्षा 'नाते जपले गेले का?' याला प्राधान्य द्या.`, hi: `सही कदम: बहस में 'कौन जीता' से अधिक 'रिश्ता बचा या नहीं' को प्राथमिकता दें; जीवन में अद्भुत मिठास लौटेगी।`, te: `మీ ప్రేమపూరిత అడుగు: వాదనలో 'ఎవరు గెలిచారు?' అనే దానికంటే 'మన అనుబంధం నిలిచిందా?' అనేదానికి విలువ ఇవ్వండి.`, ta: `உங்கள் அடுத்த அடியெடுப்பு: விவாதத்தில் 'யார் வென்றார்?' என்பதை விட 'உறவு நலமாக உள்ளதா?' என்பதற்கு முக்கியத்துவம் கொடுங்கள்.`, en: `Your relationship upgrade: trade silent score-keeping for clear, warm honesty—and choose protecting the bond over winning minor arguments.` },
    reflection: isChildOrInfant
      ? { kn: `ಪೋಷಕರ ಅವಲೋಕನ: ಮನೆಯಲ್ಲೇನಾದರೂ ನಗು ಜೋರಾದಾಗ ಮಗುವಿನ ಮುಖ ಹೇಗೆ ಅರಳುತ್ತದೆ ಎಂದು ಗಮನಿಸಿದ್ದೀರಾ?`, mr: `पहा: घरात आनंदी वातावरण असले की बाळाची ऊर्जा कशी द्विगुणित होते!`, hi: `देखें: घर में हंसी-खुशी रहने पर इस बच्चे की चमक कैसे दोगुनी हो जाती है!`, te: `గమనించండి: ఇంట్లో నవ్వులు పూసినప్పుడు చిన్నారి కళ్ళలో ఎంత వెలుగు కనిపిస్తుందో!`, ta: `பாருங்கள்: வீட்டில் மகிழ்ச்சியான சிரிப்பு இருக்கும்போது குழந்தையின் முகம் எவ்வளவு பிரகாசமாக மாறுகிறது!`, en: `Parent Mirror: Notice how instantly this child brightens the moment laughter fills the living room.` }
      : { kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಈ ವಾರ ನಿಮ್ಮ ಆಪ್ತರಿಗೆ ಯಾವುದೇ ಸಲಹೆ ಕೊಡದೆ, ಬರೀ ಪ್ರೀತಿಯಿಂದ ಅವರ ಮಾತನ್ನು ಕೇಳಿ ನೋಡಿ — ಬದಲಾವಣೆ ನೀವೇ ಕಾಣುತ್ತೀರಿ!`, mr: `स्व-परीक्षण: या आठवड्यात समोरच्याला सल्ला न देता फक्त प्रेमाने त्यांचे बोलणे ऐकून पहा — चमत्कार दिसेल!`, hi: `स्वयं-निरीक्षण: इस सप्ताह बिना कोई सलाह दिए केवल ध्यान से अपने प्रियजन की बात सुनकर देखें—फर्क स्वयं महसूस होगा!`, te: `మిమ్మల్ని మీరు అడుగండి: ఈ వారం ఎలాంటి సలహా ఇవ్వకుండా కేవలం ప్రేమతో మీ ఆప్తుల మాటలు విని చూడండి—మార్పు మీకే తెలుస్తుంది!`, ta: `சுய பரிசோதனை: இந்த வாரம் எந்த அறிவுரையும் சொல்லாமல், அன்பாக உங்கள் அன்புக்குரியவரின் பேச்சைக் கேட்டுப் பாருங்கள்—மாற்றத்தை நீங்களே உணர்வீர்கள்!`, en: `Pause & Check: Notice how one person in your life softens completely the moment you listen without rushing to fix or defend.` },
    badge: { kn: "ಬಾಂಧವ್ಯ ಬೆಳಕು", mr: "नातेसंबंध", hi: "संबंध सूत्र", te: "ఆత్మీయత", ta: "உறவு ஒளி", en: "Heart Mirror" },
    anchors: [isChildOrInfant ? `${nakshatraName}` : `${house7Info.lordName}`, `SAV ${n(savByHouse[6])}`],
  });

  // CHAPTER 15 — Children, Creativity & Lineage
  list.push({
    n: 15, sec: 3, secTitle: sec3, icon: "🌱", visual: "sav-pillars",
    title: {
      kn: isChildOrInfant ? "ಮಗುವಿನ ಕುತೂಹಲ, ಸೃಜನಶೀಲತೆ & ವಂಶ ಗೌರವ" : "ಸಂತಾನ ಭಾಗ್ಯ, ಸೃಜನಶೀಲತೆ, ವಂಶ ಪರಂಪರೆ & ಬುದ್ಧಿ ಫಲ",
      mr: isChildOrInfant ? "मुलाची सृजनशीलता व कौशल्य विकास" : "संतती सुख, सृजनशीलता व कुटुंब परंपरा",
      hi: isChildOrInfant ? "बालक की सृजनशीलता एवं कौशल विकास" : "संतान सुख, रचनात्मकता एवं कुल की प्रतिष्ठा",
      te: isChildOrInfant ? "చిన్నారి సృజనాత్మకత & ప్రతిభ" : "సంతాన సౌభాగ్యం, సృజనాత్మకత & వంశ గౌరవం",
      ta: isChildOrInfant ? "குழந்தையின் படைப்பாற்றல் & தனித்திறன்" : "சந்தான பாக்கியம், படைப்பாற்றல் & குடும்பப் பெருமை",
      en: isChildOrInfant ? "Creative Gifts & Family Pride" : "Progeny, Creative Spark & Lasting Legacy",
    },
    question: {
      kn: isChildOrInfant
        ? `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಮಗುವು ದೊಡ್ಡದಾದಂತೆ ಯಾವ ಬಗೆಯ ಕಲೆ ಅಥವಾ ಹೊಸ ಆಲೋಚನೆಯಲ್ಲಿ ವಂಶಕ್ಕೆ ಕೀರ್ತಿ ತರಬಲ್ಲದು?`
        : `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ೫ನೇ ಮನೆಯ ಶಕ್ತಿಯು ಸಂತಾನ, ವಿದ್ಯೆ ಹಾಗೂ ನಿಮ್ಮ ಹೊಸ ಸೃಜನಶೀಲ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಏನು ಹೇಳುತ್ತದೆ?`,
      mr: isChildOrInfant
        ? `प्रश्न: ${devoteeName}, मोठे झाल्यावर हे मूल कोणत्या क्षेत्रात कुटुंबाचे नाव उज्ज्वल करेल?`
        : `प्रश्न: ${devoteeName}, तुमच्या पाचव्या स्थानाची ताकद संतती, शिक्षण व तुमच्या नव्या कल्पनांबद्दल काय सांगते?`,
      hi: isChildOrInfant
        ? `प्रश्न: ${devoteeName}, बड़ा होकर यह बच्चा किस रचनात्मक क्षेत्र में परिवार का नाम रोशन करेगा?`
        : `प्रश्न: ${devoteeName}, आपका पंचम भाव संतान, ज्ञान एवं आपके मौलिक विचारों के बारे में क्या कथा सुनाता है?`,
      te: isChildOrInfant
        ? `ప్రశ్న: ${devoteeName}, ఈ చిన్నారి పెద్దయ్యాక ఏ రంగంలో కుటుంబానికి మంచి పేరు తెస్తుంది?`
        : `ప్రశ్న: ${devoteeName}, మీ పంచమ స్థానం సంతానం, జ్ఞానం మరియు మీ సృజనాత్మక ఆలోచనల గురించి ఏమి చెబుతోంది?`,
      ta: isChildOrInfant
        ? `கேள்வி: ${devoteeName}, இந்தக் குழந்தை வளர்ந்ததும் எந்தத் துறையில் குடும்பத்திற்குப் பெருமை சேர்க்கும்?`
        : `கேள்வி: ${devoteeName}, உங்கள் ஐந்தாம் பாவம் சந்தானம், அறிவு மற்றும் உங்கள் புதிய முயற்சிகளைப் பற்றி என்ன கூறுகிறது?`,
      en: isChildOrInfant
        ? `Question: ${devoteeName}, what original creative flair inside this child is waiting to blossom?`
        : `Question: ${devoteeName}, what hidden creative power, intellect, and generational legacy run through your 5th house story?`,
    },
    p1: {
      kn: `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮ ಸ್ಥಾನ (${house5Info.lordName}) ಕೇವಲ ಮಕ್ಕಳನ್ನು ಮಾತ್ರವಲ್ಲ — ನಿಮ್ಮ ಮೆದುಳಿನಲ್ಲಿ ಹುಟ್ಟುವ ಪ್ರತಿಯೊಂದು ಹೊಸ ಆಲೋಚನೆ, ವಿದ್ಯೆ ಮತ್ತು ಹೃದಯದ ಸಂತೋಷವನ್ನು ತೋರಿಸುತ್ತದೆ. ನಿಮ್ಮಲ್ಲಿರುವ 'ವಿಷಯವನ್ನು ಸುಂದರವಾಗಿ ಕಟ್ಟುವ' ಕಲೆ ಇತರರಲ್ಲಿ ಅಪರೂಪ.`,
      mr: `तुमच्या कुंडलीतील पाचवे स्थान (${house5Info.lordName}) केवळ संततीच नव्हे, तर तुमच्या डोक्यातील प्रत्येक नवी कल्पना, कला आणि मानसिक आनंद दर्शवते. कोणताही विषय नेटकेपणाने मांडण्याची तुमची शैली खास आहे.`,
      hi: `आपका पंचम भाव (${house5Info.lordName}) केवल संतान ही नहीं, बल्कि आपके भीतर जन्म लेने वाले हर नए विचार, ज्ञान और हार्दिक आनंद का केंद्र है। किसी विषय को सरल और सुंदर ढंग से गढ़ने की क्षमता आपमें अनूठी है।`,
      te: `మీ 5వ స్థానం (${house5Info.lordName}) కేవలం సంతానాన్ని మాత్రమే కాదు—మీలోని విజ్ఞానాన్ని, సృజనాత్మకతను మరియు మనోల్లాసాన్ని చూపుతుంది. ఏ విషయాన్నైనా అందంగా తీర్చిదిద్దే కళ మీకు ఉంది.`,
      ta: `உங்கள் 5-ம் பாவம் (${house5Info.lordName}) சந்தானத்தை மட்டுமல்ல—உங்கள் மனதில் பிறக்கும் புதிய சிந்தனைகள், கல்வி மற்றும் மகிழ்ச்சியையும் காட்டுகிறது. எதையும் நேர்த்தியாக வடிவமைக்கும் திறன் உங்களிடம் உண்டு.`,
      en: `Your 5th house story (${house5Info.lordName}) represents far more than lineage—it governs joy, intuition, teaching, and original creation. You possess a rare gift for turning messy ideas into something clear, lasting, and uplifting.`,
    },
    p2: {
      kn: `ತಿರುವು ಏನೆಂದರೆ: 'ಬರೀ ಕರ್ತವ್ಯ ಮಾಡಿದರೆ ಸಾಕು, ಸಂತೋಷ-ಹವ್ಯಾಸ ಆಮೇಲೆ' ಎಂದು ನಿಮ್ಮೊಳಗಿನ ಕಲೆ-ಕುತೂಹಲವನ್ನು ನೀವು ಅದುಮಿಟ್ಟಾಗಲೆಲ್ಲಾ ಬದುಕು ಯಾಂತ್ರಿಕವಾಗಿ ಬೋರ್ ಎನಿಸಿದೆ! ನೀವು ಹೃದಯಕ್ಕೆ ಖುಷಿ ಕೊಡುವ ಕೆಲಸಕ್ಕೆ ಸ್ವಲ್ಪ ಸಮಯ ಕೊಟ್ಟ ತಕ್ಷಣ ಅದೃಷ್ಟವೂ ನಗಲು ಶುರುವಾಗುತ್ತದೆ.`,
      mr: `यातला ट्विस्ट असा आहे: 'फक्त कर्तव्य पूर्ण करायचे' या नादात जेव्हा तुम्ही तुमच्या छंदांना दाबता, तेव्हाच आयुष्य कंटाळवाणे वाटू लागते! मनाला आनंद देणाऱ्या सृजनात्मक गोष्टीला वेळ दिला की नशीबही फुलू लागते.`,
      hi: `कहानी का मोड़ यह है: जब भी आप केवल 'कर्तव्य पूरा करने' के दबाव में अपनी रुचियों और आनंद को दबा देते हैं, तभी जीवन नीरस लगने लगता है! अपनी रचनात्मकता को थोड़ा सा स्थान देते ही ऊर्जा फिर से खिल उठती है।`,
      te: `ఇక్కడ ఉన్న మలుపు: 'బాధ్యతలు తీరితే చాలు' అని మీకు ఆనందాన్నిచ్చే ఆలోచనలను, అభిరుచులను అణచివేసినప్పుడే జీవితం భారంగా అనిపిస్తుంది! మీ సృజనాత్మకతకు కొంచెం సమయం ఇస్తే చాలు, అదృష్టం మళ్ళీ మెరుస్తుంది.`,
      ta: `இதன் திருப்பம்: 'கடமையை முடித்தால் போதும்' என்று உங்கள் ஆர்வங்களையும் மகிழ்ச்சியையும் அடக்கும்போதெல்லாம் வாழ்க்கை சலிப்பாகத் தெரிகிறது! மனதிற்குப் பிடித்த படைப்பாற்றலுக்குச் சிறிது நேரம் கொடுத்தால் அதிர்ஷ்டம் தானாகச் சிரிக்கும்.`,
      en: `The twist hidden inside this chapter: whenever you bury playful curiosity under endless seriousness, life starts feeling strangely heavy. The day you allow genuine creative joy or unhurried family play back in, fresh energy unlocks across career and wealth too.`,
    },
    p3: {
      kn: `ಈ ಅಧ್ಯಾಯದ ಸರಳ ಹೆಜ್ಜೆ: ${isChildOrInfant ? "ಮಗುವಿಗೆ ಮುಕ್ತವಾಗಿ ಬಣ್ಣ ಹಚ್ಚಲು, ಹಾಡಲು ಅಥವಾ ಕಥೆ ಕೇಳಲು ಪ್ರೋತ್ಸಾಹಿಸಿ." : "ಮಕ್ಕಳೊಂದಿಗೆ ಅಥವಾ ಕುಟುಂಬದ ಕಿರಿಯರೊಂದಿಗೆ ಬೆರೆತು ಕಲಿಸುವುದು ಮತ್ತು ನಿಮ್ಮದೇ ಒಂದು ಸಣ್ಣ ಸೃಜನಶೀಲ ಹವ್ಯಾಸವನ್ನು ಮತ್ತೆ ಆರಂಭಿಸುವುದು ನಿಮಗೆ ನವೋತ್ಸಾಹ ತರುತ್ತದೆ."}`,
      mr: `पुढचे पाऊल: ${isChildOrInfant ? "मुलाला चित्रे काढायला, गायला व प्रश्न विचारायला मोकळीक द्या." : "घरातील लहानांशी संवाद वाढवा आणि तुमचा एखादा अर्धवट राहिलेला छंद पुन्हा सुरू करा."}`,
      hi: `सरल कदम: ${isChildOrInfant ? "बच्चे को चित्रकला, संगीत या सवाल पूछने के लिए प्रोत्साहित करें।" : "परिवार के युवाओं का मार्गदर्शन करें तथा अपनी किसी प्रिय रचनात्मक रुचि को फिर से जीवित करें।"}`,
      te: `మీ తదుపరి అడుగు: ${isChildOrInfant ? "చిన్నారికి ఆటపాటలతో కూడిన సృజనాత్మక స్వేచ్ఛను ఇవ్వండి." : "పిల్లలతో ఆనందంగా గడపడం మరియు మీలోని ఒక సృజనాత్మక అభిరుచిని మళ్ళీ ప్రారంభించడం గొప్ప ఉత్సాహాన్నిస్తుంది."}`,
      ta: `உங்கள் அடுத்த அடியெடுப்பு: ${isChildOrInfant ? "குழந்தையைப் பாடவும் வரையவும் கேள்விகள் கேட்கவும் ஊக்குவியுங்கள்." : "குடும்ப இளையவர்களுடன் உரையாடுங்கள்; உங்களுக்குப் பிடித்த ஒரு கலை அல்லது விருப்பத்தை மீண்டும் தொடங்குங்கள்."}`,
      en: `Simple spark to light today: ${isChildOrInfant ? "encourage drawing, music, and imaginative stories without rushing correction." : "reclaim one forgotten creative craft or mentor a younger family member cleanly—joy multiplies intellect."}`,
    },
    reflection: {
      kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಚಿಕ್ಕ ವಯಸ್ಸಿನಲ್ಲಿ ನೀವು ತುಂಬಾ ಇಷ್ಟಪಟ್ಟು ಮಾಡುತ್ತಿದ್ದ, ಆದರೆ ದೊಡ್ಡವರಾದ ಮೇಲೆ ಬಿಟ್ಟುಬಿಟ್ಟ ಆ ಒಂದು ಹವ್ಯಾಸ ಯಾವುದು?`,
        mr: `स्व-परीक्षण: लहानपणी तुम्ही खूप आवडीने करत असलेला, पण मोठ्यापणी सुटलेला कोणता छंद आज तुम्हाला आठवतो?`,
        hi: `स्वयं-निरीक्षण: बचपन या जवानी का वह कौन सा प्रिय शौक था जिसे जिम्मेदारियों में खो दिया?`,
        te: `మిమ్మల్ని మీరు అడుగండి: చిన్నప్పుడు ఎంతో ఇష్టంగా చేసి, పెద్దయ్యాక వదిలేసిన మీ అభిరుచి ఏది?`,
        ta: `சுய பரிசோதனை: சிறுவயதில் மிகுந்த ஆர்வத்துடன் செய்து, வளர்ந்தபின் விட்டுவிட்ட அந்த ஒரு விருப்பம் எது?`,
        en: `Pause & Check: What activity brought you effortless joy years ago that adult routines crowded out?`,
    },
    badge: { kn: "ಸೃಜನಶೀಲ ಬೆಳಕು", mr: "सृजनशीलता", hi: "सृजन शक्ति", te: "సృజనాత్మకత", ta: "படைப்பாற்றல்", en: "Creative Joy" },
    anchors: [`${house5Info.lordName}`, `SAV ${n(savByHouse[4])}`],
  });

  // CHAPTER 16 — Health & Bio-Rhythm (Physical signals, NO puja rituals!)
  list.push({
    n: 16, sec: 3, secTitle: sec3, icon: "🛡️", visual: "element-radar",
    title: {
      kn: "ಆರೋಗ್ಯ, ದೇಹದ ಎಚ್ಚರಿಕೆ ಸಂಕೇತಗಳು & ಜೀವಶಕ್ತಿ ರಕ್ಷಣೆ",
      mr: "आरोग्य, शरीराचे सूक्ष्म इशारे व प्राणशक्ती संरक्षण",
      hi: "स्वास्थ्य, शरीर के संकेत एवं प्राण ऊर्जा का संतुलन",
      te: "ఆరోగ్యం, శరీర సంకేతాలు & జీవశక్తి కాపాడుకునే విధానం",
      ta: "ஆரோக்கியம், உடலின் எச்சரிக்கை & பிராண சக்தி பாதுகாப்பு",
      en: "Health & Bio-Rhythm — Reading Your Body's Early Signals",
    },
    question: {
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಕಾಯಿಲೆ ಬರುವ ಮುನ್ನವೇ ನಿಮ್ಮ ದೇಹ ಮತ್ತು ಮನಸ್ಸು ಕೊಡುತ್ತಿರುವ ಆ ಎಚ್ಚರಿಕೆ ಗಂಟೆಗಳು ಯಾವುವು?`,
      mr: `प्रश्न: ${devoteeName}, शरीर थकण्यापूर्वी तुम्हाला कोणते छोटे शारीरिक व मानसिक इशारे देत असते?`,
      hi: `प्रश्न: ${devoteeName}, बड़े तनाव से पहले ही आपका शरीर और मन आपको कौन से प्रारंभिक संकेत देते हैं?`,
      te: `ప్రశ్న: ${devoteeName}, అనారోగ్యం రాకముందే మీ శరీరం మరియు మనసు ఇస్తున్న ఆ ముందుస్తు సంకేతాలు ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, பெரிய சோர்விற்கு முன்பே உங்கள் உடலும் மனமும் தரும் ஆரம்ப எச்சரிக்கைகள் எவை?`,
      en: `Question: ${devoteeName}, how does your body silently wave a yellow flag long before exhaustion turns physical?`,
    },
    p1: {
      kn: `ನಿಮ್ಮ ಮೂಲ ದೇಹಬಲ (${house6Info.lordName}) ಗಟ್ಟಿಯಾಗಿದೆ — ನೀವು ಸುಲಭವಾಗಿ ಹಾಸಿಗೆ ಹಿಡಿಯುವವರಲ್ಲ. ಆದರೆ ನಿಮ್ಮ ಕಥೆಯಲ್ಲಿ ಒಂದು ವಿಚಿತ್ರ ಪ್ಯಾಟರ್ನ್ ಇದೆ: ಒತ್ತಡ ಹೆಚ್ಚಾದಾಗ ನೀವು 'ಏನೂ ಆಗಿಲ್ಲ' ಎಂದು ಕೆಲಸ ಮುಂದುವರಿಸುತ್ತೀರಿ, ಆಗಲೇ ಜೀರ್ಣಶಕ್ತಿ, ಕುತ್ತಿಗೆ-ಭುಜದ ಬಿಗಿ ಅಥವಾ ರಾತ್ರಿ ನಿದ್ದೆಯ ಗುಣಮಟ್ಟ ಮೊದಲು ಬದಲಾಗುತ್ತದೆ.`,
      mr: `तुमची मूळ रोगप्रतिकारक शक्ती (${house6Info.lordName}) खंबीर आहे. पण तुमची एक सवय आहे: मानसिक ताण वाढला तरी 'काही झालेले नाही' असे दाखवत काम करत राहता — तेव्हाच पचन, मानेचे स्नायू किंवा झोप हे शरीराचे पहिले इशारे देतात.`,
      hi: `आपकी मूल शारीरिक शक्ति (${house6Info.lordName}) मज़बूत है। परंतु आपकी आदत है कि तनाव बढ़ने पर भी आप 'सब ठीक है' मानकर चलते रहते हैं—तभी पाचन, गर्दन-कंधों की जकड़न या नींद की कमी शरीर की पहली चेतावनी बनती है।`,
      te: `మీ శారీరక బలం (${house6Info.lordName}) సహజంగా గట్టిగానే ఉంది. కానీ ఒత్తిడి పెరిగినప్పుడు మీరు 'ఏం కాదులే' అని పనిలో మునిగిపోతారు—అప్పుడే జీర్ణక్రియ, భుజాల నొప్పి లేదా నిద్రలేమి రూపంలో శరీరం హెచ్చరిస్తుంది.`,
      ta: `உங்கள் அடிப்படை உடல் வலிமை (${house6Info.lordName}) உறுதியானது. ஆனால் மன அழுத்தம் கூடும்போது 'ஒன்றுமில்லை' எனத் தொடர்ந்து உழைப்பீர்கள்—அப்போதுதான் செரிமானம், தோள்பட்டை இறுக்கம் அல்லது தூக்கக் குறைவு முதல் எச்சரிக்கையைக் காட்டும்.`,
      en: `Constitutionally you carry tough stamina (${house6Info.lordName}), rarely slowing down for minor discomforts. The subtle catch is how your nervous system handles silent stress: long before fatigue speaks, your stomach, shoulders, or deep sleep quietly shift.`,
    },
    p2: {
      kn: `ಆರೋಗ್ಯದ ತಿರುವು: ನೀವು ಹೆಚ್ಚಿನ ದೈಹಿಕ ಶ್ರಮಕ್ಕಿಂತ 'ತಲೆಯಲ್ಲಿ ನಿಲ್ಲದ ಆಲೋಚನೆ'ಗಳಿಂದಲೇ ದಣಿಯುತ್ತಿದ್ದೀರಿ! ರಾತ್ರಿ ಊಟವಾದ ನಂತರ ೩೦ ನಿಮಿಷ ಶಾಂತವಾಗಿ ವಿಶ್ರಾಂತಿ ಮತ್ತು ನೀರಿನ ಪ್ರಮಾಣ ಸರಿಯಾದರೆ ಅರ್ಧದಷ್ಟು ಆಯಾಸ ಒಂದೇ ವಾರದಲ್ಲಿ ಮಾಯವಾಗುತ್ತದೆ.`,
      mr: `आरोग्याचे खरे वळण: तुम्ही शारीरिक कामापेक्षा 'न थांबणाऱ्या विचारांमुळे' जास्त थकता! वेळेवर पाणी आणि झोपेपूर्वी ३० मिनिटे शांत विसावा मिळाल्यास अर्धा थकवा एका आठवड्यात गायब होतो.`,
      hi: `स्वास्थ्य का असली सच: आप शारीरिक श्रम से कम और 'लगातार चलने वाले विचारों' से अधिक थकते हैं! समय पर जल सेवन और रात्रि विश्राम से ३० मिनट पहले मन को शांत करने पर आधी थकान सप्ताह भर में दूर हो जाती है।`,
      te: `ఆరోగ్య మలుపు: మీరు శారీరక శ్రమ కంటే 'ఆగని ఆలోచనల' వల్లే ఎక్కువ అలసిపోతున్నారు! సరిపడా నీరు మరియు రాత్రి నిద్రకు ముందు ప్రశాంతత దొరికితే సగం అలసట వారం రోజుల్లోనే మాయమవుతుంది.`,
      ta: `ஆரோக்கியத் திருப்பம்: நீங்கள் உடல் உழைப்பை விட 'நிற்காமல் ஓடும் சிந்தனைகளால்' அதிகம் சோர்வடைகிறீர்கள்! போதுமான தண்ணீரும் இரவு தூக்கத்திற்கு முன் அரை மணி நேர அமைதியும் பாதி சோர்வை ஒரு வாரத்தில் நீக்கும்.`,
      en: `The health twist: most of your exhaustion is mental heat disguised as physical fatigue—worry drains more energy than heavy work ever did. Once evening thoughts wind down thirty minutes before sleep, stamina rebounds astonishingly fast.`,
    },
    p3: {
      kn: `ದೇಹಕ್ಕೆ ಕೊಡುವ ಸ್ಮಾರ್ಟ್ ರಕ್ಷೆ: ${isSenior ? "ಪ್ರತಿದಿನ ಲಘು ಮುಂಜಾನೆ ವಾಕಿಂಗ್, ಸರಳ ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಆರೋಗ್ಯ ತಪಾಸಣೆ ತಪ್ಪದಿರಲಿ." : "ಕನಿಷ್ಠ ೨ ಲೀಟರ್ ಶುದ್ಧ ನೀರು, ರಾತ್ರಿ ಮಲಗುವ ೩೦ ನಿಮಿಷ ಮೊದಲು ಮೊಬೈಲ್ ದೂರವಿಡುವುದು ಮತ್ತು ಬೆಳಗ್ಗಿನ ಬಿಸಿಲಿನಲ್ಲಿ ೧೦ ನಿಮಿಷ ನಿಲ್ಲುವುದು ನಿಮ್ಮ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ಉತ್ತುಂಗದಲ್ಲಿಡುತ್ತದೆ."}`,
      mr: `सोपा आरोग्य नियम: ${isSenior ? "दररोज सकाळी हलकी फेरी, सात्त्विक आहार व नियमित आरोग्य तपासणी ठेवा." : "पुरेसे पाणी प्या, झोपण्यापूर्वी ३० मिनिटे मोबाईल बाजूला ठेवा आणि सकाळच्या कोवळ्या उन्हात १० मिनिटे घालवा."}`,
      hi: `सहज स्वास्थ्य रक्षा: ${isSenior ? "नित्य प्रातः हल्का भ्रमण, सादा सात्विक भोजन एवं समय पर स्वास्थ्य जांच बनाए रखें।" : "पर्याप्त जल पिएं, सोने से ३० मिनट पूर्व स्क्रीन बंद करें और प्रातः १० मिनट धूप में टहलें।"}`,
      te: `ఆరోగ్య నియమం: ${isSenior ? "ప్రతిరోజూ ఉదయం నడక, తేలికపాటి ఆహారం మరియు క్రమమైన ఆరోగ్య పరీక్షలు మరువకండి." : "సరిపడా నీరు తాగడం, నిద్రకు 30 నిమిషాల ముందు ఫోన్ పక్కన పెట్టడం మరియు ఉదయం ఎండలో 10 నిమిషాలు నడవడం అద్భుత ఫలితాన్నిస్తుంది."}`,
      ta: `உடல் நல உத்தி: ${isSenior ? "தினமும் காலை நடைப்பயிற்சி, எளிய உணவு மற்றும் வழக்கமான மருத்துவப் பரிசோதனையைப் பின்பற்றவும்." : "போதுமான தண்ணீர், தூங்குவதற்கு 30 நிமிடத்திற்கு முன் மொபைலைத் தவிர்த்தல் மற்றும் காலை வெயிலில் 10 நிமிட நடைப்பயிற்சி போதும்."}`,
      en: `Three crisp vitality habits: ${isSenior ? "gentle morning walks, light early dinners, and steady checkups keep strength dependable." : "clean hydration, ten minutes of morning sunlight, and thirty screen-free minutes before bed reboot your entire system."}`,
    },
    reflection: {
      kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ತಲೆ ಭಾರ' ಅನಿಸುವಾಗ ಮೊಬೈಲ್ ನೋಡುವ ಬದಲು ಬರೀ ಕಣ್ಣು ಮುಚ್ಚಿ ೫ ನಿಮಿಷ ಶಾಂತವಾಗಿ ಕೂತರೆ ಎಷ್ಟು ಹಗುರ ಅನಿಸುತ್ತದೆ ಪರೀಕ್ಷಿಸಿ ನೋಡಿ!`,
      mr: `स्व-परीक्षण: डोके जड वाटल्यावर फोन स्क्रोल करण्याऐवजी फक्त ५ मिनिटे डोळे मिटून बसा — लगेच हलके वाटेल!`,
      hi: `स्वयं-निरीक्षण: सिर भारी लगने पर फोन देखने के बजाय बस ५ मिनट आंखें बंद करके शांत बैठें—फर्क तुरंत महसूस होगा!`,
      te: `మిమ్మల్ని మీరు అడుగండి: తల భారంగా అనిపించినప్పుడు ఫోన్ చూడకుండా 5 నిమిషాలు కళ్ళు మూసుకుని ప్రశాంతంగా కూర్చుని చూడండి!`,
      ta: `சுய பரிசோதனை: மன அழுத்தமாக உணரும்போது போனைப் பார்ப்பதை விட்டு 5 நிமிடங்கள் கண்களை மூடி அமைதியாக அமர்ந்து பாருங்கள்!`,
      en: `Pause & Check: Next time mental fatigue strikes, step away from screens for five silent minutes instead of scrolling—notice how quickly clarity returns.`,
    },
    badge: { kn: "ಜೀವಶಕ್ತಿ", mr: "आरोग्य लय", hi: "प्राण ऊर्जा", te: "జీవశక్తి", ta: "பிராண சக்தி", en: "Vital Rhythm" },
    anchors: [`${house6Info.lordName}`, `${dominantElement}`],
  });

  // SECTION 4 (Ch 17 to 22): Dynamic 90-Day -> 5-Year Horizon Story (NO remedies!)
  list.push(
    {
      n: 17, sec: 4, secTitle: sec4, icon: "🧭", visual: "horizon-wave",
      title: {
        kn: "ಮುಂದಿನ ೧–೩ ತಿಂಗಳುಗಳ ತತ್ಕ್ಷಣದ ತಿರುವು & ೯೦ ದಿನಗಳ ಕಥನ",
        mr: "पुढील १–३ महिन्यांचे तात्काळ वळण व ९० दिवसांचा आराखडा",
        hi: "आगामी १–३ महीनों का तात्कालिक मोड़ एवं ९०-दिवसीय कथा",
        te: "రాబోయే 1–3 నెలల తక్షణ మలుపు & 90 రోజుల కథనం",
        ta: "அடுத்த 1–3 மாதங்களுக்கான உடனடி திருப்பம்",
        en: "Next 90 Days — The Quick Shift Opening Right Ahead",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಮುಂದಿನ ೯೦ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಕೈಗೆ ಬರುವ ಮೊದಲ ಶುಭ ಬದಲಾವಣೆ ಯಾವುದು?`,
        mr: `प्रश्न: ${devoteeName}, पुढील ९० दिवसांत तुमच्या हातात येणारा पहिला मोठा बदल कोणता असेल?`,
        hi: `प्रश्न: ${devoteeName}, आने वाले ९० दिनों में आपके जीवन में पहला स्पष्ट सकारात्मक बदलाव क्या होगा?`,
        te: `ప్రశ్న: ${devoteeName}, రాబోయే 90 రోజుల్లో మీ జీవితంలో మొదలయ్యే మొదటి శుభ మార్పు ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, அடுத்த 90 நாட்களில் உங்கள் வாழ்க்கையில் நிகழும் முதல் நல்ல மாற்றம் என்ன?`,
        en: `Question: ${devoteeName}, what immediate momentum restarts inside the incoming 90 days?`,
      },
      p1: {
        kn: `ಮುಂಬರುವ ೯೦ ದಿನಗಳು ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ 'ಮೊದಲು ನಿಂತಿದ್ದ ಚಕ್ರ ಮತ್ತೆ ತಿರುಗಲು ಪ್ರಾರಂಭಿಸುವ' ಹಂತ. ಕಳೆದ ಕೆಲವು ವಾರಗಳಿಂದ ನೆನೆಗುದಿಗೆ ಬಿದ್ದಿದ್ದ ಒಂದು ಕೆಲಸ, ಪತ್ರವ್ಯವಹಾರ ಅಥವಾ ಕುಟುಂಬದ ಚರ್ಚೆ ಮೊದಲ ೩೦ ದಿನಗಳಲ್ಲೇ ಸ್ಪಷ್ಟ ರೂಪ ಪಡೆಯಲಿದೆ.`,
        mr: `पुढील ९० दिवस तुमच्या ${lagnaRashiName} लग्नासाठी 'थांबलेले चाक पुन्हा वेगाने फिरू लागण्याचा' काळ आहे. मागील अनेक आठवड्यांपासून प्रलंबित राहिलेले काम पहिल्या ३० दिवसांत हलताना दिसेल.`,
        hi: `आगामी ९० दिन आपके ${lagnaRashiName} लग्न के लिए 'रुके हुए पहिये के फिर से घूमने' का समय है। पिछले कई सप्ताहों से अटका हुआ कार्य या निर्णय पहले ३० दिनों में स्पष्ट रूप लेने लगेगा।`,
        te: `రాబోయే 90 రోజులు మీ ${lagnaRashiName} లగ్నానికి 'ఆగిపోయిన చక్రం మళ్ళీ తిరిగే' సమయం. కొన్ని వారాలుగా పెండింగ్‌లో ఉన్న ఒక ముఖ్యమైన పని మొదటి 30 రోజుల్లోనే స్పష్టతకు వస్తుంది.`,
        ta: `அடுத்த 90 நாட்கள் உங்கள் ${lagnaRashiName} லக்னத்திற்கு 'நின்ற சக்கரம் மீண்டும் சுழலத் தொடங்கும்' கட்டம். பல வாரங்களாகத் தேங்கிய ஒரு விஷயம் முதல் 30 நாட்களிலேயே நகரத் தொடங்கும்.`,
        en: `The incoming 90 days restart stalled engines for your ${lagnaRashiName} chart. Something that sat unanswered on a desk or inside an awkward silence begins moving inside the very first month.`,
      },
      p2: {
        kn: `ಕಥೆಯ ತಿರುವು: ಎರಡನೇ ತಿಂಗಳಿನಲ್ಲಿ ನಿಮಗೆ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಸಿಗುವ ಒಂದು ಫೋನ್ ಕರೆ ಅಥವಾ ಪರಿಚಯವೇ ಮೂರನೇ ತಿಂಗಳ ಸಕಾರಾತ್ಮಕ ಫಲಿತಾಂಶಕ್ಕೆ ದಾರಿ ಮಾಡಿಕೊಡುತ್ತದೆ! ಹಳೆಯ ಜಗಳಗಳನ್ನು ಕೆದಕದೆ ಇರುವುದು ಇಲ್ಲಿ ತುಂಬಾ ಮುಖ್ಯ.`,
        mr: `या तिमाहीचा ट्विस्ट: दुसऱ्या महिन्यात अचानक आलेला एक फोन किंवा ओळखच तिसऱ्या महिन्यातल्या मोठ्या यशाचे दार उघडेल! मात्र जुने वाद उकरू नका.`,
        hi: `रोचक मोड़: दूसरे महीने में मिला एक अप्रत्याशित संदेश या नया संपर्क ही तीसरे महीने की बड़ी उपलब्धि का मार्ग खोलेगा! बस पुराने विवादों को न कुरेदें।`,
        te: `90 రోజుల మలుపు: రెండవ నెలలో అనుకోకుండా వచ్చే ఒక ఫోన్ కాల్ లేదా పరిచయమే మూడవ నెలలో మీ విజయానికి దారితీస్తుంది! పాత వాదనలను మాత్రం తవ్వకండి.`,
        ta: `90 நாள் திருப்பம்: 2-வது மாதத்தில் வரும் எதிர்பாராத அழைப்பு அல்லது சந்திப்பே 3-வது மாத வெற்றிக்குப் பாலமாகும்! பழைய விவாதங்களை மட்டும் கிளறாதீர்கள்.`,
        en: `The 90-day plot twist: Month 1 clears clutter, Month 2 brings one unexpected call or lead out of left field, and Month 3 shows concrete proof that your patience worked.`,
      },
      p3: {
        kn: `೯೦ ದಿನಗಳ ಚತುರ ಸೂತ್ರ: ${isMinor ? "ಓದಿನ ಸಮಯಪಾಲನೆ ಹಾಗೂ ಆಟದ ಸಮತೋಲನ ಕಾಪಾಡಿ." : "ಮುಂದಿನ ೯೦ ದಿನ ಯಾರ ಸಾಲಕ್ಕೂ ಜಾಮೀನು ಸಹಿ ಹಾಕಬೇಡಿ ಮತ್ತು ಹೊಸ ಹೆಜ್ಜೆಗಳನ್ನು ಶಾಂತ ಮನಸ್ಸಿನಿಂದ ತೆಗೆದುಕೊಳ್ಳಿ."}`,
        mr: `९० दिवसांचे सूत्र: ${isMinor ? "अभ्यास व आरोग्याची शिस्त ठेवा." : "पुढील ३ महिने कोणाच्याही कर्जाची हमी देऊ नका आणि शांतपणे कागदपत्रे पूर्ण करा."}`,
        hi: `तिमाही सूत्र: ${isMinor ? "पढ़ाई और दिनचर्या अनुशासित रखें।" : "अगले ३ महीने किसी के ऋण की गारंटी न बनें तथा शांत भाव से कार्य पूरे करें।"}`,
        te: `త్రైమాసిక సూత్రం: ${isMinor ? "చదువు మరియు ఆటపాటలలో సమయపాలన పాటించండి." : "వచ్చే 3 నెలలు ఎవరి అప్పులకు హామీ సంతకం పెట్టకండి మరియు ప్రశాంతంగా నిర్ణయాలు తీసుకోండి."}`,
        ta: `90 நாள் விதி: ${isMinor ? "படிப்பிலும் ஆரோக்கியத்திலும் ஒழுங்கு தவறாதீர்கள்." : "அடுத்த 3 மாதங்களுக்குப் பிறர் கடனுக்குப் பொறுப்பேற்காமல் உங்கள் பணிகளைத் தெளிவாக முடியுங்கள்."}`,
        en: `Your smart 90-day guardrail: ${isMinor ? "protect steady study focus and joyful rest." : "do not rush big signatures or stand surety for anyone's haste—let Month 2's clarity mature cleanly."}`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ಮುಂದಿನ ೩ ತಿಂಗಳಲ್ಲಿ ನೀವು ಪೂರ್ಣಗೊಳಿಸಲೇಬೇಕೆಂದಿರುವ ಒಂದೇ ಒಂದು ಮುಖ್ಯ ಕೆಲಸ ಯಾವುದು ಎಂದು ಮನಸ್ಸಿನಲ್ಲೇ ಗುರುತು ಹಾಕಿಕೊಳ್ಳಿ!`,
        mr: `स्व-परीक्षण: पुढील ३ महिन्यांत तुम्हाला कोणते एक महत्त्वाचे काम पूर्ण करायचेच आहे, ते आज मनाशी ठरवा!`,
        hi: `स्वयं-निरीक्षण: वे कौन से १-२ काम हैं जिन्हें आप आने वाले ९० दिनों में हर हाल में पूरा होते देखना चाहते हैं?`,
        te: `మిమ్మల్ని మీరు అడుగండి: రాబోయే 3 నెలల్లో మీరు ఖచ్చితంగా పూర్తి చేయాలనుకుంటున్న ఆ ఒక్క ముఖ్యమైన లక్ష్యం ఏమిటి?`,
        ta: `சுய பரிசோதனை: அடுத்த 3 மாதங்களில் நீங்கள் கட்டாயம் முடிக்க விரும்பும் ஒரே ஒரு முக்கிய இலக்கு எது?`,
        en: `Pause & Check: Pick the single most important win you want sealed inside 90 days—notice how clear the path already looks.`,
      },
      badge: { kn: "೯೦ ದಿನಗಳ ದಿಕ್ಸೂಚಿ", mr: "९० दिवसांचा वेग", hi: "९०-दिवसीय दिशा", te: "90 రోజుల దిశ", ta: "90 நாள் திசை", en: "90-Day Pulse" },
      anchors: [`${lagnaRashiName}`, `${currentBhuktiLord}`],
    },
    {
      n: 18, sec: 4, secTitle: sec4, icon: "🎯", visual: "horizon-wave",
      title: {
        kn: "೪–೬ ತಿಂಗಳುಗಳ ಕಾರ್ಯಸ್ಥಿರತೆ & ಬೃಗು ಬಿಂದು ಅದೃಷ್ಟದ ತಿರುವು",
        mr: "४–६ महिन्यांचे स्थैर्य व भृगु बिंदूचा सुवर्ण टप्पा",
        hi: "४–६ महीनों का स्थिरीकरण एवं भृगु बिंदु का निर्णायक मोड़",
        te: "4–6 నెలల స్థిరత్వం & భృగు బిందువు అద్భుత మలుపు",
        ta: "4–6 மாத ஸ்திரத்தன்மை & பிருகு பிந்து அதிர்ஷ்டத் திருப்பம்",
        en: "Months 4–6 — Your Sacred Bhrigu Bindu Pivot",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ವರ್ಷದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ನಿಮ್ಮ ಬೃಗು ಬಿಂದು (${bhriguBinduRashiName}) ಯಾವ ಅನಿರೀಕ್ಷಿತ ಬಾಗಿಲನ್ನು ತಟ್ಟಲಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, वर्षाच्या दुसऱ्या भागात तुमचा भृगु बिंदू (${bhriguBinduRashiName}) कोणती अनपेक्षित संधी घेऊन येत आहे?`,
        hi: `प्रश्न: ${devoteeName}, वर्ष के दूसरे चरण में आपका भृगु बिंदु (${bhriguBinduRashiName}) कौन सा बड़ा मोड़ लाने वाला है?`,
        te: `ప్రశ్న: ${devoteeName}, మీ భృగు బిందువు (${bhriguBinduRashiName}) ఈ 4–6 నెలల్లో ఏ అద్భుత అవకాశాన్ని అందించబోతోంది?`,
        ta: `கேள்வி: ${devoteeName}, இந்த ஆண்டின் நடுப்பகுதியில் உங்கள் பிருகு பிந்து (${bhriguBinduRashiName}) எந்த அதிர்ஷ்டக் கதவைத் தட்டப்போகிறது?`,
        en: `Question: ${devoteeName}, what surprising opportunity awakens around Months 4–6 when life crosses your Bhrigu Bindu (${bhriguBinduRashiName})?`,
      },
      p1: {
        kn: `ನಿಮ್ಮ ಜಾತಕದ 'ಅದೃಷ್ಟದ ಮಧ್ಯಬಿಂದು' (ಬೃಗು ಬಿಂದು) ${bhriguBinduRashiName} ರಾಶಿಯಲ್ಲಿದೆ. ಮುಂಬರುವ ೪ ರಿಂದ ೬ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ಈ ಬಿಂದುವಿಗೆ ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿ ಸಿಗುವುದರಿಂದ, ಬಹುದಿನದಿಂದ ಎಳೆದಾಡುತ್ತಿದ್ದ ಮಾತುಕತೆಗಳು ಒಮ್ಮೆಗೇ ಫಲಪ್ರದ ಹಂತಕ್ಕೆ ಬರುತ್ತವೆ.`,
        mr: `तुमच्या कुंडलीतील भाग्याचा गुप्त बिंदू (भृगु बिंदू) ${bhriguBinduRashiName} राशीत आहे. पुढील ४ ते ६ महिन्यांत शुभ ग्रहांची साथ मिळून अनेक दिवसांपासून रखडलेले विषय मार्गी लागतील.`,
        hi: `आपकी कुंडली का विशेष सौभाग्य केंद्र (भृगु बिंदु) ${bhriguBinduRashiName} में स्थित है। आगामी ४ से ६ महीनों के बीच शुभ संयोग बनते ही लंबे समय से अटकी बातचीत या योजना अचानक निर्णायक परिणाम देगी।`,
        te: `మీ జాతకంలో అదృష్టానికి కేంద్రమైన 'భృగు బిందువు' ${bhriguBinduRashiName} రాశిలో ఉంది. రాబోయే 4–6 నెలల్లో దీనికి శుభ బలం చేకూరడంతో చాలాకాలంగా నడుస్తున్న ప్రయత్నాలు ఒక కొలిక్కి వస్తాయి.`,
        ta: `உங்கள் ஜாதகத்தின் அதிர்ஷ்ட மையப்புள்ளியான 'பிருகு பிந்து' ${bhriguBinduRashiName} ராசியில் உள்ளது. அடுத்த 4 முதல் 6 மாதங்களில் இதற்குச் சுப பலம் கிடைப்பதால் நீண்டகால முயற்சிகள் கைகூடும்.`,
        en: `Anchored in ${bhriguBinduRashiName} lies your Bhrigu Bindu—often the exact spot in a birth chart where quiet patience suddenly pays out. Across Months 4 to 6, supportive transits sweep past this point like sunlight hitting dry wood.`,
      },
      p2: {
        kn: `ರೋಚಕ ತಿರುವು: ${isChildOrInfant ? "ಶೈಕ್ಷಣಿಕ ಕಲಿಕೆಯಲ್ಲಿ ಮಗುವಿನ ಅಸಾಧಾರಣ ಪ್ರಗತಿ ಕಂಡು ಕುಟುಂಬವು ಹೆಮ್ಮೆಪಡಲಿದೆ!" : "ನೀವು ಕೇವಲ ಚಿಕ್ಕದಾಗಿ ಯೋಚಿಸಿದ ಕೆಲಸವೇ ಹಠಾತ್ತನೆ ದೊಡ್ಡ ಅವಕಾಶವಾಗಿ ಬದಲಾಗಬಹುದು — ಬಡ್ತಿ, ಹೊಸ ಪಾತ್ರ, ಅಥವಾ ಕುಟುಂಬದ ಆಸ್ತಿ-ಮನೆ ಕನಸುಗಳಿಗೆ ಹಸಿರು ನಿಶಾನೆ ಸಿಗಲಿದೆ."}`,
        mr: `मोठा ट्विस्ट: ${isChildOrInfant ? "मुलाच्या प्रगतीने घरच्यांना अभिमान वाटेल!" : "ज्या गोष्टीकडे तुम्ही साधी सुरुवात म्हणून पाहत होतात, तिच मोठी संधी बनून पुढे येईल — पदोन्नती, घर किंवा नवीन कराराचा योग जुळून येईल."}`,
        hi: `रोमांचक मोड़: ${isChildOrInfant ? "बच्चे की प्रगति देखकर परिवार गर्व से खिल उठेगा!" : "जिसे आपने एक साधारण शुरुआत समझा था, वही अचानक बड़े सम्मान, पदोन्नति अथवा गृह-संपत्ति की उपलब्धि में बदल सकता है।"}`,
        te: `మలుపు: ${isChildOrInfant ? "చిన్నారి ప్రతిభ చూసి కుటుంబం గర్వపడుతుంది!" : "మీరు చిన్నదిగా భావించిన ఒక ప్రయత్నమే పెద్ద అవకాశంగా మారవచ్చు—పదోన్నతి లేదా ఇల్లు, ఆస్తి ప్రయత్నాల్లో శుభ వార్త వస్తుంది."}`,
        ta: `சுவாரஸ்ய திருப்பம்: ${isChildOrInfant ? "குழந்தையின் திறமையைப் பார்த்துக் குடும்பமே பெருமைப்படும்!" : "சாதாரணமாகத் தொடங்கிய விஷயமே பெரிய பதவி உயர்வு அல்லது வீடு-சொத்து வாங்கும் சுபத் திருப்பமாக மாறும்."}`,
        en: `Watch for this twist: ${isChildOrInfant ? "the child shows a surprising leap in speech, memory, or creative expression!" : "an opportunity you initially dismissed as 'too small' turns into the exact doorway for higher authority, stronger pay, or family property consensus."}`,
      },
      p3: {
        kn: `ನಿಮ್ಮ ಹೆಜ್ಜೆ: ಒಳ್ಳೆಯ ಅವಕಾಶ ಬಂದಾಗ 'ನನ್ನಿಂದ ಆಗುತ್ತದೋ ಇಲ್ಲವೋ' ಎಂಬ ಹಳೆಯ ಸಂಶಯ ಬಿಡಿ; ನುರಿತ ಹಿರಿಯರ ಒಂದು ಸಲಹೆ ಪಡೆದು ಧೈರ್ಯವಾಗಿ ಮುನ್ನುಗ್ಗಿ.`,
        mr: `पुढचे पाऊल: नवीन संधी समोर आल्यावर 'माझ्याने होईल का?' असा संशय घेऊ नका — अनुभवी व्यक्तीचा सल्ला घ्या आणि पुढे व्हा.`,
        hi: `सही निर्णय: अवसर सामने आने पर 'मुझसे होगा या नहीं' की शंका त्यागें—अनुभवी मार्गदर्शन लेकर आत्मविश्वास से कदम बढ़ाएं।`,
        te: `మీ అడుగు: మంచి అవకాశం తలుపు తట్టినప్పుడు సందేహపడకండి; అనుభవజ్ఞుల సలహా తీసుకుని ధైర్యంగా ముందుకు సాగండి.`,
        ta: `உங்கள் நகர்வு: நல்ல வாய்ப்பு வரும்போது 'முடியுமா?' என்ற தயக்கத்தை விட்டு, பெரியோரின் ஆலோசனையோடு துணிந்து முன்னேறுங்கள்.`,
        en: `Play it boldly: when this door opens around Month 5, do not let false hesitation talk you out of claiming your own progress.`,
      },
      reflection: {
        kn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: 'ತಡವಾಗುತ್ತಿದೆ' ಎಂದು ನೀವು ಬಿಟ್ಟಿದ್ದ ಯಾವ ದೊಡ್ಡ ಕನಸನ್ನು ಈ ವರ್ಷದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಮತ್ತೆ ಕೈಗೆತ್ತಿಕೊಳ್ಳಲು ಇಷ್ಟಪಡುತ್ತೀರಿ?`,
        mr: `स्व-परीक्षण: 'उशीर होतोय' म्हणून बाजूला ठेवलेले कोणते स्वप्न तुम्ही पुढील ६ महिन्यांत पुन्हा सुरू करू इच्छिता?`,
        hi: `स्वयं-निरीक्षण: वह कौन सा बड़ा लक्ष्य है जिसे 'देरी' समझकर आपने छोड़ दिया था, पर अब फिर उठाना चाहेंगे?`,
        te: `మిమ్మల్ని మీరు అడుగండి: ఆలస్యమవుతోందని వదిలేసిన ఏ కోరికను ఈ 4–6 నెలల్లో మళ్ళీ నిజం చేసుకోవాలని ఉంది?`,
        ta: `சுய பரிசோதனை: தாமதமாகிறது என விட்டுவிட்ட எந்தக் கனவை இந்த 4–6 மாதங்களில் மீண்டும் கையில் எடுக்க விரும்புகிறீர்கள்?`,
        en: `Pause & Check: Which dream did you quietly set aside saying "maybe not this year"? Dust it off before Month 4 begins.`,
      },
      badge: { kn: "ಬೃಗು ಬಿಂದು ತಿರುವು", mr: "भृगु बिंदू वळण", hi: "भृगु बिंदु मोड़", te: "భృగు బిందు మలుపు", ta: "பிருகு திருப்பம்", en: "Turning Point" },
      anchors: [`${bhriguBinduRashiName}`, `${yogiPlanetName}`],
    }
  );

  // Chapters 19..22 — Dynamic Year 1, Year 2, Year 3, Years 4-5 Stories (each with distinct story arc + twist!)
  const yearNarratives: Array<{
    ch: number;
    offset: number;
    icon: string;
    themeKn: string; themeMr: string; themeHi: string; themeTe: string; themeTa: string; themeEn: string;
    storyKn: string; storyMr: string; storyHi: string; storyTe: string; storyTa: string; storyEn: string;
    twistKn: string; twistMr: string; twistHi: string; twistTe: string; twistTa: string; twistEn: string;
    moveKn: string; moveMr: string; moveHi: string; moveTe: string; moveTa: string; moveEn: string;
    reflKn: string; reflMr: string; reflHi: string; reflTe: string; reflTa: string; reflEn: string;
  }> = [
    {
      ch: 19, offset: 0, icon: "🌱",
      themeKn: "ಅಡಿಪಾಯ ಭದ್ರತೆ & ಹಳೆಯ ಬಾಕಿ ಮುಕ್ತಾಯ",
      themeMr: "पायाभरणी व जुन्या प्रश्नांची कायमची सुटका",
      themeHi: "सुदृढ़ आधार एवं लंबित उलझनों से मुक्ति",
      themeTe: "గట్టి పునాది & పాత చిక్కుల నుండి విముక్తి",
      themeTa: "உறுதியான அடித்தளம் & பழைய சிக்கல்கள் தீர்வு",
      themeEn: "Clearing Old Loops & Rebuilding Steadiness",
      storyKn: `${n(nowYear)}ನೇ ವರ್ಷವು ಕಳೆದ ದಿನಗಳ ಅಸ್ತವ್ಯಸ್ತತೆಯನ್ನು ಸರಿಪಡಿಸಿ ಬದುಕನ್ನು ನಿಚ್ಚಳ ಹಳಿಗೆ ತರುವ ಅಡಿಪಾಯದ ವರ್ಷ. ಅರ್ಧಕ್ಕೆ ನಿಂತಿದ್ದ ಆಲೋಚನೆಗಳಿಗೆ ಸ್ಪಷ್ಟ ವೇಳಾಪಟ್ಟಿ ಸಿಗುತ್ತದೆ.`,
      storyMr: `${n(nowYear)} हे वर्ष जुना गोंधळ संपवून आयुष्याला शिस्त लावण्याचा भक्कम पाया आहे. अर्धवट राहिलेल्या कामांना निश्चित वेग मिळेल.`,
      storyHi: `${n(nowYear)} का यह वर्ष पिछले बिखराव को समेटकर जीवन को व्यवस्थित दिशा देने की मजबूत नींव है। अधूरी योजनाओं को स्पष्ट आकार मिलेगा।`,
      storyTe: `${n(nowYear)}వ సంవత్సరం పాత గందరగోళాన్ని చక్కదిద్ది జీవితాన్ని స్థిరమైన పట్టాలపైకి ఎక్కించే పునాది సంవత్సరం. ఆలోచనలకు స్పష్టమైన రూపం వస్తుంది.`,
      storyTa: `${n(nowYear)}-ம் ஆண்டு பழைய குழப்பங்களைச் சரிசெய்து வாழ்வைச் சீரான பாதையில் அமைக்கும் அடித்தள ஆண்டாகும்.`,
      storyEn: `${nowYear} acts as your master reset year. Scattered schedules settle into order, draining commitments finally get closed, and you regain full control over how your week flows.`,
      twistKn: `ವಿಚಿತ್ರ ತಿರುವು: ಈ ವರ್ಷ ನೀವು ಎಷ್ಟು 'ಹೊಸದು' ಸೇರಿಸುತ್ತೀರಿ ಎಂಬುದಕ್ಕಿಂತ, ಎಷ್ಟು 'ಅನಗತ್ಯ ಹೊರೆ'ಯನ್ನು ಕೈಬಿಡುತ್ತೀರಿ ಎಂಬುದೇ ನಿಮ್ಮ ಗೆಲುವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ!`,
      twistMr: `खरा ट्विस्ट: या वर्षी तुम्ही किती नवीन गोष्टी करता यापेक्षा किती 'नको असलेली ओझी' उतरवून ठेवता, यावर तुमचे यश अवलंबून आहे!`,
      twistHi: `खास मोड़: इस वर्ष आपकी सफलता इस बात से तय होगी कि आप कितना नया जोड़ते हैं नहीं, बल्कि कितना 'अनावश्यक बोझ' पीछे छोड़ते हैं!`,
      twistTe: `ఆసక్తికర మలుపు: ఈ ఏడాది మీరు ఎంత కొత్తగా ప్రారంభిస్తారు అన్నదానికంటే, ఎన్ని అనవసర భారాలను వదిలించుకుంటారు అన్నదే మీ విజయాన్ని నిర్ణయిస్తుంది!`,
      twistTa: `முக்கிய திருப்பம்: இந்த ஆண்டு எவ்வளவு புதிதாகச் செய்கிறீர்கள் என்பதை விட, எத்தனை தேவையற்ற சுமைகளைக் கழற்றி விடுகிறீர்கள் என்பதே வெற்றியைத் தீர்மானிக்கும்!`,
      twistEn: `The Year 1 twist: growth arrives by subtraction before addition—dropping wrong obligations frees more energy than any new tactic.`,
      moveKn: `ಗಟ್ಟಿಯಾದ ಆರ್ಥಿಕ-ಕೆಲಸದ ನಿಯಮ ಹಾಕಿಕೊಂಡು, ವರ್ಷಾಂತ್ಯಕ್ಕೆ ಶುದ್ಧ ನೆಮ್ಮದಿ ಕಾಣಿ.`,
      moveMr: `स्पष्ट आर्थिक व वेळेचे नियम ठेवा; वर्षाच्या शेवटी मोठा निश्वास सोडाल.`,
      moveHi: `समय और धन के स्पष्ट नियम बनाएं; वर्षांत तक गहरी शांति अनुभव होगी।`,
      moveTe: `ఖచ్చితమైన సమయ, ఆర్థిక నియమాలు పెట్టుకుంటే ఏడాది చివరికల్లా అద్భుత ప్రశాంతత దక్కుతుంది.`,
      moveTa: `நேரத்திற்கும் நிதிக்கும் தெளிவான எல்லைகளை அமைத்துக்கொண்டால் ஆண்டின் இறுதியில் பெரும் நிம்மதி கிட்டும்.`,
      moveEn: `Lock clean boundaries around time and spending early; by year-end, peace replaces chronic hurry.`,
      reflKn: `ನಿಮ್ಮ ದಿನಚರಿಯಲ್ಲಿ ಪ್ರತಿದಿನ ೩೦ ನಿಮಿಷ ವ್ಯರ್ಥ ಮಾಡುತ್ತಿರುವ ಆ ಒಂದು ಅಭ್ಯಾಸವನ್ನು ಈಗಲೇ ಗುರುತಿಸಿ ಕೈಬಿಡಬಲ್ಲಿರಾ?`,
      reflMr: `तुमचा रोजचा ३० मिनिटे वेळ वाया घालवणारी एक सवय आजच ओळखून सोडू शकता का?`,
      reflHi: `क्या आप अपनी वह एक आदत पहचान सकते हैं जो रोज़ आपके कीमती ३० मिनट बेवजह खा जाती है?`,
      reflTe: `మీ రోజువారీ సమయాన్ని వృథా చేస్తున్న ఆ ఒక్క అలవాటును ఇప్పుడే గుర్తించి ఆపగలరా?`,
      reflTa: `தினமும் உங்கள் பொன்னான 30 நிமிடங்களை வீணடிக்கும் அந்த ஒரு பழக்கத்தை இன்றே அடையாளம் காண முடியுமா?`,
      reflEn: `Pause & Check: Which single time-wasting habit can you retire this week to buy back half an hour daily?`,
    },
    {
      ch: 20, offset: 1, icon: "🚀",
      themeKn: "ವೇಗ ವರ್ಧನೆ, ಹೊಸ ಸ್ಥಾನ & ಕೀರ್ತಿ ವಿಸ್ತಾರ",
      themeMr: "वेगवान झेप, नवी ओळख व मानसन्मान",
      themeHi: "तीव्र उछाल, नवीन पद एवं प्रतिष्ठा विस्तार",
      themeTe: "వేగవంతమైన ఎదుగుదల, కొత్త హోదా & కీర్తి",
      themeTa: "வேகமான உயர்வு, புதிய அந்தஸ்து & புகழ்",
      themeEn: "Breakthrough Acceleration & Earned Spotlight",
      storyKn: `${n(nowYear + 1)}ರಲ್ಲಿ ನೀರಿನಲ್ಲಿ ದೋಣಿ ಗಾಳಿಯ ದಿಕ್ಕಿಗೆ ಸಿಕ್ಕಂತೆ ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ದ್ವಿಗುಣ ವೇಗ ಸಿಗುತ್ತದೆ! ಹಿಂದಿನ ವರ್ಷ ಕಟ್ಟಿದ ಅಡಿಪಾಯದ ಮೇಲೆ ನಿಮ್ಮ ಹೆಸರು, ಸಂಪರ್ಕ ಹಾಗೂ ಹೊಸ ಅವಕಾಶಗಳು ಹಲವು ಪಟ್ಟು ಬೆಳೆಯುತ್ತವೆ.`,
      storyMr: `${n(nowYear + 1)} मध्ये तुमची मेहनत दुप्पट वेगाने फळे देईल! आधीच्या वर्षी घातलेल्या पायावर तुमचे नाव, अधिकार आणि संधी मोठ्या प्रमाणात वाढतील.`,
      storyHi: `${n(nowYear + 1)} में आपके प्रयासों को हवा का अनुकूल रुख मिलेगा! पिछले वर्ष बने आधार पर आपकी पहचान, संपर्क और अवसर कई गुना बढ़ेंगे।`,
      storyTe: `${n(nowYear + 1)}లో మీ శ్రమకు రెట్టింపు వేగం లభిస్తుంది! ముందు ఏడాది వేసిన పునాదిపై మీ పేరు, గౌరవం మరియు అవకాశాలు గొప్పగా విస్తరిస్తాయి.`,
      storyTa: `${n(nowYear + 1)}-ல் உங்கள் முயற்சிகளுக்கு இரட்டிப்பு வேகம் கிடைக்கும்! முந்தைய ஆண்டின் அடித்தளத்தின் மீது உங்கள் புகழும் வாய்ப்புகளும் பலமடங்கு உயரும்.`,
      storyEn: `${nowYear + 1} flips the script from quiet preparation to visible acceleration. Contacts remember your reliability, bigger platforms invite your voice, and delayed rewards start compounding cleanly.`,
      twistKn: `ಕಥೆಯ ತಿರುವು: ನೀವು ತಲುಪಬೇಕೆಂದಿದ್ದ ಹಳೆಯ ಗುರಿಗಿಂತ ಇನ್ನೂ ದೊಡ್ಡ ಮತ್ತು ಗೌರವದ ಪಾತ್ರವೊಂದು ಅನಿರೀಕ್ಷಿತ ದಿಕ್ಕಿನಿಂದ ನಿಮಗೆ ಒದಗಿ ಬರಲಿದೆ!`,
      twistMr: `अनपेक्षित ट्विस्ट: तुम्ही ठरवलेल्या जुन्या लक्ष्यापेक्षाही मोठी आणि मानाची संधी एका नव्या दिशेने तुमच्याकडे चालून येईल!`,
      twistHi: `रोमांचक मोड़: आपने जिस छोटे लक्ष्य की कल्पना की थी, उससे कहीं बड़ी और प्रतिष्ठित भूमिका किसी अनपेक्षित दिशा से आपके पास आएगी!`,
      twistTe: `ఆశ్చర్యకర మలుపు: మీరు పెట్టుకున్న పాత లక్ష్యం కంటే ఎంతో పెద్దది, గౌరవప్రదమైన కొత్త అవకాశం అనూహ్యంగా మీ తలుపు తడుతుంది!`,
      twistTa: `சுவாரஸ்ய திருப்பம்: நீங்கள் எதிர்பார்த்த பழைய இலக்கை விட மிகப் பெரிய, கௌரவமான பொறுப்பு எதிர்பாராத திசையிலிருந்து தேடி வரும்!`,
      twistEn: `The Year 2 twist: an invitation arrives from outside your usual circle—larger in scope than the plan you originally wrote for yourself.`,
      moveKn: `ಸಂಕೋಚ ಬಿಟ್ಟು ದೊಡ್ಡ ವೇದಿಕೆಗೆ ಹೆಜ್ಜೆ ಇಡಿ — ಈ ವರ್ಷ ನಿಮ್ಮ ಆಲೋಚನೆಗಿಂತ ನಿಮ್ಮ ಪ್ರತಿಭೆ ದೊಡ್ಡದು.`,
      moveMr: `संकोच सोडा आणि मोठ्या संधीचे स्वागत करा — तुमची ताकद तुमच्या कल्पनेपेक्षा मोठी आहे.`,
      moveHi: `संकोच त्यागकर बड़े मंच का स्वागत करें—आपकी योग्यता आपकी सोच से भी बड़ी है।`,
      moveTe: `సంకోచం వదిలి పెద్ద వేదికలపైకి అడుగుపెట్టండి—మీ ప్రతిభ మీ ఊహ కంటే పెద్దది.`,
      moveTa: `தயக்கத்தை விட்டு பெரிய மேடைகளை ஏற்றுக்கொள்ளுங்கள்—உங்கள் திறமை உங்கள் கற்பனையை விடப் பெரியது.`,
      moveEn: `Step into the bigger room without shrinking; your steady track record already earned you that seat.`,
      reflKn: `ನೀವು ಯಾವ ದೊಡ್ಡ ವೇದಿಕೆ ಅಥವಾ ಪ್ರಾಜೆಕ್ಟ್ ಬಗ್ಗೆ 'ಇದು ನನಗೆ ಸ್ವಲ್ಪ ದೊಡ್ಡದಾಗಬಹುದೇನೋ' ಅಂದುಕೊಂಡಿದ್ದೀರೋ, ಅದಕ್ಕೆ ಈಗ ಸಿದ್ಧರಾಗಿ!`,
      reflMr: `कोणत्या मोठ्या संधीबद्दल तुम्हाला कधी 'ही माझ्यासाठी खूप मोठी तर नाही ना' असे वाटले होते? तीच वेळ जवळ येत आहे!`,
      reflHi: `किस बड़े अवसर के बारे में कभी सोचा था कि 'यह बहुत बड़ा है'—अब उसे संभालने के लिए तैयार हो जाइए!`,
      reflTe: `ఏ పెద్ద అవకాశం గురించి 'నా వల్ల అవుతుందా?' అని ఆలోచించారో, దానిని అందుకోవడానికి ఇప్పుడు సిద్ధమవండి!`,
      reflTa: `எந்தப் பெரிய வாய்ப்பைப் பார்த்து 'இது நமக்குப் பெரியதாக இருக்குமோ' என்று நினைத்தீர்களோ, அதற்கு இப்போது தயாராகுங்கள்!`,
      reflEn: `Pause & Check: Which intimidating goal looks surprisingly reachable once you list the three people who already trust your work?`,
    },
    {
      ch: 21, offset: 2, icon: "🏰",
      themeKn: "ಸುವರ್ಣ ಶಿಖರ, ಆಸ್ತಿ ಭದ್ರತೆ & ಕುಟುಂಬ ಸಂಭ್ರಮ",
      themeMr: "सुवर्ण शिखर, स्थावर मालमत्ता व कौटुंबिक उत्सव",
      themeHi: "स्वर्णिम शिखर, संपत्ति निर्माण एवं पारिवारिक उत्सव",
      themeTe: "సువర్ణ శిఖరం, ఆస్తి స్థిరత్వం & కుటుంబ వేడుక",
      themeTa: "பொற்கால உச்சம், சொத்து உறுதி & குடும்ப மகிழ்ச்சி",
      themeEn: "Golden Peak — Tangible Assets & Celebratory Stability",
      storyKn: `${n(nowYear + 2)} ಮತ್ತು ${n(nowYear + 3)}ನೇ ವರ್ಷಗಳು ಕನಸುಗಳನ್ನು ಕಲ್ಲು-ಮಣ್ಣಿನ ವಾಸ್ತವಕ್ಕೆ ಇಳಿಸುವ ಸುವರ್ಣ ಹಂತ! ಸ್ವಂತ ಮನೆ, ಆಸ್ತಿ, ವಾಹನ, ಮಕ್ಕಳ ಪ್ರಮುಖ ಸಾಧನೆ ಅಥವಾ ಕುಟುಂಬದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಸಂಭ್ರಮ ಗರಿಗೆದರುತ್ತದೆ.`,
      storyMr: `${n(nowYear + 2)} व ${n(nowYear + 3)} ही वर्षे तुमच्या स्वप्नांना प्रत्यक्ष स्थावर रूप देणारी आहेत! घर, वाहन, मालमत्ता आणि कुटुंबात आनंदाचे सोहळे या काळात साकार होतात.`,
      storyHi: `${n(nowYear + 2)} और ${n(nowYear + 3)} आपके सपनों को ठोस यथार्थ में बदलने का स्वर्णिम शिखर हैं! गृह, संपत्ति, संतान की बड़ी उपलब्धि और परिवार में मांगलिक उत्सवों का योग बनता है।`,
      storyTe: `${n(nowYear + 2)} మరియు ${n(nowYear + 3)} సంవత్సరాలు మీ కలలను నిజమైన ఆస్తులుగా, విజయంగా మార్చే సువర్ణ దశ! ఇల్లు, ఆస్తి, వాహనం లేదా కుటుంబంలో శుభకార్యాల ఆనందం వెల్లివిరుస్తుంది.`,
      storyTa: `${n(nowYear + 2)} மற்றும் ${n(nowYear + 3)}-ம் ஆண்டுகள் உங்கள் கனவுகளை நிலையான சொத்துக்களாக மாற்றும் பொற்காலம்! வீடு, நிலம், வாகனம் அல்லது குடும்ப சுப நிகழ்ச்சிகள் நிறைவேறும்.`,
      storyEn: `Years 3 and 4 (${nowYear + 2}–${nowYear + 3}) form your golden consolidation ridge: what you built in silence turns into visible anchors—property, upgraded living comfort, major family milestones, and genuine peace of mind.`,
      twistKn: `ಆನಂದದ ತಿರುವು: ಹಿಂದೆ 'ಕಷ್ಟವಾಗಬಹುದೋ' ಎನಿಸಿದ್ದ ಆರ್ಥಿಕ ಜವಾಬ್ದಾರಿಗಳು ಈ ಹಂತದಲ್ಲಿ ಕುಟುಂಬದ ಒಗ್ಗಟ್ಟಿನಿಂದ ಸುಲಭವಾಗಿ ಮುಗಿದುಹೋಗುತ್ತವೆ!`,
      twistMr: `आनंदाचा ट्विस्ट: पूर्वी अवघड वाटणाऱ्या कौटुंबिक जबाबदाऱ्या या टप्प्यावर घरच्यांच्या सहकार्याने सहज पार पडतात!`,
      twistHi: `सुखद मोड़: जो आर्थिक या पारिवारिक जिम्मेदारियां पहले बोझ लगती थीं, वे इस चरण में सबके सहयोग से सहज पूर्ण हो जाती हैं!`,
      twistTe: `ఆనందకర మలుపు: ఒకప్పుడు కష్టమనిపించిన పెద్ద కుటుంబ బాధ్యతలన్నీ ఈ దశలో అందరి సహకారంతో సునాయాసంగా పూర్తవుతాయి!`,
      twistTa: `மகிழ்ச்சித் திருப்பம்: முன்பு சுமையாகத் தெரிந்த பெரிய குடும்பப் பொறுப்புகள் அனைத்தும் இக்காலத்தில் குடும்ப ஒற்றுமையால் எளிதாக முடியும்!`,
      twistEn: `The rewarding twist: obligations that once felt scary to fund alone now come together through balanced planning and timely family unity.`,
      moveKn: `ಲಾಭದ ಅಹಂಕಾರ ಬರದಿರಲಿ — ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ದಾನ-ಸಹಾಯದ ಗುಣವೇ ಈ ಶಿಖರವನ್ನು ಶಾಶ್ವತವಾಗಿ ಉಳಿಸುತ್ತದೆ.`,
      moveMr: `यशाचा अहंकार येऊ देऊ नका — नम्रता आणि कृतज्ञताच हे वैभव चिरकाळ टिकवते.`,
      moveHi: `सफलता में विनम्रता बनाए रखें—कृतज्ञता और अपनों का सम्मान ही इस वैभव को स्थायी रखता है।`,
      moveTe: `విజయ గర్వం దరిచేరనివ్వకండి—వినయం, కృతజ్ఞతలే ఈ ఉన్నత స్థితిని శాశ్వతంగా నిలుపుతాయి.`,
      moveTa: `வெற்றியின்போது பணிவைக் காத்துக்கொள்ளுங்கள்—நன்றியுணர்வும் அன்பும் இந்த உயர்வை நிலையாக வைத்திருக்கும்.`,
      moveEn: `Stay humble at the crest: protect savings margins cleanly and share credit warmly with those who stood beside you early.`,
      reflKn: `ಈ ಸುವರ್ಣ ಹಂತದಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬದ ಮುಖದಲ್ಲಿ ನೀವು ನೋಡಬಯಸುವ ಅತ್ಯಂತ ದೊಡ್ಡ ನಗು ಯಾವುದು?`,
      reflMr: `या सुवर्ण काळात तुम्हाला तुमच्या घरच्यांच्या चेहऱ्यावर कोणता सर्वात मोठा आनंद पाहायचा आहे?`,
      reflHi: `इस स्वर्णिम चरण में आप अपने परिवार के चेहरे पर कौन सी सबसे बड़ी खुशी देखना चाहते हैं?`,
      reflTe: `ఈ సువర్ణ దశలో మీ కుటుంబ సభ్యుల కళ్ళలో మీరు చూడాలనుకుంటున్న అతిపెద్ద సంతోషం ఏది?`,
      reflTa: `இந்தப் பொற்காலத்தில் உங்கள் குடும்பத்தினர் முகத்தில் நீங்கள் காண விரும்பும் மிகப்பெரிய மகிழ்ச்சி எது?`,
      reflEn: `Pause & Check: Picture one proud moment you want your family celebrating three years from today—every step ahead is leading there.`,
    },
    {
      ch: 22, offset: 4, icon: "🌅",
      themeKn: "ಪಂಚವಾರ್ಷಿಕ ಪರಮ ಗುರಿ & ಶಾಶ್ವತ ನೆಮ್ಮದಿಯ ದಿಗಂತ",
      themeMr: "पाचव्या वर्षाचा समतोल व चिरस्थायी शांतता",
      themeHi: "पांचवें वर्ष की परिपक्वता एवं चिरस्थायी शांति",
      themeTe: "5వ ఏడాది పరిపక్వత & శాశ్వత ప్రశాంతత",
      themeTa: "5-வது ஆண்டு நிறைவு & நிரந்தர மன அமைதி",
      themeEn: "Year 5 Horizon — Lasting Independence & Quiet Legacy",
      storyKn: `ಐದನೇ ವರ್ಷದ ದಿಗಂತ (${n(nowYear + 4)}) ತಲುಪುವ ವೇಳೆಗೆ, ನೀವು ಬರೀ 'ಬದುಕು ಸಾಗಿಸುವ' ಹಂತವನ್ನು ದಾಟಿ ಇತರರಿಗೆ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ನೆರಳು ಕೊಡುವ ಎತ್ತರದ ಸ್ಥಾನದಲ್ಲಿರುತ್ತೀರಿ. ಹಣದ ಆತಂಕ ಕಡಿಮೆಯಾಗಿ ಸಮಯದ ಸ್ವಾತಂತ್ರ್ಯ ಲಭಿಸುತ್ತದೆ.`,
      storyMr: `पाचव्या वर्षाच्या टप्प्यावर (${n(nowYear + 4)}) तुम्ही केवळ स्वतःचा विचार करण्यापलीकडे जाऊन इतरांना आधार देणाऱ्या खंबीर स्थानावर असाल. पैशाची चिंता कमी होऊन मनाला खरे स्वातंत्र्य लाभेल.`,
      storyHi: `पांचवें वर्ष (${n(nowYear + 4)}) तक पहुंचते-पहुंचते आप केवल संघर्ष पार करने की अवस्था से निकलकर दूसरों को सहारा देने वाले प्रतिष्ठित स्थान पर होंगे। अनावश्यक चिंता घटकर समय की आज़ादी मिलेगी।`,
      storyTe: `ఐదవ ఏడాది (${n(nowYear + 4)}) నాటికి మీరు కేవలం రోజులు గడిపే దశను దాటి, ఇతరులకు అండగా నిలిచే ఉన్నత స్థితిలో ఉంటారు. ఆర్థిక ఆందోళన తగ్గి ప్రశాంతత పెరుగుతుంది.`,
      storyTa: `ஐந்தாம் ஆண்டை (${n(nowYear + 4)}) அடையும்போது நீங்கள் அன்றாடப் போராட்டங்களைத் தாண்டி பிறருக்கு வழிகாட்டும் உயர்ந்த நிலையில் இருப்பீர்கள். நிம்மதியும் சுதந்திரமும் பெருகும்.`,
      storyEn: `By Year 5 (${nowYear + 4}), your five-year arc completes a quiet transformation: instead of scrambling from crisis to crisis, you stand on steady ground—financially safer, emotionally lighter, and respected for integrity.`,
      twistKn: `ಐದು ವರ್ಷಗಳ ಮಹಾ ತಿರುವು: ಅಂದು ನೀವು ಕಳೆದುಕೊಂಡೆ ಎಂದು ಭಾವಿಸಿದ್ದಕ್ಕಿಂತ ಹತ್ತು ಪಟ್ಟು ಶ್ರೇಷ್ಠವಾದದ್ದು ನಿಮಗೆ ದೊರಕಿ, 'ಅದಕ್ಕೆಲ್ಲಾ ಅರ್ಥವಿತ್ತು!' ಎನಿಸಲಿದೆ.`,
      twistMr: `पाच वर्षांचा महान शेवट: ज्या गोष्टी हरवल्याची खंत कधी वाटली होती, त्यापेक्षा कितीतरी पटीने चांगले जीवन तुमच्याकडे असेल आणि 'प्रत्येक परीक्षेला अर्थ होता' याची खात्री पटेल!`,
      twistHi: `पांच वर्षों का सुंदर निष्कर्ष: एक समय जिन बातों के खोने का दुख था, उससे कहीं बेहतर जीवन पाकर आप स्वयं कहेंगे—'हर कठिन मोड़ का कोई गहरा अर्थ था!'`,
      twistTe: `ఐదేళ్ల మహా మలుపు: ఒకప్పుడు కోల్పోయామని బాధపడ్డ దానికంటే ఎన్నో రెట్లు గొప్ప జీవితాన్ని పొంది, 'అన్నింటికీ ఒక అర్థం ఉండింది!' అని సంతోషిస్తారు.`,
      twistTa: `ஐந்தாண்டுப் பயணத்தின் திருப்பம்: முன்பு இழந்ததாக வருந்தியதை விடப் பன்மடங்கு சிறந்த வாழ்க்கையை அடைந்து, 'நடந்ததெல்லாம் நன்மைக்கே!' என உணர்வீர்கள்.`,
      twistEn: `The 5-year closing twist: looking back from ${nowYear + 4}, every painful redirection from the past makes complete sense—you outgrew rooms that were too small for where you landed.`,
      moveKn: `ನಿಮ್ಮ ಭವಿಷ್ಯದ ಪಯಣ: ಆರೋಗ್ಯ, ಕುಟುಂಬದ ಒಗ್ಗಟ್ಟು ಹಾಗೂ ಕಲಿಯುವ ಉತ್ಸಾಹವನ್ನು ಎಂದಿಗೂ ನಿಲ್ಲಿಸಬೇಡಿ.`,
      moveMr: `पुढील वाटचाल: आरोग्य, कुटुंबाचे प्रेम आणि सतत शिकण्याची जिद्द कधीच सोडू नका.`,
      moveHi: `दीर्घ सूत्र: स्वास्थ्य, परिवार की एकता और सीखने का उत्साह जीवन भर संजोए रखें।`,
      moveTe: `భవిష్యత్ సూత్రం: ఆరోగ్యం, కుటుంబ ఐక్యత మరియు కొత్త విషయాలు నేర్చుకునే ఉత్సాహాన్ని ఎప్పుడూ వదులుకోకండి.`,
      moveTa: `தொடர் நெறி: ஆரோக்கியம், குடும்ப ஒற்றுமை மற்றும் கற்கும் ஆர்வத்தை எப்போதும் காத்துக்கொள்ளுங்கள்.`,
      moveEn: `Guard your three non-negotiables across all five years: clean health, unbroken family trust, and fearless curiosity.`,
      reflKn: `ಸ್ವಯಂ-ಪರಿಶೀಲನೆ: ೫ ವರ್ಷಗಳ ನಂತರದ ನಿಮ್ಮ ಶಾಂತ ಮತ್ತು ಯಶಸ್ವಿ ಜೀವನದ ಚಿತ್ರವನ್ನು ಈಗಲೇ ಮನಸ್ಸಿನಲ್ಲಿ ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ!`,
      reflMr: `स्व-परीक्षण: ५ वर्षांनंतरचे तुमचे शांत व यशस्वी आयुष्य आजच मनात पाहून एक समाधानाची खूण गाठा!`,
      reflHi: `स्वयं-निरीक्षण: आज से ५ वर्ष बाद के अपने शांत, सुरक्षित और सम्मानित स्वरूप की कल्पना करके देखें!`,
      reflTe: `మిమ్మల్ని మీరు అడుగండి: ఐదేళ్ల తర్వాత మీరు సాధించబోయే ప్రశాంతమైన, విజయవంతమైన జీవితాన్ని ఒక్కసారి ఊహించుకోండి!`,
      reflTa: `சுய பரிசோதனை: 5 ஆண்டுகளுக்குப் பிறகு நீங்கள் அடையப்போகும் அமைதியான, வெற்றிகரமான வாழ்வை இப்போது மனதில் காட்சிப்படுத்துங்கள்!`,
      reflEn: `Pause & Check: Imagine standing in ${nowYear + 4} looking back at today—what kind word would your calmer future self say right now?`,
    }
  ];

  for (const y of yearNarratives) {
    list.push({
      n: y.ch, sec: 4, secTitle: sec4, icon: y.icon, visual: "horizon-wave",
      title: {
        kn: `ವರ್ಷ ${n(y.offset + 1)} (${n(nowYear + y.offset)}): ${y.themeKn}`,
        mr: `वर्ष ${n(y.offset + 1)} (${n(nowYear + y.offset)}): ${y.themeMr}`,
        hi: `वर्ष ${n(y.offset + 1)} (${n(nowYear + y.offset)}): ${y.themeHi}`,
        te: `సంవత్సరం ${n(y.offset + 1)} (${n(nowYear + y.offset)}): ${y.themeTe}`,
        ta: `ஆண்டு ${n(y.offset + 1)} (${n(nowYear + y.offset)}): ${y.themeTa}`,
        en: `Year ${y.offset + 1} (${nowYear + y.offset}) — ${y.themeEn}`,
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ${n(nowYear + y.offset)}ನೇ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಕಥೆಯ ಪ್ರಮುಖ ತಿರುವು ಏನು?`,
        mr: `प्रश्न: ${devoteeName}, ${n(nowYear + y.offset)} या वर्षात तुमच्या प्रवासाचे मुख्य वळण काय असेल?`,
        hi: `प्रश्न: ${devoteeName}, वर्ष ${n(nowYear + y.offset)} में आपकी कहानी का सबसे बड़ा मोड़ क्या होने वाला है?`,
        te: `ప్రశ్న: ${devoteeName}, ${n(nowYear + y.offset)} సంవత్సరంలో మీ ప్రయాణంలో వచ్చే ప్రధాన మలుపు ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, ${n(nowYear + y.offset)}-ம் ஆண்டில் உங்கள் வாழ்வின் முக்கிய திருப்பம் என்ன?`,
        en: `Question: ${devoteeName}, what defining shift shapes your journey in ${nowYear + y.offset}?`,
      },
      p1: { kn: y.storyKn, mr: y.storyMr, hi: y.storyHi, te: y.storyTe, ta: y.storyTa, en: y.storyEn },
      p2: { kn: y.twistKn, mr: y.twistMr, hi: y.twistHi, te: y.twistTe, ta: y.twistTa, en: y.twistEn },
      p3: { kn: y.moveKn, mr: y.moveMr, hi: y.moveHi, te: y.moveTe, ta: y.moveTa, en: y.moveEn },
      reflection: { kn: y.reflKn, mr: y.reflMr, hi: y.reflHi, te: y.reflTe, ta: y.reflTa, en: y.reflEn },
      badge: { kn: `ವರ್ಷ ${n(y.offset + 1)}`, mr: `वर्ष ${n(y.offset + 1)}`, hi: `वर्ष ${n(y.offset + 1)}`, te: `ఏడాది ${n(y.offset + 1)}`, ta: `ஆண்டு ${n(y.offset + 1)}`, en: `Year ${y.offset + 1}` },
      anchors: [`${n(nowYear + y.offset)}`, `${yogiPlanetName}`],
    });
  }

  // SECTION 5 (Ch 23–25): CONSOLIDATED FINAL ACTION, DOSHA AUDIT & GOKARNA VERDICT
  const activeCountText = n(doshaProfiles.length);
  const topDoshaNames = doshaProfiles.map((d) => d.title).join(", ");

  list.push(
    {
      n: 23, sec: 5, secTitle: sec5, icon: "🔱", visual: "rashi-mandala",
      title: {
        kn: "ಅಂತಿಮ ದೋಷ ಪರಿಶೀಲನೆ: ಜೀವನದ ಮೇಲಿನ ಪ್ರಭಾವ & ನಿಖರ ಪರಿಹಾರಗಳು",
        mr: "अंतिम दोष तपासणी: आयुष्यावरील परिणाम व अचूक उपाय",
        hi: "अंतिम दोष-समीक्षा: वर्तमान प्रभाव, प्रभावित क्षेत्र एवं सटीक उपाय",
        te: "తుది దోష పరిశీలన: జీవితంపై ప్రభావం & ఖచ్చితమైన పరిహారాలు",
        ta: "இறுதி தோஷ ஆய்வு: தற்போதைய தாக்கம் & துல்லிய தீர்வுகள்",
        en: "Consolidated Dosha Audit — Current Effects & Exact Solutions",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಕುಜ, ಸರ್ಪ, ಪಿತೃ ಹಾಗೂ ಮಾಂದಿ ದೋಷಗಳಲ್ಲಿ ಯಾವುದು ನಿಜವಾಗಿ ಸಕ್ರಿಯವಾಗಿದೆ, ಅದು ಏನು ಮಾಡುತ್ತಿದೆ ಮತ್ತು ಅದಕ್ಕೆ ಏನು ಪರಿಹಾರ?`,
        mr: `प्रश्न: ${devoteeName}, तुमच्या पत्रिकेत सध्या कोणते दोष सक्रिय आहेत, ते काय परिणाम करत आहेत व प्रत्येक दोषावर नेमका उपाय काय?`,
        hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में वास्तव में कौन से दोष सक्रिय हैं, वे अभी क्या असर डाल रहे हैं और हर दोष का सटीक समाधान क्या है?`,
        te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో ప్రస్తుతం ఏ దోషాలు ఉన్నాయి, అవి జీవితంలో ఏమి చేస్తున్నాయి మరియు వాటికి ఖచ్చితమైన పరిహారం ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் தற்போது எந்த தோஷங்கள் உள்ளன, அவை என்ன செய்கின்றன, அவற்றிற்குத் தீர்வு என்ன?`,
        en: `Question: ${devoteeName}, among classical Kuja, Sarpa, Pitru, and Maandi patterns, which ones actually affect your life today—and how do you resolve each cleanly?`,
      },
      p1: {
        kn: `ಮೊದಲ ೨೨ ಅಧ್ಯಾಯಗಳಲ್ಲಿ ನಾವು ಯಾವುದೇ ಪರಿಹಾರದ ಭಾರ ಹಾಕದೆ ಕೇವಲ ನಿಮ್ಮ ಜೀವನ ಕಥೆಯನ್ನು ನೋಡಿದ್ದೇವೆ. ಈಗ ಈ ಅಂತಿಮ ವಿಭಾಗದಲ್ಲಿ, ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಕುಜ, ಸರ್ಪ, ಪಿತೃ ಮತ್ತು ಮಾಂದಿ ಸ್ಥಾನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಪತ್ತೆಯಾದ ${activeCountText} ಪ್ರಮುಖ ಅಂಶಗಳ ಸ್ಪಷ್ಟ ಚಿತ್ರಣ ಇಲ್ಲಿದೆ: ${topDoshaNames}.`,
        mr: `आधीच्या २२ अध्यायांत आपण केवळ तुमची जीवनकथा पाहिली. आता या अंतिम विभागात तुमच्या पत्रिकेतील कुज, सर्प, पितृ व मांदी तपासणीतून समोर आलेले ${activeCountText} मुख्य मुद्दे स्पष्ट मांडत आहोत: ${topDoshaNames}.`,
        hi: `पिछले २२ अध्यायों में हमने बिना किसी उपाय की भीड़ के केवल आपकी जीवन-कथा समझी। अब इस अंतिम खंड में मंगल, सर्प, पितृ एवं मांदी की जांच के बाद उभरे ${activeCountText} प्रमुख बिंदु प्रस्तुत हैं: ${topDoshaNames}।`,
        te: `మొదటి 22 అధ్యాయాలలో కేవలం మీ కథను చూశాము. ఇప్పుడు ఈ తుది భాగంలో కుజ, సర్ప, పితృ మరియు మాంది పరిశీలన ద్వారా గుర్తించిన ${activeCountText} ముఖ్య అంశాల వివరాలు ఇక్కడ ఉన్నాయి: ${topDoshaNames}.`,
        ta: `முதல் 22 அத்தியாயங்களில் உங்கள் வாழ்க்கைக் கதையை மட்டுமே பார்த்தோம். இப்போது இந்த இறுதிப் பகுதியில் செவ்வாய், சர்ப்ப, பித்ரு மற்றும் மாந்தி ஆய்வில் கண்டறிந்த ${activeCountText} முக்கிய அம்சங்கள்: ${topDoshaNames}.`,
        en: `Across the first 22 chapters we deliberately kept your story clear of scattered rituals. Now, in this consolidated resolution chapter, we isolate the exact ${doshaProfiles.length} active factors screened across Kuja, Sarpa, Pitru, and Maandi placements: ${topDoshaNames}.`,
      },
      p2: {
        kn: `ಭಯಪಡಿಸುವುದು ನಮ್ಮ ಉದ್ದೇಶವಲ್ಲ — ಯಾವ ದೋಷ ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಬದುಕಿನಲ್ಲಿ ಏನು ಅಡ್ಡಿ ಮಾಡುತ್ತಿದೆ, ಯಾವ ಕ್ಷೇತ್ರ ಅಥವಾ ವಯಸ್ಸಿನ ಹಂತವನ್ನು ಮುಟ್ಟುತ್ತಿದೆ, ಮತ್ತು ಅದಕ್ಕೆ ಮಾತ್ರ ಮಾಡಬೇಕಾದ ಸರಳ-ನಿಖರ ಪರಿಹಾರ ಏನು ಎಂಬುದನ್ನು ಕೆಳಗಿನ ಕಾರ್ಡ್‌ಗಳಲ್ಲಿ ನೇರವಾಗಿ ನೀಡಲಾಗಿದೆ.`,
        mr: `भीती घालणे हा उद्देश नाही — कोणता दोष सध्या आयुष्यात काय अडथळा आणत आहे, कोणत्या टप्प्यावर परिणाम करत आहे आणि त्यासाठी काय करावे हे खाली दिले आहे.`,
        hi: `हमारा उद्देश्य भय पैदा करना नहीं—बल्कि यह दिखाना है कि प्रत्येक सक्रिय बिंदु अभी जीवन में क्या कर रहा है, किस हिस्से को छू रहा है और उसका सटीक समाधान क्या है।`,
        te: `భయపెట్టడం మా ఉద్దేశం కాదు—ప్రస్తుతం ఆయా దోషాలు మీ జీవితంలో ఏమి చేస్తున్నాయి, ఏ భాగాన్ని ప్రభావితం చేస్తున్నాయి మరియు వాటికి ఖచ్చితమైన మార్గం ఏమిటో క్రింద చూడండి.`,
        ta: `பயமுறுத்துவது எங்கள் நோக்கமல்ல—ஒவ்வொரு தோஷமும் இப்போது என்ன செய்கிறது, எந்தப் பகுதியைப் பாதிக்கிறது, அதற்கான சரியான தீர்வு என்ன என்பதை கீழே தெளிவாகக் காணுங்கள்.`,
        en: `Zero fear-mongering here: look directly at the breakdown below showing for each active factor what it is causing right now, which domain/phase it touches, and the single targeted fix built for it.`,
      },
      p3: {
        kn: `ಒಂದೇ ಬಾರಿಗೆ ನೂರು ಪೂಜೆಗಳ ಅಗತ್ಯವಿಲ್ಲ; ನಿಮ್ಮ ನಿಜವಾದ ಜೀವನವನ್ನು ತಡೆಯುತ್ತಿರುವ ಆ ನಿರ್ದಿಷ್ಟ ಅಂಶವನ್ನು ಮಾತ್ರ ಶಿಸ್ತಿನಿಂದ ಸರಿಪಡಿಸಿಕೊಂಡರೆ ಸಾಕು — ಫಲಿತಾಂಶ ತಾನಾಗಿಯೇ ಬದಲಾಗುತ್ತದೆ.`,
        mr: `एकाच वेळी अनेक अवडंबराची गरज नाही; केवळ तुमच्या आयुष्याला अडवणाऱ्या मुख्य मुद्द्यावरच नेमका उपाय केल्यास लगेच फरक पडतो.`,
        hi: `सौ उपायों के पीछे भागने की आवश्यकता नहीं; जो एक-दो बिंदु वास्तव में रास्ता रोक रहे हैं, केवल उन्हीं का सटीक समाधान पर्याप्त है।`,
        te: `ఒకేసారి పదుల కొద్దీ పూజలు అవసరం లేదు; మీ జీవితాన్ని నిజంగా ప్రభావితం చేస్తున్న ఆ నిర్దిష్ట అంశాన్ని సరిచేసుకుంటే చాలు, అద్భుత మార్పు వస్తుంది.`,
        ta: `பல பரிகாரங்களைத் தேடத் தேவையில்லை; உங்கள் முன்னேற்றத்தைத் தடுக்கும் அந்தக் குறிப்பிட்ட விஷயத்திற்கு மட்டும் சரியான தீர்வு கண்டால் போதும்.`,
        en: `You never need ten random rituals—resolving only the active bottlenecks verified in your own chart unlocks momentum effortlessly.`,
      },
      reflection: {
        kn: `ಮುಖ್ಯ ಸೂಚನೆ: ಕೆಳಗಿನ ಪ್ರತಿಯೊಂದು ಸಕ್ರಿಯ ಅಂಶದ 'ಈಗಿನ ಪ್ರಭಾವ', 'ಪರಿಣಾಮದ ಕ್ಷೇತ್ರ' ಮತ್ತು 'ನಿಖರ ಪರಿಹಾರ'ವನ್ನು ಗಮನವಿಟ್ಟು ಓದಿ.`,
        mr: `महत्त्वाची नोंद: खालील प्रत्येक मुद्द्याचा 'सध्याचा परिणाम', 'प्रभावित क्षेत्र' आणि 'नेमका उपाय' शांतपणे वाचा.`,
        hi: `मुख्य निर्देश: नीचे दिए गए प्रत्येक सक्रिय बिंदु के 'वर्तमान प्रभाव', 'प्रभावित क्षेत्र' और 'सटीक उपाय' को ध्यान से पढ़ें।`,
        te: `ముఖ్య గమనిక: క్రింద ఇచ్చిన ప్రతి అంశం యొక్క 'ప్రస్తుత ప్రభావం', 'ప్రభావిత రంగం' మరియు 'ఖచ్చిత పరిహారం' శ్రద్ధగా చదవండి.`,
        ta: `முக்கிய குறிப்பு: கீழே உள்ள ஒவ்வொரு தோஷத்தின் 'தற்போதைய தாக்கம்', 'பாதிக்கும் பகுதி' மற்றும் 'தீர்வு' ஆகியவற்றை கவனமாகப் படிக்கவும்.`,
        en: `Action Card Below: Review every highlighted factor's real-world effect, affected life phase, and targeted action step cleanly.`,
      },
      badge: { kn: "ನಿಖರ ದೋಷ ಸಾರ", mr: "दोष निवारण", hi: "दोष-समाधान", te: "దోష పరిహారం", ta: "தோஷத் தீர்வு", en: "Targeted Fixes" },
      anchors: [`${n(maandiHouse)}`, `${shaniTransitRashi}`],
    },
    {
      n: 24, sec: 5, secTitle: sec5, icon: "📿", visual: "power-compass",
      title: {
        kn: "ಅಂತಿಮ ಜೀವನ ಸೂತ್ರ: ನಿಮ್ಮ ದೈನಂದಿನ ಶಕ್ತಿ ಕೇಂದ್ರ & ಸರಳ ನಿಯಮ",
        mr: "अंतिम जीवन-मंत्र: तुमची दैनंदिन ऊर्जा व साधा नियम",
        hi: "अंतिम जीवन-सूत्र: आपका व्यक्तिगत शक्ति केंद्र एवं सरल नियम",
        te: "తుది జీవన సూత్రం: మీ వ్యక్తిగత శక్తి కేంద్రం & సులభ నియమం",
        ta: "இறுதி வாழ்வியல் நெறி: உங்கள் தினசரி ஆற்றல் & எளிய வழி",
        en: "Your Consolidated Daily Power Blueprint — High Impact, Zero Clutter",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನೂರು ನಿಯಮಗಳ ಬದಲಾಗಿ, ಪ್ರತಿದಿನ ಕೇವಲ ೫ ನಿಮಿಷದಲ್ಲಿ ನಿಮ್ಮ ಭಾಗ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುವ ಆ ಒಂದು ಸರಳ ಸೂತ್ರ ಯಾವುದು?`,
        mr: `प्रश्न: ${devoteeName}, शंभर नियमांऐवजी दररोज फक्त ५ मिनिटांत तुमची ऊर्जा जागवणारे एकच सोपे सूत्र कोणते?`,
        hi: `प्रश्न: ${devoteeName}, सौ जटिल नियमों के बजाय प्रतिदिन केवल ५ मिनट में आपका आत्मबल जगाने वाला एक सरल सूत्र क्या है?`,
        te: `ప్రశ్న: ${devoteeName}, వంద నియమాల బదులు రోజులో కేవలం 5 నిమిషాల్లో మీ అదృష్టాన్ని మేల్కొల్పే ఆ ఒక్క సూత్రం ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, நூறு சடங்குகளுக்குப் பதிலாக தினமும் 5 நிமிடங்களில் உங்கள் ஆற்றலை உயர்த்தும் எளிய வழி எது?`,
        en: `Question: ${devoteeName}, instead of complicated routines, what single 5-minute daily anchor aligns your mind and luck cleanly?`,
      },
      p1: {
        kn: `ದೊಡ್ಡ ಬದಲಾವಣೆಗಳು ಎಂದಿಗೂ ಕ್ಲಿಷ್ಟಕರವಾಗಿರುವುದಿಲ್ಲ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ${nakshatraName}, ಪ್ರಬಲ '${dominantElement}' ತತ್ವ ಹಾಗೂ ಯೋಗಿ '${yogiPlanetName}' ಶಕ್ತಿಯನ್ನು ಒಂದೇ ಕಡೆ ಕೇಂದ್ರೀಕರಿಸಲು ನಿಮಗೆ ಬೇಕಿರುವುದು ಕೇವಲ ಶಾಂತ ದಿನಚರಿ.`,
        mr: `मोठे बदल कधीच गुंतागुंतीचे नसतात. तुमचे ${nakshatraName} नक्षत्र, '${dominantElement}' स्वभाव आणि योगी '${yogiPlanetName}' यांची ताकद एकत्र आणण्यासाठी केवळ शांत ५ मिनिटे पुरेशी आहेत.`,
        hi: `बड़े बदलाव कभी जटिल नहीं होते। आपके ${nakshatraName} नक्षत्र, '${dominantElement}' प्रकृति और योगी '${yogiPlanetName}' की ऊर्जा को संरेखित करने के लिए बस ५ शांत मिनट पर्याप्त हैं।`,
        te: `పెద్ద మార్పులు ఎప్పుడూ క్లిష్టంగా ఉండవు. మీ ${nakshatraName} నక్షత్రం, '${dominantElement}' మరియు యోగి '${yogiPlanetName}' శక్తిని ఏకం చేయడానికి రోజుకు 5 నిమిషాల ప్రశాంతత చాలు.`,
        ta: `பெரிய மாற்றங்கள் ஒருபோதும் கடினமானவை அல்ல. உங்கள் ${nakshatraName} நட்சத்திரம், '${dominantElement}' மற்றும் யோகி '${yogiPlanetName}' ஆற்றலை இணைக்க தினமும் 5 நிமிட அமைதி போதும்.`,
        en: `Lasting transformation is never complicated. Pulling your ${nakshatraName} sensitivity, ${dominantElement} balance, and ${yogiPlanetName} alignment into one calm rhythm takes just five focused minutes.`,
      },
      p2: {
        kn: `ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ೪ ಪವರ್ ಕೀಗಳು: ಶುಭ ದಿನ — ${localizedYogiDay}; ದಿಕ್ಕು — ${localizedYogiDirection}; ಪ್ರೇರಣಾ ಬಣ್ಣ — ${localizedYogiColor}; ಇಷ್ಟದೇವತಾ ಸ್ಮರಣೆ — ${localizedYogiDeity}. ಬೆಳಗ್ಗೆ ಕೇವಲ ೫ ನಿಮಿಷ ಫೋನ್ ದೂರವಿಟ್ಟು ಶಾಂತವಾಗಿ 'ಓಂ' ಸ್ಮರಣೆ ಮಾಡಿ ದಿನ ಪ್ರಾರಂಭಿಸಿ.`,
        mr: `तुमच्या ४ पॉवर कीज: शुभ दिवस — ${localizedYogiDay}; दिशा — ${localizedYogiDirection}; रंग — ${localizedYogiColor}; उपास्य — ${localizedYogiDeity}. सकाळी ५ मिनिटे मोबाईलशिवाय शांत ध्यान करून दिवसाची सुरुवात करा.`,
        hi: `आपकी ४ शक्ति कुंजियां: शुभ दिवस — ${localizedYogiDay}; दिशा — ${localizedYogiDirection}; रंग — ${localizedYogiColor}; इष्ट — ${localizedYogiDeity}। प्रातः ५ मिनट बिना फोन के शांत स्मरण से दिन आरंभ करें।`,
        te: `మీ 4 పవర్ కీలు: శుభ రోజు — ${localizedYogiDay}; దిశ — ${localizedYogiDirection}; రంగు — ${localizedYogiColor}; ఇష్టదైవం — ${localizedYogiDeity}. ఉదయం 5 నిమిషాలు ఫోన్ పక్కన పెట్టి ప్రశాంతంగా రోజును ప్రారంభించండి.`,
        ta: `உங்கள் 4 ஆற்றல் சாவிகள்: உகந்த நாள் — ${localizedYogiDay}; திசை — ${localizedYogiDirection}; நிறம் — ${localizedYogiColor}; வழிபாடு — ${localizedYogiDeity}. காலையில் 5 நிமிட அமைதியோடு நாளைத் தொடங்குங்கள்.`,
        en: `Your four personal alignment anchors live inside one snapshot: Power Day — ${localizedYogiDay}; Ideal Direction — ${localizedYogiDirection}; Grounding Shade — ${localizedYogiColor}; Sacred Focus — ${localizedYogiDeity}.`,
      },
      p3: {
        kn: `ನೀವು ಯಾವಾಗಲೂ ಒತ್ತಡದಲ್ಲಿದ್ದಾಗ ನಿಮ್ಮದಲ್ಲದ ಭಯಗಳನ್ನು ಪಕ್ಕಕ್ಕಿಟ್ಟು ಈ ೪ ಸಂಗತಿಗಳತ್ತ ಗಮನ ಹರಿಸಿದರೆ, ಮನಸ್ಸು ಮತ್ತೆ ತಾನಾಗಿಯೇ ಹಳಿಗೆ ಬರುತ್ತದೆ.`,
        mr: `कधीही गोंधळ वाटला तरी अनावश्यक भीती बाजूला ठेवून या साध्या लयीकडे परत या — मन लगेच शांत होईल.`,
        hi: `जब भी जीवन में शोर बढ़े, इन चार सहज आधारों पर लौट आएं—मन में स्पष्टता तुरंत लौट आएगी।`,
        te: `ఎప్పుడైనా ఆందోళన అనిపిస్తే, ఈ నాలుగు సులభమైన అంశాలను గుర్తుచేసుకోండి—వెంటనే మనసుకు ధైర్యం వస్తుంది.`,
        ta: `எப்போதெல்லாம் குழப்பம் வந்தாலும் இந்த நான்கு எளிய வழிகளுக்குத் திரும்புங்கள்—மனம் உடனே தெளிவடையும்.`,
        en: `Whenever noise builds up, skip complicated fixes—step back into your power day, clear breathing, and quiet discipline.`,
      },
      reflection: {
        kn: `ಇಂದಿನ ಪ್ರತಿಜ್ಞೆ: ನಾಳೆ ಬೆಳಗ್ಗೆ ಎದ್ದ ತಕ್ಷಣ ಕನಿಷ್ಠ ೫ ನಿಮಿಷ ಮೊಬೈಲ್ ನೋಡದೆ ಕೇವಲ ನಿಮ್ಮ ಉಸಿರು ಮತ್ತು ಕೃತಜ್ಞತೆಯೊಂದಿಗೆ ದಿನ ಆರಂಭಿಸಿ!`,
        mr: `आजचा संकल्प: उद्या सकाळी उठल्यावर पहिली ५ मिनिटे फोन न पाहता केवळ स्वतःसाठी द्या!`,
        hi: `आज का सरल संकल्प: कल सुबह उठते ही पहले ५ मिनट फोन से दूर रहकर शांत मन से दिन का स्वागत करें!`,
        te: `నేటి ప్రతిజ్ఞ: రేపు ఉదయం లేవగానే కనీసం 5 నిమిషాలు ఫోన్ చూడకుండా ప్రశాంతమైన ఆలోచనలతో రోజును ప్రారంభించండి!`,
        ta: `இன்றைய உறுதி: நாளை காலை எழுந்தவுடன் முதல் 5 நிமிடங்கள் போனைப் பார்க்காமல் அமைதியுடன் நாளைத் தொடங்குங்கள்!`,
        en: `Today's 5-Minute Challenge: Tomorrow morning, greet the first five minutes awake in silence before touching any screen.`,
      },
      badge: { kn: "ನಿತ್ಯ ಶಕ್ತಿ ಕೇಂದ್ರ", mr: "दैनंदिन लय", hi: "दैनिक शक्ति केंद्र", te: "శక్తి కేంద్రం", ta: "தினசரி ஆற்றல்", en: "Daily Compass" },
      anchors: [`${localizedYogiDay}`, `${localizedYogiDirection}`],
    },
    {
      n: 25, sec: 5, secTitle: sec5, icon: "🌟", visual: "power-compass",
      title: {
        kn: "ಜ್ಯೋತಿಷ್ಯ ಸಾರಾಂಶ: ಕಥೆಯ ಪೂರ್ಣ ವೃತ್ತ & ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾ ಆಶೀರ್ವಾದ",
        mr: "ज्योतिष सारांश: कथेची पूर्तता व श्री क्षेत्र गोकर्ण महा आशीर्वाद",
        hi: "ज्योतिष सारांश: जीवन-कथा का पूर्ण चक्र एवं श्री क्षेत्र गोकर्ण महा आशीर्वाद",
        te: "జ్యోతిష్య సారాంశం: కథ ముగింపు & శ్రీ క్షేత్ర గోకర్ణ మహా ఆశీర్వాదం",
        ta: "ஜோதிட சாரம்: கதையின் நிறைவு & ஸ்ரீ கோகர்ண மகா ஆசீர்வாதம்",
        en: "Grand Story Verdict & Sri Kshetra Gokarna Supreme Blessing",
      },
      question: {
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ೧ನೇ ಅಧ್ಯಾಯದಿಂದ ಇಲ್ಲಿಯವರೆಗಿನ ನಿಮ್ಮ ಇಡೀ ಪಯಣದ ಅಂತಿಮ ಸಾರಾಂಶ ಹಾಗೂ ಮುಖ್ಯ ಅರ್ಚಕರ ಆಶೀರ್ವಾದವೇನು?`,
        mr: `प्रश्न: ${devoteeName}, पहिल्या अध्यायापासून इथवरच्या संपूर्ण प्रवासाचा अंतिम निष्कर्ष आणि गोकर्णचा आशीर्वाद काय आहे?`,
        hi: `प्रश्न: ${devoteeName}, पहले अध्याय से लेकर अब तक की आपकी पूरी जीवन-कथा का अंतिम सार एवं आशीर्वाद क्या है?`,
        te: `ప్రశ్న: ${devoteeName}, మొదటి అధ్యాయం నుండి ఇక్కడి వరకు మీ మొత్తం కథ తుది సారాంశం మరియు ఆశీర్వాదం ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, முதல் அத்தியாயம் முதல் இதுவரையான உங்கள் பயணத்தின் இறுதி சாரம் மற்றும் ஆசீர்வாதம் என்ன?`,
        en: `Question: ${devoteeName}, tying Chapter 1 straight through today, what is the supreme takeaway and Gokarna blessing over your story?`,
      },
      p1: {
        kn: `${devoteeName}, ಮೊದಲ ಅಧ್ಯಾಯದಲ್ಲಿ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿದ್ದ ಆ ಮೌನ ಆತಂಕದೊಂದಿಗೆ ನಾವು ಈ ಪಯಣ ಶುರು ಮಾಡಿದ್ದೆವು. ಈಗ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಪಂಚಾಂಗ, ${lagnaRashiName} ಲಗ್ನ, ${moonRashiName} ರಾಶಿ ಹಾಗೂ ${nakshatraName} ಬಲವನ್ನು ನೋಡಿದ ನಂತರದ ಪರಮ ಸತ್ಯವಿದು: ನೀವು ಹಿಂದೆ ಅನುಭವಿಸಿದ ಪರೀಕ್ಷೆಗಳು ನಿಮ್ಮನ್ನು ಮುಗಿಸಲು ಬಂದಿರಲಿಲ್ಲ — ನಿಮ್ಮನ್ನು ಯೋಗ್ಯ ಎತ್ತರಕ್ಕೆ ಸಜ್ಜುಗೊಳಿಸಲು ಬಂದಿದ್ದವು.`,
        mr: `${devoteeName}, पहिल्या अध्यायात ज्या अस्वस्थतेपासून आपण सुरुवात केली, तिथून पुढे तुमचे ${lagnaRashiName} लग्न, ${moonRashiName} राशी व ${nakshatraName} ताकद पाहिल्यावर हेच स्पष्ट होते की: प्रत्येक कठीण प्रसंग तुम्हाला संपवण्यासाठी नाही, तर तुम्हाला मोठ्या उंचीसाठी घडवण्यासाठी आला होता.`,
        hi: `${devoteeName}, पहले अध्याय में हमने जिस अनकही चिंता से शुरुआत की थी, आज आपकी पूरी यात्रा, ${lagnaRashiName} लग्न, ${moonRashiName} राशि और ${nakshatraName} के आधार पर अंतिम सत्य यही है: बीती परीक्षाएं आपको तोड़ने नहीं, आपको बड़े शिखर के लिए तराशने आई थीं।`,
        te: `${devoteeName}, మొదటి అధ్యాయంలో మీ మనసులోని ఆందోళనతో ఈ ప్రయాణం మొదలుపెట్టాము. ఇప్పుడు మీ పూర్తి పంచాంగం, ${lagnaRashiName} లగ్నం, ${moonRashiName} రాశి చూసిన తర్వాత తేలే పరమ సత్యం: కష్టాలన్నీ మిమ్మల్ని ఆపడానికి కాదు, గొప్ప భవిష్యత్తు కోసం సిద్ధం చేయడానికే వచ్చాయి.`,
        ta: `${devoteeName}, முதல் அத்தியாயத்தில் மனக் கவலையோடு தொடங்கிய இந்தப் பயணம், உங்கள் ${lagnaRashiName} லக்னம் மற்றும் ${moonRashiName} ராசியின் அடிப்படையில் சொல்லும் இறுதி உண்மை: கடந்த சோதனைகள் உங்களைத் தடுக்க வரவில்லை—உங்களைப் பெரிய உயரத்திற்குத் தயார்படுத்தவே வந்தன.`,
        en: `${devoteeName}, remember the quiet worry where Chapter 1 began? Looking across your entire chart—${lagnaRashiName} ascendant, ${moonRashiName} Moon, ${nakshatraName} star, and the active turning points ahead—the final verdict is unmistakable: none of those delays came to defeat you; they cleared space for what truly fits you.`,
      },
      p2: {
        kn: `ನಿಮ್ಮ ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು: ನಿಮ್ಮ '${yogiPlanetName}' ಯೋಗಿ ಬಲ, ${peakHouseNum}ನೇ ಮನೆಯ ವಿಶೇಷ ಸಾಮರ್ಥ್ಯ, ಮತ್ತು '${n(nowYear + 2)}–${n(nowYear + 4)}'ರ ಸುವರ್ಣ ದಿಗಂತ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ಗೌರವದ ಸ್ಥಾನದಲ್ಲಿ ನಿಲ್ಲಿಸಲಿದೆ. ಸತ್ಯದ ಹಾದಿ, ಸ್ವಾಭಿಮಾನ ಮತ್ತು ಸಂಬಂಧಗಳ ಕಾಳಜಿ ನಿಮ್ಮ ಅಜೇಯ ಶಕ್ತಿಗಳಾಗಿವೆ.`,
        mr: `तुमच्या कथेचे मुख्य सार: योगी '${yogiPlanetName}' चे पाठबळ, तुमची जन्मजात बुद्धिमत्ता आणि ${n(nowYear + 2)}–${n(nowYear + 4)} मधील सुवर्ण काळ तुमच्या कुटुंबाला मोठी प्रतिष्ठा देईल. प्रामाणिकपणा आणि धैर्य हीच तुमची ताकद आहे.`,
        hi: `मुख्य सारांश: आपका '${yogiPlanetName}' बल, जन्मजात विवेक और ${n(nowYear + 2)}–${n(nowYear + 4)} का स्वर्णिम चरण आपके परिवार को सम्मान व स्थिरता दिलाएंगे। धैर्य और सत्यनिष्ठा आपकी अजेय शक्तियां हैं।`,
        te: `ముఖ్య సారాంశం: మీ '${yogiPlanetName}' బలం, సహజ ప్రతిభ మరియు ${n(nowYear + 2)}–${n(nowYear + 4)} మధ్య రానున్న సువర్ణ కాలం మీ కుటుంబాన్ని ఉన్నత స్థానంలో నిలబెడతాయి. నిజాయితీ, సహనమే మీ విజయ రహస్యం.`,
        ta: `முக்கிய சாரம்: உங்கள் '${yogiPlanetName}' பலம், இயல்பான திறமை மற்றும் ${n(nowYear + 2)}–${n(nowYear + 4)} பொற்காலம் உங்கள் குடும்பத்திற்குப் பெருமையையும் நிம்மதியையும் தரும். நேர்மையும் துணிச்சலும் உங்கள் வெற்றியின் அடிப்படை.`,
        en: `Key Highlights Locked In: your Peak Strength Sector (House ${peakHouseNum}), your ${yogiPlanetName} advantage on ${localizedYogiDay}, and the ascending arc peaking across ${nowYear + 2}–${nowYear + 4}. Walk with quiet confidence—never measure your path against anyone else's clock.`,
      },
      p3: {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ಆಶೀರ್ವಾದ: ಪರಮೇಶ್ವರನ ದಿವ್ಯ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಾನದಿಂದ ಹಾಗೂ ಮುಖ್ಯ ಅರ್ಚಕ ಚೈತನ್ಯ ಪಂಡಿತರಿಂದ ನಿಮಗೆ ಪೂರ್ಣಾಯುಷ್ಯ, ಆರೋಗ್ಯ, ಶಾಂತಿ ಮತ್ತು ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಲಭಿಸಲಿ ಎಂದು ಹೃತ್ಪೂರ್ವಕವಾಗಿ ಆಶೀರ್ವದಿಸುತ್ತೇವೆ. ॥ ಓಂ ನಮಃ ಶಿವಾಯ • ಶುಭಂ ಭವತು ॥`,
        mr: `श्री क्षेत्र गोकर्ण महाबळेश्वर महा आशीर्वाद: पवित्र आत्मलिंग सानिध्यावरून आणि मुख्य पुरोहित चैतन्य पंडित यांच्याकडून तुम्हाला दीर्घायुष्य, उत्तम आरोग्य व अखंड यशाचा शुभाशीर्वाद! ॥ ॐ नमः शिवाय • शुभं भवतु ॥`,
        hi: `श्री क्षेत्र गोकर्ण महाबलेश्वर महा आशीर्वाद: देवाधिदेव महादेव के पावन आत्मलिंग सन्निधि से आपके दीर्घायु, उत्तम स्वास्थ्य, सुख-शांति एवं प्रत्येक सत्कर्म में विजय का शुभाशीर्वाद प्रदान करते हैं। ॥ ॐ नमः शिवाय • शुभं भवतु ॥`,
        te: `శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర మహా ఆశీర్వాదం: ఆత్మలింగ సన్నిధి నుండి మీకు సంపూర్ణ ఆయురారోగ్యాలు, కుటుంబ సౌఖ్యం మరియు అఖండ విజయం సిద్ధించాలని ఆశీర్వదిస్తున్నాము. ॥ ఓం నమః శివాయ • శుభం భవతు ॥`,
        ta: `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் மகா ஆசீர்வாதம்: ஈசனின் ஆத்மலிங்க சன்னதியிலிருந்து உங்களுக்கு நீண்ட ஆயுள், நல்வாழ்வு, அமைதி மற்றும் சகல வெற்றியும் கிடைக்க மனதார ஆசீர்வதிக்கிறோம். ✦ ஓம் நம சிவாய • சுபம் பவத்து ✦`,
        en: `Sri Kshetra Gokarna Supreme Benediction: from the ancient sanctum of the primordial Atma Linga through Veda Moorthy Chaitanya Pandit, we bless you and your household with vibrant longevity, enduring peace, and triumphant clarity ahead. || Shubham Bhavatu ||`,
      },
      reflection: {
        kn: `ಈ ಪುಸ್ತಕವನ್ನು ನಿಮ್ಮ ಬಳಿಯೇ ಗೌರವದಿಂದ ರಕ್ಷಿಸಿಟ್ಟುಕೊಳ್ಳಿ — ನಿಮ್ಮ ಕುಟುಂಬದವರಿಗೂ ಅವರ ಪಂಚಾಂಗದ ವಿಶಿಷ್ಟ ಕಥನವನ್ನು ತಿಳಿಯಲು ಇದನ್ನು ಹಂಚಿಕೊಳ್ಳಿ!`,
        mr: `ही जीवनकथा जपून ठेवा व आपल्या कुटुंबातील इतरांनाही त्यांचे वैयक्तिक पंचांग पुस्तक पाहण्यासाठी सुचवा!`,
        hi: `इस व्यक्तिगत जीवन-ग्रंथ को अपने पास सहेजकर रखें तथा अपने परिवारजनों को भी उनकी जन्म-पंचांग कथा जानने के लिए प्रेरित करें!`,
        te: `ఈ పవిత్ర కథనాన్ని భద్రపరుచుకోండి మరియు మీ కుటుంబ సభ్యులకు కూడా వారి వ్యక్తిగత గ్రంథాన్ని చూసేలా సూచించండి!`,
        ta: `இந்தப் புனித வாழ்க்கை நூலைப் பாதுகாப்பாக வைத்திருங்கள்—உங்கள் குடும்பத்தினருக்கும் அவர்களின் தனித்துவக் கதையைப் பார்க்கப் பரிந்துரையுங்கள்!`,
        en: `Keep this personal manuscript safe for your milestones ahead—and invite your loved ones to unlock their own Panchanga story too!`,
      },
      badge: { kn: "ಗೋಕರ್ಣ ಆಶೀರ್ವಾದ", mr: "गोकर्ण आशीर्वाद", hi: "गोकर्ण आशीर्वाद", te: "గోకర్ణ ఆశీస్సు", ta: "கோகர்ண ஆசி", en: "Grand Finale" },
      anchors: [`${lagnaRashiName}`, `${yogiPlanetName}`],
    }
  );

  // Shuffled 5-Theme Story Lens (cinema, nakshatra, yoga_karana, near_far, parable) + 5-6 line enrichment
  const themeAssignment = buildShuffledChapterThemes(ctx);

  // Sort strictly 1..25 and clean all strings for 100% selected-language purity
  return list
    .sort((a, b) => a.n - b.n)
    .map((item) => {
      const themeKey = themeAssignment[item.n] || "cinema";
      const layer = buildChapterThemeAndNarrativeLayer({
        chNum: item.n,
        themeKey,
        ctx,
        savByHouse,
        peakHouseNum,
        doshaProfiles,
        isChildOrInfant,
        taraScore,
        taraWord,
      });

      const baseP1 = cleanRegional(pick6(item.p1, lang), lang);
      const baseP2 = cleanRegional(pick6(item.p2, lang), lang);
      const baseP3 = cleanRegional(pick6(item.p3, lang), lang);
      const minTargetLen = lang === "en" ? 380 : 270;
      const expandTo5Lines = (base: string, ext: string) =>
        ext && base.length < minTargetLen ? cleanRegional(`${base} ${ext}`, lang) : base;

      // Blend the first-person Hero Voice cleanly into Paragraph 1 (matching Premium PDF V1 card flow)
      const heroParagraph1 = layer.storyHook
        ? cleanRegional(`${layer.storyHook} ${baseP1}`, lang)
        : expandTo5Lines(baseP1, layer.extP1);

      return {
        chapterNumber: item.n,
        sectionNumber: item.sec,
        sectionTitle: cleanRegional(item.secTitle, lang),
        title: cleanRegional(pick6(item.title, lang), lang),
        icon: item.icon,
        question: cleanRegional(pick6(item.question, lang), lang),
        storyHook: layer.storyHook,
        paragraphs: [
          heroParagraph1,
          expandTo5Lines(baseP2, layer.extP2),
          expandTo5Lines(baseP3, layer.extP3),
        ],
        precisionAnchors: item.anchors,
        guidanceBadge: cleanRegional(pick6(item.badge, lang), lang),
        practicalGuidance: cleanRegional(pick6(item.reflection, lang), lang),
        visualType: item.visual,
        visualSummary: layer.visualSummary,
      };
    });
}
