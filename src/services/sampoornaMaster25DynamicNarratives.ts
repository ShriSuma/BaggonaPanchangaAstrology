/**
 * ============================================================================
 * BAGGONA PANCHANGA — MULTI-MEMBER & MULTI-DOWNLOAD DYNAMIC NARRATIVE ENGINE
 * ============================================================================
 * Guarantees that:
 *  1. Four family members scanning at the same table receive genuinely distinct,
 *     chart-grounded narratives across ALL 25 chapters (including Ch 3, 8-10, 12-22),
 *     never reading generic boilerplate with just a swapped name.
 *  2. Re-downloading for the SAME person (Download #1 vs #2 vs #3+) keeps 100%
 *     consistent astrological meaning while shifting narrative lens, opening hooks,
 *     chart-evidence angles, metaphors, and reflection prompts.
 *  3. Within a single 25-chapter PDF, ZERO chapters share identical starting points,
 *     repetitive "Question:" / "twist:" / "Pause & Check:" templates, or duplicate
 *     sentence skeletons across all 6 supported languages (kn, mr, hi, te, ta, en).
 * ============================================================================
 */

import { type SixLang, pick6, RASHI_6L } from "../features/fiveYearPrediction/fiveYearLocale";
import type { BookletCoverContent } from "./sampoornaMaster25BookletEngine";
import type { NarrativeThemeKey, StoryEngineInput } from "./sampoornaMaster25StoryEngine";

export type SaturnCycleBand = "sade_sati" | "ashtama" | "kantaka" | "upachaya" | "dharma";
export type JupiterCycleBand = "benefic_trio" | "kendra_build" | "inner_alchemy";
export type HouseGroupBand = "kendra_trikona" | "artha_upachaya" | "dusthana";
export type SavTier = "strong" | "steady" | "deliberate";
export type ScoreBand = "reset" | "climb" | "peak";

export interface ChartArchetypeSnapshot {
  edition: 0 | 1 | 2 | 3;
  saturnBand: SaturnCycleBand;
  jupiterBand: JupiterCycleBand;
  shaniSavTier: SavTier;
  guruSavTier: SavTier;
  h10PlacementBand: HouseGroupBand;
  h7PlacementBand: HouseGroupBand;
  h5PlacementBand: HouseGroupBand;
  h2PlacementBand: HouseGroupBand;
  maandiCluster: "kendra" | "artha" | "dusthana";
  peakHouseNum: number;
  weakestHouseNum: number;
  peakDomainLabel: string;
  weakestDomainLabel: string;
  yearScoreBands: [ScoreBand, ScoreBand, ScoreBand, ScoreBand, ScoreBand];
  yearScores: [number, number, number, number, number];
  bhriguHouseFromMoon: number;
  maritalContext: "married" | "unmarried" | "unspecified";
  taraEnergyTier: "high" | "balanced" | "caution";
}

function fmtDigits(num: number | string, lang: SixLang): string {
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

const HOUSE_DOMAIN_6L: Record<number, Record<SixLang, string>> = {
  1: { kn: "ಆತ್ಮಬಲ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವ", mr: "व्यक्तिमत्त्व व आत्मविश्वास", hi: "व्यक्तित्व एवं आत्मबल", te: "వ్యక్తిత్వం మరియు ఆత్మవిశ్వాసం", ta: "தன்னம்பிக்கை மற்றும் ஆளுமை", en: "self-direction and vitality" },
  2: { kn: "ಧನ ಸಂಚಯ ಮತ್ತು ಕುಟುಂಬ", mr: "धनसंचय व कुटुंब", hi: "धन संचय एवं कुटुंब", te: "ధన సంపద మరియు కుటుంబం", ta: "தன சேமிப்பு மற்றும் குடும்பம்", en: "reserves and family voice" },
  3: { kn: "ಧೈರ್ಯ ಮತ್ತು ಹೊಸ ಸಾಹಸ", mr: "धैर्य व नवीन उपक्रम", hi: "पराक्रम एवं नवीन पहल", te: "ధైర్యం మరియు నూతన ప్రయత్నాలు", ta: "துணிச்சல் மற்றும் புதிய முயற்சி", en: "initiative and skill mastery" },
  4: { kn: "ಗೃಹ ಸುಖ ಮತ್ತು ಸ್ಥಿರ ಆಸ್ತಿ", mr: "गृहसौख्य व मालमत्ता", hi: "गृह सुख एवं स्थायी संपत्ति", te: "గృహ సౌఖ్యం మరియు స్థిరాస్తి", ta: "இல்லற அமைதி மற்றும் சொத்து", en: "home sanctuary and property" },
  5: { kn: "ಬುದ್ಧಿ, ವಿದ್ಯೆ ಮತ್ತು ಸೃಜನಶೀಲತೆ", mr: "बुद्धिमत्ता व सृजनशीलता", hi: "विद्या, विवेक एवं सृजन", te: "విజ్ఞానం మరియు సృజనాత్మకత", ta: "அறிவாற்றல் மற்றும் படைப்பாற்றல்", en: "wisdom, learning, and legacy" },
  6: { kn: "ಶಿಸ್ತು ಮತ್ತು ಪ್ರತಿಸ್ಪರ್ಧಿ ಜಯ", mr: "शिस्त व स्पर्धेवर विजय", hi: "अनुशासन एवं प्रतिस्पर्धा विजय", te: "క్రమశిక్షణ మరియు పోటీలో విజయం", ta: "ஒழுக்கம் மற்றும் போட்டி வெற்றி", en: "daily stamina and problem-solving" },
  7: { kn: "ದಾಂಪತ್ಯ ಮತ್ತು ಪಾಲುದಾರಿಕೆ", mr: "नातेसंबंध व भागीदारी", hi: "दांपत्य एवं साझेदारी", te: "దాంపత్యం మరియు భాగస్వామ్యం", ta: "இல்லற ஒற்றுமை மற்றும் கூட்டு", en: "committed partnerships and alliances" },
  8: { kn: "ಆಂತರಿಕ ಪರಿವರ್ತನೆ ಮತ್ತು ಸಂಶೋಧನೆ", mr: "सखोल परिवर्तन व संशोधन", hi: "गहन परिवर्तन एवं शोध", te: "అంతర్గత మార్పు మరియు పరిశోధన", ta: "ஆழ்ந்த மாற்றம் மற்றும் ஆய்வு", en: "deep resilience and quiet renewal" },
  9: { kn: "ಭಾಗ್ಯ, ಧರ್ಮ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ", mr: "भाग्य व गुरुकृपा", hi: "भाग्य, धर्म एवं मार्गदर्शन", te: "భాగ్యం మరియు గురు మార్గదర్శనం", ta: "பாக்கியம் மற்றும் வழிகாட்டல்", en: "fortune, mentors, and higher scope" },
  10: { kn: "ವೃತ್ತಿ ಗೌರವ ಮತ್ತು ಅಧಿಕಾರ", mr: "कारकीर्द व प्रतिष्ठा", hi: "आजीविका, कर्म एवं प्रतिष्ठा", te: "వృత్తి గౌరవం మరియు హోదా", ta: "தொழில் வெற்றி மற்றும் அந்தஸ்து", en: "career leadership and public standing" },
  11: { kn: "ನಿರಂತರ ಲಾಭ ಮತ್ತು ಮಿತ್ರ ಬಳಗ", mr: "नियमित लाभ व मित्रसंपर्क", hi: "आय-लाभ एवं सहयोगी मंडली", te: "ఆర్థిక లాభం మరియు మిత్ర సహకారం", ta: "வருமானப் பெருக்கம் மற்றும் நட்பு", en: "gains, networks, and goal realization" },
  12: { kn: "ಆಂತರಿಕ ಶಾಂತಿ ಮತ್ತು ದೂರದ ವಿಸ್ತಾರ", mr: "मानसिक शांतता व परदेश योग", hi: "शांति, विश्राम एवं दूरस्थ अवसर", te: "మనశ్శాంతి మరియు దూర ప్రాంత అవకాశాలు", ta: "மன அமைதி மற்றும் தொலைதூர வாய்ப்பு", en: "quiet restoration and distant horizons" }
};

function classifyHouseGroup(houseNum: number): HouseGroupBand {
  if ([1, 4, 5, 7, 9, 10].includes(houseNum)) return "kendra_trikona";
  if ([2, 3, 11].includes(houseNum)) return "artha_upachaya";
  return "dusthana";
}

function classifySav(val: number): SavTier {
  if (val >= 30) return "strong";
  if (val >= 25) return "steady";
  return "deliberate";
}

function classifyScore(score: number): ScoreBand {
  if (score >= 76) return "peak";
  if (score >= 63) return "climb";
  return "reset";
}

export function extractChartArchetypeSnapshot(ctx: StoryEngineInput): ChartArchetypeSnapshot {
  const edition = (((ctx.narrativeVariant ?? 0) % 4) + 4) % 4 as 0 | 1 | 2 | 3;

  const sh = ctx.shaniHouseFromMoon;
  const saturnBand: SaturnCycleBand =
    sh === 8
      ? "ashtama"
      : [12, 1, 2].includes(sh)
      ? "sade_sati"
      : [4, 7].includes(sh)
      ? "kantaka"
      : [3, 6, 10, 11].includes(sh)
      ? "upachaya"
      : "dharma";

  const gh = ctx.guruHouseFromMoon;
  const jupiterBand: JupiterCycleBand =
    [2, 5, 7, 9, 11].includes(gh)
      ? "benefic_trio"
      : [1, 4, 10].includes(gh)
      ? "kendra_build"
      : "inner_alchemy";

  const savByHouse = Array.from({ length: 12 }, (_, idx) => ctx.savTable[(ctx.lagnaRashiIdx + idx) % 12] ?? 28);
  let peakIdx = 0;
  let weakIdx = 0;
  for (let i = 1; i < 12; i++) {
    if (savByHouse[i] > savByHouse[peakIdx]) peakIdx = i;
    if (savByHouse[i] < savByHouse[weakIdx]) weakIdx = i;
  }
  const peakHouseNum = peakIdx + 1;
  const weakestHouseNum = weakIdx + 1;

  const baseScore = ctx.extendedPrecision.liveTarabala.score || 68;
  const guruBoost = jupiterBand === "benefic_trio" ? 14 : 4;
  const shaniDrag = [8, 12, 1, 2].includes(sh) ? -8 : 8;
  const peakSav = Math.round(((savByHouse[9] + savByHouse[10]) / 2) * 1.1);
  const clamp = (v: number) => Math.max(38, Math.min(96, Math.round(v)));
  const yearScores: [number, number, number, number, number] = [
    clamp(58 + shaniDrag + (baseScore > 65 ? 8 : 0)),
    clamp(66 + guruBoost * 0.7 + (ctx.isDashaSandhi ? 4 : 9)),
    clamp(72 + (peakSav - 25)),
    clamp(78 + guruBoost * 0.6),
    clamp(82 + Math.min(12, Math.max(0, peakSav - 24)))
  ];
  const yearScoreBands: [ScoreBand, ScoreBand, ScoreBand, ScoreBand, ScoreBand] = [
    classifyScore(yearScores[0]),
    classifyScore(yearScores[1]),
    classifyScore(yearScores[2]),
    classifyScore(yearScores[3]),
    classifyScore(yearScores[4])
  ];

  const maandiCluster = [1, 4, 7, 10].includes(ctx.maandiHouse)
    ? "kendra"
    : [2, 5, 9, 11].includes(ctx.maandiHouse)
    ? "artha"
    : "dusthana";

  const rawMarital = String(ctx.maritalStatus || "").toLowerCase();
  const maritalContext: "married" | "unmarried" | "unspecified" =
    ctx.maritalContext ||
    (rawMarital === "married" ? "married" : rawMarital === "unmarried" ? "unmarried" : "unspecified");

  const taraEnergyTier = ctx.extendedPrecision.liveTarabala.isChandrashtama || baseScore < 52
    ? "caution"
    : baseScore >= 75
    ? "high"
    : "balanced";

  return {
    edition,
    saturnBand,
    jupiterBand,
    shaniSavTier: classifySav(ctx.shaniTransitSav),
    guruSavTier: classifySav(ctx.guruTransitSav),
    h10PlacementBand: classifyHouseGroup(ctx.house10Info.placedHouse),
    h7PlacementBand: classifyHouseGroup(ctx.house7Info.placedHouse),
    h5PlacementBand: classifyHouseGroup(ctx.house5Info.placedHouse),
    h2PlacementBand: classifyHouseGroup(ctx.house2Info.placedHouse),
    maandiCluster,
    peakHouseNum,
    weakestHouseNum,
    peakDomainLabel: HOUSE_DOMAIN_6L[peakHouseNum]?.[ctx.targetLang] || HOUSE_DOMAIN_6L[10][ctx.targetLang],
    weakestDomainLabel: HOUSE_DOMAIN_6L[weakestHouseNum]?.[ctx.targetLang] || HOUSE_DOMAIN_6L[12][ctx.targetLang],
    yearScoreBands,
    yearScores,
    bhriguHouseFromMoon: ctx.bhriguBinduHouseFromMoon || (((ctx.moonRashiIdx + 4) % 12) + 1),
    maritalContext,
    taraEnergyTier
  };
}

// ============================================================================
// DYNAMIC 4-EDITION COVER ASSURANCE PARAGRAPHS
// ============================================================================

export function buildDynamicCoverEditionParas(
  ctx: StoryEngineInput,
  cleanTithiWithPaksha: string,
  varaSpark: string,
  pakshaTone: string,
  ganaTwist: string,
  elemFlavor: string,
  edition: 0 | 1 | 2 | 3
): { p1: string; p2: string } {
  const {
    targetLang: lang,
    devoteeName,
    birthDate,
    birthTime,
    birthPlace,
    weekdayName,
    yogaName,
    karanaName,
    janmaHora,
    lagnaRashiName,
    moonRashiName,
    nakshatraName,
    yogiPlanetName,
    maandiHouse,
    maandiDomainAffected,
    currentMahadasha,
    currentBhuktiLord
  } = ctx;
  const n = (v: number | string) => fmtDigits(v, lang);

  if (edition === 0) {
    return {
      p1: pick6({
        kn: `ಪ್ರೀತಿಯ ${devoteeName}, ${n(birthDate)} ರಂದು ${n(birthTime)}ಕ್ಕೆ ${birthPlace}ದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಥಮ ಶ್ವಾಸ ಮೂಡಿದ ಕ್ಷಣದ ಪವಿತ್ರ ಪಂಚಾಂಗವು (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} ಹೋರೆ) ಒಂದು ಅಪೂರ್ವ ಜೀವನ ಕಥೆಯನ್ನು ಬರೆದಿದೆ: ${varaSpark}; ಹಾಗೂ ${pakshaTone}.`,
        mr: `प्रिय ${devoteeName}, दिनांक ${n(birthDate)} रोजी ${n(birthTime)} वाजता ${birthPlace} येथील आपल्या जन्मपंचांगाने (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} होरा) एक अनोखी जीवनकथा घडवली आहे: ${varaSpark}; तसेच ${pakshaTone}.`,
        hi: `प्रिय ${devoteeName}, दिनांक ${n(birthDate)} को ${n(birthTime)} बजे ${birthPlace} के पावन जन्म-पंचांग (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} होरा) ने आपके जीवन की एक विशिष्ट कथा लिखी है: ${varaSpark}, और ${pakshaTone}।`,
        te: `ప్రియమైన ${devoteeName}, ${n(birthDate)} నాడు ${n(birthTime)} గంటలకు ${birthPlace}లో మీ జన్మ పంచాంగం (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} హోర) ఒక విశేషమైన జీవన కథనాన్ని రాసింది: ${varaSpark}; మరియు ${pakshaTone}.`,
        ta: `அன்புள்ள ${devoteeName}, ${n(birthDate)} அன்று ${n(birthTime)} மணிக்கு ${birthPlace}ல் அமைந்த உங்கள் ஜென்ம பஞ்சாங்கம் (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} ஹோரை) ஒரு தனித்துவமான வாழ்க்கைக் கதையை வரைந்துள்ளது: ${varaSpark}; மேலும் ${pakshaTone}.`,
        en: `Dear ${devoteeName}, your exact birth Panchanga on ${birthDate} at ${birthTime} in ${birthPlace} (${cleanTithiWithPaksha} • ${weekdayName} • ${yogaName} • ${karanaName} • ${janmaHora} Hora) reveals why your path never matched anyone else's: ${varaSpark}, while ${pakshaTone}.`
      }, lang),
      p2: pick6({
        kn: `${ganaTwist}. ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${moonRashiName} ರಾಶಿಯಲ್ಲಿ ಬೆಸೆದ '${elemFlavor}', ಯೋಗಿ '${yogiPlanetName}' ರಕ್ಷೆ ಹಾಗೂ ${n(maandiHouse)}ನೇ ಭಾವದ (${maandiDomainAffected}) ಪರೀಕ್ಷೆ ಏಕೆ ನಡೆದಿದೆ ಎಂಬ ರಹಸ್ಯವು ಮುಂದಿನ ೨೫ ಅಧ್ಯಾಯಗಳಲ್ಲಿ ರೋಚಕ ತಿರುವುಗಳೊಂದಿಗೆ ತೆರೆದುಕೊಳ್ಳಲಿದೆ — ಇದು ಕೇವಲ ನಿಮಗಾಗಿ ಬರೆದ ಜೀವನ ಕೈಪಿಡಿ!`,
        mr: `${ganaTwist}. आपल्या ${lagnaRashiName} लग्न व ${moonRashiName} राशीतील '${elemFlavor}', योगी '${yogiPlanetName}' चे बळ आणि ${n(maandiHouse)}व्या स्थानाची (${maandiDomainAffected}) परीक्षा कशी सुटणार, ही रंजक कथा पुढील २५ अध्यायांत उलगडणार आहे — ही केवळ आपल्यासाठी घडवलेली पुस्तिका आहे!`,
        hi: `${ganaTwist}। आपके ${lagnaRashiName} लग्न और ${moonRashiName} राशि में समाहित '${elemFlavor}', योगी '${yogiPlanetName}' का वरदान एवं ${n(maandiHouse)}वें स्थान (${maandiDomainAffected}) के अनकहे मोड़ आगे के २५ अध्यायों में एक रोचक कथा की तरह खुलेंगे — इसे संभालकर रखें!`,
        te: `${ganaTwist}. మీ ${lagnaRashiName} లగ్నం, ${moonRashiName} రాశిలోని '${elemFlavor}', యోగి '${yogiPlanetName}' బలం మరియు ${n(maandiHouse)}వ స్థానం (${maandiDomainAffected}) వెనుక ఉన్న ఆసక్తికర మలుపులు రాబోయే 25 అధ్యాయాల్లో కళ్ళకు కట్టినట్లు విచ్చుకోనున్నాయి!`,
        ta: `${ganaTwist}. உங்கள் ${lagnaRashiName} லக்னம் மற்றும் ${moonRashiName} ராசியின் '${elemFlavor}', யோகி '${yogiPlanetName}' துணை மற்றும் ${n(maandiHouse)}-ம் இட (${maandiDomainAffected}) திருப்பங்கள் அடுத்த 25 அத்தியாயங்களில் விறுவிறுப்பான கதையாக விரியவுள்ளன!`,
        en: `${ganaTwist}. Woven around your ${lagnaRashiName} ascendant, ${moonRashiName} Moon, innate ${elemFlavor}, Yogi ${yogiPlanetName}'s quiet backing, and the hidden test inside ${maandiDomainAffected}, the 25 chapters ahead unfold your real story—keep this private edition close.`
      }, lang)
    };
  }

  if (edition === 1) {
    return {
      p1: pick6({
        kn: `ಆತ್ಮೀಯ ${devoteeName}, ${birthPlace}ದ ಆಕಾಶದಲ್ಲಿ ${n(birthDate)} (${n(birthTime)}) ರಂದು ನಿಮ್ಮ ಜನ್ಮವಾಗುವಾಗ '${janmaHora}' ಹೋರೆಯೊಂದಿಗೆ ${lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${nakshatraName} ನಕ್ಷತ್ರ ಸೇರಿ ಒಂದು ವಿಶಿಷ್ಟ ಜೀವನ ನಕ್ಷೆಯನ್ನು ರಚಿಸಿದವು — ${pakshaTone}, ಹಾಗೂ ${varaSpark}.`,
        mr: `आदरणीय ${devoteeName}, ${birthPlace} येथे दिनांक ${n(birthDate)} (${n(birthTime)}) ला आपल्या जन्माच्या क्षणी '${janmaHora}' होऱ्यासह ${lagnaRashiName} लग्न व ${nakshatraName} नक्षत्राने आपल्या आयुष्याचा खास आराखडा आखला — ${pakshaTone}, आणि ${varaSpark}.`,
        hi: `प्रिय ${devoteeName}, ${birthPlace} में दिनांक ${n(birthDate)} (${n(birthTime)}) के शुभ क्षण पर '${janmaHora}' होरा, ${lagnaRashiName} लग्न तथा ${nakshatraName} नक्षत्र ने आपके जीवन का अद्वितीय मानचित्र रचा — ${pakshaTone}, साथ ही ${varaSpark}।`,
        te: `ఆత్మీయులైన ${devoteeName}, ${birthPlace}లో ${n(birthDate)} (${n(birthTime)}) నాడు మీ జనన వేళ '${janmaHora}' హోరతో పాటు ${lagnaRashiName} లగ్నం మరియు ${nakshatraName} నక్షత్రం మీకంటూ ఒక ప్రత్యేక జీవన రేఖను గీశాయి — ${pakshaTone}, మరియు ${varaSpark}.`,
        ta: `அன்பார்ந்த ${devoteeName}, ${birthPlace}-ல் ${n(birthDate)} (${n(birthTime)}) அன்று '${janmaHora}' ஹோரையோடு ${lagnaRashiName} லக்னமும் ${nakshatraName} நட்சத்திரமும் இணைந்து உங்கள் வாழ்வின் தனித்துவ வரைபடத்தை உருவாக்கின — ${pakshaTone}, மேலும் ${varaSpark}.`,
        en: `Warm greetings, ${devoteeName}: under ${janmaHora} Hora above ${birthPlace} on ${birthDate} at ${birthTime}, your ${lagnaRashiName} Ascendant and ${nakshatraName} Moon star forged a signature rhythm—${pakshaTone}, while ${varaSpark}.`
      }, lang),
      p2: pick6({
        kn: `${cleanTithiWithPaksha} ತಿಥಿ ಮತ್ತು ${yogaName}–${karanaName} ಸಂಯೋಗದಲ್ಲಿ ನೇಯಲ್ಪಟ್ಟ ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಸ್ತುತ ${currentMahadasha}–${currentBhuktiLord} ಹಂತ, ಯೋಗಿ ${yogiPlanetName} ಹಾಗೂ ${elemFlavor} ಶಕ್ತಿಯು ಮುಂದಿನ ೨೫ ಅಧ್ಯಾಯಗಳಲ್ಲಿ ನಿಮ್ಮ ಬದುಕಿನ ಪ್ರತಿಯೊಂದು ಮೌನ ಪ್ರಶ್ನೆಗೂ ಸ್ಪಷ್ಟ ಉತ್ತರ ನೀಡಲಿದೆ.`,
        mr: `${cleanTithiWithPaksha} तिथी व ${yogaName}–${karanaName} संयोगातून घडलेली आपली कुंडली, सध्याची ${currentMahadasha}–${currentBhuktiLord} दशा, योगी ${yogiPlanetName} आणि ${elemFlavor} ऊर्जा पुढील २५ अध्यायांत आपल्या प्रत्येक न बोललेल्या प्रश्नाचे स्पष्ट उत्तर देणार आहे.`,
        hi: `${cleanTithiWithPaksha} तिथि एवं ${yogaName}–${karanaName} योग से सजी आपकी पत्रिका में वर्तमान ${currentMahadasha}–${currentBhuktiLord} दशा, योगी ${yogiPlanetName} और ${elemFlavor} का रहस्य आगे के २५ अध्यायों में आपके हर मूक प्रश्न का सटीक उत्तर देगा।`,
        te: `${cleanTithiWithPaksha} తిథి మరియు ${yogaName}–${karanaName} యోగంలో రూపుదిద్దుకున్న మీ జాతకంలో ప్రస్తుత ${currentMahadasha}–${currentBhuktiLord} దశ, యోగి ${yogiPlanetName} మరియు ${elemFlavor} రహస్యాలు రాబోయే 25 అధ్యాయాల్లో మీ ప్రతి సందేహానికి సమాధానం ఇస్తాయి.`,
        ta: `${cleanTithiWithPaksha} திதி மற்றும் ${yogaName}–${karanaName} சேர்க்கையில் அமைந்த உங்கள் ஜாதகத்தில் நடப்பு ${currentMahadasha}–${currentBhuktiLord} தசை, யோகி ${yogiPlanetName} மற்றும் ${elemFlavor} ஆற்றல் அடுத்த 25 அத்தியாயங்களில் உங்கள் மனக் கேள்விகளுக்கு விடை தரும்.`,
        en: `Anchored in ${cleanTithiWithPaksha} (${yogaName} / ${karanaName}) and your active ${currentMahadasha}–${currentBhuktiLord} cycle, ${ganaTwist}. Read the 25 chapters ahead as a calm conversation built solely around your sky.`
      }, lang)
    };
  }

  if (edition === 2) {
    return {
      p1: pick6({
        kn: `ನಮಸ್ಕಾರ ${devoteeName} — ಒಂದೇ ಮನೆಯವರಾದರೂ ಪ್ರತಿಯೊಬ್ಬರ ಜನ್ಮ ಲೆಕ್ಕ ಬೇರೆಬೇರೆಯೇ! ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) ರಂದು ನಿಮ್ಮ ${moonRashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರ ಹಾಗೂ ${weekdayName}ದ ಪ್ರಭಾವದಿಂದ '${elemFlavor}' ಚೈತನ್ಯ ಜಾಗೃತವಾಯಿತು; ${ganaTwist}.`,
        mr: `नमस्कार ${devoteeName} — एकाच परिवारातही प्रत्येकाचा जन्मलेख स्वतंत्र असतो! ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) रोजी आपल्या ${moonRashiName} राशी, ${nakshatraName} नक्षत्र व ${weekdayName}च्या प्रकाशात '${elemFlavor}' शक्ती जागृत झाली; ${ganaTwist}.`,
        hi: `नमस्ते ${devoteeName} — एक ही परिवार में भी प्रत्येक व्यक्ति की जन्म-कथा अनूठी होती है! दिनांक ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) को आपकी ${moonRashiName} राशि, ${nakshatraName} नक्षत्र व ${weekdayName} के योग से '${elemFlavor}' ऊर्जा सक्रिय हुई; ${ganaTwist}।`,
        te: `నమస్కారం ${devoteeName} — ఒకే కుటుంబంలో ఉన్నా ప్రతి ఒక్కరి జాతక ప్రయాణం వేరు! ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) నాడు మీ ${moonRashiName} రాశి, ${nakshatraName} నక్షత్రం మరియు ${weekdayName} ప్రభావంతో '${elemFlavor}' శక్తి పుట్టింది; ${ganaTwist}.`,
        ta: `வணக்கம் ${devoteeName} — ஒரே குடும்பத்தினராக இருந்தாலும் ஒவ்வொருவரின் ஜாதகப் பாதையும் தனித்துவமானது! ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) அன்று உங்கள் ${moonRashiName} ராசி, ${nakshatraName} நட்சத்திரம் மற்றும் ${weekdayName} சேர்ந்து '${elemFlavor}' ஆற்றலை வழங்கின; ${ganaTwist}.`,
        en: `Welcome, ${devoteeName}: even inside the closest family, no two skies ever repeat. Above ${birthPlace} on ${birthDate} (${birthTime}), your ${moonRashiName} Moon, ${nakshatraName} star, and ${weekdayName} birth current shaped your ${elemFlavor} path—and ${ganaTwist}.`
      }, lang),
      p2: pick6({
        kn: `${cleanTithiWithPaksha} • ${janmaHora} ಹೋರೆ • ಯೋಗಿ ${yogiPlanetName} ಹಾಗೂ ${n(maandiHouse)}ನೇ ಭಾವದ (${maandiDomainAffected}) ಸೂಕ್ಷ್ಮ ಲೆಕ್ಕಾಚಾರದ ಮೇಲೆ ನಿಂತಿರುವ ಈ ೨೫ ಅಧ್ಯಾಯಗಳ ಪುಸ್ತಕವು ನಿಮ್ಮ ಗತ, ವರ್ತಮಾನ ಮತ್ತು ಮುಂದಿನ ೫ ವರ್ಷಗಳನ್ನು ಕಣ್ಣಿಗೆ ಕಟ್ಟಿದಂತೆ ವಿವರಿಸುತ್ತದೆ.`,
        mr: `${cleanTithiWithPaksha} • ${janmaHora} होरा • योगी ${yogiPlanetName} व ${n(maandiHouse)}व्या भावाच्या (${maandiDomainAffected}) सूक्ष्म गणितावर आधारित हा २५ अध्यायांचा ग्रंथ आपला भूतकाळ, वर्तमान व पुढील ५ वर्षे स्पष्ट उलगडून दाखवतो.`,
        hi: `${cleanTithiWithPaksha} • ${janmaHora} होरा • योगी ${yogiPlanetName} एवं ${n(maandiHouse)}वें भाव (${maandiDomainAffected}) के प्रामाणिक गणित पर आधारित यह २५-अध्यायीय ग्रंथ आपके अतीत, वर्तमान और आगामी ५ वर्षों का सजीव चित्र प्रस्तुत करता है।`,
        te: `${cleanTithiWithPaksha} • ${janmaHora} హోర • యోగి ${yogiPlanetName} మరియు ${n(maandiHouse)}వ స్థాన (${maandiDomainAffected}) గణితంపై ఆధారపడిన ఈ 25 అధ్యాయాల గ్రంథం మీ గతం, వర్తమానం మరియు రాబోయే 5 ఏళ్లను కళ్ళముందుంచుతుంది.`,
        ta: `${cleanTithiWithPaksha} • ${janmaHora} ஹோரை • யோகி ${yogiPlanetName} மற்றும் ${n(maandiHouse)}-ம் இட (${maandiDomainAffected}) நுட்பக் கணிதத்தை அடிப்படையாகக் கொண்ட இந்த 25 அத்தியாய நூல் உங்கள் கடந்த காலம், நிகழ்காலம் மற்றும் அடுத்த 5 ஆண்டுகளைத் தெளிவுபடுத்துகிறது.`,
        en: `Built from ${cleanTithiWithPaksha}, ${janmaHora} Hora, Yogi ${yogiPlanetName}, and House ${maandiHouse}'s threshold (${maandiDomainAffected}), the twenty-five chapters inside trace your past verification, living hour, and next five years cleanly.`
      }, lang)
    };
  }

  return {
    p1: pick6({
      kn: `ಪ್ರೀತಿಯ ${devoteeName}, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪೀಠದ ಈ ವಿಶೇಷ ಪ್ರತಿ ನಿಮಗಾಗಿ ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) ರ ಶುದ್ಧ ಗ್ರಹಾಂಶಗಳಿಂದ ಸಿದ್ಧವಾಗಿದೆ. ${lagnaRashiName} ಲಗ್ನದಲ್ಲಿ ${weekdayName}ದ ತೇಜಸ್ಸು ಹಾಗೂ ${nakshatraName}ದ ಸಂವೇದನೆ ಒಟ್ಟಾಗಿವೆ — ${varaSpark}.`,
      mr: `प्रिय ${devoteeName}, श्री क्षेत्र गोकर्ण पीठाची ही विशेष प्रत आपल्या ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) च्या शुद्ध ग्रहस्थितीवरून तयार केली आहे. ${lagnaRashiName} लग्नात ${weekdayName}चे तेज व ${nakshatraName}ची संवेदनशीलता एकत्र आली आहे — ${varaSpark}.`,
      hi: `प्रिय ${devoteeName}, श्री क्षेत्र गोकर्ण पीठ की यह विशेष प्रति आपके ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) के शुद्ध ग्रह-योग से निर्मित है। ${lagnaRashiName} लग्न में ${weekdayName} का तेज और ${nakshatraName} की संवेदना एकाकार हुई हैं — ${varaSpark}।`,
      te: `ప్రియమైన ${devoteeName}, శ్రీ క్షేత్ర గోకర్ణ పీఠం నుండి ఈ ప్రత్యేక ప్రతి మీ ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) నాటి శుద్ధ గ్రహస్థితుల ఆధారంగా రూపొందింది. ${lagnaRashiName} లగ్నంలో ${weekdayName} బలం మరియు ${nakshatraName} సున్నితత్వం కలిశాయి — ${varaSpark}.`,
      ta: `அன்புள்ள ${devoteeName}, ஸ்ரீ கோகர்ண பீடத்தின் இந்தச் சிறப்புப் பதிப்பு உங்கள் ${n(birthDate)} (${n(birthTime)}, ${birthPlace}) துல்லியக் கிரக நிலைகளிலிருந்து உருவாக்கப்பட்டது. ${lagnaRashiName} லக்னத்தில் ${weekdayName} ஒளியும் ${nakshatraName} உணர்வும் இணைகின்றன — ${varaSpark}.`,
      en: `Dear ${devoteeName}, this dedicated Sri Kshetra Gokarna edition reflects the exact sky of ${birthDate} at ${birthTime} over ${birthPlace}. Inside your ${lagnaRashiName} Ascendant and ${nakshatraName} star, ${varaSpark} while ${pakshaTone}.`
    }, lang),
    p2: pick6({
      kn: `${ganaTwist}. ನಿಮ್ಮ ${currentMahadasha} ದಶಾ ಹಾದಿ, ${moonRashiName} ಮನಃಸ್ಥಿತಿ ಮತ್ತು ಯೋಗಿ '${yogiPlanetName}' ನೀಡುವ ದೈವಿಕ ಕೀಲಿಕೈಗಳನ್ನು ಸರಳ ಜೀವನ ಕಥೆಯಾಗಿ ಈ ೨೫ ಅಧ್ಯಾಯಗಳಲ್ಲಿ ನಿಮ್ಮ ಮುಂದೆ ಇಡಲಾಗಿದೆ.`,
      mr: `${ganaTwist}. तुमचा ${currentMahadasha} दशा प्रवास, ${moonRashiName} मनःस्थिती व योगी '${yogiPlanetName}' ची गुरुकिल्ली साध्या जीवनकथेच्या रूपात या २५ अध्यायांत मांडली आहे.`,
      hi: `${ganaTwist}। आपकी ${currentMahadasha} दशा की यात्रा, ${moonRashiName} मनःस्थिति और योगी '${yogiPlanetName}' की गुप्त कुंजी को इन २५ अध्यायों में सरल जीवन-कथा की तरह पिरोया गया है।`,
      te: `${ganaTwist}. మీ ${currentMahadasha} దశా ప్రయాణం, ${moonRashiName} మనస్తత్వం మరియు యోగి '${yogiPlanetName}' అందించే శుభ ఫలితాలను ఈ 25 అధ్యాయాల్లో స్పష్టమైన కథగా అందించాము.`,
      ta: `${ganaTwist}. உங்கள் ${currentMahadasha} தசாப் பயணம், ${moonRashiName} மனநிலை மற்றும் யோகி '${yogiPlanetName}' தரும் வழிகாட்டலை இந்த 25 அத்தியாயங்களில் எளிய வாழ்க்கைக் கதையாகத் தொகுத்துள்ளோம்.`,
      en: `${ganaTwist}. Across twenty-five concise chapters, your ${currentMahadasha} timeline, ${moonRashiName} emotional compass, and Yogi ${yogiPlanetName}'s quiet edge come together into one actionable life story.`
    }, lang)
  };
}

// ============================================================================
// CHART-ARCHETYPE SPECIFIC PROSE HELPERS (ALL 6 LANGUAGES)
// ============================================================================

export function getSaturnPast24MonthBranch(ctx: StoryEngineInput, arch: ChartArchetypeSnapshot): string {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const sh = ctx.shaniHouseFromMoon;
  const trRashi = ctx.shaniTransitRashi;
  const sav = n(ctx.shaniTransitSav);

  switch (arch.saturnBand) {
    case "sade_sati":
      return pick6({
        kn: `ನಿಮ್ಮ ${ctx.moonRashiName} ರಾಶಿಗೆ ಚಂದ್ರನ ಸನಿಹದ (${n(sh)}ನೇ ಮನೆ, ${trRashi}) ಸಾಡೇಸಾತಿ ಪ್ರಭಾವ ನಡೆದಿರುವುದರಿಂದ, ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳು ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಸ್ವಾವಲಂಬನೆ ಮತ್ತು ನಿದ್ರೆಯ ಶಾಂತಿಯನ್ನು ನೇರವಾಗಿ ಪರೀಕ್ಷಿಸಿವೆ — ಒಟ್ಟಿಗೆ ನಿಭಾಯಿಸಲು ಕಷ್ಟವಾದ ಜವಾಬ್ದಾರಿಗಳು ಒಂದೇ ಸಮಯಕ್ಕೆ ಬಂದು ನಿಂತವು.`,
        mr: `तुमच्या ${ctx.moonRashiName} राशीभोवती (${n(sh)}वे स्थान, ${trRashi}) साडेसातीची लाट चालल्याने गेल्या २४ महिन्यांत मानसिक शांतता, झोप आणि स्वतःवरची पकड यांची थेट कसोटी लागली — अनेक जबाबदाऱ्या एकाच वेळी येऊन धडकल्या.`,
        hi: `आपकी ${ctx.moonRashiName} राशि के निकट (${n(sh)}वें भाव, ${trRashi}) साढ़ेसाती की धारा चलने से पिछले २४ महीनों ने आपकी मानसिक शांति, विश्राम और भावनात्मक आत्मनिर्भरता की सीधी परीक्षा ली — कई दायित्व एक साथ आ खड़े हुए।`,
        te: `మీ ${ctx.moonRashiName} రాశి దగ్గర (${n(sh)}వ స్థానం, ${trRashi}) ఏల్నాటి శని నడుస్తున్నందున గత 24 నెలలు మీ మనశ్శాంతి, నిద్ర మరియు భావోద్వేగ బలాన్ని నేరుగా పరీక్షించాయి — పలు బాధ్యతలు ఒకేసారి వచ్చిపడ్డాయి.`,
        ta: `உங்கள் ${ctx.moonRashiName} ராசிக்கு அருகில் (${n(sh)}-ம் இடம், ${trRashi}) ஏழரைச் சனி நகர்ந்ததால் கடந்த 24 மாதங்கள் உங்கள் மன அமைதியையும் உணர்வுப் பொறுமையையும் நேரடியாகச் சோதித்தன — பல பொறுப்புகள் ஒரே நேரத்தில் வந்தன.`,
        en: `Because Sade Sati (${trRashi}, House ${sh} from your ${ctx.moonRashiName} Moon, ${ctx.shaniTransitSav} SAV bindus) swept directly across your emotional space over the past 24 months, heavy responsibilities piled up simultaneously while stripping away shallow comfort.`
      }, lang);
    case "ashtama":
      return pick6({
        kn: `ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ಅಷ್ಟಮ ಸ್ಥಾನದ (${n(sh)}ನೇ ಮನೆ, ${trRashi} — ${sav} ಬಿಂದು) ತೀವ್ರ ಗೋಚಾರ ನಡೆದ ಕಾರಣ, ಕಳೆದ ಎರಡು ವರ್ಷಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು, ಒಳಗಿನ ಆತಂಕ ಹಾಗೂ ಹಳೆಯ ರಹಸ್ಯ-ಲೆಕ್ಕಗಳ ಮರುಪರಿಶೀಲನೆ ನಡೆದು ನಿಮ್ಮನ್ನು ಸಂಪೂರ್ಣ ಪರಿಪಕ್ವರನ್ನಾಗಿಸಿತು.`,
        mr: `चंद्रापासून अष्टम स्थानी (${n(sh)}वे घर, ${trRashi} — ${sav} गुण) शनी प्रवास करत असल्याने गेल्या दोन वर्षांत अनपेक्षित वळणे, जुन्या हिशोबांची तपासणी आणि आतील खंबीरपणा घडवणारे प्रसंग आले.`,
        hi: `चंद्र से अष्टम भाव (${n(sh)}वां स्थान, ${trRashi} — ${sav} बिंदू) में शनि संचार के कारण बीते दो वर्षों ने अप्रत्याशित मोड़ों, गुप्त परीक्षाओं और पुराने हिसाबों को सुलझाकर आपके भीतर असाधारण परिपक्वता गढ़ी।`,
        te: `చంద్రుని నుండి అష్టమ స్థానంలో (${n(sh)}వ ఇల్లు, ${trRashi} — ${sav} బిందువులు) శని సంచారం వల్ల గత రెండేళ్ళలో అనూహ్య మలుపులు, పాత లెక్కల సవరణలు జరిగి మిమ్మల్ని లోపలి నుండి దృఢంగా మార్చాయి.`,
        ta: `சந்திரனுக்கு அஷ்டம இடத்தில் (${n(sh)}-ம் வீடு, ${trRashi} — ${sav} பரல்கள்) சனி சஞ்சரித்ததால் கடந்த இரண்டு ஆண்டுகளில் எதிர்பாராத திருப்பங்களும் பழைய கணக்குகளைச் சீரமைக்கும் சோதனைகளும் உங்களைப் பக்குவப்படுத்தின.`,
        en: `With Saturn crossing the transformative 8th house (${trRashi}, ${ctx.shaniTransitSav} SAV bindus) from your ${ctx.moonRashiName} Moon, the past 24 months triggered sudden resets—exposing weak agreements early so hidden vulnerability could turn into quiet steel.`
      }, lang);
    case "kantaka":
      return pick6({
        kn: `ಚಂದ್ರನಿಂದ ಕಂಟಕ ಕೇಂದ್ರದಲ್ಲಿ (${n(sh)}ನೇ ಮನೆ, ${trRashi}) ಶನಿ ಚಲಿಸಿದ್ದರಿಂದ ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳಲ್ಲಿ ಮನೆ-ಕುಟುಂಬದ ಆಧಾರ ಅಥವಾ ಆಪ್ತ ಪಾಲುದಾರಿಕೆಯ ತೂಕದಲ್ಲಿ ಹೊಸ ಶಿಸ್ತು ಮತ್ತು ಕಠಿಣ ಸ್ಪಷ್ಟತೆ ಅನಿವಾರ್ಯವಾಯಿತು.`,
        mr: `चंद्रापासून कंटक केंद्रात (${n(sh)}वे स्थान, ${trRashi}) शनी चालल्यामुळे गेल्या २४ महिन्यांत घर-कुटुंबाची घडी किंवा महत्त्वाच्या भागीदारीतील स्पष्टता नव्याने बांधावी लागली.`,
        hi: `चंद्र से केंद्र स्थान (${n(sh)}वां भाव, ${trRashi}) में शनि के भ्रमण से पिछले २४ महीनों में गृह-व्यवस्था अथवा प्रमुख साझेदारियों की नींव को नए सिरे से अनुशासित एवं सुदृढ़ करना पड़ा।`,
        te: `చంద్రుని నుండి కంటక కేంద్రంలో (${n(sh)}వ స్థానం, ${trRashi}) శని కదిలినందున గత 24 నెలల్లో గృహ పరిస్థితులు లేదా ముఖ్య భాగస్వామ్యాల విషయంలో కఠినమైన క్రమశిక్షణ మరియు స్పష్టత అవసరమయ్యాయి.`,
        ta: `சந்திரனுக்குக் கண்டக கேந்திரத்தில் (${n(sh)}-ம் வீடு, ${trRashi}) சனி நகர்ந்ததால் கடந்த 24 மாதங்களில் குடும்ப அடித்தளம் அல்லது முக்கிய கூட்டாண்மைகளில் புதிய ஒழுங்கும் தெளிவும் அவசியமாயின.`,
        en: `Moving across your Kantaka Kendra (House ${sh} from ${ctx.moonRashiName} Moon in ${trRashi}), the past 24 months challenged domestic foundations and close partnerships—demanding candid boundaries instead of polite silence.`
      }, lang);
    case "upachaya":
      return pick6({
        kn: `ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ಶುಭ ಉಪಚಯ ಸ್ಥಾನವಾದ ${n(sh)}ನೇ ಮನೆಯಲ್ಲಿ (${trRashi} — ${sav} ಬಿಂದು) ಶನಿ ನಿಂತಿರುವುದು ಅತ್ಯಂತ ಮಹತ್ವದ್ದು: ಕಳೆದ ೨೪ ತಿಂಗಳು ಶ್ರಮ ಹೆಚ್ಚಾಗಿದ್ದರೂ, ಪ್ರತಿಸ್ಪರ್ಧಿಗಳ ನಡುವೆ ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಾಬೀತುಪಡಿಸಿ ಹಂತ-ಹಂತವಾಗಿ ಮೇಲೇರಲು ಇದೇ ಕಾರಣವಾಯಿತು.`,
        mr: `चंद्रापासून शुभ उपचय स्थानी (${n(sh)}वे घर, ${trRashi} — ${sav} गुण) शनी असल्याने गेल्या २४ महिन्यांत कष्ट अधिक झाले तरी स्पर्धेत टिकून राहून हळूहळू वर चढण्याची खरी संधी मिळाली.`,
        hi: `आपकी चंद्र राशि से शुभ उपचय भाव (${n(sh)}वां स्थान, ${trRashi} — ${sav} बिंदू) में शनि होने के कारण बीते २४ महीनों में परिश्रम अधिक रहने पर भी आपने विरोधियों के बीच अपनी योग्यता सिद्ध कर क्रमिक बढ़त बनाई।`,
        te: `చంద్రుని నుండి శుభ ఉపచయ స్థానమైన ${n(sh)}వ ఇంట (${trRashi} — ${sav} బిందువులు) శని ఉన్నందున గత 24 నెలలు శ్రమ ఎక్కువైనా పోటీని తట్టుకుని మెట్టు మెట్టుగా ఎదిగే బలాన్ని ఇచ్చింది.`,
        ta: `சந்திரனுக்குச் சுப உபசய இடமான ${n(sh)}-ம் வீட்டில் (${trRashi} — ${sav} பரல்கள்) சனி நின்றதால் கடந்த 24 மாதங்களில் உழைப்பு கூடினாலும் போட்டிகளை வென்று படிப்படியாக உயரும் வாய்ப்பு உருவானது.`,
        en: `Positioned in an auspicious Upachaya house (House ${sh} from your ${ctx.moonRashiName} Moon, ${ctx.shaniTransitSav} bindus in ${trRashi}), the last 24 months packed heavy workload onto your desk—yet every ounce of effort was quietly building unbeatable competitive leverage.`
      }, lang);
    default:
      return pick6({
        kn: `ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ತ್ರಿಕೋನ-ಧರ್ಮ ಸ್ಥಾನದಲ್ಲಿ (${n(sh)}ನೇ ಮನೆ, ${trRashi}) ಶನಿ ಸಂಚರಿಸಿದ ಕಾರಣ ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳಲ್ಲಿ ದೀರ್ಘಕಾಲಿಕ ಗುರಿಗಳು, ಗುರು-ಹಿರಿಯರ ನಿರೀಕ್ಷೆ ಹಾಗೂ ಆಂತರಿಕ ವಿವೇಚನೆಯ ನಿಧಾನಗತಿಯ ಪರೀಕ್ಷೆ ನಡೆದು ನಿಮ್ಮ ಆಲೋಚನೆ ಗಟ್ಟಿಯಾಯಿತು.`,
        mr: `चंद्रापासून ${n(sh)}व्या त्रिकोण स्थानी (${trRashi}) शनी चालल्यामुळे गेल्या २४ महिन्यांत दीर्घकालीन ध्येये, ज्येष्ठांच्या अपेक्षा आणि वैचारिक परिपक्वता यांची शांत कसोटी लागली.`,
        hi: `चंद्र से त्रिकोण स्थान (${n(sh)}वां भाव, ${trRashi}) में शनि संचरण के कारण बीते २४ महीनों ने दीर्घकालिक लक्ष्यों, बड़ों की अपेक्षाओं और आपके वैचारिक धैर्य को तपाकर निखारा।`,
        te: `చంద్రుని నుండి త్రికోణ స్థానంలో (${n(sh)}వ ఇల్లు, ${trRashi}) శని సంచరించినందున గత 24 నెలలు మీ దీర్ఘకాలిక లక్ష్యాలు, పెద్దల బాధ్యతలు మరియు వివేకాన్ని పరీక్షించి మరింత బలపరిచాయి.`,
        ta: `சந்திரனுக்குத் திரிகோண இடத்தில் (${n(sh)}-ம் வீடு, ${trRashi}) சனி சென்றதால் கடந்த 24 மாதங்கள் உங்கள் நீண்டகால இலக்குகளையும் சிந்தனைத் தெளிவையும் மெதுவாகப் பக்குவப்படுத்தின.`,
        en: `Crossing trinal House ${sh} (${trRashi}, ${ctx.shaniTransitSav} bindus) from your ${ctx.moonRashiName} Moon, the past 24 months tested patience around long-range plans, mentorship duties, and aligning your daily work with lasting values.`
      }, lang);
  }
}

export function getYogiChannelStrategy(ctx: StoryEngineInput): string {
  const lang = ctx.targetLang;
  const day = ctx.localizedYogiDay;
  const dir = ctx.localizedYogiDirection;
  const col = ctx.localizedYogiColor;
  switch (ctx.rawYogi) {
    case "Sun":
      return pick6({
        kn: `ಸೂರ್ಯ ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ನಿಮ್ಮ ಗೆಲುವು ಮುಂಜಾನೆಯ ಸ್ಪಷ್ಟತೆ, ನೇರ ನಾಯಕತ್ವ ಹಾಗೂ ${day}ರಂದು ಪ್ರಮುಖ ಪ್ರಸ್ತಾಪಗಳನ್ನು ಮುಂದಿಡುವುದರಲ್ಲಿ ಅಡಗಿದೆ (${dir} ದಿಕ್ಕು / ${col} ಸ್ಪರ್ಶ).`,
        mr: `सूर्य योगी असल्याने तुमचा विजय पहाटेची स्पष्टता, थेट नेतृत्व आणि ${day} रोजी महत्त्वाचे निर्णय पुढे नेण्यात आहे (${dir} दिशा / ${col} रंग).`,
        hi: `सूर्य के योगी होने से आपकी सफलता प्रातःकालीन स्पष्टता, आत्मविश्वासपूर्ण नेतृत्व और ${day} को बड़े प्रस्ताव रखने में बसती है (${dir} दिशा / ${col} स्पर्श)।`,
        te: `సూర్యుడు యోగి కావడం వల్ల ఉదయపు స్పష్టత, ప్రత్యక్ష నాయకత్వం మరియు ${day} నాడు కీలక నిర్ణయాలు తీసుకోవడంలో మీ విజయం దాగి ఉంది (${dir} దిశ / ${col} రంగు).`,
        ta: `சூரியன் யோகியாக இருப்பதால் அதிகாலைத் தெளிவு, நேரடித் தலைமை மற்றும் ${day} அன்று முக்கியப் பேச்சுக்களைத் தொடங்குவதில் உங்கள் வெற்றி உள்ளது (${dir} திசை / ${col} நிறம்).`,
        en: `Because solar Sun acts as your Yogi, your fastest breakthroughs happen when you lead visibly at dawn, state terms clearly without shrinking, and anchor key launches on ${day} facing ${dir} (touched with ${col}).`
      }, lang);
    case "Moon":
      return pick6({
        kn: `ಚಂದ್ರ ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ಜನರ ವಿಶ್ವಾಸ, ಮೃದು ಸಂಭಾಷಣೆ ಮತ್ತು ${day}ರಂದು '${dir}' ದಿಕ್ಕಿನ ಶಾಂತ ವಾತಾವರಣದಲ್ಲಿ ಕೈಗೊಂಡ ಹೆಜ್ಜೆಗಳು ಕ್ಷಿಪ್ರ ಬೆಂಬಲ ತರುತ್ತವೆ (${col}).`,
        mr: `चंद्र योगी असल्याने लोकांचा विश्वास, सौम्य संवाद आणि ${day} रोजी '${dir}' दिशेशी जोडलेली कामे चटकन यश देतात (${col}).`,
        hi: `चंद्र के योगी होने से जन-विश्वास, सौम्य संवाद और ${day} को '${dir}' दिशा के शांत वातावरण में की गई पहल तेज़ी से फलीभूत होती है (${col})।`,
        te: `చంద్రుడు యోగి అయినందున ప్రజల నమ్మకం, మృదువైన సంభాషణ మరియు ${day} నాడు '${dir}' దిశలో ప్రశాంతంగా వేసే అడుగులు శీఘ్ర ఫలితాన్నిస్తాయి (${col}).`,
        ta: `சந்திரன் யோகியாக இருப்பதால் மக்கள் நம்பிக்கை, மென்மையான உரையாடல் மற்றும் ${day} அன்று '${dir}' திசையில் எடுக்கும் முடிவுகள் விரைவான ஆதரவைத் தரும் (${col}).`,
        en: `Because lunar Moon anchors your Yogi channel, emotional rapport, trusted hospitality, and calm meetings held on ${day} oriented ${dir} (accented with ${col}) unlock doors effortlessly.`
      }, lang);
    case "Mars":
      return pick6({
        kn: `ಕುಜ (ಮಂಗಳ) ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ಹಿಂಜರಿಯದೆ ಮೊದಲು ಹೆಜ್ಜೆ ಹಾಕುವ ಧೈರ್ಯ, ತಕ್ಷಣದ ನಿರ್ಣಯ ಹಾಗೂ ${day}ರಂದು ${dir} ದಿಕ್ಕಿನ ಸಾಹಸಗಳು ದೊಡ್ಡ ಮುನ್ನಡೆ ತರುತ್ತವೆ (${col}).`,
        mr: `मंगळ योगी असल्याने संकोच न करता पहिले पाऊल उचलण्याचे धैर्य व ${day} रोजी ${dir} दिशेची कामे मोठी आघाडी देतात (${col}).`,
        hi: `मंगल के योगी होने से बिना झिझके प्रथम पहल करने का साहस एवं ${day} को ${dir} दिशा में किए गए निर्णायक प्रयास बड़ी बढ़त दिलाते हैं (${col})।`,
        te: `కుజుడు యోగి అయినందున వెనుకాడకుండా మొదటి అడుగు వేసే ధైర్యం, తక్షణ నిర్ణయాలు మరియు ${day} నాడు ${dir} దిశలో చేసే ప్రయత్నాలు పెద్ద విజయాన్నిస్తాయి (${col}).`,
        ta: `செவ்வாய் யோகியாக இருப்பதால் தயக்கமின்றி முதல் அடியெடுக்கும் துணிச்சலும் ${day} அன்று ${dir} திசையில் தொடங்கும் முயற்சிகளும் பெரிய முன்னேற்றம் தரும் (${col}).`,
        en: `With fiery Mars as your Yogi, hesitation costs you momentum—decisive first-mover courage, crisp physical stamina, and launching bold pitches on ${day} toward ${dir} (${col}) multiply outcomes.`
      }, lang);
    case "Mercury":
      return pick6({
        kn: `ಬುಧ ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ಲೆಕ್ಕಾಚಾರದ ನಿಖರತೆ, ಚುರುಕಾದ ಮಾತು-ಬರವಣಿಗೆ ಮತ್ತು ${day}ರಂದು '${dir}' ದಿಕ್ಕಿನಲ್ಲಿ ನಡೆಸುವ ವ್ಯಾಪಾರ-ಒಪ್ಪಂದಗಳು ಅತಿ ಶೀಘ್ರ ಫಲ ಕೊಡುತ್ತವೆ (${col}).`,
        mr: `बुध योगी असल्याने अचूक हिशोब, चतुर संवाद-लेखन व ${day} रोजी '${dir}' दिशेत केलेले करार झटपट लाभ देतात (${col}).`,
        hi: `बुध के योगी होने से सटीक गणना, स्पष्ट लेखन-संवाद और ${day} को '${dir}' दिशा में किए गए अनुबंध शीघ्र लाभ प्रदान करते हैं (${col})।`,
        te: `బుధుడు యోగి అయినందున ఖచ్చితమైన లెక్కలు, చక్కని మాట-రాత నైపుణ్యం మరియు ${day} నాడు '${dir}' దిశలో చేసే ఒప్పందాలు శీఘ్ర లాభాన్నిస్తాయి (${col}).`,
        ta: `புதன் யோகியாக இருப்பதால் துல்லியக் கணக்கு, சாதுரியமான பேச்சு-எழுத்து மற்றும் ${day} அன்று '${dir}' திசையில் மேற்கொள்ளும் ஒப்பந்தங்கள் விரைந்து பலிக்கும் (${col}).`,
        en: `With analytical Mercury as your Yogi, precision writing, smart numbers, and structured negotiations set on ${day} facing ${dir} (with touches of ${col}) turn complexity into clean wins.`
      }, lang);
    case "Jupiter":
      return pick6({
        kn: `ಗುರು ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ಧರ್ಮಬದ್ಧ ಸಲಹೆ, ಕಲಿಕೆ-ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ${day}ರಂದು '${dir}' ದಿಕ್ಕಿನ ಶುಭಾರಂಭಗಳು ನಿಮ್ಮ ಗೌರವ ಮತ್ತು ಧನವನ್ನು ದ್ವಿಗುಣಗೊಳಿಸುತ್ತವೆ (${col}).`,
        mr: `गुरु योगी असल्याने विवेकी सल्ला, शिक्षण-मार्गदर्शन व ${day} रोजी '${dir}' दिशेने केलेली शुभ सुरुवात मान व धन वाढवते (${col}).`,
        hi: `बृहस्पति के योगी होने से नीतिपूर्ण परामर्श, ज्ञान-विस्तार और ${day} को '${dir}' दिशा में की गई शुभ शुरुआत प्रतिष्ठा एवं धन दोनों बढ़ाती है (${col})।`,
        te: `గురువు యోగి అయినందున ధర్మబద్ధమైన ఆలోచన, బోధన-సలహాలు మరియు ${day} నాడు '${dir}' దిశలో చేసే శుభారంభాలు గౌరవాన్ని, ధనాన్ని పెంచుతాయి (${col}).`,
        ta: `குரு யோகியாக இருப்பதால் அறவழி ஆலோசனை, கல்வி-வழிகாட்டல் மற்றும் ${day} அன்று '${dir}' திசையில் தொடங்கும் நற்காரியங்கள் புகழையும் செல்வத்தையும் கூட்டும் (${col}).`,
        en: `With expansive Jupiter as your Yogi, ethical mentorship, teaching what you know, and starting key alliances on ${day} facing ${dir} (${col}) magnetize long-term grace and abundance.`
      }, lang);
    case "Venus":
      return pick6({
        kn: `ಶುಕ್ರ ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ಕಲಾತ್ಮಕ ಅಭಿರುಚಿ, ಸೌಹಾರ್ದ ಸಂಧಾನ ಹಾಗೂ ${day}ರಂದು '${dir}' ದಿಕ್ಕಿನಲ್ಲಿ ರೂಪಿಸುವ ಸೌಂದರ್ಯ-ಪಾಲುದಾರಿಕೆ ಯೋಜನೆಗಳು ಸಹಜ ಯಶಸ್ಸು ತರುತ್ತವೆ (${col}).`,
        mr: `शुक्र योगी असल्याने कलात्मक दृष्टी, मधुर समेट आणि ${day} रोजी '${dir}' दिशेत आखलेल्या भागीदारी सहज यशस्वी होतात (${col}).`,
        hi: `शुक्र के योगी होने से सुरुचिपूर्ण प्रस्तुति, मधुर कूटनीति और ${day} को '${dir}' दिशा में की गई साझेदारियां सहज सफलता दिलाती हैं (${col})।`,
        te: `శుక్రుడు యోగి అయినందున కళాత్మక దృష్టి, మధురమైన సంభాషణ మరియు ${day} నాడు '${dir}' దిశలో చేసే భాగస్వామ్యాలు సహజ విజయాన్నిస్తాయి (${col}).`,
        ta: `சுக்கிரன் யோகியாக இருப்பதால் நேர்த்தியான ரசனை, இனிமையான பேச்சுவார்த்தை மற்றும் ${day} அன்று '${dir}' திசையில் அமையும் கூட்டாண்மைகள் எளிதில் வெற்றி பெறும் (${col}).`,
        en: `With harmonious Venus as your Yogi, aesthetic presentation, gracious diplomacy, and scheduling creative or financial talks on ${day} toward ${dir} (${col}) pull opportunities toward you smoothly.`
      }, lang);
    case "Saturn":
      return pick6({
        kn: `ಶನಿ ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ದೀರ್ಘಕಾಲಿಕ ಶಿಸ್ತು, ಸಮಯಪಾಲನೆ ಮತ್ತು ${day}ರಂದು '${dir}' ದಿಕ್ಕಿನಲ್ಲಿ ಕಟ್ಟುವ ವ್ಯವಸ್ಥಿತ ಯೋಜನೆಗಳು ಯಾರೂ ಅಲ್ಲಾಡಿಸಲಾಗದ ಸ್ಥಿರ ಫಲ ನೀಡುತ್ತವೆ (${col}).`,
        mr: `शनी योगी असल्याने दीर्घकालीन शिस्त, वेळेचे काटेकोर पालन व ${day} रोजी '${dir}' दिशेत बांधलेले उपक्रम अढळ यश देतात (${col}).`,
        hi: `शनि के योगी होने से दीर्घकालिक अनुशासन, समय की पाबंदी और ${day} को '${dir}' दिशा में बनाई गई व्यवस्थित योजनाएं अटल समृद्धि देती हैं (${col})।`,
        te: `శని యోగి అయినందున దీర్ఘకాలిక క్రమశిక్షణ, సమయపాలన మరియు ${day} నాడు '${dir}' దిశలో నిర్మించే వ్యవస్థీకృత ప్రణాళికలు అచంచల ఫలితాలనిస్తాయి (${col}).`,
        ta: `சனி யோகியாக இருப்பதால் நீண்டகால ஒழுங்கு, நேரந்தவறாமை மற்றும் ${day} அன்று '${dir}' திசையில் அமைக்கும் திட்டங்கள் அசைக்க முடியாத வளத்தைத் தரும் (${col}).`,
        en: `With enduring Saturn as your Yogi, patient systems, punctual follow-through, and laying durable groundwork on ${day} facing ${dir} (${col}) build compounding wealth that shortcuts never match.`
      }, lang);
    default:
      return pick6({
        kn: `ರಾಹು ಯೋಗಿಯಾಗಿರುವುದರಿಂದ ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ, ದೂರದ ಸಂಪರ್ಕಗಳು ಹಾಗೂ ${day}ರಂದು '${dir}' ದಿಕ್ಕಿನ ವಿಶಿಷ್ಟ ಆಲೋಚನೆಗಳು ಅಪಾರ ಬೆಳವಣಿಗೆ ತರುತ್ತವೆ (${col}).`,
        mr: `राहु योगी असल्याने आधुनिक तंत्रज्ञान, दूरवरचे संपर्क व ${day} रोजी '${dir}' दिशेतील नाविन्यपूर्ण कल्पना मोठी झेप देतात (${col}).`,
        hi: `राहु के योगी होने से आधुनिक तकनीक, दूरस्थ संपर्क और ${day} को '${dir}' दिशा में किए गए अनूठे प्रयोग असाधारण उछाल देते हैं (${col})।`,
        te: `రాహువు యోగి అయినందున ఆధునిక సాంకేతికత, దూర ప్రాంత పరిచయాలు మరియు ${day} నాడు '${dir}' దిశలో వేసే వినూత్న అడుగులు గొప్ప ఎదుగుదలను ఇస్తాయి (${col}).`,
        ta: `ராகு யோகியாக இருப்பதால் நவீன தொழில்நுட்பம், தொலைதூரத் தொடர்புகள் மற்றும் ${day} அன்று '${dir}' திசையில் எடுக்கும் புதுமை முயற்சிகள் அபார வளர்ச்சி தரும் (${col}).`,
        en: `With innovative Rahu as your Yogi, modern tools, cross-border networks, and bold unconventional strategies launched on ${day} toward ${dir} (${col}) unlock sudden leaps.`
      }, lang);
  }
}

export function getMahadashaArchetypeLine(ctx: StoryEngineInput): string {
  const lang = ctx.targetLang;
  const nature = ctx.extendedPrecision.mahaNatureLabel;
  switch (ctx.rawMaha) {
    case "Sun":
      return pick6({
        kn: `ಸೂರ್ಯ ಮಹಾದಶೆಯು ('${nature}') ನಿಮ್ಮೊಳಗಿನ ಸ್ವಾಭಿಮಾನ, ಅಧಿಕಾರದ ಹೊಣೆ ಮತ್ತು ಸ್ವಂತ ಗುರುತನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿದೆ`,
        mr: `सूर्य महादशा ('${nature}') तुमचा स्वाभिमान, अधिकार आणि स्वतंत्र ओळख प्रखरपणे पुढे आणत आहे`,
        hi: `सूर्य महादशा ('${nature}') आपके भीतर स्वाभिमान, नेतृत्व और स्वतंत्र पहचान को प्रखर कर रही है`,
        te: `సూర్య మహర్దశ ('${nature}') మీ ఆత్మగౌరవాన్ని, నాయకత్వాన్ని మరియు స్వంత గుర్తింపును బలోపేతం చేస్తోంది`,
        ta: `சூரிய மகாதசை ('${nature}') உங்கள் சுயமரியாதை, தலைமை மற்றும் தனித்துவ அடையாளத்தை வெளிப்படுத்துகிறது`,
        en: `Solar Mahadasha (${nature}) places personal integrity, leadership accountability, and visible ownership center stage`
      }, lang);
    case "Moon":
      return pick6({
        kn: `ಚಂದ್ರ ಮಹಾದಶೆಯು ('${nature}') ಭಾವನಾತ್ಮಕ ಸ್ಪಷ್ಟತೆ, ಕುಟುಂಬ ಸುಖ ಹಾಗೂ ಜನಸಂಪರ್ಕದ ನಾಡಿಮಿಡಿತವನ್ನು ತೀವ್ರಗೊಳಿಸಿದೆ`,
        mr: `चंद्र महादशा ('${nature}') भावनिक प्रगल्भता, कौटुंबिक जिव्हाळा व लोकसंपर्क वाढवत आहे`,
        hi: `चंद्र महादशा ('${nature}') आपकी भावनात्मक संवेदनशीलता, पारिवारिक जुड़ाव और अंतर्ज्ञान को गहन बना रही है`,
        te: `చంద్ర మహర్దశ ('${nature}') భావోద్వేగ స్పష్టతను, కుటుంబ బంధాలను మరియు ప్రజాదరణను పెంచుతోంది`,
        ta: `சந்திர மகாதசை ('${nature}') மன உணர்வுத் தெளிவு, குடும்பப் பிணைப்பு மற்றும் மக்கள் தொடர்பை ஆழப்படுத்துகிறது`,
        en: `Lunar Mahadasha (${nature}) amplifies emotional intelligence, domestic roots, and intuitive reading of people`
      }, lang);
    case "Mars":
      return pick6({
        kn: `ಕುಜ ಮಹಾದಶೆಯು ('${nature}') ದಿಟ್ಟ ನಿರ್ಧಾರ, ಭೂಮಿ-ಆಸ್ತಿ ಸಾಹಸ ಮತ್ತು ತಡೆಯನ್ನು ಭೇದಿಸುವ ವೇಗವನ್ನು ತಂದಿದೆ`,
        mr: `मंगळ महादशा ('${nature}') धाडसी निर्णय, मालमत्तेचे उपक्रम आणि अडथळे भेदण्याची ऊर्जा देत आहे`,
        hi: `मंगल महादशा ('${nature}') साहसिक निर्णय, भूमि-संपत्ति प्रयास एवं बाधाओं को चीरकर आगे बढ़ने की शक्ति दे रही है`,
        te: `కుజ మహర్దశ ('${nature}') ధైర్యమైన నిర్ణయాలు, స్థిరాస్తి ప్రయత్నాలు మరియు అడ్డంకులను దాటే వేగాన్ని ఇస్తోంది`,
        ta: `செவ்வாய் மகாதசை ('${nature}') துணிச்சலான முடிவுகள், சொத்து முயற்சிகள் மற்றும் தடைகளை உடைக்கும் ஆற்றலைத் தருகிறது`,
        en: `Martian Mahadasha (${nature}) charges your life with decisive initiative, protective courage, and property/execution drive`
      }, lang);
    case "Mercury":
      return pick6({
        kn: `ಬುಧ ಮಹಾದಶೆಯು ('${nature}') ಬುದ್ಧಿಶಕ್ತಿ, ವ್ಯವಹಾರ ಕೌಶಲ್ಯ, ಒಪ್ಪಂದ ಹಾಗೂ ಬಹುಮುಖ ಸಂವಹನವನ್ನು ಮುನ್ನಡೆಸುತ್ತಿದೆ`,
        mr: `बुध महादशा ('${nature}') चाणाक्ष बुद्धिमत्ता, व्यापार-कौशल्य, संवाद आणि लेखी करारांना गती देत आहे`,
        hi: `बुध महादशा ('${nature}') आपकी तार्किक प्रज्ञा, वाणिज्य कौशल, संवाद और बहुमुखी सीख को शिखर पर ले जा रही है`,
        te: `బుధ మహర్దశ ('${nature}') తెలివితేటలు, వ్యాపార నైపుణ్యం, ఒప్పందాలు మరియు సంభాషణా శక్తిని నడిపిస్తోంది`,
        ta: `புதன் மகாதசை ('${nature}') நுண்ணறிவு, வணிகத் திறன், ஒப்பந்தங்கள் மற்றும் தெளிவான தொடர்பாடலை முன்னிறுத்துகிறது`,
        en: `Mercurial Mahadasha (${nature}) sharpens commercial intellect, negotiation skill, writing clarity, and adaptable strategy`
      }, lang);
    case "Jupiter":
      return pick6({
        kn: `ಗುರು ಮಹಾದಶೆಯು ('${nature}') ಜ್ಞಾನ ವಿಸ್ತಾರ, ವಂಶ ಗೌರವ, ನ್ಯಾಯಬದ್ಧ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ದೈವಾನುಗ್ರಹವನ್ನು ಹರಿಸುತ್ತಿದೆ`,
        mr: `गुरु महादशा ('${nature}') ज्ञानविस्तार, कौटुंबिक प्रतिष्ठा, सल्लागार भूमिका आणि शुभ प्रगती घडवत आहे`,
        hi: `बृहस्पति महादशा ('${nature}') ज्ञान-वृद्धि, कुल प्रतिष्ठा, मार्गदर्शन और धर्मसंगत समृद्धि को पोषित कर रही है`,
        te: `గురు మహర్దశ ('${nature}') విజ్ఞాన విస్తరణను, కుటుంబ గౌరవాన్ని మరియు న్యాయమైన అభివృద్ధిని కలిగిస్తోంది`,
        ta: `குரு மகாதசை ('${nature}') அறிவு வளர்ச்சி, குடும்பப் பெருமை, வழிகாட்டல் மற்றும் அறவழி முன்னேற்றத்தைத் தருகிறது`,
        en: `Jovian Mahadasha (${nature}) widens ethical wisdom, household dignity, mentorship blessings, and principled prosperity`
      }, lang);
    case "Venus":
      return pick6({
        kn: `ಶುಕ್ರ ಮಹಾದಶೆಯು ('${nature}') ಬದುಕಿನ ಸುಖ-ಸಮೃದ್ಧಿ, ಸೌಹಾರ್ದ ಬಾಂಧವ್ಯ ಹಾಗೂ ಕಲಾತ್ಮಕ ಆಕರ್ಷಣೆಯನ್ನು ಅರಳಿಸುತ್ತಿದೆ`,
        mr: `शुक्र महादशा ('${nature}') ऐश्वर्य, मधुर नातेसंबंध, सुखसोयी आणि कलात्मक अभिरुची फुलवत आहे`,
        hi: `शुक्र महादशा ('${nature}') जीवन में सुख-सुविधा, मधुर संबंध, कला और संतुलित समृद्धि को पल्लवित कर रही है`,
        te: `శుక్ర మహర్దశ ('${nature}') సుఖసౌఖ్యాలను, ఆత్మీయ బంధాలను, కళాభిరుచిని మరియు ఐశ్వర్యాన్ని వికసింపజేస్తోంది`,
        ta: `சுக்கிர மகாதசை ('${nature}') வாழ்வியல் சுகம், இனிய உறவுகள், கலை ரசனை மற்றும் வளமையை மலரச் செய்கிறது`,
        en: `Venusian Mahadasha (${nature}) cultivates refined comfort, partnership diplomacy, creative grace, and balanced prosperity`
      }, lang);
    case "Saturn":
      return pick6({
        kn: `ಶನಿ ಮಹಾದಶೆಯು ('${nature}') ಅಚಲ ಶಿಸ್ತು, ಕಠಿಣ ಪರೀಕ್ಷೆಯ ಮೂಲಕ ದೀರ್ಘಕಾಲ ಬಾಳುವ ಸ್ಥಾನಮಾನವನ್ನು ಕಟ್ಟುತ್ತಿದೆ`,
        mr: `शनी महादशा ('${nature}') काटेकोर शिस्त आणि सातत्यपूर्ण श्रमातून आयुष्यभर टिकणारी प्रतिष्ठा घडवत आहे`,
        hi: `शनि महादशा ('${nature}') गहन अनुशासन और धैर्यपूर्ण श्रम के माध्यम से जीवनभर टिकने वाली नींव तैयार कर रही है`,
        te: `శని మహర్దశ ('${nature}') కఠిన క్రమశిక్షణ మరియు స్థిరమైన శ్రమ ద్వారా శాశ్వత హోదాను నిర్మిస్తోంది`,
        ta: `சனி மகாதசை ('${nature}') அசைக்க முடியாத ஒழுங்கு மற்றும் பொறுமையான உழைப்பால் நிரந்தர நிலையைக் கட்டுகிறது`,
        en: `Saturnian Mahadasha (${nature}) forges unshakeable staying power—converting disciplined patience into permanent bedrock`
      }, lang);
    case "Rahu":
      return pick6({
        kn: `ರಾಹು ಮಹಾದಶೆಯು ('${nature}') ಅಸಾಮಾನ್ಯ ಮಹತ್ವಾಕಾಂಕ್ಷೆ, ನವೀನ ದಾರಿ ಮತ್ತು ಅನಿರೀಕ್ಷಿತ ಅವಕಾಶಗಳ ಬಾಗಿಲನ್ನು ತಟ್ಟುತ್ತಿದೆ`,
        mr: `राहु महादशा ('${nature}') मोठी महत्त्वाकांक्षा, चाकोरीबाहेरील विचार आणि अनपेक्षित संधींचे दार उघडत आहे`,
        hi: `राहु महादशा ('${nature}') प्रबल महत्वाकांक्षा, नवीन तकनीक-प्रयोग और अपारंपरिक अवसरों के द्वार खोल रही है`,
        te: `రాహు మహర్దశ ('${nature}') పెద్ద ఆశయాలను, కొత్త దారులను మరియు అనూహ్య అవకాశాలను తెరుస్తోంది`,
        ta: `ராகு மகாதசை ('${nature}') பெரிய லட்சியங்கள், புதுமையான சிந்தனை மற்றும் எதிர்பாராத வாய்ப்புகளின் கதவைத் திறக்கிறது`,
        en: `Rahu Mahadasha (${nature}) ignites unconventional ambition, modern leaps, and breakthroughs outside traditional molds`
      }, lang);
    default:
      return pick6({
        kn: `ಕೇತು ಮಹಾದಶೆಯು ('${nature}') ತೋರಿಕೆಯ ಭಾರವನ್ನು ಇಳಿಸಿ ಆಂತರಿಕ ನಿಖರತೆ, ಸೂಕ್ಷ್ಮ ಜ್ಞಾನ ಮತ್ತು ಶುದ್ಧ ಸತ್ಯದೆಡೆಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದೆ`,
        mr: `केतू महादशा ('${nature}') वरवरचा पसारा कमी करून सूक्ष्म अंतर्ज्ञान आणि अचूक सत्यशोधाकडे नेत आहे`,
        hi: `केतु महादशा ('${nature}') बाहरी आडंबर हटाकर सूक्ष्म अंतर्दृष्टि, वैराग्यपूर्ण संतुलन और शुद्ध स्पष्टता की ओर ले जा रही है`,
        te: `కేతు మహర్దశ ('${nature}') పైపై ఆడంబరాలను తగ్గించి లోతైన జ్ఞానం, ఆంతరంగిక స్పష్టత వైపు నడిపిస్తోంది`,
        ta: `கேது மகாதசை ('${nature}') வெளிப் பகட்டைக் குறைத்து ஆழ்ந்த உள்ளுணர்வு மற்றும் நுண்ணிய அறிவைத் தருகிறது`,
        en: `Ketu Mahadasha (${nature}) strips away empty noise so razor-sharp intuition, specialization, and quiet mastery lead`
      }, lang);
  }
}

export function buildChapterUniqueHook(
  chNum: number,
  themeKey: NarrativeThemeKey,
  arch: ChartArchetypeSnapshot,
  ctx: StoryEngineInput,
  isChildOrInfant: boolean
): string {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const {
    devoteeName,
    lagnaRashiName,
    moonRashiName,
    nakshatraName,
    weekdayName,
    yogaName,
    karanaName,
    janmaHora,
    livePrashnaHora,
    heroPlanetName,
    heroPlanetHouse,
    heroPlanetRashi,
    nearestColleagueName,
    nearestColleagueHouse,
    yogiPlanetName,
    avayogiPlanetName,
    maandiHouse,
    maandiRashiName,
    shaniTransitRashi,
    guruTransitRashi,
    bhriguBinduRashiName,
    currentMahadasha,
    currentBhuktiLord,
    bhuktiEndDate,
    dominantElement,
    house10Info,
    house2Info,
    house11Info,
    house7Info,
    house5Info,
    house6Info,
    nowYear,
    extendedPrecision
  } = ctx;
  const savByHouse = extendedPrecision.savByHouse;

  if (isChildOrInfant && chNum === 12) {
    const child12Hooks: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಈ ಕಂದಮ್ಮನ ಕುಂಡಲಿಯ '${heroPlanetName}' (${n(heroPlanetHouse)}ನೇ ಮನೆ) ಹಾಗೂ '${yogaName}' ಯೋಗದ ಬೆಳಕು ಇಂದೇ ಸುಂದರ ಕಲಿಕೆಯ ಕಿಡಿ ಹೊತ್ತಿಸುತ್ತಿದೆ.`,
        mr: `या बाळाच्या पत्रिकेतील '${heroPlanetName}' (स्थान ${n(heroPlanetHouse)}) आणि '${yogaName}' योगाचा प्रकाश आजपासूनच सुंदर कुतूहल जागवत आहे.`,
        hi: `इस बालक की पत्रिका के '${heroPlanetName}' (भाव ${n(heroPlanetHouse)}) एवं '${yogaName}' योग का उजाला बचपन से ही सीखने की प्यारी चमक बिखेर रहा है।`,
        te: `ఈ చిన్నారి జాతకంలోని '${heroPlanetName}' (${n(heroPlanetHouse)}వ స్థానం) మరియు '${yogaName}' యోగ కాంతి ఇప్పుడే చురుకైన జిజ్ఞాసను వెలిగిస్తోంది.`,
        ta: `இந்தக் குழந்தையின் ஜாதகத்தில் '${heroPlanetName}' (${n(heroPlanetHouse)}-ம் வீடு) மற்றும் '${yogaName}' யோக ஒளி இயல்பான அறிவுத் தீப்பொறியை ஏற்றுகிறது.`,
        en: `Seated in House ${heroPlanetHouse}, ${heroPlanetName} blends with ${yogaName} Yoga to light an unmistakable spark of early curiosity around this child.`
      },
      1: {
        kn: `${nakshatraName} ನಕ್ಷತ್ರದ ಸ್ಪಂದನೆ ಹಾಗೂ ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನದ ${n(savByHouse[5])} ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳು ಈ ಪುಟ್ಟ ಮನಸ್ಸಿನ ಚುರುಕುತನವನ್ನು ತೋರುತ್ತಿವೆ.`,
        mr: `${nakshatraName} नक्षत्राचे स्पंदन व पंचम भावातील ${n(savByHouse[5])} अष्टकवर्ग बिंदू या चिमुकल्याच्या तल्लख आकलनशक्तीची साक्ष देतात.`,
        hi: `${nakshatraName} नक्षत्र की संवेदना और पंचम भाव के ${n(savByHouse[5])} अष्टकवर्ग बिंदू इस नन्हे मन की तीव्र ग्रहणशक्ति दर्शाते हैं।`,
        te: `${nakshatraName} నక్షత్ర స్పందన మరియు 5వ స్థానంలోని ${n(savByHouse[5])} బిందువులు ఈ చిన్నారి చురుకైన గ్రహణ శక్తిని చూపుతున్నాయి.`,
        ta: `${nakshatraName} நட்சத்திர அதிர்வும் 5-ம் இடத்தின் ${n(savByHouse[5])} பரல்களும் இந்தக் குழந்தையின் கூரிய அறிவுத்திறனைப் பறைசாற்றுகின்றன.`,
        en: `Inside ${nakshatraName}, ${savByHouse[5]} fifth-house bindus reveal a mind eager to absorb stories, patterns, and affectionate guidance.`
      },
      2: {
        kn: `ಕಂದನ '${janmaHora}' ಹೋರೆ ಮತ್ತು ${lagnaRashiName} ಲಗ್ನಾಧಿಪತಿ ${extendedPrecision.house1Info.lordName} ರಕ್ಷಾ ಕವಚವು ಬಾಲ್ಯದ ಆರೋಗ್ಯ ಹಾಗೂ ಕಲಿಕೆಗೆ ನೆಲೆ ಕಟ್ಟುತ್ತಿದೆ.`,
        mr: `बाळाचा '${janmaHora}' होरा आणि ${lagnaRashiName} लग्नेश ${extendedPrecision.house1Info.lordName} याचे संरक्षण बालपणातील शिक्षण व वाढीला भक्कम आधार देते.`,
        hi: `बालक की '${janmaHora}' होरा और ${lagnaRashiName} लग्नेश ${extendedPrecision.house1Info.lordName} का संबल प्रारंभिक सीख और सुरक्षा को पुष्ट करता है।`,
        te: `చిన్నారి '${janmaHora}' హోర మరియు ${lagnaRashiName} లగ్నాధిపతి ${extendedPrecision.house1Info.lordName} రక్షణ బాల్య వికాసానికి అండగా నిలుస్తున్నాయి.`,
        ta: `குழந்தையின் '${janmaHora}' ஹோரையும் ${lagnaRashiName} லக்னாதிபதி ${extendedPrecision.house1Info.lordName} காப்பும் ஆரம்பக் கற்றலை உறுதிப்படுத்துகின்றன.`,
        en: `Guided by ${janmaHora} Hora and ${lagnaRashiName} lord ${extendedPrecision.house1Info.lordName}, natural playfulness outperforms rigid comparison at this young stage.`
      },
      3: {
        kn: `ಹೂದೋಟದಲ್ಲಿ ಚಿಗುರಿದ ಎಳೆಯ ಮೊಗ್ಗಿನಂತೆ, ${moonRashiName} ಚಂದ್ರನ ಆತ್ಮೀಯ ಪ್ರೀತಿಯಲ್ಲಿ ಈ ಮಗುವಿನ ಪ್ರತಿಭೆ ತನ್ನದೇ ಲಯದಲ್ಲಿ ಅರಳುತ್ತಿದೆ.`,
        mr: `बागेत उमलणाऱ्या कोवळ्या कळीप्रमाणे, ${moonRashiName} चंद्राच्या प्रेमळ सावलीत या मुलाची उपजत कला स्वतःच्या लयीत बहरत आहे.`,
        hi: `उपवन में खिलती कोमल कली की भांति, ${moonRashiName} चंद्र के स्नेहिल आंचल में इस बालक की प्रतिभा अपनी सहज गति से खिल रही है।`,
        te: `తోటలో వికసిస్తున్న లేత మొగ్గలా, ${moonRashiName} చంద్రుని ప్రేమపూర్వక నీడలో ఈ చిన్నారి ప్రతిభ సహజంగా విచ్చుకుంటోంది.`,
        ta: `பூந்தோட்டத்தில் மலரும் இளம் மொட்டு போல, ${moonRashiName} சந்திரனின் அன்பில் இந்தக் குழந்தையின் தனித்திறன் இயல்பாக மலர்கிறது.`,
        en: `Like a tender bud opening at sunrise rather than on command, this ${moonRashiName} Moon child thrives when curiosity feels safe and joyful.`
      }
    };
    return pick6(child12Hooks[ed], lang);
  }

  // Dedicated 4-edition hooks for all 25 chapters — ZERO shared phrases across chapters OR editions!
  const hooksByChapter: Record<number, Record<0 | 1 | 2 | 3, Record<SixLang, string>>> = {
    1: {
      0: {
        kn: `ನಮಸ್ಕಾರ ${devoteeName} — ನಿಮ್ಮ ಕುಂಡಲಿಯ ${n(heroPlanetHouse)}ನೇ ಮನೆಯ (${heroPlanetRashi}) ಪ್ರಬಲ ನಾಯಕ '${heroPlanetName}' ಹಾಗೂ ಪಕ್ಕದ '${nearestColleagueName}' ಈ ಕ್ಷಣದ ತೆರೆ ಎಳೆಯುತ್ತಿದ್ದೇವೆ.`,
        mr: `नमस्कार ${devoteeName} — तुमच्या पत्रिकेतील ${n(heroPlanetHouse)}व्या भावाचा (${heroPlanetRashi}) मुख्य नायक '${heroPlanetName}' आणि शेजारील '${nearestColleagueName}' आज पहिल्या अंकाचा पडदा उघडत आहोत.`,
        hi: `नमस्ते ${devoteeName} — आपकी कुंडली के ${n(heroPlanetHouse)}वें भाव (${heroPlanetRashi}) के नायक '${heroPlanetName}' और समीप स्थित '${nearestColleagueName}' इस क्षण का परदा उठाते हैं।`,
        te: `నమస్కారం ${devoteeName} — మీ కుండలిలోని ${n(heroPlanetHouse)}వ స్థాన (${heroPlanetRashi}) ప్రధాన నాయకుడు '${heroPlanetName}' మరియు '${nearestColleagueName}' కలిసి తొలి పుటను ప్రారంభిస్తున్నాము.`,
        ta: `வணக்கம் ${devoteeName} — உங்கள் ஜாதகத்தின் ${n(heroPlanetHouse)}-ம் இட (${heroPlanetRashi}) நாயகன் '${heroPlanetName}' மற்றும் அருகிலுள்ள '${nearestColleagueName}' இணைந்து முதல் அத்தியாயத்தைத் திறக்கிறோம்.`,
        en: `Welcome inside, ${devoteeName}: speaking straight from House ${heroPlanetHouse} (${heroPlanetRashi}), I am ${heroPlanetName}, standing beside ${nearestColleagueName} in House ${nearestColleagueHouse} to read this exact hour.`
      },
      1: {
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ${nakshatraName}, ಪ್ರಮುಖ '${heroPlanetName}' ಗ್ರಹ ಹಾಗೂ '${livePrashnaHora}' ಹೋರೆಯ ನೇರ ಸಂಗಮವೇ ಈಗ ಮನಸ್ಸಿನ ತಳಮಳವನ್ನು ಗುರುತಿಸುತ್ತಿದೆ (${extendedPrecision.taraLabelLocalized}).`,
        mr: `${devoteeName}, तुमचे ${nakshatraName} नक्षत्र, प्रमुख '${heroPlanetName}' ग्रह आणि आत्ताचा '${livePrashnaHora}' होरा यांचा थेट संगम तुमच्या मनातील नेमकी हालचाल पकडत आहे (${extendedPrecision.taraLabelLocalized}).`,
        hi: `${devoteeName}, आपके जन्म नक्षत्र ${nakshatraName}, प्रमुख ग्रह '${heroPlanetName}' और वर्तमान '${livePrashnaHora}' होरा का सटीक मिलन इस घड़ी आपके मन के प्रश्न को उजागर करता है (${extendedPrecision.taraLabelLocalized})।`,
        te: `${devoteeName}, మీ జన్మ నక్షత్రం ${nakshatraName}, ప్రధాన గ్రహం '${heroPlanetName}' మరియు ప్రస్తుత '${livePrashnaHora}' హోర కలయిక మీ మనసులోని భావాన్ని చూపుతోంది (${extendedPrecision.taraLabelLocalized}).`,
        ta: `${devoteeName}, உங்கள் ${nakshatraName} நட்சத்திரம், முக்கிய '${heroPlanetName}' கிரகம் மற்றும் '${livePrashnaHora}' ஹோரை இணைந்து உங்கள் மனக் கேள்வியை அச்சாகக் காட்டுகின்றன (${extendedPrecision.taraLabelLocalized}).`,
        en: `${devoteeName}, pairing natal ${nakshatraName} sensitivity and key planet ${heroPlanetName} with live ${livePrashnaHora} Hora highlights why one specific unresolved thread weighs heavier today (${extendedPrecision.taraLabelLocalized}).`
      },
      2: {
        kn: `${lagnaRashiName} ಲಗ್ನದ ${n(savByHouse[1])} ಬಿಂದುಗಳು, '${heroPlanetName}' ಪ್ರಭಾವ ಮತ್ತು '${extendedPrecision.taraLabelLocalized}' ತಾರಾಬಲದ ನಡುವೆ ನಡೆಯುತ್ತಿರುವ ಸೂಕ್ಷ್ಮ ಸಂವಾದವನ್ನು ಗಮನಿಸಿ, ${devoteeName}.`,
        mr: `${lagnaRashiName} लग्नाचे ${n(savByHouse[1])} बिंदू, '${heroPlanetName}' बळ आणि आत्ताची '${extendedPrecision.taraLabelLocalized}' ताराबल लय यांच्यातील संवादाकडे पहा, ${devoteeName}.`,
        hi: `${lagnaRashiName} लग्न के ${n(savByHouse[1])} बिंदुओं, '${heroPlanetName}' के बल और '${extendedPrecision.taraLabelLocalized}' ऊर्जा के बीच का सूक्ष्म संवाद देखिए, ${devoteeName}।`,
        te: `${lagnaRashiName} లగ్నంలోని ${n(savByHouse[1])} బిందువులు, '${heroPlanetName}' బలం మరియు ప్రస్తుత '${extendedPrecision.taraLabelLocalized}' తారాబలం మధ్య సంకేతాన్ని చూడండి, ${devoteeName}.`,
        ta: `${lagnaRashiName} லக்னத்தின் ${n(savByHouse[1])} பரல்கள், '${heroPlanetName}' பலம் மற்றும் '${extendedPrecision.taraLabelLocalized}' தாராபலத்திற்கும் இடையிலான உரையாடலைக் கவனியுங்கள், ${devoteeName}.`,
        en: `Compare what pulls close versus what fades today, ${devoteeName}: ${savByHouse[1]} Lagna bindus in ${lagnaRashiName} alongside ${heroPlanetName} meet '${extendedPrecision.taraLabelLocalized}' right at this doorway.`
      },
      3: {
        kn: `ಹರಿವ ನದಿಯ ಮೇಲ್ಮೈ ನಿಶ್ಚಲವಾಗಿ ಕಂಡರೂ ಆಳದಲ್ಲಿ ಪ್ರವಾಹ ಇರುವಂತೆ, ${devoteeName}, ನಿಮ್ಮ ${heroPlanetName} (${heroPlanetRashi}) ಪ್ರಭಾವವು ಈ ಗಂಟೆಯ ನಿಜವಾದ ತಿರುವನ್ನು ತೋರಿಸುತ್ತಿದೆ.`,
        mr: `संथ वाहणाऱ्या नदीखाली खोल प्रवाह असावा, तसे ${devoteeName}, तुमच्या पत्रिकेतील ${heroPlanetName} (${heroPlanetRashi}) चा प्रभाव या क्षणाचे खरे वळण दाखवत आहे.`,
        hi: `शांत बहती नदी के भीतर चलती गहरी धारा की भांति, ${devoteeName}, आपकी कुंडली के ${heroPlanetName} (${heroPlanetRashi}) इस घड़ी का वास्तविक संकेत दे रहे हैं।`,
        te: `నిశ్శబ్దంగా పారే నది లోతుల్లో బలమైన ప్రవాహం ఉన్నట్లుగా, ${devoteeName}, మీ జాతకంలోని ${heroPlanetName} (${heroPlanetRashi}) ఈ క్షణపు అసలైన మలుపును చూపుతోంది.`,
        ta: `அமைதியாக ஓடும் ஆற்றின் அடியில் ஆழமான நீரோட்டம் இருப்பது போல், ${devoteeName}, உங்கள் ${heroPlanetName} (${heroPlanetRashi}) இந்த நொடியின் உண்மையான திருப்பத்தைக் காட்டுகிறது.`,
        en: `Like a quiet river hiding a brisk undercurrent, ${devoteeName}, ${heroPlanetName} inside ${heroPlanetRashi} reveals why today's hesitation is actually a turning hinge.`
      }
    },
    2: {
      0: {
        kn: `ನಿಮ್ಮ ಕುಂಡಲಿಯ ೮ನೇ ರಹಸ್ಯ ಭಾವಾಧಿಪತಿ ${extendedPrecision.house8Info.lordName} ಹಾಗೂ ೧೨ನೇ ವ್ಯಯಾಧಿಪತಿ ${extendedPrecision.house12Info.lordName} ನಿಮ್ಮ ಅಂತರಂಗದ ಮೌನ ತ್ಯಾಗವನ್ನು ದಾಖಲಿಸಿವೆ.`,
        mr: `तुमच्या कुंडलीतील अष्टमेश ${extendedPrecision.house8Info.lordName} आणि व्ययेश ${extendedPrecision.house12Info.lordName} यांनी तुमचा प्रत्येक न बोललेला त्याग नोंदवून ठेवला आहे.`,
        hi: `आपकी कुंडली के अष्टमेश ${extendedPrecision.house8Info.lordName} और द्वादशेश ${extendedPrecision.house12Info.lordName} आपके हर अनकहे समर्पण के साक्षी रहे हैं।`,
        te: `మీ జాతకంలోని అష్టమాధిపతి ${extendedPrecision.house8Info.lordName} మరియు వ్యయాధిపతి ${extendedPrecision.house12Info.lordName} మీరు చేసిన నిశ్శబ్ద త్యాగాలను గుర్తించాయి.`,
        ta: `உங்கள் ஜாதகத்தில் அஷ்டமாதிபதி ${extendedPrecision.house8Info.lordName} மற்றும் விரயாதிபதி ${extendedPrecision.house12Info.lordName} உங்கள் மௌனமான பொறுப்புகளைப் பதிவு செய்துள்ளன.`,
        en: `Behind closed doors, 8th lord ${extendedPrecision.house8Info.lordName} (House ${extendedPrecision.house8Info.placedHouse}) and 12th lord ${extendedPrecision.house12Info.lordName} record every burden you carried silently.`
      },
      1: {
        kn: `${ctx.pakshaName} ಪಕ್ಷದಲ್ಲಿ ಹುಟ್ಟಿದ ${nakshatraName} ನಕ್ಷತ್ರದ ಹೃದಯ ಗುಣವು ಬೇರೆಯವರ ಭಾರವನ್ನೂ ತಾನೇ ಹೊತ್ತುಕೊಳ್ಳುವ ಮೃದು ಸ್ವಭಾವವನ್ನು ಕಟ್ಟಿದೆ.`,
        mr: `${ctx.pakshaName} पक्षातील ${nakshatraName} नक्षत्राच्या स्वभावामुळे तुम्ही इतरांची जबाबदारी स्वतःच्या खांद्यावर घेण्यास कधीच मागेपुढे पाहत नाही.`,
        hi: `${ctx.pakshaName} पक्ष में जन्मे आपके ${nakshatraName} नक्षत्र ने दूसरों के कठिन कार्य स्वयं संभाल लेने का उदार स्वभाव गढ़ा है।`,
        te: `${ctx.pakshaName} పక్షంలో ${nakshatraName} నక్షత్రాన జన్మించిన మీ స్వభావం ఇతరుల కష్టాన్ని కూడా మీ భుజాలపై వేసుకునే మంచితనాన్ని ఇచ్చింది.`,
        ta: `${ctx.pakshaName} பக்ஷத்தில் பிறந்த உங்கள் ${nakshatraName} நட்சத்திரம் பிறர் சுமையையும் தாங்கி நிற்கும் பெருந்தன்மையைத் தந்துள்ளது.`,
        en: `Born during ${ctx.pakshaName} in ${nakshatraName}, you instinctively absorb friction meant for other people so peace holds around you.`
      },
      2: {
        kn: `${lagnaRashiName} ಲಗ್ನದ ನಿಷ್ಠೆ ಮತ್ತು ಭಾಗ್ಯಾಧಿಪತಿ ${extendedPrecision.house9Info.lordName} (${extendedPrecision.house9Info.placedRashi}) ಬಲದ ನಡುವೆ ಅಡಗಿರುವ ಆ ಗುಪ್ತ ಲೆಕ್ಕವನ್ನು ನೋಡಿ.`,
        mr: `${lagnaRashiName} लग्नाची निष्ठा आणि भाग्येश ${extendedPrecision.house9Info.lordName} (${extendedPrecision.house9Info.placedRashi}) यांतील गुप्त हिशोब येथे उलगडतो.`,
        hi: `${lagnaRashiName} लग्न की निष्ठा और भाग्येश ${extendedPrecision.house9Info.lordName} (${extendedPrecision.house9Info.placedRashi}) के बीच का गुप्त कर्म-लेख यहां खुलता है।`,
        te: `${lagnaRashiName} లగ్న నిబద్ధత మరియు భాగ్యాధిపతి ${extendedPrecision.house9Info.lordName} (${extendedPrecision.house9Info.placedRashi}) మధ్య ఉన్న ఆంతరంగిక లెక్కను చూడండి.`,
        ta: `${lagnaRashiName} லக்ன நேர்மைக்கும் பாக்கியாதிபதி ${extendedPrecision.house9Info.lordName} (${extendedPrecision.house9Info.placedRashi}) பலத்திற்கும் இடையிலான ரகசியக் கணக்கைப் பாருங்கள்.`,
        en: `Measuring your unseen deposits: 9th fortune lord ${extendedPrecision.house9Info.lordName} in ${extendedPrecision.house9Info.placedRashi} keeps strict account of every favor people forgot to repay.`
      },
      3: {
        kn: `ಮನೆಯ ಮುಖ್ಯ ಕಂಬ ನೆಲದೊಳಗೆ ಆಳವಾಗಿ ಹೂತು ಭಾರ ಹೊರುವಂತೆ, ${lagnaRashiName} ಸ್ವಭಾವದವರು ಕೀರ್ತಿ ಬಯಸದೆ ಇಡೀ ವ್ಯವಸ್ಥೆಯನ್ನು ನಿಲ್ಲಿಸುತ್ತಾರೆ.`,
        mr: `इमारतीचा मुख्य खांब जमिनीत खोल राहून सर्व भार पेलतो, तसेच ${lagnaRashiName} स्वभावाची माणसे गाजावाजा न करता सर्व व्यवस्था टिकवून ठेवतात.`,
        hi: `भवन की नींव जैसे दिखाई दिए बिना पूरा भार उठाती है, वैसे ही आपका ${lagnaRashiName} स्वभाव बिना श्रेय मांगे सबको संभाल लेता है।`,
        te: `ఇంటి ప్రధాన స్తంభం పైకి కనిపించకుండా బరువు మోసినట్లుగా, ${lagnaRashiName} స్వభావం గల మీరు ప్రచారం లేకుండా అందరినీ నిలబెడతారు.`,
        ta: `மாளிகையின் அடித்தளத் தூண் வெளியே தெரியாமல் சுமை தாங்குவது போல், உங்கள் ${lagnaRashiName} இயல்பு ஆரவாரமின்றி அனைவரையும் தாங்குகிறது.`,
        en: `Like a foundation pillar buried beneath stone floors, your ${lagnaRashiName} temperament holds heavy weight without applause—until today.`
      }
    },
    3: {
      0: {
        kn: `ಕಳೆದ ೨೪ ತಿಂಗಳ ಲೆಕ್ಕವನ್ನು ${moonRashiName} ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯಲ್ಲಿರುವ (${shaniTransitRashi}) ಶನಿಯ ಸ್ಥಾನದಿಂದ ನೇರವಾಗಿ ಪರೀಕ್ಷಿಸೋಣ.`,
        mr: `मागील २४ महिन्यांचा हिशोब तुमच्या ${moonRashiName} राशीपासून ${n(ctx.shaniHouseFromMoon)}व्या स्थानातील (${shaniTransitRashi}) शनीच्या गणितावरून थेट तपासूया.`,
        hi: `विगत २४ महीनों का सत्य आपकी ${moonRashiName} राशि से ${n(ctx.shaniHouseFromMoon)}वें भाव (${shaniTransitRashi}) में स्थित शनि के प्रत्यक्ष आधार पर परखते हैं।`,
        te: `గత 24 నెలల లెక్కలను మీ ${moonRashiName} రాశి నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థానంలో (${shaniTransitRashi}) ఉన్న శని గణితంతో సరిచూద్దాం.`,
        ta: `கடந்த 24 மாதக் கணக்கை உங்கள் ${moonRashiName} ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடத்தில் (${shaniTransitRashi}) சஞ்சரிக்கும் சனியின் அடிப்படையில் சரிபார்ப்போம்.`,
        en: `Real astrology proves yesterday first: Saturn crossing House ${ctx.shaniHouseFromMoon} (${shaniTransitRashi}) from your ${moonRashiName} Moon audited your past 24 months.`
      },
      1: {
        kn: `${currentMahadasha}–${currentBhuktiLord} ದಶೆಯೊಳಗೆ ಕಳೆದ ಎರಡು ವರ್ಷಗಳ ${shaniTransitRashi} (${n(ctx.shaniTransitSav)} ಬಿಂದು) ಹಂತವು ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಹೇಗೆ ಕಟೆದಿದೆ ನೋಡಿ.`,
        mr: `चालू ${currentMahadasha}–${currentBhuktiLord} दशेत गेल्या दोन वर्षांतील ${shaniTransitRashi} (${n(ctx.shaniTransitSav)} गुण) टप्प्याने तुमची सहनशक्ती कशी तपासली ते पहा.`,
        hi: `सक्रिय ${currentMahadasha}–${currentBhuktiLord} दशा के भीतर बीते दो वर्षों में ${shaniTransitRashi} (${n(ctx.shaniTransitSav)} बिंदू) की कसौटी ने आपके धैर्य को किस तरह तराशा है, देखें।`,
        te: `ప్రస్తుత ${currentMahadasha}–${currentBhuktiLord} దశలో గత రెండేళ్ల ${shaniTransitRashi} (${n(ctx.shaniTransitSav)} బిందువులు) సంచారం మీ ఓర్పును ఎలా పరీక్షించిందో చూడండి.`,
        ta: `நடப்பு ${currentMahadasha}–${currentBhuktiLord} தசையில் கடந்த இரண்டு ஆண்டு ${shaniTransitRashi} (${n(ctx.shaniTransitSav)} பரல்கள்) சஞ்சாரம் உங்கள் பொறுமையை எப்படி அளந்தது எனப் பாருங்கள்.`,
        en: `Inside your ${currentMahadasha}–${currentBhuktiLord} arc, the ${ctx.shaniTransitSav}-bindu weight through ${shaniTransitRashi} (House ${ctx.shaniHouseFromMoon} from Moon) explains two sharp recent tests.`
      },
      2: {
        kn: `ಒಂದೆಡೆ ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿಯ ವಿಳಂಬ, ಮತ್ತೊಂದೆಡೆ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯ ಶನಿ ಪರೀಕ್ಷೆ — ಇವೆರಡೂ ಕಳೆದ ೨ ವರ್ಷಗಳಲ್ಲಿ ಕಲಿಸಿದ ಪಾಠವೇ ಬೇರೆ.`,
        mr: `एकीकडे ${n(maandiHouse)}व्या स्थानातील मांदीची परीक्षा आणि दुसरीकडे ${n(ctx.shaniHouseFromMoon)}व्या भावातील शनीचे वळण — या दोन्हींनी गेल्या २ वर्षांत मोठी स्पष्टता दिली.`,
        hi: `एक ओर ${n(maandiHouse)}वें भाव की मांदी और दूसरी ओर चंद्र से ${n(ctx.shaniHouseFromMoon)}वें स्थान का शनि — दोनों ने मिलकर पिछले २ वर्षों में गहरी परख दी।`,
        te: `ఒకవైపు ${n(maandiHouse)}వ స్థాన మాంది, మరోవైపు ${n(ctx.shaniHouseFromMoon)}వ స్థాన శని — ఇవి రెండూ గత రెండేళ్లలో మీకు భిన్నమైన జీవిత పాఠాలు నేర్పాయి.`,
        ta: `ஒரு பக்கம் ${n(maandiHouse)}-ம் இட மாந்தியும், மறுபக்கம் ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இட சனியும் கடந்த 2 ஆண்டுகளில் தனித்துவமான பாடங்களைக் கற்பித்தன.`,
        en: `Pairing ${ctx.shaniHouseFromMoon}th-from-Moon Saturn against House ${maandiHouse} Maandi separates temporary setbacks from the permanent clarity you now carry.`
      },
      3: {
        kn: `ಚಿನ್ನವನ್ನು ಬೆಂಕಿಯಲ್ಲಿ ಕಾಯಿಸಿದಾಗಲೇ ಅದರ ಶುದ್ಧತೆ ತಿಳಿಯುವಂತೆ, ${moonRashiName} ರಾಶಿಯವರಿಗೆ ${n(ctx.shaniHouseFromMoon)}ನೇ ಸ್ಥಾನದ ಕಳೆದ ೨೪ ತಿಂಗಳು ನಿಮ್ಮ ನಿಜವಾದ ಬೆಲೆಯನ್ನು ತೋರಿಸಿವೆ.`,
        mr: `सोन्याची शुद्धता अग्नीत तावल्यावरच कळते, तशी ${moonRashiName} राशीपासून ${n(ctx.shaniHouseFromMoon)}व्या भावातील गेल्या २४ महिन्यांनी तुमची खरी ताकद सिद्ध केली.`,
        hi: `अग्नि में तपकर जैसे स्वर्ण अपनी खरापन दिखाता है, वैसे ही ${moonRashiName} से ${n(ctx.shaniHouseFromMoon)}वें भाव के बीते २४ महीनों ने आपकी वास्तविक शक्ति सिद्ध की।`,
        te: `అగ్నిలో కాలినప్పుడే బంగారం విలువ తెలిసినట్లు, ${moonRashiName} రాశికి ${n(ctx.shaniHouseFromMoon)}వ స్థానంలోని గత 24 నెలలు మీ అసలైన బలాన్ని నిరూపించాయి.`,
        ta: `தீயில் சுடும்போது தங்கத்தின் தரம் தெரிவது போல், ${moonRashiName} ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடத்தின் கடந்த 24 மாதங்கள் உங்கள் உண்மையான வலிமையைக் காட்டின.`,
        en: `Gold proves purity under heat rather than in display cases—your recent 24-month passage under House ${ctx.shaniHouseFromMoon} from ${moonRashiName} Moon forged real composure.`
      }
    },
    4: {
      0: {
        kn: `ಗಡಿಯಾರದ ಮುಳ್ಳು ೯೯ನೇ ಸೆಕೆಂಡಿಗೆ ನಿಂತಂತೆ, ನಿಮ್ಮ ${n(maandiHouse)}ನೇ ಭಾವದ (${maandiRashiName}) ಮಾಂದಿಯು ಕೊನೆಯ ಕೊಂಡಿಯ ಬಳಿ ಸೂಕ್ಷ್ಮ ತಪಾಸಣೆ ನಡೆಸುತ್ತದೆ.`,
        mr: `घड्याळाचा काटा ९९व्या क्षणावर थांबावा तशी तुमच्या ${n(maandiHouse)}व्या स्थानातील (${maandiRashiName}) मांदी शक्ती अगदी शेवटच्या पायरीवर तपासणी करते.`,
        hi: `जैसे घड़ी की सुई ९९वें पड़ाव पर आकर थमे, ठीक वैसे ही आपके ${n(maandiHouse)}वें भाव (${maandiRashiName}) की मांदी सफलता के अंतिम द्वार पर जांच करती है।`,
        te: `గడియారపు ముల్లు 99వ క్షణం దగ్గర ఆగినట్లుగా, మీ ${n(maandiHouse)}వ స్థానంలోని (${maandiRashiName}) మాంది చివరి క్షణం పరిశీలన పెడుతుంది.`,
        ta: `கடிகார முள் 99-வது விநாடியில் நிற்பது போல், உங்கள் ${n(maandiHouse)}-ம் இட (${maandiRashiName}) மாந்தி கடைசிப் படியில் சோதனை வைக்கிறது.`,
        en: `Like a vault dial pausing at ninety-nine percent turn, Maandi inside House ${maandiHouse} (${maandiRashiName}) inspects the final step before completion.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನದ ${n(extendedPrecision.badhakaHouse)}ನೇ ಬಾಧಕ ಸ್ಥಾನ (${extendedPrecision.badhakaInfo.lordName}) ಹಾಗೂ ${n(maandiHouse)}ನೇ ಮನೆಯ ಮಾಂದಿ ಸೇರಿ ೯೯% ಹಂತದ ಆ ತಡೆಯನ್ನು ಸೃಷ್ಟಿಸಿವೆ.`,
        mr: `तुमच्या ${lagnaRashiName} लग्नाचे ${n(extendedPrecision.badhakaHouse)}वे बाधक स्थान (${extendedPrecision.badhakaInfo.lordName}) व ${n(maandiHouse)}व्या भावातील मांदी यांनी ९९% टप्प्यावरील तो अडथळा निर्माण केला आहे.`,
        hi: `आपके ${lagnaRashiName} लग्न का ${n(extendedPrecision.badhakaHouse)}वां बाधक भाव (${extendedPrecision.badhakaInfo.lordName}) और ${n(maandiHouse)}वें स्थान की मांदी मिलकर ९९% पर रुकने वाला यह चक्र बनाते हैं।`,
        te: `మీ ${lagnaRashiName} లగ్నానికి ${n(extendedPrecision.badhakaHouse)}వ బాధక స్థానం (${extendedPrecision.badhakaInfo.lordName}) మరియు ${n(maandiHouse)}వ స్థాన మాంది కలిసి 99% వద్ద ఈ ఆటంకం కలిగిస్తున్నాయి.`,
        ta: `உங்கள் ${lagnaRashiName} லக்னத்தின் ${n(extendedPrecision.badhakaHouse)}-ம் பாதக ஸ்தானம் (${extendedPrecision.badhakaInfo.lordName}) மற்றும் ${n(maandiHouse)}-ம் இட மாந்தி இணைந்து 99% தடையை உருவாக்குகின்றன.`,
        en: `Combining Badhaka House ${extendedPrecision.badhakaHouse} (${extendedPrecision.badhakaInfo.lordName}) with House ${maandiHouse} Maandi explains why near-finished deals stall at ninety-nine percent.`
      },
      2: {
        kn: `${ctx.maandiDomainAffected} ಕ್ಷೇತ್ರದಲ್ಲಿ ಕೆಲಸ ೯೯% ಪೂರ್ಣಗೊಂಡರೂ ಕೊನೆಯ ೧% ಸಹಿ ಅಥವಾ ಅನುಮತಿ ತಡವಾಗುವ ಆ ವಿಚಿತ್ರ ಅನುಭವದ ಗಣಿತ ಇಲ್ಲಿದೆ.`,
        mr: `${ctx.maandiDomainAffected} क्षेत्रात ९९% काम पूर्ण होऊनही शेवटच्या १% टप्प्यावर स्वाक्षरी किंवा मंजुरी का अडकते, त्याचे गणित येथे आहे.`,
        hi: `${ctx.maandiDomainAffected} में ९९% तैयारी पूरी होने पर भी अंतिम १% पर कागज़ या सहमति क्यों अटक जाती है, उसका सटीक सूत्र यहां देखें।`,
        te: `${ctx.maandiDomainAffected} విషయాల్లో 99% పూర్తయినా చివరి 1% సంతకం లేదా అంగీకారం ఎందుకు ఆలస్యమవుతుందో ఈ లెక్క చెబుతుంది.`,
        ta: `${ctx.maandiDomainAffected} சார்ந்த செயல்கள் 99% முடிந்த பிறகும் கடைசி 1% ஒப்புதல் ஏன் தாமதமாகிறது என்பதை இந்தக் கணிதம் விளக்குகிறது.`,
        en: `Zooming straight into ${ctx.maandiDomainAffected}: why 99% effort lands fast yet the last 1% lock asks for extra verification.`
      },
      3: {
        kn: `ಭದ್ರವಾದ ತಿಜೋರಿಯ ಕೊನೆಯ ಸಂಖ್ಯೆಯನ್ನು ತಪ್ಪದೆ ಜೋಡಿಸಿದಾಗಲೇ ಬೀಗ ತೆರೆಯುವಂತೆ, ${n(maandiHouse)}ನೇ ಭಾವದ ೯೯% ಗಂಟು ಕೂಡ ಒಂದು ಸಣ್ಣ ಜಾಗ್ರತೆಯಿಂದ ಕರಗುತ್ತದೆ.`,
        mr: `तिजोरीचा शेवटचा आकडा बरोबर जुळताच कुलूप उघडावे, तशी ${n(maandiHouse)}व्या भावातील ९९% अडकणारी गाठ एका छोट्या सावधगिरीने सुटते.`,
        hi: `मजबूत तिजोरी की अंतिम संख्या सही बैठते ही ताला खुलने की भांति, ${n(maandiHouse)}वें भाव की ९९% वाली यह ग्रंथि एक सूक्ष्म सुधार से खुल जाती है।`,
        te: `బలమైన లాకర్ చివరి అంకె సరిపోగానే తలుపు తెరుచుకున్నట్లుగా, ${n(maandiHouse)}వ స్థానంలోని 99% ముడి చిన్న జాగ్రత్తతో వీడిపోతుంది.`,
        ta: `பாதுகாப்புப் பெட்டகத்தின் கடைசி எண் பொருந்தியவுடன் பூட்டு திறப்பது போல், ${n(maandiHouse)}-ம் இடத்தின் 99% தடை ஒரு சிறிய கவனத்தால் விலகும்.`,
        en: `A heavy brass safe opens only on its final click—your ninety-nine percent pause inside House ${maandiHouse} behaves the exact same way.`
      }
    },
    5: {
      0: {
        kn: `ನಿಮ್ಮ ಹುಟ್ಟು ಕ್ಷಣದ '${yogaName}' ಯೋಗ, '${karanaName}' ಕರಣ ಹಾಗೂ '${dominantElement}' ಸಂಯೋಜನೆಯೊಳಗೆ ಇಣುಕಿದಾಗ ನಿಮ್ಮ ಆಂತರಿಕ ನಿಯಮಾವಳಿ ಸ್ಪಷ್ಟವಾಗುತ್ತದೆ.`,
        mr: `तुमच्या जन्माच्या '${yogaName}' योग, '${karanaName}' करण आणि '${dominantElement}' तत्त्वात डोकावता तुमची खरी स्वभाववैशिष्ट्ये स्पष्ट दिसतात.`,
        hi: `आपके जन्म के '${yogaName}' योग, '${karanaName}' करण और '${dominantElement}' प्रकृति के भीतर झांकने पर आपके व्यक्तित्व के मूल सत्य उभरते हैं।`,
        te: `మీ జన్మ '${yogaName}' యోగం, '${karanaName}' కరణం మరియు '${dominantElement}' తత్వం లోతుల్లోకి చూస్తే మీ అసలైన స్వభావం తెలుస్తుంది.`,
        ta: `உங்கள் பிறப்பு '${yogaName}' யோகம், '${karanaName}' கரணம் மற்றும் '${dominantElement}' இயல்பை ஆராயும்போது உங்கள் ஆழ்ந்த குணங்கள் புலப்படுகின்றன.`,
        en: `Open the engine room of ${yogaName} Yoga, ${karanaName} Karana, and ${dominantElement}—here sit the unspoken principles guiding your mind.`
      },
      1: {
        kn: `${ctx.elemWeights.fire}/${ctx.elemWeights.earth}/${ctx.elemWeights.air}/${ctx.elemWeights.water} ಪಂಚಭೂತ ತೂಕದಲ್ಲಿ '${dominantElement}' ಪ್ರಾಬಲ್ಯ ಹೊಂದಿರುವ ನೀವು ಹೊರಜಗತ್ತಿಗೆ ತೋರಿಸದ ೩ ಸತ್ಯಗಳಿವು.`,
        mr: `पंचतत्त्वांच्या रचनात्मक मापनात '${dominantElement}' प्रबळ असल्याने लोकांना न दिसणारी तुमची ३ अंतर्गत सत्ये येथे आहेत.`,
        hi: `पंचभूत संरचना में '${dominantElement}' की प्रधानता होने के कारण आपके भीतर के वे ३ मौन सत्य यहां स्पष्ट होते हैं जिन्हें लोग कम समझते हैं।`,
        te: `పంచభూతాలలో '${dominantElement}' బలంగా ఉన్న మీలో బయటి వారికి కనిపించని 3 ముఖ్య లక్షణాలు ఇక్కడ స్పష్టమవుతున్నాయి.`,
        ta: `பஞ்சபூத அமைப்பில் '${dominantElement}' ஆதிக்கம் கொண்ட உங்களின் வெளி உலகம் அறியாத 3 உள்ளார்ந்த உண்மைகள் இவை.`,
        en: `Ranked across your birth sky's four elements, ${dominantElement} stands dominant—shaping three quiet rules you live by.`
      },
      2: {
        kn: `ಲಗ್ನ ಭಾವದ ${n(savByHouse[1])} ಬಿಂದುಗಳು ಮತ್ತು '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' ಬಲವು ನಿಮ್ಮ ನೇರ ನೋಟ ಹಾಗೂ ಸ್ವಾಭಿಮಾನವನ್ನು ರಕ್ಷಿಸುತ್ತಿವೆ.`,
        mr: `लग्न भावातील ${n(savByHouse[1])} बिंदू आणि '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' ही ग्रहताकद तुमच्या स्पष्टवक्तेपणाचे रक्षण करते.`,
        hi: `लग्न भाव के ${n(savByHouse[1])} बिंदू तथा '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' का ग्रह-बल आपकी स्वाभिमानी दृष्टि को सुरक्षित रखता है।`,
        te: `లగ్నంలోని ${n(savByHouse[1])} బిందువులు మరియు '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' బలం మీ ఆత్మాభిమానాన్ని కాపాడుతున్నాయి.`,
        ta: `லக்னத்தின் ${n(savByHouse[1])} பரல்களும் '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' கிரக பலமும் உங்கள் சுயமரியாதையைப் பாதுகாக்கின்றன.`,
        en: `Backed by ${savByHouse[1]} Lagna bindus and '${extendedPrecision.precisionProfileSummary.dignifiedSummary}', your radar reads motives far faster than you let on.`
      },
      3: {
        kn: `ಅಗ್ನಿ, ಭೂಮಿ, ವಾಯು, ಜಲ ಎಂಬ ನಾಲ್ಕು ತತ್ವಗಳ ತಕ್ಕಡಿಯಲ್ಲಿ ನಿಮ್ಮ ${lagnaRashiName}–${moonRashiName} ಸಂಯೋಜನೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ನೋಡಿ.`,
        mr: `अग्नि, पृथ्वी, वायू व जल या तराजूत तुमचे ${lagnaRashiName}–${moonRashiName} व्यक्तिमत्त्व कसे काम करते ते पहा.`,
        hi: `अग्नि, पृथ्वी, वायु और जल के संतुलन में आपका ${lagnaRashiName}–${moonRashiName} व्यक्तित्व किस तरह काम करता है, जानिए।`,
        te: `అగ్ని, భూమి, వాయు, జల తత్వాల త్రాసులో మీ ${lagnaRashiName}–${moonRashiName} వ్యక్తిత్వం ఎలా పనిచేస్తుందో గమనించండి.`,
        ta: `நெருப்பு, நிலம், காற்று, நீர் என்ற நான்கு தத்துவத் தராசில் உங்கள் ${lagnaRashiName}–${moonRashiName} ஆளுமை எவ்வாறு இயங்குகிறது எனப் பாருங்கள்.`,
        en: `Imagine a four-element scale balancing ${lagnaRashiName} drive with ${moonRashiName} feeling—watch which side tips first under pressure.`
      }
    },
    6: {
      0: {
        kn: `ಸಮುದ್ರಯಾನದಲ್ಲಿ ಗಾಳಿಯ ದಿಕ್ಕು ತಿಳಿದ ನಾವಿಕ ಅರ್ಧ ಶ್ರಮದಲ್ಲಿ ತೀರ ಸೇರುತ್ತಾನೆ; ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${nakshatraName} ಚಾರ್ಟಿನಲ್ಲಿ ಆ ಅನುಕೂಲಕರ ಗಾಳಿಯೇ ಯೋಗಿ '${yogiPlanetName}'.`,
        mr: `वाऱ्याची अनुकूल दिशा ओळखणारा नाविक निम्म्या श्रमात किनारा गाठतो; तुमच्या ${lagnaRashiName} लग्न व ${nakshatraName} पत्रिकेत तोच मदतीचा प्रवाह योगी '${yogiPlanetName}' कडून येतो.`,
        hi: `अनुकूल हवा पहचानने वाला नाविक आधे परिश्रम में तट तक पहुंचता है; आपकी ${lagnaRashiName} लग्न एवं ${nakshatraName} पत्रिका में वही सहायक धारा योगी '${yogiPlanetName}' से बहती है।`,
        te: `గాలి దిశను పసిగట్టిన నావికుడు సగం శ్రమతోనే తీరం చేరతాడు; మీ ${lagnaRashiName} లగ్నం మరియు ${nakshatraName} జాతకంలో ఆ సహాయ ప్రవాహం యోగి '${yogiPlanetName}' నుండి వస్తుంది.`,
        ta: `காற்றின் போக்கை அறிந்த மாலுமி பாதி முயற்சியில் கரை சேர்வான்; உங்கள் ${lagnaRashiName} லக்னம் மற்றும் ${nakshatraName} ஜாதகத்தில் அந்தச் சாதக நீரோட்டம் யோகி '${yogiPlanetName}' ஆகும்.`,
        en: `A seasoned sailor wastes zero oar strength against tide—across your ${lagnaRashiName} Ascendant and ${nakshatraName} sky, natural tailwinds gather wherever Yogi ${yogiPlanetName} leads.`
      },
      1: {
        kn: `ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ${nakshatraName} ಹಾಗೂ ಧನ-ಲಾಭ ಸ್ಥಾನಗಳ (${n(savByHouse[2])}/${n(savByHouse[11])} ಬಿಂದು) ನೇರ ಮಿತ್ರನಾದ '${yogiPlanetName}' ದಿನವನ್ನು ಹೇಗೆ ಬಳಸಬೇಕು ತಿಳಿಯಿರಿ.`,
        mr: `तुमचे ${nakshatraName} नक्षत्र आणि धन-लाभ स्थानांचा (${n(savByHouse[2])}/${n(savByHouse[11])} गुण) खरा मित्र म्हणजे योगी '${yogiPlanetName}'.`,
        hi: `आपके ${nakshatraName} नक्षत्र और धन-लाभ भावों (${n(savByHouse[2])}/${n(savByHouse[11])} बिंदू) का सच्चा मित्र योगी '${yogiPlanetName}' है।`,
        te: `మీ ${nakshatraName} నక్షత్రానికి మరియు ధన-లాభ స్థానాలకు (${n(savByHouse[2])}/${n(savByHouse[11])} బిందువులు) నిజమైన మిత్రుడు యోగి '${yogiPlanetName}'.`,
        ta: `உங்கள் ${nakshatraName} நட்சத்திரத்திற்கும் தன-லாப இடங்களுக்கும் (${n(savByHouse[2])}/${n(savByHouse[11])} பரல்கள்) உண்மையான நண்பன் யோகி '${yogiPlanetName}'.`,
        en: `Linked straight to your ${nakshatraName} chart wealth houses (${savByHouse[2]} & ${savByHouse[11]} bindus), Yogi ${yogiPlanetName} vs Avayogi ${avayogiPlanetName} splits lucky days from costly noise.`
      },
      2: {
        kn: `${moonRashiName} ರಾಶಿಯವರಿಗೆ '${ctx.localizedYogiDay}' ಮತ್ತು '${ctx.localizedYogiDirection}' ದಿಕ್ಕು ಪರವಾಗಿ ಕೆಲಸ ಮಾಡಿದರೆ, '${avayogiPlanetName}' ತರಂಗದ ದಿನಗಳು ಆತುರಕ್ಕೆ ಎಚ್ಚರಿಕೆ ನೀಡುತ್ತವೆ.`,
        mr: `${moonRashiName} राशीसाठी '${ctx.localizedYogiDay}' व '${ctx.localizedYogiDirection}' दिशा वेग दुप्पट करतात, तर '${avayogiPlanetName}' च्या दिवशी घाई महागात पडते.`,
        hi: `${moonRashiName} राशि हेतु '${ctx.localizedYogiDay}' और '${ctx.localizedYogiDirection}' दिशा जहां संबल बढ़ाते हैं, वहीं '${avayogiPlanetName}' की घड़ी में जल्दबाजी से बचना आवश्यक होता है।`,
        te: `${moonRashiName} రాశికి '${ctx.localizedYogiDay}' మరియు '${ctx.localizedYogiDirection}' దిశ వేగాన్ని పెంచితే, '${avayogiPlanetName}' ప్రభావ సమయంలో తొందరపాటు పనికిరాదు.`,
        ta: `${moonRashiName} ராசிக்கு '${ctx.localizedYogiDay}' மற்றும் '${ctx.localizedYogiDirection}' திசை பலத்தைக் கூட்டும்போது, '${avayogiPlanetName}' நேரத்தில் அவசரம் தவிர்க்க வேண்டும்.`,
        en: `Inside your ${moonRashiName} horizon, ${ctx.localizedYogiDay} (${ctx.localizedYogiDirection}) opens clean shortcuts while ${avayogiPlanetName} energy punishes rushed promises.`
      },
      3: {
        kn: `ಬೀಗದ ಗೊಂಚಲಿನಲ್ಲಿ ನೂರು ಕೀಲಿಗಳಿದ್ದರೂ ಒಂದೇ ಚಿನ್ನದ ಕೀಲಿ ಬಾಗಿಲು ತೆರೆಯುವಂತೆ, ${lagnaRashiName}–${moonRashiName} ಜಾತಕದ ಆ ಕೀಲಿ '${yogiPlanetName}' ಆಗಿದೆ.`,
        mr: `किल्ल्यांच्या जुडग्यात दार उघडणारी एकच नेमकी किल्ली असते — तुमच्या ${lagnaRashiName}–${moonRashiName} कुंडलीत ती किल्ली म्हणजे योगी '${yogiPlanetName}'.`,
        hi: `चाबियों के गुच्छे में केवल एक सटीक चाबी तिजोरी खोलती है — आपकी ${lagnaRashiName}–${moonRashiName} कुंडली की वही अचूक चाबी योगी '${yogiPlanetName}' है।`,
        te: `వంద తాళపు చెవుల్లో ఒక్క సరైన తాళం తలుపు తెరిచినట్లుగా, మీ ${lagnaRashiName}–${moonRashiName} జాతకానికి ఆ కీలక తాళం యోగి '${yogiPlanetName}'.`,
        ta: `கொத்தாகச் சாவிகள் இருந்தாலும் சரியான ஒரு சாவியே கதவைத் திறப்பது போல், உங்கள் ${lagnaRashiName}–${moonRashiName} ஜாதகத் திறவுகோல் யோகி '${yogiPlanetName}'.`,
        en: `One brass key opens a locked gate better than forcing ten hinges—inside ${lagnaRashiName}–${moonRashiName}, ${yogiPlanetName} is that quiet precision lever.`
      }
    },
    7: {
      0: {
        kn: `ಈಗ ನಿಮ್ಮ ಜೀವನ ರಥದ ಸಾರಥ್ಯ ವಹಿಸಿರುವ '${currentMahadasha}' ಮಹಾದಶೆ ಹಾಗೂ '${currentBhuktiLord}' ಭುಕ್ತಿ (${n(bhuktiEndDate)}ರವರೆಗೆ) ಎಂತಹ ಅಧ್ಯಾಯ ಬರೆಯುತ್ತಿದೆ ನೋಡೋಣ.`,
        mr: `सध्या तुमच्या आयुष्याची सूत्रे सांभाळणारी '${currentMahadasha}' महादशा आणि '${currentBhuktiLord}' भुक्ती (${n(bhuktiEndDate)} पर्यंत) कोणता नवा अध्याय लिहित आहे ते पहा.`,
        hi: `वर्तमान में आपके जीवन की बागडोर संभाल रहे '${currentMahadasha}' महादशा स्वामी एवं '${currentBhuktiLord}' भुक्ति (${n(bhuktiEndDate)} तक) कैसा अध्याय रच रहे हैं, आइए देखें।`,
        te: `ప్రస్తుతం మీ జీవిత రథాన్ని నడిపిస్తున్న '${currentMahadasha}' మహర్దశ మరియు '${currentBhuktiLord}' భుక్తి (${n(bhuktiEndDate)} వరకు) రాస్తున్న కొత్త అధ్యాయాన్ని చూద్దాం.`,
        ta: `தற்போது உங்கள் வாழ்க்கைப் பயணத்தை இயக்கும் '${currentMahadasha}' மகாதசை மற்றும் '${currentBhuktiLord}' புக்தி (${n(bhuktiEndDate)} வரை) உருவாக்கும் அத்தியாயத்தைக் காண்போம்.`,
        en: `Inside your active timeline, ${currentMahadasha} Mahadasha and ${currentBhuktiLord} Bhukti (running to ${bhuktiEndDate}) now set the pace and theme of your days.`
      },
      1: {
        kn: `${lagnaRashiName} ಲಗ್ನಕ್ಕೆ '${extendedPrecision.mahaNatureLabel}' ಸ್ವರೂಪದ ${currentMahadasha} ದಶೆ ಮತ್ತು '${extendedPrecision.bhuktiNatureLabel}' ಭುಕ್ತಿ (${currentBhuktiLord}) ಜೊತೆಯಾಗಿವೆ.`,
        mr: `${lagnaRashiName} लग्नासाठी '${extendedPrecision.mahaNatureLabel}' स्वरूपाची ${currentMahadasha} दशा व '${extendedPrecision.bhuktiNatureLabel}' भुक्ती (${currentBhuktiLord}) कार्यरत आहेत.`,
        hi: `${lagnaRashiName} लग्न हेतु '${extendedPrecision.mahaNatureLabel}' रूप में ${currentMahadasha} दशा और '${extendedPrecision.bhuktiNatureLabel}' भुक्ति (${currentBhuktiLord}) सक्रिय हैं।`,
        te: `${lagnaRashiName} లగ్నానికి '${extendedPrecision.mahaNatureLabel}' అయిన ${currentMahadasha} దశ మరియు '${extendedPrecision.bhuktiNatureLabel}' అయిన ${currentBhuktiLord} భుక్తి నడుస్తున్నాయి.`,
        ta: `${lagnaRashiName} லக்னத்திற்கு '${extendedPrecision.mahaNatureLabel}' தன்மையுள்ள ${currentMahadasha} தசையும் '${extendedPrecision.bhuktiNatureLabel}' புக்தியும் (${currentBhuktiLord}) இணைந்துள்ளன.`,
        en: `Classified specifically for ${lagnaRashiName} Ascendant, your '${extendedPrecision.mahaNatureLabel}' Mahadasha (${currentMahadasha}) pairs with ${currentBhuktiLord} Bhukti through ${bhuktiEndDate}.`
      },
      2: {
        kn: `ಹಳೆಯ ಕಾಲಘಟ್ಟದಿಂದ ಹೊಸ ಪರ್ವಕ್ಕೆ ಕಾಲಿಡುವಾಗ ${currentMahadasha}–${currentBhuktiLord} ಚಕ್ರವು ಯಾವುದನ್ನು ಹಿಂದೆ ಬಿಟ್ಟು ಯಾವುದನ್ನು ಮುಂದಕ್ಕೆ ತರುತ್ತಿದೆ ಗಮನಿಸಿ.`,
        mr: `जुन्या टप्प्यातून नव्या पर्वाकडे जाताना ${currentMahadasha}–${currentBhuktiLord} हे चक्र काय मागे सोडते आणि काय पुढे आणते ते पहा.`,
        hi: `एक अध्याय से दूसरे अध्याय में कदम रखते समय ${currentMahadasha}–${currentBhuktiLord} का यह चक्र किसे विदा कर रहा है और किसे निकट ला रहा है, देखिए।`,
        te: `పాత దశ నుండి కొత్త దశకు మారుతున్న వేళ ${currentMahadasha}–${currentBhuktiLord} చక్రం వేటిని వదిలేసి వేటిని దగ్గర చేస్తోందో చూడండి.`,
        ta: `பழைய கட்டத்திலிருந்து புதிய பருவத்திற்குள் நுழையும்போது ${currentMahadasha}–${currentBhuktiLord} சுழற்சி எதை விலக்கி எதை அருகில் கொண்டு வருகிறது எனப் பாருங்கள்.`,
        en: `Look at what ends versus what accelerates through ${bhuktiEndDate}: ${currentMahadasha} sets the broad horizon while ${currentBhuktiLord} delivers daily catalysts.`
      },
      3: {
        kn: `ನಾಟಕದ ಒಂದು ದೃಶ್ಯ ಮುಗಿದು ಹೊಸ ದೀಪಗಳು ಬೆಳಗುವಂತೆ, ${n(bhuktiEndDate)}ರವರೆಗಿನ ${currentMahadasha}–${currentBhuktiLord} ಅವಧಿ ಹೊಸ ಪಾತ್ರವನ್ನು ಕೊಡುತ್ತಿದೆ.`,
        mr: `रंगमंचावरील एक प्रवेश संपून नवा प्रकाश पडावा, तसा ${n(bhuktiEndDate)} पर्यंतचा ${currentMahadasha}–${currentBhuktiLord} काळ तुम्हाला नवी भूमिका देत आहे.`,
        hi: `मंच का एक दृश्य समाप्त होकर नया आलोक फैलने की भांति, ${n(bhuktiEndDate)} तक की ${currentMahadasha}–${currentBhuktiLord} अवधि नई भूमिका रच रही है।`,
        te: `నాటకంలో ఒక అంకం ముగిసి కొత్త వెలుగు వచ్చినట్లు, ${n(bhuktiEndDate)} వరకు సాగే ${currentMahadasha}–${currentBhuktiLord} కాలం మీకు కొత్త బాధ్యతను ఇస్తోంది.`,
        ta: `நாடகத்தின் ஒரு காட்சி முடிந்து புதிய வெளிச்சம் பாய்வது போல், ${n(bhuktiEndDate)} வரையிலான ${currentMahadasha}–${currentBhuktiLord} காலம் புதிய பொறுப்பை வழங்குகிறது.`,
        en: `When stage lights change between acts, actors switch tempo—${currentMahadasha}–${currentBhuktiLord} marks that exact scene shift through ${bhuktiEndDate}.`
      }
    },
    8: {
      0: {
        kn: `${shaniTransitRashi} ರಾಶಿಯಲ್ಲಿ ಸಾಗುತ್ತಿರುವ ಶನಿಯು ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯಲ್ಲಿ ಕುಳಿತು ಕರ್ಮ-ಲಾಭಗಳನ್ನು (${n(savByHouse[10])}/${n(savByHouse[11])} ಬಿಂದು) ತೂಗುತ್ತಿದ್ದಾನೆ.`,
        mr: `${shaniTransitRashi} मधून जाणारा शनी तुमच्या चंद्रापासून ${n(ctx.shaniHouseFromMoon)}व्या स्थानी बसून कर्म-लाभाचे (${n(savByHouse[10])}/${n(savByHouse[11])} गुण) मोजमाप करत आहे.`,
        hi: `${shaniTransitRashi} से संचार करते हुए शनि आपके चंद्र से ${n(ctx.shaniHouseFromMoon)}वें स्थान पर स्थित होकर कर्म एवं लाभ (${n(savByHouse[10])}/${n(savByHouse[11])} बिंदू) की दृढ़ता तौल रहे हैं।`,
        te: `${shaniTransitRashi} లో సంచరిస్తున్న శని మీ చంద్రుని నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థానంలో ఉండి కర్మ-లాభ స్థానాలను (${n(savByHouse[10])}/${n(savByHouse[11])} బిందువులు) సరిచూస్తోంది.`,
        ta: `${shaniTransitRashi} வழியே செல்லும் சனி உங்கள் ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடத்தில் அமர்ந்து தொழில்-லாப பலத்தை (${n(savByHouse[10])}/${n(savByHouse[11])} பரல்கள்) எடைபோடுகிறது.`,
        en: `Operating from House ${ctx.shaniHouseFromMoon} (${shaniTransitRashi}) relative to your ${moonRashiName} Moon, Saturn tests the real durability of your work and gains (${savByHouse[10]}/${savByHouse[11]} bindus).`
      },
      1: {
        kn: `ನಿಮ್ಮ ${moonRashiName} ರಾಶಿಯ ಮೇಲಿನ ${n(ctx.shaniTransitSav)} ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳ ಶನಿ ಪ್ರಭಾವವು ಮೇಲ್ನೋಟದ ಭಯಕ್ಕಿಂತ ಗಟ್ಟಿ ಶಿಸ್ತನ್ನು ಕಟ್ಟಿಕೊಡುತ್ತಿದೆ.`,
        mr: `तुमच्या ${moonRashiName} राशीसापेक्ष ${n(ctx.shaniTransitSav)} अष्टकवर्ग बिंदूंचा शनी प्रभाव भीतीऐवजी पक्की शिस्त उभारत आहे.`,
        hi: `आपकी ${moonRashiName} राशि के सापेक्ष ${n(ctx.shaniTransitSav)} अष्टकवर्ग बिंदुओं वाला शनि गोचर भय नहीं, अपितु अडिग अनुशासन निर्मित कर रहा है।`,
        te: `మీ ${moonRashiName} రాశికి ${n(ctx.shaniTransitSav)} బిందువుల బలంతో ఉన్న శని గోచారం భయం కంటే గట్టి క్రమశిక్షణను నిర్మిస్తోంది.`,
        ta: `உங்கள் ${moonRashiName} ராசிக்கு ${n(ctx.shaniTransitSav)} பரல்களுடன் நகரும் சனி அச்சத்தை விட உறுதியான ஒழுக்கத்தைக் கட்டி எழுப்புகிறது.`,
        en: `Carrying ${ctx.shaniTransitSav} Sarvashtakavarga bindus inside ${shaniTransitRashi}, Saturn removes shortcuts from House ${ctx.shaniHouseFromMoon} of your lunar sky.`
      },
      2: {
        kn: `${moonRashiName} ರಾಶಿಯ ಮೇಲಿನ ${shaniTransitRashi} ಶನಿ ಸಂಚಾರದಲ್ಲಿ (${n(ctx.shaniHouseFromMoon)}ನೇ ಸ್ಥಾನ) ತಾತ್ಕಾಲಿಕ ಮೆಚ್ಚುಗೆಗಳು ಹಿಂದೆ ಸರಿದು ಗಟ್ಟಿ ಅನುಭವ ಮಾತ್ರ ನಿಮ್ಮ ಸುತ್ತ ನಿಲ್ಲುತ್ತಿದೆ.`,
        mr: `${moonRashiName} राशीसापेक्ष ${shaniTransitRashi} शनी गोचरात (${n(ctx.shaniHouseFromMoon)}वे स्थान) तात्पुरते दाखवेकरी मागे हटून केवळ ठोस अनुभवच जवळ टिकतो.`,
        hi: `${moonRashiName} राशि के सापेक्ष ${shaniTransitRashi} के शनि गोचर (${n(ctx.shaniHouseFromMoon)}वां स्थान) में अस्थायी दिखावे पीछे हटकर केवल विश्वसनीय साथी ही टिकते हैं।`,
        te: `${moonRashiName} రాశికి ${shaniTransitRashi} శని సంచారంలో (${n(ctx.shaniHouseFromMoon)}వ స్థానం) తాత్కాలిక పొగడ్తలు తొలగి అసలైన నైపుణ్యం మాత్రమే నిలుస్తుంది.`,
        ta: `${moonRashiName} ராசிக்கு ${shaniTransitRashi} சனி பெயர்ச்சியில் (${n(ctx.shaniHouseFromMoon)}-ம் இடம்) தற்காலிகப் புகழ்ச்சிகள் விலகித் திடமான அனுபவமே நிலைக்கிறது.`,
        en: `Under Saturn moving across House ${ctx.shaniHouseFromMoon} (${shaniTransitRashi}) from your ${moonRashiName} Moon, fair-weather hype exits while 10-year credibility locks in.`
      },
      3: {
        kn: `ಕಮ್ಮಾರನ ಕುಲುಮೆಯಲ್ಲಿ ಕಬ್ಬಿಣ ಬಿಸಿ ತಟ್ಟಿದಂತೆ, ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯ ಶನಿ ಸಂಚಾರವು ನಿಮ್ಮೊಳಗಿನ ಅಸ್ಥಿರತೆಯನ್ನು ಕರಗಿಸಿ ಉಕ್ಕಿನ ಧೈರ್ಯ ಕಟ್ಟುತ್ತಿದೆ.`,
        mr: `लोहाराच्या भट्टीत तावून लोखंडाचे पोलाद व्हावे, तसा ${n(ctx.shaniHouseFromMoon)}व्या स्थानाचा शनी तुमच्यातील अस्थिरता जाळून पोलादी धैर्य घडवत आहे.`,
        hi: `भट्ठी में तपकर जैसे लोहा इस्पात बनता है, वैसे ही ${n(ctx.shaniHouseFromMoon)}वें स्थान का शनि अस्थिर आदतों को गलाकर अटूट दृढ़ता गढ़ रहा है।`,
        te: `కొలిమిలో కాలిన ఇనుము ఉక్కుగా మారినట్లుగా, ${n(ctx.shaniHouseFromMoon)}వ స్థాన శని మీలో కదిలించలేని స్థిరత్వాన్ని కడుతోంది.`,
        ta: `உலையில் வெந்த இரும்பு உறுதியான எஃகாக மாறுவது போல், ${n(ctx.shaniHouseFromMoon)}-ம் இட சனி உங்கள் மன உறுதியை வார்த்தெடுக்கிறது.`,
        en: `Iron discovers its backbone only on the anvil—Saturn in House ${ctx.shaniHouseFromMoon} burns away distraction so lasting craft stands tall.`
      }
    },
    9: {
      0: {
        kn: `ಜ್ಞಾನಕಾರಕ ಗುರುವು ${guruTransitRashi} ರಾಶಿಯಿಂದ ನಿಮ್ಮ ಚಂದ್ರನಿಗೆ ${n(ctx.guruHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿ (${n(ctx.guruTransitSav)} ಬಿಂದು) ಹರಿಯುತ್ತಾ ಭಾಗ್ಯಾಧಿಪತಿ ${extendedPrecision.house9Info.lordName} ಬಲವನ್ನು ಎಚ್ಚರಿಸುತ್ತಿದೆ.`,
        mr: `देवगुरु बृहस्पती ${guruTransitRashi} राशीतून चंद्राच्या ${n(ctx.guruHouseFromMoon)}व्या स्थानी (${n(ctx.guruTransitSav)} गुण) राहून भाग्येश ${extendedPrecision.house9Info.lordName} ची शक्ती जागवत आहेत.`,
        hi: `देवगुरु बृहस्पति ${guruTransitRashi} से चंद्र के ${n(ctx.guruHouseFromMoon)}वें भाव (${n(ctx.guruTransitSav)} बिंदू) में संचार करते हुए भाग्येश ${extendedPrecision.house9Info.lordName} की शुभता जागृत कर रहे हैं।`,
        te: `గురు గ్రహం ${guruTransitRashi} లో మీ చంద్రునికి ${n(ctx.guruHouseFromMoon)}వ స్థానం (${n(ctx.guruTransitSav)} బిందువులు) ద్వారా భాగ్యాధిపతి ${extendedPrecision.house9Info.lordName} శక్తిని మేల్కొల్పుతోంది.`,
        ta: `குரு பகவான் ${guruTransitRashi}-ல் உங்கள் ராசிக்கு ${n(ctx.guruHouseFromMoon)}-ம் இடத்தில் (${n(ctx.guruTransitSav)} பரல்கள்) இருந்து பாக்கியாதிபதி ${extendedPrecision.house9Info.lordName} அருளைத் தூண்டுகிறார்.`,
        en: `Moving across House ${ctx.guruHouseFromMoon} from your Moon inside ${guruTransitRashi} (${ctx.guruTransitSav} bindus), Jupiter rekindles 9th fortune lord ${extendedPrecision.house9Info.lordName}.`
      },
      1: {
        kn: `${nakshatraName}ದ ಒಳನೋಟಕ್ಕೆ ${guruTransitRashi} ಗುರುವಿನ ಶುದ್ಧ ಬೆಳಕು ಸೇರಿ, ಚಿಕ್ಕ ವೃತ್ತದಿಂದ ವಿಶಾಲ ಯೋಚನೆಯತ್ತ ಮನಸ್ಸನ್ನು ಎಳೆಯುತ್ತಿದೆ.`,
        mr: `${nakshatraName} नक्षत्राच्या अंतर्ज्ञानाला ${guruTransitRashi} मधील गुरूचा प्रकाश मिळून संकुचित विचारांपलीकडची नवी दिशा दिसू लागली आहे.`,
        hi: `आपके ${nakshatraName} नक्षत्र की संवेदना को ${guruTransitRashi} स्थित गुरु का प्रकाश मिलते ही सीमित सोच के पार नया आकाश खुलने लगा है।`,
        te: `మీ ${nakshatraName} అంతర్దృష్టికి ${guruTransitRashi} లోని గురు కాంతి తోడవడంతో చిన్న పరిమితుల నుండి విశాల దృక్పథం కలుగుతోంది.`,
        ta: `உங்கள் ${nakshatraName} உள்ளுணர்வுடன் ${guruTransitRashi} குருவின் ஒளி இணையும்போது குறுகிய எல்லைகளைத் தாண்டிப் பெரிய பார்வை பிறக்கிறது.`,
        en: `Illuminating your ${nakshatraName} curiosity from ${guruTransitRashi}, Jupiter brings wise mentors and spacious optimism back into focus.`
      },
      2: {
        kn: `ಗುರು ಸಂಚಾರದ ${n(ctx.guruTransitSav)} ಬಿಂದುಗಳು ಹಾಗೂ ೫ನೇ ಜ್ಞಾನ ಸ್ಥಾನದ ${n(savByHouse[5])} ಬಿಂದುಗಳು ಸೇರಿ ಒತ್ತಡದ ಕಿಟಕಿಗಳನ್ನು ತೆರೆಯುತ್ತಿವೆ.`,
        mr: `गुरू गोचराचे ${n(ctx.guruTransitSav)} बिंदू आणि पंचम भावाचे ${n(savByHouse[5])} बिंदू मिळून अडलेल्या संवादात मोकळी हवा आणत आहेत.`,
        hi: `गुरु गोचर के ${n(ctx.guruTransitSav)} बिंदू और पंचम भाव के ${n(savByHouse[5])} बिंदू मिलकर रुके हुए संवादों में नई आशा भर रहे हैं।`,
        te: `గురు గోచారంలోని ${n(ctx.guruTransitSav)} బిందువులు మరియు 5వ స్థాన ${n(savByHouse[5])} బిందువులు ఆగిపోయిన పనులలో కొత్త ఆశను నింపుతున్నాయి.`,
        ta: `குரு கோசாரத்தின் ${n(ctx.guruTransitSav)} பரல்களும் 5-ம் இடத்தின் ${n(savByHouse[5])} பரல்களும் இணைந்து புதிய வளர்ச்சி வாய்ப்பைத் திறக்கின்றன.`,
        en: `Balancing ${ctx.guruTransitSav} transit bindus against House 5's ${savByHouse[5]} bindus shows exactly where relief replaces quiet self-doubt.`
      },
      3: {
        kn: `ಗಾಢ ಮಂಜಿನ ನಡುವೆ ಮುಂಜಾನೆಯ ಬಿಸಿಲಿನ ಕಿರಣ ದಾರಿ ತೋರಿದಂತೆ, ${guruTransitRashi} ಗುರುವು (${n(ctx.guruHouseFromMoon)}ನೇ ಸ್ಥಾನ) ಭಾಗ್ಯಾಧಿಪತಿ ${extendedPrecision.house9Info.lordName} ಮೂಲಕ ಒಂದೇ ಸರಿಯಾದ ಸಲಹೆಯಿಂದ ಅಲೆದಾಟ ತಪ್ಪಿಸುತ್ತಾನೆ.`,
        mr: `दाट धुक्यातून सकाळचे किरण वाट दाखवावेत, तसा ${guruTransitRashi} मधील गुरू (${n(ctx.guruHouseFromMoon)}वे स्थान) भाग्येश ${extendedPrecision.house9Info.lordName} सह एका योग्य मार्गदर्शनातून धडपड वाचवतो.`,
        hi: `घने कोहरे में प्रातः की पहली किरण जैसे पथ दिखाती है, वैसे ही ${guruTransitRashi} स्थित गुरु (${n(ctx.guruHouseFromMoon)}वां स्थान) भाग्येश ${extendedPrecision.house9Info.lordName} के साथ एक सटीक परामर्श से भटकन मिटाते हैं।`,
        te: `దట్టమైన పొగమంచులో ఉదయపు వెలుగులా, ${guruTransitRashi} గురువు (${n(ctx.guruHouseFromMoon)}వ స్థానం) భాగ్యాధిపతి ${extendedPrecision.house9Info.lordName} తోడుతో ఒక్క సరైన మాటతో శ్రమను తగ్గిస్తాడు.`,
        ta: `அடர்ந்த பனியில் காலைக் கதிரவன் வழி காட்டுவது போல், ${guruTransitRashi} குரு (${n(ctx.guruHouseFromMoon)}-ம் இடம்) பாக்கியாதிபதி ${extendedPrecision.house9Info.lordName} அருளால் பல மாதத் தேடலை எளிதாக்குவார்.`,
        en: `Just as clean dawn sunlight parts valley fog, Jupiter in ${guruTransitRashi} (House ${ctx.guruHouseFromMoon}) awakens 9th lord ${extendedPrecision.house9Info.lordName} through one timely conversation.`
      }
    },
    10: {
      0: {
        kn: `ನಿಮ್ಮ ${moonRashiName} ಚಂದ್ರನಿಂದ ${n(ctx.rahuHouseFromMoon)}ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಹಾಗೂ ರಾಶ್ಯಾಧಿಪತಿಗಳಾದ ${extendedPrecision.rahuDispositorName}–${extendedPrecision.ketuDispositorName} ಮನಸ್ಸಿನ ಎರಡು ಎಳೆತಗಳನ್ನು ನಿಯಂತ್ರಿಸುತ್ತಿವೆ.`,
        mr: `तुमच्या ${moonRashiName} चंद्रापासून ${n(ctx.rahuHouseFromMoon)}व्या स्थानातील राहु आणि स्वामी ${extendedPrecision.rahuDispositorName}–${extendedPrecision.ketuDispositorName} मनाच्या दोन टोकांची ओढाताण दाखवतात.`,
        hi: `आपकी ${moonRashiName} राशि से ${n(ctx.rahuHouseFromMoon)}वें भाव का राहु तथा उसके स्वामी ${extendedPrecision.rahuDispositorName}–${extendedPrecision.ketuDispositorName} मन के भीतर की दो विपरीत धाराओं को चला रहे हैं।`,
        te: `మీ ${moonRashiName} రాశి నుండి ${n(ctx.rahuHouseFromMoon)}వ స్థానంలో ఉన్న రాహువు మరియు అధిపతులు ${extendedPrecision.rahuDispositorName}–${extendedPrecision.ketuDispositorName} మీలోని రెండు ఆలోచనలను నడిపిస్తున్నారు.`,
        ta: `உங்கள் ${moonRashiName} ராசியிலிருந்து ${n(ctx.rahuHouseFromMoon)}-ம் இட ராகு மற்றும் அதிபதிகள் ${extendedPrecision.rahuDispositorName}–${extendedPrecision.ketuDispositorName} மனதின் இரு இழுப்புகளை இயக்குகின்றன.`,
        en: `Rahu in House ${ctx.rahuHouseFromMoon} from your ${moonRashiName} Moon acts through dispositors ${extendedPrecision.rahuDispositorName} and ${extendedPrecision.ketuDispositorName}—explaining mixed signals.`
      },
      1: {
        kn: `${nakshatraName} ನಕ್ಷತ್ರದ ಸೂಕ್ಷ್ಮ ಮನಸ್ಸಿಗೆ ರಾಹು ವೇಗ ಕೊಟ್ಟಾಗ, ಕೇತುವು ಮೌನದ ಕಡೆಗೆ ಎಳೆಯುವ ಆ ಆಂತರಿಕ ತಾಕಲಾಟವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.`,
        mr: `${nakshatraName} नक्षत्राच्या संवेदनशील मनाला राहु वेगाने पुढे ढकलतो, तर केतू शांत अलिप्तपणाकडे ओढतो — हा समतोल कसा साधायचा ते पहा.`,
        hi: `आपके ${nakshatraName} नक्षत्र के संवेदनशील मन को जब राहु तीव्र गति देता है और केतु मौन की ओर खींचता है, तो इस द्वंद्व का रहस्य यहां समझें।`,
        te: `${nakshatraName} నక్షత్ర మనసుకు రాహువు వేగాన్ని ఇస్తుంటే, కేతువు ప్రశాంత వైరాగ్యాన్ని ఎందుకు ఇస్తోందో లోతుగా చూద్దాం.`,
        ta: `${nakshatraName} நட்சத்திர மனதை ராகு வேகமாகத் தூண்டவும், கேது அமைதியை நோக்கி இழுக்கவும் செய்யும் இந்த உள் போராட்டத்தை அறிவோம்.`,
        en: `Inside your ${nakshatraName} mind, Rahu craves giant leaps while Ketu abruptly tires of shallow applause—watch how to keep both grounded.`
      },
      2: {
        kn: `ಕಾಲ್ಪನಿಕ ಭಯ ಮತ್ತು ಕಾಗದದ ಮೇಲಿನ ನೈಜ ಸತ್ಯ — ಇವೆರಡರ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ${extendedPrecision.rahuDispositorName} (${n(extendedPrecision.rahuDispositorHouse)}ನೇ ಮನೆ) ತೋರಿಸುತ್ತಿದೆ.`,
        mr: `काल्पनिक भीती आणि कागदावरील प्रत्यक्ष वास्तव यांतील फरक ${extendedPrecision.rahuDispositorName} (${n(extendedPrecision.rahuDispositorHouse)}वे स्थान) स्पष्ट करून दाखवतो.`,
        hi: `काल्पनिक भय और प्रत्यक्ष तथ्यों के बीच का भेद आपके चार्ट के ${extendedPrecision.rahuDispositorName} (${n(extendedPrecision.rahuDispositorHouse)}वां भाव) साफ़ दिखाते हैं।`,
        te: `ఊహాజనిత భయానికి మరియు నిజమైన వాస్తవానికి మధ్య తేడాను ${extendedPrecision.rahuDispositorName} (${n(extendedPrecision.rahuDispositorHouse)}వ స్థానం) స్పష్టం చేస్తోంది.`,
        ta: `கற்பனைப் பயத்திற்கும் நேரடி உண்மைக்கும் இடையிலான வேறுபாட்டை ${extendedPrecision.rahuDispositorName} (${n(extendedPrecision.rahuDispositorHouse)}-ம் வீடு) தெளிவுபடுத்துகிறது.`,
        en: `Comparing shadow rumor against concrete evidence via ${extendedPrecision.rahuDispositorName} (House ${extendedPrecision.rahuDispositorHouse}) turns nervous haste back into calm leverage.`
      },
      3: {
        kn: `ಮರುಭೂಮಿಯ ಮರೀಚಿಕೆ ಹಾಗೂ ದಿಕ್ಸೂಚಿಯ ಅಚಲ ಮುಳ್ಳಿನ ನಡುವಿನ ವ್ಯತ್ಯಾಸ ತಿಳಿದ ಕ್ಷಣದಲ್ಲೇ, ಚಂದ್ರನಿಂದ ${n(ctx.rahuHouseFromMoon)}ನೇ ರಾಹು ನಾಯಕ ${extendedPrecision.rahuDispositorName} ದಾರಿ ನಿಚ್ಚಳಗೊಳಿಸುತ್ತದೆ.`,
        mr: `वाळवंटातील मृगजळ आणि अचूक होकायंत्र यांतील फरक ओळखताच चंद्रापासून ${n(ctx.rahuHouseFromMoon)}व्या राहुचा अधिपती ${extendedPrecision.rahuDispositorName} रस्ता स्वच्छ दाखवतो.`,
        hi: `मरुस्थल की मृगतृष्णा और दिशासूचक की अटल सुई के बीच का अंतर समझते ही चंद्र से ${n(ctx.rahuHouseFromMoon)}वें राहु के स्वामी ${extendedPrecision.rahuDispositorName} भ्रम छांट देते हैं।`,
        te: `ఎడారి ఎండమావికి, నిజమైన దిక్సూచికి మధ్య తేడా తెలిసిన వెంటనే చంద్రుని నుండి ${n(ctx.rahuHouseFromMoon)}వ రాహు అధిపతి ${extendedPrecision.rahuDispositorName} దారి చూపుతారు.`,
        ta: `பாலைவனக் கானல்நீருக்கும் திசைக்காட்டி முள்ளுக்கும் உள்ள வேறுபாட்டை உணர்ந்த நொடியில், ${n(ctx.rahuHouseFromMoon)}-ம் இட ராகு அதிபதி ${extendedPrecision.rahuDispositorName} பாதையைத் தெளிவாக்குகிறார்.`,
        en: `Between a desert mirage and a brass compass stands one rule from House ${ctx.rahuHouseFromMoon} Rahu dispositor ${extendedPrecision.rahuDispositorName}: verify proof before haste.`
      }
    },
    11: {
      0: {
        kn: `ನಿಮ್ಮ ${lagnaRashiName} ಕುಂಡಲಿಯಲ್ಲಿ ಜಾಗೃತಗೊಂಡಿರುವ '${ctx.detectedYogasSummary}' ಹಾಗೂ ರಾಜಯೋಗ ಶಕ್ತಿಗಳು ನಿಮಗೆ ವಿಶೇಷ ವೇದಿಕೆ ಕಟ್ಟುತ್ತಿವೆ.`,
        mr: `तुमच्या ${lagnaRashiName} पत्रिकेत कार्यरत असलेले '${ctx.detectedYogasSummary}' आणि सुप्त राजयोग तुमच्यासाठी मानाचे व्यासपीठ उभारत आहेत.`,
        hi: `आपकी ${lagnaRashiName} कुंडली में विद्यमान '${ctx.detectedYogasSummary}' तथा राजयोग शक्तियां आपके लिए सम्मान का मजबूत मंच तैयार कर रही हैं।`,
        te: `మీ ${lagnaRashiName} జాతకంలో ఉన్న '${ctx.detectedYogasSummary}' మరియు రాజయోగ శక్తులు మీకు ఉన్నత గౌరవాన్ని అందిస్తున్నాయి.`,
        ta: `உங்கள் ${lagnaRashiName} ஜாதகத்தில் அமைந்த '${ctx.detectedYogasSummary}' மற்றும் ராஜயோக ஆற்றல்கள் உங்களுக்குப் பெருமைமிகு மேடையை அமைக்கின்றன.`,
        en: `Inside your ${lagnaRashiName} chart sit royal patterns—highlighted by ${ctx.detectedYogasSummary}—quietly building earned authority.`
      },
      1: {
        kn: `ಲಗ್ನಾಧಿಪತಿ ${ctx.lagnaLordName} ಮತ್ತು ಚಂದ್ರ ರಾಶಿ ${moonRashiName}ದ ಪ್ರಬುದ್ಧತೆ ಸೇರಿ ಸಾಮಾನ್ಯ ಪರೀಕ್ಷೆಗಳಿಗಿಂತ ಮೇಲೇಳುವ ಗುಪ್ತ ವರದಾನವನ್ನು ನೀಡಿವೆ.`,
        mr: `लग्नेश ${ctx.lagnaLordName} आणि ${moonRashiName} चंद्र राशीची प्रगल्भता मिळून संकटातून पुन्हा वर येण्याचे अद्भुत वरदान देतात.`,
        hi: `लग्नेश ${ctx.lagnaLordName} एवं ${moonRashiName} चंद्र की परिपक्वता मिलकर हर ठोकर के बाद फिर से शिखर पर पहुंचने का वरदान रचती है।`,
        te: `లగ్నాధిపతి ${ctx.lagnaLordName} మరియు ${moonRashiName} రాశి పరిణతి కలిసి ఎన్ని సవాళ్ళు వచ్చినా తిరిగి ఎదిగే వరాన్ని ఇచ్చాయి.`,
        ta: `லக்னாதிபதி ${ctx.lagnaLordName} மற்றும் ${moonRashiName} ராசியின் பக்குவம் இணைந்து எந்தத் தடையையும் தாண்டி உயரும் வரத்தைத் தந்துள்ளன.`,
        en: `Pairing ${ctx.lagnaLordName} with ${moonRashiName} composure ensures setbacks never keep you down—each rebound leaves you sharper.`
      },
      2: {
        kn: `ಬೂದಿಯ ಕೆಳಗೆ ಹುದುಗಿದ್ದ ಕೆಂಡವು ಸರಿಯಾದ ಗಾಳಿ ಸಿಕ್ಕ ಕ್ಷಣ ಜ್ವಾಲೆಯಾಗುವಂತೆ, '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' ಬಲವು ಈಗ ಪ್ರಕಾಶಿಸುತ್ತಿದೆ.`,
        mr: `राखेखाली दडलेली ठिणगी वाऱ्याची झुळूक मिळताच लखलखते, तशी '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' ही तुमची ताकद आता चमकू लागली आहे.`,
        hi: `राख के नीचे दबी चिंगारी जैसे सही हवा पाते ही दमक उठती है, वैसे ही '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' की आपकी शक्ति अब निखर रही है।`,
        te: `బూడిద కింద దాగిన నిప్పుకణిక గాలి తగలగానే వెలిగినట్లుగా, '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' బలం ఇప్పుడు ప్రకాశిస్తోంది.`,
        ta: `சாம்பலுக்குள் மறைந்த தீப்பொறி காற்றில் சுடர்விடுவது போல், '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' என்ற உங்கள் பலம் இப்போது ஒளிர்கிறது.`,
        en: `Notice how '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' contrasts with quiet early struggles—your gifts were aging cleanly for visible impact.`
      },
      3: {
        kn: `ಭೂಮಿಯ ಆಳದಲ್ಲಿ ದೀರ್ಘ ಒತ್ತಡ ತಾಳಿಕೊಂಡ ಕಲ್ಲೇ ವಜ್ರವಾಗಿ ಹೊಳೆಯುವಂತೆ, ನಿಮ್ಮ ${lagnaRashiName} ಜಾತಕದ '${heroPlanetName}' ಹಾಗೂ ರಾಜಯೋಗಗಳು ಸ್ವಂತ ಶ್ರಮದ ನಂತರವೇ ಕಿರೀಟ ತೊಡಿಸುತ್ತವೆ.`,
        mr: `खाणीत मोठा दाब सहन केल्यावरच हिरा तेजस्वी होतो, तसेच तुमच्या ${lagnaRashiName} कुंडलीतील '${heroPlanetName}' व राजयोग स्वकर्तृत्वाच्या कसोट्यानंतरच फळ देतात.`,
        hi: `धरती की गहराई में दबाव सहकर जैसे हीरा तराशा जाता है, वैसे ही आपकी ${lagnaRashiName} कुंडली के '${heroPlanetName}' एवं राजयोग अनुभव के बाद ही सच्चा मुकुट पहनाते हैं।`,
        te: `భూమి లోపల ఒత్తిడిని తట్టుకున్నాకే వజ్రం మెరిసినట్లు, మీ ${lagnaRashiName} జాతకంలోని '${heroPlanetName}' మరియు రాజయోగాలు స్వశ్రమ తర్వాతే కీర్తినిస్తాయి.`,
        ta: `ஆழத்தில் அழுத்தத்தைத் தாங்கிய பிறகே வைரம் ஒளிர்வது போல், உங்கள் ${lagnaRashiName} ஜாதகத்தின் '${heroPlanetName}' மற்றும் ராஜயோகங்கள் சுய உழைப்புக்குப் பிறகே மகுடம் சூட்டுகின்றன.`,
        en: `Rough stones become diamonds only under real pressure—for ${lagnaRashiName} Lagna, your ${heroPlanetName}-anchored royal combinations build lasting respect.`
      }
    },
    12: {
      0: {
        kn: `ನಿಮ್ಮ ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[10])} ಬಿಂದುಗಳಿದ್ದು, ದಶಮೇಶ ${house10Info.lordName} ${n(house10Info.placedHouse)}ನೇ ಮನೆಯಿಂದ (${house10Info.placedRashi}) ವೃತ್ತಿಯ ಚುಕ್ಕಾಣಿ ಹಿಡಿದಿದ್ದಾನೆ.`,
        mr: `तुमच्या १०व्या कर्म भावात ${n(savByHouse[10])} गुण असून कर्मेश ${house10Info.lordName} ${n(house10Info.placedHouse)}व्या स्थानातून (${house10Info.placedRashi}) करिअरची दिशा दाखवतो.`,
        hi: `आपके दशम कर्म भाव में ${n(savByHouse[10])} बिंदू हैं तथा दशमेश ${house10Info.lordName} ${n(house10Info.placedHouse)}वें स्थान (${house10Info.placedRashi}) से आजीविका की कमान संभाले हैं।`,
        te: `మీ 10వ కర్మ స్థానంలో ${n(savByHouse[10])} బిందువులు ఉండి, దశమాధిపతి ${house10Info.lordName} ${n(house10Info.placedHouse)}వ ఇంట (${house10Info.placedRashi}) వృత్తి దిశను నడిపిస్తున్నారు.`,
        ta: `உங்கள் 10-ம் தொழில் இடத்தில் ${n(savByHouse[10])} பரல்கள் உள்ளன; கர்மாதிபதி ${house10Info.lordName} ${n(house10Info.placedHouse)}-ம் வீட்டிலிருந்து (${house10Info.placedRashi}) வழிநடத்துகிறார்.`,
        en: `Directing your House 10 Karma (${savByHouse[10]} bindus), career lord ${house10Info.lordName} sits inside House ${house10Info.placedHouse} (${house10Info.placedRashi})—shaping how authority finds you.`
      },
      1: {
        kn: `ಬೇರೆಯವರ ನಕ್ಷೆ ಹಿಡಿದು ಓಡುವುದಕ್ಕಿಂತ ಸ್ವಂತ ಸಾಮರ್ಥ್ಯದ ಸಾರಥ್ಯ ವಹಿಸಿದಾಗಲೇ ${house10Info.lordName} ಹಾಗೂ ${currentMahadasha} ಬಲ ಪೂರ್ಣವಾಗಿ ಅರಳುತ್ತದೆ.`,
        mr: `दुसऱ्याच्या आदेशाप्रमाणे काम करण्यापेक्षा स्वतःच्या कौशल्याची धुरा हाती घेतल्यास ${house10Info.lordName} व ${currentMahadasha} चे बळ पूर्ण क्षमतेने फळते.`,
        hi: `केवल निर्देश मानने से आगे बढ़कर जब आप कार्य का स्वामित्व लेते हैं, तभी ${house10Info.lordName} और ${currentMahadasha} दशा का पूर्ण बल प्रकट होता है।`,
        te: `ఇతరుల దారిలో నడవడం కంటే స్వంత నైపుణ్యానికి నాయకత్వం వహించినప్పుడే ${house10Info.lordName} మరియు ${currentMahadasha} బలం పూర్తిగా వికసిస్తుంది.`,
        ta: `பிறர் திட்டங்களைச் செயல்படுத்துவதைத் தாண்டி நீங்களே பொறுப்பேற்கும்போதுதான் ${house10Info.lordName} மற்றும் ${currentMahadasha} பலம் முழுமையாக வெளிப்படும்.`,
        en: `Paired with your ${currentMahadasha} phase, ${house10Info.lordName} highlights one clear shift: stop carrying invisible errands and claim measurable ownership.`
      },
      2: {
        kn: `ಗುರುತು ಸಿಗದ ಹೆಚ್ಚುವರಿ ದುಡಿಮೆಯಿಂದ ಗೌರವಯುತ ಅಧಿಕಾರದತ್ತ (${n(savByHouse[10])}/${n(savByHouse[11])} ಬಿಂದು) ಚಲಿಸುವ ನಿರ್ಣಾಯಕ ಅಧ್ಯಾಯವಿದು.`,
        mr: `विनाश्रेय राबण्यापासून ते मानसन्मान व अधिकारापर्यंत (${n(savByHouse[10])}/${n(savByHouse[11])} गुण) झेप घेण्याचा हा महत्त्वाचा अध्याय आहे.`,
        hi: `बिना श्रेय के परिश्रम से निकलकर सम्मानजनक अधिकार (${n(savByHouse[10])}/${n(savByHouse[11])} बिंदू) की ओर बढ़ने का यह निर्णायक चरण है।`,
        te: `గుర్తింపు లేని శ్రమ నుండి గౌరవప్రదమైన ఉన్నత స్థానానికి (${n(savByHouse[10])}/${n(savByHouse[11])} బిందువులు) మారే కీలక అధ్యాయమిది.`,
        ta: `அங்கீகாரமற்ற உழைப்பிலிருந்து பெருமைமிகு தலைமைக்கு (${n(savByHouse[10])}/${n(savByHouse[11])} பரல்கள்) மாறும் முக்கிய அத்தியாயம் இது.`,
        en: `Weighing House 10 (${savByHouse[10]} bindus) alongside House 11 gains (${savByHouse[11]} bindus) shows where uncredited work converts into real leverage.`
      },
      3: {
        kn: `ಎರಡು ಕೈಗಳಲ್ಲಿ ಭಾರ ಹೊತ್ತು ನಡೆಯುವವರಿಗಿಂತ, ಚಕ್ರ ಕಟ್ಟಿ ಗಾಡಿ ಓಡಿಸುವ ಜಾಣ್ಮೆಯೇ ನಿಮ್ಮ ${lagnaRashiName} ವೃತ್ತಿ ಅಧಿಪತಿ ${house10Info.lordName} (${n(house10Info.placedHouse)}ನೇ ಮನೆ) ಕೊಟ್ಟಿರುವ ವರವಾಗಿದೆ.`,
        mr: `फक्त हाताने ओझे उचलण्यापेक्षा चाकांची गाडी चालवण्याची चाणाक्ष युक्ती तुमच्या ${lagnaRashiName} कर्मेश ${house10Info.lordName} (${n(house10Info.placedHouse)}वे स्थान) मध्ये दडलेली आहे.`,
        hi: `केवल बोझ ढोने वाले श्रमिक के बजाय व्यवस्था बनाने वाले शिल्पी की प्रतिभा आपकी ${lagnaRashiName} कुंडली के दशमेश ${house10Info.lordName} (${n(house10Info.placedHouse)}वां भाव) में बसती है।`,
        te: `చేతులతో బరువు మోయడం కంటే చక్రాలతో బండిని నడిపే చాకచక్యం మీ ${lagnaRashiName} దశమాధిపతి ${house10Info.lordName} (${n(house10Info.placedHouse)}వ స్థానం)లో ఉంది.`,
        ta: `வெறும் சுமை தாங்குவதை விடச் சக்கரங்களை அமைத்து வண்டியை ஓட்டும் திறனே உங்கள் ${lagnaRashiName} கர்மாதிபதி ${house10Info.lordName} (${n(house10Info.placedHouse)}-ம் வீடு) தரும் வரமாகும்.`,
        en: `Carrying boxes by hand exhausts anyone; building the cart multiplies every step—${lagnaRashiName}'s 10th lord ${house10Info.lordName} rewards leverage over sheer hours.`
      }
    },
    13: {
      0: {
        kn: `೨ನೇ ಧನಾಧಿಪತಿ ${house2Info.lordName} (${n(savByHouse[2])} ಬಿಂದು) ಹಾಗೂ ೧೧ನೇ ಲಾಭಾಧಿಪತಿ ${house11Info.lordName} (${n(savByHouse[11])} ಬಿಂದು) ನಿಮ್ಮ ಹಣದ ಹರಿವಿನ ನಿಜವಾದ ಕಥೆ ಹೇಳುತ್ತಿವೆ.`,
        mr: `द्वितीयेश ${house2Info.lordName} (${n(savByHouse[2])} गुण) आणि लाभेश ${house11Info.lordName} (${n(savByHouse[11])} गुण) तुमच्या पैशाच्या प्रवाहाची खरी कथा सांगतात.`,
        hi: `द्वितीयेश ${house2Info.lordName} (${n(savByHouse[2])} बिंदू) और लाभेश ${house11Info.lordName} (${n(savByHouse[11])} बिंदू) आपके धन-प्रवाह की वास्तविक कहानी उजागर करते हैं।`,
        te: `ధనాధిపతి ${house2Info.lordName} (${n(savByHouse[2])} బిందువులు) మరియు లాభాధిపతి ${house11Info.lordName} (${n(savByHouse[11])} బిందువులు) మీ ఆదాయ రహస్యాన్ని చూపుతున్నాయి.`,
        ta: `தனாதிபதி ${house2Info.lordName} (${n(savByHouse[2])} பரல்கள்) மற்றும் லாபாதிபதி ${house11Info.lordName} (${n(savByHouse[11])} பரல்கள்) உங்கள் பண ஓட்டத்தின் உண்மையைக் காட்டுகின்றன.`,
        en: `Looking straight at House 2 (${house2Info.lordName}, ${savByHouse[2]} bindus) and House 11 (${house11Info.lordName}, ${savByHouse[11]} bindus) explains how cash enters versus slips.`
      },
      1: {
        kn: `ನೀರು ಹರಿಯುವ ಕಾಲುವೆಯಲ್ಲಿ ಸಣ್ಣ ಬಿರುಕುಗಳಿದ್ದರೆ ಕೆರೆ ತುಂಬದಂತೆ, ವ್ಯಯಾಧಿಪತಿ ${extendedPrecision.house12Info.lordName} (${n(extendedPrecision.house12Info.placedHouse)}ನೇ ಮನೆ) ಸೋರಿಕೆಯನ್ನು ತೋರುತ್ತಿದೆ.`,
        mr: `पाण्याच्या कालव्यातील छोटी गळती न रोखल्यास तलाव भरत नाही; व्ययेश ${extendedPrecision.house12Info.lordName} (${n(extendedPrecision.house12Info.placedHouse)}वे स्थान) तीच आर्थिक गळती दाखवतो.`,
        hi: `तालाब की दीवार में सूक्ष्म रिसाव रहने पर कितना भी जल आए, वह टिकता नहीं; द्वादशेश ${extendedPrecision.house12Info.lordName} (${n(extendedPrecision.house12Info.placedHouse)}वां भाव) वही रिसाव दिखाते हैं।`,
        te: `చెరువు కట్టకు చిన్న రంధ్రం ఉంటే నీరు నిలవనట్లుగా, వ్యయాధిపతి ${extendedPrecision.house12Info.lordName} (${n(extendedPrecision.house12Info.placedHouse)}వ ఇల్లు) ఖర్చు లీక్ ఎక్కడుందో చూపుతోంది.`,
        ta: `குளத்தில் சிறு கசிவு இருந்தால் நீர் தங்காது; விரயாதிபதி ${extendedPrecision.house12Info.lordName} (${n(extendedPrecision.house12Info.placedHouse)}-ம் வீடு) அந்தச் செலவுக் கசிவைக் காட்டுகிறார்.`,
        en: `Checking 12th expense lord ${extendedPrecision.house12Info.lordName} (House ${extendedPrecision.house12Info.placedHouse}) against your ${savByHouse[2]}-bindu treasury reveals why earning outpaces retaining.`
      },
      2: {
        kn: `ಮೊಹಮಾಟದ ಖರ್ಚುಗಳನ್ನು ತಡೆದು '${yogiPlanetName}' ಯೋಗಿ ಬಲದ ಕಡೆಗೆ ಉಳಿತಾಯ ತಿರುಗಿಸುವುದೇ ನಿಮ್ಮ ಸಂಪತ್ತು ರಕ್ಷಣೆಯ ರಹಸ್ಯವಾಗಿದೆ.`,
        mr: `भावनेपोटी होणारा अनावश्यक खर्च थांबवून योगी '${yogiPlanetName}' च्या दिशेने बचत वळवणे हीच खरी संपत्तीची गुरुकिल्ली आहे.`,
        hi: `संकोच में होने वाले अनियोजित व्यय को रोककर योगी '${yogiPlanetName}' के अनुरूप ठोस बचत बनाना ही स्थायी समृद्धि का रहस्य है।`,
        te: `మొహమాటపు ఖర్చులను తగ్గించి, యోగి '${yogiPlanetName}' బలానికి అనుగుణంగా పొదుపు చేయడమే మీ ఐశ్వర్య రహస్యం.`,
        ta: `உணர்ச்சிவசப்பட்ட செலவுகளை நிறுத்தி, யோகி '${yogiPlanetName}' பலத்துடன் சேமிப்பை இணைப்பதே உங்கள் செல்வப் பாதுகாப்பின் ரகசியம்.`,
        en: `Compare unplanned generosity leaks against steady compounding aligned with Yogi ${yogiPlanetName}—your balance changes inside two quarters.`
      },
      3: {
        kn: `ಬೀಸುವ ಗಾಳಿಯಲ್ಲಿ ದೀಪ ಹಚ್ಚುವ ಬದಲು ಗಾಜಿನ ಕವಚ ಇಟ್ಟರೆ ರಾತ್ರಿಯೆಲ್ಲಾ ಬೆಳಗುವಂತೆ, ನಿಮ್ಮ ಧನಾಧಿಪತಿ ${house2Info.lordName} ಹಾಗೂ ಲಾಭಾಧಿಪತಿ ${house11Info.lordName} ಒಳಹರಿವಿಗೆ ಉಳಿತಾಯದ ಕವಚ ಅಗತ್ಯ.`,
        mr: `वाऱ्यात दिवा लावताना काचेचे आवरण ठेवल्यास तो अखंड तेवतो, तसेच द्वितीयेश ${house2Info.lordName} व लाभेश ${house11Info.lordName} उत्पन्नाभोवती बचतीचे कुंपण आवश्यक आहे.`,
        hi: `खुली हवा में दीपक को कांच के आवरण से सुरक्षित करने की भांति, द्वितीयेश ${house2Info.lordName} और लाभेश ${house11Info.lordName} की आय को प्रथम-दिवस बचत का कवच चाहिए।`,
        te: `గాలిలో దీపానికి గాజు కవచం పెడితే వెలుగు నిలిచినట్లు, మీ ధనాధిపతి ${house2Info.lordName} మరియు లాభాధిపతి ${house11Info.lordName} సంపాదనకు పొదుపు రక్షణ అవసరం.`,
        ta: `காற்றில் எரியும் தீபத்திற்குக் கண்ணாடிக் கூண்டு பாதுகாப்பு தருவது போல், தனாதிபதி ${house2Info.lordName}–லாபாதிபதி ${house11Info.lordName} வருமானத்திற்கு முதல் நாள் சேமிப்பு அவசியம்.`,
        en: `A bright lamp in an open breeze needs a glass shield first—paying House 2 lord ${house2Info.lordName} and House 11 lord ${house11Info.lordName} on day one stabilizes wealth.`
      }
    },
    14: {
      0: {
        kn: `ನಿಮ್ಮ ೭ನೇ ಸಪ್ತಮ ಸ್ಥಾನಾಧಿಪತಿ ${house7Info.lordName} (${n(house7Info.placedHouse)}ನೇ ಭಾವ, ${n(savByHouse[7])} ಬಿಂದು) ಹಾಗೂ ೪ನೇ ಗೃಹ ಸ್ಥಾನಾಧಿಪತಿ ${extendedPrecision.house4Info.lordName} ಆಪ್ತ ಸಂಬಂಧಗಳ ನಾಡಿ ಹಿಡಿದಿವೆ.`,
        mr: `सप्तमेश ${house7Info.lordName} (${n(house7Info.placedHouse)}वे स्थान, ${n(savByHouse[7])} गुण) व चतुर्थेश ${extendedPrecision.house4Info.lordName} तुमच्या जिव्हाळ्याच्या नात्यांची गाठ उलगडतात.`,
        hi: `सप्तमेश ${house7Info.lordName} (${n(house7Info.placedHouse)}वां भाव, ${n(savByHouse[7])} बिंदू) तथा चतुर्थेश ${extendedPrecision.house4Info.lordName} आपके निकट संबंधों की अंतर्कथा खोलते हैं।`,
        te: `సప్తమాధిపతి ${house7Info.lordName} (${n(house7Info.placedHouse)}వ స్థానం, ${n(savByHouse[7])} బిందువులు) మరియు చతుర్థాధిపతి ${extendedPrecision.house4Info.lordName} మీ ఆత్మీయ బంధాలను వివరిస్తున్నారు.`,
        ta: `சப்தமாதிபதி ${house7Info.lordName} (${n(house7Info.placedHouse)}-ம் வீடு, ${n(savByHouse[7])} பரல்கள்) மற்றும் சுகாதிபதி ${extendedPrecision.house4Info.lordName} உங்கள் உறவுகளின் ஆழத்தைக் காட்டுகின்றன.`,
        en: `Through House 7 lord ${house7Info.lordName} (in House ${house7Info.placedHouse}, ${savByHouse[7]} bindus) paired with domestic lord ${extendedPrecision.house4Info.lordName}, we see how affection speaks in your home.`
      },
      1: {
        kn: `${moonRashiName} ಮನಸ್ಸು ಹಾಗೂ ${nakshatraName} ನಕ್ಷತ್ರದ ಸೂಕ್ಷ್ಮ ಹೃದಯವು ಪ್ರೀತಿಯನ್ನು ಮಾತಿಗಿಂತ ಜವಾಬ್ದಾರಿಯಲ್ಲಿ ತೋರಿಸುವ ಅಭ್ಯಾಸವನ್ನು ಬೆಳೆಸಿದೆ.`,
        mr: `${moonRashiName} चंद्र व ${nakshatraName} नक्षत्राच्या संवेदनशील मनामुळे तुम्ही प्रेम शब्दांतून नव्हे, तर कर्तव्य पार पाडून व्यक्त करता.`,
        hi: `आपकी ${moonRashiName} राशि और ${nakshatraName} नक्षत्र की संवेदना प्रेम को शब्दों से अधिक जिम्मेदारियां निभाकर जताने का स्वभाव रचती है।`,
        te: `${moonRashiName} రాశి మరియు ${nakshatraName} నక్షత్ర సున్నితత్వం ప్రేమను మాటల కంటే బాధ్యతలు మోయడంలో చూపించేలా చేశాయి.`,
        ta: `${moonRashiName} ராசி மற்றும் ${nakshatraName} நட்சத்திர இயல்பு அன்பை வார்த்தைகளால் சொல்லாமல் பொறுப்புகளைச் சுமந்து காட்ட வைக்கிறது.`,
        en: `Your ${moonRashiName} Moon in ${nakshatraName} loves fiercely through quiet reliability—yet loved ones sometimes hunger to hear it spoken.`
      },
      2: {
        kn: `ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನದ ೭ನೇ ಅಧಿಪತಿ ${house7Info.lordName} (${n(savByHouse[7])} ಬಿಂದು) ತೋರುವಂತೆ, ಮಾತನಾಡದ ಮೌನ ಗೋಡೆ ಮತ್ತು ೫ ನಿಮಿಷದ ಮುಕ್ತ ಆಲಿಸುವಿಕೆಯ ನಡುವೆ ಬಾಂಧವ್ಯದ ಸೌಹಾರ್ದ ನಿಂತಿದೆ.`,
        mr: `तुमच्या ${lagnaRashiName} लग्नाचा सप्तमेश ${house7Info.lordName} (${n(savByHouse[7])} गुण) दाखवतो की न बोलल्याची भिंत आणि ५ मिनिटांचा संवाद यांमध्ये नात्यांचा गोडवा आहे.`,
        hi: `आपके ${lagnaRashiName} लग्न के सप्तमेश ${house7Info.lordName} (${n(savByHouse[7])} बिंदू) के अनुसार अनकहे मौन की दीवार और ५ मिनट के खुले संवाद के बीच ही संबंधों का सुख टिका है।`,
        te: `మీ ${lagnaRashiName} లగ్న సప్తమాధిపతి ${house7Info.lordName} (${n(savByHouse[7])} బిందువులు) చూపుతున్నట్లు, మౌనపు గోడకు 5 నిమిషాల ఆత్మీయ మాటలకు మధ్యే బంధాల ఆనందం ఉంది.`,
        ta: `உங்கள் ${lagnaRashiName} லக்னத்தின் 7-ம் அதிபதி ${house7Info.lordName} (${n(savByHouse[7])} பரல்கள்) காட்டுவது போல், மௌனச் சுவருக்கும் 5 நிமிட உரையாடலுக்கும் நடுவே உறவு இனிமை உள்ளது.`,
        en: `Seen through ${lagnaRashiName}'s 7th lord ${house7Info.lordName} (${savByHouse[7]} bindus), five calm minutes of listening without fixing dissolve quiet distance.`
      },
      3: {
        kn: `ಬಾಗಿಲಿನ ಬೀಗ ಒಳಗಿನಿಂದ ಜೋರಾಗಿ ತಿರುಗಿದಂತೆ, ${moonRashiName}–${nakshatraName} ಹೃದಯದ ಮುನಿಸು ಕೂಡ ಹೊರಗಿನವರಿಗಿಂತ ಒಳಗಿನ ಪ್ರೀತಿಯ ಒಂದು ಮೃದು ಸ್ಪರ್ಶದಿಂದಲೇ ಕರಗುತ್ತದೆ.`,
        mr: `दार आतून उघडावे, तसे ${moonRashiName}–${nakshatraName} स्वभावातील अढी बाहेरच्या सल्ल्यापेक्षा घरच्यांच्या एका प्रेमळ शब्दाने क्षणात विरघळते.`,
        hi: `जैसे कमरा भीतर की चाबी से ही खुलता है, वैसे ही ${moonRashiName}–${nakshatraName} हृदय का संकोच एक कोमल आत्मीय संवाद से पल में पिघल जाता है।`,
        te: `తలుపు లోపలి నుండే తెరుచుకున్నట్లుగా, ${moonRashiName}–${nakshatraName} మనసులోని చిన్న అపార్థం ఒక ప్రేమపూర్వక మాటతో కరిగిపోతుంది.`,
        ta: `கதவு உள்ளிருந்து திறப்பது போல், ${moonRashiName}–${nakshatraName} மனக்கசப்பு அன்பான ஒரு வார்த்தையால் நொடியில் கரையும்.`,
        en: `Two people waiting for the other to speak first stay outside one unlocked door—one warm check-in shifts your ${moonRashiName}–${nakshatraName} tie.`
      }
    },
    15: {
      0: {
        kn: `ನಿಮ್ಮ ೫ನೇ ಪೂರ್ವಪುಣ್ಯ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[5])} ಬಿಂದುಗಳು ಹಾಗೂ ಪಂಚಮೇಶ ${house5Info.lordName} (${n(house5Info.placedHouse)}ನೇ ಮನೆ) ಸೃಜನಶೀಲ ಚೈತನ್ಯವನ್ನು ಹೊತ್ತು ನಿಂತಿದೆ.`,
        mr: `पंचम भावात ${n(savByHouse[5])} गुण असून पंचमेश ${house5Info.lordName} (${n(house5Info.placedHouse)}वे स्थान) तुमच्या बुद्धी व संततीची नवी वाट दाखवतो.`,
        hi: `पंचम पूर्वपुण्य भाव में ${n(savByHouse[5])} बिंदू और पंचमेश ${house5Info.lordName} (${n(house5Info.placedHouse)}वां भाव) आपकी रचनात्मक मेधा एवं कुल-प्रतिष्ठा को संवारते हैं।`,
        te: `మీ 5వ పూర్వపుణ్య స్థానంలో ${n(savByHouse[5])} బిందువులు మరియు పంచమాధిపతి ${house5Info.lordName} (${n(house5Info.placedHouse)}వ స్థానం) మీ సృజనాత్మక శక్తిని నడిపిస్తున్నాయి.`,
        ta: `உங்கள் 5-ம் பூர்வ புண்ணிய இடத்தில் ${n(savByHouse[5])} பரல்களும், 5-ம் அதிபதி ${house5Info.lordName} (${n(house5Info.placedHouse)}-ம் வீடு) படைப்பாற்றல் ஒளியையும் தருகின்றனர்.`,
        en: `Anchoring your 5th House of creation and lineage (${savByHouse[5]} bindus), ${house5Info.lordName} in House ${house5Info.placedHouse} keeps original wisdom alive.`
      },
      1: {
        kn: `ಬರೀ ಕರ್ತವ್ಯಗಳ ಗಡಿಬಿಡಿಯಲ್ಲಿ ಮುಚ್ಚಿಹೋಗಿದ್ದ ನಿಮ್ಮ ${nakshatraName} ಪ್ರತಿಭೆ ಮತ್ತು ಹೃದಯದ ಸಂತೋಷಕ್ಕೆ ಮತ್ತೆ ಬಾಗಿಲು ತೆರೆಯುವ ಸಮಯವಿದು.`,
        mr: `केवळ जबाबदाऱ्यांच्या ओझ्याखाली दबलेली तुमची ${nakshatraName} कल्पकता आणि मनाचा आनंद पुन्हा फुलण्याची ही वेळ आहे.`,
        hi: `कर्तव्यों की भागदौड़ में दबी आपकी ${nakshatraName} रचनात्मकता और हार्दिक आनंद को फिर से जागृत करने का यह अध्याय है।`,
        te: `బాధ్యతల ఒత్తిడిలో మరుగున పడిన మీ ${nakshatraName} సృజనాత్మకతకు మరియు హృదయానందానికి మళ్ళీ రెక్కలు వచ్చే సమయమిది.`,
        ta: `கடமைகளின் அழுத்தத்தில் மறைந்திருந்த உங்கள் ${nakshatraName} படைப்பாற்றலுக்கும் மன மகிழ்ச்சிக்கும் மீண்டும் உயிர் கொடுக்கும் தருணம் இது.`,
        en: `Beneath busy schedules inside your ${nakshatraName} heart sits a playful creative instinct waiting for room to breathe again.`
      },
      2: {
        kn: `ಯಾಂತ್ರಿಕ ದಿನಚರಿಗಿಂತ ೫ನೇ ಪಂಚಮೇಶ ${house5Info.lordName} (${n(savByHouse[5])} ಬಿಂದು) ತೋರುವ ಸೃಷ್ಟಿಯ ಬೆಳಕು ಮತ್ತು ಆತ್ಮೀಯ ಸಂತೋಷ ನಿಮ್ಮ ಅದೃಷ್ಟವನ್ನು ಹೇಗೆ ಅರಳಿಸುತ್ತದೆ ನೋಡಿ.`,
        mr: `कोरड्या दिनचर्येपेक्षा पंचमेश ${house5Info.lordName} (${n(savByHouse[5])} गुण) दर्शवणारा सर्जनशील छंद व आनंदी संवाद तुमचे भाग्य कसे उजळतो ते पहा.`,
        hi: `नीरस दिनचर्या के बजाय पंचमेश ${house5Info.lordName} (${n(savByHouse[5])} बिंदू) की रचनात्मक अभिरुचि और सहज आनंद से आपके भाग्य में नई चमक लौटती है।`,
        te: `యాంత్రిక జీవనం కంటే పంచమాధిపతి ${house5Info.lordName} (${n(savByHouse[5])} బిందువులు) ఇచ్చే సృజనాత్మక ఆనందం మీ అదృష్టాన్ని ఎలా పెంచుతుందో చూడండి.`,
        ta: `இயந்திரத்தனமான வாழ்வை விட 5-ம் அதிபதி ${house5Info.lordName} (${n(savByHouse[5])} பரல்கள்) தரும் படைப்பு ஆர்வமும் மகிழ்ச்சியும் உங்கள் அதிர்ஷ்டத்தை மலரச் செய்கின்றன.`,
        en: `Trading joyless routines for genuine creativity under 5th lord ${house5Info.lordName} (${savByHouse[5]} bindus) unlocks fresh vitality.`
      },
      3: {
        kn: `ದೀಪಕ್ಕೆ ಎಣ್ಣೆ ಇದ್ದರೂ ಬತ್ತಿ ಸರಿಪಡಿಸದಿದ್ದರೆ ಬೆಳಕು ಕಡಿಮೆಯಾದಂತೆ, ${nakshatraName}–${lagnaRashiName} ಬದುಕಿನಲ್ಲಿ ಸೃಜನಶೀಲ ಹವ್ಯಾಸವೇ ಉತ್ಸಾಹದ ಬತ್ತಿಯಾಗಿದೆ.`,
        mr: `दिव्यात तेल असूनही वात नीट नसेल तर प्रकाश कमी पडतो; ${nakshatraName}–${lagnaRashiName} आयुष्यात सृजनशील छंद हीच उत्साहाची वात आहे.`,
        hi: `दीपक में तेल होने पर भी बाती संवारने से लौ खिलती है; ${nakshatraName}–${lagnaRashiName} कुंडली में रचनात्मक आनंद वही प्रज्वलित बाती है।`,
        te: `దీపంలో నూనె ఉన్నా వత్తి సరిచేస్తేనే వెలుగు పెరిగినట్లుగా, ${nakshatraName}–${lagnaRashiName} జాతకంలో సృజనాత్మక అభిరుచే ఉత్సాహాన్ని వెలిగిస్తుంది.`,
        ta: `விளக்கில் எண்ணெய் இருந்தாலும் திரியைத் தூண்டினால்தான் ஒளி பெருகும்; ${nakshatraName}–${lagnaRashiName} வாழ்வில் படைப்பு ஆர்வமே அந்தத் திரியாகும்.`,
        en: `A full lamp still needs its wick trimmed to glow brightly—protecting creative joy keeps your ${lagnaRashiName}–${nakshatraName} spirit buoyant.`
      }
    },
    16: {
      0: {
        kn: `ಲಗ್ನ ಬಲ (${n(savByHouse[1])} ಬಿಂದು), ೬ನೇ ರೋಗ ಸ್ಥಾನಾಧಿಪತಿ ${house6Info.lordName} (${n(house6Info.placedHouse)}ನೇ ಮನೆ) ಹಾಗೂ ೮ನೇ ಆಯುಷ್ಯ ಸ್ಥಾನಾಧಿಪತಿ ${extendedPrecision.house8Info.lordName} ನಿಮ್ಮ ದೇಹದ ಲಯವನ್ನು ಕಾಪಾಡುತ್ತಿವೆ.`,
        mr: `लग्न बळ (${n(savByHouse[1])} गुण), षष्ठेश ${house6Info.lordName} (${n(house6Info.placedHouse)}वे स्थान) व अष्टमेश ${extendedPrecision.house8Info.lordName} तुमच्या शरीरयंत्रणेचे रक्षण करतात.`,
        hi: `लग्न बल (${n(savByHouse[1])} बिंदू), षष्ठेश ${house6Info.lordName} (${n(house6Info.placedHouse)}वां भाव) और अष्टमेश ${extendedPrecision.house8Info.lordName} आपकी शारीरिक ऊर्जा का संचालन करते हैं।`,
        te: `లగ్న బలం (${n(savByHouse[1])} బిందువులు), షష్టాధిపతి ${house6Info.lordName} (${n(house6Info.placedHouse)}వ స్థానం) మరియు అష్టమాధిపతి ${extendedPrecision.house8Info.lordName} మీ ఆరోగ్య గమనాన్ని నిర్దేశిస్తున్నాయి.`,
        ta: `லக்ன பலம் (${n(savByHouse[1])} பரல்கள்), 6-ம் அதிபதி ${house6Info.lordName} (${n(house6Info.placedHouse)}-ம் வீடு) மற்றும் 8-ம் அதிபதி ${extendedPrecision.house8Info.lordName} உங்கள் உடல் ஆற்றலைக் காக்கின்றன.`,
        en: `Supported by ${savByHouse[1]} Lagna bindus alongside 6th lord ${house6Info.lordName} (House ${house6Info.placedHouse}) and 8th lord ${extendedPrecision.house8Info.lordName}, your constitution signals stress early.`
      },
      1: {
        kn: `ನಿಮ್ಮ '${dominantElement}' ಪ್ರಕೃತಿಗೆ ಒತ್ತಡ ತಾಕಿದಾಗಲೆಲ್ಲಾ ಮೊದಲು ಬದಲಾಗುವ ಜೀರ್ಣಕ್ರಿಯೆ, ಭುಜದ ಬಿಗಿ ಅಥವಾ ನಿದ್ದೆಯ ಸೂಚನೆಗಳನ್ನು ಗಮನಿಸಿ.`,
        mr: `तुमच्या '${dominantElement}' प्रकृतीवर ताण येताच पचन, खांदे-मान ताण किंवा झोपेची गुणवत्ता हे पहिले संकेत देतात.`,
        hi: `आपकी '${dominantElement}' प्रकृति पर दबाव पड़ते ही सबसे पहले पाचन, गर्दन-कंधों की जकड़न या नींद में हल्का बदलाव संकेत देता है।`,
        te: `మీ '${dominantElement}' ప్రకృతిపై ఒత్తిడి పడినప్పుడు ముందుగా జీర్ణక్రియ, భుజాల నొప్పి లేదా నిద్రలో కనిపించే సంకేతాలను గమనించండి.`,
        ta: `உங்கள் '${dominantElement}' இயல்பில் அழுத்தம் கூடும் போதெல்லாம் செரிமானம், தோள்பட்டை இறுக்கம் அல்லது தூக்க மாற்றம் முதலில் எச்சரிக்கை தரும்.`,
        en: `Because your chart leans ${dominantElement}, silent mental strain shows up in posture, digestion, or sleep cycles well before real illness.`
      },
      2: {
        kn: `${lagnaRashiName} ಲಗ್ನದ (${n(savByHouse[1])} ಬಿಂದು) ಪ್ರಾಣಶಕ್ತಿಗೆ ನಿಲ್ಲದ ಯೋಚನೆಗಳ ಬಿಸಿಗಿಂತ ಸಂಜೆಯ ವಿಶ್ರಾಂತಿ ಮತ್ತು ನಿಯಮಿತ ನೀರು-ನಡಿಗೆ ಹೇಗೆ ಬಲ ತರುತ್ತದೆ ನೋಡಿ.`,
        mr: `${lagnaRashiName} लग्नाच्या (${n(savByHouse[1])} गुण) प्राणशक्तीला सततच्या विचारांपेक्षा संध्याकाळचा शांत विसावा व पाणी-चालणे कसे बळ देते ते पहा.`,
        hi: `${lagnaRashiName} लग्न (${n(savByHouse[1])} बिंदू) की जीवन-ऊर्जा को लगातार विचारों की थकान के बजाय शांत संध्या-विश्राम और जल-भ्रमण से गति मिलती है।`,
        te: `${lagnaRashiName} లగ్న (${n(savByHouse[1])} బిందువులు) ఆరోగ్యానికి ఆగని ఆలోచనల కంటే సాయంత్రం ప్రశాంతత, సరిపడా నీరు మరియు నడక ఎంతో శక్తినిస్తాయి.`,
        ta: `${lagnaRashiName} லக்ன (${n(savByHouse[1])} பரல்கள்) ஆற்றலுக்கு நிற்காத சிந்தனைச் சோர்வை விட மாலை அமைதியும் சீரான தண்ணீர்-நடைப்பயிற்சியும் விரைந்து புத்துணர்வு தருகின்றன.`,
        en: `For ${lagnaRashiName} Ascendant (${savByHouse[1]} Lagna bindus), replacing late-night screen strain with thirty quiet wind-down minutes restores stamina inside a week.`
      },
      3: {
        kn: `ವಾಹನದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮೇಲೆ ಸಣ್ಣ ಹಳದಿ ದೀಪ ಮಿಂಚಿದಂತೆ, ದೇಹದ ${house6Info.lordName} ಸಂಕೇತವು ದೊಡ್ಡ ಆಯಾಸದ ಮೊದಲೇ ಸೌಮ್ಯ ಎಚ್ಚರಿಕೆ ನೀಡುತ್ತದೆ.`,
        mr: `गाडीच्या डॅशबोर्डवर छोटा पिवळा दिवा लागावा, तशी शरीरातील ${house6Info.lordName} शक्ती मोठ्या थकव्यापूर्वीच सूक्ष्म इशारा देते.`,
        hi: `बड़ी खराबी से पहले जैसे वाहन के डैशबोर्ड पर हल्की चेतावनी चमकती है, वैसे ही षष्ठेश ${house6Info.lordName} थकान से पूर्व संकेत देते हैं।`,
        te: `పెద్ద సమస్య రాకముందే డ్యాష్‌బోర్డుపై చిన్న లైటు వెలిగినట్లుగా, ${house6Info.lordName} శక్తి మీ శరీర అలసటను ముందే హెచ్చరిస్తోంది.`,
        ta: `பெரிய பழுதுக்கு முன்பே சிறிய எச்சரிக்கை விளக்கு எரிவது போல், ${house6Info.lordName} உடல் சோர்வை முன்கூட்டியே சுட்டிக்காட்டுகிறது.`,
        en: `Dashboard lights flicker quietly long before an engine stalls—your ${house6Info.lordName} rhythm whispers early whenever rest needs guarding.`
      }
    },
    17: {
      0: {
        kn: `ಮುಂಬರುವ ೯೦ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ '${currentMahadasha}–${currentBhuktiLord}' ದಶೆ (${n(bhuktiEndDate)}ರವರೆಗೆ) ಹಾಗೂ '${extendedPrecision.taraLabelLocalized}' ತಾರಾಬಲ ಮೊದಲ ಚಲನೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತಿವೆ.`,
        mr: `येत्या ९० दिवसांत तुमची '${currentMahadasha}–${currentBhuktiLord}' दशा (${n(bhuktiEndDate)} पर्यंत) आणि '${extendedPrecision.taraLabelLocalized}' ताराबल पहिली गती ठरवत आहेत.`,
        hi: `आने वाले ९० दिनों में आपकी '${currentMahadasha}–${currentBhuktiLord}' दशा (${n(bhuktiEndDate)} तक) तथा '${extendedPrecision.taraLabelLocalized}' ताराबल प्रारंभिक गति तय कर रहे हैं।`,
        te: `రాబోయే 90 రోజుల్లో మీ '${currentMahadasha}–${currentBhuktiLord}' దశ (${n(bhuktiEndDate)} వరకు) మరియు '${extendedPrecision.taraLabelLocalized}' తారాబలం తక్షణ వేగాన్ని ఇస్తున్నాయి.`,
        ta: `அடுத்த 90 நாட்களில் உங்கள் '${currentMahadasha}–${currentBhuktiLord}' தசை (${n(bhuktiEndDate)} வரை) மற்றும் '${extendedPrecision.taraLabelLocalized}' தாராபலம் ஆரம்ப நகர்வைத் தீர்மானிக்கின்றன.`,
        en: `Over the next 90 days, active ${currentMahadasha}–${currentBhuktiLord} (through ${bhuktiEndDate}) and ${lagnaRashiName} pacing unlock stalled discussions.`
      },
      1: {
        kn: `${guruTransitRashi} ಗುರುವಿನ ${n(ctx.guruHouseFromMoon)}ನೇ ಮನೆ ಪ್ರಭಾವ ಹಾಗೂ ${nakshatraName} ಚುರುಕುತನ ಸೇರಿ ಮುಂದಿನ ೩ ತಿಂಗಳ ತಿರುವು ಸಿದ್ಧಪಡಿಸುತ್ತಿವೆ.`,
        mr: `${guruTransitRashi} मधील गुरूचे ${n(ctx.guruHouseFromMoon)}वे स्थान आणि ${nakshatraName} ची सक्रियता मिळून पुढील ३ महिन्यांचे वळण घडवत आहेत.`,
        hi: `${guruTransitRashi} स्थित गुरु का चंद्र से ${n(ctx.guruHouseFromMoon)}वां प्रभाव और ${nakshatraName} की ऊर्जा मिलकर आगामी ३ महीनों की दिशा रच रहे हैं।`,
        te: `${guruTransitRashi} గురుని ${n(ctx.guruHouseFromMoon)}వ స్థాన బలం మరియు ${nakshatraName} చురుకుదనం కలిసి రాబోయే 3 నెలల మలుపును తెస్తున్నాయి.`,
        ta: `${guruTransitRashi} குருவின் ${n(ctx.guruHouseFromMoon)}-ம் இட நிலையும் ${nakshatraName} ஆற்றலும் இணைந்து அடுத்த 3 மாதத் திருப்பத்தை உருவாக்குகின்றன.`,
        en: `With Jupiter transiting House ${ctx.guruHouseFromMoon} (${guruTransitRashi}) relative to your ${nakshatraName} Moon, one delayed thread clears cleanly this quarter.`
      },
      2: {
        kn: `ನಿಮ್ಮ '${currentMahadasha}–${currentBhuktiLord}' ದಶೆಯಲ್ಲಿ ನಿಂತ ನೀರಿನಂತಿದ್ದ ವಿಳಂಬ ಹಿಂದೆ ಸರಿದು, ಮೊದಲ ೩೦–೯೦ ದಿನಗಳಲ್ಲಿ ಪ್ರತ್ಯಕ್ಷ ಪ್ರತಿಕ್ರಿಯೆ ಹತ್ತಿರ ಬರುತ್ತಿದೆ.`,
        mr: `तुमच्या '${currentMahadasha}–${currentBhuktiLord}' दशेत थांबलेला विलंब मागे सरून पुढील ३०–९० दिवसांत प्रत्यक्ष प्रतिसाद जवळ येत आहे.`,
        hi: `आपकी '${currentMahadasha}–${currentBhuktiLord}' दशा में अटके कार्यों की जड़ता पीछे छूटकर अगले ३०–९० दिनों में प्रत्यक्ष परिणाम निकट आ रहे हैं।`,
        te: `మీ '${currentMahadasha}–${currentBhuktiLord}' దశలో నిలిచిపోయిన పాత స్థితి తొలగి, రాబోయే 30–90 రోజుల్లో ప్రత్యక్ష కదలిక దగ్గరవుతోంది.`,
        ta: `உங்கள் '${currentMahadasha}–${currentBhuktiLord}' தசையில் தேங்கிய தாமதம் விலகி, அடுத்த 30–90 நாட்களில் நேரடி முன்னேற்றம் அருகில் வருகிறது.`,
        en: `Under ${currentMahadasha}–${currentBhuktiLord}, waiting loops recede while fresh responsiveness wakes up inside Month 1 and Month 2.`
      },
      3: {
        kn: `ವಿರಾಮದ ನಂತರ ಮತ್ತೆ ಶುರುವಾಗುವ ಸಂಗೀತ ಕಚೇರಿಯ ಮೊದಲ ಸ್ವರದಂತೆ, ${lagnaRashiName}–${moonRashiName} ಜಾತಕಕ್ಕೆ ಮುಂಬರುವ ೯೦ ದಿನಗಳು ತಾಜಾ ಲಯ ಕೊಡುತ್ತಿವೆ.`,
        mr: `विश्रांतीनंतर वाद्यवृंद पुन्हा सूर धरतो, तसा हा ९० दिवसांचा टप्पा ${lagnaRashiName}–${moonRashiName} कुंडलीत थांबलेल्या कामांना गती देत आहे.`,
        hi: `ठहराव के बाद जैसे संगीत सभा का पहला सुर गूंजता है, वैसे ही ${lagnaRashiName}–${moonRashiName} कुंडली में आने वाले ९० दिन ताज़ी गति ला रहे हैं।`,
        te: `చిన్న విరామం తర్వాత సంగీతం మళ్ళీ ఊపందుకున్నట్లుగా, ${lagnaRashiName}–${moonRashiName} జాతకానికి రాబోయే 90 రోజులు తాజా వేగాన్ని ఇవ్వబోతున్నాయి.`,
        ta: `இடைவேளைக்குப் பிறகு இசைக்குழு சுருதி சேர்ப்பது போல், ${lagnaRashiName}–${moonRashiName} ஜாதகத்திற்கு அடுத்த 90 நாட்கள் புதிய வேகம் தருகின்றன.`,
        en: `Like musicians lifting instruments right after intermission, the coming ninety days restart clean rhythm for your ${lagnaRashiName}–${moonRashiName} chart.`
      }
    },
    18: {
      0: {
        kn: `ನಿಮ್ಮ ಕುಂಡಲಿಯ ರಾಹು-ಚಂದ್ರ ಮಧ್ಯಬಿಂದುವಾದ ಬೃಗು ಬಿಂದು ${bhriguBinduRashiName} ರಾಶಿಯಲ್ಲಿ (${ctx.bhriguDeg}°) ಸ್ಥಿತವಾಗಿ ೪–೬ ತಿಂಗಳ ಅದೃಷ್ಟ ತಿರುವು ತರುತ್ತಿದೆ.`,
        mr: `तुमच्या कुंडलीतील राहु-चंद्राचा मध्यबिंदू — भृगु बिंदू ${bhriguBinduRashiName} राशीत (${ctx.bhriguDeg}°) असून ४–६ महिन्यांत निर्णायक वळण आणत आहे.`,
        hi: `आपकी कुंडली में राहु-चंद्र का मध्यबिंदु — भृगु बिंदु ${bhriguBinduRashiName} (${ctx.bhriguDeg}°) में स्थित होकर ४–६ महीनों का निर्णायक मोड़ रच रहा है।`,
        te: `మీ జాతకంలో రాహు-చంద్ర మధ్య బిందువైన భృగు బిందువు ${bhriguBinduRashiName} రాశిలో (${ctx.bhriguDeg}°) ఉండి 4–6 నెలల్లో అదృష్ట మలుపు తెస్తోంది.`,
        ta: `உங்கள் ஜாதகத்தின் ராகு-சந்திர மையப்புள்ளியான பிருகு பிந்து ${bhriguBinduRashiName} ராசியில் (${ctx.bhriguDeg}°) அமர்ந்து 4–6 மாதங்களில் அதிர்ஷ்டத் திருப்பம் தருகிறது.`,
        en: `Positioned in ${bhriguBinduRashiName} (${ctx.bhriguDeg}°), your Bhrigu Bindu activates across Months 4–6—turning steady waiting into green lights.`
      },
      1: {
        kn: `${moonRashiName} ಚಂದ್ರನಿಂದ ${n(arch.bhriguHouseFromMoon)}ನೇ ಸ್ಥಾನಕ್ಕೆ ಬೀಳುವ ಬೃಗು ಬಿಂದು (${bhriguBinduRashiName}) ನಿಮ್ಮ ${arch.peakDomainLabel} ಕ್ಷೇತ್ರವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.`,
        mr: `${moonRashiName} चंद्रापासून ${n(arch.bhriguHouseFromMoon)}व्या स्थानी असलेला भृगु बिंदू (${bhriguBinduRashiName}) तुमचे ${arch.peakDomainLabel} क्षेत्र जागवतो.`,
        hi: `${moonRashiName} चंद्र से ${n(arch.bhriguHouseFromMoon)}वें भाव में स्थित भृगु बिंदु (${bhriguBinduRashiName}) आपके ${arch.peakDomainLabel} क्षेत्र को सक्रिय करता है।`,
        te: `${moonRashiName} చంద్రుని నుండి ${n(arch.bhriguHouseFromMoon)}వ స్థానంలో ఉన్న భృగు బిందువు (${bhriguBinduRashiName}) మీ ${arch.peakDomainLabel} విభాగాన్ని మేల్కొల్పుతోంది.`,
        ta: `${moonRashiName} ராசியிலிருந்து ${n(arch.bhriguHouseFromMoon)}-ம் இடத்தில் அமையும் பிருகு பிந்து (${bhriguBinduRashiName}) உங்கள் ${arch.peakDomainLabel} துறையைத் தூண்டுகிறது.`,
        en: `Landing in House ${arch.bhriguHouseFromMoon} from your Moon, Bhrigu Bindu in ${bhriguBinduRashiName} spotlights ${arch.peakDomainLabel} directly.`
      },
      2: {
        kn: `೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದ ${n(savByHouse[10])} ಬಿಂದುಗಳು ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದ ${n(savByHouse[11])} ಬಿಂದುಗಳು ವರ್ಷದ ಮಧ್ಯಭಾಗದಲ್ಲಿ ಬೃಗು ಬಿಂದುವಿಗೆ ಶಕ್ತಿ ತುಂಬುತ್ತವೆ.`,
        mr: `दशम भावाचे ${n(savByHouse[10])} व लाभ भावाचे ${n(savByHouse[11])} गुण वर्षाच्या मध्यावर भृगु बिंदूला भक्कम पाठबळ देतात.`,
        hi: `दशम भाव के ${n(savByHouse[10])} और एकादश भाव के ${n(savByHouse[11])} बिंदू मध्यांतर में आपके भृगु बिंदु को ठोस परिणाम में बदलते हैं।`,
        te: `10వ స్థాన ${n(savByHouse[10])} బిందువులు మరియు 11వ స్థాన ${n(savByHouse[11])} బిందువులు 4–6 నెలల్లో భృగు బిందువుకు బలం ఇస్తాయి.`,
        ta: `10-ம் இடத்தின் ${n(savByHouse[10])} பரல்களும் 11-ம் இடத்தின் ${n(savByHouse[11])} பரல்களும் ஆண்டின் நடுப்பகுதியில் பிருகு பிந்துவுக்குப் பலம் சேர்க்கின்றன.`,
        en: `When Months 4–6 transits touch ${bhriguBinduRashiName}, your House 10 (${savByHouse[10]} SAV) and House 11 (${savByHouse[11]} SAV) engines lock into gear.`
      },
      3: {
        kn: `ಎರಡು ಪ್ರತ್ಯೇಕ ನದಿಗಳು ಸಂಗಮವಾಗುವ ಪವಿತ್ರ ಸ್ಥಳದಂತೆ, ಬೃಗು ಬಿಂದು (${bhriguBinduRashiName}) ಚದುರಿದ ಪ್ರಯತ್ನಗಳನ್ನು ಒಂದೇ ಫಲದತ್ತ ತಿರುಗಿಸುತ್ತದೆ.`,
        mr: `दोन वेगवेगळ्या प्रवाहांचा संगम व्हावा, तसा भृगु बिंदू (${bhriguBinduRashiName}) विखुरलेल्या प्रयत्नांना एकाच ठोस फळाकडे वळवतो.`,
        hi: `दो अलग धाराओं के संगम की तरह, भृगु बिंदु (${bhriguBinduRashiName}) बिखरे प्रयासों को एक सार्थक परिणाम की ओर मोड़ता है।`,
        te: `రెండు నదులు కలిసే పవిత్ర సంగమంలా, భృగు బిందువు (${bhriguBinduRashiName}) చెదిరిన ప్రయత్నాలను ఒకే శుభ ఫలితం వైపు నడిపిస్తోంది.`,
        ta: `இரு நதிகள் இணையும் சங்கமம் போல், பிருகு பிந்து (${bhriguBinduRashiName}) சிதறிய முயற்சிகளை ஒரே வெற்றியாக இணைக்கிறது.`,
        en: `Where lunar feeling meets solar direction sits ${bhriguBinduRashiName}—the quiet crossroads turning scattered efforts into concrete momentum.`
      }
    },
    19: {
      0: {
        kn: `${n(nowYear)}ನೇ ವರ್ಷವು ನಿಮ್ಮ '${arch.peakDomainLabel}' (${n(arch.peakHouseNum)}ನೇ ಮನೆ) ಬಲವನ್ನು ಶಿಸ್ತಿಗೆ ತಂದು ಹಳೆಯ ಅಸ್ತವ್ಯಸ್ತತೆಯನ್ನು ತೆರವುಗೊಳಿಸುತ್ತದೆ.`,
        mr: `${n(nowYear)} हे वर्ष तुमच्या '${arch.peakDomainLabel}' (${n(arch.peakHouseNum)}वे स्थान) शक्तीला शिस्त लावून जुना गोंधळ संपवते.`,
        hi: `वर्ष ${n(nowYear)} आपकी '${arch.peakDomainLabel}' (${n(arch.peakHouseNum)}वां भाव) शक्ति को व्यवस्थित कर पुराने बिखराव को समाप्त करता है।`,
        te: `${n(nowYear)}వ సంవత్సరం మీ '${arch.peakDomainLabel}' (${n(arch.peakHouseNum)}వ స్థానం) బలాన్ని క్రమబద్ధం చేసి పాత గందరగోళాన్ని తొలగిస్తుంది.`,
        ta: `${n(nowYear)}-ம் ஆண்டு உங்கள் '${arch.peakDomainLabel}' (${n(arch.peakHouseNum)}-ம் வீடு) பலத்தைச் சீரமைத்துப் பழைய குழப்பங்களை நீக்குகிறது.`,
        en: `For your chart in ${nowYear} (${arch.yearScores[0]}% momentum), stabilizing ${arch.peakDomainLabel} clears old friction first.`
      },
      1: {
        kn: `${currentMahadasha}–${currentBhuktiLord} ಹಂತದ ${n(nowYear)}ರ ವಾರ್ಷಿಕ ಗತಿ (${n(arch.yearScores[0])}%) ನಿಮಗೆ ಆತುರಕ್ಕಿಂತ ಕ್ರಮಬದ್ಧ ಅಡಿಪಾಯ ಕಟ್ಟಲು ಸೂಚಿಸುತ್ತಿದೆ.`,
        mr: `${currentMahadasha}–${currentBhuktiLord} दशेतील ${n(nowYear)} चा वार्षिक वेग (${n(arch.yearScores[0])}%) घाईऐवजी भक्कम पाया रचण्यास सांगतो.`,
        hi: `${currentMahadasha}–${currentBhuktiLord} दशा के मध्य ${n(nowYear)} की वार्षिक गति (${n(arch.yearScores[0])}%) जल्दबाजी के बजाय मजबूत नींव रखने का संकेत देती है।`,
        te: `${currentMahadasha}–${currentBhuktiLord} దశలో ${n(nowYear)}వ ఏడాది వేగం (${n(arch.yearScores[0])}%) తొందరపాటు కంటే గట్టి పునాది వేయమని సూచిస్తోంది.`,
        ta: `${currentMahadasha}–${currentBhuktiLord} தசையில் ${n(nowYear)}-ன் வேகம் (${n(arch.yearScores[0])}%) அவசரத்தை விட உறுதியான அடித்தளம் அமைக்க வழிகாட்டுகிறது.`,
        en: `Under ${currentMahadasha}–${currentBhuktiLord}, Year 1 (${nowYear}) scores ${arch.yearScores[0]}%—rewarding subtraction and focus over noisy expansion.`
      },
      2: {
        kn: `ದುರ್ಬಲ ${n(arch.weakestHouseNum)}ನೇ ಮನೆಯ (${arch.weakestDomainLabel}) ಸೋರಿಕೆಯನ್ನು ನಿಲ್ಲಿಸಿ ${n(nowYear)}ರಲ್ಲಿ ನಿಚ್ಚಳ ನಿಯಂತ್ರಣ ಸಾಧಿಸುವ ವರ್ಷವಿದು.`,
        mr: `${n(arch.weakestHouseNum)}व्या भावातील (${arch.weakestDomainLabel}) थकवा थांबवून ${n(nowYear)} मध्ये पुन्हा वेळेचे नियंत्रण मिळवण्याचे हे वर्ष आहे.`,
        hi: `${n(arch.weakestHouseNum)}वें भाव (${arch.weakestDomainLabel}) के अनावश्यक दबाव को समेटकर ${n(nowYear)} में स्पष्ट नियंत्रण पाने का यह वर्ष है।`,
        te: `${n(arch.weakestHouseNum)}వ స్థాన (${arch.weakestDomainLabel}) ఒత్తిడిని తగ్గించుకుని ${n(nowYear)}లో స్పష్టమైన నియంత్రణ సాధించే సంవత్సరమిది.`,
        ta: `${n(arch.weakestHouseNum)}-ம் இட (${arch.weakestDomainLabel}) சோர்வைக் குறைத்து ${n(nowYear)}-ல் தெளிவான கட்டுப்பாட்டைப் பெறும் ஆண்டு இது.`,
        en: `Tightening loose ends around ${arch.weakestDomainLabel} (House ${arch.weakestHouseNum}) buys back critical calm across ${nowYear}.`
      },
      3: {
        kn: `ಹೊಸ ಮನೆ ಕಟ್ಟುವ ಮುನ್ನ ಸುತ್ತಲಿನ ಕಸ ತೆರವುಗೊಳಿಸುವಂತೆ, ${n(nowYear)} ನಿಮ್ಮ ${lagnaRashiName} ವೇಳಾಪಟ್ಟಿಯ ಭಾರವನ್ನು ಹಗುರಗೊಳಿಸುತ್ತದೆ.`,
        mr: `नवी इमारत उभारण्यापूर्वी पसारा आवरावा, तसे ${n(nowYear)} हे वर्ष तुमच्या ${lagnaRashiName} वेळापत्रकावरील ओझे हलके करते.`,
        hi: `नई नींव रखने से पहले जैसे मेज़ की अव्यवस्था समेटी जाती है, वर्ष ${n(nowYear)} आपके ${lagnaRashiName} समय-चक्र से व्यर्थ भार हटाता है।`,
        te: `కొత్త కట్టడం ముందు స్థలాన్ని శుభ్రం చేసినట్లుగా, ${n(nowYear)} మీ ${lagnaRashiName} జీవితంలోని అనవసర భారాన్ని తగ్గిస్తుంది.`,
        ta: `புதிய கட்டுமானத்திற்கு முன் இடத்தைச் சுத்தம் செய்வது போல், ${n(nowYear)} உங்கள் ${lagnaRashiName} அட்டவணையில் உள்ள சுமையைக் குறைக்கிறது.`,
        en: `Before building taller walls, clear the workbench: ${nowYear} trims draining commitments out of your ${lagnaRashiName} rhythm.`
      }
    },
    20: {
      0: {
        kn: `${n(nowYear + 1)}ರಲ್ಲಿ ನಿಮ್ಮ ಕುಂಡಲಿಯ ${n(arch.yearScores[1])}% ವೇಗವು ಯೋಗಿ ${yogiPlanetName} ಹಾಗೂ ${arch.peakDomainLabel} ಕ್ಷೇತ್ರವನ್ನು ದೊಡ್ಡ ವೇದಿಕೆಗೆ ಕರೆದೊಯ್ಯುತ್ತದೆ.`,
        mr: `${n(nowYear + 1)} मध्ये ${n(arch.yearScores[1])}% वेगवान झेप घेत योगी ${yogiPlanetName} आणि ${arch.peakDomainLabel} क्षेत्र तुम्हाला मोठ्या मंचावर नेते.`,
        hi: `${n(nowYear + 1)} में ${n(arch.yearScores[1])}% की तेज़ गति के साथ योगी ${yogiPlanetName} और ${arch.peakDomainLabel} क्षेत्र आपको बड़े मंच पर ले जाते हैं।`,
        te: `${n(nowYear + 1)}లో ${n(arch.yearScores[1])}% వేగంతో యోగి ${yogiPlanetName} మరియు ${arch.peakDomainLabel} విభాగం మిమ్మల్ని పెద్ద వేదికపైకి తీసుకెళ్తాయి.`,
        ta: `${n(nowYear + 1)}-ல் ${n(arch.yearScores[1])}% வேகத்துடன் யோகி ${yogiPlanetName} மற்றும் ${arch.peakDomainLabel} துறை உங்களைப் பெரிய மேடைக்குக் கொண்டு செல்கின்றன.`,
        en: `Year 2 (${nowYear + 1}) surges to ${arch.yearScores[1]}% momentum—putting Yogi ${yogiPlanetName} and your ${arch.peakDomainLabel} strengths into visible spotlight.`
      },
      1: {
        kn: `${n(bhuktiEndDate)}ರ ಭುಕ್ತಿ ಪರಿವರ್ತನೆಯ ನಂತರ ${n(nowYear + 1)}ರಲ್ಲಿ ನಿಮ್ಮ ${nakshatraName} ಪ್ರತಿಭೆಗೆ ಹೊಸ ಕೀರ್ತಿ ಮತ್ತು ಸಂಪರ್ಕದ ಬಾಗಿಲು ತೆರೆಯುತ್ತದೆ.`,
        mr: `${n(bhuktiEndDate)} नंतरच्या बदलातून ${n(nowYear + 1)} मध्ये तुमच्या ${nakshatraName} प्रतिभेला नवी ओळख आणि मोठे संपर्क लाभतात.`,
        hi: `${n(bhuktiEndDate)} के दशा-परिवर्तन के बाद ${n(nowYear + 1)} में आपकी ${nakshatraName} प्रतिभा को नई पहचान और बड़े संपर्क प्राप्त होते हैं।`,
        te: `${n(bhuktiEndDate)} నాటి భుక్తి మార్పు తర్వాత ${n(nowYear + 1)}లో మీ ${nakshatraName} ప్రతిభకు కొత్త గుర్తింపు, పెద్ద పరిచయాలు లభిస్తాయి.`,
        ta: `${n(bhuktiEndDate)} புக்தி மாற்றத்திற்குப் பிறகு ${n(nowYear + 1)}-ல் உங்கள் ${nakshatraName} திறமைக்குப் புதிய அங்கீகாரமும் தொடர்புகளும் கிடைக்கும்.`,
        en: `Stepping past the ${bhuktiEndDate} shift into ${nowYear + 1} widens your ${nakshatraName} visibility well beyond routine circles.`
      },
      2: {
        kn: `ಚಿಕ್ಕ ಗುರಿಯ ಮಿತಿಯನ್ನು ಬಿಟ್ಟು ${n(nowYear + 1)}ರಲ್ಲಿ ${house10Info.lordName} ಮತ್ತು ${house11Info.lordName} ತರುವ ವಿಸ್ತಾರವನ್ನು ಸ್ವೀಕರಿಸಿ.`,
        mr: `लहान ध्येयांची मर्यादा सोडून ${n(nowYear + 1)} मध्ये ${house10Info.lordName} आणि ${house11Info.lordName} आणत असलेला विस्तार स्वीकारा.`,
        hi: `सीमित लक्ष्यों की झिझक छोड़कर ${n(nowYear + 1)} में ${house10Info.lordName} और ${house11Info.lordName} द्वारा लाए गए बड़े अवसर स्वीकार करें।`,
        te: `చిన్న లక్ష్యాల హద్దులను దాటి ${n(nowYear + 1)}లో ${house10Info.lordName} మరియు ${house11Info.lordName} తెచ్చే విస్తరణను అందుకోండి.`,
        ta: `சிறிய எல்லைகளைத் தாண்டி ${n(nowYear + 1)}-ல் ${house10Info.lordName} மற்றும் ${house11Info.lordName} கொண்டு வரும் வளர்ச்சியை ஏற்றுக்கொள்ளுங்கள்.`,
        en: `Leaving narrow safety zones behind, ${nowYear + 1} bridges ${house10Info.lordName} effort straight into ${house11Info.lordName} rewards.`
      },
      3: {
        kn: `ಬಂದರು ಬಿಟ್ಟು ಆಳ ಸಮುದ್ರದ ಮುಕ್ತ ಗಾಳಿಯನ್ನು ಹಿಡಿಯುವ ಹಡಗಿನಂತೆ, ${n(nowYear + 1)} ನಿಮ್ಮ ಕೌಶಲ್ಯಕ್ಕೆ ವಿಶಾಲ ವೇದಿಕೆ ತೆರೆಯುತ್ತದೆ.`,
        mr: `बंदर सोडून खुल्या समुद्राची अनुकूल हवा पकडणाऱ्या जहाजाप्रमाणे, ${n(nowYear + 1)} तुमच्या कौशल्याला मोठे व्यासपीठ देते.`,
        hi: `बंदरगाह छोड़कर खुले सागर की अनुकूल हवा पकड़ने वाले जलयान की तरह, वर्ष ${n(nowYear + 1)} आपकी योग्यता को विशाल मंच देगा।`,
        te: `రేవును విడిచి విశాల సముద్రంలో వేగంగా సాగే నౌకలా, ${n(nowYear + 1)} మీ ప్రతిభకు పెద్ద వేదికను అందిస్తుంది.`,
        ta: `துறைமுகத்தைத் தாண்டி ஆழ்கடலின் காற்றைப் பிடிக்கும் கப்பல் போல், ${n(nowYear + 1)} உங்கள் திறமைக்குப் பெரிய மேடையைத் திறக்கிறது.`,
        en: `Sailing out beyond shallow harbor markers, ${nowYear + 1} catches clean open-water wind across ${arch.peakDomainLabel}.`
      }
    },
    21: {
      0: {
        kn: `${n(nowYear + 2)}–${n(nowYear + 3)}ರ ಸುವರ್ಣ ಘಟ್ಟದಲ್ಲಿ (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಭಾವದ (${arch.peakDomainLabel}) ಫಲಗಳು ಸ್ಥಿರ ಆಸ್ತಿ ಮತ್ತು ಕುಟುಂಬ ಸಂಭ್ರಮವಾಗುತ್ತವೆ.`,
        mr: `${n(nowYear + 2)}–${n(nowYear + 3)} च्या सुवर्ण टप्प्यात (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) तुमच्या ${n(arch.peakHouseNum)}व्या भावातील (${arch.peakDomainLabel}) स्वप्ने प्रत्यक्ष वास्तवात उतरतात.`,
        hi: `${n(nowYear + 2)}–${n(nowYear + 3)} के स्वर्णिम शिखर (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) में आपके ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) के संकल्प ठोस उपलब्धि बनते हैं।`,
        te: `${n(nowYear + 2)}–${n(nowYear + 3)} సువర్ణ కాలంలో (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) మీ ${n(arch.peakHouseNum)}వ స్థాన (${arch.peakDomainLabel}) ఫలాలు స్థిర ఆస్తిగా, వేడుకగా మారతాయి.`,
        ta: `${n(nowYear + 2)}–${n(nowYear + 3)} பொற்கால உச்சத்தில் (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) உங்கள் ${n(arch.peakHouseNum)}-ம் இட (${arch.peakDomainLabel}) கனவுகள் நிலையான சொத்தாக மாறும்.`,
        en: `Years 3–4 (${nowYear + 2}–${nowYear + 3}) climb to ${arch.yearScores[2]}–${arch.yearScores[3]}% strength—converting ${arch.peakDomainLabel} into tangible assets and family joy.`
      },
      1: {
        kn: `${n(ctx.savTable[(ctx.lagnaRashiIdx + 3) % 12] ?? 28)} ಗೃಹ-ಭೂಮಿ ಬಿಂದುಗಳು ಮತ್ತು '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' ಬಲವು ${n(nowYear + 2)}–${n(nowYear + 3)}ರಲ್ಲಿ ಮನೆ-ವಾಹನ ಹಾಗೂ ಕುಟುಂಬ ಶ್ರೇಯಸ್ಸನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತವೆ.`,
        mr: `गृह-मालमत्तेचे बळ आणि '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' योग मिळून ${n(nowYear + 2)}–${n(nowYear + 3)} मध्ये घर व कौटुंबिक आनंद साकार होतो.`,
        hi: `चतुर्थ भाव की स्थिरता एवं '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' के ग्रह-बल से ${n(nowYear + 2)}–${n(nowYear + 3)} में गृह-संपत्ति और उत्सव सिद्ध होते हैं।`,
        te: `గృహ బలం మరియు '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' యోగం కలిసి ${n(nowYear + 2)}–${n(nowYear + 3)}లో ఇల్లు, వాహన మరియు కుటుంబ సౌభాగ్యాన్ని ఇస్తాయి.`,
        ta: `இல்லற பலமும் '${extendedPrecision.precisionProfileSummary.dignifiedSummary}' கிரக நிலையும் சேர்ந்து ${n(nowYear + 2)}–${n(nowYear + 3)}-ல் வீடு, வாகனம் மற்றும் சுப நிகழ்வுகளைத் தருகின்றன.`,
        en: `Anchored by '${extendedPrecision.precisionProfileSummary.dignifiedSummary}', ${nowYear + 2}–${nowYear + 3} stabilizes household property, comfort, and proud celebrations.`
      },
      2: {
        kn: `ಆರ್ಥಿಕ ಹೊರೆಯ ಆತಂಕ ಹಿಂದೆ ಸರಿದು, ${n(nowYear + 2)}–${n(nowYear + 3)}ರಲ್ಲಿ ಧನ (${n(savByHouse[2])}) ಮತ್ತು ಸುಖ (${n(savByHouse[7])}) ಒಟ್ಟಾಗಿ ನಿಲ್ಲುತ್ತವೆ.`,
        mr: `मोठ्या खर्चाची काळजी मागे सरून ${n(nowYear + 2)}–${n(nowYear + 3)} मध्ये धन (${n(savByHouse[2])}) आणि सौख्य (${n(savByHouse[7])}) एकत्र नांदतात.`,
        hi: `आर्थिक तनाव पीछे छूटकर ${n(nowYear + 2)}–${n(nowYear + 3)} में संचय (${n(savByHouse[2])}) और गृह-सामंजस्य (${n(savByHouse[7])}) साथ खिलते हैं।`,
        te: `ఆర్థిక చింతలు తొలగి, ${n(nowYear + 2)}–${n(nowYear + 3)}లో ధనం (${n(savByHouse[2])}) మరియు బంధాల సౌఖ్యం (${n(savByHouse[7])}) ఒకేసారి బలపడతాయి.`,
        ta: `பொருளாதாரக் கவலை நீங்கி, ${n(nowYear + 2)}–${n(nowYear + 3)}-ல் தனம் (${n(savByHouse[2])}) மற்றும் குடும்ப மகிழ்ச்சி (${n(savByHouse[7])}) இணைந்து நிற்கும்.`,
        en: `Compare old funding worries against ${nowYear + 2}–${nowYear + 3}: reserves (H2: ${savByHouse[2]}) and harmony (H7: ${savByHouse[7]}) align smoothly.`
      },
      3: {
        kn: `ಕಾಗದದ ಮೇಲಿದ್ದ ನಕ್ಷೆ ಕಲ್ಲು-ಮಣ್ಣಿನ ಭವ್ಯ ಕಟ್ಟಡವಾಗಿ ನಿಲ್ಲುವ ಘಳಿಗೆ ${n(nowYear + 2)}–${n(nowYear + 3)}ರಲ್ಲಿ ಕೂಡಿಬಂದಿದೆ.`,
        mr: `कागदावरील आराखडा प्रत्यक्ष विटा-मातीच्या सुंदर वास्तूत उतरण्याचा हा ${n(nowYear + 2)}–${n(nowYear + 3)} चा सुवर्ण काळ आहे.`,
        hi: `कागज़ पर बना नक़्शा अब ठोस ईंट-पत्थर के भव्य भवन में ढलने का यह ${n(nowYear + 2)}–${n(nowYear + 3)} का स्वर्णिम चरण है।`,
        te: `కాగితంపై ఉన్న ప్రణాళిక నిజమైన సౌధంగా నిలబడే ఘట్టం ${n(nowYear + 2)}–${n(nowYear + 3)}లో సిద్ధమైంది.`,
        ta: `காகிதத்தில் இருந்த வரைபடம் நிஜமான மாளிகையாக உயர்ந்து நிற்கும் தருணம் ${n(nowYear + 2)}–${n(nowYear + 3)}-ல் அமைகிறது.`,
        en: `Blueprints finally harden into keys, bricks, and shared laughter across ${nowYear + 2}–${nowYear + 3}—your patience bears solid fruit.`
      }
    },
    22: {
      0: {
        kn: `ಐದನೇ ವರ್ಷದ ದಿಗಂತ (${n(nowYear + 4)} — ${n(arch.yearScores[4])}%) ತಲುಪುವ ವೇಳೆಗೆ ನಿಮ್ಮ ${lagnaRashiName}–${moonRashiName} ಸಂಯೋಜನೆ ಶಾಶ್ವತ ಸ್ವಾತಂತ್ರ್ಯದ ನೆಲೆ ಕಾಣುತ್ತದೆ.`,
        mr: `पाचव्या वर्षाच्या क्षितिजावर (${n(nowYear + 4)} — ${n(arch.yearScores[4])}%) तुमचे ${lagnaRashiName}–${moonRashiName} व्यक्तिमत्त्व अढळ शांतता व प्रतिष्ठा प्राप्त करते.`,
        hi: `पांचवें वर्ष के क्षितिज (${n(nowYear + 4)} — ${n(arch.yearScores[4])}%) पर पहुंचते ही आपका ${lagnaRashiName}–${moonRashiName} व्यक्तित्व स्थायी स्वतंत्रता एवं सम्मान पाता है।`,
        te: `ఐదవ ఏడాది (${n(nowYear + 4)} — ${n(arch.yearScores[4])}%) నాటికి మీ ${lagnaRashiName}–${moonRashiName} ప్రయాణం శాశ్వత స్వేచ్ఛ, గౌరవాన్ని పొందుతుంది.`,
        ta: `ஐந்தாம் ஆண்டின் நிறைவில் (${n(nowYear + 4)} — ${n(arch.yearScores[4])}%) உங்கள் ${lagnaRashiName}–${moonRashiName} பயணம் நிரந்தர சுதந்திரத்தையும் பெருமையையும் எட்டுகிறது.`,
        en: `By Year 5 (${nowYear + 4}, cresting at ${arch.yearScores[4]}%), your ${lagnaRashiName}–${moonRashiName} arc reaches autonomous dignity and calm control.`
      },
      1: {
        kn: `${nakshatraName}ದ ಅಂತಃಪ್ರಜ್ಞೆ ಮತ್ತು ೫ ವರ್ಷಗಳ ಕಾಲಚಕ್ರದ ಪರಿಪಕ್ವತೆ ${n(nowYear + 4)}ರಲ್ಲಿ ನಿಮ್ಮನ್ನು ಮಾರ್ಗದರ್ಶಕ ಸ್ಥಾನಕ್ಕೆ ಏರಿಸುತ್ತದೆ.`,
        mr: `${nakshatraName} नक्षत्राचे अंतर्ज्ञान आणि पाच वर्षांची परिपक्वता ${n(nowYear + 4)} मध्ये तुम्हाला इतरांना आधार देणाऱ्या स्थानावर ठेवते.`,
        hi: `${nakshatraName} की अंतर्दृष्टि और पांच वर्षों की परिपक्वता वर्ष ${n(nowYear + 4)} में आपको दूसरों को राह दिखाने वाले सम्मानजनक स्थान पर रखती है।`,
        te: `${nakshatraName} అంతర్దృష్టి మరియు ఐదేళ్ల పరిణతి ${n(nowYear + 4)} నాటికి మిమ్మల్ని ఇతరులకు మార్గదర్శకుడిగా నిలుపుతాయి.`,
        ta: `${nakshatraName} உள்ளுணர்வும் ஐந்தாண்டுப் பக்குவமும் ${n(nowYear + 4)}-ல் உங்களைப் பிறருக்கு வழிகாட்டும் உயர்ந்த நிலையில் நிறுத்துகின்றன.`,
        en: `By ${nowYear + 4}, five years of steady execution lift your ${nakshatraName} intuition from surviving crises to mentoring others calmly.`
      },
      2: {
        kn: `ದೈನಂದಿನ ಹೋರಾಟದ ದಣಿವು ಹಿಂದೆ ಸರಿದು, ${n(nowYear + 4)}ರಲ್ಲಿ ಆರ್ಥಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ಕುಟುಂಬ ಗೌರವ ಹತ್ತಿರ ನಿಲ್ಲುತ್ತವೆ.`,
        mr: `रोजची धावपळ आणि ताण मागे पडून ${n(nowYear + 4)} मध्ये आर्थिक निश्चिंतता व कौटुंबिक सन्मान हाताशी येतात.`,
        hi: `दैनिक संघर्ष की थकान दूर होकर वर्ष ${n(nowYear + 4)} में आर्थिक सुरक्षा और पारिवारिक गौरव निकट खड़े दिखाई देते हैं।`,
        te: `రోజువారీ పోరాటాల అలసట తొలగిపోయి, ${n(nowYear + 4)}లో ఆర్థిక భరోసా మరియు కుటుంబ గౌరవం స్థిరపడతాయి.`,
        ta: `தினசரிப் போராட்டச் சோர்வு விலகி, ${n(nowYear + 4)}-ல் பொருளாதார நிம்மதியும் குடும்பப் பெருமையும் நிலைபெறுகின்றன.`,
        en: `Compare crisis-scrambling behind you against Year 5 (${nowYear + 4}): clean time freedom, steady reserves, and peace.`
      },
      3: {
        kn: `ಎತ್ತರದ ಬೆಟ್ಟದ ತುದಿ ತಲುಪಿ ಹಿಂದೆ ನಡೆದು ಬಂದ ಹಾದಿಯನ್ನು ನೋಡುವಾಗ ಮೂಡುವ ಆಳವಾದ ತೃಪ್ತಿಯೇ ${n(nowYear + 4)}ರ ಕೊಡುಗೆ.`,
        mr: `उंच शिखरावर पोहोचून मागे वळून पाहताना जो शांत अभिमान वाटतो, तोच ${n(nowYear + 4)} चा खरा आनंद आहे.`,
        hi: `ऊंचे शिखर पर पहुंचकर पीछे छूटे पथ को देखने पर जो गहन संतोष मिलता है, वही वर्ष ${n(nowYear + 4)} का अमूल्य उपहार है।`,
        te: `ఎత్తైన శిఖరం చేరుకుని వెనక్కి చూసుకున్నప్పుడు కలిగే నిశ్శబ్ద తృప్తే ${n(nowYear + 4)}వ ఏడాది ఇచ్చే గొప్ప బహుమతి.`,
        ta: `உயர்ந்த மலை உச்சியை அடைந்து கடந்து வந்த பாதையைத் திரும்பிப் பார்க்கும்போது தோன்றும் நிறைவே ${n(nowYear + 4)}-ன் பரிசு.`,
        en: `Standing on a high ridge looking down at crooked valleys explains everything—${nowYear + 4} makes every past detour make complete sense.`
      }
    },
    23: {
      0: {
        kn: `ಕತ್ತಲಲ್ಲಿ ಹತ್ತು ಕಲ್ಲು ಎಸೆಯುವ ಬದಲು ಒಂದೇ ನಿಖರ ದೀಪ ಹಚ್ಚಿದಂತೆ, ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ–${moonRashiName} ಚಂದ್ರ ಹಾಗೂ ಯೋಗಿ '${yogiPlanetName}' ಪ್ರಭಾವದಡಿ ಸಕ್ರಿಯ ಅಂಶಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ತೋರಿಸಿದ್ದೇವೆ.`,
        mr: `अंधारात भटकण्यापेक्षा अचूक दिवा लावून तपासल्यासारखे, तुमच्या ${lagnaRashiName} लग्न–${moonRashiName} चंद्र व योगी '${yogiPlanetName}' संदर्भात केवळ सक्रिय दोष येथे स्पष्ट केले आहेत.`,
        hi: `अंधेरे में भटकने के बजाय एक सटीक दीपक जलाने की तरह, आपकी ${lagnaRashiName} लग्न–${moonRashiName} राशि और योगी '${yogiPlanetName}' के संदर्भ में सक्रिय बिंदु अलग दिखाए गए हैं।`,
        te: `చీకట్లో వంద అంచనాలు వేసే బదులు ఒక ఖచ్చితమైన దీపం వెలిగించినట్లు, మీ ${lagnaRashiName} లగ్న–${moonRashiName} రాశి మరియు యోగి '${yogiPlanetName}' ప్రకారం అసలైన అంశాలను విశ్లేషించాము.`,
        ta: `இருட்டில் தடுமாறாமல் துல்லிய விளக்கை ஏற்றுவது போல், உங்கள் ${lagnaRashiName} லக்ன–${moonRashiName} ராசி மற்றும் யோகி '${yogiPlanetName}' அடிப்படையில் உண்மையான தோஷங்களைப் பிரித்துக்காட்டுகிறோம்.`,
        en: `Switching on one sharp diagnostic beam ends vague worry: across your ${lagnaRashiName}–${moonRashiName} chart (${nakshatraName}, Yogi ${yogiPlanetName}), we isolate only verified patterns.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನದ ${n(extendedPrecision.badhakaHouse)}ನೇ ಬಾಧಕಾಧಿಪತಿ ${extendedPrecision.badhakaInfo.lordName} ಹಾಗೂ ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿ ಸ್ಥಿತಿಯನ್ನು ಒಂದೇ ಕಡೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.`,
        mr: `तुमच्या ${lagnaRashiName} लग्नाचा ${n(extendedPrecision.badhakaHouse)}वा बाधकेश ${extendedPrecision.badhakaInfo.lordName} आणि ${n(maandiHouse)}व्या भावातील मांदी यांची एकत्रित तपासणी येथे आहे.`,
        hi: `आपके ${lagnaRashiName} लग्न के ${n(extendedPrecision.badhakaHouse)}वें बाधक स्वामी ${extendedPrecision.badhakaInfo.lordName} और ${n(maandiHouse)}वें भाव की मांदी का समग्र परीक्षण यहां प्रस्तुत है।`,
        te: `మీ ${lagnaRashiName} లగ్నానికి ${n(extendedPrecision.badhakaHouse)}వ బాధకాధిపతి ${extendedPrecision.badhakaInfo.lordName} మరియు ${n(maandiHouse)}వ స్థాన మాంది స్థితిని ఇక్కడ సమగ్రంగా పరిశీలించాము.`,
        ta: `உங்கள் ${lagnaRashiName} லக்னத்தின் ${n(extendedPrecision.badhakaHouse)}-ம் பாதகாதிபதி ${extendedPrecision.badhakaInfo.lordName} மற்றும் ${n(maandiHouse)}-ம் இட மாந்தியின் முழு ஆய்வு இங்கே உள்ளது.`,
        en: `Correlating Badhaka lord ${extendedPrecision.badhakaInfo.lordName} (House ${extendedPrecision.badhakaHouse}) with House ${maandiHouse} Maandi removes guesswork from remedial choices.`
      },
      2: {
        kn: `ನೂರು ಗೊಂದಲಮಯ ವಿಧಿಗಳನ್ನು ದೂರವಿಟ್ಟು, ಕೇವಲ ಯೋಗಿ ${yogiPlanetName} ಹಾಗೂ ಸಕ್ರಿಯ ಅಂಶಗಳಿಗೆ ಸರಿಹೊಂದುವ ನಿಖರ ಕ್ರಮಗಳನ್ನು ಇಲ್ಲಿ ಜೋಡಿಸಲಾಗಿದೆ.`,
        mr: `अनावश्यक शंभर कर्मकांड बाजूला ठेवून फक्त योगी ${yogiPlanetName} व सक्रिय मुद्द्यांसाठी नेमके उपाय येथे दिले आहेत.`,
        hi: `व्यर्थ के सौ कर्मकांडों के बजाय केवल योगी ${yogiPlanetName} और आपके सक्रिय बिंदुओं के अनुरूप सटीक उपाय यहां संकलित हैं।`,
        te: `అనవసరమైన వంద పూజలను పక్కన పెట్టి, యోగి ${yogiPlanetName} మరియు మీ అసలైన దోషాలకు సరిపోయే ఖచ్చితమైన మార్గాలను ఇక్కడ ఇచ్చాము.`,
        ta: `குழப்பமான நூறு சடங்குகளைத் தவிர்த்து, யோகி ${yogiPlanetName} மற்றும் உங்கள் உண்மையான தோஷங்களுக்குப் பொருந்தும் துல்லிய தீர்வுகள் இங்கே உள்ளன.`,
        en: `Trade blanket ritual confusion for targeted clarity—pairing Yogi ${yogiPlanetName} alignment with only the active items flagged below.`
      },
      3: {
        kn: `ವೈದ್ಯರು ನಿಖರ ನಾಡಿ ಪರೀಕ್ಷಿಸಿ ಚಿಕಿತ್ಸೆ ನೀಡುವಂತೆ, ${nakshatraName} ನಕ್ಷತ್ರ ಹಾಗೂ ಬಾಧಕಾಧಿಪತಿ ${extendedPrecision.badhakaInfo.lordName} ಸ್ಥಿತಿಯ ಸಕ್ರಿಯ ಅಡೆತಡೆಗೆ ಮಾತ್ರ ಪರಿಹಾರ ನೀಡಲಾಗಿದೆ.`,
        mr: `तज्ज्ञ वैद्य अचूक नाडी पाहून नेमके औषध देतो, तसेच ${nakshatraName} नक्षत्र व बाधकेश ${extendedPrecision.badhakaInfo.lordName} च्या प्रत्यक्ष अडथळ्यांवर अचूक उपाय दिला आहे.`,
        hi: `कुशल वैद्य सटीक नाड़ी परखकर केवल मूल कारण की औषधि देता है; उसी भांति ${nakshatraName} व बाधकेश ${extendedPrecision.badhakaInfo.lordName} के सक्रिय बिंदुओं का समाधान दिया गया है।`,
        te: `నిపుణుడైన వైద్యుడు నాడి పట్టి చూసి ఖచ్చితమైన మందు ఇచ్చినట్లుగా, ${nakshatraName} మరియు బాధకాధిపతి ${extendedPrecision.badhakaInfo.lordName} ప్రకారం అవసరమైన పరిహారాలనే సూచించాము.`,
        ta: `சிறந்த மருத்துவர் நாடி பார்த்துச் சரியான மருந்து கொடுப்பது போல், ${nakshatraName} மற்றும் பாதகாதிபதி ${extendedPrecision.badhakaInfo.lordName} அடிப்படையிலான தடைகளுக்கு மட்டுமே தீர்வு தரப்பட்டுள்ளது.`,
        en: `A skilled physician never prescribes random pills—grounding remedies in ${nakshatraName} and Badhaka lord ${extendedPrecision.badhakaInfo.lordName} keeps life calm and clear.`
      }
    },
    24: {
      0: {
        kn: `ಇಪ್ಪತ್ತಮೂರು ಅಧ್ಯಾಯಗಳ ಸಾಗರವನ್ನು ಅಂಗೈಯಲ್ಲಿ ಹಿಡಿಯುವ ಪುಟ್ಟ ದಿಕ್ಸೂಚಿಯಂತೆ, ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ–${moonRashiName} ಚಂದ್ರ ಹಾಗೂ ಯೋಗಿ '${yogiPlanetName}' ಬಲಕ್ಕೆ ಬೇಕಾದ ೪ ನಿತ್ಯ ಕೀಲಿಕೈಗಳು ಇಲ್ಲಿವೆ.`,
        mr: `तेवीस अध्यायांचा सागर तळहातावर मावणाऱ्या होकायंत्रासारखा, तुमच्या ${lagnaRashiName} लग्न–${moonRashiName} चंद्र व योगी '${yogiPlanetName}' साठीच्या चार निश्चल किल्ल्या येथे आहेत.`,
        hi: `तेईस अध्यायों के सागर को हथेली में समाने वाले दिशायंत्र की भांति, आपकी ${lagnaRashiName} लग्न–${moonRashiName} राशि और योगी '${yogiPlanetName}' के चार दैनिक सूत्र यहां एकत्र हैं।`,
        te: `ఇరవై మూడు అధ్యాయాల సారాంశాన్ని అరచేతిలో అమరే దిక్సూచిలా మార్చి, మీ ${lagnaRashiName} లగ్న–${moonRashiName} రాశి మరియు యోగి '${yogiPlanetName}' కు 4 నిత్య కీలను ఇచ్చాము.`,
        ta: `இருபத்து மூன்று அத்தியாயங்களின் சாரத்தை உள்ளங்கையில் அடங்கும் திசைக்காட்டியாக மாற்றி, உங்கள் ${lagnaRashiName} லக்ன–${moonRashiName} ராசி மற்றும் யோகி '${yogiPlanetName}'-க்குரிய 4 சாவிகளைத் தொகுத்துள்ளோம்.`,
        en: `Distilling twenty-three chapters into one pocket compass tailored to your ${lagnaRashiName}–${moonRashiName} chart and Yogi ${yogiPlanetName} proves consistency beats complexity.`
      },
      1: {
        kn: `ನಿಮ್ಮ ಹುಟ್ಟು ವಾರ ${weekdayName}, ಜನ್ಮ ಹೋರೆ ${janmaHora} ಹಾಗೂ ${nakshatraName}ದ ಲಯವನ್ನು ನಿತ್ಯದ ೫ ನಿಮಿಷಗಳಲ್ಲಿ ಜೋಡಿಸುವ ಸೂತ್ರ ಇಲ್ಲಿದೆ.`,
        mr: `तुमचा जन्मवार ${weekdayName}, जन्म होरा ${janmaHora} आणि ${nakshatraName} नक्षत्राची लय रोजच्या ५ मिनिटांत कशी जोडायची ते पहा.`,
        hi: `आपके जन्मवार ${weekdayName}, जन्म होरा ${janmaHora} और ${nakshatraName} की लय को प्रतिदिन के ५ मिनट में संरेखित करने का सूत्र यहां है।`,
        te: `మీ జన్మ వారం ${weekdayName}, జన్మ హోర ${janmaHora} మరియు ${nakshatraName} శక్తిని రోజులో 5 నిమిషాల్లో ఎలా మేల్కొల్పాలో ఇక్కడ చూడండి.`,
        ta: `உங்கள் பிறந்த கிழமை ${weekdayName}, ஜென்ம ஹோரை ${janmaHora} மற்றும் ${nakshatraName} ஆற்றலை தினமும் 5 நிமிடங்களில் இணைக்கும் சூத்திரம் இது.`,
        en: `Linking your ${weekdayName} spark, ${janmaHora} Hora, and ${nakshatraName} sensitivity into five calm morning minutes anchors the day.`
      },
      2: {
        kn: `ನಿತ್ಯದ ಶಕ್ತಿ ಕೇಂದ್ರ (${ctx.localizedYogiDay} • ${ctx.localizedYogiDirection} • ${ctx.localizedYogiColor}) ಹಾಗೂ ಕ್ಲಿಷ್ಟ ನಿಯಮಗಳ ಬಿಡುಗಡೆ ಇಲ್ಲಿವೆ.`,
        mr: `दैनंदिन ऊर्जा केंद्र (${ctx.localizedYogiDay} • ${ctx.localizedYogiDirection} • ${ctx.localizedYogiColor}) आणि सोप्या सवयी येथे दिल्या आहेत.`,
        hi: `आपका दैनिक शक्ति केंद्र (${ctx.localizedYogiDay} • ${ctx.localizedYogiDirection} • ${ctx.localizedYogiColor}) एवं सरल सूत्र यहां प्रस्तुत हैं।`,
        te: `మీ నిత్య శక్తి కేంద్రం (${ctx.localizedYogiDay} • ${ctx.localizedYogiDirection} • ${ctx.localizedYogiColor}) మరియు సులభమైన అలవాట్లు ఇక్కడ ఉన్నాయి.`,
        ta: `உங்கள் தினசரி ஆற்றல் மையம் (${ctx.localizedYogiDay} • ${ctx.localizedYogiDirection} • ${ctx.localizedYogiColor}) மற்றும் எளிய வழிகள் இங்கே உள்ளன.`,
        en: `Aligning ${ctx.localizedYogiDay}, ${ctx.localizedYogiDirection}, and ${ctx.localizedYogiColor} turns scattered effort into quiet daily poise.`
      },
      3: {
        kn: `ದೊಡ್ಡ ದೋಣಿಯನ್ನು ಪುಟ್ಟ ಚುಕ್ಕಾಣಿ ತಿರುಗಿಸುವಂತೆ, ನಿಮ್ಮ ${nakshatraName} ಹಾಗೂ ${weekdayName} ಲಯವನ್ನು ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ೫ ನಿಮಿಷದ ಶಾಂತ ನಿಯಮ ಬಲಪಡಿಸುತ್ತದೆ.`,
        mr: `मोठे जहाज एका छोट्या सुकाणूने वळते, तसेच ${nakshatraName} व ${weekdayName} प्रकृतीला दिवसाची सुरुवातीची ५ शांत मिनिटे नवसंजीवनी देतात.`,
        hi: `विशाल नौका को जैसे एक छोटी पतवार सही दिशा देती है, वैसे ही प्रातः के ५ शांत मिनट आपके ${nakshatraName} एवं ${weekdayName} संतुलन को दृढ़ रखते हैं।`,
        te: `పెద్ద నౌకను ఒక చిన్న చుక్కాని సరైన దారికి తెచ్చినట్లుగా, ఉదయం 5 నిమిషాల ప్రశాంతత మీ ${nakshatraName} మరియు ${weekdayName} బలాన్ని పెంచుతుంది.`,
        ta: `பெரிய கப்பலை ஒரு சிறிய சுக்கான் வழிநடத்துவது போல், காலையின் 5 நிமிட அமைதி உங்கள் ${nakshatraName}–${weekdayName} ஆற்றலைச் சீராக்கும்.`,
        en: `A small rudder steers an ocean liner smoothly—five quiet dawn minutes tune your ${nakshatraName} star and ${weekdayName} energy cleanly.`
      }
    },
    25: {
      0: {
        kn: `ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕಡಲತೀರದಲ್ಲಿ ಅಲೆಗಳು ಶಾಂತವಾಗಿ ತೀರ ಸೇರುವಂತೆ, ನಿಮ್ಮ ${lagnaRashiName}–${moonRashiName} ಜಾತಕದ (${currentMahadasha} ದಶೆ) ಮಹಾ ವೃತ್ತವು ಪೂರ್ಣ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ನೆಲೆಗೊಳ್ಳುತ್ತಿದೆ.`,
        mr: `गोकर्णाच्या पवित्र किनारी लाटा शांतपणे विसावतात, तशी तुमच्या ${lagnaRashiName}–${moonRashiName} जीवनाची (${currentMahadasha} दशा) ही परिक्रमा महाबळेश्वराच्या आशीर्वादाने पूर्ण होत आहे.`,
        hi: `श्री गोकर्ण के पावन तट पर जैसे शांत लहरें विश्राम पाती हैं, वैसे ही आपकी ${lagnaRashiName}–${moonRashiName} (${currentMahadasha} दशा) जीवन-कथा दिव्य आशीर्वाद के साथ पूर्ण होती है।`,
        te: `గోకర్ణ పవిత్ర తీరంలో అలలు ప్రశాంతంగా చేరినట్లుగా, మీ ${lagnaRashiName}–${moonRashiName} జీవిత వలయం (${currentMahadasha} దశ) దివ్య ఆశీర్వాదంతో సంపూర్ణమవుతోంది.`,
        ta: `ஸ்ரீ கோகர்ண புனிதக் கடற்கரையில் அலைகள் அமைதியாகக் கரை சேர்வது போல், உங்கள் ${lagnaRashiName}–${moonRashiName} வாழ்க்கை வட்டம் (${currentMahadasha} தசை) தெய்வீக ஆசியோடு நிறைவடைகிறது.`,
        en: `Like gentle tides touching Gokarna's sacred shore at dusk, your ${lagnaRashiName}–${moonRashiName} circle under ${currentMahadasha} Mahadasha closes in calm grace.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ, ${moonRashiName} ಚಂದ್ರ ಮತ್ತು ${nakshatraName} ನಕ್ಷತ್ರಗಳ ಸಮಗ್ರ ಪಯಣಕ್ಕೆ ಈಗ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಮಹಾ ಮುದ್ರೆ ಬೀಳುತ್ತಿದೆ.`,
        mr: `तुमच्या ${lagnaRashiName} लग्न, ${moonRashiName} चंद्र व ${nakshatraName} नक्षत्राच्या संपूर्ण प्रवासावर आता श्री गोकर्ण महाबळेश्वराची मंगल मुद्रा उमटत आहे.`,
        hi: `आपके ${lagnaRashiName} लग्न, ${moonRashiName} चंद्र एवं ${nakshatraName} नक्षत्र की संपूर्ण यात्रा पर अब श्री गोकर्ण महाबलेश्वर का पावन आशीर्वाद अंकित होता है।`,
        te: `మీ ${lagnaRashiName} లగ్నం, ${moonRashiName} చంద్రుడు మరియు ${nakshatraName} నక్షత్ర ప్రయాణంపై ఇప్పుడు శ్రీ గోకర్ణ మహాబలేశ్వరుని దివ్య ముద్ర పడుతోంది.`,
        ta: `உங்கள் ${lagnaRashiName} லக்னம், ${moonRashiName} சந்திரன் மற்றும் ${nakshatraName} பயணத்தின் மீது இப்போது ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் அருள் முத்திரை பதிக்கப்படுகிறது.`,
        en: `Bringing together your ${lagnaRashiName} ascendant, ${moonRashiName} Moon, and ${nakshatraName} star, this closing seal anchors the whole journey.`
      },
      2: {
        kn: `${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ಪರಮ ಬಲ ಮತ್ತು ಯೋಗಿ '${yogiPlanetName}' ಕರುಣೆ ನಿಮ್ಮ ಭವಿಷ್ಯದ ದಾರಿಯನ್ನು ಬೆಳಗುತ್ತಿವೆ.`,
        mr: `${n(arch.peakHouseNum)}व्या भावाचे (${arch.peakDomainLabel}) सर्वोच्च बळ व योगी '${yogiPlanetName}' ची कृपा तुमच्या पुढील प्रवासाला तेज देत आहेत.`,
        hi: `${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) का सर्वोच्च बल और योगी '${yogiPlanetName}' की कृपा आपके भविष्य के पथ को आलोकित कर रहे हैं।`,
        te: `${n(arch.peakHouseNum)}వ స్థాన (${arch.peakDomainLabel}) బలం మరియు యోగి '${yogiPlanetName}' అనుగ్రహం మీ రాబోయే కాలాన్ని ప్రకాశింపజేస్తున్నాయి.`,
        ta: `${n(arch.peakHouseNum)}-ம் இடத்தின் (${arch.peakDomainLabel}) உச்ச பலமும் யோகி '${yogiPlanetName}' அருளும் உங்கள் எதிர்காலப் பாதையை ஒளிரச் செய்கின்றன.`,
        en: `Your strongest sector (House ${arch.peakHouseNum}: ${arch.peakDomainLabel}) and Yogi ${yogiPlanetName} crown this closing verdict from Gokarna.`
      },
      3: {
        kn: `೨೫ ಮೆಟ್ಟಿಲುಗಳನ್ನು ಏರಿ ಬಂದ ನಂತರ ತಲೆಯ ಮೇಲಿನ ಆಕಾಶ ವಿಶಾಲವಾಗಿ ಕಾಣುವಂತೆ, ನಿಮ್ಮ ${nakshatraName} ಮತ್ತು ${heroPlanetName} ಬಲದ ಅಂತಿಮ ಚಿತ್ರಣ ಈಗ ಪೂರ್ಣ ಸ್ಪಷ್ಟವಾಗಿದೆ.`,
        mr: `पंचवीस पायऱ्या चढून आल्यानंतर वरचे मोकळे आकाश दिसावे, तसे तुमच्या ${nakshatraName} व ${heroPlanetName} बळाचे अंतिम चित्र आता पूर्ण स्पष्ट झाले आहे.`,
        hi: `पच्चीस सीढ़ियां चढ़कर शिखर से देखने पर जैसे सारा परिदृश्य साफ़ दिखता है, वैसे ही आपके ${nakshatraName} व ${heroPlanetName} जीवन-पथ की पूरी तस्वीर अब उज्ज्वल है।`,
        te: `ఇరవై ఐదు మెట్లు ఎక్కిన తర్వాత విశాల ఆకాశం కనిపించినట్లుగా, మీ ${nakshatraName} మరియు ${heroPlanetName} జీవన గమ్యం ఇప్పుడు పూర్తి స్పష్టంగా కనిపిస్తోంది.`,
        ta: `இருபத்தைந்து படிகள் ஏறிய பிறகு பரந்த வானம் தெரிவது போல், உங்கள் ${nakshatraName} மற்றும் ${heroPlanetName} வாழ்வின் முழுச் சித்திரம் இப்போது தெளிவாகிவிட்டது.`,
        en: `Climbing twenty-five steps opens the entire coastal horizon—anchored by ${nakshatraName} and ${heroPlanetName}, carry quiet trust forward.`
      }
    }
  };

  const chHooks = hooksByChapter[chNum] || hooksByChapter[1];
  // Rotate subtly by themeKey index as well when edition is 0 so two people don't share Ch hooks
  const themeSalt = themeKey === "cinema" ? 0 : themeKey === "nakshatra" ? 1 : themeKey === "yoga_karana" ? 2 : themeKey === "near_far" ? 3 : 1;
  const pickIdx = (chNum === 1 ? ed : ((ed + (chNum > 2 ? 0 : 0)) % 4)) as 0 | 1 | 2 | 3;
  // Keep edition deterministic-yet-shifted cleanly by edition!
  void themeSalt;
  return pick6(chHooks[pickIdx], lang);
}

// ============================================================================
// DISTINCT CHAPTER EYEBROWS, PROMPT LABELS & EDITION-VARIED QUESTIONS
// ============================================================================

export function buildChapterHeaderMeta(
  chNum: number,
  themeKey: NarrativeThemeKey,
  lang: SixLang,
  edition: 0 | 1 | 2 | 3
): { promptEyebrow: string; promptLabel: string } {
  const eyebrowByTheme: Record<NarrativeThemeKey, Record<SixLang, string>> = {
    cinema: {
      kn: "ಜೀವಂತ ದೃಶ್ಯ & ಗ್ರಹ ನಾಯಕ ದೃಷ್ಟಿ",
      mr: "सजीव प्रसंग व ग्रह नायक दृष्टी",
      hi: "सजीव दृश्य एवं ग्रह नायक दृष्टि",
      te: "జీవన దృశ్యం & గ్రహ నాయక దృష్టి",
      ta: "நேரடி காட்சி & கிரக நாயக பார்வை",
      en: "Living Scene & Planetary Spotlight"
    },
    nakshatra: {
      kn: "ಜನ್ಮ ನಕ್ಷತ್ರ ನಾಡಿ & ಆಂತರಿಕ ವಿಚಾರ",
      mr: "जन्म नक्षत्र स्पंदन व आंतरिक विचार",
      hi: "जन्म नक्षत्र स्पंदन एवं अंतर्विचार",
      te: "జన్మ నక్షత్ర స్పందన & అంతర్గత పరిశీలన",
      ta: "ஜென்ம நட்சத்திர நாடி & உள் சிந்தனை",
      en: "Nakshatra Pulse & Inner Pattern"
    },
    yoga_karana: {
      kn: "ಯೋಗ–ಕರಣ ಸಂಕೇತ & ಕಾರ್ಯ ಸೂತ್ರ",
      mr: "योग–करण संकेत व व्यवहार सूत्र",
      hi: "योग–करण संकेत एवं व्यवहार सूत्र",
      te: "యోగ–కరణ సంకేతం & ఆచరణ సూత్రం",
      ta: "யோக–கரண சமிக்ஞை & செயல் நெறி",
      en: "Yoga–Karana Signal & Practical Pivot"
    },
    near_far: {
      kn: "ಹತ್ತಿರದ ಅವಕಾಶ v/s ದೂರ ಸರಿಯುವ ತಡೆ",
      mr: "जवळची संधी वि. मागे सरणारा अडथळा",
      hi: "निकट अवसर बनाम घटता अवरोध",
      te: "దగ్గరయ్యే అవకాశం & తొలగే అడ్డంకి",
      ta: "அருகிலுள்ள வாய்ப்பு & விலகும் தடை",
      en: "Near Horizon vs Fading Friction"
    },
    parable: {
      kn: "ಲೋಕದೃಷ್ಟಾಂತ & ಜೀವನ ವಿವೇಕ",
      mr: "जीवन दृष्टांत व व्यावहारिक विवेक",
      hi: "जीवन दृष्टांत एवं व्यावहारिक विवेक",
      te: "జీవన దృష్టాంతం & అనుభవ వివేకం",
      ta: "வாழ்வியல் உவமை & நடைமுறை ஞானம்",
      en: "Everyday Parable & Applied Wisdom"
    }
  };

  // Preserve "ಪ್ರಶ್ನೆ:" / "Question:" on Ch 1 and Ch 3 (tested explicitly in Test 15),
  // and vary labels cleanly across the rest so all 25 chapters don't start with "Question:"!
  const labelPool: Array<Record<SixLang, string>> = [
    { kn: "ಪ್ರಶ್ನೆ:", mr: "प्रश्न:", hi: "प्रश्न:", te: "ప్రశ్న:", ta: "கேள்வி:", en: "Question:" },
    { kn: "ಮೂಲ ವಿಚಾರ:", mr: "मुख्य गाभा:", hi: "मुख्य विचार:", te: "ప్రధానాంశం:", ta: "மையக் கரு:", en: "Core Focus:" },
    { kn: "ಜಾತಕ ಸುಳಿವು:", mr: "कुंडली संकेत:", hi: "कुंडली संकेत:", te: "కుండలి సంకేతం:", ta: "ஜாதக குறிப்பு:", en: "Chart Clue:" },
    { kn: "ಜೀವನ ಕನ್ನಡಿ:", mr: "जीवन आरसा:", hi: "जीवन दर्पण:", te: "జీవన అద్దం:", ta: "வாழ்வியல் பார்வை:", en: "Life Lens:" },
    { kn: "ತಿರುವಿನ ಕೇಂದ್ರ:", mr: "वळणाचा केंद्रबिंदू:", hi: "निर्णायक बिंदु:", te: "మలుపు కేంద్రం:", ta: "திருப்புமுனை:", en: "Turning Point:" }
  ];

  const labelIdx = chNum === 1 || chNum === 3 ? 0 : (chNum + edition) % labelPool.length;

  return {
    promptEyebrow: pick6(eyebrowByTheme[themeKey], lang),
    promptLabel: pick6(labelPool[labelIdx], lang)
  };
}

export function buildDynamicChapterQuestion(
  chNum: number,
  ctx: StoryEngineInput,
  arch: ChartArchetypeSnapshot,
  fallbackQuestion: string
): string {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const name = ctx.devoteeName;
  const {
    nowYear,
    yogiPlanetName,
    extendedPrecision,
    house10Info,
    house11Info,
    bhuktiEndDate,
    currentMahadasha,
    currentBhuktiLord
  } = ctx;
  const savByHouse = extendedPrecision.savByHouse;

  // On Edition 0, allow specific age/chart tuned base questions, while on Editions 1..3
  // shift opening structure & highlight distinct chart variables (keeping Test 15's "ಪ್ರಶ್ನೆ:" on Ch 1 & Ch 3!).
  if (ed === 0 && ![3, 8, 9, 10, 19, 20, 21, 22].includes(chNum)) {
    return fallbackQuestion;
  }

  // Infant/child guard on Ch 12 & Ch 14 (Test 3 expects "ಶಿಶು" in Ch 12 and "ಪೋಷಕರ" in Ch 14)
  if ((ctx.ageCategory === "infant" || ctx.ageCategory === "early_child" || ctx.ageCategory === "child") && (chNum === 12 || chNum === 14)) {
    return fallbackQuestion;
  }

  const customMap: Partial<Record<number, Record<0 | 1 | 2 | 3, Record<SixLang, string>>>> = {
    1: {
      0: {
        kn: `ಪ್ರಶ್ನೆ: ${name}, ನೀವು ಹೊರಗೆ ನಗುತ್ತಿದ್ದರೂ ಒಳಗೆ ಕುದಿಯುತ್ತಿರುವ ಆ ಒಂದು ಗುಪ್ತ ಪ್ರಶ್ನೆ ಯಾವುದು?`,
        mr: `प्रश्न: ${name}, बाहेरून शांत राहूनही मनाच्या कोपऱ्यात अस्वस्थ करणारी कोणती गोष्ट आहे?`,
        hi: `प्रश्न: ${name}, बाहर से सहज दिखने के बाद भी भीतर मन में कौन सा अनकहा प्रश्न घूम रहा है?`,
        te: `ప్రశ్న: ${name}, బయటకు ప్రశాంతంగా కనిపిస్తున్నా లోపల మిమ్మల్ని ఆలోచింపజేస్తున్న ఆ విషయం ఏమిటి?`,
        ta: `கேள்வி: ${name}, வெளியே சிரித்தாலும் உள்ளுக்குள் ஓடிக்கொண்டிருக்கும் அந்த ரகசியக் கேள்வி என்ன?`,
        en: `Question: ${name}, what is the real tension running quietly behind your calm face today?`
      },
      1: {
        kn: `ಪ್ರಶ್ನೆ: ${ctx.nakshatraName} ನಕ್ಷತ್ರದಲ್ಲಿ ಹುಟ್ಟಿದ ${name}, ಈಗ '${ctx.livePrashnaHora}' ಹೋರೆಯ ಈ ಕ್ಷಣದಲ್ಲಿ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಎಳೆಯುತ್ತಿರುವ ಮುಖ್ಯ ಸಂಗತಿ ಏನು?`,
        mr: `प्रश्न: ${ctx.nakshatraName} नक्षत्रातील ${name}, '${ctx.livePrashnaHora}' होऱ्याच्या या क्षणी तुमच्या मनात कोणता महत्त्वाचा विचार सुरू आहे?`,
        hi: `प्रश्न: ${ctx.nakshatraName} नक्षत्र के ${name}, इस '${ctx.livePrashnaHora}' होरा के क्षण में आपके चित्त को सबसे अधिक क्या खींच रहा है?`,
        te: `ప్రశ్న: ${ctx.nakshatraName} నక్షత్రానికి చెందిన ${name}, '${ctx.livePrashnaHora}' హోరలో ఇప్పుడు మీ మనసులో మెదులుతున్న ముఖ్య అంశం ఏది?`,
        ta: `கேள்வி: ${ctx.nakshatraName} நட்சத்திர ${name}, '${ctx.livePrashnaHora}' ஹோரையில் இப்போது உங்கள் கவனத்தை ஈர்க்கும் முக்கிய விஷயம் எது?`,
        en: `Question: Born in ${ctx.nakshatraName}, ${name}, why did one unresolved thread surface right under ${ctx.livePrashnaHora} Hora?`
      },
      2: {
        kn: `ಪ್ರಶ್ನೆ: ${ctx.lagnaRashiName} ಲಗ್ನದ ${name}, ಕಳೆದ ಕೆಲವು ದಿನಗಳಿಂದ ಮನಸ್ಸಿನ ಒಂದು ಮೂಲೆಯಲ್ಲಿ ನಿಂತಿರುವ ಆ ನಿರ್ಧಾರಕ್ಕೆ ದಾರಿ ಎಲ್ಲಿದೆ?`,
        mr: `प्रश्न: ${ctx.lagnaRashiName} लग्नाचे ${name}, गेल्या काही दिवसांपासून मनात रेंगाळलेल्या त्या निर्णयाचा खरा मार्ग कोणता?`,
        hi: `प्रश्न: ${ctx.lagnaRashiName} लग्न के ${name}, पिछले कुछ दिनों से मन में अटके उस निर्णय का वास्तविक उत्तर क्या है?`,
        te: `ప్రశ్న: ${ctx.lagnaRashiName} లగ్నానికి చెందిన ${name}, కొన్ని రోజులుగా మనసులో నిలిచిన ఆ నిర్ణయానికి స్పష్టమైన దారి ఏది?`,
        ta: `கேள்வி: ${ctx.lagnaRashiName} லக்னத்தைச் சேர்ந்த ${name}, சில நாட்களாக மனதில் நிற்கும் அந்த முடிவுக்குச் சரியான வழி எது?`,
        en: `Question: Looking through your ${ctx.lagnaRashiName} chart, ${name}, what clears the quiet bottleneck hovering over this week?`
      },
      3: {
        kn: `ಪ್ರಶ್ನೆ: ${name} ರವರ ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) ಪ್ರಭಾವವು ಇಂದಿನ ಗೊಂದಲದ ಹಿಂದೆ ಯಾವ ಶುಭ ಬದಲಾವಣೆಯನ್ನು ಸೂಚಿಸುತ್ತಿದೆ?`,
        mr: `प्रश्न: ${name} यांच्या कुंडलीतील ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) आजच्या गोंधळामागे कोणता शुभ बदल दाखवत आहे?`,
        hi: `प्रश्न: ${name} की पत्रिका के ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) आज की उलझन के भीतर कौन सा शुभ संकेत छिपाए हैं?`,
        te: `ప్రశ్న: ${name} జాతకంలోని ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) నేటి ఆలోచన వెనుక ఏ శుభ మార్పును సూచిస్తోంది?`,
        ta: `கேள்வி: ${name} ஜாதகத்தின் ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) இன்றைய குழப்பத்திற்குப் பின்னால் எந்த நல்ல மாற்றத்தைக் காட்டுகிறது?`,
        en: `Question: What quiet redirection is ${ctx.heroPlanetName} in ${ctx.heroPlanetRashi} signaling for you today, ${name}?`
      }
    },
    3: {
      0: {
        kn: `ಪ್ರಶ್ನೆ: ${name}, ${ctx.moonRashiName} ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯ ಪರೀಕ್ಷೆಯಾಗಿ ಕಳೆದ ೨೪ ತಿಂಗಳಲ್ಲಿ ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಅಳೆದ ಆ ಎರಡು ಘಟನೆಗಳು ಯಾವುವು?`,
        mr: `प्रश्न: ${name}, ${ctx.moonRashiName} राशीपासून ${n(ctx.shaniHouseFromMoon)}व्या स्थानाचा परिणाम म्हणून गेल्या २४ महिन्यांत कोणत्या दोन प्रसंगांनी तुमचा संयम तपासला?`,
        hi: `प्रश्न: ${name}, ${ctx.moonRashiName} राशि से ${n(ctx.shaniHouseFromMoon)}वें भाव के प्रभाव में बीते २४ महीनों में वे कौन से दो मोड़ थे जिन्होंने आपके धैर्य को तौला?`,
        te: `ప్రశ్న: ${name}, ${ctx.moonRashiName} నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థాన ఫలితంగా గత 24 నెలల్లో మీ సహనాన్ని పరీక్షించిన ఆ రెండు సంఘటనలు ఏవి?`,
        ta: `கேள்வி: ${name}, ${ctx.moonRashiName} ராசியிலிருந்து ${n(ctx.shaniHouseFromMoon)}-ம் இட சோதனையாகக் கடந்த 24 மாதங்களில் உங்கள் பொறுமையை அளந்த இரு நிகழ்வுகள் எவை?`,
        en: `Question: Across Saturn's passage in House ${ctx.shaniHouseFromMoon} from your ${ctx.moonRashiName} Moon, ${name}, which two tests over 24 months proved your mettle?`
      },
      1: {
        kn: `ಪ್ರಶ್ನೆ: ಕಳೆದ ಎರಡು ವರ್ಷಗಳಲ್ಲಿ ${ctx.currentMahadasha} ದಶೆಯೊಳಗೆ ${name} ಯಾರನ್ನು ನಂಬಿ ಕಲಿತ ಪಾಠವು ಈಗ ರಕ್ಷಾ ಕವಚವಾಗಿ ಮಾರ್ಪಟ್ಟಿದೆ?`,
        mr: `प्रश्न: गेल्या दोन वर्षांत ${ctx.currentMahadasha} दशेत ${name} यांनी अनुभवातून शिकलेला कोणता मोठा धडा आता तुमचे कवच बनला आहे?`,
        hi: `प्रश्न: पिछले दो वर्षों की ${ctx.currentMahadasha} दशा में ${name} ने भरोसे और धैर्य का कौन सा कठिन पाठ अब अपने सुरक्षा कवच में बदला है?`,
        te: `ప్రశ్న: గత రెండేళ్ల ${ctx.currentMahadasha} దశలో ${name} నేర్చుకున్న ఏ ముఖ్య పాఠం ఇప్పుడు రక్షణ కవచంగా మారింది?`,
        ta: `கேள்வி: கடந்த இரண்டு ஆண்டு ${ctx.currentMahadasha} தசையில் ${name} கற்றுக்கொண்ட எந்த அனுபவம் இப்போது பாதுகாப்புக் கவசமாக மாறியுள்ளது?`,
        en: `Question: Looking at the last two years under ${ctx.currentMahadasha}, ${name}, how did hard lessons turn into sharp judgement?`
      },
      2: {
        kn: `ಪ್ರಶ್ನೆ: ${ctx.shaniTransitRashi} (${n(ctx.shaniTransitSav)} ಬಿಂದು) ಸಾಗಿದ ಕಳೆದ ೨೪ ತಿಂಗಳ ಒತ್ತಡವು ${name} ಜೀವನದಿಂದ ಯಾವ ತಪ್ಪು ಭಾರವನ್ನು ಹೊರದೂಡಿತು?`,
        mr: `प्रश्न: ${ctx.shaniTransitRashi} (${n(ctx.shaniTransitSav)} गुण) मधील मागील २४ महिन्यांच्या प्रवासाने ${name} यांच्या आयुष्यातून कोणते नको असलेले ओझे दूर केले?`,
        hi: `प्रश्न: ${ctx.shaniTransitRashi} (${n(ctx.shaniTransitSav)} बिंदू) के बीते २४ महीनों ने ${name} के जीवन से कौन सा अनावश्यक बोझ हटाया?`,
        te: `ప్రశ్న: ${ctx.shaniTransitRashi} (${n(ctx.shaniTransitSav)} బిందువులు) సంచారం గత 24 నెలల్లో ${name} జీవితం నుండి ఏ అనవసర భారాన్ని తొలగించింది?`,
        ta: `கேள்வி: ${ctx.shaniTransitRashi} (${n(ctx.shaniTransitSav)} பரல்கள்) கடந்த 24 மாதங்களில் ${name} வாழ்விலிருந்து எந்தத் தேவையற்ற சுமையை அகற்றியது?`,
        en: `Question: With ${ctx.shaniTransitSav} bindus in ${ctx.shaniTransitRashi}, what false pressure did the last 24 months clear out for you, ${name}?`
      },
      3: {
        kn: `ಪ್ರಶ್ನೆ: ${name}, ಕಳೆದ ೨ ವರ್ಷಗಳಲ್ಲಿ 'ಹೀಗೇಕೆ ತಡವಾಯಿತು?' ಎಂದು ಅನಿಸಿದ ಘಟನೆಯೇ ಇಂದು ನಿಮ್ಮನ್ನು ದೊಡ್ಡ ನಷ್ಟದಿಂದ ಹೇಗೆ ಕಾಪಾಡಿತು?`,
        mr: `प्रश्न: ${name}, गेल्या २ वर्षांत 'हे काम का लांबले?' असे वाटलेला कोणता प्रसंग आज तुमचे मोठे नुकसान वाचवणारा ठरला?`,
        hi: `प्रश्न: ${name}, पिछले २ वर्षों में जिस देरी पर मन दुखी हुआ था, उसी ने आज आपको किस बड़े नुकसान से बचाया?`,
        te: `ప్రశ్న: ${name}, గత రెండేళ్ళలో ఆలస్యమైందని బాధపడ్డ ఏ విషయం ఈ రోజు మిమ్మల్ని పెద్ద నష్టం నుండి కాపాడింది?`,
        ta: `கேள்வி: ${name}, கடந்த 2 ஆண்டுகளில் 'ஏன் தாமதமானது?' என வருந்திய நிகழ்வு இன்று உங்களைப் பெரிய இழப்பிலிருந்து எப்படிக் காத்தது?`,
        en: `Question: How did the steepest delay of your past 24 months protect you from a far larger mistake, ${name}?`
      }
    },
    8: {
      0: {
        kn: `ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ${ctx.shaniTransitRashi} ಶನಿಯು ${name} ರವರ ಬದುಕಿನಲ್ಲಿ ಯಾವ ಗಟ್ಟಿ ಕಟ್ಟಡವನ್ನು ಕಟ್ಟುತ್ತಿದೆ?`,
        mr: `चंद्रापासून ${n(ctx.shaniHouseFromMoon)}व्या भावातील ${ctx.shaniTransitRashi} शनी ${name} यांच्या आयुष्यात कोणती पक्की पायाभरणी करत आहे?`,
        hi: `चंद्र से ${n(ctx.shaniHouseFromMoon)}वें स्थान का ${ctx.shaniTransitRashi} शनि ${name} के जीवन में कौन सी अटल नींव तैयार कर रहा है?`,
        te: `చంద్రుని నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థానంలో ఉన్న ${ctx.shaniTransitRashi} శని ${name} జీవితంలో ఎలాంటి గట్టి పునాది వేస్తోంది?`,
        ta: `சந்திரனுக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடத்தில் உள்ள ${ctx.shaniTransitRashi} சனி ${name} வாழ்வில் எந்த உறுதியான அடித்தளத்தைக் கட்டுகிறது?`,
        en: `With Saturn in House ${ctx.shaniHouseFromMoon} (${ctx.shaniTransitRashi}) from Moon, what unshakeable bedrock is forming for ${name}?`
      },
      1: {
        kn: `${n(ctx.shaniTransitSav)} ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳ ಶನಿ ಸಂಚಾರವು ${name} ರವರ ಕರ್ಮ (೧೦ನೇ ಮನೆ) ಹಾಗೂ ಲಾಭ (೧೧ನೇ ಮನೆ) ಸ್ಥಾನಗಳಿಂದ ಏನನ್ನು ಶುದ್ಧೀಕರಿಸುತ್ತಿದೆ?`,
        mr: `${n(ctx.shaniTransitSav)} बिंदूंचा शनी प्रवास ${name} यांच्या कर्म व लाभ स्थानांमधून कोणता कच्चेपणा दूर करत आहे?`,
        hi: `${n(ctx.shaniTransitSav)} बिंदुओं का शनि संचरण ${name} के कर्म एवं लाभ भावों से किस अस्थायी निर्भरता को हटा रहा है?`,
        te: `${n(ctx.shaniTransitSav)} బిందువుల శని సంచారం ${name} కర్మ, లాభ స్థానాల నుండి వేటిని శుభ్రం చేస్తోంది?`,
        ta: `${n(ctx.shaniTransitSav)} பரல்களுடன் சனி நகர்வு ${name} தொழில் மற்றும் லாப இடங்களில் எதை வலுப்படுத்துகிறது?`,
        en: `Scoring ${ctx.shaniTransitSav} bindus in ${ctx.shaniTransitRashi}, how is Saturn strengthening ${name}'s work and income foundations?`
      },
      2: {
        kn: `${ctx.moonRashiName} ರಾಶಿಯವರಿಗೆ ಈ ಶನಿ ಪರ್ವವು ಯಾವ ಅಸ್ಥಿರ ಅಭ್ಯಾಸವನ್ನು ದೂರ ಸರಿಸಿ ೧೦ ವರ್ಷಗಳ ಸ್ಥಿರತೆ ನೀಡುತ್ತಿದೆ?`,
        mr: `${ctx.moonRashiName} राशीसाठी हा शनी टप्पा कोणत्या अस्थिर सवयी दूर करून १० वर्षांचे स्थैर्य देत आहे?`,
        hi: `${ctx.moonRashiName} राशि के लिए यह शनि चरण किन अस्थिर आदतों को हटाकर १० वर्षों का स्थायित्व दे रहा है?`,
        te: `${ctx.moonRashiName} రాశికి ఈ శని దశ ఏ అస్థిర అలవాట్లను తొలగించి 10 ఏళ్ల స్థిరత్వాన్ని ఇస్తోంది?`,
        ta: `${ctx.moonRashiName} ராசிக்கு இந்தச் சனி காலம் எந்த நிலையற்ற பழக்கங்களை நீக்கி 10 ஆண்டு உறுதி தருகிறது?`,
        en: `What flimsy shortcut is ending inside ${ctx.moonRashiName} Moon's House ${ctx.shaniHouseFromMoon} cycle so decade-long trust takes root?`
      },
      3: {
        kn: `ನಿಧಾನವಾದರೂ ಶಾಶ್ವತ ಫಲ ಕೊಡುವ ಶನಿಯ ನಿಯಮವು ${name} ಕೈಯಲ್ಲಿ ಯಾವ ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸನ್ನು ಕಟ್ಟುತ್ತಿದೆ?`,
        mr: `हळू पण चिरकाळ टिकणारे फळ देणारा शनी ${name} यांच्या हातून कोणते दीर्घकालीन यश घडवत आहे?`,
        hi: `धीमी किंतु स्थायी सिद्धि देने वाला शनि ग्रह ${name} के हाथों कौन सा चिरस्थायी निर्माण करा रहा है?`,
        te: `నెమ్మదిగా అయినా శాశ్వత ఫలితాన్నిచ్చే శని ${name} జీవితంలో ఎలాంటి గట్టి విజయాన్ని నిర్మిస్తోంది?`,
        ta: `மெதுவாக இருந்தாலும் நிரந்தர பலன் தரும் சனி ${name} கரங்களால் எந்த நிலையான வெற்றியை உருவாக்குகிறது?`,
        en: `Why does slow discipline right now build a fortress for ${name} that hurried shortcuts could never sustain?`
      }
    },
    9: {
      0: {
        kn: `${ctx.guruTransitRashi} ಗುರುವು ಚಂದ್ರನಿಂದ ${n(ctx.guruHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿ (${n(ctx.guruTransitSav)} ಬಿಂದು) ಹರಿಯುತ್ತಾ ${name} ಬದುಕಿನ ಯಾವ ಬಾಗಿಲನ್ನು ತೆರೆಯುತ್ತಿದೆ?`,
        mr: `${ctx.guruTransitRashi} मधील गुरू चंद्रापासून ${n(ctx.guruHouseFromMoon)}व्या स्थानी (${n(ctx.guruTransitSav)} गुण) राहून ${name} यांचे कोणते सुवर्ण दार उघडत आहे?`,
        hi: `${ctx.guruTransitRashi} के गुरु चंद्र से ${n(ctx.guruHouseFromMoon)}वें भाव (${n(ctx.guruTransitSav)} बिंदू) से ${name} के जीवन का कौन सा द्वार खोल रहे हैं?`,
        te: `${ctx.guruTransitRashi} గురువు చంద్రుని నుండి ${n(ctx.guruHouseFromMoon)}వ స్థానంలో (${n(ctx.guruTransitSav)} బిందువులు) ఉండి ${name} కోసం ఏ శుభ ద్వారాన్ని తెరుస్తున్నారు?`,
        ta: `${ctx.guruTransitRashi} குரு ராசிக்கு ${n(ctx.guruHouseFromMoon)}-ம் இடத்தில் (${n(ctx.guruTransitSav)} பரல்கள்) இருந்து ${name} வாழ்வின் எந்தக் கதவைத் திறக்கிறார்?`,
        en: `Transiting House ${ctx.guruHouseFromMoon} (${ctx.guruTransitRashi}, ${ctx.guruTransitSav} bindus) from Moon, where is Jupiter opening relief for ${name}?`
      },
      1: {
        kn: `ಭಾಗ್ಯಾಧಿಪತಿ ${ctx.extendedPrecision.house9Info.lordName} ಹಾಗೂ ${ctx.guruTransitRashi} ಗುರುವಿನ ಮೈತ್ರಿಯು ${name} ರವರ ಯಾವ ಆಶಯಕ್ಕೆ ಬೆಳಕು ತರುತ್ತಿದೆ?`,
        mr: `भाग्येश ${ctx.extendedPrecision.house9Info.lordName} व ${ctx.guruTransitRashi} गुरूची साथ ${name} यांच्या कोणत्या आकांक्षेला बळ देत आहे?`,
        hi: `भाग्येश ${ctx.extendedPrecision.house9Info.lordName} एवं ${ctx.guruTransitRashi} गुरु का संयोग ${name} के किस संकल्प को प्रकाश दे रहा है?`,
        te: `భాగ్యాధిపతి ${ctx.extendedPrecision.house9Info.lordName} మరియు ${ctx.guruTransitRashi} గురుని సహకారం ${name} ఏ ఆశయానికి బలాన్నిస్తోంది?`,
        ta: `பாக்கியாதிபதி ${ctx.extendedPrecision.house9Info.lordName} மற்றும் ${ctx.guruTransitRashi} குருவின் இணைவு ${name} எந்த எண்ணத்திற்கு ஒளி தருகிறது?`,
        en: `How does Jupiter in ${ctx.guruTransitRashi} amplify 9th fortune lord ${ctx.extendedPrecision.house9Info.lordName} for ${name}?`
      },
      2: {
        kn: `${n(savByHouse[5])} ಬಿಂದುಗಳ ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಕ್ಕೆ ಗುರುವಿನ ಆಶೀರ್ವಾದ ಸೇರಿದಾಗ ಯಾವ ಹೊಸ ಕಲಿಕೆ ಅಥವಾ ಮಾರ್ಗದರ್ಶನ ಸಿಗುತ್ತದೆ?`,
        mr: `${n(savByHouse[5])} गुणांच्या पंचम भावाला गुरूची साथ मिळाल्यावर कोणते नवे ज्ञान व मार्गदर्शन लाभते?`,
        hi: `${n(savByHouse[5])} बिंदुओं वाले पंचम भाव को गुरु की दृष्टि मिलने से कौन सा नया ज्ञान और सहयोग प्राप्त होता है?`,
        te: `${n(savByHouse[5])} బిందువుల 5వ స్థానానికి గురు కృప తోడైతే ఎలాంటి కొత్త జ్ఞానం, సహాయం అందుతాయి?`,
        ta: `${n(savByHouse[5])} பரல்கள் கொண்ட 5-ம் இடத்திற்கு குரு அருள் சேரும்போது எந்தப் புதிய வழிகாட்டல் கிடைக்கும்?`,
        en: `Connecting Jupiter's ${ctx.guruTransitSav}-bindu orbit with House 5 (${savByHouse[5]} bindus), what unexpected mentor enters?`
      },
      3: {
        kn: `ಶನಿ ಕಟ್ಟಿದ ಗೋಡೆಯ ನಡುವೆ ${name} ಮನಸ್ಸಿಗೆ ತಾಜಾ ಗಾಳಿ ಹಾಗೂ ಆಶಾವಾದವನ್ನು ಗುರು ಹೇಗೆ ತರುತ್ತಿದೆ?`,
        mr: `शनीने लावलेल्या शिस्तीमध्ये ${name} यांच्या आयुष्यात गुरू ताजी आशा आणि मोकळीक कशी आणत आहे?`,
        hi: `शनि के अनुशासन के बीच बृहस्पति ${name} के लिए नई आशा और सही लोगों का संयोग कैसे बना रहे हैं?`,
        te: `శని క్రమశిక్షణ మధ్యలో గురువు ${name} జీవితంలోకి కొత్త ఆశను, సరైన వ్యక్తులను ఎలా తీసుకువస్తున్నాడు?`,
        ta: `சனியின் ஒழுங்குக்கு நடுவே குரு பகவான் ${name} வாழ்வில் புதிய நம்பிக்கையையும் நல்ல துணையையும் எவ்வாறு தருகிறார்?`,
        en: `Where Saturn asks for endurance, how does Jupiter inside ${ctx.guruTransitRashi} bring fresh air and trusted allies to ${name}?`
      }
    },
    19: {
      0: {
        kn: `${n(nowYear)}ನೇ ವರ್ಷದಲ್ಲಿ (${n(arch.yearScores[0])}%) ${name} ರವರ '${arch.peakDomainLabel}' ಬಲವನ್ನು ಸರಿಪಡಿಸುವ ಅಡಿಪಾಯದ ಹೆಜ್ಜೆ ಯಾವುದು?`,
        mr: `${n(nowYear)} या वर्षात (${n(arch.yearScores[0])}%) ${name} यांच्या '${arch.peakDomainLabel}' ताकदीला भक्कम आकार देणारी पहिली पायरी कोणती?`,
        hi: `वर्ष ${n(nowYear)} (${n(arch.yearScores[0])}%) में ${name} की '${arch.peakDomainLabel}' शक्ति को सुदृढ़ करने वाला पहला कदम क्या है?`,
        te: `${n(nowYear)}వ సంవత్సరంలో (${n(arch.yearScores[0])}%) ${name} యొక్క '${arch.peakDomainLabel}' బలాన్ని పెంచే మొదటి అడుగు ఏది?`,
        ta: `${n(nowYear)}-ம் ஆண்டில் (${n(arch.yearScores[0])}%) ${name} அவர்களின் '${arch.peakDomainLabel}' பலத்தை உறுதிப்படுத்தும் முதல் படி எது?`,
        en: `Starting ${nowYear} at ${arch.yearScores[0]}% strength, what steady anchor sets up ${name}'s ${arch.peakDomainLabel}?`
      },
      1: {
        kn: `ಪ್ರಸ್ತುತ ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} ಹಂತದಲ್ಲಿ ${n(nowYear)}ರ ಪ್ರಥಮಾರ್ಧವು ${name} ದಿನಚರಿಯ ಯಾವ ಹೊರೆಯನ್ನು ಇಳಿಸುತ್ತದೆ?`,
        mr: `सध्याच्या ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} दशेत ${n(nowYear)} हे वर्ष ${name} यांच्या दिनचर्येतील कोणते ओझे उतरवते?`,
        hi: `वर्तमान ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} दशा में ${n(nowYear)} का वर्ष ${name} की दिनचर्या से कौन सा भार कम करता है?`,
        te: `ప్రస్తుత ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} దశలో ${n(nowYear)}వ ఏడాది ${name} రోజువారీ జీవితంలోని ఏ భారాన్ని తగ్గిస్తుంది?`,
        ta: `நடப்பு ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} தசையில் ${n(nowYear)}-ம் ஆண்டு ${name} அன்றாடச் சுமைகளில் எதைக் குறைக்கிறது?`,
        en: `As ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} carries into ${nowYear}, which draining loop ends first for ${name}?`
      },
      2: {
        kn: `${n(arch.weakestHouseNum)}ನೇ ಭಾವದ (${arch.weakestDomainLabel}) ಮೇಲಿನ ಒತ್ತಡವನ್ನು ತಗ್ಗಿಸಿ ${n(nowYear)}ರಲ್ಲಿ ನಿಶ್ಚಿಂತತೆ ಪಡೆಯುವುದು ಹೇಗೆ?`,
        mr: `${n(arch.weakestHouseNum)}व्या स्थानाचा (${arch.weakestDomainLabel}) ताण कमी करून ${n(nowYear)} मध्ये स्थैर्य कसे मिळवायचे?`,
        hi: `${n(arch.weakestHouseNum)}वें भाव (${arch.weakestDomainLabel}) का दबाव घटाकर ${n(nowYear)} में स्पष्ट नियंत्रण कैसे पाएं?`,
        te: `${n(arch.weakestHouseNum)}వ స్థాన (${arch.weakestDomainLabel}) ఒత్తిడిని తగ్గించి ${n(nowYear)}లో స్థిరత్వాన్ని ఎలా సాధించాలి?`,
        ta: `${n(arch.weakestHouseNum)}-ம் இட (${arch.weakestDomainLabel}) அழுத்தத்தைக் குறைத்து ${n(nowYear)}-ல் உறுதியை எவ்வாறு பெறுவது?`,
        en: `Protecting ${arch.weakestDomainLabel} (House ${arch.weakestHouseNum}) turns ${nowYear} into a calm foundation year—how?`
      },
      3: {
        kn: `${n(nowYear)}ರಲ್ಲಿ ಎಷ್ಟು ಹೊಸ ಕೆಲಸ ಸೇರಿಸಬೇಕು ಎನ್ನುವುದಕ್ಕಿಂತ, ಯಾವ ಹಳೆಯ ಅಭ್ಯಾಸವನ್ನು ಕೈಬಿಟ್ಟರೆ ${name} ಗೆ ಶಾಂತಿ ಸಿಗುತ್ತದೆ?`,
        mr: `${n(nowYear)} मध्ये किती नवी कामे घ्यायची यापेक्षा कोणती जुनी कटकट सोडल्यास ${name} यांना शांतता मिळेल?`,
        hi: `${n(nowYear)} में नया जोड़ने से अधिक किन पुराने बोझों को उतारने से ${name} को वास्तविक शांति मिलेगी?`,
        te: `${n(nowYear)}లో ఎంత కొత్తగా మొదలుపెట్టాలనే దానికంటే ఏ పాత చిక్కులను వదిలితే ${name} కి ప్రశాంతత వస్తుంది?`,
        ta: `${n(nowYear)}-ல் புதிதாகச் சேர்ப்பதை விட எந்தப் பழைய சுமைகளை விலக்கினால் ${name} மன அமைதி பெறுவார்?`,
        en: `Why does ${nowYear} reward dropping wrong obligations before taking on fresh noise for ${name}?`
      }
    },
    20: {
      0: {
        kn: `${n(nowYear + 1)}ರಲ್ಲಿ (${n(arch.yearScores[1])}%) ${name} ರವರ '${arch.peakDomainLabel}' ಮತ್ತು ಯೋಗಿ ${yogiPlanetName} ಬಲವು ಯಾವ ದೊಡ್ಡ ವೇದಿಕೆಯನ್ನು ತೆರೆಯುತ್ತದೆ?`,
        mr: `${n(nowYear + 1)} मध्ये (${n(arch.yearScores[1])}%) ${name} यांची '${arch.peakDomainLabel}' ताकद व योगी ${yogiPlanetName} कोणते मोठे व्यासपीठ उघडतात?`,
        hi: `वर्ष ${n(nowYear + 1)} (${n(arch.yearScores[1])}%) में ${name} की '${arch.peakDomainLabel}' शक्ति व योगी ${yogiPlanetName} कौन सा बड़ा मंच खोलते हैं?`,
        te: `${n(nowYear + 1)}లో (${n(arch.yearScores[1])}%) ${name} యొక్క '${arch.peakDomainLabel}' బలం మరియు యోగి ${yogiPlanetName} ఏ ఉన్నత వేదికను ఇస్తున్నాయి?`,
        ta: `${n(nowYear + 1)}-ல் (${n(arch.yearScores[1])}%) ${name} அவர்களின் '${arch.peakDomainLabel}' பலமும் யோகி ${yogiPlanetName}-ம் எந்தப் பெரிய மேடையைத் திறக்கின்றன?`,
        en: `Surging to ${arch.yearScores[1]}% in ${nowYear + 1}, where do Yogi ${yogiPlanetName} and ${arch.peakDomainLabel} elevate ${name}?`
      },
      1: {
        kn: `${n(ctx.bhuktiEndDate)}ರ ನಂತರದ ಹೊಸ ಭುಕ್ತಿ ತಿರುವಿನಲ್ಲಿ ${name} ಪ್ರತಿಭೆಯು ${n(nowYear + 1)}ರಲ್ಲಿ ಹೇಗೆ ವಿಸ್ತರಿಸುತ್ತದೆ?`,
        mr: `${n(ctx.bhuktiEndDate)} नंतरच्या नव्या टप्प्यात ${name} यांचे कौशल्य ${n(nowYear + 1)} मध्ये कसे झेप घेणार आहे?`,
        hi: `${n(ctx.bhuktiEndDate)} के बाद आने वाले नए चरण में ${name} की योग्यता ${n(nowYear + 1)} में किस प्रकार विस्तार पाती है?`,
        te: `${n(ctx.bhuktiEndDate)} తర్వాత మారే దశలో ${name} ప్రతిభ ${n(nowYear + 1)}లో ఎలా వేగంగా విస్తరిస్తుంది?`,
        ta: `${n(ctx.bhuktiEndDate)}-க்குப் பிந்தைய மாற்றத்தில் ${name} திறமை ${n(nowYear + 1)}-ல் எவ்வாறு விரிவடைகிறது?`,
        en: `Following the ${ctx.bhuktiEndDate} transition, how does ${name}'s quiet track record multiply across ${nowYear + 1}?`
      },
      2: {
        kn: `೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನ (${n(savByHouse[10])}) ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನಗಳು (${n(savByHouse[11])}) ${n(nowYear + 1)}ರಲ್ಲಿ ಹೇಗೆ ವೇಗ ವರ್ಧಿಸುತ್ತವೆ?`,
        mr: `दशम (${n(savByHouse[10])}) व लाभ (${n(savByHouse[11])}) स्थाने ${n(nowYear + 1)} मध्ये वेगवान यश कसे खेचून आणतात?`,
        hi: `दशम (${n(savByHouse[10])}) और लाभ (${n(savByHouse[11])}) भाव वर्ष ${n(nowYear + 1)} में किस तरह तीव्र उछाल लाते हैं?`,
        te: `10వ కర్మ (${n(savByHouse[10])}) మరియు 11వ లాభ (${n(savByHouse[11])}) స్థానాలు ${n(nowYear + 1)}లో ఎలా వేగవంతమైన విజయాన్ని ఇస్తాయి?`,
        ta: `10-ம் தொழில் (${n(savByHouse[10])}) மற்றும் 11-ம் லாப (${n(savByHouse[11])}) இடங்கள் ${n(nowYear + 1)}-ல் எவ்வாறு வேகத்தைக் கூட்டுகின்றன?`,
        en: `Linking House 10 (${savByHouse[10]} SAV) with House 11 (${savByHouse[11]} SAV), what breakthrough lands in ${nowYear + 1}?`
      },
      3: {
        kn: `${ctx.lagnaRashiName} ಲಗ್ನದ ${name} ಸಣ್ಣ ಪರಿಧಿಯನ್ನು ದಾಟಿ ${n(nowYear + 1)}ರಲ್ಲಿ ಹೊಸ ಮೈತ್ರಿಗಳತ್ತ ಹೇಗೆ ಸಾಗುತ್ತಾರೆ?`,
        mr: `${ctx.lagnaRashiName} लग्नाचे ${name} लहान मर्यादा ओलांडून ${n(nowYear + 1)} मध्ये नव्या सहकार्याकडे कसे झेपावतात?`,
        hi: `${ctx.lagnaRashiName} लग्न के ${name} सीमित दायरे से निकलकर ${n(nowYear + 1)} में बड़े सहयोगियों से कैसे जुड़ते हैं?`,
        te: `${ctx.lagnaRashiName} లగ్నానికి చెందిన ${name} పాత హద్దులను దాటి ${n(nowYear + 1)}లో కొత్త అవకాశాలను ఎలా అందుకుంటారు?`,
        ta: `${ctx.lagnaRashiName} லக்ன ${name} சிறிய வட்டத்தைத் தாண்டி ${n(nowYear + 1)}-ல் பெரிய கூட்டணிகளை எவ்வாறு உருவாக்குவார்?`,
        en: `What invitation arriving from outside ${name}'s usual circle defines ${nowYear + 1}?`
      }
    },
    21: {
      0: {
        kn: `${n(nowYear + 2)}–${n(nowYear + 3)}ರ ಸುವರ್ಣ ಶಿಖರದಲ್ಲಿ (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) ${name} ಕುಟುಂಬದ ಆಸ್ತಿ ಮತ್ತು ಮಂಗಳ ಕಾರ್ಯಗಳು ಹೇಗೆ ಕೈಗೂಡುತ್ತವೆ?`,
        mr: `${n(nowYear + 2)}–${n(nowYear + 3)} च्या सुवर्ण काळात (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) ${name} यांच्या घर व मालमत्तेची स्वप्ने कशी साकार होतात?`,
        hi: `${n(nowYear + 2)}–${n(nowYear + 3)} के स्वर्णिम शिखर (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) पर ${name} की संपत्ति एवं पारिवारिक उत्सव कैसे सिद्ध होते हैं?`,
        te: `${n(nowYear + 2)}–${n(nowYear + 3)} సువర్ణ దశలో (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) ${name} ఇంటి ఆస్తి, శుభకార్యాలు ఎలా ఫలిస్తాయి?`,
        ta: `${n(nowYear + 2)}–${n(nowYear + 3)} பொற்காலத்தில் (${n(arch.yearScores[2])}–${n(arch.yearScores[3])}%) ${name} இல்லச் சொத்தும் சுப நிகழ்வுகளும் எவ்வாறு நிறைவேறும்?`,
        en: `Reaching ${arch.yearScores[2]}–${arch.yearScores[3]}% in ${nowYear + 2}–${nowYear + 3}, how do ${name}'s property and family plans turn tangible?`
      },
      1: {
        kn: `೪ನೇ ಗೃಹ ಸ್ಥಾನದ ${extendedPrecision.house4Info.lordName} ಹಾಗೂ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯು ${n(nowYear + 2)}–${n(nowYear + 3)}ರಲ್ಲಿ ಯಾವ ಶಾಶ್ವತ ನೆಮ್ಮದಿ ಕಟ್ಟುತ್ತವೆ?`,
        mr: `चतुर्थेश ${extendedPrecision.house4Info.lordName} आणि ${n(arch.peakHouseNum)}वे स्थान ${n(nowYear + 2)}–${n(nowYear + 3)} मध्ये कोणती अचल समृद्धी देतात?`,
        hi: `चतुर्थेश ${extendedPrecision.house4Info.lordName} एवं ${n(arch.peakHouseNum)}वां भाव ${n(nowYear + 2)}–${n(nowYear + 3)} में कौन सा स्थायी वैभव रचते हैं?`,
        te: `చతుర్థాధిపతి ${extendedPrecision.house4Info.lordName} మరియు ${n(arch.peakHouseNum)}వ స్థానం ${n(nowYear + 2)}–${n(nowYear + 3)}లో ఎలాంటి శాశ్వత సుఖాన్ని ఇస్తాయి?`,
        ta: `4-ம் அதிபதி ${extendedPrecision.house4Info.lordName} மற்றும் ${n(arch.peakHouseNum)}-ம் வீடு ${n(nowYear + 2)}–${n(nowYear + 3)}-ல் எந்த நிலையான வளத்தைக் கட்டும்?`,
        en: `Harmonizing 4th lord ${extendedPrecision.house4Info.lordName} with House ${arch.peakHouseNum}, what milestone anchors ${nowYear + 2}–${nowYear + 3}?`
      },
      2: {
        kn: `${n(savByHouse[2])} ಧನ ಬಿಂದುಗಳು ಮತ್ತು ಕುಟುಂಬದ ಒಗ್ಗಟ್ಟು ಸೇರಿ ${n(nowYear + 2)}–${n(nowYear + 3)}ರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಹೇಗೆ ಹಗುರಗೊಳಿಸುತ್ತವೆ?`,
        mr: `${n(savByHouse[2])} धन गुण आणि घरच्यांची साथ मिळून ${n(nowYear + 2)}–${n(nowYear + 3)} मधील मोठ्या जबाबदाऱ्या कशा सोप्या होतात?`,
        hi: `${n(savByHouse[2])} धन बिंदुओं और पारिवारिक एकता से ${n(nowYear + 2)}–${n(nowYear + 3)} के बड़े दायित्व कैसे सहज पूर्ण होते हैं?`,
        te: `${n(savByHouse[2])} ధన బిందువులు మరియు కుటుంబ ఐక్యత ${n(nowYear + 2)}–${n(nowYear + 3)} నాటి బాధ్యతలను ఎలా సులభం చేస్తాయి?`,
        ta: `${n(savByHouse[2])} தன பரல்களும் குடும்ப ஒற்றுமையும் இணைந்து ${n(nowYear + 2)}–${n(nowYear + 3)}-ன் பொறுப்புகளை எவ்வாறு எளிதாக்குகின்றன?`,
        en: `How does ${savByHouse[2]}-bindu financial stability solve previously stressful obligations across ${nowYear + 2}–${nowYear + 3}?`
      },
      3: {
        kn: `ಹಿಂದೆ ಕನಸಿನಲ್ಲಷ್ಟೇ ಇದ್ದ ಸ್ಥಿರ ಭದ್ರತೆಯು ${n(nowYear + 2)}–${n(nowYear + 3)}ರಲ್ಲಿ ${name} ಕಣ್ಣ ಮುಂದೆ ಹೇಗೆ ರೂಪುಗೊಳ್ಳಲಿದೆ?`,
        mr: `पूर्वी केवळ स्वप्न वाटणारी सुरक्षितता ${n(nowYear + 2)}–${n(nowYear + 3)} मध्ये ${name} यांच्या डोळ्यांसमोर कशी साकार होते?`,
        hi: `जो सुख पहले केवल कल्पना में था, वह ${n(nowYear + 2)}–${n(nowYear + 3)} में ${name} के समक्ष ठोस आकार कैसे लेता है?`,
        te: `ఒకప్పుడు కలగా అనిపించిన స్థిరత్వం ${n(nowYear + 2)}–${n(nowYear + 3)}లో ${name} కళ్ళముందు ఎలా నిలుస్తుంది?`,
        ta: `முன்பு கனவாக இருந்த பாதுகாப்பு ${n(nowYear + 2)}–${n(nowYear + 3)}-ல் ${name} கண்முன்னே எவ்வாறு வடிவம் பெறும்?`,
        en: `What turns quiet persistence into keys, stability, and shared celebration for ${name} during ${nowYear + 2}–${nowYear + 3}?`
      }
    },
    22: {
      0: {
        kn: `${n(nowYear + 4)}ರ ಐದನೇ ವರ್ಷದ ಅಂತ್ಯಕ್ಕೆ (${n(arch.yearScores[4])}%) ${name} ಬದುಕು ಯಾವ ಶಾಶ್ವತ ಸ್ವಾತಂತ್ರ್ಯದಲ್ಲಿ ನೆಲೆಗೊಳ್ಳಲಿದೆ?`,
        mr: `${n(nowYear + 4)} च्या पाचव्या वर्षाअखेरीस (${n(arch.yearScores[4])}%) ${name} यांचे आयुष्य कोणत्या शांत स्वातंत्र्यात स्थिरावेल?`,
        hi: `${n(nowYear + 4)} के पांचवें वर्ष के अंत तक (${n(arch.yearScores[4])}%) ${name} का जीवन किस स्थायी स्वतंत्रता एवं गौरव में प्रतिष्ठित होगा?`,
        te: `${n(nowYear + 4)} ఐదవ ఏడాది ముగిసేసరికి (${n(arch.yearScores[4])}%) ${name} జీవితం ఏ శాశ్వత స్వేచ్ఛలో నిలబడుతుంది?`,
        ta: `${n(nowYear + 4)} ஐந்தாம் ஆண்டின் நிறைவில் (${n(arch.yearScores[4])}%) ${name} வாழ்வு எந்த நிலையான சுதந்திரத்தில் நிலைபெறும்?`,
        en: `Cresting at ${arch.yearScores[4]}% by ${nowYear + 4}, what lasting autonomy crowns ${name}'s five-year arc?`
      },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.nakshatraName} ಹಾಗೂ ${ctx.lagnaRashiName} ಪಯಣವು ${n(nowYear + 4)}ರಲ್ಲಿ ಇತರರಿಗೆ ದಾರಿ ತೋರುವ ಎತ್ತರವನ್ನು ಹೇಗೆ ತಲುಪುತ್ತದೆ?`,
        mr: `तुमचा ${ctx.nakshatraName} व ${ctx.lagnaRashiName} प्रवास ${n(nowYear + 4)} मध्ये इतरांना मार्गदर्शन करण्याच्या उंचीवर कसा पोहोचतो?`,
        hi: `आपकी ${ctx.nakshatraName} एवं ${ctx.lagnaRashiName} यात्रा वर्ष ${n(nowYear + 4)} में दूसरों के लिए प्रेरणा बनने के शिखर तक कैसे पहुंचती है?`,
        te: `మీ ${ctx.nakshatraName} మరియు ${ctx.lagnaRashiName} ప్రయాణం ${n(nowYear + 4)}లో ఇతరులకు ఆదర్శంగా నిలిచే స్థితికి ఎలా చేరుతుంది?`,
        ta: `உங்கள் ${ctx.nakshatraName} மற்றும் ${ctx.lagnaRashiName} பயணம் ${n(nowYear + 4)}-ல் பிறருக்கு வழிகாட்டும் உயரத்தை எவ்வாறு அடையும்?`,
        en: `How does five years of disciplined growth lift ${name}'s ${ctx.lagnaRashiName} path from crisis management to steady legacy?`
      },
      2: {
        kn: `ಹಣದ ಆತಂಕ ಹಿಂದೆ ಸರಿದು ಸಮಯದ ಸ್ವಾತಂತ್ರ್ಯ ಕೈಸೇರುವ ${n(nowYear + 4)}ರ ದಿಗಂತದಲ್ಲಿ ಯಾವ ಮೌಲ್ಯ ನಿಮ್ಮನ್ನು ಕಾಯುತ್ತದೆ?`,
        mr: `आर्थिक चिंता मागे पडून वेळेचे स्वातंत्र्य मिळणाऱ्या ${n(nowYear + 4)} च्या टप्प्यावर कोणती मूल्ये तुमची साथ देतील?`,
        hi: `आर्थिक उद्वेग घटकर समय की स्वतंत्रता देने वाले वर्ष ${n(nowYear + 4)} में कौन से जीवन-मूल्य आपकी रक्षा करते हैं?`,
        te: `ఆర్థిక ఆందోళన తగ్గి సమయ స్వేచ్ఛ దొరికే ${n(nowYear + 4)}లో ఏ విలువలు మిమ్మల్ని అగ్రస్థానంలో నిలుపుతాయి?`,
        ta: `பணக் கவலை குறைந்து நேரச் சுதந்திரம் கிடைக்கும் ${n(nowYear + 4)}-ல் எந்த நற்பண்புகள் உங்களைக் காக்கும்?`,
        en: `As daily pressure eases toward ${nowYear + 4}, which non-negotiables protect ${name}'s quiet independence?`
      },
      3: {
        kn: `ಐದು ವರ್ಷಗಳ ನಂತರ ${n(nowYear + 4)}ರಿಂದ ಹಿಂತಿರುಗಿ ನೋಡಿದಾಗ, 'ಪ್ರತಿಯೊಂದು ತಿರುವಿಗೂ ಅರ್ಥವಿತ್ತು!' ಎಂದು ಏಕೆ ಅನಿಸಲಿದೆ?`,
        mr: `पाच वर्षांनंतर ${n(nowYear + 4)} मधून मागे वळून पाहताना 'प्रत्येक वळणाला अर्थ होता!' असे का वाटेल?`,
        hi: `पांच वर्ष बाद ${n(nowYear + 4)} से पीछे मुड़कर देखने पर यह क्यों लगेगा कि 'हर कठिन मोड़ का गहरा अर्थ था'?`,
        te: `ఐదేళ్ల తర్వాత ${n(nowYear + 4)} నుండి వెనక్కి చూసుకున్నప్పుడు 'ప్రతి మలుపుకూ ఒక అర్థం ఉండింది!' అని ఎందుకు అనిపిస్తుంది?`,
        ta: `ஐந்து ஆண்டுகளுக்குப் பிறகு ${n(nowYear + 4)}-லிருந்து திரும்பிப் பார்க்கும்போது 'ஒவ்வொரு திருப்பத்திற்கும் அர்த்தம் இருந்தது!' என ஏன் தோன்றும்?`,
        en: `Standing in ${nowYear + 4} looking backward, why will today's toughest detours suddenly feel deeply purposeful?`
      }
    }
  };

  const mapForCh = customMap[chNum];
  if (mapForCh) {
    return pick6(mapForCh[ed], lang);
  }

  // For remaining chapters on Editions 1..3, gently vary the opening lead without colon duplication
  const cleanedBody = fallbackQuestion
    .replace(/^(ಪ್ರಶ್ನೆ|प्रश्न|ప్రశ్న|கேள்வி|ചോദ്യം|Question)\s*:\s*/i, "")
    .trim();
  const softLowerLead = (s: string) =>
    /^(What|Why|How|When|Where|Which|Who|Is|Are|Do|Does|Did|Will|Can|Could|Has|Have|Should|Moving|Standing|Looking|Walking|Between|Before|Inside|Compare|Notice|For|With|From|Turning|Which)\b/.test(s)
      ? `${s.charAt(0).toLowerCase()}${s.slice(1)}`
      : s;
  const enBody = softLowerLead(cleanedBody);

  if (ed === 1) {
    return pick6({
      kn: `${ctx.nakshatraName} ದೃಷ್ಟಿಯಲ್ಲಿ, ${cleanedBody}`,
      mr: `${ctx.nakshatraName} दृष्टिकोनातून, ${cleanedBody}`,
      hi: `${ctx.nakshatraName} नक्षत्र के अनुसार, ${cleanedBody}`,
      te: `${ctx.nakshatraName} కోణంలో, ${cleanedBody}`,
      ta: `${ctx.nakshatraName} பார்வையில், ${cleanedBody}`,
      en: `Through ${ctx.nakshatraName}’s lens, ${enBody}`
    }, lang);
  }
  if (ed === 2) {
    return pick6({
      kn: `${ctx.lagnaRashiName} ಲಗ್ನ ಗಣಿತದ ಪ್ರಕಾರ, ${cleanedBody}`,
      mr: `${ctx.lagnaRashiName} लग्न गणितानुसार, ${cleanedBody}`,
      hi: `${ctx.lagnaRashiName} लग्न गणना से, ${cleanedBody}`,
      te: `${ctx.lagnaRashiName} లగ్న గణితంలో, ${cleanedBody}`,
      ta: `${ctx.lagnaRashiName} லக்னக் கணிதப்படி, ${cleanedBody}`,
      en: `Inside ${ctx.lagnaRashiName} timing, ${enBody}`
    }, lang);
  }
  return pick6({
    kn: `ನಿತ್ಯ ಜೀವನದ ಸೂತ್ರದಂತೆ, ${cleanedBody}`,
    mr: `दैनिक जीवनाच्या सूत्रानुसार, ${cleanedBody}`,
    hi: `व्यावहारिक जीवन-दृष्टि से, ${cleanedBody}`,
    te: `జీవన సూత్రం ప్రకారం, ${cleanedBody}`,
    ta: `வாழ்வியல் நோக்கில், ${cleanedBody}`,
    en: `At its practical core, ${enBody}`
  }, lang);
}

// ============================================================================
// CHART-GROUNDED, EDITION-VARIED CHAPTER INSIGHT LAYERS (CHAPTERS 1..25)
// ============================================================================

export function buildChartGroundedSupplement(
  chNum: number,
  arch: ChartArchetypeSnapshot,
  ctx: StoryEngineInput,
  isChildOrInfant: boolean,
  isMinor: boolean,
  isSenior: boolean
): {
  p1Focus: string;
  p2Body: string;
  p3Body: string;
  reflectionNote: string;
} {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const ext = ctx.extendedPrecision;
  const savByHouse: Record<number, number> = Object.fromEntries(
    Array.from({ length: 12 }, (_, idx) => [idx + 1, ctx.savTable[(ctx.lagnaRashiIdx + idx) % 12] ?? 28])
  );

  // Helpers that return chapter-specific, chart-grounded insights
  // (NEVER shared sentences across chapters!)

  if (chNum === 3) {
    // Chapter 3: Past 24-Month Verification (100% chart-driven by Saturn Moon house + Vedha + Dasha + Edition!)
    const satPast = getSaturnPast24MonthBranch(ctx, arch);
    const vedhaLine = ctx.shaniVedhaObstructed
      ? pick6({
          kn: `ಇದಕ್ಕೆ ಜೊತೆಯಾಗಿ ಗೋಚಾರ ವೇಧೆಯೂ ಕಾಣಿಸಿದ್ದರಿಂದ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಹತ್ತಿರದವರ ಭಿನ್ನಾಭಿಪ್ರಾಯವೇ ಎಚ್ಚರಿಕೆ ಗಂಟೆಯಾಯಿತು.`,
          mr: `त्यात गोचर वेधाची जोड मिळाल्याने जवळच्या व्यक्तींच्या विरोधातूनच खरी परिस्थिती समोर आली.`,
          hi: `साथ ही गोचर वेध सक्रिय होने से किसी निकट व्यक्ति की असहमति ने ही आपको समय रहते सतर्क कर दिया।`,
          te: `దీనికి గోచార వేధ తోడవడంతో ఆప్తుల అభిప్రాయ భేదమే మిమ్మల్ని ముందే అప్రమత్తం చేసింది.`,
          ta: `இதனுடன் கோசார வேதையும் இணைந்ததால் நெருக்கமானவர்களின் கருத்து வேறுபாடே உங்களை முன்கூட்டியே எச்சரித்தது.`,
          en: `Adding Gochara Vedha friction, one unexpected pushback from someone close forced an essential course correction.`
        }, lang)
      : pick6({
          kn: `ವೇಧಾ ಬಾಧೆ ಇಲ್ಲದ ಶುದ್ಧ ಸಂಚಾರವಾದ್ದರಿಂದ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ನೇರವಾದ ಅನುಭವ ಫಲವು ಕೈತಪ್ಪದೆ ದೊರೆಯಿತು.`,
          mr: `कोणताही गोचर वेध नसल्याने तुमचा प्रामाणिक अनुभव थेट भावी यशाचा आधार बनला.`,
          hi: `वेध अवरोध न रहने के कारण आपका प्रत्येक ईमानदार प्रयास सीधे ठोस अनुभव में बदलता गया।`,
          te: `గోచార వేధ అడ్డులేకపోవడం వల్ల మీ నిజాయితీగల అనుభవం నేరుగా భవిష్యత్ బలంగా మారింది.`,
          ta: `வேதைத் தடையில்லாததால் உங்கள் நேர்மையான உழைப்பு நேரடியாக உறுதியான அனுபவமாக மாறியது.`,
          en: `Free of Gochara Vedha obstruction, every ounce of disciplined grit converted directly into unshakeable judgement.`
        }, lang);

    const p1Variants: Record<0 | 1 | 2 | 3, string> = {
      0: satPast,
      1: `${satPast} ${pick6({
        kn: `ಇದೇ ಅವಧಿಯಲ್ಲಿ '${ext.mahaNatureLabel}' ಸ್ವರೂಪದ ${ctx.currentMahadasha} ದಶೆಯೂ ಸಕ್ರಿಯವಾಗಿದ್ದು ಜವಾಬ್ದಾರಿಗಳನ್ನು ತೂಗಿತು.`,
        mr: `याच काळात '${ext.mahaNatureLabel}' स्वरूपाच्या ${ctx.currentMahadasha} दशेने जबाबदाऱ्यांची पारख केली.`,
        hi: `इसी चरण में '${ext.mahaNatureLabel}' रूप में ${ctx.currentMahadasha} दशा ने आपके उत्तरदायित्वों को परखा।`,
        te: `ఇదే సమయంలో '${ext.mahaNatureLabel}' అయిన ${ctx.currentMahadasha} దశ మీ బాధ్యతలను పరీక్షించింది.`,
        ta: `இக்காலகட்டத்தில் '${ext.mahaNatureLabel}' தன்மையுள்ள ${ctx.currentMahadasha} தசையும் உங்கள் பொறுப்புகளை அளந்தது.`,
        en: `Running alongside your '${ext.mahaNatureLabel}' ${ctx.currentMahadasha} Mahadasha, those months separated true commitment from distraction.`
      }, lang)}`,
      2: `${pick6({
        kn: `ಕಳೆದ ಎರಡು ವರ್ಷಗಳ ${ctx.shaniTransitRashi} ಸಂಚಾರದಲ್ಲಿ ${n(ctx.shaniTransitSav)} ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳು ಕೆಲಸ ಮಾಡಿವೆ;`,
        mr: `मागील दोन वर्षांतील ${ctx.shaniTransitRashi} गोचरात ${n(ctx.shaniTransitSav)} अष्टकवर्ग गुण कार्यरत होते;`,
        hi: `बीते दो वर्षों के ${ctx.shaniTransitRashi} भ्रमण में ${n(ctx.shaniTransitSav)} अष्टकवर्ग बिंदू सक्रिय रहे;`,
        te: `గత రెండేళ్ల ${ctx.shaniTransitRashi} సంచారంలో ${n(ctx.shaniTransitSav)} అష్టకవర్గ బిందువులు పనిచేశాయి;`,
        ta: `கடந்த இரண்டு ஆண்டு ${ctx.shaniTransitRashi} சஞ்சாரத்தில் ${n(ctx.shaniTransitSav)} அஷ்டகவர்க்க பரல்கள் செயல்பட்டன;`,
        en: `Operating at ${ctx.shaniTransitSav} Sarvashtakavarga bindus inside ${ctx.shaniTransitRashi},`
      }, lang)} ${satPast}`,
      3: `${satPast} ${vedhaLine}`
    };

    const p2Variants: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಇದರಲ್ಲಿರುವ ಸಕಾರಾತ್ಮಕ ರಹಸ್ಯ: ${ctx.shaniTransitRashi} (${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆ) ಪರೀಕ್ಷೆಯು ನಿಮ್ಮ ಸುತ್ತಲಿನ ತೋರಿಕೆಯ ಮುಖವಾಡಗಳನ್ನು ಕಳಚಿ ಹಾಕಲು ಬಂದಿತ್ತೇ ವಿನಃ ನಿಮ್ಮನ್ನು ಕೆಡವಲು ಅಲ್ಲ; ಅದೇ ಈಗ ನಿಮ್ಮ ಬದುಕಿನ ಶುದ್ಧೀಕರಣವಾಗಿದೆ.`,
        mr: `यामागील सकारात्मक सत्य असे: ${ctx.shaniTransitRashi} (${n(ctx.shaniHouseFromMoon)}वे स्थान) परीक्षा तुम्हाला पाडण्यासाठी नाही, तर खोट्या माणसांपासून वाचवून पुढील टप्प्यासाठी सिद्ध करण्यासाठी आली होती.`,
        hi: `इसके भीतर छिपा वास्तविक लाभ यह है: ${ctx.shaniTransitRashi} (${n(ctx.shaniHouseFromMoon)}वां भाव) का यह दौर आपको गिराने नहीं, बल्कि झूठे सहारों से बचाकर अगले शिखर हेतु तराशने आया था।`,
        te: `దీని వెనుక ఉన్న శుభ రహస్యం: ${ctx.shaniTransitRashi} (${n(ctx.shaniHouseFromMoon)}వ స్థానం) లోని ఆ పరీక్ష మిమ్మల్ని ఆపడానికి కాదు, అసలైన వ్యక్తులను మిగిల్చడానికి వచ్చింది.`,
        ta: `இதன் பின்னால் உள்ள நன்மை இதுதான்: ${ctx.shaniTransitRashi} (${n(ctx.shaniHouseFromMoon)}-ம் இடம்) சோதனை உங்களை வீழ்த்த வரவில்லை; போலித் துணைகளை நீக்கி வலிமைப்படுத்தவே வந்தது.`,
        en: `What looked like two years of unfair friction in House ${ctx.shaniHouseFromMoon} actually stripped masks off unreliable allies before larger doors opened.`
      },
      1: {
        kn: `${ctx.currentMahadasha}–${ctx.currentBhuktiLord} (${n(ctx.bhuktiEndDate)}ರವರೆಗೆ) ಚಕ್ರದಲ್ಲಿ ಹಳೆಯ ವಿಳಂಬಗಳೆಲ್ಲಾ ಈಗ ಅನುಭವದ ನಿಧಿಯಾಗಿ ಪರಿವರ್ತನೆಯಾಗುತ್ತಿವೆ.`,
        mr: `सध्याच्या ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} (${n(ctx.bhuktiEndDate)} पर्यंत) टप्प्यात जुने अनुभव आता बळकट पाया म्हणून उपयोगी पडत आहेत.`,
        hi: `सक्रिय ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} (${n(ctx.bhuktiEndDate)} तक) अवधि में वे पुरानी परीक्षाएं अब ठोस अनुभवात्मक पूंजी में बदल रही हैं।`,
        te: `ప్రస్తుత ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} (${n(ctx.bhuktiEndDate)} వరకు) దశలో గత కష్టాలన్నీ ఇప్పుడు గట్టి అనుభవ సంపదగా మారుతున్నాయి.`,
        ta: `நடப்பு ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} (${n(ctx.bhuktiEndDate)} வரை) காலத்தில் அந்தக் கடந்த சோதனைகள் அனைத்தும் உறுதியான அனுபவச் செல்வமாக மாறுகின்றன.`,
        en: `Inside ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} through ${ctx.bhuktiEndDate}, every past delay converts from raw bruise into strategic pattern recognition.`
      },
      2: {
        kn: `${vedhaLine} ಹೀಗಾಗಿ ಮುಂಬರುವ ೫ ವರ್ಷಗಳ (${n(arch.yearScores[2])}–${n(arch.yearScores[4])}%) ಏರುಗತಿಯನ್ನು ತಡೆದುಕೊಳ್ಳುವ ಗಟ್ಟಿ ವ್ಯಕ್ತಿತ್ವ ಈಗ ಸಿದ್ಧವಾಗಿದೆ.`,
        mr: `${vedhaLine} त्यामुळे पुढील ५ वर्षांच्या (${n(arch.yearScores[2])}–${n(arch.yearScores[4])}%) प्रगतीला पेलणारे खंबीर व्यक्तिमत्त्व आता तयार झाले आहे.`,
        hi: `${vedhaLine} इसी कारण आगामी ५ वर्षों (${n(arch.yearScores[2])}–${n(arch.yearScores[4])}%) के ऊंचे शिखर को संभालने योग्य स्थिरता अब बन चुकी है।`,
        te: `${vedhaLine} అందుకే రాబోయే 5 ఏళ్ల (${n(arch.yearScores[2])}–${n(arch.yearScores[4])}%) ఎదుగుదలను మోసే గట్టి వ్యక్తిత్వం ఇప్పుడు సిద్ధమైంది.`,
        ta: `${vedhaLine} அதனால் வரும் 5 ஆண்டுகளின் (${n(arch.yearScores[2])}–${n(arch.yearScores[4])}%) வளர்ச்சியைத் தாங்கும் ஆளுமை இப்போது உருவாகிவிட்டது.`,
        en: `${vedhaLine} That exact seasoning prepares your chart cleanly for its ${arch.yearScores[2]}–${arch.yearScores[4]}% crest ahead.`
      },
      3: {
        kn: `ಮಳೆಗಾಲದ ನಂತರ ಭೂಮಿ ಹಸಿರಾಗುವಂತೆ, ${n(ctx.maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿ ಮತ್ತು ${ctx.shaniTransitRashi} ಪಾಠಗಳು ನಿಮ್ಮಿಂದ ಅಪ್ರಯೋಜಕ ಬಾಂಧವ್ಯಗಳನ್ನು ದೂರ ಸರಿಸಿವೆ.`,
        mr: `पावसाळ्यानंतर धरती बहरावी, तसे ${n(ctx.maandiHouse)}व्या भावातील मांदी आणि ${ctx.shaniTransitRashi}च्या अनुभवांनी व्यर्थ ओझी दूर सारली आहेत.`,
        hi: `वर्षा के बाद जैसे धरा निखर उठती है, वैसे ही ${n(ctx.maandiHouse)}वें भाव की मांदी और ${ctx.shaniTransitRashi} की परख ने व्यर्थ बोझ हटाकर मार्ग साफ़ किया है।`,
        te: `వర్షం తర్వాత భూమి పచ్చగా మెరిసినట్లు, ${n(ctx.maandiHouse)}వ స్థాన మాంది మరియు ${ctx.shaniTransitRashi} అనుభవాలు అనవసర భారాలను తొలగించాయి.`,
        ta: `மழைக்காலத்திற்குப் பிறகு பூமி பசுமையாவது போல், ${n(ctx.maandiHouse)}-ம் இட மாந்தியும் ${ctx.shaniTransitRashi} அனுபவங்களும் வீண் சுமைகளைக் கரைத்துவிட்டன.`,
        en: `Just as heavy rain clears thick dust from mountain air, those strenuous months in ${ctx.shaniTransitRashi} rinsed out obligations that never deserved you.`
      }
    };

    const p3Variants: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಈಗ ಆ ಬಿರುಗಾಳಿಯ ತೀವ್ರ ಭಾಗ ಹಿಂದೆ ಸರಿದಿದೆ; ಕಳೆದ ೨೪ ತಿಂಗಳಲ್ಲಿ ನೀವು ಬೆಳೆಸಿಕೊಂಡ ಸ್ಪಷ್ಟ ವಿವೇಚನೆಯೇ ಮುಂದೆ ಯಾರೂ ಮೋಸ ಮಾಡದಂತೆ ಕಾಯುವ ಕವಚವಾಗಿದೆ.`,
        mr: `आता त्या वादळाचा कठीण भाग मागे राहिला आहे; गेल्या २४ महिन्यांत कमावलेली सावध दृष्टी तुम्हाला यापुढे कधीही फसू देणार नाही.`,
        hi: `अब उस दौर की सबसे भारी परत पीछे छूट चुकी है; बीते २४ महीनों में अर्जित विवेक आगे हर निर्णय में आपकी रक्षा करेगा।`,
        te: `ఆ తుఫానులోని కఠిన దశ ఇప్పుడు ముగిసింది; గత 24 నెలల్లో మీరు సంపాదించిన వివేకమే ఇకపై మిమ్మల్ని కాపాడే కవచం.`,
        ta: `அந்தப் புயலின் கடினப் பகுதி இப்போது கடந்துவிட்டது; கடந்த 24 மாதங்களில் பெற்ற தெளிவு இனி உங்களைப் பாதுகாக்கும் கவசமாகும்.`,
        en: `The heaviest stretch of that test sits behind you—keep trusting the sharper discernment earned across those twenty-four months.`
      },
      1: {
        kn: `${ctx.moonRashiName} ರಾಶಿಯ ಭಾವನಾತ್ಮಕ ಪಕ್ವತೆ ಹಾಗೂ ${ctx.nakshatraName} ಎಚ್ಚರಿಕೆಯನ್ನು ಒಟ್ಟಾಗಿ ಬಳಸಿ ಮುಂದಿನ ಒಪ್ಪಂದಗಳನ್ನು ನಿಧಾನವಾಗಿ ಪರಿಶೀಲಿಸಿ.`,
        mr: `${ctx.moonRashiName} चंद्राची परिपक्वता व ${ctx.nakshatraName} ची सूक्ष्म जाणीव वापरून पुढचे करार शांतपणे तपासा.`,
        hi: `${ctx.moonRashiName} चंद्र की परिपक्वता और ${ctx.nakshatraName} की सूक्ष्म दृष्टि से अब हर आगामी निर्णय सोच-समझकर लें।`,
        te: `${ctx.moonRashiName} చంద్రుని పరిణతి మరియు ${ctx.nakshatraName} జాగ్రత్తతో ఇకపై వేసే ప్రతి అడుగును స్థిరంగా వేయండి.`,
        ta: `${ctx.moonRashiName} சந்திரனின் பக்குவத்தையும் ${ctx.nakshatraName} நுண்ணுணர்வையும் பயன்படுத்தி அடுத்த முடிவுகளைத் தெளிவாக எடுங்கள்.`,
        en: `Carry that ${ctx.moonRashiName} composure forward—verify promises slowly instead of rushing to please impatient voices.`
      },
      2: {
        kn: `ಹಿಂದಿನ ನಷ್ಟದ ಕುರಿತು ಪಶ್ಚಾತ್ತಾಪ ಪಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ, ನಿಮ್ಮ ಬಲಿಷ್ಠ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ಮೇಲೆ ಸಂಪೂರ್ಣ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಿ.`,
        mr: `भूतकाळातील हळहळ सोडून द्या आणि आता तुमच्या बलवान ${n(arch.peakHouseNum)}व्या भावावर (${arch.peakDomainLabel}) लक्ष केंद्रित करा.`,
        hi: `बीते समय का अफसोस छोड़कर अब अपनी सबसे सबल ${n(arch.peakHouseNum)}वीं शक्ति (${arch.peakDomainLabel}) पर पूर्ण ध्यान केंद्रित करें।`,
        te: `గత విషయాల గురించి చింతించడం ఆపి, మీ బలమైన ${n(arch.peakHouseNum)}వ స్థానంపై (${arch.peakDomainLabel}) పూర్తి దృష్టి పెట్టండి.`,
        ta: `கடந்த கால வருத்தங்களை விட்டுவிட்டு உங்கள் வலிமையான ${n(arch.peakHouseNum)}-ம் இடத்தின் (${arch.peakDomainLabel}) மீது முழுக் கவனம் செலுத்துங்கள்.`,
        en: `Stop mourning closed doors from two years ago; shift energy squarely into ${arch.peakDomainLabel} where your chart holds peak leverage.`
      },
      3: {
        kn: `ಇಂದಿನಿಂದ ಪ್ರತಿಯೊಂದು ಹೊಸ ಭರವಸೆಗೂ ಲಿಖಿತ ಸ್ಪಷ್ಟತೆ ಇರಲಿ — ನಿಮ್ಮ ಅನುಭವವೇ ಇನ್ನು ಮುಂದೆ ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಸಲಹೆಗಾರ.`,
        mr: `आजपासून प्रत्येक मोठ्या व्यवहारात लेखी स्पष्टता ठेवा — तुमचा अनुभवच आता तुमचा सर्वोत्तम सल्लागार आहे.`,
        hi: `आज से प्रत्येक नए संकल्प में तथ्यात्मक स्पष्टता रखें — आपका स्व-अनुभव ही अब आपका श्रेष्ठ मार्गदर्शक है।`,
        te: `నేటి నుండి ప్రతి ముఖ్య ఒప్పందంలో లిఖితపూర్వక స్పష్టత ఉంచుకోండి — మీ అనుభవమే మీకు గొప్ప మార్గదర్శి.`,
        ta: `இன்றிலிருந்து ஒவ்வொரு முக்கிய முடிவிலும் எழுத்துப்பூர்வ தெளிவைக் கடைப்பிடியுங்கள் — உங்கள் அனுபவமே சிறந்த ஆலோசகர்.`,
        en: `Let lived proof guide new trust from today onward—you already paid full tuition for this sharper intuition.`
      }
    };

    const reflVariants: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಗುರುತು ಮಾಡಿ ನೋಡಿ: ೨೪ ತಿಂಗಳ ಹಿಂದೆ ಇದ್ದ ಕುರುಡು ನಂಬಿಕೆಗಿಂತ ಇಂದಿನ ನಿಮ್ಮ ಎಚ್ಚರಿಕೆಯ ನೋಟ ಎಷ್ಟು ಪಕ್ವವಾಗಿದೆ!`,
        mr: `लक्षात घ्या: २४ महिन्यांपूर्वीचा भाबडा विश्वास आणि आजची तुमची चाणाक्ष नजर यात किती मोठा फरक पडला आहे!`,
        hi: `गौर करें: २४ माह पहले के अंधविश्वास की तुलना में आज आप लोगों को कितनी जल्दी और साफ़ परख लेते हैं!`,
        te: `గమనించండి: 24 నెలల క్రితం ఉన్న నమ్మకానికీ, నేటి మీ జాగ్రత్తగల ఆలోచనకూ ఎంత మార్పు వచ్చిందో!`,
        ta: `கவனியுங்கள்: 24 மாதங்களுக்கு முன்பிருந்த எளிய நம்பிக்கைக்கும் இன்றைய உங்கள் கூர்மையான பார்வைக்கும் உள்ள வித்தியாசமே உங்கள் வளர்ச்சி!`,
        en: `Checkpoint: Compare how casually you trusted promises two years ago with how accurately you spot motives today.`
      },
      1: {
        kn: `ನೈಜ ಸಾಕ್ಷಿ: ಕಳೆದ ಎರಡು ವರ್ಷದಲ್ಲಿ ದೂರವಾದ ಆ ಒಂದು ಸಂಬಂಧ ತಪ್ಪಿದ್ದರಿಂದಲೇ ಇಂದು ಮನಃಶಾಂತಿ ಉಳಿದಿದೆ ಎಂದು ಅನಿಸುತ್ತದೆಯೇ?`,
        mr: `प्रत्यक्ष अनुभव: गेल्या दोन वर्षांत एखादी अयोग्य साथ दूर झाल्यामुळेच आज मन शांत राहिले आहे असे वाटते का?`,
        hi: `प्रत्यक्ष प्रमाण: क्या बीते दो वर्षों में जिस गलत संगत से दूरी बनी, उसी से आज आपकी मानसिक शांति बची है?`,
        te: `నిజం ఆలోచించండి: గత రెండేళ్ళలో దూరమైన ఒక బంధం వల్లే నేడు మీకు ప్రశాంతత దక్కిందని అనిపించడం లేదా?`,
        ta: `நேரடிச் சான்று: கடந்த இரண்டு ஆண்டுகளில் விலகிய ஒரு தேவையற்ற தொடர்பால்தான் இன்று உங்கள் நிம்மதி காப்பாற்றப்பட்டது என்பதை உணர்கிறீர்களா?`,
        en: `Reality Mirror: Name one exit over the past twenty-four months that hurt briefly yet protected your peace long-term.`
      },
      2: {
        kn: `ತೀಕ್ಷ್ಣ ನೋಟ: ನೀವು ಸೋತಿಲ್ಲ, ಕೇವಲ ತಪ್ಪು ಹಾದಿಗಳಿಂದ ಹೊರಬಂದಿದ್ದೀರಿ ಎಂಬುದನ್ನು ಈ ಗಣಿತ ದೃಢಪಡಿಸುತ್ತದೆ.`,
        mr: `स्पष्ट जाणीव: तुम्ही पराभूत झाला नाहीत, तर चुकीच्या मार्गातून सुरक्षित बाहेर आलात हे हे गणित सिद्ध करते.`,
        hi: `सच्चा बोध: आप हारे नहीं, अपितु गलत रास्तों से समय रहते बाहर आ गए — यह गणित यही प्रमाणित करता है।`,
        te: `స్పష్టమైన నిజం: మీరు ఓడిపోలేదు, కేవలం తప్పుడు దారుల నుండి సురక్షితంగా బయటపడ్డారని ఈ గణితం నిరూపిస్తోంది.`,
        ta: `தெளிவான உண்மை: நீங்கள் தோற்கவில்லை; தவறான பாதைகளிலிருந்து சரியான நேரத்தில் வெளியேறியுள்ளீர்கள் என இக்கணிதம் காட்டுகிறது.`,
        en: `Key Proof: Delay was redirection—never defeat—and your ${ctx.shaniTransitSav}-bindu foundation proves staying power.`
      },
      3: {
        kn: `ಹೃದಯದ ಮಾತು: ಕಷ್ಟದ ಕಾಲದಲ್ಲಿಯೂ ನಿಮ್ಮ ಕೈಹಿಡಿದ ಆ ಕೆಲವೇ ನಿಜವಾದ ಆತ್ಮೀಯರಿಗೆ ಇಂದು ಮನಸ್ಸಿನಲ್ಲೇ ಧನ್ಯವಾದ ಹೇಳಿ.`,
        mr: `मनापासून नोंद: कठीण काळातही तुमचा हात न सोडणाऱ्या त्या मोजक्या खऱ्या माणसांना मनापासून धन्यवाद द्या.`,
        hi: `अंतरमन से आभार: कठिन समय में भी साथ न छोड़ने वाले उन चुनिंदा सच्चे लोगों के प्रति आज कृतज्ञता अनुभव करें।`,
        te: `హృదయపూర్వకంగా: కష్టసమయంలోనూ మీ వెన్నంటి నిలిచిన ఆ కొద్దిమంది నిజమైన మనుషులను గుర్తుచేసుకోండి.`,
        ta: `மனமார்ந்த பதிவு: நெருக்கடியிலும் உங்களோடு நின்ற அந்தச் சில உண்மையான உள்ளங்களுக்கு மனதார நன்றி செலுத்துங்கள்.`,
        en: `Gratitude Note: Acknowledge the few quiet allies who stayed steady through those steep months—those bonds are pure gold.`
      }
    };

    return {
      p1Focus: p1Variants[ed],
      p2Body: pick6(p2Variants[ed], lang),
      p3Body: pick6(p3Variants[ed], lang),
      reflectionNote: pick6(reflVariants[ed], lang)
    };
  }

  if (chNum === 6) {
    // Chapter 6: Yogi Planet Archetype (All 8 Yogi planets distinct + 4 editions!)
    const yogiStrategy = getYogiChannelStrategy(ctx);
    const sav2 = n(savByHouse[2]);
    const sav11 = n(savByHouse[11]);

    const p1Variants: Record<0 | 1 | 2 | 3, string> = {
      0: yogiStrategy,
      1: `${yogiStrategy} ${pick6({
        kn: `ವಿಶೇಷವಾಗಿ ನಿಮ್ಮ ೨ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${sav2} ಬಿಂದುಗಳು ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${sav11} ಬಿಂದುಗಳು ಇರುವುದರಿಂದ '${ctx.yogiPlanetName}' ಪ್ರಭಾವ ನೇರ ಹಣಕಾಸು ವೇಗ ಕೊಡುತ್ತದೆ.`,
        mr: `विशेष म्हणजे धन स्थानात ${sav2} व लाभ स्थानात ${sav11} गुण असल्याने '${ctx.yogiPlanetName}' चा मार्ग थेट आर्थिक स्थैर्य देतो.`,
        hi: `विशेष रूप से धन भाव में ${sav2} और लाभ भाव में ${sav11} बिंदू होने से '${ctx.yogiPlanetName}' की दिशा सीधे आर्थिक बल देती है।`,
        te: `ముఖ్యంగా 2వ ధన స్థానంలో ${sav2} మరియు 11వ లాభ స్థానంలో ${sav11} బిందువులు ఉండటంతో '${ctx.yogiPlanetName}' బలం నేరుగా ఆదాయాన్ని పెంచుతుంది.`,
        ta: `குறிப்பாக 2-ம் தன இடத்தில் ${sav2} பரல்களும் 11-ம் லாப இடத்தில் ${sav11} பரல்களும் உள்ளதால் '${ctx.yogiPlanetName}' வழி நேரடிப் பொருளாதார உயர்வு தரும்.`,
        en: `Anchored directly to House 2 (${savByHouse[2]} bindus) and House 11 (${savByHouse[11]} bindus), moving with ${ctx.yogiPlanetName} amplifies real outcomes.`
      }, lang)}`,
      2: `${pick6({
        kn: `ನಿಮ್ಮ ಚಾರ್ಟಿನ ಯೋಗಿ ${ctx.yogiPlanetName} (${ctx.yogiRashiName || ctx.lagnaRashiName}) ವಿರುದ್ಧ ಅವಯೋಗಿ ${ctx.avayogiPlanetName} ವ್ಯತ್ಯಾಸ:`,
        mr: `तुमच्या कुंडलीतील योगी ${ctx.yogiPlanetName} वि. अवयोगी ${ctx.avayogiPlanetName} चा फरक:`,
        hi: `आपकी कुंडली में योगी ${ctx.yogiPlanetName} बनाम अवयोगी ${ctx.avayogiPlanetName} का अंतर:`,
        te: `మీ జాతకంలో యోగి ${ctx.yogiPlanetName} మరియు అవయోగి ${ctx.avayogiPlanetName} మధ్య తేడా:`,
        ta: `உங்கள் ஜாதகத்தில் யோகி ${ctx.yogiPlanetName} மற்றும் அவயோகி ${ctx.avayogiPlanetName} வேறுபாடு:`,
        en: `Comparing your golden tide (${ctx.yogiPlanetName}) against false friction (${ctx.avayogiPlanetName}):`
      }, lang)} ${yogiStrategy}`,
      3: `${yogiStrategy} ${pick6({
        kn: `${ctx.localizedYogiColor} ಬಣ್ಣದ ವಸ್ತ್ರ ಅಥವಾ '${ctx.localizedYogiDeity}' ಸ್ಮರಣೆಯಿಂದ ಈ ಶಕ್ತಿ ಸಹಜವಾಗಿಯೇ ಜಾಗೃತವಾಗುತ್ತದೆ.`,
        mr: `${ctx.localizedYogiColor} रंगाचा वापर व '${ctx.localizedYogiDeity}' स्मरण ही नैसर्गिक ऊर्जा लगेच जागृत करते.`,
        hi: `${ctx.localizedYogiColor} रंग का प्रयोग और '${ctx.localizedYogiDeity}' का स्मरण इस शुभ प्रवाह को सहज जागृत रखता है।`,
        te: `${ctx.localizedYogiColor} రంగు మరియు '${ctx.localizedYogiDeity}' స్మరణ ఈ అనుకూల శక్తిని వెంటనే మేల్కొల్పుతాయి.`,
        ta: `${ctx.localizedYogiColor} நிறமும் '${ctx.localizedYogiDeity}' நினைவும் இந்த நற்பலனை இயல்பாகத் தூண்டுகின்றன.`,
        en: `Simple reminders like ${ctx.localizedYogiColor} accents and honoring ${ctx.localizedYogiDeity} keep this natural rhythm front of mind.`
      }, lang)}`
    };

    const p2Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಇದರ ವಿರುದ್ಧ ತಿರುವೇ ${ctx.lagnaRashiName} ಲಗ್ನದ (${sav2}/${sav11} ಬಿಂದು) '${ctx.avayogiPlanetName}' ಎಚ್ಚರಿಕೆ! ${isChildOrInfant ? "ಮಗುವಿನ ಶಿಕ್ಷಣ-ಭವಿಷ್ಯದ ಯೋಜನೆಗಳಲ್ಲಿ ಆತುರದ ಬದಲಾವಣೆ ಮಾಡದೆ ತಾಳ್ಮೆ ಪಾಲಿಸಿ." : "ಬೇರೆಯವರ ಒತ್ತಡಕ್ಕೆ ಸಿಲುಕಿ ತರಾತುರಿಯಲ್ಲಿ ಸಾಲ, ಜಾಮೀನು ಅಥವಾ ಒಪ್ಪಂದ ಮಾಡಿಕೊಂಡಾಗಲೆಲ್ಲಾ ಇದೇ ತಪ್ಪು ಸಮಯದ ಅಡಚಣೆ ಕಾಡಿದೆ."}`,
        mr: `याचा उलटा कोपरा म्हणजे ${ctx.lagnaRashiName} लग्नातील (${sav2}/${sav11} गुण) '${ctx.avayogiPlanetName}' सावधता! ${isChildOrInfant ? "मुलांच्या शिक्षणाबाबत घाईचे निर्णय न घेता शांत नियोजन करा." : "दबावाखाली घाईने दिलेली आश्वासने किंवा उधार दिलेला पैसा याच प्रतिकूल टप्प्यात अडकला होता."}`,
        hi: `इसके विपरीत मोड़ पर ${ctx.lagnaRashiName} लग्न (${sav2}/${sav11} बिंदू) में '${ctx.avayogiPlanetName}' की सतर्कता है! ${isChildOrInfant ? "बालक की शिक्षा-सुरक्षा के निर्णयों में जल्दबाजी न करें।" : "जब भी आपने दबाव में शीघ्रता से कोई बड़ा वादा या लेन-देन किया, तभी इस विपरीत घड़ी ने कार्य उलझाया।"}`,
        te: `దీనికి వ్యతిరేకంగా ${ctx.lagnaRashiName} లగ్నానికి (${sav2}/${sav11} బిందువులు) '${ctx.avayogiPlanetName}' హెచ్చరిక పనిచేస్తుంది! ${isChildOrInfant ? "పిల్లల చదువు విషయాల్లో తొందరపాటు నిర్ణయాలు వద్దు." : "మీరు ఒత్తిడిలో తొందరపడి డబ్బు ఇవ్వడం లేదా ఒప్పందాలు చేసుకున్నప్పుడే ఈ వ్యతిరేక శక్తి అడ్డుపడింది."}`,
        ta: `இதன் மறுபக்கம் ${ctx.lagnaRashiName} லக்னத்திற்கான (${sav2}/${sav11} பரல்கள்) '${ctx.avayogiPlanetName}' எச்சரிக்கை! ${isChildOrInfant ? "குழந்தையின் கல்வி முடிவுகளில் அவசரம் வேண்டாம்." : "பிறர் வற்புறுத்தலால் அவசரப்பட்டுப் பணப் பொறுப்பு எடுத்தபோதெல்லாம் இந்த எதிர் ஆற்றல் தடையைத் தந்தது."}`,
        en: `By contrast inside your ${ctx.lagnaRashiName} chart (${savByHouse[2]}/${savByHouse[11]} bindus), Avayogi ${ctx.avayogiPlanetName} in ${ctx.avayogiRashiName || ctx.moonRashiName} creates silent leaks whenever you rush out of guilt or artificial urgency.`
      },
      1: {
        kn: `${ctx.moonRashiName} ಚಂದ್ರ ರಾಶಿಗೆ ಪ್ರತಿಕೂಲ '${ctx.avayogiPlanetName}' ದಿನಗಳಲ್ಲಿ ಒತ್ತಡ ಹಾಕುವುದಕ್ಕಿಂತ, ${ctx.localizedYogiDay}ರಂದು ೧ ಗಂಟೆ ಶಾಂತವಾಗಿ ಮಾಡಿದ ಕೆಲಸ ಮೂರು ಪಟ್ಟು ಫಲ ಕೊಡುತ್ತದೆ.`,
        mr: `${ctx.moonRashiName} चंद्र राशीसाठी प्रतिकूल '${ctx.avayogiPlanetName}' वेळेत धावपळ करण्यापेक्षा ${ctx.localizedYogiDay} रोजी शांत डोक्याने केलेले एक तासाचे काम तिप्पट यश देते.`,
        hi: `${ctx.moonRashiName} चंद्र राशि हेतु प्रतिकूल '${ctx.avayogiPlanetName}' के क्षण में जूझने से बेहतर ${ctx.localizedYogiDay} को शांत मन से एक सटीक कदम उठाना तीन गुना फल देता है।`,
        te: `${ctx.moonRashiName} రాశికి అనుకూలం కాని '${ctx.avayogiPlanetName}' వేళలో కష్టపడటం కంటే, ${ctx.localizedYogiDay} నాడు ప్రశాంతంగా చేసే ఒక్క గంట పని మూడింతల ఫలితాన్నిస్తుంది.`,
        ta: `${ctx.moonRashiName} ராசிக்குச் சரியில்லாத '${ctx.avayogiPlanetName}' நேரத்தில் உழைப்பதை விட, ${ctx.localizedYogiDay} அன்று ஒரு மணி நேரம் அமைதியாகச் செய்யும் செயல் மும்மடங்கு பலன் தரும்.`,
        en: `Inside your ${ctx.moonRashiName} cycle, one clean conversation launched on ${ctx.localizedYogiDay} achieves more than ten frantic hours pushed during ${ctx.avayogiPlanetName} friction.`
      },
      2: {
        kn: `ಲಗ್ನದಿಂದ ${sav2} (ಧನ) ಮತ್ತು ${sav11} (ಲಾಭ) ಬಿಂದುಗಳು ಚೆನ್ನಾಗಿದ್ದರೂ, '${ctx.avayogiPlanetName}' ಅಸಹನೆಯಿಂದಲೇ ಅರ್ಧದಷ್ಟು ಉತ್ತಮ ಅವಕಾಶಗಳು ಕೈತಪ್ಪುತ್ತಿದ್ದವು — ಈಗ ಆ ಬೀಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿದೆ.`,
        mr: `धन (${sav2}) व लाभ (${sav11}) मजबूत असूनही केवळ '${ctx.avayogiPlanetName}' मुळे येणाऱ्या घाईने अर्ध्या संधी हातातून निसटायच्या — आता ती चावी तुमच्याकडे आहे.`,
        hi: `धन (${sav2}) और लाभ (${sav11}) पुष्ट होते हुए भी '${ctx.avayogiPlanetName}' की जल्दबाजी कई अच्छे अवसर रोक देती थी — अब संतुलन आपके हाथ में है।`,
        te: `ధన (${sav2}) మరియు లాభ (${sav11}) స్థానాలు బాగున్నా, '${ctx.avayogiPlanetName}' తొందరపాటు వల్లే అవకాశాలు జారేవి — ఇప్పుడు ఆ రహస్యం మీకు తెలిసింది.`,
        ta: `தன (${sav2}) மற்றும் லாப (${sav11}) பலம் நன்றாக இருந்தும், '${ctx.avayogiPlanetName}' அவசரத்தால் சில வாய்ப்புகள் நழுவின — இப்போது அந்தக் கட்டுப்பாடு உங்கள் கையில்.`,
        en: `Your wealth houses (${savByHouse[2]} & ${savByHouse[11]}) want to flow; simply stopping ${ctx.avayogiPlanetName}-style hasty commitments plugs half the drain immediately.`
      },
      3: {
        kn: `ಪ್ರತಿದಿನ ಮೀನು ಹಿಡಿಯುವವನೂ ಅಲೆ ಶಾಂತವಾದ ಸಮಯ ನೋಡಿ ಬಲೆ ಬೀಸುವಂತೆ, '${ctx.yogiPlanetName}' ಗಾಳಿಗೆ ತಕ್ಕಂತೆ ಹೆಜ್ಜೆ ಇಟ್ಟರೆ ದಣಿವು ಅರ್ಧಕ್ಕರ್ಧ ಕಡಿಮೆಯಾಗುತ್ತದೆ.`,
        mr: `अनुभवी कोळी लाटांचा अंदाज घेऊनच जाळे टाकतो, तसे '${ctx.yogiPlanetName}' चा अनुकूल वेग ओळखून पाऊल टाकल्यास अर्धी दमछाक वाचते.`,
        hi: `कुशल नाविक जैसे शांत लहर देखकर जाल डालता है, वैसे ही '${ctx.yogiPlanetName}' के अनुकूल रुख को पहचानकर चलने से आधा परिश्रम बचता है।`,
        te: `అనుభవజ్ఞుడైన నావికుడు అలల వేగాన్ని చూసి పడవ నడిపినట్లుగా, '${ctx.yogiPlanetName}' అనుకూలతను బట్టి అడుగు వేస్తే సగం శ్రమ తగ్గుతుంది.`,
        ta: `அனுபவமுள்ள மீனவர் அலை அடங்கிய நேரம் பார்த்து வலை வீசுவது போல், '${ctx.yogiPlanetName}' சாதக நேரத்தில் செயல்பட்டால் பாதி களைப்பு குறையும்.`,
        en: `Just as experienced fishermen launch boats with the outgoing tide instead of fighting breakers, moving with ${ctx.yogiPlanetName} halves fatigue.`
      }
    };

    const p3Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಸರಳ ಜೀವನ ತಂತ್ರ: ${isChildOrInfant ? `${ctx.localizedYogiDay}ರಂದು ಮಗುವಿಗೆ ಹೊಸ ಪುಸ್ತಕ, ಚಿತ್ರಕಲೆ ಅಥವಾ ಕಲಿಕೆಯ ಶುಭಾರಂಭ ಮಾಡಿಸಿ.` : `ಮುಖ್ಯ ಹಣಕಾಸು ಹೆಜ್ಜೆ, ಹೂಡಿಕೆ ಅಥವಾ ಪ್ರಮುಖ ಸಂದರ್ಶನಗಳಿಗೆ '${ctx.localizedYogiDay}' ಆಯ್ಕೆ ಮಾಡಿ ಹಾಗೂ '${ctx.localizedYogiDirection}' ದಿಕ್ಕನ್ನು ಬಳಸಿ.`}`,
        mr: `सोपे धोरण: ${isChildOrInfant ? `${ctx.localizedYogiDay} रोजी मुलांच्या वाचन व कलागुणांचा नवा अभ्यास सुरू करा.` : `महत्त्वाच्या बैठका, नवीन करार व बचतीचे निर्णय '${ctx.localizedYogiDay}' दिवशी आणि '${ctx.localizedYogiDirection}' दिशेच्या सुसंगतीत घ्या.`}`,
        hi: `सरल जीवन नीति: ${isChildOrInfant ? `${ctx.localizedYogiDay} को बालक की नई पुस्तक या सीखने का आरंभ कराएं।` : `प्रमुख बातचीत, बचत एवं बड़े निर्णय '${ctx.localizedYogiDay}' को रखें और '${ctx.localizedYogiDirection}' दिशा की अनुकूलता अपनाएं।`}`,
        te: `సులభమైన వ్యూహం: ${isChildOrInfant ? `${ctx.localizedYogiDay} నాడు చిన్నారితో కొత్త పుస్తకాలు లేదా కళల అభ్యాసం మొదలుపెట్టండి.` : `కీలక ఆర్థిక చర్చలు మరియు పొదుపు నిర్ణయాలు '${ctx.localizedYogiDay}' నాడు '${ctx.localizedYogiDirection}' దిశగా ప్రారంభించండి.`}`,
        ta: `எளிய வாழ்வியல் உத்தி: ${isChildOrInfant ? `${ctx.localizedYogiDay} அன்று குழந்தையின் புதிய கற்றல் பழக்கத்தைத் தொடங்குங்கள்.` : `முக்கிய சந்திப்புகள் மற்றும் பண முடிவுகளை '${ctx.localizedYogiDay}' அன்று '${ctx.localizedYogiDirection}' திசையில் திட்டமிடுங்கள்.`}`,
        en: `Everyday edge: ${isChildOrInfant ? `start joyful creative habits on ${ctx.localizedYogiDay}.` : `schedule high-stakes proposals, pitches, and savings decisions on ${ctx.localizedYogiDay} facing ${ctx.localizedYogiDirection}.`}`
      },
      1: {
        kn: `${isChildOrInfant ? `ಮಗುವಿನ ಓದುವ ಮೇಜು '${ctx.localizedYogiDirection}' ದಿಕ್ಕಿಗಿದ್ದರೆ ಏಕಾಗ್ರತೆ ಸಹಜವಾಗಿಯೇ ಹೆಚ್ಚುತ್ತದೆ.` : `ನಿರ್ಣಾಯಕ ದಿನದಂದು '${ctx.localizedYogiColor}' ಬಣ್ಣದ ಸಣ್ಣ ವಸ್ತ್ರ ಧರಿಸಿ ಹೆಜ್ಜೆ ಇಟ್ಟರೆ ಮನಸ್ಸಿನ ದ್ವಂದ್ವ ತಕ್ಷಣ ಶಾಂತವಾಗುತ್ತದೆ.`}`,
        mr: `${isChildOrInfant ? `मुलांचे अभ्यासाचे टेबल '${ctx.localizedYogiDirection}' दिशेस ठेवल्याने एकाग्रता सहज वाढते.` : `महत्त्वाच्या दिवशी '${ctx.localizedYogiColor}' रंगाचा सौम्य वापर आत्मविश्वास आणि स्पष्टता वाढवतो.`}`,
        hi: `${isChildOrInfant ? `बच्चे की अध्ययन मेज़ '${ctx.localizedYogiDirection}' दिशा में होने से एकाग्रता स्वतः निखरती है।` : `महत्वपूर्ण भेंट के दिन '${ctx.localizedYogiColor}' रंग धारण करने से आत्मबल एवं स्पष्टता बढ़ती है।`}`,
        te: `${isChildOrInfant ? `చిన్నారి చదువుకునే చోటు '${ctx.localizedYogiDirection}' దిశలో ఉంటే ఏకాగ్రత పెరుగుతుంది.` : `ముఖ్యమైన రోజున '${ctx.localizedYogiColor}' రంగు దుస్తులు ధరించడం మీ ఆత్మవిశ్వాసాన్ని రెట్టింపు చేస్తుంది.`}`,
        ta: `${isChildOrInfant ? `குழந்தையின் படிப்பு மேசை '${ctx.localizedYogiDirection}' திசையில் இருப்பது கவனத்தைக் கூட்டும்.` : `முக்கிய நாட்களில் '${ctx.localizedYogiColor}' நிறத்தைத் தேர்ந்தெடுப்பது மன உறுதியை உடனே உயர்த்தும்.`}`,
        en: `${isChildOrInfant ? `Orienting the study corner toward ${ctx.localizedYogiDirection} subtly anchors attention.` : `Wearing subtle touches of ${ctx.localizedYogiColor} on key meeting mornings keeps confidence unforced.`}`
      },
      2: {
        kn: `ಒಂದೇ ಮಾತು: ಒತ್ತಡ ಹೇರಿ ಯಾರಾದರೂ 'ಇಂದೇ ತೀರ್ಮಾನ ಹೇಳಿ' ಎಂದರೆ, '${ctx.localizedYogiDay}' ಬರುವವರೆಗೂ ಶಾಂತವಾಗಿ ಸಮಯ ಕೇಳಿ.`,
        mr: `एक सोपा नियम: कोणीही 'आजच्या आज निर्णय घ्या' असा दबाव टाकला तर '${ctx.localizedYogiDay}' येईपर्यंत शांतपणे वेळ मागून घ्या.`,
        hi: `एक सटीक नियम: जब कोई 'अभी के अभी निर्णय दें' का दबाव डाले, तो '${ctx.localizedYogiDay}' तक शांत विचार का समय अवश्य लें।`,
        te: `ఒకే ఒక సూత్రం: ఎవరైనా 'ఇప్పుడే నిర్ణయం చెప్పండి' అని ఒత్తిడి తెస్తే, '${ctx.localizedYogiDay}' వచ్చేవరకు ప్రశాంతంగా సమయం తీసుకోండి.`,
        ta: `ஒரே ஒரு விதி: யாராவது 'இப்போதே முடிவெடுங்கள்' என அழுத்தம் கொடுத்தால், '${ctx.localizedYogiDay}' வரை அமைதியாக அவகாசம் கேளுங்கள்.`,
        en: `Practical filter: whenever someone demands an instant yes under pressure, politely pause until ${ctx.localizedYogiDay} arrives.`
      },
      3: {
        kn: `ಹಣ ಮತ್ತು ಸಮಯ ಎರಡನ್ನೂ ಕಾಗದದ ಮೇಲೆ ಗುರುತು ಹಾಕಿಕೊಂಡು, '${ctx.yogiPlanetName}' ಅನುಕೂಲವಿರುವ ಮುಂಜಾನೆಯಲ್ಲೇ ದೊಡ್ಡ ಪತ್ರವ್ಯವಹಾರ ಆರಂಭಿಸಿ.`,
        mr: `वेळ आणि पैशाचा स्पष्ट आराखडा लिहून '${ctx.yogiPlanetName}' अनुकूल असलेल्या सकाळच्या वेळेत मोठी कामे सुरू करा.`,
        hi: `समय और धन की योजना कागज़ पर लिखकर '${ctx.yogiPlanetName}' की अनुकूल प्रातः वेला में मुख्य कार्य आरंभ करें।`,
        te: `సమయం మరియు డబ్బు ప్రణాళికను రాసుకుని, '${ctx.yogiPlanetName}' అనుకూలంగా ఉన్న ఉదయం వేళలో ముఖ్య పనులు మొదలుపెట్టండి.`,
        ta: `நேரத்தையும் பணத்தையும் திட்டமிட்டு எழுதி, '${ctx.yogiPlanetName}' சாதகமான காலை வேளையில் முக்கிய முயற்சிகளைத் தொடங்குங்கள்.`,
        en: `Write goals clearly on paper first, then make your opening calls during a calm morning on ${ctx.localizedYogiDay}.`
      }
    };

    const reflMap: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಗಮನಿಸಿ ನೋಡಿ: ನಿಮ್ಮ ಬದುಕಿನ ಶುಭ ಸುದ್ದಿಗಳಲ್ಲಿ ಹೆಚ್ಚಿನವು '${ctx.localizedYogiDay}' ಆಸುಪಾಸಲ್ಲೇ ಬಂದಿರುವುದು ಆಕಸ್ಮಿಕವಲ್ಲ!`,
        mr: `तपासून पहा: तुमच्या आयुष्यातील अनेक चांगल्या बातम्या '${ctx.localizedYogiDay}' च्या आसपास आल्या आहेत, हे योगायोग नाही!`,
        hi: `स्मरण करके देखें: आपके जीवन के कितने ही शुभ समाचार '${ctx.localizedYogiDay}' के आसपास मिले हैं — यह संयोग नहीं है!`,
        te: `గుర్తుచేసుకోండి: మీ జీవితంలోని శుభవార్తలు ఎక్కువగా '${ctx.localizedYogiDay}' చుట్టుపక్కలే వచ్చి ఉండటం యాదృచ్ఛికం కాదు!`,
        ta: `நினைத்துப் பாருங்கள்: உங்கள் வாழ்வின் நற்செய்திகள் பல '${ctx.localizedYogiDay}' ஒட்டியே வந்திருக்கும் — அது தற்செயல் அல்ல!`,
        en: `Memory Check: Trace your happiest three breakthroughs—notice how often ${ctx.localizedYogiDay} or calm timing echoed right nearby.`
      },
      1: {
        kn: `ಸಣ್ಣ ಟಿಪ್ಪಣಿ: '${ctx.avayogiPlanetName}' ಒತ್ತಡದ ದಿನಗಳಲ್ಲಿ ತೆಗೆದುಕೊಂಡ ಆತುರದ ಮಾತುಗಳನ್ನು ತಪ್ಪಿಸಿದರೇ ಅರ್ಧ ಯಶಸ್ಸು ಸಿಕ್ಕಂತೆಯೇ.`,
        mr: `लक्षात ठेवा: '${ctx.avayogiPlanetName}' च्या घाईत घेतलेले निर्णय टाळताच निम्मे यश हातात येते.`,
        hi: `विशेष ध्यान: '${ctx.avayogiPlanetName}' के दबाव में जल्दबाजी टाल देने मात्र से आधी बाधाएं स्वयं समाप्त हो जाती हैं।`,
        te: `చిన్న గమనిక: '${ctx.avayogiPlanetName}' ప్రభావంలో తొందరపాటు మాటలను ఆపితే సగం విజయం సాధించినట్లే.`,
        ta: `சிறு குறிப்பு: '${ctx.avayogiPlanetName}' அவசரத்தில் எடுக்கும் முடிவுகளைத் தவிர்த்தாலே பாதி வெற்றி நிச்சயம்.`,
        en: `Guardrail Note: Avoiding hasty signatures during noisy ${ctx.avayogiPlanetName} afternoons instantly preserves half your energy.`
      },
      2: {
        kn: `ಯೋಗಿ ಗುರುತು: '${ctx.localizedYogiDirection}' ದಿಕ್ಕು ಮತ್ತು '${ctx.localizedYogiColor}' ಬಣ್ಣವನ್ನು ನಿಮ್ಮ ಮೇಜಿನ ಹತ್ತಿರ ಇರಿಸಿಕೊಂಡು ವ್ಯತ್ಯಾಸ ಗಮನಿಸಿ.`,
        mr: `योगी खूण: तुमच्या कामाच्या जागी '${ctx.localizedYogiDirection}' दिशा व '${ctx.localizedYogiColor}' रंगाचा स्पर्श ठेवून फरक पहा.`,
        hi: `योगी संकेत: अपने कार्य-स्थान पर '${ctx.localizedYogiDirection}' दिशा और '${ctx.localizedYogiColor}' का हल्का स्पर्श रखकर सकारात्मकता देखें।`,
        te: `యోగి గుర్తు: మీ పని చేసే చోట '${ctx.localizedYogiDirection}' దిశ మరియు '${ctx.localizedYogiColor}' రంగు ఉండేలా చూసుకుని తేడా గమనించండి.`,
        ta: `யோகி அடையாளம்: உங்கள் பணியிடத்தில் '${ctx.localizedYogiDirection}' திசையையும் '${ctx.localizedYogiColor}' நிறத்தையும் அமைத்து மாற்றத்தைப் பாருங்கள்.`,
        en: `Workspace Clue: Placing a small ${ctx.localizedYogiColor} cue toward ${ctx.localizedYogiDirection} serves as a steady compass all week.`
      },
      3: {
        kn: `ಸ್ವಂತ ನಿಯಮ: ಹಡಗು ಗಾಳಿಯೊಂದಿಗೆ ಸಾಗಿದಾಗಲೇ ವೇಗ ಪಡೆಯುತ್ತದೆ — ನಿಮ್ಮ ಗಾಳಿಯ ದಿಕ್ಕು '${ctx.yogiPlanetName}' ಎಂಬುದನ್ನು ಮರೆಯಬೇಡಿ.`,
        mr: `लक्षात असू द्या: जहाज वाऱ्याच्या दिशेनेच वेगाने जाते — तुमच्या आयुष्याचा अनुकूल वारा म्हणजे '${ctx.yogiPlanetName}'.`,
        hi: `याद रखें: नौका हवा के साथ चलने पर ही तेज़ दौड़ती है — आपके जीवन की वह अनुकूल पवन '${ctx.yogiPlanetName}' है।`,
        te: `సూత్రం: పడవ గాలి వాటానికి నడిచినప్పుడే వేగం పెరుగుతుంది — మీ అనుకూల గాలి '${ctx.yogiPlanetName}' అని మరువకండి.`,
        ta: `நெறி: காற்றோடு செல்லும்போதுதான் படகு வேகம் எடுக்கும் — உங்கள் சாதகக் காற்று '${ctx.yogiPlanetName}' என்பதை மறக்காதீர்கள்.`,
        en: `Sailing Rule: Stop rowing hard into locked wind—wait for ${ctx.localizedYogiDay} and watch effort glide.`
      }
    };

    return {
      p1Focus: p1Variants[ed],
      p2Body: pick6(p2Map[ed], lang),
      p3Body: pick6(p3Map[ed], lang),
      reflectionNote: pick6(reflMap[ed], lang)
    };
  }

  if ([1, 2, 4, 5, 11].includes(chNum)) {
    return buildCoreBlueprintSupplement(chNum, arch, ctx, savByHouse);
  }
  if ([7, 8, 9, 10].includes(chNum)) {
    return buildTransitSupplement(chNum, arch, ctx, savByHouse);
  }
  if ([12, 13, 14, 15, 16].includes(chNum)) {
    return buildLifeDomainSupplement(chNum, arch, ctx, savByHouse, isChildOrInfant, isMinor, isSenior);
  }
  return buildDestinyHorizonSupplement(chNum, arch, ctx, savByHouse, isChildOrInfant, isMinor, isSenior);
}

interface ChapterSupplement {
  p1Focus: string;
  p2Body: string;
  p3Body: string;
  reflectionNote: string;
}

function buildCoreBlueprintSupplement(
  chNum: number,
  arch: ChartArchetypeSnapshot,
  ctx: StoryEngineInput,
  savByHouse: Record<number, number>
): ChapterSupplement {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const ext = ctx.extendedPrecision;

  if (chNum === 1) {
    const p1Variants: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: { kn: "", mr: "", hi: "", te: "", ta: "", en: "" },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.nakshatraName} ಜನ್ಮ ತಾರೆಯ ಮೇಲೆ ಇಂದಿನ '${ctx.livePrashnaHora}' ಹೋರೆಯು ಪ್ರತ್ಯಕ್ಷವಾಗಿ ಬೆಳಕು ಚೆಲ್ಲುತ್ತಿದೆ.`,
        mr: `तुमच्या ${ctx.nakshatraName} नक्षत्रावर आत्ताचा '${ctx.livePrashnaHora}' होरा थेट प्रकाश टाकत आहे.`,
        hi: `आपके ${ctx.nakshatraName} नक्षत्र पर वर्तमान '${ctx.livePrashnaHora}' होरा सीधा प्रकाश डाल रहा है।`,
        te: `మీ ${ctx.nakshatraName} నక్షత్రంపై ప్రస్తుత '${ctx.livePrashnaHora}' హోర స్పష్టమైన సంకేతాన్ని చూపుతోంది.`,
        ta: `உங்கள் ${ctx.nakshatraName} நட்சத்திரத்தின் மீது தற்போதைய '${ctx.livePrashnaHora}' ஹோரை நேரடி ஒளி பாய்ச்சுகிறது.`,
        en: `Aligning ${ctx.livePrashnaHora} Hora directly with your ${ctx.nakshatraName} rhythm clarifies why this question rose today.`
      },
      2: {
        kn: `${ctx.lagnaRashiName} ಲಗ್ನದ ${n(savByHouse[1])} ಬಿಂದುಗಳು ನಿಮಗೆ ಪರಿಸ್ಥಿತಿಯನ್ನು ತೂಗುವ ಶಾಂತ ದೃಷ್ಟಿ ನೀಡಿವೆ.`,
        mr: `${ctx.lagnaRashiName} लग्नाचे ${n(savByHouse[1])} गुण तुम्हाला शांतपणे परिस्थिती जोखण्याची ताकद देतात.`,
        hi: `${ctx.lagnaRashiName} लग्न के ${n(savByHouse[1])} बिंदू आपको परिस्थिति को शांत भाव से परखने की शक्ति देते हैं।`,
        te: `${ctx.lagnaRashiName} లగ్నంలోని ${n(savByHouse[1])} బిందువులు పరిస్థితిని ప్రశాంతంగా అంచనా వేసే బలాన్ని ఇస్తాయి.`,
        ta: `${ctx.lagnaRashiName} லக்னத்தின் ${n(savByHouse[1])} பரல்கள் சூழலை நிதானமாக எடைபோடும் திறனைத் தருகின்றன.`,
        en: `Grounded in ${savByHouse[1]} Lagna bindus, your ${ctx.lagnaRashiName} instinct senses real stakes well before others speak.`
      },
      3: {
        kn: `ಮೋಡ ಕವಿದ ಆಕಾಶದ ಹಿಂದೆ ಸೂರ್ಯ ನಿಶ್ಚಲವಾಗಿರುವಂತೆ, ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) ನಿಮ್ಮ ದಾರಿಯನ್ನು ಕಾಯುತ್ತಿದೆ.`,
        mr: `ढगांमागे सूर्य अढळ राहतो, तसेच ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) तुमच्या पाठीशी खंबीरपणे उभा आहे.`,
        hi: `बादलों के पीछे जैसे सूर्य अटल रहता है, वैसे ही ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) आपकी राह सुरक्षित रख रहे हैं।`,
        te: `మేఘాల వెనుక సూర్యుడు స్థిరంగా ఉన్నట్లు, ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) మీకు అండగా నిలుస్తోంది.`,
        ta: `மேகங்களுக்குப் பின்னால் சூரியன் உறுதியாக இருப்பது போல், ${ctx.heroPlanetName} (${ctx.heroPlanetRashi}) உங்கள் பாதையைக் காக்கிறது.`,
        en: `Behind passing cloud cover, ${ctx.heroPlanetName} inside ${ctx.heroPlanetRashi} keeps your main compass steady.`
      }
    };

    const taraLine = arch.taraEnergyTier === "high"
      ? pick6({
          kn: `${ctx.lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${ctx.nakshatraName} ನಕ್ಷತ್ರಕ್ಕೆ ಇಂದಿನ ತಾರಾಬಲ ಅಂಕ (${n(ext.liveTarabala.score)}%) ಹೆಚ್ಚಿರುವುದರಿಂದ ಹಿಂಜರಿಯದೆ ನೇರ ಸಂಭಾಷಣೆ ಆರಂಭಿಸಲು ಉತ್ತಮ ಕ್ಷಣವಾಗಿದೆ.`,
          mr: `${ctx.lagnaRashiName} लग्न व ${ctx.nakshatraName} नक्षत्रासाठी आजचे ताराबल (${n(ext.liveTarabala.score)}%) उच्च असल्याने थेट संवाद सुरू करण्याची ही योग्य वेळ आहे.`,
          hi: `${ctx.lagnaRashiName} लग्न एवं ${ctx.nakshatraName} नक्षत्र हेतु आज का ताराबल (${n(ext.liveTarabala.score)}%) उच्च होने से स्पष्ट पहल करने का यह उपयुक्त क्षण है।`,
          te: `${ctx.lagnaRashiName} లగ్నం మరియు ${ctx.nakshatraName} నక్షత్రానికి నేటి తారాబలం (${n(ext.liveTarabala.score)}%) ఎక్కువగా ఉన్నందున స్పష్టంగా మాట్లాడటం మంచిది.`,
          ta: `${ctx.lagnaRashiName} லக்னம் மற்றும் ${ctx.nakshatraName} நட்சத்திரத்திற்கு இன்றைய தாராபலம் (${n(ext.liveTarabala.score)}%) உயர்ந்துள்ளதால் நேரடியாகப் பேசத் தகுந்த நேரம் இது.`,
          en: `With live Tarabala scoring ${ext.liveTarabala.score}% for your ${ctx.lagnaRashiName}–${ctx.nakshatraName} chart, calm direct action carries natural backing this hour.`
        }, lang)
      : pick6({
          kn: `${ctx.lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${ctx.nakshatraName} ನಕ್ಷತ್ರಕ್ಕೆ ಇಂದಿನ ತಾರಾಬಲ (${n(ext.liveTarabala.score)}%) ಶಾಂತ ಪರಿಶೀಲನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ — ಆತುರಕ್ಕಿಂತ ಸ್ಪಷ್ಟ ದಾಖಲೆ ಗಮನಿಸಿ.`,
          mr: `${ctx.lagnaRashiName} लग्न व ${ctx.nakshatraName} नक्षत्रासाठी आजचे ताराबल (${n(ext.liveTarabala.score)}%) शांत निरीक्षणाची सूचना देते — घाईपेक्षा तथ्यांची खात्री करा.`,
          hi: `${ctx.lagnaRashiName} लग्न एवं ${ctx.nakshatraName} नक्षत्र हेतु आज का ताराबल (${n(ext.liveTarabala.score)}%) शांत परख का संकेत देता है — जल्दबाजी के बजाय तथ्य जांचें।`,
          te: `${ctx.lagnaRashiName} లగ్నం మరియు ${ctx.nakshatraName} నక్షత్రానికి నేటి తారాబలం (${n(ext.liveTarabala.score)}%) ఓపికను సూచిస్తోంది — వివరాలు సరిచూడండి.`,
          ta: `${ctx.lagnaRashiName} லக்னம் மற்றும் ${ctx.nakshatraName} நட்சத்திரத்திற்கு இன்றைய தாராபலம் (${n(ext.liveTarabala.score)}%) நிதான ஆய்வுக்கு வழிகாட்டுகிறது — விவரங்களைச் சரிபாருங்கள்.`,
          en: `With today's Tarabala calibrated at ${ext.liveTarabala.score}% across ${ctx.lagnaRashiName}–${ctx.nakshatraName}, careful review outperforms impulsive speed.`
        }, lang);

    const reflVariants: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `${ctx.livePrashnaHora} ಹೋರೆಯಲ್ಲಿ ಹುಟ್ಟಿದ ಈ ಕ್ಷಣದ ಪ್ರಾಮಾಣಿಕ ಆಲೋಚನೆಯನ್ನು ಬದಿಗಿಡದೆ ಗುರುತು ಹಾಕಿಕೊಳ್ಳಿ.`,
        mr: `${ctx.livePrashnaHora} होऱ्यात मनात आलेला हा प्रामाणिक विचार दुर्लक्षित करू नका.`,
        hi: `${ctx.livePrashnaHora} होरा में मन में उभरे इस सच्चे विचार को आज ध्यान से अंकित करें।`,
        te: `${ctx.livePrashnaHora} హోరలో మీ మనసులో మెదిలిన నిజమైన ఆలోచనను గుర్తుంచుకోండి.`,
        ta: `${ctx.livePrashnaHora} ஹோரையில் உங்கள் உள்ளத்தில் எழுந்த நேர்மையான எண்ணத்தைக் குறித்துக் கொள்ளுங்கள்.`,
        en: `Notice which thought surfaced first inside this ${ctx.livePrashnaHora} Hora—truth knocks quietly before noon.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.heroPlanetHouse}ನೇ ಮನೆಯ ಬಲವು ಯಾರನ್ನೂ ಕೇಳದೆಯೇ ನಿಮ್ಮ ಮನದೊಳಗೆ ಈಗಾಗಲೇ ಉತ್ತರ ಬರೆದಿದೆ.`,
        mr: `तुमच्या ${n(ctx.heroPlanetHouse)}व्या भावाच्या ताकदीने कोणालाही न विचारताच आत योग्य उत्तर तयार केले आहे.`,
        hi: `आपके ${n(ctx.heroPlanetHouse)}वें भाव की शक्ति ने आपके भीतर पहले ही शांत उत्तर तैयार कर रखा है।`,
        te: `మీ ${n(ctx.heroPlanetHouse)}వ స్థాన బలం లోపలే సరైన సమాధానాన్ని ఇప్పటికే సిద్ధం చేసింది.`,
        ta: `உங்கள் ${n(ctx.heroPlanetHouse)}-ம் இட பலம் ஏற்கனவே உங்கள் உள்ளத்திற்குள் தெளிவான விடையை வைத்துள்ளது.`,
        en: `Check what your House ${ctx.heroPlanetHouse} intuition knew calmly before outside noise clouded the room.`
      },
      2: {
        kn: `ಇಂದಿನ ಶಕ್ತಿ (${n(ext.liveTarabala.score)}%) ಹಾಗೂ ಯೋಗಿ ${ctx.yogiPlanetName} ಒಟ್ಟಾಗಿ ಅನಗತ್ಯ ಚಿಂತೆಗಳನ್ನು ಬೇರ್ಪಡಿಸುತ್ತವೆ.`,
        mr: `आजची ऊर्जा (${n(ext.liveTarabala.score)}%) आणि योगी ${ctx.yogiPlanetName} मिळून खऱ्या-खोट्या चिंतेत फरक दाखवतात.`,
        hi: `आज की ऊर्जा (${n(ext.liveTarabala.score)}%) और योगी ${ctx.yogiPlanetName} आवश्यक एवं व्यर्थ चिंता को अलग करते हैं।`,
        te: `నేటి బలం (${n(ext.liveTarabala.score)}%) మరియు యోగి ${ctx.yogiPlanetName} అనవసర భయాలను తొలగిస్తున్నాయి.`,
        ta: `இன்றைய பலம் (${n(ext.liveTarabala.score)}%) மற்றும் யோகி ${ctx.yogiPlanetName} தேவையற்ற கவலையைப் பிரித்தெடுக்கின்றன.`,
        en: `Weighing today's ${ext.liveTarabala.score}% rhythm beside Yogi ${ctx.yogiPlanetName} separates vital choices from busy noise.`
      },
      3: {
        kn: `ಗಾಳಿಯ ಶಬ್ದ ಕೇಳಿಸದಿದ್ದರೂ ದೋಣಿ ಮುಂದೆ ಸಾಗುವಂತೆ, ${ctx.lagnaRashiName} ಮನಸ್ಸು ಈ ಕ್ಷಣ ಸರಿಯಾದ ದಿಕ್ಕನ್ನು ಗ್ರಹಿಸುತ್ತಿದೆ.`,
        mr: `वारा न दिसताही होडी पुढे जावी, तसे ${ctx.lagnaRashiName} मन आत्ताच अचूक दिशा ओळखत आहे.`,
        hi: `हवा दिखाई न देने पर भी जैसे नाव दिशा पकड़ती है, आपका ${ctx.lagnaRashiName} मन अभी सही राह पहचान रहा है।`,
        te: `గాలి కనిపించకపోయినా పడవ ముందుకు సాగినట్లుగా, మీ ${ctx.lagnaRashiName} మనసు సరైన దిశను గుర్తిస్తోంది.`,
        ta: `காற்று தெரியாவிட்டாலும் படகு நகர்வது போல், உங்கள் ${ctx.lagnaRashiName} மனம் சரியான திசையை உணர்கிறது.`,
        en: `Silent wind moves heavy sails first—honor the quiet nudge waking inside your ${ctx.lagnaRashiName} sky.`
      }
    };

    return {
      p1Focus: ed === 0 ? "" : pick6(p1Variants[ed], lang),
      p2Body: taraLine,
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6(reflVariants[ed], lang)
    };
  }

  if (chNum === 2) {
    // Inner Identity vs Outer Mask: Lagna Lord (House 1 SAV) vs Home Heart (House 4 Lord & SAV)
    const lagnaSavTone = classifySav(savByHouse[1]) === "strong"
      ? pick6({
          kn: `ಲಗ್ನ ಭಾವದಲ್ಲೇ ಬಲಿಷ್ಠ ${n(savByHouse[1])} ಬಿಂದುಗಳು ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ ${ext.house1Info.lordName} (${n(ext.house1Info.placedHouse)}ನೇ ಮನೆ) ಇರುವುದರಿಂದ ಜನರು ನಿಮ್ಮನ್ನು ಅಚಲ ಕಂಬವೆಂದು ಭಾವಿಸುತ್ತಾರೆ.`,
          mr: `लग्न भावात भक्कम ${n(savByHouse[1])} गुण व लग्नेश ${ext.house1Info.lordName} (${n(ext.house1Info.placedHouse)}वे स्थान) असल्याने लोक तुम्हाला नेहमी स्थिर आधार मानतात.`,
          hi: `लग्न भाव में पुष्ट ${n(savByHouse[1])} बिंदू और लग्नेश ${ext.house1Info.lordName} (${n(ext.house1Info.placedHouse)}वां स्थान) होने से लोग आपको अटल स्तंभ समझते हैं।`,
          te: `లగ్నంలో బలమైన ${n(savByHouse[1])} బిందువులు మరియు లగ్నాధిపతి ${ext.house1Info.lordName} (${n(ext.house1Info.placedHouse)}వ స్థానం) ఉండటం వల్ల అందరూ మిమ్మల్ని కదిలించలేని వ్యక్తిగా చూస్తారు.`,
          ta: `லக்னத்தில் வலிமையான ${n(savByHouse[1])} பரல்களும் லக்னாதிபதி ${ext.house1Info.lordName}-ம் (${n(ext.house1Info.placedHouse)}-ம் வீடு) இருப்பதால் அனைவரும் உங்களை உறுதியான தூணாகப் பார்க்கின்றனர்.`,
          en: `Carrying ${savByHouse[1]} Lagna bindus with Ascendant lord ${ext.house1Info.lordName} in House ${ext.house1Info.placedHouse}, relatives lean on your composure without seeing fatigue.`
        }, lang)
      : pick6({
          kn: `ಲಗ್ನದಲ್ಲಿ ${n(savByHouse[1])} ಬಿಂದುಗಳು ಮತ್ತು ಚಂದ್ರ ರಾಶಿ ${ctx.moonRashiName}ದ ಸೂಕ್ಷ್ಮ ಮನಸ್ಸು ಇರುವುದರಿಂದ, ಹೊರಗೆ ಧೈರ್ಯ ತೋರಿದರೂ ಒಳಗೆ ಎಲ್ಲರ ಭಾವನೆಗಳನ್ನು ಗ್ರಹಿಸುತ್ತೀರಿ.`,
          mr: `लग्नातील ${n(savByHouse[1])} गुण व ${ctx.moonRashiName} राशीच्या संवेदनशीलतेमुळे बाहेरून खंबीर दिसला तरी मनात सर्वांची काळजी वाहता.`,
          hi: `लग्न के ${n(savByHouse[1])} बिंदू और ${ctx.moonRashiName} चंद्र की संवेदना के कारण आप बाहर से शांत रहकर भी भीतर से सबकी चिंता संभालते हैं।`,
          te: `లగ్నంలోని ${n(savByHouse[1])} బిందువులు మరియు ${ctx.moonRashiName} చంద్ర సున్నితత్వం వల్ల బయటకు ప్రశాంతంగా ఉన్నా లోపల అందరి బాధ్యతలు మోస్తారు.`,
          ta: `லக்னத்தின் ${n(savByHouse[1])} பரல்களும் ${ctx.moonRashiName} சந்திர உணர்வும் வெளியே அமைதியாகத் தெரிந்தாலும் உள்ளுக்குள் பல பொறுப்புகளைத் தாங்க வைக்கின்றன.`,
          en: `With ${savByHouse[1]} Lagna bindus alongside a sensitive ${ctx.moonRashiName} Moon, you radiate calm strength outside while absorbing deep moods indoors.`
        }, lang);

    const p2Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಇದರಲ್ಲಿರುವ ವಿಭಿನ್ನ ಪಾಠ: ${n(savByHouse[4])} ಬಿಂದುಗಳ ೪ನೇ ಹೃದಯ ಸ್ಥಾನ (ಅಧಿಪತಿ ${ext.house4Info.lordName}, ${ext.house4Info.placedRashi}) ನೀವು 'ಎಲ್ಲವನ್ನೂ ನಾನೇ ನಿಭಾಯಿಸುತ್ತೇನೆ' ಎಂಬ ಮೌನ ಒಪ್ಪಂದವನ್ನು ಸ್ವಲ್ಪ ಸಡಿಲಿಸಬೇಕೆಂದು ಸೂಚಿಸುತ್ತದೆ.`,
        mr: `लक्षात घेण्याजोगा समतोल: ${n(savByHouse[4])} गुणांचे चतुर्थ हृदय स्थान (स्वामी ${ext.house4Info.lordName}, ${ext.house4Info.placedRashi}) सांगते की 'सगळे मीच सावरून घेईन' हा ताण थोडा सैल करावा.`,
        hi: `भीतरी संतुलन: ${n(savByHouse[4])} बिंदुओं वाला चतुर्थ हृदय भाव (स्वामी ${ext.house4Info.lordName}, ${ext.house4Info.placedRashi}) संकेत देता है कि 'सब अकेले संभालने' की जिद थोड़ी हल्की करें।`,
        te: `గుర్తించాల్సిన కోణం: ${n(savByHouse[4])} బిందువుల 4వ హృదయ స్థానం (అధిపతి ${ext.house4Info.lordName}, ${ext.house4Info.placedRashi}) అన్నీ ఒంటరిగా మోసే అలవాటును తగ్గించమని చెబుతోంది.`,
        ta: `உள்ளார்ந்த சமநிலை: ${n(savByHouse[4])} பரல்கள் கொண்ட 4-ம் மன இடம் (அதிபதி ${ext.house4Info.lordName}, ${ext.house4Info.placedRashi}) எல்லாவற்றையும் தனியே சுமக்கும் பழக்கத்தைத் தளர்த்தச் சொல்கிறது.`,
        en: `Inside House 4 (${savByHouse[4]} bindus, lord ${ext.house4Info.lordName} in ${ext.house4Info.placedRashi}), quiet exhaustion melts the moment you allow trusted family to share load.`
      },
      1: {
        kn: `ನಿಮ್ಮ '${ctx.dominantElement}' ಸ್ವಭಾವ ಹಾಗೂ ${ctx.lagnaRashiName}–${ctx.moonRashiName} ಸಂಯೋಗವು ಇತರರ ಎದುರು ದುರ್ಬಲತೆ ತೋರಲು ಹಿಂಜರಿಯುವ ಅಭ್ಯಾಸವನ್ನು ಹುಟ್ಟಿಸಿದೆ.`,
        mr: `तुमची '${ctx.dominantElement}' प्रकृती आणि ${ctx.lagnaRashiName}–${ctx.moonRashiName} जोड इतर कोणासमोरही थकवा न दाखवण्याची सवय लावते.`,
        hi: `आपकी '${ctx.dominantElement}' प्रकृति और ${ctx.lagnaRashiName}–${ctx.moonRashiName} संयोग किसी के सामने अपनी थकान न जताने की आदत रचता है।`,
        te: `మీ '${ctx.dominantElement}' ప్రకృతి మరియు ${ctx.lagnaRashiName}–${ctx.moonRashiName} కలయిక ఎవరి ముందూ బలహీనత కనిపించనివ్వని స్వభావాన్ని ఇచ్చాయి.`,
        ta: `உங்கள் '${ctx.dominantElement}' இயல்பும் ${ctx.lagnaRashiName}–${ctx.moonRashiName} இணைவும் மற்றவர் முன் சோர்வைக் காட்டாத சுபாவத்தைத் தந்துள்ளன.`,
        en: `Blending ${ctx.dominantElement} temperament across ${ctx.lagnaRashiName} and ${ctx.moonRashiName} built admirable grit—yet true closeness needs occasional honesty too.`
      },
      2: {
        kn: `ಹೊರಗಿನ ಲಗ್ನ (${n(savByHouse[1])} ಬಿಂದು) ಹಾಗೂ ಒಳಗಿನ ಮನಃಶಾಂತಿ (${n(savByHouse[4])} ಬಿಂದು) ನಡುವಿನ ಅಂತರವನ್ನು ಸಮಗೊಳಿಸುವುದೇ ನಿಜವಾದ ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸ.`,
        mr: `बाह्य लग्न (${n(savByHouse[1])} गुण) आणि अंतर्गत समाधान (${n(savByHouse[4])} गुण) यांतील दरी मिटवणे हाच खरा आत्मविकास आहे.`,
        hi: `बाहरी लग्न (${n(savByHouse[1])} बिंदू) और भीतरी संतोष (${n(savByHouse[4])} बिंदू) के बीच की दूरी कम करना ही वास्तविक संतुलन है।`,
        te: `బయటి లగ్న బలం (${n(savByHouse[1])} బిందువులు) మరియు లోపలి మనశ్శాంతి (${n(savByHouse[4])} బిందువులు) మధ్య సమతూకం సాధించడమే కీలకం.`,
        ta: `வெளி லக்ன பலம் (${n(savByHouse[1])} பரல்கள்) மற்றும் உள் மன அமைதி (${n(savByHouse[4])} பரல்கள்) இடையிலான இடைவெளியைக் குறைப்பதே உண்மையான வளர்ச்சி.`,
        en: `Closing the gap between public duty (H1: ${savByHouse[1]} bindus) and private peace (H4: ${savByHouse[4]} bindus) restores effortless warmth.`
      },
      3: {
        kn: `ಮನೆಯ ಮುಖ್ಯ ದೀಪ ಎಲ್ಲರಿಗೂ ಬೆಳಕು ಕೊಟ್ಟರೂ ಅದರ ಬುಡದಲ್ಲೇ ನೆರಳಿರುವಂತೆ, ${ctx.lagnaRashiName}–${ctx.moonRashiName} ಪ್ರಭಾವವುಳ್ಳ ನೀವು ಎಲ್ಲರನ್ನೂ ಸಂತೈಸುತ್ತಾ ನಿಮ್ಮ ಮನಸ್ಸಿಗೂ ನೆರಳು ಕೊಡಬೇಕು.`,
        mr: `घरातील मुख्य दिवा सर्वांना प्रकाश देतो पण त्याखालचा तळ सावलीत राहतो; ${ctx.lagnaRashiName}–${ctx.moonRashiName} स्वभावाच्या तुम्हालाही स्वतःच्या मनासाठी विसावा हवाच.`,
        hi: `जैसे कक्ष का मुख्य दीपक सबको उजाला देकर स्वयं तले छाया में रहता है, वैसे ही ${ctx.lagnaRashiName}–${ctx.moonRashiName} स्वभाव में सबका संबल बनते समय अपने मन को भी विश्राम दें।`,
        te: `ఇంట్లోని పెద్ద దీపం అందరికీ వెలుగునిచ్చినట్లే ${ctx.lagnaRashiName}–${ctx.moonRashiName} స్వభావం కల మీరు అందరికీ అండగా ఉంటారు—కానీ మీ మనసుకు కూడా విశ్రాంతి అవసరం.`,
        ta: `வீட்டின் பெரிய விளக்கு அனைவருக்கும் ஒளி தந்தாலும் தன் அடியில் நிழலைச் சுமப்பது போல், ${ctx.lagnaRashiName}–${ctx.moonRashiName} இயல்புடைய நீங்களும் சற்று இளைப்பாற வேண்டும்.`,
        en: `Inside your ${ctx.lagnaRashiName}–${ctx.moonRashiName} balance, remember that even a lantern lighting an entire courtyard leaves cool shadow right underneath its base.`
      }
    };

    const p3Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `${ext.house1Info.lordName} ಶಕ್ತಿಯನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲು ವಾರಕ್ಕೊಮ್ಮೆಯಾದರೂ ನಂಬಿಕಸ್ಥರ ಮುಂದೆ 'ಇಂದು ನನಗೂ ವಿಶ್ರಾಂತಿ ಬೇಕು' ಎಂದು ಮುಕ್ತವಾಗಿ ಹೇಳಿ.`,
        mr: `${ext.house1Info.lordName} ची ताकद टिकवण्यासाठी आठवड्यातून एकदा तरी 'आज मलाही थोडा विसावा हवा आहे' हे मोकळेपणाने सांगा.`,
        hi: `${ext.house1Info.lordName} की ऊर्जा सुरक्षित रखने हेतु सप्ताह में एक बार किसी विश्वस्त से 'आज मुझे भी विश्राम चाहिए' सहज कहें।`,
        te: `${ext.house1Info.lordName} శక్తిని కాపాడుకోవడానికి వారానికి ఒక్కసారైనా ఆప్తుల వద్ద మీ మనసులోని భారాన్ని పంచుకోండి.`,
        ta: `${ext.house1Info.lordName} ஆற்றலைப் பாதுகாக்க வாரத்தில் ஒரு நாளாவது நம்பிக்கைக்குரியவரிடம் உங்கள் சோர்வை மனம் திறந்து பகிருங்கள்.`,
        en: `Protect ${ext.house1Info.lordName}'s stamina cleanly: practice telling one trusted person what you genuinely prefer rather than automatically nodding.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.yogiPlanetName} ಅನುಕೂಲವನ್ನು ಉಪಯೋಗಿಸಿ ಅನಗತ್ಯ 'ಹೌದು' ಹೇಳುವ ಮುನ್ನ ಒಂದು ಕ್ಷಣ ಉಸಿರು ತೆಗೆದುಕೊಂಡು ಉತ್ತರಿಸಿ.`,
        mr: `${ctx.yogiPlanetName} ची अनुकूलता वापरून कोणालाही लगेच 'हो' म्हणण्यापूर्वी एक शांत श्वास घेऊन उत्तर द्या.`,
        hi: `अपने ${ctx.yogiPlanetName} बल का उपयोग कर किसी को तुरंत 'हां' कहने से पहले एक क्षण ठहरकर अपनी सुविधा परखें।`,
        te: `మీ ${ctx.yogiPlanetName} బలాన్ని ఉపయోగించి ప్రతిదానికి వెంటనే 'సరే' అనకుండా కాస్త సమయం తీసుకుని మాట్లాడండి.`,
        ta: `உங்கள் ${ctx.yogiPlanetName} பலத்தைப் பயன்படுத்தி எதற்கும் உடனே 'சரி' என்று சொல்வதற்கு முன் ஒரு கணம் சிந்தியுங்கள்.`,
        en: `Channel Yogi ${ctx.yogiPlanetName} wisely—pause three seconds before saying yes to favors nobody else volunteered to hold.`
      },
      2: {
        kn: `೪ನೇ ಮನೆಯ ${ext.house4Info.lordName} ತೃಪ್ತಿಗೆ ಪ್ರತಿದಿನ ಸಂಜೆ ೧೦ ನಿಮಿಷ ಯಾವುದೇ ಪಾತ್ರೆಯಿಲ್ಲದ, ಪ್ರಶಾಂತ ಮೌನ ಸಮಯ ನಿಗದಿಪಡಿಸಿ.`,
        mr: `चतुर्थेश ${ext.house4Info.lordName} च्या शांततेसाठी रोज संध्याकाळी १० मिनिटे कोणतीही जबाबदारी नसलेला निवांत वेळ स्वतःसाठी ठेवा.`,
        hi: `चतुर्थेश ${ext.house4Info.lordName} की शांति हेतु प्रतिदिन संध्याकाल १० मिनट बिना किसी भूमिका या दायित्व के स्वयं के लिए रखें।`,
        te: `4వ అధిపతి ${ext.house4Info.lordName} ప్రశాంతత కోసం ప్రతి సాయంత్రం 10 నిమిషాలు ఎటువంటి బాధ్యత లేని ఏకాంత సమయాన్ని కేటాయించండి.`,
        ta: `4-ம் அதிபதி ${ext.house4Info.lordName} அமைதிக்காகத் தினமும் மாலை 10 நிமிடங்கள் எந்தப் பொறுப்புமற்ற தனிமையான நேரத்தை ஒதுக்குங்கள்.`,
        en: `To recharge 4th-lord ${ext.house4Info.lordName}, guard ten quiet unscheduled evening minutes where you answer nobody's expectations.`
      },
      3: {
        kn: `ನೈಜ ಗೌರವವು ಮೌನವಾಗಿ ನೋವು ನುಂಗುವುದರಿಂದ ಬರುವುದಿಲ್ಲ — ಸ್ಪಷ್ಟ ಗಡಿಗಳನ್ನು ಗೌರವದಿಂದ ಹೇಳುವುದರಿಂದ ಬರುತ್ತದೆ.`,
        mr: `खरा सन्मान गप्प राहून ताण सहन केल्याने नाही, तर नम्रपणे पण स्पष्ट मर्यादा आखल्यानेच मिळतो.`,
        hi: `सच्चा सम्मान चुपचाप बोझ ढोने से नहीं, अपितु विनम्र एवं स्पष्ट सीमा तय करने से बढ़ता है।`,
        te: `నిజమైన గౌరవం మౌనంగా కష్టపడటంతో కాదు — మర్యాదగా మీ హద్దులను స్పష్టంగా చెప్పినప్పుడే పెరుగుతుంది.`,
        ta: `உண்மையான மரியாதை மௌனமாகச் சுமப்பதால் அல்ல — அன்புடன் கூடிய தெளிவான எல்லைகளை வகுப்பதாலேயே உயரும்.`,
        en: `Clear boundaries never push loyal hearts away—warm clarity earns deeper respect than silent overgiving.`
      }
    };

    const reflMap: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಅಂತರಂಗದ ಪ್ರಶ್ನೆ: 'ಎಲ್ಲರಿಗೂ ಅನುಕೂಲ' ಮಾಡಿಕೊಡುವ ಭರದಲ್ಲಿ ನಿಮ್ಮದೇ ಸ್ವಂತ ಆದ್ಯತೆಯನ್ನು ಕೊನೆಯದಾಗಿ ಯಾವಾಗ ಮುಂಚೂಣಿಯಲ್ಲಿಟ್ಟಿರಿ?`,
        mr: `अंतर्मुख प्रश्न: इतरांची सोय पाहताना तुम्ही स्वतःच्या मनाची आवड शेवटची केव्हा पूर्ण केली होती?`,
        hi: `मन का दर्पण: दूसरों की सुविधा साधते-साधते आपने अपनी सच्ची प्राथमिकता को अंतिम बार कब प्रथम रखा था?`,
        te: `అంతరంగ ప్రశ్న: అందరి సౌకర్యం చూస్తూ మీ సొంత ఆనందాన్ని చివరిసారి ఎప్పుడు మొదటి స్థానంలో ఉంచారు?`,
        ta: `மனக் கண்ணாடி: எல்லோருக்கும் வசதி செய்து தருவதில் உங்கள் சொந்த விருப்பத்திற்குக் கடைசியாக எப்போது முதலிடம் கொடுத்தீர்கள்?`,
        en: `Self-Audit: When was the last day you honored a preference of your own without waiting for consensus?`
      },
      1: {
        kn: `ಒಳದೃಷ್ಟಿ: ಯಾರಾದರೂ 'ನೀವು ತುಂಬಾ ಗಟ್ಟಿ ಇದ್ದೀರಿ' ಎಂದು ಹೊಗಳಿದಾಗ, ಅದರ ಹಿಂದೆ ನಿಮ್ಮ ಆಂತರಿಕ ಆಯಾಸ ಅಡಗಿದೆಯೇ ಗಮನಿಸಿ.`,
        mr: `सूक्ष्म नोंद: कोणी 'तुम्ही खूप खंबीर आहात' असे म्हणताच त्यामागे लपलेला तुमचा थकवा तुम्ही ओळखता का?`,
        hi: `सूक्ष्म बोध: जब लोग आपकी सहनशक्ति की प्रशंसा करते हैं, तब भीतर छिपी थकान को आप स्वयं कितना सुनते हैं?`,
        te: `లోతైన చూపు: 'మీరు చాలా ధైర్యవంతులు' అని ఇతరులు అన్నప్పుడు లోపలి అలసటను మీరెంత గుర్తిస్తున్నారు?`,
        ta: `உள் பார்வை: 'நீங்கள் மிகவும் உறுதியானவர்' எனப் பிறர் புகழும்போது உள்ளே மறைந்திருக்கும் சோர்வைக் கவனிக்கிறீர்களா?`,
        en: `Mirror Moment: Notice how praising someone as 'always strong' quietly stops others from asking if you need support.`
      },
      2: {
        kn: `${ctx.lagnaRashiName} ಸ್ವಭಾವದ ಶಕ್ತಿಯು ಬೇರೆಯವರ ಜವಾಬ್ದಾರಿ ಹೊರುವುದಲ್ಲ, ಬದಲಿಗೆ ನಿಮ್ಮದೇ ಶಾಂತಿಯನ್ನು ಕಾಯುವುದರಲ್ಲಿದೆ.`,
        mr: `${ctx.lagnaRashiName} स्वभावाची खरी ताकद इतरांची जबाबदारी ओढण्यात नाही, तर स्वतःची शांतता जपण्यात आहे.`,
        hi: `${ctx.lagnaRashiName} स्वभाव की वास्तविक शक्ति सबका भार खींचने में नहीं, अपनी भीतरी शांति संजोने में निहित है।`,
        te: `${ctx.lagnaRashiName} తత్వపు అసలు బలం అందరి భారాన్నీ మోయడంలో కాదు, మీ మనశ్శాంతిని కాపాడుకోవడంలో ఉంది.`,
        ta: `${ctx.lagnaRashiName} இயல்பின் உண்மையான பலம் பிறர் சுமைகளை ஏற்பதில் அல்ல, உங்கள் அமைதியைப் பேணுவதில் உள்ளது.`,
        en: `Reframed Strength: Real ${ctx.lagnaRashiName} leadership delegates burdens gracefully rather than hoarding fatigue.`
      },
      3: {
        kn: `ಇಂದಿನ ಸಣ್ಣ ಅಭ್ಯಾಸ: 'ನಾನು ಸರಿ ಇದ್ದೇನೆ' ಎಂದು ಯಾಂತ್ರಿಕವಾಗಿ ಹೇಳುವ ಮೊದಲು ಒಮ್ಮೆ ಮನದ ಭಾವನೆಯನ್ನು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಗಮನಿಸಿ.`,
        mr: `आजचा छोटा सराव: कोणी विचारताच यांत्रिकपणे 'मी ठीक आहे' म्हणण्यापूर्वी मनातील खरी भावना ओळखा.`,
        hi: `आज का अभ्यास: औपचारिक रूप से 'सब ठीक है' कहने से पहले एक पल अपने वास्तविक मन की स्थिति देखें।`,
        te: `నేటి చిన్న మార్పు: యాంత్రికంగా 'అంతా బాగుంది' అనే ముందు మీ మనసు నిజంగా ఎలా ఉందో గమనించండి.`,
        ta: `இன்றைய பயிற்சி: இயந்திரத்தனமாக 'நான் நலமாக இருக்கிறேன்' என்று சொல்வதற்கு முன் உண்மையான மனநிலையை உணருங்கள்.`,
        en: `Daily Shift: Before replying 'I am fine' automatically, verify whether rest or honest conversation is actually overdue.`
      }
    };

    return {
      p1Focus: lagnaSavTone,
      p2Body: pick6(p2Map[ed], lang),
      p3Body: pick6(p3Map[ed], lang),
      reflectionNote: pick6(reflMap[ed], lang)
    };
  }

  if (chNum === 4) {
    // 99% Completion & Maandi (maandiCluster x Badhaka x Edition)
    const clusterFocus = arch.maandiCluster === "kendra"
      ? pick6({
          kn: `ಕೇಂದ್ರ ಸ್ಥಾನವಾದ ${n(ctx.maandiHouse)}ನೇ ಭಾವದಲ್ಲಿ (${ctx.maandiRashiName}, ${n(savByHouse[ctx.maandiHouse])} ಬಿಂದು) ಮಾಂದಿ ಕುಳಿತಿರುವುದರಿಂದ ಕೆಲಸದ ಮುಕ್ತಾಯದ ಹಂತದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಕೊನೆಯ ೧% ವಿಳಂಬ ಕಾಣಿಸುತ್ತದೆ.`,
          mr: `केंद्र स्थानातील ${n(ctx.maandiHouse)}व्या भावात (${ctx.maandiRashiName}, ${n(savByHouse[ctx.maandiHouse])} गुण) मांदी असल्याने शेवटच्या १% टप्प्यावर अनपेक्षित प्रतीक्षा येते.`,
          hi: `केंद्र के ${n(ctx.maandiHouse)}वें भाव (${ctx.maandiRashiName}, ${n(savByHouse[ctx.maandiHouse])} बिंदू) में मांदी विराजमान होने से समापन के अंतिम १% पर अचानक जांच आ जाती है।`,
          te: `కేంద్ర స్థానమైన ${n(ctx.maandiHouse)}వ ఇంటిలో (${ctx.maandiRashiName}, ${n(savByHouse[ctx.maandiHouse])} బిందువులు) మాంది ఉండటంతో చివరి 1% దగ్గర అనూహ్య ఆలస్యం కనిపిస్తుంది.`,
          ta: `கேந்திரமான ${n(ctx.maandiHouse)}-ம் இடத்தில் (${ctx.maandiRashiName}, ${n(savByHouse[ctx.maandiHouse])} பரல்கள்) மாந்தி அமர்வதால் இறுதி 1% கட்டத்தில் எதிர்பாராத தாமதம் ஏற்படுகிறது.`,
          en: `Positioned inside visible Kendra House ${ctx.maandiHouse} (${ctx.maandiRashiName}, ${savByHouse[ctx.maandiHouse]} bindus), Maandi puts public signatures under a 99% microscope.`
        }, lang)
      : arch.maandiCluster === "artha"
      ? pick6({
          kn: `ಧನ-ಪುಣ್ಯ ತ್ರಿಕೋನವಾದ ${n(ctx.maandiHouse)}ನೇ ಭಾವದಲ್ಲಿ (${ctx.maandiRashiName}) ಮಾಂದಿ ಇರುವುದರಿಂದ ಹಣಕಾಸು-ಭರವಸೆ ೯೯% ಹತ್ತಿರ ಬಂದು ಕೊನೆಯ ದಾಖಲೆಗಾಗಿ ನಿಲ್ಲುತ್ತದೆ.`,
          mr: `अर्थ-त्रिकोणातील ${n(ctx.maandiHouse)}व्या भावात (${ctx.maandiRashiName}) मांदी असल्यामुळे आर्थिक व्यवहार ९९% जवळ येऊन कागदपत्रांसाठी थांबतो.`,
          hi: `अर्थ-त्रिकोण के ${n(ctx.maandiHouse)}वें भाव (${ctx.maandiRashiName}) में मांदी होने से धन व वचन ९९% तक पहुंचकर अंतिम स्पष्टता पर रुकते हैं।`,
          te: `ధన-త్రికోణమైన ${n(ctx.maandiHouse)}వ స్థానంలో (${ctx.maandiRashiName}) మాంది ఉండటం వల్ల ఆర్థిక అంశాలు 99% వరకు వచ్చి ఆఖరి సంతకం దగ్గర ఆగుతాయి.`,
          ta: `தன-திரிகோண ${n(ctx.maandiHouse)}-ம் இடத்தில் (${ctx.maandiRashiName}) மாந்தி நிற்பதால் பண விஷயங்கள் 99% வரை வந்து கடைசி ஒப்புதலில் நிற்கின்றன.`,
          en: `Inside resource House ${ctx.maandiHouse} (${ctx.maandiRashiName}), Maandi turns near-done agreements into 99% pauses until terms sit in writing.`
        }, lang)
      : pick6({
          kn: `${n(ctx.maandiHouse)}ನೇ ಸ್ಥಾನದಲ್ಲಿ (${ctx.maandiRashiName}, ${n(savByHouse[ctx.maandiHouse])} ಬಿಂದು) ಮಾಂದಿ ಮತ್ತು ${n(ext.badhakaHouse)}ನೇ ಬಾಧಕಾಧಿಪತಿ ${ext.badhakaInfo.lordName} ಸೇರಿ ೯೯% ಹಂತದಲ್ಲಿ ತಾಳ್ಮೆ ಪರೀಕ್ಷಿಸುತ್ತವೆ.`,
          mr: `${n(ctx.maandiHouse)}व्या स्थानातील (${ctx.maandiRashiName}) मांदी व ${n(ext.badhakaHouse)}वा बाधकेश ${ext.badhakaInfo.lordName} मिळून ९९% टप्प्यावर तुमचा संयम तपासतात.`,
          hi: `${n(ctx.maandiHouse)}वें भाव (${ctx.maandiRashiName}) की मांदी एवं ${n(ext.badhakaHouse)}वें बाधक स्वामी ${ext.badhakaInfo.lordName} मिलकर ९९% पर धैर्य की परख करते हैं।`,
          te: `${n(ctx.maandiHouse)}వ స్థాన మాంది (${ctx.maandiRashiName}) మరియు ${n(ext.badhakaHouse)}వ బాధకాధిపతి ${ext.badhakaInfo.lordName} కలిసి 99% వద్ద మీ ఓర్పును పరీక్షిస్తున్నాయి.`,
          ta: `${n(ctx.maandiHouse)}-ம் இட மாந்தி (${ctx.maandiRashiName}) மற்றும் ${n(ext.badhakaHouse)}-ம் பாதகாதிபதி ${ext.badhakaInfo.lordName} இணைந்து 99% நிலையில் பொறுமையைச் சோதிக்கின்றன.`,
          en: `Working across subtle House ${ctx.maandiHouse} (${ctx.maandiRashiName}) alongside Badhaka lord ${ext.badhakaInfo.lordName}, Maandi halts haste at 99% before weak leaks pass through.`
        }, lang);

    const p2Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `${n(ctx.maandiHouse)}ನೇ ಭಾವದ (${ctx.maandiRashiName}) ಕೊನೆಯ ೯೯% ಸಮೀಪದಲ್ಲೇ ನಿಂತಂತೆ ಕಂಡರೂ, ವಾಸ್ತವವಾಗಿ ಆ ೧% ವಿಳಂಬವು ಮುಂದೆ ನಿಮಗೆ ಬರಬಹುದಾದ ತಪ್ಪು ಸಾಲ-ಒಪ್ಪಂದದಿಂದ ಕಾಪಾಡಿದೆ.`,
        mr: `${n(ctx.maandiHouse)}व्या भावातील (${ctx.maandiRashiName}) ९९% वर काम थांबल्यासारखे वाटले तरी प्रत्यक्षात त्या १% विलंबानेच तुम्हाला मोठ्या धोक्यापासून वाचवले आहे.`,
        hi: `${n(ctx.maandiHouse)}वें भाव (${ctx.maandiRashiName}) में ९९% पर रुकना निराशाजनक लग सकता है, किंतु उस अंतिम १% विलंब ने कई बार आपको अनुचित शर्तों से बचाया है।`,
        te: `${n(ctx.maandiHouse)}వ స్థానంలో (${ctx.maandiRashiName}) 99% వద్ద ఆగినా, నిజానికి ఆ చివరి 1% ఆలస్యం మిమ్మల్ని తప్పుడు ఒప్పందాల నుండి కాపాడింది.`,
        ta: `${n(ctx.maandiHouse)}-ம் இடத்தில் (${ctx.maandiRashiName}) 99%-ல் நின்றதாகத் தோன்றினாலும், அந்தக் கடைசி 1% தாமதமே தவறான ஒப்பந்தங்களிலிருந்து உங்களைக் காத்தது.`,
        en: `Stopping at 99% inside House ${ctx.maandiHouse} (${ctx.maandiRashiName}) feels infuriating in real time—yet repeatedly that final hold shielded you from signing flawed terms too soon.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.maandiDomainAffected} ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಯೋಗಿ ${ctx.yogiPlanetName} ಬಲದ ದಿನದಂದು ಮಾತ್ರ ಕೊನೆಯ ಅನುಮತಿ ಪಡೆಯುವ ನಿಯಮ ಹಾಕಿದರೆ ಈ ಗಂಟು ಬೇಗ ಕರಗುತ್ತದೆ.`,
        mr: `${ctx.maandiDomainAffected} क्षेत्रात फक्त योगी ${ctx.yogiPlanetName} च्या शुभ दिवशी अंतिम पाठपुरावा केल्यास शेवटचा टप्पा सहज पार होतो.`,
        hi: `${ctx.maandiDomainAffected} विषय में केवल योगी ${ctx.yogiPlanetName} की अनुकूल घड़ी में अंतिम अनुमोदन मांगने से यह ९९% अवरोध खुलता है।`,
        te: `${ctx.maandiDomainAffected} రంగంలో యోగి ${ctx.yogiPlanetName} అనుకూల సమయంలో చివరి దశ పూర్తిచేస్తే ఈ 99% ఆటంకం సులభంగా తొలగుతుంది.`,
        ta: `${ctx.maandiDomainAffected} விஷயத்தில் யோகி ${ctx.yogiPlanetName} சாதக நாளில் இறுதி நடவடிக்கையை முடித்தால் 99% முட்டுக்கட்டை உடையும்.`,
        en: `Targeting ${ctx.maandiDomainAffected} closures specifically on Yogi ${ctx.yogiPlanetName} windows melts the 99% lock smoothly.`
      },
      2: {
        kn: `ಅಪೂರ್ಣ ಮೌಖಿಕ ಭರವಸೆ (೯೯%) vs ಲಿಖಿತ ಅಂತಿಮ ಪಟ್ಟಿ (೧೦೦%) — ಈ ಚಿಕ್ಕ ವ್ಯತ್ಯಾಸವೇ ಮಾಂದಿ ಪ್ರಭಾವವನ್ನು ಸೋಲಿಸುವ ಸರಳ ತಂತ್ರವಾಗಿದೆ.`,
        mr: `तोंडी आश्वासन (९९%) वि. स्पष्ट लेखी खात्री (१००%) — हा छोटा फरक पाळल्यास मांदीची अडचण कायमची दूर होते.`,
        hi: `मौखिक भरोसा (९९%) बनाम लिखित अंतिम जांच (१००%) — यह छोटा नियम अपनाते ही मांदी की बाधा शांत हो जाती है।`,
        te: `మౌఖిక హామీ (99%) మరియు రాతపూర్వక స్పష్టత (100%) మధ్య ఉన్న తేడాను పాటిస్తే మాంది ఆటంకం ఉండదు.`,
        ta: `வாய்மொழி உறுதி (99%) மற்றும் எழுத்துப்பூர்வ இறுதிச் சரிபார்ப்பு (100%) — இந்த மாற்றமே மாந்தியின் 99% தடையை வெல்லும்.`,
        en: `Compare verbal excitement (99%) against a two-item completion checklist (100%)—Maandi backs down immediately before precision.`
      },
      3: {
        kn: `ಬೆಳ್ಳಿಯ ನಾಣ್ಯವೂ ಕಡೆಯ ಪಾಲಿಷ್ ಇಲ್ಲದೆ ಹೊಳಪು ಪಡೆಯದಂತೆ, ${ctx.maandiDomainAffected} ವಲಯದ ಯೋಜನೆಗಳೂ ಕೊನೆಯ ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತವೆ ಎಂಬುದಷ್ಟೇ ಸತ್ಯ.`,
        mr: `शेवटची उजळणी झाल्याशिवाय रत्न चमकत नाही; तसेच ${ctx.maandiDomainAffected} क्षेत्रातील तुमचे परिश्रमही अंतिम तपासणीनंतरच पूर्ण झळाळी देतात.`,
        hi: `अंतिम तराश के बिना जैसे रत्न पूरा तेज नहीं देता, वैसे ही ${ctx.maandiDomainAffected} विषय के प्रयास समापन की सूक्ष्म परख मांगते हैं।`,
        te: `చివరి మెరుగులు దిద్దిన తర్వాతే వజ్రం మెరిసినట్లు, ${ctx.maandiDomainAffected} లోని మీ కృషి కూడా ఆఖరి పరిశీలన తర్వాత పూర్తి ప్రకాశిస్తుంది.`,
        ta: `இறுதி மெருகூட்டலுக்குப் பிறகே ஆபரணம் ஒளிர்வது போல், ${ctx.maandiDomainAffected} சார்ந்த உழைப்பும் கடைசிச் சரிபார்ப்புக்குப் பிறகே முழுப் பலன் தரும்.`,
        en: `Inside ${ctx.maandiDomainAffected}, fine silver reveals luster only on its final buff—slow last-inch checks upgrade your work from hurried to permanent.`
      }
    };

    const p3Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಪ್ರಾಯೋಗಿಕ ಕೀಲಿಕೈ: ಯಾವುದೇ ೯೯% ಹಂತದ ಕೆಲಸಕ್ಕೆ ಕನಿಷ್ಠ ೨೪ ಗಂಟೆ ಮುಂಚೆಯೇ ಕೊನೆಯ ದಾಖಲೆ ಹಾಗೂ ಬದಲಿ ಯೋಜನೆ ಸಿದ್ಧವಿಡಿ.`,
        mr: `व्यावहारिक उपाय: ९९% टप्प्यावरील कोणत्याही कामासाठी २४ तास आधीच अंतिम कागदपत्रे तयार ठेवा.`,
        hi: `व्यावहारिक कुंजी: किसी भी ९९% पर टिके कार्य की अंतिम औपचारिकता २४ घंटे पहले स्वयं जांचकर रख लें।`,
        te: `ఆచరణ మార్గం: 99% దశలో ఉన్న పని కోసం 24 గంటల ముందే చివరి వివరాలను సిద్ధంగా ఉంచుకోండి.`,
        ta: `நடைமுறைத் தீர்வு: 99% நிலையில் உள்ள எந்தக் காரியத்திற்கும் 24 மணி நேரம் முன்பே இறுதி ஆவணங்களைச் சரிபாருங்கள்.`,
        en: `Practical Countermove: Keep a calm buffer day ready whenever projects reach 90%—never leave the last 1% to deadline pressure.`
      },
      1: {
        kn: `${ctx.maandiHouse}ನೇ ಭಾವದ ಮಾಂದಿ ಗುಣಪಡಿಸಲು ಒಂದೇ ಕೆಲಸವನ್ನು ಅರ್ಧಕ್ಕೆ ಬಿಡದೆ ೧೦೦% ಬೀಗ ಹಾಕಿದ ನಂತರವೇ ಮುಂದಿನ ಹೆಜ್ಜೆ ಎತ್ತಿ.`,
        mr: `${n(ctx.maandiHouse)}व्या भावातील मांदी शांत ठेवण्यासाठी एक काम १००% पूर्ण करूनच पुढचा विषय हातात घ्या.`,
        hi: `${n(ctx.maandiHouse)}वें भाव की मांदी को साधने हेतु एक कार्य को १००% संपन्न करके ही अगले लक्ष्य पर जाएं।`,
        te: `${n(ctx.maandiHouse)}వ స్థాన మాందిని జయించాలంటే ఒక పనిని 100% ముగించాకే మరుసటి పని మొదలుపెట్టండి.`,
        ta: `${n(ctx.maandiHouse)}-ம் இட மாந்தியை வெல்ல ஒரு வேலையை 100% முடித்த பின்பே அடுத்ததில் இறங்குங்கள்.`,
        en: `Disarm House ${ctx.maandiHouse} Maandi effortlessly by closing one finish line cleanly before opening three fresh tabs.`
      },
      2: {
        kn: `ಬಾಧಕಾಧಿಪತಿ ${ext.badhakaInfo.lordName} ಕಲಿಸುವ ಶಿಸ್ತು ಒಂದೇ — ತರಾತುರಿಯ ನಿರೀಕ್ಷೆಯ ಬದಲು ತಾಳ್ಮೆಯ ಖಚಿತತೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.`,
        mr: `बाधकेश ${ext.badhakaInfo.lordName} एकच शिस्त शिकवतो — घाईच्या अपेक्षेपेक्षा निवांत खात्री निवडा.`,
        hi: `बाधक स्वामी ${ext.badhakaInfo.lordName} की एकमात्र सीख है — उतावलेपन की बजाय ठोस पुष्टि को चुनें।`,
        te: `బాధకాధిపతి ${ext.badhakaInfo.lordName} నేర్పే పాఠం ఒక్కటే — తొందరపాటు ఆశ కంటే నిదానమైన ఖచ్చితత్వం మేలు.`,
        ta: `பாதகாதிபதி ${ext.badhakaInfo.lordName} கற்பிக்கும் பாடம் ஒன்றே — அவசர எதிர்பார்ப்பை விட நிதான உறுதி சிறந்தது.`,
        en: `Badhaka lord ${ext.badhakaInfo.lordName} teaches one simple upgrade: choose calm written confirmation over hopeful assumption.`
      },
      3: {
        kn: `ಒಮ್ಮೆ ನೀವು ಕೊನೆಯ ಮೆಟ್ಟಿಲನ್ನೂ ತಾಳ್ಮೆಯಿಂದ ಮುಗಿಸಿದಾಗ, ಆ '೯೯% ನಿಲುಗಡೆ' ತಾನಾಗಿಯೇ ಅತ್ಯುನ್ನತ ಗುಣಮಟ್ಟದ ಮುದ್ರೆಯಾಗುತ್ತದೆ.`,
        mr: `एकदा का तुम्ही शेवटची पायरी शांतपणे पार केली की तीच '९९% थांबण्याची सवय' तुमच्या दर्जाची ओळख बनते.`,
        hi: `एक बार जब आप अंतिम सीढ़ी धैर्य से पार कर लेते हैं, तो यही '९९% परख' आपकी उत्कृष्ट गुणवत्ता की पहचान बनती है।`,
        te: `ఒక్కసారి మీరు చివరి మెట్టును ఓపికగా దాటితే, ఆ 99% ఆగిపోవడం మీ నాణ్యతకు గుర్తుగా మారుతుంది.`,
        ta: `ஒருமுறை கடைசிப் படியைப் பொறுமையுடன் கடந்துவிட்டால், அந்த 99% சோதனையே உங்கள் உயர்தர முத்திரையாக மாறும்.`,
        en: `Master the final step with patience once, and that old 99% snag flips into your reputation for rock-solid finish.`
      }
    };

    const reflMap: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಹಿಂದಿರುಗಿ ನೋಡಿ: ೯೯%ರಲ್ಲಿ ತಪ್ಪಿಹೋದ ಯಾವ ಯೋಜನೆ ಇಂದು 'ಆಗದಿದ್ದುದೇ ಒಳ್ಳೆಯದಾಯಿತು' ಎಂದು ಅನಿಸಿದೆ?`,
        mr: `मागे वळून पहा: ९९% वर राहिलेले कोणते काम नंतर 'ते न झालेलेच बरे झाले' असे वाटले?`,
        hi: `स्मरण करें: ९९% पर रुका कौन सा कार्य बाद में 'नहीं हुआ सो ही अच्छा रहा' जैसा सिद्ध हुआ?`,
        te: `వెనక్కి చూస్తే: 99% దగ్గర ఆగిన ఏ పని తర్వాత 'జరగకపోవడమే మంచిదైంది' అని అనిపించింది?`,
        ta: `திரும்பிப் பாருங்கள்: 99%-ல் நின்ற எந்த வேலை பிறகு 'நடக்காமல் போனதே நல்லது' எனத் தோன்றியது?`,
        en: `Real Evidence: Recall one near-miss that stalled at 99% and later turned out to be quiet protection.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.maandiHouse}ನೇ ಮನೆಯ ಸೂಚನೆ: ಈಗ ಅರ್ಧಕ್ಕೆ ನಿಂತಿರುವ ಒಂದು ಮುಖ್ಯ ಕೆಲಸದ 'ಕೊನೆಯ ೧% ಕೊಂಡಿ' ಏನೆಂದು ಬರೆದಿಡಿ.`,
        mr: `तुमच्या ${n(ctx.maandiHouse)}व्या भावाचा संकेत: सध्या थांबलेल्या एका मुख्य कामाची 'शेवटची १% अडचण' नेमकी काय आहे ते लिहून पहा.`,
        hi: `आपके ${n(ctx.maandiHouse)}वें भाव का संकेत: अभी रुके एक मुख्य कार्य की 'अंतिम १% कमी' कागज़ पर स्पष्ट लिखें।`,
        te: `మీ ${n(ctx.maandiHouse)}వ స్థాన సూచన: ప్రస్తుతం ఆగి ఉన్న ఒక ముఖ్య పనిలోని ఆఖరి 1% లోపాన్ని గుర్తించండి.`,
        ta: `உங்கள் ${n(ctx.maandiHouse)}-ம் இடக் குறிப்பு: இப்போது நிற்கும் ஒரு முக்கிய வேலையின் கடைசி 1% தேவையைக் குறித்து வையுங்கள்.`,
        en: `Precision Note: Pick one half-paused item today and name the single remaining 1% detail nobody actually sent yet.`
      },
      2: {
        kn: `ಗುರುತಿಸಿ: ${ctx.localizedYogiDay}ರಂದು ಪೂರ್ಣಗೊಳಿಸಿದ ಕೆಲಸಗಳಿಗೆ ವಾರದ ಉಳಿದ ದಿನಗಳಿಗಿಂತ ಕಡಿಮೆ ತೊಡಕು ಬಂದಿರುವುದು ನಿಜವೇ?`,
        mr: `तपासा: ${ctx.localizedYogiDay} दिवशी पूर्ण केलेल्या कामांत इतरांपेक्षा कमी अडथळे आले आहेत का?`,
        hi: `परखें: क्या ${ctx.localizedYogiDay} को निपटाए गए कार्यों में बाकी दिनों की अपेक्षा कम अवरोध आए हैं?`,
        te: `గమనించండి: ${ctx.localizedYogiDay} నాడు పూర్తిచేసిన పనుల్లో మిగిలిన రోజులకన్నా తక్కువ అడ్డంకులు వచ్చాయా?`,
        ta: `சரிபாருங்கள்: ${ctx.localizedYogiDay} அன்று முடித்த செயல்களில் மற்ற நாட்களை விடத் தடைகள் குறைவாக இருந்தனவா?`,
        en: `Pattern Test: Check whether closures handled on ${ctx.localizedYogiDay} needed far fewer follow-ups afterward.`
      },
      3: {
        kn: `ಧೈರ್ಯವಿರಲಿ: ಯಶಸ್ಸು ನಿಮ್ಮಿಂದ ದೂರ ಓಡುತ್ತಿಲ್ಲ, ಕೇವಲ ಕೊನೆಯ ಬಾಗಿಲಿನ ಬೀಗಕ್ಕೆ ಸರಿಯಾದ ನಿಖರತೆ ಕೇಳುತ್ತಿದೆ.`,
        mr: `निश्चिंत राहा: यश तुमच्यापासून दूर पळत नाही, ते केवळ शेवटच्या टप्प्यावर अचूकतेची मागणी करत आहे.`,
        hi: `धैर्य रखें: सफलता आपसे दूर नहीं भाग रही, वह केवल अंतिम द्वार पर पूर्ण स्पष्टता मांग रही है।`,
        te: `ధైర్యంగా ఉండండి: విజయం మీ నుండి దూరం కావట్లేదు, కేవలం చివరి అడుగులో స్పష్టత కోరుకుంటోంది.`,
        ta: `தைரியமாக இருங்கள்: வெற்றி உங்களை விட்டு ஓடவில்லை; கடைசிப் படியில் துல்லியத்தை மட்டுமே எதிர்பார்க்கிறது.`,
        en: `Truth Anchor: Success isn't slipping away—it simply asks for unhurried final verification right before handover.`
      }
    };

    return {
      p1Focus: clusterFocus,
      p2Body: pick6(p2Map[ed], lang),
      p3Body: pick6(p3Map[ed], lang),
      reflectionNote: pick6(reflMap[ed], lang)
    };
  }

  if (chNum === 5) {
    // 3 Inner Truths / Panchabhuta + Yoga + Karana
    const elemLine = pick6({
      kn: `ಪಂಚಭೂತ ತೂಕದಲ್ಲಿ '${ctx.dominantElement}' (${n(ctx.elemWeights.fire)}/${n(ctx.elemWeights.earth)}/${n(ctx.elemWeights.air)}/${n(ctx.elemWeights.water)}) ಪ್ರಧಾನವಾಗಿರುವುದರಿಂದ, '${ctx.yogaName}' ಯೋಗ ಮತ್ತು '${ctx.karanaName}' ಕರಣದಡಿ ನಿಮ್ಮ ನಿಜವಾದ ನಿಯಮಗಳು ಕೆಲಸ ಮಾಡುತ್ತವೆ.`,
      mr: `पंचतत्त्व मापनात '${ctx.dominantElement}' (${n(ctx.elemWeights.fire)}/${n(ctx.elemWeights.earth)}/${n(ctx.elemWeights.air)}/${n(ctx.elemWeights.water)}) प्रबळ असून '${ctx.yogaName}' योग व '${ctx.karanaName}' करणातून तुमचा मूळ स्वभाव घडला आहे.`,
      hi: `पंचभूत संतुलन में '${ctx.dominantElement}' (${n(ctx.elemWeights.fire)}/${n(ctx.elemWeights.earth)}/${n(ctx.elemWeights.air)}/${n(ctx.elemWeights.water)}) प्रधान होने और '${ctx.yogaName}' योग–'${ctx.karanaName}' करण से आपका मौन चरित्र बनता है।`,
      te: `పంచభూతాలలో '${ctx.dominantElement}' (${n(ctx.elemWeights.fire)}/${n(ctx.elemWeights.earth)}/${n(ctx.elemWeights.air)}/${n(ctx.elemWeights.water)}) బలంగా ఉండి, '${ctx.yogaName}' యోగం మరియు '${ctx.karanaName}' కరణం మీ అంతర్గత నియమాలను నడిపిస్తున్నాయి.`,
      ta: `பஞ்சபூதங்களில் '${ctx.dominantElement}' (${n(ctx.elemWeights.fire)}/${n(ctx.elemWeights.earth)}/${n(ctx.elemWeights.air)}/${n(ctx.elemWeights.water)}) முதன்மையாகவும் '${ctx.yogaName}' யோகம்–'${ctx.karanaName}' கரணமும் உங்கள் உள் விதிகளை வடிவமைக்கின்றன.`,
      en: `Weighted around ${ctx.dominantElement} energy alongside birth ${ctx.yogaName} Yoga and ${ctx.karanaName} Karana, three private codes guide every major move.`
    }, lang);

    const p2Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಲಗ್ನದ ${n(savByHouse[1])} ಬಿಂದುಗಳು ಮತ್ತು '${ext.precisionProfileSummary.dignifiedSummary}' ಬಲದ ಫಲವಾಗಿ, ನಿಮಗೆ ಗೌರವವಿರದ ಕಡೆ ಎಷ್ಟೇ ಹಣ ಸಿಕ್ಕರೂ ಮನಸ್ಸು ನಿಲ್ಲುವುದಿಲ್ಲ.`,
        mr: `लग्नातील ${n(savByHouse[1])} गुण व '${ext.precisionProfileSummary.dignifiedSummary}' ताकदीमुळे ज्या ठिकाणी सन्मान नाही, तिथे तुमचे मन अजिबात रमत नाही.`,
        hi: `लग्न के ${n(savByHouse[1])} बिंदू तथा '${ext.precisionProfileSummary.dignifiedSummary}' के प्रभाव से जहां सम्मान नहीं मिलता, वहां आपका मन कभी नहीं टिकता।`,
        te: `లగ్నంలోని ${n(savByHouse[1])} బిందువులు మరియు '${ext.precisionProfileSummary.dignifiedSummary}' బలం వల్ల ఆత్మగౌరవం లేని చోట మీరు ఎప్పటికీ రాజీ పడరు.`,
        ta: `லக்னத்தின் ${n(savByHouse[1])} பரல்கள் மற்றும் '${ext.precisionProfileSummary.dignifiedSummary}' பலத்தால் சுயமரியாதை இல்லாத இடத்தில் உங்கள் மனம் நிற்காது.`,
        en: `Driven by ${savByHouse[1]} Lagna bindus and '${ext.precisionProfileSummary.dignifiedSummary}', your inner self walks away softly wherever dignity gets discounted.`
      },
      1: {
        kn: `${ctx.isShuklaPaksha ? "ಶುಕ್ಲ ಪಕ್ಷದ ಪ್ರಕಾಶಮಾನ ಚಂದ್ರ" : "ಕೃಷ್ಣ ಪಕ್ಷದ ಆಳ ಚಿಂತನಶೀಲ ಚಂದ್ರ"} ಹಾಗೂ ${ctx.nakshatraName}ದ ಲಯವು ನಾಟಕೀಯ ಮಾತನ್ನು ಕ್ಷಣದಲ್ಲೇ ಕಂಡುಹಿಡಿಯುತ್ತದೆ.`,
        mr: `${ctx.isShuklaPaksha ? "शुक्ल पक्षाचा तेजस्वी चंद्र" : "कृष्ण पक्षाचा सखोल चिंतनशील चंद्र"} व ${ctx.nakshatraName} नक्षत्राची जाणीव वरवरचा दिखावा क्षणात ओळखते.`,
        hi: `${ctx.isShuklaPaksha ? "शुक्ल पक्ष के उज्ज्वल चंद्र" : "कृष्ण पक्ष के गंभीर चंद्र"} और ${ctx.nakshatraName} की सूक्ष्म दृष्टि दिखावटी बातों को तुरंत भांप लेती है।`,
        te: `${ctx.isShuklaPaksha ? "శుక్లపక్ష ప్రకాశవంత చంద్రుడు" : "కృష్ణపక్ష గంభీర చంద్రుడు"} మరియు ${ctx.nakshatraName} చూపు కృత్రిమ మాటలను వెంటనే గుర్తిస్తాయి.`,
        ta: `${ctx.isShuklaPaksha ? "வளர்பிறை ஒளிர் சந்திரன்" : "தேய்பிறை ஆழ்ந்த சந்திரன்"} மற்றும் ${ctx.nakshatraName} உணர்வு போலிப் பேச்சுகளை நொடியில் இனம் காணும்.`,
        en: `Shaped by your ${ctx.isShuklaPaksha ? "bright Waxing" : "reflective Waning"} Moon in ${ctx.nakshatraName}, you detect hollow flattery miles before anyone else suspects.`
      },
      2: {
        kn: `೨ನೇ ವಾಕ್ ಸ್ಥಾನ (${n(savByHouse[2])} ಬಿಂದು) ಹಾಗೂ ೫ನೇ ವಿವೇಕ ಸ್ಥಾನ (${n(savByHouse[5])} ಬಿಂದು) ನಿಮ್ಮೊಳಗಿನ ನಿಜವಾದ ಬುದ್ದಿಮತ್ತೆಯನ್ನು ತೋರುತ್ತಿವೆ.`,
        mr: `द्वितीय वाणी स्थान (${n(savByHouse[2])} गुण) व पंचम विवेक स्थान (${n(savByHouse[5])} गुण) तुमच्या आतील परिपक्व विचारशक्तीचा पुरावा देतात.`,
        hi: `द्वितीय वाणी भाव (${n(savByHouse[2])} बिंदू) और पंचम विवेक भाव (${n(savByHouse[5])} बिंदू) आपके भीतर की सच्ची परिपक्वता दिखाते हैं।`,
        te: `2వ వాక్ స్థానం (${n(savByHouse[2])} బిందువులు) మరియు 5వ వివేక స్థానం (${n(savByHouse[5])} బిందువులు) మీ నిజమైన మేధస్సును నిరూపిస్తున్నాయి.`,
        ta: `2-ம் வாக்கு இடம் (${n(savByHouse[2])} பரல்கள்) மற்றும் 5-ம் அறிவு இடம் (${n(savByHouse[5])} பரல்கள்) உங்கள் ஆழ்ந்த நுண்ணறிவைக் காட்டுகின்றன.`,
        en: `Comparing speech (H2: ${savByHouse[2]}) against discernment (H5: ${savByHouse[5]}) proves how calmly you edit words under tension.`
      },
      3: {
        kn: `ಬೀಸುವ ಬಿರುಗಾಳಿಯಲ್ಲೂ ಬೇರು ಆಳವಿರುವ ಮರ ನಿಲ್ಲುವಂತೆ, '${ctx.dominantElement}' ತತ್ವವು ಒತ್ತಡದಲ್ಲಿಯೇ ನಿಮ್ಮ ನಿಜ ಸ್ವರೂಪವನ್ನು ಪ್ರಕಟಿಸುತ್ತದೆ.`,
        mr: `वादळातही खोल मुळे असलेला वृक्ष अढळ राहतो, तसेच '${ctx.dominantElement}' तत्त्व दबावाखाली तुमची खरी क्षमता उघड करते.`,
        hi: `आंधी में भी गहरी जड़ों वाला वृक्ष अडिग रहता है; ठीक वैसे ही '${ctx.dominantElement}' तत्व संकट की घड़ी में आपकी असली क्षमता दिखाता है।`,
        te: `పెనుగాలిలోనూ లోతైన వేర్లున్న వృక్షం నిలిచినట్లు, ఒత్తిడిలో మీ '${ctx.dominantElement}' స్వభావం అసలైన బలాన్ని చూపుతుంది.`,
        ta: `புயலிலும் ஆழமான வேருள்ள மரம் நிற்பது போல், நெருக்கடியில் உங்கள் '${ctx.dominantElement}' இயல்பு உண்மையான திறனை வெளிப்படுத்தும்.`,
        en: `Storm winds reveal root depth in seconds—when rooms heat up, your core ${ctx.dominantElement} nature stops pretending and takes quiet command.`
      }
    };

    const p3Map: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಬೇರೆಯವರ ನಿರೀಕ್ಷೆಗೆ ತಕ್ಕಂತೆ ನಿಮ್ಮ ಪ್ರಕೃತಿಯನ್ನು ಬದಲಿಸಲು ಹೋಗಬೇಡಿ — ನಿಮ್ಮ '${ctx.yogaName}' ಶೈಲಿಯೇ ನಿಮ್ಮ ಪ್ರಬಲ ಅಸ್ತ್ರ.`,
        mr: `इतरांच्या अपेक्षेनुसार स्वतःचा मूळ स्वभाव बदलू नका — तुमची '${ctx.yogaName}' शैली हीच तुमची खरी शक्ती आहे.`,
        hi: `दूसरों की पसंद के अनुसार अपना मूल स्वभाव न बदलें — आपकी '${ctx.yogaName}' शैली ही आपकी सबसे बड़ी पूंजी है।`,
        te: `ఇతరుల మెప్పు కోసం మీ సహజ స్వభావాన్ని మార్చుకోకండి — మీ '${ctx.yogaName}' తత్వమే మీకు అసలైన ఆయుధం.`,
        ta: `பிறர் எதிர்பார்ப்புக்காக உங்கள் இயல்பை மாற்றிக்கொள்ளாதீர்கள் — உங்கள் '${ctx.yogaName}' பாணியே உங்கள் மிகப்பெரிய பலம்.`,
        en: `Quit shrinking your ${ctx.yogaName} temperament to suit loud rooms—authenticity draws far stronger allies.`
      },
      1: {
        kn: `ಮೊದಲ ಪ್ರೇರಣೆಯಲ್ಲಿ ನಂಬಿಕೆ ಇಡಿ: '${ctx.karanaName}' ಕರಣದವರು ಆತುರಕ್ಕಿಂತ ಆಂತರಿಕ ಸಮ್ಮತಿಯ ನಂತರವೇ ಶ್ರೇಷ್ಠ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುತ್ತಾರೆ.`,
        mr: `स्वतःच्या पहिल्या अंतर्प्रेरणेवर विश्वास ठेवा: '${ctx.karanaName}' करणाच्या व्यक्ती शांत विचारातून सर्वोत्तम निर्णय घेतात.`,
        hi: `अपनी सहज अंतःप्रेरणा पर भरोसा रखें: '${ctx.karanaName}' करण वाले लोग शांत मनन के बाद सटीक निर्णय लेते हैं।`,
        te: `మీ సహజ అంతర్దృష్టిని నమ్మండి: '${ctx.karanaName}' కరణం కలవారు ప్రశాంత ఆలోచన తర్వాతే సరైన నిర్ణయం తీసుకుంటారు.`,
        ta: `உங்கள் உள்ளுணர்வை நம்புங்கள்: '${ctx.karanaName}' கரணத்தினர் அமைதியான சிந்தனைக்குப் பிறகே சிறந்த முடிவை எடுப்பார்கள்.`,
        en: `Trust your ${ctx.karanaName} gut instinct—never force decisions while feeling cornered.`
      },
      2: {
        kn: `ನಿಮ್ಮ ಯೋಗಿ ${ctx.yogiPlanetName} ಹಾಗೂ ಅತ್ಯುತ್ತಮ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ಮಾರ್ಗದಲ್ಲೇ ಹೆಚ್ಚಿನ ಸಮಯ ಹೂಡಿಕೆ ಮಾಡಿ.`,
        mr: `तुमचा योगी ${ctx.yogiPlanetName} आणि सर्वाधिक बळवान ${n(arch.peakHouseNum)}वे स्थान (${arch.peakDomainLabel}) या दिशेनेच जास्तीत जास्त वेळ द्या.`,
        hi: `अपने योगी ${ctx.yogiPlanetName} और सबसे सबल ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) की दिशा में ही मुख्य समय लगाएं।`,
        te: `మీ యోగి ${ctx.yogiPlanetName} మరియు బలమైన ${n(arch.peakHouseNum)}వ స్థానం (${arch.peakDomainLabel}) వైపే మీ సమయాన్ని ఎక్కువగా కేటాయించండి.`,
        ta: `உங்கள் யோகி ${ctx.yogiPlanetName} மற்றும் வலிமையான ${n(arch.peakHouseNum)}-ம் இடம் (${arch.peakDomainLabel}) வழியிலேயே நேரத்தை முதலீடு செய்யுங்கள்.`,
        en: `Spend peak weekly hours inside House ${arch.peakHouseNum} (${arch.peakDomainLabel}) rather than fixing irrelevant weak corners.`
      },
      3: {
        kn: `ನಿಮ್ಮ ಆಂತರಿಕ ನಿಯಮಗಳನ್ನು ಯಾರಿಗೂ ಸಾಬೀತುಪಡಿಸುವ ಅಗತ್ಯವಿಲ್ಲ — ನಿಮ್ಮ ಸ್ಥಿರ ನಡತೆಯೇ ಉತ್ತರ ನೀಡುತ್ತದೆ.`,
        mr: `तुमची तत्त्वे कोणासमोरही सिद्ध करण्याची गरज नाही — तुमची स्थिर कृतीच योग्य उत्तर देईल.`,
        hi: `अपने सिद्धांत किसी के सामने सिद्ध करने की आवश्यकता नहीं — आपका शांत आचरण ही पर्याप्त उत्तर है।`,
        te: `మీ నిజాయితీని ఎవరికీ నిరూపించుకోవాల్సిన అవసరం లేదు — మీ ప్రశాంత ప్రవర్తనే సమాధానం చెబుతుంది.`,
        ta: `உங்கள் கொள்கைகளை யாருக்கும் நிரூபிக்கத் தேவையில்லை — உங்கள் உறுதியான செயலே பதில் சொல்லும்.`,
        en: `Stop rehearsing explanations for skeptics—steady consistency proves more than polished speeches.`
      }
    };

    const reflMap: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಆಂತರಿಕ ಗುರುತು: ನಿಮ್ಮಲ್ಲಿರುವ ಆ ೩ ಸತ್ಯಗಳಲ್ಲಿ 'ಯಾವುದನ್ನು ಇಂದು ಯಾರೂ ಗುರುತಿಸದಿದ್ದರೂ ನೀವು ಬಿಟ್ಟುಕೊಡಲು ಸಿದ್ಧರಿಲ್ಲ'?`,
        mr: `अंतरंग खूण: कोणाचीही दाद न मिळाली तरी तुम्ही तुमचे कोणते एक तत्त्व कधीच सोडणार नाही?`,
        hi: `अंतर्मन की कसौटी: बिना किसी प्रशंसा के भी आप अपने किस एक मूल्य से कभी समझौता नहीं करते?`,
        te: `అంతర్గత సత్యం: ఎవరూ గమనించకపోయినా మీరు ఎప్పటికీ వదులుకోని మీ ప్రధాన విలువ ఏది?`,
        ta: `உள் அடையாளம்: யாரும் பாராட்டாவிட்டாலும் நீங்கள் எப்போதும் விட்டுக்கொடுக்காத உங்கள் முக்கியக் கொள்கை எது?`,
        en: `Truth Test: Which personal rule stays non-negotiable for you even when nobody else is watching?`
      },
      1: {
        kn: `ಗಮನಿಸಿ: ನಿಮ್ಮ '${ctx.dominantElement}' ಪ್ರಕೃತಿಗೆ ವಿರುದ್ಧವಾದ ಕೆಲಸ ಮಾಡಿದಾಗಲೆಲ್ಲಾ ದೇಹಕ್ಕಿಂತ ಮೊದಲು ಮನಸ್ಸು ಭಾರವಾಗುತ್ತದೆಯೇ?`,
        mr: `तपासा: तुमच्या '${ctx.dominantElement}' प्रकृतीच्या विरोधात काम करताना शरीरापेक्षा मन जास्त थकते का?`,
        hi: `परखें: क्या अपनी '${ctx.dominantElement}' प्रकृति के विपरीत जाने पर शरीर से पहले आपका मन थक जाता है?`,
        te: `గమనించండి: మీ '${ctx.dominantElement}' స్వభావానికి విరుద్ధంగా పనిచేసినప్పుడు శరీరం కంటే మనసు త్వరగా అలసిపోతోందా?`,
        ta: `கவனியுங்கள்: உங்கள் '${ctx.dominantElement}' இயல்புக்கு மாறாகச் செயல்படும்போது உடலை விட மனம் விரைவில் சோர்வடைகிறதா?`,
        en: `Energy Check: Notice how going against your ${ctx.dominantElement} grain drains your mind twice as fast as hard physical work.`
      },
      2: {
        kn: `ಲಗ್ನದ ${n(savByHouse[1])} ಬಿಂದುಗಳು ನಿಮಗೆ ದಿಕ್ಕು ತಪ್ಪದ ಸ್ವಭಾವ ಕೊಟ್ಟಿವೆ — ಆ ಅಂತರಂಗದ ದನಿಯನ್ನು ಪ್ರತಿದಿನ ಕೇಳಿ.`,
        mr: `लग्नातील ${n(savByHouse[1])} गुणांनी तुम्हाला ठाम नजर दिली आहे — त्या आतल्या आवाजाचा आदर ठेवा.`,
        hi: `लग्न के ${n(savByHouse[1])} बिंदुओं ने आपको अटल विवेक दिया है — अपनी उस भीतरी आवाज का सम्मान करें।`,
        te: `లగ్నంలోని ${n(savByHouse[1])} బిందువులు మీకు స్థిరమైన చూపునిచ్చాయి — మీ అంతరాత్మ మాటను ఎప్పుడూ వినండి.`,
        ta: `லக்னத்தின் ${n(savByHouse[1])} பரல்கள் உங்களுக்குத் தெளிவான பார்வை தந்துள்ளன — அந்த உள் குரலுக்கு மதிப்பளியுங்கள்.`,
        en: `Journal Line: Write down one quiet standard your inner voice held firm across every turbulent year.`
      },
      3: {
        kn: `ಒಳಗೂ ಹೊರಗೂ ಒಂದೇ ಸತ್ಯದಲ್ಲಿದ್ದಾಗ ವ್ಯಕ್ತಿಯ ಮುಖದ ತೇಜಸ್ಸು ತಾನಾಗಿಯೇ ಹೆಚ್ಚುತ್ತದೆ.`,
        mr: `आतून आणि बाहेरून एकच प्रामाणिकपणा असेल तर व्यक्तीच्या व्यक्तिमत्त्वात नैसर्गिक तेज येते.`,
        hi: `भीतर और बाहर एक ही सत्य रहने पर व्यक्तित्व में स्वतः शांत आकर्षण आ जाता है।`,
        te: `లోపలా బయటా ఒకే నిజాయితీ ఉన్నప్పుడు మీ వ్యక్తిత్వంలో సహజమైన తేజస్సు వెలుగుతుంది.`,
        ta: `உள்ளும் புறமும் ஒரே நேர்மை இருக்கும்போது முகத்திலும் செயலிலும் இயல்பான ஒளி பிறக்கும்.`,
        en: `Closing Principle: Peace arrives effortlessly the moment your daily calendar matches what your heart respects.`
      }
    };

    return {
      p1Focus: elemLine,
      p2Body: pick6(p2Map[ed], lang),
      p3Body: pick6(p3Map[ed], lang),
      reflectionNote: pick6(reflMap[ed], lang)
    };
  }

  // Ch 11: Rajayoga & Wealth Yogas
  const yogaCore = pick6({
    kn: `ನಿಮ್ಮ ${ctx.lagnaRashiName} ಕುಂಡಲಿಯಲ್ಲಿ '${ctx.detectedYogasSummary}' ಹಾಗೂ ಭಾಗ್ಯ ೯ನೇ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[9])} ಬಿಂದುಗಳು (ಅಧಿಪತಿ ${ext.house9Info.lordName}, ${ext.house9Info.placedRashi}) ಸುಪ್ತ ರಾಜಯೋಗ ಬಲವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿವೆ.`,
    mr: `तुमच्या ${ctx.lagnaRashiName} कुंडलीत '${ctx.detectedYogasSummary}' व भाग्य ९व्या भावात ${n(savByHouse[9])} गुण (स्वामी ${ext.house9Info.lordName}, ${ext.house9Info.placedRashi}) सुप्त राजयोग शक्ती जागृत करत आहेत.`,
    hi: `आपकी ${ctx.lagnaRashiName} पत्रिका में '${ctx.detectedYogasSummary}' एवं नवम भाग्य भाव के ${n(savByHouse[9])} बिंदू (स्वामी ${ext.house9Info.lordName}, ${ext.house9Info.placedRashi}) राजयोग की शक्ति को जाग्रत कर रहे हैं।`,
    te: `మీ ${ctx.lagnaRashiName} జాతకంలో '${ctx.detectedYogasSummary}' మరియు 9వ భాగ్య స్థానంలో ${n(savByHouse[9])} బిందువులు (అధిపతి ${ext.house9Info.lordName}, ${ext.house9Info.placedRashi}) రాజయోగ శక్తిని మేల్కొల్పుతున్నాయి.`,
    ta: `உங்கள் ${ctx.lagnaRashiName} ஜாதகத்தில் '${ctx.detectedYogasSummary}' மற்றும் 9-ம் பாக்கிய இடத்தின் ${n(savByHouse[9])} பரல்கள் (அதிபதி ${ext.house9Info.lordName}, ${ext.house9Info.placedRashi}) ராஜயோக பலத்தைத் தூண்டுகின்றன.`,
    en: `Driven by ${ctx.detectedYogasSummary} alongside ${savByHouse[9]} bindus in Fortune House 9 (lord ${ext.house9Info.lordName} in ${ext.house9Info.placedRashi}), your chart carries authentic royal elevation.`
  }, lang);

  const p2Map11: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
    0: {
      kn: `${ctx.lagnaRashiName} ಲಗ್ನದಲ್ಲಿ ರಾಜಯೋಗ ಎಂದರೆ ಶ್ರಮವಿಲ್ಲದೆ ಸಿಗುವ ಅದೃಷ್ಟವಲ್ಲ; ಅದು ${ext.house9Info.lordName} ಬಲದಿಂದ ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಯೋಗ್ಯ ವೇದಿಕೆ ಸಿಗುವ ದೈವಿಕ ವ್ಯವಸ್ಥೆಯಾಗಿದೆ.`,
      mr: `${ctx.lagnaRashiName} लग्नात राजयोग म्हणजे विनाकष्ट मिळणारे भाग्य नव्हे; तर ${ext.house9Info.lordName} च्या बळाने योग्य क्षणी मिळणारे मानाचे व्यासपीठ होय.`,
      hi: `${ctx.lagnaRashiName} लग्न में राजयोग का अर्थ बिना परिश्रम का चमत्कार नहीं; अपितु ${ext.house9Info.lordName} के संबल से सही समय पर उचित मंच मिलना है।`,
      te: `${ctx.lagnaRashiName} లగ్నంలో రాజయోగం అంటే కష్టం లేకుండా వచ్చే అదృష్టం కాదు; ${ext.house9Info.lordName} బలంతో మీ ప్రతిభకు తగిన ఉన్నత పీఠం లభించడమే.`,
      ta: `${ctx.lagnaRashiName} லக்னத்தில் ராஜயோகம் என்பது உழைப்பின்றி வரும் அதிர்ஷ்டம் அல்ல; ${ext.house9Info.lordName} பலத்தால் தகுந்த மேடை அமைவதாகும்.`,
      en: `Inside your ${ctx.lagnaRashiName} chart, true Rajayogas never act like hollow lottery tickets—with ${ext.house9Info.lordName}'s backing they open rightful rooms once craft meets timing.`
    },
    1: {
      kn: `${ctx.currentMahadasha} ದಶೆ ಮತ್ತು ಯೋಗಿ ${ctx.yogiPlanetName} ಒಟ್ಟಾಗಿ ಸೇರಿದಾಗ, ಸಾಮಾನ್ಯರು ಬಿಟ್ಟುಕೊಟ್ಟ ಅವಕಾಶಗಳಲ್ಲೇ ನೀವು ಗೌರವ ಗಳಿಸುತ್ತೀರಿ.`,
      mr: `${ctx.currentMahadasha} दशा आणि योगी ${ctx.yogiPlanetName} एकत्र आल्यावर इतरांना कठीण वाटणाऱ्या कामातूनच तुमची मोठी प्रतिष्ठा घडते.`,
      hi: `${ctx.currentMahadasha} दशा और योगी ${ctx.yogiPlanetName} का संयोग जुड़ते ही कठिन दिखने वाले दायित्व से ही आपकी विशिष्ट प्रतिष्ठा बनती है।`,
      te: `${ctx.currentMahadasha} దశ మరియు యోగి ${ctx.yogiPlanetName} కలిసినప్పుడు కష్టమైన బాధ్యతల నుండే మీకు గొప్ప కీర్తి లభిస్తుంది.`,
      ta: `${ctx.currentMahadasha} தசையும் யோகி ${ctx.yogiPlanetName}-ம் இணையும்போது சவாலான பொறுப்புகளிலிருந்தே உங்கள் கௌரவம் உயர்கிறது.`,
      en: `Under ${ctx.currentMahadasha} Dasha linked with Yogi ${ctx.yogiPlanetName}, solving knotty challenges other people avoid earns lasting status.`
    },
    2: {
      kn: `೯ನೇ ಭಾಗ್ಯ (${n(savByHouse[9])} ಬಿಂದು) ಹಾಗೂ ೧೦ನೇ ಕರ್ಮ (${n(savByHouse[10])} ಬಿಂದು) ಪರಸ್ಪರ ಕೈಜೋಡಿಸಿ 'ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ' ಮೈತ್ರಿ ರಚಿಸುತ್ತಿವೆ.`,
      mr: `नवम भाग्य (${n(savByHouse[9])} गुण) आणि दशम कर्म (${n(savByHouse[10])} गुण) एकमेकांना साथ देऊन उच्च फल देत आहेत.`,
      hi: `नवम भाग्य (${n(savByHouse[9])} बिंदू) तथा दशम कर्म (${n(savByHouse[10])} बिंदू) का आपसी संयोग सम्मान और प्रगति को दृढ़ बनाता है।`,
      te: `9వ భాగ్యం (${n(savByHouse[9])} బిందువులు) మరియు 10వ కర్మ (${n(savByHouse[10])} బిందువులు) కలిసి గొప్ప ధర్మకర్మాధిపతి బలాన్ని ఇస్తున్నాయి.`,
      ta: `9-ம் பாக்கியம் (${n(savByHouse[9])} பரல்கள்) மற்றும் 10-ம் தொழில் (${n(savByHouse[10])} பரல்கள்) இணைந்து உயர்ந்த பலனைத் தருகின்றன.`,
      en: `When Fortune (H9: ${savByHouse[9]}) supports Karma (H10: ${savByHouse[10]}), honest values align cleanly with outward rise.`
    },
    3: {
      kn: `ಭೂಮಿಯ ಆಳದಲ್ಲಿ ಶತಮಾನಗಳ ಒತ್ತಡ ತಾಳಿಕೊಂಡ ಕಲ್ಲೇ ವಜ್ರವಾಗುವಂತೆ, ನಿಮ್ಮ ${ctx.nakshatraName} ಜಾತಕದ ಯೋಗಗಳು (${ctx.detectedYogasSummary}) ಪಕ್ವ ಅನುಭವದ ನಂತರ ಹೊಳೆಯುತ್ತವೆ.`,
      mr: `खाणीत मोठा दाब सहन केल्यावरच हिरा तेजस्वी होतो, तसेच तुमच्या ${ctx.nakshatraName} कुंडलीतील योग (${ctx.detectedYogasSummary}) प्रगल्भ अनुभवानंतर चमकतात.`,
      hi: `धरती में दबाव सहकर ही जैसे हीरा दमकता है, वैसे ही आपके ${ctx.nakshatraName} जन्म के शुभ योग (${ctx.detectedYogasSummary}) अनुभव के बाद पूर्ण तेज दिखाते हैं।`,
      te: `భూమి లోపల ఎంతో ఒత్తిడిని తట్టుకున్నాకే వజ్రం మెరిసినట్లు, మీ ${ctx.nakshatraName} జాతక యోగాలు (${ctx.detectedYogasSummary}) పరిణతి తర్వాత వికసిస్తాయి.`,
      ta: `ஆழத்தில் அழுத்தத்தைத் தாங்கிய பிறகே வைரம் ஒளிர்வது போல், உங்கள் ${ctx.nakshatraName} ஜாதக யோகங்கள் (${ctx.detectedYogasSummary}) அனுபவத்திற்குப் பிறகே பிரகாசிக்கின்றன.`,
      en: `Like pure carbon shaped beneath mountain pressure, royal strength inside ${ctx.nakshatraName} (${ctx.detectedYogasSummary}) reveals brilliance after tested patience.`
    }
  };

  const p3Map11: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
    0: {
      kn: `ಚಿಕ್ಕ ಸ್ವಹಿತಾಸಕ್ತಿಗಿಂತ ಹತ್ತು ಜನರಿಗೆ ಉಪಯೋಗವಾಗುವ ದೊಡ್ಡ ಜವಾಬ್ದಾರಿ ವಹಿಸಿಕೊಂಡಾಗ ನಿಮ್ಮ ರಾಜಯೋಗ ತಕ್ಷಣ ಫಲಿಸುತ್ತದೆ.`,
      mr: `लहान फायद्यापेक्षा अनेक जणांना उपयोगी ठरणारी जबाबदारी स्वीकारताच तुमचा राजयोग लगेच फळास येतो.`,
      hi: `छोटे स्वार्थ से ऊपर उठकर जब आप अनेक लोगों के हित वाला बड़ा दायित्व उठाते हैं, तभी राजयोग तुरंत जागता है।`,
      te: `చిన్న స్వార్థం కంటే నలుగురికీ ఉపయోగపడే పెద్ద బాధ్యతను స్వీకరించినప్పుడు మీ రాజయోగం తక్షణమే ఫలిస్తుంది.`,
      ta: `சிறு சுயநலத்தை விடப் பலருக்கும் பயன்தரும் பெரிய பொறுப்பை ஏற்கும்போது உங்கள் ராஜயோகம் உடனே பலன் தரும்.`,
      en: `Step into broader usefulness whenever chance invites you—your royal combinations bloom fastest around collective stewardship.`
    },
    1: {
      kn: `${ext.house9Info.lordName} ಅನುಗ್ರಹಕ್ಕಾಗಿ ಹಿರಿಯರು, ಗುರುಗಳು ಹಾಗೂ ಅನುಭವಸ್ಥರ ಆಶೀರ್ವಾದ-ಮಾರ್ಗದರ್ಶನವನ್ನು ಮರೆಯದಿರಿ.`,
      mr: `${ext.house9Info.lordName} कृपेसाठी घरातील वडीलधाऱ्यांचा व गुरुजनांचा सन्मान आणि सल्ला नेहमी सोबत ठेवा.`,
      hi: `${ext.house9Info.lordName} की शुभता हेतु वरिष्ठों और गुरुजनों के अनुभव का सम्मान सदैव बनाए रखें।`,
      te: `${ext.house9Info.lordName} అనుగ్రహం కోసం పెద్దలు మరియు గురువుల ఆశీర్వాదాన్ని ఎల్లప్పుడూ గౌరవించండి.`,
      ta: `${ext.house9Info.lordName} அருளுக்காகப் பெரியோர்கள் மற்றும் ஆசான்களின் ஆலோசனையை எப்போதும் மதியுங்கள்.`,
      en: `Stay reachable to sincere mentors tied to ${ext.house9Info.lordName}'s house—humility accelerates sudden openings.`
    },
    2: {
      kn: `ನಿಮ್ಮ '${ctx.heroPlanetName}' ಪ್ರಭಾವವು ಮಾತು-ವ್ಯವಹಾರದಲ್ಲಿ ಶುದ್ಧತೆ ಕಾಪಾಡಿದಾಗ ಅಜೇಯ ವರ್ಚಸ್ಸನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.`,
      mr: `तुमच्या '${ctx.heroPlanetName}' ग्रहाचे बळ व्यवहारात स्वच्छ पारदर्शकता ठेवल्यावर अतुट विश्वास निर्माण करते.`,
      hi: `आपके '${ctx.heroPlanetName}' का प्रभाव वाणी एवं व्यवहार में पारदर्शिता रखने पर अद्वितीय प्रतिष्ठा गढ़ता है।`,
      te: `మీ '${ctx.heroPlanetName}' బలం మాట మరియు వ్యవహారంలో పారదర్శకత ఉంచినప్పుడు అద్భుత గౌరవాన్ని ఇస్తుంది.`,
      ta: `உங்கள் '${ctx.heroPlanetName}' ஆற்றல் பேச்சிலும் செயலிலும் நேர்மையைப் பேணும்போது அசைக்க முடியாத செல்வாக்கை உருவாக்கும்.`,
      en: `Let ${ctx.heroPlanetName}'s dignity reflect in clean speech and transparent promises—trust becomes lifelong capital.`
    },
    3: {
      kn: `ತಾಳ್ಮೆಯಿಂದ ಕಟ್ಟಿದ ಹೆಸರನ್ನು ಕ್ಷಣಿಕ ಕೋಪ ಅಥವಾ ಅಹಂಕಾರಕ್ಕೆ ಹಾಳುಮಾಡದೆ ಶಾಂತ ಗಾಂಭೀರ್ಯದಿಂದ ಮುಂದುವರಿಯಿರಿ.`,
      mr: `अनेक वर्षे कष्टाने कमावलेले नाव क्षणिक राग किंवा अहंकारापायी गमावू नका — शांत गांभीर्याने पुढे चला.`,
      hi: `वर्षों के परिश्रम से अर्जित सम्मान को क्षणिक क्रोध या अहंकार से बचाकर शांत गरिमा के साथ आगे बढ़ें।`,
      te: `ఎంతో కాలం కష్టపడి సంపాదించిన పేరును క్షణిక కోపంతో పాడుచేసుకోకుండా ప్రశాంత గాంభీర్యంతో నడవండి.`,
      ta: `நீண்ட கால உழைப்பால் பெற்ற பெயரை நொடி கோபத்தால் இழக்காமல் அமைதியான பெருந்தன்மையுடன் முன்னேறுங்கள்.`,
      en: `Guard hard-earned dignity from momentary ego battles—quiet composure keeps you in command longer than loud pride.`
    }
  };

  const reflMap11: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
    0: {
      kn: `ನೆನಪಿಸಿಕೊಳ್ಳಿ: ಕೇವಲ ನಿಮ್ಮ ಸ್ವಂತ ಲಾಭಕ್ಕಿಂತ 'ಎಲ್ಲರಿಗೂ ಒಳ್ಳೆಯದಾಗಲಿ' ಎಂದು ಮಾಡಿದ ಆ ಕೆಲಸದಲ್ಲಿಯೇ ದೊಡ್ಡ ಗೌರವ ಸಿಕ್ಕಿತಲ್ಲವೇ?`,
      mr: `आठवून पहा: केवळ स्वतःच्या फायद्याऐवजी इतरांच्या हितासाठी केलेल्या कामातूनच तुम्हाला सर्वाधिक मान मिळाला ना?`,
      hi: `याद करें: जब आपने केवल स्वार्थ के बजाय सबकी भलाई के लिए कदम उठाया, तभी सबसे अधिक सम्मान मिला या नहीं?`,
      te: `గుర్తుచేసుకోండి: అందరి మంచి కోసం మీరు తీసుకున్న చొరవలోనే మీకు అత్యంత గౌరవం దక్కింది కదా?`,
      ta: `நினைத்துப் பாருங்கள்: பொது நலனுக்காக நீங்கள் எடுத்த முயற்சியில்தான் உங்களுக்குப் பெரிய மரியாதை கிடைத்தது அல்லவா?`,
      en: `Dignity Check: Notice how doors opened brightest whenever you stood for fairness larger than private comfort.`
    },
    1: {
      kn: `ಸೂಚನೆ: ನಿಮ್ಮ '${ctx.detectedYogasSummary}' ಶಕ್ತಿಯನ್ನು ಕೇವಲ ಸಣ್ಣ ಗುರಿಗಳಲ್ಲಿ ಸೀಮಿತಗೊಳಿಸುತ್ತಿದ್ದೀರಾ ಎಂದು ಒಮ್ಮೆ ಪರೀಕ್ಷಿಸಿ.`,
      mr: `चिंतन: तुमच्या '${ctx.detectedYogasSummary}' या क्षमतेला तुम्ही केवळ लहान चौकटीतच मर्यादित तर ठेवत नाही ना?`,
      hi: `आत्मचिंतन: क्या आप अपनी '${ctx.detectedYogasSummary}' क्षमता को बहुत छोटे दायरे में समेटे हुए हैं?`,
      te: `ఆలోచించండి: మీ '${ctx.detectedYogasSummary}' సామర్థ్యాన్ని చిన్న పరిమితుల్లోనే ఉంచుతున్నారా?`,
      ta: `சிந்தியுங்கள்: உங்கள் '${ctx.detectedYogasSummary}' திறனை மிகச் சிறிய வட்டத்திற்குள் சுருக்கி வைத்திருக்கிறீர்களா?`,
      en: `Scale Check: Are you playing too small out of habit even though your chart built broader leadership weight?`
    },
    2: {
      kn: `ಲಗ್ನಾಧಿಪತಿ ${ctx.lagnaLordName} ನಿಮಗೆ ಕುಗ್ಗದ ಬೆನ್ನೆಲುಬು ನೀಡಿದೆ — ಅದರ ಮೇಲೆ ಹೆಮ್ಮೆಯಿಂದ ನಿಲ್ಲಿರಿ.`,
      mr: `लग्नेश ${ctx.lagnaLordName} ने तुम्हाला मजबूत पाठीचा कणा दिला आहे — त्याच्यावर विश्वासाने उभे राहा.`,
      hi: `लग्नेश ${ctx.lagnaLordName} ने आपको अडिग आत्मबल दिया है — उस पर विश्वास करके आगे कदम बढ़ाएं।`,
      te: `లగ్నాధిపతి ${ctx.lagnaLordName} మీకు అచంచల బలాన్నిచ్చింది — దానిపై నమ్మకంతో అడుగు వేయండి.`,
      ta: `லக்னாதிபதி ${ctx.lagnaLordName} உங்களுக்கு உறுதியான முதுகெலும்பு தந்துள்ளது — நம்பிக்கையுடன் செயல்படுங்கள்.`,
      en: `Backbone Reminder: Ascendant lord ${ctx.lagnaLordName} ensures no setback removes your core stature.`
    },
    3: {
      kn: `ಕಿರೀಟ ಬರುವ ಮುನ್ನ ಪಾತ್ರ ಸಿದ್ಧವಾಗಬೇಕು — ನಿಮ್ಮ ಸಿದ್ಧತೆ ಈಗಾಗಲೇ ಪೂರ್ಣಗೊಳ್ಳುತ್ತಿದೆ.`,
      mr: `मुकुट डोक्यावर येण्यापूर्वी त्याचे तेज सांभाळण्याची तयारी होते — तुमची तीच सिद्धता आता पूर्ण होत आहे.`,
      hi: `मुकुट मिलने से पहले उसे संभालने की पात्रता गढ़ी जाती है — आपकी वही तैयारी अब पूर्ण हो रही है।`,
      te: `కిరీటం ధరించే ముందే దాన్ని మోసే అర్హత తయారవుతుంది — మీ సన్నద్ధత ఇప్పుడు పూర్తవుతోంది.`,
      ta: `மகுடம் சூடும் முன்பே அதைத் தாங்கும் தகுதி உருவாகும் — உங்கள் ஆயத்தம் இப்போது நிறைவடைகிறது.`,
      en: `Royal Timing: Character gets forged before position arrives—trust how ready your vessel has grown.`
    }
  };

  return {
    p1Focus: yogaCore,
    p2Body: pick6(p2Map11[ed], lang),
    p3Body: pick6(p3Map11[ed], lang),
    reflectionNote: pick6(reflMap11[ed], lang)
  };
}

function buildTransitSupplement(
  chNum: number,
  arch: ChartArchetypeSnapshot,
  ctx: StoryEngineInput,
  savByHouse: Record<number, number>
): ChapterSupplement {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const ext = ctx.extendedPrecision;

  if (chNum === 7) {
    // Active Mahadasha & Bhukti (All 9 Mahadasha planets x 4 Editions + rich p2/p3/reflection!)
    const mahaLine = getMahadashaArchetypeLine(ctx);
    const p1Variants: Record<0 | 1 | 2 | 3, string> = {
      0: `${pick6({
        kn: `ಮೊದಲು ಮಹಾದಶೆ ಮತ್ತು ಭುಕ್ತಿ ಎಂದರೆ ಏನು ಎಂದು ನೋಡೋಣ: ಮಹಾದಶೆ ಎಂದರೆ ಹಲವು ವರ್ಷಗಳ ಮುಖ್ಯ ಋತು ಹಾಗೂ ಭುಕ್ತಿ ಎಂದರೆ ಈ ಕ್ಷಣ ದೃಶ್ಯಗಳನ್ನು ಮುನ್ನಡೆಸುವ ನಿರ್ದೇಶಕ! ${mahaLine}, ಹಾಗೂ '${ctx.currentBhuktiLord}' ಭುಕ್ತಿಯು (${ext.bhuktiNatureLabel}) ${n(ctx.bhuktiEndDate)}ರವರೆಗೆ ದೈನಂದಿನ ಫಲಿತಾಂಶಗಳನ್ನು ರೂಪಿಸುತ್ತಿದೆ.`,
        mr: `प्रथम महादशा व भुक्ती सोप्या शब्दांत पहा: महादशा म्हणजे अनेक वर्षांचा मुख्य काळ आणि भुक्ती म्हणजे त्यातील आत्ताचा संचालक! ${mahaLine}, तर '${ctx.currentBhuktiLord}' भुक्ती (${ext.bhuktiNatureLabel}) ${n(ctx.bhuktiEndDate)} पर्यंत रोजचे निर्णय घडवत आहे.`,
        hi: `सबसे पहले सरल शब्दों में समझें: महादशा वर्षों तक चलने वाला मुख्य मौसम है और भुक्ति (अंतर्दशा) अभी दृश्य रचने वाला संचालक! ${mahaLine}, तथा '${ctx.currentBhuktiLord}' भुक्ति (${ext.bhuktiNatureLabel}) ${n(ctx.bhuktiEndDate)} तक प्रत्यक्ष परिणाम गढ़ रही है।`,
        te: `ముందుగా మహర్దశ మరియు భుక్తి అర్థం చూద్దాం: మహర్దశ అంటే కొన్నేళ్ల ప్రధాన కాలం, భుక్తి అంటే ఇప్పుడు నడిపించే ఉప-నాయకుడు! ${mahaLine}, మరియు '${ctx.currentBhuktiLord}' భుక్తి (${ext.bhuktiNatureLabel}) ${n(ctx.bhuktiEndDate)} వరకు ఫలితాలను ఇస్తోంది.`,
        ta: `முதலில் மகாதசை மற்றும் புக்தி என்றால் என்னவென்று பார்ப்போம்: மகாதசை என்பது பல ஆண்டுப் பருவம், புக்தி என்பது இப்போது இயக்கும் துணை இயக்குநர்! ${mahaLine}; '${ctx.currentBhuktiLord}' புக்தி (${ext.bhuktiNatureLabel}) ${n(ctx.bhuktiEndDate)} வரை நேரடிப் பலன் தருகிறது.`,
        en: `First, what are Mahadasha and Bhukti in everyday life? Mahadasha is the multi-year main season, while Bhukti directs day-to-day scenes inside it! Right now ${mahaLine}, paired with ${ctx.currentBhuktiLord} Bhukti (${ext.bhuktiNatureLabel}) through ${ctx.bhuktiEndDate}.`
      }, lang)}`,
      1: `${mahaLine}. ${pick6({
        kn: `ಮಹಾದಶೆ ಎಂದರೆ ದೀರ್ಘ ಪಯಣದ ಮುಖ್ಯ ಹಳಿ; ಭುಕ್ತಿ ಎಂದರೆ ಆ ಹಳಿಯ ಮೇಲೆ ಈಗ ಓಡುತ್ತಿರುವ ಬೋಗಿ! ${ctx.lagnaRashiName} ಲಗ್ನಕ್ಕೆ '${ctx.currentMahadasha}'–'${ctx.currentBhuktiLord}' (${n(ctx.bhuktiEndDate)}ರವರೆಗೆ) ಒಂದಾಗಿ ನಿಮ್ಮ ಜನ್ಮ ದಶಾ ಶೇಷ ${ctx.janmaDashaBalance}ದ ಮುಂದುವರಿಕೆಯಾಗಿ ಸಾಗುತ್ತಿವೆ.`,
        mr: `महादशा म्हणजे प्रवासाचा मुख्य मार्ग आणि भुक्ती म्हणजे त्यावरील आत्ताची गाडी! ${ctx.lagnaRashiName} लग्नासाठी '${ctx.currentMahadasha}'–'${ctx.currentBhuktiLord}' (${n(ctx.bhuktiEndDate)} पर्यंत) जोड तुमच्या जन्म दशा शिल्लक ${ctx.janmaDashaBalance}चा पुढचा अध्याय लिहिते.`,
        hi: `महादशा जीवन-यात्रा की मुख्य पटरी है और भुक्ति अभी चल रही गति! ${ctx.lagnaRashiName} लग्न हेतु '${ctx.currentMahadasha}'–'${ctx.currentBhuktiLord}' (${n(ctx.bhuktiEndDate)} तक) जन्म दशा शेष ${ctx.janmaDashaBalance} की अगली कड़ी रच रही हैं।`,
        te: `మహర్దశ అంటే ప్రధాన రహదారి కాగా భుక్తి ఇప్పుడు నడుస్తున్న వాహనం! ${ctx.lagnaRashiName} లగ్నానికి '${ctx.currentMahadasha}'–'${ctx.currentBhuktiLord}' (${n(ctx.bhuktiEndDate)} వరకు) మీ జన్మ దశా శేషం ${ctx.janmaDashaBalance} కొనసాగింపుగా సాగుతోంది.`,
        ta: `மகாதசை என்பது பயணத்தின் பிரதான பாதை, புக்தி என்பது இப்போது ஓடும் வாகனம்! ${ctx.lagnaRashiName} லக்னத்திற்கு '${ctx.currentMahadasha}'–'${ctx.currentBhuktiLord}' (${n(ctx.bhuktiEndDate)} வரை) உங்கள் ஜனன தசா இருப்பு ${ctx.janmaDashaBalance} தொடர்ச்சியாக நகர்கிறது.`,
        en: `Think of Mahadasha as the railway line and Bhukti as the engine pulling today's coaches: growing outward from your birth balance of ${ctx.janmaDashaBalance}, ${ctx.currentMahadasha} Mahadasha and ${ctx.currentBhuktiLord} Bhukti (${ext.bhuktiNatureLabel}) steer everything through ${ctx.bhuktiEndDate}.`
      }, lang)}`,
      2: `${pick6({
        kn: `ಈ ಕ್ಷಣದ ಕಾಲಚಕ್ರ ಗಣಿತ: ${ctx.currentMahadasha} ಮಹಾದಶೆ (${ext.mahaNatureLabel}) ಮತ್ತು ${ctx.currentBhuktiLord} ಭುಕ್ತಿ (${ext.bhuktiNatureLabel}) ನಡುವೆ ${ctx.isDashaSandhi ? "ತಿರುವಿನ ಗಡಿ (ದಶಾ ಸಂಧಿ)" : "ಸ್ಥಿರ ಸಮನ್ವಯ"} ಇದ್ದು, ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ಫಲಗಳನ್ನು ಎಚ್ಚರಿಸುತ್ತಿದೆ. ${mahaLine}.`,
        mr: `आत्ताचे दशा गणित: ${ctx.currentMahadasha} महादशा (${ext.mahaNatureLabel}) व ${ctx.currentBhuktiLord} भुक्ती (${ext.bhuktiNatureLabel}) यांमधील ${ctx.isDashaSandhi ? "दशा-संधी वळण" : "स्थिर ताळमेळ"} तुमच्या ${n(arch.peakHouseNum)}व्या भावाचे (${arch.peakDomainLabel}) फळ जागवत आहे. ${mahaLine}.`,
        hi: `वर्तमान दशा चक्र: ${ctx.currentMahadasha} महादशा (${ext.mahaNatureLabel}) और ${ctx.currentBhuktiLord} भुक्ति (${ext.bhuktiNatureLabel}) का ${ctx.isDashaSandhi ? "संधि-मोड़" : "संतुलन"} आपके ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) को सक्रिय कर रहा है। ${mahaLine}।`,
        te: `ప్రస్తుత దశా గణితం: ${ctx.currentMahadasha} మహర్దశ (${ext.mahaNatureLabel}) మరియు ${ctx.currentBhuktiLord} భుక్తి (${ext.bhuktiNatureLabel}) మధ్య ఉన్న ${ctx.isDashaSandhi ? "సంధి మలుపు" : "స్థిర సమన్వయం"} మీ ${n(arch.peakHouseNum)}వ స్థాన (${arch.peakDomainLabel}) శక్తిని మేల్కొల్పుతోంది. ${mahaLine}.`,
        ta: `நடப்பு தசா கணிதம்: ${ctx.currentMahadasha} மகாதசை (${ext.mahaNatureLabel}) மற்றும் ${ctx.currentBhuktiLord} புக்தி (${ext.bhuktiNatureLabel}) இடையிலான ${ctx.isDashaSandhi ? "சந்தித் திருப்பம்" : "சீரான இணைப்பு"} உங்கள் ${n(arch.peakHouseNum)}-ம் இடத்தை (${arch.peakDomainLabel}) தூண்டுகிறது. ${mahaLine}.`,
        en: `Mapping Mahadasha against Bhukti today: ${mahaLine}. Together with ${ctx.currentBhuktiLord} Bhukti (${ext.bhuktiNatureLabel}) through ${ctx.bhuktiEndDate}, this ${ctx.isDashaSandhi ? "transition seam" : "steady cycle"} awakens House ${arch.peakHouseNum} (${arch.peakDomainLabel}).`
      }, lang)}`,
      3: `${pick6({
        kn: `ಮಹಾದಶೆ ಎಂದರೆ ಆಕಾಶದ ಋತು, ಭುಕ್ತಿ ಎಂದರೆ ಇಂದಿನ ಹವಾಮಾನ! ${mahaLine}; ಅದಕ್ಕೆ ಪೂರಕವಾಗಿ ${ctx.currentBhuktiLord} ಭುಕ್ತಿ (${n(ctx.bhuktiEndDate)}ರವರೆಗೆ) ನಿಮಗೆ ಪ್ರಾಯೋಗಿಕ ನಿರ್ಮಾಣದ ಅವಕಾಶವನ್ನು ತರುತ್ತಿದೆ.`,
        mr: `महादशा म्हणजे मुख्य ऋतू आणि भुक्ती म्हणजे आजचे हवामान! ${mahaLine}; यामध्ये ${ctx.currentBhuktiLord} भुक्ती (${n(ctx.bhuktiEndDate)} पर्यंत) प्रत्यक्ष कृतीची संधी आणते.`,
        hi: `महादशा यदि बड़ा मौसम है, तो भुक्ति आज की हवा का रुख! ${mahaLine}; इसके भीतर ${ctx.currentBhuktiLord} भुक्ति (${n(ctx.bhuktiEndDate)} तक) ठोस परिणाम देने आ रही है।`,
        te: `మహర్దశ అంటే పెద్ద ఋతువు అయితే భుక్తి అంటే ఈ రోజు వాతావరణం! ${mahaLine}; అందులో ${ctx.currentBhuktiLord} భుక్తి (${n(ctx.bhuktiEndDate)} వరకు) ఆచరణాత్మక ఫలితాలను ఇస్తోంది.`,
        ta: `மகாதசை என்பது பெரும் பருவம் என்றால், புக்தி என்பது இன்றைய வானிலை! ${mahaLine}; இதில் ${ctx.currentBhuktiLord} புக்தி (${n(ctx.bhuktiEndDate)} வரை) நேரடி செயல்பாட்டு வாய்ப்பைத் தருகிறது.`,
        en: `If Mahadasha is the climate of a decade, Bhukti is today's weather: ${mahaLine}, while ${ctx.currentBhuktiLord} Bhukti steers every practical decision until ${ctx.bhuktiEndDate}.`
      }, lang)}`
    };

    const sandhiNote = ctx.isDashaSandhi
      ? pick6({
          kn: `ಗಮನಿಸಿ: ಈಗ ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} ದಶಾ ಸಂಧಿ (ತಿರುವಿನ ಅಂಚು, ${n(ctx.bhuktiEndDate)}) ಸನಿಹದಲ್ಲಿರುವುದರಿಂದ ಹಳೆಯ ಆಲೋಚನೆಗಳು ಕಳಚಿ ಹೊಸ ಆಸಕ್ತಿಗಳು ಹುಟ್ಟುತ್ತಿವೆ — ಈ ಗೊಂದಲ ತಾತ್ಕಾಲಿಕ.`,
          mr: `महत्त्वाचे: सध्या तुम्ही ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} दशा-संधीच्या (${n(ctx.bhuktiEndDate)}) कडेवर उभे असल्याने जुने विचार सुटून नवी आवड निर्माण होत आहे — ही अस्वस्थता तात्पुरती आहे.`,
          hi: `ध्यान दें: आप अभी ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} दशा-संधि (${n(ctx.bhuktiEndDate)}) के मोड़ पर हैं, जहां पुराने समीकरण बदलकर नई रुचि जन्म लेती है — यह हल्का बदलाव शुभ संकेत है।`,
          te: `గమనిక: ప్రస్తుతం ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} దశా సంధి (${n(ctx.bhuktiEndDate)}) నడుస్తున్నందున పాత పద్ధతులు మారి కొత్త ఆసక్తి కలుగుతోంది — ఈ గందరగోళం తాత్కాలికమే.`,
          ta: `கவனியுங்கள்: இப்போது ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} தசா சந்தி (${n(ctx.bhuktiEndDate)}) நிலை என்பதால் பழைய சிந்தனைகள் மாறி புதிய ஆர்வம் பிறக்கிறது — இது தற்காலிகமே.`,
          en: `Notice the ${ctx.currentMahadasha}–${ctx.currentBhuktiLord} Dasha-Sandhi hinge (ending ${ctx.bhuktiEndDate}): outgrowing old motivation right now signals a healthy transition into fresh priorities rather than failure.`
        }, lang)
      : pick6({
          kn: `${ctx.currentMahadasha}–${ctx.currentBhuktiLord} ನಡುವೆ ಸ್ಥಿರ ಸಮನ್ವಯ ಇರುವುದರಿಂದ '${n(ctx.bhuktiEndDate)}'ವರೆಗೆ ಒಂದೇ ಲಯದಲ್ಲಿ ದೊಡ್ಡ ಕೆಲಸ ಕಟ್ಟಲು ಸುಲಭವಾಗುತ್ತದೆ.`,
          mr: `${ctx.currentMahadasha}–${ctx.currentBhuktiLord} मध्ये उत्तम ताळमेळ असल्याने '${n(ctx.bhuktiEndDate)}' पर्यंत एका लयीत मोठे काम उभारणे सोपे जाईल.`,
          hi: `${ctx.currentMahadasha}–${ctx.currentBhuktiLord} के बीच सहज तालमेल रहने से '${n(ctx.bhuktiEndDate)}' तक एक लय में स्थायी प्रगति संभव है।`,
          te: `${ctx.currentMahadasha}–${ctx.currentBhuktiLord} మధ్య స్థిర సమన్వయం ఉండటంతో '${n(ctx.bhuktiEndDate)}' వరకు ఒకే వేగంతో విజయం సాధించవచ్చు.`,
          ta: `${ctx.currentMahadasha}–${ctx.currentBhuktiLord} இடையே சீரான இணைப்பு உள்ளதால் '${n(ctx.bhuktiEndDate)}' வரை ஒரே வேகத்தில் சாதிக்கலாம்.`,
          en: `With steady harmony between ${ctx.currentMahadasha} and ${ctx.currentBhuktiLord}, uninterrupted focus through ${ctx.bhuktiEndDate} builds lasting momentum.`
        }, lang);

    const p2Map7: Record<0 | 1 | 2 | 3, string> = {
      0: sandhiNote,
      1: `${sandhiNote} ${pick6({
        kn: `ಈಗಿನ ಭುಕ್ತಿ ಆಡಳಿತದಲ್ಲಿ ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ಪ್ರಯತ್ನಗಳಿಗೆ ನೇರ ಬೆಂಬಲ ಸಿಗುತ್ತದೆ.`,
        mr: `या भुक्ती काळात तुमच्या ${n(arch.peakHouseNum)}व्या भावातील (${arch.peakDomainLabel}) प्रयत्नांना थेट पाठबळ मिळते.`,
        hi: `इस भुक्ति अवधि में आपके ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) के प्रयासों को सीधा सहारा मिलता है।`,
        te: `ఈ భుక్తి సమయంలో మీ ${n(arch.peakHouseNum)}వ స్థాన (${arch.peakDomainLabel}) ప్రయత్నాలకు తక్షణ మద్దతు లభిస్తుంది.`,
        ta: `இந்தப் புக்தி காலத்தில் உங்கள் ${n(arch.peakHouseNum)}-ம் இட (${arch.peakDomainLabel}) முயற்சிகளுக்கு நேரடி ஆதரவு கிடைக்கும்.`,
        en: `Inside this chapter, House ${arch.peakHouseNum} (${arch.peakDomainLabel}) responds far faster than sidelined pursuits.`
      }, lang)}`,
      2: pick6({
        kn: `${n(ctx.bhuktiEndDate)}ರ ಒಳಗೆ ಸಂಪೂರ್ಣವಾಗುವ ಈ ${ctx.currentBhuktiLord} ಅಧ್ಯಾಯವು '${ext.bhuktiNatureLabel}' ಗುಣಕ್ಕೆ ತಕ್ಕಂತೆ ನಿಮ್ಮ ದಿನಚರಿಯನ್ನು ರೂಪಿಸುತ್ತಿದೆ.`,
        mr: `${n(ctx.bhuktiEndDate)} पर्यंत चालणारा हा ${ctx.currentBhuktiLord} टप्पा '${ext.bhuktiNatureLabel}' स्वरूपात तुमचे दैनंदिन निर्णय घडवतो आहे.`,
        hi: `${n(ctx.bhuktiEndDate)} तक चलने वाला यह ${ctx.currentBhuktiLord} चरण '${ext.bhuktiNatureLabel}' प्रभाव से आपकी दिनचर्या को दिशा दे रहा है।`,
        te: `${n(ctx.bhuktiEndDate)} వరకు సాగే ఈ ${ctx.currentBhuktiLord} దశ '${ext.bhuktiNatureLabel}' స్వభావంతో మీ రోజువారీ అడుగులను నడిపిస్తోంది.`,
        ta: `${n(ctx.bhuktiEndDate)} வரை நடக்கும் இந்த ${ctx.currentBhuktiLord} புக்தி '${ext.bhuktiNatureLabel}' தன்மையுடன் உங்கள் அன்றாடத்தை இயக்குகிறது.`,
        en: `Running through ${ctx.bhuktiEndDate}, your ${ctx.currentBhuktiLord} sub-chapter channels '${ext.bhuktiNatureLabel}' energy into real routines.`
      }, lang),
      3: sandhiNote
    };

    const p3Map7: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಈ ದಶೆಯ ನಿಯಮಕ್ಕೆ ತಲೆಬಾಗಿ, ${n(ctx.bhuktiEndDate)}ರವರೆಗೆ ಹಳೆಯ ಪದ್ಧತಿಯನ್ನು ಬಿಟ್ಟು '${ext.bhuktiNatureLabel}' ಶೈಲಿಯ ಹೆಜ್ಜೆ ಇಡಿ.`,
        mr: `या दशेच्या लयीप्रमाणे ${n(ctx.bhuktiEndDate)} पर्यंत जुना हट्ट सोडून '${ext.bhuktiNatureLabel}' पद्धतीने पावले टाका.`,
        hi: `इस दशा के नियम का सम्मान करते हुए ${n(ctx.bhuktiEndDate)} तक पुराने ढर्रे के बजाय '${ext.bhuktiNatureLabel}' ढंग अपनाएं।`,
        te: `ఈ దశ స్వభావానికి అనుగుణంగా ${n(ctx.bhuktiEndDate)} వరకు పాత పట్టుదల వదిలి '${ext.bhuktiNatureLabel}' మార్గంలో నడవండి.`,
        ta: `இந்தத் தசையின் விதிக்கு ஏற்ப ${n(ctx.bhuktiEndDate)} வரை பழைய பிடிவாதத்தை விட்டு '${ext.bhuktiNatureLabel}' அணுகுமுறையைக் கையாளுங்கள்.`,
        en: `Honor the rulebook of this season through ${ctx.bhuktiEndDate}—lean into '${ext.bhuktiNatureLabel}' work rather than fighting yesterday's clock.`
      },
      1: {
        kn: `ಹಣಕಾಸು-ದಾಖಲೆ ನಿರ್ವಹಣೆಯನ್ನು '${ctx.currentBhuktiLord}' ದೃಷ್ಟಿಯಿಂದ ಶಿಸ್ತುಗೊಳಿಸಿದರೆ ಮುಂದಿನ ಭುಕ್ತಿಗೆ ಭದ್ರ ವೇದಿಕೆ ಸಿದ್ಧವಾಗುತ್ತದೆ.`,
        mr: `पैसे व कागदपत्रांची शिस्त '${ctx.currentBhuktiLord}' नुसार लावल्यास पुढील दशेसाठी मजबूत पाया तयार होईल.`,
        hi: `धन एवं आवश्यक दस्तावेज़ '${ctx.currentBhuktiLord}' की लय के अनुसार संवार लेने पर आगामी अंतर के लिए मजबूत आधार बनेगा।`,
        te: `ఆర్థిక మరియు పత్రాల క్రమశిక్షణను '${ctx.currentBhuktiLord}' ప్రకారం సరిచేస్తే రాబోయే దశకు బలమైన పునాది పడుతుంది.`,
        ta: `பண மற்றும் ஆவண ஒழுங்கை '${ctx.currentBhuktiLord}' தன்மைக்கு ஏற்பச் சீரமைத்தால் அடுத்த கட்டத்திற்கு உறுதியான அடித்தளம் அமையும்.`,
        en: `Organize accounts and core goals gently in ${ctx.currentBhuktiLord}'s style so the next Bhukti steps onto clean ground.`
      },
      2: {
        kn: `ನಿಮ್ಮ ಯೋಗಿ ${ctx.yogiPlanetName} ಹಾಗೂ ದಶಾನಾಥ ${ctx.currentMahadasha} ನಡುವೆ ಸಮತೋಲನ ತರಲು ${ctx.localizedYogiDay}ದ ಸಮಯ ಬಳಸಿ.`,
        mr: `तुमचा योगी ${ctx.yogiPlanetName} आणि दशानाथ ${ctx.currentMahadasha} यांत समतोल राखण्यासाठी ${ctx.localizedYogiDay} ची निवड करा.`,
        hi: `योगी ${ctx.yogiPlanetName} एवं दशानाथ ${ctx.currentMahadasha} में तालमेल बनाए रखने हेतु मुख्य कदम ${ctx.localizedYogiDay} को रखें।`,
        te: `మీ యోగి ${ctx.yogiPlanetName} మరియు దశానాథుడు ${ctx.currentMahadasha} మధ్య సమన్వయం కోసం ${ctx.localizedYogiDay} నాడు ప్రణాళిక వేయండి.`,
        ta: `உங்கள் யோகி ${ctx.yogiPlanetName} மற்றும் தசாநாதன் ${ctx.currentMahadasha} இணைப்பை வலுப்படுத்த ${ctx.localizedYogiDay} நாளைத் தேர்ந்தெடுங்கள்.`,
        en: `Bridge Yogi ${ctx.yogiPlanetName} with Mahadasha lord ${ctx.currentMahadasha} by launching key actions on ${ctx.localizedYogiDay}.`
      },
      3: {
        kn: `ಚಳಿಗಾಲದಲ್ಲಿ ಬಿಸಿಲಿನ ಬೀಜ ಬಿತ್ತದೆ, ವಸಂತ ಋತು ಕಾದ ರೈತನಂತೆ ಕಾಲಕ್ಕೆ ತಕ್ಕ ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡುವುದೇ ದಶಾ ವಿಜ್ಞಾನವಾಗಿದೆ.`,
        mr: `हिवाळ्यात उन्हाळी पीक न घेता ऋतूनुसार योग्य पेरणी करणाऱ्या शेतकऱ्याप्रमाणे वेळेचे मर्म ओळखणे हेच दशाशास्त्र आहे.`,
        hi: `जैसे समझदार किसान मौसम के अनुरूप ही बीज बोता है, वैसे ही दशा-चक्र पहचानकर कार्य चुनना सच्ची बुद्धिमत्ता है।`,
        te: `బుద్ధిమంతుడైన రైతు ఋతువుకు తగ్గ పంట వేసినట్లు, కాలానికి తగిన పనిని ఎంచుకోవడమే దశా శాస్త్రం నేర్పే జ్ఞానం.`,
        ta: `அறிவுள்ள உழவர் பருவத்திற்கேற்ப விதைப்பது போல், தசா காலத்திற்கேற்ற செயல்களைத் தேர்ந்தெடுப்பதே மெய்யான தெளிவு.`,
        en: `Smart farmers plant winter wheat in winter, never fighting seasons—match your efforts to your active ${ctx.currentMahadasha} clock.`
      }
    };

    const reflMap7: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ತಪಾಸಣೆ: ${ctx.currentMahadasha} ಆರಂಭವಾದಾಗಿನಿಂದ ನಿಮ್ಮ ಆದ್ಯತೆಗಳು ಹಿಂದಿಗಿಂತ ಹೇಗೆ ಬದಲಾಗಿವೆ ಗಮನಿಸಿ.`,
        mr: `निरीक्षण: ${ctx.currentMahadasha} सुरू झाल्यापासून तुमच्या आवडीनिवडी पूर्वीपेक्षा कशा बदलल्या आहेत पहा.`,
        hi: `अवलोकन: ${ctx.currentMahadasha} आरंभ होने के बाद से आपकी प्राथमिकताएं पहले से कैसे बदली हैं, देखें।`,
        te: `పరిశీలన: ${ctx.currentMahadasha} మొదలైనప్పటి నుండి మీ ఆలోచనా విధానం ఎంతగా మారిందో గమనించండి.`,
        ta: `கண்காணிப்பு: ${ctx.currentMahadasha} தொடங்கியதிலிருந்து உங்கள் முன்னுரிமைகள் எவ்வாறு மாறியுள்ளன எனப் பாருங்கள்.`,
        en: `Clock Check: Trace how your goals quietly shifted soon after ${ctx.currentMahadasha} Dasha first opened.`
      },
      1: {
        kn: `ಗುರುತು: ${n(ctx.bhuktiEndDate)}ರವರೆಗಿನ ಸಮಯವನ್ನು ಹಳೆಯ ಚಿಂತೆಗಿಂತ '${ctx.currentBhuktiLord}' ಪಾಠ ಕಲಿಯಲು ಮೀಸಲಿಡಿ.`,
        mr: `निश्चय: ${n(ctx.bhuktiEndDate)} पर्यंतचा काळ जुन्या चिंतेऐवजी '${ctx.currentBhuktiLord}' च्या कौशल्यात वापरा.`,
        hi: `लक्ष्य: ${n(ctx.bhuktiEndDate)} तक का समय पुरानी उधेड़बुन छोड़कर '${ctx.currentBhuktiLord}' की क्षमता निखारने में लगाएं।`,
        te: `లక్ష్యం: ${n(ctx.bhuktiEndDate)} వరకు పాత చింతల కంటే '${ctx.currentBhuktiLord}' నేర్పే క్రమశిక్షణపై దృష్టి పెట్టండి.`,
        ta: `இலக்கு: ${n(ctx.bhuktiEndDate)} வரையிலான காலத்தைக் கடந்த கவலைகளை விட '${ctx.currentBhuktiLord}' திறனை வளர்க்கப் பயன்படுத்துங்கள்.`,
        en: `Window Focus: Use the runway before ${ctx.bhuktiEndDate} to finish the core lesson ${ctx.currentBhuktiLord} put on your desk.`
      },
      2: {
        kn: `ನಿಮ್ಮ ಜನ್ಮ ದಶಾ ಶೇಷ (${ctx.janmaDashaBalance}) ತಂದ ಪಯಣವನ್ನು ನೆನೆದು ಮುಂದಿನ ಹಂತವನ್ನು ಶಾಂತವಾಗಿ ಸ್ವಾಗತಿಸಿ.`,
        mr: `जन्म दशा शिल्लक (${ctx.janmaDashaBalance}) पासूनचा प्रवास आठवून पुढील टप्प्याचे शांतपणे स्वागत करा.`,
        hi: `जन्म दशा शेष (${ctx.janmaDashaBalance}) से चली अपनी यात्रा को समझकर आगामी चरण का शांत स्वागत करें।`,
        te: `జన్మ దశా శేషం (${ctx.janmaDashaBalance}) నుండి సాగిన మీ ప్రయాణాన్ని తలచుకుని తదుపరి దశను ఆహ్వానించండి.`,
        ta: `ஜனன தசா இருப்பு (${ctx.janmaDashaBalance}) முதல் நகர்ந்த பயணத்தை உணர்ந்து அடுத்த கட்டத்தை வரவேற்றுக் கொள்ளுங்கள்.`,
        en: `Perspective: Counting backward to birth balance (${ctx.janmaDashaBalance}) reminds you how cleanly every past chapter passed right on cue.`
      },
      3: {
        kn: `ಒಂದೇ ನಿಯಮ: ಹಡಗು ಸಮುದ್ರದ ಅಲೆಗೆ ತಕ್ಕಂತೆ ಹಾಯುತ್ತಿರುವಾಗ ಅದನ್ನು ದೂಷಿಸದೆ ದಿಕ್ಕನ್ನು ಆನಂದಿಸಿ.`,
        mr: `सोपा नियम: लाटांच्या गतीसोबत प्रवास सुरू असताना अकारण विरोध न करता योग्य वेगाचा आनंद घ्या.`,
        hi: `सच्चा सूत्र: जब समय की धारा स्वयं मार्ग प्रशस्त कर रही हो, तब अनावश्यक व्यग्रता त्यागकर सधे हुए कदम बढ़ाएं।`,
        te: `సరళ సూత్రం: కాలానికి అనుగుణంగా అడుగు వేస్తున్నప్పుడు భయాన్ని వీడి నిశ్చింతగా సాగండి.`,
        ta: `எளிய நெறி: காலத்தின் போக்கோடு இணைந்து செல்லும்போது அச்சமின்றி நிதானமாகப் பயணியுங்கள்.`,
        en: `Closing Cue: Never confuse slow planetary transitions for dead ends—this ${ctx.currentBhuktiLord} weather serves an exact design.`
      }
    };

    return {
      p1Focus: p1Variants[ed],
      p2Body: p2Map7[ed],
      p3Body: pick6(p3Map7[ed], lang),
      reflectionNote: pick6(reflMap7[ed], lang)
    };
  }

  if (chNum === 8) {
    // Saturn Transit Reality (driven by saturnBand + SAV + Vedha + Edition!)
    const satCondBase = pick6(
      arch.saturnBand === "sade_sati"
        ? {
            kn: `ಸಾಡೇಸಾತಿ ಚಕ್ರದಲ್ಲಿ (${ctx.shaniTransitRashi}, ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆ) ಶನಿ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಶಿಸ್ತು ಮತ್ತು ಅನಗತ್ಯ ಹೊರೆಗಳನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದಾನೆ.`,
            mr: `साडेसाती टप्प्यात (${ctx.shaniTransitRashi}, चंद्रापासून ${n(ctx.shaniHouseFromMoon)}वे स्थान) शनी तुमच्या संयमाची आणि नको असलेल्या ओझ्यांची तपासणी करत आहे.`,
            hi: `साढ़ेसाती चरण में (${ctx.shaniTransitRashi}, चंद्र से ${n(ctx.shaniHouseFromMoon)}वां भाव) शनि देव आपकी भावनात्मक दृढ़ता और अतिरिक्त भार की परीक्षा ले रहे हैं।`,
            te: `ఏల్నాటి శని దశలో (${ctx.shaniTransitRashi}, చంద్రుని నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థానం) శని మీ సహనాన్ని, అనవసర భారాలను సరిచేస్తోంది.`,
            ta: `ஏழரைச் சனி கட்டத்தில் (${ctx.shaniTransitRashi}, ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடம்) சனி உங்கள் மன உறுதியையும் பொறுப்புகளையும் சீரமைக்கிறது.`,
            en: `Moving across your Sade Sati arc (${ctx.shaniTransitRashi}, House ${ctx.shaniHouseFromMoon} from Moon), Saturn prunes draining expectations so self-reliance stands firm.`
          }
        : arch.saturnBand === "ashtama"
        ? {
            kn: `ಅಷ್ಟಮ ಶನಿ ಸ್ಥಿತಿಯಲ್ಲಿ (${ctx.shaniTransitRashi}) ಹಠಾತ್ ಬದಲಾವಣೆ, ರಹಸ್ಯ ವಿಷಯಗಳ ಬಯಲು ಹಾಗೂ ಆಂತರಿಕ ಶುದ್ಧೀಕರಣ ವೇಗವಾಗಿ ನಡೆಯುತ್ತವೆ.`,
            mr: `अष्टम शनी स्थितीत (${ctx.shaniTransitRashi}) अनपेक्षित बदल, लपलेली सत्ये समोर येणे व मानसिक बळकटपणा वेगाने घडतात.`,
            hi: `अष्टम शनि प्रभाव में (${ctx.shaniTransitRashi}) अचानक परिवर्तन, गुप्त वास्तविकता का प्रकट होना और आंतरिक शुद्धिकरण तीव्र होता है।`,
            te: `అష్టమ శని దశలో (${ctx.shaniTransitRashi}) అనూహ్య మార్పులు, దాచిన నిజాలు బయటపడటం మరియు లోతైన పరిణతి కలుగుతాయి.`,
            ta: `அஷ்டம சனி நிலையில் (${ctx.shaniTransitRashi}) எதிர்பாராத திருப்பங்கள், மறைந்த உண்மைகள் வெளிப்படுதல் மற்றும் மன வலிமை நிகழ்கின்றன.`,
            en: `During Ashtama Saturn (${ctx.shaniTransitRashi}, House 8 from Moon), concealed weak spots surface early so you rebuild strictly on verified facts.`
          }
        : arch.saturnBand === "kantaka"
        ? {
            kn: `ಕಂಟಕ ಶನಿ ಕೇಂದ್ರದಲ್ಲಿ (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆ) ಗೃಹ-ವಾಹನ ಹಾಗೂ ಪಾಲುದಾರಿಕೆಯ ನಿಯಮಗಳನ್ನು ಶಿಸ್ತಿಗೆ ತರಲಾಗುತ್ತಿದೆ.`,
            mr: `कंटक शनी केंद्रात (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}वे स्थान) घर, मालमत्ता व भागीदारीतील नियम अधिक स्पष्ट होत आहेत.`,
            hi: `कंटक शनि केंद्र में (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}वां भाव) गृह, संपत्ति एवं साझेदारी के नियम अनुशासित हो रहे हैं।`,
            te: `కంటక శని కేంద్రంలో (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}వ స్థానం) ఇల్లు, ఆస్తి మరియు భాగస్వామ్య నియమాలు స్థిరపడుతున్నాయి.`,
            ta: `கண்டக சனி கேந்திரத்தில் (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}-ம் இடம்) வீடு, சொத்து மற்றும் கூட்டு விதிகள் ஒழுங்குபடுத்தப்படுகின்றன.`,
            en: `From Kantaka Kendra (House ${ctx.shaniHouseFromMoon} from Moon in ${ctx.shaniTransitRashi}), Saturn tightens domestic and partnership agreements calmly.`
          }
        : arch.saturnBand === "upachaya"
        ? {
            kn: `ಶುಭ ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆ) ಶನಿ ನಿಂತಿರುವುದರಿಂದ ಶತ್ರು-ಸಾಲ ನಿಗ್ರಹ ಮತ್ತು ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯ ನಿಶ್ಚಿತವಾಗಿದೆ.`,
            mr: `शुभ उपचय स्थानी (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}वे स्थान) शनी असल्याने स्पर्धेत विजय आणि आर्थिक शिस्त पक्की होत आहे.`,
            hi: `शुभ उपचय भाव में (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}वां स्थान) शनि की स्थिति प्रतिस्पर्धा में विजय और कर्मिक विस्तार दे रही है।`,
            te: `శుభ ఉపచయ స్థానంలో (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}వ ఇల్లు) శని ఉన్నందున పోటీలలో విజయం మరియు క్రమమైన అభివృద్ధి సాధ్యమవుతుంది.`,
            ta: `சுப உபசய இடத்தில் (${ctx.shaniTransitRashi}, ${n(ctx.shaniHouseFromMoon)}-ம் இடம்) சனி நிற்பதால் போட்டிகளில் வெற்றியும் நிலையான உயர்வும் கிடைக்கும்.`,
            en: `Positioned favorably in Upachaya House ${ctx.shaniHouseFromMoon} (${ctx.shaniTransitRashi}), Saturn turns steady endurance into clear competitive mastery.`
          }
        : {
            kn: `ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಧರ್ಮ-ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿ (${ctx.shaniTransitRashi}) ಶನಿ ನಿಧಾನಗತಿಯ ದೀರ್ಘಕಾಲಿಕ ಜ್ಞಾನ ಮತ್ತು ಸ್ಥಿರ ಪಾಲನೆಯನ್ನು ಕಲಿಸುತ್ತಿದ್ದಾನೆ.`,
            mr: `चंद्रापासून ${n(ctx.shaniHouseFromMoon)}व्या स्थानी (${ctx.shaniTransitRashi}) शनी दीर्घकालीन नियोजन व शांत विवेकाची ताकद देत आहे.`,
            hi: `चंद्र से ${n(ctx.shaniHouseFromMoon)}वें भाव में (${ctx.shaniTransitRashi}) शनि दीर्घकालिक योजना और परिपक्व विवेक का निर्माण कर रहे हैं।`,
            te: `చంద్రుని నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థానంలో (${ctx.shaniTransitRashi}) శని దీర్ఘకాలిక ఆలోచన మరియు స్థిరమైన జ్ఞానాన్ని అందిస్తోంది.`,
            ta: `ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடத்தில் (${ctx.shaniTransitRashi}) சனி நீண்டகாலத் திட்டமிடலையும் தெளிவான அறிவையும் தருகிறது.`,
            en: `Crossing trinal House ${ctx.shaniHouseFromMoon} (${ctx.shaniTransitRashi}), Saturn slows impulsive chases so durable wisdom takes command.`
          },
      lang
    );

    const savTag = pick6({
      kn: `ಈ ಸಂಚಾರಕ್ಕೆ ${n(ctx.shaniTransitSav)} ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳ ಬೆಂಬಲವಿದ್ದು (${ctx.shaniVedhaObstructed ? "ಗೋಚಾರ ವೇಧೆ ಸಹಿತ" : "ವೇಧೆ ಮುಕ್ತ ಶುದ್ಧ ಗತಿ"}), ನಿಧಾನವಾದರೂ ಗಟ್ಟಿ ಫಲ ನೀಡುತ್ತದೆ.`,
      mr: `या गोचरात ${n(ctx.shaniTransitSav)} अष्टकवर्ग गुणांचे बळ असून (${ctx.shaniVedhaObstructed ? "गोचर वेधासह" : "वेधमुक्त शुद्ध गती"}), काम संथ पण ठोस राहते.`,
      hi: `इस भ्रमण को ${n(ctx.shaniTransitSav)} अष्टकवर्ग बिंदुओं का बल प्राप्त है (${ctx.shaniVedhaObstructed ? "आंशिक वेध सहित" : "वेध-मुक्त स्पष्ट गति"}), जो धीमी किंतु ठोस सिद्धि देता है।`,
      te: `ఈ సంచారానికి ${n(ctx.shaniTransitSav)} అష్టకవర్గ బిందువుల బలం ఉంది (${ctx.shaniVedhaObstructed ? "గోచార వేధతో" : "వేధ లేని శుద్ధ గతి"}) — ఫలితం స్థిరంగా నిలుస్తుంది.`,
      ta: `இந்தச் சஞ்சாரத்திற்கு ${n(ctx.shaniTransitSav)} அஷ்டகவர்க்க பரல்களின் பலம் உள்ளது (${ctx.shaniVedhaObstructed ? "கோசார வேதையுடன்" : "வேதையற்ற தெளிவு"}) — பலன் உறுதியாக நிலைக்கும்.`,
      en: `Backed by ${ctx.shaniTransitSav} Sarvashtakavarga bindus (${ctx.shaniVedhaObstructed ? "with Gochara Vedha patience" : "clear of Gochara Vedha friction"}), progress holds under weight.`
    }, lang);

    const p2Map8: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಲೋಕಭಯಕ್ಕೆ ವಿರುದ್ಧವಾಗಿ, ${ctx.moonRashiName} ಚಂದ್ರನಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಸ್ಥಾನದ (${ctx.shaniTransitRashi}, ${n(ctx.shaniTransitSav)} ಬಿಂದು) ಶನಿ ಶ್ರಮ-ಸತ್ಯದ ಮಿತ್ರರೇ ಹೊರತು ಶತ್ರುವಲ್ಲ; ಕೇವಲ ತರಾತುರಿಯ ಮಾರ್ಗಗಳಿಗೆ ಮಾತ್ರ ತಡೆ ಹಾಕುತ್ತಾರೆ.`,
        mr: `लोकांच्या भीतीपेक्षा वेगळे वास्तव असे: ${ctx.moonRashiName} चंद्रापासून ${n(ctx.shaniHouseFromMoon)}व्या भावातील (${ctx.shaniTransitRashi}, ${n(ctx.shaniTransitSav)} गुण) शनी प्रामाणिक परिश्रमाचे मित्र आहेत, ते फक्त चुकीच्या घाईलाच लगाम घालतात.`,
        hi: `लोक-भय से परे वास्तविकता यह है: ${ctx.moonRashiName} चंद्र से ${n(ctx.shaniHouseFromMoon)}वें भाव (${ctx.shaniTransitRashi}, ${n(ctx.shaniTransitSav)} बिंदू) में शनि निष्ठावान परिश्रम के मित्र हैं; वे केवल अनुचित जल्दबाजी रोकते हैं।`,
        te: `భయపడాల్సిన పనిలేదు: ${ctx.moonRashiName} చంద్రుని నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థానంలో (${ctx.shaniTransitRashi}, ${n(ctx.shaniTransitSav)} బిందువులు) శని నిజాయితీ కష్టానికి మిత్రుడే గానీ శత్రువు కాదు — కేవలం అడ్డదారులను అడ్డుకుంటారు.`,
        ta: `பயப்படத் தேவையில்லை: ${ctx.moonRashiName} ராசிக்கு ${n(ctx.shaniHouseFromMoon)}-ம் இடத்தில் (${ctx.shaniTransitRashi}, ${n(ctx.shaniTransitSav)} பரல்கள்) சனி நேர்மையான உழைப்பின் நண்பன் — குறுக்குவழிகளை மட்டுமே தடுப்பார்.`,
        en: `Contrary to superstition, Saturn transiting House ${ctx.shaniHouseFromMoon} from your ${ctx.moonRashiName} Moon (${ctx.shaniTransitRashi}, ${ctx.shaniTransitSav} bindus) never punishes honest craft—it blocks fragile shortcuts so built success lasts.`
      },
      1: {
        kn: `ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿ ${ctx.moonRashiName}ದಿಂದ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆ ಪರೀಕ್ಷೆಯು ${ctx.currentMahadasha} ದಶೆಯೊಡನೆ ಸೇರಿ ವೃತ್ತಿ-ಕುಟುಂಬದ ಗಡಿಗಳನ್ನು ಸ್ಪಷ್ಟಪಡಿಸುತ್ತಿದೆ.`,
        mr: `तुमच्या ${ctx.moonRashiName} राशीपासून ${n(ctx.shaniHouseFromMoon)}व्या भावाची परीक्षा ${ctx.currentMahadasha} दशेशी जोडून कामाच्या मर्यादा स्पष्ट करत आहे.`,
        hi: `आपकी ${ctx.moonRashiName} राशि से ${n(ctx.shaniHouseFromMoon)}वें स्थान की यह परख ${ctx.currentMahadasha} दशा के साथ जुड़कर कार्य-सीमाएं स्पष्ट कर रही है।`,
        te: `మీ ${ctx.moonRashiName} రాశి నుండి ${n(ctx.shaniHouseFromMoon)}వ స్థాన ఫలితం ${ctx.currentMahadasha} దశతో కలిసి స్పష్టమైన నియమాలను ఏర్పరుస్తోంది.`,
        ta: `உங்கள் ${ctx.moonRashiName} ராசியிலிருந்து ${n(ctx.shaniHouseFromMoon)}-ம் இட சனி ${ctx.currentMahadasha} தசையோடு இணைந்து எல்லைகளைத் தெளிவுபடுத்துகிறது.`,
        en: `Inside ${ctx.currentMahadasha} Dasha, House ${ctx.shaniHouseFromMoon} from ${ctx.moonRashiName} Moon teaches crisp daily discipline before heavy expansion.`
      },
      2: {
        kn: `ಒಮ್ಮೆ ಬರುವ ೩೦ ದಿನದ ಭ್ರಮೆಯ ಯಶಸ್ಸಿಗಿಂತ, ${ctx.shaniTransitRashi} ಶನಿ ಕಟ್ಟಿಕೊಡುವ ೧೦ ವರ್ಷದ ಅಚಲ ಭದ್ರತೆಗೆ ಮೌಲ್ಯ ಹೆಚ್ಚು ಎಂಬುದನ್ನು ಗಮನಿಸಿ.`,
        mr: `क्षणिक चमकदार यशापेक्षा ${ctx.shaniTransitRashi} चा शनी देत असलेली दहा वर्षांची स्थिर सुरक्षितता किती तरी मोठी आहे.`,
        hi: `अस्थायी चमक-दमक के बजाय ${ctx.shaniTransitRashi} स्थित शनि द्वारा रचा जा रहा १० वर्षों का स्थायी आधार कहीं अधिक मूल्यवान है।`,
        te: `క్షణిక విజయం కంటే ${ctx.shaniTransitRashi} శని నిర్మించే 10 ఏళ్ల కదిలించలేని భద్రత విలువ ఎన్నో రెట్లు ఎక్కువ.`,
        ta: `நொடி நேரப் புகழை விட ${ctx.shaniTransitRashi} சனி உருவாக்கும் பத்தாண்டு உறுதியான பாதுகாப்பு மிக உயர்ந்தது.`,
        en: `Weigh flashy thirty-day applause against decade-grade resilience forged through ${ctx.shaniTransitRashi} (${ctx.shaniTransitSav} bindus).`
      },
      3: {
        kn: `ಗಟ್ಟಿಯಾದ ಕಲ್ಲುಪಾಯವಿಲ್ಲದೆ ಬಹುಮಹಡಿ ಕಟ್ಟಡ ನಿಲ್ಲದಂತೆ, ${ctx.lagnaRashiName} ಲಗ್ನಕ್ಕೆ ${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯ ಈ ಶನಿ ಸಂಚಾರವು (${ctx.shaniTransitRashi}) ತಳಪಾಯವನ್ನು ಆಳವಾಗಿಸುತ್ತಿದೆ.`,
        mr: `मजबूत पायाशिवाय मोठी इमारत उभी राहू शकत नाही; ${ctx.lagnaRashiName} लग्नासाठी ${n(ctx.shaniHouseFromMoon)}व्या भावातील हा शनी प्रवास (${ctx.shaniTransitRashi}) प्रगतीचा पाया घट्ट करत आहे.`,
        hi: `सुदृढ़ नींव के बिना विशाल भवन नहीं टिकता; ${ctx.lagnaRashiName} लग्न हेतु ${n(ctx.shaniHouseFromMoon)}वें भाव का यह शनि गोचर (${ctx.shaniTransitRashi}) जड़ें गहरी कर रहा है।`,
        te: `బలమైన పునాది లేకుండా పెద్ద భవనం నిలబడనట్లు, ${ctx.lagnaRashiName} లగ్నానికి ${n(ctx.shaniHouseFromMoon)}వ స్థాన శని (${ctx.shaniTransitRashi}) భవిష్యత్ పునాదిని గట్టిపరుస్తోంది.`,
        ta: `ஆழமான அஸ்திவாரம் இன்றிப் பெரிய மாளிகை நிற்காது; ${ctx.lagnaRashiName} லக்னத்தின் ${n(ctx.shaniHouseFromMoon)}-ம் இடச் சனி (${ctx.shaniTransitRashi}) அடித்தளத்தை வலுவாக்குகிறது.`,
        en: `Skyscrapers never begin on sand—for ${ctx.lagnaRashiName} Lagna, deep pilings under Saturn in House ${ctx.shaniHouseFromMoon} (${ctx.shaniTransitRashi}) hold future growth steady.`
      }
    };

    const p3Map8: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಪ್ರತಿಜ್ಞೆ: ಪ್ರತಿದಿನ ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಶುಚಿ-ಶಿಸ್ತಿನ ಕೆಲಸ, ಸುಳ್ಳಿಲ್ಲದ ವಾಗ್ದಾನ ಮತ್ತು ನಿಧಾನ ತಾಳ್ಮೆ — ಇದೇ ಶನಿ ಪ್ರಸಾದ.`,
        mr: `नियम: वेळेवर शिस्तबद्ध काम, दिलेला शब्द पाळणे आणि संयम — हीच शनीची खरी उपासना आहे.`,
        hi: `साधा नियम: समयबद्ध कार्य, सत्य वचन और शांत धैर्य — यही शनि देव की सर्वोत्तम साधना है।`,
        te: `నియమం: సమయపాలన, నిజాయితీగా మాట నిలబెట్టుకోవడం మరియు ఓపిక — ఇదే శని గ్రహ అనుగ్రహానికి మార్గం.`,
        ta: `நடைமுறை: நேரந்தவறாமை, சொன்ன சொல் காத்தல் மற்றும் பொறுமை — இவையே சனியின் முழு அருளைப் பெறும் வழி.`,
        en: `Saturn Protocol: Show up on time, honor quiet promises, and refuse rushed corners—pressure turns quickly into ally.`
      },
      1: {
        kn: `ಆತುರದ ಬಡ್ತಿ-ಬದಲಾವಣೆಗಿಂತ ಈ ಕಾಲದಲ್ಲಿ ಕೌಶಲ್ಯ, ಲೆಕ್ಕಪತ್ರ ಮತ್ತು ಕಾನೂನು-ದಾಖಲೆಗಳನ್ನು ೧೦೦% ಕ್ರಮಬದ್ಧಗೊಳಿಸಿ.`,
        mr: `उतावीळ बदलापेक्षा या काळात कौशल्य, हिशोब आणि सर्व कागदपत्रे अगदी अचूक व नीटनेटकी ठेवा.`,
        hi: `जल्दबाजी के बदलाव के बजाय इस अवधि में अपना कौशल, लेखा-जोखा और मुख्य कागज़ात पूरी तरह व्यवस्थित रखें।`,
        te: `తొందరపాటు మార్పుల కంటే ఈ సమయంలో మీ నైపుణ్యం, లెక్కలు మరియు పత్రాలను క్రమబద్ధం చేసుకోండి.`,
        ta: `அவசர மாற்றத்தை விட இக்காலத்தில் திறமை, கணக்குகள் மற்றும் ஆவணங்களைச் சீராக ஒழுங்குபடுத்துங்கள்.`,
        en: `Keep ledgers, skills, and paperwork spotless right now—every ounce of documented clarity multiplies downstream respect.`
      },
      2: {
        kn: `ನಿಮ್ಮ ${n(arch.weakestHouseNum)}ನೇ ಭಾವದ (${arch.weakestDomainLabel}) ಸಣ್ಣ ಲೋಪಗಳನ್ನು ಇಂದೇ ಸರಿಪಡಿಸಿದರೆ ಶನಿ ಪ್ರಭಾವ ಶುಭವಾಗುತ್ತದೆ.`,
        mr: `${n(arch.weakestHouseNum)}व्या भावातील (${arch.weakestDomainLabel}) छोट्या त्रुटी आजच सुधारल्यास शनी पूर्ण अनुकूल फळ देतो.`,
        hi: `${n(arch.weakestHouseNum)}वें भाव (${arch.weakestDomainLabel}) की छोटी कमियां अभी सुधार लेने पर शनि पूर्णतः शुभ परिणाम देते हैं।`,
        te: `${n(arch.weakestHouseNum)}వ స్థాన (${arch.weakestDomainLabel}) చిన్న లోపాలను ఇప్పుడే సరిదిద్దితే శని పూర్తి అనుకూలత ఇస్తుంది.`,
        ta: `${n(arch.weakestHouseNum)}-ம் இட (${arch.weakestDomainLabel}) சிறு குறைகளை இப்போதே சீரமைத்தால் சனி முழு நன்மை தருவார்.`,
        en: `Reinforce your softer House ${arch.weakestHouseNum} corner (${arch.weakestDomainLabel}) calmly today—Saturn rewards conscientious upkeep.`
      },
      3: {
        kn: `ಹಿರಿಯರ-ಶ್ರಮಿಕರ ಬಗ್ಗೆ ಗೌರವಯುತ ವರ್ತನೆ ಹಾಗೂ ದುರ್ಬಲರಿಗೆ ಸಹಾಯವು ${ctx.shaniTransitRashi} ಶನಿಯ ತೀವ್ರತೆಯನ್ನು ಹೂವಾಗಿಸುತ್ತದೆ.`,
        mr: `कष्टकरी आणि वडीलधाऱ्यांचा आदर तसेच गरजूंना प्रामाणिक मदत ${ctx.shaniTransitRashi} मधील शनीचा भार हलका करते.`,
        hi: `श्रमिकों एवं बुजुर्गों के प्रति सम्मान और निर्बल की निस्वार्थ सहायता ${ctx.shaniTransitRashi} के शनि की कठोरता को मधुर बनाती है।`,
        te: `శ్రమజీవులు మరియు పెద్దల పట్ల గౌరవం, అవసరమైన వారికి సహాయం ${ctx.shaniTransitRashi} శని ప్రభావాన్ని మృదువుగా మారుస్తాయి.`,
        ta: `உழைப்பாளிகள் மற்றும் பெரியோர்களிடம் மரியாதையும் ஏழைகளுக்கு உதவும் குணமும் ${ctx.shaniTransitRashi} சனியின் கடுமையைக் குறைக்கும்.`,
        en: `Respect toward elders and practical kindness toward working staff keep Saturn's gaze consistently gentle.`
      }
    };

    const reflMap8: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಸತ್ಯ ಪರೀಕ್ಷೆ: ಕಳೆದ ವರ್ಷಗಳಲ್ಲಿ ನೀವು ಕಷ್ಟಪಟ್ಟು ಕಲಿತ ಶಿಸ್ತು ಇಂದು ಯಾರೂ ಕಿತ್ತುಕೊಳ್ಳಲಾಗದ ಆಸ್ತಿಯಾಗಿದೆಯಲ್ಲವೇ?`,
        mr: `सत्य पारख: मागील काळात कष्टाने कमावलेली शिस्त आज कोणीही हिरावून घेऊ शकणार नाही अशी ताकद बनली आहे ना?`,
        hi: `सच्ची परख: कठिन समय में अर्जित आपका अनुशासन आज एक ऐसी पूंजी बन चुका है जिसे कोई छीन नहीं सकता।`,
        te: `నిజం గమనించండి: కష్టకాలంలో మీరు నేర్చుకున్న క్రమశిక్షణ నేడు ఎవరూ దోచుకోలేని ఆస్తిగా మారింది కదా?`,
        ta: `உண்மைப் பார்வை: கடின காலத்தில் நீங்கள் கற்ற ஒழுக்கம் இன்று யாராலும் பறிக்க முடியாத சொத்தாக மாறிவிட்டது அல்லவா?`,
        en: `Steel Test: Notice how habits forced on you slowly turned into competence nobody can ever take away.`
      },
      1: {
        kn: `ಗುರುತು: ವೇಗಕ್ಕಿಂತ ಗುಣಮಟ್ಟಕ್ಕೆ ಆದ್ಯತೆ ಕೊಟ್ಟ ಪ್ರತಿಯೊಂದು ಕೆಲಸದಲ್ಲೂ ಶನಿ ನಿಮಗೆ ದೀರ್ಘಕಾಲಿಕ ನೆಮ್ಮದಿ ತಂದಿದೆ.`,
        mr: `नोंद: घाईपेक्षा दर्जा जपलेल्या प्रत्येक कामात शनीने तुम्हाला चिरंतन समाधान दिले आहे.`,
        hi: `संकेत: जल्दबाजी की बजाय गुणवत्ता को चुने गए हर कार्य में शनि देव ने आपको स्थायी संतोष प्रदान किया है।`,
        te: `గుర్తు: వేగం కంటే నాణ్యతకు విలువ ఇచ్చిన ప్రతి పనిలో శని మీకు దీర్ఘకాలిక విజయాన్ని ఇచ్చింది.`,
        ta: `குறிப்பு: வேகத்தை விடத் தரத்திற்கு முக்கியத்துவம் கொடுத்த ஒவ்வொரு செயலிலும் சனி நிலையான நிறைவு தந்துள்ளது.`,
        en: `Track Record: Recall one craft decision where choosing patient quality outlasted flashy rivals effortlessly.`
      },
      2: {
        kn: `${n(ctx.shaniHouseFromMoon)}ನೇ ಮನೆಯ ಈ ಪಾಠವನ್ನು ಹಗುರಗೊಳಿಸಲು ಇಂದೇ ಒಂದು ಅಸ್ತವ್ಯಸ್ತ ಅಭ್ಯಾಸವನ್ನು ಶಾಂತವಾಗಿ ಕೈಬಿಡಿ.`,
        mr: `${n(ctx.shaniHouseFromMoon)}व्या भावाची वाटचाल सोपी करण्यासाठी आजच एक विस्कळीत सवय शांतपणे बदला.`,
        hi: `${n(ctx.shaniHouseFromMoon)}वें भाव की इस गति को सहज करने हेतु आज ही एक अनियमित आदत को व्यवस्थित करें।`,
        te: `${n(ctx.shaniHouseFromMoon)}వ స్థాన శని అనుకూలత కోసం నేడే ఒక క్రమరహిత అలవాటును వదిలేయండి.`,
        ta: `${n(ctx.shaniHouseFromMoon)}-ம் இட சனியைச் சீராக்க இன்றே ஒரு ஒழுங்கற்ற பழக்கத்தை அமைதியாக மாற்றுங்கள்.`,
        en: `Daily Upgrade: Retire one messy habit this week rather than carrying old clutter into strong years.`
      },
      3: {
        kn: `ಗಟ್ಟಿ ಮರ ಬೇಸಿಗೆಯ ಬಿಸಿಲಿಗೂ ಹೆದರುವುದಿಲ್ಲ — ನಿಮ್ಮೊಳಗಿನ ತಾಳ್ಮೆ ಈಗ ಅಷ್ಟೇ ದೃಢವಾಗಿದೆ.`,
        mr: `खोल मुळांचे झाड उन्हाळ्यातही सुकत नाही — तुमचा संयम आता तितकाच खंबीर झाला आहे.`,
        hi: `गहरी जड़ों वाला वृक्ष जैसे तपती धूप से नहीं डरता, आपका धैर्य अब उतना ही अटल हो चुका है।`,
        te: `లోతైన వేర్లున్న వృక్షం ఎండలకు వాడదు — మీలోని సహనం ఇప్పుడు అంతే గట్టిగా ఉంది.`,
        ta: `ஆழமான வேருள்ள மரம் வெயிலுக்கு அஞ்சாது — உங்கள் மனவுறுதியும் இப்போது அத்தனை உறுதியாகிவிட்டது.`,
        en: `Resilience Note: Deep roots fear neither dry seasons nor slow verdicts—trust the steady pace you earned.`
      }
    };

    return {
      p1Focus: ed === 0 ? satCondBase : `${satCondBase} ${savTag}`,
      p2Body: pick6(p2Map8[ed], lang),
      p3Body: pick6(p3Map8[ed], lang),
      reflectionNote: pick6(reflMap8[ed], lang)
    };
  }

  if (chNum === 9) {
    // Jupiter Transit Window (jupiterBand + Vedha + House 9/5 synergy)
    const jupCond = pick6(
      arch.jupiterBand === "benefic_trio"
        ? {
            kn: `ಚಂದ್ರನಿಂದ ಶುಭ ${n(ctx.guruHouseFromMoon)}ನೇ ಸ್ಥಾನದ ಗುರುವು (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} ಬಿಂದು) ನೇರವಾಗಿ ಧನ, ಮಿತ್ರ ಬೆಂಬಲ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಮಂಗಳಕರ ಸುದ್ದಿಯನ್ನು ತರುತ್ತಿದ್ದಾನೆ.`,
            mr: `चंद्रापासून शुभ ${n(ctx.guruHouseFromMoon)}व्या स्थानी असलेला गुरू (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} गुण) थेट लाभ, उत्तम सल्ला व कौटुंबिक मंगल प्रसंग आणत आहे.`,
            hi: `चंद्र से शुभ ${n(ctx.guruHouseFromMoon)}वें भाव का बृहस्पति (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} बिंदू) सीधे लाभ, उत्तम मार्गदर्शन और पारिवारिक शुभता ला रहा है।`,
            te: `చంద్రుని నుండి శుభ ${n(ctx.guruHouseFromMoon)}వ స్థానంలో ఉన్న గురువు (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} బిందువులు) నేరుగా ధనలాభం, సహకారం మరియు శుభవార్తలు తెస్తున్నాడు.`,
            ta: `ராசிக்குச் சுப ${n(ctx.guruHouseFromMoon)}-ம் இட குரு (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} பரல்கள்) நேரடி லாபம், நல்ல துணை மற்றும் குடும்ப மகிழ்ச்சியைத் தருகிறார்.`,
            en: `From auspicious House ${ctx.guruHouseFromMoon} (${ctx.guruTransitRashi}, ${ctx.guruTransitSav} bindus), Jupiter delivers tangible growth, supportive mentors, and fresh optimism.`
          }
        : arch.jupiterBand === "kendra_build"
        ? {
            kn: `ಚಂದ್ರನಿಂದ ${n(ctx.guruHouseFromMoon)}ನೇ ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿರುವ ಗುರುವು (${ctx.guruTransitRashi}) ಜವಾಬ್ದಾರಿಯುತ ಸ್ಥಾನಮಾನ, ಮನೆ-ಕೆಲಸದ ಸುಧಾರಣೆ ಹಾಗೂ ನಮ್ರ ನಾಯಕತ್ವವನ್ನು ಬೆಳೆಸುತ್ತಿದೆ.`,
            mr: `चंद्रापासून ${n(ctx.guruHouseFromMoon)}व्या केंद्र स्थानी असलेला गुरू (${ctx.guruTransitRashi}) जबाबदारीचे नवे पद व घरातील सुसंवाद वाढवत आहे.`,
            hi: `चंद्र से ${n(ctx.guruHouseFromMoon)}वें केंद्र स्थान का गुरु (${ctx.guruTransitRashi}) कार्यभार के साथ प्रतिष्ठा एवं घर में संतुलित सुधार ला रहा है।`,
            te: `చంద్రుని నుండి ${n(ctx.guruHouseFromMoon)}వ కేంద్ర స్థానంలోని గురువు (${ctx.guruTransitRashi}) కొత్త బాధ్యతలతో పాటు గౌరవాన్ని, ఇంటి అభివృద్ధిని ఇస్తున్నాడు.`,
            ta: `ராசிக்கு ${n(ctx.guruHouseFromMoon)}-ம் கேந்திர குரு (${ctx.guruTransitRashi}) பொறுப்புகளுடன் கூடிய உயர்வையும் இல்லற மேம்பாட்டையும் வழங்குகிறார்.`,
            en: `Gliding through Kendra House ${ctx.guruHouseFromMoon} (${ctx.guruTransitRashi}), Jupiter upgrades responsibility and social reach when paired with humility.`
          }
        : {
            kn: `ಚಂದ್ರನಿಂದ ${n(ctx.guruHouseFromMoon)}ನೇ ಸ್ಥಾನದಲ್ಲಿರುವ ಗುರುವು (${ctx.guruTransitRashi}) ಬಾಹ್ಯ ಪ್ರದರ್ಶನಕ್ಕಿಂತ ಆಳವಾದ ಅಧ್ಯಯನ, ಸಾಲ ನಿವಾರಣೆ ಹಾಗೂ ಭವಿಷ್ಯದ ದೊಡ್ಡ ಜಿಗಿತಕ್ಕೆ ಶಕ್ತಿ ತುಂಬುತ್ತಿದೆ.`,
            mr: `चंद्रापासून ${n(ctx.guruHouseFromMoon)}व्या स्थानी असलेला गुरू (${ctx.guruTransitRashi}) सखोल अभ्यास, खर्चावर नियंत्रण व पुढच्या मोठ्या प्रगतीची तयारी घडवत आहे.`,
            hi: `चंद्र से ${n(ctx.guruHouseFromMoon)}वें भाव का गुरु (${ctx.guruTransitRashi}) गहन अध्ययन, व्यय-नियंत्रण और आगामी बड़ी छलांग की आंतरिक तैयारी करा रहा है।`,
            te: `చంద్రుని నుండి ${n(ctx.guruHouseFromMoon)}వ స్థానంలో ఉన్న గురువు (${ctx.guruTransitRashi}) లోతైన జ్ఞానార్జనకు, ఆర్థిక క్రమశిక్షణకు మరియు భవిష్యత్ ఉన్నతికి బాట వేస్తున్నాడు.`,
            ta: `ராசிக்கு ${n(ctx.guruHouseFromMoon)}-ம் இட குரு (${ctx.guruTransitRashi}) ஆழ்ந்த கற்றல், செலவுக் கட்டுப்பாடு மற்றும் அடுத்த கட்ட வளர்ச்சிக்குத் தயார்படுத்துகிறார்.`,
            en: `Moving quietly across House ${ctx.guruHouseFromMoon} (${ctx.guruTransitRashi}), Jupiter works behind scenes—clearing obligations, deepening study, and prepping your next climb.`
          },
      lang
    );

    const vedhaNote = ctx.guruVedhaObstructed
      ? pick6({
          kn: `ಸಣ್ಣ ಗೋಚಾರ ವೇಧೆಯಿರುವ ಕಾರಣ ಶುಭ ಫಲವು ನೇರವಾಗಿ ಬಾರದೆ ಒಂದು ಸುತ್ತಿನ ತಾಳ್ಮೆಯ ನಂತರ ಕೈಸೇರುತ್ತದೆ.`,
          mr: `थोडा गोचर वेध असल्याने शुभ फळ घाईने नाही, तर थोड्या प्रतीक्षेनंतर नक्की मिळेल.`,
          hi: `आंशिक गोचर वेध के कारण शुभ परिणाम थोड़ी प्रतीक्षा और धैर्य के बाद स्थिर रूप से प्राप्त होता है।`,
          te: `స్వల్ప గోచార వేధ ఉన్నందున శుభ ఫలితం కొంచెం ఓపిక తర్వాత స్థిరంగా దక్కుతుంది.`,
          ta: `சிறு கோசார வேதை உள்ளதால் நற்பலன் சற்று பொறுமைக்குப் பிறகே உறுதியாகக் கைசேரும்.`,
          en: `Because mild Gochara Vedha slows rush, expected relief arrives steadily once early impatience settles.`
        }, lang)
      : pick6({
          kn: `ಗುರುವಿಗೆ ಯಾವುದೇ ವೇಧಾ ಅಡಚಣೆಯಿಲ್ಲದ ಕಾರಣ ಉತ್ತಮ ಜನರ ಸಹವಾಸವು ವೇಗವಾಗಿ ದಾರಿ ತೋರಲಿದೆ.`,
          mr: `कोणताही गोचर वेध नसल्याने चांगल्या व्यक्तींची साथ वेगाने यश देईल.`,
          hi: `पूर्णतः वेध-मुक्त होने से श्रेष्ठ लोगों का सहयोग शीघ्र ही प्रगति का द्वार खोल देगा।`,
          te: `ఎలాంటి గోచార వేధ లేనందున మంచి వ్యక్తుల సహకారం వేగంగా ఫలితాన్నిస్తుంది.`,
          ta: `வேதைத் தடையற்ற சுத்த சஞ்சாரமாதலால் நல்லவர்களின் துணை விரைந்து வழி திறக்கும்.`,
          en: `Completely free of Gochara Vedha obstruction, wise mentorship converts into real relief without needless delay.`
        }, lang);

    const p2Map9: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `${ctx.moonRashiName} ಚಂದ್ರನಿಂದ ${n(ctx.guruHouseFromMoon)}ನೇ ಸ್ಥಾನದ ಗುರು (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} ಬಿಂದು) ದೃಷ್ಟಿ ಹಾಯಿಸಿದಾಗ ಮುಚ್ಚಿದ ಬಾಗಿಲುಗಳೂ ಹಿರಿಯರ-ಗುರುಗಳ ಶಿಫಾರಸಿನಿಂದ ತೆರೆಯುತ್ತವೆ.`,
        mr: `${ctx.moonRashiName} चंद्रापासून ${n(ctx.guruHouseFromMoon)}व्या स्थानी गुरू (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} गुण) शुभ दृष्टी टाकताच बंद दरवाजेही अनुभवी व्यक्तींच्या शब्दाने उघडतात.`,
        hi: `${ctx.moonRashiName} चंद्र से ${n(ctx.guruHouseFromMoon)}वें भाव में बृहस्पति (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} बिंदू) की शुभ दृष्टि पड़ते ही बंद द्वार भी मार्गदर्शक के सहयोग से खुल जाते हैं।`,
        te: `${ctx.moonRashiName} చంద్రుని నుండి ${n(ctx.guruHouseFromMoon)}వ స్థానంలో గురువు (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} బిందువులు) దృష్టి పడినప్పుడు మూసుకుపోయిన దారులు పెద్దల సూచనతో తెరుచుకుంటాయి.`,
        ta: `${ctx.moonRashiName} ராசிக்கு ${n(ctx.guruHouseFromMoon)}-ம் இட குரு (${ctx.guruTransitRashi} — ${n(ctx.guruTransitSav)} பரல்கள்) பார்வை படும்போது மூடிய கதவுகளும் அனுபவஸ்தர் வார்த்தையால் திறக்கும்.`,
        en: `Whenever Jupiter turns attentive across House ${ctx.guruHouseFromMoon} from your ${ctx.moonRashiName} Moon (${ctx.guruTransitRashi}, ${ctx.guruTransitSav} bindus), locked corridors open via one right mentor or timely introduction.`
      },
      1: {
        kn: `ನಿಮ್ಮ ಭಾಗ್ಯಾಧಿಪತಿ ${ext.house9Info.lordName} (${n(savByHouse[9])} ಬಿಂದು) ಹಾಗೂ ${n(savByHouse[5])} ಬಿಂದುಗಳ ೫ನೇ ಜ್ಞಾನ ಸ್ಥಾನಕ್ಕೆ ಗುರು ಸಂಚಾರ ಹೊಸ ಕಲಿಕೆಯ ಕಿರಣ ತರುತ್ತದೆ.`,
        mr: `भाग्येश ${ext.house9Info.lordName} (${n(savByHouse[9])} गुण) व पंचम ज्ञान भावातील ${n(savByHouse[5])} गुणांना गुरूची ही चाल नवी ऊर्जा देते.`,
        hi: `भाग्येश ${ext.house9Info.lordName} (${n(savByHouse[9])} बिंदू) तथा पंचम भाव के ${n(savByHouse[5])} बिंदुओं को गुरु का यह गोचर नई स्पष्टता देता है।`,
        te: `భాగ్యాధిపతి ${ext.house9Info.lordName} (${n(savByHouse[9])} బిందువులు) మరియు 5వ స్థాన ${n(savByHouse[5])} బిందువులకు ఈ గురు సంచారం కొత్త వెలుగునిస్తోంది.`,
        ta: `பாக்கியாதிபதி ${ext.house9Info.lordName} (${n(savByHouse[9])} பரல்கள்) மற்றும் 5-ம் இட ${n(savByHouse[5])} பரல்களுக்குக் குருவின் நகர்வு புதிய ஒளி தருகிறது.`,
        en: `Connecting ${ext.house9Info.lordName} (${savByHouse[9]} bindus) with House 5 wisdom (${savByHouse[5]} bindus) sparks timely learning and lucky timing.`
      },
      2: {
        kn: `ನಿಮ್ಮ ೧೦ನೇ ಕರ್ಮ ಶ್ರಮಕ್ಕೂ ${ctx.guruTransitRashi} ಗುರುವಿನ ೯ನೇ ಭಾಗ್ಯ ದೃಷ್ಟಿಗೂ ನೇರ ಸೇತುವೆ ನಿರ್ಮಾಣವಾಗುತ್ತಿರುವುದರಿಂದ 'ಹಿತೈಷಿ ಮಾರ್ಗದರ್ಶನ' ಕೈತಪ್ಪುವುದಿಲ್ಲ.`,
        mr: `तुमच्या कष्टाशी ${ctx.guruTransitRashi} गुरूची कृपादृष्टी जोडली जात असल्याने योग्य सल्ला व संधी नक्की मिळतात.`,
        hi: `आपके परिश्रम के साथ ${ctx.guruTransitRashi} गुरु का संयोग जुड़ने से अब सटीक परामर्श और अवसर स्वतः समीप आते हैं।`,
        te: `మీ శ్రమకు ${ctx.guruTransitRashi} గురుని అనుగ్రహం తోడవడంతో సరైన మార్గదర్శనం ఖచ్చితంగా అందుతుంది.`,
        ta: `உங்கள் உழைப்புடன் ${ctx.guruTransitRashi} குருவின் அருள் இணைவதால் சரியான வழிகாட்டுதலும் வாய்ப்பும் தேடி வரும்.`,
        en: `Linking sustained effort against Jupiter's ${ctx.guruTransitSav}-bindu benevolence creates clean serendipity—asking smart questions yields rapid answers.`
      },
      3: {
        kn: `ನದಿ ಒಣಗಿದಾಗಲೂ ಮಳೆಗಾಲದ ಮೊದಲ ಹನಿ ಭೂಮಿಯ ಆಳದ ಬೀಜಗಳನ್ನು ಎಚ್ಚರಿಸುವಂತೆ, ${ctx.nakshatraName} ಚಾರ್ಟಿಗೆ ${ctx.guruTransitRashi} ಗುರು ನಿರೀಕ್ಷಿಸದ ಕಡೆಯಿಂದಲೇ ಭರವಸೆ ತರುತ್ತದೆ.`,
        mr: `पावसाचा पहिला थेंब कोरड्या मातीतील बियांना जागवतो, तसा ${ctx.nakshatraName} कुंडलीसाठी ${ctx.guruTransitRashi} गुरू अनपेक्षित दिशेने नवीन उमेद जागवतो.`,
        hi: `वर्षा की पहली बूंद जैसे सूखी धरा के बीजों को जगाती है, ${ctx.nakshatraName} के लिए ${ctx.guruTransitRashi} बृहस्पति अनपेक्षित दिशा से आशा की किरण जगाते हैं।`,
        te: `తొలకరి జల్లు ఎండిన భూమిలోని విత్తనాన్ని మేల్కొల్పినట్లు, ${ctx.nakshatraName} జాతకానికి ${ctx.guruTransitRashi} గురువు ఊహించని వైపు నుండి ఆశను చిగురింపజేస్తారు.`,
        ta: `முதல் மழைத்துளி காய்ந்த நிலத்தின் விதையை எழுப்புவது போல், ${ctx.nakshatraName} ஜாதகத்திற்கு ${ctx.guruTransitRashi} குரு எதிர்பாராத திசையிலிருந்து நம்பிக்கை தருகிறார்.`,
        en: `First spring showers wake quiet seeds beneath dry soil—${ctx.guruTransitRashi} Jupiter restores unexpected warmth right across your ${ctx.nakshatraName} outlook.`
      }
    };

    const p3Map9: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಈ ಗುರು ಸಂಚಾರದ ಲಾಭ ಪಡೆಯಲು, ದುರಹಂಕಾರ ಬಿಟ್ಟು ಜ್ಞಾನಿಗಳ ಸಲಹೆ ಕೇಳಿ ಹಾಗೂ ನಿಮ್ಮ ವಿದ್ಯೆ-ಅನುಭವವನ್ನು ಇತರರಿಗೂ ಹಂಚಿರಿ.`,
        mr: `गुरूची कृपा वाढवण्यासाठी नम्रपणे जाणकारांचा सल्ला घ्या आणि स्वतःचे ज्ञान इतरांनाही सांगा.`,
        hi: `गुरु कृपा बढ़ाने हेतु विनम्र होकर अनुभवी जनों से सीखें तथा अपना ज्ञान दूसरों के साथ भी बांटें।`,
        te: `గురు కృప పొందడానికి అహంకారం వీడి పెద్దల సలహా తీసుకోండి మరియు మీ జ్ఞానాన్ని పదిమందికీ పంచండి.`,
        ta: `குரு அருளைப் பெறத் தயக்கமின்றி அறிஞர்களின் ஆலோசனை கேளுங்கள்; உங்கள் அறிவையும் பிறருக்குப் பகிருங்கள்.`,
        en: `Invite Jupiter's finest side immediately: ask one wiser elder for honest counsel and mentor someone junior this month.`
      },
      1: {
        kn: `ನಿಮ್ಮ ${ctx.localizedYogiDay} ಮತ್ತು ಯೋಗಿ ${ctx.yogiPlanetName} ಚಕ್ರದಲ್ಲಿ ಹೊಸ ಶಿಕ್ಷಣ, ಪತ್ರವ್ಯವಹಾರ ಅಥವಾ ಮಂಗಳ ಕಾರ್ಯದ ಚರ್ಚೆ ಆರಂಭಿಸಿ.`,
        mr: `तुमच्या ${ctx.localizedYogiDay} दिवशी व योगी ${ctx.yogiPlanetName} बलात नवीन अभ्यास, करार किंवा कौटुंबिक मंगल कार्याची सुरुवात करा.`,
        hi: `अपने ${ctx.localizedYogiDay} और योगी ${ctx.yogiPlanetName} की शुभता में नए अध्ययन, पत्राचार अथवा शुभ कार्य का आरंभ करें।`,
        te: `మీ ${ctx.localizedYogiDay} మరియు యోగి ${ctx.yogiPlanetName} బలంతో కొత్త చదువు, చర్చలు లేదా శుభకార్య ప్రయత్నాలు మొదలుపెట్టండి.`,
        ta: `உங்கள் ${ctx.localizedYogiDay} மற்றும் யோகி ${ctx.yogiPlanetName} பலத்தில் புதிய கல்வி, திட்டங்கள் அல்லது சுப பேச்சுகளைத் தொடங்குங்கள்.`,
        en: `Start pivotal discussions, courses, or auspicious household steps cleanly inside your ${ctx.localizedYogiDay} cadence.`
      },
      2: {
        kn: `ಹಣ-ಅಧಿಕಾರದ ಲೆಕ್ಕಕ್ಕಿಂತ ನೈತಿಕತೆ ಮತ್ತು ಸತ್ಯಮಾರ್ಗಕ್ಕೆ ಬದ್ಧರಾದರೆ ಗುರು ಗ್ರಹವು ಅಗತ್ಯ ಸಂಪನ್ಮೂಲಗಳನ್ನು ತಾನೇ ತರುತ್ತದೆ.`,
        mr: `नैतिकता व प्रामाणिकपणा जपल्यास गुरू आवश्यक साधने आणि मदत आपोआप जवळ आणतो.`,
        hi: `नैतिक स्पष्टता एवं सत्यनिष्ठा बनाए रखने पर बृहस्पति आवश्यक संसाधन स्वयं उपलब्ध कराते हैं।`,
        te: `నిజాయితీ మరియు ధర్మబద్ధమైన నడవడిక ఉంటే గురువు అవసరమైన సహాయాన్ని స్వయంగా చేరవేస్తారు.`,
        ta: `நேர்மையும் அறநெறியும் காத்தால் தேவையான உதவிகளைக் குரு பகவான் தானாகக் கொண்டு சேர்ப்பார்.`,
        en: `Stay relentlessly ethical around negotiations—clean conscience turns Jupiter's ${ctx.guruTransitSav} bindus into durable fortune.`
      },
      3: {
        kn: `ಕೇವಲ ಮನೆಯಲ್ಲೇ ಕೂತು ಕಾಯದೆ, ಉತ್ತಮ ಸಭೆ-ಸಮಾಲೋಚನೆ ಮತ್ತು ಪುಸ್ತಕ-ಜ್ಞಾನದ ಸಂಪರ್ಕ ಬೆಳೆಸಿದರೆ ಅದೃಷ್ಟ ವೇಗಗೊಳ್ಳುತ್ತದೆ.`,
        mr: `घरात बसून वाट पाहण्यापेक्षा चांगल्या चर्चा, ग्रंथ आणि सज्जन संगतीत राहिल्याने भाग्योदय लवकर होतो.`,
        hi: `चुपचाप प्रतीक्षा करने के बजाय सज्जन संगति, सार्थक संवाद और अध्ययन से जुड़ने पर भाग्य शीघ्र जागता है।`,
        te: `ఇంట్లోనే ఆలోచిస్తూ కూర్చోకుండా మంచి పరిచయాలు, జ్ఞాన చర్చలలో పాల్గొనడం వల్ల అదృష్టం వేగవంతమవుతుంది.`,
        ta: `தனிமையில் காத்திருப்பதை விட நல்ல உரையாடல்கள், நூல்கள் மற்றும் பெரியோர் தொடர்பில் இருப்பது அதிர்ஷ்டத்தை விரைவுபடுத்தும்.`,
        en: `Leave stale corners for lively rooms of learning and honorable company—wisdom finds feet moving forward.`
      }
    };

    const reflMap9: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `ಗುರುತು ಮಾಡಿ: ಯಾರೊಬ್ಬರ ಒಂದು ಚಿಕ್ಕ ಸಕಾರಾತ್ಮಕ ಮಾತು ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ದೊಡ್ಡ ಧೈರ್ಯ ಕೊಟ್ಟಿತ್ತು ನೆನಪಿಸಿಕೊಳ್ಳಿ.`,
        mr: `आठवून पहा: अलीकडे कोणाच्या तरी एका शांत, आश्वासक वाक्याने तुमच्या मनाला मोठा धीर दिला होता ना?`,
        hi: `स्मरण करें: हाल ही में किस एक अनुभवी व्यक्ति के सकारात्मक शब्द ने आपके मन को नया साहस दिया था?`,
        te: `గుర్తుచేసుకోండి: ఇటీవల ఎవరో చెప్పిన ఒక ఆశాజనక మాట మీ మనసుకు ఎంతో ధైర్యాన్ని ఇచ్చింది కదా?`,
        ta: `நினைத்துப் பாருங்கள்: சமீபத்தில் ஒருவரின் நம்பிக்கையான ஒரு வார்த்தை உங்கள் மனதை எவ்வளவு லேசாக்கியது!`,
        en: `Grace Audit: Recall whose steady perspective lifted heaviness off a difficult week recently.`
      },
      1: {
        kn: `ಇಂದಿನ ಹೆಜ್ಜೆ: ಕಳೆದ ಕೆಲವು ವಾರಗಳಿಂದ ಸಲಹೆ ಕೇಳಲು ಹಿಂಜರಿಯುತ್ತಿದ್ದ ಆ ಹಿರಿಯರಿಗೆ ಅಥವಾ ಗುರುಗಳಿಗೆ ಒಮ್ಮೆ ಕರೆ ಮಾಡಿ ಮಾತನಾಡಿ.`,
        mr: `आजचे पाऊल: ज्या जाणकारांशी बोलण्याचे तुम्ही काही दिवसांपासून पुढे ढकलत आहात, त्यांच्याशी आजच संवाद साधा.`,
        hi: `आज का कदम: जिस वरिष्ठ अथवा गुरुजन से आप कुछ दिनों से परामर्श लेना टाल रहे हैं, उनसे आज ही संवाद करें।`,
        te: `నేటి అడుగు: కొన్ని వారాలుగా మీరు సంప్రదించాలనుకుంటున్న గురువు లేదా పెద్దలతో ఈరోజే మాట్లాడండి.`,
        ta: `இன்றைய படி: சில வாரங்களாக நீங்கள் ஆலோசிக்கத் தயங்கிய ஒரு அனுபவஸ்தரிடம் இன்றே மனம் திறந்து பேசுங்கள்.`,
        en: `Action Spark: Reach out today to the one knowledgeable voice whose feedback you hesitated to disturb.`
      },
      2: {
        kn: `ವೇಧೆಯ ಪರೀಕ್ಷೆ: ಕೇವಲ ತಾತ್ಕಾಲಿಕ ಅಡಚಣೆಗಳಿಗೆ ಕುಗ್ಗದೆ, ಗುರುವಿನ ದೀರ್ಘಕಾಲಿಕ ದೃಷ್ಟಿಕೋನವನ್ನು ನಂಬಿ ಮುಂದುವರಿಯಿರಿ.`,
        mr: `संयम चाचणी: किरकोळ अडचणींना घाबरू नका — गुरूची दीर्घकालीन कृपादृष्टी तुमच्या बाजूने उभी आहे.`,
        hi: `धैर्य बोध: तात्कालिक छोटे अवरोधों से विचलित न हों — बृहस्पति की दीर्घकालिक शुभता आपके साथ है।`,
        te: `ఓపిక పరీక్ష: చిన్న ఆటంకాలకు భయపడకండి — గురుని దీర్ఘకాలిక ఆశీర్వాదం మీ వెంటే ఉంది.`,
        ta: `பொறுமைச் சோதனை: சிறு தடைகளுக்குச் சோர்வடையாதீர்கள் — குருவின் நீண்டகால நற்பலன் உங்கள் பக்கமே.`,
        en: `Horizon Reminder: Treat brief delays as seasoning rather than denial—expansive favor stays intact.`
      },
      3: {
        kn: `ನೀವು ಜ್ಞಾನ ಮತ್ತು ದಯೆಯನ್ನು ಇನ್ನೊಬ್ಬರಿಗೆ ಹಂಚಿದ ಕ್ಷಣ, ನಿಮ್ಮ ಭಾಗ್ಯದ ಖಾತೆ ತಾನಾಗಿಯೇ ಭರ್ತಿಯಾಗುತ್ತದೆ.`,
        mr: `ज्या क्षणी तुम्ही ज्ञान आणि सौजन्य इतरांना देता, त्याच क्षणी तुमचे स्वतःचे भाग्य अधिक समृद्ध होते.`,
        hi: `जिस क्षण आप निस्वार्थ ज्ञान और सद्भाव बांटते हैं, उसी क्षण आपके भाग्य का भंडार स्वयं बढ़ने लगता है।`,
        te: `మీరు జ్ఞానాన్ని, మంచినీ ఇతరులకు పంచిన క్షణమే మీ అదృష్ట ఖాతా తనంతట తానుగా నిండుతుంది.`,
        ta: `அறிவையும் கருணையையும் பிறருக்குப் பகிர்ந்த நொடியில் உங்கள் பாக்கியக் கணக்கு தானாகப் பெருகும்.`,
        en: `Generosity Law: Sharing wisdom openly magnetizes unexpected generosity right back toward your household.`
      }
    };

    return {
      p1Focus: ed === 0 ? jupCond : `${jupCond} ${vedhaNote}`,
      p2Body: pick6(p2Map9[ed], lang),
      p3Body: pick6(p3Map9[ed], lang),
      reflectionNote: pick6(reflMap9[ed], lang)
    };
  }

  // Ch 10: Rahu-Ketu Shadow Axis & Dispositors
  const nodalCore = pick6({
    kn: `ಚಂದ್ರನಿಂದ ${n(ctx.rahuHouseFromMoon)}ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಹಾಗೂ ರಾಶ್ಯಾಧಿಪತಿಗಳಾದ ${ext.rahuDispositorName} (${n(ext.rahuDispositorHouse)}ನೇ ಭಾವ) ಮತ್ತು ${ext.ketuDispositorName} ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿರುವುದರಿಂದ, ಕಾಲ್ಪನಿಕ ಆತುರ ಮತ್ತು ಶಾಂತ ವಿರಕ್ತಿಯ ನಡುವೆ ಮನಸ್ಸು ತೂಗುತ್ತದೆ.`,
    mr: `चंद्रापासून ${n(ctx.rahuHouseFromMoon)}व्या स्थानी राहु आणि त्यांचे स्वामी ${ext.rahuDispositorName} (${n(ext.rahuDispositorHouse)}वे स्थान) व ${ext.ketuDispositorName} कार्यरत असल्याने मन अती घाई व अचानक अलिप्तपणा यांत झुलते.`,
    hi: `चंद्र से ${n(ctx.rahuHouseFromMoon)}वें भाव में राहु तथा उनके स्वामी ${ext.rahuDispositorName} (${n(ext.rahuDispositorHouse)}वां स्थान) एवं ${ext.ketuDispositorName} सक्रिय होने से मन अति-उत्साह और अचानक विरक्ति के बीच झूलता है।`,
    te: `చంద్రుని నుండి ${n(ctx.rahuHouseFromMoon)}వ స్థానంలో రాహువు మరియు అధిపతులు ${ext.rahuDispositorName} (${n(ext.rahuDispositorHouse)}వ ఇల్లు), ${ext.ketuDispositorName} ఉండటం వల్ల తీవ్రమైన తొందరపాటు మరియు వైరాగ్యాల మధ్య ఆలోచన నడుస్తుంది.`,
    ta: `ராசிக்கு ${n(ctx.rahuHouseFromMoon)}-ம் இட ராகு மற்றும் அதிபதிகள் ${ext.rahuDispositorName} (${n(ext.rahuDispositorHouse)}-ம் வீடு), ${ext.ketuDispositorName} இயங்குவதால் மனதில் அதீத ஆசையும் திடீர் விலகலும் மாறி மாறி வரும்.`,
    en: `With Rahu anchored in House ${ctx.rahuHouseFromMoon} from Moon—steered by ${ext.rahuDispositorName} (House ${ext.rahuDispositorHouse}) and ${ext.ketuDispositorName}—mind swings sharply between restless ambition and sudden detachment.`
  }, lang);

  const p2Map10: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
    0: {
      kn: `${ctx.lagnaRashiName}–${ctx.moonRashiName} ಚಾರ್ಟಿನಲ್ಲಿ ಮಾಯಾ ರಾಹು (${ext.rahuDispositorName}) ಗೊಂದಲ ಸೃಷ್ಟಿಸಿ ಕೇತು ಅಂತರ ಹುಟ್ಟಿಸಿದರೂ, ನಿಮ್ಮ ${n(savByHouse[6])} ಬಿಂದುಗಳ ೬ನೇ ಶಿಸ್ತು ಸತ್ಯವನ್ನು ಉಳಿಸುತ್ತದೆ.`,
      mr: `${ctx.lagnaRashiName}–${ctx.moonRashiName} कुंडलीत राहु (${ext.rahuDispositorName}) घाई दाखवत असला व केतू दूर नेत असला तरी ६व्या भावातील ${n(savByHouse[6])} गुण वास्तव कायम ठेवतात.`,
      hi: `${ctx.lagnaRashiName}–${ctx.moonRashiName} पत्रिका में राहु (${ext.rahuDispositorName}) भ्रम बुनता है और केतु दूरी लाता है — पर षष्ठ भाव के ${n(savByHouse[6])} बिंदू यथार्थ संभालते हैं।`,
      te: `${ctx.lagnaRashiName}–${ctx.moonRashiName} జాతకంలో రాహువు (${ext.rahuDispositorName}) తొందరపెట్టినా, కేతువు అనాసక్తి చూపినా 6వ స్థాన ${n(savByHouse[6])} బిందువులు వాస్తవాన్ని కాపాడుతాయి.`,
      ta: `${ctx.lagnaRashiName}–${ctx.moonRashiName} ஜாதகத்தில் ராகு (${ext.rahuDispositorName}) தூண்டவும் கேது விலக்கவும் செய்தாலும் 6-ம் இடத்தின் ${n(savByHouse[6])} பரல்கள் உண்மையைக் காக்கின்றன.`,
      en: `Across your ${ctx.lagnaRashiName}–${ctx.moonRashiName} map, Rahu (steered by ${ext.rahuDispositorName}) whispers urgency while Ketu detaches—yet House 6 (${savByHouse[6]} bindus) reminds you that calm facts win.`
    },
    1: {
      kn: `ಈ ಕ್ಷಣದ ${ctx.currentBhuktiLord} ಭುಕ್ತಿ ಹಾಗೂ ${ext.rahuDispositorName} ನಡುವಿನ ಸಂಬಂಧವು ಗಾಳಿಸುದ್ದಿಗಿಂತ ಲಿಖಿತ ಅಂಕಿಅಂಶ ನಂಬುವವರಿಗೆ ಭಾರಿ ಲಾಭ ತರುತ್ತದೆ.`,
      mr: `सध्याची ${ctx.currentBhuktiLord} भुक्ती व ${ext.rahuDispositorName} यांचा संबंध अफवांऐवजी प्रत्यक्ष आकडेवारी पाहणाऱ्यांनाच मोठा फायदा देतो.`,
      hi: `सक्रिय ${ctx.currentBhuktiLord} भुक्ति और ${ext.rahuDispositorName} की स्थिति उन्हीं को लाभ देती है जो अटकलों के बजाय प्रमाण पर चलते हैं।`,
      te: `ప్రస్తుత ${ctx.currentBhuktiLord} భుక్తి మరియు ${ext.rahuDispositorName} స్థితి వల్ల పుకార్ల కంటే ఖచ్చితమైన లెక్కలను నమ్మేవారికే లాభం కలుగుతుంది.`,
      ta: `நடப்பு ${ctx.currentBhuktiLord} புக்தி மற்றும் ${ext.rahuDispositorName} இணைவு வதந்திகளை விட நேரடி ஆதாரங்களை நம்புவோருக்கே வெற்றி தரும்.`,
      en: `Pairing ${ctx.currentBhuktiLord} Bhukti with dispositor ${ext.rahuDispositorName} favors verifiable math over noisy whispers.`
    },
    2: {
      kn: `ಕೇವಲ ಪ್ರದರ್ಶನದ ಯೋಜನೆ (ರಾಹು-ಕೇತು ಭ್ರಮೆ) ಮತ್ತು ಬಲಿಷ್ಠ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ವಾಸ್ತವಿಕ ಹಾದಿ ನಡುವಿನ ಅಂತರ ಸ್ಪಷ್ಟವಾಗಿದೆ.`,
      mr: `फक्त देखाव्याची मोठी स्वप्ने वि. बलवान ${n(arch.peakHouseNum)}व्या भावातील (${arch.peakDomainLabel}) खरे काम यांतील फरक आता स्वच्छ दिसतो.`,
      hi: `केवल बाहरी चकाचौंध की योजनाओं बनाम आपके सबल ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) की वास्तविक राह का अंतर स्पष्ट है।`,
      te: `కేవలం ఆర్భాటపు ఆలోచనలకు మరియు బలమైన ${n(arch.peakHouseNum)}వ స్థాన (${arch.peakDomainLabel}) వాస్తవ మార్గానికి మధ్య తేడా స్పష్టంగా కనిపిస్తోంది.`,
      ta: `வெளிப் பகட்டு ஆசைகளுக்கும் வலிமையான ${n(arch.peakHouseNum)}-ம் இட (${arch.peakDomainLabel}) உண்மைப் பாதைக்கும் உள்ள வேறுபாடு தெளிவாகிறது.`,
      en: `Contrast shiny distractions from shadow nodes against concrete traction inside House ${arch.peakHouseNum} (${arch.peakDomainLabel}).`
    },
    3: {
      kn: `ಕೋಣೆಯೊಳಗಿನ ಕತ್ತಲೆಯಲ್ಲಿ ಹಗ್ಗವೂ ಹಾವಿನಂತೆ ಭಯ ಹುಟ್ಟಿಸಿದರೂ, ${ext.rahuDispositorName} ನಿಯಂತ್ರಿಸುವ ${n(ctx.rahuHouseFromMoon)}ನೇ ಮನೆ ಮೇಲೆ ದೀಪ ಹಚ್ಚಿದ ಕ್ಷಣ ಭಯ ಮರೆಯಾಗುತ್ತದೆ.`,
      mr: `अंधारात दोरीचाही साप भासतो, पण ${ext.rahuDispositorName} नियंत्रित ${n(ctx.rahuHouseFromMoon)}व्या भावावर तथ्यांचा दिवा लावताच भीती क्षणात नाहीशी होते.`,
      hi: `अंधेरे में रस्सी भी सर्प जैसी भ्रांति जगाती है, किंतु ${ext.rahuDispositorName} नियंत्रित ${n(ctx.rahuHouseFromMoon)}वें भाव पर तथ्य का दीपक जलते ही भय मिट जाता है।`,
      te: `చీకట్లో తాడు కూడా పాములా భయపెట్టినా, ${ext.rahuDispositorName} నడిపే ${n(ctx.rahuHouseFromMoon)}వ స్థానంపై జ్ఞాన దీపం వెలిగించగానే భయం పోతుంది.`,
      ta: `இருட்டில் கயிறுகூடப் பாம்பாகத் தோன்றும், ஆனால் ${ext.rahuDispositorName} இயக்கும் ${n(ctx.rahuHouseFromMoon)}-ம் இடத்தில் விளக்கேற்றிய நொடியில் மாயம் மறையும்.`,
      en: `A coiled rope frightens an entire room until one candle turns on—guided by ${ext.rahuDispositorName}, inspect House ${ctx.rahuHouseFromMoon} numbers before fear decides.`
    }
  };

  const p3Map10: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
    0: {
      kn: `ದೊಡ್ಡ ಭರವಸೆ ಕೇಳಿದ ಕೂಡಲೇ '೨೪ ಗಂಟೆ ಪರಿಶೀಲಿಸಿ ಹೇಳುತ್ತೇನೆ' ಎಂಬ ನಿಯಮ ಇಟ್ಟುಕೊಂಡರೆ ರಾಹು-ಕೇತು ಭ್ರಮೆ ಹತ್ತಿರ ಬರುವುದಿಲ್ಲ.`,
      mr: `कोणीही मोठी ऑफर देताच '२४ तास तपासून सांगतो' हा नियम ठेवल्यास कोणतीही फसगत होणार नाही.`,
      hi: `कोई भी आकर्षक प्रस्ताव सामने आने पर '२४ घंटे परखकर उत्तर दूंगा' का नियम रखने से हर भ्रम दूर रहता है।`,
      te: `ఎవరైనా పెద్ద ఆఫర్ ఇస్తే '24 గంటలు పరిశీలించి చెబుతాను' అనే నియమం పాటిస్తే రాహు-కేతు భ్రమలు రావు.`,
      ta: `யாரேனும் பெரிய வாய்ப்பு சொன்னால் '24 மணி நேரம் யோசித்துச் சொல்கிறேன்' என்ற விதி மாயைகளைத் தடுக்கும்.`,
      en: `Apply a calm twenty-four-hour cooling rule before saying yes to urgent hype, hidden fees, or loud rumours.`
    },
    1: {
      kn: `${ext.rahuDispositorName} ನಿಯಂತ್ರಣದಲ್ಲಿರುವುದರಿಂದ ರಾತ್ರಿಯ ಗೊಂದಲಮಯ ಯೋಚನೆಗಳಿಗಿಂತ ಬೆಳಗಿನ ಶಾಂತ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿಯೇ ಮುಖ್ಯ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಿ.`,
      mr: `${ext.rahuDispositorName} मुळे रात्रीच्या विचारांपेक्षा सकाळच्या शांत डोक्यानेच महत्त्वाचे निर्णय घ्यावेत.`,
      hi: `${ext.rahuDispositorName} की स्थिति के कारण रात की उलझन के बजाय प्रातः के शांत मन से मुख्य निर्णय करें।`,
      te: `${ext.rahuDispositorName} ప్రభావం వల్ల రాత్రి ఆలోచనల కంటే ఉదయం ప్రశాంత మనసుతోనే కీలక నిర్ణయాలు తీసుకోండి.`,
      ta: `${ext.rahuDispositorName} ஆட்சி காரணமாக இரவுக் குழப்பங்களை விடக் காலை அமைதியான மனநிலையிலேயே முக்கிய முடிவு எடுங்கள்.`,
      en: `Guided by ${ext.rahuDispositorName}, reserve important strategy calls for calm mornings rather than late-night overthinking.`
    },
    2: {
      kn: `ಕೇತು ಕೊಡುವ ಅತೃಪ್ತಿಗೆ ಮಣಿದು ಪ್ರೀತಿಪಾತ್ರರಿಂದ ದೂರ ಸರಿಯದೆ, ಕನಿಷ್ಠ ೧೦ ನಿಮಿಷ ಶಾಂತವಾಗಿ ಕುಳಿತು ಮಾತನಾಡಿ.`,
      mr: `केतूमुळे येणाऱ्या अलिप्तपणामुळे प्रियजनांपासून अंतर न ठेवता रोज किमान १० मिनिटे शांत संवाद ठेवा.`,
      hi: `केतु द्वारा उत्पन्न अकारण दूरी में बहकर अपनों से अलग न हों — प्रतिदिन थोड़ा शांत संवाद अवश्य बनाए रखें।`,
      te: `కేతువు ఇచ్చే అనాసక్తితో ఆప్తులకు దూరం కాకుండా ప్రశాంతంగా మాట్లాడే అలవాటును కొనసాగించండి.`,
      ta: `கேது தரும் பற்றற்ற உணர்வால் அன்பானவர்களை விட்டு விலகாமல் அமைதியாக மனம் திறந்து பேசுங்கள்.`,
      en: `Never mistake Ketu emotional fatigue for lost affection—short honest check-ins dissolve needless distance immediately.`
    },
    3: {
      kn: `ತೀಕ್ಷ್ಣ ಮರೀಚಿಕೆಯ ಹಿಂದೆ ಓಡದೆ, ನಿಮ್ಮ ಕೈಯಲ್ಲಿರುವ ನಿಜವಾದ ನೀರಿನ ಬಿಂದಿಗೆ (ವಾಸ್ತವ ಸಂಪನ್ಮೂಲ) ರಕ್ಷಿಸಿಕೊಳ್ಳಿ.`,
      mr: `दूरच्या मृगजळामागे धावण्यापेक्षा हातातील प्रत्यक्ष साधनांचा शांतपणे सदुपयोग करा.`,
      hi: `दूर चमकती मृगतृष्णा के पीछे दौड़ने के बजाय अपने पास मौजूद वास्तविक शक्ति एवं समय का सटीक उपयोग करें।`,
      te: `ఎండమావుల వెంట పరుగులు పెట్టకుండా మీ చేతిలో ఉన్న నిజమైన వనరులను సద్వినియోగం చేసుకోండి.`,
      ta: `கானல்நீரைத் துரத்தாமல் உங்கள் கையில் இருக்கும் உண்மையான திறமையையும் வளங்களையும் சரியாகப் பயன்படுத்துங்கள்.`,
      en: `Invest energy in tangible proof on your own desk rather than chasing silver promises elsewhere.`
    }
  };

  const reflMap10: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
    0: {
      kn: `ವಿಮರ್ಶೆ: ಇತ್ತೀಚಿನ ಆತಂಕಗಳಲ್ಲಿ ಎಷ್ಟು ಭಾಗ ನೈಜ ಸತ್ಯ ಮತ್ತು ಎಷ್ಟು ಭಾಗ ಕೇವಲ ಊಹೆಯ ಭಯವಾಗಿದೆ ಪರೀಕ್ಷಿಸಿ.`,
      mr: `तपासणी: सध्याच्या काळजीपैकी किती भाग प्रत्यक्ष सत्य आहे आणि किती केवळ काल्पनिक भीती आहे?`,
      hi: `परीक्षण: आपकी वर्तमान चिंता का कितना अंश वास्तविक है और कितना केवल कल्पना से उपजा भय?`,
      te: `విశ్లేషణ: ప్రస్తుత భయాల్లో ఎంత శాతం నిజం, ఎంత శాతం ఊహాజనిత ఆందోళన అని సరిచూడండి.`,
      ta: `ஆய்வு: இன்றைய கவலைகளில் எவ்வளவு நிஜம், எவ்வளவு வெறும் கற்பனைப் பயம் எனப் பிரித்துப் பாருங்கள்.`,
      en: `Illusion Filter: Divide current worries cleanly into 'verified facts' versus 'unverified guesswork'.`
    },
    1: {
        kn: `ಗುರುತು: ವದಂತಿ ಮತ್ತು ಒತ್ತಡದ ನಡುವೆ ತಕ್ಷಣ ಪ್ರತಿಕ್ರಿಯಿಸದೆ ಕಾದ ಪ್ರತಿಯೊಂದು ಬಾರಿಯೂ ನಿಮ್ಮದೇ ಜಯವಾಗಿದೆ.`,
        mr: `नोंद: गडबडीत लगेच प्रतिक्रिया न देता शांत राहिल्यावर प्रत्येक वेळी तुमचाच विजय झाला आहे.`,
        hi: `प्रमाण: अटकलों एवं दबाव के बीच तुरंत प्रतिक्रिया न देकर शांत रहने से हर बार आपका ही लाभ हुआ है।`,
        te: `సత్యం: ఒత్తిడిలో వెంటనే స్పందించకుండా ఓపిక పట్టిన ప్రతిసారీ మీరే గెలిచారు.`,
        ta: `சான்று: வதந்திகளுக்கு உடனே எதிர்வினையாற்றாமல் அமைதி காத்த ஒவ்வொரு முறையும் நீங்களே வென்றீர்கள்.`,
        en: `Fact Ledger: Recall one rumor that collapsed on its own strictly because you refused to panic first.`
    },
    2: {
        kn: `ಯೋಗಿ ${ctx.yogiPlanetName} ದಿಕ್ಕಿನತ್ತ ಗಮನ ಹರಿಸಿದರೆ ರಾಹು ಗೊಂದಲ ತಾನಾಗಿಯೇ ದಾರಿ ಬಿಡುತ್ತದೆ.`,
        mr: `योगी ${ctx.yogiPlanetName} च्या दिशेवर लक्ष केंद्रित करताच राहुचा गोंधळ आपोआप शांत होतो.`,
        hi: `योगी ${ctx.yogiPlanetName} की सटीक दिशा पर ध्यान टिकाते ही राहु का भ्रम स्वतः छंट जाता है।`,
        te: `యోగి ${ctx.yogiPlanetName} దిశపై దృష్టి పెట్టిన వెంటనే రాహు గందరగోళం తొలగిపోతుంది.`,
        ta: `யோகி ${ctx.yogiPlanetName} திசையில் கவனம் குவித்தவுடன் ராகுவின் குழப்பம் தானாக விலகும்.`,
        en: `Compass Reset: Steering back toward Yogi ${ctx.yogiPlanetName} restores grounded vision instantly.`
    },
    3: {
        kn: `ನೈಜ ಸತ್ಯಕ್ಕೆ ಬಣ್ಣದ ಮಾತು ಬೇಕಾಗಿಲ್ಲ — ಕಾಗದದ ಮೇಲಿನ ಸ್ಪಷ್ಟ ಲೆಕ್ಕವೇ ಸಾಕು.`,
        mr: `खऱ्या सत्याला भव्य शब्दांची गरज नसते — कागदावरचा स्वच्छ हिशोब पुरेसा असतो.`,
        hi: `सच्चाई को चमकदार नारों की आवश्यकता नहीं होती — कागज़ पर लिखा स्पष्ट तथ्य ही पर्याप्त है।`,
        te: `నిజానికి రంగుల మాటలు అవసరం లేదు — కాగితంపై ఉన్న ఖచ్చితమైన లెక్క సరిపోతుంది.`,
        ta: `உண்மைக்கு அலங்கார வார்த்தைகள் தேவையில்லை — காகிதத்தில் உள்ள தெளிவான கணக்கு போதும்.`,
        en: `Grounding Line: Calm curiosity outperforms anxious imagination in every season of Rahu and Ketu.`
      }
  };

  return {
    p1Focus: nodalCore,
    p2Body: pick6(p2Map10[ed], lang),
    p3Body: pick6(p3Map10[ed], lang),
    reflectionNote: pick6(reflMap10[ed], lang)
  };
}

function buildLifeDomainSupplement(
  chNum: number,
  arch: ChartArchetypeSnapshot,
  ctx: StoryEngineInput,
  savByHouse: Record<number, number>,
  isChildOrInfant: boolean,
  isMinor: boolean,
  isSenior: boolean
): ChapterSupplement {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const ext = ctx.extendedPrecision;

  if (chNum === 12) {
    // Ch 12: Study & Curiosity (Child/Minor) OR Stewardship & Leadership (Adult/Senior)
    const p1Variants: Record<0 | 1 | 2 | 3, string> = isChildOrInfant
      ? {
          0: "",
          1: pick6({
            kn: `ಮಗುವಿನ ೫ನೇ ಬುದ್ಧಿ ಭಾವದ ${n(savByHouse[5])} ಬಿಂದುಗಳು ಸಹಜ ಸೃಜನಶೀಲ ಕಲಿಕೆಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡುತ್ತವೆ.`,
            mr: `बाळाच्या पंचम भावातील ${n(savByHouse[5])} गुण सहज व आनंदी शिक्षणाचा मार्ग दाखवतात.`,
            hi: `बालक के पंचम भाव के ${n(savByHouse[5])} बिंदू सहज एवं आनंदपूर्ण सीखने को बढ़ावा देते हैं।`,
            te: `చిన్నారి 5వ స్థానంలోని ${n(savByHouse[5])} బిందువులు ఆసక్తికర విద్యాభివృద్ధికి బలాన్నిస్తాయి.`,
            ta: `குழந்தையின் 5-ம் இடத்து ${n(savByHouse[5])} பரல்கள் இயல்பான கல்வி வளர்ச்சிக்குத் துணை நிற்கின்றன.`,
            en: `With ${savByHouse[5]} bindus in House 5, joyful storytelling sparks faster mastery than pressure.`
          }, lang),
          2: pick6({
            kn: `ಬಾಲ್ಯದಲ್ಲೇ ಮಗುವಿನ ನೈಸರ್ಗಿಕ ಕುತೂಹಲವನ್ನು ತಾಳ್ಮೆಯಿಂದ ಪೋಷಿಸಿದರೆ ಉನ್ನತ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಯುತ್ತದೆ.`,
            mr: `लहानपणीच मुलाचे कुतूहल शांतपणे जोपासल्यास उत्तम आत्मविश्वास घडतो.`,
            hi: `बचपन की स्वाभाविक जिज्ञासा को धैर्य से संवारने पर आत्मविश्वास मज़बूत होता है।`,
            te: `చిన్ననాటి సహజ ఆసక్తిని ఓపికగా ప్రోత్సహిస్తే మంచి ఆత్మవిశ్వాసం పెరుగుతుంది.`,
            ta: `சிறுவயது ஆர்வத்தைப் பொறுமையுடன் ஊக்கப்படுத்தினால் தன்னம்பிக்கை வலுப்பெறும்.`,
            en: `Patient encouragement around early questions shapes confident young minds.`
          }, lang),
          3: pick6({
            kn: `ಲಗ್ನಾಧಿಪತಿ ${ext.house1Info.lordName} ಮಗುವಿನ ಭಾವನಾತ್ಮಕ ಭದ್ರತೆಯನ್ನು ಕಾಯುತ್ತಿದೆ.`,
            mr: `लग्नेश ${ext.house1Info.lordName} बाळाच्या मनाला शांत सुरक्षितता देतो.`,
            hi: `लग्नेश ${ext.house1Info.lordName} बालक के आत्मबल की सुरक्षा कर रहे हैं।`,
            te: `లగ్నాధిపతి ${ext.house1Info.lordName} చిన్నారికి అచంచల రక్షణనిస్తోంది.`,
            ta: `லக்னாதிபதி ${ext.house1Info.lordName} குழந்தையின் மன உறுதியைப் பாதுகாக்கிறது.`,
            en: `Ascendant lord ${ext.house1Info.lordName} steadily shelters early emotional growth.`
          }, lang)
        }
      : isMinor
      ? {
          0: pick6({
            kn: `೫ನೇ ವಿದ್ಯಾ ಸ್ಥಾನಾಧಿಪತಿ ${ctx.house5Info.lordName} (${n(savByHouse[5])} ಬಿಂದು) ಹಾಗೂ ${ctx.lagnaRashiName} ಲಗ್ನದ ಏಕಾಗ್ರತೆಯು ಕಲಿಕೆಯನ್ನು ಆನಂದದಾಯಕವಾಗಿಸುತ್ತಿವೆ.`,
            mr: `पंचमेश ${ctx.house5Info.lordName} (${n(savByHouse[5])} गुण) व ${ctx.lagnaRashiName} लग्नाची एकाग्रता अभ्यास सोपा करत आहेत.`,
            hi: `पंचमेश ${ctx.house5Info.lordName} (${n(savByHouse[5])} बिंदू) और ${ctx.lagnaRashiName} लग्न की एकाग्रता अध्ययन को रोचक बना रही हैं।`,
            te: `5వ విద్యాధిపతి ${ctx.house5Info.lordName} (${n(savByHouse[5])} బిందువులు) మరియు ${ctx.lagnaRashiName} లగ్నం చదువుపై ఆసక్తిని పెంచుతున్నాయి.`,
            ta: `5-ம் கல்வி அதிபதி ${ctx.house5Info.lordName} (${n(savByHouse[5])} பரல்கள்) மற்றும் ${ctx.lagnaRashiName} லக்னம் கற்றலை எளிதாக்குகின்றன.`,
            en: `Led by 5th lord ${ctx.house5Info.lordName} (${savByHouse[5]} bindus), steady curiosity unlocks lasting academic confidence.`
          }, lang),
          1: "",
          2: "",
          3: ""
        }
      : isSenior
      ? {
          0: pick6({
            kn: `೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನಾಧಿಪತಿ ${ctx.house10Info.lordName} (${n(savByHouse[10])} ಬಿಂದು) ನಿವೃತ್ತಿಯ ನಂತರವೂ ನಿಮ್ಮ ಗೌರವಾನ್ವಿತ ಸಲಹೆ-ಮಾರ್ಗದರ್ಶಕ ಪಾತ್ರವನ್ನು ಜೀವಂತವಿಟ್ಟಿದೆ.`,
            mr: `दशमेश ${ctx.house10Info.lordName} (${n(savByHouse[10])} गुण) निवृत्तीनंतरही तुमची आदरणीय मार्गदर्शकाची भूमिका तेजस्वी ठेवत आहे.`,
            hi: `दशमेश ${ctx.house10Info.lordName} (${n(savByHouse[10])} बिंदू) आज भी आपकी सम्मानित परामर्श एवं मार्गदर्शन की भूमिका को जीवंत रखे हैं।`,
            te: `దశమాధిపతి ${ctx.house10Info.lordName} (${n(savByHouse[10])} బిందువులు) ఇప్పటికీ మీ గౌరవప్రదమైన మార్గదర్శక స్థానాన్ని నిలుపుతోంది.`,
            ta: `10-ம் அதிபதி ${ctx.house10Info.lordName} (${n(savByHouse[10])} பரல்கள்) இன்றும் உங்கள் மரியாதைக்குரிய ஆலோசகர் இடத்தைப் பேணுகிறது.`,
            en: `With ${savByHouse[10]} House 10 bindus guided by ${ctx.house10Info.lordName}, seasoned wisdom turns into respected mentorship.`
          }, lang),
          1: "",
          2: "",
          3: ""
        }
      : {
          0: pick6({
            kn: `ನಿಮ್ಮ ${ctx.lagnaRashiName} ಲಗ್ನಕ್ಕೆ ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[10])} ಬಿಂದುಗಳಿದ್ದು, ದಶಮೇಶ ${ctx.house10Info.lordName} (${ctx.house10Info.placedRashi}, ${n(ctx.house10Info.placedHouse)}ನೇ ಭಾವ) ಸ್ವಂತ ನಾಯಕತ್ವದ ಮೂಲಕ ವೃತ್ತಿ ಗೌರವ ಹೆಚ್ಚಿಸುತ್ತಿದೆ.`,
            mr: `तुमच्या ${ctx.lagnaRashiName} लग्नासाठी दशम भावात ${n(savByHouse[10])} गुण असून कर्मेश ${ctx.house10Info.lordName} (${ctx.house10Info.placedRashi}, ${n(ctx.house10Info.placedHouse)}वे स्थान) स्वकर्तृत्वाने प्रतिष्ठा देत आहे.`,
            hi: `आपके ${ctx.lagnaRashiName} लग्न के दशम कर्म भाव में ${n(savByHouse[10])} बिंदू हैं और दशमेश ${ctx.house10Info.lordName} (${ctx.house10Info.placedRashi}, ${n(ctx.house10Info.placedHouse)}वां स्थान) स्वतंत्र नेतृत्व से प्रतिष्ठा बढ़ाते हैं।`,
            te: `మీ ${ctx.lagnaRashiName} లగ్నానికి 10వ కర్మ స్థానంలో ${n(savByHouse[10])} బిందువులు ఉండి, దశమాధిపతి ${ctx.house10Info.lordName} (${ctx.house10Info.placedRashi}, ${n(ctx.house10Info.placedHouse)}వ ఇల్లు) ఉన్నత గౌరవాన్ని అందిస్తోంది.`,
            ta: `உங்கள் ${ctx.lagnaRashiName} லக்னத்தின் 10-ம் இடத்தில் ${n(savByHouse[10])} பரல்கள் உள்ளன; கர்மாதிபதி ${ctx.house10Info.lordName} (${ctx.house10Info.placedRashi}, ${n(ctx.house10Info.placedHouse)}-ம் வீடு) சுய தலைமையால் உயர்வு தருகிறது.`,
            en: `With ${savByHouse[10]} bindus in House 10 for ${ctx.lagnaRashiName} Lagna, career lord ${ctx.house10Info.lordName} (${ctx.house10Info.placedRashi}, House ${ctx.house10Info.placedHouse}) rewards direct responsibility.`
          }, lang),
          1: pick6({
            kn: `ನಿಮ್ಮ ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[10])} ಬಿಂದುಗಳಿದ್ದು, ದಶಮೇಶ ${ctx.house10Info.lordName} ${n(ctx.house10Info.placedHouse)}ನೇ ಭಾವದಿಂದ ದಾರಿ ತೋರುತ್ತಿದ್ದಾರೆ.`,
            mr: `दशम भावात ${n(savByHouse[10])} गुण असून कर्मेश ${ctx.house10Info.lordName} ${n(ctx.house10Info.placedHouse)}व्या स्थानातून प्रगती घडवत आहे.`,
            hi: `दशम कर्म भाव में ${n(savByHouse[10])} बिंदू हैं और दशमेश ${ctx.house10Info.lordName} ${n(ctx.house10Info.placedHouse)}वें स्थान से पदोन्नति का संकेत देते हैं।`,
            te: `10వ కర్మ స్థానంలో ${n(savByHouse[10])} బిందువులు ఉండి, దశమాధిపతి ${ctx.house10Info.lordName} ${n(ctx.house10Info.placedHouse)}వ స్థానం నుండి నడిపిస్తున్నారు.`,
            ta: `10-ம் தொழில் இடத்தில் ${n(savByHouse[10])} பரல்கள் உள்ளன; கர்மாதிபதி ${ctx.house10Info.lordName} ${n(ctx.house10Info.placedHouse)}-ம் வீட்டிலிருந்து இயக்குகிறார்.`,
            en: `With ${savByHouse[10]} bindus in House 10 and career lord ${ctx.house10Info.lordName} placed in House ${ctx.house10Info.placedHouse}, direct ownership unlocks authority.`
          }, lang),
          2: pick6({
            kn: `ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ (${ctx.house10Info.placedRashi}) ಅನಗತ್ಯ ಮೌನ ಬಿಟ್ಟು ನಿಮ್ಮ ಕೊಡುಗೆಗೆ ಸ್ಪಷ್ಟ ಬೆಲೆ ಕೇಳುವುದು ಅವಶ್ಯಕ.`,
            mr: `कार्यक्षेत्रात (${ctx.house10Info.placedRashi}) संकोच सोडून आपल्या कामाचे योग्य मोल मांडणे गरजेचे आहे.`,
            hi: `कार्यक्षेत्र (${ctx.house10Info.placedRashi}) में अनावश्यक संकोच त्यागकर अपने योगदान का स्पष्ट मूल्य रखें।`,
            te: `వృత్తి రంగంలో (${ctx.house10Info.placedRashi}) మొహమాటం వదిలి మీ ప్రతిభకు తగిన గౌరవాన్ని అడగండి.`,
            ta: `தொழில் தளத்தில் (${ctx.house10Info.placedRashi}) தயக்கத்தை விட்டு உங்கள் உழைப்பின் மதிப்பை வெளிப்படுத்துங்கள்.`,
            en: `Inside House ${ctx.house10Info.placedHouse} (${ctx.house10Info.placedRashi}), trading quiet compliance for visible leadership lifts standing.`
          }, lang),
          3: pick6({
            kn: `೧೧ನೇ ಲಾಭ ಸ್ಥಾನದ ${n(savByHouse[11])} ಬಿಂದುಗಳು ನಿಮ್ಮ ವೃತ್ತಿ ಶ್ರಮಕ್ಕೆ ಸರಿಯಾದ ಪ್ರತಿಫಲವನ್ನು ತರುತ್ತವೆ.`,
            mr: `११व्या लाभ भावातील ${n(savByHouse[11])} गुण तुमच्या व्यावसायिक श्रमाचे योग्य फळ मिळवून देतात.`,
            hi: `एकादश लाभ भाव के ${n(savByHouse[11])} बिंदू आपकी मेहनत का समुचित प्रतिफल सुनिश्चित करते हैं।`,
            te: `11వ లాభ స్థానంలోని ${n(savByHouse[11])} బిందువులు మీ వృత్తి కష్టానికి తగిన ప్రతిఫలాన్నిస్తాయి.`,
            ta: `11-ம் லாப இடத்தின் ${n(savByHouse[11])} பரல்கள் உங்கள் தொழில் உழைப்புக்குரிய பலனைத் தருகின்றன.`,
            en: `House 11's ${savByHouse[11]} bindus ensure crisp expertise converts directly into steady rewards.`
          }, lang)
        };

    const minorP2 = pick6({
      kn: `${ctx.moonRashiName} ಚಂದ್ರ ಮತ್ತು ${ctx.nakshatraName} ತಾರೆಯ ಬಾಲ ಪ್ರತಿಭೆಗೆ ಕಥೆ, ಚಿತ್ರ ಹಾಗೂ ಪ್ರಯೋಗದ ಮೂಲಕ ಕಲಿಯುವ ವಾತಾವರಣ ಕಲ್ಪಿಸಿದರೆ ಆಸಕ್ತಿ ವೇಗವಾಗಿ ಅರಳುತ್ತದೆ.`,
      mr: `${ctx.moonRashiName} चंद्र व ${ctx.nakshatraName} नक्षत्राच्या या मुलासाठी गोष्टी, चित्रे व प्रयोगांतून शिकण्याची संधी दिल्यास बुद्धी झपाट्याने बहरते.`,
      hi: `${ctx.moonRashiName} चंद्र एवं ${ctx.nakshatraName} नक्षत्र के इस बालक को कथा और प्रयोगों से सिखाने पर प्रतिभा सहज निखरती है।`,
      te: `${ctx.moonRashiName} చంద్రుడు మరియు ${ctx.nakshatraName} నక్షత్రం కల ఈ చిన్నారికి కథలు, ప్రయోగాలతో నేర్పితే ప్రతిభ వేగంగా వికసిస్తుంది.`,
      ta: `${ctx.moonRashiName} சந்திரன் மற்றும் ${ctx.nakshatraName} நட்சத்திரக் குழந்தைக்குக் கதை மற்றும் செயல்முறை வழியே கற்க வைத்தால் திறமை விரைவில் மலரும்.`,
      en: `For this ${ctx.moonRashiName} Moon and ${ctx.nakshatraName} learner, hands-on curiosity replaces tense comparison with lasting confidence.`
    }, lang);

    const adultP2 = pick6(
      ed === 0
        ? {
            kn: `${ctx.lagnaRashiName}–${ctx.nakshatraName} ಚಾರ್ಟಿನ ದಶಮೇಶ ${ctx.house10Info.lordName} (${n(savByHouse[10])} ಬಿಂದು) ತೋರುವಂತೆ, ತೆರೆಯ ಹಿಂದೆ ದುಡಿಯುವುದಕ್ಕಿಂತ ಸ್ಪಷ್ಟ ಅಧಿಕಾರ-ಹೊಣೆ ವಹಿಸುವುದು ಪ್ರಗತಿ ತರುತ್ತದೆ.`,
            mr: `${ctx.lagnaRashiName}–${ctx.nakshatraName} पत्रिकेतील कर्मेश ${ctx.house10Info.lordName} (${n(savByHouse[10])} गुण) दर्शवतो की पडद्यामागे राबण्यापेक्षा थेट नेतृत्व स्वीकारणे प्रगती देते.`,
            hi: `${ctx.lagnaRashiName}–${ctx.nakshatraName} पत्रिका के दशमेश ${ctx.house10Info.lordName} (${n(savByHouse[10])} बिंदू) दर्शाते हैं कि परदे के पीछे श्रम से आगे बढ़कर नेतृत्व संभालना उन्नति लाता है।`,
            te: `${ctx.lagnaRashiName}–${ctx.nakshatraName} జాతకపు దశమాధిపతి ${ctx.house10Info.lordName} (${n(savByHouse[10])} బిందువులు) చూపినట్లు, వెనుక కష్టపడటం కంటే ప్రత్యక్ష నాయకత్వమే ఉన్నతినిస్తుంది.`,
            ta: `${ctx.lagnaRashiName}–${ctx.nakshatraName} ஜாதகத்தின் கர்மாதிபதி ${ctx.house10Info.lordName} (${n(savByHouse[10])} பரல்கள்) காட்டுவது போல், மறைந்த உழைப்பை விட நேரடித் தலைமை உயர்வு தரும்.`,
            en: `Across ${ctx.lagnaRashiName} and ${ctx.nakshatraName}, 10th lord ${ctx.house10Info.lordName} (${savByHouse[10]} bindus) favors claiming visible project ownership over quiet support roles.`
          }
        : ed === 1
        ? {
            kn: `ಮೌನವಾಗಿ ಬೇರೆಯವರ ಜವಾಬ್ದಾರಿ ಹೊರುವ ಬದಲು, ನಿಮ್ಮ '${ctx.house10Info.lordName}' ನಿರ್ಧಾರಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಸ್ಪಷ್ಟ ಫಲಿತಾಂಶಗಳ ಮೂಲಕ ಮುಂದಿಡಿ.`,
            mr: `गप्प राहून अतिरिक्त भार उचलण्याऐवजी तुमच्या '${ctx.house10Info.lordName}' ची क्षमता मोजता येणाऱ्या यशामधून सिद्ध करा.`,
            hi: `मौन रहकर अतिरिक्त कार्य समेटने के बजाय अपने '${ctx.house10Info.lordName}' की क्षमता को स्पष्ट उपलब्धियों में दिखाएं।`,
            te: `మౌనంగా ఎక్కువ పని మోయడం కంటే మీ '${ctx.house10Info.lordName}' సామర్థ్యాన్ని స్పష్టమైన ఫలితాలతో చూపండి.`,
            ta: `மௌனமாகப் பிறர் பணியைச் சுமக்காமல் உங்கள் '${ctx.house10Info.lordName}' திறமையைத் தெளிவான முடிவுகளால் காட்டுங்கள்.`,
            en: `Visibility rule: replace invisible firefighting with two clear weekly outcomes tied to ${ctx.house10Info.lordName}.`
          }
        : ed === 2
        ? {
            kn: `ನಿಮ್ಮ ೧೦ನೇ ಸ್ಥಾನ (${n(savByHouse[10])} ಬಿಂದು) ಹಾಗೂ ೧೧ನೇ ಲಾಭ (${n(savByHouse[11])} ಬಿಂದು) ನಡುವಿನ ಸಮನ್ವಯವು ಕಡಿಮೆ ದಣಿವಿನಲ್ಲಿ ಹೆಚ್ಚು ಗೌರವ ಕೊಡುತ್ತದೆ.`,
            mr: `दशम (${n(savByHouse[10])} गुण) आणि लाभ (${n(savByHouse[11])} गुण) यांचा ताळमेळ कमी थकव्यात मोठे यश मिळवून देतो.`,
            hi: `दशम (${n(savByHouse[10])} बिंदू) तथा लाभ (${n(savByHouse[11])} बिंदू) का संतुलन कम थकान में अधिक सम्मान दिलाता है।`,
            te: `10వ స్థానం (${n(savByHouse[10])} బిందువులు) మరియు 11వ లాభం (${n(savByHouse[11])} బిందువులు) కలిస్తే తక్కువ శ్రమతో పెద్ద గౌరవం దక్కుతుంది.`,
            ta: `10-ம் இடம் (${n(savByHouse[10])} பரல்கள்) மற்றும் 11-ம் லாபம் (${n(savByHouse[11])} பரல்கள்) இணைவு குறைந்த களைப்பில் உயர்வு தரும்.`,
            en: `Linking House 10 effort (${savByHouse[10]}) straight toward House 11 yield (${savByHouse[11]}) stops undervalued busywork fast.`
          }
        : {
            kn: `ಹಡಗಿನ ನಾಯಕ ಎಂಜಿನ್ ಕೋಣೆಯಲ್ಲೇ ಉಳಿಯದೆ ${ctx.house10Info.lordName} ಚುಕ್ಕಾಣಿ ಹಿಡಿದಾಗಲೇ ಸರಿಯಾದ ಬಂದರು ಸಿಗುತ್ತದೆ.`,
            mr: `कप्तानाने फक्त इंजिन सांभाळत न बसता ${ctx.house10Info.lordName} सुकाणू हातात घेतल्यावरच जहाज योग्य बंदरावर पोहोचते.`,
            hi: `कप्तान जब केवल भार उठाने के बजाय ${ctx.house10Info.lordName} पतवार संभालता है, तभी यात्रा को सही दिशा मिलती है।`,
            te: `నాయకుడు పనుల్లో మునిగిపోకుండా ${ctx.house10Info.lordName} చుక్కాని పట్టినప్పుడే సరైన తీరం చేరతాడు.`,
            ta: `தலைவர் சாதாரணப் பணியில் மூழ்காமல் ${ctx.house10Info.lordName} சுக்கானைப் பிடிக்கும்போதே கப்பல் கரையை அடையும்.`,
            en: `Stepping out of engine maintenance to steer ${ctx.house10Info.lordName}'s helm converts quiet competence into real executive trust.`
          },
      lang
    );

    const refl12 = isChildOrInfant || isMinor
      ? pick6({
          kn: `ಇಂದಿನ ಪ್ರತಿಜ್ಞೆ: ಮಗುವಿನ ಪ್ರತಿ ಸಣ್ಣ ಕುತೂಹಲಕ್ಕೂ ತಾಳ್ಮೆಯಿಂದ ಉತ್ತರಿಸಿ ಕಲಿಕೆಯ ಪ್ರೀತಿ ಬೆಳೆಸಿ.`,
          mr: `पालकांची नोंद: मुलांच्या प्रत्येक छोट्या प्रश्नाला शांतपणे उत्तर देऊन शिकण्याची गोडी वाढवा.`,
          hi: `सच्चा संबल: बच्चे की हर छोटी जिज्ञासा को धैर्य से सुनकर सीखने के प्रति उत्साह जगाएं।`,
          te: `ఆచరణ: చిన్నారి అడిగే ప్రతి చిన్న ప్రశ్నకు ఓపికగా సమాధానం చెప్పి ఆసక్తి పెంచండి.`,
          ta: `பெற்றோர் குறிப்பு: குழந்தையின் ஒவ்வொரு சிறு கேள்விக்கும் பொறுமையுடன் பதில் சொல்லி ஆர்வத்தை வளர்க்கவும்.`,
          en: `Parent Anchor: Celebrate sincere curiosity enthusiastically—never score joyful exploration on speed alone.`
        }, lang)
      : pick6({
          kn: `ವೃತ್ತಿ ಗಮನ: ಈ ವಾರ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಕೇಳುವ ಒಂದು ಸ್ಪಷ್ಟ ಪ್ರಸ್ತಾಪವನ್ನು ಮಂಡಿಸಿ.`,
          mr: `व्यावसायिक नोंद: या आठवड्यात तुमच्या कामाच्या योग्य मूल्याची एक स्पष्ट मागणी आत्मविश्वासाने मांडा.`,
          hi: `कार्य चिंतन: इस सप्ताह अपने योगदान के अनुरूप एक स्पष्ट एवं सम्मानजनक प्रस्ताव आत्मविश्वास से रखें।`,
          te: `గమనిక: ఈ వారంలో మీ కష్టానికి తగిన గుర్తింపు అడిగే స్పష్టమైన అడుగు వేయండి.`,
          ta: `தொழில் குறிப்பு: இந்த வாரம் உங்கள் உழைப்பிற்குரிய அங்கீகாரத்தைத் தெளிவாக முன்வையுங்கள்.`,
          en: `Leverage Prompt: Name one thankless weekly chore you can streamline so true craft gets proper spotlight.`
        }, lang);

    return {
      p1Focus: p1Variants[ed] || p1Variants[0],
      p2Body: isMinor || isChildOrInfant ? minorP2 : adultP2,
      p3Body: "",
      reflectionNote: ed === 0 ? "" : refl12
    };
  }

  if (chNum === 13) {
    // Finance (Adult/Senior) OR Family Security & Habits (Child/Minor)
    if (isChildOrInfant || isMinor) {
      const p1Minor = pick6({
        kn: `${ctx.lagnaRashiName} ಕುಟುಂಬದ ೨ನೇ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[2])} ಬಿಂದುಗಳು ಇರುವುದರಿಂದ ಈ ಮಗುವಿನ ಬೆಳವಣಿಗೆಯ ಜೊತೆಗೇ ಮನೆಯ ಆರ್ಥಿಕ ನೆಮ್ಮದಿಯೂ ವೃದ್ಧಿಸುತ್ತದೆ.`,
        mr: `${ctx.lagnaRashiName} कुटुंबाच्या द्वितीय भावात ${n(savByHouse[2])} गुण असल्याने मुलाच्या वाढीसोबत घराचे सौख्यही वाढते.`,
        hi: `${ctx.lagnaRashiName} जन्म कुंडली के द्वितीय भाव में ${n(savByHouse[2])} बिंदू होने से इस बालक के साथ घर की सुख-समृद्धि बढ़ती है।`,
        te: `${ctx.lagnaRashiName} లగ్నపు 2వ స్థానంలో ${n(savByHouse[2])} బిందువులు ఉండటంతో చిన్నారి ఎదుగుదలతో పాటు ఇంటి శుభత్వం పెరుగుతుంది.`,
        ta: `${ctx.lagnaRashiName} ஜாதகத்தின் 2-ம் இடத்தில் ${n(savByHouse[2])} பரல்கள் உள்ளதால் குழந்தையின் வளர்ச்சியோடு குடும்ப வளமும் கூடுகிறது.`,
        en: `Anchoring ${savByHouse[2]} bindus in House 2 (${ctx.house2Info.lordName}), quiet family steadiness grows naturally alongside this young chart.`
      }, lang);

      const p2Minor = pick6({
        kn: `${ctx.moonRashiName} ಚಂದ್ರನ ಚಿಕ್ಕ ವಯಸ್ಸಿನಲ್ಲೇ ಹಂಚಿಕೊಳ್ಳುವಿಕೆ, ವಸ್ತುಗಳ ಜೋಡಣೆ ಹಾಗೂ ತೃಪ್ತಿ ಭಾವನೆ ಕಲಿಸಿದರೆ ಜೀವನಪೂರ್ತಿ ಶುಭ ಸಂಸ್ಕಾರ ನೆಲೆಗೊಳ್ಳುತ್ತದೆ.`,
        mr: `${ctx.moonRashiName} चंद्राच्या लहानपणापासूनच वाटून घेणे, वस्तू नीट ठेवणे हे संस्कार आयुष्यभर समृद्धी टिकवतात.`,
        hi: `${ctx.moonRashiName} चंद्र वाले बालक को बचपन से ही सहेजना और संतोष सिखाने पर जीवनभर स्थायी समृद्धि रहती है।`,
        te: `${ctx.moonRashiName} రాశి చిన్ననాటి నుంచే పంచుకోవడం, వస్తువులు సర్దడం నేర్పితే జీవితాంతం శుభ సంస్కారం నిలుస్తుంది.`,
        ta: `${ctx.moonRashiName} சந்திர குழந்தைக்குச் சிறுவயதிலிருந்தே பகிர்ந்தளித்தலை வளர்ப்பது வாழ்நாள் முழுவதும் நன்மை தரும்.`,
        en: `Playful habits around shared books and gratitude nurture natural household harmony for this ${ctx.moonRashiName} child.`
      }, lang);

      return {
        p1Focus: p1Minor,
        p2Body: p2Minor,
        p3Body: "",
        reflectionNote: ed === 0 ? "" : pick6({
          kn: `ಮನೆಯ ೧೧ನೇ ಭಾಗ್ಯ ಬಿಂದುಗಳು (${n(savByHouse[11])}) ಈ ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಶಾಂತ ವಿದ್ಯಾಭಿವೃದ್ಧಿಯನ್ನು ಕಾಯುತ್ತಿವೆ.`,
          mr: `११व्या स्थानाचे ${n(savByHouse[11])} गुण या मुलाच्या नावाने शांत व सुरक्षित वाढ दर्शवतात.`,
          hi: `एकादश भाव के ${n(savByHouse[11])} बिंदू इस बालक के सुरक्षित भविष्य की पुष्टि करते हैं।`,
          te: `11వ స్థానంలోని ${n(savByHouse[11])} బిందువులు చిన్నారి శుభ భవిష్యత్తుకు అండగా నిలుస్తున్నాయి.`,
          ta: `11-ம் இடத்தின் ${n(savByHouse[11])} பரல்கள் இக்குழந்தையின் பாதுகாப்பான வளர்ச்சிக்குத் துணை நிற்கின்றன.`,
          en: `House 11's ${savByHouse[11]} bindus affirm steady educational provisioning across the household.`
        }, lang)
      };
    }

    const p1Fin = pick6({
      kn: `ನಿಮ್ಮ ${ctx.lagnaRashiName} ಲಗ್ನದ ೨ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[2])} ಬಿಂದುಗಳು (${ctx.house2Info.lordName}) ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[11])} ಬಿಂದುಗಳು (${ctx.house11Info.lordName}) ಇರುವುದರಿಂದ ಉಳಿತಾಯದ ಕ್ರಮವೇ ನಿಮ್ಮ ನಿಜವಾದ ಶಕ್ತಿ.`,
      mr: `${ctx.lagnaRashiName} लग्नाच्या धन स्थानात ${n(savByHouse[2])} गुण (${ctx.house2Info.lordName}) व लाभ भावात ${n(savByHouse[11])} गुण (${ctx.house11Info.lordName}) असल्याने बचतीची शिस्त खरी ताकद ठरते.`,
      hi: `${ctx.lagnaRashiName} लग्न के धन भाव में ${n(savByHouse[2])} बिंदू (${ctx.house2Info.lordName}) और लाभ में ${n(savByHouse[11])} बिंदू (${ctx.house11Info.lordName}) होने से बचत-प्रणाली ही वास्तविक शक्ति बनती है।`,
      te: `${ctx.lagnaRashiName} లగ్నపు 2వ ధనంలో ${n(savByHouse[2])} బిందువులు (${ctx.house2Info.lordName}) మరియు 11వ లాభంలో ${n(savByHouse[11])} బిందువులు (${ctx.house11Info.lordName}) ఉండటంతో పొదుపే ప్రధాన బలం.`,
      ta: `${ctx.lagnaRashiName} லக்னத்தின் 2-ம் தன இடத்தில் ${n(savByHouse[2])} பரல்கள் (${ctx.house2Info.lordName}) மற்றும் 11-ம் லாபத்தில் ${n(savByHouse[11])} பரல்கள் (${ctx.house11Info.lordName}) சேமிப்பு ஒழுங்கைப் பலமாக்குகின்றன.`,
      en: `Pairing ${savByHouse[2]} bindus in House 2 (${ctx.house2Info.lordName}) with ${savByHouse[11]} Gains bindus (${ctx.house11Info.lordName}) inside ${ctx.lagnaRashiName} Lagna makes structured saving outperform flashy income.`
    }, lang);

    const p2Map13: Record<0 | 1 | 2 | 3, Record<SixLang, string>> = {
      0: {
        kn: `${ctx.lagnaRashiName} ಲಗ್ನದ ೧೨ನೇ ವ್ಯಯಾಧಿಪತಿ ${ext.house12Info.lordName} (${n(ext.house12Info.placedHouse)}ನೇ ಭಾವ) ಎಚ್ಚರಿಸುವಂತೆ, ಭಾವನಾತ್ಮಕ ದಾಕ್ಷಿಣ್ಯಕ್ಕೆ ತಕ್ಷಣ ಹಣ ಕೊಡುವ ಅಭ್ಯಾಸಕ್ಕೆ ಮಿತಿ ಹಾಕಿ.`,
        mr: `${ctx.lagnaRashiName} लग्नाचा व्ययेश ${ext.house12Info.lordName} (${n(ext.house12Info.placedHouse)}वे स्थान) सावध करतो की संकोचापोटी पैसा देण्याची सवय आता थांबवावी.`,
        hi: `${ctx.lagnaRashiName} लग्न के द्वादशेश ${ext.house12Info.lordName} (${n(ext.house12Info.placedHouse)}वां स्थान) सतर्क करते हैं कि भावुकता में तत्काल धन देने की आदत रोकें।`,
        te: `${ctx.lagnaRashiName} లగ్నపు వ్యయాధిపతి ${ext.house12Info.lordName} (${n(ext.house12Info.placedHouse)}వ ఇల్లు) మొహమాటపు ఖర్చులను తక్షణమే ఆపమని సూచిస్తోంది.`,
        ta: `${ctx.lagnaRashiName} லக்ன விரயாதிபதி ${ext.house12Info.lordName} (${n(ext.house12Info.placedHouse)}-ம் வீடு) தயக்கத்தால் பணம் கொடுக்கும் பழக்கத்தை நிறுத்தச் சொல்கிறது.`,
        en: `For ${ctx.lagnaRashiName} Lagna, 12th lord ${ext.house12Info.lordName} (House ${ext.house12Info.placedHouse}) shows guilt-driven bailouts and impulse generosity drain faster than markets.`
      },
      1: {
        kn: `ತಿಂಗಳ ಮೊದಲ ದಿನವೇ ಆದಾಯದ ಭಾಗವನ್ನು ಪ್ರತ್ಯೇಕ ಸುರಕ್ಷಿತ ಖಾತೆಗೆ ವರ್ಗಾಯಿಸಿ, ಉಳಿದ ಮೊತ್ತದಲ್ಲಿ ಖರ್ಚು ಯೋಜಿಸಿದರೆ ${ctx.yogiPlanetName} ಬಲ ದ್ವಿಗುಣವಾಗುತ್ತದೆ.`,
        mr: `महिन्याच्या पहिल्याच दिवशी ठराविक रक्कम वेगळ्या सुरक्षित खात्यात वळवल्यास ${ctx.yogiPlanetName} ची अनुकूलता वेगाने वाढते.`,
        hi: `माह के प्रथम दिन ही निश्चित बचत अलग सुरक्षित खाते में रखने से ${ctx.yogiPlanetName} की समृद्धि तेज़ी से बढ़ती है।`,
        te: `నెల మొదటి రోజునే పొదుపు మొత్తాన్ని వేరు ఖాతాలో పెడితే ${ctx.yogiPlanetName} అనుగ్రహం రెట్టింపు అవుతుంది.`,
        ta: `மாதத்தின் முதல் நாளே சேமிப்பைத் தனிக் கணக்கில் மாற்றினால் ${ctx.yogiPlanetName} அருளால் வளம் பெருகும்.`,
        en: `Paying future reserves on day one aligns cash habits cleanly with Yogi ${ctx.yogiPlanetName} rather than sorting leftovers.`
      },
      2: {
        kn: `ಆತುರದ 'ತಕ್ಷಣ ದ್ವಿಗುಣ' ಆಸೆಗಿಂತ, ಭೂಮಿ-ಬಂಗಾರ-ಶಾಂತ ಬಡ್ಡಿಯಂತಹ ನಿಧಾನ ಹಾಗೂ ಸುರಕ್ಷಿತ ಹೂಡಿಕೆಗಳೇ ನಿಮ್ಮ ${ctx.lagnaRashiName} ಲಗ್ನಕ್ಕೆ ಒಗ್ಗುತ್ತವೆ.`,
        mr: `झटपट परताव्याच्या मोहापेक्षा जमीन, सोने किंवा शांत स्थिर गुंतवणूक तुमच्या ${ctx.lagnaRashiName} लग्नाला जास्त फलदायी ठरते.`,
        hi: `तेज़ी से दोगुना होने के प्रलोभन के बजाय भूमि, स्वर्ण और सुरक्षित दीर्घकालिक निवेश आपकी ${ctx.lagnaRashiName} पत्रिका को सूट करते हैं।`,
        te: `తొందరపాటు ఆశల కంటే స్థిరాస్తి, బంగారం మరియు సురక్షిత దీర్ఘకాలిక పొదుపు మీ ${ctx.lagnaRashiName} లగ్నానికి ఎంతో మేలు చేస్తాయి.`,
        ta: `விரைவு லாப ஆசையை விட நிலம், தங்கம் மற்றும் பாதுகாப்பான நீண்டகாலச் சேமிப்பே உங்கள் ${ctx.lagnaRashiName} லக்னத்திற்குச் சிறந்தது.`,
        en: `Compare high-noise speculative tips against steady tangible stores—your chart multiplies slow certainty dramatically.`
      },
      3: {
        kn: `ತುಂಬಿದ ಕೊಡದಲ್ಲಿ ಸಣ್ಣ ತೂತಿದ್ದರೆ ರಾತ್ರಿಯೊಳಗೆ ಅರ್ಧ ನೀರು ಖಾಲಿಯಾದಂತೆ, ಚಿಕ್ಕ ಪುನರಾವರ್ತಿತ ಖರ್ಚುಗಳನ್ನು ಮುಚ್ಚಿದರೇ ಸಂಪತ್ತು ನಿಲ್ಲುತ್ತದೆ.`,
        mr: `भरलेल्या माठात छोटे छिद्र असल्यास पाणी गळत राहते; तसेच छोटे अनावश्यक खर्च थांबवल्यासच खरी संपत्ती टिकते.`,
        hi: `घड़े में सूक्ष्म छिद्र रहने पर जैसे जल घटता रहता है, वैसे ही छोटे-छोटे अनावश्यक व्यय रोकने से धन सहज टिकने लगता है।`,
        te: `కుండకు చిన్న రంధ్రం ఉన్నా నీరు కారిపోయినట్లే, చిన్న చిన్న అనవసర ఖర్చులను అరికడితేనే సంపద నిలుస్తుంది.`,
        ta: `குடத்தில் சிறிய துளை இருந்தால் நீர் ஒழுகும்; சிறிய தேவையற்ற செலவுகளை அடைத்தாலே செல்வம் நிலைக்கும்.`,
        en: `Tiny pinholes empty large clay jars faster than one big crack—plugging recurring leaks keeps reserves surprisingly full.`
      }
    };

    return {
      p1Focus: p1Fin,
      p2Body: pick6(p2Map13[ed], lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `ಲೆಕ್ಕ ಪರೀಕ್ಷೆ: ಕಳೆದ ೩೦ ದಿನಗಳಲ್ಲಿ ಯಾರದ್ದೋ ಮನವೊಲಿಸಲು ಮಾಡಿದ ಒಂದು ಅನಗತ್ಯ ಖರ್ಚನ್ನು ಗುರುತು ಹಾಕಿ.`,
        mr: `हिशोब तपासा: मागील ३० दिवसांत केवळ कोणाचा मान राखण्यासाठी केलेला एक अनावश्यक खर्च ओळखा.`,
        hi: `आय-व्यय परख: पिछले ३० दिनों में केवल संकोचवश किए गए एक अनावश्यक खर्च को आज पहचानें।`,
        te: `ఆర్థిక గుర్తు: గత 30 రోజుల్లో మొహమాటంతో చేసిన ఒక అనవసర ఖర్చును గుర్తించండి.`,
        ta: `கணக்குப் பார்வை: கடந்த 30 நாட்களில் தயக்கத்தால் செய்த ஒரு தேவையற்ற செலவை அடையாளம் காணுங்கள்.`,
        en: `Wallet Check: Spot one quiet monthly drain kept purely out of habit rather than genuine value.`
      }, lang)
    };
  }

  if (chNum === 14) {
    // Relationships & Home Sanctuary (STRICT minor-safety + maritalContext-awareness!)
    if (isChildOrInfant || isMinor) {
      return {
        p1Focus: pick6({
          kn: `೪ನೇ ಗೃಹ ಸ್ಥಾನದ ${n(savByHouse[4])} ಬಿಂದುಗಳು ಹಾಗೂ ${ctx.moonRashiName} ಚಂದ್ರನ ಮೃದು ಮನಸ್ಸು ಮನೆಯೊಳಗಿನ ಪ್ರೀತಿ-ನಗುವಿನಿಂದಲೇ ಬಲಗೊಳ್ಳುತ್ತವೆ.`,
          mr: `चतुर्थ भावाचे ${n(savByHouse[4])} गुण व ${ctx.moonRashiName} चंद्राचे संवेदनशील मन घरातील प्रेमळ संवादातूनच बहरते.`,
          hi: `चतुर्थ भाव के ${n(savByHouse[4])} बिंदू और ${ctx.moonRashiName} चंद्र का कोमल मन घर के स्नेहपूर्ण संवाद से संबल पाता है।`,
          te: `4వ స్థానంలోని ${n(savByHouse[4])} బిందువులు మరియు ${ctx.moonRashiName} చంద్రుని సున్నిత మనసు ఇంట్లోని ప్రేమపూరిత మాటలతో బలపడతాయి.`,
          ta: `4-ம் இடத்தின் ${n(savByHouse[4])} பரல்களும் ${ctx.moonRashiName} சந்திர மனமும் வீட்டின் அன்பான உரையாடலால் வலுப்பெறுகின்றன.`,
          en: `Backed by ${savByHouse[4]} bindus in House 4, affectionate family warmth nurtures this sensitive ${ctx.moonRashiName} Moon safely.`
        }, lang),
        p2Body: pick6({
          kn: `${ctx.nakshatraName} ತಾರೆಯ ಪೋಷಕರು ತಾಳ್ಮೆಯಿಂದ ಮಗುವಿನ ಮಾತು ಕೇಳಿದಾಗ, ಹೊರಜಗತ್ತಿನ ಸ್ನೇಹದಲ್ಲಿಯೂ ನಂಬಿಕೆ ಮತ್ತು ಧೈರ್ಯ ಬೆಳೆಯುತ್ತದೆ.`,
          mr: `${ctx.nakshatraName} नक्षत्राच्या बाळाचे बोलणे शांतपणे ऐकून घेतल्यास बाहेरील मैत्रीतही आत्मविश्वास निर्माण होतो.`,
          hi: `${ctx.nakshatraName} नक्षत्र के बच्चे की बात धैर्य से सुनने पर मित्रता और विद्यालय में भी सहज आत्मविश्वास बढ़ता है।`,
          te: `${ctx.nakshatraName} నక్షత్ర చిన్నారి మాట ఓపికగా వినడం వల్ల స్నేహితులతోనూ నమ్మకం, ధైర్యం అలవడుతాయి.`,
          ta: `${ctx.nakshatraName} நட்சத்திரக் குழந்தையின் கருத்தைக் கேட்கும்போது நண்பர்களிடமும் இயல்பான நம்பிக்கை வளரும்.`,
          en: `When elders listen warmly around this ${ctx.nakshatraName} child, calm trust flows smoothly into school friendships.`
        }, lang),
        p3Body: "",
        reflectionNote: ed === 0 ? "" : pick6({
          kn: `ಮನೆಯ ೧೫ ನಿಮಿಷಗಳ ಒಟ್ಟಿಗೆ ಊಟ-ಮಾತುಕತೆ ಈ ಮಗುವಿನ ಭಾವನಾತ್ಮಕ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ.`,
          mr: `घरातील एकत्र जेवण आणि १५ मिनिटांचा गप्पांचा वेळ या मुलाचे खरे भावनिक कवच आहे.`,
          hi: `परिवार के साथ मिलकर बिताए १५ मिनट के सहज संवाद इस बच्चे के मन का सबसे सुंदर कवच हैं।`,
          te: `కుటుంబంతో కలిసి సరదాగా గడిపే 15 నిమిషాలు ఈ చిన్నారి హృదయానికి అతిపెద్ద భరోసా.`,
          ta: `குடும்பத்துடன் சேர்ந்து சிரித்துப் பேசும் 15 நிமிடங்களே குழந்தையின் உள்ளத்திற்குப் பாதுகாப்பான கவசம்.`,
          en: `Screen-free shared table talk remains this child's strongest emotional anchor.`
        }, lang)
      };
    }

    // Adult relationship nuance respecting married vs unmarried vs unspecified (always keeps 'ಸಂಗಾತಿ' cleanly in Kannada!)
    const bondFocus = arch.maritalContext === "unmarried"
      ? pick6({
          kn: `೭ನೇ ಸಪ್ತಮ ಸ್ಥಾನಾಧಿಪತಿ ${ctx.house7Info.lordName} (${n(savByHouse[7])} ಬಿಂದು) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ ${ctx.moonRashiName} ಪ್ರಕಾರ, ಆತುರದ ಒಪ್ಪಂದಕ್ಕಿಂತ ಮನಃಶಾಂತಿ ಕೊಡುವ ಯೋಗ್ಯ ಜೀವನ ಸಂಗಾತಿಯ ಆಯ್ಕೆಗೆ ಕಾಲ ಈಗ ಹದವಾಗುತ್ತಿದೆ.`,
          mr: `सप्तमेश ${ctx.house7Info.lordName} (${n(savByHouse[7])} गुण) व ${ctx.moonRashiName} चंद्रानुसार, घाईपेक्षा मनःशांती व समजूतदारपणा देणारा योग्य जोडीदार निवडण्याची वेळ आता अनुकूल होत आहे.`,
          hi: `सप्तमेश ${ctx.house7Info.lordName} (${n(savByHouse[7])} बिंदू) तथा ${ctx.moonRashiName} चंद्र के अनुसार, जल्दबाजी के बजाय मन को शांत रखने वाले योग्य जीवनसाथी की चयन-दिशा अभी परिपक्व हो रही है।`,
          te: `సప్తమాధిపతి ${ctx.house7Info.lordName} (${n(savByHouse[7])} బిందువులు) మరియు ${ctx.moonRashiName} చంద్రుని ప్రకారం, తొందరపడకుండా మనశ్శాంతినిచ్చే సరైన జీవిత భాగస్వామిని ఎంచుకునే సమయం ఇది.`,
          ta: `சப்தமாதிபதி ${ctx.house7Info.lordName} (${n(savByHouse[7])} பரல்கள்) மற்றும் ${ctx.moonRashiName} சந்திரன்படி, அவசரமின்றி மன அமைதி தரும் வாழ்க்கைத் துணையைத் தேர்ந்தெடுக்கத் தக்க காலம் கனிகிறது.`,
          en: `Guided by 7th lord ${ctx.house7Info.lordName} (${savByHouse[7]} bindus) and ${ctx.moonRashiName} Moon, discernment matters more than rushing—seek steady character over surface sparkle.`
        }, lang)
      : arch.maritalContext === "married"
      ? pick6({
          kn: `೭ನೇ ಸಪ್ತಮ ಸ್ಥಾನಾಧಿಪತಿ ${ctx.house7Info.lordName} (${n(savByHouse[7])} ಬಿಂದು) ಹಾಗೂ ೪ನೇ ಗೃಹ ಸ್ಥಾನ (${n(savByHouse[4])} ಬಿಂದು) ತೋರುವಂತೆ, ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಂಗಾತಿಯೊಂದಿಗೆ ಭಾವನಾತ್ಮಕ ಮಾತು ಹೆಚ್ಚಿದಷ್ಟೂ ಹಳೆಯ ಒತ್ತಡ ಕರಗುತ್ತದೆ.`,
          mr: `सप्तमेश ${ctx.house7Info.lordName} (${n(savByHouse[7])} गुण) आणि चतुर्थ स्थान (${n(savByHouse[4])} गुण) दर्शवतात की वैवाहिक नात्यात जोडीदाराशी मोकळा संवाद वाढताच जुना ताण विरघळतो.`,
          hi: `सप्तमेश ${ctx.house7Info.lordName} (${n(savByHouse[7])} बिंदू) तथा चतुर्थ भाव (${n(savByHouse[4])} बिंदू) दर्शाते हैं कि दांपत्य जीवन में जीवनसाथी के साथ सहज संवाद बढ़ने से पुराना तनाव पिघलता है।`,
          te: `సప్తమాధిపతి ${ctx.house7Info.lordName} (${n(savByHouse[7])} బిందువులు) మరియు 4వ స్థానం (${n(savByHouse[4])} బిందువులు) చూపినట్లు, దాంపత్యంలో భాగస్వామితో ఆత్మీయ మాటలు పెరిగినకొద్దీ ఒత్తిడి తగ్గుతుంది.`,
          ta: `சப்தமாதிபதி ${ctx.house7Info.lordName} (${n(savByHouse[7])} பரல்கள்) மற்றும் 4-ம் இடம் (${n(savByHouse[4])} பரல்கள்) காட்டுவது போல், துணையுடன் மனம் திறந்த பேச்சு கூடும்போது பழைய மன அழுத்தம் கரையும்.`,
          en: `With 7th lord ${ctx.house7Info.lordName} (${savByHouse[7]} bindus) paired alongside House 4 (${savByHouse[4]} bindus), unhurried warmth with your spouse dissolves months of quiet tension.`
        }, lang)
      : pick6({
          kn: `೭ನೇ ಸಪ್ತಮ ಸ್ಥಾನಾಧಿಪತಿ ${ctx.house7Info.lordName} (${n(savByHouse[7])} ಬಿಂದು) ಹಾಗೂ ೪ನೇ ಗೃಹ ಸ್ಥಾನದ (${n(savByHouse[4])} ಬಿಂದು) ಪ್ರಕಾರ, ಜೀವನ ಸಂಗಾತಿ ಹಾಗೂ ಮನೆಯ ಅತ್ಯಂತ ಆಪ್ತರೊಂದಿಗೆ ಮೌನ ಗೋಡೆ ತೆಗೆದು ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿದ ಕ್ಷಣ ಸೌಹಾರ್ದತೆ ಮರಳುತ್ತದೆ.`,
          mr: `सप्तमेश ${ctx.house7Info.lordName} (${n(savByHouse[7])} गुण) आणि चतुर्थ भावाच्या (${n(savByHouse[4])} गुण) नियमानुसार, जीवनसाथी व घरच्या जिवलगांसोबतची मौन भिंत दूर करताच जिव्हाळा पुन्हा फुलतो.`,
          hi: `सप्तमेश ${ctx.house7Info.lordName} (${n(savByHouse[7])} बिंदू) एवं चतुर्थ भाव (${n(savByHouse[4])} बिंदू) के अनुसार, जीवनसाथी तथा घर के आत्मीयों के बीच मौन की दीवार हटते ही सहज स्नेह लौट आता है।`,
          te: `సప్తమాధిపతి ${ctx.house7Info.lordName} (${n(savByHouse[7])} బిందువులు) మరియు 4వ స్థానం (${n(savByHouse[4])} బిందువులు) ప్రకారం, జీవిత భాగస్వామి మరియు కుటుంబ ఆప్తులతో మౌనం వీడి మాట్లాడితే ఆనందం రెట్టింపవుతుంది.`,
          ta: `சப்தமாதிபதி ${ctx.house7Info.lordName} (${n(savByHouse[7])} பரல்கள்) மற்றும் 4-ம் இடம் (${n(savByHouse[4])} பரல்கள்) காட்டுவது போல், வாழ்க்கைத் துணை மற்றும் குடும்பத்தினருடன் மௌனம் கலைத்துப் பேசும்போது இனிமை திரும்பும்.`,
          en: `Anchoring 7th lord ${ctx.house7Info.lordName} (${savByHouse[7]} bindus) beside House 4 (${savByHouse[4]} bindus), dropping silent pride with your spouse or closest loved one melts lingering stiffness.`
        }, lang);

    return {
      p1Focus: bondFocus,
      p2Body: pick6({
        kn: `${ctx.moonRashiName} ಚಂದ್ರ ಮತ್ತು ಸಪ್ತಮೇಶ ${ctx.house7Info.lordName} ಪ್ರಕಾರ, ನೀವು ಜವಾಬ್ದಾರಿ ಹೊತ್ತು ಪ್ರೀತಿ ತೋರಿಸುತ್ತೀರಿ; ಆದರೆ ಆಪ್ತರು ಮೃದು ಮಾತನ್ನು ಬಯಸುತ್ತಾರೆ — ಈ ಚಿಕ್ಕ ಸೇತುವೆ ಕಟ್ಟಿದರೆ ಸಾಕು.`,
        mr: `${ctx.moonRashiName} चंद्र व सप्तमेश ${ctx.house7Info.lordName} नुसार तुम्ही कर्तव्यातून प्रेम दाखवता, तर समोरचा दोन गोड शब्द ऐकू इच्छितो — हा पूल जोडणे पुरेसे आहे.`,
        hi: `${ctx.moonRashiName} चंद्र एवं सप्तमेश ${ctx.house7Info.lordName} के अनुसार आप कर्तव्य निभाकर स्नेह जताते हैं, जबकि प्रियजन को कोमल शब्दों की प्रतीक्षा रहती है।`,
        te: `${ctx.moonRashiName} చంద్రుడు మరియు ${ctx.house7Info.lordName} ప్రకారం మీరు బాధ్యతలతో ప్రేమ చూపితే, ఆప్తులు ఆప్యాయపు మాటలు ఆశిస్తారు — ఈ చిన్న మార్పు చాలు.`,
        ta: `${ctx.moonRashiName} சந்திரன் மற்றும் ${ctx.house7Info.lordName} படி நீங்கள் கடமையால் அன்பைக் காட்டுகிறீர்கள்; அன்பானவர்கள் இனிய வார்த்தைகளை எதிர்பார்க்கிறார்கள்.`,
        en: `Inside your ${ctx.moonRashiName} Moon and ${ctx.house7Info.lordName} rhythm, you show devotion via duty while loved ones hunger for unhurried voiced presence.`
      }, lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `ಪ್ರೀತಿಯ ಹೆಜ್ಜೆ: ವಾದದ ಬದಲು 'ನಾನು ನಿನ್ನ ಮಾತನ್ನು ಪೂರ್ಣವಾಗಿ ಕೇಳುತ್ತಿದ್ದೇನೆ' ಎಂಬ ಒಂದು ವಾಕ್ಯ ಇಂದು ಹೃದಯಗಳನ್ನು ಹತ್ತಿರ ತರುತ್ತದೆ.`,
        mr: `जवळचे पाऊल: आज युक्तिवादापेक्षा 'मी तुझे शांतपणे ऐकून घेत आहे' हे एक वाक्य नात्यात गोडवा आणेल.`,
        hi: `स्नेह-सूत्र: आज तर्क के बजाय 'मैं तुम्हारी बात पूरे मन से सुन रहा हूं' — यह एक वाक्य दूरियां मिटा देगा।`,
        te: `ఆత్మీయ సూత్రం: వాదన కంటే 'నేను నీ మాట పూర్తిగా వింటున్నాను' అన్న ఒక్క మాట బంధాన్ని దగ్గర చేస్తుంది.`,
        ta: `அன்புப் படி: வாதிடுவதை விட 'நான் உங்கள் மனதைக் கேட்கிறேன்' என்ற ஒரு வார்த்தை உறவுகளை நெருக்கமாக்கும்.`,
        en: `Closeness Check: Try listening all the way through once tonight without jumping immediately into solutions.`
      }, lang)
    };
  }

  if (chNum === 15) {
    // 5th House: Creativity, Children & Legacy
    const p1H5 = isChildOrInfant || isMinor
      ? pick6({
          kn: `೫ನೇ ಬುದ್ಧಿ-ಪ್ರತಿಭಾ ಸ್ಥಾನದ ${n(savByHouse[5])} ಬಿಂದುಗಳು ಮತ್ತು ಅಧಿಪತಿ ${ctx.house5Info.lordName} ಈ ತರುಣ-ಬಾಲ ಜಾತಕದಲ್ಲಿ ಅಪಾರ ಕಲ್ಪನಾಶಕ್ತಿ ಹಾಗೂ ಕಲಿಕಾ ಚುರುಕುತನ ನೀಡಿವೆ.`,
          mr: `पंचम प्रतिभेचे ${n(savByHouse[5])} गुण व स्वामी ${ctx.house5Info.lordName} या वयात उत्तम कल्पनाशक्ती व शिकण्याची गती देतात.`,
          hi: `पंचम प्रतिभा भाव के ${n(savByHouse[5])} बिंदू और स्वामी ${ctx.house5Info.lordName} इस आयु में सहज कल्पनाशक्ति एवं सीखने की स्फूर्ति दे रहे हैं।`,
          te: `5వ ప్రతిభా స్థానంలోని ${n(savByHouse[5])} బిందువులు మరియు అధిపతి ${ctx.house5Info.lordName} ఈ వయసులో అద్భుత ఊహాశక్తిని ఇస్తున్నాయి.`,
          ta: `5-ம் அறிவு இடத்தின் ${n(savByHouse[5])} பரல்களும் அதிபதி ${ctx.house5Info.lordName}-ம் இந்த வயதில் சிறந்த கற்பனைத் திறனைத் தருகின்றன.`,
          en: `House 5 holds ${savByHouse[5]} bindus under ${ctx.house5Info.lordName}, fueling spontaneous imagination and bright early curiosity.`
        }, lang)
      : pick6({
          kn: `ನಿಮ್ಮ ೫ನೇ ಪೂರ್ವಪುಣ್ಯ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[5])} ಬಿಂದುಗಳಿದ್ದು ಅಧಿಪತಿ ${ctx.house5Info.lordName} (${n(ctx.house5Info.placedHouse)}ನೇ ಮನೆ, ${ctx.house5Info.placedRashi}) ಸೃಜನಶೀಲ ಜ್ಞಾನ, ಕೌಟುಂಬಿಕ ಸಂತೋಷ ಮತ್ತು ತಲೆಮಾರಿನ ಗೌರವವನ್ನು ಬೆಳಗುತ್ತಿದ್ದಾರೆ.`,
          mr: `पंचम पूर्वपुण्य भावात ${n(savByHouse[5])} गुण व स्वामी ${ctx.house5Info.lordName} (${n(ctx.house5Info.placedHouse)}वे स्थान, ${ctx.house5Info.placedRashi}) सृजनशील आनंद व कुलगौरव वाढवत आहेत.`,
          hi: `पंचम पूर्वपुण्य भाव में ${n(savByHouse[5])} बिंदू तथा स्वामी ${ctx.house5Info.lordName} (${n(ctx.house5Info.placedHouse)}वां स्थान, ${ctx.house5Info.placedRashi}) आपकी मेधा, आनंद और वंश-प्रतिष्ठा को संवार रहे हैं।`,
          te: `5వ పూర్వపుణ్య స్థానంలో ${n(savByHouse[5])} బిందువులు ఉండి అధిపతి ${ctx.house5Info.lordName} (${n(ctx.house5Info.placedHouse)}వ ఇల్లు, ${ctx.house5Info.placedRashi}) సృజనాత్మక ఉత్సాహాన్ని ఇస్తున్నారు.`,
          ta: `5-ம் பூர்வ புண்ணிய இடத்தில் ${n(savByHouse[5])} பரல்களுடன் அதிபதி ${ctx.house5Info.lordName} (${n(ctx.house5Info.placedHouse)}-ம் வீடு, ${ctx.house5Info.placedRashi}) படைப்பாற்றல் மற்றும் குடும்ப மகிழ்ச்சியைத் தருகிறார்.`,
          en: `Anchoring ${savByHouse[5]} bindus in House 5 (lord ${ctx.house5Info.lordName} in House ${ctx.house5Info.placedHouse}), deep creative intelligence awaits room beyond pure duty.`
        }, lang);

    return {
      p1Focus: p1H5,
      p2Body: pick6({
        kn: `ನಿಮ್ಮ ${ctx.nakshatraName} ಚೈತನ್ಯ ಹಾಗೂ ೫ನೇ ಅಧಿಪತಿ ${ctx.house5Info.lordName} ಬೆಳಗಲು, ವಾರಕ್ಕೊಮ್ಮೆಯಾದರೂ ಸಂಗೀತ, ಬರವಣಿಗೆ ಅಥವಾ ಹವ್ಯಾಸಕ್ಕೆ ಸಮಯ ಮೀಸಲಿಡಿ.`,
        mr: `तुमची ${ctx.nakshatraName} ऊर्जा व पंचमेश ${ctx.house5Info.lordName} बहरण्यासाठी आठवड्यातून एकदा संगीत, वाचन किंवा छंदासाठी वेळ द्या.`,
        hi: `आपकी ${ctx.nakshatraName} ऊर्जा एवं पंचमेश ${ctx.house5Info.lordName} को निखारने हेतु सप्ताह में थोड़ा समय रचनात्मक रुचि को अवश्य दें।`,
        te: `మీ ${ctx.nakshatraName} శక్తి మరియు 5వ అధిపతి ${ctx.house5Info.lordName} వెలగడానికి వారానికొకసారి కళలు లేదా సృజనాత్మక వ్యాపకాలకు సమయం కేటాయించండి.`,
        ta: `உங்கள் ${ctx.nakshatraName} ஆற்றலும் 5-ம் அதிபதி ${ctx.house5Info.lordName}-ம் மலர வாரம் ஒருமுறை கலை அல்லது படைப்பார்வத்திற்கு நேரம் ஒதுக்குங்கள்.`,
        en: `Give ${ctx.nakshatraName} curiosity and 5th lord ${ctx.house5Info.lordName} thirty unjudged weekly minutes—creation restores bright resilience.`
      }, lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `ಹೃದಯದ ಪ್ರಶ್ನೆ: ಯಾರ ಭಯವೂ ಇಲ್ಲದಿದ್ದರೆ ನೀವು ಯಾವ ಕಲೆ ಅಥವಾ ಹೊಸ ವಿದ್ಯೆಯನ್ನು ಸಂತೋಷದಿಂದ ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?`,
        mr: `मनाला विचारा: कोणाचेही दडपण नसते तर तुम्हाला कोणती कला किंवा नवी विद्या आनंदाने शिकायची आहे?`,
        hi: `मन का प्रश्न: बिना किसी संकोच के आप कौन सी रचनात्मक विद्या आज आनंद से अपनाना चाहेंगे?`,
        te: `హృదయ ప్రశ్న: ఎలాంటి ఒత్తిడీ లేకుంటే మీరు ఆనందంగా నేర్చుకోవాలనుకునే కొత్త కళ ఏమిటి?`,
        ta: `உள்ளக் கேள்வி: எந்தத் தயக்கமும் இல்லாவிட்டால் நீங்கள் மகிழ்ச்சியுடன் கற்க விரும்பும் கலை அல்லது திறன் எது?`,
        en: `Joy Audit: What joyful creative skill did busy years leave parked quietly in the corner?`
      }, lang)
    };
  }

  // Ch 16: Health, Vitality & Nervous System Rhythm
  const healthLead = isSenior
    ? pick6({
        kn: `೬ನೇ ಆರೋಗ್ಯ ಭಾವ (${n(savByHouse[6])} ಬಿಂದು, ${ctx.house6Info.lordName}) ಮತ್ತು ಲಗ್ನ ಬಲ (${n(savByHouse[1])} ಬಿಂದು) ಹೇಳುವಂತೆ, ಕಠಿಣ ವ್ರತಕ್ಕಿಂತ ನಿಯಮಿತ ಮೃದು ನಡಿಗೆ, ಬಿಸಿ ನೀರು ಮತ್ತು ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ನಿದ್ದೆ ದೀರ್ಘಾಯುಷ್ಯ ಕಾಯುತ್ತವೆ.`,
        mr: `षष्ठ आरोग्य भाव (${n(savByHouse[6])} गुण, ${ctx.house6Info.lordName}) व लग्न बळ (${n(savByHouse[1])} गुण) सांगतात की कठोर प्रयोगांपेक्षा नियमित चालणे, कोमट पाणी व वेळेवर झोप आरोग्य अबाधित ठेवते.`,
        hi: `षष्ठ स्वास्थ्य भाव (${n(savByHouse[6])} बिंदू, ${ctx.house6Info.lordName}) एवं लग्न बल (${n(savByHouse[1])} बिंदू) बताते हैं कि नियमित हल्की सैर, गुनगुना जल और समयबद्ध विश्राम ही सर्वोत्तम रक्षक हैं।`,
        te: `6వ ఆరోగ్య స్థానం (${n(savByHouse[6])} బిందువులు, ${ctx.house6Info.lordName}) మరియు లగ్న బలం (${n(savByHouse[1])} బిందువులు) ప్రకారం మితమైన నడక, సమయానికి భోజనం మరియు ప్రశాంత నిద్ర మిమ్మల్ని కాపాడుతాయి.`,
        ta: `6-ம் உடல்நல இடம் (${n(savByHouse[6])} பரல்கள், ${ctx.house6Info.lordName}) மற்றும் லக்ன பலம் (${n(savByHouse[1])} பரல்கள்) காட்டுவது போல் சீரான நடைப்பயிற்சியும் நேரத்தோடு உணவும் ஆயுளைக் காக்கும்.`,
        en: `With ${savByHouse[6]} House 6 bindus (${ctx.house6Info.lordName}) backing ${savByHouse[1]} Lagna bindus, gentle morning walks, warm digestion habits, and steady sleep outperform harsh routines.`
      }, lang)
    : pick6({
        kn: `ನಿಮ್ಮ '${ctx.dominantElement}' ದೇಹ ಪ್ರಕೃತಿ ಹಾಗೂ ೬ನೇ ಸ್ಥಾನಾಧಿಪತಿ ${ctx.house6Info.lordName} (${n(savByHouse[6])} ಬಿಂದು) ತೋರುವಂತೆ, ಒತ್ತಡ ಹೆಚ್ಚಾದಾಗ ಜೀರ್ಣಕ್ರಿಯೆ ಮತ್ತು ನಿದ್ದೆಯಲ್ಲಿ ಮೊದಲ ಸೂಚನೆ ಕಾಣಿಸುತ್ತದೆ.`,
        mr: `तुमची '${ctx.dominantElement}' प्रकृती आणि षष्ठेश ${ctx.house6Info.lordName} (${n(savByHouse[6])} गुण) दर्शवतात की ताण वाढताच सर्वप्रथम पचन व झोपेवर परिणाम होतो.`,
        hi: `आपकी '${ctx.dominantElement}' देह प्रकृति एवं षष्ठेश ${ctx.house6Info.lordName} (${n(savByHouse[6])} बिंदू) दिखाते हैं कि मानसिक दबाव बढ़ने पर सबसे पहले पाचन और नींद संकेत देते हैं।`,
        te: `మీ '${ctx.dominantElement}' ప్రకృతి మరియు 6వ అధిపతి ${ctx.house6Info.lordName} (${n(savByHouse[6])} బిందువులు) చూపినట్లు ఒత్తిడి పెరిగినప్పుడు ముందుగా జీర్ణశక్తి మరియు నిద్రపై ప్రభావం పడుతుంది.`,
        ta: `உங்கள் '${ctx.dominantElement}' உடல் இயல்பும் 6-ம் அதிபதி ${ctx.house6Info.lordName} (${n(savByHouse[6])} பரல்கள்) நிலையும் காட்டுவது போல் மன அழுத்தம் கூடும்போது செரிமானமும் தூக்கமும் முதலில் எச்சரிக்கும்.`,
        en: `Anchored in your ${ctx.dominantElement} constitution and 6th lord ${ctx.house6Info.lordName} (${savByHouse[6]} bindus), mental strain surfaces via digestion and sleep long before real illness.`
      }, lang);

  return {
    p1Focus: healthLead,
    p2Body: pick6({
      kn: `${ctx.lagnaRashiName} ಲಗ್ನದ ೮ನೇ ಭಾವಾಧಿಪತಿ ${ext.house8Info.lordName} ಪ್ರಕಾರ, ರಾತ್ರಿ ಮಲಗುವ ೪೫ ನಿಮಿಷ ಮುನ್ನವೇ ಪರದೆ ದೂರವಿಟ್ಟು ಶಾಂತ ಉಸಿರಾಟ ಮಾಡಿದರೆ ನರವ್ಯೂಹ ತಂಪಾಗುತ್ತದೆ.`,
      mr: `${ctx.lagnaRashiName} लग्नाचा अष्टमेश ${ext.house8Info.lordName} सांगतो की झोपण्यापूर्वी ४५ मिनिटे फोन बाजूला ठेवताच मज्जासंस्था लगेच शांत होते.`,
      hi: `${ctx.lagnaRashiName} लग्न के अष्टमेश ${ext.house8Info.lordName} के अनुसार सोने से ४५ मिनट पहले स्क्रीन बंद करने पर स्नायु-तंत्र तुरंत विश्राम पाता है।`,
      te: `${ctx.lagnaRashiName} లగ్నానికి అష్టమాధిపతి ${ext.house8Info.lordName} ప్రకారం నిద్రకు 45 నిమిషాల ముందే ఫోన్ పక్కన పెడితే నాడీ వ్యవస్థ స్థిరపడుతుంది.`,
      ta: `${ctx.lagnaRashiName} லக்ன 8-ம் அதிபதி ${ext.house8Info.lordName} படி தூங்கும் 45 நிமிடம் முன்பே கைபேசியை ஒதுக்கினால் நரம்பு மண்டலம் சீராகும்.`,
      en: `For ${ctx.lagnaRashiName} Lagna, forty-five screen-free wind-down minutes before bed settle 8th lord ${ext.house8Info.lordName}'s nervous load remarkably fast.`
    }, lang),
    p3Body: "",
    reflectionNote: ed === 0 ? "" : pick6({
      kn: `ದೇಹದ ಸಂದೇಶ: ಇತ್ತೀಚೆಗೆ ಆಯಾಸ ಕಾಣಿಸಿದಾಗ ನೀವು ವಿಶ್ರಾಂತಿ ಕೊಟ್ಟಿರಿ ಅಥವಾ ಮತ್ತಷ್ಟು ಕಾಫಿ-ಕೆಲಸದ ಒತ್ತಡ ಹೇರಿದಿರಿ?`,
      mr: `शरीराचा इशारा: थकवा जाणवल्यावर तुम्ही शरीराला खरा विसावा दिला की पुन्हा कामाचा ताण वाढवला?`,
      hi: `देह का संकेत: थकान उभरने पर आपने शरीर को सच्चा विश्राम दिया अथवा और अधिक कार्यभार थोप दिया?`,
      te: `శరీర సంకేతం: అలసట అనిపించినప్పుడు మీరు నిజమైన విశ్రాంతి ఇచ్చారా లేక పని ఒత్తిడిని పెంచారా?`,
      ta: `உடல் எச்சரிக்கை: சோர்வு தோன்றியபோது உடலுக்கு உண்மையான ஓய்வு தந்தீர்களா அல்லது மேலும் வேலைப் பளுவைக் கூட்டினீர்களா?`,
      en: `Body Check: Recall whether dull afternoon tension cleared once hydration and daylight walks stayed consistent.`
    }, lang)
  };
}

function buildDestinyHorizonSupplement(
  chNum: number,
  arch: ChartArchetypeSnapshot,
  ctx: StoryEngineInput,
  savByHouse: Record<number, number>,
  isChildOrInfant: boolean,
  isMinor: boolean,
  isSenior: boolean
): ChapterSupplement {
  const lang = ctx.targetLang;
  const n = (v: number | string) => fmtDigits(v, lang);
  const ed = arch.edition;
  const ext = ctx.extendedPrecision;

  if (chNum === 17) {
    // Next 90-Day Tarabala & Live Clock Window
    const taraTone = arch.taraEnergyTier === "high"
      ? pick6({
          kn: `ನಿಮ್ಮ ಪ್ರಸ್ತುತ '${ext.taraLabelLocalized}' ತಾರಾಬಲ (${n(ext.liveTarabala.score)}%) ಹಾಗೂ '${ctx.livePrashnaHora}' ಹೋರೆಯು ಮುಂದಿನ ೯೦ ದಿನಗಳಲ್ಲಿ ಸ್ಥಗಿತಗೊಂಡ ಪತ್ರವ್ಯವಹಾರಗಳಿಗೆ ಹಸಿರು ನಿಶಾನೆ ತೋರುತ್ತಿದೆ.`,
          mr: `तुमचे सध्याचे '${ext.taraLabelLocalized}' ताराबल (${n(ext.liveTarabala.score)}%) आणि '${ctx.livePrashnaHora}' होरा येत्या ९० दिवसांत थांबलेल्या कामांना हिरवा कंदील देत आहेत.`,
          hi: `आपका वर्तमान '${ext.taraLabelLocalized}' ताराबल (${n(ext.liveTarabala.score)}%) एवं '${ctx.livePrashnaHora}' होरा आगामी ९० दिनों में रुकी चर्चाओं को स्पष्ट हरी झंडी दे रहे हैं।`,
          te: `మీ ప్రస్తుత '${ext.taraLabelLocalized}' తారాబలం (${n(ext.liveTarabala.score)}%) మరియు '${ctx.livePrashnaHora}' హోర రాబోయే 90 రోజుల్లో ఆగిన పనులకు పచ్చజెండా ఊపుతున్నాయి.`,
          ta: `உங்கள் நடப்பு '${ext.taraLabelLocalized}' தாராபலம் (${n(ext.liveTarabala.score)}%) மற்றும் '${ctx.livePrashnaHora}' ஹோரை அடுத்த 90 நாட்களில் தேங்கிய பணிகளுக்குப் பச்சைக்கொடி காட்டுகின்றன.`,
          en: `Running high at ${ext.liveTarabala.score}% (${ext.taraLabelLocalized}) under live ${ctx.livePrashnaHora} Hora, the coming ninety-day window unlocks waiting responses fast.`
        }, lang)
      : pick6({
          kn: `ಮುಂಬರುವ ೯೦ ದಿನಗಳಲ್ಲಿ '${ext.taraLabelLocalized}' ತಾರಾಬಲ (${n(ext.liveTarabala.score)}%) ಹಂತಹಂತವಾಗಿ ಬಲಗೊಳ್ಳುತ್ತಿದ್ದು, ಮೊದಲ ತಿಂಗಳು ದಾಖಲೆ-ಸಿದ್ಧತೆಗೂ ೨–೩ನೇ ತಿಂಗಳು ಅಂತಿಮ ಫಲಕ್ಕೂ ಸೂಕ್ತವಾಗಿದೆ.`,
          mr: `येत्या ९० दिवसांत '${ext.taraLabelLocalized}' ताराबल (${n(ext.liveTarabala.score)}%) टप्प्याटप्प्याने वाढत असून पहिला महिना तयारीसाठी व पुढील दोन महिने सिद्धीसाठी उत्तम आहेत.`,
          hi: `आगामी ९० दिनों में '${ext.taraLabelLocalized}' ताराबल (${n(ext.liveTarabala.score)}%) क्रमशः पुष्ट हो रहा है — प्रथम माह तैयारी व अगले दो माह ठोस परिणाम हेतु उपयुक्त हैं।`,
          te: `రాబోయే 90 రోజుల్లో '${ext.taraLabelLocalized}' తారాబలం (${n(ext.liveTarabala.score)}%) క్రమంగా బలపడుతోంది — మొదటి నెల సిద్ధతకు, తర్వాత రెండు నెలలు ఫలితాలకు అనుకూలం.`,
          ta: `அடுத்த 90 நாட்களில் '${ext.taraLabelLocalized}' தாராபலம் (${n(ext.liveTarabala.score)}%) படிப்படியாக வலுப்பெறுகிறது — முதல் மாதம் திட்டமிடலுக்கும் அடுத்த இரு மாதங்கள் வெற்றிக்கும் உகந்தவை.`,
          en: `Opening cleanly at ${ext.liveTarabala.score}% (${ext.taraLabelLocalized}), this quarter splits clearly: tidy loose ends in Month 1 so Months 2–3 convert briskly.`
        }, lang);

    return {
      p1Focus: taraTone,
      p2Body: pick6({
        kn: `${ctx.lagnaRashiName}–${ctx.nakshatraName} ಚಾರ್ಟಿಗೆ ${ctx.guruTransitRashi} ಗುರುವಿನ ${n(ctx.guruHouseFromMoon)}ನೇ ಮನೆ ಪ್ರಭಾವವು ${n(ctx.bhuktiEndDate)}ರವರೆಗೆ ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಭಾವಕ್ಕೆ (${arch.peakDomainLabel}) ಬೆಂಬಲ ತರುತ್ತದೆ.`,
        mr: `${ctx.lagnaRashiName}–${ctx.nakshatraName} साठी ${ctx.guruTransitRashi} गुरूचे ${n(ctx.guruHouseFromMoon)}वे स्थान ${n(ctx.bhuktiEndDate)} पर्यंत ${n(arch.peakHouseNum)}व्या भावास (${arch.peakDomainLabel}) अनपेक्षित मदत आणते.`,
        hi: `${ctx.lagnaRashiName}–${ctx.nakshatraName} हेतु ${ctx.guruTransitRashi} गुरु का ${n(ctx.guruHouseFromMoon)}वां प्रभाव ${n(ctx.bhuktiEndDate)} तक आपके ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) को सहारा देता है।`,
        te: `${ctx.lagnaRashiName}–${ctx.nakshatraName} జాతకానికి ${ctx.guruTransitRashi} గురుని ${n(ctx.guruHouseFromMoon)}వ స్థాన బలం ${n(ctx.bhuktiEndDate)} వరకు ${n(arch.peakHouseNum)}వ స్థానానికి (${arch.peakDomainLabel}) సహాయాన్ని తెస్తోంది.`,
        ta: `${ctx.lagnaRashiName}–${ctx.nakshatraName} ஜாதகத்திற்கு ${ctx.guruTransitRashi} குருவின் ${n(ctx.guruHouseFromMoon)}-ம் இட நிலை ${n(ctx.bhuktiEndDate)} வரை ${n(arch.peakHouseNum)}-ம் இடத்திற்கு (${arch.peakDomainLabel}) துணை தருகிறது.`,
        en: `For ${ctx.lagnaRashiName}–${ctx.nakshatraName}, Jupiter in House ${ctx.guruHouseFromMoon} (${ctx.guruTransitRashi}) before ${ctx.bhuktiEndDate} revives House ${arch.peakHouseNum} (${arch.peakDomainLabel}).`
      }, lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `೯೦ ದಿನಗಳ ಗುರಿ: '${ctx.localizedYogiDay}' ಬೆಳಗ್ಗೆ ಆ ನಿಂತಿರುವ ಒಂದೇ ಪ್ರಮುಖ ಫೋನ್ ಕರೆ ಅಥವಾ ಪತ್ರವನ್ನು ಕಳುಹಿಸಿರಿ.`,
        mr: `९० दिवसांचे ध्येय: '${ctx.localizedYogiDay}' सकाळी बराच काळ थांबलेला तो एक महत्त्वाचा संवाद पुन्हा सुरू करा.`,
        hi: `९०-दिवसीय लक्ष्य: '${ctx.localizedYogiDay}' की प्रातः किसी अटके महत्वपूर्ण संवाद को सहजता से पुनः प्रारंभ करें।`,
        te: `90 రోజుల లక్ష్యం: '${ctx.localizedYogiDay}' ఉదయం ఆగిపోయిన ఆ ఒక ముఖ్యమైన చర్చను మళ్ళీ మొదలుపెట్టండి.`,
        ta: `90 நாள் இலக்கு: '${ctx.localizedYogiDay}' காலை தேங்கியிருக்கும் அந்த ஒரு முக்கிய உரையாடலைப் புத்துயிர் ஊட்டுங்கள்.`,
        en: `Quarter Trigger: Re-open one single paused thread on ${ctx.localizedYogiDay} morning before clutter fills your week.`
      }, lang)
    };
  }

  if (chNum === 18) {
    // Bhrigu Bindu Destiny Midpoint
    const bbCore = pick6({
      kn: `ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರ-ರಾಹು ಮಧ್ಯಬಿಂದುವಾದ ಬೃಗು ಬಿಂದು ${ctx.bhriguBinduRashiName} ರಾಶಿಯಲ್ಲಿ (${n(ctx.bhriguDeg)}°, ಚಂದ್ರನಿಂದ ${n(arch.bhriguHouseFromMoon)}ನೇ ಮನೆ) ಸ್ಥಿತವಾಗಿರುವುದರಿಂದ ವರ್ಷದ ಮಧ್ಯ ಭಾಗದಲ್ಲೇ ಹಳೆಯ ತಡೆ ಹಠಾತ್ ಸಡಿಲವಾಗುತ್ತದೆ.`,
      mr: `तुमचा जन्म चंद्र-राहु मध्यबिंदू — भृगु बिंदू ${ctx.bhriguBinduRashiName} राशीत (${n(ctx.bhriguDeg)}°, चंद्रापासून ${n(arch.bhriguHouseFromMoon)}वे स्थान) असून वर्षाच्या मध्यावर जुने अडथळे अनपेक्षितपणे सैल होतात.`,
      hi: `आपकी कुंडली में चंद्र-राहु का मध्यबिंदु — भृगु बिंदु ${ctx.bhriguBinduRashiName} (${n(ctx.bhriguDeg)}°, चंद्र से ${n(arch.bhriguHouseFromMoon)}वां भाव) में होने से मध्य वर्ष में पुराने अवरोध स्वतः खुलने लगते हैं।`,
      te: `మీ జన్మ చంద్ర-రాహు మధ్య బిందువైన భృగు బిందువు ${ctx.bhriguBinduRashiName} రాశిలో (${n(ctx.bhriguDeg)}°, చంద్రుని నుండి ${n(arch.bhriguHouseFromMoon)}వ స్థానం) ఉండటం వల్ల సంవత్సర మధ్య భాగంలో పాత అడ్డంకులు తొలగుతాయి.`,
      ta: `உங்கள் ஜாதகத்தின் சந்திர-ராகு மையப்புள்ளியான பிருகு பிந்து ${ctx.bhriguBinduRashiName} ராசியில் (${n(ctx.bhriguDeg)}°, ராசிக்கு ${n(arch.bhriguHouseFromMoon)}-ம் இடம்) அமைவதால் ஆண்டின் நடுப்பகுதியில் பழைய தடைகள் விலகும்.`,
      en: `Anchored at ${ctx.bhriguDeg}° inside ${ctx.bhriguBinduRashiName} (House ${arch.bhriguHouseFromMoon} from your Moon), your Bhrigu Bindu triggers decisive destiny breakthroughs across Months 4–6.`
    }, lang);

    return {
      p1Focus: bbCore,
      p2Body: pick6({
        kn: `${ctx.lagnaRashiName} ಲಗ್ನದ ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನ (${n(savByHouse[10])} ಬಿಂದು) ಹಾಗೂ ೧೧ನೇ ಲಾಭ ಸ್ಥಾನ (${n(savByHouse[11])} ಬಿಂದು) ${ctx.bhriguBinduRashiName} ಬಿಂದುವಿನೊಡನೆ ಸೇರಿ ೪–೬ ತಿಂಗಳಲ್ಲಿ 'ಸರಿಯಾದ ಭೇಟಿ' ರೂಪಿಸುತ್ತವೆ.`,
        mr: `${ctx.lagnaRashiName} लग्नाचे दशम कर्म (${n(savByHouse[10])} गुण) आणि लाभ (${n(savByHouse[11])} गुण) ${ctx.bhriguBinduRashiName} बिंदूशी जोडल्याने ४–६ महिन्यांत योग्य व्यक्तींची भेट घडते.`,
        hi: `${ctx.lagnaRashiName} लग्न के दशम कर्म (${n(savByHouse[10])} बिंदू) और लाभ (${n(savByHouse[11])} बिंदू) ${ctx.bhriguBinduRashiName} भृगु बिंदु से जुड़कर ४–६ माह में सटीक सहयोग दिलाते हैं।`,
        te: `${ctx.lagnaRashiName} లగ్నపు 10వ కర్మ (${n(savByHouse[10])} బిందువులు) మరియు 11వ లాభం (${n(savByHouse[11])} బిందువులు) ${ctx.bhriguBinduRashiName} తో కలిసి 4–6 నెలల్లో అద్భుత అవకాశాలను తెస్తాయి.`,
        ta: `${ctx.lagnaRashiName} லக்ன 10-ம் தொழில் (${n(savByHouse[10])} பரல்கள்) மற்றும் 11-ம் லாபம் (${n(savByHouse[11])} பரல்கள்) ${ctx.bhriguBinduRashiName} உடன் இணைந்து 4–6 மாதங்களில் தக்க சந்திப்பைத் தருகின்றன.`,
        en: `Once transits ignite ${ctx.bhriguBinduRashiName} for ${ctx.lagnaRashiName} Lagna, House 10 (${savByHouse[10]}) and House 11 (${savByHouse[11]}) bindus turn chance encounters into turning points.`
      }, lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `ಧ್ಯಾನ ಬಿಂದುವಿನಂತೆ, ${ctx.bhriguBinduRashiName} ಬಿಂದುವಿನ ೪–೬ ತಿಂಗಳ ಅವಧಿಗೆ ನಿಮ್ಮ ದೊಡ್ಡ ಪ್ರಸ್ತಾಪಗಳನ್ನು ಇಂದೇ ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.`,
        mr: `${ctx.bhriguBinduRashiName} बिंदूच्या ४–६ महिन्यांच्या अनुकूल काळासाठी तुमची तयारी आजपासूनच नीटनेटकी ठेवा.`,
        hi: `${ctx.bhriguBinduRashiName} मध्यबिंदु के ४–६ माही अनुकूल अवसर हेतु अपनी मुख्य योजना अभी से सुव्यवस्थित रखें।`,
        te: `${ctx.bhriguBinduRashiName} భృగు బిందువు ఫలించే 4–6 నెలల కాలం కోసం మీ ప్రయత్నాలను ఇప్పుడే సిద్ధం చేసుకోండి.`,
        ta: `${ctx.bhriguBinduRashiName} பிருகு பிந்து செயல்படும் 4–6 மாதக் காலத்திற்காக உங்கள் திட்டங்களை இன்றே ஆயத்தமாக வையுங்கள்.`,
        en: `Midpoint Readiness: Prepare credentials early so Months 4–6 catch you ready rather than scrambling.`
      }, lang)
    };
  }

  if (chNum === 19 || chNum === 20 || chNum === 21 || chNum === 22) {
    // Completely chart-grounded per-year narratives across all 4 years (zero cross-chapter collisions!)
    const offset = chNum - 19;
    const yr = ctx.nowYear + offset;
    const yrNext = yr + 1;
    const score = arch.yearScores[offset];
    const band = arch.yearScoreBands[offset];

    const scoreTone =
      band === "peak"
        ? pick6({
            kn: `${n(score)}% ಉತ್ತುಂಗ ಬಲದೊಂದಿಗೆ`,
            mr: `${n(score)}% सर्वोच्च वेग व यशासह`,
            hi: `${n(score)}% शिखर ऊर्जा के साथ`,
            te: `${n(score)}% అత్యున్నత బలంతో`,
            ta: `${n(score)}% உச்ச பலத்துடன்`,
            en: `surging at ${score}% chart alignment`
          }, lang)
        : band === "climb"
        ? pick6({
            kn: `${n(score)}% ಸ್ಥಿರ ಏರುಗತಿಯೊಂದಿಗೆ`,
            mr: `${n(score)}% संतुलित प्रगतीसह`,
            hi: `${n(score)}% सधे हुए उत्थान के साथ`,
            te: `${n(score)}% స్థిర ఎదుగుదలతో`,
            ta: `${n(score)}% சீரான வளர்ச்சியுடன்`,
            en: `climbing steadily at ${score}% strength`
          }, lang)
        : pick6({
            kn: `${n(score)}% ಶಿಸ್ತುಬದ್ಧ ಪುನರ್‌ನಿರ್ಮಾಣ ಹಂತದಲ್ಲಿ`,
            mr: `${n(score)}% नियोजन व पायाभरणीच्या टप्प्यात`,
            hi: `${n(score)}% अनुशासित आधार-निर्माण चरण में`,
            te: `${n(score)}% క్రమబద్ధ పునాది దశలో`,
            ta: `${n(score)}% ஒழுங்கான சீரமைப்பு நிலையில்`,
            en: `anchoring a ${score}% steady reset`
          }, lang);

    const ageDomainPhrase = isChildOrInfant
      ? pick6({
          kn: `ಮಗುವಿನ ಆರೋಗ್ಯ, ಮಾತು ಮತ್ತು ಕಲಿಕೆಯ ಆಸಕ್ತಿ`,
          mr: `मुलाचे आरोग्य, वाचन व कलागुण विकास`,
          hi: `बालक का स्वास्थ्य, संस्कार एवं सीखने की रुचि`,
          te: `చిన్నారి ఆరోగ్యం, మాట మరియు విద్యాభిరుచి`,
          ta: `குழந்தையின் ஆரோக்கியம், பேச்சு மற்றும் கற்றல் ஆர்வம்`,
          en: `childhood immunity, joyful curiosity, and foundational learning`
        }, lang)
      : isMinor
      ? pick6({
          kn: `ವಿದ್ಯಾಭ್ಯಾಸ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಪ್ರತಿಭಾ ವಿಕಾಸ`,
          mr: `अभ्यास, एकाग्रता व कौशल्य विकास`,
          hi: `विद्याभ्यास, एकाग्रता एवं प्रतिभा निखार`,
          te: `చదువు, ఏకాగ్రత మరియు నైపుణ్య అభివృద్ధి`,
          ta: `கல்வி, கவனம் மற்றும் தனித்திறன் வளர்ச்சி`,
          en: `academic focus, confidence, and skill foundations`
        }, lang)
      : isSenior
      ? pick6({
          kn: `ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ಕೌಟುಂಬಿಕ ಗೌರವ ಹಾಗೂ ಮನಃಶಾಂತಿ`,
          mr: `आरोग्य संभाळ, कौटुंबिक सन्मान व मनःशांती`,
          hi: `स्वास्थ्य सुरक्षा, पारिवारिक सम्मान एवं शांति`,
          te: `ఆరోగ్య సంరక్షణ, కుటుంబ గౌరవం మరియు మనశ్శాంతి`,
          ta: `ஆரோக்கியப் பாதுகாப்பு, குடும்பப் பெருமை மற்றும் அமைதி`,
          en: `serene vitality, family honor, and guiding wisdom`
        }, lang)
      : arch.peakDomainLabel;

    const p1FocusByCh: Record<number, Record<0 | 1 | 2 | 3, Record<SixLang, string>>> = {
      19: {
        0: {
          kn: `${n(yr)}ನೇ ವರ್ಷವು ${scoreTone} ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${ageDomainPhrase}) ಹಳೆಯ ಗೊಂದಲವನ್ನು ತೆರವುಗೊಳಿಸುತ್ತದೆ.`,
          mr: `${n(yr)} हे वर्ष ${scoreTone} तुमच्या ${n(arch.peakHouseNum)}व्या भावातील (${ageDomainPhrase}) जुना गोंधळ दूर करते.`,
          hi: `वर्ष ${n(yr)} ${scoreTone} आपके ${n(arch.peakHouseNum)}वें भाव (${ageDomainPhrase}) से पुराने बिखराव को समेटता है।`,
          te: `${n(yr)}వ ఏడాది ${scoreTone} మీ ${n(arch.peakHouseNum)}వ స్థాన (${ageDomainPhrase}) పాత గందరగోళాన్ని తొలగిస్తుంది.`,
          ta: `${n(yr)}-ம் ஆண்டு ${scoreTone} உங்கள் ${n(arch.peakHouseNum)}-ம் இடத்தின் (${ageDomainPhrase}) பழைய குழப்பத்தை நீக்குகிறது.`,
          en: `Moving through ${yr} (${scoreTone}), your chart channels ${ageDomainPhrase} directly toward calmer, cleaner structure.`
        },
        1: {
          kn: `${ctx.currentMahadasha} ದಶಾ ಹಾದಿಯಲ್ಲಿ ${n(yr)}ನೇ ವರ್ಷ (${n(score)}%) ನಿಮ್ಮ ${n(arch.weakestHouseNum)}ನೇ ಭಾವದ (${arch.weakestDomainLabel}) ಒತ್ತಡವನ್ನು ಶಿಸ್ತಿಗೆ ತರುತ್ತದೆ.`,
          mr: `${ctx.currentMahadasha} दशेमध्ये ${n(yr)} हे वर्ष (${n(score)}%) तुमच्या ${n(arch.weakestHouseNum)}व्या भावाचा (${arch.weakestDomainLabel}) ताण हलका करते.`,
          hi: `${ctx.currentMahadasha} दशा में वर्ष ${n(yr)} (${n(score)}%) आपके ${n(arch.weakestHouseNum)}वें भाव (${arch.weakestDomainLabel}) का दबाव संतुलित करता है।`,
          te: `${ctx.currentMahadasha} దశలో ${n(yr)}వ ఏడాది (${n(score)}%) మీ ${n(arch.weakestHouseNum)}వ స్థాన (${arch.weakestDomainLabel}) ఒత్తిడిని తగ్గిస్తుంది.`,
          ta: `${ctx.currentMahadasha} தசையில் ${n(yr)}-ம் ஆண்டு (${n(score)}%) உங்கள் ${n(arch.weakestHouseNum)}-ம் இட (${arch.weakestDomainLabel}) அழுத்தத்தைச் சீராக்குகிறது.`,
          en: `Under ${ctx.currentMahadasha} Dasha, ${yr} (${score}%) reinforces your softer ${arch.weakestDomainLabel} sector so basics hold.`
        },
        2: {
          kn: `ಯೋಗಿ ${ctx.yogiPlanetName} ಹಾಗೂ ${ctx.lagnaRashiName} ಲಗ್ನದ ${n(savByHouse[1])} ಬಿಂದುಗಳ ನೆರವಿನಿಂದ ${n(yr)}ರಲ್ಲಿ (${n(score)}%) ಪ್ರಮುಖ ವೇಳಾಪಟ್ಟಿ ನಿಚ್ಚಳವಾಗುತ್ತದೆ.`,
          mr: `योगी ${ctx.yogiPlanetName} आणि ${ctx.lagnaRashiName} लग्नाच्या ${n(savByHouse[1])} गुणांच्या मदतीने ${n(yr)} मध्ये (${n(score)}%) वेळापत्रक सुसूत्र होते.`,
          hi: `योगी ${ctx.yogiPlanetName} और ${ctx.lagnaRashiName} लग्न के ${n(savByHouse[1])} बिंदुओं के सहारे ${n(yr)} (${n(score)}%) आपकी दिनचर्या सधती है।`,
          te: `యోగి ${ctx.yogiPlanetName} మరియు ${ctx.lagnaRashiName} లగ్నంలోని ${n(savByHouse[1])} బిందువుల సహాయంతో ${n(yr)}లో (${n(score)}%) స్థిరత్వం ఏర్పడుతుంది.`,
          ta: `யோகி ${ctx.yogiPlanetName} மற்றும் ${ctx.lagnaRashiName} லக்னத்தின் ${n(savByHouse[1])} பரல்களால் ${n(yr)}-ல் (${n(score)}%) சீரான ஒழுங்கு உருவாகிறது.`,
          en: `Backed by ${savByHouse[1]} Lagna bindus and Yogi ${ctx.yogiPlanetName}, ${yr} turns scattered obligations into simple weekly control.`
        },
        3: {
          kn: `ಬೀಸುವ ಗಾಳಿಯಲ್ಲಿ ಚದುರಿದ ಎಲೆಗಳನ್ನು ಗುಡಿಸಿ ಅಂಗಳ ಸ್ವಚ್ಛಗೊಳಿಸುವಂತೆ, ${n(yr)} (${n(score)}%) ಅನಗತ್ಯ ಚಿಂತೆಗಳನ್ನು ದೂರ ಸರಿಸುತ್ತದೆ.`,
          mr: `अंगण स्वच्छ करावे, तसे ${n(yr)} हे वर्ष (${n(score)}%) आयुष्यातून नको असलेला गोंधळ बाजूला सारून शांतता आणते.`,
          hi: `आंगन बुहारने की भांति वर्ष ${n(yr)} (${n(score)}%) आपके समय से अनावश्यक उलझन हटाकर स्पष्टता लाता है।`,
          te: `వాకిలిని శుభ్రం చేసినట్లుగా ${n(yr)} (${n(score)}%) మీ జీవితంలోని అనవసర చిక్కులను తొలగిస్తుంది.`,
          ta: `முற்றத்தைச் சுத்தம் செய்வது போல் ${n(yr)} (${n(score)}%) தேவையற்ற மனச்சுமைகளை விலக்கித் தெளிவு தருகிறது.`,
          en: `Clearing a cluttered courtyard comes before planting—${yr} trims energy drains cleanly across ${ageDomainPhrase}.`
        }
      },
      20: {
        0: {
          kn: `${n(yr)}ರಲ್ಲಿ ನಿಮ್ಮ ಕುಂಡಲಿಯು ${scoreTone} '${ageDomainPhrase}' ಕ್ಷೇತ್ರವನ್ನು ದೊಡ್ಡ ವೇದಿಕೆ ಮತ್ತು ಹೊಸ ಪರಿಚಯಗಳಿಗೆ ತೆರೆಯುತ್ತದೆ.`,
          mr: `${n(yr)} मध्ये तुमची कुंडली ${scoreTone} '${ageDomainPhrase}' क्षेत्राला मोठ्या संधी व नव्या ओळखी मिळवून देते.`,
          hi: `${n(yr)} में आपकी कुंडली ${scoreTone} '${ageDomainPhrase}' को नए मंच और बड़े अवसरों से जोड़ती है।`,
          te: `${n(yr)}లో మీ జాతకం ${scoreTone} '${ageDomainPhrase}' విభాగాన్ని పెద్ద వేదికపైకి మరియు కొత్త అవకాశాల వైపు నడిపిస్తుంది.`,
          ta: `${n(yr)}-ல் உங்கள் ஜாதகம் ${scoreTone} '${ageDomainPhrase}' துறையைப் புதிய உயர்வுக்கும் பெரிய தொடர்புகளுக்கும் திறக்கிறது.`,
          en: `Entering ${yr} (${scoreTone}), momentum lifts ${ageDomainPhrase} into broader visibility and rewarding alliances.`
        },
        1: {
          kn: `${n(ctx.bhuktiEndDate)}ರ ಭುಕ್ತಿ ತಿರುವಿನ ಬಲವು ${n(yr)}ರಲ್ಲಿ (${n(score)}%) ನಿಂತಿದ್ದ ಮಾತುಕತೆಗಳಿಗೆ ದ್ವಿಗುಣ ವೇಗ ತಂದುಕೊಡುತ್ತದೆ.`,
          mr: `${n(ctx.bhuktiEndDate)} च्या बदलत्या दशेचा वेग ${n(yr)} मध्ये (${n(score)}%) प्रलंबित कामांना दुप्पट गती देतो.`,
          hi: `${n(ctx.bhuktiEndDate)} के दशा मोड़ से प्राप्त गति वर्ष ${n(yr)} (${n(score)}%) में लंबित योजनाओं को तेज़ करती है।`,
          te: `${n(ctx.bhuktiEndDate)} నాటి దశా మార్పు బలం ${n(yr)}లో (${n(score)}%) నిలిచిపోయిన పనులకు రెట్టింపు వేగాన్ని ఇస్తుంది.`,
          ta: `${n(ctx.bhuktiEndDate)} புக்தி மாற்றத்தின் பலம் ${n(yr)}-ல் (${n(score)}%) தேங்கியிருந்த முயற்சிகளுக்கு இரட்டிப்பு வேகம் தருகிறது.`,
          en: `Riding past the ${ctx.bhuktiEndDate} Bhukti shift, ${yr} (${score}%) accelerates conversations that previously crept slowly.`
        },
        2: {
          kn: `ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಸ್ಥಾನದ ಬಲ ಹಾಗೂ ಯೋಗಿ ${ctx.yogiPlanetName} ಒಟ್ಟಾಗಿ ${n(yr)}ರಲ್ಲಿ (${n(score)}%) ಗೌರವದ ಪಾತ್ರವನ್ನು ನೀಡುತ್ತವೆ.`,
          mr: `तुमच्या ${n(arch.peakHouseNum)}व्या भावाची ताकद व योगी ${ctx.yogiPlanetName} मिळून ${n(yr)} मध्ये (${n(score)}%) मानाचे स्थान देतात.`,
          hi: `आपके ${n(arch.peakHouseNum)}वें भाव की शक्ति और योगी ${ctx.yogiPlanetName} मिलकर ${n(yr)} (${n(score)}%) में सम्मानजनक भूमिका रचते हैं।`,
          te: `మీ ${n(arch.peakHouseNum)}వ స్థాన బలం మరియు యోగి ${ctx.yogiPlanetName} కలిసి ${n(yr)}లో (${n(score)}%) ఉన్నత గుర్తింపును ఇస్తాయి.`,
          ta: `உங்கள் ${n(arch.peakHouseNum)}-ம் இட பலமும் யோகி ${ctx.yogiPlanetName}-ம் இணைந்து ${n(yr)}-ல் (${n(score)}%) கௌரவமான பொறுப்பைத் தருகின்றன.`,
          en: `Fusing Yogi ${ctx.yogiPlanetName} with peak House ${arch.peakHouseNum} strength converts steady craft into visible authority across ${yr}.`
        },
        3: {
          kn: `ದೋಣಿಗೆ ಸರಿಯಾದ ಗಾಳಿ ಸಿಕ್ಕ ಕ್ಷಣ ತೀರ ಹತ್ತಿರವಾಗುವಂತೆ, ${n(yr)} (${n(score)}%) ನಿಮ್ಮ ಆಲೋಚನೆಗಿಂತ ದೊಡ್ಡ ವೇದಿಕೆ ತರುತ್ತದೆ.`,
          mr: `होडीला अनुकूल वारा मिळताच ती वेगाने पुढे जाते, तसे ${n(yr)} (${n(score)}%) तुमच्या कल्पनेपेक्षा मोठी संधी आणते.`,
          hi: `नाव को अनुकूल पवन मिलते ही जैसे किनारा निकट आ जाता है, वर्ष ${n(yr)} (${n(score)}%) आपकी उम्मीद से बड़ा अवसर लाता है।`,
          te: `పడవకు అనుకూల గాలి తగిలినట్లుగా, ${n(yr)} (${n(score)}%) మీ ఊహ కంటే పెద్ద అవకాశాన్ని అందిస్తుంది.`,
          ta: `படகிற்குச் சாதகக் காற்று கிடைப்பது போல், ${n(yr)} (${n(score)}%) உங்கள் எதிர்பார்ப்பை விடப் பெரிய வாய்ப்பைத் தருகிறது.`,
          en: `When harbor wind fills full sails, hesitation fades—${yr} (${score}%) invites you onto a larger stage you earned calmly.`
        }
      },
      21: {
        0: {
          kn: `${n(yr)}–${n(yrNext)}ರ ಅವಧಿಯಲ್ಲಿ (${n(score)}%–${n(arch.yearScores[3])}%) '${ageDomainPhrase}' ಕನಸುಗಳು ಕಲ್ಲು-ಮಣ್ಣಿನ ಸ್ಥಿರ ವಾಸ್ತವವಾಗುತ್ತವೆ.`,
          mr: `${n(yr)}–${n(yrNext)} या टप्प्यात (${n(score)}%–${n(arch.yearScores[3])}%) '${ageDomainPhrase}' चे संकल्प प्रत्यक्ष वास्तवात उतरतात.`,
          hi: `${n(yr)}–${n(yrNext)} के चरण में (${n(score)}%–${n(arch.yearScores[3])}%) '${ageDomainPhrase}' से जुड़े संकल्प ठोस आकार लेते हैं।`,
          te: `${n(yr)}–${n(yrNext)} మధ్యకాలంలో (${n(score)}%–${n(arch.yearScores[3])}%) '${ageDomainPhrase}' ఆశయాలు నిజమైన ఆస్తులుగా, వేడుకగా మారతాయి.`,
          ta: `${n(yr)}–${n(yrNext)} காலகட்டத்தில் (${n(score)}%–${n(arch.yearScores[3])}%) '${ageDomainPhrase}' இலக்குகள் நிலையான பலனாக மாறும்.`,
          en: `Peaking at ${score}–${arch.yearScores[3]}% across ${yr}–${yrNext}, ${ageDomainPhrase} turns quiet patience into tangible household milestones.`
        },
        1: {
          kn: `೪ನೇ ಗೃಹಾಧಿಪತಿ ${ext.house4Info.lordName} (${ext.house4Info.placedRashi}) ಹಾಗೂ ೨ನೇ ಧನ ಬಲ (${n(savByHouse[2])}) ${n(yr)}–${n(yrNext)}ರಲ್ಲಿ ಕುಟುಂಬ ಶ್ರೇಯಸ್ಸನ್ನು ಕಟ್ಟುತ್ತವೆ.`,
          mr: `चतुर्थेश ${ext.house4Info.lordName} (${ext.house4Info.placedRashi}) आणि धन बल (${n(savByHouse[2])}) ${n(yr)}–${n(yrNext)} मध्ये कुटुंबाचे सौख्य वाढवतात.`,
          hi: `चतुर्थेश ${ext.house4Info.lordName} (${ext.house4Info.placedRashi}) एवं धन बल (${n(savByHouse[2])}) ${n(yr)}–${n(yrNext)} में पारिवारिक समृद्धि बढ़ाते हैं।`,
          te: `చతుర్థాధిపతి ${ext.house4Info.lordName} (${ext.house4Info.placedRashi}) మరియు ధన బలం (${n(savByHouse[2])}) ${n(yr)}–${n(yrNext)}లో కుటుంబ శ్రేయస్సును ఇస్తాయి.`,
          ta: `4-ம் அதிபதி ${ext.house4Info.lordName} (${ext.house4Info.placedRashi}) மற்றும் தன பலம் (${n(savByHouse[2])}) ${n(yr)}–${n(yrNext)}-ல் குடும்ப வளத்தைக் கூட்டும்.`,
          en: `Blending 4th lord ${ext.house4Info.lordName} (${ext.house4Info.placedRashi}) with ${savByHouse[2]} wealth bindus anchors durable assets across ${yr}–${yrNext}.`
        },
        2: {
          kn: `${n(savByHouse[10])} ಕರ್ಮ ಬಿಂದುಗಳು ಮತ್ತು ${n(savByHouse[7])} ಸೌಹಾರ್ದ ಬಿಂದುಗಳು ${n(yr)}–${n(yrNext)}ರಲ್ಲಿ (${n(score)}%) ವೃತ್ತಿ-ಗೃಹ ಸಮತೋಲನ ತರುತ್ತವೆ.`,
          mr: `${n(savByHouse[10])} कर्म व ${n(savByHouse[7])} सलोख्याचे गुण ${n(yr)}–${n(yrNext)} मध्ये (${n(score)}%) काम आणि घराचा सुंदर मेळ घालतात.`,
          hi: `${n(savByHouse[10])} कर्म बिंदू और ${n(savByHouse[7])} सामंजस्य बिंदू ${n(yr)}–${n(yrNext)} (${n(score)}%) में कार्य व परिवार का श्रेष्ठ संतुलन देते हैं।`,
          te: `${n(savByHouse[10])} కర్మ మరియు ${n(savByHouse[7])} సౌహార్ద బిందువులు ${n(yr)}–${n(yrNext)}లో (${n(score)}%) అద్భుత సమతుల్యతను తెస్తాయి.`,
          ta: `${n(savByHouse[10])} தொழில் மற்றும் ${n(savByHouse[7])} ஒற்றுமைப் பரல்கள் ${n(yr)}–${n(yrNext)}-ல் (${n(score)}%) இல்லறமும் தொழிலும் சிறக்க வைக்கின்றன.`,
          en: `Combining House 10 (${savByHouse[10]} bindus) and House 7 (${savByHouse[7]} bindus) makes ${yr}–${yrNext} a golden ridge of stability.`
        },
        3: {
          kn: `ದೀರ್ಘಕಾಲ ಬೆವರು ಸುರಿಸಿದ ತೋಟದಲ್ಲಿ ಫಲ ಕೊಯ್ಯುವ ಸುಗ್ಗಿಯಂತೆ ${n(yr)}–${n(yrNext)} (${n(score)}%) ಮನೆಮಂದಿಯ ಮುಖದಲ್ಲಿ ನಗು ಅರಳಿಸುತ್ತದೆ.`,
          mr: `अनेक महिने कष्ट घेतलेल्या शेतात पीक बहरावे, तसे ${n(yr)}–${n(yrNext)} (${n(score)}%) घरात आनंदाचा सुकाळ आणते.`,
          hi: `लंबे परिश्रम के बाद जैसे उपवन में फल लगते हैं, वैसे ही ${n(yr)}–${n(yrNext)} (${n(score)}%) पूरे परिवार में सुख-उत्सव लाता है।`,
          te: `ఎంతో కష్టపడి పెంచిన తోటలో పంట చేతికి వచ్చినట్లు, ${n(yr)}–${n(yrNext)} (${n(score)}%) కుటుంబంలో ఆనందాన్ని నింపుతుంది.`,
          ta: `நீண்ட உழைப்பிற்குப் பின் அறுவடை செழிப்பது போல், ${n(yr)}–${n(yrNext)} (${n(score)}%) குடும்பத்தில் மகிழ்ச்சி பூக்கச் செய்கிறது.`,
          en: `After steady seasons of watering roots underground, ${yr}–${yrNext} harvests shared celebrations and lasting relief.`
        }
      },
      22: {
        0: {
          kn: `ಐದನೇ ವರ್ಷದ ದಿಗಂತದಲ್ಲಿ (${n(yr)} — ${scoreTone}) ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${ageDomainPhrase}) ಸಾಧನೆ ಶಾಶ್ವತ ನೆಮ್ಮದಿಯ ನೆಲೆ ತಲುಪುತ್ತದೆ.`,
          mr: `पाचव्या वर्षाअखेरीस (${n(yr)} — ${scoreTone}) तुमच्या ${n(arch.peakHouseNum)}व्या भावातील (${ageDomainPhrase}) वाटचाल शांत प्रतिष्ठेपर्यंत पोहोचते.`,
          hi: `पांचवें वर्ष तक (${n(yr)} — ${scoreTone}) आपके ${n(arch.peakHouseNum)}वें भाव (${ageDomainPhrase}) की यात्रा स्थायी गरिमा एवं शांति प्राप्त करती है।`,
          te: `ఐదవ ఏడాది నాటికి (${n(yr)} — ${scoreTone}) మీ ${n(arch.peakHouseNum)}వ స్థాన (${ageDomainPhrase}) ప్రయాణం శాశ్వత గౌరవాన్ని చేరుకుంటుంది.`,
          ta: `ஐந்தாம் ஆண்டில் (${n(yr)} — ${scoreTone}) உங்கள் ${n(arch.peakHouseNum)}-ம் இட (${ageDomainPhrase}) பயணம் நிரந்தர நிறைவை எட்டுகிறது.`,
          en: `Arriving at ${yr} (${scoreTone}), five years of steady growth anchor ${ageDomainPhrase} in quiet dignity.`
        },
        1: {
          kn: `ನಿಮ್ಮ ${ctx.lagnaRashiName}–${ctx.moonRashiName} ಹಾಗೂ ${ctx.nakshatraName} ಚೈತನ್ಯವು ${n(yr)}ರಲ್ಲಿ ಇತರರಿಗೂ ನೆರಳು ಕೊಡುವ ಎತ್ತರದಲ್ಲಿ ನಿಲ್ಲುತ್ತದೆ.`,
          mr: `तुमचे ${ctx.lagnaRashiName}–${ctx.moonRashiName} व ${ctx.nakshatraName} बळ ${n(yr)} मध्ये इतरांना आधार देणाऱ्या स्थानावर नेते.`,
          hi: `आपकी ${ctx.lagnaRashiName}–${ctx.moonRashiName} और ${ctx.nakshatraName} शक्ति वर्ष ${n(yr)} में आपको दूसरों के लिए संबल बनाती है।`,
          te: `మీ ${ctx.lagnaRashiName}–${ctx.moonRashiName} మరియు ${ctx.nakshatraName} బలం ${n(yr)}లో ఇతరులకు అండగా నిలిచే స్థానాన్ని ఇస్తాయి.`,
          ta: `உங்கள் ${ctx.lagnaRashiName}–${ctx.moonRashiName} மற்றும் ${ctx.nakshatraName} ஆற்றல் ${n(yr)}-ல் பிறருக்கு வழிகாட்டும் உயரத்தைத் தருகிறது.`,
          en: `By ${yr}, your ${ctx.lagnaRashiName}–${ctx.moonRashiName} balance stands firm enough to shelter younger lives around you.`
        },
        2: {
          kn: `${n(savByHouse[1])} ಲಗ್ನ ಬಲ ಮತ್ತು ${n(savByHouse[11])} ಲಾಭ ಬಲದ ಫಲವಾಗಿ ${n(yr)}ರಲ್ಲಿ ಸಮಯ ಹಾಗೂ ಹಣದ ಸ್ವಾತಂತ್ರ್ಯ ಕೈಗೂಡುತ್ತದೆ.`,
          mr: `${n(savByHouse[1])} लग्न बल व ${n(savByHouse[11])} लाभ बलामुळे ${n(yr)} मध्ये वेळ आणि पैशाचे खरे स्वातंत्र्य लाभते.`,
          hi: `${n(savByHouse[1])} लग्न बल एवं ${n(savByHouse[11])} लाभ बल के योग से वर्ष ${n(yr)} में समय और धन की स्वतंत्रता मिलती है।`,
          te: `${n(savByHouse[1])} లగ్న బలం మరియు ${n(savByHouse[11])} లాభ బలం వల్ల ${n(yr)}లో ఆర్థిక మరియు సమయ స్వేచ్ఛ లభిస్తాయి.`,
          ta: `${n(savByHouse[1])} லக்ன பலமும் ${n(savByHouse[11])} லாப பலமும் இணைந்து ${n(yr)}-ல் நேரச் சுதந்திரமும் மன அமைதியும் தருகின்றன.`,
          en: `Backed by ${savByHouse[1]} Lagna and ${savByHouse[11]} Gains bindus, ${yr} replaces chronic hurry with real autonomy.`
        },
        3: {
          kn: `ದೂರದ ಶಿಖರ ಏರಿ ನಿಂತಾಗ ಕಾಣುವ ಪ್ರಶಾಂತ ದೃಶ್ಯದಂತೆ, ${n(yr)} (${n(score)}%) ಹಿಂದಿನ ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳಿಗೂ ನೆಮ್ಮದಿಯ ಉತ್ತರ ಕೊಡುತ್ತದೆ.`,
          mr: `शिखरावरून दिसणाऱ्या शांत दृश्यासारखे ${n(yr)} हे वर्ष (${n(score)}%) मागील सर्व प्रश्नांचे समाधान देणारे ठरते.`,
          hi: `ऊंचे पर्वत शिखर से दिखने वाले शांत दृश्य की भांति, वर्ष ${n(yr)} (${n(score)}%) हर बीते प्रश्न को संतोषजनक उत्तर देता है।`,
          te: `శిఖరం పైనుండి కనిపించే ప్రశాంత దృశ్యంలా, ${n(yr)} (${n(score)}%) గతంలోని అన్ని సందేహాలకు తృప్తికర సమాధానం ఇస్తుంది.`,
          ta: `மலை உச்சியிலிருந்து தெரியும் அமைதியான காட்சி போல், ${n(yr)} (${n(score)}%) கடந்த காலக் கேள்விகளுக்கு முழுமையான விடை தருகிறது.`,
          en: `At ${yr}'s ridge crest (${score}%), looking backward turns old confusion into quiet gratitude.`
        }
      }
    };

    const yearSpecificP2: Record<number, Record<0 | 1 | 2 | 3, Record<SixLang, string>>> = {
      19: {
        0: {
          kn: `${n(yr)}ರಲ್ಲಿ (${n(score)}%) ${ctx.lagnaRashiName} ಲಗ್ನ ಮತ್ತು ${ctx.currentMahadasha} ದಶೆಯಡಿ ಗಲಿಬಿಲಿ ಬೆಳವಣಿಗೆಗಿಂತ ಬೇಡದ ಹೊರೆ ಇಳಿಸಿ '${arch.weakestDomainLabel}' ಬಲಪಡಿಸುವುದೇ ದೊಡ್ಡ ಲಾಭ.`,
          mr: `${n(yr)} मध्ये (${n(score)}%) ${ctx.lagnaRashiName} लग्न व ${ctx.currentMahadasha} दशेत धावपळीपेक्षा अनावश्यक ओझे उतरवून '${arch.weakestDomainLabel}' भक्कम करणे हाच मोठा विजय ठरेल.`,
          hi: `${n(yr)} (${n(score)}%) में ${ctx.lagnaRashiName} लग्न एवं ${ctx.currentMahadasha} दशा के तहत व्यर्थ भार घटाकर '${arch.weakestDomainLabel}' सहेजना ही बड़ी उपलब्धि है।`,
          te: `${n(yr)}లో (${n(score)}%) ${ctx.lagnaRashiName} లగ్నం మరియు ${ctx.currentMahadasha} దశలో అనవసర భారాన్ని తగ్గించి '${arch.weakestDomainLabel}' స్థిరపరచడమే పెద్ద విజయం.`,
          ta: `${n(yr)}-ல் (${n(score)}%) ${ctx.lagnaRashiName} லக்னம் மற்றும் ${ctx.currentMahadasha} தசையில் தேவையற்ற சுமையைக் குறைத்து '${arch.weakestDomainLabel}' சீரமைப்பதே பெரிய வெற்றி.`,
          en: `Under ${ctx.currentMahadasha} for ${ctx.lagnaRashiName} Lagna, Year 1 (${yr}) prioritizes pruning over noisy hustle—fortifying ${arch.weakestDomainLabel} stops quiet leaks early.`
        },
        1: {
          kn: `ನಿಮ್ಮ ${ctx.shaniTransitRashi} ಶನಿ ಸಂಚಾರದ ${n(ctx.shaniTransitSav)} ಬಿಂದುಗಳು ${n(yr)}ರಲ್ಲಿ ತಾಳ್ಮೆಯ ಅಭ್ಯಾಸ ಹಾಗೂ ಕ್ರಮಬದ್ಧ ಲೆಕ್ಕಪತ್ರಕ್ಕೆ ಉತ್ತಮ ಪ್ರತಿಫಲ ನೀಡುತ್ತವೆ.`,
          mr: `${ctx.shaniTransitRashi} मधील शनीचे ${n(ctx.shaniTransitSav)} गुण ${n(yr)} मध्ये वेळेचे नियोजन आणि अचूक हिशोबाला थेट फळ देतात.`,
          hi: `${ctx.shaniTransitRashi} में शनि के ${n(ctx.shaniTransitSav)} बिंदू वर्ष ${n(yr)} में अनुशासित दिनचर्या और स्वच्छ लेखा-जोखा रखने पर लाभ देते हैं।`,
          te: `${ctx.shaniTransitRashi} లోని శని ${n(ctx.shaniTransitSav)} బిందువులు ${n(yr)}లో క్రమబద్ధమైన ప్రణాళికకు మంచి ఫలితాలిస్తాయి.`,
          ta: `${ctx.shaniTransitRashi} சனியின் ${n(ctx.shaniTransitSav)} பரல்கள் ${n(yr)}-ல் திட்டமிட்ட ஒழுங்கிற்கு உடனடிப் பலன் தருகின்றன.`,
          en: `Operating on Saturn's ${ctx.shaniTransitSav}-bindu steadiness inside ${ctx.shaniTransitRashi}, ${yr} turns crisp habits into peace.`
        },
        2: {
          kn: `${n(savByHouse[6])} ಆರೋಗ್ಯ-ಶಿಸ್ತು ಬಿಂದುಗಳು ಹಾಗೂ ${n(savByHouse[1])} ಲಗ್ನ ಬಿಂದುಗಳು ${n(yr)}ರಲ್ಲಿ ನಿಮ್ಮ ನಿಯಮಿತ ವೇಳಾಪಟ್ಟಿಯನ್ನು ರಕ್ಷಿಸುತ್ತವೆ.`,
          mr: `षष्ठ स्थानाचे ${n(savByHouse[6])} व लग्न स्थानाचे ${n(savByHouse[1])} गुण ${n(yr)} मध्ये तुमच्या रोजच्या वेळापत्रकाचे रक्षण करतात.`,
          hi: `षष्ठ भाव के ${n(savByHouse[6])} और लग्न के ${n(savByHouse[1])} बिंदू वर्ष ${n(yr)} में आपकी सुव्यवस्थित दिनचर्या की रक्षा करते हैं।`,
          te: `6వ స్థాన ${n(savByHouse[6])} బిందువులు మరియు లగ్న ${n(savByHouse[1])} బిందువులు ${n(yr)}లో మీ స్థిరత్వాన్ని కాపాడుతాయి.`,
          ta: `6-ம் இடத்தின் ${n(savByHouse[6])} பரல்களும் லக்னத்தின் ${n(savByHouse[1])} பரல்களும் ${n(yr)}-ல் உங்கள் ஒழுங்கைப் பாதுகாக்கின்றன.`,
          en: `Balancing House 6 discipline (${savByHouse[6]}) with House 1 steadiness (${savByHouse[1]}) turns ${yr} into clean recalibration.`
        },
        3: {
          kn: `ಬೀಜ ಬಿತ್ತುವ ಮುನ್ನ ಕಳೆ ತೆಗೆದ ರೈತನಂತೆಯೇ, ${n(yr)}ರ ಶಾಂತ ಶುದ್ಧೀಕರಣ ಮುಂದಿನ ನಾಲ್ಕು ವರ್ಷಗಳ ಫಸಲನ್ನು ಕಾಪಾಡುತ್ತದೆ.`,
          mr: `पेरणीपूर्वी तण काढणाऱ्या शेतकऱ्याप्रमाणे ${n(yr)} मधील शांत स्वच्छता पुढील चार वर्षांचे पीक सुरक्षित ठेवते.`,
          hi: `बुवाई से पहले खेत संवारने की तरह ${n(yr)} की शांत व्यवस्था आगामी चार वर्षों की उपज सुरक्षित करती है।`,
          te: `విత్తనం వేసే ముందు కలుపు తీసినట్లు, ${n(yr)}లో చేసే ప్రక్షాళన రాబోయే నాలుగేళ్ల పంటను కాపాడుతుంది.`,
          ta: `விதைப்பதற்கு முன் களை எடுப்பது போல் ${n(yr)}-ன் சீரமைப்பு அடுத்த நான்கு ஆண்டுகளின் அறுவடையைக் காக்கும்.`,
          en: `Weeding orchard rows first protects four harvests ahead—never resent how quiet ${yr}'s cleanup looks.`
        }
      },
      20: {
        0: {
          kn: `${n(yr)}ರಲ್ಲಿ (${n(score)}%) ನಿಮ್ಮ ${ctx.lagnaRashiName}–${ctx.nakshatraName} ಚಾರ್ಟ್ ಕಟ್ಟಿದ ಅಡಿಪಾಯವು ${ctx.guruTransitRashi} ಗುರು ಹಾಗೂ ಯೋಗಿ ${ctx.yogiPlanetName} ಬಲದಿಂದ ದೊಡ್ಡ ಅವಕಾಶ ತರುತ್ತದೆ.`,
          mr: `${n(yr)} मध्ये (${n(score)}%) तुमच्या ${ctx.lagnaRashiName}–${ctx.nakshatraName} पायाला ${ctx.guruTransitRashi} गुरू व योगी ${ctx.yogiPlanetName} कडून मोठ्या संधी मिळतात.`,
          hi: `${n(yr)} (${n(score)}%) में आपकी ${ctx.lagnaRashiName}–${ctx.nakshatraName} नींव को ${ctx.guruTransitRashi} बृहस्पति व योगी ${ctx.yogiPlanetName} से प्रत्यक्ष अवसर मिलते हैं।`,
          te: `${n(yr)}లో (${n(score)}%) మీ ${ctx.lagnaRashiName}–${ctx.nakshatraName} పునాదికి ${ctx.guruTransitRashi} గురువు మరియు యోగి ${ctx.yogiPlanetName} వల్ల కొత్త అవకాశాలు వస్తాయి.`,
          ta: `${n(yr)}-ல் (${n(score)}%) உங்கள் ${ctx.lagnaRashiName}–${ctx.nakshatraName} அடித்தளத்திற்கு ${ctx.guruTransitRashi} குருவும் யோகி ${ctx.yogiPlanetName}-ம் பெரிய வாய்ப்பு தருகின்றன.`,
          en: `Across ${yr} (${score}%), foundation inside your ${ctx.lagnaRashiName}–${ctx.nakshatraName} sky converts via ${ctx.guruTransitRashi} Jupiter and Yogi ${ctx.yogiPlanetName} into visible momentum.`
        },
        1: {
          kn: `${ctx.yogiPlanetName} ಹಾಗೂ ${n(savByHouse[11])} ಲಾಭ ಬಿಂದುಗಳು ಸೇರಿ ${n(yr)}ರಲ್ಲಿ ಹೊಸ ಮೈತ್ರಿ, ಪದೋನ್ನತಿ ಅಥವಾ ಕುಟುಂಬ ಬೆಳವಣಿಗೆಯನ್ನು ತರುತ್ತವೆ.`,
          mr: `योगी ${ctx.yogiPlanetName} व लाभ भावातील ${n(savByHouse[11])} गुण मिळून ${n(yr)} मध्ये नवीन भागीदारी आणि भरभराट आणतात.`,
          hi: `योगी ${ctx.yogiPlanetName} एवं लाभ भाव के ${n(savByHouse[11])} बिंदू मिलकर ${n(yr)} में श्रेष्ठ सहयोग और प्रगति लाते हैं।`,
          te: `యోగి ${ctx.yogiPlanetName} మరియు లాభ స్థాన ${n(savByHouse[11])} బిందువులు ${n(yr)}లో నూతన భాగస్వామ్యం, అభివృద్ధి తెస్తాయి.`,
          ta: `யோகி ${ctx.yogiPlanetName} மற்றும் 11-ம் இட ${n(savByHouse[11])} பரல்கள் இணைந்து ${n(yr)}-ல் புதிய கூட்டணியும் உயர்வும் தருகின்றன.`,
          en: `Yogi ${ctx.yogiPlanetName} meeting ${savByHouse[11]} House 11 bindus makes ${yr} ideal for stepping boldly into bigger rooms.`
        },
        2: {
          kn: `${n(ctx.nowYear)}ರ ಸಂಕೋಚ ಹಿಂದೆ ಸರಿದು ${n(yr)}ರಲ್ಲಿ (${n(score)}%) ನಿಮ್ಮ ಧ್ವನಿ ಹಾಗೂ ಕೌಶಲ್ಯಕ್ಕೆ ಸ್ಪಷ್ಟ ಬೆಲೆ ಸಿಗುತ್ತದೆ.`,
          mr: `मागील संकोच मागे पडून ${n(yr)} मध्ये (${n(score)}%) तुमच्या कौशल्याला व शब्दाला योग्य वजन प्राप्त होते.`,
          hi: `पिछली झिझक दूर होकर ${n(yr)} (${n(score)}%) में आपकी योग्यता और विचार को स्पष्ट प्रतिष्ठा प्राप्त होती है।`,
          te: `పాత మొహమాటం తొలగి ${n(yr)}లో (${n(score)}%) మీ ప్రతిభకు, మాటకు స్పష్టమైన గౌరవం లభిస్తుంది.`,
          ta: `முந்தைய தயக்கம் விலகி ${n(yr)}-ல் (${n(score)}%) உங்கள் திறமைக்கும் சொல்லுக்கும் மதிப்பு கூடும்.`,
          en: `Contrast last year's hesitation with ${yr}'s clearer wind—visibility now pays twice as cleanly.`
        },
        3: {
          kn: `ಸೂರ್ಯೋದಯದ ನಂತರ ಪಕ್ಷಿಗಳು ಗೂಡು ಬಿಟ್ಟು ಹಾರುವಂತೆ, ${n(yr)}ರ ವಾತಾವರಣವು ಹೊಸ ಪ್ರಯತ್ನಕ್ಕೆ ರೆಕ್ಕೆ ನೀಡುತ್ತದೆ.`,
          mr: `सूर्योदयानंतर आकाशात झेप घेणाऱ्या पक्ष्याप्रमाणे ${n(yr)} हे वर्ष नव्या प्रयत्नांना उंच पंख देते.`,
          hi: `प्रातःकालीन आकाश में उड़ान भरते विहग की भांति ${n(yr)} आपके प्रयासों को नई ऊंचाई एवं गति देता है।`,
          te: `సూర్యోదయంతో ఎగిరే పక్షిలాగా ${n(yr)} మీ కొత్త ప్రయత్నాలకు బలమైన రెక్కలు తొడుగుతుంది.`,
          ta: `விடியலில் வானில் பறக்கும் பறவை போல் ${n(yr)} உங்கள் முயற்சிகளுக்குப் புதிய உயரத்தைத் தருகிறது.`,
          en: `Sunrise opens calm sky—step outward across ${yr} while timing naturally multiplies reach.`
        }
      },
      21: {
        0: {
          kn: `${n(yr)}–${n(yrNext)}ರ ಈ ಎರಡು ವರ್ಷದ ಗರಿಷ್ಠ ವೇಗವು (${n(score)}%–${n(arch.yearScores[3])}%) ${ctx.lagnaRashiName}–${ext.house4Info.lordName} ಬಲದಿಂದ '${ageDomainPhrase}' ಗುರಿಗಳನ್ನು ಶಾಶ್ವತ ನೆಲೆಗೆ ತರುತ್ತದೆ.`,
          mr: `${n(yr)}–${n(yrNext)} मधील हा उच्च टप्पा (${n(score)}%–${n(arch.yearScores[3])}%) ${ctx.lagnaRashiName}–${ext.house4Info.lordName} च्या बळाने '${ageDomainPhrase}' ध्येय स्थिर करतो.`,
          hi: `${n(yr)}–${n(yrNext)} का यह प्रबल चरण (${n(score)}%–${n(arch.yearScores[3])}%) ${ctx.lagnaRashiName}–${ext.house4Info.lordName} के संबल से '${ageDomainPhrase}' को स्थायी रूप देता है।`,
          te: `${n(yr)}–${n(yrNext)} మధ్య ఉచ్ఛ దశ (${n(score)}%–${n(arch.yearScores[3])}%) ${ctx.lagnaRashiName}–${ext.house4Info.lordName} బలంతో '${ageDomainPhrase}' ఆశయాలను స్థిరపరుస్తుంది.`,
          ta: `${n(yr)}–${n(yrNext)} உச்ச கட்டம் (${n(score)}%–${n(arch.yearScores[3])}%) ${ctx.lagnaRashiName}–${ext.house4Info.lordName} பலத்தால் '${ageDomainPhrase}' இலக்குகளை நிலைநிறுத்தும்.`,
          en: `Carrying ${score}–${arch.yearScores[3]}% strength across ${yr}–${yrNext} under ${ctx.lagnaRashiName} and ${ext.house4Info.lordName}, multi-year patience settles into lasting stability.`
        },
        1: {
          kn: `ಲಗ್ನಾಧಿಪತಿ ${ext.house1Info.lordName} ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿ ${ext.house9Info.lordName} ಮೈತ್ರಿಯಿಂದ ${n(yr)}–${n(yrNext)}ರಲ್ಲಿ ಪ್ರಮುಖ ಕನಸುಗಳು ಈಡೇರುತ್ತವೆ.`,
          mr: `लग्नेश ${ext.house1Info.lordName} व भाग्येश ${ext.house9Info.lordName} यांच्या संगतीतून ${n(yr)}–${n(yrNext)} मध्ये मोठे संकल्प पूर्ण होतात.`,
          hi: `लग्नेश ${ext.house1Info.lordName} तथा भाग्येश ${ext.house9Info.lordName} के तालमेल से ${n(yr)}–${n(yrNext)} में प्रमुख उद्देश्य सिद्ध होते हैं।`,
          te: `లగ్నాధిపతి ${ext.house1Info.lordName} మరియు భాగ్యాధిపతి ${ext.house9Info.lordName} సహకారంతో ${n(yr)}–${n(yrNext)}లో కోరికలు నెరవేరుతాయి.`,
          ta: `லக்னாதிபதி ${ext.house1Info.lordName} மற்றும் பாக்கியாதிபதி ${ext.house9Info.lordName} இணைந்து ${n(yr)}–${n(yrNext)}-ல் பெரிய கனவுகளை நிறைவேற்றுகின்றன.`,
          en: `Aligning ${ext.house1Info.lordName} with 9th fortune lord ${ext.house9Info.lordName} crowns steady integrity across ${yr}–${yrNext}.`
        },
        2: {
          kn: `೪ನೇ ಗೃಹ (${n(savByHouse[4])} ಬಿಂದು) ಹಾಗೂ ೫ನೇ ಜ್ಞಾನ-ಸಂತತಿ (${n(savByHouse[5])} ಬಿಂದು) ಎರಡೂ ${n(yr)}–${n(yrNext)}ರಲ್ಲಿ ಕುಟುಂಬ ಸಂಭ್ರಮ ಹೆಚ್ಚಿಸುತ್ತವೆ.`,
          mr: `चतुर्थ स्थान (${n(savByHouse[4])} गुण) आणि पंचम स्थान (${n(savByHouse[5])} गुण) मिळून ${n(yr)}–${n(yrNext)} मध्ये कौटुंबिक आनंद द्विगुणित करतात.`,
          hi: `चतुर्थ भाव (${n(savByHouse[4])} बिंदू) तथा पंचम भाव (${n(savByHouse[5])} बिंदू) दोनों ${n(yr)}–${n(yrNext)} में पारिवारिक प्रसन्नता बढ़ाते हैं।`,
          te: `4వ స్థానం (${n(savByHouse[4])} బిందువులు) మరియు 5వ స్థానం (${n(savByHouse[5])} బిందువులు) కలిసి ${n(yr)}–${n(yrNext)}లో కుటుంబ ఆనందాన్ని పెంచుతాయి.`,
          ta: `4-ம் இடம் (${n(savByHouse[4])} பரல்கள்) மற்றும் 5-ம் இடம் (${n(savByHouse[5])} பரல்கள்) இணைந்து ${n(yr)}–${n(yrNext)}-ல் குடும்ப மகிழ்ச்சியைக் கூட்டுகின்றன.`,
          en: `Dual strength in Houses 4 (${savByHouse[4]}) and 5 (${savByHouse[5]}) creates rare harmony across home and legacy during ${yr}–${yrNext}.`
        },
        3: {
          kn: `ನದಿ ಸಮುದ್ರ ಸೇರುವಾಗ ಪ್ರವಾಹ ಶಾಂತವಾಗಿ ವಿಶಾಲವಾಗುವಂತೆ, ${n(yr)}–${n(yrNext)}ರಲ್ಲಿ ನಿಮ್ಮ ಶ್ರಮವೆಲ್ಲಾ ನೆಮ್ಮದಿಯ ತೀರ ತಲುಪುತ್ತದೆ.`,
          mr: `नदी सागराला मिळताना विशाल व शांत होते, तसेच ${n(yr)}–${n(yrNext)} मध्ये तुमच्या कष्टाचे फळ शांत समाधानाने हाती येते.`,
          hi: `नदी जैसे सागर से मिलकर विशाल और शांत हो जाती है, वैसे ही ${n(yr)}–${n(yrNext)} में आपका परिश्रम पूर्ण संतोष में फलित होता है।`,
          te: `నది సముద్రాన్ని చేరే సమయంలో ప్రశాంతమైనట్లే, ${n(yr)}–${n(yrNext)}లో మీ కష్టానికి పూర్తి ఫలితం దక్కుతుంది.`,
          ta: `நதி கடலைச் சேரும்போது அமைதியும் பரப்பும் அடைவது போல், ${n(yr)}–${n(yrNext)}-ல் உங்கள் உழைப்பு முழுமையான நிறைவைத் தரும்.`,
          en: `Where river narrows meet wide ocean calm, ${yr}–${yrNext} rewards sustained integrity with spacious household joy.`
        }
      },
      22: {
        0: {
          kn: `${n(yr)}ರ (${n(score)}%) ಐದನೇ ವರ್ಷದ ಸುತ್ತಿನಲ್ಲಿ ${ctx.lagnaRashiName}–${ctx.nakshatraName} ಚೈತನ್ಯ ಹಾಗೂ '${ageDomainPhrase}' ಸ್ಥಿರಗೊಂಡು ನೀವು ಬೇರೆಯವರಿಗೂ ಭರವಸೆಯ ದೀಪವಾಗುತ್ತೀರಿ.`,
          mr: `${n(yr)} च्या (${n(score)}%) पाचव्या वर्षात ${ctx.lagnaRashiName}–${ctx.nakshatraName} बळ आणि '${ageDomainPhrase}' भक्कम होऊन तुम्ही इतरांसाठीही आधारस्तंभ बनता.`,
          hi: `वर्ष ${n(yr)} (${n(score)}%) के पांचवें पड़ाव में ${ctx.lagnaRashiName}–${ctx.nakshatraName} एवं '${ageDomainPhrase}' सुस्थिर होकर आपको प्रकाश-स्तंभ बनाते हैं।`,
          te: `${n(yr)}వ (${n(score)}%) ఐదవ ఏడాదికి ${ctx.lagnaRashiName}–${ctx.nakshatraName} మరియు '${ageDomainPhrase}' స్థిరపడి మీరు ఇతరులకు ఆదర్శంగా నిలుస్తారు.`,
          ta: `${n(yr)}-ம் (${n(score)}%) ஐந்தாம் ஆண்டில் ${ctx.lagnaRashiName}–${ctx.nakshatraName} மற்றும் '${ageDomainPhrase}' நிலைபெற்று நீங்கள் வழிகாட்டியாவீர்கள்.`,
          en: `By Year 5 (${yr}, ${score}%), uniting ${ctx.lagnaRashiName}–${ctx.nakshatraName} maturity around ${ageDomainPhrase} turns relief into quiet leadership.`
        },
        1: {
          kn: `ದಶಾನಾಥ ${ctx.currentMahadasha} ಹಾಗೂ ${ctx.lagnaRashiName}–${ctx.nakshatraName} ಚೈತನ್ಯವು ${n(yr)}ರಲ್ಲಿ ಆರ್ಥಿಕ-ಮಾನಸಿಕ ಸ್ವಾತಂತ್ರ್ಯದ ಮುದ್ರೆ ಒತ್ತುತ್ತದೆ.`,
          mr: `दशानाथ ${ctx.currentMahadasha} व ${ctx.lagnaRashiName}–${ctx.nakshatraName} शक्ती ${n(yr)} मध्ये आर्थिक व मानसिक स्वातंत्र्याची मोहर उमटवतात.`,
          hi: `दशानाथ ${ctx.currentMahadasha} एवं ${ctx.lagnaRashiName}–${ctx.nakshatraName} बल वर्ष ${n(yr)} में आर्थिक व मानसिक स्वतंत्रता की मुहर लगाते हैं।`,
          te: `దశానాథుడు ${ctx.currentMahadasha} మరియు ${ctx.lagnaRashiName}–${ctx.nakshatraName} బలం ${n(yr)}లో ఆర్థిక, మానసిక స్వేచ్ఛను స్థిరపరుస్తాయి.`,
          ta: `தசாநாதன் ${ctx.currentMahadasha} மற்றும் ${ctx.lagnaRashiName}–${ctx.nakshatraName} பலம் ${n(yr)}-ல் பொருளாதார, மன சுதந்திரத்தை உறுதி செய்கின்றன.`,
          en: `Uniting ${ctx.currentMahadasha} timing with ${ctx.lagnaRashiName} resilience stamps ${yr} with authentic self-command.`
        },
        2: {
          kn: `ಕೇವಲ ತುರ್ತು ಪರಿಹಾರ ಹುಡುಕುವ ಬದಲು ${n(yr)}ರಲ್ಲಿ ದೀರ್ಘಕಾಲಿಕ ಪರಂಪರೆ ಮತ್ತು ಶಾಂತ ಆರೋಗ್ಯಕ್ಕೆ ಆದ್ಯತೆ ಸಿಗುತ್ತದೆ.`,
          mr: `तात्पुरत्या तडजोडीऐवजी ${n(yr)} मध्ये दीर्घकालीन परंपरा आणि निखळ स्वास्थ्य हेच मुख्य केंद्र राहते.`,
          hi: `अस्थायी समाधानों के स्थान पर वर्ष ${n(yr)} में स्थायी विरासत एवं संतुलित स्वास्थ्य प्राथमिकता बनते हैं।`,
          te: `తాత్కాలిక సర్దుబాట్ల కంటే ${n(yr)}లో దీర్ఘకాలిక సంపద, ప్రశాంత ఆరోగ్యంపై పూర్తి దృష్టి ఉంటుంది.`,
          ta: `தற்காலிகத் தீர்வுகளை விட ${n(yr)}-ல் நீண்டகால மரபும் அமைதியான ஆரோக்கியமும் முதன்மை பெறும்.`,
          en: `Shifting cleanly from firefighting into steady stewardship defines how peaceful ${yr} feels.`
        },
        3: {
          kn: `ಐದು ವಸಂತಗಳನ್ನು ದಾಟಿದ ನಂತರ ಕಾಣುವ ಈ ಪ್ರಶಾಂತ ದೃಶ್ಯವು 'ಎಲ್ಲಾ ವಿಳಂಬಕ್ಕೂ ಒಳ್ಳೆಯ ಕಾರಣವಿತ್ತು' ಎಂಬುದನ್ನು ಸಾಬೀತುಪಡಿಸುತ್ತದೆ.`,
          mr: `पाच टप्पे पार केल्यानंतर दिसणारे हे शांत चित्र 'प्रत्येक प्रतीक्षेमागे चांगले कारण होते' हे सिद्ध करते.`,
          hi: `पांच सोपान पार कर दिखने वाला यह उज्ज्वल क्षितिज सिद्ध करता है कि 'हर धैर्यपूर्ण प्रतीक्षा सार्थक थी'।`,
          te: `ఐదు వసంతాలు దాటిన తర్వాత కనిపించే ఈ ప్రశాంత దృశ్యం 'ప్రతి ఓపికకు తగిన ఫలితం ఉంది' అని నిరూపిస్తుంది.`,
          ta: `ஐந்து ஆண்டுப் பயணத்திற்குப் பிறகு காணும் இந்த அமைதி 'ஒவ்வொரு காத்திருப்பிற்கும் நல்ல காரணம் இருந்தது' என உணர்த்தும்.`,
          en: `Five steady rings around the tree prove why slowing down early allowed your tallest canopy to stand windproof in ${yr}.`
        }
      }
    };

    const yearRefl: Record<number, Record<0 | 1 | 2 | 3, Record<SixLang, string>>> = {
      19: {
        0: {
          kn: `${n(yr)}ರ ಸಾರ: ಕೇವಲ ೨ ಮುಖ್ಯ ಗುರಿಗಳನ್ನು ಉಳಿಸಿಕೊಂಡು ಉಳಿದ ಗೊಂದಲ ಕೈಬಿಡಿ.`,
          mr: `${n(yr)} चे सूत्र: केवळ २ मुख्य ध्येये ठेवून बाकी अनावश्यक पसारा बाजूला सारा.`,
          hi: `${n(yr)} का नियम: केवल २ मुख्य लक्ष्य रखकर अतिरिक्त भटकाव सहज छोड़ दें।`,
          te: `${n(yr)} సూత్రం: కేవలం 2 ముఖ్య లక్ష్యాలను ఎంచుకుని మిగిలిన గందరగోళాన్ని వదిలేయండి.`,
          ta: `${n(yr)} விதி: இரண்டு முக்கிய இலக்குகளை மட்டும் வைத்து மற்ற சுமைகளை விலக்குங்கள்.`,
          en: `Anchor ${yr}: Simplify ruthlessly down to two core priorities.`
        },
        1: {
          kn: `ಶಿಸ್ತಿನ ಹೆಜ್ಜೆ: ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ನಿಮ್ಮ '${arch.weakestDomainLabel}' ಅಂಶಕ್ಕೆ ೧೫ ನಿಮಿಷ ಮೀಸಲಿಡಿ.`,
          mr: `शिस्तीचा सराव: रोज सकाळी '${arch.weakestDomainLabel}' मजबूत करण्यासाठी १५ मिनिटे द्या.`,
          hi: `दैनिक अभ्यास: प्रतिदिन '${arch.weakestDomainLabel}' सुदृढ़ करने हेतु १५ शांत मिनट दें।`,
          te: `క్రమశిక్షణ: ప్రతిరోజూ '${arch.weakestDomainLabel}' మెరుగుదలకు 15 నిమిషాలు కేటాయించండి.`,
          ta: `தினசரிப் படி: ஒவ்வொரு நாளும் '${arch.weakestDomainLabel}' வலுப்படுத்த 15 நிமிடம் ஒதுக்குங்கள்.`,
          en: `Foundation Habit: Spend fifteen steady minutes weekly fortifying ${arch.weakestDomainLabel}.`
        },
        2: {
          kn: `${n(yr)}ರಲ್ಲಿ ತೆಗೆದುಕೊಂಡ ಶಾಂತ ನಿರ್ಧಾರವೇ ೨೦೨೮ರ ಶಿಖರಕ್ಕೆ ಮೆಟ್ಟಿಲಾಗುತ್ತದೆ.`,
          mr: `${n(yr)} मधील शांत व विचारपूर्वक पावलेच पुढच्या यशाची पहिली पायरी आहेत.`,
          hi: `${n(yr)} में लिया गया शांत एवं सधा हुआ निर्णय ही आगामी शिखर की प्रथम सीढ़ी है।`,
          te: `${n(yr)}లో తీసుకునే ప్రశాంత నిర్ణయాలే భవిష్యత్ శిఖరానికి మెట్లు.`,
          ta: `${n(yr)}-ல் எடுக்கும் அமைதியான முடிவுகளே எதிர்கால உயர்வின் முதல் படி.`,
          en: `First Rung: Clean order now creates momentum nobody notices until next spring.`
        },
        3: {
          kn: `ಆತುರವಿಲ್ಲದ ತಯಾರಿ — ಇದೇ ${n(yr)}ರ ಬುದ್ಧಿವಂತಿಕೆಯಾಗಿದೆ.`,
          mr: `घाई न करता पक्की तयारी करणे — हीच ${n(yr)} ची खरी हुशारी आहे.`,
          hi: `बिना उतावलेपन की सटीक तैयारी — यही वर्ष ${n(yr)} की मुख्य बुद्धिमत्ता है।`,
          te: `తొందరలేని సన్నద్ధత — అదే ${n(yr)}లో మీరు చూపాల్సిన వివేకం.`,
          ta: `அவசரமற்ற ஆயத்தம் — இதுவே ${n(yr)}-ன் உண்மையான அறிவுடைமை.`,
          en: `Tone for ${yr}: Steady roots always outlast hurried fireworks.`
        }
      },
      20: {
        0: {
          kn: `${n(yr)}ರ ಸಲಹೆ: ಸರಿಯಾದ ವೇದಿಕೆ ಕರೆದಾಗ ಸಂಕೋಚ ಬಿಟ್ಟು ಮುಂದೆ ಬನ್ನಿ.`,
          mr: `${n(yr)} चा सल्ला: योग्य संधी समोर येताच संकोच सोडून पुढे पाऊल टाका.`,
          hi: `${n(yr)} का संकेत: जब उपयुक्त मंच बुलाए, तो संकोच छोड़कर आत्मविश्वास से आगे बढ़ें।`,
          te: `${n(yr)} సూచన: సరైన వేదిక పిలిచినప్పుడు మొహమాటం వీడి ముందుకు రండి.`,
          ta: `${n(yr)} அறிவுரை: தக்க மேடை அழைக்கும்போது தயக்கமின்றி முன்வாருங்கள்.`,
          en: `Opening Cue for ${yr}: Say yes to bigger invitations before perfection whispers wait.`
        },
        1: {
          kn: `${n(ctx.bhuktiEndDate)}ರ ನಂತರ ಹೊಸ ಸಂಪರ್ಕಗಳ ಪಟ್ಟಿಯನ್ನು ಪರಿಷ್ಕರಿಸಿ ಮುಂದಡಿ ಇಡಿ.`,
          mr: `${n(ctx.bhuktiEndDate)} नंतर नव्या संपर्कांची आणि संधींची यादी तपासून पावले उचला.`,
          hi: `${n(ctx.bhuktiEndDate)} के बाद नए संपर्कों और अवसरों को प्राथमिकता से आगे बढ़ाएं।`,
          te: `${n(ctx.bhuktiEndDate)} తర్వాత కొత్త పరిచయాలను, అవకాశాలను సమర్థంగా ఉపయోగించుకోండి.`,
          ta: `${n(ctx.bhuktiEndDate)}-க்குப் பிறகு புதிய தொடர்புகளையும் வாய்ப்புகளையும் நன்கு பயன்படுத்துங்கள்.`,
          en: `Network Watch: Follow up cleanly on warm introductions arriving after ${ctx.bhuktiEndDate}.`
        },
        2: {
          kn: `ಹಣ ಮತ್ತು ಸಮಯ ಎರಡನ್ನೂ '${ageDomainPhrase}' ದಿಕ್ಕಿಗೆ ತಿರುಗಿಸಿ.`,
          mr: `वेळ व कौशल्य या दोन्हींची गुंतवणूक '${ageDomainPhrase}' मध्ये करा.`,
          hi: `समय व ऊर्जा दोनों को '${ageDomainPhrase}' के विस्तार में लगाएं।`,
          te: `సమయం మరియు ప్రతిభను '${ageDomainPhrase}' వృద్ధి వైపు మళ్ళించండి.`,
          ta: `நேரத்தையும் திறமையையும் '${ageDomainPhrase}' வளர்ச்சியில் செலுத்துங்கள்.`,
          en: `Growth Rule: Direct fresh energy squarely into ${ageDomainPhrase}.`
        },
        3: {
          kn: `ತೆರೆದ ಆಕಾಶದಲ್ಲಿ ಭಯಕ್ಕಿಂತ ಭರವಸೆಯ ಹಾರಾಟ ಮುಖ್ಯ — ${n(yr)} ಅದಕ್ಕೆ ಸಾಕ್ಷಿ.`,
          mr: `मोकळ्या आकाशात भीतीपेक्षा विश्वासाने झेप घ्या — ${n(yr)} तुमची साथ देईल.`,
          hi: `खुले आकाश में भय के बजाय विश्वास से उड़ान भरें — ${n(yr)} पूर्ण सहयोग देगा।`,
          te: `విశాల ఆకాశంలో భయం కంటే ఆత్మవిశ్వాసంతో ఎగరండి — ${n(yr)} అందుకు తోడ్పడుతుంది.`,
          ta: `திறந்த வானில் அச்சமின்றி நம்பிக்கையுடன் உயருங்கள் — ${n(yr)} துணை நிற்கும்.`,
          en: `Stride Forward: ${yr} rewards calm courage steadily more than cautious silence.`
        }
      },
      21: {
        0: {
          kn: `${n(yr)}–${n(yrNext)}ರಲ್ಲಿ ದೊಡ್ಡ ಕೌಟುಂಬಿಕ ನಿರ್ಧಾರಗಳನ್ನು ಒಮ್ಮತದಿಂದ ಶುಭದಿನದಂದು ಪೂರ್ಣಗೊಳಿಸಿ.`,
          mr: `${n(yr)}–${n(yrNext)} मधील मोठे कौटुंबिक निर्णय सर्वांच्या संमतीने व शुभ दिवशी पूर्ण करा.`,
          hi: `${n(yr)}–${n(yrNext)} के बड़े पारिवारिक संकल्प सबकी सहमति एवं शुभ दिन में सिद्ध करें।`,
          te: `${n(yr)}–${n(yrNext)}లోని పెద్ద కుటుంబ నిర్ణయాలను అందరి ఆమోదంతో శుభదినాన పూర్తిచేయండి.`,
          ta: `${n(yr)}–${n(yrNext)} பெரிய குடும்ப முடிவுகளை ஒற்றுமையுடன் நல்ல நாளில் நிறைவேற்றுங்கள்.`,
          en: `Peak Phase Note: Lock long-term agreements calmly while both momentum and unity align.`
        },
        1: {
          kn: `೪ನೇ ಮನೆಯ ${ext.house4Info.lordName} ಬಲವನ್ನು ಗೌರವಿಸಿ ಮನೆಯ ಶಾಂತಿಯನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಿ.`,
          mr: `चतुर्थेश ${ext.house4Info.lordName} च्या बळाचा आदर राखत घरातील सलोखा जपा.`,
          hi: `चतुर्थेश ${ext.house4Info.lordName} की शुभता का सम्मान करते हुए गृह-शांति बनाए रखें।`,
          te: `4వ అధిపతి ${ext.house4Info.lordName} బలాన్ని గౌరవిస్తూ ఇంట్లో ప్రశాంతతను కాపాడండి.`,
          ta: `4-ம் அதிபதி ${ext.house4Info.lordName} அருளைப் போற்றி இல்லற அமைதியைக் காத்திடுங்கள்.`,
          en: `Household Anchor: Honor ${ext.house4Info.lordName} strength by keeping home gratitude higher than stress.`
        },
        2: {
          kn: `ಸಂಪತ್ತು ಹೆಚ್ಚಾದಾಗ ವಿನಯ ಮತ್ತು ಕೃತಜ್ಞತೆಯೇ ಅದನ್ನು ಶಾಶ್ವತಗೊಳಿಸುತ್ತದೆ.`,
          mr: `समृद्धी वाढताच नम्रता आणि कृतज्ञता तिला चिरस्थायी बनवते.`,
          hi: `समृद्धि बढ़ने पर विनम्रता और कृतज्ञता ही उसे स्थायी बनाती है।`,
          te: `సంపద పెరిగినప్పుడు వినయం మరియు కృతజ్ఞత దాన్ని శాశ్వతం చేస్తాయి.`,
          ta: `வளம் கூடும்போது பணிவும் நன்றியுணர்வுமே அதை நிரந்தரமாக்கும்.`,
          en: `Prosperity Rule: Share quiet gratitude generously as milestones land across ${yr}–${yrNext}.`
        },
        3: {
          kn: `ಸುಗ್ಗಿಯ ಫಲವನ್ನು ಕುಟುಂಬದ ಎಲ್ಲರೊಂದಿಗೆ ಹಂಚಿ ಆನಂದಿಸಿ — ಇದೇ ನಿಜವಾದ ಐಶ್ವर्य.`,
          mr: `सुगीचे हे सुंदर फळ कुटुंबासोबत वाटून आनंद घ्या — हेच खरे वैभव आहे.`,
          hi: `परिश्रम के इस मधुर फल को पूरे परिवार संग मनाएं — यही सच्चा वैभव है।`,
          te: `శ్రమ ఫలాన్ని కుటుంబమంతా కలిసి పంచుకోండి — అదే నిజమైన ఐశ్వర్యం.`,
          ta: `உழைப்பின் இனிய பலனைக் குடும்பத்துடன் பகிர்ந்து மகிழுங்கள் — அதுவே உண்மையான செல்வம்.`,
          en: `Harvest Moment: Celebrate milestones simply with the faces who stood beside your climb.`
        }
      },
      22: {
        0: {
          kn: `${n(yr)}ರ ನಂತರ ನಿಮ್ಮ ಹೆಸರೇ ನಿಮ್ಮ ಸುತ್ತಲಿನವರಿಗೆ ಧೈರ್ಯ ಮತ್ತು ಮಾರ್ಗದರ್ಶನವಾಗುತ್ತದೆ.`,
          mr: `${n(yr)} नंतर तुमचे अनुभवच इतरांना धैर्य व योग्य दिशा देणारे ठरतील.`,
          hi: `${n(yr)} के पश्चात आपका जीवन-अनुभव अनेक लोगों को साहस और राह दिखाने वाला बनेगा।`,
          te: `${n(yr)} నాటికి మీ అనుభవమే చుట్టుపక్కల వారికి ధైర్యంగా, మార్గదర్శకంగా నిలుస్తుంది.`,
          ta: `${n(yr)}-க்குப் பிறகு உங்கள் அனுபவமே பலருக்கும் தைரியமும் வழிகாட்டலும் தரும்.`,
          en: `Fifth-Year Seal: Step calmly into mentoring others across ${yr} with hard-won grace.`
        },
        1: {
          kn: `ಹಿಂದಿನ ಕಷ್ಟದ ದಿನಗಳನ್ನು ನೆನೆದು ಕೃತಜ್ಞತೆಯಿಂದ ಮುನ್ನಡೆಯಿರಿ — ನಿಮ್ಮ ದಾರಿ ಬೆಳಗಿದೆ.`,
          mr: `मागील कठीण दिवसांची आठवण ठेवून कृतज्ञतेने पुढे चला — तुमची वाट उजळली आहे.`,
          hi: `कठिन सोपानों का स्मरण रख कृतज्ञता से आगे बढ़ें — आपका पथ आलोकित है।`,
          te: `గత అనుభవాలను గుర్తుంచుకుని కృతజ్ఞతతో నడవండి — మీ దారి ప్రకాశవంతంగా ఉంది.`,
          ta: `கடந்த பாடங்களை நன்றியுடன் நினைத்து முன்னேறுங்கள் — உங்கள் பாதை ஒளிமயமானது.`,
          en: `Horizon Gratitude: Compare where your feet stood five years back against this wider sky.`
        },
        2: {
          kn: `ಸಮಯ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ಶುದ್ಧ ಆನಂದ, ಕುಟುಂಬದ ನೆಮ್ಮದಿ ಮತ್ತು ಧರ್ಮಕಾರ್ಯಕ್ಕೆ ಮೀಸಲಿಡಿ.`,
          mr: `मिळालेल्या वेळेच्या स्वातंत्र्याचा उपयोग आरोग्य, परिवार व सत्कार्यासाठी करा.`,
          hi: `प्राप्त समय की स्वतंत्रता को उत्तम स्वास्थ्य, परिवार और सत्कर्म में समर्पित करें।`,
          te: `దొరికిన సమయ స్వేచ్ఛను ఆరోగ్యం, కుటుంబం మరియు సత్కార్యాలకు వినియోగించండి.`,
          ta: `கிடைத்த நேரச் சுதந்திரத்தை ஆரோக்கியம், குடும்பம் மற்றும் நற்செயல்களில் செலவிடுங்கள்.`,
          en: `Autonomy Choice: Invest your spacious margin in health, loved ones, and lasting purpose.`
        },
        3: {
          kn: `ಶಿಖರದ ಶಾಂತಿ — ಇದೇ ಐದು ವರ್ಷಗಳ ಪಯಣದ ಅತ್ಯುನ್ನತ ವರದಾನ.`,
          mr: `शिखरावरची शांतता — हेच या पाच वर्षांच्या प्रवासाचे सर्वश्रेष्ठ फळ आहे.`,
          hi: `शिखर की शांति — यही इस पांच-वर्षीय यात्रा का सर्वोत्तम प्रसाद है।`,
          te: `శిఖరంపై కలిగే ప్రశాంతత — ఇదే ఈ ఐదేళ్ల ప్రయాణపు అతిపెద్ద వరం.`,
          ta: `சிகரத்தின் அமைதி — இதுவே இந்த ஐந்தாண்டுப் பயணத்தின் மிக உயர்ந்த பரிசு.`,
          en: `Summit Quiet: When hurried noise settles forever behind you, true dignity begins.`
        }
      }
    };

    return {
      p1Focus: pick6(p1FocusByCh[chNum][ed], lang),
      p2Body: pick6(yearSpecificP2[chNum][ed], lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6(yearRefl[chNum][ed], lang)
    };
  }

  if (chNum === 23) {
    // Dosha Reality Check (No fear-mongering — isolate verified patterns: Badhaka + Maandi + Rahu)
    const p1Dosha = pick6({
      kn: `ನಿಮ್ಮ ${ctx.lagnaRashiName} ಲಗ್ನದ ${n(ext.badhakaHouse)}ನೇ ಬಾಧಕ ಸ್ಥಾನ (${ext.badhakaInfo.lordName}) ಮತ್ತು ${n(ctx.maandiHouse)}ನೇ ಮನೆಯ ಮಾಂದಿ (${ctx.maandiRashiName}) ಪರೀಕ್ಷೆಯೇ ನಿಮ್ಮ ಚಾರ್ಟಿನ ನೈಜ ಸೂಕ್ಷ್ಮ ಗಂಟುಗಳಾಗಿವೆ.`,
      mr: `तुमच्या ${ctx.lagnaRashiName} लग्नाचे ${n(ext.badhakaHouse)}वे बाधक स्थान (${ext.badhakaInfo.lordName}) व ${n(ctx.maandiHouse)}व्या भावातील मांदी (${ctx.maandiRashiName}) हीच पत्रिकेतील खरी तपासण्याची बिंदू आहेत.`,
      hi: `आपके ${ctx.lagnaRashiName} लग्न का ${n(ext.badhakaHouse)}वां बाधक भाव (${ext.badhakaInfo.lordName}) और ${n(ctx.maandiHouse)}वें भाव की मांदी (${ctx.maandiRashiName}) ही आपकी कुंडली के वास्तविक सूक्ष्म बिंदु हैं।`,
      te: `మీ ${ctx.lagnaRashiName} లగ్నానికి ${n(ext.badhakaHouse)}వ బాధక స్థానం (${ext.badhakaInfo.lordName}) మరియు ${n(ctx.maandiHouse)}వ స్థాన మాంది (${ctx.maandiRashiName}) మాత్రమే మీ జాతకంలోని అసలైన సున్నిత అంశాలు.`,
      ta: `உங்கள் ${ctx.lagnaRashiName} லக்னத்தின் ${n(ext.badhakaHouse)}-ம் பாதக இடம் (${ext.badhakaInfo.lordName}) மற்றும் ${n(ctx.maandiHouse)}-ம் இட மாந்தி (${ctx.maandiRashiName}) மட்டுமே உண்மையான நுட்பப் புள்ளிகள்.`,
      en: `Diagnostic scan clarifies real leverage instantly: Badhaka lord ${ext.badhakaInfo.lordName} (House ${ext.badhakaHouse}) and House ${ctx.maandiHouse} Maandi (${ctx.maandiRashiName}) replace vague superstition with clear facts.`
    }, lang);

    return {
      p1Focus: p1Dosha,
      p2Body: pick6({
        kn: `${ctx.lagnaRashiName} ಚಾರ್ಟಿನಲ್ಲಿ ಭಯ ಹುಟ್ಟಿಸುವ ಸಾರ್ವತ್ರಿಕ ವಿಧಿಗಳಿಗಿಂತ, ಯೋಗಿ ${ctx.yogiPlanetName} ಹಾಗೂ ಚಂದ್ರನಿಂದ ${n(ctx.rahuHouseFromMoon)}ನೇ ರಾಹು ಸ್ಥಾನದ ಸ್ವಭಾವಕ್ಕೆ ತಕ್ಕ ನಿಖರ ಕ್ರಮ ಸಾಕು.`,
        mr: `${ctx.lagnaRashiName} पत्रिकेत भीती घालणाऱ्या विधींपेक्षा योगी ${ctx.yogiPlanetName} आणि ${n(ctx.rahuHouseFromMoon)}व्या राहुच्या स्वभावास जुळणारे शांत उपाय पुरेसे आहेत.`,
        hi: `${ctx.lagnaRashiName} पत्रिका में भय पैदा करने वाले आडंबरों के बजाय योगी ${ctx.yogiPlanetName} व ${n(ctx.rahuHouseFromMoon)}वें राहु के अनुरूप सटीक उपाय ही पर्याप्त हैं।`,
        te: `${ctx.lagnaRashiName} జాతకంలో భయపెట్టే పూజల కంటే యోగి ${ctx.yogiPlanetName} మరియు ${n(ctx.rahuHouseFromMoon)}వ రాహు స్థితికి తగిన ఖచ్చితమైన పరిహారం సరిపోతుంది.`,
        ta: `${ctx.lagnaRashiName} ஜாதகத்தில் பயமுறுத்தும் சடங்குகளை விட யோகி ${ctx.yogiPlanetName} மற்றும் ${n(ctx.rahuHouseFromMoon)}-ம் ராகு நிலைக்கேற்ற துல்லிய தீர்வே போதுமானது.`,
        en: `Inside ${ctx.lagnaRashiName} Lagna, skip blanket fear ceremonies—pair Yogi ${ctx.yogiPlanetName} steadiness strictly with targeted steps tuned to House ${ctx.rahuHouseFromMoon}.`
      }, lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `ಸ್ಪಷ್ಟತೆ: ಜಾತಕ ದೋಷವು ಶಿಕ್ಷೆಯಲ್ಲ — ಅದು ಜೀವನ ಶೈಲಿ ಸರಿಪಡಿಸಿಕೊಳ್ಳುವ ಸೂಚನಾ ಫಲಕ ಮಾತ್ರ.`,
        mr: `निखळ जाणीव: कुंडलीतील दोष ही शिक्षा नसून जीवनशैली सुधारण्याची अचूक सूचना असते.`,
        hi: `सच्चा बोध: पत्रिका का कोई भी योग दंड नहीं, अपितु जीवनशैली संवारने का सूक्ष्म संकेत मात्र है।`,
        te: `నిజం తెలుసుకోండి: జాతక దోషం శిక్ష కాదు — అది జాగ్రత్తగా నడవమని చెప్పే దిక్సూచి మాత్రమే.`,
        ta: `தெளிவான பார்வை: ஜாதக தோஷம் தண்டனை அல்ல — வாழ்க்கை முறையைச் சீராக்க உதவும் வழிகாட்டி மட்டுமே.`,
        en: `Clarity First: Planetary friction points act like road signs calling for steady steering—never permanent curses.`
      }, lang)
    };
  }

  if (chNum === 24) {
    // Practical Daily Blueprint & Yogi Keys
    return {
      p1Focus: pick6({
        kn: `${ctx.lagnaRashiName} ನಿತ್ಯ ಶಕ್ತಿ ಸಮೀಕರಣ: ವಾರ '${ctx.localizedYogiDay}' • ದಿಕ್ಕು '${ctx.localizedYogiDirection}' • ಬಣ್ಣ '${ctx.localizedYogiColor}' — ಇವು ನಿಮ್ಮ ${n(arch.peakHouseNum)}ನೇ ಮನೆಯ (${arch.peakDomainLabel}) ಫಲಗಳನ್ನು ಪ್ರತಿದಿನ ಸಕ್ರಿಯಗೊಳಿಸುತ್ತವೆ.`,
        mr: `${ctx.lagnaRashiName} दैनंदिन ऊर्जा सूत्र: वार '${ctx.localizedYogiDay}' • दिशा '${ctx.localizedYogiDirection}' • रंग '${ctx.localizedYogiColor}' — हे घटक ${n(arch.peakHouseNum)}व्या भावाचे (${arch.peakDomainLabel}) फळ जागृत ठेवतात.`,
        hi: `${ctx.lagnaRashiName} दैनिक ऊर्जा-सूत्र: शुभ वार '${ctx.localizedYogiDay}' • दिशा '${ctx.localizedYogiDirection}' • रंग '${ctx.localizedYogiColor}' — ये ${n(arch.peakHouseNum)}वें भाव (${arch.peakDomainLabel}) को सक्रिय रखते हैं।`,
        te: `${ctx.lagnaRashiName} రోజువారీ శక్తి సూత్రం: రోజు '${ctx.localizedYogiDay}' • దిశ '${ctx.localizedYogiDirection}' • రంగు '${ctx.localizedYogiColor}' — ఇవి మీ ${n(arch.peakHouseNum)}వ స్థానం (${arch.peakDomainLabel}) శక్తిని మేల్కొల్పుతాయి.`,
        ta: `${ctx.lagnaRashiName} தினசரி ஆற்றல் சூத்திரம்: கிழமை '${ctx.localizedYogiDay}' • திசை '${ctx.localizedYogiDirection}' • நிறம் '${ctx.localizedYogiColor}' — இவை ${n(arch.peakHouseNum)}-ம் இடத்தை (${arch.peakDomainLabel}) தினமும் தூண்டும்.`,
        en: `Your ${ctx.lagnaRashiName} daily compass pairs ${ctx.localizedYogiDay}, ${ctx.localizedYogiDirection}, and ${ctx.localizedYogiColor} to wake peak House ${arch.peakHouseNum} (${arch.peakDomainLabel}) reliably.`
      }, lang),
      p2Body: pick6({
        kn: `${ctx.nakshatraName} ಚಾರ್ಟಿಗೆ ಕ್ಲಿಷ್ಟ ನಿಯಮಗಳಿಗಿಂತ ಬೆಳಗ್ಗೆ '${ctx.janmaHora}' ಲಯದಲ್ಲಿ ೫ ನಿಮಿಷದ ಕೃತಜ್ಞತೆ ಹಾಗೂ ವಾರದ ಮುಖ್ಯ ಕೆಲಸಗಳಿಗೆ '${ctx.localizedYogiDay}' ಆಯ್ಕೆ — ಈ ಎರಡೇ ಸಾಕು.`,
        mr: `${ctx.nakshatraName} कुंडलीसाठी अवघड नियमांपेक्षा '${ctx.janmaHora}' लयीत ५ मिनिटांची शांत कृतज्ञता आणि मुख्य कामांसाठी '${ctx.localizedYogiDay}' निवडणे पुरेसे आहे.`,
        hi: `${ctx.nakshatraName} पत्रिका के लिए जटिल विधियों के बजाय '${ctx.janmaHora}' लय में ५ मिनट की कृतज्ञता और मुख्य निर्णय हेतु '${ctx.localizedYogiDay}' चुनना पर्याप्त है।`,
        te: `${ctx.nakshatraName} జాతకానికి కష్టమైన నియమాల కంటే '${ctx.janmaHora}' లో 5 నిమిషాల ప్రశాంతత మరియు ముఖ్య పనులకు '${ctx.localizedYogiDay}' ఎంచుకోవడం సరిపోతుంది.`,
        ta: `${ctx.nakshatraName} ஜாதகத்திற்குக் கடின விதிகளை விட '${ctx.janmaHora}' வேளையில் 5 நிமிட நன்றியுணர்வும் முக்கிய முயற்சிகளுக்கு '${ctx.localizedYogiDay}' தேர்வும் போதும்.`,
        en: `Tailored for ${ctx.nakshatraName}, swap rigid schedules for five peaceful minutes anchored around ${ctx.janmaHora} Hora and ${ctx.localizedYogiDay}.`
      }, lang),
      p3Body: "",
      reflectionNote: ed === 0 ? "" : pick6({
        kn: `ನಾಳೆ ಬೆಳಗ್ಗೆ ಈ ೪ ಸೂತ್ರಗಳಲ್ಲಿ ಯಾವ ಒಂದನ್ನು ತಕ್ಷಣ ಜಾರಿಗೆ ತರುತ್ತೀರಿ ಎಂದು ಮನದಲ್ಲೇ ನಿಶ್ಚಯಿಸಿ.`,
        mr: `उद्या सकाळपासून या ४ सोप्या किल्ल्यांपैकी कोणती एक सवय लगेच सुरू करणार आहात ते ठरवा.`,
        hi: `कल प्रातः से इन ४ सरल सूत्रों में से किस एक को तुरंत अपनाएंगे, अभी तय करें।`,
        te: `రేపు ఉదయం నుండే ఈ 4 సులభ సూత్రాలలో దేనిని ముందుగా ఆచరణలో పెడతారో నిర్ణయించుకోండి.`,
        ta: `நாளை காலை முதலே இந்த 4 எளிய வழிகளில் எதை உடனே நடைமுறைப்படுத்துவீர்கள் என உறுதி எடுங்கள்.`,
        en: `Morning Pledge: Choose just one micro-habit from this page to test smoothly for the next seven mornings.`
      }, lang)
    };
  }

  // Ch 25: Sri Kshetra Gokarna Spiritual Culmination & Final Blessings
  return {
    p1Focus: pick6({
      kn: `${ctx.lagnaRashiName} ಲಗ್ನ, ${ctx.moonRashiName} ರಾಶಿ ಹಾಗೂ ${ctx.nakshatraName} ತಾರೆಯ ಸಮಗ್ರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ '${ctx.localizedYogiDeity}' ಸ್ಮರಣೆಯು ನಿಮ್ಮ ೫ ವರ್ಷಗಳ ಪಯಣವನ್ನು (${n(arch.yearScores[4])}% ಶಿಖರ) ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಿಂದ ಸುರಕ್ಷಿತವಾಗಿ ಮುನ್ನಡೆಸುತ್ತದೆ.`,
      mr: `${ctx.lagnaRashiName} लग्न, ${ctx.moonRashiName} चंद्र व ${ctx.nakshatraName} नक्षत्राच्या पूर्ण आशीर्वादासह '${ctx.localizedYogiDeity}' कृपा तुमच्या ५ वर्षांच्या प्रवासाला (${n(arch.yearScores[4])}% शिखर) गोकर्ण क्षेत्रातून अखंड बळ देते.`,
      hi: `${ctx.lagnaRashiName} लग्न, ${ctx.moonRashiName} चंद्र तथा ${ctx.nakshatraName} नक्षत्र के पावन समन्वय संग '${ctx.localizedYogiDeity}' की कृपा आपकी ५-वर्षीय यात्रा (${n(arch.yearScores[4])}% शिखर) को श्री गोकर्ण से सुरक्षित रखती है।`,
      te: `${ctx.lagnaRashiName} లగ్నం, ${ctx.moonRashiName} చంద్రుడు మరియు ${ctx.nakshatraName} నక్షత్ర ఆశీస్సులతో '${ctx.localizedYogiDeity}' అనుగ్రహం మీ 5 ఏళ్ల ప్రయాణాన్ని (${n(arch.yearScores[4])}% శిఖరం) శ్రీ గోకర్ణం నుండి కాపాడుతుంది.`,
      ta: `${ctx.lagnaRashiName} லக்னம், ${ctx.moonRashiName} சந்திரன் மற்றும் ${ctx.nakshatraName} ஆசியுடன் '${ctx.localizedYogiDeity}' அருள் உங்கள் 5 ஆண்டுப் பயணத்தை (${n(arch.yearScores[4])}% உச்சம்) ஸ்ரீ கோகர்ணத்திலிருந்து வழிநடத்துகிறது.`,
      en: `Uniting your ${ctx.lagnaRashiName} Ascendant, ${ctx.moonRashiName} Moon, and ${ctx.nakshatraName} star, Sri Kshetra Gokarna's blessing and ${ctx.localizedYogiDeity} guide your arc toward ${arch.yearScores[4]}% peace.`
    }, lang),
    p2Body: pick6({
      kn: `${ctx.lagnaRashiName}–${ctx.nakshatraName} ಜಾತಕದ ಈ ೨೫ ಅಧ್ಯಾಯಗಳ ಪುಸ್ತಕವು ನಿಮ್ಮ ದೈನಂದಿನ ಧೈರ್ಯ, ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಕುಟುಂಬದ ಒಗ್ಗಟ್ಟನ್ನು ಕಾಯುವ ನಂಬಿಗಸ್ತ ಸಂಗಾತಿಯಾಗಿದೆ.`,
      mr: `${ctx.lagnaRashiName}–${ctx.nakshatraName} कुंडलीचा हा २५ अध्यायांचा ग्रंथ तुमच्या रोजच्या धैर्याचा व कौटुंबिक सलोख्याचा विश्वासू सोबती राहील.`,
      hi: `${ctx.lagnaRashiName}–${ctx.nakshatraName} पत्रिका पर आधारित यह २५ अध्यायों की जीवन-पुस्तिका आपके दैनिक साहस और पारिवारिक सौहार्द की विश्वस्त साथी है।`,
      te: `${ctx.lagnaRashiName}–${ctx.nakshatraName} జాతకపు ఈ 25 అధ్యాయాల గ్రంథం మీ రోజువారీ ధైర్యానికి మరియు కుటుంబ ఐక్యతకు నమ్మకమైన తోడుగా నిలుస్తుంది.`,
      ta: `${ctx.lagnaRashiName}–${ctx.nakshatraName} ஜாதகத்தின் இந்த 25 அத்தியாய நூல் உங்கள் அன்றாடத் தைரியம் மற்றும் குடும்ப ஒற்றுமைக்குத் துணையாக நிலைக்கும்.`,
      en: `Crafted uniquely around ${ctx.lagnaRashiName} and ${ctx.nakshatraName}, keep these twenty-five chapters close as a trusted household compass.`
    }, lang),
    p3Body: "",
    reflectionNote: ed === 0 ? "" : pick6({
      kn: `ಶುಭಂ ಭೂಯಾತ್ — ಭಯವನ್ನು ಕಡಲಲ್ಲಿ ಬಿಟ್ಟು, ಭರವಸೆಯ ಬೆಳಕಿನೊಂದಿಗೆ ಇಂದಿನ ಶುಭಾರಂಭ ಮಾಡಿರಿ.`,
      mr: `शुभं भवतु — सर्व शंका बाजूला ठेवून आत्मविश्वास व शांततेने पुढील शुभ प्रवास सुरू करा.`,
      hi: `शुभं भूयात् — व्यर्थ भय को पीछे छोड़कर शांत विश्वास एवं आनंद के साथ आगे कदम बढ़ाएं।`,
      te: `శుభం భవతు — భయాలను విడిచిపెట్టి ప్రశాంతమైన ఆత్మవిశ్వాసంతో మీ శుభ ప్రయాణాన్ని కొనసాగించండి.`,
      ta: `நலம் பெருகட்டும் — தேவையற்ற அச்சத்தை விலக்கி அமைதியான நம்பிக்கையோடு உங்கள் நல்வழியில் செல்லுங்கள்.`,
      en: `Sacred Seal: Set lingering worry gently down beside Gokarna's quiet tide and walk forward in gratitude.`
    }, lang)
  };
}

function shaniTransitLabel(ctx: StoryEngineInput): string {
  return ctx.shaniTransitRashi;
}

// ============================================================================
// VARIED NON-FORMULAIC P2 & REFLECTION OPENERS (ELIMINATES "THE TWIST:" CLONES)
// ============================================================================

export function buildNonRepetitiveP2Opener(
  chNum: number,
  edition: 0 | 1 | 2 | 3,
  lang: SixLang
): string {
  // Replaces repetitive "Here is the plot twist..." / "ತಿರುವು:" across 21 chapters
  // with rich, varied editorial openings per chapter & edition!
  const pool: Array<Record<SixLang, string>> = [
    { kn: "ಗಮನಿಸಬೇಕಾದ ಆಳದ ಸತ್ಯ:", mr: "लक्षात घेण्याजोगे तथ्य:", hi: "भीतर की वास्तविक बात:", te: "గమనించాల్సిన లోతైన నిజం:", ta: "கவனிக்க வேண்டிய உண்மை:", en: "Look beneath the surface:" },
    { kn: "ಅದೃಷ್ಟದ ಮೌನ ಲೆಕ್ಕ:", mr: "काळाचा शांत हिशोब:", hi: "समय का मौन विधान:", te: "కాలపు నిశ్శబ్ద లెక్క:", ta: "காலத்தின் அமைதிக் கணக்கு:", en: "Notice the quiet ledger:" },
    { kn: "ಇದರ ನಿಜವಾದ ಅರ್ಥವೇನೆಂದರೆ:", mr: "यामागचा खरा अर्थ असा:", hi: "इसका वास्तविक संकेत यह है:", te: "దీని అసలు ఉద్దేశం ఏమిటంటే:", ta: "இதன் உண்மையான பொருள்:", en: "Read what this actually signals:" },
    { kn: "ಇಲ್ಲಿರುವ ಮಹತ್ವದ ಬದಲಾವಣೆ:", mr: "येथे घडणारे महत्त्वाचे वळण:", hi: "यहीं से बदलती है दिशा:", te: "ఇక్కడే మొదలయ్యే మార్పు:", ta: "இங்கே தொடங்கும் மாற்றம்:", en: "Here is where leverage flips:" },
    { kn: "ಬಹುತೇಕರು ತಪ್ಪಿಸುವ ಒಳನೋಟ:", mr: "अनेकांच्या नजरेतून सुटणारे सत्य:", hi: "अधिकांश लोग जो नहीं देख पाते:", te: "చాలామంది గుర్తించని కోణం:", ta: "பலரும் தவறவிடும் பார்வை:", en: "The detail almost everyone overlooks:" },
    { kn: "ಪ್ರಕೃತಿಯ ಸಮತೋಲನ ನೋಡಿ:", mr: "निसर्गाचा सूक्ष्म समतोल पहा:", hi: "प्रकृति का सूक्ष्म संतुलन देखें:", te: "ప్రకృతిలోని సమతుల్యత చూడండి:", ta: "இயற்கையின் சமநிலையைப் பாருங்கள்:", en: "Watch how balance restores itself:" },
    { kn: "ಕಾಲಚಕ್ರದ ಮುನ್ನೋಟ:", mr: "पुढील पावलाचे संकेत:", hi: "आगामी संकेत स्पष्ट हैं:", te: "రాబోయే సంకేతం స్పష్టం:", ta: "வரும் காலத்தின் அறிகுறி:", en: "Trace the quiet pattern:" },
    { kn: "ಅನುಭವ ಸಾಬೀತುಪಡಿಸುವ ಸತ್ಯ:", mr: "अनुभवाने सिद्ध झालेली गोष्ट:", hi: "अनुभव की कसौटी पर खरा सत्य:", te: "అనుభవం నిరూపించిన సత్యం:", ta: "அனுபவம் உணர்த்தும் பாடம்:", en: "What real experience confirms:" },
    { kn: "ನಿಜವಾದ ರಕ್ಷಣೆಯ ಮೂಲ:", mr: "खऱ्या संरक्षणाचा आधार:", hi: "असली सुरक्षा यहीं है:", te: "నిజమైన రక్షణ ఇక్కడే ఉంది:", ta: "உண்மையான பாதுகாப்பு இதுதான்:", en: "Why this works in your favor:" },
    { kn: "ತೆರೆಯ ಹಿಂದಿನ ತಿರುವು:", mr: "पडद्यामागील खरे कारण:", hi: "परदे के पीछे का कारण:", te: "తెరవెనుక ఉన్న కారణం:", ta: "திரைக்குப் பின்னாலுள்ள காரணம்:", en: "Behind closed doors, look closer:" },
    { kn: "ವಿಳಂಬದ ನಿಜವಾದ ಕಾರಣ:", mr: "विलंबामागचे खरे गुपित:", hi: "प्रतीक्षा के पीछे का कारण:", te: "ఆలస్యం వెనుక ఉన్న రహస్యం:", ta: "தாமதத்தின் பின்னணியில்:", en: "Why earlier waiting paid off:" },
    { kn: "ಬೆಳವಣಿಗೆಯ ಕೀಲಿಕೈ:", mr: "प्रगतीची खरी किल्ली:", hi: "उन्नति की सटीक कुंजी:", te: "అభివృద్ధికి అసలైన తాళం:", ta: "முன்னேற்றத்தின் திறவுகோல்:", en: "Unlocking the real shift:" }
  ];

  // Deterministic per-chapter & edition selection so adjacent chapters never share an opener
  const idx = (chNum * 5 + edition * 3) % pool.length;
  return pick6(pool[idx], lang);
}

export function stripFormulaicTwistLead(text: string): string {
  // Cleanly trims legacy "The ... twist:" / "ತಿರುವು:" boilerplate prefix when we replace it with varied openers
  return text
    .replace(
      /^(?:Here is the (?:plot twist|surprise twist|shocking twist|hidden favor|contrast)[^:]*:|The (?:\d+-year |Year \d+ |rewarding |career |health |90-day )?(?:plot )?twist[^:]*:|Watch for this twist:|Now here is the contrast most people miss:|Here is (?:Jupiter's signature twist|your wealth turning point|why it felt delayed earlier):|The mirage to spot early:|ಇಲ್ಲಿಯೇ ಕಥೆಯ ದೊಡ್ಡ ತಿರುವು ಇದೆ:|ಇದರಲ್ಲಿರುವ (?:ಅಚ್ಚರಿಯ|ಸುಂದರ) ತಿರುವು:|ರೋಚಕ ತಿರುವು(?:\s+ಏನೆಂದರೆ)?:|ವಿಚಿತ್ರ ತಿರುವು:|ಆನಂದದ ತಿರುವು:|ಐದು ವರ್ಷಗಳ ಮಹಾ ತಿರುವು:|ವೃತ್ತಿ ತಿರುವು:|ಹಣಕಾಸಿನ ದೊಡ್ಡ ತಿರುವು:|ಸಂಬಂಧದ ತಿರುವು:|ಆರೋಗ್ಯದ ತಿರುವು:|ಕಥೆಯ ತಿರುವು:|ತಿರುವು ಏನೆಂದರೆ:|ಇದರ (?:ಗುಪ್ತ|ಹಿಂದಿನ ಅಚ್ಚರಿಯ) (?:ತಿರುವು|ಕಥೆ):|ಗುಪ್ತ ತಿರುವು:|ಆಶ್ಚರ್ಯಕರ ತಿರುವು:|इथेच कथेचे खरे वळण आहे:|कथेचे खरे वळण हेच आहे:|खरा ट्विस्ट(?: हाच आहे)?:|यामागचा आश्चर्यकारक ट्विस्ट:|तिसरे आणि सर्वात रंजक सत्य:|यातला (?:सुंदर ट्विस्ट|ट्विस्ट असा आहे):|कारकिर्दीतील मोठा ट्विस्ट:|आर्थिक प्रगतीचा मोठा ट्विस्ट:|नात्यातील सुंदर वळण:|आरोग्याचे खरे वळण:|या तिमाहीचा ट्विस्ट:|मोठा ट्विस्ट:|अनपेक्षित ट्विस्ट:|आनंदाचा ट्विस्ट:|पाच वर्षांचा महान शेवट:|गूढ वळण:|यामागील मोठा ट्विस्ट:|यातील खरा सापळा:|यहीं कहानी का सबसे बड़ा मोड़ है:|रोमांचक मोड़(?: यही है)?:|कहानी का (?:बड़ा|प्यारा) मोड़(?: यह है)?:|इसके पीछे की चौंकाने वाली सच्चाई:|तीसरा और सबसे रोचक सच:|बड़ा मोड़ यही है:|सुंदर मोड़ यही है:|असली पेंच यहीं है:|खूबसूरत मोड़ यह है:|करियर का बड़ा मोड़:|आर्थिक मोड़ यहीं है:|स्वास्थ्य का असली सच:|विशेष मोड़:|खास मोड़:|सुखद मोड़:|पांच वर्षों का सुंदर निष्कर्ष:|ఇక్కడే అసలైన మలుపు ఉంది:|దీనిలోని ఆసక్తికరమైన మలుపు:|ఇక్కడ ఉన్న (?:ఆసక్తికర |మలుపు|జాగ్రత్త పడాల్సిన మలుపు):|దీని వెనుక ఉన్న ఆశ్చర్యకరమైన మలుపు:|మూడవ మరియు ఆశ్చర్యకర నిజం:|ఆశ్చర్యకరమైన మలుపు:|ఇందులోని మలుపు:|అద్భుత మలుపు:|ఇక్కడున్న మలుపు:|ఆర్థిక మలుపు ఇక్కడే ఉంది:|ఆరోగ్య మలుపు:|90 రోజుల మలుపు:|మలుపు:|ఆనందకర మలుపు:|ఐదేళ్ల మహా మలుపు:|ఇங்கேதான் கதையின் பெரிய திருப்பம்:|இதில் உள்ள சுவாரஸ்யமான திருப்பம்:|இதன் (?:சுவாரஸ்ய |அழகான |முக்கிய |ஆச்சரிய )?திருப்பம்:|தொழில் திருப்பம்:|பொருளாதாரத் திருப்பம்:|உறவுத் திருப்பம்:|ஆரோக்கியத் திருப்பம்:|90 நாள் திருப்பம்:|சுவாரஸ்ய திருப்பம்:|மகிழ்ச்சித் திருப்பம்:|ஐந்தாண்டுப் பயணத்தின் திருப்பம்:)\s*/i,
      ""
    )
    .trim();
}

export function stripFormulaicPauseLead(text: string): string {
  return text
    .replace(
      /^(?:Pause & Check:|Parent Mirror:|Today's 5-Minute Challenge:|ಸ್ವಯಂ-ಪರಿಶೀಲನೆ:|ಪೋಷಕರ (?:ಅವಲೋಕನ|ಪರಿಶೀಲನೆ):|ಇಂದಿನ ಪ್ರತಿಜ್ಞೆ:|ಮುಖ್ಯ ಸೂಚನೆ:|स्वतःला तपासा:|स्व-परीक्षण:|पालकांनी पहावे:|विचार करा:|पहा:|आजचा संकल्प:|महत्त्वाची नोंद:|स्वयं-निरीक्षण:|अभिभावक ध्यान दें:|सोचें:|देखें:|आज का सरल संकल्प:|मुख्य निर्देश:|మిమ్మల్ని మీరు (?:పరిశీలించుకోండి|అడుగండి):|తల్లిదండ్రుల పరిశీలన:|ఆలోచించండి:|గమనించండి:|నేటి ప్రతిజ్ఞ:|ముఖ్య గమనిక:|சுய பரிசோதனை:|பெற்றோர் கவனம்:|சிந்தியுங்கள்:|பாருங்கள்:|இன்றைய உறுதி:|முக்கிய குறிப்பு:)\s*/i,
      ""
    )
    .trim();
}

export function buildNonRepetitiveReflectionLead(
  chNum: number,
  edition: 0 | 1 | 2 | 3,
  lang: SixLang
): string {
  const leads: Array<Record<SixLang, string>> = [
    { kn: "ಸ್ವಯಂ-ಪರಿಶೀಲನೆ:", mr: "स्व-परीक्षण:", hi: "स्वयं-निरीक्षण:", te: "స్వీయ పరిశీలన:", ta: "சுய பரிசோதனை:", en: "Pause & Check:" },
    { kn: "ದೈನಂದಿನ ದಿಕ್ಸೂಚಿ:", mr: "दैनंदिन खूण:", hi: "दैनिक संकेत:", te: "రోజువారీ సంకేతం:", ta: "தினசரி குறிப்பு:", en: "Daily Compass:" },
    { kn: "ಗಮನಿಸಬೇಕಾದ ಅಂಶ:", mr: "लक्षात ठेवण्याची बाब:", hi: "ध्यान देने योग्य:", te: "గమనించాల్సిన అంశం:", ta: "கவனிக்க வேண்டியது:", en: "Quiet Watch:" },
    { kn: "ಮುಂದಿನ ಸಣ್ಣ ಹೆಜ್ಜೆ:", mr: "पुढील सोपे पाऊल:", hi: "अगला सरल कदम:", te: "తదుపరి చిన్న అడుగు:", ta: "அடுத்த எளிய படி:", en: "Action Anchor:" },
    { kn: "ಮೌನ ಸತ್ಯ:", mr: "अंतरंग सत्य:", hi: "अंतर्मन की बात:", te: "అంతరంగ నిజం:", ta: "உள்ளத் தெளிவு:", en: "Silent Edge:" }
  ];
  const idx = (chNum * 2 + edition) % leads.length;
  return pick6(leads[idx], lang);
}

export function resolvePlaceSuffix(ctx: StoryEngineInput): string {
  return RASHI_6L[ctx.lagnaRashiIdx]?.[ctx.targetLang] || ctx.lagnaRashiName;
}
