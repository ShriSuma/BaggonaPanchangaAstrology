import re

with open("src/features/kundlilearning/kundliAcademyKnowledge.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add types
type_def = """export type HouseRealWorldExample = {
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
"""

content = content.replace("export type HouseLearningModule = {", type_def + "\nexport type HouseLearningModule = {\n  realWorldExample: HouseRealWorldExample;")

# Define real-world examples for each of the 12 houses
house_examples = {
    1: """    realWorldExample: {
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
    },""",
    2: """    realWorldExample: {
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
    },""",
    3: """    realWorldExample: {
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
    },""",
    4: """    realWorldExample: {
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
    },""",
    5: """    realWorldExample: {
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
    },""",
    6: """    realWorldExample: {
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
    },""",
    7: """    realWorldExample: {
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
    },""",
    8: """    realWorldExample: {
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
    },""",
    9: """    realWorldExample: {
      exampleTitleKn: "ನೈಜ ಕುಂಡಲಿ ಉದಾಹರಣೆ: ೯ನೇ ಮನೆಯಲ್ಲಿ ಧರ್ಮಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ (ಗುರು & ಸೂರ್ಯ ಯುತಿ)",
      exampleTitleEn: "Real Chart Case: Dharma-Karmadhipati Raja Yoga in 9th House",
      chartContextKn: "ಜಾತಕ: ಸಿಂಹ ಲಗ್ನ. ೯ನೇ ಮನೆಯಾದ ಮೇಷದಲ್ಲಿ ಭಾಗ್ಯಾಧಿಪತಿ ಕುಜ ಮತ್ತು ದಶಮಾಧಿಪತಿ ಶುಕ್ರರ ಸಂಯೋಗ, ಜೊತೆಗೆ ಲಗ್ನಾಧಿಪತಿ ರವಿಯ ಉಚ್ಚ ಸ್ಥಿತಿ.",
      chartContextEn: "Chart Setup: Leo Ascendant. 9th Lord Mars and 10th Lord Venus combine with exalted Sun in the 9th house.",
      lagnaRashi: "Leo (Simha)",
      keyPlacements: [
        { planetKn: "ಸೂರ್ಯ (Sun)", planetEn: "Sun", house: 9, rashiKn: "ಮೇಷ (Aries)", rashiEn: "Aries", conditionKn: "೯ನೇ ಮನೆಯಲ್ಲಿ ಪರಮೋಚ್ಚ (Exalted)", conditionEn: "Exalted at 10° Aries in 9th", isPositive: true }
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
    },""",
    10: """    realWorldExample: {
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
    },""",
    11: """    realWorldExample: {
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
    },""",
    12: """    realWorldExample: {
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
    },"""
}

# Insert each example right before quiz in each house module
for h_num in range(1, 13):
    pat = rf"({h_num}:\s*\{{[^}}]*?quiz:\s*\[)"
    # We match the house start to quiz
    # Let's do a reliable replacement
    target = f"quiz:"
    # We replace within each module

# Let's do a regex substitution for each house
for h_num, ex_code in house_examples.items():
    # Find the block for house h_num
    # Pattern: houseNumber: h_num, ... quiz: [
    pattern = rf"(houseNumber:\s*{h_num},[\s\S]*?)(quiz:\s*\[)"
    replacement = rf"\1{ex_code}\n    \2"
    content = re.sub(pattern, replacement, content, count=1)

# Add MASTER_12_HOUSE_GRAND_EXAMPLE at the end
master_example_code = """
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
      planetsPresent: "ಸೂರ್ಯ (Surya - ಲಗ್ನಾಧಿಪತಿ)",
      bhavaLord: "ಸೂರ್ಯ (Sun)",
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
      planetsPresent: "ಗುರು ೩ನೇ ದೃಷ್ಟಿ & ಸೂರ್ಯ ಎದುರು ದೃಷ್ಟಿ",
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
"""

content += "\n" + master_example_code

with open("src/features/kundlilearning/kundliAcademyKnowledge.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Enrichment completed successfully!")
