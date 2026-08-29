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
    coins: 200,
    inrEquivalent: 20,
    description: "Complete birth chart with Rashi, Nakshatra, Pada & Planetary houses"
  },
  ASTROLOGY_QUESTION: {
    key: "ASTROLOGY_QUESTION",
    name: "Astrology Question & Consultation",
    coins: 750,
    inrEquivalent: 75,
    description: "Individual specific life / career / marriage question analysis (750 Coins / ₹75)"
  },
  SANKHYA_PRASHNA: {
    key: "SANKHYA_PRASHNA",
    name: "Sankhya Shastra Prashna Oracle",
    coins: 450,
    inrEquivalent: 45,
    description: "Vedic number horary divination with Sthira/Chara/Ubhaya & Varna influence (450 Coins / ₹45)"
  },
  SANKHYA_NAME_SUGGESTION: {
    key: "SANKHYA_NAME_SUGGESTION",
    name: "Sankhya Shastra Lucky Name Suggestion",
    coins: 2000,
    inrEquivalent: 200,
    description: "Chaldean/Pythagorean vibration name correction & lucky syllable selection"
  },
  SANKHYA_MOBILE_VEHICLE: {
    key: "SANKHYA_MOBILE_VEHICLE",
    name: "Lucky Mobile & Vehicle Number Suggestion",
    coins: 2000,
    inrEquivalent: 200,
    description: "Lucky sum total calculation for phone numbers and vehicle registration plates"
  },
  AI_PRASHNA_QUESTION: {
    key: "AI_PRASHNA_QUESTION",
    name: "Sankhya Shastra Prashna Oracle",
    coins: 450,
    inrEquivalent: 45,
    description: "Instant single-question horary divination (450 Coins / ₹45)"
  },
  RAMAN_BHAVISHYA: {
    key: "RAMAN_BHAVISHYA",
    name: "Raman 10-Year Life Bhavishya",
    coins: 500,
    inrEquivalent: 50,
    description: "10-year stage-by-stage AI life predictions"
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
    coins: 200,
    inrEquivalent: 20,
    description: "36-Guna deep marriage compatibility report"
  },
  SEVA_BOOKING_ASHIRVADA: {
    key: "SEVA_BOOKING_ASHIRVADA",
    name: "Seva Sankalpa & Ashirvada Pass",
    coins: 200,
    inrEquivalent: 20,
    description: "Official temple seva sankalpa & 90-day QR pass"
  }
};

export const DEFAULT_PRIEST_UPI_ID = "9108135387@ybl";
export const DEFAULT_PRIEST_MOBILE_NUMBER = "9108135387";
export const DEFAULT_PRIEST_NAME = "Shreeram Pandit";

