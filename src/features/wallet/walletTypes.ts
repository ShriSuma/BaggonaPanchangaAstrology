export interface CoinPackage {
  key: string;
  name: string;
  kannadaName: string;
  amountInr: number;
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  effectiveRateText: string;
  tag?: string;
  isPopular?: boolean;
}

export const COIN_CONVERSION_RATE = 10; // ₹1 = 10 Coins

export const RECHARGE_PACKAGES: CoinPackage[] = [
  {
    key: "shubha",
    name: "Shubha Arambha",
    kannadaName: "ಶುಭ ಆರಂಭ",
    amountInr: 100,
    baseCoins: 1000,
    bonusCoins: 100, // 10%
    totalCoins: 1100,
    effectiveRateText: "₹1 = 11 Coins (10% Bonus)",
    tag: "Starter"
  },
  {
    key: "silver",
    name: "Purohita Silver",
    kannadaName: "ಪುರೋಹಿತ ಸಿಲ್ವರ್",
    amountInr: 250,
    baseCoins: 2500,
    bonusCoins: 500, // 20%
    totalCoins: 3000,
    effectiveRateText: "₹1 = 12 Coins (20% Bonus)",
    tag: "Most Popular",
    isPopular: true
  },
  {
    key: "gold",
    name: "Acharya Gold",
    kannadaName: "ಆಚಾರ್ಯ ಗೋಲ್ಡ್",
    amountInr: 500,
    baseCoins: 5000,
    bonusCoins: 1500, // 30%
    totalCoins: 6500,
    effectiveRateText: "₹1 = 13 Coins (30% Bonus)",
    tag: "Best Value"
  },
  {
    key: "platinum",
    name: "Brahmarshi Platinum",
    kannadaName: "ಬ್ರಹ್ಮರ್ಷಿ ಪ್ಲಾಟಿನಂ",
    amountInr: 1000,
    baseCoins: 10000,
    bonusCoins: 4000, // 40%
    totalCoins: 14000,
    effectiveRateText: "₹1 = 14 Coins (40% Bonus)",
    tag: "Pro Max"
  }
];

export type ServiceCategory = "sankhyashastra" | "kundli" | "muhurtha" | "divine_tools" | "reports";

export interface ServiceCost {
  key: string;
  name: string;
  kannadaName: string;
  coins: number;
  inrEquivalent: number;
  description: string;
  category: ServiceCategory;
}

export const SERVICE_COIN_COSTS: Record<string, ServiceCost> = {
  DAILY_PANCHANG: {
    key: "DAILY_PANCHANG",
    name: "Daily Panchang & Darshana",
    kannadaName: "ದೈನಂದಿನ ಪಂಚಾಂಗ & ದರ್ಶನ",
    coins: 0,
    inrEquivalent: 0,
    description: "Daily mathematical panchang & calendar (Free)",
    category: "divine_tools"
  },
  SANKHYA_PRASHNA: {
    key: "SANKHYA_PRASHNA",
    name: "Sankhya Shastra Prashna Oracle",
    kannadaName: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ",
    coins: 250,
    inrEquivalent: 25,
    description: "Vedic number horary divination with Sthira/Chara/Ubhaya & Varna influence (250 Coins / ₹25)",
    category: "sankhyashastra"
  },
  SANKHYA_NAME_SUGGESTION: {
    key: "SANKHYA_NAME_SUGGESTION",
    name: "Sankhya Shastra Name Degree & Syllables",
    kannadaName: "ಶುಭ ನಾಮ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Name Degree)",
    coins: 500,
    inrEquivalent: 50,
    description: "Chaldean & Pythagorean vibration name correction & degree alignment (500 Coins / ₹50)",
    category: "sankhyashastra"
  },
  SANKHYA_MOBILE_VEHICLE: {
    key: "SANKHYA_MOBILE_VEHICLE",
    name: "Lucky Vehicle & Mobile Numerology",
    kannadaName: "ಶುಭ ವಾಹನ & ಮೊಬೈಲ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ",
    coins: 500,
    inrEquivalent: 50,
    description: "Lucky sum total calculation for vehicle plates and phone numbers (500 Coins / ₹50)",
    category: "sankhyashastra"
  },
  SANKHYA_JANMA_ANALYSIS: {
    key: "SANKHYA_JANMA_ANALYSIS",
    name: "Sankhya Janma Vedic Grid & Dasha Analysis",
    kannadaName: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಜನ್ಮ ಗ್ರಿಡ್ & ದಶಾ ವಿಶ್ಲೇಷಣೆ",
    coins: 500,
    inrEquivalent: 50,
    description: "Complete Vedic Numerology Janma Grid, 37 Yogas, Dasha Timeline & Remedies (500 Coins / ₹50)",
    category: "sankhyashastra"
  },
  KAALA_DIKSUCHI_QUESTION: {
    key: "KAALA_DIKSUCHI_QUESTION",
    name: "Kaala Diksuchi Timing Oracle",
    kannadaName: "ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ಭವಿಷ್ಯ ದರ್ಶನ",
    coins: 200,
    inrEquivalent: 20,
    description: "Kaala Diksuchi timing analysis & auspicious direction consultation (200 Coins / ₹20)",
    category: "divine_tools"
  },
  PURVA_JANMA_QUESTION: {
    key: "PURVA_JANMA_QUESTION",
    name: "Purva Janma Karmic Reading",
    kannadaName: "ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯ ಭವಿಷ್ಯ (ಪೂರ್ವ ಜನ್ಮ)",
    coins: 200,
    inrEquivalent: 20,
    description: "Purva Janma past life karma and remedial reading (200 Coins / ₹20)",
    category: "divine_tools"
  },
  VAHANA_MUHURTHA: {
    key: "VAHANA_MUHURTHA",
    name: "Vehicle Purchase Auspicious Days (Vahana Muhurtha)",
    kannadaName: "ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ",
    coins: 500,
    inrEquivalent: 50,
    description: "Auspicious dates and timings for vehicle purchase/delivery (500 Coins / ₹50)",
    category: "muhurtha"
  },
  KUNDLI_CALCULATION: {
    key: "KUNDLI_CALCULATION",
    name: "Detailed Birth Kundli Generation",
    kannadaName: "ಜನನ ಕುಂಡಲಿ ರಚನೆ & ಗ್ರಹ ಸ್ಥಾನ",
    coins: 500,
    inrEquivalent: 50,
    description: "Complete birth chart with Rashi, Nakshatra, Pada & Planetary houses (500 Coins / ₹50)",
    category: "kundli"
  },
  ASTROLOGY_QUESTION: {
    key: "ASTROLOGY_QUESTION",
    name: "Astrology Question & Consultation",
    kannadaName: "ಶಾಸ್ತ್ರೀಯ ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆ",
    coins: 500,
    inrEquivalent: 50,
    description: "Individual specific life / career / marriage question analysis (500 Coins / ₹50)",
    category: "kundli"
  },
  AI_PRASHNA_QUESTION: {
    key: "AI_PRASHNA_QUESTION",
    name: "Prashna Shastra Oracle",
    kannadaName: "ತ್ವರಿತ ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ ದರ್ಶನ",
    coins: 50,
    inrEquivalent: 5,
    description: "Instant single-question horary divination (50 Coins / ₹5)",
    category: "divine_tools"
  },
  RAMAN_BHAVISHYA: {
    key: "RAMAN_BHAVISHYA",
    name: "Raman 10-Year Life Bhavishya",
    kannadaName: "ರಾಮನ್ ೧೦ ವರ್ಷಗಳ ಜೀವನ ಭವಿಷ್ಯ",
    coins: 500,
    inrEquivalent: 50,
    description: "10-year stage-by-stage AI life predictions (500 Coins / ₹50)",
    category: "reports"
  },
  STANDARD_JANANA_KUNDLI_PDF: {
    key: "STANDARD_JANANA_KUNDLI_PDF",
    name: "Baggona Panchanga Janana Kundli PDF",
    kannadaName: "ಬಗ್ಗೋಣ ಜನನ ಕುಂಡಲಿ PDF",
    coins: 1000,
    inrEquivalent: 100,
    description: "Baggona Panchanga Janana Kundli PDF with Dasha Bhukti & Planetary Positions (1,000 Coins / ₹100)",
    category: "reports"
  },
  PREMIUM_KUNDLI_PDF: {
    key: "PREMIUM_KUNDLI_PDF",
    name: "Grand 8-Page Premium Kundli PDF Download",
    kannadaName: "ಪ್ರೀಮಿಯಂ ೮-ಪುಟಗಳ ಜಾತಕ ಕುಂಡಲಿ PDF",
    coins: 3500,
    inrEquivalent: 350,
    description: "Grand 8-Page A4 Luxury Gold Astrological Horoscope & Prediction PDF (3,500 Coins / ₹350)",
    category: "reports"
  },
  PREMIUM_PDF_DOWNLOAD: {
    key: "PREMIUM_PDF_DOWNLOAD",
    name: "Royal Multi-Page A4 PDF Booklet",
    kannadaName: "ರಾಜವೈಭವ ೫-ಪುಟಗಳ A4 PDF ಪುಸ್ತಕ",
    coins: 3500,
    inrEquivalent: 350,
    description: "5-page luxury gold royal astrological chart PDF (3,500 Coins / ₹350)",
    category: "reports"
  },
  MELAPAK_MATCH: {
    key: "MELAPAK_MATCH",
    name: "Horoscope Compatibility Match",
    kannadaName: "ವರ-ಕನ್ಯಾ ಗುಣ ಮೇಳಾಪಕ ಜಾತಕ ಕೂಟ",
    coins: 500,
    inrEquivalent: 50,
    description: "36-Guna deep marriage compatibility report (500 Coins / ₹50)",
    category: "kundli"
  },
  SEVA_BOOKING_ASHIRVADA: {
    key: "SEVA_BOOKING_ASHIRVADA",
    name: "Seva Sankalpa & Ashirvada Pass",
    kannadaName: "ದೇವಸ್ಥಾನ ಸೇವಾ ಸಂಕಲ್ಪ & ಆಶೀರ್ವಾದ ಪಾಸ್",
    coins: 200,
    inrEquivalent: 20,
    description: "Official temple seva sankalpa & 90-day QR pass (200 Coins / ₹20)",
    category: "reports"
  },
  PUBLIC_KUNDLI_GENERATION: {
    key: "PUBLIC_KUNDLI_GENERATION",
    name: "Public Janma Kundali Generation",
    kannadaName: "ಸಾರ್ವಜನಿಕ ಜನನ ಕುಂಡಲಿ ರಚನೆ",
    coins: 500,
    inrEquivalent: 50,
    description: "Public authentic birth chart generation with Lagna, Rashi, Nakshatra & Graha degrees (500 Coins / ₹50)",
    category: "kundli"
  },
  PUBLIC_LIFE_ANALYSIS_QA: {
    key: "PUBLIC_LIFE_ANALYSIS_QA",
    name: "Current Life Astrology Analysis & Q&A",
    kannadaName: "ಪ್ರಸ್ತುತ ಜೀವನ ನೇರ ವಿಶ್ಲೇಷಣೆ & ಪ್ರಶ್ನೋತ್ತರ",
    coins: 1000,
    inrEquivalent: 100,
    description: "What is happening in your life right now? Live AI Astrology Analysis & Devotee Q&A (1,000 Coins / ₹100)",
    category: "kundli"
  },
  PUBLIC_KUNDLI_PDF_DOWNLOAD: {
    key: "PUBLIC_KUNDLI_PDF_DOWNLOAD",
    name: "Public Kundali High-Res PDF Download",
    kannadaName: "ಜನನ ಕುಂಡಲಿ ೬-ಪುಟಗಳ ಪ್ರಿಂಟಬಲ್ PDF ಡೌನ್‌ಲೋಡ್",
    coins: 500,
    inrEquivalent: 50,
    description: "Public Devotee High-Resolution 6-Page Janma Kundali PDF Download (500 Coins / ₹50)",
    category: "reports"
  },
  PUBLIC_TAB_UNLOCK: {
    key: "PUBLIC_TAB_UNLOCK",
    name: "Public Detailed Tab Exploration Unlock",
    kannadaName: "ಕುಂಡಲಿ ವಿವರಣಾತ್ಮಕ ವಿಭಾಗ ವೀಕ್ಷಣೆ (Tab Unlock)",
    coins: 200,
    inrEquivalent: 20,
    description: "Individual Explorer Tab Detailed Astrological Reading (200 Coins / ₹20)",
    category: "kundli"
  }
};

export const DEFAULT_PRIEST_UPI_ID = "9108135387@ybl";
export const DEFAULT_PRIEST_MOBILE_NUMBER = "9108135387";
export const DEFAULT_PRIEST_NAME = "Shreeram Pandit";

export type AvailableModuleKey = "panchanga" | "sankhyashastra" | "diksuchi" | "purva_janma" | "vahana_muhurtha" | "public_kundli";

export interface AppModuleConfig {
  key: AvailableModuleKey;
  label: string;
  kannadaLabel: string;
  icon: string;
  description: string;
  kannadaDescription: string;
  costPerQuestionCoins: number;
  costPerQuestionInr: number;
  portalParam: string;
  pageKey: string;
}

export const AVAILABLE_MODULES: AppModuleConfig[] = [
  {
    key: "public_kundli",
    label: "Public Kundli & Life Inquest",
    kannadaLabel: "ಸಾರ್ವಜನಿಕ ಕುಂಡಲಿ & ಅಂತರಂಗ ದರ್ಶನ",
    icon: "🌟",
    description: "Public Devotee Janma Kundli, Personality, 120-Yr Dasha & Live Analysis (₹50 = 500 Coins, ₹100 = 1000 Coins)",
    kannadaDescription: "ಸಾರ್ವಜನಿಕ ಭಕ್ತರ ಜನನ ಜಾತಕ, ವ್ಯಕ್ತಿತ್ವ, ೧೨೦-ವರ್ಷಗಳ ದಶಾ ಕಾಲಚಕ್ರ & ನೇರ ಜೀವನ ವಿಶ್ಲೇಷಣೆ",
    costPerQuestionCoins: 500,
    costPerQuestionInr: 50,
    portalParam: "public_kundli",
    pageKey: "publickundli"
  },
  {
    key: "panchanga",
    label: "Baggona Panchanga",
    kannadaLabel: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ಜಾತಕ",
    icon: "🔮",
    description: "Vedic Panchanga, Birth Kundli, Calendar & Dasha Bhukti (₹50 = 500 Coins)",
    kannadaDescription: "ವೈದಿಕ ಪಂಚಾಂಗ, ಜನ್ಮ ಜಾತಕ, ೯೦-ದಿನಗಳ ದಿನದರ್ಶನ ಹಾಗೂ ದಶಾ ಭುಕ್ತಿ (₹೫೦ = ೫೦೦ ನಾಣ್ಯ)",
    costPerQuestionCoins: 500,
    costPerQuestionInr: 50,
    portalParam: "panchanga",
    pageKey: "priestdashboard"
  },
  {
    key: "sankhyashastra",
    label: "Sankhya Shastra",
    kannadaLabel: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಭವಿಷ್ಯ & ಪ್ರಶ್ನೆ",
    icon: "🔢",
    description: "Vedic Numerology, Horary Prashna, Name/Mobile Vibrations (₹50 = 500 Coins)",
    kannadaDescription: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ, ಅದೃಷ್ಟ ಸಂಖ್ಯೆ ಹಾಗೂ ನಾಮ ಸಂಖ್ಯಾ ತಿದ್ದುವಿಕೆ (₹೫೦ = ೫೦೦ ನಾಣ್ಯ)",
    costPerQuestionCoins: 500,
    costPerQuestionInr: 50,
    portalParam: "sankhyashastra",
    pageKey: "sankhyashastra"
  },
  {
    key: "diksuchi",
    label: "Divya Kaala Diksuchi",
    kannadaLabel: "ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ",
    icon: "🧭",
    description: "Auspicious Timing, Cardinal Direction & Travel Oracle (₹50 = 500 Coins)",
    kannadaDescription: "ಶುಭ ಕಾಲ ನಿರ್ಣಯ, ದಿಕ್ಕುಗಳ ಬಲ ಹಾಗೂ ಪ್ರಯಾಣ ಪ್ರಶ್ನಾವಳಿ (₹೫೦ = ೫೦೦ ನಾಣ್ಯ)",
    costPerQuestionCoins: 500,
    costPerQuestionInr: 50,
    portalParam: "diksuchi",
    pageKey: "kaaladiksuchi"
  },
  {
    key: "purva_janma",
    label: "Hindina Janmada Rahasya",
    kannadaLabel: "ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯ",
    icon: "📜",
    description: "Purva Janma Past Life Karma & Remedial Insights (₹50 = 500 Coins)",
    kannadaDescription: "ಪೂರ್ವ ಜನ್ಮದ ಕರ್ಮ ಫಲ, ಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಶಮನ ಪರಿಹಾರ (₹೫೦ = ೫೦೦ ನಾಣ್ಯ)",
    costPerQuestionCoins: 500,
    costPerQuestionInr: 50,
    portalParam: "purva_janma",
    pageKey: "hindinajanma"
  },
  {
    key: "vahana_muhurtha",
    label: "Vehicle Purchase (Good Days)",
    kannadaLabel: "ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ",
    icon: "🚗",
    description: "Auspicious Dates & Timings for New Vehicle Purchase/Delivery (₹50 = 500 Coins)",
    kannadaDescription: "ಹೊಸ ವಾಹನ ಖರೀದಿ & ಡೆಲಿವರಿಗೆ ಶುಭ ದಿನಗಳು, ತಾರಾಬಲ ಹಾಗೂ ಮುಹೂರ್ತ (₹೫೦ = ೫೦೦ ನಾಣ್ಯ)",
    costPerQuestionCoins: 500,
    costPerQuestionInr: 50,
    portalParam: "vahana_muhurtha",
    pageKey: "vahanamuhurtha"
  }
];

