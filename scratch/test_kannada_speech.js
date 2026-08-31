/**
 * Converts Kannada / Sanskrit Unicode text to clear phonetic Romanized text
 * that any Indian Male TTS engine (Rishi, Alex, Daniel) can speak fluently and naturally!
 */

const KANNADA_VOWELS = {
  'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ee', 'ಉ': 'u', 'ಊ': 'oo', 'ಋ': 'ru',
  'ಎ': 'e', 'ಏ': 'ae', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'oa', 'ಔ': 'au', 'ಅಂ': 'am', 'ಅಃ': 'aha'
};

const KANNADA_MATRAS = {
  'ಾ': 'aa', 'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo', 'ೃ': 'ru',
  'ೆ': 'e', 'ೇ': 'ae', 'ೈ': 'ai', 'ೊ': 'o', 'ೋ': 'oa', 'ೌ': 'au',
  'ಂ': 'm', 'ಃ': 'ha', '್': ''
};

const KANNADA_CONSONANTS = {
  'ಕ': 'ka', 'ಖ': 'kha', 'ಗ': 'ga', 'ಘ': 'gha', 'ಙ': 'nga',
  'ಚ': 'cha', 'ಛ': 'chha', 'ಜ': 'ja', 'ಝ': 'jha', 'ಞ': 'nya',
  'ಟ': 'ta', 'ಠ': 'tha', 'ಡ': 'da', 'ಢ': 'dha', 'ಣ': 'na',
  'ತ': 'tha', 'ಥ': 'thha', 'ದ': 'dha', 'ಧ': 'dhha', 'ನ': 'na',
  'ಪ': 'pa', 'ಫ': 'pha', 'ಬ': 'ba', 'ಭ': 'bha', 'ಮ': 'ma',
  'ಯ': 'ya', 'ರ': 'ra', 'ಱ': 'ra', 'ಲ': 'la', 'ವ': 'va',
  'ಶ': 'sha', 'ಷ': 'sha', 'ಸ': 'sa', 'ಹ': 'ha', 'ಳ': 'la',
  'ೞ': 'zha'
};

function kannadaToPhoneticLatin(text) {
  let result = '';
  const len = text.length;
  let i = 0;

  while (i < len) {
    const char = text[i];

    // Check independent vowels
    if (KANNADA_VOWELS[char]) {
      result += KANNADA_VOWELS[char];
      i++;
      continue;
    }

    // Check consonants
    if (KANNADA_CONSONANTS[char]) {
      const baseConsonant = KANNADA_CONSONANTS[char].slice(0, -1); // e.g. 'k' from 'ka'
      const nextChar = i + 1 < len ? text[i + 1] : '';

      if (nextChar === '್') { // Halant / Virama
        // Half consonant or conjunct
        const afterHalant = i + 2 < len ? text[i + 2] : '';
        if (afterHalant && KANNADA_CONSONANTS[afterHalant]) {
          result += baseConsonant;
          i += 2; // skip char and virama, will process next consonant in next loop
          continue;
        } else {
          result += baseConsonant;
          i += 2;
          continue;
        }
      } else if (KANNADA_MATRAS[nextChar]) {
        result += baseConsonant + KANNADA_MATRAS[nextChar];
        i += 2;
        continue;
      } else {
        result += baseConsonant + 'a';
        i++;
        continue;
      }
    }

    // Matras without preceding consonant
    if (KANNADA_MATRAS[char]) {
      result += KANNADA_MATRAS[char];
      i++;
      continue;
    }

    // Pass through spaces, numbers, english, punctuation
    result += char;
    i++;
  }

  // Clean up double vowels and standardize for natural Vedic chanting cadence
  return result
    .replace(/a+a/g, 'aa')
    .replace(/e+e/g, 'ee')
    .replace(/o+o/g, 'oo')
    .replace(/shree/gi, 'Shree')
    .replace(/om/gi, 'Aum')
    .replace(/\s+/g, ' ')
    .trim();
}

const sampleText = "ಹರಿ ಓಂ. ನಾನು ಶ್ರೀಸುಮ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಪವಿತ್ರ ದರ್ಶನ ಹಾಗೂ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಂಕಲ್ಪಕ್ಕೆ ತಮಗೆ ಭಕ್ತಿಪೂರ್ವಕ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಆಯುರಾರೋಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ. ಓಂ ನಮಃ ಶಿವಾಯ.";

const phonetic = kannadaToPhoneticLatin(sampleText);
console.log("Original Kannada:", sampleText);
console.log("Phonetic Roman:", phonetic);

const { execSync } = require('child_process');
try {
  console.log("\nTesting Speech Synthesis with Mac 'say' command on Indian voice 'Rishi'...");
  execSync(`say -v Rishi -r 145 "${phonetic}"`);
  console.log("Successfully spoken!");
} catch (e) {
  console.error("Speech test failed:", e.message);
}
