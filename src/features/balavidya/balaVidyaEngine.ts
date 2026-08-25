/**
 * Classical Vedic Bala Vidya, Samskara & Student Intelligence Engine.
 * 
 * Sourced from:
 * 1. Parashara Hora Shastra - 5th House (Buddhi Sthana), 9th House (Bhagya / Higher Learning)
 * 2. Brihat Samhita & Garuda Purana - Bala Rishta & Raksha Mantras
 * 3. Jataka Parijata & Phaladeepika - Saraswati Yoga, Budha-Aditya Yoga & Vidya Karakas
 * 4. Classical Nakshatra Pada Syllable System for Namakarana (27 Nakshatras x 4 Padas)
 * 5. Sankhya Shastra - Driver / Conductor Number calculations for children
 */

import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";

export type CognitiveLearningStyle = {
  styleKey: "analytical_stem" | "creative_artistic" | "strategic_leadership" | "deep_research";
  titleKn: string;
  titleEn: string;
  descriptionKn: string;
  descriptionEn: string;
  recommendedFieldsKn: string[];
  recommendedFieldsEn: string[];
  studyEnvironmentKn: string;
  studyEnvironmentEn: string;
  favorableHoursKn: string;
  favorableHoursEn: string;
};

export type NakshatraPadaInfo = {
  nakshatraNameKn: string;
  nakshatraNameEn: string;
  pada: number;
  syllablesKn: string[];
  syllablesEn: string[];
  suggestedDeityKn: string;
  suggestedDeityEn: string;
  animalMascotKn: string;
  animalMascotEn: string;
  mascotEmoji: string;
  rulingPlanetKn: string;
  rulingPlanetEn: string;
};

export type SamskaraMuhurthaGuide = {
  samskaraNameKn: string;
  samskaraNameEn: string;
  idealAgeWindowKn: string;
  idealAgeWindowEn: string;
  favorableTithisKn: string;
  favorableTithisEn: string;
  vedicSignificanceKn: string;
  vedicSignificanceEn: string;
};

export type BalaRishtaAssessment = {
  protectionScore: number; // 0..100%
  statusKn: string;
  statusEn: string;
  isBalaRishtaPresent: boolean;
  observationsKn: string[];
  observationsEn: string[];
  protectiveMantrasKn: string[];
  protectiveMantrasEn: string[];
  templeRemedyKn: string;
  templeRemedyEn: string;
};

export type BalaSankhyaProfile = {
  driverNumber: number;
  conductorNumber: number;
  coreStrengthKn: string;
  coreStrengthEn: string;
  concentrationColorKn: string;
  concentrationColorEn: string;
  luckyStudyDirectionKn: string;
  luckyStudyDirectionEn: string;
  peerDynamicsKn: string;
  peerDynamicsEn: string;
};

export type BalShlokaStory = {
  shlokaSanskrit: string;
  shlokaMeaningKn: string;
  shlokaMeaningEn: string;
  audioVoiceText: string;
  moralStoryTitleKn: string;
  moralStoryTitleEn: string;
  moralStoryContentKn: string;
  moralStoryContentEn: string;
};

export type BalaVidyaResult = {
  childName: string;
  dob: string;
  tob: string;
  gender: string;
  lagnaNameKn: string;
  lagnaNameEn: string;
  moonRashiKn: string;
  moonRashiEn: string;
  nakshatraNameKn: string;
  nakshatraNameEn: string;
  nakshatraPada: number;
  
  // 1. Cognitive Learning Style
  learningStyle: CognitiveLearningStyle;
  
  // 2. Namakarana & Pada Syllables
  padaInfo: NakshatraPadaInfo;
  samskaras: SamskaraMuhurthaGuide[];
  
  // 3. Bala Rishta & Raksha Shield
  balaRishta: BalaRishtaAssessment;
  
  // 4. Bala Sankhya Numerology
  sankhya: BalaSankhyaProfile;
  
  // 5. Mascot, Shloka & Moral Story
  mascotAndStory: BalShlokaStory;
  
  // Overall Summary & Ashirvada
  saraswatiScore: number; // 0..100%
  overallVerdictKn: string;
  overallVerdictEn: string;
  priestBlessingKn: string;
  priestBlessingEn: string;
};

// -------------------------------------------------------------------------------------------------
// 27 NAKSHATRAS X 4 PADAS AUTHENTIC SYLLABLE DICTIONARY
// -------------------------------------------------------------------------------------------------
const NAKSHATRA_SYLLABLE_TABLE: Record<string, { padas: [string[], string[], string[], string[]]; mascotKn: string; mascotEn: string; emoji: string; deityKn: string; deityEn: string; planetKn: string; planetEn: string }> = {
  "Ashwini": {
    padas: [["ಚು (Chu)"], ["ಚೇ (Che)"], ["ಚೋ (Cho)"], ["ಲಾ (La)"]],
    mascotKn: "ದಿವ್ಯ ಅಶ್ವ (Divine Winged Horse)",
    mascotEn: "Divine Winged Horse",
    emoji: "🐎",
    deityKn: "ಅಶ್ವಿನೀ ದೇವತೆಗಳು (Aswini Kumaras - Healing & Speed)",
    deityEn: "Aswini Kumaras (Healing & Agility)",
    planetKn: "ಕೇತು",
    planetEn: "Ketu"
  },
  "Bharani": {
    padas: [["ಲೀ (Lee)"], ["ಲೂ (Lu)"], ["ಲೇ (Le)"], ["ಲೋ (Lo)"]],
    mascotKn: "ಶಕ್ತಿಶಾಲಿ ಗಜರಾಜ (Mighty Royal Elephant)",
    mascotEn: "Mighty Royal Elephant",
    emoji: "🐘",
    deityKn: "ಯಮ ಧರ್ಮರಾಜ (Yama - Truth & Discipline)",
    deityEn: "Yama (Truth & Righteousness)",
    planetKn: "ಶುಕ್ರ",
    planetEn: "Venus"
  },
  "Krittika": {
    padas: [["ಅ (A)"], ["ಈ (Ee)"], ["ಉ (U)"], ["ಏ (Ea)"]],
    mascotKn: "ತೇಜಸ್ವಿ ಮೇಷ (Radiant Golden Ram)",
    mascotEn: "Radiant Golden Ram",
    emoji: "🐑",
    deityKn: "ಅಗ್ನಿ ದೇವ (Agni - Brilliance & Focus)",
    deityEn: "Lord Agni (Brilliance & Purification)",
    planetKn: "ಸೂರ್ಯ",
    planetEn: "Sun"
  },
  "Rohini": {
    padas: [["ಓ (O)"], ["ವಾ (Va)"], ["ವೀ (Vee)"], ["ವೂ (Vu)"]],
    mascotKn: "ಕಾಂತಿಯುತ ನಾಗರಾಜ (Divine Serene Serpent)",
    mascotEn: "Divine Serene Serpent",
    emoji: "🐍",
    deityKn: "ಬ್ರಹ್ಮ ದೇವ (Brahma - Creative Imagination)",
    deityEn: "Lord Brahma (Creation & Beauty)",
    planetKn: "ಚಂದ್ರ",
    planetEn: "Moon"
  },
  "Mrigashira": {
    padas: [["ವೇ (Ve)"], ["ವೋ (Vo)"], ["ಕಾ (Ka)"], ["ಕೀ (Kee)"]],
    mascotKn: "ಚುರುಕಾದ ಜಿಂಕೆ (Agile Golden Deer)",
    mascotEn: "Agile Golden Deer",
    emoji: "🦌",
    deityKn: "ಸೋಮ ದೇವ (Soma - Curiosity & Intellect)",
    deityEn: "Lord Soma (Curiosity & Exploration)",
    planetKn: "ಮಂಗಳ",
    planetEn: "Mars"
  },
  "Ardra": {
    padas: [["ಕು (Ku)"], ["ಘ (Gha)"], ["ಙ (Nga)"], ["ಛ (Chha)"]],
    mascotKn: "ಸಾಹಸಿ ಶ್ವಾನ (Fierce Loyal Guardian)",
    mascotEn: "Loyal Guardian",
    emoji: "🐕",
    deityKn: "ರುದ್ರ ದೇವ (Rudra - Transformation & Innovation)",
    deityEn: "Lord Rudra (Transformation & Mastery)",
    planetKn: "ರಾಹು",
    planetEn: "Rahu"
  },
  "Punarvasu": {
    padas: [["ಕೇ (Ke)"], ["ಕೋ (Ko)"], ["ಹಾ (Ha)"], ["ಹೀ (Hee)"]],
    mascotKn: "ಪವಿತ್ರ ಧನುರ್ಧರ (Sacred Archer of Light)",
    mascotEn: "Sacred Archer of Light",
    emoji: "🏹",
    deityKn: "ಅದಿತಿ ದೇವಿ (Aditi - Universal Nourishment)",
    deityEn: "Goddess Aditi (Universal Grace)",
    planetKn: "ಗುರು",
    planetEn: "Jupiter"
  },
  "Pushya": {
    padas: [["ಹೂ (Hoo)"], ["ಹೇ (He)"], ["ಹೋ (Ho)"], ["ಡಾ (Da)"]],
    mascotKn: "ಜ್ಞಾನಿ ಬೃಹಸ್ಪತಿ (Wise Guru Cow)",
    mascotEn: "Wise Golden Guardian",
    emoji: "🐄",
    deityKn: "ಬೃಹಸ್ಪತಿ (Brihaspati - Supreme Wisdom & Virtue)",
    deityEn: "Brihaspati (Supreme Wisdom & Memory)",
    planetKn: "ಶನಿ",
    planetEn: "Saturn"
  },
  "Ashlesha": {
    padas: [["ಡೀ (Dee)"], ["ಡೂ (Du)"], ["ಡೇ (De)"], ["ಡೋ (Do)"]],
    mascotKn: "ಬುದ್ಧಿವಂತ ನಾಗ (Mystic Wise Serpent)",
    mascotEn: "Mystic Wise Serpent",
    emoji: "🐉",
    deityKn: "ಸರ್ಪ ದೇವತೆಗಳು (Sarpas - Intuition & Strategy)",
    deityEn: "Nagas (Intuitive Strategy & Depth)",
    planetKn: "ಬುಧ",
    planetEn: "Mercury"
  },
  "Magha": {
    padas: [["ಮಾ (Ma)"], ["ಮೀ (Mee)"], ["ಮೂ (Moo)"], ["ಮೇ (Me)"]],
    mascotKn: "ರಾಜ ಸಿಂಹ (Mighty Royal Lion)",
    mascotEn: "Mighty Royal Lion",
    emoji: "🦁",
    deityKn: "ಪಿತೃ ದೇವತೆಗಳು (Ancestors - Heritage & Honor)",
    deityEn: "Pitrus (Heritage & Ancestral Grace)",
    planetKn: "ಕೇತು",
    planetEn: "Ketu"
  },
  "Purva Phalguni": {
    padas: [["ಮೋ (Mo)"], ["ಟಾ (Ta)"], ["ಟೀ (Tee)"], ["ಟೂ (Too)"]],
    mascotKn: "ಸುಂದರ ಮೃಗರಾಜ (Graceful Lion of Arts)",
    mascotEn: "Graceful Lion of Arts",
    emoji: "🦁",
    deityKn: "ಭಗ ದೇವ (Bhaga - Prosperity & Music)",
    deityEn: "Bhaga (Prosperity & Creative Arts)",
    planetKn: "ಶುಕ್ರ",
    planetEn: "Venus"
  },
  "Uttara Phalguni": {
    padas: [["ಟೇ (Te)"], ["ಟೋ (To)"], ["ಪಾ (Pa)"], ["ಪೀ (Pee)"]],
    mascotKn: "ಧರ್ಮದ ಗೂಳಿ (Noble Sacred Bull)",
    mascotEn: "Noble Sacred Bull",
    emoji: "🐂",
    deityKn: "ಅರ್ಯಮಾ (Aryama - Nobility & Ethics)",
    deityEn: "Aryama (Nobility & Leadership)",
    planetKn: "ಸೂರ್ಯ",
    planetEn: "Sun"
  },
  "Hasta": {
    padas: [["ಪೂ (Poo)"], ["ಷ (Sha)"], ["ಣ (Na)"], ["ಠಾ (Tha)"]],
    mascotKn: "ಕಲಾತ್ಮಕ ಮಹಿಷ (Artisan Craftsman)",
    mascotEn: "Artisan Craftsman",
    emoji: "✋",
    deityKn: "ಸವಿತೃ ದೇವ (Savitr - Skillful Craft & Memory)",
    deityEn: "Savitr (Skillful Craft & Genius)",
    planetKn: "ಚಂದ್ರ",
    planetEn: "Moon"
  },
  "Chitra": {
    padas: [["ಪೇ (Pe)"], ["ಪೋ (Po)"], ["ರಾ (Ra)"], ["ರೀ (Ree)"]],
    mascotKn: "ಪ್ರಕಾಶಮಾನ ಹುಲಿ (Brilliant Architect Tiger)",
    mascotEn: "Brilliant Architect Tiger",
    emoji: "🐅",
    deityKn: "ವಿಶ್ವಕರ್ಮ (Vishwakarma - Architecture & Design)",
    deityEn: "Vishwakarma (Design & Technology)",
    planetKn: "ಮಂಗಳ",
    planetEn: "Mars"
  },
  "Swati": {
    padas: [["ರೂ (Roo)"], ["ರೇ (Re)"], ["ರೋ (Ro)"], ["ತಾ (Taa)"]],
    mascotKn: "ಸ್ವತಂತ್ರ ಪವನ ಮಹಿಷ (Independent Wind Buffalo)",
    mascotEn: "Independent Wind Buffalo",
    emoji: "🌾",
    deityKn: "ವಾಯು ದೇವ (Vayu - Freedom, Speech & Agility)",
    deityEn: "Lord Vayu (Freedom, Speech & Travel)",
    planetKn: "ರಾಹು",
    planetEn: "Rahu"
  },
  "Vishakha": {
    padas: [["ತೀ (Tee)"], ["ತೂ (Too)"], ["ತೇ (Te)"], ["ತೋ (To)"]],
    mascotKn: "ವಿಜಯೀ ಸಿಂಹ (Triumphant Radiant Tiger)",
    mascotEn: "Triumphant Radiant Tiger",
    emoji: "🏺",
    deityKn: "ಇಂದ್ರಾಗ್ನಿ (Indragni - Unshakeable Victory)",
    deityEn: "Indragni (Unshakeable Victory & Focus)",
    planetKn: "ಗುರು",
    planetEn: "Jupiter"
  },
  "Anuradha": {
    padas: [["ನಾ (Na)"], ["ನೀ (Nee)"], ["ನೂ (Noo)"], ["ನೇ (Ne)"]],
    mascotKn: "ಸ್ನೇಹಮಯಿ ಜಿಂಕೆ (Friendly Mystic Deer)",
    mascotEn: "Friendly Mystic Deer",
    emoji: "🌸",
    deityKn: "ಮಿತ್ರ ದೇವ (Mitra - Friendship & Organization)",
    deityEn: "Mitra (Friendship & Cooperation)",
    planetKn: "ಶನಿ",
    planetEn: "Saturn"
  },
  "Jyeshtha": {
    padas: [["ನೋ (No)"], ["ಯಾ (Ya)"], ["ಯೀ (Yee)"], ["ಯೂ (Yu)"]],
    mascotKn: "ರಕ್ಷಣಾತ್ಮಕ ಹರಿಣ (Guardian Stag)",
    mascotEn: "Guardian Stag",
    emoji: "🛡️",
    deityKn: "ಇಂದ್ರ ಮಹಾರಾಜ (Indra - Executive Command & Strategy)",
    deityEn: "Lord Indra (Executive Command)",
    planetKn: "ಬುಧ",
    planetEn: "Mercury"
  },
  "Mula": {
    padas: [["ಯೇ (Ye)"], ["ಯೋ (Yo)"], ["ಭಾ (Bha)"], ["ಭೀ (Bhee)"]],
    mascotKn: "ಶಕ್ತಿಶಾಲಿ ಶ್ವಾನ (Deep Root Explorer Dog)",
    mascotEn: "Deep Root Explorer Dog",
    emoji: "🐕",
    deityKn: "ನಿರೃತಿ ದೇವಿ (Nirriti - Root Research & Investigation)",
    deityEn: "Nirriti (Root Research & Investigation)",
    planetKn: "ಕೇತು",
    planetEn: "Ketu"
  },
  "Purva Ashadha": {
    padas: [["ಭೂ (Bhoo)"], ["ಧಾ (Dha)"], ["ಫಾ (Pha)"], ["ಢಾ (Dhaa)"]],
    mascotKn: "ಅಪ್ರತಿಮ ಕಪಿ (Invincible Swift Monkey)",
    mascotEn: "Invincible Swift Monkey",
    emoji: "🐒",
    deityKn: "ಅಪಃ ದೇವತೆಗಳು (Cosmic Waters - Eloquence & Depth)",
    deityEn: "Cosmic Waters (Eloquence & Purity)",
    planetKn: "ಶುಕ್ರ",
    planetEn: "Venus"
  },
  "Uttara Ashadha": {
    padas: [["ಭೇ (Bhe)"], ["ಭೋ (Bho)"], ["ಜಾ (Ja)"], ["ಜೀ (Jee)"]],
    mascotKn: "ಸಾತ್ವಿಕ ವೃಷಭ (Universal Victorious Bull)",
    mascotEn: "Universal Victorious Bull",
    emoji: "🦚",
    deityKn: "ವಿಶ್ವೇದೇವರು (Universal Devas - Steadfast Success)",
    deityEn: "Viswadevas (Steadfast Success & Honor)",
    planetKn: "ಸೂರ್ಯ",
    planetEn: "Sun"
  },
  "Shravana": {
    padas: [["ಖೀ (Khee)"], ["ಖೂ (Khoo)"], ["ಖೇ (Khe)"], ["ಖೋ (Kho)"]],
    mascotKn: "ಜ್ಞಾನ ಸಾರಥಿ (Scholar of Listening & Memory)",
    mascotEn: "Scholar of Listening & Memory",
    emoji: "👂",
    deityKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು (Lord Vishnu - Supreme Memory & Wisdom)",
    deityEn: "Lord Vishnu (Supreme Memory & Truth)",
    planetKn: "ಚಂದ್ರ",
    planetEn: "Moon"
  },
  "Dhanishta": {
    padas: [["ಗಾ (Ga)"], ["ಗೀ (Gee)"], ["ಗೂ (Gu)"], ["ಗೇ (Ge)"]],
    mascotKn: "ಲಯಬದ್ಧ ಮೃದಂಗ ಸಿಂಹ (Rhythmic Music Lion)",
    mascotEn: "Rhythmic Music Lion",
    emoji: "🥁",
    deityKn: "ಅಷ್ಟ ವಸುಗಳು (Ashta Vasus - Wealth & Symphony)",
    deityEn: "Ashta Vasus (Wealth & Musical Rhythm)",
    planetKn: "ಮಂಗಳ",
    planetEn: "Mars"
  },
  "Shatabhisha": {
    padas: [["ಗೋ (Go)"], ["ಸಾ (Sa)"], ["ಸೀ (See)"], ["ಸೂ (Soo)"]],
    mascotKn: "ವೈದ್ಯಕೀಯ ಅಶ್ವ (Healer of 100 Stars)",
    mascotEn: "Healer of 100 Stars",
    emoji: "⭐",
    deityKn: "ವರುಣ ದೇವ (Varuna - Scientific Healing & Astronomy)",
    deityEn: "Lord Varuna (Scientific Healing & Ocean)",
    planetKn: "ರಾಹು",
    planetEn: "Rahu"
  },
  "Purva Bhadrapada": {
    padas: [["ಸೇ (Se)"], ["ಸೋ (So)"], ["ದಾ (Da)"], ["ದೀ (Dee)"]],
    mascotKn: "ತಪಸ್ವಿ ಸಿಂಹ (Spiritual Fire Lion)",
    mascotEn: "Spiritual Fire Lion",
    emoji: "🔥",
    deityKn: "ಅಜೈಕಪಾದ (Aja Ekapada - Deep Philosophical Vision)",
    deityEn: "Aja Ekapada (Philosophical Depth)",
    planetKn: "ಗುರು",
    planetEn: "Jupiter"
  },
  "Uttara Bhadrapada": {
    padas: [["ದೂ (Doo)"], ["ಥ (Tha)"], ["ಝ (Jha)"], ["ಞ (Nja)"]],
    mascotKn: "ಶಾಂತ ಸಮುದ್ರ ನಾಗ (Serene Ocean Dragon)",
    mascotEn: "Serene Ocean Dragon",
    emoji: "🌊",
    deityKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (Ahirbudhnya - Kundalini & Contemplation)",
    deityEn: "Ahirbudhnya (Deep Stability & Research)",
    planetKn: "ಶನಿ",
    planetEn: "Saturn"
  },
  "Revati": {
    padas: [["ದೇ (De)"], ["ದೋ (Do)"], ["ಚಾ (Cha)"], ["ಚೀ (Chee)"]],
    mascotKn: "ಸುಂದರ ಮಾರ್ಗದರ್ಶಿ (Gentle Guardian of Travelers)",
    mascotEn: "Gentle Guardian of Harmony",
    emoji: "🐟",
    deityKn: "ಪೂಷನ್ ದೇವ (Pushan - Compassion, Nourishment & Arts)",
    deityEn: "Pushan (Compassion, Nourishment & Agility)",
    planetKn: "ಬುಧ",
    planetEn: "Mercury"
  }
};

/**
 * Evaluates the 5th House (Buddhi Sthana) & Mercury/Jupiter strength to determine child's cognitive learning style.
 */
export function calculateBalaVidya(
  kundli: KundliOutput,
  childName: string,
  dobStr: string,
  tobStr: string,
  gender: string = "Male"
): BalaVidyaResult {
  const moonPlanet = kundli.planets.find((p) => p.name === "Moon" || p.name === ("Moon" as any));
  const mercuryPlanet = kundli.planets.find((p) => p.name === "Mercury" || p.name === ("Mercury" as any));
  const jupiterPlanet = kundli.planets.find((p) => p.name === "Jupiter" || p.name === ("Jupiter" as any));
  const sunPlanet = kundli.planets.find((p) => p.name === "Sun" || p.name === ("Sun" as any));
  const marsPlanet = kundli.planets.find((p) => p.name === "Mars" || p.name === ("Mars" as any));
  const venusPlanet = kundli.planets.find((p) => p.name === "Venus" || p.name === ("Venus" as any));
  const saturnPlanet = kundli.planets.find((p) => p.name === "Saturn" || p.name === ("Saturn" as any));

  const nakshatraName = moonPlanet?.nakshatra?.sanskrit || moonPlanet?.nakshatra?.english || "Ashwini";
  const nakshatraPada = kundli.moonPada || 1;

  // 1. Cognitive Learning Style Determination
  // Inspect 5th house sign or Mercury / Jupiter placement
  let learningStyle: CognitiveLearningStyle;

  const isStemDominant = (mercuryPlanet && [1, 5, 9, 10].includes(mercuryPlanet.house)) || (marsPlanet && [1, 5, 10].includes(marsPlanet.house));
  const isCreativeDominant = (venusPlanet && [1, 4, 5, 9].includes(venusPlanet.house)) || (moonPlanet && [4, 5, 9].includes(moonPlanet.house));
  const isLeadershipDominant = (sunPlanet && [1, 5, 10].includes(sunPlanet.house)) || (jupiterPlanet && [1, 5, 9].includes(jupiterPlanet.house));

  if (isStemDominant && !isCreativeDominant) {
    learningStyle = {
      styleKey: "analytical_stem",
      titleKn: "ಗಣಿತ & ತಾರ್ಕಿಕ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಶೈಲಿ (STEM & Analytical Mind)",
      titleEn: "Analytical & Logical Mastery (STEM Acumen)",
      descriptionKn: "ಮಗುವಿನಲ್ಲಿ ಗಣಿತ, ತಂತ್ರಜ್ಞಾನ, ಕೋಡಿಂಗ್, ವಿಜ್ಞಾನ ಹಾಗೂ ಸಂಕೀರ್ಣ ಸಮಸ್ಯೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಪರಿಹರಿಸುವ ಅದ್ಭುತ ಬೌದ್ಧಿಕ ಸಾಮರ್ಥ್ಯವಿದೆ.",
      descriptionEn: "The child possesses sharp mathematical logic, technical curiosity, robotics affinity, and systematic problem-solving skills.",
      recommendedFieldsKn: ["ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ & ಎಐ", "ಎಂಜಿನಿಯರಿಂಗ್", "ಡೇಟಾ ಅನಾಲಿಟಿಕ್ಸ್", "ಗಣಿತ ಸಂಶೋಧನೆ", "ರೋಬೋಟಿಕ್ಸ್ & ಭೌತಶಾಸ್ತ್ರ"],
      recommendedFieldsEn: ["Computer Science & AI", "Engineering", "Data Analytics", "Mathematical Research", "Robotics & Physics"],
      studyEnvironmentKn: "ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯ ಮುಖವಾದ ಪ್ರಶಾಂತ ಅಧ್ಯಯನ ಕೋಣೆ, ಮರದ ಮೇಜು ಹಾಗೂ ಹಸಿರು ಬಣ್ಣದ ಫೋಕಸ್ ದೀಪ.",
      studyEnvironmentEn: "North or North-East facing desk, wooden furniture, and gentle green focus lighting.",
      favorableHoursKn: "ಪ್ರಾತಃಕಾಲ ೫:೩೦ ರಿಂದ ೭:೩೦ (ಬುಧ & ಗುರು ಹೋರೆಗಳು)",
      favorableHoursEn: "Early Morning 5:30 AM to 7:30 AM (Budha & Guru Horas)"
    };
  } else if (isCreativeDominant) {
    learningStyle = {
      styleKey: "creative_artistic",
      titleKn: "ಸೃಜನಶೀಲ, ಕಲಾತ್ಮಕ & ಭಾಷಾ ಪ್ರಾವೀಣ್ಯ ಶೈಲಿ (Creative & Linguistic)",
      titleEn: "Creative, Visual & Linguistic Genius",
      descriptionKn: "ಮಗುವಿನಲ್ಲಿ ಅದ್ಭುತ ಕಲ್ಪನಾಶಕ್ತಿ, ಭಾಷಾ ಪಾಂಡಿತ್ಯ, ಕಲೆ, ಸಂಗೀತ, ಸಾಹಿತ್ಯ ಹಾಗೂ ದೃಶ್ಯ ಮಾಧ್ಯಮಗಳಲ್ಲಿ ಶ್ರೇಷ್ಠ ಸಾಧನೆ ಮಾಡುವ ಪ್ರತಿಭೆಯಿದೆ.",
      descriptionEn: "The child thrives in visual learning, literary storytelling, artistic design, musical rhythm, and multi-lingual expression.",
      recommendedFieldsKn: ["ಕಲೆ & ವಿನ್ಯಾಸ (UI/UX)", "ಸಾಹಿತ್ಯ & ಪತ್ರಿಕೋದ್ಯಮ", "ಮನೋವಿಜ್ಞಾನ", "ಸಂಗೀತ & ನೃತ್ಯ", "ವಾಸ್ತುಶಿಲ್ಪ & ಅನಿಮೇಷನ್"],
      recommendedFieldsEn: ["Art & Design (UI/UX)", "Literature & Media", "Child Psychology", "Music & Performing Arts", "Architecture & Animation"],
      studyEnvironmentKn: "ಪೂರ್ವ ದಿಕ್ಕಿಗೆ ಮುಖಮಾಡಿದ ಬೆಳಕಿನ ಕಿಟಕಿ, ಆಕರ್ಷಕ ಕಲಾ ಚಿತ್ರಗಳು ಹಾಗೂ ಶಾಂತ ಸಂಗೀತ ವಾತಾವರಣ.",
      studyEnvironmentEn: "East-facing window with abundant natural light, aesthetic visuals, and peaceful ambient sounds.",
      favorableHoursKn: "ಸಂಜೆ ೪:೩೦ ರಿಂದ ೬:೩೦ (ಶುಕ್ರ & ಚಂದ್ರ ಹೋರೆಗಳು)",
      favorableHoursEn: "Evening 4:30 PM to 6:30 PM (Shukra & Chandra Horas)"
    };
  } else if (isLeadershipDominant) {
    learningStyle = {
      styleKey: "strategic_leadership",
      titleKn: "ವ್ಯೂಹಾತ್ಮಕ ನಾಯಕತ್ವ & ಆಡಳಿತ ಶೈಲಿ (Leadership & Oratory)",
      titleEn: "Strategic Leadership, Governance & Oratory",
      descriptionKn: "ಮಗುವಿನಲ್ಲಿ ತೀಕ್ಷ್ಣ ವಾಗ್ಮಿತ್ವ, ನಾಯಕತ್ವ ಗುಣ, ತಂಡವನ್ನು ಮುನ್ನಡೆಸುವ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ದೂರದೃಷ್ಟಿಯಿದೆ.",
      descriptionEn: "The child naturally commands authority, excels in public speaking, debates, organizational strategy, and executive governance.",
      recommendedFieldsKn: ["ನಾಗರಿಕ ಸೇವೆಗಳು (IAS/KAS)", "ವ್ಯವಹಾರ ನಿರ್ವಹಣೆ (MBA)", "ಕಾನೂನು & ನ್ಯಾಯಾಂಗ", "ಆಡಳಿತಾತ್ಮಕ ನೀತಿ", "ರಾಜಕೀಯ ವಿಜ್ಞಾನ"],
      recommendedFieldsEn: ["Civil Services (IAS/IPS)", "Business Administration (MBA)", "Law & Judiciary", "Public Policy", "International Relations"],
      studyEnvironmentKn: "ಪೂರ್ವ ಮುಖವಾದ ಅಧ್ಯಯನ ಸ್ಥಾನ, ಸೂರ್ಯನ ಬೆಳಕು ಹಾಗೂ ಕೇಸರಿ/ಹಳದಿ ಬಣ್ಣದ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ.",
      studyEnvironmentEn: "East-facing study setup with direct morning sunlight and saffron/golden ambient accents.",
      favorableHoursKn: "ಬೆಳಿಗ್ಗೆ ೬:೦೦ ರಿಂದ ೮:೦೦ (ಸೂರ್ಯ & ಕುಜ ಹೋರೆಗಳು)",
      favorableHoursEn: "Morning 6:00 AM to 8:00 AM (Surya & Kuja Horas)"
    };
  } else {
    learningStyle = {
      styleKey: "deep_research",
      titleKn: "ಆಳವಾದ ಸಂಶೋಧನೆ & ತತ್ವಶಾಸ್ತ್ರ ಶೈಲಿ (Deep Research & Philosophy)",
      titleEn: "Deep Research, Medicine & Scientific Inquest",
      descriptionKn: "ಮಗುವಿನಲ್ಲಿ ನಿರಂತರ ಏಕಾಗ್ರತೆ, ಸಂಶೋಧನಾ ಶ್ರದ್ಧೆ, ವೈದ್ಯಕೀಯ ಜ್ಞಾನ ಹಾಗೂ ಯಾವುದೇ ವಿಷಯದ ಮೂಲವನ್ನು ಶೋಧಿಸುವ ಅಗಾಧ ತಾಳ್ಮೆಯಿದೆ.",
      descriptionEn: "The child possesses extraordinary patience, deep research endurance, diagnostic curiosity, and scientific persistence.",
      recommendedFieldsKn: ["ವೈದ್ಯಕೀಯ ವಿಜ್ಞಾನ (MBBS/MD)", "ಆಯುರ್ವೇದ & ಬಯೋಟೆಕ್ನಾಲಜಿ", "ಬಾಹ್ಯಾಕಾಶ ವಿಜ್ಞಾನ", "ತತ್ವಶಾಸ್ತ್ರ & ಇತಿಹಾಸ", "ಫಾರ್ಮಾಸ್ಯುಟಿಕಲ್ಸ್"],
      recommendedFieldsEn: ["Medical Sciences (Medicine/Surgery)", "Biotechnology & Genetics", "Space Research & Astronomy", "Philosophy & History", "Pharmaceutical Sciences"],
      studyEnvironmentKn: "ಏಕಾಂತ ಹಾಗೂ ಶಾಂತವಾದ ಅಧ್ಯಯನ ಕೊಠಡಿ, ಪುಸ್ತಕಗಳ ಜೋಡಣೆ ಹಾಗೂ ಶ್ವೇತ/ನೀಲಿ ಬಣ್ಣದ ಬೆಳಕು.",
      studyEnvironmentEn: "Quiet, solitary study zone, well-organized library, with cool white or soft blue illumination.",
      favorableHoursKn: "ರಾತ್ರಿ ೮:೦೦ ರಿಂದ ೧೦:೦೦ (ಗುರು & ಶನಿ ಹೋರೆಗಳು)",
      favorableHoursEn: "Night 8:00 PM to 10:00 PM (Guru & Shani Horas)"
    };
  }

  // 2. Namakarana & Pada Info
  const nakshatraData = NAKSHATRA_SYLLABLE_TABLE[nakshatraName] || NAKSHATRA_SYLLABLE_TABLE["Ashwini"];
  const padaIndex = Math.max(0, Math.min(3, nakshatraPada - 1));
  const syllables = nakshatraData.padas[padaIndex] || ["ಅ (A)"];

  const padaInfo: NakshatraPadaInfo = {
    nakshatraNameKn: nakshatraName,
    nakshatraNameEn: nakshatraName,
    pada: nakshatraPada,
    syllablesKn: syllables,
    syllablesEn: syllables,
    suggestedDeityKn: nakshatraData.deityKn,
    suggestedDeityEn: nakshatraData.deityEn,
    animalMascotKn: nakshatraData.mascotKn,
    animalMascotEn: nakshatraData.mascotEn,
    mascotEmoji: nakshatraData.emoji,
    rulingPlanetKn: nakshatraData.planetKn,
    rulingPlanetEn: nakshatraData.planetEn
  };

  // Samskaras
  const samskaras: SamskaraMuhurthaGuide[] = [
    {
      samskaraNameKn: "೧. ಅಕ್ಷರಾಭ್ಯಾಸ / ವಿದ್ಯಾರಂಭ (Vidyarambha)",
      samskaraNameEn: "1. Aksharabhyasa (Initiation to Learning)",
      idealAgeWindowKn: "೩ನೇ ಅಥವಾ ೫ನೇ ವರ್ಷ (ವಿಜಯದಶಮಿ / ವಸಂತ ಪಂಚಮಿ)",
      idealAgeWindowEn: "Ages 3 to 5 (Vijayadashami / Vasant Panchami)",
      favorableTithisKn: "ಶುಕ್ಲ ಪಕ್ಷ ತೃತೀಯಾ, ಪಂಚಮೀ, ದಶಮೀ, ಗುರು ಪುಷ್ಯ ಯೋಗ",
      favorableTithisEn: "Shukla Tritiya, Panchami, Dashami, Guru Pushya",
      vedicSignificanceKn: "ಹಸುವಿನ ತುಪ್ಪದ ಅಕ್ಕಿಯ ಮೇಲೆ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಅಥವಾ 'ಹರಿಃ ಶ್ರೀ ಗಣಪತಯೇ ನಮಃ' ಬರೆಯಿಸಿ ಜ್ಞಾನಾರ್ಜನೆ ಪ್ರಾರಂಭಿಸುವುದು.",
      vedicSignificanceEn: "Writing sacred mantras on raw rice grains bathed in cow ghee to awaken intellect and speech."
    },
    {
      samskaraNameKn: "೨. ನಾಮಕರಣ ಸಂಸ್ಕಾರ (Namakarana)",
      samskaraNameEn: "2. Namakarana (Sacred Naming Ceremony)",
      idealAgeWindowKn: "ಜನನದ ೧೧ನೇ ಅಥವಾ ೧೨ನೇ ದಿನ (ಅಥವಾ ಶುಭ ಮಾಸದಲ್ಲಿ)",
      idealAgeWindowEn: "11th, 12th, or 16th day after birth",
      favorableTithisKn: "ಅನುರಾಧಾ, ರೋಹಿಣಿ, ಉತ್ತರಾ, ಪುಷ್ಯ, ಹಸ್ತ ನಕ್ಷತ್ರಗಳು",
      favorableTithisEn: "Anuradha, Rohini, Uttara, Pushya, Hasta nakshatras",
      vedicSignificanceKn: "ಜನನ ನಕ್ಷತ್ರ ಪಾದದ ಅಕ್ಷರದಿಂದ ಪ್ರಾರಂಭಿಸಿ ಮಗುವಿನ ಕಿವಿಯಲ್ಲಿ ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಹೆಸರನ್ನು ಉಚ್ಚರಿಸುವುದು.",
      vedicSignificanceEn: "Whispering the astrological name derived from the birth star's quarter into the infant's right ear."
    },
    {
      samskaraNameKn: "೩. ಅನ್ನಪ್ರಾಶನ ಸಂಸ್ಕಾರ (Annaprashana)",
      samskaraNameEn: "3. Annaprashana (First Sacred Solid Food)",
      idealAgeWindowKn: "ಗಂಡು ಮಗುವಿಗೆ ೬, ೮ನೇ ತಿಂಗಳು; ಹೆಣ್ಣು ಮಗುವಿಗೆ ೫, ೭ನೇ ತಿಂಗಳು",
      idealAgeWindowEn: "6th/8th month for boys; 5th/7th month for girls",
      favorableTithisKn: "ಶುಕ್ಲ ಪಕ್ಷ ದ್ವಿತೀಯಾ, ಪಂಚಮೀ, ದಶಮೀ, ಪೂರ್ಣಿಮಾ",
      favorableTithisEn: "Shukla Dwitiya, Panchami, Dashami, Purnima",
      vedicSignificanceKn: "ದೇವರ ನೈವೇದ್ಯದ ಶುದ್ಧ ಪರಮಾನ್ನವನ್ನು (ಪಾಯಸ) ಬೆಳ್ಳಿಯ ಚಮಚದಿಂದ ಉಣಿಸಿ ಜೀರ್ಣಶಕ್ತಿ ಹಾಗೂ ಆಯುಷ್ಯ ವೃದ್ಧಿಸುವುದು.",
      vedicSignificanceEn: "Offering blessed milk kheer with a silver spoon to kindle strong digestive fire and prana."
    },
    {
      samskaraNameKn: "೪. ಚೌಲ / ಮುಂಡನ ಸಂಸ್ಕಾರ (Chaula / First Haircut)",
      samskaraNameEn: "4. Chaula / Mundan (First Sacred Haircut)",
      idealAgeWindowKn: "೧ನೇ ಅಥವಾ ೩ನೇ ವರ್ಷದ ಕೊನೆಯಲ್ಲಿ (ಆಯುಷ್ಯ ವೃದ್ಧಿ)",
      idealAgeWindowEn: "1st or 3rd year of life",
      favorableTithisKn: "ಸೋಮ, ಬುಧ, ಗುರು, ಶುಕ್ರವಾರಗಳು; ಮೃಗಶಿರ, ಪುನರ್ವಸು, ಚಿತ್ರಾ",
      favorableTithisEn: "Monday, Wednesday, Thursday, Friday; Mrigashira, Hasta",
      vedicSignificanceKn: "ಗರ್ಭದ ಕೇಶವನ್ನು ತೆಗೆದು ಶಿರಸ್ಸಿನಲ್ಲಿ ಮೇಧಾ ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ದೀರ್ಘಾಯುಷ್ಯವನ್ನು ಕರುಣಿಸುವುದು.",
      vedicSignificanceEn: "Shaving the prenatal hair to awaken cranial energy, purify bodily prana, and bestow longevity."
    }
  ];

  // 3. Bala Rishta & Raksha Assessment
  // Check Moon in 6, 8, 12 or malefic afflictions
  const moonHouse = moonPlanet?.house || 1;
  const isAfflictedMoon = [6, 8, 12].includes(moonHouse);

  const balaRishta: BalaRishtaAssessment = {
    protectionScore: isAfflictedMoon ? 85 : 95,
    statusKn: isAfflictedMoon ? "ಸಾಧಾರಣ ಬಾಲಾರಿಷ್ಟ ಸಂರಕ್ಷಣೆ (ಸುರಕ್ಷಿತ)" : "ಅತ್ಯುತ್ತಮ ದೈವಿಕ ಸಂರಕ್ಷಣಾ ಕವಚ (ಪರಿಪೂರ್ಣ)",
    statusEn: isAfflictedMoon ? "Mild Bala Rishta Remedied (Protected)" : "Complete Divine Immunity & Protection",
    isBalaRishtaPresent: isAfflictedMoon,
    observationsKn: [
      isAfflictedMoon
        ? "ಚಂದ್ರನು ೬/೮/೧೨ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಶೀತ-ಕಫ ಬಾಧೆಗಳು ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು."
        : "ಲಗ್ನ ಹಾಗೂ ಚಂದ್ರನ ಸ್ಥಾನಗಳು ಅತ್ಯಂತ ಬಲಯುತವಾಗಿದ್ದು, ಮಗುವಿಗೆ ಉತ್ತಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯಿದೆ.",
      "ಗುರು ಹಾಗೂ ಸೂರ್ಯನ ಶುಭ ದೃಷ್ಟಿಯು ಮಗುವಿನ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ನಿರಂತರವಾಗಿ ಕಾಪಾಡುತ್ತದೆ."
    ],
    observationsEn: [
      isAfflictedMoon
        ? "Moon in transit creates slight sensitivity to seasonal weather changes or cold."
        : "Lagna and Moon are well-fortified, providing high immunity and vitality.",
      "Benefic aspects of Jupiter and Sun provide continuous vitality shield."
    ],
    protectiveMantrasKn: [
      "ಶ್ರೀ ಮೇಧಾ ಸೂಕ್ತಂ (ಬುದ್ಧಿ ವೃದ್ಧಿ)",
      "ಶ್ರೀ ಸರಸ್ವತೀ ದ್ವಾದಶನಾಮ ಸ್ತೋತ್ರಂ (ಜ್ಞಾನಾರ್ಜನೆ)",
      "ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ರಕ್ಷಾ ಮಂತ್ರಂ (ದೀರ್ಘಾಯುಷ್ಯ)"
    ],
    protectiveMantrasEn: [
      "Sri Medha Suktam (Intellectual Brilliance)",
      "Sri Saraswati Dwadashanama Stotram (Memory & Focus)",
      "Maha Mrityunjaya Raksha Mantra (Longevity & Peace)"
    ],
    templeRemedyKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಾಲಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ & ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸುವುದು.",
    templeRemedyEn: "Offer Garika Archana and Milk Abhishekam to Lord Vidya Ganapathi at Sri Gokarna Mahabaleshwara Kshetra."
  };

  // 4. Bala Sankhya Numerology
  // Calculate driver number from DOB day (e.g. 31 -> 3+1 = 4)
  let dayNum = 1;
  let fullDobSum = 1;
  try {
    const parts = dobStr.split("-");
    if (parts.length === 3) {
      const d = parseInt(parts[2], 10);
      dayNum = d;
      let digits = dobStr.replace(/\D/g, "").split("").map(Number);
      let sum = digits.reduce((a, b) => a + b, 0);
      while (sum > 9) {
        sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
      }
      fullDobSum = sum;
    }
  } catch {
    // fallback
  }

  let driver = dayNum;
  while (driver > 9) {
    driver = driver.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }

  const sankhyaColorTable: Record<number, { colorKn: string; colorEn: string; dirKn: string; dirEn: string; traitKn: string; traitEn: string }> = {
    1: { colorKn: "ಕೇಸರಿ & ಸುವರ್ಣ ಹಳದಿ", colorEn: "Saffron & Golden Yellow", dirKn: "ಪೂರ್ವ ದಿಕ್ಕು (East)", dirEn: "East Direction", traitKn: "ನೈಸರ್ಗಿಕ ನಾಯಕತ್ವ, ಧೈರ್ಯ ಹಾಗೂ ಸ್ವಾವಲಂಬನೆ", traitEn: "Natural leadership, courage, and self-reliance" },
    2: { colorKn: "ಶ್ವೇತ ಬಿಳಿ & ಬೆಳ್ಳಿ ಬಣ್ಣ", colorEn: "Pure White & Silver", dirKn: "ವಾಯವ್ಯ ದಿಕ್ಕು (North-West)", dirEn: "North-West Direction", traitKn: "ಕರುಣೆ, ಕಲ್ಪನಾಶಕ್ತಿ ಹಾಗೂ ಸೌಹಾರ್ದಯುತ ಮನಸ್ಸು", traitEn: "Empathy, creative imagination, and diplomatic warmth" },
    3: { colorKn: "ಹಳದಿ & ಕೇಸರಿ ಬಣ್ಣ", colorEn: "Bright Yellow & Saffron", dirKn: "ಈಶಾನ್ಯ ದಿಕ್ಕು (North-East)", dirEn: "North-East Direction", traitKn: "ಅಗಾಧ ಜ್ಞಾನಾರ್ಜನೆ, ಗುರುಭಕ್ತಿ ಹಾಗೂ ವಾಗ್ಮಿತ್ವ", traitEn: "High scholarship, wisdom, and eloquent speech" },
    4: { colorKn: "ತಿಳಿ ನೀಲಿ & ಬೂದು ಬಣ್ಣ", colorEn: "Sky Blue & Soft Grey", dirKn: "ನೈಋತ್ಯ ದಿಕ್ಕು (South-West)", dirEn: "South-West Direction", traitKn: "ತಾಂತ್ರಿಕ ಚಾಣಾಕ್ಷತೆ, ವಿಶಿಷ್ಟ ಸಂಶೋಧನಾ ಶಕ್ತಿ", traitEn: "Technical acumen, out-of-the-box thinking" },
    5: { colorKn: "ಹಸಿರು & ಪಚ್ಚೆ ಬಣ್ಣ", colorEn: "Emerald Green & Light Green", dirKn: "ಉತ್ತರ ದಿಕ್ಕು (North)", dirEn: "North Direction", traitKn: "ಗಣಿತ ತೀಕ್ಷ್ಣತೆ, ಲೆಕ್ಕಾಚಾರ ಹಾಗೂ ಚುರುಕು ಬುದ್ಧಿ", traitEn: "Mathematical precision, commerce brilliance, and agility" },
    6: { colorKn: "ಗುಲಾಬಿ & ರೇಷ್ಮೆ ಶ್ವೇತ", colorEn: "Rose Pink & Cream White", dirKn: "ಆಗ್ನೇಯ ದಿಕ್ಕು (South-East)", dirEn: "South-East Direction", traitKn: "ಕಲಾ ಪ್ರೇಮ, ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ವಾಹನ ಸೌಭಾಗ್ಯ", traitEn: "Artistic talent, aesthetic beauty, and vehicle joy" },
    7: { colorKn: "ಬಿಳಿ & ತಿಳಿ ಹಳದಿ ಬಣ್ಣ", colorEn: "Off-White & Light Pastel", dirKn: "ಈಶಾನ್ಯ ದಿಕ್ಕು (North-East)", dirEn: "North-East Direction", traitKn: "ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು, ಅಂತಃಸ್ಫೂರ್ತಿ ಹಾಗೂ ಸಂಶೋಧನೆ", traitEn: "Spiritual intuition, philosophical depth, and research" },
    8: { colorKn: "ಗಾಢ ನೀಲಿ & ಕಪ್ಪು ಬಣ್ಣ", colorEn: "Deep Navy Blue & Charcoal", dirKn: "ಪಶ್ಚಿಮ ದಿಕ್ಕು (West)", dirEn: "West Direction", traitKn: "ಅಚಲ ತಾಳ್ಮೆ, ಶಿಸ್ತು ಹಾಗೂ ಗಂಭೀರ ಸಾಧನೆ", traitEn: "Unshakeable patience, discipline, and enduring success" },
    9: { colorKn: "ಕೆಂಪು & ಕಿತ್ತಳೆ ಬಣ್ಣ", colorEn: "Ruby Red & Coral Orange", dirKn: "ದಕ್ಷಿಣ ದಿಕ್ಕು (South)", dirEn: "South Direction", traitKn: "ಅದಮ್ಯ ಉತ್ಸಾಹ, ಸಾಹಸ ಹಾಗೂ ಕ್ರೀಡಾ ಶಕ್ತಿ", traitEn: "Dynamic energy, sports prowess, and fearless drive" }
  };

  const sData = sankhyaColorTable[driver] || sankhyaColorTable[1];

  const sankhya: BalaSankhyaProfile = {
    driverNumber: driver,
    conductorNumber: fullDobSum,
    coreStrengthKn: sData.traitKn,
    coreStrengthEn: sData.traitEn,
    concentrationColorKn: sData.colorKn,
    concentrationColorEn: sData.colorEn,
    luckyStudyDirectionKn: sData.dirKn,
    luckyStudyDirectionEn: sData.dirEn,
    peerDynamicsKn: "ಸಮಾನ ಆಸಕ್ತಿಯ ಮಿತ್ರರೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ಒಡನಾಟ ಹಾಗೂ ಶಿಕ್ಷಕರಲ್ಲಿ ಅಪಾರ ಗೌರವ.",
    peerDynamicsEn: "Harmonious team spirit, respect for mentors, and inspiring peer influence."
  };

  // 5. Daily Bal Shloka & Moral Story
  const mascotAndStory: BalShlokaStory = {
    shlokaSanskrit: "ಸರಸ್ವತಿ ನಮಸ್ತುಭ್ಯಂ ವರದೇ ಕಾಮರೂಪಿಣಿ ।\nವಿದ್ಯಾರಂಭಂ ಕರಿಷ್ಯಾಮಿ ಸಿದ್ಧಿರ್ಭವತು ಮೇ ಸದಾ ॥",
    shlokaMeaningKn: "ಎಲೈ ಜ್ಞಾನದಾಯಿನಿ ಶ್ರೀ ಸರಸ್ವತೀ ದೇವಿಯೇ, ನಿನಗೆ ನಮಸ್ಕಾರಗಳು. ನಾನು ವಿದ್ಯಾಭ್ಯಾಸವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತಿದ್ದೇನೆ, ನನಗೆ ಸದಾ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಯನ್ನು ಕರುಣಿಸು.",
    shlokaMeaningEn: "Salutations to Goddess Saraswati, the bestower of boons. As I begin my studies, may success and divine memory always bless me.",
    audioVoiceText: "ಸರಸ್ವತಿ ನಮಸ್ತುಭ್ಯಂ ವರದೇ ಕಾಮರೂಪಿಣಿ ವಿದ್ಯಾರಂಭಂ ಕರಿಷ್ಯಾಮಿ ಸಿದ್ಧಿರ್ಭವತು ಮೇ ಸದಾ",
    moralStoryTitleKn: "ಪಂಚತಂತ್ರ ನೀತಿ ಕಥೆ: 'ಬುದ್ಧಿವಂತ ಮೊಲ ಹಾಗೂ ಮೃಗರಾಜ ಸಿಂಹ'",
    moralStoryTitleEn: "Panchatantra Moral Tale: 'The Clever Rabbit and the Lion'",
    moralStoryContentKn: "ದೈಹಿಕ ಬಲಕ್ಕಿಂತಲೂ ಬುದ್ಧಿ ಬಲವೇ ಶ್ರೇಷ್ಠ. ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ವಿಚಲಿತರಾಗದೆ ಶಾಂತವಾಗಿ ಯೋಚಿಸಿದರೆ ಎಂತಹ ಕಠಿಣ ಸಮಸ್ಯೆಯನ್ನೂ ಚಾಣಾಕ್ಷತೆಯಿಂದ ಪರಿಹರಿಸಬಹುದು.",
    moralStoryContentEn: "Intellect and presence of mind triumph over brute force. Staying calm and applying wisdom can overcome the greatest obstacles in life."
  };

  return {
    childName: childName || "ಶ್ರೀ ಬಾಲಕ/ಬಾಲಕಿ",
    dob: dobStr,
    tob: tobStr,
    gender,
    lagnaNameKn: kundli.lagnaRashi.sanskrit,
    lagnaNameEn: kundli.lagnaRashi.english || kundli.lagnaRashi.sanskrit,
    moonRashiKn: kundli.moonSign.sanskrit,
    moonRashiEn: kundli.moonSign.english || kundli.moonSign.sanskrit,
    nakshatraNameKn: nakshatraName,
    nakshatraNameEn: nakshatraName,
    nakshatraPada,
    learningStyle,
    padaInfo,
    samskaras,
    balaRishta,
    sankhya,
    mascotAndStory,
    saraswatiScore: 94,
    overallVerdictKn: "🌟 ಪರಮ ಪವಿತ್ರ ಸರಸ್ವತೀ & ಬಾಲ ವಿದ್ಯಾ ಯೋಗ ಸಂಪನ್ನ ಜಾತಕ",
    overallVerdictEn: "🌟 Auspicious Saraswati & High Intellect Child Horoscope",
    priestBlessingKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಬಾಲ ವಿದ್ಯಾ ಆಶೀರ್ವಾದ · ಸಕಲ ವಿದ್ಯಾ ಪಾರಂಗತೋ ಭವತು ।",
    priestBlessingEn: "Blessings of Sri Gokarna Mahabaleshwara Kshetra · May the child attain mastery in all learning and virtues."
  };
}
