/**
 * Classical Vedic Samudrika Shastra (Hastarekha) Comprehensive Knowledge Base.
 * 
 * Sourced from classical texts:
 * - Samudrika Shastra & Hastapada Lakshana
 * - Bhavishya Purana (Samudrika Kanda)
 * - Cheiro & St. Germain Vedic Corroborations
 * - Dr. B. V. Raman's Samudrika Astro-Palmistry Correlations
 */

export interface LineTopologyRule {
  key: string;
  nameKn: string;
  nameEn: string;
  rulerPlanet: string;
  primaryBhava: number[];
  descriptions: Record<string, { status: string; indication: string }>;
}

export const VEDIC_MAJOR_LINES_RULES: Record<string, LineTopologyRule> = {
  lifeLine: {
    key: "lifeLine",
    nameKn: "ಆಯುಷ್ಯ ರೇಖೆ (ಗೋತ್ರ / ಪಿತೃ ರೇಖೆ)",
    nameEn: "Life Line (Ayur Rekha)",
    rulerPlanet: "Sun / Venus",
    primaryBhava: [1, 8],
    descriptions: {
      deep_and_long: {
        status: "ದೀರ್ಘ, ಆಳವಾದ ಹಾಗೂ ಅವಿಚ್ಛಿನ್ನ ರೇಖೆ",
        indication: "ಅತ್ಯುತ್ತಮ ಪ್ರಾಣಶಕ್ತಿ, ದೀರ್ಘಾಯುಷ್ಯ (೮೦+ ವರ್ಷ), ಸದೃಢ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ಹಾಗೂ ರೋಗ ನಿರೋಧಕ ಬಲ."
      },
      wide_venus_sweep: {
        status: "ಶುಕ್ರ ಪರ್ವತವನ್ನು ವಿಶಾಲವಾಗಿ ಆವರಿಸಿದ ರೇಖೆ",
        indication: "ಅಪಾರ ಜೀವನೋತ್ಸಾಹ, ಸಮಾಜ ಪ್ರಿಯತೆ, ದಯಾಪರತೆ, ವಾಹನ-ಗೃಹ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಭೋಗ ಭಾಗ್ಯಗಳ ಪ್ರಾಪ್ತಿ."
      },
      jupiter_branch: {
        status: "ಗುರು ಪರ್ವತದತ್ತ ಚಿಮ್ಮುವ ಊರ್ಧ್ವಮುಖ ಶಾಖೆ",
        indication: "ಪ್ರಾರಂಭಿಕ ವಯಸ್ಸಿನಲ್ಲಿಯೇ (೧೮-೨೪) ಉನ್ನತ ಆಕಾಂಕ್ಷೆ, ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಪದವಿ ಹಾಗೂ ಕೀರ್ತಿಯೋಗ."
      },
      forked_base: {
        status: "ಮಣಿಬಂಧದ ಬಳಿ ತ್ರಿಶೂಲ ಅಥವಾ ದ್ವಿಮುಖ ಕವಲು",
        indication: "ವಿದೇಶ ಪ್ರಯಾಣ ಯೋಗ, ಜನ್ಮಸ್ಥಳದಿಂದ ದೂರದಲ್ಲಿ ಭಾಗ್ಯೋದಯ ಹಾಗೂ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಅಪಾರ ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ."
      }
    }
  },

  headLine: {
    key: "headLine",
    nameKn: "ಮಸ್ತಿಷ್ಕ ರೇಖೆ (ಬುದ್ಧಿ / ಮಾತೃ ರೇಖೆ)",
    nameEn: "Head Line (Buddhi Rekha)",
    rulerPlanet: "Mercury / Moon",
    primaryBhava: [5, 9],
    descriptions: {
      straight_upper_mars: {
        status: "ನೇರವಾಗಿ ಉನ್ನತ ಕುಜ ಪರ್ವತ ತಲುಪುವ ರೇಖೆ",
        indication: "ಪ್ರಾಯೋಗಿಕ, ಗಣಿತೀಯ, ತಾರ್ಕಿಕ ಹಾಗೂ ವೈಜ್ಞಾನಿಕ ಆಲೋಚನಾ ಶಕ್ತಿ. ವ್ಯವಹಾರ ಹಾಗೂ ಆಡಳಿತದಲ್ಲಿ ಅದ್ಭುತ ಯಶಸ್ಸು."
      },
      sloping_moon: {
        status: "ಚಂದ್ರ ಪರ್ವತದತ್ತ ಲಾಸ್ಯವಾಗಿ ಇಳಿಯುವ ರೇಖೆ",
        indication: "ಅದ್ಭುತ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಕಲೆ, ಸಾಹಿತ್ಯ, ಸಂಶೋಧನೆ ಹಾಗೂ ದೈವಿಕ ಅಂತಃಸ್ಫೂರ್ತಿಯ (Intuition) ಪ್ರಾಪ್ತಿ."
      },
      writers_fork: {
        status: "ಕೊನೆಯಲ್ಲಿ ದ್ವಿಮುಖ ಕವಲು (ರೈಟರ್ಸ್ ಫೋರ್ಕ್)",
        indication: "ಬುದ್ಧಿ ಚಾತುರ್ಯ ಹಾಗೂ ಸಾಹಿತ್ಯ-ವ್ಯವಹಾರ ಸಮನ್ವಯ. ಜಟಿಲ ಸಮಸ್ಯೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಪರಿಹರಿಸುವ ಚಾಣಾಕ್ಷತೆ."
      }
    }
  },

  heartLine: {
    key: "heartLine",
    nameKn: "ಹೃದಯ ರೇಖೆ (ಆಯುಷ್ಮಾನ್ / ಪ್ರೇಮ ರೇಖೆ)",
    nameEn: "Heart Line (Hridaya Rekha)",
    rulerPlanet: "Jupiter / Venus",
    primaryBhava: [4, 7],
    descriptions: {
      reaches_jupiter: {
        status: "ಗುರು ಪರ್ವತದ ಮಧ್ಯಭಾಗವನ್ನು ತಲುಪಿದ ಸಾತ್ವಿಕ ರೇಖೆ",
        indication: "ಪವಿತ್ರ ಭಾವನೆ, ಆದರ್ಶ ಪ್ರೇಮ, ಸತ್ಯನಿಷ್ಠೆ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಪಾರ ನಿಷ್ಠೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಸಜ್ಜನ ಗೌರವ."
      },
      between_jupiter_saturn: {
        status: "ಗುರು ಹಾಗೂ ಶನಿ ಬೆರಳುಗಳ ಮಧ್ಯೆ ಪ್ರವೇಶಿಸುವ ರೇಖೆ",
        indication: "ಭಾವನೆ ಹಾಗೂ ಪ್ರಾಯೋಗಿಕತೆಯ ಸಮತೋಲನ. ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಧರ್ಮನಿಷ್ಠೆಯಿಂದ ನಿರ್ವಹಿಸುವ ಯೋಗ."
      },
      trishula_ending: {
        status: "ಗುರು ಪರ್ವತದ ಮೇಲೆ ತ್ರಿಶೂಲಾಕಾರದಲ್ಲಿ ಸಮಾಪ್ತಿ",
        indication: "ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಯೋಗ. ಅಪಾರ ಸಂಪತ್ತು, ಸುಖಿ ದಾಂಪತ್ಯ, ಕೀರ್ತಿ ಹಾಗೂ ಶಿವ-ಪಾರ್ವತಿಯರ ಸದಾ ರಕ್ಷಣೆ."
      }
    }
  },

  fateLine: {
    key: "fateLine",
    nameKn: "ಭಾಗ್ಯ ರೇಖೆ (ಶನಿ / ಊರ್ಧ್ವ ರೇಖೆ)",
    nameEn: "Fate Line (Bhagya Rekha)",
    rulerPlanet: "Saturn",
    primaryBhava: [9, 10, 11],
    descriptions: {
      from_wrist_to_saturn: {
        status: "ಮಣಿಬಂಧದಿಂದ ನೇರವಾಗಿ ಶನಿ ಪರ್ವತ ತಲುಪುವ ಸ್ಪಷ್ಟ ರೇಖೆ",
        indication: "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ನಿರ್ಮಾಣವಾಗುವ ದೃಢ ಭಾಗ್ಯ, ನಿರಂತರ ಉದ್ಯೋಗ ಪ್ರಗತಿ ಹಾಗೂ ಸ್ಥಿರ ಆಸ್ತಿ ಪ್ರಾಪ್ತಿ."
      },
      from_moon_mount: {
        status: "ಚಂದ್ರ ಪರ್ವತದಿಂದ ಉದಯಿಸಿ ಶನಿ ಪರ್ವತದತ್ತ ಸಾಗುವ ರೇಖೆ",
        indication: "ಜನಪ್ರಿಯತೆ, ಸಾರ್ವಜನಿಕರ ಸಹಕಾರ, ವಿದೇಶದಲ್ಲಿ ಅಥವಾ ಗ್ರಾಹಕ ಸಂಪರ್ಕದ ವ್ಯವಹಾರದಲ್ಲಿ ಅದ್ಭುತ ಧನಲಾಭ."
      },
      breaks_at_head: {
        status: "ಮಸ್ತಿಷ್ಕ ರೇಖೆಯ ಬಳಿ (೩೫ನೇ ವಯಸ್ಸಿನಲ್ಲಿ) ದಿಕ್ಕು ಬದಲಾವಣೆ",
        indication: "೩೫ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಉದ್ಯೋಗ ಅಥವಾ ಜೀವನಶೈಲಿಯಲ್ಲಿ ಮಹತ್ತರ ತಿರುವು ಹಾಗೂ ನಂತರ ಹೊಸ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ."
      }
    }
  },

  sunLine: {
    key: "sunLine",
    nameKn: "ಸೂರ್ಯ ರೇಖೆ (ವಿದ್ಯಾ & ಕೀರ್ತಿ ರೇಖೆ)",
    nameEn: "Sun Line (Surya Rekha)",
    rulerPlanet: "Sun",
    primaryBhava: [5, 10],
    descriptions: {
      clear_on_sun_mount: {
        status: "ಸೂರ್ಯ ಪರ್ವತದ ಮೇಲೆ ದೀಪ್ತವಾಗಿ ಉದಯಿಸಿದ ರೇಖೆ",
        indication: "ಸಮಾಜದಲ್ಲಿ ಪ್ರತಿಷ್ಠೆ, ರಾಜ ಸನ್ಮಾನ, ಉನ್ನತ ಪದವಿ ಹಾಗೂ ಕಲಾ-ವಿಜ್ಞಾನ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಾಶ್ವತ ಕೀರ್ತಿ."
      }
    }
  }
};

export const VEDIC_MOUNTS_RULES: Record<string, { nameKn: string; nameEn: string; planet: string; virtuesKn: string }> = {
  jupiter: {
    nameKn: "ಗುರು ಪರ್ವತ (Mount of Jupiter)",
    nameEn: "Mount of Jupiter (Guru)",
    planet: "Jupiter",
    virtuesKn: "ಜ್ಞಾನ, ನಾಯಕತ್ವ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಪರಮೋಚ್ಚ ಗೌರವ."
  },
  saturn: {
    nameKn: "ಶನಿ ಪರ್ವತ (Mount of Saturn)",
    nameEn: "Mount of Saturn (Shani)",
    planet: "Saturn",
    virtuesKn: "ತತ್ತ್ವಚಿಂತನೆ, ಗೂಢ ಸಂಶೋಧನೆ, ತಾಳ್ಮೆ ಹಾಗೂ ಸ್ಥಿರ ಆರ್ಥಿಕ ಭದ್ರತೆ."
  },
  sun: {
    nameKn: "ಸೂರ್ಯ ಪರ್ವತ (Mount of Sun)",
    nameEn: "Mount of Sun (Surya)",
    planet: "Sun",
    virtuesKn: "ತೇಜಸ್ಸು, ಕೀರ್ತಿ, ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ ಹಾಗೂ ಸರ್ಕಾರಿ/ಉನ್ನತಾಧಿಕಾರಿಗಳ ಕೃಪೆ."
  },
  mercury: {
    nameKn: "ಬುಧ ಪರ್ವತ (Mount of Mercury)",
    nameEn: "Mount of Mercury (Budha)",
    planet: "Mercury",
    virtuesKn: "ಚುರುಕಾದ ಬುದ್ಧಿ, ವಾಣಿಜ್ಯ ಕೌಶಲ, ವಾಗ್ಝರಿ ಹಾಗೂ ವಿವಾಹ-ಸಂತಾನ ಸೌಭಾಗ್ಯ."
  },
  venus: {
    nameKn: "ಶುಕ್ರ ಪರ್ವತ (Mount of Venus)",
    nameEn: "Mount of Venus (Shukra)",
    planet: "Venus",
    virtuesKn: "ಕಾಂತಿಯುತ ವ್ಯಕ್ತಿತ್ವ, ವಾಹನ ಸುಖ, ಕಲಾ ಪ್ರೇಮ ಹಾಗೂ ಸುಖಮಯ ಜೀವನ."
  },
  moon: {
    nameKn: "ಚಂದ್ರ ಪರ್ವತ (Mount of Moon)",
    nameEn: "Mount of Moon (Chandra)",
    planet: "Moon",
    virtuesKn: "ಕಲ್ಪನಾ ಶಕ್ತಿ, ಜಲ ಪ್ರವಾಸ, ವಿದೇಶ ಯೋಗ ಹಾಗೂ ಅಂತಃಸ್ಫೂರ್ತಿ."
  }
};

export const VEDIC_SACRED_MARKS: Record<string, { symbol: string; nameKn: string; nameEn: string; meaningKn: string; meaningEn: string }> = {
  matsya: {
    symbol: "🐟",
    nameKn: "ಮತ್ಸ್ಯ ಚಿಹ್ನೆ (Fish Sign)",
    nameEn: "Matsya (Fish Sign)",
    meaningKn: "ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ವಿದೇಶದಲ್ಲಿ ವಿಜಯ ಹಾಗೂ ಮೋಕ್ಷ ಸಾಧನೆಯ ಅತ್ಯುನ್ನತ ಯೋಗ.",
    meaningEn: "Sudden unexpected wealth, high spiritual elevation, and foreign prosperity."
  },
  trishula: {
    symbol: "🔱",
    nameKn: "ತ್ರಿಶೂಲ ಚಿಹ್ನೆ (Trishula Sign)",
    nameEn: "Trishula (Trident Sign)",
    meaningKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸಾಕ್ಷಾತ್ ರಕ್ಷಣೆ, ರಾಜಯೋಗ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ.",
    meaningEn: "Supreme Shivic protection, authority, and divine victory in all endeavors."
  },
  padma: {
    symbol: "🪷",
    nameKn: "ಪದ್ಮ ಚಿಹ್ನೆ (Lotus Sign)",
    nameEn: "Padma (Lotus Sign)",
    meaningKn: "ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪೆ, ಪವಿತ್ರ ಜೀವನ ಹಾಗೂ ಸಮಾಜ ಕಲ್ಯಾಣಕಾರಿ ಸಂಪತ್ತು.",
    meaningEn: "Divine Lakshmi blessing, noble character, and philanthropic fortune."
  },
  trikona: {
    symbol: "🔺",
    nameKn: "ತ್ರಿಕೋನ ಚಿಹ್ನೆ (Triangle Sign)",
    nameEn: "Trikona (Triangle Sign)",
    meaningKn: "ಆಸ್ತಿ ಖರೀದಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸಂಶೋಧನಾ ಬುದ್ಧಿವಂತಿಕೆ.",
    meaningEn: "Real estate accumulation, sharp financial intellect, and mental stability."
  },
  chatushkona: {
    symbol: "🔲",
    nameKn: "ಚತುಷ್ಕೋನ ರಕ್ಷಾ ಕವಚ (Square Sign)",
    nameEn: "Chatushkona (Protective Square)",
    meaningKn: "ಆರೋಗ್ಯ ಸಂಕಷ್ಟಗಳು ಹಾಗೂ ಆರ್ಥಿಕ ನಷ್ಟಗಳಿಂದ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ.",
    meaningEn: "Divine shield protecting against health crises, enemies, and financial losses."
  }
};
