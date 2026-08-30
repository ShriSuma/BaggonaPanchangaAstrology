/**
 * Classical Vedic Hastarekha Shastra & Samudrika Knowledge Repository.
 * 
 * Deeply integrates ancient classical treatises:
 * 1. Brihat Samhita (Acharya Varahamihira, 6th Century CE)
 * 2. Garuda Purana (Samudrika Shastra Adhyaya - Chapters 58-66)
 * 3. Bhavishya Purana (Hastarekha, Angushtha, Manibandha & Anguli Lakshana)
 * 4. Hastasanjeevani & Saravali
 * 5. Classical Chironomy, Chirognomy & Dermatoglyphic Analysis
 */

export const VEDIC_HAND_ELEMENTAL_TYPES = {
  earth: {
    key: "earth",
    nameKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ ಹಸ್ತ (Earth Hand - Square Palm & Sturdy Fingers)",
    nameEn: "Earth Hand (Prithvi - Practical & Resilient)",
    traitsKn: "ಚೌಕಾಕಾರದ ಹಸ್ತ, ದೃಢ ಬೆರಳುಗಳು, ಪ್ರಾಯೋಗಿಕ ಕಾರ್ಯಶೈಲಿ, ಸ್ಥಿರಾಸ್ತಿ ನಿರ್ಮಾಣ, ಕೃಷಿ/ಉದ್ಯಮ ಒಲವು ಹಾಗೂ ಅದ್ಭುತ ಸಹನೆ.",
    traitsEn: "Square palm, sturdy fingers, pragmatic execution, land asset accumulation, grounded endurance and dependability."
  },
  air: {
    key: "air",
    nameKn: "ವಾಯು ತತ್ತ್ವ ಹಸ್ತ (Air Hand - Square Palm & Long Fingers)",
    nameEn: "Air Hand (Vayu - Intellectual & Analytical)",
    traitsKn: "ಚೌಕಾಕಾರದ ಹಸ್ತ, ಉದ್ದನೆಯ ಬೆರಳುಗಳು, ಗಣಿತ-ವಿಜ್ಞಾನ ತೀಕ್ಷ್ಣತೆ, ಸಂವಹನ ಕಲೆ, ಡಿಜಿಟಲ್ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಬೌದ್ಧಿಕ ಅನ್ವೇಷಣೆ.",
    traitsEn: "Square palm, elongated fingers, sharp analytical prowess, communication mastery, digital agility and intellectual foresight."
  },
  fire: {
    key: "fire",
    nameKn: "ಅಗ್ನಿ ತತ್ತ್ವ ಹಸ್ತ (Fire Hand - Long Palm & Short Fingers)",
    nameEn: "Fire Hand (Agni - Dynamic & Executive)",
    traitsKn: "ಉದ್ದನೆಯ ಹಸ್ತ, ಚುರುಕಾದ ಬೆರಳುಗಳು, ನಾಯಕತ್ವ, ಅದಮ್ಯ ಉತ್ಸಾಹ, ಸಾಹಸ ಪ್ರವೃತ್ತಿ ಹಾಗೂ ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಸಾಮರ್ಥ್ಯ.",
    traitsEn: "Long palm, energetic fingers, charismatic leadership, vibrant vitality, adventurous drive and decisive courage."
  },
  water: {
    key: "water",
    nameKn: "ಜಲ ತತ್ತ್ವ ಹಸ್ತ (Water Hand - Long Palm & Long Slender Fingers)",
    nameEn: "Water Hand (Jala - Intuitive & Empathetic)",
    traitsKn: "ಉದ್ದನೆಯ ಸುಂದರ ಹಸ್ತ, ಸೂಕ್ಷ್ಮ ಬೆರಳುಗಳು, ಅಗಾಧ ಅಂತಃಸ್ಫೂರ್ತಿ, ಕಲಾ ಪ್ರೇಮ, ಕರುಣೆ ಹಾಗೂ ಸಾತ್ವಿಕ ದೈವಿಕ ಮನಸ್ಸು.",
    traitsEn: "Long palm, slender fingers, deep intuitive foresight, artistic imagination, spiritual empathy and compassionate soul."
  },
  sankirna: {
    key: "sankirna",
    nameKn: "ಸಂಕೀರ್ಣ ರಾಜ ಹಸ್ತ (Royal Mixed Hand - Conical & Broad)",
    nameEn: "Royal Mixed Hand (Sankirna - Balanced & Noble)",
    traitsKn: "ರಾಜಲಕ್ಷಣ ಯುಕ್ತ ಹಸ್ತ, ಸಮತೋಲಿತ ರೇಖೆಗಳು, ಸಕಲ ಸುಖ ಭೋಗ, ವಾಹನ ಸೌಭಾಗ್ಯ, ಆಡಳಿತಾತ್ಮಕ ಹಿರಿಮೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿ.",
    traitsEn: "Balanced royal contours, harmony of Rajas and Sattva, luxury conveyances, administrative nobility and widespread public honor."
  }
};

export const VEDIC_ANGUSHTHA_THUMB_RULES = {
  firstPhalanx: {
    nameKn: "ಪ್ರಥಮ ಪರ್ವ (ಇಚ್ಛಾ ಶಕ್ತಿ - Willpower)",
    nameEn: "1st Phalanx (Willpower & Determination)",
    meaningKn: "ದೃಢವಾದ ಪ್ರಥಮ ಪರ್ವವು ಅಚಲ ಸಂಕಲ್ಪ, ನಾಯಕತ್ವ ಹಾಗೂ ಅಡೆತಡೆಗಳನ್ನು ಮೆಟ್ಟಿ ನಿಲ್ಲುವ ಅದ್ಭುತ ಆಡಳಿತಾತ್ಮಕ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.",
    meaningEn: "A strong, well-formed first phalanx grants unyielding willpower, decisive action, and leadership execution."
  },
  secondPhalanx: {
    nameKn: "ದ್ವಿತೀಯ ಪರ್ವ (ತರ್ಕ ಶಕ್ತಿ - Logic & Reason)",
    nameEn: "2nd Phalanx (Logic & Strategic Judgment)",
    meaningKn: "ಉದ್ದವಾದ ದ್ವಿತೀಯ ಪರ್ವವು ಚಾಣಾಕ್ಷ ತರ್ಕ, ಮುನ್ನೋಟ, ವ್ಯವಹಾರಿಕ ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ನಯವಾದ ಸಂಧಾನ ಕಲೆ ನೀಡುತ್ತದೆ.",
    meaningEn: "A long second phalanx gives sharp logical discernment, strategic foresight, and masterful diplomacy."
  },
  yavaSign: {
    nameKn: "ಯವ / ಬುಧ ರೇಖೆ (ಶಿವ ನೇತ್ರ - Eye of Shiva on Thumb Joint)",
    nameEn: "Yava / Budha Sign (Eye of Shiva on Thumb)",
    meaningKn: "ಹೆಬ್ಬೆರಳಿನ ಸಂಧಿಭಾಗದಲ್ಲಿ ಸಂಪೂರ್ಣ ಮುಚ್ಚಿದ ಯವಾಕಾರದ (ಅಕ್ಕಿ ಕಾಳಿನ) ಚಿಹ್ನೆಯು ಹಠಾತ್ ಧನಾಗಮನ, ಪೂರ್ವಜರ ಆಸ್ತಿ, ಅತೀಂದ್ರಿಯ ಅಂತಃಸ್ಫೂರ್ತಿ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.",
    meaningEn: "A fully formed, closed Yava (barley grain / Eye of Shiva) on the thumb joint guarantees sudden windfalls, ancestral assets, sharp intuition, and divine ancestral protection."
  },
  thumbAngle: {
    nameKn: "ಹೆಬ್ಬೆರಳಿನ ಕೋನ (Thumb Angle & Flexibility)",
    nameEn: "Thumb Flexibility & Independence",
    meaningKn: "೯೦ ಡಿಗ್ರಿಯ ಅಗಲ ಕೋನದ ಹೆಬ್ಬೆರಳು ಉದಾರತೆ ಹಾಗೂ ಸ್ವತಂತ್ರ ನಾಯಕತ್ವ ನೀಡುತ್ತದೆ; ಸ್ವಲ್ಪ ಬಾಗುವ ಬೆರಳು ಹೊಂದಾಣಿಕೆಯ ಸ್ವಭಾವವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    meaningEn: "A 90-degree wide angle signifies generous leadership and independence; supple flexibility indicates adaptive diplomacy."
  }
};

export const VEDIC_MANIBANDHA_WRIST_BRACELETS = [
  {
    bracelet: 1,
    nameKn: "೧ನೇ ಮಣಿಬಂಧ ರೇಖೆ (ಆರೋಗ್ಯ & ಆಯುಷ್ಯ)",
    nameEn: "1st Rascette (Health & Vitality Base)",
    meaningKn: "ಸ್ಪಷ್ಟ ಹಾಗೂ ನಿರಂತರ ಮೊದಲ ರೇಖೆಯು ಬಲವಾದ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ದೃಢ ಕಾಯ ಹಾಗೂ ೨೮-೩೦ ವರ್ಷಗಳ ಆಯುಷ್ಯ ಅಡಿಪಾಯ ನೀಡುತ್ತದೆ.",
    meaningEn: "A clear first bracelet represents robust physical constitution, immune vitality, and foundational longevity."
  },
  {
    bracelet: 2,
    nameKn: "೨ನೇ ಮಣಿಬಂಧ ರೇಖೆ (ಧನ & ಸ್ಥಿರಾಸ್ತಿ)",
    nameEn: "2nd Rascette (Wealth & Financial Prosperity)",
    meaningKn: "ಆಳವಾದ ಎರಡನೇ ರೇಖೆಯು ನಿರಂತರ ಧನಾಗಮನ, ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಆಭರಣ ಯೋಗ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    meaningEn: "A deep second bracelet signifies steady wealth accumulation, real estate ownership, and financial self-reliance."
  },
  {
    bracelet: 3,
    nameKn: "೩ನೇ ಮಣಿಬಂಧ ರೇಖೆ (ರಾಜ ಯೋಗ & ಸಮಾಜ ಕೀರ್ತಿ)",
    nameEn: "3rd Rascette (Raja Yoga & Social Renown)",
    meaningKn: "ಮೂರನೇ ರೇಖೆಯು ಸಮಾಜದಲ್ಲಿ ಗಣ್ಯ ಗೌರವ, ಉನ್ನತ ಅಧಿಕಾರ, ಪ್ರಸಿದ್ಧಿ ಹಾಗೂ ನಾಯಕತ್ವ ಕೀರ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    meaningEn: "A third bracelet bestows social prestige, executive authority, and widespread fame across society."
  },
  {
    bracelet: 4,
    nameKn: "೪ನೇ ಮಣಿಬಂಧ ರೇಖೆ (ಮೋಕ್ಷ & ಶತಾಯುಷ್ಯ)",
    nameEn: "4th Rascette (Moksha & Centenarian Longevity)",
    meaningKn: "ಅತ್ಯಂತ ಅಪರೂಪದ ನಾಲ್ಕನೇ ರೇಖೆಯು ೯೦-೧೦೦ ವರ್ಷಗಳ ಶತಾಯುಷ್ಯ, ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ ಹಾಗೂ ಸಿದ್ಧಿ ಯೋಗ ನೀಡುತ್ತದೆ.",
    meaningEn: "Rare 4th bracelet indicates centenarian longevity, spiritual liberation, and ultimate peace."
  }
];

export const VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT = {
  nameKn: "ಬೃಹತ್ ತ್ರಿಕೋನ & ಧನ ಕೋಶ (The Great Triangle of Wealth / Dhana Trikona)",
  nameEn: "Great Triangle (Brihat Trikona & Wealth Vault)",
  meaningKn: "ಆಯುರ್ ರೇಖೆ, ಬುದ್ಧಿ ರೇಖೆ ಹಾಗೂ ಬುಧ ರೇಖೆಗಳಿಂದ ಆವೃತವಾದ ಸಂಪೂರ್ಣ ಮುಚ್ಚಿದ ತ್ರಿಕೋನವು ಧನ ಉಳಿತಾಯ, ಹೂಡಿಕೆ ವೃದ್ಧಿ ಹಾಗೂ ಶ್ರೀಮಂತಿಕೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಕಾಪಾಡುತ್ತದೆ.",
  meaningEn: "A closed triangle formed by Life, Head, and Mercury lines creates a sacred Wealth Vault, ensuring high savings, financial compounding, and lasting prosperity."
};

export const VEDIC_ANGULI_FINGER_PROPORTIONS = {
  littleFingerMercury: {
    nameKn: "ಕನಿಷ್ಠಿಕಾ ಬೆರಳು (ಬುಧ ತತ್ತ್ವ - Mercury Finger)",
    nameEn: "Little Finger (Mercury Business Acumen)",
    meaningKn: "ಕನಿಷ್ಠಿಕಾ ಬೆರಳು ಅನಾಮಿಕಾ (ಉಂಗುರದ ಬೆರಳಿನ) ಮೇಲಿನ ಗೆರೆಯನ್ನು ದಾಟಿದರೆ, ಅಪ್ರತಿಮ ವ್ಯಾಪಾರ ಬುದ್ಧಿ, ಅಂತಾರಾಷ್ಟ್ರೀಯ ವಾಣಿಜ್ಯ ಹಾಗೂ ವಾಕ್ಚಾತುರ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
    meaningEn: "When the little finger extends past the top crease of the ring finger, it confers exceptional business brilliance, foreign trade success, and eloquent negotiation."
  },
  indexRingBalance: {
    nameKn: "ತರ್ಜನಿ vs ಅನಾಮಿಕಾ (Jupiter vs Sun Authority)",
    nameEn: "Index vs Ring Finger Dynamics",
    meaningKn: "ತರ್ಜನಿ ಉದ್ದವಾಗಿದ್ದರೆ ಪ್ರಬಲ ಆಡಳಿತ ನಾಯಕತ್ವ; ಅನಾಮಿಕಾ ಉದ್ದವಾಗಿದ್ದರೆ ಅದ್ಭುತ ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ ಹಾಗೂ ಧೈರ್ಯಶಾಲಿ ಹೂಡಿಕೆ ಸಾಮರ್ಥ್ಯ.",
    meaningEn: "Longer index indicates executive managerial command; longer ring finger indicates artistic creativity and adventurous wealth creation."
  }
};

export const VEDIC_MAJOR_LINES_RULES = {
  lifeLine: {
    nameKn: "ಆಯುರ್ ರೇಖೆ (Life Line / Pitru Rekha)",
    nameEn: "Life Line (Ayur Rekha)",
    descriptions: {
      deep_and_long: {
        status: "ದೀರ್ಘ, ಆಳವಾದ ಹಾಗೂ ಸುಂದರ ಕಮಾನಿನ ಆಯುರ್ ರೇಖೆ",
        indication: "ಅತ್ಯುತ್ತಮ ಪ್ರಾಣಶಕ್ತಿ, ದೃಢ ಆರೋಗ್ಯ ಹಾಗೂ ೮೫+ ವರ್ಷಗಳ ಸುದೀರ್ಘ ಆಯುಷ್ಯ ಯೋಗ."
      },
      upward_branches: {
        status: "ಗುರು ಪರ್ವತದತ್ತ ಏರುವ ಶುಭ ಶಾಖಾ ರೇಖೆಗಳು (Ascending Effort Lines)",
        indication: "ಅಭಿಲಾಷಾ ಸಿದ್ಧಿ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ನಿರಂತರ ಪದೋನ್ನತಿ."
      },
      mars_sister_line: {
        status: "ಕುಜ ರಕ್ಷಾ ರೇಖೆ (Guardian Sister Line / Mars Line)",
        indication: "ಅಪಘಾತ ಹಾಗೂ ಗಂಡಾಂತರಗಳಿಂದ ದೈವಿಕ ರಕ್ಷಣೆ ನೀಡುವ ಕುಜ ಕವಚ ಯೋಗ."
      },
      forked_at_base: {
        status: "ಮಣಿಕಟ್ಟಿನ ಬಳಿ ದ್ವಿಮುಖ ಕವಲೊಡೆಯುವ ರೇಖೆ (Travel & Peace)",
        indication: "ವಿದೇಶ ಪ್ರವಾಸ, ದೂರದ ಊರುಗಳಲ್ಲಿ ಭಾಗ್ಯೋದಯ ಹಾಗೂ ಪ್ರಶಾಂತ ನಿವೃತ್ತಿ ಜೀವನ."
      }
    }
  },
  headLine: {
    nameKn: "ಮಸ್ತಿಷ್ಕ ರೇಖೆ / ಬುದ್ಧಿ ರೇಖೆ (Head Line / Matru Rekha)",
    nameEn: "Head Line (Buddhi Rekha)",
    descriptions: {
      straight_upper_mars: {
        status: "ನೇರವಾಗಿ ಉನ್ನತ ಕುಜ ಪರ್ವತದತ್ತ ಸಾಗುವ ಬುದ್ಧಿ ರೇಖೆ",
        indication: "ಪ್ರಾಯೋಗಿಕ ನಿರ್ಧಾರ, ತಾಂತ್ರಿಕ/ವ್ಯವಹಾರಿಕ ಚಾಣಾಕ್ಷತೆ ಹಾಗೂ ಅದ್ಭುತ ಲೆಕ್ಕಾಚಾರ ಬುದ್ಧಿ."
      },
      sloping_moon: {
        status: "ಚಂದ್ರ ಪರ್ವತದತ್ತ ಇಳಿಯುವ ಕಲಾತ್ಮಕ ರೇಖೆ",
        indication: "ಅಗಾಧ ಕಲ್ಪನಾಶಕ್ತಿ, ಲೇಖಕ/ಸಂಶೋಧನಾ ಪ್ರತಿಭೆ ಹಾಗೂ ತತ್ವಶಾಸ್ತ್ರಜ್ಞ ಚಿಂತನೆ."
      },
      writers_fork: {
        status: "ದ್ವಿಮುಖ ಬುದ್ಧಿ ರೇಖೆ (Writer's Fork / Vyapara Mukha)",
        indication: "ವಾಣಿಜ್ಯ ಹಾಗೂ ಸೃಜನಶೀಲ ಕಲೆಗಳೆರಡರಲ್ಲೂ ಉನ್ನತ ಸಾಧನೆ ಮಾಡುವ ಅದ್ಭುತ ಪ್ರತಿಭೆ."
      },
      independent_origin: {
        status: "ಆಯುರ್ ರೇಖೆಯಿಂದ ಸ್ವತಂತ್ರವಾಗಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಉದಯಿಸುವ ರೇಖೆ",
        indication: "ಅತ್ಯಂತ ಮುಕ್ತ, ಸ್ವತಂತ್ರ, ನಾವೀನ್ಯತಾ ಚಿಂತನೆ ಹಾಗೂ ಧೈರ್ಯಶಾಲಿ ನಿರ್ಧಾರಗಳು."
      }
    }
  },
  heartLine: {
    nameKn: "ಹೃದಯ ರೇಖೆ (Heart Line / Ayu Rekha)",
    nameEn: "Heart Line (Hridaya Rekha)",
    descriptions: {
      reaches_jupiter: {
        status: "ಗುರು ಪರ್ವತದ ಸನ್ನಿಧಿಗೆ ತಲುಪುವ ಸಾತ್ವಿಕ ಹೃದಯ ರೇಖೆ",
        indication: "ಉದಾತ್ತ ಆದರ್ಶಗಳು, ನಿಷ್ಠಾವಂತ ಪ್ರೇಮ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಆದರ್ಶ ದಾಂಪತ್ಯ ಸೌಖ್ಯ."
      },
      ends_between_jupiter_saturn: {
        status: "ತರ್ಜನಿ ಮತ್ತು ಮಧ್ಯಮಾ ಬೆರಳುಗಳ ಮಧ್ಯೆ ಕೊನೆಗೊಳ್ಳುವ ರೇಖೆ",
        indication: "ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ, ಪ್ರಾಯೋಗಿಕ ಪ್ರೀತಿ ಹಾಗೂ ಕುಟುಂಬದ ಮೇಲಿನ ಅಚಲ ಪ್ರೇಮ."
      },
      guru_trishula: {
        status: "ಗುರು ಪರ್ವತದಲ್ಲಿ ತ್ರಿಶೂಲಾಕಾರವಾಗಿ ಕವಲೊಡೆಯುವ ರೇಖೆ (Trident on Jupiter)",
        indication: "ಸಾರ್ವಭೌಮ ಗೌರವ, ಲಕ್ಷ್ಮೀ-ಸರಸ್ವತಿ ಕೃಪೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕವಾಗಿ ಶಾಶ್ವತ ಕೀರ್ತಿ."
      },
      simian_line: {
        status: "ಏಕ ರೇಖಾ ಯೋಗ (Simian Line / Gaja Lakshana)",
        indication: "ಏಕಾಗ್ರತೆಯ ಮಹಾ ಶಕ್ತಿ, ಅಚಲ ಸಂಕಲ್ಪ ಹಾಗೂ ಅಸಾಧ್ಯ ಗುರಿಗಳನ್ನು ಸಾಧಿಸುವ ಛಲ."
      }
    }
  },
  fateLine: {
    nameKn: "ಭಾಗ್ಯ ರೇಖೆ / ಶನಿ ರೇಖೆ (Fate Line / Shani Rekha)",
    nameEn: "Fate Line (Shani Rekha)",
    descriptions: {
      from_wrist_to_saturn: {
        status: "ಮಣಿಕಟ್ಟಿನಿಂದ ನೇರವಾಗಿ ಶನಿ ಪರ್ವತಕ್ಕೆ ಸಾಗುವ ರೇಖೆ",
        indication: "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ ಹಾಗೂ ನಿರಂತರ ಭಾಗ್ಯೋದಯ."
      },
      from_moon_mount: {
        status: "ಚಂದ್ರ ಪರ್ವತದಿಂದ ಉದಯಿಸುವ ಭಾಗ್ಯ ರೇಖೆ",
        indication: "ಸಾರ್ವಜನಿಕ ಪ್ರೀತಿ, ದೂರದೂರದ ಜನರಿಂದ ಸಹಕಾರ, ವಿವಾಹದ ನಂತರ ಧನಲಾಭ ಹಾಗೂ ವಿದೇಶ ಸಂಪತ್ತು."
      },
      from_life_line: {
        status: "ಆಯುರ್ ರೇಖೆಯಿಂದ ಮೇಲೇಳುವ ಭಾಗ್ಯ ರೇಖೆ",
        indication: "೨೮ನೇ ವರ್ಷದ ನಂತರ ಸ್ವಂತ ಬೆವರಿನಿಂದ ಅಪಾರ ಸಂಪತ್ತು ಹಾಗೂ ಕೀರ್ತಿ ಸಂಪಾದನೆ."
      }
    }
  },
  sunLine: {
    nameKn: "ರವಿ ರೇಖೆ / ವಿದ್ಯಾ ರೇಖೆ (Sun Line / Apollo Rekha)",
    nameEn: "Sun Line (Ravi & Vidya Rekha)",
    descriptions: {
      clear_on_sun_mount: {
        status: "ರವಿ ಪರ್ವತದ ಮೇಲೆ ರಾರಾಜಿಸುವ ಪ್ರಕಾಶಮಾನ ರವಿ ರೇಖೆ",
        indication: "ಸಮಾಜದಲ್ಲಿ ಗಣ್ಯ ಗೌರವ, ಉನ್ನತ ಸರಕಾರಿ ಮನ್ನಣೆ, ಕಲಾ ಕೀರ್ತಿ ಹಾಗೂ ಪ್ರಸಿದ್ಧಿ."
      },
      star_on_sun: {
        status: "ರವಿ ಪರ್ವತದ ಮೇಲಿನ ನಕ್ಷತ್ರ (Star on Apollo)",
        indication: "ರಾಷ್ಟ್ರೀಯ ಅಥವಾ ಜಾಗತಿಕ ಮಟ್ಟದ ಅಪ್ರತಿಮ ಖ್ಯಾತಿ ಹಾಗೂ ಉನ್ನತ ಪ್ರಶಸ್ತಿಗಳು."
      }
    }
  },
  mercuryLine: {
    nameKn: "ಬುಧ ರೇಖೆ / ಸ್ವಾಸ್ಥ್ಯ ರೇಖೆ (Mercury Line / Health Line)",
    nameEn: "Mercury Line (Budha & Health Rekha)",
    descriptions: {
      clear_unbroken: {
        status: "ಸ್ಪಷ್ಟ ಹಾಗೂ ನೇರವಾದ ಬುಧ ರೇಖೆ",
        indication: "ಉತ್ತಮ ಜೀರ್ಣ ಶಕ್ತಿ, ನರಮಂಡಲದ ಚುರುಕುತನ, ವಾಕ್ ಸಿದ್ಧಿ ಹಾಗೂ ವ್ಯಾಪಾರ ಯಶಸ್ಸು."
      }
    }
  },
  marriageLine: {
    nameKn: "ವಿವಾಹ ರೇಖೆ (Marriage Line on Mercury Mount)",
    nameEn: "Marriage Line (Vivaha Rekha)",
    descriptions: {
      straight_and_deep: {
        status: "ಸ್ಪಷ್ಟ, ಆಳವಾದ ಹಾಗೂ ಸುಂದರ ಕೆಂಪು ಛಾಯೆಯ ವಿವಾಹ ರೇಖೆ",
        indication: "ಸುಸಂಸ್ಕೃತ, ಪ್ರೇಮಮಯಿ ಹಾಗೂ ಜೀವಮಾನವಿಡೀ ಜೊತೆಗಿಡುವ ನಿಷ್ಠಾವಂತ ಸಂಗಾತಿ."
      },
      upward_to_sun: {
        status: "ರವಿ ಪರ್ವತದತ್ತ ಬಾಗುವ ವಿವಾಹ ರೇಖೆ",
        indication: "ಶ್ರೀಮಂತ ಹಾಗೂ ಪ್ರಸಿದ್ಧ ಕುಟುಂಬದ ಸಂಗಾತಿಯೊಂದಿಗೆ ವಿವಾಹ ಭಾಗ್ಯ."
      }
    }
  }
};

export const VEDIC_MOUNTS_RULES = {
  jupiter: {
    nameKn: "ಗುರು ಪರ್ವತ (Mount of Jupiter)",
    nameEn: "Mount of Jupiter (Guru Parvata)",
    virtuesKn: "ನಾಯಕತ್ವ, ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ, ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ ಹಾಗೂ ಸಮಾಜದ ಮಾರ್ಗದರ್ಶನ."
  },
  saturn: {
    nameKn: "ಶನಿ ಪರ್ವತ (Mount of Saturn)",
    nameEn: "Mount of Saturn (Shani Parvata)",
    virtuesKn: "ಗಂಭೀರ ಚಿಂತನೆ, ಗಣಿಗಾರಿಕೆ/ಭೂಮಿ ಯೋಗ, ದೀರ್ಘ ಸಂಶೋಧನೆ ಹಾಗೂ ಶಿಸ್ತುಬದ್ಧ ಸಂಪತ್ತು."
  },
  sun: {
    nameKn: "ರವಿ ಪರ್ವತ (Mount of Sun / Apollo)",
    nameEn: "Mount of Sun (Ravi Parvata)",
    virtuesKn: "ರಾಜಕೀಯ ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ, ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ತೇಜಸ್ವಿ ಯಶಸ್ಸು."
  },
  mercury: {
    nameKn: "ಬುಧ ಪರ್ವತ (Mount of Mercury)",
    nameEn: "Mount of Mercury (Budha Parvata)",
    virtuesKn: "ವಾಣಿಜ್ಯ ಚಾತುರ್ಯ, ವಾಕ್ ಸಿದ್ಧಿ, ಗಣಿತ ಜ್ಞಾನ ಹಾಗೂ ವೈದ್ಯಕೀಯ/ಕೌನ್ಸೆಲಿಂಗ್ ಶಕ್ತಿ."
  },
  venus: {
    nameKn: "ಶುಕ್ರ ಪರ್ವತ (Mount of Venus)",
    nameEn: "Mount of Venus (Shukra Parvata)",
    virtuesKn: "ಸೌಂದರ್ಯ, ರಮ್ಯ ಪ್ರೇಮ, ವಾಹನ ಸೌಭಾಗ್ಯ, ಕಲಾ ರಸಿಕತೆ ಹಾಗೂ ಸಕಲ ಭೋಗಗಳು."
  },
  moon: {
    nameKn: "ಚಂದ್ರ ಪರ್ವತ (Mount of Moon)",
    nameEn: "Mount of Moon (Chandra Parvata)",
    virtuesKn: "ಅಂತಃಸ್ಫೂರ್ತಿ, ಕಲ್ಪನಾ ಶಕ್ತಿ, ಜಲ/ವಿದೇಶ ಪ್ರವಾಸ ಹಾಗೂ ಕಾವ್ಯ ರಚನಾ ಶಕ್ತಿ."
  },
  upperMars: {
    nameKn: "ಉನ್ನತ ಕುಜ ಪರ್ವತ (Upper Mars - Resilience)",
    nameEn: "Upper Mars (Moral Fortitude & Crisis Mastery)",
    virtuesKn: "ಮಾನಸಿಕ ಧೈರ್ಯ, ಬಿಕ್ಕಟ್ಟಿನಲ್ಲಿ ತಾಳ್ಮೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಅಚಲ ಸ್ಥೈರ್ಯ."
  },
  lowerMars: {
    nameKn: "ನಿಮ್ನ ಕುಜ ಪರ್ವತ (Lower Mars - Physical Courage)",
    nameEn: "Lower Mars (Physical Valour & Sports)",
    virtuesKn: "ಶಾರೀರಿಕ ಸಾಹಸ, ಕ್ರೀಡಾ ಪಟುತ್ವ, ರಕ್ಷಣಾ ಶಕ್ತಿ ಹಾಗೂ ಶತ್ರು ಜಯ."
  }
};

export const VEDIC_HASTAREKHA_SACRED_YOGAS = [
  {
    yogaNameKn: "ಗಜಕೇಸರಿ ಯೋಗ (Gaja Kesari Yoga in Palm)",
    yogaNameEn: "Gaja Kesari Yoga",
    formationKn: "ಉನ್ನತ ಗುರು ಪರ್ವತ + ಚಂದ್ರ ಪರ್ವತದತ್ತ ಸುಂದರವಾಗಿ ಬಾಗುವ ಉದ್ದನೆಯ ಬುದ್ಧಿ ರೇಖೆ.",
    fruitKn: "ಸಾರ್ವಜನಿಕ ಪ್ರಭಾವ, ಪಾಂಡಿತ್ಯ, ಅಪ್ರತಿಮ ವಾಗ್ಮಿತ್ವ ಹಾಗೂ ಧಾರ್ಮಿಕ ಗೌರವ."
  },
  {
    yogaNameKn: "ಲಕ್ಷ್ಮೀ ಯೋಗ (Lakshmi Yoga in Palm)",
    yogaNameEn: "Lakshmi Wealth Yoga",
    formationKn: "ಗುಲಾಬಿ ಬಣ್ಣದ ಕಾಂತಿಯುತ ಹಸ್ತ + ಕೇತುವಿನಲ್ಲಿ ಮತ್ಸ್ಯ ಚಿಹ್ನೆ + ಮುಚ್ಚಿದ ಬೃಹತ್ ತ್ರಿಕೋನ.",
    fruitKn: "ನಿರಂತರ ಧನಾಗಮನ, ಚಿನ್ನಾಭರಣ ಸಂಗ್ರಹ, ಐಷಾರಾಮಿ ವಾಹನ ಹಾಗೂ ಸಕಲ ಸುಖ ಸಂಪತ್ತು."
  },
  {
    yogaNameKn: "ಸರಸ್ವತೀ ಯೋಗ (Saraswati Wisdom Yoga)",
    yogaNameEn: "Saraswati Intellectual Yoga",
    formationKn: "ಗುರು ಮುದ್ರಿಕಾ (Ring of Solomon) + ದ್ವಿಮುಖ ಬುದ್ಧಿ ರೇಖೆ + ಬಲಯುತ ಬುಧ ರೇಖೆ.",
    fruitKn: "ಲೇಖನ, ಸಂಶೋಧನೆ, ಬೋಧನೆ, ಜ್ಯೋತಿಷ್ಯ ಹಾಗೂ ಉನ್ನತ ವಿದ್ಯಾ ಸಿದ್ಧಿ."
  },
  {
    yogaNameKn: "ಭೂಮಿ ಯೋಗ (Bhoomi Yoga - Real Estate)",
    yogaNameEn: "Bhoomi Property Yoga",
    formationKn: "ಪೃಥ್ವಿ ಚೌಕಾಕಾರದ ಹಸ್ತ + ಆಯುರ್ ರೇಖೆಯ ಒಳಗಿರುವ ಕುಜ ರಕ್ಷಾ ರೇಖೆ + ದೃಢ ಶನಿ ಪರ್ವತ.",
    fruitKn: "ಸ್ವಂತ ಮನೆ ನಿರ್ಮಾಣ, ಕೃಷಿ ಭೂಮಿ ಖರೀದಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿಯಿಂದ ಶಾಶ್ವತ ಆದಾಯ."
  },
  {
    yogaNameKn: "ರಾಜಯೋಗ ಧ್ವಜ (Dhwaja Raja Yoga)",
    yogaNameEn: "Dhwaja Flag Raja Yoga",
    formationKn: "ಸೂರ್ಯ ಅಥವಾ ಗುರು ಪರ್ವತದ ಮೇಲೆ ಧ್ವಜ (Flag) ಅಥವಾ ತ್ರಿಶೂಲ ಚಿಹ್ನೆ.",
    fruitKn: "ಆಡಳಿತಾತ್ಮಕ ಆಜ್ಞಾ ಶಕ್ತಿ, ಉನ್ನತ ಸರಕಾರಿ ಅಧಿಕಾರ ಹಾಗೂ ರಾಷ್ಟ್ರೀಯ ಪ್ರಸಿದ್ಧಿ."
  }
];

export const VEDIC_SACRED_MARKS = {
  matsya: {
    nameKn: "ಮತ್ಸ್ಯ ಚಿಹ್ನೆ (Fish Symbol on Ketu/Wrist)",
    nameEn: "Matsya Sign (Fish Symbol)",
    meaningKn: "ಕೇತು ಅಥವಾ ಮಣಿಕಟ್ಟಿನ ಬಳಿ ಮತ್ಸ್ಯ ಚಿಹ್ನೆಯು ಆಕಸ್ಮಿಕ ಮಹಾ ಧನಲಾಭ, ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ ಹಾಗೂ ಜೀವನದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಅಪಾರ ಯಶಸ್ಸು ನೀಡುತ್ತದೆ.",
    meaningEn: "Fish mark on Ketu/Wrist guarantees sudden massive fortune, spiritual liberation, and extraordinary late-life success."
  },
  trishula: {
    nameKn: "ತ್ರಿಶೂಲ ಚಿಹ್ನೆ (Trident Mark on Jupiter/Saturn/Sun)",
    nameEn: "Trishula (Sacred Trident Mark)",
    meaningKn: "ಗುರು, ಶನಿ ಅಥವಾ ಸೂರ್ಯ ಪರ್ವತದ ಮೇಲಿನ ತ್ರಿಶೂಲವು ಶ್ರೀ ಮಹಾದೇವನ ಪರಮ ರಕ್ಷಣೆ, ಸರ್ವಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಸಾರ್ವಭೌಮ ನಾಯಕತ್ವ ನೀಡುತ್ತದೆ.",
    meaningEn: "Trident on Jupiter/Saturn/Sun mount grants divine Shiva grace, triumph over obstacles, and sovereign authority."
  },
  mysticCross: {
    nameKn: "ರಹಸ್ಯ ಸ್ವಸ್ತಿಕ / ಮಿಸ್ಟಿಕ್ ಕ್ರಾಸ್ (Mystic Cross / Rahasya Karta)",
    nameEn: "Mystic Cross (Quadrangle Intuition Mark)",
    meaningKn: "ಹೃದಯ ಹಾಗೂ ಮಸ್ತಿಷ್ಕ ರೇಖೆಗಳ ಮಧ್ಯೆ ಇರುವ ರಹಸ್ಯ ಕ್ರಾಸ್ ಪ್ರಬಲ ೬ನೇ ಇಂದ್ರಿಯ (Sixth Sense), ಜ್ಯೋತಿಷ್ಯ-ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ ಹಾಗೂ ದೈವಿಕ ಮುನ್ನೋಟ ನೀಡುತ್ತದೆ.",
    meaningEn: "The Mystic Cross between Heart and Head lines bestows sharp sixth sense intuition, occult mastery, and prophetic foresight."
  },
  ringOfSolomon: {
    nameKn: "ಗುರು ಮುದ್ರಿಕಾ / ಸಾಲೋಮನ್ ರಿಂಗ್ (Ring of Solomon / Guru Mudrika)",
    nameEn: "Ring of Solomon (Guru Mudrika)",
    meaningKn: "ಗುರು ಪರ್ವತವನ್ನು ಸುತ್ತುವರೆದ ಮುದ್ರಿಕೆಯು ಅಪ್ರತಿಮ ಮನೋವೈಜ್ಞಾನಿಕ ಗ್ರಹಣ, ಗುರು ಪದವಿ ಹಾಗೂ ನ್ಯಾಯಪರ ವ್ಯಕ್ತಿತ್ವವನ್ನು ನೀಡುತ್ತದೆ.",
    meaningEn: "Semi-circular ring on Jupiter indicates natural counseling wisdom, psychological depth, and high moral standing."
  },
  padma: {
    nameKn: "ಪದ್ಮ ಚಿಹ್ನೆ (Lotus Sign of Mahalakshmi)",
    nameEn: "Padma Sign (Lotus of Prosperity)",
    meaningKn: "ಲಕ್ಷ್ಮೀ ಕೃಪೆ, ಪವಿತ್ರ ಜೀವನ, ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಆದರ್ಶ ಹಾಗೂ ರಾಜಸಮ್ಮಾನ.",
    meaningEn: "Lotus mark indicates purity of character, Goddess Lakshmi's blessing, and royal esteem."
  },
  gopura: {
    nameKn: "ಗೋಪುರ / ಮಂದಿರ ಚಿಹ್ನೆ (Temple Mark)",
    nameEn: "Gopura / Temple Sign",
    meaningKn: "ದೇವತಾ ಸಾನ್ನಿಧ್ಯ, ದಾನ-ಧರ್ಮ ಪ್ರವೃತ್ತಿ, ಭೂಮಿದಾನ ಹಾಗೂ ಧಾರ್ಮಿಕ ಸಂಸ್ಥೆಗಳ ನೇತೃತ್ವ.",
    meaningEn: "Temple/Gopura mark indicates profound piety, philanthropic land endowments, and sacred leadership."
  }
};
