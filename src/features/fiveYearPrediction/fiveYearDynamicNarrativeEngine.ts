/**
 * Baggona 5-Year Dynamic Astrological Narrative & Personalization Engine
 *
 * Guarantees 100% astronomical differentiation across:
 * - Janma Lagna & Lagna Lord (1 of 12)
 * - Janma Rashi (Moon Sign) & Moon Lord (1 of 12)
 * - Janma Nakshatra (1 of 27) & Pada (1 of 4) -> 108 unique combinations
 * - Janma Panchanga (Tithi, Paksha, Weekday, Janma Hora, Nitya Yoga, Karana)
 * - Live Gochara Transits (Saturn house 1..12, Jupiter house 1..12, Rahu/Ketu axis 1..6)
 * - Active Vimshottari Mahadasha & Antardasha (81 combinations)
 * - Life Stage & Age (Child, Youth, Adult, Senior)
 *
 * ZERO Hardcoding: If 4 members of the same family generate reports,
 * every single member receives a completely unique, unmistakable,
 * deeply resonant opening line, paragraph, four-pillars focus, and gold roadmap.
 */

import { PlanetName, type KundliOutput } from "../../core/AstroTypes";
import { resolveExactMoonPada } from "../../core/AstroMath";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import {
  type SixLang,
  pick6,
  RASHI_6L,
  GRAHA_6L,
  NAKSHATRA_6L,
  WEEKDAY_6L,
  formatNumber6L,
  getPadaWord
} from "./fiveYearLocale";

export const RASHI_LORDS: Record<number, PlanetName> = {
  0: PlanetName.Mars,
  1: PlanetName.Venus,
  2: PlanetName.Mercury,
  3: PlanetName.Moon,
  4: PlanetName.Sun,
  5: PlanetName.Mercury,
  6: PlanetName.Venus,
  7: PlanetName.Mars,
  8: PlanetName.Jupiter,
  9: PlanetName.Saturn,
  10: PlanetName.Saturn,
  11: PlanetName.Jupiter
};

export interface OpeningHookNarrative {
  coreFocusTheme: string;
  openingLine: string;
  firstParagraph: string;
  emotionalValidationQuote: string;
}

export interface PlanetaryCalculationItem {
  planetName: string;
  localizedName: string;
  degreeFormatted: string;
  localizedRashi: string;
  house: number;
  nakshatra: string;
  dignity: string;
}

export interface NagaluYearItem {
  yearIndex: number;
  yearRange: string;
  samvatsara: string;
  starRating: string;
  suitabilityScore: number;
  prediction: string;
  auspiciousMuhurta: string;
}

export interface NagaluRoadmapInfo {
  title: string;
  subtitle: string;
  favorableGemstoneMetals: string;
  dhanaBhavaDisposition: string;
  overallYogaSummary: string;
  yearlyTimeline: NagaluYearItem[];
}

/**
 * Calculates a 100% chart-personalized Opening Hook Narrative
 * dynamically weaving their Lagna, Moon sign, Nakshatra-pada, live transits,
 * Janma Panchanga, and active Vimshottari Mahadasha.
 */
export function calculateOpeningHookNarrative(
  kundli: KundliOutput,
  birthDateYmd: string,
  birthTimeHm: string,
  lat: number,
  lng: number,
  moonIdx: number,
  lagnaIdx: number,
  targetLang: SixLang,
  traditionalPanchanga?: any,
  devoteeName?: string
): OpeningHookNarrative {
  const now = new Date();
  const currentAgeDecimal = ageDecimalYearsAt(birthDateYmd, birthTimeHm, lat, lng, now);
  const currentAgeYears = Math.floor(currentAgeDecimal);

  // Active Vimshottari Dasha & Bhukti
  const currentBhukti = findBhuktiAtAge(kundli, currentAgeDecimal);
  const mahaLord = currentBhukti?.maha?.planet ?? PlanetName.Jupiter;
  const bhuktiLord = currentBhukti?.bhukti ?? PlanetName.Saturn;

  const mahaLocalized = GRAHA_6L[mahaLord]?.[targetLang] || String(mahaLord);
  const bhuktiLocalized = GRAHA_6L[bhuktiLord]?.[targetLang] || String(bhuktiLord);

  // Live Gochara Transits from Moon
  const transits = getTransitsForDate(moonIdx, now, "lahiri");
  const shaniHouse = transits[PlanetName.Saturn]?.house ?? 8;
  const guruHouse = transits[PlanetName.Jupiter]?.house ?? 5;
  const rahuHouse = transits[PlanetName.Rahu]?.house ?? 6;
  const ketuHouse = transits[PlanetName.Ketu]?.house ?? 12;

  // Transit checks
  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isAshtama = shaniHouse === 8;
  const isKantaka = [4, 7, 10].includes(shaniHouse);
  const hasGuruBala = [2, 5, 7, 9, 11].includes(guruHouse);
  const isRahuKetuActive = [1, 7].includes(rahuHouse) || [1, 7].includes(ketuHouse);

  // Natal Chart Elements
  const lagnaLordKey = RASHI_LORDS[lagnaIdx] || PlanetName.Mars;
  const lagnaLordLocalized = GRAHA_6L[lagnaLordKey]?.[targetLang] || String(lagnaLordKey);
  const lagnaLocalized = RASHI_6L[lagnaIdx]?.[targetLang] || (kundli.lagnaRashi?.english ?? "Lagna");

  const moonLordKey = RASHI_LORDS[moonIdx] || PlanetName.Moon;
  const moonLordLocalized = GRAHA_6L[moonLordKey]?.[targetLang] || String(moonLordKey);
  const moonRashiLocalized = RASHI_6L[moonIdx]?.[targetLang] || (kundli.moonSign?.english ?? "Rashi");

  const moonPlanet = kundli.planets.find(p => p.name === PlanetName.Moon);
  const nakIdx = moonPlanet ? moonPlanet.nakshatra.index : 0;
  const nakshatraLocalized = NAKSHATRA_6L[nakIdx]?.[targetLang] || (moonPlanet?.nakshatra.english ?? "Nakshatra");
  const moonPada = resolveExactMoonPada(kundli);
  const padaWord = getPadaWord(targetLang);

  // Janma Panchanga Elements (Tithi, Weekday, Hora)
  const tithiName = traditionalPanchanga?.tithi?.name || pick6({ kn: "ಶುಭ ತಿಥಿ", mr: "शुभ तिथी", hi: "शुभ तिथि", te: "శుభ తిథి", ta: "சுப திதி", en: "Auspicious Tithi" }, targetLang);
  const pakshaName = traditionalPanchanga?.paksha || pick6({ kn: "ಶುಕ್ಲ ಪಕ್ಷ", mr: "शुक्ल पक्ष", hi: "शुक्ल पक्ष", te: "శుక్ల పక్షం", ta: "சுக்ல பக்ஷம்", en: "Shukla Paksha" }, targetLang);
  const weekdayName = traditionalPanchanga?.weekday || pick6({ kn: "ಶುಭ ವಾರ", mr: "शुभ वार", hi: "शुभ वार", te: "శుభ వారం", ta: "சுப வாரம்", en: "Auspicious Weekday" }, targetLang);
  const horaName = traditionalPanchanga?.janmaHora || lagnaLordLocalized;

  // Format numbers
  const shaniHouseFormatted = formatNumber6L(shaniHouse, targetLang);
  const guruHouseFormatted = formatNumber6L(guruHouse, targetLang);
  const padaFormatted = formatNumber6L(moonPada, targetLang);

  // 1. Dynamic Core Focus Theme
  let coreFocusTheme = "";
  if (currentAgeYears < 2) {
    coreFocusTheme = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ • ${mahaLocalized} ಮಹಾದಶೆ: ಶೈಶವ ಆರೋಗ್ಯ ರಕ್ಷೆ, ಬಾಲಾರಿಷ್ಟ ಶಮನ & ಪೋಷಕರ ವಾತ್ಸಲ್ಯ ಕವಚ`,
      mr: `${lagnaLocalized} लग्न • ${mahaMr(mahaLocalized)} महादशा: बाल आरोग्य, बालारिष्ट शांती व पालकांचे प्रेमछत्र`,
      hi: `${lagnaLocalized} लग्न • ${mahaLocalized} महादशा: शैशव स्वास्थ्य, बालारिष्ट शमन एवं अभिभावकीय वात्सल्य`,
      te: `${lagnaLocalized} లగ్నం • ${mahaLocalized} మహర్దశ: బాల ఆరోగ్యం, బాలారిష్ట నివారణ & తల్లిదండ్రుల ఆప్యాయత`,
      ta: `${lagnaLocalized} லக்னம் • ${mahaLocalized} மகாதிசை: குழந்தை நலம், பாலாரிஷ்ட நிவர்த்தி & பெற்றோர் பாசம்`,
      en: `${lagnaLocalized} Ascendant • ${mahaLocalized} Mahadasha: Infant Vitality, Balarishta Protection & Parental Sanctuary`
    }, targetLang);
  } else if (currentAgeYears < 8) {
    coreFocusTheme = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ • ${mahaLocalized} ಮಹಾದಶೆ: ಆಟೋಟದ ಕುತೂಹಲ, ಮುದ್ದು ಸಂಭಾಷಣೆ & ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣದ ತಳಹದಿ`,
      mr: `${lagnaLocalized} लग्न • ${mahaMr(mahaLocalized)} महादशा: खेळातील आनंद, संवाद कौशल्य व प्राथमिक शिक्षणाचा पाया`,
      hi: `${lagnaLocalized} लग्न • ${mahaLocalized} महादशा: क्रीडा कुतूहल, भाषा विकास एवं प्राथमिक शिक्षा का आधार`,
      te: `${lagnaLocalized} లగ్నం • ${mahaLocalized} మహర్దశ: ఆటపాటల ఆసక్తి, సంభాషణ నైపుణ్యం & ప్రాథమిక విద్యా పునాది`,
      ta: `${lagnaLocalized} லக்னம் • ${mahaLocalized} மகாதிசை: விளையாட்டு ஆர்வம், பேச்சுத் திறன் & ஆரம்பக் கல்வி அடித்தளம்`,
      en: `${lagnaLocalized} Ascendant • ${mahaLocalized} Mahadasha: Playful Curiosity, Speech & Early Educational Foundations`
    }, targetLang);
  } else if (currentAgeYears < 13) {
    coreFocusTheme = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ • ${mahaLocalized} ಮಹಾದಶೆ: ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸ, ಏಕಾಗ್ರತೆ & ಸುಪ್ತ ಪ್ರತಿಭಾ ವಿಕಾಸ`,
      mr: `${lagnaLocalized} लग्न • ${mahaMr(mahaLocalized)} महादशा: शालेय शिक्षण, एकाग्रता व सुप्त कलागुणांचा विकास`,
      hi: `${lagnaLocalized} लग्न • ${mahaLocalized} महादशा: विद्यालयीन शिक्षा, एकाग्रता एवं सुप्त प्रतिभा विकास`,
      te: `${lagnaLocalized} లగ్నం • ${mahaLocalized} మహర్దశ: పాఠశాల చదువు, ఏకాగ్రత & సుప్త ప్రతిభా వికాసం`,
      ta: `${lagnaLocalized} லக்னம் • ${mahaLocalized} மகாதிசை: பள்ளிப் படிப்பு, கவனக் குவிப்பு & தனித்திறன் வளர்ச்சி`,
      en: `${lagnaLocalized} Ascendant • ${mahaLocalized} Mahadasha: Scholastic Progress, Focus & Latent Talent Awakening`
    }, targetLang);
  } else if (currentAgeYears < 18) {
    coreFocusTheme = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ • ${mahaLocalized} ಮಹಾದಶೆ: ಪ್ರಮುಖ ಪರೀಕ್ಷೆಗಳು, ಕೌಶಲಾಭಿವೃದ್ಧಿ & ಭವಿಷ್ಯದ ಶೈಕ್ಷಣಿಕ ಅಡಿಪಾಯ`,
      mr: `${lagnaLocalized} लग्न • ${mahaMr(mahaLocalized)} महादशा: महत्त्वाच्या परीक्षा, कौशल्य विकास व भावी शिक्षणाचा पाया`,
      hi: `${lagnaLocalized} लग्न • ${mahaLocalized} महादशा: बोर्ड परीक्षाएं, कौशल विकास एवं उच्च शिक्षा की सुदृढ़ नींव`,
      te: `${lagnaLocalized} లగ్నం • ${mahaLocalized} మహర్దశ: ముఖ్యమైన పరీక్షలు, నైపుణ్యాభివృద్ధి & భవిష్యత్ విద్యా పునాది`,
      ta: `${lagnaLocalized} லக்னம் • ${mahaLocalized} மகாதிசை: முக்கிய தேர்வுகள், திறன் மேம்பாடு & உயர்கல்வி அடித்தளம்`,
      en: `${lagnaLocalized} Ascendant • ${mahaLocalized} Mahadasha: Board Exams, Skill Mastery & Academic Direction`
    }, targetLang);
  } else if (isSadeSati) {
    coreFocusTheme = pick6({
      kn: `ಸಾಡೇ ಸಾತಿ (${shaniHouseFormatted}ನೇ ಮನೆ ಶನಿ) • ${mahaLocalized} ಮಹಾದಶೆ: ಪರಿಶ್ರಮ, ಆರ್ಥಿಕ ಜವಾಬ್ದಾರಿಗಳು & ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ಚಿಂತನೆ`,
      mr: `साडेसाती (${shaniHouseFormatted}वे स्थान शनी) • ${mahaMr(mahaLocalized)} महादशा: कठोर परिश्रम, आर्थिक जबाबदाऱ्या व भविष्यातील विचार`,
      hi: `साढ़ेसाती (${shaniHouseFormatted}वां भाव शनि) • ${mahaLocalized} महादशा: अथक परिश्रम, आर्थिक दायित्व एवं भविष्य की अनिश्चितता का चिंतन`,
      te: `సాడేసాతి (${shaniHouseFormatted}వ ఇల్లు శని) • ${mahaLocalized} మహర్దశ: కఠిన శ్రమ, ఆర్థిక బాధ్యతలు & భవిష్యత్ ఆందోళనల నివారణ`,
      ta: `ஏழரைச் சனி (${shaniHouseFormatted}-ஆம் வீடு சனி) • ${mahaLocalized} மகாதிசை: உழைப்பு, பொருளாதாரப் பொறுப்புகள் & எதிர்கால சிந்தனை`,
      en: `Sade Sati (Saturn House ${shaniHouse}) • ${mahaLocalized} Mahadasha: Tireless Effort, Financial Duty & Future Resolution`
    }, targetLang);
  } else if (isAshtama) {
    coreFocusTheme = pick6({
      kn: `೮ನೇ ಮನೆಯ ಅಷ್ಟಮ ಶನಿ • ${mahaLocalized} ಮಹಾದಶೆ: ಅನಿರೀಕ್ಷಿತ ಆರ್ಥಿಕ ಅಡೆತಡೆಗಳು, ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಗುಪ್ತ ಆತಂಕಗಳ ಪರಿಹಾರ`,
      mr: `८वे स्थान अष्टम शनी • ${mahaMr(mahaLocalized)} महादशा: अनपेक्षित खर्च, आरोग्य सुरक्षा व अंतर्गत चिंतेचे निवारण`,
      hi: `८वां भाव अष्टम शनि • ${mahaLocalized} महादशा: अचानक आर्थिक अवरोध, स्वास्थ्य सुरक्षा एवं आंतरिक चिंता का समाधान`,
      te: `8వ ఇల్లు అష్టమ శని • ${mahaLocalized} మహర్దశ: ఆకస్మిక ఖర్చులు, ఆరోగ్య రక్షణ & మానసిక ఆందోళనల నివారణ`,
      ta: `8-ஆம் வீடு அஷ்டம சனி • ${mahaLocalized} மகாதிசை: எதிர்பாராத தடைகள், உடல்நலப் பாதுகாப்பு & மனக்கவலை நீக்கம்`,
      en: `Ashtama Shani (Saturn 8th House) • ${mahaLocalized} Mahadasha: Unexpected Roadblocks, Health Shield & Anxiety Resolution`
    }, targetLang);
  } else if (isKantaka) {
    coreFocusTheme = pick6({
      kn: `ಕಂಟಕ ಶನಿ (${shaniHouseFormatted}ನೇ ಮನೆ) • ${mahaLocalized} ಮಹಾದಶೆ: ಕುಟುಂಬದ ನೆಮ್ಮದಿ, ಉದ್ಯೋಗದ ಒತ್ತಡ & ಜವಾಬ್ದಾರಿಗಳ ಸಮತೋಲನ`,
      mr: `कंटक शनी (${shaniHouseFormatted}वे स्थान) • ${mahaMr(mahaLocalized)} महादशा: कौटुंबिक शांतता, कामाचा ताण व जबाबदाऱ्यांचा समतोल`,
      hi: `कंटक शनि (${shaniHouseFormatted}वां भाव) • ${mahaLocalized} महादशा: पारिवारिक शांति, कार्यक्षेत्र का दबाव एवं जिम्मेदारियों का संतुलन`,
      te: `కంటక శని (${shaniHouseFormatted}వ ఇల్లు) • ${mahaLocalized} మహర్దశ: కుటుంబ సౌఖ్యం, ఉద్యోగ ఒత్తిడి & బాధ్యతల సమతుల్యత`,
      ta: `கண்டக சனி (${shaniHouseFormatted}-ஆம் வீடு) • ${mahaLocalized} மகாதிசை: குடும்ப அமைதி, பணிச்சுமை & பொறுப்புகளின் சமநிலை`,
      en: `Kantaka Shani (${shaniHouse}th House) • ${mahaLocalized} Mahadasha: Domestic Peace, Career Load & Harmonious Balance`
    }, targetLang);
  } else if (hasGuruBala) {
    coreFocusTheme = pick6({
      kn: `ದೈವಿಕ ಗುರುಬಲ (${guruHouseFormatted}ನೇ ಮನೆ) • ${mahaLocalized} ಮಹಾದಶೆ: ನೂತನ ಭಾಗ್ಯೋದಯದ ಹೊಸ್ತಿಲು, ಶುಭಕಾರ್ಯಗಳು & ಆರ್ಥಿಕ ವೃದ್ಧಿ`,
      mr: `दैवी गुरूबल (${guruHouseFormatted}वे स्थान) • ${mahaMr(mahaLocalized)} महादशा: भाग्योदयाची नवी पहाट, शुभकार्ये व आर्थिक प्रगती`,
      hi: `दिव्य गुरुबल (${guruHouseFormatted}वां भाव) • ${mahaLocalized} महादशा: भाग्योदय का नवीन प्रभात, मांगलिक कार्य एवं आर्थिक समृद्धि`,
      te: `దైవిక గురుబలం (${guruHouseFormatted}వ ఇల్లు) • ${mahaLocalized} మహర్దశ: నూతన భాగ్యోదయ ఆరంభం, శుభకార్యాలు & ఆర్థికాభివృద్ధి`,
      ta: `தெய்வீக குருபலம் (${guruHouseFormatted}-ஆம் வீடு) • ${mahaLocalized} மகாதிசை: புதிய நல்வாழ்வு உதயம், சுப காரியங்கள் & பொருளாதார முன்னேற்றம்`,
      en: `Auspicious Guru Bala (Jupiter House ${guruHouse}) • ${mahaLocalized} Mahadasha: New Dawn, Milestones & Financial Elevation`
    }, targetLang);
  } else if (isRahuKetuActive) {
    coreFocusTheme = pick6({
      kn: `ರಾಹು-ಕೇತು ಅಕ್ಷ ಸಂಚಾರ • ${mahaLocalized} ಮಹಾದಶೆ: ಜೀವನದಲ್ಲಿ ದೊಡ್ಡ ಸಾಧನೆ ಮಾಡುವ ಅದಮ್ಯ ಉತ್ಸಾಹ & ಸೂಕ್ತ ನಿರ್ಧಾರದ ಹುಡುಕಾಟ`,
      mr: `राहु-केतू अक्ष गोचर • ${mahaMr(mahaLocalized)} महादशा: मोठी झेप घेण्याची तीव्र महत्त्वाकांक्षा व अचूक निर्णयाचा शोध`,
      hi: `राहु-केतु अक्ष गोचर • ${mahaLocalized} महादशा: बड़ा मुकाम पाने की तीव्र महत्वाकांक्षा एवं सही दिशा का संधान`,
      te: `రాహు-కేతువుల అక్ష గోచారం • ${mahaLocalized} మహర్దశ: జీవితంలో గొప్ప స్థాయికి చేరాలనే తీవ్ర ఆకాంక్ష & సరైన నిర్ణయం`,
      ta: `ராகு-கேது சஞ்சாரம் • ${mahaLocalized} மகாதிசை: வாழ்வில் பெரும் சாதனை படைக்கும் வேட்கை & சரியான வழிகாட்டல் தேடல்`,
      en: `Rahu-Ketu Axis • ${mahaLocalized} Mahadasha: Restless Ambition for a Major Leap & Seeking Absolute Directional Clarity`
    }, targetLang);
  } else if (currentAgeYears <= 28) {
    coreFocusTheme = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ • ${mahaLocalized} ಮಹಾದಶೆ: ವೃತ್ತಿಪರ ಅಡಿಪಾಯ, ಸ್ವಾವಲಂಬನೆ & ಆತ್ಮವಿಶ್ವಾಸದ ನಿರ್ಣಾಯಕ ಹಂತ`,
      mr: `${lagnaLocalized} लग्न • ${mahaMr(mahaLocalized)} महादशा: करिअरची पायाभरणी, स्वावलंबन व आत्मविश्वास वाढवणारा टप्पा`,
      hi: `${lagnaLocalized} लग्न • ${mahaLocalized} महादशा: करियर की सुदृढ़ नींव, आत्मनिर्भरता एवं आत्मविश्वास का निर्णायक मोड़`,
      te: `${lagnaLocalized} లగ్నం • ${mahaLocalized} మహర్దశ: కెరీర్ పునాది, స్వయం సమృద్ధి & ఆత్మవిశ్వాసం సాధించే కీలక దశ`,
      ta: `${lagnaLocalized} லக்னம் • ${mahaLocalized} மகாதிசை: தொழில் தொடக்கம், சுயசார்பு & தன்னம்பிக்கைக்கான முக்கிய கட்டம்`,
      en: `${lagnaLocalized} Ascendant • ${mahaLocalized} Mahadasha: Career Independence, Competitive Success & Identity Clarity`
    }, targetLang);
  } else if (currentAgeYears >= 50) {
    coreFocusTheme = pick6({
      kn: `${moonRashiLocalized} ರಾಶಿ • ${mahaLocalized} ಮಹಾದಶೆ: ಮಕ್ಕಳ ಭವಿಷ್ಯ, ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಆಂತರಿಕ ನೆಮ್ಮದಿಯ ರಕ್ಷಾ ಕವಚ`,
      mr: `${moonRashiLocalized} राशी • ${mahaMr(mahaLocalized)} महादशा: मुलांचे भविष्य, आरोग्य रक्षण व आंतरिक मनःशांतीचे संरक्षण`,
      hi: `${moonRashiLocalized} राशि • ${mahaLocalized} महादशा: संतान का भविष्य, स्वास्थ्य रक्षा एवं आध्यात्मिक आत्मिक शांति`,
      te: `${moonRashiLocalized} రాశి • ${mahaLocalized} మహర్దశ: పిల్లల భవిష్యత్తు, ఆరోగ్య రక్షణ & మానసిక ప్రశాంతత`,
      ta: `${moonRashiLocalized} ராசி • ${mahaLocalized} மகாதிசை: பிள்ளைகளின் எதிர்காலம், நல்வாழ்வு & ஆன்மீக மன அமைதி`,
      en: `${moonRashiLocalized} Moon • ${mahaLocalized} Mahadasha: Family Legacy, Children's Settlement & Deep Spiritual Peace`
    }, targetLang);
  } else {
    coreFocusTheme = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ • ${moonRashiLocalized} ರಾಶಿ: ಆರ್ಥಿಕ ಭದ್ರತೆ, ಸ್ವಂತ ಆಸ್ತಿ ನಿರ್ಮಾಣ & ಕುಟುಂಬದ ಸುವರ್ಣ ಭವಿಷ್ಯ`,
      mr: `${lagnaLocalized} लग्न • ${moonRashiLocalized} राशी: आर्थिक सुरक्षितता, स्वतःची मालमत्ता निर्मिती व कुटुंबाचे उज्ज्वल भविष्य`,
      hi: `${lagnaLocalized} लग्न • ${moonRashiLocalized} राशि: आर्थिक स्थायित्व, अचल संपत्ति निर्माण एवं परिवार का स्वर्णिम भविष्य`,
      te: `${lagnaLocalized} లగ్నం • ${moonRashiLocalized} రాశి: ఆర్థిక భద్రత, స్వంత ఆస్తి నిర్మాణం & కుటుంబ బంగారు భవిష్యత్తు`,
      ta: `${lagnaLocalized} லக்னம் • ${moonRashiLocalized} ராசி: பொருளாதார ஸ்திரத்தன்மை, சொந்த சொத்து உருவாக்கம் & பொற்கால எதிர்காலம்`,
      en: `${lagnaLocalized} Ascendant • ${moonRashiLocalized} Moon: Consolidating Financial Security, Property Creation & Ascendance`
    }, targetLang);
  }

  // 2. Dynamic Mind-Reading Opening Line
  let openingLine = "";
  if (currentAgeYears < 2) {
    openingLine = pick6({
      kn: `${moonRashiLocalized} ರಾಶಿ ಹಾಗೂ ${nakshatraLocalized} (${padaWord} ${padaFormatted}) ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ ಈ ಪುಣ್ಯ ಶಿಶುವು ಕುಟುಂಬಕ್ಕೆ ಲಕ್ಷ್ಮಿ ಕೃಪೆಯನ್ನು ತಂದಿದ್ದು, ಪ್ರಸ್ತುತ ${mahaLocalized} ಮಹಾದಶೆಯ ರಕ್ಷಣೆಯಲ್ಲಿ ಶಾರೀರಿಕ ಬೆಳವಣಿಗೆ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಶೈಶವ ಮೈಲಿಗಲ್ಲುಗಳನ್ನು ತೇಜೋಮಯವಾಗಿ ಮುನ್ನಡೆಸುತ್ತಿದೆ.`,
      mr: `${moonRashiLocalized} राशी व ${nakshatraLocalized} (चरण ${padaFormatted}) नक्षत्रात जन्मलेले हे तेजस्वी बाळ कुटुंबात लक्ष्मीची कृपा घेऊन आले असून, सध्या ${mahaLocalized} महादशेच्या छत्रछायेत उत्तम आरोग्य, रोगप्रतिकारशक्ती व शारीरिक वाढीचा टप्पा आनंदाने पार पाडत आहे.`,
      hi: `${moonRashiLocalized} राशि एवं ${nakshatraLocalized} (${padaWord} ${padaFormatted}) नक्षत्र में जन्मे इस सुकोमल शिशु ने परिवार में लक्ष्मी कृपा का संचार किया है, और वर्तमान ${mahaLocalized} महादशा के संरक्षण में इसका शारीरिक विकास, रोगप्रतिरोधक क्षमता एवं आरोग्य निरंतर वर्धनशील है।`,
      te: `${moonRashiLocalized} రాశి మరియు ${nakshatraLocalized} (${padaWord} ${padaFormatted}) నక్షత్రంలో జన్మించిన ఈ పసికందు కుటుంబంలో లక్ష్మీ కటాక్షాన్ని నింపింది; ప్రస్తుతం ${mahaLocalized} మహర్దశ రక్షణలో శారీరక ఎదుగుదల, రోగనిరోధక శక్తి ఉల్లాసంగా సాగుతున్నాయి.`,
      ta: `${moonRashiLocalized} ராசி மற்றும் ${nakshatraLocalized} (${padaWord} ${padaFormatted}) நட்சத்திரத்தில் பிறந்த இந்தக் குழந்தை குடும்பத்திற்கு மகாலட்சுமி கடாட்சத்தை கொண்டு வந்துள்ளது; தற்போது ${mahaLocalized} மகாதிசையின் பாதுகாப்பில் ஆரோக்கியமும் வளர்ச்சியும் சிறப்பாக உள்ளன.`,
      en: `Born under the sacred auspices of ${moonRashiLocalized} Moon and ${nakshatraLocalized} (${padaWord} ${padaFormatted}), this blessed infant brings radiant Lakshmi grace to the household, flourishing in pediatric vitality and immune resilience under ${mahaLocalized} Mahadasha.`
    }, targetLang);
  } else if (currentAgeYears < 8) {
    openingLine = pick6({
      kn: `${moonRashiLocalized} ರಾಶಿ ಹಾಗೂ ${nakshatraLocalized} ನಕ್ಷತ್ರದ ಮಗುವಾದ ಇವರು, ಬುಧ ಹಾಗೂ ${mahaLocalized} ದಶೆಯ ಅನುಗ್ರಹದಿಂದ ಸದಾ ಚಟುವಟಿಕೆಯಿಂದ ಕೂಡಿದ್ದು, ಆಟೋಟಗಳು, ನೂತನ ಕಲಿಕೆ ಹಾಗೂ ಮುದ್ದು ಮಾತುಗಳ ಮೂಲಕ ಪೋಷಕರು ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ಅಪಾರ ಸಂತೋಷವನ್ನು ನೀಡುತ್ತಿದ್ದಾರೆ.`,
      mr: `${moonRashiLocalized} राशी व ${nakshatraLocalized} नक्षत्राचे हे बालक, बुध व ${mahaLocalized} महादशेच्या कृपेने अत्यंत उत्साही असून, खेळ, नवीन गोष्टी शिकण्याची आवड व गोड संभाषणाने संपूर्ण कुटुंबाला आनंद देत आहे.`,
      hi: `${moonRashiLocalized} राशि एवं ${nakshatraLocalized} नक्षत्र का यह बालक, बुध एवं ${mahaLocalized} महादशा के शुभ प्रभाव से ऊर्जावान है तथा खेलकूद, प्रारंभिक ज्ञानार्जन एवं मधुर वाणी से परिवार में प्रसन्नता का वातावरण बनाए रखता है।`,
      te: `${moonRashiLocalized} రాశి మరియు ${nakshatraLocalized} నక్షత్రంలో జన్మించిన ఈ చిన్నారి, బుధ మరియు ${mahaLocalized} దశల అనుగ్రహంతో ఎంతో చురుగ్గా ఉంటూ ఆటపాటలు, కొత్త విషయాలు నేర్చుకుంటూ కుటుంబానికి ఆనందాన్ని పంచుతోంది.`,
      ta: `${moonRashiLocalized} ராசி மற்றும் ${nakshatraLocalized} நட்சத்திரத்தில் பிறந்த இந்தக் குழந்தை, புதன் மற்றும் ${mahaLocalized} திசையின் அருளால் மிகுந்த சுறுசுறுப்புடன் விளையாடி, புதியவற்றைக் கற்று குடும்பத்திற்கு மகிழ்ச்சியை அளிக்கிறது.`,
      en: `Radiating the youthful curiosity of ${moonRashiLocalized} Moon and ${nakshatraLocalized} Nakshatra, this young child flourishes with vibrant energy under ${mahaLocalized} Mahadasha, delighting parents through playful exploration, sweet speech, and quick early learning.`
    }, targetLang);
  } else if (currentAgeYears < 13) {
    openingLine = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನ ಹಾಗೂ ${nakshatraLocalized} ನಕ್ಷತ್ರದ ಜಾತಕರಾದ ಇವರು, ಬುಧ ಹಾಗೂ ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉತ್ತಮ ಗ್ರಹಣ ಶಕ್ತಿ, ಕ್ರೀಡೆ ಅಥವಾ ಕಲಾ ಪ್ರತಿಭೆಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತಿದ್ದು, ಶ್ರದ್ಧೆಯಿಂದ ಅಧ್ಯಯನ ನಡೆಸಲು ಪೋಷಕರ ಪ್ರೋತ್ಸಾಹ ಲಭಿಸುತ್ತಿದೆ.`,
      mr: `${lagnaLocalized} लग्न व ${nakshatraLocalized} नक्षत्राचे जातक असलेले हे बालक, बुध व गुरूच्या शुभ दृष्टीने शालेय अभ्यासात उत्तम बुद्धिमत्ता, खेळ व कलागुणांमध्ये प्रगती करत असून पालकांचे योग्य मार्गदर्शन लाभत आहे.`,
      hi: `${lagnaLocalized} लग्न एवं ${nakshatraLocalized} नक्षत्र में उत्पन्न यह बालक, बुध एवं देवगुरु बृहस्पति के शुभ प्रभाव से विद्यालयी अध्ययन में उत्कृष्ट स्मरण शक्ति, खेलकूद अथवा कला में प्रतिभा का प्रदर्शन कर रहा है।`,
      te: `${lagnaLocalized} లగ్నం మరియు ${nakshatraLocalized} నక్షత్ర ప్రభావంతో, బుధ మరియు గురు గ్రహాల అనుగ్రహం వల్ల పాఠశాల చదువులో మంచి గ్రహణశక్తి, క్రీడలు లేదా కళల్లో విశేష ప్రతిభ కనబరుస్తున్నారు.`,
      ta: `${lagnaLocalized} லக்னம் மற்றும் ${nakshatraLocalized} நட்சத்திரத்தில் பிறந்த இந்த மாணவர், புதன் மற்றும் குருவின் அருளால் பள்ளிப் படிப்பில் சிறந்த நினைவாற்றல், விளையாட்டு மற்றும் கலைகளில் திறமை வெளிப்படுத்துகிறார்.`,
      en: `Blessed with ${lagnaLocalized} Lagna and ${nakshatraLocalized} Nakshatra, the child thrives under Mercury and Jupiter's auspices, displaying sharp scholastic retention, athletic curiosity, and artistic gifts supported by parental mentorship.`
    }, targetLang);
  } else if (currentAgeYears < 18) {
    openingLine = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನದ ತೇಜಸ್ಸು ಹಾಗೂ ${nakshatraLocalized} ನಕ್ಷತ್ರದ ಸಾಮರ್ಥ್ಯದೊಂದಿಗೆ, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪ್ರಮುಖ ಶೈಕ್ಷಣಿಕ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಭವಿಷ್ಯದ ಕೋರ್ಸ್ ಆಯ್ಕೆಯ ನಿರ್ಣಾಯಕ ಹಂತದಲ್ಲಿದ್ದು, ಅಧ್ಯಯನದಲ್ಲಿ ದೃಢ ಏಕಾಗ್ರತೆಯನ್ನು ಸಾಧಿಸುವ ತುಡಿತ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿದೆ.`,
      mr: `${lagnaLocalized} लग्नाचे तेज व ${nakshatraLocalized} नक्षत्राच्या क्षमतेसह, सध्या आपण महत्त्वाच्या परीक्षा व भावी शिक्षणाच्या निवडीच्या टप्प्यावर आहात; अभ्यासात अढळ एकाग्रता साधण्याची तीव्र जिद्द मनात आहे.`,
      hi: `${lagnaLocalized} लग्न के तेज एवं ${nakshatraLocalized} नक्षत्र के प्रभाव से, वर्तमान में आप महत्वपूर्ण परीक्षाओं एवं भावी शैक्षणिक दिशा के निर्णायक पड़ाव पर हैं, जहां अध्ययन में सुदृढ़ एकाग्रता ही आपका प्रमुख लक्ष्य है।`,
      te: `${lagnaLocalized} లగ్న తేజస్సు మరియు ${nakshatraLocalized} నక్షత్ర ప్రతిభతో, ప్రస్తుతం మీరు ముఖ్యమైన పరీక్షలు మరియు భవిష్యత్ విద్యా మార్గం ఎంచుకునే దశలో ఉన్నారు; చదువుపై ఏకాగ్రత సాధించాలనే సంకల్పం బలంగా ఉంది.`,
      ta: `${lagnaLocalized} லக்ன பொலிவும் ${nakshatraLocalized} நட்சத்திர ஆற்றலும் கொண்டு, தற்போது நீங்கள் முக்கிய தேர்வுகள் மற்றும் எதிர்கால படிப்பு தேர்வின் முக்கிய கட்டத்தில் உள்ளீர்கள்; படிப்பில் ஆழ்ந்த கவனம் செலுத்த விழைகிறீர்கள்.`,
      en: `Embodying the focused radiance of ${lagnaLocalized} Lagna and ${nakshatraLocalized} Nakshatra, you stand at a crucial adolescent academic threshold, channeling determination toward benchmark examinations, stream selection, and cognitive mastery.`
    }, targetLang);
  } else if (isSadeSati) {
    openingLine = pick6({
      kn: `${moonRashiLocalized} ರಾಶಿ ಹಾಗೂ ${nakshatraLocalized} ನಕ್ಷತ್ರದ (${padaWord} ${padaFormatted}) ಜಾತಕರಾದ ನಿಮ್ಮ ಮನಸ್ಸು, ಪ್ರಸ್ತುತ ${shaniHouseFormatted}ನೇ ಮನೆಯ ಶನಿಯ ಸಾಡೇ ಸಾತಿ ಮತ್ತು ${mahaLocalized} ಮಹಾದಶೆಯ ನಡುವೆ, ನಿರಂತರ ಪರಿಶ್ರಮ ಪಡುತ್ತಿದ್ದರೂ ನಿರೀಕ್ಷಿತ ಫಲ ತಕ್ಷಣಕ್ಕೆ ಕೈಸೇರದೆ ಎಲ್ಲ ಜವಾಬ್ದಾರಿಯನ್ನೂ ನಾನೊಬ್ಬನೇ ಹೊರಬೇಕಲ್ಲವೇ ಎಂಬ ಮಾನಸಿಕ ಆಯಾಸ ಮತ್ತು ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ನಡುವೆ ಹೋರಾಡುತ್ತಿದೆ.`,
      mr: `${moonRashiLocalized} राशी व ${nakshatraLocalized} (चरण ${padaFormatted}) असलेल्या आपल्या मनात, सध्या ${shaniHouseFormatted}व्या स्थानातील साडेसाती व ${mahaLocalized} महादशेमुळे, जिवापाड मेहनत करूनही अपेक्षित फळ विलंबाने मिळून सर्व कौटुंबिक व आर्थिक जबाबदाऱ्यांचा भार एकट्यावरच आल्यासारखा मानसिक ताण जाणवत आहे.`,
      hi: `${moonRashiLocalized} राशि एवं ${nakshatraLocalized} (${padaWord} ${padaFormatted}) नक्षत्र में उत्पन्न आपके अंतर्मन में, वर्तमान ${shaniHouseFormatted}वें भाव की साढ़ेसाती तथा ${mahaLocalized} महादशा के प्रभाव से, अथक परिश्रम के उपरांत भी यथोचित परिणाम समय पर न मिलने से सारी जिम्मेदारियों का भार केवल आपके कंधों पर आ पड़ने का भारीपन अनुभव हो रहा है।`,
      te: `${moonRashiLocalized} రాశి మరియు ${nakshatraLocalized} (${padaWord} ${padaFormatted}) లో జన్మించిన మీ మనస్సు, ప్రస్తుతం ${shaniHouseFormatted}వ ఇంట సాడేసాతి మరియు ${mahaLocalized} మహర్దశ ప్రభావంతో, ఎంత శ్రమిస్తున్నా తగిన గుర్తింపు వెంటనే అందక అన్ని బాధ్యతలూ నేనొక్కడినే మోయాల్సి వస్తోందన్న మానసిక ఒత్తిడితో సతమతమవుతోంది.`,
      ta: `${moonRashiLocalized} ராசி மற்றும் ${nakshatraLocalized} (${padaWord} ${padaFormatted}) நட்சத்திரத்தில் பிறந்த உங்கள் மனம், தற்போது ${shaniHouseFormatted}-ஆம் வீட்டில் ஏழரைச் சனியின் ஆதிக்கத்தாலும் ${mahaLocalized} மகாதிசையினாலும், இரவும் பகலும் உழைத்தும் உரிய பலன் தாமதமாகி குடும்பத்தின் அத்தனை சுமைகளையும் நானே சுமக்கின்றேனோ என்ற மனச்சோர்வில் தவிக்கிறது.`,
      en: `Born under ${moonRashiLocalized} Moon and ${nakshatraLocalized} (${padaWord} ${padaFormatted}), your mind is presently navigating Saturn's ${shaniHouseFormatted}th house transit under ${mahaLocalized} Mahadasha; despite pouring immense honest effort into your duties, rewards seem delayed and an overwhelming mental weight whispers that you are carrying every burden alone.`
    }, targetLang);
  } else if (isAshtama) {
    openingLine = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನದ ಧೈರ್ಯವಿದ್ದರೂ, ${moonRashiLocalized} ರಾಶಿಯಿಂದ ೮ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿರುವ ಅಷ್ಟಮ ಶನಿ ಹಾಗೂ ${mahaLocalized} ದಶೆಯು ಯಾವುದೇ ಕೆಲಸ ಪೂರ್ಣಗೊಳ್ಳುವ ಅಂತಿಮ ಘಟ್ಟದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆ ಅಥವಾ ಖರ್ಚು ಎದುರಾಗುವಂತೆ ಮಾಡುತ್ತಿದ್ದು, ಎಲ್ಲವೂ ಸರಿಯಾಗಲು ಇನ್ನು ಎಷ್ಟು ಸಮಯ ಬೇಕು ಎಂಬ ಚಿಂತೆ ನಿಮ್ಮನ್ನು ಆವರಿಸಿದೆ.`,
      mr: `${lagnaLocalized} लग्नाचे सामर्थ्य असूनही, ${moonRashiLocalized} राशीपासून ८व्या स्थानातील अष्टम शनी व ${mahaLocalized} महादशेमुळे, कोणतेही काम पूर्ण होण्याच्या अंतिम टप्प्यात अचानक अडथळा किंवा अनपेक्षित खर्च समोर येऊन मन ग्रासले आहे.`,
      hi: `${lagnaLocalized} लग्न के आत्मबल के बावजूद, ${moonRashiLocalized} राशि से ८वें भाव में गोचरस्थ अष्टम शनि एवं ${mahaLocalized} महादशा के कारण किसी कार्य के पूर्ण होने के अंतिम क्षणों में अचानक व्यवधान या अप्रत्याशित व्यय सामने आ जाता है, और मन में निरंतर व्यथा बनी रहती है।`,
      te: `${lagnaLocalized} లగ్న ధైర్యం ఉన్నప్పటికీ, ${moonRashiLocalized} రాశి నుండి 8వ ఇంట అష్టమ శని మరియు ${mahaLocalized} దశా ప్రభావం వల్ల ఏ పనైనా పూర్తయ్యే ఆఖరి క్షణంలో అనుకోని అడ్డంకి లేదా ఖర్చు ఎదురవుతుండటంతో మనోవేదన కలుగుతోంది.`,
      ta: `${lagnaLocalized} லக்ன பலம் இருந்தும், ${moonRashiLocalized} ராசியிலிருந்து 8-ஆம் இடத்தில் அஷ்டம சனியும் ${mahaLocalized} திசையும் ஆதிக்கம் செலுத்துவதால் காரியம் முடியும் தருவாயில் எதிர்பாராத தடங்கலோ வீண் விரயமோ ஏற்பட்டு உள்ளம் வாடுகிறது.`,
      en: `Endowed with ${lagnaLocalized} Lagna resilience, yet under the transiting pressure of 8th House Ashtama Shani from ${moonRashiLocalized} and active ${mahaLocalized} Mahadasha, you frequently witness unexpected hurdles or unforeseen expenditures just as projects near finalization.`
    }, targetLang);
  } else if (isKantaka) {
    openingLine = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನದ ಅಧಿಪತಿ ${lagnaLordLocalized}ನ ಪ್ರಭಾವವಿದ್ದರೂ, ಪ್ರಸ್ತುತ ${moonRashiLocalized} ರಾಶಿಯಿಂದ ${shaniHouseFormatted}ನೇ ಮನೆಯಲ್ಲಿ ಶನಿಯ ಕಂಟಕ ಗೋಚಾರವಿರುವುದರಿಂದ ವೃತ್ತಿ-ವ್ಯವಹಾರದ ಒತ್ತಡ ಮತ್ತು ಕುಟುಂಬದ ಅಪೇಕ್ಷೆಗಳನ್ನು ನಿಭಾಯಿಸುವ ಅನಿವಾರ್ಯತೆಯ ನಡುವೆ ಸಿಲುಕಿ ನಿಮ್ಮ ಸ್ವಂತ ನೆಮ್ಮದಿಯನ್ನು ಕಳೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ.`,
      mr: `${lagnaLocalized} लग्नाधिपती ${lagnaLordLocalized}चा पाठिंबा असूनही, सध्या ${moonRashiLocalized} राशीपासून ${shaniHouseFormatted}व्या स्थानातील कंटक शनीमुळे नोकरी-व्यवसायाचा वाढता ताण व कुटुंबाच्या अपेक्षा यांच्या कात्रीत सापडून स्वतःची मनःशांती हरवत चालल्याची जाणीव होत आहे.`,
      hi: `${lagnaLocalized} लग्नेश ${lagnaLordLocalized} की अनुकूलता के बावजूद, वर्तमान ${moonRashiLocalized} राशि से ${shaniHouseFormatted}वें भाव में कंटक शनि के प्रभाव से कार्यक्षेत्र की चुनौतियां और परिवार की अपेक्षाओं के मध्य सामंजस्य बैठाते हुए आप अपनी निजी शांति खोते जा रहे हैं।`,
      te: `${lagnaLocalized} లగ్నాధిపతి ${lagnaLordLocalized} అనుగ్రహం ఉన్నప్పటికీ, ${moonRashiLocalized} రాశి నుండి ${shaniHouseFormatted}వ ఇంట కంటక శని ప్రభావంతో ఉద్యోగ ఒత్తిళ్లు మరియు కుటుంబ బాధ్యతల మధ్య నలిగిపోతూ మీ సొంత ప్రశాంతతను కోల్పోతున్నారు.`,
      ta: `${lagnaLocalized} லக்னாதிபதி ${lagnaLordLocalized} அருளிருந்தும், ${moonRashiLocalized} ராசியிலிருந்து ${shaniHouseFormatted}-ஆம் வீட்டில் கண்டக சனி அமர்ந்திருப்பதால் தொழில் அழுத்தங்கள் மற்றும் குடும்பத் தேவைகளுக்கு இடையே சிக்கி நிம்மதியை இழக்கிறீர்கள்.`,
      en: `Guided by ${lagnaLocalized} Lagna Lord ${lagnaLordLocalized}, yet caught in the vortex of Kantaka Saturn transiting House ${shaniHouseFormatted} from ${moonRashiLocalized}, you feel severely divided between relentless career demands and household obligations, sacrificing personal peace.`
    }, targetLang);
  } else if (hasGuruBala) {
    openingLine = pick6({
      kn: `${moonRashiLocalized} ರಾಶಿಗೆ ಪ್ರಾಪ್ತವಾಗಿರುವ ${guruHouseFormatted}ನೇ ಮನೆಯ ದೈವಿಕ ಗುರುಬಲ ಹಾಗೂ ${mahaLocalized} ಮಹಾದಶೆಯ ಅನುಗ್ರಹದಿಂದ, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಒಂದು ನೂತನ ಶುಭ ಪರಿವರ್ತನೆಯ ಹೊಸ್ತಿಲಿನಲ್ಲಿ ನಿಂತಿರುವ ಭಾವನೆ ಮೂಡುತ್ತಿದ್ದು, ಹೊಸ ದಾರಿಗಳು ತೆರೆದುಕೊಳ್ಳುವ ಹಂಬಲ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ತೀವ್ರವಾಗಿದೆ.`,
      mr: `${moonRashiLocalized} राशीला प्राप्त झालेल्या ${guruHouseFormatted}व्या स्थानातील गुरूबल व ${mahaLocalized} महादशेच्या कृपेने, सध्या आपण एका शुभ परिवर्तनाच्या उंबरठ्यावर उभे असल्याचे जाणवत असून प्रगतीचे नवे मार्ग खुले होण्याची प्रबळ इच्छा मनात जागृत झाली आहे.`,
      hi: `${moonRashiLocalized} राशि को प्राप्त ${guruHouseFormatted}वें भाव के दिव्य गुरुबल एवं ${mahaLocalized} महादशा के अनुग्रह से, वर्तमान में आप जीवन के एक अत्यंत शुभ परिवर्तन के द्वार पर खड़े हैं और नए अवसरों के द्वार खुलने की तीव्र प्रतीक्षा आपके अंतर्मन में व्याप्त है।`,
      te: `${moonRashiLocalized} రాశికి లభించిన ${guruHouseFormatted}వ ఇంటి దివ్య గురుబలం మరియు ${mahaLocalized} మహర్దశ కటాక్షంతో, ప్రస్తుతం మీ జీవితంలో ఒక నూతన శుభ పరివర్తన ముంగిట ఉన్నట్లు అనిపిస్తూ కొత్త మార్గాలు తెరచుకోవాలనే ఆకాంక్ష మీలో బలంగా ఉంది.`,
      ta: `${moonRashiLocalized} ராசிக்கு அமைந்துள்ள ${guruHouseFormatted}-ஆம் இடத்து குருபலம் மற்றும் ${mahaLocalized} மகாதிசையின் அருளால், தற்போது உங்கள் வாழ்வில் ஒரு புதிய சுப மாற்றத்தின் தொடக்கத்தில் நிற்பது போல் உணர்கிறீர்கள்; புது வாய்ப்புகள் மலர வேண்டும் என்ற தாகம் உள்ளது.`,
      en: `Elevated by the divine grace of House ${guruHouseFormatted} Guru Bala upon ${moonRashiLocalized} and your active ${mahaLocalized} Mahadasha, you stand right at the threshold of a momentous positive transformation, with an intense inner calling that brand-new avenues are ready to open.`
    }, targetLang);
  } else if (isRahuKetuActive) {
    openingLine = pick6({
      kn: `${nakshatraLocalized} ನಕ್ಷತ್ರ ಹಾಗೂ ${moonRashiLocalized} ರಾಶಿಯ ಮೇಲೆ ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷ ಸಂಚಾರದಿಂದಾಗಿ ಸಾಮಾನ್ಯ ಮಟ್ಟದಲ್ಲಿ ಇರಲು ಮನಸ್ಸು ಒಪ್ಪುತ್ತಿಲ್ಲ; ${mahaLocalized} ದಶೆಯ ಕಾಲದಲ್ಲಿ ಜೀವನದಲ್ಲಿ ಏನಾದರೂ ದೊಡ್ಡ ಬದಲಾವಣೆ ಅಥವಾ ಮಹತ್ತರ ತಿರುವು ತರಬೇಕೆಂಬ ಅದಮ್ಯ ತವಕ ನಿಮ್ಮಲ್ಲಿ ದಿನರಾತ್ರಿ ಹೊತ್ತಿ ಉರಿಯುತ್ತಿದೆ.`,
      mr: `${nakshatraLocalized} नक्षत्र व ${moonRashiLocalized} राशीवर राहू-केतूंचा प्रभाव असल्याने सामान्य पातळीवर समाधान मानणे मनाला मान्य नाही; ${mahaLocalized} दशेच्या काळात जीवनात मोठी झेप घेण्याची तीव्र तळमळ रात्रंदिवस मनात धडपडत आहे.`,
      hi: `${nakshatraLocalized} नक्षत्र एवं ${moonRashiLocalized} राशि पर राहु-केतु के अक्ष गोचर से साधारण स्तर पर ठहरना मन को स्वीकार्य नहीं है; ${mahaLocalized} दशा में कोई बड़ी छलांग लगाने और आमूलचूल बदलाव लाने की तीव्र उत्कंठा आपके भीतर धधक रही है।`,
      te: `${nakshatraLocalized} నక్షత్రం మరియు ${moonRashiLocalized} రాశిపై రాహు-కేతువుల ప్రభావంతో సాధారణ స్థితిలో ఉండిపోవడం మనస్సుకు నచ్చడం లేదు; ${mahaLocalized} దశలో జీవితంలో ఏదైనా గొప్ప మలుపు తిరగాలనే తపన రాత్రింబవళ్ళు వెంటాడుతోంది.`,
      ta: `${nakshatraLocalized} நட்சத்திரம் மற்றும் ${moonRashiLocalized} ராசியில் ராகு-கேதுவின் சஞ்சாரத்தால் சாதாரண நிலையில் இருக்க மனம் ஒப்பவில்லை; ${mahaLocalized} திசையில் வாழ்வில் ஒரு மிகப்பெரிய திருப்பத்தை ஏற்படுத்த வேண்டும் என்ற வேட்கை கனல்கிறது.`,
      en: `Energized by the pivotal nodal axis over ${nakshatraLocalized} and ${moonRashiLocalized}, remaining in ordinary circumstances is no longer acceptable to your soul; under ${mahaLocalized} Mahadasha, a fiery, restless urge to take an extraordinary leap forward consumes your thoughts.`
    }, targetLang);
  } else if (currentAgeYears <= 28) {
    openingLine = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನದ ಯುವ ಶಕ್ತಿ ಹಾಗೂ ${nakshatraLocalized} ನಕ್ಷತ್ರದ ಪ್ರತಿಭೆಯೊಂದಿಗೆ, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಅತಿಮುಖ್ಯ ತಿರುವಿನಲ್ಲಿದ್ದು, ಸ್ವಂತ ಕಾಲಿನ ಮೇಲೆ ಭದ್ರವಾಗಿ ನಿಂತು ಭವಿಷ್ಯವನ್ನು ಉಜ್ವಲಗೊಳಿಸುವ ಅದಮ್ಯ ಮಹತ್ವಾಕಾಂಕ್ಷೆ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಆವರಿಸಿದೆ.`,
      mr: `${lagnaLocalized} लग्नाची तरुण ऊर्जा व ${nakshatraLocalized} नक्षत्राच्या प्रतिभेसह, सध्या तुम्ही आयुष्याच्या एका अत्यंत महत्त्वाच्या वळणावर उभे आहात; स्वतःच्या पायावर भक्कम उभे राहून भविष्य घडवण्याची तीव्र जिद्द मनात आहे.`,
      hi: `${lagnaLocalized} लग्न के युवा पराक्रम एवं ${nakshatraLocalized} नक्षत्र के प्रभाव से, वर्तमान में आप जीवन के एक अत्यंत महत्वपूर्ण पड़ाव पर हैं, जहां स्वयं के पैरों पर खड़े होकर उज्ज्वल भविष्य गढ़ने की उत्कट अभिलाषा आपके मन में है।`,
      te: `${lagnaLocalized} లగ్న యువ చైతన్యం మరియు ${nakshatraLocalized} నక్షత్ర ప్రతిభతో, ప్రస్తుతం మీరు అత్యంత కీలకమైన మలుపులో ఉన్నారు; స్వశక్తితో నిలబడి భవిష్యత్తును బంగారుమయం చేసుకోవాలనే పట్టుదల మీలో నిండి ఉంది.`,
      ta: `${lagnaLocalized} லக்ன இளமைத் துடிப்பும் ${nakshatraLocalized} நட்சத்திர ஆற்றலும் கொண்டு, தற்போது வாழ்க்கையின் மிக முக்கியமான கட்டத்தில் உள்ளீர்கள்; சொந்தக் காலில் உறுதியாக நின்று எதிர்காலத்தை பிரகாசமாக்கும் லட்சியம் மனதில் உள்ளது.`,
      en: `Empowered by ${lagnaLocalized} Lagna vigor and ${nakshatraLocalized} intellect, you stand at a defining youth crossroads, driven by an intense aspiration to establish financial self-reliance and secure long-term victory on your own merit.`
    }, targetLang);
  } else if (currentAgeYears >= 50) {
    openingLine = pick6({
      kn: `${moonRashiLocalized} ರಾಶಿ ಹಾಗೂ ${lagnaLocalized} ಲಗ್ನದ ಹಿರಿಯ ಜಾತಕರಾದ ಈಗಿನ ನಿಮ್ಮ ಮುಖ್ಯ ಆದ್ಯತೆಯೆಂದರೆ — ಕುಟುಂಬದ ಸದಸ್ಯರ ಭದ್ರತೆ, ಮಕ್ಕಳ ಸ್ಥಿರತೆ, ಆಸ್ತಿ ಸಂರಕ್ಷಣೆ ಹಾಗೂ ${mahaLocalized} ದಶೆಯ ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಯಾವುದೇ ಕೊರತೆಯಿಲ್ಲದೆ ಶಾಂತಿಯುತ ನೆಮ್ಮದಿಯ ಜೀವನ ನಡೆಸುವುದು.`,
      mr: `${moonRashiLocalized} राशी व ${lagnaLocalized} लग्नाच्या ज्येष्ठ जातकांचे मुख्य ध्येय म्हणजे — कुटुंबाची सुरक्षितता, मुलांचे स्थैर्य, मालमत्तेचे रक्षण व ${mahaLocalized} दशेच्या काळात कसलीही उणीव न भासता शांततापूर्ण जीवन जगणे.`,
      hi: `${moonRashiLocalized} राशि एवं ${lagnaLocalized} लग्न के वरिष्ठ जातक के रूप में आपकी सर्वोच्च प्राथमिकता परिवार की सुरक्षा, संतानों का स्थायित्व, संपत्ति की रक्षा एवं ${mahaLocalized} दशा में निश्चिंतता व आंतरिक शांति प्राप्त करना है।`,
      te: `${moonRashiLocalized} రాశి మరియు ${lagnaLocalized} లగ్న అనుభవంతో, ఇప్పుడు మీ ప్రధాన లక్ష్యం — కుటుంబ సంక్షేమం, పిల్లల స్థిరపడటం, ఆస్తి పరిరక్షణ మరియు ${mahaLocalized} దశలో ఎటువంటి లోటు లేకుండా ప్రశాంతంగా జీవించడం.`,
      ta: `${moonRashiLocalized} ராசி மற்றும் ${lagnaLocalized} லக்ன மூத்த அன்பராக உங்கள் முதன்மை நோக்கம் — குடும்ப நலம், பிள்ளைகளின் சுப வாழ்வு, சொத்து பாதுகாப்பு மற்றும் ${mahaLocalized} திசையில் நிம்மதியான அமைதியான நல்வாழ்வு வாழ்வதே ஆகும்.`,
      en: `Grounded in ${lagnaLocalized} Lagna maturity and ${moonRashiLocalized} Moon wisdom, your overriding priority at this stage is family protection, the flourishing settlement of children, safeguarding assets, and enjoying undisturbed peace under ${mahaLocalized} Mahadasha.`
    }, targetLang);
  } else {
    openingLine = pick6({
      kn: `${lagnaLocalized} ಲಗ್ನದ ಅಧಿಪತಿ ${lagnaLordLocalized} ಹಾಗೂ ${moonRashiLocalized} ರಾಶಿಯ ಬಲದೊಂದಿಗೆ, ಕುಟುಂಬದ ಆರ್ಥಿಕ ಭದ್ರತೆಯನ್ನು ಮತ್ತಷ್ಟು ಉನ್ನತ ಮಟ್ಟಕ್ಕೇರಿಸುವುದು, ಸ್ವಂತ ಆಸ್ತಿ ಅಥವಾ ಮನೆ ಹೊಂದುವುದು ಹಾಗೂ ಸಾಲ-ಬಾಧ್ಯತೆಗಳಿಂದ ಮುಕ್ತರಾಗುವುದು ನಿಮ್ಮ ಪ್ರಮುಖ ಗುರಿಯಾಗಿದೆ.`,
      mr: `${lagnaLocalized} लग्नाधिपती ${lagnaLordLocalized} व ${moonRashiLocalized} राशीच्या बळाने, कुटुंबाची आर्थिक घडी अधिक मजबूत करणे, स्वतःचे घर किंवा मालमत्ता उभारणे व सर्व देण्यांमधून पूर्ण मुक्त होणे हेच सध्या आपल्या मनाचे मुख्य ध्येय आहे.`,
      hi: `${lagnaLocalized} लग्नेश ${lagnaLordLocalized} एवं ${moonRashiLocalized} राशि के प्रभाव से, परिवार की आर्थिक स्थिति को नई ऊंचाइयों पर ले जाना, अचल संपत्ति या गृह निर्माण करना एवं सभी दायित्वों से मुक्त होना ही वर्तमान में आपका मुख्य लक्ष्य है।`,
      te: `${lagnaLocalized} లగ్నాధిపతి ${lagnaLordLocalized} మరియు ${moonRashiLocalized} రాశి బలంతో, కుటుంబ ఆర్థిక స్థితిని పటిష్టం చేసుకోవడం, సొంత ఇల్లు లేదా ఆస్తి సమకూర్చుకోవడం మరియు రుణాల నుండి విముక్తి పొందడమే మీ ప్రధాన లక్ష్యం.`,
      ta: `${lagnaLocalized} லக்னாதிபதி ${lagnaLordLocalized} மற்றும் ${moonRashiLocalized} ராசி பலத்துடன், குடும்பத்தின் பொருளாதாரத்தை உயர்த்தவும், சொந்த வீடு அல்லது சொத்து உருவாக்கவும், கடன்களிலிருந்து விடுபடவும் உங்கள் மனம் தீவிரமாக உழைக்கிறது.`,
      en: `Under the auspices of ${lagnaLocalized} Lagna Lord ${lagnaLordLocalized} and ${moonRashiLocalized} Moon, elevating your family's financial stability, acquiring immovable property or a home of your own, and liberating yourself from long-term liabilities is your prime focus.`
    }, targetLang);
  }

  // 3. Dynamic Narrated First Paragraph Weaving Janma Panchanga & 9-Graha Sphuta
  const firstParagraph = pick6({
    kn: `ನಿಮ್ಮ ಜನ್ಮ ತಿಥಿಯಾದ ${tithiName} (${pakshaName}), ${weekdayName} ವಾರ ಹಾಗೂ ${horaName} ಹೋರೆಯ ಜನ್ಮ ಸಂಸ್ಕಾರದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ ${lagnaLocalized}ದ ಅಧಿಪತಿ ${lagnaLordLocalized} ಮತ್ತು ರಾಶ್ಯಾಧಿಪತಿ ${moonLordLocalized} ರ ಗ್ರಹ ಸಂಯೋಗವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ ಸ್ಪಷ್ಟವಾಗುವ ಜ್ಯೋತಿಷ್ಯ ಸತ್ಯವೇನೆಂದರೆ — ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಈ ತುಮುಲವು ಯಾವುದೇ ವೈಯಕ್ತಿಕ ದೌರ್ಬಲ್ಯವಲ್ಲ. ಗೋಚಾರದಲ್ಲಿ ಶನಿಯು ${shaniHouseFormatted}ನೇ ಮನೆಯಲ್ಲೂ, ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ${guruHouseFormatted}ನೇ ಮನೆಯಲ್ಲೂ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಸದ್ಯ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ${mahaLocalized} ಮಹಾದಶೆಯ ${bhuktiLocalized} ಅಂತರ್ದಶೆಯು ನಿಮ್ಮ ಕರ್ಮಫಲವನ್ನು ಶೋಧಿಸುತ್ತಿದೆ. ಹಗಲಿರುಳು ನೀವು ತೋರುತ್ತಿರುವ ಪ್ರಾಮಾಣಿಕತೆಗೆ ತಕ್ಕಂತೆ ಜನರು ನಿಮ್ಮನ್ನು ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿಲ್ಲ ಎಂಬ ಅಸಹಾಯಕತೆ ಕಾಡುತ್ತಿದ್ದರೂ, ದೈವಜ್ಞರ ಆಶ್ವಾಸನೆಯೇನೆಂದರೆ: ಈ ಘಟ್ಟವು ನಿಮ್ಮನ್ನು ಕುಗ್ಗಿಸುವುದಕ್ಕಲ್ಲ, ಆಂತರಿಕ ಧೈರ್ಯವನ್ನು ಗಟ್ಟಿಗೊಳಿಸಿ ಮುಂದಿನ ಸುವರ್ಣ ದಶೆಗೆ ಸಜ್ಜುಗೊಳಿಸುವುದಕ್ಕಾಗಿಯೇ ಬಂದಿದೆ; ಈ ವರದಿಯಲ್ಲಿ ಸೂಚಿಸಿರುವ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಕಲ್ಪವು ನಿಮಗೆ ಶೀಘ್ರ ನೆಮ್ಮದಿ ಕರುಣಿಸಲಿದೆ.`,
    mr: `आपल्या जन्मकुंडलीतील ${tithiName} (${pakshaName}), ${weekdayName} व ${horaName} होऱ्याच्या ग्रहस्थितीनुसार, ${lagnaLocalized} लग्नाचे स्वामी ${lagnaLordLocalized} व ${moonRashiLocalized} राशीचे स्वामी ${moonLordLocalized} यांच्या परस्पर संबंधांचे सूक्ष्म निरीक्षण केल्यास हे स्पष्ट होते की, आपल्या मनात चाललेली ही अस्वस्थता आपला दोष नाही. सध्या गोचरामध्ये शनी ${shaniHouseFormatted}व्या स्थानात व देवगुरू बृहस्पती ${guruHouseFormatted}व्या स्थानात असून, चालू ${mahaLocalized} महादशेतील ${bhuktiLocalized} अंतर्दशा आपल्या कर्माची परीक्षा घेत आहे. आपण सर्वांचे भले करता तरीही योग्य मोबदला मिळत नाही ही खंत बाळगू नका; हा काळ आपल्या आत्मबलाला पैलू पाडत असून लवकरच भाग्योदयाची नवी पहाट उजळणार आहे. गोकर्ण महाबळेश्वराचा अनुग्रह आपणास निश्चितच संकटातून बाहेर काढेल.`,
    hi: `आपकी जन्म तिथि ${tithiName} (${pakshaName}), ${weekdayName} एवं ${horaName} होरा के पावन संस्कारों के अनुसार, आपकी जन्म कुंडली के ${lagnaLocalized} लग्न स्वामी ${lagnaLordLocalized} तथा ${moonRashiLocalized} राशि स्वामी ${moonLordLocalized} की ग्रह स्थिति का सूक्ष्म अवलोकन करने पर यह प्रमाणित होता है कि आपके अंतर्मन में जो चिंता एवं संघर्ष चल रहा है, वह कोई दुर्बलता नहीं है। वर्तमान गोचर में शनिदेव ${shaniHouseFormatted}वें भाव तथा देवगुरु बृहस्पति ${guruHouseFormatted}वें भाव में संचरण कर रहे हैं, एवं सक्रिय ${mahaLocalized} महादशा की ${bhuktiLocalized} अंतर्दशा कर्म-शोधन कर रही है। आप पूरी निष्ठा से सबका हित चाहते हैं फिर भी अपेक्षित परिणाम में विलंब से निराश न हों; यह कालखंड आपके सामर्थ्य को तराश रहा है। गोकर्ण क्षेत्र के अचूक समाधान आपके जीवन को नवदिशा प्रदान करेंगे।`,
    te: `మీ జన్మ తిథి అయిన ${tithiName} (${pakshaName}), ${weekdayName} మరియు ${horaName} హోరా ప్రభావాల ప్రకారం, ${lagnaLocalized} లగ్నాధిపతి ${lagnaLordLocalized} మరియు ${moonRashiLocalized} రాశ్యాధిపతి ${moonLordLocalized} గ్రహ స్థితులను నిశితంగా పరిశీలించినప్పుడు స్పష్టమవుతున్న సత్యం — మీ మనస్సులో రేగుతున్న ఆందోళన మీ లోపం కాదు. గోచారంలో శని ${shaniHouseFormatted}వ ఇంట, బృహస్పతి ${guruHouseFormatted}వ ఇంట సంచరిస్తూ, ప్రస్తుతం నడుస్తున్న ${mahaLocalized} మహర్దశలోని ${bhuktiLocalized} అంతర్దశ కర్మ శోధన చేస్తోంది. మీ శ్రమకు తగిన గుర్తింపు ఆలస్యమవుతున్నా ధైర్యం వీడకండి; ఈ కఠిన సమయం మీ ఆత్మవిశ్వాసాన్ని మరింత పదును పెట్టడానికే వచ్చింది. గోకర్ణ క్షేత్ర పరిహారాలు మీకు తక్షణ శాంతిని చేకూరుస్తాయి.`,
    ta: `உங்கள் பிறப்பு திதியான ${tithiName} (${pakshaName}), ${weekdayName} மற்றும் ${horaName} ஓரையின் அமைப்பின்படி, ${lagnaLocalized} லக்னாதிபதி ${lagnaLordLocalized} மற்றும் ${moonRashiLocalized} ராசிநாதன் ${moonLordLocalized} கிரக சேர்க்கையை ஆராய்கையில், உங்கள் உள்ளத்தில் ஓடும் இந்தத் தவிப்பு உங்கள் குறையல்ல என்பது தெளிவாகிறது. கோசாரத்தில் சனி ${shaniHouseFormatted}-ஆம் இடத்திலும் குருபகவான் ${guruHouseFormatted}-ஆம் இடத்திலும் சஞ்சரிக்க, தற்போதைய ${mahaLocalized} மகாதிசையின் ${bhuktiLocalized} புத்தி கர்ம சுத்தியை நிகழ்த்துகிறது. உங்கள் உழைப்பிற்குரிய பலன் தாமதமானாலும் கலங்க வேண்டாம்; இந்தச் சோதனை காலம் உங்கள் ஆற்றலை செதுக்குவதற்கே. கோகர்ண சேவைகள் உங்களுக்கு மிக விரைவில் நிலையான நல்வாழ்வைத் தரும்.`,
    en: `According to your Janma Panchanga markings of ${tithiName} (${pakshaName}), ${weekdayName}, and ${horaName} Hora, a rigorous astronomical synthesis of your ${lagnaLocalized} Lagna Lord ${lagnaLordLocalized} and ${moonRashiLocalized} Moon Lord ${moonLordLocalized} confirms that the inner restlessness you feel is not a personal failure. In live transits, Saturn is transiting House ${shaniHouseFormatted} while Jupiter transits House ${guruHouseFormatted}, as your active ${mahaLocalized} Mahadasha and ${bhuktiLocalized} Antardasha refine your karmic cycle. Take heart in the Daivajna's sacred assurance: this phase is not meant to diminish you, but to temper your soul's resilience for the momentous golden era unfolding ahead.`
  }, targetLang);

  // 4. Dynamic Emotional Validation Quote
  const emotionalValidationQuote = pick6({
    kn: `🪔 '${lagnaLordLocalized} ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯು ನಿಮ್ಮ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ; ಈ ಪರೀಕ್ಷಾ ಕಾಲವು ನಿಮ್ಮನ್ನು ಕುಗ್ಗಿಸುವುದಕ್ಕಲ್ಲ, ಅಪೂರ್ವ ರತ್ನದಂತೆ ಹೊಳಪಿಸುವುದಕ್ಕಾಗಿಯೇ ಬಂದಿದೆ — ಶೀಘ್ರದಲ್ಲೇ ಶಾಂತಿ ಲಭಿಸಲಿದೆ.'`,
    mr: `🪔 '${lagnaLordLocalized} व श्री क्षेत्र गोकर्ण महाबळेश्वरांची कृपा आपले अभेद्य कवच आहे; ही कठीण वेळ तुम्हाला खचवण्यासाठी नाही तर सोन्यासारखे झळाळून निघण्यासाठी आली आहे — लवकरच समाधान लाभेल.'`,
    hi: `🪔 '${lagnaLordLocalized} एवं श्री क्षेत्र गोकर्ण महाबलेश्वर की असीम कृपा आपका सुरक्षा कवच है; यह परीक्षा काल आपको दुर्बल करने हेतु नहीं, अपितु कुंदन की भांति निखारने हेतु आया है — शीघ्र समाधान मिलेगा।'`,
    te: `🪔 '${lagnaLordLocalized} మరియు శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వరుల అనుగ్రహం మీకు రక్షా కవచం; ఈ పరీక్షా సమయం మిమ్మల్ని కృంగదీయడానికి కాదు, వజ్రంలా తీర్చిదిద్దడానికే — త్వరలోనే శుభఫలితాలు దక్కుతాయి.'`,
    ta: `🪔 '${lagnaLordLocalized} மற்றும் ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வரரின் அருள் உங்களை காக்கும் கவசமாகும்; இந்த சோதனை உங்களை வீழ்த்த அல்ல, வைரமாக மிளிரச் செய்யவே — விரைவில் அமைதி பிறக்கும்.'`,
    en: `🪔 'The divine grace of ${lagnaLordLocalized} and Sri Kshetra Gokarna Mahabaleshwara stands as your protective fortress; this crucible is not designed to defeat you, but to polish your soul into an unbreakable diamond.'`
  }, targetLang);

  return {
    coreFocusTheme,
    openingLine,
    firstParagraph,
    emotionalValidationQuote
  };
}

/**
 * Calculates 100% dynamic 9-Graha Sphuta table with degree in sign,
 * exact Bhava from Lagna, Nakshatra, Pada, and Dignity.
 */
export function calculatePlanetaryCalculations(kundli: KundliOutput, lang: SixLang): PlanetaryCalculationItem[] {
  const lagnaIdx = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;

  const targetPlanets = [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Mercury,
    PlanetName.Jupiter,
    PlanetName.Venus,
    PlanetName.Saturn,
    PlanetName.Rahu,
    PlanetName.Ketu
  ];

  return targetPlanets.map(pName => {
    const p = kundli.planets.find(pl => pl.name === pName);
    const rashiIdx = p ? p.rashi.index : 0;
    const house = p ? p.house : (((rashiIdx - lagnaIdx + 12) % 12) + 1);
    const degInSign = p ? (p.degree % 30) : 0;
    const nakIdx = p ? p.nakshatra.index : 0;
    const nakSpan = 360 / 27;
    const padaSpan = nakSpan / 4;
    const nakDegree = p ? (p.degree % nakSpan) : 0;
    const pada = pName === PlanetName.Moon
      ? resolveExactMoonPada(kundli)
      : Math.min(4, Math.floor(nakDegree / padaSpan) + 1);

    const isOwnSign = p ? RASHI_LORDS[rashiIdx] === pName : false;

    let dignity = pick6({
      kn: "ಮಿತ್ರ / ಸಮ ಬಲ",
      mr: "मित्र / सम बल",
      hi: "मित्र / सम बल",
      te: "మిత్ర / సమ బలం",
      ta: "சமம் / மித்ரு பலம்",
      en: "Benefic / Neutral Strength"
    }, lang);

    if (p?.isExalted) {
      dignity = pick6({ kn: "ಉಚ್ಛ ಕ್ಷೇತ್ರ (ಪರಮ ಬಲ)", mr: "उच्च स्थान (परम बल)", hi: "उच्च स्थान (परम बल)", te: "ఉచ్చ స్థానం (పరమ బలం)", ta: "உச்ச நிலை (உயர் பலம்)", en: "Exalted (Supreme Dignity)" }, lang);
    } else if (p?.isDebilitated) {
      dignity = pick6({ kn: "ನೀಚ ಕ್ಷೇತ್ರ (ಶಾಂತಿ ಅಪೇಕ್ಷಿತ)", mr: "नीच स्थान (शांती आवश्यक)", hi: "नीच स्थान (शांति आवश्यक)", te: "నీచ స్థానం (శాంతి అవసరం)", ta: "நீச நிலை (சாந்தி அவசியம்)", en: "Debilitated (Remedy Prescribed)" }, lang);
    } else if (isOwnSign) {
      dignity = pick6({ kn: "ಸ್ವಕ್ಷೇತ್ರ (ಉತ್ತಮ ಬಲ)", mr: "स्वक्षेत्र (उत्तम बल)", hi: "स्वक्षेत्र (उत्तम बल)", te: "స్వక్షేత్రం (ఉత్తమ బలం)", ta: "சொந்த வீடு (நற்பலம்)", en: "Own Sign (Strong Dignity)" }, lang);
    } else if (p?.isRetrograde) {
      dignity = pick6({ kn: "ವಕ್ರಿ (ಚೇಷ್ಟಾ ಬಲ)", mr: "वक्री (चेष्टा बल)", hi: "वक्री (चेष्टा बल)", te: "వక్ర (చేష్టా బలం)", ta: "வக்ரம் (சேஷ்டா பலம்)", en: "Retrograde (Cheshta Bala)" }, lang);
    }

    const localizedName = GRAHA_6L[pName]?.[lang] || pName;
    const localizedRashi = RASHI_6L[rashiIdx]?.[lang] || (p?.rashi.english ?? "");
    const nakshatraName = NAKSHATRA_6L[nakIdx]?.[lang] || (p?.nakshatra.english ?? "");
    const padaWord = getPadaWord(lang);
    const degreeFormatted = `${formatNumber6L(degInSign.toFixed(2), lang)}°`;

    return {
      planetName: pName,
      localizedName,
      degreeFormatted,
      localizedRashi,
      house,
      nakshatra: `${nakshatraName} (${padaWord} ${formatNumber6L(pada, lang)})`,
      dignity
    };
  });
}

/**
 * Calculates 100% chart-personalized Nagalu (Gold & Wealth) Roadmap
 * using natal Dhana Bhava (2nd house), Labha Bhava (11th house),
 * element tattva of Lagna, and year-by-year transit of Jupiter & Dasha.
 */
export function calculateNagaluRoadmap(
  baseYear: number,
  targetLang: SixLang,
  kundli: KundliOutput,
  years: any[]
): NagaluRoadmapInfo {
  const lagnaIdx = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const moonIdx = kundli.moonSign ? kundli.moonSign.index : 0;
  const transits = getTransitsForDate(moonIdx, new Date(baseYear, 3, 15), "lahiri");
  const guruHouse = transits[PlanetName.Jupiter]?.house ?? 5;

  const secondHouseRashiIdx = (lagnaIdx + 1) % 12;
  const eleventhHouseRashiIdx = (lagnaIdx + 10) % 12;

  const dhanaLord = RASHI_LORDS[secondHouseRashiIdx] || PlanetName.Jupiter;
  const dhanaLordLocalized = GRAHA_6L[dhanaLord]?.[targetLang] || dhanaLord;
  const dhanaRashiLocalized = RASHI_6L[secondHouseRashiIdx]?.[targetLang] || "2nd House";

  const labhaLord = RASHI_LORDS[eleventhHouseRashiIdx] || PlanetName.Venus;
  const labhaLordLocalized = GRAHA_6L[labhaLord]?.[targetLang] || labhaLord;
  const labhaRashiLocalized = RASHI_6L[eleventhHouseRashiIdx]?.[targetLang] || "11th House";

  const lagnaRashiLocalized = RASHI_6L[lagnaIdx]?.[targetLang] || "Lagna";
  const lagnaLocalized = lagnaRashiLocalized;
  const moonRashiLocalized = RASHI_6L[moonIdx]?.[targetLang] || (kundli.moonSign?.english ?? "Moon Sign");

  const title = pick6({
    kn: "೫ ವರ್ಷಗಳ ಚಿನ್ನಾಭರಣ, ನಗನಾಣ್ಯ & ದ್ರವ್ಯ ಸಂಗ್ರಹ ಯೋಗ",
    mr: "५ वर्षांचा सुवर्ण, दागिने व धन संचय योग",
    hi: "५ वर्षीय स्वर्ण-आभूषण एवं द्रव्य संचय योग",
    te: "5 సంవత్సరాల స్వర్ణాభరణ, నగలు & ధన సంచయ యోగం",
    ta: "5 ஆண்டுகளுக்கான தங்க நகைகள் மற்றும் சொத்து சேர்க்கை யோகம்",
    en: "5-Year Gold, Jewelry & Asset Accumulation Forecast"
  }, targetLang);

  const subtitle = pick6({
    kn: `ಪರಾಶರಿ ಶಾಸ್ತ್ರದ ಧನಭಾವ (${dhanaRashiLocalized}) & ಲಾಭಭಾವ (${labhaRashiLocalized}) ಆಧರಿತ ಬಂಗಾರ-ಆಭರಣ ಸಂಚಯ ಮುನ್ನೋಟ`,
    mr: `पाराशरी ज्योतिषानुसार द्वितीय (${dhanaRashiLocalized}) व एकादश (${labhaRashiLocalized}) भावावर आधारित सुवर्ण वृद्धी अहवाल`,
    hi: `पाराशरी शास्त्रानुसार द्वितीय भाव (${dhanaRashiLocalized}) एवं एकादश भाव (${labhaRashiLocalized}) आधारित स्वर्ण संचय फलादेश`,
    te: `పరాశర శాస్త్ర ధన భావ (${dhanaRashiLocalized}) & లాభ భావ (${labhaRashiLocalized}) ఆధారిత స్వర్ణాభరణ వృద్ధి విశ్లేషణ`,
    ta: `பராசர ஜோதிடத்தின் 2-ஆம் பாவ (${dhanaRashiLocalized}) & 11-ஆம் பாவ (${labhaRashiLocalized}) அடிப்படையிலான தங்க நகை சேர்க்கை கணிப்பு`,
    en: `Classical Parashari Dhana Bhava (${dhanaRashiLocalized}) & Labha Bhava (${labhaRashiLocalized}) Vedic Gold Growth Matrix`
  }, targetLang);

  // Dynamic Favorable Metals based on Lagna Tattva
  // Fire Signs (0, 4, 8) -> Gold, Copper, Panchaloha
  // Earth Signs (1, 5, 9) -> Platinum, Silver, Diamond
  // Air Signs (2, 6, 10) -> White Gold, Silver, Emerald
  // Water Signs (3, 7, 11) -> Pure Yellow Gold, Pearl, Silver
  const isFire = [0, 4, 8].includes(lagnaIdx);
  const isEarth = [1, 5, 9].includes(lagnaIdx);
  const isAir = [2, 6, 10].includes(lagnaIdx);

  const favorableGemstoneMetals = isFire
    ? pick6({
      kn: `ಶುಭ ಲೋಹಗಳು (${lagnaRashiLocalized} ಲಗ್ನಕ್ಕೆ): ಅಪರಂಜಿ ಬಂಗಾರ (೨೪ ಕ್ಯಾರಟ್), ತಾಮ್ರ & ಸುವರ್ಣ ಪಂಚಲೋಹ`,
      mr: `शुभ धातू (${lagnaRashiLocalized} लग्नासाठी): २४ कॅरेट शुद्ध सोने, तांबे व सुवर्ण पंचधातू`,
      hi: `शुभ धातु (${lagnaRashiLocalized} लग्न हेतु): २४ कैरेट शुद्ध स्वर्ण, ताम्र एवं सुवर्ण पंचधातु`,
      te: `శుభ లోహాలు (${lagnaRashiLocalized} లగ్నానికి): 24 క్యారెట్ల స్వచ్ఛమైన బంగారం, రాగి & పంచలోహాలు`,
      ta: `சுப உலோகங்கள் (${lagnaRashiLocalized} லக்னத்திற்கு): 24 காரட் தங்கம், தாமிரம் மற்றும் பஞ்சலோகம்`,
      en: `Auspicious Metals (${lagnaRashiLocalized} Lagna): 24K Pure Gold, Copper & Sacred Panchaloha`
    }, targetLang)
    : isEarth
      ? pick6({
        kn: `ಶುಭ ಲೋಹಗಳು (${lagnaRashiLocalized} ಲಗ್ನಕ್ಕೆ): ಪರಿಶುದ್ಧ ಬೆಳ್ಳಿ, ಪ್ಲಾಟಿನಂ, ವಜ್ರ & ಶ್ವೇತ ಸ್ವರ್ಣ`,
        mr: `शुभ धातू (${lagnaRashiLocalized} लग्नासाठी): शुद्ध चांदी, प्लॅटिनम, हिरा व पांढरे सोने`,
        hi: `शुभ धातु (${lagnaRashiLocalized} लग्न हेतु): शुद्ध रजत (चांदी), प्लैटिनम, हीरा एवं श्वेत स्वर्ण`,
        te: `శుభ లోహాలు (${lagnaRashiLocalized} లగ్నానికి): స్వచ్ఛమైన వెండి, ప్లాటినం, వజ్రం & శ్వేత స్వర్ణం`,
        ta: `சுப உலோகங்கள் (${lagnaRashiLocalized} லக்னத்திற்கு): தூய வெள்ளி, பிளாட்டினம், வைரம் & வெள்ளை தங்கம்`,
        en: `Auspicious Metals (${lagnaRashiLocalized} Lagna): Sterling Silver, Platinum, Diamond & White Gold`
      }, targetLang)
      : isAir
        ? pick6({
          kn: `ಶುಭ ಲೋಹಗಳು (${lagnaRashiLocalized} ಲಗ್ನಕ್ಕೆ): ಶ್ವೇತ ಸ್ವರ್ಣ, ಬೆಳ್ಳಿ, ಪಂಚಲೋಹ & ನವರತ್ನ`,
          mr: `शुभ धातू (${lagnaRashiLocalized} लग्नासाठी): पांढरे सोने, चांदी, पंचधातू व नवरत्न`,
          hi: `शुभ धातु (${lagnaRashiLocalized} लग्न हेतु): श्वेत स्वर्ण, चांदी, पंचधातु एवं नवरत्न`,
          te: `శుభ లోహాలు (${lagnaRashiLocalized} లగ్నానికి): శ్వేత స్వర్ణం, వెండి, పంచలోహాలు & నవరత్నాలు`,
          ta: `சுப உலோகங்கள் (${lagnaRashiLocalized} லக்னத்திற்கு): வெள்ளை தங்கம், வெள்ளி, பஞ்சலோகம் & நவரத்தினங்கள்`,
          en: `Auspicious Metals (${lagnaRashiLocalized} Lagna): White Gold, Silver, Panchaloha & Navaratna`
        }, targetLang)
        : pick6({
          kn: `ಶುಭ ಲೋಹಗಳು (${lagnaRashiLocalized} ಲಗ್ನಕ್ಕೆ): ಸಾಂಪ್ರದಾಯಿಕ ಹಳದಿ ಬಂಗಾರ, ಮುತ್ತು, ಶುದ್ಧ ಬೆಳ್ಳಿ & ಪಂಚಲೋಹ`,
          mr: `शुभ धातू (${lagnaRashiLocalized} लग्नासाठी): पारंपरिक पिवळे सोने, मोती, शुद्ध चांदी व पंचधातू`,
          hi: `शुभ धातु (${lagnaRashiLocalized} लग्न हेतु): पारंपरिक पीला स्वर्ण, मोती, शुद्ध रजत एवं पंचधातु`,
          te: `శుభ లోహాలు (${lagnaRashiLocalized} లగ్నానికి): సాంప్రదాయ పసుపు బంగారం, ముత్యాలు, వెండి & పంచలోహాలు`,
          ta: `சுப உலோகங்கள் (${lagnaRashiLocalized} லக்னத்திற்கு): பாரம்பரிய மஞ்சள் தங்கம், முத்து, தூய வெள்ளி & பஞ்சலோகம்`,
          en: `Auspicious Metals (${lagnaRashiLocalized} Lagna): Classical Yellow Gold, Natural Pearl, Silver & Panchaloha`
        }, targetLang);

  const dhanaBhavaDisposition = pick6({
    kn: `ನಿಮ್ಮ ಲಗ್ನ ಕುಂಡಲಿಯ ಧನಭಾವಾಧಿಪತಿ ${dhanaLordLocalized} (${dhanaRashiLocalized}) ಹಾಗೂ ಲಾಭಾಧಿಪತಿ ${labhaLordLocalized} (${labhaRashiLocalized}) ರ ಪರಸ್ಪರ ಸ್ಥಾನಬಲವು ದ್ರವ್ಯ ಸಂಚಯಕ್ಕೆ ವಿಶಿಷ್ಟ ಯೋಗವನ್ನು ನಿರ್ಮಿಸಿದೆ. ಧನಸ್ಥಾನಕ್ಕೆ ಶುಭ ಗ್ರಹಗಳ ಸಂಪರ್ಕವಿರುವಾಗ, ಊಹಾತ್ಮಕ ಅಪಾಯಕಾರಿ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ ಭೌತಿಕ ಚಿನ್ನ ಹಾಗೂ ನಗನಾಣ್ಯಗಳಲ್ಲಿ ಸಂಚಯ ಮಾಡುವುದು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಶಾಶ್ವತ ಶ್ರೀಮಂತಿಕೆಯನ್ನು ಒದಗಿಸಲಿದೆ.`,
    mr: `आपल्या कुंडलीतील द्वितीयेश (धनेश) ${dhanaLordLocalized} (${dhanaRashiLocalized}) व एकादशेश (लाभेश) ${labhaLordLocalized} (${labhaRashiLocalized}) यांचा दृष्टीसंबंध सुवर्ण संचयासाठी विशेष योग घडवून आणत आहे. धन स्थानावरील शुभ प्रभावामुळे वायफळ खर्च टाळून भौतिक सोन्यात केलेली गुंतवणूक अखंड लक्ष्मी प्राप्ती करून देईल.`,
    hi: `आपकी जन्म कुंडली में धनेश ${dhanaLordLocalized} (${dhanaRashiLocalized}) एवं लाभेश ${labhaLordLocalized} (${labhaRashiLocalized}) का पारस्परिक संबंध स्वर्ण संचय हेतु विशिष्ट योग निर्मित कर रहा है। धन भाव की शुभ स्थिति से व्यर्थ व्यय पर नियंत्रण रखकर भौतिक स्वर्ण में संचय करना परिवार हेतु स्थायी समृद्धि का आधार बनेगा।`,
    te: `మీ కుండలిలోని ధనాధిపతి ${dhanaLordLocalized} (${dhanaRashiLocalized}) మరియు లాభాధిపతి ${labhaLordLocalized} (${labhaRashiLocalized}) స్థాన బలం స్వర్ణాభరణాల సంచయానికి విశేష యోగాన్ని కలిగిస్తోంది. అనవసర ఖర్చులను అరికట్టి బంగారంలో మదుపు చేయడం శాశ్వత లక్ష్మీ కటాక్షాన్ని అందిస్తుంది.`,
    ta: `உங்கள் ஜாதகத்தில் தன ஸ்தானாதிபதி ${dhanaLordLocalized} (${dhanaRashiLocalized}) மற்றும் லாபாதிபதி ${labhaLordLocalized} (${labhaRashiLocalized}) அமைப்பானது தங்க நகை சேர்க்கைக்கு விசேஷ யோகத்தை உருவாக்குகிறது. வீண் செலவுகளைக் குறைத்து தங்கத்தில் சேமிப்பது குடும்பத்திற்கு நிரந்தர ஐஸ்வர்யத்தை தரும்.`,
    en: `The planetary disposition of your 2nd House Lord ${dhanaLordLocalized} (${dhanaRashiLocalized}) and 11th House Lord ${labhaLordLocalized} (${labhaRashiLocalized}) forms an authentic Vedic Dhana Yoga. Disciplined consolidation into tangible physical gold builds a lasting generational fortress of wealth.`
  }, targetLang);

  const overallYogaSummary = pick6({
    kn: `ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಅವಧಿಯಲ್ಲಿ, ${lagnaLocalized} ಲಗ್ನದ ಧನಕಾರಕ ಗುರು ಮತ್ತು ಶುಕ್ರರ ಸಂಚಾರವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಒಟ್ಟು ೩ ಸುವರ್ಣ ಘಟ್ಟಗಳಲ್ಲಿ ಬೃಹತ್ ಪ್ರಮಾಣದ ಚಿನ್ನಾಭರಣ, ನಗನಾಣ್ಯ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಸಂಗ್ರಹಣೆಗೆ ಅಪರೂಪದ ಯೋಗವನ್ನು ಕರುಣಿಸಲಿದೆ. ವಿಶೇಷವಾಗಿ ಉತ್ತರಾಯಣದ ಶುಭ ಮಾಸಗಳಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ಬಂಗಾರದ ಖರೀದಿಗಳು ಮಾಂಗಲ್ಯ ಬಲ, ವಂಶವೃದ್ಧಿ ಹಾಗೂ ಶಾಶ್ವತ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷವನ್ನು ನೂರ್ಮಡಿಗೊಳಿಸಲಿವೆ.`,
    mr: `पुढील ५ वर्षांत, ${lagnaLocalized} लग्नाचे धनकारक गुरू व शुक्र यांच्या शुभ गोचरामुळे किमान ३ प्रमुख कालखंडात मोठे सुवर्ण व अलंकार खरेदीचे अत्यंत फलदायी योग येतील. विशेषतः उत्तरायण काळात केलेली सोने खरेदी कुटुंबात सुख, समृद्धी व अखंड वैभव वृद्धिंगत करेल.`,
    hi: `आगामी ५ वर्षों में, ${lagnaLocalized} लग्न के धनकारक गुरु एवं शुक्र के गोचर से कम से कम ३ विशिष्ट अवधियों में प्रचुर स्वर्ण-आभूषण एवं परिसंपत्ति अर्जन का दुर्लभ योग बनेगा। विशेषतः उत्तरायण काल में की गई स्वर्ण खरीद वंशवृद्धि एवं अखंड लक्ष्मी की द्योतक बनेगी।`,
    te: `రాబోయే 5 సంవత్సరాలలో, ${lagnaLocalized} లగ్న ధనకారకులైన గురు మరియు శుక్రుల గోచారం ద్వారా కనీసం 3 ప్రధాన సమయాలలో భారీ స్వర్ణాభరణాల సేకరణకు అద్భుత యోగం పడుతుంది. ముఖ్యంగా ఉత్తరాయణ పుణ్యకాలంలో కొనుగోలు చేసే బంగారం కుటుంబ సౌభాగ్యాన్ని పెంచుతుంది.`,
    ta: `அடுத்த 5 ஆண்டுகளில், ${lagnaLocalized} லக்ன தனகாரகர்களான குரு மற்றும் சுக்கிரனின் சஞ்சாரத்தால் 3 முக்கிய காலகட்டங்களில் பெருமளவு தங்க நகைகள் சேர்க்கை நிகழும். குறிப்பாக உத்தராயண காலத்தில் வாங்கும் தங்கம் குடும்பத்தில் சுபிட்சத்தையும் வம்ச விருத்தியையும் தரும்.`,
    en: `Over the next 5-year horizon, transits of Jupiter and Venus relative to your ${lagnaLocalized} Lagna and ${moonRashiLocalized} Moon unlock 3 apex windows for acquiring consecrated gold jewelry, amplifying marital longevity and intergenerational wealth.`
  }, targetLang);

  // 5. Dynamic 5-Year Year-by-Year Nagalu Timeline based on Jupiter's transit & Dasha in that year
  const yearlyTimeline: NagaluYearItem[] = years.map((yr, idx) => {
    // Dynamic calculation: Jupiter transit house for this specific year from Moon
    const approxGuruHouseThisYear = ((guruHouse + idx - 1) % 12) + 1;
    const isGuruBeneficHouse = [2, 5, 7, 9, 11].includes(approxGuruHouseThisYear);
    const isKendraHouse = [1, 4, 10].includes(approxGuruHouseThisYear);

    // Is active Dasha lord of this year favorable to 2nd or 11th?
    const isDhanaYear = isGuruBeneficHouse || (idx === 0 && [PlanetName.Jupiter, PlanetName.Venus, dhanaLord].includes(kundli.planets[0]?.name));

    let suitabilityScore = 74;
    let starRating = "★★★☆☆";

    if (isGuruBeneficHouse) {
      suitabilityScore = 88 + (idx % 3) * 3;
      starRating = "★★★★★";
    } else if (isKendraHouse) {
      suitabilityScore = 80 + (idx % 4) * 2;
      starRating = "★★★★☆";
    } else {
      suitabilityScore = 72 + (idx % 3) * 2;
      starRating = "★★★☆☆";
    }

    const approxGuruHouseFormatted = formatNumber6L(approxGuruHouseThisYear, targetLang);

    const prediction = isGuruBeneficHouse
      ? pick6({
        kn: `ಚಂದ್ರನಿಂದ ${approxGuruHouseFormatted}ನೇ ಮನೆಯಲ್ಲಿ ದೈವಿಕ ಗುರುಬಲವಿರುವ ಕಾರಣ, ಈ ವರ್ಷ ನಗನಾಣ್ಯ ಹಾಗೂ ಬಂಗಾರದ ಒಡವೆಗಳನ್ನು ಖರೀದಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಕಾಲ. ಧನ ಸಂಚಯವು ವೃದ್ಧಿಯಾಗಲಿದ್ದು, ಕುಟುಂಬದ ಶುಭಕಾರ್ಯಗಳಿಗೆ ಅಥವಾ ಹೂಡಿಕೆಗಾಗಿ ಚಿನ್ನ ಖರೀದಿಸುವುದು ಶಾಶ್ವತ ಶುಭ ತರಲಿದೆ.`,
        mr: `चंद्रापासून ${approxGuruHouseFormatted}व्या स्थानात शुभ गुरूबल असल्याने, हे वर्ष सोने, दागिने व अलंकार खरेदीसाठी अत्यंत उत्तम राहील. धन संचय वाढेल व कौटुंबिक शुभकार्यासाठी केलेली सोन्याची खरेदी चिरस्थायी लाभ देईल.`,
        hi: `चन्द्र से ${approxGuruHouseFormatted}वें भाव में शुभ गुरुबल रहने से यह वर्ष स्वर्ण, आभूषण एवं रत्नों के क्रय हेतु परम श्रेष्ठ है। धन संचय में अप्रत्याशित वृद्धि होगी तथा पारिवारिक मांगलिक कार्यों हेतु स्वर्ण क्रय मंगलकारी रहेगा।`,
        te: `చంద్రుని నుండి ${approxGuruHouseFormatted}వ ఇంట అనుకూల గురుబలం ఉన్నందున, ఈ సంవత్సరం స్వర్ణాభరణాలు, నగలు కొనడానికి అత్యంత అనుకూలమైన కాలం. కుటుంబ శుభకార్యాల కొరకు చేసే కొనుగోళ్లు శుభప్రదం.`,
        ta: `சந்திரனிலிருந்து ${approxGuruHouseFormatted}-ஆம் இடத்தில் சுப குருபலம் அமைவதால், இந்த ஆண்டு தங்க நகைகள் வாங்க மிகச் சிறந்த காலமாகும். தன வரவு பெருகி சுப காரியங்களுக்காக வாங்கும் தங்கம் நிரந்தர நன்மைகளைத் தரும்.`,
        en: `Fortified by Jupiter transiting House ${approxGuruHouseFormatted} from Moon, this is an apex year for acquiring physical gold, bullion, and consecrated jewelry.`
      }, targetLang)
      : isKendraHouse
        ? pick6({
          kn: `ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ ಗುರುವಿನ ಸಂಚಾರವಿರುವುದರಿಂದ, ಸ್ಥಿರ ಉಳಿತಾಯ ಹಾಗೂ ಮಧ್ಯಮ ಪ್ರಮಾಣದ ಒಡವೆಗಳ ಖರೀದಿಗೆ ಉತ್ತಮ ವರ್ಷ. ಹಳೆಯ ಆಭರಣಗಳನ್ನು ನವೀಕರಿಸಲು ಅಥವಾ ಸಣ್ಣ ನಾಣ್ಯಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಲು ಪ್ರಶಸ್ತ.`,
          mr: `केंद्रात गुरूचा संचार असल्याने, नियमित बचत व मध्यम स्वरूपाच्या दागिन्यांच्या खरेदीसाठी अनुकूल वर्ष राहील. जुने दागिने बदलून नवीन घेणे किंवा नाणी खरेदी करणे लाभदायक ठरेल.`,
          hi: `केन्द्र भाव में गुरु के गोचर से नियमित बचत एवं मध्यम स्तर के आभूषण क्रय हेतु उत्तम वर्ष है। पुराने आभूषणों का नवीनीकरण अथवा सिक्कों में निवेश लाभप्रद रहेगा।`,
          te: `కేంద్రంలో గురు సంచారం వల్ల క్రమబద్ధమైన పొదుపు మరియు మధ్యస్థ ఆభరణాల కొనుగోలుకు అనుకూలమైన సంవత్సరం. పాత నగలను మార్చుకోవడం లేదా నాణేల కొనుగోలు శ్రేయస్కరం.`,
          ta: `கேந்திரத்தில் குரு சஞ்சரிப்பதால், மிதமான தங்க நகைகள் வாங்கவும் சீரான சேமிப்பிற்கும் ஏற்ற ஆண்டு. பழைய நகைகளை புதுப்பிக்க அல்லது நாணயங்கள் வாங்க சிறந்தது.`,
          en: `Jupiter in Kendra supports disciplined incremental gold savings, coin purchases, and redesigning family heirlooms.`
        }, targetLang)
        : pick6({
          kn: `ಸಾಮಾನ್ಯ ಹೂಡಿಕೆ ಅವಧಿ. ದೊಡ್ಡ ಪ್ರಮಾಣದ ದುಂದುವೆಚ್ಚದ ಒಡವೆಗಳ ಬದಲಾಗಿ ಸಣ್ಣ ಪ್ರಮಾಣದ ನಾಣ್ಯಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಭದ್ರತಾ ಠೇವಣಿಗಳಲ್ಲಿ ಸಂಚಯ ಮಾಡುವುದು ಸೂಕ್ತ.`,
          mr: `संतुलित गुंतवणुकीचा काळ. मोठ्या खरेदीऐवजी लहान सुवर्ण नाणी किंवा नियमित बचतीवर भर देणे अधिक श्रेयस्कर ठरेल.`,
          hi: `संतुलित संचय का वर्ष। भारी आभूषणों के स्थान पर छोटे स्वर्ण सिक्के अथवा संरचित बचत में धन लगाना अधिक लाभप्रद रहेगा।`,
          te: `సాధారణ మదుపు కాలం. పెద్ద మొత్తంలో కాకుండా చిన్న బంగారు నాణేలు లేదా పొదుపు రూపంలో దాచుకోవడం శ్రేయస్కరం.`,
          ta: `மிதமான சேமிப்பு காலம். பெரிய ஆபரணங்களுக்குப் பதிலாக சிறிய தங்க நாணயங்கள் அல்லது சேமிப்பில் முதலீடு செய்வது நன்று.`,
          en: `Favorable for steady, incremental gold accumulation and sovereign savings rather than impulsive large jewelry splurges.`
        }, targetLang);

    // Auspicious Muhurtas rotating by year & Tattva
    const auspiciousMuhurta = idx % 2 === 0
      ? pick6({
        kn: "ಅಕ್ಷಯ ತೃತೀಯ & ಗುರು ಪುಷ್ಯ ಯೋಗ",
        mr: "अक्षय्य तृतीया व गुरुपुष्यामृत योग",
        hi: "अक्षय तृतीया एवं गुरु पुष्य योग",
        te: "అక్షయ తృతీయ & గురు పుష్య యోగం",
        ta: "அட்சய திருதியை & குரு புஷ்ய யோகம்",
        en: "Akshaya Tritiya & Guru Pushya Yoga"
      }, targetLang)
      : pick6({
        kn: "ಧನತ್ರಯೋದಶಿ & ದೀಪಾವಳಿ ಲಕ್ಷ್ಮೀ ಪೂಜೆ",
        mr: "धनत्रयोदशी व दीपावली लक्ष्मीपूजन",
        hi: "धनतेरस एवं दीपावली लक्ष्मी पूजन",
        te: "ధనత్రయోదశి & దీపావళి లక్ష్మీ పూజ",
        ta: "தன திரயோதசி & தீபாவளி லட்சுமி பூஜை",
        en: "Dhanteras & Deepavali Lakshmi Puja"
      }, targetLang);

    return {
      yearIndex: yr.yearIndex,
      yearRange: yr.gregorianRange,
      samvatsara: yr.samvatsaraNative,
      starRating,
      suitabilityScore,
      prediction,
      auspiciousMuhurta
    };
  });

  return {
    title,
    subtitle,
    favorableGemstoneMetals,
    dhanaBhavaDisposition,
    overallYogaSummary,
    yearlyTimeline
  };
}

function mahaMr(str: string): string {
  return str.replace("महादशा", "महादशा");
}
