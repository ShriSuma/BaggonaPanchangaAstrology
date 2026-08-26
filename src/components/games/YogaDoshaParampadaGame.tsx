import React, { useState, useEffect, useRef } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";

export type ParampadaPlayer = {
  id: number;
  name: string;
  avatarSymbol: string;
  avatarNameKn: string;
  avatarNameEn: string;
  luckyNumber: number; // 1 to 6
  colorBg: string;
  colorBorder: string;
  position: number; // 1 to 100
  luckyRollsCount: number;
  yogasClimbed: number;
  doshasFaced: number;
};

export type YogaLadder = {
  from: number;
  to: number;
  nameKn: string;
  nameEn: string;
  icon: string;
  shlokaKn: string;
  shlokaEn: string;
  meaningKn: string;
  meaningEn: string;
  gurujiVerdictKn: string;
  gurujiVerdictEn: string;
};

export type DoshaSnake = {
  from: number;
  to: number;
  nameKn: string;
  nameEn: string;
  icon: string;
  shlokaKn: string;
  shlokaEn: string;
  meaningKn: string;
  meaningEn: string;
  gurujiVerdictKn: string;
  gurujiVerdictEn: string;
};

// 9 Divine Yogas (Ladders - Going UP)
export const VEDIC_YOGAS: Record<number, YogaLadder> = {
  4: {
    from: 4,
    to: 25,
    nameKn: "ಗಜಕೇಸರಿ ರಾಜಯೋಗ (+21)",
    nameEn: "Gaja Kesari Raja Yoga (+21)",
    icon: "🐘",
    shlokaKn: "ಕೇಂದ್ರಸ್ಥಿತೇ ದೇವಗುರೌ ಮೃಗಾಂಕಾತ್...",
    shlokaEn: "Jupiter in Kendra from Moon grants wisdom & royal stature.",
    meaningKn: "ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿ ಗುರುವಿದ್ದಾಗ ಗಜಕೇಸರಿ ಯೋಗ ಉಂಟಾಗಿ ಆನೆ-ಸಿಂಹದಂತಹ ಅಪ್ರತಿಮ ಗೌರವ ಮತ್ತು ಜ್ಞಾನ ಲಭಿಸುತ್ತದೆ.",
    meaningEn: "Forms when Jupiter is in Kendra from Moon, conferring royal prestige, intelligence, and high status.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಗಜಕೇಸರಿ ಯೋಗವು ವ್ಯಕ್ತಿಯನ್ನು ಸಮಾಜದಲ್ಲಿ ಧ್ರುವತಾರೆಯಂತೆ ಬೆಳಗಿಸುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Gaja Kesari elevates the native to prominence, wisdom, and leadership.'"
  },
  9: {
    from: 9,
    to: 31,
    nameKn: "ಬುಧಾದಿತ್ಯ ಮಹಾ ಯೋಗ (+22)",
    nameEn: "Budhaditya Supreme Yoga (+22)",
    icon: "💎",
    shlokaKn: "ಸೂರ್ಯ-ಬುಧ ಸಂಯೋಗಾತ್ ವಿದ್ವತ್ಪ್ರಭಾ...",
    shlokaEn: "Sun and Mercury conjunction creates scholarly brilliance.",
    meaningKn: "ಸೂರ್ಯ ಮತ್ತು ಬುಧ ಒಟ್ಟಿಗೆ ಸೇರಿದಾಗ ತೀಕ್ಷ್ಣ ಗಣಿತ, ವಿಜ್ಞಾನ ಹಾಗೂ ರಾಜತಾಂತ್ರಿಕ ಚತುರತೆ ಲಭಿಸುತ್ತದೆ.",
    meaningEn: "Sun-Mercury union confers razor-sharp analytics, mathematics mastery, and administrative acumen.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಬುಧಾದಿತ್ಯ ಯೋಗವಿರುವಲ್ಲಿ ಸರಸ್ವತಿಯ ಪರಿಪೂರ್ಣ ಅನುಗ್ರಹವಿರುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Budhaditya grants academic and administrative honors.'"
  },
  17: {
    from: 17,
    to: 46,
    nameKn: "ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ (+29)",
    nameEn: "Malavya Mahapurusha Yoga (+29)",
    icon: "💖",
    shlokaKn: "ಕೇಂದ್ರೇ ಸ್ವಕ್ಷೇತ್ರೇ ಶುಕ್ರಃ ಮಾಲವ್ಯಯೋಗಃ...",
    shlokaEn: "Venus exalted in Kendra bestows artistic & aesthetic glory.",
    meaningKn: "ಶುಕ್ರನು ಕೇಂದ್ರದಲ್ಲಿ ಸ್ವಕ್ಷೇತ್ರ ಅಥವಾ ಉಚ್ಚನಾಗಿದ್ದರೆ ಅರಮನೆಯಂತಹ ಸುಖ, ವಾಹನ ಹಾಗೂ ಕಲಾ ಸೌಂದರ್ಯ ಪ್ರಾಪ್ತಿ.",
    meaningEn: "Venus in own or exalted sign in Kendra confers palatial properties, luxury conveyances, and artistic fame.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಮಾಲವ್ಯ ಯೋಗವು ಸಕಲ ಭೋಗಭಾಗ್ಯ ಹಾಗೂ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಕರುಣಿಸುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Malavya Yoga blesses the native with opulence, romance, and artistic genius.'"
  },
  28: {
    from: 28,
    to: 54,
    nameKn: "ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ಯೋಗ (+26)",
    nameEn: "Dharma-Karmadhipati Raja Yoga (+26)",
    icon: "👑",
    shlokaKn: "ಭಾಗ್ಯೇಶ-ಕರ್ಮೇಶ ಸಂಯೋಗೇ ರಾಜಯೋಗಃ...",
    shlokaEn: "Union of 9th (Dharma) & 10th (Karma) lords produces highest Raja Yoga.",
    meaningKn: "೯ನೇ (ಧರ್ಮ) ಮತ್ತು ೧೦ನೇ (ಕರ್ಮ) ಅಧಿಪತಿಗಳು ಒಂದಾದಾಗ ಸಮಾಜದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಆಡಳಿತ ಅಧಿಕಾರ ಮತ್ತು ಕೀರ್ತಿ ಲಭಿಸುತ್ತದೆ.",
    meaningEn: "Conjunction of 9th and 10th house lords confers the highest status, civic leadership, and historical fame.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಧರ್ಮ ಮತ್ತು ಕರ್ಮ ಸೇರಿದಾಗ ವ್ಯಕ್ತಿಯು ಆದರ್ಶ ರಾಜನಂತೆ ಸಮಾಜವನ್ನು ಮುನ್ನಡೆಸುತ್ತಾನೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'The pinnacle of Raja Yogas, bestowing executive leadership and righteousness.'"
  },
  36: {
    from: 36,
    to: 67,
    nameKn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ (+31)",
    nameEn: "Hamsa Mahapurusha Yoga (+31)",
    icon: "🌟",
    shlokaKn: "ಕೇಂದ್ರೇ ಗುರುಃ ಉಚ್ಚಸ್ಥಃ ಹಂಸಯೋಗಃ...",
    shlokaEn: "Jupiter exalted in Cancer in Kendra creates saintly wisdom.",
    meaningKn: "ಗುರುವು ಕೇಂದ್ರದಲ್ಲಿ ಉಚ್ಚನಾಗಿದ್ದರೆ (ಕರ್ಕಾಟಕ) ಸಂತರಂತಹ ಪಾವಿತ್ರ್ಯ, ದಾನಶೀಲತೆ ಹಾಗೂ ದೈವಜ್ಞಾನ ದೊರೆಯುತ್ತದೆ.",
    meaningEn: "Jupiter exalted in Kendra bestows saintly virtues, spiritual wisdom, philanthropic wealth, and longevity.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಹಂಸ ಯೋಗವಿರುವ ವ್ಯಕ್ತಿಯು ಜಗತ್ತಿಗೆ ಮಾರ್ಗದರ್ಶಕ ಗುರುವಾಗುತ್ತಾನೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Hamsa Yoga creates visionary spiritual guides and noble philosophers.'"
  },
  51: {
    from: 51,
    to: 72,
    nameKn: "ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ (+21)",
    nameEn: "Ruchaka Mahapurusha Yoga (+21)",
    icon: "⚔️",
    shlokaKn: "ಕುಜೇ ಕೇಂದ್ರಗತೇ ತುಂಗೇ ರುಚಕಯೋಗಃ...",
    shlokaEn: "Mars exalted in Kendra bestows heroic courage & military rank.",
    meaningKn: "ಮಂಗಳನು ಕೇಂದ್ರದಲ್ಲಿ ಉಚ್ಚನಾಗಿದ್ದರೆ (ಮಕರ) ಅಪ್ರತಿಮ ಸೇನಾಧಿಪತ್ಯ, ಕ್ರೀಡಾ ಶೌರ್ಯ ಹಾಗೂ ಭೂಲಾಭ ದೊರೆಯುತ್ತದೆ.",
    meaningEn: "Exalted Mars in Kendra creates fearless valour, high military/defense rank, and athletic triumph.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ರುಚಕ ಯೋಗವು ಶತ್ರುಗಳನ್ನು ಸದೆಬಡಿದು ಅಪ್ರತಿಮ ವಿಜಯವನ್ನು ನೀಡುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Ruchaka imparts unconquerable courage and executive mastery.'"
  },
  63: {
    from: 63,
    to: 85,
    nameKn: "ಮಹಾ ಲಕ್ಷ್ಮೀ ಮಹಾ ಯೋಗ (+22)",
    nameEn: "Maha Lakshmi Divine Yoga (+22)",
    icon: "🪷",
    shlokaKn: "ಶುಕ್ರ-ಭಾಗ್ಯೇಶ ದೃಷ್ಟ್ಯಾ ಸಕಲೈಶ್ವರ್ಯ ಸಿದ್ಧಿಃ...",
    shlokaEn: "Grace of Lakshmi bestows inexhaustible prosperity.",
    meaningKn: "ಶುಕ್ರ ಹಾಗೂ ೯ನೇ ಅಧಿಪತಿಯ ಶುಭ ಸಂಯೋಗದಿಂದ ಅಕ್ಷಯ ಐಶ್ವರ್ಯ, ಚಿನ್ನ-ಬೆಳ್ಳಿ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
    meaningEn: "Auspicious alignment of Venus and the 9th lord ensures inexhaustible prosperity and gold.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಮಹಾ ಲಕ್ಷ್ಮೀ ಯೋಗವಿರುವ ಮನೆಯಲ್ಲಿ ಸದಾ ಅನ್ನಪೂರ್ಣೇಶ್ವರಿ ನೆಲೆಸಿರುತ್ತಾಳೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Maha Lakshmi Yoga brings perennial financial abundance and generosity.'"
  },
  71: {
    from: 71,
    to: 92,
    nameKn: "ಸಸ ಮಹಾಪುರುಷ ಯೋಗ (+21)",
    nameEn: "Sasa Mahapurusha Yoga (+21)",
    icon: "🪐",
    shlokaKn: "ಕೇಂದ್ರೇ ಶನಿಃ ಉಚ್ಚಸ್ಥಃ ಸಸಯೋಗಃ ಪ್ರಕೀರ್ತಿತಃ...",
    shlokaEn: "Saturn exalted in Libra in Kendra bestows enduring justice & empire.",
    meaningKn: "ಶನಿಯು ಕೇಂದ್ರದಲ್ಲಿ ತುಲಾ ರಾಶಿಯಲ್ಲಿ ಉಚ್ಚನಾಗಿದ್ದರೆ ಅಚಲ ಶಿಸ್ತು, ನ್ಯಾಯಾಧೀಶ ಪದವಿ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ.",
    meaningEn: "Saturn exalted in Libra forms Sasa Yoga, granting judicial authority, enduring wealth, and disciplined leadership.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಸಸ ಯೋಗವು ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ಸಿಗುವ ಪರಮೋನ್ನತ ಫಲವಾಗಿದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Sasa Yoga creates legendary judges, industrial founders, and statesmen.'"
  },
  80: {
    from: 80,
    to: 99,
    nameKn: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಮೋಕ್ಷ ಯೋಗ (+19)",
    nameEn: "Gokarna Atmalinga Moksha Gateway (+19)",
    icon: "🕉️",
    shlokaKn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧೌ ಮುಕ್ತಿ ಪ್ರದಾಯಕಃ...",
    shlokaEn: "Sacred darshan of Gokarna Atmalinga dissolves all karma.",
    meaningKn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ ದರ್ಶನದಿಂದ ಸಕಲ ಕರ್ಮಗಳು ಕರಗಿ ನೇರವಾಗಿ ಮೋಕ್ಷದ ಸನಿಹಕ್ಕೆ ಒಯ್ಯುತ್ತದೆ.",
    meaningEn: "Sacred darshana of Gokarna Mahabaleshwara Atmalinga dissolves karmic cycles and elevates straight to Moksha.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಆತ್ಮಲಿಂಗದ ಸ್ಪರ್ಶದಿಂದ ಜಾತಕನ ಸಕಲ ಪಾಪಗಳು ಕರಗಿ ಶಾಶ್ವತ ಮುಕ್ತಿ ಲಭಿಸುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Atmalinga darshana unlocks ultimate peace and liberation.'"
  }
};

// 7 Astrological Doshas (Snakes - Going DOWN)
export const VEDIC_DOSHAS: Record<number, DoshaSnake> = {
  32: {
    from: 32,
    to: 10,
    nameKn: "ಕುಜ / ಅಂಗಾರಕ ದೋಷ (-22)",
    nameEn: "Kuja / Manglik Dosha (-22)",
    icon: "🔥",
    shlokaKn: "ಧನೇ ವ್ಯಯೇ ಚ ಪಾತಾಳೇ ಜಾಮಿತ್ರೇ ಚಾಷ್ಟಮೇ ಕುಜೇ...",
    shlokaEn: "Mars in sensitive houses causes friction and tests patience.",
    meaningKn: "ಮಂಗಳನು ೨, ೪, ೭, ೮, ೧೨ನೇ ಮನೆಯಲ್ಲಿದ್ದಾಗ ದಾಂಪತ್ಯ ಮತ್ತು ಸಹಭಾಗಿತ್ವದಲ್ಲಿ ತಾಳ್ಮೆಯ ಕಠಿಣ ಪರೀಕ್ಷೆ ಎದುರಾಗುತ್ತದೆ.",
    meaningEn: "Afflicted Mars placement tests patience and requires calm diplomacy in relationships.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಶಾಂತತೆಯಿಂದ ಕುಜ ದೋಷ ಶಾಂತಿಯಾಗುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Lord Subrahmanya devotion and patient speech balance Kuja dosha.'"
  },
  48: {
    from: 48,
    to: 16,
    nameKn: "ಕಾಳಸರ್ಪ ದೋಷ (-32)",
    nameEn: "Kala Sarpa Dosha (-32)",
    icon: "🌪️",
    shlokaKn: "ಅಗ್ರೇ ರಾಹುಃ ಪೃಷ್ಠೇ ಕೇತುಃ ಸರ್ವೇ ಗ್ರಹಾ ಮಧ್ಯಗತಾಃ...",
    shlokaEn: "All planets trapped between Rahu and Ketu cause temporary hurdles.",
    meaningKn: "ಎಲ್ಲಾ ಗ್ರಹಗಳು ರಾಹು-ಕೇತುಗಳ ಮಧ್ಯೆ ಸಿಲುಕಿದಾಗ ಆರಂಭಿಕ ಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ವಿಳಂಬ ಉಂಟಾಗುತ್ತದೆ.",
    meaningEn: "Planets hemmed between Rahu and Ketu create sudden obstacles before granting transformative spiritual awakening.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಕಾಳಸರ್ಪ ದೋಷವು ವ್ಯಕ್ತಿಯನ್ನು ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಪುಟವಿಟ್ಟ ಚಿನ್ನದಂತೆ ಮಾಡುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Kala Sarpa purifies through trials, forging unstoppable character.'"
  },
  62: {
    from: 62,
    to: 23,
    nameKn: "ರಾಹು-ಚಂದ್ರ ಗ್ರಹಣ ದೋಷ (-39)",
    nameEn: "Rahu-Chandra Grahana Dosha (-39)",
    icon: "🌑",
    shlokaKn: "ರಾಹುಣಾ ಗ್ರಸ್ತೇ ಚಂದ್ರೇ ಮನಸ್ತಾಪಃ...",
    shlokaEn: "Eclipse of Moon by Rahu causes temporary mental fog.",
    meaningKn: "ಚಂದ್ರನೊಂದಿಗೆ ರಾಹು ಸಂಯೋಗವಾದಾಗ ಮನಸ್ಸಿನಲ್ಲಿ ಅನಗತ್ಯ ಗೊಂದಲ, ಭಯ ಹಾಗೂ ಭ್ರಮೆ ಉಂಟಾಗಿ ಹಿನ್ನಡೆಯಾಗುತ್ತದೆ.",
    meaningEn: "Affliction of Moon by Rahu creates mental overthinking, illusion, and temporary setbacks.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಓಂ ನಮಃ ಶಿವಾಯ ಜಪ ಹಾಗೂ ಚಂದ್ರ ದರ್ಶನದಿಂದ ಮನಸ್ಸು ಪ್ರಶಾಂತವಾಗುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Maha Mrityunjaya mantra restores emotional clarity.'"
  },
  74: {
    from: 74,
    to: 35,
    nameKn: "ಗುರು ಚಂಡಾಲ ದೋಷ (-39)",
    nameEn: "Guru Chandala Dosha (-39)",
    icon: "⚠️",
    shlokaKn: "ಗುರು-ರಾಹು ಸಂಯೋಗಾತ್ ಧರ್ಮ ಭ್ರಷ್ಟತಾ...",
    shlokaEn: "Jupiter afflicting with Rahu demands adherence to dharma.",
    meaningKn: "ಗುರು ಮತ್ತು ರಾಹು ಒಂದಾದಾಗ ಅತಿಯಾದ ಭೌತಿಕ ಆಸೆಯಿಂದ ಧರ್ಮ ಮಾರ್ಗ ತಪ್ಪುವ ಅಪಾಯವಿರುತ್ತದೆ.",
    meaningEn: "Jupiter conjunct Rahu tests moral righteousness and requires spiritual discernment.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಸದ್ಗುರುಗಳ ಸೇವೆ ಮತ್ತು ಸತ್ಯ ಮಾರ್ಗದಿಂದ ಈ ದೋಷವು ನಿವಾರಣೆಯಾಗುತ್ತದೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Devotion to Guru and strict truthfulness dissolves Guru Chandala.'"
  },
  88: {
    from: 88,
    to: 24,
    nameKn: "ಶನಿ ಸಾಡೇ ಸಾತಿ ಕಠಿಣ ಪರೀಕ್ಷೆ (-64)",
    nameEn: "Shani Sade Sati Karmic Crucible (-64)",
    icon: "🪐",
    shlokaKn: "ದ್ವಾದಶೇ ಜನ್ಮಗೇ ರಾಶೌ ದ್ವಿತೀಯೇ ಚ ಶನೈಶ್ಚರಃ...",
    shlokaEn: "Saturn's 7.5 year transit purifies the soul through trials.",
    meaningKn: "ಏಳೂವರೆ ವರ್ಷಗಳ ಶನಿ ದೆಸೆಯಲ್ಲಿ ಅಹಂಕಾರ ಕರಗಿ ವ್ಯಕ್ತಿಯು ಸಂಪೂರ್ಣ ಆತ್ಮಾವಲೋಕನ ಹಾಗೂ ಕಠಿಣ ಶಿಸ್ತನ್ನು ಕಲಿಯುತ್ತಾನೆ.",
    meaningEn: "Saturn's 7.5-year transit dismantles illusions, teaching humility, patience, and true endurance.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಶನೇಶ್ವರನಿಗೆ ಹೆದರಬೇಡಿ; ಶನಿಯು ಶ್ರಮಜೀವಿಗಳಿಗೆ ರಾಜನಂತಹ ಪದವಿ ನೀಡುತ್ತಾನೆ.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Saturn rewards disciplined effort with permanent greatness.'"
  },
  95: {
    from: 95,
    to: 56,
    nameKn: "ಕೇಂದ್ರಾದಿಪತ್ಯ & ಬಾಧಕ ದೋಷ (-39)",
    nameEn: "Badhaka & Kendra Adhipatya Dosha (-39)",
    icon: "⚡",
    shlokaKn: "ಕೇಂದ್ರಾಧಿಪತ್ಯ ದೋಷೇಣ ಸೌಮ್ಯಾಃ ಪಾಪಕರಾಃ...",
    shlokaEn: "Benefics owning Kendras require humility to avert sudden hurdles.",
    meaningKn: "ಅತಿಯಾದ ಆತ್ಮವಿಶ್ವಾಸ ಅಥವಾ ಬಾಧಕ ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಉತ್ತುಂಗದ ಹಂತದಲ್ಲಿ ಸಣ್ಣ ಎಡವಟ್ಟು ಉಂಟಾಗಬಹುದು.",
    meaningEn: "Kendra lord dosha warns against over-confidence near the peak of achievements.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಯಶಸ್ಸಿನ ಶಿಖರದಲ್ಲಿದ್ದಾಗಲೂ ವಿನಮ್ರತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಬೇಕು.'",
    gurujiVerdictEn: "Shreeram Pandit: 'Humility at the pinnacle protects against sudden falls.'"
  },
  98: {
    from: 98,
    to: 42,
    nameKn: "ಪಾಪ ಕರ್ತರಿ ಮಹಾ ದೋಷ (-56)",
    nameEn: "Papa Kartari Crucible (-56)",
    icon: "🐍",
    shlokaKn: "ಉಭಯತಃ ಪಾಪಗ್ರಹ ಮಧ್ಯಗತೇ ಭಾವೇ...",
    shlokaEn: "Being hemmed between malefics demands ultimate resilience.",
    meaningKn: "ಮೋಕ್ಷದ ಕೊನೆಯ ಹಂತದಲ್ಲಿ ಬರುವ ಅಂತಿಮ ಪರೀಕ್ಷೆ! ಎರಡೂ ಕಡೆ ಪಾಪಗ್ರಹಗಳ ಕತ್ತರಿಯಿಂದ ಕೆಳಕ್ಕೆ ಜಾರಿದರೂ ಛಲ ಬಿಡಬಾರದು.",
    meaningEn: "The ultimate trial right at the doorstep of Moksha, testing pure resilience before enlightenment.",
    gurujiVerdictKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 'ಎಡವಿದರೂ ಧೃತಿಗೆಡಬೇಡಿ; ದೈವ ಭಕ್ತಿಯಿಂದ ಮತ್ತೆ ಶಿಖರವನ್ನು ಏರಬಹುದು!'",
    gurujiVerdictEn: "Shreeram Pandit: 'Do not despair; devotion unlocks the highest summit again!'"
  }
};

// 8 Vedic Graha Avatars with their Lucky Numbers
const GRAHA_AVATARS = [
  { symbol: "☀️", nameKn: "ಸೂರ್ಯ (Surya)", nameEn: "Surya (Sun)", luckyNumber: 1, bg: "bg-amber-500", border: "border-amber-600" },
  { symbol: "🌙", nameKn: "ಚಂದ್ರ (Chandra)", nameEn: "Chandra (Moon)", luckyNumber: 2, bg: "bg-cyan-500", border: "border-cyan-600" },
  { symbol: "🌟", nameKn: "ಗುರು (Guru)", nameEn: "Guru (Jupiter)", luckyNumber: 3, bg: "bg-yellow-400", border: "border-yellow-500" },
  { symbol: "🌪️", nameKn: "ರಾಹು (Rahu)", nameEn: "Rahu", luckyNumber: 4, bg: "bg-purple-600", border: "border-purple-700" },
  { symbol: "💎", nameKn: "ಬುಧ (Budha)", nameEn: "Budha (Mercury)", luckyNumber: 5, bg: "bg-emerald-500", border: "border-emerald-600" },
  { symbol: "💖", nameKn: "ಶುಕ್ರ (Shukra)", nameEn: "Shukra (Venus)", luckyNumber: 6, bg: "bg-pink-500", border: "border-pink-600" },
  { symbol: "🪐", nameKn: "ಶನಿ (Shani)", nameEn: "Shani (Saturn)", luckyNumber: 8, bg: "bg-indigo-600", border: "border-indigo-700" },
  { symbol: "🔥", nameKn: "ಮಂಗಳ (Kuja)", nameEn: "Kuja (Mars)", luckyNumber: 9, bg: "bg-rose-500", border: "border-rose-600" }
];

export const YogaDoshaParampadaGame: React.FC<{ lang?: string }> = ({ lang = "kn" }) => {
  const [currentLang, setCurrentLang] = useState<string>(lang || "kn");
  const isKn = currentLang.slice(0, 2) === "kn";

  const [playerCount, setPlayerCount] = useState<number>(2); // 2 to 8
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [players, setPlayers] = useState<ParampadaPlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastEventMessage, setLastEventMessage] = useState<string>("");
  const [luckyBonusTriggered, setLuckyBonusTriggered] = useState<boolean>(false);
  const [winner, setWinner] = useState<ParampadaPlayer | null>(null);
  const [listeningPlayerId, setListeningPlayerId] = useState<number | null>(null);

  // Mobile-First Display States
  const [viewMode, setViewMode] = useState<"zoomed" | "full">("zoomed"); // zoomed 5x5 tier vs full 10x10
  const [activeTier, setActiveTier] = useState<number>(1); // 1: 1-25, 2: 26-50, 3: 51-75, 4: 76-100
  const [inspectedTile, setInspectedTile] = useState<number | null>(null);

  // Active Popup Modal for Yoga / Dosha landing
  const [activeYogaModal, setActiveYogaModal] = useState<YogaLadder | null>(null);
  const [activeDoshaModal, setActiveDoshaModal] = useState<DoshaSnake | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize Players
  useEffect(() => {
    setPlayers((prev) => {
      return Array.from({ length: playerCount }, (_, i) => {
        const avatar = GRAHA_AVATARS[i % GRAHA_AVATARS.length];
        const defaultName = isKn ? `ಆಟಗಾರ ${i + 1} (${avatar.nameKn.split(" ")[0]})` : `Player ${i + 1} (${avatar.nameEn.split(" ")[0]})`;
        const existing = prev.find((p) => p.id === i + 1);
        return {
          id: i + 1,
          name: existing ? existing.name : defaultName,
          avatarSymbol: avatar.symbol,
          avatarNameKn: avatar.nameKn,
          avatarNameEn: avatar.nameEn,
          luckyNumber: (avatar.luckyNumber % 6) || 6, // 1 to 6
          colorBg: avatar.bg,
          colorBorder: avatar.border,
          position: existing ? existing.position : 1,
          luckyRollsCount: existing ? existing.luckyRollsCount : 0,
          yogasClimbed: existing ? existing.yogasClimbed : 0,
          doshasFaced: existing ? existing.doshasFaced : 0
        };
      });
    });
  }, [playerCount, isKn]);

  const handleUpdatePlayerName = (id: number, newName: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  };

  const handleMicForPlayer = (id: number) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isKn
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ (Chrome/Safari ಬಳಸಿ)."
          : "Speech recognition is not supported in this browser."
      );
      return;
    }

    try {
      if (listeningPlayerId === id) {
        setListeningPlayerId(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = isKn ? "kn-IN" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setListeningPlayerId(id);

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0]?.transcript || "";
        if (speechResult.trim()) {
          handleUpdatePlayerName(id, speechResult.trim());
        }
        setListeningPlayerId(null);
      };

      recognition.onerror = () => {
        setListeningPlayerId(null);
      };

      recognition.onend = () => {
        setListeningPlayerId(null);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setListeningPlayerId(null);
    }
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
    setActivePlayerIndex(0);
    setWinner(null);
    setLastEventMessage(isKn ? "ಆಟ ಪ್ರಾರಂಭವಾಯಿತು! ಡೈಸ್ ರೋಲ್ ಮಾಡಿ." : "Game started! Roll the Vedic dice.");
    gameAudio.playSuccess();
  };

  const handleResetGame = () => {
    setIsGameStarted(false);
    setWinner(null);
    setActiveYogaModal(null);
    setActiveDoshaModal(null);
    setPlayers((prev) => prev.map((p) => ({ ...p, position: 1, luckyRollsCount: 0, yogasClimbed: 0, doshasFaced: 0 })));
    gameAudio.playTick();
  };

  // Roll Dice & Move
  const handleRollDice = () => {
    if (isRolling || winner || !isGameStarted) return;

    setIsRolling(true);
    setLuckyBonusTriggered(false);
    gameAudio.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      const randomRoll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(randomRoll);
      rollCount++;

      if (rollCount > 10) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        processMove(finalRoll);
      }
    }, 60);
  };

  const processMove = (roll: number) => {
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer) return;

    // Check Lucky Graha Number Bonus
    const isLucky = roll === activePlayer.luckyNumber;
    let actualMove = roll;

    if (isLucky) {
      actualMove += 1; // +1 Bonus step for divine lucky match
      setLuckyBonusTriggered(true);
      gameAudio.playChime();
    }

    let nextPos = activePlayer.position + actualMove;
    if (nextPos > 100) {
      // Bounce back or exact finish rule
      const overflow = nextPos - 100;
      nextPos = 100 - overflow;
    }

    let climbedYoga: YogaLadder | null = null;
    let facedDosha: DoshaSnake | null = null;

    // Check Ladder / Yoga
    if (VEDIC_YOGAS[nextPos]) {
      climbedYoga = VEDIC_YOGAS[nextPos];
      nextPos = climbedYoga.to;
      setActiveYogaModal(climbedYoga);
      gameAudio.playSuccess();
    }
    // Check Snake / Dosha
    else if (VEDIC_DOSHAS[nextPos]) {
      facedDosha = VEDIC_DOSHAS[nextPos];
      nextPos = facedDosha.to;
      setActiveDoshaModal(facedDosha);
      gameAudio.playBuzzer();
    } else {
      gameAudio.playTick();
    }

    // Update Player Stats
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePlayerIndex) return p;
        return {
          ...p,
          position: nextPos,
          luckyRollsCount: isLucky ? p.luckyRollsCount + 1 : p.luckyRollsCount,
          yogasClimbed: climbedYoga ? p.yogasClimbed + 1 : p.yogasClimbed,
          doshasFaced: facedDosha ? p.doshasFaced + 1 : p.doshasFaced
        };
      })
    );

    // Event message
    let msg = "";
    if (isLucky) {
      msg = isKn
        ? `🌟 ${activePlayer.name} ಅವರಿಗೆ ಲಕ್ಕಿ ಸಂಖ್ಯೆ (${roll}) ಬೋನಸ್! +${actualMove} ಹೆಜ್ಜೆಗಳು.`
        : `🌟 Lucky Match for ${activePlayer.name} (Rolled ${roll})! Advanced ${actualMove} steps.`;
    } else {
      msg = isKn
        ? `${activePlayer.name} ಡೈಸ್‌ನಲ್ಲಿ ${roll} ಪಡೆದರು. (ಸ್ಥಾನ: ${nextPos})`
        : `${activePlayer.name} rolled a ${roll} (Position: ${nextPos}).`;
    }

    if (climbedYoga) {
      msg += isKn ? ` 🚀 ${climbedYoga.nameKn} ಲಭಿಸಿತು!` : ` 🚀 Climbed ${climbedYoga.nameEn}!`;
    }
    if (facedDosha) {
      msg += isKn ? ` ⚠️ ${facedDosha.nameKn} ಎದುರಾಯಿತು!` : ` ⚠️ Encountered ${facedDosha.nameEn}!`;
    }

    setLastEventMessage(msg);

    // Auto-sync mobile tier to current player position
    const newTier = Math.min(4, Math.max(1, Math.ceil(nextPos / 25)));
    setActiveTier(newTier);

    // Win condition: Exactly tile 100
    if (nextPos === 100) {
      setWinner(activePlayer);
      gameAudio.playSuccess();
      return;
    }

    // Next player turn (unless rolled a 6, which grants extra turn)
    if (roll !== 6 && !isLucky) {
      setActivePlayerIndex((prev) => (prev + 1) % players.length);
    }
  };

  // Generate 100-cell Zig-Zag Grid (1 to 100)
  const boardCells: number[] = [];
  for (let r = 10; r >= 1; r--) {
    const isEvenRowFromBottom = r % 2 === 0;
    const rowNumbers: number[] = [];
    for (let c = 1; c <= 10; c++) {
      const num = isEvenRowFromBottom ? r * 10 - c + 1 : (r - 1) * 10 + c;
      rowNumbers.push(num);
    }
    boardCells.push(...rowNumbers);
  }

  // Generate 25-cell Focused Tier Grid for Mobile Zoom (Tier 1: 1-25, Tier 2: 26-50, etc.)
  const getTierCells = (tierNum: number): number[] => {
    const tierStart = (tierNum - 1) * 25 + 1;
    const cells: number[] = [];
    for (let r = 5; r >= 1; r--) {
      const isEven = r % 2 === 0;
      const rowNums: number[] = [];
      for (let c = 1; c <= 5; c++) {
        const num = isEven
          ? tierStart + (r - 1) * 5 + (5 - c)
          : tierStart + (r - 1) * 5 + (c - 1);
        rowNums.push(num);
      }
      cells.push(...rowNums);
    }
    return cells;
  };

  const currentTierCells = getTierCells(activeTier);

  return (
    <div className="space-y-5 select-none animate-fade-in">
      {/* Top Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-4 sm:p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🎲
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-800 text-amber-50 px-2 py-0.5 rounded-md">
                  ॥ ವೈದಿಕ ಮಹಾ ಪರಮಪದ (Vedic Snake & Ladder) ॥
                </span>
                <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  {playerCount} {isKn ? "ಆಟಗಾರರು" : "Players"}
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-xl font-black text-amber-950">
                {isKn ? "ಯೋಗ & ದೋಷ ಮಹಾ ಪರಮಪದ ಖೇಲ" : "Yoga & Dosha Maha Parampada Board Game"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setCurrentLang(isKn ? "en" : "kn")}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold text-xs text-amber-950 shadow-xs hover:bg-amber-50"
            >
              🌐 {isKn ? "English" : "ಕನ್ನಡ"}
            </button>

            {isGameStarted && (
              <button
                type="button"
                onClick={handleResetGame}
                className="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-950 border border-amber-400 font-bold text-xs shadow-xs hover:bg-amber-300"
              >
                🔄 {isKn ? "ಮರುಹೊಂದಿಸಿ" : "Reset"}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Pre-Game Setup (Player Selection 2 to 8) */}
      {!isGameStarted && (
        <Card className="border-2 border-amber-400 bg-white p-5 shadow-lg space-y-4 max-w-xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-lg font-black text-amber-950">
              👥 {isKn ? "ಆಟಗಾರರ ಸಂಖ್ಯೆಯನ್ನು ಆರಿಸಿ (೨ ರಿಂದ ೮)" : "Select Number of Players (2 to 8)"}
            </h3>
            <p className="text-xs text-amber-900 font-medium">
              {isKn
                ? "ಪ್ರತಿಯೊಬ್ಬ ಆಟಗಾರನಿಗೂ ನವಗ್ರಹ ಅವತಾರ ಹಾಗೂ ಲಕ್ಕಿ ರೋಲರ್ ಸಂಖ್ಯೆ ದೊರೆಯುತ್ತದೆ!"
                : "Each player receives a sacred Graha Avatar and unique Lucky Number!"}
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setPlayerCount(num);
                  gameAudio.playTick();
                }}
                className={`w-11 h-11 rounded-2xl font-black text-sm border-2 transition ${
                  playerCount === num
                    ? "bg-amber-900 text-amber-50 border-amber-950 shadow-md scale-110"
                    : "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Player Avatars & Editable Name List */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
              <span>{isKn ? "ಆಟಗಾರರ ಹೆಸರುಗಳನ್ನು ನಮೂದಿಸಿ / ಧ್ವನಿ ಬಳಸಿ:" : "Edit Player Names / Use Microphone:"}</span>
              <span className="text-[11px] text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                {playerCount} {isKn ? "ಆಟಗಾರರು" : "Players"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
              {players.map((p, i) => (
                <div key={p.id} className="p-3 rounded-2xl bg-amber-50/90 border-2 border-amber-200 flex items-center gap-3 shadow-xs">
                  <div className="w-11 h-11 rounded-2xl bg-amber-200/80 border border-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {p.avatarSymbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] text-amber-900 font-extrabold mb-1">
                      <span>{isKn ? `ಆಟಗಾರ ${i + 1}` : `Player ${i + 1}`} ({isKn ? p.avatarNameKn.split(" ")[0] : p.avatarNameEn.split(" ")[0]})</span>
                      <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                        Lucky: {p.luckyNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdatePlayerName(p.id, e.target.value)}
                        placeholder={isKn ? `ಆಟಗಾರ ${i + 1} ಹೆಸರು` : `Player ${i + 1} Name`}
                        className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-amber-300 focus:border-amber-600 focus:outline-none transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleMicForPlayer(p.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs transition border cursor-pointer ${
                          listeningPlayerId === p.id
                            ? "bg-rose-600 text-white animate-pulse border-rose-700 shadow-md"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs"
                        }`}
                        title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಹೆಸರನ್ನು ಹೇಳಿ (Mic)" : "Dictate name via Mic"}
                      >
                        {listeningPlayerId === p.id ? "🔴" : "🎙️"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-amber-50 font-black text-sm shadow-lg hover:from-amber-700 hover:to-black transition active:scale-98 cursor-pointer"
          >
            🚀 {isKn ? "ಪರಮಪದ ಖೇಲ ಪ್ರಾರಂಭಿಸಿ!" : "Start Maha Parampada Game!"}
          </button>
        </Card>
      )}

      {/* Main Active Game View */}
      {isGameStarted && (
        <div className="space-y-4 pb-24 sm:pb-4">
          {/* Active Players Turn Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {players.map((p, idx) => {
              const isActive = idx === activePlayerIndex;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    const pTier = Math.min(4, Math.max(1, Math.ceil(p.position / 25)));
                    setActiveTier(pTier);
                    gameAudio.playTick();
                  }}
                  className={`px-3.5 py-2 rounded-2xl border-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-amber-900 text-amber-50 border-amber-700 shadow-md scale-105 ring-2 ring-amber-400 font-black"
                      : "bg-white text-amber-950 border-amber-200 font-bold opacity-85 hover:opacity-100"
                  }`}
                >
                  <span className="text-xl">{p.avatarSymbol}</span>
                  <div className="text-left">
                    <div className="text-xs truncate max-w-[100px]">{p.name.split(" ")[0]}</div>
                    <div className="text-[10px] opacity-90">
                      {isKn ? `ಮನೆ: ${p.position}` : `Tile: ${p.position}`} · Lucky: {p.luckyNumber}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile View Mode Switcher & Tier Tabs */}
          <div className="bg-amber-100/90 border border-amber-300 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[11px] font-black text-amber-950 uppercase flex items-center gap-1">
                <span>📱</span>
                <span>{isKn ? "ವೀಕ್ಷಣೆ ಮೋಡ್:" : "View Mode:"}</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("zoomed");
                    gameAudio.playTick();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    viewMode === "zoomed"
                      ? "bg-amber-900 text-amber-50 shadow-xs"
                      : "text-amber-900 hover:bg-amber-50"
                  }`}
                >
                  🔍 {isKn ? "ದೊಡ್ಡ ಬಾಕ್ಸ್‌ಗಳು (5x5)" : "Zoomed (5x5)"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("full");
                    gameAudio.playTick();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    viewMode === "full"
                      ? "bg-amber-900 text-amber-50 shadow-xs"
                      : "text-amber-900 hover:bg-amber-50"
                  }`}
                >
                  🌐 {isKn ? "ಪೂರ್ಣ ೧೦೦ ಮನೆ" : "Full 100"}
                </button>
              </div>
            </div>

            {/* If Zoomed View: Tier Selector Tabs (1-25, 26-50, 51-75, 76-100) */}
            {viewMode === "zoomed" && (
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto justify-between sm:justify-end scrollbar-none pt-1 sm:pt-0">
                {[
                  { tier: 1, labelKn: "೧-೨೫", labelEn: "1-25", icon: "🌱" },
                  { tier: 2, labelKn: "೨೬-೫೦", labelEn: "26-50", icon: "⚡" },
                  { tier: 3, labelKn: "೫೧-೭೫", labelEn: "51-75", icon: "🔥" },
                  { tier: 4, labelKn: "೭೬-೧೦೦", labelEn: "76-100", icon: "🕉️" }
                ].map((t) => (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => {
                      setActiveTier(t.tier);
                      gameAudio.playTick();
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black border transition shrink-0 ${
                      activeTier === t.tier
                        ? "bg-amber-800 text-amber-50 border-amber-900 shadow-xs scale-105"
                        : "bg-white text-amber-950 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <span>{t.icon} </span>
                    <span>{isKn ? t.labelKn : t.labelEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grand Parampada Board Container */}
          <Card className="border-2 border-amber-400 bg-amber-950 p-2 sm:p-4 shadow-2xl relative overflow-hidden">
            {/* View 1: 5x5 Zoomed Mobile Tier Grid (Gigantic Touch Boxes) */}
            {viewMode === "zoomed" ? (
              <div
                ref={boardRef}
                className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-xl mx-auto bg-amber-900/90 p-2 sm:p-3 rounded-2xl border-2 border-amber-400 shadow-inner"
              >
                {currentTierCells.map((tileNum) => {
                  const isYoga = !!VEDIC_YOGAS[tileNum];
                  const isDosha = !!VEDIC_DOSHAS[tileNum];
                  const isMoksha = tileNum === 100;
                  const yoga = VEDIC_YOGAS[tileNum];
                  const dosha = VEDIC_DOSHAS[tileNum];
                  const playersOnTile = players.filter((p) => p.position === tileNum);

                  let tileBg = "bg-amber-50/95 text-amber-950 border-amber-300";
                  if (isMoksha) tileBg = "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-amber-950 font-black border-yellow-200 ring-2 ring-yellow-400";
                  else if (isYoga) tileBg = "bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 text-emerald-950 border-emerald-400 ring-1 ring-emerald-400";
                  else if (isDosha) tileBg = "bg-gradient-to-br from-rose-100 via-rose-50 to-rose-200 text-rose-950 border-rose-400 ring-1 ring-rose-400";

                  return (
                    <div
                      key={tileNum}
                      onClick={() => {
                        if (yoga) setActiveYogaModal(yoga);
                        else if (dosha) setActiveDoshaModal(dosha);
                        else setInspectedTile(tileNum);
                        gameAudio.playTick();
                      }}
                      className={`min-h-[64px] sm:min-h-[75px] rounded-xl sm:rounded-2xl border-2 flex flex-col justify-between p-1.5 sm:p-2 relative shadow-xs transition cursor-pointer hover:scale-105 active:scale-95 ${tileBg}`}
                    >
                      {/* Tile Number Header */}
                      <div className="flex items-center justify-between font-black leading-none">
                        <span className="text-xs sm:text-sm bg-white/80 px-1.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                          {tileNum}
                        </span>
                        {isYoga && <span className="text-sm sm:text-base animate-pulse">🚀</span>}
                        {isDosha && <span className="text-sm sm:text-base animate-pulse">⚠️</span>}
                        {isMoksha && <span className="text-base sm:text-lg animate-bounce">🕉️</span>}
                      </div>

                      {/* Middle Yoga/Dosha Destination Badge */}
                      <div className="text-center my-auto">
                        {isMoksha && <span className="text-[10px] sm:text-xs font-black text-amber-950 block">ಮೋಕ್ಷ (100)</span>}
                        {isYoga && (
                          <span className="text-[9px] sm:text-[10px] font-black bg-emerald-700 text-white px-1.5 py-0.5 rounded-md block shadow-2xs truncate">
                            +{yoga.to - tileNum} ➔ #{yoga.to}
                          </span>
                        )}
                        {isDosha && (
                          <span className="text-[9px] sm:text-[10px] font-black bg-rose-700 text-white px-1.5 py-0.5 rounded-md block shadow-2xs truncate">
                            -{tileNum - dosha.to} ➔ #{dosha.to}
                          </span>
                        )}
                      </div>

                      {/* Players Tokens Stacked on this Tile */}
                      {playersOnTile.length > 0 && (
                        <div className="flex items-center justify-center gap-1 flex-wrap z-10 bg-amber-950/70 p-0.5 rounded-full shadow-md">
                          {playersOnTile.map((p) => (
                            <span
                              key={p.id}
                              className="text-base sm:text-xl animate-bounce drop-shadow-md select-none"
                              title={`${p.name} on tile ${tileNum}`}
                            >
                              {p.avatarSymbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View 2: 10x10 Full Board Grid */
              <div
                ref={boardRef}
                className="grid grid-cols-10 gap-1 sm:gap-1.5 aspect-square max-w-2xl mx-auto bg-amber-900/90 p-1.5 sm:p-3 rounded-2xl border-2 border-amber-400 shadow-inner"
              >
                {boardCells.map((tileNum) => {
                  const isYoga = !!VEDIC_YOGAS[tileNum];
                  const isDosha = !!VEDIC_DOSHAS[tileNum];
                  const isMoksha = tileNum === 100;
                  const yoga = VEDIC_YOGAS[tileNum];
                  const dosha = VEDIC_DOSHAS[tileNum];
                  const playersOnTile = players.filter((p) => p.position === tileNum);

                  let tileBg = "bg-amber-50/90 text-amber-950 border-amber-300";
                  if (isMoksha) tileBg = "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-amber-950 font-black border-yellow-200 ring-2 ring-yellow-400";
                  else if (isYoga) tileBg = "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-950 border-emerald-400";
                  else if (isDosha) tileBg = "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-950 border-rose-400";

                  return (
                    <div
                      key={tileNum}
                      onClick={() => {
                        if (yoga) setActiveYogaModal(yoga);
                        else if (dosha) setActiveDoshaModal(dosha);
                        else setInspectedTile(tileNum);
                        gameAudio.playTick();
                      }}
                      className={`rounded-lg sm:rounded-xl border flex flex-col justify-between p-0.5 sm:p-1 relative shadow-2xs transition cursor-pointer hover:scale-105 ${tileBg}`}
                    >
                      <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-black leading-none">
                        <span>{tileNum}</span>
                        {isYoga && <span className="text-[10px] sm:text-xs">🚀</span>}
                        {isDosha && <span className="text-[10px] sm:text-xs">⚠️</span>}
                        {isMoksha && <span className="text-xs sm:text-sm">🕉️</span>}
                      </div>

                      <div className="text-center my-auto">
                        {isMoksha && <span className="text-[8px] sm:text-[9px] font-black block text-amber-900 leading-tight">ಮೋಕ್ಷ</span>}
                        {isYoga && <span className="text-[7px] sm:text-[8px] font-bold block text-emerald-900 truncate leading-tight">+{yoga.to - tileNum}</span>}
                        {isDosha && <span className="text-[7px] sm:text-[8px] font-bold block text-rose-900 truncate leading-tight">-{tileNum - dosha.to}</span>}
                      </div>

                      {playersOnTile.length > 0 && (
                        <div className="flex items-center justify-center gap-0.5 flex-wrap z-10 -mt-1">
                          {playersOnTile.map((p) => (
                            <span
                              key={p.id}
                              className="text-xs sm:text-base animate-bounce drop-shadow-md select-none"
                              title={`${p.name} on tile ${tileNum}`}
                            >
                              {p.avatarSymbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Thumb Control Bar (Floating & Sticky at bottom) */}
            <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-amber-100/95 border-2 border-amber-400 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-50 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {players[activePlayerIndex]?.avatarSymbol}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800">
                    {isKn ? "ಈಗಿನ ಆಟಗಾರ (Active Player):" : "Current Turn:"}
                  </div>
                  <div className="text-sm font-black text-amber-950">
                    {players[activePlayerIndex]?.name}
                  </div>
                  <div className="text-xs font-medium text-amber-900">
                    {lastEventMessage || (isKn ? "ಡೈಸ್ ರೋಲ್ ಮಾಡಿ!" : "Roll the dice!")}
                  </div>
                </div>
              </div>

              {/* Big Touch Dice Roller Button for Phone Play */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 flex items-center justify-center text-3xl font-black text-amber-950 shadow-inner select-none shrink-0">
                  {isRolling ? "🎲" : diceValue}
                </div>

                <button
                  type="button"
                  disabled={isRolling || !!winner}
                  onClick={handleRollDice}
                  className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    isRolling || !!winner
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-950 text-amber-50 hover:from-amber-700 hover:to-black active:scale-95 ring-2 ring-amber-400"
                  }`}
                >
                  <span className="text-lg">🎲</span>
                  <span>{isRolling ? (isKn ? "ರೋಲ್ ಆಗುತ್ತಿದೆ..." : "Rolling...") : (isKn ? "ರೋಲ್ ಮಾಡಿ (ROLL)" : "ROLL DICE")}</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Inspected Tile Popup Modal */}
          {inspectedTile !== null && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border-2 border-amber-400 p-5 max-w-sm w-full shadow-2xl space-y-3 relative text-amber-950">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-amber-200 font-black text-sm flex items-center justify-center border border-amber-400">
                      {inspectedTile}
                    </span>
                    <h4 className="font-serif text-base font-black text-amber-950">
                      {isKn ? `${inspectedTile}ನೇ ಮನೆಯ ವಿವರ` : `Tile #${inspectedTile} Details`}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedTile(null)}
                    className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center hover:bg-amber-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-amber-900 space-y-2">
                  <p>
                    {isKn
                      ? `ಈ ಮನೆಯು ಸಾಮಾನ್ಯ ಗ್ರಹ ಸ್ಥಿತಿಯಾಗಿದೆ. ಯಾವುದೇ ಯೋಗ ಅಥವಾ ದೋಷವಿಲ್ಲ.`
                      : `Standard neutral astrological house without active yogas or doshas.`}
                  </p>
                  {players.filter((p) => p.position === inspectedTile).length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-[11px] font-bold">
                      👥 {isKn ? "ಈ ಮನೆಯಲ್ಲಿರುವ ಆಟಗಾರರು:" : "Players on this tile:"}{" "}
                      {players
                        .filter((p) => p.position === inspectedTile)
                        .map((p) => `${p.avatarSymbol} ${p.name}`)
                        .join(", ")}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedTile(null)}
                  className="w-full py-2 rounded-xl bg-amber-800 text-white font-bold text-xs"
                >
                  {isKn ? "ಮುಚ್ಚಿ" : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Winner Fanfare Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 rounded-3xl border-4 border-amber-500 p-6 max-w-md w-full shadow-2xl text-center space-y-4 animate-bounce">
            <span className="text-5xl select-none">🏆</span>
            <div className="text-xs uppercase font-black tracking-widest text-amber-900">
              ॥ ಮಹಾ ಮೋಕ್ಷ ವಿಜಯೋತ್ಸವ ॥
            </div>
            <h3 className="font-serif text-2xl font-black text-amber-950">
              {isKn ? `ಅಭಿನಂದನೆಗಳು! ${winner.name} ವಿಜಯಿಯಾಗಿದ್ದಾರೆ!` : `Congratulations! ${winner.name} reached Moksha!`}
            </h3>
            <p className="text-xs text-amber-900 font-medium">
              {isKn
                ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಹಾಗೂ ನವಗ್ರಹಗಳ ಕೃಪೆಯಿಂದ ೧೦೦ನೇ ಮೋಕ್ಷ ಸ್ಥಾನವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿದ್ದಾರೆ!"
                : "By the divine grace of Shri Mahabaleshwara, reached the 100th Moksha gateway!"}
            </p>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-300 text-xs space-y-1 font-bold text-amber-900">
              <div>🚀 {isKn ? `ಏರಿದ ಪುಣ್ಯ ಯೋಗಗಳು: ${winner.yogasClimbed}` : `Yogas Climbed: ${winner.yogasClimbed}`}</div>
              <div>⚠️ {isKn ? `ಎದುರಿಸಿದ ಕರ್ಮ ದೋಷಗಳು: ${winner.doshasFaced}` : `Doshas Faced: ${winner.doshasFaced}`}</div>
              <div>✨ {isKn ? `ಲಕ್ಕಿ ರೋಲ್ ಬೋನಸ್‌ಗಳು: ${winner.luckyRollsCount}` : `Lucky Rolls: ${winner.luckyRollsCount}`}</div>
            </div>

            <button
              type="button"
              onClick={handleResetGame}
              className="w-full py-3 rounded-2xl bg-amber-900 text-amber-50 font-black text-sm shadow-lg hover:bg-black transition"
            >
              🔄 {isKn ? "ಮತ್ತೆ ಆಟವಾಡಿ (Play Again)" : "Play Again"}
            </button>
          </div>
        </div>
      )}

      {/* Yoga Ladder Interactive Detail Modal */}
      {activeYogaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-emerald-400 p-5 max-w-md w-full shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{activeYogaModal.icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800">
                    ॥ ಪುಣ್ಯ ಯೋಗ ಮೆಟ್ಟಿಲು (Divine Ladder) ॥
                  </span>
                  <h4 className="font-serif text-base font-black text-emerald-950">
                    {isKn ? activeYogaModal.nameKn : activeYogaModal.nameEn}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveYogaModal(null)}
                className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black flex items-center justify-center hover:bg-emerald-200"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
              <div className="italic font-serif font-bold text-emerald-900 mb-1">
                "{isKn ? activeYogaModal.shlokaKn : activeYogaModal.shlokaEn}"
              </div>
              <div>{isKn ? activeYogaModal.meaningKn : activeYogaModal.meaningEn}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium italic">
              {isKn ? activeYogaModal.gurujiVerdictKn : activeYogaModal.gurujiVerdictEn}
            </div>

            <button
              type="button"
              onClick={() => setActiveYogaModal(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800"
            >
              ✓ {isKn ? "ಮುಂದುವರಿಯಿರಿ" : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* Dosha Snake Interactive Detail Modal */}
      {activeDoshaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-rose-400 p-5 max-w-md w-full shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{activeDoshaModal.icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-800">
                    ॥ ಗ್ರಹ ದೋಷ ಪರೀಕ್ಷೆ (Karmic Trial) ॥
                  </span>
                  <h4 className="font-serif text-base font-black text-rose-950">
                    {isKn ? activeDoshaModal.nameKn : activeDoshaModal.nameEn}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoshaModal(null)}
                className="w-7 h-7 rounded-full bg-rose-100 text-rose-900 font-black flex items-center justify-center hover:bg-rose-200"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 font-medium">
              <div className="italic font-serif font-bold text-rose-900 mb-1">
                "{isKn ? activeDoshaModal.shlokaKn : activeDoshaModal.shlokaEn}"
              </div>
              <div>{isKn ? activeDoshaModal.meaningKn : activeDoshaModal.meaningEn}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium italic">
              {isKn ? activeDoshaModal.gurujiVerdictKn : activeDoshaModal.gurujiVerdictEn}
            </div>

            <button
              type="button"
              onClick={() => setActiveDoshaModal(null)}
              className="w-full py-2.5 rounded-xl bg-rose-700 text-white font-bold text-xs shadow hover:bg-rose-800"
            >
              ✓ {isKn ? "ಪರಿಹಾರ ತಿಳಿದುಕೊಂಡು ಮುಂದುವರಿಯಿರಿ" : "Understood & Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
