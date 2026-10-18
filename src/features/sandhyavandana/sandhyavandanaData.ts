/**
 * Baggona Panchanga - Authentic Karnataka Vedic Sandhyavandana Data Repository
 * Follows the rigorous living tradition of Uttara Kannada (Gokarna / Baggona)
 * covering Rigvedic and Yajurvedic practices, full Kaikarana (gestures), and Trikaala Arghya rules.
 */

import type { SandhyaPeriod, SandhyaPeriodMeta, SandhyaStep, GotraItem, FeaturedMantraItem } from "./sandhyavandanaTypes";

// -------------------------------------------------------------
// 1. Trikaala Sandhya Period Metadata
// -------------------------------------------------------------
export const SANDHYA_PERIODS: Record<SandhyaPeriod, SandhyaPeriodMeta> = {
  pratah: {
    period: "pratah",
    titleKn: "ಪ್ರಾತಃ ಸಂಧ್ಯಾವಂದನೆ",
    titleEn: "Pratah Sandhyavandana (Morning)",
    timeRangeKn: "ಸೂರ್ಯೋದಯಕ್ಕೆ ಮುನ್ನ ಅಥವಾ ಸೂರ್ಯೋದಯ ಕಾಲ (ಬೆಳಿಗ್ಗೆ ೪:೩೦ ರಿಂದ ೮:೩೦)",
    timeRangeEn: "Pre-dawn to Sunrise (4:30 AM to 8:30 AM)",
    arghyaCount: 3,
    arghyaDirectionKn: "ಪೂರ್ವ ದಿಕ್ಕು (ಉದಯ ಸೂರ್ಯನಿಗೆ ಮುಖಮಾಡಿ)",
    arghyaDirectionEn: "Facing East (towards rising Sun)",
    color: "#D97706",
    icon: "🌅"
  },
  madhyahna: {
    period: "madhyahna",
    titleKn: "ಮಾಧ್ಯಾಹ್ನಿಕ ಸಂಧ್ಯಾವಂದನೆ",
    titleEn: "Madhyahnika Sandhyavandana (Midday / Noon)",
    timeRangeKn: "ಮಧ್ಯಾಹ್ನ ಕಾಲ (ಬೆಳಿಗ್ಗೆ ೧೧:೩೦ ರಿಂದ ಮಧ್ಯಾಹ್ನ ೧:೩೦)",
    timeRangeEn: "Midday / Solar Noon (11:30 AM to 1:30 PM)",
    arghyaCount: 3, // or 2 regular + 1 Surya arghya
    arghyaDirectionKn: "ಮಧ್ಯಾಹ್ನದ ಸೂರ್ಯನಿಗೆ ನೇರವಾಗಿ ನಿಂತು",
    arghyaDirectionEn: "Standing upright facing Midday Sun",
    color: "#EA580C",
    icon: "☀️"
  },
  sayam: {
    period: "sayam",
    titleKn: "ಸಾಯಂ ಸಂಧ್ಯಾವಂದನೆ",
    titleEn: "Sayam Sandhyavandana (Evening / Dusk)",
    timeRangeKn: "ಸೂರ್ಯಾಸ್ತಮಯಕ್ಕೆ ಮುನ್ನ ಅಥವಾ ಗೋಧೂಳಿ ಕಾಲ (ಸಂಜೆ ೫:೩೦ ರಿಂದ ರಾತ್ರಿ ೮:೦೦)",
    timeRangeEn: "Sunset to Twilight (5:30 PM to 8:00 PM)",
    arghyaCount: 3,
    arghyaDirectionKn: "ಪಶ್ಚಿಮ ದಿಕ್ಕು (ಅಸ್ತಮಿಸುವ ಸೂರ್ಯನಿಗೆ ಮುಖಮಾಡಿ)",
    arghyaDirectionEn: "Facing West (towards setting Sun)",
    color: "#7C2D12",
    icon: "🌇"
  }
};

/**
 * Automatically detects appropriate Sandhya period based on local clock time.
 */
export function detectCurrentSandhyaPeriod(date: Date = new Date()): SandhyaPeriod {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 04:00 AM (240 min) to 10:45 AM (645 min) -> Pratah
  if (totalMinutes >= 240 && totalMinutes < 645) {
    return "pratah";
  }
  // 10:45 AM (645 min) to 15:30 (930 min) -> Madhyahna
  if (totalMinutes >= 645 && totalMinutes < 930) {
    return "madhyahna";
  }
  // 15:30 (930 min) to 23:59 or night -> Sayam
  return "sayam";
}

// -------------------------------------------------------------
// 2. Comprehensive Gotra Pravara Catalog (16+ Authentic Vedic Lineages)
// -------------------------------------------------------------
export const GOTRA_CATALOG: GotraItem[] = [
  {
    id: "vashishta_traya",
    nameKn: "ವಸಿಷ್ಠ ಗೋತ್ರ (ತ್ರಯಾರ್ಷೇಯ)",
    nameEn: "Vashishta Gotra (Trayarsheya)",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ, ಕೌಂಡಿನ್ಯ",
    pravaraRishisEn: "Vashishta, Maitravaruna, Kaundinya",
    formulaKn: "ವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ, ಕೌಂಡಿನ್ಯೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ವಸಿಷ್ಠ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Vashishta, Maitravaruna, Kaundinyeti Trayarsheya Pravaranvita Vashishta Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "vashishta_eka",
    nameKn: "ವಸಿಷ್ಠ ಗೋತ್ರ (ಏಕಾರ್ಷೇಯ)",
    nameEn: "Vashishta Gotra (Ekarsheya)",
    pravaraTypeKn: "ಏಕಾರ್ಷೇಯ",
    pravaraRishisKn: "ವಸಿಷ್ಠ",
    pravaraRishisEn: "Vashishta",
    formulaKn: "ವಸಿಷ್ಠೇತಿ ಏಕಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ವಸಿಷ್ಠ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Vashishtheti Ekarsheya Pravaranvita Vashishta Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "vishvamitra",
    nameKn: "ವಿಶ್ವಾಮಿತ್ರ ಗೋತ್ರ",
    nameEn: "Vishvamitra Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ವಿಶ್ವಾಮಿತ್ರ, ದೇವರಾತ, ಔದಲ",
    pravaraRishisEn: "Vishvamitra, Devarata, Audala",
    formulaKn: "ವಿಶ್ವಾಮಿತ್ರ, ದೇವರಾತ, ಔದಾಲೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ವಿಶ್ವಾಮಿತ್ರ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Vishvamitra, Devarata, Audaleti Trayarsheya Pravaranvita Vishvamitra Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "kashyapa",
    nameKn: "ಕಶ್ಯಪ ಗೋತ್ರ",
    nameEn: "Kashyapa Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಕಶ್ಯಪ, ಅವತ್ಸಾರ, ನೈಧ್ರುವ",
    pravaraRishisEn: "Kashyapa, Avatsara, Naidhruva",
    formulaKn: "ಕಶ್ಯಪ, ಅವತ್ಸಾರ, ನೈಧ್ರುವೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಕಶ್ಯಪ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Kashyapa, Avatsara, Naidhruveti Trayarsheya Pravaranvita Kashyapa Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "bharadvaja",
    nameKn: "ಭಾರದ್ವಾಜ ಗೋತ್ರ",
    nameEn: "Bharadvaja Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಆಂಗಿರಸ, ಬಾರ್ಹಸ್ಪತ್ಯ, ಭಾರದ್ವಾಜ",
    pravaraRishisEn: "Angirasa, Barhaspatya, Bharadvaja",
    formulaKn: "ಆಂಗಿರಸ, ಬಾರ್ಹಸ್ಪತ್ಯ, ಭಾರದ್ವಾಜೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಭಾರದ್ವಾಜ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Angirasa, Barhaspatya, Bharadvajeti Trayarsheya Pravaranvita Bharadvaja Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "gautama",
    nameKn: "ಗೌತಮ ಗೋತ್ರ",
    nameEn: "Gautama Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಆಂಗಿರಸ, ಆಯಾಸ್ಯ, ಗೌತಮ",
    pravaraRishisEn: "Angirasa, Ayasya, Gautama",
    formulaKn: "ಆಂಗಿರಸ, ಆಯಾಸ್ಯ, ಗೌತಮೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಗೌತಮ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Angirasa, Ayasya, Gautameti Trayarsheya Pravaranvita Gautama Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "atri",
    nameKn: "ಅತ್ರಿ ಗೋತ್ರ",
    nameEn: "Atri Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಆತ್ರೇಯ, ಆರ್ಚನಾನಸ, ಶ್ಯಾವಾಶ್ವ",
    pravaraRishisEn: "Atreya, Archananasa, Shyavashva",
    formulaKn: "ಆತ್ರೇಯ, ಆರ್ಚನಾನಸ, ಶ್ಯಾವಾಶ್ವೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಅತ್ರಿ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Atreya, Archananasa, Shyavashveti Trayarsheya Pravaranvita Atri Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "jamadagni",
    nameKn: "ಜಮದಗ್ನಿ / ಭಾರ್ಗವ / ವತ್ಸ ಗೋತ್ರ",
    nameEn: "Jamadagni / Bhargava Gotra",
    pravaraTypeKn: "ಪಂಚಾರ್ಷೇಯ",
    pravaraRishisKn: "ಭಾರ್ಗವ, ಚ್ಯಾವನ, ಆಪ್ನವಾನ, ಔರ್ವ, ಜಾಮದಗ್ನ್ಯ",
    pravaraRishisEn: "Bhargava, Chyavana, Apnavana, Aurva, Jamadagnya",
    formulaKn: "ಭಾರ್ಗವ, ಚ್ಯಾವನ, ಆಪ್ನವಾನ, ಔರ್ವ, ಜಾಮದಗ್ನ್ಯೇತಿ ಪಂಚಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಜಮದಗ್ನಿ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Bhargava, Chyavana, Apnavana, Aurva, Jamadagnyeti Pancharsheya Pravaranvita Jamadagni Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "kaushika",
    nameKn: "ಕೌಶಿಕ ಗೋತ್ರ",
    nameEn: "Kaushika Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ವೈಶ್ವಾಮಿತ್ರ, ಆಘಮರ್ಷಣ, ಕೌಶಿಕ",
    pravaraRishisEn: "Vaishvamitra, Aghamarshana, Kaushika",
    formulaKn: "ವೈಶ್ವಾಮಿತ್ರ, ಆಘಮರ್ಷಣ, ಕೌಶಿಕೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಕೌಶಿಕ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Vaishvamitra, Aghamarshana, Kaushiketi Trayarsheya Pravaranvita Kaushika Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "kaundinya",
    nameKn: "ಕೌಂಡಿನ್ಯ ಗೋತ್ರ",
    nameEn: "Kaundinya Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ, ಕೌಂಡಿನ್ಯ",
    pravaraRishisEn: "Vashishta, Maitravaruna, Kaundinya",
    formulaKn: "ವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ, ಕೌಂಡಿನ್ಯೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಕೌಂಡಿನ್ಯ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Vashishta, Maitravaruna, Kaundinyeti Trayarsheya Pravaranvita Kaundinya Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "harita",
    nameKn: "ಹರಿತ ಗೋತ್ರ",
    nameEn: "Harita Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಆಂಗಿರಸ, ಅಂಬರೀಷ, ಯೌವನಾಶ್ವ",
    pravaraRishisEn: "Angirasa, Ambarisha, Yauvanashva",
    formulaKn: "ಆಂಗಿರಸ, ಅಂಬರೀಷ, ಯೌವನಾಶ್ವೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಹರಿತ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Angirasa, Ambarisha, Yauvanashveti Trayarsheya Pravaranvita Harita Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "shandilya",
    nameKn: "ಶಾಂಡಿಲ್ಯ ಗೋತ್ರ",
    nameEn: "Shandilya Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಶಾಂಡಿಲ್ಯ, ಆಸಿತ, ದೇವಲ",
    pravaraRishisEn: "Shandilya, Asita, Devala",
    formulaKn: "ಶಾಂಡಿಲ್ಯ, ಆಸಿತ, ದೇವಲೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಶಾಂಡಿಲ್ಯ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Shandilya, Asita, Devaleti Trayarsheya Pravaranvita Shandilya Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "gargya",
    nameKn: "ಗಾರ್ಗ್ಯ ಗೋತ್ರ",
    nameEn: "Gargya Gotra",
    pravaraTypeKn: "ಪಂಚಾರ್ಷೇಯ",
    pravaraRishisKn: "ಆಂಗಿರಸ, ಬಾರ್ಹಸ್ಪತ್ಯ, ಭಾರದ್ವಾಜ, ಶೈನ್ಯ, ಗಾರ್ಗ್ಯ",
    pravaraRishisEn: "Angirasa, Barhaspatya, Bharadvaja, Shainya, Gargya",
    formulaKn: "ಆಂಗಿರಸ, ಬಾರ್ಹಸ್ಪತ್ಯ, ಭಾರದ್ವಾಜ, ಶೈನ್ಯ, ಗಾರ್ಗ್ಯೇತಿ ಪಂಚಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಗಾರ್ಗ್ಯ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Angirasa, Barhaspatya, Bharadvaja, Shainya, Gargyeti Pancharsheya Pravaranvita Gargya Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "agastya",
    nameKn: "ಅಗಸ್ತ್ಯ ಗೋತ್ರ",
    nameEn: "Agastya Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಅಗಸ್ತ್ಯ, ದಾರ್ಢ್ಯಚ್ಯುತ, ಇಧ್ಮವಾಹ",
    pravaraRishisEn: "Agastya, Dardhyachyuta, Idhmavaha",
    formulaKn: "ಅಗಸ್ತ್ಯ, ದಾರ್ಢ್ಯಚ್ಯುತ, ಇಧ್ಮವಾಹೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಅಗಸ್ತ್ಯ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Agastya, Dardhyachyuta, Idhmavaheti Trayarsheya Pravaranvita Agastya Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "naidhruva",
    nameKn: "ನೈಧ್ರುವ ಗೋತ್ರ",
    nameEn: "Naidhruva Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಕಶ್ಯಪ, ಅವತ್ಸಾರ, ನೈಧ್ರುವ",
    pravaraRishisEn: "Kashyapa, Avatsara, Naidhruva",
    formulaKn: "ಕಶ್ಯಪ, ಅವತ್ಸಾರ, ನೈಧ್ರುವೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ನೈಧ್ರುವ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Kashyapa, Avatsara, Naidhruveti Trayarsheya Pravaranvita Naidhruva Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  },
  {
    id: "mudgala",
    nameKn: "ಮುದ್ಗಲ ಗೋತ್ರ",
    nameEn: "Mudgala Gotra",
    pravaraTypeKn: "ತ್ರಯಾರ್ಷೇಯ",
    pravaraRishisKn: "ಆಂಗಿರಸ, ಭಾರ್ಮ್ಯಶ್ವ, ಮೌದ್ಗಲ್ಯ",
    pravaraRishisEn: "Angirasa, Bharmyashva, Maudgalya",
    formulaKn: "ಆಂಗಿರಸ, ಭಾರ್ಮ್ಯಶ್ವ, ಮೌದ್ಗಲ್ಯೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ಮುದ್ಗಲ ಗೋತ್ರೋತ್ಪನ್ನಃ {SHARMA} ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ।",
    formulaEn: "Angirasa, Bharmyashva, Maudgalyeti Trayarsheya Pravaranvita Mudgala Gotrotpannah {SHARMA} Sharma Ahamasmi Bho Abhivadaye |"
  }
];

export function buildPersonalizedAbhivadana(gotraId: string, devoteeName: string = "ಶ್ರೀರಾಮ"): { kn: string; en: string } {
  const gotra = GOTRA_CATALOG.find((g) => g.id === gotraId) || GOTRA_CATALOG[0];
  const cleanName = devoteeName.trim() || "ದೇವದತ್ತ";
  const sharmaNameKn = cleanName.endsWith("ಶರ್ಮ") || cleanName.endsWith("ಶರ್ಮಾ") ? cleanName : `${cleanName} ಶರ್ಮ`;
  const sharmaNameEn = cleanName;

  const kn = gotra.formulaKn.replace("{SHARMA}", sharmaNameKn);
  const en = gotra.formulaEn.replace("{SHARMA}", sharmaNameEn);
  return { kn, en };
}

// -------------------------------------------------------------
// 3. Four Featured Sacred Mahamantras (Listening & Japa Suite)
// -------------------------------------------------------------
export const FEATURED_MANTRA_SUITE: FeaturedMantraItem[] = [
  {
    id: "gayatri",
    titleKn: "ಶ್ರೀ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ (ವೇದಮಾತೆ)",
    titleEn: "Sri Gayatri Mahamantra",
    deityKn: "ಸವಿತೃ ದೇವತಾ (ಸೂರ್ಯಾಂತರ್ಗತ ನಾರಾಯಣ)",
    deityEn: "Savitri (Solar Cosmic Consciousness)",
    mantraSanskrit: "ॐ भूर्भुवस्स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥",
    mantraKannada: "ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ । ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ । ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥",
    meaningKn: "ಭೂಮಿ, ಅಂತರಿಕ್ಷ ಮತ್ತು ಸ್ವರ್ಗಲೋಕಗಳನ್ನು ವ್ಯಾಪಿಸಿರುವ ತೇಜೋಮಯನಾದ ಸವಿತೃ ದೇವನ ಆ ಪರಮ ಶ್ರೇಷ್ಠ ದಿವ್ಯ ತೇಜಸ್ಸನ್ನು ನಾವು ಧ್ಯಾನಿಸುತ್ತೇವೆ. ಆ ಪರಮಾತ್ಮನು ನಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿಯನ್ನು ಧರ್ಮ ಮತ್ತು ಸನ್ಮಾರ್ಗದ ಕಡೆಗೆ ಪ್ರೇರೇಪಿಸಲಿ.",
    meaningEn: "We meditate upon the supreme effulgence of the divine Creator Sun, who illumines the physical, astral, and celestial realms. May that supreme consciousness inspire and awaken our intellect towards righteousness.",
    significanceKn: "ಸಕಲ ವೇದಗಳ ಸಾರಭೂತವಾದ ಮಾತೃ ಮಂತ್ರ. ನಿತ್ಯವೂ ಪ್ರಾತಃ, ಮಧ್ಯಾಹ್ನ ಹಾಗೂ ಸಾಯಂಕಾಲ ಕನಿಷ್ಠ ೨೮ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪಿಸುವುದರಿಂದ ಸಕಲ ಪಾಪಗಳು ನಾಶವಾಗಿ ಬ್ರಹ್ಮತೇಜಸ್ಸು ಮತ್ತು ಬುದ್ಧಿ ವಿಕಾಸವಾಗುತ್ತದೆ.",
    japaOptions: [1, 3, 11, 28, 108],
    icon: "☀️"
  },
  {
    id: "panchakshari",
    titleKn: "ಶ್ರೀ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಮಹಾಮಂತ್ರ",
    titleEn: "Sri Shiva Panchakshari Mantra",
    deityKn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ (ಗೋಕರ್ಣ ಪರಶಿವ)",
    deityEn: "Lord Shiva (Mahabaleshwara)",
    mantraSanskrit: "ॐ नमः शिवाय॥",
    mantraKannada: "ಓಂ ನಮಃ ಶಿವಾಯ ॥",
    meaningKn: "ಮಂಗಳಸ್ವರೂಪನಾದ, ಸಕಲ ಜಗತ್ತಿನ ಕಲ್ಯಾಣಕಾರಕನಾದ ಪರಮೇಶ್ವರನಿಗೆ ನನ್ನ ಸಾಷ್ಟಾಂಗ ಪ್ರಣಾಮಗಳು.",
    meaningEn: "I bow with absolute devotion to Lord Shiva, the embodiment of auspiciousness, stillness, and supreme consciousness.",
    significanceKn: "ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಆತ್ಮಾನಂದ ಮಂತ್ರ. ಪಂಚಭೂತಗಳನ್ನು ಶುದ್ಧೀಕರಿಸಿ, ಮನಸ್ಸಿನ ಎಲ್ಲಾ ಆತಂಕ, ಭಯ ಮತ್ತು ಅಶಾಂತಿಯನ್ನು ಹೋಗಲಾಡಿಸುತ್ತದೆ.",
    japaOptions: [1, 11, 28, 108],
    icon: "🔱"
  },
  {
    id: "ashtakshari",
    titleKn: "ಶ್ರೀ ನಾರಾಯಣ ಅಷ್ಟಾಕ್ಷರೀ ಮಹಾಮಂತ್ರ",
    titleEn: "Sri Narayana Ashtakshari Mantra",
    deityKn: "ಶ್ರೀಮನ್ನಾರಾಯಣ (ಮಹಾ ವಿಷ್ಣು)",
    deityEn: "Lord Narayana (Maha Vishnu)",
    mantraSanskrit: "ॐ नमो नारायणाय॥",
    mantraKannada: "ಓಂ ನಮೋ ನಾರಾಯಣಾಯ ॥",
    meaningKn: "ಸಮಸ್ತ ಜೀವರಾಶಿಗಳ ಅಂತರ್ಯಾಮಿಯಾಗಿ ನೆಲೆಸಿರುವ, ಸಕಲ ವಿಶ್ವದ ರಕ್ಷಕನಾದ ಶ್ರೀಮನ್ನಾರಾಯಣನಿಗೆ ನಮಸ್ಕಾರಗಳು.",
    meaningEn: "Salutations to Lord Narayana, the supreme protector of all realms who dwells within the hearts of all living beings.",
    significanceKn: "ಸಕಲ ಸೌಭಾಗ್ಯ, ಶಾಂತಿ ಮತ್ತು ವೈಕುಂಠ ಪ್ರಾಪ್ತಿಗೆ ಕಾರಣವಾದ ಪರಮ ಪವಿತ್ರ ಮೋಕ್ಷ ಮಂತ್ರ. ಸಂಧ್ಯಾವಂದನೆಯ ಅಂತ್ಯದಲ್ಲಿ ಸಮರ್ಪಣಾ ಕಾಲದಲ್ಲಿ ನಿತ್ಯ ಸ್ಮರಣೀಯ.",
    japaOptions: [1, 11, 28, 108],
    icon: "🪷"
  },
  {
    id: "gotra_pravara",
    titleKn: "ಗೋತ್ರ ಪ್ರವರ ಅಭಿವಾದನ ಮಂತ್ರ",
    titleEn: "Gotra Pravara Abhivadana Mantra",
    deityKn: "ಋಷಿ ಪರಂಪರೆ & ಗುರು ದೇವತೆಗಳು",
    deityEn: "Vedic Rushi Ancestry Lineage",
    mantraSanskrit: "गोत्रोत्पन्नः... अभिवादये॥",
    mantraKannada: "ವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ... ಗೋತ್ರೋತ್ಪನ್ನಃ ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ॥",
    meaningKn: "ನನ್ನ ಪರಮ ಪವಿತ್ರ ಋಷಿ ಪ್ರವರ ಪರಂಪರೆಯಲ್ಲಿ ಜನಿಸಿದ ನಾನು, ದೇವತೆಗಳು, ಗುರುಗಳು ಮತ್ತು ಹಿರಿಯರಿಗೆ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರವನ್ನು ಸಲ್ಲಿಸುತ್ತೇನೆ.",
    meaningEn: "Having taken birth in this venerable lineage of seers and sages, I humbly present my prostrations before the deities, preceptors, and elders.",
    significanceKn: "ಸಂಧ್ಯಾವಂದನೆಯ ಅತ್ಯಂತ ಪ್ರಮುಖ ಮುಕ್ತಾಯ ಹಂತ. ತನ್ನ ಮೂಲ ಋಷಿ ಗೋತ್ರವನ್ನು ನೆನೆದು, ತನ್ನ ಕರ್ತವ್ಯವನ್ನು ಭಗವಂತನಿಗೆ ಅರ್ಪಿಸುವ ವಿನಮ್ರ ವಿಧಿ.",
    japaOptions: [1, 3],
    icon: "📜"
  }
];

// -------------------------------------------------------------
// 4. Complete Karnataka Vedic Sandhyavandana Steps (Sequential)
// -------------------------------------------------------------
export const SANDHYAVANDANA_STEPS: SandhyaStep[] = [
  // -----------------------------------------------------------
  // STEP 1: ಆಚಮನ (Aachamana)
  // -----------------------------------------------------------
  {
    id: "achamana",
    stepNumber: 1,
    category: "purification",
    titleKn: "೧. ಆಚಮನ (ವೇದತ್ರಯ ಆಚಮನ & ಕರ ಪ್ರಕ್ಷಾಲನ)",
    titleEn: "1. Aachamana (Triple Veda Sips & Hand Cleansing)",
    actionCueKn: "💧 ಉದ್ದರಣೆಯಿಂದ ಬಲ ಅಂಗೈಗೆ ನೀರು ಹಾಕಿ ೩ ಬಾರಿ ಸ್ವೀಕರಿಸಿ • ೧ ಬಾರಿ ನೀರು ಬಿಟ್ಟು ಹಸ್ತ ತೊಳೆಯಿರಿ",
    actionCueEn: "💧 Take water in right palm 3 times with mantra • Wash hands once",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ॐ भूः ऋग्वेदाय स्वाहा। ॐ भुवः यजुर्वेदाय स्वाहा। ॐ स्वः सामवेदाय स्वाहा। ॐ भूर्भुवस्स्वः करं प्रक्षाल्य।",
    mantraKannada: "ಓಂ ಭೂಃ ಋಗ್ವೇದಾಯ ಸ್ವಾಹಾ । (೧ನೇ ಆಚಮನ)\nಓಂ ಭುವಃ ಯಜುರ್ವೇದಾಯ ಸ್ವಾಹಾ । (೨ನೇ ಆಚಮನ)\nಓಂ ಸ್ವಃ ಸಾಮವೇದಾಯ ಸ್ವಾಹಾ । (೩ನೇ ಆಚಮನ)\nಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ಕರಂ ಪ್ರಕ್ಷಾಲ್ಯ । (ಹಸ್ತ ಪ್ರಕ್ಷಾಲನ)",
    meaningKn: "ಋಗ್ವೇದ, ಯಜುರ್ವೇದ ಮತ್ತು ಸಾಮವೇದಗಳ ಅಧಿದೇವತೆಗಳನ್ನು ಸ್ಮರಿಸಿ ಆಚಮನ ಮಾಡುತ್ತೇನೆ. ನಂತರ ಕೈಗಳನ್ನು ಪವಿತ್ರ ಜಲದಿಂದ ತೊಳೆದುಕೊಳ್ಳುತ್ತೇನೆ.",
    meaningEn: "Sipping water invoking Rigveda, Yajurveda, and Samaveda, followed by water release to cleanse both hands.",
    priestSpokenInstructionKn: "ಹರಿ ಓಂ. ಪವಿತ್ರ ಸಂಧ್ಯಾವಂದನೆಯ ಮೊದಲನೆಯ ಹಂತ ಆಚಮನ. ನಿಮ್ಮ ಬಲ ಅಂಗೈಗೆ ಉದ್ದರಣೆಯಿಂದ ಸ್ವಲ್ಪ ನೀರನ್ನು ಹಾಕಿಕೊಳ್ಳಿ. ಮೊದಲ ಬಾರಿಗೆ 'ಓಂ ಭೂಃ ಋಗ್ವೇದಾಯ ಸ್ವಾಹಾ' ಎಂದು ಹೇಳಿ ನೀರನ್ನು ಕುಡಿಯಿರಿ. ಎರಡನೇ ಬಾರಿಗೆ 'ಓಂ ಭುವಃ ಯಜುರ್ವೇದಾಯ ಸ್ವಾಹಾ' ಎಂದು ಕುಡಿಯಿರಿ. ಮೂರನೇ ಬಾರಿಗೆ 'ಓಂ ಸ್ವಃ ಸಾಮವೇದಾಯ ಸ್ವಾಹಾ' ಎಂದು ಕುಡಿಯಿರಿ. ನಂತರ ಹರಿವಾಣಕ್ಕೆ ಸ್ವಲ್ಪ ನೀರು ಬಿಟ್ಟು 'ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ಕರಂ ಪ್ರಕ್ಷಾಲ್ಯ' ಎಂದು ಕೈಗಳನ್ನು ತೊಳೆದುಕೊಳ್ಳಿ.",
    priestSpokenInstructionEn: "Hari Om. Begin Sandhyavandana with sacred Aachamana. Take water with the spoon onto your right palm. Sip once chanting Om Bhuh Rigvedaya Svaha, sip second chanting Om Bhuvah Yajurvedaya Svaha, sip third chanting Om Svah Samavedaya Svaha, then release water and wash hands.",
    kaikaranaNotesKn: "ಕೈಕರಣ ನಿಯಮ: ಬಲ ಅಂಗೈಯ ಹೆಬ್ಬೆರಳಿನ ಮೂಲವಾದ ಬ್ರಾಹ್ಮತೀರ್ಥದಿಂದ ನೀರನ್ನು ಶಬ್ದವಾಗದಂತೆ ಶ್ರದ್ಧೆಯಿಂದ ಸ್ವೀಕರಿಸಬೇಕು. ಉದ್ದರಣೆಯು ನೇರವಾಗಿ ತುಟಿಗೆ ತಾಗಬಾರದು. ಕೈ ತೊಳೆದ ನಂತರ ದ್ವಾದಶ ನಾಮಗಳಿಂದ (ಗೋವಿಂದ, ವಿಷ್ಣು, ಮಧುಸೂದನ, ತ್ರಿವಿಕ್ರಮ, ವಾಮನ, ಶ್ರೀಧರ, ಹೃಷೀಕೇಶ, ಪದ್ಮನಾಭ, ದಾಮೋದರ) ಮುಖ, ಮೂಗು, ಕಣ್ಣು, ಕಿವಿಗಳನ್ನು ಸ್ಪರ್ಶಿಸಬೇಕು.",
    approxSeconds: 30,
    icon: "💧"
  },

  // -----------------------------------------------------------
  // STEP 2: ಭಸ್ಮ ಧಾರಣ (Bhasma Dhaarana / Tilaka)
  // -----------------------------------------------------------
  {
    id: "bhasma_dharana",
    stepNumber: 2,
    category: "bhasma",
    titleKn: "೨. ಭಸ್ಮ ಧಾರಣ / ವಿಭೂತಿ ವಿಧಿ (ಪ್ರಣವ & ತ್ರ್ಯಂಬಕ ಮಂತ್ರ)",
    titleEn: "2. Bhasma Dhaarana (Sacred Ash & Tilaka Application)",
    actionCueKn: "🕉️ ಬಲ ಅಂಗೈಗೆ ಭಸ್ಮ ಹಾಕಿ ನೀರು ಸೇರಿಸಿ ಅಭಿಮಂತ್ರಿಸಿ • ಹಣೆ, ಕಂಠ, ಬಾಹುಗಳಿಗೆ ತ್ರಿಪುಂಡ್ರ ಧರಿಸಿ",
    actionCueEn: "🕉️ Consecrate sacred ash with water in palm • Apply Tripundra on forehead and arms",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ॐ प्रणवस्य परब्रह्म ऋषिः। परमात्मा देवता। देवी गायत्री छन्दः। अग्निborder इति भस्म। वायुरिति भस्म। जलमिति भस्म। स्थलमिति भस्म। व्योमेति भस्म। सर्वं ह वा इदं भस्म। मन एतानि चक्षूंषि भस्मानि॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥",
    mantraKannada: "ಓಂ ಪ್ರಣವಸ್ಯ ಪರಬ್ರಹ್ಮ ಋಷಿಃ । ಪರಮಾತ್ಮಾ ದೇವತಾ । ದೇವೀ ಗಾಯತ್ರೀ ಛಂದಃ ॥\nಅಗ್ನಿರಿತಿ ಭಸ್ಮ, ವಾಯುರಿತಿ ಭಸ್ಮ, ಜಲಮಿತಿ ಭಸ್ಮ, ಸ್ಥಲಮಿತಿ ಭಸ್ಮ, ವ್ಯೋಮೇತಿ ಭಸ್ಮ, ಸರ್ವಂ ಹ ವಾ ಇದಂ ಭಸ್ಮ, ಮನ ಏತಾನಿ ಚಕ್ಷೂಂಷಿ ಭಸ್ಮಾನಿ ॥\nಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಊರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥",
    meaningKn: "ಅಗ್ನಿ, ವಾಯು, ಜಲ, ಭೂಮಿ, ಆಕಾಶ ಮುಂತಾದ ಪಂಚಭೂತಗಳೆಲ್ಲವೂ ಬ್ರಹ್ಮಸ್ವರೂಪವಾದ ಭಸ್ಮವೇ ಆಗಿದೆ. ಆ ಸುಗಂಧಿಯುತನಾದ, ಸಕಲ ಜೀವಿಗಳನ್ನು ಪೋಷಿಸುವ ತ್ರ್ಯಂಬಕ ಪರಶಿವನನ್ನು ನಾವು ಆರಾಧಿಸುತ್ತೇವೆ. ಬಳ್ಳಿಯಿಂದ ಹಣ್ಣು ಬಿಡುಗಡೆಯಾಗುವಂತೆ ನಮ್ಮನ್ನು ಸಂಸಾರದ ಮೃತ್ಯು ಬಂಧನದಿಂದ ಮುಕ್ತಗೊಳಿಸಿ ಅಮೃತತ್ವವನ್ನು ಅನುಗ್ರಹಿಸಲಿ.",
    meaningEn: "All the five elements—fire, air, water, earth, space—are manifestations of the divine essence. We worship Lord Shiva, the fragrant nourisher of all, seeking liberation from mortality into supreme immortality.",
    priestSpokenInstructionKn: "ಈಗ ಭಸ್ಮ ಧಾರಣ ವಿಧಿ. ಎಡ ಅಂಗೈಯಲ್ಲಿ ಶುದ್ಧವಾದ ವಿಭೂತಿಯನ್ನು ಹಾಕಿಕೊಂಡು, ಸ್ವಲ್ಪ ನೀರು ಸೇರಿಸಿ, ಬಲಗೈ ಉಂಗುಷ್ಟ ಬೆರಳುಗಳಿಂದ ಮಂತ್ರವನ್ನು ಹೇಳುತ್ತಾ ಕಲಸಿ. 'ಪ್ರಣವಸ್ಯ ಪರಬ್ರಹ್ಮ ಋಷಿಃ... ಅಗ್ನಿರಿತಿ ಭಸ್ಮ... ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ...' ಎಂದು ಪಠಿಸುತ್ತಾ, ಬಲಗೈ ಮಧ್ಯದ ಮೂರು ಬೆರಳುಗಳಿಂದ ಹಣೆಗೆ ತ್ರಿಪುಂಡ್ರ ರೇಖೆಯನ್ನು ಧರಿಸಿ. ನಂತರ ಕಂಠ, ಎದೆ ಮತ್ತು ಭುಜಗಳಿಗೆ ಲೇಪಿಸಿಕೊಳ್ಳಿ.",
    priestSpokenInstructionEn: "Now apply sacred Bhasma. Place pure ash on your palm, add a drop of water, chant the Pranava, Agniritibhasma, and Tryambakam mantras, and apply the three horizontal lines (Tripundra) across your forehead, neck, and shoulders.",
    kaikaranaNotesKn: "ಕೈಕರಣ ವಿವರ: ಬಲಗೈ ತೋರುಬೆರಳು, ಮಧ್ಯದ ಬೆರಳು ಮತ್ತು ಉಂಗುರದ ಬೆರಳುಗಳಿಂದ (ತರ್ಜನಿ, ಮಧ್ಯಮಾ, ಅನಾಮಿಕಾ) ಎಡದಿಂದ ಬಲಕ್ಕೆ ಹಣೆಯ ಮೇಲೆ ಮೂರು ರೇಖೆಗಳನ್ನು (ತ್ರಿಪುಂಡ್ರ) ಎಳೆಯಬೇಕು. ಇದು ಅಜ್ಞಾನ, ಕಾಮ, ಕ್ರೋಧಗಳ ನಾಶದ ಸಂಕೇತ.",
    approxSeconds: 35,
    icon: "🔱"
  },

  // -----------------------------------------------------------
  // STEP 3: ಸಂಕಲ್ಪ (Sankalpa)
  // -----------------------------------------------------------
  {
    id: "sankalpa",
    stepNumber: 3,
    category: "sankalpa",
    titleKn: "೩. ಸಂಕಲ್ಪ (ತ್ರಿಕಾಲ ಸಂಧ್ಯೋಪಾಸನಾ ಸಂಕಲ್ಪ)",
    titleEn: "3. Sankalpa (Sacred Declaration of Intent)",
    actionCueKn: "🙏 ಬಲ ತೊಡೆಯ ಮೇಲೆ ಕೈಗಳನ್ನು ಜೋಡಿಸಿ ಮುಷ್ಠಿ ಕಟ್ಟಿ (ಬಲಗೈ ಮೇಲಿರಲಿ) ಸಂಕಲ್ಪ ಪಠಿಸಿ",
    actionCueEn: "🙏 Place right palm over left palm upon right thigh in folded posture",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ममोपात्त समस्त दुरितक्षयद्वारा श्री परमेश्वर प्रीत्यर्थं प्रातः/माध्याह्निक/सायं सन्ध्योपासनं करिष्ये॥",
    mantraKannada: "ಶುಭೇ ಶೋಭನೇ ಮುಹೂರ್ತೇ, ಆದ್ಯ ಬ್ರಹ್ಮಣಃ ದ್ವಿತೀಯ ಪರಾರ್ಧೇ, ಶ್ರೀ ಶ್ವೇತವರಾಹಕಲ್ಪೇ, ವೈವಸ್ವತ ಮನ್ವಂತರೇ, ಕಲಿಯುಗೇ, ಪ್ರಥಮಪಾದೇ, ಜಂಬೂದ್ವೀಪೇ, ಭರತವರ್ಷೇ, ಭರತಖಂಡೇ, ದಂಡಕಾರಣ್ಯೇ, ಗೋಕರ್ಣ ಮಂಡಲೇ...\nಮಮೋಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ ಪ್ರೀತ್ಯರ್ಥಂ ಪ್ರಾತಃ / ಮಾಧ್ಯಾಹ್ನಿಕ / ಸಾಯಂ ಸಂಧ್ಯೋಪಾಸನಂ ಕರಿಷ್ಯೇ ॥",
    meaningKn: "ನನ್ನ ಹಿಂದಿನ ಜನ್ಮ ಮತ್ತು ಈ ಜನ್ಮದ ಸಮಸ್ತ ಪಾಪ-ದುರಿತಗಳು ನಾಶವಾಗಿ, ಶ್ರೀ ಪರಮೇಶ್ವರನ ದಿವ್ಯ ಕೃಪೆ ಲಭಿಸುವುದಕ್ಕಾಗಿ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಧ್ಯೋಪಾಸನೆಯನ್ನು ಕೈಗೊಳ್ಳುತ್ತಿದ್ದೇನೆ.",
    meaningEn: "For the purification of all past misdeeds and to please the Supreme Lord, I perform this sacred morning/noon/evening Sandhyavandana meditation.",
    priestSpokenInstructionKn: "ಈಗ ಸಂಕಲ್ಪವನ್ನು ಮಾಡೋಣ. ನಿಮ್ಮ ಎಡಗೈಯನ್ನು ಬಲ ತೊಡೆಯ ಮೇಲಿಟ್ಟು, ಅದರ ಮೇಲೆ ಬಲ ಅಂಗೈಯನ್ನು ಮುಚ್ಚಿಟ್ಟುಕೊಳ್ಳಿ. ಮನಸ್ಸನ್ನು ಪರಮಾತ್ಮನಲ್ಲಿ ಏಕಾಗ್ರಗೊಳಿಸಿ 'ಮಮೋಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ ಪ್ರೀತ್ಯರ್ಥಂ ಸಂಧ್ಯೋಪಾಸನಂ ಕರಿಷ್ಯೇ' ಎಂದು ಗಟ್ಟಿಯಾಗಿ ಸಂಕಲ್ಪಿಸಿ, ಉದ್ದರಣೆಯಿಂದ ಹರಿವಾಣಕ್ಕೆ ಪವಿತ್ರ ಜಲವನ್ನು ಬಿಡಿ.",
    priestSpokenInstructionEn: "Now place your right palm over your left palm on your right thigh in the sacred Sankalpa mudra, dedicate your mind to the Lord, state your intent, and release water into the plate.",
    kaikaranaNotesKn: "ಕಾಲಾನುಸಾರ ಮಂತ್ರ ಬದಲಾವಣೆ: ಬೆಳಿಗ್ಗೆ 'ಪ್ರಾತಃ ಸಂಧ್ಯೋಪಾಸನಂ ಕರಿಷ್ಯೇ', ಮಧ್ಯಾಹ್ನ 'ಮಾಧ್ಯಾಹ್ನಿಕ ಸಂಧ್ಯೋಪಾಸನಂ ಕರಿಷ್ಯೇ', ಸಾಯಂಕಾಲ 'ಸಾಯಂ ಸಂಧ್ಯೋಪಾಸನಂ ಕರಿಷ್ಯೇ' ಎಂದು ಹೇಳಬೇಕು.",
    approxSeconds: 25,
    icon: "✋"
  },

  // -----------------------------------------------------------
  // STEP 4: ಪ್ರಾಣಾಯಾಮ (Pranayama)
  // -----------------------------------------------------------
  {
    id: "pranayama",
    stepNumber: 4,
    category: "pranayama",
    titleKn: "೪. ಪ್ರಾಣಾಯಾಮ (ಸಪ್ತ ವ್ಯಾಹೃತಿ & ಗಾಯತ್ರೀ ಶಿರೋಮಂತ್ರ)",
    titleEn: "4. Pranayama (Seven Cosmic Vyahritis & Gayatri Shiras)",
    actionCueKn: "🌬️ ಬಲ ಹೆಬ್ಬೆರಳಿನಿಂದ ಬಲ ಮೂಗನ್ನು ಮುಚ್ಚಿ ಎಡದಿಂದ ಉಸಿರೆಳೆದು • ಹಿಡಿದಿಟ್ಟು (ಕುಂಭಕ) ಬಲದಿಂದ ಬಿಡಿ",
    actionCueEn: "🌬️ Close right nostril with thumb, inhale left, hold, exhale right reciting Vyahritis",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ॐ भूः। ॐ भुवः। ॐ सुवः। ॐ महः। ॐ जनः। ॐ तपः। ॐ सत्यम्॥ ॐ तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥ ॐ आपो ज्योती रसोऽमृतं ब्रह्म भूर्भुवस्सुवरोम्॥",
    mantraKannada: "ಓಂ ಭೂಃ । ಓಂ ಭುವಃ । ಓಂ ಸುವಃ । ಓಂ ಮಹಃ । ಓಂ ಜನಃ । ಓಂ ತಪಃ । ಓಂ ಸತ್ಯಮ್ ॥\nಓಂ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥\nಓಮಾಪೋ ಜ್ಯೋತೀ ರಸೋಽಮೃತಂ ಬ್ರಹ್ಮ ಭೂರ್ಭುವಸ್ಸುವರೋಮ್ ॥",
    meaningKn: "ಸಪ್ತ ಲೋಕಗಳಾದ ಭೂಃ, ಭುವಃ, ಸುವಃ, ಮಹಃ, ಜನಃ, ತಪಃ, ಸತ್ಯಂ ಪರಬ್ರಹ್ಮ ಸ್ವರೂಪವಾಗಿವೆ. ಸವಿತೃ ದೇವನ ಜ್ಯೋತಿಯನ್ನು ಧ್ಯಾನಿಸುತ್ತೇವೆ. ಆ ಜ್ಯೋತಿರ್ಮಯ ಅಮೃತ ಬ್ರಹ್ಮವೇ ಪರಮ ಸತ್ಯ.",
    meaningEn: "Meditating upon the seven cosmic planes of reality, the solar illuminator, and the divine nectar of eternal consciousness.",
    priestSpokenInstructionKn: "ಈಗ ಪ್ರಾಣಾಯಾಮ. ಬಲಗೈ ಹೆಬ್ಬೆರಳಿನಿಂದ ಬಲ ನಾಸಿಕವನ್ನು ಮುಚ್ಚಿ, ಎಡ ನಾಸಿಕದಿಂದ ದೀರ್ಘವಾಗಿ ಉಸಿರನ್ನು ಒಳಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ (ಪೂರಕ). ನಂತರ ಕಿರುಬೆರಳು ಮತ್ತು ಉಂಗುಷ್ಟ ಬೆರಳುಗಳಿಂದ ಎರಡೂ ಮೂಗುಗಳನ್ನು ಮುಚ್ಚಿ ಉಸಿರನ್ನು ಎದೆಯಲ್ಲಿ ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳಿ (ಕುಂಭಕ). ಮನಸ್ಸಿನಲ್ಲಿ ಸಪ್ತ ವ್ಯಾಹೃತಿ ಮತ್ತು ಗಾಯತ್ರೀ ಶಿರೋಮಂತ್ರವನ್ನು ಜಪಿಸಿ. ಕೊನೆಯಲ್ಲಿ ಬಲ ಹೆಬ್ಬೆರಳನ್ನು ತೆಗೆದು ನಿಧಾನವಾಗಿ ಉಸಿರನ್ನು ಹೊರಬಿಡಿ (ರೇಚಕ).",
    priestSpokenInstructionEn: "Perform Pranayama: Inhale deeply through the left nostril (Puraka), hold your breath gently while reciting the seven Vyahritis and Gayatri Shiras mentally (Kumbhaka), and slowly exhale through the right nostril (Rechaka).",
    kaikaranaNotesKn: "ಪ್ರಾಣಾಯಾಮ ಕರನ್ಯಾಸ: ಹೆಬ್ಬೆರಳು (ಅಂಗುಷ್ಠ) ಮತ್ತು ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ) ಹಾಗೂ ಕಿರುಬೆರಳಿನಿಂದ (ಕನಿಷ್ಠಿಕಾ) ನಾಸಿಕಾಗ್ರವನ್ನು ಮುಚ್ಚಬೇಕು. ತೋರುಬೆರಳನ್ನು ಎಂದಿಗೂ ಮೂಗಿಗೆ ತಾಗಿಸಬಾರದು.",
    approxSeconds: 40,
    icon: "🌬️"
  },

  // -----------------------------------------------------------
  // STEP 5: ಮಾರ್ಜನ (Marjana - Sacred Water Sprinkling)
  // -----------------------------------------------------------
  {
    id: "marjana",
    stepNumber: 5,
    category: "marjana",
    titleKn: "೫. ಮಾರ್ಜನ & ಪ್ರೋಕ್ಷಣ (ಆಪೋ ಹಿ ಷ್ಠಾ ಮಯೋಭುವಃ)",
    titleEn: "5. Marjana (Water Purification of Body & Mind)",
    actionCueKn: "🌿 ದರ್ಬೆ ಅಥವಾ ಹೂವಿನಿಂದ ಉದ್ದರಣೆ ನೀರಿನ ಹನಿಗಳನ್ನು ಶಿರಸ್ಸಿಗೆ, ಎದೆಗೆ ಹಾಗೂ ಪಾದಗಳಿಗೆ ಪ್ರೋಕ್ಷಿಸಿ",
    actionCueEn: "🌿 Sprinkle water drops onto crown of head, heart, and ground using holy grass",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "आपो हि ष्ठा मयोभुवः। ता न ऊर्जे दधातन। महे रणाय चक्षसे॥ यो वः शिवतमो रसः। तस्य भाजयतेह नः। उशतीरिव मातरः॥ तस्मा अरं गमाम वः। यस्य क्षयाय जिन्वथ। आपो जनयथा च नः॥",
    mantraKannada: "ಆಪೋ ಹಿ ಷ್ಠಾ ಮಯೋಭುವಃ । ತಾ ನ ಊರ್ಜೇ ದಧಾತನ । ಮಹೇ ರಣಾಯ ಚಕ್ಷಸೇ ॥\nಯೋ ವಃ ಶಿವತಮೋ ರಸಃ । ತಸ್ಯ ಭಾಜಯತೇಹ ನಃ । ಉಶತೀರಿವ ಮಾತರಃ ॥\nತಸ್ಮಾ ಅರಂ ಗಮಾಮ ವಃ । ಯಸ್ಯ ಕ್ಷಯಾಯ ಜಿನ್ವಥ । ಆಪೋ ಜನಯಥಾ ಚ ನಃ ॥",
    meaningKn: "ಹೇ ಪವಿತ್ರ ಜಲದೇವತೆಗಳೇ! ನೀವು ಆನಂದದಾಯಕರು. ನಮಗೆ ಶಕ್ತಿ ಮತ್ತು ದಿವ್ಯ ದೃಷ್ಟಿಯನ್ನು ದಯಪಾಲಿಸಿರಿ. ತಾಯಿಯು ಮಗುವಿಗೆ ಅಮೃತವನ್ನು ಉಣಿಸುವಂತೆ ನಿಮ್ಮ ಕಲ್ಯಾಣಕರವಾದ ರಸವನ್ನು ನಮಗೆ ನೀಡಿರಿ.",
    meaningEn: "O sacred celestial waters, you are the sources of bliss. Bestow upon us vitality, supreme vision, and loving motherly grace to nourish our spiritual journey.",
    priestSpokenInstructionKn: "ಈಗ ಮಾರ್ಜನ ವಿಧಿ. ಉದ್ದರಣೆಯಿಂದ ಸ್ವಲ್ಪ ನೀರನ್ನು ಹೂವು ಅಥವಾ ದರ್ಬೆಯಿಂದ ತೆಗೆದುಕೊಂಡು, ಒಂಬತ್ತು ಬಾರಿ ಮಂತ್ರವನ್ನು ಉಚ್ಚರಿಸುತ್ತಾ ಶಿರಸ್ಸು, ಎದೆ ಮತ್ತು ಪಾದಗಳಿಗೆ ಪ್ರೋಕ್ಷಿಸಿಕೊಳ್ಳಿ.",
    priestSpokenInstructionEn: "Now perform Marjana. Sprinkle sanctified water drops onto your head, chest, and ground nine times reciting the sacred Rigvedic water hymns.",
    kaikaranaNotesKn: "ಪ್ರೋಕ್ಷಣ ಕ್ರಮ: ೧, ೨, ೩ನೇ ಪಾದದಲ್ಲಿ ಶಿರಸ್ಸಿಗೆ; ೪ನೇ ಪಾದದಲ್ಲಿ ಭೂಮಿಗೆ; ೫, ೬ನೇ ಪಾದದಲ್ಲಿ ಶಿರಸ್ಸಿಗೆ; ೭ನೇ ಪಾದದಲ್ಲಿ ಭೂಮಿಗೆ; ೮, ೯ನೇ ಪಾದದಲ್ಲಿ ಪುನಃ ಶಿರಸ್ಸಿಗೆ ಪ್ರೋಕ್ಷಿಸಬೇಕು.",
    approxSeconds: 35,
    icon: "🌿"
  },

  // -----------------------------------------------------------
  // STEP 6: ಜಲಪ್ರಾಶನ / ಆಚಮನ (Kala-Specific Jalaprashana)
  // -----------------------------------------------------------
  {
    id: "jalaprashana",
    stepNumber: 6,
    category: "purification",
    titleKn: "೬. ಜಲಪ್ರಾಶನ (ಕಾಲಾನುಗುಣ ಆಚಮನ)",
    titleEn: "6. Jalaprashana (Time-Specific Inner Cleansing Sip)",
    actionCueKn: "💧 ಬಲ ಅಂಗೈಗೆ ನೀರು ಹಾಕಿ ಕಾಲಾನುಗುಣ ಮಂತ್ರದಿಂದ ಒಮ್ಮೆ ಸ್ವೀಕರಿಸಿ ಹಸ್ತ ಪ್ರಕ್ಷಾಲನ ಮಾಡಿ",
    actionCueEn: "💧 Take water in palm, recite specific time mantra, sip, and wash hands",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "सूर्यश्च मा मन्युश्च... / आपः पुनन्तु पृथिवीं... / अग्निश्च मा मन्युश्च...",
    mantraKannada: "[ಪ್ರಾತಃ ಕಾಲ]: ಸೂರ್ಯಶ್ಚ ಮಾ ಮನ್ಯುಶ್ಚ ಮನ್ಯುಪತಯಶ್ಚ ಮನ್ಯುಕೃತೇಭ್ಯಃ ಪಾಪೇಭ್ಯೋ ರಕ್ಷಂತಾಮ್ । ಯದ್ರಾತ್ರ್ಯಾ ಪಾಪಮಕಾರ್ಷಂ ಮನಸಾ ವಾಚಾ ಹಸ್ತಾಭ್ಯಾಂ ಪದ್ಭ್ಯಾಮುದರೇಣ ಶಿಶ್ನಾ ರಾತ್ರಿಸ್ತದವಲುಂಪತು । ಯತ್ಕಿಂಚ ದುರಿತಂ ಮಯಿ ಇದಮಹಂ ಮಾಮಮೃತಯೋನೌ ಸೂರ್ಯೇ ಜ್ಯೋತಿಷಿ ಜುಹೋಮಿ ಸ್ವಾಹಾ ॥\n\n[ಮಾಧ್ಯಾಹ್ನ ಕಾಲ]: ಆಪಃ ಪುನಂತು ಪೃಥಿವೀಂ ಪೃಥಿವೀ ಪೂತಾ ಪುನಾತು ಮಾಮ್ । ಪುನಂತು ಬ್ರಹ್ಮಣಸ್ಪತಿರ್ಬ್ರಹ್ಮಪೂತಾ ಪುನಾತು ಮಾಮ್ । ಯದುಚ್ಛಿಷ್ಟಮಭೋಜ್ಯಂ ಚ ಯದ್ವಾ ದುಶ್ಚರಿತಂ ಮಮ । ಸರ್ವಂ ಪುನಂತು ಮಾಮಾಪೋಽಸತಾಂ ಚ ಪ್ರತಿಗ್ರಹಗ್ ಸ್ವಾಹಾ ॥\n\n[ಸಾಯಂಕಾಲ]: ಅಗ್ನಿಶ್ಚ ಮಾ ಮನ್ಯುಶ್ಚ ಮನ್ಯುಪತಯಶ್ಚ ಮನ್ಯುಕೃತೇಭ್ಯಃ ಪಾಪೇಭ್ಯೋ ರಕ್ಷಂತಾಮ್ । ಯದಹ್ನಾ ಪಾಪಮಕಾರ್ಷಂ ಮನಸಾ ವಾಚಾ ಹಸ್ತಾಭ್ಯಾಂ ಪದ್ಭ್ಯಾಮುದರೇಣ ಶಿಶ್ನಾ ಅಹಸ್ತದವಲುಂಪತು । ಯತ್ಕಿಂಚ ದುರಿತಂ ಮಯಿ ಇದಮಹಂ ಮಾಮಮೃತಯೋನೌ ಸತ್ಯೇ ಜ್ಯೋತಿಷಿ ಜುಹೋಮಿ ಸ್ವಾಹಾ ॥",
    meaningKn: "ಹಗಲು ಅಥವಾ ರಾತ್ರಿಯಲ್ಲಿ ಮನಸ್ಸು, ಮಾತು, ಕೈ, ಕಾಲುಗಳಿಂದ ತಿಳಿದೋ ತಿಳಿಯದೆಯೋ ಮಾಡಿದ ಸಮಸ್ತ ಪಾಪಗಳನ್ನು ಜಲದೇವತೆಗಳು ಭಸ್ಮಮಾಡಿ ಶುದ್ಧೀಕರಿಸಲಿ.",
    meaningEn: "May the presiding deities of the Sun, Fire, and Waters absolve all sins committed through mind, speech, hands, and senses, offering them into the cosmic sacrificial fire.",
    priestSpokenInstructionKn: "ಈಗ ಜಲಪ್ರಾಶನ. ಪ್ರಾತಃಕಾಲದಲ್ಲಿ 'ಸೂರ್ಯಶ್ಚ ಮಾ ಮನ್ಯುಶ್ಚ...', ಮಧ್ಯಾಹ್ನದಲ್ಲಿ 'ಆಪಃ ಪುನಂತು ಪೃಥಿವೀಂ...', ಸಾಯಂಕಾಲದಲ್ಲಿ 'ಅಗ್ನಿಶ್ಚ ಮಾ ಮನ್ಯುಶ್ಚ...' ಮಂತ್ರದಿಂದ ಬಲ ಅಂಗೈಯಿಂದ ನೀರನ್ನು ಒಮ್ಮೆ ಸ್ವೀಕರಿಸಿ, ನಂತರ ಹಸ್ತ ಪ್ರಕ್ಷಾಲನ ಮಾಡಿಕೊಳ್ಳಿ.",
    priestSpokenInstructionEn: "Now perform Jalaprashana according to the time of day: Morning uses Suryascha Ma, Midday uses Apah Punantu, and Evening uses Agnischa Ma. Sip once and wash hands.",
    kaikaranaNotesKn: "ಈ ಮಂತ್ರದಿಂದ ಶರೀರದ ಒಳಗಿನ ಅಂತರಂಗ ಶುದ್ಧಿಯಾಗುತ್ತದೆ. ದಿನದ ಮೂರು ಕಾಲಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಮಂತ್ರಗಳು ಬದಲಾಗುತ್ತವೆ.",
    approxSeconds: 30,
    icon: "🌊"
  },

  // -----------------------------------------------------------
  // STEP 7: ಪುನರ್ಮಾರ್ಜನ (Punar-Marjana)
  // -----------------------------------------------------------
  {
    id: "punar_marjana",
    stepNumber: 7,
    category: "marjana",
    titleKn: "೭. ಪುನರ್ಮಾರ್ಜನ (ದಧಿಕ್ರಾವ್ಣೋ ಅಕಾರಿಷಂ)",
    titleEn: "7. Punar-Marjana (Second Sacred Sprinkling)",
    actionCueKn: "🌿 ದರ್ಬೆಯಿಂದ ನೀರನ್ನು ಶಿರಸ್ಸಿಗೆ ಪ್ರೋಕ್ಷಿಸಿ ಪವಿತ್ರ ನಾದವನ್ನು ಧ್ಯಾನಿಸಿ",
    actionCueEn: "🌿 Sprinkle water again over the head reciting Dadhikravno hymn",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "दधिक्राव्णो अकारिषं जिष्णोरश्वस्य वाजिनः। सुरभि नो मुखा करत् प्रण आयूंषि तारिषत्॥ आपो हि ष्ठा मयोभुवः...॥",
    mantraKannada: "ದಧಿಕ್ರಾವ್ಣೋ ಅಕಾರಿಷಂ ಜಿಷ್ಣೋರಶ್ವಸ್ಯ ವಾಜಿನಃ । ಸುರಭಿ ನೋ ಮುಖಾ ಕರತ್ ಪ್ರ ಣ ಆಯೂಂಷಿ ತಾರಿಷತ್ ॥\nಆಪೋ ಹಿ ಷ್ಠಾ ಮಯೋಭುವಃ... ಶಂಭೋ ಮಯೋಭುವಃ ॥",
    meaningKn: "ವಿಜಯಶಾಲಿಯೂ, ಶಕ್ತಿಶಾಲಿಯೂ ಆದ ಅಗ್ನಿಸ್ವರೂಪ ದಧಿಕ್ರಾವನನ್ನು ನಾವು ಸ್ತುತಿಸುತ್ತೇವೆ. ಅವನು ನಮ್ಮ ಇಂದ್ರಿಯಗಳನ್ನು ಸುಗಂಧಭರಿತವಾಗಿ ಮಾಡಿ ನಮ್ಮ ಆಯುಷ್ಯವನ್ನು ವೃದ್ಧಿಸಲಿ.",
    meaningEn: "We praise the swift, victorious divine steed Dadhikrava. May he bestow fragrance and clarity upon our senses and lengthen our lifespan.",
    priestSpokenInstructionKn: "ಈಗ ಪುನರ್ಮಾರ್ಜನ. 'ದಧಿಕ್ರಾವ್ಣೋ ಅಕಾರಿಷಂ...' ಎಂದು ಪಠಿಸುತ್ತಾ ಪುನಃ ಪವಿತ್ರ ಜಲವನ್ನು ಶಿರಸ್ಸಿಗೆ ಪ್ರೋಕ್ಷಿಸಿಕೊಳ್ಳಿ.",
    priestSpokenInstructionEn: "Perform second Marjana with Dadhikravno hymn, sprinkling holy water droplets upon the crown.",
    kaikaranaNotesKn: "ಈ ಹಂತದಿಂದ ಇಂದ್ರಿಯಗಳು ಜಪಕ್ಕೆ ಸಂಪೂರ್ಣವಾಗಿ ಸನ್ನದ್ಧವಾಗುತ್ತವೆ.",
    approxSeconds: 25,
    icon: "🌱"
  },

  // -----------------------------------------------------------
  // STEP 8: ಸೂರ್ಯಾರ್ಘ್ಯ ಪ್ರದಾನ (Arghya Pradana - Morning / Midday / Evening)
  // -----------------------------------------------------------
  {
    id: "arghya_pradana",
    stepNumber: 8,
    category: "arghya",
    titleKn: "೮. ಸೂರ್ಯಾರ್ಘ್ಯ ಪ್ರದಾನ (ತ್ರಿಕಾಲ ಅರ್ಘ್ಯ ವಿಧಿ)",
    titleEn: "8. Suryarghya Pradana (Offering Sacred Water to the Sun)",
    actionCueKn: "☀️ ಎರಡೂ ಅಂಗೈಗಳನ್ನು ಜೋಡಿಸಿ (ಅಂಜಲಿ ಮುದ್ರೆ) ಉದ್ದರಣೆಯಿಂದ ನೀರು ತುಂಬಿ ಸೂರ್ಯನಿಗೆ ೩ ಬಾರಿ ಅರ್ಪಿಸಿ",
    actionCueEn: "☀️ Cup both hands in Anjali Mudra, fill with water, and offer to the Sun 3 times",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ॐ भूर्भुवस्स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्। सूर्याय इदमर्घ्यं दत्तं न मम॥",
    mantraKannada: "[ಪ್ರಾತಃ ಕಾಲ - ೩ ಅರ್ಘ್ಯ ಪೂರ್ವಕ್ಕೆ ನಿಂತು]:\nಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ । ಸೂರ್ಯಾಯ ಇದಮರ್ಘ್ಯಂ ದತ್ತಂ ನ ಮಮ ॥ (೩ ಬಾರಿ)\n\n[ಮಾಧ್ಯಾಹ್ನ ಕಾಲ - ಸೂರ್ಯಾರ್ಘ್ಯ]:\nಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ... ಸೂರ್ಯಾಯ ಇದಮರ್ಘ್ಯಂ ದತ್ತಂ ನ ಮಮ ॥ (೨ ಬಾರಿ)\nಆಸತ್ಯೇನ ರಜಸಾ ವರ್ತಮಾನೋ ನಿವೇಶಯನ್ನಮೃತಂ ಮರ್ತ್ಯಂ ಚ । ಹಿರಣ್ಯಯೇನ ಸವಿತಾ ರಥೇನಾ ದೇವೋ ಯಾತಿ ಭುವನಾನಿ ಪಶ್ಯನ್ ॥ ಸೂರ್ಯಾಯ ನಮಃ ಇದಮರ್ಘ್ಯಂ ದತ್ತಂ ನ ಮಮ ॥\n\n[ಸಾಯಂಕಾಲ - ೩ ಅರ್ಘ್ಯ ಪಶ್ಚಿಮಕ್ಕೆ ಮುಖಮಾಡಿ]:\nಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ... ಸಂಧ್ಯಾ ದೇವ್ಯೈ ಇದಮರ್ಘ್ಯಂ ದತ್ತಂ ನ ಮಮ ॥ (೩ ಬಾರಿ)\n\n[ಕಾಲಾತೀತ ಪ್ರಾಯಶ್ಚಿತ್ತ ಅರ್ಘ್ಯ]:\nಸಮಯ ಮೀರಿದ್ದರೆ ೪ನೇ ಪ್ರಾಯಶ್ಚಿತ್ತ ಅರ್ಘ್ಯ: ಕಾಲಾತೀತ ಪ್ರಾಯಶ್ಚಿತ್ತಾರ್ಥಂ ಚತುರ್ಥಾರ್ಘ್ಯ ಪ್ರದಾನಂ ಕರಿಷ್ಯೇ ॥",
    meaningKn: "ಗಾಯತ್ರೀ ಮಂತ್ರದಿಂದ ಪವಿತ್ರೀಕರಿಸಲ್ಪಟ್ಟ ಜಲವನ್ನು ಜಗಚ್ಚಕ್ಷುವಾದ ಸೂರ್ಯದೇವನಿಗೆ ಸಮರ್ಪಿಸುತ್ತೇನೆ. ಇದು ಸೂರ್ಯನಿಗೆ ಸಮರ್ಪಿತ, ನನ್ನದಲ್ಲ.",
    meaningEn: "We offer this energized water sanctified by Gayatri mantra to Lord Surya, the cosmic eye of the universe. 'Unto the Sun this offering belongs, not unto me.'",
    priestSpokenInstructionKn: "ಸಂಧ್ಯಾವಂದನೆಯ ಪರಮೋಚ್ಚ ಹಂತ ಸೂರ್ಯಾರ್ಘ್ಯ ಪ್ರದಾನ. ಎರಡೂ ಕೈಗಳನ್ನು ಅಂಜಲಿ ಮುದ್ರೆಯಲ್ಲಿ ಜೋಡಿಸಿ, ಉದ್ದರಣೆಯಿಂದ ನೀರನ್ನು ತುಂಬಿಕೊಳ್ಳಿ. ಹೆಬ್ಬೆರಳುಗಳು ಇತರ ಬೆರಳುಗಳಿಗೆ ತಾಗದಂತೆ ದೂರವಿರಲಿ. ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ಪೂರ್ವಕ್ಕೆ ನಿಂತು ೩ ಬಾರಿ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಹೇಳಿ ಕೆಳಗೆ ಹರಿವಾಣಕ್ಕೆ ನೀರನ್ನು ಬಿಡಿ. ಮಧ್ಯಾಹ್ನದಲ್ಲಿ ನೇರವಾಗಿ ನಿಂತು ೨ ಬಾರಿ ಗಾಯತ್ರಿ ಅರ್ಘ್ಯ ಮತ್ತು ಆಸತ್ಯೇನ ರಜಸಾ ಮಂತ್ರದಿಂದ ಸೂರ್ಯಾರ್ಘ್ಯ ನೀಡಿ. ಸಾಯಂಕಾಲದಲ್ಲಿ ಪಶ್ಚಿಮಕ್ಕೆ ಮುಖಮಾಡಿ ೩ ಬಾರಿ ಅರ್ಘ್ಯ ನೀಡಿ. ಕಾಲಾತೀತವಾಗಿದ್ದರೆ ಪ್ರಾಯಶ್ಚಿತ್ತವಾಗಿ ಇನ್ನೊಂದು ಅರ್ಘ್ಯವನ್ನು ನೀಡಿ.",
    priestSpokenInstructionEn: "Now offer Arghya to Lord Surya in Anjali mudra. Morning: Stand facing East, offer 3 Arghyas with Gayatri. Midday: Stand facing upright Sun, offer Gayatri Arghya plus Asatyena Rajasa hymn. Evening: Face West, offer 3 Arghyas. If delayed, offer an additional Prayaschitta Arghya.",
    kaikaranaNotesKn: "ಮುದ್ರಾ ನಿಯಮ: ಎರಡೂ ಕೈಗಳನ್ನು ಜೋಡಿಸಿದಾಗ ಹೆಬ್ಬೆರಳುಗಳನ್ನು ಇತರ ಬೆರಳುಗಳಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿರಿಸಬೇಕು (ಅಂಗುಷ್ಠ ವಿಹೀನ ಅಂಜಲಿ). ನೀರನ್ನು ಹರಿವಾಣಕ್ಕೆ ನಿಧಾನವಾಗಿ ಎದೆಮಟ್ಟದಿಂದ ಧಾರೆಬಿಡಬೇಕು. ಕಾಲಾತೀತ ನಿಯಮ: ಸೂರ್ಯೋದಯ ಅಥವಾ ಸೂರ್ಯಾಸ್ತದ ನಿಗದಿತ ಸಮಯ ಮೀರಿದ್ದರೆ ೪ನೇ ಪ್ರಾಯಶ್ಚಿತ್ತ ಅರ್ಘ್ಯ ನೀಡುವುದು ಶಾಸ್ತ್ರವಿಧಿತ.",
    approxSeconds: 45,
    icon: "☀️"
  },

  // -----------------------------------------------------------
  // STEP 9: ಗಾಯತ್ರೀ ಆವಾಹನ (Gayatri Aavahana)
  // -----------------------------------------------------------
  {
    id: "gayatri_aavahana",
    stepNumber: 9,
    category: "japa",
    titleKn: "೯. ಗಾಯತ್ರೀ ಆವಾಹನ (ತೇಜೋಽಸಿ & ಆಯಾತು ವರದಾ ದೇವೀ)",
    titleEn: "9. Gayatri Aavahana (Invoking the Mother of the Vedas)",
    actionCueKn: "🪷 ಎದೆಯ ಮುಂದೆ ಕೈಗಳನ್ನು ಕಮಲದಂತೆ ಜೋಡಿಸಿ (ಕೂರ್ಮ ಮುದ್ರೆ) ದೇವಿಯನ್ನು ಹೃದಯದಲ್ಲಿ ಆವಾಹಿಸಿ",
    actionCueEn: "🪷 Fold hands in lotus posture at heart center invoking Mother Gayatri",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "तेजोऽसि शुक्रमस्यमृतमसि धामनामासि। विश्वमसि विश्वायुः सर्वमसि सर्वायुरभिभूरों। गायत्रीमावाहयामि॥ ॐ आयातु वरदा देवी अक्षरं ब्रह्मसम्मितम्। गायत्रीं छन्दसां मातेदं ब्रह्म जुषस्व नः॥",
    mantraKannada: "ತೇಜೋಽಸಿ ಶುಕ್ರಮಸ್ಯಮೃತಮಸಿ ಧಾಮನಾಮಾಸಿ । ವಿಶ್ವಮಸಿ ವಿಶ್ವಾಯುಃ ಸರ್ವಮಸಿ ಸರ್ವಾಯುರಭಿಭೂರೋಂ । ಗಾಯತ್ರೀಮಾವಾಹಯಾಮಿ ॥\nಓಂ ಆಯಾತು ವರದಾ ದೇವೀ ಅಕ್ಷರಂ ಬ್ರಹ್ಮಸಮ್ಮಿತಮ್ । ಗಾಯತ್ರೀಂ ಛಂದಸಾಂ ಮಾತೇದಂ ಬ್ರಹ್ಮ ಜುಷಸ್ವ ನಃ ॥",
    meaningKn: "ನೀನು ತೇಜಸ್ಸು, ನೀನು ಶುದ್ಧತೆ, ನೀನು ಅಮೃತ, ನೀನು ಸಮಸ್ತ ವಿಶ್ವ. ವೇದಮಾತೆಯಾದ, ವರಪ್ರದಾಯಿನಿಯಾದ ಶ್ರೀ ಗಾಯತ್ರೀ ದೇವಿಯನ್ನು ನನ್ನ ಹೃದಯಕಮಲದಲ್ಲಿ ಶ್ರದ್ಧೆಯಿಂದ ಆವಾಹಿಸುತ್ತೇನೆ.",
    meaningEn: "You are supreme light, purity, and immortal nectar. O boon-bestowing Mother of the Vedas, descend into our heart and sanctify our consciousness.",
    priestSpokenInstructionKn: "ಈಗ ಗಾಯತ್ರೀ ಆವಾಹನ. ಎದೆಯ ಮುಂದೆ ಕೈಗಳನ್ನು ಕಮಲದಂತೆ ಜೋಡಿಸಿ, 'ತೇಜೋಽಸಿ ಶುಕ್ರಮಸಿ...' ಮತ್ತು 'ಆಯಾತು ವರದಾ ದೇವೀ...' ಎಂದು ಪಠಿಸುತ್ತಾ ವೇದಮಾತೆಯನ್ನು ನಿಮ್ಮ ಹೃದಯದಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಆವಾಹನೆ ಮಾಡಿಕೊಳ್ಳಿ.",
    priestSpokenInstructionEn: "Invoke Divine Mother Gayatri at your heart center chanting Tejosi Shukramasi and Aayatu Varada Devi with reverent devotion.",
    kaikaranaNotesKn: "ಈ ಮಂತ್ರದಿಂದ ಗಾಯತ್ರೀ ದೇವಿಯು ಸಾಧಕನ ಹೃದಯದಲ್ಲಿ ಪ್ರತ್ಯಕ್ಷಳಾಗುತ್ತಾಳೆ. ಧ್ಯಾನವು ತೇಜೋಮಯವಾಗಿರಬೇಕು.",
    approxSeconds: 30,
    icon: "🪷"
  },

  // -----------------------------------------------------------
  // STEP 10: ಗಾಯತ್ರೀ ಜಪ (Gayatri Japa & Karamaala)
  // -----------------------------------------------------------
  {
    id: "gayatri_japa",
    stepNumber: 10,
    category: "japa",
    titleKn: "೧೦. ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ ಜಪ (ಕರಮಾಲಾ ವಿಧಾನ: ೧೦ / ೨೮ / ೧೦೮)",
    titleEn: "10. Gayatri Japa (Chanting with Karamaala Finger Counts: 10, 28, or 108)",
    actionCueKn: "📿 ಬಲಗೈಯನ್ನು ವಸ್ತ್ರದಿಂದ ಮುಚ್ಚಿ • ಬಲಗೈ ಬೆರಳುಗಳ ೧೦ ಗೆಣ್ಣುಗಳಲ್ಲಿ ಕರಮಾಲಾ ಜಪ ನಡೆಸಿ",
    actionCueEn: "📿 Cover right hand with upper cloth • Count repetitions on the 10 finger joints",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ॐ भूर्भुवस्स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥",
    mantraKannada: "ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ । ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ । ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥",
    meaningKn: "ಸವಿತೃ ದೇವನ ಆ ಪರಮ ಶ್ರೇಷ್ಠ ಜ್ಯೋತಿಯನ್ನು ಧ್ಯಾನಿಸುತ್ತೇವೆ. ಆತನು ನಮ್ಮ ಬುದ್ಧಿಯನ್ನು ಸದಾ ಸನ್ಮಾರ್ಗದಲ್ಲಿ ಪ್ರಚೋದಿಸಲಿ.",
    meaningEn: "We meditate upon the auspicious radiance of the Supreme Divine Sun. May that celestial intelligence guide and awaken our intellect.",
    priestSpokenInstructionKn: "ಸಂಧ್ಯಾವಂದನೆಯ ಪರಮ ರಹಸ್ಯ ಗಾಯತ್ರೀ ಜಪ. ಬಲಗೈಯನ್ನು ಉತ್ತರೀಯದಿಂದ ಮುಚ್ಚಿಕೊಳ್ಳಿ. ಬಲಗೈ ಕಿರುಬೆರಳಿನ ಮಧ್ಯದ ಗೆಣ್ಣಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ, ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ತೋರುಬೆರಳಿನ ಮೂಲಕ ೧೦ ಗೆಣ್ಣುಗಳನ್ನು ಎಣಿಸುತ್ತಾ ಕರಮಾಲಾ ಜಪ ಮಾಡಿ. ಕನಿಷ್ಠ ೧೦ ಅಥವಾ ೨೮ ಬಾರಿ ಜಪಿಸಿ, ಉತ್ತಮವಾದರೆ ೧೦೮ ಬಾರಿ ಶಾಂತವಾಗಿ ಜಪಿಸಿರಿ.",
    priestSpokenInstructionEn: "Now perform Gayatri Japa. Cover your right hand with a cloth. Count along the 10 phalanges of your right-hand fingers in clock-wise Karamaala method. Chant 10, 28, or 108 repetitions with tranquil focus.",
    kaikaranaNotesKn: "ಕರಮಾಲಾ ಎಣಿಸುವ ಕ್ರಮ: ಅನಾಮಿಕಾ ಮಧ್ಯ ಗೆಣ್ಣು (೧), ಕನಿಷ್ಠಿಕಾ ಮೂರು ಗೆಣ್ಣುಗಳು (೨, ೩, ೪), ಅನಾಮಿಕಾ ಕೆಳಗಿನ ಗೆಣ್ಣು (೫), ಮಧ್ಯಮಾ ಕೆಳಗಿನ ಗೆಣ್ಣು (೬), ತರ್ಜನಿ ಮೂರು ಗೆಣ್ಣುಗಳು (೭, ೮, ೯), ಮಧ್ಯಮಾ ಮೇಲಿನ ಗೆಣ್ಣು (೧೦). ಹೀಗೆ ೧೦ ಗೆಣ್ಣುಗಳನ್ನು ಎಣಿಸಿ ಗಾಯತ್ರೀ ಜಪ ಮುಗಿಸಬೇಕು.",
    approxSeconds: 120,
    icon: "📿"
  },

  // -----------------------------------------------------------
  // STEP 11: ಗಾಯತ್ರೀ ಉಪಸ್ಥಾನ (Gayatri Upasthana - Morning / Midday / Evening)
  // -----------------------------------------------------------
  {
    id: "gayatri_upasthana",
    stepNumber: 11,
    category: "upasthana",
    titleKn: "೧೧. ಗಾಯತ್ರೀ ಉಪಸ್ಥಾನ (ಕಾಲಾನುಗುಣ ಸೂರ್ಯ/ವರುಣ ಪ್ರಾರ್ಥನೆ)",
    titleEn: "11. Gayatri Upasthana (Time-Specific Post-Japa Adoration)",
    actionCueKn: "🧍 ನಿಂತುಕೊಂಡು ಕೈಗಳನ್ನು ಎತ್ತಿ ಮುಷ್ಟಿಬಿಚ್ಚಿ ಸೂರ್ಯನಿಗೆ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ",
    actionCueEn: "🧍 Stand upright with raised open palms offering adoration to Surya/Varuna",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "उत्तमे शिखरे जाते... / उदु त्यं जातवेदसं... / इमं मे वरुण श्रुधी...",
    mantraKannada: "[ಪ್ರಾತಃ ಉಪಸ್ಥಾನ - ಮಿತ್ರ ಪ್ರಾರ್ಥನೆ]:\nಉತ್ತಮೇ ಶಿಖರೇ ಜಾತೇ ಭೂಮ್ಯಾಂ ಪರ್ವತಮೂರ್ಧನಿ । ಬ್ರಾಹ್ಮಣೇಭ್ಯೋಽಭ್ಯನುಜ್ಞಾತಾ ಗಚ್ಛ ದೇವಿ ಯಥಾಸುಖಮ್ ॥\nಮಿತ್ರಸ್ಯ ಚರ್ಷಣೀಧೃತಃ ಶ್ರವೋ ದೇವಸ್ಯ ಸಾನಸಿಮ್ । ಸತ್ಯಂ ಚಿತ್ರಶ್ರವಸ್ತಮಮ್ ॥\n\n[ಮಾಧ್ಯಾಹ್ನಿಕ ಉಪಸ್ಥಾನ - ಸೂರ್ಯ ಸ್ತುತಿ]:\nಉದು ತ್ಯಂ ಜಾತವೇದಸಂ ದೇವಂ ವಹಂತಿ ಕೇತವಃ । ದೃಶೇ ವಿಶ್ವಾಯ ಸೂರ್ಯಮ್ ॥\nಚಿತ್ರಂ ದೇವಾನಾಮುದಗಾದನೀಕಂ ಚಕ್ಷುರ್ಮಿತ್ರಸ್ಯ ವರುಣಸ್ಯಾಗ್ನೇಃ । ಆಪ್ರಾ ದ್ಯಾವಾಪೃಥಿವೀ ಅಂತರಿಕ್ಷಂ ಸೂರ್ಯ ಆತ್ಮಾ ಜಗತಸ್ತಸ್ಥುಷಶ್ಚ ॥\n\n[ಸಾಯಂ ಉಪಸ್ಥಾನ - ವರುಣ ಪ್ರಾರ್ಥನೆ]:\nಉತ್ತಮೇ ಶಿಖರೇ ಜಾತೇ... ಗಚ್ಛ ದೇವಿ ಯಥಾಸುಖಮ್ ॥\nಇಮಂ ಮೇ ವರುಣ ಶ್ರುಧೀ ಹವಮದ್ಯಾ ಚ ಮೃಡಯ । ತ್ವಾಮವಸ್ಯುರಾಚಕೇ ॥ ತತ್ತ್ವಾ ಯಾಮಿ ಬ್ರಹ್ಮಣಾ ವಂದಮಾನಸ್ತದಾ ಶಾಸ್ತೇ ಯಜಮಾನೋ ಹವಿರ್ಭಿಃ । ಅಹೇಡಮಾನೋ ವರುಣೇಹ ಬೋಧ್ಯುರುಶಗ್ಸ ಮಾ ನ ಆಯುಃ ಪ್ರ ಮೋಷೀಃ ॥",
    meaningKn: "ಜಪವನ್ನು ಮುಗಿಸಿದ ಗಾಯತ್ರೀ ದೇವಿಯು ಸುಖವಾಗಿ ತನ್ನ ಪರಮ ಧಾಮಕ್ಕೆ ತೆರಳಲಿ. ಬೆಳಿಗ್ಗೆ ಮಿತ್ರದೇವನಿಗೆ, ಮಧ್ಯಾಹ್ನ ವಿಶ್ವಚಕ್ಷುವಾದ ಸೂರ್ಯನಿಗೆ ಮತ್ತು ಸಂಜೆ ವರುಣದೇವನಿಗೆ ಕೈಗಳೆತ್ತಿ ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.",
    meaningEn: "Farewell to Mother Gayatri as she ascends to her celestial abode. In morning we praise Mitra, at noon the resplendent Sun, and at dusk Lord Varuna.",
    priestSpokenInstructionKn: "ಈಗ ಉಪಸ್ಥಾನ. ನೇರವಾಗಿ ನಿಂತುಕೊಂಡು ಕೈಗಳನ್ನು ಭುಜದ ಮಟ್ಟಕ್ಕೆ ಎತ್ತಿ ಪ್ರಾರ್ಥಿಸಿ. ಬೆಳಿಗ್ಗೆ ಮಿತ್ರ ಮಂತ್ರ, ಮಧ್ಯಾಹ್ನ ಚಿತ್ರಂ ದೇವಾನಾಂ, ಸಾಯಂಕಾಲ ಇಮಂ ಮೇ ವರುಣ ಮಂತ್ರಗಳನ್ನು ಪಠಿಸಿ ನಮಸ್ಕರಿಸಿ.",
    priestSpokenInstructionEn: "Stand upright with raised open hands for Upasthana. Recite the Mitra hymn for morning, Chithram Devanam for midday, and Varuna hymn for evening.",
    kaikaranaNotesKn: "ಉಪಸ್ಥಾನದಲ್ಲಿ ನಿಂತುಕೊಂಡು ನಮಸ್ಕಾರ ಮುದ್ರೆಯಲ್ಲಿ ಆಕಾಶಕ್ಕೆ ಮುಖಮಾಡಿ ಪ್ರಾರ್ಥಿಸಬೇಕು.",
    approxSeconds: 40,
    icon: "🧍"
  },

  // -----------------------------------------------------------
  // STEP 12: ದಿಗ್ವಂದನ & ಸೂರ್ಯ ನಮಸ್ಕಾರ (Digvandana)
  // -----------------------------------------------------------
  {
    id: "digvandana",
    stepNumber: 12,
    category: "upasthana",
    titleKn: "೧೨. ದಿಗ್ವಂದನ (ಸಕಲ ದಿಕ್ಕುಗಳ ದೇವತೆಗಳಿಗೆ ಪ್ರಣಾಮ)",
    titleEn: "12. Digvandana (Salutations to the Ten Directions & Regents)",
    actionCueKn: "🧭 ಪೂರ್ವ, ದಕ್ಷಿಣ, ಪಶ್ಚಿಮ, ಉತ್ತರ, ಆಕಾಶ ಹಾಗೂ ಭೂಮಿಗೆ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ನಮಸ್ಕರಿಸಿ",
    actionCueEn: "🧭 Turn clockwise bowing to East, South, West, North, Zenith, and Earth",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "ॐ नमः प्राच्यै दिशे याश्च देवता एतस्यां प्रतिवसन्ति एताभ्यश्च नमो नमः। दक्षिprotocolायै... प्रतीच्यै... उदीच्यै... ऊर्ध्वायै... अधरायै... अन्तरिक्षायै... भूम्यै...",
    mantraKannada: "ಓಂ ನಮಃ ಪ್ರಾಚ್ಯೈ ದಿಶೇ ಯಾಶ್ಚ ದೇವತಾ ಏತಸ್ಯಾಂ ಪ್ರತಿವಸಂತಿ ಏತಾಭ್ಯಶ್ಚ ನಮೋ ನಮಃ । (ಪೂರ್ವಕ್ಕೆ)\nಓಂ ನಮೋ ದಕ್ಷಿಣಾಯೈ ದಿಶೇ ಯಾಶ್ಚ ದೇವತಾ ಏತಸ್ಯಾಂ ಪ್ರತಿವಸಂತಿ ಏತಾಭ್ಯಶ್ಚ ನಮೋ ನಮಃ । (ದಕ್ಷಿಣಕ್ಕೆ)\nಓಂ ನಮಃ ಪ್ರತೀಚ್ಯೈ ದಿಶೇ ಯಾಶ್ಚ ದೇವತಾ ಏತಸ್ಯಾಂ ಪ್ರತಿವಸಂತಿ ಏತಾಭ್ಯಶ್ಚ ನಮೋ ನಮಃ । (ಪಶ್ಚಿಮಕ್ಕೆ)\nಓಂ ನಮ ಉದೀಚ್ಯೈ ದಿಶೇ ಯಾಶ್ಚ ದೇವತಾ ಏತಸ್ಯಾಂ ಪ್ರತಿವಸಂತಿ ಏತಾಭ್ಯಶ್ಚ ನಮೋ ನಮಃ । (ಉತ್ತರಕ್ಕೆ)\nಓಂ ನಮ ಊರ್ಧ್ವಾಯೈ ದಿಶೇ... ಓಂ ನಮೋಽಧರಾಯೈ ದಿಶೇ... ಓಂ ನಮೋಽಂತರಿಕ್ಷಾಯೈ ದಿಶೇ... ಓಂ ನಮೋ ಬ್ರಹ್ಮಣೇ ನಮೋ ಅಸ್ತ್ವಗ್ನಯೇ ನಮಃ ಪೃಥಿವ್ಯೈ ನಮ ಓಷಧೀಭ್ಯಃ ॥",
    meaningKn: "ಪೂರ್ವ, ದಕ್ಷಿಣ, ಪಶ್ಚಿಮ, ಉತ್ತರ, ಊರ್ಧ್ವ, ಅಧರ ದಿಕ್ಕುಗಳಲ್ಲಿ ನೆಲೆಸಿರುವ ಸಕಲ ದೇವತೆಗಳಿಗೂ ಮತ್ತು ಬ್ರಹ್ಮದೇವನಿಗೂ ನನ್ನ ಭಕ್ತಿಪೂರ್ವಕ ಪ್ರಣಾಮಗಳು.",
    meaningEn: "Salutations to the deities residing in the East, South, West, North, Zenith, Nadir, and cosmic atmosphere, and to Lord Brahma.",
    priestSpokenInstructionKn: "ಈಗ ದಿಗ್ವಂದನ. ನಿಂತಲ್ಲಿಯೇ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ತಿರುಗುತ್ತಾ ಪೂರ್ವ, ದಕ್ಷಿಣ, ಪಶ್ಚಿಮ, ಉತ್ತರ, ಊರ್ಧ್ವ ಮತ್ತು ಅಧರ ದಿಕ್ಕುಗಳ ದೇವತೆಗಳಿಗೆ ಕೈಮುಗಿದು ನಮಸ್ಕರಿಸಿ.",
    priestSpokenInstructionEn: "Turn clockwise in your spot, bowing reverently to the guardians of all cardinal and vertical directions.",
    kaikaranaNotesKn: "ಸಕಲ ಜಗತ್ತಿನ ಸಮಸ್ತ ದಿಕ್ಕುಗಳಲ್ಲಿರುವ ದೈವಿಕ ಶಕ್ತಿಗಳನ್ನು ಗೌರವಿಸುವ ಪವಿತ್ರ ವಿಧಿ.",
    approxSeconds: 30,
    icon: "🧭"
  },

  // -----------------------------------------------------------
  // STEP 13: ಅಭಿವಾದನ & ಗೋತ್ರ ಪ್ರವರ (Personalized Abhivadana)
  // -----------------------------------------------------------
  {
    id: "abhivadana",
    stepNumber: 13,
    category: "abhivadana",
    titleKn: "೧೩. ಅಭಿವಾದನ (ತನ್ನ ಗೋತ್ರ, ಪ್ರವರ, ಸೂತ್ರ, ವೇದ ಹಾಗೂ ಹೆಸರಿನಿಂದ ನಮಸ್ಕಾರ)",
    titleEn: "13. Abhivadana (Personal Prostration with Gotra Pravara)",
    actionCueKn: "🙇 ಎರಡೂ ಕಿವಿಗಳನ್ನು ಕೈಗಳಿಂದ ಸ್ಪರ್ಶಿಸಿ (ಬಲಗೈ ಬಲಕಿವಿಗೆ, ಎಡಗೈ ಎಡಕಿವಿಗೆ) ನಮಸ್ಕರಿಸಿ",
    actionCueEn: "🙇 Touch your ears with respective hands, bow down reciting your Gotra Pravara",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "वसिष्ठ, मैत्रावरुण, कौण्डिन्येति त्रयार्षेय... गोत्रोत्पन्नः... शर्मा अहमस्मि भो अभिवादये॥",
    mantraKannada: "[ಉದಾಹರಣೆ - ವಸಿಷ್ಠ ಗೋತ್ರ]:\nವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ, ಕೌಂಡಿನ್ಯೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ ವಸಿಷ್ಠ ಗೋತ್ರೋತ್ಪನ್ನಃ ಶ್ರೀರಾಮ ಶರ್ಮಾ ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ ॥\n(ಸಾಧಕನು ತನ್ನ ಗೋತ್ರ ಹಾಗೂ ಹೆಸರಿಗೆ ಅನುಗುಣವಾಗಿ ಪ್ರವರವನ್ನು ಹೇಳಬೇಕು)",
    meaningKn: "ಈ ಋಷಿ ಪ್ರವರ ಪರಂಪರೆಯಲ್ಲಿ ಜನಿಸಿದ ಶ್ರೀರಾಮ ಶರ್ಮನೆಂಬ ನಾನು ದೇವತೆಗಳು, ಗುರುಗಳು ಮತ್ತು ಹಿರಿಯರಿಗೆ ಶ್ರದ್ಧೆಯಿಂದ ಸಾಷ್ಟಾಂಗ ಪ್ರಣಾಮಗಳನ್ನು ಸಲ್ಲಿಸುತ್ತೇನೆ.",
    meaningEn: "Having taken birth in this venerable lineage of rishis, I, [Name] Sharma, respectfully offer my prostrations before the Lord and preceptors.",
    priestSpokenInstructionKn: "ಸಂಧ್ಯಾವಂದನೆಯ ಅತ್ಯಂತ ಪವಿತ್ರವಾದ ಹಂತ ಅಭಿವಾದನ. ಬಲಗೈಯಿಂದ ಬಲ ಕಿವಿಯನ್ನು ಮತ್ತು ಎಡಗೈಯಿಂದ ಎಡ ಕಿವಿಯನ್ನು ಸ್ಪರ್ಶಿಸಿ, ನಿಮ್ಮ ಗೋತ್ರ, ಪ್ರವರ ಮತ್ತು ಹೆಸರನ್ನು ಹೇಳಿ ನೆಲಕ್ಕೆ ಬಾಗಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ.",
    priestSpokenInstructionEn: "Now perform Abhivadana. Cross your arms to touch your ears, recite your authentic Gotra Pravara and name, and perform full prostration before the deities.",
    kaikaranaNotesKn: "ಕೈಕರಣ ನಿಯಮ: ಬಲಗೈಯಿಂದ ಬಲಕಿವಿಯನ್ನು, ಎಡಗೈಯಿಂದ ಎಡಕಿವಿಯನ್ನು ಹಿಡಿದು ಮಂತ್ರೋಚ್ಚಾರಣೆ ಮುಗಿಸಿ, ಭೂಮಿಗೆ ಕೈಯಾನಿಸಿ ನಮಸ್ಕರಿಸಬೇಕು. ನಿಮ್ಮ ಗೋತ್ರದ ನಿಖರ ಪ್ರವರವನ್ನು ಕೆಳಗಿನ ಗೋತ್ರ ದರ್ಪಣದಲ್ಲಿ ಆರಿಸಿಕೊಳ್ಳಬಹುದು.",
    approxSeconds: 30,
    icon: "🙇"
  },

  // -----------------------------------------------------------
  // STEP 14: ಸಮರ್ಪಣ (Samarpana / Narayana Smarana)
  // -----------------------------------------------------------
  {
    id: "samarpana",
    stepNumber: 14,
    category: "samarpana",
    titleKn: "೧೪. ಕರ್ಮ ಸಮರ್ಪಣ (ನಾರಾಯಣಾರ್ಪಣಮಸ್ತು)",
    titleEn: "14. Samarpana (Final Dedication of Ritual Merits)",
    actionCueKn: "🙏 ಉದ್ದರಣೆ ನೀರಿನಿಂದ ಹರಿವಾಣಕ್ಕೆ ಬಿಟ್ಟು ಸಮಸ್ತ ಪುಣ್ಯವನ್ನು ಶ್ರೀಮನ್ನಾರಾಯಣನಿಗೆ ಅರ್ಪಿಸಿ",
    actionCueEn: "🙏 Release final drop of water dedicating all merits unto Lord Narayana",
    applicablePeriods: ["pratah", "madhyahna", "sayam"],
    mantraSanskrit: "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्। करोमि यद्यत् सकलं परस्मै नारायणायेति समर्पयामि॥ ॐ तत् सत्। ब्रह्मार्पणमस्तु॥",
    mantraKannada: "ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತೇಃ ಸ್ವಭಾವಾತ್ ।\nಕರೋಮಿ ಯದ್ಯತ್ ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥\nಯಸ್ಯ ಸ್ಮೃತ್ಯಾ ಚ ನಾಮೋಕ್ತ್ಯಾ ತಪೋಯಜ್ಞಕ್ರಿಯಾದಿಷು । ನ್ಯೂನಂ ಸಂಪೂರ್ಣತಾಂ ಯಾತಿ ಸದ್ಯೋ ವಂದೇ ತಮಚ್ಯುತಮ್ ॥\nಓಂ ತತ್ಸತ್ ಶ್ರೀ ಬ್ರಹ್ಮಾರ್ಪಣಮಸ್ತು । ಹರಿಃ ಓಂ ॥",
    meaningKn: "ದೇಹ, ಮಾತು, ಮನಸ್ಸು, ಇಂದ್ರಿಯ ಅಥವಾ ಬುದ್ಧಿಯಿಂದ ನಾನು ಮಾಡಿದ ಸಮಸ್ತ ಕರ್ಮಗಳನ್ನೂ ಪರಮ ಪುರುಷನಾದ ಶ್ರೀಮನ್ನಾರಾಯಣನಿಗೆ ಅರ್ಪಿಸುತ್ತೇನೆ. ನ್ಯೂನತೆಗಳೆಲ್ಲವೂ ಶ್ರೀ ಅಚ್ಯುತನ ಸ್ಮರಣೆಯಿಂದ ಸಂಪೂರ್ಣವಾಗಲಿ.",
    meaningEn: "Whatever actions I have performed through body, speech, mind, senses, or intellect, I dedicate everything unto Supreme Lord Narayana. All glory unto the Supreme.",
    priestSpokenInstructionKn: "ಸಂಧ್ಯಾವಂದನೆಯ ಪೂರ್ಣ ಮುಕ್ತಾಯ. ಉದ್ದರಣೆಯಿಂದ ಸ್ವಲ್ಪ ನೀರನ್ನು ಬಲ ಅಂಗೈಗೆ ಹಾಕಿ, 'ಕಾಯೇನ ವಾಚಾ...' ಮಂತ್ರದಿಂದ ಹರಿವಾಣಕ್ಕೆ ಬಿಡಿ. ನಿಮ್ಮ ಸಂಧ್ಯಾವಂದನಾ ಕಾರ್ಯಕ್ರಮವು ಸಂಪೂರ್ಣವಾಯಿತು. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮ ಮೇಲಿರಲಿ. ಹರಿಃ ಓಂ ತತ್ಸತ್.",
    priestSpokenInstructionEn: "Conclude your Sandhyavandana. Release a spoon of water into the plate dedicating all merits to Lord Narayana. May Lord Mahabaleshwara bless you with spiritual radiance.",
    kaikaranaNotesKn: "ಸಮರ್ಪಣೆಯ ನಂತರ ಹರಿವಾಣದ ಪವಿತ್ರ ಜಲವನ್ನು ಕಣ್ಣುಗಳಿಗೆ ಮುಟ್ಟಿಸಿಕೊಂಡು ಪಾವನರಾಗಬೇಕು.",
    approxSeconds: 30,
    icon: "✨"
  }
];
