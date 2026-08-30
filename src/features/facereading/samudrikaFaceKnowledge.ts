/**
 * Classical Vedic Muka Samudrika Shastra & Metoposcopy Knowledge Repository.
 * 
 * Sourced directly from:
 * 1. Brihat Samhita (Varahamihira, 6th Century CE) - Chapters 68 (Purusha Lakshana) & 70 (Kanya/Stri Lakshana)
 * 2. Garuda Purana - Samudrika Shastra Adhyaya (Bodily & Facial Measurements in Angulas)
 * 3. Bhavishya Purana - Muka, Danta, Karna & Tilaka Shastra
 * 4. Skanda Purana & Vishnudharmottara Purana (Iconometry & Nava-Tala Golden Ratio)
 */

export const VEDIC_ANGULA_PROPORTIONS = {
  totalFaceHeight: 12, // 12 Angulas = 1 Mukha (Standard Vedic Tala)
  upperZone: 4, // Hairline to Eyebrows (Lalata)
  middleZone: 4, // Eyebrows to Base of Nose (Nasika & Netra)
  lowerZone: 4, // Base of Nose to Bottom of Chin (Chibuka & Oshtha)
  eyeLength: 2, // 2 Angulas
  interEyebrowSpace: 2, // 2 Angulas separation for auspicious Dhanura Bhrulata
  philtrumWidth: 0.5, // 0.5 Angula (Half digit)
  earHeight: 4 // Matches Nose bridge height
};

export const VEDIC_PANCHA_MAHABHUTA_FACES = {
  agni: {
    nameKn: "ಅಗ್ನಿ ತತ್ತ್ವ ಮುಖ (Fire Archetype - Triangular / Angular)",
    nameEn: "Agni Face (Fire Archetype - Sharp & Dynamic)",
    traitsKn: "ತೀಕ್ಷ್ಣ ಕಣ್ಣುಗಳು, ಚೂಪಾದ ಗಡ್ಡ, ಅದ್ಭುತ ನಾಯಕತ್ವ, ಧೈರ್ಯ ಹಾಗೂ ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಸಾಮರ್ಥ್ಯ.",
    traitsEn: "Penetrating gaze, sharp chin, visionary leadership, courageous initiative and rapid execution."
  },
  prithvi: {
    nameKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ ಮುಖ (Earth Archetype - Square / Solid Jaw)",
    nameEn: "Prithvi Face (Earth Archetype - Grounded & Resilient)",
    traitsKn: "ದೃಢ ದವಡೆ, ವಿಶಾಲ ಮುಖ, ಸಹನೆ, ಸ್ಥಿರಾಸ್ತಿ ನಿರ್ಮಾಣ ಯೋಗ ಹಾಗೂ ನಿಷ್ಠಾವಂತ ವ್ಯಕ್ತಿತ್ವ.",
    traitsEn: "Firm jawline, broad structure, great patience, land asset accumulation and dependable loyalty."
  },
  jala: {
    nameKn: "ಜಲ ತತ್ತ್ವ ಮುಖ (Water Archetype - Round / Soft Oval)",
    nameEn: "Jala Face (Water Archetype - Empathetic & Fluid)",
    traitsKn: "ಸುಂದರ ನೇತ್ರಗಳು, ಮೃದುವಾದ ಕೆನ್ನೆಗಳು, ಕಲಾತ್ಮಕ ಆಸಕ್ತಿ, ಕರುಣೆ ಹಾಗೂ ಪ್ರೇಮಮಯ ಸ್ವಭಾವ.",
    traitsEn: "Lustrous eyes, gentle contours, deep artistic appreciation, empathy and romantic warmth."
  },
  vayu: {
    nameKn: "ವಾಯು ತತ್ತ್ವ ಮುಖ (Air Archetype - Oblong / Rectangular)",
    nameEn: "Vayu Face (Air Archetype - Analytical & Eloquent)",
    traitsKn: "ಉನ್ನತ ಲಲಾಟ, ಉದ್ದವಾದ ಮುಖ, ಗಣಿತ-ವಿಜ್ಞಾನ ತೀಕ್ಷ್ಣತೆ, ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ಬೌದ್ಧಿಕ ಅನ್ವೇಷಣೆ.",
    traitsEn: "High forehead, elongated structure, sharp analytical acumen, articulate speech and philosophical depth."
  },
  akasha: {
    nameKn: "ಆಕಾಶ ತತ್ತ್ವ ಮುಖ (Ether Archetype - Translucent / Delicate)",
    nameEn: "Akasha Face (Ether Archetype - Spiritual & Intuitive)",
    traitsKn: "ತೇಜಸ್ವಿ ಕಾಂತಿ, ದೈವಿಕ ಮುಖವರ್ಚಸ್ಸು, ಅಂತಃಸ್ಫೂರ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ.",
    traitsEn: "Luminous aura, divine tranquility, sharp sixth sense intuition and spiritual wisdom."
  }
};

export const VEDIC_MAHAPURUSHA_FACIAL_ARCHETYPES = {
  hamsa: {
    nameKn: "ಹಂಸ ಮಹಾಪುರುಷ ಮುಖ (Guru - Jupiter Archetype)",
    nameEn: "Hamsa Mahapurusha (Jupiter Face)",
    rulerKn: "ಬೃಹಸ್ಪತಿ (ಗುರು)",
    rulerEn: "Jupiter (Guru)",
    featuresKn: "ವಿಶಾಲ ಲಲಾಟ, ಪದ್ಮಾಕಾರದ ನೇತ್ರಗಳು, ನೇರವಾದ ನಾಸಿಕ, ಗಂಭೀರ ಧ್ವನಿ ಹಾಗೂ ಶುದ್ಧ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು.",
    featuresEn: "Broad elevated forehead, lotus eyes, straight royal nose bridge, resonant voice and radiant Sattvic wisdom."
  },
  ruchaka: {
    nameKn: "ರುಚಕ ಮಹಾಪುರುಷ ಮುಖ (Kuja - Mars Archetype)",
    nameEn: "Ruchaka Mahapurusha (Mars Face)",
    rulerKn: "ಮಂಗಳ (ಕುಜ)",
    rulerEn: "Mars (Mangala)",
    featuresKn: "ದೃಢ ಭ್ರೂಮಧ್ಯ, ಕೆಚ್ಚೆದೆಯ ಕಣ್ಣುಗಳು, ಬಲಯುತ ಚೌಕಾಕಾರದ ದವಡೆ ಹಾಗೂ ಅದಮ್ಯ ಶೌರ್ಯ.",
    featuresEn: "Prominent brow ridge, fearless piercing eyes, muscular square jaw and invincible determination."
  },
  bhadra: {
    nameKn: "ಭದ್ರ ಮಹಾಪುರುಷ ಮುಖ (Budha - Mercury Archetype)",
    nameEn: "Bhadra Mahapurusha (Mercury Face)",
    rulerKn: "ಬುಧ",
    rulerEn: "Mercury (Budha)",
    featuresKn: "ನಿತ್ಯ ಯೌವನದ ಮುಖಕಾಂತಿ, ತೀಕ್ಷ್ಣ ನಾಸಿಕಾಗ್ರ, ಚಾಣಾಕ್ಷ ನೇತ್ರಗಳು ಹಾಗೂ ವಾಗ್ಮಿತ್ವ.",
    featuresEn: "Youthful vibrant complexion, sharp nose tip, sparkling analytical eyes and master diplomacy."
  },
  malavya: {
    nameKn: "ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಮುಖ (Shukra - Venus Archetype)",
    nameEn: "Malavya Mahapurusha (Venus Face)",
    rulerKn: "ಶುಕ್ರ",
    rulerEn: "Venus (Shukra)",
    featuresKn: "ಆಕರ್ಷಕ ಕಮಲ ನಯನಗಳು, ಗುಲಾಬಿ ಬಣ್ಣದ ಸುಂದರ ಓಷ್ಠ, ನಯವಾದ ಚರ್ಮ ಹಾಗೂ ವಾಹನ-ಭೋಗ ಯೋಗ.",
    featuresEn: "Enchanting almond eyes, rosy cupid-bow lips, flawless radiant skin and luxury prosperity."
  },
  sasa: {
    nameKn: "ಶಶ ಮಹಾಪುರುಷ ಮುಖ (Shani - Saturn Archetype)",
    nameEn: "Sasa Mahapurusha (Saturn Face)",
    rulerKn: "ಶನೀಶ್ವರ",
    rulerEn: "Saturn (Shani)",
    featuresKn: "ಗಂಭೀರ ನೇತ್ರಗಳು, ದೃಢ ಮೂಳೆ ರಚನೆ, ಆಳವಾದ ಚಿಂತನೆ ಹಾಗೂ ಜನಸಾಮಾನ್ಯರ ಮೇಲೆ ಪ್ರಭುತ್ವ.",
    featuresEn: "Deep thoughtful eyes, strong skeletal structure, stoic perseverance and authority over masses."
  }
};

export const VEDIC_LALATA_PLANETARY_LINES = [
  {
    lineIndex: 1,
    planetKn: "ಶನಿ ರೇಖೆ (Saturn Line - ಕೇಶರೇಖೆಯ ಕೆಳಗೆ)",
    planetEn: "Saturn Line (Below Hairline)",
    meaningKn: "ಆಯುಷ್ಯ, ಶಿಸ್ತು, ಸಂಶೋಧನಾ ಶಕ್ತಿ ಹಾಗೂ ಏಕಾಂತ ತಪಸ್ಸು.",
    meaningEn: "Longevity, disciplined endurance, research depth and meditative stability."
  },
  {
    lineIndex: 2,
    planetKn: "ಗುರು ರೇಖೆ (Jupiter Line - ೨ನೇ ರೇಖೆ)",
    planetEn: "Jupiter Line (2nd Horizontal Line)",
    meaningKn: "ಜ್ಞಾನಾರ್ಜನೆ, ಗುರು ಕೃಪೆ, ಧಾರ್ಮಿಕ ಆಸಕ್ತಿ ಹಾಗೂ ಸಮಾಜ ಗೌರವ.",
    meaningEn: "Spiritual wisdom, scholarly honor, ethical righteousness and divine protection."
  },
  {
    lineIndex: 3,
    planetKn: "ಮಂಗಳ ರೇಖೆ (Mars Line - ೩ನೇ ರೇಖೆ)",
    planetEn: "Mars Line (3rd Line)",
    meaningKn: "ಧೈರ್ಯ, ಸಾಹಸ, ಸೈನ್ಯ/ಆಡಳಿತ ನಾಯಕತ್ವ ಹಾಗೂ ಶತ್ರುಜಯ.",
    meaningEn: "Courage, valor, administrative leadership and victory over obstacles."
  },
  {
    lineIndex: 4,
    planetKn: "ರವಿ ರೇಖೆ (Sun Line - ಬಲ ಹುಬ್ಬಿನ ಮೇಲೆ)",
    planetEn: "Sun Line (Above Right Eyebrow)",
    meaningKn: "ರಾಜಕೀಯ/ಉದ್ಯೋಗ ಕೀರ್ತಿ, ತೇಜಸ್ಸು, ನಾಯಕತ್ವ ಹಾಗೂ ಸರಕಾರಿ ಗೌರವ.",
    meaningEn: "Executive authority, governmental recognition, high vitality and fame."
  },
  {
    lineIndex: 5,
    planetKn: "ಚಂದ್ರ ರೇಖೆ (Moon Line - ಎಡ ಹುಬ್ಬಿನ ಮೇಲೆ)",
    planetEn: "Moon Line (Above Left Eyebrow)",
    meaningKn: "ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ, ಕಲ್ಪನಾಶಕ್ತಿ, ಕಲೆ ಹಾಗೂ ಜಲ/ವಿದೇಶ ಪ್ರವಾಸ.",
    meaningEn: "Emotional balance, imaginative creativity, arts and travel success."
  },
  {
    lineIndex: 6,
    planetKn: "ಶುಕ್ರ ರೇಖೆ (Venus Line - ಭ್ರೂಮಧ್ಯ / ಆಜ್ಞಾ)",
    planetEn: "Venus Line (Inter-Eyebrow Zone)",
    meaningKn: "ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಆಕರ್ಷಣೆ.",
    meaningEn: "Marital harmony, aesthetic charm, luxury vehicle fortune and charisma."
  },
  {
    lineIndex: 7,
    planetKn: "ಬುಧ ರೇಖೆ (Mercury Line - ನಾಸಿಕ ಮೂಖ)",
    planetEn: "Mercury Line (Root of Nose Bridge)",
    meaningKn: "ವಾಕ್ ಸಿದ್ಧಿ, ವಾಣಿಜ್ಯ ಬುದ್ಧಿ, ಗಣಿತ ತೀಕ್ಷ್ಣತೆ ಹಾಗೂ ಸಂವಹನ ಕಲೆ.",
    meaningEn: "Eloquence, commercial acumen, mathematical skill and persuasive speech."
  }
];

export const VEDIC_EYE_TYPES = {
  padma: {
    nameKn: "ಪದ್ಮ ನೇತ್ರ (Lotus Eyes - ಬೃಹತ್ ಸಂಹಿತಾ)",
    nameEn: "Padma Netra (Lotus Shaped)",
    meaningKn: "ಸಾತ್ವಿಕ ಗುಣ, ಕರುಣೆ, ಪವಿತ್ರ ಜೀವನ ಹಾಗೂ ಉನ್ನತ ಸಮಾಜ ಮನ್ನಣೆ.",
    meaningEn: "Sattvic nature, boundless compassion, purity and high spiritual esteem."
  },
  matsya: {
    nameKn: "ಮತ್ಸ್ಯ ನೇತ್ರ (Fish Shaped)",
    nameEn: "Matsya Netra (Fish Shaped Eyes)",
    meaningKn: "ವ್ಯಾಪಾರ ಚಾಕಚಕ್ಯತೆ, ತಕ್ಷಣದ ಧನಾಗಮನ, ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಹಾಗೂ ಸೌಭಾಗ್ಯ.",
    meaningEn: "Commercial sharpness, rapid wealth influx, agility and prosperity."
  },
  mriga: {
    nameKn: "ಮೃಗ ನೇತ್ರ (Deer Eyes)",
    nameEn: "Mriga Netra (Deer Eyes)",
    meaningKn: "ಮುಗ್ಧತೆ, ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ, ಚುರುಕುತನ ಹಾಗೂ ಕಲಾ ಪ್ರೇಮ.",
    meaningEn: "Innocent beauty, high sensitivity, quick perceptiveness and artistic love."
  },
  gaja: {
    nameKn: "ಗಜ ನೇತ್ರ (Elephant / Deep Eyes)",
    nameEn: "Gaja Netra (Deep Set Eyes)",
    meaningKn: "ಅಗಾಧ ನೆನಪಿನ ಶಕ್ತಿ, ಸ್ಥಿರ ಮನಸ್ಸು, ತಾಳ್ಮೆ ಹಾಗೂ ಶಾಶ್ವತ ಕೀರ್ತಿ.",
    meaningEn: "Profound photographic memory, stable intellect, patience and enduring legacy."
  }
};

export const VEDIC_SPECIAL_LAKSHANAS = {
  kambuGriva: {
    nameKn: "ಕಂಬು ಗ್ರೀವ (Conch-Neck Tri-Rekha)",
    nameEn: "Kambu Griva (3 Sacred Neck Lines)",
    meaningKn: "ಕಂಠದಲ್ಲಿ ಮೂರು ಸ್ಪಷ್ಟ ವೃತ್ತಾಕಾರದ ರೇಖೆಗಳು (ಕಂಬು ಗ್ರೀವ) ರಾಜಲಕ್ಷಣ, ಸಾರ್ವಭೌಮ ಅಧಿಕಾರ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯದ ಪರಮ ಸಂಕೇತ.",
    meaningEn: "Three graceful concentric neck lines signify royal authority, sovereign prestige, and longevity."
  },
  brahmaRekha: {
    nameKn: "ಬ್ರಹ್ಮ ರೇಖೆ (Deep Symmetrical Philtrum)",
    nameEn: "Brahma Rekha (Sub-nasal Groove)",
    meaningKn: "ಮೂಗಿನ ಕೆಳಭಾಗದ ಆಳವಾದ ಬ್ರಹ್ಮ ರೇಖೆಯು ಅಗಾಧ ಪ್ರಾಣಶಕ್ತಿ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಉನ್ನತ ಸಂತಾನ ಯೋಗವನ್ನು ನೀಡುತ್ತದೆ.",
    meaningEn: "A well-defined, deep philtrum represents high vitality, reproductive strength, and lineage prosperity."
  },
  dantaMukta: {
    nameKn: "ಮುಕ್ತಾ ದಂತ (Pearl-like Even Teeth)",
    nameEn: "Mukta Danta (Even Pearl Teeth)",
    meaningKn: "ಸಮವಾದ ಹಾಗೂ ಅಂತರವಿಲ್ಲದ ಹಲ್ಲುಗಳು ಸತ್ಯವಾಣಿ, ವಾಕ್ ಸಿದ್ಧಿ ಹಾಗೂ ನಿರಂತರ ಧನಲಾಭವನ್ನು ನೀಡುತ್ತವೆ.",
    meaningEn: "Uniform, gap-free white teeth indicate truthful eloquence, digestive fire, and steady prosperity."
  }
};
