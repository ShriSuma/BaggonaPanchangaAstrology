// Complete dictionary & phonetic English to Indic script transliteration for Devotee names

const NAME_DICTIONARY: Record<string, Record<string, string>> = {
  "Manoj": {
    "en": "Manoj",
    "kn": "ಮನೋಜ್",
    "hi": "मनोज",
    "te": "మనోజ్",
    "ta": "மனோஜ்"
  },
  "Manoj Poornamatha": {
    "en": "Manoj Poornamatha",
    "kn": "ಮನೋಜ್ ಪೂರ್ಣಮಠ",
    "hi": "मनोज पूर्णमठ",
    "te": "మనోజ్ పూర్ణమఠ",
    "ta": "மனோஜ் பூரணமடா"
  },
  "Dilip": {
    "en": "Dilip",
    "kn": "ದಿಲೀಪ್",
    "hi": "दिलीप",
    "te": "దిలీప్",
    "ta": "தில்லீப்"
  },
  "Dilip Pujari": {
    "en": "Dilip Pujari",
    "kn": "ದಿಲೀಪ್ ಪೂಜಾರಿ",
    "hi": "दिलीप पुजारी",
    "te": "దిలీప్ పూజారి",
    "ta": "தில்லீப் பூஜாரி"
  },
  "Pramod": {
    "en": "Pramod",
    "kn": "ಪ್ರಮೋದ್",
    "hi": "प्रमोद",
    "te": "ప్రమోద్",
    "ta": "பிரமோத்"
  },
  "Pramod Kudgi": {
    "en": "Pramod Kudgi",
    "kn": "ಪ್ರಮೋದ್ ಕುಡ್ಗಿ",
    "hi": "प्रमोद कुड्गी",
    "te": "ప్రమోద్ కుడ్గి",
    "ta": "பிரமோத் குட்கி"
  },
  "Pramod Kodgi": {
    "en": "Pramod Kodgi",
    "kn": "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ",
    "hi": "प्रमोद कोडगी",
    "te": "ప్రమోద్ ಕೊడ్గి",
    "ta": "பிரமோத் கொட்கி"
  },
  "Pramod Kodigi": {
    "en": "Pramod Kodigi",
    "kn": "ಪ್ರಮೋದ್ ಕೊಡಿಗಿ",
    "hi": "प्रमोद कोडिगी",
    "te": "ప్రమోద్ కొడిగి",
    "ta": "பிரமோத் கொடிகீ"
  },
  "Poornamatha": {
    "en": "Poornamatha",
    "kn": "ಪೂರ್ಣಮಠ",
    "hi": "पूर्णमठ",
    "te": "పూర్ణమఠ",
    "ta": "பூரணமடா"
  },
  "Pujari": {
    "en": "Pujari",
    "kn": "ಪೂಜಾರಿ",
    "hi": "पुजारी",
    "te": "పూజారి",
    "ta": "பூஜாரி"
  },
  "Kudgi": {
    "en": "Kudgi",
    "kn": "ಕುಡ್ಗಿ",
    "hi": "कुड्गी",
    "te": "కుడ్గి",
    "ta": "குட்கி"
  },
  "Shreeram": {
    "en": "Shreeram",
    "kn": "ಶ್ರೀರಾಮ",
    "hi": "श्रीराम",
    "te": "శ్రీరామ్",
    "ta": "ஸ்ரீராம்"
  },
  "Pandit": {
    "en": "Pandit",
    "kn": "ಪಂಡಿತ್",
    "hi": "पंडित",
    "te": "పండిట్",
    "ta": "பண்டிட்"
  },
  "Shreeram Pandit": {
    "en": "Shreeram Pandit",
    "kn": "ಶ್ರೀರಾಮ ಪಂಡಿತ್",
    "hi": "श्रीराम पंडित",
    "te": "శ్రీరామ్ పండిట్",
    "ta": "ஸ்ரீராம் பண்டிட்"
  },
  "Chaitanya Pandit": {
    "en": "Chaitanya Pandit",
    "kn": "ಚೈತನ್ಯ ಪಂಡಿತ್",
    "hi": "चैतन्य पंडित",
    "te": "చైతన్య పండిట్",
    "ta": "சைதன்ய பண்டிட்"
  },
  "Devotee": {
    "en": "Devotee",
    "kn": "ಭಕ್ತರು",
    "hi": "भक्त",
    "te": "భక్తుడు",
    "ta": "பக்தர்"
  },
  "Baggona": {
    "en": "Baggona",
    "kn": "ಬಗ್ಗೋಣ",
    "hi": "बग्गोणा",
    "te": "బగ్గోణ",
    "ta": "பக்கோனா"
  },
  "Gokarna": {
    "en": "Gokarna",
    "kn": "ಗೋಕರ್ಣ",
    "hi": "गोकर्ण",
    "te": "గోకర్ణ",
    "ta": "கோகர்ணா"
  },
  "Mahabaleshwara": {
    "en": "Mahabaleshwara",
    "kn": "ಮಹಾಬಲೇಶ್ವರ",
    "hi": "महाबलेश्वर",
    "te": "మహాబలేశ్వర",
    "ta": "மகாபலேஸ்வர"
  }
};

/**
 * Transliterates English/Indic names into the requested target language (kn, hi, te, ta, en).
 */
export function transliterateName(inputName: string, targetLang: string): string {
  if (!inputName || !inputName.trim()) return inputName;
  const langCode = targetLang ? targetLang.split("-")[0].toLowerCase() : "en";
  const nameTrimmed = inputName.trim();

  // 1. Direct whole-name dictionary lookup
  for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
    if (key.toLowerCase() === nameTrimmed.toLowerCase()) {
      return map[langCode] || nameTrimmed;
    }
    for (const val of Object.values(map)) {
      if (val.toLowerCase() === nameTrimmed.toLowerCase()) {
        return map[langCode] || val;
      }
    }
  }

  // 2. Token-by-token word translation (e.g. "Manoj Kumar", "Dilip Sharma")
  const words = nameTrimmed.split(/\s+/);
  const translatedWords = words.map((word) => {
    for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
      if (key.toLowerCase() === word.toLowerCase()) {
        return map[langCode] || word;
      }
      for (const val of Object.values(map)) {
        if (val.toLowerCase() === word.toLowerCase()) {
          return map[langCode] || val;
        }
      }
    }
    return word;
  });

  return translatedWords.join(" ");
}
