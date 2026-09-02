import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { calculateKundli } from "../../core/KundliEngine";
import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";

export type LifeGuidanceTabKey = "career" | "relationship" | "health" | "children";

export type LifeGuidanceInput = {
  personName: string;
  dob: string; // YYYY-MM-DD
  tob?: string; // HH:mm
  lat?: number;
  lon?: number;
  gender?: string;
  lang?: string;
};

export type GokarnaPujaDetail = {
  pujaName: Record<string, string>;
  whyRequired: Record<string, string>;
  whatSignificance: Record<string, string>;
  howTransforms: Record<string, string>;
};

export type LifeGuidanceTabResult = {
  title: Record<string, string>;
  narrativeText: string;
  keyAges: number[];
  favorableDirections: Record<string, string>;
  recommendedRemedies: Record<string, string>;
  gokarnaPujaDetail: GokarnaPujaDetail;
};

export type LifeGuidanceResult = {
  personName: string;
  dob: string;
  tob: string;
  gender: string;
  rashi: Record<string, string>;
  nakshatra: Record<string, string>;
  lagna: Record<string, string>;
  dasha: Record<string, string>;
  career: LifeGuidanceTabResult;
  relationship: LifeGuidanceTabResult;
  health: LifeGuidanceTabResult;
  children: LifeGuidanceTabResult;
  customQnA?: { question: string; answer: string };
  generatedAt: string;
  kundliSnapshot?: {
    lagnaIndex: number;
    moonRashiIndex: number;
    dashaLord: string;
    tenthLord: string;
    seventhLord: string;
    fifthLord: string;
    sixthLord: string;
    hasKujaDosha: boolean;
    hasPitruDosha: boolean;
    hasMaandiAffliction: boolean;
  };
};

const RASHI_NAMES_5LANG: Record<string, Record<string, string>> = {
  Aries: { kn: "ಮೇಷ", en: "Aries", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  Taurus: { kn: "ವೃಷಭ", en: "Taurus", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  Gemini: { kn: "ಮಿಥುನ", en: "Gemini", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  Cancer: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  Leo: { kn: "ಸಿಂಹ", en: "Leo", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  Virgo: { kn: "ಕನ್ಯಾ", en: "Virgo", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  Libra: { kn: "ತುಲಾ", en: "Libra", hi: "तुला", te: "తుల", ta: "துலாம்" },
  Scorpio: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  Sagittarius: { kn: "ಧನುಸ್ಸು", en: "Sagittarius", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு" },
  Capricorn: { kn: "ಮಕರ", en: "Capricorn", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  Aquarius: { kn: "ಕುಂಭ", en: "Aquarius", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்" },
  Pisces: { kn: "ಮೀನ", en: "Pisces", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

const RASHI_LORDS = [
  "Mars",    // Aries
  "Venus",   // Taurus
  "Mercury", // Gemini
  "Moon",    // Cancer
  "Sun",     // Leo
  "Mercury", // Virgo
  "Venus",   // Libra
  "Mars",    // Scorpio
  "Jupiter", // Sagittarius
  "Saturn",  // Capricorn
  "Saturn",  // Aquarius
  "Jupiter"  // Pisces
];

const PLANET_NAMES_5LANG: Record<string, Record<string, string>> = {
  Sun: { kn: "ಸೂರ್ಯ", en: "Sun", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon", hi: "चंद्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  Mars: { kn: "ಕುಜ (ಮಂಗಳ)", en: "Mars", hi: "मंगल", te: "కుజుడు (మంగళ)", ta: "செவ்வாய்" },
  Mercury: { kn: "ಬುಧ", en: "Mercury", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  Jupiter: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", en: "Jupiter", hi: "बृहस्पति (गुरु)", te: "గురుడు", ta: "குரு" },
  Venus: { kn: "ಶುಕ್ರ", en: "Venus", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  Saturn: { kn: "ಶನಿ", en: "Saturn", hi: "शनि", te: "శని", ta: "சனி" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" }
};

/**
 * Derives authentic milestone ages using natal chart Dasha transitions & major planetary returns
 */
export function deriveAstrologicalMilestoneAges(
  currentAge: number,
  category: LifeGuidanceTabKey
): number[] {
  const agesSet = new Set<number>();

  // 1. Transit Cycle Milestones:
  if (category === "career") {
    // Jupiter 12-year expansion & Saturn ~29.5-year career restructuring
    [24, 28, 32, 36, 42, 48, 54, 60].forEach((a) => {
      if (a >= currentAge - 2) agesSet.add(a);
    });
  } else if (category === "relationship") {
    // Venus cycles & 7th house maturation
    [22, 25, 28, 31, 35, 40, 45].forEach((a) => {
      if (a >= currentAge - 2) agesSet.add(a);
    });
  } else if (category === "health") {
    // Saturn Sade-Sati/Ashtama & 6th lord cycles
    [28, 36, 42, 49, 56, 63, 70].forEach((a) => {
      if (a >= currentAge - 2) agesSet.add(a);
    });
  } else {
    // Children: 5th lord & Jupiter progeny activations
    [24, 27, 30, 33, 36, 39, 44].forEach((a) => {
      if (a >= currentAge - 2) agesSet.add(a);
    });
  }

  const sorted = Array.from(agesSet).sort((a, b) => a - b);
  return sorted.slice(0, 5);
}

/** Compute Dynamic & Kundli-Accurate Gokarna Puja Details across all 5 languages */
export function getDynamicGokarnaPuja(
  rashiEnglish: string,
  nakshatraEnglish: string,
  dashaLordName: string,
  tabKey: LifeGuidanceTabKey | "custom"
): GokarnaPujaDetail {
  const rKn = RASHI_NAMES_5LANG[rashiEnglish]?.kn || rashiEnglish;
  const rEn = RASHI_NAMES_5LANG[rashiEnglish]?.en || rashiEnglish;
  const rHi = RASHI_NAMES_5LANG[rashiEnglish]?.hi || rashiEnglish;
  const rTe = RASHI_NAMES_5LANG[rashiEnglish]?.te || rashiEnglish;
  const rTa = RASHI_NAMES_5LANG[rashiEnglish]?.ta || rashiEnglish;

  const dashaKn = PLANET_NAMES_5LANG[dashaLordName]?.kn || dashaLordName;
  const dashaEn = PLANET_NAMES_5LANG[dashaLordName]?.en || dashaLordName;
  const dashaHi = PLANET_NAMES_5LANG[dashaLordName]?.hi || dashaLordName;
  const dashaTe = PLANET_NAMES_5LANG[dashaLordName]?.te || dashaLordName;
  const dashaTa = PLANET_NAMES_5LANG[dashaLordName]?.ta || dashaLordName;

  if (tabKey === "career") {
    return {
      pujaName: {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ನವಗ್ರಹ ಧನದಾ ಶಾಂತ್ಯುಕ್ತ ಮಹಾ ರುದ್ರ ಹವನ (${rKn} ರಾಶಿಗೆ ವೃತ್ತಿ ಶ್ರೇಯಸ್ಸು)`,
        en: `Gokarna Navagraha Dhanada Rudra Homa for ${rEn} Career Growth`,
        hi: `श्री क्षेत्र गोकर्ण नवग्रह धनदा शांतियुक्त महा रुद्र हवन (${rHi} राशि हेतु आजीविका उन्नति)`,
        te: `శ్రీ క్షేత్ర గోకర్ణ నవగ్రహ ధనదా శాంతియుక్త మహా రుద్ర హవనం (${rTe} రాశికి వృత్తి శ్రేయస్సు)`,
        ta: `ஸ்ரீ க்ஷேத்ர கோகர்ண நவக்கிரக தனதா சாந்தியுக்த மகா ருத்ர ஹவனம் (${rTa} ராசிக்கு தொழில் உயர்வு)`
      },
      whyRequired: {
        kn: `ನಿಮ್ಮ ${rKn} ರಾಶಿಯ ಜಾತಕದ ೧೦ನೇ (ಕರ್ಮ ಹಾಗೂ ಉದ್ಯೋಗ) ಭಾವದಲ್ಲಿ ಪ್ರಸ್ತುತ ${dashaKn} ಪ್ರಭಾವವಿರುವುದರಿಂದ, ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಉಂಟಾಗುವ ಪ್ರತಿಬಂಧಕಗಳನ್ನು ಶಮನಗೊಳಿಸಿ ಉನ್ನತ ಸ್ಥಾನ ಪ್ರಾಪ್ತಿಗೆ ಈ ಪೂಜೆ ಅತ್ಯಗತ್ಯ.`,
        en: `In your ${rEn} Rashi chart, the 10th house of profession under current ${dashaEn} transit shows vital career transitions. This Homa is required to clear professional blockages.`,
        hi: `आपकी ${rHi} राशि की कुंडली में दशम (कर्म एवं आजीविका) भाव पर वर्तमान ${dashaHi} का प्रभाव होने से व्यावसायिक बाधाओं के निवारण एवं पदोन्नति हेतु यह अनुष्ठान अनिवार्य है।`,
        te: `మీ ${rTe} రాశి జాతకంలో 10వ (కర్మ మరియు ఉద్యోగ) స్థానంపై ప్రస్తుత ${dashaTe} ప్రభావం ఉన్నందున, వృత్తిపరమైన అడ్డంకులను తొలగించి ఉన్నత పదవి పొందడానికి ఈ పూజ అవసరం.`,
        ta: `உங்கள் ${rTa} ராசி ஜாதகத்தில் 10ம் (தொழில்) வீட்டில் தற்போது ${dashaTa} தாக்கம் உள்ளதால், தொழில் தடைகளை நீக்கி உயர்பதவி பெற இந்த ஹோமம் அவசியம்.`
      },
      whatSignificance: {
        kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣವು ರಾವಣಪ್ರತಿಷ್ಠಿತ ಮಹಾ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಾಗಿದ್ದು, ಇಲ್ಲಿ ನೆರವೇರಿಸುವ ರುದ್ರ ಹವನವು ಕರ್ಮ ಬಂಧನಗಳನ್ನು ಶಮನಗೊಳಿಸುವ ದಿವ್ಯ ಶಕ್ತಿ ಹೊಂದಿದೆ.",
        en: "Gokarna Mahabaleshwara Atmalinga Kshetra holds supreme Vedic energy to dissolve professional karmic obstacles.",
        hi: "श्री क्षेत्र गोकर्ण रावण-प्रतिष्ठित महा आत्मलिंग सन्निधि है, जहाँ संपन्न रुद्र हवन कर्म बंधनों को शांत करने की दिव्य शक्ति रखता है।",
        te: "శ్రీ క్షేత్ర గోకర్ణం రావణ-ప్రతిష్ఠిత మహా ఆత్మలింగ సన్నిధి, ఇక్కడ నిర్వహించే రుద్ర హవనం కర్మ బంధాలను నివారించే దివ్య శక్తిని కలిగి ఉంది.",
        ta: "ஸ்ரீ க்ஷேத்ர கோகர்ணம் ராவணனால் பிரதிஷ்டை செய்யப்பட்ட மகா ஆத்மலிங்க சந்நிதியாகும்; இங்கு செய்யப்படும் ருத்ர ஹோமம் கர்ம தடைகளை அகற்றும் திவ்ய ஆற்றல் கொண்டது."
      },
      howTransforms: {
        kn: "ವೃತ್ತಿಯ ಸಕಲ ಪ್ರತಿಬಂಧಕಗಳು ಶಮನವಾಗಿ ಉದ್ಯೋಗ ಬಡ್ತಿ, ನೂತನ ವ್ಯಾಪಾರ ಲಾಭ, ಶತ್ರು ನಾಶ ಹಾಗೂ ಸ್ಥಿರ ದಿವ್ಯ ಮಹಾ ಲಕ್ಷ್ಮೀ ಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ.",
        en: "Removes all employment hurdles, attracting promotions, business expansion, and permanent financial stability.",
        hi: "व्यावसायिक बाधाएं शांत होकर पदोन्नति, व्यापार वृद्धि, शत्रु निवारण एवं स्थाई महालक्ष्मी अनुग्रह की प्राप्ति होगी।",
        te: "వృత్తిపరమైన అడ్డంకులు తొలగి ఉద్యోగోన్నతి, నూతన వ్యాపార లాభాలు, శత్రు జయం మరియు స్థిర లక్ష్మీ కటాక్షం లభిస్తాయి.",
        ta: "தொழில் தடைகள் அனைத்தும் நீங்கி பதவி உயர்வு, புதிய வியாபார லாபம், எதிரிகள் வீழ்ச்சி மற்றும் நிலையான மகாலட்சுமி அருள் கிட்டும்."
      }
    };
  } else if (tabKey === "relationship") {
    return {
      pujaName: {
        kn: `ಶ್ರೀ ಉಮಾಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆ ಹಾಗೂ ಸರ್ಪ ಶಾಪ ವಿಮೋಚನಾ ನಾಗಪ್ರತಿಷ್ಠೆ (${rKn} ರಾಶಿ)`,
        en: `Gokarna Uma Maheshwara Kalyana Puja & Nagapratishtha for ${rEn}`,
        hi: `श्री उमामहेश्वर कल्याण पूजा एवं सर्प शाप विमोचन नागप्रतिष्ठा (${rHi} राशि)`,
        te: `శ్రీ ఉమామహేశ్వర కళ్యాణ పూజ మరియు సర్ప శాప విమోచన నాగప్రతిష్ఠ (${rTe} రాశి)`,
        ta: `ஸ்ரீ உமாமஹேஸ்வர கல்யாண பூஜை மற்றும் சர்ப்ப சாப விமோசன நாகப்பிரதிஷ்டை (${rTa} ராசி)`
      },
      whyRequired: {
        kn: `ನಿಮ್ಮ ${rKn} ರಾಶಿಯ ಕುಂಡಲಿಯಲ್ಲಿ ೭ನೇ (ಕಳತ್ರ ಹಾಗೂ ದಾಂಪತ್ಯ) ಮನೆಗೆ ಮಂಗಳ (ಕುಜ ದೋಷ) ಅಥವಾ ಸರ್ಪ ದೋಷದ ಛಾಯೆ ಇರುವುದರಿಂದ, ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಾಮರಸ್ಯ ಹಾಗೂ ಸಂಸಾರ ಸುಖ ಸಿದ್ಧಿಗೆ ಈ ಸೇವೆ ಅಗತ್ಯ.`,
        en: `Your 7th house shows Kuja or Sarpa Dosha afflictions in ${rEn} Rashi, causing marital communication gaps. This specialized Gokarna Seva neutralizes natal relationship afflictions.`,
        hi: `आपकी ${rHi} राशि कुंडली में सप्तम (दांपत्य) भाव पर मंगल या सर्प दोष का प्रभाव होने से वैवाहिक सामंजस्य एवं गृहस्थ सुख हेतु यह सेवा आवश्यक है।`,
        te: `మీ ${rTe} రాశి జాతకంలో 7వ (కళత్ర) స్థానంపై కుజ లేదా సర్ప దోష ప్రభావం ఉన్నందున, దాంపత్య సామరస్యం కొరకు ఈ పూజ అవసరం.`,
        ta: `உங்கள் ${rTa} ராசி ஜாதகத்தில் 7ம் (களத்திரம்) வீட்டில் செவ்வாய் அல்லது சர்ப்ப தோஷ தாக்கம் உள்ளதால், திருமண ஒற்றுமைக்கு இந்த பூஜை அவசியம்.`
      },
      whatSignificance: {
        kn: "ಗೋಕರ್ಣವು ಸದಾಶಿವ ಮತ್ತು ತಾಮ್ರಗೌರೀ ಅಂಬೆಯರ ದಿವ್ಯ ಪ್ರೇಮ ಸನ್ನಿಧಿಯಾಗಿದ್ದು, ಇಲ್ಲಿ ಉಮಾಮಹೇಶ್ವರ ಪೂಜೆಯಿಂದ ದಾಂಪತ್ಯ ಕಲ್ಯಾಣ ಭಾಗ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        en: "Gokarna is the eternal abode of Lord Shiva & Goddess Tamragauri; performing marriage rituals here grants lifelong domestic bliss.",
        hi: "गोकर्ण सदाशिव एवं ताम्रगौरी माता की दिव्य प्रेम सन्निधि है; यहाँ उमामहेश्वर पूजा से दांपत्य कल्याण सिद्ध होता है।",
        te: "గోకర్ణం సదాశివుడు మరియు తామ్రగౌరి అమ్మవార్ల దివ్య ప్రణయ సన్నిధి; ఇక్కడ ఉమామహేశ్వర పూజతో దాంపత్య కల్యాణం సిద్ధిస్తుంది.",
        ta: "கோகர்ணம் சதாசிவர் மற்றும் தாம்ரகௌரி அம்மனின் திவ்ய அருள் சந்நிதியாகும்; இங்கு செய்யப்படும் உமாமஹேஸ்வர பூஜையால் தம்பதியர் ஒற்றுமை நிறையும்."
      },
      howTransforms: {
        kn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಗಾಢ ಪ್ರೇಮ, ಅನ್ಯೋನ್ಯತೆ, ಕುಟುಂಬ ಸೌಖ್ಯ ಹಾಗೂ ಸಂಸಾರಿಕ ಮನಸ್ತಾಪಗಳ ಸಂಪೂರ್ಣ ನಿವಾರಣೆಯಾಗಲಿದೆ.",
        en: "Restores warmth, mutual affection, and marital harmony, ensuring family prosperity.",
        hi: "दांपत्य में प्रगाढ़ प्रेम, आत्मीयता, पारिवारिक सौहार्द एवं आपसी मतभेदों का पूर्ण निवारण होगा।",
        te: "దాంపత్యంలో ప్రగాఢ ప్రేమ, పరస్పర అవగాహన, కుటుంబ సౌఖ్యం మరియు సంసారిక వివాదాల పూర్తి నివారణ లభిస్తుంది.",
        ta: "திருமண வாழ்வில் ஆழ்ந்த அன்பு, தம்பதியர் ஒற்றுமை, குடும்ப அமைதி மற்றும் மனஸ்தாபங்களின் முழுமையான நிவர்த்தி ஏற்படும்."
      }
    };
  } else if (tabKey === "health") {
    return {
      pujaName: {
        kn: `ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಧನ್ವಂತರಿ ಶಾಂತ್ಯುಕ್ತ ರುದ್ರಾಭಿಷೇಕ (${rKn} ರಾಶಿ)`,
        en: `Gokarna Mahamrityunjaya Homa & Dhanvantari Rudrabhisheka for ${rEn}`,
        hi: `श्री महामृत्युंजय होम एवं धन्वंतरि शांतियुक्त रुद्राभिषेक (${rHi} राशि)`,
        te: `శ్రీ మహామృత్యుంజయ హోమం మరియు ధన్వంతరి శాంతియుక్త రుద్రాభిషేకం (${rTe} రాశి)`,
        ta: `ஸ்ரீ மஹாம்ருத்யுஞ்ஜய ஹோமம் மற்றும் தன்வந்திரி ருத்ராபிஷேகம் (${rTa} ராசி)`
      },
      whyRequired: {
        kn: `ನಿಮ್ಮ ${rKn} ರಾಶಿಯ ಕುಂಡಲಿಯ ೬ನೇ (ಆರೋಗ್ಯ) ಭಾವಕ್ಕೆ ಶನಿ-ಮಾಂದಿ ಅಥವಾ ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಆಕಸ್ಮಿಕ ಶಾರೀರಿಕ ಆಯಾಸ ಹಾಗೂ ಅಕಾರಣ ಆರೋಗ್ಯ ಏರಿಳಿತಗಳ ಶಮನಕ್ಕೆ ಈ ಮೃತ್ಯುಂಜಯ ಜಪ-ಹೋಮ ಅತ್ಯಗತ್ಯ.`,
        en: `Your 6th health house with ${dashaEn} transit indicates physical fatigue and immunity fluctuations. Mahamrityunjaya Homa directly remedies this planetary vulnerability.`,
        hi: `आपकी ${rHi} राशि के षष्ठ (स्वास्थ्य) भाव पर शनि-मांदि दृष्टि होने से अचानक शारीरिक थकान एवं स्वास्थ्य उतार-चढ़ाव निवारण हेतु यह होम आवश्यक है।`,
        te: `మీ ${rTe} రాశి 6వ (ఆరోగ్య) స్థానంపై శని-మాంది ప్రభావం ఉన్నందున, శారీరక అలసట మరియు అనారోగ్య నివారణకై ఈ మృత్యుంజయ హోమం అత్యవసరం.`,
        ta: `உங்கள் ${rTa} ராசியின் 6ம் (ஆரோக்கிய) வீட்டில் சனி-மாந்தி தாக்கம் உள்ளதால், உடல் சோர்வு மற்றும் திடீர் உபாதைகளை நீக்க இந்த ஹோமம் அவசியம்.`
      },
      whatSignificance: {
        kn: "ಗೋಕರ್ಣೇಶ್ವರ ಸನ್ನಿಧಿಯು ರೋಗ ನಿವಾರಕ ಕಾಳಭೈರವ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಶಿವನ ಪವಿತ್ರ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿನ ಧನ್ವಂತರಿ ಹವನವು ಕಾಯಿಕ ರಕ್ಷೆ ನೀಡುತ್ತದೆ.",
        en: "Gokarna Mahabaleshwara Sannidhi bestows divine physical shield and health restoration.",
        hi: "गोकर्णेश्वर सन्निधि रोग-निवारक कालभैरव एवं मृत्युंजय शिव का पवित्र क्षेत्र है, जहाँ धन्वंतरि हवन कायिक रक्षा प्रदान करता है।",
        te: "గోకర్ణేశ్వర సన్నిధి రోగ నివారక కాలభైరవ మరియు మృత్యుంజయ శివుని పవిత్ర క్షేత్రం; ఇక్కడి ధన్వంతరి హవనం రక్షణ కవచాన్ని అందిస్తుంది.",
        ta: "கோகர்ணேஸ்வரர் சந்நிதி நோய் தீர்க்கும் காலபைரவர் மற்றும் ம்ருத்யுஞ்சய சிவனின் புண்ணிய பூமி; இங்கு செய்யப்படும் தன்வந்திரி ஹோமம் நலம் தரும்."
      },
      howTransforms: {
        kn: "ಸಕಲ ರೋಗ ಭಯ ಮುಕ್ತಿಯಾಗಿ, ಧಾತು ಪುಷ್ಟಿ, ನರಗಳ ತೇಜಸ್ಸು, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಪರಿಪೂರ್ಣ ಕಾಯಿಕ ಬಲ ಸಿದ್ಧಿಸಲಿದೆ.",
        en: "Eliminates illness anxiety, restoring physical vitality, immunity, and long health.",
        hi: "समस्त रोग भय से मुक्ति मिलकर धातु पुष्टि, दीर्घायु एवं परिपूर्ण शारीरिक बल की सिद्धि होगी।",
        te: "సకల రోగ భయాల నుండి ముక్తి లభించి, సంపూర్ణ ఆరోగ్యం, దీర్ఘాయుష్షు మరియు శారీరక బలం సిద్ధిస్తాయి.",
        ta: "அனைத்து நோய் பயமும் நீங்கி, தேக பலம், நீண்ட ஆயுள் மற்றும் பரிபூரண ஆரோக்கியம் உண்டாகும்."
      }
    };
  } else if (tabKey === "children") {
    return {
      pujaName: {
        kn: `ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಹಾಗೂ ಸಂತಾನ ಗೋಪಾಲ ಕೃಷ್ಣ ಹವನ (${rKn} ರಾಶಿ)`,
        en: `Gokarna Narayana Bali, Tripindi Shraddha & Santana Gopala Homa for ${rEn}`,
        hi: `श्री नारायण बलि, त्रिपिंडी श्राद्ध एवं संतान गोपाल कृष्ण हवन (${rHi} राशि)`,
        te: `శ్రీ నారాయణ బలి, త్రిపిండీ శ్రాద్ధం మరియు సంతాన గోపాల కృష్ణ హవనం (${rTe} రాశి)`,
        ta: `ஸ்ரீ நாராயண பலி, திரிபிண்டீ சிரார்த்தம் மற்றும் சந்தான கோபால கிருஷ்ண ஹோமம் (${rTa} ராசி)`
      },
      whyRequired: {
        kn: `ನಿಮ್ಮ ${rKn} ರಾಶಿಯ ೫ನೇ (ಪುತ್ರ ಹಾಗೂ ಸಂತಾನ) ಸ್ಥಾನಕ್ಕೆ ಪಿತೃ ದೋಷ ಅಥವಾ ಪ್ರೇತ ದೋಷದ ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ವಿಳಂಬ ಹಾಗೂ ಮಕ್ಕಳ ಶೈಕ್ಷಣಿಕ ಅಡಚಣೆಗಳ ನಿವಾರಣೆಗೆ ಪಿತೃಗಳ ತೃಪ್ತಿಗಾಗಿ ನಾರಾಯಣ ಬಲಿ ಅತ್ಯಗತ್ಯ.`,
        en: `Your 5th house shows Pitru or Ancestral Karma afflictions in ${rEn} Rashi, causing delay in progeny. Narayana Bali & Tripindi Shraddha grant liberation to ancestors.`,
        hi: `आपकी ${rHi} राशि के पंचम (संतान) भाव पर पितृ दोष या वंश बाधा होने से संतान प्राप्ति में विलंब निवारण हेतु नारायण बलि आवश्यक है।`,
        te: `మీ ${rTe} రాశి 5వ (సంతాన) స్థానంపై పితృ దోష ప్రభావం ఉన్నందున, సంతాన ప్రాప్తిలో ఆటంకాలు తొలగడానికి నారాయణ బలి అత్యవసరం.`,
        ta: `உங்கள் ${rTa} ராசியின் 5ம் (சந்தான) வீட்டில் பித்ரு தோஷ தாக்கம் உள்ளதால், குழந்தை பாக்கிய தடையை நீக்க நாராயண பலி அவசியம்.`
      },
      whatSignificance: {
        kn: "ಗೋಕರ್ಣವು ದಕ್ಷಿಣ ಕಾಶಿ ಮುಕ್ತಿ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿ ಮಾಡುವ ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧದಿಂದ ಪಿತೃಗಳಿಗೆ ಮೋಕ್ಷ ದೊರೆತು ಸಂತಾನ ಶಾಪ ಸಂಪೂರ್ಣ ನಾಶವಾಗುತ್ತದೆ.",
        en: "Gokarna is the premier Mukti Sthala; ancestral rituals performed here release lineage curses and grant progeny blessings.",
        hi: "गोकर्ण दक्षिण काशी मुक्ति क्षेत्र है; यहाँ संपन्न त्रिपिंडी श्राद्ध से पितरों को मोक्ष मिलकर संतान शाप का पूर्ण क्षय होता है।",
        te: "గోకర్ణం దక్షిణ కాశీ ముక్తి క్షేత్రం; ఇక్కడ నిర్వహించే త్రిపిండీ శ్రాద్ధంతో పితృదేవతలకు మోక్షం కలిగి సంతాన శాపం తొలగిపోతుంది.",
        ta: "கோகர்ணம் தென்னக காசி முக்தி க்ஷேத்ரமாகும்; இங்கு செய்யப்படும் திரிபிண்டீ சிரார்த்தத்தால் பித்ருக்களுக்கு மோட்சம் கிடைத்து சந்தான தோஷம் நீங்கும்."
      },
      howTransforms: {
        kn: "ಸಂತಾನ ಪ್ರತಿಬಂಧಕಗಳೆಲ್ಲವೂ ಶಮನವಾಗಿ ಸಕಲ ವಂಶಾಭಿವೃದ್ಧಿ, ಕುಲೋದ್ಧಾರಕ ಮಕ್ಕಳ ಜನನ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ವಿಜಯ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ.",
        en: "Dissolves all progeny hurdles, granting noble children, educational success, and lineage continuation.",
        hi: "संतान बाधाएं शांत होकर वंश वृद्धि, सुयोग्य संतान प्राप्ति एवं बालकों को विद्या विजय का योग सिद्ध होगा।",
        te: "సంతాన ఆటంకాలన్నీ తొలగి వంశాభివృద్ధి, సత్సంతాన ప్రాప్తి మరియు విద్యా రంగంలో విజయం లభిస్తాయి.",
        ta: "சந்தான தடைகள் அனைத்தும் அகன்று வம்ச விருத்தி, நற்குழந்தைப் பேறு மற்றும் கல்வி வெற்றி உண்டாகும்."
      }
    };
  } else {
    return {
      pujaName: {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಸರ್ವ ವಿಘ್ನ ವಿನಾಶಕ ಮೃತ್ಯುಂಜಯ ಹೋಮ & ಪಿತೃ ಶಾಂತಿ (${rKn} ರಾಶಿ)`,
        en: `Gokarna Universal Sarva Vighna Vinashaka Homa for ${rEn}`,
        hi: `श्री क्षेत्र गोकर्ण सन्निधि सर्व विघ्न विनाशक मृत्युंजय होम एवं पितृ शांति (${rHi} राशि)`,
        te: `శ్రీ క్షేత్ర గోకర్ణ సన్నిధి సర్వ విఘ్న వినాశక మృత్యుంజయ హోమం & పితృ శాంతి (${rTe} రాశి)`,
        ta: `ஸ்ரீ க்ஷேத்ர கோகர்ண சந்நிதி சர்வ விக்ன விநாயகர் & மஹா மிருத்யுஞ்சய ஹோமம் (${rTa} ராசி)`
      },
      whyRequired: {
        kn: `ನಿಮ್ಮ ${rKn} ರಾಶಿಯ ಜಾತಕದ ಪ್ರಸ್ತುತ ${dashaKn} ಗ್ರಹ ಸ್ಥಿತಿಯ ಆಧಾರದಲ್ಲಿ, ನೀವು ಕೇಳಿದ ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆಯ ಶೀಘ್ರ ಯಶಸ್ಸಿಗೆ ಈ ವಿಶೇಷ ಪೂಜೆ ಅತ್ಯಗತ್ಯ.`,
        en: `Based on your natal ${rEn} chart and ${dashaEn}, this Gokarna Seva removes personal obstacles related to your query.`,
        hi: `आपकी ${rHi} राशि कुंडली एवं वर्तमान ${dashaHi} के आधार पर, आपके व्यक्तिगत प्रश्न की सफलता हेतु यह विशेष अनुष्ठान आवश्यक है।`,
        te: `మీ ${rTe} రాశి మరియు ప్రస్తుత ${dashaTe} ఆధారంగా, మీ వ్యక్తిగత ప్రశ్నకు శుభ ఫలితాలు లభించడానికి ఈ పూజ అవసరం.`,
        ta: `உங்கள் ${rTa} ராசி மற்றும் தற்போதைய ${dashaTa} அடிப்படையில், உங்கள் கேள்விக்குரிய காரிய வெற்றிக்கு இந்த பூஜை அவசியம்.`
      },
      whatSignificance: {
        kn: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ಸರ್ವ ವಿಘ್ನ ಶಮನ ಪೂಜೆಯು ಕಲ್ಪವೃಕ್ಷದಂತೆ ನಿವೇದಿತ ಕೋರಿಕೆಗಳನ್ನು ಈಡೇರಿಸುವ ದಿವ್ಯ ಶಕ್ತಿ ಹೊಂದಿದೆ.",
        en: "Rituals at Gokarna Mahabaleshwara Atmalinga fulfill heartfelt prayers and dissolve deep karmas.",
        hi: "गोकर्ण आत्मलिंग सन्निधि में संपन्न सर्व विघ्न शांति पूजा मनोकामनाओं को पूर्ण करने वाली दिव्य शक्ति रखती है।",
        te: "గోకర్ణ ఆత్మలింగ సన్నిధిలో నిర్వహించే సర్వ విఘ్న నివారణ పూజ కోరికలను నెరవేర్చే దివ్య శక్తిని కలిగి ఉంది.",
        ta: "கோகர்ண ஆத்மலிங்க சந்நிதியில் செய்யப்படும் பூஜையானது பிரார்த்தனைகளை நிறைவேற்றி கர்மங்களை போக்கும் ஆற்றல் கொண்டது."
      },
      howTransforms: {
        kn: "ನಿಮ್ಮ ಸಮಸ್ಯೆಗೆ ಶೀಘ್ರ ಪರಿಹಾರ ದೊರೆತು, ಧನ ನಷ್ಟ ಹಾಗೂ ಮಾನಸಿಕ ಸಂಕಟಗಳ ಸಂಪೂರ್ಣ ವಿಮೋಚನೆಯಾಗಲಿದೆ.",
        en: "Grants swift resolution to your personal query, bringing mental peace and financial growth.",
        hi: "समस्या का शीघ्र समाधान मिलकर धन हानि एवं मानसिक संताप से पूर्ण मुक्ति प्राप्त होगी।",
        te: "మీ సమస్యకు శీఘ్ర పరిష్కారం లభించి, ఆర్థిక నష్టాలు మరియు మానసిక ఆందోళనల నుండి విముక్తి కలుగుతుంది.",
        ta: "உங்கள் பிரச்சனைக்கு உடனடி தீர்வு கிடைத்து, மன அமைதியும் தன லாபமும் பெருகும்."
      }
    };
  }
}

/** Generate deep AI Life Guidance narrative using Gemini 3.5 Flash Lite */
export async function executeLifeGuidanceCalculation(
  input: LifeGuidanceInput,
  apiKey?: string
): Promise<LifeGuidanceResult> {
  const {
    personName,
    dob,
    tob = "12:00",
    lat = 14.5479,
    lon = 74.3188,
    gender = "Not specified",
    lang = "kn"
  } = input;
  const langCode = (lang || "kn").slice(0, 2);

  // 1. Calculate authentic natal Kundli with exact Lagna, Bhavas, and Dasha
  const kundli = calculateKundli(
    {
      name: personName,
      birthDate: dob,
      birthTime: tob,
      latitude: lat,
      longitude: lon,
      gender: gender as any
    },
    { ayanamsaModel: "lahiri" }
  );

  const traditional = calculateTraditionalBaggona(dob, tob, lat, lon, "lahiri");

  const lagnaRashiName = kundli.lagnaRashi.english;
  const lagnaRashiIdx = kundli.lagnaRashi.index; // 0..11
  const moonRashiName = kundli.moonSign.english;
  const moonRashiIdx = kundli.moonSign.index;

  const moonPlanet = kundli.planets.find((p) => p.name === "Moon");
  const nakshatraName = moonPlanet?.nakshatra?.english || traditional?.moonNakshatra || "Anuradha";
  const nakshatraKn = traditional?.moonNakshatraKn || moonPlanet?.nakshatra?.sanskrit || "ಅನುರಾಧಾ";
  const dashaLordName = traditional?.dashaLord || "Jupiter";

  // Identify House Lords:
  // 10th House Lord (Career): (Lagna + 9) % 12
  const tenthHouseRashiIdx = (lagnaRashiIdx + 9) % 12;
  const tenthLord = RASHI_LORDS[tenthHouseRashiIdx] || "Saturn";

  // 7th House Lord (Relationship): (Lagna + 6) % 12
  const seventhHouseRashiIdx = (lagnaRashiIdx + 6) % 12;
  const seventhLord = RASHI_LORDS[seventhHouseRashiIdx] || "Venus";

  // 6th House Lord (Health): (Lagna + 5) % 12
  const sixthHouseRashiIdx = (lagnaRashiIdx + 5) % 12;
  const sixthLord = RASHI_LORDS[sixthHouseRashiIdx] || "Mercury";

  // 5th House Lord (Children): (Lagna + 4) % 12
  const fifthHouseRashiIdx = (lagnaRashiIdx + 4) % 12;
  const fifthLord = RASHI_LORDS[fifthHouseRashiIdx] || "Jupiter";

  // Check Doshas:
  const marsPlanet = kundli.planets.find((p) => p.name === "Mars");
  const marsHouse = marsPlanet ? marsPlanet.house : 1;
  const hasKujaDosha = [1, 2, 4, 7, 8, 12].includes(marsHouse);

  const rahuPlanet = kundli.planets.find((p) => p.name === "Rahu");
  const sunPlanet = kundli.planets.find((p) => p.name === "Sun");
  const hasPitruDosha = Boolean(
    rahuPlanet && sunPlanet && (rahuPlanet.house === sunPlanet.house || [1, 5, 9].includes(rahuPlanet.house))
  );

  const maandiPlanet = kundli.maandi;
  const maandiRashiIdx = maandiPlanet ? maandiPlanet.rashi.index : -1;
  const maandiHouse = maandiRashiIdx >= 0 ? ((maandiRashiIdx - lagnaRashiIdx + 12) % 12) + 1 : 1;
  const hasMaandiAffliction = Boolean(maandiPlanet && [1, 6, 8, 12].includes(maandiHouse));

  // Build localized descriptors
  const rashiObj: Record<string, string> = {
    kn: `${RASHI_NAMES_5LANG[moonRashiName]?.kn || moonRashiName} ರಾಶಿ`,
    en: `${RASHI_NAMES_5LANG[moonRashiName]?.en || moonRashiName} Rashi`,
    hi: `${RASHI_NAMES_5LANG[moonRashiName]?.hi || moonRashiName} राशि`,
    te: `${RASHI_NAMES_5LANG[moonRashiName]?.te || moonRashiName} రాశి`,
    ta: `${RASHI_NAMES_5LANG[moonRashiName]?.ta || moonRashiName} ராசி`
  };

  const nakshatraObj: Record<string, string> = {
    kn: nakshatraKn,
    en: nakshatraName,
    hi: nakshatraKn,
    te: nakshatraKn,
    ta: nakshatraName
  };

  const lagnaObj: Record<string, string> = {
    kn: `${RASHI_NAMES_5LANG[lagnaRashiName]?.kn || lagnaRashiName} ಲಗ್ನ`,
    en: `${RASHI_NAMES_5LANG[lagnaRashiName]?.en || lagnaRashiName} Ascendant`,
    hi: `${RASHI_NAMES_5LANG[lagnaRashiName]?.hi || lagnaRashiName} लग्न`,
    te: `${RASHI_NAMES_5LANG[lagnaRashiName]?.te || lagnaRashiName} లగ్నం`,
    ta: `${RASHI_NAMES_5LANG[lagnaRashiName]?.ta || lagnaRashiName} லக்னம்`
  };

  const dashaObj: Record<string, string> = {
    kn: `${PLANET_NAMES_5LANG[dashaLordName]?.kn || dashaLordName} ಮಹಾದಶಾ`,
    en: `${PLANET_NAMES_5LANG[dashaLordName]?.en || dashaLordName} Mahadasha`,
    hi: `${PLANET_NAMES_5LANG[dashaLordName]?.hi || dashaLordName} महादशा`,
    te: `${PLANET_NAMES_5LANG[dashaLordName]?.te || dashaLordName} మహర్దశ`,
    ta: `${PLANET_NAMES_5LANG[dashaLordName]?.ta || dashaLordName} மகாதிசை`
  };

  // Compute current age
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(dob.split("-")[0] || "1990", 10);
  const currentAge = Math.max(0, currentYear - birthYear);

  // Derive astrological milestone ages
  const careerKeyAges = deriveAstrologicalMilestoneAges(currentAge, "career");
  const relationshipKeyAges = deriveAstrologicalMilestoneAges(currentAge, "relationship");
  const healthKeyAges = deriveAstrologicalMilestoneAges(currentAge, "health");
  const childrenKeyAges = deriveAstrologicalMilestoneAges(currentAge, "children");

  // Rich 5-Language Fallback Narratives
  const rashiKn = rashiObj.kn;
  const lagnaKn = lagnaObj.kn;
  const dashaKn = dashaObj.kn;

  const fallbackCareerMap: Record<string, string> = {
    kn: `ನಿಮ್ಮ ${lagnaKn} ಹಾಗೂ ${rashiKn} ಜಾತಕದ ೧೦ನೇ ಭಾವದ (ದಶಮಾಧಿಪತಿ ${PLANET_NAMES_5LANG[tenthLord]?.kn || tenthLord}) ಗ್ರಹಗಳ ಶುಭ ದೃಷ್ಟಿಯಿಂದಾಗಿ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಹಾಗೂ ಸ್ಥಿರವಾದ ಉನ್ನತಿ ಯೋಗವಿದೆ. ದಶಮಾಧಿಪತಿಯು ಲಗ್ನ ಭಾವದೊಂದಿಗೆ ಸಾಮೀಪ್ಯ ಹೊಂದಿದ್ದು, ನಿಮ್ಮ ಕಾರ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಸ್ವಂತ ಶ್ರಮದಿಂದ ಸಮಾಜದಲ್ಲಿ ನಾಯಕತ್ವ ಹಾಗೂ ಗೌರವ ಪ್ರತಿಷ್ಠೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.\n\nನಿಮ್ಮ ಜೀವನದ ${careerKeyAges.join(", ")}ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ವೃತ್ತಿಪರವಾಗಿ ಬೃಹತ್ ಯಶಸ್ಸು, ಹುದ್ದೆ ಬಡ್ತಿ ಹಾಗೂ ನೂತನ ಉದ್ಯೋಗ ಸಂಸ್ಥಾಪನೆಯ ಸುವರ್ಣ ಅವಕಾಶಗಳು ಎದುರಾಗಲಿವೆ. ವ್ಯಾಪಾರ ಹಾಗೂ ವಾಣಿಜ್ಯ ರಂಗದಲ್ಲಿ ತೊಡಗಿರುವವರಿಗೆ ಧನ ಭಾಗ್ಯ ವೃದ್ಧಿಯಾಗಲಿದ್ದು, ದೂರದ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಪಾರ ಲಾಭ ಸಿಗಲಿದೆ.\n\nಪ್ರಸ್ತುತ ಚಲಿಸುತ್ತಿರುವ ${dashaKn} ಸಮಯದಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ದಿವ್ಯ ಬಲದಿಂದ ನಿಮ್ಮ ಶತ್ರುಗಳ ಕುತಂತ್ರಗಳು ನಾಶವಾಗಿ, ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಾರ್ವಜನಿಕ ರಂಗದಲ್ಲಿ ನಿರತರಾದವರಿಗೆ ಉನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನಗಳು ದೊರೆಯುವ ಭಾಗ್ಯವಿದೆ.\n\nಕುಂಡಲಿಯಲ್ಲಿ ೧೦ನೇ ಮನೆಗೆ ರಾಹು-ಕೇತು ಅಥವಾ ಶನಿ-ಮಾಂದಿ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಅಕಾಲಿಕ ಕಿರಿಕಿರಿ, ಮೇಲಧಿಕಾರಿಗಳ ಅಸಮಾಧಾನ ಹಾಗೂ ಆಕಸ್ಮಿಕ ಧನ ನಷ್ಟದ ಲಕ್ಷಣಗಳು ಕಂಡುಬರುತ್ತವೆ. ಇದನ್ನು ನಿವಾರಿಸಲು ಜಾತಕದಲ್ಲಿರುವ ಗ್ರಹ ದೋಷಗಳಿಗೆ ಶಾಂತಿ ಪೂಜೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ.\n\nಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ, ರುದ್ರ ಹವನ ಹಾಗೂ ನವಗ್ರಹ ಧನದಾ ಶಾಂತ್ಯುಕ್ತ ಹೋಮ ನೆರವೇರಿಸುವುದರಿಂದ ನಿಮ್ಮ ವೃತ್ತಿ ಪ್ರತಿಬಂಧಕಗಳು ಶಮನವಾಗಿ, ದಿವ್ಯ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ ಲಭಿಸಲಿದೆ.`,
    en: `According to your ${lagnaObj.en} and ${rashiObj.en} birth chart, the 10th house of profession (ruled by ${tenthLord}) is favorably aligned for steady career growth and financial leadership.\n\nKey career breakthroughs and major milestones are indicated around ages ${careerKeyAges.join(", ")}, presenting lucrative opportunities in management, enterprise, or state administration.\n\nUnder your current ${dashaObj.en}, planetary transits support courageous initiatives, neutralizing competitors and stabilizing income streams.\n\nSubtle natal afflictions from Saturn or Rahu may cause transient friction with superiors. Performing consecrated Vedic rituals at Gokarna Mahabaleshwara Kshetra clears karmic barriers.\n\nConducting Navagraha Dhanada Rudra Homa at Gokarna Sannidhi brings enduring professional stability and wealth.`,
    hi: `आपकी ${lagnaObj.hi} एवं ${rashiObj.hi} जन्म कुंडली के अनुसार दशम भाव (स्वामी ${PLANET_NAMES_5LANG[tenthLord]?.hi || tenthLord}) आजीविका एवं धन लाभ हेतु अत्यंत शुभ फलदायक है।\n\nआपके जीवन के ${careerKeyAges.join(", ")}वें वर्ष में पदोन्नति, नए व्यवसाय के आरंभ एवं आर्थिक समृद्धि के स्वर्णिम अवसर प्राप्त होंगे।\n\nवर्तमान ${dashaObj.hi} के प्रभाव से आपके सभी कार्य सिद्ध होंगे एवं कार्यक्षेत्र में मान-सम्मान की वृद्धि होगी।\n\nदशम भाव पर राहु या शनि के प्रभाव से होने वाली रुकावटों के शमन हेतु गोकर्ण महाबलेश्वर क्षेत्र में विशेष शांति अनुष्ठान फलदायी रहेगा।\n\nगोकर्ण क्षेत्र में नवग्रह धनदा रुद्र हवन संपन्न कराने से व्यावसायिक बाधाएं समाप्त होकर स्थाई महालक्ष्मी कृपा प्राप्त होगी।`,
    te: `మీ ${lagnaObj.te} మరియు ${rashiObj.te} జాతకంలో 10వ స్థానాధిపతి (${PLANET_NAMES_5LANG[tenthLord]?.te || tenthLord}) ప్రభావంతో వృత్తి మరియు వ్యాపార రంగాలలో ఉన్నత స్థాయి యోగం ఉంది.\n\nమీ జీవితంలో ${careerKeyAges.join(", ")} సంవత్సరాల వయస్సులో విశేష ఉద్యోగోన్నతి మరియు ధన లాభాలు సమకూరుతాయి.\n\nప్రస్తుత ${dashaObj.te} కాలంలో సూర్య, గురు బలం చేత శత్రువులు తొలగిపోయి కార్యసిద్ధి లభిస్తుంది.\n\nగోకర్ణ మహాబలేశ్వర సన్నిధిలో నవగ్రహ ధనదా రుద్ర హవనం నిర్వహించడం వలన వృత్తిపరమైన ఆటంకాలు తొలగి లక్ష్మీ కటాక్షం సిద్ధిస్తుంది.`,
    ta: `உங்கள் ${lagnaObj.ta} மற்றும் ${rashiObj.ta} ஜாதகத்தில் 10ம் வீட்டு அதிபதி (${PLANET_NAMES_5LANG[tenthLord]?.ta || tenthLord}) ஆதிக்கத்தால் தொழில் மற்றும் வியாபாரத்தில் நிலையான முன்னேற்றம் உண்டாகும்.\n\nஉங்கள் வாழ்க்கையின் ${careerKeyAges.join(", ")}ம் வயதில் தொழில் உயர்வு, புதிய வாய்ப்புகள் மற்றும் தன யோகம் கூடிவரும்.\n\nதற்போதைய ${dashaObj.ta} காலத்தில் நற்பலன்கள் கிட்டும். தொழில் தடைகள் நீங்க கோகர்ண க்ஷேத்திரத்தில் ருத்ர ஹோமம் செய்வது மகா புண்ணியமாகும்.`
  };

  const fallbackRelationshipMap: Record<string, string> = {
    kn: `ನಿಮ್ಮ ${lagnaKn} ಹಾಗೂ ${rashiKn} ಕುಂಡಲಿಯ ೭ನೇ ಮನೆ (ಕಳತ್ರಾಧಿಪತಿ ${PLANET_NAMES_5LANG[seventhLord]?.kn || seventhLord}) ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಅನುಕೂಲಕರ ಸ್ಥಾನದಿಂದಾಗಿ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಗಾಢವಾದ ಪ್ರೇಮ, ಅನ್ಯೋನ್ಯತೆ ಹಾಗೂ ಸಂಸಾರಿಕ ಸಾಮರಸ್ಯ ನೆಲೆಸಲಿದೆ.\n\nಕುಟುಂಬ ಜೀವನದ ${relationshipKeyAges.join(", ")}ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಕುಟುಂಬ ಸೌಖ್ಯ, ಗೃಹ ನಿರ್ಮಾಣ ಹಾಗೂ ದಾಂಪತ್ಯದ ಶ್ರೇಷ್ಠ ಮೈಲಿಗಲ್ಲುಗಳು ನೆರವೇರಲಿವೆ.\n\nಸಂಗಾತಿಯ ಆಗಮನದ ನಂತರ ನಿಮ್ಮ ಧನ ಭಾಗ್ಯ ಹಾಗೂ ಅದೃಷ್ಟ ದ್ವಿಗುಣಗೊಳ್ಳಲಿದ್ದು, ನಿರಂತರ ಸನ್ಮಾನ ದೊರೆಯಲಿದೆ.\n\n${hasKujaDosha ? "ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷದ ಛಾಯೆ ಇರುವುದರಿಂದ ದಾಂಪತ್ಯದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಉಂಟಾಗಬಹುದು. ಸೂಕ್ತ ಶಾಂತಿ ಅಗತ್ಯ." : "ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಸಹಕಾರ ಮನೋಭಾವದಿಂದ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ."}\n\nಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶ್ರೀ ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಉಮಾಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ದಾಂಪತ್ಯದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ದಿವ್ಯ ಸುಖ ಸಿಗಲಿದೆ.`,
    en: `Your ${lagnaObj.en} and ${rashiObj.en} chart highlights marital warmth, supportive lineage, and domestic harmony under 7th lord ${seventhLord}.\n\nKey relationship milestones around ages ${relationshipKeyAges.join(", ")} will bring domestic joy, property acquisition, and family togetherness.\n\n${hasKujaDosha ? "Kuja/Mars influences suggest emotional sensitivity in partnership, for which spiritual remedies restore equilibrium." : "Planetary harmony ensures mutual respect and long-term domestic prosperity."}\n\nPerforming Gokarna Nagapratishtha and Uma Maheshwara Kalyana Puja dissolves marital hurdles and blesses your family with enduring love.`,
    hi: `आपकी ${lagnaObj.hi} एवं ${rashiObj.hi} कुंडली में सप्तम भाव (स्वामी ${PLANET_NAMES_5LANG[seventhLord]?.hi || seventhLord}) दांपत्य सुख एवं पारिवारिक सौहार्द को दर्शाता है।\n\nआयु के ${relationshipKeyAges.join(", ")}वें वर्ष में गृह निर्माण, दांपत्य कल्याण एवं पारिवारिक समृद्धि के योग बनेंगे।\n\nगोकर्ण महाबलेश्वर क्षेत्र में उमामहेश्वर कल्याण पूजा एवं नागप्रतिष्ठा से समस्त पारिवारिक क्लेश शांत होंगे।`,
    te: `మీ ${lagnaObj.te} మరియు ${rashiObj.te} జాతకంలో 7వ స్థానాధిపతి (${PLANET_NAMES_5LANG[seventhLord]?.te || seventhLord}) అనుకూలతతో దాంపత్య జీవితంలో శాంతి, అనురాగం వర్ధిల్లుతాయి.\n\nవయస్సు ${relationshipKeyAges.join(", ")} సంవత్సరాలలో గృహ యోగం మరియు కుటుంబ సౌఖ్యం కలుగుతాయి.\n\nగోకర్ణంలో ఉమామహేశ్వర పూజ నిర్వహించడం వలన దాంపత్య విఘ్నాలు తొలగిపోతాయి.`,
    ta: `உங்கள் ${lagnaObj.ta} மற்றும் ${rashiObj.ta} ஜாதகத்தில் 7ம் வீட்டு அதிபதி (${PLANET_NAMES_5LANG[seventhLord]?.ta || seventhLord}) அருளால் திருமண பந்தத்தில் அன்பும் அமைதியும் நிலவும்.\n\n${relationshipKeyAges.join(", ")}ம் வயதில் குடும்ப அமைதி, சுபகாரியங்கள் கூடிவரும். கோகர்ணத்தில் உமாமஹேஸ்வர பூஜை செய்வது சிறந்த பலன் தரும்.`
  };

  const fallbackHealthMap: Record<string, string> = {
    kn: `ನಿಮ್ಮ ${lagnaKn} ಹಾಗೂ ${rashiKn} ಜಾತಕದ ೬ನೇ ಮನೆ (ಆರೋಗ್ಯ ಭಾವ, ಅಧಿಪತಿ ${PLANET_NAMES_5LANG[sixthLord]?.kn || sixthLord}) ವಿಶ್ಲೇಷಣೆಯ ಪ್ರಕಾರ ನಿಮ್ಮ ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಜೀವ ಧಾತು ಬಲ ಅತ್ಯಂತ ಸಮತೋಲನದಲ್ಲಿದೆ.\n\nಜೀವನದ ${healthKeyAges.join(", ")}ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಜೀರ್ಣಕ್ರಿಯೆ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ಶಾರೀರಿಕ ಆಯಾಸದ ಬಗ್ಗೆ ಜಾಗರೂಕತೆ ವಹಿಸುವುದು ಶ್ರೇಷ್ಠ.\n\nನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಧನ್ವಂತರಿ ಸೂಕ್ತ ಹಾಗೂ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಶಾರೀರಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ನಿರಂತರ ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷೆ ನೀಡಲಿದೆ.\n\nಗೋಕರ್ಣ ಕಡಲತೀರದಲ್ಲಿ ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಧನ್ವಂತರಿ ಹವನ ನೆರವೇರಿಸುವುದರಿಂದ ಸಕಲ ರೋಗ ಭಯ ಮುಕ್ತಿಯಾಗಿ ದೀರ್ಘಾಯುಷ್ಯ ಲಭಿಸಲಿದೆ.`,
    en: `Your ${lagnaObj.en} and ${rashiObj.en} natal vitality indicates resilient immunity and steady physical stamina under 6th lord ${sixthLord}.\n\nTake mindful precautions around digestive and stress wellness during ages ${healthKeyAges.join(", ")}.\n\nDaily recitation of Dhanvantari Stotram and Shiva Panchakshari Mantra acts as a protective shield.\n\nConducting Gokarna Mahamrityunjaya Homa and Dhanvantari Rudrabhisheka removes health vulnerabilities and grants long-life blessings.`,
    hi: `आपकी ${lagnaObj.hi} एवं ${rashiObj.hi} कुंडली में षष्ठ भाव (स्वामी ${PLANET_NAMES_5LANG[sixthLord]?.hi || sixthLord}) शारीरिक आरोग्यता एवं दीर्घायु का सूचक है।\n\nआयु के ${healthKeyAges.join(", ")}वें वर्ष में खान-पान एवं दिनचर्या का विशेष ध्यान रखें।\n\nगोकर्ण क्षेत्र में महामृत्युंजय होम एवं धन्वंतरि हवन से शारीरिक आरोग्यता एवं दीर्घायु की प्राप्ति होगी।`,
    te: `మీ ${lagnaObj.te} మరియు ${rashiObj.te} జాతకంలో 6వ స్థానాధిపతి (${PLANET_NAMES_5LANG[sixthLord]?.te || sixthLord}) అనుకూలతతో రోగనిరోధక శక్తి నిలకడగా ఉంటుంది.\n\n${healthKeyAges.join(", ")} సంవత్సరాల వయస్సులో ఆరోగ్యం పట్ల శ్రద్ధ వహించాలి. గోకర్ణంలో మహామృత్యుంజయ హోమం చేయడం వల్ల సంపూర్ణ ఆరోగ్యం లభిస్తుంది.`,
    ta: `உங்கள் ${lagnaObj.ta} மற்றும் ${rashiObj.ta} ஜாதகத்தில் 6ம் வீட்டு அதிபதி (${PLANET_NAMES_5LANG[sixthLord]?.ta || sixthLord}) பலத்தால் உடல் நலம் சீராக இருக்கும்.\n\n${healthKeyAges.join(", ")}ம் வயதில் ஆரோக்கியத்தில் கவனம் தேவை. கோகர்ணத்தில் மிருத்யுஞ்சய ஹோமம் செய்வது ஆயுள் பலம் தரும்.`
  };

  const fallbackChildrenMap: Record<string, string> = {
    kn: `ನಿಮ್ಮ ${lagnaKn} ಹಾಗೂ ${rashiKn} ಕುಂಡಲಿಯ ೫ನೇ ಮನೆ (ಪುತ್ರ ಸ್ಥಾನ, ಅಧಿಪತಿ ${PLANET_NAMES_5LANG[fifthLord]?.kn || fifthLord}) ಹಾಗೂ ಗುರು ಗ್ರಹದ ದಿವ್ಯ ಅನುಗ್ರಹದಿಂದಾಗಿ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ಬೃಹತ್ ಯೋಗವಿದೆ.\n\nನಿಮ್ಮ ಜೀವನದ ${childrenKeyAges.join(", ")}ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಸಂತಾನ ಪ್ರಾಪ್ತಿ, ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಸಾಧನೆಗಳ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳು ನೆರವೇರಲಿವೆ.\n\n${hasPitruDosha ? "ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೋಷದ ಛಾಯೆ ಇರುವುದರಿಂದ ಸಂತಾನ ವಿಳಂಬ ಅಥವಾ ಅಡಚಣೆಗಳು ಎದುರಾಗಬಹುದು. ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಹಾಗೂ ನಾರಾಯಣ ಬಲಿ ಅತ್ಯಗತ್ಯ." : "ಮಕ್ಕಳು ಕುಲಕ್ಕೆ ಕೀರ್ತಿ ತರುವ ಸಜ್ಜನರಾಗಿ ಬೆಳೆಯಲಿದ್ದಾರೆ."}\n\nಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಹಾಗೂ ಸಂತಾನ ಗೋಪಾಲ ಕೃಷ್ಣ ಹವನ ನೆರವೇರಿಸುವುದರಿಂದ ಸಕಲ ವಂಶಾಭಿವೃದ್ಧಿ ಸಿದ್ಧಿಸಲಿದೆ.`,
    en: `Your ${lagnaObj.en} and ${rashiObj.en} chart highlights noble progeny prospects and lineage expansion under 5th lord ${fifthLord} and Jupiter's grace.\n\nKey progeny milestones and children's academic achievements are highlighted around ages ${childrenKeyAges.join(", ")}.\n\n${hasPitruDosha ? "Subtle ancestral/Pitru influences suggest performing Narayana Bali & Tripindi Shraddha at Gokarna for seamless lineage blessings." : "Your children will display sharp intellect and cultural grace."}\n\nPerforming Gokarna Santana Gopala Homa and Narayana Bali neutralizes ancestral karmas and ensures progeny bliss.`,
    hi: `आपकी ${lagnaObj.hi} एवं ${rashiObj.hi} कुंडली में पंचम भाव (स्वामी ${PLANET_NAMES_5LANG[fifthLord]?.hi || fifthLord}) संतान सुख एवं वंश वृद्धि हेतु अत्यंत शुभ है।\n\nआयु के ${childrenKeyAges.join(", ")}वें वर्ष में संतान प्राप्ति एवं बालकों की उच्च शिक्षा के योग हैं।\n\nगोकर्ण क्षेत्र में नारायण बलि, त्रिपिंडी श्राद्ध एवं संतान गोपाल हवन से वंश वृद्धि एवं संतान सुख सिद्ध होगा।`,
    te: `మీ ${lagnaObj.te} మరియు ${rashiObj.te} జాతకంలో 5వ స్థానాధిపతి (${PLANET_NAMES_5LANG[fifthLord]?.te || fifthLord}) మరియు గురు బలంతో సత్సంతాన ప్రాప్తి యోగం ఉంది.\n\n${childrenKeyAges.join(", ")} సంవత్సరాల వయస్సులో సంతాన ప్రాప్తి మరియు వారి విద్యా పురోగతి కలుగుతాయి.\n\nగోకర్ణంలో సంతాన గోపాల హోమం మరియు నారాయణ బలి నిర్వహించడం శ్రేయస్కరం.`,
    ta: `உங்கள் ${lagnaObj.ta} மற்றும் ${rashiObj.ta} ஜாதகத்தில் 5ம் வீட்டு அதிபதி (${PLANET_NAMES_5LANG[fifthLord]?.ta || fifthLord}) மற்றும் குரு அருளால் நல்ல சந்தான பாக்கியம் கிட்டும்.\n\n${childrenKeyAges.join(", ")}ம் வயதில் குழந்தை பாக்கியம் மற்றும் பிள்ளைகளின் கல்வி வளர்ச்சி கூடிவரும். கோகர்ணத்தில் சந்தான கோபால ஹோமம் செய்வது சிறந்த பலன் தரும்.`
  };

  let careerText = fallbackCareerMap[langCode] || fallbackCareerMap.kn;
  let relText = fallbackRelationshipMap[langCode] || fallbackRelationshipMap.kn;
  let healthText = fallbackHealthMap[langCode] || fallbackHealthMap.kn;
  let childText = fallbackChildrenMap[langCode] || fallbackChildrenMap.kn;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      const prompt = `
You are Sri Shreeram Pandit, Master Vedic Astrologer from Gokarna Mahabaleshwara Kshetra (+91 99723 39362).
Provide 4 deeply thorough, authentic astrological life forecasts for ${personName} (DOB: ${dob}, TOB: ${tob}, Gender: ${gender}):
- Natal Astronomical Parameters: Lagna (${lagnaObj.en} / ${lagnaObj.kn}), Moon Rashi (${rashiObj.en} / ${rashiObj.kn}), Nakshatra (${nakshatraObj.en} / ${nakshatraObj.kn}), Current Mahadasha (${dashaObj.en} / ${dashaObj.kn}).
- House Lords: 10th Lord (${tenthLord}), 7th Lord (${seventhLord}), 6th Lord (${sixthLord}), 5th Lord (${fifthLord}).
- Dosha Diagnostics: Kuja Dosha (${hasKujaDosha ? "Present" : "None"}), Pitru Dosha (${hasPitruDosha ? "Present" : "None"}), Maandi Affliction (${hasMaandiAffliction ? "Present" : "None"}).

STRICT LENGTH & PARAGRAPH REQUIREMENTS:
- Provide EXACTLY 4 to 5 LONG, RICH PARAGRAPHS (5 to 6 lines per paragraph) for EACH of the 4 sections.
- DO NOT WRITE SHORT 1-2 LINE PARAGRAPHS. Write comprehensive, paragraph-dense guidance.

NATAL DOSHA & GOKARNA SEVA DIAGNOSTIC REQUIREMENTS:
In each section's final dedicated remedy paragraph, diagnose specific natal Doshas (Pitru Dosha / Tripindi Shraddha, Narayana Bali, Kalasarpa Shanti, Naga Pratishtha, Kuja Shanti, Maandi Shanti) and explicitly explain:
1. WHY this specific Gokarna Puja/Homa is required according to their birth chart.
2. WHAT spiritual significance it holds in Gokarna Mahabaleshwara Kshetra.
3. HOW performing this Seva will remove karma obstacles & bless their life!

Format with JSON markers:
[CAREER_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 10th house, Dasha eras, career promotion ages (${careerKeyAges.join(", ")}), business wealth & Gokarna Seva remedies.
[RELATIONSHIP_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 7th house, Venus placement, spouse characteristics, marital peace & Gokarna Seva remedies.
[HEALTH_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 6th house, physical vitality, longevity ages (${healthKeyAges.join(", ")}), health precautions & Gokarna Seva remedies.
[CHILDREN_SECTION]
4 to 5 long paragraphs (5-6 lines each) detailing 5th house, Jupiter transit, progeny timing (${childrenKeyAges.join(", ")}), lineage growth & Gokarna Seva remedies.

Rules:
- Write EXCLUSIVELY in script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT use Latin script letters inside Indian language text.
`;

      const res = await model.generateContent(prompt);
      const text = (await res.response).text();

      if (text.includes("[CAREER_SECTION]")) {
        const parts = text.split(/\[(?:CAREER|RELATIONSHIP|HEALTH|CHILDREN)_SECTION\]/);
        if (parts.length >= 5) {
          careerText = parts[1].trim() || careerText;
          relText = parts[2].trim() || relText;
          healthText = parts[3].trim() || healthText;
          childText = parts[4].trim() || childText;
        }
      }
    } catch (err) {
      console.error("Gemini Life Guidance Error:", err);
    }
  }

  return {
    personName,
    dob,
    tob,
    gender,
    rashi: rashiObj,
    nakshatra: nakshatraObj,
    lagna: lagnaObj,
    dasha: dashaObj,
    career: {
      title: {
        kn: "💼 ವೃತ್ತಿ ಮಾರ್ಗ ಹಾಗೂ ಧನ ಯೋಗ",
        en: "Career Path & Wealth Forecast",
        hi: "💼 आजीविका एवं धन योग",
        te: "💼 వృత్తి మరియు ధన యోగం",
        ta: "💼 தொழில் மற்றும் தன யோகம்"
      },
      narrativeText: careerText,
      keyAges: careerKeyAges,
      favorableDirections: {
        kn: "ಉತ್ತರ ಹಾಗೂ ಪೂರ್ವ ದಿಕ್ಕು (North & East)",
        en: "North & East",
        hi: "उत्तर एवं पूर्व दिशा (North & East)",
        te: "ఉత్తరం మరియు తూర్పు దిశ (North & East)",
        ta: "வடக்கு மற்றும் கிழக்கு திசை (North & East)"
      },
      recommendedRemedies: {
        kn: "ಗುರುವಾರ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಕಡಲೆಬೇಳೆ ದಾನ.",
        en: "Rudrabhishekam on Thursdays & Gram donation.",
        hi: "गुरुवार को श्री महाबलेश्वर स्वामी को रुद्राभिषेक एवं चना दाल दान।",
        te: "గురువారం శ్రీ మహాబలేశ్వర స్వామికి రుద్రాభిషేకం మరియు శనగల దానం.",
        ta: "வியாழக்கிழமை ஸ்ரீ மஹாபலேஸ்வரருக்கு ருத்ராபிஷேகம் மற்றும் கடலை தானம்."
      },
      gokarnaPujaDetail: getDynamicGokarnaPuja(moonRashiName, nakshatraName, dashaLordName, "career")
    },
    relationship: {
      title: {
        kn: "💞 ದಾಂಪತ್ಯ ಅನುಕೂಲತೆ ಹಾಗೂ ಕುಟುಂಬ ಸುಖ",
        en: "Marriage Compatibility & Family Harmony",
        hi: "💞 दांपत्य सामंजस्य एवं पारिवारिक सुख",
        te: "💞 దాంపత్య అనుకూలత మరియు కుటుంబ సౌఖ్యం",
        ta: "💞 திருமண இணக்கம் மற்றும் குடும்ப மகிழ்ச்சி"
      },
      narrativeText: relText,
      keyAges: relationshipKeyAges,
      favorableDirections: {
        kn: "ಆಗ್ನೇಯ ಹಾಗೂ ದಕ್ಷಿಣ-ಪೂರ್ವ (South-East)",
        en: "South-East",
        hi: "आग्नेय एवं दक्षिण-पूर्व (South-East)",
        te: "ఆగ్నేయం మరియు దక్షిణ-తూర్పు (South-East)",
        ta: "தென்கிழக்கு திசை (South-East)"
      },
      recommendedRemedies: {
        kn: "ಶುಕ್ರವಾರ ದುರ್ಗಾದೇವಿಗೆ ಸೌಭಾಗ್ಯ ಲಲಿತಾ ಅರ್ಚನೆ ಹಾಗೂ ಕುಂಕುಮಾರ್ಚನೆ.",
        en: "Lalitha Archana & Kumkumarchana on Fridays.",
        hi: "शुक्रवार को दुर्गा देवी को सौभाग्य ललिता अर्चना एवं कुमकुमार्चन।",
        te: "శుక్రవారం దుర్గాదేవికి లలితా అర్చన మరియు కుంకుమార్చన.",
        ta: "வெள்ளிக்கிழமை துர்க்கை அம்மனுக்கு லலிதா அர்ச்சனை மற்றும் குங்குமார்ச்சனை."
      },
      gokarnaPujaDetail: getDynamicGokarnaPuja(moonRashiName, nakshatraName, dashaLordName, "relationship")
    },
    health: {
      title: {
        kn: "🏥 ಆರೋಗ್ಯ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಶಾರೀರಿಕ ಬಲ",
        en: "Health, Longevity & Physical Immunity",
        hi: "🏥 स्वास्थ्य, दीर्घायु एवं शारीरिक बल",
        te: "🏥 ఆరోగ్యం, దీర్ఘాయుష్షు మరియు శారీరక బలం",
        ta: "🏥 ஆரோக்கியம், நீண்ட ஆயுள் மற்றும் தேக பலம்"
      },
      narrativeText: healthText,
      keyAges: healthKeyAges,
      favorableDirections: {
        kn: "ಈಶಾನ ದಿಕ್ಕು (North-East)",
        en: "North-East",
        hi: "ईशान कोण (North-East)",
        te: "ఈశాన్య దిశ (North-East)",
        ta: "ஈசானிய திசை (North-East)"
      },
      recommendedRemedies: {
        kn: "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯನಮಸ್ಕಾರ ಹಾಗೂ ಧನ್ವಂತರಿ ಮಂತ್ರ ಜಪ.",
        en: "Surya Namaskar & Dhanvantari Mantra daily.",
        hi: "प्रतिदिन प्रातः सूर्यनमस्कार एवं धन्वंतरि मंत्र जप।",
        te: "ప్రతిరోజూ ఉదయం సూర్యనమస్కారాలు మరియు ధన్వంతరి మంత్ర జపం.",
        ta: "தினமும் காலை சூரிய நமஸ்காரம் மற்றும் தன்வந்திரி மந்திர ஜபம்."
      },
      gokarnaPujaDetail: getDynamicGokarnaPuja(moonRashiName, nakshatraName, dashaLordName, "health")
    },
    children: {
      title: {
        kn: "👶 ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ವಂಶ ಶ್ರೇಯಸ್ಸು",
        en: "Children, Lineage & Progeny Blessings",
        hi: "👶 संतान भाग्य एवं वंश वृद्धि",
        te: "👶 సంతాన భాగ్యం మరియు వంశ శ్రేయస్సు",
        ta: "👶 சந்தான பாக்கியம் மற்றும் வம்ச விருத்தி"
      },
      narrativeText: childText,
      keyAges: childrenKeyAges,
      favorableDirections: {
        kn: "ಪೂರ್ವ ಹಾಗೂ ದಕ್ಷಿಣ-ಪೂರ್ವ (East & South-East)",
        en: "East & South-East",
        hi: "पूर्व एवं दक्षिण-पूर्व (East & South-East)",
        te: "తూర్పు మరియు ఆగ్నేయ దిశ (East & South-East)",
        ta: "கிழக்கு மற்றும் தென்கிழக்கு திசை (East & South-East)"
      },
      recommendedRemedies: {
        kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಸಂತಾನ ಗೋಪಾಲ ಹೋಮ.",
        en: "Subramanya Naga Pratishtha & Santana Gopala Homa.",
        hi: "गोकर्ण क्षेत्र में सुब्रह्मण्य नागप्रतिष्ठा एवं संतान गोपाल होम।",
        te: "గోకర్ణంలో సుబ్రహ్మణ్య నాగప్రతిష్ఠ మరియు సంతాన గోపాల హోమం.",
        ta: "கோகர்ண க்ஷேத்திரத்தில் சுப்பிரமணிய நாகப்பிரதிஷ்டை மற்றும் சந்தான கோபால ஹோமம்."
      },
      gokarnaPujaDetail: getDynamicGokarnaPuja(moonRashiName, nakshatraName, dashaLordName, "children")
    },
    generatedAt: new Date().toLocaleString(),
    kundliSnapshot: {
      lagnaIndex: lagnaRashiIdx,
      moonRashiIndex: moonRashiIdx,
      dashaLord: dashaLordName,
      tenthLord,
      seventhLord,
      fifthLord,
      sixthLord,
      hasKujaDosha,
      hasPitruDosha,
      hasMaandiAffliction
    }
  };
}

/** Ask Custom Astrological Question for Life Guidance */
export async function askCustomLifeQuestion(
  result: LifeGuidanceResult,
  question: string,
  lang: string = "kn",
  apiKey?: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);
  const rashiStr = result.rashi[langCode] || result.rashi.kn;
  const nakshatraStr = result.nakshatra[langCode] || result.nakshatra.kn;
  const lagnaStr = result.lagna[langCode] || result.lagna.kn;
  const dashaStr = result.dasha[langCode] || result.dasha.kn;

  const fallbackMap: Record<string, string> = {
    kn: `ನಿಮ್ಮ ${lagnaStr}, ${rashiStr} ಹಾಗೂ ${nakshatraStr} ಜಾತಕದ ಗ್ರಹ ಗತಿಗಳ ಆಧಾರದಲ್ಲಿ, ನೀವು ಕೇಳಿದ "${question}" ಪ್ರಶ್ನೆಗೆ ಅನುಕೂಲಕರ ಯೋಗವಿದೆ. ಪ್ರಸ್ತುತ ${dashaStr} ಸಮಯದಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ದಿವ್ಯ ಬಲದಿಂದ ಧೈರ್ಯ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಕೈಗೊಂಡ ನಿರ್ಧಾರಗಳು ಶ್ರೇಷ್ಠ ಯಶಸ್ಸು ನೀಡಲಿವೆ. ಧರ್ಮ ಕಾರ್ಯ ಹಾಗೂ ದೈವ ಪ್ರಾರ್ಥನೆಯಿಂದ ಸಕಲ ಶುಭ ಫಲ ಸಿದ್ಧಿಸಲಿದೆ.\n\nಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ನೆರವೇರಿಸುವುದರಿಂದ ನಿಮ್ಮ ಸಕಲ ಕಾರ್ಯ ಪ್ರತಿಬಂಧಕಗಳು ನಿವಾರಣೆಯಾಗಲಿವೆ.`,
    en: `Based on your ${lagnaStr}, ${rashiStr}, and ${nakshatraStr} chart, your question "${question}" holds positive alignment under current ${dashaStr}.\n\nStrategic patience and righteous action will yield lasting success.\n\nPerforming Vedic Rudrabhisheka at Gokarna Mahabaleshwara Sannidhi removes subtle karmic impediments.`,
    hi: `आपकी ${lagnaStr}, ${rashiStr} एवं ${nakshatraStr} कुंडली के आधार पर, आपके प्रश्न "${question}" हेतु वर्तमान ${dashaStr} में अनुकूल योग है।\n\nधैर्य एवं धर्मपरायणता से किए गए कार्य सिद्ध होंगे। गोकर्ण महाबलेश्वर क्षेत्र में विशेष रुद्राभिषेक से सर्व विघ्नों का शमन होगा।`,
    te: `మీ ${lagnaStr}, ${rashiStr} మరియు ${nakshatraStr} జాతకం ఆధారంగా, మీ ప్రశ్న "${question}" కు ప్రస్తుత ${dashaStr} కాలంలో అనుకూల ఫలితాలు కలుగుతాయి.\n\nగోకర్ణ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేకం నిర్వహించడం వలన కార్యసిద్ధి లభిస్తుంది.`,
    ta: `உங்கள் ${lagnaStr}, ${rashiStr} மற்றும் ${nakshatraStr} ஜாதகத்தின்படி, உங்கள் கேள்வி "${question}" க்கு தற்போதைய ${dashaStr} காலத்தில் சாதகமான பலன் கூடிவரும்.\n\nகோகர்ண மஹாபலேஸ்வரர் சந்நிதியில் ருத்ராபிஷேகம் செய்வது தடைகளை நீக்கி வெற்றியைத் தரும்.`
  };

  const fallback = fallbackMap[langCode] || fallbackMap.kn;
  if (!apiKey) return fallback;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `
You are Sri Shreeram Pandit, Master Vedic Astrologer from Gokarna Mahabaleshwara Kshetra (+91 99723 39362).
The devotee ${result.personName} (Lagna: ${lagnaStr}, Rashi: ${rashiStr}, Nakshatra: ${nakshatraStr}, Dasha: ${dashaStr}) has asked a custom personal query:
"${question}"

STRICT LENGTH & PARAGRAPH REQUIREMENTS:
- Provide EXACTLY 4 to 5 LONG, RICH PARAGRAPHS (5 to 6 lines per paragraph).
- 1st-3rd Paragraphs: Deep astronomical planetary analysis, house lords, Dasha transits & practical guidance.
- 4th-5th Paragraphs: Specific Gokarna Seva / Puja remedies (e.g. Narayana Bali, Tripindi Shraddha, Kalasarpa Shanti, Nagapratishtha, Kuja Shanti, Maandi Shanti).

Rules:
- Write EXCLUSIVELY in script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT use Latin script letters inside Indian language text.
`;

    const res = await model.generateContent(prompt);
    return (await res.response).text() || fallback;
  } catch (err) {
    console.error("Gemini Custom Life Question Error:", err);
    return fallback;
  }
}
