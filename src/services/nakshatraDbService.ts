/**
 * Authentic Baggona Panchanga 27 Nakshatra & 7 Vara Master Database Service
 *
 * Canonical Baggona / Gokarna Traditional Vedic Nomenclature:
 * - Tishya (ತಿಷ್ಯ) [Rigvedic / Baggona name for Pushya]
 * - Maghe (ಮಘೆ) [Traditional Coastal Panchanga name for Magha]
 * - Hubbe (ಹುಬ್ಬೆ) [Traditional Kannada Panchanga name for Purva Phalguni]
 * - Uttara (ಉತ್ತರ) [Traditional Kannada Panchanga name for Uttara Phalguni]
 * - Varas: Somavara, Mangalavara, Budhavara, Guruvara, Shukravara, Shanivara, Ravivara
 */

import { db, type NakshatraRecord, type VaraRecord } from "../db/indexedDb";

export interface MasterNakshatraData {
  index: number;
  canonicalEn: string;
  nameKn: string;
  nameEn: string;
  nameHi: string;
  nameTe: string;
  nameTa: string;
  nameMl: string;
  deityKn: string;
  deityEn: string;
  rulingPlanet: string;
  aliases: string[];
}

export interface MasterVaraData {
  index: number;
  canonicalEn: string;
  nameKn: string;
  nameEn: string;
  nameHi: string;
  nameTe: string;
  nameTa: string;
  nameMl: string;
  rulingPlanet: string;
  tatva: string;
  aliases: string[];
}

/** Canonical 27 Nakshatras as dictated by user under authentic Baggona tradition */
export const BAGGONA_NAKSHATRAS_MASTER: MasterNakshatraData[] = [
  {
    index: 0,
    canonicalEn: "Ashwini",
    nameKn: "ಅಶ್ವಿನಿ",
    nameEn: "Ashwini",
    nameHi: "अश्विनी",
    nameTe: "అశ్విని",
    nameTa: "அஸ்வினி",
    nameMl: "അശ്വതി",
    deityKn: "ಅಶ್ವಿನಿ ಕುಮಾರರು",
    deityEn: "Ashwini Kumaras",
    rulingPlanet: "Ketu",
    aliases: ["ashwini", "aswini", "ಅಶ್ವಿನಿ"]
  },
  {
    index: 1,
    canonicalEn: "Bharani",
    nameKn: "ಭರಣಿ",
    nameEn: "Bharani",
    nameHi: "भरणी",
    nameTe: "భరణి",
    nameTa: "பரணி",
    nameMl: "ഭരണി",
    deityKn: "ಯಮ ಧರ್ಮರಾಜ",
    deityEn: "Yama",
    rulingPlanet: "Venus",
    aliases: ["bharani", "barani", "ಭರಣಿ"]
  },
  {
    index: 2,
    canonicalEn: "Krittika",
    nameKn: "ಕೃತ್ತಿಕಾ",
    nameEn: "Krittika",
    nameHi: "कृत्तिका",
    nameTe: "కృత్తిక",
    nameTa: "கிருத்திகை",
    nameMl: "കാർത്തിക",
    deityKn: "ಅಗ್ನಿ ದೇವ",
    deityEn: "Agni",
    rulingPlanet: "Sun",
    aliases: ["krittika", "krithika", "kritika", "karthika", "ಕೃತ್ತಿಕಾ", "ಕೃತಿಕಾ"]
  },
  {
    index: 3,
    canonicalEn: "Rohini",
    nameKn: "ರೋಹಿಣಿ",
    nameEn: "Rohini",
    nameHi: "रोहिणी",
    nameTe: "రోహిణి",
    nameTa: "ரோகிணி",
    nameMl: "രോഹിണി",
    deityKn: "ಬ್ರಹ್ಮ ಪ್ರಜಾಪತಿ",
    deityEn: "Brahma",
    rulingPlanet: "Moon",
    aliases: ["rohini", "ರೋಹಿಣಿ"]
  },
  {
    index: 4,
    canonicalEn: "Mrigashira",
    nameKn: "ಮೃಗಶಿರಾ",
    nameEn: "Mrigashira",
    nameHi: "मृगशिरा",
    nameTe: "మృగశిర",
    nameTa: "மிருகசீரிடம்",
    nameMl: "മകയിരം",
    deityKn: "ಚಂದ್ರ / ಸೋಮ",
    deityEn: "Chandra (Soma)",
    rulingPlanet: "Mars",
    aliases: ["mrigashira", "mrigashirsha", "mrugashira", "ಮೃಗಶಿರಾ", "ಮೃಗಶಿರ"]
  },
  {
    index: 5,
    canonicalEn: "Aardra",
    nameKn: "ಆರ್ದ್ರಾ",
    nameEn: "Aardra",
    nameHi: "आर्द्रा",
    nameTe: "ఆరుద్ర",
    nameTa: "திருவாதிரை",
    nameMl: "തിരുവാതിര",
    deityKn: "ರುದ್ರ / ಈಶ್ವರ",
    deityEn: "Rudra",
    rulingPlanet: "Rahu",
    aliases: ["aardra", "ardra", "aaridra", "arudra", "thiruvathira", "ಆರ್ದ್ರಾ", "ಆರಿದ್ರಾ"]
  },
  {
    index: 6,
    canonicalEn: "Punarvasu",
    nameKn: "ಪುನರ್ವಸು",
    nameEn: "Punarvasu",
    nameHi: "पुनर्वसु",
    nameTe: "పునర్వసు",
    nameTa: "புனர்பூசம்",
    nameMl: "പുണർതം",
    deityKn: "ಅದಿತಿ ದೇವಿ",
    deityEn: "Aditi",
    rulingPlanet: "Jupiter",
    aliases: ["punarvasu", "punarpoosam", "punartham", "ಪುನರ್ವಸು"]
  },
  {
    index: 7,
    canonicalEn: "Tishya",
    nameKn: "ತಿಷ್ಯ",
    nameEn: "Tishya",
    nameHi: "तिष्य",
    nameTe: "తిష్య",
    nameTa: "திஷ்யா",
    nameMl: "തിഷ്യ",
    deityKn: "ಬೃಹಸ್ಪತಿ",
    deityEn: "Brihaspati",
    rulingPlanet: "Saturn",
    aliases: ["tishya", "pushya", "pushyami", "poosam", "pooyam", "ತಿಷ್ಯ", "ಪುಷ್ಯ"]
  },
  {
    index: 8,
    canonicalEn: "Aashlesha",
    nameKn: "ಆಶ್ಲೇಷಾ",
    nameEn: "Aashlesha",
    nameHi: "आश्लेषा",
    nameTe: "ఆశ్లేష",
    nameTa: "ஆயில்யம்",
    nameMl: "ആയില്യം",
    deityKn: "ಸರ್ಪ / ನಾಗ ದೇವತೆಗಳು",
    deityEn: "Nagas (Serpent Deities)",
    rulingPlanet: "Mercury",
    aliases: ["aashlesha", "ashlesha", "aslesha", "ayilyam", "ಆಶ್ಲೇಷಾ", "ಆಶ್ಲೇಷ"]
  },
  {
    index: 9,
    canonicalEn: "Maghe",
    nameKn: "ಮಘೆ",
    nameEn: "Maghe",
    nameHi: "मघे (मघा)",
    nameTe: "మఘె (మఘ)",
    nameTa: "மகே (மகம்)",
    nameMl: "മഘെ (മകം)",
    deityKn: "ಪಿತೃ ದೇವತೆಗಳು",
    deityEn: "Pitrs (Ancestors)",
    rulingPlanet: "Ketu",
    aliases: ["maghe", "magha", "makha", "magam", "ಮಘೆ", "ಮಘಾ", "ಮಖಾ"]
  },
  {
    index: 10,
    canonicalEn: "Hubbe",
    nameKn: "ಹುಬ್ಬೆ",
    nameEn: "Hubbe",
    nameHi: "हुब्बे (पूर्वा फाल्गुनी)",
    nameTe: "హుబ్బె (పూర్వ ఫల్గుణి)",
    nameTa: "ஹுப்பே (பூரம்)",
    nameMl: "ഹുബ്ബെ (പൂരം)",
    deityKn: "ಭಗ ದೇವತೆ",
    deityEn: "Bhaga",
    rulingPlanet: "Venus",
    aliases: ["hubbe", "purva phalguni", "purvaphalguni", "pubba", "pubbe", "pooram", "ಹುಬ್ಬೆ", "ಪುಬ್ಬಾ", "ಪೂರ್ವ ಫಲ್ಗುಣಿ"]
  },
  {
    index: 11,
    canonicalEn: "Uttara",
    nameKn: "ಉತ್ತರ",
    nameEn: "Uttara",
    nameHi: "उत्तरा (उत्तरा फाल्गुनी)",
    nameTe: "ఉత్తర (ఉత్తర ఫల్గుణి)",
    nameTa: "உத்தரா (உத்திரம்)",
    nameMl: "ഉത്തര (ഉത്രം)",
    deityKn: "ಅರ್ಯಮನ್",
    deityEn: "Aryaman",
    rulingPlanet: "Sun",
    aliases: ["uttara", "uttara phalguni", "uttaraphalguni", "uthiram", "uthram", "ಉತ್ತರ", "ಉತ್ತರಾ", "ಉತ್ತರ ಫಲ್ಗುಣಿ"]
  },
  {
    index: 12,
    canonicalEn: "Hasta",
    nameKn: "ಹಸ್ತಾ",
    nameEn: "Hasta",
    nameHi: "हस्त",
    nameTe: "హస్త",
    nameTa: "அஸ்தம்",
    nameMl: "അത്തം",
    deityKn: "ಸವಿತೃ (ಸೂರ್ಯ)",
    deityEn: "Savitar",
    rulingPlanet: "Moon",
    aliases: ["hasta", "hastha", "atham", "ಹಸ್ತಾ", "ಹಸ್ತ"]
  },
  {
    index: 13,
    canonicalEn: "Chitra",
    nameKn: "ಚಿತ್ರಾ",
    nameEn: "Chitra",
    nameHi: "चित्रा",
    nameTe: "చిత్త",
    nameTa: "சித்திரை",
    nameMl: "ചിത്തിര",
    deityKn: "ತ್ವಷ್ಟೃ (ವಿಶ್ವಕರ್ಮ)",
    deityEn: "Tvashtar",
    rulingPlanet: "Mars",
    aliases: ["chitra", "chithra", "chitta", "chithirai", "ಚಿತ್ರಾ", "ಚಿತ್ತಾ"]
  },
  {
    index: 14,
    canonicalEn: "Swati",
    nameKn: "ಸ್ವಾತಿ",
    nameEn: "Swati",
    nameHi: "स्वाति",
    nameTe: "స్వాతి",
    nameTa: "சுவாதி",
    nameMl: "ചോതി",
    deityKn: "ವಾಯು ದೇವ",
    deityEn: "Vayu",
    rulingPlanet: "Rahu",
    aliases: ["swati", "swathi", "choti", "ಸ್ವಾತಿ"]
  },
  {
    index: 15,
    canonicalEn: "Vishakha",
    nameKn: "ವಿಶಾಖಾ",
    nameEn: "Vishakha",
    nameHi: "विशाखा",
    nameTe: "విశాఖ",
    nameTa: "விசாகம்",
    nameMl: "വിശാഖം",
    deityKn: "ಇಂದ್ರಾಗ್ರಿ (ಇಂದ್ರ ಮತ್ತು ಅಗ್ನಿ)",
    deityEn: "Indra-Agni",
    rulingPlanet: "Jupiter",
    aliases: ["vishakha", "visakha", "visakam", "ವಿಶಾಖಾ"]
  },
  {
    index: 16,
    canonicalEn: "Anuradha",
    nameKn: "ಅನುರಾಧಾ",
    nameEn: "Anuradha",
    nameHi: "अनुराधा",
    nameTe: "అనూరాధ",
    nameTa: "அனுஷம்",
    nameMl: "അനിഴം",
    deityKn: "ಮಿತ್ರ ದೇವ",
    deityEn: "Mitra",
    rulingPlanet: "Saturn",
    aliases: ["anuradha", "anooradha", "anusham", "anizham", "ಅನುರಾಧಾ", "ಅನೂರಾಧಾ"]
  },
  {
    index: 17,
    canonicalEn: "Jyeshta",
    nameKn: "ಜ್ಯೇಷ್ಠಾ",
    nameEn: "Jyeshta",
    nameHi: "ज्येष्ठा",
    nameTe: "జ్యేష్ఠ",
    nameTa: "கேட்டை",
    nameMl: "തൃക്കേട്ട",
    deityKn: "ಇಂದ್ರ ದೇವ",
    deityEn: "Indra",
    rulingPlanet: "Mercury",
    aliases: ["jyeshta", "jyeshtha", "kettai", "thrikketta", "ಜ್ಯೇಷ್ಠಾ", "ಜ್ಯೇಷ್ಠ"]
  },
  {
    index: 18,
    canonicalEn: "Moola",
    nameKn: "ಮೂಲಾ",
    nameEn: "Moola",
    nameHi: "मूला",
    nameTe: "మూల",
    nameTa: "மூலம்",
    nameMl: "മൂലം",
    deityKn: "ನಿರೃತಿ ದೇವಿ",
    deityEn: "Nirriti",
    rulingPlanet: "Ketu",
    aliases: ["moola", "mula", "moolam", "ಮೂಲಾ", "ಮೂಲ"]
  },
  {
    index: 19,
    canonicalEn: "Poorvashada",
    nameKn: "ಪೂರ್ವಾಷಾಢಾ",
    nameEn: "Poorvashada",
    nameHi: "पूर्वाषाढ़ा",
    nameTe: "పూర్వాషాఢ",
    nameTa: "பூராடம்",
    nameMl: "പൂരാടം",
    deityKn: "ಜಲ / ಆಪಸ್",
    deityEn: "Apas (Water Deity)",
    rulingPlanet: "Venus",
    aliases: ["poorvashada", "purva ashadha", "purvaashadha", "pooradam", "ಪೂರ್ವಾಷಾಢಾ", "ಪೂರ್ವಾಷಾಢ"]
  },
  {
    index: 20,
    canonicalEn: "Uttrashada",
    nameKn: "ಉತ್ತರಾಷಾಢಾ",
    nameEn: "Uttrashada",
    nameHi: "उत्तराषाढ़ा",
    nameTe: "ఉత్తరాషాఢ",
    nameTa: "உத்திராடம்",
    nameMl: "ഉത്രാടം",
    deityKn: "ವಿಶ್ವೇದೇವತೆಗಳು",
    deityEn: "Vishvadevas",
    rulingPlanet: "Sun",
    aliases: ["uttrashada", "uttara ashadha", "uttaraashadha", "uthiradam", "uthram", "ಉತ್ತರಾಷಾಢಾ", "ಉತ್ತರಾಷಾಢ"]
  },
  {
    index: 21,
    canonicalEn: "Shravana",
    nameKn: "ಶ್ರವಣ",
    nameEn: "Shravana",
    nameHi: "श्रवण",
    nameTe: "శ్రవణం",
    nameTa: "திருவோணம்",
    nameMl: "തിരുവോണം",
    deityKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು",
    deityEn: "Lord Vishnu",
    rulingPlanet: "Moon",
    aliases: ["shravana", "sravana", "thiruvonam", "ಶ್ರವಣ", "ಶ್ರವಣಾ"]
  },
  {
    index: 22,
    canonicalEn: "Dhanishta",
    nameKn: "ಧನಿಷ್ಠಾ",
    nameEn: "Dhanishta",
    nameHi: "धनिष्ठा",
    nameTe: "ధనిష్ఠ",
    nameTa: "அவிட்டம்",
    nameMl: "അവിട്ടം",
    deityKn: "ಅಷ್ಟ ವಸುಗಳು",
    deityEn: "Ashta Vasus",
    rulingPlanet: "Mars",
    aliases: ["dhanishta", "dhanishtha", "avittam", "ಧನಿಷ್ಠಾ", "ಧನಿಷ್ಠ"]
  },
  {
    index: 23,
    canonicalEn: "Shatavisha",
    nameKn: "ಶತಭಿಷಾ",
    nameEn: "Shatavisha",
    nameHi: "शतविषा (शतभिषा)",
    nameTe: "శతవిష (శతభిషం)",
    nameTa: "சதவிஷா (சதயம்)",
    nameMl: "ശതവിഷ (ചതയം)",
    deityKn: "ವರುಣ ದೇವ",
    deityEn: "Varuna",
    rulingPlanet: "Rahu",
    aliases: ["shatavisha", "shatabhisha", "shatabhishak", "sadayam", "chathayam", "ಶತಭಿಷಾ", "ಶತವೀಷ", "ಶತಭಿಷಕ್"]
  },
  {
    index: 24,
    canonicalEn: "Poorvabhadra",
    nameKn: "ಪೂರ್ವಾಭಾದ್ರ",
    nameEn: "Poorvabhadra",
    nameHi: "पूर्वाभाद्रपद",
    nameTe: "పూర్వాభాద్ర",
    nameTa: "பூரட்டாதி",
    nameMl: "പൂരുരുട്ടാതി",
    deityKn: "ಅಜೈಕಪಾದ ರುದ್ರ",
    deityEn: "Aja Ekapada",
    rulingPlanet: "Jupiter",
    aliases: ["poorvabhadra", "purva bhadrapada", "purvabhadra", "poorattathi", "ಪೂರ್ವಾಭಾದ್ರ", "ಪೂರ್ವಾಭಾದ್ರಾ", "ಪೂರ್ವಭಾದ್ರಪದ"]
  },
  {
    index: 25,
    canonicalEn: "Uttrabhadra",
    nameKn: "ಉತ್ತರಾಭಾದ್ರ",
    nameEn: "Uttrabhadra",
    nameHi: "उत्तराभाद्रपद",
    nameTe: "ఉత్తరాభాద్ర",
    nameTa: "உத்திரட்டாதி",
    nameMl: "ഉത്തൃട്ടാതി",
    deityKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ ರುದ್ರ",
    deityEn: "Ahirbudhnya",
    rulingPlanet: "Saturn",
    aliases: ["uttrabhadra", "uttara bhadrapada", "uttarabhadra", "uthirattathi", "ಉತ್ತರಾಭಾದ್ರ", "ಉತ್ತರಾಭಾದ್ರಾ", "ಉತ್ತರಭಾದ್ರಪದ"]
  },
  {
    index: 26,
    canonicalEn: "Revati",
    nameKn: "ರೇವತಿ",
    nameEn: "Revati",
    nameHi: "रेवती",
    nameTe: "రేవతి",
    nameTa: "ரேவதி",
    nameMl: "രേവതി",
    deityKn: "ಪೂಷನ್ (ಪೋಷಕ ದೇವ)",
    deityEn: "Pushan",
    rulingPlanet: "Mercury",
    aliases: ["revati", "revathi", "ರೇವತಿ"]
  }
];

/** Canonical 7 Varas starting with Somavara as requested */
export const BAGGONA_VARAS_MASTER: MasterVaraData[] = [
  {
    index: 1, // Traditional Monday
    canonicalEn: "Somavara",
    nameKn: "ಸೋಮವಾರ",
    nameEn: "Somavara (Monday)",
    nameHi: "सोमवार",
    nameTe: "సోమవారం",
    nameTa: "திங்கள் (சோமவாரம்)",
    nameMl: "തിങ്കൾ (സോമവാരം)",
    rulingPlanet: "Moon",
    tatva: "Water (ಜಲ)",
    aliases: ["somavara", "monday", "somavaram", "thingal", "ಸೋಮವಾರ"]
  },
  {
    index: 2, // Tuesday
    canonicalEn: "Mangalavara",
    nameKn: "ಮಂಗಳವಾರ",
    nameEn: "Mangalavara (Tuesday)",
    nameHi: "मंगलवार",
    nameTe: "మంగళవారం",
    nameTa: "செவ்வாய் (மங்களவாரம்)",
    nameMl: "ചൊവ്വ (മംഗളവാരം)",
    rulingPlanet: "Mars",
    tatva: "Fire (ತೇಜಸ್ಸು / ಅಗ್ನಿ)",
    aliases: ["mangalavara", "tuesday", "mangalavaram", "chevvai", "ಮಂಗಳವಾರ", "ಕುಜವಾರ"]
  },
  {
    index: 3, // Wednesday
    canonicalEn: "Budhavara",
    nameKn: "ಬುಧವಾರ",
    nameEn: "Budhavara (Wednesday)",
    nameHi: "बुधवार",
    nameTe: "బుధవారం",
    nameTa: "புதன் (புதவாரம்)",
    nameMl: "ബുധൻ (ബുധവാരം)",
    rulingPlanet: "Mercury",
    tatva: "Earth (ಪೃಥ್ವಿ)",
    aliases: ["budhavara", "wednesday", "budhavaram", "budhan", "ಬುಧವಾರ"]
  },
  {
    index: 4, // Thursday
    canonicalEn: "Guruvara",
    nameKn: "ಗುರುವಾರ",
    nameEn: "Guruvara (Thursday)",
    nameHi: "गुरुवार",
    nameTe: "గురువారం",
    nameTa: "வியாழன் (குருவாரம்)",
    nameMl: "വ്യാഴം (ഗുരുവാരം)",
    rulingPlanet: "Jupiter",
    tatva: "Ether (ಆಕಾಶ)",
    aliases: ["guruvara", "thursday", "guruvaram", "vyazhan", "ಗುರುವಾರ", "ಬೃಹಸ್ಪತಿವಾರ"]
  },
  {
    index: 5, // Friday
    canonicalEn: "Shukravara",
    nameKn: "ಶುಕ್ರವಾರ",
    nameEn: "Shukravara (Friday)",
    nameHi: "शुक्रवार",
    nameTe: "శుక్రవారం",
    nameTa: "வெள்ளி (சுக்கிரவாரம்)",
    nameMl: "വെള്ളി (ശുക്രവാരം)",
    rulingPlanet: "Venus",
    tatva: "Water (ಜಲ)",
    aliases: ["shukravara", "friday", "shukravaram", "velli", "ಶುಕ್ರವಾರ"]
  },
  {
    index: 6, // Saturday
    canonicalEn: "Shanivara",
    nameKn: "ಶನಿವಾರ",
    nameEn: "Shanivara (Saturday)",
    nameHi: "शनिवार",
    nameTe: "శనివారం",
    nameTa: "சனி (சனிவாரம்)",
    nameMl: "ശനി (ശനിവാരം)",
    rulingPlanet: "Saturn",
    tatva: "Air (ವಾಯು)",
    aliases: ["shanivara", "saturday", "shanivaram", "sani", "ಶನಿವಾರ"]
  },
  {
    index: 0, // Sunday
    canonicalEn: "Ravivara",
    nameKn: "ರವಿವಾರ",
    nameEn: "Ravivara (Sunday)",
    nameHi: "रविवार",
    nameTe: "రవివారం",
    nameTa: "ஞாயிறு (ரவிவாரம்)",
    nameMl: "ഞായർ (രവിവാരം)",
    rulingPlanet: "Sun",
    tatva: "Fire (ಅಗ್ನಿ)",
    aliases: ["ravivara", "sunday", "bhanuvara", "ravivaram", "nyayiru", "ರವಿವಾರ", "ಭಾನುವಾರ"]
  }
];

// In-memory cache for high-speed synchronous access across all components
let nakshatraCacheLoaded = false;
let nakshatraMemoryMap: Map<number, MasterNakshatraData> = new Map();
let nakshatraAliasMap: Map<string, MasterNakshatraData> = new Map();

let varaCacheLoaded = false;
let varaMemoryMap: Map<number, MasterVaraData> = new Map();
let varaAliasMap: Map<string, MasterVaraData> = new Map();

function buildMemoryMaps() {
  nakshatraMemoryMap.clear();
  nakshatraAliasMap.clear();
  for (const n of BAGGONA_NAKSHATRAS_MASTER) {
    nakshatraMemoryMap.set(n.index, n);
    nakshatraAliasMap.set(n.canonicalEn.toLowerCase(), n);
    nakshatraAliasMap.set(n.nameKn.toLowerCase(), n);
    for (const a of n.aliases) {
      nakshatraAliasMap.set(a.toLowerCase(), n);
    }
  }
  nakshatraCacheLoaded = true;

  varaMemoryMap.clear();
  varaAliasMap.clear();
  for (const v of BAGGONA_VARAS_MASTER) {
    varaMemoryMap.set(v.index, v);
    varaAliasMap.set(v.canonicalEn.toLowerCase(), v);
    varaAliasMap.set(v.nameKn.toLowerCase(), v);
    for (const a of v.aliases) {
      varaAliasMap.set(a.toLowerCase(), v);
    }
  }
  varaCacheLoaded = true;
}

buildMemoryMaps();

/**
 * Initializes and seeds the authentic 27 Baggona Nakshatras & 7 Varas into IndexedDB
 */
export async function seedNakshatrasAndVarasToDb(): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const count = await db.nakshatras.count();
    if (count < 27) {
      await db.nakshatras.clear();
      const records: NakshatraRecord[] = BAGGONA_NAKSHATRAS_MASTER.map((m) => ({
        index: m.index,
        canonicalEn: m.canonicalEn,
        nameKn: m.nameKn,
        nameEn: m.nameEn,
        nameHi: m.nameHi,
        nameTe: m.nameTe,
        nameTa: m.nameTa,
        nameMl: m.nameMl,
        deityKn: m.deityKn,
        deityEn: m.deityEn,
        rulingPlanet: m.rulingPlanet,
        aliases: m.aliases
      }));
      await db.nakshatras.bulkAdd(records);
    }

    const vCount = await db.varas.count();
    if (vCount < 7) {
      await db.varas.clear();
      const vRecords: VaraRecord[] = BAGGONA_VARAS_MASTER.map((v) => ({
        index: v.index,
        canonicalEn: v.canonicalEn,
        nameKn: v.nameKn,
        nameEn: v.nameEn,
        nameHi: v.nameHi,
        nameTe: v.nameTe,
        nameTa: v.nameTa,
        nameMl: v.nameMl,
        rulingPlanet: v.rulingPlanet,
        tatva: v.tatva,
        aliases: v.aliases
      }));
      await db.varas.bulkAdd(vRecords);
    }
  } catch (err) {
    console.warn("Nakshatra/Vara IndexedDB seeding notice:", err);
  }
}

/**
 * Resolves a Nakshatra name or index to the authentic Baggona name in target language
 */
export function getBaggonaNakshatra(
  indexOrName: number | string | undefined | null,
  lang: string = "kn"
): string {
  if (indexOrName === undefined || indexOrName === null) {
    return BAGGONA_NAKSHATRAS_MASTER[0].nameKn;
  }

  if (!nakshatraCacheLoaded) {
    buildMemoryMaps();
  }

  let item: MasterNakshatraData | undefined;

  if (typeof indexOrName === "number") {
    const idx = ((indexOrName % 27) + 27) % 27;
    item = nakshatraMemoryMap.get(idx);
  } else {
    const clean = String(indexOrName).trim().toLowerCase();
    item = nakshatraAliasMap.get(clean);
    if (!item) {
      for (const [key, val] of nakshatraAliasMap.entries()) {
        if (clean.includes(key) || key.includes(clean)) {
          item = val;
          break;
        }
      }
    }
  }

  if (!item) {
    return String(indexOrName);
  }

  const code = (lang || "kn").split("-")[0].toLowerCase();
  switch (code) {
    case "en":
      return item.nameEn;
    case "hi":
      return item.nameHi;
    case "te":
      return item.nameTe;
    case "ta":
      return item.nameTa;
    case "ml":
      return item.nameMl;
    case "kn":
    default:
      return item.nameKn;
  }
}

/**
 * Resolves a Vara name or weekday index (0=Sun..6=Sat) to the authentic Baggona name in target language
 */
export function getBaggonaVara(
  indexOrName: number | string | undefined | null,
  lang: string = "kn"
): string {
  if (indexOrName === undefined || indexOrName === null) {
    return BAGGONA_VARAS_MASTER[0].nameKn;
  }

  if (!varaCacheLoaded) {
    buildMemoryMaps();
  }

  let item: MasterVaraData | undefined;

  if (typeof indexOrName === "number") {
    const idx = ((indexOrName % 7) + 7) % 7;
    item = varaMemoryMap.get(idx);
  } else {
    const clean = String(indexOrName).trim().toLowerCase();
    item = varaAliasMap.get(clean);
    if (!item) {
      for (const [key, val] of varaAliasMap.entries()) {
        if (clean.includes(key) || key.includes(clean)) {
          item = val;
          break;
        }
      }
    }
  }

  if (!item) {
    return String(indexOrName);
  }

  const code = (lang || "kn").split("-")[0].toLowerCase();
  switch (code) {
    case "en":
      return item.nameEn;
    case "hi":
      return item.nameHi;
    case "te":
      return item.nameTe;
    case "ta":
      return item.nameTa;
    case "ml":
      return item.nameMl;
    case "kn":
    default:
      return item.nameKn;
  }
}

/**
 * Returns all 27 authentic Baggona Nakshatras.
 */
export function getAllBaggonaNakshatras(): MasterNakshatraData[] {
  return BAGGONA_NAKSHATRAS_MASTER;
}

/**
 * Returns all 7 authentic Baggona Varas.
 */
export function getAllBaggonaVaras(): MasterVaraData[] {
  return BAGGONA_VARAS_MASTER;
}

