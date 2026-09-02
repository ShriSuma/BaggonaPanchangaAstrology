// Comprehensive 5-Language Transliteration Engine for Devotee Names

const NAME_DICTIONARY: Record<string, Record<string, string>> = {
  "gowtam": { kn: "ಗೌತಮ್", hi: "गौतम", te: "గౌతమ్", ta: "கௌதம்", en: "Gowtam" },
  "gautam": { kn: "ಗೌತಮ್", hi: "गौतम", te: "గౌతమ్", ta: "கௌதம்", en: "Gautam" },
  "roja": { kn: "ರೋಜಾ", hi: "रोजा", te: "రోజా", ta: "ரோஜா", en: "Roja" },
  "swayam naik": { kn: "ಸ್ವಯಂ ನಾಯಕ್", hi: "स्वयं नायक", te: "స్వయం నాయక్", ta: "ஸ்வயம் நாயக்", en: "Swayam Naik" },
  "swayam": { kn: "ಸ್ವಯಂ", hi: "स्वयं", te: "స్ವయం", ta: "ஸ்வயம்", en: "Swayam" },
  "naik": { kn: "ನಾಯಕ್", hi: "नायक", te: "నాయక్", ta: "நாயக்", en: "Naik" },
  "nayak": { kn: "ನಾಯಕ್", hi: "नायक", te: "నాయక్", ta: "நாயக்", en: "Nayak" },
  "manoj poornamath": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனோஜ் பூரணமடா", en: "Manoj Poornamath" },
  "manoj purnamath": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனೋಜ್ பூரணமடா", en: "Manoj Purnamath" },
  "manoj poornamatha": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனೋஜ் பூரணಮடா", en: "Manoj Poornamatha" },
  "poornamath": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Poornamath" },
  "purnamath": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Purnamath" },
  "manoj": { kn: "ಮನೋಜ್", hi: "मनोज", te: "మనోజ్", ta: "மனோஜ்", en: "Manoj" },
  "poornamatha": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Poornamatha" },
  "dileep hiregange": { kn: "ದಿಲೀಪ್ ಹಿರೇಗಂಗೆ", hi: "दिलीप हिरेगंगे", te: "దిలీప్ హిరేగంగె", ta: "தில்லீப் ஹிரேகங்கே", en: "Dileep Hiregange" },
  "dilip hiregange": { kn: "ದಿಲೀಪ್ ಹಿರೇಗಂಗೆ", hi: "दिलीप हिरेगंगे", te: "దిలీప్ హిరేగంగె", ta: "தில்லீப் ಹிரேகங்கே", en: "Dilip Hiregange" },
  "dileep": { kn: "ದಿಲೀಪ್", hi: "दिलीप", te: "దిలీప్", ta: "தில்லீಪ್", en: "Dileep" },
  "hiregange": { kn: "ಹಿರೇಗಂಗೆ", hi: "हिरेगंगे", te: "హిరేగంగె", ta: "ஹிரேகங்கே", en: "Hiregange" },
  "dilip pujari": { kn: "ದಿಲೀಪ್ ಪೂಜಾರಿ", hi: "दिलीप पुजारी", te: "దిలీಪ್ పూజారి", ta: "தில்லீப் பூஜாரி", en: "Dilip Pujari" },
  "dilip": { kn: "ದಿಲೀಪ್", hi: "दिलीप", te: "దిలీప్", ta: "தில்லீப்", en: "Dilip" },
  "pujari": { kn: "ಪೂಜಾರಿ", hi: "पुजारी", te: "పూజారి", ta: "பூஜாரி", en: "Pujari" },
  "pramod kudgi": { kn: "ಪ್ರಮೋದ್ ಕುಡ್ಗಿ", hi: "प्रमोद कुड्गी", te: "ప్రమోద్ ಕುಡ್ಗಿ", ta: "பிரமோத் குட்கி", en: "Pramod Kudgi" },
  "pramod kodgi": { kn: "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ", hi: "प्रमोद कोडगी", te: "ప్రమోద్ కొడ్గి", ta: "பிரமோத் கொட்கி", en: "Pramod Kodgi" },
  "pramod kodigi": { kn: "ಪ್ರಮೋದ್ ಕೊಡಿಗಿ", hi: "प्रमोद कोडिगी", te: "ಪ್ರಮೋದ್ ಕೊಡಿಗಿ", ta: "பிரமோத் கொடிகீ", en: "Pramod Kodigi" },
  "pramod": { kn: "ಪ್ರಮೋದ್", hi: "प्रमोद", te: "ప్రమోద్", ta: "பிரமோத்", en: "Pramod" },
  "kudgi": { kn: "ಕುಡ್ಗಿ", hi: "कुड्गी", te: "కుడ్గి", ta: "குட்கி", en: "Kudgi" },
  "shreeram pandit": { kn: "ಶ್ರೀರಾಮ ಪಂಡಿತ್", hi: "श्रीराम पंडित", te: "శ్రీరామ్ పండిట్", ta: "ஸ்ரீராம் பண்டிட்", en: "Shreeram Pandit" },
  "chaitanya pandit": { kn: "ಚೈತನ್ಯ ಪಂಡಿತ್", hi: "चैतन्य पंडित", te: "చైతన్య పండిట్", ta: "சைதன்ய பண்டிட்", en: "Chaitanya Pandit" },
  "shreeram": { kn: "ಶ್ರೀರಾಮ", hi: "श्रीराम", te: "శ్రీరామ్", ta: "ஸ்ரீராம்", en: "Shreeram" },
  "pandit": { kn: "ಪಂಡಿತ್", hi: "पंडित", te: "పండిట్", ta: "பண்டிட்", en: "Pandit" },
  "devotee": { kn: "ಭಕ್ತರು", hi: "भक्त", te: "భక్తుడు", ta: "பக்தர்", en: "Devotee" },
  "kumar": { kn: "ಕುಮಾರ್", hi: "कुमार", te: "కుమార్", ta: "குமார்", en: "Kumar" },
  "sharma": { kn: "ಶರ್ಮಾ", hi: "शर्मा", te: "శర్మ", ta: "சர்மா", en: "Sharma" },
  "rao": { kn: "ರಾವ್", hi: "राव", te: "రావు", ta: "ராவ்", en: "Rao" },
  "bhat": { kn: "ಭಟ್", hi: "भट्ट", te: "భట్", ta: "பட்", en: "Bhat" },
  "bhatt": { kn: "ಭಟ್", hi: "भट्ट", te: "భట్", ta: "பட்", en: "Bhatt" },
  "hegde": { kn: "ಹೆಗ್ಡೆ", hi: "हेगड़े", te: "హెగ్డే", ta: "ஹெக்டே", en: "Hegde" },
  "gowda": { kn: "ಗೌಡ", hi: "गौड़ा", te: "గౌడ", ta: "கவுடா", en: "Gowda" },
  "naidu": { kn: "ನಾಯ್ಡು", hi: "नायडू", te: "నాయుడు", ta: "நாயுடு", en: "Naidu" },
  "reddy": { kn: "ರೆಡ್ಡಿ", hi: "रेड्डी", te: "రెడ్డి", ta: "ரெட்டி", en: "Reddy" },
  "patil": { kn: "ಪಾಟೀಲ್", hi: "पाटील", te: "పాటీల్", ta: "பாட்டீல்", en: "Patil" },
  "joshi": { kn: "ಜೋಶಿ", hi: "जोशी", te: "జోషి", ta: "ஜோஷி", en: "Joshi" },
  "kulkarni": { kn: "ಕುಲಕರ್ಣಿ", hi: "कुलकर्णी", te: "కులకర్ణి", ta: "குல்கர்னி", en: "Kulkarni" },
  "ramesh": { kn: "ರಮೇಶ್", hi: "रमेश", te: "రమేష్", ta: "ரமேஷ்", en: "Ramesh" },
  "suresh": { kn: "ಸುರೇಶ್", hi: "सुरेश", te: "సురేష్", ta: "சுரேஷ்", en: "Suresh" },
  "ganesh": { kn: "ಗಣೇಶ್", hi: "गणेश", te: "గణేష్", ta: "கணேஷ்", en: "Ganesh" },
  "mahesh": { kn: "ಮಹೇಶ್", hi: "महेश", te: "మహేష్", ta: "மகேஷ்", en: "Mahesh" },
  "dinesh": { kn: "ದಿನೇಶ್", hi: "दिनेश", te: "దినేష్", ta: "தமேஷ்", en: "Dinesh" },
  "rajesh": { kn: "ರಾಜೇಶ್", hi: "राजेश", te: "రాజేష్", ta: "ராஜேஷ்", en: "Rajesh" },
  "vijay": { kn: "ವಿಜಯ್", hi: "विजय", te: "విజయ్", ta: "விஜய்", en: "Vijay" },
  "ajay": { kn: "ಅಜಯ್", hi: "अजय", te: "అజయ్", ta: "அஜய்", en: "Ajay" },
  "sanjay": { kn: "ಸಂಜಯ್", hi: "संजय", te: "సంజయ్", ta: "சஞ்சய்", en: "Sanjay" },
  "anil": { kn: "ಅನಿಲ್", hi: "अनिल", te: "అనిల్", ta: "அனில்", en: "Anil" },
  "sunil": { kn: "ಸುನಿಲ್", hi: "सुनील", te: "సునీల్", ta: "சுனில்", en: "Sunil" },
  "praveen": { kn: "ಪ್ರವೀಣ್", hi: "प्रवीण", te: "ప్రవీణ్", ta: "பிரவீன்", en: "Praveen" },
  "naveen": { kn: "ನವೀನ್", hi: "नवीन", te: "నవీన్", ta: "நவீன்", en: "Naveen" },
  "karthik": { kn: "ಕಾರ್ತಿಕ್", hi: "कार्तिक", te: "కార్తీక్", ta: "கார்த்திக்", en: "Karthik" },
  "deepak": { kn: "ದೀಪಕ್", hi: "दीपक", te: "దీపక్", ta: "தீபக்", en: "Deepak" },
  "manjunath": { kn: "ಮಂಜುನಾಥ್", hi: "मंजूनाथ", te: "మంజునాథ్", ta: "மஞ்சுநாத்", en: "Manjunath" },
  "venkatesh": { kn: "ವೆಂಕಟೇಶ್", hi: "वेंकटेश", te: "వెంకటేష్", ta: "வெங்கடேஷ்", en: "Venkatesh" },
  "vasishtha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vasishtha" },
  "vashishtha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vashishtha" },
  "vashistha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vashistha" },
  "vasistha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vasistha" },
  "vasishta": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vasishta" },
  "vashishta": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vashishta" },
  "kashyapa": { kn: "ಕಾಶ್ಯಪ", hi: "काश्यप", te: "కాశ్యప", ta: "காஸ்யப", en: "Kashyapa" },
  "kashyap": { kn: "ಕಾಶ್ಯಪ", hi: "काश्यप", te: "కాశ్యప", ta: "காஸ்யப", en: "Kashyap" },
  "bharadwaja": { kn: "ಭಾರದ್ವಾಜ", hi: "भरद्वाज", te: "భారద్వాజ", ta: "பரத்வாஜ", en: "Bharadwaja" },
  "bharadwaj": { kn: "ಭಾರದ್ವಾಜ", hi: "भरद्वाज", te: "భారద్వాజ", ta: "பரத்வாஜ", en: "Bharadwaj" },
  "gautama": { kn: "ಗೌತಮ", hi: "गौतम", te: "గౌతమ", ta: "கௌதம", en: "Gautama" },
  "vishwamitra": { kn: "ವಿಶ್ವಾಮಿತ್ರ", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்திரர்", en: "Vishwamitra" },
  "viswamitra": { kn: "ವಿಶ್ವಾಮಿತ್ರ", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்திரர்", en: "Viswamitra" },
  "jamadagni": { kn: "ಜಮದಗ್ನಿ", hi: "जमदग्नि", te: "జమదग्नि", ta: "ஜமதக்னி", en: "Jamadagni" },
  "atri": { kn: "ಅತ್ರಿ", hi: "अत्रि", te: "అత్రి", ta: "அத்ரி", en: "Atri" },
  "agastya": { kn: "ಅಗಸ್ತ್ಯ", hi: "अगस्त्य", te: "అగస్త్య", ta: "அகஸ்தியர்", en: "Agastya" },
  "harita": { kn: "ಹರೀತ", hi: "हरीत", te: "హరీత", ta: "ஹரித", en: "Harita" },
  "srivatsa": { kn: "ಶ್ರೀವತ್ಸ", hi: "श्रीवत्स", te: "శ్రీవత్స", ta: "ஸ்ரீவத்ச", en: "Srivatsa" },
  "shrivatsa": { kn: "ಶ್ರೀವತ್ಸ", hi: "श्रीवत्स", te: "శ్రీవత్స", ta: "ஸ்ரீவத்ச", en: "Shrivatsa" },
  "shandilya": { kn: "ಶಾಂಡಿಲ್ಯ", hi: "शांडिल्य", te: "శాండిల్య", ta: "சாண்டில்ய", en: "Shandilya" },
  "sandilya": { kn: "ಶಾಂಡಿಲ್ಯ", hi: "शांडिल्य", te: "శాండిల్య", ta: "சாண்டில்ய", en: "Sandilya" }
};

/** Phonetic character map for unknown words */
const PHONETIC_CHAR_MAP: Record<string, { kn: string; hi: string; te: string; ta: string }> = {
  "aa": { kn: "ಆ", hi: "आ", te: "ఆ", ta: "ஆ" },
  "ai": { kn: "ಐ", hi: "ऐ", te: "ఐ", ta: "ஐ" },
  "au": { kn: "ಔ", hi: "औ", te: "ఔ", ta: "ஔ" },
  "kh": { kn: "ಖ್", hi: "ख्", te: "ఖ్", ta: "க்" },
  "gh": { kn: "ಘ್", hi: "घ्", te: "ఘ్", ta: "க்" },
  "ch": { kn: "ಚ್", hi: "च्", te: "చ్", ta: "ச்" },
  "jh": { kn: "ಝ್", hi: "झ्", te: "ఝ్", ta: "ஜ" },
  "th": { kn: "ಥ್", hi: "थ्", te: "థ్", ta: "த்" },
  "dh": { kn: "ಧ್", hi: "ध्", te: "ధ్", ta: "த்" },
  "ph": { kn: "ಫ್", hi: "फ्", te: "ఫ్", ta: "ப்" },
  "bh": { kn: "ಭ್", hi: "भ्", te: "భ్", ta: "ப" },
  "sh": { kn: "ಶ್", hi: "श्", te: "శ్", ta: "ஷ்" },
  "k": { kn: "ಕ್", hi: "क्", te: "క్", ta: "க்" },
  "g": { kn: "ಗ್", hi: "ग्", te: "గ్", ta: "க்" },
  "j": { kn: "ಜ್", hi: "ज्", te: "జ్", ta: "ஜ" },
  "t": { kn: "ಟ್", hi: "ट्", te: "ట్", ta: "ட்" },
  "d": { kn: "ಡ್", hi: "ड्", te: "డ్", ta: "ட்" },
  "n": { kn: "ನ್", hi: "न्", te: "న్", ta: "ன்" },
  "p": { kn: "ಪ್", hi: "प्", te: "ప్", ta: "ப்" },
  "b": { kn: "ಬ್", hi: "ब्", te: "బ్", ta: "ப்" },
  "m": { kn: "ಮ್", hi: "म्", te: "మ్", ta: "ம்" },
  "y": { kn: "ಯ್", hi: "य्", te: "య్", ta: "ய்" },
  "r": { kn: "ರ್", hi: "र्", te: "ర్", ta: "ர்" },
  "l": { kn: "ಲ್", hi: "ल्", te: "ల్", ta: "ல்" },
  "v": { kn: "ವ್", hi: "व्", te: "వ్", ta: "வ்" },
  "w": { kn: "ವ್", hi: "व्", te: "వ్", ta: "வ்" },
  "s": { kn: "ಸ್", hi: "स्", te: "స్", ta: "ஸ்" },
  "h": { kn: "ಹ್", hi: "ह्", te: "హ్", ta: "ஹ்" },
  "a": { kn: "ಅ", hi: "अ", te: "అ", ta: "அ" },
  "i": { kn: "ಇ", hi: "इ", te: "ఇ", ta: "இ" },
  "u": { kn: "ಉ", hi: "उ", te: "ఉ", ta: "உ" },
  "e": { kn: "ಎ", hi: "ए", te: "ఎ", ta: "எ" },
  "o": { kn: "ಒ", hi: "ओ", te: "ఒ", ta: "ஒ" }
};

/**
 * Phonetically transliterates a single unknown English word into an Indic script.
 */
function phoneticTransliterateWord(word: string, langCode: "kn" | "hi" | "te" | "ta"): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  let result = "";
  let i = 0;

  while (i < lower.length) {
    // Try 2-char match first
    const two = lower.slice(i, i + 2);
    if (PHONETIC_CHAR_MAP[two]) {
      result += PHONETIC_CHAR_MAP[two][langCode];
      i += 2;
      continue;
    }
    // 1-char match
    const one = lower.slice(i, i + 1);
    if (PHONETIC_CHAR_MAP[one]) {
      result += PHONETIC_CHAR_MAP[one][langCode];
      i += 1;
      continue;
    }
    result += word[i];
    i += 1;
  }
  return result;
}

/**
 * Detects the script of an input string (Kannada, Devanagari, Telugu, Tamil, or English).
 */
export function detectScript(text: string): "kn" | "hi" | "te" | "ta" | "en" {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  return "en";
}

/** Indic (Kannada, Devanagari, Telugu, Tamil) to Latin/English phonetic transliteration */
export function transliterateIndicToLatin(text: string): string {
  if (!text) return "";

  // Common titles & prefixes
  let s = text
    .replace(/ಶ್ರೀರಾಮ್|ಶ್ರೀರಾಮ/g, "Shreeram ")
    .replace(/ಶ್ರೀ/g, "Shree ")
    .replace(/ಶ್ರೀಯುತ/g, "Shriyuta ")
    .replace(/ಪಂಡಿತ್|ಪಂಡಿತ/g, "Pandit ")
    .replace(/ಅರ್ಚಕ/g, "Archaka ")
    .replace(/ಶಾಸ್ತ್ರಿ/g, "Shastri ")
    .replace(/ಪೂಜಾರಿ/g, "Pujari ")
    .replace(/ಭಟ್|ಭಟ್ಟ/g, "Bhat ")
    .replace(/ಹೆಗ್ಡೆ/g, "Hegde ")
    .replace(/ಜೋಶಿ/g, "Joshi ")
    .replace(/ರಾವ್/g, "Rao ")
    .replace(/ಗೌಡ/g, "Gowda ")
    .replace(/ನಾಯಕ್|ನಾಯ್ಕ/g, "Nayak ")
    .replace(/ಕುಮಾರ್/g, "Kumar ")
    .replace(/ಶರ್ಮಾ/g, "Sharma ")
    .replace(/ಮಂಜುನಾಥ್/g, "Manjunath ")
    .replace(/ವೆಂಕಟೇಶ್/g, "Venkatesh ")
    .replace(/ಗಜಾನನ/g, "Gajanana ")
    .replace(/ಗೌತಮ್/g, "Gowtam ");

  // Character mapping for Kannada Unicode (0x0C80 - 0x0CFF)
  const knMap: Record<string, string> = {
    // Vowels
    "ಅ": "a", "ಆ": "aa", "ಇ": "i", "ಈ": "ee", "ಉ": "u", "ಊ": "oo", "ಋ": "ru",
    "ಎ": "e", "ಏ": "e", "ಐ": "ai", "ಒ": "o", "ಓ": "o", "ಔ": "au", "ಅಂ": "am", "ಅಃ": "ah",
    // Consonants (with default 'a' inherent vowel)
    "ಕ": "ka", "ಖ": "kha", "ಗ": "ga", "ಘ": "gha", "ಙ": "nga",
    "ಚ": "cha", "ಛ": "chha", "ಜ": "ja", "ಝ": "jha", "ಞ": "nya",
    "ಟ": "ta", "ಠ": "tha", "ಡ": "da", "ಢ": "dha", "ಣ": "na",
    "ತ": "ta", "ಥ": "tha", "ದ": "da", "ಧ": "dha", "ನ": "na",
    "ಪ": "pa", "ಫ": "pha", "ಬ": "ba", "ಭ": "bha", "ಮ": "ma",
    "ಯ": "ya", "ರ": "ra", "ಱ": "ra", "ಲ": "la", "ವ": "va",
    "ಶ": "sha", "ಷ": "sha", "ಸ": "sa", "ಹ": "ha", "ಳ": "la",
    // Matras (vowel signs) - replaces preceding 'a'
    "ಾ": "aa", "ಿ": "i", "ೀ": "ee", "ು": "u", "ೂ": "oo", "ೃ": "ru",
    "ೆ": "e", "ೇ": "e", "ೈ": "ai", "ೊ": "o", "ೋ": "o", "ೌ": "au",
    "ಂ": "m", "ಃ": "h", "್": ""
  };

  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "್") {
      // Halant removes the trailing 'a' of previous consonant
      if (out.endsWith("a")) {
        out = out.slice(0, -1);
      }
    } else if (["ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೃ", "ೆ", "ೇ", "ೈ", "ೊ", "ೋ", "ೌ"].includes(ch)) {
      if (out.endsWith("a")) {
        out = out.slice(0, -1);
      }
      out += knMap[ch] || "";
    } else if (knMap[ch] !== undefined) {
      out += knMap[ch];
    } else {
      out += ch;
    }
  }

  return out.replace(/\s+/g, " ").trim();
}

/**
 * Transliterates English/Indic names into the requested target language (kn, hi, te, ta, en).
 */
export function transliterateName(inputName: string, targetLang: string): string {
  if (!inputName || !inputName.trim()) return inputName;
  const langCode = (targetLang ? targetLang.split("-")[0].toLowerCase() : "en") as "kn" | "hi" | "te" | "ta" | "en";
  const nameTrimmed = inputName.trim();
  const inputScript = detectScript(nameTrimmed);

  // If the input is already in the requested target script, return it untouched to prevent corruption
  if (inputScript === langCode) {
    return nameTrimmed;
  }

  if (langCode === "en") {
    // 1. Direct whole-name reverse lookup
    const lowerWhole = nameTrimmed.toLowerCase();
    for (const map of Object.values(NAME_DICTIONARY)) {
      for (const val of Object.values(map)) {
        if (val.toLowerCase() === lowerWhole) {
          return map.en || val;
        }
      }
    }

    // 2. Token-by-token reverse lookup
    const words = nameTrimmed.split(/\s+/);
    const translatedWords = words.map((word) => {
      const wLower = word.toLowerCase();
      for (const map of Object.values(NAME_DICTIONARY)) {
        for (const val of Object.values(map)) {
          if (val.toLowerCase() === wLower) {
            return map.en || val;
          }
        }
      }
      return transliterateIndicToLatin(word);
    });

    return translatedWords.join(" ").trim();
  }

  const lowerWhole = nameTrimmed.toLowerCase();

  // 1. Direct whole-name dictionary lookup
  if (NAME_DICTIONARY[lowerWhole] && NAME_DICTIONARY[lowerWhole][langCode]) {
    return NAME_DICTIONARY[lowerWhole][langCode];
  }

  // Check if input matches any localized value in dictionary
  for (const map of Object.values(NAME_DICTIONARY)) {
    for (const val of Object.values(map)) {
      if (val.toLowerCase() === lowerWhole) {
        return map[langCode] || val;
      }
    }
  }

  // 2. Token-by-token word translation
  const words = nameTrimmed.split(/\s+/);
  const translatedWords = words.map((word) => {
    const wLower = word.toLowerCase();
    if (NAME_DICTIONARY[wLower] && NAME_DICTIONARY[wLower][langCode]) {
      return NAME_DICTIONARY[wLower][langCode];
    }
    for (const map of Object.values(NAME_DICTIONARY)) {
      for (const val of Object.values(map)) {
        if (val.toLowerCase() === wLower) {
          return map[langCode] || val;
        }
      }
    }
    // If the word itself is already in target script, keep it as is
    if (detectScript(word) === langCode) return word;
    // 3. Fallback to phonetic character mapping if word not in dictionary
    return phoneticTransliterateWord(word, langCode);
  });

  return translatedWords.join(" ");
}
