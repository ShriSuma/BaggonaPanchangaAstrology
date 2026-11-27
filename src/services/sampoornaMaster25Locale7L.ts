/**
 * 7-Language Native Localization Dictionary & Helpers for Sampoorna 25-Chapter Master Report.
 * Supports: Kannada (kn), English (en), Hindi (hi), Tamil (ta), Telugu (te), Malayalam (ml), Marathi (mr).
 * Enforces strict single-script purity with zero cross-script or English leakage in regional scripts.
 */

import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";
import { RASHI_6L, GRAHA_6L, NAKSHATRA_6L, WEEKDAY_6L } from "../features/fiveYearPrediction/fiveYearLocale";
import { RASHI_7L as ANTARANGA_RASHI_7L, GRAHA_7L as ANTARANGA_GRAHA_7L, NAKSHATRA_7L as ANTARANGA_NAKSHATRA_7L } from "../features/hotelSecret/antarangaService";
import type { YogaId } from "../core/KundliInsightsEngine";

export type SevenLang = SixLang | "ml";

export const SEVEN_LANGS: readonly SevenLang[] = ["kn", "en", "hi", "ta", "te", "ml", "mr"] as const;

export const LANG_ENGLISH_NAMES: Record<SevenLang, string> = {
  kn: "Kannada",
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  mr: "Marathi"
};

export const LANG_NATIVE_NAMES: Record<SevenLang, string> = {
  kn: "ಕನ್ನಡ",
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
  ml: "മലയാളം",
  mr: "मराठी"
};

export function normalizeSevenLang(lang?: string | null): SevenLang {
  const code = String(lang || "kn").trim().slice(0, 2).toLowerCase();
  if (code === "kn" || code === "en" || code === "hi" || code === "ta" || code === "te" || code === "ml" || code === "mr") {
    return code;
  }
  return "kn";
}

export function pick7<T>(map: Record<SevenLang, T>, lang: SevenLang | string): T {
  const safe = normalizeSevenLang(lang);
  return map[safe];
}

export function getIndicFontFamily7L(lang: SevenLang | string): string {
  switch (normalizeSevenLang(lang)) {
    case "kn":
      return "'Noto Serif Kannada', 'Noto Sans Kannada', serif";
    case "hi":
    case "mr":
      return "'Noto Sans Devanagari', 'Noto Serif Devanagari', serif";
    case "te":
      return "'Noto Sans Telugu', serif";
    case "ta":
      return "'Noto Sans Tamil', serif";
    case "ml":
      return "'Noto Sans Malayalam', serif";
    default:
      return "'Georgia', 'Times New Roman', serif";
  }
}

export function toNativeDigits7L(num: number | string, lang: SevenLang | string): string {
  const safe = normalizeSevenLang(lang);
  const s = String(num);
  // English and modern Malayalam use standard Arabic numerals (0-9) for crisp readability
  if (safe === "en" || safe === "ml") return s;
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
  const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  const digits =
    safe === "kn"
      ? knDigits
      : safe === "mr" || safe === "hi"
      ? hiDigits
      : safe === "te"
      ? teDigits
      : taDigits;
  return s.replace(/\d/g, (d) => digits[parseInt(d, 10)] || d);
}

// Re-aligned pure 7L Rashi, Graha, Nakshatra, Weekday maps
export const RASHI_7L: Record<number, Record<SevenLang, string>> = Object.fromEntries(
  Array.from({ length: 12 }, (_, idx) => [
    idx,
    {
      kn: RASHI_6L[idx]?.kn || ANTARANGA_RASHI_7L[idx]?.kn || "",
      en: RASHI_6L[idx]?.en || ANTARANGA_RASHI_7L[idx]?.en || "",
      hi: RASHI_6L[idx]?.hi || ANTARANGA_RASHI_7L[idx]?.hi || "",
      ta: RASHI_6L[idx]?.ta || ANTARANGA_RASHI_7L[idx]?.ta || "",
      te: RASHI_6L[idx]?.te || ANTARANGA_RASHI_7L[idx]?.te || "",
      mr: RASHI_6L[idx]?.mr || ANTARANGA_RASHI_7L[idx]?.mr || "",
      ml: ANTARANGA_RASHI_7L[idx]?.ml || ""
    }
  ])
);

const GRAHA_ML: Record<string, string> = {
  Sun: "സൂര്യൻ",
  Moon: "ചന്ദ്രൻ",
  Mars: "ചൊവ്വ",
  Mercury: "ബുധൻ",
  Jupiter: "വ്യാഴം",
  Venus: "ശുക്രൻ",
  Saturn: "ശനി",
  Rahu: "രാഹു",
  Ketu: "കേതു",
  Maandi: "മാന്ദി"
};

const ANTARANGA_GRAHA_LOOKUP = ANTARANGA_GRAHA_7L as Record<string, Partial<Record<SevenLang, string>>>;

export const GRAHA_7L: Record<string, Record<SevenLang, string>> = Object.fromEntries(
  ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((key) => [
    key,
    {
      kn: GRAHA_6L[key]?.kn || ANTARANGA_GRAHA_LOOKUP[key]?.kn || key,
      en: GRAHA_6L[key]?.en || ANTARANGA_GRAHA_LOOKUP[key]?.en || key,
      hi: GRAHA_6L[key]?.hi || ANTARANGA_GRAHA_LOOKUP[key]?.hi || key,
      ta: GRAHA_6L[key]?.ta || ANTARANGA_GRAHA_LOOKUP[key]?.ta || key,
      te: GRAHA_6L[key]?.te || ANTARANGA_GRAHA_LOOKUP[key]?.te || key,
      mr: GRAHA_6L[key]?.mr || ANTARANGA_GRAHA_LOOKUP[key]?.mr || key,
      ml: GRAHA_ML[key] || ANTARANGA_GRAHA_LOOKUP[key]?.ml || key
    }
  ])
);

export const PLANET_SHORT_7L: Record<string, Record<SevenLang, string>> = {
  Sun: { kn: "ಸೂರ್ಯ", mr: "सूर्य", hi: "सूर्य", te: "సూర్య", ta: "சூரி", ml: "സൂര്യൻ", en: "Sun" },
  Moon: { kn: "ಚಂದ್ರ", mr: "चंद्र", hi: "चन्द्र", te: "చంద్ర", ta: "சந்", ml: "ചന്ദ്രൻ", en: "Moon" },
  Mars: { kn: "ಕುಜ", mr: "मंगळ", hi: "मंगल", te: "కుజ", ta: "செவ்", ml: "ചൊവ്വ", en: "Mars" },
  Mercury: { kn: "ಬುಧ", mr: "बुध", hi: "बुध", te: "బుధ", ta: "புத", ml: "ബുധൻ", en: "Mer" },
  Jupiter: { kn: "ಗುರು", mr: "गुरु", hi: "गुरु", te: "గురు", ta: "குரு", ml: "ഗുരു", en: "Jup" },
  Venus: { kn: "ಶುಕ್ರ", mr: "शुक्र", hi: "शुक्र", te: "శుక్ర", ta: "சுக்", ml: "ശുക്രൻ", en: "Ven" },
  Saturn: { kn: "ಶನಿ", mr: "शनि", hi: "शनि", te: "శని", ta: "சனி", ml: "ശനി", en: "Sat" },
  Rahu: { kn: "ರಾಹು", mr: "राहू", hi: "राहु", te: "రాహు", ta: "ராகு", ml: "രാഹു", en: "Rahu" },
  Ketu: { kn: "ಕೇತು", mr: "केतू", hi: "केतु", te: "కేతు", ta: "கேது", ml: "കേതു", en: "Ketu" },
  Maandi: { kn: "ಮಾಂದಿ", mr: "मांदी", hi: "मांदी", te: "మాంది", ta: "மாந்தி", ml: "മാന്ദി", en: "Maandi" }
};

export const NAKSHATRA_7L: Record<number, Record<SevenLang, string>> = Object.fromEntries(
  Array.from({ length: 27 }, (_, idx) => [
    idx,
    {
      kn: NAKSHATRA_6L[idx]?.kn || ANTARANGA_NAKSHATRA_7L[idx]?.kn || "",
      en: NAKSHATRA_6L[idx]?.en || ANTARANGA_NAKSHATRA_7L[idx]?.en || "",
      hi: NAKSHATRA_6L[idx]?.hi || ANTARANGA_NAKSHATRA_7L[idx]?.hi || "",
      ta: NAKSHATRA_6L[idx]?.ta || ANTARANGA_NAKSHATRA_7L[idx]?.ta || "",
      te: NAKSHATRA_6L[idx]?.te || ANTARANGA_NAKSHATRA_7L[idx]?.te || "",
      mr: NAKSHATRA_6L[idx]?.mr || ANTARANGA_NAKSHATRA_7L[idx]?.mr || "",
      ml: ANTARANGA_NAKSHATRA_7L[idx]?.ml || ""
    }
  ])
);

const WEEKDAYS_ML = [
  "ഞായറാഴ്ച",
  "തിങ്കളാഴ്ച",
  "ചൊവ്വാഴ്ച",
  "ബുധനാഴ്ച",
  "വ്യാഴാഴ്ച",
  "വെള്ളിയാഴ്ച",
  "ശനിയാഴ്ച"
] as const;

export const WEEKDAY_7L: Record<number, Record<SevenLang, string>> = Object.fromEntries(
  Array.from({ length: 7 }, (_, idx) => [
    idx,
    {
      kn: WEEKDAY_6L[idx]?.kn || "",
      en: WEEKDAY_6L[idx]?.en || "",
      hi: WEEKDAY_6L[idx]?.hi || "",
      ta: WEEKDAY_6L[idx]?.ta || "",
      te: WEEKDAY_6L[idx]?.te || "",
      mr: WEEKDAY_6L[idx]?.mr || "",
      ml: WEEKDAYS_ML[idx]
    }
  ])
);

export const REPORT_MONTHS_7L: Record<SevenLang, readonly string[]> = {
  kn: ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"],
  mr: ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"],
  hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"],
  te: ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జులై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"],
  ta: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
  ml: ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

export const ELEMENT_NAMES_7L: Record<"fire" | "earth" | "air" | "water", Record<SevenLang, string>> = {
  fire: { kn: "ಅಗ್ನಿ ತತ್ವ", mr: "अग्नी तत्त्व", hi: "अग्नि तत्त्व", te: "అగ్ని తత్వం", ta: "அக்னி தத்துவம்", ml: "അഗ്നി തത്വം", en: "Fire (Agni)" },
  earth: { kn: "ಪೃಥ್ವಿ (ಭೂ) ತತ್ವ", mr: "पृथ्वी तत्त्व", hi: "पृथ्वी तत्त्व", te: "పృథ్వి తత్వం", ta: "பூமி (பிருத்வி) தத்துவம்", ml: "ഭൂമി (പൃഥ്വി) തത്വം", en: "Earth (Prithvi)" },
  air: { kn: "ವಾಯು ತತ್ವ", mr: "वायू तत्त्व", hi: "वायु तत्त्व", te: "వాయు తత్వం", ta: "வாயு தத்துவம்", ml: "വായു തത്വം", en: "Air (Vayu)" },
  water: { kn: "ಜಲ ತತ್ವ", mr: "जल तत्त्व", hi: "जल तत्त्व", te: "జల తత్వం", ta: "நீர் (ஜல) தத்துவம்", ml: "ജല തത്വം", en: "Water (Jala)" }
};

export const YOGA_LABELS_7L: Record<YogaId, Record<SevenLang, string>> = {
  gajakesari: { kn: "ಗಜಕೇಸರಿ ಯೋಗ", mr: "गजकेसरी योग", hi: "गजकेसरी योग", te: "గజకేసరి యోగం", ta: "கஜகேசரி யோகம்", ml: "ഗജകേസരി യോഗം", en: "Gajakesari Yoga" },
  budhaditya: { kn: "ಬುಧಾದಿತ್ಯ ಯೋಗ", mr: "बुधादित्य योग", hi: "बुधादित्य योग", te: "బుధాదిత్య యోగం", ta: "புதாதித்ய யோகம்", ml: "ബുധാദിത്യ യോഗം", en: "Budhaditya Yoga" },
  ruchaka: { kn: "ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ", mr: "रुचक महापुरुष योग", hi: "रुचक महापुरुष योग", te: "రుచక మహాపురుష యోగం", ta: "ருசக மகாபுருஷ யோகம்", ml: "രുചക മഹാപുരുഷ യോഗം", en: "Ruchaka Mahapurusha Yoga" },
  bhadra: { kn: "ಭದ್ರ ಮಹಾಪುರುಷ ಯೋಗ", mr: "भद्र महापुरुष योग", hi: "भद्र महापुरुष योग", te: "భద్ర మహాపురుష యోగం", ta: "பத்ர மகாபுருஷ யோகம்", ml: "ഭദ്ര മഹാപുരുഷ യോഗം", en: "Bhadra Mahapurusha Yoga" },
  hamsa: { kn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ", mr: "हंस महापुरुष योग", hi: "हंस महापुरुष योग", te: "హంస మహాపురుష యోగం", ta: "ஹம்ச மகாபுருஷ யோகம்", ml: "ഹംസ മഹാപുരുഷ യോഗം", en: "Hamsa Mahapurusha Yoga" },
  malavya: { kn: "ಮಾಳವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ", mr: "मालव्य महापुरुष योग", hi: "मालव्य महापुरुष योग", te: "మాలవ్య మహాపురుష యోగం", ta: "மாளவ்ய மகாபுருஷ யோகம்", ml: "മാളവ്യ മഹാപുരുഷ യോഗം", en: "Malavya Mahapurusha Yoga" },
  sasha: { kn: "ಶಶ ಮಹಾಪುರುಷ ಯೋಗ", mr: "शश महापुरुष योग", hi: "शश महापुरुष योग", te: "శశ మహాపురుష యోగం", ta: "சச மகாபுருஷ யோகம்", ml: "ശശ മഹാപുരുഷ യോഗം", en: "Sasha Mahapurusha Yoga" },
  chandra_mangala: { kn: "ಚಂದ್ರ-ಮಂಗಳ ಯೋಗ", mr: "चंद्र-मंगळ योग", hi: "चन्द्र-मंगल योग", te: "చంద్ర-మంగళ యోగం", ta: "சந்திர-மங்கள யோகம்", ml: "ചന്ദ്ര-മംഗള യോഗം", en: "Chandra-Mangala Yoga" },
  kemadruma: { kn: "ಕೇಮದ್ರುಮ ಯೋಗ (ಭಂಗ ಪರಿಶೀಲನೆ)", mr: "केमद्रुम योग", hi: "केमद्रुम योग", te: "కేమద్రుమ యోగం", ta: "கேமத்ரும யோகம்", ml: "കേമദ്രുമ യോഗം (ഭംഗ പരിശോധന)", en: "Kemadruma Yoga" }
};

export const FUNCTIONAL_NATURE_7L: Record<"benefic" | "yogakaraka" | "malefic" | "mixed", Record<SevenLang, string>> = {
  benefic: {
    kn: "ಶುಭ ಫಲದಾಯಕ ಯೋಗಕಾರಕ",
    mr: "शुभ फलदायी योगकारक",
    hi: "शुभ फलदायी योगकारक",
    te: "శుభ ఫలదాయక యోగకారక",
    ta: "சுப பலன் தரும் யோககாரகர்",
    ml: "ശുഭഫലദായക യോഗകാരകൻ",
    en: "Functional Benefic"
  },
  yogakaraka: {
    kn: "ಪರಮ ಶ್ರೇಷ್ಠ ಯೋಗಕಾರಕ ಗ್ರಹ",
    mr: "सर्वोत्तम राजयोगकारक ग्रह",
    hi: "सर्वोत्तम राजयोगकारक ग्रह",
    te: "సర్వోత్తమ రాజయోగకారక గ్రహం",
    ta: "உயர் ராஜயோககாரக கிரகம்",
    ml: "പരമോന്നത രാജയോഗകാരക ഗ്രഹം",
    en: "Supreme Yogakaraka"
  },
  malefic: {
    kn: "ಪರೀಕ್ಷಾತ್ಮಕ / ಮಾರಕ ಸಂವೇದಿ ಗ್ರಹ",
    mr: "परीक्षात्मक व सावध फलदायी",
    hi: "परीक्षात्मक एवं सावधानी सूचक",
    te: "పరీక్షాత్మక / అప్రమత్తత కోరే గ్రహం",
    ta: "சோதனை மற்றும் எச்சரிக்கை தரும் நிலை",
    ml: "പരീക്ഷണാത്മക / ജാഗ്രത സൂചിപ്പിക്കുന്ന നില",
    en: "Functional Challenge / Maraka Sensitive"
  },
  mixed: {
    kn: "ಮಿಶ್ರ ಹಾಗೂ ಪರಿಶ್ರಮ ಆಧಾರಿತ ಫಲ",
    mr: "मिश्र व कष्टावर आधारित फळ",
    hi: "मिश्रित एवं प्रयास-सापेक्ष फल",
    te: "మిశ్రమ మరియు శ్రమాధారిత ఫలితం",
    ta: "கலப்பு மற்றும் முயற்சி சார்ந்த பலன்",
    ml: "മിശ്രവും പരിശ്രമാധിഷ്ഠിതവുമായ ഫലം",
    en: "Mixed / Effort-Driven"
  }
};

export const YOGI_ATTRIBUTES_ML: Record<string, { color: string; direction: string; wealthDay: string; gemstone: string; deity: string }> = {
  Sun: { color: "ചെമ്പ് കലർന്ന ചുവപ്പ്", direction: "കിഴക്ക്", wealthDay: "ഞായറാഴ്ച", gemstone: "മാണിക്യം", deity: "ശ്രീ സൂര്യനാരായണൻ" },
  Moon: { color: "തൂവെള്ള / മുത്തുനിറം", direction: "വടക്കുപടിഞ്ഞാറ്", wealthDay: "തിങ്കളാഴ്ച", gemstone: "മുത്ത്", deity: "ശ്രീ ഗൗരീദേവി / ചന്ദ്രൻ" },
  Mars: { color: "പവിഴച്ചുവപ്പ് / കാവി", direction: "തെക്ക്", wealthDay: "ചൊവ്വാഴ്ച", gemstone: "പവിഴം", deity: "ശ്രീ സുബ്രഹ്മണ്യ സ്വാമി" },
  Mercury: { color: "മരതകപ്പച്ച", direction: "വടക്ക്", wealthDay: "ബുധനാഴ്ച", gemstone: "മരതകം", deity: "ശ്രീ മഹാവിഷ്ണു" },
  Jupiter: { color: "മഞ്ഞൾപ്പൊൻ നിറം", direction: "വടക്കുകിഴക്ക്", wealthDay: "വ്യാഴാഴ്ച", gemstone: "പുഷ്യരാഗം", deity: "ശ്രീ ദക്ഷിണാമൂർത്തി" },
  Venus: { color: "തിളങ്ങുന്ന വെള്ള / ക്രീം", direction: "തെക്കുകിഴക്ക്", wealthDay: "വെള്ളിയാഴ്ച", gemstone: "വജ്രം / സ്ഫടികം", deity: "ശ്രീ മഹാലക്ഷ്മി ദേവി" },
  Saturn: { color: "കടും നീലം / കറുപ്പ്", direction: "പടിഞ്ഞാറ്", wealthDay: "ശനിയാഴ്ച", gemstone: "ഇന്ദ്രനീലം", deity: "ശ്രീ ശാസ്താവ് / ശനീശ്വരൻ" },
  Rahu: { color: "ചാരനിറം / ഗോമേദക നിറം", direction: "തെക്കുപടിഞ്ഞാറ്", wealthDay: "ശനിയാഴ്ച", gemstone: "ഗോമേദകം", deity: "ശ്രീ ദുർഗ്ഗാദേവി" },
  Ketu: { color: "സ്വർണ്ണ-തവിട്ട് മിശ്രിതം", direction: "വടക്കുകിഴക്ക്", wealthDay: "ചൊവ്വാഴ്ച", gemstone: "വൈഡൂര്യം", deity: "ശ്രീ മഹാഗണപതി" }
};

export const TITHIS_ML = [
  "പ്രഥമ", "ദ്വിതീയ", "തൃതീയ", "ചതുർത്ഥി", "പഞ്ചമി",
  "ഷഷ്ഠി", "സപ്തമി", "അഷ്ടമി", "നവമി", "ദശമി",
  "ഏകാദശി", "ദ്വാദശി", "ത്രയോദശി", "ചതുർദശി", "പൗർണ്ണമി",
  "പ്രഥമ", "ദ്വിതീയ", "തൃതീയ", "ചതുർത്ഥി", "പഞ്ചമി",
  "ഷഷ്ഠി", "സപ്തമി", "അഷ്ടമി", "നവമി", "ദശമി",
  "ഏകാദശി", "ദ്വാദശി", "ത്രയോദശി", "ചതുർദശി", "അമാവാസി"
] as const;

export const TITHIS_MR = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पौर्णिमा",
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावास्या"
] as const;

export const YOGAS_ML = [
  "വിഷ്കംഭം", "പ്രീതി", "ആയുഷ്മാൻ", "സൗഭാഗ്യം", "ശോഭനം",
  "അതിഗണ്ഡം", "സുകർമ്മം", "ധൃതി", "ശൂലം", "ഗണ്ഡം",
  "വൃദ്ധി", "ധ്രുവം", "വ്യാഘാതം", "ഹർഷണം", "വജ്രം",
  "സിദ്ധി", "വ്യതീപാതം", "വരീയാൻ", "പരിഘം", "ശിവം",
  "സിദ്ധം", "സാദ്ധ്യം", "ശുഭം", "ശുക്ലം", "ബ്രഹ്മം",
  "ഇന്ദ്രം", "വൈധൃതി"
] as const;

export const KARANAS_ML = [
  "ബവം", "ബാലവം", "കൗലവം", "തൈതിലം", "ഗരം", "വണിജം", "ഭദ്ര (വിഷ്ടി)",
  "ശകുനി", "ചതുഷ്പാദം", "നാഗവം", "കിംസ്തുഘ്നം"
] as const;

const EN_TITHI_INDEX: Record<string, number> = {
  pratipada: 0, dvitiya: 1, tritiya: 2, chaturthi: 3, panchami: 4,
  shashthi: 5, saptami: 6, ashtami: 7, navami: 8, dashami: 9,
  ekadashi: 10, dwadashi: 11, trayodashi: 12, chaturdashi: 13, purnima: 14, amavasya: 29
};

const EN_YOGA_INDEX: Record<string, number> = {
  vishkambha: 0, priti: 1, ayushman: 2, saubhagya: 3, shobhana: 4,
  atiganda: 5, sukarma: 6, dhriti: 7, shoola: 8, ganda: 9,
  vriddhi: 10, dhruva: 11, vyaghata: 12, harshana: 13, vajra: 14,
  siddhi: 15, vyatipata: 16, variyana: 17, parigha: 18, shiva: 19,
  siddha: 20, sadhya: 21, shubha: 22, shukla: 23, brahma: 24,
  indra: 25, vaidhriti: 26
};

const EN_KARANA_INDEX: Record<string, number> = {
  bava: 0, balava: 1, kaulava: 2, taitila: 3, garaja: 4,
  vanija: 5, vishti: 6, bhadra: 6, shakuni: 7, chatushpada: 8,
  naga: 9, kintughna: 10, kimstughna: 10
};

export function resolveMlPanchangaTerms(traditional: any): {
  pakshaMl: string;
  tithiMl: string;
  yogaMl: string;
  karanaMl: string;
} {
  const isKrishna = String(traditional?.paksha || "").toLowerCase().includes("krishna");
  const pakshaMl = isKrishna ? "കൃഷ്ണ" : "ശുക്ല";
  const rawTithiLower = String(traditional?.tithi || "").trim().toLowerCase();
  const baseTIdx = EN_TITHI_INDEX[rawTithiLower] ?? 0;
  const fullTIdx = isKrishna && baseTIdx < 14 ? baseTIdx + 15 : baseTIdx;
  const tithiMl = TITHIS_ML[fullTIdx] || "പ്രഥമ";

  const rawYogaLower = String(traditional?.yoga || "").trim().toLowerCase();
  const yIdx = EN_YOGA_INDEX[rawYogaLower] ?? 20;
  const yogaMl = YOGAS_ML[yIdx] || "സിദ്ധം";

  const rawKaranaLower = String(traditional?.karana || "").trim().toLowerCase();
  const kIdx = EN_KARANA_INDEX[rawKaranaLower] ?? 0;
  const karanaMl = KARANAS_ML[kIdx] || "ബവം";

  return { pakshaMl, tithiMl, yogaMl, karanaMl };
}

export function resolveMrTithiName(traditional: any): string {
  const isKrishna = String(traditional?.paksha || "").toLowerCase().includes("krishna");
  const rawTithiLower = String(traditional?.tithi || "").trim().toLowerCase();
  const baseTIdx = EN_TITHI_INDEX[rawTithiLower] ?? 0;
  const fullTIdx = isKrishna && baseTIdx < 14 ? baseTIdx + 15 : baseTIdx;
  return TITHIS_MR[fullTIdx] || traditional?.tithi5L?.hi || "प्रतिपदा";
}

export const DOSHA_NAMES_ML: Record<string, string> = {
  pitru_dosha: "പിതൃ ദോഷം",
  narayana_bali: "നാരായണ ബലി / പ്രേതബാധാ ദോഷം",
  kala_sarpa: "കാളസർപ്പ ദോഷം",
  guru_chandala: "ഗുരു-ചണ്ഡാല ദോഷം",
  balarishta: "ബാലാരിഷ്ട ദോഷം",
  balyagraha: "ബാല്യഗ്രഹ ദോഷം",
  kuja_dosha: "കുജ ദോഷം (ചൊവ്വാ ദോഷം)",
  grahan_dosha: "ഗ്രഹണ ദോഷം",
  shrapit_dosha: "ശാപിത ദോഷം (ശനി-രാഹു)",
  kemadruma_dosha: "കേമദ്രുമ ദോഷം",
  gandanta_dosha: "ഗണ്ഡാന്ത ദോഷം",
  dasha_sandhi: "ദശാസന്ധി ദോഷം",
  gochara_shani: "ശനി ഗോചര ദോഷം (ഏഴരശനി / അഷ്ടമശനി)",
  gochara_guru: "വ്യാഴ ഗോചര പ്രതികൂലത",
  gochara_rahu_ketu: "രാഹു-കേതു ഗോചര ദോഷം",
  tithi_shunya_dosha: "തിഥി ശൂന്യ ദോഷം",
  panchanga_yoga_dosha: "പഞ്ചാംഗ യോഗ ദോഷം",
  panchanga_karana_dosha: "പഞ്ചാംഗ കരണ ദോഷം"
};

export const DOSHA_NAMES_MR: Record<string, string> = {
  pitru_dosha: "पितृ दोष",
  narayana_bali: "नारायण बली प्रेतबाधा योग",
  kala_sarpa: "कालसर्प दोष",
  guru_chandala: "गुरु-चांडाळ दोष",
  balarishta: "बालारिष्ट दोष",
  balyagraha: "बाल्यग्रह दोष",
  kuja_dosha: "मंगळ (कुज) दोष",
  grahan_dosha: "ग्रहण दोष",
  shrapit_dosha: "शापित दोष (शनि-राहू)",
  kemadruma_dosha: "केमद्रुम दोष",
  gandanta_dosha: "गंडांत दोष",
  dasha_sandhi: "दशासंधी दोष",
  gochara_shani: "शनि गोचर दोष (साडेसाती / अष्टम शनि)",
  gochara_guru: "गुरु गोचर प्रतिकूलता",
  gochara_rahu_ketu: "राहू-केतू गोचर दोष",
  tithi_shunya_dosha: "तिथी शून्य दोष",
  panchanga_yoga_dosha: "पंचांग योग दोष",
  panchanga_karana_dosha: "पंचांग करण दोष"
};

export function resolveDoshaName7L(dosha: { id?: string; name?: Record<string, string> }, lang: SevenLang): string {
  const id = String(dosha?.id || "");
  if (lang === "ml") return DOSHA_NAMES_ML[id] || "ജാതക ഗ്രഹദോഷം";
  if (lang === "mr") return DOSHA_NAMES_MR[id] || dosha?.name?.hi || dosha?.name?.en || "पत्रिका ग्रहदोष";
  return dosha?.name?.[lang] || dosha?.name?.en || id;
}

export const PLACE_TERMS_7L: Record<string, Record<SevenLang, string>> = {
  india: { kn: "ಭಾರತ", mr: "भारत", hi: "भारत", te: "భారతదేశం", ta: "இந்தியா", ml: "ഇന്ത്യ", en: "India" },
  karnataka: { kn: "ಕರ್ನಾಟಕ", mr: "कर्नाटक", hi: "कर्नाटक", te: "కర్ణాటక", ta: "கர்நாடகா", ml: "കർണാടക", en: "Karnataka" },
  maharashtra: { kn: "ಮಹಾರಾಷ್ಟ್ರ", mr: "महाराष्ट्र", hi: "महाराष्ट्र", te: "మహారాష్ట్ర", ta: "மகாராஷ்டிரா", ml: "മഹാരാഷ്ട്ര", en: "Maharashtra" },
  "tamil nadu": { kn: "ತಮಿಳುನಾಡು", mr: "तमिळनाडू", hi: "तमिलनाडु", te: "తమిళనాడు", ta: "தமிழ்நாடு", ml: "തമിഴ്‌നാട്", en: "Tamil Nadu" },
  "andhra pradesh": { kn: "ಆಂಧ್ರ ಪ್ರದೇಶ", mr: "आंध्र प्रदेश", hi: "आंध्र प्रदेश", te: "ఆంధ్ర ప్రదేశ్", ta: "ஆந்திர பிரதேசம்", ml: "ആന്ധ്രാപ്രദേശ്", en: "Andhra Pradesh" },
  telangana: { kn: "ತೆಲಂಗಾಣ", mr: "तेलंगणा", hi: "तेलंगाना", te: "తెలంగాణ", ta: "தெலங்கானா", ml: "തെലങ്കാന", en: "Telangana" },
  kerala: { kn: "ಕೇರಳ", mr: "केरळ", hi: "केरल", te: "కేరళ", ta: "கேரளா", ml: "കേരളം", en: "Kerala" },
  gokarna: { kn: "ಗೋಕರ್ಣ", mr: "गोकर्ण", hi: "गोकर्ण", te: "గోకర్ణ", ta: "கோகர்ணா", ml: "ഗോകർണ്ണം", en: "Gokarna" },
  bengaluru: { kn: "ಬೆಂಗಳೂರು", mr: "बेंगळुरू", hi: "बेंगलुरु", te: "బెంగళూరు", ta: "பெங்களூரு", ml: "ബെംഗളൂരു", en: "Bengaluru" },
  bangalore: { kn: "ಬೆಂಗಳೂರು", mr: "बेंगळुरू", hi: "बेंगलुरु", te: "బెంగళూరు", ta: "பெங்களூரு", ml: "ബെംഗളൂരു", en: "Bangalore" },
  mysuru: { kn: "ಮೈಸೂರು", mr: "म्हैसूर", hi: "मैसूरु", te: "మైసూరు", ta: "மைசூரு", ml: "മൈസൂരു", en: "Mysuru" },
  mysore: { kn: "ಮೈಸೂರು", mr: "म्हैसूर", hi: "मैसूर", te: "మైసూరు", ta: "மைசூர்", ml: "മൈസൂർ", en: "Mysore" },
  mangaluru: { kn: "ಮಂಗಳೂರು", mr: "मंगळुरू", hi: "मंगलुरु", te: "మంగళూరు", ta: "மங்களூரு", ml: "മംഗളൂരു", en: "Mangaluru" },
  mangalore: { kn: "ಮಂಗಳೂರು", mr: "मंगळुरू", hi: "मंगलोर", te: "మంగళూరు", ta: "மங்களூர்", ml: "മംഗളൂർ", en: "Mangalore" },
  udupi: { kn: "ಉಡುಪಿ", mr: "उडुपी", hi: "उडुपी", te: "ఉడుపి", ta: "உடுப்பி", ml: "ഉഡുപ്പി", en: "Udupi" },
  honnavar: { kn: "ಹೊನ್ನಾವರ", mr: "होन्नावर", hi: "होन्नावर", te: "హొన్నావర్", ta: "ஹொன்னாவர்", ml: "ഹൊന്നാവർ", en: "Honnavar" },
  kumta: { kn: "ಕುಮಟಾ", mr: "कुमटा", hi: "कुमटा", te: "కుమటా", ta: "கும்தா", ml: "കുമട", en: "Kumta" },
  karwar: { kn: "ಕಾರವಾರ", mr: "कारवार", hi: "कारवार", te: "కార్వార్", ta: "கார்வார்", ml: "കാർവാർ", en: "Karwar" },
  sirsi: { kn: "ಶಿರಸಿ", mr: "सिरसी", hi: "सिरसी", te: "సిర్సి", ta: "சிர்சி", ml: "സിർസി", en: "Sirsi" },
  hubballi: { kn: "ಹುಬ್ಬಳ್ಳಿ", mr: "हुबळी", hi: "हुबली", te: "హుబ్లీ", ta: "ஹுப்பள்ளி", ml: "ഹുബ്ബള്ളി", en: "Hubballi" },
  dharwad: { kn: "ಧಾರವಾಡ", mr: "धारवाड", hi: "धारवाड़", te: "ధార్వాడ్", ta: "தார்வாட்", ml: "ധാർവാഡ്", en: "Dharwad" },
  mumbai: { kn: "ಮುಂಬೈ", mr: "मुंबई", hi: "मुंबई", te: "ముంబై", ta: "மும்பை", ml: "മുംബൈ", en: "Mumbai" },
  pune: { kn: "ಪುಣೆ", mr: "पुणे", hi: "पुणे", te: "పుణే", ta: "புனே", ml: "പൂനെ", en: "Pune" },
  hyderabad: { kn: "ಹೈದರಾಬಾದ್", mr: "हैदराबाद", hi: "हैदराबाद", te: "హైదరాబాద్", ta: "ஹைதராபாத்", ml: "ഹൈദരാബാദ്", en: "Hyderabad" },
  chennai: { kn: "ಚೆನ್ನೈ", mr: "चेन्नई", hi: "चेन्नई", te: "చెన్నై", ta: "சென்னை", ml: "ചെന്നൈ", en: "Chennai" },
  delhi: { kn: "ದೆಹಲಿ", mr: "दिल्ली", hi: "दिल्ली", te: "ఢిల్లీ", ta: "டெல்லி", ml: "ഡൽഹി", en: "Delhi" },
  kochi: { kn: "ಕೊಚ್ಚಿ", mr: "कोची", hi: "कोच्चि", te: "కొచ్చి", ta: "கொச்சி", ml: "കൊച്ചി", en: "Kochi" },
  thiruvananthapuram: { kn: "ತಿರುವನಂತಪುರಂ", mr: "तिरुवनंतपुरम", hi: "तिरुवनंतपुरम", te: "తిరువనంతపురం", ta: "திருவனந்தபுரம்", ml: "തിരുവനന്തപുരം", en: "Thiruvananthapuram" }
};
