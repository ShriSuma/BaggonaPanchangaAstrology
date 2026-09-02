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

/** 5-Language Planet Names Dictionary */
export const PLANET_NAMES_L5: Record<string, Record<string, string>> = {
  Sun: { kn: "ಸೂರ್ಯ (ರವಿ)", en: "Sun (Surya)", hi: "सूर्य (रवि)", te: "సూర్యుడు (రవి)", ta: "சூரியன் (ரவி)" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  Mars: { kn: "ಕುಜ (ಮಂಗಳ)", en: "Mars (Kuja)", hi: "मंगल (कुज)", te: "కుజుడు (మంగళ)", ta: "செவ்வாய் (குஜன்)" },
  Mercury: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  Jupiter: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", en: "Jupiter (Guru)", hi: "बृहस्पति (गुरु)", te: "గురుడు (బృహస్పతి)", ta: "குரு (வியாழன்)" },
  Venus: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன் (வெள்ளி)" },
  Saturn: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनಿ", te: "శని", ta: "சனி" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" }
};

export type LocalizedMountDefinition = {
  id: string;
  planetKey: string;
  name: Record<string, string>;
  planetName: Record<string, string>;
  finger: Record<string, string>;
  chakra: Record<string, string>;
  gemstone: Record<string, string>;
  baseEnergy: number;
  virtues: Record<string, string>;
};

export const VEDIC_7_MOUNTS_CATALOG: LocalizedMountDefinition[] = [
  {
    id: "jupiter",
    planetKey: "Jupiter",
    name: {
      kn: "೧. ಗುರು ಪರ್ವತ (Mount of Jupiter)",
      en: "1. Mount of Jupiter (Guru Parvata)",
      hi: "१. गुरु पर्वत (बृहस्पति)",
      te: "1. గురు పర్వతం (బృహస్పతి)",
      ta: "1. குரு மேடு (வியாழன்)"
    },
    planetName: {
      kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
      en: "Jupiter (Guru)",
      hi: "बृहस्पति (गुरु)",
      te: "గురుడు",
      ta: "குரு"
    },
    finger: {
      kn: "ತರ್ಜನಿ (ತೋರುಬೆರಳು)",
      en: "Index Finger (Tarjani)",
      hi: "तर्जनी (प्रथम अंगुली)",
      te: "తర్జని (చూపుడు వేలు)",
      ta: "சுட்டு விரல் (தர்ஜனி)"
    },
    chakra: {
      kn: "ಆಜ್ಞಾ ಚಕ್ರ (Third Eye)",
      en: "Ajna Chakra (Third Eye)",
      hi: "आज्ञा चक्र",
      te: "ఆజ్ఞా చక్రం",
      ta: "ஆக்ஞா சக்கரம்"
    },
    gemstone: {
      kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
      en: "Yellow Sapphire (Pushparaga)",
      hi: "पुखराज (Yellow Sapphire)",
      te: "పుష్యరాగం",
      ta: "புஷ்பராகம்"
    },
    baseEnergy: 91,
    virtues: {
      kn: "ಅತ್ಯುನ್ನತ ನಾಯಕತ್ವ, ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ, ಧರ್ಮನಿಷ್ಠೆ, ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಪ್ರಭಾವ.",
      en: "Executive leadership, spiritual wisdom, righteous governance, moral authority and widespread social reverence.",
      hi: "उच्च नेतृत्व, आध्यात्मिक ज्ञान, धर्मनिष्ठा, सामाजिक मार्गदर्शन एवं कीर्ति।",
      te: "ఉన్నత నాయకత్వం, ఆధ్యాత్మిక జ్ఞానం, ధర్మనిష్ఠ & సమాజంలో గౌరవం.",
      ta: "தலைமைப் பண்பு, ஆன்மீக ஞானம், தர்ம சிந்தனை மற்றும் சமூகத்தில் உயரிய மதிப்பு."
    }
  },
  {
    id: "saturn",
    planetKey: "Saturn",
    name: {
      kn: "೨. ಶನಿ ಪರ್ವತ (Mount of Saturn)",
      en: "2. Mount of Saturn (Shani Parvata)",
      hi: "२. शनि पर्वत",
      te: "2. శని పర్వతం",
      ta: "2. சனி மேடு"
    },
    planetName: {
      kn: "ಶನಿ (ಮಂದ)",
      en: "Saturn (Shani)",
      hi: "शनि देव",
      te: "శని దేవుడు",
      ta: "சனி பகவான்"
    },
    finger: {
      kn: "ಮಧ್ಯಮಾ (ನಡುಬೆರಳು)",
      en: "Middle Finger (Madhyama)",
      hi: "मध्यमा अंगुली",
      te: "మధ్యమ వేలు",
      ta: "நடு விரல் (மத்யமா)"
    },
    chakra: {
      kn: "ಮೂಲಾಧಾರ ಚಕ್ರ (Root Chakra)",
      en: "Muladhara Chakra (Root)",
      hi: "मूलाधार चक्र",
      te: "మూలాధార చక్రం",
      ta: "மூலாதார சக்கரம்"
    },
    gemstone: {
      kn: "ಇಂದ್ರನೀಲ (Blue Sapphire)",
      en: "Blue Sapphire (Indraneela)",
      hi: "नीलम (Blue Sapphire)",
      te: "ఇంద్రనీలం",
      ta: "நீலக்கல் (இந்திரநீலம்)"
    },
    baseEnergy: 85,
    virtues: {
      kn: "ಶಿಸ್ತು, ತಾಳ್ಮೆ, ಗಂಭೀರ ಸಂಶೋಧನೆ, ಸ್ಥಿರಾಸ್ತಿ ಯೋಗ, ನ್ಯಾಯನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಸುಭದ್ರ ಯಶಸ್ಸು.",
      en: "Deep discipline, perseverance, profound research acumen, land assets and enduring financial stability.",
      hi: "गंभीर अनुशासन, धैर्य, भूमि-भवन लाभ, न्यायप्रियता एवं दीर्घकालिक स्थायी सफलता।",
      te: "క్రమశిక్షణ, సహనం, భూమి యోగం & దీర్ఘకాలిక ఆర్థిక స్థిరత్వం.",
      ta: "ஒழுக்கம், பொறுமை, நில சொத்து யோகம் மற்றும் நீடித்த நிலையான வெற்றி."
    }
  },
  {
    id: "sun",
    planetKey: "Sun",
    name: {
      kn: "೩. ಸೂರ್ಯ ಪರ್ವತ (Mount of Sun / Apollo)",
      en: "3. Mount of Sun (Apollo Parvata)",
      hi: "३. सूर्य पर्वत (अपोलो)",
      te: "3. సూర్య పರ್ವతం (అపోలో)",
      ta: "3. சூரிய மேடு"
    },
    planetName: {
      kn: "ಸೂರ್ಯ (ರವಿ)",
      en: "Sun (Surya)",
      hi: "सूर्य नारायण",
      te: "సూర్యుడు",
      ta: "சூரியன்"
    },
    finger: {
      kn: "ಅನಾಮಿಕಾ (ಉಂಗುರದ ಬೆರಳು)",
      en: "Ring Finger (Anamika)",
      hi: "अनामिका अंगुली",
      te: "అనామిక (ఉంగరపు వేలు)",
      ta: "மோதிர விரல் (அநாமிகா)"
    },
    chakra: {
      kn: "ಮಣಿಪೂರ ಚಕ್ರ (Solar Plexus)",
      en: "Manipura Chakra (Solar Plexus)",
      hi: "मणिपूर चक्र",
      te: "మణిపూరక చక్రం",
      ta: "மணிப்பூரக சக்கரம்"
    },
    gemstone: {
      kn: "ಮಾಣಿಕ್ಯ (Ruby)",
      en: "Ruby (Manikya)",
      hi: "माणिक्य (Ruby)",
      te: "మాణిక్యం",
      ta: "மாணிக்கம்"
    },
    baseEnergy: 89,
    virtues: {
      kn: "ತೇಜಸ್ಸು, ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ, ಸರಕಾರಿ ಅಥವಾ ಉನ್ನತ ಸಂಸ್ಥೆಗಳ ಮನ್ನಣೆ ಹಾಗೂ ರಾಜ ಸನ್ಮಾನ.",
      en: "Radiance, fame, artistic genius, governmental honours, executive recognition and aristocratic dignity.",
      hi: "तेजस्विता, उच्च यश, कलात्मक दृष्टि, राजकीय सम्मान एवं समाज में सर्वोच्च प्रतिष्ठा।",
      te: "తేజస్సు, కీర్తి, కళాత్మక ప్రతిభ, ప్రభుత్వ గౌరవం & సన్మానం.",
      ta: "ஒளிமயமான ஆளுமை, புகழ், கலைத்திறன் மற்றும் அரச அங்கீகாரம்."
    }
  },
  {
    id: "mercury",
    planetKey: "Mercury",
    name: {
      kn: "೪. ಬುಧ ಪರ್ವತ (Mount of Mercury)",
      en: "4. Mount of Mercury (Budha Parvata)",
      hi: "४. बुध पर्वत",
      te: "4. బుధ పರ್ವతం",
      ta: "4. புதன் மேடு"
    },
    planetName: {
      kn: "ಬುಧ",
      en: "Mercury (Budha)",
      hi: "बुध देव",
      te: "బుధుడు",
      ta: "புதன்"
    },
    finger: {
      kn: "ಕನಿಷ್ಠಿಕಾ (ಕಿರುಬೆರಳು)",
      en: "Little Finger (Kanishthika)",
      hi: "कनिष्ठिका (छोटी अंगुली)",
      te: "కనిష్ఠిక (చిటికెన వేలు)",
      ta: "சுண்டு விரல் (கனிஷ்டிகா)"
    },
    chakra: {
      kn: "ವಿಶುದ್ಧ ಚಕ್ರ (Throat Chakra)",
      en: "Vishuddha Chakra (Throat)",
      hi: "विशुद्ध चक्र",
      te: "విశుద్ధ చక్రం",
      ta: "விசுத்தி சக்கரம்"
    },
    gemstone: {
      kn: "ಪಚ್ಚೆ (Emerald)",
      en: "Emerald (Marakata / Panna)",
      hi: "पन्ना (Emerald)",
      te: "మరకతం (పచ్చ)",
      ta: "மரகதம்"
    },
    baseEnergy: 87,
    virtues: {
      kn: "ವಾಕ್ ಸಿದ್ಧಿ, ವಾಣಿಜ್ಯ ಚಾಣಾಕ್ಷತೆ, ಗಣಿತ ವಿಶ್ಲೇಷಣೆ, ನರಮಂಡಲದ ಚುರುಕುತನ ಹಾಗೂ ಪರಿಣಾಮಕಾರಿ ಸಂವಹನ ಕಲೆ.",
      en: "Eloquent speech, commercial genius, mathematical analytical acumen, nervous agility and persuasion power.",
      hi: "वाक् सिद्धि, व्यापार चातुर्य, वित्तीय विश्लेषण, तीक्ष्ण बुद्धि एवं सम्मोहन संचार कला।",
      te: "వాక్చాతుర్యం, వ్యాపార ప్రజ్ఞ, విశ్లేషణాత్మక శక్తి & సమాచార కమ్యూనికేషన్.",
      ta: "பேச்சாற்றல், வர்த்தக புத்தி கூர்மை, கணித அறிவு மற்றும் திறம்பட பேசும் கலை."
    }
  },
  {
    id: "venus",
    planetKey: "Venus",
    name: {
      kn: "೫. ಶುಕ್ರ ಪರ್ವತ (Mount of Venus)",
      en: "5. Mount of Venus (Shukra Parvata)",
      hi: "५. शुक्र पर्वत",
      te: "5. శుక్ర పರ್ವతం",
      ta: "5. சுக்கிர மேடு"
    },
    planetName: {
      kn: "ಶುಕ್ರ",
      en: "Venus (Shukra)",
      hi: "शुक्राचार्य (शुक्र)",
      te: "శుక్రుడు",
      ta: "சுக்கிரன்"
    },
    finger: {
      kn: "ಅಂಗುಷ್ಠ ಮೂಲ (ಹೆಬ್ಬೆರಳಿನ ಬುಡ)",
      en: "Thumb Base (Angushtha Mula)",
      hi: "अंगूठे का आधार",
      te: "బొటనవేలి మూలం",
      ta: "பெருவிரல் அடிவாரம்"
    },
    chakra: {
      kn: "ಸ್ವಾಧಿಷ್ಠಾನ ಚಕ್ರ (Sacral Chakra)",
      en: "Svadhisthana Chakra (Sacral)",
      hi: "स्वाधिष्ठान चक्र",
      te: "స్వాధిష్ఠాన చక్రం",
      ta: "சுவாதிஷ்டான சக்கரம்"
    },
    gemstone: {
      kn: "ವಜ್ರ / ಬಿಳಿ ನೀಲ (Diamond / White Zircon)",
      en: "Diamond / White Sapphire (Vajra)",
      hi: "हीरा / श्वेत पुखराज (Diamond)",
      te: "వజ్రం",
      ta: "வைரம்"
    },
    baseEnergy: 90,
    virtues: {
      kn: "ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ, ವಾಹನ ಸೌಭಾಗ್ಯ, ಕಲಾತ್ಮಕ ರಸಿಕತೆ, ದಾಂಪತ್ಯ ಪ್ರೇಮ ಹಾಗೂ ಸಕಲ ಭೌತಿಕ ಸುಖ ಭೋಗಗಳು.",
      en: "Charismatic magnetism, luxury vehicles, artistic aesthetics, marital harmony and bountiful worldly pleasures.",
      hi: "आकर्षक व्यक्तित्व, वाहन सुख, कलात्मक प्रेम, वैवाहिक सौहार्द एवं समस्त भौतिक सुख-समृद्धि।",
      te: "ఆకర్షణీయమైన రూపం, వాహన సౌభాగ్యం, దాంపత్య సుఖం & భోగభాగ్యాలు.",
      ta: "கவர்ச்சியான ஆளுமை, வாகன யோகம், கலை ஆர்வம், இல்லற மகிழ்ச்சி மற்றும் சகல சுகங்கள்."
    }
  },
  {
    id: "moon",
    planetKey: "Moon",
    name: {
      kn: "೬. ಚಂದ್ರ ಪರ್ವತ (Mount of Moon)",
      en: "6. Mount of Moon (Chandra Parvata)",
      hi: "६. चन्द्र पर्वत",
      te: "6. చంద్ర పర్ವతం",
      ta: "6. சந்திர மேடு"
    },
    planetName: {
      kn: "ಚಂದ್ರ",
      en: "Moon (Chandra)",
      hi: "चन्द्र देव",
      te: "చంద్రుడు",
      ta: "சந்திரன்"
    },
    finger: {
      kn: "ಹಸ್ತದ ಕೆಳ ಪಾರ್ಶ್ವ (ಕರತಳ ತಳಭಾಗ)",
      en: "Lower Hypotheanar (Base of Palm)",
      hi: "हथेली का निचला भाग",
      te: "అరచేయి కింది భాగం",
      ta: "உள்ளங்கையின் கீழ் பகுதி"
    },
    chakra: {
      kn: "ಸಹಸ್ರಾರ ಚಕ್ರ (Crown Chakra)",
      en: "Sahasrara Chakra (Crown)",
      hi: "सहस्रार चक्र",
      te: "సహస్రార చక్రం",
      ta: "சகஸ்ரார சக்கரம்"
    },
    gemstone: {
      kn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (Natural Pearl / Mukta)",
      en: "Natural Pearl (Mukta)",
      hi: "सच्चा मोती (Natural Pearl)",
      te: "ముత్యం",
      ta: "இயற்கை முத்து"
    },
    baseEnergy: 84,
    virtues: {
      kn: "ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಅಂತಃಸ್ಫೂರ್ತಿ, ವಿದೇಶ/ತೀರ್ಥಯಾತ್ರೆ ಯೋಗ, ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಸಮೃದ್ಧಿ.",
      en: "Vivid creative imagination, deep intuitive insight, foreign travel luck, inner serenity and poetic depth.",
      hi: "तीव्र कल्पनाशीलता, अंतर्ज्ञान, विदेश या तीर्थ यात्रा योग, मानसिक शांति एवं काव्य प्रतिभा।",
      te: "గొప్ప ఊహాశక్తి, అంతర్దృష్టి, విదేశీ ప్రయాణ యోగం & మానసిక ప్రశాంతత.",
      ta: "கற்பனை வளம், உள்ளுணர்வு ஞானம், வெளிநாட்டுப் பயணம் மற்றும் மன அமைதி."
    }
  },
  {
    id: "mars",
    planetKey: "Mars",
    name: {
      kn: "೭. ಕುಜ ಪರ್ವತ (Mount of Mars - Upper & Lower)",
      en: "7. Mount of Mars (Kuja Parvata)",
      hi: "७. मंगल पर्वत (उच्च व निम्न)",
      te: "7. కుజ పర్ವతం (ఉన్నత & నిమ్న)",
      ta: "7. செவ்வாய் மேடு"
    },
    planetName: {
      kn: "ಕುಜ (ಮಂಗಳ)",
      en: "Mars (Kuja)",
      hi: "मंगल देव",
      te: "కుజుడు",
      ta: "செவ்வாய்"
    },
    finger: {
      kn: "ಹಸ್ತದ ಮಧ್ಯ ಹಾಗೂ ಹೆಬ್ಬೆರಳಿನ ನಡುವಿನ ವಲಯ",
      en: "Palm Plain & Thumb Web Space",
      hi: "हथेली का मध्य व अंगूठे का भीतरी भाग",
      te: "అరచేతి మధ్య భాగం",
      ta: "உள்ளங்கையின் நடுப்பகுதி"
    },
    chakra: {
      kn: "ಮೂಲಾಧಾರ & ಮಣಿಪೂರ (Root & Solar)",
      en: "Muladhara & Manipura",
      hi: "मूलाधार एवं मणिपूर",
      te: "మూలాధార & మణిపూర",
      ta: "மூலாதாரம் & மணிப்பூரகம்"
    },
    gemstone: {
      kn: "ಹವಳ (Red Coral / Pravala)",
      en: "Red Coral (Pravala)",
      hi: "मूंगा (Red Coral)",
      te: "పగడం (హవళం)",
      ta: "செம்பவழம்"
    },
    baseEnergy: 88,
    virtues: {
      kn: "ಮಾನಸಿಕ ಧೈರ್ಯ, ಶತ್ರು ಜಯ, ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುವ ಸಾಹಸ ಶಕ್ತಿ ಹಾಗೂ ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಸ್ಥೈರ್ಯ.",
      en: "Moral fortitude, victory over adversities, crisis resilience, athletic vigor and decisive boldness.",
      hi: "अदम्य साहस, शत्रु विजय, संकट प्रबंधन, शारीरिक बल एवं निर्भीक पराक्रम।",
      te: "ధైర్యసాహసాలు, శత్రు జయం, సంక్షోభ పరిష్కార శక్తి & శారీరక బలం.",
      ta: "மன தைரியம், சத்ரு ஜெயம், சவால்களை வெல்லும் ஆற்றல் மற்றும் வீரம்."
    }
  }
];

export const VEDIC_HASTAREKHA_YOGAS_L5 = [
  {
    id: "gajakesari",
    name: {
      kn: "ಗಜಕೇಸರಿ ಯೋಗ (Gaja Kesari Palm Yoga)",
      en: "Gaja Kesari Palm Yoga",
      hi: "गजकेसरी हस्त योग",
      te: "గజకేసరి హస్త యోగం",
      ta: "கஜகேசரி ஹஸ்த யோகம்"
    },
    formation: {
      kn: "ಉನ್ನತ ಗುರು ಪರ್ವತ + ಚಂದ್ರ ಪರ್ವತದತ್ತ ಸುಂದರವಾಗಿ ಬಾಗುವ ಉದ್ದನೆಯ ಬುದ್ಧಿ ರೇಖೆ.",
      en: "Prominent Mount of Jupiter combined with an elegant Head line sweeping gracefully towards Mount of Moon.",
      hi: "उन्नत गुरु पर्वत एवं चन्द्र पर्वत की ओर झुकती सुंदर, निर्दोष मस्तिष्क रेखा।",
      te: "ఉన్నత గురు పర్వతం & చంద్ర పర్వతం వైపు సాగే అందమైన మస్తిష్క రేఖ.",
      ta: "உயர்ந்த குரு மேடு மற்றும் சந்திர மேட்டை நோக்கி அழகாக வளையும் புத்தி ரேகை."
    },
    fruit: {
      kn: "ಸಾರ್ವಜನಿಕ ಗೌರವ, ಪಾಂಡಿತ್ಯ, ಅಪ್ರತಿಮ ವಾಗ್ಮಿತ್ವ, ಧಾರ್ಮಿಕ ನಾಯಕತ್ವ ಹಾಗೂ ಅಖಂಡ ಯಶಸ್ಸು.",
      en: "Sovereign public influence, scholarly acclaim, eloquent statesmanship and unshakeable prosperity.",
      hi: "सार्वजनिक सम्मान, अगाध विद्वता, वाक्पटुता, धार्मिक नेतृत्व एवं अखंड सौभाग्य।",
      te: "సమాజంలో కీర్తి, పాండిత్యం, వాక్చాతుర్యం & సంపూర్ణ విజయం.",
      ta: "சமூகத்தில் பெரும் மரியாதை, கல்வி ஞானம், சிறந்த பேச்சாற்றல் மற்றும் புகழ்."
    }
  },
  {
    id: "lakshmi",
    name: {
      kn: "ಮಹಾ ಲಕ್ಷ್ಮೀ ಯೋಗ (Mahalakshmi Wealth Yoga)",
      en: "Mahalakshmi Wealth Yoga",
      hi: "महालक्ष्मी धन योग",
      te: "మహాలక్ష్మి ధన యోగం",
      ta: "மகாலக்ஷ்மி தன யோகம்"
    },
    formation: {
      kn: "ಗುಲಾಬಿ ಬಣ್ಣದ ಕಾಂತಿಯುತ ಹಸ್ತ + ಕೇತುವಿನಲ್ಲಿ ಮತ್ಸ್ಯ ಚಿಹ್ನೆ + ಸಂಪೂರ್ಣ ಮುಚ್ಚಿದ ಬೃಹತ್ ತ್ರಿಕೋನ (Dhana Trikona).",
      en: "Rosy-hued radiant palm, distinct Fish mark on Ketu/wrist, and an airtight Great Triangle of Wealth.",
      hi: "गुलाबी कांतियुक्त हथेली, केतु पर मत्स्य चिह्न एवं पूर्ण बंद महा त्रिकोण (धन कोष)।",
      te: "గులాబీ రంగు అరచేయి, కేతువు వద్ద మత్స్య చిహ్నం & మూసిన బృహత్ త్రికోణం.",
      ta: "ரோஜா நிற உள்ளங்கை, கேதுவில் மச்ச குறியீடு மற்றும் மூடப்பட்ட தன திரிகோணம்."
    },
    fruit: {
      kn: "ನಿರಂತರ ಧನಾಗಮನ, ಚಿನ್ನಾಭರಣ ಸಂಗ್ರಹ, ಐಷಾರಾಮಿ ವಾಹನ ಯೋಗ ಹಾಗೂ ವಂಶಪಾರಂಪರ್ಯ ಶ್ರೀಮಂತಿಕೆ.",
      en: "Perpetual wealth flow, luxury conveyances, precious jewel reserves and ancestral prosperity compounding.",
      hi: "निरंतर प्रचुर धन प्रवाह, स्वर्ण-रत्न संचय, वाहन सुख एवं वंशानुगत संपन्नता।",
      te: "నిరంతర ధన ప్రవాహం, ఆభరణాల సమృద్ధి, వాహన యోగం & శాశ్వత సంపద.",
      ta: "தொடர் தன வரவு, ஆபரண யோகம், சொகுசு வாகனங்கள் மற்றும் பரம்பரை ஐஸ்வர்யம்."
    }
  },
  {
    id: "saraswati",
    name: {
      kn: "ಸರಸ್ವತೀ ವಿದ್ಯಾ ಯೋಗ (Saraswati Wisdom Yoga)",
      en: "Saraswati Intellectual Yoga",
      hi: "सरस्वती विद्या योग",
      te: "సరస్వతీ విద్యా యోగం",
      ta: "சரஸ்வதி வித்யா யோகம்"
    },
    formation: {
      kn: "ಗುರು ಮುದ್ರಿಕಾ (Ring of Solomon) + ದ್ವಿಮುಖ ಬುದ್ಧಿ ರೇಖೆ (Writer's Fork) + ಬಲಯುತ ಬುಧ ರೇಖೆ.",
      en: "Ring of Solomon encircling Jupiter mount, Writer's Fork at Head Line termination, and a clear Mercury line.",
      hi: "गुरु मुद्रिका (रिंग ऑफ सोलोमन), द्विशाखी मस्तिष्क रेखा एवं सुदृढ़ बुध रेखा।",
      te: "గురు ముద్రిక (సాలమన్ రింగ్), ద్విముఖ మస్తిష్క రేఖ & బలమైన బుధ రేఖ.",
      ta: "குரு முத்ரிகா, இரட்டை கிளை புத்தி ரேகை மற்றும் தெளிவான புதன் ரேகை."
    },
    fruit: {
      kn: "ಉನ್ನತ ಸಂಶೋಧನೆ, ಗ್ರಂಥ ರಚನೆ, ಜ್ಯೋತಿಷ್ಯ-ತತ್ತ್ವಶಾಸ್ತ್ರ ಪಾಂಡಿತ್ಯ ಹಾಗೂ ಸರಸ್ವತೀ ಕಟಾಕ್ಷ.",
      en: "Deep research breakthroughs, authorial brilliance, philosophical mastery and academic renown.",
      hi: "उच्च शोध सफलता, ग्रंथ रचना, ज्योतिष व दर्शन में महारत एवं अकादमिक कीर्ति।",
      te: "పరిశోధన రంగంలో విజయాలు, రచనలు, జ్యోతిష్య పాండిత్యం & విద్యా కీర్తి.",
      ta: "ஆராய்ச்சி வெற்றி, நூல் எழுதும் ஆற்றல், ஜோதிட ஞானம் மற்றும் கல்வி மேன்மை."
    }
  },
  {
    id: "bhoomi",
    name: {
      kn: "ಭೂಮಿ ಯೋಗ (Bhoomi Real Estate Yoga)",
      en: "Bhoomi Property & Estate Yoga",
      hi: "भूमि व अचल संपत्ति योग",
      te: "భూమి & స్థిరాస్తి యోగం",
      ta: "பூமி மற்றும் சொத்து யோகம்"
    },
    formation: {
      kn: "ಪೃಥ್ವಿ ಚೌಕಾಕಾರದ ಹಸ್ತ + ಆಯುರ್ ರೇಖೆಯ ಒಳಗಿರುವ ಕುಜ ರಕ್ಷಾ ರೇಖೆ + ದೃಢ ಶನಿ ಪರ್ವತ.",
      en: "Earth elemental hand contours, Mars Guardian line inside Life line, and elevated Saturn mount.",
      hi: "पृथ्वी तत्त्व चौकोर हथेली, जीवन रेखा के भीतर मंगल रक्षा रेखा एवं सुदृढ़ शनि पर्वत।",
      te: "పృథ్వీ తత్త్వ చతురస్ర హస్తం, కుజ రక్షా రేఖ & స్థిరమైన శని పర్వతం.",
      ta: "சதுர வடிவ பிருத்வி கை, செவ்வாய் கவச ரேகை மற்றும் வலுவான சனி மேடு."
    },
    fruit: {
      kn: "ಸ್ವಂತ ಮನೆ ನಿರ್ಮಾಣ, ಕೃಷಿ ಭೂಮಿ ಖರೀದಿ, ವಾಣಿಜ್ಯ ಮಳಿಗೆಗಳ ಮಾಲೀಕತ್ವ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿಯಿಂದ ಶಾಶ್ವತ ಆದಾಯ.",
      en: "Home ownership, agricultural estates, commercial real estate acquisition and enduring passive rental income.",
      hi: "स्वयं का भव्य भवन, कृषि भूमि अर्जन, व्यावसायिक संपत्ति एवं अचल संपत्तियों से स्थायी आय।",
      te: "సొంత ఇల్లు, వ్యవసాయ భూములు, వాణిజ్య భవనాలు & శాశ్వత అద్దె ఆదాయం.",
      ta: "சொந்த வீடு, விவசாய நிலம், வணிக வளாகங்கள் மற்றும் நிரந்தர சொத்து வருமானம்."
    }
  }
];

export const VEDIC_REMEDIES_CATALOG_L5 = {
  gemstones: [
    {
      planetKey: "Jupiter",
      fingerKn: "ತರ್ಜನಿ (Index Finger - Guru)",
      fingerEn: "Index Finger (Guru - Jupiter)",
      fingerHi: "तर्जनी (गुरु अंगुली)",
      fingerTe: "తర్జని (గురు వేలు)",
      fingerTa: "சுட்டு விரல் (குரு விரல்)",
      gemKn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire) / ಬಂಗಾರ",
      gemEn: "Yellow Sapphire (Pushparaga) in Gold",
      gemHi: "पुखराज (Yellow Sapphire) स्वर्ण में",
      gemTe: "పుష్యరాగం (బంగారంలో)",
      gemTa: "புஷ்பராகம் (தங்கத்தில்)",
      benefitKn: "ಜ್ಞಾನ, ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ & ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ",
      benefitEn: "Wisdom, Spiritual Honor & Administrative Authority",
      benefitHi: "ज्ञान, आध्यात्मिक सम्मान एवं प्रशासनिक अधिकार",
      benefitTe: "జ్ఞానం, గౌరవం & నాయకత్వ అధికారం",
      benefitTa: "ஞானம், ஆன்மீக மரியாதை மற்றும் தலைமைப் பண்பு"
    },
    {
      planetKey: "Sun",
      fingerKn: "ಅನಾಮಿಕಾ (Ring Finger - Surya)",
      fingerEn: "Ring Finger (Surya - Sun)",
      fingerHi: "अनामिका (सूर्य अंगुली)",
      fingerTe: "అనామిక (సూర్య వేలు)",
      fingerTa: "மோதிர விரல் (சூரிய விரல்)",
      gemKn: "ಮಾಣಿಕ್ಯ (Ruby) / ತಾಮ್ರ ಅಥವಾ ಬಂಗಾರ",
      gemEn: "Ruby (Manikya) in Copper or Gold",
      gemHi: "माणिक्य (Ruby) तांबे या स्वर्ण में",
      gemTe: "మాణిక్యం (రాగి లేదా బంగారంలో)",
      gemTa: "மாணிக்கம் (தாமிரம் அல்லது தங்கத்தில்)",
      benefitKn: "ಕೀರ್ತಿ, ರಾಜ ಸನ್ಮಾನ & ಉನ್ನತ ಪ್ರತಿಷ್ಠೆ",
      benefitEn: "Fame, Royal Honors & High Prestige",
      benefitHi: "कीर्ति, राजकीय सम्मान एवं उच्च प्रतिष्ठा",
      benefitTe: "కీర్తి, ప్రభుత్వ సన్మానం & ప్రతిష్ఠ",
      benefitTa: "புகழ், அரசு மரியாதை மற்றும் உயரிய அந்தஸ்து"
    },
    {
      planetKey: "Mercury",
      fingerKn: "ಕನಿಷ್ಠಿಕಾ (Little Finger - Budha)",
      fingerEn: "Little Finger (Budha - Mercury)",
      fingerHi: "कनिष्ठिका (बुध अंगुली)",
      fingerTe: "కనిష్ఠిక (బుధ వేలు)",
      fingerTa: "சுண்டு விரல் (புதன் விரல்)",
      gemKn: "ಪಚ್ಚೆ (Emerald) / ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಲೋಹ",
      gemEn: "Emerald (Marakata) in Silver or Panchaloha",
      gemHi: "पन्ना (Emerald) चांदी या पंचधातु में",
      gemTe: "పచ్చ (వెండి లేదా పంచలోహంలో)",
      gemTa: "மரகதம் (வெள்ளி அல்லது பஞ்சலோகத்தில்)",
      benefitKn: "ವ್ಯಾಪಾರ ಬುದ್ಧಿ, ವಾಕ್ ಸಿದ್ಧಿ & ಆರ್ಥಿಕ ವೃದ್ಧಿ",
      benefitEn: "Business Genius, Eloquence & Financial Growth",
      benefitHi: "व्यापार चातुर्य, वाक् सिद्धि एवं आर्थिक वृद्धि",
      benefitTe: "వ్యాపార ప్రజ్ఞ, వాక్చాతుర్యం & ఆర్థిక వృద్ధి",
      benefitTa: "வியாபார வெற்றி, பேச்சாற்றல் மற்றும் நிதி வளர்ச்சி"
    }
  ],
  rudrakshas: [
    {
      mukhi: 5,
      nameKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5-Mukhi Rudraksha)",
      nameEn: "5-Mukhi Rudraksha (Lord Kalagni Rudra)",
      nameHi: "५ मुखी रुद्राक्ष (कालाग्नि रुद्र)",
      nameTe: "5 ముఖి రుద్రాక్ష (కాలాగ్ని రుద్ర)",
      nameTa: "5 முக ருத்ராட்சம் (காலாக்னி ருத்ரர்)",
      descKn: "ಕಾಲಾಗ್ನಿ ರುದ್ರ ಸ್ವರೂಪ. ಮನಸ್ಸಿಗೆ ಶಾಂತಿ, ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ, ಜ್ಞಾನಾರ್ಜನೆ ಹಾಗೂ ಸರ್ವ ಪಾಪ ನಿವಾರಣೆ.",
      descEn: "Governed by Lord Kalagni Rudra & Jupiter. Enhances mental peace, blood circulation, wisdom, and inner stillness.",
      descHi: "कालाग्नि रुद्र स्वरूप। मानसिक शांति, रक्तचाप नियंत्रण, ज्ञान संचय एवं सर्व पाप निवारक।",
      descTe: "కాలాగ్ని రుద్ర స్వరూపం. మనశ్శాంతి, రక్తపోటు నియంత్రణ, జ్ఞానార్జన & పాప నివారణ.",
      descTa: "காலாக்னி ருத்ர சொரூபம். மன அமைதி, இரத்த அழுத்த கட்டுப்பாடு மற்றும் ஞான வளர்ச்சி."
    },
    {
      mukhi: 6,
      nameKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6-Mukhi Rudraksha)",
      nameEn: "6-Mukhi Rudraksha (Lord Kartikeya)",
      nameHi: "६ मुखी रुद्राक्ष (भगवान कार्तिकेय)",
      nameTe: "6 ముఖి రుద్రాక్ష (కార్తికేయ)",
      nameTa: "6 முக ருத்ராட்சம் (முருகன்)",
      descKn: "ಕಾರ್ತಿಕೇಯ / ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಸ್ವರೂಪ. ಏಕಾಗ್ರತೆ, ಧೈರ್ಯ, ಶತ್ರು ಜಯ ಹಾಗೂ ಕೌಶಲ್ಯ ವೃದ್ಧಿಗೆ ಅತ್ಯುನ್ನತ.",
      descEn: "Governed by Lord Kartikeya & Mars. Enhances supreme focus, bravery, athletic skill, and victory over challenges.",
      descHi: "भगवान कार्तिकेय स्वरूप। एकाग्रता, अदम्य साहस, शत्रु विजय एवं नेतृत्व कौशल प्रदाता।",
      descTe: "సుబ్రహ్మణ్య స్వామి స్వరూపం. ఏకాగ్రత, ధైర్యం, శత్రు జయం & ప్రతిభ అభివృద్ధి.",
      ta: "சுப்ரமண்ய சுவாமி சொரூபம். ஆழ்ந்த கவனம், வீரம், சத்ரு ஜெயம் மற்றும் திறன் மேன்மை."
    },
    {
      mukhi: 7,
      nameKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7-Mukhi Rudraksha)",
      nameEn: "7-Mukhi Rudraksha (Goddess Mahalakshmi)",
      nameHi: "७ मुखी रुद्राक्ष (महालक्ष्मी स्वरूप)",
      nameTe: "7 ముఖి రుద్రాక్ష (మహాలక్ష్మి)",
      nameTa: "7 முக ருத்ராட்சம் (மகாலக்ஷ்மி)",
      descKn: "ಮಹಾಲಕ್ಷ್ಮಿ ಸ್ವರೂಪ. ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟು ನಿವಾರಿಸಿ, ನಿರಂತರ ಧನಾಕರ್ಷಣೆ ಹಾಗೂ ವೃತ್ತಿ-ವ್ಯವಹಾರ ಯಶಸ್ಸಿಗೆ ಅತ್ಯುತ್ತಮ.",
      descEn: "Governed by Goddess Mahalakshmi & Venus. Dispels financial obstacles, magnetizes fortune, and ensures career prosperity.",
      descHi: "साक्षात् महालक्ष्मी स्वरूप। आर्थिक रुकावटें दूर कर निरंतर धन प्रवाह एवं व्यापार वृद्धि कारक।",
      descTe: "సాక్షాత్ మహాలక్ష్మి స్వరూపం. ఆర్థిక ఇబ్బందులు తొలగించి స్థిర లక్ష్మీ కటాక్షం ప్రసాదిస్తుంది.",
      descTa: "மகாலக்ஷ்மி சொரூபம். நிதி தடைகளை நீக்கி, தொடர் தன வரவு மற்றும் தொழில் வளர்ச்சி தரும்."
    }
  ],
  templeRituals: [
    {
      id: "ksheerabhisheka",
      titleKn: "🥛 ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ (Ksheerabhishekam)",
      titleEn: "🥛 Ksheerabhishekam at Gokarna",
      titleHi: "🥛 क्षीराभिषेक सेवा (गोकर्ण)",
      titleTe: "🥛 క్షీరాభిషేక సేవ (గోకర్ణ)",
      titleTa: "🥛 பாலாபிஷேக சேவை (கோகர்ணம்)",
      descKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಗೋಕ್ಷೀರ ಅಭಿಷೇಕದಿಂದ ಸರ್ವ ಹಸ್ತ ದೋಷಗಳು ಶಮನವಾಗಿ ದೀರ್ಘಾಯುಷ್ಯ ಪ್ರಾಪ್ತಿ.",
      descEn: "Sacred pure milk anointment upon the Atmalinga at Sri Gokarna Kshetra, neutralizing inauspicious palm line flaws and granting longevity.",
      descHi: "श्री गोकर्ण महाबलेश्वर आत्मलिंग पर गोदुग्ध अभिषेक से सभी हस्त रेखा दोष शांत होते हैं एवं दीर्घायु प्राप्त होती है।",
      descTe: "గోకర్ణ క్షేత్ర ఆత్మలింగానికి గోక్షీర అభిషేకం వల్ల హస్త దోషాలు తొలగి ఆయురారోగ్యాలు సిద్ధిస్తాయి.",
      descTa: "ஶ்ரீ கோகர்ண ஆத்மலிங்கத்திற்கு பசும்பால் அபிஷேகம் செய்து, சகல ஹஸ்த தோஷங்களும் நீங்கி நீண்ட ஆயுள் பெறுக."
    },
    {
      id: "bilvarchane",
      titleKn: "🌿 ಬಿಲ್ವಾರ್ಚನೆ & ರುದ್ರಾಭಿಷೇಕ (Bilvarchana & Rudrabhisheka)",
      titleEn: "🌿 Bilvarchana & Ekadasha Rudra",
      titleHi: "🌿 बिल्वार्चन एवं रुद्राभिषेक",
      titleTe: "🌿 బిల్వార్చన & రుద్రాభిషేకం",
      titleTa: "🌿 வில்வார்ச்சனை & ருத்ராபிஷேகம்",
      descKn: "ಏಕಾದಶ ರುದ್ರ ಮಂತ್ರ ಪಠಣ ಹಾಗೂ ೧೦೮ ಬಿಲ್ವಪತ್ರೆ ಸಮರ್ಪಣೆಯಿಂದ ಸಕಲ ಗ್ರಹ ಪರ್ವತ ಬಲ ವೃದ್ಧಿ ಹಾಗೂ ರಾಜಸನ್ಮಾನ.",
      descEn: "Chanting of Sri Rudram and offering 108 fresh Bilva leaves, revitalizing weak planetary mounts and bestowing royal blessings.",
      descHi: "एकादश रुद्र पाठ एवं १०८ बिल्वपत्र अर्पण से सभी ग्रह पर्वतों का बल बढ़ता है और सम्मान प्राप्त होता है।",
      descTe: "ఏకాదశ రుద్ర పారాయణం & 108 బిల్వపత్ర సమర్పణ వల్ల గ్రహ పర్వత బలం పెరుగుతుంది.",
      descTa: "ஏகாதச ருத்ர பாராயணம் மற்றும் 108 வில்வ இலை சமர்ப்பணத்தால் கிரக மேடுகளின் பலம் கூடும்."
    },
    {
      id: "mrityunjaya",
      titleKn: "🪔 ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ (Maha Mrityunjaya Japa)",
      titleEn: "🪔 Maha Mrityunjaya Japa & Homa",
      titleHi: "🪔 महामृत्युंजय जप एवं शांति",
      titleTe: "🪔 మహామృత్యుంజయ జపం",
      titleTa: "🪔 மகா மிருத்யுஞ்சய ஜபம்",
      descKn: "'ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ' ಮಹಾಮಂತ್ರವನ್ನು ಪ್ರತಿದಿನ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ ಆಯುರ್ ರೇಖೆಯ ಬಲ ಹಾಗೂ ಪ್ರಾಣಶಕ್ತಿ ರಕ್ಷಣೆ ಪಡೆಯಿರಿ.",
      descEn: "Chanting 'Om Tryambakam Yajamahe' 108 times daily strengthens Ayur Rekha (Life Line), forming an impenetrable shield of vitality.",
      descHi: "'ॐ त्र्यम्बकं यजामहे' महामंत्र का नित्य १०८ बार जप जीवन रेखा को सुदृढ़ कर अभेद्य प्राण रक्षा प्रदान करता है।",
      descTe: "ప్రతిరోజూ 108 సార్లు మహామృత్యుంజయ మంత్ర జపం చేయడం వల్ల జీవిత రేఖకు అమిత ప్రాణశక్తి లభిస్తుంది.",
      descTa: "தினமும் 108 முறை மகா மிருத்யுஞ்சய மந்திரம் ஜபிப்பதால் ஆயுள் ரேகை வலுப்பெற்று பரிபூரண பாதுகாப்பு கிட்டும்."
    }
  ]
};

