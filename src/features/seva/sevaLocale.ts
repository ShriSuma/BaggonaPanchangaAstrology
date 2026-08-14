/**
 * Self-contained 5-language vocabulary for the Seva & Prasada feature.
 *
 * Every string is hand-authored per language and looked up by numeric index or
 * fixed key — never by machine translation and never by matching an English
 * word at runtime. That is what guarantees a Kannada calendar contains only
 * Kannada, a Tamil calendar only Tamil, and so on.
 *
 * Shlokas are the deliberate exception: they stay in Sanskrit (Devanagari) in
 * every language, with a plain-language meaning supplied alongside.
 */

export type SevaLang = "en" | "kn" | "te" | "ta" | "hi";

/** One phrase in all five supported languages. */
export type L5 = Record<SevaLang, string>;

export const SEVA_LANGS: SevaLang[] = ["en", "kn", "te", "ta", "hi"];

export const isSevaLang = (value: string): value is SevaLang =>
  (SEVA_LANGS as string[]).includes(value);

/** Resolve a phrase for the active language, falling back to English. */
export const pick = (phrase?: L5 | null, lang?: string): string => {
  if (!phrase) return "";
  const base = (lang || "en").split("-")[0];
  return isSevaLang(base) ? (phrase[base] || phrase.en || "") : (phrase.en || "");
};

/** Native name of each language, shown in its own script. */
export const LANGUAGE_OWN_NAME: Record<SevaLang, string> = {
  en: "English",
  kn: "ಕನ್ನಡ",
  te: "తెలుగు",
  ta: "தமிழ்",
  hi: "हिन्दी"
};

/** Time of day period labels across 5 languages: Morning / Afternoon / Evening / Night */
export const TIME_OF_DAY_L5 = {
  morning: { en: "Morning", kn: "ಬೆಳಿಗ್ಗೆ", te: "ಉದయం", ta: "காலை", hi: "सुबह" },
  afternoon: { en: "Afternoon", kn: "ಮಧ್ಯಾಹ್ನ", te: "మధ్యాహ్నం", ta: "மதியம்", hi: "दोपहर" },
  evening: { en: "Evening", kn: "ಸಂಜೆ", te: "సాయంత్రం", ta: "மாலை", hi: "शाम" },
  night: { en: "Night", kn: "ರಾತ್ರಿ", te: "రాత్రి", ta: "இரவு", hi: "रात्रि" }
};

export const getTimeOfDayLabel = (hour: number, lang: string): string => {
  let period: "morning" | "afternoon" | "evening" | "night" = "morning";
  if (hour >= 5 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 17) period = "afternoon";
  else if (hour >= 17 && hour < 20) period = "evening";
  else period = "night";
  return pick(TIME_OF_DAY_L5[period], lang);
};

/* ------------------------------------------------------------------ *
 * Rashi (12) — indexed 0..11 to match RASHIS in AstroTypes
 * ------------------------------------------------------------------ */

export const RASHI_L5: L5[] = [
  { en: "Mesha", kn: "ಮೇಷ", te: "మేష", ta: "மேஷம்", hi: "मेष" },
  { en: "Vrishabha", kn: "ವೃಷಭ", te: "వృషభ", ta: "ரிஷபம்", hi: "वृषभ" },
  { en: "Mithuna", kn: "ಮಿಥುನ", te: "మిథున", ta: "மிதுனம்", hi: "मिथुन" },
  { en: "Karka", kn: "ಕರ್ಕಾಟಕ", te: "కర్కాటక", ta: "கடகம்", hi: "कर्क" },
  { en: "Simha", kn: "ಸಿಂಹ", te: "సింహ", ta: "சிம்மம்", hi: "सिंह" },
  { en: "Kanya", kn: "ಕನ್ಯಾ", te: "కన్య", ta: "கன்னி", hi: "कन्या" },
  { en: "Tula", kn: "ತುಲಾ", te: "తులా", ta: "துலாம்", hi: "तुला" },
  { en: "Vrischika", kn: "ವೃಶ್ಚಿಕ", te: "వృశ్చిక", ta: "விருச்சிகம்", hi: "वृश्चिक" },
  { en: "Dhanu", kn: "ಧನುಸ್ಸು", te: "ధనుస్సు", ta: "தனுசு", hi: "धनु" },
  { en: "Makara", kn: "ಮಕರ", te: "మకర", ta: "மகரம்", hi: "मकर" },
  { en: "Kumbha", kn: "ಕುಂಭ", te: "కుంభ", ta: "கும்பம்", hi: "कुंभ" },
  { en: "Meena", kn: "ಮೀನ", te: "మీన", ta: "மீனம்", hi: "मीन" }
];

/* ------------------------------------------------------------------ *
 * Nakshatra (27) — indexed 0..26 to match NAKSHATRAS in AstroTypes
 * ------------------------------------------------------------------ */

export const NAKSHATRA_L5: L5[] = [
  { en: "Ashwini", kn: "ಅಶ್ವಿನಿ", te: "అశ్విని", ta: "அஸ்வினி", hi: "अश्विनी" },
  { en: "Bharani", kn: "ಭರಣಿ", te: "భరణి", ta: "பரணி", hi: "भरणी" },
  { en: "Krittika", kn: "ಕೃತ್ತಿಕಾ", te: "కృత్తికా", ta: "கிருத்திகை", hi: "कृत्तिका" },
  { en: "Rohini", kn: "ರೋಹಿಣಿ", te: "రోహిణి", ta: "ரோகிணி", hi: "रोहिणी" },
  { en: "Mrigashira", kn: "ಮೃಗಶಿರ", te: "మృగశిర", ta: "மிருகசீரிடம்", hi: "मृगशिरा" },
  { en: "Ardra", kn: "ಆರ್ದ್ರಾ", te: "ఆరుద్ర", ta: "திருவாதிரை", hi: "आर्द्रा" },
  { en: "Punarvasu", kn: "ಪುನರ್ವಸು", te: "పునర్వసు", ta: "புனர்பூசம்", hi: "पुनर्वसु" },
  { en: "Pushya", kn: "ಪುಷ್ಯ", te: "పుష్యమి", ta: "பூசம்", hi: "पुष्य" },
  { en: "Ashlesha", kn: "ಆಶ್ಲೇಷಾ", te: "ఆశ్లేష", ta: "ஆயில்யம்", hi: "आश्लेषा" },
  { en: "Magha", kn: "ಮಘಾ", te: "మఘ", ta: "மகம்", hi: "मघा" },
  { en: "Purva Phalguni", kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ", te: "పూర్వ ఫల్గుణి", ta: "பூரம்", hi: "पूर्वा फाल्गुनी" },
  { en: "Uttara Phalguni", kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ", te: "ఉత్తర ఫల్గుణి", ta: "உத்திரம்", hi: "उत्तरा फाल्गुनी" },
  { en: "Hasta", kn: "ಹಸ್ತ", te: "హస్త", ta: "அஸ்தம்", hi: "हस्त" },
  { en: "Chitra", kn: "ಚಿತ್ರಾ", te: "చిత్త", ta: "சித்திரை", hi: "चित्रा" },
  { en: "Swati", kn: "ಸ್ವಾತಿ", te: "స్వాతి", ta: "சுவாதி", hi: "स्वाति" },
  { en: "Vishakha", kn: "ವಿಶಾಖಾ", te: "విశాఖ", ta: "விசாகம்", hi: "विशाखा" },
  { en: "Anuradha", kn: "ಅನುರಾಧಾ", te: "అనూరాధ", ta: "அனுஷம்", hi: "अनुराधा" },
  { en: "Jyeshtha", kn: "ಜ್ಯೇಷ್ಠಾ", te: "జ్యేష్ఠ", ta: "கேட்டை", hi: "ज्येष्ठा" },
  { en: "Mula", kn: "ಮೂಲ", te: "మూల", ta: "மூலம்", hi: "मूल" },
  { en: "Purva Ashadha", kn: "ಪೂರ್ವಾಷಾಢ", te: "పూర్వాషాఢ", ta: "பூராடம்", hi: "पूर्वाषाढ़ा" },
  { en: "Uttara Ashadha", kn: "ಉತ್ತರಾಷಾಢ", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்", hi: "उत्तराषाढ़ा" },
  { en: "Shravana", kn: "ಶ್ರವಣ", te: "శ్రవణ", ta: "திருவோணம்", hi: "श्रवण" },
  { en: "Dhanishtha", kn: "ಧನಿಷ್ಠಾ", te: "ధనిష్ఠ", ta: "அவிட்டம்", hi: "धनिष्ठा" },
  { en: "Shatabhisha", kn: "ಶತಭಿಷಾ", te: "శతభిషం", ta: "சதயம்", hi: "शतभिषा" },
  { en: "Purva Bhadrapada", kn: "ಪೂರ್ವ ಭಾದ್ರಪದ", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி", hi: "पूर्वाभाद्रपद" },
  { en: "Uttara Bhadrapada", kn: "ಉತ್ತರ ಭಾದ್ರಪದ", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி", hi: "उत्तराभाद्रपद" },
  { en: "Revati", kn: "ರೇವತಿ", te: "రేవతి", ta: "ரேவதி", hi: "रेवती" }
];

/* ------------------------------------------------------------------ *
 * Graha (planets)
 * ------------------------------------------------------------------ */

export type GrahaKey = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

export const GRAHA_L5: Record<GrahaKey, L5> = {
  Sun: { en: "Surya", kn: "ಸೂರ್ಯ", te: "సూర్య", ta: "சூரியன்", hi: "सूर्य" },
  Moon: { en: "Chandra", kn: "ಚಂದ್ರ", te: "చంద్ర", ta: "சந்திரன்", hi: "चंद्र" },
  Mars: { en: "Kuja", kn: "ಕುಜ", te: "కుజ", ta: "செவ்வாய்", hi: "मंगल" },
  Mercury: { en: "Budha", kn: "ಬುಧ", te: "బుధ", ta: "புதன்", hi: "बुध" },
  Jupiter: { en: "Guru", kn: "ಗುರು", te: "గురు", ta: "குரு", hi: "गुरु" },
  Venus: { en: "Shukra", kn: "ಶುಕ್ರ", te: "శుక్ర", ta: "சுக்கிரன்", hi: "शुक्र" },
  Saturn: { en: "Shani", kn: "ಶನಿ", te: "శని", ta: "சனி", hi: "शनि" },
  Rahu: { en: "Rahu", kn: "ರಾಹು", te: "రాహు", ta: "ராகு", hi: "राहु" },
  Ketu: { en: "Ketu", kn: "ಕೇತು", te: "కేతు", ta: "கேது", hi: "केतु" }
};

/* ------------------------------------------------------------------ *
 * Weekdays — index 0 = Sunday, matching JavaScript getDay()
 * ------------------------------------------------------------------ */

export const WEEKDAY_L5: L5[] = [
  { en: "Sunday", kn: "ಭಾನುವಾರ", te: "ఆదివారం", ta: "ஞாயிறு", hi: "रविवार" },
  { en: "Monday", kn: "ಸೋಮವಾರ", te: "సోమవారం", ta: "திங்கள்", hi: "सोमवार" },
  { en: "Tuesday", kn: "ಮಂಗಳವಾರ", te: "మంగళవారం", ta: "செவ்வாய்", hi: "मंगलवार" },
  { en: "Wednesday", kn: "ಬುಧವಾರ", te: "బుధవారం", ta: "புதன்", hi: "बुधवार" },
  { en: "Thursday", kn: "ಗುರುವಾರ", te: "గురువారం", ta: "வியாழன்", hi: "गुरुवार" },
  { en: "Friday", kn: "ಶುಕ್ರವಾರ", te: "శుక్రవారం", ta: "வெள்ளி", hi: "शुक्रवार" },
  { en: "Saturday", kn: "ಶನಿವಾರ", te: "శనివారం", ta: "சனி", hi: "शनिवार" }
];

/** Compact weekday headings for the seven-column month grid. */
export const WEEKDAY_SHORT_L5: L5[] = [
  { en: "Sun", kn: "ಭಾನು", te: "ఆది", ta: "ஞாயி", hi: "रवि" },
  { en: "Mon", kn: "ಸೋಮ", te: "సోమ", ta: "திங்", hi: "सोम" },
  { en: "Tue", kn: "ಮಂಗಳ", te: "మంగళ", ta: "செவ்", hi: "मंगल" },
  { en: "Wed", kn: "ಬುಧ", te: "బుధ", ta: "புதன்", hi: "बुध" },
  { en: "Thu", kn: "ಗುರು", te: "గురు", ta: "வியா", hi: "गुरु" },
  { en: "Fri", kn: "ಶುಕ್ರ", te: "శుక్ర", ta: "வெள்", hi: "शुक्र" },
  { en: "Sat", kn: "ಶನಿ", te: "శని", ta: "சனி", hi: "शनि" }
];

/* ------------------------------------------------------------------ *
 * Gregorian months — index 0 = January
 * ------------------------------------------------------------------ */

export const MONTH_L5: L5[] = [
  { en: "January", kn: "ಜನವರಿ", te: "జనవరి", ta: "ஜனவரி", hi: "जनवरी" },
  { en: "February", kn: "ಫೆಬ್ರವರಿ", te: "ఫిబ్రవరి", ta: "பிப்ரவரி", hi: "फ़रवरी" },
  { en: "March", kn: "ಮಾರ್ಚ್", te: "మార్చి", ta: "மார்ச்", hi: "मार्च" },
  { en: "April", kn: "ಏಪ್ರಿಲ್", te: "ఏప్రిల్", ta: "ஏப்ரல்", hi: "अप्रैल" },
  { en: "May", kn: "ಮೇ", te: "మే", ta: "மே", hi: "मई" },
  { en: "June", kn: "ಜೂನ್", te: "జూన్", ta: "ஜூன்", hi: "जून" },
  { en: "July", kn: "ಜುಲೈ", te: "జూలై", ta: "ஜூலை", hi: "जुलाई" },
  { en: "August", kn: "ಆಗಸ್ಟ್", te: "ఆగస్టు", ta: "ஆகஸ்ட்", hi: "अगस्त" },
  { en: "September", kn: "ಸೆಪ್ಟೆಂಬರ್", te: "సెప్టెంబర్", ta: "செப்டம்பர்", hi: "सितंबर" },
  { en: "October", kn: "ಅಕ್ಟೋಬರ್", te: "అక్టోబర్", ta: "அக்டோபர்", hi: "अक्तूबर" },
  { en: "November", kn: "ನವೆಂಬರ್", te: "నవంబర్", ta: "நவம்பர்", hi: "नवंबर" },
  { en: "December", kn: "ಡಿಸೆಂಬರ್", te: "డిసెంబర్", ta: "டிசம்பர்", hi: "दिसंबर" }
];

/* ------------------------------------------------------------------ *
 * Tithi names — index 1..15 within a paksha
 * ------------------------------------------------------------------ */

export const TITHI_L5: L5[] = [
  { en: "Prathama", kn: "ಪಾಡ್ಯ", te: "పాడ్యమి", ta: "பிரதமை", hi: "प्रतिपदा" },
  { en: "Dwitiya", kn: "ಬಿದಿಗೆ", te: "విదియ", ta: "துவிதியை", hi: "द्वितीया" },
  { en: "Tritiya", kn: "ತದಿಗೆ", te: "తదియ", ta: "திரிதியை", hi: "तृतीया" },
  { en: "Chaturthi", kn: "ಚೌತಿ", te: "చవితి", ta: "சதுர்த்தி", hi: "चतुर्थी" },
  { en: "Panchami", kn: "ಪಂಚಮಿ", te: "పంచమి", ta: "பஞ்சமி", hi: "पंचमी" },
  { en: "Shashthi", kn: "ಷಷ್ಠಿ", te: "షష్ఠి", ta: "சஷ்டி", hi: "षष्ठी" },
  { en: "Saptami", kn: "ಸಪ್ತಮಿ", te: "సప్తమి", ta: "சப்தமி", hi: "सप्तमी" },
  { en: "Ashtami", kn: "ಅಷ್ಟಮಿ", te: "అష్టమి", ta: "அஷ்டமி", hi: "अष्टमी" },
  { en: "Navami", kn: "ನವಮಿ", te: "నవమి", ta: "நவமி", hi: "नवमी" },
  { en: "Dashami", kn: "ದಶಮಿ", te: "దశమి", ta: "தசமி", hi: "दशमी" },
  { en: "Ekadashi", kn: "ಏಕಾದಶಿ", te: "ఏకాదశి", ta: "ஏகாதசி", hi: "एकादशी" },
  { en: "Dwadashi", kn: "ದ್ವಾದಶಿ", te: "ద్వాదశి", ta: "துவாதசி", hi: "द्वादशी" },
  { en: "Trayodashi", kn: "ತ್ರಯೋದಶಿ", te: "త్రయోదశి", ta: "திரயோதசி", hi: "त्रयोदशी" },
  { en: "Chaturdashi", kn: "ಚತುರ್ದಶಿ", te: "చతుర్దశి", ta: "சதுர்த்தசி", hi: "चतुर्दशी" }
];

export const PURNIMA_L5: L5 = { en: "Purnima", kn: "ಹುಣ್ಣಿಮೆ", te: "పౌర్ణమి", ta: "பௌர்ணமி", hi: "पूर्णिमा" };
export const AMAVASYA_L5: L5 = { en: "Amavasya", kn: "ಅಮಾವಾಸ್ಯೆ", te: "అమావాస్య", ta: "அமாவாசை", hi: "अमावस्या" };

export const PAKSHA_L5: Record<"shukla" | "krishna", L5> = {
  shukla: { en: "Shukla Paksha", kn: "ಶುಕ್ಲ ಪಕ್ಷ", te: "శుక్ల పక్షం", ta: "சுக்ல பட்சம்", hi: "शुक्ल पक्ष" },
  krishna: { en: "Krishna Paksha", kn: "ಕೃಷ್ಣ ಪಕ್ಷ", te: "కృష్ణ పక్షం", ta: "கிருஷ்ண பட்சம்", hi: "कृष्ण पक्ष" }
};

/* ------------------------------------------------------------------ *
 * Colours and directions (lucky guidance)
 * ------------------------------------------------------------------ */

export type ColourKey = "white" | "red" | "green" | "yellow" | "orange" | "pink" | "darkblue";

export const COLOUR_L5: Record<ColourKey, L5> = {
  white: { en: "White", kn: "ಬಿಳಿ", te: "తెలుపు", ta: "வெள்ளை", hi: "सफ़ेद" },
  red: { en: "Red", kn: "ಕೆಂಪು", te: "ఎరుపు", ta: "சிவப்பு", hi: "लाल" },
  green: { en: "Green", kn: "ಹಸಿರು", te: "ఆకుపచ్చ", ta: "பச்சை", hi: "हरा" },
  yellow: { en: "Yellow", kn: "ಹಳದಿ", te: "పసుపు", ta: "மஞ்சள்", hi: "पीला" },
  orange: { en: "Orange", kn: "ಕಿತ್ತಳೆ", te: "నారింజ", ta: "ஆரஞ்சு", hi: "नारंगी" },
  pink: { en: "Pink", kn: "ಗುಲಾಬಿ", te: "గులాబీ", ta: "இளஞ்சிவப்பு", hi: "गुलाबी" },
  darkblue: { en: "Dark Blue", kn: "ಗಾಢ ನೀಲಿ", te: "ముదురు నీలం", ta: "அடர் நீலம்", hi: "गहरा नीला" }
};

/** Hex swatches so the UI and print can show the colour, not just name it. */
export const COLOUR_HEX: Record<ColourKey, string> = {
  white: "#F8FAFC",
  red: "#DC2626",
  green: "#16A34A",
  yellow: "#EAB308",
  orange: "#EA580C",
  pink: "#EC4899",
  darkblue: "#1E3A8A"
};

export type DirectionKey = "east" | "west" | "north" | "south" | "northeast" | "northwest" | "southeast" | "southwest";

export const DIRECTION_L5: Record<DirectionKey, L5> = {
  east: { en: "East", kn: "ಪೂರ್ವ", te: "తూర్పు", ta: "கிழக்கு", hi: "पूर्व" },
  west: { en: "West", kn: "ಪಶ್ಚಿಮ", te: "పడమర", ta: "மேற்கு", hi: "पश्चिम" },
  north: { en: "North", kn: "ಉತ್ತರ", te: "ఉత్తరం", ta: "வடக்கு", hi: "उत्तर" },
  south: { en: "South", kn: "ದಕ್ಷಿಣ", te: "దక్షిణం", ta: "தெற்கு", hi: "दक्षिण" },
  northeast: { en: "North-East", kn: "ಈಶಾನ್ಯ", te: "ఈశాన్యం", ta: "வடகிழக்கு", hi: "उत्तर-पूर्व" },
  northwest: { en: "North-West", kn: "ವಾಯವ್ಯ", te: "వాయవ్యం", ta: "வடமேற்கு", hi: "उत्तर-पश्चिम" },
  southeast: { en: "South-East", kn: "ಆಗ್ನೇಯ", te: "ఆగ్నేయం", ta: "தென்கிழக்கு", hi: "दक्षिण-पूर्व" },
  southwest: { en: "South-West", kn: "ನೈಋತ್ಯ", te: "నైరుతి", ta: "தென்மேற்கு", hi: "दक्षिण-पश्चिम" }
};

/* ------------------------------------------------------------------ *
 * Tara Bala — the nine taras counted from the janma nakshatra
 * ------------------------------------------------------------------ */

export type TaraInfo = {
  /** 1..9 */
  number: number;
  name: L5;
  /** One short line a non-astrologer can act on. */
  meaning: L5;
};

export const TARA_L5: TaraInfo[] = [
  {
    number: 1,
    name: { en: "Janma", kn: "ಜನ್ಮ", te: "జన్మ", ta: "ஜன்ம", hi: "जन्म" },
    meaning: {
      en: "Your own birth star. Look after your body and rest a little more.",
      kn: "ನಿಮ್ಮ ಸ್ವಂತ ಜನ್ಮ ನಕ್ಷತ್ರ. ದೇಹವನ್ನು ನೋಡಿಕೊಳ್ಳಿ, ಸ್ವಲ್ಪ ಹೆಚ್ಚು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.",
      te: "మీ స్వంత జన్మ నక్షత్రం. శరీరాన్ని జాగ్రత్తగా చూసుకోండి, కొంచెం ఎక్కువ విశ్రాంతి తీసుకోండి.",
      ta: "உங்கள் சொந்த ஜன்ம நட்சத்திரம். உடலைக் கவனியுங்கள், சிறிது அதிக ஓய்வு எடுங்கள்.",
      hi: "आपका अपना जन्म नक्षत्र। शरीर का ध्यान रखें और थोड़ा अधिक विश्राम करें।"
    }
  },
  {
    number: 2,
    name: { en: "Sampat", kn: "ಸಂಪತ್", te: "సంపత్", ta: "சம்பத்", hi: "सम्पत्" },
    meaning: {
      en: "Star of wealth. Money matters and new purchases go well.",
      kn: "ಸಂಪತ್ತಿನ ನಕ್ಷತ್ರ. ಹಣದ ವಿಷಯಗಳು ಮತ್ತು ಹೊಸ ಖರೀದಿಗಳು ಚೆನ್ನಾಗಿ ನಡೆಯುತ್ತವೆ.",
      te: "సంపద నక్షత్రం. డబ్బు విషయాలు మరియు కొత్త కొనుగోళ్లు బాగా జరుగుతాయి.",
      ta: "செல்வ நட்சத்திரம். பண விஷயங்களும் புதிய கொள்முதல்களும் நன்றாக நடக்கும்.",
      hi: "धन का नक्षत्र। पैसे के काम और नई खरीदारी अच्छी रहती है।"
    }
  },
  {
    number: 3,
    name: { en: "Vipat", kn: "ವಿಪತ್", te: "విపత్", ta: "விபத்", hi: "विपत्" },
    meaning: {
      en: "Star of hurdles. Move slowly and avoid starting something new.",
      kn: "ಅಡೆತಡೆಗಳ ನಕ್ಷತ್ರ. ನಿಧಾನವಾಗಿ ಮುಂದುವರಿಯಿರಿ, ಹೊಸದನ್ನು ಆರಂಭಿಸಬೇಡಿ.",
      te: "అడ్డంకుల నక్షత్రం. నెమ్మదిగా ముందుకు సాగండి, కొత్తది ప్రారంభించవద్దు.",
      ta: "தடைகளின் நட்சத்திரம். மெதுவாகச் செல்லுங்கள், புதியதைத் தொடங்க வேண்டாம்.",
      hi: "बाधाओं का नक्षत्र। धीरे चलें और कुछ नया शुरू न करें।"
    }
  },
  {
    number: 4,
    name: { en: "Kshema", kn: "ಕ್ಷೇಮ", te: "క్షేమ", ta: "க்ஷேம", hi: "क्षेम" },
    meaning: {
      en: "Star of safety. A calm and comfortable day for family work.",
      kn: "ಕ್ಷೇಮದ ನಕ್ಷತ್ರ. ಕುಟುಂಬದ ಕೆಲಸಕ್ಕೆ ಶಾಂತ ಮತ್ತು ಸುಖಕರ ದಿನ.",
      te: "క్షేమ నక్షత్రం. కుటుంబ పనులకు ప్రశాంతమైన, సౌకర్యవంతమైన రోజు.",
      ta: "பாதுகாப்பின் நட்சத்திரம். குடும்ப வேலைகளுக்கு அமைதியான வசதியான நாள்.",
      hi: "क्षेम का नक्षत्र। परिवार के काम के लिए शांत और सुखद दिन।"
    }
  },
  {
    number: 5,
    name: { en: "Pratyari", kn: "ಪ್ರತ್ಯರಿ", te: "ప్రత్యరి", ta: "பிரத்யரி", hi: "प्रत्यरि" },
    meaning: {
      en: "Star of resistance. Keep away from arguments and disputes.",
      kn: "ವಿರೋಧದ ನಕ್ಷತ್ರ. ವಾದ ಮತ್ತು ಜಗಳಗಳಿಂದ ದೂರವಿರಿ.",
      te: "వ్యతిరేకత నక్షత్రం. వాదనలు, గొడవలకు దూరంగా ఉండండి.",
      ta: "எதிர்ப்பின் நட்சத்திரம். வாக்குவாதங்களிலிருந்து விலகி இருங்கள்.",
      hi: "विरोध का नक्षत्र। बहस और झगड़ों से दूर रहें।"
    }
  },
  {
    number: 6,
    name: { en: "Sadhaka", kn: "ಸಾಧಕ", te: "సాధక", ta: "சாதக", hi: "साधक" },
    meaning: {
      en: "Star of achievement. Pending work finishes on this day.",
      kn: "ಸಾಧನೆಯ ನಕ್ಷತ್ರ. ಬಾಕಿ ಇರುವ ಕೆಲಸ ಈ ದಿನ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
      te: "సాధన నక్షత్రం. పెండింగ్ పనులు ఈ రోజు పూర్తవుతాయి.",
      ta: "சாதனையின் நட்சத்திரம். நிலுவையில் உள்ள வேலை இந்நாளில் முடியும்.",
      hi: "सिद्धि का नक्षत्र। रुका हुआ काम इस दिन पूरा होता है।"
    }
  },
  {
    number: 7,
    name: { en: "Vadha", kn: "ವಧ", te: "వధ", ta: "வத", hi: "वध" },
    meaning: {
      en: "Star of loss. Postpone big decisions and long travel.",
      kn: "ನಷ್ಟದ ನಕ್ಷತ್ರ. ದೊಡ್ಡ ನಿರ್ಧಾರ ಮತ್ತು ದೂರ ಪ್ರಯಾಣವನ್ನು ಮುಂದೂಡಿ.",
      te: "నష్ట నక్షత్రం. పెద్ద నిర్ణయాలు, దూర ప్రయాణాలు వాయిదా వేయండి.",
      ta: "இழப்பின் நட்சத்திரம். பெரிய முடிவுகளையும் நீண்ட பயணத்தையும் ஒத்திவையுங்கள்.",
      hi: "हानि का नक्षत्र। बड़े निर्णय और लंबी यात्रा टाल दें।"
    }
  },
  {
    number: 8,
    name: { en: "Mitra", kn: "ಮಿತ್ರ", te: "మిత్ర", ta: "மித்ர", hi: "मित्र" },
    meaning: {
      en: "Star of friendship. People help you willingly today.",
      kn: "ಮಿತ್ರತ್ವದ ನಕ್ಷತ್ರ. ಇಂದು ಜನರು ಮನಃಪೂರ್ವಕವಾಗಿ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.",
      te: "మిత్రత్వ నక్షత్రం. ఈ రోజు ప్రజలు మనస్ఫూర్తిగా సహాయం చేస్తారు.",
      ta: "நட்பின் நட்சத்திரம். இன்று மக்கள் மனமுவந்து உதவுவார்கள்.",
      hi: "मित्रता का नक्षत्र। आज लोग मन से आपकी मदद करते हैं।"
    }
  },
  {
    number: 9,
    name: { en: "Parama Mitra", kn: "ಪರಮ ಮಿತ್ರ", te: "పరమ మిత్ర", ta: "பரம மித்ர", hi: "परम मित्र" },
    meaning: {
      en: "Strongest supporting star. Excellent for anything important.",
      kn: "ಅತ್ಯಂತ ಬಲವಾದ ಸಹಾಯಕ ನಕ್ಷತ್ರ. ಮುಖ್ಯವಾದ ಯಾವುದೇ ಕೆಲಸಕ್ಕೆ ಉತ್ತಮ.",
      te: "అత్యంత బలమైన సహాయక నక్షత్రం. ముఖ్యమైన ఏ పనికైనా చాలా మంచిది.",
      ta: "மிக வலிமையான ஆதரவு நட்சத்திரம். முக்கியமான எந்த வேலைக்கும் சிறந்தது.",
      hi: "सबसे मजबूत सहायक नक्षत्र। किसी भी महत्वपूर्ण काम के लिए उत्तम।"
    }
  }
];

/* ------------------------------------------------------------------ *
 * Energy bands
 * ------------------------------------------------------------------ */

export type EnergyBand = "high" | "steady" | "rest";

export const BAND_LABEL_L5: Record<EnergyBand, L5> = {
  high: { en: "High Energy", kn: "ಹೆಚ್ಚಿನ ಶಕ್ತಿ", te: "అధిక శక్తి", ta: "உயர் ஆற்றல்", hi: "उच्च ऊर्जा" },
  steady: { en: "Steady", kn: "ಸಮತೋಲನ", te: "సమతుల్యం", ta: "சமநிலை", hi: "संतुलित" },
  rest: { en: "Rest and Pray", kn: "ವಿಶ್ರಾಂತಿ ಮತ್ತು ಪ್ರಾರ್ಥನೆ", te: "విశ్రాంతి మరియు ప్రార్థన", ta: "ஓய்வும் பிரார்த்தனையும்", hi: "विश्राम और प्रार्थना" }
};

export const BAND_GUIDE_L5: Record<EnergyBand, L5> = {
  high: {
    en: "Your mind will feel light and clear. Take up important work, meet people and sign what is pending.",
    kn: "ಮನಸ್ಸು ಹಗುರವಾಗಿ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿ ಇರುತ್ತದೆ. ಮುಖ್ಯ ಕೆಲಸ ಕೈಗೆತ್ತಿಕೊಳ್ಳಿ, ಜನರನ್ನು ಭೇಟಿಯಾಗಿ, ಬಾಕಿ ಇರುವ ಸಹಿ ಮಾಡಿ.",
    te: "మనసు తేలికగా, స్పష్టంగా ఉంటుంది. ముఖ్యమైన పని చేపట్టండి, వ్యక్తులను కలవండి, పెండింగ్ సంతకాలు పూర్తి చేయండి.",
    ta: "மனம் இலகுவாகவும் தெளிவாகவும் இருக்கும். முக்கியமான வேலையை எடுங்கள், மக்களைச் சந்தியுங்கள், நிலுவையில் உள்ளதில் கையெழுத்திடுங்கள்.",
    hi: "मन हल्का और साफ़ रहेगा। ज़रूरी काम हाथ में लें, लोगों से मिलें और रुके हुए कागज़ पर हस्ताक्षर करें।"
  },
  steady: {
    en: "A balanced day. Continue your routine work calmly. Nothing needs to be forced.",
    kn: "ಸಮತೋಲಿತ ದಿನ. ನಿತ್ಯದ ಕೆಲಸವನ್ನು ಶಾಂತವಾಗಿ ಮುಂದುವರಿಸಿ. ಯಾವುದನ್ನೂ ಒತ್ತಾಯದಿಂದ ಮಾಡಬೇಕಿಲ್ಲ.",
    te: "సమతుల్యమైన రోజు. రోజువారీ పనిని ప్రశాంతంగా కొనసాగించండి. దేనినీ బలవంతంగా చేయనవసరం లేదు.",
    ta: "சமநிலையான நாள். வழக்கமான வேலையை அமைதியாகத் தொடருங்கள். எதையும் வலுக்கட்டாயமாகச் செய்ய வேண்டாம்.",
    hi: "संतुलित दिन। रोज़ का काम शांति से जारी रखें। किसी बात को ज़बरदस्ती करने की ज़रूरत नहीं।"
  },
  rest: {
    en: "Energy is low today. Rest, pray, and keep big decisions for another day.",
    kn: "ಇಂದು ಶಕ್ತಿ ಕಡಿಮೆ. ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಪ್ರಾರ್ಥಿಸಿ, ದೊಡ್ಡ ನಿರ್ಧಾರಗಳನ್ನು ಬೇರೊಂದು ದಿನಕ್ಕೆ ಇಡಿ.",
    te: "ఈ రోజు శక్తి తక్కువ. విశ్రాంతి తీసుకోండి, ప్రార్థించండి, పెద్ద నిర్ణయాలను మరో రోజుకు ఉంచండి.",
    ta: "இன்று ஆற்றல் குறைவு. ஓய்வெடுங்கள், பிரார்த்தியுங்கள், பெரிய முடிவுகளை வேறு நாளுக்கு வையுங்கள்.",
    hi: "आज ऊर्जा कम है। विश्राम करें, प्रार्थना करें और बड़े निर्णय किसी और दिन के लिए रखें।"
  }
};

/* ------------------------------------------------------------------ *
 * Interface strings
 * ------------------------------------------------------------------ */

export const T: Record<string, L5> = {
  pageTitle: { en: "Seva and Prasada", kn: "ಸೇವೆ ಮತ್ತು ಪ್ರಸಾದ", te: "సేవ మరియు ప్రసాదం", ta: "சேவை மற்றும் பிரசாதம்", hi: "सेवा और प्रसाद" },
  pageSubtitle: {
    en: "Gokarna Kshetra — your seva, your 90-day personal calendar, and your prasada keepsake.",
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ — ನಿಮ್ಮ ಸೇವೆ, ನಿಮ್ಮ 90 ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ನಿಮ್ಮ ಪ್ರಸಾದದ ನೆನಪು.",
    te: "గోకర్ణ క్షేత్రం — మీ సేవ, మీ 90 రోజుల క్యాలెండర్ మరియు మీ ప్రసాద జ్ఞాపిక.",
    ta: "கோகர்ண க்ஷேத்திரம் — உங்கள் சேவை, உங்கள் 90 நாட்களின் நாட்காட்டி மற்றும் உங்கள் பிரசாத நினைவு.",
    hi: "गोकर्ण क्षेत्र — आपकी सेवा, आपका 90 दिनों का कैलेंडर और आपकी प्रसाद स्मृति।"
  },

  tabSeva: { en: "Recommended Seva", kn: "ಸೂಚಿಸಿದ ಸೇವೆ", te: "సూచించిన సేవ", ta: "பரிந்துரைக்கப்பட்ட சேவை", hi: "सुझाई गई सेवा" },
  tabCalendar: { en: "90-Day Calendar", kn: "90 ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್", te: "90 రోజుల క్యాలెండర్", ta: "90 நாட்களின் நாட்காட்டி", hi: "90 दिनों का कैलेंडर" },
  tabPrasada: { en: "Prasada Kit", kn: "ಪ್ರಸಾದ ಸಂಪುಟ", te: "ప్రసాద సంపుటి", ta: "பிரசாதப் பொதி", hi: "प्रसाद संपुट" },

  yourDetails: { en: "Your Details", kn: "ನಿಮ್ಮ ವಿವರಗಳು", te: "మీ వివరాలు", ta: "உங்கள் விவரங்கள்", hi: "आपका विवरण" },
  labelName: { en: "Name", kn: "ಹೆಸರು", te: "పేరు", ta: "பெயர்", hi: "नाम" },
  labelRashi: { en: "Janma Rashi", kn: "ಜನ್ಮ ರಾಶಿ", te: "జన్మ రాశి", ta: "ஜன்ம ராசி", hi: "जन्म राशि" },
  labelNakshatra: { en: "Janma Nakshatra", kn: "ಜನ್ಮ ನಕ್ಷತ್ರ", te: "జన్మ నక్షత్రం", ta: "ஜன்ம நட்சத்திரம்", hi: "जन्म नक्षत्र" },
  labelLagna: { en: "Lagna", kn: "ಲಗ್ನ", te: "లగ్నం", ta: "லக்னம்", hi: "लग्न" },
  labelGotra: { en: "Gotra", kn: "ಗೋತ್ರ", te: "గోత్రం", ta: "கோத்திரம்", hi: "गोत्र" },
  labelTithi: { en: "Tithi", kn: "ತಿಥಿ", te: "తిథి", ta: "திதி", hi: "तिथि" },
  labelVara: { en: "Day", kn: "ವಾರ", te: "వారం", ta: "வாரம்", hi: "वार" },
  labelTaraBala: { en: "Tara Bala", kn: "ತಾರಾ ಬಲ", te: "తారా బలం", ta: "தாரா பலம்", hi: "तारा बल" },
  labelChandraBala: { en: "Chandra Bala", kn: "ಚಂದ್ರ ಬಲ", te: "చంద్ర బలం", ta: "சந்திர பலம்", hi: "चंद्र बल" },
  labelMoonSign: { en: "Moon today in", kn: "ಇಂದು ಚಂದ್ರ", te: "ఈ రోజు చంద్రుడు", ta: "இன்று சந்திரன்", hi: "आज चंद्रमा" },
  labelDasha: { en: "Running Dasha", kn: "ನಡೆಯುತ್ತಿರುವ ದಶಾ", te: "నడుస్తున్న దశ", ta: "நடக்கும் தசை", hi: "चल रही दशा" },

  luckyNumber: { en: "Lucky Number", kn: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ", te: "అదృష్ట సంఖ్య", ta: "அதிர்ஷ்ட எண்", hi: "शुभ अंक" },
  luckyColour: { en: "Lucky Colour", kn: "ಅದೃಷ್ಟ ಬಣ್ಣ", te: "అదృష్ట రంగు", ta: "அதிர்ஷ்ட நிறம்", hi: "शुभ रंग" },
  luckyDirection: { en: "Favourable Direction", kn: "ಶುಭ ದಿಕ್ಕು", te: "శుభ దిక్కు", ta: "நல்ல திசை", hi: "शुभ दिशा" },

  moneyDay: { en: "Good for money matters", kn: "ಹಣಕಾಸಿನ ಕೆಲಸಕ್ಕೆ ಒಳ್ಳೆಯದು", te: "ఆర్థిక పనులకు మంచిది", ta: "பணம் சார்ந்த வேலைக்கு நல்லது", hi: "धन के कामों के लिए अच्छा" },
  moneyDayShort: { en: "Money Day", kn: "ಹಣದ ದಿನ", te: "ధన దినం", ta: "பண நாள்", hi: "धन दिवस" },
  restDayShort: { en: "Rest Day", kn: "ವಿಶ್ರಾಂತಿ ದಿನ", te: "విశ్రాంతి దినం", ta: "ஓய்வு நாள்", hi: "विश्राम दिवस" },
  poojaDayShort: { en: "Pooja Day", kn: "ಪೂಜಾ ದಿನ", te: "పూజా దినం", ta: "பூஜை நாள்", hi: "पूजा दिवस" },

  chandrashtama: { en: "Chandrashtama — keep the day quiet", kn: "ಚಂದ್ರಾಷ್ಟಮ — ದಿನವನ್ನು ಶಾಂತವಾಗಿ ಕಳೆಯಿರಿ", te: "చంద్రాష్టమ — రోజును ప్రశాంతంగా గడపండి", ta: "சந்திராஷ்டமம் — நாளை அமைதியாகக் கழியுங்கள்", hi: "चंद्राष्टम — दिन शांति से बिताएँ" },

  legend: { en: "Legend", kn: "ಸೂಚಿ", te: "సూచిక", ta: "குறியீடு", hi: "संकेत सूची" },
  today: { en: "Today", kn: "ಇಂದು", te: "ఈ రోజు", ta: "இன்று", hi: "आज" },
  tapDay: { en: "Tap any date to see the guidance for that day.", kn: "ಆ ದಿನದ ಮಾರ್ಗದರ್ಶನ ನೋಡಲು ಯಾವುದೇ ದಿನಾಂಕವನ್ನು ಒತ್ತಿರಿ.", te: "ఆ రోజు మార్గదర్శనం చూడటానికి ఏదైనా తేదీని నొక్కండి.", ta: "அந்நாளின் வழிகாட்டுதலைக் காண எந்த தேதியையும் தொடவும்.", hi: "उस दिन का मार्गदर्शन देखने के लिए किसी भी तारीख़ पर दबाएँ।" },
  whyThisDay: { en: "Why this day is like this", kn: "ಈ ದಿನ ಹೀಗೇಕೆ", te: "ఈ రోజు ఇలా ఎందుకు", ta: "இந்நாள் ஏன் இப்படி", hi: "यह दिन ऐसा क्यों है" },
  whatToDo: { en: "What to do", kn: "ಏನು ಮಾಡಬೇಕು", te: "ఏమి చేయాలి", ta: "என்ன செய்ய வேண்டும்", hi: "क्या करें" },

  bestDays: { en: "Strongest days in these 90 days", kn: "ಈ 90 ದಿನಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ದಿನಗಳು", te: "ఈ 90 రోజుల్లో అత్యుత్తమ రోజులు", ta: "இந்த 90 நாட்களில் சிறந்த நாட்கள்", hi: "इन 90 दिनों के सबसे अच्छे दिन" },
  carefulDays: { en: "Days to take it easy", kn: "ನಿಧಾನವಾಗಿ ಇರಬೇಕಾದ ದಿನಗಳು", te: "నెమ్మదిగా ఉండవలసిన రోజులు", ta: "நிதானமாக இருக்க வேண்டிய நாட்கள்", hi: "आराम से रहने के दिन" },
  moneyDays: { en: "Days good for money and new purchases", kn: "ಹಣ ಮತ್ತು ಹೊಸ ಖರೀದಿಗೆ ಒಳ್ಳೆಯ ದಿನಗಳು", te: "డబ్బు, కొత్త కొనుగోళ్లకు మంచి రోజులు", ta: "பணம் மற்றும் புதிய கொள்முதலுக்கு நல்ல நாட்கள்", hi: "धन और नई खरीदारी के लिए अच्छे दिन" },
  monthSummary: { en: "Month at a glance", kn: "ತಿಂಗಳ ಸಾರಾಂಶ", te: "నెల సారాంశం", ta: "மாதச் சுருக்கம்", hi: "महीने का सार" },
  countHigh: { en: "High energy days", kn: "ಹೆಚ್ಚಿನ ಶಕ್ತಿಯ ದಿನಗಳು", te: "అధిక శక్తి రోజులు", ta: "உயர் ஆற்றல் நாட்கள்", hi: "उच्च ऊर्जा वाले दिन" },
  countRest: { en: "Rest days", kn: "ವಿಶ್ರಾಂತಿ ದಿನಗಳು", te: "విశ్రాంతి రోజులు", ta: "ஓய்வு நாட்கள்", hi: "विश्राम के दिन" },
  countMoney: { en: "Money days", kn: "ಹಣದ ದಿನಗಳು", te: "ధన దినాలు", ta: "பண நாட்கள்", hi: "धन के दिन" },

  sevaHeading: { en: "Seva suggested by your chart", kn: "ನಿಮ್ಮ ಜಾತಕ ಸೂಚಿಸುವ ಸೇವೆ", te: "మీ జాతకం సూచించే సేవ", ta: "உங்கள் ஜாதகம் பரிந்துரைக்கும் சேவை", hi: "आपकी कुंडली द्वारा सुझाई गई सेवा" },
  sevaWhy: { en: "Why this seva", kn: "ಈ ಸೇವೆ ಏಕೆ", te: "ఈ సేవ ఎందుకు", ta: "இந்தச் சேவை ஏன்", hi: "यह सेवा क्यों" },
  sevaBenefit: { en: "What it gives", kn: "ಇದರಿಂದ ಸಿಗುವುದು", te: "దీని వల్ల కలిగేది", ta: "இதனால் கிடைப்பது", hi: "इससे मिलने वाला लाभ" },
  sevaWhere: { en: "Where", kn: "ಎಲ್ಲಿ", te: "ఎక్కడ", ta: "எங்கே", hi: "कहाँ" },
  sevaWhen: { en: "Best time", kn: "ಸೂಕ್ತ ಸಮಯ", te: "సరైన సమయం", ta: "ஏற்ற நேரம்", hi: "उपयुक्त समय" },
  sevaDuration: { en: "Duration", kn: "ಅವಧಿ", te: "వ్యవధి", ta: "கால அளவு", hi: "अवधि" },
  sevaPrimary: { en: "Most recommended", kn: "ಅತಿ ಹೆಚ್ಚು ಸೂಚಿಸಲಾಗಿದೆ", te: "అత్యంత సిఫార్సు", ta: "மிகவும் பரிந்துரைக்கப்பட்டது", hi: "सबसे अधिक अनुशंसित" },
  sevaAlso: { en: "You may also consider", kn: "ಇವನ್ನೂ ಪರಿಗಣಿಸಬಹುದು", te: "వీటిని కూడా పరిగణించవచ్చు", ta: "இவற்றையும் பரிசீலிக்கலாம்", hi: "इन पर भी विचार कर सकते हैं" },

  prasadaHeading: { en: "Your Prasada Kit", kn: "ನಿಮ್ಮ ಪ್ರಸಾದ ಸಂಪುಟ", te: "మీ ప్రసాద సంపుటి", ta: "உங்கள் பிரசாதப் பொதி", hi: "आपका प्रसाद संपुट" },
  prasadaIntro: {
    en: "Three printed pieces are prepared for you. Download them and keep the calendar where you can see it every day.",
    kn: "ನಿಮಗಾಗಿ ಮೂರು ಮುದ್ರಿತ ಪತ್ರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಅವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ, ಕ್ಯಾಲೆಂಡರ್ ಅನ್ನು ಪ್ರತಿದಿನ ಕಾಣುವ ಸ್ಥಳದಲ್ಲಿ ಇರಿಸಿ.",
    te: "మీ కోసం మూడు ముద్రిత పత్రాలు సిద్ధం చేయబడ్డాయి. వాటిని డౌన్‌లోడ్ చేసి, క్యాలెండర్‌ను ప్రతిరోజూ కనిపించే చోట ఉంచండి.",
    ta: "உங்களுக்காக மூன்று அச்சிடப்பட்ட தாள்கள் தயாரிக்கப்பட்டுள்ளன. அவற்றைப் பதிவிறக்கி, நாட்காட்டியை தினமும் தெரியும் இடத்தில் வையுங்கள்.",
    hi: "आपके लिए तीन मुद्रित पत्र तैयार किए गए हैं। उन्हें डाउनलोड करें और कैलेंडर को ऐसी जगह रखें जहाँ रोज़ दिखे।"
  },
  downloadCalendar: { en: "Download 90-Day Calendar", kn: "90 ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್", te: "90 రోజుల క్యాలెండర్ డౌన్‌లోడ్", ta: "90 நாட்களின் நாட்காட்டியைப் பதிவிறக்கு", hi: "90 दिनों का कैलेंडर डाउनलोड करें" },
  downloadMessage: { en: "Download Blessing Letter", kn: "ಆಶೀರ್ವಾದ ಪತ್ರ ಡೌನ್‌ಲೋಡ್", te: "ఆశీర్వాద పత్రం డౌన్‌లోడ్", ta: "ஆசீர்வாதக் கடிதத்தைப் பதிவிறக்கு", hi: "आशीर्वाद पत्र डाउनलोड करें" },
  downloadPrasada: { en: "Download Prasada Card", kn: "ಪ್ರಸಾದ ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್", te: "ప్రసాద కార్డు డౌన్‌లోడ్", ta: "பிரசாத அட்டையைப் பதிவிறக்கு", hi: "प्रसाद कार्ड डाउनलोड करें" },
  preparing: { en: "Preparing...", kn: "ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...", te: "సిద్ధం చేస్తోంది...", ta: "தயாராகிறது...", hi: "तैयार हो रहा है..." },
  calculating: { en: "Calculating your 90 days...", kn: "ನಿಮ್ಮ 90 ದಿನಗಳನ್ನು ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತಿದೆ...", te: "మీ 90 రోజులను లెక్కిస్తోంది...", ta: "உங்கள் 90 நாட்கள் கணக்கிடப்படுகிறது...", hi: "आपके 90 दिनों की गणना हो रही है..." },

  sevaPerformed: { en: "Seva performed", kn: "ಮಾಡಿದ ಸೇವೆ", te: "చేసిన సేవ", ta: "செய்யப்பட்ட சேவை", hi: "की गई सेवा" },
  sevaDate: { en: "Date of seva", kn: "ಸೇವೆಯ ದಿನಾಂಕ", te: "సేవ తేదీ", ta: "சேவை தேதி", hi: "सेवा की तिथि" },
  sevaPlace: { en: "Place", kn: "ಸ್ಥಳ", te: "స్థలం", ta: "இடம்", hi: "स्थान" },
  sevaMarkDone: { en: "Record the seva for the letter", kn: "ಪತ್ರಕ್ಕಾಗಿ ಸೇವೆಯನ್ನು ದಾಖಲಿಸಿ", te: "పత్రం కోసం సేవను నమోదు చేయండి", ta: "கடிதத்திற்காக சேவையைப் பதிவு செய்யுங்கள்", hi: "पत्र के लिए सेवा दर्ज करें" },
  optional: { en: "Optional", kn: "ಐಚ್ಛಿಕ", te: "ఐచ్ఛికం", ta: "விருப்பத்தேர்வு", hi: "वैकल्पिक" },

  shlokaLabel: { en: "Shloka", kn: "ಶ್ಲೋಕ", te: "శ్లోకం", ta: "ஸ்லோகம்", hi: "श्लोक" },
  shlokaMeaning: { en: "Meaning", kn: "ಅರ್ಥ", te: "అర్థం", ta: "பொருள்", hi: "अर्थ" },
  dailyMantra: { en: "Your Daily Mantra", kn: "ನಿಮ್ಮ ನಿತ್ಯ ಮಂತ್ರ", te: "మీ నిత్య మంత్రం", ta: "உங்கள் நித்திய மந்திரம்", hi: "आपका नित्य मंत्र" },
  chantCount: { en: "Chant 11 times after your bath, facing the favourable direction.", kn: "ಸ್ನಾನದ ನಂತರ ಶುಭ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡಿ 11 ಬಾರಿ ಜಪಿಸಿ.", te: "స్నానం తర్వాత శుభ దిక్కుకు అభిముఖంగా 11 సార్లు జపించండి.", ta: "குளித்த பின் நல்ல திசையை நோக்கி 11 முறை ஜபியுங்கள்.", hi: "स्नान के बाद शुभ दिशा की ओर मुख करके 11 बार जप करें।" },

  blessingTitle: { en: "Blessing", kn: "ಆಶೀರ್ವಾದ", te: "ఆశీర్వాదం", ta: "ஆசீர்வாதம்", hi: "आशीर्वाद" },
  needChart: {
    en: "Please create your Janana Patrika first. This page opens once your birth chart is ready.",
    kn: "ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಜನನ ಪತ್ರಿಕೆಯನ್ನು ರಚಿಸಿ. ಜಾತಕ ಸಿದ್ಧವಾದ ನಂತರ ಈ ಪುಟ ತೆರೆಯುತ್ತದೆ.",
    te: "దయచేసి ముందుగా మీ జనన పత్రికను రూపొందించండి. జాతకం సిద్ధమైన తర్వాత ఈ పేజీ తెరుచుకుంటుంది.",
    ta: "தயவுசெய்து முதலில் உங்கள் ஜனன பத்திரிகையை உருவாக்குங்கள். ஜாதகம் தயாரான பின் இந்தப் பக்கம் திறக்கும்.",
    hi: "कृपया पहले अपनी जनन पत्रिका बनाएँ। कुंडली तैयार होने पर यह पृष्ठ खुलेगा।"
  },
  goToChart: { en: "Go to Birth Chart", kn: "ಜಾತಕಕ್ಕೆ ಹೋಗಿ", te: "జాతకానికి వెళ్లండి", ta: "ஜாதகத்திற்குச் செல்", hi: "कुंडली पर जाएँ" },

  disclaimer: {
    en: "This calendar is traditional guidance for peace of mind. It is not a promise of results, and it is not medical, legal or financial advice.",
    kn: "ಈ ಕ್ಯಾಲೆಂಡರ್ ಮನಃಶಾಂತಿಗಾಗಿ ನೀಡಲಾದ ಸಾಂಪ್ರದಾಯಿಕ ಮಾರ್ಗದರ್ಶನ. ಇದು ಫಲಿತಾಂಶದ ಭರವಸೆ ಅಲ್ಲ; ವೈದ್ಯಕೀಯ, ಕಾನೂನು ಅಥವಾ ಹಣಕಾಸಿನ ಸಲಹೆಯೂ ಅಲ್ಲ.",
    te: "ఈ క్యాలెండర్ మనశ్శాంతి కోసం ఇచ్చిన సంప్రదాయ మార్గదర్శనం. ఇది ఫలితాల హామీ కాదు; వైద్య, న్యాయ లేదా ఆర్థిక సలహా కూడా కాదు.",
    ta: "இந்த நாட்காட்டி மனஅமைதிக்காக வழங்கப்பட்ட பாரம்பரிய வழிகாட்டுதல். இது முடிவுகளுக்கான உறுதிமொழி அல்ல; மருத்துவ, சட்ட அல்லது நிதி ஆலோசனையும் அல்ல.",
    hi: "यह कैलेंडर मन की शांति के लिए दिया गया पारंपरिक मार्गदर्शन है। यह परिणाम की गारंटी नहीं है, न ही चिकित्सा, कानूनी या वित्तीय सलाह है।"
  },

  preparedBy: { en: "Prepared at Gokarna Kshetra", kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ", te: "గోకర్ణ క్షేత్రంలో సిద్ధం చేయబడింది", ta: "கோகர்ண க்ஷேத்திரத்தில் தயாரிக்கப்பட்டது", hi: "गोकर्ण क्षेत्र में तैयार किया गया" },
  calendarTitle: { en: "90-Day Personal Calendar", kn: "90 ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್", te: "90 రోజుల వ్యక్తిగత క్యాలెండర్", ta: "90 நாட்களின் தனிப்பட்ட நாட்காட்டி", hi: "90 दिनों का व्यक्तिगत कैलेंडर" },
  letterTitle: { en: "Letter of Blessing", kn: "ಆಶೀರ್ವಾದ ಪತ್ರ", te: "ఆశీర్వాద పత్రం", ta: "ஆசீர்வாதக் கடிதம்", hi: "आशीर्वाद पत्र" },
  prasadaCardTitle: { en: "Prasada Card", kn: "ಪ್ರಸಾದ ಕಾರ್ಡ್", te: "ప్రసాద కార్డు", ta: "பிரசாத அட்டை", hi: "प्रसाद कार्ड" },

  syncCalendarTitle: { en: "Sync Calendar to Phone & QR Code", kn: "ಫೋನ್ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು QR ಕೋಡ್ ಸಿಂಕ್", te: "ఫోన్ క్యాలెండర్ మరియు QR ಕೋಡ್ ಸಿಂಕ್", ta: "போன் காலண்டர் மற்றும் QR குறியீடு ஒத்திசைவு", hi: "फोन कैलेंडर और QR कोड सिंक" },
  syncCalendarSub: {
    en: "Scan QR code or click to import 90-day daily guidance & reminders into Google Calendar or Apple Calendar with daily notifications.",
    kn: "ದೈನಂದಿನ ಅಧಿಸೂಚನೆಗಳೊಂದಿಗೆ Google Calendar ಅಥವಾ Apple Calendar ಗೆ 90 ದಿನಗಳ ದೈನಂದಿನ ಮಾರ್ಗದರ್ಶನವನ್ನು ಸೇರಿಸಲು QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    te: "రోజువారీ నోటిఫికేషన్‌లతో Google Calendar లేదా Apple Calendar కి 90 రోజుల మార్గదర్శకాలను జోడించడానికి QR కోడ్‌ను స్కాన్ చేయండి లేదా క్లిక్ చేయండి.",
    ta: "தினசரி அறிவிப்புகளுடன் Google Calendar அல்லது Apple Calendar இல் 90 நாட்களின் வழிகாட்டுதல்களைச் சேர்க்க QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது கிளிக் செய்யவும்.",
    hi: "दैनिक सूचनाओं के साथ Google Calendar या Apple Calendar में 6 महीने के दैनिक मार्गदर्शन और मंत्रों को जोड़ने के लिए QR कोड स्कैन करें या क्लिक करें。"
  },
  panditNameLabel: { en: "Pandit / Priest Name", kn: "ಪಂಡಿತ್ / ಅರ್ಚಕರ ಹೆಸರು", te: "ಪಂಡಿಟ್ / ಅರ್ಚಕುಲ ಪೇರು", ta: "பண்டிட் / அர்ச்சகர் பெயர்", hi: "पंडित / पुजारी का नाम" },
  notificationTimeLabel: { en: "Daily Notification Time", kn: "ದೈನಂದಿನ ಅಧಿಸೂಚನೆ ಸಮಯ", te: "ದಿನಚರ್ಯ ನೋಟಿಫಿಕೇಷನ್ ಸಮಯಂ", ta: "தினசரி அறிவிப்பு நேரம்", hi: "दैनिक सूचना समय" },
  scanQrTitle: { en: "Scan QR Code on Mobile Phone", kn: "ಮೊಬೈಲ್‌ನಲ್ಲಿ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", te: "ಮೊಬೈಲ್‌ನಲ್ಲಿ QR ಕೋಡ್ ಸ್ಕಾನ್ ಚೇಯಂಡಿ", ta: "மொபைலில் QR குறியீட்டை ஸ்கேன் செய்யுங்கள்", hi: "मोबाइल पर QR कोड स्कैन करें" },
  scanQrDesc: {
    en: "Use your iPhone or Android camera to instantly subscribe & import 90 days of daily Panchanga reminders into your calendar.",
    kn: "ನಿಮ್ಮ iPhone ಅಥವಾ Android ಕ್ಯಾಮೆರಾ ಬಳಸಿ 90 ದಿನಗಳ ದೈನಂದಿನ ಪಂಚಾಂಗ ನೆನಪೋಲೆಗಳನ್ನು ತಕ್ಷಣ ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ.",
    te: "మీ iPhone లేదా Android కెమెరాను ఉపయోగించి 90 రోజుల దినచర్య పంచాంగ జ్ఞాపికలను వెంటనే మీ క్యాలెండర్‌కు జోడించండి.",
    ta: "உங்கள் iPhone அல்லது Android கேமராவைப் பயன்படுத்தி 90 நாட்களின் பஞ்சாங்க நினைவூட்டல்களை உங்கள் நாட்காட்டியில் சேர்க்கவும்.",
    hi: "अपने iPhone या Android कैमरे का उपयोग करके 90 दिनों के दैनिक पंचांग रिमाइंडर्स को तुरंत अपने कैलेंडर में जोड़ें।"
  },
  qrPrintHeader: {
    en: "Baggona Panchanga Astrology for next 90 days",
    kn: "ಮುಂದಿನ 90 ದಿನಗಳ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ",
    te: "తదుపరి 90 రోజులకు బగ్గోణ పంచాంగ జ్యోతిష్యం",
    ta: "அடுத்த 90 நாட்களுக்கான பக்கோனா பஞ்சாங்க ஜோதிடம்",
    hi: "अगले 90 दिनों के लिए बग्गोना पंचांग ज्योतिष"
  },
  qrPrintStep1: {
    en: "1. Open your phone camera",
    kn: "೧. ನಿಮ್ಮ ಫೋನಿನ ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ",
    te: "౧. మీ ఫోన్ కెమెరాను తెరవండి",
    ta: "௧. உங்கள் ஃபோன் கேமராவைத் திறக்கவும்",
    hi: "१. अपने फोन का कैमरा खोलें"
  },
  qrPrintStep2: {
    en: "2. Point it at the QR code above",
    kn: "೨. ಮೇಲಿನ ಕ್ಯೂಆರ್ ಕೋಡ್ ಕಡೆಗೆ ತೋರಿಸಿ",
    te: "౨. పై ఉన్న క్యూఆర్ కోడ్ వైపు చూపించండి",
    ta: "௨. மேலே உள்ள QR குறியீட்டைக் காட்டுங்கள்",
    hi: "२. इसे ऊपर दिए गए क्यूआर कोड की ओर करें"
  },
  qrPrintStep3: {
    en: "3. Tap the link that appears on your screen",
    kn: "೩. ಸ್ಕ್ರೀನ್ ಮೇಲೆ ಕಾಣುವ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ",
    te: "౩. స్క్రీన్‌పై కనిపించే లింక్‌ను నొక్కండి",
    ta: "௩. திரையில் தோன்றும் இணைப்பைத் தட்டவும்",
    hi: "३. स्क्रीन पर दिखने वाले लिंक को दबाएं"
  },
  qrPrintStep4: {
    en: "4. Click 'Add' to save the calendar",
    kn: "೪. ಕ್ಯಾಲೆಂಡರ್ ಸೇರಿಸಲು 'Add' ಅಥವಾ 'ಸೇರಿಸು' ಒತ್ತಿರಿ",
    te: "౪. క్యాలెండర్‌ను జోడించడానికి 'Add' నొక్కండి",
    ta: "௪. காலெண்டரைச் சேர்க்க 'Add' ஐ அழுத்தவும்",
    hi: "४. कैलेंडर जोड़ने के लिए 'Add' पर क्लिक करें"
  },
  addToGoogleCalendar: { en: "Add to Google Calendar", kn: "Google Calendar ಗೆ ಸೇರಿಸಿ", te: "Google Calendar ಕು ಜೋಡಿಂದಿ", ta: "Google Calendar இல் சேர்க்கவும்", hi: "Google Calendar में जोड़ें" },
  downloadIcsFile: { en: "Download .ics Calendar File", kn: ".ics ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್", te: ".ics ಕ್ಯಾಲಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್", ta: ".ics காலண்டர் கோப்பைப் பதிவிறக்கு", hi: ".ics कैलेंडर फ़ाइल डाउनलोड करें" },
  namaskaraHeader: { en: "Namaskara from", kn: "ಅವರಿಂದ ನಮಸ್ಕಾರಗಳು", te: "గారి నుండి నమస్కారాలు", ta: "அவர்களின் அன்பு வணக்கங்கள்", hi: "की ओर से सादर प्रणाम" },
  micListening: { en: "Listening...", kn: "ಆಲಿಸಲಾಗುತ್ತಿದೆ...", te: "ವಿಂಟೋಂದಿ...", ta: "கேட்கிறது...", hi: "सुन रहा है..." },
  micSpeak: { en: "Click mic to speak priest name", kn: "ಅರ್ಚಕರ ಹೆಸರು ಹೇಳಲು ಮೈಕ್ ಒತ್ತಿರಿ", te: "ಅರ್ಚಕುನಿ ಪೇರು ಚೆಪ್ಪಡಾನಿಕಿ ಮೈಕ್ ನೊಕ್ಕಂಡಿ", ta: "அர்ச்சகர் பெயரைச் சொல்ல மைக் அழுத்தவும்", hi: "पुजारी का नाम बोलने के लिए माइक दबाएँ" },
  priestNameDefault: {
    en: "Pandit Chaitanya (Chief Archaka)",
    kn: "ಪಂಡಿತ್ ಚೈತನ್ಯ (ಪ್ರಧಾನ ಅರ್ಚಕರು)",
    te: "పండిట్ చైతన్య (ప్రధాన అర్చకులు)",
    ta: "பண்டிட் சைதன்யா (தலைமை அர்ச்சகர்)",
    hi: "पंडित चैतन्य (मुख्य अर्चक)"
  },
  priestTitleHeader: {
    en: "Chief Archaka — Baggona Gokarna Kshetra",
    kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು — ಬಗ್ಗೋಣ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
    te: "ప్రధాన అర్చకులు — బగ్గోణ గోకర్ణ క్షేత్రం",
    ta: "தலைமை அர்ச்சகர் — பக்கோணா கோகர்ண க்ஷேத்திரம்",
    hi: "मुख्य अर्चक — बग्गोणा गोकर्ण क्षेत्र"
  },
  infographicBlueprint: {
    en: "Daily Astrological Infographic Blueprint",
    kn: "ದೈನಂದಿನ ಜ್ಯೋತಿಷ್ಯ ಇನ್ಫೋಗ್ರಾಫಿಕ್ ಬ್ಲೂಪ್ರಿಂಟ್",
    te: "దినచర్య జ్యోతిష్య ఇన్ఫోగ్రాఫిక్ బ్లూప్రింట్",
    ta: "தினசரி ஜோதிட இன்போகிராபிக் வரைபடம்",
    hi: "दैनिक ज्योतिष इन्फोग्राफिक रूपरेखा"
  },
  energyLevelTitle: {
    en: "Daily Energy Meter & Vibe",
    kn: "ದೈನಂದಿನ ಶಕ್ತಿ ಮೀಟರ್ ಮತ್ತು ವೈಬ್",
    te: "దినచర్య శక్తి మీటర్ మరియు వైబ్",
    ta: "தினசரி ஆற்றல் மீட்டர் மற்றும் அதிர்வு",
    hi: "दैनिक ऊर्जा मीटर और भाव"
  },
  kundaliHarmonyTitle: {
    en: "Janana Kundali & Gochara Harmony",
    kn: "ಜನನ ಜಾತಕ & ಗೋಚಾರ ಸಾಮರಸ್ಯ",
    te: "జనన జాతకం & గోచార సామరస్యం",
    ta: "ஜனன ஜாதகம் & கோசார இணக்கம்",
    hi: "जन्म कुंडली और गोचर सामंजस्य"
  },
  kaalaTimingsTitle: {
    en: "Daily Kaala Timings (Kolkata IST)",
    kn: "ದೈನಂದಿನ ಕಾಲ ಸಮಯಗಳು (Kolkata IST)",
    te: "దినచర్య కాల సమయాలు (Kolkata IST)",
    ta: "தினசரி கால நேரங்கள் (Kolkata IST)",
    hi: "दैनिक काल समय (Kolkata IST)"
  },
  abhijitMuhurthaLabel: {
    en: "Abhijit Muhurtha (Golden Window)",
    kn: "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ (ಶುಭ ಕಾಲಾವಧಿ)",
    te: "అభిజిత్ ముహూర్తం (శుభ కాలం)",
    ta: "அபிஜித் முகூர்த்தம் (சுப காலம்)",
    hi: "अभिजित मुहूर्त (स्वर्ण काल)"
  },
  archakaSansthaObligations: {
    en: "Chief Archaka Sanstha & Daily Obligations",
    kn: "ಪ್ರಧಾನ ಅರ್ಚಕ ಸಂಸ್ಥೆ & ದೈನಂದಿನ ಕರ್ತವ್ಯ",
    te: "ప్రధాన అర్చక సంస్థ & దినచర్య కర్తవ్యం",
    ta: "தலைமை அர்ச்சகர் சம்ஸ்தானம் & தினசரி கடமைகள்",
    hi: "मुख्य अर्चक संस्था और दैनिक कर्तव्य"
  },
  singleLetterFocusLabel: {
    en: "Single-Letter Focus Tag",
    kn: "ಏಕ-ಅಕ್ಷರ ಗಮನ ಟ್ಯಾಗ್",
    te: "ఏక-అక్షర ఫోకస్ ట్యాగ్",
    ta: "ஒற்றை எழுத்து கவனம் குறிச்சொல்",
    hi: "एक-अक्षर फोकस टैग"
  },

};

/** Shorthand for interface strings. */
export const tt = (key: keyof typeof T | string, lang: string): string => {
  const phrase = T[key as string];
  return phrase ? pick(phrase, lang) : String(key);
};

/* ------------------------------------------------------------------ *
 * Shlokas — always Sanskrit (Devanagari). Only the meaning is translated.
 * ------------------------------------------------------------------ */

export type SevaShloka = {
  /** Sanskrit verse in Devanagari — never translated or transliterated. */
  sanskrit: string;
  meaning: L5;
};

export const SHLOKA_SHIVA: SevaShloka = {
  sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥",
  meaning: {
    en: "We worship the three-eyed Lord who nourishes all beings. May he free us from the bondage of death, as a ripe cucumber falls from its stem, and grant us immortality.",
    kn: "ಎಲ್ಲ ಜೀವಿಗಳನ್ನು ಪೋಷಿಸುವ ಮುಕ್ಕಣ್ಣನನ್ನು ನಾವು ಪೂಜಿಸುತ್ತೇವೆ. ಹಣ್ಣಾದ ಸೌತೆ ತೊಟ್ಟಿನಿಂದ ಬೇರ್ಪಡುವಂತೆ, ಅವನು ನಮ್ಮನ್ನು ಮೃತ್ಯುವಿನ ಬಂಧನದಿಂದ ಬಿಡಿಸಿ ಅಮೃತತ್ವ ನೀಡಲಿ.",
    te: "సమస్త జీవులను పోషించే ముక్కంటిని మేము పూజిస్తాము. పండిన దోసకాయ తీగ నుండి వేరుపడినట్లు, ఆయన మమ్మల్ని మృత్యు బంధం నుండి విడిపించి అమృతత్వాన్ని ప్రసాదించుగాక.",
    ta: "அனைத்து உயிர்களையும் காக்கும் முக்கண்ணனை நாம் வழிபடுகிறோம். பழுத்த வெள்ளரி காம்பிலிருந்து விடுபடுவது போல், அவர் நம்மை மரண பந்தத்திலிருந்து விடுவித்து அமுதத்தை அருளட்டும்.",
    hi: "हम तीन नेत्रों वाले उस भगवान की उपासना करते हैं जो सब प्राणियों का पोषण करते हैं। जैसे पका खीरा डंठल से अलग हो जाता है, वैसे ही वे हमें मृत्यु के बंधन से मुक्त कर अमरत्व प्रदान करें।"
  }
};

export const SHLOKA_PITRU: SevaShloka = {
  sanskrit: "ॐ पितृभ्यः नमः। नमो वः पितरो रसाय\nनमो वः पितरः शोषाय नमो वः पितरो जीवाय॥",
  meaning: {
    en: "Salutations to the ancestors. We bow to you who give us essence, endurance and life itself.",
    kn: "ಪಿತೃಗಳಿಗೆ ನಮಸ್ಕಾರ. ನಮಗೆ ಸಾರ, ಸಹನೆ ಮತ್ತು ಜೀವವನ್ನೇ ಕೊಟ್ಟ ನಿಮಗೆ ನಾವು ನಮಿಸುತ್ತೇವೆ.",
    te: "పితరులకు నమస్కారం. మాకు సారాన్ని, సహనాన్ని, జీవాన్ని ఇచ్చిన మీకు మేము నమస్కరిస్తాము.",
    ta: "முன்னோர்களுக்கு வணக்கம். எமக்கு சாரத்தையும் சகிப்பையும் உயிரையும் அளித்த உங்களை நாம் வணங்குகிறோம்.",
    hi: "पितरों को नमस्कार। हमें सार, सहनशीलता और जीवन देने वाले आपको हम प्रणाम करते हैं।"
  }
};

export const SHLOKA_GANAPATI: SevaShloka = {
  sanskrit: "ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
  meaning: {
    en: "O Lord with the curved trunk and mighty form, radiant as a million suns, please remove all obstacles from every work I undertake, always.",
    kn: "ವಕ್ರ ಸೊಂಡಿಲಿನ, ಮಹಾಕಾಯದ, ಕೋಟಿ ಸೂರ್ಯರ ಕಾಂತಿಯುಳ್ಳ ದೇವನೇ, ನನ್ನ ಎಲ್ಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಸದಾ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸು.",
    te: "వక్రమైన తొండం, మహాకాయం, కోటి సూర్యుల కాంతి గల దేవా, నా అన్ని కార్యాలలో ఎల్లప్పుడూ విఘ్నాలను తొలగించు.",
    ta: "வளைந்த துதிக்கையும் பெரிய வடிவமும் கோடி சூரியனின் ஒளியும் கொண்ட தேவனே, என் அனைத்து செயல்களிலும் எப்போதும் தடைகளை நீக்குவாயாக.",
    hi: "वक्र सूँड़ और विशाल काया वाले, करोड़ों सूर्यों के समान तेजस्वी देव, मेरे सभी कार्यों में सदा विघ्नों को दूर करें।"
  }
};

export const SHLOKA_NAVAGRAHA: SevaShloka = {
  sanskrit: "ॐ ब्रह्मा मुरारिस्त्रिपुरान्तकारी\nभानुः शशी भूमिसुतो बुधश्च।\nगुरुश्च शुक्रः शनिराहुकेतवः\nकुर्वन्तु सर्वे मम सुप्रभातम्॥",
  meaning: {
    en: "May Brahma, Vishnu and Shiva, and the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu — may all of them make my day auspicious.",
    kn: "ಬ್ರಹ್ಮ, ವಿಷ್ಣು, ಶಿವ ಹಾಗೂ ಸೂರ್ಯ, ಚಂದ್ರ, ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ, ರಾಹು, ಕೇತು — ಇವರೆಲ್ಲರೂ ನನ್ನ ದಿನವನ್ನು ಶುಭಗೊಳಿಸಲಿ.",
    te: "బ్రహ్మ, విష్ణువు, శివుడు మరియు సూర్య, చంద్ర, కుజ, బుధ, గురు, శుక్ర, శని, రాహు, కేతువులు — వీరందరూ నా దినాన్ని శుభప్రదం చేయుగాక.",
    ta: "பிரம்மா, விஷ்ணு, சிவன் மற்றும் சூரியன், சந்திரன், செவ்வாய், புதன், குரு, சுக்கிரன், சனி, ராகு, கேது — இவர்கள் அனைவரும் என் நாளை மங்கலமாக்கட்டும்.",
    hi: "ब्रह्मा, विष्णु और शिव तथा सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु और केतु — ये सब मेरे दिन को शुभ बनाएँ।"
  }
};

export const SHLOKA_SHANTI: SevaShloka = {
  sanskrit: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥",
  meaning: {
    en: "May all be happy, may all be free from illness, may all see what is good, and may no one suffer.",
    kn: "ಎಲ್ಲರೂ ಸುಖಿಯಾಗಿರಲಿ, ಎಲ್ಲರೂ ರೋಗರಹಿತರಾಗಿರಲಿ, ಎಲ್ಲರೂ ಒಳಿತನ್ನೇ ಕಾಣಲಿ, ಯಾರೂ ದುಃಖ ಪಡದಿರಲಿ.",
    te: "అందరూ సుఖంగా ఉండుగాక, అందరూ రోగరహితులు కావుగాక, అందరూ మంచినే చూడుగాక, ఎవరూ దుఃఖపడకుండుగాక.",
    ta: "அனைவரும் மகிழ்ச்சியாக இருக்கட்டும், அனைவரும் நோயற்று இருக்கட்டும், அனைவரும் நல்லதையே காணட்டும், யாரும் துன்பப்படாதிருக்கட்டும்.",
    hi: "सब सुखी हों, सब निरोग हों, सब कल्याण देखें, कोई भी दुःख का भागी न हो।"
  }
};

/** Graha-wise Sanskrit beeja mantras for the day lord. Never translated. */
export const GRAHA_MANTRA_SANSKRIT: Record<GrahaKey, string> = {
  Sun: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
  Moon: "ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः",
  Mars: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
  Mercury: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
  Jupiter: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
  Venus: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
  Saturn: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
  Rahu: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",
  Ketu: "ॐ स्रां स्रीं स्रौं सः केतवे नमः"
};

/** Format priest name into native script for the active language. */
export const formatPanditName = (name?: string, lang: string = "en"): string => {
  if (!name) return "";
  const trimmed = name.trim();
  const base = (lang || "en").split("-")[0];
  if (
    trimmed.toLowerCase().includes("chaitanya") ||
    trimmed.includes("ಚೈತನ್ಯ") ||
    trimmed.includes("चैतन्य") ||
    trimmed.includes("చైతన్య") ||
    trimmed.includes("சைதன்ய")
  ) {
    const map: Record<string, string> = {
      kn: "ಚೈತನ್ಯ ಪಂಡಿತ",
      hi: "चैतन्य पंडित",
      te: "చైతన్య పండిత్",
      ta: "சைதன்ய பண்டிதர்",
      en: "Chaitanya Pandit"
    };
    return map[base] || map.en;
  }
  return trimmed;
};

/* ------------------------------------------------------------------ *
 * Blessing letter body — assembled from plain, simple sentences
 * ------------------------------------------------------------------ */

export const LETTER_L5: Record<string, L5> = {
  salutation: { en: "Dear", kn: "ಪ್ರಿಯ", te: "ప్రియమైన", ta: "அன்புள்ள", hi: "प्रिय" },
  opening: {
    en: "With the divine blessings of Lord Shri Mahabaleshwara of Gokarna, the sacred seva noted below has been reverently offered in your name and in the name of your family.",
    kn: "ಗೋಕರ್ಣದ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ದಿವ್ಯ ಅನುಗ್ರಹದಿಂದ, ಕೆಳಗೆ ನಮೂದಿಸಿದ ಪವಿತ್ರ ಸೇವೆಯನ್ನು ನಿಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಹೆಸರಿನಲ್ಲಿ ಅತ್ಯಂತ ಭಕ್ತಿಯಿಂದ ಸಮರ್ಪಿಸಲಾಗಿದೆ.",
    te: "గోకర్ణ శ్రీ మహాబలేశ్వరుని దివ్య అనుగ్రహంతో, క్రింద పేర్కొన్న పవిత్ర సేవను మీ పేరుతో మరియు మీ కుటుంబ పేరుతో భక్తితో సమర్పించడమైనది.",
    ta: "கோகர்ண ஸ்ரீ மகாபலேஸ்வரரின் திவ்ய அருளால், கீழே குறிப்பிட்ட புனித சேவை உங்கள் பெயரிலும் உங்கள் குடும்பத்தின் பெயரிலும் சமர்ப்பிக்கப்பட்டுள்ளது.",
    hi: "गोकर्ण के श्री महाबलेश्वर की दिव्य कृपा से, नीचे लिखी पवित्र सेवा आपके नाम और आपके परिवार के नाम से समर्पित की गई है।"
  },
  ashirvachanaHeading: {
    en: "Priest's Blessing & Spiritual Life Guidance",
    kn: "ಪುರೋಹಿತರ ಆಶೀರ್ವಚನ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಜೀವನ ಮಾರ್ಗದರ್ಶನ",
    te: "అర్చకుల ఆశీర్వచనం మరియు ఆధ్యాత్మిక జీవిత మార్గదర్శనం",
    ta: "அர்ச்சகரின் ஆசீர்வசனம் மற்றும் ஆன்மீக வாழ்க்கை வழிகாட்டல்",
    hi: "पुरोहित आशीर्वाद एवं आध्यात्मिक जीवन मार्गदर्शन"
  },
  priestBlessingPrefix: {
    en: "Under the divine guidance of Archaka",
    kn: "ಅರ್ಚಕ",
    te: "అర్చక",
    ta: "அர்ச்சகர்",
    hi: "अर्चक"
  },
  priestBlessingBody: {
    en: "Your sacred pilgrimage to Gokarna Kshetra and the reverent offering of Sankalpa and Mangala Seva at the holy feet of Lord Shri Mahabaleshwara Atmalinga has been completed with utter devotion. The divine grace of Lord Shiva shall continuously shield your family, granting deep mental tranquility, spiritual resilience, and dissolving long-held afflictions.\n\nThrough the cosmic fruits of this sacred seva, all your forthcoming endeavors, health goals, and family aspirations will meet with grand success and prosperity. May your home be enriched with peace, harmony, divine protection, and enduring abundance.",
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರಕ್ಕೆ ತಮ್ಮ ಪವಿತ್ರ ಆಗಮನವಾಗಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೈಗೊಂಡ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಂಗಲ ಸೇವೆಯು ಅತ್ಯಂತ ಭಕ್ತಿಯಿಂದ ಸಂಪನ್ನಗೊಂಡಿದೆ. ಪರಮಶಿವನ ದಿವ್ಯ ಕಾರುಣ್ಯವು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಸಕಲ ಕೌಟುಂಬಿಕ ಸದಸ್ಯರ ಮೇಲೆ ಸದಾ ಇರಲಿದ್ದು, ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ, ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ಬಹುಕಾಲದಿಂದ ಅನುಭವಿಸುತ್ತಿದ್ದ ಮಾನಸಿಕ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಭಾರಗಳು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗಲಿವೆ.\n\nಈ ದಿವ್ಯ ಸೇವೆಯ ಪುಣ್ಯ ಫಲವಾಗಿ ನಿಮ್ಮ ಸಮಸ್ತ ಶ್ರಮ ಹಾಗೂ ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಯಶಸ್ಸು ದೊರೆಯಲಿದ್ದು, ಅಷ್ಟೈಶ್ವರ್ಯ, ಸುಖ-ಶಾಂತಿ ಹಾಗೂ ಸಕಲ ಮಂಗಲ ಯೋಗಗಳು ಶೀಘ್ರದಲ್ಲಿಯೇ ಸಿದ್ಧಿಸಲಿವೆ. ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಸದಾ ಧರ್ಮ, ಭಕ್ತಿ ಹಾಗೂ ಪ್ರೀತಿ ನೆಲೆಸಲೆಂದು ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯಲ್ಲಿ ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.",
    te: "గోకర్ణ క్షేత్రంలో శ్రీ మహాబలేశ్వర ఆత్మలింగ సన్నిధిలో మీరు నిర్వహించిన పవిత్ర సంకల్పం మరియు మంగళ సేవ మిక్కిలి భక్తిశ్రద్ధలతో పూర్తయినది. పరమశివుని దివ్య అనుగ్రహం మీపై మరియు మీ కుటుంబ సభ్యులపై ఎల్లవేళలా ఉండి, మానసిక ప్రశాంతతను, ఆత్మస్థైర్యాన్ని మరియు దీర్ఘకాలిక శ్రమల నుండి నివారణను కలిగిస్తుంది.\n\nఈ దివ్య సేవ పుణ్యఫలంగా మీ ప్రతి ప్రయత్నంలోనూ, నూతన కార్యాలలోనూ సంపూర్ణ విజయం లభిస్తుంది. మీ గృహంలో నిత్య సంతోషం, ఐశ్వర్యం మరియు మంగళకరమైన యోగాలు ప్రాప్తిస్తాయని శ్రీ మహాబలేశ్వర స్వామివారిని ప్రార్థిస్తున్నాము.",
    ta: "கோகர்ண க்ஷேத்திரத்தில் ஸ்ரீ மகாபலேஸ்வர ஆத்மலிங்க சன்னதியில் நீங்கள் செய்த புனித சங்கல்பமும் மங்கள சேவையும் மிக பக்தியுடன் நிறைவுற்றன. பரமசிவனின் திவ்ய அருள் உங்களுக்கும் உங்கள் குடும்பத்திற்கும் எப்போதும் இருந்து, மன அமைதியையும் நீண்டகால சிரமங்களிலிருந்து விடுதலையையும் தரும்.\n\nஇந்த திவ்ய சேவையின் புண்ணிய பலனால் உங்கள் முயற்சிகள் அனைத்திலும் பெரும் வெற்றி கிட்டும். உங்கள் இல்லத்தில் மகிழ்ச்சியும், செல்வமும், மங்களமும் பெருக ஸ்ரீ மகாபலேஸ்வர சுவாமியைப் பிரார்த்திக்கிறோம்.",
    hi: "गोकर्ण क्षेत्र में आपकी पवित्र उपस्थिति तथा भगवान श्री महाबलेश्वर आत्मलिंग के पावन चरणों में संपन्न संकल्प एवं मंगल सेवा अत्यंत निष्ठापूर्वक पूर्ण हुई है। भगवान शिव की दिव्य अनुकंपा आपके और आपके संपूर्ण परिवार पर सदा बनी रहेगी, जिससे मन को शांति, आत्मबल तथा दीर्घकालिक कष्टों से मुक्ति प्राप्त होगी।\n\nइस पावन सेवा के शुभ प्रभाव से आपके सभी प्रयासों और योजनाओं में अपार सफलता मिलेगी तथा परिवार में सुख, समृद्धि और आरोग्य का निरंतर विस्तार होगा। हम भगवान महाबलेश्वर से आपके परिवार के कल्याण और मंगल की प्रार्थना करते हैं।"
  },
  defaultBlessing: {
    en: "Your sacred pilgrimage to Gokarna Kshetra and the reverent offering of Sankalpa and Mangala Seva at the holy feet of Lord Shri Mahabaleshwara Atmalinga has been completed with utter devotion. The divine grace of Lord Shiva shall continuously shield your family, granting deep mental tranquility, spiritual resilience, and dissolving long-held afflictions.\n\nThrough the cosmic fruits of this sacred seva, all your forthcoming endeavors, health goals, and family aspirations will meet with grand success and prosperity. May your home be enriched with peace, harmony, divine protection, and enduring abundance.",
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರಕ್ಕೆ ತಮ್ಮ ಪವಿತ್ರ ಆಗಮನವಾಗಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೈಗೊಂಡ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಂಗಲ ಸೇವೆಯು ಅತ್ಯಂತ ಭಕ್ತಿಯಿಂದ ಸಂಪನ್ನಗೊಂಡಿದೆ. ಪರಮಶಿವನ ದಿವ್ಯ ಕಾರುಣ್ಯವು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಸಕಲ ಕೌಟುಂಬಿಕ ಸದಸ್ಯರ ಮೇಲೆ ಸದಾ ಇರಲಿದ್ದು, ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ, ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ಬಹುಕಾಲದಿಂದ ಅನುಭವಿಸುತ್ತಿದ್ದ ಮಾನಸಿಕ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಭಾರಗಳು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗಲಿವೆ.\n\nಈ ದಿವ್ಯ ಸೇವೆಯ ಪುಣ್ಯ ಫಲವಾಗಿ ನಿಮ್ಮ ಸಮಸ್ತ ಶ್ರಮ ಹಾಗೂ ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಯಶಸ್ಸು ದೊರೆಯಲಿದ್ದು, ಅಷ್ಟೈಶ್ವರ್ಯ, ಸುಖ-ಶಾಂತಿ ಹಾಗೂ ಸಕಲ ಮಂಗಲ ಯೋಗಗಳು ಶೀಘ್ರದಲ್ಲಿಯೇ ಸಿದ್ಧಿಸಲಿವೆ. ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಸದಾ ಧರ್ಮ, ಭಕ್ತಿ ಹಾಗೂ ಪ್ರೀತಿ ನೆಲೆಸಲೆಂದು ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯಲ್ಲಿ ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.",
    te: "గోకర్ణ క్షేత్రంలో శ్రీ మహాబలేశ్వర ఆత్మలింగ సన్నిధిలో మీరు నిర్వహించిన పవిత్ర సంకల్పం మరియు మంగళ సేవ మిక్కిలి భక్తిశ్రద్ధలతో పూర్తయినది. పరమశివుని దివ్య అనుగ్రహం మీపై మరియు మీ కుటుంబ సభ్యులపై ఎల్లవేళలా ఉండి, మానసిక ప్రశాంతతను, ఆత్మస్థైర్యాన్ని మరియు దీర్ఘకాలిక శ్రమల నుండి నివారణను కలిగిస్తుంది.\n\nఈ దివ్య సేవ పుణ్యఫలంగా మీ ప్రతి ప్రయత్నంలోనూ, నూతన కార్యాలలోనూ సంపూర్ణ విజయం లభిస్తుంది. మీ గృహంలో నిత్య సంతోషం, ఐశ్వర్యం మరియు మంగళకరమైన యోగాలు ప్రాప్తిస్తాయని శ్రీ మహాబలేశ్వర స్వామివారిని ప్రార్థిస్తున్నాము.",
    ta: "கோகர்ண க்ஷேத்திரத்தில் ஸ்ரீ மகாபலேஸ்வர ஆத்மலிங்க சன்னதியில் நீங்கள் செய்த புனித சங்கல்பமும் மங்கள சேவையும் மிக பக்தியுடன் நிறைவுற்றன. பரமசிவனின் திவ்ய அருள் உங்களுக்கும் உங்கள் குடும்பத்திற்கும் எப்போதும் இருந்து, மன அமைதியையும் நீண்டகால சிரமங்களிலிருந்து விடுதலையையும் தரும்.\n\nஇந்த திவ்ய சேவையின் புண்ணிய பலனால் உங்கள் முயற்சிகள் அனைத்திலும் பெரும் வெற்றி கிட்டும். உங்கள் இல்லத்தில் மகிழ்ச்சியும், செல்வமும், மங்களமும் பெருக ஸ்ரீ மகாபலேஸ்வர சுவாமியைப் பிரார்த்திக்கிறோம்.",
    hi: "गोकर्ण क्षेत्र में आपकी पवित्र उपस्थिति तथा भगवान श्री महाबलेश्वर आत्मलिंग के पावन चरणों में संपन्न संकल्प एवं मंगल सेवा अत्यंत निष्ठापूर्वक पूर्ण हुई है। भगवान शिव की दिव्य अनुकंपा आपके और आपके संपूर्ण परिवार पर सदा बनी रहेगी, जिससे मन को शांति, आत्मबल तथा दीर्घकालिक कष्टों से मुक्ति प्राप्त होगी।\n\nइस पावन सेवा के शुभ प्रभाव से आपके सभी प्रयासों और योजनाओं में अपार सफलता मिलेगी तथा परिवार में सुख, समृद्धि और आरोग्य का निरंतर विस्तार होगा। हम भगवान महाबलेश्वर से आपके परिवार के कल्याण और मंगल की प्रार्थना करते हैं।"
  },
  calendarNote: {
    en: "Along with this letter you have received a calendar for the next six months. It is prepared only for you, from your own birth star and birth sign. Keep it where you can see it every morning.",
    kn: "ಈ ಪತ್ರದೊಂದಿಗೆ ಮುಂದಿನ ಆರು ತಿಂಗಳ ಕ್ಯಾಲೆಂಡರ್ ಅನ್ನು ನೀವು ಪಡೆದಿದ್ದೀರಿ. ಇದನ್ನು ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ಜನ್ಮ ರಾಶಿಯಿಂದ ನಿಮಗಾಗಿಯೇ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ ಕಾಣುವ ಸ್ಥಳದಲ್ಲಿ ಇರಿಸಿ.",
    te: "ఈ పత్రంతో పాటు రాబోయే ఆరు నెలల క్యాలెండర్ మీకు అందింది. ఇది మీ జన్మ నక్షత్రం, జన్మ రాశి ఆధారంగా మీ కోసమే సిద్ధం చేయబడింది. ప్రతి ఉదయం కనిపించే చోట ఉంచండి.",
    ta: "இக்கடிதத்துடன் அடுத்த ஆறு மாதங்களுக்கான நாட்காட்டியைப் பெற்றுள்ளீர்கள். இது உங்கள் ஜன்ம நட்சத்திரம் மற்றும் ஜன்ம ராசியிலிருந்து உங்களுக்காகவே தயாரிக்கப்பட்டது. ஒவ்வொரு காலையும் தெரியும் இடத்தில் வையுங்கள்.",
    hi: "इस पत्र के साथ आपको अगले छह महीनों का कैलेंडर मिला है। यह आपके जन्म नक्षत्र और जन्म राशि से केवल आपके लिए तैयार किया गया है। इसे ऐसी जगह रखें जहाँ हर सुबह दिखाई दे।"
  },
  howToRead: {
    en: "Green marks a strong day, amber marks an ordinary day, and grey marks a day for rest and prayer. A small coin sign marks days that suit money matters.",
    kn: "ಹಸಿರು ಬಣ್ಣ ಬಲವಾದ ದಿನವನ್ನು, ಕೇಸರಿ ಸಾಮಾನ್ಯ ದಿನವನ್ನು, ಬೂದು ಬಣ್ಣ ವಿಶ್ರಾಂತಿ ಮತ್ತು ಪ್ರಾರ್ಥನೆಯ ದಿನವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಸಣ್ಣ ನಾಣ್ಯದ ಗುರುತು ಹಣಕಾಸಿನ ಕೆಲಸಕ್ಕೆ ಸೂಕ್ತವಾದ ದಿನಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.",
    te: "ఆకుపచ్చ బలమైన రోజును, నారింజ సాధారణ రోజును, బూడిద రంగు విశ్రాంతి, ప్రార్థన రోజును సూచిస్తుంది. చిన్న నాణెం గుర్తు ఆర్థిక పనులకు అనుకూలమైన రోజులను చూపుతుంది.",
    ta: "பச்சை வலிமையான நாளையும், ஆரஞ்சு சாதாரண நாளையும், சாம்பல் ஓய்வு மற்றும் प्रार्थना நாளையும் குறிக்கிறது. சிறிய நாணயக் குறி பணம் சார்ந்த வேலைக்கு ஏற்ற நாட்களைக் காட்டுகிறது.",
    hi: "हरा रंग मजबूत दिन, नारंगी सामान्य दिन और स्लेटी रंग विश्राम व प्रार्थना का दिन दर्शाता है। छोटा सिक्का चिह्न धन के कामों के लिए उपयुक्त दिन बताता है।"
  },
  closing: {
    en: "May the Atmalinga of Gokarna protect your family, keep your health steady and bring peace to your ancestors.",
    kn: "ಗೋಕರ್ಣದ ಆತ್ಮಾಲಿಂಗವು ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ರಕ್ಷಿಸಲಿ, ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಸ್ಥಿರವಾಗಿ ಇರಿಸಲಿ ಮತ್ತು ನಿಮ್ಮ ಪಿತೃಗಳಿಗೆ ಶಾಂತಿಯನ್ನು ನೀಡಲಿ.",
    te: "గోకర్ణ ఆత్మలింగం మీ కుటుంబాన్ని రక్షించుగాక, మీ ఆరోగ్యాన్ని స్థిరంగా ఉంచుగాక, మీ పితరులకు శాంతిని ప్రసాదించుగాక.",
    ta: "கோகர்ண ஆத்மலிங்கம் உங்கள் குடும்பத்தைக் காக்கட்டும், உங்கள் ஆரோக்கியத்தை நிலைநிறுத்தட்டும், உங்கள் முன்னோர்களுக்கு அமைதி அளிக்கட்டும்.",
    hi: "गोकर्ण का आत्मलिंग आपके परिवार की रक्षा करे, आपके स्वास्थ्य को स्थिर रखे और आपके पितरों को शांति प्रदान करे।"
  },
  signature: { en: "Baggona Panchanga, Gokarna", kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ, ಗೋಕರ್ಣ", te: "బగ్గోణ పంచాంగం, గోకర్ణ", ta: "பக்கோண பஞ்சாங்கம், கோகர்ணம்", hi: "बग्गोण पंचांग, गोकर्ण" },
  namaskaraSubtitle: { en: "With respectful Namaskaram,", kn: "ಇಂತಿ ನಿಮ್ಮ ನಮಸ್ಕಾರಗಳೊಂದಿಗೆ,", te: "ఇట్లు మీ నమస్కారములతో,", ta: "இங்ஙனம் உங்கள் நமస్కாரங்களுடன்,", hi: "इति आपके नमस्कार सहित," }
};
