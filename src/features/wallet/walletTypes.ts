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

export interface ServiceCost {
  key: string;
  name: string;
  coins: number;
  inrEquivalent: number;
  description: string;
}

export const SERVICE_COIN_COSTS: Record<string, ServiceCost> = {
  DAILY_PANCHANG: {
    key: "DAILY_PANCHANG",
    name: "Daily Panchang & Darshana",
    coins: 0,
    inrEquivalent: 0,
    description: "Daily mathematical panchang & calendar (Free)"
  },
  KUNDLI_CALCULATION: {
    key: "KUNDLI_CALCULATION",
    name: "Detailed Birth Kundli Generation",
    coins: 500,
    inrEquivalent: 50,
    description: "Complete birth chart with Rashi, Nakshatra, Pada & Planetary houses (500 Coins / ₹50)"
  },
  ASTROLOGY_QUESTION: {
    key: "ASTROLOGY_QUESTION",
    name: "Astrology Question & Consultation",
    coins: 500,
    inrEquivalent: 50,
    description: "Individual specific life / career / marriage question analysis (500 Coins / ₹50)"
  },
  SANKHYA_PRASHNA: {
    key: "SANKHYA_PRASHNA",
    name: "Sankhya Shastra Prashna Oracle",
    coins: 200,
    inrEquivalent: 20,
    description: "Vedic number horary divination with Sthira/Chara/Ubhaya & Varna influence (200 Coins / ₹20)"
  },
  KAALA_DIKSUCHI_QUESTION: {
    key: "KAALA_DIKSUCHI_QUESTION",
    name: "Kaala Diksuchi Timing Oracle",
    coins: 200,
    inrEquivalent: 20,
    description: "Kaala Diksuchi timing analysis & auspicious direction consultation (200 Coins / ₹20)"
  },
  PURVA_JANMA_QUESTION: {
    key: "PURVA_JANMA_QUESTION",
    name: "Purva Janma Karmic Reading",
    coins: 200,
    inrEquivalent: 20,
    description: "Purva Janma past life karma and remedial reading (200 Coins / ₹20)"
  },
  SANKHYA_NAME_SUGGESTION: {
    key: "SANKHYA_NAME_SUGGESTION",
    name: "Sankhya Shastra Lucky Name Suggestion",
    coins: 200,
    inrEquivalent: 20,
    description: "Chaldean/Pythagorean vibration name correction & lucky syllable selection (200 Coins / ₹20)"
  },
  SANKHYA_MOBILE_VEHICLE: {
    key: "SANKHYA_MOBILE_VEHICLE",
    name: "Lucky Mobile & Vehicle Number Suggestion",
    coins: 200,
    inrEquivalent: 20,
    description: "Lucky sum total calculation for phone numbers and vehicle registration plates (200 Coins / ₹20)"
  },
  VAHANA_MUHURTHA: {
    key: "VAHANA_MUHURTHA",
    name: "Vehicle Purchase Auspicious Days (Vahana Muhurtha)",
    coins: 500,
    inrEquivalent: 50,
    description: "Auspicious dates and timings for vehicle purchase/delivery (500 Coins / ₹50)"
  },
  AI_PRASHNA_QUESTION: {
    key: "AI_PRASHNA_QUESTION",
    name: "Prashna Shastra Oracle",
    coins: 50,
    inrEquivalent: 5,
    description: "Instant single-question horary divination (50 Coins / ₹5)"
  },
  RAMAN_BHAVISHYA: {
    key: "RAMAN_BHAVISHYA",
    name: "Raman 10-Year Life Bhavishya",
    coins: 500,
    inrEquivalent: 50,
    description: "10-year stage-by-stage AI life predictions (500 Coins / ₹50)"
  },
  STANDARD_JANANA_KUNDLI_PDF: {
    key: "STANDARD_JANANA_KUNDLI_PDF",
    name: "Baggona Panchanga Janana Kundli PDF",
    coins: 1000,
    inrEquivalent: 100,
    description: "Baggona Panchanga Janana Kundli PDF with Dasha Bhukti & Planetary Positions (1,000 Coins / ₹100)"
  },
  PREMIUM_KUNDLI_PDF: {
    key: "PREMIUM_KUNDLI_PDF",
    name: "Grand 8-Page Premium Kundli PDF Download",
    coins: 3500,
    inrEquivalent: 350,
    description: "Grand 8-Page A4 Luxury Gold Astrological Horoscope & Prediction PDF (3,500 Coins / ₹350)"
  },
  PREMIUM_PDF_DOWNLOAD: {
    key: "PREMIUM_PDF_DOWNLOAD",
    name: "Royal Multi-Page A4 PDF Booklet",
    coins: 3500,
    inrEquivalent: 350,
    description: "5-page luxury gold royal astrological chart PDF (3,500 Coins / ₹350)"
  },
  MELAPAK_MATCH: {
    key: "MELAPAK_MATCH",
    name: "Horoscope Compatibility Match",
    coins: 500,
    inrEquivalent: 50,
    description: "36-Guna deep marriage compatibility report (500 Coins / ₹50)"
  },
  SEVA_BOOKING_ASHIRVADA: {
    key: "SEVA_BOOKING_ASHIRVADA",
    name: "Seva Sankalpa & Ashirvada Pass",
    coins: 200,
    inrEquivalent: 20,
    description: "Official temple seva sankalpa & 90-day QR pass (200 Coins / ₹20)"
  }
};

export const DEFAULT_PRIEST_UPI_ID = "9108135387@ybl";
export const DEFAULT_PRIEST_MOBILE_NUMBER = "9108135387";
export const DEFAULT_PRIEST_NAME = "Shreeram Pandit";

export type AvailableModuleKey = "panchanga" | "sankhyashastra" | "diksuchi" | "purva_janma" | "vahana_muhurtha";

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

