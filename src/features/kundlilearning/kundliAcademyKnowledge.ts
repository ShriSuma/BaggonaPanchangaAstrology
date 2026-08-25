/**
 * Classical Vedic Kundli Academy & Janma Patrika Learning Engine.
 * 
 * Exhaustive, authentic, 100% deterministic knowledge base for all 12 Houses (Bhavas).
 * Sourced from:
 * - Brihat Parashara Hora Shastra (Bhava Adhyaya, Graha Phala Adhyaya)
 * - Jataka Parijata & Phaladeepika
 * - Saravali & Uttara Kalamrita
 */

export type HouseDignity = {
  exaltedPlanetKn: string;
  exaltedPlanetEn: string;
  exaltedDegree: string;
  exaltationReasonKn: string;
  exaltationReasonEn: string;
  debilitatedPlanetKn: string;
  debilitatedPlanetEn: string;
  debilitatedDegree: string;
  debilitationReasonKn: string;
  debilitationReasonEn: string;
};

export type GrahaPlacementEffect = {
  planetKn: string;
  planetEn: string;
  symbol: string;
  nature: "benefic" | "malefic" | "neutral";
  effectTitleKn: string;
  effectTitleEn: string;
  descriptionKn: string;
  descriptionEn: string;
  keyGiftsKn: string[];
  keyGiftsEn: string[];
  watchOutsKn: string[];
  watchOutsEn: string[];
};

export type HouseQuizQuestion = {
  questionKn: string;
  questionEn: string;
  optionsKn: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationKn: string;
  explanationEn: string;
};

export type HouseLearningModule = {
  houseNumber: number;
  sanskritName: string;
  kannadaName: string;
  englishName: string;
  naturalRashiKn: string;
  naturalRashiEn: string;
  naturalLordKn: string;
  naturalLordEn: string;
  bhavaCategoryKn: string;
  bhavaCategoryEn: string;
  elementKn: string;
  elementEn: string;
  bodyPartsKn: string;
  bodyPartsEn: string;
  lifeThemesKn: string[];
  lifeThemesEn: string[];
  simpleIntroKn: string;
  simpleIntroEn: string;
  dignity: HouseDignity;
  friendshipsKn: {
    friends: string[];
    enemies: string[];
    neutrals: string[];
  };
  friendshipsEn: {
    friends: string[];
    enemies: string[];
    neutrals: string[];
  };
  grahaEffects: GrahaPlacementEffect[];
  quiz: HouseQuizQuestion[];
};

export const HOUSE_LEARNING_MODULES: Record<number, HouseLearningModule> = {
  1: {
    houseNumber: 1,
    sanskritName: "ತನು ಭಾವ (Tanu Bhava / Lagna)",
    kannadaName: "೧ನೇ ಮನೆ - ತನು ಭಾವ (ಜನ್ಮ ಲಗ್ನ)",
    englishName: "1st House - Tanu Bhava (The Self & Physical Body)",
    naturalRashiKn: "ಮೇಷ (Mesha / Aries)",
    naturalRashiEn: "Mesha (Aries)",
    naturalLordKn: "ಮಂಗಳ (Kuja / Mars)",
    naturalLordEn: "Mars (Kuja)",
    bhavaCategoryKn: "ಕೇಂದ್ರ & ತ್ರಿಕೋಣ ಸ್ಥಾನ (Supreme Kendra & Trikona)",
    bhavaCategoryEn: "Dharma Trikona & Prime Kendra",
    elementKn: "ಅಗ್ನಿ ತತ್ತ್ವ (Fire Element - Vital Life Force)",
    elementEn: "Fire Element (Prana & Vital Energy)",
    bodyPartsKn: "ಶಿರಸ್ಸು, ಮುಖ, ಮಿದುಳು, ಶರೀರದ ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ & ತೇಜಸ್ಸು",
    bodyPartsEn: "Head, Brain, Face, Cranium, General Vitality & Complexion",
    lifeThemesKn: ["ವ್ಯಕ್ತಿತ್ವ", "ಆತ್ಮವಿಶ್ವಾಸ", "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ", "ಪ್ರಾರಂಭ & ನಾಯಕತ್ವ", "ತೇಜಸ್ಸು"],
    lifeThemesEn: ["Personality", "Self-Confidence", "Physical Vitality", "Initiative", "Radiance"],
    simpleIntroKn: "೧ನೇ ಮನೆಯೇ ನಿಮ್ಮ ಜಾತಕದ ಪ್ರವೇಶ ದ್ವಾರ! ಇದು ನಿಮ್ಮ ಶರೀರ, ರೂಪ, ವರ್ತನೆ ಹಾಗೂ ಜೀವನವನ್ನು ಹೇಗೆ ಮುನ್ನಡೆಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 1st House is the gateway of your horoscope! It represents your physical body, appearance, self-identity, and health vitality.",
    dignity: {
      exaltedPlanetKn: "ಸೂರ್ಯ (Surya - 10° ವರೆಗೆ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Sun (Surya - Exalted up to 10°)",
      exaltedDegree: "10° Mesha",
      exaltationReasonKn: "ಸೂರ್ಯನು ಆತ್ಮಕಾರಕ ಹಾಗೂ ರಾಜ. ಅಗ್ನಿ ತತ್ತ್ವದ ಮೊದಲ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಗರಿಷ್ಠ ತೇಜಸ್ಸು ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Sun is the king and soul signifier. In the first fiery sign, Sun achieves maximum illumination and vitality.",
      debilitatedPlanetKn: "ಶನಿ (Shani - 20° ಯಲ್ಲಿ ಪರಮ ನೀಚ)",
      debilitatedPlanetEn: "Saturn (Shani - Debilitated at 20°)",
      debilitatedDegree: "20° Mesha",
      debilitationReasonKn: "ಶನಿಯು ತಂಪು ಮತ್ತು ಸೇವಕ ಗ್ರಹ. ಬೆಂಕಿಯಂತಹ ತೇಜಸ್ಸಿನ ೧ನೇ ಮನೆಯಲ್ಲಿ ಶನಿಗೆ ಆಲಸ್ಯ ಅಥವಾ ಕಠಿಣ ಸಂಘರ್ಷ ಉಂಟಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Saturn represents coolness and patience. The intense pioneering fire of the 1st house creates friction for Saturn."
    },
    friendshipsKn: {
      friends: ["ಸೂರ್ಯ (Surya)", "ಗುರು (Guru)", "ಚಂದ್ರ (Chandra)"],
      enemies: ["ಬುಧ (Budha)", "ಶುಕ್ರ (Shukra)"],
      neutrals: ["ಶನಿ (Shani)"]
    },
    friendshipsEn: {
      friends: ["Sun (Surya)", "Jupiter (Guru)", "Moon (Chandra)"],
      enemies: ["Mercury (Budha)", "Venus (Shukra)"],
      neutrals: ["Saturn (Shani)"]
    },
    grahaEffects: [
      {
        planetKn: "ಸೂರ್ಯ (Surya)",
        planetEn: "Sun (Surya)",
        symbol: "☀️",
        nature: "benefic",
        effectTitleKn: "ರಾಜತೇಜಸ್ಸು & ನಾಯಕತ್ವ (Surya in 1st House)",
        effectTitleEn: "Royal Radiance & Leadership (Sun in 1st)",
        descriptionKn: "ವ್ಯಕ್ತಿಗೆ ಅದ್ಭುತ ಆತ್ಮವಿಶ್ವಾಸ, ಧೈರ್ಯ, ಉತ್ತಮ ಆರೋಗ್ಯ, ಸರ್ಕಾರಿ ಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವ ಸಾಮರ್ಥ್ಯ ದೊರೆಯುತ್ತದೆ.",
        descriptionEn: "Bestows commanding leadership, magnetic self-confidence, strong immunity, and high social dignity.",
        keyGiftsKn: ["ಉತ್ತಮ ನಾಯಕತ್ವ", "ದೃಢ ನಿರ್ಧಾರ", "ತೇಜಸ್ವಿ ಮುಖಕಾಂತಿ"],
        keyGiftsEn: ["Natural Leadership", "Decisiveness", "Glowing Vitality"],
        watchOutsKn: ["ಅತಿಯಾದ ಅಹಂಕಾರ", "ಕೋಪ ನಿಯಂತ್ರಣ"],
        watchOutsEn: ["Ego traps", "Hot-headed impulses"]
      },
      {
        planetKn: "ಚಂದ್ರ (Chandra)",
        planetEn: "Moon (Chandra)",
        symbol: "🌙",
        nature: "benefic",
        effectTitleKn: "ಸೌಮ್ಯತೆ, ಕರುಣೆ & ಸೌಂದರ್ಯ (Moon in 1st House)",
        effectTitleEn: "Gentle Beauty & Empathy (Moon in 1st)",
        descriptionKn: "ಸುಂದರ ನಯನಗಳು, ಕರುಣಾಮಯಿ ಮನಸ್ಸು, ಜನಪ್ರಿಯತೆ ಹಾಗೂ ಕಲಾತ್ಮಕ ಕಲ್ಪನಾ ಶಕ್ತಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
        descriptionEn: "Gives captivating facial charm, deep empathy, public popularity, and intuitive imagination.",
        keyGiftsKn: ["ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ", "ಜನಪ್ರಿಯತೆ", "ಕಲ್ಪನಾಶಕ್ತಿ"],
        keyGiftsEn: ["Charming Aura", "Public Fame", "Creative Intuition"],
        watchOutsKn: ["ಭಾವನಾತ್ಮಕ ಏರಿಳಿತ", "ಚಂಚಲ ಮನಸ್ಸು"],
        watchOutsEn: ["Emotional swings", "Restlessness"]
      },
      {
        planetKn: "ಮಂಗಳ (Kuja)",
        planetEn: "Mars (Kuja)",
        symbol: "🔥",
        nature: "benefic",
        effectTitleKn: "ರುಚಕ ಯೋಗ & ಶೌರ್ಯ (Mars in 1st House)",
        effectTitleEn: "Ruchaka Yoga & Fearless Drive (Mars in 1st)",
        descriptionKn: "ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದಾಗ ಪಂಚ ಮಹಾಪುರುಷ ರುಚಕ ಯೋಗ ಸೃಷ್ಟಿಸುತ್ತದೆ. ಅಪ್ರತಿಮ ಧೈರ್ಯ, ಕ್ರೀಡಾ ಶಕ್ತಿ ಹಾಗೂ ತಾಂತ್ರಿಕ ಚಾಕಚಕ್ಯತೆ ನೀಡುತ್ತದೆ.",
        descriptionEn: "Forms Ruchaka Mahapurusha Yoga in own sign. Imparts athletic dynamism, fearless courage, and mechanical genius.",
        keyGiftsKn: ["ಸಾಹಸ ಪ್ರವೃತ್ತಿ", "ಕ್ರೀಡಾ ಪಟುತ್ವ", "ತಾಂತ್ರಿಕ ಜ್ಞಾನ"],
        keyGiftsEn: ["Courageous Drive", "Athletic Prowess", "Engineering Mind"],
        watchOutsKn: ["ಆತುರ ನಿರ್ಧಾರ", "ರಕ್ತದೊತ್ತಡ"],
        watchOutsEn: ["Impatience", "Headaches / Impulsiveness"]
      },
      {
        planetKn: "ಬುಧ (Budha)",
        planetEn: "Mercury (Budha)",
        symbol: "💎",
        nature: "benefic",
        effectTitleKn: "ಬುದ್ಧಿವಂತಿಕೆ & ಚುರುಕುತನ (Mercury in 1st House)",
        effectTitleEn: "Intellectual Agility & Wit (Mercury in 1st)",
        descriptionKn: "ಸದಾ ತರುಣೋತ್ಸಾಹ, ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ಗಣಿತ-ವ್ಯಾಪಾರ ಚಾಕಚಕ್ಯತೆ ಹಾಗೂ ಅದ್ಭುತ ಮಾತುಗಾರಿಕೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        descriptionEn: "Bestows youthful charm, witty communication, sharp mathematical acumen, and business agility.",
        keyGiftsKn: ["ವಾಗ್ಮಿತ್ವ", "ಗಣಿತ ಪ್ರತಿಭೆ", "ತರುಣ ರೂಪ"],
        keyGiftsEn: ["Eloquent Speech", "Analytical Skill", "Youthful Appearance"],
        watchOutsKn: ["ಏಕಾಗ್ರತೆ ಕೊರತೆ", "ಅತಿಯಾದ ಚರ್ಚೆ"],
        watchOutsEn: ["Scattered focus", "Over-analyzing"]
      },
      {
        planetKn: "ಗುರು (Brihaspati)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        nature: "benefic",
        effectTitleKn: "ದಿವ್ಯ ಜ್ಞಾನ & ಹಂಸ ಯೋಗ (Jupiter in 1st House)",
        effectTitleEn: "Divine Wisdom & Dignity (Jupiter in 1st)",
        descriptionKn: "ಲಗ್ನದಲ್ಲಿ ಗುರುವು ಲಕ್ಷ ದೋಷಗಳನ್ನು ನಿವಾರಿಸುತ್ತಾನೆ. ಉನ್ನತ ಸಂಸ್ಕಾರ, ಗೌರವ, ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ನೀಡುತ್ತದೆ.",
        descriptionEn: "Jupiter in Lagna destroys hundreds of doshas. Imparts profound wisdom, noble character, spiritual grace, and longevity.",
        keyGiftsKn: ["ಜ್ಞಾನ & ಪಾಂಡಿತ್ಯ", "ಗುರು ಕೃಪೆ", "ಧರ್ಮಬುದ್ಧಿ"],
        keyGiftsEn: ["Profound Wisdom", "Divine Protection", "Moral Nobility"],
        watchOutsKn: ["ಸ್ಥೂಲಕಾಯ (ತೂಕ ಹೆಚ್ಚಳ)", "ಅತಿಯಾದ ಆಶಾವಾದ"],
        watchOutsEn: ["Weight gain", "Over-optimism"]
      },
      {
        planetKn: "ಶುಕ್ರ (Shukra)",
        planetEn: "Venus (Shukra)",
        symbol: "💖",
        nature: "benefic",
        effectTitleKn: "ಸೌಂದರ್ಯ & ಕಲಾ ವೈಭವ (Venus in 1st House)",
        effectTitleEn: "Aesthetic Magnetism & Luxury (Venus in 1st)",
        descriptionKn: "ಅತ್ಯಂತ ಆಕರ್ಷಕ ರೂಪ, ವಸ್ತ್ರ-ಆಭರಣ ಪ್ರೇಮ, ಸಂಗೀತ-ಕಲೆಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಹಾಗೂ ಸಕಲ ಭೋಗಭಾಗ್ಯಗಳನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
        descriptionEn: "Gives charismatic beauty, love for elegance and fashion, artistic mastery, and luxurious joy.",
        keyGiftsKn: ["ಕಲಾ ಪ್ರತಿಭೆ", "ಸುಂದರ ರೂಪ", "ಐಷಾರಾಮಿ ಜೀವನ"],
        keyGiftsEn: ["Artistic Brilliance", "Attractive Persona", "Prosperity & Joy"],
        watchOutsKn: ["ಭೋಗಾಸಕ್ತಿ", "ಸಮಯ ಪಾಲನೆ"],
        watchOutsEn: ["Over-indulgence", "Complacency"]
      },
      {
        planetKn: "ಶನಿ (Shani)",
        planetEn: "Saturn (Shani)",
        symbol: "🪐",
        nature: "neutral",
        effectTitleKn: "ಗಂಭೀರತೆ, ಶಿಸ್ತು & ತಾಳ್ಮೆ (Saturn in 1st House)",
        effectTitleEn: "Discipline, Endurance & Sobriety (Saturn in 1st)",
        descriptionKn: "ಗಂಭೀರ ಸ್ವಭಾವ, ಅಚಲ ಶಿಸ್ತು, ನಿಧಾನವಾದರೂ ಶಾಶ್ವತ ಯಶಸ್ಸು ಹಾಗೂ ಅಗಾಧ ಸಹನಶೀಲತೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        descriptionEn: "Instills philosophical gravity, steadfast discipline, enduring patience, and lasting achievements later in life.",
        keyGiftsKn: ["ಅಚಲ ತಾಳ್ಮೆ", "ಕಠಿಣ ಪರಿಶ್ರಮ", "ದೂರದೃಷ್ಟಿ"],
        keyGiftsEn: ["Enduring Patience", "Hard Work Ethic", "Philosophical Depth"],
        watchOutsKn: ["ಆರಂಭಿಕ ವಿಳಂಬ", "ಒಂಟಿತನ"],
        watchOutsEn: ["Early life delays", "Melancholy / Solitude"]
      },
      {
        planetKn: "ರಾಹು (Rahu)",
        planetEn: "Rahu",
        symbol: "🌪️",
        nature: "malefic",
        effectTitleKn: "ವಿಶಿಷ್ಟ ಮಹತ್ವಾಕಾಂಕ್ಷೆ (Rahu in 1st House)",
        effectTitleEn: "Unconventional Ambition (Rahu in 1st)",
        descriptionKn: "ಸಂಪ್ರದಾಯ ಮೀರಿದ ಚಿಂತನೆ, ತಂತ್ರಜ್ಞಾನ ಒಲವು, ವಿದೇಶಿ ಸಂಪರ್ಕ ಹಾಗೂ ವಿಶಿಷ್ಟ ಆಕರ್ಷಣೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        descriptionEn: "Grants out-of-the-box thinking, technology affinity, global perspective, and strong worldly ambition.",
        keyGiftsKn: ["ತಂತ್ರಜ್ಞಾನ ಚಾತುರ್ಯ", "ವಿದೇಶ ಯೋಗ", "ವಿಶಿಷ್ಟ ಚಿಂತನೆ"],
        keyGiftsEn: ["Tech Innovation", "Global Exposure", "Original Mindset"],
        watchOutsKn: ["ಭ್ರಮೆ & ಅಸ್ಥಿರತೆ", "ಆರೋಗ್ಯ ಜಾಗ್ರತೆ"],
        watchOutsEn: ["Illusion / Restlessness", "Immunity vigilance"]
      },
      {
        planetKn: "ಕೇತು (Ketu)",
        planetEn: "Ketu",
        symbol: "📿",
        nature: "neutral",
        effectTitleKn: "ಆಧ್ಯಾತ್ಮಿಕ ಅಂತಃಸ್ಫೂರ್ತಿ (Ketu in 1st House)",
        effectTitleEn: "Spiritual Intuition & Insight (Ketu in 1st)",
        descriptionKn: "ಆಳವಾದ ಅಂತಃಸ್ಫೂರ್ತಿ, ಗೂಢ ಶಾಸ್ತ್ರಗಳ ಒಲವು, ನಿರಾಸಕ್ತಿ ಹಾಗೂ ತಪಸ್ಸಿನ ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.",
        descriptionEn: "Awakens mystical intuition, non-attachment, deep philosophical insight, and spiritual inclination.",
        keyGiftsKn: ["ಅಂತಃಸ್ಫೂರ್ತಿ", "ಆಧ್ಯಾತ್ಮಿಕತೆ", "ಸರಳತೆ"],
        keyGiftsEn: ["Sixth Sense Intuition", "Spiritual Depth", "Minimalist Simplicity"],
        watchOutsKn: ["ಗೊಂದಲ", "ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ"],
        watchOutsEn: ["Self-doubt", "Indecisiveness"]
      }
    ],
    quiz: [
      {
        questionKn: "೧ನೇ ಮನೆಯನ್ನು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಯಾವ ಪ್ರಮುಖ ಹೆಸರಿನಿಂದ ಕರೆಯಲಾಗುತ್ತದೆ?",
        questionEn: "What is the primary Sanskrit name of the 1st House in Vedic Astrology?",
        optionsKn: ["ಧನ ಭಾವ", "ತನು ಭಾವ (ಲಗ್ನ)", "ಮಾತೃ ಭಾವ", "ಕರ್ಮ ಭಾವ"],
        optionsEn: ["Dhana Bhava", "Tanu Bhava (Lagna)", "Matru Bhava", "Karma Bhava"],
        correctIndex: 1,
        explanationKn: "೧ನೇ ಮನೆಯು ಶರೀರ ಹಾಗೂ ಆತ್ಮಾನವನ್ನು ಸೂಚಿಸುವುದರಿಂದ ಇದನ್ನು 'ತನು ಭಾವ' ಅಥವಾ 'ಲಗ್ನ' ಎನ್ನಲಾಗುತ್ತದೆ.",
        explanationEn: "The 1st house represents the physical body and life force, hence called Tanu Bhava (Lagna)."
      },
      {
        questionKn: "೧ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ 'ಮೇಷ'ದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗುತ್ತದೆ?",
        questionEn: "Which planet is Exalted (Uccha) in the natural 1st zodiac sign (Aries / Mesha)?",
        optionsKn: ["ಶನಿ", "ಸೂರ್ಯ", "ಬುಧ", "ಶುಕ್ರ"],
        optionsEn: ["Saturn", "Sun", "Mercury", "Venus"],
        correctIndex: 1,
        explanationKn: "ಸೂರ್ಯನು ಮೇಷ ರಾಶಿಯ ೧೦ನೇ ಅಂಶದವರೆಗೆ ಪರಮೋಚ್ಚ (Exalted) ಸ್ಥಾನವನ್ನು ಹೊಂದುತ್ತಾನೆ.",
        explanationEn: "Sun reaches its highest exaltation (Uccha) up to 10° in Mesha."
      },
      {
        questionKn: "ಲಗ್ನದಲ್ಲಿ (೧ನೇ ಮನೆ) ಗುರುವು ಸ್ಥಿತನಾಗಿದ್ದಾಗ ಜಾತಕದಲ್ಲಿ ಏನು ಸಂಭವಿಸುತ್ತದೆ?",
        questionEn: "When Jupiter resides in the 1st House (Lagna), what is its classical Vedic effect?",
        optionsKn: ["ಲಕ್ಷ ದೋಷ ನಿವಾರಣೆ & ಜ್ಞಾನ", "ಅಪಾರ ದಾರಿದ್ರ್ಯ", "ಕೋಪ & ಕಲಹ", "ವಿದ್ಯಾ ನಷ್ಟ"],
        optionsEn: ["Destroys hundreds of doshas & grants wisdom", "Extreme poverty", "Constant anger", "Loss of learning"],
        correctIndex: 0,
        explanationKn: "'ಏಕೋ ಹಿ ದೇವೋ ಭಗವಾನ್ ಬೃಹಸ್ಪತಿಃ ಲಗ್ನಸ್ಥಿತೋ ಹಂತಿ ಸಹಸ್ರ ದೋಷಾನ್' - ಗುರು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ಸಕಲ ದೋಷ ನಿವಾರಣೆಯಾಗಿ ಜ್ಞಾನ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        explanationEn: "Jupiter in Lagna destroys thousands of obstacles and grants profound wisdom and long life."
      }
    ]
  },

  2: {
    houseNumber: 2,
    sanskritName: "ಧನ & ಕುಟುಂಬ ಭಾವ (Dhana Bhava)",
    kannadaName: "೨ನೇ ಮನೆ - ಧನ, ಕುಟುಂಬ & ವಾಣಿ ಭಾವ",
    englishName: "2nd House - Dhana Bhava (Wealth, Family & Speech)",
    naturalRashiKn: "ವೃಷಭ (Vrishabha / Taurus)",
    naturalRashiEn: "Vrishabha (Taurus)",
    naturalLordKn: "ಶುಕ್ರ (Shukra / Venus)",
    naturalLordEn: "Venus (Shukra)",
    bhavaCategoryKn: "ಪಣಫರ & ಅರ್ಥ ತ್ರಿಕೋಣ (Artha Trikona)",
    bhavaCategoryEn: "Artha Trikona & Panaphara House",
    elementKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (Earth Element - Material Stability)",
    elementEn: "Earth Element (Material Security & Resources)",
    bodyPartsKn: "ಮುಖ, ಬಲಗಣ್ಣು, ನಾಲಿಗೆ, ಹಲ್ಲು, ಕಂಠ ಹಾಗೂ ಧ್ವನಿ",
    bodyPartsEn: "Right Eye, Tongue, Throat, Teeth, Voice & Facial Features",
    lifeThemesKn: ["ಕೂಡಿಟ್ಟ ಧನ (ಆಸ್ತಿ)", "ಕುಟುಂಬ ಸೌಖ್ಯ", "ಮಾತುಗಾರಿಕೆ", "ಆಹಾರ ಪದ್ಧತಿ", "ಆರಂಭಿಕ ಸಂಸ್ಕಾರ"],
    lifeThemesEn: ["Accumulated Wealth", "Family Lineage", "Eloquence of Speech", "Food Habits", "Early Values"],
    simpleIntroKn: "೨ನೇ ಮನೆಯು ನಿಮ್ಮ ಧನ ಸಂಗ್ರಹ, ಕುಟುಂಬ ಸಂಸ್ಕಾರ, ಸಿಹಿ ಮಾತು ಹಾಗೂ ನೀವು ಸೇವಿಸುವ ಆಹಾರದ ಗುಣಮಟ್ಟವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 2nd House governs your saved wealth, family heritage, sweet/truthful speech, and nourishing diet.",
    dignity: {
      exaltedPlanetKn: "ಚಂದ್ರ (Chandra - 3° ವರೆಗೆ ವೃಷಭದಲ್ಲಿ ಉಚ್ಚ)",
      exaltedPlanetEn: "Moon (Chandra - Exalted up to 3° in Taurus)",
      exaltedDegree: "3° Vrishabha",
      exaltationReasonKn: "ಚಂದ್ರನು ಮನಸ್ಸು ಮತ್ತು ಪೋಷಣೆಯ ಕಾರಕ. ಸ್ಥಿರ ಹಾಗೂ ಫಲವತ್ತಾದ ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿಗೆ ಗರಿಷ್ಠ ತೃಪ್ತಿ ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Moon represents emotional stability and nourishment. The fertile, grounded sign of Taurus provides supreme peace to the Moon.",
      debilitatedPlanetKn: "ರಾಹು / ಕೇತು (ಕೆಲವು ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ)",
      debilitatedPlanetEn: "Ketu / Challenged Grahas",
      debilitatedDegree: "3° Vrishabha",
      debilitationReasonKn: "ವೈರಾಗ್ಯ ಕಾರಕ ಕೇತುವಿಗೆ ಭೌತಿಕ ಧನ ಸಂಗ್ರಹದ ಮನೆಯಲ್ಲಿ ನಿರ್ಲಿಪ್ತತೆ ಉಂಟಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Detached Ketu feels foreign to material asset hoarding in the 2nd house."
    },
    friendshipsKn: {
      friends: ["ಶುಕ್ರ (Shukra)", "ಬುಧ (Budha)", "ಶನಿ (Shani)"],
      enemies: ["ಸೂರ್ಯ (Surya)", "ಚಂದ್ರ (Chandra)"],
      neutrals: ["ಮಂಗಳ (Kuja)", "ಗುರು (Guru)"]
    },
    friendshipsEn: {
      friends: ["Venus (Shukra)", "Mercury (Budha)", "Saturn (Shani)"],
      enemies: ["Sun (Surya)", "Moon (Chandra)"],
      neutrals: ["Mars (Kuja)", "Jupiter (Guru)"]
    },
    grahaEffects: [
      {
        planetKn: "ಬುಧ (Budha)",
        planetEn: "Mercury (Budha)",
        symbol: "💎",
        nature: "benefic",
        effectTitleKn: "ಮಧುರ ವಾಗ್ಮಿತ್ವ & ವ್ಯಾಪಾರ ಲಾಭ (Mercury in 2nd)",
        effectTitleEn: "Sweet Eloquence & Financial Wit (Mercury in 2nd)",
        descriptionKn: "ಅತ್ಯಂತ ಸಿಹಿಯಾದ ಮಾತು, ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ಲೆಕ್ಕಪತ್ರಗಳಲ್ಲಿ ನಿಪುಣತೆ ಹಾಗೂ ವ್ಯಾಪಾರದಿಂದ ಧನ ವೃದ್ಧಿ.",
        descriptionEn: "Grants honeyed speech, financial numeracy, persuasive commercial wit, and flourishing commerce.",
        keyGiftsKn: ["ಸಿಹಿ ಮಾತು", "ಲೆಕ್ಕಾಚಾರ ಚಾತುರ್ಯ", "ವ್ಯಾಪಾರ ಧನ"],
        keyGiftsEn: ["Sweet Speech", "Financial Acumen", "Business Wealth"],
        watchOutsKn: ["ಅತಿಯಾದ ಹರಟೆ", "ಅನಗತ್ಯ ಖರ್ಚು"],
        watchOutsEn: ["Gossip traps", "Frivolous spending"]
      },
      {
        planetKn: "ಗುರು (Brihaspati)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        nature: "benefic",
        effectTitleKn: "ಅಖಂಡ ಧನಯೋಗ & ಸತ್ಯವಾಣಿ (Jupiter in 2nd)",
        effectTitleEn: "Abundant Wealth & Truthful Speech (Jupiter in 2nd)",
        descriptionKn: "ಸತ್ಯವಾದಿ, ಸುಸಂಸ್ಕೃತ ಕುಟುಂಬ, ಅಪಾರ ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ ಹಾಗೂ ವಿದ್ವತ್ಪೂರ್ಣ ಪ್ರವಚನ ಸಾಮರ್ಥ್ಯ.",
        descriptionEn: "Blesses with noble family values, vast accumulated assets, righteous speech, and scholarly wisdom.",
        keyGiftsKn: ["ಅಖಂಡ ಧನ ಸಂಪತ್ತು", "ಸತ್ಯ ಮಾತು", "ಕುಟುಂಬ ಆನಂದ"],
        keyGiftsEn: ["Immense Assets", "Truthful Speech", "Family Harmony"],
        watchOutsKn: ["ಅತಿಯಾದ ಉದಾರತೆ", "ಸಿಹಿತಿಂಡಿ ಪ್ರೇಮ"],
        watchOutsEn: ["Over-generosity", "Sweet cravings"]
      }
    ],
    quiz: [
      {
        questionKn: "೨ನೇ ಮನೆಯು ಮಾನವನ ಶರೀರದಲ್ಲಿ ಪ್ರಮುಖವಾಗಿ ಯಾವ ಅಂಗಗಳನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ?",
        questionEn: "Which anatomical parts are governed by the 2nd House?",
        optionsKn: ["ಹೃದಯ ಮತ್ತು ಶ್ವಾಸಕೋಶ", "ಬಲಗಣ್ಣು, ಮುಖ, ನಾಲಿಗೆ & ಕಂಠ", "ಕಾಲುಗಳು", "ಹೊಟ್ಟೆ"],
        optionsEn: ["Heart & Lungs", "Right Eye, Face, Tongue & Throat", "Feet", "Stomach"],
        correctIndex: 1,
        explanationKn: "೨ನೇ ಮನೆಯು ಮುಖಕಾಂತಿ, ಬಲಗಣ್ಣು, ಧ್ವನಿ ಹಾಗೂ ಆಹಾರ ಸೇವಿಸುವ ಬಾಯಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        explanationEn: "The 2nd house governs the facial appearance, right eye, voice, and mouth."
      },
      {
        questionKn: "೨ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ವೃಷಭದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಉಚ್ಚ (Exalted) ಆಗುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in the natural 2nd house sign Taurus (Vrishabha)?",
        optionsKn: ["ಚಂದ್ರ", "ಸೂರ್ಯ", "ಮಂಗಳ", "ಶನಿ"],
        optionsEn: ["Moon (Chandra)", "Sun", "Mars", "Saturn"],
        correctIndex: 0,
        explanationKn: "ಚಂದ್ರನು ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ೩ನೇ ಅಂಶದವರೆಗೆ ಪರಮೋಚ್ಚ (Exalted) ಆಗಿ ಅತ್ಯುನ್ನತ ಸುಖವನ್ನು ನೀಡುತ್ತಾನೆ.",
        explanationEn: "Moon achieves exaltation in Taurus, providing emotional peace and family prosperity."
      }
    ]
  },

  3: {
    houseNumber: 3,
    sanskritName: "ಸಹಜ & ಭ್ರಾತೃ ಭಾವ (Bhratru Bhava)",
    kannadaName: "೩ನೇ ಮನೆ - ಸಹೋದರ, ಸಾಹಸ & ಪರಾಕ್ರಮ ಭಾವ",
    englishName: "3rd House - Sahaja Bhava (Courage, Siblings & Communication)",
    naturalRashiKn: "ಮಿಥುನ (Mithuna / Gemini)",
    naturalRashiEn: "Mithuna (Gemini)",
    naturalLordKn: "ಬುಧ (Budha / Mercury)",
    naturalLordEn: "Mercury (Budha)",
    bhavaCategoryKn: "ಉಪಚಯ & ಕಾಮ ತ್ರಿಕೋಣ (Upachaya House)",
    bhavaCategoryEn: "Upachaya & Kama Trikona",
    elementKn: "ವಾಯು ತತ್ತ್ವ (Air Element - Ideas & Movement)",
    elementEn: "Air Element (Ideas, Travel & Agility)",
    bodyPartsKn: "ತೋಳುಗಳು, ಭುಜಗಳು, ಕೈಗಳು, ಕಿವಿಗಳು ಹಾಗೂ ಗಂಟಲು",
    bodyPartsEn: "Arms, Shoulders, Hands, Ears, Throat & Respiratory passages",
    lifeThemesKn: ["ಕಿರಿಯ ಸಹೋದರರು", "ಸಾಹಸ & ಧೈರ್ಯ", "ಬರವಣಿಗೆ & ಮಾಧ್ಯಮ", "ಸಣ್ಣ ಪ್ರಯಾಣಗಳು", "ಹವ್ಯಾಸಗಳು"],
    lifeThemesEn: ["Younger Siblings", "Courage & Valour", "Writing & Media", "Short Journeys", "Fine Motor Skills"],
    simpleIntroKn: "೩ನೇ ಮನೆಯು ನಿಮ್ಮ ಭುಜಬಲ, ಕಿರಿಯ ಸಹೋದರರ ಒಡನಾಟ, ಬರವಣಿಗೆಯ ಕಲೆ ಹಾಗೂ ಸಾಹಸ ಪ್ರವೃತ್ತಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 3rd House governs your willpower, younger siblings, writing talents, hands-on creativity, and travel.",
    dignity: {
      exaltedPlanetKn: "ರಾಹು (ಮಿಥುನದಲ್ಲಿ ಉಚ್ಚ)",
      exaltedPlanetEn: "Rahu (Exalted in Gemini according to Parashara)",
      exaltedDegree: "Gemini",
      exaltationReasonKn: "ರಾಹುವು ವಾಯು ತತ್ತ್ವದ ಮಿಥುನದಲ್ಲಿ ಅತ್ಯಾಧುನಿಕ ಸಂವಹನ ಹಾಗೂ ಡಿಜಿಟಲ್ ಸಾಮರ್ಥ್ಯ ನೀಡುತ್ತಾನೆ.",
      exaltationReasonEn: "Rahu thrives in airy Gemini, empowering mass media and digital communication brilliance.",
      debilitatedPlanetKn: "ಕೇತು (ಮಿಥುನದಲ್ಲಿ ನೀಚ)",
      debilitatedPlanetEn: "Ketu",
      debilitatedDegree: "Gemini",
      debilitationReasonKn: "ಕೇತುವಿನ ಮೌನ ಸ್ವಭಾವಕ್ಕೆ ವಾಚಾಳಿ ಮಿಥುನದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕಷ್ಟವಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Silent Ketu feels uneasy in communication-heavy Gemini."
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ"],
      enemies: ["ಚಂದ್ರ"],
      neutrals: ["ಸೂರ್ಯ", "ಮಂಗಳ", "ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn"],
      enemies: ["Moon"],
      neutrals: ["Sun", "Mars", "Jupiter"]
    },
    grahaEffects: [
      {
        planetKn: "ಮಂಗಳ (Kuja)",
        planetEn: "Mars (Kuja)",
        symbol: "🔥",
        nature: "benefic",
        effectTitleKn: "ಅಪ್ರತಿಮ ಪರಾಕ್ರಮ & ಶೌರ್ಯ (Mars in 3rd)",
        effectTitleEn: "Fearless Valour & Athletic Drive (Mars in 3rd)",
        descriptionKn: "ಉಪಚಯ ೩ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಅಪಾರ ಧೈರ್ಯ, ಕ್ರೀಡಾ ಜಯ ಹಾಗೂ ಶತ್ರುಗಳ ಮೇಲೆ ಸಂಪೂರ್ಣ ವಿಜಯ.",
        descriptionEn: "Mars is magnificent in the 3rd Upachaya house. Gives heroic courage, athletic triumphs, and victory over adversaries.",
        keyGiftsKn: ["ಅಪಾರ ಧೈರ್ಯ", "ಕ್ರೀಡಾ ಸಾಧನೆ", "ಭುಜಬಲ"],
        keyGiftsEn: ["Unconquerable Courage", "Athletic Mastery", "Physical Strength"],
        watchOutsKn: ["ಸಹೋದರರೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ", "ಆತುರ ಚಾಲನೆ"],
        watchOutsEn: ["Sibling arguments", "Impulsive driving"]
      }
    ],
    quiz: [
      {
        questionKn: "೩ನೇ ಮನೆಯು ಪ್ರಮುಖವಾಗಿ ಯಾರೊಂದಿಗಿನ ಸಂಬಂಧವನ್ನು ಸೂಚಿಸುತ್ತದೆ?",
        questionEn: "The 3rd House primarily indicates relationship with whom?",
        optionsKn: ["ತಾಯಿ", "ಕಿರಿಯ ಸಹೋದರ-ಸಹೋದರಿಯರು", "ಹೆಂಡತಿ", "ಗುರುಗಳು"],
        optionsEn: ["Mother", "Younger Siblings", "Spouse", "Spiritual Guru"],
        correctIndex: 1,
        explanationKn: "೩ನೇ ಭಾವವನ್ನು 'ಭ್ರಾತೃ ಭಾವ' ಎನ್ನಲಾಗುತ್ತದೆ. ಇದು ಕಿರಿಯ ಒಡಹುಟ್ಟಿದವರನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        explanationEn: "The 3rd house is known as Bhratru Bhava, governing younger brothers and sisters."
      }
    ]
  },

  4: {
    houseNumber: 4,
    sanskritName: "ಸುಖ & ಮಾತೃ ಭಾವ (Matru Bhava)",
    kannadaName: "೪ನೇ ಮನೆ - ಸುಖ, ಮಾತೃ, ಭೂಮಿ & ವಾಹನ ಭಾವ",
    englishName: "4th House - Sukha Bhava (Mother, Home, Vehicles & Inner Peace)",
    naturalRashiKn: "ಕರ್ಕಾಟಕ (Karkataka / Cancer)",
    naturalRashiEn: "Karkataka (Cancer)",
    naturalLordKn: "ಚಂದ್ರ (Chandra / Moon)",
    naturalLordEn: "Moon (Chandra)",
    bhavaCategoryKn: "ಕೇಂದ್ರ & ಮೋಕ್ಷ ತ್ರಿಕೋಣ (Moksha Trikona Kendra)",
    bhavaCategoryEn: "Moksha Trikona & Prime Kendra",
    elementKn: "ಜಲ ತತ್ತ್ವ (Water Element - Deep Emotions)",
    elementEn: "Water Element (Deep Emotions & Nourishment)",
    bodyPartsKn: "ಎದೆ, ಹೃದಯ, ಶ್ವಾಸಕೋಶ ಹಾಗೂ ಮನಸ್ಸು",
    bodyPartsEn: "Chest, Heart, Lungs, Breast & Emotional Mind",
    lifeThemesKn: ["ತಾಯಿಯ ಪ್ರೀತಿ", "ಸ್ವಂತ ಮನೆ & ವಾಹನ", "ಮನಶ್ಶಾಂತಿ", "ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ", "ಸ್ಥಿರಾಸ್ತಿ"],
    lifeThemesEn: ["Mother's Love", "Real Estate & Vehicles", "Emotional Contentment", "Foundational Education", "Domestic Peace"],
    simpleIntroKn: "೪ನೇ ಮನೆಯು ನಿಮ್ಮ ತಾಯಿಯ ವಾತ್ಸಲ್ಯ, ಸುಂದರ ಮನೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ನಿಮ್ಮ ಎದೆಯೊಳಗಿನ ಶಾಂತಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 4th House represents maternal warmth, real estate, vehicle joy, and deep domestic tranquility.",
    dignity: {
      exaltedPlanetKn: "ಗುರು (Guru - 5° ವರೆಗೆ ಕರ್ಕಾಟಕದಲ್ಲಿ ಉಚ್ಚ)",
      exaltedPlanetEn: "Jupiter (Guru - Exalted up to 5° in Cancer)",
      exaltedDegree: "5° Karkataka",
      exaltationReasonKn: "ಗುರುವು ದೇವಗುರು. ವಾತ್ಸಲ್ಯಮಯಿ ಕರ್ಕಾಟಕದ ೪ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಹಂಸ ಯೋಗ ಸೃಷ್ಟಿಸಿ ಅಗಾಧ ಸುಖ ನೀಡುತ್ತಾನೆ.",
      exaltationReasonEn: "Jupiter achieves supreme exaltation in gentle Cancer, bestowing unmatched domestic bliss and wisdom.",
      debilitatedPlanetKn: "ಮಂಗಳ (Kuja - 28° ಯಲ್ಲಿ ಕರ್ಕಾಟಕದಲ್ಲಿ ನೀಚ)",
      debilitatedPlanetEn: "Mars (Kuja - Debilitated at 28° in Cancer)",
      debilitatedDegree: "28° Karkataka",
      debilitationReasonKn: "ಶಾಂತ ನೀರಿನ ಮನೆಯಲ್ಲಿ ಬೆಂಕಿಯಂತಹ ಮಂಗಳನಿಗೆ ಅಸಹನೆ ಉಂಟಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Fiery Mars feels stifled in the emotional waters of Cancer."
    },
    friendshipsKn: {
      friends: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಗುರು"],
      enemies: ["ಬುಧ", "ಶುಕ್ರ"],
      neutrals: ["ಶನಿ", "ಮಂಗಳ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Jupiter"],
      enemies: ["Mercury", "Venus"],
      neutrals: ["Saturn", "Mars"]
    },
    grahaEffects: [
      {
        planetKn: "ಶುಕ್ರ (Shukra)",
        planetEn: "Venus (Shukra)",
        symbol: "💖",
        nature: "benefic",
        effectTitleKn: "ಭವ್ಯ ಗೃಹ & ವಾಹನ ಯೋಗ (Venus in 4th)",
        effectTitleEn: "Palatial Homes & Luxury Vehicles (Venus in 4th)",
        descriptionKn: "ಸುಂದರ ಅರಮನೆಯಂತಹ ಮನೆ, ಐಷಾರಾಮಿ ಕಾರುಗಳು, ತಾಯಿಯ ಅಪಾರ ಪ್ರೀತಿ ಹಾಗೂ ಸಕಲ ಗೃಹಾಲಂಕಾರ ಭೋಗಗಳು.",
        descriptionEn: "Grants aesthetically designed homes, luxury vehicles, maternal warmth, and domestic harmony.",
        keyGiftsKn: ["ಸುಂದರ ಗೃಹ", "ಉತ್ತಮ ವಾಹನಗಳು", "ಮಾನಸಿಕ ಸುಖ"],
        keyGiftsEn: ["Elegant Home", "Luxury Cars", "Emotional Serenity"],
        watchOutsKn: ["ಅತಿಯಾದ ಭೋಗಾಲಸ್ಯ", "ಗೃಹ ನಿರ್ವಹಣೆ ವೆಚ್ಚ"],
        watchOutsEn: ["Domestic complacency", "Interior decoration costs"]
      }
    ],
    quiz: [
      {
        questionKn: "೪ನೇ ಮನೆಯು ನೈಸರ್ಗಿಕವಾಗಿ ಯಾವ ಸಂಬಂಧಿಕರನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ?",
        questionEn: "Which relation is naturally governed by the 4th House?",
        optionsKn: ["ತಂದೆ", "ತಾಯಿ (ಮಾತಾ)", "ಕಿರಿಯ ತಮ್ಮ", "ಅಜ್ಜ"],
        optionsEn: ["Father", "Mother (Matru)", "Younger Brother", "Grandfather"],
        correctIndex: 1,
        explanationKn: "೪ನೇ ಮನೆಯು ಮಾತೃ ಸ್ಥಾನವಾಗಿದ್ದು, ತಾಯಿಯ ಆರೋಗ್ಯ ಮತ್ತು ಪ್ರೀತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        explanationEn: "The 4th house is Matru Sthana, governing the mother and maternal lineage."
      }
    ]
  },

  5: {
    houseNumber: 5,
    sanskritName: "ಪುತ್ರ & ಬುದ್ಧಿ ಭಾವ (Putra Bhava)",
    kannadaName: "೫ನೇ ಮನೆ - ಬುದ್ಧಿ, ಸಂತಾನ & ಪೂರ್ವಪುಣ್ಯ ಭಾವ",
    englishName: "5th House - Putra Bhava (Intellect, Children & Past Merits)",
    naturalRashiKn: "ಸಿಂಹ (Simha / Leo)",
    naturalRashiEn: "Simha (Leo)",
    naturalLordKn: "ಸೂರ್ಯ (Surya / Sun)",
    naturalLordEn: "Sun (Surya)",
    bhavaCategoryKn: "ಪರಮ ತ್ರಿಕೋಣ ಸ್ಥಾನ (Dharma Trikona)",
    bhavaCategoryEn: "Supreme Dharma Trikona",
    elementKn: "ಅಗ್ನಿ ತತ್ತ್ವ (Fire Element - Divine Inspiration)",
    elementEn: "Fire Element (Intellect & Creative Sparks)",
    bodyPartsKn: "ಹೊಟ್ಟೆ, ಜಠರಾಗ್ನಿ, ಮೇದೋಜೀರಕ ಗ್ರಂಥಿ, ಬೆನ್ನು",
    bodyPartsEn: "Upper Abdomen, Stomach Fire, Pancreas & Solar Plexus",
    lifeThemesKn: ["ಮೇಧಾ ಶಕ್ತಿ & ಪ್ರತಿಭೆ", "ಸಂತಾನ ಭಾಗ್ಯ", "ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ", "ಮಂತ್ರಿ ಪದವಿ & ಸಲಹೆ", "ಮಂತ್ರ ಸಿದ್ಧಿ"],
    lifeThemesEn: ["Intellect & Genius", "Children / Lineage", "Past Life Good Karma", "Ministerial Advisory", "Mantra Mastery"],
    simpleIntroKn: "೫ನೇ ಮನೆಯು ನಿಮ್ಮ ಬುದ್ಧಿವಂತಿಕೆ, ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ, ಮಕ್ಕಳು ಹಾಗೂ ನಿಮ್ಮ ಸೃಜನಶೀಲ ಪ್ರತಿಭೆಯ ಗಣಿಯಾಗಿದೆ!",
    simpleIntroEn: "The 5th House is the seat of intellect, past-life good karma (Purva Punya), children, and creative genius.",
    dignity: {
      exaltedPlanetKn: "ಸೂರ್ಯ ಸ್ವಕ್ಷೇತ್ರ (ಮೂಲತ್ರಿಕೋಣ)",
      exaltedPlanetEn: "Sun (Own Moolatrikona Sign)",
      exaltedDegree: "0-20° Simha",
      exaltationReasonKn: "ಸಿಂಹ ರಾಶಿಯಲ್ಲಿ ಸೂರ್ಯನು ತನ್ನ ನೈಸರ್ಗಿಕ ಸಿಂಹಾಸನದ ಮೇಲೆ ಕುಳಿತು ಬುದ್ಧಿಯನ್ನು ಬೆಳಗಿಸುತ್ತಾನೆ.",
      exaltationReasonEn: "In Leo, the Sun sits on his divine throne, illuminating intellect and governance.",
      debilitatedPlanetKn: "ಶನಿ (ಶತ್ರು ಕ್ಷೇತ್ರ)",
      debilitatedPlanetEn: "Saturn (Inimical Sign)",
      debilitatedDegree: "Simha",
      debilitationReasonKn: "ಶನಿಯ ಶೀತಲ ಸ್ವಭಾವಕ್ಕೆ ಸಿಂಹದ ಅಗ್ನಿ ತತ್ತ್ವದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕಷ್ಟ.",
      debilitationReasonEn: "Saturn faces natural friction in the royal solar domain of Leo."
    },
    friendshipsKn: {
      friends: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಗುರು", "ಮಂಗಳ"],
      enemies: ["ಶುಕ್ರ", "ಶನಿ", "ರಾಹು"],
      neutrals: ["ಬುಧ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Jupiter", "Mars"],
      enemies: ["Venus", "Saturn", "Rahu"],
      neutrals: ["Mercury"]
    },
    grahaEffects: [
      {
        planetKn: "ಗುರು (Brihaspati)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        nature: "benefic",
        effectTitleKn: "ಸರಸ್ವತೀ ಕೃಪೆ & ಸತ್ಪುತ್ರ ಯೋಗ (Jupiter in 5th)",
        effectTitleEn: "Saraswati Grace & Noble Children (Jupiter in 5th)",
        descriptionKn: "ಅತ್ಯದ್ಭುತ ಬುದ್ಧಿಮತ್ತೆ, ಮಂತ್ರ ಸಿದ್ಧಿ, ಉತ್ತಮ ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸಲಹೆಗಾರರಾಗುವ ಯೋಗ.",
        descriptionEn: "Endows brilliant academic memory, spiritual mantra mastery, blessed offspring, and high advisory status.",
        keyGiftsKn: ["ತೀಕ್ಷ್ಣ ನೆನಪಿನ ಶಕ್ತಿ", "ಉತ್ತಮ ಸಂತಾನ", "ಮಂತ್ರ ಸಿದ್ಧಿ"],
        keyGiftsEn: ["Sharp Intellect", "Noble Offspring", "Mantra Siddhi"],
        watchOutsKn: ["ಅತಿಯಾದ ಭವಿಷ್ಯದ ಚಿಂತೆ"],
        watchOutsEn: ["Over-contemplation"]
      }
    ],
    quiz: [
      {
        questionKn: "೫ನೇ ಮನೆಯನ್ನು ಪ್ರಮುಖವಾಗಿ ಯಾವ ಹೆಸರಿನಿಂದ ಕರೆಯುತ್ತಾರೆ?",
        questionEn: "What is the 5th House primarily known as in Vedic Astrology?",
        optionsKn: ["ಬುದ್ಧಿ & ಪುತ್ರ ಭಾವ", "ಶತ್ರು ಭಾವ", "ವ್ಯಯ ಭಾವ", "ಧನ ಭಾವ"],
        optionsEn: ["Buddhi & Putra Bhava", "Shatru Bhava", "Vyaya Bhava", "Dhana Bhava"],
        correctIndex: 0,
        explanationKn: "೫ನೇ ಮನೆಯು ಜ್ಞಾನ, ಬುದ್ಧಿ ಹಾಗೂ ಮಕ್ಕಳನ್ನು ಸೂಚಿಸುವುದರಿಂದ 'ಬುದ್ಧಿ & ಪುತ್ರ ಭಾವ' ಎನ್ನಲಾಗುತ್ತದೆ.",
        explanationEn: "The 5th house governs intellect, memory, and progeny, termed Buddhi & Putra Bhava."
      }
    ]
  },

  6: {
    houseNumber: 6,
    sanskritName: "ಶತ್ರು & ರೋಗ ಭಾವ (Ari / Roga Bhava)",
    kannadaName: "೬ನೇ ಮನೆ - ಶತ್ರು, ರೋಗ, ಋಣ & ಸೇವಾ ಭಾವ",
    englishName: "6th House - Shatru Bhava (Health, Debts, Enemies & Daily Service)",
    naturalRashiKn: "ಕನ್ಯಾ (Kanya / Virgo)",
    naturalRashiEn: "Kanya (Virgo)",
    naturalLordKn: "ಬುಧ (Budha / Mercury)",
    naturalLordEn: "Mercury (Budha)",
    bhavaCategoryKn: "ದುಸ್ಥಾನ & ಉಪಚಯ (Dusthana & Upachaya)",
    bhavaCategoryEn: "Dusthana & Upachaya Growth House",
    elementKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (Earth Element - Precision & Health)",
    elementEn: "Earth Element (Routine, Precision & Healing)",
    bodyPartsKn: "ಕಿಬ್ಬೊಟ್ಟೆ, ಕರುಳು, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಸೊಂಟ",
    bodyPartsEn: "Lower Abdomen, Intestines, Digestion & Immune Defense",
    lifeThemesKn: ["ರೋಗನಿರೋಧಕ ಶಕ್ತಿ", "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಜಯ", "ಋಣ (ಸಾಲ) ಮುಕ್ತಿ", "ದೈನಂದಿನ ಸೇವೆ", "ವ್ಯಾಜ್ಯ ಜಯ"],
    lifeThemesEn: ["Immunity & Health", "Competitive Exam Victory", "Overcoming Debts", "Service & Routine", "Legal Triumphs"],
    simpleIntroKn: "೬ನೇ ಮನೆಯು ರೋಗ, ಸಾಲ ಹಾಗೂ ಶತ್ರುಗಳನ್ನು ಸೂಚಿಸಿದರೂ, ಉಪಚಯ ಮನೆಯಾಗಿರುವುದರಿಂದ ಪರಿಶ್ರಮದಿಂದ ಇವೆಲ್ಲವನ್ನೂ ಗೆಲ್ಲುವ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ!",
    simpleIntroEn: "Though a challenging house of debts and health, as an Upachaya house, it bestows the grit to overcome competition and heal!",
    dignity: {
      exaltedPlanetKn: "ಬುಧ (15° ಯಲ್ಲಿ ಕನ್ಯಾದಲ್ಲಿ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Mercury (Exalted up to 15° in Virgo)",
      exaltedDegree: "15° Kanya",
      exaltationReasonKn: "ಬುಧನಿಗೆ ಕನ್ಯಾ ರಾಶಿಯಲ್ಲಿ ಗರಿಷ್ಠ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಹಾಗೂ ರೋಗ ನಿರೋಧಕ ತಾರ್ಕಿಕ ಶಕ್ತಿ ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Mercury achieves peak analytical precision and problem-solving exaltation in Virgo.",
      debilitatedPlanetKn: "ಶುಕ್ರ (27° ಯಲ್ಲಿ ಕನ್ಯಾದಲ್ಲಿ ನೀಚ)",
      debilitatedPlanetEn: "Venus (Debilitated at 27° in Virgo)",
      debilitatedDegree: "27° Kanya",
      debilitationReasonKn: "ಪ್ರೀತಿಯ ಕಾರಕ ಶುಕ್ರನಿಗೆ ಅತಿಯಾದ ವಿಮರ್ಶಾತ್ಮಕ ಕನ್ಯಾದಲ್ಲಿ ಅಸಮಾಧಾನವಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Venus represents unconditional love, which feels restricted by analytical hyper-criticism in Virgo."
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ"],
      enemies: ["ಮಂಗಳ"],
      neutrals: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn"],
      enemies: ["Mars"],
      neutrals: ["Sun", "Moon", "Jupiter"]
    },
    grahaEffects: [
      {
        planetKn: "ಶನಿ (Shani)",
        planetEn: "Saturn (Shani)",
        symbol: "🪐",
        nature: "benefic",
        effectTitleKn: "ಶತ್ರು ಹಂತಕ ಯೋಗ (Saturn in 6th)",
        effectTitleEn: "Adversary Destroyer & Resilient Health (Saturn in 6th)",
        descriptionKn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅದ್ಭುತ ಫಲ ನೀಡುತ್ತಾನೆ. ಸಕಲ ಶತ್ರುಗಳ ನಾಶ, ಸಾಲ ಮುಕ್ತಿ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ವಿಜಯ ಹಾಗೂ ಕಠಿಣ ಪರಿಶ್ರಮದ ಯಶಸ್ಸು.",
        descriptionEn: "Saturn is exceptionally powerful in the 6th. Destroys all rivals, clears debts, and grants triumph in competitive exams.",
        keyGiftsKn: ["ಶತ್ರು ಜಯ", "ಸಾಲ ಪರಿಹಾರ", "ಕಠಿಣ ಪರಿಶ್ರಮ"],
        keyGiftsEn: ["Victory over Rivals", "Debt Clearance", "Steely Resilience"],
        watchOutsKn: ["ಕೀಲು ನೋವು", "ಅತಿಯಾದ ಕೆಲಸದ ಒತ್ತಡ"],
        watchOutsEn: ["Joint stiffness", "Workaholism"]
      }
    ],
    quiz: [
      {
        questionKn: "೬ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ಕನ್ಯಾದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in the natural 6th sign Virgo (Kanya)?",
        optionsKn: ["ಶುಕ್ರ", "ಬುಧ", "ಗುರು", "ಸೂರ್ಯ"],
        optionsEn: ["Venus", "Mercury (Budha)", "Jupiter", "Sun"],
        correctIndex: 1,
        explanationKn: "ಬುಧನು ಕನ್ಯಾ ರಾಶಿಯ ೧೫ನೇ ಅಂಶದವರೆಗೆ ತನ್ನದೇ ಸ್ವಂತ-ಉಚ್ಚ ಕ್ಷೇತ್ರದಲ್ಲಿರುತ್ತಾನೆ.",
        explanationEn: "Mercury is uniquely exalted in its own analytical sign of Virgo up to 15°."
      }
    ]
  },

  7: {
    houseNumber: 7,
    sanskritName: "ಕಳತ್ರ & ಜಾಯಾ ಭಾವ (Kalatra Bhava)",
    kannadaName: "೭ನೇ ಮನೆ - ಕಳತ್ರ, ವಿವಾಹ & ಪಾಲುದಾರಿಕೆ ಭಾವ",
    englishName: "7th House - Kalatra Bhava (Marriage, Spouse & Public Relations)",
    naturalRashiKn: "ತುಲಾ (Tula / Libra)",
    naturalRashiEn: "Tula (Libra)",
    naturalLordKn: "ಶುಕ್ರ (Shukra / Venus)",
    naturalLordEn: "Venus (Shukra)",
    bhavaCategoryKn: "ಪ್ರಮುಖ ಕೇಂದ್ರ & ಕಾಮ ತ್ರಿಕೋಣ (Kendra & Maraka)",
    bhavaCategoryEn: "Major Kendra & Kama Trikona",
    elementKn: "ವಾಯು ತತ್ತ್ವ (Air Element - Balance & Relationships)",
    elementEn: "Air Element (Harmony & Alliances)",
    bodyPartsKn: "ಸೊಂಟದ ಕೆಳಭಾಗ, ಮೂತ್ರಾಂಗಗಳು, ಗರ್ಭಾಶಯ",
    bodyPartsEn: "Kidneys, Lower Back, Pelvis & Reproductive System",
    lifeThemesKn: ["ದಾಂಪತ್ಯ ಸುಖ", "ಜೀವನ ಸಂಗಾತಿ", "ವ್ಯವಹಾರ ಪಾಲುದಾರಿಕೆ", "ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ", "ವಿದೇಶಿ ವ್ಯಾಪಾರ"],
    lifeThemesEn: ["Marital Bliss", "Spouse Nature", "Business Partnerships", "Public Relations", "Foreign Trade"],
    simpleIntroKn: "೭ನೇ ಮನೆಯು ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿ, ವಿವಾಹ ಸುಖ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕರೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 7th House represents your spouse, marital harmony, business partnerships, and diplomacy in society.",
    dignity: {
      exaltedPlanetKn: "ಶನಿ (20° ಯಲ್ಲಿ ತುಲಾದಲ್ಲಿ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Saturn (Exalted up to 20° in Libra)",
      exaltedDegree: "20° Tula",
      exaltationReasonKn: "ನ್ಯಾಯದ ತಕ್ಕಡಿಯಾದ ತುಲಾದಲ್ಲಿ ನ್ಯಾಯಾಧಿಪತಿ ಶನಿಗೆ ಪರಮೋಚ್ಚ ಬಲ ದೊರೆಯುತ್ತದೆ (ಸಸ ಮಹಾಪುರುಷ ಯೋಗ).",
      exaltationReasonEn: "In the balanced scale of Libra, the cosmic judge Saturn achieves supreme exaltation (Sasa Yoga).",
      debilitatedPlanetKn: "ಸೂರ್ಯ (10° ಯಲ್ಲಿ ತುಲಾದಲ್ಲಿ ಪರಮ ನೀಚ)",
      debilitatedPlanetEn: "Sun (Debilitated at 10° in Libra)",
      debilitatedDegree: "10° Tula",
      debilitationReasonKn: "ರಾಜನಾದ ಸೂರ್ಯನಿಗೆ ಸಮಾನ ಪಾಲುದಾರಿಕೆಯ ೭ನೇ ಮನೆಯಲ್ಲಿ ಅಹಂಕಾರ ಕರಗುವುದರಿಂದ ನೀಚ ಸ್ಥಿತಿ.",
      debilitationReasonEn: "The regal Sun must compromise his solo authority in the cooperative domain of the 7th house."
    },
    friendshipsKn: {
      friends: ["ಶುಕ್ರ", "ಬುಧ", "ಶನಿ"],
      enemies: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಮಂಗಳ"],
      neutrals: ["ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Venus", "Mercury", "Saturn"],
      enemies: ["Sun", "Moon", "Mars"],
      neutrals: ["Jupiter"]
    },
    grahaEffects: [
      {
        planetKn: "ಶುಕ್ರ (Shukra)",
        planetEn: "Venus (Shukra)",
        symbol: "💖",
        nature: "benefic",
        effectTitleKn: "ಮಾಲವ್ಯ ಯೋಗ & ಸುಂದರ ಸಂಗಾತಿ (Venus in 7th)",
        effectTitleEn: "Malavya Yoga & Loving Spouse (Venus in 7th)",
        descriptionKn: "ಸುಂದರ ಹಾಗೂ ಸುಸಂಸ್ಕೃತ ಜೀವನ ಸಂಗಾತಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಪಾರ ಪ್ರೇಮ, ಐಷಾರಾಮಿ ಜೀವನ ಹಾಗೂ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಲಾಭ.",
        descriptionEn: "Forms Malavya Mahapurusha Yoga in own sign. Blesses with a graceful spouse, romantic bliss, and commercial alliances.",
        keyGiftsKn: ["ಸುಂದರ ಸಂಗಾತಿ", "ದಾಂಪತ್ಯ ಸುಖ", "ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ"],
        keyGiftsEn: ["Charming Spouse", "Marital Joy", "Profitable Partnerships"],
        watchOutsKn: ["ಅತಿಯಾದ ನಿರೀಕ್ಷೆ"],
        watchOutsEn: ["High romantic expectations"]
      }
    ],
    quiz: [
      {
        questionKn: "೭ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ತುಲಾದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗಿ ಸಸ ಯೋಗ ನೀಡುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in Libra (7th sign), forming Sasa Mahapurusha Yoga?",
        optionsKn: ["ಸೂರ್ಯ", "ಶನಿ (Saturn)", "ಮಂಗಳ", "ಚಂದ್ರ"],
        optionsEn: ["Sun", "Saturn (Shani)", "Mars", "Moon"],
        correctIndex: 1,
        explanationKn: "ಶನಿಯು ತುಲಾ ರಾಶಿಯ ೨೦ನೇ ಅಂಶದವರೆಗೆ ಪರಮೋಚ್ಚನಾಗಿ ಸಸ ಮಹಾಪುರುಷ ರಾಜಯೋಗವನ್ನು ಕರುಣಿಸುತ್ತಾನೆ.",
        explanationEn: "Saturn achieves exaltation in Libra, forming the auspicious Sasa Yoga."
      }
    ]
  },

  8: {
    houseNumber: 8,
    sanskritName: "ಆಯುರ್ & ರಂಧ್ರ ಭಾವ (Ayur Bhava)",
    kannadaName: "೮ನೇ ಮನೆ - ಆಯುಷ್ಯ, ರಹಸ್ಯ & ಮೋಕ್ಷ ಪರಿವರ್ತನ ಭಾವ",
    englishName: "8th House - Randhra Bhava (Longevity, Mysteries & Transformation)",
    naturalRashiKn: "ವೃಶ್ಚಿಕ (Vrischika / Scorpio)",
    naturalRashiEn: "Vrischika (Scorpio)",
    naturalLordKn: "ಮಂಗಳ / ಕೇತು (Kuja / Ketu)",
    naturalLordEn: "Mars / Ketu",
    bhavaCategoryKn: "ಪ್ರಮುಖ ದುಸ್ಥಾನ & ಮೋಕ್ಷ ತ್ರಿಕೋಣ (Moksha Dusthana)",
    bhavaCategoryEn: "Moksha Dusthana & Deep Mystery House",
    elementKn: "ಜಲ ತತ್ತ್ವ (Water Element - Deep Occult Ocean)",
    elementEn: "Water Element (Occult & Undercurrents)",
    bodyPartsKn: "ಜನನೇಂದ್ರಿಯಗಳು, ಮೂಲಾಧಾರ ಚಕ್ರ, ಗುದದ್ವಾರ",
    bodyPartsEn: "Excretory & Reproductive Organs, Root Chakra",
    lifeThemesKn: ["ದೀರ್ಘಾಯುಷ್ಯ", "ಆಕಸ್ಮಿಕ ಧನಲಾಭ (ವಿಮೆ / ಉಯಿಲು)", "ಗೂಢ ಶಾಸ್ತ್ರ & ಜ್ಯೋತಿಷ್ಯ", "ಆಧ್ಯಾತ್ಮಿಕ ಕುಂಡಲಿನಿ", "ಸಂಕಷ್ಟದಿಂದ ಪುನರುತ್ಥಾನ"],
    lifeThemesEn: ["Longevity", "Sudden Wealth / Inheritance", "Occult & Astrology", "Kundalini Awakening", "Phoenix-like Rebirth"],
    simpleIntroKn: "೮ನೇ ಮನೆಯು ಆಯುಷ್ಯ, ಜ್ಯೋತಿಷ್ಯ-ಮಂತ್ರಗಳಂತಹ ಗೂಢ ಜ್ಞಾನ, ಆಕಸ್ಮಿಕ ಲಾಭಗಳು ಹಾಗೂ ಜೀವನದ ಮಹಾ ಪರಿವರ್ತನೆಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 8th House reveals longevity, occult secrets (Astrology/Tantra), unexpected inheritance, and transformative resilience.",
    dignity: {
      exaltedPlanetKn: "ಕೇತು (ವೃಶ್ಚಿಕದಲ್ಲಿ ಉಚ್ಚ)",
      exaltedPlanetEn: "Ketu (Exalted in Scorpio)",
      exaltedDegree: "Vrischika",
      exaltationReasonKn: "ಕೇತುವಿಗೆ ರಹಸ್ಯಮಯ ವೃಶ್ಚಿಕದಲ್ಲಿ ಆಳವಾದ ತಪಸ್ಸು ಹಾಗೂ ಜ್ಯೋತಿಷ್ಯ ಸಿದ್ಧಿ ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Mystic Ketu attains profound spiritual depth and occult mastery in Scorpio.",
      debilitatedPlanetKn: "ಚಂದ್ರ (3° ಯಲ್ಲಿ ವೃಶ್ಚಿಕದಲ್ಲಿ ನೀಚ)",
      debilitatedPlanetEn: "Moon (Debilitated at 3° in Scorpio)",
      debilitatedDegree: "3° Vrischika",
      debilitationReasonKn: "ಶಾಂತ ಚಂದ್ರನಿಗೆ ನಿಗೂಢ ವೃಶ್ಚಿಕದ ಆಳದಲ್ಲಿ ಮಾನಸಿಕ ಆತಂಕ ಉಂಟಾಗುವುದರಿಂದ ನೀಚ ಸ್ಥಿತಿ.",
      debilitationReasonEn: "Sensitive Moon experiences deep emotional turbulence in the intense waters of Scorpio."
    },
    friendshipsKn: {
      friends: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಗುರು"],
      enemies: ["ಬುಧ"],
      neutrals: ["ಶುಕ್ರ", "ಶನಿ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Jupiter"],
      enemies: ["Mercury"],
      neutrals: ["Venus", "Saturn"]
    },
    grahaEffects: [
      {
        planetKn: "ಶನಿ (Shani)",
        planetEn: "Saturn (Shani)",
        symbol: "🪐",
        nature: "benefic",
        effectTitleKn: "ದೀರ್ಘಾಯುಷ್ಯ ಕಾರಕ (Saturn in 8th)",
        effectTitleEn: "Supreme Longevity (Saturn in 8th)",
        descriptionKn: "೮ನೇ ಮನೆಯಲ್ಲಿ ಆಯುಷ್ಯಕಾರಕ ಶನಿ ಅದ್ಭುತ. ದೀರ್ಘಾಯುಷ್ಯ, ಆಳವಾದ ಸಂಶೋಧನೆ, ಗೂಢ ಶಾಸ್ತ್ರ ಜ್ಞಾನ ಹಾಗೂ ಗಂಭೀರ ತಾಳ್ಮೆ ನೀಡುತ್ತದೆ.",
        descriptionEn: "Saturn as Ayush Karaka in the 8th house bestows exceptionally long life, deep occult research, and steady patience.",
        keyGiftsKn: ["ದೀರ್ಘಾಯುಷ್ಯ", "ಗೂಢ ಜ್ಞಾನ", "ಸಂಕಷ್ಟ ಜಯ"],
        keyGiftsEn: ["Long Lifespan", "Occult Research", "Crisis Mastery"],
        watchOutsKn: ["ದೀರ್ಘಕಾಲಿಕ ಆರೋಗ್ಯ ಜಾಗ್ರತೆ"],
        watchOutsEn: ["Chronic health vigilance"]
      }
    ],
    quiz: [
      {
        questionKn: "೮ನೇ ಮನೆಯು ಮುಖ್ಯವಾಗಿ ಯಾವ ವಿಷಯವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ?",
        questionEn: "The 8th House primarily signifies which domain?",
        optionsKn: ["ಆಯುಷ್ಯ & ಗೂಢ ರಹಸ್ಯಗಳು", "ಕಿರಿಯ ತಮ್ಮ", "ತಾಯಿ", "ಧರ್ಮ ಗುರು"],
        optionsEn: ["Longevity & Occult Mysteries", "Younger Brother", "Mother", "Guru"],
        correctIndex: 0,
        explanationKn: "೮ನೇ ಮನೆಯನ್ನು 'ಆಯುರ್ ಭಾವ' ಎನ್ನಲಾಗುತ್ತದೆ. ಇದು ಆಯುಷ್ಯ ಹಾಗೂ ರಹಸ್ಯ ಜ್ಞಾನವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        explanationEn: "The 8th house is Ayur Bhava, governing lifespan and occult knowledge."
      }
    ]
  },

  9: {
    houseNumber: 9,
    sanskritName: "ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ (Dharma Bhava)",
    kannadaName: "೯ನೇ ಮನೆ - ಭಾಗ್ಯ, ಧರ್ಮ, ತಂದೆ & ಗುರು ಭಾವ",
    englishName: "9th House - Bhagya Bhava (Fortune, Father, Dharma & Higher Wisdom)",
    naturalRashiKn: "ಧನು (Dhanu / Sagittarius)",
    naturalRashiEn: "Dhanu (Sagittarius)",
    naturalLordKn: "ಗುರು (Guru / Jupiter)",
    naturalLordEn: "Jupiter (Guru)",
    bhavaCategoryKn: "ಪರಮ ತ್ರಿಕೋಣ (Supreme Dharma Trikona)",
    bhavaCategoryEn: "Supreme Dharma Trikona",
    elementKn: "ಅಗ್ನಿ ತತ್ತ್ವ (Fire Element - Spiritual Fire & Truth)",
    elementEn: "Fire Element (Higher Truth & Illumination)",
    bodyPartsKn: "ತೊಡೆಗಳು, ಸೊಂಟದ ಮೂಳೆಗಳು, ರಕ್ತನಾಳಗಳು",
    bodyPartsEn: "Thighs, Hip Joints & Arterial Circulation",
    lifeThemesKn: ["ಭಾಗ್ಯೋದಯ (ಅದೃಷ್ಟ)", "ತಂದೆಯ ಆಶೀರ್ವಾದ", "ಗುರುಭಕ್ತಿ", "ತೀರ್ಥಯಾತ್ರೆ & ದೇವಾಲಯ ಸೇವೆ", "ಉನ್ನತ ಶಿಕ್ಷಣ"],
    lifeThemesEn: ["Fortune / Divine Luck", "Father's Blessing", "Guru Devotion", "Pilgrimages & Temple Seva", "Higher Philosophy"],
    simpleIntroKn: "೯ನೇ ಮನೆಯೇ ನಿಮ್ಮ ಜಾತಕದ ಮಹಾ ಭಾಗ್ಯ ಸ್ಥಾನ! ಇದು ತಂದೆಯ ಪ್ರೀತಿ, ಗುರು ಕೃಪೆ, ದೇವತಾ ಅನುಗ್ರಹ ಹಾಗೂ ಉನ್ನತ ಧರ್ಮ ಬುದ್ಧಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    simpleIntroEn: "The 9th House is the seat of divine fortune, fatherly grace, spiritual pilgrimages, and noble dharma.",
    dignity: {
      exaltedPlanetKn: "ಗುರು ಸ್ವಕ್ಷೇತ್ರ / ಕೇತು ಉಚ್ಚ",
      exaltedPlanetEn: "Jupiter (Own Sign) / Ketu (Exalted)",
      exaltedDegree: "Dhanu",
      exaltationReasonKn: "ಧರ್ಮರಾಶಿಯಾದ ಧನುಸ್ಸಿನಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿಗೆ ಪರಮ ಪವಿತ್ರ ಬಲ ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "In righteous Sagittarius, Jupiter radiates pure Vedic truth and fortune.",
      debilitatedPlanetKn: "ರಾಹು (ಧನುಸ್ಸಿನಲ್ಲಿ ನೀಚ)",
      debilitatedPlanetEn: "Rahu",
      debilitatedDegree: "Dhanu",
      debilitationReasonKn: "ಪ್ರಾಪಂಚಿಕ ಭೋಗದ ರಾಹುವಿಗೆ ಪರಮ ಸಾತ್ವಿಕ ಧನುಸ್ಸಿನಲ್ಲಿ ಸ್ವಾರ್ಥ ಸಾಧಿಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ.",
      debilitationReasonEn: "Materialistic Rahu is subdued in the righteous temple of Sagittarius."
    },
    friendshipsKn: {
      friends: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಮಂಗಳ", "ಗುರು"],
      enemies: ["ಬುಧ", "ಶುಕ್ರ"],
      neutrals: ["ಶನಿ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Mars", "Jupiter"],
      enemies: ["Mercury", "Venus"],
      neutrals: ["Saturn"]
    },
    grahaEffects: [
      {
        planetKn: "ಸೂರ್ಯ (Surya)",
        planetEn: "Sun (Surya)",
        symbol: "☀️",
        nature: "benefic",
        effectTitleKn: "ತಂದೆಯ ಭಾಗ್ಯ & ಧರ್ಮ ಪ್ರಕಾಶ (Sun in 9th)",
        effectTitleEn: "Fatherly Grace & Righteous Radiance (Sun in 9th)",
        descriptionKn: "ಸದಾ ದೈವಾನುಗ್ರಹ, ತಂದೆಯಿಂದ ಅಪಾರ ಕೀರ್ತಿ, ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಗೌರವ ಹಾಗೂ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ ಯೋಗ.",
        descriptionEn: "Blesses with unshakeable integrity, paternal honors, philosophical stature, and sacred pilgrimage journeys.",
        keyGiftsKn: ["ದೈವಾನುಗ್ರಹ", "ತಂದೆಯ ಕೀರ್ತಿ", "ತೀರ್ಥಯಾತ್ರೆ"],
        keyGiftsEn: ["Divine Grace", "Fatherly Legacy", "Sacred Pilgrimages"],
        watchOutsKn: ["ತಂದೆಯೊಂದಿಗೆ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯ"],
        watchOutsEn: ["Ideological friction with elders"]
      }
    ],
    quiz: [
      {
        questionKn: "೯ನೇ ಮನೆಯನ್ನು ಜಾತಕದಲ್ಲಿ ಯಾವ ಅತ್ಯುನ್ನತ ಹೆಸರಿನಿಂದ ಕರೆಯಲಾಗುತ್ತದೆ?",
        questionEn: "What is the 9th House revered as in Vedic Astrology?",
        optionsKn: ["ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ", "ಶತ್ರು ಭಾವ", "ವ್ಯಯ ಭಾವ", "ಧನ ಭಾವ"],
        optionsEn: ["Bhagya & Dharma Bhava", "Shatru Bhava", "Vyaya Bhava", "Dhana Bhava"],
        correctIndex: 0,
        explanationKn: "೯ನೇ ಮನೆಯು ಅದೃಷ್ಟ, ತಂದೆ ಹಾಗೂ ಧರ್ಮವನ್ನು ಸೂಚಿಸುವುದರಿಂದ 'ಭಾಗ್ಯ ಸ್ಥಾನ' ಎನ್ನಲಾಗುತ್ತದೆ.",
        explanationEn: "The 9th house is Bhagya Sthana, representing fortune, father, and spiritual dharma."
      }
    ]
  },

  10: {
    houseNumber: 10,
    sanskritName: "ಕರ್ಮ & ರಾಜ್ಯ ಭಾವ (Karma Bhava)",
    kannadaName: "೧೦ನೇ ಮನೆ - ಕರ್ಮ, ವೃತ್ತಿ, ಅಧಿಕಾರ & ಕೀರ್ತಿ ಭಾವ",
    englishName: "10th House - Karma Bhava (Career, Authority, Profession & Fame)",
    naturalRashiKn: "ಮಕರ (Makara / Capricorn)",
    naturalRashiEn: "Makara (Capricorn)",
    naturalLordKn: "ಶನಿ (Shani / Saturn)",
    naturalLordEn: "Saturn (Shani)",
    bhavaCategoryKn: "ಅತ್ಯುನ್ನತ ಕೇಂದ್ರ & ಅರ್ಥ ತ್ರಿಕೋಣ (Highest Kendra)",
    bhavaCategoryEn: "Apex Kendra & Artha Trikona",
    elementKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (Earth Element - Practical Achievement)",
    elementEn: "Earth Element (Executive Authority & Practical Legacy)",
    bodyPartsKn: "ಮಂಡಿಗಳು, ಕೀಲುಗಳು, ಬೆನ್ನುಮೂಳೆಯ ಕೆಳಭಾಗ",
    bodyPartsEn: "Knees, Joints & Skeletal Backbone",
    lifeThemesKn: ["ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ", "ಸರ್ಕಾರಿ ಗೌರವ & ಅಧಿಕಾರ", "ಕೀರ್ತಿ & ಪ್ರಸಿದ್ಧಿ", "ಸಮಾಜದಲ್ಲಿ ಪ್ರತಿಷ್ಠೆ", "ಧರ್ಮ ಕರ್ಮಗಳು"],
    lifeThemesEn: ["Career / Profession", "Government Honors & Executive Rank", "Public Fame & Legacy", "Social Status", "Right Action"],
    simpleIntroKn: "೧೦ನೇ ಮನೆಯೇ ನಿಮ್ಮ ವೃತ್ತಿ ಜೀವನದ ಸಿಂಹಾಸನ! ಇದು ನೀವು ಮಾಡುವ ಉದ್ಯೋಗ, ಸಮಾಜದಲ್ಲಿ ಗಳಿಸುವ ಕೀರ್ತಿ ಹಾಗೂ ನಿಮ್ಮ ಅಧಿಕಾರವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 10th House is the pinnacle of career, authority, public reputation, and professional destiny.",
    dignity: {
      exaltedPlanetKn: "ಮಂಗಳ (28° ಯಲ್ಲಿ ಮಕರದಲ್ಲಿ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Mars (Exalted up to 28° in Capricorn)",
      exaltedDegree: "28° Makara",
      exaltationReasonKn: "ಶಿಸ್ತಿನ ಮಕರದಲ್ಲಿ ಸಾಹಸಿ ಮಂಗಳನಿಗೆ ಅತ್ಯುನ್ನತ ಸೇನಾಧಿಪತ್ಯ (ರುಚಕ ಯೋಗ) ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "In disciplined Capricorn, Mars channels his fiery energy into structured, triumphant executive leadership.",
      debilitatedPlanetKn: "ಗುರು (5° ಯಲ್ಲಿ ಮಕರದಲ್ಲಿ ಪರಮ ನೀಚ)",
      debilitatedPlanetEn: "Jupiter (Debilitated at 5° in Capricorn)",
      debilitatedDegree: "5° Makara",
      debilitationReasonKn: "ಆಧ್ಯಾತ್ಮಿಕ ಗುರುವಿಗೆ ಕಠಿಣ ವ್ಯಾವಹಾರಿಕ ಮಕರದಲ್ಲಿ ತತ್ವ ಪ್ರತಿಪಾದನೆ ಕಷ್ಟವಾಗುವುದರಿಂದ ನೀಚ ಸ್ಥಿತಿ.",
      debilitationReasonEn: "Spiritual Jupiter feels constrained by the pragmatic, cold structures of Capricorn."
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ"],
      enemies: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಮಂಗಳ"],
      neutrals: ["ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn"],
      enemies: ["Sun", "Moon", "Mars"],
      neutrals: ["Jupiter"]
    },
    grahaEffects: [
      {
        planetKn: "ಸೂರ್ಯ (Surya)",
        planetEn: "Sun (Surya)",
        symbol: "☀️",
        nature: "benefic",
        effectTitleKn: "ದಿಗ್ಬಲ ಸೂರ್ಯ & ರಾಜ್ಯಾಧಿಕಾರ (Sun in 10th - Digbala)",
        effectTitleEn: "Digbala Sun: Supreme Executive Power (Sun in 10th)",
        descriptionKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಗರಿಷ್ಠ ದಿಗ್ಬಲ ದೊರೆಯುತ್ತದೆ. ಉನ್ನತ ಸರ್ಕಾರಿ ಹುದ್ದೆ (IAS/KAS), ಅಧಿಕಾರ, ಸಮಾಜದಲ್ಲಿ ಅಪ್ರತಿಮ ಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವ.",
        descriptionEn: "Sun attains maximum directional strength (Digbala) in the 10th house, bestowing high government office, public stature, and authority.",
        keyGiftsKn: ["ರಾಜ್ಯಾಧಿಕಾರ", "ದಿಗ್ಬಲ ಕೀರ್ತಿ", "ಸಾರ್ವಜನಿಕ ನಾಯಕತ್ವ"],
        keyGiftsEn: ["Executive Authority", "Supreme Fame", "Civic Leadership"],
        watchOutsKn: ["ಅಧಿಕಾರದ ಅಹಂಕಾರ"],
        watchOutsEn: ["Authoritarian pride"]
      }
    ],
    quiz: [
      {
        questionKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಯಾವ ಗ್ರಹಕ್ಕೆ ಗರಿಷ್ಠ 'ದಿಗ್ಬಲ' (Directional Strength) ದೊರೆಯುತ್ತದೆ?",
        questionEn: "Which planet attains peak Directional Strength (Digbala) in the 10th House?",
        optionsKn: ["ಸೂರ್ಯ ಮತ್ತು ಮಂಗಳ", "ಚಂದ್ರ", "ಶುಕ್ರ", "ಕೇತು"],
        optionsEn: ["Sun & Mars", "Moon", "Venus", "Ketu"],
        correctIndex: 0,
        explanationKn: "ಮಧ್ಯಾಹ್ನದ ಆಕಾಶದ ೧೦ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯ ಮತ್ತು ಮಂಗಳ ಗ್ರಹಗಳಿಗೆ ಪರಮ ದಿಗ್ಬಲ ದೊರೆಯುತ್ತದೆ.",
        explanationEn: "Sun and Mars attain peak Digbala in the mid-heaven 10th house."
      }
    ]
  },

  11: {
    houseNumber: 11,
    sanskritName: "ಲಾಭ & ಆಯ ಭಾವ (Labha Bhava)",
    kannadaName: "೧೧ನೇ ಮನೆ - ಲಾಭ, ಸಿದ್ಧಿ, ಮಿತ್ರ & ಹಿರಿಯ ಸಹೋದರ ಭಾವ",
    englishName: "11th House - Labha Bhava (Gains, Desires Fulfillment & Social Network)",
    naturalRashiKn: "ಕುಂಭ (Kumbha / Aquarius)",
    naturalRashiEn: "Kumbha (Aquarius)",
    naturalLordKn: "ಶನಿ / ರಾಹು (Shani / Rahu)",
    naturalLordEn: "Saturn / Rahu",
    bhavaCategoryKn: "ಉಪಚಯ & ಕಾಮ ತ್ರಿಕೋಣ (Prime Upachaya)",
    bhavaCategoryEn: "Prime Upachaya & Kama Trikona",
    elementKn: "ವಾಯu ತತ್ತ್ವ (Air Element - Expansive Network)",
    elementEn: "Air Element (Global Network & Abundance)",
    bodyPartsKn: "ಎಡಗಣ್ಣು, ಎಡಕಿವಿ, ಪಾದದ ಕಣಕಾಲುಗಳು (Ankles), ನರಮಂಡಲ",
    bodyPartsEn: "Left Ear, Left Eye, Ankles, Calves & Circulatory Network",
    lifeThemesKn: ["ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ (ಲಾಭ)", "ಹಿರಿಯ ಸಹೋದರರು", "ದೊಡ್ಡ ಮಿತ್ರ ವೃಂದ", "ಹಣಕಾಸು ಹರಿವು", "ಪ್ರಶಸ್ತಿ & ಪುರಸ್ಕಾರ"],
    lifeThemesEn: ["Fulfillment of Desires", "Elder Siblings", "Expansive Social Circle", "Passive Cash Flow", "Awards & Honors"],
    simpleIntroKn: "೧೧ನೇ ಮನೆಯು ನಿಮ್ಮ ಸಕಲ ಆಸೆಗಳನ್ನು ಈಡೇರಿಸುವ ಮಹಾ ಲಾಭ ಸ್ಥಾನ! ಇಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹ ಕುಳಿತರೂ ಶುಭ ಫಲ ಹಾಗೂ ಆದಾಯವನ್ನು ನೀಡುತ್ತದೆ.",
    simpleIntroEn: "The 11th House is the wish-fulfilling house of gains (Sarva Labha). Almost all planets produce positive financial results here.",
    dignity: {
      exaltedPlanetKn: "ಯಾವುದೇ ಗ್ರಹವಿಲ್ಲ (ಎಲ್ಲಾ ಗ್ರಹಗಳಿಗೂ ಲಾಭದಾಯಕ)",
      exaltedPlanetEn: "All Planets flourish in the 11th house",
      exaltedDegree: "Kumbha",
      exaltationReasonKn: "ಉಪಚಯ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಸಕಲ ಗ್ರಹಗಳೂ ಕಾಲಕ್ರಮೇಣ ಆದಾಯ ಹಾಗೂ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಸುತ್ತವೆ.",
      exaltationReasonEn: "As the prime Upachaya, the 11th house matures all planetary energies into material and social gains.",
      debilitatedPlanetKn: "ಯಾವುದೇ ಗ್ರಹವಿಲ್ಲ",
      debilitatedPlanetEn: "None",
      debilitatedDegree: "Kumbha",
      debilitationReasonKn: "ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹ ಸಂಪೂರ್ಣ ನೀಚತ್ವ ಅನುಭವಿಸುವುದಿಲ್ಲ.",
      debilitationReasonEn: "Planets rarely suffer complete debilitation in the house of universal gains."
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ", "ರಾಹು"],
      enemies: ["ಸೂರ್ಯ", "ಚಂದ್ರ"],
      neutrals: ["ಗುರು", "ಮಂಗಳ"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn", "Rahu"],
      enemies: ["Sun", "Moon"],
      neutrals: ["Jupiter", "Mars"]
    },
    grahaEffects: [
      {
        planetKn: "ಗುರು (Brihaspati)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        nature: "benefic",
        effectTitleKn: "ಸರ್ವ ಸಿದ್ಧಿ & ನಿರಂತರ ಆದಾಯ (Jupiter in 11th)",
        effectTitleEn: "Universal Gains & Noble Wealth (Jupiter in 11th)",
        descriptionKn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ಧರ್ಮ ಮಾರ್ಗದ ಅಪಾರ ಆದಾಯ, ಸತ್ಪುರುಷರ ಸಹವಾಸ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಪ್ರಭಾವ.",
        descriptionEn: "Bestows continuous financial inflows through righteous means, honorable associates, and fulfillment of high aspirations.",
        keyGiftsKn: ["ಅಪಾರ ಆದಾಯ", "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ", "ಸಜ್ಜನರ ಸ್ನೇಹ"],
        keyGiftsEn: ["Vast Wealth", "Fulfillment of Dreams", "Noble Network"],
        watchOutsKn: ["ಅತಿಯಾದ ಔದಾರ್ಯ"],
        watchOutsEn: ["Excessive benevolence"]
      }
    ],
    quiz: [
      {
        questionKn: "೧೧ನೇ ಮನೆಯನ್ನು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಪ್ರಮುಖವಾಗಿ ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?",
        questionEn: "What is the 11th House famously known as?",
        optionsKn: ["ಲಾಭ & ಸಿದ್ಧಿ ಭಾವ", "ಶತ್ರು ಭಾವ", "ಮಾತೃ ಭಾವ", "ವ್ಯಯ ಭಾವ"],
        optionsEn: ["Labha Bhava (Gains)", "Shatru Bhava", "Matru Bhava", "Vyaya Bhava"],
        correctIndex: 0,
        explanationKn: "೧೧ನೇ ಮನೆಯು ಆದಾಯ, ಆಸೆಗಳ ಈಡೇರಿಕೆ ಹಾಗೂ ಲಾಭವನ್ನು ಸೂಚಿಸುವುದರಿಂದ 'ಲಾಭ ಸ್ಥಾನ' ಎನ್ನಲಾಗುತ್ತದೆ.",
        explanationEn: "The 11th house is termed Labha Bhava, representing all material gains and fulfilled aspirations."
      }
    ]
  },

  12: {
    houseNumber: 12,
    sanskritName: "ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ (Moksha Bhava)",
    kannadaName: "೧೨ನೇ ಮನೆ - ವ್ಯಯ, ವಿದೇಶ & ಮೋಕ್ಷ ಭಾವ",
    englishName: "12th House - Vyaya Bhava (Foreign Lands, Subconscious, Expenses & Moksha)",
    naturalRashiKn: "ಮೀನ (Meena / Pisces)",
    naturalRashiEn: "Meena (Pisces)",
    naturalLordKn: "ಗುರು (Guru / Jupiter)",
    naturalLordEn: "Jupiter (Guru)",
    bhavaCategoryKn: "ಮೋಕ್ಷ ತ್ರಿಕೋಣ & ತ್ರಿಕ ಸ್ಥಾನ (Moksha Dusthana)",
    bhavaCategoryEn: "Final Moksha Trikona & Spiritual Sanctuary",
    elementKn: "ಜಲ ತತ್ತ್ವ (Water Element - Infinite Cosmic Ocean)",
    elementEn: "Water Element (Cosmic Dissolution & Transcendence)",
    bodyPartsKn: "ಪಾದಗಳು, ಎಡಗಣ್ಣು, ನಿದ್ರೆ (ಮಿದುಳಿನ ನಿದ್ರಾ ಕೇಂದ್ರ)",
    bodyPartsEn: "Feet, Left Eye, Sleep Chambers & Subconscious",
    lifeThemesKn: ["ಮೋಕ್ಷ & ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ", "ವಿದೇಶ ವಾಸ & ಪ್ರಯಾಣ", "ದಾನ & ಧರ್ಮ ವ್ಯಯ", "ಪ್ರಶಾಂತ ನಿದ್ರೆ (ಶಯನ ಸುಖ)", "ಧ್ಯಾನ & ಏಕಾಂತ"],
    lifeThemesEn: ["Moksha / Spiritual Liberation", "Foreign Relocation", "Philanthropic Spending", "Peaceful Sleep & Dreams", "Meditation & Solitude"],
    simpleIntroKn: "೧೨ನೇ ಮನೆಯು ಜಾತಕ ಚಕ್ರದ ಅಂತಿಮ ಮುಕ್ತಿ ಸ್ಥಾನ! ಇದು ವಿದೇಶ ವಾಸ, ದಾನ-ಧರ್ಮ, ಪ್ರಶಾಂತ ನಿದ್ರೆ ಹಾಗೂ ಆತ್ಮದ ಮೋಕ್ಷವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 12th House is the final spiritual sanctuary of the Kundli, governing foreign travel, peaceful sleep, and ultimate Moksha.",
    dignity: {
      exaltedPlanetKn: "ಶುಕ್ರ (27° ಯಲ್ಲಿ ಮೀನದಲ್ಲಿ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Venus (Exalted up to 27° in Pisces)",
      exaltedDegree: "27° Meena",
      exaltationReasonKn: "ಪ್ರೀತಿಯ ಕಾರಕ ಶುಕ್ರನಿಗೆ ಅನಂತ ಜಲರಾಶಿಯಾದ ಮೀನದಲ್ಲಿ ದೈವಿಕ ಭಕ್ತಿ ಪ್ರೇಮ (ರಾಧಾ-ಕೃಷ್ಣ ಪ್ರೇಮ) ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Venus attains sublime spiritual devotion, unconditional compassion, and aesthetic bliss in Pisces.",
      debilitatedPlanetKn: "ಬುಧ (15° ಯಲ್ಲಿ ಮೀನದಲ್ಲಿ ಪರಮ ನೀಚ)",
      debilitatedPlanetEn: "Mercury (Debilitated at 15° in Pisces)",
      debilitatedDegree: "15° Meena",
      debilitationReasonKn: "ತಾರ್ಕಿಕ ಲೆಕ್ಕಾಚಾರದ ಬುಧನಿಗೆ ಅತೀಂದ್ರಿಯ ಆಧ್ಯಾತ್ಮಿಕ ಮೀನದಲ್ಲಿ ತರ್ಕ ಸೋಲುವುದರಿಂದ ನೀಚ ಸ್ಥಿತಿ.",
      debilitationReasonEn: "Logical, analytical Mercury feels overwhelmed in the boundless, poetic waters of Pisces."
    },
    friendshipsKn: {
      friends: ["ಸೂರ್ಯ", "ಚಂದ್ರ", "ಮಂಗಳ", "ಗುರು"],
      enemies: ["ಬುಧ", "ಶುಕ್ರ"],
      neutrals: ["ಶನಿ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Mars", "Jupiter"],
      enemies: ["Mercury", "Venus"],
      neutrals: ["Saturn"]
    },
    grahaEffects: [
      {
        planetKn: "ಕೇತು (Ketu)",
        planetEn: "Ketu",
        symbol: "📿",
        nature: "benefic",
        effectTitleKn: "ಮೋಕ್ಷ ಕಾರಕ ಕೇತು (Ketu in 12th)",
        effectTitleEn: "Supreme Moksha Karaka (Ketu in 12th)",
        descriptionKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು ಪರಮ ಶ್ರೇಷ್ಠ. ಸಂಸಾರ ಬಂಧನದಿಂದ ಮುಕ್ತಿ, ಆಳವಾದ ಧ್ಯಾನ ಸಿದ್ಧಿ, ದೈವಿಕ ಸನ್ನಿಧಾನ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿ.",
        descriptionEn: "Ketu in the 12th is the classic signature of spiritual liberation (Moksha), deep meditative trance, and divine union.",
        keyGiftsKn: ["ಮೋಕ್ಷ ಸಿದ್ಧಿ", "ಧ್ಯಾನ ಶಕ್ತಿ", "ದೈವಿಕ ಶಾಂತಿ"],
        keyGiftsEn: ["Spiritual Liberation", "Meditative Trance", "Inner Peace"],
        watchOutsKn: ["ಐಹಿಕ ವಿಷಯಗಳಲ್ಲಿ ನಿರಾಸಕ್ತಿ"],
        watchOutsEn: ["Extreme detachment from mundane chores"]
      }
    ],
    quiz: [
      {
        questionKn: "೧೨ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ಮೀನದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in the 12th sign Pisces (Meena)?",
        optionsKn: ["ಶುಕ್ರ (Venus)", "ಬುಧ", "ಶನಿ", "ಸೂರ್ಯ"],
        optionsEn: ["Venus (Shukra)", "Mercury", "Saturn", "Sun"],
        correctIndex: 0,
        explanationKn: "ಶುಕ್ರನು ಮೀನ ರಾಶಿಯ ೨೭ನೇ ಅಂಶದವರೆಗೆ ಪರಮೋಚ್ಚನಾಗಿ ದೈವಿಕ ಪ್ರೇಮ ಮತ್ತು ಸಕಲ ಸುಖವನ್ನು ನೀಡುತ್ತಾನೆ.",
        explanationEn: "Venus is exalted in Pisces up to 27°, bestowing divine love and sublime comfort."
      }
    ]
  }
};
