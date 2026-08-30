/**
 * Classical Vedic Kundli Gurukula & Master Knowledge Engine.
 * 
 * Guided by: Revered Shreeram Pandit (ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ - ಗುರೂಜಿ)
 * Sourced directly from:
 * 1. Prof. Dr. B.V. Raman - "How to Judge a Horoscope" (Vols 1 & 2), "300 Important Combinations", "Manual of Hindu Astrology"
 * 2. Brihat Parashara Hora Shastra (Bhava, Drishti, Karaka & Yoga Adhyayas)
 * 3. Jataka Parijata, Phaladeepika, Saravali & Bhavartha Ratnakara
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
  moolatrikonaKn: string;
  moolatrikonaEn: string;
};

export type SpecialVedicRule = {
  ruleTitleKn: string;
  ruleTitleEn: string;
  classicalSource: string;
  explanationKn: string;
  explanationEn: string;
  bvRamanInsightKn: string;
  bvRamanInsightEn: string;
  practicalExampleKn: string;
  practicalExampleEn: string;
};

export type PlanetaryDrishtiRule = {
  planetKn: string;
  planetEn: string;
  symbol: string;
  aspectsKn: string[];
  aspectsEn: string[];
  drishtiQualityKn: string;
  drishtiQualityEn: string;
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
  bvRamanVerdictKn: string;
  bvRamanVerdictEn: string;
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

export type HouseRealWorldExample = {
  exampleTitleKn: string;
  exampleTitleEn: string;
  chartContextKn: string;
  chartContextEn: string;
  lagnaRashi: string;
  keyPlacements: Array<{
    planetKn: string;
    planetEn: string;
    house: number;
    rashiKn: string;
    rashiEn: string;
    conditionKn: string;
    conditionEn: string;
    isPositive: boolean;
  }>;
  synthesisAnalysisKn: string[];
  synthesisAnalysisEn: string[];
  bvRamanGoldenVerdictKn: string;
  bvRamanGoldenVerdictEn: string;
  remedialTakeawayKn: string;
  remedialTakeawayEn: string;
};

export type Master12HouseSynthesisExample = {
  titleKn: string;
  titleEn: string;
  subtitleKn: string;
  subtitleEn: string;
  lagna: string;
  horoscopeName: string;
  all12HouseAnalysis: Array<{
    houseNumber: number;
    houseNameKn: string;
    houseNameEn: string;
    rashiKn: string;
    rashiEn: string;
    planetsPresent: string;
    bhavaLord: string;
    bhavaLordPlacement: string;
    conditionQuality: "Exalted / Raja Yoga" | "Benefic / Strong" | "Moderate / Neutral" | "Afflicted / Caution";
    interpretationKn: string;
    interpretationEn: string;
  }>;
  overallGrandVerdictKn: string;
  overallGrandVerdictEn: string;
  masterLifeLessonKn: string;
  masterLifeLessonEn: string;
};

export type HouseLearningModule = {
  realWorldExample: HouseRealWorldExample;
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
  karakaPlanetKn: string;
  karakaPlanetEn: string;
  bhavatBhavamHouse: number;
  bhavatBhavamDescKn: string;
  bhavatBhavamDescEn: string;
  lifeThemesKn: string[];
  lifeThemesEn: string[];
  simpleIntroKn: string;
  simpleIntroEn: string;
  guruSandeshaKn: string;
  guruSandeshaEn: string;
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
  specialRules: SpecialVedicRule[];
  drishtiRules: PlanetaryDrishtiRule[];
  grahaEffects: GrahaPlacementEffect[];
  quiz: HouseQuizQuestion[];
};

// Helper to generate the 9 standard graha placement outcomes for all houses
function createFull9GrahaEffects(
  houseNum: number,
  hNameKn: string,
  hNameEn: string,
  specialOverrides: Record<string, Partial<GrahaPlacementEffect>> = {}
): GrahaPlacementEffect[] {
  const defaultGrahas: { planetKn: string; planetEn: string; symbol: string; nature: "benefic" | "malefic" | "neutral" }[] = [
    { planetKn: "ರವಿ (Ravi)", planetEn: "Sun (Ravi)", symbol: "☀️", nature: "benefic" },
    { planetKn: "ಚಂದ್ರ (Chandra)", planetEn: "Moon (Chandra)", symbol: "🌙", nature: "benefic" },
    { planetKn: "ಮಂಗಳ (Kuja)", planetEn: "Mars (Kuja)", symbol: "🔥", nature: "benefic" },
    { planetKn: "ಬುಧ (Budha)", planetEn: "Mercury (Budha)", symbol: "💎", nature: "benefic" },
    { planetKn: "ಗುರು (Brihaspati)", planetEn: "Jupiter (Guru)", symbol: "🌟", nature: "benefic" },
    { planetKn: "ಶುಕ್ರ (Shukra)", planetEn: "Venus (Shukra)", symbol: "💖", nature: "benefic" },
    { planetKn: "ಶನಿ (Shani)", planetEn: "Saturn (Shani)", symbol: "🪐", nature: "neutral" },
    { planetKn: "ರಾಹು (Rahu)", planetEn: "Rahu", symbol: "🌪️", nature: "malefic" },
    { planetKn: "ಕೇತು (Ketu)", planetEn: "Ketu", symbol: "📿", nature: "neutral" }
  ];

  return defaultGrahas.map((g) => {
    const key = g.planetEn.split(" ")[0];
    const override = specialOverrides[key] || {};

    const defaultTitleKn = `${g.planetKn} ${houseNum}ನೇ ಮನೆಯ ಫಲ (${hNameKn})`;
    const defaultTitleEn = `${g.planetEn} in House ${houseNum} (${hNameEn})`;
    const defaultDescKn = `${g.planetKn} ${houseNum}ನೇ ಮನೆಯಲ್ಲಿ ಕುಳಿತಾಗ ಜಾತಕನ ಜೀವನದಲ್ಲಿ ಆ ಭಾವದ ಕಾರಕತ್ವಗಳು ಸಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ. ಶುಭ ದೃಷ್ಟಿಯಿದ್ದರೆ ಸರ್ವ ಸುಖ ಲಭಿಸುತ್ತದೆ.`;
    const defaultDescEn = `Placement of ${g.planetEn} in House ${houseNum} activates the significations of this bhava with distinct karmic fruition.`;
    const defaultVerdictKn = `ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '${houseNum}ನೇ ಮನೆಯಲ್ಲಿ ${g.planetKn} ಸ್ಥಿತಿಯಿರುವಾಗ ಗ್ರಹದ ನೈಸರ್ಗಿಕ ಶಕ್ತಿ ಹಾಗೂ ಶತ್ರು-ಮಿತ್ರ ಮೈತ್ರಿಯನ್ನು ನೋಡಿ ಫಲ ನಿರ್ಧರಿಸಬೇಕು.'`;
    const defaultVerdictEn = `Revered Shreeram Pandit: 'In House ${houseNum}, assess ${g.planetEn}'s dignity and friendship alliances for accurate prediction.'`;

    return {
      planetKn: g.planetKn,
      planetEn: g.planetEn,
      symbol: g.symbol,
      nature: override.nature || g.nature,
      effectTitleKn: override.effectTitleKn || defaultTitleKn,
      effectTitleEn: override.effectTitleEn || defaultTitleEn,
      descriptionKn: override.descriptionKn || defaultDescKn,
      descriptionEn: override.descriptionEn || defaultDescEn,
      keyGiftsKn: override.keyGiftsKn || ["ಆತ್ಮವಿಶ್ವಾಸ", "ಅಭಿವೃದ್ಧಿ", "ದೈವಾನುಗ್ರಹ"],
      keyGiftsEn: override.keyGiftsEn || ["Confidence", "Growth", "Divine Grace"],
      watchOutsKn: override.watchOutsKn || ["ಆತುರ ನಿರ್ಧಾರ ಬೇಡ", "ಸಂಯಮ ಪಾಲನೆ"],
      watchOutsEn: override.watchOutsEn || ["Avoid hasty impulses", "Practice patience"],
      bvRamanVerdictKn: override.bvRamanVerdictKn || defaultVerdictKn,
      bvRamanVerdictEn: override.bvRamanVerdictEn || defaultVerdictEn
    };
  });
}

export const HOUSE_LEARNING_MODULES: Record<number, HouseLearningModule> = {
  // =========================================================================
  // HOUSE 1: TANU BHAVA (LAGNA)
  // =========================================================================
  1: {
    houseNumber: 1,
    sanskritName: "ತನು ಭಾವ (Tanu Bhava / Lagna)",
    kannadaName: "೧ನೇ ಮನೆ - ತನು ಭಾವ (ಜನ್ಮ ಲಗ್ನ)",
    englishName: "1st House - Tanu Bhava (Ascendant & The Self)",
    naturalRashiKn: "ಮೇಷ (Mesha / Aries)",
    naturalRashiEn: "Mesha (Aries)",
    naturalLordKn: "ಮಂಗಳ (Kuja / Mars)",
    naturalLordEn: "Mars (Kuja)",
    karakaPlanetKn: "ರವಿ (Ravi - ಆತ್ಮಕಾರಕ)",
    karakaPlanetEn: "Sun (Surya - Soul Signifier)",
    bhavaCategoryKn: "ಕೇಂದ್ರ & ತ್ರಿಕೋಣ ಸ್ಥಾನ (Supreme Kendra & Dharma Trikona)",
    bhavaCategoryEn: "Dharma Trikona & Prime Kendra",
    elementKn: "ಅಗ್ನಿ ತತ್ತ್ವ (Fire Element - Vital Life Force)",
    elementEn: "Fire Element (Prana & Vitality)",
    bodyPartsKn: "ಶಿರಸ್ಸು, ಮುಖ, ಮಿದುಳು, ಶರೀರದ ಸಂಪೂರ್ಣ ಚೈತನ್ಯ & ತೇಜಸ್ಸು",
    bodyPartsEn: "Head, Brain, Face, Cranium, General Immunity & Vitality",
    bhavatBhavamHouse: 1,
    bhavatBhavamDescKn: "೧ನೇ ಮನೆಯೇ ಸ್ವತಂತ್ರ ಕೇಂದ್ರ. ಇದು ಸಂಪೂರ್ಣ ಜಾತಕದ ಅಡಿಪಾಯ.",
    bhavatBhavamDescEn: "The 1st House is the foundational anchor of the entire horoscope.",
    lifeThemesKn: ["ವ್ಯಕ್ತಿತ್ವ", "ಆತ್ಮವಿಶ್ವಾಸ", "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ", "ಪ್ರಾರಂಭ & ನಾಯಕತ್ವ", "ತೇಜಸ್ಸು"],
    lifeThemesEn: ["Personality", "Self-Confidence", "Physical Vitality", "Initiative", "Radiance"],
    simpleIntroKn: "೧ನೇ ಮನೆಯೇ ನಿಮ್ಮ ಜಾತಕದ ಪ್ರವೇಶ ದ್ವಾರ! ಇದು ನಿಮ್ಮ ಶರೀರ, ರೂಪ, ವರ್ತನೆ ಹಾಗೂ ಜೀವನವನ್ನು ಹೇಗೆ ಮುನ್ನಡೆಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 1st House is the gateway of your horoscope! It represents your physical body, appearance, self-identity, and health vitality.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: 'ಲಗ್ನವೆಂಬುದು ಮರದ ಬೇರು ಇದ್ದಂತೆ. ಲಗ್ನ ಬಲವಾಗಿದ್ದರೆ ಎಂತಹ ಕಠಿಣ ಗ್ರಹದೋಷಗಳಿದ್ದರೂ ಮರವು ಫಲಪುಷ್ಪಗಳಿಂದ ಕಂಗೊಳಿಸುತ್ತದೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'Lagna is the root of the tree of life. When the Ascendant is strong, the native flourishes despite external planetary storms.'",
    dignity: {
      exaltedPlanetKn: "ರವಿ (Ravi - 10° ವರೆಗೆ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Sun (Surya - Exalted up to 10°)",
      exaltedDegree: "10° Mesha",
      exaltationReasonKn: "ರವಿಯು ಆತ್ಮಕಾರಕ ಹಾಗೂ ರಾಜ. ಅಗ್ನಿ ತತ್ತ್ವದ ಮೊದಲ ಮನೆಯಲ್ಲಿ ರವಿಗೆ ಗರಿಷ್ಠ ತೇಜಸ್ಸು ಹಾಗೂ ನಾಯಕತ್ವ ಬಲ ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Sun is the king and soul signifier. In the first fiery sign, Sun achieves maximum illumination, leadership, and vitality.",
      debilitatedPlanetKn: "ಶನಿ (Shani - 20° ಯಲ್ಲಿ ಪರಮ ನೀಚ)",
      debilitatedPlanetEn: "Saturn (Shani - Debilitated at 20°)",
      debilitatedDegree: "20° Mesha",
      debilitationReasonKn: "ಶನಿಯು ತಂಪು ಮತ್ತು ಸೇವಕ ಗ್ರಹ. ಬೆಂಕಿಯಂತಹ ತೇಜಸ್ಸಿನ ೧ನೇ ಮನೆಯಲ್ಲಿ ಶನಿಗೆ ಆಲಸ್ಯ ಅಥವಾ ಕಠಿಣ ಸಂಘರ್ಷ ಉಂಟಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Saturn represents coolness and patience. The intense pioneering fire of the 1st house creates friction for Saturn.",
      moolatrikonaKn: "ಮಂಗಳ (0° - 12° ಮೇಷದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Mars (0° - 12° in Aries is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ರವಿ (Ravi)", "ಗುರು (Guru)", "ಚಂದ್ರ (Chandra)"],
      enemies: ["ಬುಧ (Budha)", "ಶುಕ್ರ (Shukra)"],
      neutrals: ["ಶನಿ (Shani)"]
    },
    friendshipsEn: {
      friends: ["Sun (Surya)", "Jupiter (Guru)", "Moon (Chandra)"],
      enemies: ["Mercury (Budha)", "Venus (Shukra)"],
      neutrals: ["Saturn (Shani)"]
    },
    specialRules: [
      {
        ruleTitleKn: "೧. ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಲಗ್ನ ಬಲ ನಿಯಮ (Lagna Strength)",
        ruleTitleEn: "1. B.V. Raman's Lagna Strength Principle",
        classicalSource: "How to Judge a Horoscope (Vol 1)",
        explanationKn: "ಲಗ್ನಾಧಿಪತಿಯು ಕೇಂದ್ರ (೧, ೪, ೭, ೧೦) ಅಥವಾ ತ್ರಿಕೋಣದಲ್ಲಿದ್ದು (೫, ೯) ಶುಭಗ್ರಹಗಳಿಂದ ದೃಷ್ಟನಾಗಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಖಂಡ ಆರೋಗ್ಯ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ಪಡೆಯುತ್ತಾನೆ.",
        explanationEn: "If the Lagna lord is in Kendra (1, 4, 7, 10) or Trikona (5, 9) aspected by benefics, the native enjoys robust immunity, dignity, and longevity.",
        bvRamanInsightKn: "ಲಗ್ನವು ಬಲಿಷ್ಠವಾಗಿದ್ದರೆ ಜಾತಕದಲ್ಲಿರುವ ನೂರಾರು ದೋಷಗಳು ನಿಷ್ಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ.",
        bvRamanInsightEn: "When the Ascendant is fortified, it counteracts and mitigates hundreds of other planetary afflictions.",
        practicalExampleKn: "ಮೇಷ ಲಗ್ನಕ್ಕೆ ಮಂಗಳ ೧ನೇ ಮನೆಯಲ್ಲೇ ಇದ್ದರೆ 'ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ' ಉಂಟಾಗಿ ಉನ್ನತ ಸೇನಾ/ಪೊಲೀಸ್/ಸರ್ಕಾರಿ ಅಧಿಕಾರ ದೊರೆಯುತ್ತದೆ.",
        practicalExampleEn: "Mars in 1st house for Aries forms Ruchaka Yoga, giving top executive, engineering, or defense leadership."
      },
      {
        ruleTitleKn: "೨. ಕಾರಕೋ ಭಾವ ನಾಶಾಯ ನಿಯಮ (Karako Bhava Nashaya)",
        ruleTitleEn: "2. Karako Bhava Nashaya Principle",
        classicalSource: "Bhavartha Ratnakara & Phaladeepika",
        explanationKn: "ಯಾವುದೇ ಮನೆಯ ಕಾರಕ ಗ್ರಹವು ಅದೇ ಮನೆಯಲ್ಲಿ ಏಕಾಂಗಿಯಾಗಿ ಕುಳಿತರೆ ಆ ಭಾವದ ಫಲಕ್ಕೆ ಅಲ್ಪ ಹಿನ್ನಡೆಯಾಗಬಹುದು ಎಂಬ ಸೂಕ್ಷ್ಮ ನಿಯಮ.",
        explanationEn: "When a house's natural significator sits alone in that exact house, its full manifestation requires careful balance.",
        bvRamanInsightKn: "ರವಿಯು ೧ನೇ ಮನೆಯಲ್ಲಿದ್ದಾಗ ಅತಿಯಾದ ಅಹಂಕಾರ ಅಥವಾ ಕಣ್ಣಿನ ತಾಪ ಉಂಟಾಗದಂತೆ ಶುಭ ಗ್ರಹಗಳ ಸಂಯೋಗವಿರಬೇಕು.",
        bvRamanInsightEn: "When Sun sits in the 1st, Jupiter's aspect softens ego and promotes benevolent, noble governance.",
        practicalExampleKn: "ರವಿಯೊಂದಿಗೆ ಗುರು ಅಥವಾ ಚಂದ್ರನ ದೃಷ್ಟಿಯಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಲೋಕಪೂಜ್ಯ ನಾಯಕನಾಗುತ್ತಾನೆ.",
        practicalExampleEn: "Sun aspected by Jupiter in the 1st house creates an universally respected, visionary statesman."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಗುರು (Jupiter)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        aspectsKn: ["೫ನೇ ಮನೆ (ಬುದ್ಧಿ)", "೭ನೇ ಮನೆ (ವಿವಾಹ)", "೯ನೇ ಮನೆ (ಭಾಗ್ಯ)"],
        aspectsEn: ["5th House (Intellect)", "7th House (Marriage)", "9th House (Fortune)"],
        drishtiQualityKn: "ಅಮೃತ ದೃಷ್ಟಿ: ಗುರು ಲಗ್ನದಲ್ಲಿದ್ದು ೫, ೭, ೯ನೇ ಮನೆಗಳನ್ನು ನೋಡುವುದರಿಂದ ಜಾತಕವೇ ಪಾವನವಾಗುತ್ತದೆ.",
        drishtiQualityEn: "Amrita Drishti: Jupiter in 1st aspects 5th (children/intellect), 7th (marriage), and 9th (divine luck), blessing the entire chart."
      },
      {
        planetKn: "ಶನಿ (Saturn)",
        planetEn: "Saturn (Shani)",
        symbol: "🪐",
        aspectsKn: ["೩ನೇ ಮನೆ (ಸಾಹಸ)", "೭ನೇ ಮನೆ (ಸಂಗಾತಿ)", "೧೦ನೇ ಮನೆ (ಕರ್ಮ)"],
        aspectsEn: ["3rd House (Effort)", "7th House (Spouse)", "10th House (Career)"],
        drishtiQualityKn: "ಕರ್ಮ ದೃಷ್ಟಿ: ಶನಿ ಲಗ್ನದಲ್ಲಿದ್ದು ೩, ೭, ೧೦ನೇ ಮನೆಗಳನ್ನು ನೋಡುವುದರಿಂದ ಕಠಿಣ ಪರಿಶ್ರಮದ ನಂತರ ಉನ್ನತ ಯಶಸ್ಸು.",
        drishtiQualityEn: "Karma Drishti: Saturn in 1st aspects 3rd, 7th, and 10th, demanding discipline before granting lasting professional empire."
      },
      {
        planetKn: "ಮಂಗಳ (Mars)",
        planetEn: "Mars (Kuja)",
        symbol: "🔥",
        aspectsKn: ["೪ನೇ ಮನೆ (ಗೃಹ)", "೭ನೇ ಮನೆ (ವಿವಾಹ)", "೮ನೇ ಮನೆ (ಆಯುಷ್ಯ)"],
        aspectsEn: ["4th House (Property)", "7th House (Partnership)", "8th House (Longevity)"],
        drishtiQualityKn: "ತೇಜೋ ದೃಷ್ಟಿ: ಮಂಗಳ ಲಗ್ನದಲ್ಲಿದ್ದು ೪, ೭, ೮ನೇ ಮನೆಗಳನ್ನು ರಕ್ಷಿಸುತ್ತಾನೆ ಮತ್ತು ಧೈರ್ಯ ತುಂಬುತ್ತಾನೆ.",
        drishtiQualityEn: "Fiery Drive: Mars in 1st aspects 4th, 7th, and 8th, giving dynamic courage and property acquisition drive."
      }
    ],
    grahaEffects: createFull9GrahaEffects(1, "ತನು ಭಾವ (ಲಗ್ನ)", "Tanu Bhava (Ascendant)", {
      Sun: {
        effectTitleKn: "ರಾಜತೇಜಸ್ಸು & ನಾಯಕತ್ವ (Sun in 1st)",
        effectTitleEn: "Royal Radiance & Leadership (Sun in 1st)",
        descriptionKn: "ವ್ಯಕ್ತಿಗೆ ಅದ್ಭುತ ಆತ್ಮವಿಶ್ವಾಸ, ಧೈರ್ಯ, ಉತ್ತಮ ಆರೋಗ್ಯ, ಸರ್ಕಾರಿ ಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವ ಸಾಮರ್ಥ್ಯ ದೊರೆಯುತ್ತದೆ.",
        descriptionEn: "Bestows commanding leadership, magnetic self-confidence, strong immunity, and high social dignity.",
        keyGiftsKn: ["ಉತ್ತಮ ನಾಯಕತ್ವ", "ದೃಢ ನಿರ್ಧಾರ", "ತೇಜಸ್ವಿ ಮುಖಕಾಂತಿ"],
        keyGiftsEn: ["Natural Leadership", "Decisiveness", "Glowing Vitality"],
        watchOutsKn: ["ಅತಿಯಾದ ಅಹಂಕಾರ", "ಕೋಪ ನಿಯಂತ್ರಣ"],
        watchOutsEn: ["Ego traps", "Hot-headed impulses"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ & ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: 'ರವಿಯು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಸ್ವಾವಲಂಬಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಧ್ರುವತಾರೆಯಂತೆ ಬೆಳಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit & Dr. B.V. Raman: 'Sun in the Ascendant makes the native self-reliant, courageous, and prominent in society.'"
      },
      Moon: {
        effectTitleKn: "ಸೌಮ್ಯತೆ, ಕರುಣೆ & ಸೌಂದರ್ಯ (Moon in 1st)",
        effectTitleEn: "Gentle Beauty & Empathy (Moon in 1st)",
        descriptionKn: "ಸುಂದರ ನಯನಗಳು, ಕರುಣಾಮಯಿ ಮನಸ್ಸು, ಜನಪ್ರಿಯತೆ ಹಾಗೂ ಕಲಾತ್ಮಕ ಕಲ್ಪನಾ ಶಕ್ತಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
        descriptionEn: "Gives captivating facial charm, deep empathy, public popularity, and intuitive imagination.",
        keyGiftsKn: ["ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ", "ಜನಪ್ರಿಯತೆ", "ಕಲ್ಪನಾಶಕ್ತಿ"],
        keyGiftsEn: ["Charming Aura", "Public Fame", "Creative Intuition"],
        watchOutsKn: ["ಭಾವನಾತ್ಮಕ ಏರಿಳಿತ", "ಚಂಚಲ ಮನಸ್ಸು"],
        watchOutsEn: ["Emotional swings", "Restlessness"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಶುಕ್ಲ ಪಕ್ಷದ ಪೂರ್ಣ ಚಂದ್ರ ಲಗ್ನದಲ್ಲಿದ್ದರೆ ಸಕಲರ ಪ್ರೀತಿಪಾತ್ರನಾಗಿ ಸುಂದರ ವ್ಯಕ್ತಿತ್ವ ಪಡೆಯುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'A waxing Moon in Lagna imparts radiant charisma, gentle manners, and wide public love.'"
      },
      Mars: {
        effectTitleKn: "ರುಚಕ ಯೋಗ & ಶೌರ್ಯ (Mars in 1st)",
        effectTitleEn: "Ruchaka Yoga & Fearless Drive (Mars in 1st)",
        descriptionKn: "ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದಾಗ ಪಂಚ ಮಹಾಪುರುಷ ರುಚಕ ಯೋಗ ಸೃಷ್ಟಿಸುತ್ತದೆ. ಅಪ್ರತಿಮ ಧೈರ್ಯ, ಕ್ರೀಡಾ ಶಕ್ತಿ ಹಾಗೂ ತಾಂತ್ರಿಕ ಚಾಕಚಕ್ಯತೆ ನೀಡುತ್ತದೆ.",
        descriptionEn: "Forms Ruchaka Mahapurusha Yoga in own sign. Imparts athletic dynamism, fearless courage, and mechanical genius.",
        keyGiftsKn: ["ಸಾಹಸ ಪ್ರವೃತ್ತಿ", "ಕ್ರೀಡಾ ಪಟುತ್ವ", "ತಾಂತ್ರಿಕ ಜ್ಞಾನ"],
        keyGiftsEn: ["Courageous Drive", "Athletic Prowess", "Engineering Mind"],
        watchOutsKn: ["ಆತುರ ನಿರ್ಧಾರ", "ರಕ್ತದೊತ್ತಡ"],
        watchOutsEn: ["Impatience", "Headaches / Impulsiveness"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಮಂಗಳನು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ಸೇನಾನಿ ಹಾಗೂ ಅಂಜದ ಸಾಹಸಿಯಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Mars in the Ascendant makes one daring, an energetic leader, and mechanically gifted.'"
      },
      Mercury: {
        effectTitleKn: "ಬುದ್ಧಿವಂತಿಕೆ & ಚುರುಕುತನ (Mercury in 1st)",
        effectTitleEn: "Intellectual Agility & Wit (Mercury in 1st)",
        descriptionKn: "ಸದಾ ತರುಣೋತ್ಸಾಹ, ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ಗಣಿತ-ವ್ಯಾಪಾರ ಚಾಕಚಕ್ಯತೆ ಹಾಗೂ ಅದ್ಭುತ ಮಾತುಗಾರಿಕೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        descriptionEn: "Bestows youthful charm, witty communication, sharp mathematical acumen, and business agility.",
        keyGiftsKn: ["ವಾಗ್ಮಿತ್ವ", "ಗಣಿತ ಪ್ರತಿಭೆ", "ತರುಣ ರೂಪ"],
        keyGiftsEn: ["Eloquent Speech", "Analytical Skill", "Youthful Appearance"],
        watchOutsKn: ["ಏಕಾಗ್ರತೆ ಕೊರತೆ", "ಅತಿಯಾದ ಚರ್ಚೆ"],
        watchOutsEn: ["Scattered focus", "Over-analyzing"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಬುಧನು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಸದಾ ವಿದ್ವತ್ಪೂರ್ಣ ಸಂಭಾಷಣೆ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಮುಂಚೂಣಿಯಲ್ಲಿರುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Mercury in Lagna gives sharp intellect, humorous conversation, and commerce skills.'"
      },
      Jupiter: {
        effectTitleKn: "ದಿವ್ಯ ಜ್ಞಾನ & ಹಂಸ ಯೋಗ (Jupiter in 1st)",
        effectTitleEn: "Divine Wisdom & Dignity (Jupiter in 1st)",
        descriptionKn: "ಲಗ್ನದಲ್ಲಿ ಗುರುವು ಲಕ್ಷ ದೋಷಗಳನ್ನು ನಿವಾರಿಸುತ್ತಾನೆ. ಉನ್ನತ ಸಂಸ್ಕಾರ, ಗೌರವ, ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ನೀಡುತ್ತದೆ.",
        descriptionEn: "Jupiter in Lagna destroys hundreds of doshas. Imparts profound wisdom, noble character, spiritual grace, and longevity.",
        keyGiftsKn: ["ಜ್ಞಾನ & ಪಾಂಡಿತ್ಯ", "ಗುರು ಕೃಪೆ", "ಧರ್ಮಬುದ್ಧಿ"],
        keyGiftsEn: ["Profound Wisdom", "Divine Protection", "Moral Nobility"],
        watchOutsKn: ["ಸ್ಥೂಲಕಾಯ (ತೂಕ ಹೆಚ್ಚಳ)", "ಅತಿಯಾದ ಆಶಾವಾದ"],
        watchOutsEn: ["Weight gain", "Over-optimism"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಲಗ್ನದಲ್ಲಿ ಗುರು ಕುಳಿತರೆ ಜಾತಕಕ್ಕೆ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ದೊರೆಯುತ್ತದೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Jupiter in the Ascendant is a supreme blessing, ensuring high virtue and longevity.'"
      },
      Venus: {
        effectTitleKn: "ಸೌಂದರ್ಯ & ಕಲಾ ವೈಭವ (Venus in 1st)",
        effectTitleEn: "Aesthetic Magnetism & Luxury (Venus in 1st)",
        descriptionKn: "ಅತ್ಯಂತ ಆಕರ್ಷಕ ರೂಪ, ವಸ್ತ್ರ-ಆಭರಣ ಪ್ರೇಮ, ಸಂಗೀತ-ಕಲೆಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಹಾಗೂ ಸಕಲ ಭೋಗಭಾಗ್ಯಗಳನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
        descriptionEn: "Gives charismatic beauty, love for elegance and fashion, artistic mastery, and luxurious joy.",
        keyGiftsKn: ["ಕಲಾ ಪ್ರತಿಭೆ", "ಸುಂದರ ರೂಪ", "ಐಷಾರಾಮಿ ಜೀವನ"],
        keyGiftsEn: ["Artistic Brilliance", "Attractive Persona", "Prosperity & Joy"],
        watchOutsKn: ["ಭೋಗಾಸಕ್ತಿ", "ಸಮಯ ಪಾಲನೆ"],
        watchOutsEn: ["Over-indulgence", "Complacency"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಶುಕ್ರನು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ಆಕರ್ಷಣೆ ಹಾಗೂ ಕಲಾತ್ಮಕ ಕೀರ್ತಿ ಗಳಿಸುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Venus in 1st house endows extraordinary beauty, artistic flair, and gentle manners.'"
      },
      Saturn: {
        effectTitleKn: "ಗಂಭೀರತೆ, ಶಿಸ್ತು & ತಾಳ್ಮೆ (Saturn in 1st)",
        effectTitleEn: "Discipline, Endurance & Sobriety (Saturn in 1st)",
        descriptionKn: "ಗಂಭೀರ ಸ್ವಭಾವ, ಅಚಲ ಶಿಸ್ತು, ನಿಧಾನವಾದರೂ ಶಾಶ್ವತ ಯಶಸ್ಸು ಹಾಗೂ ಅಗಾಧ ಸಹನಶೀಲತೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        descriptionEn: "Instills philosophical gravity, steadfast discipline, enduring patience, and lasting achievements later in life.",
        keyGiftsKn: ["ಅಚಲ ತಾಳ್ಮೆ", "ಕಠಿಣ ಪರಿಶ್ರಮ", "ದೂರದೃಷ್ಟಿ"],
        keyGiftsEn: ["Enduring Patience", "Hard Work Ethic", "Philosophical Depth"],
        watchOutsKn: ["ಆರಂಭಿಕ ವಿಳಂಬ", "ಒಂಟಿತನ"],
        watchOutsEn: ["Early life delays", "Melancholy / Solitude"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಶನಿಯು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ಆರಂಭಿಕ ಸಂಘರ್ಷವಿದ್ದರೂ ೩೬ನೇ ವರ್ಷದ ನಂತರ ಅಖಂಡ ಸ್ಥಿರತೆ ದೊರೆಯುತ್ತದೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Saturn in Lagna builds formidable character through patience, rising to great height after age 36.'"
      },
      Rahu: {
        effectTitleKn: "ವಿಶಿಷ್ಟ ಮಹತ್ವಾಕಾಂಕ್ಷೆ (Rahu in 1st)",
        effectTitleEn: "Unconventional Ambition (Rahu in 1st)",
        descriptionKn: "ಸಂಪ್ರದಾಯ ಮೀರಿದ ಚಿಂತನೆ, ತಂತ್ರಜ್ಞಾನ ಒಲವು, ವಿದೇಶಿ ಸಂಪರ್ಕ ಹಾಗೂ ವಿಶಿಷ್ಟ ಆಕರ್ಷಣೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        descriptionEn: "Grants out-of-the-box thinking, technology affinity, global perspective, and strong worldly ambition.",
        keyGiftsKn: ["ತಂತ್ರಜ್ಞಾನ ಚಾತುರ್ಯ", "ವಿದೇಶ ಯೋಗ", "ವಿಶಿಷ್ಟ ಚಿಂತನೆ"],
        keyGiftsEn: ["Tech Innovation", "Global Exposure", "Original Mindset"],
        watchOutsKn: ["ಭ್ರಮೆ & ಅಸ್ಥಿರತೆ", "ಆರೋಗ್ಯ ಜಾಗ್ರತೆ"],
        watchOutsEn: ["Illusion / Restlessness", "Immunity vigilance"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ರಾಹು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಹೊಸ ಆವಿಷ್ಕಾರಗಳು ಹಾಗೂ ವಿದೇಶಗಳಲ್ಲಿ ಯಶಸ್ವಿಯಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Rahu in Lagna creates unusual charisma and success in cutting-edge or foreign spheres.'"
      },
      Ketu: {
        effectTitleKn: "ಆಧ್ಯಾತ್ಮಿಕ ಅಂತಃಸ್ಫೂರ್ತಿ (Ketu in 1st)",
        effectTitleEn: "Spiritual Intuition & Insight (Ketu in 1st)",
        descriptionKn: "ಆಳವಾದ ಅಂತಃಸ್ಫೂರ್ತಿ, ಗೂಢ ಶಾಸ್ತ್ರಗಳ ಒಲವು, ನಿರಾಸಕ್ತಿ ಹಾಗೂ ತಪಸ್ಸಿನ ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.",
        descriptionEn: "Awakens mystical intuition, non-attachment, deep philosophical insight, and spiritual inclination.",
        keyGiftsKn: ["ಅಂತಃಸ್ಫೂರ್ತಿ", "ಆಧ್ಯಾತ್ಮಿಕತೆ", "ಸರಳತೆ"],
        keyGiftsEn: ["Sixth Sense Intuition", "Spiritual Depth", "Minimalist Simplicity"],
        watchOutsKn: ["ಗೊಂದಲ", "ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ"],
        watchOutsEn: ["Self-doubt", "Indecisiveness"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಕೇತು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಆಧ್ಯಾತ್ಮಿಕ ಅನ್ವೇಷಕ ಹಾಗೂ ಸರಳ ಜೀವಿಯಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Ketu in Lagna inclines one towards spirituality, detachment, and sharp occult perception.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ಸಿಂಹ ಲಗ್ನದಲ್ಲಿ ರವಿ & ಗುರು (ರಾಜಯೋಗ ಲಗ್ನ)",
      exampleTitleEn: "Real Chart Case: Leo Ascendant with Sun & Jupiter (Raja Yoga Lagna)",
      chartContextKn: "ಜಾತಕ: ಸಿಂಹ ಲಗ್ನ. ಲಗ್ನಾಧಿಪತಿ ರವಿಯು ಲಗ್ನದಲ್ಲೇ ಸ್ವಕ್ಷೇತ್ರಸ್ಥನಾಗಿದ್ದು, ೫ನೇ ಹಾಗೂ ೮ನೇ ಅಧಿಪತಿ ಗುರುವು ೯ನೇ ಮನೆಯಾದ ಮೇಷದಿಂದ (ತ್ರಿಕೋಣ) ಲಗ್ನವನ್ನು ಅಮೃತ ದೃಷ್ಟಿಯಿಂದ ನೋಡುತ್ತಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Leo Ascendant. Sun sits in 1st house in own sign Leo, while 5th/8th Lord Jupiter from 9th house (Aries) casts full benefic 9th aspect onto Lagna.",
      lagnaRashi: "Leo (Simha)",
      keyPlacements: [
        { planetKn: "ರವಿ (Surya)", planetEn: "Sun", house: 1, rashiKn: "ಸಿಂಹ (Leo)", rashiEn: "Leo", conditionKn: "ಸ್ವಕ್ಷೇತ್ರ (Own Sign) - ದಿಗ್ಬಲ ಸಮೀಪ", conditionEn: "Own Sign, Prime Vitality", isPositive: true },
        { planetKn: "ಗುರು (Jupiter)", planetEn: "Jupiter", house: 9, rashiKn: "ಮೇಷ (Aries)", rashiEn: "Aries", conditionKn: "೯ನೇ ಮನೆಯಿಂದ ಲಗ್ನದ ಮೇಲೆ ಅಮೃತ ದೃಷ್ಟಿ", conditionEn: "Casting 9th aspect onto 1st house", isPositive: true },
        { planetKn: "ಕುಜ (Mars)", planetEn: "Mars", house: 10, rashiKn: "ವೃಷಭ (Taurus)", rashiEn: "Taurus", conditionKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಯೋಗಕಾರಕ ಸ್ಥಿತಿ", conditionEn: "Yogakaraka in 10th house", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಲಗ್ನ ಶುದ್ಧಿ & ಬಲ: ಲಗ್ನಾಧಿಪತಿ ರವಿಯು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು, ಯಾವುದೇ ಪಾಪಗ್ರಹಗಳ ಸಂಯೋಗವಿಲ್ಲದೆ ಬಲಿಷ್ಠನಾಗಿದ್ದಾನೆ.",
        "೨. ದೈವಿಕ ರಕ್ಷಣೆ: ಭಾಗ್ಯಾಧಿಪತಿ ಗುರುವು ೯ನೇ ಮನೆಯಿಂದ ಲಗ್ನವನ್ನು ನೋಡುವುದರಿಂದ 'ಗುರು ದೃಷ್ಟಿ ಸರ್ವದೋಷಹರ' ಎಂಬ ಶಾಸ್ತ್ರ ನಿಯಮದಂತೆ ನೂರು ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿವೆ.",
        "೩. ನಾಯಕತ್ವ ಫಲ: ಜಾತಕನು ಅತ್ಯುನ್ನತ ಸರ್ಕಾರಿ ಹುದ್ದೆ, ದೃಢ ಆರೋಗ್ಯ, ಆಕರ್ಷಕ ತೇಜಸ್ಸು ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅಪ್ರತಿಮ ಗೌರವ ಪಡೆಯುತ್ತಾನೆ.",
        "೪. ಆಯಸ್ಸು: ಲಗ್ನ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿ ಎರಡೂ ಶುಭ ಬಲ ಪಡೆದಿರುವುದರಿಂದ ಪೂರ್ಣಾಯುಷ್ಯ (೮೫+ ವರ್ಷ) ಸಿದ್ಧಿಸಿದೆ."
      ],
      synthesisAnalysisEn: [
        "1. Lagna Purity: Ascendant Lord Sun is in its own fiery throne in Leo without malefic combustion.",
        "2. Divine Aspect: Jupiter's 9th aspect onto the 1st house activates 'Guru Drishti Sarva Dosha Hara', dissolving minor planetary afflictions.",
        "3. Leadership Result: Native attains top executive government status, robust immunity, and magnetic charisma.",
        "4. Longevity: Strong Lagna and fortified Sun ensure vibrant vitality and Purna Ayush (85+ years)."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: 'ಯಾವ ಜಾತಕದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿಯು ಬಲಿಷ್ಠನಾಗಿ ಗುರುವಿನ ದೃಷ್ಟಿ ಪಡೆಯುತ್ತಾನೋ, ಆ ಜಾತಕನು ಬಾಲ್ಯದಲ್ಲಿ ಎಷ್ಟೇ ಕಷ್ಟಪಟ್ಟರೂ ಕಾಲಾಂತರದಲ್ಲಿ ಉನ್ನತ ನಾಯಕನಾಗಿ ಮೆರೆಯುತ್ತಾನೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'When the Ascendant Lord is fortified and blessed by Jupiter's aspect, the native rises to eminence regardless of humble beginnings.'",
      remedialTakeawayKn: "ದೈನಂದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಗಾಯತ್ರೀ ಜಪವು ಈ ಲಗ್ನದ ತೇಜಸ್ಸನ್ನು ನೂರು ಪಟ್ಟು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      remedialTakeawayEn: "Daily Surya Namaskar and Gayatri Japa magnify this Ascendant's brilliance exponentially."
    },
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
        optionsKn: ["ಶನಿ", "ರವಿ", "ಬುಧ", "ಶುಕ್ರ"],
        optionsEn: ["Saturn", "Sun", "Mercury", "Venus"],
        correctIndex: 1,
        explanationKn: "ರವಿಯು ಮೇಷ ರಾಶಿಯ ೧೦ನೇ ಅಂಶದವರೆಗೆ ಪರಮೋಚ್ಚ (Exalted) ಸ್ಥಾನವನ್ನು ಹೊಂದುತ್ತಾನೆ.",
        explanationEn: "Sun reaches its highest exaltation (Uccha) up to 10° in Mesha."
      },
      {
        questionKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ ಅವರ ಪ್ರಕಾರ ಲಗ್ನದಲ್ಲಿ ಗುರು ಸ್ಥಿತನಾಗಿದ್ದರೆ ಉಂಟಾಗುವ ಮುಖ್ಯ ಫಲವೇನು?",
        questionEn: "According to Revered Shreeram Pandit (Guruji), what is the prime blessing of Jupiter in Lagna?",
        optionsKn: ["ಲಕ್ಷ ದೋಷ ನಿವಾರಣೆ & ಉನ್ನತ ಸಂಸ್ಕಾರ", "ಅಪಾರ ದಾರಿದ್ರ್ಯ", "ಕೋಪ & ಕಲಹ", "ವಿದ್ಯಾ ನಷ್ಟ"],
        optionsEn: ["Destroys hundreds of doshas & grants noble wisdom", "Extreme poverty", "Constant anger", "Loss of learning"],
        correctIndex: 0,
        explanationKn: "'ಏಕೋ ಹಿ ದೇವೋ ಭಗವಾನ್ ಬೃಹಸ್ಪತಿಃ ಲಗ್ನಸ್ಥಿತೋ ಹಂತಿ ಸಹಸ್ರ ದೋಷಾನ್' - ಗುರು ಲಗ್ನದಲ್ಲಿದ್ದರೆ ಸಕಲ ದೋಷ ನಿವಾರಣೆಯಾಗಿ ಜ್ಞಾನ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        explanationEn: "Jupiter in Lagna destroys thousands of obstacles and grants profound wisdom and long life."
      }
    ]
  },

  // =========================================================================
  // HOUSES 2 TO 12 (Comprehensive definitions populated with full 9-graha sets)
  // =========================================================================
  2: {
    houseNumber: 2,
    sanskritName: "ಧನ & ಕುಟುಂಬ ಭಾವ (Dhana Bhava)",
    kannadaName: "೨ನೇ ಮನೆ - ಧನ, ಕುಟುಂಬ & ವಾಣಿ ಭಾವ",
    englishName: "2nd House - Dhana Bhava (Wealth, Family & Speech)",
    naturalRashiKn: "ವೃಷಭ (Vrishabha / Taurus)",
    naturalRashiEn: "Vrishabha (Taurus)",
    naturalLordKn: "ಶುಕ್ರ (Shukra / Venus)",
    naturalLordEn: "Venus (Shukra)",
    karakaPlanetKn: "ಗುರು (Guru - ಧನಕಾರಕ)",
    karakaPlanetEn: "Jupiter (Guru - Wealth Signifier)",
    bhavaCategoryKn: "ಪಣಫರ & ಅರ್ಥ ತ್ರಿಕೋಣ (Artha Trikona)",
    bhavaCategoryEn: "Artha Trikona & Panaphara House",
    elementKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (Earth Element - Material Security)",
    elementEn: "Earth Element (Material Resources)",
    bodyPartsKn: "ಮುಖ, ಬಲಗಣ್ಣು, ನಾಲಿಗೆ, ಹಲ್ಲು, ಕಂಠ ಹಾಗೂ ಧ್ವನಿ",
    bodyPartsEn: "Right Eye, Tongue, Throat, Teeth, Voice & Facial Features",
    bhavatBhavamHouse: 3,
    bhavatBhavamDescKn: "೨ನೇ ಮನೆಯು ೧ನೇ ಮನೆಯಿಂದ ಧನಸಂಪತ್ತನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    bhavatBhavamDescEn: "2nd house sustains the 1st house through nutrition and accumulated assets.",
    lifeThemesKn: ["ಕೂಡಿಟ್ಟ ಧನ (ಆಸ್ತಿ)", "ಕುಟುಂಬ ಸೌಖ್ಯ", "ಮಾತುಗಾರಿಕೆ", "ಆಹಾರ ಪದ್ಧತಿ", "ಆರಂಭಿಕ ಸಂಸ್ಕಾರ"],
    lifeThemesEn: ["Accumulated Wealth", "Family Lineage", "Eloquence of Speech", "Food Habits", "Early Values"],
    simpleIntroKn: "೨ನೇ ಮನೆಯು ನಿಮ್ಮ ಧನ ಸಂಗ್ರಹ, ಕುಟುಂಬ ಸಂಸ್ಕಾರ, ಸಿಹಿ ಮಾತು ಹಾಗೂ ನೀವು ಸೇವಿಸುವ ಆಹಾರದ ಗುಣಮಟ್ಟವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 2nd House governs your saved wealth, family heritage, sweet/truthful speech, and nourishing diet.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: 'ಧನ ಭಾವವು ಕೇವಲ ಹಣವಲ್ಲ; ಅದು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೌಲ್ಯಗಳು, ಮಧುರ ಮಾತು ಹಾಗೂ ಸರಸ್ವತೀ ಅನುಗ್ರಹ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'Dhana Bhava is not merely money; it encompasses family values, cultured speech, and the grace of Goddess Saraswati.'",
    dignity: {
      exaltedPlanetKn: "ಚಂದ್ರ (Chandra - 3° ವರೆಗೆ ವೃಷಭದಲ್ಲಿ ಉಚ್ಚ)",
      exaltedPlanetEn: "Moon (Chandra - Exalted up to 3° in Taurus)",
      exaltedDegree: "3° Vrishabha",
      exaltationReasonKn: "ಚಂದ್ರನು ಮನಸ್ಸು ಮತ್ತು ಪೋಷಣೆಯ ಕಾರಕ. ಸ್ಥಿರ ಹಾಗೂ ಫಲವತ್ತಾದ ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿಗೆ ಗರಿಷ್ಠ ತೃಪ್ತಿ ದೊರೆಯುತ್ತದೆ.",
      exaltationReasonEn: "Moon represents emotional stability and nourishment. The fertile, grounded sign of Taurus provides supreme peace to the Moon.",
      debilitatedPlanetKn: "ರಾಹು / ಕೇತು (ಕೆಲವು ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ)",
      debilitatedPlanetEn: "Rahu / Ketu (Debilitated)",
      debilitatedDegree: "3° Vrishabha",
      debilitationReasonKn: "ವೈರಾಗ್ಯ ಕಾರಕ ಕೇತುವಿಗೆ ಭೌತಿಕ ಧನ ಸಂಗ್ರಹದ ಮನೆಯಲ್ಲಿ ನಿರ್ಲಿಪ್ತತೆ ಉಂಟಾಗುತ್ತದೆ.",
      debilitationReasonEn: "Detached Ketu feels foreign to material asset hoarding in the 2nd house.",
      moolatrikonaKn: "ಚಂದ್ರ (3° - 30° ವೃಷಭದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Moon (3° - 30° in Taurus is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ಶುಕ್ರ (Shukra)", "ಬುಧ (Budha)", "ಶನಿ (Shani)"],
      enemies: ["ರವಿ (Ravi)", "ಚಂದ್ರ (Chandra)"],
      neutrals: ["ಮಂಗಳ (Kuja)", "ಗುರು (Guru)"]
    },
    friendshipsEn: {
      friends: ["Venus (Shukra)", "Mercury (Budha)", "Saturn (Shani)"],
      enemies: ["Sun (Surya)", "Moon (Chandra)"],
      neutrals: ["Mars (Kuja)", "Jupiter (Guru)"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಧನಯೋಗ ನಿಯಮ (Dhana Yoga)",
        ruleTitleEn: "B.V. Raman's Dhana Yoga Rule",
        classicalSource: "300 Important Combinations",
        explanationKn: "೨ನೇ ಮನೆಯ ಅಧಿಪತಿಯು ೧೧ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಅಥವಾ ೧೧ನೇ ಅಧಿಪತಿ ೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ 'ಮಹಾ ಧನ ಯೋಗ' ಉಂಟಾಗುತ್ತದೆ.",
        explanationEn: "Mutual exchange or conjunction between 2nd lord (wealth) and 11th lord (gains) produces Maha Dhana Yoga.",
        bvRamanInsightKn: "ಈ ಯೋಗವಿರುವ ವ್ಯಕ್ತಿಯು ಶೂನ್ಯದಿಂದ ಕೋಟ್ಯಂತರ ರೂಪಾಯಿ ಸಂಪತ್ತನ್ನು ಸಂಪಾದಿಸುತ್ತಾನೆ.",
        bvRamanInsightEn: "This combination empowers the native to build multi-million fortune through self-effort and commerce.",
        practicalExampleKn: "೨ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಅಥವಾ ಶುಕ್ರನಿದ್ದು ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಬುಧನಿದ್ದರೆ ಲಕ್ಷ್ಮೀ ಕೃಪೆ ಸದಾ ಇರುತ್ತದೆ.",
        practicalExampleEn: "Jupiter in 2nd with Mercury in 11th ensures continuous cash flow and ethical wealth."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಗುರು (Jupiter)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        aspectsKn: ["೬ನೇ ಮನೆ (ಋಣ ಪರಿಹಾರ)", "೮ನೇ ಮನೆ (ಆಯುಷ್ಯ)", "೧೦ನೇ ಮನೆ (ಕರ್ಮ)"],
        aspectsEn: ["6th House (Debt Clearance)", "8th House (Longevity)", "10th House (Career)"],
        drishtiQualityKn: "ಧನ ರಕ್ಷಣೆ: ೨ನೇ ಮನೆಯಲ್ಲಿರುವ ಗುರು ೧೦ನೇ ಮನೆಯನ್ನು ನೋಡಿ ವೃತ್ತಿ ಗೌರವವನ್ನು ಹೆಚ್ಚಿಸುತ್ತಾನೆ.",
        drishtiQualityEn: "Jupiter in 2nd aspects 10th house, bestowing high professional integrity and speech-based leadership."
      }
    ],
    grahaEffects: createFull9GrahaEffects(2, "ಧನ & ಕುಟುಂಬ ಭಾವ", "Dhana Bhava (Wealth & Family)", {
      Mercury: {
        effectTitleKn: "ಮಧುರ ವಾಗ್ಮಿತ್ವ & ವ್ಯಾಪಾರ ಲಾಭ (Mercury in 2nd)",
        effectTitleEn: "Sweet Eloquence & Financial Wit (Mercury in 2nd)",
        descriptionKn: "ಅತ್ಯಂತ ಸಿಹಿಯಾದ ಮಾತು, ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ಲೆಕ್ಕಪತ್ರಗಳಲ್ಲಿ ನಿಪುಣತೆ ಹಾಗೂ ವ್ಯಾಪಾರದಿಂದ ಧನ ವೃದ್ಧಿ.",
        descriptionEn: "Grants honeyed speech, financial numeracy, persuasive commercial wit, and flourishing commerce.",
        keyGiftsKn: ["ಸಿಹಿ ಮಾತು", "ಲೆಕ್ಕಾಚಾರ ಚಾತುರ್ಯ", "ವ್ಯಾಪಾರ ಧನ"],
        keyGiftsEn: ["Sweet Speech", "Financial Acumen", "Business Wealth"],
        watchOutsKn: ["ಅತಿಯಾದ ಹರಟೆ", "ಅನಗತ್ಯ ಖರ್ಚು"],
        watchOutsEn: ["Gossip traps", "Frivolous spending"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಬುಧನು ೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ಭಾಷಣಕಾರ ಹಾಗೂ ಚಾಣಾಕ್ಷ ವ್ಯಾಪಾರಿಯಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Mercury in 2nd house makes one an orator, witty in conversation, and rich in trade.'"
      },
      Jupiter: {
        effectTitleKn: "ಅಖಂಡ ಧನಯೋಗ & ಸತ್ಯವಾಣಿ (Jupiter in 2nd)",
        effectTitleEn: "Abundant Wealth & Truthful Speech (Jupiter in 2nd)",
        descriptionKn: "ಸತ್ಯವಾದಿ, ಸುಸಂಸ್ಕೃತ ಕುಟುಂಬ, ಅಪಾರ ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ ಹಾಗೂ ವಿದ್ವತ್ಪೂರ್ಣ ಪ್ರವಚನ ಸಾಮರ್ಥ್ಯ.",
        descriptionEn: "Blesses with noble family values, vast accumulated assets, righteous speech, and scholarly wisdom.",
        keyGiftsKn: ["ಅಖಂಡ ಧನ ಸಂಪತ್ತು", "ಸತ್ಯ ಮಾತು", "ಕುಟುಂಬ ಆನಂದ"],
        keyGiftsEn: ["Immense Assets", "Truthful Speech", "Family Harmony"],
        watchOutsKn: ["ಅತಿಯಾದ ಉದಾರತೆ", "ಸಿಹಿತಿಂಡಿ ಪ್ರೇಮ"],
        watchOutsEn: ["Over-generosity", "Sweet cravings"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಗುರುವು ೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ಸತ್ಯವಾಕ್ಯ ಹಾಗೂ ಸದಾ ಸಂಪದ್ಭರಿತ ಕುಟುಂಬ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Jupiter in 2nd house ensures truthful speech, flourishing family happiness, and vast wealth.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ವೃಷಭ ೨ನೇ ಮನೆಯಲ್ಲಿ ಉಚ್ಚ ಚಂದ್ರ & ಬುಧ (ಕುಬೇರ ಧನಯೋಗ)",
      exampleTitleEn: "Real Chart Case: Exalted Moon & Mercury in 2nd House Taurus (Kuber Dhana Yoga)",
      chartContextKn: "ಜಾತಕ: ಮೇಷ ಲಗ್ನ. ೨ನೇ ಮನೆಯಾದ ವೃಷಭದಲ್ಲಿ ೪ನೇ ಅಧಿಪತಿ ಚಂದ್ರನು ಪರಮೋಚ್ಚನಾಗಿದ್ದು, ೩ನೇ ಮತ್ತು ೬ನೇ ಅಧಿಪತಿ ಬುಧನೊಂದಿಗೆ ಯುತಿಯಾಗಿದ್ದಾನೆ. ೧೧ನೇ ಮನೆಯಿಂದ ಗುರು ದೃಷ್ಟಿಯಿದೆ.",
      chartContextEn: "Chart Setup: Aries Ascendant. 4th Lord Moon is exalted at 3° Taurus in 2nd house with Mercury, receiving benefic aspect from Jupiter in 11th.",
      lagnaRashi: "Aries (Mesha)",
      keyPlacements: [
        { planetKn: "ಚಂದ್ರ (Moon)", planetEn: "Moon", house: 2, rashiKn: "ವೃಷಭ (Taurus)", rashiEn: "Taurus", conditionKn: "ಪರಮೋಚ್ಚ (Exalted at 3°)", conditionEn: "Exalted at 3° Taurus", isPositive: true },
        { planetKn: "ಬುಧ (Mercury)", planetEn: "Mercury", house: 2, rashiKn: "ವೃಷಭ (Taurus)", rashiEn: "Taurus", conditionKn: "ಧನ ಸ್ಥಾನದಲ್ಲಿ ವಾಕ್ ಕಾರಕ", conditionEn: "Speech planet in wealth house", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಧನ ಸಮೃದ್ಧಿ: ೨ನೇ ಮನೆಯಲ್ಲಿ ಉಚ್ಚ ಚಂದ್ರನು ಶಾಶ್ವತ ಕುಟುಂಬ ಸೌಖ್ಯ ಹಾಗೂ ಸ್ಥಿರ ಧನಸಂಚಯವನ್ನು ನೀಡುತ್ತಾನೆ.",
        "೨. ಮಧುರ ವಾಕ್: ಬುಧ-ಚಂದ್ರ ಯುತಿಯು ಗಾಯನ, ಪ್ರವಚನ, ಶಿಕ್ಷಣ ಹಾಗೂ ಬ್ಯಾಂಕಿಂಗ್ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಪಾರ ಕೀರ್ತಿಯನ್ನು ತರುತ್ತದೆ.",
        "೩. ಕಣ್ಣಿನ ದೃಷ್ಟಿ & ಸೌಂದರ್ಯ: ಬಲಗಣ್ಣು ಮತ್ತು ಮುಖದ ಕಾಂತಿ ದೈವಿಕ ತೇಜಸ್ಸಿನಿಂದ ಕೂಡಿರುತ್ತದೆ."
      ],
      synthesisAnalysisEn: [
        "1. Wealth Accumulation: Exalted Moon in the 2nd guarantees abundant liquid assets and ancestral prosperity.",
        "2. Articulate Speech: Mercury-Moon conjunction grants sweet eloquence, melodious voice, and banking mastery.",
        "3. Facial Radiance: Symmetrical facial luster and sharp eyesight."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೨ನೇ ಮನೆಯು ಬಲಿಷ್ಠವಾಗಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಎಂದಿಗೂ ಆರ್ಥಿಕ ಸಂಕಷ್ಟಕ್ಕೆ ಗುರಿಯಾಗುವುದಿಲ್ಲ. ಕುಟುಂಬದ ಗೌರವವು ತಲೆಮಾರುಗಳವರೆಗೆ ಉಳಿಯುತ್ತದೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'A fortified 2nd house shields the native from financial destitution and preserves generational lineage pride.'",
      remedialTakeawayKn: "ಪ್ರತಿದಿನ ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸುವುದರಿಂದ ಧನ ಧಾನ್ಯ ಸಮೃದ್ಧಿ ಸದಾ ನೆಲೆಸಿರುತ್ತದೆ.",
      remedialTakeawayEn: "Chanting Shri Kanakadhara Stotram preserves perpetual treasury abundance."
    },
    quiz: [
      {
        questionKn: "೨ನೇ ಮನೆಯು ಮಾನವನ ಶರೀರದಲ್ಲಿ ಪ್ರಮುಖವಾಗಿ ಯಾವ ಅಂಗಗಳನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ?",
        questionEn: "Which anatomical parts are governed by the 2nd House?",
        optionsKn: ["ಹೃದಯ ಮತ್ತು ಶ್ವಾಸಕೋಶ", "ಬಲಗಣ್ಣು, ಮುಖ, ನಾಲಿಗೆ & ಕಂಠ", "ಕಾಲುಗಳು", "ಹೊಟ್ಟೆ"],
        optionsEn: ["Heart & Lungs", "Right Eye, Face, Tongue & Throat", "Feet", "Stomach"],
        correctIndex: 1,
        explanationKn: "೨ನೇ ಮನೆಯು ಮುಖಕಾಂತಿ, ಬಲಗಣ್ಣು, ಧ್ವನಿ ಹಾಗೂ ಆಹಾರ ಸೇವಿಸುವ ಬಾಯಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        explanationEn: "The 2nd house governs the facial appearance, right eye, voice, and mouth."
      }
    ]
  },

  // =========================================================================
  // HOUSES 3 TO 12
  // =========================================================================
  3: {
    houseNumber: 3,
    sanskritName: "ಸಹಜ & ಭ್ರಾತೃ ಭಾವ (Bhratru Bhava)",
    kannadaName: "೩ನೇ ಮನೆ - ಸಹೋದರ, ಸಾಹಸ & ಪರಾಕ್ರಮ ಭಾವ",
    englishName: "3rd House - Sahaja Bhava (Courage, Siblings & Communication)",
    naturalRashiKn: "ಮಿಥುನ (Mithuna / Gemini)",
    naturalRashiEn: "Mithuna (Gemini)",
    naturalLordKn: "ಬುಧ (Budha / Mercury)",
    naturalLordEn: "Mercury (Budha)",
    karakaPlanetKn: "ಮಂಗಳ (Kuja - ಭ್ರಾತೃಕಾರಕ)",
    karakaPlanetEn: "Mars (Kuja - Sibling & Valour Signifier)",
    bhavaCategoryKn: "ಉಪಚಯ & ಕಾಮ ತ್ರಿಕೋಣ (Upachaya House)",
    bhavaCategoryEn: "Upachaya & Kama Trikona",
    elementKn: "ವಾಯು ತತ್ತ್ವ (Air Element - Communication & Drive)",
    elementEn: "Air Element (Communication & Intellect)",
    bodyPartsKn: "ತೋಳುಗಳು, ಭುಜಗಳು, ಕೈಗಳು, ಕಿವಿಗಳು ಹಾಗೂ ಗಂಟಲು",
    bodyPartsEn: "Arms, Shoulders, Hands, Ears, Throat & Respiratory passages",
    bhavatBhavamHouse: 8,
    bhavatBhavamDescKn: "೩ನೇ ಮನೆಯು ೮ನೇ ಮನೆಯಿಂದ ೮ನೇ ಮನೆಯಾಗಿದ್ದು (ಆಯುಷ್ಯದ ಆಯುಷ್ಯ), ಚೈತನ್ಯ ಶಕ್ತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    bhavatBhavamDescEn: "3rd is 8th from the 8th house, signifying vitality and willpower.",
    lifeThemesKn: ["ಕಿರಿಯ ಸಹೋದರರು", "ಸಾಹಸ & ಧೈರ್ಯ", "ಬರವಣಿಗೆ & ಮಾಧ್ಯಮ", "ಸಣ್ಣ ಪ್ರಯಾಣಗಳು", "ಹವ್ಯಾಸಗಳು"],
    lifeThemesEn: ["Younger Siblings", "Courage & Valour", "Writing & Media", "Short Journeys", "Fine Motor Skills"],
    simpleIntroKn: "೩ನೇ ಮನೆಯು ನಿಮ್ಮ ಭುಜಬಲ, ಕಿರಿಯ ಸಹೋದರರ ಒಡನಾಟ, ಬರವಣಿಗೆಯ ಕಲೆ ಹಾಗೂ ಸಾಹಸ ಪ್ರವೃತ್ತಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 3rd House governs your willpower, younger siblings, writing talents, hands-on creativity, and travel.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೩ನೇ ಮನೆಯು ಧೈರ್ಯದ ಸಂಕೇತ. ಸ್ವಂತ ಪರಿಶ್ರಮವಿಲ್ಲದೆ ಯಾವುದೇ ಜಾತಕದ ಭಾಗ್ಯ ಸಂಪೂರ್ಣವಾಗಿ ಬೆಳಗುವುದಿಲ್ಲ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'The 3rd house represents self-effort and bravery. Without initiative, destiny remains dormant.'",
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
      debilitationReasonEn: "Silent Ketu feels uneasy in communication-heavy Gemini.",
      moolatrikonaKn: "ಬುಧ (ಮಿಥುನದಲ್ಲಿ ಶುಭ)",
      moolatrikonaEn: "Mercury (Own Sign in Gemini)"
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ"],
      enemies: ["ಚಂದ್ರ"],
      neutrals: ["ರವಿ", "ಮಂಗಳ", "ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn"],
      enemies: ["Moon"],
      neutrals: ["Sun", "Mars", "Jupiter"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಭಾವತ್ ಭಾವಂ ನಿಯಮ: ಆಯುಷ್ಯದ ಆಯುಷ್ಯ (Bhavat Bhavam)",
        ruleTitleEn: "Bhavat Bhavam: Vitality of Longevity",
        classicalSource: "B.V. Raman - How to Judge a Horoscope",
        explanationKn: "೩ನೇ ಮನೆಯು ೮ನೇ ಮನೆಯಿಂದ ೮ನೇ ಮನೆಯಾಗಿದೆ (೮ ರಿಂದ ೮ = ೩). ಆದ್ದರಿಂದ ಇದು ಪ್ರಾಣ ಶಕ್ತಿ ಹಾಗೂ ಧೈರ್ಯದ ಮೂಲ.",
        explanationEn: "3rd is 8th from the 8th house. Hence it reveals primal life force and survival instinct.",
        bvRamanInsightKn: "೩ನೇ ಮನೆಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ಧೈರ್ಯಶಾಲಿಯಾಗುತ್ತಾನೆ.",
        bvRamanInsightEn: "Malefics in the 3rd house produce great heroism and competitive dominance.",
        practicalExampleKn: "೩ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ ಅಥವಾ ಶನಿ ಇದ್ದರೆ ಕ್ರೀಡೆ ಅಥವಾ ಯುದ್ಧದಲ್ಲಿ ಅಪ್ರತಿಮ ಜಯ.",
        practicalExampleEn: "Mars or Saturn in the 3rd gives victory in sports, athletics, or high-stakes ventures."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಮಂಗಳ (Mars)",
        planetEn: "Mars (Kuja)",
        symbol: "🔥",
        aspectsKn: ["೬ನೇ ಮನೆ (ಶತ್ರು ಜಯ)", "೯ನೇ ಮನೆ (ಭಾಗ್ಯ)", "೧೦ನೇ ಮನೆ (ಕರ್ಮ)"],
        aspectsEn: ["6th House (Enemy Victory)", "9th House (Bhagya)", "10th House (Career)"],
        drishtiQualityKn: "ಪರಾಕ್ರಮ ದೃಷ್ಟಿ: ೩ನೇ ಮನೆಯ ಮಂಗಳನು ೬ನೇ ಮನೆಯನ್ನು ನೋಡಿ ಸಕಲ ಶತ್ರುಗಳನ್ನು ಸದೆಬಡಿಯುತ್ತಾನೆ.",
        drishtiQualityEn: "Mars in 3rd aspects 6th house, annihilating opposition and empowering swift career growth."
      }
    ],
    grahaEffects: createFull9GrahaEffects(3, "ಸಹಜ & ಭ್ರಾತೃ ಭಾವ", "Sahaja Bhava (Courage & Siblings)", {
      Mars: {
        effectTitleKn: "ಅಪ್ರತಿಮ ಪರಾಕ್ರಮ & ಶೌರ್ಯ (Mars in 3rd)",
        effectTitleEn: "Fearless Valour & Athletic Drive (Mars in 3rd)",
        descriptionKn: "ಉಪಚಯ ೩ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಅಪಾರ ಧೈರ್ಯ, ಕ್ರೀಡಾ ಜಯ ಹಾಗೂ ಶತ್ರುಗಳ ಮೇಲೆ ಸಂಪೂರ್ಣ ವಿಜಯ.",
        descriptionEn: "Mars is magnificent in the 3rd Upachaya house. Gives heroic courage, athletic triumphs, and victory over adversaries.",
        keyGiftsKn: ["ಅಪಾರ ಧೈರ್ಯ", "ಕ್ರೀಡಾ ಸಾಧನೆ", "ಭುಜಬಲ"],
        keyGiftsEn: ["Unconquerable Courage", "Athletic Mastery", "Physical Strength"],
        watchOutsKn: ["ಸಹೋದರರೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ", "ಆತುರ ಚಾಲನೆ"],
        watchOutsEn: ["Sibling arguments", "Impulsive driving"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೩ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳನಿರುವ ಜಾತಕನು ಅತ್ಯಂತ ಸಾಹಸ ಪ್ರವೃತ್ತಿಯ ವ್ಯಕ್ತಿಯಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Mars in the 3rd house makes one intrepid, highly capable, and respected for bravery.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೩ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ & ರಾಹು (ಅಪ್ರತಿಮ ಶೌರ್ಯ & ತಂತ್ರಜ್ಞಾನ ಯೋಗ)",
      exampleTitleEn: "Real Chart Case: Mars & Rahu in 3rd House (Undaunted Valour & Tech Mastery)",
      chartContextKn: "ಜಾತಕ: ಕುಂಭ ಲಗ್ನ. ೩ನೇ ಮನೆಯಾದ ಮೇಷದಲ್ಲಿ ತೃತೀಯಾಧಿಪತಿ ಮಂಗಳನು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು, ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ ರಾಹುವಿನೊಂದಿಗೆ ನೆಲೆಸಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Aquarius Ascendant. 3rd Lord Mars sits in own sign Aries with Rahu in 3rd Upachaya house.",
      lagnaRashi: "Aquarius (Kumbha)",
      keyPlacements: [
        { planetKn: "ಮಂಗಳ (Mars)", planetEn: "Mars", house: 3, rashiKn: "ಮೇಷ (Aries)", rashiEn: "Aries", conditionKn: "ಸ್ವಕ್ಷೇತ್ರಸ್ಥ ಪರಾಕ್ರಮ ಕಾರಕ", conditionEn: "Own sign in courage house", isPositive: true },
        { planetKn: "ರಾಹು (Rahu)", planetEn: "Rahu", house: 3, rashiKn: "ಮೇಷ (Aries)", rashiEn: "Aries", conditionKn: "೩ನೇ ಉಪಚಯದಲ್ಲಿ ಬಲಿಷ್ಠ", conditionEn: "Powerful in 3rd Upachaya", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಸಾಹಸ & ನಿರ್ಭಯತೆ: ೩ನೇ ಮನೆಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳು ಅತ್ಯಂತ ಶುಭ ಫಲ ನೀಡುತ್ತವೆ ಎಂಬ ನಿಯಮದಂತೆ ಜಾತಕನು ಯಾವುದೇ ಸವಾಲಿಗೂ ಹೆದರುವುದಿಲ್ಲ.",
        "೨. ಕ್ರೀಡೆ, ತಂತ್ರಜ್ಞಾನ & ಬರವಣಿಗೆ: ಡಿಜಿಟಲ್ ಮಾಧ್ಯಮ, ಕ್ರೀಡೆ ಅಥವಾ ಸಾಫ್ಟ್‌ವೇರ್ ಕ್ಷೇತ್ರದಲ್ಲಿ ಜಾಗತಿಕ ಖ್ಯಾತಿ ಗಳಿಸುತ್ತಾನೆ.",
        "೩. ಕಿರಿಯ ಸಹೋದರರ ಬಲ: ಸಹೋದರರೊಂದಿಗೆ ಸ್ಪರ್ಧಾತ್ಮಕ ಆದರೆ ಪ್ರಗತಿದಾಯಕ ಸಂಬಂಧವಿರುತ್ತದೆ."
      ],
      synthesisAnalysisEn: [
        "1. Fearless Drive: Benefiting from 'Malefics thrive in 3rd Upachaya', granting extraordinary resilience.",
        "2. Sports & Digital Mastery: Excellence in sports, engineering, publishing, or entrepreneurship.",
        "3. Sibling Dynamics: Competitive yet progressive sibling synergy."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೩ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ-ರಾಹು ಇರುವ ವ್ಯಕ್ತಿಯು ಶೂನ್ಯದಿಂದ ಕೋಟ್ಯಂತರ ಸಾಮ್ರಾಜ್ಯವನ್ನು ತನ್ನ ಸ್ವಂತ ಬಾಹುಬಲದಿಂದ ನಿರ್ಮಿಸುತ್ತಾನೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'Mars-Rahu in the 3rd house creates a self-made pioneer who builds an empire through sheer grit.'",
      remedialTakeawayKn: "ಪ್ರತಿದಿನ ಸಂಕಟಮೋಚನ ಹನುಮಾನಾಷ್ಟಕ ಜಪಿಸುವುದರಿಂದ ಧೈರ್ಯವು ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಸಾಗುತ್ತದೆ.",
      remedialTakeawayEn: "Reciting Sankata Mochana Hanuman Ashtakam channels energy toward noble victories."
    },
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
    karakaPlanetKn: "ಚಂದ್ರ & ಬುಧ (ಮಾತೃ & ವಿದ್ಯಾಕಾರಕ)",
    karakaPlanetEn: "Moon & Mercury (Mother & Education Signifiers)",
    bhavaCategoryKn: "ಕೇಂದ್ರ & ಮೋಕ್ಷ ತ್ರಿಕೋಣ (Moksha Trikona Kendra)",
    bhavaCategoryEn: "Moksha Trikona & Prime Kendra",
    elementKn: "ಜಲ ತತ್ತ್ವ (Water Element - Deep Emotions)",
    elementEn: "Water Element (Deep Emotions & Nourishment)",
    bodyPartsKn: "ಎದೆ, ಹೃದಯ, ಶ್ವಾಸಕೋಶ ಹಾಗೂ ಮನಸ್ಸು",
    bodyPartsEn: "Chest, Heart, Lungs, Breast & Emotional Mind",
    bhavatBhavamHouse: 4,
    bhavatBhavamDescKn: "೪ನೇ ಮನೆಯು ವ್ಯಕ್ತಿಯ ಆಂತರಿಕ ಸುಖ ಮತ್ತು ತಾಯಿಯ ಮಡಿಲು.",
    bhavatBhavamDescEn: "4th house is the foundational nest of emotional peace and real estate.",
    lifeThemesKn: ["ತಾಯಿಯ ಪ್ರೀತಿ", "ಸ್ವಂತ ಮನೆ & ವಾಹನ", "ಮನಶ್ಶಾಂತಿ", "ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ", "ಸ್ಥಿರಾಸ್ತಿ"],
    lifeThemesEn: ["Mother's Love", "Real Estate & Vehicles", "Emotional Contentment", "Foundational Education", "Domestic Peace"],
    simpleIntroKn: "೪ನೇ ಮನೆಯು ನಿಮ್ಮ ತಾಯಿಯ ವಾತ್ಸಲ್ಯ, ಸುಂದರ ಮನೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ನಿಮ್ಮ ಎದೆಯೊಳಗಿನ ಶಾಂತಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 4th House represents maternal warmth, real estate, vehicle joy, and deep domestic tranquility.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೪ನೇ ಮನೆಯು ತಾಯಿಯ ಮಡಿಲು. ತಾಯಿಯ ಸೇವೆ ಮಾಡಿದರೆ ೪ನೇ ಮನೆಯು ಸದಾ ಶಾಂತಿ ಮತ್ತು ವಾಹನ ಸೌಖ್ಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): '4th house is the sanctum of the mother. Serving the mother unlocks perennial domestic bliss and prosperity.'",
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
      debilitationReasonEn: "Fiery Mars feels stifled in the emotional waters of Cancer.",
      moolatrikonaKn: "ಚಂದ್ರ (ಕರ್ಕಾಟಕ ಸ್ವಕ್ಷೇತ್ರ)",
      moolatrikonaEn: "Moon (Own Sign in Cancer)"
    },
    friendshipsKn: {
      friends: ["ರವಿ", "ಚಂದ್ರ", "ಗುರು"],
      enemies: ["ಬುಧ", "ಶುಕ್ರ"],
      neutrals: ["ಶನಿ", "ಮಂಗಳ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Jupiter"],
      enemies: ["Mercury", "Venus"],
      neutrals: ["Saturn", "Mars"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ (Hamsa Yoga in 4th)",
        ruleTitleEn: "Hamsa Mahapurusha Yoga in 4th",
        classicalSource: "B.V. Raman - 300 Important Combinations",
        explanationKn: "ಗುರುವು ಕರ್ಕಾಟಕ ಲಗ್ನಕ್ಕೆ ಅಥವಾ ಕೇಂದ್ರವಾದ ೪ನೇ ಮನೆಯಲ್ಲಿ ಉಚ್ಚನಾಗಿದ್ದರೆ ಹಂಸ ಯೋಗ ಉಂಟಾಗುತ್ತದೆ.",
        explanationEn: "Jupiter exalted in the 4th house forms Hamsa Mahapurusha Yoga, conferring palatial property and pure character.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ಜ್ಞಾನಿ, ದಾನಶೀಲ ಹಾಗೂ ಸದಾ ದೈವ ಚಿಂತನೆಯಲ್ಲಿ ಮುಳುಗಿರುತ್ತಾನೆ.",
        bvRamanInsightEn: "The native is blessed with scholarly wisdom, spiritual reverence, and comfortable vehicles.",
        practicalExampleKn: "೪ನೇ ಮನೆಯಲ್ಲಿ ಗುರುವಿರುವ ವ್ಯಕ್ತಿಗೆ ತಾಯಿಯ ಅಪಾರ ಆಶೀರ್ವಾದ ದೊರೆಯುತ್ತದೆ.",
        practicalExampleEn: "Jupiter in 4th ensures deep maternal harmony and spacious ancestral property."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಶುಕ್ರ (Venus)",
        planetEn: "Venus (Shukra)",
        symbol: "💖",
        aspectsKn: ["೧೦ನೇ ಮನೆ (ವೃತ್ತಿ ಗೌರವ)"],
        aspectsEn: ["10th House (Career Glory)"],
        drishtiQualityKn: "೪ನೇ ಮನೆಯ ಶುಕ್ರನು ೧೦ನೇ ಮನೆಯನ್ನು ನೋಡಿ ಕಲಾತ್ಮಕ ವೃತ್ತಿ ಹಾಗೂ ಐಷಾರಾಮಿ ಕೀರ್ತಿ ನೀಡುತ್ತಾನೆ.",
        drishtiQualityEn: "Venus in 4th aspects 10th house, giving aesthetic reputation and professional goodwill."
      }
    ],
    grahaEffects: createFull9GrahaEffects(4, "ಸುಖ & ಮಾತೃ ಭಾವ", "Sukha Bhava (Mother & Comforts)", {
      Venus: {
        effectTitleKn: "ಭವ್ಯ ಗೃಹ & ವಾಹನ ಯೋಗ (Venus in 4th)",
        effectTitleEn: "Palatial Homes & Luxury Vehicles (Venus in 4th)",
        descriptionKn: "ಸುಂದರ ಅರಮನೆಯಂತಹ ಮನೆ, ಐಷಾರಾಮಿ ಕಾರುಗಳು, ತಾಯಿಯ ಅಪಾರ ಪ್ರೀತಿ ಹಾಗೂ ಸಕಲ ಗೃಹಾಲಂಕಾರ ಭೋಗಗಳು.",
        descriptionEn: "Grants aesthetically designed homes, luxury vehicles, maternal warmth, and domestic harmony.",
        keyGiftsKn: ["ಸುಂದರ ಗೃಹ", "ಉತ್ತಮ ವಾಹನಗಳು", "ಮಾನಸಿಕ ಸುಖ"],
        keyGiftsEn: ["Elegant Home", "Luxury Cars", "Emotional Serenity"],
        watchOutsKn: ["ಅತಿಯಾದ ಭೋಗಾಲಸ್ಯ", "ಗೃಹ ನಿರ್ವಹಣೆ ವೆಚ್ಚ"],
        watchOutsEn: ["Domestic complacency", "Interior decoration costs"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೪ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ ಜಾತಕನು ಸಕಲ ಸುಖ-ಭೋಗಗಳ ಒಡೆಯನಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Venus in 4th house confers fine houses, conveyances, and peaceful domestic life.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೪ನೇ ಮನೆಯಲ್ಲಿ ಹಂಸ ಯೋಗ (ಗುರು ಕೇಂದ್ರದಲ್ಲಿ - ಮಾತೃ ಸುಖ & ವಾಹನ ವೈಭವ)",
      exampleTitleEn: "Real Chart Case: Hamsa Mahapurusha Yoga in 4th House (Jupiter in Kendra)",
      chartContextKn: "ಜಾತಕ: ಧನುಸ್ಸು ಲಗ್ನ. ೪ನೇ ಮನೆಯಾದ ಮೀನದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಗುರುವು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು 'ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ'ವನ್ನು ಸೃಷ್ಟಿಸಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Sagittarius Ascendant. Lagna Lord Jupiter in 4th house in own sign Pisces forming Hamsa Mahapurusha Yoga.",
      lagnaRashi: "Sagittarius (Dhanu)",
      keyPlacements: [
        { planetKn: "ಗುರು (Jupiter)", planetEn: "Jupiter", house: 4, rashiKn: "ಮೀನ (Pisces)", rashiEn: "Pisces", conditionKn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ", conditionEn: "Hamsa Mahapurusha Yoga in 4th", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಗೃಹ & ವಾಹನ ಯೋಗ: ಜಾತಕನಿಗೆ ವಿಶಾಲವಾದ ಆಶ್ರಮದಂತಹ ಮನೆ, ತೋಟ-ತುಡಿಕೆಗಳು ಹಾಗೂ ಐಷಾರಾಮಿ ವಾಹನಗಳು ಪ್ರಾಪ್ತಿಯಾಗುತ್ತವೆ.",
        "೨. ಮಾತೃ ಸುಖ & ದೀರ್ಘಾಯುಷ್ಯ: ತಾಯಿಯು ಧರ್ಮನಿಷ್ಠೆಯುಳ್ಳವಳಾಗಿದ್ದು, ಜಾತಕನಿಗೆ ಸಕಲ ಆಶೀರ್ವಾದ ನೀಡುತ್ತಾಳೆ.",
        "೩. ಮನಃಶಾಂತಿ: ಹದಯ ಸ್ಥಾನದಲ್ಲಿ ದೇವಗುರು ಇರುವುದರಿಂದ ಅಖಂಡ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ಉನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ವಿದ್ಯಾಭ್ಯಾಸ ದೊರೆಯುತ್ತದೆ."
      ],
      synthesisAnalysisEn: [
        "1. Real Estate & Conveyances: Expansive estates, lush gardens, and luxury vehicles.",
        "2. Maternal Grace: Mother is devout, noble, and a lifelong pillar of blessings.",
        "3. Inner Peace: Presence of Jupiter in the heart house bestows serene tranquility and higher education."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೪ನೇ ಮನೆಯಲ್ಲಿ ಗುರುವು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದರೆ ಆ ಮನೆಯು ಸಾಕ್ಷಾತ್ ದೇವಸ್ಥಾನದಂತೆ ಪವಿತ್ರವಾಗಿರುತ್ತದೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'Jupiter in the 4th in own sign turns the home into a sacred spiritual sanctuary.'",
      remedialTakeawayKn: "ಮನೆಯಲ್ಲಿ ಗೋಪೂಜೆ ಹಾಗೂ ತುಳಸಿ ಪೂಜೆ ಮಾಡುವುದರಿಂದ ಸುಖ-ಶಾಂತಿ ಸದಾ ನೆಲೆಸಿರುತ್ತದೆ.",
      remedialTakeawayEn: "Performing Goseva and Tulasi Puja anchors perpetual household harmony."
    },
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
    naturalLordKn: "ರವಿ (Ravi / Sun)",
    naturalLordEn: "Sun (Surya)",
    karakaPlanetKn: "ಗುರು (Guru - ಪುತ್ರ & ಬುದ್ಧಿಕಾರಕ)",
    karakaPlanetEn: "Jupiter (Guru - Progeny & Intellect Signifier)",
    bhavaCategoryKn: "ಪರಮ ತ್ರಿಕೋಣ ಸ್ಥಾನ (Dharma Trikona)",
    bhavaCategoryEn: "Supreme Dharma Trikona",
    elementKn: "ಅಗ್ನಿ ತತ್ತ್ವ (Fire Element - Divine Inspiration)",
    elementEn: "Fire Element (Intellect & Creative Sparks)",
    bodyPartsKn: "ಹೊಟ್ಟೆ, ಜಠರಾಗ್ನಿ, ಮೇದೋಜೀರಕ ಗ್ರಂಥಿ, ಬೆನ್ನು",
    bodyPartsEn: "Upper Abdomen, Stomach Fire, Pancreas & Solar Plexus",
    bhavatBhavamHouse: 9,
    bhavatBhavamDescKn: "೫ನೇ ಮನೆಯು ೯ನೇ ಮನೆಯಿಂದ ೯ನೇ ಮನೆಯಾಗಿದೆ (ಧರ್ಮದ ಧರ್ಮ). ಇದು ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ.",
    bhavatBhavamDescEn: "5th is 9th from the 9th house, representing accumulated merits of past births.",
    lifeThemesKn: ["ಮೇಧಾ ಶಕ್ತಿ & ಪ್ರತಿಭೆ", "ಸಂತಾನ ಭಾಗ್ಯ", "ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ", "ಮಂತ್ರಿ ಪದವಿ & ಸಲಹೆ", "ಮಂತ್ರ ಸಿದ್ಧಿ"],
    lifeThemesEn: ["Intellect & Genius", "Children / Lineage", "Past Life Good Karma", "Ministerial Advisory", "Mantra Mastery"],
    simpleIntroKn: "೫ನೇ ಮನೆಯು ನಿಮ್ಮ ಬುದ್ಧಿವಂತಿಕೆ, ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ, ಮಕ್ಕಳು ಹಾಗೂ ನಿಮ್ಮ ಸೃಜನಶೀಲ ಪ್ರತಿಭೆಯ ಗಣಿಯಾಗಿದೆ!",
    simpleIntroEn: "The 5th House is the seat of intellect, past-life good karma (Purva Punya), children, and creative genius.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೫ನೇ ಮನೆಯು ಪೂರ್ವ ಪುಣ್ಯದ ಭಂಡಾರ. ಇಲ್ಲಿ ಒಳ್ಳೆಯ ಗ್ರಹವಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ಮೇಧಾವಿ ಹಾಗೂ ಮಂತ್ರಸಿದ್ಧನಾಗುತ್ತಾನೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'The 5th house stores the treasury of past life merits, conferring intuitive wisdom and sacred mantra mastery.'",
    dignity: {
      exaltedPlanetKn: "ರವಿ ಸ್ವಕ್ಷೇತ್ರ (ಮೂಲತ್ರಿಕೋಣ)",
      exaltedPlanetEn: "Sun (Own Moolatrikona Sign)",
      exaltedDegree: "0-20° Simha",
      exaltationReasonKn: "ಸಿಂಹ ರಾಶಿಯಲ್ಲಿ ರವಿಯು ತನ್ನ ನೈಸರ್ಗಿಕ ಸಿಂಹಾಸನದ ಮೇಲೆ ಕುಳಿತು ಬುದ್ಧಿಯನ್ನು ಬೆಳಗಿಸುತ್ತಾನೆ.",
      exaltationReasonEn: "In Leo, the Sun sits on his divine throne, illuminating intellect and governance.",
      debilitatedPlanetKn: "ಶನಿ (ಶತ್ರು ಕ್ಷೇತ್ರ)",
      debilitatedPlanetEn: "Saturn (Inimical Sign)",
      debilitatedDegree: "Simha",
      debilitationReasonKn: "ಶನಿಯ ಶೀತಲ ಸ್ವಭಾವಕ್ಕೆ ಸಿಂಹದ ಅಗ್ನಿ ತತ್ತ್ವದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕಷ್ಟ.",
      debilitationReasonEn: "Saturn faces natural friction in the royal solar domain of Leo.",
      moolatrikonaKn: "ರವಿ (0° - 20° ಸಿಂಹದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Sun (0° - 20° in Leo is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ರವಿ", "ಚಂದ್ರ", "ಗುರು", "ಮಂಗಳ"],
      enemies: ["ಶುಕ್ರ", "ಶನಿ", "ರಾಹು"],
      neutrals: ["ಬುಧ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Jupiter", "Mars"],
      enemies: ["Venus", "Saturn", "Rahu"],
      neutrals: ["Mercury"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಬುಧಾದಿತ್ಯ & ಸರಸ್ವತೀ ಯೋಗ (Budhaditya Yoga in 5th)",
        ruleTitleEn: "Budhaditya & Saraswati Yoga in 5th",
        classicalSource: "B.V. Raman - 300 Important Combinations",
        explanationKn: "೫ನೇ ಮನೆಯಲ್ಲಿ ರವಿ ಮತ್ತು ಬುಧ ಒಟ್ಟಿಗಿದ್ದರೆ ಬುಧಾದಿತ್ಯ ಯೋಗ ಉಂಟಾಗಿ ಅಪ್ರತಿಮ ಮೇಧಾವಿಯಾಗುತ್ತಾನೆ.",
        explanationEn: "Conjunction of Sun and Mercury in the 5th house forms Budhaditya Yoga, granting scholarly brilliance.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ಗಣಿತ, ವಿಜ್ಞಾನ ಹಾಗೂ ಸಂಶೋಧನೆಯಲ್ಲಿ ರಾಷ್ಟ್ರೀಯ ಕೀರ್ತಿ ಗಳಿಸುತ್ತಾನೆ.",
        bvRamanInsightEn: "The native excels in analytics, mathematics, literature, and innovative intellect.",
        practicalExampleKn: "೫ನೇ ಮನೆಯಲ್ಲಿ ಬುಧನಿದ್ದರೆ ಉನ್ನತ ಶೈಕ್ಷಣಿಕ ಪದವಿ ಹಾಗೂ ತೀಕ್ಷ್ಣ ನೆನಪಿನ ಶಕ್ತಿ ಲಭಿಸುತ್ತದೆ.",
        practicalExampleEn: "Mercury in 5th bestows high academic honors and razor-sharp recall capacity."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಗುರು (Jupiter)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        aspectsKn: ["೯ನೇ ಮನೆ (ಭಾಗ್ಯ)", "೧೧ನೇ ಮನೆ (ಲಾಭ)", "೧ನೇ ಮನೆ (ಲಗ್ನ)"],
        aspectsEn: ["9th House (Dharma)", "11th House (Gains)", "1st House (Self)"],
        drishtiQualityKn: "೫ನೇ ಮನೆಯ ಗುರುವು ಲಗ್ನವನ್ನು ನೋಡಿ ವ್ಯಕ್ತಿಗೆ ಪರಮ ಪವಿತ್ರ ಕೀರ್ತಿಯನ್ನು ನೀಡುತ್ತಾನೆ.",
        drishtiQualityEn: "Jupiter in 5th aspects 1st and 9th, bestowing spiritual distinction and divine protection."
      }
    ],
    grahaEffects: createFull9GrahaEffects(5, "ಬುದ್ಧಿ & ಪುತ್ರ ಭಾವ", "Putra Bhava (Intellect & Offspring)", {
      Jupiter: {
        effectTitleKn: "ಸರಸ್ವತೀ ಕೃಪೆ & ಸತ್ಪುತ್ರ ಯೋಗ (Jupiter in 5th)",
        effectTitleEn: "Saraswati Grace & Noble Children (Jupiter in 5th)",
        descriptionKn: "ಅತ್ಯದ್ಭುತ ಬುದ್ಧಿಮತ್ತೆ, ಮಂತ್ರ ಸಿದ್ಧಿ, ಉತ್ತಮ ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸಲಹೆಗಾರರಾಗುವ ಯೋಗ.",
        descriptionEn: "Endows brilliant academic memory, spiritual mantra mastery, blessed offspring, and high advisory status.",
        keyGiftsKn: ["ತೀಕ್ಷ್ಣ ನೆನಪಿನ ಶಕ್ತಿ", "ಉತ್ತಮ ಸಂತಾನ", "ಮಂತ್ರ ಸಿದ್ಧಿ"],
        keyGiftsEn: ["Sharp Intellect", "Noble Offspring", "Mantra Siddhi"],
        watchOutsKn: ["ಅತಿಯಾದ ಭವಿಷ್ಯದ ಚಿಂತೆ"],
        watchOutsEn: ["Over-contemplation"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೫ನೇ ಮನೆಯಲ್ಲಿ ಗುರುವಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ವಿದ್ವಾಂಸ ಹಾಗೂ ಮಂತ್ರ ಸಿದ್ಧನಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Jupiter in 5th house confers high intellect, ministerial counsel, and worthy children.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೫ನೇ ಮನೆಯಲ್ಲಿ ಬುಧಾದಿತ್ಯ & ಗುರು ದೃಷ್ಟಿ (ಬುದ್ಧಿಶಾಲಿ & ಪೂರ್ವಪುಣ್ಯ ಯೋಗ)",
      exampleTitleEn: "Real Chart Case: Budhaditya Yoga in 5th House with Jupiter Aspect",
      chartContextKn: "ಜಾತಕ: ಮಕರ ಲಗ್ನ. ೫ನೇ ಮನೆಯಾದ ವೃಷಭದಲ್ಲಿ ೫ನೇ ಅಧಿಪತಿ ಶುಕ್ರ, ರವಿ ಹಾಗೂ ಬುಧ ಯುತಿಯಾಗಿದ್ದು 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ನಿರ್ಮಾಣವಾಗಿದೆ.",
      chartContextEn: "Chart Setup: Capricorn Ascendant. 5th Lord Venus, Sun, and Mercury combine in 5th house Taurus creating Budhaditya Yoga.",
      lagnaRashi: "Capricorn (Makara)",
      keyPlacements: [
        { planetKn: "ಬುಧ (Mercury)", planetEn: "Mercury", house: 5, rashiKn: "ವೃಷಭ (Taurus)", rashiEn: "Taurus", conditionKn: "ಬುಧಾದಿತ್ಯ ಯೋಗ", conditionEn: "Budhaditya Yoga in 5th", isPositive: true },
        { planetKn: "ಶುಕ್ರ (Venus)", planetEn: "Venus", house: 5, rashiKn: "ವೃಷಭ (Taurus)", rashiEn: "Taurus", conditionKn: "೫ನೇ ಅಧಿಪತಿ ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿ", conditionEn: "5th Lord in own 5th house", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಪ್ರಖರ ಬುದ್ಧಿಮತ್ತೆ: ಜಾತಕನು ಗಣಿತ, ಜ್ಯೋತಿಷ್ಯ, ಸಂಶೋಧನೆ ಹಾಗೂ ಷೇರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಅದ್ಭುತ ಊಹಾಶಕ್ತಿಯನ್ನು ಹೊಂದಿರುತ್ತಾನೆ.",
        "೨. ಸತ್ಸಂತಾನ ಯೋಗ: ಮಕ್ಕಳು ಸಂಸ್ಕಾರವಂತರಾಗಿ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಕೀರ್ತಿ ತರುತ್ತಾರೆ.",
        "೩. ಮಂತ್ರ ಸಿದ್ಧಿ: ಯಾವುದೇ ಇಷ್ಟ ದೇವತಾ ಮಂತ್ರವನ್ನು ಜಪಿಸಿದರೆ ಶೀಘ್ರ ಫಲ ಸಿದ್ಧಿಸುತ್ತದೆ."
      ],
      synthesisAnalysisEn: [
        "1. Intellect: Phenomenal genius in analytics, astrology, research, and financial investments.",
        "2. Noble Progeny: Virtuous children who bring immense pride and joy.",
        "3. Mantra Mastery: Swift fruiting of sacred mantras due to rich Purva Punya credits."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೫ನೇ ಮನೆಯು ಪವಿತ್ರವಾಗಿದ್ದರೆ ಜನ್ಮಾಂತರದ ಪುಣ್ಯವು ಈ ಜನ್ಮದಲ್ಲಿ ಕಷ್ಟಕಾಲದಲ್ಲಿ ದೇವರಂತೆ ಕಾಪಾಡುತ್ತದೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'A pure 5th house indicates stored past-life merit that shields the native during crises.'",
      remedialTakeawayKn: "ಶ್ರೀ ಗಾಯತ್ರೀ ಮಂತ್ರ ಅಥವಾ ಸರಸ್ವತೀ ಸ್ತೋತ್ರ ಪಠಿಸುವುದರಿಂದ ಪ್ರತಿಭೆಯು ಜಗದ್ವಿಖ್ಯಾತವಾಗುತ್ತದೆ.",
      remedialTakeawayEn: "Gayatri Mantra and Saraswati Stotra illuminate intellectual mastery."
    },
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
    karakaPlanetKn: "ಮಂಗಳ & ಶನಿ (ಶತ್ರು & ರೋಗಕಾರಕ)",
    karakaPlanetEn: "Mars & Saturn (Rivalry & Chronic Health Signifiers)",
    bhavaCategoryKn: "ದುಸ್ಥಾನ & ಉಪಚಯ (Dusthana & Upachaya)",
    bhavaCategoryEn: "Dusthana & Upachaya Growth House",
    elementKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (Earth Element - Precision & Health)",
    elementEn: "Earth Element (Routine, Precision & Healing)",
    bodyPartsKn: "ಕಿಬ್ಬೊಟ್ಟೆ, ಕರುಳು, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಸೊಂಟ",
    bodyPartsEn: "Lower Abdomen, Intestines, Digestion & Immune Defense",
    bhavatBhavamHouse: 11,
    bhavatBhavamDescKn: "೬ನೇ ಮನೆಯು ರೋಗಗಳನ್ನು ಸೂಚಿಸಿದರೂ, ಉಪಚಯವಾಗಿರುವುದರಿಂದ ಕಾಲಕ್ರಮೇಣ ಶತ್ರು ಜಯವನ್ನು ನೀಡುತ್ತದೆ.",
    bhavatBhavamDescEn: "6th house is an Upachaya; effort and discipline convert obstacles into victories.",
    lifeThemesKn: ["ರೋಗನಿರೋಧಕ ಶಕ್ತಿ", "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಜಯ", "ಋಣ (ಸಾಲ) ಮುಕ್ತಿ", "ದೈನಂದಿನ ಸೇವೆ", "ವ್ಯಾಜ್ಯ ಜಯ"],
    lifeThemesEn: ["Immunity & Health", "Competitive Exam Victory", "Overcoming Debts", "Service & Routine", "Legal Triumphs"],
    simpleIntroKn: "೬ನೇ ಮನೆಯು ರೋಗ, ಸಾಲ ಹಾಗೂ ಶತ್ರುಗಳನ್ನು ಸೂಚಿಸಿದರೂ, ಉಪಚಯ ಮನೆಯಾಗಿರುವುದರಿಂದ ಪರಿಶ್ರಮದಿಂದ ಇವೆಲ್ಲವನ್ನೂ ಗೆಲ್ಲುವ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ!",
    simpleIntroEn: "Though a challenging house of debts and health, as an Upachaya house, it bestows the grit to overcome competition and heal!",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅಥವಾ ಮಂಗಳ ಕುಳಿತರೆ ಶತ್ರುಗಳು ತಾವಾಗಿಯೇ ಮಣಿಯುತ್ತಾರೆ ಮತ್ತು ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಜಯ ಸಿಗುತ್ತದೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'Saturn or Mars in the 6th creates an invincible shield, clearing debts and conquering all adversaries.'",
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
      debilitationReasonEn: "Venus represents unconditional love, which feels restricted by analytical hyper-criticism in Virgo.",
      moolatrikonaKn: "ಬುಧ (15° - 20° ಕನ್ಯಾದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Mercury (15° - 20° in Virgo is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ"],
      enemies: ["ಮಂಗಳ"],
      neutrals: ["ರವಿ", "ಚಂದ್ರ", "ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn"],
      enemies: ["Mars"],
      neutrals: ["Sun", "Moon", "Jupiter"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಹರ್ಷ ವಿಪರೀತ ರಾಜಯೋಗ (Harsha Viparita Raja Yoga)",
        ruleTitleEn: "Harsha Viparita Raja Yoga in 6th",
        classicalSource: "Phaladeepika & B.V. Raman Combinations",
        explanationKn: "೬ನೇ ಮನೆಯ ಅಧಿಪತಿಯು ೬, ೮ ಅಥವಾ ೧೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ 'ಹರ್ಷ ವಿಪರೀತ ರಾಜಯೋಗ' ಉಂಟಾಗುತ್ತದೆ.",
        explanationEn: "When the 6th lord resides in the 6th, 8th, or 12th house, it forms Harsha Viparita Raja Yoga, turning adversity into triumph.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ಎಂತಹ ಕ್ಲಿಷ್ಟ ಸನ್ನಿವೇಶಗಳಿಂದಲೂ ಸುಲಭವಾಗಿ ಪಾರಾಗಿ ಉನ್ನತ ಯಶಸ್ಸು ಗಳಿಸುತ್ತಾನೆ.",
        bvRamanInsightEn: "The native conquers all adversaries, recovers from crises with invincible resilience, and prospers.",
        practicalExampleKn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅಥವಾ ರಾಹು ಇದ್ದರೆ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ ದೊರೆಯುತ್ತದೆ.",
        practicalExampleEn: "Saturn or Rahu in 6th gives exceptional victory in civil service exams and litigation."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಶನಿ (Saturn)",
        planetEn: "Saturn (Shani)",
        symbol: "🪐",
        aspectsKn: ["೮ನೇ ಮನೆ (ಆಯುಷ್ಯ)", "೧೨ನೇ ಮನೆ (ವ್ಯಯ ಮುಕ್ತಿ)", "೩ನೇ ಮನೆ (ಸಾಹಸ)"],
        aspectsEn: ["8th House (Longevity)", "12th House (Foreign/Expenses)", "3rd House (Drive)"],
        drishtiQualityKn: "೬ನೇ ಮನೆಯ ಶನಿಯು ೮ ಮತ್ತು ೧೨ನೇ ಮನೆಗಳನ್ನು ನೋಡಿ ರೋಗ ಹಾಗೂ ಅನಗತ್ಯ ವ್ಯಯಗಳನ್ನು ತಡೆಯುತ್ತಾನೆ.",
        drishtiQualityEn: "Saturn in 6th aspects 8th and 12th, shielding against sudden crises and financial drain."
      }
    ],
    grahaEffects: createFull9GrahaEffects(6, "ಶತ್ರು & ರೋಗ ಭಾವ", "Shatru Bhava (Enemies & Health)", {
      Saturn: {
        effectTitleKn: "ಶತ್ರು ಹಂತಕ ಯೋಗ (Saturn in 6th)",
        effectTitleEn: "Adversary Destroyer & Resilient Health (Saturn in 6th)",
        descriptionKn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅದ್ಭುತ ಫಲ ನೀಡುತ್ತಾನೆ. ಸಕಲ ಶತ್ರುಗಳ ನಾಶ, ಸಾಲ ಮುಕ್ತಿ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ವಿಜಯ ಹಾಗೂ ಕಠಿಣ ಪರಿಶ್ರಮದ ಯಶಸ್ಸು.",
        descriptionEn: "Saturn is exceptionally powerful in the 6th. Destroys all rivals, clears debts, and grants triumph in competitive exams.",
        keyGiftsKn: ["ಶತ್ರು ಜಯ", "ಸಾಲ ಪರಿಹಾರ", "ಕಠಿಣ ಪರಿಶ್ರಮ"],
        keyGiftsEn: ["Victory over Rivals", "Debt Clearance", "Steely Resilience"],
        watchOutsKn: ["ಕೀಲು ನೋವು", "ಅತಿಯಾದ ಕೆಲಸದ ಒತ್ತಡ"],
        watchOutsEn: ["Joint stiffness", "Workaholism"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅಥವಾ ಮಂಗಳನಿದ್ದರೆ ಜಾತಕನನ್ನು ಯಾರೂ ಸೋಲಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Saturn or Mars in 6th makes one formidable, conquering all competition effortlessly.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ & ಕುಜ (ಶತ್ರು ಜಯ & ರೋಗ ಮುಕ್ತಿ ಯೋಗ)",
      exampleTitleEn: "Real Chart Case: Saturn in 6th House (Shatru Samhara & Immune Invincibility)",
      chartContextKn: "ಜಾತಕ: ಮಿಥುನ ಲಗ್ನ. ೬ನೇ ಮನೆಯಾದ ವೃಶ್ಚಿಕದಲ್ಲಿ ಶನಿ ಮಹಾರಾಜನು ಕುಳಿತಿದ್ದಾನೆ. ಉಪಚಯ ಸ್ಥಾನದಲ್ಲಿ ಶನಿಯು ಸರ್ವ ಶತ್ರುಗಳನ್ನು ನಿರ್ನಾಮ ಮಾಡುತ್ತಾನೆ.",
      chartContextEn: "Chart Setup: Gemini Ascendant. Saturn sits in 6th house Scorpio. In 6th Upachaya, Saturn destroys all competitors and illnesses.",
      lagnaRashi: "Gemini (Mithuna)",
      keyPlacements: [
        { planetKn: "ಶನಿ (Saturn)", planetEn: "Saturn", house: 6, rashiKn: "ವೃಶ್ಚಿಕ (Scorpio)", rashiEn: "Scorpio", conditionKn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಶತ್ರುನಾಶಕ ಶನಿ", conditionEn: "Saturn conquering 6th house obstacles", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಶತ್ರು ಜಯ: ಜಾತಕನ ವಿರುದ್ಧ ಹೊಂಚು ಹಾಕುವ ಶತ್ರುಗಳು ತಾವಾಗಿಯೇ ನಾಶವಾಗುತ್ತಾರೆ ಅಥವಾ ಶರಣಾಗುತ್ತಾರೆ.",
        "೨. ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ: ದೀರ್ಘಕಾಲಿಕ ರೋಗಗಳಿಂದ ಮುಕ್ತಿ ದೊರೆತು ದೇಹವು ಉಕ್ಕಿನಂತೆ ಗಟ್ಟಿಯಾಗುತ್ತದೆ.",
        "３. ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು: UPSC, ನ್ಯಾಯಾಂಗ ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ವಿಜಯ ಸಿದ್ಧಿಸುತ್ತದೆ."
      ],
      synthesisAnalysisEn: [
        "1. Enemy Conquest: Foes and adversaries are vanquished naturally.",
        "2. Ironclad Immunity: Resilience against chronic ailments.",
        "3. Competitive Victory: Triumphs in competitive exams, litigation, and elections."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಇರುವ ವ್ಯಕ್ತಿಗೆ ಜಗತ್ತಿನಲ್ಲಿ ಎದುರಾಳಿಗಳೇ ಇರುವುದಿಲ್ಲ; ಬಂದರೂ ನಿಲ್ಲಲಾರರು.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'A native with Saturn in the 6th house has virtually zero rival competition that can endure.'",
      remedialTakeawayKn: "ಶನಿವಾರ ಸಂಜೆ ಅಶ್ವತ್ಥ ವೃಕ್ಷದ ಬಳಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚುವುದರಿಂದ ಸರ್ವ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
      remedialTakeawayEn: "Lighting sesame lamp under Peepal tree on Saturdays dissolves all lingering friction."
    },
    quiz: [
      {
        questionKn: "೬ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ಕನ್ಯಾದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in the natural 6th sign Virgo (Kanya)?",
        optionsKn: ["ಶುಕ್ರ", "ಬುಧ", "ಗುರು", "ರವಿ"],
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
    karakaPlanetKn: "ಶುಕ್ರ (Shukra - ವಿವಾಹಕಾರಕ)",
    karakaPlanetEn: "Venus (Shukra - Marriage Signifier)",
    bhavaCategoryKn: "ಪ್ರಮುಖ ಕೇಂದ್ರ & ಕಾಮ ತ್ರಿಕೋಣ (Kendra & Maraka)",
    bhavaCategoryEn: "Major Kendra & Kama Trikona",
    elementKn: "ವಾಯು ತತ್ತ್ವ (Air Element - Balance & Relationships)",
    elementEn: "Air Element (Harmony & Alliances)",
    bodyPartsKn: "ಸೊಂಟದ ಕೆಳಭಾಗ, ಮೂತ್ರಾಂಗಗಳು, ಗರ್ಭಾಶಯ",
    bodyPartsEn: "Kidneys, Lower Back, Pelvis & Reproductive System",
    bhavatBhavamHouse: 7,
    bhavatBhavamDescKn: "೭ನೇ ಮನೆಯು ಲಗ್ನಕ್ಕೆ ಎದುರಾಗಿರುವ ಸಾರ್ವಜನಿಕ ಕನ್ನಡಿದಂತೆ.",
    bhavatBhavamDescEn: "7th house reflects the mirror of the self in society and partnerships.",
    lifeThemesKn: ["ದಾಂಪತ್ಯ ಸುಖ", "ಜೀವನ ಸಂಗಾತಿ", "ವ್ಯವಹಾರ ಪಾಲುದಾರಿಕೆ", "ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ", "ವಿದೇಶಿ ವ್ಯಾಪಾರ"],
    lifeThemesEn: ["Marital Bliss", "Spouse Nature", "Business Partnerships", "Public Relations", "Foreign Trade"],
    simpleIntroKn: "೭ನೇ ಮನೆಯು ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿ, ವಿವಾಹ ಸುಖ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕರೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 7th House represents your spouse, marital harmony, business partnerships, and diplomacy in society.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೭ನೇ ಮನೆಯು ಸಪ್ತಪದಿಯ ಪಾವಿತ್ರ್ಯ. ಶುಭಗ್ರಹಗಳ ಬಲವಿದ್ದರೆ ದಾಂಪತ್ಯವು ಶಿವ-ಪಾರ್ವತಿಯರ ಸನ್ನಿಧಿಯಂತೆ ಸುಖಮಯವಾಗಿರುತ್ತದೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): '7th house represents sacred marital union. Blessed with benefics, marriage mirrors the divine harmony of Shiva and Parvati.'",
    dignity: {
      exaltedPlanetKn: "ಶನಿ (20° ಯಲ್ಲಿ ತುಲಾದಲ್ಲಿ ಪರಮೋಚ್ಚ)",
      exaltedPlanetEn: "Saturn (Exalted up to 20° in Libra)",
      exaltedDegree: "20° Tula",
      exaltationReasonKn: "ನ್ಯಾಯದ ತಕ್ಕಡಿಯಾದ ತುಲಾದಲ್ಲಿ ನ್ಯಾಯಾಧಿಪತಿ ಶನಿಗೆ ಪರಮೋಚ್ಚ ಬಲ ದೊರೆಯುತ್ತದೆ (ಸಸ ಮಹಾಪುರುಷ ಯೋಗ).",
      exaltationReasonEn: "In the balanced scale of Libra, the cosmic judge Saturn achieves supreme exaltation (Sasa Yoga).",
      debilitatedPlanetKn: "ರವಿ (10° ಯಲ್ಲಿ ತುಲಾದಲ್ಲಿ ಪರಮ ನೀಚ)",
      debilitatedPlanetEn: "Sun (Debilitated at 10° in Libra)",
      debilitatedDegree: "10° Tula",
      debilitationReasonKn: "ರಾಜನಾದ ರವಿಗೆ ಸಮಾನ ಪಾಲುದಾರಿಕೆಯ ೭ನೇ ಮನೆಯಲ್ಲಿ ಅಹಂಕಾರ ಕರಗುವುದರಿಂದ ನೀಚ ಸ್ಥಿತಿ.",
      debilitationReasonEn: "The regal Sun must compromise his solo authority in the cooperative domain of the 7th house.",
      moolatrikonaKn: "ಶುಕ್ರ (0° - 15° ತುಲಾದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Venus (0° - 15° in Libra is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ಶುಕ್ರ", "ಬುಧ", "ಶನಿ"],
      enemies: ["ರವಿ", "ಚಂದ್ರ", "ಮಂಗಳ"],
      neutrals: ["ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Venus", "Mercury", "Saturn"],
      enemies: ["Sun", "Moon", "Mars"],
      neutrals: ["Jupiter"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಮಾಲವ್ಯ & ಸಸ ಮಹಾಪುರುಷ ಯೋಗಗಳು (Mahapurusha Yogas in 7th)",
        ruleTitleEn: "Malavya & Sasa Yogas in 7th",
        classicalSource: "B.V. Raman - 300 Important Combinations",
        explanationKn: "೭ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದರೆ ಮಾಲವ್ಯ ಯೋಗ, ಶನಿ ಉಚ್ಚನಾಗಿದ್ದರೆ ಸಸ ಯೋಗ ಉಂಟಾಗಿ ಅಖಂಡ ವೈಭವ ಲಭಿಸುತ್ತದೆ.",
        explanationEn: "Venus in own sign in 7th forms Malavya Yoga; Saturn exalted in 7th forms Sasa Yoga, conferring renown and grand alliances.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ಸುಸಂಸ್ಕೃತ ಜೀವನ ಸಂಗಾತಿಯನ್ನು ಪಡೆದು ವ್ಯಾಪಾರದಲ್ಲಿ ರಾಷ್ಟ್ರಮಟ್ಟದ ಕೀರ್ತಿ ಗಳಿಸುತ್ತಾನೆ.",
        bvRamanInsightEn: "Blesses the native with an accomplished, devoted spouse and flourishing foreign trade.",
        practicalExampleKn: "೭ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ ದಾಂಪತ್ಯದಲ್ಲಿ ಅಪಾರ ಪ್ರೇಮ ಹಾಗೂ ಐಷಾರಾಮಿ ವಾಹನ ಸುಖ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
        practicalExampleEn: "Venus in 7th house imparts deep romantic devotion and aesthetic luxury."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಶುಕ್ರ (Venus)",
        planetEn: "Venus (Shukra)",
        symbol: "💖",
        aspectsKn: ["೧ನೇ ಮನೆ (ಲಗ್ನ ಸೌಂದರ್ಯ)"],
        aspectsEn: ["1st House (Lagna Charm)"],
        drishtiQualityKn: "೭ನೇ ಮನೆಯ ಶುಕ್ರನು ಲಗ್ನವನ್ನು ನೇರವಾಗಿ ನೋಡುವುದರಿಂದ ವ್ಯಕ್ತಿಯು ಅಪ್ರತಿಮ ಸೌಂದರ್ಯ ಹಾಗೂ ಆಕರ್ಷಣೆ ಪಡೆಯುತ್ತಾನೆ.",
        drishtiQualityEn: "Venus in 7th aspects Lagna directly, imparting captivating physical charisma and radiant complexion."
      }
    ],
    grahaEffects: createFull9GrahaEffects(7, "ಕಳತ್ರ & ವಿವಾಹ ಭಾವ", "Kalatra Bhava (Marriage & Partnerships)", {
      Venus: {
        effectTitleKn: "ಮಾಲವ್ಯ ಯೋಗ & ಸುಂದರ ಸಂಗಾತಿ (Venus in 7th)",
        effectTitleEn: "Malavya Yoga & Loving Spouse (Venus in 7th)",
        descriptionKn: "ಸುಂದರ ಹಾಗೂ ಸುಸಂಸ್ಕೃತ ಜೀವನ ಸಂಗಾತಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಪಾರ ಪ್ರೇಮ, ಐಷಾರಾಮಿ ಜೀವನ ಹಾಗೂ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಲಾಭ.",
        descriptionEn: "Forms Malavya Mahapurusha Yoga in own sign. Blesses with a graceful spouse, romantic bliss, and commercial alliances.",
        keyGiftsKn: ["ಸುಂದರ ಸಂಗಾತಿ", "ದಾಂಪತ್ಯ ಸುಖ", "ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ"],
        keyGiftsEn: ["Charming Spouse", "Marital Joy", "Profitable Partnerships"],
        watchOutsKn: ["ಅತಿಯಾದ ನಿರೀಕ್ಷೆ"],
        watchOutsEn: ["High romantic expectations"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೭ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ ಜಾತಕನು ರಸಿಕ, ಸುಖಿ ಹಾಗೂ ಸುಂದರ ಸಂಗಾತಿಯನ್ನು ಹೊಂದುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Venus in 7th house brings a refined, loving spouse and harmonious partnerships.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೭ನೇ ಮನೆಯಲ್ಲಿ ಮಾಲವ್ಯ ಯೋಗ (ಶುಕ್ರ ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿ - ಸುಂದರ & ಗುಣವಂತೆ ಪತ್ನಿ)",
      exampleTitleEn: "Real Chart Case: Malavya Mahapurusha Yoga in 7th House (Venus in Kendra)",
      chartContextKn: "ಜಾತಕ: ಮೇಷ ಲಗ್ನ. ೭ನೇ ಮನೆಯಾದ ತುಲಾದಲ್ಲಿ ಕಳತ್ರಾಧಿಪತಿ ಶುಕ್ರನು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು 'ಮಾಲವ್ಯ ಯೋಗ' ಉಂಟುಮಾಡಿದ್ದಾನೆ. ಗುರು ದೃಷ್ಟಿಯಿದೆ.",
      chartContextEn: "Chart Setup: Aries Ascendant. 7th Lord Venus sits in own sign Libra forming Malavya Mahapurusha Yoga, aspected by Jupiter.",
      lagnaRashi: "Aries (Mesha)",
      keyPlacements: [
        { planetKn: "ಶುಕ್ರ (Venus)", planetEn: "Venus", house: 7, rashiKn: "ತುಲಾ (Libra)", rashiEn: "Libra", conditionKn: "ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ", conditionEn: "Malavya Mahapurusha Yoga in 7th", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಆದರ್ಶ ದಾಂಪತ್ಯ: ಸಂಗಾತಿಯು ಸೌಂದರ್ಯವತಿಯೂ, ಸುಸಂಸ್ಕೃತಳೂ ಹಾಗೂ ಜಾತಕನ ಜೀವನಕ್ಕೆ ಧನಲಕ್ಷ್ಮಿಯಂತೆ ಆಗಮಿಸುತ್ತಾಳೆ.",
        "೨. ವ್ಯಾಪಾರ & ಪಾಲುದಾರಿಕೆ: ವಿದೇಶಿ ವ್ಯವಹಾರ ಹಾಗೂ ಜಂಟಿ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಅಪಾರ ಲಾಭ.",
        "೩. ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ: ಸಮಾಜದಲ್ಲಿ ಎಲ್ಲರ ಪ್ರೀತಿ-ವಿಶ್ವಾಸಕ್ಕೆ ಪಾತ್ರನಾಗುತ್ತಾನೆ."
      ],
      synthesisAnalysisEn: [
        "1. Blissful Marriage: Spouse is cultured, devoted, and brings enormous luck and elegance.",
        "2. Partnership Fortune: High returns in joint ventures and international trade.",
        "3. Public Charisma: Beloved by the masses and respected widely."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೭ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನ ಮಾಲವ್ಯ ಯೋಗವಿದ್ದರೆ ದಾಂಪತ್ಯ ಜೀವನವು ಸ್ವರ್ಗದಂತೆ ಆನಂದಮಯವಾಗಿರುತ್ತದೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'Malavya Yoga in the 7th transforms married life into a haven of harmonious bliss.'",
      remedialTakeawayKn: "ಶುಕ್ರವಾರ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಹಾಗೂ ದಂಪತಿಗಳಿಗೆ ಗೌರವ ನೀಡುವುದರಿಂದ ಯೋಗವು ಸದಾ ಪ್ರಕಾಶಿಸುತ್ತದೆ.",
      remedialTakeawayEn: "Honoring Goddess Mahalakshmi on Fridays nourishes conjugal grace."
    },
    quiz: [
      {
        questionKn: "೭ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ತುಲಾದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗಿ ಸಸ ಯೋಗ ನೀಡುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in Libra (7th sign), forming Sasa Mahapurusha Yoga?",
        optionsKn: ["ರವಿ", "ಶನಿ (Saturn)", "ಮಂಗಳ", "ಚಂದ್ರ"],
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
    karakaPlanetKn: "ಶನಿ (Shani - ಆಯುಷ್ಯಕಾರಕ)",
    karakaPlanetEn: "Saturn (Shani - Longevity Signifier)",
    bhavaCategoryKn: "ಪ್ರಮುಖ ದುಸ್ಥಾನ & ಮೋಕ್ಷ ತ್ರಿಕೋಣ (Moksha Dusthana)",
    bhavaCategoryEn: "Moksha Dusthana & Deep Mystery House",
    elementKn: "ಜಲ ತತ್ತ್ವ (Water Element - Deep Occult Ocean)",
    elementEn: "Water Element (Occult & Undercurrents)",
    bodyPartsKn: "ಜನನೇಂದ್ರಿಯಗಳು, ಮೂಲಾಧಾರ ಚಕ್ರ, ಗುದದ್ವಾರ",
    bodyPartsEn: "Excretory & Reproductive Organs, Root Chakra",
    bhavatBhavamHouse: 8,
    bhavatBhavamDescKn: "೮ನೇ ಮನೆಯು ಲಗ್ನದ ಆಯಸ್ಸು ಹಾಗೂ ಪರಿವರ್ತನೆಯ ಗೂಢ ಶಕ್ತಿ.",
    bhavatBhavamDescEn: "8th house signifies the deep karmic endurance and spiritual rebirth.",
    lifeThemesKn: ["ದೀರ್ಘಾಯುಷ್ಯ", "ಆಕಸ್ಮಿಕ ಧನಲಾಭ (ವಿಮೆ / ಉಯಿಲು)", "ಗೂಢ ಶಾಸ್ತ್ರ & ಜ್ಯೋತಿಷ್ಯ", "ಆಧ್ಯಾತ್ಮಿಕ ಕುಂಡಲಿನಿ", "ಸಂಕಷ್ಟದಿಂದ ಪುನರುತ್ಥಾನ"],
    lifeThemesEn: ["Longevity", "Sudden Wealth / Inheritance", "Occult & Astrology", "Kundalini Awakening", "Phoenix-like Rebirth"],
    simpleIntroKn: "೮ನೇ ಮನೆಯು ಆಯುಷ್ಯ, ಜ್ಯೋತಿಷ್ಯ-ಮಂತ್ರಗಳಂತಹ ಗೂಢ ಜ್ಞಾನ, ಆಕಸ್ಮಿಕ ಲಾಭಗಳು ಹಾಗೂ ಜೀವನದ ಮಹಾ ಪರಿವರ್ತನೆಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 8th House reveals longevity, occult secrets (Astrology/Tantra), unexpected inheritance, and transformative resilience.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೮ನೇ ಮನೆಯು ಆಯುಷ್ಯದ ರಕ್ಷಾ ಕವಚ. ಶನಿ ಇಲ್ಲಿ ಕುಳಿತರೆ ಆಯುಷ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ ಹಾಗೂ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಗೂಢ ರಹಸ್ಯಗಳು ಕರಗತವಾಗುತ್ತವೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): '8th house is the sanctum of longevity. Saturn here bestows long life and mastery of occult wisdom.'",
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
      debilitationReasonEn: "Sensitive Moon experiences deep emotional turbulence in the intense waters of Scorpio.",
      moolatrikonaKn: "ಮಂಗಳ (ವೃಶ್ಚಿಕ ಸ್ವಕ್ಷೇತ್ರ)",
      moolatrikonaEn: "Mars (Own Sign in Scorpio)"
    },
    friendshipsKn: {
      friends: ["ರವಿ", "ಚಂದ್ರ", "ಗುರು"],
      enemies: ["ಬುಧ"],
      neutrals: ["ಶುಕ್ರ", "ಶನಿ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Jupiter"],
      enemies: ["Mercury"],
      neutrals: ["Venus", "Saturn"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಸರಳ ವಿಪರೀತ ರಾಜಯೋಗ (Sarala Viparita Raja Yoga)",
        ruleTitleEn: "Sarala Viparita Raja Yoga in 8th",
        classicalSource: "Phaladeepika & B.V. Raman Combinations",
        explanationKn: "೮ನೇ ಮನೆಯ ಅಧಿಪತಿಯು ೬, ೮ ಅಥವಾ ೧೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ 'ಸರಳ ವಿಪರೀತ ರಾಜಯೋಗ' ಉಂಟಾಗುತ್ತದೆ.",
        explanationEn: "When the 8th lord is posited in the 6th, 8th, or 12th house, Sarala Viparita Raja Yoga is formed.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ದೀರ್ಘಾಯುಷ್ಯ, ನಿರ್ಭಯ ಮನಸ್ಸು ಹಾಗೂ ಶತ್ರುಗಳ ಮೇಲೆ ಸುಲಭ ಜಯ ಸಾಧಿಸುತ್ತಾನೆ.",
        bvRamanInsightEn: "The native enjoys long life, fearless courage, sudden windfalls, and deep spiritual insights.",
        practicalExampleKn: "೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಕುಳಿತರೆ ಆಯುಷ್ಯಕಾರಕನಾಗಿ ಪರಮ ದೀರ್ಘಾಯುಷ್ಯವನ್ನು ನೀಡುತ್ತಾನೆ.",
        practicalExampleEn: "Saturn in the 8th house acts as the ultimate Ayush Karaka, bestowing long life."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಶನಿ (Saturn)",
        planetEn: "Saturn (Shani)",
        symbol: "🪐",
        aspectsKn: ["೧೦ನೇ ಮನೆ (ಕರ್ಮ)", "೨ನೇ ಮನೆ (ಧನ)", "೫ನೇ ಮನೆ (ಬುದ್ಧಿ)"],
        aspectsEn: ["10th House (Career)", "2nd House (Assets)", "5th House (Intellect)"],
        drishtiQualityKn: "೮ನೇ ಮನೆಯ ಶನಿಯು ೨ನೇ ಮನೆಯನ್ನು ನೋಡಿ ಸಂಪತ್ತನ್ನು ಸಂರಕ್ಷಿಸುತ್ತಾನೆ.",
        drishtiQualityEn: "Saturn in 8th aspects 2nd house, stabilizing long-term assets and family legacy."
      }
    ],
    grahaEffects: createFull9GrahaEffects(8, "ಆಯುರ್ & ರಂಧ್ರ ಭಾವ", "Ayur Bhava (Longevity & Transformation)", {
      Saturn: {
        effectTitleKn: "ದೀರ್ಘಾಯುಷ್ಯ ಕಾರಕ (Saturn in 8th)",
        effectTitleEn: "Supreme Longevity (Saturn in 8th)",
        descriptionKn: "೮ನೇ ಮನೆಯಲ್ಲಿ ಆಯುಷ್ಯಕಾರಕ ಶನಿ ಅದ್ಭುತ. ದೀರ್ಘಾಯುಷ್ಯ, ಆಳವಾದ ಸಂಶೋಧನೆ, ಗೂಢ ಶಾಸ್ತ್ರ ಜ್ಞಾನ ಹಾಗೂ ಗಂಭೀರ ತಾಳ್ಮೆ ನೀಡುತ್ತದೆ.",
        descriptionEn: "Saturn as Ayush Karaka in the 8th house bestows exceptionally long life, deep occult research, and steady patience.",
        keyGiftsKn: ["ದೀರ್ಘಾಯುಷ್ಯ", "ಗೂಢ ಜ್ಞಾನ", "ಸಂಕಷ್ಟ ಜಯ"],
        keyGiftsEn: ["Long Lifespan", "Occult Research", "Crisis Mastery"],
        watchOutsKn: ["ದೀರ್ಘಕಾಲಿಕ ಆರೋಗ್ಯ ಜಾಗ್ರತೆ"],
        watchOutsEn: ["Chronic health vigilance"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿಯು ಆಯುಷ್ಯಕ್ಕೆ ವರದಾನವಾಗಿದ್ದಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Saturn in 8th house promotes exceptional longevity and meditative depth.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೮ನೇ ಮನೆಯಲ್ಲಿ ಸರಳ ಯೋಗ (ವಿಪರೀತ ರಾಜಯೋಗ & ದೀರ್ಘಾಯುಷ್ಯ)",
      exampleTitleEn: "Real Chart Case: Sarala Viparita Raja Yoga in 8th House",
      chartContextKn: "ಜಾತಕ: ಧನುಸ್ಸು ಲಗ್ನ. ೮ನೇ ಅಧಿಪತಿ ಚಂದ್ರನು ೮ನೇ ಮನೆಯಾದ ಕರ್ಕಾಟಕದಲ್ಲೇ ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು, ಆಯುಷ್ಕಾರಕ ಶನಿಯೊಂದಿಗೆ ಶುಭ ದೃಷ್ಟಿ ವಿನಿಮಯದಲ್ಲಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Sagittarius Ascendant. 8th Lord Moon is in 8th house in own sign Cancer, conferring profound longevity and occult wisdom.",
      lagnaRashi: "Sagittarius (Dhanu)",
      keyPlacements: [
        { planetKn: "ಚಂದ್ರ (Moon)", planetEn: "Moon", house: 8, rashiKn: "ಕರ್ಕಾಟಕ (Cancer)", rashiEn: "Cancer", conditionKn: "ಸ್ವಕ್ಷೇತ್ರಸ್ಥ ಸರಳ ಯೋಗ", conditionEn: "Own sign Sarala Yoga in 8th", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ದೀರ್ಘಾಯುಷ್ಯ (ದೀರ್ಘಾಯು): ೮ನೇ ಅಧಿಪತಿ ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿರುವುದರಿಂದ ಅಷ್ಟಮಾಯುಷ್ಯ ಗಟ್ಟಿಯಾಗಿ ೯೦+ ವರ್ಷ ಆಯಸ್ಸು ಲಭಿಸುತ್ತದೆ.",
        "೨. ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ: ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ, ವಿಮೆ ಹಾಗೂ ಹಠಾತ್ ಧನಲಾಭ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
        "೩. ಗೂಢ ಶಾಸ್ತ್ರ ಜ್ಞಾನ: ಜ್ಯೋತಿಷ್ಯ, ವೇದಾಂತ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ರಹಸ್ಯಗಳನ್ನು ಅರಿಯುವ ದಿವ್ಯ ದೃಷ್ಟಿ."
      ],
      synthesisAnalysisEn: [
        "1. Longevity: 8th Lord in own house secures 90+ years of lifespan.",
        "2. Sudden Wealth: Sudden inheritance, legacy assets, and insurance yields.",
        "3. Occult Intuition: Mastery in esoteric sciences, astrology, and deep meditation."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೮ನೇ ಅಧಿಪತಿ ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದರೆ ಮೃತ್ಯುಭಯವೇ ಇರುವುದಿಲ್ಲ; ಸಂಕಷ್ಟಗಳೇ ಜಾತಕನಿಗೆ ಯಶಸ್ಸಿನ ಮೆಟ್ಟಿಲುಗಳಾಗುತ್ತವೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'An intact 8th Lord in 8th eliminates fear of untimely demise and turns crises into breakthroughs.'",
      remedialTakeawayKn: "ಪ್ರತಿದಿನ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪಿಸುವುದರಿಂದ ಸಕಲ ಆಪತ್ತುಗಳು ಕರಗಿಹೋಗುತ್ತವೆ.",
      remedialTakeawayEn: "Maha Mrityunjaya Japa dissolves all latent fears and anchors peace."
    },
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
    karakaPlanetKn: "ಗುರು & ರವಿ (ಗುರು & ಪಿತೃಕಾರಕ)",
    karakaPlanetEn: "Jupiter & Sun (Guru & Father Signifiers)",
    bhavaCategoryKn: "ಪರಮ ತ್ರಿಕೋಣ (Supreme Dharma Trikona)",
    bhavaCategoryEn: "Supreme Dharma Trikona",
    elementKn: "ಅಗ್ನಿ ತತ್ತ್ವ (Fire Element - Spiritual Fire & Truth)",
    elementEn: "Fire Element (Higher Truth & Illumination)",
    bodyPartsKn: "ತೊಡೆಗಳು, ಸೊಂಟದ ಮೂಳೆಗಳು, ರಕ್ತನಾಳಗಳು",
    bodyPartsEn: "Thighs, Hip Joints & Arterial Circulation",
    bhavatBhavamHouse: 5,
    bhavatBhavamDescKn: "೯ನೇ ಮನೆಯು ೫ನೇ ಮನೆಯಿಂದ ೫ನೇ ಮನೆಯಾಗಿದೆ (ಬುದ್ಧಿಯ ಭಾಗ್ಯೋದಯ).",
    bhavatBhavamDescEn: "9th is 5th from the 5th house, indicating fruition of intellectual merits into divine grace.",
    lifeThemesKn: ["ಭಾಗ್ಯೋದಯ (ಅದೃಷ್ಟ)", "ತಂದೆಯ ಆಶೀರ್ವಾದ", "ಗುರುಭಕ್ತಿ", "ತೀರ್ಥಯಾತ್ರೆ & ದೇವಾಲಯ ಸೇವೆ", "ಉನ್ನತ ಶಿಕ್ಷಣ"],
    lifeThemesEn: ["Fortune / Divine Luck", "Father's Blessing", "Guru Devotion", "Pilgrimages & Temple Seva", "Higher Philosophy"],
    simpleIntroKn: "೯ನೇ ಮನೆಯೇ ನಿಮ್ಮ ಜಾತಕದ ಮಹಾ ಭಾಗ್ಯ ಸ್ಥಾನ! ಇದು ತಂದೆಯ ಪ್ರೀತಿ, ಗುರು ಕೃಪೆ, ದೇವತಾ ಅನುಗ್ರಹ ಹಾಗೂ ಉನ್ನತ ಧರ್ಮ ಬುದ್ಧಿಯನ್ನು ನೀಡುತ್ತದೆ.",
    simpleIntroEn: "The 9th House is the seat of divine fortune, fatherly grace, spiritual pilgrimages, and noble dharma.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೯ನೇ ಮನೆಯು ಭಾಗ್ಯದ ಗಂಗೋತ್ರಿ. ಗುರು ಮತ್ತು ತಂದೆಯ ಆಶೀರ್ವಾದ ಪಡೆದರೆ ಜಾತಕನ ಸಕಲ ಕಾರ್ಯಗಳೂ ಸಿದ್ಧಿಯಾಗುತ್ತವೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'The 9th house is the sacred fountain of fortune. Honoring the Guru and father unlocks divine grace across all endeavors.'",
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
      debilitationReasonEn: "Materialistic Rahu is subdued in the righteous temple of Sagittarius.",
      moolatrikonaKn: "ಗುರು (0° - 10° ಧನುಸ್ಸಿನಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Jupiter (0° - 10° in Sagittarius is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ರವಿ", "ಚಂದ್ರ", "ಮಂಗಳ", "ಗುರು"],
      enemies: ["ಬುಧ", "ಶುಕ್ರ"],
      neutrals: ["ಶನಿ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Mars", "Jupiter"],
      enemies: ["Mercury", "Venus"],
      neutrals: ["Saturn"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಧರ್ಮ ಕರ್ಮಾಧಿಪತಿ ಯೋಗ (Dharma Karmadhipati Yoga)",
        ruleTitleEn: "Dharma Karmadhipati Yoga (9th + 10th)",
        classicalSource: "B.V. Raman - 300 Important Combinations",
        explanationKn: "೯ನೇ ಅಧಿಪತಿ (ಧರ್ಮ) ಮತ್ತು ೧೦ನೇ ಅಧಿಪತಿ (ಕರ್ಮ) ಒಟ್ಟಿಗಿದ್ದರೆ ಮಹೋನ್ನತ ರಾಜಯೋಗ ಸೃಷ್ಟಿಯಾಗುತ್ತದೆ.",
        explanationEn: "Conjunction or mutual aspect between 9th lord (Dharma) and 10th lord (Karma) creates the supreme Raja Yoga.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ನಡೆದು ಅಪಾರ ಕೀರ್ತಿ, ಅಧಿಕಾರ ಹಾಗೂ ಭವ್ಯ ಯಶಸ್ಸು ಗಳಿಸುತ್ತಾನೆ.",
        bvRamanInsightEn: "The native attains high social status, leadership in righteous causes, and enduring historic fame.",
        practicalExampleKn: "೯ನೇ ಮನೆಯಲ್ಲಿ ರವಿ ಅಥವಾ ಗುರು ಇದ್ದರೆ ಸದಾ ದೈವಾನುಗ್ರಹ ಜತೆಯಿರುತ್ತದೆ.",
        practicalExampleEn: "Sun or Jupiter in 9th ensures lifelong divine luck and paternal prosperity."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಗುರು (Jupiter)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        aspectsKn: ["೧ನೇ ಮನೆ (ಲಗ್ನ)", "೩ನೇ ಮನೆ (ಸಾಹಸ)", "೫ನೇ ಮನೆ (ಬುದ್ಧಿ)"],
        aspectsEn: ["1st House (Lagna)", "3rd House (Drive)", "5th House (Intellect)"],
        drishtiQualityKn: "೯ನೇ ಮನೆಯಲ್ಲಿರುವ ಗುರು ಲಗ್ನವನ್ನು ನೋಡುವುದರಿಂದ ವ್ಯಕ್ತಿಗೆ ದೇವತಾ ಕೃಪೆ ಲಭಿಸುತ್ತದೆ.",
        drishtiQualityEn: "Jupiter in 9th aspects Lagna, illuminating the soul with divine virtue and long life."
      }
    ],
    grahaEffects: createFull9GrahaEffects(9, "ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ", "Bhagya Bhava (Fortune & Higher Dharma)", {
      Sun: {
        effectTitleKn: "ತಂದೆಯ ಭಾಗ್ಯ & ಧರ್ಮ ಪ್ರಕಾಶ (Sun in 9th)",
        effectTitleEn: "Fatherly Grace & Righteous Radiance (Sun in 9th)",
        descriptionKn: "ಸದಾ ದೈವಾನುಗ್ರಹ, ತಂದೆಯಿಂದ ಅಪಾರ ಕೀರ್ತಿ, ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಗೌರವ ಹಾಗೂ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ ಯೋಗ.",
        descriptionEn: "Blesses with unshakeable integrity, paternal honors, philosophical stature, and sacred pilgrimage journeys.",
        keyGiftsKn: ["ದೈವಾನುಗ್ರಹ", "ತಂದೆಯ ಕೀರ್ತಿ", "ತೀರ್ಥಯಾತ್ರೆ"],
        keyGiftsEn: ["Divine Grace", "Fatherly Legacy", "Sacred Pilgrimages"],
        watchOutsKn: ["ತಂದೆಯೊಂದಿಗೆ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯ"],
        watchOutsEn: ["Ideological friction with elders"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೯ನೇ ಮನೆಯಲ್ಲಿ ರವಿಯಿದ್ದರೆ ಜಾತಕನು ಉನ್ನತ ಧರ್ಮನಿಷ್ಠ ಹಾಗೂ ತಂದೆಯ ಆಶೀರ್ವಾದ ಪಡೆದವನಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Sun in 9th house makes one deeply spiritual, generous, and devoted to righteousness.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೯ನೇ ಮನೆಯಲ್ಲಿ ಧರ್ಮಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ (ಗುರು & ರವಿ ಯುತಿ)",
      exampleTitleEn: "Real Chart Case: Dharma-Karmadhipati Raja Yoga in 9th House",
      chartContextKn: "ಜಾತಕ: ಸಿಂಹ ಲಗ್ನ. ೯ನೇ ಮನೆಯಾದ ಮೇಷದಲ್ಲಿ ಭಾಗ್ಯಾಧಿಪತಿ ಕುಜ ಮತ್ತು ದಶಮಾಧಿಪತಿ ಶುಕ್ರರ ಸಂಯೋಗ, ಜೊತೆಗೆ ಲಗ್ನಾಧಿಪತಿ ರವಿಯ ಉಚ್ಚ ಸ್ಥಿತಿ.",
      chartContextEn: "Chart Setup: Leo Ascendant. 9th Lord Mars and 10th Lord Venus combine with exalted Sun in the 9th house.",
      lagnaRashi: "Leo (Simha)",
      keyPlacements: [
        { planetKn: "ರವಿ (Sun)", planetEn: "Sun", house: 9, rashiKn: "ಮೇಷ (Aries)", rashiEn: "Aries", conditionKn: "೯ನೇ ಮನೆಯಲ್ಲಿ ಪರಮೋಚ್ಚ (Exalted)", conditionEn: "Exalted at 10° Aries in 9th", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಪರಮ ಭಾಗ್ಯೋದಯ: ಜಾತಕನ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯಲ್ಲೂ ದೈವಾನುಗ್ರಹ ಹಾಗೂ ತಂದೆಯ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದವಿರುತ್ತದೆ.",
        "೨. ತೀರ್ಥಯಾತ್ರೆ & ಪುಣ್ಯ ಕ್ಷೇತ್ರ ದರ್ಶನ: ಗೋಕರ್ಣ, ಕಾಶಿ, ಕೇದಾರನಾಥ ಮುಂತಾದ ಪುಣ್ಯ ಕ್ಷೇತ್ರಗಳ ಸೇವೆ.",
        "೩. ಕೀರ್ತಿ & ಧರ್ಮ ಸಾಮ್ರಾಜ್ಯ: ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಸಂಸ್ಥೆಗಳನ್ನು ಕಟ್ಟಿ ಬೆಳೆಸುವ ಯೋಗ."
      ],
      synthesisAnalysisEn: [
        "1. Supreme Fortune: Divine providence and father's blessings protect every endeavor.",
        "2. Sacred Pilgrimages: Visits to holy shrines and spiritual preceptors.",
        "3. Righteous Legacy: Founds noble educational and philanthropic institutions."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೯ನೇ ಮನೆಯು ಬಲಿಷ್ಠವಾಗಿದ್ದರೆ ಆ ವ್ಯಕ್ತಿಗೆ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವಿರುತ್ತದೆ; ಯಾರೂ ಅವನನ್ನು ಸೋಲಿಸಲಾರರು.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'A powerful 9th house acts as an impenetrable divine armor; luck never abandons the native.'",
      remedialTakeawayKn: "ಗುರು ಸೇವೆ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ/ವಟುಗಳಿಗೆ ಅನ್ನದಾನ ಮಾಡುವುದರಿಂದ ಭಾಗ್ಯವು ಸೂರ್ಯನಂತೆ ಹೊಳೆಯುತ್ತದೆ.",
      remedialTakeawayEn: "Guru Seva and Annadaana amplify Fortune exponentially."
    },
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
    karakaPlanetKn: "ರವಿ, ಬುಧ, ಗುರು, ಶನಿ (ಸರ್ವ ಕರ್ಮಕಾರಕರು)",
    karakaPlanetEn: "Sun, Mercury, Jupiter, Saturn (Career Signifiers)",
    bhavaCategoryKn: "ಅತ್ಯುನ್ನತ ಕೇಂದ್ರ & ಅರ್ಥ ತ್ರಿಕೋಣ (Highest Kendra)",
    bhavaCategoryEn: "Apex Kendra & Artha Trikona",
    elementKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (Earth Element - Practical Achievement)",
    elementEn: "Earth Element (Executive Authority & Practical Legacy)",
    bodyPartsKn: "ಮಂಡಿಗಳು, ಕೀಲುಗಳು, ಬೆನ್ನುಮೂಳೆಯ ಕೆಳಭಾಗ",
    bodyPartsEn: "Knees, Joints & Skeletal Backbone",
    bhavatBhavamHouse: 7,
    bhavatBhavamDescKn: "೧೦ನೇ ಮನೆಯು ೪ನೇ ಮನೆಯಿಂದ ೭ನೇ ಮನೆಯಾಗಿದ್ದು, ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.",
    bhavatBhavamDescEn: "10th is 7th from the 4th house, projecting domestic values into public professional stature.",
    lifeThemesKn: ["ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ", "ಸರ್ಕಾರಿ ಗೌರವ & ಅಧಿಕಾರ", "ಕೀರ್ತಿ & ಪ್ರಸಿದ್ಧಿ", "ಸಮಾಜದಲ್ಲಿ ಪ್ರತಿಷ್ಠೆ", "ಧರ್ಮ ಕರ್ಮಗಳು"],
    lifeThemesEn: ["Career / Profession", "Government Honors & Executive Rank", "Public Fame & Legacy", "Social Status", "Right Action"],
    simpleIntroKn: "೧೦ನೇ ಮನೆಯೇ ನಿಮ್ಮ ವೃತ್ತಿ ಜೀವನದ ಸಿಂಹಾಸನ! ಇದು ನೀವು ಮಾಡುವ ಉದ್ಯೋಗ, ಸಮಾಜದಲ್ಲಿ ಗಳಿಸುವ ಕೀರ್ತಿ ಹಾಗೂ ನಿಮ್ಮ ಅಧಿಕಾರವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 10th House is the pinnacle of career, authority, public reputation, and professional destiny.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: 'ಕರ್ಮವೇ ಪೂಜೆ. ೧೦ನೇ ಮನೆಯಲ್ಲಿ ರವಿ ಅಥವಾ ಮಂಗಳನಿದ್ದರೆ ಜಾತಕನು ಸಮಾಜವನ್ನು ಮುನ್ನಡೆಸುವ ಶ್ರೇಷ್ಠ ನಾಯಕನಾಗುತ್ತಾನೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'Action is worship. Strong planets in the 10th house elevate the native to commanding authority and public honor.'",
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
      debilitationReasonEn: "Spiritual Jupiter feels constrained by the pragmatic, cold structures of Capricorn.",
      moolatrikonaKn: "ಶನಿ (ಮಕರ ಸ್ವಕ್ಷೇತ್ರ)",
      moolatrikonaEn: "Saturn (Own Sign in Capricorn)"
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ"],
      enemies: ["ರವಿ", "ಚಂದ್ರ", "ಮಂಗಳ"],
      neutrals: ["ಗುರು"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn"],
      enemies: ["Sun", "Moon", "Mars"],
      neutrals: ["Jupiter"]
    },
    specialRules: [
      {
        ruleTitleKn: "ದಿಗ್ಬಲ ರವಿ & ಮಂಗಳ ನಿಯಮ (Digbala in 10th)",
        ruleTitleEn: "Digbala Sun & Mars in 10th",
        classicalSource: "B.V. Raman - Manual of Hindu Astrology",
        explanationKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ರವಿ ಹಾಗೂ ಮಂಗಳ ಗ್ರಹಗಳಿಗೆ ಗರಿಷ್ಠ ದಿಗ್ಬಲ ದೊರೆಯುತ್ತದೆ. ಇದರಿಂದ ಅಪ್ರತಿಮ ಆಡಳಿತ ಅಧಿಕಾರ ಲಭಿಸುತ್ತದೆ.",
        explanationEn: "Sun and Mars attain peak Directional Strength (Digbala) in the 10th house, conferring supreme executive command.",
        bvRamanInsightKn: "ಈ ಜಾತಕನು ಸಮಾಜವನ್ನು ಮುನ್ನಡೆಸುವ ಮಹಾನ್ ನಾಯಕನಾಗುತ್ತಾನೆ.",
        bvRamanInsightEn: "The native becomes a distinguished administrator, minister, or industrial pioneer.",
        practicalExampleKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ರವಿಯಿದ್ದರೆ IAS, KAS ಅಥವಾ ಉನ್ನತ ಸರ್ಕಾರಿ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
        practicalExampleEn: "Sun in 10th house confers civil service leadership, executive rank, and national awards."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ರವಿ (Sun)",
        planetEn: "Sun (Surya)",
        symbol: "☀️",
        aspectsKn: ["೪ನೇ ಮನೆ (ಗೃಹ ಸುಖ)"],
        aspectsEn: ["4th House (Property & Comfort)"],
        drishtiQualityKn: "೧೦ನೇ ಮನೆಯ ರವಿಯು ೪ನೇ ಮನೆಯನ್ನು ನೋಡಿ ಭವ್ಯ ಗೃಹ ಹಾಗೂ ವಾಹನ ಸೌಭಾಗ್ಯ ನೀಡುತ್ತಾನೆ.",
        drishtiQualityEn: "Sun in 10th aspects 4th house, stabilizing domestic reputation and real estate assets."
      }
    ],
    grahaEffects: createFull9GrahaEffects(10, "ಕರ್ಮ & ರಾಜ್ಯ ಭಾವ", "Karma Bhava (Career & Authority)", {
      Sun: {
        effectTitleKn: "ದಿಗ್ಬಲ ರವಿ & ರಾಜ್ಯಾಧಿಕಾರ (Sun in 10th - Digbala)",
        effectTitleEn: "Digbala Sun: Supreme Executive Power (Sun in 10th)",
        descriptionKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ರವಿಗೆ ಗರಿಷ್ಠ ದಿಗ್ಬಲ ದೊರೆಯುತ್ತದೆ. ಉನ್ನತ ಸರ್ಕಾರಿ ಹುದ್ದೆ (IAS/KAS), ಅಧಿಕಾರ, ಸಮಾಜದಲ್ಲಿ ಅಪ್ರತಿಮ ಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವ.",
        descriptionEn: "Sun attains maximum directional strength (Digbala) in the 10th house, bestowing high government office, public stature, and authority.",
        keyGiftsKn: ["ರಾಜ್ಯಾಧಿಕಾರ", "ದಿಗ್ಬಲ ಕೀರ್ತಿ", "ಸಾರ್ವಜನಿಕ ನಾಯಕತ್ವ"],
        keyGiftsEn: ["Executive Authority", "Supreme Fame", "Civic Leadership"],
        watchOutsKn: ["ಅಧಿಕಾರದ ಅಹಂಕಾರ"],
        watchOutsEn: ["Authoritarian pride"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೧೦ನೇ ಮನೆಯಲ್ಲಿ ರವಿಯಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಸಮಾಜದಲ್ಲಿ ರವಿಯಂತೆ ಪ್ರಜ್ವಲಿಸುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Sun in 10th is a royal combination, bestowing supreme career triumph and public acclaim.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೧೦ನೇ ಮನೆಯಲ್ಲಿ ರುಚಕ & ಶಶ ಮಹಾಪುರುಷ ಯೋಗ (ಕರ್ಮ ಸಾಮ್ರಾಟ)",
      exampleTitleEn: "Real Chart Case: Ruchaka & Shasha Yoga in 10th House (Executive Sovereign)",
      chartContextKn: "ಜಾತಕ: ಮಕರ ಲಗ್ನ. ೧೦ನೇ ಮನೆಯಾದ ತುಲಾದಲ್ಲಿ ಶನಿ ಮಹಾರಾಜನು ಉಚ್ಚನಾಗಿದ್ದು 'ಶಶ ಮಹಾಪುರುಷ ಯೋಗ' ನಿರ್ಮಿಸಿದ್ದಾನೆ. ಜೊತೆಗೆ ಮಂಗಳ ದಿಗ್ಬಲದಲ್ಲಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Capricorn Ascendant. Saturn is exalted in 10th house Libra forming Shasha Mahapurusha Yoga with directional Mars.",
      lagnaRashi: "Capricorn (Makara)",
      keyPlacements: [
        { planetKn: "ಶನಿ (Saturn)", planetEn: "Saturn", house: 10, rashiKn: "ತುಲಾ (Libra)", rashiEn: "Libra", conditionKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಉಚ್ಚ ಶಶ ಯೋಗ", conditionEn: "Exalted Saturn Shasha Yoga in 10th", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ಉನ್ನತ ಆಡಳಿತ ಅಧಿಕಾರ: ಲಕ್ಷಾಂತರ ಜನರನ್ನು ಮುನ್ನಡೆಸುವ ನ್ಯಾಯಾಧೀಶ, ಮಂತ್ರಿ ಅಥವಾ ಕೈಗಾರಿಕೋದ್ಯಮಿ.",
        "೨. ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ವಿಜಯ: ಶೂನ್ಯದಿಂದ ಪ್ರಾರಂಭಿಸಿ ಸಮಾಜದ ಅಗ್ರಸ್ಥಾನಕ್ಕೇರುವ ಅದ್ಭುತ ಕರ್ಮಬಲ.",
        "೩. ಶಾಶ್ವತ ಕೀರ್ತಿ: ಸಮಾಜದಲ್ಲಿ ಸಾರ್ವಕಾಲಿಕ ಹೆಸರು ಹಾಗೂ ಸಂಸ್ಥೆಗಳ ಸ್ಥಾಪನೆ."
      ],
      synthesisAnalysisEn: [
        "1. Sovereign Governance: Chief Justice, Prime Minister, or Industrial Tycoon commanding thousands.",
        "2. Unyielding Grit: Rises from bottom to zenith through indomitable persistence.",
        "3. Timeless Legacy: Establishes enduring institutions."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೧೦ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅಥವಾ ಕುಜ ಉಚ್ಚರಾಗಿದ್ದರೆ ಆ ವ್ಯಕ್ತಿಯ ಹೆಸರು ಇತಿಹಾಸದ ಪುಟಗಳಲ್ಲಿ ಸುವರ್ಣಾಕ್ಷರಗಳಿಂದ ಬರೆಯಲ್ಪಡುತ್ತದೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'An exalted planet in the 10th house etches the native's name into the annals of history.'",
      remedialTakeawayKn: "ದೈನಂದಿನ ಕರ್ಮದಲ್ಲಿ ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಕಾರ್ಮಿಕರಿಗೆ ಸಹಾಯ ಮಾಡುವುದರಿಂದ ಕರ್ಮ ಸ್ಥಾನವು ಪ್ರಕಾಶಿಸುತ್ತದೆ.",
      remedialTakeawayEn: "Fairness to laborers and ethical duty sustain 10th house glory."
    },
    quiz: [
      {
        questionKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಯಾವ ಗ್ರಹಕ್ಕೆ ಗರಿಷ್ಠ 'ದಿಗ್ಬಲ' (Directional Strength) ದೊರೆಯುತ್ತದೆ?",
        questionEn: "Which planet attains peak Directional Strength (Digbala) in the 10th House?",
        optionsKn: ["ರವಿ ಮತ್ತು ಮಂಗಳ", "ಚಂದ್ರ", "ಶುಕ್ರ", "ಕೇತು"],
        optionsEn: ["Sun & Mars", "Moon", "Venus", "Ketu"],
        correctIndex: 0,
        explanationKn: "ಮಧ್ಯಾಹ್ನದ ಆಕಾಶದ ೧೦ನೇ ಮನೆಯಲ್ಲಿ ರವಿ ಮತ್ತು ಮಂಗಳ ಗ್ರಹಗಳಿಗೆ ಪರಮ ದಿಗ್ಬಲ ದೊರೆಯುತ್ತದೆ.",
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
    karakaPlanetKn: "ಗುರು (Guru - ಲಾಭಕಾರಕ)",
    karakaPlanetEn: "Jupiter (Guru - Gains Signifier)",
    bhavaCategoryKn: "ಉಪಚಯ & ಕಾಮ ತ್ರಿಕೋಣ (Prime Upachaya)",
    bhavaCategoryEn: "Prime Upachaya & Kama Trikona",
    elementKn: "ವಾಯು ತತ್ತ್ವ (Air Element - Expansive Network)",
    elementEn: "Air Element (Global Network & Abundance)",
    bodyPartsKn: "ಎಡಗಣ್ಣು, ಎಡಕಿವಿ, ಪಾದದ ಕಣಕಾಲುಗಳು (Ankles), ನರಮಂಡಲ",
    bodyPartsEn: "Left Ear, Left Eye, Ankles, Calves & Circulatory Network",
    bhavatBhavamHouse: 6,
    bhavatBhavamDescKn: "೧೧ನೇ ಮನೆಯು ೬ನೇ ಮನೆಯಿಂದ ೬ನೇ ಮನೆಯಾಗಿದ್ದು, ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಲಾಭ ಗಳಿಸುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    bhavatBhavamDescEn: "11th is 6th from the 6th house, maturing daily service into vast material gains.",
    lifeThemesKn: ["ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ (ಲಾಭ)", "ಹಿರಿಯ ಸಹೋದರರು", "ದೊಡ್ಡ ಮಿತ್ರ ವೃಂದ", "ಹಣಕಾಸು ಹರಿವು", "ಪ್ರಶಸ್ತಿ & ಪುರಸ್ಕಾರ"],
    lifeThemesEn: ["Fulfillment of Desires", "Elder Siblings", "Expansive Social Circle", "Passive Cash Flow", "Awards & Honors"],
    simpleIntroKn: "೧೧ನೇ ಮನೆಯು ನಿಮ್ಮ ಸಕಲ ಆಸೆಗಳನ್ನು ಈಡೇರಿಸುವ ಮಹಾ ಲಾಭ ಸ್ಥಾನ! ಇಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹ ಕುಳಿತರೂ ಶುಭ ಫಲ ಹಾಗೂ ಆದಾಯವನ್ನು ನೀಡುತ್ತದೆ.",
    simpleIntroEn: "The 11th House is the wish-fulfilling house of gains (Sarva Labha). Almost all planets produce positive financial results here.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೧೧ನೇ ಮನೆಯು ಸರ್ವ ಲಾಭದ ಸಾಗರ. ಸತ್ಪಾತ್ರರಿಗೆ ದಾನ ಮಾಡಿದಷ್ಟೂ ಈ ಮನೆಯು ನಿರಂತರ ಐಶ್ವರ್ಯವನ್ನು ತುಂಬುತ್ತದೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'The 11th house is the ocean of fulfilled aspirations. Generosity and ethical wealth multiply gains exponentially.'",
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
      debilitationReasonEn: "Planets rarely suffer complete debilitation in the house of universal gains.",
      moolatrikonaKn: "ಶನಿ (0° - 20° ಕುಂಭದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
      moolatrikonaEn: "Saturn (0° - 20° in Aquarius is Moolatrikona)"
    },
    friendshipsKn: {
      friends: ["ಬುಧ", "ಶುಕ್ರ", "ಶನಿ", "ರಾಹು"],
      enemies: ["ರವಿ", "ಚಂದ್ರ"],
      neutrals: ["ಗುರು", "ಮಂಗಳ"]
    },
    friendshipsEn: {
      friends: ["Mercury", "Venus", "Saturn", "Rahu"],
      enemies: ["Sun", "Moon"],
      neutrals: ["Jupiter", "Mars"]
    },
    specialRules: [
      {
        ruleTitleKn: "ಸರ್ವ ಗ್ರಹ ಲಾಭದಾಯಕ ನಿಯಮ (All Planets in 11th)",
        ruleTitleEn: "Sarva Graha Labha Principle (B.V. Raman)",
        classicalSource: "How to Judge a Horoscope (Vol 2)",
        explanationKn: "೧೧ನೇ ಮನೆಯಲ್ಲಿ ರವಿ, ಕುಜ, ಶನಿ ಅಥವಾ ರಾಹುವಿನಂತಹ ಪಾಪಗ್ರಹಗಳೂ ಕೂಡ ಅಪಾರ ಧನಲಾಭವನ್ನು ಕರುಣಿಸುತ್ತವೆ.",
        explanationEn: "Even natural malefics like Sun, Mars, Saturn, and Rahu yield substantial financial windfalls in the 11th house.",
        bvRamanInsightKn: "೧೧ನೇ ಮನೆಯು ಜಾತಕದ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿಯ ಕೀಲಿಕೈ.",
        bvRamanInsightEn: "The 11th house unlocks the realization of life's highest ambitions and financial liberty.",
        practicalExampleKn: "೧೧ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಅಥವಾ ಶುಕ್ರನಿದ್ದರೆ ನೂರಾರು ಮೂಲಗಳಿಂದ ಆದಾಯ ಹರಿದುಬರುತ್ತದೆ.",
        practicalExampleEn: "Jupiter or Venus in 11th creates multiple thriving income streams and noble friendships."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಗುರು (Jupiter)",
        planetEn: "Jupiter (Guru)",
        symbol: "🌟",
        aspectsKn: ["೩ನೇ ಮನೆ (ಸಾಹಸ)", "೫ನೇ ಮನೆ (ಬುದ್ಧಿ)", "೭ನೇ ಮನೆ (ವಿವಾಹ)"],
        aspectsEn: ["3rd House (Effort)", "5th House (Intellect)", "7th House (Partnership)"],
        drishtiQualityKn: "೧೧ನೇ ಮನೆಯ ಗುರುವು ೫ನೇ ಮನೆಯನ್ನು ನೋಡಿ ಸಂತಾನ ಮತ್ತು ಬುದ್ಧಿಯನ್ನು ಪಾವನಗೊಳಿಸುತ್ತಾನೆ.",
        drishtiQualityEn: "Jupiter in 11th aspects 5th house directly, blessing progeny, investments, and creative wisdom."
      }
    ],
    grahaEffects: createFull9GrahaEffects(11, "ಲಾಭ & ಆಯ ಭಾವ", "Labha Bhava (Gains & Network)", {
      Jupiter: {
        effectTitleKn: "ಸರ್ವ ಸಿದ್ಧಿ & ನಿರಂತರ ಆದಾಯ (Jupiter in 11th)",
        effectTitleEn: "Universal Gains & Noble Wealth (Jupiter in 11th)",
        descriptionKn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ಧರ್ಮ ಮಾರ್ಗದ ಅಪಾರ ಆದಾಯ, ಸತ್ಪುರುಷರ ಸಹವಾಸ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಪ್ರಭಾವ.",
        descriptionEn: "Bestows continuous financial inflows through righteous means, honorable associates, and fulfillment of high aspirations.",
        keyGiftsKn: ["ಅಪಾರ ಆದಾಯ", "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ", "ಸಜ್ಜನರ ಸ್ನೇಹ"],
        keyGiftsEn: ["Vast Wealth", "Fulfillment of Dreams", "Noble Network"],
        watchOutsKn: ["ಅತಿಯಾದ ಔದಾರ್ಯ"],
        watchOutsEn: ["Excessive benevolence"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೧೧ನೇ ಮನೆಯಲ್ಲಿ ಗುರುವಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಸಿಕೊಂಡು ಸುಖಿಯಾಗಿರುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Jupiter in 11th house fulfills all cherished desires and ensures abundant wealth.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಗುರು & ಶುಕ್ರ (ಅಖಂಡ ಧನಲಾಭ & ಸರ್ವೇಷ್ಟ ಸಿದ್ಧಿ)",
      exampleTitleEn: "Real Chart Case: Jupiter & Venus in 11th House (Unstoppable Cashflow & Desires Met)",
      chartContextKn: "ಜಾತಕ: ವೃಷಭ ಲಗ್ನ. ೧೧ನೇ ಮನೆಯಾದ ಮೀನದಲ್ಲಿ ೧೧ನೇ ಅಧಿಪತಿ ಗುರುವು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು, ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನೊಂದಿಗೆ ಯುತಿ ಹೊಂದಿ ಪರಮೋಚ್ಚನಾಗಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Taurus Ascendant. 11th Lord Jupiter in own sign Pisces conjunct exalted Ascendant Lord Venus in 11th house.",
      lagnaRashi: "Taurus (Vrishabha)",
      keyPlacements: [
        { planetKn: "ಶುಕ್ರ (Venus)", planetEn: "Venus", house: 11, rashiKn: "ಮೀನ (Pisces)", rashiEn: "Pisces", conditionKn: "೧೧ನೇ ಮನೆಯಲ್ಲಿ ಪರಮೋಚ್ಚ (Exalted)", conditionEn: "Exalted at 27° Pisces in 11th", isPositive: true },
        { planetKn: "ಗುರು (Jupiter)", planetEn: "Jupiter", house: 11, rashiKn: "ಮೀನ (Pisces)", rashiEn: "Pisces", conditionKn: "ಸ್ವಕ್ಷೇತ್ರಸ್ಥ ಲಾಭಾಧಿಪತಿ", conditionEn: "11th Lord in own house", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ನಿರಂತರ ಧನ ಪ್ರವಾಹ: ಹತ್ತಾರು ಮೂಲಗಳಿಂದ ನಿರಂತರ ಧನಲಾಭ, ದೊಡ್ಡ ನೆಟ್‌ವರ್ಕ್ ಹಾಗೂ ಶ್ರೀಮಂತ ಸ್ನೇಹಿತರ ವಲಯ.",
        "೨. ಸರ್ವೇಷ್ಟ ಸಿದ್ಧಿ: ಮನಸ್ಸಿನಲ್ಲಿ ಅಂದುಕೊಂಡ ಯಾವುದೇ ದೊಡ್ಡ ಯೋಜನೆಗಳು ಸುಲಭವಾಗಿ ಈಡೇರುತ್ತವೆ.",
        "೩. ಹಿರಿಯ ಸಹೋದರರ ಸಂಪೂರ್ಣ ಬೆಂಬಲ: ಕುಟುಂಬದಲ್ಲಿ ಅಣ್ಣ-ಅಕ್ಕಂದಿರಿಂದ ಅಗಾಧ ಪ್ರೀತಿ ಹಾಗೂ ಆಸ್ತಿ ಹಂಚಿಕೆ."
      ],
      synthesisAnalysisEn: [
        "1. Infinite Cash Flow: Multiple revenue streams, global networks, and billionaire friendships.",
        "2. Wish Fulfillment: Every major aspiration materializes smoothly.",
        "3. Elder Sibling Blessings: Deep affection and mutual support from elder siblings."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೧೧ನೇ ಮನೆಯಲ್ಲಿ ಶುಭಗ್ರಹಗಳು ಬಲಿಷ್ಠವಾಗಿದ್ದರೆ ಆ ಜಾತಕನಿಗೆ ಜೀವನದಲ್ಲಿ ಕೊರತೆ ಎಂಬುದೇ ಇರುವುದಿಲ್ಲ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'Fortified benefics in the 11th house banish all scarcity from the native's destiny.'",
      remedialTakeawayKn: "ಧರ್ಮಕಾರ್ಯಗಳಿಗೆ ದಶಮಾಂಶ ದಾನ ನೀಡುವುದರಿಂದ ಲಾಭವು ನೂರು ಪಟ್ಟು ವೃದ್ಧಿಸುತ್ತದೆ.",
      remedialTakeawayEn: "Tithing 10% toward noble causes multiplies 11th house gains manifold."
    },
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
    karakaPlanetKn: "ಶನಿ & ಕೇತು (ವ್ಯಯ & ಮೋಕ್ಷಕಾರಕರು)",
    karakaPlanetEn: "Saturn & Ketu (Expense & Moksha Signifiers)",
    bhavaCategoryKn: "ಮೋಕ್ಷ ತ್ರಿಕೋಣ & ತ್ರಿಕ ಸ್ಥಾನ (Moksha Dusthana)",
    bhavaCategoryEn: "Final Moksha Trikona & Spiritual Sanctuary",
    elementKn: "ಜಲ ತತ್ತ್ವ (Water Element - Infinite Cosmic Ocean)",
    elementEn: "Water Element (Cosmic Dissolution & Transcendence)",
    bodyPartsKn: "ಪಾದಗಳು, ಎಡಗಣ್ಣು, ನಿದ್ರೆ (ಮಿದುಳಿನ ನಿದ್ರಾ ಕೇಂದ್ರ)",
    bodyPartsEn: "Feet, Left Eye, Sleep Chambers & Subconscious",
    bhavatBhavamHouse: 12,
    bhavatBhavamDescKn: "೧೨ನೇ ಮನೆಯು ಜಾತಕದ ಅಂತಿಮ ಮುಕ್ತಿ ಮತ್ತು ಸಂಸಾರ ತ್ಯಾಗ.",
    bhavatBhavamDescEn: "12th house is the ultimate dissolution of karma into cosmic liberation.",
    lifeThemesKn: ["ಮೋಕ್ಷ & ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ", "ವಿದೇಶ ವಾಸ & ಪ್ರಯಾಣ", "ದಾನ & ಧರ್ಮ ವ್ಯಯ", "ಪ್ರಶಾಂತ ನಿದ್ರೆ (ಶಯನ ಸುಖ)", "ಧ್ಯಾನ & ಏಕಾಂತ"],
    lifeThemesEn: ["Moksha / Spiritual Liberation", "Foreign Relocation", "Philanthropic Spending", "Peaceful Sleep & Dreams", "Meditation & Solitude"],
    simpleIntroKn: "೧೨ನೇ ಮನೆಯು ಜಾತಕ ಚಕ್ರದ ಅಂತಿಮ ಮುಕ್ತಿ ಸ್ಥಾನ! ಇದು ವಿದೇಶ ವಾಸ, ದಾನ-ಧರ್ಮ, ಪ್ರಶಾಂತ ನಿದ್ರೆ ಹಾಗೂ ಆತ್ಮದ ಮೋಕ್ಷವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    simpleIntroEn: "The 12th House is the final spiritual sanctuary of the Kundli, governing foreign travel, peaceful sleep, and ultimate Moksha.",
    guruSandeshaKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ: '೧೨ನೇ ಮನೆಯು ಮೋಕ್ಷದ ಹೆಬ್ಬಾಗಿಲು. ಕೇತು ಅಥವಾ ಶುಕ್ರನ ದೈವಿಕ ಸಂಯೋಗವಿದ್ದರೆ ಆತ್ಮವು ಮುಕ್ತಿಯನ್ನು ಹೊಂದಿ ಶಾಶ್ವತ ಶಾಂತಿ ಪಡೆಯುತ್ತದೆ.'",
    guruSandeshaEn: "Shreeram Pandit (Guruji): 'The 12th house is the cosmic portal of Moksha. Spiritual planets here dissolve karmic bondage into eternal peace.'",
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
      debilitationReasonEn: "Logical, analytical Mercury feels overwhelmed in the boundless, poetic waters of Pisces.",
      moolatrikonaKn: "ಗುರು (ಮೀನ ಸ್ವಕ್ಷೇತ್ರ)",
      moolatrikonaEn: "Jupiter (Own Sign in Pisces)"
    },
    friendshipsKn: {
      friends: ["ರವಿ", "ಚಂದ್ರ", "ಮಂಗಳ", "ಗುರು"],
      enemies: ["ಬುಧ", "ಶುಕ್ರ"],
      neutrals: ["ಶನಿ"]
    },
    friendshipsEn: {
      friends: ["Sun", "Moon", "Mars", "Jupiter"],
      enemies: ["Mercury", "Venus"],
      neutrals: ["Saturn"]
    },
    specialRules: [
      {
        ruleTitleKn: "ವಿಮಲ ವಿಪರೀತ ರಾಜಯೋಗ & ಮೋಕ್ಷ ಕೇತು (Vimala Yoga & Ketu)",
        ruleTitleEn: "Vimala Viparita Raja Yoga & Moksha Ketu",
        classicalSource: "B.V. Raman - 300 Important Combinations",
        explanationKn: "೧೨ನೇ ಅಧಿಪತಿಯು ೬, ೮ ಅಥವಾ ೧೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ವಿಮಲ ರಾಜಯೋಗ ಉಂಟಾಗಿ ಸದಾ ಸುಖ ಹಾಗೂ ಧರ್ಮ ಕಾರ್ಯಗಳಲ್ಲಿ ಖರ್ಚು ಮಾಡುವ ಸದ್ಬುದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
        explanationEn: "12th lord in 6th, 8th, or 12th forms Vimala Yoga, conferring independent wealth and noble philanthropic expenditure.",
        bvRamanInsightKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು ಕುಳಿತರೆ ಜಾತಕನಿಗೆ ಇದೇ ಅಂತಿಮ ಜನ್ಮವಾಗಿದ್ದು ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
        bvRamanInsightEn: "Ketu in the 12th house is the classical Vedic signature of ultimate spiritual enlightenment.",
        practicalExampleKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ ವಿದೇಶದಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು ಹಾಗೂ ಐಷಾರಾಮಿ ಶಯನ ಸುಖ ದೊರೆಯುತ್ತದೆ.",
        practicalExampleEn: "Venus in 12th house confers vast foreign wealth, luxurious travel, and peaceful sleep."
      }
    ],
    drishtiRules: [
      {
        planetKn: "ಕೇತು (Ketu)",
        planetEn: "Ketu",
        symbol: "📿",
        aspectsKn: ["೪ನೇ ಮನೆ (ಶಾಂತಿ)", "೬ನೇ ಮನೆ (ರೋಗ ನಾಶ)", "೮ನೇ ಮನೆ (ಮೋಕ್ಷ)"],
        aspectsEn: ["4th House (Peace)", "6th House (Healing)", "8th House (Moksha)"],
        drishtiQualityKn: "೧೨ನೇ ಮನೆಯ ಕೇತುವು ಆತ್ಮಕ್ಕೆ ಶಾಶ್ವತ ಶಾಂತಿಯನ್ನು ಕರುಣಿಸುತ್ತಾನೆ.",
        drishtiQualityEn: "Ketu in 12th radiates spiritual detachment and profound meditative contemplation."
      }
    ],
    grahaEffects: createFull9GrahaEffects(12, "ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ", "Moksha Bhava (Expenses & Foreign Lands)", {
      Venus: {
        effectTitleKn: "ವಿದೇಶ ವೈಭವ & ಶಯನ ಸುಖ (Venus in 12th)",
        effectTitleEn: "Foreign Prosperity & Sublime Comfort (Venus in 12th)",
        descriptionKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರ ಅತ್ಯಂತ ಶುಭ ಫಲ ನೀಡುತ್ತಾನೆ. ವಿದೇಶದಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು, ಐಷಾರಾಮಿ ಶಯನ ಸುಖ ಹಾಗೂ ದಾನ-ಧರ್ಮದಲ್ಲಿ ಆನಂದ.",
        descriptionEn: "Venus flourishes exceptionally in the 12th house, bestowing foreign riches, luxurious sleep, and philanthropic joy.",
        keyGiftsKn: ["ವಿದೇಶ ಯೋಗ", "ಶಯನ ಸುಖ", "ದಾನ ಶೀಲತೆ"],
        keyGiftsEn: ["Foreign Riches", "Peaceful Sleep", "Philanthropy"],
        watchOutsKn: ["ಅತಿಯಾದ ಐಷಾರಾಮಿ ಖರ್ಚು"],
        watchOutsEn: ["Lavish spending"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೧೨ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಸಕಲ ಭೋಗಗಳನ್ನು ಅನುಭವಿಸಿ ವಿದೇಶದಲ್ಲಿ ಖ್ಯಾತಿ ಗಳಿಸುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Venus in 12th house is an auspicious exception, bestowing vast foreign wealth and comforts.'"
      },
      Ketu: {
        effectTitleKn: "ಮೋಕ್ಷ ಕಾರಕ ಕೇತು (Ketu in 12th - Moksha)",
        effectTitleEn: "Supreme Moksha & Spiritual Enlightenment (Ketu in 12th)",
        descriptionKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು ಕುಳಿತರೆ ಇದು ಅಂತಿಮ ಜನ್ಮದ ಸಂಕೇತ. ಆಳವಾದ ಧ್ಯಾನ, ಆತ್ಮ ಸಾಕ್ಷಾತ್ಕಾರ ಹಾಗೂ ಜನನ-ಮರಣ ಚಕ್ರದಿಂದ ಮುಕ್ತಿ.",
        descriptionEn: "Ketu in 12th house is the prime Vedic indicator of spiritual liberation (Moksha), deep contemplation, and self-realization.",
        keyGiftsKn: ["ಆತ್ಮ ಸಾಕ್ಷಾತ್ಕಾರ", "ಮೋಕ್ಷ ಸಿದ್ಧಿ", "ಧ್ಯಾನ ಶಾಂತಿ"],
        keyGiftsEn: ["Self Realization", "Moksha Attainment", "Meditative Peace"],
        watchOutsKn: ["ಸಂಸಾರದಲ್ಲಿ ಅತಿಯಾದ ವಿರಕ್ತಿ"],
        watchOutsEn: ["Extreme ascetic detachment"],
        bvRamanVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: '೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತುವಿದ್ದರೆ ವ್ಯಕ್ತಿಯು ಮುಕ್ತಿ ಮಾರ್ಗದ ಪಥಿಕನಾಗುತ್ತಾನೆ.'",
        bvRamanVerdictEn: "Revered Shreeram Pandit: 'Ketu in 12th house is the classical signature of final spiritual salvation.'"
      }
    }),
        realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು & ಉಚ್ಚ ಶುಕ್ರ (ವಿದೇಶ ಯೋಗ & ಪರಮ ಮೋಕ್ಷ ಸಿದ್ಧಿ)",
      exampleTitleEn: "Real Chart Case: Ketu & Exalted Venus in 12th House (Foreign Riches & Final Moksha)",
      chartContextKn: "ಜಾತಕ: ಮೇಷ ಲಗ್ನ. ೧೨ನೇ ಮನೆಯಾದ ಮೀನದಲ್ಲಿ ಶುಕ್ರನು ಪರಮೋಚ್ಚನಾಗಿದ್ದು (೨೭°), ಮೋಕ್ಷಕಾರಕ ಕೇತುವಿನೊಂದಿಗೆ ಆಧ್ಯಾತ್ಮಿಕವಾಗಿ ನೆಲೆಸಿದ್ದಾನೆ.",
      chartContextEn: "Chart Setup: Aries Ascendant. Exalted Venus (27°) and Moksha Karaka Ketu reside together in 12th house Pisces.",
      lagnaRashi: "Aries (Mesha)",
      keyPlacements: [
        { planetKn: "ಶುಕ್ರ (Venus)", planetEn: "Venus", house: 12, rashiKn: "ಮೀನ (Pisces)", rashiEn: "Pisces", conditionKn: "೧೨ರಲ್ಲಿ ಪರಮೋಚ್ಚ ಶುಕ್ರ", conditionEn: "Exalted Venus in 12th", isPositive: true },
        { planetKn: "ಕೇತು (Ketu)", planetEn: "Ketu", house: 12, rashiKn: "ಮೀನ (Pisces)", rashiEn: "Pisces", conditionKn: "ಮೋಕ್ಷ ಕಾರಕ ಕೇತು", conditionEn: "Ketu in 12th Moksha Sthana", isPositive: true }
      ],
      synthesisAnalysisKn: [
        "೧. ವಿದೇಶ ಯೋಗ & ಕೀರ್ತಿ: ವಿದೇಶದಲ್ಲಿ ನೆಲೆಸಿ ಅಪಾರ ಸಂಪತ್ತು ಹಾಗೂ ಐಷಾರಾಮಿ ಜೀವನ.",
        "೨. ಆಳವಾದ ಧ್ಯಾನ & ಮನಃಶಾಂತಿ: ರಾತ್ರಿ ಸುಖ ನಿದ್ರೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಧ್ಯಾನದಲ್ಲಿ ಅದ್ಭುತ ಸಿದ್ಧಿ.",
        "೩. ಅಂತಿಮ ಮುಕ್ತಿ (ಮೋಕ್ಷ): ಜನನ ಮರಣ ಚಕ್ರದಿಂದ ಬಿಡುಗಡೆ ಹೊಂದಿ ಆತ್ಮ ಪರಮಾತ್ಮನಲ್ಲಿ ಲೀನವಾಗುವ ಲಕ್ಷಣ."
      ],
      synthesisAnalysisEn: [
        "1. Foreign Splendor: Luxurious residence and immense prosperity abroad.",
        "2. Sublime Sleep & Meditation: Peaceful sleep and transcendental inner quietude.",
        "3. Final Liberation: The prime classical signature of cycle-breaking Moksha."
      ],
      bvRamanGoldenVerdictKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: '೧೨ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರ-ಕೇತುಗಳ ಶುಭ ಸ್ಥಿತಿಯು ಇಹಲೋಕದ ಸಕಲ ಭೋಗಗಳನ್ನೂ ನೀಡಿ, ಪರಲೋಕದಲ್ಲಿ ಮೋಕ್ಷವನ್ನೂ ಕರುಣಿಸುತ್ತದೆ.'",
      bvRamanGoldenVerdictEn: "Dr. B.V. Raman: 'Benefic confluence in the 12th grants worldly luxury in life followed by supreme salvation after death.'",
      remedialTakeawayKn: "ಶಿವ ಧ್ಯಾನ ಹಾಗೂ ನಿರ್ಗತಿಕರಿಗೆ ರಹಸ್ಯ ದಾನ ಮಾಡುವುದರಿಂದ ಮೋಕ್ಷ ಮಾರ್ಗ ಸುಗಮವಾಗುತ್ತದೆ.",
      remedialTakeawayEn: "Shiva Dhyana and anonymous charity illuminate the path to liberation."
    },
    quiz: [
      {
        questionKn: "೧೨ನೇ ಮನೆಯ ನೈಸರ್ಗಿಕ ರಾಶಿಯಾದ ಮೀನದಲ್ಲಿ ಯಾವ ಗ್ರಹವು ಪರಮೋಚ್ಚ (Exalted) ಆಗುತ್ತದೆ?",
        questionEn: "Which planet is Exalted in the 12th sign Pisces (Meena)?",
        optionsKn: ["ಶುಕ್ರ (Venus)", "ಬುಧ", "ಶನಿ", "ರವಿ"],
        optionsEn: ["Venus (Shukra)", "Mercury", "Saturn", "Sun"],
        correctIndex: 0,
        explanationKn: "ಶುಕ್ರನು ಮೀನ ರಾಶಿಯ ೨೭ನೇ ಅಂಶದವರೆಗೆ ಪರಮೋಚ್ಚನಾಗಿ ದೈವಿಕ ಪ್ರೇಮ ಮತ್ತು ಸಕಲ ಸುಖವನ್ನು ನೀಡುತ್ತಾನೆ.",
        explanationEn: "Venus is exalted in Pisces up to 27°, bestowing divine love and sublime comfort."
      }
    ]
  }
};


// =========================================================================
// MASTER 12-HOUSE GRAND SYNTHESIS EXAMPLE (ಸಮಗ್ರ ೧೨ ಭಾವ ಮಹಾ ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ)
// =========================================================================
export const MASTER_12_HOUSE_GRAND_EXAMPLE: Master12HouseSynthesisExample = {
  titleKn: "🏆 ಸಮಗ್ರ ೧೨ ಭಾವಗಳ ಮಹಾ ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ (Grand Master Chart Synthesis)",
  titleEn: "🏆 Master 12-House Grand Synthesis Horoscope (Comprehensive Chart Analysis)",
  subtitleKn: "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಹಾಗೂ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲದ ಸಂಯುಕ್ತ ೧೨ ಭಾವಗಳ ಸಮಗ್ರ ಫಲ ಶಾಸ್ತ್ರ",
  subtitleEn: "Authentic Synthesis of All 12 Houses from Dr. B.V. Raman and Revered Shreeram Pandit Gurukula",
  lagna: "Simha (Leo) Ascendant - The Royal Sovereign",
  horoscopeName: "ಮಹಾರಾಜ ಯೋಗ ಜಾತಕ (Imperial Raja Yoga Chart)",
  all12HouseAnalysis: [
    {
      houseNumber: 1,
      houseNameKn: "೧ನೇ ಮನೆ - ತನು ಭಾವ (ಶರೀರ & ವ್ಯಕ್ತಿತ್ವ)",
      houseNameEn: "1st House - Tanu Bhava (Personality & Self)",
      rashiKn: "ಸಿಂಹ (Leo)",
      rashiEn: "Leo",
      planetsPresent: "ರವಿ (Ravi - ಲಗ್ನಾಧಿಪತಿ)",
      bhavaLord: "ರವಿ (Sun)",
      bhavaLordPlacement: "೧ನೇ ಮನೆಯಲ್ಲೇ ಸ್ವಕ್ಷೇತ್ರಸ್ಥ (1st House in Leo)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "ಲಗ್ನಾಧಿಪತಿ ರವಿಯು ಸಿಂಹದಲ್ಲೇ ಸ್ಥಿತನಾಗಿ ದೃಢ ಕಾಯ, ತೇಜಸ್ಸು ಹಾಗೂ ಜನ್ಮಜಾತ ನಾಯಕತ್ವವನ್ನು ಕರುಣಿಸಿದ್ದಾನೆ.",
      interpretationEn: "Ascendant Lord Sun in own sign Leo confers radiant charisma, iron immunity, and natural sovereign leadership."
    },
    {
      houseNumber: 2,
      houseNameKn: "೨ನೇ ಮನೆ - ಧನ & ಕುಟುಂಬ ಭಾವ",
      houseNameEn: "2nd House - Dhana Bhava (Wealth & Speech)",
      rashiKn: "ಕನ್ಯಾ (Virgo)",
      rashiEn: "Virgo",
      planetsPresent: "ಬುಧ (Budha - ಉಚ್ಚ ಸ್ಥಾನ)",
      bhavaLord: "ಬುಧ (Mercury)",
      bhavaLordPlacement: "೨ನೇ ಮನೆಯಲ್ಲೇ ಪರಮೋಚ್ಚ (2nd House in Virgo)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "ಧನಾಧಿಪತಿ ಬುಧನು ೨ನೇ ಮನೆಯಲ್ಲೇ ಉಚ್ಚನಾಗಿದ್ದು ಕೋಟ್ಯಂತರ ಧನ ಸಂಗ್ರಹ, ಚಾಣಾಕ್ಷ ವಾಣಿಜ್ಯ ಬುದ್ಧಿ ಮತ್ತು ವಾಕ್ ಸಿದ್ಧಿ ನೀಡಿದ್ದಾನೆ.",
      interpretationEn: "2nd Lord Mercury exalted in 2nd house creates a permanent treasury of wealth and articulate diplomatic eloquence."
    },
    {
      houseNumber: 3,
      houseNameKn: "೩ನೇ ಮನೆ - ಭ್ರಾತೃ & ಪರಾಕ್ರಮ ಭಾವ",
      houseNameEn: "3rd House - Sahaja Bhava (Courage & Siblings)",
      rashiKn: "ತುಲಾ (Libra)",
      rashiEn: "Libra",
      planetsPresent: "ಶುಕ್ರ (Shukra - ಸ್ವಕ್ಷೇತ್ರ)",
      bhavaLord: "ಶುಕ್ರ (Venus)",
      bhavaLordPlacement: "೩ನೇ ಮನೆಯಲ್ಲಿ ಸ್ವಕ್ಷೇತ್ರಸ್ಥ (3rd House in Libra)",
      conditionQuality: "Benefic / Strong",
      interpretationKn: "ಕಲೆ, ಸಂಗೀತ, ಸಂವಹನ ಹಾಗೂ ಸಾಹಸದಲ್ಲಿ ಅಪ್ರತಿಮ ಕೌಶಲ್ಯ. ಕಿರಿಯ ಸಹೋದರರೊಂದಿಗೆ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ.",
      interpretationEn: "Excellence in arts, diplomacy, high-stakes communication, and harmonious sibling bonds."
    },
    {
      houseNumber: 4,
      houseNameKn: "೪ನೇ ಮನೆ - ಮಾತೃ & ಗೃಹ ಸುಖ ಭಾವ",
      houseNameEn: "4th House - Sukha Bhava (Mother & Real Estate)",
      rashiKn: "ವೃಶ್ಚಿಕ (Scorpio)",
      rashiEn: "Scorpio",
      planetsPresent: "ಗುರು ದೃಷ್ಟಿ (Jupiter 5th aspect)",
      bhavaLord: "ಮಂಗಳ (Mars)",
      bhavaLordPlacement: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ದಿಗ್ಬಲ (10th House Digbala)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "೪ನೇ ಅಧಿಪತಿ ಮಂಗಳನು ೧೦ರಲ್ಲಿ ದಿಗ್ಬಲನಾಗಿದ್ದು, ಗುರುವಿನ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ವಿಶಾಲ ಭವನಗಳು, ಅರಮನೆಯಂತಹ ಮನೆ ಹಾಗೂ ಮಾತೃ ಸುಖ.",
      interpretationEn: "4th Lord Mars directional in 10th with Jupiter's aspect grants palatial estates and lifelong mother blessings."
    },
    {
      houseNumber: 5,
      houseNameKn: "೫ನೇ ಮನೆ - ಪುತ್ರ & ಪೂರ್ವಪುಣ್ಯ ಭಾವ",
      houseNameEn: "5th House - Putra Bhava (Intellect & Past Merit)",
      rashiKn: "ಧನುಸ್ಸು (Sagittarius)",
      rashiEn: "Sagittarius",
      planetsPresent: "ಗುರು (Guru - ಸ್ವಕ್ಷೇತ್ರ)",
      bhavaLord: "ಗುರು (Jupiter)",
      bhavaLordPlacement: "೫ನೇ ಮನೆಯಲ್ಲೇ ಸ್ವಕ್ಷೇತ್ರಸ್ಥ (5th House in Sagittarius)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "ಪೂರ್ವ ಜನ್ಮದ ಮಹಾನ್ ಪುಣ್ಯ ಫಲ. ಮಂತ್ರ ಸಿದ್ಧಿ, ತೇಜಸ್ವಿ ಮಕ್ಕಳು ಹಾಗೂ ತತ್ವಶಾಸ್ತ್ರ ಮತ್ತು ಆಡಳಿತದಲ್ಲಿ ಪ್ರಖರ ಮೇಧಾಶಕ್ತಿ.",
      interpretationEn: "Profound past-life merit. Mantra siddhi, glorious progeny, and transcendent philosophical genius."
    },
    {
      houseNumber: 6,
      houseNameKn: "೬ನೇ ಮನೆ - ಶತ್ರು & ರೋಗ ಶಮನ ಭಾವ",
      houseNameEn: "6th House - Shatru Bhava (Obstacles & Competition)",
      rashiKn: "ಮಕರ (Capricorn)",
      rashiEn: "Capricorn",
      planetsPresent: "ಶನಿ (Shani - ಸ್ವಕ್ಷೇತ್ರ)",
      bhavaLord: "ಶನಿ (Saturn)",
      bhavaLordPlacement: "೬ನೇ ಮನೆಯಲ್ಲೇ ಸ್ವಕ್ಷೇತ್ರಸ್ಥ (6th House in Capricorn)",
      conditionQuality: "Benefic / Strong",
      interpretationKn: "೬ರಲ್ಲಿ ಶನಿ ಇರುವುದರಿಂದ ಸರ್ವ ಶತ್ರುಗಳು ತಾವಾಗಿಯೇ ಶರಣಾಗುತ್ತಾರೆ. ಯಾವುದೇ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ ಅಥವಾ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಅಖಂಡ ವಿಜಯ.",
      interpretationEn: "Saturn in 6th Upachaya annihilates competitors, grants ironclad health, and assures total victory in litigation."
    },
    {
      houseNumber: 7,
      houseNameKn: "೭ನೇ ಮನೆ - ಕಳತ್ರ & ಸಾರ್ವಜನಿಕ ಸಂಬಂಧ",
      houseNameEn: "7th House - Kalatra Bhava (Spouse & Public Relations)",
      rashiKn: "ಕುಂಭ (Aquarius)",
      rashiEn: "Aquarius",
      planetsPresent: "ಗುರು ೩ನೇ ದೃಷ್ಟಿ & ರವಿ ಎದುರು ದೃಷ್ಟಿ",
      bhavaLord: "ಶನಿ (Saturn)",
      bhavaLordPlacement: "೬ನೇ ಮನೆಯಲ್ಲಿ ಬಲಿಷ್ಠ (6th House in Capricorn)",
      conditionQuality: "Benefic / Strong",
      interpretationKn: "ಸಂಗಾತಿಯು ಸುಸಂಸ್ಕೃತಳೂ, ಗಂಭೀರ ಸ್ವಭಾವದವಳೂ ಆಗಿದ್ದು ಜಾತಕನಿಗೆ ರಾಜಕಾರಣ ಹಾಗೂ ವ್ಯವಹಾರದಲ್ಲಿ ದೃಢ ಬೆಂಬಲ ನೀಡುತ್ತಾಳೆ.",
      interpretationEn: "Spouse is dignified, mature, and a formidable partner in public governance and business enterprises."
    },
    {
      houseNumber: 8,
      houseNameKn: "೮ನೇ ಮನೆ - ಆಯುಷ್ಯ & ಗೂಢ ರಹಸ್ಯ ಭಾವ",
      houseNameEn: "8th House - Ayur Bhava (Longevity & Occult)",
      rashiKn: "ಮೀನ (Pisces)",
      rashiEn: "Pisces",
      planetsPresent: "ಶುಕ್ರ (ಉಚ್ಚ) & ಗುರು ದೃಷ್ಟಿ",
      bhavaLord: "ಗುರು (Jupiter)",
      bhavaLordPlacement: "೫ನೇ ಮನೆಯಲ್ಲಿ ಬಲಿಷ್ಠ (5th House)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "೮ನೇ ಅಧಿಪತಿ ಗುರುವು ತ್ರಿಕೋಣದಲ್ಲಿದ್ದು ೮ನೇ ಮನೆಯನ್ನು ನೋಡುವುದರಿಂದ ಅಪಮೃತ್ಯು ಭಯವಿಲ್ಲದೆ ೯೫+ ವರ್ಷಗಳ ಶತಾಯುಷ್ಯ.",
      interpretationEn: "8th house blessed by its lord Jupiter and exalted Venus assures pristine longevity (95+ years) and legacy wealth."
    },
    {
      houseNumber: 9,
      houseNameKn: "೯ನೇ ಮನೆ - ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ",
      houseNameEn: "9th House - Bhagya Bhava (Fortune & Preceptors)",
      rashiKn: "ಮೇಷ (Aries)",
      rashiEn: "Aries",
      planetsPresent: "ಚಂದ್ರ (ಗುರು-ಚಂದ್ರ ಗಜಕೇಸರಿ ಯೋಗ)",
      bhavaLord: "ಮಂಗಳ (Mars)",
      bhavaLordPlacement: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ದಿಗ್ಬಲಸ್ಥ (10th House)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "೯ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರನಿದ್ದು ೫ನೇ ಗುರುವಿನಿಂದ ಗಜಕೇಸರಿ ಯೋಗ ಉಂಟಾಗಿದೆ. ಸದಾ ದೈವಾನುಗ್ರಹ, ಗುರು ಕೃಪೆ ಹಾಗೂ ಪರಮ ಭಾಗ್ಯೋದಯ.",
      interpretationEn: "Gaja Kesari Yoga in 9th house brings constant divine grace, preceptor blessings, and worldwide spiritual renown."
    },
    {
      houseNumber: 10,
      houseNameKn: "೧೦ನೇ ಮನೆ - ಕರ್ಮ & ಸಿಂಹಾಸನ ಭಾವ",
      houseNameEn: "10th House - Karma Bhava (Career & Authority)",
      rashiKn: "ವೃಷಭ (Taurus)",
      rashiEn: "Taurus",
      planetsPresent: "ಮಂಗಳ (ಕುಜ - ರುಚಕ ಪ್ರಭಾವ)",
      bhavaLord: "ಶುಕ್ರ (Venus)",
      bhavaLordPlacement: "೩ನೇ ಮನೆಯಲ್ಲಿ ಸ್ವಕ್ಷೇತ್ರಸ್ಥ (3rd House)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ದಿಗ್ಬಲಿ ಮಂಗಳನು ರಾಷ್ಟ್ರಮಟ್ಟದ ಆಡಳಿತ, ಸೇನಾಧಿಪತ್ಯ ಅಥವಾ ಮುಖ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ ಅಧಿಕಾರವನ್ನು ಕರುಣಿಸಿದ್ದಾನೆ.",
      interpretationEn: "Directional Mars in 10th commands executive state power, national infrastructure, and unstoppable momentum."
    },
    {
      houseNumber: 11,
      houseNameKn: "೧೧ನೇ ಮನೆ - ಲಾಭ & ಸಕಲ ಇಷ್ಟಾರ್ಥ ಭಾವ",
      houseNameEn: "11th House - Labha Bhava (Gains & Fulfillment)",
      rashiKn: "ಮಿಥುನ (Gemini)",
      rashiEn: "Gemini",
      planetsPresent: "ರಾಹು (ಉಪಚಯ ಲಾಭ)",
      bhavaLord: "ಬುಧ (Mercury)",
      bhavaLordPlacement: "೨ನೇ ಮನೆಯಲ್ಲಿ ಉಚ್ಚಸ್ಥ (2nd House in Virgo)",
      conditionQuality: "Exalted / Raja Yoga",
      interpretationKn: "೧೧ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಮತ್ತು ಲಾಭಾಧಿಪತಿ ಬುಧ ೨ರಲ್ಲಿ ಉಚ್ಚನಾಗಿರುವುದರಿಂದ ಅಂತಾರಾಷ್ಟ್ರೀಯ ವಾಣಿಜ್ಯದಿಂದ ಅಪಾರ ಧನಲಾಭ.",
      interpretationEn: "Rahu in 11th with 11th Lord exalted in 2nd unleashes massive international revenue and all-desire fulfillment."
    },
    {
      houseNumber: 12,
      houseNameKn: "೧೨ನೇ ಮನೆ - ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ",
      houseNameEn: "12th House - Moksha Bhava (Expenses & Liberation)",
      rashiKn: "ಕರ್ಕಾಟಕ (Cancer)",
      rashiEn: "Cancer",
      planetsPresent: "ಕೇತು (ಮೋಕ್ಷ ಸ್ಥಿತಿ)",
      bhavaLord: "ಚಂದ್ರ (Moon)",
      bhavaLordPlacement: "೯ನೇ ಮನೆಯಲ್ಲಿ ಗಜಕೇಸರಿ (9th House)",
      conditionQuality: "Benefic / Strong",
      interpretationKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತುವಿದ್ದು ವ್ಯಯಾಧಿಪತಿ ಚಂದ್ರ ೯ರಲ್ಲಿರುವುದರಿಂದ ದಾನ-ಧರ್ಮ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಅಂತಿಮ ಮೋಕ್ಷ ಸಿದ್ಧಿ.",
      interpretationEn: "Ketu in 12th with 12th Lord in 9th sanctifies expenditures toward philanthropy and guarantees ultimate spiritual liberation."
    }
  ],
  overallGrandVerdictKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ & ಡಾ. ಬಿ.ವಿ. ರಾಮನ್: 'ಈ ಜಾತಕವು ೧೨ ಮನೆಗಳೂ ಪರಸ್ಪರ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಸಂಬಂಧದಿಂದ ಬೆಸೆದುಕೊಂಡಿರುವ ಅಪರೂಪದ ಮಹಾರಾಜ ಯೋಗ ಜಾತಕ. ಲಗ್ನ, ೪, ೫, ೯, ೧೦ ಹಾಗೂ ೧೧ನೇ ಮನೆಗಳ ಅದ್ಭುತ ಸಮನ್ವಯದಿಂದ ಈ ವ್ಯಕ್ತಿಯು ಕಲಿಯುಗದ ಆದರ್ಶ ಧರ್ಮಪ್ರಭುವಾಗುತ್ತಾನೆ.'",
  overallGrandVerdictEn: "Revered Shreeram Pandit & Dr. B.V. Raman: 'This horoscope demonstrates an extraordinary holistic alignment where all 12 houses reinforce each other through Kendra-Trikona synergy. It represents the pinnacle of Vedic Jyotisha balance, prosperity, and spiritual liberation.'",
  masterLifeLessonKn: "ಜ್ಯೋತಿಷ್ಯ ಕಲಿಕೆಯ ಸಾರ: 'ಯಾವುದೇ ಒಂದು ಮನೆಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ನೋಡದೆ, ಲಗ್ನದಿಂದ ಪ್ರಾರಂಭಿಸಿ ೧೨ ಮನೆಗಳು ಒಂದಕ್ಕೊಂದು ಹೇಗೆ ನಂಟು ಹೊಂದಿವೆ ಎಂದು ನೋಡುವುದೇ ನಿಜವಾದ ಜ್ಯೋತಿಷ್ಯ ಜ್ಞಾನ!'",
  masterLifeLessonEn: "Golden Astrological Axiom: 'Never judge a house in isolation. True Vedic mastery lies in understanding how all 12 houses interconnect and flow into one unified life destiny!'"
};
