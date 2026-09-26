/**
 * Baggona Festival & Puja Master Registry (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಹಬ್ಬ-ಹರಿದಿನಗಳ ಮಹಾಕೋಶ)
 * 
 * Sourced directly from the official 104-page Baggona Panchanga 2026-2027 book
 * (Shri Parabhava Samvatsara, Shaka 1948).
 * 
 * Features:
 * - Multi-Day Festival Definitions (Navaratri/Dasara 10 days, Deepavali 4 days, Rama Navami 9 days, Ganesha 3 days)
 * - 80+ Complete Annual Festivals, Jayantis, Ekadashis, and Monthly Observances
 * - Bilingual Search Engine (Kannada & English voice/text matching)
 * - Puja Muhurtha Windows & Religious Observance Rules
 */

export interface MultiDayFestivalSubDay {
  dayNumber: number;
  totalDays: number;
  date: string; // YYYY-MM-DD
  titleKn: string;
  titleEn: string;
  tithiKn: string;
  nakshatraKn: string;
  pujaWindowKn: string;
  pujaWindowEn: string;
  significanceKn: string;
  significanceEn: string;
  colorBadge?: string;
}

export interface MultiDayFestivalGroup {
  id: string;
  groupNameKn: string;
  groupNameEn: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  icon: string;
  summaryKn: string;
  summaryEn: string;
  voiceAliases: string[];
  days: MultiDayFestivalSubDay[];
}

export interface MasterFestivalItem {
  id: string;
  date: string;
  nameKn: string;
  nameEn: string;
  category: "Major Festival" | "Multi-Day Festival" | "Ekadashi" | "Vrata & Upavasa" | "Jayanti" | "Temple Yatra" | "Monthly Observance";
  categoryKn: string;
  masaKn: string;
  pakshaKn: string;
  tithiKn: string;
  pujaWindowKn: string;
  pujaWindowEn: string;
  descriptionKn: string;
  descriptionEn: string;
  multiDayGroupId?: string;
  voiceAliases: string[];
}

/* -------------------------------------------------------------------------- */
/* 1. MASTER MULTI-DAY FESTIVALS (ನವರಾತ್ರಿ ೧೦ ದಿನ, ದೀಪಾವಳಿ ೪ ದಿನ, ಇತ್ಯಾದಿ)    */
/* -------------------------------------------------------------------------- */

export const MULTI_DAY_FESTIVALS: MultiDayFestivalGroup[] = [
  {
    id: "navaratri_dasara",
    groupNameKn: "ಶರನ್ನವರಾತ್ರಿ & ದಸರಾ ಮಹೋತ್ಸವ (೧೦ ದಿನಗಳು)",
    groupNameEn: "Sharad Navaratri & Dussehra Mahotsava (10 Days)",
    startDate: "2026-10-11",
    endDate: "2026-10-20",
    totalDays: 10,
    icon: "🔱",
    summaryKn: "ಜಗನ್ಮಾತೆ ದುರ್ಗಾದೇವಿಯ ನವಾವತಾರಗಳ ಆರಾಧನೆ, ಘಟಸ್ಥಾಪನೆ, ಆಯುಧ ಪೂಜೆ ಮತ್ತು ವಿಜಯದಶಮಿ ದಸರಾ ಹಬ್ಬ.",
    summaryEn: "Nine sacred forms of Goddess Durga, Ghatasthapana, Ayudha Puja, and Vijayadashami celebration.",
    voiceAliases: [
      "dasara", "dussehra", "navaratri", "navratri", "dashami", "vijayadashami", "ayudha puja",
      "ದಸರಾ", "ನವರಾತ್ರಿ", "ವಿಜಯದಶಮಿ", "ದಶಮಿ", "ಆಯುಧ ಪೂಜೆ", "ಘಟಸ್ಥಾಪನೆ", "ದುರ್ಗಾಷ್ಟಮಿ", "ಮಹಾನವಮಿ"
    ],
    days: [
      {
        dayNumber: 1,
        totalDays: 10,
        date: "2026-10-11",
        titleKn: "ದಿನ ೧: ಘಟಸ್ಥಾಪನೆ & ಶೈಲಪುತ್ರಿ ಪೂಜೆ",
        titleEn: "Day 1: Ghatasthapana & Shailaputri Puja",
        tithiKn: "ಶುಕ್ಲ ಪಾಡ್ಯ (Pratipada)",
        nakshatraKn: "ಚಿತ್ರಾ (Chitra)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:38 AM - 10:15 AM (ಅಭಿಜಿನ್ ಮುಹೂರ್ತ: 11:50 AM - 12:35 PM)",
        pujaWindowEn: "Pratahkala 06:38 AM - 10:15 AM (Abhijit: 11:50 AM - 12:35 PM)",
        significanceKn: "ನವರಾತ್ರಿ ವ್ರತಾರಂಭ, ಕಲಶ ಸ್ಥಾಪನೆ, ಅಖಂಡ ಜ್ಯೋತಿ ಪ್ರಜ್ವಲನೆ ಹಾಗೂ ಪ್ರಥಮ ದುರ್ಗಾ ಶೈಲಪುತ್ರಿ ಆರಾಧನೆ.",
        significanceEn: "Inauguration of Navaratri vrata, Kalasha installation, and adoration of Goddess Shailaputri.",
        colorBadge: "bg-amber-500 text-white"
      },
      {
        dayNumber: 2,
        totalDays: 10,
        date: "2026-10-12",
        titleKn: "ದಿನ ೨: ಬ್ರಹ್ಮಚಾರಿಣಿ ಪೂಜೆ",
        titleEn: "Day 2: Brahmacharini Puja",
        tithiKn: "ಶುಕ್ಲ ಬಿದಿಗೆ (Dwitiya)",
        nakshatraKn: "ಸ್ವಾತಿ (Swati)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 09:30 AM",
        pujaWindowEn: "Morning 06:40 AM - 09:30 AM",
        significanceKn: "ತಪಸ್ಸು, ಧ್ಯಾನ ಹಾಗೂ ನಿಷ್ಠೆಯ ಸಂಕೇತವಾದ ದ್ವಿತೀಯ ದುರ್ಗೆ ಬ್ರಹ್ಮಚಾರಿಣಿ ದೇವಿಯ ಪೂಜೆ.",
        significanceEn: "Worship of Goddess Brahmacharini, embodiment of penance and spiritual perseverance.",
        colorBadge: "bg-amber-600 text-white"
      },
      {
        dayNumber: 3,
        totalDays: 10,
        date: "2026-10-13",
        titleKn: "ದಿನ ೩: ಚಂದ್ರಘಂಟಾ ಪೂಜೆ",
        titleEn: "Day 3: Chandraghanta Puja",
        tithiKn: "ಶುಕ್ಲ ತದಿಗೆ (Tritiya)",
        nakshatraKn: "ವಿಶಾಖಾ (Vishakha)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 10:00 AM",
        pujaWindowEn: "Morning 06:40 AM - 10:00 AM",
        significanceKn: "ಘಂಟಾನಾದದಂತೆ ಧ್ವನಿಸುವ ಅರ್ಧಚಂದ್ರಧಾರಿಣಿ ತೃತೀಯ ದುರ್ಗೆ ಚಂದ್ರಘಂಟಾ ಪೂಜೆ. ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ.",
        significanceEn: "Adoration of Goddess Chandraghanta for courage, inner peace, and divine protection.",
        colorBadge: "bg-amber-600 text-white"
      },
      {
        dayNumber: 4,
        totalDays: 10,
        date: "2026-10-14",
        titleKn: "ದಿನ ೪: ಕೂಷ್ಮಾಂಡಾ ಪೂಜೆ",
        titleEn: "Day 4: Kushmanda Puja",
        tithiKn: "ಶುಕ್ಲ ಚೌತಿ (Chaturthi)",
        nakshatraKn: "ಅನೂರಾಧಾ (Anuradha)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 09:45 AM",
        pujaWindowEn: "Morning 06:40 AM - 09:45 AM",
        significanceKn: "ಬ್ರಹ್ಮಾಂಡ ಸೃಷ್ಟಿಕರ್ತ್ರಿ ಚತುರ್ಥ ದುರ್ಗೆ ಕೂಷ್ಮಾಂಡಾ ದೇವಿಯ ಆರಾಧನೆ. ರೋಗ ನಿವಾರಣೆ.",
        significanceEn: "Worship of Goddess Kushmanda, the cosmic creator illuminating the universe.",
        colorBadge: "bg-amber-700 text-white"
      },
      {
        dayNumber: 5,
        totalDays: 10,
        date: "2026-10-15",
        titleKn: "ದಿನ ೫: ಸ್ಕಂದಮಾತಾ ಪೂಜೆ & ಲಲಿತಾ ಪಂಚಮಿ",
        titleEn: "Day 5: Skandamata Puja & Lalita Panchami",
        tithiKn: "ಶುಕ್ಲ ಪಂಚಮಿ (Panchami)",
        nakshatraKn: "ಜ್ಯೇಷ್ಠಾ (Jyeshtha)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 11:00 AM & ಮಾಧ್ಯಾಹ್ನ 12:00 PM - 01:30 PM",
        pujaWindowEn: "Morning 06:40 AM - 11:00 AM & Afternoon 12:00 PM - 01:30 PM",
        significanceKn: "ಕುಮಾರ ಸ್ಕಂದನ ಮಾತೆಯಾದ ಪಂಚಮ ದುರ್ಗೆ ಸ್ಕಂದಮಾತಾ ಪೂಜೆ ಹಾಗೂ ಉಪಾಂಗ ಲಲಿತಾ ವ್ರತ.",
        significanceEn: "Adoration of Skandamata and sacred Upanga Lalita Vrata for progeny and peace.",
        colorBadge: "bg-amber-700 text-white"
      },
      {
        dayNumber: 6,
        totalDays: 10,
        date: "2026-10-16",
        titleKn: "ದಿನ ೬: ಕಾತ್ಯಾಯನಿ ಪೂಜೆ & ಸರಸ್ವತಿ ಆವಾಹನೆ",
        titleEn: "Day 6: Katyayani Puja & Saraswati Avahana",
        tithiKn: "ಶುಕ್ಲ ಷಷ್ಠಿ (Shasthi)",
        nakshatraKn: "ಮೂಲಾ (Moola)",
        pujaWindowKn: "ಮೂಲಾ ನಕ್ಷತ್ರ ಪ್ರವೇಶ ಕಾಲ: ಸಾಯಂಕಾಲ 04:30 PM - 06:30 PM",
        pujaWindowEn: "Moola Nakshatra Entry: 04:30 PM - 06:30 PM",
        significanceKn: "ಮಹಿಷಾಸುರ ಸಂಹಾರಿಣಿ ಷಷ್ಠ ದುರ್ಗೆ ಕಾತ್ಯಾಯನಿ ಪೂಜೆ ಹಾಗೂ ಜ್ಞಾನದಾತ್ರಿ ಸರಸ್ವತಿ ಆವಾಹನೆ.",
        significanceEn: "Invocation of Goddess Saraswati on Moola Nakshatra and Katyayani adoration.",
        colorBadge: "bg-amber-800 text-white"
      },
      {
        dayNumber: 7,
        totalDays: 10,
        date: "2026-10-17",
        titleKn: "ದಿನ ೭: ಕಾಲರಾತ್ರಿ ಪೂಜೆ & ಸರಸ್ವತಿ ಪೂಜೆ",
        titleEn: "Day 7: Kalaratri Puja & Saraswati Puja",
        tithiKn: "ಶುಕ್ಲ ಸಪ್ತಮಿ (Saptami)",
        nakshatraKn: "ಪೂರ್ವಾಷಾಢಾ (Purvashadha)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:45 AM - 10:30 AM",
        pujaWindowEn: "Morning 06:45 AM - 10:30 AM",
        significanceKn: "ದುಷ್ಟ ನಿಗ್ರಹಿಣಿ ಸಪ್ತಮ ದುರ್ಗೆ ಕಾಲರಾತ್ರಿ ಪೂಜೆ, ಪುಸ್ತಕಾರಾಧನೆ ಹಾಗೂ ಸರಸ್ವತಿ ಪೂಜೆ.",
        significanceEn: "Worship of fiery Goddess Kalaratri for vanquishing negative forces and Saraswati Puja.",
        colorBadge: "bg-amber-800 text-white"
      },
      {
        dayNumber: 8,
        totalDays: 10,
        date: "2026-10-18",
        titleKn: "ದಿನ ೮: ಮಹಾಗೌರಿ ಪೂಜೆ & ದುರ್ಗಾಷ್ಟಮಿ",
        titleEn: "Day 8: Mahagauri Puja & Durga Ashtami",
        tithiKn: "ಶುಕ್ಲ ಅಷ್ಟಮಿ (Ashtami)",
        nakshatraKn: "ಉತ್ತರಾಷಾಢಾ (Uttarashadha)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 11:30 AM & ಸಂಧ್ಯಾಕಾಲ 05:45 PM - 07:45 PM",
        pujaWindowEn: "Morning 06:40 AM - 11:30 AM & Sandhya 05:45 PM - 07:45 PM",
        significanceKn: "ಮಹಾಷ್ಟಮೀ ವ್ರತ, ಕನ್ಯಾಪೂಜೆ, ಮಹಾಗೌರಿ ಆರಾಧನೆ ಹಾಗೂ ದುರ್ಗಾಹವನ ಅನುಷ್ಠಾನ.",
        significanceEn: "Durga Mahashtami vrata, Kanya Puja, and sacred Homa to Goddess Mahagauri.",
        colorBadge: "bg-rose-700 text-white"
      },
      {
        dayNumber: 9,
        totalDays: 10,
        date: "2026-10-19",
        titleKn: "ದಿನ ೯: ಮಹಾನವಮಿ & ಆಯುಧ ಪೂಜೆ (ವಾಹನ ಪೂಜೆ)",
        titleEn: "Day 9: Mahanavami & Ayudha Puja (Vehicle Puja)",
        tithiKn: "ಶುಕ್ಲ ನವಮಿ (Navami)",
        nakshatraKn: "ಶ್ರವಣ (Shravana)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 11:30 AM & ಮಧ್ಯಾಹ್ನ 02:00 PM - 04:30 PM",
        pujaWindowEn: "Morning 06:30 AM - 11:30 AM & Afternoon 02:00 PM - 04:30 PM",
        significanceKn: "ಸಿದ್ಧಿದಾತ್ರಿ ಪೂಜೆ, ಕರ್ಮೋಪಕರಣ ಪೂಜೆ, ಸಕಲ ವಾಹನ-ಯಂತ್ರ ಪೂಜೆ ಮತ್ತು ಶಸ್ತ್ರಾಸ್ತ್ರ ಆರಾಧನೆ.",
        significanceEn: "Siddhidatri Puja, sacred Ayudha and vehicle blessing ceremonies across workplaces.",
        colorBadge: "bg-rose-800 text-white"
      },
      {
        dayNumber: 10,
        totalDays: 10,
        date: "2026-10-20",
        titleKn: "ದಿನ ೧೦: ವಿಜಯದಶಮಿ (ದಸರಾ ಮಹೋತ್ಸವ) & ಬನ್ನಿ ಹಂಚುವುದು",
        titleEn: "Day 10: Vijayadashami (Dussehra) & Banni Exchange",
        tithiKn: "ಶುಕ್ಲ ದಶಮಿ (Dashami)",
        nakshatraKn: "ಧನಿಷ್ಠಾ (Dhanishta)",
        pujaWindowKn: "ವಿಜಯ ಮುಹೂರ್ತ / ಅಪರಾಜಿತಾ ಪೂಜೆ: ಮಧ್ಯಾಹ್ನ 01:45 PM - 03:15 PM",
        pujaWindowEn: "Aparajita / Vijaya Muhurtha: 01:45 PM - 03:15 PM",
        significanceKn: "ದಸರಾ ಮಹೋತ್ಸವ, ಶಮೀ ವೃಕ್ಷ ಪೂಜೆ, ಸೀಮೋಲ್ಲಂಘನ, ಚಿನ್ನದ ಬನ್ನಿ ಎಲೆ ಹಂಚುವುದು ಹಾಗೂ ಅಕ್ಷರಾಭ್ಯಾಸ ವಿದ್ಯಾರಂಭ.",
        significanceEn: "Grand Vijayadashami victory celebration, Shami tree adoration, Banni exchange, and Vidyarambha.",
        colorBadge: "bg-emerald-700 text-white"
      }
    ]
  },
  {
    id: "deepavali_parva",
    groupNameKn: "ದೀಪಾವಳಿ ಮಹಾಪರ್ವ (೪ ದಿನಗಳು)",
    groupNameEn: "Deepavali Grand Festival of Lights (4 Days)",
    startDate: "2026-11-07",
    endDate: "2026-11-10",
    totalDays: 4,
    icon: "🪔",
    summaryKn: "ಧನತ್ರಯೋದಶಿ ನೀರು ತುಂಬುವ ಹಬ್ಬ, ನರಕ ಚತುರ್ದಶಿ ತೈಲಾಭ್ಯಂಗ, ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಮತ್ತು ಬಲಿಪಾಡ್ಯಮಿ ಗೋಪೂಜೆ.",
    summaryEn: "Dhanteras water blessing, Naraka Chaturdashi sacred oil bath, Diwali Lakshmi Puja, and Bali Padyami cow worship.",
    voiceAliases: [
      "deepavali", "diwali", "lakshmi puja", "naraka chaturdashi", "bali padyami", "dhanteras",
      "ದೀಪಾವಳಿ", "ದಿವಾಳಿ", "ಲಕ್ಷ್ಮೀ ಪೂಜೆ", "ನರಕ ಚತುರ್ದಶಿ", "ಬಲಿಪಾಡ್ಯಮಿ", "ಧನತ್ರಯೋದಶಿ", "ನೀರು ತುಂಬುವ ಹಬ್ಬ"
    ],
    days: [
      {
        dayNumber: 1,
        totalDays: 4,
        date: "2026-11-07",
        titleKn: "ದಿನ ೧: ಧನತ್ರಯೋದಶಿ (ನೀರು ತುಂಬುವ ಹಬ್ಬ)",
        titleEn: "Day 1: Dhantrayodashi (Neeru Thumbuva Habba)",
        tithiKn: "ಕೃಷ್ಣ ತ್ರಯೋದಶಿ (Trayodashi)",
        nakshatraKn: "ಚಿತ್ರಾ (Chitra)",
        pujaWindowKn: "ಯಮದೀಪ ದಾನ: ಸಾಯಂಕಾಲ 05:45 PM - 07:15 PM (ಪ್ರದೋಷ ಕಾಲ)",
        pujaWindowEn: "Yama Deepa Dana: 05:45 PM - 07:15 PM (Pradosha Kaala)",
        significanceKn: "ಗಂಗಾಪೂಜೆ, ಹಂಡೆಗೆ ರಂಗೋಲಿ ಹಾಕಿ ನೀರು ತುಂಬುವುದು, ಧನ್ವಂತರಿ ಜಯಂತಿ ಹಾಗೂ ಯಮದೀಪ ಸಮರ್ಪಣೆ.",
        significanceEn: "Water blessing ritual, vessel decoration, Lord Dhanvantari Jayanti, and Yama lamp offering.",
        colorBadge: "bg-amber-600 text-white"
      },
      {
        dayNumber: 2,
        totalDays: 4,
        date: "2026-11-08",
        titleKn: "ದಿನ ೨: ನರಕ ಚತುರ್ದಶಿ (ದೀಪಾವಳಿ ತೈಲಾಭ್ಯಂಗ ಸ್ನಾನ)",
        titleEn: "Day 2: Naraka Chaturdashi (Arunodaya Tailabhyanga)",
        tithiKn: "ಕೃಷ್ಣ ಚತುರ್ದಶಿ (Chaturdashi)",
        nakshatraKn: "ಸ್ವಾತಿ (Swati)",
        pujaWindowKn: "ಅರುಣೋದಯ ತೈಲಾಭ್ಯಂಗ ಸ್ನಾನ: ಮುಂಜಾನೆ 04:45 AM - 06:15 AM",
        pujaWindowEn: "Auspicious Dawn Oil Bath: 04:45 AM - 06:15 AM",
        significanceKn: "ಶ್ರೀಕೃಷ್ಣನಿಂದ ನರಕಾಸುರ ಸಂಹಾರ ಸ್ಮರಣಾರ್ಥ ತೈಲಾಭ್ಯಂಗ ಗಂಗಾಸ್ನಾನ, ಪಟಾಕಿ ಸಿಡಿಸುವುದು ಹಾಗೂ ಹೊಸ ವಸ್ತ್ರ ಧಾರಣೆ.",
        significanceEn: "Sacred dawn sesame oil bath signifying the victory of light over darkness and wearing new clothes.",
        colorBadge: "bg-amber-700 text-white"
      },
      {
        dayNumber: 3,
        totalDays: 4,
        date: "2026-11-09",
        titleKn: "ದಿನ ೩: ದೀಪಾವಳಿ ಅಮಾವಾಸ್ಯೆ (ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಪೂಜೆ)",
        titleEn: "Day 3: Diwali Amavasya (Maha Lakshmi Puja)",
        tithiKn: "ಕೃಷ್ಣ ಅಮಾವಾಸ್ಯೆ (Amavasya)",
        nakshatraKn: "ವಿಶಾಖಾ (Vishakha)",
        pujaWindowKn: "ಸ್ಥಿರ ವೃಷಭ ಲಗ್ನ ಲಕ್ಷ್ಮೀ ಪೂಜೆ: ಸಂಜೆ 06:15 PM - 08:35 PM (ಪ್ರದೋಷ ಕಾಲ)",
        pujaWindowEn: "Sthira Vrishabha Lagna Lakshmi Puja: 06:15 PM - 08:35 PM (Pradosha)",
        significanceKn: "ದೀಪೋತ್ಸವ, ವ್ಯಾಪಾರಸ್ಥರ ನೂತನ ಲೆಕ್ಕಪುಸ್ತಕ ಪೂಜೆ, ಕೇದಾರ ಗೌರೀ ವ್ರತ ಹಾಗೂ ಧನದಾತ್ರಿ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ.",
        significanceEn: "Grand Deepotsava illumination, Chopda Pujan, Kedar Gauri Vrata, and worship of Goddess Lakshmi.",
        colorBadge: "bg-rose-700 text-white"
      },
      {
        dayNumber: 4,
        totalDays: 4,
        date: "2026-11-10",
        titleKn: "ದಿನ ೪: ಬಲಿಪಾಡ್ಯಮಿ (ಗೋಪೂಜೆ & ಬಲಿರಾಜ ಆರಾಧನೆ)",
        titleEn: "Day 4: Bali Padyami (Go Puja & King Bali Worship)",
        tithiKn: "ಶುಕ್ಲ ಪಾಡ್ಯ (Pratipada)",
        nakshatraKn: "ಅನೂರಾಧಾ (Anuradha)",
        pujaWindowKn: "ಗೋಪೂಜೆ & ಬಲಿಪೂಜೆ: ಪ್ರಾತಃಕಾಲ 06:30 AM - 09:30 AM",
        pujaWindowEn: "Morning Go Puja & Bali Archana: 06:30 AM - 09:30 AM",
        significanceKn: "ಬಲಿ ಚಕ್ರವರ್ತಿ ಪೂಜೆ, ಗೋಮಾತೆ-ವೃಷಭಗಳ ಅಲಂಕಾರ ಪೂಜೆ ಹಾಗೂ ಕಾರ್ತಿಕ ಮಾಸದ ದೀಪದಾನ ಪ್ರಾರಂಭ.",
        significanceEn: "Adoration of King Bali, sacred cow worship (Go Puja), and commencement of Karthika Deepotsava.",
        colorBadge: "bg-emerald-700 text-white"
      }
    ]
  },
  {
    id: "vasanta_navaratri_ramonavami",
    groupNameKn: "ವಸಂತ ನವರಾತ್ರಿ & ಶ್ರೀರಾಮನವಮೀ (೯ ದಿನಗಳು)",
    groupNameEn: "Vasantha Navaratri & Shri Rama Navami (9 Days)",
    startDate: "2026-03-19",
    endDate: "2026-03-27",
    totalDays: 9,
    icon: "🏹",
    summaryKn: "ಯುಗಾದಿ ವತ್ಸರಾರಂಭದಿಂದ ಶ್ರೀರಾಮನವಮಿಯವರೆಗೆ ೯ ದಿನಗಳ ವಸಂತ ನವರಾತ್ರಿ ಹಾಗೂ ಶ್ರೀರಾಮ ಜನ್ಮೋತ್ಸವ.",
    summaryEn: "Nine-day celebration from Yugadi to Sri Rama Navami honoring Lord Rama's appearance.",
    voiceAliases: [
      "rama navami", "ram navami", "ramnavami", "vasanta navaratri", "shri ramanavami",
      "ರಾಮನವಮಿ", "ಶ್ರೀರಾಮನವಮಿ", "ವಸಂತ ನವರಾತ್ರಿ", "ರಾಮ ನವಮಿ"
    ],
    days: [
      {
        dayNumber: 1,
        totalDays: 9,
        date: "2026-03-19",
        titleKn: "ದಿನ ೧: ಯುಗಾದಿ ವತ್ಸರಾರಂಭ & ವಸಂತ ನವರಾತ್ರಿಾರಂಭ",
        titleEn: "Day 1: Yugadi New Year & Vasantha Navaratri Begins",
        tithiKn: "ಶುಕ್ಲ ಪಾಡ್ಯ",
        nakshatraKn: "ಉತ್ತರಾಭಾದ್ರಾ",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:38 AM - 10:15 AM",
        pujaWindowEn: "Morning 06:38 AM - 10:15 AM",
        significanceKn: "ಪರಾಭವ ಸಂವತ್ಸರ ಪ್ರಾರಂಭ, ಬೇವು-ಬೆಲ್ಲ ಸ್ವೀಕಾರ, ಧ್ವಜಾರೋಪಣ ಹಾಗೂ ಪಂಚಾಂಗ ಶ್ರವಣ.",
        significanceEn: "New Year commencement, Neem-Jaggery prasad, and Panchanga recitation.",
        colorBadge: "bg-amber-600 text-white"
      },
      {
        dayNumber: 3,
        totalDays: 9,
        date: "2026-03-21",
        titleKn: "ದಿನ ೩: ಮತ್ಸ್ಯ ಜಯಂತೀ & ಮನ್ವಾದಿ ಪುಣ್ಯದಿನ",
        titleEn: "Day 3: Matsya Jayanti & Manvadi",
        tithiKn: "ಶುಕ್ಲ ತದಿಗೆ",
        nakshatraKn: "ಅಶ್ವಿನಿ",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 07:00 AM - 10:30 AM",
        pujaWindowEn: "Morning 07:00 AM - 10:30 AM",
        significanceKn: "ಮಹಾವಿಷ್ಣುವಿನ ಪ್ರಥಮ ಮತ್ಸ್ಯಾವತಾರ ಆರಾಧನೆ ಹಾಗೂ ಸೌರ ಮೇಷಾಯನ ಪ್ರವೇಶ.",
        significanceEn: "Adoration of Lord Vishnu's Matsya Avatara.",
        colorBadge: "bg-amber-600 text-white"
      },
      {
        dayNumber: 5,
        totalDays: 9,
        date: "2026-03-23",
        titleKn: "ದಿನ ೫: ಶ್ರೀ ಪಂಚಮೀ (ಲಕ್ಷ್ಮೀ ಪೂಜಾ)",
        titleEn: "Day 5: Sri Panchami (Lakshmi Puja)",
        tithiKn: "ಶುಕ್ಲ ಪಂಚಮಿ",
        nakshatraKn: "ಕೃತ್ತಿಕಾ",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 07:15 AM - 10:45 AM",
        pujaWindowEn: "Morning 07:15 AM - 10:45 AM",
        significanceKn: "ಕಲ್ಪಾದಿ ಪುಣ್ಯಕಾಲ ಮತ್ತು ಮಹಾಲಕ್ಷ್ಮೀ ಆರಾಧನೆ.",
        significanceEn: "Kalpadi holy day and Lakshmi blessing prayers.",
        colorBadge: "bg-amber-700 text-white"
      },
      {
        dayNumber: 9,
        totalDays: 9,
        date: "2026-03-27",
        titleKn: "ದಿನ ೯: ಶ್ರೀರಾಮನವಮೀ (ಶ್ರೀರಾಮ ಜನ್ಮೋತ್ಸವ)",
        titleEn: "Day 9: Shri Rama Navami (Lord Rama Janmotsava)",
        tithiKn: "ಶುಕ್ಲ ನವಮಿ",
        nakshatraKn: "ಪುನರ್ವಸು",
        pujaWindowKn: "ಮಧ್ಯಾಹ್ನ ಅಭಿಜಿನ್ ಮುಹೂರ್ತ: 11:15 AM - 01:45 PM",
        pujaWindowEn: "Madhyahna Abhijit Window: 11:15 AM - 01:45 PM",
        significanceKn: "ಮರ್ಯಾದಾ ಪುರುಷೋತ್ತಮ ಶ್ರೀರಾಮಚಂದ್ರನ ಜನ್ಮ ಮುಹೂರ್ತ, ಪಾನಕ-ಕೋಸಂಬರಿ ಸಮರ್ಪಣೆ, ವನವಾಸಿ ಸೀತಾರಾಮ ಲಕ್ಷ್ಮಣ ದೇವರ ವರ್ಧಂತಿ.",
        significanceEn: "Lord Rama's midday birth celebration, Panaka-Kosambari distribution, and temple Kalyana utsavas.",
        colorBadge: "bg-rose-700 text-white"
      }
    ]
  },
  {
    id: "ganesha_gowri_parva",
    groupNameKn: "ವರಸಿದ್ಧಿ ವಿನಾಯಕ & ಸ್ವರ್ಣಗೌರಿ ವ್ರತ (೩ ದಿನಗಳು)",
    groupNameEn: "Varasiddhi Vinayaka & Swarna Gowri Vrata (3 Days)",
    startDate: "2026-09-13",
    endDate: "2026-09-15",
    totalDays: 3,
    icon: "🐘",
    summaryKn: "ಸ್ವರ್ಣಗೌರಿ ಸೌಭಾಗ್ಯ ವ್ರತ, ಮಹಾಗಣಪತಿ ಪ್ರತಿಷ್ಠಾಪನಾ ಮಹೋತ್ಸವ ಹಾಗೂ ಋಷಿ ಪಂಚಮಿ ದೋಷ ನಿವಾರಣೆ.",
    summaryEn: "Swarna Gowri Vrata, Ganesha Chaturthi Murti Sthapana, and Rishi Panchami penance.",
    voiceAliases: [
      "ganesha", "ganapathi", "vinayaka", "chaturthi", "gowri", "swarna gowri", "rishi panchami",
      "ಗಣೇಶ", "ಗಣಪತಿ", "ವಿನಾಯಕ", "ಗೌರಿ ಹಬ್ಬ", "ಸ್ವರ್ಣಗೌರಿ", "ಋಷಿ ಪಂಚಮಿ", "ಚೌತಿ"
    ],
    days: [
      {
        dayNumber: 1,
        totalDays: 3,
        date: "2026-09-13",
        titleKn: "ದಿನ ೧: ಸ್ವರ್ಣಗೌರಿ ವ್ರತ (ಹರಿತಾಲಿಕಾ ಗೌರಿ)",
        titleEn: "Day 1: Swarna Gowri Vrata (Haritalika)",
        tithiKn: "ಶುಕ್ಲ ತದಿಗೆ (Tritiya)",
        nakshatraKn: "ಹಸ್ತಾ (Hasta)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:45 AM - 10:30 AM & ಸಂಜೆ 05:30 PM - 07:15 PM",
        pujaWindowEn: "Morning 06:45 AM - 10:30 AM & Evening 05:30 PM - 07:15 PM",
        significanceKn: "ಜಗನ್ಮಾತೆ ಗೌರಿಯ ಆಗಮನ, ಸುಮಂಗಲಿಯರ ಸೌಭಾಗ್ಯ ಪ್ರದಾಯಕ ವ್ರತ, ಮೌಂಜಿ ಸೂತ್ರ ಬಂಧನ.",
        significanceEn: "Welcoming Mother Gowri, sacred thread tying, and marital prosperity prayers.",
        colorBadge: "bg-amber-600 text-white"
      },
      {
        dayNumber: 2,
        totalDays: 3,
        date: "2026-09-14",
        titleKn: "ದಿನ ೨: ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ (ಗಣೇಶ ಚತುರ್ಥಿ)",
        titleEn: "Day 2: Varasiddhi Vinayaka Vrata (Ganesha Chaturthi)",
        tithiKn: "ಶುಕ್ಲ ಚೌತಿ (Chaturthi)",
        nakshatraKn: "ಚಿತ್ರಾ (Chitra)",
        pujaWindowKn: "ಮಾಧ್ಯಾಹ್ನ ಕಾಲ ಗಣೇಶ ಪೂಜೆ: 11:05 AM - 01:35 PM",
        pujaWindowEn: "Madhyahna Ganesha Puja: 11:05 AM - 01:35 PM",
        significanceKn: "ವಿಘ್ನರಾಜ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಮೂರ್ತಿ ಪ್ರತಿಷ್ಠಾಪನೆ, ೨೧ ಮೋದಕ-ಗರಿಕಾರ್ಚನೆ, ಅಥರ್ವಶೀರ್ಷ ಹವನ.",
        significanceEn: "Prana Pratishtha of Lord Ganesha, 21 Modaka offering, and Durva archana.",
        colorBadge: "bg-rose-700 text-white"
      },
      {
        dayNumber: 3,
        totalDays: 3,
        date: "2026-09-15",
        titleKn: "ದಿನ ೩: ಋಷಿ ಪಂಚಮೀ (ಸಪ್ತರ್ಷಿ ಆರಾಧನೆ)",
        titleEn: "Day 3: Rishi Panchami (Saptarshi Aradhana)",
        tithiKn: "ಶುಕ್ಲ ಪಂಚಮಿ (Panchami)",
        nakshatraKn: "ಸ್ವಾತಿ (Swati)",
        pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 10:15 AM",
        pujaWindowEn: "Morning 06:40 AM - 10:15 AM",
        significanceKn: "ಸಪ್ತರ್ಷಿಗಳ ಆರಾಧನೆ, ಕೃಷಿ-ಧಾನ್ಯ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ ಹಾಗೂ ರಜೋದೋಷ ನಿವಾರಣಾ ವ್ರತ.",
        significanceEn: "Veneration of the Seven Sacred Sages (Saptarshis) and observance of purity vows.",
        colorBadge: "bg-emerald-700 text-white"
      }
    ]
  }
];

/* -------------------------------------------------------------------------- */
/* 2. COMPREHENSIVE ANNUAL FESTIVALS REGISTRY (80+ FESTIVALS)                 */
/* -------------------------------------------------------------------------- */

export const MASTER_ANNUAL_FESTIVALS: MasterFestivalItem[] = [
  // CHAITRA MASA
  {
    id: "yugadi",
    date: "2026-03-19",
    nameKn: "ಯುಗಾದಿ (ಪರಾಭವ ಸಂವತ್ಸರಾರಂಭ)",
    nameEn: "Yugadi (New Year - Parabhava Samvatsara)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಾಡ್ಯ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:38 AM - 10:15 AM",
    pujaWindowEn: "Morning 06:38 AM - 10:15 AM",
    descriptionKn: "ಪರಾಭವ ಸಂವತ್ಸರ ಪ್ರಾರಂಭ, ಅಭ್ಯಂಗಸ್ನಾನ, ಬೇವು-ಬೆಲ್ಲ, ಧ್ವಜಾರೋಪಣ ಮತ್ತು ನೂತನ ಪಂಚಾಂಗ ಶ್ರವಣ.",
    descriptionEn: "Vedic New Year commencement, sacred neem-jaggery intake, and Panchanga recitation.",
    voiceAliases: ["yugadi", "ugadi", "new year", "ಯುಗಾದಿ", "ವರ್ಷಾರಂಭ"]
  },
  {
    id: "matsya_jayanti",
    date: "2026-03-21",
    nameKn: "ಮತ್ಸ್ಯ ಜಯಂತೀ & ಮನ್ವಾದಿ ಪುಣ್ಯದಿನ",
    nameEn: "Matsya Jayanti & Manvadi",
    category: "Jayanti",
    categoryKn: "ಜಯಂತಿ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ತದಿಗೆ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 07:00 AM - 10:30 AM",
    pujaWindowEn: "Morning 07:00 AM - 10:30 AM",
    descriptionKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣುವಿನ ಪ್ರಥಮ ಅವತಾರ ಮತ್ಸ್ಯ ಜಯಂತಿ ಮತ್ತು ಸೌರ ಮೇಷಾಯನ ಪ್ರವೇಶ.",
    descriptionEn: "First incarnation of Lord Vishnu in fish form and auspicious Manvadi.",
    voiceAliases: ["matsya", "ಮತ್ಸ್ಯ ಜಯಂತಿ"]
  },
  {
    id: "sri_panchami",
    date: "2026-03-23",
    nameKn: "ಶ್ರೀ ಪಂಚಮೀ (ಮಹಾಲಕ್ಷ್ಮೀ ಪೂಜಾ)",
    nameEn: "Sri Panchami (Lakshmi Puja)",
    category: "Vrata & Upavasa",
    categoryKn: "ವ್ರತ & ಉಪವಾಸ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಂಚಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 07:15 AM - 10:45 AM",
    pujaWindowEn: "Morning 07:15 AM - 10:45 AM",
    descriptionKn: "ಕಲ್ಪಾದಿ ಪುಣ್ಯದಿನ ಮತ್ತು ಮಹಾಲಕ್ಷ್ಮೀ ಕೃಪಾಪ್ರಾಪ್ತಿ ಪೂಜಾ ದಿನ.",
    descriptionEn: "Kalpadi holy observance and Goddess Lakshmi prosperity prayers.",
    voiceAliases: ["sri panchami", "ಶ್ರೀ ಪಂಚಮಿ", "ಲಕ್ಷ್ಮಿ ಪೂಜೆ"]
  },
  {
    id: "shri_ramanavami",
    date: "2026-03-27",
    nameKn: "ಶ್ರೀರಾಮನವಮೀ (ಶ್ರೀರಾಮ ಜನ್ಮೋತ್ಸವ)",
    nameEn: "Shri Rama Navami",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ನವಮಿ",
    pujaWindowKn: "ಮಧ್ಯಾಹ್ನ ಅಭಿಜಿನ್ ಮುಹೂರ್ತ: 11:15 AM - 01:45 PM",
    pujaWindowEn: "Midday Abhijit Window: 11:15 AM - 01:45 PM",
    descriptionKn: "ಮರ್ಯಾದಾ ಪುರುಷೋತ್ತಮ ಶ್ರೀರಾಮಚಂದ್ರನ ಜನ್ಮೋತ್ಸವ, ವನವಾಸಿ ಸೀತಾರಾಮ ಲಕ್ಷ್ಮಣ ದೇವರ ವರ್ಧಂತಿ.",
    descriptionEn: "Appearance day of Lord Rama, midday celebration and temple abhishekams.",
    multiDayGroupId: "vasanta_navaratri_ramonavami",
    voiceAliases: ["rama navami", "ram navami", "ರಾಮನವಮಿ", "ಶ್ರೀರಾಮನವಮಿ"]
  },
  {
    id: "kamada_ekadashi",
    date: "2026-03-29",
    nameKn: "ಕಾಮದಾ ಏಕಾದಶಿ (ಸರ್ವೇಷಾಮೇಕಾದಶೀ)",
    nameEn: "Kamada Ekadashi",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಪ್ರಾತಃಕಾಲ 06:40 AM - 08:30 AM",
    pujaWindowEn: "Fasting Day • Parana next day 06:40 AM - 08:30 AM",
    descriptionKn: "ಸರ್ವೇಷಾಮೇಕಾದಶೀ, ಸಕಲ ಇಷ್ಟಾರ್ಥ ಪ್ರದಾಯಕ ಶ್ರೀಹರಿ ಆರಾಧನೆ ಮತ್ತು ಉಪವಾಸ ವ್ರತ.",
    descriptionEn: "Wish-fulfilling Ekadashi vrata dedicated to Lord Vishnu.",
    voiceAliases: ["kamada ekadashi", "ಕಾಮದಾ ಏಕಾದಶಿ"]
  },
  {
    id: "hanuma_jayanti",
    date: "2026-04-02",
    nameKn: "ಹನುಮಜ್ಜಯಂತೀ (ಚಿತ್ರಾಪುರ ರಥೋತ್ಸವ)",
    nameEn: "Hanuma Jayanti (Chitrapura Rathotsava)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 11:30 AM",
    pujaWindowEn: "Morning 06:30 AM - 11:30 AM",
    descriptionKn: "ವಾಯುಪುತ್ರ ಆಂಜನೇಯ ಸ್ವಾಮಿಯ ಜನ್ಮದಿನ, ಚಿತ್ರಾಪುರ ರಥೋತ್ಸವ ಮತ್ತು ಚೈತ್ರ ಪೂರ್ಣಿಮಾ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ.",
    descriptionEn: "Lord Hanuman's appearance day and Chitrapura temple chariot festival.",
    voiceAliases: ["hanuma jayanti", "hanuman", "ಹನುಮ ಜಯಂತಿ", "ಆಂಜನೇಯ"]
  },
  {
    id: "varuthini_ekadashi",
    date: "2026-04-13",
    nameKn: "ವರೂಥಿನೀ ಏಕಾದಶಿ",
    nameEn: "Varuthini Ekadashi",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ಚೈತ್ರ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಮುಂಜಾನೆ",
    pujaWindowEn: "Fasting Day • Parana next morning",
    descriptionKn: "ಸಕಲ ಪಾಪ ಹರ ಹಾಗೂ ಸೌಭಾಗ್ಯದಾಯಕ ಕೃಷ್ಣಪಕ್ಷ ಏಕಾದಶಿ ವ್ರತ.",
    descriptionEn: "Auspicious Krishna Paksha Ekadashi offering protection and merit.",
    voiceAliases: ["varuthini", "ವರೂಥಿನಿ ಏಕಾದಶಿ"]
  },

  // VAISHAKHA MASA
  {
    id: "akshaya_tritiya",
    date: "2026-04-19",
    nameKn: "ಅಕ್ಷಯ ತೃತೀಯಾ (ಪರಶುರಾಮ ಜಯಂತಿ)",
    nameEn: "Akshaya Tritiya (Parashurama Jayanti)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ವೈಶಾಖ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ತದಿಗೆ",
    pujaWindowKn: "ಅಕ್ಷಯ ಮುಹೂರ್ತ: ಪ್ರಾತಃಕಾಲ 06:30 AM - 12:45 PM",
    pujaWindowEn: "Akshaya Muhurtha: 06:30 AM - 12:45 PM",
    descriptionKn: "ಅಕ್ಷಯ ಪುಣ್ಯದಿನ, ಭಾರ್ಗವ ಪರಶುರಾಮ ಜಯಂತಿ, ಚಿನ್ನ-ಬೆಳ್ಳಿ ಮತ್ತು ಧರ್ಮದಾನ ಪರ್ವ.",
    descriptionEn: "Eternal auspiciousness day, Lord Parashurama Jayanti, and sacred charity.",
    voiceAliases: ["akshaya tritiya", "akshaya thadige", "parashurama", "ಅಕ್ಷಯ ತೃತೀಯ", "ಪರಶುರಾಮ ಜಯಂತಿ"]
  },
  {
    id: "shankara_jayanti",
    date: "2026-04-21",
    nameKn: "ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯ ಜಯಂತೀ",
    nameEn: "Adi Shankara Jayanti",
    category: "Jayanti",
    categoryKn: "ಜಯಂತಿ",
    masaKn: "ವೈಶಾಖ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಂಚಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 07:00 AM - 11:00 AM",
    pujaWindowEn: "Morning 07:00 AM - 11:00 AM",
    descriptionKn: "ಅದ್ವೈತ ಸಿದ್ಧಾಂತ ಪ್ರತಿಷ್ಠಾಪಕ ಜಗದ್ಗುರು ಶ್ರೀ ಆದಿ ಶಂಕರಾಚಾರ್ಯರ ಜನ್ಮದಿನೋತ್ಸವ.",
    descriptionEn: "Birth anniversary of Jagadguru Adi Shankaracharya.",
    voiceAliases: ["shankara jayanti", "shankaracharya", "ಶಂಕರ ಜಯಂತಿ"]
  },
  {
    id: "mohini_ekadashi",
    date: "2026-04-27",
    nameKn: "ಮೋಹಿನೀ ಏಕಾದಶಿ",
    nameEn: "Mohini Ekadashi",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ವೈಶಾಖ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಪ್ರಾತಃಕಾಲ",
    pujaWindowEn: "Fasting Day • Parana next morning",
    descriptionKn: "ಶ್ರೀಹರಿಯ ಮೋಹಿನೀ ರೂಪ ಧಾರಣಾ ಸ್ಮರಣೆಯ ಶುಕ್ಲಪಕ್ಷ ಏಕಾದಶಿ ವ್ರತ.",
    descriptionEn: "Commemoration of Lord Vishnu's divine Mohini avatara.",
    voiceAliases: ["mohini ekadashi", "ಮೋಹಿನಿ ಏಕಾದಶಿ"]
  },
  {
    id: "nrisimha_jayanti",
    date: "2026-04-30",
    nameKn: "ಶ್ರೀ ನೃಸಿಂಹ ಜಯಂತೀ",
    nameEn: "Narasimha Jayanti",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ವೈಶಾಖ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಚತುರ್ದಶಿ",
    pujaWindowKn: "ಪ್ರದೋಷ ಕಾಲ ನೃಸಿಂಹ ಪೂಜೆ: ಸಂಜೆ 04:30 PM - 07:15 PM",
    pujaWindowEn: "Pradosha Kaala Window: 04:30 PM - 07:15 PM",
    descriptionKn: "ಭಕ್ತ ಪ್ರಹ್ಲಾದ ರಕ್ಷಣಾರ್ಥ ಪ್ರಕಟಗೊಂಡ ಭಗವಾನ್ ಲಕ್ಷ್ಮೀ ನೃಸಿಂಹ ಸ್ವಾಮಿಯ ಅವತಾರ ಮಹೋತ್ಸವ.",
    descriptionEn: "Appearance of Lord Lakshmi Narasimha in twilight window.",
    voiceAliases: ["narasimha", "nrisimha jayanti", "ನರಸಿಂಹ ಜಯಂತಿ", "ನೃಸಿಂಹ ಜಯಂತಿ"]
  },
  {
    id: "buddha_purnima",
    date: "2026-05-01",
    nameKn: "ಬುದ್ಧ ಪೂರ್ಣಿಮಾ (ವೈಶಾಖ ಹುಣ್ಣಿಮೆ)",
    nameEn: "Buddha Purnima (Vaishakha Purnima)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ವೈಶಾಖ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 11:00 AM",
    pujaWindowEn: "Morning 06:30 AM - 11:00 AM",
    descriptionKn: "ವೈಶಾಖ ಪೂರ್ಣಿಮಾ ತೀರ್ಥಸ್ನಾನ, ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಮತ್ತು ಭಗವಾನ್ ಬುದ್ಧ ಜಯಂತಿ.",
    descriptionEn: "Vaishakha Purnima sacred bath, Satyanarayana Vrata and Buddha Jayanti.",
    voiceAliases: ["buddha purnima", "ಬುದ್ಧ ಪೂರ್ಣಿಮಾ", "ವೈಶಾಖ ಹುಣ್ಣಿಮೆ"]
  },
  {
    id: "apara_ekadashi",
    date: "2026-05-12",
    nameKn: "ಅಪರಾ ಏಕಾದಶಿ",
    nameEn: "Apara Ekadashi",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ವೈಶಾಖ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಪ್ರಾತಃಕಾಲ",
    pujaWindowEn: "Fasting Day • Parana next morning",
    descriptionKn: "ಅಪಾರ ಪುಣ್ಯದಾಯಕ ವೈಶಾಖ ಕೃಷ್ಣಪಕ್ಷ ಏಕಾದಶಿ ವ್ರತ.",
    descriptionEn: "Auspicious Vaishakha Krishna Ekadashi vrata.",
    voiceAliases: ["apara ekadashi", "ಅಪರಾ ಏಕಾದಶಿ"]
  },

  // ADHIKA JYESHTHA MASA (Special 13th month of Parabhava)
  {
    id: "padmini_ekadashi",
    date: "2026-05-27",
    nameKn: "ಪದ್ಮಿನೀ ಏಕಾದಶಿ (ಅಧಿಕ ಮಾಸ ಏಕಾದಶಿ)",
    nameEn: "Padmini Ekadashi (Adhika Masa)",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ಅಧಿಕ ಜ್ಯೇಷ್ಠ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಪ್ರಾತಃಕಾಲ",
    pujaWindowEn: "Fasting Day • Parana next morning",
    descriptionKn: "ಪರಾಭವ ಸಂವತ್ಸರದ ಅಧಿಕ ಜ್ಯೇಷ್ಠ ಮಾಸದ ಮಹಾ ಫಲಪ್ರದ ಶುಕ್ಲಪಕ್ಷ ಏಕಾದಶಿ.",
    descriptionEn: "Adhika Masa sacred Shukla Ekadashi in Parabhava Samvatsara.",
    voiceAliases: ["padmini ekadashi", "adhika masa ekadashi", "ಪದ್ಮಿನಿ ಏಕಾದಶಿ", "ಅಧಿಕ ಮಾಸ ಏಕಾದಶಿ"]
  },
  {
    id: "parama_ekadashi",
    date: "2026-06-10",
    nameKn: "ಪರಮಾ ಏಕಾದಶಿ (ಅಧಿಕ ಮಾಸ ಏಕಾದಶಿ)",
    nameEn: "Parama Ekadashi (Adhika Masa)",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ಅಧಿಕ ಜ್ಯೇಷ್ಠ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಪ್ರಾತಃಕಾಲ",
    pujaWindowEn: "Fasting Day • Parana next morning",
    descriptionKn: "ಅಧಿಕ ಜ್ಯೇಷ್ಠ ಕೃಷ್ಣಪಕ್ಷದ ಪರಮ ಪವಿತ್ರ ದಾರಿದ್ರ್ಯ ನಾಶಕ ಏಕಾದಶಿ.",
    descriptionEn: "Adhika Masa Krishna Ekadashi relieving difficulties and granting spiritual bliss.",
    voiceAliases: ["parama ekadashi", "ಪರಮಾ ಏಕಾದಶಿ"]
  },

  // NIJA JYESHTHA MASA
  {
    id: "nirjala_ekadashi",
    date: "2026-06-25",
    nameKn: "ನಿರ್ಜಲಾ ಏಕಾದಶಿ (ಭೀಮ ಏಕಾದಶಿ)",
    nameEn: "Nirjala Ekadashi (Bhima Ekadashi)",
    category: "Ekadashi",
    categoryKn: "ಏಕಾದಶಿ",
    masaKn: "ನಿಜ ಜ್ಯೇಷ್ಠ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಜಲರಹಿತ ಕಠಿಣ ಉಪವಾಸ ದಿನ • ಪಾರಣೆ ಮರುದಿನ ಸೂರ್ಯೋದಯಾನಂತರ",
    pujaWindowEn: "Strict waterless fasting • Parana next morning after sunrise",
    descriptionKn: "ವರ್ಷದ ಸಮಸ್ತ ಏಕಾದಶಿಗಳ ಪುಣ್ಯವನ್ನು ನೀಡುವ ನೀರಿಲ್ಲದೆ ಆಚರಿಸುವ ಮಹಾ ಏಕಾದಶಿ ವ್ರತ.",
    descriptionEn: "Most rigorous waterless fast granting merits of all 24 Ekadashis.",
    voiceAliases: ["nirjala", "bhima ekadashi", "ನಿರ್ಜಲಾ ಏಕಾದಶಿ", "ಭೀಮ ಏಕಾದಶಿ"]
  },
  {
    id: "vata_savitri",
    date: "2026-06-29",
    nameKn: "ವಟ ಸಾವಿತ್ರೀ ವ್ರತ (ಜ್ಯೇಷ್ಠ ಹುಣ್ಣಿಮೆ)",
    nameEn: "Vata Savitri Vrata (Jyeshtha Purnima)",
    category: "Vrata & Upavasa",
    categoryKn: "ವ್ರತ & ಉಪವಾಸ",
    masaKn: "ನಿಜ ಜ್ಯೇಷ್ಠ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 11:00 AM (ವಟವೃಕ್ಷ ಪೂಜೆ)",
    pujaWindowEn: "Morning 06:30 AM - 11:00 AM (Banyan Tree Puja)",
    descriptionKn: "ಸುಮಂಗಲಿಯರ ಸೌಭಾಗ್ಯ ವೃದ್ಧಿಗಾಗಿ ವಟವೃಕ್ಷ ಪೂಜೆ ಮತ್ತು ಸಾವಿತ್ರಿ ಸತ್ಯವಾನ್ ಆರಾಧನೆ.",
    descriptionEn: "Sacred banyan tree worship by married women for longevity of husband.",
    voiceAliases: ["vata savitri", "ವಟ ಸಾವಿತ್ರಿ"]
  },

  // ASHADHA MASA
  {
    id: "prathama_ekadashi",
    date: "2026-07-25",
    nameKn: "ಪ್ರಥಮ ಏಕಾದಶಿ (ಶಯನೀ / ಚಾತುರ್ಮಾಸ್ಯಾರಂಭ)",
    nameEn: "Prathama Ekadashi (Sayani / Chaturmasya Begins)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಷಾಢ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ಉಪವಾಸ ದಿನ • ಚಾತುರ್ಮಾಸ್ಯ ಸಂಕಲ್ಪ ಪ್ರಾತಃಕಾಲ",
    pujaWindowEn: "Fasting Day • Chaturmasya vow in morning",
    descriptionKn: "ಶ್ರೀಹರಿಯ ಯೋಗನಿದ್ರಾ ಶಯನೋತ್ಸವ, ತಪ್ತಮುದ್ರಾ ಧಾರಣೆ ಹಾಗೂ ಚಾತುರ್ಮಾಸ್ಯ ವ್ರತಾರಂಭ.",
    descriptionEn: "Lord Vishnu begins cosmic slumber; initiation of sacred Chaturmasya period.",
    voiceAliases: ["prathama ekadashi", "sayani ekadashi", "chaturmasya", "ಪ್ರಥಮ ಏಕಾದಶಿ", "ಚಾತುರ್ಮಾಸ್ಯ"]
  },
  {
    id: "guru_purnima",
    date: "2026-07-29",
    nameKn: "ಗುರು ಪೂರ್ಣಿಮಾ (ವ್ಯಾಸ ಪೂಜೆ)",
    nameEn: "Guru Purnima (Vyasa Puja)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಷಾಢ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 12:00 PM",
    pujaWindowEn: "Morning 06:30 AM - 12:00 PM",
    descriptionKn: "ವೇದವ್ಯಾಸ ಮಹರ್ಷಿಗಳ ಜನ್ಮದಿನ, ಗುರು ಪಾದಪೂಜೆ ಹಾಗೂ ಮಠ-ಸಂಸ್ಥಾನಗಳಲ್ಲಿ ಗುರು ಸಮರ್ಪಣೆ.",
    descriptionEn: "Celebration of Maharishi Veda Vyasa and offering reverence to spiritual preceptors.",
    voiceAliases: ["guru purnima", "vyasa puja", "ಗುರು ಪೂರ್ಣಿಮಾ", "ವ್ಯಾಸ ಪೂಜೆ"]
  },

  // SHRAVANA MASA
  {
    id: "nagara_panchami",
    date: "2026-08-17",
    nameKn: "ನಾಗರ ಪಂಚಮೀ (ನಾಗಾರಾಧನೆ)",
    nameEn: "Nagara Panchami",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಶ್ರಾವಣ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಂಚಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 11:00 AM",
    pujaWindowEn: "Morning 06:30 AM - 11:00 AM",
    descriptionKn: "ನಾಗದೇವತೆಯ ಪ್ರಸನ್ನತೆಗಾಗಿ ಕ್ಷೀರಾಭಿಷೇಕ, ತಂಬಿಟ್ಟು ನೈವೇದ್ಯ ಹಾಗೂ ನಾಗಕಟ್ಟೆ ಪೂಜೆ.",
    descriptionEn: "Serpent deity worship with milk libation for family protection and harmony.",
    voiceAliases: ["nagara panchami", "nag panchami", "ನಾಗರ ಪಂಚಮಿ", "ನಾಗ ಪಂಚಮಿ"]
  },
  {
    id: "varamahalakshmi",
    date: "2026-08-21",
    nameKn: "ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ (ಶ್ರಾವಣ ಶುಕ್ಲ ನವಮಿ)",
    nameEn: "Varamahalakshmi Vrata",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಶ್ರಾವಣ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ನವಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 10:45 AM & ಮಾಧ್ಯಾಹ್ನ 12:30 PM - 02:15 PM (ಅಭಿಜಿತ್)",
    pujaWindowEn: "Morning 06:30 AM - 10:45 AM & Afternoon 12:30 PM - 02:15 PM",
    descriptionKn: "ಸಕಲ ಸೌಭಾಗ್ಯ ಪ್ರದಾಯಕಿ ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮೀ ದೇವಿಯ ಕಳಶ ಸ್ಥಾಪನೆ, ದೋರ ಬಂಧನ ಮತ್ತು ವ್ರತಾನುಷ್ಠಾನ.",
    descriptionEn: "Sacred vrata for Goddess Varamahalakshmi granting prosperity, longevity and fortune.",
    voiceAliases: ["varamahalakshmi", "varalakshmi", "ವರಮಹಾಲಕ್ಷ್ಮಿ", "ವರಲಕ್ಷ್ಮಿ ವ್ರತ"]
  },
  {
    id: "raksha_bandhan",
    date: "2026-08-27",
    nameKn: "ರಕ್ಷಾಬಂಧನ / ಋಗುಪಾಕರ್ಮ (ಶ್ರಾವಣ ಹುಣ್ಣಿಮೆ)",
    nameEn: "Raksha Bandhan / Rig Upakarma",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಶ್ರಾವಣ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಋಗುಪಾಕರ್ಮ: ಪ್ರಾತಃಕಾಲ 06:40 AM - 09:30 AM • ರಕ್ಷಾಬಂಧನ: ದಿನವಿಡೀ",
    pujaWindowEn: "Rig Upakarma: 06:40 AM - 09:30 AM • Raksha Bandhan: All Day",
    descriptionKn: "ಋಗ್ವೇದಿಗಳ ಉಪಾಕರ್ಮ, ನೂತನ ಯಜ್ಞೋಪವೀತ ಧಾರಣೆ, ರಕ್ಷಾಸೂತ್ರ ಬಂಧನ ಮತ್ತು ಹಯಗ್ರೀವ ಜಯಂತೀ.",
    descriptionEn: "Rig Vedic sacred thread renewal ceremony, sibling protection thread tying, and Hayagriva Jayanti.",
    voiceAliases: ["rakhi", "raksha bandhan", "upakarma", "ರಕ್ಷಾಬಂಧನ", "ಉಪಾಕರ್ಮ", "ಜನಿವಾರ"]
  },
  {
    id: "yajur_upakarma",
    date: "2026-08-28",
    nameKn: "ಯಜುರುಪಾಕರ್ಮ (ಯಜುರ್ವೇದಿಗಳ ಶ್ರಾವಣ ಕರ್ಮ)",
    nameEn: "Yajur Upakarma",
    category: "Vrata & Upavasa",
    categoryKn: "ವ್ರತ & ಉಪವಾಸ",
    masaKn: "ಶ್ರಾವಣ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಪಾಡ್ಯ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:45 AM - 10:15 AM",
    pujaWindowEn: "Morning 06:45 AM - 10:15 AM",
    descriptionKn: "ಯಜುರ್ವೇದಿಗಳಿಗೆ ನೂತನ ಯಜ್ಞೋಪವೀತ ಧಾರಣೆ ಹಾಗೂ ಕಾಂಡರ್ಷಿ ತರ್ಪಣ.",
    descriptionEn: "Yajur Vedic annual sacred thread renewal and rishi tarpana.",
    voiceAliases: ["yajur upakarma", "ಯಜುರುಪಾಕರ್ಮ"]
  },
  {
    id: "gokulashtami",
    date: "2026-09-04",
    nameKn: "ಶ್ರೀಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮೀ (ಗೋಕುಲಾಷ್ಟಮೀ)",
    nameEn: "Krishna Janmashtami (Gokulashtami)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಶ್ರಾವಣ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಅಷ್ಟಮಿ",
    pujaWindowKn: "ನಿಶೀಥ ಕಾಲ ಪೂಜೆ & ಅರ್ಘ್ಯ: ರಾತ್ರಿ 11:45 PM - 12:40 AM",
    pujaWindowEn: "Nishita Kaala Window: 11:45 PM - 12:40 AM",
    descriptionKn: "ಜಗದ್ಗುರು ಭಗವಾನ್ ಶ್ರೀಕೃಷ್ಣನ ಅವತಾರ ಮಹೋತ್ಸವ, ರಾತ್ರಿ ಜಾಗರಣೆ, ಚಂದ್ರೋದಯ ಕಾಲದಲ್ಲಿ ಅರ್ಘ್ಯಪ್ರದಾನ.",
    descriptionEn: "Lord Krishna's midnight birth celebration, midnight arghya and fast.",
    voiceAliases: ["krishna", "janmashtami", "gokulashtami", "ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ", "ಗೋಕುಲಾಷ್ಟಮಿ"]
  },

  // BHADRAPADA MASA
  {
    id: "swarna_gowri",
    date: "2026-09-13",
    nameKn: "ಸ್ವರ್ಣಗೌರಿ ವ್ರತ (ಹರಿತಾಲಿಕಾ)",
    nameEn: "Swarna Gowri Vrata",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಭಾದ್ರಪದ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ತದಿಗೆ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:45 AM - 10:30 AM",
    pujaWindowEn: "Morning 06:45 AM - 10:30 AM",
    descriptionKn: "ಜಗನ್ಮಾತೆ ಗೌರೀ ದೇವಿಯ ಸೌಭಾಗ್ಯ ವ್ರತ, ಮೌಂಜೀ ಸೂತ್ರ ಧಾರಣೆ.",
    descriptionEn: "Goddess Gowri worship invoking family welfare and prosperity.",
    multiDayGroupId: "ganesha_gowri_parva",
    voiceAliases: ["swarna gowri", "gowri habba", "ಸ್ವರ್ಣಗೌರಿ", "ಗೌರಿ ಹಬ್ಬ"]
  },
  {
    id: "ganesha_chaturthi",
    date: "2026-09-14",
    nameKn: "ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ (ಗಣೇಶ ಚತುರ್ಥಿ)",
    nameEn: "Ganesha Chaturthi (Vinayaka Chavithi)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಭಾದ್ರಪದ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಚೌತಿ",
    pujaWindowKn: "ಮಾಧ್ಯಾಹ್ನ ಕಾಲ ಗಣೇಶ ಪೂಜೆ: 11:05 AM - 01:35 PM",
    pujaWindowEn: "Madhyahna Ganesha Puja: 11:05 AM - 01:35 PM",
    descriptionKn: "ವಿಘ್ನನಿವಾರಕ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಪ್ರತಿಷ್ಠಾಪನೆ, ಗರಿಕಾರ್ಚನೆ ಹಾಗೂ ಮೋದಕ ಸಮರ್ಪಣೆ.",
    descriptionEn: "Lord Ganesha Prana Pratishtha and grand festive modaka offerings.",
    multiDayGroupId: "ganesha_gowri_parva",
    voiceAliases: ["ganesha", "ganapathi", "vinayaka", "chaturthi", "ಗಣೇಶ", "ಗಣಪತಿ", "ಚೌತಿ"]
  },
  {
    id: "rishi_panchami",
    date: "2026-09-15",
    nameKn: "ಋಷಿ ಪಂಚಮೀ (ಸಪ್ತರ್ಷಿ ಆರಾಧನೆ)",
    nameEn: "Rishi Panchami",
    category: "Vrata & Upavasa",
    categoryKn: "ವ್ರತ & ಉಪವಾಸ",
    masaKn: "ಭಾದ್ರಪದ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಂಚಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 10:15 AM",
    pujaWindowEn: "Morning 06:40 AM - 10:15 AM",
    descriptionKn: "ಸಪ್ತರ್ಷಿಗಳ ಆರಾಧನೆ ಮತ್ತು ಪಾಪ ನಿವಾರಣಾ ವ್ರತ.",
    descriptionEn: "Penitential vrata dedicated to the Seven Ancient Sages.",
    multiDayGroupId: "ganesha_gowri_parva",
    voiceAliases: ["rishi panchami", "ಋಷಿ ಪಂಚಮಿ"]
  },
  {
    id: "ananta_padmanabha",
    date: "2026-09-25",
    nameKn: "ಅನಂತ ಪದ್ಮನಾಭ ವ್ರತ",
    nameEn: "Anantha Padmanabha Vrata",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಭಾದ್ರಪದ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಚತುರ್ದಶಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 11:15 AM",
    pujaWindowEn: "Morning 06:40 AM - 11:15 AM",
    descriptionKn: "ಅನಂತ ವ್ರತ, ಚತುರ್ದಶ ಸೂತ್ರ (೧೪ ಗಂಟುಗಳ ದಾರ) ಬಂಧನ ಮತ್ತು ಶ್ರೀ ಪದ್ಮನಾಭ ಸ್ವಾಮಿ ಆರಾಧನೆ.",
    descriptionEn: "Vow of Infinite Lord Padmanabha with tying of the 14-knot holy thread.",
    voiceAliases: ["anantha", "ananta padmanabha", "ಅನಂತ ಪದ್ಮನಾಭ", "ಅನಂತ ವ್ರತ"]
  },
  {
    id: "mahalaya_amavasya",
    date: "2026-10-10",
    nameKn: "ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ (ಸರ್ವಪಿತೃ ಪರ್ವ)",
    nameEn: "Mahalaya Amavasya (Sarva Pitru Moksha)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಭಾದ್ರಪದ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಅಮಾವಾಸ್ಯೆ",
    pujaWindowKn: "ಅಪರಾಹ್ನ ಕಾಲ: ಮಧ್ಯಾಹ್ನ 12:15 PM - 03:45 PM (ತರ್ಪಣ & ಶ್ರಾದ್ಧ)",
    pujaWindowEn: "Aparahna Period: 12:15 PM - 03:45 PM (Tarpana & Shraddha)",
    descriptionKn: "ಪಿತೃಪಕ್ಷದ ಮಹಾ ಪುಣ್ಯದಿನ, ಅಪರಾಹ್ನ ಕಾಲದಲ್ಲಿ ಸರ್ವಪಿತೃ ತರ್ಪಣ, ಶ್ರಾದ್ಧ ಮತ್ತು ಅನ್ನದಾನ.",
    descriptionEn: "Greatest ancestral blessing day for tarpana, pinda pradana and annadana.",
    voiceAliases: ["mahalaya", "pitru paksha", "sarva pitru amavasya", "ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ", "ಪಿತೃ ಪಕ್ಷ"]
  },

  // ASHVAYUJA MASA (NAVARATRI & DASARA)
  {
    id: "navaratri_start",
    date: "2026-10-11",
    nameKn: "ಶರನ್ನವರಾತ್ರಿ ಪ್ರಾರಂಭ (ಘಟಸ್ಥಾಪನೆ)",
    nameEn: "Sharad Navaratri Begins (Ghatasthapana)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಾಡ್ಯ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:38 AM - 10:15 AM",
    pujaWindowEn: "Morning 06:38 AM - 10:15 AM",
    descriptionKn: "ದೇವೀ ನವರಾತ್ರಿಯ ಪ್ರಥಮ ದಿನ, ಕಲಶ ಸ್ಥಾಪನೆ ಮತ್ತು ಶೈಲಪುತ್ರಿ ಪೂಜಾ.",
    descriptionEn: "First day of Sharad Navaratri, Kalasha installation and Shailaputri puja.",
    multiDayGroupId: "navaratri_dasara",
    voiceAliases: ["navaratri", "ghatasthapana", "ನವರಾತ್ರಿ ಪ್ರಾರಂಭ", "ಘಟಸ್ಥಾಪನೆ"]
  },
  {
    id: "saraswati_avahana",
    date: "2026-10-16",
    nameKn: "ಸರಸ್ವತಿ ಆವಾಹನೆ (ಮೂಲಾ ನಕ್ಷತ್ರ)",
    nameEn: "Saraswati Avahana",
    category: "Vrata & Upavasa",
    categoryKn: "ವ್ರತ & ಉಪವಾಸ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಷಷ್ಠಿ",
    pujaWindowKn: "ಸಾಯಂಕಾಲ 04:30 PM - 06:30 PM",
    pujaWindowEn: "Evening 04:30 PM - 06:30 PM",
    descriptionKn: "ಮೂಲಾ ನಕ್ಷತ್ರದಲ್ಲಿ ವಾಗ್ದೇವಿ ಸರಸ್ವತಿಯ ಆವಾಹನೆ ಮತ್ತು ಗ್ರಂಥ ಪೂಜೆ.",
    descriptionEn: "Invoking Goddess Saraswati on auspicious Moola nakshatra.",
    multiDayGroupId: "navaratri_dasara",
    voiceAliases: ["saraswati avahana", "ಸರಸ್ವತಿ ಆವಾಹನೆ"]
  },
  {
    id: "durgashtami",
    date: "2026-10-18",
    nameKn: "ದುರ್ಗಾಷ್ಟಮೀ (ಮಹಾಷ್ಟಮೀ ವ್ರತ)",
    nameEn: "Durga Ashtami (Maha Ashtami)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಅಷ್ಟಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:40 AM - 11:30 AM",
    pujaWindowEn: "Morning 06:40 AM - 11:30 AM",
    descriptionKn: "ಮಹಿಷಾಸುರ ಮರ್ದಿನಿ ಮಹಾದುರ್ಗಾ ಪೂಜೆ, ಕನ್ಯಾಪೂಜೆ ಮತ್ತು ಮಹಾಗೌರಿ ಆರಾಧನೆ.",
    descriptionEn: "Durga Mahashtami, Kanya Puja, and sacrificial offering to Mother Mahagauri.",
    multiDayGroupId: "navaratri_dasara",
    voiceAliases: ["durgashtami", "maha ashtami", "ದುರ್ಗಾಷ್ಟಮಿ", "ಮಹಾಷ್ಟಮಿ"]
  },
  {
    id: "ayudha_puja",
    date: "2026-10-19",
    nameKn: "ಮಹಾನವಮೀ (ಆಯುಧ ಪೂಜೆ / ವಾಹನ ಪೂಜೆ)",
    nameEn: "Ayudha Puja / Mahanavami",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ನವಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 11:30 AM & ಮಧ್ಯಾಹ್ನ 02:00 PM - 04:30 PM",
    pujaWindowEn: "Morning 06:30 AM - 11:30 AM & Afternoon 02:00 PM - 04:30 PM",
    descriptionKn: "ಕರ್ಮೋಪಕರಣ ಪೂಜೆ, ವಾಹನ ಪೂಜೆ, ಶಸ್ತ್ರಾಸ್ತ್ರ ಪೂಜೆ ಮತ್ತು ಸಿದ್ಧಿದಾತ್ರಿ ಆರಾಧನೆ.",
    descriptionEn: "Blessing of work instruments, vehicles, machineries, and tools.",
    multiDayGroupId: "navaratri_dasara",
    voiceAliases: ["ayudha puja", "mahanavami", "vahana puja", "ಆಯುಧ ಪೂಜೆ", "ಮಹಾನವಮಿ", "ವಾಹನ ಪೂಜೆ"]
  },
  {
    id: "vijayadashami",
    date: "2026-10-20",
    nameKn: "ವಿಜಯದಶಮೀ (ದಸರಾ ಮಹೋತ್ಸವ)",
    nameEn: "Vijayadashami (Dussehra)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ದಶಮಿ",
    pujaWindowKn: "ಅಪರಾಜಿತಾ / ವಿಜಯ ಮುಹೂರ್ತ: ಮಧ್ಯಾಹ್ನ 01:45 PM - 03:15 PM",
    pujaWindowEn: "Aparajita / Vijaya Muhurtha: 01:45 PM - 03:15 PM",
    descriptionKn: "ವಿಜಯದಶಮಿ, ಶಮೀ ವೃಕ್ಷ ಪೂಜೆ, ಸೀಮೋಲ್ಲಂಘನ, ಬನ್ನಿ ಹಂಚುವುದು ಮತ್ತು ವಿದ್ಯಾರಂಭ.",
    descriptionEn: "Vijayadashami victory day, Shami tree worship, exchange of Banni, and initiation of studies.",
    multiDayGroupId: "navaratri_dasara",
    voiceAliases: ["vijayadashami", "dasara", "dussehra", "banni", "ವಿಜಯದಶಮಿ", "ದಸರಾ", "ಬನ್ನಿ ಹಬ್ಬ"]
  },

  // DEEPAVALI DAYS
  {
    id: "dhantrayodashi",
    date: "2026-11-07",
    nameKn: "ಧನತ್ರಯೋದಶಿ (ನೀರು ತುಂಬುವ ಹಬ್ಬ)",
    nameEn: "Dhanatrayodashi (Dhanteras)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ತ್ರಯೋದಶಿ",
    pujaWindowKn: "ಯಮದೀಪ ದಾನ: ಸಾಯಂಕಾಲ 05:45 PM - 07:15 PM",
    pujaWindowEn: "Yama Deepa: 05:45 PM - 07:15 PM",
    descriptionKn: "ದೀಪಾವಳಿಯ ಪ್ರಥಮ ದಿನ, ಗಂಗಾಪೂಜೆ, ನೀರು ತುಂಬುವ ಹಬ್ಬ ಹಾಗೂ ಧನ್ವಂತರಿ ಜಯಂತಿ.",
    descriptionEn: "First day of Diwali, water sanctification, and Dhanvantari invocation.",
    multiDayGroupId: "deepavali_parva",
    voiceAliases: ["dhanteras", "dhantrayodashi", "ಧನತ್ರಯೋದಶಿ", "ನೀರು ತುಂಬುವ ಹಬ್ಬ"]
  },
  {
    id: "naraka_chaturdashi",
    date: "2026-11-08",
    nameKn: "ನರಕ ಚತುರ್ದಶೀ (ದೀಪಾವಳಿ ತೈಲಾಭ್ಯಂಗ)",
    nameEn: "Naraka Chaturdashi",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಚತುರ್ದಶಿ",
    pujaWindowKn: "ಅರುಣೋದಯ ತೈಲಾಭ್ಯಂಗ: ಮುಂಜಾನೆ 04:45 AM - 06:15 AM",
    pujaWindowEn: "Dawn Oil Bath: 04:45 AM - 06:15 AM",
    descriptionKn: "ನರಕಾಸುರ ಸಂಹಾರ ಸ್ಮರಣಾರ್ಥ ಪ್ರಾತಃಕಾಲ ತೈಲಾಭ್ಯಂಗ, ಯಮದೀಪ ದಾನ ಮತ್ತು ಹೊಸ ಬಟ್ಟೆ ಧಾರಣೆ.",
    descriptionEn: "Sacred dawn oil bath commemorating Lord Krishna's triumph over Narakasura.",
    multiDayGroupId: "deepavali_parva",
    voiceAliases: ["naraka chaturdashi", "tailabhyanga", "ನರಕ ಚತುರ್ದಶಿ", "ದೀಪಾವಳಿ ಸ್ನಾನ"]
  },
  {
    id: "deepavali_lakshmi",
    date: "2026-11-09",
    nameKn: "ದೀಪಾವಳಿ ಅಮಾವಾಸ್ಯೆ (ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಪೂಜೆ)",
    nameEn: "Diwali Lakshmi Puja",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಆಶ್ವಯುಜ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಅಮಾವಾಸ್ಯೆ",
    pujaWindowKn: "ಪ್ರದೋಷ ಕಾಲ ಲಕ್ಷ್ಮೀ ಪೂಜೆ: ಸಂಜೆ 06:15 PM - 08:35 PM (ಸ್ಥಿರ ವೃಷಭ ಲಗ್ನ)",
    pujaWindowEn: "Pradosha Lakshmi Puja: 06:15 PM - 08:35 PM (Sthira Vrishabha)",
    descriptionKn: "ದೀಪೋತ್ಸವ, ಮಹಾಲಕ್ಷ್ಮೀ ಪೂಜಾ, ಕೇದಾರ ವ್ರತ, ಧನ ಸಮೃದ್ಧಿ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಅಂಗಡಿ-ವ್ಯಾಪಾರ ಪೂಜೆ.",
    descriptionEn: "Diwali festival of lights, auspicious Lakshmi-Kubera puja, and business book opening.",
    multiDayGroupId: "deepavali_parva",
    voiceAliases: ["deepavali", "diwali", "lakshmi puja", "ದೀಪಾವಳಿ", "ಲಕ್ಷ್ಮಿ ಪೂಜೆ", "ದೀಪಾವಳಿ ಅಮಾವಾಸ್ಯೆ"]
  },
  {
    id: "bali_padyami",
    date: "2026-11-10",
    nameKn: "ಬಲಿಪಾಡ್ಯಮಿ (ಗೋಪೂಜೆ)",
    nameEn: "Bali Padyami (Go Puja)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಕಾರ್ತಿಕ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಪಾಡ್ಯ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:30 AM - 09:30 AM",
    pujaWindowEn: "Morning 06:30 AM - 09:30 AM",
    descriptionKn: "ಬಲಿರಾಜ ಪೂಜೆ, ಗೋಮಾತೆ ಪೂಜೆ, ಹೊಸ್ತಿಲು ಪೂಜೆ ಮತ್ತು ಕಾರ್ತಿಕ ದೀಪೋತ್ಸವ ಪ್ರಾರಂಭ.",
    descriptionEn: "King Bali remembrance, cow worship, and commencement of Karthika Deepotsava.",
    multiDayGroupId: "deepavali_parva",
    voiceAliases: ["bali padyami", "go puja", "ಬಲಿಪಾಡ್ಯಮಿ", "ಗೋಪೂಜೆ"]
  },

  // KARTIKA MASA
  {
    id: "utthana_dwadashi",
    date: "2026-11-21",
    nameKn: "ಉತ್ತಾನ ದ್ವಾದಶೀ (ತುಳಸೀ ವಿವಾಹ)",
    nameEn: "Tulasi Vivaha (Utthana Dwadashi)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಕಾರ್ತಿಕ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ದ್ವಾದಶಿ",
    pujaWindowKn: "ಸಂಧ್ಯಾ ಕಾಲ: ಸಂಜೆ 05:45 PM - 08:00 PM",
    pujaWindowEn: "Evening 05:45 PM - 08:00 PM",
    descriptionKn: "ಧಾತ್ರಿ ಪೂಜೆ, ತುಳಸೀ-ದಾಮೋದರ ಕಲ್ಯಾಣೋತ್ಸವ, ಬೆಲ್ಲಿ ಹಬ್ಬ ಮತ್ತು ದೀಪೋತ್ಸವ.",
    descriptionEn: "Sacred wedding of Tulasi Devi with Lord Damodara and Dhatri puja.",
    voiceAliases: ["tulasi vivaha", "utthana dwadashi", "ತುಳಸಿ ವಿವಾಹ", "ಉತ್ಥಾನ ದ್ವಾದಶಿ", "ತುಳಸಿ ಹಬ್ಬ"]
  },
  {
    id: "karthika_purnima",
    date: "2026-11-24",
    nameKn: "ಕಾರ್ತಿಕ ಹುಣ್ಣಿಮೆ (ದೇವ ದೀಪಾವಳಿ / ತ್ರಿಪುರೋತ್ಸವ)",
    nameEn: "Karthika Purnima (Dev Diwali)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಕಾರ್ತಿಕ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಪ್ರದೋಷ ದೀಪೋತ್ಸವ: ಸಂಜೆ 06:00 PM - 08:30 PM",
    pujaWindowEn: "Pradosha Deepotsava: 06:00 PM - 08:30 PM",
    descriptionKn: "ಕಾರ್ತಿಕ ದೀಪೋತ್ಸವ ಸಮಾಪ್ತಿ, ತ್ರಿಪುರಾರಿ ಪೂರ್ಣಿಮಾ ಮತ್ತು ದೇವಾಲಯಗಳಲ್ಲಿ ಲಕ್ಷದೀಪೋತ್ಸವ.",
    descriptionEn: "Grand lighting of 100,000 lamps (Lakshadeepotsava) and Tripurari festival.",
    voiceAliases: ["karthika purnima", "dev diwali", "ಕಾರ್ತಿಕ ಹುಣ್ಣಿಮೆ", "ದೇವ ದೀಪಾವಳಿ", "ದೀಪೋತ್ಸವ"]
  },

  // MARGASHIRA MASA
  {
    id: "subrahmanya_shashthi",
    date: "2026-12-15",
    nameKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಷಷ್ಠೀ (ಚಂಪಾ ಷಷ್ಠಿ)",
    nameEn: "Subrahmanya Shashthi (Champa Shashthi)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಮಾರ್ಗಶಿರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಷಷ್ಠಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 06:45 AM - 11:30 AM",
    pujaWindowEn: "Morning 06:45 AM - 11:30 AM",
    descriptionKn: "ಸ್ಕಂದ ಸೇನಾನಿ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಷಷ್ಠೀ ಮಹೋತ್ಸವ ಮತ್ತು ನಾಗಾರಾಧನೆ.",
    descriptionEn: "Celebration of Lord Subrahmanya and sacred Sarpa Samskara prayers.",
    voiceAliases: ["subrahmanya shashthi", "champa shashthi", "ಸುಬ್ರಹ್ಮಣ್ಯ ಷಷ್ಠಿ", "ಚಂಪಾ ಷಷ್ಠಿ"]
  },
  {
    id: "vaikunta_ekadashi",
    date: "2026-12-20",
    nameKn: "ವೈಕುಂಠ ಏಕಾದಶಿ (ಗೀತಾ ಜಯಂತೀ / ಮೋಕ್ಷದಾ)",
    nameEn: "Vaikunta Ekadashi (Gita Jayanti)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಮಾರ್ಗಶಿರ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಏಕಾದಶಿ",
    pujaWindowKn: "ವೈಕುಂಠ ದ್ವಾರ ದರ್ಶನ: ಪ್ರಾತಃಕಾಲ 05:30 AM ನಿಂದ ದಿನವಿಡೀ",
    pujaWindowEn: "Vaikunta Dwara Opening: From 05:30 AM All Day",
    descriptionKn: "ವೈಕುಂಠ ದ್ವಾರ ದರ್ಶನ, ಶ್ರೀಮದ್ಭಗವದ್ಗೀತಾ ಜಯಂತಿ ಮತ್ತು ಮೋಕ್ಷ ಪ್ರದಾಯಕ ಏಕಾದಶಿ ವ್ರತ.",
    descriptionEn: "Opening of Vaikunta gateway in temples and Gita Jayanti observance.",
    voiceAliases: ["vaikunta ekadashi", "gita jayanti", "mokshada", "ವೈಕುಂಠ ಏಕಾದಶಿ", "ಗೀತಾ ಜಯಂತಿ", "ಮೋಕ್ಷದಾ ಏಕಾದಶಿ"]
  },

  // PUSHYA MASA
  {
    id: "makara_sankranti",
    date: "2027-01-14",
    nameKn: "ಮಕರ ಸಂಕ್ರಾಂತಿ (ಸೌರಾಯನ ಪುಣ್ಯಕಾಲ)",
    nameEn: "Makara Sankranti (Solar Uttarayana)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಪುಷ್ಯ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಸಪ್ತಮಿ",
    pujaWindowKn: "ಸಂಕ್ರಾಂತಿ ಪುಣ್ಯಕಾಲ: 08:15 AM - 04:30 PM",
    pujaWindowEn: "Sankranti Punya Kaala: 08:15 AM - 04:30 PM",
    descriptionKn: "ಸೂರ್ಯನ ಮಕರ ರಾಶಿ ಪ್ರವೇಶ, ಉತ್ತರಾಯಣ ಪುಣ್ಯಕಾಲ, ಎಳ್ಳು-ಬೆಲ್ಲ ಹಂಚುವ ಸಂಭ್ರಮ.",
    descriptionEn: "Sun enters Capricorn, sacred Uttarayana transit, sesame-jaggery distribution.",
    voiceAliases: ["sankranti", "makara sankranti", "pongal", "ಸಂಕ್ರಾಂತಿ", "ಮಕರ ಸಂಕ್ರಾಂತಿ", "ಎಳ್ಳು ಬೆಲ್ಲ"]
  },

  // MAGHA MASA
  {
    id: "ratha_saptami",
    date: "2027-02-13",
    nameKn: "ರಥಸಪ್ತಮೀ (ಸೂರ್ಯ ಜಯಂತೀ)",
    nameEn: "Ratha Saptami (Surya Jayanti)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಮಾಘ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಸಪ್ತಮಿ",
    pujaWindowKn: "ಅರುಣೋದಯ ಸ್ನಾನ: ಪ್ರಾತಃಕಾಲ 06:30 AM - 08:30 AM",
    pujaWindowEn: "Dawn Snana: 06:30 AM - 08:30 AM",
    descriptionKn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣನ ಜಯಂತಿ, ಏಳು ಎಕ್ಕದ ಎಲೆಗಳ ಸ್ನಾನ ಮತ್ತು ಸೂರ್ಯನಮಸ್ಕಾರ.",
    descriptionEn: "Appearance day of Lord Surya, 7 Arka leaves bath, and Sun salutations.",
    voiceAliases: ["ratha saptami", "surya jayanti", "ರಥಸಪ್ತಮಿ", "ಸೂರ್ಯ ಜಯಂತಿ"]
  },
  {
    id: "madhwa_navami",
    date: "2027-02-15",
    nameKn: "ಶ್ರೀ ಮಧ್ವ ನವಮೀ (ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯ ಆರಾಧನೆ)",
    nameEn: "Madhwa Navami",
    category: "Jayanti",
    categoryKn: "ಜಯಂತಿ",
    masaKn: "ಮಾಘ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ನವಮಿ",
    pujaWindowKn: "ಪ್ರಾತಃಕಾಲ 07:00 AM - 11:30 AM",
    pujaWindowEn: "Morning 07:00 AM - 11:30 AM",
    descriptionKn: "ದ್ವೈತ ಸಿದ್ಧಾಂತ ಪ್ರತಿಷ್ಠಾಪಕ ಜಗದ್ಗುರು ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯರ ಆರಾಧನಾ ಪುಣ್ಯದಿನ.",
    descriptionEn: "Aradhana day of Jagadguru Sri Madhwacharya.",
    voiceAliases: ["madhwa navami", "madhwacharya", "ಮಧ್ವ ನವಮಿ"]
  },
  {
    id: "maha_shivaratri",
    date: "2027-03-06",
    nameKn: "ಮಹಾಶಿವರಾತ್ರಿ ವ್ರತ (ಗೋಕರ್ಣ ಮಹಾರಥೋತ್ಸವ)",
    nameEn: "Maha Shivaratri (Gokarna Maharathotsava)",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಮಾಘ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಚತುರ್ದಶಿ",
    pujaWindowKn: "ಚತುರ್ಯಾಮ ಪೂಜೆ & ಜಾಗರಣೆ: ಸಂಜೆ 06:15 PM ನಿಂದ ಮರುದಿನ 06:15 AM ರವರೆಗೆ",
    pujaWindowEn: "Four-Yama Vigil & Abhishekam: 06:15 PM to 06:15 AM next morning",
    descriptionKn: "ಪರಮಶಿವನ ಮಹಾಪರ್ವ, ರಾತ್ರಿ ಚತುರ್ಯಾಮ ಜಾಗರಣೆ, ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರಥೋತ್ಸವ.",
    descriptionEn: "Grand all-night vigil for Lord Shiva, Rudrabhisheka, and Gokarna chariot festival.",
    voiceAliases: ["shivaratri", "maha shivaratri", "gokarna rathotsava", "ಶಿವರಾತ್ರಿ", "ಮಹಾಶಿವರಾತ್ರಿ", "ಗೋಕರ್ಣ ರಥೋತ್ಸವ"]
  },

  // PHALGUNA MASA
  {
    id: "holi_kamadahana",
    date: "2027-03-22",
    nameKn: "ಕಾಮದಹನ / ಹೋಲಿಕಾ ದಹನ (ಫಾಲ್ಗುಣ ಹುಣ್ಣಿಮೆ)",
    nameEn: "Kamadahana / Holika Dahan",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಫಾಲ್ಗುಣ",
    pakshaKn: "ಶುಕ್ಲ",
    tithiKn: "ಹುಣ್ಣಿಮೆ",
    pujaWindowKn: "ಕಾಮದಹನ: ಸಂಜೆ 06:45 PM - 09:30 PM",
    pujaWindowEn: "Bonfire Vigil: 06:45 PM - 09:30 PM",
    descriptionKn: "ಕಾಮದೇವ ದಹನ, ಹೋಲಿಕಾ ದಹನ ಪರ್ವ ಮತ್ತು ಫಾಲ್ಗುಣ ಹುಣ್ಣಿಮೆ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ.",
    descriptionEn: "Burning of Kama bonfire signifying victory of devotion over desire.",
    voiceAliases: ["holi", "kamadahana", "holika", "ಹೋಳಿ", "ಕಾಮದಹನ"]
  },
  {
    id: "parabhava_samapti",
    date: "2027-04-07",
    nameKn: "ಪರಾಭವ ಸಂವತ್ಸರ ಸಮಾಪ್ತಿ (ದರ್ಶ ಅಮಾವಾಸ್ಯೆ)",
    nameEn: "Parabhava Samvatsara Concludes",
    category: "Major Festival",
    categoryKn: "ಪ್ರಮುಖ ಹಬ್ಬ",
    masaKn: "ಫಾಲ್ಗುಣ",
    pakshaKn: "ಕೃಷ್ಣ",
    tithiKn: "ಅಮಾವಾಸ್ಯೆ",
    pujaWindowKn: "ಪಿತೃ ತರ್ಪಣ: ಮಧ್ಯಾಹ್ನ 12:30 PM - 03:00 PM",
    pujaWindowEn: "Pitru Tarpana: 12:30 PM - 03:00 PM",
    descriptionKn: "ಪರಾಭವ ಸಂವತ್ಸರದ ಕೊನೆಯ ದಿನ, ಪಿತೃ ತರ್ಪಣ ಮತ್ತು ಮರುದಿನ ಪ್ಲವಂಗ ಸಂವತ್ಸರ ಸ್ವಾಗತ.",
    descriptionEn: "Conclusion of Parabhava Samvatsara year and welcoming Plavanga Samvatsara.",
    voiceAliases: ["parabhava samapti", "darsha amavasya", "ಪರಾಭವ ಸಮಾಪ್ತಿ"]
  }
];

/* -------------------------------------------------------------------------- */
/* 3. INTELLIGENT BILINGUAL SEARCH HELPER                                     */
/* -------------------------------------------------------------------------- */

export interface FestivalSearchResult {
  exactMatch?: MasterFestivalItem;
  matchedMultiDayGroup?: MultiDayFestivalGroup;
  matchingItems: MasterFestivalItem[];
  queryTerm: string;
}

/**
 * Searches festivals using Kannada & English text/speech keywords.
 * Identifies multi-day festival matches (e.g. "Dasara" -> 10 Days, "Deepavali" -> 4 Days).
 */
export function searchBaggonaFestivals(rawQuery: string): FestivalSearchResult {
  const queryTerm = (rawQuery || "").trim().toLowerCase();
  if (!queryTerm) {
    return {
      matchingItems: MASTER_ANNUAL_FESTIVALS,
      queryTerm: ""
    };
  }

  // 1. Check if matches any Multi-Day festival group
  const matchedMultiDayGroup = MULTI_DAY_FESTIVALS.find((g) => {
    if (g.id.toLowerCase().includes(queryTerm)) return true;
    if (g.groupNameKn.toLowerCase().includes(queryTerm)) return true;
    if (g.groupNameEn.toLowerCase().includes(queryTerm)) return true;
    return g.voiceAliases.some((alias) => queryTerm.includes(alias) || alias.includes(queryTerm));
  });

  // 2. Filter matching individual items
  const matchingItems = MASTER_ANNUAL_FESTIVALS.filter((f) => {
    if (f.nameKn.toLowerCase().includes(queryTerm)) return true;
    if (f.nameEn.toLowerCase().includes(queryTerm)) return true;
    if (f.descriptionKn.toLowerCase().includes(queryTerm)) return true;
    if (f.descriptionEn.toLowerCase().includes(queryTerm)) return true;
    if (f.masaKn.toLowerCase().includes(queryTerm)) return true;
    if (f.tithiKn.toLowerCase().includes(queryTerm)) return true;
    if (f.date.includes(queryTerm)) return true;
    return f.voiceAliases.some((alias) => queryTerm.includes(alias) || alias.includes(queryTerm));
  });

  const exactMatch = matchingItems[0];

  return {
    exactMatch,
    matchedMultiDayGroup,
    matchingItems,
    queryTerm
  };
}

/**
 * Returns a festival item for a given calendar date if one occurs.
 */
export function getBaggonaFestivalForDate(dateStr: string): MasterFestivalItem | undefined {
  return MASTER_ANNUAL_FESTIVALS.find((f) => f.date === dateStr);
}

/**
 * Checks if a date falls inside any active multi-day festival group.
 */
export function getActiveMultiDayFestivalForDate(dateStr: string): { group: MultiDayFestivalGroup; subDay: MultiDayFestivalSubDay } | null {
  for (const group of MULTI_DAY_FESTIVALS) {
    if (dateStr >= group.startDate && dateStr <= group.endDate) {
      const subDay = group.days.find((d) => d.date === dateStr);
      if (subDay) {
        return { group, subDay };
      }
    }
  }
  return null;
}
