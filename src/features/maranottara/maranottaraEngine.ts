import { askGemini } from "../../core/GeminiEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import type { MaranottaraLang } from "./maranottaraLocale";

export type MasikaDurationYears = 1 | 2 | 3 | 4 | 5;

export type MaranottaraInput = {
  personName: string;
  demiseDate: string; // YYYY-MM-DD
  demiseTime?: string; // HH:mm (Optional)
  location?: string;
  yearsCount: MasikaDurationYears;
  lang?: MaranottaraLang;
};

export type MasikaScheduleItem = {
  monthIndex: number;
  masikaName: Record<string, string>;
  tithiName: Record<string, string>;
  gregorianDate: string; // YYYY-MM-DD
  formattedDateStr: Record<string, string>; // e.g. "24 Sep 2026"
  dayOfWeek: Record<string, string>;
  paksha: Record<string, string>;
  isVarshikaShraddha: boolean;
  isSpecialMilestone: boolean;
  ritualNotes: Record<string, string>;
};

export type AntyestiDailyRoadmapItem = {
  dayNumber: number;
  dayTitle: Record<string, string>;
  dateStr: string;
  rituals: Record<string, string>;
  significance: Record<string, string>;
  keyOfferings: Record<string, string>;
};

export type PoojaRemedyItem = {
  title: Record<string, string>;
  description: Record<string, string>;
  danaItems: Record<string, string>;
};

export type DoshaAnalysisResult = {
  hasPanchakaDosha: boolean;
  panchakaType?: Record<string, string>;
  hasNakshatraDosha: boolean;
  nakshatraDoshaType?: Record<string, string>;
  hasSandhyaRatriDosha: boolean;
  hasTimeSpecificAnalysis: boolean;
  doshaSummary: Record<string, string>;
  putthaliVidhanaRequired: boolean;
  recommendedPoojas: PoojaRemedyItem[];
};

export type AsthiVisarjanaGuide = {
  optimalTiming: Record<string, string>;
  sacredTirthas: Array<{
    name: Record<string, string>;
    location: Record<string, string>;
    spiritualSignificance: Record<string, string>;
  }>;
  procedureSteps: Record<string, string[]>;
  mantra: string;
};

export type GarudaPuranaWisdom = {
  soulJourneySummary: Record<string, string>;
  pindaDanaMeaning: Record<string, string>;
  vaitaraniGodanaImportance: Record<string, string>;
  mokshaPhilosophy: Record<string, string>;
};

export type MahalayaTarpanaRules = {
  mahalayaOverview: Record<string, string>;
  amavasyaTarpanaProcedure: Record<string, string>;
  essentialDanaItems: Record<string, string[]>;
};

export type GokarnaMokshaSevaInfo = {
  priestName: string;
  priestPhone: string;
  narayanabaliOverview: Record<string, string>;
  tripindiShraddhaOverview: Record<string, string>;
  kshetraImportance: Record<string, string>;
};

export type MaranottaraResult = {
  personName: string;
  demiseDate: string;
  demiseTime?: string;
  location: string;
  yearsCount: MasikaDurationYears;
  demiseTithi: Record<string, string>;
  demiseNakshatra: Record<string, string>;
  demisePaksha: Record<string, string>;
  masikaSchedule: MasikaScheduleItem[];
  antyestiRoadmap: AntyestiDailyRoadmapItem[];
  doshaAnalysis: DoshaAnalysisResult;
  asthiGuide: AsthiVisarjanaGuide;
  garudaWisdom: GarudaPuranaWisdom;
  mahalayaRules: MahalayaTarpanaRules;
  gokarnaSevas: GokarnaMokshaSevaInfo;
  aiConsolationText?: string;
  generatedAt: string;
};

const WEEKDAYS_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு" },
  1: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கள்" },
  2: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்" },
  3: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்" },
  4: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழன்" },
  5: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி" },
  6: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனி" }
};

function formatDateDisplay(d: Date, lang: string = "kn"): string {
  const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsHi = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const monthsTe = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జులై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"];
  const monthsTa = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"];

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (lang === "kn") return `${day} ${monthsKn[monthIdx]} ${year}`;
  if (lang === "hi") return `${day} ${monthsHi[monthIdx]} ${year}`;
  if (lang === "te") return `${day} ${monthsTe[monthIdx]} ${year}`;
  if (lang === "ta") return `${day} ${monthsTa[monthIdx]} ${year}`;
  return `${day} ${monthsEn[monthIdx]} ${year}`;
}

export function compute12DaysRoadmap(demiseDateStr: string, demiseTime?: string): AntyestiDailyRoadmapItem[] {
  const baseDate = new Date(demiseDateStr + (demiseTime ? `T${demiseTime}` : "T12:00:00"));
  const roadmap: AntyestiDailyRoadmapItem[] = [];

  const dayConfigs = [
    {
      day: 1,
      title: {
        kn: "೧ನೇ ದಿನ: ದಹನ ಸಂಸ್ಕಾರ, ಅಸ್ಥಿ ಸಂಚಯನ & ದೀಪ ಸ್ಥಾಪನೆ",
        en: "Day 1: Cremation (Dahana Samskara), Asthi Sanchayana & Akhanda Deepa",
        hi: "प्रथम दिन: दाह संस्कार, अस्थि संचयन एवं अखंड दीप",
        te: "1వ రోజు: దహన సంస్కారం, అస్థి సంచయనం & అఖండ దీపం",
        ta: "1ம் நாள்: தகன சம்ஸ்காரம், அஸ்தி சஞ்சயனம் & தீப ஸ்தாபனம்"
      },
      rituals: {
        kn: "ಶಾಸ್ತ್ರೋಕ್ತ ದಹನ ಸಂಸ್ಕಾರ, ಚಿತಾಭಸ್ಮ/ಅಸ್ಥಿ ಸಂಗ್ರಹ, ಗೃಹದಲ್ಲಿ ನಿರಂತರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಪ್ರಜ್ವಲನ (ದಕ್ಷಿಣಾಭಿಮುಖ).",
        en: "Vedic cremation rites, Asthi collection in sacred urn, and lighting the continuous sesame oil lamp facing south.",
        hi: "शास्त्रोक्त दाह संस्कार, अस्थि संचयन तथा गृह में दक्षिण मुखी अखंड तिल तेल दीप प्रज्वलन।",
        te: "శాస్త్రోక్త దహన సంస్కారం, అస్థి సేకరణ మరియు ఇంట్లో దక్షిణ ముఖంగా అఖండ తిల దీప స్థాపన.",
        ta: "சாஸ்திரோக்த தகன சம்ஸ்காரம், அஸ்தி சேகரிப்பு மற்றும் தெற்கு நோக்கிய அகண்ட எள் எண்ணெய் தீபம்."
      },
      significance: {
        kn: "ಪಂಚಭೂತಗಳಿಂದ ರಚಿತವಾದ ಭೌತಿಕ ದೇಹವನ್ನು ಪಾವಕನಿಗೆ (ಅಗ್ನಿ) ಸಮರ್ಪಿಸಿ ಆತ್ಮದ ಪಯಣಕ್ಕೆ ಬೆಳಕು ನೀಡುವುದು.",
        en: "Releasing the physical vessel into the five elements via Agni and illuminating the soul's passage.",
        hi: "पंचभौतिक देह को अग्नि देव को समर्पित कर जीवात्मा के मार्ग को आलोकित करना।",
        te: "పంచభూతాత్మక దేహాన్ని అగ్నికి సమర్పించి ఆత్మ ప్రయాణానికి వెలుగునివ్వడం.",
        ta: "பஞ்சபூத உடலை அக்னியில் சமர்ப்பித்து ஆன்மாவின் பயணத்திற்கு ஒளியூட்டுதல்."
      },
      keyOfferings: {
        kn: "ಅಗ್ನಿ, ದರ್ಭೆ, ಎಳ್ಳು, ಮಣ್ಣಿನ ಪಾತ್ರೆ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ.",
        en: "Sacred Fire, Darbha grass, Sesame (Tila), Earthen pots, Sesame lamp.",
        hi: "अग्नि, दर्भ, तिल, मृत्तिका पात्र, तिल तेल दीप।",
        te: "అగ్ని, దర్భ, నువ్వులు, మట్టి పాత్ర, తిల దీపం.",
        ta: "அக்னி, தர்ப்பை, எள், மண் பாத்திரம், எள் தீபம்."
      }
    },
    {
      day: 2,
      title: {
        kn: "೨ನೇ ದಿನ: ಪ್ರಥಮ ಪಿಂಡ ಪ್ರದಾನ & ತಿಲಾಂಜಲಿ (ಶಿರ ನಿರ್ಮಾಣ)",
        en: "Day 2: 1st Pinda Dana & Tilanjali (Head Formation)",
        hi: "द्वितीय दिन: प्रथम पिंड दान एवं तिलांजलि (शिर निर्माण)",
        te: "2వ రోజు: ప్రథమ పిండ ప్రదానం & తిలాంజలి (శిరస్సు నిర్మాణం)",
        ta: "2ம் நாள்: முதல் பிண்ட தானம் & திலாஞ்சலி"
      },
      rituals: {
        kn: "ಜಲಾಶಯದ ದಂಡೆಯಲ್ಲಿ ಅಥವಾ ಪವಿತ್ರ ಶಿಲೆಯ ಬಳಿ ೧ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ಎಳ್ಳು-ನೀರಿನ ತರ್ಪಣ ಹಾಗೂ ವಾಸೋದಕ.",
        en: "Offering 1st Pinda at sacred riverbank/stone, sesame water libations (Tilanjali), and Vasodaka.",
        hi: "नदी तट पर प्रथम पिंड अर्पण, तिल-जल तर्पण एवं वासोदक।",
        te: "నదీ తీరంలో 1వ పిండ సమర్పణ, నువ్వుల నీటి తర్పణం మరియు వాసోదకం.",
        ta: "நதிக்கரையில் முதல் பிண்டம் சமர்ப்பணம், எள் நீர் தர்ப்பணம்."
      },
      significance: {
        kn: "ಗರುಡ ಪುರಾಣದಂತೆ ೧ನೇ ದಿನದ ಪಿಂಡದಿಂದ ಪ್ರೇತಾತ್ಮದ 'ಶಿರಸ್ಸು' (ತಲೆ) ಸೂಕ್ಷ್ಮವಾಗಿ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ.",
        en: "According to Garuda Purana, the 1st Pinda forms the subtle head of the Yatana body.",
        hi: "गरुड़ पुराणानुसार प्रथम पिंड से प्रेत आत्मा का सूक्ष्म 'शिर' निर्मित होता है।",
        te: "గరుడ పురాణం ప్రకారం 1వ పిండంతో సూక్ష్మ శిరస్సు రూపుదిద్దుకుంటుంది.",
        ta: "முதல் பிண்டத்தால் ஆன்மாவின் தலை சூட்சுமமாக உருவாகிறது."
      },
      keyOfferings: {
        kn: "ಬೇಯಿಸಿದ ಅನ್ನದ ಪಿಂಡ, ಕಪ್ಪು ಎಳ್ಳು, ಜಲ, ಹಾಲು.",
        en: "Cooked rice Pinda, Black sesame, Pure water, Milk.",
        hi: "पक्व अन्न पिंड, काले तिल, शुद्ध जल, दूध।",
        te: "వండిన అన్నం పిండం, నల్ల నువ్వులు, పవిత్ర జలం, పాలు.",
        ta: "அன்ன பிண்டம், கருப்பு எள், தீர்த்தம், பால்."
      }
    },
    {
      day: 3,
      title: {
        kn: "೩ನೇ ದಿನ: ದ್ವಿತೀಯ ಪಿಂಡ ಪ್ರದಾನ (ಕಣ್ಣು, ಕಿವಿ & ಮೂಗು ನಿರ್ಮಾಣ)",
        en: "Day 3: 2nd Pinda Dana (Eyes, Ears & Nose)",
        hi: "तृतीय दिन: द्वितीय पिंड दान (नेत्र, कर्ण एवं नासिका)",
        te: "3వ రోజు: 2వ పిండ ప్రదానం (కళ్లు, చెవులు & ముక్కు)",
        ta: "3ம் நாள்: 2ம் பிண்ட தானம் (கண், காது, மூக்கு)"
      },
      rituals: {
        kn: "೨ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೨ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ, ಹಾಲು ಹಾಗೂ ನೀರು ಸಮರ್ಪಣೆ.",
        en: "Offering 2nd Pinda, 2 handfuls of Tilanjali, milk and water oblations.",
        hi: "द्वितीय पिंड अर्पण, 2 अंजलि तिलांजलि, दुग्ध एवं जल दान।",
        te: "2వ పిండ సమర్పణ, 2 దోసిళ్ల తిలాంజలి, పాలు మరియు నీటి సమర్పణ.",
        ta: "2ம் பிண்ட சமர்ப்பணம், 2 அஞ்சலி திலாஞ்சலி, பால் & தீர்த்தம்."
      },
      significance: {
        kn: "೨ನೇ ಪಿಂಡದಿಂದ ಕಣ್ಣು, ಕಿವಿ ಮತ್ತು ನಾಸಿಕ ಸೂಕ್ಷ್ಮ ಅಂಗಗಳು ರೂಪುಗೊಳ್ಳುತ್ತವೆ.",
        en: "The 2nd Pinda constructs the subtle organs of perception (eyes, ears, nose).",
        hi: "द्वितीय पिंड से सूक्ष्म नेत्र, कर्ण तथा नासिका निर्मित होते हैं।",
        te: "2వ పిండంతో కళ్లు, చెవులు మరియు నాసిక రూపొందుతాయి.",
        ta: "இரண்டாம் பிண்டத்தால் கண், காது, மூக்கு உருவாகிறது."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ದರ್ಭೆ, ಕಪ್ಪು ಎಳ್ಳು.", en: "Rice Pinda, Darbha, Black sesame.", hi: "अन्न पिंड, दर्भ, काले तिल।", te: "అన్న పిండం, దర్భ, నల్ల నువ్వులు.", ta: "அன்ன பிண்டம், தர்ப்பை, எள்." }
    },
    {
      day: 4,
      title: {
        kn: "೪ನೇ ದಿನ: ತೃತೀಯ ಪಿಂಡ ಪ್ರದಾನ (ಕಂಠ, ಭುಜ & ಎದೆ ನಿರ್ಮಾಣ)",
        en: "Day 4: 3rd Pinda Dana (Throat, Shoulders & Chest)",
        hi: "चतुर्थ दिन: तृतीय पिंड दान (कंठ, कंधे एवं वक्ष)",
        te: "4వ రోజు: 3వ పిండ ప్రదానం (కంఠం, భుజాలు & ఛాతీ)",
        ta: "4ம் நாள்: 3ம் பிண்ட தானம் (கழுத்து, மார்பு)"
      },
      rituals: {
        kn: "೩ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೩ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಮತ್ತು ಪಿತೃ ಮಂತ್ರ ಪಠಣ.",
        en: "Offering 3rd Pinda, 3 libations of Tilanjali, and sacred Vedic ancestral chants.",
        hi: "तृतीय पिंड अर्पण, 3 अंजलि तिलांजलि एवं पितृ मंत्र पाठ।",
        te: "3వ పిండ సమర్పణ, 3 దోసిళ్ల తిలాంజలి మరియు పితృ మంత్ర పఠనం.",
        ta: "3ம் பிண்ட சமர்ப்பணம், 3 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೩ನೇ ಪಿಂಡದಿಂದ ಕಂಠ, ಭುಜ ಹಾಗೂ ಎದೆಯ ಸೂಕ್ಷ್ಮ ಭಾಗವು ರೂಪುಗೊಳ್ಳುತ್ತದೆ.",
        en: "The 3rd Pinda forms the throat, arms, and subtle heart-chest region.",
        hi: "तृतीय पिंड से कंठ, बाहु एवं वक्षस्थल का निर्माण होता है।",
        te: "3వ పిండంతో కంఠం, భుజాలు మరియు ఛాతీ భాగం రూపొందుతుంది.",
        ta: "கழுத்து மற்றும் மார்புப் பகுதி உருவாகிறது."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ಕಪ್ಪು ಎಳ್ಳು, ಮಂತ್ರಜಲ.", en: "Rice Pinda, Black sesame, Sanctified water.", hi: "अन्न पिंड, काले तिल, मंत्र जल।", te: "అన్న పిండం, నల్ల నువ్వులు, మంత్ర జలం.", ta: "அன்ன பிண்டம், எள், மந்திர தீர்த்தம்." }
    },
    {
      day: 5,
      title: {
        kn: "೫ನೇ ದಿನ: ಚತುರ್ಥ ಪಿಂಡ ಪ್ರದಾನ (ನಾಭಿ & ಉದರ ನಿರ್ಮಾಣ)",
        en: "Day 5: 4th Pinda Dana (Navel & Abdomen)",
        hi: "पंचम दिन: चतुर्थ पिंड दान (नाभि एवं उदर)",
        te: "5వ రోజు: 4వ పిండ ప్రదానం (నాభి & ఉదరం)",
        ta: "5ம் நாள்: 4ம் பிண்ட தானம் (தொப்புள், வயிறு)"
      },
      rituals: {
        kn: "೪ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೪ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಹಾಗೂ ನಿರಂತರ ದೀಪ ತೈಲ ಪೂರಣ.",
        en: "Offering 4th Pinda, 4 libations of Tilanjali, and refilling the continuous Akhanda Deepa.",
        hi: "चतुर्थ पिंड अर्पण, 4 अंजलि तिलांजलि तथा अखंड दीप में तैल पूरण।",
        te: "4వ పిండ సమర్పణ, 4 దోసిళ్ల తిలాంజలి మరియు అఖండ దీప నిర్వహణ.",
        ta: "4ம் பிண்ட சமர்ப்பணம், 4 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೪ನೇ ಪಿಂಡದಿಂದ ನಾಭಿ ಮತ್ತು ಉದರ ಕೋಶಗಳು ಸೂಕ್ಷ್ಮವಾಗಿ ಸಿದ್ಧಗೊಳ್ಳುತ್ತವೆ.",
        en: "The 4th Pinda builds the navel, digestive fire, and abdominal subtle core.",
        hi: "चतुर्थ पिंड से नाभि एवं उदर का सूक्ष्म गठन होता है।",
        te: "4వ పిండంతో నాభి మరియు ఉదర కోశాలు రూపుదిద్దుకుంటాయి.",
        ta: "தொப்புள் மற்றும் வயிறுப் பகுதி உருவாகிறது."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ತಾಮ್ರ ಪಾತ್ರೆ ಜಲ.", en: "Rice Pinda, Copper vessel water.", hi: "अन्न पिंड, ताम्र पात्र जल।", te: "అన్న పిండం, రాగి పాత్ర జలం.", ta: "அன்ன பிண்டம், தாமிர பாத்திர தீர்த்தம்." }
    },
    {
      day: 6,
      title: {
        kn: "೬ನೇ ದಿನ: ಪಂಚಮ ಪಿಂಡ ಪ್ರದಾನ (ಕಟಿ & ತೊಡೆಗಳ ನಿರ್ಮಾಣ)",
        en: "Day 6: 5th Pinda Dana (Waist & Thighs)",
        hi: "षष्ठ दिन: पंचम पिंड दान (कटि एवं जंघा)",
        te: "6వ రోజు: 5వ పిండ ప్రదానం (నడుము & తొడలు)",
        ta: "6ம் நாள்: 5ம் பிண்ட தானம் (இடுப்பு, தொடைகள்)"
      },
      rituals: {
        kn: "೫ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ ಮತ್ತು ೫ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ.",
        en: "Offering 5th Pinda and 5 oblations of sesame-infused water.",
        hi: "पंचम पिंड अर्पण तथा 5 अंजलि तिलांजलि।",
        te: "5వ పిండ సమర్పణ మరియు 5 దోసిళ్ల తిలాంజలి.",
        ta: "5ம் பிண்ட சமர்ப்பணம், 5 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೫ನೇ ಪಿಂಡದಿಂದ ಕಟಿ, ತೊಡೆ ಮತ್ತು ಜನನಾಂಗಗಳ ಸೂಕ್ಷ್ಮ ರೂಪ ನಿರ್ಮಾಣ.",
        en: "The 5th Pinda forms the subtle waist, hips, and thighs.",
        hi: "पंचम पिंड से कटि तथा जंघाओं का सूक्ष्म निर्माण होता है।",
        te: "5వ పిండంతో నడుము మరియు తొడలు రూపొందుతాయి.",
        ta: "இடுப்பு மற்றும் தொடைகள் உருவாகின்றன."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ದರ್ಭೆ, ಜಲ.", en: "Rice Pinda, Darbha, Water.", hi: "अन्न पिंड, दर्भ, जल।", te: "అన్న పిండం, దర్భ, జలం.", ta: "அன்ன பிண்டம், தர்ப்பை." }
    },
    {
      day: 7,
      title: {
        kn: "೭ನೇ ದಿನ: ಷಷ್ಠ ಪಿಂಡ ಪ್ರದಾನ (ಮರ್ಮಸ್ಥಾನ & ನರಮಂಡಲ)",
        en: "Day 7: 6th Pinda Dana (Vital Energy Points & Nerves)",
        hi: "सप्तम दिन: षष्ठ पिंड दान (मर्म स्थान एवं नाड़ी मंडल)",
        te: "7వ రోజు: 6వ పిండ ప్రదానం (మర్మ స్థానాలు & నాడులు)",
        ta: "7ம் நாள்: 6ம் பிண்ட தானம் (மர்ம ஸ்தானங்கள்)"
      },
      rituals: {
        kn: "೬ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೬ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಮತ್ತು ಪವಿತ್ರ ಧ್ಯಾಪನ.",
        en: "Offering 6th Pinda, 6 libations of Tilanjali, and sacred ancestral dhyanam.",
        hi: "षष्ठ पिंड अर्पण, 6 अंजलि तिलांजलि एवं पितृ ध्यान।",
        te: "6వ పిండ సమర్పణ, 6 దోసిళ్ల తిలాంజలి.",
        ta: "6ம் பிண்ட சமர்ப்பணம், 6 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೬ನೇ ಪಿಂಡದಿಂದ ಪ್ರಾಣನಾಡಿಗಳು ಮತ್ತು ಮರ್ಮಸ್ಥಾನಗಳು ಸೂಕ್ಷ್ಮವಾಗಿ ಸಂಯೋಜನೆಗೊಳ್ಳುತ್ತವೆ.",
        en: "The 6th Pinda knits the subtle energetic nadis and vital marma points.",
        hi: "षष्ठ पिंड से समस्त प्राण नाड़ियों एवं मर्म स्थानों का समन्वय होता है।",
        te: "6వ పిండంతో ప్రాణ నాడులు మరియు మర్మ స్థానాలు అనుసంధానమవుతాయి.",
        ta: "சூட்சும நாடிகள் மற்றும் நரம்பு மண்டலம் இணைகிறது."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ಕಪ್ಪು ಎಳ್ಳು.", en: "Rice Pinda, Black sesame.", hi: "अन्न पिंड, काले तिल।", te: "అన్న పిండం, నల్ల నువ్వులు.", ta: "அன்ன பிண்டம், எள்." }
    },
    {
      day: 8,
      title: {
        kn: "೮ನೇ ದಿನ: ಸಪ್ತಮ ಪಿಂಡ ಪ್ರದಾನ (ಅಸ್ಥಿ, ಮಜ್ಜೆ & ಚರ್ಮ)",
        en: "Day 8: 7th Pinda Dana (Bones, Marrow & Subtle Skin)",
        hi: "अष्टम दिन: सप्तम पिंड दान (अस्थि, मज्जा एवं त्वचा)",
        te: "8వ రోజు: 7వ పిండ ప్రదానం (ఎముకలు & చర్మం)",
        ta: "8ம் நாள்: 7ம் பிண்ட தானம் (எலும்பு, தோல்)"
      },
      rituals: {
        kn: "೭ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ ಮತ್ತು ೭ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ.",
        en: "Offering 7th Pinda with 7 libations of sesame water.",
        hi: "सप्तम पिंड अर्पण तथा 7 अंजलि तिलांजलि।",
        te: "7వ పిండ సమర్పణ, 7 దోసిళ్ల తిలాంజలి.",
        ta: "7ம் பிண்ட சமர்ப்பணம், 7 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೭ನೇ ಪಿಂಡದಿಂದ ಅಸ್ಥಿ, ಮಜ್ಜೆ, ಧಾತು ಮತ್ತು ಚರ್ಮದ ಸೂಕ್ಷ್ಮ ಕವಚ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        en: "The 7th Pinda completes the subtle skeletal frame, marrow, and sheath.",
        hi: "सप्तम पिंड से अस्थि, मज्जा तथा सूक्ष्म त्वचा का आवरण पूर्ण होता है।",
        te: "7వ పిండంతో ఎముకలు మరియు సూక్ష్మ చర్మ కవచం పూర్తవుతుంది.",
        ta: "எலும்பு, மஜ்ஜை மற்றும் சூட்சும தோல் படலம் நிறைகிறது."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ಹಾಲು, ಜಲ.", en: "Rice Pinda, Milk, Water.", hi: "अन्न पिंड, दूध, जल।", te: "అన్న పిండం, పాలు, జలం.", ta: "அன்ன பிண்டம், பால், நீர்." }
    },
    {
      day: 9,
      title: {
        kn: "೯ನೇ ದಿನ: ಅಷ್ಟಮ ಪಿಂಡ ಪ್ರದಾನ (ಕ್ಷುಧೆ & ತೃಷಾ ಶಮನ ಶಕ್ತಿ)",
        en: "Day 9: 8th Pinda Dana (Capacity for Hunger & Thirst)",
        hi: "नवम दिन: अष्टम पिंड दान (क्षुधा एवं तृषा शमन शक्ति)",
        te: "9వ రోజు: 8వ పిండ ప్రదానం (ఆకలి & దప్పిక ఉపశమనం)",
        ta: "9ம் நாள்: 8ம் பிண்ட தானம் (தாகம், பசி தீர்த்தல்)"
      },
      rituals: {
        kn: "೮ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೮ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಹಾಗೂ ೧೦ನೇ ದಿನದ ಸಿದ್ಧತೆ.",
        en: "Offering 8th Pinda, 8 libations of Tilanjali, and preparing for 10th-day rites.",
        hi: "अष्टम पिंड अर्पण, 8 अंजलि तिलांजलि तथा 10वें दिन की तैयारी।",
        te: "8వ పిండ సమర్పణ, 8 దోసిళ్ల తిలాంజలి మరియు 10వ రోజు ఏర్పాట్లు.",
        ta: "8ம் பிண்ட சமர்ப்பணம், 8 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೮ನೇ ಪಿಂಡದಿಂದ ದೇಹಕ್ಕೆ ಹಸಿವು-ಬಾಯಾರಿಕೆಗಳನ್ನು ತೃಪ್ತಿಪಡಿಸಿಕೊಳ್ಳುವ ಶಕ್ತಿ ಪ್ರಾಪ್ತವಾಗುತ್ತದೆ.",
        en: "The 8th Pinda grants the Yatana body the faculty to assimilate food/water offerings.",
        hi: "अष्टम पिंड से आत्मा को क्षुधा-पिपासा तृप्त करने की शक्ति प्राप्त होती है।",
        te: "8వ పిండంతో ఆకలి దప్పులను తీర్చుకునే శక్తి లభిస్తుంది.",
        ta: "ஆன்மாவுக்கு பசி, தாகத்தை உணரும் ஆற்றல் கிடைக்கிறது."
      },
      keyOfferings: { kn: "ಅನ್ನ ಪಿಂಡ, ಎಳ್ಳು, ಮಧು (ಜೇನುತುಪ್ಪ).", en: "Rice Pinda, Sesame, Honey.", hi: "अन्न पिंड, तिल, मधु (शहद)।", te: "అన్న పిండం, నువ్వులు, తేనె.", ta: "அன்ன பிண்டம், எள், தேன்." }
    },
    {
      day: 10,
      title: {
        kn: "೧೦ನೇ ದಿನ: ದಶಮ ಪಿಂಡ ಪ್ರದಾನ, ಕ್ಷೌರ ಕರ್ಮ & ಆಶೌಚ ನಿವೃತ್ತಿ",
        en: "Day 10: 10th Pinda Dana, Tonsure (Kshoura) & Asoucha End",
        hi: "दशम दिन: दशम पिंड दान, क्षौर कर्म एवं अशौच शुद्धि",
        te: "10వ రోజు: 10వ పిండ ప్రదానం, క్షౌర కర్మ & ఆశౌచ నివృత్తి",
        ta: "10ம் நாள்: 10ம் பிண்ட தானம், க்ஷௌரம் & தீட்டு கழித்தல்"
      },
      rituals: {
        kn: "೯ನೇ ಮತ್ತು ೧೦ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ಪಿಂಡ ವಿಸರ್ಜನೆ, ದಾಯಾದಿಗಳಿಗೆ ಕ್ಷೌರ ಕರ್ಮ (ಮುಂಡನ), ಸಚಿಲ ಸ್ನಾನ, ಆಶೌಚ ಶಮನ.",
        en: "9th and 10th Pindas, Pinda Visarjana into river, family tonsure (Kshoura), sacred purification bath.",
        hi: "9वें एवं 10वें पिंड का अर्पण, पिंड विसर्जन, मुंडन (क्षौर), सचैल स्नान एवं अशौच शुद्धि।",
        te: "9, 10వ పిండాల సమర్పణ, పిండ విసర్జన, క్షౌర కర్మ, సచైల స్నానం మరియు ఆశౌచ నివృత్తి.",
        ta: "9 & 10ம் பிண்டம், பிண்ட விசர்ஜனம், க்ஷௌரம், தீர்த்த ஸ்நானம்."
      },
      significance: {
        kn: "೧೦ ಪಿಂಡಗಳಿಂದ ಪೂರ್ಣ ಸೂಕ್ಷ್ಮ ದೇಹ ನಿರ್ಮಾಣವಾಗಿ ಪ್ರೇತತ್ವ ಮುಗಿದು ಪಿತೃಲೋಕದ ಪಯಣಕ್ಕೆ ಅರ್ಹತೆ ದೊರೆಯುತ್ತದೆ.",
        en: "The subtle body is completely formed, ending initial Preta state and preparing for Pitru elevation.",
        hi: "10 पिंडों से संपूर्ण सूक्ष्म देह निर्मित होकर प्रेत योनि से मुक्ति का मार्ग प्रशस्त होता है।",
        te: "10 పిండాలతో సంపూర్ణ సూక్ష్మ శరీరం పూర్తయి పితృలోక అర్హత లభిస్తుంది.",
        ta: "10 பிண்டங்களால் சூட்சும உடல் நிறைவுபெற்று பித்ரு லோக தகுதி பெறுகிறது."
      },
      keyOfferings: {
        kn: "ದಶಮ ಪಿಂಡ, ಮಜ್ಜಿಗೆ, ಕಪ್ಪು ಎಳ್ಳು, ವಸ್ತ್ರದಾನ, ಗೋಧಿ.",
        en: "10th Pinda, Buttermilk, Sesame, Cloth charity, Wheat.",
        hi: "दशम पिंड, छाछ, काले तिल, वस्त्र दान, गेहूँ।",
        te: "10వ పిండం, మజ్జిగ, నల్ల నువ్వులు, వస్త్ర దానం.",
        ta: "10ம் பிண்டம், மோர், எள், வஸ்திர தானம்."
      }
    },
    {
      day: 11,
      title: {
        kn: "೧೧ನೇ ದಿನ: ಏಕಾದಶಾಹ ಶ್ರಾದ್ಧ, ವೃಷೋತ್ಸರ್ಗ & ೧೬ ಮಾಸಿಕ ಏಕೋದ್ದಿಷ್ಟ",
        en: "Day 11: Ekadashaha Shraddha, Vrishotsarga & 16 Ekodishta Rites",
        hi: "एकादश दिन: एकादशाह श्राद्ध, वृषोत्सर्ग एवं 16 मासिक श्राद्ध",
        te: "11వ రోజు: ఏకాదశాహ శ్రాద్ధం, వృషోత్సర్గం & 16 ఏకోద్దిష్ట శ్రాద్ధాలు",
        ta: "11ம் நாள்: ஏகாதச சிரார்த்தம், விருஷோத்ஸர்கம்"
      },
      rituals: {
        kn: "ಏಕಾದಶಾಹ ಶ್ರಾದ್ಧ, ವೃಷೋತ್ಸರ್ಗ (ಕಾಳಹಸ್ತಿ/ಗೋಕರ್ಣ ಪದ್ಧತಿ), ಆಧ್ಯ ಶ್ರಾದ್ಧ, ಶಯ್ಯಾದಾನ ಹಾಗೂ ಗೋದಾನ (ವೈತರಣಿ ಗೋದಾನ).",
        en: "Ekadashaha Shraddha, Vrishotsarga bull dedication, Adhya Shraddha, Shayyadana (bed offering), and Vaitarani Godana.",
        hi: "एकादशाह श्राद्ध, वृषोत्सर्ग, आद्य श्राद्ध, शय्यादान तथा वैतरणी गोदान।",
        te: "ఏకాదశాహ శ్రాద్ధం, వృషోత్సర్గం, ఆద్య శ్రాద్ధం, శయ్యాదానం మరియు వైతరణి గోదానం.",
        ta: "ஏகாதச சிரார்த்தம், விருஷோத்ஸர்கம், சய்யாதானம், வைதரணி கோதானம்."
      },
      significance: {
        kn: "ವೈತರಣಿ ನದಿಯನ್ನು ಸುಲಭವಾಗಿ ದಾಟಲು ಗೋದಾನ ಮತ್ತು ಶಯ್ಯಾದಾನ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವೆಂದು ಗರುಡ ಪುರಾಣ ಸಾರುತ್ತದೆ.",
        en: "Vaitarani Godana grants safe passage across the dreadful river Vaitarani to ancestral realm.",
        hi: "गरुड़ पुराणानुसार वैतरणी नदी को सुगमता से पार करने हेतु गोदान एवं शय्यादान सर्वोत्कृष्ट है।",
        te: "వైతరణి నదిని దాటడానికి గోదానం మరియు శయ్యాదానం అత్యుత్తమమని గరుడ పురాణం చెబుతోంది.",
        ta: "வைதரணி நதியைக் கடக்க கோதானம் மற்றும் சய்யாதானம் மிக முக்கியமானது."
      },
      keyOfferings: {
        kn: "ವೈತರಣಿ ಗೋದಾನ, ಶಯ್ಯಾದಾನ, ಕಂಚಿನ ಪಾತ್ರೆ, ಪಂಚಪಾತ್ರೆ, ಛತ್ರ, ಪಾದುಕಾ, ದೀಪದಾನ.",
        en: "Vaitarani Cow donation, Bed/Bedding, Bronze vessels, Umbrella, Footwear, Lamp.",
        hi: "वैतरणी गोदान, शय्यादान, कांस्य पात्र, छत्र, पादुका, दीपदान।",
        te: "వైతరణి గోదానం, శయ్యాదానం, కంచు పాత్ర, ఛత్రం, పాదుకలు, దీపదానం.",
        ta: "கோதானம், சய்யாதானம், வெண்கல பாத்திரம், குடை, பாதுகை, தீபம்."
      }
    },
    {
      day: 12,
      title: {
        kn: "೧೨ನೇ ದಿನ: ದ್ವಾದಶಾಹ ಸಪಿಂಡೀಕರಣ ಮಹಾ ಶ್ರಾದ್ಧ (ಪಿತೃಲೋಕ ಪ್ರವೇಶ)",
        en: "Day 12: Sapindikarana Maha Shraddha (Pitru Loka Ascension)",
        hi: "द्वादश दिन: सपिंडीकरण महा श्राद्ध (पितृलोक प्रवेश)",
        te: "12వ రోజు: సపిండీకరణ మహా శ్రాద్ధం (పితృలోక ప్రవేశం)",
        ta: "12ம் நாள்: சபிண்டீகரண மகா சிரார்த்தம் (பித்ரு லோக பிரவேசம்)"
      },
      rituals: {
        kn: "ಸಪಿಂಡೀಕರಣ ಶ್ರಾದ್ಧ (ಮೃತರ ಪಿಂಡವನ್ನು ೩ ತಲೆಮಾರಿನ ಪಿತೃ ಪಿಂಡಗಳೊಂದಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ವಿಲೀನಗೊಳಿಸುವುದು).",
        en: "Sapindikarana ritual: Uniting the deceased soul's Pinda with the Pindas of the 3 ancestral generations.",
        hi: "सपिंडीकरण श्राद्ध: दिवंगत आत्मा के पिंड को 3 पीढ़ियों के पितृ पिंडों में विधिवत मिलाना।",
        te: "సపిండీకరణ శ్రాద్ధం: దివంగత ఆత్మ పిండాన్ని 3 తరాల పితృ పిండాలతో శాస్త్రోక్తంగా విలీనం చేయడం.",
        ta: "சபிண்டீகரணம்: ஆன்மாவின் பிண்டத்தை 3 தலைமுறை பித்ரு பிண்டங்களுடன் இணைத்தல்."
      },
      significance: {
        kn: "ಪ್ರೇತತ್ವವು ಶಾಶ್ವತವಾಗಿ ನಿವಾರಣೆಯಾಗಿ ಮೃತ ವ್ಯಕ್ತಿಯು 'ಪಿತೃ ದೇವತೆ'ಯಾಗಿ ಪಿತೃಲೋಕವನ್ನು ಸೇರುತ್ತಾರೆ.",
        en: "Preta state dissolves completely, elevating the departed soul into a revered Pitru Devata.",
        hi: "प्रेतत्व सदा के लिए समाप्त होकर दिवंगत आत्मा पितृ पद प्राप्त कर पितृलोक में प्रतिष्ठित होती है।",
        te: "ప్రేతత్వం తొలగిపోయి దివంగతులు 'పితృ దేవత'గా పితృలోకంలో చేరతారు.",
        ta: "பிரேத நிலை நீங்கி, ஆன்மா பித்ரு தேவதையாக பித்ரு லோகத்தை அடைகிறது."
      },
      keyOfferings: {
        kn: "೪ ಮಹಾ ಪಿಂಡಗಳು, ಸುವರ್ಣ ದಾನ, ರಜತ ದಾನ, ೧೬ ಬ್ರಾಹ್ಮಣ ಪೂಜೆ & ದಕ್ಷಿಣೆ.",
        en: "4 Sacred Maha Pindas, Gold/Silver offerings, Worship of 16 Brahmanas & Dakshina.",
        hi: "4 महा पिंड, स्वर्ण-रजत दान, 16 ब्राह्मण पूजन एवं दक्षिणा।",
        te: "4 మహా పిండాలు, స్వర్ణ-రజత దానం, 16 మంది బ్రాహ్మణుల పూజ & దక్షిణ.",
        ta: "4 மகா பிண்டங்கள், தங்கம்/வெள்ளி தானம், 16 அந்தணர் பூஜை & தக்ஷிணை."
      }
    },
    {
      day: 13,
      title: {
        kn: "೧೩ನೇ ದಿನ: ತ್ರಯೋದಶಾಹ ಶುಭ ಸ್ವೀಕಾರ, ಆನಂದ ಹೋಮ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ",
        en: "Day 13: Trayodashaha Shubha Sweekara, Ananda Homa & Feast",
        hi: "त्रयोदश दिन: त्रयोदशाह शुभ स्वीकार, आनंद होम एवं ब्राह्मण भोजन",
        te: "13వ రోజు: త్రయోదశాహ శుభ స్వీకారం, ఆనంద హోమం & భోజనం",
        ta: "13ம் நாள்: சுப ஸ்வீகாரம், ஆனந்த ஹோமம் & போஜனம்"
      },
      rituals: {
        kn: "ಆನಂದ ಹೋಮ, ಗೃಹ ಶುದ್ಧಿ, ಪುಣ್ಯಾಹ ವಾಚನ, ಶುಭ ಸ್ವೀಕಾರ, ದೇವತಾರ್ಚನೆ ಹಾಗೂ ಮಹಾ ಅನ್ನ ಸಂತರ್ಪಣೆ.",
        en: "Ananda Homa, Griha Shuddhi, Punyahavachana, Shubha Sweekara, temple worship, and community feast.",
        hi: "आनंद होम, गृह शुद्धि, पुण्याह वाचन, शुभ स्वीकार, देवतार्चन तथा महा अन्न संर्पण।",
        te: "ఆనంద హోమం, గృహ శుద్ధి, పుణ్యాహవాచనం, శుభ స్వీకారం మరియు మహా అన్నదానం.",
        ta: "ஆனந்த ஹோமம், கிரக சுத்தி, புண்யாகவாசனம், சுப ஸ்வீகாரம், அன்னதானம்."
      },
      significance: {
        kn: "ಕುಟುಂಬದ ಆಶೌಚವು ಸಂಪೂರ್ಣ ಮುಗಿದು ದೈನಂದಿನ ಧಾರ್ಮಿಕ ಹಾಗೂ ಲೌಕಿಕ ಕಾರ್ಯಗಳಿಗೆ ಮರುಪ್ರವೇಶ.",
        en: "Family completely exits mourning; auspicious resumption of normal spiritual and worldly duties.",
        hi: "परिवार की संपूर्ण अशौच निवृत्ति एवं पुनः मंगलमय नित्य धार्मिक-लौकिक जीवन में प्रवेश।",
        te: "కుటుంబంలో ఆశౌచం పూర్తయి సాధారణ ధార్మిక జీవనంలోకి ప్రవేశం.",
        ta: "தீட்டு முழுமையாக கழிந்து குடும்பத்தினர் சுப காரியங்களை தொடங்கலாம்."
      },
      keyOfferings: {
        kn: "ಮಹಾ ಅನ್ನದಾನ, ದಕ್ಷಿಣೆ, ಗೃಹ ಶುದ್ಧಿ ಕಲಶ ಜಲ, ಸಿಹಿ ಪ್ರಸಾದ.",
        en: "Maha Anna-dana (Feast), Dakshina, Sanctified Kalasha water, Sweet Prasada.",
        hi: "महा अन्नदान, दक्षिणा, गृह शुद्धि कलश जल, मिष्ठान्न।",
        te: "మహా అన్నదానం, దక్షిణ, పుణ్యాహ కలశ జలం, ప్రసాదం.",
        ta: "அன்னதானம், தக்ஷிணை, கலச தீர்த்தம், பிரசாதம்."
      }
    }
  ];

  for (const cfg of dayConfigs) {
    const dOffset = cfg.day - 1;
    const targetDate = new Date(baseDate.getTime() + dOffset * 24 * 60 * 60 * 1000);
    roadmap.push({
      dayNumber: cfg.day,
      dayTitle: cfg.title,
      dateStr: formatDateDisplay(targetDate, "kn"),
      rituals: cfg.rituals,
      significance: cfg.significance,
      keyOfferings: cfg.keyOfferings
    });
  }

  return roadmap;
}

export function computeAsthiVisarjanaGuide(): AsthiVisarjanaGuide {
  return {
    optimalTiming: {
      kn: "ಮರಣ ಹೊಂದಿದ ೩ನೇ, ೭ನೇ, ೯ನೇ ಅಥವಾ ೧೦ನೇ ದಿನದೊಳಗೆ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಮಾಡುವುದು ಶ್ರೇಷ್ಠ. ಸಾಧ್ಯವಾಗದಿದ್ದಲ್ಲಿ ೧ ವರ್ಷದೊಳಗೆ ಪವಿತ್ರ ಗಂಗಾ, ಗೋಕರ್ಣ ಅಥವಾ ಕಾವೇರಿ ಸಂಗಮದಲ್ಲಿ ವಿಸರ್ಜಿಸಬೇಕು.",
      en: "Best performed on the 3rd, 7th, 9th or within the 10th day of demise. Alternatively within 1 year at sacred rivers like Gokarna Samudra, Ganga, or Kaveri.",
      hi: "मृत्यु के 3रे, 7वें, 9वें या 10वें दिन के भीतर अस्थि विसर्जन सर्वोत्तम है। अन्यथा 1 वर्ष के भीतर गंगा, गोकर्ण या त्रिवेणी में विसर्जित करें।",
      te: "మరణించిన 3, 7, 9 లేదా 10వ రోజులోపు అస్థి విసర్జన చేయడం శ్రేష్ఠం.",
      ta: "மரணமடைந்த 3, 7, 9 அல்லது 10ம் நாளுக்குள் அஸ்தி விசர்ஜனம் செய்வது உத்தமம்."
    },
    sacredTirthas: [
      {
        name: { kn: "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ & ಸಮುದ್ರ ಸಂಗಮ", en: "Gokarna Kotitirtha & Ocean Sangama", hi: "गोकर्ण कोटितीर्थ एवं समुद्र संगम", te: "గోకర్ణ కోటితీర్థం & సముద్ర సంగమం", ta: "கோகர்ண கோடிதீர்த்தம் & கடல் சங்கமம்" },
        location: { kn: "ಗೋಕರ್ಣ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ", en: "Gokarna, Uttara Kannada, Karnataka", hi: "गोकर्ण, कर्नाटक", te: "గోకర్ణ, కర్ణాటక", ta: "கோகர்ண, கர்நாடகா" },
        spiritualSignificance: { kn: "ರುದ್ರಪಾದ ಸನ್ನಿಧಿ — ಇಲ್ಲಿ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಮಾಡಿದರೆ ಆತ್ಮವು ಸಕಲ ಪಾಪಗಳಿಂದ ಮುಕ್ತವಾಗಿ ಶಿವ ಸಾಯುಜ್ಯ ಪಡೆಯುತ್ತದೆ.", en: "Sacred Rudrapada — Dissolves all sins and grants immediate liberation (Shiva Sayujya) to the soul.", hi: "रुद्रपाद सन्निधि — समस्त पापों का क्षय होकर आत्मा को शिव सायुज्य की प्राप्ति होती है।", te: "రుద్రపాద సన్నిధి — సమస్త పాపాలు నశించి ఆత్మకు మోక్షం లభిస్తుంది.", ta: "ருத்ரபாத சன்னதி — சகல பாவங்களும் நீங்கி ஆன்மா முக்தி அடைகிறது." }
      },
      {
        name: { kn: "ವಾರಣಾಸಿ (ಕಾಶೀ ಗಂಗಾ ತೀರ)", en: "Varanasi (Kashi Ganga Manikarnika)", hi: "वाराणसी (काशी गंगा मणिकर्णिका)", te: "వారణాసి (కాశీ గంగ)", ta: "வாரணாசி (காசி கங்கை)" },
        location: { kn: "ವಾರಣಾಸಿ, ಉತ್ತರ ಪ್ರದೇಶ", en: "Varanasi, Uttar Pradesh", hi: "वाराणसी, उत्तर प्रदेश", te: "వారణాసి, ఉత్తరప్రదేశ్", ta: "வாரணாசி, உ.பி." },
        spiritualSignificance: { kn: "ಕಾಶೀ ಮರಣಾನ್ಮುಕ್ತಿಃ — ಗಂಗಾ ಜಲದಲ್ಲಿ ಅಸ್ಥಿ ಲೀನವಾದರೆ ಪುನರ್ಜನ್ಮ ರಹಿತ ಶಾಶ್ವತ ಮೋಕ್ಷ.", en: "Ganga water immersion grants liberation from cycle of rebirths (Kashi Moksha).", hi: "गंगा जल में अस्थि विसर्जन से पुनर्जन्म रहित शाश्वत मोक्ष की प्राप्ति।", te: "గంగా జలంలో అస్థి విసర్జనతో శాశ్వత మోక్షం.", ta: "கங்கையில் அஸ்தி கரைப்பதால் மறுபிறப்பற்ற மோக்ஷம்." }
      },
      {
        name: { kn: "ಪ್ರಯಾಗರಾಜ್ (ತ್ರಿವೇಣಿ ಸಂಗಮ)", en: "Prayagraj (Triveni Sangam)", hi: "प्रयागराज (त्रिवेणी संगम)", te: "ప్రయాగ్‌రాజ్ (త్రివేణి సంగమం)", ta: "பிரயாக்ராஜ் (திரிவேணி சங்கமம்)" },
        location: { kn: "ಪ್ರಯಾಗರಾಜ್, ಉತ್ತರ ಪ್ರದೇಶ", en: "Prayagraj, Uttar Pradesh", hi: "प्रयागराज, उत्तर प्रदेश", te: "ప్రయాగ్‌రాజ్, ఉత్తరప్రదేశ్", ta: "பிரயாக்ராஜ், உ.பி." },
        spiritualSignificance: { kn: "ಗಂಗಾ, ಯಮುನಾ, ಸರಸ್ವತೀ ಸಂಗಮದಲ್ಲಿ ಅಸ್ಥಿ ಸಮರ್ಪಣೆ ಸರ್ವ ಪಿತೃಗಳಿಗೆ ತೃಪ್ತಿದಾಯಕ.", en: "Confluence of 3 sacred rivers pacifies all ancestral debts across 21 generations.", hi: "त्रिवेणी संगम में अस्थि समर्पण से 21 पीढ़ियों के पितरों की तृप्ति होती है।", te: "త్రివేణి సంగమంలో అస్థి సమర్పణతో 21 తరాల పితృ తృప్తి.", ta: "திரிவேணி சங்கமத்தில் அஸ்தி கரைப்பது 21 தலைமுறை பித்ருக்களுக்கு திருப்தி அளிக்கும்." }
      },
      {
        name: { kn: "ಶ್ರೀರಂಗಪಟ್ಟಣ (ಪಶ್ಚಿಮ ವಾಹಿನಿ ಕಾವೇರಿ)", en: "Srirangapatna (Paschima Vahini Kaveri)", hi: "श्रीरंगपट्टण (पश्चिम वाहिनी कावेरी)", te: "శ్రీరంగపట్నం (పశ్చిమ వాహిని కావేరి)", ta: "ஸ்ரீரங்கப்பட்டினம் (காவேரி சங்கமம்)" },
        location: { kn: "ಮಂಡ್ಯ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ", en: "Mandya Dist, Karnataka", hi: "मांड्या, कर्नाटक", te: "మండ్య, కర్ణాటక", ta: "மண்டியா, கர்நாடகா" },
        spiritualSignificance: { kn: "ದಕ್ಷಿಣ ಭಾರತದ ಪ್ರಸಿದ್ಧ ಪವಿತ್ರ ಪಶ್ಚಿಮ ವಾಹಿನಿ ಕಾವೇರಿ ತೀರ್ಥ.", en: "Renowned sacred southern tirtha where Kaveri flows westward.", hi: "दक्षिण भारत का परम पावन पश्चिम वाहिनी कावेरी तीर्थ।", te: "దక్షిణ భారత ప్రసిద్ధ పశ్చిమ వాహిని కావేరి తీర్థం.", ta: "தென்னிந்தியாவின் பிரசித்தி பெற்ற காவேரி சங்கம தீர்த்தம்." }
      }
    ],
    procedureSteps: {
      kn: [
        "ಅಸ್ಥಿ ಪಾತ್ರೆಯನ್ನು ಪವಿತ್ರ ವಸ್ತ್ರದಿಂದ ಸುತ್ತಿ, ಸ್ನಾನ ಮಾಡಿ ಶೌಚವಾಗಿರಬೇಕು.",
        "ತೀರ್ಥ ಕ್ಷೇತ್ರದ ಪುರೋಹಿತರೊಂದಿಗೆ 'ಪಿತೃ ಸಂಕಲ್ಪ' ಮಾಡಿ ಕ್ಷೀರ (ಹಾಲು), ತುಪ್ಪ, ಎಳ್ಳು ಹಾಗೂ ಪುಷ್ಪಗಳಿಂದ ಅಸ್ಥಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.",
        "ಆಳವಾದ ಪವಿತ್ರ ಜಲದಲ್ಲಿ ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣಾಭಿಮುಖವಾಗಿ ನಿಂತು 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಎಂದು ಜಪಿಸುತ್ತಾ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಮಾಡಿ.",
        "ತಕ್ಷಣವೇ ಸಚಿಲ ಸ್ನಾನ ಮಾಡಿ ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ, ಬ್ರಾಹ್ಮಣರಿಗೆ ಎಳ್ಳು-ವಸ್ತ್ರ-ದಕ್ಷಿಣೆ ದಾನ ನೀಡಿ."
      ],
      en: [
        "Keep the Asthi urn wrapped in sacred cloth and maintain complete ritual purity.",
        "Perform Pitru Sankalpa with priest, offering milk, ghee, black sesame, and flowers to the Asthi.",
        "Facing East or South in sacred deep waters, immerse the ashes chanting 'Om Namo Narayanaya'.",
        "Take a complete holy dip, offer Surya Arghya, and donate sesame, clothes, and Dakshina."
      ]
    },
    mantra: "॥ ಓಂ ಅಸ್ಥಿ ಸಂಚಯನ ಪುಣ್ಯೇ ತೀರ್ಥೇ ವಿಸರ್ಜಯಾಮಿ, ದಿವ್ಯ ಲೋಕಂ ಗಚ್ಛತು ಸದ್ಗತಿಃ ಭವತು ॥"
  };
}

export function computeGarudaPuranaWisdom(): GarudaPuranaWisdom {
  return {
    soulJourneySummary: {
      kn: "ಗರುಡ ಪುರಾಣದ ಪ್ರಕಾರ, ಮರಣದ ನಂತರ ಜೀವವು ೧೨ ದಿನಗಳ ಕಾಲ ಗೃಹ ಹಾಗೂ ಚಿತಾಭೂಮಿಯ ಬಳಿಯೇ ಸೂಕ್ಷ್ಮವಾಗಿ ಇರುತ್ತದೆ. ನಾವು ನೀಡುವ ದಿನನಿತ್ಯದ ಪಿಂಡ & ತರ್ಪಣಗಳಿಂದ ಸೂಕ್ಷ್ಮ ಯಾತನಾ ದೇಹ ನಿರ್ಮಾಣವಾಗಿ ೧ ವರ್ಷದ ಕಾಲ ಯಮಮಾರ್ಗದಲ್ಲಿ ಪಯಣಿಸಿ ಪಿತೃಲೋಕವನ್ನು ಸೇರುತ್ತದೆ.",
      en: "According to Garuda Purana, the soul lingers near home and pyre for 12 days. Daily Pinda and Tila offerings build its subtle vessel, sustaining its 1-year journey along the cosmic path to Pitru Loka."
    },
    pindaDanaMeaning: {
      kn: "ಪ್ರತಿಯೊಂದು ದಿನದ ಪಿಂಡವು ಜೀವದ ಅಂಗಾಂಗಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ರೂಪಿಸುತ್ತದೆ (೧ನೇ ದಿನ ಶಿರ, ೨ನೇ ದಿನ ಕಣ್ಣು-ಕಿವಿ, ೧೦ನೇ ದಿನ ಸಂಪೂರ್ಣ ದೇಹ). ೧೦ನೇ ದಿನದ ನಂತರ ಪ್ರೇತತ್ವ ಮುಗಿಯುತ್ತದೆ.",
      en: "Each day's Pinda forms specific organs of the subtle body (Day 1 head, Day 2 perception, Day 10 completion), transmuting the ghost (Preta) state into a peaceful ancestral spirit."
    },
    vaitaraniGodanaImportance: {
      kn: "ಯಮಲೋಕದ ಮಾರ್ಗದಲ್ಲಿ ಅತ್ಯಂತ ಭಯಂಕರವಾದ 'ವೈತರಣಿ' ನದಿ ಹರಿಯುತ್ತದೆ. ೧೧ನೇ ದಿನ ಗೋವಿನ ಬಾಲ ಹಿಡಿದು ಸಂಕಲ್ಪ ಮಾಡುವ 'ವೈತರಣಿ ಗೋದಾನ'ದಿಂದ ಜೀವವು ಆ ನದಿಯನ್ನು ಸುಲಭವಾಗಿ ದಾಟುತ್ತದೆ.",
      en: "The arduous journey involves crossing the stormy river Vaitarani. The 11th-day Vaitarani Cow donation ensures effortless passage across this spiritual threshold."
    },
    mokshaPhilosophy: {
      kn: "ಆತ್ಮವು ಅಮರ, ದೇಹ ಮಾತ್ರ ನಶ್ವರ. ಶ್ರದ್ಧೆಯಿಂದ ನೆರವೇರಿಸುವ ಶ್ರಾದ್ಧ ಕರ್ಮಗಳು ಪಿತೃಗಳಿಗೆ ತೃಪ್ತಿ ನೀಡಿ, ಅವರ ಆಶೀರ್ವಾದದಿಂದ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತಾನ ಸಮೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
      en: "The soul is immortal and transcendent. Diligent Shraddha rituals satisfy ancestors, showering the family with longevity, health, and multi-generational prosperity."
    }
  };
}

export function computeMahalayaTarpanaRules(): MahalayaTarpanaRules {
  return {
    mahalayaOverview: {
      kn: "ಪ್ರತಿ ವರ್ಷ ಭಾದ್ರಪದ ಮಾಸದ ಶುಕ್ಲ ಪೂರ್ಣಿಮೆಯಿಂದ ಅಮಾವಾಸ್ಯೆಯವರೆಗಿನ ೧೬ ದಿನಗಳ ಕಾಲ 'ಮಹಾಲಯ ಪಕ್ಷ' ಅಥವಾ 'ಪಿತೃ ಪಕ್ಷ'. ಈ ಸಮಯದಲ್ಲಿ ಸಕಲ ಪಿತೃ ದೇವತೆಗಳು ಭೂಮಿಗೆ ಆಗಮಿಸುತ್ತಾರೆ.",
      en: "Mahalaya Paksha (Pitru Paksha) spans the 16 lunar days from Bhadrapada Purnima to Amavasya. Ancestors descend to the earth realm to receive offerings from descendants."
    },
    amavasyaTarpanaProcedure: {
      kn: "ಪ್ರತಿ ತಿಂಗಳ ಅಮಾವಾಸ್ಯೆ, ಸಂಕ್ರಾಂತಿ ಹಾಗೂ ಮಹಾಲಯದಂದು ಮಧ್ಯಾಹ್ನ ಅಪರಾಹ್ನ ಕಾಲದಲ್ಲಿ ದರ್ಭೆ, ಕಪ್ಪು ಎಳ್ಳು, ತುಳಸಿ ಹಾಗೂ ಗಂಗಾಜಲದಿಂದ ಪಿತೃ ತರ್ಪಣ ನೀಡುವುದು ಅತ್ಯಂತ ಪುಣ್ಯಪ್ರದ.",
      en: "Offering Pitru Tarpana during Aparahna (afternoon) on every Amavasya, Sankranti, and Mahalaya using Darbha, Black Sesame, Tulasi, and holy water brings immense peace."
    },
    essentialDanaItems: {
      kn: [
        "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ) & ದರ್ಭೆ (ದರ್ಭಾ)",
        "ಅನ್ನದಾನ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ",
        "ವಸ್ತ್ರದಾನ (ಧೋತಿ / ಶಾಲು)",
        "ರಜತ (ಬೆಳ್ಳಿ) ಅಥವಾ ತಾಮ್ರ ಪಾತ್ರೆ ದಾನ",
        "ಗೋಸೇವೆ & ಬೆಲ್ಲ-ಹುಲ್ಲು ಸಮರ್ಪಣೆ"
      ],
      en: [
        "Black Sesame (Tila) & Sacred Darbha Grass",
        "Anna-Dana (Food feast) & Brahmana Bhojana",
        "Vastra-Dana (Cloth / Shawl / Dhoti)",
        "Silver / Copper Water Vessels",
        "Go-Seva (Feeding sacred cows with grass & jaggery)"
      ]
    }
  };
}

export function computeGokarnaMokshaSevas(): GokarnaMokshaSevaInfo {
  return {
    priestName: "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Chief Priest, Gokarna Kshetra)",
    priestPhone: "9972339362",
    narayanabaliOverview: {
      kn: "ನಾರಾಯಣಬಲಿ ಮಹಾ ಪೂಜೆ: ಅಕಾಲ ಮರಣ, ಅಪಘಾತ ಅಥವಾ ಸರ್ಪದೋಷದಿಂದ ಉಂಟಾದ ಪಿತೃ ಬಾಧೆ ನಿವಾರಣೆಗಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸುವ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪ್ರಾಯಶ್ಚಿತ್ತ ವಿಧಿ.",
      en: "Narayanabali Maha Pooja: Supreme Vedic rite performed at Gokarna Mahabaleshwara to liberate souls from untimely demise, accidental deaths, or intense Pitru doshas."
    },
    tripindiShraddhaOverview: {
      kn: "ಮೂರು ತಲೆಮಾರುಗಳ (ಪಿತೃ, ಪಿತಾಮಹ, ಪ್ರಪಿತಾಮಹ) ಅತೃಪ್ತ ಆತ್ಮಗಳ ಮುಕ್ತಿಗಾಗಿ ಬ್ರಹ್ಮ, ವಿಷ್ಣು, ರುದ್ರ ರೂಪದ ೩ ಪಿಂಡಗಳಿಂದ ನೆರವೇರಿಸುವ ಮಹಾ ಶ್ರಾದ್ಧ.",
      en: "Grand Shraddha offering 3 cosmic Pindas to Brahma, Vishnu, and Rudra to satisfy restless spirits across 3 generations."
    },
    kshetraImportance: {
      kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರವು ಪರಮಶಿವನ ಆತ್ಮಲಿಂಗವಿರುವ ಪರಮ ಪವಿತ್ರ ಮುಕ್ತಿ ಕ್ಷೇತ್ರ. ಇಲ್ಲಿ ಮಾಡುವ ಪಿಂಡ ಪ್ರದಾನವು ಕಾಶೀ-ಗಯಾ ಕ್ಷೇತ್ರಗಳಿಗೆ ಸಮಾನವಾದ ಫಲ ನೀಡುತ್ತದೆ.",
      en: "Gokarna is the sacred abode of Lord Shiva's Atmalinga. Pinda Dana here bestows merit equivalent to Kashi and Gaya."
    }
  };
}

/** Execute complete Maranottara, Masika, Antyesti, Dosha & Pilgrimage Calculations */
export function executeMaranottaraCalculation(input: MaranottaraInput): MaranottaraResult {
  const { personName, demiseDate, demiseTime, location = "Gokarna, Karnataka", yearsCount = 1 } = input;
  const demiseD = new Date(demiseDate + (demiseTime ? `T${demiseTime}` : "T12:00:00"));

  const engineResult = calculateTraditionalBaggona(
    demiseDate,
    demiseTime || "12:00",
    14.5479,
    74.3188,
    "lahiri"
  );

  const demiseTithiNum = engineResult?.tithiGhati || 2;
  const tithiNameStr = engineResult?.tithiKn || "ದ್ವಿತೀಯಾ";
  const nakshatraNameStr = engineResult?.moonNakshatraKn || "ಅನುರಾಧಾ";
  const pakshaStr = engineResult?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷ";

  const demiseTithiObj: Record<string, string> = {
    kn: tithiNameStr,
    en: engineResult?.tithi || "Tithi",
    hi: tithiNameStr,
    te: tithiNameStr,
    ta: tithiNameStr
  };

  const demiseNakshatraObj: Record<string, string> = {
    kn: nakshatraNameStr,
    en: engineResult?.moonNakshatra || "Nakshatra",
    hi: nakshatraNameStr,
    te: nakshatraNameStr,
    ta: nakshatraNameStr
  };

  const demisePakshaObj: Record<string, string> = {
    kn: pakshaStr,
    en: engineResult?.paksha || "Shukla Paksha",
    hi: pakshaStr,
    te: pakshaStr,
    ta: pakshaStr
  };

  // Generate Monthly Masika Dates for chosen duration (12, 24, 36, 48, 60 months)
  const totalMonths = yearsCount * 12;
  const masikaSchedule: MasikaScheduleItem[] = [];

  const baseTime = demiseD.getTime();
  const approxSynodicMonthMs = 29.530588 * 24 * 60 * 60 * 1000;

  for (let m = 1; m <= totalMonths; m++) {
    const targetMs = baseTime + m * approxSynodicMonthMs;
    const calcDate = new Date(targetMs);

    const dayOfWeekIdx = calcDate.getDay();
    const dayOfWeekObj = WEEKDAYS_5LANG[dayOfWeekIdx] || WEEKDAYS_5LANG[0];

    const isVarshika = m % 12 === 0;
    const yearNumber = Math.ceil(m / 12);
    const monthInYear = m % 12 === 0 ? 12 : m % 12;
    const isSpecial = isVarshika || monthInYear === 1 || monthInYear === 3 || monthInYear === 6;

    let masikaTitleKn = `${m} ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ`;
    let masikaTitleEn = `Month ${m} Masika Shraddha`;

    if (monthInYear === 1) {
      masikaTitleKn = `೧ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ಪ್ರಥಮ ಮಾಸಿಕ)`;
      masikaTitleEn = `1st Month Masika (Prathama Masika)`;
    } else if (monthInYear === 3) {
      masikaTitleKn = `೩ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ತ್ರೈಮಾಸಿಕ)`;
      masikaTitleEn = `3rd Month Masika (Traimasika)`;
    } else if (monthInYear === 6) {
      masikaTitleKn = `೬ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ಷಣ್ಮಾಸಿಕ)`;
      masikaTitleEn = `6th Month Masika (Shanmasika)`;
    } else if (isVarshika) {
      masikaTitleKn = `🌟 ${yearNumber} ನೇ ವರ್ಷದ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ (Varshika Shraddha)`;
      masikaTitleEn = `🌟 Year ${yearNumber} Varshika Shraddha`;
    }

    const ritualNotesObj: Record<string, string> = {
      kn: isVarshika
        ? `ಮೃತರ ಪುಣ್ಯತಿಥಿ · ವಾರ್ಷಿಕ ಮಹಾ ಶ್ರಾದ್ಧ, ಸಪಿಂಡೀಕರಣ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ.`
        : monthInYear === 1
        ? `ಪ್ರಥಮ ಮಾಸಿಕ ತರ್ಪಣ, ಎಳ್ಳು-ನೀರು ಸಮರ್ಪಣೆ & ವಸ್ತ್ರದಾನ.`
        : monthInYear === 6
        ? `ಷಣ್ಮಾಸಿಕ ಮಹಾ ಶ್ರಾದ್ಧ & ಪಿತೃ ತರ್ಪಣ.`
        : `ಮಾಸಿಕ ತರ್ಪಣ & ದಾನ ಧರ್ಮ ಕರ್ಮ.`,
      en: isVarshika
        ? `Annual Sacred Varshika Shraddha, Pinda Pradana & Brahmana Bhojana.`
        : monthInYear === 1
        ? `First Month Masika Tarpana, Sesame water oblations & Charity.`
        : monthInYear === 6
        ? `Six-Month (Shanmasika) Shraddha & Ancestral libation.`
        : `Monthly Pitru Tarpana & Sacred Offerings.`
    };

    masikaSchedule.push({
      monthIndex: m,
      masikaName: { kn: masikaTitleKn, en: masikaTitleEn, hi: masikaTitleKn, te: masikaTitleKn, ta: masikaTitleKn },
      tithiName: demiseTithiObj,
      gregorianDate: calcDate.toISOString().split("T")[0],
      formattedDateStr: {
        kn: formatDateDisplay(calcDate, "kn"),
        en: formatDateDisplay(calcDate, "en"),
        hi: formatDateDisplay(calcDate, "hi"),
        te: formatDateDisplay(calcDate, "te"),
        ta: formatDateDisplay(calcDate, "ta")
      },
      dayOfWeek: dayOfWeekObj,
      paksha: demisePakshaObj,
      isVarshikaShraddha: isVarshika,
      isSpecialMilestone: isSpecial,
      ritualNotes: ritualNotesObj
    });
  }

  // Calculate Demise Time Dosha & Recommended Gokarna Shanti Poojas
  const hour = demiseTime ? parseInt(demiseTime.split(":")[0], 10) : 12;
  const isNight = hour < 6 || hour >= 18;
  const hasSpecificTime = !!demiseTime;

  // Nakshatra Panchaka Dosha Check
  const nakshatraNameLower = nakshatraNameStr.toLowerCase();
  const isTripadaNakshatra =
    nakshatraNameLower.includes("dhanishta") ||
    nakshatraNameLower.includes("shatabhisha") ||
    nakshatraNameLower.includes("bhadra") ||
    nakshatraNameLower.includes("revati") ||
    nakshatraNameLower.includes("ಧನಿಷ್ಠಾ") ||
    nakshatraNameLower.includes("ಶತಭಿಷಾ") ||
    nakshatraNameLower.includes("ರೇವತಿ") ||
    nakshatraNameLower.includes("ಕೃತ್ತಿಕಾ") ||
    nakshatraNameLower.includes("ಪುನರ್ವಸು") ||
    nakshatraNameLower.includes("ಉತ್ತರಾಷಾಢ");

  const hasPanchaka = isTripadaNakshatra || demiseTithiNum === 4 || demiseTithiNum === 9 || demiseTithiNum === 14;

  const doshaSummaryObj: Record<string, string> = {
    kn: hasPanchaka
      ? `ಮರಣ ಹೊಂದಿದ ನಕ್ಷತ್ರ/ತಿಥಿಯ ಅನುಸಾರ 'ಪಂಚಕ / ತ್ರಿಪಾದ ನಕ್ಷತ್ರ ದೋಷ' ಸೂಚಿತವಾಗಿದೆ. ಕುಲರಕ್ಷಣೆಗಾಗಿ ದರ್ಭೆಯ ಪುತ್ತಳಿ ದಹನ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪಂಚಕ ಶಾಂತಿ ಪೂಜೆ ಅವಶ್ಯಕ.`
      : hasSpecificTime && isNight
      ? `ರಾತ್ರಿ ಕಾಲದ ಮರಣ ಸನ್ನಿವೇಶದಿಂದ ಲಘು ಸಂಧ್ಯಾ ದೋಷ ಸೂಚಿತವಾಗಿದೆ. ಪ್ರಥಮ ವರ್ಷ ತಿಲ ತರ್ಪಣ ಹಾಗೂ ಗೋದಾನದಿಂದ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.`
      : `ಮರಣ ಸಮಯವು ಸಾಮಾನ್ಯ ಸನ್ಮಂಗಲಕರವಾಗಿದೆ. ನಿಯಮಿತ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಪಿಂಡ ಪ್ರದಾನ ಕರ್ಮಗಳನ್ನು ನೆರವೇರಿಸಿ.`,
    en: hasPanchaka
      ? `Panchaka / Tripada Nakshatra Demise Dosha indicated. Darbha Putthali Vidhana and Gokarna Pancha Shanti Pooja recommended for family welfare.`
      : hasSpecificTime && isNight
      ? `Nocturnal transition indicated. Regular monthly Tarpana and Go-Dana recommended.`
      : `No severe demise doshas. Perform regular monthly Masika & Pitru Tarpana rituals diligently.`
  };

  const poojas: PoojaRemedyItem[] = [
    {
      title: { kn: "🪔 ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪಂಚಕ ಶಾಂತಿ & ಸರ್ಪಾಹುತಿ", en: "Gokarna Panchaka Shanti & Sarpahuti" },
      description: {
        kn: "ಮರಣ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ತ್ರಿಪಾದ/ಪಂಚಕ ಶಾಂತಿ ಹೋಮ, ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದರ್ಭೆಯ ಪುತ್ತಳಿ ವಿಧಾನ.",
        en: "Panchaka Shanti Homa, Rudrabhishekam and Putthali Vidhana at Gokarna Mahabaleshwara for soul liberation."
      },
      danaItems: { kn: "ತಿಲ ದಾನ, ವಸ್ತ್ರ ದಾನ, ತಾಮ್ರ ಪಾತ್ರೆ & ದಕ್ಷಿಣೆ", en: "Sesame (Tila), Cloth, Copper Vessel & Dakshina" }
    },
    {
      title: { kn: "🥛 ಪ್ರಥಮ ವರ್ಷ ತಿಲ ತರ್ಪಣ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ", en: "First Year Tila Tarpana & Brahmana Bhojana" },
      description: {
        kn: "ಪ್ರತಿಯೊಂದು ಮಾಸಿಕ ತಿಥಿಯಂದು ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯೋದಯ ನಂತರ ಪಿತೃಗಳಿಗೆ ಎಳ್ಳು-ನೀರಿನ ತರ್ಪಣ ನೀಡಬೇಕು.",
        en: "Offer Tila (Sesame) water tarpana to ancestors on every monthly Masika date after sunrise."
      },
      danaItems: { kn: "ಅನ್ನದಾನ, ಜಲಪಾತ್ರೆ ದಾನ", en: "Food donation & Sacred Water Vessel" }
    },
    {
      title: { kn: "🐄 ವೈತರಣಿ ಗೋದಾನ & ಶಯ್ಯಾದಾನ", en: "Vaitarani Godana & Shayyadana" },
      description: {
        kn: "ಆತ್ಮವು ಪರಲೋಕ ಪಯಣದಲ್ಲಿ ವೈತರಣಿ ನದಿಯನ್ನು ಸುಲಭವಾಗಿ ದಾಟಲು ಗೋಕರ್ಣ ಅಥವಾ ತೀರ್ಥ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗೋದಾನ ಸಮರ್ಪಣೆ.",
        en: "Vaitarani Cow donation ensuring peaceful transit across spiritual realms."
      },
      danaItems: { kn: "ಗೋಸೇವೆ, ಬೆಳ್ಳಿ/ತಾಮ್ರ ಪಾತ್ರೆ, ವಸ್ತ್ರ, ಶಯ್ಯಾ ಉಪಕರಣಗಳು", en: "Cow worship, Silver vessel, Clothes, Bedding items" }
    }
  ];

  const doshaAnalysis: DoshaAnalysisResult = {
    hasPanchakaDosha: hasPanchaka,
    panchakaType: { kn: hasPanchaka ? "ತ್ರಿಪಾದ / ಪಂಚಕ ಮರಣ ದೋಷ" : "ಸಾಮಾನ್ಯ", en: hasPanchaka ? "Tripada / Panchaka Demise Dosha" : "Normal" },
    hasNakshatraDosha: isTripadaNakshatra,
    nakshatraDoshaType: { kn: isTripadaNakshatra ? `${nakshatraNameStr} (ತ್ರಿಪಾದ/ಪಂಚಕ ನಕ್ಷತ್ರ)` : "ಸಾಮಾನ್ಯ", en: isTripadaNakshatra ? `${nakshatraNameStr} (Tripada/Panchaka)` : "Normal" },
    hasSandhyaRatriDosha: isNight,
    hasTimeSpecificAnalysis: hasSpecificTime,
    doshaSummary: doshaSummaryObj,
    putthaliVidhanaRequired: hasPanchaka,
    recommendedPoojas: poojas
  };

  const antyestiRoadmap = compute12DaysRoadmap(demiseDate, demiseTime);
  const asthiGuide = computeAsthiVisarjanaGuide();
  const garudaWisdom = computeGarudaPuranaWisdom();
  const mahalayaRules = computeMahalayaTarpanaRules();
  const gokarnaSevas = computeGokarnaMokshaSevas();

  return {
    personName,
    demiseDate,
    demiseTime,
    location,
    yearsCount,
    demiseTithi: demiseTithiObj,
    demiseNakshatra: demiseNakshatraObj,
    demisePaksha: demisePakshaObj,
    masikaSchedule,
    antyestiRoadmap,
    doshaAnalysis,
    asthiGuide,
    garudaWisdom,
    mahalayaRules,
    gokarnaSevas,
    generatedAt: new Date().toLocaleString()
  };
}

/** Generate AI Spiritual Consolation & Vedic Guidance using Gemini 3.5 Flash Lite */
export async function generateMaranottaraAIConsolation(
  result: MaranottaraResult,
  lang: string = "kn",
  apiKey?: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2) as MaranottaraLang;

  const fallbackText: Record<string, string> = {
    kn: `ಓಂ ಶಾಂತಿಃ. ದಿವಂಗತ ${result.personName} ಅವರ ದಿವ್ಯಾತ್ಮಕ್ಕೆ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಿಂದ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.\n\nಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಚಿಸಲಾದ ${result.yearsCount} ವರ್ಷಗಳ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ ದಿನಾಂಕಗಳಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಎಳ್ಳು-ನೀರು ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ನೆರವೇರಿಸುವುದರಿಂದ ಪಿತೃ ದೇವತೆಗಳು ತೃಪ್ತರಾಗಿ ಕುಲಕ್ಕೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತಾನ ಸಮೃದ್ಧಿಯನ್ನು ಕರುಣಿಸುತ್ತಾರೆ.`,
    en: `Om Shanti. May the departed soul of ${result.personName} attain eternal peace and Moksha at the feet of Sri Gokarna Mahabaleshwara.\n\nPerforming the calculated ${result.yearsCount}-year Masika Shraddha & Pitru Tarpana rituals with devotion brings deep ancestral blessings, family peace, and spiritual harmony.`,
    hi: `ॐ शांति। गोकर्ण महाबलेश्वर स्वामी के चरणों में दिवंगत ${result.personName} की आत्मा की शांति हेतु प्रार्थना।`,
    te: `ఓం శాంతి. శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ${result.personName} దివ్యాత్మకు సద్గతి కలుగుగాక.`,
    ta: `ஓம் சாந்தி. ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் பாதங்களில் ${result.personName} ஆத்மா சாந்தி அடையட்டும்.`
  };

  if (!apiKey) {
    return fallbackText[langCode] || fallbackText.en;
  }

  try {
    const prompt = `You are Sri Shreeram Pandit, Chief Priest of Gokarna Mahabaleshwara Kshetra.
Provide a sacred, comforting, authentic Vedic spiritual consolation and guidance message for the family of the deceased person:
- Deceased Name: ${result.personName}
- Demise Date: ${result.demiseDate} (Tithi: ${result.demiseTithi[langCode] || result.demiseTithi.kn})
- Demise Nakshatra: ${result.demiseNakshatra[langCode] || result.demiseNakshatra.kn}
- Scheduled Masika Duration: ${result.yearsCount} Year(s)

Guidelines:
1. Write with deep dignity, compassion, and authentic Vedic wisdom.
2. Explain the spiritual importance of performing monthly Masika Shraddha, Pinda Pradana, and Tila Tarpana for ancestral liberation (Pitru Rinam).
3. Write EXCLUSIVELY in the requested script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
4. Do NOT use Latin/English script words mixed into native language.`;

    const aiRes = await askGemini(prompt, "", apiKey, langCode, { raw: true });
    return aiRes || fallbackText[langCode] || fallbackText.en;
  } catch (err) {
    console.error("Gemini Maranottara AI error:", err);
    return fallbackText[langCode] || fallbackText.en;
  }
}
