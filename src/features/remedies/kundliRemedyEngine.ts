import { PlanetName, type KundliInput, type KundliOutput, RASHIS } from "../../core/AstroTypes";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { degreeToRashi } from "../../core/AstroMath";
import { generateAstrologicalPrescriptions } from "../../core/PanchangaAngaSynthesisEngine";

export type SupportedLanguage = "kn" | "en" | "hi" | "te" | "ta";

export interface KundliRemedyDiagnosis {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  gotra?: string;
  lagnaName: Record<string, string>;
  rashiName: Record<string, string>;
  nakshatraName: Record<string, string>;
  primaryStruggle: {
    category: "anger_temper" | "mental_anxiety" | "career_obstacles" | "relationship_friction" | "health_vitality" | "general_alignment";
    title: Record<string, string>;
    description: Record<string, string>;
    intensity: "High" | "Moderate" | "Balanced";
    intensityLabel: Record<string, string>;
  };
  afflictionFactors: Array<{
    graha: PlanetName;
    title: Record<string, string>;
    reason: Record<string, string>;
    house: number;
    impact: Record<string, string>;
  }>;
  psychologicalProfile: {
    krodhaLevel: number; // 0-100% (Anger / Pitta intensity)
    manasStability: number; // 0-100% (Mental stability / Peace)
    vitalityScore: number; // 0-100% (Energy / Tejas)
    patienceIndex: number; // 0-100% (Tolerance / Dhriti)
  };
  instantCalmingProtocol: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    steps: Array<{
      stepNumber: number;
      name: Record<string, string>;
      action: Record<string, string>;
      detail: Record<string, string>;
      duration: Record<string, string>;
      icon: string;
    }>;
    emergencyBeejaMantra: {
      sanskrit: string;
      kannada: string;
      telugu: string;
      tamil: string;
      hindi: string;
      transliteration: string;
      meaning: Record<string, string>;
      japaCount: Record<string, string>;
    };
  };
  dailyPacificationRoutine: {
    morning: Array<{ time: string; title: Record<string, string>; desc: Record<string, string>; icon: string }>;
    afternoonLifestyle: Array<{ title: Record<string, string>; desc: Record<string, string>; icon: string }>;
    evening: Array<{ time: string; title: Record<string, string>; desc: Record<string, string>; icon: string }>;
  };
  personalizedStotras: Array<{
    id: string;
    title: Record<string, string>;
    dedicatedTo: Record<string, string>;
    shlokaSanskrit: string;
    shlokaKannada: string;
    shlokaTelugu: string;
    shlokaTamil: string;
    shlokaHindi: string;
    transliteration: string;
    meaning: Record<string, string>;
    spiritualBenefits: Record<string, string>;
    bestTimeToRecite: Record<string, string>;
    facingDirection: Record<string, string>;
    recitationCount: Record<string, string>;
  }>;
  dashaBhuktiAnalysis: {
    currentMahaDasha: PlanetName;
    currentBhukti: PlanetName;
    mahaDashaLabel: Record<string, string>;
    bhuktiLabel: Record<string, string>;
    periodEffect: Record<string, string>;
    remedialAction: Record<string, string>;
  };
  gocharaTransitAnalysis: {
    transitHighlights: Array<{
      graha: PlanetName;
      transitSign: string;
      houseFromMoon: number;
      effect: "Benefic" | "Caution" | "Challenging";
      title: Record<string, string>;
      description: Record<string, string>;
      remedy: Record<string, string>;
    }>;
    sadeSatiStatus: Record<string, string>;
  };
  gokarnaTempleRemedies: {
    prescribedSeva: {
      name: Record<string, string>;
      temple: Record<string, string>;
      significance: Record<string, string>;
      idealDay: Record<string, string>;
    };
    rudrakshaRecommendation: {
      mukhi: Record<string, string>;
      deity: Record<string, string>;
      benefits: Record<string, string>;
    };
    gemstoneRecommendation: {
      stone: Record<string, string>;
      metal: Record<string, string>;
      finger: Record<string, string>;
      dayToWear: Record<string, string>;
    };
    donationDaana: {
      item: Record<string, string>;
      day: Record<string, string>;
      beneficiary: Record<string, string>;
    };
  };
  chiefPriestBlessing: {
    priestName: Record<string, string>;
    priestTitle: Record<string, string>;
    phone: string;
    sanskritAshirvada: string;
    ashirvadaMeaning: Record<string, string>;
    templeSealText: Record<string, string>;
  };
}

/** Localized Graha Names Dictionary */
export const GRAHA_NAMES_LOCALE: Record<PlanetName, Record<string, string>> = {
  [PlanetName.Sun]: { kn: "ಸೂರ್ಯ (ರವಿ)", en: "Sun (Surya)", hi: "सूर्य (रवि)", te: "సూర్యుడు (రవి)", ta: "சூரியன் (ரவி)" },
  [PlanetName.Moon]: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  [PlanetName.Mars]: { kn: "ಕುಜ (ಮಂಗಳ)", en: "Mars (Mangala/Kuja)", hi: "मंगल (कुज)", te: "కుజుడు (మంగళ)", ta: "செவ்வாய் (குஜன்)" },
  [PlanetName.Mercury]: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  [PlanetName.Jupiter]: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", en: "Jupiter (Guru)", hi: "बृहस्पति (गुरु)", te: "గురుడు (బృహస్పతి)", ta: "குரு (வியாழன்)" },
  [PlanetName.Venus]: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  [PlanetName.Saturn]: { kn: "ಶನಿ ಮಹಾರಾಜ", en: "Saturn (Shani)", hi: "शनि देव", te: "శని దేవుడు", ta: "சனி பகவான்" },
  [PlanetName.Rahu]: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  [PlanetName.Ketu]: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" }
};

/** Localized Rashi Names Dictionary */
export const RASHI_NAMES_LOCALE: Record<string, Record<string, string>> = {
  Aries: { kn: "ಮೇಷ", en: "Aries", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  Taurus: { kn: "ವೃಷಭ", en: "Taurus", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  Gemini: { kn: "ಮಿಥುನ", en: "Gemini", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  Cancer: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  Leo: { kn: "ಸಿಂಹ", en: "Leo", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  Virgo: { kn: "ಕನ್ಯಾ", en: "Virgo", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  Libra: { kn: "ತುಲಾ", en: "Libra", hi: "तुला", te: "తులా", ta: "துலாம்" },
  Scorpio: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  Sagittarius: { kn: "ಧನುಸ್ಸು", en: "Sagittarius", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு" },
  Capricorn: { kn: "ಮಕರ", en: "Capricorn", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  Aquarius: { kn: "ಕುಂಭ", en: "Aquarius", hi: "कुम्भ", te: "కుంభం", ta: "கும்பம்" },
  Pisces: { kn: "ಮೀನ", en: "Pisces", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

/**
 * Generates an in-depth, authentic Vedic Astrological Remedy and Pacification Analysis
 * strictly personalized to the devotee's generated Janma Kundali.
 */
export function generateKundliRemedyReport(
  kundli: KundliOutput,
  input: KundliInput
): KundliRemedyDiagnosis {
  const planets = kundli.planets;
  const mars = planets.find(p => p.name === PlanetName.Mars);
  const moon = planets.find(p => p.name === PlanetName.Moon);
  const sun = planets.find(p => p.name === PlanetName.Sun);
  const saturn = planets.find(p => p.name === PlanetName.Saturn);
  const rahu = planets.find(p => p.name === PlanetName.Rahu);
  const ketu = planets.find(p => p.name === PlanetName.Ketu);
  const jupiter = planets.find(p => p.name === PlanetName.Jupiter);
  const mercury = planets.find(p => p.name === PlanetName.Mercury);
  const venus = planets.find(p => p.name === PlanetName.Venus);

  // Ascendant / Lagna identification
  const lagnaRashiName = kundli.lagnaRashi?.english || "Aries";
  const moonRashiName = moon?.rashi.english || "Aries";
  const moonNakName = moon?.nakshatra.english || "Ashwini";

  // 1. Evaluate Anger / Pitta / Mars Affliction
  const marsHouse = mars?.house || 1;
  const isMarsAfflicted = [1, 2, 4, 7, 8, 12].includes(marsHouse) || 
    planets.some(p => (p.name === PlanetName.Sun || p.name === PlanetName.Rahu || p.name === PlanetName.Saturn) && p.house === marsHouse) ||
    mars?.rashi.english === "Cancer" || mars?.isDebilitated;

  const isMoonAfflicted = moon?.rashi.english === "Scorpio" || moon?.isDebilitated ||
    planets.some(p => (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu || p.name === PlanetName.Saturn) && p.house === (moon?.house || 0)) ||
    [6, 8, 12].includes(moon?.house || 1);

  const isSaturnAfflicted = [6, 8, 12].includes(saturn?.house || 1) || saturn?.rashi.english === "Aries" || saturn?.isDebilitated;
  const isRahuKetuStrong = (rahu?.house === 1 || rahu?.house === 7 || rahu?.house === 8);
  const isJupiterAfflicted = jupiter?.rashi.english === "Capricorn" || jupiter?.isDebilitated || [6, 8, 12].includes(jupiter?.house || 1);

  // Unified 5-Anga Prescriptions (100% synchronized with PanchangaAngaSynthesisEngine)
  const prescriptions = generateAstrologicalPrescriptions(kundli);

  // Compute Psychological Scores
  let krodhaLevel = 45;
  if (isMarsAfflicted) krodhaLevel += 35;
  if (["Aries", "Leo", "Scorpio", "Sagittarius"].includes(lagnaRashiName)) krodhaLevel += 10;
  if (["Aries", "Leo", "Scorpio"].includes(moonRashiName)) krodhaLevel += 10;
  krodhaLevel = Math.min(95, Math.max(25, krodhaLevel));

  let manasStability = 80;
  if (isMoonAfflicted) manasStability -= 35;
  if (isRahuKetuStrong) manasStability -= 15;
  manasStability = Math.min(95, Math.max(30, manasStability));

  let vitalityScore = 75;
  if (sun?.isDebilitated || [6, 8, 12].includes(sun?.house || 1)) vitalityScore -= 25;
  if (isSaturnAfflicted) vitalityScore -= 10;
  vitalityScore = Math.min(95, Math.max(35, vitalityScore));

  let patienceIndex = 80;
  if (isMarsAfflicted) patienceIndex -= 30;
  if (isSaturnAfflicted) patienceIndex -= 15;
  patienceIndex = Math.min(95, Math.max(25, patienceIndex));

  // Determine Primary Struggle Category
  let struggleCategory: "anger_temper" | "mental_anxiety" | "career_obstacles" | "relationship_friction" | "health_vitality" | "general_alignment" = "general_alignment";
  let primaryStruggleTitle: Record<string, string>;
  let primaryStruggleDesc: Record<string, string>;
  let intensity: "High" | "Moderate" | "Balanced" = "Moderate";
  let intensityLabel: Record<string, string>;

  if (krodhaLevel >= 70) {
    struggleCategory = "anger_temper";
    intensity = "High";
    intensityLabel = {
      kn: "ಅತ್ಯಂತ ಮುಖ್ಯ (ತೀವ್ರ ಆದ್ಯತೆ)",
      en: "High Priority Action",
      hi: "उच्च प्राथमिकता",
      te: "అత్యధిక ప్రాధాన్యత",
      ta: "முக்கிய தீர்வு"
    };
    primaryStruggleTitle = {
      kn: "ತೀವ್ರ ಪಿತ್ತ ಪ್ರಕೋಪ, ಆವೇಶ & ಕೋಪ ನಿಯಂತ್ರಣ ಸವಾಲು",
      en: "Pitta Aggravation, Impatience & Anger Spikes",
      hi: "तीव्र पित्त प्रकोप, क्रोध एवं आवेग नियंत्रण चुनौती",
      te: "తీవ్ర పిత్త ప్రకోపం, ఆవేశం & కోప నియంత్రణ సవాలు",
      ta: "தீவிர பித்த பிரகோபம், கோபம் & மன அமைதியின்மை சவால்"
    };
    primaryStruggleDesc = {
      kn: `ಕುಂಡಲಿಯಲ್ಲಿ ಕುಜ ಹಾಗೂ ರವಿ ಗ್ರಹಗಳ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವದಿಂದಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ತಕ್ಷಣ ಸಿಟ್ಟು, ತಾಳ್ಮೆ ಕೊರತೆ ಹಾಗೂ ಅಸಹನೆ ಉಂಟಾಗುವ ಸಂಭವವಿದೆ. ಅನ್ಯರ ತಪ್ಪುಗಳಿಗೆ ಅಥವಾ ಅಡೆತಡೆಗಳಿಗೆ ತಕ್ಷಣ ಪ್ರತಿಕ್ರಿಯಿಸುವುದರಿಂದ ಧರ್ಮಕಾರ್ಯಗಳಲ್ಲಿ ಹಾಗೂ ಸಂಬಂಧಗಳಲ್ಲಿ ಘರ್ಷಣೆ ಉಂಟಾಗಬಹುದು.`,
      en: `Due to sharp Mars-Sun planetary energy on key houses, internal heat (Pitta) rises rapidly during obstacles, causing sharp irritation, impulsive words, and high reactivity that can disturb relationships and peace.`,
      hi: `कुंडली में मंगल एवं सूर्य के तीक्ष्ण प्रभाव के कारण मन में अचानक क्रोध, अधीरता और असहिष्णुता उत्पन्न होती है, जिससे संबंधों और महत्वपूर्ण कार्यों में बाधाएं आ सकती हैं।`,
      te: `కుండలిలో కుజ మరియు సూర్య గ్రహాల తీవ్ర ప్రభావం వలన త్వరగా కోపం, అసహనం మరియు తొందరపాటు నిర్ణయాలు వచ్చే అవకాశం ఉంది.`,
      ta: `ஜாதகத்தில் செவ்வாய் மற்றும் சூரியனின் தீட்சண தாக்கத்தினால் திடீர் கோபமும், பொறுமையின்மையும் உண்டாகலாம்.`
    };
  } else if (manasStability <= 55) {
    struggleCategory = "mental_anxiety";
    intensity = "High";
    intensityLabel = {
      kn: "ಅತ್ಯಂತ ಮುಖ್ಯ (ತೀವ್ರ ಆದ್ಯತೆ)",
      en: "High Priority Action",
      hi: "उच्च प्राथमिकता",
      te: "అత్యధిక ప్రాధాన్యత",
      ta: "முக்கிய தீர்வு"
    };
    primaryStruggleTitle = {
      kn: "ಚಿತ್ತಚಾಂಚಲ್ಯ, ಅತಿ ಯೋಚನೆ & ಮಾನಸಿಕ ಆತಂಕ",
      en: "Mental Overthinking, Mood Turbulence & Anxiety",
      hi: "चित्त चंचलता, अत्यधिक सोच एवं मानसिक अशांति",
      te: "చిత్త చంచలత, అతి ఆలోచన & మానసిక ఆందోళన",
      ta: "மன அமைதியின்மை, அதிக சிந்தனை & குழப்பம்"
    };
    primaryStruggleDesc = {
      kn: `ಚಂದ್ರ ಗ್ರಹದ ಸ್ಥಾನ ಹಾಗೂ ರಾಹು/ಕೇತು ಪ್ರಭಾವದಿಂದಾಗಿ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾಗಿ ಯೋಚಿಸುವುದು, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ಅನಿಶ್ಚಿತತೆಯ ಭಯ ಕಾಡಬಹುದು.`,
      en: `Affliction to the natal Moon triggers emotional vulnerability, nocturnal overthinking, and transient fears regarding future outcomes.`,
      hi: `चन्द्रमा पर पाप ग्रहों के प्रभाव से अनावश्यक चिंता, अनिद्रा और चित्त में भय बना रहता है।`,
      te: `చంద్రుని స్థానం వలన అధిక ఆలోచనలు మరియు మానసిక ఆందోళన కలగవచ్చు.`,
      ta: `சந்திரனின் பலவீனத்தால் அதிக கவலையும் தூக்கமின்மையும் ஏற்படலாம்.`
    };
  } else if (isSaturnAfflicted) {
    struggleCategory = "career_obstacles";
    intensity = "Moderate";
    intensityLabel = {
      kn: "ಮಧ್ಯಮ ಆದ್ಯತೆ",
      en: "Moderate Priority",
      hi: "मध्यम प्राथमिकता",
      te: "మధ్యస్థ ప్రాధాన్యత",
      ta: "மிதமான தீர்வு"
    };
    primaryStruggleTitle = {
      kn: "ಕಾರ್ಯ ವಿಳಂಬ, ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗದಿರುವಿಕೆ & ಶನಿ ಬಾಧೆ",
      en: "Career Friction, Unwarranted Delays & Saturn Burden",
      hi: "कार्य में अनावश्यक विलंब एवं शनि बाधा",
      te: "కార్య విలంబం & శని ప్రభావం",
      ta: "காரிய தாமதம் & சனி தாக்கம்"
    };
    primaryStruggleDesc = {
      kn: `ಶನಿ ಮಹಾತ್ಮನ ಪ್ರಭಾವದಿಂದ ಪ್ರತಿ ಕಾರ್ಯದಲ್ಲೂ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ವಿಳಂಬ, ಆರ್ಥಿಕ ತಡೆಗಳು ಹಾಗೂ ಅತಿಯಾದ ಜವಾಬ್ದಾರಿಯ ಹೊರೆ ಕಾಡುತ್ತದೆ.`,
      en: `Saturnian friction slows down momentum and delays fruiting of sincere hard work, demanding disciplined spiritual perseverance.`,
      hi: `शनि के प्रभाव से कार्यों में अंतिम समय पर अड़चनें और जिम्मेदारियों का अत्यधिक बोझ रहता है।`,
      te: `శని ప్రభావం వలన పనులలో ఆటంకాలు మరియు ఆలస్యం ఏర్పడవచ్చు.`,
      ta: `சனி பகவானின் தாக்கத்தால் காரியங்களில் தாமதமும் தடைகளும் ஏற்படலாம்.`
    };
  } else {
    struggleCategory = "general_alignment";
    intensity = "Balanced";
    intensityLabel = {
      kn: "ಸಾಮಾನ್ಯ ಸಮನ್ವಯ",
      en: "General Balance",
      hi: "सामान्य सामंजस्य",
      te: "సాధారణ సమతుల్యత",
      ta: "பொதுவான சமநிலை"
    };
    primaryStruggleTitle = {
      kn: "ಸಾಮಾನ್ಯ ಗ್ರಹ ಸಮನ್ವಯ & ಆತ್ಮಶಕ್ತಿ ವರ್ಧನೆ",
      en: "General Planetary Harmonic Balance & Inner Vitality",
      hi: "सामान्य ग्रह सामंजस्य एवं आत्मबल संवर्धन",
      te: "సాధారణ గ్రహ సమన్వయం & ఆత్మశక్తి వృద్ధి",
      ta: "பொதுவான கிரக சமநிலை & ஆத்ம சக்தி"
    };
    primaryStruggleDesc = {
      kn: `ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಗ್ರಹದೋಷಗಳಿಲ್ಲದಿದ್ದರೂ, ದೈನಂದಿನ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ಸಮೃದ್ಧಿಗಾಗಿ ನಿಯಮಿತ ಪರಿಹಾರ ಜಪಗಳು ಶ್ರೇಷ್ಠ.`,
      en: `The chart is largely balanced; performing daily stabilizing japa and temple shanti will elevate your focus, prosperity, and peace of mind.`,
      hi: `कुंडली सामान्यतः संतुलित है; नित्य साधना से जीवन में शांति और उन्नति बनी रहेगी।`,
      te: `కుండలి సమతుల్యంగా ఉంది; నిత్య పూజలతో మనశ్శాంతి లభిస్తుంది.`,
      ta: `ஜாதகம் சமநிலையில் உள்ளது; தினசரி வழிபாட்டால் மேன்மை உண்டாகும்.`
    };
  }

  // Affliction Factors List
  const afflictionFactors = [];

  if (isMarsAfflicted && mars) {
    afflictionFactors.push({
      graha: PlanetName.Mars,
      title: { kn: "ಕುಜ ದೋಷ / ತೀಕ್ಷ್ಣ ಅಂಗಾರಕ ಶಕ್ತಿ", en: "Mars (Kuja) High Combustion / Friction", hi: "मंगल दोष / तीक्ष्ण अंगारक शक्ति", te: "కుజ దోషం", ta: "செவ்வாய் தோஷம்" },
      reason: { kn: `ಕುಜ ಗ್ರಹವು ${mars.house} ನೇ ಭಾವದಲ್ಲಿ ನೆಲೆಸಿದ್ದು, ಕೋಪ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ತರಾತುರಿಯ ನಿರ್ಧಾರಗಳಿಗೆ ಕಾರಣವಾಗುತ್ತದೆ.`, en: `Mars is placed in House ${mars.house}, exciting the autonomic nervous system into sudden anger flares and impatience.`, hi: `मंगल ${mars.house}वें भाव में होकर क्रोध और अधीरता बढ़ाता है।`, te: `కుజుడు ${mars.house}వ భావంలో ఉండి తొందరపాటును కలిగిస్తాడు.`, ta: `செவ்வாய் ${mars.house}ம் இடத்தில் இருந்து கோபத்தை அதிகரிக்கிறார்.` },
      house: mars.house,
      impact: { kn: "ತಾಳ್ಮೆ ನಾಶ, ವಾದ-ವಿವಾದಗಳಲ್ಲಿ ತೊಡಗುವಿಕೆ.", en: "Depletes patience; creates avoidable friction with colleagues & family.", hi: "धैर्य की कमी एवं वाद-विवाद।", te: "ఓపిక తగ్గడం, వివాదాలు.", ta: "பொறுமையின்மை, வாக்குவாதம்." }
    });
  }

  if (isMoonAfflicted && moon) {
    afflictionFactors.push({
      graha: PlanetName.Moon,
      title: { kn: "ಚಂದ್ರ ಕ್ಷೀಣತೆ / ಮಾನಸಿಕ ಚಂಚಲತೆ", en: "Moon Affliction / Emotional Sensitivity", hi: "चन्द्र दुर्बलता / मानसिक चंचलता", te: "చంద్ర క్షీణత", ta: "சந்திர பலவீனம்" },
      reason: { kn: `ಮನಃಕಾರಕ ಚಂದ್ರನು ${moon.house} ನೇ ಭಾವದಲ್ಲಿದ್ದು ಅಥವಾ ಅಶುಭ ಗ್ರಹಗಳಿಂದ ಬಾಧಿತನಾಗಿದ್ದಾನೆ.`, en: `Moon in House ${moon.house} triggers rapid mood shifts, self-doubt, and restless nights.`, hi: `मन का कारक चन्द्रमा ${moon.house}वें भाव में होकर मन में अशांति पैदा करता है।`, te: `చంద్రుడు ${moon.house}వ స్థానంలో ఉండి చంచలతను కలిగిస్తాడు.`, ta: `சந்திரன் ${moon.house}ல் இருந்து மன அமைதியை குறைக்கிறார்.` },
      house: moon.house,
      impact: { kn: "ಅನಿಶ್ಚಿತತೆ, ಅತಿಯಾದ ಸಂವೇದನಾಶೀಲತೆ.", en: "Overthinking, sleep dips, sensitive temperament.", hi: "अति-संवेदनशीलता एवं अनिद्रा।", te: "నిద్రలేమి, అధిక ఆలోచన.", ta: "தூக்கமின்மை, மன அழுத்தம்." }
    });
  }

  if (isSaturnAfflicted && saturn) {
    afflictionFactors.push({
      graha: PlanetName.Saturn,
      title: { kn: "ಶನಿ ಗ್ರಹ ಪ್ರಭಾವ / ವಿಳಂಬ ಕಾರಕ", en: "Saturn Heavy Karmic Resistance", hi: "शनि ग्रह का भार / विलंब", te: "శని ప్రభావం", ta: "சனி பகவான் தாக்கம்" },
      reason: { kn: `ಶನಿಯು ${saturn.house} ನೇ ಭಾವದಲ್ಲಿದ್ದು ಕಾರ್ಯಗಳಲ್ಲಿ ನಿಧಾನಗತಿ ಹಾಗೂ ಶ್ರಮದಾಯಕ ಸ್ಥಿತಿಯನ್ನು ತರುತ್ತಾನೆ.`, en: `Saturn placed in House ${saturn.house} demands intense patience and delays quick breakthroughs.`, hi: `शनि ${saturn.house}वें भाव में रहकर कार्यों में रुकावट डालता है।`, te: `శని ${saturn.house}వ భావంలో ఉండి ఆలస్యం చేస్తాడు.`, ta: `சனி ${saturn.house}ல் இருந்து தடைகளை உருவாக்குகிறார்.` },
      house: saturn.house,
      impact: { kn: "ಕಾರ್ಯ ವಿಳಂಬ, ಮಾನಸಿಕ ಆಯಾಸ.", en: "Prolonged delays, exhaustion, career test of endurance.", hi: "मानसिक थकान एवं देरी।", te: "శ్రమ, ఆటంకాలు.", ta: "உடல் சோர்வு, தாமதம்." }
    });
  }

  if (rahu && (rahu.house === 1 || rahu.house === 7 || rahu.house === 8)) {
    afflictionFactors.push({
      graha: PlanetName.Rahu,
      title: { kn: "ರಾಹು ಅಧಿಷ್ಠಾನ / ಭ್ರಮೆ & ಆತಂಕ", en: "Rahu Illusion & Disquiet Axis", hi: "राहु छाया प्रभाव / भ्रम", te: "రాహు ప్రభావం", ta: "ராகு தாக்கம்" },
      reason: { kn: `ರಾಹುವು ${rahu.house} ನೇ ಮನೆಯಲ್ಲಿ ಸ್ಥಿತನಾಗಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳನ್ನು ನೀಡುತ್ತಾನೆ.`, en: `Rahu on the ${rahu.house} axis creates sudden phantom anxieties and restless ambitions.`, hi: `राहु ${rahu.house}वें भाव में होकर मन में भ्रम उत्पन्न करता है।`, te: `రాహువు ${rahu.house}వ స్థానంలో ఉండి చికాకు కలిగిస్తాడు.`, ta: `ராகு ${rahu.house}ம் இடத்தில் இருந்து குழப்பம் தருகிறார்.` },
      house: rahu.house,
      impact: { kn: "ಸ್ಪಷ್ಟತೆಯ ಕೊರತೆ, ಆತಂಕ.", en: "Temporary confusion, sudden bursts of desire followed by burnout.", hi: "अनिर्णय की स्थिति।", te: "స్పష్టత లేకపోవడం.", ta: "குழப்பமான மனநிலை." }
    });
  }

  // 2. Instant Anger & Stress Calming Protocol
  const instantCalmingProtocol = {
    title: {
      kn: "⚡ ತಕ್ಷಣ ಕೋಪ & ಆವೇಶ ಶಮನಗೊಳಿಸುವ ೪-ಹಂತದ ತತ್ತ್ವ",
      en: "⚡ 4-Step Instant Anger & Temper Pacification Protocol",
      hi: "⚡ तत्काल क्रोध एवं उत्तेजना शमन हेतु ४-चरणीय विधि",
      te: "⚡ తక్షణ కోపం & ఆవేశ నివారణ 4-దశల విధానం",
      ta: "⚡ உடனடி கோபத்தை தணிக்கும் 4-படிமுறை விதிகள்"
    },
    subtitle: {
      kn: "ಯಾವುದೇ ಸಂದರ್ಭದಲ್ಲಿ ಕೋಪ, ಕಿರಿಕಿರಿ ಅಥವಾ ರೇಗಾಟ ಉಂಟಾದ ತಕ್ಷಣ ಈ ೪ ಕ್ರಮಗಳನ್ನು ತಪ್ಪದೇ ಪಾಲಿಸಿ:",
      en: "Whenever sudden anger, irritation, or confrontation strikes, strictly execute these 4 immediate actions:",
      hi: "जब भी अत्यधिक क्रोध या तनाव महसूस हो, तुरंत इन ४ चरणों का पालन करें:",
      te: "కోపం వచ్చిన వెంటనే ఈ 4 పద్ధతులను అనుసరించండి:",
      ta: "திடீர் கோபம் வரும்போது உடனடியாக இந்த 4 படிகளை பின்பற்றவும்:"
    },
    steps: [
      {
        stepNumber: 1,
        icon: "💧",
        name: { kn: "೧. ಜಲ ತತ್ತ್ವ ಉಪಶಮನ", en: "1. Cool Water Ingestion & Face Splash", hi: "१. शीतल जल सेवन एवं स्पर्श", te: "1. చల్లని నీటి సేవనం", ta: "1. குளிர்ந்த நீர் அருந்துதல்" },
        action: { kn: "ಬೆಳ್ಳಿ ಅಥವಾ ತಾಮ್ರದ ಪಾತ್ರೆಯ ಶುದ್ಧ ತಂಪಾದ ನೀರನ್ನು ಕುಡಿಯಿರಿ.", en: "Drink 1 glass of cool water from a silver or copper cup.", hi: "तांबे या चांदी के पात्र से एक गिलास शीतल जल पिएं।", te: "వెండి లేదా రాగి పాత్రలోని చల్లని నీరు త్రాగండి.", ta: "வெள்ளி அல்லது செம்பு பாத்திரத்தில் நீர் அருந்தவும்." },
        detail: { kn: "ಮುಖ, ಕಣ್ಣುಗಳು ಹಾಗೂ ಕುತ್ತಿಗೆಯ ಹಿಂಭಾಗಕ್ಕೆ ತಣ್ಣೀರು ಚಿಮುಕಿಸಿ. ಇದು ದೇಹದೊಳಗಿನ ಪಿತ್ತ-ಅಗ್ನಿಯನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಶಮನಗೊಳಿಸುತ್ತದೆ.", en: "Splash water on eyes, forehead, and nape of neck. This immediately drops sympathetic Pitta surges and cools the brain stem.", hi: "आंखों और गर्दन के पीछे शीतल जल छिड़कें। यह आंतरिक पित्त को तुरंत शांत करता है।", te: "కళ్ళు, ముఖంపై చల్లని నీరు చల్లుకోండి. ఇది పిత్తాన్ని తగ్గిస్తుంది.", ta: "முகம் மற்றும் கண்களில் குளிர்ந்த நீர் தெளிக்கவும்." },
        duration: { kn: "೩೦ ಸೆಕೆಂಡುಗಳು", en: "30 Seconds", hi: "३० सेकंड", te: "30 సెకన్లు", ta: "30 வினாடிகள்" }
      },
      {
        stepNumber: 2,
        icon: "🌬️",
        name: { kn: "೨. ಚಂದ್ರ ಭೇದನ ಪ್ರಾಣಾಯಾಮ", en: "2. Chandra Bhedana Left-Nostril Breath", hi: "२. चन्द्र भेदन प्राणायाम", te: "2. చంద్ర భేదన ప్రాణాయామం", ta: "2. சந்திர பேதன பிராணாயாமம்" },
        action: { kn: "ಬಲ ಮೂಗಿನ ಹೊಳ್ಳೆಯನ್ನು ಮುಚ್ಚಿ, ಎಡ ಮೂಗಿನಿಂದ ಮಾತ್ರ ದೀರ್ಘವಾಗಿ ಉಸಿರೆಳೆದುಕೊಳ್ಳಿ.", en: "Close right nostril with right thumb; inhale deeply through left nostril for 4s, exhale right for 6s.", hi: "दाहिने नथुने को बंद कर केवल बाएं नथुने (इड़ा नाड़ी) से श्वास लें।", te: "ఎడమ నాసిక ద్వారా మాత్రమే శ్వాస తీసుకోండి.", ta: "இடது நாசி வழியாக மட்டும் மூச்சை இழுத்து விடவும்." },
        detail: { kn: "೫ ರಿಂದ ೭ ಬಾರಿ ಎಡ ಹೊಳ್ಳೆಯಿಂದ ಉಸಿರಾಡಿ. ಇದು ಇಡಾ ನಾಡಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ಹೃದಯ ಬಡಿತವನ್ನು ತಕ್ಷಣ ಶಾಂತಗೊಳಿಸುತ್ತದೆ.", en: "Repeat 5 to 7 cycles. Activates the parasympathetic lunar channel (Ida Nadi) to decelerate heart rate instantly.", hi: "५ से ७ बार यह प्राणायाम करें। यह मन को तुरंत शांत करता है।", te: "5-7 సార్లు చేయండి. ఇది మనస్సును ప్రశాంతపరుస్తుంది.", ta: "5-7 முறை செய்யவும். இது நாடி துடிப்பை சீராக்கும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 3,
        icon: "🤫",
        name: { kn: "೩. ೩-ನಿಮಿಷಗಳ ಕಡ್ಡಾಯ ಮೌನ ವ್ರತ", en: "3. Sacred 3-Minute Silence Pause", hi: "३. तीन मिनट का अनिवार्य मौन", te: "3. 3 నిమిషాల తప్పనిసరి మౌనం", ta: "3. 3 நிமிட கட்டாய மௌனம்" },
        action: { kn: "ಕೋಪ ಬಂದಾಗ ಯಾವುದೇ ಮಾತು ಆಡಬೇಡಿ, ಕನಿಷ್ಠ ೩ ನಿಮಿಷ ಮೌನವಾಗಿರಿ.", en: "Do not utter a single word or type any reply for 3 full minutes.", hi: "क्रोध की अवस्था में ३ मिनट तक बिल्कुल मौन रहें, कोई प्रतिक्रिया न दें।", te: "3 నిమిషాల పాటు ఎలాంటి మాటా మాట్లాడవద్దు.", ta: "3 நிமிடங்களுக்கு எந்த பதிலும் பேசாமல் அமைதியாக இருக்கவும்." },
        detail: { kn: "ಆವೇಶದ ಸ್ಥಿತಿಯಲ್ಲಿ ನಾಲಿಗೆಯಿಂದ ಹೊರಡುವ ಮಾತುಗಳು ಅನಾಹುತಕ್ಕೆ ಕಾರಣ. ಈ ಸಮಯದಲ್ಲಿ ಉತ್ತರ ಅಥವಾ ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡಿ ಕುಳಿತುಕೊಳ್ಳಿ.", en: "Turn away from the South direction; face North or East. Let the cortical adrenaline wave subside completely before making decisions.", hi: "उत्तर या पूर्व दिशा की ओर मुख करके बैठें।", te: "ఉత్తరం లేదా తూర్పు వైపునకు తిరిగి కూర్చోండి.", ta: "வடக்கு அல்லது கிழக்கு நோக்கி அமரவும்." },
        duration: { kn: "೩ ನಿಮಿಷಗಳು", en: "3 Minutes", hi: "३ मिनट", te: "3 నిమిషాలు", ta: "3 நிமிடங்கள்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಆಪತ್ಕಾಲೀನ ಶಾಂತಿ ಬೀಜ ಮಂತ್ರ", en: "4. Mental Chandra-Shanti Beeja Japa", hi: "४. मानसिक चन्द्र-शान्ति बीज जप", te: "4. మానసిక బీజ మంత్ర జపం", ta: "4. மனதிற்குள் பீஜ மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ 'ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ' ಅಥವಾ 'ಓಂ ಶಾಂತಾಯ ನಮಃ' ಜಪಿಸಿ.", en: "Silently recite the soothing cooling mantra 11 times.", hi: "मन ही मन 'ॐ सों सोमाय नमः' अथवा 'ॐ शान्ताय नमः' का ११ बार जप करें।", te: "మనస్సులో 'ఓం సోం సోమాయ నమః' అని 11 సార్లు జపించండి.", ta: "மனதில் 'ஓம் சோம் சோமாய நமஹ' என 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಕಣ್ಣು ಮುಚ್ಚಿ ಕಂಠ ಮತ್ತು ಹಣೆ ಭಾಗದಲ್ಲಿ ತಂಪಾದ ಬೆಳದಿಂಗಳನ್ನು ಭಾವಿಸಿ ಜಪಿಸುವುದರಿಂದ ಕೋಪವು ಸಂಪೂರ್ಣ ಶಮನವಾಗುತ್ತದೆ.", en: "Visualize cool silvery moonlight washing over the throat (Vishuddha) and brow center (Ajna), dousing internal fire.", hi: "नेत्र बंद कर चन्द्रमा के शीतल प्रकाश का ध्यान करते हुए जप करें।", te: "చల్లని వెన్నెల కాంతిని భావిస్తూ జపించండి.", ta: "நெற்றியில் குளிர்ந்த நிலவொளியை தியானித்து ஜெபிக்கவும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      }
    ],
    emergencyBeejaMantra: {
      sanskrit: "॥ ॐ सों सोमाय नमः । ॐ शान्तशान्ताय शिवप्रियाय नमः ॥",
      kannada: "॥ ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ । ಓಂ ಶಾಂತಶಾಂತಾಯ ಶಿವಪ್ರಿಯಾಯ ನಮಃ ॥",
      telugu: "॥ ఓం సోం సోమాయ నమః । ఓం శాంతశాంతాయ శివప్రియాయ నమః ॥",
      tamil: "॥ ஓம் சோம் சோமாய நமஹ । ஓம் சாந்தசாந்தாய சிவப்ரியாய நமஹ ॥",
      hindi: "॥ ॐ सों सोमाय नमः । ॐ शान्तशान्ताय शिवप्रियाय नमः ॥",
      transliteration: "Om Som Somaya Namaha | Om Shanta-Shantaya Shiva-Priyaya Namaha",
      meaning: {
        kn: "ಪರಮ ಶಾಂತ ಸ್ವರೂಪನಾದ ಚಂದ್ರ ಹಾಗೂ ಶಿವನ ಅನುಗ್ರಹದಿಂದ ನನ್ನ ಮನಸ್ಸಿನ ಸಮಸ್ತ ಕ್ರೋಧ ಹಾಗೂ ಉದ್ವೇಗಗಳು ಶಾಂತವಾಗಲಿ.",
        en: "May the divine cooling lunar grace of Lord Soma and Lord Shiva extinguish all inner rage and bestow eternal tranquility.",
        hi: "परम शांति स्वरूप चन्द्रमा एवं भगवान शिव की कृपा से मेरा समस्त क्रोध और उद्वेग शांत हो।",
        te: "చంద్రుని మరియు పరమశివుని అనుగ్రహంతో నా కోపం శాంతించుగాక.",
        ta: "சந்திரன் மற்றும் சிவபெருமானின் அருளால் எனது கோபம் தணிந்து அமைதி உண்டாகட்டும்."
      },
      japaCount: {
        kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ (ಮನಸ್ಸಿನಲ್ಲೇ ಜಪಿಸಿ)",
        en: "11 or 21 Times (Silently in mind)",
        hi: "११ अथवा २१ बार (मानसिक जप)",
        te: "11 లేదా 21 సార్లు (మనస్సులో)",
        ta: "11 அல்லது 21 முறை (மனதில்)"
      }
    }
  };

  // 3. Daily Morning & Evening Routine
  const dailyPacificationRoutine = {
    morning: [
      {
        time: "06:00 AM - 07:00 AM",
        icon: "🌅",
        title: { kn: "ಸೂರ್ಯ ನಮಸ್ಕಾರ & ಗಾಯತ್ರೀ ಜಪ", en: "Surya Arghya & Gayatri Japa", hi: "सूर्य अर्घ्य एवं गायत्री जप", te: "సూర్య అర్ఘ్యం & గాయత్రీ జపం", ta: "சூரிய அர்க்கியம் & காயத்ரி ஜபம்" },
        desc: { kn: "ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು, ಕೆಂಪು ಹೂವು ಮತ್ತು ಅಕ್ಷತೆ ಹಾಕಿ ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಘ್ಯ ಅರ್ಪಿಸಿ, ೨೪ ಬಾರಿ ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪಿಸಿ.", en: "Offer water mixed with red flowers/kumkum to the rising Sun; chant Gayatri Mantra 24 times facing East.", hi: "सूर्य देव को तांबे के लोटे से जल अर्पित करें एवं २४ बार गायत्री मंत्र का जप करें।", te: "సూర్యునికి అర్ఘ్యం సమర్పించి 24 సార్లు గాయత్రీ మంత్రం జపించండి.", ta: "சூரியனுக்கு நீர் சமர்ப்பித்து 24 முறை காயத்ரி மந்திரம் சொல்லவும்." }
      },
      {
        time: "07:30 AM",
        icon: "🥛",
        title: { kn: "ಪಿತ್ತ ಶಮನಕಾರಿ ದ್ರವ್ಯ ಸೇವನೆ", en: "Pitta Cooling Herbal Drink", hi: "पित्त शामक पेय सेवन", te: "పిత్త శమన పానీయం", ta: "பித்த சாந்தி பானம்" },
        desc: { kn: "ಬೆಳಗ್ಗೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ೧ ಚಮಚ ಶುದ್ಧ ಆಕಳ ತುಪ್ಪ ಅಥವಾ ಸೋಂಪು ಕಾಳು ನೆನೆಸಿದ ನೀರು ಕುಡಿಯುವುದು ಪಿತ್ತ ಹಾಗೂ ಕೋಪವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.", en: "Consume 1 tsp pure Desi Cow Ghee or fennel-infused water on empty stomach to pacify internal digestive and mental heat.", hi: "प्रातः खाली पेट १ चम्मच देशी गाय का घी अथवा सौंफ का पानी पिएं।", te: "ఉదయం ఆవు నెయ్యి లేదా సోంపు నీరు సేవించండి.", ta: "காலையில் வெறும் வயிற்றில் பசு நெய் அல்லது சோம்பு நீர் அருந்தவும்." }
      }
    ],
    afternoonLifestyle: [
      {
        icon: "🥗",
        title: { kn: "ಸಾತ್ವಿಕ ಆಹಾರ ನಿಯಮ", en: "Cooling Satvic Food Discipline", hi: "सात्विक आहार नियम", te: "సాత్విక ఆహార నియమం", ta: "சாத்வீக உணவு முறை" },
        desc: { kn: "ಅತಿಯಾದ ಖಾರ, ಹುಳಿ, ಮಸಾಲೆ ಹಾಗೂ ಎಣ್ಣೆ ಪದಾರ್ಥಗಳನ್ನು ತ್ಯಜಿಸಿ. ಮಧ್ಯಾಹ್ನ ತಂಪಾದ ಮಜ್ಜಿಗೆ (ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಹಾಕಿ) ಸೇವಿಸಿ.", en: "Avoid excessively spicy, pungent, acidic and fried foods. Drink fresh spiced buttermilk with coriander at noon.", hi: "अधिक मिर्च, खटाई और तले हुए भोजन से बचें। दोपहर में ताजी छाछ पिएं।", te: "అధిక కారం, పులుపు వస్తువులను తగ్గించండి. మధ్యాహ్నం మజ్జిగ త్రాగండి.", ta: "அதிக காரம், புளிப்பு உணவுகளை தவிர்க்கவும். மோர் பருகவும்." }
      },
      {
        icon: "🧭",
        title: { kn: "ದಿಕ್ಪಾಲಕ ಸ್ಥಿತಿ ಹಾಗೂ ವಿವೇಕ", en: "Compassionate Seating Alignment", hi: "दिशा संरेखण", te: "దిశా నియమం", ta: "திசை அமைப்பு" },
        desc: { kn: "ಕೆಲಸ ಮಾಡುವಾಗ ಅಥವಾ ವಿಶ್ರಾಂತಿ ಪಡೆಯುವಾಗ ದಕ್ಷಿಣ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ, ಯಾವಾಗಲೂ ಉತ್ತರ ಅಥವಾ ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡಿ.", en: "Face North or East while working and making crucial decisions; avoid facing direct South during heated discussions.", hi: "कार्य करते समय मुख उत्तर अथवा पूर्व दिशा में रखें।", te: "పనిచేసేటప్పుడు ఉత్తరం లేదా తూర్పు వైపు ముఖం పెట్టండి.", ta: "வேலை செய்யும் போது வடக்கு அல்லது கிழக்கு நோக்கி அமரவும்." }
      }
    ],
    evening: [
      {
        time: "06:30 PM - 07:30 PM",
        icon: "🪔",
        title: { kn: "ಸಂಧ್ಯಾ ದೀಪಾರಾಧನೆ & ಸ್ತೋತ್ರ ಪಠಣ", en: "Evening Deepa & Stotra Recitation", hi: "संध्या दीप प्रज्वलन एवं स्तोत्र पाठ", te: "సంధ్యా దీపారాధన & స్తోత్ర పఠనం", ta: "மாலை தீபாராதனை & ஸ்தோத்திரம்" },
        desc: { kn: "ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ಎಳ್ಳೆಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ, ನಿಯೋಜಿತ ಸ್ತೋತ್ರವನ್ನು ಶಾಂತಚಿತ್ತದಿಂದ ಪಠಿಸಿ.", en: "Light a sesame oil or ghee lamp at twilight; sit facing North and recite the designated personalized Stotra.", hi: "संध्या समय तिल के तेल अथवा घी का दीपक जलाकर निर्धारित स्तोत्र का पाठ करें।", te: "నువ్వుల నూనె లేదా నెయ్యి దీపం వెలిగించి స్తోత్రం చదవండి.", ta: "நல்லெண்ணெய் அல்லது நெய் தீபம் ஏற்றி ஸ்தோத்திரம் படிக்கவும்." }
      },
      {
        time: "09:30 PM",
        icon: "🌙",
        title: { kn: "ರಾತ್ರಿ ಶಾಂತಿ ಧ್ಯಾನ & ಶಯನ ನಿಯಮ", en: "Night Peace Meditation & Sleep Alignment", hi: "रात्रि शांति ध्यान एवं शयन नियम", te: "రాత్రి శాంతి ధ్యానం", ta: "இரவு சாந்தி தியானம்" },
        desc: { kn: "ಮಲಗುವ ಮುನ್ನ ೫ ನಿಮಿಷ ಕೈ-ಕಾಲು ತೊಳೆದು, ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣಕ್ಕೆ ತಲೆ ಇಟ್ಟು ಮಲಗಿ. ಮಲಗುವಾಗ ಮೊಬೈಲ್ ನೋಡದೆ ಶಿವನಾಮ ಸ್ಮರಿಸಿ.", en: "Wash feet with cool water; align head towards East or South during sleep; meditate on Lord Shiva before slumber.", hi: "सोने से पूर्व हाथ-पैर धोकर पूर्व या दक्षिण दिशा में सिर रखकर सोएं।", te: "పడుకునే ముందు కాళ్ళు కడుక్కుని తూర్పు వైపు తలపెట్టి నిద్రించండి.", ta: "தூங்குவதற்கு முன் கிழக்கு நோக்கி தலை வைத்து படுக்கவும்." }
      }
    ]
  };

  // 4. Curate Personalized Stotras based on chart afflictions
  const personalizedStotras = [];

  if (krodhaLevel >= 60 || isMarsAfflicted) {
    personalizedStotras.push({
      id: "chandrashekhara_ashtakam",
      title: {
        kn: "ಶ್ರೀ ಚಂದ್ರಶೇಖರಾಷ್ಟಕಂ (ಕ್ರೋಧ & ಶತ್ರು ಭಯ ನಿವಾರಕ)",
        en: "Shri Chandrashekhara Ashtakam (Anger & Fear Pacifier)",
        hi: "श्री चन्द्रशेखराष्टकम् (क्रोध एवं भय नाशक)",
        te: "శ్రీ చంద్రశేఖరాష్టకం (క్రోధ నివారణ)",
        ta: "ஸ்ரீ சந்திரசேகராஷ்டகம் (கோப சாந்தி)"
      },
      dedicatedTo: { kn: "ಶ್ರೀ ಮಹಾದೇವ (ಚಂದ್ರಮೌಳೀಶ್ವರ)", en: "Lord Shiva (Chandrashekhara)", hi: "भगवान शिव", te: "పరమశివుడు", ta: "சிவபெருமான்" },
      shlokaSanskrit: `चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर पाहि माम् ।
चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर रक्ष माम् ॥
रत्नसानुशरासनं रजताद्रिश्रृङ्गनिकेतनं
शिञ्जिनीकृतपन्नगेश्वरमच्युतानलसायकम् ।
क्षिप्रदग्धपुरत्रयं त्रिदिवेश्वरैरभिवन्दितं
चन्द्रशेखरमाश्रये मम किं करिष्यति वै यमः ॥`,
      shlokaKannada: `ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ಪಾಹಿ ಮಾಮ್ ।
ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ರಕ್ಷ ಮಾಮ್ ॥
ರತ್ನಸಾನುಶರಾಸನಂ ರಜತಾದ್ರಿಶೃಂಗನಿಕೇತನಂ
ಶಿಞ್ಜಿನೀಕೃತಪನ್ನಗೇಶ್ವರಮಚ್ಯುತಾನಲಸಾಯಕಮ್ ।
ಕ್ಷಿಪ್ರದಗ್ಧಪುರತ್ರಯಂ ತ್ರಿದಿವೇಶ್ವರೈರಭಿವಂದಿತಂ
ಚಂದ್ರಶೇಖರಮಾಶ್ರಯೇ ಮಮ ಕಿಂ ಕರಿಷ್ಯತಿ ವೈ ಯಮಃ ॥`,
      shlokaTelugu: `చంద్రశేఖర చంద్రశేఖర చంద్రశేఖర పాహి మామ్ ।
చంద్రశేఖర చంద్రశేఖర చంద్రశేఖర రక్ష మామ్ ॥
రత్నసానుశరాసనం రజతాద్రిశృంగనికేతనం
శింజినీకృతపన్నగేశ్వరమచ్యుతానలసాయకమ్ ।
క్షిప్రదగ్ధపురత్రయం త్రిదివేశ్వరైరభివందితం
చంద్రశేఖరమాశ్రయే మమ కిం కరిష్యతి వై యమః ॥`,
      shlokaTamil: `சந்த்ரசேகர சந்த்ரசேகர சந்த்ரசேகர பாஹி மாம் ।
சந்த்ரசேகர சந்த்ரசேகர சந்த்ரசேகர ரக்ஷ மாம் ॥
ரத்னஸானுசராஸனம் ரஜதாத்ரிச்ரும்கநிகேதனம்
சிஞ்ஜினீக்ருதபன்னகேச்வரமச்யுதானலஸாயகம் ।
க்ஷிப்ரதக்தபுரத்ரயம் த்ரிதிவேச்வரைரபிவந்திதம்
சந்த்ரசேகரமாச்ரயே மம கிம் கரிஷ்யதி வை யமஃ ॥`,
      shlokaHindi: `चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर पाहि माम् ।
चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर रक्ष माम् ॥
रत्नसानुशरासनं रजताद्रिश्रृङ्गनिकेतनं
शिञ्जिनीकृतपन्नगेश्वरमच्युतानलसायकम् ।
क्षिप्रदग्धपुरत्रयं त्रिदिवेश्वरैरभिवन्दितं
चन्द्रशेखरमाश्रये मम किं करिष्यति वै यमः ॥`,
      transliteration: "Chandrashekhara Chandrashekhara Chandrashekhara Pahi Mam | Chandrashekhara Chandrashekhara Chandrashekhara Raksha Mam || Ratnasana Sharāsanaṁ Rajatādri Shringa Nikētanaṁ...",
      meaning: {
        kn: "ಶಿರದಲ್ಲಿ ತಂಪಾದ ಚಂದ್ರನನ್ನು ಧರಿಸಿದ ಹೇ ಚಂದ್ರಶೇಖರ ಮಹಾದೇವನೇ, ನನ್ನ ಮನಸ್ಸಿನ ಸಮಸ್ತ ಕ್ರೋಧ, ತಾಪ, ಅಹಂಕಾರ ಮತ್ತು ಆಪತ್ತುಗಳಿಂದ ನನ್ನನ್ನು ಸದಾ ಕಾಪಾಡು.",
        en: "O Lord Chandrashekhara, who adorns the cooling crescent moon on Thy brow, extinguish all fiery passions, anger, and mortality fear within me.",
        hi: "मस्तक पर शीतल चन्द्रमा धारण करने वाले हे भगवान शिव, मेरे समस्त क्रोध और संताप को हरकर मेरी रक्षा करें।",
        te: "చంద్రుని ధరించిన ఓ పరమశివా, నాలోని కోపాన్ని హరించి నన్ను రక్షించు.",
        ta: "தலையில் சந்திரனை சூடிய சிவபெருமானே, என் கோபத்தை தணித்து காத்தருள்வீராக."
      },
      spiritualBenefits: {
        kn: "ಪ್ರತಿದಿನ ಪಠಿಸುವುದರಿಂದ ರಕ್ತದೊತ್ತಡ, ತೀವ್ರ ಕೋಪ, ಶತ್ರು ಬಾಧೆ ಮತ್ತು ಅಪಮೃತ್ಯು ಭಯ ನಿವಾರಣೆಯಾಗಿ ಅಖಂಡ ಮನಶ್ಶಾಂತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
        en: "Instantly pacifies high blood pressure, explosive temper, enemy fears, and bestows profound serenity.",
        hi: "रक्तचाप, तीव्र क्रोध और भय का नाश होकर परम शांति प्राप्त होती है।",
        te: "కోపం తగ్గి సంపూర్ణ మనశ్శాంతి లభిస్తుంది.",
        ta: "கோபத்தை குறைத்து பூரண மன அமைதியை தரும்."
      },
      bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಅಥವಾ ಕೋಪ ಬಂದ ತಕ್ಷಣ", en: "Daily evening during twilight (Pradosha) or when feeling agitated", hi: "प्रतिदिन संध्या समय अथवा क्रोध आने पर", te: "ప్రతిరోజు సాయంత్రం లేదా కోపం వచ్చినప్పుడు", ta: "மாலை நேரத்தில் அல்லது கோபம் வரும்போது" },
      facingDirection: { kn: "ಉತ್ತರ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು", en: "North or East", hi: "उत्तर अथवा पूर्व दिशा", te: "ఉత్తరం లేదా తూర్పు దిశ", ta: "வடக்கு அல்லது கிழக்கு திசை" },
      recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೩ ಬಾರಿ", en: "1 to 3 Times Daily", hi: "प्रतिदिन १ से ३ बार", te: "రోజుకు 1 నుండి 3 సార్లు", ta: "தினமும் 1 முதல் 3 முறை" }
    });
  }

  personalizedStotras.push({
    id: "aditya_hrudayam",
    title: {
      kn: "ಶ್ರೀ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರಮ್ (ಆತ್ಮಬಲ & ವಿಜಯ ಸಿದ್ಧಿ)",
      en: "Shri Aditya Hrudayam (Vitality & All-Obstacle Conquest)",
      hi: "श्री आदित्य हृदय स्तोत्रम् (आत्मबल एवं विजय)",
      te: "శ్రీ ఆదిత్య హృదయ స్తోత్రం",
      ta: "ஸ்ரீ ஆதித்ய ஹ்ருதயம்"
    },
    dedicatedTo: { kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ", en: "Lord Surya Narayana", hi: "भगवान सूर्य", te: "సూర్య భగవానుడు", ta: "சூரிய பகவான்" },
    shlokaSanskrit: `ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।
रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥
दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम् ।
उपागम्याब्रवीद्राममगस्त्यो भगवानृषिः ॥
आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् ।
जयावहं जपेन्नित्यमक्षयं परमं शिवम् ॥`,
    shlokaKannada: `ತತೋ ಯುದ್ಧಪರಿಶ್ರಾಂತಂ ಸಮರೇ ಚಿಂತಯಾ ಸ್ಥಿತಮ್ ।
ರಾವಣಂ ಚಾಗ್ರತೋ ದೃಷ್ಟ್ವಾ ಯುದ್ಧಾಯ ಸಮುಪಸ್ಥಿತಮ್ ॥
ದೈವತೈಶ್ಚ ಸಮಾಗಮ್ಯ ದ್ರಷ್ಟುಮಭ್ಯಾಗತೋ ರಣಮ್ ।
ಉಪಾಗಮ್ಯಾಬ್ರವೀದ್ರಾಮಮಗಸ್ತ್ಯೋ ಭಗವಾನೃಷಿಃ ॥
ಆದಿತ್ಯಹೃದಯಂ ಪುಣ್ಯಂ ಸರ್ವಶತ್ರುವಿನಾಶನಮ್ ।
ಜಯಾವಹಂ ಜಪೇನ್ನಿತ್ಯಮಕ್ಷಯಂ ಪರಮಂ ಶಿವಮ್ ॥`,
    shlokaTelugu: `తతో యుద్ధపరిశ్రాంతం సమరే చింతయా స్థితమ్ ।
రావణం చాగ్రతో దృష్ట్వా యుద్ధాయ సముపస్థితమ్ ॥
దైవతైశ్చ సమాగమ్య ద్రష్టుమభ్యాగతో రణమ్ ।
ఉపాగమ్యాబ్రవీద్రామమగస్త్యో భగవానృషిః ॥
ఆదిత్యహృదయం పుణ్యం సర్వశత్రువినాశనమ్ ।
జయావహం జపేన్నిత్యమక్షయం పరమం శివమ్ ॥`,
    shlokaTamil: `ததோ யுத்தபரிச்ராந்தம் ஸமரே சிந்தயா ஸ்திதம் ।
ராவணம் சாக்ரதோ த்ருஷ்ட்வா யுத்தாய ஸமுபஸ்திதம் ॥
தைவதைச்ச ஸமாகம்ய த்ரஷ்டுமப்யாகதோ ரணம் ।
உபாகம்யாப்ரவீத்ராமமகஸ்த்யோ பகவான்குஷிஃ ॥
ஆதித்யஹ்ருதயம் புண்யம் ஸர்வசத்ருவினாசனம் ।
ஜயாவஹம் ஜபேந்நித்யமக்ஷயம் பரமம் சிவம் ॥`,
    shlokaHindi: `ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।
रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥
दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम् ।
उपागम्याब्रवीद्राममगस्त्यो भगवानृषिः ॥
आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् ।
जयावहं जपेन्नित्यमक्षयं परमं शिवम् ॥`,
    transliteration: "Tato Yuddha Parishrāntaṁ Samarē Chintayā Sthitam | Rāvaṇaṁ Chāgrato Dṛṣṭvā Yuddhāya Samupasthitam || Ādityahṛdayaṁ Puṇyaṁ Sarva Shatru Vināshanam...",
    meaning: {
      kn: "ಸರ್ವ ಶತ್ರುಗಳನ್ನು ಮತ್ತು ಆಂತರಿಕ ನಕಾರಾತ್ಮಕತೆಯನ್ನು ಭಸ್ಮ ಮಾಡಿ ವಿಜಯ ಹಾಗೂ ಆರೋಗ್ಯವನ್ನು ನೀಡುವ ಪರಮ ಪವಿತ್ರವಾದ ಆದಿತ್ಯ ಹೃದಯವನ್ನು ನಿತ್ಯವೂ ಜಪಿಸಿ.",
      en: "Recite the all-auspicious Aditya Hrudayam, which destroys all internal and external foes, ensuring absolute triumph, vitality, and brilliance.",
      hi: "समस्त शत्रुओं एवं नकारात्मकताओं का नाश करने वाले परम पावन आदित्य हृदय का नित्य पाठ करें।",
      te: "సర్వ శత్రువులను నాశనం చేసి విజయాన్ని అందించే ఆదిత్య హృదయాన్ని నిత్యం జపించండి.",
      ta: "எல்லா எதிர்ப்புகளையும் நீக்கி வெற்றி தரும் ஆதித்ய ஹ்ருதயத்தை தினமும் படிக்கவும்."
    },
    spiritualBenefits: {
      kn: "ಆರೋಗ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ, ಕಣ್ಣಿನ ತೇಜಸ್ಸು ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ಗೌರವ ವೃದ್ಧಿಸುತ್ತದೆ.",
      en: "Enhances leadership vitality, eyesight luster, immune strength, and removes chronic fatigue.",
      hi: "आत्मबल, तेज, स्वास्थ्य एवं कार्यक्षेत्र में सफलता प्रदान करता है।",
      te: "ఆరోగ్యం, ఆత్మవిశ్వాసం మరియు కీర్తి పెరుగుతుంది.",
      ta: "ஆரோக்கியம், தைரியம் மற்றும் புகழ் பெருகும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ (ಭಾನುವಾರ ವಿಶೇಷ)", en: "Daily at sunrise (especially on Sundays)", hi: "प्रतिदिन सूर्योदय के समय (रविवार को विशेष)", te: "ప్రతిరోజు సూర్యోదయ సమయంలో", ta: "தினமும் சூரிய உதய வேளையில்" },
    facingDirection: { kn: "ಪೂರ್ವ ದಿಕ್ಕು", en: "East", hi: "पूर्व दिशा", te: "తూర్పు దిశ", ta: "கிழக்கு திசை" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೩ ಬಾರಿ", en: "1 to 3 Times Daily", hi: "प्रतिदिन १ से ३ बार", te: "రోజుకు 1 నుండి 3 సార్లు", ta: "தினமும் 1 முதல் 3 முறை" }
  });

  personalizedStotras.push({
    id: "hanuman_sankata_mochana",
    title: {
      kn: "ಸಂಕಟಮೋಚನ ಹನುಮಾನಾಷ್ಟಕಮ್ (ಸರ್ವ ಸಂಕಟ ನಿವಾರಕ)",
      en: "Sankata Mochana Hanuman Ashtakam (All-Crisis Destroyer)",
      hi: "संकटमोचन हनुमानाष्टकम् (सर्व संकट नाशक)",
      te: "సంకటమోచన హనుమానాష్టకం",
      ta: "சங்கடமோசன ஹனுமனாஷ்டகம்"
    },
    dedicatedTo: { kn: "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ", en: "Lord Hanuman", hi: "भगवान हनुमान", te: "శ్రీ హనుమంతుడు", ta: "ஸ்ரீ ஆஞ்சநேயர்" },
    shlokaSanskrit: `बाल समय रवि भक्ष लियो तब, तीनहुं लोक भयो अंधियारों ।
ताहि सों त्रास भयो जग को, यह संकट काहु सों जात न टारो ॥
देवन आनि करी बिनती तब, छांड़ि दियो रवि कष्ट निवारो ।
को नहिं जानत है जग में कपि, संकटमोचन नाम तिहारो ॥`,
    shlokaKannada: `ಬಾಲ ಸಮಯ ರವಿ ಭಕ್ಷ ಲಿಯೋ ತಬ, ತೀನಹುಂ ಲೋಕ ಭಯೋ ಅಂಧಿಯಾರೋಂ ।
ತಾಹಿ ಸೋಂ ತ್ರಾಸ ಭಯೋ ಜಗ ಕೋ, ಯಹ ಸಂಕಟ ಕಾಹು ಸೋಂ ಜಾತ ನ ಟಾರೋ ॥
ದೇವನ ಆನಿ ಕರೀ ಬಿನತೀ ತಬ, ಛಾಂಢಿ ದಿಯೋ ರವಿ ಕಷ್ಟ ನಿವಾರೋ ।
ಕೋ ನಹಿಂ ಜಾನತ ಹೈ ಜಗ ಮೇಂ ಕಪಿ, ಸಂಕಟಮೋಚನ ನಾಮ ತಿಹಾರೋ ॥`,
    shlokaTelugu: `బాల సమయ రవి భక్ష లియో తబ, తీనహుం లోక భయో అంధియారోం ।
తాహి సోం త్రాస భయో జగ కో, యహ సంకట కాహు సోం జాత న టారో ॥
దేవన ఆని కరీ బినతీ తబ, ఛాంఢి దియో రవి కష్ట నివారో ।
కో నహిం జానత హై జగ మేం కపి, సంకటమోచన నామ తిహారో ॥`,
    shlokaTamil: `பால ஸமய ரவி பக்ஷ லியோ தப, தீனஹும் லோக பயோ அந்தியாரோம் ।
தாஹி ஸோம் த்ராஸ பயோ ஜக கோ, யஹ ஸங்கட காஹு ஸோம் ஜாத ந டாரோ ॥
தேவன ஆனி கரீ பினதீ தப, சாண்டி தியோ ரவி கஷ்ட நிவாரோ ।
கோ நஹிம் ஜானத ஹை ஜக மேம் கபி, ஸங்கடமோசன நாம திஹாரோ ॥`,
    shlokaHindi: `बाल समय रवि भक्ष लियो तब, तीनहुं लोक भयो अंधियारों ।
ताहि सों त्रास भयो जग को, यह संकट काहु सों जात न टारो ॥
देवन आनि करी बिनती तब, छांड़ि दियो रवि कष्ट निवारो ।
को नहिं जानत है जग में कपि, संकटमोचन नाम तिहारो ॥`,
    transliteration: "Bāla Samaya Ravi Bhakṣa Liyō Taba, Tīnahuṁ Lōka Bhayō Andhiyārōṁ | Tāhi Sōṁ Trāsa Bhayō Jaga Kō, Yaha Saṅkaṭa Kāhu Sōṁ Jāta Na Tārō || Kō Nahiṁ Jānata Hai Jaga Mēṁ Kapi, Saṅkaṭamōcana Nāma Tihārō ||",
    meaning: {
      kn: "ಬಾಲ ಪ್ರಾಯದಲ್ಲೇ ಸೂರ್ಯನನ್ನೇ ನುಂಗಿ ಜಗತ್ತಿನ ಕತ್ತಲೆಯನ್ನು ಹಾಗೂ ಸಮಸ್ತ ದೇವತೆಗಳ ಸಂಕಟವನ್ನು ನಿವಾರಿಸಿದ ಹೇ ಸಂಕಟಮೋಚನ ಹನುಮಂತನೇ, ನನ್ನ ಸಮಸ್ತ ಕಷ್ಟ-ವಿಘ್ನಗಳನ್ನು ಪರಿಹರಿಸು.",
      en: "O supreme Hanuman, who as a child consumed the Sun to relieve universal despair, who in this universe does not revere Thee as the Destroyer of all Crises?",
      hi: "बाल्यावस्था में ही सूर्य को ग्रसकर तीनों लोकों का कष्ट हरने वाले हे संकटमोचन हनुमान, हमारे सभी संकटों को दूर करें।",
      te: "సమస్త కష్టాలను హరించే ఓ సంకటమోచన హనుమా, మా సంకటాలను నివారించు.",
      ta: "எல்லா துன்பங்களையும் போக்கும் ஸ்ரீ ஹனுமனே, என் சங்கடங்களை தீர்த்து அருள்க."
    },
    spiritualBenefits: {
      kn: "ಶನಿ ಸಾಡೇಸಾತಿ, ಗ್ರಹದೋಷ, ದುಷ್ಟ ಶಕ್ತಿ ಹಾಗೂ ಮಾನಸಿಕ ಭಯ-ಆತಂಕಗಳನ್ನು ಸಂಪೂರ್ಣ ನಾಶಪಡಿಸುತ್ತದೆ.",
      en: "Destroys Saturn Sade-Sati afflictions, evil eye, black energies, fear of failure, and grants unwavering strength.",
      hi: "शनि साढ़ेसाती, भय, भूत-बाधा और संकटों का तत्काल निवारण करता है।",
      te: "శని దోషాలు మరియు భయాలను తొలగిస్తుంది.",
      ta: "சனி தோஷம் மற்றும் பயத்தை அடியோடு நீக்கும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಮುಸ್ಸಂಜೆ ವೇಳೆ (ಮಂಗಳವಾರ ಮತ್ತು ಶನಿವಾರ ವಿಶೇಷ)", en: "Daily evening (especially on Tuesdays and Saturdays)", hi: "प्रतिदिन सायंकाल (मंगलवार एवं शनिवार को विशेष)", te: "ప్రతిరోజు సాయంత్రం (మంగళ, శనివారాలు విశేషం)", ta: "தினமும் மாலை வேளையில் (செவ்வாய், சனிக்கிழமைகளில் விசேஷம்)" },
    facingDirection: { kn: "ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣ ದಿಕ್ಕು", en: "East or South", hi: "पूर्व अथवा दक्षिण दिशा", te: "తూర్పు లేదా దక్షిణం", ta: "கிழக்கு அல்லது தெற்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೮ ಬಾರಿ", en: "1 to 8 Times Daily", hi: "प्रतिदिन १ से ८ बार", te: "రోజుకు 1 నుండి 8 సార్లు", ta: "தினமும் 1 முதல் 8 முறை" }
  });

  // 5. Active Dasha-Bhukti Analysis & Mitigation
  const birthYmd = input.birthDate || "1993-05-31";
  const birthHm = input.birthTime || "09:25";
  const lat = input.latitude ?? 14.5479;
  const lng = input.longitude ?? 74.3188;
  const ageNow = ageDecimalYearsAt(birthYmd, birthHm, lat, lng, new Date());
  const dashaInfo = findBhuktiAtAge(kundli, ageNow);

  const mahaDashaPlanet = dashaInfo?.maha?.planet ?? PlanetName.Jupiter;
  const bhuktiPlanet = dashaInfo?.bhukti ?? PlanetName.Jupiter;

  const dashaBhuktiAnalysis = {
    currentMahaDasha: mahaDashaPlanet,
    currentBhukti: bhuktiPlanet,
    mahaDashaLabel: GRAHA_NAMES_LOCALE[mahaDashaPlanet] || { kn: mahaDashaPlanet, en: mahaDashaPlanet },
    bhuktiLabel: GRAHA_NAMES_LOCALE[bhuktiPlanet] || { kn: bhuktiPlanet, en: bhuktiPlanet },
    periodEffect: {
      kn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.kn || mahaDashaPlanet} ಮಹಾದಶೆಯಲ್ಲಿ ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.kn || bhuktiPlanet} ಭುಕ್ತಿಯು ನಡೆಯುತ್ತಿದೆ. ಈ ಕಾಲಾವಧಿಯಲ್ಲಿ ಕರ್ಮದ ಫಲಗಳು ಶೀಘ್ರವಾಗಿ ವ್ಯಕ್ತವಾಗುತ್ತಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಏರಿಳಿತಗಳು ಉಂಟಾಗಬಹುದು.`,
      en: `You are actively running the ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.en || mahaDashaPlanet} Mahadasha with ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.en || bhuktiPlanet} Bhukti. This timing triggers active karmic processing affecting mental focus, partnerships, and vitality.`,
      hi: `वर्तमान में आप ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.hi || mahaDashaPlanet} महादशा में ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.hi || bhuktiPlanet} भुक्ति से गुजर रहे हैं, जो जीवन में महत्वपूर्ण बदलाव ला रही है।`,
      te: `ప్రస్తుతం ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.te || mahaDashaPlanet} మహాదశలో ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.te || bhuktiPlanet} భుక్తి నడుస్తోంది.`,
      ta: `தற்போது ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.ta || mahaDashaPlanet} மகாதிசையில் ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.ta || bhuktiPlanet} புக்தி நடைபெறுகிறது.`
    },
    remedialAction: {
      kn: `ಈ ದಶಾ ಪ್ರಭಾವವನ್ನು ಶುಭಕರವಾಗಿಸಲು ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.kn || mahaDashaPlanet} ಹಾಗೂ ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.kn || bhuktiPlanet} ದೇವತೆಗಳಿಗೆ ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ಅತ್ಯಂತ ಫಲದಾಯಕ.`,
      en: `To optimize the karmic flow of this Dasha-Bhukti, perform dedicated japa to ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.en || mahaDashaPlanet} and offer Mahabaleshwara Rudrabhisheka seva.`,
      hi: `इस दशा-भुक्ति के शुभ फल हेतु संबंधित ग्रहों की शांति एवं गोकर्ण महाबलेश्वर में रुद्राभिषेक कराएं।`,
      te: `ఈ దశ అనుకూలత కొరకు గోకర్ణంలో రుద్రాభిషేకం జరిపించండి.`,
      ta: `இந்த திசை நன்மை பெற கோகர்ணத்தில் ருத்ராபிஷேகம் செய்யவும்.`
    }
  };

  // 6. Gochara (Transit) Analysis
  let todaysSaturnDeg = 325;
  let todaysJupiterDeg = 45;
  try {
    const s = siderealLongitudes(new Date(), "lahiri", "mean");
    todaysSaturnDeg = s.saturn ?? 325;
    todaysJupiterDeg = s.jupiter ?? 45;
  } catch {
    todaysSaturnDeg = 325;
    todaysJupiterDeg = 45;
  }

  const moonRashiIndex = moon?.rashi.index ?? 0;
  const transitSaturnRashi = degreeToRashi(todaysSaturnDeg);
  const transitJupiterRashi = degreeToRashi(todaysJupiterDeg);

  const saturnDiff = (transitSaturnRashi.index - moonRashiIndex + 12) % 12;
  const isSadeSati = saturnDiff === 11 || saturnDiff === 0 || saturnDiff === 1;
  const isAshtamaShani = saturnDiff === 7;
  const isKantakaShani = saturnDiff === 3 || saturnDiff === 6 || saturnDiff === 9;

  let sadeSatiText: Record<string, string>;
  if (isSadeSati) {
    sadeSatiText = {
      kn: "⚠️ ಶನಿ ಸಾಡೇಸಾತಿ (ಏಳೂವರೆ ವರ್ಷದ ಶನಿ ಪ್ರಭಾವ) ಸಕ್ರಿಯವಾಗಿದೆ - ತಾಳ್ಮೆ, ಶಾಂತಿ ಮತ್ತು ಹನುಮಾನ್ ಜಪ ಅತ್ಯಗತ್ಯ.",
      en: "⚠️ Active Sade Sati Phase (7.5 Year Saturn Cycle) - Demands calm speech, discipline, and Hanuman devotion.",
      hi: "⚠️ साढ़ेसाती प्रभाव सक्रिय है - धैर्य और हनुमान उपासना आवश्यक है।",
      te: "⚠️ ఏలినాటి శని ప్రభావం ఉంది - ఓపిక మరియు హనుమాన్ పూజ అవసరం.",
      ta: "⚠️ ஏழரை நாட்டு சனி நடப்பில் உள்ளது - பொறுமையும் வழிபாடும் அவசியம்."
    };
  } else if (isAshtamaShani) {
    sadeSatiText = {
      kn: "⚠️ ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ ಸಕ್ರಿಯವಾಗಿದೆ - ವಾಹನ ಚಾಲನೆ, ವಾದ-ವಿವಾದ ಹಾಗೂ ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.",
      en: "⚠️ Active Ashtama Shani (8th House Saturn Transit) - Caution in road travel, temperament, and finances.",
      hi: "⚠️ अष्टम शनि प्रभाव सक्रिय है - वाद-विवाद एवं यात्रा में सावधानी बरतें।",
      te: "⚠️ అష్టమ శని ప్రభావం - జాగ్రత్త అవసరం.",
      ta: "⚠️ அஷ்டம சனி தாக்கம் - எச்சரிக்கை தேவை."
    };
  } else if (isKantakaShani) {
    sadeSatiText = {
      kn: "ℹ️ ಕಂಟಕ ಶನಿ ಪ್ರಭಾವ - ಉದ್ಯೋಗ ಮತ್ತು ಕೌಟುಂಬಿಕ ವಿಷಯಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಇರಲಿ.",
      en: "ℹ️ Active Kantaka Shani Transit - Practice professional patience and avoid hasty career shifts.",
      hi: "ℹ️ कंटक शनि प्रभाव - कार्यक्षेत्र में धैर्य बनाए रखें।",
      te: "ℹ️ కంటక శని ప్రభావం - ఉద్యోగంలో ఓపిక అవసరం.",
      ta: "ℹ️ கண்டக சனி தாக்கம் - பொறுமை தேவை."
    };
  } else {
    sadeSatiText = {
      kn: "✅ ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿಯ ಯಾವುದೇ ಪ್ರಮುಖ ಅಶುಭ ಪ್ರಭಾವವಿಲ್ಲ (ಅನುಕೂಲಕರ ಸ್ಥಿತಿ).",
      en: "✅ No major difficult Saturn Sade Sati transit active at present (Favorable Saturn flow).",
      hi: "✅ वर्तमान में शनि का कोई अशुभ गोचर नहीं है।",
      te: "✅ శని అనుకూలంగా ఉన్నాడు.",
      ta: "✅ சனி பகவானின் பாதகமான தாக்கம் தற்போது இல்லை."
    };
  }

  const gocharaTransitAnalysis = {
    transitHighlights: [
      {
        graha: PlanetName.Saturn,
        transitSign: RASHI_NAMES_LOCALE[transitSaturnRashi.english]?.en || transitSaturnRashi.english,
        houseFromMoon: saturnDiff + 1,
        effect: isSadeSati || isAshtamaShani ? ("Challenging" as const) : ("Benefic" as const),
        title: {
          kn: `ಗೋಚಾರ ಶನಿ (${RASHI_NAMES_LOCALE[transitSaturnRashi.english]?.kn || transitSaturnRashi.english} ರಾಶಿ)`,
          en: `Transit Saturn in ${transitSaturnRashi.english} (${saturnDiff + 1}th from Moon)`,
          hi: `गोचर शनि (${transitSaturnRashi.english})`,
          te: `గోచార శని (${transitSaturnRashi.english})`,
          ta: `கோசார சனி (${transitSaturnRashi.english})`
        },
        description: {
          kn: `ಶನಿ ಮಹಾತ್ಮನು ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ ${saturnDiff + 1} ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ. ಇದು ಪರಿಶ್ರಮ ಮತ್ತು ಸಹನೆಯ ಪರೀಕ್ಷಾ ಕಾಲ.`,
          en: `Saturn transits the ${saturnDiff + 1}th house from your natal Moon, structuring long-term discipline and karmic maturity.`,
          hi: `शनि आपकी जन्म राशि से ${saturnDiff + 1}वें भाव में गोचर कर रहे हैं।`,
          te: `శని మీ చంద్ర రాశి నుండి ${saturnDiff + 1}వ ఇంట్లో సంచరిస్తున్నాడు.`,
          ta: `சனி உங்கள் ராசியிலிருந்து ${saturnDiff + 1}ம் இடத்தில் சஞ்சரிக்கிறார்.`
        },
        remedy: {
          kn: "ಶನಿವಾರ ಸಂಜೆ ಅಶ್ವತ್ಥ ವೃಕ್ಷದ ಬುಡದಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಅಥವಾ ಶನಿ ಶಾಂತಿ ಮಾಡಿ.",
          en: "Light sesame oil lamp under Peepal tree on Saturdays; chant Shani Gayatri.",
          hi: "शनिवार को पीपल के वृक्ष के पास तिल के तेल का दीपक जलाएं।",
          te: "శనివారం నువ్వుల నూనెతో దీపం వెలిగించండి.",
          ta: "சனிக்கிழமை நல்லெண்ணெய் தீபம் ஏற்றி வழிபடவும்."
        }
      },
      {
        graha: PlanetName.Jupiter,
        transitSign: RASHI_NAMES_LOCALE[transitJupiterRashi.english]?.en || transitJupiterRashi.english,
        houseFromMoon: ((transitJupiterRashi.index - moonRashiIndex + 12) % 12) + 1,
        effect: "Benefic" as const,
        title: {
          kn: `ಗೋಚಾರ ಗುರು ಬಲ (${RASHI_NAMES_LOCALE[transitJupiterRashi.english]?.kn || transitJupiterRashi.english} ರಾಶಿ)`,
          en: `Transit Jupiter in ${transitJupiterRashi.english}`,
          hi: `गोचर गुरु बल (${transitJupiterRashi.english})`,
          te: `గోచార గురు బలం`,
          ta: `கோசார குரு பலம்`
        },
        description: {
          kn: `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಜ್ಞಾನ, ವಿವೇಕ ಮತ್ತು ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಿಗೆ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ ನೀಡುತ್ತಿದ್ದಾನೆ.`,
          en: `Benefic transit of Brihaspati illuminates wisdom, dissolves mental turmoil, and provides spiritual shielding.`,
          hi: `देवगुरु बृहस्पति का शुभ गोचर आपके विवेक और आध्यात्मिक ऊर्जा को बढ़ा रहा है।`,
          te: `గురు భగవానుడు జ్ఞానాన్ని మరియు రక్షణను ఇస్తున్నాడు.`,
          ta: `குரு பகவான் நற்பலன்களையும் பாதுகாப்பையும் தருகிறார்.`
        },
        remedy: {
          kn: "ಗುರುವಾರ ಹಳದಿ ಬಣ್ಣದ ಹೂವುಗಳಿಂದ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ ಅಥವಾ ಗುರು ವಂದನೆ ಮಾಡಿ.",
          en: "Offer yellow flowers to Guru/Dakshinamurthy on Thursdays; apply chandan tilak.",
          hi: "गुरुवार को पीले पुष्प से भगवान विष्णु अथवा गुरु की पूजा करें।",
          te: "గురువారం పసుపు పూలతో విష్ణు పూజ చేయండి.",
          ta: "வியாழக்கிழமை குரு வழிபாடு செய்யவும்."
        }
      }
    ],
    sadeSatiStatus: sadeSatiText
  };

  // 7. Sacred Gokarna Mahabaleshwara Temple Remedies
  const gokarnaTempleRemedies = {
    prescribedSeva: {
      name: {
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ನವಗ್ರಹ ಶಾಂತಿ",
        en: "Gokarna Atmalinga Ksheerabhisheka & Navagraha Shanti",
        hi: "श्री महाबलेश्वर आत्मलिंग क्षीराभिषेक एवं नवग्रह शांति",
        te: "శ్రీ మహాబలేశ్వర ఆత్మలింగ క్షీరాభిషేకం",
        ta: "ஸ்ரீ மகாபலேஸ்வரர் ஆத்மலிங்க க்ஷீராபிஷேகம்"
      },
      temple: {
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ಕರ್ನಾಟಕ)",
        en: "Sri Mahabaleshwara Swamy Temple, Gokarna (Karnataka)",
        hi: "श्री महाबलेश्वर स्वामी मंदिर, गोकर्ण (कर्नाटक)",
        te: "శ్రీ మహాబలేశ్వర స్వామి దేవస్థానం, గోకర్ణ (కర్ణాటక)",
        ta: "ஸ்ரீ மகாபலேஸ்வரர் திருக்கோயில், கோகர்ணம் (கர்நாடகா)"
      },
      significance: {
        kn: "ರಾವಣನಿಂದ ಪ್ರತಿಷ್ಠಾಪಿಸಲ್ಪಟ್ಟ ಪರಮ ಪವಿತ್ರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡುವುದರಿಂದ ಜಾತಕದ ಸಮಸ್ತ ಪಿತ್ತ, ಕ್ರೋಧ ಹಾಗೂ ಗ್ರಹಪೀಡೆಗಳು ಭಸ್ಮವಾಗುತ್ತವೆ.",
        en: "Pouring sacred milk over the primordial Atmalinga at Gokarna douses high Pitta/Mars rage and clears deep ancestral karmic blocks.",
        hi: "परम पावन आत्मलिंग पर क्षीराभिषेक से समस्त क्रोध, ग्रह दोष एवं अशांति का नाश होता है।",
        te: "ఆత్మలింగానికి క్షీరాభిషేకం వలన సర్వ గ్రహ దోషాలు తొలగిపోతాయి.",
        ta: "ஆத்மலிங்கத்திற்கு பால் அபிஷேகம் செய்வதால் அனைத்து தோஷங்களும் நீங்கும்."
      },
      idealDay: {
        kn: "ಸೋಮವಾರ ಅಥವಾ ಪ್ರದೋಷ / ಮಾಸ ಶಿವರಾತ್ರಿ ದಿನ",
        en: "Monday, Pradosha, or Masa Shivaratri",
        hi: "सोमवार अथवा प्रदोष काल",
        te: "సోమవారం లేదా ప్రదోష వేళ",
        ta: "திங்கட்கிழமை அல்லது பிரதோஷ காலம்"
      }
    },
    rudrakshaRecommendation: {
      mukhi: {
        kn: `${prescriptions.rudraksha.mukhi} Mukhi (${prescriptions.rudraksha.nameKn})`,
        en: `${prescriptions.rudraksha.mukhi}-Mukhi (${prescriptions.rudraksha.nameEn})`,
        hi: `${prescriptions.rudraksha.mukhi}-मुखी रुद्राक्ष`,
        te: `${prescriptions.rudraksha.mukhi}-ముఖి రుద్రాక్ష`,
        ta: `${prescriptions.rudraksha.mukhi}-முக ருத்ராட்சம்`
      },
      deity: {
        kn: prescriptions.rudraksha.deity,
        en: prescriptions.rudraksha.deity,
        hi: prescriptions.rudraksha.deity,
        te: prescriptions.rudraksha.deity,
        ta: prescriptions.rudraksha.deity
      },
      benefits: {
        kn: prescriptions.rudraksha.astrologicalReason,
        en: prescriptions.rudraksha.wearingMethod,
        hi: "क्रोध, चिंता को दूर कर एकाग्रता और आत्मशांति प्रदान करता है।",
        te: "కోపాన్ని తగ్గించి మానసిక ఏకాగ్రతను పెంచుతుంది.",
        ta: "கோபத்தை தணித்து மனதை ஒருமுகப்படுத்தும்."
      }
    },
    gemstoneRecommendation: {
      stone: {
        kn: `${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight})`,
        en: `${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeight})`,
        hi: prescriptions.gemstoneRing.sanskritName,
        te: prescriptions.gemstoneRing.primaryGemstoneEn,
        ta: prescriptions.gemstoneRing.primaryGemstoneEn
      },
      metal: {
        kn: prescriptions.gemstoneRing.metalKn,
        en: prescriptions.gemstoneRing.metalEn,
        hi: prescriptions.gemstoneRing.metalEn,
        te: prescriptions.gemstoneRing.metalEn,
        ta: prescriptions.gemstoneRing.metalEn
      },
      finger: {
        kn: prescriptions.gemstoneRing.fingerKn,
        en: prescriptions.gemstoneRing.fingerEn,
        hi: prescriptions.gemstoneRing.fingerEn,
        te: prescriptions.gemstoneRing.fingerEn,
        ta: prescriptions.gemstoneRing.fingerEn
      },
      dayToWear: {
        kn: prescriptions.gemstoneRing.activationDay,
        en: prescriptions.gemstoneRing.activationDay,
        hi: prescriptions.gemstoneRing.activationDay,
        te: prescriptions.gemstoneRing.activationDay,
        ta: prescriptions.gemstoneRing.activationDay
      }
    },
    donationDaana: {
      item: {
        kn: "ಹಾಲು, ಸಕ್ಕರೆ, ಅಕ್ಕಿ ಅಥವಾ ತಾಮ್ರದ ಪಾತ್ರೆ",
        en: "Milk, raw rice, sugar, or a copper vessel",
        hi: "दूध, चावल, मिश्री अथवा तांबे का पात्र",
        te: "పాలు, బియ్యం, రాగి పాత్ర",
        ta: "பால், அரிசி அல்லது செம்பு பாத்திரம்"
      },
      day: { kn: "ಸೋಮವಾರ ಅಥವಾ ಮಂಗಳವಾರ", en: "Monday or Tuesday", hi: "सोमवार अथवा मंगलवार", te: "సోమ లేదా మంగళవారం", ta: "திங்கள் அல்லது செவ்வாய்க்கிழமை" },
      beneficiary: {
        kn: "ಗೋಶಾಲೆ (ಆಕಳುಗಳಿಗೆ ಮೇವು/ಹಾಲು) ಅಥವಾ ಬಡ ಭಕ್ತರಿಗೆ",
        en: "Goshala (feed cows) or elderly devotees in need",
        hi: "गौशाला में गायों को चारा अथवा जरूरतमंदों को",
        te: "గోశాలలో ఆవులకు లేదా పేదలకు",
        ta: "கோசாலையில் பசுக்களுக்கு அல்லது ஏழைகளுக்கு"
      }
    }
  };

  // 8. Chief Priest Blessing
  const chiefPriestBlessing = {
    priestName: {
      kn: "ವೇದಮೂರ್ತಿ ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      en: "Vedamurthi Shri Shreeram Pandit",
      hi: "वेदमूर्ति श्री श्रीराम पंडित",
      te: "వేదమూర్తి శ్రీ శ్రీరామ్ పండిత్",
      ta: "வேதமூர்த்தி ஸ்ரீ ஸ்ரீராம் பண்டித்"
    },
    priestTitle: {
      kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು & ಧರ್ಮಕರ್ತರು, ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
      en: "Chief Priest & Dharmadhikari, Sri Gokarna Kshetra",
      hi: "प्रधान अर्चक एवं धर्मकर्ता, श्री गोकर्ण क्षेत्र",
      te: "ప్రధాన అర్చకులు, శ్రీ గోకర్ణ క్షేత్రం",
      ta: "தலைமை அர்ச்சகர், ஸ்ரீ கோகர்ண க்ஷேத்திரம்"
    },
    phone: "+91 99723 39362",
    sanskritAshirvada: "॥ ॐ स्वस्ति प्रजाभ्यः परिपालयन्तां न्यायेन मार्गेण महीं महीशाः । शुभं भवतु कल्याणं च वर्धताम् ॥",
    ashirvadaMeaning: {
      kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಪರಮ ಕೃಪೆಯಿಂದ ತಮ್ಮ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು, ಮನಸ್ಸಿನ ಕ್ರೋಧ-ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಅಖಂಡ ಯಶಸ್ಸು ಲಭಿಸಲಿ ಎಂದು ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಿಂದ ಆಶೀರ್ವದಿಸುತ್ತೇವೆ.",
      en: "By the supreme grace of Lord Mahabaleshwara at Gokarna, may all planetary afflictions and temper spikes be dissolved, bestowing you with health, peace, longevity, and auspicious prosperity.",
      hi: "भगवान श्री महाबलेश्वर की असीम अनुकंपा से आपके समस्त ग्रह दोष और मानसिक संताप दूर हों तथा जीवन में सुख-शांति एवं ऐश्वर्य की वृद्धि हो।",
      te: "శ్రీ మహాబలేశ్వరుని దివ్య కృపతో సర్వ దోషాలు తొలగి ఆయురారోగ్యాలు, మనశ్శాంతి కలగాలని ఆశీర్వదిస్తున్నాము.",
      ta: "ஸ்ரீ மகாபலேஸ்வரரின் திருவருளால் சகல தோஷங்களும் நீங்கி ஆரோக்கியமும் மன அமைதியும் உண்டாக ஆசீர்வதிக்கிறோம்."
    },
    templeSealText: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನಂ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಅಧಿಕೃತ ಮುದ್ರೆ",
      en: "Sri Mahabaleshwara Temple Gokarna · Official Vedic Seal",
      hi: "श्री महाबलेश्वर देवस्थानम् · गोकर्ण क्षेत्र आधिकारिक मुद्रा",
      te: "శ్రీ మహాబలేశ్వర దేవస్థానం · గోకర్ణ అధికారిక ముద్ర",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் திருக்கோயில் · கோகர்ணம் அதிகாரப்பூர்வ முத்திரை"
    }
  };

  return {
    devoteeName: input.name || "Devotee",
    birthDate: birthYmd,
    birthTime: birthHm,
    gotra: input.gothra,
    lagnaName: RASHI_NAMES_LOCALE[lagnaRashiName] || { kn: lagnaRashiName, en: lagnaRashiName },
    rashiName: RASHI_NAMES_LOCALE[moonRashiName] || { kn: moonRashiName, en: moonRashiName },
    nakshatraName: { kn: moonNakName, en: moonNakName, hi: moonNakName, te: moonNakName, ta: moonNakName },
    primaryStruggle: {
      category: struggleCategory,
      title: primaryStruggleTitle,
      description: primaryStruggleDesc,
      intensity,
      intensityLabel
    },
    afflictionFactors,
    psychologicalProfile: {
      krodhaLevel,
      manasStability,
      vitalityScore,
      patienceIndex
    },
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing
  };
}
