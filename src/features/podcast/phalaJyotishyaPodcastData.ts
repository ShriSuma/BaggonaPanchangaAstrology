/**
 * Phala Jyotishya 12-House Audio Podcast Master Knowledge & Dialogue Dataset
 * (೧೨ ಮನೆಗಳ ಫಲಜ್ಯೋತಿಷ್ಯ ಧ್ವನಿ ಸಂವಾದ ಪೋಡ್‌ಕ್ಯಾಸ್ಟ್ ಮಾಸ್ಟರ್ ಡಾಟಾಬೇಸ್)
 * 
 * Features:
 * - 12 comprehensive episodes covering House 1 to House 12 (ಭಾವ ೧ ರಿಂದ ಭಾವ ೧೨ ರವರೆಗೆ)
 * - Two-person natural dialogue between:
 *   - Host (Female): ವಿದುಷಿ ಶ್ರುತಿ (Inquisitive scholar, poses core doubts & practical scenarios)
 *   - Astrologer (Male): ಜ್ಯೋತಿಷಿ ವಿದ್ವಾನ್ ಕೌಶಿಕ್ (Master practitioner, explains Dr. B.V. Raman & Parashara rules)
 * - Detailed Karakatwas, Captain vs Slave status, Exaltation, Debilitation, Aspects, and Remedies
 */

export type PodcastSpeaker = "host_female" | "scholar_male";

export interface PodcastDialogueTurn {
  id: number;
  speaker: PodcastSpeaker;
  speakerNameKn: string;
  speakerNameEn: string;
  avatar: string;
  textKn: string;
  textEn: string;
  emphasisTopic?: string;
}

export interface PhalaJyotishyaEpisode {
  houseNumber: number;
  houseNameKn: string;
  houseNameEn: string;
  sanskritName: string;
  icon: string;
  taglineKn: string;
  taglineEn: string;
  primaryKarakatwasKn: string[];
  primaryKarakatwasEn: string[];
  karakaPlanetKn: string;
  naturalZodiacSignKn: string;
  naturalLordKn: string;
  captainStatusKn: string;
  slaveStatusKn: string;
  exaltedPlanetKn: string;
  debilitatedPlanetKn: string;
  ramanGoldenRulesKn: string[];
  keyDilemmasAnsweredKn: string[];
  dialogue: PodcastDialogueTurn[];
}

export const PHALA_JYOTISHYA_EPISODES: PhalaJyotishyaEpisode[] = [
  // ------------------------------------------------------------------------------------------------
  // EPISODE 1: 1st House - Tanu Bhava (ತನು ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 1,
    houseNameKn: "೧ನೇ ಮನೆ - ತನು ಭಾವ (Lagna)",
    houseNameEn: "House 1: Tanu Bhava (Ascendant & Soul Dignity)",
    sanskritName: "ತನು ಭಾವ (Tanu Bhava)",
    icon: "👑",
    taglineKn: "ಜಾತಕದ ಅಡಿಪಾಯ, ಶರೀರ, ಆರೋಗ್ಯ, ತೇಜಸ್ಸು ಹಾಗೂ ಜನ್ಮ ಲಗ್ನದ ಅಧಿಪತಿಯ ಮಹತ್ವ",
    taglineEn: "The Foundation of Horoscope, Physical Body, Vitality, and Ascendant Lord's Raja Yoga",
    primaryKarakatwasKn: [
      "ಶರೀರ ತತ್ವ & ಮುಖವರ್ಚಸ್ಸು",
      "ಆರೋಗ್ಯ & ರೋಗನಿರೋಧಕ ಶಕ್ತಿ",
      "ಆತ್ಮವಿಶ್ವಾಸ & ವ್ಯಕ್ತಿತ್ವ",
      "ದೀರ್ಘಾಯುಷ್ಯ & ಮಾನಸಿಕ ದೃಢತೆ"
    ],
    primaryKarakatwasEn: [
      "Physical Appearance & Vitality",
      "Health & Immunity",
      "Self-Confidence & Character",
      "Longevity & Mental Strength"
    ],
    karakaPlanetKn: "ಸೂರ್ಯ (ಆತ್ಮಕಾರಕ) & ಕುಜ (ದೇಹಬಲ)",
    naturalZodiacSignKn: "ಮೇಷ (Aries)",
    naturalLordKn: "ಕುಜ (Mars)",
    captainStatusKn: "ಲಗ್ನಾಧಿಪತಿಯು ಕೇಂದ್ರ (೧, ೪, ೭, ೧೦) ಅಥವಾ ತ್ರಿಕೋಣ (೫, ೯) ದಲ್ಲಿದ್ದು ಉಚ್ಚ/ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದರೆ ಜಾತಕನೇ ಈ ಮನೆಯ 'ರಾಜ/ಕ್ಯಾಪ್ಟನ್'. ಇಡೀ ಕುಂಡಲಿಗೆ ರಕ್ಷಣೆ ಸಿಗುತ್ತದೆ.",
    slaveStatusKn: "ಲಗ್ನಾಧಿಪತಿಯು ೬, ೮, ೧೨ ನೇ ದುಸ್ಥಾನಗಳಲ್ಲಿ ನೀಚನಾಗಿದ್ದರೆ ಅಥವಾ ರಾಹು-ಕೇತು-ಶನಿ ಗ್ರಸ್ತನಾಗಿದ್ದರೆ ಶರೀರ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವ ಬಲಹೀನವಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಸೂರ್ಯ (ಮೇಷದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ಶನಿ (ಮೇಷದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಸೂತ್ರ: ಲಗ್ನ ಬಲವಾಗಿದ್ದರೆ ಉಳಿದ ೧೧ ಮನೆಗಳ ಅಶುಭ ಫಲಗಳನ್ನು ತಡೆದುಕೊಳ್ಳುವ ಶಕ್ತಿ ಜಾತಕನಿಗೆ ಸಿಗುತ್ತದೆ.",
      "ಶುಭಗ್ರಹಗಳಾದ ಗುರು ಅಥವಾ ಶುಕ್ರ ಲಗ್ನವನ್ನು ನೋಡಿದರೆ ಮುಖದಲ್ಲಿ ವಿಶೇಷ ತೇಜಸ್ಸು ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
      "ಲಗ್ನದಲ್ಲಿ ಪಾಪಗ್ರಹವಿದ್ದರೂ ಲಗ್ನಾಧಿಪತಿ ಬಲವಾಗಿದ್ದರೆ ಸಂಕಷ್ಟಗಳು ಬಂದು ಪರಿಹಾರವಾಗುತ್ತವೆ."
    ],
    keyDilemmasAnsweredKn: [
      "ಲಗ್ನದಲ್ಲಿ ಶನಿ ಅಥವಾ ರಾಹು ಇದ್ದರೆ ಸದಾ ಕಷ್ಟವೇ?",
      "ಲಗ್ನಾಧಿಪತಿ ೮ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ಆಯುಷ್ಯ ಕಡಿಮೆಯೇ?",
      "ಲಗ್ನ ನಕ್ಷತ್ರದ ಅಧಿಪತಿಯ ಪಾತ್ರವೇನು?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ನಮಸ್ಕಾರ ಆಚಾರ್ಯರೇ! ನಮ್ಮ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೋಡ್‌ಕ್ಯಾಸ್ಟ್‌ಗೆ ಸ್ವಾಗತ. ಇಂದು ನಾವು ಫಲಜ್ಯೋತಿಷ್ಯದ ಅತಿ ಮುಖ್ಯವಾದ ಮೊದಲನೇ ಮನೆ - ಅಂದರೆ 'ಲಗ್ನ' ಅಥವಾ 'ತನು ಭಾವ'ದ ಬಗ್ಗೆ ತಿಳಿಯೋಣ. ಒಬ್ಬ ವ್ಯಕ್ತಿಯ ಜಾತಕ ನೋಡುವಾಗ ಲಗ್ನವನ್ನು ಏಕೆ ರಾಜ ಅಥವಾ ಇಡೀ ಕುಂಡಲಿಯ ಜೀವ ಎಂದು ಕರೆಯುತ್ತಾರೆ?",
        textEn: "Namaskara Acharyare! Welcome to Baggona Astrology Podcast. Today let us explore the most vital 1st House - the Lagna or Tanu Bhava. Why is Lagna called the King or soul of the horoscope?",
        emphasisTopic: "ಲಗ್ನದ ಪ್ರಾಮುಖ್ಯತೆ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಶುಭೋದಯ ಶ್ರುತಿಯವರೇ. ಶಾಸ್ತ್ರದಲ್ಲಿ 'ಲಗ್ನಂ ಪ್ರಧಾನಂ ತನುಭಾವ ಸಂಸ್ಥಂ' ಎಂದು ಹೇಳಲಾಗಿದೆ. ಲಗ್ನವೆಂದರೆ ಜನ್ಮ ಸಮಯದಲ್ಲಿ ಪೂರ್ವ ದಿಗಂತದಲ್ಲಿ ಉದಯಿಸುವ ರಾಶಿ. ಇದು ಜಾತಕನ ಶರೀರ, ತಲೆ, ಆಯಸ್ಸು, ಮತ್ತು ವ್ಯಕ್ತಿತ್ವದ ಕನ್ನಡಿ. ಕುಂಡಲಿಯ ಉಳಿದ ಹನ್ನೊಂದು ಮನೆಗಳು ಏನೇ ಫಲ ಕೊಟ್ಟರೂ, ಅದನ್ನು ಅನುಭವಿಸಲು ಜಾತಕನಿಗೆ ಶರೀರ ಮತ್ತು ಆರೋಗ್ಯ ಬೇಕಲ್ಲವೇ? ಹಾಗಾಗಿ ಲಗ್ನವು ಇಡೀ ಕುಂಡಲಿಯ ಕ್ಯಾಪ್ಟನ್!",
        textEn: "Shubhodaya Shruti. Shastras declare Lagna as the foundation. It represents physical body, head, vitality and character. Even if other houses offer wealth, the individual needs body and soul strength to experience it.",
        emphasisTopic: "ಕ್ಯಾಪ್ಟನ್ ಪರಿಕಲ್ಪನೆ"
      },
      {
        id: 3,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಅತ್ಯದ್ಭುತ! ಆದರೆ ಜನರಿಗೆ ಒಂದು ದೊಡ್ಡ ಗೊಂದಲವಿದೆ: ಲಗ್ನಾಧಿಪತಿ ಉಚ್ಚವಾಗಿದ್ದರೆ ಏನು ಫಲ? ಅದೇ ಲಗ್ನಾಧಿಪತಿ ೬, ೮ ಅಥವಾ ೧೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ಜಾತಕನು ಗುಲಾಮನಂತೆ ಬದುಕಬೇಕಾಗುತ್ತದೆಯೇ?",
        textEn: "Wonderful! People often wonder: what if the Ascendant Lord is exalted vs placed in 6th, 8th or 12th dusthanas? Does that weaken the person?",
        emphasisTopic: "ಉಚ್ಚ vs ನೀಚ ಬಲ"
      },
      {
        id: 4,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಬಹಳ ಸೂಕ್ಷ್ಮವಾದ ಪ್ರಶ್ನೆ. ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ನಿಯಮದಂತೆ, ಲಗ್ನಾಧಿಪತಿ ಕೇಂದ್ರ (೧, ೪, ೭, ೧೦) ಅಥವಾ ತ್ರಿಕೋಣ (೫, ೯) ದಲ್ಲಿದ್ದರೆ ಅವನು ಸ್ವತಂತ್ರ ರಾಜನಂತೆ ಬದುಕುತ್ತಾನೆ. ಸಮಾಜದಲ್ಲಿ ಗೌರವ, ಶ್ರೇಷ್ಠ ನಾಯಕತ್ವ ಸಿಗುತ್ತದೆ. ಆದರೆ ಲಗ್ನಾಧಿಪತಿ ೬ನೇ ಮನೆಗೆ ಹೋದರೆ ಶತ್ರು ಮತ್ತು ರೋಗಗಳ ವಿರುದ್ಧ ಸತತ ಹೋರಾಟ, ೮ನೇ ಮನೆಗೆ ಹೋದರೆ ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆಗಳು, ೧೨ನೇ ಮನೆಗೆ ಹೋದರೆ ಅತಿಯಾದ ತ್ಯಾಗ ಅಥವಾ ವಿದೇಶ ವಾಸ ಉಂಟಾಗುತ್ತದೆ. ಆದರೆ ನೆನಪಿಡಿ, ೮ನೇ ಮನೆಯಲ್ಲಿದ್ದರೂ ಆ ಮನೆಯ ಮೇಲೆ ಗುರುವಿನ ದೃಷ್ಟಿ ಇದ್ದರೆ ಅದೇ ಆಯುಷ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ!",
        textEn: "Dr. B.V. Raman highlights that if the Lagna Lord is in Kendra or Trikona, the native lives with royal dignity. If in 6th/8th/12th, they face uphill battles or foreign relocation, but Jupiter's aspect cures the affliction.",
        emphasisTopic: "ರಾಮನ್ ಸೂತ್ರಗಳು"
      },
      {
        id: 5,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಹಾಗಾದರೆ ಮೊದಲನೇ ಮನೆಯ ಅಂತಿಮ ಫಲ ನಿರ್ಣಯಕ್ಕೆ ಜ್ಯೋತಿಷ್ಯ ಆಸಕ್ತರು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಬೇಕಾದ ಸುವರ್ಣ ಸೂತ್ರ ಯಾವುದು?",
        textEn: "What is the ultimate golden takeaway rule for the 1st House that astrology students should remember?",
        emphasisTopic: "ಸುವರ್ಣ ಸೂತ್ರ"
      },
      {
        id: 6,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಮೂರು ಅಂಶಗಳನ್ನು ಗಮನಿಸಿ: ೧. ಲಗ್ನದಲ್ಲಿರುವ ಗ್ರಹ, ೨. ಲಗ್ನಾಧಿಪತಿ ಕುಳಿತಿರುವ ಮನೆ ಮತ್ತು ಅವನ ಮಿತ್ರತ್ವ, ೩. ಲಗ್ನದ ಮೇಲಿರುವ ದೃಷ್ಟಿ. ಲಗ್ನ ಶುದ್ಧವಾಗಿದ್ದರೆ ಯಾವುದೇ ದೋಷವಿದ್ದರೂ ಜಾತಕನು ಜಯಶಾಲಿಯಾಗುತ್ತಾನೆ!",
        textEn: "Check 3 pillars: 1. Planet in Lagna, 2. Dignity and house of Lagna Lord, 3. Benefic aspects. A strong Lagna conquers all doshas!",
        emphasisTopic: "ಫಲ ನಿರ್ಣಯ ಸೂತ್ರ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 2: 2nd House - Dhana & Kutumba Bhava (ಧನ & ಕುಟುಂಬ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 2,
    houseNameKn: "೨ನೇ ಮನೆ - ಧನ & ಕುಟುಂಬ ಭಾವ",
    houseNameEn: "House 2: Dhana Bhava (Wealth, Speech & Family)",
    sanskritName: "ಧನ & ಕುಟುಂಬ ಭಾವ (Dhana Bhava)",
    icon: "💰",
    taglineKn: "ಸಂಗ್ರಹಿತ ಸಂಪತ್ತು, ವಾಕ್ ಶುದ್ಧಿ, ಕುಟುಂಬ ನೆಮ್ಮದಿ, ಮುಖದ ಕಳೆ ಹಾಗೂ ಮಾರಕ ತತ್ವದ ರಹಸ್ಯ",
    taglineEn: "Accumulated Wealth, Power of Speech, Family Lineage, and Maraka Dynamics",
    primaryKarakatwasKn: [
      "ಕೂಡಿಟ್ಟ ಧನ & ಬ್ಯಾಂಕ್ ಬ್ಯಾಲೆನ್ಸ್",
      "ವಾಕ್ ಶಕ್ತಿ & ಮಾತಿನ ಪ್ರಭಾವ",
      "ಕುಟುಂಬ ಸುಖ & ಪರಂಪರೆ",
      "ಆಹಾರ ಪದ್ಧತಿ & ಬಲಗಣ್ಣು"
    ],
    primaryKarakatwasEn: [
      "Liquid Savings & Family Assets",
      "Eloquence & Speech Power",
      "Family Lineage & Harmony",
      "Food Habits & Right Eye"
    ],
    karakaPlanetKn: "ಗುರು (ಧನಕಾರಕ) & ಬುಧ (ವಾಕ್ ಕಾರಕ)",
    naturalZodiacSignKn: "ವೃಷಭ (Taurus)",
    naturalLordKn: "ಶುಕ್ರ (Venus)",
    captainStatusKn: "೨ನೇ ಮನೆಯಧಿಪತಿ ಲಾಭ (೧೧) ಅಥವಾ ಭಾಗ್ಯ (೯) ದಲ್ಲಿದ್ದು ಗುರು ದೃಷ್ಟಿ ಪಡೆದರೆ ನಿರಂತರ ಧನ ಸಂಚಯ ಮತ್ತು ಗೌರವಾನ್ವಿತ ವಾಗ್ಮಿತ್ವ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
    slaveStatusKn: "೨ನೇ ಮನೆಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಿದ್ದು (ರಾಹು/ಕುಜ/ಶನಿ) ಧನಾಧಿಪತಿ ೧೨ರಲ್ಲಿ ವ್ಯಯವಾದರೆ ಸಂಪತ್ತು ಸೋರಿಹೋಗುತ್ತದೆ ಮತ್ತು ಕುಟುಂಬದಲ್ಲಿ ಕಟು ಮಾತುಗಳಿಂದ ವಿರಸ ಉಂಟಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಚಂದ್ರ (ವೃಷಭದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ರಾಹು / ಕೇತು (ವೃಷಭದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೨ನೇ ಮನೆ ಮತ್ತು ೧೧ನೇ ಮನೆಯ ನಡುವೆ ಪರಿವರ್ತನೆ ಇದ್ದರೆ ಅದು 'ಮಹಾ ಧನ ಯೋಗ'.",
      "೨ನೇ ಮನೆ ಮಾರಕ ಸ್ಥಾನವೂ ಹೌದು. ದಶಾಕಾಲದಲ್ಲಿ ಆರೋಗ್ಯದ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.",
      "ಗುರು ೨ನೇ ಮನೆಯಲ್ಲಿದ್ದರೆ ಸುಳ್ಳು ಹೇಳದ ಸತ್ಯವಂತ ಮತ್ತು ಧರ್ಮನಿಷ್ಠ ಧನವಂತನಾಗುತ್ತಾನೆ."
    ],
    keyDilemmasAnsweredKn: [
      "೨ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಇದ್ದರೆ ಧನ ನಷ್ಟ ಖಚಿತವೇ?",
      "ಮಾರಕ ಸ್ಥಾನ ಎಂದರೇನು? ಭಯಪಡಬೇಕೇ?",
      "ಮಾತಿನಲ್ಲಿ ಆಕರ್ಷಣೆ ಮತ್ತು ಅಧಿಕಾರ ಬರಲು ೨ನೇ ಮನೆ ಹೇಗೆ ಕಾರಣ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ೨ನೇ ಮನೆಯನ್ನು 'ಧನ ಸ್ಥಾನ' ಮತ್ತು 'ಕುಟುಂಬ ಸ್ಥಾನ' ಎನ್ನುತ್ತೇವೆ. ಆದರೆ ಕೆಲವರ ಜಾತಕದಲ್ಲಿ ಹಣ ಚೆನ್ನಾಗಿ ಬರುತ್ತದೆ, ಆದರೆ ಕೈಯಲ್ಲಿ ನಿಲ್ಲುವುದಿಲ್ಲ. ಇದಕ್ಕೆ ೨ನೇ ಮನೆಯ ಪಾತ್ರವೇನು?",
        textEn: "Acharyare, the 2nd house is Dhana & Kutumba Sthana. Many earn well but cannot retain savings. How does the 2nd house govern accumulated wealth?",
        emphasisTopic: "ಸಂಗ್ರಹಿತ ಧನ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಶ್ರುತಿಯವರೇ, ೧೧ನೇ ಮನೆ ಬರುವ ಆದಾಯವಾದರೆ, ೨ನೇ ಮನೆ ಉಳಿಯುವ ಠೇವಣಿ! ೨ನೇ ಮನೆಗೆ ಗುರು ಕಾರಕ. ೨ನೇ ಮನೆಯಧಿಪತಿ ಬಲವಾಗಿದ್ದರೆ ಮಾತ್ರ ಜಾತಕನಿಗೆ ಉಳಿತಾಯ, ಸ್ಥಿರಾಸ್ತಿ, ಆಭರಣಗಳು ಮತ್ತು ಕುಟುಂಬದ ಬೆಂಬಲ ದೊರೆಯುತ್ತದೆ. ಒಂದು ವೇಳೆ ೨ನೇ ಮನೆಗೆ ವ್ಯಯಾಧಿಪತಿ (೧೨ನೇ ಒಡೆಯ) ಸಂಬಂಧ ಬಂದರೆ ಬಂದ ಹಣವೆಲ್ಲ ಸೋರಿಹೋಗುತ್ತದೆ.",
        textEn: "11th is income, but 2nd is accumulated bank balance. Jupiter is the Karaka. If the 2nd lord is strong, savings grow. If linked to 12th lord, money drains away.",
        emphasisTopic: "೧೧ನೇ vs ೨ನೇ ಮನೆ"
      },
      {
        id: 3,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಹಾಗಾದರೆ ೨ನೇ ಮನೆಯನ್ನು 'ಮಾರಕ ಸ್ಥಾನ' ಎಂದೂ ಕರೆಯುತ್ತಾರಲ್ಲವೇ? ಹಾಗೆಂದರೇನು?",
        textEn: "Why is the 2nd house also called a Maraka (death-inflicting) house? Should people fear it?",
        emphasisTopic: "ಮಾರಕ ತತ್ವ"
      },
      {
        id: 4,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಮಾರಕವೆಂದರೆ ಕೇವಲ ಮರಣವಲ್ಲ! ೮ನೇ ಮನೆ ಆಯುಷ್ಯವಾದರೆ, ೮ ರಿಂದ ೮ನೇ ಮನೆಯಾದ ೩ನೇ ಮನೆ ದ್ವಿತೀಯಾಯುಷ್ಯ. ೩ನೇ ಮನೆಗೆ ೧೨ನೇ ವ್ಯಯ ಸ್ಥಾನವೇ ೨ನೇ ಮನೆ! ಆದ್ದರಿಂದ ಆಯುಷ್ಯದ ಶಕ್ತಿ ಕ್ಷೀಣಿಸುವ ಕಾಲದಲ್ಲಿ ೨ನೇ ಮನೆಯ ದಶೆ ಬಂದರೆ ಆರೋಗ್ಯದ ಏರುಪೇರಾಗುತ್ತದೆ. ಆದರೆ ಯುವಕಾಲದಲ್ಲಿ ಇದು ಕೇವಲ ಧನ ಮತ್ತು ಪ್ರತಿಷ್ಠೆಯನ್ನು ನೀಡುತ್ತದೆ!",
        textEn: "Maraka means transition of energy. 8th from 8th is 3rd, and 12th from 3rd is 2nd. In old age it tests health, but in active age it provides wealth and speech prominence.",
        emphasisTopic: "ಮಾರಕ ರಹಸ್ಯ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 3: 3rd House - Sahodara & Parakrama Bhava (ಸಹೋದರ & ಪರಾಕ್ರಮ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 3,
    houseNameKn: "೩ನೇ ಮನೆ - ಸಹೋದರ & ಪರಾಕ್ರಮ ಭಾವ",
    houseNameEn: "House 3: Bhratri & Parakrama (Courage & Siblings)",
    sanskritName: "ಭ್ರಾತೃ & ಪರಾಕ್ರಮ ಭಾವ (Bhratri Bhava)",
    icon: "⚔️",
    taglineKn: "ಧೈರ್ಯ, ಸಾಹಸ, ಕಿರಿಯ ಸಹೋದರರು, ಸಂವಹನ ಕಲೆ, ಬರವಣಿಗೆ ಹಾಗೂ ಉಪಚಯ ಸ್ಥಾನದ ಶಕ್ತಿ",
    taglineEn: "Bravery, Initiative, Younger Siblings, Communication, and Upachaya Growth",
    primaryKarakatwasKn: [
      "ಧೈರ್ಯ & ಸಾಹಸ ಪ್ರವೃತ್ತಿ",
      "ಕಿರಿಯ ಸಹೋದರ-ಸಹೋದರಿಯರು",
      "ಸಂವಹನ, ಬರವಣಿಗೆ & ಮಾಧ್ಯಮ",
      "ಸಣ್ಣ ಪ್ರಯಾಣಗಳು & ತೋಳುಬಲ"
    ],
    primaryKarakatwasEn: [
      "Courage & Enterprise",
      "Younger Siblings",
      "Media, Writing & Communication",
      "Short Journeys & Shoulders/Arms"
    ],
    karakaPlanetKn: "ಕುಜ (ಪರಾಕ್ರಮ & ಸಹೋದರ ಕಾರಕ)",
    naturalZodiacSignKn: "ಮಿಥುನ (Gemini)",
    naturalLordKn: "ಬುಧ (Mercury)",
    captainStatusKn: "೩ನೇ ಮನೆಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಾದ ಕುಜ, ರಾಹು ಅಥವಾ ಸೂರ್ಯನಿದ್ದರೆ ಜಾತಕನು ಅಪ್ರತಿಮ ಸಾಹಸಿ, ಉದ್ಯಮಿ ಮತ್ತು ಕಷ್ಟಗಳನ್ನು ಮೆಟ್ಟಿನಿಂತು ಗೆಲ್ಲುವ ಪರಾಕ್ರಮಿ.",
    slaveStatusKn: "೩ನೇ ಮನೆಯಲ್ಲಿ ನೀಚಗ್ರಹಗಳಿದ್ದು ಕುಜನು ೬/೮ ರಲ್ಲಿದ್ದರೆ ಸಹೋದರರೊಂದಿಗೆ ದ್ವೇಷ, ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ ಮತ್ತು ಕೈಕಾಲುಗಳ ನರದೋಷ ಉಂಟಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ರಾಹು (ಮಿಥುನದಲ್ಲಿ ಉಚ್ಚ/ಬಲಿಷ್ಠ)",
    debilitatedPlanetKn: "ಕೇತು (ಮಿಥುನದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೩ನೇ ಮನೆ 'ಉಪಚಯ ಸ್ಥಾನ' (Upachaya). ವಯಸ್ಸಾದಂತೆ ಈ ಮನೆಯು ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸನ್ನು ಕೊಡುತ್ತದೆ.",
      "ಶುಭಗ್ರಹಗಳಿಗಿಂತ ಕ್ರೂರಗ್ರಹಗಳು ೩ನೇ ಮನೆಯಲ್ಲಿ ಅದ್ಭುತ ಧೈರ್ಯ ಮತ್ತು ಸ್ವಂತ ಪರಿಶ್ರಮದ ಉನ್ನತಿಯನ್ನು ನೀಡುತ್ತವೆ.",
      "ಬುಧ ಮತ್ತು ಕುಜರ ಶುಭಯೋಗವಿದ್ದರೆ ಶ್ರೇಷ್ಠ ಪತ್ರಕರ್ತ, ಲೇಖಕ, ಐಟಿ ಇಂಜಿನಿಯರ್ ಅಥವಾ ಕ್ರೀಡಾಪಟು ಆಗುತ್ತಾರೆ."
    ],
    keyDilemmasAnsweredKn: [
      "೩ನೇ ಮನೆಯಲ್ಲಿ ಕ್ರೂರಗ್ರಹಗಳು ಇರುವುದು ಒಳ್ಳೆಯದೇ?",
      "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದಲೇ ಉದ್ಯಮ ಕಟ್ಟಲು ೩ನೇ ಮನೆ ಹೇಗೆ ಮುಖ್ಯ?",
      "ಕಿರಿಯ ಸಹೋದರರೊಂದಿಗಿನ ಬಾಂಧವ್ಯ ಹೇಗಿರುತ್ತದೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ಸಾಮಾನ್ಯವಾಗಿ ಕುಂಡಲಿಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಾದ ರಾಹು, ಶನಿ, ಕುಜ ಒಳ್ಳೆಯದಲ್ಲ ಎನ್ನುತ್ತಾರೆ. ಆದರೆ ೩ನೇ ಮನೆಯಲ್ಲಿ ಇವು ಇದ್ದರೆ ಜಾತಕನು ಜಯಶಾಲಿಯಾಗುತ್ತಾನೆ ಎನ್ನುವುದು ನಿಜವೇ?",
        textEn: "Acharyare, malefics are usually feared. But in the 3rd house, why do Mars, Rahu, and Saturn produce extraordinary victory and courage?",
        emphasisTopic: "೩ನೇ ಮನೆಯಲ್ಲಿ ಕ್ರೂರಗ್ರಹಗಳು"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಖಂಡಿತ ನಿಜ ಶ್ರುತಿಯವರೇ! ೩, ೬, ೧೦, ೧೧ ಮನೆಗಳನ್ನು 'ಉಪಚಯ ಸ್ಥಾನ' ಎನ್ನುತ್ತೇವೆ. ೩ನೇ ಮನೆಯೆಂದರೆ ಶ್ರಮ, ಸಾಹಸ, ಯುದ್ಧ ಮನೋಭಾವ. ಇಲ್ಲಿ ಸೌಮ್ಯ ಗ್ರಹವಾದ ಶುಕ್ರನೋ ಚಂದ್ರನೋ ಇದ್ದರೆ ಮೃದು ಸ್ವಭಾವ ಬರುತ್ತದೆ. ಅದೇ ಕುಜ, ಸೂರ್ಯ ಅಥವಾ ರಾಹು ಇದ್ದರೆ ಜಾತಕನು ಯಾವುದೇ ಭಯವಿಲ್ಲದೆ ಹೊಸ ಉದ್ಯಮ ಆರಂಭಿಸುತ್ತಾನೆ, ಸವಾಲುಗಳನ್ನು ಎದುರಿಸಿ ಗೆಲ್ಲುತ್ತಾನೆ!",
        textEn: "Precisely. Houses 3, 6, 10, 11 are Upachayas (growth houses). 3rd house represents grit and bravery. Malefics here destroy fear and build enterprise and self-made success!",
        emphasisTopic: "ಉಪಚಯ ತತ್ವ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 4: 4th House - Sukha & Matru Bhava (ಸುಖ & ಮಾತೃ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 4,
    houseNameKn: "೪ನೇ ಮನೆ - ಸುಖ & ಮಾತೃ ಭಾವ",
    houseNameEn: "House 4: Sukha & Matru Bhava (Mother, Home & Mind)",
    sanskritName: "ಸುಖ & ಮಾತೃ ಭಾವ (Sukha Bhava)",
    icon: "🏡",
    taglineKn: "ತಾಯಿ, ಮನಶಾಂತಿ, ಮನೆ, ಭೂಮಿ, ವಾಹನ ಸುಖ ಹಾಗೂ ವಿದ್ಯೆಯ ಕೇಂದ್ರಬಿಂದು",
    taglineEn: "Mother, Mental Peace, Real Estate, Luxury Vehicles, and Heart Health",
    primaryKarakatwasKn: [
      "ತಾಯಿ & ತಾಯಿಯ ವಾತ್ಸಲ್ಯ",
      "ಸ್ವಂತ ಮನೆ, ಭೂಮಿ & ಆಸ್ತಿ",
      "ವಾಹನ ಸುಖ & ಐಷಾರಾಮಿ ಜೀವನ",
      "ಮಾನಸಿಕ ನೆಮ್ಮದಿ & ಹೃದಯ ಆರೋಗ್ಯ"
    ],
    primaryKarakatwasEn: [
      "Mother's Affection & Lifespan",
      "Own Real Estate & Lands",
      "Conveyances & Luxury Vehicles",
      "Peace of Mind & Heart Health"
    ],
    karakaPlanetKn: "ಚಂದ್ರ (ಮಾತೃ/ಮನಃಕಾರಕ) & ಶುಕ್ರ (ವಾಹನಕಾರಕ)",
    naturalZodiacSignKn: "ಕರ್ಕಾಟಕ (Cancer)",
    naturalLordKn: "ಚಂದ್ರ (Moon)",
    captainStatusKn: "೪ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರ ಅಥವಾ ಗುರು ಸ್ವಕ್ಷೇತ್ರ/ಉಚ್ಚದಲ್ಲಿದ್ದರೆ 'ಮಾಳವ್ಯ' ಅಥವಾ 'ಹಂಸ' ಮಹಾಪುರುಷ ರಾಜಯೋಗ ಉಂಟಾಗಿ ಅರಮನೆಯಂತಹ ಮನೆ, ಐಷಾರಾಮಿ ಕಾರುಗಳು ಲಭಿಸುತ್ತವೆ.",
    slaveStatusKn: "೪ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ-ರಾಹು ಯುತಿ (ಶಾಪ) ಇದ್ದು ಚಂದ್ರನು ಕ್ಷೀಣವಾಗಿದ್ದರೆ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಇರುವುದಿಲ್ಲ, ಮನೆ-ಆಸ್ತಿ ವಿವಾದಗಳಲ್ಲಿ ಸಿಲುಕಬೇಕಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಗುರು (ಕರ್ಕಾಟಕದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ಕುಜ (ಕರ್ಕಾಟಕದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೪ನೇ ಮನೆ ಪ್ರಮುಖ 'ಕೇಂದ್ರ ಸ್ಥಾನ' (Kendra). ಇದು ವ್ಯಕ್ತಿಯ ಆಂತರಿಕ ಸಂತೋಷದ ಅಡಿಪಾಯ.",
      "ಕುಜನು ಭೂಮಿಕಾರಕನಾಗಿ ೪ನೇ ಮನೆಗೆ ಶುಭನಾದರೆ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಮತ್ತು ಕೃಷಿ ಭೂಮಿಯಲ್ಲಿ ಅಪಾರ ಲಾಭ ಸಿಗುತ್ತದೆ.",
      "೪ನೇ ಮನೆಯಧಿಪತಿ ೯ ಅಥವಾ ೧೦ರಲ್ಲಿದ್ದರೆ ಧರ್ಮಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
    ],
    keyDilemmasAnsweredKn: [
      "ಎಷ್ಟೇ ಹಣವಿದ್ದರೂ ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ ಇಲ್ಲದಿರಲು ೪ನೇ ಮನೆ ಕಾರಣವೇ?",
      "ಸ್ವಂತ ಮನೆ ಯೋಗ ಯಾವಾಗ ಒಲಿಯುತ್ತದೆ?",
      "ತಾಯಿಯ ಆರೋಗ್ಯ ಮತ್ತು ಆಸ್ತಿ ಯೋಗ ತಿಳಿಯುವುದು ಹೇಗೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ಕೋಟ್ಯಂತರ ರೂಪಾಯಿ ಸಂಪತ್ತಿದ್ದರೂ ರಾತ್ರಿ ನಿದ್ದೆ ಇಲ್ಲದೆ, ಮನೆಯಲ್ಲಿ ಶಾಂತಿ ಇಲ್ಲದೆ ಒದ್ದಾಡುವ ಜನರಿದ್ದಾರೆ. ಇದಕ್ಕೆ ೪ನೇ ಮನೆಯೇ ಕಾರಣವೇ?",
        textEn: "Acharyare, some have immense wealth yet lack sleep and peace at home. Does the 4th house govern internal happiness and home serenity?",
        emphasisTopic: "ಆಂತರಿಕ ಸುಖ & ನೆಮ್ಮದಿ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಹೌದು ಶ್ರುತಿಯವರೇ. ೪ನೇ ಮನೆಯನ್ನು 'ಸುಖ ಸ್ಥಾನ' ಎನ್ನುತ್ತೇವೆ. ಇದು ನಮ್ಮ ಎದೆ, ಹೃದಯ ಮತ್ತು ಮನಸ್ಸನ್ನು ಆಳುತ್ತದೆ. ಚಂದ್ರ ಮತ್ತು ೪ನೇ ಅಧಿಪತಿ ಪಾಪಪೀಡಿತರಾದರೆ ಹೊರಗೆಲ್ಲಾ ವೈಭವವಿದ್ದರೂ ಒಳಗೆ ಅಶಾಂತಿ ತುಂಬಿರುತ್ತದೆ. ಆದರೆ ೪ರಲ್ಲಿ ಶುಭಗ್ರಹವಿದ್ದರೆ ಗುಡಿಸಲಿನಲ್ಲಿ ವಾಸಿಸಿದರೂ ಸದಾ ಆನಂದವಾಗಿರುತ್ತಾರೆ!",
        textEn: "Indeed. 4th house is Sukha Sthana, governing the heart, chest, and mind. If Moon or 4th lord is afflicted, external opulence fails to bring joy. If benefic, even simple living feels heavenly.",
        emphasisTopic: "ಸುಖ ಸ್ಥಾನ ತತ್ವ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 5: 5th House - Putra & Poorva Punya Bhava (ಪುತ್ರ & ಪೂರ್ವಪುಣ್ಯ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 5,
    houseNameKn: "೫ನೇ ಮನೆ - ಪುತ್ರ & ಪೂರ್ವಪುಣ್ಯ ಭಾವ",
    houseNameEn: "House 5: Putra & Poorva Punya (Children, Intellect & Past Karma)",
    sanskritName: "ಪುತ್ರ & ಪೂರ್ವಪುಣ್ಯ ಭಾವ (Poorva Punya Bhava)",
    icon: "🎓",
    taglineKn: "ಬುದ್ಧಿಶಕ್ತಿ, ಪ್ರತಿಭೆ, ಸಂತಾನ ಯೋಗ, ಮಂತ್ರ ಸಿದ್ಧಿ, ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ ಹಾಗೂ ಷೇರು ಮಾರುಕಟ್ಟೆ",
    taglineEn: "Genius, Speculative Intelligence, Progeny, Mantra Siddhi, and Past Life Merits",
    primaryKarakatwasKn: [
      "ಮಕ್ಕಳ ಯೋಗ & ಸಂತಾನ ಸುಖ",
      "ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ & ಸೃಜನಶೀಲತೆ",
      "ಮಂತ್ರೋಪಾಸನೆ & ಜ್ಯೋತಿಷ್ಯ ಜ್ಞಾನ",
      "ಷೇರು ಮಾರುಕಟ್ಟೆ & ಅನಿರೀಕ್ಷಿತ ಅದೃಷ್ಟ"
    ],
    primaryKarakatwasEn: [
      "Children & Lineage Blessings",
      "Intuition, Intellect & Creativity",
      "Mantra Siddhi & Spiritual Wisdom",
      "Speculation, Investments & Past Merits"
    ],
    karakaPlanetKn: "ಗುರು (ಸಂತಾನ & ಬುದ್ಧಿಕಾರಕ) & ಬುಧ (ಮೇಧಾಶಕ್ತಿ)",
    naturalZodiacSignKn: "ಸಿಂಹ (Leo)",
    naturalLordKn: "ಸೂರ್ಯ (Sun)",
    captainStatusKn: "೫ನೇ ಮನೆಯಧಿಪತಿ ತ್ರಿಕೋಣ (೯) ಅಥವಾ ಕೇಂದ್ರದಲ್ಲಿದ್ದು ಗುರು ಯುತನಾದರೆ 'ತ್ರಿಕೋಣ ರಾಜಯೋಗ'. ಅಸಾಧಾರಣ ಬುದ್ಧಿಶಕ್ತಿ ಮತ್ತು ಉನ್ನತ ಸಂತಾನ ಯೋಗ ಸಿಗುತ್ತದೆ.",
    slaveStatusKn: "೫ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು/ಕೇತು ಇದ್ದು ಗುರುವು ೬/೮ ರಲ್ಲಿದ್ದರೆ 'ಸರ್ಪ ದೋಷ' ಅಥವಾ 'ಸಂತಾನ ಪ್ರತಿಬಂಧಕ' ಉಂಟಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಸೂರ್ಯ (ಸ್ವಕ್ಷೇತ್ರ ಸಿಂಹದಲ್ಲಿ ಮೂಲತ್ರಿಕೋಣ)",
    debilitatedPlanetKn: "ಯಾವುದೇ ಗ್ರಹವಿಲ್ಲ (ಸಿಂಹದಲ್ಲಿ ಸಮಸ್ಥಿತಿ)",
    ramanGoldenRulesKn: [
      "೫ನೇ ಮನೆ ಧರ್ಮ ತ್ರಿಕೋಣ. ಇದು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಮಾಡಿದ ಪುಣ್ಯದ ಫಲವನ್ನು ಈ ಜನ್ಮದಲ್ಲಿ ಅನುಭವಿಸುವ ಬ್ಯಾಂಕ್ ಅಕೌಂಟ್!",
      "ಬುಧ ಮತ್ತು ಶುಕ್ರ ೫ರಲ್ಲಿದ್ದರೆ ಕಲೆ, ಸಾಹಿತ್ಯ, ಗಾಯನ ಮತ್ತು ಸಾಫ್ಟ್‌ವೇರ್ ಕ್ಷೇತ್ರದಲ್ಲಿ ವಿಶ್ವಖ್ಯಾತಿ ಗಳಿಸುತ್ತಾರೆ.",
      "೫ನೇ ಮನೆಯಧಿಪತಿ ಮತ್ತು ೯ನೇ ಮನೆಯಧಿಪತಿ ಪರಸ್ಪರ ನೋಡಿಕೊಂಡರೆ ಅತ್ಯುನ್ನತ ಜ್ಞಾನ ಮತ್ತು ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ."
    ],
    keyDilemmasAnsweredKn: [
      "ಸಂತಾನ ತಡವಾಗಲು ೫ನೇ ಮನೆಯ ಗ್ರಹ ಸ್ಥಿತಿ ಹೇಗೆ ಕಾರಣ?",
      "ಷೇರು ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಹೂಡಿಕೆಯಲ್ಲಿ ಯಶಸ್ಸು ಸಿಗಲು ಯಾವ ಯೋಗ ಬೇಕು?",
      "ಪೂರ್ವಪುಣ್ಯ ಬಲವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳುವುದು ಹೇಗೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ಕೆಲವರು ಯಾವುದೇ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕೈಯಿಟ್ಟರೂ ತಕ್ಷಣ ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಯಶಸ್ವಿಯಾಗುತ್ತಾರೆ. ಕೆಲವರು ಎಷ್ಟೇ ಓದಿದರೂ ನೆನಪಿರುವುದಿಲ್ಲ. ೫ನೇ ಮನೆಗೂ ನಮ್ಮ ಬುದ್ಧಿ ಮತ್ತು ಹಿಂದಿನ ಜನ್ಮದ ಕರ್ಮಕ್ಕೂ ಏನು ಸಂಬಂಧ?",
        textEn: "Acharyare, some grasp concepts effortlessly while others struggle. How does the 5th house connect past life merits (Poorva Punya) to modern intelligence and children?",
        emphasisTopic: "ಪೂರ್ವಪುಣ್ಯದ ರಹಸ್ಯ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "೫ನೇ ಮನೆಯೆಂದರೆ 'ಪ್ರತಿಭಾ ಸ್ಥಾನ'! ಪೂರ್ವ ಜನ್ಮದಲ್ಲಿ ಮಾಡಿದ ತಪಸ್ಸು, ದಾನ, ಮಂತ್ರ ಜಪದ ಫಲವೇ ಈ ಜನ್ಮದಲ್ಲಿ ನಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿಯಾಗಿ ಹೊರಹೊಮ್ಮುತ್ತದೆ. ೫ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಅಥವಾ ಬುಧ ಬಲವಾಗಿದ್ದರೆ ಜಾತಕನು ಜ್ಞಾನಿ, ಶ್ರೇಷ್ಠ ಮಾರ್ಗದರ್ಶಕ ಹಾಗೂ ಉತ್ತಮ ಮಕ್ಕಳ ತಂದೆ-ತಾಯಿಯಾಗುತ್ತಾನೆ.",
        textEn: "5th house is the seat of genius (Pratibha). It reflects the spiritual credits earned in previous births. Strong Jupiter or Mercury here bestows intuitive intelligence and noble progeny.",
        emphasisTopic: "ಪ್ರತಿಭಾ ಸ್ಥಾನ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 6: 6th House - Shatru, Rina & Roga Bhava (ಶತ್ರು, ಋಣ & ರೋಗ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 6,
    houseNameKn: "೬ನೇ ಮನೆ - ಶತ್ರು, ಋಣ & ರೋಗ ಭಾವ",
    houseNameEn: "House 6: Shatru, Rina & Roga (Enemies, Debts & Diseases)",
    sanskritName: "ರಿಪು & ರೋಗ ಭಾವ (Ripu Bhava)",
    icon: "🛡️",
    taglineKn: "ಸಾಲ, ರೋಗ, ಶತ್ರುಗಳು, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು, ನ್ಯಾಯಾಲಯದ ವಿವಾದಗಳು ಹಾಗೂ ಸೇವಾ ವೃತ್ತಿ",
    taglineEn: "Debts, Pathologies, Litigation, Competitive Exams, and Triumph over Adversity",
    primaryKarakatwasKn: [
      "ಶತ್ರು ನಾಶ & ಕೋರ್ಟ್ ಕಚೇರಿ ಜಯ",
      "ಸಾಲ ಬಾಧೆ & ಸಾಲ ತೀರಿಸುವ ಶಕ್ತಿ",
      "ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು & ಹೊಟ್ಟೆಯ ರೋಗ",
      "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ & ಉದ್ಯೋಗ ಸ್ಪರ್ಧೆ"
    ],
    primaryKarakatwasEn: [
      "Victory in Litigation & Over Enemies",
      "Debts, Loans & Financial Liabilities",
      "Acute Health Issues & Digestion",
      "Competitive Exams & Service Sector"
    ],
    karakaPlanetKn: "ಕುಜ (ಶತ್ರುನಾಶ) & ಶನಿ (ಸಂಕಷ್ಟ)",
    naturalZodiacSignKn: "ಕನ್ಯಾ (Virgo)",
    naturalLordKn: "ಬುಧ (Mercury)",
    captainStatusKn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ, ಕುಜ ಅಥವಾ ರಾಹು ಇದ್ದರೆ 'ಶತ್ರುಹಂತಕ ಯೋಗ'. ಎಷ್ಟೇ ಬಲಿಷ್ಠ ಶತ್ರುಗಳಿದ್ದರೂ ಅಥವಾ ಕೋರ್ಟ್ ಕೇಸ್ ಇದ್ದರೂ ಜಾತಕನೇ ವಿಜಯಿಯಾಗುತ್ತಾನೆ.",
    slaveStatusKn: "೬ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಅಥವಾ ಶುಕ್ರರಂತಹ ಸೌಮ್ಯ ಗ್ರಹಗಳಿದ್ದು ಲಗ್ನಾಧಿಪತಿ ದುರ್ಬಲನಾದರೆ ಪದೇ ಪದೇ ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕಬೇಕಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಬುಧ (ಕನ್ಯಾದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ಶುಕ್ರ (ಕನ್ಯಾದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೬ನೇ ಮನೆಯಧಿಪತಿ ೮ ಅಥವಾ ೧೨ ರಲ್ಲಿದ್ದರೆ 'ಹರ್ಷ ವಿಪರೀತ ರಾಜಯೋಗ' ಉಂಟಾಗಿ ಸಂಕಷ್ಟಗಳೇ ಮಹಾ ಸಂಪತ್ತಿಗೆ ಕಾರಣವಾಗುತ್ತವೆ.",
      "೬ನೇ ಮನೆ ಉಪಚಯ ಸ್ಥಾನವೂ ಹೌದು. ಇಲ್ಲಿ ಕ್ರೂರ ಗ್ರಹಗಳಿದ್ದರೆ ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಶ್ರೇಷ್ಠ ರ್ಯಾಂಕ್ ಬರುತ್ತದೆ.",
      "೬ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರನಿದ್ದರೆ ಜೀರ್ಣಾಂಗ ದೋಷ ಮತ್ತು ಮಾನಸಿಕ ಆತಂಕ ಕಾಡಬಹುದು."
    ],
    keyDilemmasAnsweredKn: [
      "೬ನೇ ಮನೆಯು ದುಸ್ಥಾನವಾದರೂ IAS/KAS ಪರೀಕ್ಷೆ ಗೆಲ್ಲಲು ಏಕೆ ಬೇಕು?",
      "ಸಾಲದ ಬಾಧೆಯಿಂದ ಮುಕ್ತಿ ಪಡೆಯುವ ಜ್ಯೋತಿಷ್ಯ ನಿಯಮಗಳೇನು?",
      "ಶತ್ರುಗಳು ಮಿತ್ರರಾಗುವ ಯೋಗ ಯಾವಾಗ ಬರುತ್ತದೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ೬ನೇ ಮನೆ ಎಂದರೆ ಎಲ್ಲರೂ ಹೆದರುತ್ತಾರೆ - ರೋಗ, ಸಾಲ, ಶತ್ರು ಸ್ಥಾನ ಎಂದು. ಆದರೆ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು (UPSC, KPSC) ಮತ್ತು ವಕೀಲ ವೃತ್ತಿಗೆ ೬ನೇ ಮನೆಯೇ ಮುಖ್ಯ ಎನ್ನುತ್ತಾರಲ್ಲ, ಇದು ಹೇಗೆ ಸಾಧ್ಯ?",
        textEn: "Acharyare, 6th house is dreaded for debts and disease. Yet for civil services exams and top lawyers, 6th house is the hero. How so?",
        emphasisTopic: "ಸ್ಪರ್ಧಾ ಯೋಗ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಅತ್ಯಂತ ವೈಜ್ಞಾನಿಕ ಪ್ರಶ್ನೆ ಶ್ರುತಿಯವರೇ! ಪರೀಕ್ಷೆಯಲ್ಲಿ ಸಾವಿರಾರು ಜನರ ನಡುವೆ ಸ್ಪರ್ಧಿಸಿ ಗೆಲ್ಲಬೇಕೆಂದರೆ ಜಾತಕನಿಗೆ 'ಶತ್ರುಜಯ' ಶಕ್ತಿ ಬೇಕು. ೬ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಅಥವಾ ಕುಜ ಇದ್ದರೆ ಅವನು ಪ್ರತಿಸ್ಪರ್ಧಿಗಳನ್ನು ಧೂಳೀಪಟ ಮಾಡುತ್ತಾನೆ! ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಪ್ರಕಾರ, ೬ನೇ ಮನೆಯ ಕ್ರೂರಗ್ರಹಗಳು ಜಾತಕನನ್ನು ಅಜೇಯ ಹೋರಾಟಗಾರನನ್ನಾಗಿ ಮಾಡುತ್ತವೆ.",
        textEn: "Brilliant question! To outshine thousands in competitive exams, you need fighting power. Malefics in the 6th destroy competition and give unmatched resilience!",
        emphasisTopic: "ಶತ್ರುಹಂತಕ ಯೋಗ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 7: 7th House - Kalatra & Saptama Bhava (ಕಳತ್ರ & ಸಪ್ತಮ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 7,
    houseNameKn: "೭ನೇ ಮನೆ - ಕಳತ್ರ & ಪಾಲುದಾರಿಕೆ ಭಾವ",
    houseNameEn: "House 7: Kalatra Bhava (Spouse, Marriage & Partnerships)",
    sanskritName: "ಜಾಯಾ & ಕಳತ್ರ ಭಾವ (Kalatra Bhava)",
    icon: "💍",
    taglineKn: "ವಿವಾಹ, ಸಂಗಾತಿ ಗುಣಲಕ್ಷಣ, ಉದ್ಯಮ ಪಾಲುದಾರಿಕೆ, ಸಾರ್ವಜನಿಕ ಸಂಬಂಧ ಹಾಗೂ ಕುಜ ದೋಷ",
    taglineEn: "Marriage Harmony, Spouse Attributes, Business Partnerships & Kuja Dosha",
    primaryKarakatwasKn: [
      "ವಿವಾಹ ಸುಖ & ಸಂಗಾತಿಯ ಗುಣ",
      "ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ & ಒಪ್ಪಂದಗಳು",
      "ವಿದೇಶ ಪ್ರಯಾಣ & ಸಾರ್ವಜನಿಕ ಪ್ರಭಾವ",
      "ಕಾಮ ಸುಖ & ದ್ವಿತೀಯ ಮಾರಕ ತತ್ವ"
    ],
    primaryKarakatwasEn: [
      "Marital Harmony & Spouse Nature",
      "Business Partnerships & Trade",
      "Foreign Relocation & Public Rapport",
      "Physical Relations & Secondary Maraka"
    ],
    karakaPlanetKn: "ಶುಕ್ರ (ಪುರುಷರಿಗೆ ಪತ್ನೀಕಾರಕ) & ಗುರು (ಸ್ತ್ರೀಯರಿಗೆ ಪತಿಕಾರಕ)",
    naturalZodiacSignKn: "ತುಲಾ (Libra)",
    naturalLordKn: "ಶುಕ್ರ (Venus)",
    captainStatusKn: "೭ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರ ಅಥವಾ ಗುರು ಸ್ವಕ್ಷೇತ್ರ/ಉಚ್ಚದಲ್ಲಿದ್ದು ಶುಭದೃಷ್ಟಿ ಪಡೆದರೆ ರೂಪವಂತೆ, ಸದ್ಗುಣಶೀಲ ಸಂಗಾತಿ ಮತ್ತು ಯಶಸ್ವಿ ಪಾಲುದಾರಿಕೆ ಒಲಿಯುತ್ತದೆ.",
    slaveStatusKn: "೭ನೇ ಮನೆಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಿದ್ದು ಕುಜ ದೋಷ ಅಥವಾ ರಾಹು-ಕೇತು ಪೀಡೆ ಇದ್ದರೆ ವೈವಾಹಿಕ ಕಲಹ ಮತ್ತು ವಿಚ್ಛೇದನದ ಅಪಾಯವಿರುತ್ತದೆ.",
    exaltedPlanetKn: "ಶನಿ (ತುಲಾದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ಸೂರ್ಯ (ತುಲಾದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೭ನೇ ಮನೆ ಲಗ್ನಕ್ಕೆ ನಿಖರ ಎದುರುಗಡೆ (೧೮೦ ಡಿಗ್ರಿ) ಇರುವುದರಿಂದ ಇದು ಜಾತಕನ ಪ್ರತಿಬಿಂಬ.",
      "ಕುಜನು ೭ರಲ್ಲಿದ್ದರೆ ಕುಜ ದೋಷ. ಆದರೆ ಗುರು ನೋಡಿದರೆ ಅಥವಾ ಕುಜನು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದರೆ ದೋಷಭಂಗವಾಗುತ್ತದೆ.",
      "೭ನೇ ಮನೆಯಧಿಪತಿ ೧೦ರಲ್ಲಿದ್ದರೆ ಮದುವೆಯ ನಂತರ ವೃತ್ತಿಯಲ್ಲಿ ಅಪಾರ ಏಳಿಗೆಯಾಗುತ್ತದೆ."
    ],
    keyDilemmasAnsweredKn: [
      "ಕುಜ ದೋಷವಿದ್ದರೆ ಮದುವೆ ತಡವಾಗುವುದೇಕೆ? ಪರಿಹಾರವೇನು?",
      "ಪಾಲುದಾರಿಕೆ ವ್ಯಾಪಾರ ಯಶಸ್ವಿಯಾಗಲು ೭ನೇ ಮನೆ ಹೇಗೆ ಪರೀಕ್ಷಿಸಬೇಕು?",
      "ಸಂಗಾತಿಯ ಆಗಮನದಿಂದ ಅದೃಷ್ಟ ಖುಲಾಯಿಸುವುದು ಹೇಗೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ನೋಡುವಾಗ ೭ನೇ ಮನೆ ಅತ್ಯಂತ ಮುಖ್ಯ. ಆದರೆ ಅನೇಕರಲ್ಲಿ 'ಕುಜ ದೋಷ' ಎಂದರೆ ದೊಡ್ಡ ಆತಂಕವಿದೆ. ಕುಜ ೭ರಲ್ಲಿದ್ದರೆ ನಿಜವಾಗಿಯೂ ವೈವಾಹಿಕ ಜೀವನ ಹಾಳಾಗುತ್ತದೆಯೇ?",
        textEn: "Acharyare, 7th house governs marriage. People panic hearing 'Kuja Dosha'. Does Mars in the 7th always ruin marital peace?",
        emphasisTopic: "ಕುಜ ದೋಷದ ಸತ್ಯಾಸತ್ಯತೆ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಇಲ್ಲ ಶ್ರುತಿಯವರೇ, ಕುಜ ದೋಷಕ್ಕೆ ಶಾಸ್ತ್ರದಲ್ಲಿ ೨೦ಕ್ಕೂ ಹೆಚ್ಚು ದೋಷಭಂಗ ನಿಯಮಗಳಿವೆ! ಕುಜನು ಮೇಷ, ವೃಶ್ಚಿಕ, ಮಕರದಲ್ಲಿದ್ದರೆ ಅಥವಾ ಗುರುವಿನ ದೃಷ್ಟಿ ಪಡೆದರೆ ದೋಷ ಪರಿಹಾರವಾಗುತ್ತದೆ. ಮುಖ್ಯವಾಗಿ ೭ನೇ ಮನೆಯ ಮೇಲೆ ಶುಭಗ್ರಹಗಳ ಪ್ರಭಾವವಿದ್ದರೆ ಸಂಗಾತಿಯು ಧೈರ್ಯವಂತೆ ಮತ್ತು ಬೆನ್ನೆಲುಬಾಗಿ ನಿಲ್ಲುತ್ತಾಳೆ!",
        textEn: "Not at all. Shastras state over 20 cancellation rules for Kuja Dosha! If Mars is in own sign, exalted, or aspected by Jupiter, the dosha transforms into leadership and loyalty.",
        emphasisTopic: "ದೋಷಭಂಗ ನಿಯಮಗಳು"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 8: 8th House - Ayur & Ashta Bhava (ಆಯುಷ್ಯ & ಅಷ್ಟಮ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 8,
    houseNameKn: "೮ನೇ ಮನೆ - ಆಯುಷ್ಯ & ಅಷ್ಟಮ ಭಾವ",
    houseNameEn: "House 8: Ayur & Randhra Bhava (Longevity, Occult & Sudden Shifts)",
    sanskritName: "ಆಯುಷ್ಯ & ರಂಧ್ರ ಭಾವ (Randhra Bhava)",
    icon: "🔮",
    taglineKn: "ಆಯುಷ್ಯ, ಗೂಢ ಜ್ಞಾನ, ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ವಿಮೆ, ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ ಹಾಗೂ ಸಂಶೋಧನೆ",
    taglineEn: "Longevity, Occult Sciences, Sudden Windfalls, Inheritance & Deep Metamorphosis",
    primaryKarakatwasKn: [
      "ಆಯುಷ್ಯ ಪ್ರಮಾಣ & ಮೃತ್ಯು ಸ್ವರೂಪ",
      "ಅನಿರೀಕ್ಷಿತ ಧನ, ವಿಮೆ & ಲಾಟರಿ",
      "ಗೂಢ ಶಾಸ್ತ್ರ, ಜ್ಯೋತಿಷ್ಯ & ತಂತ್ರ",
      "ಅತ್ತೆ-ಮಾವನ ಆಸ್ತಿ & ಸಂಶೋಧನೆ"
    ],
    primaryKarakatwasEn: [
      "Longevity & Transformation",
      "Sudden Wealth, Insurance & Inheritance",
      "Occult Sciences, Astrology & Research",
      "In-laws Relations & Deep Mysteries"
    ],
    karakaPlanetKn: "ಶನಿ (ಆಯುಷ್ಕಾರಕ)",
    naturalZodiacSignKn: "ವೃಶ್ಚಿಕ (Scorpio)",
    naturalLordKn: "ಕುಜ (Mars) & ಕೇತು",
    captainStatusKn: "೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿಯು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದರೆ ಅಥವಾ ೮ನೇ ಅಧಿಪತಿ ಬಲವಾಗಿದ್ದರೆ 'ದೀರ್ಘಾಯುಷ್ಯ ಯೋಗ' ಮತ್ತು ಗೂಢ ಜ್ಞಾನ ಸಿದ್ಧಿ.",
    slaveStatusKn: "೮ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರ-ರಾಹು ಗ್ರಹಣ ಯುತಿ ಇದ್ದು ಲಗ್ನಾಧಿಪತಿ ದುರ್ಬಲನಾದರೆ ದೀರ್ಘಕಾಲದ ರೋಗ ಮತ್ತು ಮಾನಸಿಕ ಭಯ ಕಾಡುತ್ತದೆ.",
    exaltedPlanetKn: "ಯಾವುದೇ ಗ್ರಹವಿಲ್ಲ (ಕೇತು ಬಲಿಷ್ಠ)",
    debilitatedPlanetKn: "ಚಂದ್ರ (ವೃಶ್ಚಿಕದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಇದ್ದರೆ 'ಕಾರಕೋ ಭಾವ ನಾಶಾಯ' ನಿಯಮಕ್ಕೆ ಅಪವಾದವಾಗಿ ದೀರ್ಘಾಯುಷ್ಯ ಸಿಗುತ್ತದೆ.",
      "೮ನೇ ಮನೆಯಧಿಪತಿ ೬ ಅಥವಾ ೧೨ ರಲ್ಲಿದ್ದರೆ 'ಸರಳ ವಿಪರೀತ ರಾಜಯೋಗ' ಉಂಟಾಗುತ್ತದೆ.",
      "೮ನೇ ಮನೆಯು ಸಂಶೋಧಕರು, ಡೇಟಾ ಸೈಂಟಿಸ್ಟ್‌ಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿಗಳಿಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ."
    ],
    keyDilemmasAnsweredKn: [
      "೮ನೇ ಮನೆ ಎಂದರೆ ಅಕಾಲ ಮೃತ್ಯುವೇ?",
      "ಅನಿರೀಕ್ಷಿತ ಲಾಟರಿ ಅಥವಾ ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ ಯಾವಾಗ ಸಿಗುತ್ತದೆ?",
      "ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ಗೂಢ ವಿದ್ಯೆ ಕಲಿಯಲು ೮ನೇ ಮನೆ ಹೇಗೆ ಸಹಕಾರಿ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ೮ನೇ ಮನೆ ಎಂದ ತಕ್ಷಣ ಜನರಿಗೆ ಸಾವಿನ ಭಯ ಬರುತ್ತದೆ. ಆದರೆ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ೮ನೇ ಮನೆಯನ್ನು ಮಹಾ ಆಧ್ಯಾತ್ಮಿಕ ಮತ್ತು ಅನಿರೀಕ್ಷಿತ ಧನದ ಗಣಿ ಎಂದು ಏಕೆ ಕರೆಯುತ್ತಾರೆ?",
        textEn: "Acharyare, 8th house is feared as the house of death. Why do master astrologers consider it a goldmine of occult wisdom, research, and sudden wealth?",
        emphasisTopic: "೮ನೇ ಮನೆಯ ಸಕಾರಾತ್ಮಕ ರಹಸ್ಯ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "೮ನೇ ಮನೆಯೆಂದರೆ 'ರಂಧ್ರ ಭಾವ' - ಅಂದರೆ ಭೂಮಿಯ ಆಳದಲ್ಲಿ ಅಡಗಿರುವ ನಿಧಿ! ವಿಜ್ಞಾನಿಗಳು, ಸಂಶೋಧಕರು, ಶ್ರೇಷ್ಠ ಜ್ಯೋತಿಷಿಗಳು, ಸರ್ಜನ್‌ಗಳು ಎಲ್ಲರಿಗೂ ೮ನೇ ಮನೆ ಬಲವಾಗಿರಬೇಕು. ಶನಿಯು ೮ರಲ್ಲಿದ್ದರೆ ೮೦-೯೦ ವರ್ಷ ದೀರ್ಘಾಯುಷ್ಯ ಸಿಗುತ್ತದೆ. ವಿಪರೀತ ರಾಜಯೋಗವಾದರೆ ರಾತ್ರೋರಾತ್ರಿ ಜಾತಕನು ಕೋಟ್ಯಧಿಪತಿಯಾಗುತ್ತಾನೆ!",
        textEn: "8th represents subterranean depth. Deep researchers, data scientists, surgeons and spiritual mystics have strong 8th house. Saturn here confers long life, and Vipareeta Raja Yoga brings sudden transformation.",
        emphasisTopic: "ದೀರ್ಘಾಯುಷ್ಯ & ವಿಪರೀತ ರಾಜಯೋಗ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 9: 9th House - Bhagya & Dharma Bhava (ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 9,
    houseNameKn: "೯ನೇ ಮನೆ - ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ",
    houseNameEn: "House 9: Bhagya & Dharma (Fortune, Father & Divine Grace)",
    sanskritName: "ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ (Bhagya Bhava)",
    icon: "🕉️",
    taglineKn: "ಅದೃಷ್ಟ, ತಂದೆ, ಗುರು ಕೃಪೆ, ತೀರ್ಥಯಾತ್ರೆ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ದೈವಾನುಗ್ರಹ",
    taglineEn: "Supreme Fortune, Father's Blessings, Guru Grace, Higher Wisdom & Pilgrimages",
    primaryKarakatwasKn: [
      "ಸಮಗ್ರ ಅದೃಷ್ಟ & ಈಶ್ವರಾನುಗ್ರಹ",
      "ತಂದೆ & ತಂದೆಯ ಆಶೀರ್ವಾದ",
      "ಗುರು ಉಪದೇಶ & ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ",
      "ಉನ್ನತ ಶಿಕ್ಷಣ (PhD) & ಧರ್ಮ ಶ್ರದ್ಧೆ"
    ],
    primaryKarakatwasEn: [
      "Divine Fortune & Grace",
      "Father & Paternal Heritage",
      "Guru Mentorship & Pilgrimages",
      "Higher Academia & Righteous Living"
    ],
    karakaPlanetKn: "ಗುರು (ಧರ್ಮಕಾರಕ) & ಸೂರ್ಯ (ಪಿತೃಕಾರಕ)",
    naturalZodiacSignKn: "ಧನುಸ್ಸು (Sagittarius)",
    naturalLordKn: "ಗುರು (Jupiter)",
    captainStatusKn: "೯ನೇ ಮನೆಯಧಿಪತಿ ೯, ೧, ೫ ಅಥವಾ ೧೦ರಲ್ಲಿದ್ದರೆ 'ಮಹಾ ಭಾಗ್ಯ ಯೋಗ'. ಇಂತಹ ಜಾತಕನು ಮುಟ್ಟಿದ್ದೆಲ್ಲಾ ಬಂಗಾರವಾಗುತ್ತದೆ.",
    slaveStatusKn: "೯ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಇದ್ದು ಗುರು ನೀಚನಾದರೆ 'ಪಿತೃ ದೋಷ' ಅಥವಾ ಗುರು ನಿಂದನೆ ಉಂಟಾಗಿ ಅದೃಷ್ಟ ಕೈಕೊಡುತ್ತದೆ.",
    exaltedPlanetKn: "ಕೇತು (ಧನುಸ್ಸಿನಲ್ಲಿ ಉಚ್ಚ/ಮೋಕ್ಷದಾಯಕ)",
    debilitatedPlanetKn: "ರಾಹು (ಧನುಸ್ಸಿನಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೯ನೇ ಮನೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ 'ಲಕ್ಷ್ಮೀ ಸ್ಥಾನ' (Trikona).",
      "೯ ಮತ್ತು ೧೦ನೇ ಅಧಿಪತಿಗಳ ಸಂಯೋಗವೇ ಅತ್ಯುನ್ನತ 'ಧರ್ಮಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ'.",
      "೯ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಅಥವಾ ಸೂರ್ಯನಿದ್ದರೆ ತಂದೆಯಿಂದ ಅಪಾರ ಗೌರವ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಧರ್ಮಾಧಿಕಾರ ಸಿಗುತ್ತದೆ."
    ],
    keyDilemmasAnsweredKn: [
      "ಎಲ್ಲಾ ಅರ್ಹತೆ ಇದ್ದರೂ ಅದೃಷ್ಟ ಕೈಕೊಡಲು ೯ನೇ ಮನೆ ದೋಷ ಕಾರಣವೇ?",
      "ಗುರು ಕೃಪೆ ಮತ್ತು ತೀರ್ಥಯಾತ್ರೆಗಳಿಂದ ಭಾಗ್ಯ ವೃದ್ಧಿಯಾಗುವುದು ಹೇಗೆ?",
      "ಧರ್ಮಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗದ ಮಹತ್ವವೇನು?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ೯ನೇ ಮನೆಯನ್ನು ಕುಂಡಲಿಯ 'ಅಮೃತ ಕಲಶ' ಎನ್ನುತ್ತಾರೆ. ಒಬ್ಬ ವ್ಯಕ್ತಿಗೆ ಶ್ರಮವಿದ್ದರೂ ಅದೃಷ್ಟವಿಲ್ಲದಿದ್ದರೆ ಗೆಲ್ಲಲು ಸಾಧ್ಯವಿಲ್ಲ. ೯ನೇ ಮನೆ ಹೇಗೆ ನಮ್ಮ ಅದೃಷ್ಟದ ಬಾಗಿಲನ್ನು ತೆರೆಯುತ್ತದೆ?",
        textEn: "Acharyare, the 9th house is called the vessel of nectar. Effort without fortune leads nowhere. How does the 9th house unlock divine grace and luck?",
        emphasisTopic: "ಭಾಗ್ಯ ಸ್ಥಾನದ ಮಹತ್ವ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಶಾಸ್ತ್ರದಲ್ಲಿ 'ಭಾಗ್ಯಂ ಪ್ರಧಾನಂ ನ ಬಲಂ ನ ವಿದ್ಯಾ' ಎನ್ನಲಾಗಿದೆ. ೯ನೇ ಮನೆಯೆಂದರೆ ಈಶ್ವರನ ಕೃಪೆ, ತಂದೆಯ ಆಶೀರ್ವಾದ ಮತ್ತು ಗುರುವಿನ ಮಾರ್ಗದರ್ಶನ. ೯ನೇ ಮನೆ ಬಲವಾಗಿದ್ದರೆ ಕಷ್ಟದ ಸಮಯದಲ್ಲೂ ಅದ್ಭುತವಾಗಿ ಪವಾಡಸದೃಶ ಸಹಾಯ ಒದಗಿಬರುತ್ತದೆ!",
        textEn: "Grace precedes mere might. 9th house signifies God's benevolence, father's prayers, and Guru's blessings. When strong, miraculous help arrives during critical crossroads!",
        emphasisTopic: "ಈಶ್ವರಾನುಗ್ರಹ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 10: 10th House - Karma & Rajya Bhava (ಕರ್ಮ & ರಾಜ್ಯ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 10,
    houseNameKn: "೧೦ನೇ ಮನೆ - ಕರ್ಮ & ರಾಜ್ಯ ಭಾವ",
    houseNameEn: "House 10: Karma & Rajya (Career, Status & Leadership)",
    sanskritName: "ಕರ್ಮ & ರಾಜ್ಯ ಭಾವ (Karma Bhava)",
    icon: "🏛️",
    taglineKn: "ವೃತ್ತಿ ಜೀವನ, ಉದ್ಯೋಗ, ಕೀರ್ತಿ, ರಾಜಕೀಯ ಯೋಗ, ಅಧಿಕಾರ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನ",
    taglineEn: "Career Vector, Professional Zenith, Fame, Government Patronage & Digbala Power",
    primaryKarakatwasKn: [
      "ಉದ್ಯೋಗ, ವೃತ್ತಿ & ವ್ಯವಹಾರ",
      "ಕೀರ್ತಿ, ಪ್ರಸಿದ್ಧಿ & ಸಾರ್ವಜನಿಕ ಗೌರವ",
      "ಸರ್ಕಾರಿ ಉದ್ಯೋಗ & ರಾಜಕೀಯ ಅಧಿಕಾರ",
      "ದಿಗ್ಬಲ & ನಾಯಕತ್ವ ಗುಣ"
    ],
    primaryKarakatwasEn: [
      "Profession, Career & Business",
      "Fame, Status & Authority",
      "Government Rank & Political Power",
      "Digbala Peak & Leadership"
    ],
    karakaPlanetKn: "ಸೂರ್ಯ (ಅಧಿಕಾರ), ಬುಧ (ವ್ಯಾಪಾರ), ಗುರು (ಧರ್ಮವೃತ್ತಿ), ಶನಿ (ಜನನಾಯಕತ್ವ)",
    naturalZodiacSignKn: "ಮಕರ (Capricorn)",
    naturalLordKn: "ಶನಿ (Saturn)",
    captainStatusKn: "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯ ಅಥವಾ ಕುಜ ಇದ್ದರೆ 'ದಿಗ್ಬಲ' (Digbala). ಜಾತಕನು ಸಮಾಜವನ್ನು ಮುನ್ನಡೆಸುವ ಮಹಾ ನಾಯಕ, ಐಪಿಎಸ್/ಐಎಎಸ್ ಅಧಿಕಾರಿ ಅಥವಾ ಯಶಸ್ವಿ ಉದ್ಯಮಿಯಾಗುತ್ತಾನೆ.",
    slaveStatusKn: "೧೦ನೇ ಮನೆಯಧಿಪತಿ ೮ ಅಥವಾ ೧೨ ರಲ್ಲಿದ್ದು ನೀಚನಾಗಿದ್ದರೆ ಪದೇ ಪದೇ ಉದ್ಯೋಗ ನಷ್ಟ, ಅಪವಾದ ಮತ್ತು ವೃತ್ತಿಯಲ್ಲಿ ಅಸ್ಥಿರತೆ ಉಂಟಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಕುಜ (ಮಕರದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ಗುರು (ಮಕರದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೧೦ನೇ ಮನೆ ಅತ್ಯಂತ ಪ್ರಬಲ 'ವಿಷ್ಣು ಸ್ಥಾನ' (Kendra). ಇದು ವ್ಯಕ್ತಿಯ ಜೀವನದ ಕಿರೀಟ.",
      "೧೦ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಇದ್ದರೆ ರಾಜಕೀಯ, ಐಟಿ, ವಿದೇಶಿ ಕಂಪನಿಗಳಲ್ಲಿ ಮಿಂಚಿನ ವೇಗದಲ್ಲಿ ಉನ್ನತಿ ಹೊಂದುತ್ತಾರೆ.",
      "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಉಚ್ಚನಾಗಿದ್ದರೆ 'ಶಶ ಮಹಾಪುರುಷ ಯೋಗ' ಉಂಟಾಗಿ ಜನರ ಪ್ರೀತಿಪಾತ್ರ ನಾಯಕರಾಗುತ್ತಾರೆ."
    ],
    keyDilemmasAnsweredKn: [
      "ಸರ್ಕಾರಿ ನೌಕರಿ ಅಥವಾ ಸ್ವಂತ ಉದ್ಯಮ - ಯಾವುದು ಸರಿ ಎಂದು ತಿಳಿಯುವುದು ಹೇಗೆ?",
      "೧೦ನೇ ಮನೆಯಲ್ಲಿ ಗ್ರಹಗಳಿಲ್ಲದಿದ್ದರೆ ನಿರುದ್ಯೋಗವೇ?",
      "ರಾಜಯೋಗಗಳು ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ಇಂದಿನ ಯುವಪೀಳಿಗೆಗೆ ಅತ್ಯಂತ ಮುಖ್ಯವಾದದ್ದು ಕೆರಿಯರ್ ಅಥವಾ ವೃತ್ತಿ. ೧೦ನೇ ಮನೆಯನ್ನು ನೋಡಿ ಒಬ್ಬ ವ್ಯಕ್ತಿ ಸರ್ಕಾರಿ ಕೆಲಸ ಮಾಡುತ್ತಾನಾ, ಬಿಸಿನೆಸ್ ಮಾಡುತ್ತಾನಾ ಅಥವಾ ಐಟಿ ಕಂಪನಿಗೆ ಹೋಗುತ್ತಾನಾ ಎಂದು ನಿಖರವಾಗಿ ಹೇಳಬಹುದೇ?",
        textEn: "Acharyare, career is paramount today. Can the 10th house pinpoint whether one enters government service, entrepreneurship, or tech?",
        emphasisTopic: "ವೃತ್ತಿ ನಿರ್ಣಯ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಖಂಡಿತವಾಗಿ! ೧೦ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯ-ಕುಜ ಪ್ರಭಾವವಿದ್ದರೆ ಸರ್ಕಾರಿ ಆಡಳಿತ ಮತ್ತು ರಕ್ಷಣೆ; ಬುಧನಿದ್ದರೆ ವ್ಯಾಪಾರ ಮತ್ತು ಐಟಿ; ಶುಕ್ರನಿದ್ದರೆ ಸಿನಿಮಾ, ಕಲೆ ಮತ್ತು ಫ್ಯಾಷನ್; ಶನಿ-ರಾಹು ಪ್ರಭಾವವಿದ್ದರೆ ರಾಜಕೀಯ, ಕಾರ್ಖಾನೆ ಮತ್ತು ಮಾಸ್ ಲೀಡರ್‌ಶಿಪ್! ೧೦ನೇ ಮನೆಗೆ ಗ್ರಹಗಳ ದಿಗ್ಬಲವಿದ್ದರೆ ಆ ವ್ಯಕ್ತಿಯ ಹೆಸರು ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಯುತ್ತದೆ!",
        textEn: "Absolutely! Sun-Mars trigger government leadership; Mercury drives trade & tech; Venus sparks arts; Saturn-Rahu drive mass leadership. Digbala in 10th etches one's name in history!",
        emphasisTopic: "ದಿಗ್ಬಲ & ವೃತ್ತಿ ವೈವಿಧ್ಯ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 11: 11th House - Labha & Aya Bhava (ಲಾಭ & ಆಯ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 11,
    houseNameKn: "೧೧ನೇ ಮನೆ - ಲಾಭ & ಆಯ ಭಾವ",
    houseNameEn: "House 11: Labha & Aya (Gains, Desires & Network)",
    sanskritName: "ಲಾಭ & ಆಯ ಭಾವ (Labha Bhava)",
    icon: "📈",
    taglineKn: "ನಿರಂತರ ಆದಾಯ, ಆಸೆಗಳ ಈಡೇರಿಕೆ, ಹಿರಿಯ ಸಹೋದರರು, ಪ್ರಭಾವಿ ಮಿತ್ರವೃಂದ ಹಾಗೂ ಉದ್ಯಮ ಲಾಭ",
    taglineEn: "Incoming Cashflows, Wish Fulfillment, Elder Siblings & High-Impact Social Network",
    primaryKarakatwasKn: [
      "ಎಲ್ಲಾ ಮೂಲಗಳಿಂದ ನಿರಂತರ ಧನಲಾಭ",
      "ಮನೋಕಾಮನೆಗಳ ಪೂರ್ಣ ಸಿದ್ಧಿ",
      "ಹಿರಿಯ ಅಣ್ಣ-ಅಕ್ಕಂದಿರ ಸಹಕಾರ",
      "ದೊಡ್ಡ ಸಾಮಾಜಿಕ ನೆಟ್‌ವರ್ಕ್ & ಕ್ಲೈಂಟ್ಸ್"
    ],
    primaryKarakatwasEn: [
      "Continuous Inflow of Profits",
      "Fulfillment of Ambitions",
      "Elder Siblings & Mentors",
      "Vast Social Network & Influence"
    ],
    karakaPlanetKn: "ಗುರು (ಲಾಭಕಾರಕ)",
    naturalZodiacSignKn: "ಕುಂಭ (Aquarius)",
    naturalLordKn: "ಶನಿ (Saturn) & ರಾಹು",
    captainStatusKn: "೧೧ನೇ ಮನೆಯಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹವಿದ್ದರೂ (ಶುಭ ಅಥವಾ ಪಾಪಗ್ರಹ) ಅದು ಧನಲಾಭವನ್ನು ನೀಡುತ್ತದೆ! ಇದು ಕುಂಡಲಿಯ ಅತ್ಯಂತ ಲಾಭದಾಯಕ ಉಪಚಯ ಮನೆ.",
    slaveStatusKn: "೧೧ನೇ ಅಧಿಪತಿಯು ೬ ಅಥವಾ ೮ ರಲ್ಲಿದ್ದರೆ ಸ್ನೇಹಿತರಿಂದ ವಂಚನೆ ಮತ್ತು ಲಾಭಾಂಶದಲ್ಲಿ ಕಡಿತ ಉಂಟಾಗುತ್ತದೆ.",
    exaltedPlanetKn: "ಯಾವುದೇ ಗ್ರಹವಿಲ್ಲ (ರಾಹು ಬಲಿಷ್ಠ)",
    debilitatedPlanetKn: "ಯಾವುದೇ ಗ್ರಹವಿಲ್ಲ",
    ramanGoldenRulesKn: [
      "೧೧ನೇ ಮನೆಯಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹ ಕುಳಿತರೂ ಅದು ಕೆಟ್ಟ ಫಲ ನೀಡುವುದಿಲ್ಲ, ಧನಾಗಮನವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      "೨ನೇ ಮನೆ (ಠೇವಣಿ) ಮತ್ತು ೧೧ನೇ ಮನೆ (ಆದಾಯ) ಪರಸ್ಪರ ಸಂಬಂಧಿಸಿದರೆ ಅಪಾರ ಶ್ರೀಮಂತಿಕೆ.",
      "೧೧ನೇ ಅಧಿಪತಿ ಲಗ್ನದಲ್ಲಿದ್ದರೆ ಜಾತಕನು ಸ್ವಪ್ರಯತ್ನದಿಂದ ಮಹಾ ಶ್ರೀಮಂತನಾಗುತ್ತಾನೆ."
    ],
    keyDilemmasAnsweredKn: [
      "೧೧ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಅಥವಾ ರಾಹು ಇದ್ದರೆ ಲಾಭ ಹೆಚ್ಚುವುದೇ?",
      "ದೊಡ್ಡ ದೊಡ್ಡ ಆಸೆಗಳು ಈಡೇರಲು ೧೧ನೇ ಮನೆ ಹೇಗೆ ಸಹಕಾರಿ?",
      "ಸ್ನೇಹಿತರಿಂದ ಲಾಭ ಅಥವಾ ನಷ್ಟವಾಗುವುದನ್ನು ತಿಳಿಯುವುದು ಹೇಗೆ?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ೧೧ನೇ ಮನೆಯನ್ನು ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ 'ಸರ್ವಗ್ರಹ ಪ್ರಿಯ ಮನೆ' ಎನ್ನುತ್ತಾರಲ್ಲವೇ? ಇಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಿದ್ದರೂ ಒಳ್ಳೆಯದೇ?",
        textEn: "Acharyare, 11th house is universally cherished. Is it true that even natural malefics shower abundance in the 11th house?",
        emphasisTopic: "ಸರ್ವಗ್ರಹ ಲಾಭ ಸ್ಥಾನ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಹೌದು! ೧೧ನೇ ಮನೆಯು ಅಂತಿಮ ಉಪಚಯ ಸ್ಥಾನ. ಇಲ್ಲಿ ಶನಿ, ರಾಹು, ಕುಜ, ಸೂರ್ಯ, ಗುರು ಯಾರೇ ಇರಲಿ, ತಮ್ಮ ದಶಾಕಾಲದಲ್ಲಿ ಹಣದ ಹೊಳೆಯನ್ನೇ ಹರಿಸುತ್ತಾರೆ! ಇದು ಆಸೆಗಳ ಈಡೇರಿಕೆಯ ಮನೆ (Fulfillment of Desires). ೧೧ನೇ ಮನೆ ಬಲವಾಗಿದ್ದರೆ ಜೀವನದ ಪ್ರತಿಯೊಂದು ಗುರಿಯೂ ಸಿದ್ಧಿಸುತ್ತದೆ!",
        textEn: "Yes! 11th is the ultimate growth house. Saturn, Rahu, Mars, Jupiter all deliver massive cashflows during their dasas. It fulfills all cherished desires!",
        emphasisTopic: "ಆಸೆಗಳ ಸಿದ್ಧಿ"
      }
    ]
  },

  // ------------------------------------------------------------------------------------------------
  // EPISODE 12: 12th House - Vyaya & Moksha Bhava (ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ)
  // ------------------------------------------------------------------------------------------------
  {
    houseNumber: 12,
    houseNameKn: "೧೨ನೇ ಮನೆ - ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ",
    houseNameEn: "House 12: Vyaya & Moksha (Expenses, Foreign Lands & Liberation)",
    sanskritName: "ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ (Moksha Bhava)",
    icon: "🌌",
    taglineKn: "ಖರ್ಚು, ವಿದೇಶ ವಾಸ, ಆಸ್ಪತ್ರೆ, ದಾನ ಧರ್ಮ, ನಿದ್ರಾ ಸುಖ ಹಾಗೂ ಆತ್ಮ ಮೋಕ್ಷದ ಮಹಾಸಾಗರ",
    taglineEn: "Expenditure, Foreign Settlement, Spiritual Retreat, Sound Sleep & Final Liberation",
    primaryKarakatwasKn: [
      "ವಿದೇಶ ಪ್ರಯಾಣ & ವಿದೇಶ ನೆಲಸೆ",
      "ದಾನ, ಧರ್ಮ & ಶುಭ ಖರ್ಚುಗಳು",
      "ನಿದ್ರಾ ಸುಖ & ಏಕಾಂತ ಧ್ಯಾನ",
      "ಆಸ್ಪತ್ರೆ, ಬಂಧನ & ಮೋಕ್ಷ ಸಿದ್ಧಿ"
    ],
    primaryKarakatwasEn: [
      "Foreign Settlement & Cross-Border Trade",
      "Philanthropy & Divine Expenditures",
      "Peaceful Sleep & Deep Meditation",
      "Hospitalization, Seclusion & Moksha"
    ],
    karakaPlanetKn: "ಕೇತು (ಮೋಕ್ಷಕಾರಕ) & ಶುಕ್ರ (ಶಯನ ಸುಖ)",
    naturalZodiacSignKn: "ಮೀನ (Pisces)",
    naturalLordKn: "ಗುರು (Jupiter)",
    captainStatusKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ 'ಶುಕ್ರ ಭೋಗ ಯೋಗ'. ಜಾತಕನಿಗೆ ಅತ್ಯುತ್ತಮ ನಿದ್ರೆ, ಐಷಾರಾಮಿ ವಿದೇಶ ಪ್ರಯಾಣ ಮತ್ತು ದಾನಶೀಲತೆ ಲಭಿಸುತ್ತದೆ.",
    slaveStatusKn: "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ-ರಾಹು-ಕುಜ ಪೀಡೆ ಇದ್ದರೆ ನಿದ್ರಾಹೀನತೆ, ಆಸ್ಪತ್ರೆ ವೆಚ್ಚಗಳು ಮತ್ತು ಅಜ್ಞಾತ ಶತ್ರುಗಳ ಭಯ ಕಾಡುತ್ತದೆ.",
    exaltedPlanetKn: "ಶುಕ್ರ (ಮೀನದಲ್ಲಿ ಉಚ್ಚ)",
    debilitatedPlanetKn: "ಬುಧ (ಮೀನದಲ್ಲಿ ನೀಚ)",
    ramanGoldenRulesKn: [
      "೧೨ನೇ ಮನೆ ಕೇವಲ ನಷ್ಟವಲ್ಲ, ಇದು ಗಡಿ ದಾಟುವ ಮನೆ (ವಿದೇಶ ವಾಸ ಮತ್ತು ಗ್ಲೋಬಲ್ ಬಿಸಿನೆಸ್).",
      "೧೨ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು ಇದ್ದರೆ 'ಕೈವಲ್ಯ ಮೋಕ್ಷ ಯೋಗ' - ಜನ್ಮ-ಮರಣ ಚಕ್ರದಿಂದ ಮುಕ್ತಿ.",
      "೧೨ನೇ ಅಧಿಪತಿ ೬ ಅಥವಾ ೮ ರಲ್ಲಿದ್ದರೆ 'ವಿಮಲ ವಿಪರೀತ ರಾಜಯೋಗ' ಉಂಟಾಗಿ ಶತ್ರುನಾಶ ಮತ್ತು ಗೌಪ್ಯ ಧನಲಾಭ."
    ],
    keyDilemmasAnsweredKn: [
      "ವಿದೇಶದಲ್ಲಿ ನೆಲೆಸಲು (PR / Green Card) ೧೨ನೇ ಮನೆ ಹೇಗೆ ಸಹಕಾರಿ?",
      "ಅನಾವಶ್ಯಕ ಖರ್ಚುಗಳನ್ನು ಶುಭ ಖರ್ಚುಗಳನ್ನಾಗಿ ಬದಲಾಯಿಸುವುದು ಹೇಗೆ?",
      "ಮೋಕ್ಷ ಮತ್ತು ಧ್ಯಾನ ಸಿದ್ಧಿಗೆ ೧೨ನೇ ಮನೆಯ ಪಾತ್ರವೇನು?"
    ],
    dialogue: [
      {
        id: 1,
        speaker: "host_female",
        speakerNameKn: "ವಿದುಷಿ ಶ್ರುತಿ",
        speakerNameEn: "Vidushi Shruti",
        avatar: "👩‍🏫",
        textKn: "ಆಚಾರ್ಯರೇ, ನಮ್ಮ ಪೋಡ್‌ಕ್ಯಾಸ್ಟ್‌ನ ಅಂತಿಮ ಮನೆ - ೧೨ನೇ ಮನೆ. ಇದನ್ನು 'ವ್ಯಯ ಮನೆ' ಎನ್ನುತ್ತಾರೆ. ಆದರೆ ವಿದೇಶ ವಾಸ, ಗ್ಲೋಬಲ್ ಐಟಿ ಉದ್ಯೋಗ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಮೋಕ್ಷಕ್ಕೆ ೧೨ನೇ ಮನೆಯೇ ಪರಮ ಶ್ರೇಷ್ಠ ಎನ್ನುತ್ತಾರಲ್ಲವೇ?",
        textEn: "Acharyare, the final 12th house is known as the house of expenditure. Yet for foreign settlement, global trade, and spiritual Moksha, it reigns supreme. How should we view it?",
        emphasisTopic: "೧೨ನೇ ಮನೆಯ ದಿವ್ಯತ್ವ"
      },
      {
        id: 2,
        speaker: "scholar_male",
        speakerNameKn: "ವಿದ್ವಾನ್ ಕೌಶಿಕ್",
        speakerNameEn: "Vidwan Kaushik",
        avatar: "👨‍🎓",
        textKn: "ಬಹಳ ಸುಂದರವಾದ ಮುಕ್ತಾಯ ಶ್ರುತಿಯವರೇ! ೧೨ನೇ ಮನೆಯೆಂದರೆ 'ಸೀಮಾ ರಹಿತ ತತ್ವ' (Boundless Horizon). ಇಲ್ಲಿ ಶುಕ್ರನಿದ್ದರೆ ರಾಜಭೋಗ ಮತ್ತು ಸುಖ ನಿದ್ರೆ; ಕೇತು ಇದ್ದರೆ ಪರಮ ಮೋಕ್ಷ; ರಾಹುವಿದ್ದರೆ ವಿದೇಶದಲ್ಲಿ ಕೋಟ್ಯಂತರ ಡಾಲರ್ ಗಳಿಕೆ! ಹಣವನ್ನು ದೇವಸ್ಥಾನ, ಸಮಾಜ ಸೇವೆಗೆ ಖರ್ಚು ಮಾಡಿದರೆ ವ್ಯಯ ದೋಷವು ಪುಣ್ಯವಾಗಿ ಪರಿವರ್ತನೆಯಾಗುತ್ತದೆ!",
        textEn: "A magnificent conclusion! 12th house represents boundless horizons. Venus here grants peaceful slumber; Ketu grants Moksha; Rahu brings foreign millions. Channeling funds into temple Seva transforms loss into eternal Punya!",
        emphasisTopic: "ಮೋಕ್ಷ & ಪರಿವರ್ತನೆ"
      }
    ]
  }
];

/**
 * Helper to fetch episode by House Number (1 to 12)
 */
export function getPodcastEpisode(houseNumber: number): PhalaJyotishyaEpisode {
  const found = PHALA_JYOTISHYA_EPISODES.find((e) => e.houseNumber === houseNumber);
  return found || PHALA_JYOTISHYA_EPISODES[0];
}
